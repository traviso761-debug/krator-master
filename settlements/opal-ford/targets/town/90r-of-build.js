// ================================================================= ŌPAL-PHŌRḌ — the build: every building of the plan, chunk by chunk
// The plan's records (89zp: the town's lots, the hosts, the terraces and farmsteads, the footbridge, the dugouts) drawn with the
// Xanadu kit (VERN.place), each chunk baked into its own group and drawn while it is in view and in range (Phēr's runtime LOD).
// Then the works the kit has no piece for, from the plan's records (OF_WORKS): the paved ford (a causeway under the slack water,
// stepping stones beside it; xa_ford is owed, KNOWN_ISSUES.md), the mill's weir across the river, the fish weirs' stake fences.
// A builder draws a record; it decides nothing. [web]: three.js.
reseed(OF.SEED+2);const OF_B0=performance.now();
const OF_CHUNK=300,OF_CHUNKS={};
for(const p of OF_PLACE){const k=p.kind==='house'?Math.floor(p.x/OF_CHUNK)+','+Math.floor(p.z/OF_CHUNK):p.kind+':'+Math.floor(p.z/600);(OF_CHUNKS[k]=OF_CHUNKS[k]||[]).push(p);}
const OF_GROUPS=[];let OF_INST=0;const OF_FAILS=[];
function ofBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}catch(e){OF_FAILS.push(p.key+': '+(e&&e.message||e));}
  if(g)p.G=g;else OF_FAILS.push(p.id+' '+p.key+': not placed');
  for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,ofD(p.o.y,0)-ofD(p.drop,0));y1=Math.max(y1,ofD(p.o.y,0)+ofD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();OF_INST+=ofD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key.startsWith('civic')?1e9:2600,n:list.length};OF_GROUPS.push(e);return e;}
for(const k of Object.keys(OF_CHUNKS).sort())ofBakeChunk(k,OF_CHUNKS[k]);
window._instances=OF_INST;
const ofFr=new THREE.Frustum(),ofPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();ofPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);ofFr.setFromProjectionMatrix(ofPm);const P=camera.position;let shown=0;
 for(const e of OF_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&ofFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// ---------------------------------------------------------------- the works the kit lacks: boxes from the plan's records
(function ofWorksDraw(){const T3=THREE,W=OF_WORKS,stone=[],wood=[],K=KRAND.stream(KRAND.child(OF.SEED,'works'));
 // the ford: the causeway's paving just under the water, its kerbs, and the stepping stones on its upstream side
 const F=W.ford,fl=F.x1-F.x0,fw=ofW(F.z);stone.push([(F.x0+F.x1)/2,fw+F.top-.3,F.z,fl,.6,F.w,0]);
 for(const s of[-1,1])stone.push([(F.x0+F.x1)/2,fw+F.top-.15,F.z+s*(F.w/2+.2),fl,.5,.4,0]);
 for(let x=F.x0+1;x<F.x1-1;x+=F.stones.step){const j=(K.next()-.5)*.25;stone.push([x+j,fw+F.stones.top-.35,F.z+F.w/2+1.1,.9+K.next()*.25,.7,.9+K.next()*.2,K.next()*.6]);}
 // the mill's weir: a low wall of dressed stone across the river, its top half a metre over the water above it
 const Wr=W.weir,ww=ofW(Wr.z);stone.push([(Wr.x0+Wr.x1)/2,ww+Wr.top-1.6,Wr.z,Wr.x1-Wr.x0,3.2,Wr.w,0]);
 // the fish weirs: stake fences in a V down the current, a stake every 0.8 m, standing a metre over the water
 for(const f of W.fishWeirs){const w=ofW(f.z);for(let i=1;i<f.pts.length;i++){const a=f.pts[i-1],b=f.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let s=0;s<=L;s+=.8){const x=a[0]+(b[0]-a[0])*s/L,z=a[1]+(b[1]-a[1])*s/L,bed=ofH(x,z),top=w+1+K.next()*.3;wood.push([x,(bed+top)/2,z,.12,top-bed,.12,K.next()*3]);}}}
 const mk=(list,color,rough,name)=>{if(!list.length)return;const M=new T3.InstancedMesh(new T3.BoxGeometry(1,1,1),new T3.MeshStandardMaterial({color,roughness:rough}),list.length),m4=new T3.Matrix4(),q=new T3.Quaternion(),eu=new T3.Euler();
  list.forEach((b,i)=>{q.setFromEuler(eu.set(0,b[6],0));m4.compose(new T3.Vector3(b[0],b[1],b[2]),q,new T3.Vector3(b[3],b[4],b[5]));M.setMatrixAt(i,m4);});
  M.instanceMatrix.needsUpdate=true;M.name=name;M.userData.probeSkip=true;scene.add(M);};
 mk(stone,0x9a9484,.9,'the ford and the weir');mk(wood,0x6b5640,.95,'the fish weirs');
 window._opalford.works={stone:stone.length,stakes:wood.length};})();
// ---------------------------------------------------------------- the flora: the Vale of Xanadu biome over the town's mask (89zp)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1900,quality:.8,lakeHue:typeof XANADU_LAKE!=='undefined'?XANADU_LAKE.hue:undefined});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=OF_GROUPS.length;window._buildMs=Math.round(performance.now()-OF_B0);
Object.assign(window._opalford,{day:OF_DAY,chunks:OF_GROUPS.length,fails:OF_FAILS.slice(0,20),failed:OF_FAILS.length,
 byKind:OF_PLACE.reduce((a,p)=>{a[p.kind]=ofD(a[p.kind],0)+1;return a;},{})});
