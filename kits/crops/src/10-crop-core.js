/* ==================== the Crops kit: the axes, the buckets, the biomes (plain data, [G data]) ==================== */
/* kits/crops/PLAN.md. No three.js, no DOM: this runs in Godot. The records are in 20-24; the queries in 40. */
globalThis.CROPS = globalThis.CROPS || {version: 1};

/* the three axes, as ordered bands; a range is [lo, hi] as indices into its list */
CROPS.WARMTH = ['polar', 'cool', 'temperate', 'subtropic', 'tropic', 'hot'];
CROPS.ATM = ['thin', 'standard', 'dense'];                         /* thin < 0.8 atm; standard 0.8-1.3; dense 1.3-2.0 */
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
  nwbay:       {atm: 2, atmNote: '?', zones: {shore: {warmth: [3, 4], arid: [2, 3]}, wetland: {warmth: [3, 4], arid: [3, 4], wet: true}}},
  nwlowlands:  {atm: 1, atmNote: '?', zones: {strip: {warmth: [4, 4], arid: [4, 4]}, plain: {warmth: [3, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  rift:        {atm: 1, atmNote: '?', zones: {lake: {warmth: [3, 4], arid: [0, 1], wet: true, salt: true}, jungle: {warmth: [4, 4], arid: [3, 4]}, crest: {warmth: [3, 3], arid: [1, 2]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  /* the Bowl (biomes/sedesert/PLAN-BOWL.md, station 2): the abyssal salt basin, 1.8 atm: its salt flat and halophyte belt, and the deltas */
  sedesert:    {atm: 1, atmNote: '?', zones: {desert: {warmth: [4, 5], arid: [0, 1]}, wadi: {warmth: [4, 5], arid: [1, 2], wet: true},
                salt: {warmth: [4, 5], arid: [0, 1], salt: true, atm: 2}, halo: {warmth: [4, 5], arid: [0, 1], salt: true, atm: 2},
                delta: {warmth: [4, 5], arid: [2, 3], wet: true, atm: 2},
                steppe: {warmth: [4, 5], arid: [1, 2]}}},   /* the steppe fringe (biomes/sedesert/PLAN-STEPPE.md, station 3) */
  shighlands:  {atm: 1, zones: {cloudforest: {warmth: [1, 2], arid: [3, 4]}, paramo: {warmth: [0, 1], arid: [2, 3]}}},
  swbay:       {atm: 2, atmNote: '?', zones: {ring: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  swlowlands:  {atm: 1, atmNote: '?', zones: {bayou: {warmth: [4, 4], arid: [3, 4], wet: true}, plain: {warmth: [3, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  throne:      {atm: 2, atmNote: '?', zones: {windward: {warmth: [4, 4], arid: [3, 4]}, lee: {warmth: [3, 5], arid: [0, 1]}, shoulder: {warmth: [2, 3], arid: [2, 3]}}},
  xanadu:      {atm: 1, atmNote: '?', zones: {vale: {warmth: [2, 3], arid: [2, 3]}, shore: {warmth: [2, 3], arid: [1, 2]}, lake: {warmth: [2, 3], arid: [3, 3], wet: true}}},
  ringisles:   {atm: 2, atmNote: '?', zones: {wet: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}, steppe: {warmth: [4, 5], arid: [0, 1]}, lagoon: {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}}},
  /* the Oidong Valley (biomes/oidong): an enclosed high valley, its floor at ~2,000-2,200 m on the scale model (~1.24 atm: standard),
     Cfb with BSk toward the drier west; the floor humid in the east, the flats drier, the terraces cool, the pools fresh */
  /* Farside (biomes/farside, 2026-10-26): the only ocean shore, the wettest coast on the map (Af/Cfa on the coast, ~3,500 mm, +24 degC;
     Cfb/Dfb in the fog belt at ~2 km, +14 degC; Csa in the drier lee basins): the strand and the kelp coast salt with the spray */
  farside:     {atm: 1, zones: {strand: {warmth: [4, 4], arid: [4, 4], wet: true, salt: true}, kelpcoast: {warmth: [3, 4], arid: [4, 4], salt: true}, front: {warmth: [2, 3], arid: [3, 4]}, cloud: {warmth: [1, 2], arid: [4, 4]}, lee: {warmth: [2, 3], arid: [1, 2]}}},
  oidong:      {atm: 1, zones: {floor: {warmth: [1, 2], arid: [3, 3]}, pools: {warmth: [1, 2], arid: [3, 4], wet: true}, flats: {warmth: [1, 2], arid: [1, 2]}, terraces: {warmth: [0, 1], arid: [2, 3]}}},
  /* the NW outer wall (biomes/nwouterwall/PLAN.md section 4): the Yeti's High Country. The forest-steppe (~4.2 km, 0.93 atm, 220 mm,
     dry summers) and the larch taiga (~5.2 km, 0.85 atm) are standard air; the tundra and the fellfield above are thin. The alases are
     the thaw hollows' meadows and lakes on the permafrost */
  nwouterwall: {atm: 1, zones: {steppe: {warmth: [1, 1], arid: [1, 1]}, larchwood: {warmth: [0, 1], arid: [1, 2]}, alas: {warmth: [0, 1], arid: [3, 3], wet: true},
    tundra: {warmth: [0, 0], arid: [0, 1], atm: 0}, fellfield: {warmth: [0, 0], arid: [0, 0], atm: 0}}},
  /* the Cut (biomes/cut, PLAN.md section 7): the eigenweapon's bowl, ~1.9 atm on the floor and the lakes' shores (hot: the 4.22 floor's
     +31 degC), the salt steppe dry and salt; the walls and the lip standard air */
  cut:         {atm: 2, zones: {lake: {warmth: [5, 5], arid: [4, 4], wet: true}, floor: {warmth: [5, 5], arid: [1, 2], salt: true}, walls: {warmth: [3, 4], arid: [2, 3], atm: 1}, lip: {warmth: [1, 2], arid: [1, 2], atm: 1}}},
  /* the abyssal savannah (biomes/abyssal-savannah/PLAN.md): the eastern abyss's rim slope (Aw, BSh, 1.6-1.75 atm) and its floor's savanna belt
     (XV, 2 atm, ~1,050 mm, +34 C); the parkland, the bench's steppe, the gullies' gallery and the bench's pan */
  'abyssal-savannah': {atm: 2, zones: {parkland: {warmth: [4, 4], arid: [1, 2]}, steppe: {warmth: [4, 4], arid: [0, 1]}, gallery: {warmth: [4, 4], arid: [2, 3], wet: true}, pan: {warmth: [4, 4], arid: [0, 1], salt: true}}},
  /* Region 98 (biomes/siphon-pits, PLAN.md section 0): the Ostrukh Terraces (Cwb, +15 degC, 1.22 atm, 439 mm: the loess terraces, the braids'
     irrigated banks) and the Siphon Pits' maar floors (Cfa, +18 degC, 1.20 atm under the deck, the vents' heated ground) */
  'siphon-pits': {atm: 1, zones: {terraces: {warmth: [2, 2], arid: [1, 2]}, braids: {warmth: [2, 2], arid: [2, 3], wet: true}, pitfloor: {warmth: [2, 3], arid: [2, 3], heated: true}}},
  /* the Mid Basin (biomes/midbasin/PLAN.md, its climate table; a plan, 2026-11-12): the maar floors (Cwb, 19-26 degC, 439 mm, 1.20-1.28 atm, the
     vents' warm ground), the Loess Corridor (BSk, 16-20 degC, 220-267 mm), the middle benches (Dsc, 6-14 degC, ~150 mm, ~1.07 atm) and the chasm
     floors (BSk/BWk, 19 degC, 125 mm, 1.49 atm) */
  midbasin: {atm: 1, zones: {maar: {warmth: [3, 3], arid: [2, 3], heated: true}, corridor: {warmth: [2, 2], arid: [1, 1]}, benches: {warmth: [1, 2], arid: [0, 1]},
    chasmfloor: {warmth: [2, 3], arid: [0, 1], atm: 2}}},
  /* the Loom-Chasms (biomes/loom-chasms/PLAN.md, its stations; a plan, 2026-11-12): the Weavers' Cradle (Cwb, 11 degC, 439 mm, 1.22 atm: the Yuni
     terraces on the loess fans), the Weave-Step (BSk, 15 degC, 125 mm, 1.33 atm), the chasm floor (BWk, 19 degC, 78 mm, 1.46 atm) and the White
     Loom's playa (24 degC, 47 mm, 1.55 atm, salt) */
  'loom-chasms': {atm: 1, zones: {cradle: {warmth: [1, 2], arid: [1, 2]}, weavestep: {warmth: [2, 2], arid: [0, 1], atm: 2}, floor: {warmth: [2, 3], arid: [0, 0], atm: 2},
    playa: {warmth: [3, 3], arid: [0, 0], atm: 2, salt: true}}}
};
