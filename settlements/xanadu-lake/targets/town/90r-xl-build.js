// ================================================================= THE LAKE TOWNS — the build: every building of the town's plan, chunk by chunk
// The plan's records (89zq XL_TOWN.place: the civic set, the works, the houses, the market's stalls) drawn with the Xanadu
// kit (VERN.place), each chunk baked into its own group and drawn while it is in view and in range (Phēr's runtime LOD);
// the flora over the town's mask; the entry flights where a door stands over its street. A builder draws a record; it
// decides nothing. [web]: three.js.
reseed((XL.seed(XLK)>>>8)+2);const XL_B0=performance.now();
const xlD=(v,d)=>v==null?d:v;
const XL_CHUNK=160,XL_CHUNKS={},XL_FAILS=[];
for(const p of XLT.place){const k=p.ruin?'ruin:'+Math.floor(p.x/XL_CHUNK)+','+Math.floor(p.z/XL_CHUNK):p.kind==='civic'||p.kind==='work'?'civic':p.kind==='stall'?'stall':Math.floor(p.x/XL_CHUNK)+','+Math.floor(p.z/XL_CHUNK);(XL_CHUNKS[k]=XL_CHUNKS[k]||[]).push(p);}
const XL_GROUPS=[];let XL_INST=0;
function xlBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.ruin?Object.assign({},p.o,{ground:terrainH}):p.o);}catch(e){XL_FAILS.push(p.key+': '+(e&&e.message||e));}   /* a ruin follows the page's ground (88h) */
  if(g)p.G=g;else XL_FAILS.push(p.id+' '+p.key+': not placed');
  for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-40);x1=Math.max(x1,p.x+40);z0=Math.min(z0,p.z-40);z1=Math.max(z1,p.z+40);y0=Math.min(y0,xlD(p.o.y,0)-xlD(p.drop,0)-3);y1=Math.max(y1,xlD(p.o.y,0)+xlD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();XL_INST+=xlD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='civic'?1e9:2200,n:list.length};XL_GROUPS.push(e);return e;}
for(const k of Object.keys(XL_CHUNKS).sort())xlBakeChunk(k,XL_CHUNKS[k]);
// every ruined structure watched by core/ruins (the owner, 2026-11-10): each ruin chunk once it is baked, on the page's ground;
// the verify harness asserts nothing floats and every wreck lies on its lowest points
let XL_RUINS_WATCHED=0;
if(typeof KRUINS!=='undefined'&&KRUINS.watch)for(const e of XL_GROUPS)if(e.key.startsWith('ruin:')){KRUINS.watch(e.G,{name:XLT.name+': the old town, chunk '+e.key.slice(5),ground:terrainH});XL_RUINS_WATCHED++;}
window._instances=XL_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const xlFr=new THREE.Frustum(),xlPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();xlPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);xlFr.setFromProjectionMatrix(xlPm);const P=camera.position;let shown=0;
 for(const e of XL_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&xlFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu biome over the town's mask (89zq: the ravine, the slope's grass, a tree in a yard), then
// baked with the builders' own plants; its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1100,quality:.8,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
// ---------------------------------------------------------------- the entry flights: a door above its street gets its steps
// On the slope core/city's 'high' stance sets a house's floor at its plot's highest corner, so a door on the downhill face
// stands above the ground in front of it: every door (KDOOR.list) whose sill is more than XL_FLIGHT_MIN over the ground 0.3 m
// in front of it gets a stone flight straight out from it (0.17 m risers on 0.3 m treads), one merged mesh, and each a rising
// strip in core/walk (KWALK.strip) so the walker goes up it (settlements/pher/targets/town/90r-ph-build.js, the same rule)
const XL_FLIGHT_MIN=.3;
(function xlFlights(){if(typeof KDOOR==='undefined'||!KDOOR.list)return;const boxes=[],T3=THREE;let n=0,tall=0;
 for(const D of KDOOR.list){const ox=Math.sin(D.yaw),oz=Math.cos(D.yaw),sx=D.at[0]+ox*.3,sz=D.at[2]+oz*.3;
  let gy=terrainH(sx,sz),rise=D.at[1]-gy;if(!(rise>XL_FLIGHT_MIN)||rise>4)continue;
  let run=rise/.17*.3;gy=terrainH(sx+ox*run,sz+oz*run);rise=D.at[1]-gy;if(!(rise>XL_FLIGHT_MIN)||rise>4)continue;run=rise/.17*.3;
  const steps=Math.max(2,Math.round(rise/.17)),w=Math.max(1.2,(D.w==null?1:D.w)+.6);
  for(let k=0;k<steps;k++){const d=.3+(k+.5)*run/steps,h=rise*(steps-k)/steps;boxes.push([sx-ox*.3+ox*d,gy+h/2-.15,sz-oz*.3+oz*d,w,h+.3,run/steps+.02,D.yaw]);}
  if(typeof KWALK!=='undefined')KWALK.strip({a:[sx+ox*run,sz+oz*run,gy],b:[sx,sz,D.at[1]],w,name:'flight:'+D.id,tag:'xanadu-lake.flight'});
  n++;if(rise>1.2)tall++;}
 if(boxes.length){const geo=new T3.BoxGeometry(1,1,1),M=new T3.InstancedMesh(geo,new T3.MeshStandardMaterial({color:0x9a8f80,roughness:.9}),boxes.length),m4=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler();
  boxes.forEach((b,i)=>{q.setFromEuler(e.set(0,b[6],0));m4.compose(new T3.Vector3(b[0],b[1],b[2]),q,new T3.Vector3(b[3],b[4],b[5]));M.setMatrixAt(i,m4);});
  M.instanceMatrix.needsUpdate=true;M.name='entry flights';M.userData.probeSkip=true;scene.add(M);}
 window._xl.flights={n,tall,steps:boxes.length};})();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=XL_GROUPS.length;window._buildMs=Math.round(performance.now()-XL_B0);
Object.assign(window._xl,{chunks:XL_GROUPS.length,ruinsWatched:XL_RUINS_WATCHED,fails:XL_FAILS.slice(0,20),failed:XL_FAILS.length,
 byKind:XLT.place.reduce((a,p)=>{a[p.kind]=xlD(a[p.kind],0)+1;return a;},{}),byQuarter:XLT.place.reduce((a,p)=>{if(p.quarter)a[p.quarter]=xlD(a[p.quarter],0)+1;return a;},{})});
