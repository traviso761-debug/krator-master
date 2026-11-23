/* ================================================================= HOST — stage: 4-station laccolith dome heightfields, KBASIN, KSCOUR, KMASK, KSPACE, KHAZ & BIO.init ([web])
   Implements all 4 verified sibling-exclusive own_dm Scale-Model 5.1 stations of The Dome (rmweubdnyts8y):
     apron (default, dist/thedome.html):       (1336, 128) +2,268.5 m, 1.20 atm, onion-skin bald-rock apron, 128 gnamma sky-mirrors & 3 A-tent lithophones
     moat  (dist/thedome-moat.html):           (1317, 117) +1,749.1 m, 1.29 atm, arcuate ring-dike hogback, seepage pitcher-fen & whispering scarp
     crown (dist/thedome-crown.html):          (1328, 150) +2,924.8 m, 1.11 atm, lenticular Crown-Veil cap-cloud & concentric treeline garlands
     cleft (dist/thedome-cleft.html):          (1372, 148) +2,537.7 m, 1.17 atm, 40 m radial unloading Kluft fissure & KSPELEO.SMOKY smoky-quartz vault
*/
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
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
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z,ry=r.y==null?0:r.y;return dx*dx+dz*dz<=r.r*r.r&&y>=ry-6&&y<=ry+r.h+10;}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'apron';
const SITE=DOME_SITES[SKEY]||DOME_SITES.apron;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

/* Live hydroperiod & weather state driven by [Vernal-Brim] / [Sun-Baked Dry] / [Crown-Mist] buttons */
const DOME_STATE={
 mode:SKEY==='crown'?'Crown-Mist':'Vernal-Brim',
 hydroperiod01:PQ.has('hydro')?clamp(+PQ.get('hydro'),0,1):(SKEY==='crown'?0.78:0.74),
 mistBoost:SKEY==='crown'?0.82:0.08,
 baroPulse:1.0,
 lastChimeHz:0
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
/* B4 Vertical-Stack biome indexing & chunk LOD culling defaults */
{BIO.INDEX_ITEMS=PQ.get('index')!=='0';
 BIO.LOD.merge=PQ.get('lodmerge')!=='0';
 BIO.LOD.minTris=1800;
 BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='crown'?0xd4dde4:SKEY==='moat'?0xd2dcd6:SKEY==='cleft'?0xd4d2ce:0xd6d8dc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='crown'?0.00034:SKEY==='moat'?0.00028:0.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
scene.add(new THREE.HemisphereLight(0xe6ecf2,0x58504c,0.86));
const sun=new THREE.DirectionalLight(0xfff4e2,1.38);
sun.position.set(460,920,-610);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd6e4ee,0.24);
fill.position.set(-560,380,610);
scene.add(fill);

const TERR={R:720};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

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

/* 1. KSCOUR radial rainwater sheetwash drainage courses (Stations 1 & 2) */
const SCOUR_COURSES=(function(){
 if(SKEY==='apron'){
  return[
   {name:'apron-west-flute',pts:[[-88,320],[-74,140],[-68,-40],[-64,-280]],bed:[64,34,4,-38],floor:18,walls:26,depth:4,islandL:90,islandW:18,fan:0},
   {name:'apron-east-flute',pts:[[96,320],[108,130],[118,-60],[128,-280]],bed:[66,35,3,-39],floor:16,walls:24,depth:4,islandL:90,islandW:18,fan:0}
  ];
 }
 if(SKEY==='moat'){
  return[
   {name:'moat-west-sheetwash',pts:[[-54,280],[-48,165],[-44,82],[-40,34]],bed:[58,28,8,0.2],floor:14,walls:22,depth:3,islandL:80,islandW:16,fan:24},
   {name:'moat-east-sheetwash',pts:[[46,280],[40,165],[34,82],[28,34]],bed:[56,27,7.5,0.2],floor:14,walls:22,depth:3,islandL:80,islandW:16,fan:24}
  ];
 }
 return[];
})();

const DOME_SCOUR=(typeof KSCOUR!=='undefined'&&SCOUR_COURSES.length)?KSCOUR.create({
 seed:SITE.seed+31,
 courses:SCOUR_COURSES,
 falls:{count:0}
}):null;

/* Sheetwash WATER.flow polylines matching SCOUR_COURSES (cross-fading cleanly into moat fen on Station 2!) */
const FLOW_LINES=(function(){
 if(SKEY==='apron'){
  return[
   {name:'Apron West Sheetwash Flute Rill',pts:[[-84,240],[-74,120],[-68,0],[-65,-185]],w:2.6,depth:0.22,speed:1.45,endFade:22},
   {name:'Apron East Sheetwash Flute Rill',pts:[[100,230],[108,110],[116,-15],[124,-185]],w:2.4,depth:0.20,speed:1.35,endFade:22}
  ];
 }
 if(SKEY==='moat'){
  /* Terminate & cross-fade cleanly via keep + endFade right at the z = +36 fen margin so 0 overlap & 100% water-mouths! */
  return[
   {name:'Inner Apron West Sheetwash Cascade',pts:[[-54,245],[-49,155],[-45,84],[-41,38]],w:3.2,depth:0.24,speed:1.55,endFade:18,fenFade:true},
   {name:'Inner Apron East Sheetwash Cascade',pts:[[45,245],[40,155],[35,84],[29,38]],w:3.0,depth:0.24,speed:1.50,endFade:18,fenFade:true}
  ];
 }
 return[];
})();

/* 2. KRELIEF.slab upturned ring-dike & sandstone collar scarp on Station 2 (moat) */
const MOAT_SLAB=(SKEY==='moat'&&typeof KRELIEF!=='undefined'&&typeof KRELIEF.slab==='function')?KRELIEF.slab({
 pts:[[-520,-78],[-180,-124],[0,-134],[180,-122],[520,-74]],
 side:1,
 h:138,
 run:148,
 power:1.42,
 dip:0.09,
 seed:6215,
 spurs:{sp:115,spread:[0.75,1.25],w:[0.60,0.86],out:[18,52],run:[0.8,1.25],power:[1.15,1.75],dh:[-0.04,0.04],tip:[0.02,0.07]},
 gullies:{back:[18,54]},
 cones:{h:[8,22],reach:[42,92]},
 skirt:{h:0.03,reach:0.28},
 ledges:{n:4,w:0.11,wander:0.025,k:[0.82,1.65]},
 rough:{face:0.026,flute:0.016,crest:0.038}
}):null;

/* 3. KMASK.canvas + KMASK.distance deterministic CPU masks (zero getImageData!) */
const DOME_MASKS=(function(){
 if(typeof KMASK==='undefined'||!KMASK.canvas||!KMASK.distance)return null;
 const W=256,S=TERR.R*2.2,toPx=v=>W*0.5+(v/S)*W;
 const mv=KMASK.canvas(W,W),ctx=mv.getContext('2d');
 ctx.fillStyle='#000000';ctx.fillRect(0,0,W,W);
 ctx.strokeStyle='#ffffff';
 if(SKEY==='crown'){
  ctx.lineWidth=3;
  for(let r=46;r<=322;r+=46){
   ctx.beginPath();ctx.arc(toPx(0),toPx(0),(r/S)*W,0,TAU);ctx.stroke();
  }
 }else if(SKEY==='moat'&&SITE.fenPools){
  ctx.fillStyle='#ffffff';
  for(let i=0;i<SITE.fenPools.length;i++){
   const P=SITE.fenPools[i];
   ctx.beginPath();ctx.arc(toPx(P.cx),toPx(P.cz),(Math.min(P.rx,P.rz)/S)*W,0,TAU);ctx.fill();
  }
 }else{
  ctx.lineWidth=3;
  for(let i=0;i<FLOW_LINES.length;i++){
   const pts=FLOW_LINES[i].pts;
   ctx.beginPath();
   for(let k=0;k<pts.length;k++){
    const px=toPx(pts[k][0]),pz=toPx(pts[k][1]);
    if(k===0)ctx.moveTo(px,pz);else ctx.lineTo(px,pz);
   }
   ctx.stroke();
  }
 }
 const dist=KMASK.distance(mv,{channel:0,threshold:128});
 return{
  hash:KMASK.hash(mv),
  distHash:KMASK.distanceHash(dist),
  distM(x,z){
   const u=clamp((x/S+0.5)*W,0,W-0.01),v=clamp((z/S+0.5)*W,0,W-0.01);
   return dist.sample(u,v)*(S/W);
  }
 };
})();

/* 4. Base onion-skin exfoliation shell step carver (before gnamma basin stamping) */
function onionStepOffset(x,z,site){
 const c=site.domeCenterLocal,sp=site.shellSpacingM;
 const rx=x-c[0],rz=z-c[1],r=Math.hypot(rx,rz);
 const warp=(KRAND.fbm(x*0.0055,0.5,z*0.0055,2,site.seed+11)-0.5)*sp*0.32;
 const ph=(r+warp)/sp,idx=Math.floor(ph),fr=ph-idx;
 /* Monotone staircase stepping down away from dome apex: flat stone tread + crisp exfoliation riser */
 const riserT=smooth(0.0,site.riserBandM/sp,fr);
 return -(idx+riserT)*site.riserHeightM;
}

function baseLandApron(x,z){
 /* Convex quartz-porphyry apron sloping gently north (-z) from south (+z) dome flank, stepped by onion-skin shells */
 const rDom=Math.hypot(x-SITE.domeCenterLocal[0],z-SITE.domeCenterLocal[1]);
 const domeCurve=44.0-0.125*(rDom-920)-0.000038*(rDom-920)*(rDom-920);
 const steps=onionStepOffset(x,z,SITE)+28.0;
 let h=domeCurve*0.68+steps*0.78+1.35*n2(x,z,0.008,6105);
 /* Subtle radial rainwater scour flutes */
 for(let i=0;i<FLOW_LINES.length;i++){
  const rv=distToPoly(FLOW_LINES[i].pts,x,z);
  if(rv.d<16)h-=0.55*smooth(15,2.5,rv.d);
 }
 /* Flatten listening-dish plinth slightly at (28, 48) */
 const dDish=Math.hypot(x-28,z-48);
 if(dDish<15)h=mix(h,domeCurve*0.68+steps*0.78,smooth(15,5,dDish));
 return h;
}

function baseLandCrown(x,z){
 /* True +2,924.8 m apex centered at (0, 0): symmetric convex dome crowned by concentric amphitheatre shell steps */
 const r=Math.hypot(x,z);
 const domeCap=26.0-0.00018*r*r-0.024*r;
 const steps=onionStepOffset(x,z,SITE);
 let h=domeCap+steps+0.85*n2(x,z,0.010,6305);
 /* Level sanctuary plinth at site:dome-observatory (0, 0, r = 38) */
 if(r<44){
  h=mix(h,25.6+0.15*n2(x,z,0.04,6309),smooth(44,24,r));
 }
 return h;
}

function baseLandMoat(x,z){
 /* South (z > 42): bare inner dome exfoliation apron; Center (z = -68..+38): annular seepage fen; North (z < -72): ring-dike hogback */
 const zToe=SITE.apronToeZ;
 let h=0.85+0.95*n2(x,z,0.012,6205);
 if(z>zToe-14){
  const u=Math.max(0,z-(zToe-14));
  const apronRise=0.21*u+0.00012*u*u+0.62*(onionStepOffset(x,z,SITE)+26.0)*smooth(0,45,u);
  h=mix(h,0.85+apronRise,smooth(zToe-14,zToe+22,z));
 }
 /* North arcuate ring-dike collar scarp (KRELIEF.slab) */
 if(MOAT_SLAB){
  h=KRELIEF.shape(MOAT_SLAB,x,z,h);
 }
 /* Carve enclosed tannin-amber seepage fen basins (360 deg shore banks >= +0.42 m above 0.0 m fen water!) */
 if(SITE.fenPools){
  for(let i=0;i<SITE.fenPools.length;i++){
   const P=SITE.fenPools[i];
   const ux=(x-P.cx)/P.rx,uz=(z-P.cz)/P.rz;
   const wob=1.0+0.08*n2(x,z,0.035,6220+i*7);
   const d=Math.hypot(ux,uz)/wob;
   if(d<1.38){
    const rim=P.level+0.52+0.18*n2(x,z,0.06,6230+i);
    const bed=P.level-0.95-0.45*smooth(0.85,0.2,d);
    const prof=mix(rim,bed,smooth(1.04,0.74,d));
    h=mix(h,prof,smooth(1.36,1.02,d));
   }
  }
 }
 /* Gentle sheetwash channels down inner apron terminating cleanly above fen margin */
 for(let i=0;i<FLOW_LINES.length;i++){
  const rv=distToPoly(FLOW_LINES[i].pts,x,z);
  if(rv.d<14&&z>34){
   h-=0.42*smooth(13,2.5,rv.d)*smooth(34,52,z);
  }
 }
 /* Level pilgrimage reserve bench at site:moat-waystation (158, -42, r = 92) */
 if(SITE.reserves&&SITE.reserves.length){
  const R0=SITE.reserves[0],rd=Math.hypot(x-R0.x,z-R0.z);
  if(rd<R0.r*1.18){
   h=mix(h,4.2+0.35*n2(x,z,0.02,6240),smooth(R0.r*1.16,R0.r*0.65,rd));
  }
 }
 return h;
}

function baseLandCleft(x,z){
 /* High eastern dome shoulder (3 stacked 2.85 m granite shells) sliced by a 40 m-deep radial tension Kluft slot */
 const rDom=Math.hypot(x-SITE.domeCenterLocal[0],z-SITE.domeCenterLocal[1]);
 const shoulder=16.0-0.068*(rDom-940)+0.72*(onionStepOffset(x,z,SITE)+34.0)+1.1*n2(x,z,0.009,6405);
 const C=SITE.cleft;
 /* Distance to radial Kluft centerline from (x0,z0) to (x1,z1) */
 const vx=C.x1-C.x0,vz=C.z1-C.z0,L2=vx*vx+vz*vz;
 const t=clamp(((x-C.x0)*vx+(z-C.z0)*vz)/L2,0,1);
 const cx=C.x0+vx*t,cz=C.z0+vz*t;
 const dSlot=Math.hypot(x-cx,z-cz)+0.85*n2(x,z,0.06,6411);
 const endTaper=smooth(0.0,0.09,t)*smooth(1.0,0.91,t);
 const hw=C.halfW*(0.55+0.45*endTaper);
 if(dSlot>hw+14.0||endTaper<=0.001)return shoulder;

 /* Inside the Kluft: walkable wedged-chockstone ramp on the west (x = -128 -> -18), deep -35.5 m floor in center/east */
 const rampU=clamp((x-C.rampX0)/(C.rampX1-C.rampX0),0,1);
 const stepRamp=Math.floor(rampU*18)/18;
 const rampFloor=mix(shoulder-1.2,-35.2,0.72*rampU+0.28*stepRamp);
 const deepFloor=-35.2-1.8*smooth(-10,90,x)+0.45*n2(x,z,0.08,6417);
 const dSeep=Math.hypot((x-72.0)/9.5,(z-1.73)/3.4);
 const seepBasin=dSeep<1.35?mix(-36.0,-37.35,smooth(1.05,0.55,dSeep)):deepFloor;
 const slotFloor=x<C.rampX1?rampFloor:mix(deepFloor,seepBasin,smooth(1.35,1.0,dSeep));
 const cutW=smooth(hw+8.5,hw-1.8,dSlot)*endTaper;
 return mix(shoulder,slotFloor,cutW);
}

/* Pre-stamp exact horizontal sill elevations for every gnamma solution pan on apron & crown */
(function stampGnammaSills(){
 const pans=SITE.gnammas||[];
 const baseFn=SKEY==='crown'?baseLandCrown:baseLandApron;
 for(let i=0;i<pans.length;i++){
  const P=pans[i];
  P.sillY=+baseFn(P.x,P.z).toFixed(3);
 }
})();

/* KBASIN stepped sill bench reference (40-core-basin.js) */
const GNAMMA_BASIN=(typeof KBASIN!=='undefined'&&SITE.gnammas&&SITE.gnammas.length)?KBASIN.create({
 seed:SITE.seed+55,
 age:800,
 recession:400,
 lakes:SITE.gnammas.slice(0,8).map(P=>({
  name:P.id,kind:'flood',level:P.sillY,remnant:P.sillY-P.depth,
  member:(x,z)=>Math.hypot(x-P.x,z-P.z)<=P.r*1.25?1:0
 }))
}):null;

function applyGnammas(h,x,z){
 const pans=SITE.gnammas;
 if(!pans||!pans.length)return h;
 let out=h;
 for(let i=0;i<pans.length;i++){
  const P=pans[i],dx=x-P.x,dz=z-P.z,r=P.r;
  if(Math.abs(dx)>r*1.85||Math.abs(dz)>r*1.85)continue;
  const d=Math.hypot(dx,dz)/r;
  if(d<1.78){
   /* Guarantee 360 deg horizontal rock rim at sillY + 0.16 m surrounding flat floor at sillY - depth! */
   const rimCrest=P.sillY+0.16;
   const panFloor=P.sillY-P.depth;
   let target=mix(rimCrest,panFloor,smooth(1.02,0.74,d));
   if(P.islandR>0.3){
    const di=Math.hypot(x-(P.x+P.islandDx),z-(P.z+P.islandDz))/P.islandR;
    if(di<1.12)target=mix(target,P.sillY+0.30,1.0-smooth(0.58,1.08,di));
   }
   out=mix(out,target,smooth(1.75,1.12,d));
  }
 }
 return out;
}

function landH(x,z){
 if(SKEY==='crown')return applyGnammas(baseLandCrown(x,z),x,z);
 if(SKEY==='moat')return baseLandMoat(x,z);
 if(SKEY==='cleft')return baseLandCleft(x,z);
 return applyGnammas(baseLandApron(x,z),x,z);
}
function terrainH(x,z){return landH(x,z);}

function waterH(x,z){
 if(SKEY==='moat'&&SITE.fenPools){
  for(let i=0;i<SITE.fenPools.length;i++){
   const P=SITE.fenPools[i];
   if(Math.hypot((x-P.cx)/P.rx,(z-P.cz)/P.rz)<=1.02)return P.level;
  }
  return -1e9;
 }
 if(SITE.gnammas&&SITE.gnammas.length&&DOME_STATE.hydroperiod01>0.08){
  const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
  if(gn.inPan&&gn.waterLevelLocalM!=null&&gn.island01<0.35)return gn.waterLevelLocalM;
 }
 return -1e9;
}

/* 5. Pure DOME_PHYS raster field cache for fast shader masks & deterministic placement */
const FNAMES=['wet','step','flute','gnamma','rim','fen','crown','cleft','rock','slope','flat','hollow'];
const FC=(function(){
 const N=256,S=TERR.R*2.2,a={};
 FNAMES.forEach(nm=>{a[nm]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i,hh=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*cs);
  const hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*cs);
  const slope=clamp(Math.hypot(hx,hz),0,2.0);
  const sh=DOME_PHYS.shellAt(x,z,SITE);
  const gn=DOME_PHYS.gnammaAt(x,z,DOME_STATE.hydroperiod01,SITE);
  const scOut={scour:0};
  if(DOME_SCOUR)DOME_SCOUR.sample(x,z,hh,scOut);
  const flute=clamp(Math.max(sh.slickFlute01,scOut.scour*0.9),0,1);
  const inFen=SKEY==='moat'?clamp(smooth(32,-8,z)*smooth(-86,-52,z),0,1):0;
  a.step[k]=sh.shellStep01;
  a.flute[k]=flute;
  a.gnamma[k]=gn.inPan?1:0;
  a.rim[k]=gn.rimGrit01;
  a.fen[k]=inFen;
  a.crown[k]=SKEY==='crown'?clamp(smooth(-28,18,hh),0,1):0;
  a.cleft[k]=SKEY==='cleft'?clamp(smooth(-4,-26,hh),0,1):0;
  a.wet[k]=clamp(Math.max(gn.inPan?0.95:gn.rimGrit01*0.68,inFen*0.92,flute*0.48,sh.shellStep01*0.42),0,1);
  a.rock[k]=clamp(1.0-inFen*0.88-sh.shellStep01*0.35-gn.rimGrit01*0.45,0,1);
  a.slope[k]=clamp(slope,0,1);
  a.flat[k]=clamp(1.0-smooth(0.24,0.62,slope),0,1);
  a.hollow[k]=clamp(sh.hollowGapM/2.0,0,1);
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
FNAMES.forEach(nm=>{FIELD[nm]=(x,z)=>FC.at(FC.a[nm],x,z);});

/* 6. KSPACE order-free keep-clear index & KHAZ data-driven hazards */
const SPACE=KSPACE.create({cell:16});

if(SITE.reserves){
 for(let i=0;i<SITE.reserves.length;i++){
  const R0=SITE.reserves[i];
  SPACE.insert({kind:'reserve',id:R0.id},R0.x,R0.z,R0.r);
 }
}
if(SITE.aTents){
 for(let i=0;i<SITE.aTents.length;i++){
  const A=SITE.aTents[i];
  SPACE.insert({kind:'atent',id:A.id},A.x,A.z,A.spanM*0.62+3.0);
 }
}
if(SITE.gnammas){
 for(let i=0;i<SITE.gnammas.length;i++){
  const P=SITE.gnammas[i];
  /* Keep open water mirror interior clear while allowing islandR bonsai! */
  if(!(P.islandR>0.3)){
   SPACE.insert({kind:'gnamma-water',id:P.id},P.x,P.z,Math.max(0.8,P.r*0.82));
  }
 }
}
function inFlowChannel(x,z,extraM){
 const pad=extraM==null?4.0:extraM;
 for(let i=0;i<FLOW_LINES.length;i++){
  const FL=FLOW_LINES[i],rv=distToPoly(FLOW_LINES[i].pts,x,z);
  if(rv.d<FL.w+pad)return true;
 }
 return false;
}
FIELD.river=(x,z)=>inFlowChannel(x,z,4.0)?1:0;
FLOW_LINES.forEach((FL,fi)=>{
 for(let i=0;i<FL.pts.length;i++){
  SPACE.insert({kind:'sheetwash-rill',id:'rill-'+fi+'-'+i},FL.pts[i][0],FL.pts[i][1],FL.w+4.0);
 }
});

function rootMask(x,z){
 if(inFlowChannel(x,z,3.8))return 0;
 const d=terrainH(x,z)-waterH(x,z);
 if(d<0.12)return 0;
 return d<0.55?(d-0.12)/0.43:1;
}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
const SPINE=SKEY==='apron'?[[-34,-22],[20,-14],[-18,26],[28,48]]
 :SKEY==='moat'?[[-18,-18],[28,48],[0,-110],[158,-42]]
 :SKEY==='crown'?[[0,0],[46,0],[-66,-14],[0,-92]]
 :[[-95,0],[-18,0],[14,-6],[54,0]];

BIO.init({
 tags:'thedome',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2100,floor:[155,395]},
 windows:{water:WBOX}
});
BIO.setSun([460,920,-610]);

/* Data-driven KHAZ hazards registered after BIO.init creates KTAGS.page (PLAN.md section 5.2) */
const HAZARDS=[];
if(typeof KHAZ!=='undefined'&&typeof KTAGS!=='undefined'&&KTAGS.page){
 const regHaz=(id,name,x,z,r,h,haz)=>{
  const y=terrainH(x,z);
  const rec={id:id,name:name,class:'feature',at:[x,y,z],r:r,h:h,tags:{biome:'thedome',hazard:KHAZ.make(haz)}};
  KTAGS.page.add(rec);
  HAZARDS.push(rec);
 };
 if(SKEY==='apron'){
  regHaz('dome:slickslab','Cyanobacteria-Coated Wet Porphyry Sheetwash Chute',-70,60,36,14,
   {kind:'slip',danger:0.46,dose:0.16,falloff:'smooth',tell:{sign:'Dark velvety cyanobacteria rainwater streak on steep curved stone'}});
  regHaz('dome:spall','Afternoon Insolation-Stressed Exfoliation Scale Lip',44,-36,24,8,
   {kind:'crush',danger:0.54,dose:0.28,falloff:'linear',cycle:{period:28,warn:1.5,ramp:0.2,on:0.8,after:1.5},tell:{sound:'rifle-crack',sign:'Fresh pink-white unlichened granite spall lip'}});
 }else if(SKEY==='moat'){
  regHaz('dome:slickslab','Apron Toe Rain-Slick Sheetwash Apron',-46,85,32,12,
   {kind:'slip',danger:0.42,dose:0.14,falloff:'smooth',tell:{sign:'Glossy dark sheetwash flute entering ring-moat'}});
  regHaz('dome:quagmire','Floating Chartreuse Sphagnum Eye-Pocket Quagmire',-38,-20,26,6,
   {kind:'sink',danger:0.48,dose:0.18,falloff:'smooth',tell:{sign:'Bright chartreuse quaking sphagnum ring encircled by moatpitcher trumpets'}});
 }else if(SKEY==='crown'){
  regHaz('dome:slickslab','Mist-Glazed Summit Exfoliation Riser Lip',-48,-46,24,10,
   {kind:'slip',danger:0.38,dose:0.12,falloff:'smooth',tell:{sign:'Crown-Veil fog-drip glaze on steep granite riser'}});
 }else if(SKEY==='cleft'){
  regHaz('dome:cleftdrop','40 m Vertical Radial Unloading Kluft Rim',24,12,48,44,
   {kind:'fall',danger:0.86,dose:0.65,falloff:'linear',tell:{sound:'aeolian-chord',sign:'Exhaling warm barometric mist rising from sheer granite slot'}});
  regHaz('dome:spall','Unloading Hoop-Stress Porphyry Rim Scale',-38,-14,22,8,
   {kind:'crush',danger:0.52,dose:0.26,falloff:'linear',cycle:{period:32,warn:1.5,ramp:0.2,on:0.8,after:1.5},tell:{sound:'rifle-crack',sign:'Popped exfoliation edge'}});
 }
}
