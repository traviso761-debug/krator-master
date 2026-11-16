// ================================================================= PHĒR — the build: every building of the plan, chunk by chunk
// The plan's records (89zp: both levels' lots, the civic pieces, the stalls on the avenue's turns) drawn with the Xanadu
// kit (VERN.place), each chunk baked into its own group and drawn while it is in view and in range (Qiblai's runtime LOD).
// A builder draws a record; it decides nothing. [web]: three.js.
reseed(PH.SEED+2);const PH_B0=performance.now();
const phD=(v,d)=>v==null?d:v;
const PH_CHUNK=300,PH_CHUNKS={};
for(const p of PH_PLACE){const k=p.kind==='civic'?'civic:'+p.level:Math.floor(p.x/PH_CHUNK)+','+Math.floor(p.z/PH_CHUNK);(PH_CHUNKS[k]=PH_CHUNKS[k]||[]).push(p);}
const PH_GROUPS=[];let PH_INST=0;const PH_FAILS=[];
function phBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  try{g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);}catch(e){PH_FAILS.push(p.key+': '+(e&&e.message||e));}
  if(g)p.G=g;else PH_FAILS.push(p.id+' '+p.key+': not placed');
  for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,phD(p.o.y,0)-phD(p.drop,0));y1=Math.max(y1,phD(p.o.y,0)+phD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();PH_INST+=phD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key.startsWith('civic')?1e9:2600,n:list.length};PH_GROUPS.push(e);return e;}
for(const k of Object.keys(PH_CHUNKS).sort())phBakeChunk(k,PH_CHUNKS[k]);
window._instances=PH_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const phFr=new THREE.Frustum(),phPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();phPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);phFr.setFromProjectionMatrix(phPm);const P=camera.position;let shown=0;
 for(const e of PH_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&phFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu biome over the town's mask (89zp: the ravine, the headland, the wall's grass, a tree in a yard),
// then baked with the builders' own plants (xaPlant: the houses' garden trees); its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1700,quality:.8,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=PH_GROUPS.length;window._buildMs=Math.round(performance.now()-PH_B0);
Object.assign(window._pher,{chunks:PH_GROUPS.length,fails:PH_FAILS.slice(0,20),failed:PH_FAILS.length,
 byKind:PH_PLACE.reduce((a,p)=>{a[p.kind]=phD(a[p.kind],0)+1;return a;},{}),byLevel:PH_PLACE.reduce((a,p)=>{a[p.level]=phD(a[p.level],0)+1;return a;},{})});
