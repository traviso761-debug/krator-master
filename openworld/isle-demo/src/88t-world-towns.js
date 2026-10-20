// ================================================================= ISLE DEMO — the towns drawn (M7): streets, orchards, the kits' pieces, vessels, the export
// [web] Draws what ISLE_TOWNS_W planned (48t-world-towns.js); it decides nothing. Each town is drawn by the city page's
// own drawing (settlements/isle-demo/src/60-isle-draw.js, read in place by build.py as ISLE_DRAW_FACTORY: one DRAW per
// town over its own group, the group at the town's frame {x, sea, z}, so the records draw in the town's frame as on the
// city page). The ground is the world's terrain (48t laid the town's grid into it) and the sea the world's, so the city
// page's ground mesh and sea are not drawn (the terrain takes the town's colours: paved, lawn, sand, crops). Far: every lot as massing (a body and a roof), out to FAR. Near (the camera
// over the town's square): the lots within DRAW.nearR of the point under the camera in full, rebuilt as it moves. The
// prototypes are built once for both towns. The world keeps its flora and floor off the town's built area (its zone:
// the drawing grown, as the city page draws it, with no wild trees) and the lots, streets and fields beyond it
// (WORLD.clearHook, chained after the hamlets').
// THE EXPORT (moved here from the city page, PLAN.md M7): one town at a time, in that town's frame, so a case is the
// city page's (the same records, ids and sim): ?town=Kautoa (the default) or Valapo picks it, and the camera starts over it;
// ?simAt=minute runs the sim to that minute first. The town the camera is over runs presented, the other abstract
// (ISLE.simWatch, settlements/isle-demo 48); the sim is declared and held here, not yet run on the world's clock. The city page's export contributors (src/62, read in place as
// ISLE_EXPORT_FACTORY) run over the town's group moved to the origin while they read; the city section is the town's
// plan alone; the terrain its grid; the stage the world's (its lights, fog and sky from the town, its ground's look moved
// into the town's frame).
//   window._isleTowns   {stats, towns: [{town, census, checks, failed, missing, draw}], exportTown(name), errors}
var ISLE_TOWNS_DRAW;LATE.push(()=>{ISLE_TOWNS_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,W=ISLE_TOWNS_W,FAR=30000,NEAR_R=520,S={errors:W.stats.errors.slice(),ms:0,full:null};
const t0=performance.now(),q=new URLSearchParams(location.search);
let shared=null;
const T=W.plans.map(P=>{const F=P.G.frame,g=new THREE.Group();g.position.set(F.x,F.sea,F.z);g.name='town '+P.town;scene.add(g);
 const D=ISLE_DRAW_FACTORY(g);if(shared){D.protos=shared.protos;D.failed=shared.failed;}else shared=D;
 D.nearR=0;   /* massing only until the camera comes over the town */
 const keep=ISLE.cur;ISLE.cur=P;
 try{D.streets(P.R,P.G);D.orchards(P.R,P.G);D.records(P.R);D.vessels(P.R);}catch(e){S.errors.push(P.town+' draw: '+(e&&e.stack?e.stack:e));}
 finally{ISLE.cur=keep;}
 const X={P,F,g,D,full:false};cull(X);return X;});
function cull(X){X.g.traverse(m=>{if(m.isInstancedMesh)m.frustumCulled=false;});}   /* an instanced mesh's bounds are its piece's at the origin: unculled until bounded() (below) */
/* ---------------------------------------------------------------- keep-clear: the built area, and lots, streets and fields */
const clear=KSPACE.create({cell:32}),zones=[];
const put=(x,z,r)=>clear.insert({x,z,r},x,z,r);
for(const X of T){const R=X.P.R,F=X.F;
 for(const L of R.lots.concat(R.wall))put(L.x+F.x,L.z+F.z,Math.hypot(L.w,L.d)/2+3);
 for(const w of R.plan.ways){const P=KCITY.lib.resample(w.pts,6,false);for(const p of P)put(p[0]+F.x,p[1]+F.z,w.w/2+1.5);}
 for(const f of R.fields||[])put(f.x+F.x,f.z+F.z,(f.size==null?40:f.size)*.71);
 for(const d of R.districts)if(d.role==='zone'){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of d.poly){x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}
  zones.push({F,poly:d.poly,box:[x0+F.x,z0+F.z,x1+F.x,z1+F.z]});}}
const prevClear=WORLD.clearHook;
WORLD.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;if(clear.some(x,z,0,it=>Math.hypot(x-it.x,z-it.z)<it.r))return true;
 for(const p of zones)if(x>=p.box[0]&&z>=p.box[1]&&x<=p.box[2]&&z<=p.box[3]&&KCITY.lib.inPoly([x-p.F.x,z-p.F.z],p.poly))return true;return false;};
/* ---------------------------------------------------------------- the ground's colour in the towns, as the city page paints it */
/* settlements/isle-demo 60 DRAW.ground: the markets and the warriors' yard paved, the ceremonial park and the parks lawn,
   the beaches sand, each farm parcel its crop's tone (DRAW.CROP) over the world's own ground colour (WORLD.ground,
   wrapped after the isles' own: 43-world-isles.js). The terrain's chunks are built after this module, so all of them read it. */
const paint=[];
for(const X of T){const R=X.P.R,F=X.F,G=X.P.G,fc=R.fields.length?R.fields[0].size:40,fmap={};
 R.fields.forEach(Fr=>{fmap[Math.floor((Fr.x+G.half)/fc)+','+Math.floor((Fr.z+G.half)/fc)]=X.D.CROP[Fr.crop]||X.D.CROP._;});
 const ds=[];R.districts.forEach(d=>{const kind=d.role==='market'||d.role==='warriors'?'paved':d.role==='ceremonial'||d.role==='park'?'lawn':d.role==='beach'?'beach':null;if(!kind)return;
  let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(const p of d.poly){x0=Math.min(x0,p[0]);z0=Math.min(z0,p[1]);x1=Math.max(x1,p[0]);z1=Math.max(z1,p[1]);}ds.push({kind,poly:d.poly,box:[x0,z0,x1,z1]});});
 paint.push({P:X.P,F,G,fc,fmap,ds});}
const ground0=WORLD.ground;
WORLD.ground=function(x,z,S,out){ground0(x,z,S,out);const P=W.at(x,z);if(!P||S.depth>0)return out;const Q=paint.find(q=>q.P===P),lx=x-Q.F.x,lz=z-Q.F.z;
 for(const d of Q.ds){if(lx<d.box[0]||lz<d.box[1]||lx>d.box[2]||lz>d.box[3]||!KCITY.lib.inPoly([lx,lz],d.poly))continue;
  if(d.kind==='paved'){out[0]=.24;out[1]=.2;out[2]=.15;}else if(d.kind==='lawn'){out[0]=out[0]*.3+.07;out[1]=out[1]*.3+.16;out[2]=out[2]*.3+.05;}
  else{out[0]+=(.66-out[0])*.7;out[1]+=(.62-out[1])*.7;out[2]+=(.52-out[2])*.7;}return out;}
 const fk=Q.fmap[Math.floor((lx+Q.G.half)/Q.fc)+','+Math.floor((lz+Q.G.half)/Q.fc)];
 if(fk){out[0]=out[0]*.35+fk[0]*.65;out[1]=out[1]*.35+fk[1]*.65;out[2]=out[2]*.35+fk[2]*.65;}
 return out;};
/* ---------------------------------------------------------------- HLOD: visibility ranges and baked proxies (as Godot's) */
/* Measured over Kautoa (2026-10-20): the near pieces within 520 m were 605 draw calls and 6.4M triangles, the 55 moored
   vessels about 300 calls and 1.1M triangles, and every town mesh drew with frustum culling off. Now, like Godot's
   visibility ranges with a merged far mesh:
   - FULL: the lots within FULL_R of the ground point the camera looks at (at most LOOK m ahead) in full (the city page's pieces, one InstancedMesh a
     material, as before);
   - MID: the lots out to MID_R as BAKED proxies: each piece's parts merged into one geometry in one vertex-coloured
     material (a part's colour is its material's colour times its map's mean, times its vertex colours) and simplified
     by vertex clustering, in two levels as Godot's mesh LOD: a grid of 1/40 of the piece's size out to MID1, 1/12
     beyond; one InstancedMesh a piece and level for the whole ring;
   - beyond: the massing, as before. The vessels the same way: in full within VES_R, baked and instanced by kind beyond.
   A piece is baked the first time the ring wants it, within BAKE_MS a frame; until then its lots stay massing. Every
   instanced mesh gets bounds of its own round its instances (a geometry sharing the piece's buffers), so the frustum
   culls it again. The export is untouched: it draws the full pieces itself (62) and sees no proxy (they are hidden while
   it reads, the vessels shown). verify.py checks that every lot is drawn exactly once, full, baked or massing. */
const FULL_R=150,MID1=350,MID_R=800,VES_R=250,BAKE_MS=8,DIV=[40,12],HL={bakes:0,bakeMs:0,queue:0,lastRebuild:0};
const bakeMat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0});   /* flat-shaded from the derivatives: the baked geometry carries no normals */
const mean=new Map(),lin=c=>Math.pow(c/255,2.2);
function texMean(t){if(!t||!t.image)return null;if(mean.has(t.uuid))return mean.get(t.uuid);let m=null;
 try{const cv=document.createElement('canvas');cv.width=cv.height=8;const cx=cv.getContext('2d');cx.drawImage(t.image,0,0,8,8);const d=cx.getImageData(0,0,8,8).data;let r=0,g=0,b=0;
  for(let i=0;i<d.length;i+=4){r+=lin(d[i]);g+=lin(d[i+1]);b+=lin(d[i+2]);}m=[r/64,g/64,b/64];}catch(e){m=null;}   /* a colour only: nothing is placed from it */
 mean.set(t.uuid,m);return m;}
/* merge parts [{geo, mat, M (Matrix4 or null)}] into one geometry with colours, clustered on a grid of s m */
function bake(parts,s){let nv=0,ni=0;for(const p of parts){nv+=p.geo.attributes.position.count;ni+=p.geo.index?p.geo.index.count:p.geo.attributes.position.count;}
 const pos=new Float32Array(nv*3),col=new Float32Array(nv*3),idx=new Uint32Array(ni),v=new THREE.Vector3();let o=0,k=0;
 for(const p of parts){const g=p.geo,P=g.attributes.position,C=g.attributes.color,mt=Array.isArray(p.mat)?p.mat[0]:p.mat,mc=mt&&mt.color?mt.color:{r:1,g:1,b:1},tm=texMean(mt&&mt.map)||[1,1,1];
  const base=[mc.r*tm[0],mc.g*tm[1],mc.b*tm[2]];
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);if(p.M)v.applyMatrix4(p.M);const j=(o+i)*3;pos[j]=v.x;pos[j+1]=v.y;pos[j+2]=v.z;
   const cr=C&&mt.vertexColors?C.getX(i):1,cg=C&&mt.vertexColors?C.getY(i):1,cb=C&&mt.vertexColors?C.getZ(i):1;col[j]=base[0]*cr;col[j+1]=base[1]*cg;col[j+2]=base[2]*cb;}
  if(g.index)for(let i=0;i<g.index.count;i++)idx[k++]=o+g.index.getX(i);else for(let i=0;i<P.count;i++)idx[k++]=o+i;o+=P.count;}
 /* vertex clustering: one vertex a cell and facing (the triangle's dominant axis), averaged; collapsed triangles dropped */
 const cell=new Map(),cp=[],cc=[],cn=[],out=[],q=i=>[Math.floor(pos[i*3]/s),Math.floor(pos[i*3+1]/s),Math.floor(pos[i*3+2]/s)];
 const A=new THREE.Vector3(),B=new THREE.Vector3(),Cc=new THREE.Vector3();
 for(let t=0;t<k;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2];A.set(pos[b*3]-pos[a*3],pos[b*3+1]-pos[a*3+1],pos[b*3+2]-pos[a*3+2]);B.set(pos[c*3]-pos[a*3],pos[c*3+1]-pos[a*3+1],pos[c*3+2]-pos[a*3+2]);
  Cc.crossVectors(A,B);const ax=Math.abs(Cc.x),ay=Math.abs(Cc.y),az=Math.abs(Cc.z),f=ax>=ay&&ax>=az?(Cc.x>0?0:1):ay>=az?(Cc.y>0?2:3):(Cc.z>0?4:5);
  const ids=[a,b,c].map(i=>{const g=q(i),key=((g[0]+4096)*8192+(g[1]+4096))*8192+(g[2]+4096)+f*549755813888;let n=cell.get(key);
   if(n==null){n=cn.length;cell.set(key,n);cp.push(0,0,0);cc.push(0,0,0);cn.push(0);}if(!(i in seen[n]||(seen[n][i]=1,false))){cp[n*3]+=pos[i*3];cp[n*3+1]+=pos[i*3+1];cp[n*3+2]+=pos[i*3+2];cc[n*3]+=col[i*3];cc[n*3+1]+=col[i*3+1];cc[n*3+2]+=col[i*3+2];cn[n]++;}return n;});
  if(ids[0]!==ids[1]&&ids[1]!==ids[2]&&ids[0]!==ids[2])out.push(ids[0],ids[1],ids[2]);}
 const n=cn.length,P2=new Float32Array(n*3),C2=new Float32Array(n*3);for(let i=0;i<n;i++){const w=cn[i]||1;for(let c=0;c<3;c++){P2[i*3+c]=cp[i*3+c]/w;C2[i*3+c]=cc[i*3+c]/w;}}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P2,3));G.setAttribute('color',new THREE.BufferAttribute(C2,3));
 G.setIndex(new THREE.BufferAttribute(n>65535?new Uint32Array(out):new Uint16Array(out),1));G.computeBoundingSphere();return{geo:G,tris:out.length/3,from:k/3};}
const seen=new Proxy({},{get:(o,n)=>o[n]||(o[n]={})});   /* per cell: the source vertices already summed (a vertex shared by triangles counts once) */
const sizeOf=g=>{if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;return Math.max(b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z);};
const baked=new Map(),wantBake=new Map();   /* key -> {geo, tris, from} | null; key -> a job () => parts */
function bakedOf(key,job,div){if(baked.has(key))return baked.get(key);if(!wantBake.has(key))wantBake.set(key,{job,div:div==null?DIV[0]:div});return undefined;}
function pumpBakes(){if(!wantBake.size)return false;const t0=performance.now();let any=false;
 for(const [key,W0] of wantBake){wantBake.delete(key);let r=null;
  try{const parts=W0.job();if(parts&&parts.length){let s=0;parts.forEach(p=>{s=Math.max(s,sizeOf(p.geo));});for(const k in seen)delete seen[k];r=bake(parts,Math.max(.3,s/W0.div));HL.bakes++;}}catch(e){if(S.errors.length<8)S.errors.push('bake '+key+': '+e.message);}
  baked.set(key,r);any=true;if(performance.now()-t0>BAKE_MS)break;}
 HL.bakeMs+=performance.now()-t0;HL.queue=wantBake.size;return any;}
/* an instanced mesh with bounds of its own round its instances (a geometry sharing the given one's buffers), culled */
const _m=new THREE.Matrix4(),_v=new THREE.Vector3();
function bounded(im){const g0=im.geometry;if(!g0.boundingSphere)g0.computeBoundingSphere();const g=new THREE.BufferGeometry();
 for(const k in g0.attributes)g.setAttribute(k,g0.attributes[k]);if(g0.index)g.setIndex(g0.index);g.groups=g0.groups;
 const n=im.count;let cx=0,cy=0,cz=0,r=0,sc=1;if(!n){g.boundingSphere=new THREE.Sphere(new THREE.Vector3(),0);im.geometry=g;im.frustumCulled=true;return im;}
 for(let i=0;i<n;i++){im.getMatrixAt(i,_m);_v.setFromMatrixPosition(_m);cx+=_v.x;cy+=_v.y;cz+=_v.z;sc=Math.max(sc,_m.getMaxScaleOnAxis());}cx/=n;cy/=n;cz/=n;
 for(let i=0;i<n;i++){im.getMatrixAt(i,_m);_v.setFromMatrixPosition(_m);r=Math.max(r,Math.hypot(_v.x-cx,_v.y-cy,_v.z-cz));}
 const gs=g0.boundingSphere;g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx+gs.center.x,cy+gs.center.y,cz+gs.center.z),r+gs.radius*sc);im.geometry=g;im.frustumCulled=true;return im;}
/* the vessels: their groups (60 DRAW.vessels draws them into the town's group, named by their record) */
for(const X of T){X.ves=X.P.R.vessels.map(V=>({V,g:X.g.getObjectByName(V.id)})).filter(v=>v.g);X.mid=[];X.vprox=[];X.hlodAt=null;X.dirty=true;
 X.D.nearR=0;X.massZero=new THREE.Matrix4().makeScale(0,0,0);
 X.g.children.forEach(m=>{if(m.isInstancedMesh&&m!==X.D.massB&&m!==X.D.massR&&X.D.inst.indexOf(m)<0)bounded(m);});}   /* footings, compound walls, orchards: bounded once */
const partsOfGroup=G=>{const out=[],inv=new THREE.Matrix4().copy(G.matrixWorld).invert();G.updateMatrixWorld(true);inv.copy(G.matrixWorld).invert();
 G.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&m.geometry&&m.geometry.attributes.position)out.push({geo:m.geometry,mat:m.material,M:new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld)});
  else if(m.isInstancedMesh)for(let i=0;i<m.count;i++){m.getMatrixAt(i,_m);out.push({geo:m.geometry,mat:m.material,M:new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld).multiply(_m)});}});return out;};
function drop(list,g){list.forEach(m=>g.remove(m));list.length=0;}
/* the rings round `at` (the town's frame): full (60's near), baked to MID_R, massing beyond; vessels full within VES_R */
function hlod(X,at,on){const D=X.D;drop(X.mid,X.g);drop(X.vprox,X.g);X.hlodAt=at?at.slice():null;X.dirty=false;HL.lastRebuild=performance.now();
 if(!on){X.ves.forEach(v=>{v.g.visible=true;});return;}
 const by={},n0=D.recs.length;let mid=0;
 D.recs.forEach((L,i)=>{const d=Math.hypot(L.x-at[0],L.z-at[1]);if(d<D.nearR||d>=MID_R)return;
  const id=L.kit+':'+L.key+'#'+(L.v|0),P=D.protos[id],lv=d<MID1?0:1,key=id+'|'+lv;
  if(P===undefined){bakedOf(key,()=>{const Q=D.proto(L.kit,L.key,L.v);return Q?Q.parts.map(p=>({geo:p.geo,mat:p.mat,M:null})):null;},DIV[lv]);return;}   /* the piece built first, then baked */
  if(!P)return;const B=bakedOf(key,()=>P.parts.map(p=>({geo:p.geo,mat:p.mat,M:null})),DIV[lv]);if(!B)return;(by[key]||(by[key]={B,P,L:[],i:[]})).L.push(L);by[key].i.push(i);});
 for(const id in by){const E=by[id],im=new THREE.InstancedMesh(E.B.geo,bakeMat,E.L.length);
  E.L.forEach((L,j)=>{const sx=L.cls==='wall'&&E.P.w?L.w/E.P.w:1;im.setMatrixAt(j,D.matOf(L,[sx,1,1]));D.massB.setMatrixAt(E.i[j],X.massZero);D.massR.setMatrixAt(E.i[j],X.massZero);});
  im.name='baked '+id;im.userData.hlod=true;im.userData.lots=E.L.map(L=>L.tag);X.g.add(bounded(im));X.mid.push(im);mid+=E.L.length;}
 D.massB.instanceMatrix.needsUpdate=true;D.massR.instanceMatrix.needsUpdate=true;bounded(D.massB);bounded(D.massR);
 D.inst.forEach(m=>{if(!m.userData.bounded){bounded(m);m.userData.bounded=true;}});
 /* the vessels: in full near, baked and instanced by kind beyond */
 const vb={};X.ves.forEach(v=>{const d=Math.hypot(v.V.x-at[0],v.V.z-at[1]);if(d<VES_R){v.g.visible=true;return;}
  const B=bakedOf('vessel:'+v.V.key,()=>partsOfGroup(v.g));if(!B){v.g.visible=true;return;}v.g.visible=false;(vb[v.V.key]||(vb[v.V.key]={B,L:[]})).L.push(v);});
 for(const k in vb){const E=vb[k],im=new THREE.InstancedMesh(E.B.geo,bakeMat,E.L.length);E.L.forEach((v,j)=>{v.g.updateMatrix();im.setMatrixAt(j,v.g.matrix);});
  im.name='baked vessels '+k;im.userData.hlod=true;X.g.add(bounded(im));X.vprox.push(im);}
 X.stats={full:D.stats.near,mid,massing:n0-D.stats.near-mid,vesselsBaked:X.vprox.reduce((a,m)=>a+m.count,0)};}
/* ---------------------------------------------------------------- each frame: the rings follow the camera */
/* the rings' centre: the ground point the camera looks at, at most LOOK m ahead (straight below when it looks up) */
const LOOK=600,_d=new THREE.Vector3();
function lookPoint(){const P=camera.position,d=camera.getWorldDirection(_d),agl=P.y-WORLD.H(P.x,P.z),t=d.y<-.02?Math.min(LOOK,agl/-d.y):0;return[P.x+d.x*t,P.z+d.z*t];}
function update(){const C=camera.position;let nf=null;const fresh=pumpBakes(),lp=lookPoint();
 for(const X of T){const lx=C.x-X.F.x,lz=C.z-X.F.z,half=X.P.G.half,d=Math.max(Math.abs(lx),Math.abs(lz))-half;
  X.g.visible=d<FAR;
  const over=d<300&&C.y-X.F.sea<2500;
  if(over){const before=X.D.at;X.D.nearR=FULL_R;X.D.near([lp[0]-X.F.x,lp[1]-X.F.z]);
   if(X.D.at!==before||!X.full||(fresh&&performance.now()-HL.lastRebuild>400))hlod(X,X.D.at,true);X.full=true;nf=X.P.town;}
  else if(X.full){X.D.nearR=0;X.D.near([lx,lz],true);hlod(X,null,false);X.full=false;}}
 S.full=nf;if(nf&&ISLE.SIM&&ISLE.SIM.watched!==nf)ISLE.simWatch(nf);}   /* the town under the camera presented, the other abstract (P7d) */
/* verify.py's: every lot drawn exactly once (full, baked or massing) round the rings' centre; o.twice draws one twice (the negative) */
function hlodCheck(o){o=o||{};const X=T.find(x=>x.full);if(!X)return{ok:false,detail:'no town in full'};const D=X.D,seen=new Map();
 const add=(tag,how)=>{seen.set(tag,(seen.get(tag)||[]).concat(how));};
 D.inst.forEach(m=>(m.userData.lots||[]).forEach(t=>add(t,'full')));X.mid.forEach(m=>(m.userData.lots||[]).forEach(t=>add(t,'baked')));
 if(o.twice&&X.mid.length)add(X.mid[0].userData.lots[0],'baked');
 const fullIds=new Set();D.inst.forEach(m=>(m.userData.lots||[]).forEach(t=>fullIds.add(t)));
 D.recs.forEach((L,i)=>{D.massB.getMatrixAt(i,_m);if(_m.elements[0]!==0||_m.elements[5]!==0)add(L.tag,'massing');});
 let twice=0,none=0;const missing=[];D.recs.forEach(L=>{const s=seen.get(L.tag)||[];const u=[...new Set(s)];if(s.length>1&&!(u.length===1&&u[0]==='full'))twice++;if(!s.length){none++;missing.push(L.key);}});
 const st=X.stats||{};return{ok:!twice&&!none&&X.mid.length>0,detail:X.P.town+': '+D.recs.length+' lots, '+(st.full||0)+' full, '+(st.mid||0)+' baked, '+(st.massing||0)+' massing; vessels baked '+(st.vesselsBaked||0)+
  ' of '+X.ves.length+'; '+HL.bakes+' pieces baked in '+Math.round(HL.bakeMs)+' ms'+(twice?'; '+twice+' DRAWN TWICE':'')+(none?'; '+none+' NOT DRAWN ('+missing.slice(0,3).join(', ')+')':'')};}
HOST.TICKS.push(()=>update());
/* ---------------------------------------------------------------- the export: one town, in its frame */
let exportOff=[];
function exportTown(town){const P=W.select(town);if(!P)return null;const X=T.find(x=>x.P===P);
 if(typeof EXPORT==='undefined')return P;
 ISLE_EXPORT_FACTORY(X.g,X.D);   /* the city page's contributors (src/62), over this town's group and DRAW */
 const inner=ISLE.exportScene,F=X.F;
 ISLE.exportScene=ctx=>{X.g.position.set(0,0,0);X.g.updateMatrixWorld(true);X.mid.concat(X.vprox).forEach(m=>{m.visible=false;});X.ves.forEach(v=>{v.g.visible=true;});   /* the full pieces only: no proxy */
  try{return inner(ctx);}finally{X.g.position.set(F.x,F.sea,F.z);X.g.updateMatrixWorld(true);hlod(X,X.D.at,X.full);}};
 exportOff.forEach(f=>f());exportOff=[];
 EXPORT.ground({terrainH:(x,z)=>ISLE.cur.G.h(x,z),step:4});
 /* the city section: this town's plan alone (core/city's contributor exports every instance on the page, each in its frame) */
 exportOff.push(EXPORT.register('city',ctx=>{const C=KCITY.instances.find(c=>c.plan&&c.name===ISLE.cur.town);if(!C)return null;
  const prev=KCITY.cur;let Pp;try{Pp=C.export();}finally{if(prev)KCITY.bind(prev);}
  if(ctx.box){const lots=Pp.lots.length,ways=Pp.ways.length;Pp.lots=Pp.lots.filter(L=>ctx.inBox(L.x,L.z));
   Pp.ways=Pp.ways.filter(w=>w.pts.some(p=>ctx.inBox(p[0],p[1])));Pp.cropped={lots:[Pp.lots.length,lots],ways:[Pp.ways.length,ways]};}
  Pp.name=C.name;return{format:'krator-city',version:1,plans:[Pp],edits:null};},{by:'city'}));
 /* the stage: the world's lights, fog and sky from over the box, its ground's look moved into the town's frame */
 exportOff.push(EXPORT.register('stage',ctx=>{if(typeof KSTAGE==='undefined'||!ctx.box||!ISLE.cur)return null;
  const G=ISLE.cur.G,Fr=G.frame,b=ctx.box,cx=(b[0]+b[2])/2,cz=(b[1]+b[3])/2;
  const st=KSTAGE.capture({scene:HOST.scene,renderer:HOST.renderer,at:[cx+Fr.x,G.h(cx,cz)+Fr.sea+40,cz+Fr.z],sky:ctx.opt.sky==null?1024:ctx.opt.sky,
   skyNear:Math.min(b[2]-b[0],b[3]-b[1])/2,box:[b[0]+Fr.x,b[1]+Fr.z,b[2]+Fr.x,b[3]+Fr.z],step:ctx.opt.ground==null?4:ctx.opt.ground,ground:(x,z)=>WORLD.H(x,z)});
  if(st&&st.ground){const g=st.ground;g.x0-=Fr.x;g.z0-=Fr.z;
   if(g.uvFit){g.uvFit.u[2]+=g.uvFit.u[0]*Fr.x+g.uvFit.u[1]*Fr.z;g.uvFit.v[2]+=g.uvFit.v[0]*Fr.x+g.uvFit.v[1]*Fr.z;}}
  if(st&&st.sky&&st.sky.at)st.sky.at=[st.sky.at[0]-Fr.x,st.sky.at[1]-Fr.sea,st.sky.at[2]-Fr.z];
  if(st)st.frame={town:ISLE.cur.town,x:Fr.x,z:Fr.z,sea:Fr.sea,note:'captured in the world; the ground grid and the sky point are in the town frame'};
  return st;},{by:'isle'}));
 return P;}
const want=q.get('town'),first=W.plans.find(P=>P.town===want)||W.plans[0];
if(first){exportTown(first.town);if(ISLE.SIM)ISLE.simWatch(first.town);}   /* as the city page: the drawn town presented */
/* ?simAt=minute: the sim run to that minute first (the export's case: 362) */
const sa=+q.get('simAt');if(sa&&ISLE.SIM&&sa>ISLE.SIM.clock.m){try{ISLE.simRun(sa-ISLE.SIM.clock.m);}catch(e){S.errors.push('simAt: '+(e&&e.stack?e.stack:e));}}
/* ?town=: the camera starts looking at the town's built area (the first tick, after the start's own first view) */
let placed=!want||!first;
HOST.TICKS.push(()=>{if(placed||!START.ready&&START.frames<1)return;placed=true;const F=first.G.frame,Z=first.R.districts.find(d=>d.role==='zone');
 const c=Z?KCITY.lib.polyCentroid(Z.poly):[0,0],x=F.x+c[0],z=F.z+c[1];   /* the built area's middle, from the north-east */
 CAM.setView(x+700,z-900,420,0,-.3);CAM.lookAt(x,WORLD.H(x,z),z);});
HOST.TICKS.push(()=>{if(!window._ready&&START.ready)window._ready=true;});   /* tools/harness.py (export, smoke) waits for it */
S.ms=Math.round(performance.now()-t0);
window._isleTowns={stats:S,plan:W.stats,errors:S.errors,exportTown,hlod:HL,hlodCheck,rings:{FULL_R,MID_R,VES_R},
 towns:T.map(X=>({town:X.P.town,frame:X.F,census:X.P.census,checks:X.P.checks,failed:X.P.R.failed,missing:X.P.R.missing,draw:X.D.stats,lots:X.P.R.lots.length}))};
return{update,towns:T,exportTown,stats:S,hlod:HL,hlodCheck};})();});
