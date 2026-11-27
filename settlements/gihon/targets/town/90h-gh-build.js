// ================================================================= GIHON — the build: the moles' bodies, then every record, chunk by chunk
// Kirstabal's 90l, adapted: the harbour mole's rubble bank; then every record of 89zg (the town's lots and landmarks, the harbour,
// the river front and the bridge, the forbidden city's pieces and its wall, the town wall, the gardens, the ring's villages), each a
// normal Xanadu kit piece (Gihon's own in kits/xanadu/extra/88h) drawn by VERN.place on its stance; a core/hamlet record whose key
// the kit lacks is a stand-in at its box. Chunk by chunk (400 m; each ring village its own; the forbidden city's wall its own),
// each baked into its own group and drawn while in view and range. [web]: three.js.
reseed(41920);const GH_B0=performance.now();
if(GH_PLAN)for(const M of GH_PLAN.moles){const dx=M.b[0]-M.a[0],dz=M.b[1]-M.a[1],L=Math.hypot(dx,dz),mx=(M.a[0]+M.b[0])/2,mz=(M.a[1]+M.b[1])/2,
 ry=Math.atan2(dz/L,-dx/L),bed=Math.min(GH_GROUND.h(M.a[0],M.a[1]),GH_GROUND.h(mx,mz),GH_GROUND.h(M.b[0],M.b[1]))-1;
 vB('xRubB',mx,bed,mz,L+M.w,M.top-bed,M.w+4,ry,xC(0x8a8070));}
const GH_CHUNK=400,GH_CHUNKS={};
for(const p of GH_PLACE){const k=p.kind==='ring'?'ring:'+p.village:p.kind==='fcwall'?'fcwall':p.kind==='bridge'?'bridge':(p.kind==='wall'?'wall:':'')+Math.floor(p.x/GH_CHUNK)+','+Math.floor(p.z/GH_CHUNK);(GH_CHUNKS[k]=GH_CHUNKS[k]||[]).push(p);}
const GH_GROUPS=[];let GH_INST=0,GH_STANDINS=0;
function ghBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  if(VERN.defs[p.key])g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);
  else{vB('xEarthB',p.x,p.o.y-p.o.drop,p.z,ghD(p.w,8),ghD(p.h,4)+p.o.drop,ghD(p.d,8),p.ry,xC(0xb8a890));GH_STANDINS++;}
  if(g)p.G=g;for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  const ext=p.kind==='fcwall'?180:60;x0=Math.min(x0,p.x-ext);x1=Math.max(x1,p.x+ext);z0=Math.min(z0,p.z-ext);z1=Math.max(z1,p.z+ext);y0=Math.min(y0,p.o.y-ghD(p.o.drop,0));y1=Math.max(y1,p.o.y+ghD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();GH_INST+=ghD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:key==='bridge'||key==='fcwall'||/^wall:/.test(key)?9000:/^ring:/.test(key)?7000:2600,n:list.length};GH_GROUPS.push(e);return e;}
{const G=new THREE.Group();G.name='chunk:mole';scene.add(G);kbake(G);for(const n in KIT.items)KIT.items[n].length=0;
 GH_GROUPS.push({G,key:'mole',sphere:new THREE.Sphere(new THREE.Vector3(-300,0,-850),520),range:6000,n:GH_PLAN?GH_PLAN.moles.length:0});}
for(const k of Object.keys(GH_CHUNKS).sort())ghBakeChunk(k,GH_CHUNKS[k]);
window._instances=GH_INST;
const ghFr=new THREE.Frustum(),ghPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();ghPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);ghFr.setFromProjectionMatrix(ghPm);const P=camera.position;let shown=0;
 for(const e of GH_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&ghFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
/* the avenues' palms and the main streets' shade trees (Kirstabal's): one each side every 14 m (avenues) or 20 m, where clear */
const GH_STREET_TREES={n:0,skipped:0};
if(GH_PLAN&&typeof xaPlant==='function'){reseed(41926);
 const FB=GH_PLAN.fc&&GH_PLAN.fc.box;
 const clear=(x,z)=>{if(GH_GROUND.h(x,z)<1.6)return false;const u=GH_GROUND.u(x,z),v=GH_GROUND.v(x,z);if(FB&&u>FB[0]-4&&u<FB[2]+4&&v>FB[1]-4&&v<FB[3]+4)return false;
  for(const s of GH_WAYS.query(x,z,1))if(KCITY.lib.segDist([x,z],s.a,s.b)<s.w/2+1.2)return false;
  for(const p of GH_SPACE.query(x,z,1)){const D=VERN.defs[p.key];if(D&&Math.hypot(x-p.x,z-p.z)<Math.hypot(D.fw||D.w,D.fd||D.d)/2+1.5)return false;}
  return !(v<48&&u>GH_GROUND.HARBOUR.u0-30&&u<GH_GROUND.HARBOUR.u1+30);};
 for(const w of GH_PLAN.ways){if(w.fc||(w.cls!=='avenue'&&w.cls!=='main'))continue;const av=w.cls==='avenue',step=av?14:20,off=w.w/2+2.2;let carry=step/2;
  for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
   let t=carry;for(;t<L;t+=step)for(const sd of[-1,1]){const x=a[0]+ux*t-uz*off*sd,z=a[1]+uz*t+ux*off*sd;
     if(!clear(x,z)){GH_STREET_TREES.skipped++;continue;}
     if(xaPlant(av?'palm':'tree',x,GH_GROUND.h(x,z),z,av?rr(8,11):rr(6,8.5)))GH_STREET_TREES.n++;}
   carry=t-L;}}}
window._ghStreetTrees=GH_STREET_TREES;
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
/* the empty lots outside the walls: building sites (kits/construction KCONS.site, work not begun), registered as kind 'lot' */
window._ghEmpty={lots:GH_EMPTY.length,drawn:0};
if(typeof KCONS!=='undefined')for(const L of GH_EMPTY){const D=VERN.defs[L.key]||{},w=ghD(D.fw,ghD(L.fw,8)),d=ghD(D.fd,ghD(L.fd,8)),h=ghD(D.h,6);
 const S=KCONS.site({w,d,h,plot:[Math.min(L.w,w+3),Math.min(L.d,d+3)],bill:L.bill?{timber:4,stone:6,lime:2}:{}});S.set(0);
 S.group.position.set(L.x,L.y,L.z);S.group.rotation.y=L.ry||0;S.group.name='empty lot '+L.id;S.group.userData.inspectLabel='An empty lot: a '+(D.name||L.key)+' to be built';scene.add(S.group);
 REG.push({name:'Empty lot',cls:'building',key:L.key,x:L.x,y:L.y,z:L.z,r:Math.hypot(w,d)/2,h:.6,type:L.key,tags:{culture:'xanadu',role:'an empty lot outside the walls, buildable: '+(D.name||L.key)+(L.bill?', its materials piled':''),quarter:L.district}});
 window._ghEmpty.drawn++;}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=GH_GROUPS.length;   /* the build's own count (core/host 95 keeps a build's count): Xanadu's verify reads it */
window._buildMs=Math.round(performance.now()-GH_B0);
window._gihon=Object.assign(window._gihonPlan||{},{placed:GH_PLACE.length,chunks:GH_GROUPS.length,standins:GH_STANDINS,water:window._ghWater||null,
 byKind:GH_PLACE.reduce((a,p)=>{a[p.kind]=ghD(a[p.kind],0)+1;return a;},{})});
