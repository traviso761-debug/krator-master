// ================================================================= HOST — stage: 5-station ophiolite, klint, koski, seep, fen & auger terrain ([web])
// Implements all five surveyed Scale-Model 5.1 Arcflow (Kulaneva, rmwetn7jqgm9g) stations (PLAN.md section 4):
//   klint (default, dist/arcflow.html):       55 m Kulaneva-Klint horseshoe waterfall over kukersite shale & blue amber-clay
//   koski (dist/arcflow-koski.html):          Helme-Koski zebra-cumulate 3-step rapids & Hiidenkirnu swirl-kettle potholes
//   seep  (dist/arcflow-seep.html):           pH 11.5 Ca-OH cerulean travertine cascades & Jumala-Tuli abiotic H2/CH4 flames
//   neva  (dist/arcflow-neva.html):           Musta-Jogi tea-black fen, raha-maak penny-ore shoals & crimson kalju-selka skerries
//   auger (dist/arcflow-auger.html):          NE serpentinite red-barren, bone-white Bleach-Swath & 45 m ecof_soil_auger oasis
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

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'klint';
const SITE=ARCFLOW_SITES[SKEY]||ARCFLOW_SITES.klint;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_DUSK=PQ.get('night')==='1'||PQ.get('mode')==='dusk';
const AF_STATE={
 mode:INIT_DUSK?'dusk':'day',
 dusk01:INIT_DUSK?1.0:0.0,
 mistBoost:SKEY==='klint'?0.68:(SKEY==='seep'?0.42:(SKEY==='neva'?0.48:0.22))
};

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='auger'?0xd8d6d0:SKEY==='seep'?0xcce0e6:SKEY==='neva'?0xcfd8d2:0xcad9dc;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='klint'?0.00028:SKEY==='neva'?0.00026:0.00021);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
const hemiLight=new THREE.HemisphereLight(0xe4eef2,0x445044,0.88);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff4e0,1.38);
sun.position.set(440,940,-510);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd0e4ee,0.25);
fill.position.set(-520,380,560);
scene.add(fill);

// ---------------------------------------------------------------- 5-station heightfields & hydrological channels
const TERR={R:680};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

function flattenReserve(h,reserves,x,z,targetY,seed){
 if(!reserves||!reserves.length)return h;
 let out=h;
 for(let i=0;i<reserves.length;i++){
  const R=reserves[i],d=Math.hypot(x-R.x,z-R.z);
  if(d<R.r*1.36){
   out=mix(out,targetY+0.32*n2(x,z,0.02,seed+i*13),smooth(R.r*1.34,R.r*0.72,d));
  }
 }
 return out;
}

function skerryLiftAt(skerries,x,z,ampBase,seed){
 if(!skerries||!skerries.length)return 0;
 let lift=0;
 for(let i=0;i<skerries.length;i++){
  const sk=skerries[i];
  const ca=Math.cos(sk.yaw==null?0.3:sk.yaw),sa=Math.sin(sk.yaw==null?0.3:sk.yaw);
  const dx=x-sk.x,dz=z-sk.z;
  const lx=(dx*ca+dz*sa)/sk.rx,lz=(-dx*sa+dz*ca)/sk.rz;
  const rEll=Math.sqrt(lx*lx+lz*lz)+0.09*n2(x,z,0.03,seed+i*17);
  if(rEll<1.18){
   const dome=Math.pow(clamp(1-rEll*rEll*0.74,0,1),1.35);
   const hSk=ampBase*(0.82+0.35*(i%3)*0.5)*dome;
   if(hSk>lift)lift=hSk;
  }
 }
 return lift;
}

// Continuous river centerlines & step profiles shared by terrainH and waterH (0 gaps, 0 slabs)
function klintMeanderZ(x){
 return x<=56?0:16.0*Math.sin(clamp((x-56)/390,0,1)*4.2);
}
function koskiMeanderZ(x){
 return 9.5*Math.sin((x+80)*0.011);
}
function koskiWaterProfileY(x){
 if(x<=-82)return 12.25;
 if(x>=82)return 0.20;
 // Three flat-topped chromitite-pyroxenite benches (-82..+82 -> +12.24 down to +0.21 m, strictly non-rising!)
 const u=clamp((x+82)/164,0,1);
 const s1=smooth(0.06,0.22,u),s2=smooth(0.42,0.58,u),s3=smooth(0.76,0.94,u);
 return 12.24-4.00*s1-4.02*s2-4.01*s3;
}
function nevaMeanderZ(x){
 return 22.0*Math.sin((x+120)*0.0085)+6.0*Math.cos(x*0.019);
}

const FLOW_LINES=(function(){
 if(SKEY==='klint'){
  // Starts at x = +42 inside the [-22..+82] +0.40 m horseshoe plunge pool and flows down the kukersite gorge to x = +446
  const pts=[];
  for(let i=0;i<=30;i++){
   const t=i/30,x=42+404*t;
   pts.push([x,klintMeanderZ(x)]);
  }
  return[{name:'9107 Suur-Neva Lower Kukersite Gorge Reach (1066 m3/s)',pts:pts,w:24.0,speed:1.75,levelTop:0.36,drop:2.20}];
 }
 if(SKEY==='koski'){
  // Overlaps upper calm reach (-82) from x = -112 and lower calm reach (+82) to x = +114 across all 3 cumulate sills
  const pts=[];
  for(let i=0;i<=36;i++){
   const t=i/36,x=-112+226*t;
   pts.push([x,koskiMeanderZ(x)]);
  }
  return[{name:'9104 Helme-Koski Zebra-Cumulate 3-Step Cataract (433 m3/s)',pts:pts,w:15.5,speed:4.4,levelTop:12.22,drop:12.04}];
 }
 if(SKEY==='neva'){
  const pts=[];
  for(let i=0;i<=34;i++){
   const t=i/34,x=-420+840*t;
   pts.push([x,nevaMeanderZ(x)]);
  }
  return[{name:'9108 Musta-Jogi Tea-Black Humic Fen River (465 m3/s)',pts:pts,w:17.0,speed:0.92,levelTop:1.18,drop:1.80}];
 }
 return[];
})();

function landKlint(x,z){
 // Horseshoe amphitheatre centered at (10, 0) with radius 34 m so the lip sits at x = -24 on the centerline and curves forward to x = +10 on the wings
 const rArc=Math.hypot((x-10)*0.92,z*0.86)+2.2*n2(x,z,0.035,5101);
 const inUpper=x<10&&rArc>34.0 || x<-24.0;
 const zm=klintMeanderZ(x);
 const dz=Math.abs(z-zm);

 let h=0;
 if(inUpper){
  // Upper Arch basalt-and-serpentinite caprock plateau (+55.4 m Suur-Neva forebay incised into +57..+74 m plateau)
  const inForebay=x<=-16?smooth(30,18,Math.abs(z)):0;
  const plateauY=57.2+14.5*smooth(32,185,Math.abs(z))+5.5*smooth(-40,-280,x)+2.4*n2(x,z,0.011,5102);
  const forebayBed=52.2+0.35*n2(x,z,0.04,5103);
  h=mix(plateauY,forebayBed,inForebay);
  h+=skerryLiftAt(SITE.skerries,x,z,8.5,5104)*(1-inForebay);
 }else{
  // Lower kukersite & glauconitic blue-clay amphitheatre plunge basin & downstream navigation gorge
  const dPlunge=Math.hypot((x-26)/52,z/31);
  const inPlunge=smooth(1.18,0.68,dPlunge);
  const plungeBed=-5.8+0.85*n2(x,z,0.045,5105);

  const uRun=clamp((x-42)/404,0,1);
  const runWaterY=0.36-2.20*uRun;
  const inRun=x>26?smooth(30,18,dz):0;
  const talusBench=runWaterY+2.4+24.0*smooth(34,118,dz)+34.0*smooth(115,320,dz)+2.8*n2(x,z,0.012,5106);
  // Steep amphitheatre cliff wrap from +2 m talus up to +58 m rim around the horseshoe wall
  const wallWrap=(x<68&&dz>28)?52.0*smooth(32,58,dz)*smooth(76,12,x):0;
  const channelBed=runWaterY-2.15+0.25*n2(x,z,0.05,5107);
  h=mix(talusBench+wallWrap,channelBed,inRun);
  h=mix(h,plungeBed,inPlunge);
 }
 // Crisp vertical Klint cliff transition across rArc = 31..36 m for x < 14
 if(x<16&&Math.abs(z)<46){
  const faceT=smooth(30.5,35.5,rArc);
  const topLip=Math.abs(z)<23?53.6:(57.4+4.0*smooth(23,44,Math.abs(z)));
  if(rArc>29.5&&rArc<37.0){
   h=mix(h,topLip,faceT);
  }
 }
 h=flattenReserve(h,SITE.reserves,x,z,7.2,5120);
 return h;
}

function landKoski(x,z){
 // Tilted zebra-cumulate river corridor with 3 flat-topped chromitite sills, rock benches & 4 Hiidenkirnu swirl-kettles
 const zr=koskiMeanderZ(x);
 const dz=Math.abs(z-zr);
 const onBench=x>-84&&x<84;
 const halfW=onBench?16.2:34.0;
 const wy=koskiWaterProfileY(x);
 const inChan=smooth(halfW+5.5,halfW-2.0,dz);
 const bedY=wy-(onBench?1.65:2.85)+0.18*Math.cos((x*0.86+z*0.51)*0.35);

 // Exposed flat zebra-cumulate rock shelves flanking the rapids (dz = 17..36 m) before wooded banks rise
 const shelfBand=onBench?smooth(42,20,dz):0;
 const shelfY=wy+1.35+0.22*Math.cos((x*0.86+z*0.51)*0.24);
 const bankY=wy+2.6+18.5*smooth(halfW+14,135,dz)+26.0*smooth(130,360,dz)+2.6*n2(x,z,0.011,5201);
 let h=mix(mix(bankY,shelfY,shelfBand*0.78),bedY,inChan);

 // Carve 4 cylindrical Hiidenkirnu potholes into the cumulate rock shelves
 if(SITE.kettles){
  for(let i=0;i<SITE.kettles.length;i++){
   const kt=SITE.kettles[i],dk=Math.hypot(x-kt.x,z-kt.z);
   if(dk<kt.r*1.55){
    const kTop=koskiWaterProfileY(kt.x)+1.15;
    const kFloor=kTop-kt.depth;
    h=mix(h,kFloor,smooth(kt.r*1.18,kt.r*0.62,dk));
   }
  }
 }
 h+=skerryLiftAt(SITE.skerries,x,z,11.5,5204)*(1-inChan);
 h=flattenReserve(h,SITE.reserves,x,z,11.8,5220);
 return h+0.45*n2(x,z,0.026,5208)*(1-inChan*0.8);
}

function landSeep(x,z){
 // Western onshore Arch serpentinite thrust-bluff rising to +68 m, stepping down eastward in 6 cerulean travertine terraces
 const seepAxisZ=6.0*Math.sin((x+30)*0.022);
 const dz=Math.abs(z-seepAxisZ);
 const bluffRise=smooth(48,-165,x);
 let h=2.4+58.0*Math.pow(bluffRise,0.88)+14.0*smooth(45,220,dz)+3.2*n2(x,z,0.012,5301);

 // Sculpt 6 stepped travertine terrace bowls along x = -32..+68, |z - seepAxisZ| < 22 m
 if(x>=-38&&x<=76&&dz<30){
  const u=clamp((x+34)/104,0,1);
  const stepIdx=Math.min(5,Math.floor(u*6));
  const levels=[24.6,19.8,15.2,10.8,6.6,2.8];
  const treadY=levels[stepIdx]-0.95;
  const inCascade=smooth(26,13,dz)*smooth(-38,-30,x)*smooth(76,66,x);
  h=mix(h,treadY,inCascade*0.92);
 }
 h+=skerryLiftAt(SITE.skerries,x,z,13.5,5304);
 h=flattenReserve(h,SITE.reserves,x,z,6.8,5320);
 return h+0.52*n2(x,z,0.026,5308);
}

function landNeva(x,z){
 // Low humic Musta-Jogi peat-fen (+0.8..+3.8 m) laced with meandering river, penny-ore shoal pools & bold serpentinite skerries
 const zr=nevaMeanderZ(x);
 const dz=Math.abs(z-zr);
 const uRun=clamp((x+420)/840,0,1);
 const wy=1.18-1.80*uRun;
 const inRiv=smooth(24,12,dz);
 const rivBed=wy-1.85+0.18*n2(x,z,0.05,5401);
 const fenPlain=wy+0.82+2.4*smooth(26,120,dz)+9.5*smooth(160,420,Math.hypot(x,z))+1.1*n2(x,z,0.014,5402);
 let h=mix(fenPlain,rivBed,inRiv);

 // Shallow oxygenated raha-maak penny-ore shoal basins
 if(SITE.shoals){
  for(let i=0;i<SITE.shoals.length;i++){
   const sh=SITE.shoals[i],ds=Math.hypot(x-sh.x,z-sh.z);
   if(ds<sh.r*1.32){
    const sWater=1.18-1.80*clamp((sh.x+420)/840,0,1)+0.12;
    h=mix(h,sWater-0.72,smooth(sh.r*1.15,sh.r*0.58,ds)*(1-inRiv*0.5));
   }
  }
 }
 // Smooth glacier-like (but non-glacial!) kalju-selka serpentinite whaleback islands rising cleanly above the fen
 h+=skerryLiftAt(SITE.skerries,x,z,14.2,5405)*(1-inRiv*0.92);
 h=flattenReserve(h,SITE.reserves,x,z,3.6,5420);
 return h+0.35*n2(x,z,0.03,5409)*(1-inRiv*0.8);
}

function landAuger(x,z){
 // High NE Arcflow serpentinite red-barren plateau (+6..+28 m) sliced by flat bone-white Bleach-Swath & 45 m Auger lime-oasis
 let h=8.5+11.0*smooth(65,340,Math.hypot(x,z))+4.2*n2(x,z,0.009,5501)+1.6*n2(x,z,0.024,5502);
 h+=skerryLiftAt(SITE.skerries,x,z,12.8,5503);

 // Chemically stripped flat Bleach-Swath hardpan
 const sw=KFRONTIER.bleachSwathAt(x,z,SITE.swath);
 if(sw.bleach01>0.04){
  h=mix(h,9.2+0.20*n2(x,z,0.04,5504),sw.bleach01*0.82);
 }
 // 45 m circular Auger Lime-Phosphate Oasis around (64, -28) with a gentle seepage tarn at (46, -36)
 const ag=KFRONTIER.augerDiscAt(x,z,SITE.auger);
 if(ag.limeDose01>0.04){
  h=mix(h,7.4+0.35*n2(x,z,0.03,5505),ag.limeDose01*0.84);
 }
 const dTarn=Math.hypot(x-46,z+36);
 if(dTarn<16.5){
  h=mix(h,4.35,smooth(15.5,7.5,dTarn));
 }
 h=flattenReserve(h,SITE.reserves,x,z,11.4,5520);
 return h;
}

function rawTerrainH(x,z){
 if(SKEY==='klint')return landKlint(x,z);
 if(SKEY==='koski')return landKoski(x,z);
 if(SKEY==='seep')return landSeep(x,z);
 if(SKEY==='neva')return landNeva(x,z);
 return landAuger(x,z);
}

function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.12)return rawTerrainH(x,z);
 const rim=rawTerrainH(x*(TERR.R/d),z*(TERR.R/d));
 const far=34.0*smooth(TERR.R*1.12,4800,d)+22.0*n2(x,z,0.00055,8190)+9.5*n2(x,z,0.0016,8191);
 return rim+far;
}

function terrainH(x,z){return rawTerrainH(x,z);}

function waterH(x,z){
 if(SKEY==='klint'){
  if(x<=-14&&Math.abs(z)<23.5)return 55.40;
  const dPlunge=Math.hypot((x-26)/52,z/31);
  if(dPlunge<1.02)return 0.40;
  if(x>=42&&x<=450){
   const zm=klintMeanderZ(x);
   if(Math.abs(z-zm)<22.0)return 0.36-2.20*clamp((x-42)/404,0,1);
  }
  return -1e9;
 }
 if(SKEY==='koski'){
  if(SITE.kettles){
   for(let i=0;i<SITE.kettles.length;i++){
    const kt=SITE.kettles[i];
    if(Math.hypot(x-kt.x,z-kt.z)<kt.r*0.95)return koskiWaterProfileY(kt.x)+0.65;
   }
  }
  const zr=koskiMeanderZ(x);
  const hw=(x>-84&&x<84)?17.0:34.0;
  if(Math.abs(z-zr)<=hw)return koskiWaterProfileY(x);
  return -1e9;
 }
 if(SKEY==='seep'){
  const sz=6.0*Math.sin((x+30)*0.022);
  if(x>=-34&&x<=72&&Math.abs(z-sz)<19.0){
   const u=clamp((x+34)/104,0,1);
   const levels=[24.6,19.8,15.2,10.8,6.6,2.8];
   return levels[Math.min(5,Math.floor(u*6))];
  }
  return -1e9;
 }
 if(SKEY==='neva'){
  if(SITE.shoals){
   for(let i=0;i<SITE.shoals.length;i++){
    const sh=SITE.shoals[i];
    if(Math.hypot(x-sh.x,z-sh.z)<sh.r*0.95){
     return 1.18-1.80*clamp((sh.x+420)/840,0,1)+0.12;
    }
   }
  }
  const zr=nevaMeanderZ(x);
  if(Math.abs(z-zr)<18.5)return 1.18-1.80*clamp((x+420)/840,0,1);
  return -1e9;
 }
 // Station 5 (auger): small seepage tarn inside the 45 m lime-dosed oasis
 if(Math.hypot(x-46,z+36)<12.5)return 5.45;
 return -1e9;
}

// Fast gridded field cache for 3-layer KGROUND masks & deterministic species placement
const FC=(function(){
 const R=TERR.R*1.12,N=240,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),serp=new Float32Array(nx*nx),rock=new Float32Array(nx*nx);
 const wet=new Float32Array(nx*nx),red=new Float32Array(nx*nx),bleach=new Float32Array(nx*nx);
 const tufa=new Float32Array(nx*nx),oasis=new Float32Array(nx*nx);

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  const y=terrainH(x,z);
  h[k]=y;
  const oph=ARCFLOW_PHYS.ophioliteBeltAt(x,z,SITE);
  serp[k]=oph.serpentinite01;
  const sp=ARCFLOW_PHYS.alkalineSeepAt(x,z,SITE);
  tufa[k]=sp.ceruleanTufa01;
  const fq=ARCFLOW_PHYS.frontierQuiltAt(x,z,SITE);
  red[k]=fq.redDominance01;
  bleach[k]=fq.bleachScar01;
  oasis[k]=fq.augerOasis01;
  const wy=waterH(x,z);
  wet[k]=wy>-1e5?smooth(4.2,-0.2,y-wy):(SKEY==='neva'?smooth(3.2,0.5,y):0);
 }
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  rock[j*nx+i]=clamp(smooth(0.24,0.68,Math.hypot(sx,sz))+serp[j*nx+i]*0.32,0,1);
 }
 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 return{a:{h:h,serp:serp,rock:rock,wet:wet,red:red,bleach:bleach,tufa:tufa,oasis:oasis},at:at};
})();

const FIELD={
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 serpentinite:(x,z)=>FC.at(FC.a.serp,x,z),
 carnelian:(x,z)=>FC.at(FC.a.red,x,z),
 bleach:(x,z)=>FC.at(FC.a.bleach,x,z),
 tufa:(x,z)=>FC.at(FC.a.tufa,x,z),
 oasis:(x,z)=>FC.at(FC.a.oasis,x,z)
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
