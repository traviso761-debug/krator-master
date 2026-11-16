// ================================================================= THALABA — the build: the plan's buildings, the Dalab mission's yard wall
// Every building of the plan (89zt: the infill's lots, the civic buildings round the square, the orchards' gardens), chunk by
// chunk, each chunk baked into its own group and drawn while it is in view and in range (Erewhon's and Qiblai's runtime LOD);
// the Dalab mission's pieces are the Dalab set's (89zt places them with the civic buildings); here only its yard wall round its
// block, a gate toward the town; the flora last, over the plan's mask. [web]: three.js.
reseed(TB.SEED+2);const TB_B0=performance.now();
const TB_CHUNK=300,TB_CHUNKS={};
for(const p of TB_PLACE){const k=p.kind==='house'?Math.floor(p.x/TB_CHUNK)+','+Math.floor(p.z/TB_CHUNK):'civic';(TB_CHUNKS[k]=TB_CHUNKS[k]||[]).push(p);}
const TB_GROUPS=[];let TB_INST=0;
function tbBakeChunk(key,list,extra){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);if(g)p.G=g;
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;if(p.name&&i===r0)REG[i].name=p.name;}
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,tbD(p.o.y,0));y1=Math.max(y1,tbD(p.o.y,0)+tbD(p.h,12));}
 if(extra)extra();
 TSTAT.cur=null;kbake(G);xaDoorsBind();TB_INST+=tbD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='civic'?1e9:2600,n:list.length};TB_GROUPS.push(e);return e;}
for(const k of Object.keys(TB_CHUNKS).sort())tbBakeChunk(k,TB_CHUNKS[k]);
// the Dalab mission's yard wall round its block, rammed earth in the Dalab set's ochre, a gate on the cross street toward the town
tbBakeChunk('dalab wall',[],()=>{TSTAT.cur='dalab_wall/0';
 const b=tbBlock(5,1),B=b.box;
 for(const[a,q]of[[[B[0]+4,B[1]+4],[B[2]-4,B[1]+4]],[[B[2]-4,B[1]+4],[B[2]-4,B[3]-4]],[[B[2]-4,B[3]-4],[B[0]+4,B[3]-4]],[[B[0]+4,B[3]-4],[B[0]+4,(B[1]+B[3])/2+6]],[[B[0]+4,(B[1]+B[3])/2-6],[B[0]+4,B[1]+4]]]){
  const L=Math.hypot(q[0]-a[0],q[1]-a[1]),mx=(a[0]+q[0])/2,mz=(a[1]+q[1])/2;vB('xEarthB',mx,tbGround(mx,mz)-.3,mz,L,2.4,.6,Math.abs(q[0]-a[0])>Math.abs(q[1]-a[1])?0:Math.PI/2,xC(0xb09a74));}});
window._instances=TB_INST;
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const tbFr=new THREE.Frustum(),tbPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();tbPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);tbFr.setFromProjectionMatrix(tbPm);const P=camera.position;let shown=0;
 for(const e of TB_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&tbFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the flora: the Vale of Xanadu biome built over the town's mask (89zt: the country, the orchards, the odd tree in a yard), baked
// with the builders' own plants (xaPlant); its LOD ticks with the chunks'
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._biome=XANADU.build({R:2200,quality:.8,lakeHue:XANADU_LAKE.hue});}catch(e){reportErr('biome: '+(e&&e.stack||e));}
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=TB_GROUPS.length;window._buildMs=Math.round(performance.now()-TB_B0);
window._thalaba=Object.assign(window._thalabaPlan||{},{placed:TB_PLACE.length,dalab:TB_DALAB.length,devisers:TB_PLACE.filter(p=>p.key==='tb_devisers').length,chunks:TB_GROUPS.length,
 byKind:TB_PLACE.reduce((a,p)=>{a[p.kind]=tbD(a[p.kind],0)+1;return a;},{})});
