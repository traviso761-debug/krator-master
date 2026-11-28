// ================================================================= MATRONSCOAST — giant-snail browse-line, mucus-highway, coquina & border physics ([G data])
// Pure engine-neutral functions for Matron's Coast / The Snail Coast (Scale Model 5.1 polygon rmwvqchv37nh0, Yonni-Zag:
// Kande-Sakhil, 62,964 km2 dry land + 6,032 km2 drowned 16-island skerry channels, 3,357-4,000 mm/yr warm ocean rain).
// Models:
//   1. 0.75 g + 1.43-1.60 atm (0.30-0.33 atm O2) pulmonate gigantism ceiling (0.70-1.12 m spiral shells, 18-35 kg)
//   2. Order-free KRAND chirality: 98% dextral (+1) vs 2% sacred Lone-Born sinistral (-1) "Queen-Shells"
//   3. The 2.20 m radula browse-skirt height (browseLineAt) & silica-thorn / alkaloid anti-radula refugia
//   4. Multi-generational opalescent Mucus Silver-Highways (U-grooved trails, thin-film iridescence, slip risk)
//   5. Biogenic Coquina Conch-Midden carbonate thickness & Yonni hydraulic sealime yield + harpoon-snail ambush crevices
//   6. Southern Farside landkelp grazing suppression front vs Eternian goat/kiln frontier
//   7. North-Eastern Shroudhills Shroud-Ant (Khroma-Mira) saponin-mucus exclusion barrier below +1,400 m
// Zero THREE, zero DOM, zero Math.random, zero .opt || <nonzero>.
var SNAIL_PHYS=(function(root){
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
  POLYGON_ID:'rmwvqchv37nh0',
  ENDONYM:'Kande-Sakhil',
  SAILOR_NAME:'Snail Coast',
  AREA_DRY_KM2:62964.0,
  AREA_WATER_KM2:6032.0,
  SKERRY_ISLANDS:16,
  P0_ATM:1.60,
  O2_FRAC:0.2095,
  SCALE_H_M:8000.0,
  G_KRATOR:7.4,
  G_EARTH:9.81,
  BROWSE_SKIRT_M:2.20,
  SINISTRAL_RATE:0.02,
  ANT_CEILING_M:1400.0
 };

 function pressureAtElev(elevM){
  var e=nz(elevM,60.0);
  return +(CONST.P0_ATM*Math.exp(-Math.max(0,e)/CONST.SCALE_H_M)).toFixed(4);
 }

 /* 1. Pulmonate lung & shell-weight ceiling at 0.75 g and dense O2-rich hyper-humid air */
 function pulmonateCeilingAt(elevM,humidity01){
  var e=nz(elevM,80.0);
  var hum=clamp(nz(humidity01,0.97),0.0,1.0);
  var pAtm=pressureAtElev(e);
  var pO2=pAtm*CONST.O2_FRAC;
  var gRelief=CONST.G_EARTH/CONST.G_KRATOR;
  var o2Boost=pO2/(1.0*CONST.O2_FRAC);
  var desiccationGate=smooth(0.56,0.92,hum);
  var coldGate=1.0-0.46*smooth(1550.0,2650.0,e);
  var maxShellM=clamp(0.24*gRelief*o2Boost*2.32*desiccationGate*coldGate,0.06,1.18);
  var maxMassKg=+(29.5*Math.pow(maxShellM/1.0,2.85)).toFixed(2);
  return{
   pAtm:+pAtm.toFixed(4),
   pO2:+pO2.toFixed(4),
   gRatio:+(CONST.G_KRATOR/CONST.G_EARTH).toFixed(4),
   maxShellM:+maxShellM.toFixed(3),
   maxMassKg:maxMassKg,
   megafaunaViable:maxShellM>=0.55&&hum>=0.78
  };
 }

 /* 2. Spiral shell chirality: 98% right-handed dextral (+1), 2% sacred Lone-Born sinistral (-1) Queen-Shells */
 function chiralityOf(seed,salt){
  var K=root.KRAND;
  var s0=(nz(seed,1)>>>0);
  var st=(nz(salt,0x51a1)>>>0);
  var h=K?K.hash(s0,st,0x9e37,0x2710):(((s0*1664525+st*1013904223)>>>0));
  var bucket=(h>>>0)%1000;
  var sinistral=bucket<20;
  return{
   sinistral:sinistral,
   handed:sinistral?'sinistral':'dextral',
   spiralSign:sinistral?-1:1,
   queenShell:sinistral,
   bucketPermil:bucket
  };
 }

 /* Helper: shortest distance from (px, pz) to polyline [[x, z], ...] */
 function distToPolyline(px,pz,pts){
  if(!pts||pts.length<2)return{d:1e9,t:0};
  var best=1e9,bestSeg=0;
  for(var i=0;i<pts.length-1;i++){
   var ax=pts[i][0],az=pts[i][1],bx=pts[i+1][0],bz=pts[i+1][1];
   var vx=bx-ax,vz=bz-az,l2=vx*vx+vz*vz;
   var u=l2>1e-6?clamp(((px-ax)*vx+(pz-az)*vz)/l2,0,1):0;
   var d=Math.hypot(ax+vx*u-px,az+vz*u-pz);
   if(d<best){best=d;bestSeg=(i+u)/(pts.length-1);}
  }
  return{d:best,t:bestSeg};
 }

 /* 3. Multi-generational Mucus Silver-Highways: U-grooves, dried silver-violet mucin sheen & slip risk */
 function mucusHighwayAt(x,z,site,slope01){
  var S=site||{};
  var px=nz(x,0),pz=nz(z,0);
  var K=root.KRAND;
  var wob=K?(K.fbm(px*0.035,0.5,pz*0.035,2,9101)-0.5)*1.35:0.0;
  var ways=S.highways||[];
  var bestTrail=0.0,bestGroove=0.0,minD=1e9;
  for(var i=0;i<ways.length;i++){
   var W=ways[i];
   var hw=nz(W.halfW,2.6);
   var dp=distToPolyline(px,pz,W.pts);
   var dEff=Math.max(0,dp.d+wob*0.42);
   if(dEff<minD)minD=dEff;
   var core=1.0-smooth(hw*0.35,hw*1.65,dEff);
   if(core>bestTrail)bestTrail=core;
   var grv=nz(W.grooveM,0.28)*(1.0-smooth(0.0,hw*1.15,dEff));
   if(grv>bestGroove)bestGroove=grv;
  }
  var ambientGlaze=clamp(nz(S.ambientMucus01,0.38)*(1.0-0.35*smooth(1600,2400,nz(S.baseElevM,60))),0,1);
  var mucusCoat01=clamp(Math.max(ambientGlaze,bestTrail),0,1);
  var slp=clamp(nz(slope01,0.12),0,1.5);
  var wetness01=clamp(0.62+0.36*bestTrail,0,1);
  var iridescence01=clamp(bestTrail*(0.68+0.32*(K?K.fbm(px*0.09,0.5,pz*0.09,2,9102):0.5)),0,1);
  var slipRisk01=clamp(bestTrail*smooth(0.14,0.38,slp)*wetness01,0,1);
  return{
   trail01:+bestTrail.toFixed(4),
   mucusCoat01:+mucusCoat01.toFixed(4),
   grooveDepthM:+bestGroove.toFixed(3),
   wetness01:+wetness01.toFixed(4),
   iridescence01:+iridescence01.toFixed(4),
   slipRisk01:+slipRisk01.toFixed(4),
   distM:minD>1e8?999.0:+minD.toFixed(2)
  };
 }

 /* 4. Biogenic Coquina Conch-Middens: fused spiral shell carbonate banks, Yonni sealime & harpoon-snail crevices */
 function coquinaMiddenAt(x,z,site){
  var S=site||{};
  var px=nz(x,0),pz=nz(z,0);
  var K=root.KRAND;
  var wob=K?(K.fbm(px*0.025,0.5,pz*0.025,2,9111)-0.5)*0.16:0.0;
  var mids=S.middens||[];
  var thickM=0.0,midden01=0.0,hollow01=0.0;
  for(var i=0;i<mids.length;i++){
   var M=mids[i];
   var ca=Math.cos(nz(M.yaw,0.2)),sa=Math.sin(nz(M.yaw,0.2));
   var dx=px-nz(M.x,0),dz=pz-nz(M.z,0);
   var lx=(dx*ca+dz*sa)/Math.max(4,nz(M.rx,22));
   var lz=(-dx*sa+dz*ca)/Math.max(4,nz(M.rz,16));
   var rEll=Math.sqrt(lx*lx+lz*lz)+wob;
   if(rEll<1.35){
    var w=1.0-smooth(0.42,1.25,rEll);
    var th=nz(M.h,4.2)*Math.pow(w,1.15);
    if(th>thickM)thickM=th;
    if(w>midden01)midden01=w;
    if(M.harpoonHollow){
     var hw=1.0-smooth(0.25,0.95,rEll);
     if(hw>hollow01)hollow01=hw;
    }
   }
  }
  var rainFactor=smooth(1800.0,3800.0,nz(S.rainMm,4000.0));
  var cemented01=clamp(midden01*(0.55+0.45*rainFactor),0,1);
  var ph=lerp(5.8,8.35,clamp(midden01*0.92+nz(S.coastLime01,0.25)*0.35,0,1));
  var sealimeKgM2=+(thickM*420.0*cemented01).toFixed(1);
  var harpoonRisk01=clamp(hollow01*cemented01,0,1);
  return{
   midden01:+midden01.toFixed(4),
   thicknessM:+thickM.toFixed(3),
   cemented01:+cemented01.toFixed(4),
   soilPh:+ph.toFixed(2),
   sealimeKgM2:sealimeKgM2,
   harpoonRisk01:+harpoonRisk01.toFixed(4)
  };
 }

 /* 5. The 2.20 m Radula Browse-Skirt Line & Anti-Radula Defence Refugia */
 function browseLineAt(x,z,site,opts){
  var S=site||{};
  var o=opts||{};
  var elevM=nz(o.elevM,nz(S.baseElevM,120.0));
  var silicaCollar01=clamp(nz(o.silicaCollar01,0.0),0,1);
  var alkaloid01=clamp(nz(o.alkaloid01,0.0),0,1);
  var surfSpray01=clamp(nz(o.surfSpray01,0.0),0,1);
  var mh=mucusHighwayAt(x,z,S,0.1);

  var baseSkirt=CONST.BROWSE_SKIRT_M;
  var elevTaper=1.0-0.62*smooth(1450.0,2350.0,elevM);
  var herdBoost=0.88+0.16*mh.mucusCoat01;
  var sprayTrim=1.0-0.38*smooth(0.55,0.95,surfSpray01);
  var defenseShield=1.0-0.95*Math.max(silicaCollar01,alkaloid01*0.88);
  var skirtM=clamp(baseSkirt*elevTaper*herdBoost*sprayTrim*defenseShield,0.0,2.45);
  /* Mature rainforest trees keep their browse-pruned cathedral skirt at 2.20 m below +1,400 m */
  var treeSkirtM=clamp(CONST.BROWSE_SKIRT_M*elevTaper*(1.0-0.25*smooth(0.65,0.98,surfSpray01)),0.75,2.35);
  var cathedral01=clamp(smooth(1.35,2.05,treeSkirtM)*(1.0-silicaCollar01*0.5),0,1);
  return{
   skirtM:+skirtM.toFixed(3),
   treeSkirtM:+treeSkirtM.toFixed(3),
   cathedralOpenness01:+cathedral01.toFixed(4),
   protectedUnderstorey:defenseShield<0.35
  };
 }

 /* 6. Southern Border (px 298, 476): Giant Snail Radulae Rasping Back Farside's Alien Landkelp Invasion */
 function kelpFrontBalanceAt(x,z,site,opts){
  var S=site||{};
  var o=opts||{};
  var px=nz(x,0),pz=nz(z,0);
  /* South is +z toward Farside; north is -z into Snail Coast heartland */
  var southT=clamp((pz+220.0)/440.0,0,1);
  var spray01=clamp(nz(o.spray01,S.id==='kelpfront'?smooth(140.0,-160.0,px):0.25),0,1);
  var snailDensity01=clamp(nz(o.snailDensity01,S.id==='kelpfront'?lerp(0.96,0.58,southT):0.92),0,1);
  var goatKiln01=clamp(nz(o.goatKiln01,S.id==='kelpfront'?smooth(0.72,1.0,southT)*0.45:0.0),0,1);

  var kelpArrival01=clamp(spray01*(0.45+0.55*southT),0,1);
  var radulaRasp01=clamp(snailDensity01*(1.0-0.65*goatKiln01),0,1);
  /* Ungrazed Farside landkelp reaches 28 m; Snail Coast radula herds rasp it down to 0.35-1.05 m holdfast stubs! */
  var unraspedH=lerp(18.0,32.0,kelpArrival01);
  var survivingStipeM=kelpArrival01<0.08?0.0:lerp(unraspedH,0.52,smooth(0.25,0.78,radulaRasp01));
  return{
   kelpArrival01:+kelpArrival01.toFixed(4),
   radulaRasp01:+radulaRasp01.toFixed(4),
   goatKilnSouth01:+goatKiln01.toFixed(4),
   survivingStipeM:+survivingStipeM.toFixed(2),
   kelpSuppressed:radulaRasp01>=0.60&&survivingStipeM<=1.35
  };
 }

 /* 7. North-Eastern Border: Saponin-Bitter Pedal Mucus Excluding Shroudhills Cat-Sized Shroud-Ants */
 function antExclusionAt(elevM,mucusCoat01,rainMm){
  var e=nz(elevM,220.0);
  var muc=clamp(nz(mucusCoat01,0.55),0,1);
  var rain=nz(rainMm,4000.0);
  /* Above +2,100 m cold montane temperatures exclude Shroud-Ants anyway; below +1,400 m snail mucus glazes trunks */
  var thermalSuit01=(1.0-smooth(1550.0,2150.0,e))*smooth(1100.0,1800.0,rain);
  var spiracleBlock01=clamp(smooth(0.18,0.42,muc)*(1.0-0.35*smooth(1250.0,1650.0,e)),0,1);
  var antSurvival01=clamp(thermalSuit01*(1.0-spiracleBlock01),0,1);
  return{
   thermalSuit01:+thermalSuit01.toFixed(4),
   spiracleBlock01:+spiracleBlock01.toFixed(4),
   antSurvival01:+antSurvival01.toFixed(4),
   drumGallAllowed:antSurvival01>=0.25,
   smudgeFreeSafe:antSurvival01<0.08
  };
 }

 /* 8. Canonical KHAZ hazard specifications for Matron's Coast */
 function hazardSpec(kind){
  if(kind==='harpoon'||kind==='snail:harpoon'){
   return{
    kind:'poison',
    effect:'poison',
    danger:0.68,
    dose:0.42,
    falloff:'smooth',
    trigger:{by:'near',reset:18},
    tell:{colour:'#d84878',sign:'Hollow coquina crevice hunted by Terraconus harpoon cone-snails'}
   };
  }
  if(kind==='surf'||kind==='snail:surf'){
   return{
    kind:'drown',
    effect:'drown',
    danger:0.55,
    dose:0.35,
    falloff:'linear',
    tell:{colour:'#5ab4be',sign:'Wave-swept outer skerry Megachiton surf ledge'}
   };
  }
  if(kind==='radulathorn'){
   return{
    kind:'thorn',
    effect:'bleed',
    danger:0.36,
    dose:0.25,
    falloff:'smooth',
    tell:{colour:'#dceef4',sign:'Razor-hard biogenic opal spine-collar of Glass-Collar Palm'}
   };
  }
  return{
   kind:'slip',
   effect:null,
   danger:0.40,
   dose:0.22,
   falloff:'smooth',
   move:{speed:0.55,sink:0,slip:0.86},
   tell:{colour:'#d8d0ee',sign:'Steep opalescent viscoelastic snail mucus highway'}
  };
 }

 return{
  CONST:CONST,
  pressureAtElev:pressureAtElev,
  pulmonateCeilingAt:pulmonateCeilingAt,
  chiralityOf:chiralityOf,
  mucusHighwayAt:mucusHighwayAt,
  coquinaMiddenAt:coquinaMiddenAt,
  browseLineAt:browseLineAt,
  kelpFrontBalanceAt:kelpFrontBalanceAt,
  antExclusionAt:antExclusionAt,
  hazardSpec:hazardSpec
 };
})(typeof window!=='undefined'?window:globalThis);

// ---------------------------------------------------------------- 4 Surveyed Matron's Coast Stations ([G data])
var SNAIL_SITES=(function(){
 'use strict';
 return{
  skerry:{
   id:'skerry',
   seed:9201,
   name:'Drowned Skerry Sound, Coquina Conch-Middens and Skerry Megachitons',
   region:'Matrons Coast / Kande-Sakhil (312, 392)',
   px:[312,392],
   sky:[312-272,392-330],
   baseElevM:14.0,
   atm:1.59,
   rainMm:4000,
   koppen:'Af',
   wind:[0.74,0.42],
   hasSea:true,
   seaLevel:0.0,
   exposedSea:true,
   ambientMucus01:0.52,
   coastLime01:0.78,
   strata:{
    range:[-45,140],
    formations:[
     {recipe:'shroudhills-granite',base:-45,top:6},
     {recipe:'ria-carbonate-bluff',base:6,top:140,tint:[1.04,1.01,0.96]}
    ]
   },
   highways:[
    {halfW:2.8,grooveM:0.26,pts:[[-138,-36],[-98,-24],[-58,-16],[-26,-10]]},
    {halfW:2.5,grooveM:0.22,pts:[[66,-44],[96,-18],[128,14],[156,46]]}
   ],
   middens:[
    {id:'midden-west-conch',x:-72,z:-22,rx:28,rz:19,h:4.6,yaw:0.28,harpoonHollow:true},
    {id:'midden-east-bank',x:88,z:-12,rx:25,rz:17,h:4.1,yaw:-0.34,harpoonHollow:true},
    {id:'midden-kiln-spit',x:-108,z:54,rx:20,rz:15,h:3.4,yaw:0.52,harpoonHollow:false}
   ],
   skerries:[
    {id:'skerry-outer-jaw',x:-196,z:-98,rx:24,rz:14,h:19.0,yaw:0.35},
    {id:'skerry-sound-stack',x:14,z:-118,rx:16,rz:11,h:15.5,yaw:-0.22}
   ],
   reserves:[
    {id:'site:yonni-sealime-kiln',name:'Yonni Spear-Queen Sealime Kiln Plinth Reserve',x:-118,z:78,r:24,h:14,targetY:11.5}
   ],
   camPads:[
    [142,-132,18],[-24,-68,16],[-112,-14,16],[48,-52,16],[-74,48,16],[-148,88,16]
   ]
  },

  browsewood:{
   id:'browsewood',
   seed:9202,
   name:'The 2.2 m Browse-Line Snail Cathedral and Opalescent Mucus Silver-Highways',
   region:'Mainland Yonni Rainforest (356, 424)',
   px:[356,424],
   sky:[356-272,424-330],
   baseElevM:210.0,
   atm:1.56,
   rainMm:3920,
   koppen:'Af',
   wind:[0.52,0.30],
   hasSea:false,
   seaLevel:-1e9,
   exposedSea:false,
   ambientMucus01:0.78,
   coastLime01:0.48,
   strata:{
    range:[-20,160],
    formations:[
     {recipe:'shroudhills-ironcoal',base:-20,top:18},
     {recipe:'ria-carbonate-bluff',base:18,top:160,tint:[1.02,0.99,0.93]}
    ]
   },
   highways:[
    {halfW:3.4,grooveM:0.34,pts:[[-195,-92],[-120,-54],[-48,-18],[0,0],[56,22],[128,58],[196,94]]},
    {halfW:3.0,grooveM:0.30,pts:[[-96,142],[-46,74],[-8,18],[0,0],[34,-46],[84,-118]]},
    {halfW:2.4,grooveM:0.24,pts:[[-142,28],[-68,14],[0,0],[74,-8],[146,-22]]}
   ],
   middens:[
    {id:'midden-cathedral-hollow',x:28,z:34,rx:26,rz:18,h:4.4,yaw:0.42,harpoonHollow:true},
    {id:'midden-pearl-grove',x:-64,z:-38,rx:21,rz:15,h:3.6,yaw:-0.25,harpoonHollow:false}
   ],
   skerries:[],
   reserves:[
    {id:'site:yonni-spear-plinth',name:'Yonni Twin-Queen Trail Plinth Reserve',x:116,z:-78,r:24,h:14,targetY:9.8}
   ],
   camPads:[
    [-118,-108,18],[-38,-26,15],[22,-32,15],[-56,34,15],[64,18,15],[86,-54,16]
   ]
  },

  kelpfront:{
   id:'kelpfront',
   seed:9203,
   name:'The Southern Kelp-Grazing Front Toward Farside',
   region:'Southern Matrons Coast Frontier (298, 476)',
   px:[298,476],
   sky:[298-272,476-330],
   baseElevM:32.0,
   atm:1.58,
   rainMm:3850,
   koppen:'Af',
   wind:[0.82,0.48],
   hasSea:true,
   seaLevel:0.0,
   exposedSea:true,
   ambientMucus01:0.64,
   coastLime01:0.66,
   strata:{
    range:[-45,140],
    formations:[
     {recipe:'shroudhills-granite',base:-45,top:10},
     {recipe:'ria-carbonate-bluff',base:10,top:140,tint:[1.01,0.98,0.92]}
    ]
   },
   highways:[
    {halfW:3.1,grooveM:0.28,pts:[[12,135],[18,68],[14,0],[22,-68],[34,-138]]},
    {halfW:2.6,grooveM:0.24,pts:[[96,92],[52,36],[14,0],[-18,-28]]}
   ],
   middens:[
    {id:'midden-wrack-rampart',x:44,z:-48,rx:26,rz:18,h:4.2,yaw:0.18,harpoonHollow:true},
    {id:'midden-front-cairn',x:68,z:64,rx:20,rz:14,h:3.3,yaw:-0.32,harpoonHollow:false}
   ],
   skerries:[
    {id:'kelpfront-surf-stack',x:-146,z:54,rx:18,rz:12,h:16.5,yaw:0.24}
   ],
   reserves:[
    {id:'site:yonni-wrack-watch',name:'Southern Frontier Wrack-Watch Reserve',x:126,z:-92,r:24,h:14,targetY:14.2}
   ],
   camPads:[
    [128,-118,18],[48,26,16],[34,-24,16],[-18,78,16],[78,42,16],[96,-68,16]
   ]
  },

  cloudslope:{
   id:'cloudslope',
   seed:9204,
   name:'Upper Cfb Cloud-Rainforest, Shell-Tufa Cataract and Shag-Shell Mountain Snails',
   region:'Upper White-Pass Cloud Slope (438, 386)',
   px:[438,386],
   sky:[438-272,386-330],
   baseElevM:2150.0,
   atm:1.22,
   rainMm:3480,
   koppen:'Cfb',
   wind:[0.58,0.34],
   hasSea:false,
   seaLevel:-1e9,
   exposedSea:false,
   ambientMucus01:0.32,
   coastLime01:0.54,
   strata:{
    range:[-30,220],
    formations:[
     {recipe:'shroudhills-granite',base:-30,top:42},
     {recipe:'ria-carbonate-bluff',base:42,top:220,tint:[0.98,1.0,1.02]}
    ]
   },
   highways:[
    {halfW:2.2,grooveM:0.18,pts:[[-88,-42],[-34,-30],[22,-26],[78,-32]]},
    {halfW:2.0,grooveM:0.16,pts:[[-64,44],[-12,32],[46,28],[98,38]]}
   ],
   middens:[
    {id:'midden-tufa-bench',x:18,z:-36,rx:20,rz:14,h:3.2,yaw:0.22,harpoonHollow:false}
   ],
   skerries:[
    {id:'cloud-granite-tor-n',x:-52,z:-68,rx:22,rz:15,h:14.0,yaw:0.30},
    {id:'cloud-granite-tor-s',x:44,z:66,rx:20,rz:14,h:12.5,yaw:-0.28}
   ],
   reserves:[
    {id:'site:yonni-pass-shrine',name:'White-Pass Queen-Shell Way-Shrine Reserve',x:112,z:-68,r:22,h:12,targetY:10.4}
   ],
   camPads:[
    [118,-96,18],[56,-34,16],[-24,38,16],[-58,-34,16],[38,34,16],[84,-48,16]
   ]
  }
 };
})();

if(typeof window!=='undefined'){
 window.SNAIL_PHYS=SNAIL_PHYS;
 window.SNAIL_SITES=SNAIL_SITES;
}
if(typeof module!=='undefined'&&module.exports){
 module.exports={SNAIL_PHYS:SNAIL_PHYS,SNAIL_SITES:SNAIL_SITES};
}
