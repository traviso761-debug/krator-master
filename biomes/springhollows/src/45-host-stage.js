// ================================================================= HOST — stage: 4-station karst & porphyry terrain, KSPACE, KHAZ & BIO.init ([web])
// Implements all four surveyed Scale-Model 5.1 Springhollows (Sikwingi-Khaloyi) stations (PLAN.md section 3):
//   spring   (default, dist/springhollows.html):          Cav Ozarks Resurgence 24 m cave mouth, sapphire boil & cypress gallery
//   shutin   (dist/springhollows-shutin.html):            Tlila-Wada purple-red rhyolite porphyry shut-in gorge & boat-lift bypass
//   fenestre (dist/springhollows-fenestre.html):          18 m collapsed sinkhole skylight & walk-in KSPELEO.CALCITE crystal hall
//   glade    (dist/springhollows-glade.html):             Cherty-dolomite & porphyry glade, saffron terraces, onyx hollow & bleach-scar
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

const RAW_SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'spring';
const SKEY=RAW_SKEY==='labyrinth'?'glade':RAW_SKEY;
const SITE=HOLLOW_SITES[SKEY]||HOLLOW_SITES.spring;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_DUSK=PQ.get('night')==='1'||PQ.get('mode')==='dusk';
const SH_STATE={
 mode:INIT_DUSK?'dusk':'day',
 glow01:INIT_DUSK?1.0:0.0,
 mistBoost:SKEY==='spring'?0.62:(SKEY==='fenestre'?0.48:0.22),
 cavernCut:PQ.get('cut')==='1'
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='shutin'?0xd2d8da:SKEY==='glade'?0xd8ddd6:0xcadbd8;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='spring'?0.00028:SKEY==='fenestre'?0.00025:0.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
const hemiLight=new THREE.HemisphereLight(0xe6f0ea,0x4a5646,0.88);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff5e2,1.38);
sun.position.set(420,960,-520);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd2e6ec,0.25);
fill.position.set(-540,390,580);
scene.add(fill);

// ---------------------------------------------------------------- 4-station heightfields & hydrological channels
const TERR={R:680};
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

// Flow polylines per station (carefully separated from WATER.still pools so water-mouths passes 100%!)
const FLOW_LINES=(function(){
 if(SKEY==='spring'){
  // Starts at x = -18 inside the [-88..+16] +0.14 m sapphire boil pool and flows continuously down the cypress hollow to x = +446
  const pts=[];
  for(let i=0;i<=30;i++){
   const t=i/30,x=-18+464*t,uRun=clamp((x-16)/430,0,1),z=18*Math.sin(uRun*4.6);
   pts.push([x,z]);
  }
  return[{name:'Cav Ozarks Sapphire Cypress Spring-Run (26 m3/s)',pts:pts,w:18.5,depth:0.95,speed:1.35,levelTop:0.135,drop:2.95}];
 }
 if(SKEY==='shutin'){
  // Starts at x = -88 inside the +6.25 m upper dolomite reach, plunges through the 16 m red-porphyry chute, and tucks to x = +96 inside the +0.20 m plunge pool
  const pts=[];
  for(let i=0;i<=32;i++){
   const t=i/32,x=-88+184*t;
   const z=x<-66?6*Math.sin((x+66)*0.012):(x<=76?7.2*Math.sin(clamp((x+66)/142,0,1)*TAU):5*Math.sin((x-76)*0.012));
   pts.push([x,z]);
  }
  return[{name:'9109 Tlila-Wada Red-Porphyry Shut-In Whitewater Chute (195 m3/s)',pts:pts,w:9.2,depth:1.25,speed:5.2,levelTop:6.24,drop:6.07}];
 }
 return[];
})();

function flattenReserve(h,reserves,x,z,targetY,seed){
 if(!reserves||!reserves.length)return h;
 let out=h;
 for(let i=0;i<reserves.length;i++){
  const R=reserves[i],d=Math.hypot(x-R.x,z-R.z);
  if(d<R.r*1.36){
   out=mix(out,targetY+0.35*n2(x,z,0.02,seed+i*11),smooth(R.r*1.34,R.r*0.72,d));
  }
 }
 return out;
}

function landSpring(x,z){
 // West of x = -90: tiered 95 m cream cherty-dolomite palisade bluff; (-88..+16, |z| < 26): -6.2 m flooded artesian boil bowl;
 // East (x > +16): meandering bald-cypress gallery hollow flanked by rising chinkapin-oak dolomite benches & a low porphyry sill at x = 195
 const zMeander=18*Math.sin(clamp((x-16)/430,0,1)*4.6);
 const dz=Math.abs(z-(x>16?zMeander:0)+5*n2(x,z,0.007,101)*smooth(6,36,Math.abs(x-14)));
 let h=0;
 if(x<-88){
  // Tiered carbonate-shelf cliff rising behind the cave mouth
  const rise=smooth(-86,-220,x);
  const steps=3.2*Math.sin(rise*14.0)*smooth(0.05,0.25,rise);
  h=26.0+68.0*Math.pow(rise,0.82)+steps+14.0*smooth(32,160,dz)+3.6*n2(x,z,0.012,102);
  // Amphitheatre notch directly in front of portal (-92, 0)
  const dMouth=Math.hypot((x+92)*0.9,z*1.05);
  if(dMouth<30){
   h=mix(h,-4.8,smooth(28,12,dMouth));
  }
 }else{
  // Resurgence boil basin (-88..+16) & downstream spring-run channel (continuous deep outlet throat across x = -24..+32!)
  const dBoil=Math.hypot((x+36)/54,z/27);
  const inBoil=smooth(1.22,0.68,dBoil);
  const boilBed=-6.2+1.2*n2(x,z,0.04,103);
  const uRun=clamp((x-10)/436,0,1);
  const runWaterY=0.135-2.95*uRun;
  const inRun=x>-24?smooth(31,15,dz):0;
  // Shallow bald-cypress shoal shelves along margins (dz = 16..30 m)
  const benchY=runWaterY+0.65+14.5*smooth(26,115,dz)+36.0*smooth(110,360,dz)+2.8*n2(x,z,0.009,104);
  const channelBed=runWaterY-1.45+0.22*n2(x,z,0.05,105);
  h=mix(benchY,channelBed,inRun);
  h=mix(h,boilBed,inBoil);
  // Low purple-red porphyry riffle sill crossing at x ~ 195 outside the thalweg
  const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
  if(dk.signedDistM<18){
   const sill=smooth(18,-12,dk.signedDistM)*(1-inRun*0.86);
   h+=6.8*sill+1.4*sill*n2(x,z,0.06,106);
  }
 }
 h=flattenReserve(h,SITE.reserves,x,z,8.8,120);
 return h+0.55*n2(x,z,0.028,107)*(1-smooth(26,12,dz)*0.8);
}

function landShutin(x,z){
 // Strike-aligned purple-red rhyolite porphyry ridge at x ~ 0 (halfWidthM = 64 m) sliced by Tlila-Wada river corridor along z ~ 0
 const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
 const dikeLift=smooth(24,-22,dk.signedDistM);
 const zRiver=x<-66?6*Math.sin((x+66)*0.012):(x<=76?7.2*Math.sin(clamp((x+66)/142,0,1)*TAU):5*Math.sin((x-76)*0.012));
 const dz=Math.abs(z-zRiver);

 // Valley walls: wide gentle dolomite valley (width ~85 m) vs narrow steep polished porphyry shut-in gorge (width ~18 m)
 const halfChan=lerp(42.0,9.2,dikeLift);
 const wallStart=halfChan+2.0,wallTop=lerp(135.0,56.0,dikeLift);
 const uChute=clamp((x+56)/118,0,1);
 const waterRef=x<-56?6.25:(x<=62?(6.24-6.03*(uChute*uChute*(3-2*uChute))):0.20);
 const bedDepth=lerp(2.9,1.85,dikeLift);
 const bedY=waterRef-bedDepth+0.32*dikeLift*Math.sin(x*0.22+z*0.18);

 const valleyShoulder=waterRef+2.2+lerp(18.0,48.0,dikeLift)*smooth(wallStart,wallTop,dz)+28.0*smooth(wallTop,360,dz);
 const inChan=smooth(halfChan+7.5,halfChan-2.0,dz);
 let h=mix(valleyShoulder,bedY,inChan);

 // Sculpted porphyry potholes & monolith knobs on sunny upper glades
 if(dikeLift>0.2&&dz>wallStart+8){
  h+=5.5*dikeLift*Math.max(0,n2(x,z,0.032,201))+1.8*dikeLift*n2(x,z,0.08,202);
 }
 // Stepped dry-stone saffron & whorl-olive benches on western dolomite slopes
 if(SITE.terraces){
  for(let i=0;i<SITE.terraces.length;i++){
   const tr=SITE.terraces[i],td=Math.hypot(x-tr.x,z-tr.z);
   if(td<tr.r*1.25){
    const stepBase=18.5+Math.floor(clamp((td/tr.r)*3,0,2))*3.2;
    h=mix(h,stepBase,smooth(tr.r*1.2,tr.r*0.75,td)*0.82);
   }
  }
 }
 h=flattenReserve(h,SITE.reserves,x,z,17.5,220);
 return h+0.75*n2(x,z,0.025,205);
}

function landFenestre(x,z){
 // Gently rolling chinkapin-oak cherty-dolomite plateau (+3..+24 m) with a bold purple-red porphyry rib on the east (x ~ 54)
 // and a collapsed 18 m sinkhole fenestre bowl centered at (0, 0) with a gentle SW breccia approach rim
 const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
 const dikeRib=smooth(20,-14,dk.signedDistM);
 let h=5.5+9.5*smooth(45,260,Math.hypot(x,z))+11.0*dikeRib+3.8*n2(x,z,0.009,301);

 // Gentle funnel depression leading to the 18 m sinkhole skylight at (0, 0)
 const rSink=Math.hypot(x,z);
 if(rSink<46){
  h=mix(h,2.2,smooth(46,16,rSink));
 }
 h=flattenReserve(h,SITE.reserves,x,z,11.5,320);
 return h+0.6*n2(x,z,0.028,303);
}

function landGlade(x,z){
 // Upland mosaic: sunny red-porphyry & chert glade knob around (68, -42), stepped saffron/whorl-olive dolomite benches at (18, 96) & (92, 78),
 // western Ancient defoliant bleach-belt flat hardpan around (-148, 112), and onyx chert-bridge karst hollow around (-38, -36)
 const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
 const dikeDome=smooth(28,-24,dk.signedDistM)*smooth(260,60,Math.hypot(x-68,z+42));
 let h=7.0+18.5*dikeDome+14.0*smooth(90,340,Math.hypot(x,z))+3.4*n2(x,z,0.009,401);

 // Stepped saffron & whorl-olive dry-stone agricultural benches
 if(SITE.terraces){
  for(let i=0;i<SITE.terraces.length;i++){
   const tr=SITE.terraces[i],td=Math.hypot(x-tr.x,z-tr.z);
   if(td<tr.r*1.25){
    const stepY=10.5+Math.floor(clamp((1-td/tr.r)*3,0,2))*2.6;
    h=mix(h,stepY,smooth(tr.r*1.22,tr.r*0.76,td)*0.86);
   }
  }
 }
 // Ancient defoliant bleach-belt scar: chemically stripped flat caliche hardpan
 const scar=HOLLOW_PHYS.ecocideScarAt(x,z,SITE);
 if(scar.hardpan01>0.05){
  h=mix(h,11.2+0.25*n2(x,z,0.04,405),scar.hardpan01*0.78);
 }
 // Kipuka funnel around (-38, -36) onyx cavern skylight
 const rOnyx=Math.hypot(x+38,z+36);
 if(rOnyx<38){
  h=mix(h,3.4,smooth(38,14,rOnyx));
 }
 h=flattenReserve(h,SITE.reserves,x,z,14.0,420);
 return h+0.6*n2(x,z,0.028,408);
}

function rawTerrainH(x,z){
 if(SKEY==='spring')return landSpring(x,z);
 if(SKEY==='shutin')return landShutin(x,z);
 if(SKEY==='fenestre')return landFenestre(x,z);
 return landGlade(x,z);
}

function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.12)return rawTerrainH(x,z);
 const rim=rawTerrainH(x*(TERR.R/d),z*(TERR.R/d));
 const far=38.0*smooth(TERR.R*1.12,4800,d)+24.0*n2(x,z,0.00055,7490)+11.0*n2(x,z,0.0016,7491);
 return rim+far;
}

function terrainH(x,z){return rawTerrainH(x,z);}

function waterH(x,z){
 if(SKEY==='spring'){
  const dBoil=Math.hypot((x+36)/54,z/27);
  if(dBoil<1.05)return 0.14;
  if(x>=12&&x<=450){
   const u=clamp((x-16)/430,0,1);
   const zm=18*Math.sin(u*4.6);
   if(Math.abs(z-zm)<20.0)return 0.04-2.85*u;
  }
  return -1e9;
 }
 if(SKEY==='shutin'){
  const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
  const dikeLift=smooth(24,-22,dk.signedDistM);
  const zRiver=x<-66?6*Math.sin((x+66)*0.012):(x<=76?7.5*Math.sin(clamp((x+66)/142,0,1)*5.4):5*Math.sin((x-76)*0.012));
  const halfW=lerp(43.0,9.5,dikeLift);
  if(Math.abs(z-zRiver)>halfW)return -1e9;
  if(x<-66)return 6.25;
  if(x<=76)return 6.14-5.88*clamp((x+66)/142,0,1);
  return 0.20;
 }
 if(SKEY==='fenestre'){
  if(Math.hypot(x-38,z-24)<18.0)return -25.35;
  return -1e9;
 }
 if(Math.hypot(x+38,z+6)<14.0)return -13.85;
 return -1e9;
}

// Fast gridded field cache for ground shader masks & species placement
const FC=(function(){
 const R=TERR.R*1.12,N=240,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),porph=new Float32Array(nx*nx),rock=new Float32Array(nx*nx);
 const wet=new Float32Array(nx*nx),bleach=new Float32Array(nx*nx),terr=new Float32Array(nx*nx);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  const y=terrainH(x,z);
  h[k]=y;
  const dk=HOLLOW_PHYS.porphyryDikeAt(x,z,SITE);
  porph[k]=smooth(14,-10,dk.signedDistM);
  const sc=HOLLOW_PHYS.ecocideScarAt(x,z,SITE);
  bleach[k]=sc.hardpan01;
  const wy=waterH(x,z);
  wet[k]=wy>-1e5?smooth(4.5,-0.2,y-wy):0;
  let tv=0;
  if(SITE.terraces){
   for(let t=0;t<SITE.terraces.length;t++){
    const tr=SITE.terraces[t];
    tv=Math.max(tv,smooth(tr.r*1.15,tr.r*0.65,Math.hypot(x-tr.x,z-tr.z)));
   }
  }
  terr[k]=tv;
 }
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  rock[j*nx+i]=clamp(smooth(0.26,0.72,Math.hypot(sx,sz))+porph[j*nx+i]*0.35,0,1);
 }
 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 return{a:{h:h,porph:porph,rock:rock,wet:wet,bleach:bleach,terr:terr},at:at};
})();

const FIELD={
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 porphyry:(x,z)=>FC.at(FC.a.porph,x,z),
 bleach:(x,z)=>FC.at(FC.a.bleach,x,z),
 terrace:(x,z)=>FC.at(FC.a.terr,x,z)
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
