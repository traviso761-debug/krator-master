// ================================================================= ARCFLOW — ophiolite, koski, cerulean seep, bog-ore & crazy-quilt physics ([G data])
// Pure engine-neutral functions of onshore Arch ophiolite/serpentinite belts, chromitite-anorthosite zebra cumulates,
// Helme-Koski bench-cataract & Hiidenkirnu swirl-kettle hydraulics, pH 11.5 Ca-OH cerulean travertine & abiotic H2/CH4
// Jumala-Tuli cold-flames, Musta-Jogi humic Fe-Ni raha-maak penny-ore shoals, and the Serpentine Crazy-Quilt & NE Auger
// Oasis on core/frontier (KFRONTIER). Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>.
var ARCFLOW_PHYS=(function(root){
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
  POLYGON_ID:'rmwetn7jqgm9g',
  ENDONYM:'Kulaneva',
  AREA_DRY_KM2:174912.0,
  P0_ATM:1.60,
  SCALE_H_M:8000.0,
  G_KRATOR:7.4,
  NICKEL_BYTE:180,
  COAL_KUKERSITE_BYTE:228,
  AMBER_BYTE:120
 };

 function pressureAtElev(elevM){
  var e=nz(elevM,210.0);
  return +(CONST.P0_ATM*Math.exp(-Math.max(0,e)/CONST.SCALE_H_M)).toFixed(4);
 }

 /* 1. Onshore Arch serpentinite whalebacks (kalju-selka), zebra cumulates & serpentine toxicity (Mg/Ca > 8, Ni > 2200 ppm) */
 function ophioliteBeltAt(x,z,site){
  var S=site||{};
  var K=root.KRAND;
  var px=nz(x,0),pz=nz(z,0);
  var wob=K?((K.fbm(px*0.006,0.5,pz*0.006,2,8111)-0.5)*14.0):0.0;
  var serp=clamp(nz(S.baseSerpentinite01,0.22),0,1);

  if(S.skerries&&S.skerries.length){
   var bestS=0;
   for(var i=0;i<S.skerries.length;i++){
    var sk=S.skerries[i];
    var ca=Math.cos(nz(sk.yaw,0.35)),sa=Math.sin(nz(sk.yaw,0.35));
    var dx=px-nz(sk.x,0),dz=pz-nz(sk.z,0);
    var lx=(dx*ca+dz*sa)/Math.max(8,nz(sk.rx,48));
    var lz=(-dx*sa+dz*ca)/Math.max(8,nz(sk.rz,26));
    var rEll=Math.sqrt(lx*lx+lz*lz)+wob*0.012;
    var wSk=smooth(1.18,0.62,rEll);
    if(wSk>bestS)bestS=wSk;
   }
   serp=Math.max(serp,bestS);
  }
  if(S.thrustScarp){
   var ts=S.thrustScarp;
   var sDist=(px-nz(ts.x0,-24))*nz(ts.nx,-1)+(pz-nz(ts.z0,0))*nz(ts.nz,0)+wob*0.5;
   serp=Math.max(serp,smooth(-28,22,sDist)*0.94);
  }
  if(S.klintLipX!=null){
   /* Wet serpentinite fault-lens exposed along the Klint caprock & gorge wall */
   var dLip=Math.abs(px-S.klintLipX+wob*0.4);
   if(Math.abs(pz)>26){
    serp=Math.max(serp,smooth(36,8,dLip)*0.72);
   }
  }

  /* Zebra-cumulate rhythmic chromitite-pyroxenite-anorthosite striping across tilted layered sills */
  var phase=(px*0.86+pz*0.51)*0.18+(K?(K.fbm(px*0.02,0.5,pz*0.02,2,8112)-0.5)*1.4:0);
  var stripeRaw=0.5+0.5*Math.cos(phase);
  var cumulate01=clamp(nz(S.cumulateShare01,0)*stripeRaw*(0.45+0.55*serp),0,1);
  var garnierite01=clamp(serp*smooth(0.35,0.78,K?K.fbm(px*0.018,0.5,pz*0.018,2,8113):0.5),0,1);
  var mgCa=lerp(0.65,14.5,serp);
  var niPpm=lerp(45.0,3400.0,serp*(0.7+0.3*garnierite01));
  var refuge01=smooth(4.5,8.5,mgCa);

  return{
   serpentinite01:+serp.toFixed(4),
   cumulateStripe01:+cumulate01.toFixed(4),
   garnierite01:+garnierite01.toFixed(4),
   mgCaRatio:+mgCa.toFixed(2),
   niPpm:+niPpm.toFixed(1),
   carnelianRefuge01:+refuge01.toFixed(4)
  };
 }

 /* 2. Active continental serpentinization: pH 11.5 Ca-OH cerulean travertine & abiotic H2/CH4 Jumala-Tuli cold-flames */
 function alkalineSeepAt(x,z,site){
  var S=site||{};
  if(!S.seep){
   return{ph:6.4,ceruleanTufa01:0.0,h2FlameProb01:0.0,caustic01:0.0};
  }
  var sp=S.seep;
  var px=nz(x,0),pz=nz(z,0);
  var dx=px-nz(sp.x,0),dz=pz-nz(sp.z,0);
  var d=Math.hypot(dx*0.75,dz);
  var rMax=nz(sp.r,135.0);
  var apron=smooth(rMax,rMax*0.24,d);
  var ph=lerp(6.8,11.65,apron);
  var tufa=clamp(apron*smooth(9.2,10.8,ph),0,1);
  var flame=0.0;
  if(sp.flames&&sp.flames.length){
   for(var i=0;i<sp.flames.length;i++){
    var fl=sp.flames[i];
    var fd=Math.hypot(px-fl[0],pz-fl[1]);
    flame=Math.max(flame,smooth(14.0,2.5,fd));
   }
  }
  return{
   ph:+ph.toFixed(2),
   ceruleanTufa01:+tufa.toFixed(4),
   h2FlameProb01:+flame.toFixed(4),
   caustic01:+smooth(10.2,11.4,ph).toFixed(4)
  };
 }

 /* 3. Helme-Koski zebra-cumulate bench-cataract hydraulics, Hiidenkirnu swirl-kettles & sampo waterhead */
 function koskiHydraulicsAt(qM3s,onSill,sillDropM){
  var q=clamp(nz(qM3s,433.0),25.0,1800.0);
  var sill=!!onSill;
  var drop=clamp(nz(sillDropM,sill?4.8:0.4),0.1,65.0);
  var widthM=sill?clamp(22.0+0.038*q,20.0,54.0):clamp(56.0+0.085*q,52.0,145.0);
  var slope=sill?clamp(drop/38.0,0.032,0.22):0.0011;
  var manningN=sill?0.042:0.034;
  var depthM=clamp(Math.pow((q*manningN)/(widthM*Math.sqrt(slope)),0.60),0.55,7.8);
  var velMs=q/(widthM*depthM);
  var froude=velMs/Math.sqrt(CONST.G_KRATOR*depthM);
  var pothole01=sill?clamp(smooth(0.85,1.45,froude)*0.88+0.12,0,1):0.06;
  /* Hydro-mechanical head available to a Kulanewa dual-wheel sampo forge (rho=1000 kg/m3, g=7.4 m/s2, eta=0.72) */
  var millHeadKw=+(0.001*1000.0*CONST.G_KRATOR*Math.min(q*0.18,42.0)*drop*0.72).toFixed(1);
  return{
   widthM:+widthM.toFixed(2),
   depthM:+depthM.toFixed(3),
   velMs:+velMs.toFixed(3),
   froude:+froude.toFixed(3),
   pothole01:+pothole01.toFixed(4),
   millHeadKw:millHeadKw
  };
 }

 /* 4. Musta-Jogi humic peat-acid leaching (pH 4.3) & regenerating Fe-Ni raha-maak ("penny-ore") shoals */
 function bogOreShoalAt(humicPh,o2Mix01,niLeach01){
  var ph=clamp(nz(humicPh,4.35),3.2,8.5);
  var o2=clamp(nz(o2Mix01,0.82),0,1);
  var ni=clamp(nz(niLeach01,0.74),0,1);
  var acidMob=smooth(6.2,4.6,ph);
  var precip=acidMob*smooth(0.35,0.78,o2);
  var kgM2=lerp(0.15,18.4,precip);
  var niPct=lerp(0.4,8.6,ni*precip);
  return{
   pennyOreKgM2:+kgM2.toFixed(2),
   niWtPct:+niPct.toFixed(2),
   rakeReady:kgM2>=6.5
  };
 }

 /* 5. Deterministic Serpentine Crazy-Quilt + NE Bleach-Swath & 45 m Auger Lime-Oasis (delegates to core/frontier KFRONTIER) */
 function frontierQuiltAt(x,z,site){
  var S=site||{};
  var KF=root.KFRONTIER;
  var oph=ophioliteBeltAt(x,z,S);
  var seep=alkalineSeepAt(x,z,S);
  var edaph=clamp(Math.max(oph.carnelianRefuge01,seep.caustic01*0.92),0,1);
  var xeric=clamp(nz(S.xericBase,0.22)+oph.serpentinite01*0.38+seep.ceruleanTufa01*0.25,0,1);
  var skyEx=clamp(nz(S.skyExposureBase,0.28)+oph.serpentinite01*0.32,0,1);
  if(KF&&typeof KF.quiltAt==='function'){
   var q=KF.quiltAt(x,z,{
    seed:nz(S.seed,8101),
    edaphicToxicity01:edaph,
    xericExposure01:xeric,
    skyExposure01:skyEx,
    baselineRed01:nz(S.baselineRed01,0.25),
    swath:S.swath||null,
    auger:S.auger||null,
    elevM:nz(S.baseElevM,210)
   });
   return{
    biosphere:q.biosphere,
    redDominance01:+q.redDominance01.toFixed(4),
    bleachScar01:+q.bleachScar01.toFixed(4),
    augerOasis01:+q.augerOasis01.toFixed(4),
    stranglerEdge01:+q.stranglerEdge01.toFixed(4),
    skeleton01:+q.skeleton01.toFixed(4),
    mgCaRatio:oph.mgCaRatio,
    niPpm:oph.niPpm
   };
  }
  var red=edaph>=0.52?1:0;
  return{
   biosphere:red?'carnelian':'earth',
   redDominance01:red,
   bleachScar01:0,
   augerOasis01:0,
   stranglerEdge01:0,
   skeleton01:0,
   mgCaRatio:oph.mgCaRatio,
   niPpm:oph.niPpm
  };
 }

 function hazardSpec(key){
  if(key==='klintdrop'||key==='arcflow:klintdrop'){
   return{
    kind:'fall',effect:null,danger:0.88,dose:0.0,falloff:'none',
    tell:{colour:'#d6a84e',fx:'spray',sound:'roar',sign:'55 m Undercut Kulaneva-Klint Waterfall Lip'}
   };
  }
  if(key==='koskisweep'||key==='arcflow:koskisweep'){
   return{
    kind:'crush',effect:'bleed',danger:0.76,dose:0.42,falloff:'smooth',
    move:{speed:0.36,sink:0,slip:0.38},
    tell:{colour:'#5ab6d8',fx:'spray',sound:'roar',sign:'Helme-Koski Zebra-Cumulate Rapids & Hiidenkirnu Vortex'}
   };
  }
  if(key==='causticseep'||key==='arcflow:causticseep'){
   return{
    kind:'acid',effect:'corrode',danger:0.68,dose:0.36,falloff:'smooth',
    move:{speed:0.65,sink:0.05,slip:0.42},
    tell:{colour:'#b8ecff',fx:null,sound:'trickle',sign:'pH 11.5 Hyperalkaline Ca-OH Cerulean Travertine Pool'}
   };
  }
  if(key==='coldflame'||key==='arcflow:coldflame'){
   return{
    kind:'heat',effect:'burn',danger:0.74,dose:0.50,falloff:'linear',
    tell:{colour:'#66b8ff',fx:'shimmer',sound:'hiss',sign:'Jumala-Tuli Abiotic H2/CH4 Rock-Flame Vent'}
   };
  }
  if(key==='peatmire'||key==='arcflow:peatmire'){
   return{
    kind:'sink',effect:null,danger:0.52,dose:0.15,falloff:'smooth',
    move:{speed:0.32,sink:0.55,slip:0.15},
    tell:{colour:'#3b2a1e',fx:null,sound:null,sign:'Quaking Sphagnum & Humic Peat Bog Pocket'}
   };
  }
  return{
   kind:'poison',effect:'poison',danger:0.64,dose:0.28,falloff:'smooth',
   tell:{colour:'#ebe7de',fx:'dust',sound:null,sign:'Ancient Defoliant Bleach-Hardpan & Auger Bit'}
  };
 }

 return{
  CONST:CONST,
  pressureAtElev:pressureAtElev,
  ophioliteBeltAt:ophioliteBeltAt,
  alkalineSeepAt:alkalineSeepAt,
  koskiHydraulicsAt:koskiHydraulicsAt,
  bogOreShoalAt:bogOreShoalAt,
  frontierQuiltAt:frontierQuiltAt,
  hazardSpec:hazardSpec
 };
})(typeof window!=='undefined'?window:globalThis);

var ARCFLOW_SITES={
 klint:{
  id:'klint',
  name:'Kulaneva-Klint 55 m Horseshoe Waterfall & Kukersite Gorge',
  region:'Arcflow / Suur-Neva Fall-Line',
  px:[638,136],
  sky:[366,-194],
  baseElevM:121.0,
  atm:1.57,
  koppen:'Cfa',
  rainMmYr:1882,
  wind:[2.6,1.1],
  seed:8101,
  baseSerpentinite01:0.06,
  baselineRed01:0.08,
  klintLipX:-14.0,
  strata:{
   formations:[
    {recipe:'klint-foredeep',base:-45,top:8},
    {recipe:'klint-kukersite',top:28},
    {recipe:'arch-rift-basalt',top:95}
   ],
   range:[-45,95]
  },
  skerries:[
   {x:-56,z:-64,rx:26,rz:16,yaw:0.28},
   {x:-48,z:68,rx:24,rz:15,yaw:-0.32}
  ],
  reserves:[
   {id:'site:kulanewa-karum-bridge',name:'Kulanewa Kaarum Clearing-Wharf & Sampo Mill-Bridge Reserve',x:118,z:-78,r:48,culture:'kulanewa'}
  ]
 },
 koski:{
  id:'koski',
  name:'Helme-Koski Zebra-Cumulate Rapids & Hiidenkirnu Swirl-Kettles',
  region:'Arcflow / Helme-Koski',
  px:[556,96],
  sky:[284,-234],
  baseElevM:458.2,
  atm:1.51,
  koppen:'Cfa',
  rainMmYr:1820,
  wind:[2.9,1.3],
  seed:8102,
  baseSerpentinite01:0.18,
  cumulateShare01:0.92,
  baselineRed01:0.22,
  strata:{recipe:'arch-ophiolite',range:[-35,120]},
  skerries:[
   {x:-38,z:-58,rx:46,rz:22,yaw:0.15},
   {x:42,z:56,rx:48,rz:24,yaw:-0.18},
   {x:96,z:-62,rx:38,rz:20,yaw:0.42},
   {x:-108,z:64,rx:40,rz:21,yaw:-0.35}
  ],
  kettles:[
   {x:-28,z:-24,r:3.4,depth:3.6},
   {x:6,z:25,r:4.1,depth:4.4},
   {x:38,z:-23,r:3.1,depth:3.2},
   {x:64,z:24,r:2.8,depth:2.9}
  ],
  reserves:[
   {id:'site:kulanewa-sampo-forge',name:'Kulanewa Dual-Wheel Arch-Nickel Sampo Hydro-Forge Reserve',x:-18,z:-108,r:46,culture:'kulanewa'}
  ]
 },
 seep:{
  id:'seep',
  name:'pH 11.5 Cerulean Travertine Cascades & Jumala-Tuli Cold-Flames',
  region:'Arcflow / Central Arch Thrust Bluff',
  px:[518,118],
  sky:[246,-212],
  baseElevM:116.3,
  atm:1.58,
  koppen:'Am',
  rainMmYr:2070,
  wind:[2.2,0.9],
  seed:8103,
  baseSerpentinite01:0.18,
  baselineRed01:0.42,
  thrustScarp:{x0:-18,z0:0,nx:-0.96,nz:0.28},
  seep:{
   x:-8,z:0,r:108.0,
   flames:[[-46,-22],[-52,18],[-28,34],[-64,-4]]
  },
  strata:{recipe:'arch-ophiolite',range:[-30,160]},
  skerries:[
   {x:68,z:-64,rx:44,rz:26,yaw:0.35},
   {x:82,z:58,rx:42,rz:24,yaw:-0.28}
  ],
  reserves:[
   {id:'site:kulanewa-ikki-shrine',name:'Kula-Na Uncrowned Bell & Jumala-Tuli Covenant Sanctuary Reserve',x:132,z:-86,r:44,culture:'kulanewa'}
  ]
 },
 neva:{
  id:'neva',
  name:'Musta-Jogi Kalju-Selka Serpentine Skerries & Raha-Maak Penny-Ore Fen',
  region:'Arcflow / Musta-Jogi Fenlands',
  px:[648,130],
  sky:[376,-200],
  baseElevM:235.0,
  atm:1.55,
  koppen:'Cfa',
  rainMmYr:1850,
  wind:[2.1,1.2],
  seed:8104,
  baseSerpentinite01:0.08,
  baselineRed01:0.28,
  strata:{recipe:'arch-ophiolite',range:[-25,95]},
  skerries:[
   {x:-64,z:-44,rx:48,rz:26,yaw:0.32},
   {x:58,z:-52,rx:52,rz:28,yaw:-0.24},
   {x:-18,z:64,rx:46,rz:25,yaw:0.18},
   {x:118,z:42,rx:44,rz:24,yaw:0.52},
   {x:-134,z:36,rx:42,rz:22,yaw:-0.42},
   {x:8,z:-128,rx:40,rz:22,yaw:0.12}
  ],
  shoals:[
   {x:-12,z:-8,r:24},
   {x:42,z:8,r:22},
   {x:-78,z:-2,r:20}
  ],
  reserves:[
   {id:'site:kulanewa-bog-rake',name:'Musta-Jogi 20-Year Raha-Maak Penny-Ore Rake Wharf Reserve',x:-118,z:-96,r:44,culture:'kulanewa'}
  ]
 },
 auger:{
  id:'auger',
  name:'NE Ecocide Bleach-Seam & Stalled Lime-Phosphate Auger Oasis',
  region:'Arcflow / Upper Suur-Neva Rim',
  px:[885,108],
  sky:[613,-222],
  baseElevM:1265.4,
  atm:1.37,
  koppen:'Cfa',
  rainMmYr:894,
  wind:[3.2,1.6],
  seed:8105,
  baseSerpentinite01:0.68,
  xericBase:0.52,
  skyExposureBase:0.58,
  baselineRed01:0.55,
  strata:{
   formations:[
    {recipe:'outland-redbeds',base:-40,top:12},
    {recipe:'arch-ophiolite',top:120}
   ],
   range:[-40,120]
  },
  swath:{
   x0:-68,z0:24,dx:0.82,dz:0.57,halfWidthM:34.0,vanguardWidthM:20.0,lengthM:1600.0,mode:'swath'
  },
  auger:{
   x:64,z:-28,radiusM:45.0,coreR:6.2
  },
  skerries:[
   {x:-34,z:-82,rx:58,rz:32,yaw:0.28},
   {x:138,z:52,rx:54,rz:30,yaw:-0.36}
  ],
  reserves:[
   {id:'site:kulanewa-watch-post',name:'Kulanewa NE Frontier Watch-Post & Toll Beacon Reserve',x:-138,z:-96,r:42,culture:'kulanewa'}
  ]
 }
};

if(typeof window!=='undefined'){
 window.ARCFLOW_PHYS=ARCFLOW_PHYS;
 window.ARCFLOW_SITES=ARCFLOW_SITES;
}
if(typeof module!=='undefined'&&module.exports){
 module.exports={ARCFLOW_PHYS:ARCFLOW_PHYS,ARCFLOW_SITES:ARCFLOW_SITES};
}
