// ================================================================= HOST — stage: 5-station U-valleys, moss-gorges, Kanopi cove, Veilpass & Hush-Edge ([web])
// Implements all five Scale-Model 5.1 Veiled Mountains (rmwzq1pa88m7q) stations (PLAN.md section 5):
//   hall      (default, dist/veiledmountains.html):           Hoh nurse-log cathedral, 12 m giant tree-ferns & mire spore-spikes (+2,380 m)
//   gorge     (dist/veiledmountains-gorge.html):              Sol-Cleft 2-tier mossy megabreccia cataract, wedged logs & Z3 cloud-slope (+2,560 m)
//   kanopi    (dist/veiledmountains-kanopi.html):             95 m tilted Ancient circular canopy-oculus pouring a 65 m waterfall into a tarn (+2,650 m)
//   veilpass  (dist/veiledmountains-veilpass.html):           Glacial U-trough, braided torrent, lime-green slide-alder chutes & megabreccia spires (+3,520 m)
//   southvale (dist/veiledmountains-southvale.html):          Perpetual-fog pillow-moss boulder labyrinth, writhing cloud-oaks & red-peat trail (+2,880 m)
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
  try{
   KTAGS.page.add({
    id:o.tagId,
    name:o.name,
    class:o.tagClass||'feature',
    at:[o.x,o.y==null?0:o.y,o.z],
    r:o.r,
    h:o.h,
    tags:o.tags||{}
   });
  }catch(e){}
 }
}
function regHas(r,x,y,z){
 const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;
 return dx*dx+dz*dz<=r.r*r.r&&y>=ry-5&&y<=ry+r.h+10;
}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'hall';
const SITE=VEIL_SITES[SKEY]||VEIL_SITES.hall;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_MODE=PQ.get('mode')==='sunbreak'?'sunbreak':(PQ.get('mode')==='deepveil'?'deepveil':'veil');
const INIT_NIGHT=PQ.get('night')==='1';
const VEIL_STATE={
 mode:INIT_MODE,
 night:INIT_NIGHT,
 veilGain:INIT_MODE==='deepveil'?1.35:(INIT_MODE==='sunbreak'?0.65:1.0)
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=SKEY==='southvale'?0.98:1.03;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='veilpass'?0xc4d2d6:SKEY==='southvale'?0xa8c2be:SKEY==='kanopi'?0xb6ccc8:0xb4cac4;
const HAZE=new THREE.Color(HAZE_HEX);
// Omnipresent veil baseline: noticeable atmospheric haze across every station (never 0!)
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='southvale'?0.0024:SKEY==='kanopi'?0.0016:SKEY==='gorge'?0.0017:SKEY==='veilpass'?0.0011:0.0015);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
const hemiLight=new THREE.HemisphereLight(0xd8ece8,0x344636,0.92);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff2dc,SKEY==='southvale'?1.08:1.28);
sun.position.set(420,880,-460);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xc2dcd8,0.30);
fill.position.set(-480,360,520);
scene.add(fill);

// ---------------------------------------------------------------- 5-station heightfields, KRELIEF walls, KCARVE recesses, KSTACKS spires & KFROST
const TERR={R:660};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

// KRELIEF valley flanking walls for U-trough confinement
const WALL_N=KRELIEF.range({a:[-900,-280],b:[900,-280],h:SKEY==='veilpass'?220:165,w:210,crest:0.32,toe:0.18,serr:0.10,seed:SITE.seed+11});
const WALL_S=KRELIEF.range({a:[-900,280],b:[900,280],h:SKEY==='veilpass'?230:170,w:215,crest:0.32,toe:0.18,serr:0.10,seed:SITE.seed+12});

function flattenReserve(h,reserves,x,z,targetY,seed){
 if(!reserves||!reserves.length)return h;
 let out=h;
 for(let i=0;i<reserves.length;i++){
  const R=reserves[i],d=Math.hypot(x-R.x,z-R.z);
  if(d<R.r*1.36){
   out=mix(out,targetY+0.28*n2(x,z,0.02,seed+i*13),smooth(R.r*1.34,R.r*0.72,d));
  }
 }
 return out;
}

// Continuous river centerlines & monotone water profiles shared by terrainH and waterH
function hallStreamZ(x){
 return 13.5*Math.sin((x+60)*0.0085)+4.2*Math.cos(x*0.021);
}
function hallStreamY(x){
 return 1.45-2.80*clamp((x+420)/840,0,1);
}
function gorgeStreamZ(x){
 return x<36?0:11.0*Math.sin((x-36)*0.010);
}
function kanopiOutflowZ(x){
 return 9.5*Math.sin((x-50)*0.012);
}
function veilpassStreamZ(x){
 return 15.0*Math.sin((x+90)*0.0095)+5.5*Math.cos(x*0.024);
}
// Veilpass climbs eastward (x = -410 -> +310), so water flows EAST TO WEST (monotonically non-rising along pts!)
function veilpassWaterY(x){
 const u=clamp((310-x)/720,0,1);
 return 34.0-36.2*u;
}
function southvaleTrailZ(x){
 return 11.5*Math.sin((x+35)*0.0135)+3.5*Math.cos(x*0.028);
}

// Periglacial KFROST sorted stone polygons on upper Veilpass col bench (x > 85)
const FROST_PASS=(SKEY==='veilpass'&&typeof KFROST!=='undefined')?KFROST.create({
 seed:9244,
 ground:(x,z)=>22.0+0.06*x,
 polygons:{
  cell:15,
  trough:0.30,
  rim:0.09,
  width:0.16,
  where:(x,z)=>smooth(65,155,x)*smooth(18,85,Math.abs(z-veilpassStreamZ(x)))
 },
 lobes:{
  cell:26,
  h:1.1,
  where:(x,z)=>smooth(80,175,x)*smooth(32,95,Math.abs(z))
 }
}):null;

const FLOW_LINES=(function(){
 if(SKEY==='hall'){
  const pts=[];
  for(let i=0;i<=36;i++){
   const x=-420+(840*i)/36;
   pts.push([x,hallStreamZ(x)]);
  }
  return[{
   name:'Mist-Valley-2 Clear Cobble & Nurse-Log Salmon Stream',
   pts:pts,w:11.5,speed:1.35,levelTop:1.45,drop:2.80,
   keep:(x,z)=>smooth(11.5,16.5,Math.hypot(x+18,z+22))
  }];
 }
 if(SKEY==='gorge'){
  // Downstream outflow starting inside the (22, 0) jade plunge pool and fading in cleanly past its rim
  const pts=[];
  for(let i=0;i<=30;i++){
   const x=34+(386*i)/30;
   pts.push([x,gorgeStreamZ(x)]);
  }
  return[{
   name:'Sol-Cleft Lower Moss-Chasm Outflow Run',
   pts:pts,w:10.5,speed:1.95,levelTop:0.36,drop:2.20,
   keep:(x,z)=>smooth(0.88,1.12,Math.hypot((x-22)/34,z/21))
  }];
 }
 if(SKEY==='kanopi'){
  const pts=[];
  for(let i=0;i<=28;i++){
   const x=42+(378*i)/28;
   pts.push([x,kanopiOutflowZ(x)]);
  }
  return[{
   name:'Kanopi Oculus Tarn Mossy Outflow Brook',
   pts:pts,w:12.0,speed:1.25,levelTop:0.36,drop:1.85,
   keep:(x,z)=>smooth(0.88,1.12,Math.hypot((x-10)/50,z/38))
  }];
 }
 if(SKEY==='veilpass'){
  // Runs downstream EAST (+310, +34.0 m) to WEST (-410, -2.2 m)
  const pts=[];
  for(let i=0;i<=40;i++){
   const x=310-(720*i)/40;
   pts.push([x,veilpassStreamZ(x)]);
  }
  return[{
   name:'Veilpass Braided Glacial Boulder Meltwater Torrent',
   pts:pts,w:14.0,speed:2.85,levelTop:34.0,drop:36.2,
   keep:null
  }];
 }
 return[];
})();

function nurseMoundAt(x,z,logs){
 if(!logs||!logs.length)return 0;
 const nc=VEIL_PHYS.nurseColonnadeAt(x,z,{nurseLogs:logs});
 return nc.colonnade01>0?nc.colonnade01*0.58:0;
}

function landHall(x,z){
 const zs=hallStreamZ(x),dz=Math.abs(z-zs),wy=hallStreamY(x);
 const inStr=smooth(15.5,7.5,dz);
 const strBed=wy-1.45+0.18*n2(x,z,0.06,6101);
 // Gently rolling Hoh glacial-till moraine floor (+1.8..+11 m) framed by towering U-valley megabreccia walls
 const hummock=2.4*n2(x,z,0.014,6102)+1.1*n2(x,z,0.038,6103);
 const uWall=48.0*Math.pow(smooth(96,295,Math.abs(z)),1.45)+WALL_N(x,z)+WALL_S(x,z);
 let h=wy+1.85+3.6*smooth(16,68,dz)+hummock*(1-inStr*0.8)+uWall;
 // Boggy spore-spike backwater basin around (-18, -22)
 const dMire=Math.hypot(x+18,z+22);
 if(dMire<19.0){
  const mireLvl=hallStreamY(-18)+0.06;
  h=mix(h,mireLvl-0.85,smooth(16.5,8.5,dMire));
 }
 h+=nurseMoundAt(x,z,SITE.nurseLogs)*(1-inStr);
 h=flattenReserve(h,SITE.reserves,x,z,6.4,6120);
 return mix(h,strBed,inStr);
}

function landGorge(x,z){
 const zg=gorgeStreamZ(x),dz=Math.abs(z-zg);
 let h=0;
 if(x<-12){
  // Upper two-tier mossy megabreccia slot canyon (Tier 1 lip at x = -40: +24.6 -> +12.8 m; Tier 2 lip at x = -12: +12.6 -> +0.40 m)
  const step1=smooth(-37,-43,x);
  const bedBase=mix(11.35,23.35,step1)+0.22*n2(x,z,0.05,6201);
  const slotWall=(24.0+18.0*smooth(-12,-140,x))*smooth(8.5,24.0,dz)+34.0*smooth(26,145,dz);
  h=bedBase+slotWall+2.2*n2(x,z,0.018,6202);
 }else{
  // Deep emerald-jade plunge basin around (22, 0) & narrow mossy gorge opening downstream, flanked by Z3 cloud-belt slopes
  const dPool=Math.hypot((x-22)/34,z/21);
  const inPool=smooth(1.16,0.68,dPool);
  const poolBed=-4.6+0.55*n2(x,z,0.045,6203);
  const uRun=clamp((x-34)/386,0,1);
  const runWy=0.36-2.20*uRun;
  const inRun=x>30?smooth(14.5,7.2,dz):0;
  const runBed=runWy-1.65+0.20*n2(x,z,0.05,6204);
  // Steep Z2 mossy gorge walls climbing directly into Z3 epiphyte cloud-slope (+28..+72 m)
  const gorgeWall=28.0*smooth(18,52,dz)*smooth(140,-10,x)+42.0*smooth(48,195,dz)+WALL_N(x,z)*0.7+WALL_S(x,z)*0.7;
  let bank=runWy+2.2+gorgeWall+2.6*n2(x,z,0.015,6205);
  // Sunken dark-red peat root trail climbing the southern slope (z = +34..+54)
  const zTrail=42.0+6.0*Math.sin(x*0.022);
  const dTrail=Math.abs(z-zTrail);
  if(dTrail<5.5&&x>-30&&x<140){
   bank-=0.85*smooth(5.2,1.6,dTrail);
  }
  h=mix(bank,runBed,inRun);
  h=mix(h,poolBed,inPool);
 }
 // Crisp vertical lip at x = -12 within slot
 if(x>=-16&&x<=-8&&dz<14){
  h=mix(-3.2,12.55,smooth(-9.0,-14.5,x));
 }
 h+=nurseMoundAt(x,z,SITE.nurseLogs);
 h=flattenReserve(h,SITE.reserves,x,z,26.5,6220);
 return h;
}

function landKanopi(x,z){
 // Forested megabreccia amphitheatre headwall on the west (x < -28 rising to +118 m) cradling the 95 m tilted Kanopi oculus,
 // plunging into a calm lily-and-moss tarn centered at (10, 0) (rx=50, rz=38, level +0.40 m) and draining east
 const dTarn=Math.hypot((x-10)/50,z/38);
 const inTarn=smooth(1.14,0.70,dTarn);
 const tarnBed=-4.4+0.65*n2(x,z,0.04,6301);

 const zo=kanopiOutflowZ(x),dzOut=Math.abs(z-zo);
 const uOut=clamp((x-42)/378,0,1);
 const outWy=0.36-1.85*uOut;
 const inOut=x>38?smooth(15.5,7.8,dzOut):0;
 const outBed=outWy-1.55+0.20*n2(x,z,0.05,6302);

 // Amphitheatre headwall wrapping around the western & lateral cove
 const rCove=Math.hypot((x-8)*0.88,z*0.76)+3.0*n2(x,z,0.022,6303);
 const westWall=94.0*smooth(-24,-96,x)+28.0*smooth(-90,-220,x);
 const coveWrap=58.0*smooth(56,148,rCove)*(x<95?1.0:smooth(220,95,x));
 let land=outWy+2.1+Math.max(westWall,coveWrap)+22.0*smooth(135,310,Math.abs(z))+2.8*n2(x,z,0.014,6304);
 land+=nurseMoundAt(x,z,SITE.nurseLogs);
 land=flattenReserve(hOr(land),SITE.reserves,x,z,5.8,6320);

 let h=mix(land,outBed,inOut);
 h=mix(h,tarnBed,inTarn);
 // Ensure clean sheer cliff drop right below Kanopi's lower waterfall lip (x = -32, z = 0) so the 65 m curtain falls in open air!
 const dPlungeSlot=Math.hypot((x+22)/16,z/15);
 if(dPlungeSlot<1.2&&x>-31){
  h=mix(h,-4.2,smooth(1.15,0.55,dPlungeSlot));
 }
 return h;
}
function hOr(v){return v;}

function landVeilpass(x,z){
 // Glaciated parabolic U-trough climbing eastward toward the snowy White Col, split by slide-alder avalanche aprons
 const zs=veilpassStreamZ(x),dz=Math.abs(z-zs),wy=veilpassWaterY(x);
 const inTor=smooth(18.0,8.5,dz)*(x<=312?1:0);
 const torBed=wy-1.65+0.32*n2(x,z,0.07,6401);

 // Parabolic U-valley cross-profile + eastern col ramp
 const colRamp=x>180?46.0*smooth(180,420,x):0;
 const uParabola=112.0*Math.pow(clamp((dz-22)/185,0,1.6),1.65)+WALL_N(x,z)*0.85+WALL_S(x,z)*0.85;
 // Avalanche talus fan bulges at SITE.chutes
 let fanLift=0;
 if(SITE.chutes){
  for(let i=0;i<SITE.chutes.length;i++){
   const ch=SITE.chutes[i];
   const sSide=(z-zs)*ch.side;
   if(sSide>8){
    const ax=Math.abs(x-ch.x)/(ch.w*(0.65+0.55*clamp(sSide/90,0,1)));
    if(ax<1.2){
     fanLift+=7.5*(1-ax*ax*0.68)*smooth(10,48,sSide)*(1-smooth(95,165,sSide));
    }
   }
  }
 }
 let h=wy+1.9+3.8*smooth(16,42,dz)+uParabola+colRamp+fanLift+2.9*n2(x,z,0.013,6402)+1.1*n2(x,z,0.036,6403);
 if(FROST_PASS)h+=FROST_PASS.h(x,z);
 h=flattenReserve(h,SITE.reserves,x,z,wy+6.5,6420);
 return mix(h,torBed,inTor);
}

function landSouthvale(x,z){
 // Perpetual-fog moraine boulder hollow with sculpted bryophyte waves, winding sunken red-peat trail, and mossy tarn
 const zt=southvaleTrailZ(x),dt=Math.abs(z-zt);
 const onTrail=smooth(4.8,1.7,dt);
 // Sculpted boulder-cushion hummocks (1.0-2.4 m waves off the red-peat path!)
 const pillowWave=(1.85*Math.abs(n2(x,z,0.055,6501))+1.25*n2(x,z,0.022,6502))*(1-onTrail*0.90);
 const basinRise=26.0*Math.pow(smooth(58,240,Math.abs(z)),1.35)+18.0*smooth(140,360,Math.hypot(x,z));
 let h=2.6+basinRise+pillowWave-0.72*onTrail;

 // Quiet mossy bog tarn at (-24, -44) (level +0.45 m)
 const dBog=Math.hypot((x+24)/22,(z+44)/16);
 if(dBog<1.25){
  h=mix(h,-1.35+0.18*n2(x,z,0.06,6503),smooth(1.18,0.62,dBog));
 }
 h+=nurseMoundAt(x,z,SITE.nurseLogs)*(1-onTrail);
 h=flattenReserve(h,SITE.reserves,x,z,5.4,6520);
 return h;
}

function rawTerrainH(x,z){
 if(SKEY==='hall')return landHall(x,z);
 if(SKEY==='gorge')return landGorge(x,z);
 if(SKEY==='kanopi')return landKanopi(x,z);
 if(SKEY==='veilpass')return landVeilpass(x,z);
 return landSouthvale(x,z);
}

// KCARVE undercut alcoves on Station 2 (gorge plunge hood) & Station 3 (Kanopi cliffside intake socket)
if(typeof KCARVE!=='undefined'&&PQ.get('carve')!=='0'){
 KCARVE.clear();
 if(SKEY==='gorge'){
  KCARVE.add({
   id:'gorge-plunge-undercut',
   kind:'undercut',
   c:[-11,0],
   n:[1,0],
   hw:11.0,
   depth:5.5,
   h:8.5,
   floorY:-3.8,
   base:rawTerrainH,
   margin:6.0,
   pad:2.2,
   cell:1.2,
   name:'Sol-Cleft Mossy Megabreccia Plunge Undercut'
  });
 }else if(SKEY==='kanopi'){
  KCARVE.add({
   id:'kanopi-oculus-niche',
   kind:'niche',
   c:[-48,0],
   n:[1,0],
   hw:26.0,
   depth:12.0,
   h:32.0,
   floorY:24.0,
   base:rawTerrainH,
   margin:8.0,
   pad:2.5,
   cell:2.0,
   name:'Kanopi Cliffside Megabreccia Intake Socket'
  });
 }
}

function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.12)return rawTerrainH(x,z);
 const rim=rawTerrainH(x*(TERR.R/d),z*(TERR.R/d));
 // Towering Veiled Mountains megabreccia massif walls rising around the U-valleys
 const far=185.0*smooth(TERR.R*1.12,5600,d)+68.0*n2(x,z,0.00048,9290)+24.0*n2(x,z,0.0014,9291);
 return rim+far;
}

function terrainH(x,z){return rawTerrainH(x,z);}

function waterH(x,z){
 if(SKEY==='hall'){
  if(Math.hypot(x+18,z+22)<13.5)return hallStreamY(-18)+0.06;
  const zs=hallStreamZ(x);
  if(x>=-420&&x<=420&&Math.abs(z-zs)<12.0)return hallStreamY(x);
  return -1e9;
 }
 if(SKEY==='gorge'){
  if(x>=-120&&x<=-40&&Math.abs(z)<9.0)return 24.60;
  if(x>=-40&&x<=-12&&Math.abs(z)<9.5)return 12.80;
  if(Math.hypot((x-22)/34,z/21)<1.02)return 0.40;
  const zg=gorgeStreamZ(x);
  if(x>=34&&x<=420&&Math.abs(z-zg)<11.0)return 0.36-2.20*clamp((x-34)/386,0,1);
  return -1e9;
 }
 if(SKEY==='kanopi'){
  if(Math.hypot((x-10)/50,z/38)<1.02)return 0.40;
  const zo=kanopiOutflowZ(x);
  if(x>=42&&x<=420&&Math.abs(z-zo)<12.5)return 0.36-1.85*clamp((x-42)/378,0,1);
  return -1e9;
 }
 if(SKEY==='veilpass'){
  const zs=veilpassStreamZ(x);
  if(x>=-410&&x<=310&&Math.abs(z-zs)<14.5)return veilpassWaterY(x);
  return -1e9;
 }
 // Station 5 (southvale): quiet mossy bog pool at (-24, -44)
 if(Math.hypot((x+24)/20,(z+44)/14.5)<1.0)return 0.45;
 return -1e9;
}

// Fast gridded field cache for 3-layer KGROUND masks, mist field, & deterministic species placement
const FC=(function(){
 const R=TERR.R*1.12,N=232,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),rock=new Float32Array(nx*nx),wet=new Float32Array(nx*nx);
 const mist=new Float32Array(nx*nx),peat=new Float32Array(nx*nx),chute=new Float32Array(nx*nx),snow=new Float32Array(nx*nx);

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  const y=terrainH(x,z);
  h[k]=y;
  const wy=waterH(x,z);
  wet[k]=wy>-1e5?smooth(4.8,-0.2,y-wy):(SKEY==='southvale'?0.38:0.18);
  const mObj=VEIL_PHYS.mistAt(x,z,SITE,{hour:8.5,mode:VEIL_STATE.mode,localY:y});
  mist[k]=mObj.totalMist01;

  // Peat trail / bog hollow mask
  let pt=0;
  if(SKEY==='southvale'){
   pt=smooth(5.2,1.5,Math.abs(z-southvaleTrailZ(x)));
  }else if(SKEY==='gorge'){
   pt=smooth(5.8,1.8,Math.abs(z-(42.0+6.0*Math.sin(x*0.022))))*(x>-30&&x<140?1:0);
  }else{
   pt=clamp(wet[k]*0.55+0.35*(KRAND.fbm(x*0.022,0.5,z*0.022,2,9251)-0.35),0,1);
  }
  peat[k]=clamp(pt,0,1);

  // Slide-alder avalanche chute mask on Veilpass
  let ch=0;
  if(SKEY==='veilpass'&&SITE.chutes){
   const zs=veilpassStreamZ(x);
   for(let c=0;c<SITE.chutes.length;c++){
    const C0=SITE.chutes[c],sSide=(z-zs)*C0.side;
    if(sSide>6&&sSide<165){
     const ax=Math.abs(x-C0.x)/(C0.w*(0.65+0.55*clamp(sSide/90,0,1)));
     ch=Math.max(ch,smooth(1.15,0.45,ax)*smooth(6,22,sSide)*(1-smooth(125,168,sSide)));
    }
   }
  }
  chute[k]=ch;
  snow[k]=SKEY==='veilpass'?clamp(smooth(22,58,y)+0.35*smooth(110,280,x),0,1):0;
 }

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  rock[j*nx+i]=clamp(smooth(0.28,0.76,Math.hypot(sx,sz)),0,1);
 }

 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 return{a:{h:h,rock:rock,wet:wet,mist:mist,peat:peat,chute:chute,snow:snow},at:at};
})();

const FIELD={
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),
 peat:(x,z)=>FC.at(FC.a.peat,x,z),
 chute:(x,z)=>FC.at(FC.a.chute,x,z),
 snow:(x,z)=>FC.at(FC.a.snow,x,z)
};

const SPACE=KSPACE.create({cell:12});
const HAZARDS=[];

BIO.init({
 THREE:THREE,
 scene:scene,
 camera:camera,
 renderer:renderer,
 terrainH:terrainH,
 waterH:waterH,
 mask:(x,z)=>terrainH(x,z)-Math.max(-1e4,waterH(x,z)),
 center:[0,0],
 radius:TERR.R
});
