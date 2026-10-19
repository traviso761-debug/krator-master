/* ============================== 0b. THE SIM'S TUNING (P7b: PLAN.md section 9) ============================== */
/* [G data] ISLE.TUNE.sim: everything the isle host (40-44) reads to declare a town on core/simulation, by Islander key
   and by kind, never by town, so Kautoa takes the same table after Valapo. The economy is tuned here from now on
   (PLAN.md section 5): a change to a rate is tried on this page first.
     clock      secPerMinute: motion seconds a world minute (the 72-minute day, run six times faster than life for the
                walks, as the Voth city does: TUNE.timeScale 6), the decisions a minute, the lag, the reach, the start
     track      a place farther than this from every way gets a track to the nearest (41)
     kinds      an Islander key -> [place kind, {ACTIVITY: slots per 100 m2 of its footprint (at least 1)}, opts]; there are
                no interiors yet, so the footprint is the capacity (Verge's rule). A dwelling's SLEEP, EAT, REST and IDLE
                are its households' people (34-isle-census.js: a single house one household, a multi-family house three,
                five a household), so the sim's people are the census's. opts: open [h0, h1], out (an open place, its
                people seen), mess (eats at its institution's kitchen), shop [items it sells], wander (metres)
     field      the farm parcels (R.fields): the same shape, slots per 100 m2 of the parcel; orchards take fewer hands
     jobs       the kinds of work: which place kinds' posts a role works, where it lives (default the houses; the
                soldiers the barracks first); the
                role's count is the posts the town's places offer (40-isle-sim.js), so every post is filled
     sched      the day of a worker, a soldier and a dependant, as spans
     items      the foods (each a good of the economy too), the meal, the household stores, eating out
     economy    goods and inputs, the producers (by place kind; a parcel by its crop), the warehouses, the carts, the
                opening stock
   The crops are the programme's (30-isle-programme.js farm: PLAN.md 8c), named as kits/crops names them. */
var ISLE = ISLE || {};
ISLE.TUNE = ISLE.TUNE || {};
ISLE.TUNE.sim = {
  seed: 20261019,
  /* reach: how far anyone walks to a place (SIM.REACH): a town and its farm ring, never the other town 122 km off;
     start: the clock's first minute (midnight of day 0) */
  clock: { secPerMinute: 18, stepMax: 900, lag: 8, reach: 6000, start: 0 },
  track: 40,
  /* towns[town].food: the town's food producers' rates times this (the parcels', the docks', the pens' and the byre's; not
     the bakers', who turn food into food), so a town makes a little more food than it eats (2026-10-19, the owner: at
     most 100 servings a day more); calibrated on two weeks' books (README.md) */
  towns: {
    Valapo: { id: 'valapo', name: 'Valapo', faction: 'islanders', prefix: 'v', carts: 20, inputs: { bread: { 'sweet-potato': 1 } }, food: 0.786 },
    /* Kautoa grows nothing inside its wall: its farms are the programme's farm ring beyond it (`ring`), its bread is taro */
    Kautoa: { id: 'kautoa', name: 'Kautoa', faction: 'islanders', prefix: 'k', carts: 40, inputs: { bread: { taro: 1 } }, food: 0.804 }
  },
  activities: ['SLEEP', 'EAT', 'REST', 'IDLE', 'WORK', 'BUY', 'SOCIALIZE', 'WORSHIP', 'HAUL', 'STUDY', 'HOUSEWORK'],
  indoor: ['SLEEP', 'REST', 'IDLE'],
  home: { per: 5, acts: ['SLEEP', 'EAT', 'REST', 'IDLE', 'HOUSEWORK'] },
  kinds: {
    'ie-hut-garden': ['home', {}, { cls: 'poor' }], 'ie-hut-scrap': ['home', {}, { cls: 'poor' }],
    'ie-house-uma': ['home', {}, { cls: 'middle' }], 'ie-house-cross': ['home', {}, { cls: 'middle' }], 'ie-house-wealthy': ['home', {}, { cls: 'rich' }],
    'ie-barracks': ['barracks', { WORK: 0 }, { mess: true, posts: 'beds' }], 'ie-watchtower': ['watchtower', { WORK: 3 }],
    'ie-market': ['market', { WORK: 3, BUY: 5, SOCIALIZE: 12 }, { open: [6, 19], out: true, wander: 4, shop: 'market' }],
    'ie-chandler': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 19], shop: 'staples' }],
    'ie-trader': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 19], shop: 'staples' }],
    'ie-butcher': ['butcher', { WORK: 2.5, BUY: 3 }, { open: [6, 18], shop: 'meat' }],
    'ie-bakehouse': ['bakehouse', { WORK: 2.5, BUY: 3 }, { open: [5, 18], shop: 'bread' }],
    'ie-kava-house': ['tavern', { WORK: 2.5, EAT: 6, SOCIALIZE: 16 }, { open: [10, 24], shop: 'meal' }],
    'ie-guesthouse': ['inn', { WORK: 2.5, EAT: 5, SOCIALIZE: 8 }, { open: [6, 23], shop: 'meal' }],
    'ie-weaver': ['weaver', { WORK: 2.5 }], 'ie-potter': ['potter', { WORK: 2.5 }], 'ie-smithy': ['smithy', { WORK: 2.5 }],
    'ie-fishdock': ['fishdock', { WORK: 2.5, BUY: 1 }, { out: true, wander: 6, shop: 'fish' }],
    'ie-quay': ['quay', { WORK: 1.7 }, { out: true, wander: 6 }],
    'ie-warehouse': ['warehouse', { WORK: 2.5 }], 'ie-granary': ['granary', { WORK: 1 }], 'ie-granary-great': ['granary', { WORK: 2 }],
    'ie-windmill': ['mill', { WORK: 2 }], 'ie-pens': ['pens', { WORK: 2.5 }, { out: true, wander: 5 }],
    'ie-hall': ['hall', { WORK: 2.5, SOCIALIZE: 8 }, { open: [7, 21] }], 'ie-harbourmaster': ['customs', { WORK: 2.5 }],
    'ie-canoeshed': ['canoeshed', { WORK: 2.5 }], 'ie-temple': ['temple', { WORK: 2.5, WORSHIP: 8, STUDY: 10 }, { open: [5, 21] }],
    'ie-school': ['school', { WORK: 2.5, STUDY: 60 }, { open: [6, 16] }], 'ie-healer': ['healer', { WORK: 2.5 }],
    /* Kautoa's own: the palace, the envoys' and chiefs' houses (a residence: lived in by its households, staffed), the
       ceremonial square, the harbour's beacon, ferry and dockyard, the works, the dairy */
    'ip-palace': ['residence', { WORK: 0.4, SOCIALIZE: 0.3 }, { cls: 'rich' }], 'ie-envoy': ['residence', { WORK: 1 }, { cls: 'rich' }],
    'ie-house-chief': ['residence', { WORK: 1 }, { cls: 'rich' }], 'ie-square': ['square', { WORK: 0.2, SOCIALIZE: 6, WORSHIP: 1 }, { out: true, wander: 15 }],
    'ie-beacon': ['beacon', { WORK: 3 }], 'ie-ferry': ['ferry', { WORK: 2 }, { out: true, wander: 5 }], 'ie-dockyard': ['dockyard', { WORK: 1 }, { out: true, wander: 10 }],
    'ie-quarry': ['quarry', { WORK: 2.5 }, { out: true, wander: 6 }], 'ie-saltworks': ['saltworks', { WORK: 2.5 }, { out: true, wander: 6 }],
    'ie-tannery': ['tannery', { WORK: 2.5 }], 'ie-byre': ['byre', { WORK: 2.5 }, { out: true, wander: 5 }],
    /* Ridertown (the Beast Riders kit): the mounts' stables and roosts, the shrines */
    br_bldg_great_byre: ['stable', { WORK: 1.5 }, { out: true, wander: 8 }], br_bldg_raptor_stable: ['stable', { WORK: 1.5 }],
    br_bldg_rookery_tower: ['rookery', { WORK: 3 }], br_port_mavs_roost: ['rookery', { WORK: 2 }],
    br_port_mavs_shrine: ['shrine', { WORK: 1, WORSHIP: 6, STUDY: 10 }, { open: [5, 21] }],
    /* Izanitown (the Iziz Vernacular) */
    vern_house_poor_a: ['home', {}, { cls: 'poor' }], vern_house_poor_b: ['home', {}, { cls: 'poor' }], vern_house_poor_c: ['home', {}, { cls: 'poor' }],
    vern_house_mid_a: ['home', {}, { cls: 'middle' }], vern_house_mid_b: ['home', {}, { cls: 'middle' }], vern_house_mid_c: ['home', {}, { cls: 'middle' }],
    vern_house_rich_a: ['home', {}, { cls: 'rich' }], vern_house_rich_b: ['home', {}, { cls: 'rich' }],
    vern_governor_palace: ['residence', { WORK: 1 }, { cls: 'rich' }], vern_guard_tower: ['watchtower', { WORK: 1.5 }], vern_watch_house: ['watchtower', { WORK: 4 }],
    vern_shops: ['shop', { WORK: 3, BUY: 4 }, { open: [6, 19], shop: 'staples' }], vern_tavern: ['tavern', { WORK: 2.5, EAT: 6, SOCIALIZE: 16 }, { open: [10, 24], shop: 'meal' }],
    vern_smithy: ['smithy', { WORK: 2.5 }], vern_workshop_a: ['workshop', { WORK: 2.5 }], vern_workshop_b: ['workshop', { WORK: 2.5 }]
  },
  /* the canoe stop (P7c): its dockers' posts per 100 m2 of the landing (the last number: its area, m2) */
  stop: ['canoe stop', { WORK: 3 }, { out: true, wander: 6 }, 200],
  field: { field: ['field', { WORK: 0.9 }, { out: true, wander: 8, open: [5, 19] }], orchard: ['orchard', { WORK: 0.55 }, { out: true, wander: 8, open: [5, 19] }] },
  /* a town's farm ring (a world record of `kind` beyond the square: R.world's sites): each site a holding of `size` metres
     square with one crop by a hash of the town and the site (core/rand), weighted; a stand-in until core/hamlet's farming
     villages (H6) take the ring over; `posts` its hands. Only Kautoa's programme has one */
  ring: { kind: 'farm ring', size: 140, posts: { field: 20, orchard: 13 },
    crops: [{ crop: 'rice', kind: 'field', w: 3 }, { crop: 'taro', kind: 'field', w: 2 }, { crop: 'banana', kind: 'orchard', w: 2 }, { crop: 'coconut', kind: 'orchard', w: 1 },
      { crop: 'cloves', kind: 'orchard', w: 2 }, { crop: 'cacao', kind: 'orchard', w: 1 }] },
  jobs: {
    farmhand: { kinds: ['field', 'orchard', 'pens', 'byre'] }, fisher: { kinds: ['fishdock'] }, docker: { kinds: ['quay', 'warehouse', 'granary', 'customs', 'ferry', 'beacon', 'canoe stop'] },
    trader: { kinds: ['market', 'shop', 'butcher'] }, baker: { kinds: ['bakehouse', 'mill'] }, keeper: { kinds: ['tavern', 'inn'] },
    craftsman: { kinds: ['weaver', 'potter', 'smithy', 'workshop', 'tannery', 'dockyard'] }, labourer: { kinds: ['quarry', 'saltworks'] },
    groom: { kinds: ['stable', 'rookery'] }, soldier: { kinds: ['barracks', 'watchtower', 'canoeshed'], homes: ['barracks', 'home'], sched: 'watch' },
    official: { kinds: ['hall', 'school', 'healer', 'temple', 'residence', 'square', 'shrine'] }
  },
  /* the homes the kin fill, in order: whatever beds the roles leave, the residences and barracks too */
  homes: ['home', 'residence', 'barracks'],
  /* the people by age (2026-10-19, the owner: children at school or at housework, the elders at housework): shares of
     each town's people; the pupils are as many as its schools', temples' and shrines' STUDY places hold (the youngest), the other
     children help at home, the elders keep house; the adults are the workers (every post) and those at home. Ages in
     years, drawn by a hash of the person within the band. A child under five is not counted: the census has no infants */
  ages: { children: 0.36, elders: 0.08, bands: { pupil: [6, 12], child: [9, 15], adult: [16, 59], elder: [60, 82] } },
  /* households: the people dealt round the houses of each `cell`-metre square of the town after the deal, so a house
     holds a family (workers, those at home, children, elders), not one kind of person; nobody moves farther than the cell */
  mix: { cell: 150 },
  /* the places to be in company (SOCIALIZE): the plan's pocket parks and plazas (R.plan.greens), its park and beach
     districts, per 100 m2 of ground (`per`), at most `cap` each */
  greens: { per: 4, cap: 60, open: [5, 22] }, parks: { types: ['park', 'plaza'], per: 1, cap: 400, open: [5, 22] },
  sched: {
    work: [[0, 'SLEEP'], [5, 'EAT'], [6, 'WORK'], [17, 'SOCIALIZE'], [19, 'EAT'], [20, 'REST'], [22, 'SLEEP']],
    watch: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [18, 'EAT'], [19, 'SOCIALIZE'], [21, 'SLEEP']],
    kin: [[0, 'SLEEP'], [7, 'EAT'], [8, 'IDLE'], [10, 'SOCIALIZE'], [13, 'REST'], [15, 'SOCIALIZE'], [18, 'EAT'], [19, 'REST'], [21, 'SLEEP']],
    pupil: [[0, 'SLEEP'], [6, 'EAT'], [7, 'STUDY'], [13, 'SOCIALIZE'], [15, 'HOUSEWORK'], [17, 'SOCIALIZE'], [18, 'EAT'], [19, 'REST'], [21, 'SLEEP']],
    child: [[0, 'SLEEP'], [6, 'EAT'], [7, 'HOUSEWORK'], [11, 'SOCIALIZE'], [13, 'HOUSEWORK'], [16, 'SOCIALIZE'], [18, 'EAT'], [19, 'REST'], [21, 'SLEEP']],
    elder: [[0, 'SLEEP'], [6, 'EAT'], [7, 'HOUSEWORK'], [10, 'SOCIALIZE'], [12, 'REST'], [15, 'HOUSEWORK'], [17, 'SOCIALIZE'], [18, 'EAT'], [19, 'REST'], [21, 'SLEEP']],
    free: ['SOCIALIZE', 'IDLE', 'REST']
  },
  items: {
    /* every food on the isles; a town sells and stores only those it makes (44: ISLE.simFoods) */
    foods: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'],
    /* every food seller keeps the town's whole list (a household buys its days of food at the nearest seller, each food
       in proportion to the warehouses' stock: a butcher selling only meat had its neighbours buy nothing else,
       and emptied the town of it; 2026-10-19). The land animals' food is one good, meat (the pens' and the byre's), the
       sea's fish (owner, 2026-10-19) */
    shops: { market: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'], staples: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'], meat: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'], bread: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'], fish: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread'], meal: ['meal'] },
    /* what everyone wears (2026-10-19): a shirt, a wrap and a pair of sandals (the item `sandal`; the good `sandals`), `sets` of each (one worn, the rest at home), each worn
       out in `life` days and bought again from the town's warehouses; the soldiers a leather cuirass besides (one kept);
       who sells them, by place kind */
    worn: { shirt: { cat: 'clothes', slot: 'torso', life: 90, good: 'garments' }, wrap: { cat: 'clothes', slot: 'legs', life: 90, good: 'garments' },
      sandal: { cat: 'clothes', slot: 'feet', life: 120, good: 'sandals' }, cuirass: { cat: 'armour', slot: 'torso', layer: 'armour', life: 180, good: 'armour' } },
    sets: 2, armed: ['soldier'],
    wares: { market: ['shirt', 'wrap', 'sandal'], shop: ['shirt', 'wrap', 'sandal'], weaver: ['shirt', 'wrap'], workshop: ['sandal'], smithy: ['cuirass'] },
    meals: 2, perMeal: 2, low: 1, days: 3, mins: 15, cool: 120, storeDays: [1.5, 3], eatOut: { base: 0.04, wealth: 0.08 }, wealth: { poor: 0, middle: 0.5, rich: 1 }
  },
  economy: {
    goods: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread', 'sugar-cane', 'sugar', 'cotton', 'cloth', 'pots', 'coffee',
      'clove', 'cacao', 'salt', 'stone', 'leather', 'garments', 'sandals', 'armour'],
    /* each town's bread is its own (towns[town].inputs over these) */
    inputs: { sugar: { 'sugar-cane': 2 }, cloth: { cotton: 2 }, garments: { cloth: 2 }, sandals: { leather: 1 }, armour: { leather: 3 } },
    every: 30, window: 1, imports: { days: 2, scan: 60 }, cart: { cap: 400, load: 10, unload: 10, minLoad: 40 },
    /* a good's own load worth a cart's trip (the cart's minLoad otherwise): the oruwa's light, dear goods land a few dozen
       at a time, under the 40 a cart waits for, and sat at the canoe stop (2026-10-19) */
    minLoad: { clove: 5, cacao: 5, coffee: 5, armour: 5 },
    /* a crop's own rate, times the parcels' (the owner, 2026-10-19: the spice, cane and cacao cut tenfold; the cotton to
       what the weavers use) */
    cropRate: { clove: 0.1, cacao: 0.1, 'sugar-cane': 0.087, cotton: 0.75 },
    /* the crops of the parcels (30-isle-programme.js farm) as the economy's goods */
    crops: { 'sweet potato': 'sweet-potato', banana: 'banana', coconut: 'coconut', 'sugar cane': 'sugar-cane', cotton: 'cotton', coffee: 'coffee',
      rice: 'rice', taro: 'taro', cloves: 'clove', cacao: 'cacao' },
    /* servings (food) or lots a worker-hour, into the place's own store up to cap */
    producers: {
      field: { rate: 6, cap: 3000 }, orchard: { rate: 6, cap: 3000 }, fishdock: { out: ['fish'], rate: 7, cap: 3000 }, pens: { out: ['meat'], rate: 4, cap: 1500 },
      bakehouse: { out: ['bread'], rate: 6, cap: 1500 }, mill: { out: ['sugar'], rate: 4, cap: 1500 }, weaver: { out: ['cloth', 'garments'], rate: 1.2, cap: 600 },
      potter: { out: ['pots'], rate: 0.5, cap: 400 }, byre: { out: ['meat'], rate: 6, cap: 1500 }, quarry: { out: ['stone'], rate: 0.5, cap: 400 },
      saltworks: { out: ['salt'], rate: 2, cap: 1500 }, tannery: { out: ['leather'], rate: 0.5, cap: 400 },
      /* the clothes and the armour (2026-10-19): the weavers make cloth and garments from it (above), the Vernacular's
         workshops sandals from leather, the smithies leather armour (until the iron mine brings ore) */
      workshop: { out: ['sandals'], rate: 0.45, cap: 400 }, smithy: { out: ['armour'], rate: 0.002, cap: 100 }
    },
    warehouses: ['warehouse', 'granary'],
    /* a town opens with `startDays` of its food, each food in its share of the town's making (its producers' posts times
       rate), and these lots of the other goods it makes (not of what it must import) */
    startDays: 2, startLots: { cloth: 40, pots: 40, garments: 200, sandals: 200, armour: 20, salt: 300, sugar: 300, clove: 60, cacao: 60, stone: 40, leather: 40 }
  },
  /* P7c, the canoe line between the two trade landings (owner, 2026-10-19), on core/simulation's SIM.trade (47):
     uses     what each town uses a day, a person, of what the other makes (8c: Kautoa's salt, rice, cloves and cacao in
              Valapo's kitchens; Valapo's sugar in Kautoa's), drawn on its warehouses every hour: the want the line serves
     lines    the lakatoi, the towns' bulk carrier: two a day, one each way (the two start at opposite landings; a passage
              of 20 hours and a stay of 4 make a day), carrying the bulk goods; the oruwa, for the light and dear goods,
              one canoe round in a day, filling only what the receiver is low on (want, keep). goods: what each town may send */
  trade: {
    /* the buyers from beyond the isles (the owner, 2026-10-19): ships of Voth, of the Izani, of the Hykkousoi, the Ancients'
       salvagers and Islanders of the outer isles (their islands yet to be named) call at a town's landing every `every`
       days (from day `phase`), at `at` minutes past midnight, and buy up to `buys` of each good, above the `floor` the
       town keeps (for the canoe line and itself). Kautoa's civilian harbour moors their vessels (30-isle-programme.js) */
    buyers: { at: 720, floor: { clove: 300, cacao: 300, sugar: 300, coffee: 100 },
      ships: [
        { id: 'voth', name: 'Voth traders', vessel: 'vothDhow', every: 3, phase: 0, calls: ['kautoa'], buys: { clove: 600, cacao: 400 } },
        { id: 'izani', name: 'Izani merchants', vessel: 'izizDhoni', every: 4, phase: 1, calls: ['kautoa'], buys: { cacao: 600, clove: 300 } },
        { id: 'hykkousoi', name: 'Hykkousoi traders', vessel: 'hykCorbita', every: 5, phase: 2, calls: ['kautoa', 'valapo'], buys: { clove: 800, sugar: 200 } },
        { id: 'salvagers', name: 'Ancient salvagers', vessel: 'salvageTug', every: 6, phase: 3, calls: ['kautoa'], buys: { cacao: 300, clove: 300 } },
        { id: 'outer', name: 'Islanders of the outer isles', vessel: 'islanderLakatoi', every: 2, phase: 1, calls: ['valapo', 'kautoa'], buys: { sugar: 100, coffee: 100, clove: 200, cacao: 200 } }
      ] },
    uses: { valapo: { salt: 0.02, rice: 0.05, clove: 0.004, cacao: 0.008 }, kautoa: { sugar: 0.02 } },
    lines: [
      { id: 'lakatoi', vessel: 'islanderLakatoi', cap: 3000, carriers: 2, minutes: 1200, mins: 240, keep: 1, want: 6,
        goods: { kautoa: ['salt', 'rice', 'sandals', 'armour'], valapo: ['sugar', 'garments'] } },
      { id: 'oruwa', vessel: 'islanderOruwa', cap: 150, carriers: 1, minutes: 600, mins: 120, keep: 1, want: 2,
        goods: { kautoa: ['clove', 'cacao'], valapo: ['coffee'] } }
    ]
  }
};
