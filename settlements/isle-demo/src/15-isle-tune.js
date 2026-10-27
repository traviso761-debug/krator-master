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
  /* towns[town].food (optional): a factor on the town's raw food producers' rates; since the production governor (49)
     holds the stocks, none is set (the hand-calibrated 0.786 and 0.804 retired, 2026-10-19) */
  towns: {
    Valapo: { id: 'valapo', name: 'Valapo', faction: 'islanders', prefix: 'v', carts: 20, inputs: { bread: { 'sweet-potato': 1 } } },
    /* Kautoa grows nothing inside its wall: its farms are the programme's farm ring beyond it (`ring`), its bread is taro */
    Kautoa: { id: 'kautoa', name: 'Kautoa', faction: 'islanders', prefix: 'k', carts: 40, inputs: { bread: { taro: 1 } } }
  },
  activities: ['SLEEP', 'EAT', 'REST', 'IDLE', 'WORK', 'BUY', 'SOCIALIZE', 'WORSHIP', 'HAUL', 'STUDY', 'HOUSEWORK'],
  indoor: ['SLEEP', 'REST', 'IDLE'],
  home: { per: 5, acts: ['SLEEP', 'EAT', 'REST', 'IDLE', 'HOUSEWORK'] },
  kinds: {
    'ie-hut-garden': ['home', {}, { cls: 'poor' }], 'ie-hut-scrap': ['home', {}, { cls: 'poor' }],
    'ie-house-uma': ['home', {}, { cls: 'middle' }], 'ie-house-cross': ['home', {}, { cls: 'middle' }], 'ie-house-wealthy': ['home', {}, { cls: 'rich' }],
    'ie-barracks': ['barracks', { WORK: 0 }, { mess: true, posts: 'beds' }], 'ie-watchtower': ['watchtower', { WORK: 3 }],
    'ie-market': ['market', { WORK: 3, BUY: 5, SOCIALIZE: 12 }, { open: [6, 21], out: true, wander: 4, shop: 'market' }],
    'ie-chandler': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 21], shop: 'staples' }],
    'ie-trader': ['shop', { WORK: 3, BUY: 4 }, { open: [6, 21], shop: 'staples' }],
    'ie-butcher': ['butcher', { WORK: 2.5, BUY: 3 }, { open: [6, 18], shop: 'meat' }],
    'ie-bakehouse': ['bakehouse', { WORK: 2.5, BUY: 3 }, { open: [5, 18], shop: 'bread' }],
    'ie-kava-house': ['tavern', { WORK: 2.5, EAT: 6, SOCIALIZE: 16, BUY: 6 }, { open: [10, 24], shop: 'meal' }],
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
    vern_shops: ['shop', { WORK: 3, BUY: 4 }, { open: [6, 21], shop: 'staples' }], vern_tavern: ['tavern', { WORK: 2.5, EAT: 6, SOCIALIZE: 16, BUY: 6 }, { open: [10, 24], shop: 'meal' }],
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
  /* needs, happiness, efficiency, loyalty (core/simulation 77-sim-6-needs.js; owner, 2026-10-19): Voth's table
     (settlements/voth/targets/voth-city/15-vc-tune.js TUNE.sim.needs) ported to the isles' activities. A meter per need,
     0 met to 100 desperate, rises at `rate` an hour (times the role's `byTrade`), more at work by `work` times the
     trade's `labour`, and falls by the activity's `fill` (a meal's by its worth: two foods, seasoned). The isles have no
     wells, taverns for drink or chairs to relax in: drink comes with meals, rest, company (kava, coconuts) and a water
     gourd at work; relax with rest and company; contemplation at the temples, shrines and squares (WORSHIP) and a little
     at school. Material rises slowly and falls with what is bought (`items`' `material`) and by `items.lack` a day for a
     set of clothes short, rising at half Voth's pace (modest wants; the treats below fill it), not at all in the children;
     it opens spread from 0 to the treat's `at` (2026-10-26: a town that has been living, so the treats are bought at a
     steady rate from the first day, not in one wave when every meter reaches `at` together).
     In the hours the schedule gives to one of `free`, a person does what its meters ask among
     them, at an open place within reach. Happiness, its band's efficiency at work, loyalty: as Voth's */
  needs: {
    list: ['eat', 'drink', 'socialize', 'relax', 'contemplate', 'sleep', 'material'],
    rate: { eat: 4, drink: 3, socialize: 2, relax: 2, contemplate: 0.5, sleep: 4.2, material: 0.15 },
    fill: { SLEEP: { sleep: 14, relax: 2, eat: 2, drink: 3 }, WORK: { drink: 6 }, HAUL: { drink: 6 }, REST: { sleep: 6, relax: 10, drink: 8 },
      EAT: { eat: 24, drink: 12, socialize: 1, relax: 1 }, SOCIALIZE: { socialize: 24, relax: 4, drink: 6 }, IDLE: { relax: 7, drink: 8 },
      WORSHIP: { contemplate: 45, socialize: 5 }, STUDY: { contemplate: 10, socialize: 4, drink: 4 }, HOUSEWORK: { drink: 6, socialize: 2, relax: 2 },
      BUY: { socialize: 4, relax: 2 } },
    work: { drink: 4, eat: 1.5, relax: 1 },
    labour: { farmhand: 1, labourer: 1, docker: 1, fisher: 0.8, craftsman: 0.6, groom: 0.6, soldier: 0.6, baker: 0.5, keeper: 0.4, trader: 0.3, official: 0.2 },
    byTrade: { soldier: { material: 0.5 }, official: { contemplate: 1.3 }, child: { material: 0 }, pupil: { material: 0 } },
    weight: { eat: 1.5, drink: 1.5, sleep: 1.3, socialize: 1, relax: 1, contemplate: 0.8, material: 1 },
    traits: { chatty: { socialize: 1.33 }, loner: { socialize: 0.67 }, pious: { contemplate: 1.33 }, worldly: { contemplate: 0.67 }, glutton: { eat: 1.33 },
      ascetic: { eat: 0.67, material: 0.67 }, restless: { relax: 1.33 }, steady: { relax: 0.67 } },
    free: ['SOCIALIZE', 'REST', 'IDLE', 'WORSHIP'], dwell: 60, jitter: 30, keep: 1.25, done: 12,
    bands: [{ label: 'content', min: 70, eff: 1 }, { label: 'uneasy', min: 50, eff: 0.92 }, { label: 'unhappy', min: 30, eff: 0.8 }, { label: 'restless', min: 0, eff: 0.65 }],
    loyalty: { tau: 4320, bands: [{ label: 'loyal', min: 60 }, { label: 'wavering', min: 40 }, { label: 'disloyal', min: 0 }] },
    pain: 1.5, init: { material: [0, 55], eat: [10, 40], drink: [10, 40], socialize: [10, 40], relax: [10, 40], contemplate: [0, 15], sleep: [0, 20] }
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
    worn: { shirt: { cat: 'clothes', slot: 'torso', life: 90, good: 'garments', material: 8 }, wrap: { cat: 'clothes', slot: 'legs', life: 90, good: 'garments', material: 8 },
      sandal: { cat: 'clothes', slot: 'feet', life: 120, good: 'sandals', material: 8 }, cuirass: { cat: 'armour', slot: 'torso', layer: 'armour', life: 180, good: 'armour', material: 10 },
      sarong: { cat: 'clothes', slot: 'legs', life: 90, good: 'garments', material: 8 }, 'sun hat': { cat: 'clothes', slot: 'head', life: 120, good: 'hats', material: 6 },
      club: { cat: 'arms', slot: 'rhand', life: 720, good: 'woodtools', material: 15 } },
    /* the wear plan's steps 4 and 5 (PLAN.md 9b; owner, 2026-10-19): the sets of clothes a person keeps by its home's
       class (Voth's: poor 2, middle 3, rich 4; the worn set wears, the rest wait at home); a sarong in place of the wrap
       for `sarong.share` of people; a pandanus sun hat for those who work outdoors and `hat.share` of the rest; a war club
       for `club.share` of the rich adults (Voth's rich sword); `racks`: the kinds of work that draw their tool from the
       workplace's rack (the dockers' hooks, the soldiers' spears and shields), owning none; injuries: a worked day's
       `hurt` chance, healed by a healer's poultice bought on time off, or in `heal` days (Voth's 0.6%, 3 days) */
    setsBy: { poor: 2, middle: 3, rich: 4 }, sarong: { share: 0.5 }, hat: { share: 0.4, jobs: ['farmhand', 'fisher', 'labourer', 'docker', 'groom'] },
    club: { share: 0.25 }, racks: ['docker', 'soldier'], hurt: 0.006, heal: 3,
    medicine: { poultice: { cat: 'medicine', good: 'poultices' } },
    lack: 4,   /* the material meter a day for each set of clothes short (77-sim-6-items.js) */
    sets: 2, armed: ['soldier'],
    /* the household's cooking pot (owner, 2026-10-19): one a home with a store, kept by its houseworker (an elder or a
       child at home) else its first resident, cracked in `life` days and bought again from the town's pots */
    household: { pot: { cat: 'household', slot: 'lhand', life: 60, good: 'pots', material: 20 } },
    /* the tools (PLAN.md 9b), owned and worn by the worked hour (`workLife`), replaced at once in work time, a worker
       without one at half its pace: the stone tools (adze, harvest knife, maul, scraper) of the farmhands, craftsmen and
       labourers, made in Kautoa's workshops from stone (owner, 2026-10-19: an inefficient use of it, four stones a tool);
       the cooks' pots (the bakers', the innkeepers'). By trade (PLAN.md 9b's table): a worker takes the tool whose
       `kinds` name its workplace, else whose `roles` name its work: the orchards' harvest knives, the smiths', carpenters'
       and tanners' adzes, hammers and scrapers, the labourers' mauls are stone; the field hands' digging sticks, the
       herders' and grooms' goads, the weavers' shuttles, the potters' paddles and the officials' styluses are wood
       (Kautoa's dockyard; Valapo's by the lakatoi until it has a carver's workshop); the fishers' nets are corded
       cotton (the weavers). A stone tool blunts in a thousand worked hours (about three months;
       Voth's iron ones last three to five thousand) */
    tools: { 'stone tool': { cat: 'tool', workLife: 1000, good: 'tools', kinds: ['orchard', 'smithy', 'workshop', 'dockyard', 'tannery'], roles: ['labourer'] },
      'wood tool': { cat: 'tool', workLife: 1500, good: 'woodtools', kinds: ['field', 'pens', 'byre', 'weaver', 'potter'], roles: ['groom', 'official'] },
      net: { cat: 'tool', workLife: 1500, good: 'nets', kinds: ['fishdock'] },
      cookpot: { cat: 'tool', workLife: 1500, good: 'pots', roles: ['baker', 'keeper'] } },
    /* the treats (owner, 2026-10-19; Voth's `treat`): when a person's material meter reaches `treat.at`, it buys on its
       time off the last of `treat.items` its wealth reaches: the poor a bowl of kava at the kava house or tavern, the
       middle a pandanus mat (the weavers) or a coconut-oil lamp (the potters), the rich a lamp or shell-and-bead
       jewellery (Kautoa's workshops); each fills the meter by its `material`. A class's wealth is spread a little a
       person (`wealthSpread`), so the middle and the rich split between two treats */
    treats: { 'kava bowl': { cat: 'luxury', material: 25, good: 'kava' }, mat: { cat: 'household', material: 40, good: 'mats' },
      lamp: { cat: 'household', material: 45, good: 'lamps' }, necklace: { cat: 'luxury', material: 70, good: 'jewellery' } },
    treat: { at: 55, items: [[0, 'kava bowl'], [0.3, 'mat'], [0.5, 'lamp'], [0.85, 'necklace']] },
    wealthSpread: { poor: [0, 0.2], middle: [0.35, 0.65], rich: [0.8, 1] },
    wares: { market: ['shirt', 'wrap', 'sarong', 'sun hat', 'sandal', 'pot', 'stone tool', 'wood tool', 'mat', 'lamp', 'necklace'],
      shop: ['shirt', 'wrap', 'sarong', 'sun hat', 'sandal', 'pot', 'stone tool', 'wood tool', 'mat', 'lamp', 'necklace'],
      weaver: ['shirt', 'wrap', 'mat', 'sarong', 'sun hat', 'net'], workshop: ['sandal', 'stone tool', 'necklace'], smithy: ['cuirass'], potter: ['pot', 'cookpot', 'lamp'], tavern: ['kava bowl'],
      dockyard: ['wood tool', 'club'], fishdock: ['net'], healer: ['poultice'] },
    meals: 2, perMeal: 2, low: 1, days: 3, stagger: 0.5, mins: 15, cool: 120, storeDays: [1, 3.5], eatOut: { base: 0.04, wealth: 0.08 }, wealth: { poor: 0, middle: 0.5, rich: 1 }
  },
  economy: {
    goods: ['sweet-potato', 'taro', 'rice', 'banana', 'coconut', 'fish', 'meat', 'bread', 'sugar-cane', 'sugar', 'cotton', 'cloth', 'pots', 'coffee',
      'clove', 'cacao', 'salt', 'stone', 'leather', 'garments', 'sandals', 'armour', 'tools', 'kava', 'mats', 'lamps', 'jewellery', 'woodtools', 'nets', 'poultices', 'hats'],
    /* each town's bread is its own (towns[town].inputs over these) */
    inputs: { sugar: { 'sugar-cane': 2 }, cloth: { cotton: 2 }, garments: { cloth: 2 }, sandals: { leather: 1 }, armour: { leather: 3 }, tools: { stone: 4 }, lamps: { coconut: 1 }, jewellery: { stone: 1 }, nets: { cotton: 2 } },
    every: 30, window: 1, imports: { days: 2, scan: 60 }, cart: { cap: 400, load: 10, unload: 10, minLoad: 40, urgent: 1 },
    /* a good's own load worth a cart's trip (the cart's minLoad otherwise): the oruwa's light, dear goods land a few dozen
       at a time, under the 40 a cart waits for, and sat at the canoe stop (2026-10-19) */
    minLoad: { clove: 5, cacao: 5, coffee: 5, armour: 5, tools: 5, pots: 10, kava: 10, mats: 10, lamps: 10, jewellery: 5, woodtools: 5, nets: 2, poultices: 5, hats: 10 },
    /* a crop's own rate, times the parcels' (the owner, 2026-10-19: the spice, cane and cacao cut tenfold); the governor
       below holds the rest to what is wanted */
    cropRate: { clove: 0.1, cacao: 0.1, 'sugar-cane': 0.1, cotton: 1 },
    /* the production governor (49), an order-up-to rule: a producer's rate is its full one times what is wanted of its
       good (demand, plus `alpha` of the gap to `cover` days of it, closed over `ti` days) over what it makes at full,
       clamped to [min, max], looked at every `every` minutes, its estimates smoothed over `smooth` days, its demand over the
       last `window` whole days (the households' three-day restocking round); `minBy` a lower floor for a good whose makers
       far outstrip its trade (the weavers' mats, the taverns' kava, the pots). A maker of several goods (the weavers, the
       potters) makes whichever is furthest below its target, its unmet draws counted as use (`useShort`, 2026-10-26: a
       good its buyers could not get is still made); `least` the shelf stock of the treats and the gear a town keeps with
       no demand (a town at the abstract level buys none: watched again, its people find them) */
    govern: { every: 60, cover: 3, ti: 1.5, alpha: 0.3, min: 0.3, max: 1.5, smooth: 2, window: 3, minBy: { mats: 0.02, kava: 0.05, pots: 0.1, hats: 0.02, nets: 0.02 },
      least: { kava: 300, mats: 200, lamps: 400, hats: 200, jewellery: 50, pots: 300, garments: 300, sandals: 200, tools: 60, woodtools: 60, nets: 10, poultices: 50 } },
    /* spoilage (49): the share of a perishable's stock in the warehouses and at the sites that rots each night (fish and
       meat about a month, bread a fortnight, fruit and roots slower, grain and spice slowest; cloth, pots, salt and
       metal never) */
    spoil: { fish: 0.04, meat: 0.04, bread: 0.06, banana: 0.04, coconut: 0.01, 'sweet-potato': 0.015, taro: 0.015, rice: 0.003,
      'sugar-cane': 0.03, cotton: 0.002, clove: 0.002, cacao: 0.003, coffee: 0.002, sugar: 0.001 },
    /* the crops of the parcels (30-isle-programme.js farm) as the economy's goods */
    crops: { 'sweet potato': 'sweet-potato', banana: 'banana', coconut: 'coconut', 'sugar cane': 'sugar-cane', cotton: 'cotton', coffee: 'coffee',
      rice: 'rice', taro: 'taro', cloves: 'clove', cacao: 'cacao' },
    /* servings (food) or lots a worker-hour, into the place's own store up to cap */
    producers: {
      field: { rate: 6, cap: 3000 }, orchard: { rate: 6, cap: 3000 }, fishdock: { out: ['fish'], rate: 7, cap: 3000 }, pens: { out: ['meat'], rate: 4, cap: 1500 },
      bakehouse: { out: ['bread'], rate: 6, cap: 1500 }, mill: { out: ['sugar'], rate: 4, cap: 1500 }, weaver: { out: ['cloth', 'garments', 'mats', 'hats', 'nets'], rate: 2, cap: 600 },
      potter: { out: ['pots', 'lamps'], rate: 0.2, cap: 400 }, tavern: { out: ['kava'], rate: 1.5, cap: 600 },
      dockyard: { out: ['woodtools'], rate: 0.1, cap: 400 }, healer: { out: ['poultices'], rate: 0.25, cap: 200 }, byre: { out: ['meat'], rate: 6, cap: 1500 }, quarry: { out: ['stone'], rate: 0.4, cap: 400 },
      saltworks: { out: ['salt'], rate: 2, cap: 1500 }, tannery: { out: ['leather'], rate: 0.5, cap: 400 },
      /* the clothes and the armour (2026-10-19): the weavers make cloth and garments from it (above), the Vernacular's
         workshops sandals from leather and stone tools, whichever the town has fewer days of, the smithies leather
         armour (until the iron mine brings ore), and shell-and-bead jewellery (a stone a piece); the potters pots and
         coconut-oil lamps (a coconut a lamp), about seven worker-hours each, and the weavers cloth, garments and mats,
         place by place in turn (a list of two picks the good the town has fewer days of, and core counts a good nobody
         could buy as never running out); the kava houses and taverns brew kava; the dockyard carves the wooden tools and the clubs; the healers make poultices from
         their herb gardens; the weavers' places take hats and nets too (three in eight on cloth, two on garments) */
      workshop: { out: ['sandals', 'tools', 'jewellery'], rate: 0.6, cap: 400 }, smithy: { out: ['armour'], rate: 0.002, cap: 100 }
    },
    warehouses: ['warehouse', 'granary'],
    /* a town opens with `startDays` of its food, each food in its share of the town's making (its producers' posts times
       rate), and these lots of the other goods it makes (not of what it must import) */
    startDays: 3, startLots: { cloth: 1000, pots: 500, garments: 500, sandals: 200, armour: 20, salt: 300, sugar: 300, clove: 60, cacao: 60, stone: 40, leather: 40, tools: 60, kava: 300, mats: 200, lamps: 400, jewellery: 50, woodtools: 60, nets: 10, poultices: 50, hats: 200 },
    /* salt (owner, 2026-10-19): a preserver, so `keep` of the fish and the meat that would spoil in a night is salted
       instead where the town's warehouses hold salt, a salt for `per` servings kept; and an improver of meals: while a
       town holds salt its people season their food (`uses`), and a meal at home counts `season` times its foods' quality */
    salt: { keeps: ['fish', 'meat'], keep: 0.75, per: 4, season: 1.15 }
  },
  /* P7c, the canoe line between the two trade landings (owner, 2026-10-19), on core/simulation's SIM.trade (47):
     uses     what each town uses a day, a person, of what the other makes (8c: Kautoa's salt, rice, cloves and cacao in
              Valapo's kitchens; Valapo's sugar in Kautoa's; and Kautoa's own salt, seasoning its food), drawn on its
              warehouses every hour: the want the line serves
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
        { id: 'hykkousoi', name: 'Hykkousoi traders', vessel: 'hykCorbita', every: 5, phase: 2, calls: ['kautoa', 'valapo'], buys: { clove: 800, sugar: 200, iron: 300 } },
        { id: 'salvagers', name: 'Ancient salvagers', vessel: 'salvageTug', every: 6, phase: 3, calls: ['kautoa'], buys: { cacao: 300, clove: 300 } },
        { id: 'outer', name: 'Islanders of the outer isles', vessel: 'islanderLakatoi', every: 2, phase: 1, calls: ['valapo', 'kautoa'], buys: { sugar: 100, coffee: 100, clove: 200, cacao: 200 } }
      ] },
    uses: { valapo: { salt: 0.02, clove: 0.004, cacao: 0.008 }, kautoa: { sugar: 0.02, salt: 0.02 } },
    /* the other town's foods a town eats (2026-10-26), servings a person a day: on its shelves and in its meals at that
       share of its diet (44, core's SIM.itemsDiet), the canoe line bringing what is eaten (Kautoa's rice in Valapo) */
    diet: { valapo: { rice: 0.05 } },
    lines: [
      { id: 'lakatoi', vessel: 'islanderLakatoi', cap: 3000, carriers: 2, minutes: 1200, mins: 240, keep: 1, want: 6,
        goods: { kautoa: ['salt', 'rice', 'sandals', 'armour', 'tools', 'jewellery', 'woodtools'], valapo: ['sugar', 'garments', 'nets'] } },
      { id: 'oruwa', vessel: 'islanderOruwa', cap: 150, carriers: 1, minutes: 600, mins: 120, keep: 1, want: 2,
        goods: { kautoa: ['clove', 'cacao'], valapo: ['coffee'] } }
    ]
  },
  /* THE HAMLETS IN THE SIM (core/hamlet H5, 2026-10-26; 47h): the resource villages (core/hamlet's KHAMLET.village
     records: the open world's four, openworld/isle-demo 48) as settlements of their parent town, at the abstract level
     always (books and carts, nobody posed). Declared only when a page hands them in, so a page without villages keeps
     its towns' economies as they were.
       kinds       a record's key -> [the place's kind, {its activities}] (a works' WORK slots are its culture row's jobs;
                   a house's beds its households times the row's household)
       producers   a works' kind -> its recipe (out, rate a worker-hour, cap), as the towns' (44)
       carts       a village's carts; startDays of the parent's foods in its warehouse, `startLots` of its own goods
       road        the carts between a village and its town: a convoy at `kmh` over the straight line times `detour`, a
                   stay of `mins`; `cap` a load. Two routes a village: OUT, all it makes but its own use (`keep` 0, the want
                   unbounded: the village works for its town); IN, the parent's foods it eats (its want, `want` days)
       town        what the villages' goods feed in their towns: new `inputs` (the tannery's leather from hides, the
                   dockyard's wooden tools from timber, the smithies' iron from ore and charcoal), `recipes` for a kind's
                   places that have none (Valapo's smithies, idle till now, smelt iron), `uses` a person a day drawn hourly (Kautoa builds with timber),
                   `expect` a day on the lakatoi (the charcoal Valapo's smelting wants before any has come) */
  hamlets: {
    kinds: {
      house: ['home', { SLEEP: 1, EAT: 1, REST: 1, IDLE: 1, HOUSEWORK: 1 }],
      'ie-saltworks': ['saltworks', {}], 'ie-mine': ['mine', {}], 'ie-sawpit': ['sawpit', {}], 'ie-kiln': ['kiln', {}],
      'ie-byre': ['byre', {}], 'ie-pens': ['pens', {}], 'ie-corral': ['corral', {}], br_bldg_raptor_stable: ['stable', {}], br_bldg_rookery_tower: ['rookery', {}],
      warehouse: ['warehouse', {}], food: ['staples', { BUY: 6 }], general: ['trader', { BUY: 4 }], civic: ['hall', { SOCIALIZE: 30 }], religious: ['shrine', { WORSHIP: 20 }]
    },
    producers: {
      saltworks: { out: ['salt'], rate: 0.6, cap: 3000 }, mine: { out: ['ore'], rate: 0.6, cap: 3000 },   /* raking a pan by hand: slower than the town's boiling works */
      sawpit: { out: ['timber'], rate: 0.5, cap: 3000 }, kiln: { out: ['charcoal'], rate: 1, cap: 3000 },
      byre: { out: ['meat'], rate: 4, cap: 1500 }, pens: { out: ['meat'], rate: 4, cap: 1500 }, corral: { out: ['hides'], rate: 0.6, cap: 1000 }
    },
    goods: ['ore', 'timber', 'charcoal', 'hides', 'iron'],
    minLoad: { ore: 20, timber: 20, charcoal: 20, hides: 10, iron: 10 },
    carts: 2, startDays: 3, startLots: { ore: 100, timber: 100, charcoal: 100, hides: 60, salt: 100 },
    road: { kmh: 4, detour: 1.3, mins: 90, cap: 4000, keep: 1, want: 6 },
    town: {
      kautoa: { inputs: { leather: { hides: 1 }, woodtools: { timber: 1 } }, uses: { timber: 0.02 }, startLots: { hides: 200, timber: 200, charcoal: 100 } },
      valapo: { inputs: { iron: { ore: 2, charcoal: 1 } }, recipes: { smithy: { out: ['iron'], rate: 0.5, cap: 600 } }, startLots: { ore: 200, charcoal: 100 } }
    },
    lakatoi: { kautoa: ['charcoal'], valapo: ['iron'] }, expect: { valapo: { charcoal: 60 } }
  }
};
