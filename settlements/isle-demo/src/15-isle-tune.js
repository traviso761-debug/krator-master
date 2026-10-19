/* ============================== 0b. THE SIM'S TUNING (P7b: PLAN.md section 9) ============================== */
/* [G data] ISLE.TUNE.sim: everything the isle host (40-44) reads to declare a town on core/simulation, by Islander key
   and by kind, never by town, so Kautoa takes the same table after Valapo. The economy is tuned here from now on
   (PLAN.md section 5): a change to a rate is tried on this page first.
     clock      secPerMinute: motion seconds a world minute (the 72-minute day, run six times faster than life for the
                walks, as the Voth city does: TUNE.timeScale 6), the decisions a minute, the lag
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
  clock: { secPerMinute: 18, stepMax: 400, lag: 8 },
  towns: {
    Valapo: { id: 'valapo', name: 'Valapo', faction: 'islanders', prefix: 'v', carts: 14 },
    Kautoa: { id: 'kautoa', name: 'Kautoa', faction: 'islanders', prefix: 'k', carts: 40 }
  },
  activities: ['SLEEP', 'EAT', 'REST', 'IDLE', 'WORK', 'BUY', 'SOCIALIZE', 'WORSHIP', 'HAUL'],
  indoor: ['SLEEP', 'REST', 'IDLE'],
  home: { per: 5, acts: ['SLEEP', 'EAT', 'REST', 'IDLE'] },
  kinds: {
    'ie-hut-garden': ['home', {}, { cls: 'poor' }], 'ie-hut-scrap': ['home', {}, { cls: 'poor' }],
    'ie-house-uma': ['home', {}, { cls: 'middle' }], 'ie-house-cross': ['home', {}, { cls: 'middle' }], 'ie-house-wealthy': ['home', {}, { cls: 'rich' }],
    'ie-barracks': ['barracks', { WORK: 0 }, { mess: true, posts: 'beds' }], 'ie-watchtower': ['watchtower', { WORK: 3 }],
    'ie-market': ['market', { WORK: 3, BUY: 5, SOCIALIZE: 6 }, { open: [6, 19], out: true, wander: 4, shop: 'market' }],
    'ie-chandler': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 19], shop: 'staples' }],
    'ie-trader': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 19], shop: 'staples' }],
    'ie-butcher': ['butcher', { WORK: 2.5, BUY: 3 }, { open: [6, 18], shop: 'pork' }],
    'ie-bakehouse': ['bakehouse', { WORK: 2.5, BUY: 3 }, { open: [5, 18], shop: 'bread' }],
    'ie-kava-house': ['tavern', { WORK: 2.5, EAT: 6, SOCIALIZE: 8 }, { open: [10, 24], shop: 'meal' }],
    'ie-guesthouse': ['inn', { WORK: 2.5, EAT: 5, SOCIALIZE: 5 }, { open: [6, 23], shop: 'meal' }],
    'ie-weaver': ['weaver', { WORK: 2.5 }], 'ie-potter': ['potter', { WORK: 2.5 }], 'ie-smithy': ['smithy', { WORK: 2.5 }],
    'ie-fishdock': ['fishdock', { WORK: 2.5, BUY: 1 }, { out: true, wander: 6, shop: 'fish' }],
    'ie-quay': ['quay', { WORK: 1.7 }, { out: true, wander: 6 }],
    'ie-warehouse': ['warehouse', { WORK: 2.5 }], 'ie-granary': ['granary', { WORK: 1 }], 'ie-granary-great': ['granary', { WORK: 2 }],
    'ie-windmill': ['mill', { WORK: 2 }], 'ie-pens': ['pens', { WORK: 2.5 }, { out: true, wander: 5 }],
    'ie-hall': ['hall', { WORK: 2.5, SOCIALIZE: 4 }, { open: [7, 21] }], 'ie-harbourmaster': ['customs', { WORK: 2.5 }],
    'ie-canoeshed': ['canoeshed', { WORK: 2.5 }], 'ie-temple': ['temple', { WORK: 2.5, WORSHIP: 8 }, { open: [5, 21] }],
    'ie-school': ['school', { WORK: 2.5 }], 'ie-healer': ['healer', { WORK: 2.5 }]
  },
  field: { field: ['field', { WORK: 0.9 }, { out: true, wander: 8, open: [5, 19] }], orchard: ['orchard', { WORK: 0.55 }, { out: true, wander: 8, open: [5, 19] }] },
  jobs: {
    farmhand: { kinds: ['field', 'orchard', 'pens'] }, fisher: { kinds: ['fishdock'] }, docker: { kinds: ['quay', 'warehouse', 'granary', 'customs'] },
    trader: { kinds: ['market', 'shop', 'butcher'] }, baker: { kinds: ['bakehouse', 'mill'] }, keeper: { kinds: ['tavern', 'inn'] },
    craftsman: { kinds: ['weaver', 'potter', 'smithy'] }, soldier: { kinds: ['barracks', 'watchtower', 'canoeshed'], homes: ['barracks', 'home'], sched: 'watch' },
    official: { kinds: ['hall', 'school', 'healer', 'temple'] }
  },
  sched: {
    work: [[0, 'SLEEP'], [5, 'EAT'], [6, 'WORK'], [17, 'SOCIALIZE'], [19, 'EAT'], [20, 'REST'], [22, 'SLEEP']],
    watch: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [18, 'EAT'], [19, 'SOCIALIZE'], [21, 'SLEEP']],
    kin: [[0, 'SLEEP'], [7, 'EAT'], [8, 'IDLE'], [10, 'SOCIALIZE'], [13, 'REST'], [15, 'SOCIALIZE'], [18, 'EAT'], [19, 'REST'], [21, 'SLEEP']],
    free: ['SOCIALIZE', 'IDLE', 'REST']
  },
  items: {
    foods: ['sweet-potato', 'banana', 'coconut', 'fish', 'pork', 'bread'],
    shops: { market: ['sweet-potato', 'banana', 'coconut', 'fish', 'pork', 'bread'], staples: ['sweet-potato', 'banana', 'coconut', 'fish', 'bread'],
      pork: ['pork'], bread: ['bread'], fish: ['fish'], meal: ['meal'] },
    meals: 2, perMeal: 2, low: 1, days: 3, mins: 15, cool: 120, storeDays: [1.5, 3], eatOut: { base: 0.04, wealth: 0.08 }, wealth: { poor: 0, middle: 0.5, rich: 1 }
  },
  economy: {
    goods: ['sweet-potato', 'banana', 'coconut', 'fish', 'pork', 'bread', 'sugar-cane', 'sugar', 'cotton', 'cloth', 'pots', 'coffee'],
    inputs: { bread: { 'sweet-potato': 1 }, sugar: { 'sugar-cane': 2 }, cloth: { cotton: 2 } },
    every: 30, window: 1, imports: { days: 2, scan: 60 }, cart: { cap: 400, load: 10, unload: 10, minLoad: 40 },
    /* the crops of the parcels (30-isle-programme.js farm) as the economy's goods */
    crops: { 'sweet potato': 'sweet-potato', banana: 'banana', coconut: 'coconut', 'sugar cane': 'sugar-cane', cotton: 'cotton', coffee: 'coffee' },
    /* servings (food) or lots a worker-hour, into the place's own store up to cap */
    producers: {
      field: { rate: 6, cap: 3000 }, orchard: { rate: 6, cap: 3000 }, fishdock: { out: ['fish'], rate: 7, cap: 3000 }, pens: { out: ['pork'], rate: 4, cap: 1500 },
      bakehouse: { out: ['bread'], rate: 5, cap: 1500 }, mill: { out: ['sugar'], rate: 4, cap: 1500 }, weaver: { out: ['cloth'], rate: 0.5, cap: 400 },
      potter: { out: ['pots'], rate: 0.5, cap: 400 }
    },
    warehouses: ['warehouse', 'granary'],
    startDays: 2, startLots: { 'sugar-cane': 0, sugar: 0, cotton: 0, cloth: 40, pots: 40, coffee: 0 }
  }
};
