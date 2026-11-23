// ================================================================= THE LAKE TOWNS — each town's design row (settlements/xanadu-lake/PLAN.md section 4)
// [G data] XL.SPECS[key], keyed by the town's XAN_TUNE.lake key (its id 'lk.' + key). A row never copies a tune number: the
// people, px, trade, hub and province are read from XAN_TUNE.lake in place (core/region/data/xan-tune.js, on the page as
// gen/89zk-xl-tune.js, in node by require): XL.tune(key). tests/test-xl-towns.js holds every key to a tune record.
//
//   key        the tune key
//   bearing    the plan's direction from the town to open water (degrees; the fit's own, XL.FIT[key].bearing, is what the
//              ground uses: the test holds the two within 45 degrees)
//   shore      the core/coast class at the landing (the region's, read by tools/fit_lake_town.py)
//   wall       {rise: metres to the rim within 7 km (the model's), benches: the terrace benches' count}
//   world      {region, site, R, band, smooth}: the open world's region and site, the footprint and the band
//              (core/world/bake_towns.py), the shore's smoothing (m, default 120: tools/fit_lake_town.py)
//   quarters   [{id, role, share, at}]: share of the houses; at 'shore' | 'slope' | 'bench' | 'stream'
//   landmarks  [{id, key, at}]: the civic set
//   works      [{key, n, at}]: the trade's pieces
//   craft      {dugouts, launches, barges}
//   wealth     [poor, mid, rich] shares of the houses; andean: the share in the Andean set (87b)
//   ruins      null | {...} (Ōlḍ-Thalaba's old quarter)
//   layout     the town's frame (page metres from the landing: x along the shore, d inland of the waterline): the shore road and
//              the contour rows (d), the terrace stairs (x), the market square, the benches ([d0, d1] and their half-length),
//              the stream ({x, drift, to}: its line x + drift * d, up to d = to), the core (the town's own ground: |x| < x,
//              d < d; outside it the region's rest fades in over `fade` m) and the town's half-width
var XL=XL||{};
XL.SPECS={
 mouth:{key:'mouth',bearing:180,
  shore:'sand',   /* the plan proposed shingle; the region's coast field reads sand at the landing (tools/fit_lake_town.py): kept */
  wall:{rise:510,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanmouth01',R:1400,band:600},
  quarters:[{id:'landing',role:'harbour',share:.15,at:'shore'},{id:'market',role:'market',share:.10,at:'shore'},
   {id:'town',role:'residential',share:.50,at:'slope'},{id:'bench',role:'farm',share:.15,at:'bench'},{id:'stream',role:'residential',share:.10,at:'stream'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'temple',key:'xa_temple',at:'shore'},
   {id:'governor',key:'xa_governor',at:'shore'},{id:'market',key:'xa_shops',at:'shore'},{id:'bridge',key:'xa_bridge',at:'stream'}],
  works:[{key:'xa_fish_racks',n:8,at:'shore'},{key:'xa_boatshed',n:4,at:'shore'},{key:'xa_granary',n:1,at:'slope'},{key:'xa_smithy',n:1,at:'slope'},
   {key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:55,launches:2,barges:1},
  stalls:16,
  wealth:[.55,.35,.10],andean:.25,ruins:null,
  layout:{half:470,road:26,rows:[26,92,158,224,290,356],stairs:[-235,0,235],
   market:{x:-150,w:110,d:52},
   benches:[[410,520],[600,710]],benchHalf:560,
   stream:{x:430,drift:.06,to:960},
   core:{x:700,d:760,lake:180,fade:300},
   fields:{rows:9}},
  notes:'The first lake town: the plain pattern the shared target is proved on (mouth/PLAN.md). A quay and landing stair, the fish racks and boat sheds along the beach, the market square with the temple and the governor\'s house by the landing, the town up the 8 % slope in five contour rows, two terrace benches above, the stream\'s ravine at its east edge with a footbridge.'},
 /* step L1: the fishing village left on Thalaba's shore (old-thalaba/PLAN.md): the village in the lowest streets, the old town
    above it standing empty (its roofs and timber carried up to the new Thalaba: open point 1's default, about 440 houses in
    all, the village living in the lowest 110), the old caravan market a ruin; every ruin watched by core/ruins */
 'old-thalaba':{key:'old-thalaba',bearing:180,
  shore:'shingle',   /* the plan's; the fit reads the region's at the landing (XL.FIT['old-thalaba'].coast) */
  wall:{rise:502,benches:2},
  world:{region:'xanadu-north-shore',site:'soldthalaba1',R:1400,band:600,smooth:40},   /* a notch in the shore at the landing: a tight line */
  quarters:[{id:'landing',role:'harbour',share:.20,at:'shore'},{id:'village',role:'residential',share:.50,at:'shore'},
   {id:'temple',role:'civic',share:.15,at:'shore'},{id:'bench',role:'farm',share:.15,at:'bench'},
   {id:'ruins',role:'ruin',share:0,at:'slope',rest:true}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'temple',key:'xa_temple',at:'shore'},
   {id:'serai',key:'xa_serai_ruin',at:'slope',q:'ruins'}],
  works:[{key:'xa_fish_racks',n:4,at:'shore'},{key:'xa_boatshed',n:2,at:'shore'},{key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:25,launches:1,barges:0},
  stalls:0,
  wealth:[.75,.22,.03],andean:.30,
  ruins:{houses:331,quarter:'ruins',note:'the old town of about 440 houses (old Thalaba\'s 2,400 people), less the village\'s 109'},
  layout:{half:620,road:26,rows:[26,92,158,224,290,356,422,488],stairs:[-310,0,310],
   market:null,
   benches:[[560,670],[750,860]],benchHalf:700,
   stream:null,
   core:{x:820,d:900,lake:180,fade:300},
   fields:{rows:9}},
  notes:'A village inside a town too big for it: the fishers in the lower streets by the water, the temple still kept, a quay too long for its boats; above them the empty old town, its houses roofless, the caravan market a ruin.'},
 /* step L1: the dyers' town, the north shore's east end (dyer/PLAN.md): the dye works along the water, the cloth hung down to
    the beach, the dye plants on the benches (kits/crops: what the Vale grows by rain), the fishers at the landing */
 dyer:{key:'dyer',bearing:180,
  shore:'sand',
  wall:{rise:510,benches:2},
  world:{region:'xanadu-north-shore',site:'sxandyer01',R:1400,band:600,smooth:60},   /* its shore jagged (the coast's coves): a tighter line */
  quarters:[{id:'dyes',role:'industry',share:.20,at:'shore'},{id:'landing',role:'harbour',share:.10,at:'shore'},
   {id:'town',role:'residential',share:.45,at:'slope',rest:true},{id:'fields',role:'farm',share:.15,at:'bench'},
   {id:'market',role:'market',share:.10,at:'slope'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'governor',key:'xa_governor',at:'shore'},
   {id:'temple',key:'xa_temple',at:'slope',q:'market'},{id:'market',key:'xa_shops',at:'slope'}],
  works:[{key:'xa_dye_works',n:5,at:'shore'},{key:'xa_fish_racks',n:6,at:'shore'},{key:'xa_boatshed',n:3,at:'shore'},
   {key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:50,launches:2,barges:1},
  stalls:12,
  wealth:[.55,.35,.10],andean:.25,ruins:null,
  layout:{half:520,road:40,rows:[40,106,172,238,304,370],stairs:[-250,0,250],
   market:{x:140,w:100,d:48,d0:114},
   benches:[[450,560],[640,750]],benchHalf:600,
   stream:null,
   core:{x:760,d:820,lake:180,fade:300},
   fields:{rows:9,bucket:'dye',biome:'xanadu'}},
  notes:'Colour on the shore: five dye works along the water with their vats and cloth on lines down to the beach, the fishers\' racks and sheds beyond them, the market and the temple a row up the slope, the dye plants on the two benches.'},
 /* step L2, Phēr's north-west round (its sites added to openworld/SITES.json, the region re-cut): */
 /* the cacao town on the bend (cocoa/PLAN.md): the fermentaries by the landing, the drying floors up the slope, the cacao
    groves under their shade trees on the benches (the kit's orchard plots); Qōqō takes the bend's west side (open point 1) */
 cocoa:{key:'cocoa',bearing:180,shore:'sand',wall:{rise:548,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanlkcocoa01',R:1400,band:600},
  quarters:[{id:'landing',role:'harbour',share:.10,at:'shore'},{id:'ferment',role:'industry',share:.15,at:'shore'},
   {id:'town',role:'residential',share:.45,at:'slope',rest:true},{id:'groves',role:'farm',share:.20,at:'bench'},{id:'market',role:'market',share:.10,at:'slope'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'governor',key:'xa_governor',at:'shore'},
   {id:'temple',key:'xa_temple',at:'slope',q:'market'},{id:'market',key:'xa_shops',at:'slope'}],
  works:[{key:'xa_fermentary',n:4,at:'shore'},{key:'xa_fish_racks',n:6,at:'shore'},{key:'xa_boatshed',n:3,at:'shore'},
   {key:'xa_farm',n:4,at:'slope'},{key:'xa_wayside_shrine',n:3,at:'bench'}],
  craft:{dugouts:50,launches:3,barges:1},stalls:12,
  wealth:[.50,.38,.12],andean:.25,ruins:null,
  layout:{half:600,road:36,rows:[36,102,168,234,300,366,432],stairs:[-300,0,300],
   market:{x:-150,w:100,d:48,d0:108},
   benches:[[520,630],[710,820]],benchHalf:680,stream:null,
   core:{x:820,d:880,lake:180,fade:300},
   fields:{rows:9,orchard:true,crop:'cacao',colour:'green',plot:0}},
  notes:'The cacao town on the bend: the fermentaries and the fishers\' racks along the beach, the drying floors a row up, the market and the temple above them, the cacao groves under their shade trees on the two benches.'},
 /* the net-makers' town on its point (net/PLAN.md): the net lofts and their frames along the beach, the racks on the point */
 net:{key:'net',bearing:225,shore:'shingle',wall:{rise:532,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanlknet01',R:1400,band:600,smooth:35},   /* its point between two bays: a tight line */
  quarters:[{id:'point',role:'harbour',share:.20,at:'shore'},{id:'lofts',role:'industry',share:.20,at:'shore'},
   {id:'town',role:'residential',share:.45,at:'slope',rest:true},{id:'market',role:'market',share:.10,at:'slope'},{id:'bench',role:'farm',share:.05,at:'bench'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'governor',key:'xa_governor',at:'shore'},
   {id:'temple',key:'xa_temple',at:'slope',q:'market'},{id:'market',key:'xa_shops',at:'slope'}],
  works:[{key:'xa_net_loft',n:6,at:'shore'},{key:'xa_fish_racks',n:8,at:'shore'},{key:'xa_boatshed',n:4,at:'shore'},
   {key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:55,launches:2,barges:1},stalls:10,
  wealth:[.60,.32,.08],andean:.30,ruins:null,
  layout:{half:540,road:36,rows:[36,102,168,234,300,366],stairs:[-260,0,260],
   market:{x:150,w:90,d:46,d0:108},
   benches:[[440,550],[630,740]],benchHalf:620,stream:null,
   core:{x:780,d:820,lake:180,fade:300},
   fields:{rows:9}},
  notes:'Net frames everywhere: the net lofts with their nets hung to dry along the beach, the racks and sheds beyond them, the town up behind the point.'},
 /* the silk town at the Qol Siṭrīm's mouth (mulberry/PLAN.md): the river 2 km west of the pin, outside the footprint, so the
    river's quarter (the reeling houses, the watermills) and the road's (the han, the market) stand on the town's west edge,
    toward it (layout.side); the mulberry plots and the rearing houses on the benches */
 mulberry:{key:'mulberry',bearing:180,shore:'marsh',wall:{rise:495,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanlkmulberry01',R:1400,band:600,smooth:70},
  quarters:[{id:'river',role:'industry',share:.20,at:'stream'},{id:'landing',role:'harbour',share:.10,at:'shore'},
   {id:'town',role:'residential',share:.40,at:'slope',rest:true},{id:'groves',role:'farm',share:.20,at:'bench'},{id:'road',role:'market',share:.10,at:'stream'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'governor',key:'xa_governor',at:'shore'},
   {id:'han',key:'xa_caravanserai',at:'stream',q:'road'},{id:'bridge',key:'xa_river_span',at:'stream'},{id:'temple',key:'xa_temple',at:'slope'},
   {id:'market',key:'xa_shops',at:'stream'}],
  works:[{key:'xa_reeling_house',n:6,at:'stream'},{key:'xa_watermill',n:2,at:'stream'},{key:'xa_workshop',n:8,at:'bench'},
   {key:'xa_fish_racks',n:8,at:'shore'},{key:'xa_boatshed',n:4,at:'shore'},{key:'xa_wayside_shrine',n:3,at:'bench'}],
  craft:{dugouts:70,launches:2,barges:2},stalls:12,
  wealth:[.50,.38,.12],andean:.25,ruins:null,
  layout:{half:700,road:30,rows:[30,106,182,258,334,410,486],stairs:[-420,-140,140,420],side:'west',
   market:{x:-560,w:100,d:48,d0:118},
   benches:[[580,700],[780,900]],benchHalf:760,stream:null,
   core:{x:900,d:960,lake:180,fade:300},
   fields:{rows:9,orchard:true,crop:'mulberry',colour:'green',plot:1}},
  notes:'The north-west\'s largest town, on the flattest shore: the reeling houses, the watermills, the han and the market on its west edge toward the Qol Siṭrīm, the town up the gentle slope, the mulberry plots and the rearing houses on the benches.'},
 /* the honey town at the lake's north-west end (hive/PLAN.md): the apiaries in rows on the benches, the honey houses by the landing */
 hive:{key:'hive',bearing:180,shore:'shingle',wall:{rise:495,benches:2},
  world:{region:'xanadu-north-shore',site:'sxanlkhive01',R:1400,band:600},
  quarters:[{id:'landing',role:'harbour',share:.10,at:'shore'},{id:'town',role:'residential',share:.50,at:'slope',rest:true},
   {id:'hives',role:'farm',share:.20,at:'bench'},{id:'market',role:'market',share:.10,at:'shore'},{id:'fishers',role:'residential',share:.10,at:'shore'}],
  landmarks:[{id:'ghat',key:'xa_ghat',at:'shore'},{id:'quay',key:'xa_quay',at:'shore'},{id:'temple',key:'xa_temple',at:'shore'},
   {id:'governor',key:'xa_governor',at:'shore'},{id:'market',key:'xa_shops',at:'shore'}],
  works:[{key:'xa_workshop',n:3,at:'shore'},{key:'xa_fish_racks',n:5,at:'shore'},{key:'xa_boatshed',n:3,at:'shore'},
   {key:'xa_apiary',n:12,at:'bench'},{key:'xa_wayside_shrine',n:2,at:'bench'}],
  craft:{dugouts:40,launches:2,barges:1},stalls:10,
  wealth:[.55,.35,.10],andean:.30,ruins:null,
  layout:{half:500,road:30,rows:[30,96,162,228,294,360],stairs:[-250,0,250],
   market:{x:-160,w:100,d:48},
   benches:[[440,560],[640,760]],benchHalf:580,stream:null,
   core:{x:740,d:820,lake:180,fade:300},
   fields:{rows:9}},
  notes:'A low, sunny town on a gentle shore: the honey houses and the racks by the landing, the market with the temple and the governor\'s house, the apiaries in rows on the benches.'}};
// the town's tune record (XAN_TUNE.lake), read in place
XL.tune=key=>(typeof XAN_TUNE!=='undefined'&&XAN_TUNE.lake||[]).find(L=>L.key===key)||null;
// the town's household size: the tune's (T.farm.hh, people a household), read in place
XL.HH=(typeof XAN_TUNE!=='undefined'&&XAN_TUNE.farm)?XAN_TUNE.farm.hh:null;
// the houses the tune's people make: one a household
XL.households=key=>{const L=XL.tune(key);return L?Math.round(L.people/XL.HH):0;};
// the town the page draws: ?town=<key>, else the first built
XL.DEFAULT='mouth';
XL.pick=function(){let k=null;try{if(typeof location!=='undefined')k=new URLSearchParams(location.search).get('town');}catch(e){}return k&&XL.SPECS[k]?k:XL.DEFAULT;};
