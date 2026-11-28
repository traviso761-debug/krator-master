// ================================================================= HOST — stage: 5-station ricochet crater bowls, hydrology, KRELIEF, KFROST, KCARVE & KTHERM ([web])
// Implements all 5 Ricochet Peaks stations (PLAN.md section 3):
//   ringlake (default, dist/ricochetpeaks.html):            Yuni-Gate central-peak island, annular moat-lake & Yuni pioneer clearing (+3,250 m)
//   notch    (dist/ricochetpeaks-notch.html):               Skippers Notch 180 m doublet breach, twin crater lakes & bandit eyrie (+3,820 m)
//   vents    (dist/ricochetpeaks-vents.html):               East Hearth 6 fumaroles, sinter terraces, emerald hot lake & snowBare oasis (+3,180 m)
//   glasssheet (dist/ricochetpeaks-glasssheet.html):        Jet-black tagamite impact-melt floor, bonsai melt-pines & meteoric Ni creek (+3,580 m)
//   highbowl (dist/ricochetpeaks-highbowl.html):            +5,100 m ET Erebus steam-ice chimneys, warm steam-cave & frozen tarn
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
 return dx*dx+dz*dz<=r.r*r.r&&y>=ry-4&&y<=ry+r.h+8;
}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'ringlake';
const SITE=RICOCHET_SITES[SKEY]||RICOCHET_SITES.ringlake;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_DUSK=PQ.get('night')==='1'||PQ.get('mode')==='dusk';
const INIT_SNOW=PQ.get('snowmode')==='1'||SKEY==='vents'||SKEY==='highbowl';
const RP_STATE={
 mode:INIT_DUSK?'dusk':'day',
 dusk01:INIT_DUSK?1.0:0.0,
 snowDepth:SKEY==='highbowl'?0.72:(SKEY==='vents'?0.52:(PQ.get('snowmode')==='1'?0.58:0.18))
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='highbowl'?0xc8d8e6:SKEY==='vents'?0xc6dce0:SKEY==='glasssheet'?0xc2ced8:0xc6d6e2;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='vents'?0.00024:SKEY==='highbowl'?0.00022:0.00018);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,24000);
const hemiLight=new THREE.HemisphereLight(0xdcebf8,0x3c4842,0.88);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff3de,1.40);
sun.position.set(460,920,-480);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xc4dcef,0.26);
fill.position.set(-520,390,540);
scene.add(fill);

// ---------------------------------------------------------------- 5-station crater heightfields, KRELIEF, KFROST, KCARVE & KTHERM
const TERR={R:680};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

function flattenReserve(h,reserves,x,z,seed){
 if(!reserves||!reserves.length)return h;
 let out=h;
 for(let i=0;i<reserves.length;i++){
  const R=reserves[i],d=Math.hypot(x-R.x,z-R.z);
  const ty=R.targetY==null?8.0:R.targetY;
  if(d<R.r*1.38){
   out=mix(out,ty+0.28*n2(x,z,0.024,seed+i*13),smooth(R.r*1.35,R.r*0.70,d));
  }
 }
 return out;
}

// Shared KRELIEF septum range + 180 m wind-gap notch for Station 2 (notch)
const NOTCH_SEPTUM_RANGE=typeof KRELIEF!=='undefined'?KRELIEF.range({
 a:[0,-660],b:[0,660],h:138.0,w:185.0,crest:0.34,toe:0.16,serr:0.10,seed:9205
}):null;
const NOTCH_GAP_REC=typeof KRELIEF!=='undefined'?KRELIEF.gap({
 a:[-160,0],b:[160,0],w:180.0,floorW:32.0,wall:31.0,floor:24.2,drop:1.6,wind:true,rough:0.10,seed:9206
}):null;

// KCARVE rock overhangs on Station 2 (Skippers Notch bandit shelter) & Station 5 (Old Rim warm steam-cave)
const CARVE=(typeof KCARVE!=='undefined'&&KCARVE.create)?KCARVE.create():null;

// Periglacial KFROST patterned polygons & sorted circles on cold floors (glasssheet, highbowl & crater frost hollows)
const FROST=(typeof KFROST!=='undefined'&&KFROST.create)?KFROST.create({
 seed:SITE.seed+40,
 ground:(x,z)=>0,
 polygons:{
  cell:SKEY==='highbowl'?14:18,
  trough:SKEY==='highbowl'?0.32:0.22,
  rim:0.07,
  width:0.16,
  where:(x,z)=>{
   if(SKEY==='highbowl')return smooth(70,108,Math.hypot(x-36,z-14));
   if(SKEY==='glasssheet')return smooth(250,120,Math.hypot(x,z))*smooth(58,82,Math.hypot(x-118,z-18));
   return 0.25*smooth(320,255,Math.hypot(x,z));
  }
 }
}):null;

// Hydrothermal KTHERM field (synced with SITE.vents on vents & highbowl)
const THERM=(typeof KTHERM!=='undefined'&&KTHERM.create&&SITE.vents&&SITE.vents.length)?KTHERM.create({
 soil:SITE.soilTempC,
 vents:SITE.vents.map((v,i)=>({
  id:v.id||(SKEY+'-vent-'+i),
  kind:'point',
  x:v.x,
  z:v.z,
  T:v.T,
  reach:v.reach,
  decay:2.1
 })),
 detail:{amp:1.1,scale:0.02,seed:SITE.seed+88},
 world:'ricochetpeaks-'+SKEY
}):null;
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const THERM_F=THERM?THERM.bake({box:THERM_BOX,cell:8}):null;

// Creek centerlines shared by terrainH and waterH (terminate <= 10 m inside lake shorelines for 100% water-mouths compliance!)
function ringCreekPt(t){
 // Runs down NW crater talus from (-368, -196) across moat outer shoreline (-224, -118) and terminates 12 m inside at (-214, -113)
 const x=lerp(-368,-214,t),z=lerp(-196,-113,t)+7.5*Math.sin(t*Math.PI*2.0)*(1-t);
 return[x,z];
}
function ventsCreekPt(t){
 // Runs down N crater apron from (18, -330) into East Hearth hot-spring lake north rim (z=-99), terminating 11 m inside at (22, -88)
 const x=lerp(18,22,t)+8.0*Math.sin(t*Math.PI*2.0)*(1-t),z=lerp(-330,-88,t);
 return[x,z];
}
function nickelCreekZ(x){
 // Winds from (-238, -22) across the tagamite floor and curves cleanly into Melt-Sheet Tarn west lip at (44..56, +18)
 return lerp(-22.0,18.0,smooth(-45,46,x))+14.0*Math.sin((x+220)*0.016)*(1-smooth(10,50,x));
}

function channelCarveFromPts(pts,x,z,halfW,depth){
 let best=1e9,bestT=0;
 for(let i=0;i+1<pts.length;i++){
  const ax=pts[i][0],az=pts[i][1],bx=pts[i+1][0],bz=pts[i+1][1];
  const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;
  const u=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1);
  const d=Math.hypot(x-(ax+dx*u),z-(az+dz*u));
  if(d<best){best=d;bestT=(i+u)/(pts.length-1);}
 }
 return{d:best,t:bestT,w:smooth(halfW+4.5,halfW-1.5,best),cut:depth*smooth(halfW+4.5,halfW-1.5,best)};
}

const RING_CREEK_PTS=(function(){const a=[];for(let i=0;i<=26;i++)a.push(ringCreekPt(i/26));return a;})();
const VENTS_CREEK_PTS=(function(){const a=[];for(let i=0;i<=26;i++)a.push(ventsCreekPt(i/26));return a;})();
const NICKEL_CREEK_PTS=(function(){
 // Runs from x = -238 across the black tagamite pavement to Melt-Sheet Tarn west lip (x = 44), ending 11 m inside at x = 55
 const a=[];
 for(let i=0;i<=30;i++){
  const x=lerp(-238,55,i/30);
  a.push([x,nickelCreekZ(x)]);
 }
 return a;
})();

const FLOW_LINES=(function(){
 if(SKEY==='ringlake'){
  return[{name:'Yuni-Gate NW Snowmelt Chute Creek',pts:RING_CREEK_PTS,w:5.8,speed:1.65,levelTop:34.8,levelBot:2.36}];
 }
 if(SKEY==='vents'){
  return[{name:'East Hearth North Wall Meltwater Run',pts:VENTS_CREEK_PTS,w:5.4,speed:1.45,levelTop:32.4,levelBot:1.76}];
 }
 if(SKEY==='glasssheet'){
  return[{name:'Glass-Pan Meteoritic Iron-Nickel Placer Creek',pts:NICKEL_CREEK_PTS,w:5.6,speed:1.30,levelTop:11.6,levelBot:0.56}];
 }
 return[];
})();

function baseRinglake(x,z){
 // Central rebound peak island (rx=110, rz=92) surrounded by annular moat-lake (rEll = 1.0..1.0 across outer rx=262, rz=232) and rising crater walls
 const rIn=Math.hypot(x/110.0,z/92.0)+0.04*n2(x,z,0.022,9102);
 const rOut=Math.hypot(x/262.0,z/232.0)+0.04*n2(x,z,0.014,9103);
 let h=2.40;
 if(rIn<1.05){
  // Forested central rebound peak rising to +46 m at centre, sloping cleanly into +2.40 m moat water at rIn = 1.0
  const dome=Math.pow(clamp(1.0-rIn*rIn*0.92,0,1),1.28);
  h=2.40+43.5*dome+2.2*n2(x,z,0.025,9104)*smooth(1.02,0.72,rIn)-3.5*smooth(0.92,1.05,rIn);
 }else if(rOut<1.02){
  // Annular sapphire moat-lake bed (-9.2 m deep in mid-channel, rising smoothly to +2.40 m at outer shore rOut = 1.0)
  const uMoat=clamp((rIn-1.0)/(Math.max(0.12,(rIn/rOut)-1.0+1e-4)),0,1);
  const mid=Math.sin(clamp((rOut-0.44)/0.56,0,1)*Math.PI);
  h=2.40-10.8*Math.max(0.15,mid)+0.55*n2(x,z,0.035,9105);
 }else{
  // Outer crater-floor frost-sedge bench (+2.5..+7.5 m) rising into thermal-belt spruce-larch talus apron & steep suevite walls (+165 m)
  const apron=5.2*smooth(1.0,1.18,rOut)+46.0*Math.pow(smooth(1.14,1.85,rOut),1.25)+128.0*Math.pow(smooth(1.75,2.68,rOut),1.55);
  const chutes=5.5*Math.sin(Math.atan2(z,x)*11.0+n2(x,z,0.01,9106)*2.5)*smooth(1.35,2.3,rOut);
  h=2.45+apron+chutes+2.8*n2(x,z,0.012,9107);
 }
 // Incise NW snowmelt creek bed cleanly into outer apron down to moat shoreline
 const ck=channelCarveFromPts(RING_CREEK_PTS,x,z,6.2,1.45);
 if(ck.w>0.01&&rOut>0.94){
  const wy=lerp(34.8,2.36,ck.t);
  h=mix(h,wy-1.05,ck.w*0.92);
 }
 h=flattenReserve(h,SITE.reserves,x,z,9120);
 return h;
}

function baseNotchNoCarve(x,z){
 // Septum ridge along x = 0 separating Skippers W bowl (x < -92, lake at +4.20 m) and North Crater bowl (x > +92, lake at -9.60 m)
 const sept=NOTCH_SEPTUM_RANGE?NOTCH_SEPTUM_RANGE(x,z):135.0*smooth(185,0,Math.abs(x));
 const westBowl=x<0?(-14.5*smooth(-78,-155,x)*(1-0.35*smooth(190,290,Math.abs(z)))):0;
 const eastBowl=x>0?(-26.0*smooth(78,158,x)*(1-0.35*smooth(190,290,Math.abs(z)))):0;
 const wallWrap=92.0*Math.pow(smooth(220,640,Math.abs(z)),1.45)+48.0*smooth(440,670,Math.abs(x));
 let h=11.0+sept+westBowl+eastBowl+wallWrap+3.2*n2(x,z,0.013,9202)+1.1*n2(x,z,0.032,9203);
 if(NOTCH_GAP_REC&&typeof KRELIEF!=='undefined'&&KRELIEF.gapH){
  // Carve the 180 m breached suevite septum V-notch at z = 0, saddle +24.2 m
  const gNotch=KRELIEF.gapH(NOTCH_GAP_REC,x,z,h);
  const blend=smooth(205,85,Math.abs(x));
  h=mix(h,gNotch,blend);
 }
 h=flattenReserve(h,SITE.reserves,x,z,9220);
 return h;
}

function baseVents(x,z){
 // East Hearth Crater floor (+2.2..+18 m) cradling emerald hot-spring lake at (26, 12) (+1.80 m) & 6 raised sinter mounds
 const ol=SITE.oasisLake;
 const rLake=Math.hypot((x-ol.cx)/ol.rx,(z-ol.cz)/ol.rz)+0.05*n2(x,z,0.02,9302);
 const rWall=Math.hypot(x/310.0,z/285.0);
 let h=1.80;
 if(rLake<1.02){
  h=1.80-8.6*smooth(1.0,0.42,rLake)+0.45*n2(x,z,0.04,9303);
 }else{
  const bench=3.8*smooth(1.0,1.22,rLake)+38.0*Math.pow(smooth(1.05,1.72,rWall),1.32)+124.0*Math.pow(smooth(1.65,2.35,rWall),1.55);
  h=1.85+bench+2.4*n2(x,z,0.013,9304);
 }
 // Raise white silica sinter mounds around each of the 6 hydrothermal vents
 for(let i=0;i<SITE.vents.length;i++){
  const v=SITE.vents[i],dv=Math.hypot(x-v.x,z-v.z);
  if(dv<v.r*3.6){
   const topY=i===5?14.2:(i===0?9.8:(6.4+0.6*(i%3)));
   const rimLift=smooth(v.r*3.4,v.r*1.08,dv);
   const poolCup=smooth(v.r*1.02,v.r*0.55,dv);
   const target=topY-1.35*poolCup;
   h=mix(h,target,rimLift*0.92);
  }
 }
 // Sculpt 5-stepped silica sinter terrace apron from West Terrace Spring (-92,-58) toward (-42,-18)
 {
  const ux=x+92,uz=z+58,Lx=50,Lz=40,L2=Lx*Lx+Lz*Lz;
  const u=clamp((ux*Lx+uz*Lz)/L2,0,1);
  const perp=Math.abs((-ux*Lz+uz*Lx)/Math.sqrt(L2));
  if(perp<22&&u>0.02&&u<0.98){
   const levels=[13.4,11.2,9.0,6.8,4.4];
   const sIdx=Math.min(4,Math.floor(u*5));
   const tread=levels[sIdx]-0.85;
   h=mix(h,tread,smooth(20,9,perp)*0.88);
  }
 }
 // North wall snowmelt creek channel
 const ck=channelCarveFromPts(VENTS_CREEK_PTS,x,z,5.8,1.30);
 if(ck.w>0.01&&rLake>0.92){
  const wy=lerp(32.4,1.76,ck.t);
  h=mix(h,wy-0.95,ck.w*0.90);
 }
 h=flattenReserve(h,SITE.reserves,x,z,9320);
 return h;
}

function baseGlasssheet(x,z){
 // Flat ropy jet-black tagamite impact-melt floor (rx=245, rz=192) with pressure-ridge blisters, melt-sheet tarn at (118,18) & placer creek
 const ms=SITE.meltSheet;
 const rTarn=Math.hypot((x-ms.tarnCx)/ms.tarnRx,(z-ms.tarnCz)/ms.tarnRz)+0.04*n2(x,z,0.028,9402);
 const rMelt=Math.hypot(x/ms.rx,z/ms.rz);
 let h=4.8+5.2*smooth(0.25,1.05,rMelt)+1.35*Math.sin(x*0.048+n2(x,z,0.02,9403)*3.0)*smooth(1.15,0.35,rMelt)+1.8*n2(x,z,0.015,9404);
 if(rMelt>0.92){
  h+=42.0*Math.pow(smooth(0.95,1.65,rMelt),1.32)+126.0*Math.pow(smooth(1.58,2.65,rMelt),1.55);
 }
 if(rTarn<1.08){
  h=mix(h,ms.tarnLevelY-5.6*smooth(1.02,0.45,rTarn),smooth(1.08,0.88,rTarn));
 }
 // Carve meteoritic iron-nickel placer creek from (-238, -22) gently down into Melt-Sheet Tarn (+0.60 m)
 const ck=channelCarveFromPts(NICKEL_CREEK_PTS,x,z,6.0,1.35);
 if(ck.w>0.01&&rTarn>0.88){
  const wy=lerp(11.6,0.56,ck.t);
  h=mix(h,wy-0.95,ck.w*0.92);
 }
 if(FROST)h+=FROST.h(x,z);
 h=flattenReserve(h,SITE.reserves,x,z,9420);
 return h;
}

function baseHighbowlNoCarve(x,z){
 // Perched +5,100 m ET cryofumarole bowl: frozen tarn at (36,14) (+1.20 m), warm fumarole benches on west, steep ice-mantled crater walls
 const it=SITE.iceTarn;
 const rTarn=Math.hypot((x-it.cx)/it.rx,(z-it.cz)/it.rz)+0.04*n2(x,z,0.025,9502);
 const rWall=Math.hypot(x/255.0,z/225.0);
 let h=3.8+6.4*smooth(0.35,1.05,rWall)+48.0*Math.pow(smooth(0.98,1.72,rWall),1.35)+138.0*Math.pow(smooth(1.65,2.65,rWall),1.55)+2.2*n2(x,z,0.014,9503);
 if(rTarn<1.06){
  h=mix(h,it.levelY-3.8*smooth(1.0,0.45,rTarn),smooth(1.06,0.86,rTarn));
 }
 // Raise gentle warm sinter-and-rime collars under each Erebus chimney
 for(let i=0;i<SITE.chimneys.length;i++){
  const ch=SITE.chimneys[i],dc=Math.hypot(x-ch.x,z-ch.z);
  if(dc<ch.r*3.2){
   h=mix(h,Math.max(h,5.6+1.8*(i%2)),smooth(ch.r*3.0,ch.r*1.1,dc)*0.75);
  }
 }
 if(FROST)h+=FROST.h(x,z);
 h=flattenReserve(h,SITE.reserves,x,z,9520);
 return h;
}

if(CARVE&&SITE.carveAlcove){
 const ca=SITE.carveAlcove;
 const baseFn=SKEY==='notch'?baseNotchNoCarve:baseHighbowlNoCarve;
 CARVE.add({
  id:ca.id,
  kind:'alcove',
  c:ca.c,
  n:ca.n,
  hw:ca.hw,
  depth:ca.depth,
  h:ca.h,
  floorY:ca.floorY,
  margin:6.5,
  pad:2.2,
  cell:0.65,
  base:baseFn,
  name:SKEY==='notch'?'Skippers Notch Bandit Overhang Alcove':'Old Rim Erebus Warm Steam-Cave Mouth'
 });
}

function rawTerrainH(x,z){
 if(SKEY==='ringlake')return baseRinglake(x,z);
 if(SKEY==='notch'){
  const h0=baseNotchNoCarve(x,z);
  return CARVE&&CARVE.patches.length?CARVE.fold(h0,x,z,{steep:36}):h0;
 }
 if(SKEY==='vents')return baseVents(x,z);
 if(SKEY==='glasssheet')return baseGlasssheet(x,z);
 const h0=baseHighbowlNoCarve(x,z);
 return CARVE&&CARVE.patches.length?CARVE.fold(h0,x,z,{steep:36}):h0;
}

// Towering 360-degree snow-crowned 3.5-5.8 km crater ring-wall amphitheatre for KFAR & KHORIZON ring-shadow!
function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.08)return rawTerrainH(x,z);
 const rim=rawTerrainH(x*(TERR.R/d),z*(TERR.R/d));
 const ang=Math.atan2(z,x);
 // Oblique skipping-stone breach saddles along WNW (-2.75 rad) and ESE (+0.38 rad) trajectory!
 const breachWNW=smooth(0.42,0.08,Math.abs(Math.atan2(Math.sin(ang+2.76),Math.cos(ang+2.76))));
 const breachESE=smooth(0.40,0.08,Math.abs(Math.atan2(Math.sin(ang-0.38),Math.cos(ang-0.38))));
 const notchDip=1.0-0.52*Math.max(breachWNW,breachESE);
 const ringWall=(2450.0*Math.pow(smooth(TERR.R*1.08,6800.0,d),1.22)+1650.0*smooth(6200.0,15500.0,d))*notchDip;
 const serration=(260.0*Math.abs(n2(x,z,0.00042,9610))+115.0*n2(x,z,0.0011,9611))*smooth(TERR.R*1.12,4200.0,d);
 return rim+ringWall+serration;
}

function terrainH(x,z){return rawTerrainH(x,z);}

function waterH(x,z){
 if(SKEY==='ringlake'){
  const rIn=Math.hypot(x/110.0,z/92.0);
  const rOut=Math.hypot(x/262.0,z/232.0);
  if(rIn>=0.96&&rOut<=1.02)return SITE.moat.levelY;
  const ck=channelCarveFromPts(RING_CREEK_PTS,x,z,5.8,1.0);
  if(ck.d<5.8)return lerp(34.8,2.36,ck.t);
  return -1e9;
 }
 if(SKEY==='notch'){
  if(x<-88&&Math.abs(z)<255)return SITE.notchSpec.westLakeY;
  if(x>88&&Math.abs(z)<255)return SITE.notchSpec.eastLakeY;
  return -1e9;
 }
 if(SKEY==='vents'){
  for(let i=0;i<SITE.vents.length;i++){
   const v=SITE.vents[i];
   if(Math.hypot(x-v.x,z-v.z)<=v.r*1.02){
    return (i===5?14.2:(i===0?9.8:(6.4+0.6*(i%3))))-0.45;
   }
  }
  const ol=SITE.oasisLake;
  if(Math.hypot((x-ol.cx)/ol.rx,(z-ol.cz)/ol.rz)<=1.02)return ol.levelY;
  const ck=channelCarveFromPts(VENTS_CREEK_PTS,x,z,5.4,1.0);
  if(ck.d<5.4)return lerp(32.4,1.76,ck.t);
  return -1e9;
 }
 if(SKEY==='glasssheet'){
  const ms=SITE.meltSheet;
  if(Math.hypot((x-ms.tarnCx)/ms.tarnRx,(z-ms.tarnCz)/ms.tarnRz)<=1.02)return ms.tarnLevelY;
  const ck=channelCarveFromPts(NICKEL_CREEK_PTS,x,z,5.6,1.0);
  if(ck.d<5.6)return lerp(11.6,0.56,ck.t);
  return -1e9;
 }
 const it=SITE.iceTarn;
 if(Math.hypot((x-it.cx)/it.rx,(z-it.cz)/it.rz)<=1.02)return it.levelY;
 return -1e9;
}

// Fast gridded field cache for <= 3-layer KGROUND masks & deterministic placement
const FC=(function(){
 const R=TERR.R*1.12,N=224,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),rock=new Float32Array(nx*nx),wet=new Float32Array(nx*nx);
 const glass=new Float32Array(nx*nx),heat=new Float32Array(nx*nx),sinter=new Float32Array(nx*nx);
 const nickel=new Float32Array(nx*nx),frost=new Float32Array(nx*nx);

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  const y=terrainH(x,z);
  h[k]=y;
  const sc=RICOCHET_PHYS.shatterConeAt(x,z,SITE);
  glass[k]=sc.tagamite01;
  const ht=RICOCHET_PHYS.heatAt(x,z,SITE);
  const thT=THERM_F?KTHERM.fieldAt(THERM_F,x,z):ht.surfaceTempC;
  heat[k]=Math.max(ht.heatLiftC,thT-SITE.soilTempC);
  sinter[k]=ht.sinter01;
  const ma=RICOCHET_PHYS.meteoricAnomalyAt(x,z,SITE);
  nickel[k]=ma.indicator01;
  const wy=waterH(x,z);
  wet[k]=wy>-1e5?smooth(4.8,-0.2,y-wy):0;
  const bt=RICOCHET_PHYS.bowlTreelineAt(x,z,y-1.8,heat[k],SITE);
  frost[k]=bt.frostHollow01;
 }
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  rock[j*nx+i]=clamp(smooth(0.24,0.68,Math.hypot(sx,sz))+glass[j*nx+i]*0.26,0,1);
 }
 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 return{a:{h:h,rock:rock,wet:wet,glass:glass,heat:heat,sinter:sinter,nickel:nickel,frost:frost},at:at};
})();

const FIELD={
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 glass:(x,z)=>FC.at(FC.a.glass,x,z),
 heat:(x,z)=>FC.at(FC.a.heat,x,z),
 sinter:(x,z)=>FC.at(FC.a.sinter,x,z),
 nickel:(x,z)=>FC.at(FC.a.nickel,x,z),
 frost:(x,z)=>FC.at(FC.a.frost,x,z)
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
