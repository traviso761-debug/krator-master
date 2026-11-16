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
for(const p of KS_PLACE){const k=p.kind==='ring'?'ring:'+p.village:(p.kind==='bridge'?'bridge':Math.floor(p.x/KS_CHUNK)+','+Math.floor(p.z/KS_CHUNK));(KS_CHUNKS[k]=KS_CHUNKS[k]||[]).push(p);}
const KS_GROUPS=[];let KS_INST=0,KS_STANDINS=0;
function ksBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  if(VERN.defs[p.key])g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);
  else{vB('xEarthB',p.x,p.o.y-p.o.drop,p.z,ksD(p.w,8),ksD(p.h,4)+p.o.drop,ksD(p.d,8),p.ry,xC(0xb8a890));KS_STANDINS++;}   /* a core/hamlet record the kit lacks */
  if(g)p.G=g;for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,p.o.y-ksD(p.o.drop,0));y1=Math.max(y1,p.o.y+ksD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();KS_INST+=ksD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='bridge'?9000:/^ring:/.test(key)?7000:2600,n:list.length};KS_GROUPS.push(e);return e;}
/* the mole's banks first (their own chunk: drawn with the harbour), then the records */
{const G=new THREE.Group();G.name='chunk:mole';scene.add(G);kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
 KS_GROUPS.push({G,key:'mole',sphere:new THREE.Sphere(new THREE.Vector3(-560,0,-80),520),range:6000,n:KS_PLAN?KS_PLAN.moles.length:0});}
for(const k of Object.keys(KS_CHUNKS).sort())ksBakeChunk(k,KS_CHUNKS[k]);
window._instances=KS_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const ksFr=new THREE.Frustum(),ksPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();ksPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);ksFr.setFromProjectionMatrix(ksPm);const P=camera.position;let shown=0;
 for(const e of KS_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&ksFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the page's own (vendored) biome: only the plants the kit's builders set in their gardens and courts (xaPlant), baked. The
// country's flora is the Rift floor's (90m-ks-flora.js: the Rift kit on today's core/biome), not the Vale's (XANADU.build is not run)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=KS_GROUPS.length;window._buildMs=Math.round(performance.now()-KS_B0);
window._kirstabal=Object.assign(window._kirstabalPlan||{},{placed:KS_PLACE.length,chunks:KS_GROUPS.length,standins:KS_STANDINS,water:window._ksWater||null,
 byKind:KS_PLACE.reduce((a,p)=>{a[p.kind]=ksD(a[p.kind],0)+1;return a;},{})});
