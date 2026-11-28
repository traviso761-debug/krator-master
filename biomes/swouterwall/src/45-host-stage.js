// ================================================================= HOST — stage: 4-station glacial lakes, KFROST, KRELIEF, KSTACKS & KHAZ ([web])
// Implements all four surveyed Scale-Model 5.1 South-Western Outer Wall & Trigemini Pass stations (PLAN.md section 3):
//   1. boreallakes (default, dist/swouterwall.html):          +3,040 m, 1.10 atm — Two stepped Boreal Paternoster Lakes & Veil-spill fen
//   2. morainetarn (dist/swouterwall-morainetarn.html):       +4,360 m, 0.91 atm — Turquoise Moraine Lake, Krummholz & KFROST Stone Rings
//   3. trigemini   (dist/swouterwall-trigemini.html):         +5,680 m, 0.76 atm — Trigemini Pass 3-trough junction & Half-Frozen Cold Tarn
//   4. breathvale  (dist/swouterwall-breathvale.html):        +6,100 m, 0.69->0.58 atm — Hanging Breath-Vale & < 0.60 atm Hypoxia Ceiling
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

const SKEY=typeof STATION_KEY!=='undefined'?STATION_KEY:'boreallakes';
const SITE=SWOW_SITES[SKEY]||SWOW_SITES.boreallakes;
const STATION_REGION=SITE.name+' ('+SITE.region+')';
const PQ=new URLSearchParams(location.search);

const INIT_DAWN=PQ.get('dawn')==='1'||PQ.get('mode')==='dawn';
const SWOW_STATE={
 mode:INIT_DAWN?'dawn':'day',
 dawn01:INIT_DAWN?1.0:0.0,
 mistBoost:SKEY==='boreallakes'?0.78:(SKEY==='morainetarn'?0.34:0.12)
};

const renderer=new THREE.WebGLRenderer({antialias:!window.__KRATOR_SW});
renderer.setPixelRatio(window.__KRATOR_SW?1:Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=SKEY==='breathvale'?1.06:1.02;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const HAZE_HEX=SKEY==='breathvale'?0x8ea4c8:SKEY==='trigemini'?0xa8bcd4:SKEY==='morainetarn'?0xbcd0de:0xc8d8de;
const HAZE=new THREE.Color(HAZE_HEX);
scene.fog=new THREE.FogExp2(HAZE.getHex(),SKEY==='boreallakes'?0.00028:SKEY==='morainetarn'?0.00021:SKEY==='trigemini'?0.00016:0.00011);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,0.35,18000);
const hemiLight=new THREE.HemisphereLight(SKEY==='breathvale'?0xc8daf6:0xdce8f2,0x424846,0.88);
scene.add(hemiLight);
const sun=new THREE.DirectionalLight(0xfff4e4,SKEY==='breathvale'?1.52:1.38);
sun.position.set(420,880,-520);
scene.add(sun);
const fill=new THREE.DirectionalLight(0xc4daf0,0.26);
fill.position.set(-510,360,540);
scene.add(fill);

// Set katabatic lean vector on BIO.GIANT / BIO.leanTo
BIO.setGiant(SKEY==='trigemini'?118:SKEY==='breathvale'?165:132);

// ---------------------------------------------------------------- 4-station glacial U-troughs, lakes, moraines & KFROST landforms
const TERR={R:680};
const n2=(x,z,f,seed)=>KRAND.fbm(x*f,0.5,z*f,2,seed)-0.5;

function flattenReserve(h,reserves,x,z,targetY,seed){
 if(!reserves||!reserves.length)return h;
 let out=h;
 for(let i=0;i<reserves.length;i++){
  const R=reserves[i],d=Math.hypot(x-R.x,z-R.z);
  if(d<R.r*1.35){
   out=mix(out,targetY+0.28*n2(x,z,0.02,seed+i*13),smooth(R.r*1.32,R.r*0.72,d));
  }
 }
 return out;
}

// KRELIEF glaciated U-valley bounding walls & junction spurs
const RELIEF_RIDGES=(function(){
 if(SKEY==='boreallakes'){
  return[
   KRELIEF.range({a:[-760,-250],b:[760,-230],h:118,w:210,crest:0.34,toe:0.18,serr:0.10,seed:93101}),
   KRELIEF.range({a:[-760,245],b:[760,260],h:96,w:205,crest:0.36,toe:0.18,serr:0.09,seed:93102})
  ];
 }
 if(SKEY==='morainetarn'){
  return[
   KRELIEF.range({a:[-760,-240],b:[520,-220],h:148,w:210,crest:0.32,toe:0.16,serr:0.11,seed:93201}),
   KRELIEF.range({a:[-760,235],b:[520,245],h:132,w:205,crest:0.34,toe:0.16,serr:0.10,seed:93202}),
   // Arcuate terminal megabreccia moraine damming the eastern side of the turquoise tarn
   KRELIEF.range({a:[96,-128],b:[104,118],h:17.5,w:56,crest:0.45,toe:0.22,serr:0.14,seed:93203})
  ];
 }
 if(SKEY==='trigemini'){
  // Three massive megabreccia junction spurs separating the W Copper Glacier, NE Dalab, and S Rift Highland U-troughs
  return[
   KRELIEF.range({a:[-580,-360],b:[-62,-148],h:195,w:215,crest:0.28,toe:0.15,serr:0.12,seed:93301}),
   KRELIEF.range({a:[158,-82],b:[620,290],h:188,w:210,crest:0.30,toe:0.15,serr:0.12,seed:93302}),
   KRELIEF.range({a:[-580,340],b:[-86,162],h:178,w:205,crest:0.30,toe:0.15,serr:0.11,seed:93303})
  ];
 }
 // Station 4 (breathvale): colossal horseshoe megabreccia headwall rising +450 m above the +6,100 m floor (crossing 0.60 atm at +365 m!)
 return[
  KRELIEF.range({a:[-560,-290],b:[560,-290],h:448,w:265,crest:0.26,toe:0.14,serr:0.09,seed:93401}),
  KRELIEF.range({a:[-440,-280],b:[-360,340],h:392,w:235,crest:0.28,toe:0.14,serr:0.10,seed:93402}),
  KRELIEF.range({a:[440,-280],b:[360,340],h:386,w:235,crest:0.28,toe:0.14,serr:0.10,seed:93403})
 ];
})();

function ridgeSum(x,z){
 const hs=[];
 for(let i=0;i<RELIEF_RIDGES.length;i++)hs.push(RELIEF_RIDGES[i](x,z));
 return KRELIEF.join(hs);
}

// Shared hydrological geometry for exact terrain-water agreement
const LAKE_UPPER={x:-106,z:-14,rx:72,rz:50,level:12.40};
const LAKE_LOWER={x:102,z:12,rx:82,rz:58,level:0.40};
const TARN_MORAINE={x:-16,z:-6,rx:90,rz:62,level:4.60};
const TARN_TRIGEMINI={x:0,z:4,rx:102,rz:72,level:2.20};
const PAN_BREATH={x:-8,z:18,rx:26,rz:21,level:1.40};

function borealRiffleZ(x){
 return lerp(-14,12,smooth(-36,22,x))+3.5*Math.sin((x+8)*0.08);
}
function borealRiffleWaterY(x){
 if(x<=-35)return 12.38;
 if(x>=21)return 0.38;
 return 12.38-12.00*smooth(-35,21,x);
}

function moraineInflowZ(x){
 return -6+7.5*Math.sin((x+160)*0.032);
}
function moraineInflowWaterY(x){
 if(x<=-212)return 21.80;
 if(x>=-104)return 4.58;
 return 21.80-17.22*smooth(-212,-104,x);
}

const FLOW_LINES=(function(){
 if(SKEY==='boreallakes'){
  const pts=[];
  for(let i=0;i<=24;i++){
   const x=-40+(66*i)/24;
   pts.push([x,borealRiffleZ(x)]);
  }
  return[{
   name:'Paternoster Inter-Tarn Boulder Riffle',
   pts:pts,
   w:6.8,
   speed:2.35,
   levelTop:12.38,
   drop:12.00
  }];
 }
 if(SKEY==='morainetarn'){
  const pts=[];
  for(let i=0;i<=26;i++){
   const x=-212+(114*i)/26;
   pts.push([x,moraineInflowZ(x)]);
  }
  return[{
   name:'Cirque Glacial-Flour Meltwater Cascade',
   pts:pts,
   w:6.2,
   speed:2.65,
   levelTop:21.80,
   drop:17.22
  }];
 }
 return[];
})();

function ellipDist(x,z,L,seed){
 const wob=0.055*n2(x,z,0.025,seed);
 return Math.hypot((x-L.x)/L.rx,(z-L.z)/L.rz)+wob;
}

function baseLandBoreal(x,z){
 // Stepped west-to-east glaciated valley floor (+14.8 m bench in west stepping down across x = -35..+21 to +2.6 m bench in east)
 const stepT=smooth(-38,24,x);
 let h=lerp(15.2,3.1,stepT)+ridgeSum(x,z)+2.2*n2(x,z,0.011,9310)+0.65*n2(x,z,0.032,9311);

 // Carve Upper Paternoster Lake (-106, -14, level +12.40 m)
 const dUp=ellipDist(x,z,LAKE_UPPER,9312);
 if(dUp<1.24){
  const bedUp=LAKE_UPPER.level-9.8+1.4*dUp*dUp+0.4*n2(x,z,0.04,9313);
  h=mix(h,bedUp,smooth(1.16,0.82,dUp));
 }
 // Quaking sphagnum fen shelf on sheltered south bay of upper lake (-104, +32)
 const dFen1=Math.hypot((x+104)/34,(z-32)/16);
 if(dFen1<1.15){
  h=mix(h,LAKE_UPPER.level+0.12+0.10*n2(x,z,0.08,9314),smooth(1.12,0.65,dFen1)*0.72);
 }

 // Carve Lower Paternoster Lake (+102, +12, level +0.40 m)
 const dLo=ellipDist(x,z,LAKE_LOWER,9315);
 if(dLo<1.22){
  const bedLo=LAKE_LOWER.level-11.2+1.6*dLo*dLo+0.4*n2(x,z,0.04,9316);
  h=mix(h,bedLo,smooth(1.15,0.82,dLo));
 }
 // Quaking sphagnum fen shelf on sheltered north bay of lower lake (+94, -42)
 const dFen2=Math.hypot((x-94)/38,(z+42)/18);
 if(dFen2<1.15){
  h=mix(h,LAKE_LOWER.level+0.14+0.10*n2(x,z,0.08,9317),smooth(1.12,0.65,dFen2)*0.72);
 }

 // Crisp linking boulder riffle channel between x = -42 and x = +28 (preventing any slab or pocket!)
 if(x>=-44&&x<=30){
  const rz=borealRiffleZ(x),dz=Math.abs(z-rz),wy=borealRiffleWaterY(x);
  const endMask=smooth(-44,-33,x)*smooth(30,19,x);
  if(dz<22&&endMask>0.01){
   const inChan=smooth(8.4,5.4,dz);
   const bankShoulder=wy+2.35+1.4*smooth(8.5,20.0,dz);
   const chanProfile=mix(Math.max(h,bankShoulder),wy-1.45,inChan);
   h=mix(h,chanProfile,endMask);
  }
 }

 h=flattenReserve(h,SITE.reserves,x,z,15.8,9318);
 return h;
}

function baseLandMoraine(x,z){
 // Subalpine cirque-and-moraine bench rising westward toward cirque headwall and ringed by KRELIEF ridges + eastern terminal moraine
 const westRise=22.0*smooth(-78,-260,x)+58.0*smooth(-240,-520,x);
 let h=7.6+westRise+ridgeSum(x,z)+2.6*n2(x,z,0.012,9320)+0.85*n2(x,z,0.035,9321);

 // Hummocky kettle-and-kame texture on the eastern terminal moraine (x = +74..+146)
 if(x>64&&x<156&&Math.abs(z)<135){
  h+=2.8*n2(x,z,0.045,9322)*smooth(64,86,x)*smooth(156,128,x);
 }

 // Carve Turquoise Glacial-Flour Moraine Tarn (-16, -6, level +4.60 m)
 const dTarn=ellipDist(x,z,TARN_MORAINE,9323);
 if(dTarn<1.22){
  const bedT=TARN_MORAINE.level-13.5+2.0*dTarn*dTarn+0.45*n2(x,z,0.04,9324);
  h=mix(h,bedT,smooth(1.14,0.80,dTarn));
 }

 // Carve western glacial-flour meltwater cascade (x = -232..-96) cleanly into tarn
 if(x>=-232&&x<=-96){
  const mz=moraineInflowZ(x),dz=Math.abs(z-mz),wy=moraineInflowWaterY(x);
  const endMask=smooth(-232,-216,x)*smooth(-96,-107,x);
  if(dz<20&&endMask>0.01){
   const inChan=smooth(7.8,4.8,dz);
   const bankShoulder=wy+2.2+1.5*smooth(8.0,18.0,dz);
   const chanProfile=mix(Math.max(h,bankShoulder),wy-1.45,inChan);
   h=mix(h,chanProfile,endMask);
  }
 }

 h=flattenReserve(h,SITE.reserves,x,z,14.2,9328);
 return h;
}

function baseLandTrigemini(x,z){
 // Three converging glacial U-troughs (W Copper Glacier, NE Dalab road, S W Rift Highland) meeting at +5,680 m Cold Tarn
 const rRad=Math.hypot(x,z);
 const troughRise=16.0*smooth(125,480,rRad);
 let h=5.4+troughRise+ridgeSum(x,z)+2.8*n2(x,z,0.011,9330)+0.95*n2(x,z,0.032,9331);

 // Carve Half-Frozen Trigemini Cold Tarn (0, 4, level +2.20 m)
 const dTarn=ellipDist(x,z,TARN_TRIGEMINI,9332);
 if(dTarn<1.20){
  const bedT=TARN_TRIGEMINI.level-15.0+2.2*dTarn*dTarn+0.5*n2(x,z,0.038,9333);
  h=mix(h,bedT,smooth(1.13,0.78,dTarn));
 }

 h=flattenReserve(h,SITE.reserves,x,z,8.8,9338);
 return h;
}

function baseLandBreathvale(x,z){
 // Narrow +6,100 m breath-pocket floor enclosed by +450 m frost-shattered megabreccia amphitheatre walls (crossing < 0.60 atm at y = +365 m!)
 const southOpen=smooth(-40,290,z)*smooth(240,90,Math.abs(x));
 let h=4.8+ridgeSum(x,z)*(1-0.42*southOpen)+18.0*smooth(140,460,z)*southOpen+3.1*n2(x,z,0.012,9340)+1.1*n2(x,z,0.036,9341);

 // Shallow frozen rime-seep basin on the amphitheatre floor (-8, 18, level +1.40 m)
 const dPan=ellipDist(x,z,PAN_BREATH,9342);
 if(dPan<1.26){
  h=mix(h,PAN_BREATH.level-1.15+0.2*n2(x,z,0.06,9343),smooth(1.18,0.74,dPan));
 }

 h=flattenReserve(h,SITE.reserves,x,z,7.2,9348);
 return h;
}

function preFrostTerrainH(x,z){
 if(SKEY==='boreallakes')return baseLandBoreal(x,z);
 if(SKEY==='morainetarn')return baseLandMoraine(x,z);
 if(SKEY==='trigemini')return baseLandTrigemini(x,z);
 return baseLandBreathvale(x,z);
}

// KFROST periglacial landforms (sorted stone polygons, solifluction lobes, aufeis winter ice-sheets & rock glaciers)
const FROST=(function(){
 if(typeof KFROST==='undefined'||SKEY==='boreallakes')return null;
 const polyWhere=(x,z)=>{
  const g=preFrostTerrainH(x,z);
  if(SKEY==='morainetarn'&&g<6.2)return 0;
  if(SKEY==='trigemini'&&g<4.0)return 0;
  if(SKEY==='breathvale'&&(g<2.8||g>145.0))return 0;
  const e=3.0,gx=(preFrostTerrainH(x+e,z)-preFrostTerrainH(x-e,z))/(2*e),gz=(preFrostTerrainH(x,z+e)-preFrostTerrainH(x,z-e))/(2*e);
  return 1-smooth(0.10,0.28,Math.hypot(gx,gz));
 };
 const aufeisList=SKEY==='morainetarn'
  ?[{id:'moraine-aufeis',pts:[[-145,-104],[-35,-98],[62,-92]],w:15,thick:1.05,seg:[64,110],gap:[18,32],cover:0.88,wob:0.28}]
  :SKEY==='trigemini'
  ?[{id:'trigemini-aufeis',pts:[[-275,-12],[-185,-6],[-118,0]],w:18,thick:1.25,seg:[68,118],gap:[16,28],cover:0.92,wob:0.26}]
  :[];
 const rgList=SKEY==='trigemini'
  ?[{id:'trigemini-rockglacier',a:[-248,-168],b:[-138,-96],w:26,h:8.5,ridge:18}]
  :[];
 return KFROST.create({
  seed:SITE.seed+40,
  ground:preFrostTerrainH,
  polygons:{cell:SKEY==='breathvale'?14:15,trough:0.34,rim:0.10,width:0.17,where:polyWhere},
  lobes:{cell:26,h:1.25,where:(x,z)=>SKEY==='breathvale'?0:polyWhere(x,z)*0.8},
  aufeis:aufeisList,
  rockGlaciers:rgList
 });
})();

function rawTerrainH(x,z){
 const base=preFrostTerrainH(x,z);
 if(!FROST||Math.abs(x)>TERR.R*1.08||Math.abs(z)>TERR.R*1.08)return base;
 return base+FROST.h(x,z);
}

// KSTACKS frost-shattered megabreccia buttresses & tors on every station
const STACK_BODIES=(function(){
 if(typeof KSTACKS==='undefined'||!SITE.tors)return[];
 const out=[];
 for(let i=0;i<SITE.tors.length;i++){
  const t=SITE.tors[i];
  out.push(KSTACKS.make({
   id:t.id,
   kind:'tor',
   x:t.x,
   z:t.z,
   H:t.H,
   r:t.r,
   cols:4,
   block:[1.8,4.2],
   clitter:6,
   ground:rawTerrainH,
   seed:t.seed
  }));
 }
 return out;
})();

function landH(x,z){
 const d=Math.hypot(x,z);
 if(d<=TERR.R*1.12)return rawTerrainH(x,z);
 const rim=rawTerrainH(x*(TERR.R/d),z*(TERR.R/d));
 const wallBoost=SKEY==='breathvale'?260.0:SKEY==='trigemini'?185.0:115.0;
 const far=wallBoost*smooth(TERR.R*1.12,5600,d)+38.0*n2(x,z,0.00048,9390)+14.0*n2(x,z,0.0015,9391);
 return rim+far;
}

function terrainH(x,z){return rawTerrainH(x,z);}

function waterH(x,z){
 if(SKEY==='boreallakes'){
  if(ellipDist(x,z,LAKE_UPPER,9312)<1.03)return LAKE_UPPER.level;
  if(ellipDist(x,z,LAKE_LOWER,9315)<1.03)return LAKE_LOWER.level;
  if(x>=-40&&x<=26&&Math.abs(z-borealRiffleZ(x))<7.6)return borealRiffleWaterY(x);
  return -1e9;
 }
 if(SKEY==='morainetarn'){
  if(ellipDist(x,z,TARN_MORAINE,9323)<1.03)return TARN_MORAINE.level;
  if(x>=-212&&x<=-98&&Math.abs(z-moraineInflowZ(x))<7.0)return moraineInflowWaterY(x);
  return -1e9;
 }
 if(SKEY==='trigemini'){
  if(ellipDist(x,z,TARN_TRIGEMINI,9332)<1.03)return TARN_TRIGEMINI.level;
  return -1e9;
 }
 if(ellipDist(x,z,PAN_BREATH,9342)<1.02)return PAN_BREATH.level;
 return -1e9;
}

// Fast gridded field cache for <= 3-layer KGROUND weights & deterministic species placement
const FC=(function(){
 const R=TERR.R*1.12,N=224,step=(R*2)/N,nx=N+1;
 const h=new Float32Array(nx*nx),rock=new Float32Array(nx*nx),wet=new Float32Array(nx*nx);
 const poly=new Float32Array(nx*nx),snow=new Float32Array(nx*nx),aufeis=new Float32Array(nx*nx);
 const fOut={};

 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const k=j*nx+i,x=-R+i*step,z=-R+j*step;
  const y=terrainH(x,z);
  h[k]=y;
  const wy=waterH(x,z);
  wet[k]=wy>-1e5?smooth(4.8,-0.2,y-wy):0;
  if(FROST){
   FROST.sample(x,z,fOut);
   poly[k]=clamp(fOut.poly,0,1);
   aufeis[k]=clamp(fOut.aufeis,0,1);
  }
  const sl0=SITE.snowLine[0],sl1=SITE.snowLine[1];
  snow[k]=clamp(SITE.snowBase*0.55+smooth(sl0,sl1,y)*0.85,0,1);
 }
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){
  const i0=Math.max(0,i-1),i1=Math.min(nx-1,i+1),j0=Math.max(0,j-1),j1=Math.min(nx-1,j+1);
  const sx=(h[j*nx+i1]-h[j*nx+i0])/(2*step),sz=(h[j1*nx+i]-h[j0*nx+i])/(2*step);
  const g=Math.hypot(sx,sz);
  rock[j*nx+i]=clamp(smooth(0.24,0.68,g),0,1);
  snow[j*nx+i]*=(1-smooth(0.52,0.92,g));
 }
 function at(arr,x,z){
  const fx=clamp((x+R)/step,0,N-1e-6),fz=clamp((z+R)/step,0,N-1e-6);
  const ix=fx|0,iz=fz|0,u=fx-ix,v=fz-iz,k=iz*nx+ix;
  return (arr[k]*(1-u)+arr[k+1]*u)*(1-v)+(arr[k+nx]*(1-u)+arr[k+nx+1]*u)*v;
 }
 return{a:{h:h,rock:rock,wet:wet,poly:poly,snow:snow,aufeis:aufeis},at:at};
})();

const FIELD={
 rock:(x,z)=>FC.at(FC.a.rock,x,z),
 wet:(x,z)=>FC.at(FC.a.wet,x,z),
 poly:(x,z)=>FC.at(FC.a.poly,x,z),
 snow:(x,z)=>FC.at(FC.a.snow,x,z),
 aufeis:(x,z)=>FC.at(FC.a.aufeis,x,z),
 pressure:(x,z)=>SWOW_PHYS.pressureAt(SITE.baseElevM+FC.at(FC.a.h,x,z))
};

const SPACE=KSPACE.create({cell:12});
const HAZARDS=[];

BIO.init({
 THREE:THREE,
 scene:scene,
 camera:camera,
 renderer:renderer,
 ticks:tick,
 terrainH:terrainH,
 waterH:waterH,
 fields:FIELD,
 mask:(x,z)=>terrainH(x,z)-Math.max(-1e4,waterH(x,z)),
 center:[0,0],
 radius:TERR.R
});
