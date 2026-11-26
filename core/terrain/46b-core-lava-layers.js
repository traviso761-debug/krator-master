// ================================================================= CORE — lava layers: the flows a bake laid, one by one, and their beds (KLAVA.bakeLayers)  [G data]
// Godstep's "Owed in core" 1 (biomes/godstep/PLAN.md, 2026-11-03): KLAVA.bake returns the ground the eruptions added (dh) and
// which eruption froze on top (age), but not what each one left under the next, so a cliff cut through baked flows drew
// KSTRATA's own random beds. This keeps every eruption's frozen sheet, reads the stack at a point, and hands KSTRATA the
// same flows as formations, so a front's or a rille's wall shows the flows the plain was built from (and Godthrone station 2).
// Opt-in: needs 46-core-lava.js (KLAVA.create) and, for strata, 35-core-strata.js. No THREE, no DOM; test-lava-layers.js.
//
//   const B = KLAVA.bakeLayers(o)   KLAVA.bake(o)'s run and result, bit for bit (dh, age, eruptions), plus layers: [Float32Array a cell,
//                                   one an eruption, bottom up: the metres that eruption froze there]
//   KLAVA.column(B, x, z, {ground, min (.05)})  -> [{eruption, th, base, top}] bottom up at the cell nearest (x, z): the flows
//                                   thicker than min; base and top are world heights over ground(x, z) (else over 0)
//   KLAVA.strata(B, x, z, {ground, recipe ('tibasalt'), thick ({at: 4, recipe: 'tibasalt-ponded'}: a flow that thick or more
//                                   ponded, its colonnade), below ('tibasalt'), depth (200 m of it under the first flow), seed})
//                                -> KSTRATA formations bottom up: {recipe, base, top, seed}, one a flow, for KSTRATA.create({formations,
//                                   warp: [0, 0], dip: [1, 0, 0]}) (no warp and no dip, or the beds leave the flows' heights)
// Godot: the layers are plain arrays; klava.gd's bake gains the same per-eruption record when a Godot page needs it.
(function(root){
  'use strict';
  var K=root.KLAVA;
  if(!K||!K.create)throw new Error('core/terrain 46b-core-lava-layers.js: load 46-core-lava.js first (KLAVA)');
  /* KLAVA.bake's loop, line for line (46-core-lava.js), with each eruption's sheet kept: dep[k] - prev[k] */
  function bakeLayers(o){var t0=Date.now(),b=o.box,c=o.cell;if(!b||!(c>0)||typeof o.h!=='function')throw new Error('KLAVA.bakeLayers: h, box and cell');
    var nx=Math.floor((b[2]-b[0])/c+1e-9)+1,nz=Math.floor((b[3]-b[1])/c+1e-9)+1,H=new Float32Array(nx*nz),i,j,k;
    for(j=0;j<nz;j++)for(i=0;i<nx;i++)H[j*nx+i]=o.h(b[0]+i*c,b[1]+j*c);
    var s=K.create({x0:b[0],z0:b[1],step:c,nx:nx,nz:nz,heights:H,seed:o.seed,rough:o.rough==null?.3:o.rough,rheo:o.rheo,edge:o.edge,hmin:o.hmin,dtMax:o.dtMax==null?120:o.dtMax,cfl:o.cfl==null?2:o.cfl,dtMin:o.dtMin==null?2:o.dtMin});
    var age=new Uint8Array(s.N),prev=new Float64Array(s.N),out=[],layers=[],maxS=o.maxSeconds==null?2e6:o.maxSeconds;
    (o.eruptions||[]).forEach(function(e,n){var start=s.t,dur=e.duration==null?86400:e.duration,m0=s.mass(),st0=s.steps;
      var V=s.vent({x:e.x,z:e.z,r:e.r==null?c:e.r,T:e.T,name:'eruption '+n,Q:function(t){var u=t-start;return u<0||u>dur?0:typeof e.Q==='function'?e.Q(u):e.Q;}});
      var vStop=o.vStop==null?.005:o.vStop,quench=false;
      while(s.t-start<maxS){s.run(3600);if(vStop>0&&s.t-start>dur&&s.umax<vStop){s.freeze();quench=true;}
        if(s.t-start>dur&&s.molten===0){var any=false;for(k=0;k<s.N;k++)if(s.h[k]>0){any=true;break;}if(!any)break;}}
      V.Q=0;var m=s.mass(),L=new Float32Array(s.N);
      for(k=0;k<s.N;k++){if(s.dep[k]>prev[k]+1e-6)age[k]=Math.min(255,n+1);L[k]=Math.max(0,s.dep[k]-prev[k]);prev[k]=s.dep[k];}
      layers.push(L);
      out.push({volume:V.poured,frozen:m.frozen-m0.frozen,lost:m.lost-m0.lost,steps:s.steps-st0,seconds:s.t-start,done:s.molten===0,quenched:quench});});
    return {dh:Float32Array.from(s.dep),age:age,nx:nx,nz:nz,x0:b[0],z0:b[1],cell:c,eruptions:out,layers:layers,ms:Date.now()-t0};}
  function cellOf(B,x,z){if(!B||!B.layers)throw new Error('KLAVA.column: a KLAVA.bakeLayers result');
    var i=Math.max(0,Math.min(B.nx-1,Math.round((x-B.x0)/B.cell))),j=Math.max(0,Math.min(B.nz-1,Math.round((z-B.z0)/B.cell)));return j*B.nx+i;}
  function column(B,x,z,o){o=o||{};var k=cellOf(B,x,z),g=o.ground?o.ground(x,z):0,mn=o.min==null?.05:o.min,y=g,out=[];
    for(var n=0;n<B.layers.length;n++){var th=B.layers[n][k];if(th>=mn)out.push({eruption:n,th:th,base:y,top:y+th});y+=th;}
    return out;}
  function strata(B,x,z,o){o=o||{};var C=column(B,x,z,o),g=o.ground?o.ground(x,z):0,rec=o.recipe==null?'tibasalt':o.recipe,below=o.below==null?'tibasalt':o.below,
      dp=o.depth==null?200:o.depth,T=o.thick===false?null:(o.thick||{at:4,recipe:'tibasalt-ponded'}),sd=o.seed==null?1:o.seed,R=root.KRAND;
    if(!(dp>0))throw new Error('KLAVA.strata: depth must be above 0');
    var out=[{recipe:below,base:g-dp,top:C.length?C[0].base:g,seed:R?R.hash(sd,0,0x5a):sd}];
    C.forEach(function(f,i){
      /* a sliver under min sits between two flows: the formation above starts where the one below ends, so nothing is left unassigned */
      var base=i?out[out.length-1].top:f.base;out.push({recipe:T&&f.th>=T.at?T.recipe:rec,base:base,top:f.top,seed:R?R.hash(sd,f.eruption+1,0x5a):sd+f.eruption+1,eruption:f.eruption});});
    return out;}
  K.bakeLayers=bakeLayers;K.column=column;K.strata=strata;
})(typeof window!=='undefined'?window:globalThis);
