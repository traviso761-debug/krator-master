// ================================================================= CORE HOST — the probe's seat sweeps: contact, clearance, doors, stairs
// [web] core/host/95b-host-seat.js (CORE-IMPROVEMENTS.md items 1 and 20). Opt-in: a build lists it beside 95-host-probe.js
// (and core/terrain's 38a-core-seat.js, which does the measuring), so no page moves until it does. It turns the page's DRAWN
// scene into a KSEAT surface and puts the sweeps on the probe, in place of the per-build checks (Yuni's box tests, the
// catalog's ANCHOR_AUDIT, Ringsea's sails-clear-cabins, Pinnacle Rock's ROCKRAY, the lighthouse's float probe):
//
//   _api.contactSweep(o?)   every record carrying a foot ({r | w,d, tol, reach, clear}) against the drawn ground and rock:
//                           KSEAT.contactSweep -> {n, ok, fails, by:{float, buried, inside, off}, worst, neg}. An item set's
//                           record carrying a foot is checked by its instances (KTAGS.page.instance; o.sample, 4000, the most
//                           taken from one set). Pass when fails is empty and neg is true (the control: a record lifted 2 m
//                           read as floating)
//   _api.clearSweep(o?)     the records' boxes, classes apart (o.pairs [['building','street'], ...]): KSEAT.clearSweep
//   _api.doorSweep(o?)      the doors (o.doors(), else the build's take.seat.doors(), else records of kind or class 'door':
//                           at, ry, size [w, depth, h]) against every solid drawn mesh: KSEAT.doorSweep
//   _api.stairSweep(o?)     the stairs (o.stairs(), take.seat.stairs(), else records carrying head and foot): KSEAT.stairSweep
//   _api.seatSweeps(o?)     all four, each {n, ok, fails: the first 12}: the line a verify prints
//   KHOST.seatScene(o?)     the drawn scene as a KSEAT surface (cached; o.fresh rebuilds): o.which 'seat' (default) or 'solid'
//
// What counts as drawn, by the meshes' userData (a build sets them where it draws):
//   seat  (true or a class: 'ground', 'rock')  a surface things stand on: the contact sweep reads only these. With none set,
//         the contact sweep reports error 'no seat surfaces' and fails, never passes by seeing nothing
//   solid (true)  an instanced mesh that blocks a door or a stair (instanced meshes are left out otherwise: flora cards)
//   door, seatSkip  left out of every sweep (a door's own leaf); probeSkip leaves a mesh out of the solid set unless it is
//         marked seat (a ground mesh is usually probeSkip: it is still the ground)
// Every non-instanced, opaque, visible mesh is solid for the door and stair sweeps. The build's own: take({seat:{records,
// doors, stairs, surfaces, solid}}) (functions); records default to KHOST.records (93) or KTAGS.page's.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{};
if(!K.probeTake)throw new Error('95b-host-seat: load core/host/95-host-probe.js first');
const take0=K.probeTake;
K.probeTake=function(H){take0(H);
 const S=root.KSEAT;if(!S)throw new Error('95b-host-seat: load core/terrain/38a-core-seat.js (CORE_TERRAIN)');
 const o=H.o,THREE=o.THREE||root.THREE,scene=H.scene,SO=o.seat||{},cache={};
 function posOf(a){if(!a.isInterleavedBufferAttribute)return a.array;const n=a.count,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=a.getX(i);p[i*3+1]=a.getY(i);p[i*3+2]=a.getZ(i);}return p;}
 function boxArr(b){return [b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z];}
 const left=u=>u&&(u.seatSkip||u.door);
 function opaque(ob){const m=Array.isArray(ob.material)?ob.material[0]:ob.material;return !m||!m.transparent;}
 /* a seat surface counts even when it is left out of the probe's samples (a ground mesh carries probeSkip) */
 function pick(ob,which){const u=ob.userData||{};if(u.seatSkip||u.door||ob.visible===false)return false;
  if(u.seat)return true;if(which==='seat'||u.probeSkip)return false;
  return ob.isInstancedMesh?!!u.solid:opaque(ob);}
 function sceneSurface(oo){oo=oo||{};const which=oo.which||'seat';if(cache[which]&&!oo.fresh)return cache[which];
  const items=[],own=which==='seat'?SO.surfaces:SO.solid,objs=[];
  if(own)own().forEach(ob=>ob.traverse(c=>{if(c.isMesh&&!left(c.userData))objs.push(c);}));
  else scene.traverse(ob=>{if(ob.isMesh&&pick(ob,which))objs.push(ob);});
  /* a mesh hidden by a hidden parent is not drawn */
  const shown=ob=>{for(let p=ob;p;p=p.parent)if(p.visible===false)return false;return true;};
  objs.filter(shown).forEach(ob=>{const g=ob.geometry,P=g&&g.attributes&&g.attributes.position;if(!P)return;
   ob.updateMatrixWorld(true);if(!g.boundingBox)g.computeBoundingBox();
   const u=ob.userData||{},cls=typeof u.seat==='string'?u.seat:(u.cls||null),id=u.seatId||ob.name||ob.uuid,I=g.index?g.index.array:null;
   if(ob.isInstancedMesh){const m=new THREE.Matrix4();
    for(let i=0;i<ob.count;i++){ob.getMatrixAt(i,m);const w=new THREE.Matrix4().multiplyMatrices(ob.matrixWorld,m),E=w.elements.slice();
     items.push({id:id+'#'+i,cls,box:boxArr(g.boundingBox.clone().applyMatrix4(w)),make:()=>S.tris(posOf(P),I,{matrix:E,id:id+'#'+i,cls})});}}
   else{const E=ob.matrixWorld.elements.slice();items.push({id,cls,box:boxArr(g.boundingBox.clone().applyMatrix4(ob.matrixWorld)),make:()=>S.tris(posOf(P),I,{matrix:E,id,cls})});}});
  const L=S.lazy(items);L.count=items.length;return cache[which]=L;}
 K.seatScene=sceneSurface;
 function records(){const r=SO.records?SO.records():K.records?K.records():(root.KTAGS&&root.KTAGS.page?root.KTAGS.page.records:[]);return (r||[]).filter(x=>x&&!x.removed);}
 // a set's record with a foot: its instances, each with the set's foot (evenly sampled up to oo.sample)
 function feet(oo){const out=[],T=root.KTAGS&&root.KTAGS.page,cap=oo.sample==null?4000:oo.sample;
  records().forEach(r=>{if(!r.foot&&!oo.all)return;
   if(r.set&&T&&T.instance){const n=r.count|0,st=Math.max(1,Math.ceil(n/cap));for(let i=0;i<n;i+=st){const q=T.instance(r,i);if(q)out.push(Object.assign({},q,{foot:q.foot||r.foot}));}}
   else out.push(r);});
  return out;}
 function contactSweep(oo){oo=oo||{};const Sf=sceneSurface({which:'seat',fresh:oo.fresh});
  if(!Sf.count)return {n:0,ok:0,fails:[],by:{},worst:{},neg:null,error:'no seat surfaces: set userData.seat on the ground and rock meshes (or take.seat.surfaces)'};
  return S.contactSweep(Sf,feet(oo),oo);}
 function clearSweep(oo){return S.clearSweep(records(),oo||{});}
 const doorOf=r=>{const z=r.size||[];return {id:r.id,at:r.at||[r.x,r.y,r.z],ry:r.ry,w:r.w==null?z[0]:r.w,h:r.h==null?z[2]:r.h,depth:r.depth==null?z[1]:r.depth,reach:r.reach};};
 function doorSweep(oo){oo=oo||{};const D=oo.doors?oo.doors():SO.doors?SO.doors():records().filter(r=>r.kind==='door'||r['class']==='door').map(doorOf);
  return S.doorSweep(sceneSurface({which:'solid',fresh:oo.fresh}),D,oo);}
 function stairSweep(oo){oo=oo||{};const T=oo.stairs?oo.stairs():SO.stairs?SO.stairs():records().filter(r=>r.head&&r.foot);
  return S.stairSweep(sceneSurface({which:'solid',fresh:oo.fresh}),T,oo);}
 function seatSweeps(oo){oo=oo||{};const cut=x=>Object.assign({},x,{fails:(x.fails||[]).slice(0,12),nFails:(x.fails||[]).length});
  return {contact:cut(contactSweep(oo)),clear:cut(clearSweep(oo)),doors:cut(doorSweep(oo)),stairs:cut(stairSweep(oo))};}
 Object.assign(K.probe,{seatScene:sceneSurface,contactSweep,clearSweep,doorSweep,stairSweep,seatSweeps});
 /* the build's own api (o.api) wins where it named the same */
 const api=root._api;['contactSweep','clearSweep','doorSweep','stairSweep','seatSweeps'].forEach(k=>{if(!Object.prototype.hasOwnProperty.call(api,k))api[k]=K.probe[k];});};
})(typeof window!=='undefined'?window:globalThis);
