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
/* Ensure multi-view or wide-box places keep full 3D flora across the entire box and promote ShaderMaterial impostors to real mid meshes */
function prepareFloraBox(box){if(!box||typeof FLORA==='undefined'||!FLORA||!FLORA.pools||typeof NURSERY==='undefined'||!NURSERY)return;
 const anchors=Array.isArray(WORLD_EXPORT.floraAnchors)&&WORLD_EXPORT.floraAnchors.length?WORLD_EXPORT.floraAnchors:null;
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
 for(const p of FLORA.pools.values())p.n=0;
 const lim=(a,ht)=>Math.min(a[2],Math.max(a[1],a[0]*ht));
 for(const t of FLORA.tiles.values())for(const r of t.recs){
  if(r.x<box[0]-32||r.x>box[2]+32||r.z<box[1]-32||r.z>box[3]+32)continue;
  let d=1e9;for(const a of A){const dd=Math.hypot(r.x-a[0],r.z-a[1]);if(dd<d)d=dd;}
  const L=FLORA.KITS[r.k].lod;let lv=-1;
  if(r.sap)lv=d<L.sapling[1]||anchors?2:-1;
  else if(d<lim(L.hero,r.Ht))lv=2;
  else if(d<lim(L.mid,r.Ht)||anchors)lv=1;
  else if(r.far&&d<lim(L.far,r.Ht))lv=0;
  if(lv<0)continue;
  let key=r.k+'|'+r.sp+'|'+r.v+'|'+(r.sap?'s':lv);
  let proto=NURSERY.protos.get(key)||NURSERY.get(key,{kit:FLORA.KITS[r.k].name,sp:r.sp,v:r.v,lv:r.sap?2:lv,sapling:r.sap},d);
  if((!proto||proto.impostor)&&!r.sap){for(const alt of [1,2,0]){const k2=r.k+'|'+r.sp+'|'+r.v+'|'+alt,p2=NURSERY.protos.get(k2);if(p2&&!p2.impostor&&!p2.none&&p2.parts&&p2.parts.length){key=k2;proto=p2;break;}}}
  if(!proto||proto.impostor||proto.none||!proto.parts||!proto.parts.length)continue;
  const p=getPool(key,proto);ensureCap(p,p.n+1);
  const sc=r.Ht/(proto.H==null?r.Ht:proto.H);_q.setFromAxisAngle(_Y,r.rot);_p.set(r.x-ORG.x,r.y,r.z-ORG.z);_s.set(sc,sc,sc);_m.compose(_p,_q,_s);
  _m.toArray(p.arr,p.n*16);p.n++;}
 if(NURSERY.queued&&NURSERY.queued()>0&&NURSERY.update)NURSERY.update(5000);
 for(const p of FLORA.pools.values()){for(const m of p.meshes){m.count=p.n;m.visible=p.n>0;m.position.copy(ORG);m.updateMatrix();m.updateMatrixWorld(true);}
  if(p.attr)p.attr.needsUpdate=true;}}
function attrF32(a,n){if(!a)return null;if(a.isInterleavedBufferAttribute||!(a.array instanceof Float32Array)){
  const f=new Float32Array(a.count*n);for(let i=0;i<a.count;i++)for(let k=0;k<n;k++)f[i*n+k]=a.getComponent?a.getComponent(i,k):a.array[i*a.itemSize+k];return f;}
 return a.array.slice(0,a.count*n);}
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
   if(yMax>=3.5){const rFoot=Math.max(3.2,yMax*.065);
    for(let i=0;i<P.length;i+=3){let vx=P[i],vy=P[i+1],vz=P[i+2];const rxz=Math.hypot(vx,vz);
     if(yMax>=18&&vy<4.5&&rxz>rFoot){const over=rxz-rFoot,rNew=rFoot+over/(1+over/6),sc=rNew/rxz;vx*=sc;vz*=sc;
      const low=Math.max(0,Math.min(1,(4.5-vy)/4.5));vy-=low*(.65*(rNew-rFoot)+.8+.35*rFoot);}
     else if(vy<=.22){vy-=Math.min(5.5,.5+.62*rxz);}
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
const scene_=ctx=>ctx.memo('world-scene',()=>{const box=ctx.box||[-Infinity,-Infinity,Infinity,Infinity];
 if(ctx.box&&ctx.sections.indexOf('items')>=0)prepareFloraBox(ctx.box);
 const K=byKey(),FS=floraSets(),instForItem=[],seenMats=[];let curInst=null;
 const kitNameOf=m=>{curInst=m;return m.userData&&m.userData.flora?'flora/'+m.userData.flora+'/'+(m.material&&m.material.name||'')+(m.geometry?'#'+m.geometry.id:''):null;};
 const ownerOf=m=>{if(curInst){instForItem.push(curInst);curInst=null;}for(let p=m;p;p=p.parent){const n=p.name||'';if(n.indexOf('bridge ')===0&&K.has(n.slice(7)))return K.get(n.slice(7));}return null;};
 const res=E.sceneReader({name:'world:'+REGION,source:'openworld/'+REGION,scene:HOST.scene,tags:KTAGS.page,owner:owners(box),ownerOf,origin:origin_(ctx),
  hooks:m=>{seenMats.push(m);return[];},
  /* a flora pool's part (85: userData.flora is the pool's key, kit|species|variant|level, shared by the plant's parts) */
  kitOf:kitNameOf,
  itemKit:kit=>kit&&kit.indexOf('flora/')===0?'flora':'world',
  itemSet:kit=>kit&&kit.indexOf('flora/')===0?FS.get(kit.split('/')[1])||null:null,
  skipInstanced:m=>hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':null,
  skipMesh:m=>m.userData&&m.userData.terrain?'the terrain (the terrain section)':m.userData&&m.userData.probeSkip?'water or sky (their sections)':
   hidden(m)?'hidden':beacon(m)?'a resource beacon (a map marker)':null}).assemble(ctx);
 const matObjById=new Map();
 if(res.materials&&seenMats.length===res.materials.length)for(let i=0;i<seenMats.length;i++)matObjById.set(res.materials[i].id,seenMats[i]);
 enrichScene(res,instForItem,matObjById);return res;});
const by={by:'world'};
E.register('items',ctx=>scene_(ctx).items,by);
E.register('buckets',ctx=>scene_(ctx).buckets,by);
E.register('materials',ctx=>scene_(ctx).materials,by);
E.register('textures',ctx=>scene_(ctx).textures,by);
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
window._worldExport={registries:()=>parts().map(T=>({build:T.build,records:T.records.length}))};
})();
