// ================================================================= SIPHON PITS — the four stations' layouts (PLAN.md sections 0, 3 and 7)  [G data]
// Each page is a 5.2 km ideal type (R 2600 m) of its station: it takes the model's numbers (SIPHON_STATIONS, the survey's records that build.py inlines
// from stations/*/station.json: heights, pressure by the air law, the temperatures, rain, class, wind), not its pixels. Page metres: x east, z south,
// the origin the station's point (its height is the record's base). Plain data: no THREE, no DOM; the stage (45) draws the land from these records.
var SIPHON_SITES=(function(){const S=SIPHON_STATIONS,o=(k,lay)=>Object.assign({key:k,zone:{terraces:1,scarp:2,pitfloor:3,arete:4}[k]},S[k],{temp:{mean:S[k].mean,warm:S[k].warm,cold:S[k].cold,high:S[k].high,low:S[k].low}},lay);
 return{
 // STATION 1: the Ostrukh Terraces. The graben's floor at 2,157 m (level within 16 km on the model), falling gently east; the braided meltwater from the
 // Stalker glaciers running west to east through the middle on a cobble bed (KRELIEF.wadi's bars); loess terraces up both sides, the north-facing
 // (sunward, 28 degrees south) side the broad one; farmsteads on the terrace edges; dwarf blue willow along the channels
 terraces:o('terraces',{sky:{px:1247,py:1123},snow:[3400,3900],soil:-1,
  chan:{z0:-150,amp:90,wave:.0011,w:110,bank:1.6,braids:3,braidW:22},
  terr:{rise:2.4,riser:.22,band:[10,180],field:60},
  sides:{south:[180,250,2300],north:[120,350,2500]},
  farms:[[-900,760,46],[350,900,40],[1380,660,44],[-1650,-980,38],[950,-1120,42],[-200,-1350,36]],
  willow:[5,42],
  vents:[]}),
 // STATION 2: the Scarp Pass. The Ostrukh Wall (the central dividing fault, SSW-NNE) with the plateau east 1,650 m over the lowland; one ravine notched
 // into it with its scree fan, the caravan road switchbacking up the fan and the ravine; the station on the road at 3,289 m. Frost polygons on the
 // plateau and the lowland, solifluction lobes on the fan. No trees
 scarp:o('scarp',{sky:{px:1287,py:1127},snow:[3700,4300],soil:-3,
  wall:{dir:[.39,-.92],rim:420,shift:1071,h:1850,run:1150,floor:2420,benches:3},
  ravine:{w:150,head:260,depth:150,fan:{r:700,h:60}},
  road:{start:[-1900,-220],fan:[-760,0],t0:-700,t1:380,legs:16,amp:45,top:[420,0],end:[1750,120]},   /* in the wall's frame: t metres east along n (the rim at t 420), a along the wall */
  frost:{cell:12,lobes:28},
  toll:{t:-560,a:-120,r:28},beacons:[3,7,11,15],   /* the tollhouse under the ravine's wall by the fan; beacon baskets at these switchback corners */
  vents:[]}),
 // STATION 3: the Siphon Maar Floor. A maar 420 m deep (KRELIEF.stepcut: three sheer risers and two benches) sunk in the floor of the sink (the
 // sink's floor 2,697 m here, its shoulders the plateau 8-16 km out); the floor flat at 2,277 m; the diatreme's vent a geyser (the model's vent kind
 // 3 px off, brought onto the page), fumaroles and mud pots; the amber deck to 2,580 m; the roper camp by the wall
 pitfloor:o('pitfloor',{sky:{px:1415,py:1225},snow:[5200,5800],soil:16,
  maar:{r:1500,steps:3,tread:36,riser:6,warp:70},
  geyser:{x:320,z:-260,T:96,reach:260,H:26,period:280,style:'cone'},
  fumaroles:[[-420,-520,88,140],[640,380,84,120],[-180,610,80,110],[90,-860,86,130]],
  mud:[[460,-120,14],[230,-420,11],[-520,-380,12],[700,260,10]],
  camp:{x:-760,z:560,r:130},
  geode:{x:-1000,z:-1020,face:Math.PI*.25},
  treeCap:250,
  vents:null}),
 // STATION 4: the Arete Way. The basalt plateau at 4,269 m between two coalescing pits 420 m deep (floors 3,850 m), their rims meeting 6 m apart at the
 // page's centre for a few hundred metres either way: the knife-edge the caravan trail crosses on iron stanchions and chains; the rim gantry over the
 // south pit; the flensers' lairs under the rims. The blizzard. No trees
 arete:o('arete',{sky:{px:1406,py:1212},snow:[3900,4400],soil:-6,
  pits:[{c:[0,-1253],rx:2000,rz:1250},{c:[0,1253],rx:2000,rz:1250}],floor:3850,
  crest:[-640,640],stanchion:6,
  gantry:{x:-430,side:1},
  lairs:[[-260,1],[180,-1],[520,1],[-560,-1],[880,-1]],
  vents:null})};})();
// THE TREE RULE (PLAN.md section 5): a station's cap on the trees it may stand (null: no cap); the counts the build keeps and verify asserts
var SIPHON_TREECAP={terraces:null,scarp:0,pitfloor:250,arete:0};
// THE SOUND: each station's sources as records for core/audio (not in core yet: data only, exported with the page), highrift's form
var SIPHON_SOUND={
 terraces:[{id:'braids',kind:'stream',along:'braids',band:[300,3000]},{id:'wind',kind:'wind',band:[60,1500],gust:false}],
 scarp:[{id:'wind',kind:'wind',band:[60,2500],gust:true},{id:'rockfall',kind:'rattle',along:'ravine',band:[400,4000],when:'thaw'}],
 pitfloor:[{id:'geyser',kind:'geyser',source:'WATER.geyser'},{id:'mud',kind:'bubble',along:'mud',band:[60,400]},{id:'chimneys',kind:'drone',along:'trees',f:[8,30],note:'each woolly siphon a pipe: c / 2L for a 20-30 m open chimney, felt more than heard'}],
 arete:[{id:'gale',kind:'wind',band:[40,3000],gust:true},{id:'chains',kind:'clank',along:'stanchions',band:[800,5000],when:'gust'}]};
