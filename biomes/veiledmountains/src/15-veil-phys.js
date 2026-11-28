// ================================================================= VEILED MOUNTAINS — condensational mist, cloud-belt, U-valley, nurse-log & epiphyte physics ([G data])
// Pure engine-neutral functions for the Veiled Mountains (rmwzq1pa88m7q; Veilpass rmwvrcfyfbttj, mist valley 2 rmwx2eaiwaen8,
// mist valley rmwx2k9csuncc, Region 177 rmwzq42zszc94; Timpar-Kuran homeland rmwzqi9dwnd31; PLAN.md sections 2-8).
// Models omnipresent condensational mist (mistAt > 0 across all hours and modes), mid-wall cloud-belt immersion, U-valley &
// megabreccia slot-gorge confinement, Z1..Z5 altitudinal stratification, straight nurse-log stilt-root colonnades, bryophyte
// branch bolsters, and epiphyte tiering. Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>.
var VEIL_PHYS=(function(root){
 'use strict';
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){
  if(a===b)return x>=b?1:0;
  var t=clamp((x-a)/(b-a),0,1);
  return t*t*(3-2*t);
 }

 var CONST={
  POLYGON_ID:'rmwzq1pa88m7q',
  SUB_POLYGONS:{
   veilpass:'rmwvrcfyfbttj',
   mistValley2:'rmwx2eaiwaen8',
   mistValley:'rmwx2k9csuncc',
   southVale:'rmwzq42zszc94',
   timparKuran:'rmwzqi9dwnd31'
  },
  HOMELAND:'Timpar-Kuran',
  ANCESTRAL_CRADLE:'Utari-Kuran (Kanopi)',
  AREA_DRY_KM2:115716.0,
  P0_ATM:1.62,
  SCALE_H_M:8150.0,
  G_KRATOR:7.35,
  MIST_FLOOR_MIN:0.22,
  WET_BARK_MIN:0.55,
  CLOUD_BELT_LO_M:2550.0,
  CLOUD_BELT_HI_M:3650.0
 };

 function pressureAtElev(elevM){
  var e=nz(elevM,2380.0);
  return +(CONST.P0_ATM*Math.exp(-Math.max(0,e)/CONST.SCALE_H_M)).toFixed(4);
 }

 // Point-to-segment distance and parameter t in [0, 1]
 function segDist(px,pz,ax,az,bx,bz){
  var dx=bx-ax,dz=bz-az;
  var l2=dx*dx+dz*dz;
  if(l2<=1e-9)return{d:Math.hypot(px-ax,pz-az),t:0};
  var t=clamp(((px-ax)*dx+(pz-az)*dz)/l2,0,1);
  var qx=ax+dx*t,qz=az+dz*t;
  return{d:Math.hypot(px-qx,pz-qz),t:t};
 }

 // 1. Omnipresent condensational mist & cloud-veil (PLAN.md section 3.2: NEVER drops to 0 in any hour or weather mode!)
 function mistAt(x,z,site,opt){
  var S=site||{};
  var o=opt||{};
  var K=root.KRAND;
  var px=nz(x,0),pz=nz(z,0);
  var localY=nz(o.localY,0);
  var elevAsl=nz(S.baseElevM,2380.0)+localY;
  var hour=((nz(o.hour,9.5)%24)+24)%24;
  var mode=o.mode||'veil';

  // Diurnal cold-air pooling factor: peaks around dawn (04:00-09:30), holds a cool condensational floor at midday
  var dawnPeak=smooth(2.5,5.5,hour)*(1.0-smooth(8.5,12.5,hour));
  var nightDrain=(hour<5.5||hour>18.5)?0.35:0.0;
  var diurnalPool=clamp(0.48+0.42*dawnPeak+0.24*nightDrain,0.42,1.0);

  // Spatial noise patchiness (KRAND, deterministic)
  var patch=K?(0.74+0.52*K.fbm(px*0.0085,0.5,pz*0.0085,2,nz(S.seed,9201))):1.0;

  // Talweg / hollow confinement boost
  var dTalweg=Math.abs(pz-nz(S.talwegZ,0));
  if(S.axis==='x')dTalweg=Math.abs(pz-14.0*Math.sin(px*0.008));
  if(S.axis==='z')dTalweg=Math.abs(px-12.0*Math.sin(pz*0.008));
  var hollow01=smooth(165.0,18.0,dTalweg)*smooth(42.0,-4.0,localY);

  // Layer 1: Valley-floor radiation & bog pool mist
  var poolBase=nz(S.poolMistBase,0.42);
  var poolMist01=clamp((poolBase*0.62+0.46*hollow01)*diurnalPool*patch,0.14,1.0);

  // Layer 2: Mid-slope condensational stratus cloud-belt (+2,550..+3,650 m ASL, peaking +2,800..+3,300 m)
  var beltUp=smooth(CONST.CLOUD_BELT_LO_M-120.0,CONST.CLOUD_BELT_LO_M+280.0,elevAsl);
  var beltDn=1.0-smooth(CONST.CLOUD_BELT_HI_M-260.0,CONST.CLOUD_BELT_HI_M+380.0,elevAsl);
  var nwDraft=clamp(nz(S.nwDraft01,0.82),0.2,1.0);
  var cloudBelt01=clamp(beltUp*beltDn*nwDraft*(0.78+0.22*patch),0.08,1.0);

  // Layer 3: Cataract & oculus plunge-spray plume
  var sprayMist01=0.0;
  if(S.falls&&S.falls.length){
   for(var i=0;i<S.falls.length;i++){
    var fl=S.falls[i];
    var df=Math.hypot(px-nz(fl.x,0),pz-nz(fl.z,0));
    var rPlume=nz(fl.r,58.0);
    sprayMist01=Math.max(sprayMist01,smooth(rPlume,rPlume*0.18,df)*nz(fl.gain,0.92));
   }
  }

  var modeGain=mode==='deepveil'?1.34:(mode==='sunbreak'?0.64:1.0);
  var rawTotal=(0.24+0.48*poolMist01+0.46*cloudBelt01+0.58*sprayMist01)*modeGain;
  var totalMist01=clamp(Math.max(CONST.MIST_FLOOR_MIN,rawTotal),CONST.MIST_FLOOR_MIN,1.0);
  var wetness01=clamp(Math.max(CONST.WET_BARK_MIN,0.52+0.38*totalMist01+0.25*sprayMist01),CONST.WET_BARK_MIN,1.0);
  var sightlineM=lerp(340.0,19.0,smooth(0.22,0.96,totalMist01));

  return{
   totalMist01:+totalMist01.toFixed(4),
   poolMist01:+poolMist01.toFixed(4),
   cloudBelt01:+cloudBelt01.toFixed(4),
   sprayMist01:+sprayMist01.toFixed(4),
   wetness01:+wetness01.toFixed(4),
   sightlineM:+sightlineM.toFixed(1),
   whiteout:sightlineM<=28.0
  };
 }

 // 2. Straight fallen-giant nurse-log colonnade lines (image_2, image_3: stilt-rooted spruce & red-cypress regeneration)
 function nurseColonnadeAt(x,z,site){
  var S=site||{};
  var logs=S.nurseLogs||[];
  var px=nz(x,0),pz=nz(z,0);
  var bestD=1e9,bestIdx=-1,bestT=0,bestR=0.85,bestYaw=0;
  for(var i=0;i<logs.length;i++){
   var L=logs[i];
   var sg=segDist(px,pz,L.x0,L.z0,L.x1,L.z1);
   if(sg.d<bestD){
    bestD=sg.d;
    bestIdx=i;
    bestT=sg.t;
    bestR=nz(L.r,0.92);
    bestYaw=Math.atan2(L.z1-L.z0,L.x1-L.x0);
   }
  }
  var onLog01=bestIdx>=0?smooth(bestR*3.4,bestR*0.85,bestD):0.0;
  var stiltLiftM=onLog01>0.05?+(bestR*1.38*onLog01).toFixed(3):0.0;
  return{
   colonnade01:+onLog01.toFixed(4),
   logIndex:bestIdx,
   alongT:+bestT.toFixed(4),
   distM:+(bestD<1e8?bestD:999.0).toFixed(2),
   stiltLiftM:stiltLiftM,
   logRadiusM:+bestR.toFixed(2),
   yawRad:+bestYaw.toFixed(4)
  };
 }

 // 3. Five-zone altitudinal & topographic stratification (PLAN.md section 4: Z1..Z5)
 function zoneAt(elevAslM,slotConfinement01,chute01){
  var e=nz(elevAslM,2380.0);
  var slot=clamp(nz(slotConfinement01,0),0,1);
  var chute=clamp(nz(chute01,0),0,1);

  var wFloor=smooth(2920.0,2540.0,e)*(1.0-slot*0.72);
  var wGorge=slot*smooth(2050.0,2240.0,e)*(1.0-smooth(3220.0,3550.0,e));
  var wCloud=smooth(2540.0,2760.0,e)*(1.0-smooth(3420.0,3720.0,e))*(1.0-chute*0.55);
  var wChute=Math.max(
   smooth(3420.0,3720.0,e)*(1.0-smooth(4650.0,4920.0,e)),
   chute*smooth(3150.0,3480.0,e)*(1.0-smooth(4650.0,4900.0,e))
  );
  var wCol=smooth(4680.0,4960.0,e);

  var sum=wFloor+wGorge+wCloud+wChute+wCol;
  if(sum<=1e-6){wFloor=1.0;sum=1.0;}
  var z1=wFloor/sum,z2=wGorge/sum,z3=wCloud/sum,z4=wChute/sum,z5=wCol/sum;

  var best='mistfloor',bv=z1;
  if(z2>bv){best='gorge';bv=z2;}
  if(z3>bv){best='cloudbelt';bv=z3;}
  if(z4>bv){best='alderchute';bv=z4;}
  if(z5>bv){best='highcol';bv=z5;}

  return{
   zone:best,
   mistfloor:+z1.toFixed(4),
   gorge:+z2.toFixed(4),
   cloudbelt:+z3.toFixed(4),
   alderchute:+z4.toFixed(4),
   highcol:+z5.toFixed(4)
  };
 }

 // 4. Canopy bryophyte bolster & Earth + Kratorian epiphyte tiering (image, image_3, image_9, image_14)
 function epiphyteLoadAt(elevAslM,mist01,canopyFrac01){
  var e=nz(elevAslM,2550.0);
  var m=clamp(nz(mist01,0.68),0,1);
  var cf=clamp(nz(canopyFrac01,0.55),0,1);
  var thermalOk=1.0-smooth(3650.0,4350.0,e);
  var cloudPeak=smooth(2250.0,2750.0,e)*(1.0-smooth(3380.0,3780.0,e));

  // Spongy bryophyte limb bolsters swell clubmaple & cloudoak limbs up to 3x diameter
  var bolsterMul=1.0+2.0*clamp(m*thermalOk*(0.55+0.45*cloudPeak),0,1);
  // Pendulous Selaginella / Usnea curtain length (1.5..5.0 m in Z1-Z3, shorter Usnea in Z4)
  var drapeLenM=thermalOk>0.15?lerp(1.3,4.85,clamp(m*(0.65+0.35*(1-Math.abs(cf-0.52))),0,1)):0.0;
  // Crimson-magenta-violet structural-tinted crown-chalice tanks peak in mid/upper forks under green-filtered cloud light
  var chalice01=clamp(m*thermalOk*(0.42+0.58*cloudPeak)*smooth(0.20,0.55,cf),0,1);
  // Glossy emerald tank-strap bromeliad clusters crowd horizontal crotches & nurse logs
  var tankstrap01=clamp(m*thermalOk*(0.52+0.48*cloudPeak)*(1.0-0.25*smooth(0.75,1.0,cf)),0,1);
  // Opalescent celadon-violet veilcomb mist-gill brackets thrive in spray & lower/mid wet boles
  var veilcomb01=clamp(m*(1.0-smooth(3850.0,4400.0,e))*smooth(0.85,0.25,cf),0,1);

  return{
   bolsterMul:+bolsterMul.toFixed(3),
   drapeLenM:+drapeLenM.toFixed(2),
   crimsonChalice01:+chalice01.toFixed(4),
   tankStrap01:+tankstrap01.toFixed(4),
   veilComb01:+veilcomb01.toFixed(4)
  };
 }

 // 5. High-wall hypoxia & KHAZ hazard specs (PLAN.md section 8, validated against KTAGS.VOCAB.hazardKinds)
 function hypoxiaAt(elevAslM){
  var p=pressureAtElev(elevAslM);
  var danger=smooth(0.74,0.56,p);
  return{
   pAtm:p,
   hypoxic:p<0.65,
   lethal:p<0.60,
   danger01:+danger.toFixed(4)
  };
 }

 function hazardSpec(key){
  if(key==='whiteout'||key==='veil:whiteout'){
   return{
    kind:'slip',effect:null,danger:0.46,dose:0.0,falloff:'smooth',
    move:{speed:0.58,sink:0,slip:0.32},
    tell:{colour:'#b8d4d2',fx:'mist',sound:'wind',sign:'Zero-Visibility Cloud-Belt & Timpar-Kuran Ambush Veil (< 25 m sightline)'}
   };
  }
  if(key==='chasm'||key==='veil:chasm'||key==='veil:moss_crevasse'){
   return{
    kind:'pit',effect:'bleed',danger:0.78,dose:0.0,falloff:'linear',
    move:{speed:0.42,sink:0.25,slip:0.48},
    tell:{colour:'#3d6b38',fx:null,sound:'hollow',sign:'Deceptive Cushion-Moss Bridged Megabreccia Crevasse & Slick Gorge Lip'}
   };
  }
  if(key==='torrent'||key==='veil:torrent'||key==='veil:plunge_torrent'){
   return{
    kind:'drown',effect:'freeze',danger:0.80,dose:0.44,falloff:'smooth',
    move:{speed:0.30,sink:0.20,slip:0.45},
    tell:{colour:'#4ab4b0',fx:'spray',sound:'roar',sign:'+4 C Glacial Snowmelt Cataract Plunge Pool & Braided Ford'}
   };
  }
  if(key==='avalanche'||key==='veil:avalanche'||key==='veil:avalanche_chute'){
   return{
    kind:'crush',effect:'bleed',danger:0.84,dose:0.52,falloff:'linear',
    move:{speed:0.48,sink:0.18,slip:0.40},
    tell:{colour:'#84c842',fx:'snow',sound:'rumble',sign:'Active Wet-Slab Snow & Megabreccia Rockfall Slide-Alder Chute'}
   };
  }
  return{
   kind:'cold',effect:'suffocate',danger:0.88,dose:0.48,falloff:'smooth',
   tell:{colour:'#dce8f2',fx:'frost',sound:'wind',sign:'High Megabreccia Wall Hypoxia & Rime Zone (< 0.65 atm above +5,400 m)'}
  };
 }

 return{
  CONST:CONST,
  pressureAtElev:pressureAtElev,
  mistAt:mistAt,
  nurseColonnadeAt:nurseColonnadeAt,
  zoneAt:zoneAt,
  epiphyteLoadAt:epiphyteLoadAt,
  hypoxiaAt:hypoxiaAt,
  hazardSpec:hazardSpec
 };
})(typeof window!=='undefined'?window:globalThis);

var VEIL_SITES={
 hall:{
  id:'hall',
  name:'The Hall of Veils & Giant Tree-Fern Floor',
  region:'Veiled Mountains / mist valley 2 (Region 174)',
  polygonId:'rmwx2eaiwaen8',
  px:[252,668],
  sky:[-20,338],
  baseElevM:2380.0,
  atm:1.21,
  koppen:'Cfb',
  rainMmYr:3420,
  wind:[2.4,0.8],
  seed:9201,
  axis:'x',
  poolMistBase:0.58,
  nwDraft01:0.88,
  strata:{recipe:'megabreccia',range:[-40,360]},
  nurseLogs:[
   {x0:-68,z0:-28,x1:-22,z1:-24,r:1.05},
   {x0:-12,z0:26,x1:38,z1:30,r:1.12},
   {x0:32,z0:-34,x1:82,z1:-28,r:0.98},
   {x0:-88,z0:34,x1:-40,z1:28,r:0.95},
   {x0:54,z0:24,x1:102,z1:32,r:1.02}
  ],
  falls:[],
  reserves:[
   {id:'site:timpar-kuran-hall',name:'Timpar-Kuran Split-Cedar Clan Plank-House Terrace Reserve',x:116,z:-64,r:44,culture:'timpar-kuran'}
  ]
 },
 gorge:{
  id:'gorge',
  name:'Sol-Cleft Cataract & Epiphyte Cloud-Slope',
  region:'Veiled Mountains / mist valley (Region 175)',
  polygonId:'rmwx2k9csuncc',
  px:[214,742],
  sky:[-58,412],
  baseElevM:2560.0,
  atm:1.18,
  koppen:'Cfb',
  rainMmYr:3380,
  wind:[2.7,1.0],
  seed:9202,
  axis:'x',
  poolMistBase:0.54,
  nwDraft01:0.92,
  strata:{recipe:'megabreccia',range:[-45,380]},
  nurseLogs:[
   {x0:-58,z0:-46,x1:-18,z1:-42,r:0.94},
   {x0:24,z0:48,x1:68,z1:44,r:0.96},
   {x0:-22,z0:54,x1:18,z1:58,r:0.90}
  ],
  spanLogs:[
   {a:[-8,14.8,-14.5],b:[-4,14.2,14.5],r:0.74,sag:0.35},
   {a:[-28,24.2,-13.0],b:[-24,23.5,13.0],r:0.66,sag:0.28}
  ],
  falls:[
   {x:-38,z:0,r:56,gain:0.96},
   {x:-12,z:0,r:64,gain:1.00}
  ],
  reserves:[
   {id:'site:timpar-kuran-chasi',name:'Timpar-Kuran Chasi-Noow Cloud-Spur Ridge Fort Reserve',x:92,z:-88,r:42,culture:'timpar-kuran'}
  ]
 },
 kanopi:{
  id:'kanopi',
  name:'The Weeping Oculus of Kanopi',
  region:'Veiled Mountains / Veilpass Central Cove',
  polygonId:'rmwvrcfyfbttj',
  px:[242,752],
  sky:[-30,422],
  baseElevM:2650.0,
  atm:1.17,
  koppen:'Cfc',
  rainMmYr:3260,
  wind:[2.2,0.9],
  seed:9203,
  axis:'x',
  poolMistBase:0.62,
  nwDraft01:0.90,
  strata:{recipe:'megabreccia',range:[-40,420]},
  oculus:{
   cx:-62.0,
   cy:56.0,
   cz:0.0,
   outerR:47.5,
   innerR:24.0,
   tiltPitch:0.54,
   tiltRoll:0.16,
   lipX:-32.0,
   lipY:65.4,
   lipZ:0.0,
   tarnLevel:0.40
  },
  nurseLogs:[
   {x0:44,z0:-54,x1:88,z1:-48,r:0.98},
   {x0:38,z0:52,x1:84,z1:46,r:1.02}
  ],
  falls:[
   {x:-24,z:0,r:82,gain:1.00}
  ],
  reserves:[
   {id:'site:timpar-kuran-kanopi-shrine',name:'Utari-Kuran Sacred Neutral Sanctuary & Inau Shore Reserve',x:98,z:-58,r:42,culture:'timpar-kuran'}
  ]
 },
 veilpass:{
  id:'veilpass',
  name:'Upper Veilpass U-Trough & the White Col',
  region:'Veiled Mountains / Veilpass Eastern Climb',
  polygonId:'rmwvrcfyfbttj',
  px:[278,842],
  sky:[6,512],
  baseElevM:3520.0,
  colElevM:5400.0,
  atm:1.05,
  koppen:'Dfc',
  rainMmYr:2680,
  wind:[3.6,1.4],
  seed:9204,
  axis:'x',
  poolMistBase:0.46,
  nwDraft01:0.86,
  strata:{recipe:'megabreccia',range:[-40,560]},
  spires:[
   {id:'spire-north-1',x:-28,z:-74,H:58,r:18,e:1.4,ry:0.35,taper:0.44},
   {id:'spire-south-1',x:18,z:78,H:66,r:21,e:1.5,ry:-0.42,taper:0.42},
   {id:'spire-north-2',x:86,z:-86,H:74,r:24,e:1.3,ry:0.22,taper:0.40},
   {id:'spire-south-2',x:-92,z:72,H:52,r:17,e:1.6,ry:-0.28,taper:0.46}
  ],
  chutes:[
   {x:-44,side:-1,w:38},
   {x:22,side:1,w:42},
   {x:78,side:-1,w:36},
   {x:-86,side:1,w:34}
  ],
  nurseLogs:[],
  falls:[],
  reserves:[
   {id:'site:timpar-kuran-veilpass-ambush',name:'Timpar-Kuran Veilpass Snow-Boulder Ambush Bench Reserve',x:-118,z:-52,r:40,culture:'timpar-kuran'}
  ]
 },
 southvale:{
  id:'southvale',
  name:'The Hush-Edge Moss Labyrinth',
  region:'Veiled Mountains / Southern Region 177',
  polygonId:'rmwzq42zszc94',
  px:[228,948],
  sky:[-44,618],
  baseElevM:2880.0,
  atm:1.14,
  koppen:'Dfb',
  rainMmYr:2940,
  wind:[1.8,0.7],
  seed:9205,
  axis:'x',
  poolMistBase:0.68,
  nwDraft01:0.94,
  strata:{recipe:'megabreccia',range:[-35,340]},
  nurseLogs:[
   {x0:-64,z0:-36,x1:-24,z1:-30,r:0.86},
   {x0:28,z0:38,x1:68,z1:32,r:0.88}
  ],
  falls:[],
  reserves:[
   {id:'site:timpar-kuran-hush-watch',name:'Timpar-Kuran Southern Hush-Border Cairn & Moss-Hollow Reserve',x:-108,z:68,r:40,culture:'timpar-kuran'}
  ]
 }
};

if(typeof window!=='undefined'){
 window.VEIL_PHYS=VEIL_PHYS;
 window.VEIL_SITES=VEIL_SITES;
}
if(typeof module!=='undefined'&&module.exports){
 module.exports={VEIL_PHYS:VEIL_PHYS,VEIL_SITES:VEIL_SITES};
}
