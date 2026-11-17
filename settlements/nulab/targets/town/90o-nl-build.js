// ================================================================= NULAB — the build: the made ground, the earthen mounds, crop plots, every record
// Order: register the town's infill crop-plot builder (`nl_cropplot`); bake the made ground (harbour quays and mole, the palisaded
// earthen ring round the set-back ceremonial mound, the outer earthen mound surrounding the coastal city from shore to shore, the
// granary yard's bank, the caravan ground's fence); then bake every record of 89zn chunk by chunk (400 m; each ring village its
// own), merging any turfed mound geometry (DMOUND_GEOS) and wiring Dalab's day/night panes and windmill sails. [web]: three.js.
reseed(44330);const NL_B0=performance.now();
const NL_OWED={trees:0,plants:0};
if(typeof dnTree==='undefined')window.dnTree=function(){NL_OWED.trees++;return null;};
if(typeof dnPlant==='undefined')window.dnPlant=function(){NL_OWED.plants++;return false;};
/* infill crop plots in the empty lots among the town's houses: low earth bunds following the ground slope, tilled ridges, crop
   rows (climbing helix-bean stakes, ashroot/greens mounds, lotus/flax rows), a water jar and an occasional cultivator */
function buildNlCropPlot(G,o){reseed(8921+(o.v|0));
 const W=nlD(o.W,16),D=nlD(o.D,13),state=o.state||'crop',crop=o.crop||'helix bean',c=VERN.cur;
 const soil=vC(0x5d4b37),bund=dCol(DPAL.earth),wood=dCol(DPAL.woodGrey);
 const dy=(lx,lz)=>{if(!c)return 0;const p=loc(c.x,c.z,lx,lz,c.ry);return NL_GROUND.h(p[0],p[1])-c.o.y;};
 vnReg((state==='fallow'?'Fallow plot':'Crop plot ('+crop+')'),0,0,Math.hypot(W,D)/2,1.6,{type:['farm']});
 /* low earth bunds round the plot, open 2.4 m at +z toward the street */
 const seg=(lx,lz,L,a)=>{const y0=dy(lx,lz);vB('dEarth',lx,y0-.25,lz,L,.52,.44,a,bund);};
 seg(0,-D/2,W,0);seg(-W/2,0,D,Math.PI/2);seg(W/2,0,D,Math.PI/2);
 if(W>5){const gl=(W-2.6)/2;seg(-(1.3+gl/2),D/2,gl,0);seg(1.3+gl/2,D/2,gl,0);}
 const pal=crop==='helix bean'?[0x4c7c34,0x5a8c3c,0x3f6e2e]:crop==='valley woad'?[0x3e745c,0x4c8268,0x588a62]:
  crop==='ashroot'?[0x6c8238,0x7e8e3e,0x5d7432]:[0x54863a,0x649442,0x487834];
 const nRows=Math.max(3,Math.floor((D-2.2)/1.85));
 for(let r=0;r<nRows;r++){const lz=-D/2+1.3+r*(D-2.6)/Math.max(1,nRows-1),segs=Math.max(2,Math.ceil((W-2)/4.5)),sw=(W-1.8)/segs;
  for(let s=0;s<segs;s++){const lx=-W/2+.9+(s+.5)*sw,y0=dy(lx,lz);
   vB('dEarth',lx,y0-.18,lz,sw-.25,.32,.68,0,soil);
   if(state==='crop'){const gc=dCol(pal),ch=crop==='helix bean'?.62:crop==='ashroot'?.36:.46;
    vB('dTurf',lx,y0+.08,lz,sw-.45,ch,.54,0,gc);
    if(crop==='helix bean'&&s%2===0)vPst('vPost',lx+rr(-.4,.4),y0,lz,.04,1.25+rr(-.12,.12),wood);
    else if((crop==='ashroot'||crop==='mist greens')&&(r+s)%2===0)vBall('vGourd',lx+rr(-.5,.5),y0+.26,lz,.16,dCol([0xb08a44,0x7a9a3c,0xc49a52]),.18);}}}
 if(state==='fallow'){const y0=dy(-W*.22,-D*.15);kput('vThatchB',[-W*.22,y0-.05,-D*.15],null,[1.9,1.05,1.9],vC(0xc4ac62));}
 else{dnJar(W/2-1.2,dy(W/2-1.2,D/2-1.1),D/2-1.1,.28);if(W>=20&&rng()<.65){const fx=rr(-W*.25,W*.25),fz=rr(-D*.25,D*.25);dnFolk(fx,fz,1,.2,dy(fx,fz));}}}
dDef({key:'nl_cropplot',name:'Crop plot',family:'farm',tags:{type:['farm'],wealth:'peasant',lit:false},w:18,d:14,h:1.6,build:buildNlCropPlot});
/* turfed earthen rampart sweep: extrudes Dalab's 6-point dome bank cross-section along a world-space polyline run onto the ground,
   with outward (+Y) normals and 64 m UV tiling for MAT.dTurfMesh */
function nlSweepBank(run,w,h){if(!run||run.length<2)return null;
 const prof=[[-w*.52,-.8,0],[-w*.34,h*.78,.2],[-w*.14,h,.42],[w*.14,h,.58],[w*.34,h*.78,.8],[w*.52,-.8,1]],P=prof.length,N=run.length;
 const pos=new Float32Array(N*P*3),uv=new Float32Array(N*P*2),idx=[];let dist=0;
 for(let i=0;i<N;i++){if(i>0)dist+=Math.hypot(run[i][0]-run[i-1][0],run[i][1]-run[i-1][1]);
  const a=run[Math.max(0,i-1)],b=run[Math.min(N-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;
  const yc=NL_GROUND.h(run[i][0],run[i][1]);
  for(let j=0;j<P;j++){const off=prof[j][0],wx=run[i][0]+nx*off,wz=run[i][1]+nz*off,yg=prof[j][1]<0?NL_GROUND.h(wx,wz)+prof[j][1]:Math.max(yc,NL_GROUND.h(wx,wz))+prof[j][1];
   const k=i*P+j;pos[k*3]=wx;pos[k*3+1]=yg;pos[k*3+2]=wz;uv[k*2]=prof[j][2];uv[k*2+1]=dist/64;}}
 for(let i=0;i<N-1;i++)for(let j=0;j<P-1;j++){const a=i*P+j,b=(i+1)*P+j,c=(i+1)*P+j+1,d=i*P+j+1;idx.push(a,d,c,a,c,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();DMOUND_GEOS.push(g);const t=tcur();if(t){t.meshes++;t.tris+=idx.length/3;}return g;}
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
// ---------------------------------------------------------------- the made ground: harbour stone, palisaded mound ring, outer earthen mound
const NL_EARTH={rings:0,segs:0,outerRuns:0,palisadePosts:0,moles:0,quays:0};
nlBake('made ground',[],()=>{const K=NL_PLAN;if(!K)return null;TSTAT.cur='nl_made/0';
 const stone=vC(0x8c8578),earth=dCol(DPAL.earth),earthDark=dCol(DPAL.earthDark),palWood=vC(0x7a5a3e),L=NL_GROUND.LAKE;
 /* the quays and the mole */
 {const q=K.quays,len=q.z1-q.z0,n=Math.ceil(len/24);for(let i=0;i<n;i++){const z=q.z0+(i+.5)*len/n,bed=Math.min(NL_GROUND.h(q.x+q.w/2,z),NL_GROUND.h(q.x,z))-1;
   vB('dBlockB',q.x,bed,z,q.w,q.top-bed,len/n+.05,0,stone);NL_EARTH.quays++;}
  REG.push({name:'The quays of Nulab (the harbour on the bay)',key:'nl_quays',type:'nl_quays',cls:'feature',x:q.x,y:q.top-3,z:(q.z0+q.z1)/2,r:len/2,h:3.2});}
 for(const M of K.moles){const dx=M.b[0]-M.a[0],dz=M.b[1]-M.a[1],Ln=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(Ln/30));
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=M.a[0]+dx*t,z=M.a[1]+dz*t,bed=NL_GROUND.h(x,z)-1;vB('dBlockB',x,bed,z,M.w+4,M.top-bed,Ln/n+.05,Math.atan2(dx,dz),stone);}
  NL_EARTH.moles++;REG.push({name:'The mole',key:'nl_mole',type:'nl_mole',cls:'feature',x:(M.a[0]+M.b[0])/2,y:M.top-3,z:(M.a[1]+M.b[1])/2,r:Ln/2,h:3.2});}
 /* helper: battered rammed-earth cheeks at both ends of a turfed rampart run */
 const bankEnds=(run,w,h)=>{for(const [p,q] of [[run[0],run[1]],[run[run.length-1],run[run.length-2]]]){
   const ry=Math.atan2(p[0]-q[0],p[1]-q[1]),y=NL_GROUND.h(p[0],p[1])-.4;
   kput('dEarthBat',[p[0],y,p[1]],qEuler(0,ry,0),[w*.92,h+.5,2.6],earth);
   vB('dEarth',p[0],y+h+.1,p[1],w*.76,.4,2.4,ry,earthDark);}};
 /* 1. the ceremonial mound's palisaded ring (set back from the sea): turfed earthen bank + continuous timber palisade */
 {const R=K.rings.precinct;
  for(const run of R.runs){nlSweepBank(run,R.w,R.h);bankEnds(run,R.w,R.h);NL_EARTH.segs+=run.length-1;
   for(let i=1;i<run.length;i++){const a=run[i-1],b=run[i],Ln=Math.hypot(b[0]-a[0],b[1]-a[1]),np=Math.max(2,Math.round(Ln/.58)),ry=Math.atan2(b[0]-a[0],b[1]-a[1]);
    for(let k=0;k<np;k++){const t=(k+.5)/np,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=NL_GROUND.h(x,z)+R.h-.35;
     vPst('vPostB',x,y,z,.17,2.55+rr(-.18,.2),palWood.clone().multiplyScalar(rr(.86,1.1)));NL_EARTH.palisadePosts++;}
    const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,ym=NL_GROUND.h(mx,mz)+R.h+1.35;
    vB('vWood',mx,ym,mz,.14,.14,Ln+.1,ry,palWood);}}
  NL_EARTH.rings++;REG.push({name:'The ceremonial mound\'s palisaded earthwork',key:'nl_palisade',type:'nl_palisade',cls:'feature',x:R.c[0],y:NL_GROUND.h(R.c[0],R.c[1]),z:R.c[1],r:R.r,h:R.h+2.6});}
 /* 2. the outer earthen mound surrounding the coastal city from the north shore to the south shore */
 {const OM=K.rings.outer;
  for(const run of OM.runs){nlSweepBank(run,OM.w,OM.h);bankEnds(run,OM.w,OM.h);NL_EARTH.outerRuns++;NL_EARTH.segs+=run.length-1;}
  NL_EARTH.rings++;REG.push({name:'The earthen mound of Nulab (the coastal rampart)',key:'nl_earthwork',type:'nl_earthwork',cls:'feature',x:140,y:NL_GROUND.h(140,-1350),z:-1350,r:920,h:OM.h});}
 /* 3. the granary yard's rammed-earth bank */
 {const G2=K.rings.granary,hx=G2.w/2,hz=G2.d/2,c=G2.c,side=(ax,az,bx,bz)=>{const mx=(ax+bx)/2,mz=(az+bz)/2,Ln=Math.hypot(bx-ax,bz-az),y=Math.min(NL_GROUND.h(ax,az),NL_GROUND.h(bx,bz))-.4;
   vB('dEarthBatE',mx,y,mz,Ln,2.6,5,Math.abs(bx-ax)>Math.abs(bz-az)?0:Math.PI/2,earth);NL_EARTH.segs++;};
  side(c[0]-hx,c[1]-hz,c[0]+hx,c[1]-hz);side(c[0]-hx,c[1]+hz,c[0]+hx,c[1]+hz);side(c[0]-hx,c[1]-hz,c[0]-hx,c[1]+hz);
  side(c[0]+hx,c[1]-hz,c[0]+hx,c[1]-12);side(c[0]+hx,c[1]+12,c[0]+hx,c[1]+hz);NL_EARTH.rings++;
  REG.push({name:'The granary yard\'s earthwork',key:'nl_earthwork',type:'nl_earthwork',cls:'feature',x:c[0],y:NL_GROUND.h(c[0],c[1]),z:c[1],r:Math.hypot(hx,hz),h:2.6});}
 /* the caravan ground's fence */
 {const C=K.caravan,wd=dCol(DPAL.woodGrey),hx=C.w/2,hz=C.d/2,P=[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]];
  for(let s=0;s<4;s++){const a=P[s],b=P[(s+1)%4],Ln=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(Ln/6);
   for(let i=0;i<=n;i++){if(s===3&&Math.abs(i/n-.5)<.08)continue;const x=C.c[0]+a[0]+(b[0]-a[0])*i/n,z=C.c[1]+a[1]+(b[1]-a[1])*i/n;vB('vWood',x,NL_GROUND.h(x,z)-.2,z,.18,1.5,.18,0,wd);}}
  REG.push({name:'The caravan ground (the Great Caravan, about year day 211)',key:'nl_caravan',type:'nl_caravan',cls:'feature',x:C.c[0],y:NL_GROUND.h(C.c[0],C.c[1]),z:C.c[1],r:Math.hypot(hx,hz),h:1.5});}
 return [-720,-2250,1150,-460,L-8,NL_GROUND.h(-410,-1350)+10];},12000);
// ---------------------------------------------------------------- the build, chunk by chunk
for(const k of Object.keys(NL_CHUNKS).sort())nlBake(k,NL_CHUNKS[k]);
window._instances=NL_INST;
/* ---- step N4: Dalab's lake and river hulls (NL_RINGSEA, riding core/water's open swell and the Chimes Riba's surface) */
const NL_VESSELS=[];const NL_VESSEL_ROOT=new THREE.Group();NL_VESSEL_ROOT.name='vessels';scene.add(NL_VESSEL_ROOT);
if(typeof NL_RINGSEA!=='undefined'&&NL_RINGSEA.make&&typeof NL_BOATS!=='undefined'){
 const rH=(x,z)=>NL_GROUND.riverAt(x,z)[1];
 for(const b of NL_BOATS){const v=NL_RINGSEA.make(b.vessel);if(!v||!v.group)continue;
  const D=NL_RINGSEA.dims[b.vessel]||{L:16,B:5,H:10},tg=NL_RINGSEA.tags[b.vessel]||{};
  TSTAT.cur=b.vessel+'/0';const tc=tcur();if(tc){tc.meshes+=nlD(v.meshes,1);tc.tris+=nlD(v.tris,0);}TSTAT.cur=null;
  const hFn=b.river?rH:undefined,ySurf=b.river?rH(b.x,b.z):NL_GROUND.LAKE;
  if(typeof WATER!=='undefined'&&WATER.ride)WATER.ride(v.group,D,b.x,b.z,b.ry,0,0,hFn);
  else{v.group.position.set(b.x,ySurf,b.z);v.group.rotation.y=nlD(b.ry,0);}
  NL_VESSEL_ROOT.add(v.group);v.group.updateMatrixWorld(true);
  REG.push({name:b.name||D.name||b.vessel,key:b.vessel,type:b.vessel,cls:'prop',x:b.x,y:ySurf-1.5,z:b.z,r:Math.max(4,D.L*.55),h:D.H+2,
   tags:{culture:'dalab',type:['infrastructure'],wealth:tg.wealth||'peasant'}});
  NL_VESSELS.push({G:v.group,D,x:b.x,z:b.z,ry:nlD(b.ry,0),hFn});}
 if(NL_VESSELS.length){let vt=0;FRAME_HOOKS.push(dt=>{vt+=Math.min(.1,nlD(dt,.016));NL_RINGSEA.tick(vt);
   const P=camera.position;if(typeof WATER!=='undefined'&&WATER.ride){for(const v of NL_VESSELS){
    const d2=(P.x-v.x)*(P.x-v.x)+(P.z-v.z)*(P.z-v.z);v.G.visible=d2<5500*5500;if(v.G.visible&&d2<2400*2400)WATER.ride(v.G,v.D,v.x,v.z,v.ry,vt,0,v.hFn);}}});}}
{let nlNight=null;const nlNightTick=()=>{const on=KratorSky.lighting().dayF<.45;if(nlNight===on)return;nlNight=on;
  for(const m of NL_NIGHTM)m.visible=on;for(const m of NL_DAYM)m.visible=!on;};
 FRAME_HOOKS.push(nlNightTick);nlNightTick();}
{const nlSkip=()=>((typeof DWIND!=='undefined'?DWIND.map(w=>w.grp):[]).concat(NL_VESSELS.length?[NL_VESSEL_ROOT]:[]));
 if(typeof DWIND!=='undefined'&&DWIND.length)FRAME_HOOKS.push(dt=>{for(const w of DWIND)w.grp.rotateZ(w.rate*nlD(dt,.016));});
 window.LOD_OPTIONS=Object.assign(window.LOD_OPTIONS||{},{skipUnder:nlSkip});}
const nlFr=new THREE.Frustum(),nlPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();nlPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);nlFr.setFromProjectionMatrix(nlPm);const P=camera.position;let shown=0;
 for(const e of NL_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&nlFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
if(typeof BIO!=='undefined'&&BIO.host){BIO.setScene(scene);BIO.setSun([-.5,.76,.52]);
 try{window._bioBake=BIO.bake();}catch(e){reportErr('biome bake: '+e.message);}
 if(BIO.lodTick)FRAME_HOOKS.push(()=>BIO.lodTick(camera));}
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
globalThis._registered=REG.length;window._chunks=NL_GROUPS.length;window._buildMs=Math.round(performance.now()-NL_B0);
window._nulab=Object.assign(window._nulabPlan||{},{placed:NL_PLACE.length,boatsBuilt:NL_VESSELS.length,chunks:NL_GROUPS.length,mounds:NL_MOUNDS,standins:NL_STANDINS,standinKeys:NL_STANDIN_KEYS,owed:NL_OWED,earth:NL_EARTH,water:window._nlWater||null,
 byKind:NL_PLACE.reduce((a,p)=>{a[p.kind]=nlD(a[p.kind],0)+1;return a;},{})});
