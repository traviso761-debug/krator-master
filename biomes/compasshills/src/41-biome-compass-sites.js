// ================================================================= COMPASS HILLS — verified Scale-Model 5.1 station records ([G data])
// Four verified stations in rmweu4kpowzji (compass hills, 46,216 km^2 dry land, lodestone = 220, iron = 180; PLAN.md section 3):
//   foundry (default, dist/compasshills.html):        (1058, 224), sky (+786, -106), +876.5 m, 1.43 atm, Cfa, Lodestone quench-ring
//   tors    (--station tors, compasshills-tors.html): (1128, 248), sky (+856,  -82), +1392.3 m, 1.34 atm, Cfa, iron=180 lightning tors
//   cuesta  (--station cuesta, -cuesta.html):         (1046, 258), sky (+774,  -72), +987.6 m, 1.42 atm, Csa, 180-deg domain-wall saddle
//   gorge   (--station gorge, -gorge.html):           (1055, 219), sky (+783, -111), +846.7 m, 1.44 atm, Cfa, Ham-Tsek magnetite narrows
(function(root){
 'use strict';

 var SITES={
  foundry:{
   key:'foundry',
   id:'rmweu4kpowzji',
   title:'Compass Hills — Lodestone Quench-Ring and Toroidal Vent Rim',
   name:'Lodestone Toroidal Flux-Quench Rim',
   region:'Compass Hills — Lodestone Cryo-Magnet Ring (1058, 224)',
   px:[1058,224],
   sky:[786,-106],
   elevM:876.5,
   baseElevM:876.5,
   elevRangeM:[836,912],
   pAtm:1.43,
   atm:1.43,
   tempC:24.0,
   tempRangeC:[14.0,33.0],
   rainMmYr:847,
   koppen:'Cfa',
   wind:[4.4,-1.8],
   toroidRadiusM:225.0,
   trenchHalfWidthM:34.0,
   trenchDepthM:22.0,
   peakFieldMt:85.0,
   strataStack:'banded-ironstone',
   strata:{
    recipe:'banded-ironstone',
    lateral:'canyon',
    dir:[0.32,0.95],
    d0:-120,
    d1:180,
    tongue:5,
    range:[-60,260]
   },
   kin:['swlowlands','wouterwall'],
   minerals:{lodestone:220,iron:160,stone:255,coal:55,amber:120,tin:80,ultramafic:0,nickel:0,glass:0},
   quenchVents:(function(){
    var out=[],i,ang,rad,vx,vz,pol;
    for(i=0;i<6;i++){
     ang=i*(Math.PI/3)+0.28;
     rad=225.0+((i%2===0)?14.0:-12.0);
     vx=Math.cos(ang)*rad;
     vz=Math.sin(ang)*rad;
     pol=(i%2===0)?1:-1;
     out.push({i:i,x:+vx.toFixed(2),z:+vz.toFixed(2),polarity:pol,strengthMt:78.0+6.0*(i%3),throatR:7.5});
    }
    return out;
   })(),
   reserve:{
    id:'site:lodestone-arcology',
    culture:'delver-canton',
    name:'Lodestone Superconductor & Cryo-Magnet Arcology Reserve',
    x:0,
    z:0,
    r:96,
    minElevM:872.0
   },
   reserves:[{id:'site:lodestone-arcology',x:0,z:0,r:96}],
   modes:['Clear sky','Thunder squall','Field overlay']
  },

  tors:{
   key:'tors',
   id:'rmweu4kpowzji',
   title:'Compass Hills — Lightning-Struck Magnetite Tors and Fulgurite Spires',
   name:'Eastern High Banded-Ironstone Tors',
   region:'Compass Hills — Eastern Magnetite Escarpment (1128, 248)',
   px:[1128,248],
   sky:[856,-82],
   elevM:1392.3,
   baseElevM:1392.3,
   elevRangeM:[1270,1867],
   pAtm:1.34,
   atm:1.34,
   tempC:20.0,
   tempRangeC:[10.0,30.0],
   rainMmYr:941,
   koppen:'Cfa',
   wind:[6.2,-2.6],
   toroidRadiusM:0,
   peakFieldMt:96.0,
   strataStack:'banded-ironstone',
   strata:{
    recipe:'banded-ironstone',
    lateral:'rift-basement',
    dir:[0.18,0.98],
    d0:-160,
    d1:95,
    tongue:6,
    range:[-80,380]
   },
   kin:['swlowlands','wouterwall'],
   minerals:{lodestone:220,iron:180,stone:255,tin:200,rareEarth:160,amber:90,ultramafic:0,nickel:0,glass:0},
   torSpires:[
    {i:0,x:-145,z:-68,promM:48,hM:15.5,strengthMt:88.0,polarity:1},
    {i:1,x:-72,z:-84,promM:58,hM:17.5,strengthMt:96.0,polarity:-1},
    {i:2,x:8,z:-76,promM:62,hM:18.0,strengthMt:94.0,polarity:1},
    {i:3,x:86,z:-64,promM:52,hM:16.0,strengthMt:86.0,polarity:-1},
    {i:4,x:162,z:-48,promM:44,hM:14.0,strengthMt:79.0,polarity:1},
    {i:5,x:-34,z:-12,promM:36,hM:12.5,strengthMt:72.0,polarity:1},
    {i:6,x:52,z:8,promM:34,hM:11.8,strengthMt:68.0,polarity:-1},
    {i:7,x:-112,z:18,promM:31,hM:11.0,strengthMt:64.0,polarity:-1},
    {i:8,x:126,z:24,promM:29,hM:10.5,strengthMt:62.0,polarity:1}
   ],
   reserve:{
    id:'site:tors-bronze-quarry',
    culture:'delver-canton',
    name:'East-Scarp Non-Ferrous Bronze Quarry Bench',
    x:-118,
    z:96,
    r:34,
    minElevM:1375.0
   },
   reserves:[{id:'site:tors-bronze-quarry',x:-118,z:96,r:34}],
   modes:['Clear sky','Thunder squall','Field overlay']
  },

  cuesta:{
   key:'cuesta',
   id:'rmweu4kpowzji',
   title:'Compass Hills — Dry-Summer Csa Dip-Slope and Dipole Inversion Saddle',
   name:'Cuesta Pine-Pistache Woodland & Domain-Wall Saddle',
   region:'Compass Hills — Central-South Csa Dip-Slope (1046, 258)',
   px:[1046,258],
   sky:[774,-72],
   elevM:987.6,
   baseElevM:987.6,
   elevRangeM:[910,1240],
   pAtm:1.42,
   atm:1.42,
   tempC:22.0,
   tempRangeC:[13.0,32.0],
   rainMmYr:769,
   koppen:'Csa',
   wind:[3.8,-1.4],
   toroidRadiusM:0,
   peakFieldMt:18.5,
   strataStack:'banded-ironstone',
   strata:{
    recipe:'canyon',
    lateral:'banded-ironstone',
    dir:[0.12,0.99],
    d0:-85,
    d1:85,
    tongue:4,
    range:[-50,280]
   },
   kin:['swlowlands','wouterwall'],
   minerals:{lodestone:220,iron:135,stone:255,coal:40,amber:95,ultramafic:0,nickel:0,glass:0},
   domainSeam:{
    z0:0.0,
    halfWidthM:18.0,
    northAzRad:-1.18,
    southAzRad:2.02,
    lobeMt:4.2
   },
   reserve:{
    id:'site:cuesta-olive-terrace',
    culture:'delver-canton',
    name:'Saffron & Whorl-Olive Dip-Slope Terrace Reserve',
    x:142,
    z:-118,
    r:32,
    minElevM:975.0
   },
   reserves:[{id:'site:cuesta-olive-terrace',x:142,z:-118,r:32}],
   modes:['Clear sky','Thunder squall','Field overlay']
  },

  gorge:{
   key:'gorge',
   id:'rmweu4kpowzji',
   title:'Compass Hills — Ham-Tsek Magnetite Narrows and Silk-Magnet Ferry',
   name:'Ham-Tsek Magnetite Narrows & Ferry Gorge',
   region:'Compass Hills — Web-Cleaver River Corridor (1055, 219)',
   px:[1055,219],
   sky:[783,-111],
   elevM:846.7,
   baseElevM:846.7,
   elevRangeM:[836,936],
   pAtm:1.44,
   atm:1.44,
   tempC:23.0,
   tempRangeC:[14.0,33.0],
   rainMmYr:831,
   koppen:'Cfa',
   wind:[4.6,1.5],
   toroidRadiusM:0,
   peakFieldMt:26.0,
   strataStack:'banded-ironstone',
   strata:{
    recipe:'banded-ironstone',
    lateral:'carbonate-shelf',
    dir:[-0.24,0.97],
    d0:60,
    d1:240,
    tongue:5,
    range:[-55,260]
   },
   kin:['swlowlands','wouterwall'],
   minerals:{lodestone:220,iron:165,stone:255,coal:39,amber:120,limestone:180,ultramafic:0,nickel:0,glass:0},
   river:{
    id:'9102',
    name:'Ham-Tsek (Web-Cleaver River)',
    qM3s:1080,
    strike:0.22,
    halfW:38,
    wallH:88
   },
   gorgeDipoles:[
    {i:0,x:-135,z:-64,strengthMt:22.0,polarity:1},
    {i:1,x:15,z:-58,strengthMt:25.0,polarity:-1},
    {i:2,x:165,z:-44,strengthMt:21.0,polarity:1},
    {i:3,x:-65,z:68,strengthMt:23.0,polarity:-1},
    {i:4,x:92,z:74,strengthMt:19.0,polarity:1}
   ],
   reserve:{
    id:'site:ham-tsek-post',
    culture:'spider-lake',
    name:'Ham-Tsek Silk & Magnet Ferry Post Reserve',
    x:138,
    z:112,
    r:46,
    minElevM:850.0
   },
   reserves:[{id:'site:ham-tsek-post',x:138,z:112,r:46}],
   modes:['Clear sky','Thunder squall','Field overlay']
  }
 };

 root.COMPASS_SITES=SITES;
 if(typeof module!=='undefined'&&module.exports)module.exports=SITES;
})(typeof globalThis!=='undefined'?globalThis:this);
