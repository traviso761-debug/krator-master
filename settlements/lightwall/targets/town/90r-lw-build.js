// ================================================================= LĀIṬWĀL — the bench's buildings: the Xanadui town, chunk by chunk (PLAN.md 3, 8)
// Every record of 89zl's LW_PLACE (frontage-courts' lots, the landmarks placed by hand, the fields' farmhouses) drawn through
// the Xanadu and Qiblai kits (VERN.place), as Qiblai's 90r: on a slope a building stands at its footprint's highest corner
// (core/city's stance 'high') on a footing of dressed stone down to its lowest; chunk by chunk (400 m), each chunk baked into its
// own group and drawn while in view and range. [web]: three.js.
reseed(LW.SEED+2);const LW_B0=performance.now();
/* L4 (PLAN.md 6): the houses within LW_IX_R of the Stair Foot are built with the Xanadu kit's interiors (settlements/xanadu
   89y-xa-interiors.js: hollow walls, unlocked doors into planned rooms, furnished from the catalog, their floors in core/walk);
   the rest as before, their roofs on solid bodies. ?interiors=0 turns them off. XAF.interiors stays on after the build, so the
   page's start (99-start.js) gives the walk and the cut-away (X) of the furnished buildings */
const LW_IX_R=260,LW_IX_ON=typeof XAF!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const lwIxNear=p=>LW_IX_ON&&p.kind!=='farm'&&Math.hypot(p.x,p.z-(LW_PLAZA.z0+LW_PLAZA.z1)/2)<LW_IX_R;
const LW_CHUNK=400,LW_CHUNKS={};
for(const p of LW_PLACE){const k=Math.floor(p.x/LW_CHUNK)+','+Math.floor(p.z/LW_CHUNK);(LW_CHUNKS[k]=LW_CHUNKS[k]||[]).push(p);}
const LW_GROUPS=[];let LW_INST=0;
/* THE PODIUMS AND THEIR STEPS (the owner, 2026-11-16: "buildings on slopes need podiums / stairs / walk test"). A building on
   a slope stands at its footprint's highest corner (core/city's stance 'high'); under it a podium of dressed stone, its whole
   plot (the def's w x d, wider than the house: the apron round it) from the floor down to the lowest ground, with a coping.
   Where the street in front is lower than the floor, a flight of steps runs along the podium's front face, from the street up
   to the door's axis (the Xanadu kit's doors are on the front's middle), on the side whose ground is higher (the shorter
   flight); rise 0.18, going 0.29. Both go to core/walk: the podium's front apron as a floor at the floor's height, the flight
   as a strip, so a walker climbs from the street to the door (verify.py bench-stairs). Plain records first (LW_STAIRS), then
   drawn */
const LW_STAIR={rise:.18,go:.29,w:1.4,apron:.15};
const LW_STAIRS=[];
function lwStairOf(p,D){if(!D||p.kind==='quay')return null;const y=lwD(p.o.y,0),f=[Math.sin(p.ry),Math.cos(p.ry)],u=[Math.cos(p.ry),-Math.sin(p.ry)];
 const n=D.d/2+LW_STAIR.apron+LW_STAIR.w/2,P=t=>[p.x+f[0]*n+u[0]*t,p.z+f[1]*n+u[1]*t],k=LW_STAIR.go/LW_STAIR.rise;
 if(y-terrainH(...P(0))<.3)return null;
 let best=null;for(const s of [-1,1]){let L=(y-terrainH(...P(0)))*k;for(let i=0;i<4;i++)L=Math.max(.6,(y-terrainH(...P(s*L)))*k);
  const g=terrainH(...P(s*L));if(!best||L<best.L)best={s,L,g};}
 const A=P(best.s*best.L),B=P(0);return {id:p.id,x0:A[0],z0:A[1],y0:best.g,x1:B[0],z1:B[1],y1:y,L:best.L,s:best.s,ry:p.ry,n:Math.max(1,Math.ceil((y-best.g)/LW_STAIR.rise)),past:best.L>D.w/2+.15};}
/* the podium's ground: the lowest of its corners, edges' middles and middle */
function lwPodiumLo(p,D){const C=lwRect(p.x,p.z,D.w+.3,D.d+.3,p.ry);let lo=terrainH(p.x,p.z);for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4];lo=Math.min(lo,terrainH(a[0],a[1]),terrainH((a[0]+b[0])/2,(a[1]+b[1])/2));}return lo;}
function lwPodium(p,D){const y=lwD(p.o.y,0),lo=lwPodiumLo(p,D);if(y-lo<=.25)return null;const st=xC(xPick(QSTONE));
 TSTAT.cur='lw_podium/0';vB('qAshB',p.x,lo-.4,p.z,D.w+.3,y-lo+.1,D.d+.3,p.ry,st);vB('qAshB',p.x,y-.3,p.z,D.w+.5,.3,D.d+.5,p.ry,xC('#c9c2b4'));
 /* the front apron walked at the floor's height: from 1.6 m inside the house's front (fd: across the threshold, which an open
    arcade's front does not floor; the walls are core/walk blocks, so it opens nothing they close) to the podium's edge */
 if(typeof KWALK!=='undefined'){const fd=lwD(D.fd,D.d),fw=D.w+.3,f=[Math.sin(p.ry),Math.cos(p.ry)],u=[Math.cos(p.ry),-Math.sin(p.ry)],a=fd/2-1.6,b=D.d/2+.15;
  const Q=[[-fw/2,a],[fw/2,a],[fw/2,b],[-fw/2,b]].map(([s,t])=>[p.x+u[0]*s+f[0]*t,p.z+u[1]*s+f[1]*t,y]);KWALK.poly({pts:Q,name:p.id+'.apron',tag:'lightwall:podium:'+p.id});}
 return {lo};}
function lwStairDraw(S){const st=xC(xPick(QSTONE)),dx=(S.x1-S.x0)/S.n,dz=(S.z1-S.z0)/S.n,r=(S.y1-S.y0)/S.n,go=S.L/S.n;
 TSTAT.cur='lw_steps/0';
 for(let i=0;i<S.n;i++){const cx=S.x0+dx*(i+.5),cz=S.z0+dz*(i+.5),top=S.y0+r*(i+1),g=Math.min(terrainH(S.x0+dx*i,S.z0+dz*i),terrainH(S.x0+dx*(i+1),S.z0+dz*(i+1)))-.3;
  if(top>g+.05)vB('qAshB',cx,g,cz,go+.02,top-g,LW_STAIR.w,S.ry,st);}
 if(typeof KWALK!=='undefined')KWALK.strip({a:[S.x0,S.z0,S.y0],b:[S.x1,S.z1,S.y1],w:LW_STAIR.w,name:S.id+'.steps',tag:'lightwall:steps:'+S.id});}
function lwBakeChunk(key,list){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){const D=VERN.defs[p.key];
  /* the podium, and the steps up to it from the street (above) */
  const y=lwD(p.o.y,0);if(D){const pd=lwPodium(p,D);p.podium=pd;const S=lwStairOf(p,D);if(S){LW_STAIRS.push(S);lwStairDraw(S);p.stair=S;}}
  TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length,ix=lwIxNear(p);if(LW_IX_ON){XAF.interiors=ix;VERN.interiors=ix;}
  const g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);if(g){p.G=g;p.ix=!!(ix&&g.userData.interior);}for(let i=r0;i<REG.length;i++)REG[i].type=p.key;
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,y-10);y1=Math.max(y1,y+lwD(p.h,12));}
 TSTAT.cur=null;kbake(G);xaDoorsBind();LW_INST+=lwD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const e={G,key,sphere:new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:2600,n:list.length};LW_GROUPS.push(e);return e;}
for(const k of Object.keys(LW_CHUNKS).sort())lwBakeChunk(k,LW_CHUNKS[k]);
if(LW_IX_ON){XAF.interiors=true;VERN.interiors=true;if(typeof xaIxWalk==='function')xaIxWalk();}
const LW_IX={on:LW_IX_ON,radius:LW_IX_R,houses:LW_PLACE.filter(p=>p.ix).length,rooms:LW_PLACE.reduce((a,p)=>a+(p.ix?p.G.userData.interior.rooms:0),0),
 pieces:LW_PLACE.reduce((a,p)=>a+(p.ix?p.G.userData.interior.pieces:0),0),near:LW_PLACE.filter(lwIxNear).length};
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
