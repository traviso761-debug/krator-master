// ================================================================= KIRSTABAL — the build: the mole's body, then every record, chunk by chunk
// Order: the harbour mole's stone body (a rubble bank from the lake's bed to under the quays laid along its top); then every
// record of 89zk (the town's lots and landmarks, the harbour's quays, the lighthouse, the boat sheds and the barge, the latex
// house's walls, the serai, the White Monastery's house, the north gate, the bridge over Keb Riwa, the ring's villages), each a
// normal Xanadu kit piece drawn by VERN.place on its stance (o.y, o.drop: a footing to the lowest corner); a core/hamlet
// record whose key the kit lacks is a stand-in at its box. Chunk by chunk (400 m; each ring village its own), each chunk baked
// into its own group and drawn while in view and range (Qiblai's and Erewhon's runtime LOD). [web]: three.js.
reseed(41620);const KS_B0=performance.now();
// ---------------------------------------------------------------- the mole: a rubble bank under its quays
if(KS_PLAN)for(const M of KS_PLAN.moles){const dx=M.b[0]-M.a[0],dz=M.b[1]-M.a[1],L=Math.hypot(dx,dz),mx=(M.a[0]+M.b[0])/2,mz=(M.a[1]+M.b[1])/2,
 ry=Math.atan2(dz/L,-dx/L),bed=Math.min(KS_GROUND.h(M.a[0],M.a[1]),KS_GROUND.h(mx,mz),KS_GROUND.h(M.b[0],M.b[1]))-1;
 vB('xRubB',mx,bed,mz,L+M.w,M.top-bed,M.w+4,ry,xC(0x8a8070));}
// ---------------------------------------------------------------- the build, chunk by chunk
const KS_CHUNK=400,KS_CHUNKS={};
for(const p of KS_PLACE){const k=p.kind==='ring'?'ring:'+p.village:(p.kind==='bridge'?'bridge':(p.kind==='wall'?'wall:':'')+Math.floor(p.x/KS_CHUNK)+','+Math.floor(p.z/KS_CHUNK));(KS_CHUNKS[k]=KS_CHUNKS[k]||[]).push(p);}
const KS_GROUPS=[];let KS_INST=0,KS_STANDINS=0;
/* K5, the interiors (?interiors=1, Xanadu's mode: settlements/xanadu 89y): only the governor's house, the Two Horns' factor
   house, the serai, the tea factory and the latex house are drawn hollow and furnished (their items: kits/interiors/sets/xanadu.js
   and kits/xanadu 87k1); every other placement is built with the mode off, as it always is */
const KS_IX=['ks.seat','ks.horns','ks.serai','ks.tea','ks.latex'],ksIxOn=typeof XAF!=='undefined'&&!!XAF.interiors;
function ksPlace(G,p){if(!ksIxOn||KS_IX.indexOf(p.id)>=0)return VERN.place(G,p.key,p.x,p.z,p.ry,p.o);
 const a=XAF.interiors,b=VERN.interiors;XAF.interiors=false;VERN.interiors=null;try{return VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}finally{XAF.interiors=a;VERN.interiors=b;}}
function ksBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  if(VERN.defs[p.key])g=ksPlace(G,p);
  else{vB('xEarthB',p.x,p.o.y-p.o.drop,p.z,ksD(p.w,8),ksD(p.h,4)+p.o.drop,ksD(p.d,8),p.ry,xC(0xb8a890));KS_STANDINS++;}   /* a core/hamlet record the kit lacks */
  if(g)p.G=g;for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,p.o.y-ksD(p.o.drop,0));y1=Math.max(y1,p.o.y+ksD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();KS_INST+=ksD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='bridge'||/^wall:/.test(key)?9000:/^ring:/.test(key)?7000:2600,n:list.length};KS_GROUPS.push(e);return e;}
/* the mole's banks first (their own chunk: drawn with the harbour), then the records */
{const G=new THREE.Group();G.name='chunk:mole';scene.add(G);kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
 KS_GROUPS.push({G,key:'mole',sphere:new THREE.Sphere(new THREE.Vector3(-560,0,-80),520),range:6000,n:KS_PLAN?KS_PLAN.moles.length:0});}
for(const k of Object.keys(KS_CHUNKS).sort())ksBakeChunk(k,KS_CHUNKS[k]);
/* K5's entry flights: a building stands at its highest corner on a footing (89zk ksStance), so on the apron's slope a door's
   sill is above the ground outside it; each unlocked door of the five gets a flight of steps down to the ground (the kit's
   xnFlight, which 89y also lays into core/walk as a strip), in a group of its own */
if(ksIxOn){const G=new THREE.Group();G.name='chunk:flights';scene.add(G);const K5=KS_PLACE.filter(p=>KS_IX.indexOf(p.id)>=0);let nf=0;
 for(const D of KDOOR.list){if(D.locked||!K5.some(p=>Math.hypot(D.at[0]-p.x,D.at[2]-p.z)<36))continue;
  const sx=Math.sin(D.yaw),sz=Math.cos(D.yaw);
  /* the threshold: the doorway's own floor, level with the sill, across the wall (the walk had none between the top step and
     the room's floor band, and the ground under it lies below a step) */
  KWALK.strip({a:[D.at[0]+sx*.5,D.at[2]+sz*.5,D.at[1]],b:[D.at[0]-sx*.5,D.at[2]-sz*.5,D.at[1]],w:Math.max(.6,D.w),name:'ks threshold',tag:'interior:ks-threshold'});
  const r0=D.at[1]-terrainH(D.at[0]+sx*.8,D.at[2]+sz*.8);if(r0<.22)continue;
  const n=Math.max(2,Math.round(r0/.17)),run=n*.34,fx=D.at[0]+sx*run,fz=D.at[2]+sz*run,gy=terrainH(fx,fz);
  xnFlight(fx,gy,fz,D.yaw,D.w+.6,D.at[1]-gy,'vStone',xC(0x9a9080));nf++;}
 kbake(G);for(const n in KIT.items)KIT.items[n].length=0;KS_GROUPS.push({G,key:'flights',sphere:new THREE.Sphere(new THREE.Vector3(0,0,400),900),range:3000,n:nf});window._ksFlights=nf;}
if(typeof xaIxWalk==='function')xaIxWalk();   /* with the interiors on: the doors' walk blocks, once every chunk is built (89y; Erewhon's 90b does the same) */
window._instances=KS_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const ksFr=new THREE.Frustum(),ksPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();ksPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);ksFr.setFromProjectionMatrix(ksPm);const P=camera.position;let shown=0;
 for(const e of KS_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&ksFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the avenues' and the main streets' trees (the owner, 2026-11-16: "add some gardens and foliage"): palms down the avenues (the
// quay street, the Lamp Way, the works road), shade trees along the main streets, one each side every 14 m (avenues) or 20 m,
// 2.2 m out from the kerb, where no building, other street, the water or the quays stand; the kit's xaPlant (the Vale's garden
// species, baked with the kit's own plants below)
const KS_STREET_TREES={n:0,skipped:0};
if(KS_PLAN&&typeof xaPlant==='function'){reseed(41626);
 const clear=(x,z)=>{if(KS_GROUND.h(x,z)<1.6)return false;
  for(const s of KS_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+1.2)return false;
  for(const p of KS_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(D&&Math.hypot(x-p.x,z-p.z)<Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5)return false;}
  const u=KS_GROUND.u(x,z),v=KS_GROUND.v(x,z);return !(v<44&&u>KS_GROUND.HARBOUR.u0-30&&u<KS_GROUND.HARBOUR.u1+30);};   /* not on the harbour's apron */
 for(const w of KS_PLAN.ways){if(w.cls!=='avenue'&&w.cls!=='main')continue;const av=w.cls==='avenue',step=av?14:20,off=w.w/2+2.2;let carry=step/2;
  for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
   let t=carry;for(;t<L;t+=step)for(const sd of[-1,1]){const x=a[0]+ux*t-uz*off*sd,z=a[1]+uz*t+ux*off*sd;
     if(!clear(x,z)){KS_STREET_TREES.skipped++;continue;}
     if(xaPlant(av?'palm':'tree',x,KS_GROUND.h(x,z),z,av?rr(8,11):rr(6,8.5)))KS_STREET_TREES.n++;}
   carry=t-L;}}}
window._ksStreetTrees=KS_STREET_TREES;
// the page's own (vendored) biome: only the plants the kit's builders set in their gardens and courts (xaPlant), baked. The
// country's flora is the Rift floor's (90m-ks-flora.js: the Rift kit on today's core/biome), not the Vale's (XANADU.build is not run)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=KS_GROUPS.length;window._buildMs=Math.round(performance.now()-KS_B0);
window._kirstabal=Object.assign(window._kirstabalPlan||{},{placed:KS_PLACE.length,chunks:KS_GROUPS.length,standins:KS_STANDINS,water:window._ksWater||null,
 byKind:KS_PLACE.reduce((a,p)=>{a[p.kind]=ksD(a[p.kind],0)+1;return a;},{})});
