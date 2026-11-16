// ================================================================= HIGH RIFT — the five stations' sites (PLAN.md sections 1 and 4)  [G data]
// Scale model 5.1, surveyed 2026-11-03 (tools/scale-model/model/data through smodel/page.py). Each page is a 5.2 km ideal type (R 2600 m) of its zone:
// it takes the model's numbers (heights, the climate, the water's levels), not its pixels. Page metres: x east, z south, origin the page's centre.
// px: the 5.1 canvas (old canvas = minus 272, 330); world: the geology's frame (x = px * 2000, z = py * 2000). sky: the old canvas px the shared sky
// (ATMOS.skyBiome) is placed by. Plain data: no THREE, no DOM; the stage (45-host-stage.js) draws the land from these records.
var HRIFT_SITES={
 // ZONE 1: the Opaline Sinter Staircase and the Caldron Pool. Verdigris Beck drops 283 m from the pinch (2,863 m) into the pool (the model's points
 // 58-60); the page draws Gemini's 180 m in four tiers (PLAN.md section 11, item 2). Brant-Fell Gill comes in from the south-east; the outlet spills
 // south-west over the rimstone steps; a geyser on the steps (vent 88's kind, brought onto the page)
 cataract:{key:'cataract',name:'The Caldron and the Opaline Cataract',zone:1,px:[1358,1661],world:[2716000,3322000],sky:{px:1086,py:1331},
  base:2580,atm:1.16,koppen:'Cfb',rain:400,temp:{mean:8,warm:20,cold:-6,low:-14},soil:6,snow:[2700,3200],
  pool:{x:0,z:120,r:330,level:2580,depth:26},
  cataract:{from:[1700,-1500],to:[230,-190],tiers:[2760,2712,2668,2622],gorge:2900,lip:2760},
  gill:{from:[2400,1500],to:[260,330],y0:2617,y1:2581,w:16},
  outlet:{from:[-290,330],to:[-2350,1500],levels:[2577,2573,2569,2564,2559,2554,2549,2543,2537,2531,2525,2519,2513],edge:2490},
  geyser:{x:-1150,z:1150,T:96,reach:170,H:28,period:260,style:'cone'},
  vents:[{x:0,z:120,T:97,reach:520,decay:2.4},{x:-1150,z:1150,T:96,reach:170},{x:380,z:-20,T:88,reach:90},{x:-420,z:-60,T:84,reach:80}]},
 // ZONE 2: the North Mirror Graben at Lake Verdigris's north shore (2,880 m). The master fault's mirror runs east-west across the page's north; the lake
 // fills the south half; vent 89 is in the lake (the boiling patch); a geyser and the acid springs on the shore's sinter apron
 mirror:{key:'mirror',name:'The Mirror: Lake Verdigris under the fault mirror',zone:2,px:[1430,1630],world:[2860000,3260000],sky:{px:1158,py:1300},
  base:2880,atm:1.12,koppen:'Dfb',rain:439,temp:{mean:12,warm:25,cold:-1,low:-12},soil:8,snow:[3050,3500],
  lake:{shore:260,level:2880,depth:40},
  fault:{z:-1150,h:240,dip:1.6,above:3260},
  patch:{x:650,z:1600,r:110},
  geyser:{x:-950,z:140,T:95,reach:160,H:22,period:200,style:'fountain'},
  springs:[[-640,130,26],[-560,200,18],[-760,60,14],[140,190,20]],
  vents:[{x:650,z:1600,T:99,reach:300},{x:-950,z:140,T:95,reach:160},{x:-640,z:130,T:80,reach:90},{x:140,z:190,T:72,reach:60}]},
 // ZONE 3: the Dorsal Wedge, the median horst's crest at 4,200 m; the Mirror Graben 1.2 km down north, the Coulee 0.95 km down south (the far field)
 wedge:{key:'wedge',name:'The Dorsal Wedge',zone:3,px:[1457,1660],world:[2914000,3320000],sky:{px:1185,py:1330},
  base:4200,atm:.95,koppen:'ET',rain:220,temp:{mean:0,warm:13,cold:-13,low:-24},soil:-1,snow:[4150,4500],
  north:3010,south:3240,
  tors:[[-900,-120,260,55],[700,80,300,70],[1900,-60,220,45]],tarn:[200,420,46],hollows:[[-1500,300,250],[-200,-500,220],[1300,520,260],[-700,700,200],[200,420,170]],
  cairns:[[-60,0,2.0],[1200,-30,1.6],[-1800,20,1.4]],
  vents:[]},   /* the horst is cold: no vent on the crest */
 // ZONE 4: the South Fire-and-Ice Coulee at 3,240 m: old coulee lobes cut by Brant-Fell Gill's outburst channel (flowing west), vent 90 at the page's east
 coulee:{key:'coulee',name:'The Coulee: fire and ice',zone:4,px:[1452,1684],world:[2904000,3368000],sky:{px:1180,py:1354},
  base:3240,atm:1.07,koppen:'Dwc',rain:345,temp:{mean:9,warm:23,cold:-3,low:-15},soil:4,snow:[3300,3800],
  gill:{z:260,w:460,bed:-14,y0:3262,y1:3226,flow:22},
  lobes:[[-1700,-900,700,24],[-600,-1100,820,30],[700,-800,760,26],[1800,-1200,650,22],[-1300,1300,700,20],[200,1350,820,28],[1600,1250,600,18]],
  wall:{z:1900,h:2800},
  geyser:{x:1950,z:180,T:96,reach:180,H:24,period:240,style:'cone'},
  vents:[{x:1950,z:180,T:96,reach:180},{x:1700,z:420,T:70,reach:120}]},
 // ZONE 5: the Singing Gjár at 3,700 m: the master gjá strikes NNW-SSE through the centre (the sculpt's trace: x = x0 + 0.28 (py - 1315) old px, so it
 // runs south-south-east; Gemini's docstring says NNE-SSW, the code is followed), 310 m deep, 300-600 m wide at the lip; the swarm of narrow tension
 // fissures en echelon beside it, the singing ones; vent 91 at the swarm's north-east end; Verdigris Beck rises in the gjá's floor
 gjar:{key:'gjar',name:'The Singing Gjár',zone:5,px:[1572,1643],world:[3144000,3286000],sky:{px:1300,py:1313},
  base:3700,atm:1.01,koppen:'Dsb',rain:220,temp:{mean:2,warm:15,cold:-11,low:-21},soil:0,snow:[3750,4200],
  strike:[.27,.963],master:{off:0,w:420,depth:310,floor:3392,pool:3394},
  swarm:[[-760,-1500,1300,14,34],[-560,-500,1500,22,48],[-420,700,1200,12,26],[520,-1300,1400,18,40],[700,-150,1600,30,58],[880,1100,1300,12,30],[-1250,200,1100,10,22],[1350,500,1200,10,28],[-950,-1100,900,10,18],[1150,-700,1000,16,36]],
  geyser:{x:1650,z:-1250,T:95,reach:170,H:20,period:300,style:'cone'},
  vents:[{x:1650,z:-1250,T:95,reach:200},{x:1450,z:-1050,T:78,reach:110}]}};
// THE SOUND (PLAN.md section 8): each station's sources as records for core/audio (not yet in core: data only, exported with the page). Positions are
// page metres; band [lo, hi] Hz; a resonance's f from the physics the plan gives (a crack L deep: c / 4L, c 325 m/s; a blade d thick: 0.2 v / d)
var HRIFT_SOUND={
 cataract:[{id:'cataract',kind:'roar',at:[600,2700,-620],band:[200,4000],tiers:4,tremor:[12,20]},{id:'spray-hiss',kind:'sizzle',at:[300,2585,-100],band:[3000,8000],when:'spray on ground over 60 degC'},
  {id:'caldron-simmer',kind:'simmer',at:[0,2580,120],band:[80,600],bursts:[2,15]},{id:'terraces',kind:'trickle',along:'outlet',band:[1000,3000]},{id:'geyser',kind:'geyser',source:'WATER.geyser'}],
 mirror:[{id:'patch-simmer',kind:'simmer',at:[650,2880,1600],band:[80,600],bursts:[2,15]},{id:'springs',kind:'simmer',at:[-640,2881,130],band:[200,1200],bursts:[4,20]},{id:'geyser',kind:'geyser',source:'WATER.geyser'},
  {id:'lap',kind:'lap',along:'shore',band:[300,1500]}],
 wedge:[{id:'wind',kind:'wind',band:[60,2000],gust:true}],
 coulee:[{id:'gill',kind:'stream',along:'gill',band:[300,3000]},{id:'geyser',kind:'geyser',source:'WATER.geyser'},{id:'sizzle',kind:'sizzle',at:[1950,3240,180],band:[3000,8000]}],
 gjar:[{id:'gja-infra',kind:'drone',at:[0,3550,0],f:.26,note:'the master gja, a 310 m slot closed below: c/4L, felt not heard'},
  {id:'fissure-pipes',kind:'resonance',along:'swarm',f:[30,60],q:[8,20],drive:'wind across the crack (its bearing against the wind)'},
  {id:'crystal-blades',kind:'aeolian',along:'combs',f:[40,300],q:[20,40],drive:'0.2 v / d: blades 1-5 cm in 10-15 m/s'},{id:'geyser',kind:'geyser',source:'WATER.geyser'}]};
