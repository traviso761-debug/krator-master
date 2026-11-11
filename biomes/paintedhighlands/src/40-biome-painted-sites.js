// ================================================================= PAINTED HIGHLANDS — the four stations' sites (PLAN.md sections 1, 2, 5a and 7)  [G data]
// Scale model 5.1, read 2026-11-09 (smodel.page at gemini/scale-model-5.1-r3). Each page is a 5.2 km ideal type (R 2600 m) of its place: it takes the
// model's numbers (heights, the climate, the water's levels), not its pixels. Page metres: x east, z south, origin the page's centre.
// px: the 5.1 canvas; world: the geology's frame (x = px * 2000, z = py * 2000); sky: the old canvas px (5.1 px minus 272, 330) the shared sky
// (ATMOS.skyBiome) is placed by. Plain data: no THREE, no DOM; the stage (45-host-stage.js) draws the land from these records.
//
// THE ROCK (PLAN.md section 2): one stack a station on KSTRATA, `badland` (thin soft clays and ash beds) under `danxia` (thick hard red sandstones),
// folded NNW-SSE (Gemini's hogbacks: a wave of 10 km, +-165 m). strata.formations are KSTRATA.create's (bottom to top); the stage adds the seed.
// The cliff town's wall (station 4) needs the sandstone-over-clay contact more than once up its 2.2 km: the basin fill there interfingers (lake clays
// between fluvial sandstones), four packets, each contact a seep line (PLAN.md section 5a; the choice is recorded in PLAN.md section 9).
var PAINTED_STRIKE=[-.3827,-.9239];   /* NNW: the hogbacks' strike, a unit vector (x east, z south); across it, ENE: [.9239, -.3827]. A row of fins is given in (u across, v along) */
var PAINTED_SITES={
 // STATION 1: the stripe badlands. A hogback's danxia scarp facing east over the breached fold's core: rounded banded badland hills cut by rills,
 // a dry wash down the strike valley (the bloom on its floor), fins and hoodoos of the sandstone standing out on the clay below the scarp
 stripes:{key:'stripes',name:'The stripe badlands',n:1,px:[986,635],world:[1972000,1270000],sky:{px:714,py:305},
  base:2926,atm:1.11,koppen:'BSk',rain:157,temp:{mean:11,warm:21,cold:0,low:-14},snow:[3250,3700],
  strata:{formations:[{recipe:'badland',base:2300,top:2830},{recipe:'danxia',top:3800}],range:[2300,3800],fold:{wl:10000,amp:165,sharp:.2,crest:2600},warp:[3,1]},
  scarp:{u:350,cap:110,h:150,w:150},valley:{floor:2862,hills:58,cell:150},wash:{u:1350,w:10,bank:2.2},
  fins:[{u:[720,820],v:[-2000,-800],n:5,H:[18,42]},{u:[640,720],v:[300,1600],n:6,H:[14,36]},{u:[1050,1150],v:[-700,500],n:4,H:[30,52]}]},
 // STATION 2: the bloom flats. The playa at 3,393 m, flat to 31 m over 6 km, in a syncline; a banded hogback scarp to its west; the mud cracked after
 // the melt; stone circles on its rim; a pigment pit dug into the teal bed
 bloom:{key:'bloom',name:'The bloom flats',n:2,px:[1008,626],world:[2016000,1252000],sky:{px:736,py:296},
  base:3393,atm:1.06,koppen:'Dsb',rain:173,temp:{mean:9,warm:22,cold:-4,low:-17},snow:[3600,4000],
  strata:{formations:[{recipe:'badland',base:2900,top:3420},{recipe:'danxia',top:4200}],range:[2900,4200],fold:{wl:10000,amp:165,sharp:.2,crest:-2500},warp:[3,1]},
  playa:{x:300,z:250,rx:1700,rz:1150,level:3393,rise:.018},scarp:{u:-1500,cap:60,h:130,w:140},
  circles:[[-700,-760,16,13],[1500,-700,11,9],[1900,1100,13,11]],pit:{x:-1150,z:520,r:26,depth:7},
  fins:[{u:[-1440,-1400],v:[-1600,-300],n:4,H:[32,50]}]},
 // STATION 3: the banded canyon. The Painted Canyon at px 1034,615: floor 2,900 m, rims 3,253-3,411 m (560-580 m deep), cut through the whole
 // column; a mid-wall bench at the contact; junipers on the ledges; the melt stream on its floor and the flood's marks
 canyon:{key:'canyon',name:'The banded canyon',n:3,px:[1034,615],world:[2068000,1230000],sky:{px:762,py:285},
  base:2900,atm:1.12,koppen:'BSk',rain:125,temp:{mean:10,warm:23,cold:-2,low:-16},snow:[3500,3900],
  strata:{formations:[{recipe:'badland',base:2600,top:3080},{recipe:'danxia',top:3900}],range:[2600,3900],fold:{wl:10000,amp:120,sharp:.2,crest:900},warp:[3,1]},
  canyon:{rimN:3330,rimS:3253,floor:2900,floorW:150,lipW:1500,bench:3080,benchW:110,flow:2902,w:7,drop:30},
  floodMark:2.4},
 // STATION 4: the cliff town's wall (section 5a, site 1). The canyon's mouth over Korona's moat: the north-facing wall from ~1.5 km at its foot to the
 // rim (3,406 m at px 1104,626), 2,224 m of relief within 6 km; the station at 2,061 m on the wall. Tiers of sandstone cliffs, each over a clay bench:
 // the alcoves at the contact (the seep line), the ledges and talus benches below them, all EMPTY for the settlement plan to fill
 cliff:{key:'cliff',name:'The cliff town\'s wall',n:4,px:[1101,624],world:[2202000,1248000],sky:{px:829,py:294},
  base:2061,atm:1.24,koppen:'Cfa',rain:862,temp:{mean:17,warm:27,cold:6,low:-5},snow:[3600,4200],
  strata:{formations:[{recipe:'badland',base:1100,top:1640},{recipe:'danxia',top:1840},{recipe:'badland',top:1990},{recipe:'danxia',top:2190},
   {recipe:'badland',top:2320},{recipe:'danxia',top:2560},{recipe:'badland',top:2700},{recipe:'danxia',top:3500}],range:[1100,3500],dip:[0,1,.004],warp:[2,.8]},
  /* the wall's profile, north (z -2600) to south (+2600): the foot at 1,320 m by the lake's fan, then each tier a clay bench under a sandstone cliff */
  foot:1320,rim:3380,tiers:[{z:-1300,top:1840},{z:150,top:2190},{z:1100,top:2560},{z:2150,top:3380}],
  lake:{level:516,x:-9500,z:-4500,r:4500}}};   /* the canyon's mouth lake (80 km2 on 5.1) west of the wall's foot, under the far field */
// THE HAZARDS (PLAN.md section 6): the kinds the stations register on core/hazard (KHAZ); the host places them from the land (89z)
var PAINTED_HAZ={
 flood:{kind:'drown',danger:.9,note:'a flash flood down the wash or the canyon after the melt and the summer storms: the roar, a brown wall',cycle:{period:1800,warn:60,ramp:20,on:240}},
 clay:{kind:'slip',danger:.35,note:'the bentonite clay is slick when wet and sticky when soaked: a dark sheen on the slope'},
 mud:{kind:'sink',danger:.3,note:'the playa\'s mud after the melt: slow going'},
 cliff:{kind:'fall',danger:.9,note:'the danxia scarps and the canyon walls'},
 rockfall:{kind:'crush',danger:.6,note:'fresh rock at a cliff\'s foot: the sandstone spalls off the clay'}};
