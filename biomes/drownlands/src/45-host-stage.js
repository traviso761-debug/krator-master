/* ==================== HOST — stage: Drownlands stations, landforms, KCOAST, KSPACE & BIO.init ==================== */
/* Implements all 4 Drownlands stations from DROWN_SITES (41) and DROWN_PHYS (40):
   - shoal   (145, 520): Ultramafic serpentinite skerries, sunlit < 12 m seagrass/kelp shoals, -84 m Ark-Ward trench,
                         and perched pH 11.4 brucite-aragonite sinter pools along the detachment fault step.
   - bar     (195, 420): V-shaped +25 m megatsunami serpentinite-jade boulder-bar chevron, intertidal sponge-coral flat,
                         leeward tealcoppice phytomining bench, and Prou-Torre inundation refuge reserve.
   - drowned ( 95, 545): Southeastern sedimentary (ultramafic = 0, coal = 214) subsided drowned-valley lagoon of
                         bleach-white tsunami cedar/cypress snags sleeved in visor-oysters below +1.8 m.
   - skerry  (145, 495): High +196 m ultramafic horst skerry with crisp +48.0 m megatsunami trimline separating
                         wave-scoured serpentinite coves below from red-laterite candelabra araucaria refugia above. */

const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{
 const _ce=console.error;
 console.error=function(...a){
  try{
   const m=String(a[0]||'');
   if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);
  }catch(e){}
  return _ce.apply(console,a);
 };
}

const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];
function REGISTER(o){
 REG.push(o);
 BIO.record(o);
}
function regHas(r,x,y,z){
 const ry=r.y==null?0:r.y,dx=x-r.x,dz=z-r.z;
 return dx*dx+dz*dz<=r.r*r.r&&y>=ry-3&&y<=ry+r.h+6;
}

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'shoal';
const SITE=DROWN_SITES[SKEY]||DROWN_SITES.shoal;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

/* Live interactive tidal/tsunami state ([Mean Tide] / [Low Water] / [Drawdown] / [Swell]) */
const DROWN_STATE=Object.assign({},DROWN_PHYS.tideState('Mean Tide'));

const renderer=new THREE.WebGLRenderer({antialias:!(typeof navigator!=='undefined'&&navigator.webdriver)});
renderer.setPixelRatio((typeof navigator!=='undefined'&&navigator.webdriver)?1:Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
{
 BIO.INDEX_ITEMS=PQ.get('index')!=='0';
 BIO.LOD.merge=PQ.get('lodmerge')!=='0';
 BIO.LOD.minTris=1500;
 BIO.LOD.fade=BIO.LOD.merge&&PQ.get('lodfade')!=='0'?0.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&PQ.get('lodcull')!=='0';
}
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
document.body.appendChild(renderer.domElement);

/* 1.59-1.60 atm Am tropical maritime monsoon light */
const scene=new THREE.Scene();
const HAZE=new THREE.Color(SKEY==='drowned'?0xcadcd8:0xc6dce0);
scene.fog=new THREE.FogExp2(HAZE.getHex(),0.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.6,18000);
scene.add(new THREE.HemisphereLight(0xd8eaf2,0x4c5c52,0.84));
const sun=new THREE.DirectionalLight(0xfff6e8,1.30);
sun.position.set(-640,1120,-560);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xd6e6f0,0.22);
fill.position.set(640,360,720);
scene.add(fill);

/* ==================== landform & bathymetry ==================== */
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

function ellipDist(x,z,cx,cz,rx,rz,rot){
 const c=Math.cos(rot==null?0:rot),s=Math.sin(rot==null?0:rot);
 const dx=x-cx,dz=z-cz;
 const u=(dx*c+dz*s)/rx,v=(-dx*s+dz*c)/rz;
 return Math.hypot(u,v);
}

const L=(function(){
 const S=SITE;

 if(SKEY==='shoal'){
  const chute=S.tidalChute;
  /* Detachment fault trace along x ~ -162 m separating shallow shoal from -84 m Ark-Ward escape trench */
  const faultX=z=>-164+24*Math.sin(z*0.0055+0.4)+14*n2(0,z,0.008,101);
  function faultDist(x,z){return Math.abs(x-faultX(z));}
  function land(x,z){
   const fx=faultX(z),u=x-fx;
   /* Sunlit carbonate/olivine shoal bench (-1.6 to -8.8 m) vs plunging -84 m western fault-graben trench */
   let h=-3.8-3.2*smooth(90,480,Math.hypot(x-40,z))+1.55*n2(x,z,0.0045,102)+0.45*n2(x,z,0.018,103);
   if(u<18){
    const drop=smooth(18,-78,u);
    const trenchBed=-84.0+3.5*n2(x,z,0.006,104);
    h=mix(h,trenchBed,drop);
   }
   /* Intertidal ultramafic detachment-fault bench (-2.4..+0.42 m) hosting brucite-aragonite chimneys */
   const benchBand=smooth(58,8,Math.abs(u-26))*smooth(195,125,Math.abs(z-24));
   if(benchBand>0.01){
    h=mix(h,-1.35+1.45*n2(x,z,0.016,105),0.76*benchBand);
   }
   /* Seven sheared dark-green serpentinite skerries (+7.8..+15.6 m, all well below +48 m trimline) */
   for(let i=0;i<S.skerries.length;i++){
    const sk=S.skerries[i];
    const ed=ellipDist(x,z,sk.x,sk.z,sk.rx,sk.rz,sk.rot)*(1+0.11*n2(x,z,0.018,110+i));
    if(ed<1.42){
     /* Broad intertidal prop-root rock apron (-0.8..+2.6 m) around ed = 0.78..1.18, rising to skerry crest */
     const apron=3.2*smooth(1.38,0.88,ed);
     const dome=(sk.top-1.8)*Math.pow(smooth(0.96,0.14,ed),1.15);
     const mullion=1.15*smooth(1.1,0.35,ed)*n2(x,z,0.042,120+i);
     h=Math.max(h,-1.4+apron+dome+mullion);
    }
   }
   /* Constricted skerry-gap submarine tidal race chute (-3.8 m seabed channel; never gouges dry skerry flanks) */
   const cd=distToPoly(chute.pts,x,z);
   if(cd.d<chute.width*1.65&&h<-0.25){
    const bed=-3.8+0.35*n2(x,z,0.05,130);
    h=Math.min(h,mix(h,bed,smooth(chute.width*1.55,chute.width*0.42,cd.d)));
   }
   /* Three perched chalk-white brucite-aragonite sinter basins (level +0.32..+0.42 m, rimH +0.54..+0.66 m):
      strictly >= 0.32 m above mean sea level (0.0 m) and >= 0.22 m below stone rim (zero coplanar water overlap) */
   for(let i=0;i<S.brucitePools.length;i++){
    const bp=S.brucitePools[i];
    const d=Math.hypot(x-bp.x,z-bp.z)/(bp.r*(1+0.06*n2(x,z,0.09,140+i)));
    if(d<1.68){
     const apronH=mix(h,bp.rimH*0.55,smooth(1.66,1.22,d));
     const rimRing=smooth(1.28,1.03,d)*smooth(0.80,1.03,d);
     const bowlIn=smooth(0.98,0.68,d);
     const basinFloor=bp.level-0.38;
     const target=mix(bp.rimH,basinFloor,bowlIn)+0.06*rimRing;
     h=mix(apronH,target,smooth(1.36,1.04,d));
    }
   }
   return h;
  }
  function inBrucitePool(x,z,pad){
   const k=pad==null?1.0:pad;
   for(let i=0;i<S.brucitePools.length;i++){
    const bp=S.brucitePools[i];
    if(Math.hypot(x-bp.x,z-bp.z)<bp.r*k)return bp;
   }
   return null;
  }
  function water(x,z){
   const bp=inBrucitePool(x,z,0.96);
   if(bp)return bp.level;
   const sea=DROWN_STATE.levelM;
   if(land(x,z)<sea-0.03)return sea;
   return -1e9;
  }
  const BRUCITE=(x,z)=>{
   let a=smooth(72,14,faultDist(x,z))*smooth(210,120,Math.abs(z-24))*smooth(3.2,-3.5,land(x,z));
   for(let i=0;i<S.brucitePools.length;i++){
    const bp=S.brucitePools[i];
    a=Math.max(a,smooth(bp.r*1.85,bp.r*0.85,Math.hypot(x-bp.x,z-bp.z)));
   }
   return clamp(a,0,1);
  };
  const LATERITE=(x,z)=>clamp(smooth(6.8,12.5,land(x,z)),0,1);
  const SAND=(x,z)=>clamp(smooth(2.2,-2.2,land(x,z))*(1-BRUCITE(x,z))*smooth(-210,-145,x),0,1);
  const SPONGE=(x,z)=>clamp(smooth(2.0,-3.0,land(x,z))*smooth(-2.0,0.8,land(x,z))*0.65,0,1);
  return{
   land,water,faultDist,inBrucitePool,
   chute,
   BRUCITE,LATERITE,SAND,SPONGE,
   COAL:()=>0,PEAT:()=>0,SHINGLE:()=>0,GOSSAN:()=>0,
   shearAt:(x,z)=>95+55*smooth(-80,-220,x),
   shelterAt:(x,z)=>clamp(0.76-0.25*smooth(120,380,Math.hypot(x,z)),0.25,0.95),
   spine:[[42,-18],[-142,24],[-230,120],[95,22],[185,95],[-58,155]]
  };
 }

 if(SKEY==='bar'){
  const C=S.chevron;
  const westRange=typeof KRELIEF!=='undefined'&&KRELIEF.range
   ?KRELIEF.range({a:C.apex,b:C.westArm,h:C.crestH,w:C.halfW*1.35,crest:0.38,toe:0.18,serr:0.12,seed:201}):(()=>0);
  const eastRange=typeof KRELIEF!=='undefined'&&KRELIEF.range
   ?KRELIEF.range({a:C.apex,b:C.eastArm,h:C.crestH,w:C.halfW*1.35,crest:0.38,toe:0.18,serr:0.12,seed:202}):(()=>0);
  function chevH(x,z){
   return typeof KRELIEF!=='undefined'&&KRELIEF.join?KRELIEF.join([westRange(x,z),eastRange(x,z)]):Math.max(westRange(x,z),eastRange(x,z));
  }
  function land(x,z){
   /* Northern seamount-facing surf ramp (z < -130 dropping to -36 m) and sheltered back-bar lagoon/shoal */
   let h=-2.8-32.0*smooth(-135,-580,z)-8.5*smooth(210,560,z)+1.35*n2(x,z,0.004,203)+0.45*n2(x,z,0.018,204);
   /* Intertidal sponge-coral flat inside the V-chevron (-0.95..+1.35 m mottled rock/sponge bench) */
   const sf=ellipDist(x,z,S.spongeFlat.x,S.spongeFlat.z,S.spongeFlat.rx,S.spongeFlat.rz,0);
   if(sf<1.25){
    const flatY=-0.35+1.15*n2(x,z,0.014,205)+0.42*Math.sin(x*0.045+z*0.03);
    h=mix(h,flatY,smooth(1.22,0.55,sf));
   }
   /* V-shaped megatsunami serpentinite-jade boulder chevron (+2..+25 m imbricated ridges) */
   const ch=chevH(x,z);
   if(ch>0.05){
    const imbric=1.15*Math.sin((z+x*0.25)*0.16)*smooth(2,12,ch);
    h=Math.max(h,-1.2+ch+imbric+0.9*n2(x,z,0.045,206));
   }
   /* Two flanking ophiolite-serpentinite headlands */
   for(let i=0;i<S.headlands.length;i++){
    const hd=S.headlands[i];
    const ed=ellipDist(x,z,hd.x,hd.z,hd.rx,hd.rz,hd.rot)*(1+0.1*n2(x,z,0.012,210+i));
    if(ed<1.38){
     const rise=hd.top*Math.pow(smooth(1.32,0.16,ed),1.28)+3.2*n2(x,z,0.028,215+i)*smooth(1.2,0.4,ed);
     h=Math.max(h,-2.0+rise);
    }
   }
   /* Leeward laterite phytomining coppice bench (+14..+21 m) */
   const cb=ellipDist(x,z,S.coppiceBench.x,S.coppiceBench.z,S.coppiceBench.rx,S.coppiceBench.rz,-0.22);
   if(cb<1.32){
    const bY=S.coppiceBench.elev+2.2*n2(x,z,0.016,220);
    h=Math.max(h,mix(-1.5,bY,smooth(1.28,0.52,cb)));
   }
   /* Streamlined basalt inundation refuge rib at site:prou-torre-north (+14.5 m) */
   const rv=S.reserves[0],rd=Math.hypot(x-rv.x,z-rv.z);
   if(rd<rv.r*1.45){
    h=mix(h,rv.elevM+0.45*n2(x,z,0.025,225),smooth(rv.r*1.4,rv.r*0.65,rd));
   }
   return h;
  }
  function water(x,z){
   const sea=DROWN_STATE.levelM;
   return land(x,z)<sea-0.03?sea:-1e9;
  }
  const SHINGLE=(x,z)=>clamp(smooth(0.5,8.0,chevH(x,z))+0.35*smooth(3.5,0.2,Math.abs(land(x,z)-1.5)),0,1);
  const SPONGE=(x,z)=>clamp(smooth(1.18,0.45,ellipDist(x,z,S.spongeFlat.x,S.spongeFlat.z,S.spongeFlat.rx,S.spongeFlat.rz,0))*smooth(2.4,-2.5,land(x,z)),0,1);
  const LATERITE=(x,z)=>clamp(smooth(1.25,0.45,ellipDist(x,z,S.coppiceBench.x,S.coppiceBench.z,S.coppiceBench.rx,S.coppiceBench.rz,-0.22))+0.4*smooth(28,58,land(x,z)),0,1);
  const SAND=(x,z)=>clamp(smooth(1.8,-3.5,land(x,z))*(1-0.7*SHINGLE(x,z))*(1-0.6*SPONGE(x,z)),0,1);
  return{
   land,water,faultDist:()=>999,inBrucitePool:()=>null,chute:null,chevH,
   BRUCITE:()=>0,LATERITE,SAND,SPONGE,SHINGLE,COAL:()=>0,PEAT:()=>0,GOSSAN:(x,z)=>smooth(35,75,land(x,z)),
   shearAt:(x,z)=>z<-80?345:(chevH(x,z)>2?285:165),
   shelterAt:(x,z)=>z<-80?0.18:clamp(0.68*smooth(-90,85,z),0.2,0.82),
   spine:[[-18,-135],[-8,38],[145,148],[108,96],[-210,45]]
  };
 }

 if(SKEY==='drowned'){
  const gut=S.detachmentGut;
  function land(x,z){
   /* Subsiding sedimentary coal-measure lagoon floor (-3.5 to +0.55 m) with drowned root-mound hummocks */
   const lgD=ellipDist(x,z,S.lagoon.x,S.lagoon.z,S.lagoon.rx,S.lagoon.rz,0.12);
   let h=mix(S.lagoon.floorY+1.65*n2(x,z,0.012,301)+0.75*n2(x,z,0.038,302),-6.8+1.8*n2(x,z,0.006,303),smooth(0.85,1.55,lgD));
   /* Four fault-tilted sandstone & coal valley necks (+24..+31 m, below +47 m trimline) */
   for(let i=0;i<S.necks.length;i++){
    const nk=S.necks[i];
    const ed=ellipDist(x,z,nk.x,nk.z,nk.rx,nk.rz,nk.rot)*(1+0.12*n2(x,z,0.014,310+i));
    if(ed<1.38){
     const rise=(nk.top+2.2)*Math.pow(smooth(1.32,0.18,ed),1.2)+1.4*n2(x,z,0.032,320+i)*smooth(1.15,0.35,ed);
     h=Math.max(h,-2.2+rise);
    }
   }
   /* Jet-black bituminous coal = 214 seam bench at (-172, -42) */
   const cb=Math.hypot(x-S.coalBench.x,z-S.coalBench.z);
   if(cb<S.coalBench.r*1.35){
    const stepY=1.35+1.1*Math.floor(clamp((S.coalBench.r-cb)/18,0,3))+0.25*n2(x,z,0.05,330);
    h=mix(h,stepY,smooth(S.coalBench.r*1.3,S.coalBench.r*0.55,cb));
   }
   /* Driftwood boom cove shoal shelf (-2.0..+0.85 m) */
   const bz=Math.hypot(x-S.boomZone.x,z-S.boomZone.z);
   if(bz<S.boomZone.r*1.25){
    h=mix(h,-1.05+1.1*smooth(S.boomZone.r,0,bz)+0.3*n2(x,z,0.04,335),0.65*smooth(S.boomZone.r*1.25,S.boomZone.r*0.45,bz));
   }
   /* Eastern detachment-fault submarine tidal gut (-6.2 m seabed channel; never gouges dry valley necks) */
   const gd=distToPoly(gut.pts,x,z);
   if(gd.d<gut.width*1.75&&h<-0.25){
    h=Math.min(h,mix(h,-5.8+0.4*n2(x,z,0.04,340),smooth(gut.width*1.65,gut.width*0.45,gd.d)));
   }
   return h;
  }
  function water(x,z){
   const sea=DROWN_STATE.levelM;
   return land(x,z)<sea-0.03?sea:-1e9;
  }
  const COAL=(x,z)=>clamp(smooth(S.coalBench.r*1.45,S.coalBench.r*0.45,Math.hypot(x-S.coalBench.x,z-S.coalBench.z))+0.45*smooth(1.5,9.0,land(x,z))*smooth(0.35,0.68,Math.abs(n2(x,z,0.02,345)+0.5)),0,1);
  const PEAT=(x,z)=>clamp(smooth(1.25,0.35,ellipDist(x,z,S.lagoon.x,S.lagoon.z,S.lagoon.rx,S.lagoon.rz,0.12))*smooth(3.0,-3.8,land(x,z)),0,1);
  const SAND=(x,z)=>clamp(smooth(gut.width*2.4,gut.width*0.6,distToPoly(gut.pts,x,z).d),0,1);
  const SPONGE=(x,z)=>clamp(smooth(1.8,-2.6,land(x,z))*0.6,0,1);
  return{
   land,water,faultDist:()=>999,inBrucitePool:()=>null,chute:gut,
   BRUCITE:()=>0,LATERITE:()=>0,SAND,SPONGE,SHINGLE:()=>0,COAL,PEAT,GOSSAN:()=>0,
   shearAt:(x,z)=>55+65*smooth(gut.width*1.5,0,distToPoly(gut.pts,x,z).d),
   shelterAt:(x,z)=>clamp(0.86-0.3*smooth(180,420,Math.hypot(x-S.lagoon.x,z-S.lagoon.z)),0.38,0.92),
   spine:[[-15,10],[-172,-42],[48,-112],[158,-35],[-165,215]]
  };
 }

 /* Station 4: skerry (high +196 m horst skerry & crisp +48 m megatsunami trimline) */
 const H0=S.horst,lee=S.leeChannel;
 function land(x,z){
  const ed=ellipDist(x,z,H0.x,H0.z,H0.rx,H0.rz,H0.rot)*(1+0.09*n2(x,z,0.012,401));
  /* Surrounding sunlit shoal shelf (-2.5..-16 m) dropping westward into -52..-86 m Whaler Lee Sound */
  let h=-5.5-22.0*smooth(1.08,1.75,ed)-56.0*smooth(-195,-355,x)+1.6*n2(x,z,0.005,402);
  if(ed<1.36){
   /* Lower wave-swept < +48 m serpentinite bench (ed = 0.72..1.16 -> 0..+28 m),
      steep tsunami trimline scarp across +30..+56 m (ed = 0.56..0.72),
      and un-swept red-laterite cuirasse refuge dome climbing to +196 m summit! */
   const foot=H0.benchM*smooth(1.26,0.78,ed);
   const scarp=34.0*smooth(0.74,0.56,ed);
   const crown=(H0.summitM-H0.benchM-34.0)*Math.pow(smooth(0.58,0.06,ed),1.18);
   const cliffMullion=2.6*smooth(0.82,0.52,ed)*smooth(0.32,0.58,ed)*n2(x,z,0.038,403);
   h=Math.max(h,-2.2+foot+scarp+crown+cliffMullion+1.4*n2(x,z,0.018,404));
  }
  /* Two sheltered amphibious teal-sap mangrove coves (-0.9..+3.6 m) notched into the horst foot */
  for(let i=0;i<S.coves.length;i++){
   const cv=S.coves[i],cd=Math.hypot(x-cv.x,z-cv.z);
   if(cd<cv.r*1.32){
    const coveBed=-0.65+3.4*smooth(0,cv.r*0.92,cd)+0.55*n2(x,z,0.035,410+i);
    h=mix(h,Math.min(h,coveBed),0.84*smooth(cv.r*1.28,cv.r*0.58,cd));
   }
  }
  /* Whaler Lee Sound deep tidal race channel */
  const ld=distToPoly(lee.pts,x,z);
  if(ld.d<lee.width*2.2){
   h=Math.min(h,mix(h,-64.0+2.0*n2(x,z,0.02,420),smooth(lee.width*2.1,lee.width*0.5,ld.d)));
  }
  return h;
 }
 function water(x,z){
  const sea=DROWN_STATE.levelM;
  return land(x,z)<sea-0.03?sea:-1e9;
 }
 const LATERITE=(x,z)=>clamp(smooth(H0.trimM-2.0,H0.trimM+10.0,land(x,z)),0,1);
 const GOSSAN=(x,z)=>clamp(smooth(S.cuirasseBaseM-4.0,S.cuirasseBaseM+16.0,land(x,z)),0,1);
 const SAND=(x,z)=>{
  let a=0;
  for(let i=0;i<S.coves.length;i++){
   const cv=S.coves[i];
   a=Math.max(a,smooth(cv.r*1.2,cv.r*0.25,Math.hypot(x-cv.x,z-cv.z)));
  }
  return clamp(a*smooth(4.0,-3.5,land(x,z)),0,1);
 };
 const SPONGE=(x,z)=>clamp(smooth(2.2,-3.2,land(x,z))*smooth(-5.0,0.5,land(x,z))*0.65,0,1);
 return{
  land,water,faultDist:()=>999,inBrucitePool:()=>null,chute:lee,
  BRUCITE:()=>0,LATERITE,SAND,SPONGE,SHINGLE:()=>0,COAL:()=>0,PEAT:()=>0,GOSSAN,
  shearAt:(x,z)=>{
   for(let i=0;i<S.coves.length;i++){
    if(Math.hypot(x-S.coves[i].x,z-S.coves[i].z)<S.coves[i].r*1.1)return 85;
   }
   return 145+85*smooth(10,48,land(x,z))*(1-smooth(48,68,land(x,z)));
  },
  shelterAt:(x,z)=>{
   for(let i=0;i<S.coves.length;i++){
    if(Math.hypot(x-S.coves[i].x,z-S.coves[i].z)<S.coves[i].r*1.1)return 0.84;
   }
   return 0.52;
  },
  spine:[[18,-12],[-205,138],[218,-132],[-275,45],[95,75]]
 };
})();

/* KCOAST natural multi-island shoreline field on the open marine surface */
const COAST_FIELD=(function(){
 if(typeof KCOAST==='undefined')return null;
 const cell=24,R=TERR.R*1.1,nx=Math.round(R*2/cell),nz=nx,data=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
  const x=-R+(i+0.5)*cell,z=-R+(j+0.5)*cell;
  if(!L.inBrucitePool(x,z,1.15)&&L.land(x,z)<=0.05)data[j*nx+i]=255;
 }
 try{
  return KCOAST.build({
   id:'drown-'+SKEY,level:0,seed:SITE.seed,salt:23,sourceCell:320,
   mask:{x0:-R,z0:-R,cell,cellZ:cell,nx,nz,data},
   sample:{
    bare:(x,z)=>L.land(x,z),
    rock:(x,z)=>SKEY==='drowned'?0.22:0.78,
    wet:()=>0.88,
    temp:()=>SITE.temp.mean,
    chan:()=>999,
    keep:(x,z)=>L.inBrucitePool(x,z,1.35)?1:0
   }
  });
 }catch(e){return null;}
})();

function landH(x,z){return L.land(x,z);}
function floor0(){return -4.0;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){
 if(x===_tm.x&&z===_tm.z)return _tm.h;
 const h=L.land(x,z);
 _tm.x=x;_tm.z=z;_tm.h=h;
 return h;
}
function waterH(x,z){return L.water(x,z);}

/* Pure DROWN_PHYS evaluators queried by placement (60) and inspector/asserts (99) */
const TRIM_ELEV=SITE.trimElevM==null?48.0:SITE.trimElevM;
function physSampleAt(x,z){
 const h=terrainH(x,z);
 const shear=L.shearAt(x,z);
 const shelter=L.shelterAt(x,z);
 const fDist=L.faultDist(x,z);
 return DROWN_PHYS.ecotoneAt({
  elevM:h,
  ultramaficByte:SITE.ultramaficByte,
  niByte:SITE.niByte,
  coalByte:SITE.coalByte,
  faultDistM:fDist,
  waveShearPa:shear,
  shelter01:shelter,
  trimElevM:TRIM_ELEV
 });
}
function tsunamiSampleAt(x,z){
 const h=terrainH(x,z);
 const dM=h<0?-h:Math.max(2.5,-terrainH(x-90,z));
 const tDist=SKEY==='shoal'?Math.max(0,x-SITE.trenchX):SITE.trenchDistM;
 return DROWN_PHYS.tsunamiAt({
  px:SITE.px[0],py:SITE.px[1],
  elevM:h,depthM:dM,
  seamountDistKm:SITE.seamountDistKm,
  trenchDistM:tDist,
  tier:3
 });
}

/* ==================== climate, substrate & coast fields ==================== */
function fieldsAt(x,z,h,slope){
 const w=waterH(x,z),inW=(w>-1e8&&w>=h-0.05)?1:0;
 let near=inW?1:0;
 for(let k=0;k<8&&!inW;k++){
  const a=k/8*TAU;
  if(waterH(x+Math.cos(a)*26,z+Math.sin(a)*26)>-1e8){near=Math.max(near,0.86);break;}
 }
 const rock=clamp(Math.max(smooth(0.28,0.65,slope),SITE.ultramaficByte>=128?0.42*(1-L.SAND(x,z)):0.16),0,1);
 const salt=clamp(h<TRIM_ELEV?(0.55+0.45*smooth(28,0,h)):0.18,0,1);
 const wet=clamp(0.48+0.46*near+0.22*L.PEAT(x,z)-0.22*rock+0.06*n2(x,z,0.003,501),0,1);
 const out={
  wet,flow:L.chute?smooth(L.chute.width*1.4,L.chute.width*0.3,distToPoly(L.chute.pts,x,z).d):0,
  upland:smooth(TRIM_ELEV-4,TRIM_ELEV+36,h),
  canyon:0,rim:smooth(TRIM_ELEV-6,TRIM_ELEV+6,h)*smooth(TRIM_ELEV+28,TRIM_ELEV+6,h),
  rock,dune:L.SAND(x,z),oasis:0,slope,abyss:smooth(-28,-75,h),
  salt,cold:0,geo:L.BRUCITE(x,z),barren:L.SHINGLE(x,z),
  fog:0.32,mist:0.38*near,flat:clamp(1-slope,0,1)
 };
 if(COAST_FIELD&&KCOAST.fields)KCOAST.fields(COAST_FIELD,x,z,out);
 return out;
}

const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','flat'];
const FC=(function(){
 const N=256,S=TERR.R*2.2,a={};
 FNAMES.forEach(n=>{a[n]=new Float32Array(N*N);});
 a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  a.h[j*N+i]=terrainH((i/(N-1)-0.5)*S,(j/(N-1)-0.5)*S);
 }
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){
  const x=(i/(N-1)-0.5)*S,z=(j/(N-1)-0.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)];
  const hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i];
  const slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.4,0,1.4);
  const F=fieldsAt(x,z,a.h[k],slope);
  FNAMES.forEach(n=>{a[n][k]=F[n];});
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
 return{N,S,a,at};
})();
const FIELD={};
FNAMES.forEach(n=>{FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z);});

/* ==================== KSPACE occupancy & BIO.init ==================== */
const DROWN_SPACE=KSPACE.create({cell:16});
function reserveStageObstacles(sp){
 if(!sp)return;
 if(SITE.reserves){
  for(let i=0;i<SITE.reserves.length;i++){
   const rv=SITE.reserves[i];
   sp.insert({kind:'reserve',id:rv.id,x:rv.x,z:rv.z,r:rv.r*0.65},rv.x,rv.z,rv.r*0.65);
  }
 }
 if(SITE.brucitePools){
  for(let i=0;i<SITE.brucitePools.length;i++){
   const bp=SITE.brucitePools[i];
   sp.insert({kind:'brucite-pool',id:bp.key,x:bp.x,z:bp.z,r:bp.r*0.92},bp.x,bp.z,bp.r*0.92);
  }
 }
}
reserveStageObstacles(DROWN_SPACE);

function rootMask(x,z){
 if(L.inBrucitePool(x,z,0.95))return 0;
 const d=terrainH(x,z)-0.0;
 if(d<-1.6)return 0;
 return d<0.4?clamp((d+1.6)/2.0,0.18,1):1;
}
const WBOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const OBSTACLES=[];
BIO.init({
 tags:'drownlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed==null?1:SITE.seed,origin:L.spine,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:175,mid:400,far:1600,floor:[130,300]},
 windows:{water:WBOX}
});
BIO.setSun([-640,1120,-560]);
