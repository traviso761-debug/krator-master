// ================================================================= ARACHNOID CANYONS — verified own-polygon station records ([G data])
// Strictly scoped to Core Arachnoid Canyons Proper (own = rmvarachnoids & ~all_other_biomes = 111,952 km2 / 27,988 cells,
// X = 864..1340, Y = 243..427, 100% dry land, incised by trunk river 9102 Ham-Tsek).
// Explicitly excludes neighboring overlap cells such as (1055, 219) in Compass Hills (rmweu4kpowzji) and Spider Lake (1272, 193).
// Zero THREE, zero DOM; deterministic data records consumed by ARACH_PHYS, host stage, and tests/test-arachnoids.js.
(function(root){
 'use strict';

 // Bounding & exclusion oracle for Core Arachnoid Canyons Proper (own = rmvarachnoids & ~all_other_biomes)
 // Envelope: X in [864, 1340], Y in [243, 427], excluding N/NW/NE overlap embayments (Compass Hills Y < 243, Spider Lake X > 1225 & Y < 252,
 // Ria Valley NE corner X > 1245 & Y < 285, Korona SE overlap X > 1190 & Y > 355, Outer-Wall S crest Y > 427).
 function inOwnPolygon(px,py){
  if(typeof px!=='number'||typeof py!=='number'||!isFinite(px)||!isFinite(py))return false;
  if(px<864||px>1340||py<243||py>427)return false;
  // Compass Hills north-central overlap notch (includes (1055, 219) which is already Y=219 < 243, plus border embayment)
  if(px>=1015&&px<=1115&&py<248)return false;
  // Spider Lake & Ria Valley NE overlap sector
  if(px>1225&&py<254)return false;
  if(px>1265&&py<292)return false;
  // Korona / Springhollows SE overlap sector
  if(px>1185&&py>352)return false;
  // SW Weeping Valley / Tiers corner trim
  if(px<895&&py>365)return false;
  return true;
 }

 var SITES={
  nexus:{
   key:'nexus',
   id:'rmvarachnoids',
   name:'Ham-Tsek Radial Dike Nexus and Bridge-Web Shut-In',
   region:'Arachnoid Canyons — Core Fracture-Nexus Gorge',
   out:'arachnoids.html',
   px:[998,290],
   sky:[726,-40],
   ownVerified:true,
   ownBufferKm:64.0,
   elevM:660.6,
   elevRangeM:[646,1600],
   reliefM:954,
   pAtm:1.47,
   koppen:'Cfa',
   rainMmYr:1082,
   tempMeanC:24.0,
   tempSeasonC:[34,14],
   riverId:9102,
   riverName:'Ham-Tsek',
   dischargeM3s:1295.0,
   bedY:-14.0,
   rimY:195.0,
   slotHalfW:29.0,
   wind:[4.6,-2.1],
   geothermalBoostC:3.5,
   kin:['nwlowlands','swlowlands','korona'],
   strata:{
    recipe:'arch-rift-basalt',
    lateral:'tepui',
    dir:[0.84,0.54],
    d0:-55,
    d1:135,
    tongue:7,
    range:[-60,380]
   },
   minerals:{iron:180,tin:80,saltpeter:200,coal:48,rareEarth:60,sulfur:20,gold:40},
   // 3 intersecting radial arch-rift-basalt dike spokes forming the star-junction shut-in around (0, 0)
   dikes:[
    {id:'spoke-nw-se',a:[-360,-230],b:[360,210],thickM:11.0,heightM:142.0,strike:0.53},
    {id:'spoke-sw-ne',a:[-340,245],b:[355,-225],thickM:10.5,heightM:138.0,strike:-0.58},
    {id:'spoke-n-s',a:[-32,-370],b:[38,370],thickM:9.2,heightM:126.0,strike:1.39}
   ],
   rings:[
    {cx:40,cz:-30,rM:168.0,widthM:42.0,depthM:35.0},
    {cx:40,cz:-30,rM:315.0,widthM:54.0,depthM:28.0}
   ],
   // Pre-verified opposite-wall basalt hex-column anchor pairs (38..84 m spans, >= 22 m clear of 9102 whitewater)
   webAnchors:[
    {id:'web-gate-central',a:[-28,28,-18],b:[28,30,16],tiers:3,dropM:6.8},
    {id:'web-gate-upstream',a:[62,34,-34],b:[92,36,28],tiers:3,dropM:7.2},
    {id:'web-gate-downstream',a:[-94,26,-32],b:[-66,28,34],tiers:3,dropM:6.4},
    {id:'web-gate-high',a:[-28,54,34],b:[30,56,-26],tiers:4,dropM:8.2},
    {id:'web-gate-narrows',a:[-12,42,-82],b:[44,44,-54],tiers:2,dropM:5.6}
   ],
   alcove:{
    id:'nitre-overhang-nexus',
    portal:[-54,68],
    hall:[-76,88],
    floorY:12.5,
    hallRx:14.0,
    hallRz:11.5,
    hallH:8.5,
    speleo:'HYPOGENE'
   },
   reserves:[
    {id:'site:hum-webgate',culture:'hum',name:'Hum Gorge-Warden Silk Toll-Pier Reserve',x:-95,z:60,r:46,fullReserveR:160}
   ],
   modes:['Clear','Slot-Mist','Rim-Gale']
  },

  fumarole:{
   key:'fumarole',
   id:'rmvarachnoids',
   name:'Cauldron-Slot Fumaroles and Basalt-Weir Step-Pools',
   region:'Arachnoid Canyons — Southern Ring-Fault Thermal Trough',
   out:'arachnoids-fumarole.html',
   px:[1097,331],
   sky:[825,1],
   ownVerified:true,
   ownBufferKm:12.0,
   elevM:912.6,
   elevRangeM:[875,2000],
   reliefM:1125,
   pAtm:1.43,
   koppen:'Cfa',
   rainMmYr:1224,
   tempMeanC:28.0,
   tempSeasonC:[41,15],
   riverId:9102,
   riverName:'Ham-Tsek',
   dischargeM3s:995.0,
   bedY:-8.0,
   rimY:215.0,
   slotHalfW:58.0,
   wind:[3.4,-1.5],
   geothermalBoostC:7.5,
   kin:['nwlowlands','swlowlands','korona'],
   strata:{
    recipe:'tibasalt-ponded',
    lateral:'arch-rift-basalt',
    dir:[0.92,0.39],
    d0:-70,
    d1:120,
    tongue:6,
    range:[-50,410]
   },
   minerals:{iron:180,tin:200,saltpeter:165,coal:30,rareEarth:90,sulfur:60,gold:110,placerTin:true,placerGold:true},
   dikes:[
    {id:'weir-sill-1',a:[-95,-140],b:[-65,145],thickM:8.5,heightM:42.0,strike:1.36},
    {id:'weir-sill-2',a:[18,-150],b:[48,155],thickM:9.0,heightM:46.0,strike:1.37},
    {id:'ring-wall-n',a:[-380,-168],b:[380,-152],thickM:13.0,heightM:185.0,strike:0.04},
    {id:'ring-wall-s',a:[-380,162],b:[380,176],thickM:13.0,heightM:190.0,strike:0.04}
   ],
   rings:[
    {cx:0,cz:0,rM:175.0,widthM:68.0,depthM:48.0}
   ],
   // Monotone-descending basalt-sill-dammed turquoise step-pools along the warm cauldron bench
   stepPools:(function(){
    var out=[],i;
    for(i=0;i<9;i++){
     var t=i/8;
     var px=-128+t*216+((i%2===0)?-8:8);
     var pz=-52+Math.sin(t*3.6)*24;
     var r=11.5+3.5*((i*29)%5)/4;
     var lvl=+(14.0-i*1.35).toFixed(3);
     var tempC=+(36.5-i*0.85+((i%3)*1.2)).toFixed(1);
     out.push({i:i,key:'step-pool-'+i,x:+px.toFixed(2),z:+pz.toFixed(2),r:+r.toFixed(2),level:lvl,floor:+(lvl-1.25).toFixed(3),crest:+(lvl+0.16).toFixed(3),tempC:tempC});
    }
    return out;
   })(),
   // Hydrothermal ring-fault fumarole vents feeding KTHERM & WATER.fumarole steam plumes
   vents:[
    {id:'fumarole-alpha',kind:'point',x:-52,z:46,T:68.5,reach:56.0,decay:2.6},
    {id:'fumarole-beta',kind:'point',x:14,z:58,T:64.0,reach:52.0,decay:2.7},
    {id:'fumarole-gamma',kind:'point',x:78,z:42,T:61.5,reach:48.0,decay:2.8},
    {id:'fumarole-delta',kind:'point',x:-18,z:-78,T:54.0,reach:44.0,decay:2.8},
    {id:'fumarole-fissure',kind:'line',pts:[[-68,48],[18,60],[86,40]],T:59.5,reach:38.0,decay:3.0}
   ],
   reserves:[
    {id:'site:hum-placer-camp',culture:'hum',name:'Hum Cassiterite & Gold Placer Washing Bar Reserve',x:112,z:-36,r:38,fullReserveR:120}
   ],
   modes:['Clear','Slot-Mist','Rim-Gale']
  },

  ledges:{
   key:'ledges',
   id:'rmvarachnoids',
   name:'Mid-Wall Columnar Basalt and Tuff Ledge Forest',
   region:'Arachnoid Canyons — Sun-Baked Csa Colonnade & Smoky Kluft',
   out:'arachnoids-ledges.html',
   px:[984,283],
   sky:[712,-47],
   ownVerified:true,
   ownBufferKm:68.0,
   elevM:1629.0,
   elevRangeM:[659,2895],
   reliefM:2236,
   pAtm:1.31,
   koppen:'Csa',
   rainMmYr:769,
   tempMeanC:18.0,
   tempSeasonC:[28,8],
   riverId:9102,
   riverName:'Ham-Tsek (Abyss Below)',
   dischargeM3s:0,
   bedY:-165.0,
   rimY:135.0,
   slotHalfW:95.0,
   wind:[5.8,-2.4],
   geothermalBoostC:1.5,
   kin:['nwlowlands','swlowlands','korona'],
   strata:{
    recipe:'arch-rift-basalt',
    lateral:'outland-tuff',
    dir:[0.32,0.95],
    d0:-85,
    d1:95,
    tongue:6,
    range:[-190,340]
   },
   minerals:{iron:160,tin:200,saltpeter:95,coal:0,rareEarth:160,sulfur:0,gold:110,silver:110},
   dikes:[
    {id:'colonnade-rib-w',a:[-290,-85],b:[290,-42],thickM:12.0,heightM:96.0,strike:0.15},
    {id:'colonnade-rib-e',a:[-180,145],b:[260,-155],thickM:9.5,heightM:84.0,strike:-0.59}
   ],
   rings:[
    {cx:0,cz:220,rM:260.0,widthM:75.0,depthM:150.0}
   ],
   // Walkable radial tension fissure (Kluft) lined with KSPELEO.SMOKY smoky-quartz druse
   alcove:{
    id:'smoky-quartz-kluft',
    portal:[34,-46],
    hall:[38,-78],
    floorY:16.0,
    hallRx:8.5,
    hallRz:15.5,
    hallH:11.0,
    speleo:'SMOKY'
   },
   reserves:[
    {id:'site:hum-cliff-stair',culture:'hum',name:'Hum Colonnade Cliff-Stair Landing Reserve',x:-78,z:18,r:34,fullReserveR:110}
   ],
   modes:['Clear','Slot-Mist','Rim-Gale']
  },

  frostrim:{
   key:'frostrim',
   id:'rmvarachnoids',
   name:'High Alpine Frost-Rim and Updraft-Sheared Krummholz',
   region:'Arachnoid Canyons — Western Outer-Wall ET Vitrophyre Shoulder',
   out:'arachnoids-frostrim.html',
   px:[919,281],
   sky:[647,-49],
   ownVerified:true,
   ownBufferKm:74.0,
   elevM:4784.3,
   elevRangeM:[2764,5822],
   reliefM:3058,
   pAtm:0.88,
   koppen:'ET',
   rainMmYr:392,
   tempMeanC:-2.0,
   tempSeasonC:[7,-12],
   riverId:0,
   riverName:'',
   dischargeM3s:0,
   bedY:-220.0,
   rimY:24.0,
   slotHalfW:110.0,
   wind:[8.8,-3.2],
   geothermalBoostC:0.0,
   kin:['korona'],
   strata:{
    recipe:'rift-basement',
    lateral:'arch-rift-basalt',
    dir:[0.76,0.65],
    d0:-95,
    d1:95,
    tongue:5,
    range:[-240,260]
   },
   minerals:{iron:120,tin:200,saltpeter:0,coal:0,rareEarth:160,sulfur:0,gold:40},
   dikes:[
    {id:'vitrophyre-hogback-1',a:[-320,-48],b:[310,64],thickM:7.5,heightM:18.5,strike:0.18},
    {id:'vitrophyre-hogback-2',a:[-145,-280],b:[125,260],thickM:6.8,heightM:15.0,strike:1.10},
    {id:'chasm-lip-spur',a:[-340,128],b:[340,148],thickM:10.0,heightM:22.0,strike:0.03}
   ],
   rings:[
    {cx:0,cz:285,rM:190.0,widthM:95.0,depthM:210.0}
   ],
   reserves:[
    {id:'site:hum-pass-cairn',culture:'hum',name:'Hum High-Rim Cairn & Brazier Portage Reserve',x:-42,z:-36,r:30,fullReserveR:95}
   ],
   modes:['Clear','Slot-Mist','Rim-Gale']
  }
 };

 SITES.inOwnPolygon=inOwnPolygon;
 // Neighbor reference coordinates explicitly outside `own` (for boundary non-overlap verification)
 SITES.EXCLUDED_NEIGHBORS=[
  {name:'Compass Hills Ham-Tsek Silk Post (Station 4 gorge)',px:[1055,219],owner:'biomes/compasshills'},
  {name:'Spider Lake Spillway',px:[1272,193],owner:'biomes/spiderlake'},
  {name:'Korona SE Rim',px:[1210,380],owner:'biomes/korona'},
  {name:'Outer Wall High Crest',px:[920,440],owner:'biomes/nwouterwall'}
 ];

 root.ARACH_SITES=SITES;
 if(typeof module!=='undefined'&&module.exports)module.exports=SITES;
})(typeof globalThis!=='undefined'?globalThis:this);
