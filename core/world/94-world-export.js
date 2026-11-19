// ================================================================= OPEN WORLD — the region through core/export (GODOT-PLAN.md section 8, M7)
// [web] Opt-in: a region build lists it after core/export (07, 09, 10) when the region is a Godot case
// (openworld/oidong-highrift since 2026-11-16, the owner: "set up oidong/high rift/strongbow as a godot test"). It draws
// nothing and changes nothing the page shows. At export time it fills, for the export's box:
//   registry   the region's records as one page registry (KTAGS.page, which core/export 09's registry adapter crops to the
//              box): the registries the region's parts made (88s the sites, 88b the bridges), each record's id (and its
//              parent's) prefixed by its part ('sites:', 'bridges:'), since each part counts its ids from its own start
//   terrain    EXPORT.terrain over the box: WORLD.H (the ground the page draws: the region's heights with the rivers' and the
//              roads' carving) and WORLD.water (a surface's level, -1e9 where there is none; left out when WORLD_EXPORT.water
//              is false: a streamed chunk's ground, whose water the water section carries), on a grid WORLD_EXPORT.step
//              apart (32 m unless the export's --before step sets it), with its probes
//   items, buckets, materials, textures   EXPORT.sceneReader over the scene in the box: the villages' pieces, the bridges,
//              the flora drawn round the camera (its instances); the terrain (userData.terrain), the water surfaces and
//              the sky (userData.probeSkip: the terrain and water sections carry them) and the resource beacons (map
//              markers) are left out. The flora is drawn only within reach of the camera, so a case places the camera at
//              the box and settles the page first (openworld/<region>/tools/godot_case.py, harness.py export --before)
// A floating origin: the meshes stand at world coordinates on the page, but a region is 1,300 km across and a float32 600 km
// out keeps 6 cm. So a case's glb is written about its own origin (the flora's floating origin where it is drawn near the
// box, else the box's centre in whole metres; or WORLD_EXPORT.origin [x, y, z]; false for the page's frame): sceneReader takes it off the world matrices in double precision before the
// float32 pack, and world.json says `origin` (core/export README, "origin"). Everything else in world.json (the box, the
// terrain's grid, the records' positions, the owners) stays in the region's metres, as the plan's; an importer puts the
// case's node at origin less its own (godot/krator/world_import.gd, world_stream.gd).
var WORLD_EXPORT=window.WORLD_EXPORT||{};
(function(){'use strict';
if(typeof EXPORT==='undefined'||typeof KTAGS==='undefined')return;
const E=EXPORT,REGION=(typeof SITE_SPEC!=='undefined'&&SITE_SPEC.region)||(WORLD_DATA.meta&&WORLD_DATA.meta.region)||'region';
/* ---------------------------------------------------------------- the registry: the parts' registries as one */
/* the parts make theirs late (LATE, 98-world-start), after this fragment has run: every registry made from here on is
   kept, and the page registry reads the region's (a build named '<region>:<part>') */
const REGS=[],make=KTAGS.create;
KTAGS.create=function(o){const T=make.apply(KTAGS,arguments);REGS.push(T);return T;};
const parts=()=>REGS.filter(T=>String(T.build||'').indexOf(REGION+':')===0);
const partOf=T=>String(T.build).slice(REGION.length+1);
const pre=(p,id)=>id==null?id:p+':'+id;
const PAGE={build:REGION,
 get records(){const out=[];parts().forEach(T=>T.records.forEach(r=>out.push(r)));return out;},
 export(opt){const P=parts();if(!P.length)return{format:'krator-tags',version:1,build:REGION,records:[]};
  const first=P[0].export(opt),recs=[];
  P.forEach(T=>{const p=partOf(T),e=T===P[0]?first:T.export(opt);
   e.records.forEach(r=>{const o={};for(const k in r)o[k]=r[k];o.id=pre(p,r.id);if(r.parent!=null)o.parent=pre(p,r.parent);o.part=p;recs.push(o);});});
  return{format:first.format,version:first.version,build:REGION,convention:first.convention,vocab:first.vocab,records:recs,
   parts:P.map(T=>({part:partOf(T),build:T.build,records:T.records.length})),
   note:'the region\'s parts\' registries as one (core/world/94-world-export.js): an id is <part>:<the part\'s own id>'};},
 audit(){const a={records:0,unknown:0};parts().forEach(T=>{const x=T.audit();a.records+=x.records||0;a.unknown+=x.unknown||0;});return a;},
 /* a prefixed id resolved in its part (EXPORT.sceneReader asks get(id).uid of a bucket's records and isSet of an item's set) */
 part(id){const s=String(id),k=s.indexOf(':');if(k<0)return null;const p=s.slice(0,k),T=parts().find(t=>partOf(t)===p);return T?{T,p,id:s.slice(k+1)}:null;},
 get(id){const q=PAGE.part(id);if(!q)return null;const r=q.T.get(q.id);if(!r)return null;const o={};for(const k in r)o[k]=r[k];o.id=pre(q.p,r.id);if(r.parent!=null)o.parent=pre(q.p,r.parent);return o;},
 isSet(id){const q=PAGE.part(id);return!!(q&&q.T.isSet&&q.T.isSet(q.id));},
 uidOf(s,i){const q=PAGE.part(typeof s==='string'?s:s.id);return q?q.T.uidOf(q.id,i):null;}};
KTAGS.page=PAGE;
/* the owner of a mesh's triangle or instance: the smallest site record whose footprint holds it (the villages' buildings,
   tents, pens; their size [w, d] turned by ry) */
function owners(box){const vols=[];
 parts().forEach(T=>{const p=partOf(T);T.records.forEach(r=>{if(r.removed||!r.at||!r.size||r.set)return;const h=Math.max(r.size[0],r.size[1])/2+4;
  if(r.at[0]+h<box[0]||r.at[0]-h>box[2]||r.at[2]+h<box[1]||r.at[2]-h>box[3])return;
  vols.push({id:pre(p,r.id),x:r.at[0],z:r.at[2],c:Math.cos(-(r.ry||0)),s:Math.sin(-(r.ry||0)),hw:r.size[0]/2+1,hd:r.size[1]/2+1,a:r.size[0]*r.size[1]});});});
 return(x,y,z)=>{let best=null;for(const v of vols){const dx=x-v.x,dz=z-v.z,u=dx*v.c-dz*v.s,w=dx*v.s+dz*v.c;
  if(Math.abs(u)<=v.hw&&Math.abs(w)<=v.hd&&(!best||v.a<best.a))best=v;}return best?best.id:null;};}
/* ---------------------------------------------------------------- the scene, in the box */
const up=(m,f)=>{for(let p=m;p;p=p.parent)if(f(p))return true;return false;};
const hidden=m=>up(m,p=>p.visible===false);
const beacon=m=>up(m,p=>/^resource beacon/.test(p.name||''));
/* a bridge's pieces (88b: a group named 'bridge <key>') stand in its record, found by its key */
function byKey(){const M=new Map();parts().forEach(T=>{const p=partOf(T);T.records.forEach(r=>{if(r.key!=null&&!r.removed)M.set(String(r.key),pre(p,r.id));});});return M;}
function origin_(ctx){const o=WORLD_EXPORT.origin;let O=null;
 if(Array.isArray(o))O=[+o[0],o[1]==null?0:+o[1],+o[2]];
 else if(o!==false&&ctx.box){
  /* the flora's own floating origin (85: its pools' meshes stand there, the rows less it in float32) when it is drawn
     near the box: a plant's translation is then its row bit for bit, and the reader's sum (row + origin, in doubles) the
     page's own position, so its uid reproduces exactly. Else (a chunk: no items) the box's centre in whole metres */
  const cx=(ctx.box[0]+ctx.box[2])/2,cz=(ctx.box[1]+ctx.box[3])/2,span=Math.max(ctx.box[2]-ctx.box[0],ctx.box[3]-ctx.box[1]);
  let F=null;if(ctx.sections.indexOf('items')>=0&&typeof FLORA!=='undefined'&&FLORA&&FLORA.pools)for(const p of FLORA.pools.values())if(p.n&&p.meshes.length){F=p.meshes[0].position;break;}
  O=F&&Math.hypot(F.x-cx,F.z-cz)<span*2?[F.x,F.y,F.z]:[Math.round(cx),0,Math.round(cz)];}
 if(O)ctx.out.origin=O;return O;}
/* ---------------------------------------------------------------- the flora as item sets */
/* 85's pools (one per prototype, kit|species|variant|level, its parts sharing one instance table) are drawn round the
   camera and rebuilt as it moves, so they are registered when an export reads them, not when drawn: a pool is one
   core/tags item set (class flora, the species' key, name and tags) in the region's 'flora' part, its rows the pool's
   rows, read live; an instance's position is the pool's mesh position (85's floating origin, a double) plus its row, and
   its uid KTAGS.uid('flora', key, that position), as the biome kits' plants have theirs (core/biome 20). A plant's parts
   (trunk, crown) share its uid. A set stays registered once made (its count follows the pool) */
let FREG=null;const FSETS=new Map();
const BIO_SWAY={'1.0':[1,[0,0,0]],'1':[1,[0,0,0]],'0.0':[0,[0,0,0]],'0':[0,[0,0,0]],'(-position.y)':[0,[0,-1,0]],'(position.y)':[0,[0,1,0]],
 '(position.x)':[0,[1,0,0]],'(-position.x)':[0,[-1,0,0]],'(position.z)':[0,[0,0,1]],'(-position.z)':[0,[0,-1,0]]};
function plainBio(v,d){const dp=d==null?0:d;if(v==null||dp>4)return null;const t=typeof v;
 if(t==='number'||t==='string'||t==='boolean')return v;if(t==='function')return undefined;
 if(v.isColor)return'#'+v.getHexString();if(Array.isArray(v))return v.map(x=>plainBio(x,dp+1));
 if(t==='object'&&Object.getPrototypeOf(v)===Object.prototype){const o={};for(const k in v){const x=plainBio(v[k],dp+1);if(x!==undefined)o[k]=x;}return o;}
 return undefined;}
function swayBio(o){if(!o||!('swayW' in o||'swayA' in o))return null;const e=String(o.swayW==null?'1.0':o.swayW).replace(/\s/g,''),k=BIO_SWAY[e],a=o.swayA==null?.06:+o.swayA,ax=o.axis==null?0:o.axis|0;
 return k?{c:k[0],w:k[1],a,axis:ax}:{text:e,a,axis:ax};}
/* Ensure multi-view or wide-box places keep 3D flora around anchors and promote ShaderMaterial impostors to real mid meshes */
function prepareFloraBox(box){if(!box||typeof FLORA==='undefined'||!FLORA||!FLORA.pools||typeof NURSERY==='undefined'||!NURSERY)return;
 const anchors=Array.isArray(WORLD_EXPORT.floraAnchors)&&WORLD_EXPORT.floraAnchors.length?WORLD_EXPORT.floraAnchors:null;
 if(HOST&&HOST.scene)for(const m of HOST.scene.children)if(m&&m.userData&&m.userData.inspectLabel==='floor'){
  if(m.position.x<=box[2]+128&&m.position.x+128>=box[0]&&m.position.z<=box[3]+128&&m.position.z+128>=box[1])m.visible=true;}
 let hasImp=false;for(const p of FLORA.pools.values())if(p.n>0&&p.proto&&p.proto.impostor){hasImp=true;break;}
 if(!anchors&&!hasImp)return;
 const cx=(box[0]+box[2])/2,cz=(box[1]+box[3])/2;FLORA.residency({x:cx,z:cz},8000);
 const A=anchors||[[HOST.camera.position.x,HOST.camera.position.z]];
 const ox=Math.round(cx/1024)*1024,oz=Math.round(cz/1024)*1024,ORG=new THREE.Vector3(ox,0,oz);
 const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3(),_Y=new THREE.Vector3(0,1,0);
 const getPool=(key,proto)=>{let p=FLORA.pools.get(key);if(!p){p={key,proto,n:0,cap:0,arr:null,attr:null,meshes:[]};FLORA.pools.set(key,p);}return p;};
 const ensureCap=(p,need)=>{if(need<=p.cap)return;let cap=Math.max(16,p.cap);while(cap<need)cap*=2;
  for(const m of p.meshes){HOST.scene.remove(m);if(m.dispose)m.dispose();}p.meshes=[];
  const old=p.arr;p.arr=new Float32Array(cap*16);if(old)p.arr.set(old);
  p.attr=new THREE.InstancedBufferAttribute(p.arr,16);p.cap=cap;
  const white=new THREE.InstancedBufferAttribute(new Float32Array(cap*3).fill(1),3);
  for(const part of p.proto.parts){const m=new THREE.InstancedMesh(part.geo,part.mat,cap);
   m.instanceMatrix=p.attr;m.instanceColor=white;m.frustumCulled=false;m.count=0;m.userData.flora=p.key;m.userData.inspectLabel='flora';HOST.scene.add(m);p.meshes.push(m);}};
 /* Pre-queue and drain needed Hero (lv=2) & Mid (lv=1) 3D prototypes so NURSERY has every variant ready before filling pools */
 const lim=(a,ht)=>Math.min(a[2],Math.max(a[1],a[0]*ht));
 const picked=[];
 for(const t of FLORA.tiles.values())for(const r of t.recs){
  if(r.x<box[0]-32||r.x>box[2]+32||r.z<box[1]-32||r.z>box[3]+32)continue;
  let d=1e9;for(const a of A){const dd=Math.hypot(r.x-a[0],r.z-a[1]);if(dd<d)d=dd;}
  const L=FLORA.KITS[r.k].lod;let lv=-1;
  const sapLim=anchors?Math.max(L.sapling?L.sapling[1]:0,280):(L.sapling?L.sapling[1]:0);
  const heroLim=anchors?Math.min(220,lim(L.hero,r.Ht)):lim(L.hero,r.Ht);
  const midLim=anchors?Math.max(920,lim(L.mid,r.Ht)):lim(L.mid,r.Ht);
  const farLim=anchors?Math.max(2600,lim(L.far,r.Ht)):lim(L.far,r.Ht);
  if(r.sap)lv=d<sapLim?2:-1;
  else if(d<heroLim)lv=2;
  else if(d<midLim)lv=1;
  else if((r.far||r.Ht>=14)&&d<farLim)lv=1;
  if(lv<0)continue;
  const key=r.k+'|'+r.sp+'|'+r.v+'|'+(r.sap?'s':lv);
  NURSERY.get(key,{kit:FLORA.KITS[r.k].name,sp:r.sp,v:r.v,lv:r.sap?2:lv,sapling:r.sap},d);
  picked.push([r,lv,d,key]);}
 for(let guard=0;guard<8&&NURSERY.queued&&NURSERY.queued()>0&&NURSERY.update;guard++)NURSERY.update(8000);
 for(const p of FLORA.pools.values())p.n=0;
 for(let idx=0;idx<picked.length;idx++){const r=picked[idx][0],lv=picked[idx][1],d=picked[idx][2];let key=picked[idx][3];
  let proto=NURSERY.protos.get(key)||NURSERY.get(key,{kit:FLORA.KITS[r.k].name,sp:r.sp,v:r.v,lv:r.sap?2:lv,sapling:r.sap},d);
  if((!proto||proto.impostor)&&!r.sap){for(const alt of [1,2]){const k2=r.k+'|'+r.sp+'|'+r.v+'|'+alt,p2=NURSERY.protos.get(k2);if(p2&&!p2.impostor&&!p2.none&&p2.parts&&p2.parts.length){key=k2;proto=p2;break;}}}
  if(!proto||proto.impostor||proto.none||!proto.parts||!proto.parts.length)continue;
  const p=getPool(key,proto);ensureCap(p,p.n+1);
  const sc=r.Ht/(proto.H==null?r.Ht:proto.H);_q.setFromAxisAngle(_Y,r.rot);_p.set(r.x-ORG.x,r.y,r.z-ORG.z);_s.set(sc,sc,sc);_m.compose(_p,_q,_s);
  _m.toArray(p.arr,p.n*16);p.n++;}
 for(const p of FLORA.pools.values()){for(const m of p.meshes){m.count=p.n;m.visible=p.n>0;m.position.copy(ORG);m.updateMatrix();m.updateMatrixWorld(true);}
  if(p.attr)p.attr.needsUpdate=true;}}
/* Grow all Hero (lv=2), Mid (lv=1), and Sapling ('s') 3D species variants in NURSERY and stage 1 unit instance per prototype
   at [0, 0, 0] so `flora/` exports a compact shared prototype library for Godot's dual-LOD StreamFlora */
function prepareFloraLib(){if(typeof FLORA==='undefined'||!FLORA||typeof NURSERY==='undefined'||!NURSERY)return{protos:[]};
 const want=[];
 for(let ki=0;ki<FLORA.KITS.length;ki++){const K=FLORA.KITS[ki];if(!K.SP||!K.SP.length)continue;
  const hasSap=K.passes.some(P=>P.sapling),tags=hasSap?['2','1','s']:['2','1'];
  for(let sp=0;sp<K.SP.length;sp++)for(let v=0;v<4;v++)for(const tag of tags){
   const key=ki+'|'+sp+'|'+v+'|'+tag,sap=tag==='s',lv=sap?2:+tag;
   NURSERY.get(key,{kit:K.name,sp,v,lv,sapling:sap},0);want.push({key,ki,kit:K.name,sp,v,tag,sap,lv});}}
 for(let guard=0;guard<24&&NURSERY.queued&&NURSERY.queued()>0&&NURSERY.update;guard++)NURSERY.update(10000);
 WORLD_EXPORT.origin=[0,0,0];WORLD_EXPORT.floraLibOnly=true;
 const ORG=new THREE.Vector3(0,0,0),ident=new THREE.Matrix4().toArray();
 for(const p of FLORA.pools.values()){p.n=0;for(const m of p.meshes)m.visible=false;}
 const protos=[];
 for(const q of want){const proto=NURSERY.protos.get(q.key);
  if(!proto||proto.none||proto.impostor||!proto.parts||!proto.parts.length)continue;
  let p=FLORA.pools.get(q.key);
  if(!p||p.cap<1){
   if(p)for(const m of p.meshes){HOST.scene.remove(m);if(m.dispose)m.dispose();}
   const arr=new Float32Array(16),attr=new THREE.InstancedBufferAttribute(arr,16),white=new THREE.InstancedBufferAttribute(new Float32Array([1,1,1]),3),meshes=[];
   for(const part of proto.parts){const m=new THREE.InstancedMesh(part.geo,part.mat,1);
    m.instanceMatrix=attr;m.instanceColor=white;m.frustumCulled=false;m.count=0;m.userData.flora=q.key;m.userData.inspectLabel='flora';HOST.scene.add(m);meshes.push(m);}
   p={key:q.key,proto,n:0,cap:1,arr,attr,meshes};FLORA.pools.set(q.key,p);}
  p.arr.set(ident,0);p.n=1;
  for(const m of p.meshes){m.count=1;m.visible=true;m.position.copy(ORG);m.updateMatrix();m.updateMatrixWorld(true);}
  if(p.attr)p.attr.needsUpdate=true;
  const S=FLORA.KITS[q.ki].SP[q.sp]||{};
  protos.push({key:q.key,kit:q.kit,k:q.ki,sp:q.sp,species:S.key||String(q.sp),name:S.name||String(q.sp),v:q.v,lv:q.tag,
   H:+(proto.H==null?10:proto.H).toFixed(4),crownR:+(proto.crownR==null?4:proto.crownR).toFixed(3)});}
 return{format:'krator-flora-protos',version:1,region:REGION,protos};}
/* Pure [G data] tile placement over any world box [x0, z0, x1, z1], skipping interior place boxes, packed as Float32 rows [dx, y, dz, rot, Ht, keyIdx] */
const _tileCache=new Map();
function exportChunkFlora(box,skipBoxes,opt){if(typeof FLORA==='undefined'||!FLORA||typeof FLORA.buildTile!=='function')return null;
 const o=opt||{},TS=FLORA.TS==null?512:FLORA.TS,tx0=Math.floor(box[0]/TS),tx1=Math.ceil(box[2]/TS)-1,tz0=Math.floor(box[1]/TS),tz1=Math.ceil(box[3]/TS)-1;
 const ox=Math.round((box[0]+box[2])/2),oz=Math.round((box[1]+box[3])/2),sk=Array.isArray(skipBoxes)?skipBoxes:[];
 const maxE=o.maxElev==null?1e9:+o.maxElev,corr=Array.isArray(o.corridor)&&o.corridor.length?o.corridor:null,cR=o.corridorR==null?3200:+o.corridorR,cR2=cR*cR;
 let cSub=corr;if(corr){cSub=[];for(let i=0;i<corr.length;i++){const p=corr[i];if(p[0]>=box[0]-cR&&p[0]<=box[2]+cR&&p[1]>=box[1]-cR&&p[1]<=box[3]+cR)cSub.push(p);}}
 if(corr&&!cSub.length)return{format:'krator-chunk-flora',version:1,box:box.slice(),origin:[ox,0,oz],count:0,keys:[],data:E.pack(new Float32Array(0))};
 const keys=[],kmap=new Map(),rows=[];
 for(let tz=tz0;tz<=tz1;tz++)for(let tx=tx0;tx<=tx1;tx++){
  const tcx=(tx+.5)*TS,tcz=(tz+.5)*TS;
  if(cSub){let near=false;for(let q=0;q<cSub.length;q++){const dx=tcx-cSub[q][0],dz=tcz-cSub[q][1];if(dx*dx+dz*dz<=cR2){near=true;break;}}if(!near)continue;}
  if(maxE<1e8&&typeof WORLD!=='undefined'&&WORLD&&typeof WORLD.H==='function'&&WORLD.H(tcx,tcz,400)>maxE)continue;
  const tk=tx+','+tz;let recs=_tileCache.get(tk);if(!recs){recs=FLORA.buildTile(tx,tz);if(_tileCache.size>64)_tileCache.clear();_tileCache.set(tk,recs);}
  for(let i=0;i<recs.length;i++){const r=recs[i];
   if(r.x<box[0]||r.x>=box[2]||r.z<box[1]||r.z>=box[3])continue;
   if(cSub){const rLim=r.sap||r.Ht<8||r.sp===11?280:(r.far&&r.Ht>=15?cR:750),rL2=rLim*rLim;let okD=false;
    for(let q=0;q<cSub.length;q++){const dx=r.x-cSub[q][0],dz=r.z-cSub[q][1];if(dx*dx+dz*dz<=rL2){okD=true;break;}}if(!okD)continue;}
   let inSkip=false;for(let j=0;j<sk.length;j++){const b=sk[j];if(r.x>=b[0]&&r.x<=b[2]&&r.z>=b[1]&&r.z<=b[3]){inSkip=true;break;}}
   if(inSkip)continue;
   const bk=r.k+'|'+r.sp+'|'+r.v+(r.sap?'|s':'');let ki=kmap.get(bk);
   if(ki===undefined){ki=keys.length;kmap.set(bk,ki);keys.push(bk);}
   rows.push(r.x-ox,r.y,r.z-oz,r.rot,r.Ht,ki);}}
 return{format:'krator-chunk-flora',version:1,box:box.slice(),origin:[ox,0,oz],count:rows.length/6,keys,data:E.pack(new Float32Array(rows))};}
function attrF32(a,n){if(!a)return null;if(a.isInterleavedBufferAttribute||!(a.array instanceof Float32Array)){
  const f=new Float32Array(a.count*n);for(let i=0;i<a.count;i++)for(let k=0;k<n;k++)f[i*n+k]=a.getComponent?a.getComponent(i,k):a.array[i*a.itemSize+k];return f;}
 return a.array.slice(0,a.count*n);}
/* Extend any bridge whose road abutment terminated inside riverWater onto the dry opposite bank before export */
let _bridgesHealed=false;
function healWetBridgeEnds(){if(_bridgesHealed)return;_bridgesHealed=true;
 if(typeof window==='undefined'||!window._bridges||!Array.isArray(window._bridges.list)||typeof WORLD==='undefined'||!WORLD.riverWater)return;
 const rw=(x,z)=>WORLD.riverWater(x,z),hb=(x,z)=>WORLD.Hbare?WORLD.Hbare(x,z):WORLD.H(x,z);
 const STONE={xanadu:0xd9cfbd,order:0x9c9488,iziz:0xc8a074,default:0x8f8676},PARA={xanadu:0x7a3a2c,order:0x847b70,default:0x7d7466};
 const DECK=1.2,SHOULDER=1.2,PARA_H=1.0,PARA_W=.5;
 const boxG=new THREE.BoxGeometry(1,1,1),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),eu=new THREE.Euler(0,0,0,'YXZ'),v3=new THREE.Vector3(),sc3=new THREE.Vector3();
 const bpart=parts().find(T=>partOf(T)==='bridges');
 for(const B of window._bridges.list){if(!B||!Array.isArray(B.abutments)||B.abutments.length<2||!Array.isArray(B.deck)||B.deck.length<2)continue;
  let changed=false;
  for(const end of [1,0]){const ab=B.abutments[end];if(!(rw(ab.x,ab.z)>-1e8))continue;
   const D=B.deck,p0=end===1?D[D.length-1]:D[0],pIn=end===1?D[Math.max(0,D.length-3)]:D[Math.min(D.length-1,2)];
   let ux=p0[0]-pIn[0],uz=p0[1]-pIn[1];const ul=Math.hypot(ux,uz);if(!(ul>.05))continue;ux/=ul;uz/=ul;
   let sDry=-1;
   for(let s=6;s<=180;s+=6){const tx=p0[0]+ux*s,tz=p0[1]+uz*s;if(!(rw(tx,tz)>-1e8)&&hb(tx,tz)>=B.water+1.2){sDry=s+10;break;}}
   if(!(sDry>0))continue;
   const xEnd=+(p0[0]+ux*sDry).toFixed(2),zEnd=+(p0[1]+uz*sDry).toFixed(2),yEnd=+Math.max(hb(xEnd,zEnd)+.3,B.water+B.clearance).toFixed(2);
   const nSt=Math.max(2,Math.round(sDry/8)),add=[];
   for(let k=1;k<=nSt;k++){const t=k/nSt,sx=+(p0[0]+ux*sDry*t).toFixed(2),sz=+(p0[1]+uz*sDry*t).toFixed(2);
    const wy=rw(sx,sz),sy=+Math.max(p0[2]+(yEnd-p0[2])*t,wy>-1e8?wy+B.clearance:-1e9).toFixed(2);add.push([sx,sz,sy]);}
   if(end===1)for(const pt of add)D.push(pt);else for(let k=add.length-1;k>=0;k--)D.unshift(add[k]);
   B.abutments[end]={x:xEnd,z:zEnd,y:yEnd};
   const pe=B.kind==='viaduct'?18:16;
   for(let s=pe*.75;s<=sDry-10;s+=pe){const t=s/sDry,px=+(p0[0]+ux*s).toFixed(2),pz=+(p0[1]+uz*s).toFixed(2);
    const py=+(p0[2]+(yEnd-p0[2])*t).toFixed(2);B.piers.push({x:px,z:pz,yTop:+(py-DECK).toFixed(2),yBase:+hb(px,pz).toFixed(2)});}
   changed=true;}
  if(!changed)continue;
  let len=0;for(let i=1;i<B.deck.length;i++)len+=Math.hypot(B.deck[i][0]-B.deck[i-1][0],B.deck[i][1]-B.deck[i-1][1]);B.len=+len.toFixed(2);
  const o=B.abutments[0],W=2*(B.hw+SHOULDER),D=B.deck,out=[];
  const put=(x,y,z,yaw,pitch,sx,sy,sz,part)=>out.push([x-o.x,y,z-o.z,yaw,pitch,sx,sy,sz,part]);
  for(let i=1;i<D.length;i++){const a=D[i-1],b=D[i],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.05)continue;
   const yaw=Math.atan2(dx,dz),pitch=-Math.atan2(b[2]-a[2],L),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,my=(a[2]+b[2])/2,nx=dz/L,nz=-dx/L;
   put(mx,my-DECK/2,mz,yaw,pitch,W,DECK,L+.05,'deck');
   for(const sd of [-1,1])put(mx+nx*sd*(W/2-PARA_W/2),my+PARA_H/2,mz+nz*sd*(W/2-PARA_W/2),yaw,pitch,PARA_W,PARA_H,L+.05,'para');}
  const along=p=>{let best=0,bd=1e18;for(let i=0;i<D.length;i++){const d=Math.hypot(D[i][0]-p.x,D[i][1]-p.z);if(d<bd){bd=d;best=i;}}return best;};
  const sup=[{x:B.abutments[0].x,z:B.abutments[0].z,top:B.abutments[0].y-DECK,base:hb(B.abutments[0].x,B.abutments[0].z),i:0,abut:true}]
   .concat(B.piers.map(p=>({x:p.x,z:p.z,top:p.yTop,base:p.yBase,i:along(p)})))
   .concat([{x:B.abutments[1].x,z:B.abutments[1].z,top:B.abutments[1].y-DECK,base:hb(B.abutments[1].x,B.abutments[1].z),i:D.length-1,abut:true}]);
  sup.sort((a,b)=>a.i-b.i);
  const dirAt=i=>{const a=D[Math.max(0,i-1)],b=D[Math.min(D.length-1,i+1)];return Math.atan2(b[0]-a[0],b[1]-a[1]);};
  for(const P of sup){const h=Math.max(.5,P.top-P.base+1.5),yaw=dirAt(P.i);put(P.x,P.base-1.5+h/2,P.z,yaw,0,W+.6,h,P.abut?4:3.2,'pier');}
  if(B.kind!=='slab')for(let k=1;k<sup.length;k++){const A=sup[k-1],C=sup[k],span=Math.hypot(C.x-A.x,C.z-A.z);if(span<3)continue;
   const yaw=Math.atan2(C.x-A.x,C.z-A.z),under=Math.min(A.top,C.top),spring=Math.max(A.base,C.base)+.5,rise=Math.min(span/2,under-spring-.4);
   if(!(rise>.8))continue;const N=Math.max(6,Math.min(16,Math.round(span/2.5)));
   for(let j=0;j<N;j++){const t0=j/N,t1=(j+1)/N,f=t=>[A.x+(C.x-A.x)*t,A.z+(C.z-A.z)*t,spring+rise*Math.sin(Math.PI*t)];
    const p0=f(t0),p1=f(t1),L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]);
    put((p0[0]+p1[0])/2,(p0[2]+p1[2])/2,(p0[1]+p1[1])/2,yaw,-Math.atan2(p1[2]-p0[2],Math.hypot(p1[0]-p0[0],p1[1]-p0[1])),W,.9,L+.1,'arch');}}
  const grp=HOST&&HOST.scene?HOST.scene.children.find(c=>c&&c.name==='bridge '+B.id):null;
  const mid=D[Math.floor(D.length/2)],label=(B.kind==='slab'?'a slab bridge':B.kind==='arch'?'an arched bridge':B.kind==='viaduct'?'a viaduct':'a bridge of arches')+' ('+Math.round(B.len)+' m)';
  if(grp){while(grp.children.length)grp.remove(grp.children[0]);
   grp.position.set(o.x,0,o.z);grp.userData.inspectLabel=label;grp.visible=true;
   const byP={};out.forEach(r=>(byP[r[8]]||(byP[r[8]]=[])).push(r));
   const cu=B.culture&&STONE[B.culture]?B.culture:'default',mS=new THREE.MeshLambertMaterial({color:STONE[cu]}),mP=new THREE.MeshLambertMaterial({color:PARA[cu]||PARA.default});
   for(const part in byP){const L=byP[part],im=new THREE.InstancedMesh(boxG,part==='para'?mP:mS,L.length);
    L.forEach((r,i)=>{eu.set(r[4],r[3],0,'YXZ');q.setFromEuler(eu);im.setMatrixAt(i,m4.compose(v3.set(r[0],r[1],r[2]),q,sc3.set(r[5],r[6],r[7])));});
    im.instanceMatrix.needsUpdate=true;im.name='bridge '+part;im.userData.inspectLabel=label;grp.add(im);}
   grp.updateMatrix();grp.updateMatrixWorld(true);}
  if(bpart){const rec=bpart.records.find(r=>r&&r.key===B.id);if(rec){rec.at=[mid[0],mid[2],mid[1]];rec.r=B.len/2+10;rec.name=label;}}}}
/* Enrich exported scene items & materials with prototype vertex colours, clump normals, M5 biome kinds, and slope-seated roots */
function enrichScene(res,instForItem,matObjById){
 const matById=new Map();
 for(const r of (res.materials||[])){matById.set(r.id,r);const m=matObjById.get(r.id);if(!m)continue;
  const ud=m.userData||{},b=ud.bio||(ud.kind&&ud.kind!=='plain'&&ud.kind!=='impostor'?{kind:ud.kind,key:null,opts:ud.opts||null}:null);
  if(!b||!b.kind||b.kind==='plain')continue;
  r.kind=b.kind;const o=b.opts||{};
  if(b.kind==='leaf'){if(!(r.alphaTest>0))r.alphaTest=.42;const swA=o.swayA==null?.06:+o.swayA,merged=!ud.bio;
   r.options={swayA:swA,axis:o.axis==null?0:o.axis|0,aN:false,irid:false};if(o.season)r.options.season=plainBio(o.season);
   r.sway=merged?{c:0,w:[0,.05,0],a:swA,axis:0}:swayBio(o);}
  else{const po=b.opts?plainBio(b.opts):null;r.options=po&&typeof po==='object'?po:{};r.sway=swayBio(b.opts);}}
 const items=res.items||[];
 for(let idx=0;idx<items.length;idx++){const it=items[idx],m=instForItem[idx];if(!m||!m.geometry)continue;
  const g=m.geometry,mr=matById.get(it.material);
  if(g.attributes.color&&!it.geometry.color){const csz=g.attributes.color.itemSize===4?4:3;it.geometry.color=E.pack(attrF32(g.attributes.color,csz));}
  if(g.attributes.aN&&it.geometry.normal&&mr&&mr.kind==='leaf'){
   const N=E.unpack(it.geometry.normal),AN=attrF32(g.attributes.aN,3);
   if(N&&AN&&N.length===AN.length){for(let i=0;i<N.length;i+=3){const nx=N[i]*.3+AN[i]*.7,ny=N[i+1]*.3+AN[i+1]*.7,nz=N[i+2]*.3+AN[i+2]*.7,l=Math.hypot(nx,ny,nz);
     if(l>1e-6){N[i]=nx/l;N[i+1]=ny/l;N[i+2]=nz/l;}}it.geometry.normal=E.pack(N);}}
  if(it.kit==='flora'&&mr&&mr.kind!=='leaf'&&it.geometry.position){
   const P=E.unpack(it.geometry.position),pk=m.userData&&m.userData.flora,pool=pk&&FLORA&&FLORA.pools?FLORA.pools.get(pk):null;
   let yMax=pool&&pool.proto&&pool.proto.top?pool.proto.top:0;
   if(!(yMax>0))for(let i=1;i<P.length;i+=3)if(P[i]>yMax)yMax=P[i];
   if(yMax>=1.8){
    const yLo=Math.min(3,yMax*.35),yHi=Math.max(5.5,yMax*.14);let rTrunk=0;
    for(let i=0;i<P.length;i+=3){const vy=P[i+1];if(vy>=yLo&&vy<=yHi){const rr=Math.hypot(P[i],P[i+2]);if(rr>rTrunk)rTrunk=rr;}}
    const rButtress=Math.max(3.5,rTrunk*2.6,yMax*.13);
    for(let i=0;i<P.length;i+=3){let vx=P[i],vy=P[i+1],vz=P[i+2];const vy0=vy,rxz=Math.hypot(vx,vz);
     if(rxz>rButtress&&vy0<3.6){const t=Math.max(0,Math.min(1,(3.6-vy0)/3.6));vy-=t*Math.min(8,.75*(rxz-rButtress));}
     if(vy0<=.32){const w=1-Math.max(0,vy0)/.32,drop=Math.min(12,.85+.92*rxz),flare=rxz>.04?1+Math.min(.22,drop*.028)*w:1;
      vx*=flare;vz*=flare;vy-=drop*w;}
     P[i]=vx;P[i+1]=vy;P[i+2]=vz;}
    it.geometry.position=E.pack(P);}}}}
function floraSets(){if(typeof FLORA==='undefined'||!FLORA||!FLORA.pools)return FSETS;
 if(!FREG)FREG=KTAGS.create({build:REGION+':flora'});
 for(const p of FLORA.pools.values()){if(FSETS.has(p.key)||!p.meshes.length)continue;
  const f=String(p.key).split('|'),K=FLORA.KITS[f[0]],S=K&&K.SP?K.SP[f[1]]:null,key=S&&S.key?S.key:f[1];
  const row=i=>({a:p.arr,o:i*16,P:p.meshes[0].position});
  try{const set=FREG.addSet({'class':'flora',kind:key,key,name:S&&S.name?S.name:key,at:[0,0,0],tags:S&&S.tags?S.tags:{},
    note:'a flora pool of the open world, '+p.key+' (core/world 85), registered at export'},
   {get n(){return p.n;},
    pos(i,out){const w=row(i);out=out||[];out[0]=w.P.x+w.a[w.o+12];out[1]=w.P.y+w.a[w.o+13];out[2]=w.P.z+w.a[w.o+14];return out;},
    ry(i){const w=row(i);return Math.atan2(w.a[w.o+8],w.a[w.o+10]);}});
   FSETS.set(p.key,pre('flora',set.id));}catch(e){console.warn('core/world 94: flora pool '+p.key+': '+e.message);}}
 return FSETS;}
const scene_=ctx=>ctx.memo('world-scene',()=>{const box=ctx.box||[-Infinity,-Infinity,Infinity,Infinity],libOnly=!!WORLD_EXPORT.floraLibOnly;
 if(!libOnly)healWetBridgeEnds();
 if(!libOnly&&ctx.box&&ctx.sections.indexOf('items')>=0)prepareFloraBox(ctx.box);
 const K=byKey(),FS=floraSets(),instForItem=[],seenMats=[];let lastInst=null;
 const matKeys=()=>{const mk=new Map();let n=0;HOST.scene.traverse(m=>{if(!m||!m.isMesh)return;
  const ms=Array.isArray(m.material)?m.material:[m.material];
  for(const mt of ms){if(!mt||mk.has(mt))continue;const ud=mt.userData||{},b=ud.bio||(ud.kind&&ud.kind!=='plain'&&ud.kind!=='impostor'?{kind:ud.kind,key:null,opts:ud.opts||null}:null);
   if(b&&b.kind&&b.kind!=='plain')mk.set(mt,'bio_'+b.kind+'_'+(b.key||mt.name||'')+'_'+(n++));}});return mk;};
 const kitNameOf=m=>m.userData&&m.userData.flora?'flora/'+m.userData.flora+'/'+(m.material&&m.material.name||'')+(m.geometry?'#'+m.geometry.id:''):null;
 const ownerOf=m=>{if(m!==lastInst){instForItem.push(m);lastInst=m;}for(let p=m;p;p=p.parent){const n=p.name||'';if(n.indexOf('bridge ')===0&&K.has(n.slice(7)))return K.get(n.slice(7));}return null;};
 const res=E.sceneReader({name:'world:'+REGION,source:'openworld/'+REGION,scene:HOST.scene,tags:KTAGS.page,owner:owners(box),ownerOf,matKeys,origin:origin_(ctx),
  hooks:m=>{seenMats.push(m);return[];},
  /* a flora pool's part (85: userData.flora is the pool's key, kit|species|variant|level, shared by the plant's parts) */
  kitOf:kitNameOf,
  itemKit:kit=>kit&&kit.indexOf('flora/')===0?'flora':'world',
  itemSet:kit=>kit&&kit.indexOf('flora/')===0?FS.get(kit.split('/')[1])||null:null,
  skipInstanced:m=>hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':libOnly&&!(m.userData&&m.userData.flora)?'non-flora in floraLibOnly':null,
  skipMesh:m=>libOnly?'floraLibOnly':m.userData&&m.userData.terrain?'the terrain (the terrain section)':m.userData&&m.userData.probeSkip?'water or sky (their sections)':
   hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':null}).assemble(ctx);
 const matObjById=new Map();
 if(res.materials&&seenMats.length===res.materials.length)for(let i=0;i<seenMats.length;i++)matObjById.set(res.materials[i].id,seenMats[i]);
 enrichScene(res,instForItem,matObjById);return res;});
const by={by:'world'};
E.register('items',ctx=>scene_(ctx).items,by);
E.register('buckets',ctx=>scene_(ctx).buckets,by);
E.register('materials',ctx=>scene_(ctx).materials,by);
E.register('textures',ctx=>scene_(ctx).textures,by);
/* Include streamed small creeks (83s STREAMW) and tarns (WORLD.ponds) overlapping a finite box in core/export's water section */
const _world0=E.world;
E.world=function(opt){
 healWetBridgeEnds();
 const wantWater=!(opt&&Array.isArray(opt.sections)&&opt.sections.indexOf('water')<0)&&WORLD_EXPORT.water!==false;
 const b=opt&&Array.isArray(opt.box)&&opt.box.length===4?opt.box:null;
 let baseLen=-1;
 if(wantWater&&b&&typeof WATER!=='undefined'&&WATER&&Array.isArray(WATER.surfaces)&&typeof WORLD!=='undefined'&&WORLD){
  baseLen=WATER.surfaces.length;
  if(typeof WORLD.streamPieces==='function'&&typeof WORLD.streamWaterLine==='function'){
   const SP=WORLD.streamPieces();
   for(let n=0;n<SP.length;n++){const p=SP[n];
    if(p.x+p.r<b[0]||p.x-p.r>b[2]||p.z+p.r<b[1]||p.z-p.r>b[3])continue;
    const L=WORLD.streamWaterLine(p,8);if(!L||!L.pts||L.pts.length<2)continue;
    const F=WATER.flow({name:'stream '+p.line+'.'+n,pts:L.pts,width:L.w,speed:L.v,rapids:[.06,.3]});
    F.ribbonOpt={step:8,across:4,margin:1};
    F.look={shallow:'#557f74',deep:'#1f3a3e',roughness:.16,metal:.06,transparent:true};}}
  if(typeof WORLD.ponds==='function'){
   const PO=WORLD.ponds();
   for(let k=0;k<PO.length;k++){const p=PO[k];
    if(p.x+p.r<b[0]||p.x-p.r>b[2]||p.z+p.r<b[1]||p.z-p.r>b[3])continue;
    const S=WATER.still({name:'tarn '+p.id,level:p.level,poly:p.poly});
    S.look={colour:'#2c4f52',roughness:.1,metal:.08,transparent:false};}}}
 try{return _world0.apply(E,arguments);}
 finally{if(baseLen>=0)WATER.surfaces.length=baseLen;}};
/* ---------------------------------------------------------------- the ground */
const l2s8=c=>{c=c<=0?0:c>=1?1:c;const s=c<.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;return Math.max(0,Math.min(255,Math.round(s*255)));};
const u8=c=>Math.max(0,Math.min(255,Math.round((c<=0?0:c>=1?1:c)*255)));
const ROAD_LIN=[.3712,.3278,.2582];   /* 0xa49a8a in linear RGB, matching 81-world-terrain.js uRoad */
E.register('terrain',ctx=>{if(!ctx.box)return null;origin_(ctx);const st=WORLD_EXPORT.step==null?32:+WORLD_EXPORT.step;
 const t=E.terrain(ctx.box,{h:(x,z)=>WORLD.H(x,z),water:WORLD_EXPORT.water===false?null:(x,z)=>WORLD.water(x,z),step:st,probes:WORLD_EXPORT.probes==null?16:+WORLD_EXPORT.probes});
 if(t&&t.grid&&WORLD_EXPORT.surface!==false&&typeof WORLD.Hp==='function'&&typeof WORLD.ground==='function'){
  const G=t.grid,nx=G.nx,nz=G.nz,n=nx*nz,ar=new Uint8Array(n*4),nc=new Uint8Array(n*4),e=Math.min(4,st*.25),_P={},_F={},_C=[0,0,0,0];
  const hasRd=typeof WORLD.roadCover==='function',rdW=Math.max(st,6);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=G.x0+i*st,z=G.z0+j*st,o=(j*nx+i)*4;
   const h=WORLD.Hp(x,z,0,_P),hx=(WORLD.H(x+e,z)-WORLD.H(x-e,z))/(2*e),hz=(WORLD.H(x,z+e)-WORLD.H(x,z-e))/(2*e),nl=Math.hypot(hx,1,hz);
   const F=WORLD.fieldsFrom(x,z,h,Math.hypot(hx,hz),_P,_F);WORLD.ground(x,z,F,_C);
   const rd=hasRd?WORLD.roadCover(x,z,rdW):0;
   const r=_C[0]+(ROAD_LIN[0]-_C[0])*rd,g=_C[1]+(ROAD_LIN[1]-_C[1])*rd,b=_C[2]+(ROAD_LIN[2]-_C[2])*rd,rk=_C[3]*(1-rd);
   ar[o]=l2s8(r);ar[o+1]=l2s8(g);ar[o+2]=l2s8(b);ar[o+3]=u8(rk);
   const ce=F.crease==null?0:F.crease,cav=1-.42*Math.max(0,ce)-.28*(F.canyon==null?0:F.canyon)+.08*Math.max(0,-ce);
   const nearW=F.water>-1e8?Math.max(0,Math.min(1,(6-(h-F.water))/6.5)):0,wet=Math.max((F.flow==null?0:F.flow)*.85,nearW,((F.wet==null?0:F.wet)-.35)*.45)*(1-rd*.7);
   nc[o]=u8((-hx/nl)*.5+.5);nc[o+1]=u8((-hz/nl)*.5+.5);nc[o+2]=u8(Math.max(.25,Math.min(1,cav)));nc[o+3]=u8(wet);}
  G.surface={albedoRock:E.pack(ar),normalCav:E.pack(nc),
   note:'RGBA8 on the grid: albedoRock=(sRGB WORLD.ground + road, linear rock weight); normalCav=(sub-grid normal nx/nz*0.5+0.5, crease/canyon cavity AO, bank/flow wetness)'};}
 return t;},by);
WORLD_EXPORT.prepareFloraLib=prepareFloraLib;
WORLD_EXPORT.exportChunkFlora=exportChunkFlora;
window._worldExport={registries:()=>parts().map(T=>({build:T.build,records:T.records.length})),prepareFloraLib,exportChunkFlora};
})();
