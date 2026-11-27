// ================================================================= SPRINGHOLLOWS — karst, shut-in, MVT crystal & scar physics ([G data])
// Pure engine-neutral functions of purple-red rhyolite porphyry dike intrusions across flat cream cherty-dolomite
// (carbonate-shelf), Tlila-Wada shut-in hydraulics & counterweight boat-lift triggers, first-magnitude artesian mammoth-springs,
// 0.75 g Mississippi-Valley-Type (MVT) celestine/calcite crystal halls along tube_ozarks_15, twilight calcifying tufabryum
// bioluminescence, Ancient defoliant bleach-belt scars, and surveyed Scale-Model 5.1 sites (PLAN.md sections 1-6).
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>; deterministic on core/rand (KRAND).
var HOLLOW_PHYS=(function(root){
 'use strict';
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

 var CONST={
  POLYGON_ID:'rmvyiyw8ucd1y',
  ENDONYM:'Sikwingi-Khaloyi',
  TUBE_ID:'tube_ozarks_15',
  TRUNK_ID:9109,
  TRUNK_NAME:'Tlila-Wada',
  AREA_KM2:56684.0,
  P0_ATM:1.60,
  SCALE_H_M:8000.0,
  G_KRATOR:7.4,
  G_EARTH:9.81,
  LIMESTONE_BYTE:255,
  ZINC_BYTE:90,
  AMBER_BYTE:120,
  CLAY_BYTE:255
 };

 function pressureAtElev(elevM){
  var e=nz(elevM,1257.2);
  return +(CONST.P0_ATM*Math.exp(-e/CONST.SCALE_H_M)).toFixed(4);
 }

 // 1. Strike-aligned purple-red rhyolite porphyry dikes intruding flat cream cherty dolostone (PLAN.md section 1.2 #1)
 function porphyryDikeAt(x,z,site){
  var S=site||{};
  var dikes=S.dikes||[{cx:0.0,cz:0.0,strikeRad:0.42,halfWidthM:64.0}];
  var bestSigned=1e9,bestAbs=1e9,bestStrike=0.42;
  var px=nz(x,0),pz=nz(z,0);
  var K=root.KRAND;
  var wob=K?((K.fbm(px*0.008,0.5,pz*0.008,2,7411)-0.5)*7.5):0.0;

  for(var i=0;i<dikes.length;i++){
   var dk=dikes[i];
   var st=nz(dk.strikeRad,0.42);
   var hw=Math.max(4.0,nz(dk.halfWidthM,64.0));
   var dx=px-nz(dk.cx,0),dz=pz-nz(dk.cz,0);
   // Normal perpendicular to strike direction (cos(st), sin(st)) is (-sin(st), cos(st))
   var perp=-dx*Math.sin(st)+dz*Math.cos(st)+wob;
   var sd=Math.abs(perp)-hw;
   if(sd<bestSigned){
    bestSigned=sd;
    bestAbs=Math.abs(perp);
    bestStrike=st;
   }
  }
  var inDike=bestSigned<=0.0;
  var blend=smooth(12.0,-8.0,bestSigned);
  var hardness=lerp(0.42,0.96,blend);
  return{
   inDike:inDike,
   signedDistM:+bestSigned.toFixed(3),
   centerDistM:+bestAbs.toFixed(3),
   dikeStrikeRad:+bestStrike.toFixed(4),
   rockHardness01:+hardness.toFixed(4),
   strataKind:inDike?'porphyry-dike':'carbonate-shelf'
  };
 }

 // 2. Tlila-Wada continuity & Manning/Froude shut-in constriction hydraulics (PLAN.md section 1.2 #2)
 function shutInFlowAt(o){
  o=o||{};
  var qM3s=clamp(nz(o.qM3s,185.0),8.0,900.0);
  var signedDistM=nz(o.signedDistM,o.inDike?-25.0:60.0);
  var inDike=o.inDike==null?(signedDistM<=0):!!o.inDike;
  var baseSlope=clamp(nz(o.baseSlope,0.0014),0.0002,0.12);

  var pinch01=inDike?clamp(0.78+0.22*smooth(0.0,-28.0,signedDistM),0.78,1.0):smooth(36.0,0.0,signedDistM)*0.55;
  var openWidth=clamp(58.0+0.14*qM3s,65.0,115.0);
  var chuteWidth=clamp(12.5+0.032*qM3s,12.0,23.5);
  var widthM=lerp(openWidth,chuteWidth,pinch01);

  var localSlope=lerp(baseSlope*0.26,Math.max(0.042,baseSlope*28.0),pinch01);
  var manningN=lerp(0.038,0.044,pinch01);
  // Wide-channel Manning with porphyry-sill backwater impoundment in open dolomite reaches
  var rawDepth=Math.pow((qM3s*manningN)/(widthM*Math.sqrt(localSlope)),0.60);
  var depthM=clamp(rawDepth,0.55,8.5);
  var velMs=qM3s/(widthM*depthM);
  var froude=velMs/Math.sqrt(CONST.G_KRATOR*depthM);
  var whitewater01=clamp(smooth(0.55,1.25,froude)*0.78+pinch01*0.26,0,1);
  var liftBypassReq=inDike&&froude>=1.15;

  return{
   channelWidthM:+widthM.toFixed(2),
   depthM:+depthM.toFixed(3),
   velMs:+velMs.toFixed(3),
   froude:+froude.toFixed(3),
   whitewater01:+whitewater01.toFixed(4),
   liftBypassReq:liftBypassReq
  };
 }

 // 3. First-magnitude sapphire artesian karst mammoth-spring boil & optical attenuation (PLAN.md section 1.2 #3)
 function mammothSpringAt(o){
  o=o||{};
  var headDropM=clamp(nz(o.headDropM,465.0),10.0,1600.0);
  var conduitAreaM2=clamp(nz(o.conduitAreaM2,14.5),0.5,85.0);
  var spiderSeep=clamp(nz(o.spiderSeepShare01,0.22),0,1);
  var airTempC=nz(o.airTempC,26.0);

  // Darcy-Weisbach turbulent karst conduit discharge scaled under g = 7.4 m/s2
  var effVel=clamp(0.115*Math.sqrt(2.0*CONST.G_KRATOR*headDropM)*0.22,0.45,3.2);
  var qSpringM3s=clamp(conduitAreaM2*effVel,2.0,48.0);
  var tempC=lerp(17.6,23.8,spiderSeep);
  var caMgPpm=lerp(245.0,378.0,spiderSeep*0.65+smooth(150.0,700.0,headDropM)*0.35);
  var sapphireDepthM=lerp(8.4,15.2,smooth(8.0,32.0,qSpringM3s));
  var deltaT=Math.max(0,airTempC-tempC);
  var mistPlume01=clamp(smooth(2.5,11.5,deltaT)*(0.45+0.55*smooth(8.0,30.0,qSpringM3s)),0,1);

  return{
   qSpringM3s:+qSpringM3s.toFixed(2),
   tempC:+tempC.toFixed(2),
   caMgPpm:+caMgPpm.toFixed(1),
   sapphireDepthM:+sapphireDepthM.toFixed(2),
   mistPlume01:+mistPlume01.toFixed(4)
  };
 }

 // 4. Mississippi-Valley-Type (MVT) calcite-celestine-galena crystal growth window at 0.75 g (PLAN.md section 1.2 #4)
 function mvtCrystalAt(o){
  o=o||{};
  var dikeDistM=Math.max(0,nz(o.dikeDistM,12.0));
  var spiderSeep=clamp(nz(o.spiderSeepShare01,0.48),0,1);
  var depthBelowM=Math.max(0,nz(o.depthBelowTableM,48.0));
  var gKrator=clamp(nz(o.gKrator,CONST.G_KRATOR),2.0,15.0);
  var isSurface=depthBelowM<4.0;

  if(isSurface){
   return{
    speleoPreset:'NONE',
    maxBeamLenM:0.0,
    celestineShare01:0.0,
    galenaZinc01:0.0
   };
  }
  var contact01=smooth(52.0,6.0,dikeDistM);
  var brineMix01=smooth(0.18,0.45,spiderSeep);
  var mvtActive=dikeDistM<45.0&&spiderSeep>=0.25&&depthBelowM>=14.0;
  var gravGain=CONST.G_EARTH/gKrator;
  var baseEarthSpan=mvtActive?lerp(8.2,10.9,contact01*0.6+brineMix01*0.4):lerp(1.4,3.2,contact01);
  var maxBeamLenM=mvtActive?clamp(baseEarthSpan*gravGain,9.5,14.5):clamp(baseEarthSpan,0.8,3.6);
  var celestineShare01=mvtActive?clamp(0.32+0.54*contact01*brineMix01,0,0.92):0.04;
  var galenaZinc01=clamp((CONST.ZINC_BYTE/255.0)*(0.45+0.55*contact01)*(0.35+0.65*brineMix01),0,1);

  return{
   speleoPreset:mvtActive?'CALCITE':'LIMESTONE',
   maxBeamLenM:+maxBeamLenM.toFixed(2),
   celestineShare01:+celestineShare01.toFixed(4),
   galenaZinc01:+galenaZinc01.toFixed(4)
  };
 }

 // 5. Twilight cave-mouth calcifying bryophyte (tufabryum) tufa accretion & 495 nm dusk glow (PLAN.md section 1.2 #5)
 function caveMouthGlowAt(o){
  o=o||{};
  var skyOpen=clamp(nz(o.skyOpenness01,0.18),0,1);
  var humid=clamp(nz(o.springHumidity01,0.86),0,1);
  var isNight=!!o.isNight;

  var inTwilightWindow=skyOpen>=0.04&&skyOpen<=0.42&&humid>=0.65;
  if(!inTwilightWindow){
   return{
    tufaAccretionMmYr:0.0,
    bryoCover01:0.0,
    biolumRadiance01:0.0
   };
  }
  // Bell curve peaking around skyOpenness01 = 0.19 inside damp cave arches & fenestre throats
  var midFit=1.0-Math.min(1.0,Math.abs(skyOpen-0.19)/0.23);
  var humFit=smooth(0.64,0.92,humid);
  var bryoCover01=clamp((0.42+0.58*midFit)*humFit,0.08,1.0);
  var tufaMmYr=bryoCover01*lerp(2.4,9.6,humFit)*(isNight?0.35:1.0);
  var biolum01=isNight?clamp(bryoCover01*(0.68+0.32*midFit),0.22,1.0):0.0;

  return{
   tufaAccretionMmYr:+tufaMmYr.toFixed(3),
   bryoCover01:+bryoCover01.toFixed(4),
   biolumRadiance01:+biolum01.toFixed(4)
  };
 }

 // 6. Ancient incomplete-ecocide defoliant bleach-belt scar & active strangler-front (PLAN.md section 1.2 #6)
 function ecocideScarAt(x,z,site){
  var S=site||{};
  var scar=S.bleachScar||null;
  var years=nz(S.yearsPostCataclysm,412);
  if(!scar){
   return{
    inBleachBelt:false,
    yearsPostCataclysm:years,
    hardpan01:0.0,
    stranglerFront01:0.0
   };
  }
  var px=nz(x,0),pz=nz(z,0);
  var ang=nz(scar.angleRad,-0.58);
  var hw=Math.max(12.0,nz(scar.halfWidthM,62.0));
  var hl=Math.max(40.0,nz(scar.halfLenM,220.0));
  var dx=px-nz(scar.cx,-165.0),dz=pz-nz(scar.cz,-135.0);
  // Geometric straight sprayer swath bounded in width (hw) and western plateau length (hl)
  var along=dx*Math.cos(ang)+dz*Math.sin(ang);
  var perp=-dx*Math.sin(ang)+dz*Math.cos(ang);
  var absD=Math.abs(perp),absL=Math.abs(along);
  var lenMask=smooth(hl*1.08,hl*0.78,absL);
  var inCore=absD<=hw*0.76&&absL<=hl*0.92;
  var hardpan01=clamp(smooth(hw*1.04,hw*0.58,absD)*lenMask,0,1);
  // Biological strangler-front peaks right along chemical margins
  var edgeDist=absL<=hl*0.96?Math.abs(absD-hw*0.88):Math.hypot(Math.max(0,absD-hw*0.88),absL-hl*0.92);
  var stranglerFront01=clamp((1.0-smooth(0.0,hw*0.32,edgeDist))*smooth(hl*1.18,hl*0.82,absL),0,1);

  return{
   inBleachBelt:inCore,
   yearsPostCataclysm:years,
   hardpan01:+hardpan01.toFixed(4),
   stranglerFront01:+stranglerFront01.toFixed(4)
  };
 }

 // Data-driven core/hazard (KHAZ.make) specifications for all 4 Springhollows hazards (PLAN.md section 6.2)
 function hazardSpec(key){
  if(key==='shutin'||key==='springhollows:shutin'){
   return{
    kind:'crush',effect:'bleed',danger:0.78,dose:0.45,falloff:'smooth',
    move:{speed:0.35,sink:0,slip:0.35},
    tell:{colour:'#d85c68',fx:'spray',sound:'roar',sign:'Tlila-Wada Porphyry Shut-In Whitewater Chute'}
   };
  }
  if(key==='fenestre'||key==='springhollows:fenestre'){
   return{
    kind:'fall',effect:null,danger:0.85,dose:0.0,falloff:'none',
    tell:{colour:'#e8e8e8',fx:'edge',sound:null,sign:'Unfenced 18 m Sinkhole Fenestre Skylight Lip'}
   };
  }
  if(key==='sump'||key==='springhollows:sump'){
   return{
    kind:'drown',effect:'drown',danger:0.82,dose:0.35,falloff:'linear',
    move:{speed:0.45,sink:0.25,slip:0},
    tell:{colour:'#1b5cd6',fx:null,sound:'boil',sign:'Deep Artesian Phreatic Resurgence Throat'}
   };
  }
  if(key==='crystal'||key==='springhollows:crystal'){
   return{
    kind:'slip',effect:null,danger:0.25,dose:0.0,falloff:'none',
    move:{speed:0.65,sink:0,slip:0.72},
    tell:{colour:'#b8e2ff',fx:'sheen',sound:null,sign:'Condensate-Wet Celestine Megacrystal Beams'}
   };
  }
  throw new Error('HOLLOW_PHYS.hazardSpec: unknown hazard key '+key);
 }

 function porphyryRelictQuiltAt(x,z,elevRelM,site){
  var S=site||{};
  var dk=porphyryDikeAt(x,z,S);
  var el=elevRelM==null?0:elevRelM;
  var knob01=dk.inDike?clamp((el-11.0)/11.0,0,1):0;
  var KF=(typeof window!=='undefined'?window:globalThis).KFRONTIER;
  if(KF&&typeof KF.quiltAt==='function'){
   var q=KF.quiltAt(x,z,{
    seed:7405,
    edaphicToxicity01:dk.inDike?clamp(0.42+0.55*knob01,0,1):0.04,
    xericExposure01:clamp(0.22+0.62*knob01,0,1),
    skyExposure01:clamp(0.26+0.64*knob01,0,1),
    baselineRed01:0.28,
    mistPylon:S.mistPylon||null,
    elevM:el
   });
   return{
    biosphere:q.biosphere,
    redDominance01:+q.redDominance01.toFixed(4),
    mistPool01:+q.mistPool01.toFixed(4),
    inDike:dk.inDike
   };
  }
  return{
   biosphere:knob01>=0.52?'carnelian':'earth',
   redDominance01:+knob01.toFixed(4),
   mistPool01:0,
   inDike:dk.inDike
  };
 }

 return{
  CONST:CONST,
  pressureAtElev:pressureAtElev,
  porphyryDikeAt:porphyryDikeAt,
  shutInFlowAt:shutInFlowAt,
  mammothSpringAt:mammothSpringAt,
  mvtCrystalAt:mvtCrystalAt,
  caveMouthGlowAt:caveMouthGlowAt,
  ecocideScarAt:ecocideScarAt,
  porphyryRelictQuiltAt:porphyryRelictQuiltAt,
  hazardSpec:hazardSpec
 };
})(typeof window!=='undefined'?window:globalThis);

// Surveyed Scale-Model 5.1 sites for all 5 stations (PLAN.md section 3)
var HOLLOW_SITES=(function(){
 'use strict';
 var S={
  spring:{
   id:'spring',
   out:'springhollows.html',
   name:'Shut-In Big Spring Resurgence & Bald-Cypress Hollow',
   region:'Sikwingi-Khaloyi / Cav Ozarks Resurgence',
   px:[1144,168],
   sky:[872,-162],
   baseElevM:996.2,
   atm:1.41,
   koppen:'Cfa',
   rainMmYr:1255,
   tempC:23.0,
   wind:[2.4,1.2],
   springQ:26.0,
   headDropM:485.0,
   spiderSeep01:0.24,
   cavernId:'cav_ozarks_resurgence',
   tubeId:'tube_ozarks_15',
   strata:{recipe:'carbonate-shelf',range:[-48,145],lateral:'outland-tuff',dir:[0.90,0.43],d0:148,d1:182,tongue:12},
   dikes:[{cx:195.0,cz:18.0,strikeRad:1.12,halfWidthM:26.0}],
   cavern:{
    kind:'resurgence',
    portal:[-92,0],
    archSpanM:24.0,
    floorY:0.4,
    sumpY:-5.8,
    hall:[-148,0],
    hallRx:38.0,
    hallRz:28.0,
    hallH:24.0,
    speleo:'CALCITE'
   },
   reserves:[
    {id:'site:high-ria-springworks',name:'High-Ria Spring-Mill & Barge Landing Reserve',x:88,z:-78,r:42,culture:'xanadu'}
   ]
  },
  shutin:{
   id:'shutin',
   out:'springhollows-shutin.html',
   name:'Purple-Red Rhyolite Porphyry Shut-In Gorge & Boat-Lift Bypass',
   region:'Sikwingi-Khaloyi / Tlila-Wada Five Shut-Ins',
   px:[1224,158],
   sky:[952,-172],
   baseElevM:1480.0,
   atm:1.33,
   koppen:'Cfa',
   rainMmYr:1510,
   tempC:20.5,
   wind:[3.6,1.6],
   riverQM3s:195.0,
   cavernId:null,
   tubeId:'tube_ozarks_15',
   strata:{recipe:'carbonate-shelf',range:[-42,165],lateral:'outland-tuff',dir:[0.92,0.39],d0:-58,d1:58,tongue:9},
   dikes:[{cx:0.0,cz:0.0,strikeRad:1.18,halfWidthM:64.0}],
   cavern:null,
   terraces:[{x:-155,z:112,r:56},{x:-145,z:-118,r:52}],
   reserves:[
    {id:'site:high-ria-boatlift',name:'Eastern Dynasty Counterweight Boat-Lift Bypass Reserve',x:8,z:-108,r:48,culture:'xanadu'}
   ]
  },
  fenestre:{
   id:'fenestre',
   out:'springhollows-fenestre.html',
   name:'Sinkhole Fern-Fenestre & Cathedral of the Red Porphyry Vein',
   region:'Sikwingi-Khaloyi / Cav Ozarks Porphyry',
   px:[1212,174],
   sky:[940,-156],
   baseElevM:1257.2,
   atm:1.37,
   koppen:'Cfa',
   rainMmYr:1475,
   tempC:22.0,
   wind:[2.1,1.1],
   spiderSeep01:0.56,
   cavernId:'cav_ozarks_porphyry',
   tubeId:'tube_ozarks_15',
   strata:{recipe:'carbonate-shelf',range:[-58,95],lateral:'outland-tuff',dir:[0.89,0.45],d0:26,d1:52,tongue:8},
   dikes:[{cx:54.0,cz:8.0,strikeRad:0.46,halfWidthM:28.0}],
   cavern:{
    kind:'fenestre',
    portal:[0,0],
    skylightDiamM:18.0,
    floorY:-26.0,
    sumpY:-27.4,
    hall:[18,16],
    hallRx:56.0,
    hallRz:44.0,
    hallH:34.0,
    speleo:'CALCITE'
   },
   reserves:[
    {id:'site:high-ria-calamine-assay',name:'High-Ria Calamine & Optical Celestine Assay Reserve',x:-118,z:-96,r:38,culture:'xanadu'}
   ]
  },
  glade:{
   id:'glade',
   out:'springhollows-glade.html',
   name:'Cherty-Dolomite & Red-Porphyry Glade, Saffron Terraces & Bleach-Scar',
   region:'Sikwingi-Khaloyi / Cav Ozarks Onyx & Bleach-Belt',
   px:[1176,184],
   sky:[904,-146],
   baseElevM:1106.8,
   atm:1.39,
   koppen:'Cfa',
   rainMmYr:1380,
   tempC:22.5,
   wind:[2.9,1.4],
   spiderSeep01:0.34,
   yearsPostCataclysm:412,
   cavernId:'cav_ozarks_onyx',
   tubeId:'tube_ozarks_15',
   strata:{recipe:'carbonate-shelf',range:[-36,125],lateral:'outland-tuff',dir:[0.85,0.52],d0:32,d1:68,tongue:10},
   dikes:[{cx:68.0,cz:-42.0,strikeRad:0.54,halfWidthM:48.0}],
   bleachScar:{cx:-148.0,cz:112.0,angleRad:-0.52,halfWidthM:58.0},
   terraces:[{x:18,z:96,r:62},{x:92,z:78,r:54}],
   cavern:{
    kind:'onyx',
    portal:[-38,-36],
    skylightDiamM:14.0,
    floorY:-14.5,
    sumpY:-15.6,
    hall:[-38,-8],
    hallRx:36.0,
    hallRz:32.0,
    hallH:20.0,
    speleo:'LIMESTONE'
   },
   reserves:[
    {id:'site:karst-arcology',name:'Springhollows Karst-Spring Hydro-Arcology Approach Reserve',x:156,z:-138,r:56,culture:'ancient'}
   ]
  },
  porphyryrelict:{
   id:'porphyryrelict',
   out:'springhollows-porphyryrelict.html',
   name:'High Red-Porphyry Carnelian Relict Knob & Inert Mist-Pylon',
   region:'Sikwingi-Khaloyi / NE Porphyry Sky-Island',
   px:[1268,142],
   sky:[996,-188],
   baseElevM:2570.2,
   atm:1.16,
   koppen:'Cfa',
   rainMmYr:1506,
   tempC:14.0,
   wind:[3.4,1.5],
   cavernId:null,
   tubeId:'tube_ozarks_15',
   strata:{recipe:'carbonate-shelf',range:[-35,145],lateral:'outland-tuff',dir:[0.82,0.57],d0:-68,d1:68,tongue:11},
   dikes:[{cx:12.0,cz:8.0,strikeRad:0.62,halfWidthM:66.0}],
   mistPylon:{x:-62.0,z:24.0,poolElevM:4.5,bandM:12.0,state:'inert',reachM:680.0},
   cavern:null,
   terraces:[{x:-132,z:98,r:52}],
   reserves:[
    {id:'site:high-ria-porphyry-quarry',name:'High-Ria Imperial Porphyry & Carnelian Assay Reserve',x:-124,z:-104,r:42,culture:'xanadu'}
   ]
  }
 };
 S.labyrinth=S.glade;
 return S;
})();

if(typeof window!=='undefined'){window.HOLLOW_PHYS=HOLLOW_PHYS;window.HOLLOW_SITES=HOLLOW_SITES;}
if(typeof module!=='undefined'&&module.exports){module.exports={HOLLOW_PHYS:HOLLOW_PHYS,HOLLOW_SITES:HOLLOW_SITES};}
