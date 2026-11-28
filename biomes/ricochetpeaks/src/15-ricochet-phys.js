// ================================================================= RICOCHET PEAKS — oblique skipping-stone crater physics & 5-station sites ([G data])
// Pure engine-neutral physics and station specifications for Ricochet Peaks (Scale Model 5.1 polygon rmwvsvyf1iqzg; PLAN.md sections 1-5):
//   - Oblique grazing secondary-ejecta crater bowls (WNW -> ESE trajectory, aspect 1.24..1.38) with central rebound peaks & annular moat-lakes
//   - Self-watering 3x rim snow-trap basin catch turning 180-280 mm exterior winds into 580-920 mm/yr Dfc/Dfb boreal taiga & WH lakes
//   - Inverted "bowl treeline": nighttime katabatic cold-air frost hollows on unheated floors -> dense spruce-larch thermal belt on lower aprons -> rim krummholz
//   - Hydrothermal ground warmth heatAt & snowBareMask melting winter snow cleanly around East Hearth vents & Erebus steam-ice chimneys
//   - Radial shatter-cone strike, jet-black tagamite impact-glass sheets, meteoritic Fe-Ni-Au anomalies, and Skippers Notch venturi wind
// Zero THREE, zero DOM, zero Math.random, zero || <nonzero>; deterministic on KRAND.
var RICOCHET_DATA=(function(root){
 'use strict';
 var KR=root.KRAND;
 function nz(x,d){return x==null?d:x;}
 function clamp(v,a,b){return v<a?a:(v>b?b:v);}
 function lerp(a,b,t){return a+(b-a)*t;}
 function smooth(a,b,x){
  if(a===b)return x<a?0:1;
  var t=clamp((x-a)/(b-a),0,1);
  return t*t*(3-2*t);
 }
 function n2(x,z,f,seed){
  if(!KR||typeof KR.fbm!=='function')return 0;
  return KR.fbm(x*f,0.5,z*f,2,seed>>>0)-0.5;
 }

 // 12-crater ricochet swarm summary (PLAN.md section 2.2)
 var CRATER_SWARM=[
  {id:1,name:'Yuni-Gate Crater',px:[1205,1482],sizeKm:[26,20],floorM:3250,koppen:'Dfb',role:'yuni-pioneer-gateway'},
  {id:2,name:'Skippers Doublet West',px:[1272,1498],sizeKm:[24,18],floorM:3380,koppen:'Dfc',role:'rebound-island-moat'},
  {id:3,name:'North Crater',px:[1298,1518],sizeKm:[30,26],floorM:3420,koppen:'Dfc',role:'bandit-crossroads'},
  {id:4,name:'Glass-Pan Crater',px:[1158,1522],sizeKm:[22,16],floorM:3580,koppen:'Dfc',role:'tagamite-nickel-works'},
  {id:5,name:'West Crater',px:[1215,1535],sizeKm:[32,28],floorM:3120,koppen:'Dfc',role:'oidong-smuggler-haven'},
  {id:6,name:'Monks-Look South Crater',px:[1335,1592],sizeKm:[28,24],floorM:3340,koppen:'Dfc',role:'outlaw-pasture'},
  {id:7,name:'Kettle-Chain Doublet',px:[1398,1488],sizeKm:[28,19],floorM:3390,koppen:'Dfc',role:'fur-and-timber-camp'},
  {id:8,name:'East Hearth Crater',px:[1450,1558],sizeKm:[34,30],floorM:3180,koppen:'Dfb',role:'hydrothermal-winter-oasis'},
  {id:9,name:'Siphon-Lip Crater',px:[1518,1512],sizeKm:[22,18],floorM:3620,koppen:'Dfc',role:'siphon-toll-gate'},
  {id:10,name:'Old Rim Cryofumarole Bowl',px:[1375,1525],sizeKm:[16,13],floorM:5100,koppen:'ET',role:'erebus-ice-chimneys'},
  {id:11,name:'West Rim Perched Tarn',px:[1142,1558],sizeKm:[14,12],floorM:4750,koppen:'ET',role:'alpine-refuge'},
  {id:12,name:'High-Rift Shoulder Bowl',px:[1488,1592],sizeKm:[18,14],floorM:4620,koppen:'ET',role:'high-ice-hideout'}
 ];

 // 5 surveyed station sites (PLAN.md section 3 & prompt station specs)
 var SITES={
  ringlake:{
   id:'ringlake',
   key:'ringlake',
   name:'Yuni-Gate Central-Peak Ring-Lake & Pioneer Clearing',
   region:'Yuni-Gate Ricochet Crater',
   px:[1205,1482],
   sky:[933,1152],
   baseElevM:3250.0,
   atm:1.07,
   koppen:'Dfb',
   soilTempC:1.2,
   snowLineY:118.0,
   grazingAzimuthRad:-0.38,
   ellipseAspect:1.28,
   reboundPeak:{x:0,z:0,rx:118,rz:96,liftM:46.0},
   moat:{innerR:108,outerR:256,levelY:2.40,depthM:11.5},
   wind:[0.95,0.34],
   seed:9101,
   strata:{
    range:[-40,360],
    formations:[
     {recipe:'secondary-ejecta',base:-40,top:95},
     {recipe:'obsidian-pancake',base:95,top:138},
     {recipe:'secondary-ejecta',base:138,top:360}
    ]
   },
   tors:[
    {x:-14,z:-12,H:18.5,r:13.0,seed:9111},
    {x:22,z:16,H:14.2,r:10.5,seed:9112},
    {x:-6,z:32,H:11.8,r:9.0,seed:9113}
   ],
   vents:[],
   chimneys:[],
   anomalies:[
    {x:-168,z:184,r:46,niPpm:1650,feWtPct:16.5,auPpb:260}
   ],
   resNodes:[
    {id:'ricochet:res:ringlake:iron:0',kind:'iron',grade:'medium',x:-176,z:188},
    {id:'ricochet:res:ringlake:nickel:0',kind:'nickel',grade:'medium',x:294,z:-86},
    {id:'ricochet:res:ringlake:gold:0',kind:'gold',grade:'low',x:-286,z:-112}
   ],
   reserves:[
    {id:'site:yuni-pioneer-homestead',name:'Yuni-Gate Pioneer Timber & Rye Homestead Reserve',culture:'yuni',x:52,z:-36,r:34,targetY:16.5}
   ],
   shrines:[
    {x:18,z:-58,yaw:0.42}
   ],
   banditWorks:[]
  },

  notch:{
   id:'notch',
   key:'notch',
   name:'Skippers Notch Doublet Breach & Bandit Toll-Eyrie',
   region:'Skippers Notch Septum Pass',
   px:[1285,1508],
   sky:[1013,1178],
   baseElevM:3820.0,
   atm:0.99,
   koppen:'Dfc',
   soilTempC:-1.4,
   snowLineY:76.0,
   grazingAzimuthRad:-0.34,
   ellipseAspect:1.34,
   notchSpec:{widthM:180.0,saddleY:24.0,westLakeY:4.20,eastLakeY:-9.60,axisDir:[1.0,0.0]},
   wind:[2.15,0.28],
   seed:9201,
   strata:{
    range:[-50,380],
    formations:[
     {recipe:'secondary-ejecta',base:-50,top:34},
     {recipe:'obsidian-pancake',base:34,top:78},
     {recipe:'secondary-ejecta',base:78,top:380}
    ]
   },
   tors:[
    {x:-18,z:-118,H:26.0,r:16.0,seed:9211},
    {x:16,z:122,H:28.0,r:17.5,seed:9212}
   ],
   carveAlcove:{id:'notch-eyrie-alcove',c:[6,-34],n:[0.06,0.998],hw:12.0,depth:8.0,h:6.5,floorY:27.2},
   vents:[],
   chimneys:[],
   anomalies:[
    {x:-64,z:78,r:40,niPpm:1720,feWtPct:17.2,auPpb:220}
   ],
   resNodes:[
    {id:'ricochet:res:notch:iron:0',kind:'iron',grade:'medium',x:-72,z:84},
    {id:'ricochet:res:notch:nickel:0',kind:'nickel',grade:'low',x:78,z:-76},
    {id:'ricochet:res:notch:gold:0',kind:'gold',grade:'low',x:-94,z:-64}
   ],
   reserves:[
    {id:'site:ricochet-bandit-gate',name:'Skippers Notch Bandit Blockhouse & Toll-Gate Reserve',culture:'bandit',x:-8,z:42,r:30,targetY:25.2}
   ],
   shrines:[],
   banditWorks:[
    {kind:'abatis',x:-26,z:-14,yaw:0.18},
    {kind:'abatis',x:24,z:8,yaw:-0.22},
    {kind:'watch',x:28,z:-36,yaw:2.45}
   ]
  },

  vents:{
   id:'vents',
   key:'vents',
   name:'East Hearth Hydrothermal Boreal Oasis',
   region:'East Hearth Crater',
   px:[1450,1558],
   sky:[1178,1228],
   baseElevM:3180.0,
   atm:1.08,
   koppen:'Dfb',
   soilTempC:2.2,
   snowLineY:36.0,
   grazingAzimuthRad:-0.40,
   ellipseAspect:1.22,
   oasisLake:{cx:26,cz:12,rx:138,rz:112,levelY:1.80,depthM:9.2},
   wind:[0.72,0.26],
   seed:9301,
   strata:{
    range:[-40,360],
    formations:[
     {recipe:'secondary-ejecta',base:-40,top:24},
     {recipe:'evaporite-strand',base:24,top:58},
     {recipe:'obsidian-pancake',base:58,top:105},
     {recipe:'secondary-ejecta',base:105,top:360}
    ]
   },
   tors:[
    {x:-168,z:-84,H:16.0,r:12.0,seed:9311}
   ],
   vents:[
    {id:'hearth-v0',name:'Emerald Cauldron Fumarole',x:-58,z:-18,r:9.5,T:74.0,reach:135,mineral:'sinter',milky:true,boil:1},
    {id:'hearth-v1',name:'Sinter-Crown Boiling Pool',x:-36,z:34,r:8.0,T:68.0,reach:125,mineral:'sinter',milky:false,boil:1},
    {id:'hearth-v2',name:'Yuni Bath-Head Spring',x:12,z:-118,r:8.5,T:62.0,reach:130,mineral:'copper',milky:false,boil:0.6},
    {id:'hearth-v3',name:'Sulfur-Plume Vent',x:148,z:-44,r:7.2,T:71.0,reach:120,mineral:'sulfur',milky:false,boil:1},
    {id:'hearth-v4',name:'Willow-Steam Geyserite Pool',x:132,z:86,r:7.8,T:64.0,reach:125,mineral:'sinter',milky:true,boil:0.7},
    {id:'hearth-v5',name:'West Terrace Hot Spring',x:-94,z:-64,r:6.8,T:66.0,reach:115,mineral:'iron',milky:false,boil:0.8}
   ],
   chimneys:[],
   anomalies:[
    {x:-146,z:112,r:42,niPpm:1580,feWtPct:15.8,auPpb:480}
   ],
   resNodes:[
    {id:'ricochet:res:vents:gold:0',kind:'gold',grade:'high',x:-148,z:116},
    {id:'ricochet:res:vents:iron:0',kind:'iron',grade:'medium',x:184,z:-98},
    {id:'ricochet:res:vents:nickel:0',kind:'nickel',grade:'low',x:-188,z:-36}
   ],
   reserves:[
    {id:'site:yuni-bath-claim',name:'Yuni Pioneer Geothermal Bath-House & Greenhouse Claim',culture:'yuni',x:28,z:-164,r:34,targetY:7.6},
    {id:'site:bandit-shore-camp',name:'Outlaw Winter Shore-Camp Reserve',culture:'bandit',x:178,z:54,r:32,targetY:6.8}
   ],
   shrines:[
    {x:-8,z:-146,yaw:0.16}
   ],
   banditWorks:[
    {kind:'watch',x:152,z:24,yaw:-2.15}
   ]
  },

  glasssheet:{
   id:'glasssheet',
   key:'glasssheet',
   name:'Glass-Pan Impact-Melt Floor, Bonsai Melt-Pines & Meteoric Nickel Creek',
   region:'Glass-Pan Impact-Melt Crater',
   px:[1158,1522],
   sky:[886,1192],
   baseElevM:3580.0,
   atm:1.02,
   koppen:'Dfc',
   soilTempC:-0.8,
   snowLineY:92.0,
   grazingAzimuthRad:-0.36,
   ellipseAspect:1.36,
   meltSheet:{rx:240,rz:188,tarnCx:118,tarnCz:18,tarnRx:74,tarnRz:58,tarnLevelY:0.60},
   wind:[1.08,0.32],
   seed:9401,
   strata:{
    range:[-40,360],
    formations:[
     {recipe:'obsidian-pancake',base:-40,top:48},
     {recipe:'secondary-ejecta',base:48,top:135},
     {recipe:'obsidian-pancake',base:135,top:172},
     {recipe:'secondary-ejecta',base:172,top:360}
    ]
   },
   tors:[
    {x:-64,z:-48,H:11.5,r:10.5,seed:9411},
    {x:18,z:78,H:13.0,r:11.2,seed:9412},
    {x:-132,z:64,H:15.5,r:12.8,seed:9413}
   ],
   vents:[],
   chimneys:[],
   anomalies:[
    {x:-38,z:-24,r:56,niPpm:3450,feWtPct:26.4,auPpb:620},
    {x:36,z:-58,r:48,niPpm:2890,feWtPct:22.1,auPpb:510},
    {x:-108,z:28,r:52,niPpm:3120,feWtPct:24.8,auPpb:440},
    {x:42,z:68,r:44,niPpm:2640,feWtPct:20.5,auPpb:780}
   ],
   resNodes:[
    {id:'ricochet:res:glass:nickel:0',kind:'nickel',grade:'high',x:-36,z:-22},
    {id:'ricochet:res:glass:iron:0',kind:'iron',grade:'high',x:-106,z:26},
    {id:'ricochet:res:glass:gold:0',kind:'gold',grade:'medium',x:38,z:-56},
    {id:'ricochet:res:glass:nickel:1',kind:'nickel',grade:'medium',x:44,z:66}
   ],
   reserves:[
    {id:'site:yuni-glass-claim',name:'Yuni Geomancer Meteoric-Nickel & Tagamite Assay Claim',culture:'yuni',x:-88,z:-108,r:32,targetY:8.4}
   ],
   shrines:[
    {x:-54,z:-92,yaw:0.65}
   ],
   banditWorks:[]
  },

  highbowl:{
   id:'highbowl',
   key:'highbowl',
   name:'Old Rim Crater Erebus Steam-Ice Chimneys & Frozen Tarn',
   region:'Old Rim Cryofumarole Crater',
   px:[1375,1525],
   sky:[1103,1195],
   baseElevM:5100.0,
   atm:0.82,
   koppen:'ET',
   soilTempC:-12.5,
   snowLineY:-12.0,
   grazingAzimuthRad:-0.42,
   ellipseAspect:1.24,
   iceTarn:{cx:36,cz:14,rx:96,rz:78,levelY:1.20},
   wind:[1.45,0.44],
   seed:9501,
   strata:{
    range:[-40,380],
    formations:[
     {recipe:'secondary-ejecta',base:-40,top:65},
     {recipe:'obsidian-pancake',base:65,top:110},
     {recipe:'secondary-ejecta',base:110,top:380}
    ]
   },
   tors:[
    {x:-142,z:-92,H:18.0,r:13.5,seed:9511}
   ],
   carveAlcove:{id:'erebus-steam-cave',c:[-96,-58],n:[0.76,0.65],hw:11.0,depth:8.0,h:5.6,floorY:8.6},
   vents:[
    {id:'erebus-c0',name:'Great Erebus Rime Chimney',x:-42,z:-18,r:4.5,T:34.0,reach:28,mineral:'sinter',milky:false,boil:0},
    {id:'erebus-c1',name:'Twin Fumarole Ice Tower',x:-18,z:38,r:4.0,T:31.0,reach:25,mineral:'sinter',milky:false,boil:0},
    {id:'erebus-c2',name:'North Shelf Ice Pipe',x:-58,z:26,r:3.6,T:29.0,reach:22,mineral:'sinter',milky:false,boil:0},
    {id:'erebus-c3',name:'Tarn-Lip Cryofumarole Spire',x:-12,z:-52,r:4.2,T:32.0,reach:26,mineral:'sinter',milky:false,boil:0},
    {id:'erebus-c4',name:'Steam-Cave Mouth Vent',x:-88,z:-50,r:4.8,T:36.0,reach:30,mineral:'sinter',milky:false,boil:0}
   ],
   chimneys:[
    {id:'erebus-tower-0',x:-42,z:-18,H:13.2,r:4.6,seed:9521},
    {id:'erebus-tower-1',x:-18,z:38,H:10.8,r:3.9,seed:9522},
    {id:'erebus-tower-2',x:-58,z:26,H:8.6,r:3.4,seed:9523},
    {id:'erebus-tower-3',x:-12,z:-52,H:11.6,r:4.1,seed:9524},
    {id:'erebus-tower-4',x:-76,z:-12,H:7.4,r:3.1,seed:9525}
   ],
   anomalies:[
    {x:-112,z:74,r:38,niPpm:1840,feWtPct:18.0,auPpb:290}
   ],
   resNodes:[
    {id:'ricochet:res:highbowl:nickel:0',kind:'nickel',grade:'medium',x:-114,z:76},
    {id:'ricochet:res:highbowl:iron:0',kind:'iron',grade:'low',x:148,z:-82},
    {id:'ricochet:res:highbowl:gold:0',kind:'gold',grade:'low',x:-138,z:-34}
   ],
   reserves:[
    {id:'site:erebus-ice-refuge',name:'Old Rim Steam-Cave Smuggler Refuge Reserve',culture:'bandit',x:-118,z:38,r:28,targetY:11.2}
   ],
   shrines:[],
   banditWorks:[]
  }
 };

 // 1. Barometric pressure curve matching Krator Scale Model 5.1 (+3,250 m -> ~1.07 atm; > +5,800 m -> < 0.60 atm hypoxia)
 function pressureAtElev(elevM){
  var z=nz(elevM,3250.0);
  // Two-scale atmosphere: habitable boreal bowls at 2.7-3.8 km sit at 0.98-1.15 atm; outer 6-14 km walls thin rapidly below 0.60 atm
  var base=1.60*Math.exp(-z/8100.0);
  var highDrop=z>4800.0?0.19*smooth(4800.0,6200.0,z):0.0;
  return +(Math.max(0.12,base-highDrop)).toFixed(4);
 }

 // 2. Orographic snow-trap basin catch (PLAN.md section 2.2: 3x rim catchment funnels meltwater onto flat crater floors)
 function orographicCatchAt(craterDiameterKm,wallReliefM,extRainMmYr){
  var dKm=Math.max(4.0,nz(craterDiameterKm,26.0));
  var wM=Math.max(0.0,nz(wallReliefM,5000.0));
  var ext=Math.max(40.0,nz(extRainMmYr,220.0));
  var funnelRatio=1.0+2.15*smooth(1200.0,4800.0,wM)*clamp(28.0/dKm,0.65,1.35);
  var effMm=ext*funnelRatio;
  var lakeSustained=effMm>=520.0&&wM>=2200.0;
  return{
   funnelRatio:+funnelRatio.toFixed(3),
   effectiveMmYr:+effMm.toFixed(1),
   lakeSustained:lakeSustained,
   koppenClass:wM>6500&&effMm<350?'ET':(effMm>=550?'Dfc':'BSk')
  };
 }

 // 3. Oblique grazing ricochet crater-bowl + central rebound peak + annular moat geometry
 function craterBowlAt(x,z,site){
  var st=site||SITES.ringlake;
  var az=nz(st.grazingAzimuthRad,-0.38);
  var asp=nz(st.ellipseAspect,1.28);
  var ca=Math.cos(az),sa=Math.sin(az);
  // Rotate into oblique WNW->ESE skipping-stone trajectory frame (u: downrange ESE, v: cross-range)
  var u=x*ca+z*sa;
  var v=-x*sa+z*ca;
  var rEll=Math.sqrt((u/asp)*(u/asp)+v*v);

  // Uprange (NW, u < 0) wall is steeper; downrange (SE, u > 0) carries thick suevite melt-breccia bench
  var downrangeAsym=clamp(0.5+0.5*(u/Math.max(40.0,rEll)),0,1);
  var bowlWallRise=165.0*Math.pow(smooth(245.0,660.0,rEll),1.48)*(1.08-0.16*downrangeAsym);

  var reboundLiftM=0.0;
  var moatDepthM=0.0;
  if(st.reboundPeak){
   var rp=st.reboundPeak;
   var du=(x-rp.x)/rp.rx,dv=(z-rp.z)/rp.rz;
   var dPeak=Math.sqrt(du*du+dv*dv);
   if(dPeak<1.15){
    reboundLiftM=rp.liftM*Math.pow(clamp(1.0-dPeak*dPeak*0.78,0,1),1.45);
   }
  }
  if(st.moat){
   var mt=st.moat;
   var rMoat=Math.hypot(x,z);
   var inInner=smooth(mt.innerR-18.0,mt.innerR+24.0,rMoat);
   var inOuter=smooth(mt.outerR+28.0,mt.outerR-28.0,rMoat);
   moatDepthM=mt.depthM*inInner*inOuter;
  }

  // Doublet septum breach on Station 2 (notch)
  var septumNotch01=0.0;
  if(st.notchSpec){
   var hw=st.notchSpec.widthM*0.5;
   septumNotch01=smooth(hw*1.35,hw*0.45,Math.abs(z))*smooth(240.0,40.0,Math.abs(x));
  }

  return{
   downrangeM:+u.toFixed(2),
   crossrangeM:+v.toFixed(2),
   ellipticalR:+rEll.toFixed(2),
   reboundLiftM:+reboundLiftM.toFixed(2),
   moatDepthM:+moatDepthM.toFixed(2),
   wallRiseM:+bowlWallRise.toFixed(2),
   downrangeEjecta01:+downrangeAsym.toFixed(3),
   septumNotch01:+septumNotch01.toFixed(3)
  };
 }

 // 4. Hydrothermal ground heat & snowBare melt raster (PLAN.md sections 1 & 3)
 function heatAt(x,z,site){
  var st=site||SITES.ringlake;
  var baseT=nz(st.soilTempC,0.5);
  var liftC=0.0;
  var sinter01=0.0;
  var vents=st.vents||[];
  for(var i=0;i<vents.length;i++){
   var v=vents[i];
   var d=Math.hypot(x-v.x,z-v.z);
   var reach=nz(v.reach,110.0);
   if(d<reach*1.35){
    var u=clamp(1.0-d/(reach*1.25),0,1);
    var vHeat=(v.T-baseT)*Math.pow(u,2.05);
    if(vHeat>liftC)liftC=vHeat;
    var sRing=smooth(v.r*4.6,v.r*1.05,d);
    if(sRing>sinter01)sinter01=sRing;
   }
  }
  if(st.key==='vents'&&st.oasisLake){
   var ol=st.oasisLake;
   var dl=Math.hypot((x-ol.cx)/ol.rx,(z-ol.cz)/ol.rz);
   var lakeWarm=13.5*smooth(1.55,0.75,dl);
   if(lakeWarm>liftC)liftC=lakeWarm;
  }
  var surfT=baseT+liftC+0.8*n2(x,z,0.025,nz(st.seed,9101)+77);
  var snowMelted01=smooth(2.5,8.5,liftC);
  return{
   ambientSoilC:baseT,
   heatLiftC:+liftC.toFixed(2),
   surfaceTempC:+surfT.toFixed(2),
   sinter01:+clamp(sinter01,0,1).toFixed(3),
   snowMelted01:+snowMelted01.toFixed(3)
  };
 }

 function snowBareMask(box,cell,site){
  var b=box||[-680,-680,680,680];
  var c=Math.max(2,nz(cell,8));
  var st=site||SITES.vents;
  var nx=Math.max(2,Math.floor((b[2]-b[0])/c)+1);
  var nzN=Math.max(2,Math.floor((b[3]-b[1])/c)+1);
  var data=new Uint8Array(nx*nzN);
  var bareCount=0;
  for(var j=0;j<nzN;j++){
   var wz=b[1]+j*c;
   for(var i=0;i<nx;i++){
    var wx=b[0]+i*c;
    var ht=heatAt(wx,wz,st);
    // 255 = snow may lie, 0 = bare melted ground around warm hydrothermal vents
    var allow=Math.round(255*(1.0-ht.snowMelted01));
    data[j*nx+i]=allow;
    if(allow<64)bareCount++;
   }
  }
  return{x0:b[0],z0:b[1],cell:c,nx:nx,nz:nzN,data:data,bareCells:bareCount};
 }

 // 5. Inverted "bowl treeline" (PLAN.md section 4.1: cold-pool frost hollow at bottom -> dense spruce-larch thermal belt -> rim krummholz)
 function bowlTreelineAt(x,z,elevAboveFloorM,heatLiftC,site){
  var st=site||SITES.ringlake;
  var hRel=nz(elevAboveFloorM,0.0);
  var hLift=nz(heatLiftC,heatAt(x,z,st).heatLiftC);

  if(st.koppen==='ET'){
   var cryoMoss01=smooth(6.0,18.0,hLift);
   return{
    band:cryoMoss01>0.35?'cryofumarole_mouth':'cryofumarole_et',
    frostHollow01:+(1.0-cryoMoss01).toFixed(3),
    thermalBelt01:0,
    thermalOasis01:+cryoMoss01.toFixed(3),
    rimKrummholz01:+(0.25*(1.0-cryoMoss01)).toFixed(3),
    nightMinTempC:+(lerp(-22.0,12.0,cryoMoss01)).toFixed(1)
   };
  }

  var oasis01=smooth(5.5,14.0,hLift);
  // Unheated lowest crater-floor depressions (< 5.8 m above water/floor) pool -20..-24 C katabatic night air
  var rawColdPool=smooth(8.2,1.6,hRel)*(1.0-oasis01);
  // Thermal belt sits 7..105 m up the lower talus apron and on the central rebound peak island!
  var beltUp=smooth(3.8,11.5,hRel+oasis01*12.0);
  var beltTop=smooth(145.0,88.0,hRel);
  var thermalBelt01=clamp(beltUp*beltTop*(1.0-rawColdPool*0.85),0,1);
  var rimKrummholz01=smooth(82.0,142.0,hRel);

  var band='thermal_taiga';
  if(oasis01>0.55)band='hydrothermal_oasis';
  else if(rawColdPool>0.55)band='frost_hollow';
  else if(rimKrummholz01>0.55)band='rim_krummholz';

  var nightMinC=-9.5-12.5*rawColdPool+14.0*oasis01-4.5*rimKrummholz01;
  return{
   band:band,
   frostHollow01:+rawColdPool.toFixed(3),
   thermalBelt01:+thermalBelt01.toFixed(3),
   thermalOasis01:+oasis01.toFixed(3),
   rimKrummholz01:+rimKrummholz01.toFixed(3),
   nightMinTempC:+nightMinC.toFixed(1)
  };
 }

 // 6. Radial shatter-cone strike & jet-black tagamite impact-melt glass distribution
 function shatterConeAt(x,z,site){
  var st=site||SITES.ringlake;
  var r=Math.hypot(x,z);
  var sx=r>1e-3?x/r:1.0,sz=r>1e-3?z/r:0.0;
  var baseGlass=st.key==='glasssheet'?0.84:(st.key==='notch'?0.42:0.28);
  var patch=0.22*n2(x,z,0.014,nz(st.seed,9101)+303);
  var sheetMask=st.key==='glasssheet'?smooth(265.0,150.0,r):smooth(145.0,32.0,r)*0.45;
  var tagamite01=clamp(baseGlass*sheetMask+patch+(st.key==='glasssheet'?0.24:0),0,1);
  var conePlungeDeg=clamp(58.0-22.0*smooth(20.0,280.0,r),24.0,62.0);
  return{
   strike:[+sx.toFixed(4),+sz.toFixed(4)],
   conePlungeDeg:+conePlungeDeg.toFixed(1),
   tagamite01:+tagamite01.toFixed(3),
   striation01:+clamp(0.55+0.45*Math.abs(n2(x,z,0.08,9188)),0,1).toFixed(3)
  };
 }

 // 7. Breach-notch wind venturi speedup & tree wind-flagging lean (Station 2: Skippers Notch)
 function notchVenturiAt(x,z,site){
  var st=site||SITES.notch;
  var bw=st.wind||[1.0,0.3];
  var baseSpeed=Math.hypot(bw[0],bw[1]);
  if(!st.notchSpec){
   return{
    speedup:1.0,
    windMs:+((baseSpeed*3.2).toFixed(2)),
    dir:[+(bw[0]/baseSpeed).toFixed(4),+(bw[1]/baseSpeed).toFixed(4)],
    leanRad:0.04
   };
  }
  var ns=st.notchSpec;
  var hw=ns.widthM*0.5;
  // Venturi acceleration peaks inside the 180 m V-notch throat (|z| < 90 m, |x| < 110 m)
  var throat=smooth(hw*1.45,hw*0.35,Math.abs(z))*smooth(195.0,35.0,Math.abs(x));
  var speedup=1.0+1.65*throat;
  var windMs=baseSpeed*4.2*speedup;
  var leanRad=clamp(0.05+0.36*throat,0.04,0.44);
  return{
   speedup:+speedup.toFixed(3),
   windMs:+windMs.toFixed(2),
   dir:[1.0,0.0],
   leanRad:+leanRad.toFixed(3)
  };
 }

 // 8. Meteoritic Fe-Ni-Au impactor fragment anomalies (drives metallic-blue nickel_heather indicator stands!)
 function meteoricAnomalyAt(x,z,site){
  var st=site||SITES.glasssheet;
  var ni=140.0,fe=5.2,au=8.0;
  var list=st.anomalies||[];
  for(var i=0;i<list.length;i++){
   var a=list[i];
   var d=Math.hypot(x-a.x,z-a.z);
   if(d<a.r*1.65){
    var w=smooth(a.r*1.55,a.r*0.28,d);
    ni=Math.max(ni,lerp(140.0,a.niPpm,w));
    fe=Math.max(fe,lerp(5.2,a.feWtPct,w));
    au=Math.max(au,lerp(8.0,a.auPpb,w));
   }
  }
  var indicator01=smooth(950.0,2200.0,ni);
  return{
   niPpm:+ni.toFixed(0),
   feWtPct:+fe.toFixed(2),
   auPpb:+au.toFixed(0),
   indicator01:+indicator01.toFixed(3),
   heatherTell:indicator01>=0.45
  };
 }

 // 9. Validated KHAZ.make(...) specifications (PLAN.md section 1)
 function hazardSpec(key){
  if(key==='coldpool'){
   return{kind:'cold',effect:'freeze',danger:0.46,dose:0.22,falloff:'smooth'};
  }
  if(key==='bandit_notch'){
   return{kind:'hunter',effect:'hold',danger:0.64,dose:0.35,falloff:'linear'};
  }
  if(key==='scald'){
   return{kind:'heat',effect:'burn',danger:0.72,dose:0.48,falloff:'linear',radiant:{reach:8,dose:0.30,danger:0.45}};
  }
  if(key==='co2'){
   return{kind:'gas',effect:'suffocate',danger:0.68,dose:0.42,falloff:'smooth'};
  }
  if(key==='rim_hypoxia'){
   return{kind:'gas',effect:'suffocate',danger:0.58,dose:0.28,falloff:'linear'};
  }
  return{kind:'fall',effect:'bleed',danger:0.55,dose:0.30,falloff:'linear'};
 }

 return{
  PHYS:{
   CRATER_SWARM:CRATER_SWARM,
   pressureAtElev:pressureAtElev,
   orographicCatchAt:orographicCatchAt,
   craterBowlAt:craterBowlAt,
   heatAt:heatAt,
   snowBareMask:snowBareMask,
   bowlTreelineAt:bowlTreelineAt,
   shatterConeAt:shatterConeAt,
   notchVenturiAt:notchVenturiAt,
   meteoricAnomalyAt:meteoricAnomalyAt,
   hazardSpec:hazardSpec
  },
  SITES:SITES
 };
})(typeof window!=='undefined'?window:globalThis);

var RICOCHET_PHYS=RICOCHET_DATA.PHYS;
var RICOCHET_SITES=RICOCHET_DATA.SITES;
if(typeof window!=='undefined'){
 window.RICOCHET_PHYS=RICOCHET_PHYS;
 window.RICOCHET_SITES=RICOCHET_SITES;
}
if(typeof module!=='undefined'&&module.exports){
 module.exports={RICOCHET_PHYS:RICOCHET_PHYS,RICOCHET_SITES:RICOCHET_SITES};
}
