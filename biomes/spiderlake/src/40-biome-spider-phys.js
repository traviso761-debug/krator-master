// ================================================================= SPIDER LAKE — physics, silk rigging, trophic budget, crops & fauna ([G data])
// Pure engine-neutral functions of barometric aerodynamics (1.33 atm / 0.28 atm O2 at +1,460.0 m, 0.75 g), hydrothermal
// "lake-smoke" chironomid trophic flux, ATMOS wind-pinned silk catenaries (matching kits/spider-lake slSilkMath), 6-day
// zero-kill Hum & smudge rotational arachniculture, and sub-escarpment MVT brine crystallization (PLAN.md section 2).
// Zero THREE, zero DOM, zero Math.random; deterministic on core/rand (KRAND); tested by tests/test-spiderlake.js.
var SPIDER_PHYS=(function(root){
 'use strict';
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:v>b?b:v;}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

 var CONST={
  LAKE_DATUM_M:1460.0,
  RAMPART_CREST_M:2040.0,
  P0_ATM:1.60,
  SCALE_H_M:8000.0,
  O2_FRAC:0.210,
  G_KRATOR:7.4,
  G_EARTH:9.81,
  RHO_LAKE_KGM3:1.560,
  RHO_EARTH_WARM_KGM3:1.168,
  DRAGLINE_GPA:1.30,
  BREAKING_STRAIN:0.30,
  SILK_DENSITY_KGM3:1310.0,
  SW_OUTFLOW_M3S:380.0,
  EAST_INFLOW_M3S:640.0
 };

 // Pure geometry & rigging pin-weight math ([G data]): unified with kits/spider-lake/src/34-sl-trades.js (slSilkMath)
 var slSilkMath={
  cornerPin:function(u,v){
   var du0=u,du1=1-u,dv0=v,dv1=1-v;
   var dMin=Math.min(Math.hypot(du0,dv0),Math.hypot(du1,dv0),Math.hypot(du0,dv1),Math.hypot(du1,dv1));
   if(dMin<1e-5)return 0;
   var belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
   var edge=Math.sin(Math.PI*u)*0.32+Math.sin(Math.PI*v)*0.32;
   var ramp=Math.min(1,dMin/0.22);
   return ramp*ramp*(0.55*belly+0.45*Math.min(1,edge));
  },
  spanPin:function(u){
   if(u<=1e-5||u>=1-1e-5)return 0;
   var s=Math.sin(Math.PI*u);
   return s*Math.sqrt(s);
  },
  hangPin:function(v){
   if(v<=1e-5)return 0;
   var c=v<0?0:v>1?1:v;
   return c*Math.sqrt(c);
  },
  hyparY:function(u,v,yLow,yHigh,sag){
   var s=2*u-1,t=2*v-1;
   var mid=0.5*(yHigh+yLow),half=0.5*(yHigh-yLow);
   var droops=nz(sag,0.12)*(1-s*s)*(1-t*t);
   return mid+half*(s*t)-droops;
  }
 };
 if(!root.slSilkMath)root.slSilkMath=slSilkMath;

 // 1. Barometric hyperoxia & 0.75 g gossamer bridge-casting aerodynamics (PLAN.md section 2.1)
 function aerodynamicsAt(o){
  o=o||{};
  var elevM=nz(o.elevM,CONST.LAKE_DATUM_M);
  var windMs=Math.max(0,nz(o.windSpeedMs,4.8));
  var diaUm=clamp(nz(o.threadDiaUm,4.2),1.0,24.0);
  var spanM=clamp(nz(o.spanM,180.0),4.0,320.0);
  var anchorHighM=Math.max(4.0,nz(o.anchorHighM,26.0));
  var curtainDropM=clamp(nz(o.curtainDropM,12.5),1.5,anchorHighM-2.0);

  var pAtm=CONST.P0_ATM*Math.exp(-elevM/CONST.SCALE_H_M);
  var pO2Atm=pAtm*CONST.O2_FRAC;
  var pLake=CONST.P0_ATM*Math.exp(-CONST.LAKE_DATUM_M/CONST.SCALE_H_M);
  // Ideal-gas scaling with lapse rate (+21 C at +1,460 m, -5.5 K/km)
  var tKelvin=294.15-0.0055*(elevM-CONST.LAKE_DATUM_M);
  var rhoKgM3=CONST.RHO_LAKE_KGM3*(pAtm/pLake)*(294.15/clamp(tKelvin,235,315));
  var dragLiftRatio=(rhoKgM3/CONST.RHO_EARTH_WARM_KGM3)*(CONST.G_EARTH/CONST.G_KRATOR);

  // Gossamer lofting span: proportional to dragLiftRatio, wind lift, and hyperoxic gland endurance
  var o2Boost=smooth(0.16,0.28,pO2Atm);
  var windBoost=clamp(0.42+0.16*windMs,0.35,1.55);
  var diaFactor=clamp(4.2/diaUm,0.45,1.65);
  var maxCastSpanM=132.0*dragLiftRatio*windBoost*(0.52+0.48*o2Boost)*Math.sqrt(diaFactor);

  // Analytical 1.3 GPa major-ampullate dragline catenary sag under 0.75 g + wind load
  var workingStressPa=0.16*CONST.DRAGLINE_GPA*1e9;
  var weightPerVol=CONST.SILK_DENSITY_KGM3*CONST.G_KRATOR*(1.0+0.032*windMs*rhoKgM3);
  var rawSag=(weightPerVol*spanM*spanM)/(8.0*workingStressPa)*16.0+spanM*0.012;
  var catenarySagM=clamp(rawSag,0.18,anchorHighM*0.36);
  var boatClearanceM=anchorHighM-catenarySagM-curtainDropM;

  return{
   pAtm:+pAtm.toFixed(4),
   pO2Atm:+pO2Atm.toFixed(4),
   rhoKgM3:+rhoKgM3.toFixed(4),
   dragLiftRatio:+dragLiftRatio.toFixed(4),
   maxCastSpanM:+maxCastSpanM.toFixed(2),
   catenarySagM:+catenarySagM.toFixed(3),
   boatClearanceM:+boatClearanceM.toFixed(3),
   tensileGPa:CONST.DRAGLINE_GPA
  };
 }

 // 2. Hydrothermal "Lake-Smoke" midge trophic budget (PLAN.md section 2.2)
 function lakeSmokeAt(o){
  o=o||{};
  var shoreDistM=Math.max(0,nz(o.shoreDistM,40.0));
  var elevAboveLakeM=Math.max(-25.0,nz(o.elevAboveLakeM,4.0));
  var seep01=clamp(nz(o.seepProximity01,0.65),0,1);
  var hour24=((nz(o.hour24,18.5)%24)+24)%24;
  var onshore01=clamp(nz(o.windOnshore01,0.75),0,1);

  // Crepuscular emergence peaks: dawn (05:30-08:00, center 6.75) and dusk (17:30-20:30, center 19.0)
  var dDawn=Math.abs(hour24-6.75),dDusk=Math.abs(hour24-19.0);
  var crepPeak=Math.max(Math.exp(-(dDawn*dDawn)/2.2),Math.exp(-(dDusk*dDusk)/2.8));
  var dielFactor=0.46+0.54*crepPeak;

  // Benthic emergence (15-40 g/m2/day over warm < 25 m lakebed) advected inland up to ~1,800 m and < +240 m above lake
  var baseFlux=lerp(16.5,39.5,seep01);
  var reachM=lerp(950.0,1950.0,onshore01);
  var distDecay=smooth(reachM,0.0,shoreDistM);
  var altDecay=smooth(340.0,35.0,Math.max(0,elevAboveLakeM));
  var midgeFluxGm2Day=baseFlux*distDecay*altDecay*(0.72+0.28*dielFactor);

  var pillarHeightM=midgeFluxGm2Day>=4.0?lerp(85.0,315.0,clamp(seep01*0.55+crepPeak*0.45,0,1))*altDecay:0.0;
  var eusocialOk=midgeFluxGm2Day>=12.0&&elevAboveLakeM<=260.0;
  var colonyPopCap=eusocialOk?Math.round(lerp(20000,250000,clamp((midgeFluxGm2Day-12.0)/26.0,0,1))):0;
  var webSheetDensity01=eusocialOk?clamp(smooth(10.0,32.0,midgeFluxGm2Day)*(0.65+0.35*onshore01),0,1):clamp(smooth(1.0,10.0,midgeFluxGm2Day)*0.18,0,0.18);

  return{
   midgeFluxGm2Day:+midgeFluxGm2Day.toFixed(3),
   pillarHeightM:+pillarHeightM.toFixed(1),
   dielPeak01:+crepPeak.toFixed(4),
   eusocialOk:eusocialOk,
   colonyPopCap:colonyPopCap,
   webSheetDensity01:+webSheetDensity01.toFixed(4)
  };
 }

 // 3. Vertex pin-weight contract for ATMOS wind-billowing silk (PLAN.md section 2.3)
 // Strictly 0.0 at every rock, tree-limb, or cedar-weir crossbar anchor so zero cable endpoints ever detach.
 function silkPinWeight(kind,u,v){
  u=clamp(nz(u,0),0,1);
  v=clamp(nz(v,0),0,1);
  if(kind==='bridgecurtain'){
   if(u<=1e-5||u>=1-1e-5)return 0;
   return +(slSilkMath.spanPin(u)*(0.42+0.58*Math.sin(Math.PI*v))).toFixed(6);
  }
  if(kind==='weirsheet'||kind==='weirframe_wild'){
   if(u<=1e-5||u>=1-1e-5||v<=1e-5||v>=1-1e-5)return 0;
   return +(slSilkMath.cornerPin(u,v)*slSilkMath.spanPin(u)*slSilkMath.spanPin(v)*1.35).toFixed(6);
  }
  if(kind==='funnelsheet'){
   return +slSilkMath.cornerPin(u,v).toFixed(6);
  }
  if(kind==='gossamer'){
   return +slSilkMath.hangPin(v).toFixed(6);
  }
  return +slSilkMath.cornerPin(u,v).toFixed(6);
 }

 // Pure-JS twin of ATMOS.GLSL_WIND silk vertex displacement (matches kits/spider-lake/src/90z-sl-atmos.js)
 var DEFAULT_WIND_PRESET={
  frontSpeed:16.0,
  gust:[[0.45,0.41,0.0],[0.30,1.07,1.7],[0.25,2.31,3.1]]
 };
 function displaceSilk(wx,wy,wz,fx,fy,fz,t,windX,windZ,gustAmp,windPreset){
  var pin=Math.hypot(fx,fy,fz);
  if(pin<=1e-5)return[0,0,0];
  var PW=windPreset||DEFAULT_WIND_PRESET;
  var wLen=Math.hypot(windX,windZ);
  var safeLen=wLen>1e-3?wLen:1e-3;
  var s=t-(wx*windX+wz*windZ)/safeLen/PW.frontSpeed;
  var g=0;
  for(var i=0;i<PW.gust.length;i++){
   var q=PW.gust[i];
   g+=q[0]*Math.sin(s*q[1]+q[2]);
  }
  var f=1+nz(gustAmp,0.35)*g;
  var fwx=windX*f,fwz=windZ*f,wMag=Math.hypot(fwx,fwz);
  var wdx=wMag>1e-4?fwx/wMag:1.0,wdz=wMag>1e-4?fwz/wMag:0.0;
  var ph1=(wx*wdx+wz*wdz)*2.4-t*(2.7+0.6*wMag)+wy*1.7;
  var ph2=(wx*1.1+wy*1.9+wz*1.3)*2.1-t*(4.3+0.45*wMag);
  var wave=0.65*Math.sin(ph1)+0.35*Math.sin(ph2);
  var scale=(0.35+0.45*wMag)*wave;
  var r2=pin*0.18*Math.sin(ph1);
  return[
   +(fwx*0.28*pin+fx*scale+wdx*r2).toFixed(6),
   +(0.06*wMag*(0.5+0.5*Math.sin(ph1))*pin+fy*scale+0.12*r2).toFixed(6),
   +(fwz*0.28*pin+fz*scale+wdz*r2).toFixed(6)
  ];
 }

 // 4. Zero-Kill Hum & Smudge 6-day rotational arachniculture cycle (PLAN.md section 2.4 & CROOK-RIA-DECISIONS.md section 2.5.5)
 function harvestCycleAt(o){
  o=o||{};
  var dayMod6=((Math.floor(nz(o.dayMod6,5))%6)+6)%6;
  var smudge01=clamp(nz(o.smudgeActive01,0),0,1);
  var humHz=nz(o.humFreqHz,132.0);
  var strikingBrood=!!o.strikingBrood;

  var sheetThicknessMm=+(0.18+0.26*(dayMod6+1)).toFixed(3);
  var humInBand=humHz>=110.0&&humHz<=165.0;
  var calmSignal01=clamp((humInBand?0.52:0.0)+0.48*smudge01,0,1);
  var workersRetreated=!strikingBrood&&calmSignal01>=0.80;
  var reelReady=workersRetreated&&dayMod6>=4;
  var broodUnharmed=!strikingBrood;

  return{
   dayMod6:dayMod6,
   sheetThicknessMm:sheetThicknessMm,
   calmSignal01:+calmSignal01.toFixed(3),
   workersRetreated:workersRetreated,
   reelReady:reelReady,
   broodUnharmed:broodUnharmed,
   killYield:0,
   tabooViolated:strikingBrood
  };
 }

 // 5. Sub-escarpment hydrothermal carbonate-brine & sericin degumming chemistry (Stations 4 & 5; tube_ozarks_15)
 function mvtBrineAt(o){
  o=o||{};
  var ventDistM=Math.max(0,nz(o.ventDistM,8.0));
  var depthBelowRimM=Math.max(0,nz(o.depthBelowRimM,24.0));
  var zincByte=clamp(nz(o.zincByte,190),0,255);
  var limestoneByte=clamp(nz(o.limestoneByte,255),0,255);

  var tempC=lerp(19.5,44.5,smooth(42.0,0.0,ventDistM));
  var pH=lerp(7.6,8.65,smooth(38.0,2.0,ventDistM)*(limestoneByte/255.0));
  var degumSafeOk=tempC>=34.0&&tempC<=42.5&&pH>=8.1;
  var scaldCore=tempC>=43.0;
  var celestineSat01=clamp(smooth(8.0,32.0,depthBelowRimM)*(limestoneByte/255.0)*(0.55+0.45*(zincByte/190.0)),0,1);

  return{
   tempC:+tempC.toFixed(2),
   pH:+pH.toFixed(2),
   degumSafeOk:degumSafeOk,
   scaldCore:scaldCore,
   celestineSat01:+celestineSat01.toFixed(4)
  };
 }

 // 6. Three export silk grades (PLAN.md section 5.2)
 var SILK_GRADES=[
  {id:'spider-silk-cable',name:'Golden Cable',source:'bridgecurtain',tensileGPa:1.3,strainMax:0.30,kitUses:['slMastObelisk','slHyparCanopy','riaPalaceBarges']},
  {id:'spider-silk-fleece',name:'Cloud-Fleece',source:'broodpavilion',hydrophobic:true,thermalR:4.2,kitUses:['slPalacePavilion','expeditionParkas','surgicalDressings']},
  {id:'spider-silk',name:'Lake-Sheen Gossamer',source:'weirframe_wild',iridescent:true,degumTempC:38.5,kitUses:['slShamiyana','slWindVeils','slDyehouseCanal']}
 ];

 // 7. kits/crops registration (PLAN.md section 5.3)
 var CROPS_SPEC={
  atm:2,
  zones:{
   littoral:{warmth:[3,3],arid:[3,4],wet:true},
   terrace:{warmth:[2,3],arid:[3,3]},
   fen:{warmth:[3,3],arid:[3,4],wet:true,heated:true},
   rampart:{warmth:[1,2],arid:[2,3],atm:1}
  },
  palette:['mulberry','tea','rice','wild-rice','lotus-root','helix-bean','persimmon','saffron','whorl-olive','flax','cave-madder','indigo','alecap','glow-mushroom']
 };
 if(root.CROPS&&root.CROPS.BIOMES){
  root.CROPS.BIOMES.spiderlake={atm:CROPS_SPEC.atm,zones:CROPS_SPEC.zones};
 }

 // 8. kits/fauna [G data] records (PLAN.md section 6.1)
 var FAUNA=[
  {key:'arachneapolita',name:'Arachneapolita sericifera',castes:['Matriarch','Rigger','Packer'],scale:[0.04,0.09],colonyPop:[20000,250000],liveYield:['spider-silk','spider-silk-cable','spider-silk-fleece'],killYield:[],aggression:0.05,schedule:[[0,6,'SPIN_REPAIR'],[6,17,'SHADE_DOME'],[17,24,'SWARM_LAKE_SMOKE']]},
  {key:'lakesmokemidge',name:'Plume Chironomid and Giant Lake-Mayfly',scale:[0.02,0.06],pillarHeightM:300,fluxGm2Day:[15,40],yields:['fish-bait'],schedule:[[5,8,'DAWN_EMERGE'],[8,17,'BENTHIC_NYMPH'],[17,21,'DUSK_PILLAR']]},
  {key:'gossamerfinch',name:'Velvet-Footed Silk-Gleaner',scale:[0.18,0.18],protectedByLaw:true,aggression:0,schedule:[[6,18,'GLEAN_CURTAIN'],[18,24,'ROOST_WILLOW'],[0,6,'ROOST_WILLOW']]},
  {key:'ventbarbel',name:'Warm-Seep Diatom Carp',scale:[0.45,0.45],yields:['fish','fish-glue'],schedule:[[5,19,'SCHOOL_SEEP'],[19,24,'REST_WEED'],[0,5,'REST_WEED']]},
  {key:'dewgecko',name:'Porphyry Nectar-Skink',scale:[0.24,0.24],yields:['small-hide'],humTapHz:3.0,schedule:[[7,18,'LICK_NECTAR'],[18,24,'HIDE_TERRACE'],[0,7,'HIDE_TERRACE']]}
 ];

 // 9. Data-driven hazards (core/hazard, PLAN.md section 6.3)
 var HAZARDS=[
  {id:'spiderlake:snarecurtain',kind:'mire',slowFrac:0.65,lethal:false,stations:['spillway','narrows','pavilion']},
  {id:'spiderlake:broodguard',kind:'swarm',triggerDistM:2.5,lethal:false,stations:['pavilion']},
  {id:'spiderlake:thermalbath',kind:'heat',triggerTempC:43.0,stations:['fen']},
  {id:'spiderlake:spillway',kind:'current',dischargeM3s:380.0,stations:['spillway']}
 ];

 return{
  CONST:CONST,
  slSilkMath:slSilkMath,
  aerodynamicsAt:aerodynamicsAt,
  lakeSmokeAt:lakeSmokeAt,
  silkPinWeight:silkPinWeight,
  displaceSilk:displaceSilk,
  harvestCycleAt:harvestCycleAt,
  mvtBrineAt:mvtBrineAt,
  SILK_GRADES:SILK_GRADES,
  CROPS:CROPS_SPEC,
  FAUNA:FAUNA,
  HAZARDS:HAZARDS
 };
})(typeof globalThis!=='undefined'?globalThis:this);
if(typeof module!=='undefined'&&module.exports)module.exports=SPIDER_PHYS;
