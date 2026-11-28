// ================================================================= SW OUTER WALL — transect, hypoxia, ice-cover & periglacial physics ([G data])
// Pure engine-neutral physics & 4-station site catalog for the South-Western Outer Wall (Scale-Model 5.1 polygon
// rmwvsqhhqyk3f annealed with northern Region 177 rmwzq42zszc94, plus Trigemini Pass rmwvsmgi8xrro; PLAN.md sections 0-4).
// Zero THREE, zero DOM, zero Math.random, zero sin-hash, zero || numeric fallbacks; tested by tests/test-swow.js.
var SWOW_PHYS_BUNDLE=(function(){
 'use strict';

 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){
  var t=clamp((x-a)/(b-a),0,1);
  return t*t*(3-2*t);
 }

 // Barometric curve calibrated across the 0.75 g cold SW crater rim (PLAN.md sections 2-3):
 //   +3,040 m (boreallakes):  1.100 atm
 //   +4,360 m (morainetarn):  0.913 atm
 //   +5,680 m (trigemini):    0.756 atm (exertion hypoxia < 0.76 atm)
 //   +6,100 m (breathvale):   0.685 atm
 //   +6,465 m (headwall):     0.600 atm (KHAZ thin-air lethal ceiling start!)
 //   +6,550 m (sunblood top): 0.580 atm (limit of endolithic sunblood_crust)
 //   +8,746 m (crest p50):    0.115 atm (airless O rim)
 var HYPOXIA_EXERT_ATM=0.76;
 var HYPOXIA_LETHAL_ATM=0.60;
 var SUNBLOOD_MIN_ATM=0.58;

 function pressureAt(elevM){
  var z=Math.max(-500,nz(elevM,3040));
  var coldExcess=Math.max(0,z-5600)/1000;
  var u=z/7080+0.165*coldExcess*coldExcess;
  return +(1.690*Math.exp(-u)).toFixed(4);
 }

 function hypoxiaCeilingElevM(){
  // Binary search for exact elevation where pressureAt(z) === 0.600 atm (~6,465 m ASL)
  var lo=5600,hi=7500;
  for(var i=0;i<28;i++){
   var mid=0.5*(lo+hi);
   if(pressureAt(mid)>HYPOXIA_LETHAL_ATM)lo=mid;
   else hi=mid;
  }
  return +(0.5*(lo+hi)).toFixed(1);
 }

 var HYPOXIA_CEILING_M=hypoxiaCeilingElevM();

 // North-to-south annealed transect from Veiled Mountains spill (Y = 858..985) through Moraine Step (Y = 980..1085)
 // to Trigemini Pass & Southern Breath-Vales (Y = 1073..1427)
 function transectAt(py51,elevM){
  var py=nz(py51,904);
  var z=nz(elevM,3040);
  var pAtm=pressureAt(z);

  // Spillover mist from Veiled Mountains (Y <= 979) decays southward across Region 177 toward dry katabatic Belt C
  var veilSpill01=clamp(1-smooth(880,1095,py),0,1);
  var latSouth01=clamp((py-858)/(1427-858),0,1);

  var precipMmYr=Math.round(lerp(240,1080,veilSpill01)*(0.65+0.35*clamp(pAtm/1.1,0.2,1.1)));
  var lapseC=(z-3000)*0.0046+latSouth01*2.4;
  var twC=+(14.8-lapseC+1.4*veilSpill01).toFixed(2);
  var tcC=+(-8.2-lapseC*1.35+2.2*veilSpill01).toFixed(2);
  var meanC=+(0.5*(twC+tcC)).toFixed(2);

  var koppen='Dfc';
  if(pAtm<HYPOXIA_LETHAL_ATM){
   koppen='O';
  }else if(twC<-1.2){
   koppen=z>5400?'HF':'EF';
  }else if(twC<10.0){
   koppen=pAtm<0.78?'HT':'ET';
  }else if(twC>=15.2&&veilSpill01>0.75){
   koppen='Dfb';
  }

  var belt='A_boreal';
  if(pAtm<HYPOXIA_LETHAL_ATM)belt='O_airless';
  else if(z>=5250||py>=1075)belt='C_hypoxic';
  else if(z>=3800||py>=975)belt='B_moraine';

  return{
   py:py,
   elevM:z,
   pressureAtm:pAtm,
   veilSpill01:+veilSpill01.toFixed(3),
   precipMmYr:precipMmYr,
   twC:twC,
   tcC:tcC,
   meanC:meanC,
   koppen:koppen,
   belt:belt,
   hypoxic:pAtm<=HYPOXIA_EXERT_ATM,
   lethalHypoxia:pAtm<HYPOXIA_LETHAL_ATM
  };
 }

 // Glacial & cold-tarn surface ice cover share (0..1):
 //   - Belt A boreal lakes (+3,040 m): 0 in warm season, freezing only in winter
 //   - Belt B moraine tarns (+4,360 m): 0.08..0.16 shore-ice rime collar
 //   - Belt C Trigemini Tarn (+5,680 m): ~0.52..0.64 half-frozen year-round (shore shelves + katabatic open lead!)
 //   - Belt C Breath-Vale seeps (+6,100 m+): >= 0.90 frozen rime pan
 function iceShareAt(elevM,winter01,katabaticScour01){
  var z=nz(elevM,3040);
  var win=clamp(nz(winter01,0.18),0,1);
  var scour=clamp(nz(katabaticScour01,0.35),0,1);
  var coldBase=smooth(3950,6050,z);
  var seasonal=win*smooth(2600,3600,z)*0.82;
  var raw=clamp(coldBase*0.86+seasonal*(1-coldBase*0.65),0,1);
  // Strong katabatic wind down Trigemini U-troughs keeps a dark central open-water lead ice-free on +5,680 m tarns
  var leadOpen=(z>5100&&z<5950)?scour*0.28*(1-win*0.5):0;
  return +clamp(raw-leadOpen,0,1).toFixed(3);
 }

 // Periglacial KFROST sorted stone polygons, solifluction lobes, aufeis & glacial rock-flour suspension
 function frostAt(elevM,slopeGrad,wet01){
  var z=nz(elevM,4360);
  var sl=Math.max(0,nz(slopeGrad,0.06));
  var wet=clamp(nz(wet01,0.45),0,1);
  var permafrost01=smooth(3550,4250,z);
  var flatBench=1-smooth(0.08,0.26,sl);
  var midSlope=smooth(0.05,0.14,sl)*(1-smooth(0.28,0.48,sl));
  var sortedRings01=clamp(permafrost01*flatBench*(0.45+0.55*wet),0,1);
  var solifluction01=clamp(permafrost01*midSlope*(0.40+0.60*wet),0,1);
  var aufeis01=clamp(smooth(3850,4450,z)*(1-smooth(5950,6350,z))*flatBench*wet,0,1);
  var moraineFlour01=clamp(smooth(3650,4150,z)*(1-smooth(5250,5750,z)),0,1);
  return{
   permafrost01:+permafrost01.toFixed(3),
   sortedRings01:+sortedRings01.toFixed(3),
   solifluction01:+solifluction01.toFixed(3),
   aufeis01:+aufeis01.toFixed(3),
   moraineFlour01:+moraineFlour01.toFixed(3)
  };
 }

 // Endemic lungcushion (Bellows Cushion / Air-Dome, +4,200..+6,250 m, P >= 0.60 atm) internal microclimate:
 // Hollow sunlit dome traps +12 C warmer air and ~28% photosynthetic O2, raising effective partial pressure for Dalab couriers
 function lungcushionAt(elevM,sun01,wind01){
  var z=nz(elevM,5680);
  var sun=clamp(nz(sun01,0.85),0,1);
  var wind=clamp(nz(wind01,0.35),0,1);
  var pAtm=pressureAt(z);
  var inElevBand=z>=4150&&pAtm>=HYPOXIA_LETHAL_ATM;
  var solarGain=(0.32+0.68*sun)*(1-0.18*wind);
  var deltaTC=inElevBand?+(4.2+9.4*solarGain).toFixed(2):0;
  var internalO2Pct=inElevBand?+(21.0+8.2*sun*(0.75+0.25*(1-wind))).toFixed(2):20.9;
  var effectivePAtm=+(pAtm*(internalO2Pct/20.95)).toFixed(4);
  return{
   viable:inElevBand,
   ambientPAtm:pAtm,
   deltaTC:deltaTC,
   internalO2Pct:internalO2Pct,
   effectivePAtm:effectivePAtm,
   relievesHypoxia:inElevBand&&pAtm<HYPOXIA_EXERT_ATM&&effectivePAtm>=0.82
  };
 }

 // Endolithic sunblood_crust (Hyper-UV Hematite Lichen, Belt C +5,450..+6,550 m, down to 0.58 atm!)
 function sunbloodViableAt(elevM,rock01){
  var z=nz(elevM,6100);
  var rk=clamp(nz(rock01,0.8),0,1);
  var pAtm=pressureAt(z);
  var uvFlux=+(1.0+1.45*clamp((1.10-pAtm)/0.55,0,1.3)).toFixed(2);
  var viable=z>=5350&&pAtm>=SUNBLOOD_MIN_ATM&&rk>=0.25;
  return{
   viable:viable,
   pressureAtm:pAtm,
   uvFluxRel:uvFlux,
   hematiteShield01:viable?+clamp((0.82-pAtm)/0.24,0.25,1.0).toFixed(3):0
  };
 }

 // KHAZ.make-compatible placed hazard specs
 function hazardSpec(kindKey){
  if(kindKey==='quakingbog'){
   return{
    kind:'sink',
    effect:'hold',
    danger:0.52,
    dose:0.28,
    falloff:'smooth',
    move:{speed:0.35,sink:0.18,slip:0.25},
    tell:{colour:'#8f4e28',fx:'ripple',sound:null,sign:'buoyant rust-red quaking sphagnum raft over deep boreal peat water'}
   };
  }
  if(kindKey==='thinice'){
   return{
    kind:'drown',
    effect:'freeze',
    danger:0.78,
    dose:0.65,
    falloff:'smooth',
    trigger:{by:'weight',mass:55,reset:45},
    move:{speed:0.65,sink:0,slip:0.78},
    tell:{colour:'#9ad4ec',fx:'crack',sound:'ice-groan',sign:'fractured shore-ice lead over +1 C glacial tarn water'}
   };
  }
  if(kindKey==='rockfall'){
   return{
    kind:'crush',
    effect:'damage',
    danger:0.72,
    dose:0.55,
    falloff:'linear',
    cycle:{period:48,warn:4,ramp:2,on:5,after:3,afterK:0.2},
    tell:{colour:'#8c7868',fx:'dust',sound:'clatter',sign:'frost-wedged megabreccia chute shedding blocks at thaw'}
   };
  }
  // Hypoxia ceiling marker zone (< 0.60 atm headwall boundary)
  return{
   kind:'gas',
   effect:'suffocate',
   danger:0.96,
   dose:0.95,
   falloff:'smooth',
   tell:{colour:'#3a4e8c',fx:null,sound:'wind-whistle',sign:'< 0.60 atm lethal outer-wall hypoxia ceiling; turn back to breath-vale floor'}
  };
 }

 var SITES={
  boreallakes:{
   id:'boreallakes',
   name:'Paternoster Boreal Lakes & Veil-Spill Larch Fen',
   region:'SW Outer Wall — Annealed Region 177 North',
   px:[264,904],
   sky:[-8,574],
   baseElevM:3040,
   atm:1.10,
   koppen:'Dfc',
   belt:'A_boreal',
   seed:9301,
   wind:[0.55,0.42],
   snowBase:0.0,
   snowLine:[56,118],
   iceShare:0.0,
   strata:{recipe:'megabreccia',range:[-40,320]},
   reserves:[
    {id:'site:veil-portage-landing',name:'Veil-Foot Portage & Fur-Canoe Landing Reserve',x:-112,z:-64,r:34}
   ],
   tors:[
    {id:'bl-tor-0',x:-168,z:48,H:18,r:16,seed:9311},
    {id:'bl-tor-1',x:164,z:-88,H:22,r:19,seed:9312},
    {id:'bl-tor-2',x:12,z:-154,H:16,r:14,seed:9313}
   ]
  },
  morainetarn:{
   id:'morainetarn',
   name:'Turquoise Moraine Lake, Krummholz & Sorted Stone Rings',
   region:'SW Outer Wall — Mid-Northern Alpine Tarn Step',
   px:[276,1024],
   sky:[4,694],
   baseElevM:4360,
   atm:0.91,
   koppen:'ET',
   belt:'B_moraine',
   seed:9302,
   wind:[0.88,0.52],
   snowBase:0.14,
   snowLine:[24,88],
   iceShare:0.12,
   strata:{recipe:'megabreccia',range:[-40,380]},
   reserves:[
    {id:'site:fellgang-moraine-camp',name:'Seasonal Fellgang & Dalab Drover Moraine Camp Reserve',x:108,z:-58,r:36}
   ],
   tors:[
    {id:'mt-tor-0',x:-158,z:-96,H:28,r:22,seed:9321},
    {id:'mt-tor-1',x:152,z:82,H:24,r:19,seed:9322},
    {id:'mt-tor-2',x:-64,z:148,H:20,r:16,seed:9323}
   ]
  },
  trigemini:{
   id:'trigemini',
   name:'Trigemini Pass Junction & the +5,680 m Cold Tarn',
   region:'Trigemini Pass (rmwvsmgi8xrro) — Dalab High Backup Road',
   px:[279,1120],
   sky:[7,790],
   baseElevM:5680,
   atm:0.76,
   koppen:'ET',
   belt:'C_hypoxic',
   seed:9303,
   wind:[1.42,0.68],
   snowBase:0.32,
   snowLine:[6,62],
   iceShare:0.56,
   strata:{recipe:'megabreccia',range:[-40,480]},
   reserves:[
    {id:'site:dalab-trigemini-waypost',name:'Dalab Trigemini High-Pass Courier Waypost Reserve',x:94,z:-72,r:38}
   ],
   tors:[
    {id:'tg-tor-0',x:-148,z:-118,H:42,r:28,seed:9331},
    {id:'tg-tor-1',x:162,z:96,H:38,r:26,seed:9332},
    {id:'tg-tor-2',x:-128,z:132,H:34,r:24,seed:9333}
   ]
  },
  breathvale:{
   id:'breathvale',
   name:'Southern Hanging Breath-Vale at the 0.60 atm Threshold',
   region:'SW Outer Wall — Southern Rim Breath-Pocket',
   px:[410,1213],
   sky:[138,883],
   baseElevM:6100,
   atm:0.685,
   koppen:'HT',
   belt:'C_hypoxic',
   seed:9304,
   wind:[1.65,0.48],
   snowBase:0.28,
   snowLine:[14,78],
   iceShare:0.94,
   strata:{recipe:'megabreccia',range:[-40,560]},
   reserves:[
    {id:'site:dalab-oxygen-cache',name:'Dalab Emergency Breath-Cloth & Courier Shelter Reserve',x:68,z:58,r:30}
   ],
   tors:[
    {id:'bv-tor-0',x:-136,z:-92,H:48,r:30,seed:9341},
    {id:'bv-tor-1',x:144,z:-84,H:44,r:28,seed:9342},
    {id:'bv-tor-2',x:-112,z:118,H:32,r:22,seed:9343}
   ]
  }
 };

 var SWOW_PHYS={
  HYPOXIA_EXERT_ATM:HYPOXIA_EXERT_ATM,
  HYPOXIA_LETHAL_ATM:HYPOXIA_LETHAL_ATM,
  SUNBLOOD_MIN_ATM:SUNBLOOD_MIN_ATM,
  HYPOXIA_CEILING_M:HYPOXIA_CEILING_M,
  pressureAt:pressureAt,
  hypoxiaCeilingElevM:hypoxiaCeilingElevM,
  transectAt:transectAt,
  iceShareAt:iceShareAt,
  frostAt:frostAt,
  lungcushionAt:lungcushionAt,
  sunbloodViableAt:sunbloodViableAt,
  hazardSpec:hazardSpec
 };

 return{
  SWOW_PHYS:SWOW_PHYS,
  SWOW_SITES:SITES
 };
})();

var SWOW_PHYS=SWOW_PHYS_BUNDLE.SWOW_PHYS;
var SWOW_SITES=SWOW_PHYS_BUNDLE.SWOW_SITES;
if(typeof window!=='undefined'){
 window.SWOW_PHYS=SWOW_PHYS;
 window.SWOW_SITES=SWOW_SITES;
}
if(typeof module!=='undefined'&&module.exports){
 module.exports=SWOW_PHYS_BUNDLE;
}
