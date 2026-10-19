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
  fuel:         {group: 'utility',     what: 'burned or carried for light and heat'}
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
  hyperjungle: {atm: 2, zones: {forest: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  nhighlands:  {atm: 1, atmNote: '?', zones: {low: {warmth: [2, 2], arid: [3, 3]}, high: {warmth: [0, 1], arid: [2, 3]}}},
  nwbay:       {atm: 2, atmNote: '?', zones: {shore: {warmth: [3, 4], arid: [2, 3]}, wetland: {warmth: [3, 4], arid: [3, 4], wet: true}}},
  nwlowlands:  {atm: 1, atmNote: '?', zones: {strip: {warmth: [4, 4], arid: [4, 4]}, plain: {warmth: [3, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  rift:        {atm: 1, atmNote: '?', zones: {lake: {warmth: [3, 4], arid: [0, 1], wet: true, salt: true}, jungle: {warmth: [4, 4], arid: [3, 4]}, crest: {warmth: [3, 3], arid: [1, 2]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  sedesert:    {atm: 1, atmNote: '?', zones: {desert: {warmth: [4, 5], arid: [0, 1]}, wadi: {warmth: [4, 5], arid: [1, 2], wet: true}}},
  shighlands:  {atm: 1, zones: {cloudforest: {warmth: [1, 2], arid: [3, 4]}, paramo: {warmth: [0, 1], arid: [2, 3]}}},
  swbay:       {atm: 2, atmNote: '?', zones: {ring: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}}},
  swlowlands:  {atm: 1, atmNote: '?', zones: {bayou: {warmth: [4, 4], arid: [3, 4], wet: true}, plain: {warmth: [3, 3], arid: [2, 3]}, hills: {warmth: [2, 3], arid: [1, 2]}}},
  throne:      {atm: 2, atmNote: '?', zones: {windward: {warmth: [4, 4], arid: [3, 4]}, lee: {warmth: [3, 5], arid: [0, 1]}, shoulder: {warmth: [2, 3], arid: [2, 3]}}},
  xanadu:      {atm: 1, atmNote: '?', zones: {vale: {warmth: [2, 3], arid: [2, 3]}, shore: {warmth: [2, 3], arid: [1, 2]}, lake: {warmth: [2, 3], arid: [3, 3], wet: true}}},
  ringisles:   {atm: 2, atmNote: '?', zones: {wet: {warmth: [4, 4], arid: [3, 4]}, savanna: {warmth: [4, 4], arid: [1, 2]}, steppe: {warmth: [4, 5], arid: [0, 1]}, lagoon: {warmth: [4, 4], arid: [3, 4], wet: true, salt: true}}},
  /* the Oidong Valley (biomes/oidong): a chilly enclosed high valley at ~1600 m, ~1 atm; the floor humid, the flats drier, the terraces cool, the pools fresh */
  oidong:      {atm: 1, atmNote: '?', zones: {floor: {warmth: [1, 2], arid: [3, 3]}, pools: {warmth: [1, 2], arid: [3, 4], wet: true}, flats: {warmth: [1, 2], arid: [1, 2]}, terraces: {warmth: [0, 1], arid: [2, 3]}}}
};
