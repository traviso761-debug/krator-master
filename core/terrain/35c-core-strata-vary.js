// ================================================================= CORE — strata: contacts that vary from place to place  [G data]
// core/README.md listed it as not done: a formation whose base height varies (a loess mantle draped over older ground, Mid Basin's
// interbedded loess and tuff, the W outer wall's loess). KSTRATA's formations are flat slabs of stratigraphic height (yy); this
// moves their CONTACTS by an offset that is a function of (x, z) and remaps yy piecewise linearly between the moved contacts, so
// every bed keeps its place in its formation and thins or thickens with it. Where moved contacts cross, the higher-numbered one
// wins: a contact pushed up past the next pinches the formation between them out. Plain maths of (x, y, z), as 35-core-strata.js: no THREE, no DOM, no Math.random, no sin or exp
// (only + - * / floor sqrt), the noise from the stack's own table, so kstrata_vary.gd gives the same rock at the same point.
// Opt-in: needs 35-core-strata.js (and core/rand) loaded first; it changes nothing there. node core/terrain/test-strata-vary.js.
//
//   const V = KSTRATA.vary(S, {contacts:[{at, by}]})     S a KSTRATA stack (create or load)
//     at   the formation whose BASE moves (1..n-1: an inner contact; 0 the stack's base; n its top)
//     by   the offset in metres of stratigraphic height, the sum of any of (all plain data):
//            d: m                                      a constant
//            plane: [mx, mz], from:[x,z]               m per m east and south, 0 at `from` ([0,0])
//            noise: {amp, wl, ch (2)}                  amp * (2*noise - 1) on the stack's table (channel ch), at wavelength wl m
//            pts: [[x, z, d], ...], r                  bumps of d falling to 0 at r ((1 - (q/r)^2)^2), normalised where they overlap
//            grid: {x0, z0, step, nx, nz, data:[...]}  bilinear over a grid (row j, column i: data[j*nx+i]); clamped at its edges
//   KSTRATA.drape(S, at, ground, {box:[x0,z0,x1,z1], step, th, min})   a contact's `by` as a grid: formation `at`'s base laid th
//            metres (a number or (x,z) => m) under the ground, so a mantle follows the land it fell on; `min` keeps it at least that
//            far above the formation's own base (no inversion past the one below)
//   V.yy(x, y, z)       the stratigraphic height, remapped: what the beds are read at
//   V.at(x, y, z, o)    S.at at the remapped height (the same record: formation, bed, kind, colour, hard...; o.varied: the shift)
//   V.surface, V.hardnessAt, V.terrace, V.ledge   as S's, at the remapped height
//   V.contact(x, z, k)  the WORLD height of contact k at (x, z) (where formation k's base lies)
//   V.thickness(x, z, k)   formation k's thickness there (0 where it pinches out)
//   V.export() / KSTRATA.loadVaried(json)   {format:'krator-strata-vary', version:1, stack (S.export()), contacts}; loadVaried
//            gives the same answers bit for bit
//   Not varied: a lateral stack's own formations (it reads the remapped yy), the alteration lines (they read the shifted world
//   height, so they move with the column: keep alterations off a varied stack, or below its lowest moved contact), and the
//   shaders' bake (BIO.strata, strata.gdshaderinc: they draw the flat column; a page reads V.surface on the CPU).
(function(root){
  'use strict';
  var KS=root.KSTRATA;if(!KS||!KS.create)throw new Error('core/terrain 35c-core-strata-vary.js: load 35-core-strata.js first (KSTRATA)');
  if(KS.vary)return;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function offset(S,by,x,z){var v=0;if(!by)return 0;
    if(by.d!=null)v+=by.d;
    if(by.plane){var f=by.from||[0,0];v+=by.plane[0]*(x-f[0])+by.plane[1]*(z-f[1]);}
    if(by.noise){var N=by.noise;v+=N.amp*(2*KS.noise(S.table,N.ch==null?2:N.ch,x/N.wl,z/N.wl)-1);}
    if(by.pts){var r=by.r,sw=0,sd=0;for(var i=0;i<by.pts.length;i++){var p=by.pts[i],dx=x-p[0],dz=z-p[1],q=(dx*dx+dz*dz)/(r*r);if(q<1){var w=(1-q)*(1-q);sw+=w;sd+=w*p[2];}}
      if(sw>0)v+=sd/(sw>1?sw:1);}
    if(by.grid){var G=by.grid,fx=clamp((x-G.x0)/G.step,0,G.nx-1),fz=clamp((z-G.z0)/G.step,0,G.nz-1),i0=Math.floor(fx),j0=Math.floor(fz),i1=Math.min(i0+1,G.nx-1),j1=Math.min(j0+1,G.nz-1),tx=fx-i0,tz=fz-j0,D=G.data;
      var a=D[j0*G.nx+i0],b=D[j0*G.nx+i1],c=D[j1*G.nx+i0],e=D[j1*G.nx+i1];v+=a+(b-a)*tx+(c-a)*tz+(a-b-c+e)*tx*tz;}
    return v;}
  function check(S,C){var n=S.formations.length;(C||[]).forEach(function(c,i){if(c==null||!(c.at>=0&&c.at<=n)||Math.floor(c.at)!==c.at)throw new Error('KSTRATA.vary: contact '+i+' needs at, 0..'+n);
    var by=c.by||{};if(by.noise&&!(by.noise.wl>0))throw new Error('KSTRATA.vary: a noise term needs wl > 0');if(by.pts&&!(by.r>0))throw new Error('KSTRATA.vary: pts need r > 0');
    if(by.grid){var G=by.grid;if(!(G.step>0)||!(G.nx>=1)||!(G.nz>=1)||!G.data||G.data.length!==G.nx*G.nz)throw new Error('KSTRATA.vary: a grid needs step, nx, nz and nx*nz data');}});}
  function make(S,C,o){C=JSON.parse(JSON.stringify(C||[]));check(S,C);
    var fs=S.formations,n=fs.length,B=[];for(var k=0;k<n;k++)B.push(fs[k].base);B.push(fs[n-1].top);
    var byK={};C.forEach(function(c){(byK[c.at]=byK[c.at]||[]).push(c.by);});
    var ks=Object.keys(byK).map(Number).sort(function(a,b){return a-b;});
    // the moved contacts at (x,z), ascending: where two cross the higher-numbered one wins, so a contact pushed up past the next
    // pinches the formation between them out, and one pushed down past the one below cuts that one down with it
    function moved(x,z){var M=B.slice();for(var q=0;q<ks.length;q++){var k=ks[q],L=byK[k],s=0;for(var i=0;i<L.length;i++)s+=offset(S,L[i],x,z);M[k]+=s;}
      for(var j=n;j>0;j--)if(M[j-1]>M[j])M[j-1]=M[j];return M;}
    function remap(x,z,v){var M=moved(x,z);if(v<M[0])return v+(B[0]-M[0]);if(v>=M[n])return v+(B[n]-M[n]);
      var lo=0,hi=n-1;while(lo<hi){var mid=(lo+hi+1)>>1;if(M[mid]<=v)lo=mid;else hi=mid-1;}
      while(lo<n-1&&M[lo+1]<=v)lo++;var span=M[lo+1]-M[lo];return span>0?B[lo]+(v-M[lo])*(B[lo+1]-B[lo])/span:B[lo];}
    function shift(x,y,z){var v=S.yy(x,y,z);return remap(x,z,v)-v;}
    var V={format:'krator-strata-vary',varied:true,stack:S,contacts:C,formations:fs,kinds:S.kinds,table:S.table,seed:S.seed,range:S.range,
      yy:function(x,y,z){return remap(x,z,S.yy(x,y,z));},
      at:function(x,y,z,o2){var d=shift(x,y,z);o2=S.at(x,y+d,z,o2);o2.varied=d;return o2;},
      hardnessAt:function(x,y,z){return V.at(x,y,z).hard;},
      surface:function(x,y,z,ny,o2){var d=shift(x,y,z);o2=S.surface(x,y+d,z,ny,o2);o2.varied=d;return o2;},
      terrace:function(x,z,h,k){var d=shift(x,h,z);return S.terrace(x,z,h+d,k)-d;},
      ledge:function(x,z,h,slope,lo){var d=shift(x,h,z);return S.ledge(x,z,h+d,slope,lo)-d;},
      contact:function(x,z,k){return moved(x,z)[k]-S.yy(x,0,z);},
      thickness:function(x,z,k){var M=moved(x,z);return M[k+1]-M[k];},
      export:function(){return {format:'krator-strata-vary',version:1,stack:S.export(),contacts:JSON.parse(JSON.stringify(C))};}};
    return V;}
  KS.vary=function(S,o){if(!S||!S.yy||!S.formations)throw new Error('KSTRATA.vary: a KSTRATA stack is needed');return make(S,(o||{}).contacts,o);};
  KS.loadVaried=function(J){if(!J||J.format!=='krator-strata-vary')throw new Error('KSTRATA.loadVaried: not a krator-strata-vary record');return make(KS.load(J.stack),J.contacts);};
  KS.drape=function(S,at,ground,o){o=o||{};var box=o.box,st=o.step==null?16:o.step;if(!box||!(st>0))throw new Error('KSTRATA.drape: box and a step over 0 are needed');
    if(!(at>=0&&at<S.formations.length))throw new Error('KSTRATA.drape: at must name a formation');
    var nx=Math.max(1,Math.floor((box[2]-box[0])/st)+1),nz=Math.max(1,Math.floor((box[3]-box[1])/st)+1),data=new Array(nx*nz),base=S.formations[at].base,below=at>0?S.formations[at-1].base:-Infinity,mn=o.min==null?0:o.min,th=o.th==null?0:o.th;
    for(var j=0;j<nz;j++)for(var i=0;i<nx;i++){var x=box[0]+i*st,z=box[1]+j*st,t=typeof th==='function'?th(x,z):th,w=S.yy(x,0,z),yyBase=ground(x,z)-t+w;
      data[j*nx+i]=Math.max(yyBase,below+mn)-base;}
    return {grid:{x0:box[0],z0:box[1],step:st,nx:nx,nz:nz,data:data}};};
})(typeof window!=='undefined'?window:globalThis);
