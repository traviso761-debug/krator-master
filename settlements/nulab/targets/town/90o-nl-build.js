// ================================================================= NULAB — the build: the made ground, then every record, chunk by chunk
// Order: the harbour's stone (the quays' bank along the dredged basin, the mole), the earthworks (the precinct's ring bank with its
// gates, the granary yard's bank), the caravan ground's fence; then every record of 89zn (the two core/city instances' lots and
// landmarks, the harbour's pieces, the works, the Line quarter, the ring's villages), each a Dalab set piece drawn by VERN.place on
// its stance (o.y, o.drop: a footing to the lowest corner). A record whose key the set lacks (NL_TOWN.PENDING, PLAN.md section 7)
// is a stand-in at its declared box, in pale earth, counted. Chunk by chunk (400 m; each ring village its own), each chunk baked
// into its own group and drawn while in view and range (Kirstabal's and Qiblai's runtime LOD). [web]: three.js.
reseed(44330);const NL_B0=performance.now();
/* the Dalab set's garden trees and plants (the ranch's shade trees, the yards' plants) grow through the Dalab page's own biome hook
   (settlements/dalab/src/86-bio-45-init.js: dnTree, dnPlant on the SW lowlands kit, SWLOW), which this page does not carry. Here
   they are counted as owed, not drawn and not faked: verify's `pending` names them (KNOWN_ISSUES.md) */
const NL_OWED={trees:0,plants:0};
if(typeof dnTree==='undefined')window.dnTree=function(){NL_OWED.trees++;return null;};
if(typeof dnPlant==='undefined')window.dnPlant=function(){NL_OWED.plants++;return false;};
const NL_CHUNK=400,NL_CHUNKS={};
for(const p of NL_PLACE){const k=p.kind==='ring'?'ring:'+p.village:Math.floor(p.x/NL_CHUNK)+','+Math.floor(p.z/NL_CHUNK);(NL_CHUNKS[k]=NL_CHUNKS[k]||[]).push(p);}
const NL_GROUPS=[],NL_NIGHTM=[],NL_DAYM=[];let NL_INST=0,NL_STANDINS=0,NL_MOUNDS=0;const NL_STANDIN_KEYS={};
function nlBake(key,list,extra,range,centre){const G=new THREE.Group();G.name='chunk:'+key;scene.add(G);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;
 for(const p of list){TSTAT.cur=p.key+'/'+(p.o.v|0);const r0=REG.length;let g=null;
  if(VERN.defs[p.key])g=VERN.place(G,p.key,p.x,p.z,p.ry,p.o);
  else{const P=NL_TOWN.PENDING[p.key]||{w:nlD(p.w,8),d:nlD(p.d,8),h:nlD(p.h,4)};vB('dEarthE',p.x,p.o.y-p.o.drop,p.z,P.w,P.h+p.o.drop,P.d,p.ry,vC(0xcdb894));NL_STANDINS++;NL_STANDIN_KEYS[p.key]=(NL_STANDIN_KEYS[p.key]||0)+1;
   REG.push({name:(p.name||P.what||p.key)+' (pending: the Dalab set lacks it)',key:p.key,type:p.key,cls:'building',x:p.x,y:p.o.y,z:p.z,r:Math.hypot(P.w,P.d)/2,h:P.h,pending:true});}
  if(g)p.G=g;for(let i=r0;i<REG.length;i++){REG[i].type=p.key;if(p.name&&i===r0&&VERN.defs[p.key])REG[i].name=p.name;}
  x0=Math.min(x0,p.x-60);x1=Math.max(x1,p.x+60);z0=Math.min(z0,p.z-60);z1=Math.max(z1,p.z+60);y0=Math.min(y0,p.o.y-nlD(p.o.drop,0));y1=Math.max(y1,p.o.y+nlD(p.h,12));}
 if(extra){const b=extra();if(b){x0=Math.min(x0,b[0]);z0=Math.min(z0,b[1]);x1=Math.max(x1,b[2]);z1=Math.max(z1,b[3]);y0=Math.min(y0,b[4]);y1=Math.max(y1,b[5]);}}
 TSTAT.cur=null;kbake(G);xaDoorsBind();NL_INST+=nlD(window._instances,0);
 if(typeof DMOUND_GEOS!=='undefined'&&DMOUND_GEOS.length){NL_MOUNDS+=DMOUND_GEOS.length;const m=meshMerged(DMOUND_GEOS,MAT.dTurfMesh,G,0,0,0);if(m)m.name='mounds';DMOUND_GEOS.length=0;}
 if(typeof DNIGHT_ITEMS!=='undefined')for(const n of DNIGHT_ITEMS)if(KIT.meshes[n])NL_NIGHTM.push(KIT.meshes[n]);
 if(typeof DDAY_ITEMS!=='undefined')for(const n of DDAY_ITEMS)if(KIT.meshes[n])NL_DAYM.push(KIT.meshes[n]);
 for(const n in KIT.meshes)delete KIT.meshes[n];for(const n in KIT.items)KIT.items[n].length=0;
 const c=centre||new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
 const e={G,key,sphere:new THREE.Sphere(c,Math.hypot(x1-x0,y1-y0,z1-z0)/2+20),range:nlD(range,/^ring:/.test(key)?8000:6500),n:list.length};NL_GROUPS.push(e);return e;}
// ---------------------------------------------------------------- the made ground: the harbour's stone and the earthworks
const NL_EARTH={rings:0,segs:0,moles:0,quays:0};
nlBake('made ground',[],()=>{const K=NL_PLAN;if(!K)return null;TSTAT.cur='nl_made/0';
 const stone=vC(0x8c8578),earth=dCol(DPAL.earth),L=NL_GROUND.LAKE;
 /* the quays: a stone bank along the basin's shore, its top 2 m over the lake, its foot on the dredged floor */
 {const q=K.quays,len=q.z1-q.z0,n=Math.ceil(len/24);for(let i=0;i<n;i++){const z=q.z0+(i+.5)*len/n,bed=Math.min(NL_GROUND.h(q.x+q.w/2,z),NL_GROUND.h(q.x,z))-1;
   vB('dBlockB',q.x,bed,z,q.w,q.top-bed,len/n+.05,0,stone);NL_EARTH.quays++;}
  REG.push({name:'The quays of Nulab (the harbour on the bay)',key:'nl_quays',type:'nl_quays',cls:'feature',x:q.x,y:q.top-3,z:(q.z0+q.z1)/2,r:len/2,h:3.2});}
 /* the mole: a rubble bank from the bed to its top, out from the basin's north end and down its seaward side */
 for(const M of K.moles){const dx=M.b[0]-M.a[0],dz=M.b[1]-M.a[1],Ln=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(Ln/30));
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=M.a[0]+dx*t,z=M.a[1]+dz*t,bed=NL_GROUND.h(x,z)-1;vB('dBlockB',x,bed,z,M.w+4,M.top-bed,Ln/n+.05,Math.atan2(dx,dz),stone);}
  NL_EARTH.moles++;REG.push({name:'The mole',key:'nl_mole',type:'nl_mole',cls:'feature',x:(M.a[0]+M.b[0])/2,y:M.top-3,z:(M.a[1]+M.b[1])/2,r:Ln/2,h:3.2});   /* its volume over its body, not the air above it */}
 /* the precinct's earthwork (PLAN.md question 8, the owner's: an earthwork, not a wall): a rammed-earth bank 2.6 m high, 8 m at its
    foot, round the mound's ground, open at its gates */
 {const R=K.rings.precinct;for(const [a,b] of R.segs){const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,Ln=Math.hypot(b[0]-a[0],b[1]-a[1]),y=Math.min(NL_GROUND.h(a[0],a[1]),NL_GROUND.h(b[0],b[1]))-.4;
   vB('dEarthBatE',mx,y,mz,Ln+.6,3.0,R.w,Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2,earth);NL_EARTH.segs++;}
  NL_EARTH.rings++;REG.push({name:'The precinct\'s earthwork (gates: '+R.gates.map(g=>g.tag).join(', ')+')',key:'nl_earthwork',type:'nl_earthwork',cls:'feature',x:R.c[0],y:NL_GROUND.h(R.c[0],R.c[1]),z:R.c[1],r:R.r,h:3});}
 /* the granary yard's bank: four sides, its gate in the east side toward the harbour road */
 {const G2=K.rings.granary,hx=G2.w/2,hz=G2.d/2,c=G2.c,side=(ax,az,bx,bz)=>{const mx=(ax+bx)/2,mz=(az+bz)/2,Ln=Math.hypot(bx-ax,bz-az),y=Math.min(NL_GROUND.h(ax,az),NL_GROUND.h(bx,bz))-.4;
   vB('dEarthBatE',mx,y,mz,Ln,2.6,5,Math.abs(bx-ax)>Math.abs(bz-az)?0:Math.PI/2,earth);NL_EARTH.segs++;};
  side(c[0]-hx,c[1]-hz,c[0]+hx,c[1]-hz);side(c[0]-hx,c[1]+hz,c[0]+hx,c[1]+hz);side(c[0]-hx,c[1]-hz,c[0]-hx,c[1]+hz);
  side(c[0]+hx,c[1]-hz,c[0]+hx,c[1]-12);side(c[0]+hx,c[1]+12,c[0]+hx,c[1]+hz);NL_EARTH.rings++;
  REG.push({name:'The granary yard\'s earthwork',key:'nl_earthwork',type:'nl_earthwork',cls:'feature',x:c[0],y:NL_GROUND.h(c[0],c[1]),z:c[1],r:Math.hypot(hx,hz),h:2.6});}
 /* the caravan ground's fence (the Great Caravan camps here about year day 211): posts and rails */
 {const C=K.caravan,wd=dCol(DPAL.woodGrey),hx=C.w/2,hz=C.d/2,P=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]];
  for(let s=0;s<4;s++){const a=P[s],b=P[(s+1)%4],Ln=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(Ln/6);
   for(let i=0;i<=n;i++){if(s===3&&Math.abs(i/n-.5)<.08)continue;const x=C.c[0]+a[0]+(b[0]-a[0])*i/n,z=C.c[1]+a[1]+(b[1]-a[1])*i/n;vB('vWood',x,NL_GROUND.h(x,z)-.2,z,.18,1.5,.18,0,wd);}}
  REG.push({name:'The caravan ground (the Great Caravan, about year day 211)',key:'nl_caravan',type:'nl_caravan',cls:'feature',x:C.c[0],y:NL_GROUND.h(C.c[0],C.c[1]),z:C.c[1],r:Math.hypot(hx,hz),h:1.5});}
 const R=K.rings.precinct;return [Math.min(R.c[0]-R.r,K.quays.x-200),Math.min(R.c[1]-R.r,K.quays.z0-200),Math.max(R.c[0]+R.r,K.quays.x+400),Math.max(R.c[1]+R.r,K.quays.z1+100),L-8,NL_GROUND.h(R.c[0],R.c[1])+4];},12000);
// ---------------------------------------------------------------- the build, chunk by chunk
for(const k of Object.keys(NL_CHUNKS).sort())nlBake(k,NL_CHUNKS[k]);
window._instances=NL_INST;
/* Dalab's day/night panes and hearths (94-dalab-light.js): dark glass by day, The God's teal light and hearth fires after dusk;
   and the windmills' turning sails (DWIND, kept out of core/lod's static bake) */
{let nlNight=null;const nlNightTick=()=>{const on=KratorSky.lighting().dayF<.45;if(nlNight===on)return;nlNight=on;
  for(const m of NL_NIGHTM)m.visible=on;for(const m of NL_DAYM)m.visible=!on;};
 FRAME_HOOKS.push(nlNightTick);nlNightTick();}
if(typeof DWIND!=='undefined'&&DWIND.length){FRAME_HOOKS.push(dt=>{for(const w of DWIND)w.grp.rotateZ(w.rate*nlD(dt,.016));});
 window.LOD_OPTIONS=Object.assign(window.LOD_OPTIONS||{},{skipUnder:()=>DWIND.map(w=>w.grp)});}
// the runtime LOD: a chunk is drawn while it is in the view and within its range
const nlFr=new THREE.Frustum(),nlPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();nlPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);nlFr.setFromProjectionMatrix(nlPm);const P=camera.position;let shown=0;
 for(const e of NL_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&nlFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
// the page's own (vendored) biome: only the plants the set's builders set in their yards and orchards, baked. The country's flora is
// the veiled rim's (90p-nl-flora.js: riftrim on today's core/biome), not the Vale's (XANADU.build is not run)
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
globalThis._registered=REG.length;window._chunks=NL_GROUPS.length;window._buildMs=Math.round(performance.now()-NL_B0);
window._nulab=Object.assign(window._nulabPlan||{},{placed:NL_PLACE.length,chunks:NL_GROUPS.length,mounds:NL_MOUNDS,standins:NL_STANDINS,standinKeys:NL_STANDIN_KEYS,owed:NL_OWED,earth:NL_EARTH,water:window._nlWater||null,
 byKind:NL_PLACE.reduce((a,p)=>{a[p.kind]=nlD(a[p.kind],0)+1;return a;},{})});
