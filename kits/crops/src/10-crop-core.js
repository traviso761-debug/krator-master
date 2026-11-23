/* ==================== the Crops kit: the axes, the buckets, the biomes (plain data, [G data]) ==================== */
/* kits/crops/PLAN.md. No three.js, no DOM: this runs in Godot. The records are in 20-24; the queries in 40. */
globalThis.CROPS = globalThis.CROPS || {version: 1};

/* the three axes, as ordered bands; a range is [lo, hi] as indices into its list */
CROPS.WARMTH = ['polar', 'cool', 'temperate', 'subtropic', 'tropic', 'hot'];
CROPS.ATM = ['thin', 'standard', 'dense'];                         /* thin < 0.8 atm; standard 0.8-1.3; dense 1.3-2.0 ('thick' aliases to 2) */
CROPS.ATM_ALIASES = {thick: 2};
CROPS.ARID = ['arid', 'semiarid', 'subhumid', 'humid', 'wet'];     /* the biome kits' own tags, plus 'wet' */

/* a bucket is what a recipe or a store asks for; a group is one level up (PLAN.md section 3) */
CROPS.BUCKETS = {
  grain:        {group: 'staple',      what: 'millable seed'},
  pulse:        {group: 'staple',      what: 'dry bean, pea, groundnut'},
  tuber:        {group: 'staple',      what: 'root, corm, rhizome starch'},
  'starch-fruit': {group: 'staple',    what: 'fruit eaten as the carbohydrate'},
  nut:          {group: 'protein-fat', what: 'tree nut, shelled'},
  oil:          {group: 'protein-fat', what: 'pressed for oil'},
  alga:         {group: 'protein-fat', what: 'pressed or dried algae'},
  vegetable:    {group: 'produce',     what: 'stalk, pod, fruit-veg, shoot'},
  greens:       {group: 'produce',     what: 'leaf and frond'},
  mushroom:     {group: 'produce',     what: 'cultivated fungus eaten whole'},
  fruit:        {group: 'produce',     what: 'fresh tree or vine fruit, sweet'},
  berry:        {group: 'produce',     what: 'small soft fruit, dried or jammed'},
  'dried-fruit': {group: 'produce',    what: 'fruit that is mostly kept dried'},
  spice:        {group: 'flavour',     what: 'seed, bark, bud, rind'},
  herb:         {group: 'flavour',     what: 'leaf for cooking and medicine'},
  sweetener:    {group: 'flavour',     what: 'sugar and syrup'},
  beverage:     {group: 'drink',       what: 'steeped, brewed or pressed to drink'},
  spinning:     {group: 'material',    what: 'cloth thread'},
  cordage:      {group: 'material',    what: 'rope and bast'},
  weaving:      {group: 'material',    what: 'mats, baskets, withies'},
  sheet:        {group: 'material',    what: 'felt, paper, membrane'},
  thatch:       {group: 'material',    what: 'roofing'},
  dye:          {group: 'utility',     what: 'pigment and colour'},
  reagent:      {group: 'utility',     what: 'alchemical ingredient'},
  fuel:         {group: 'utility',     what: 'burned or carried for light and heat'},
  medicine:     {group: 'utility',     what: 'taken for illness and wounds'}   /* reserved in PLAN.md; opened for necanyons' rimdew (2026-10-19) */
};

/* The biome kits as zones on the axes. atm is set from the notes where they record a pressure (ehighlands 0.6, crater drylands
   and geyser 1.9, shighlands ~1.0) and the dense-air basins; the rest is inferred and says so ('?'): correct it here.
   A zone is {warmth:[lo,hi], arid:[lo,hi]}; wet:true means standing water is near (a paddy, an aquatic crop). */
CROPS.BIOMES = {
  'crater-drylands': {atm: 2, zones: {scrub: {warmth: [4, 5], arid: [0, 1]}, seep: {warmth: [4, 5], arid: [2, 3], wet: true}}},
  eastabyss:   {atm: 2, atmNote: '?', zones: {jungle: {warmth: [4, 4], arid: [3, 4]}, marsh: {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}, flats: {warmth: [4, 5], arid: [0, 1], salt: true}}},
  ebadlands:   {atm: 1, atmNote: '?', zones: {basin: {warmth: [3, 5], arid: [0, 1]}, valley: {warmth: [2, 3], arid: [1, 2]}, rim: {warmth: [0, 1], arid: [1, 2], atm: 0}}},
  ehighlands:  {atm: 0, zones: {puna: {warmth: [0, 1], arid: [1, 2]}, bog: {warmth: [0, 1], arid: [3, 3], wet: true}}},
  geyser:      {atm: 2, zones: {warmground: {warmth: [4, 5], arid: [3, 4], heated: true}, basin: {warmth: [4, 4], arid: [3, 4], wet: true}}},
  necanyons:   {atm: 2, atmNote: '?', zones: {floor: {warmth: [4, 4], arid: [3, 4]}, seep: {warmth: [4, 4], arid: [3, 4], wet: true}, bench: {warmth: [4, 4], arid: [2, 3]}, cap: {warmth: [4, 5], arid: [0, 1]}}},
  hyperjungle: {atm: 2, zones: {forest: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  nhighlands:  {atm: 1, atmNote: '?', zones: {low: {warmth: [2, 2], arid: [3, 3]}, high: {warmth: [0, 1], arid: [2, 3]}}},
  /* the painted highlands (biomes/paintedhighlands/PLAN.md section 4, 2026-11-11): the plateau's cold steppe at 3-3.5 km and its high half (231 mm),
     the lower plateau (455 mm), the washes and the canyon floor on the melt, the cliff towns' ledge gardens (800 mm, Cfa). 1.0-1.24 atm */
  paintedhighlands: {atm: 1, zones: {steppe: {warmth: [2, 2], arid: [0, 0]}, high: {warmth: [1, 1], arid: [0, 0]}, lower: {warmth: [2, 2], arid: [1, 1]},
                wash: {warmth: [2, 2], arid: [0, 1], wet: true}, ledge: {warmth: [3, 3], arid: [2, 2]}}},
  nwbay:       {atm: 2, atmNote: '?', zones: {shore: {warmth: [3, 4], arid: [2, 3]}, wetland: {warmth: [3, 4], arid: [3, 4], wet: true}}},
  /* the NW lowlands (biomes/nwlowlands/NOTES.md): rainforest strip with paperbark swamps and lotus ponds (~1.55 atm), humid-subtropical
     lake/canal plain (~1.44 atm), Cfa piedmont benches and summer-dry Mediterranean foothills rising toward the Inner Wall (standard air) */
  nwlowlands:  {atm: 1, zones: {strip: {warmth: [4, 4], arid: [3, 4], wet: true, atm: 2}, plain: {warmth: [3, 3], arid: [2, 3], wet: true, atm: 2},
                bench: {warmth: [2, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  rift:        {atm: 1, atmNote: '?', zones: {lake: {warmth: [3, 4], arid: [0, 1], wet: true, salt: true}, jungle: {warmth: [4, 4], arid: [3, 4]}, crest: {warmth: [3, 3], arid: [1, 2]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  /* the Bowl (biomes/sedesert/PLAN-BOWL.md, station 2): the abyssal salt basin, 1.8 atm: its salt flat and halophyte belt, and the deltas */
  sedesert:    {atm: 1, atmNote: '?', zones: {desert: {warmth: [4, 5], arid: [0, 1]}, wadi: {warmth: [4, 5], arid: [1, 2], wet: true},
                salt: {warmth: [4, 5], arid: [0, 1], salt: true, atm: 2}, halo: {warmth: [4, 5], arid: [0, 1], salt: true, atm: 2},
                delta: {warmth: [4, 5], arid: [2, 3], wet: true, atm: 2},
                steppe: {warmth: [4, 5], arid: [1, 2]}}},   /* the steppe fringe (biomes/sedesert/PLAN-STEPPE.md, station 3) */
  /* Shumar & the Ordeal ramp (biomes/shighlands/PLAN-STATIONS.md, stations 4 & 5, 2026-11-18): the western dry-summer plateau and snowmelt
     gorges (2,850-3,600 m, Dsb, 408-440 mm/yr, 1.06 atm) and the SE initiation ramp under Godthrone (4,300-4,600 m, ET/Dfc, 235 mm/yr, 0.91 atm) */
  shighlands:  {atm: 1, zones: {cloudforest: {warmth: [1, 2], arid: [3, 4]}, paramo: {warmth: [0, 1], arid: [2, 3]},
                shumar: {warmth: [1, 2], arid: [1, 2]}, ordeal: {warmth: [0, 0], arid: [1, 1], atm: 0}}},
  swhighlands: {atm: 1, zones: {rainwall: {warmth: [2, 3], arid: [3, 4]}, fen: {warmth: [1, 2], arid: [3, 4], wet: true}, tableland: {warmth: [1, 2], arid: [2, 3]}, tarn: {warmth: [0, 1], arid: [3, 3], wet: true}}},
  swbay:       {atm: 2, atmNote: '?', zones: {ring: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  swlowlands:  {atm: 1, atmNote: '?', zones: {bayou: {warmth: [4, 4], arid: [3, 4], wet: true}, plain: {warmth: [3, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  throne:      {atm: 2, atmNote: '?', zones: {windward: {warmth: [4, 4], arid: [3, 4]}, lee: {warmth: [3, 5], arid: [0, 1]}, shoulder: {warmth: [2, 3], arid: [2, 3]}}},
  xanadu:      {atm: 1, atmNote: '?', zones: {vale: {warmth: [2, 3], arid: [2, 3]}, shore: {warmth: [2, 3], arid: [1, 2]}, lake: {warmth: [2, 3], arid: [3, 3], wet: true}}},
  ringisles:   {atm: 2, atmNote: '?', zones: {wet: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}, steppe: {warmth: [4, 5], arid: [0, 1]}, lagoon: {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}}},
  /* Farside (biomes/farside, 2026-10-26): the only ocean shore, the wettest coast on the map (Af/Cfa on the coast, ~3,500 mm, +24 degC;
     Cfb/Dfb in the fog belt at ~2 km, +14 degC; Csa in the drier lee basins): the strand and the kelp coast salt with the spray */
  farside:     {atm: 1, zones: {strand: {warmth: [4, 4], arid: [4, 4], wet: true, salt: true}, kelpcoast: {warmth: [3, 4], arid: [4, 4], salt: true}, front: {warmth: [2, 3], arid: [3, 4]}, cloud: {warmth: [1, 2], arid: [4, 4]}, lee: {warmth: [2, 3], arid: [1, 2]}}},
  /* the Oidong Valley (biomes/oidong): an enclosed high valley, its floor at ~2,000-2,200 m on the scale model (~1.24 atm: standard),
     Cfb with BSk toward the drier west; the floor humid in the east, the flats drier, the terraces cool, the pools fresh */
  oidong:      {atm: 1, zones: {floor: {warmth: [1, 2], arid: [3, 3]}, pools: {warmth: [1, 2], arid: [3, 4], wet: true}, flats: {warmth: [1, 2], arid: [1, 2]}, terraces: {warmth: [0, 1], arid: [2, 3]}}},
  /* the NW outer wall (biomes/nwouterwall/PLAN.md section 4): the Yeti's High Country. The forest-steppe (~4.2 km, 0.93 atm, 220 mm,
     dry summers) and the larch taiga (~5.2 km, 0.85 atm) are standard air; the tundra and the fellfield above are thin. The alases are
     the thaw hollows' meadows and lakes on the permafrost */
  nwouterwall: {atm: 1, zones: {steppe: {warmth: [1, 1], arid: [1, 1]}, larchwood: {warmth: [0, 1], arid: [1, 2]}, alas: {warmth: [0, 1], arid: [3, 3], wet: true},
    tundra: {warmth: [0, 0], arid: [0, 1], atm: 0}, fellfield: {warmth: [0, 0], arid: [0, 0], atm: 0}}},
  neouterwall: {atm: 1, zones: {lowland: {warmth: [1, 2], arid: [3, 3]}, tarn: {warmth: [1, 1], arid: [3, 4], wet: true}, shoulder: {warmth: [0, 1], arid: [1, 2]}, alpine: {warmth: [0, 0], arid: [1, 2], atm: 0}}},
  /* the W outer wall (biomes/wouterwall/PLAN.md section 4, accepted 2026-11-10): the loess bench under the airless crest */
  wouterwall:  {atm: 1, zones: {terrace: {warmth: [2, 2], arid: [2, 2]}, bench: {warmth: [1, 1], arid: [1, 2]}, upper: {warmth: [1, 1], arid: [1, 1]},
    fell: {warmth: [0, 0], arid: [1, 1]}, edge: {warmth: [3, 3], arid: [2, 2]}}},
  /* the Cut (biomes/cut, PLAN.md section 7): the eigenweapon's bowl, ~1.9 atm on the floor and the lakes' shores */
  cut:         {atm: 2, zones: {lake: {warmth: [5, 5], arid: [4, 4], wet: true}, floor: {warmth: [5, 5], arid: [1, 2], salt: true}, walls: {warmth: [3, 4], arid: [2, 3], atm: 1}, lip: {warmth: [1, 2], arid: [1, 2], atm: 1}}},
  /* the Tiers (biomes/tiers/PLAN.md section 4, 2026-11-16): the Coyote Kingdom's stair */
  tiers:       {atm: 1, zones: {lake: {warmth: [3, 3], arid: [1, 2], atm: 2}, shallows: {warmth: [3, 3], arid: [2, 3], wet: true, atm: 2},
    'steps-mid': {warmth: [2, 2], arid: [1, 1]}, tread: {warmth: [1, 1], arid: [0, 0]}, 'steps-high': {warmth: [1, 1], arid: [0, 0], atm: 0},
    floor: {warmth: [4, 4], arid: [3, 3], atm: 2}}},
  /* the abyssal savannah (biomes/abyssal-savannah/PLAN.md): the eastern abyss's rim slope (Aw, BSh, 1.6-1.75 atm) and its floor's savanna belt */
  'abyssal-savannah': {atm: 2, zones: {parkland: {warmth: [4, 4], arid: [1, 2]}, steppe: {warmth: [4, 4], arid: [0, 1]}, gallery: {warmth: [4, 4], arid: [2, 3], wet: true}, pan: {warmth: [4, 4], arid: [0, 1], salt: true}}},
  /* Region 98 (biomes/siphon-pits, PLAN.md section 0): the Ostrukh Terraces and the Siphon Pits' maar floors */
  'siphon-pits': {atm: 1, zones: {terraces: {warmth: [2, 2], arid: [1, 2]}, braids: {warmth: [2, 2], arid: [2, 3], wet: true}, pitfloor: {warmth: [2, 3], arid: [2, 3], heated: true}}},
  /* the Mid Basin (biomes/slabfields/PLAN.md, crop key midbasin) */
  midbasin: {atm: 1, zones: {maar: {warmth: [3, 3], arid: [2, 3], heated: true}, corridor: {warmth: [2, 2], arid: [1, 1]}, benches: {warmth: [1, 2], arid: [0, 1]},
    chasmfloor: {warmth: [2, 3], arid: [0, 1], atm: 2}}},
  /* the Loom-Chasms (biomes/loom-chasms/PLAN.md) */
  'loom-chasms': {atm: 1, zones: {cradle: {warmth: [1, 2], arid: [1, 2]}, weavestep: {warmth: [2, 2], arid: [0, 1], atm: 2}, floor: {warmth: [2, 3], arid: [0, 0], atm: 2},
    playa: {warmth: [3, 3], arid: [0, 0], atm: 2, salt: true}}},
  /* Ancient's Valley (biomes/ancientsvalley/PLAN.md sections 2-3): the ruined core and lake shore (<300 m, 1.54-1.60 atm, Cfa/Am),
     the Soleri farmland terraces (300-600 m, 1.51-1.54 atm, Cfa/Csa) and the forested rim walls (>600 m, standard air) */
  ancientsvalley: {atm: 2, zones: {floor: {warmth: [3, 4], arid: [3, 4]}, lakeshore: {warmth: [3, 4], arid: [3, 4], wet: true},
    terraces: {warmth: [3, 3], arid: [2, 3]}, rim: {warmth: [2, 3], arid: [2, 3], atm: 1}}},
  /* the Gills (biomes/gills/PLAN.md sections 5, 7, 9; NOTES.md): the White and Red Gills' pipe fields (3.7 km, 1.0 atm, Dsc), the mist-fed
     breath meadows and milky springs, the upper gills (4.7-5.4 km, 0.81-0.89 atm, ET) and the ice pipes (>6.3 km, thin air) */
  gills: {atm: 1, zones: {pipes: {warmth: [1, 1], arid: [0, 1]}, meadow: {warmth: [1, 2], arid: [2, 3], wet: true, heated: true},
    upper: {warmth: [0, 1], arid: [0, 1]}, ice: {warmth: [0, 0], arid: [0, 1], atm: 0}}},
  /* the West Rift (core/simulation/PROPOSAL-WEST-RIFT.md section 1.4) and its component biome kits (riftrim, greenstep, labyrinth, firebliss, godshearth) */
  westrift: {atm: 1, zones: {bowl: {warmth: [3, 3], arid: [2, 3], wet: true, atm: 2}, montane: {warmth: [1, 2], arid: [2, 3]},
    fell: {warmth: [0, 1], arid: [1, 2]}, caldera: {warmth: [2, 3], arid: [2, 3], wet: true, heated: true}, floor: {warmth: [4, 5], arid: [0, 2], atm: 2}}},
  riftrim: {atm: 1, zones: {shore: {warmth: [2, 3], arid: [2, 3]}, lake: {warmth: [2, 3], arid: [2, 3], wet: true},
    montane: {warmth: [1, 1], arid: [1, 3]}, alpine: {warmth: [0, 0], arid: [1, 2], atm: 0}}},
  greenstep: {atm: 1, zones: {toe: {warmth: [3, 3], arid: [3, 4], wet: true, atm: 2}, steps: {warmth: [2, 3], arid: [3, 4]}, upper: {warmth: [1, 2], arid: [2, 3]}}},
  labyrinth: {atm: 1, zones: {chaos: {warmth: [1, 2], arid: [1, 2]}, graben: {warmth: [1, 1], arid: [1, 2]}, tarn: {warmth: [0, 1], arid: [2, 3], wet: true}, dome: {warmth: [0, 0], arid: [0, 1], atm: 0}}},
  firebliss: {atm: 1, zones: {caldera: {warmth: [2, 2], arid: [3, 3]}, vents: {warmth: [2, 3], arid: [2, 3], heated: true}, rim: {warmth: [0, 1], arid: [2, 3]}}},
  godshearth: {atm: 1, zones: {hearth: {warmth: [2, 3], arid: [2, 3], wet: true, heated: true}, bench: {warmth: [1, 2], arid: [1, 2]}, rim: {warmth: [0, 1], arid: [1, 2], atm: 0}}},
  /* The Crook and Ria Valley (core/simulation/PROPOSAL-CROOK-RIA-BRAINSTORM.md sections 2.2-2.4, biomes/riavalley/PLAN.md): exterior NW/N ocean margins */
  crook: {atm: 1, zones: {crookshore: {warmth: [3, 4], arid: [3, 4], atm: 2}, bay: {warmth: [3, 4], arid: [3, 4], wet: true, salt: true, atm: 2},
    crookwash: {warmth: [2, 3], arid: [2, 3]}, crookhead: {warmth: [0, 1], arid: [2, 3]}}},
  riavalley: {atm: 1, zones: {sound: {warmth: [3, 3], arid: [2, 3], wet: true, salt: true, atm: 2}, delta: {warmth: [4, 4], arid: [3, 4], wet: true, atm: 2},
    valley: {warmth: [3, 3], arid: [2, 3], atm: 2}, ozarks: {warmth: [2, 3], arid: [3, 3]}}},
  /* northern and eastern basins (biomes/nsemiarid/PLAN.md, biomes/dambasins/PLAN.md, biomes/outlands/PLAN.md, biomes/spiderlake/PLAN.md, biomes/catch/PLAN.md) */
  nsemiarid: {atm: 2, zones: {steppe: {warmth: [3, 4], arid: [1, 1]}, upland: {warmth: [2, 3], arid: [2, 3]}, shore: {warmth: [3, 3], arid: [2, 3], wet: true}, high: {warmth: [1, 2], arid: [1, 2], atm: 1}}},
  dambasins: {atm: 2, zones: {polder: {warmth: [3, 3], arid: [3, 4], wet: true}, terrace: {warmth: [3, 3], arid: [2, 3]}, strand: {warmth: [3, 4], arid: [0, 1], salt: true}}},
  outlands: {atm: 1, zones: {valley: {warmth: [2, 3], arid: [2, 3], atm: 2}, basin: {warmth: [1, 2], arid: [1, 2]}, lake: {warmth: [1, 2], arid: [2, 3], wet: true}, rim: {warmth: [0, 0], arid: [0, 1], atm: 0}}},
  spiderlake: {atm: 1, zones: {shore: {warmth: [2, 3], arid: [3, 3], wet: true, atm: 2}, bench: {warmth: [2, 2], arid: [3, 3], atm: 2}, rim: {warmth: [1, 1], arid: [2, 3]}}},
  catch: {atm: 1, zones: {floor: {warmth: [2, 3], arid: [0, 1], atm: 2}, oasis: {warmth: [2, 3], arid: [1, 2], wet: true}, piedmont: {warmth: [1, 2], arid: [1, 1]}, walls: {warmth: [0, 1], arid: [0, 1], atm: 0}}},
  guilin: {atm: 1, zones: {plain: {warmth: [3, 3], arid: [3, 4], wet: true}, bench: {warmth: [2, 3], arid: [2, 3]}, cliff: {warmth: [2, 3], arid: [1, 2]}}},
  'k-guilin': {atm: 2, zones: {plain: {warmth: [3, 4], arid: [3, 4], wet: true}, bench: {warmth: [3, 3], arid: [2, 3]}, cliff: {warmth: [3, 4], arid: [1, 2]}}},
  korona: {atm: 1, zones: {table: {warmth: [1, 2], arid: [3, 4]}, hollow: {warmth: [2, 3], arid: [3, 4], wet: true}, trench: {warmth: [4, 4], arid: [3, 4], atm: 2}}},
  opalvalley: {atm: 1, zones: {mouth: {warmth: [3, 4], arid: [2, 3], wet: true, atm: 2}, terrace: {warmth: [2, 3], arid: [2, 3], wet: true, atm: 2}, head: {warmth: [0, 1], arid: [2, 3]}}}
};
