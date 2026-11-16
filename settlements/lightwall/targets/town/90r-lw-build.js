// ================================================================= LĀIṬWĀL — the bench's buildings: the Xanadui town, chunk by chunk (PLAN.md 3, 8)
// Every record of 89zl's LW_PLACE (frontage-courts' lots, the landmarks placed by hand, the fields' farmhouses) drawn through
// the Xanadu and Qiblai kits (VERN.place), as Qiblai's 90r: on a slope a building stands at its footprint's highest corner
// (core/city's stance 'high') on a footing of dressed stone down to its lowest; chunk by chunk (400 m), each chunk baked into its
// own group and drawn while in view and range. [web]: three.js.
reseed(LW.SEED+2);const LW_B0=performance.now();
const LW_CHUNK=400,LW_CHUNKS={};
for(const p of LW_PLACE){const k=Math.floor(p.x/LW_CHUNK)+','+Math.floor(p.z/LW_CHUNK);(LW_CHUNKS[k]=LW_CHUNKS[k]||[]).push(p);}
const LW_GROUPS=[];let LW_INST=0;
function lwBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){const D=VERN.defs[p.key];
  /* the footing: dressed stone from the building's floor down to the lowest corner of its footprint */
  const lo=p.drop&&p.drop.lo!=null?p.drop.lo:null,y=lwD(p.o.y,0);
  if(D&&lo!=null&&y-lo>.25){TSTAT.cur='lw_footing/0';vB('qAshB',p.x,lo-.4,p.z,D.w+.3,y-lo+.4,D.d+.3,p.ry,xC(xPick(QSTONE)));}
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);if(g)p.G=g;for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,y-10);y1=Math.max(y1,y+lwD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();LW_INST+=lwD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:2600,n:list.length};LW_GROUPS.push(e);return e;}
for(const k of Object.keys(LW_CHUNKS).sort())lwBakeChunk(k,LW_CHUNKS[k]);
window._instances=LW_INST;
/* the runtime LOD: a chunk is drawn while it is in the view and within its range */
const lwFr=new THREE.Frustum(),lwPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();lwPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);lwFr.setFromProjectionMatrix(lwPm);const P=camera.position;let shown=0;
 for(const e of LW_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&lwFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
/* the flora: the Vale of Xanadu biome over the town's mask (89zl), then baked with the builders' own plants (xaPlant); its LOD
   ticks with the chunks' */
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:1300,quality:.7,lakeHue:typeof XANADU_LAKE!=='undefined'?XANADU_LAKE.hue:undefined});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=LW_GROUPS.length;window._buildMs=Math.round(performance.now()-LW_B0);
window._lightwall=Object.assign({},window._lightwallPlan,{wall:window._lightwallWall,placed:LW_PLACE.length,chunks:LW_GROUPS.length,
 byKind:LW_PLACE.reduce((a,p)=>{a[p.kind]=lwD(a[p.kind],0)+1;return a;},{})});
