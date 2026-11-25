// ================================================================= HOST — stage: terrain, hydrology, KSPACE & BIO.init
// Implements all three Crook stations from CROOK-RIA-DECISIONS.md section 1.6 and PLAN.md section 3:
//   shore (default, dist/crook.html):   Drowned ejecta-caldera basalt collar, < +65 m tsunami-scoured columnar basalt
//                                       spray-benches, sheltered caldera lagoon, Kopa-Kawa mouth, >= +65 m cloud-forest
//   wash  (dist/crook-wash.html):       Incised V-gorge forest, shaded skarn-seep wall, 16 monotone-stepped iron-jade
//                                       rimstone pools, windy chasm rims, and sunny N-facing rain-shadow slope
//   head  (dist/crook-head.html):       Subalpine moraine tarn, KFROST periglacial stone circles, 48 thermogenic +15 degC
//                                       hearth-ring snow-melt wells, and eastern Silent Vales Great Hush pass threshold
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];
function REGISTER(o){
 REG.push(o);
 BIO.record(o);
 if(typeof KTAGS!=='undefined'&&KTAGS.page&&o.tagId){
  try{KTAGS.page.add({id:o.tagId,name:o.name,class:o.tagClass||'feature',at:[o.x,o.y==null?0:o.y,o.z],r:o.r,h:o.h,tags:o.tags||{}});}catch(e){}
 }
}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-4&&y<=ry+r.h+8;}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'shore';
const SITE=CROOK_SITES[SKEY]||CROOK_SITES.shore;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

// Interactive live host states (modulated by buttons in 99-host-take.js)
const CROOK_STATE={
 drawdownM:0,
 updraftBoost:0,
 hushStepEast:false
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='shore'?0xc2d2d4:SKEY==='wash'?0xc6d0cc:0xcfd8dc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='shore'?0.00028:SKEY==='wash'?0.00032:0.00024);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.4,18000);
scene.add(new THREE.HemisphereLight(0xdce8ec,0x485246,0.82));
const sun=new THREE.DirectionalLight(0xfff4e2,1.34);
sun.position.set(420,980,-680);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd4e2ec,0.20);
fill.position.set(-620,380,640);
scene.add(fill);

// ---------------------------------------------------------------- station heightfields & water surfaces
const TERR={R:760};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

// Periglacial sorted stone polygons on Station 3 (head) via core/terrain/42-core-frost.js
const FROST=(SKEY==='head'&&typeof KFROST!=='undefined')?KFROST.create({
 seed:5231,
 ground:(x,z)=>0,
 polygons:{
  cell:18,trough:0.28,rim:0.09,width:0.17,
  where:(x,z)=>{
   const T=SITE.tarn,dt=Math.hypot((x-T.x)/T.rx,(z-T.z)/T.rz);
   return clamp(smooth(1.08,1.38,dt)*smooth(240,120,x),0,1);
  }
 }
}):null;

// Precomputed rimstone step planes on Station 2 (wash)
const RIM_POOLS=[];
if(SKEY==='wash'&&SITE.rimstoneSteps){
 const topBase=26.5;
 for(let i=0;i<SITE.rimstoneSteps.length;i++){
  const s=SITE.rimstoneSteps[i];
  const lvl=+(topBase-s.dropM).toFixed(3);
  RIM_POOLS.push({i:i,x:s.x,z:s.z,r:s.r,level:lvl,floor:+(lvl-0.42).toFixed(3),crest:+(lvl+0.08).toFixed(3),stain:s.stain});
 }
}

// River / stream polylines per station
const FLOW_LINES=(function(){
 if(SKEY==='shore'){
  // Kopa-Kawa (Khopri-Tskhali) mouth chute terminating cleanly at the NW Ocean shoreline (x = -68)
  const pts=[];
  for(let i=0;i<=18;i++){
   const t=i/18,x=360-428*t,z=18-78*t+16*Math.sin(t*4.2);
   pts.push([x,z]);
  }
  return[{name:'Kopa-Kawa Mouth',pts:pts,w:15,depth:0.85,speed:2.2}];
 }
 if(SKEY==='wash'){
  // Main incised V-gorge torrent (east to west) + north-wall cascade tributary joining main torrent
  const main=[],side=[];
  const stC=Math.cos(SITE.gorge.strike),stS=Math.sin(SITE.gorge.strike);
  for(let i=0;i<=28;i++){
   const t=i/28,u=540-1080*t;
   const wob=14*Math.sin(t*6.0+0.5);
   main.push([u*stC-wob*stS,u*stS+wob*stC]);
  }
  for(let i=0;i<=12;i++){
   const t=i/12,x=45-18*t+6*Math.sin(t*3.5),z=220-209*t;
   side.push([x,z]);
  }
  return[
   {name:'Khopri-Tskhali Gorge Torrent',pts:main,w:14,depth:0.95,speed:2.6},
   {name:'Skarn-Wall Tributary Cascade',pts:side,w:4.5,depth:0.45,speed:2.9}
  ];
 }
 // Station 3 (head): snowmelt rill descending from south cirque moraine cleanly to the moraine tarn shore (z = -62)
 const rill=[];
 for(let i=0;i<=14;i++){
  const t=i/14,x=-95-20*t+10*Math.sin(t*4.5),z=-185+123*t;
  rill.push([x,z]);
 }
 return[{name:'Copper-Cirque Snowmelt Rill',pts:rill,w:4.2,depth:0.38,speed:1.5}];
})();

function distToPoly(pts,x,z){
 let best=1e9,bestT=0;
 for(let i=0;i<pts.length-1;i++){
  const ax=pts[i][0],az=pts[i][1],bx=pts[i+1][0],bz=pts[i+1][1];
  const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz;
  const t=l2>1e-6?clamp(((x-ax)*dx+(z-az)*dz)/l2,0,1):0;
  const d=Math.hypot(ax+dx*t-x,az+dz*t-z);
  if(d<best){best=d;bestT=(i+t)/(pts.length-1);}
 }
 return{d:best,t:bestT};
}

function landShore(x,z){
 const wob=38*n2(x,z,0.0028,101)+12*n2(x,z,0.009,102);
 const u=x+wob;
 // West of u = -115: open ocean shelf; u = -115..+68: stepped < +65 m columnar basalt tsunami spray-benches; u > +68: steep +65..+260 m rainforest collar
 let h=-22*smooth(-95,-360,u)-2.2*smooth(-70,-115,u);
 if(u>-118){
  const b1=12.5*smooth(-112,-72,u);
  const b2=19.0*smooth(-54,-18,u);
  const b3=22.0*smooth(4,42,u);
  // Crisp megatsunami bluff rising across +54..+74 m around u = 55..92, then mountain rainforest slopes climbing eastward
  const bluff=34.0*smooth(46,88,u)+145.0*smooth(86,480,u)+48.0*smooth(260,680,u);
  h+=b1+b2+b3+bluff;
 }
 // Columnar basalt joint steps & boulder-chevron ribs on the < +65 m spray apron
 if(h>0.4&&h<62){
  const colStep=1.35*Math.floor((h+0.8)/3.4)-h*0.18;
  h+=0.25*colStep+1.4*n2(x,z,0.035,103);
 }
 // Two offshore columnar basalt sea-stacks
 const s1=Math.hypot(x+215,z-92),s2=Math.hypot(x+245,z+138);
 if(s1<44)h=Math.max(h,31*smooth(42,11,s1)+2.5*n2(x,z,0.08,104));
 if(s2<38)h=Math.max(h,25*smooth(36,9,s2)+2.2*n2(x,z,0.08,105));

 // Drowned secondary-ejecta caldera collar & sheltered nursery lagoon at SITE.caldera (210, -170)
 const C=SITE.caldera;
 const cd=Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz)*(1+0.08*n2(x,z,0.015,106));
 if(cd<1.68){
  // Raised arcuate ejecta breccia collar rim (+92..+168 m) around cd = 1.08..1.42, breached narrowly SW toward river mouth
  const ang=Math.atan2(z-C.z,x-C.x);
  const breach=smooth(0.48,0.12,Math.abs(ang-2.58));
  const rimH=(74+32*n2(x,z,0.008,107))*smooth(1.66,1.18,cd)*smooth(0.76,1.14,cd)*(1-0.78*breach);
  h+=rimH;
  if(cd<1.02){
   const bowl=mix(C.floor+2.5*n2(x,z,0.025,108),h,smooth(0.68,1.02,cd));
   h=bowl;
  }
 }
 // Incised Kopa-Kawa mouth channel
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<58&&x>-90){
  const bed=mix(88,-1.8,Math.pow(rv.t,0.82));
  const cut=smooth(56,11,rv.d)*smooth(-90,-66,x);
  h=mix(h,Math.min(h,bed),cut);
 }
 // Safe flat marine bench at site:hueru-kuran-kopa (195, 165) strictly above +65 m (~+84 m)
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.45){
  h=mix(h,84.5+0.6*n2(x,z,0.02,109),smooth(SITE.reserve.r*1.42,SITE.reserve.r*0.72,rd));
 }
 h+=6.5*n2(x,z,0.004,110)+1.8*n2(x,z,0.018,111);
 return h;
}

function landWash(x,z){
 const stC=Math.cos(SITE.gorge.strike),stS=Math.sin(SITE.gorge.strike);
 const u=x*stC+z*stS;
 const v=-x*stS+z*stC+16*n2(x,z,0.0045,201);
 const av=Math.abs(v);
 // Thalweg slopes monotonically down from east (+u) to west (-u)
 const thalweg=12.0+0.038*u;
 // Asymmetric V-gorge walls: steep shaded S-facing skarn wall (v < 0 -> z < 0) & sunny N-facing rain-shadow wall (v > 0 -> z > 0)
 const wallK=v<0?1.08:0.92;
 let h=thalweg+SITE.gorge.wallH*wallK*smooth(14,265,av)+45*smooth(220,520,av);
 // Gorge ribs & chutes
 h+=14*n2(x,z,0.005,202)*smooth(18,95,av)+3.4*n2(x,z,0.022,203);

 // Main torrent channel bed
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<34){
  const bed=mix(31.5,-9.5,rv.t);
  h=mix(h,bed,smooth(32,9,rv.d));
 }
 // Side cascade gully on north wall
 const sv=distToPoly(FLOW_LINES[1].pts,x,z);
 if(sv.d<20){
  h-=5.5*smooth(19,3.5,sv.d);
 }

 // Shaded cold-seep alcove carved into 16 strictly monotone-descending travertine/rimstone steps
 for(let i=0;i<RIM_POOLS.length;i++){
  const P=RIM_POOLS[i];
  const d=Math.hypot(x-P.x,z-P.z)/(P.r*(1+0.07*n2(x,z,0.12,210+i)));
  if(d<1.55){
   const pad=smooth(1.52,1.06,d);
   const inBowl=smooth(1.02,0.72,d);
   const onRim=smooth(1.24,1.01,d)*smooth(0.78,1.01,d);
   const target=mix(P.crest,P.floor,inBowl)+0.06*onRim;
   h=mix(h,target,pad);
  }
 }
 // Rocky chasm-spur promontory reserve for Dzagh-Vardzi
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.35){
  h=mix(h,98.0+0.8*n2(x,z,0.025,240),smooth(SITE.reserve.r*1.32,SITE.reserve.r*0.68,rd));
 }
 return h;
}

function landHead(x,z){
 // West: glacial cirque cradling SITE.tarn (-125, 35); center: periglacial moraine & snowfield bench; east (x > 140): high granite saddle to Silent Vales
 const T=SITE.tarn;
 let h=8.0+0.095*Math.max(0,x+40)+28*smooth(80,260,x);
 // Flanking alpine granite shoulders north and south of the Silent Vales col (colZ = -35)
 const colDz=Math.abs(z-SITE.hushPass.colZ);
 h+=115*smooth(48,255,colDz)*smooth(20,210,x);
 // Southern Copper-Glacier cirque headwall (z < -140) & northern ridge (z > 190)
 h+=128*smooth(-125,-380,z)+92*smooth(165,390,z);
 h+=11*n2(x,z,0.0045,301)+2.8*n2(x,z,0.019,302);

 // Moraine tarn basin
 const td=Math.hypot((x-T.x)/T.rx,(z-T.z)/T.rz)*(1+0.10*n2(x,z,0.014,303));
 if(td<1.38){
  const moraineLip=3.8*smooth(1.36,1.06,td)*smooth(0.82,1.06,td);
  h+=moraineLip;
  if(td<1.03){
   h=mix(T.floor+1.6*n2(x,z,0.03,304),h,smooth(0.62,1.03,td));
  }
 }
 // Snowmelt rill cut
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<16&&td>0.94){
  h-=1.8*smooth(15,2.5,rv.d);
 }
 // Periglacial sorted stone polygons (KFROST)
 if(FROST)h+=FROST.h(x,z);

 // 48 colonial thermogenic (+15 degC) hearth-ring rosettes: vertex-bevelled 1.2..2.0 m circular snow-melt wells!
 // Surrounding snowpack adds +0.52 m over the peat bench; inside d < r*1.35 it bevels cleanly down to bare peat (zero coplanar quads)
 const snowBench=smooth(-25,18,x)*smooth(175,135,x)*smooth(-55,-15,z)*smooth(185,140,z);
 if(snowBench>0.01){
  let wellCut=0;
  const W=SITE.meltWells;
  for(let i=0;i<W.length;i++){
   const mw=W[i],dx=x-mw.x,dz=z-mw.z;
   if(Math.abs(dx)>3.2||Math.abs(dz)>3.2)continue;
   const d=Math.hypot(dx,dz);
   if(d<mw.r*1.85){
    wellCut=Math.max(wellCut,smooth(mw.r*1.55,mw.r*0.72,d));
   }
  }
  h+=0.54*snowBench*(1.0-wellCut);
 }
 return h;
}

function land(x,z){
 if(SKEY==='shore')return landShore(x,z);
 if(SKEY==='wash')return landWash(x,z);
 return landHead(x,z);
}

function water(x,z){
 if(SKEY==='shore'){
  const seaLvl=-CROOK_STATE.drawdownM;
  const C=SITE.caldera,cd=Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz);
  if(cd<1.02&&landShore(x,z)<C.level-0.05)return C.level;
  if(x<95&&landShore(x,z)<seaLvl-0.04)return seaLvl;
  return -1e9;
 }
 if(SKEY==='wash'){
  for(let i=0;i<RIM_POOLS.length;i++){
   const P=RIM_POOLS[i];
   if(Math.hypot(x-P.x,z-P.z)<P.r*0.96)return P.level;
  }
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  if(rv.d<FLOW_LINES[0].w*0.95)return mix(31.5,-9.5,rv.t)+0.75;
  return -1e9;
 }
 const T=SITE.tarn,td=Math.hypot((x-T.x)/T.rx,(z-T.z)/T.rz);
 if(td<1.04&&landHead(x,z)<T.level-0.04)return T.level;
 return -1e9;
}

function landH(x,z){
 const r=Math.hypot(x,z);
 if(r<=TERR.R*1.06)return land(x,z);
 let far=0;
 if(SKEY==='shore'){
  far=x<-120?-35:(75+0.24*Math.max(0,x)+95*n2(x,z,0.00055,401)+32*n2(x,z,0.0018,402));
 }else if(SKEY==='wash'){
  const stC=Math.cos(SITE.gorge.strike),stS=Math.sin(SITE.gorge.strike);
  const v=-x*stS+z*stC;
  far=180+0.18*Math.abs(v)+120*n2(x,z,0.0005,403)+38*n2(x,z,0.0019,404);
 }else{
  // Eastward (+x) drops into the mist-shrouded trough of Silent Vales; westward/southward climbs toward Copper Glacier peaks
  const intoSilent=smooth(280,1800,x);
  far=mix(145+135*n2(x,z,0.00048,405),-95+45*n2(x,z,0.0006,406),intoSilent)+35*n2(x,z,0.0018,407);
 }
 return mix(land(x,z),far,smooth(TERR.R*0.96,TERR.R*1.35,r));
}

function floor0(){return 0;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return water(x,z);}
function elevASL(x,z){return SITE.baseElevM+terrainH(x,z);}

// Nearest melt-well query on Station 3 (head)
function nearestMeltWell(x,z){
 if(SKEY!=='head'||!SITE.meltWells)return{d:1e9,well:null};
 let bestD=1e9,bestW=null;
 const W=SITE.meltWells;
 for(let i=0;i<W.length;i++){
  const mw=W[i],d=Math.hypot(x-mw.x,z-mw.z);
  if(d<bestD){bestD=d;bestW=mw;}
 }
 return{d:bestD,well:bestW};
}

// ---------------------------------------------------------------- pure CROOK_PHYS field evaluation & raster cache
function physAt(x,z,h,nx,nzN,slope){
 const asl=SITE.baseElevM+h;
 if(SKEY==='shore'){
  const C=SITE.caldera,cd=Math.hypot((x-C.x)/C.rx,(z-C.z)/C.rz);
  const shelter=smooth(1.45,0.85,cd);
  const coastDistKm=Math.max(0,(x+95)/1000.0);
  const sp=CROOK_PHYS.sprayTrimAt({
   elevM:asl,coastDistKm:coastDistKm,wnwExposure01:1.0-0.75*shelter,calderaShelter01:shelter,
   silicaByte:SITE.minerals.silica,drawdownM:CROOK_STATE.drawdownM
  });
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  const tw=CROOK_PHYS.talwegSeepAt({elevM:asl,slope:slope,talwegDistM:rv.d,qLocalM3s:920,incision01:0.55,rainMm:SITE.rainMm});
  const ac=CROOK_PHYS.aspectClimateAt({elevM:asl,nx:nx,nz:nzN,rainMm:SITE.rainMm,leeShelter01:0,gorgeMist01:tw.gorgeMist01});
  return{sp:sp,tw:tw,ac:ac,bm:{skarnSeep01:0,silicaGlaze01:0,rustScale01:0,malachiteRind01:0,nephriteFloat01:0},hush:{suppression01:0,visualWindScale:1}};
 }
 if(SKEY==='wash'){
  const rv=distToPoly(FLOW_LINES[0].pts,x,z),sv=distToPoly(FLOW_LINES[1].pts,x,z);
  const dTal=Math.min(rv.d,sv.d*1.3);
  const tw=CROOK_PHYS.talwegSeepAt({elevM:asl,slope:slope,talwegDistM:dTal,qLocalM3s:240,incision01:0.82,rainMm:SITE.rainMm});
  const lee=smooth(20,130,z)*0.55;
  const ac=CROOK_PHYS.aspectClimateAt({elevM:asl,nx:nx,nz:nzN,rainMm:SITE.rainMm,leeShelter01:lee,gorgeMist01:tw.gorgeMist01});
  // Skarn & nephrite contact runs brightest along the shaded south-facing lower wall (z < 20)
  const skarnBand=smooth(55,-35,z);
  const bm=CROOK_PHYS.biomineralAt({
   jadeByte:SITE.minerals.jade*skarnBand,skarnByte:SITE.minerals.skarn*skarnBand,
   ironByte:SITE.minerals.iron*(0.45+0.55*skarnBand),copperByte:SITE.minerals.copper*0.5,tinByte:SITE.minerals.tin,
   seepDischarge01:Math.max(tw.seepDischarge01,0.75*skarnBand*smooth(140,15,dTal)),incision01:0.82,slope:slope
  });
  return{sp:{trimElevM:0,safeTownElevM:65,sprayMist01:0,fogBelt01:tw.gorgeMist01,basaltSpongeOk:false,canopySpongeOk:false,woodyOk:true},tw:tw,ac:ac,bm:bm,hush:{suppression01:0,visualWindScale:1}};
 }
 // Station 3 (head)
 const T=SITE.tarn,td=Math.hypot(x-T.x,z-T.z),rv=distToPoly(FLOW_LINES[0].pts,x,z);
 const tw=CROOK_PHYS.talwegSeepAt({elevM:asl,slope:slope,talwegDistM:Math.min(Math.max(0,td-115),rv.d),qLocalM3s:45,incision01:0.35,rainMm:SITE.rainMm});
 const ac=CROOK_PHYS.aspectClimateAt({elevM:asl,nx:nx,nz:nzN,rainMm:SITE.rainMm,leeShelter01:0.15,gorgeMist01:tw.gorgeMist01});
 const bm=CROOK_PHYS.biomineralAt({
  jadeByte:SITE.minerals.jade,skarnByte:120,ironByte:SITE.minerals.iron,copperByte:SITE.minerals.copper,tinByte:SITE.minerals.tin,
  seepDischarge01:Math.max(0.45,tw.seepDischarge01),incision01:0.55,slope:Math.max(0.24,slope)
 });
 const hush=CROOK_PHYS.hushAt({x:x,z:z,passLineX:SITE.hushPass.lineX,passNormalXZ:SITE.hushPass.normalXZ,bandWidthM:SITE.hushPass.bandWidthM});
 return{sp:{trimElevM:0,safeTownElevM:65,sprayMist01:0,fogBelt01:0,basaltSpongeOk:false,canopySpongeOk:false,woodyOk:asl<3320},tw:tw,ac:ac,bm:bm,hush:hush};
}

const FNAMES=['wet','flow','upland','canyon','rim','rock','slope','salt','cold','fog','mist','flat','spray','trim','skarn','sunny','snow','algae','hush'];
const FC=(function(){
 const N=280,S=TERR.R*2.2,a={};
 FNAMES.forEach(n=>{a[n]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i,hh=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*cs);
  const hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*cs);
  const nL=Math.hypot(hx,1,hz),nx=-hx/nL,nzN=-hz/nL,slope=clamp(Math.hypot(hx,hz),0,1.5);
  const P=physAt(x,z,hh,nx,nzN,slope);
  const w=waterH(x,z),inW=(w>-1e8&&w>=hh-0.05)?1:0;
  a.wet[k]=inW?1:P.tw.soilWet01;
  a.flow[k]=P.tw.floodScour01;
  a.upland[k]=SKEY==='shore'?smooth(58,95,hh):SKEY==='wash'?smooth(50,180,hh):smooth(15,90,hh);
  a.canyon[k]=SKEY==='wash'?smooth(180,25,Math.abs(z)):0;
  a.rim[k]=SKEY==='wash'?smooth(55,115,Math.abs(z))*smooth(220,145,Math.abs(z)):0;
  a.rock[k]=clamp(smooth(0.34,0.72,slope),0,1);
  a.slope[k]=clamp(slope,0,1);
  a.salt[k]=P.sp.sprayMist01*(1-inW);
  a.cold[k]=SKEY==='head'?clamp(0.55+0.45*smooth(0,95,hh),0,1):0;
  a.fog[k]=Math.max(P.sp.fogBelt01,P.tw.gorgeMist01);
  a.mist[k]=Math.max(P.sp.sprayMist01,P.tw.cascadeSpray01);
  a.flat[k]=clamp(1-smooth(0.22,0.58,slope),0,1);
  a.spray[k]=P.sp.basaltSpongeOk?1:0;
  a.trim[k]=P.sp.woodyOk?1:0;
  a.skarn[k]=Math.max(P.bm.silicaGlaze01,P.bm.rustScale01,P.bm.malachiteRind01);
  a.sunny[k]=P.ac.sunny01;
  let sn=0,alg=0;
  if(SKEY==='head'&&!inW){
   const snowBench=smooth(-28,16,x)*smooth(180,132,x)*smooth(-58,-14,z)*smooth(188,138,z);
   const highSnow=smooth(42,108,hh)*0.72;
   sn=clamp(Math.max(snowBench*0.92,highSnow)*(1-smooth(0.45,0.82,slope)),0,1);
   const mw=nearestMeltWell(x,z);
   if(mw.well&&mw.d<mw.well.r*2.45){
    // Bare warm peat inside mw.r, ringed by malachite-teal & rust-ochre cryo-snow algae on the surrounding collar!
    const bare=smooth(mw.well.r*1.28,mw.well.r*0.78,mw.d);
    const ring=smooth(mw.well.r*2.42,mw.well.r*1.32,mw.d)*smooth(mw.well.r*0.82,mw.well.r*1.25,mw.d);
    sn*=(1-bare);
    alg=Math.max(alg,ring*0.95);
   }
   // Wind-blown Copper Glacier cryo-snow algae streaks across the snowfield
   const streak=smooth(0.54,0.78,KRAND.fbm(x*0.022+z*0.008,0.5,z*0.048,2,529));
   alg=clamp(Math.max(alg,sn*streak*0.78),0,1);
  }
  a.snow[k]=sn;
  a.algae[k]=alg;
  a.hush[k]=P.hush.suppression01;
 }
 const Lc={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{
  if(x!==Lc.x||z!==Lc.z){
   const u=clamp((x/S+0.5)*(N-1),0,N-1.001),v=clamp((z/S+0.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);
   Lc.x=x;Lc.z=z;Lc.k=j*N+i;Lc.fu=u-i;Lc.fv=v-j;
  }
  const k=Lc.k,fu=Lc.fu,fv=Lc.fv;
  return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;
 };
 return{N:N,S:S,a:a,at:at};
})();
const FIELD={};
FNAMES.forEach(n=>{FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z);});

// ---------------------------------------------------------------- KSPACE spatial index & KHAZ data-driven hazards
const SPACE=KSPACE.create({cell:16});
// Pre-reserve settlement clearings so zero trees or rocks intrude into cultural reserve footprints
if(SITE.reserve){
 SPACE.insert({kind:'reserve',id:SITE.reserve.id},SITE.reserve.x,SITE.reserve.z,SITE.reserve.r);
}
// Pre-reserve rimstone pools on wash and melt-wells on head so conifers/boulders never punch through pool water or melt-well floors
for(let i=0;i<RIM_POOLS.length;i++){
 const P=RIM_POOLS[i];
 SPACE.insert({kind:'rimstone-pool',i:i},P.x,P.z,P.r+1.8);
}
if(SKEY==='head'&&SITE.meltWells){
 for(let i=0;i<SITE.meltWells.length;i++){
  const mw=SITE.meltWells[i];
  SPACE.insert({kind:'melt-well',i:i},mw.x,mw.z,mw.r+0.8);
 }
}

const HAZARDS=[];
if(typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
 const regHaz=(id,name,x,z,r,h,haz)=>{
  const y=terrainH(x,z);
  const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'crook',hazard:KHAZ.make(haz)}};
  KTAGS.page.add(rec);
  HAZARDS.push(rec);
 };
 if(SKEY==='shore'){
  regHaz('crook:spraybench','Crookshore Tsunami Spray-Bench Hazard',-25,20,95,65,{kind:'drown',effect:'drown',danger:0.75,dose:0.35,falloff:'linear'});
  regHaz('crook:meltwater-mouth','Kopa-Kawa Glacial Plunge Current',40,-42,36,8,{kind:'cold',effect:'freeze',danger:0.55,dose:0.25,falloff:'smooth'});
 }else if(SKEY==='wash'){
  regHaz('crook:meltwater-gorge','Vardzieti Gorge Whitewater Torrent',0,0,32,12,{kind:'cold',effect:'freeze',danger:0.6,dose:0.3,falloff:'smooth'});
  regHaz('crook:rimstone','Slick Iron-Jade Rimstone Terrace Lips',-90,-85,68,18,{kind:'slip',effect:null,danger:0.35,dose:0.15,falloff:'smooth'});
  regHaz('crook:rockfall-skarn','Fractured Skarn Chute Rockfall',-40,-165,45,90,{kind:'crush',effect:'bleed',danger:0.65,dose:0.3,falloff:'linear'});
 }else{
  regHaz('crook:meltwater-tarn','Subalpine Moraine Tarn Cold Water',SITE.tarn.x,SITE.tarn.z,115,12,{kind:'cold',effect:'freeze',danger:0.65,dose:0.35,falloff:'smooth'});
  regHaz('crook:hush','Silent Vales Acoustic Suppression Threshold',255,-35,95,80,{kind:'fall',effect:null,danger:0.25,dose:0.05,falloff:'linear'});
 }
}

// ---------------------------------------------------------------- BIO.init host binding
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<0.08)return 0;return d<0.45?(d-0.08)/0.37:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const SPINE=SKEY==='shore'?[[-35,10],[120,60],[210,-170],[195,165]]:SKEY==='wash'?[[-90,-85],[0,0],[110,-95],[60,130]]:[[-125,35],[45,60],[195,-35],[255,-35]];
BIO.init({
 tags:'crook',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:5207,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:210,mid:520,far:2100,floor:[145,380]},
 windows:{water:WBOX}
});
BIO.setSun([420,980,-680]);
