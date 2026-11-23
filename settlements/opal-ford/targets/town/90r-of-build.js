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
  /* the Iridescent Order's buildings list their storey stacks while drawn (kits/qiblai 89q5s): 90s walks into them */
  const rec=p.kind==='order'&&typeof QB_SHELLREC!=='undefined';if(rec){p.stacks=[];QB_SHELLREC.cur=p.stacks;}
  try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}catch(e){OF_FAILS.push(p.key+': '+(e&&e.message||e));}
  if(rec)QB_SHELLREC.cur=null;
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
 // (the ford is the kit's piece now: kits/xanadu/extra/88j xa_ford, placed by 89zp)
 // the Spray Stair (the Iridescent Order's house, 89zp OF_HOUSE.stairs): flights of 0.17 m risers down each riser between the
 // graded platforms, from the Bow Terrace to the pool's ledge; each a rising strip in core/walk so the walker goes down it
 let nStair=0;for(const S of(OF_HOUSE?OF_HOUSE.stairs:[])){const rise=S.yTop-S.yBot,n=Math.max(2,Math.round(rise/.17)),run=(S.xTop-S.xBot)/n;
  for(let k=0;k<n;k++){const top=S.yTop-rise*(k+1)/n+rise/n,x=S.xTop-(k+.5)*run;stone.push([x,(top+S.yBot-.3)/2,S.z,Math.abs(run)+.02,top-S.yBot+.3,S.w,0]);nStair++;}
  if(typeof KWALK!=='undefined')KWALK.strip({a:[S.xBot,S.z,S.yBot],b:[S.xTop,S.z,S.yTop],w:S.w,name:'stair:'+S.id,tag:'opalford.stair'});}
 window._opalford.stairSteps=nStair;
 // the mill's weir: a low wall of dressed stone across the river, its top half a metre over the water above it
 const Wr=W.weir,ww=ofW(Wr.z);stone.push([(Wr.x0+Wr.x1)/2,ww+Wr.top-1.6,Wr.z,Wr.x1-Wr.x0,3.2,Wr.w,0]);
 // the fish weirs: stake fences in a V down the current, a stake every 0.8 m, standing a metre over the water
 for(const f of W.fishWeirs){const w=ofW(f.z);for(let i=1;i<f.pts.length;i++){const a=f.pts[i-1],b=f.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  for(let s=0;s<=L;s+=.8){const x=a[0]+(b[0]-a[0])*s/L,z=a[1]+(b[1]-a[1])*s/L,bed=ofH(x,z),top=w+1+K.next()*.3;wood.push([x,(bed+top)/2,z,.12,top-bed,.12,K.next()*3]);}}}
 // the ferry's rope: a post on each bank at the raft's mooring (89zp), the hawser between them over the water, the raft's own
 // line runs on it when the ford is shut
 const rope=[];{const raft=OF_PLACE.find(p=>p.key==='xa_ferry_raft');if(raft){const z=raft.z,c=ofRiverX(z),hw=ofHW(z),xs=[c-hw-4,c+hw+4],top=[];
  for(const x of xs){const g=ofH(x,z),h=3.6;wood.push([x,g+h/2-.4,z,.3,h+.8,.3,0]);top.push(g+h-.2);}
  const y=Math.min(top[0],top[1])-.3;rope.push([(xs[0]+xs[1])/2,y,z,xs[1]-xs[0],.06,.06,0]);}}
 const mk=(list,color,rough,name)=>{if(!list.length)return;const M=new T3.InstancedMesh(new T3.BoxGeometry(1,1,1),new T3.MeshStandardMaterial({color,roughness:rough}),list.length),m4=new T3.Matrix4(),q=new T3.Quaternion(),eu=new T3.Euler();
  list.forEach((b,i)=>{q.setFromEuler(eu.set(0,b[6],0));m4.compose(new T3.Vector3(b[0],b[1],b[2]),q,new T3.Vector3(b[3],b[4],b[5]));M.setMatrixAt(i,m4);});
  M.instanceMatrix.needsUpdate=true;M.name=name;M.userData.probeSkip=true;scene.add(M);};
 mk(stone,0x9a9484,.9,'the weir and the Spray Stair');mk(wood,0x6b5640,.95,'the fish weirs and the ferry\'s posts');mk(rope,0x5a4a36,.9,'the ferry\'s rope');
 window._opalford.ferryRope=rope.length;
 window._opalford.works={stone:stone.length,stakes:wood.length};})();
// ---------------------------------------------------------------- the flora: the Vale of Xanadu biome over the town's mask (89zp)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1900,quality:.8,lakeHue:typeof XANADU_LAKE!=='undefined'?XANADU_LAKE.hue:undefined});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
// ---------------------------------------------------------------- the entry flights: a door above its ground gets its steps
// As Phēr's (settlements/pher 90r): core/city's 'high' stance sets a floor at its plot's highest corner, so on the riser (the toll
// house, the Tears' post) and on the platforms' edges a door can stand over the ground in front of it, which a walker cannot step
// up (the interiors' audit steps 0.45 m). Every door (KDOOR.list) whose sill is more than OF_FLIGHT_MIN over the ground 0.3 m out
// gets a stone flight straight out from it, 0.17 m risers on 0.3 m treads; one merged mesh, each flight a strip in core/walk.
const OF_FLIGHT_MIN=.3;
/* only an outside door gets a flight: KDOOR.list holds every door, the rooms' own and the upper storeys' too, so a door whose
   ground 0.3 m out or whose flight's foot falls within a building's footprint (an inner door) is left, and so is one more than
   OF_FLIGHT_MAX over its ground (an upper storey's) */
const OF_FLIGHT_MAX=2;
(function ofFlights(){if(typeof KDOOR==='undefined'||!KDOOR.list)return;const boxes=[],T3=THREE;let n=0,tall=0;
 const SP=KCITY.lib.KSPACE.create({cell:40});for(const p of OF_PLACE)SP.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1);
 const inside=(x,z)=>SP.query(x,z,.5).some(p=>Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+.2&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+.2);
 for(const D of KDOOR.list){const ox=Math.sin(D.yaw),oz=Math.cos(D.yaw),sx=D.at[0]+ox*.3,sz=D.at[2]+oz*.3;
  let gy=ofH(sx,sz),rise=D.at[1]-gy;if(!(rise>OF_FLIGHT_MIN)||rise>OF_FLIGHT_MAX)continue;
  let run=rise/.17*.3;gy=ofH(sx+ox*run,sz+oz*run);rise=D.at[1]-gy;if(!(rise>OF_FLIGHT_MIN)||rise>OF_FLIGHT_MAX)continue;run=rise/.17*.3;   /* the foot's own ground */
  if(inside(sx+ox*run,sz+oz*run))continue;   /* an inner door: its flight would stand in a room */
  const steps=Math.max(2,Math.round(rise/.17)),w=Math.max(1.2,(D.w==null?1:D.w)+.6);
  for(let k=0;k<steps;k++){const d=.3+(k+.5)*run/steps,h=rise*(steps-k)/steps;boxes.push([sx-ox*.3+ox*d,gy+h/2-.15,sz-oz*.3+oz*d,w,h+.3,run/steps+.02,D.yaw]);}
  if(typeof KWALK!=='undefined')KWALK.strip({a:[sx+ox*run,sz+oz*run,gy],b:[sx,sz,D.at[1]],w,name:'flight:'+D.id,tag:'opalford.flight'});
  n++;if(rise>1.2)tall++;}
 if(boxes.length){const M=new T3.InstancedMesh(new T3.BoxGeometry(1,1,1),new T3.MeshStandardMaterial({color:0x9a8f80,roughness:.9}),boxes.length),m4=new T3.Matrix4(),q=new T3.Quaternion(),e=new T3.Euler();
  boxes.forEach((b,i)=>{q.setFromEuler(e.set(0,b[6],0));m4.compose(new T3.Vector3(b[0],b[1],b[2]),q,new T3.Vector3(b[3],b[4],b[5]));M.setMatrixAt(i,m4);});
  M.instanceMatrix.needsUpdate=true;M.name='entry flights';M.userData.probeSkip=true;scene.add(M);}
 window._opalford.flights={n,tall,steps:boxes.length};})();
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=OF_GROUPS.length;window._buildMs=Math.round(performance.now()-OF_B0);
Object.assign(window._opalford,{day:OF_DAY,chunks:OF_GROUPS.length,fails:OF_FAILS.slice(0,20),failed:OF_FAILS.length,
 byKind:OF_PLACE.reduce((a,p)=>{a[p.kind]=ofD(a[p.kind],0)+1;return a;},{})});
