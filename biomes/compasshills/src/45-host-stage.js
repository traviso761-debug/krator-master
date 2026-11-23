// ================================================================= HOST — stage: cuesta/tor/quench-moat/gorge terrain, KSPACE, KHAZ & BIO.init
// Implements all 4 verified Compass Hills stations (biomes/compasshills/PLAN.md section 3):
//   foundry (default, dist/compasshills.html):        Lodestone (1058, 224) toroidal cryo-ring quench-moat, vent throats & arcology reserve
//   tors    (--station tors, compasshills-tors.html): (1128, 248) 60 m banded-ironstone cuesta scarp & 9 lightning-struck magnetite spires
//   cuesta  (--station cuesta, -cuesta.html):         (1046, 258) dry-summer Csa dip-slope & 180-deg magnetic domain-wall saddle
//   gorge   (--station gorge, -gorge.html):           (1055, 219) 9102 Ham-Tsek (1,080 m^3/s) magnetite river narrows & ferry terrace
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

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'foundry';
const SITE=COMPASS_SITES[SKEY]||COMPASS_SITES.foundry;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

// Interactive live host states modulated by UI buttons in 99-host-take.js
const COMPASS_STATE={
 squall:PQ.get('squall')==='1',
 fieldOverlay:PQ.get('overlay')==='1',
 strikeCount:0,
 lastStrikeSpire:-1
};

const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';BIO.LOD.merge=PQ.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='tors'?0xc6ccd2:SKEY==='cuesta'?0xded2bc:SKEY==='gorge'?0xcdd2c8:0xd8cebc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='tors'?0.00026:SKEY==='gorge'?0.00028:0.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.4,18000);
scene.add(new THREE.HemisphereLight(0xeaf0f4,0x5e5240,0.84));
const sun=new THREE.DirectionalLight(0xfff2dc,1.38);
sun.position.set(480,1020,-620);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8e4ee,0.22);
fill.position.set(-580,360,620);
scene.add(fill);

// ---------------------------------------------------------------- station landforms (KRELIEF + analytical cuesta/quench/gorge relief)
const TERR={R:720};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

// KRELIEF scarp & cuesta ridges for structural upland relief
const TORS_SCARP=(SKEY==='tors'&&typeof KRELIEF!=='undefined'&&KRELIEF.range)?KRELIEF.range({
 a:[-520,-95],b:[520,-35],h:64,w:185,crest:0.32,toe:0.18,serr:0.12,seed:9102
}):null;
const CUESTA_NORTH_RIDGE=(SKEY==='cuesta'&&typeof KRELIEF!=='undefined'&&KRELIEF.range)?KRELIEF.range({
 a:[-540,-210],b:[540,-165],h:38,w:195,crest:0.38,toe:0.22,serr:0.07,seed:9103
}):null;
const CUESTA_SOUTH_RIDGE=(SKEY==='cuesta'&&typeof KRELIEF!=='undefined'&&KRELIEF.range)?KRELIEF.range({
 a:[-540,195],b:[540,235],h:44,w:205,crest:0.36,toe:0.22,serr:0.08,seed:9104
}):null;

// River / brook polylines per station (strictly downstream)
const FLOW_LINES=(function(){
 if(SKEY==='foundry'){
  // Rust-stained cuesta brook skirting the outer south-east rim of the toroidal quench-ring
  const pts=[];
  for(let i=0;i<=20;i++){
   const t=i/20,x=340-660*t,z=285-45*t+22*Math.sin(t*4.4);
   pts.push([x,z]);
  }
  return[{name:'Ferruginous Cuesta Brook',pts:pts,w:4.8,depth:0.48,speed:1.4}];
 }
 if(SKEY==='tors'){
  // Escarpment spring rill cascading off the footwall bench
  const pts=[];
  for(let i=0;i<=18;i++){
   const t=i/18,x=210-410*t,z=145+55*t+16*Math.sin(t*4.8);
   pts.push([x,z]);
  }
  return[{name:'Ironstone Scarp Spring Rill',pts:pts,w:4.2,depth:0.42,speed:1.7}];
 }
 if(SKEY==='cuesta'){
  // Seasonal Csa dip-slope spring rill along the eastern valley toe
  const pts=[];
  for(let i=0;i<=16;i++){
   const t=i/16,x=265-25*t+14*Math.sin(t*3.8),z=-240+490*t;
   pts.push([x,z]);
  }
  return[{name:'Saffron Terrace Dip-Slope Brook',pts:pts,w:3.8,depth:0.38,speed:1.2}];
 }
 // Station 4 (gorge): 9102 Ham-Tsek (Web-Cleaver River, Q = 1,080 m^3/s) carving black magnetite narrows
 const main=[];
 const stC=Math.cos(SITE.river.strike),stS=Math.sin(SITE.river.strike);
 for(let i=0;i<=32;i++){
  const t=i/32,u=620-1240*t;
  const bend=42*Math.sin(t*4.6+0.35);
  main.push([u*stC-bend*stS,u*stS+bend*stC]);
 }
 return[{name:'9102 Ham-Tsek (Web-Cleaver River)',pts:main,w:36,depth:2.4,speed:2.5}];
})();

// Rock-cut rain cisterns / quarry basins (WATER.still)
const STILL_POOLS=(function(){
 if(SKEY==='foundry')return[{name:'Quench-Trench Iron-Iridescent Cistern',x:148,z:168,r:11.5}];
 if(SKEY==='tors')return[{name:'Magnetite Quarry Rain Basin',x:-86,z:112,r:10.5}];
 if(SKEY==='cuesta')return[{name:'Saffron Dip-Slope Spring Cistern',x:108,z:-86,r:9.5}];
 return[{name:'Placer Eddy Backwater Pool',x:-92,z:46,r:12.0}];
})();

// Delver / quarry / ferry zero-iron trail polyline per station
const TRAIL_PTS=(function(){
 if(SKEY==='foundry')return[[-245,195],[-192,154],[-148,118],[-112,86]];
 if(SKEY==='tors')return[[-168,136],[-118,96],[-72,54],[-38,18]];
 if(SKEY==='cuesta')return[[-95,38],[-32,12],[0,0],[36,-14],[118,-95]];
 return[[68,148],[108,126],[138,112],[168,88]];
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

function landFoundry(x,z){
 // Gentle NNW-dipping cuesta bench (+876.5 m datum) incised by the 225 m-radius circular cryo-magnet quench-trench
 let h=6.0-0.024*z+0.012*x+11.5*n2(x,z,0.0032,6101)+2.6*n2(x,z,0.014,6102);
 const r=Math.hypot(x,z)*(1+0.035*n2(x,z,0.012,6103));
 const Rring=SITE.toroidRadiusM,hw=SITE.trenchHalfWidthM;
 // Raised outer ironstone cuesta collar (+11 m) & inner subsided toroidal quench-trench (-21 m)
 const outerLip=10.5*smooth(Rring+hw*2.4,Rring+hw*0.95,r)*smooth(Rring-hw*0.2,Rring+hw*0.95,r);
 const innerLip=6.5*smooth(Rring-hw*2.1,Rring-hw*0.92,r)*smooth(Rring+hw*0.1,Rring-hw*0.92,r);
 const trenchCut=SITE.trenchDepthM*Math.exp(-Math.pow((r-Rring)/(hw*0.78),2));
 h+=outerLip+innerLip-trenchCut;

 // 6 collapsed quench-vent throat shoulders & bare iron-sand ripple slabs along the ring rim
 for(let i=0;i<SITE.quenchVents.length;i++){
  const v=SITE.quenchVents[i],dv=Math.hypot(x-v.x,z-v.z);
  if(dv<34){
   const shoulder=4.8*smooth(32,12,dv)*smooth(3.5,11,dv)-3.2*smooth(9.5,2.5,dv);
   h+=shoulder;
  }
 }
 // Held-clear central arcology reserve pad at (0, 0, r = 96 m)
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.25){
  h=mix(h,8.5+0.8*n2(x,z,0.018,6104),smooth(SITE.reserve.r*1.22,SITE.reserve.r*0.72,rd));
 }
 // Brook channel & cistern basin
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<22){
  const bed=mix(4.5,-6.5,rv.t);
  h=mix(h,Math.min(h,bed),smooth(21,4.5,rv.d));
 }
 const sp=STILL_POOLS[0],dp=Math.hypot(x-sp.x,z-sp.z);
 if(dp<sp.r*1.55){
  h=mix(h,-11.8,smooth(sp.r*1.45,sp.r*0.72,dp));
 }
 return h;
}

function landTors(x,z){
 // Asymmetric cuesta: gentle NNW dip-slope (z < -70) breaking into a steep 58 m SSE-facing banded-ironstone scarp (z = -70..+45)
 let h=18.0-0.085*z+14*n2(x,z,0.0035,6201)+3.2*n2(x,z,0.016,6202);
 if(TORS_SCARP)h+=TORS_SCARP(x,z);
 // Crisp cuesta cliff step across z = -55..+35
 h+=26.0*smooth(42,-58,z);
 // Pedestal crags under the 9 prominent lightning-struck magnetite spires
 for(let i=0;i<SITE.torSpires.length;i++){
  const sp=SITE.torSpires[i],d=Math.hypot(x-sp.x,z-sp.z);
  if(d<38){
   h+=0.26*sp.promM*smooth(36,6.5,d);
  }
 }
 // Reserve quarry bench
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.4){
  h=mix(h,6.5+0.5*n2(x,z,0.02,6203),smooth(SITE.reserve.r*1.35,SITE.reserve.r*0.72,rd));
 }
 // Spring rill & quarry rain basin
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<18){
  const bed=mix(14.0,-6.0,rv.t);
  h=mix(h,Math.min(h,bed),smooth(17,3.8,rv.d));
 }
 const p0=STILL_POOLS[0],dp=Math.hypot(x-p0.x,z-p0.z);
 if(dp<p0.r*1.55){
  h=mix(h,2.2,smooth(p0.r*1.45,p0.r*0.72,dp));
 }
 return h;
}

function landCuesta(x,z){
 // Warm-temperate Csa dip-slope saddle: gentle cuestas north & south framing the crisp magnetic domain-wall saddle along z ~ 0
 let h=10.5+0.018*Math.abs(z)-0.022*x+9.5*n2(x,z,0.0034,6301)+2.2*n2(x,z,0.015,6302);
 if(CUESTA_NORTH_RIDGE)h+=CUESTA_NORTH_RIDGE(x,z);
 if(CUESTA_SOUTH_RIDGE)h+=CUESTA_SOUTH_RIDGE(x,z);
 // Smooth saddle floor across the domain-wall corridor (|z - seamZ| < 32 m) so the 180-deg compassbush flip reads cleanly
 const seamZ=14*Math.sin(x*0.0055);
 const ds=Math.abs(z-seamZ);
 if(ds<42){
  h=mix(h,8.0-0.016*x+1.2*n2(x,z,0.012,6303),smooth(40,12,ds)*0.65);
 }
 // Olive & saffron terrace reserve
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.4){
  h=mix(h,11.5+0.4*n2(x,z,0.02,6304),smooth(SITE.reserve.r*1.35,SITE.reserve.r*0.72,rd));
 }
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 if(rv.d<18){
  const bed=mix(12.5,-4.5,rv.t);
  h=mix(h,Math.min(h,bed),smooth(17,3.5,rv.d));
 }
 const p0=STILL_POOLS[0],dp=Math.hypot(x-p0.x,z-p0.z);
 if(dp<p0.r*1.55){
  h=mix(h,6.2,smooth(p0.r*1.45,p0.r*0.72,dp));
 }
 return h;
}

function landGorge(x,z){
 // 9102 Ham-Tsek (Web-Cleaver River) slicing 88 m banded-ironstone palisades with black magnetite placer bars
 const rv=distToPoly(FLOW_LINES[0].pts,x,z);
 const riverBed=mix(6.5,-5.5,rv.t)-3.2;
 // Broad black-sand placer point-bar shelf (rv.d = 34..68 m) then steep banded-ironstone canyon bluffs rising +85 m
 const inChannel=smooth(44,26,rv.d);
 const bluffRise=SITE.river.wallH*smooth(56,175,rv.d)+24*smooth(170,420,rv.d);
 let h=riverBed+3.4*(1-inChannel)+bluffRise+9.5*n2(x,z,0.004,6401)+2.4*n2(x,z,0.018,6402);

 // Held-clear Ham-Tsek Silk Post terrace bench at (138, 112, r = 46 m) safely above flood stage (+18 m local)
 const rd=Math.hypot(x-SITE.reserve.x,z-SITE.reserve.z);
 if(rd<SITE.reserve.r*1.45){
  h=mix(h,18.5+0.5*n2(x,z,0.02,6403),smooth(SITE.reserve.r*1.42,SITE.reserve.r*0.72,rd));
 }
 const p0=STILL_POOLS[0],dp=Math.hypot(x-p0.x,z-p0.z);
 if(dp<p0.r*1.5){
  const barLvl=mix(6.5,-5.5,0.62)-0.85;
  h=mix(h,barLvl-0.65,smooth(p0.r*1.42,p0.r*0.72,dp));
 }
 return h;
}

function land(x,z){
 if(SKEY==='tors')return landTors(x,z);
 if(SKEY==='cuesta')return landCuesta(x,z);
 if(SKEY==='gorge')return landGorge(x,z);
 return landFoundry(x,z);
}

const POOL_LEVELS=STILL_POOLS.map(P=>{
 // Set each still pool surface cleanly 0.55 m above its carved basin floor
 const floorY=land(P.x,P.z);
 return Object.assign({},P,{floor:floorY,level:+(floorY+0.58).toFixed(3)});
});

function water(x,z){
 for(let i=0;i<POOL_LEVELS.length;i++){
  const P=POOL_LEVELS[i];
  if(Math.hypot(x-P.x,z-P.z)<P.r*1.12&&land(x,z)<P.level-0.03)return P.level;
 }
 const FL=FLOW_LINES[0],rv=distToPoly(FL.pts,x,z);
 if(rv.d<FL.w*1.05){
  if(SKEY==='gorge')return mix(6.5,-5.5,rv.t)-0.75;
  if(SKEY==='foundry')return mix(4.5,-6.5,rv.t)+0.35;
  if(SKEY==='tors')return mix(14.0,-6.0,rv.t)+0.32;
  return mix(12.5,-4.5,rv.t)+0.30;
 }
 return -1e9;
}

function landH(x,z){
 const r=Math.hypot(x,z);
 if(r<=TERR.R*1.06)return land(x,z);
 let far=35+88*n2(x,z,0.00055,6501)+28*n2(x,z,0.0018,6502);
 if(SKEY==='tors')far=65-0.05*z+125*n2(x,z,0.0005,6503)+36*n2(x,z,0.0019,6504);
 else if(SKEY==='gorge')far=78+95*n2(x,z,0.00052,6505)+30*n2(x,z,0.0018,6506);
 return mix(land(x,z),far,smooth(TERR.R*0.96,TERR.R*1.35,r));
}

const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return water(x,z);}
function elevASL(x,z){return SITE.baseElevM+terrainH(x,z);}

// ---------------------------------------------------------------- pure COMPASS_PHYS raster cache & field functions
const FNAMES=['wet','flow','upland','canyon','rim','rock','slope','flat','sunny','sand','gossan','trail','lichen','bmag','seam'];
const FC=(function(){
 const N=260,S=TERR.R*2.2,a={};
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
  const mf=COMPASS_PHYS.fieldAt(x,z,SKEY);
  const ssSand=COMPASS_PHYS.sandStreamAt(x,z,slope,SITE.minerals.iron,mf.bMagMt,mf.gradB2);
  const rv=distToPoly(FLOW_LINES[0].pts,x,z);
  const tr=distToPoly(TRAIL_PTS,x,z);
  const w=waterH(x,z),inW=(w>-1e8&&w>=hh-0.05)?1:0;

  let trench01=0;
  if(SKEY==='foundry'){
   const dr=Math.abs(Math.hypot(x,z)-SITE.toroidRadiusM);
   trench01=smooth(SITE.trenchHalfWidthM*1.35,SITE.trenchHalfWidthM*0.45,dr);
  }
  const ca=COMPASS_PHYS.cuestaAspectAt({
   elevM:SITE.baseElevM+hh,nx:nx,nz:nzN,rainMmYr:SITE.rainMmYr,
   bMagMt:mf.bMagMt,inversionSeam01:mf.inversionSeam01,riverDistM:SKEY==='gorge'?rv.d:9999,quenchTrench01:trench01
  });

  a.wet[k]=inW?1:clamp(ca.moisture01*0.65+0.55*smooth(FLOW_LINES[0].w+26,FLOW_LINES[0].w,rv.d),0,1);
  a.flow[k]=smooth(FLOW_LINES[0].w+14,FLOW_LINES[0].w*0.7,rv.d);
  a.upland[k]=smooth(-5,45,hh);
  a.canyon[k]=SKEY==='gorge'?smooth(140,35,rv.d):trench01;
  a.rim[k]=SKEY==='foundry'?smooth(58,18,Math.abs(Math.hypot(x,z)-SITE.toroidRadiusM)):SKEY==='tors'?smooth(48,-22,z):0;
  a.rock[k]=clamp(smooth(0.30,0.68,slope),0,1);
  a.slope[k]=clamp(slope,0,1);
  a.flat[k]=clamp(1-smooth(0.20,0.52,slope),0,1);
  a.sunny[k]=clamp(0.55+0.40*nzN,0,1);
  // Black Fe3O4 magnetite sand ripples on bare ironstone rims, spire aprons & gorge point-bars
  let sandMask=ssSand.streakContrast01*0.65;
  if(SKEY==='foundry')sandMask=Math.max(sandMask,smooth(64,22,Math.abs(Math.hypot(x,z)-SITE.toroidRadiusM))*(1-trench01*0.7)*a.flat[k]);
  else if(SKEY==='tors')sandMask=Math.max(sandMask,smooth(35,-45,z)*a.flat[k]*0.82);
  else if(SKEY==='gorge')sandMask=Math.max(sandMask,smooth(72,36,rv.d)*(1-inW)*0.92);
  else sandMask=Math.max(sandMask,mf.inversionSeam01*0.55*a.flat[k]);
  a.sand[k]=clamp(sandMask,0,1);
  a.gossan[k]=clamp(trench01*(0.65+0.35*a.rock[k]),0,1);
  a.trail[k]=clamp(smooth(6.2,1.8,tr.d)*(1-inW),0,1);
  a.lichen[k]=clamp(smooth(2.2,18.0,mf.bMagMt)*(0.45+0.55*a.rock[k]),0,1);
  a.bmag[k]=clamp(mf.bMagMt/100.0,0,1);
  a.seam[k]=mf.inversionSeam01;
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

// ---------------------------------------------------------------- KSPACE non-overlap & KHAZ data-driven magnetic/lightning hazards
const SPACE=KSPACE.create({cell:16});
if(SITE.reserve){
 SPACE.insert({kind:'reserve',id:SITE.reserve.id},SITE.reserve.x,SITE.reserve.z,SITE.reserve.r);
}
for(let i=0;i<POOL_LEVELS.length;i++){
 const P=POOL_LEVELS[i];
 SPACE.insert({kind:'still-pool',i:i},P.x,P.z,P.r+2.2);
}

const HAZARDS=[];

// ---------------------------------------------------------------- BIO.init host binding
function rootMask(x,z){const d=terrainH(x,z)-waterH(x,z);if(d<0.08)return 0;return d<0.45?(d-0.08)/0.37:1;}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const SPINE=SKEY==='foundry'?[[-185,140],[0,-225],[225,0],[0,0]]
 :SKEY==='tors'?[[-145,-68],[8,-76],[162,-48],[-118,96]]
 :SKEY==='cuesta'?[[-120,-45],[0,0],[120,45],[142,-118]]
 :[[-140,-20],[0,10],[138,112],[180,35]];

BIO.init({
 tags:'compasshills',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:910220,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:220,mid:520,far:2100,floor:[150,390]},
 windows:{water:WBOX}
});
BIO.setSun([480,1020,-620]);
