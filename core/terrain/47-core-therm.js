// ================================================================= CORE — therm: the ground's temperature between vents (KTHERM)  [G data]
// The Hearths' section 14 (2026-11-02): the geyser kit keeps per-spring ramps, and nothing gave a kit the ground's temperature
// BETWEEN vents. The Throne's vent country and Korona's active plume would read it too. Vents are records; the one field is what
// placement, the ground, the snow, the hazards and a walker all read, so they cannot disagree.
// No THREE, no DOM: plain maths, node-tested (test-therm.js). The detail is core/rand's noise: never Math.random, never a sin hash.
// Axes: y up, metres, x east, z south. Temperatures in degrees C.
//
//   const H=KTHERM.create({soil, vents, detail, world})
//     soil     the country's soil temperature: a number (10), fn (x, z), or a raster {x0, z0, cell, nx, nz, T}
//     vents    [{id, kind:'point', x, z, T, reach, decay}] or [{id, kind:'line', pts:[[x,z],...], T, reach, decay}]
//              T the ground's temperature at the vent (degrees C), reach (m) where its share reaches 0, decay (3) how fast it falls:
//              share = (exp(-decay q) - exp(-decay)) / (1 - exp(-decay)), q = distance / reach, 1 at the vent, 0 at the reach; decay 0 is a
//              straight line. A vent colder than the soil gives nothing
//     detail   {amp (1.5 degrees), scale (.02 /m), seed}: KRAND fbm, scaled by the heat present (all of it from 10 degrees over the
//              soil), so the country's soil is exact outside every reach; amp 0 turns it off
//   H.heatAt(x, z)   soil + the sum of each vent's (T - soil) * share, never past the hottest vent reaching the point; then the detail
//   H.soilAt(x, z)   the soil alone
//   H.excess(x, z)   the vents' share before the detail (m none: 0 outside every reach)
//   H.bake({box:[x0,z0,x1,z1], cell (8)}) -> F {x0, z0, cell, nx, nz, T}: a raster on nodes, as WATER.fields'. Seconds for a kit's box: bake once, read it
//   KTHERM.fieldAt(F, x, z)  bilinear, off the box the nearest edge node;  KTHERM.fieldFns(F) -> {temp}: for a host's field table
//   H.contour(t, {box, cell}) -> [{closed, pts:[[x,z],...]}]: marching squares at t degrees on a bake (the 0 degree line for snow, the
//                    25 and 60 for the discs). KTHERM.contourOf(F, t) the same on a raster already baked
//   H.snowMask({box, cell, t0 (0), soft (2)}) -> M {x0, z0, cell, nx, nz, data (Uint8Array)}: 255 where snow may lie, 0 at t0 + soft degrees and
//                    over, so the bare ground's edge follows the t0 contour. ATMOS.snowBare(M) (core/atmos/fx/89-atmos-fx-snowcover.js) takes it
//   H.export({box, cell}) -> {format:'krator-therm', version:1, soil, vents, detail}: JSON. A soil given as a function is baked over box
//   KTHERM.load(json) -> H, the same field;  KTHERM.hash(F) a fingerprint
//
// Godot: core/terrain/ktherm.gd (class_name KTherm) is the twin, held to golden-therm.json.
(function(root){
  'use strict';
  var KR=root.KRAND;
  if(!KR) throw new Error('47-core-therm: load core/rand/08-core-rand.js first');
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sm(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function share(q,k){if(q>=1)return 0;if(!(k>0))return 1-q;var e=Math.exp(-k);return (Math.exp(-k*q)-e)/(1-e);}
  function bilinear(F,A,x,z){var u=clamp((x-F.x0)/F.cell,0,F.nx-1),v=clamp((z-F.z0)/F.cell,0,F.nz-1),i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*F.nx+i;
    return (A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+F.nx]*(1-fu)+A[k+F.nx+1]*fu)*fv;}
  function segD(a,b,x,z){var dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,t=l2>0?clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
  function ventRec(v,i){if(!v||v.T==null||!(v.reach>0))throw new Error('KTHERM: vent '+i+' needs T and a reach over 0');
    var kind=v.kind==null?(v.pts?'line':'point'):v.kind,R={id:v.id==null?String(i):String(v.id),kind:kind,T:v.T,reach:v.reach,decay:v.decay==null?3:v.decay};
    if(kind==='line'){if(!v.pts||v.pts.length<2)throw new Error('KTHERM: a line vent needs two points or more');R.pts=v.pts.map(function(p){return [p[0],p[1]];});}
    else if(kind==='point'){if(v.x==null||v.z==null)throw new Error('KTHERM: a point vent needs x and z');R.x=v.x;R.z=v.z;}
    else throw new Error('KTHERM: a vent is a point or a line, not '+kind);
    var P=R.pts||[[R.x,R.z]],b=[Infinity,Infinity,-Infinity,-Infinity];P.forEach(function(p){b=[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])];});
    Object.defineProperty(R,'bb',{value:[b[0]-R.reach,b[1]-R.reach,b[2]+R.reach,b[3]+R.reach],enumerable:false});return R;}
  function ventD(v,x,z){if(v.kind==='point')return Math.hypot(x-v.x,z-v.z);var d=Infinity;for(var i=0;i+1<v.pts.length;i++)d=Math.min(d,segD(v.pts[i],v.pts[i+1],x,z));return d;}
  function nodes(o){if(!o||!o.box)throw new Error('KTHERM: box [x0, z0, x1, z1] is needed');var b=o.box,c=o.cell==null?8:o.cell;if(!(c>0))throw new Error('KTHERM: cell must be over 0');
    return {x0:b[0],z0:b[1],cell:c,nx:Math.ceil((b[2]-b[0])/c)+1,nz:Math.ceil((b[3]-b[1])/c)+1};}

  function create(o){
    if(!o||!o.vents)throw new Error('KTHERM.create: vents are needed (an empty list is the soil alone)');
    var soil=o.soil==null?10:o.soil,fn=typeof soil==='function',ras=!fn&&typeof soil==='object',vents=o.vents.map(ventRec),D=o.detail||{};
    var amp=D.amp==null?1.5:D.amp,sc=D.scale==null?.02:D.scale,sd=(D.seed==null?(o.world==null?0:o.world):D.seed)>>>0;
    function soilAt(x,z){return fn?soil(x,z):ras?bilinear(soil,soil.T,x,z):soil;}
    function sum(x,z,s){var t=0,top=-Infinity;
      for(var i=0;i<vents.length;i++){var v=vents[i],b=v.bb;if(x<b[0]||z<b[1]||x>b[2]||z>b[3])continue;
        var e=v.T-s;if(e<=0)continue;var f=share(ventD(v,x,z)/v.reach,v.decay);if(f<=0)continue;t+=e*f;if(v.T>top)top=v.T;}
      return t>0?Math.min(t,top-s):0;}
    var H={soilAt:soilAt,vents:vents,excess:function(x,z){return sum(x,z,soilAt(x,z));},
      heatAt:function(x,z){var s=soilAt(x,z),e=sum(x,z,s);if(!(e>0)||!amp)return s+e;return s+e+amp*(2*KR.fbm(x*sc,z*sc,.5,2,sd)-1)*Math.min(1,e/10);}};
    H.bake=function(p){var F=nodes(p),T=new Float64Array(F.nx*F.nz);for(var j=0,k=0;j<F.nz;j++)for(var i=0;i<F.nx;i++,k++)T[k]=H.heatAt(F.x0+i*F.cell,F.z0+j*F.cell);F.T=T;return F;};
    H.contour=function(t,p){return contourOf(H.bake(p),t);};
    H.snowMask=function(p){var F=H.bake(p),t0=p.t0==null?0:p.t0,sf=p.soft==null?2:p.soft,n=F.nx*F.nz,M=new Uint8Array(n);
      for(var k=0;k<n;k++)M[k]=Math.round(255*(1-sm(t0,t0+sf,F.T[k])));return {x0:F.x0,z0:F.z0,cell:F.cell,nx:F.nx,nz:F.nz,data:M};};
    H.export=function(p){var S=soil;
      if(fn){var F=nodes(p),T=[];for(var j=0;j<F.nz;j++)for(var i=0;i<F.nx;i++)T.push(soil(F.x0+i*F.cell,F.z0+j*F.cell));F.T=T;S=F;}
      else if(ras)S={x0:soil.x0,z0:soil.z0,cell:soil.cell,nx:soil.nx,nz:soil.nz,T:Array.prototype.slice.call(soil.T)};
      return {format:'krator-therm',version:1,soil:S,vents:JSON.parse(JSON.stringify(vents)),detail:{amp:amp,scale:sc,seed:sd}};};
    return H;}
  function load(j){if(!j||j.format!=='krator-therm')throw new Error('KTHERM.load: not a krator-therm export');return create({soil:j.soil,vents:j.vents,detail:j.detail});}

  // marching squares on the nodes (inside: T >= t), the segments chained at the lattice edges they share. An edge's key: 2*(j*nx+i) along
  // x from node (i,j), + 1 along z. A saddle takes the cell centre's side. Open lines first, then loops, each from its lowest key: the same
  // lines in every engine
  function contourOf(F,t){var nx=F.nx,nz=F.nz,T=F.T,seg=[],by=new Map();
    function pt(key){var a=key&1,k=(key-a)/2,i=k%nx,j=(k-i)/nx,b=a?k+nx:k+1,u=(t-T[k])/(T[b]-T[k]);return [F.x0+(i+(a?0:u))*F.cell,F.z0+(j+(a?u:0))*F.cell];}
    function add(e0,e1){var s=seg.length;seg.push([e0,e1]);[e0,e1].forEach(function(e){var L=by.get(e);if(L)L.push(s);else by.set(e,[s]);});}
    for(var j=0;j<nz-1;j++)for(var i=0;i<nx-1;i++){var k=j*nx+i,a=T[k]>=t,b=T[k+1]>=t,c=T[k+nx+1]>=t,d=T[k+nx]>=t,cs=(a?1:0)|(b?2:0)|(c?4:0)|(d?8:0);if(cs===0||cs===15)continue;
      var N=2*k,W=2*k+1,S=2*(k+nx),E=2*(k+1)+1;
      if(cs===5||cs===10){var mid=(T[k]+T[k+1]+T[k+nx]+T[k+nx+1])/4>=t,joinNW=(cs===5)===!mid;if(joinNW){add(N,W);add(S,E);}else{add(N,E);add(S,W);}continue;}
      var ee=[];if(a!==b)ee.push(N);if(b!==c)ee.push(E);if(c!==d)ee.push(S);if(d!==a)ee.push(W);add(ee[0],ee[1]);}
    var used=new Uint8Array(seg.length),keys=Array.from(by.keys()).sort(function(p,q){return p-q;}),out=[];
    function walk(start,closed){var e=start,pts=[pt(e)];
      for(;;){var L=by.get(e),s=-1;for(var q=0;q<L.length;q++)if(!used[L[q]]){s=L[q];break;}if(s<0)break;used[s]=1;e=seg[s][0]===e?seg[s][1]:seg[s][0];pts.push(pt(e));}
      out.push({closed:closed,pts:pts});}
    keys.forEach(function(e){if(by.get(e).length===1&&!used[by.get(e)[0]])walk(e,false);});
    keys.forEach(function(e){if(!used[by.get(e)[0]])walk(e,true);});
    return out;}
  function fieldAt(F,x,z){return bilinear(F,F.T,x,z);}
  function fieldFns(F){return {temp:function(x,z){return bilinear(F,F.T,x,z);}};}
  function hash(F){var h=KR.hash(5,F.nx,F.nz);for(var i=0;i<F.T.length;i++)h=KR.hash(h,Math.round(F.T[i]*1000));return h>>>0;}
  root.KTHERM={create:create,load:load,contourOf:contourOf,fieldAt:fieldAt,fieldFns:fieldFns,hash:hash};
})(typeof window!=='undefined'?window:globalThis);
