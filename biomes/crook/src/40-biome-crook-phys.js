// ================================================================= THE CROOK — physics, ecotones, crops & fauna ([G data])
// Pure engine-neutral functions of differential geometry, barometric pressure, geochemistry, and aero-acoustics across
// Crookshore (0..+950 m, 1.60-1.46 atm), Crookwash (+950..+2,800 m, 1.20 atm), and Crookhead (+1,800..+6,000 m, 1.07 atm).
// Zero THREE, zero DOM, zero Math.random; deterministic on core/rand (KRAND); tested by tests/test-crook.js.
(function(root){
 'use strict';
 var R=root.KRAND;
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

 // 1. Tsunami trimline (+65 m nominal on exposed WNW coasts), spray-bench lithistid sponges (< +65 m), & canopy fog-sponges (>= +65 m)
 function sprayTrimAt(o){
  o=o||{};
  var elevM=nz(o.elevM,0);
  var coastDistKm=Math.max(0,nz(o.coastDistKm,0));
  var wnwExp=clamp(nz(o.wnwExposure01,0.85),0,1);
  var shelter=clamp(nz(o.calderaShelter01,0),0,1);
  var silicaByte=clamp(nz(o.silicaByte,150),0,255);
  var drawdownM=clamp(nz(o.drawdownM,0),0,24);

  var exposedTrim=lerp(52.0,65.0,smooth(0.35,0.65,wnwExp));
  var shelteredTrim=lerp(exposedTrim,34.0,smooth(0.55,0.92,shelter));
  var trimElevM=shelter>0.7?clamp(shelteredTrim,28.0,42.0):exposedTrim;
  var safeTownElevM=65.0;

  var distMist=smooth(2.6,0.0,coastDistKm);
  var surfBoost=lerp(0.45,1.0,wnwExp)*(1.0-0.55*shelter)*(1.0-0.45*smooth(0,14,drawdownM));
  var sprayMist01=clamp(distMist*surfBoost*smooth(trimElevM+18.0,4.0,elevM),0,1);
  var fogBelt01=clamp(smooth(trimElevM-14.0,trimElevM+28.0,elevM)*smooth(640.0,420.0,elevM)*(0.45+0.55*smooth(8.0,0.2,coastDistKm)),0,1);

  var silicaOk=silicaByte>=100;
  var ostiaOpen01=clamp(1.0-smooth(2.5,9.0,drawdownM),0,1);
  var basaltSpongeOk=(elevM>=0.2&&elevM<trimElevM&&sprayMist01>=0.35&&silicaOk);
  var canopySpongeOk=(elevM>=trimElevM&&elevM<=620.0&&fogBelt01>=0.40);
  var woodyOk=(elevM>=trimElevM);

  return{
   trimElevM:+trimElevM.toFixed(3),
   safeTownElevM:safeTownElevM,
   sprayMist01:+sprayMist01.toFixed(4),
   fogBelt01:+fogBelt01.toFixed(4),
   ostiaOpen01:+ostiaOpen01.toFixed(4),
   basaltSpongeOk:basaltSpongeOk,
   canopySpongeOk:canopySpongeOk,
   woodyOk:woodyOk
  };
 }

 // 2. Tributary talweg moisture, canyon mist trapping, and bedrock wall seepage (invariant under fluvial tributary incision)
 function talwegSeepAt(o){
  o=o||{};
  var slope=Math.max(0,nz(o.slope,0));
  var talwegDistM=Math.max(0,nz(o.talwegDistM,120));
  var qLocal=Math.max(0,nz(o.qLocalM3s,85));
  var inc=clamp(nz(o.incision01,0.5),0,1);
  var rainMm=Math.max(0,nz(o.rainMm,1200));

  var qK=clamp(Math.sqrt(qLocal/260.0),0.15,1.25);
  var rainK=clamp(rainMm/1400.0,0.25,1.25);
  var floodReach=12.0+26.0*qK;
  var floodScour01=clamp(smooth(floodReach,2.5,talwegDistM)*smooth(0.42,0.08,slope),0,1);
  var gorgeMist01=clamp((0.28+0.62*inc)*smooth(380.0,18.0,talwegDistM)*clamp(0.55+0.45*qK,0,1.2),0,1);
  var cascadeSpray01=clamp(smooth(95.0,8.0,talwegDistM)*smooth(0.18,0.58,slope)*qK,0,1);
  var seepBand=smooth(260.0,12.0,talwegDistM)*(0.35+0.65*inc)*smooth(0.04,0.26,slope)*smooth(0.88,0.48,slope);
  var seepDischarge01=clamp(seepBand*rainK+0.24*gorgeMist01*smooth(0.06,0.28,slope),0,1);
  var soilWet01=clamp(0.22*rainK+0.52*smooth(180.0,6.0,talwegDistM)+0.34*gorgeMist01-0.28*smooth(0.45,0.85,slope),0,1);

  return{
   soilWet01:+soilWet01.toFixed(4),
   gorgeMist01:+gorgeMist01.toFixed(4),
   cascadeSpray01:+cascadeSpray01.toFixed(4),
   seepDischarge01:+seepDischarge01.toFixed(4),
   floodScour01:+floodScour01.toFixed(4)
  };
 }

 // 3. Southern-hemisphere (28-46 degS) slope aspect insolation, barometric pressure, rain-shadow drying & snowpack
 function aspectClimateAt(o){
  o=o||{};
  var elevM=nz(o.elevM,0);
  var nx=nz(o.nx,0);
  var nzN=nz(o.nz,0);
  var rainMm=Math.max(120,nz(o.rainMm,1200));
  var lee=clamp(nz(o.leeShelter01,0),0,1);
  var mist=clamp(nz(o.gorgeMist01,0),0,1);

  // Southern hemisphere: sun culminates in the north-northeast (-z / +x in world frame where -z is north, or +nzN passed as north-component)
  // Convention: nz > 0 means north-facing (equatorward, sunny in southern hemisphere); nz < 0 means south-facing (poleward, shaded)
  var horiz=Math.sqrt(nx*nx+nzN*nzN);
  var northCos=horiz>1e-6?(nzN/horiz):0;
  var tiltK=clamp(horiz*1.65,0,1);
  var sunny01=clamp(0.5+0.48*northCos*tiltK+0.12*(nx/(horiz>1e-6?horiz:1))*tiltK,0,1);

  var hPos=Math.max(0,elevM);
  var pAtm=1.60*Math.exp(-hPos/8000.0);
  var baseTempC=26.5-0.0064*hPos;
  var effTempC=baseTempC+lerp(-2.2,2.8,sunny01)-1.1*mist;
  var rainFactor=lerp(1.0,0.52,lee)*lerp(1.16,0.72,sunny01)*(1.0+0.22*mist);
  var effRainMm=clamp(rainMm*rainFactor,240,3200);

  var snowLine=2720.0+320.0*sunny01-180.0*clamp((effRainMm-900)/1000,0,1);
  var snowPackM=clamp(smooth(snowLine-180.0,snowLine+950.0,elevM)*lerp(1.15,0.42,sunny01)*(effRainMm/1250.0),0,2.4);

  var zoneBand='cloudforest';
  if(elevM<65.0)zoneBand='spraybench';
  else if(elevM<950.0)zoneBand='cloudforest';
  else if(elevM<2650.0)zoneBand=(sunny01>0.62&&effRainMm<860)?'leeslope':'gorge';
  else if(elevM<4150.0)zoneBand='tarn';
  else zoneBand='fellpass';

  return{
   sunny01:+sunny01.toFixed(4),
   effTempC:+effTempC.toFixed(3),
   effRainMm:+effRainMm.toFixed(1),
   pAtm:+pAtm.toFixed(4),
   zoneBand:zoneBand,
   snowPackM:+snowPackM.toFixed(4)
  };
 }

 // 4. Skarn, nephrite, iron & copper biomineral uptake along incised seep walls and alpine moraines
 function biomineralAt(o){
  o=o||{};
  var jade=clamp(nz(o.jadeByte,0),0,255)/255.0;
  var skarn=clamp(nz(o.skarnByte,0),0,255)/255.0;
  var iron=clamp(nz(o.ironByte,0),0,255)/255.0;
  var copper=clamp(nz(o.copperByte,0),0,255)/255.0;
  var tin=clamp(nz(o.tinByte,0),0,255)/255.0;
  var seep=clamp(nz(o.seepDischarge01,0),0,1);
  var inc=clamp(nz(o.incision01,0),0,1);
  var slope=Math.max(0,nz(o.slope,0));

  var expose=clamp(Math.max(smooth(0.14,0.42,slope),0.85*inc,0.9*seep),0,1);
  var skarnCore=Math.max(skarn,jade*0.92);
  var skarnSeep01=clamp(skarnCore*(0.38+0.62*seep)*(0.35+0.65*expose),0,1);
  var silicaGlaze01=clamp((0.58*jade+0.42*skarn)*(0.32+0.68*seep)*(0.30+0.70*expose)*1.32,0,1);
  var rustScale01=clamp(smooth(0.42,0.86,iron)*(0.30+0.42*skarnCore+0.28*seep)*(0.35+0.65*expose)*1.28,0,1);
  var malachiteRind01=clamp(smooth(0.14,0.48,copper)*(0.45+0.55*smooth(0.35,0.85,iron))*(0.55+0.45*Math.max(expose,0.55))*1.18,0,1);
  var nephriteFloat01=clamp(jade*skarnCore*(0.35+0.65*expose)*(1.0+0.15*tin),0,1);

  return{
   skarnSeep01:+skarnSeep01.toFixed(4),
   silicaGlaze01:+silicaGlaze01.toFixed(4),
   rustScale01:+rustScale01.toFixed(4),
   malachiteRind01:+malachiteRind01.toFixed(4),
   nephriteFloat01:+nephriteFloat01.toFixed(4)
  };
 }

 // 5. Monotone cold-water iron- & jade-stained rimstone bog step geometry (zero uphill water planes)
 function rimstoneAt(o){
  o=o||{};
  var x=nz(o.x,0);
  var z=nz(o.z,0);
  var baseElevM=nz(o.baseElevM,1200);
  var slope=Math.max(0,nz(o.slope,0));
  var seep=clamp(nz(o.seepDischarge01,0),0,1);
  var iron=clamp(nz(o.ironByte,200),0,255)/255.0;
  var jade=clamp(nz(o.jadeByte,180),0,255)/255.0;
  var seed=nz(o.seed,5201)>>>0;

  var active=(slope>=0.06&&slope<=0.36&&seep>=0.42);
  var lipH=clamp(0.28+0.56*smooth(0.06,0.32,slope),0.25,0.92);
  // Quantize baseElevM strictly monotonically into terrace steps of height lipH so lower baseElevM NEVER yields a higher poolLevelM
  var topRef=nz(o.topElevM,2600);
  var drop=Math.max(0,topRef-baseElevM);
  var stepIdx=Math.floor(drop/lipH);
  var uHash=R?R.unit(R.hash(seed,stepIdx,17,0x4D1)):0.5;
  var poolLevelM=topRef-(stepIdx+1)*lipH+0.04;
  var rimWidthM=clamp(0.24+0.28*(1.0-smooth(0.08,0.34,slope))+0.08*uHash,0.20,0.62);

  var stain='ochre';
  if(jade>=0.62&&iron>=0.65)stain=(stepIdx%3===0)?'celadon':(stepIdx%3===1)?'terracotta':'ochre';
  else if(jade>=0.55)stain='celadon';
  else if(iron>=0.70)stain='terracotta';

  return{
   active:active,
   stepIndex:stepIdx,
   poolLevelM:+poolLevelM.toFixed(4),
   lipHeightM:+lipH.toFixed(4),
   rimWidthM:+rimWidthM.toFixed(4),
   stainPalette:stain
  };
 }

 // 6. Aero-acoustic Helmholtz / open-flute culm & seed-chimney resonance (muted cleanly by Silent Vales Great Hush)
 function aeroResonanceAt(o){
  o=o||{};
  var culmDiaM=clamp(nz(o.culmDiaM,0.09),0.015,0.45);
  var chamberLenM=clamp(nz(o.chamberLenM,0.36),0.08,1.80);
  var apDiaM=clamp(nz(o.apertureDiaM,0.022),0.004,culmDiaM*0.85);
  var pAtm=clamp(nz(o.pAtm,1.20),0.45,2.0);
  var windMs=Math.max(0,nz(o.windSpeedMs,6.5));
  var hush=clamp(nz(o.hushSuppression01,0),0,1);

  // Speed of sound scales gently with temperature/altitude regime while density pAtm shifts acoustic impedance & end-correction
  var cSound=338.0*Math.pow(1.20/pAtm,0.06);
  var rCh=culmDiaM*0.44;
  var rAp=apDiaM*0.5;
  var areaAp=Math.PI*rAp*rAp;
  var volCh=Math.PI*rCh*rCh*chamberLenM;
  var wallThick=Math.max(0.004,culmDiaM*0.08);
  var lEff=wallThick+1.65*rAp*Math.pow(pAtm,0.22);
  var fHelm=(cSound/(2.0*Math.PI))*Math.sqrt(areaAp/Math.max(1e-7,volCh*lEff));
  // Open-slit pipe mode contributes on tall slender alpine seed-chimneys
  var fPipe=cSound/(2.0*(chamberLenM+0.6*culmDiaM));
  var pipeMix=smooth(0.075,0.035,culmDiaM);
  var f0Hz=lerp(fHelm,fPipe*0.82,pipeMix);
  var harmonicHz=f0Hz*1.5;

  var windDrive=smooth(1.8,9.5,windMs)*clamp(Math.pow(pAtm,0.35),0.65,1.25);
  var damp=(1.0-hush)*(1.0-hush);
  var audible01=clamp(windDrive*damp,0,1);
  var splDb=audible01>1e-5?(18.0+36.0*audible01):0.0;
  var pollinatorReachM=audible01*lerp(28.0,92.0,clamp(pAtm/1.3,0,1));

  return{
   f0Hz:+f0Hz.toFixed(2),
   harmonicHz:+harmonicHz.toFixed(2),
   splDb:+splDb.toFixed(2),
   audible01:hush>=0.9999?0:+audible01.toFixed(4),
   pollinatorReachM:hush>=0.9999?0:+pollinatorReachM.toFixed(2)
  };
 }

 // 7. Colonial alternative-oxidase (AOX) thermogenic "+15 degC" hearth-ring rosettes & melted circular snow wells
 function thermogenicWellAt(o){
  o=o||{};
  var tAirC=nz(o.tAirC,-2.0);
  var snowPackM=Math.max(0,nz(o.snowPackM,0));
  var starch=clamp(nz(o.starchReserve01,0.85),0,1);
  var colRadM=clamp(nz(o.colonyRadiusM,0.52),0.18,1.20);
  var peatByte=clamp(nz(o.peatByte,140),0,255);

  var peatK=0.55+0.45*smooth(40,150,peatByte);
  // Thermoregulated AOX respiration targets +15.2 degC internal spadix/crown warmth when starch > 0
  var targetC=14.6+1.6*starch*peatK;
  var coreTempC=starch<=0.02?tAirC:lerp(tAirC,Math.max(tAirC,targetC),smooth(0.02,0.35,starch));
  var deltaTC=Math.max(0,coreTempC-tAirC);

  var active=(snowPackM>=0.04&&starch>=0.08&&deltaTC>=3.0);
  // Well radius 0.55..1.10 m (1.1..2.2 m circular well diameter) through late-spring snowpack
  var rawRad=colRadM*(1.18+0.55*clamp(deltaTC/18.0,0,1.2))*(1.0-0.24*smooth(0.35,1.40,snowPackM));
  var meltWellRadiusM=active?clamp(rawRad,0.55,1.10):0.0;
  var bareApronM=active?clamp(meltWellRadiusM*0.72,0.35,0.85):0.0;
  var steamWisp01=active?clamp(smooth(6.0,18.0,deltaTC)*0.75,0,1):0.0;

  return{
   coreTempC:+coreTempC.toFixed(2),
   deltaTC:+deltaTC.toFixed(2),
   meltWellRadiusM:+meltWellRadiusM.toFixed(4),
   WellDiameterM:+(meltWellRadiusM*2.0).toFixed(4),
   bareApronM:+bareApronM.toFixed(4),
   steamWisp01:+steamWisp01.toFixed(4)
  };
 }

 // 8. Eastern Silent Vales ("The Great Hush") acoustic suppression threshold (visual wind stays 1.0 everywhere!)
 function hushAt(o){
  o=o||{};
  var x=nz(o.x,0);
  var z=nz(o.z,0);
  var lineX=nz(o.passLineX,180);
  var nrm=o.passNormalXZ||[1,0];
  var nx=nz(nrm[0],1),nzN=nz(nrm[1],0),nl=Math.sqrt(nx*nx+nzN*nzN);
  if(nl>1e-9){nx/=nl;nzN/=nl;}else{nx=1;nzN=0;}
  var bandM=Math.max(10,nz(o.bandWidthM,140));

  var signedDistM=(x-lineX)*nx+z*nzN;
  var suppression01=smooth(-bandM*0.5,bandM*0.5,signedDistM);
  return{
   signedDistM:+signedDistM.toFixed(3),
   suppression01:+suppression01.toFixed(4),
   bellHarmonicPass01:0.85,
   visualWindScale:1.0
  };
 }

 // 9. Unified ecotone synthesis at a point
 function ecotoneAt(o){
  o=o||{};
  var sp=sprayTrimAt(o);
  var tw=talwegSeepAt(o);
  var ac=aspectClimateAt(Object.assign({},o,{gorgeMist01:tw.gorgeMist01}));
  var bm=biomineralAt(Object.assign({},o,{seepDischarge01:tw.seepDischarge01}));
  return{spray:sp,talweg:tw,climate:ac,biomineral:bm,zone:ac.zoneBand};
 }

 // Crop zone specification matching kits/crops (CROPS.fitZone)
 var CROOK_CROPS={
  atm:1,
  zones:{
   spraybench:{warmth:[3,4],arid:[3,4],wet:true,salt:true,atm:2},
   cloudforest:{warmth:[2,3],arid:[3,4],atm:2},
   gorge:{warmth:[1,2],arid:[2,3],wet:true,atm:1},
   leeslope:{warmth:[2,3],arid:[1,2],atm:1},
   tarn:{warmth:[0,1],arid:[2,3],wet:true,atm:1},
   fellpass:{warmth:[0,0],arid:[2,3],atm:1}
  }
 };

 // Fauna & pollinator records ([G data], vertebrate-grade hexapods + montane birds, amphibians, ungulates; 24h schedules)
 var CROOK_FAUNA=[
  {key:'chordmoth',name:'Chasm-Chord Plume-Hexapod',clade:'hexapod',spanM:0.28,biome:['crook'],zones:['gorge','fellpass'],
   diet:'nectar',yields:['chitin','pollinator-wax'],faction:'wild',subfaction:'crook-pollinator',job:'pollinator',
   schedule:[[0,4,'SHELTER_CLEFT'],[4,9,'POLLINATE_BRAKE'],[9,17,'ROOST_CEDAR'],[17,22,'POLLINATE_CHIMNEY'],[22,24,'SHELTER_CLEFT']]},
  {key:'jadebeetle',name:'Porcelain-Frond Jewel-Hexapod',clade:'hexapod',spanM:0.18,biome:['crook'],zones:['gorge','leeslope'],
   diet:'herbivore',yields:['jade-elytra','chitin'],faction:'wild',subfaction:'crook-skarn',job:'grazer-borer',
   schedule:[[0,6,'TORPOR_BARK'],[6,14,'GRAZE_SKARNFERN'],[14,19,'BORE_CULM'],[19,24,'TORPOR_BARK']]},
  {key:'gorgedipper',name:'Kopa Torrent-Dipper',clade:'bird',spanM:0.22,biome:['crook'],zones:['gorge','cloudforest'],
   diet:'carnivore',yields:['feathers','small-fowl'],faction:'wild',subfaction:'crook-riparian',job:'forager',
   schedule:[[0,6,'ROOST_LEDGE'],[6,12,'DIVE_RAPIDS'],[12,14,'PREEN_BOULDER'],[14,19,'FORAGE_RIMSTONE'],[19,24,'ROOST_LEDGE']]},
  {key:'skarnsalamander',name:'Rimstone Giant Salamander',clade:'amphibian',spanM:1.15,biome:['crook'],zones:['gorge'],
   diet:'carnivore',yields:['amphibian-meat','salamander-hide','healing-mucus'],faction:'wild',subfaction:'crook-rimstone',job:'ambush-predator',
   schedule:[[0,7,'HUNT_POOL'],[7,18,'HIDE_UNDERCUT'],[18,24,'AMBUSH_STEP']]},
  {key:'cragserow',name:'Vardzieti Chasm-Serow',clade:'ungulate',spanM:1.05,biome:['crook'],zones:['gorge','leeslope','tarn','fellpass'],
   diet:'browser',yields:['venison','glacier-pelt','horn','tallow'],faction:'wild',subfaction:'crook-crags',job:'browser',
   schedule:[[0,5,'ROOST_CLIFF'],[5,10,'BROWSE_LEDGE'],[10,15,'BED_CRAG'],[15,20,'LICK_SKARN'],[20,24,'ROOST_CLIFF']]},
  {key:'spongechiton',name:'Basalt-Bench Giant Chiton',clade:'mollusc',spanM:0.38,biome:['crook'],zones:['spraybench'],
   diet:'grazer',yields:['shell-plates','foot-meat'],faction:'wild',subfaction:'crook-littoral',job:'grazer',
   schedule:[[0,8,'GRAZE_SPRAY'],[8,16,'CLAMP_BASALT'],[16,24,'GRAZE_SPRAY']]},
  {key:'hearthptarmigan',name:'Melt-Well Snow-Grouse',clade:'bird',spanM:0.36,biome:['crook'],zones:['tarn','fellpass'],
   diet:'omnivore',yields:['fowl','down-feathers','eggs'],faction:'wild',subfaction:'crook-alpine',job:'forager',
   schedule:[[0,6,'ROOST_KRUMMHOLZ'],[6,11,'FORAGE_WELL'],[11,15,'HUDDLE_HEARTH'],[15,19,'PECK_MORAINES'],[19,24,'ROOST_KRUMMHOLZ']]}
 ];

 var API={
  version:1,
  sprayTrimAt:sprayTrimAt,
  talwegSeepAt:talwegSeepAt,
  aspectClimateAt:aspectClimateAt,
  biomineralAt:biomineralAt,
  rimstoneAt:rimstoneAt,
  aeroResonanceAt:aeroResonanceAt,
  thermogenicWellAt:thermogenicWellAt,
  hushAt:hushAt,
  ecotoneAt:ecotoneAt,
  CROPS:CROOK_CROPS,
  FAUNA:CROOK_FAUNA
 };
 root.CROOK_PHYS=API;
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
