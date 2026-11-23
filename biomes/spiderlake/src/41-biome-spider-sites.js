// ================================================================= SPIDER LAKE — surveyed Scale-Model 5.1 station sites ([G data])
// Exact raster coordinates, sky frames (px - 272, py - 330), +1,460.0 m unbifurcated lake datum, 380 m3/s SW breach
// outflow into 9102 Ham-Tsek, 640 m3/s eastern 9106 Hau-Gel inflow, KSTRATA stacks, emergent stacks, bridge-curtain
// anchor pairs, thermal degumming vents, walk-in KSPELEO.CALCITE grotto, and site:spider-lake-weirs town reserve.
var SPIDER_SITES=(function(){
 'use strict';
 return{
  basin:{
   id:'rmvyj4v2ozgb1',
   name:'Spider Lake',
   totalAreaKm2:72928,
   dryAreaKm2:66688,
   lakeAreaKm2:6240,
   lakeDatumM:1460.0,
   inflowRiver:{id:'9106',name:'Hau-Gel',px:[1328,228],qM3s:640.0},
   outflowRiver:{id:'9102',name:'Ham-Tsek',px:[1272,193],qM3s:380.0,mouthQM3s:1650.0},
   northDivide:{px:[1278,166],crestElevM:2040.0,surfaceOutflowM3s:0.0},
   subEscarpmentConduit:{id:'tube_ozarks_15',fromPx:[1246,206],toPx:[1212,174]}
  },
  spillway:{
   id:'spillway',
   name:'Arachnoid Spillway and Silk Weirs',
   region:'Ham-Tsek Breach (1272, 193)',
   px:[1272,193],
   sky:[1000,-137],
   baseElevM:1460.0,
   lakeLevelLocal:0.0,
   hasOpenLake:true,
   atm:1.333,
   pO2Atm:0.280,
   rhoKgM3:1.560,
   tempC:21.0,
   rainMm:1898,
   wind:[4.6,1.6],
   outflowM3s:380.0,
   shoreDistBaseM:45.0,
   seepProximity01:0.72,
   strata:{recipe:'secondary-ejecta',range:[-85,220],lateral:'carbonate-shelf',dir:[0.82,-0.57],d0:-120,d1:95,tongue:18},
   stacks:[
    {id:'sp-stack-n',x:-28,z:-76,r:34,top:26.5,rock:'ejecta'},
    {id:'sp-stack-s',x:-22,z:82,r:36,top:28.0,rock:'ejecta'},
    {id:'sp-stack-e1',x:142,z:-98,r:30,top:22.0,rock:'dolomite'},
    {id:'sp-stack-e2',x:156,z:94,r:32,top:24.0,rock:'ejecta'}
   ],
   curtainSpans:[
    {id:'sp-curtain-throat',a:[-28,25.0,-68],b:[-22,26.2,74],dropM:12.5,tiers:3,boatArch:true,clearMinM:9.0},
    {id:'sp-curtain-cove',a:[142,21.0,-88],b:[156,22.5,84],dropM:10.5,tiers:3,boatArch:true,clearMinM:8.2},
    {id:'sp-curtain-gorge',a:[-168,18.0,-62],b:[-162,19.5,64],dropM:10.0,tiers:2,boatArch:false,clearMinM:14.0}
   ],
   thermalPools:[
    {key:'sp-vat-1',name:'Spillway Alkaline Degumming Vat West',x:68,z:142,r:8.5,level:3.6,temp:0.18,tempC:39.0},
    {key:'sp-vat-2',name:'Spillway Alkaline Degumming Vat East',x:94,z:156,r:7.2,level:4.4,temp:0.16,tempC:38.0}
   ],
   reserves:[]
  },
  narrows:{
   id:'narrows',
   name:'Golden Narrows and Ham-Spi Principality Reserve',
   region:'Spider Lake Weirs (1288, 220)',
   px:[1288,220],
   sky:[1016,-110],
   baseElevM:1460.0,
   lakeLevelLocal:0.0,
   hasOpenLake:true,
   atm:1.333,
   pO2Atm:0.280,
   rhoKgM3:1.560,
   tempC:21.0,
   rainMm:1836,
   wind:[4.9,-1.4],
   outflowM3s:0.0,
   shoreDistBaseM:30.0,
   seepProximity01:0.78,
   strata:{recipe:'secondary-ejecta',range:[-30,180],lateral:'carbonate-shelf',dir:[-0.65,0.76],d0:-140,d1:140,tongue:22},
   stacks:[
    {id:'nr-stack-1',x:-72,z:-36,r:38,top:25.5,rock:'dolomite'},
    {id:'nr-stack-2',x:98,z:-58,r:42,top:28.5,rock:'ejecta'},
    {id:'nr-stack-3',x:246,z:24,r:36,top:24.5,rock:'dolomite'},
    {id:'nr-stack-4',x:48,z:118,r:34,top:23.5,rock:'ejecta'},
    {id:'nr-stack-5',x:-148,z:-165,r:32,top:22.0,rock:'ejecta'}
   ],
   curtainSpans:[
    {id:'nr-curtain-main',a:[-66,24.2,-34],b:[92,26.8,-54],dropM:13.2,tiers:4,boatArch:true,clearMinM:7.8},
    {id:'nr-curtain-east',a:[104,26.5,-52],b:[240,23.5,20],dropM:12.0,tiers:3,boatArch:true,clearMinM:7.5},
    {id:'nr-curtain-south',a:[-64,23.5,-28],b:[44,22.4,112],dropM:11.2,tiers:3,boatArch:true,clearMinM:7.4},
    {id:'nr-curtain-north',a:[-142,21.0,-158],b:[-68,24.0,-42],dropM:10.4,tiers:3,boatArch:true,clearMinM:7.2}
   ],
   thermalPools:[],
   reserves:[
    {id:'site:spider-lake-weirs',name:'Spider Lake Weirs (Ham-Spi Silk Principality Seat Reserve)',x:-235,z:185,r:165,specRadiusM:420,kit:'kits/spider-lake'}
   ]
  },
  pavilion:{
   id:'pavilion',
   name:'High Canopy Brood-Pavilion Grove and Hum Spindle-Terraces',
   region:'South-East Bench Woods (1308, 224)',
   px:[1308,224],
   sky:[1036,-106],
   baseElevM:1460.0,
   lakeLevelLocal:0.0,
   hasOpenLake:true,
   atm:1.328,
   pO2Atm:0.279,
   rhoKgM3:1.554,
   tempC:20.8,
   rainMm:1867,
   wind:[3.9,1.8],
   outflowM3s:0.0,
   shoreDistBaseM:160.0,
   seepProximity01:0.66,
   strata:{recipe:'carbonate-shelf',range:[-20,240],lateral:'secondary-ejecta',dir:[0.25,0.97],d0:20,d1:240,tongue:16},
   stacks:[],
   curtainSpans:[
    {id:'pv-curtain-cove',a:[-108,20.5,-168],b:[68,21.5,-174],dropM:9.8,tiers:2,boatArch:true,clearMinM:7.6}
   ],
   terraces:[
    {z:95,y:18.5,w:240},
    {z:142,y:25.5,w:250},
    {z:190,y:33.0,w:240}
   ],
   thermalPools:[],
   reserves:[]
  },
  fen:{
   id:'fen',
   name:'Hau-Gel Hydrothermal Lake-Smoke Midge-Fen and Degumming Springs',
   region:'Outland Gate River Delta (1328, 228)',
   px:[1328,228],
   sky:[1056,-102],
   baseElevM:1460.0,
   lakeLevelLocal:0.0,
   hasOpenLake:true,
   atm:1.333,
   pO2Atm:0.280,
   rhoKgM3:1.560,
   tempC:21.4,
   rainMm:1929,
   wind:[-4.2,1.5],
   inflowM3s:640.0,
   outflowM3s:0.0,
   shoreDistBaseM:25.0,
   seepProximity01:0.96,
   strata:{recipe:'carbonate-shelf',range:[-25,140]},
   stacks:[
    {id:'fn-stack-1',x:-145,z:-92,r:28,top:19.0,rock:'dolomite'}
   ],
   curtainSpans:[
    {id:'fn-curtain-mouth',a:[-140,18.0,-88],b:[-18,17.5,-138],dropM:8.2,tiers:2,boatArch:true,clearMinM:7.0}
   ],
   thermalPools:[
    {key:'fn-pool-1',name:'Great Travertine Sericin-Degumming Bath',x:34,z:26,r:17.5,level:0.62,temp:0.16,tempC:39.5},
    {key:'fn-pool-2',name:'Upper Alkaline Carbonate Spring',x:78,z:58,r:13.5,level:1.45,temp:0.24,tempC:44.2},
    {key:'fn-pool-3',name:'Golden Diatom Warm-Seep Basin',x:-26,z:48,r:14.0,level:0.44,temp:0.14,tempC:38.2},
    {key:'fn-pool-4',name:'South Fen Degumming Terrace Pool',x:52,z:104,r:11.5,level:2.18,temp:0.19,tempC:41.0},
    {key:'fn-pool-5',name:'Midge-Nursery Seep Apron Pool',x:-68,z:18,r:12.0,level:0.32,temp:0.12,tempC:36.8}
   ],
   smokePillars:[
    {x:-95,z:-95,r:34,h:285},
    {x:-20,z:-145,r:42,h:305},
    {x:75,z:-120,r:38,h:290},
    {x:-165,z:-35,r:36,h:270},
    {x:145,z:-85,r:32,h:260}
   ],
   reserves:[]
  },
  dolomite:{
   id:'dolomite',
   name:'Dolomite Rim Overlook, Porphyry Dike and Calcite-Celestine Grotto',
   region:'NW Springhollows Escarpment & Conduit (1256, 184)',
   px:[1256,184],
   sky:[984,-146],
   baseElevM:1460.0,
   lakeLevelLocal:0.0,
   hasOpenLake:true,
   atm:1.326,
   pO2Atm:0.278,
   rhoKgM3:1.552,
   tempC:21.5,
   rainMm:1741,
   wind:[4.4,2.1],
   outflowM3s:0.0,
   shoreDistBaseM:190.0,
   seepProximity01:0.52,
   strata:{recipe:'carbonate-shelf',range:[-25,240],lateral:'secondary-ejecta',dir:[-0.45,-0.89],d0:60,d1:260,tongue:15},
   dike:{x0:-180,z0:120,x1:190,z1:-95,width:22,ridgeH:14.5},
   grotto:{
    portal:[18,-26],
    floorY:3.4,
    hall:[18,22],
    hallRx:14.5,
    hallRz:13.0,
    hallH:9.6,
    conduitId:'tube_ozarks_15'
   },
   stacks:[
    {id:'dl-stack-1',x:128,z:-136,r:30,top:21.0,rock:'dolomite'}
   ],
   curtainSpans:[
    {id:'dl-curtain-bluff',a:[48,20.0,-82],b:[124,20.0,-132],dropM:8.8,tiers:2,boatArch:true,clearMinM:7.2}
   ],
   thermalPools:[
    {key:'dl-brine-pool',name:'Grotto Mouth Warm Carbonate Seep',x:18,z:-38,r:6.8,level:1.65,temp:0.15,tempC:38.5}
   ],
   reserves:[]
  },
  rampart:{
   id:'rampart',
   name:'North Ejecta Boulder-Collar and Ria Hydrological Divide',
   region:'North Impact Rampart (1278, 166)',
   px:[1278,166],
   sky:[1006,-164],
   baseElevM:2040.0,
   lakeLevelLocal:null,
   hasOpenLake:false,
   atm:1.240,
   pO2Atm:0.260,
   rhoKgM3:1.451,
   tempC:17.0,
   rainMm:1537,
   wind:[6.8,2.4],
   outflowM3s:0.0,
   shoreDistBaseM:3600.0,
   seepProximity01:0.0,
   strata:{recipe:'secondary-ejecta',range:[-160,180]},
   stacks:[],
   curtainSpans:[],
   thermalPools:[],
   reserves:[]
  }
 };
})();
if(typeof module!=='undefined'&&module.exports)module.exports=SPIDER_SITES;
