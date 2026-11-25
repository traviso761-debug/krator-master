/* ==================== core/hamlet 20: the culture rows (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 3. A culture row says which buildings a village of that culture is made of, so a Voth, Iziz
   or nomad hamlet is another row and the same code. Keys are the building kit's def keys; the host's dims(key) gives
   their footprints. A key the kit does not have yet is listed under `pending` with a declared box: the generator places
   its footprint, and the host draws a stand-in until the kit has the building (PLAN.md section 3 lists them).
     household          people a household
     workShare          the share of a village that works
     slopeMax           the steepest ground a building stands on (rise over run)
     religious, civic, general, food, warehouse   one key each (the warehouse may repeat)
     services           jobs at each of those
     houses             [key, households it holds, weight] by class: poor and middling are drawn by weight; head is the
                        headman's (one)
     works[focus]       [{key, jobs, share}]: the works a focus is staffed by, the jobs each building holds, and the
                        share of the focus's jobs it takes
     focusJobs[focus]   the jobs a focus wants when the resource gives no count (a node never runs out)
     reach[focus]       how far from the village point its works may stand (m): a mine within its node's radius */
KHAMLET.CULTURES = KHAMLET.CULTURES || {};
KHAMLET.CULTURES.islander_east = {
  kit: 'islanders', household: 4.5, workShare: 0.45, slopeMax: 0.35,
  religious: 'ip-shrine', civic: 'ie-hall', general: 'ie-trader',
  food: 'ie-store-food',
  warehouse: 'ie-warehouse',
  services: {religious: 2, civic: 3, general: 2, food: 3, warehouse: 4},
  houses: {
    poor: [['ie-hut-garden', 1, 3], ['ie-house-shared', 2, 3], ['ie-house-uma', 3, 1]],
    middling: [['ie-house-long', 3, 2], ['ie-house-twin', 2, 2], ['ie-house-cross', 2, 1], ['ie-house-clan', 4, 1]],
    head: [['ie-house-chief', 1, 1]],
    middlingShare: 0.35
  },
  works: {
    salt: [{key: 'ie-saltworks', jobs: 12, share: 1}],
    mine: [{key: 'ie-mine', jobs: 20, share: 1}],
    quarry: [{key: 'ie-quarry', jobs: 12, share: 1}],   /* a stone quarry (2026-11-04: Valapo's, the isle demo), smaller than a mine */
    clay: [{key: 'ie-claypit', jobs: 8, share: 1}],   /* a clay pit by a stream (2026-11-09: the isle demo's potters' clay), the smallest works village */
    lumber: [{key: 'ie-sawpit', jobs: 14, share: 0.7}, {key: 'ie-kiln', jobs: 6, share: 0.3}],
    ranch: [{key: 'ie-byre', jobs: 6, share: 0.35}, {key: 'ie-pens', jobs: 4, share: 0.15}, {key: 'ie-corral', jobs: 4, share: 0.2},
            {key: 'br_bldg_raptor_stable', jobs: 6, share: 0.2}, {key: 'br_bldg_rookery_tower', jobs: 6, share: 0.1}],
    fishing: [{key: 'ie-fishdock', jobs: 12, share: 0.7}, {key: 'ie-canoeshed', jobs: 8, share: 0.3}],
    farming: [{key: 'ie-farm', jobs: 10, share: 0.85}, {key: 'ie-granary', jobs: 2, share: 0.15}]
  },
  focusJobs: {salt: 110, mine: 120, quarry: 48, clay: 24, lumber: 100, ranch: 70, fishing: 100, farming: 140},
  reach: {salt: 300, mine: 400, quarry: 300, clay: 250, lumber: 600, ranch: 900, fishing: 250, farming: 700},
  /* the landing a coastal village gets (30: spec.landing; the owner, 2026-11-09): the Islanders' quay with its cargo shed, its dockers' jobs */
  landing: {key: 'ie-quay', jobs: 3},
  /* boxes for keys a host may not load (the ranch's mounts are the Beast Riders kit's, kits/beast-riders: a host without
     that kit's boxes places these footprints and draws stand-ins). The Islanders' own hamlet works are in the kit since
     2026-10-19 (kits/islanders/src/69-ie-hamlet.js: ie-sawpit, ie-kiln, ie-corral, ie-store-food, ie-bloomery) */
  pending: {
    'br_bldg_raptor_stable': {w: 23, d: 24, h: 11, what: 'raptor stable (kits/beast-riders)'},
    'br_bldg_rookery_tower': {w: 13.5, d: 13.5, h: 26.5, what: 'rookery tower (kits/beast-riders)'}
  }
};
/* Xanadu's valley folk (settlements/xanadu, the building kit; settlements/longsong's three villages round the monastery,
   2026-10-20): whitewashed and rammed-earth houses under flat roofs with the maroon twig band, a temple, the Farmers'
   Guild's hall for the headmen, a bazaar row, a teahouse, a granary, farmsteads and the windmill (asbad). The kit has its
   pens, corral and dairy now (xa_pens, xa_corral, xa_dairy, kits/xanadu/src/76-xa-farm.js); the boxes below stay pending,
   so a host without the kit's boxes still places them (it draws its own). This literal is the base of the full row below
   (KHAMLET.xanaduRow), which replaces it as KHAMLET.CULTURES.xanadu */
KHAMLET.CULTURES.xanadu = {
  kit: 'xanadu', household: 5.5, workShare: 0.45, slopeMax: 0.22,
  religious: 'xa_temple', civic: 'xa_guild_farm', general: 'xa_shops', food: 'xa_teahouse', warehouse: 'xa_granary',
  services: {religious: 2, civic: 3, general: 3, food: 4, warehouse: 3},
  houses: {
    poor: [['xa_poor_c', 1, 3], ['xa_poor_a', 2, 2], ['xa_poor_b', 3, 1]],
    middling: [['xa_mid_b', 2, 2], ['xa_mid_a', 2, 1], ['xa_mid_c', 4, 1]],
    head: [['xa_rich_a', 1, 1]],
    middlingShare: 0.4
  },
  works: {
    farming: [{key: 'xa_farmhouse', jobs: 10, share: 0.75}, {key: 'xa_granary', jobs: 5, share: 0.15}, {key: 'xa_windmill', jobs: 6, share: 0.1}],
    ranch: [{key: 'xa_farmhouse', jobs: 8, share: 0.45}, {key: 'xa_pens', jobs: 3, share: 0.2}, {key: 'xa_corral', jobs: 4, share: 0.2},
            {key: 'xa_dairy', jobs: 4, share: 0.15}],
    /* 2026-11-11 (openworld/oidong-highrift): the Order's work camp in the Singing Gjar's dead fissures (optical quartz,
       chalcedony, sulfur, copper salts): adits and the sorting shed, a smithy for the picks */
    mine: [{key: 'xa_adit', jobs: 8, share: 0.55}, {key: 'xa_workshop', jobs: 8, share: 0.3}, {key: 'xa_smithy', jobs: 6, share: 0.15}],
    /* the silk and paper village (Longsong's ring): mulberry farmsteads, the reeling house, the paper mill on the water */
    silk: [{key: 'xa_farmhouse', jobs: 8, share: 0.4}, {key: 'xa_workshop', jobs: 8, share: 0.35}, {key: 'xa_watermill', jobs: 6, share: 0.25}]
  },
  focusJobs: {farming: 90, ranch: 50, mine: 40, silk: 52},
  reach: {farming: 420, ranch: 520, mine: 400, silk: 380},
  pending: {
    'xa_pens': {w: 14, d: 14, h: 1.5, what: 'a stone pen'},
    'xa_corral': {w: 20, d: 20, h: 1.4, what: 'a corral for the dzo'},
    'xa_dairy': {w: 10, d: 7, h: 4.6, what: 'a dairy (butter, cheese)'},
    'xa_adit': {w: 8, d: 6, h: 4, what: 'a mine adit (a timbered mouth and its spoil)'}
  }
};
/* ---------------------------------------------------------------- the Xanadu row's full form (folded from core/hamlet/xanadu/23,
   Stage 8 B8: T11, T12, D11). The literal above is the base; the row registered as `xanadu` is KHAMLET.xanaduRow()'s default,
   so every Xanadu village has the wayside shrine, the mine head among a mine's works and the fishing works (the owner's D11,
   2026-11-23: it moves every Xanadu village). settlements/xanadu/BUILD-OUT.md section 4b; core/simulation/PROPOSAL-XANADU.md 3e.

     KHAMLET.xanaduRow(opts) -> a fresh row: the base above with
       fishing   the boat shed and the fish racks with their smokehouse, the quay as the landing a shore village gets
                 (spec.landing): what Kirstabal's fishingRow laid, key for key and number for number
       orchard   farmsteads, the cacao fermentary, the apiary (the trees themselves are land, as farming's fields are:
                 14-hamlet-farmland.js lays them; the kit has no orchard plot, 89-xa-trades.js lists it as a gap)
       tea       farmsteads and the tea factory (the tea garden)
       saffron   farmsteads and the saffron house (the drying loft)
       estate    a temple estate's village, tithing to a temple: farmsteads, the tithe granary, the apiary (the temple's wax)
       placer    gold washing: the placer sluices on the stream, the gold room (a workshop), a smithy
       pottery   (proposed) the kiln yard and the throwing shed (a workshop)
       quarry    (proposed) the quarry face and masons' yard, a smithy for the picks
       silk      the reeling house in the workshop's place, a loom house and a dye works beside the paper mill (the watermill)
       farming, ranch   as the base has them
       mine      as the base has it, with the mine head beside the adits (opts.mineHead)
       mill      (2026-11-23, settlements/xanadu/WORKS-PLAN.md W1: Kold-Lod's mill camp) the stamp mills and the ore
                 yard's tables, the smithy for the picks and drills, the workshops, the muleteers' corrals for the ore
                 train, a placer sluice washing the tailings, and the Golden Tears' watch post (share 0: one building)
       diggings  (the same: Opal Valley Mines' diggings) open cuts and short adits with their small mine heads, the
                 sorting sheds where the potch is broken for colour, a workshop
       landing   (the same: Opal Valley Mines' factor's landing) the Sultan's factor's warehouses, the watch house, the
                 assay room (a workshop), the boatmen's boat sheds; the quay as the landing (spec.landing)
     opts (each `x == null ? default : x`):
       shrine    (true) a wayside shrine in every village: one xa_wayside_shrine among the works (share 0: one building,
                 no focus jobs taken), the works lane its wayside. false: no shrine
       mineHead  (true) the mine head among a mine's works. false: the base's mine works
       shallows  (false) a shore in the shallows: the fishing works add the fishponds and the mat shed with its reed racks
                 (the boat shed and racks keep the larger shares)
       camp      (false) a work camp (openworld/oidong-highrift's Vein Camp): the camp overrides below, its people nearly
                 all at work in bunkhouses, the miners' shrine as its religious building when opts.shrine is on (and no
                 second shrine among the works). With shrine and mineHead false it is the Vein Camp's row, key for key
     row.camp     the camp overrides on every row this returns: KHAMLET.census takes them when spec.camp (30)
     KHAMLET.XANADU_FOCI       the foci the row answers, in order
     KHAMLET.XANADU_FOCUS_INFO what each new focus works on and the kit keys it draws, for a host's labels and checks
   A host may still pass KHAMLET.xanaduRow(opts) as spec.culture (a shallows shore, a camp); `xanadu` by name is the default.

   Keys. Every key is the Xanadu kit's (kits/xanadu: XAK.dims on a page). The ones the kit's src does not have yet are
   under `pending` with a declared box, so a page that lacks them places their footprints and draws stand-ins (the record
   says `pending` while dims(key) answers nothing): the works pieces in kits/xanadu/extra/88g-xa-works.js (kiln yard,
   saffron house, placer sluice, mine head, quarry yard, wayside shrine, apiary, dye works, loom house, reeling house, mat
   shed, fishponds) and the base's adit. A page that loads 88g answers dims for them and the boxes here are not used. No
   focus name enters a seed: the village a focus lays depends on its row's numbers only. */
(function () {
  var BASE = KHAMLET.CULTURES.xanadu;
  var W = function (key, jobs, share) { return {key: key, jobs: jobs, share: share}; };
  var SHRINE = 'xa_wayside_shrine';
  /* the boxes of the keys the kit's src lacks (w, d, h in m; the kit's own boxes win when the page has them) */
  var PENDING = {
    'xa_kiln_yard': {w: 24, d: 20, h: 7, what: 'a kiln yard: the potters\' kilns round a drying court'},
    'xa_saffron_house': {w: 16, d: 12, h: 9, what: 'a saffron house: the drying loft over the picking floor'},
    'xa_placer_sluice': {w: 30, d: 8, h: 3, what: 'a placer sluice: the long box of riffles on the stream, its tailings'},
    'xa_mine_head': {w: 16, d: 14, h: 10, what: 'a mine head: the winding frame and the ore shed'},
    'xa_quarry_yard': {w: 30, d: 24, h: 6, what: 'a quarry face\'s foot and the masons\' yard'},
    'xa_wayside_shrine': {w: 4, d: 4, h: 4.5, what: 'a wayside shrine (a small chorten and its prayer wall)'},
    'xa_apiary': {w: 14, d: 10, h: 3.5, what: 'an apiary: the hive walls and the honey house'},
    'xa_dye_works': {w: 22, d: 18, h: 5, what: 'a dye works: the vats and the drying lines'},
    'xa_loom_house': {w: 24, d: 14, h: 7, what: 'a loom house'},
    'xa_reeling_house': {w: 20, d: 14, h: 8, what: 'a reeling house: the cocoon basins and the reels'},
    'xa_mat_shed': {w: 18, d: 12, h: 5, what: 'a mat shed and its reed racks'},
    'xa_fishponds': {w: 30, d: 24, h: 1.2, what: 'fishponds: stone-walled pens in the shallows'},
    'xa_fish_racks': {w: 16, d: 11, h: 3.6, what: 'fish racks and a smokehouse'},
    /* kits/xanadu/extra/88l-xa-mine-works.js (2026-11-23, WORKS-PLAN.md W1): the kit's own boxes win on a page that loads it */
    'xa_stamp_mill': {w: 24, d: 22, h: 13, what: 'a stamp mill: batteries of stamps on a water wheel, the ore bins above, the tables below'},
    'xa_sorting_shed': {w: 30, d: 11, h: 5.5, what: 'a sorting shed: long and open-sided, the benches under it'},
    /* the watch line's post (kits/xanadu 80g: its box is XFORT.post()'s 12 x 11 m and 6 m of yard, read here for a host without the kit) */
    'xa_fort_post': {w: 18, d: 17, h: 10, what: 'a watch post: a square tower, its fire basket, a fuel store, a hut'}
  };
  /* the work camp's overrides (openworld/oidong-highrift's Vein Camp, number for number) */
  var CAMP = {workShare: 0.9, household: 4,
    services: {religious: 0, civic: 1, general: 1, food: 2, warehouse: 1},
    houses: {poor: [['xa_poor_b', 3, 2], ['xa_mid_c', 4, 1]], middling: [['xa_mid_c', 4, 1]], head: [['xa_rich_a', 1, 1]], middlingShare: 0}};
  var FOCI = ['farming', 'ranch', 'mine', 'silk', 'fishing', 'orchard', 'tea', 'saffron', 'estate', 'placer', 'pottery', 'quarry', 'mill', 'diggings', 'landing'];
  var copyHouses = function (H) {
    var c = function (list) { return list.map(function (h) { return h.slice(); }); };
    return {poor: c(H.poor), middling: c(H.middling), head: c(H.head), middlingShare: H.middlingShare};
  };

  KHAMLET.XANADU_FOCI = FOCI.slice();
  KHAMLET.XANADU_FOCUS_INFO = {
    fishing: {resource: 'a lake shore (the landing: spec.landing)', keys: ['xa_boatshed', 'xa_fish_racks'], landing: 'xa_quay', shallows: ['xa_fishponds', 'xa_mat_shed']},
    orchard: {resource: 'orchard land (cacao, apricot, the strawberry-tree)', keys: ['xa_farmhouse', 'xa_fermentary', 'xa_apiary']},
    tea: {resource: 'a tea garden on the terraces', keys: ['xa_farmhouse', 'xa_tea_factory']},
    saffron: {resource: 'crocus fields', keys: ['xa_farmhouse', 'xa_saffron_house']},
    estate: {resource: 'a temple\'s land (the village tithes to the temple)', keys: ['xa_farmhouse', 'xa_granary', 'xa_apiary']},
    placer: {resource: 'a gold-bearing stream (the host gives its point as spec.resource)', keys: ['xa_placer_sluice', 'xa_workshop', 'xa_smithy']},
    pottery: {resource: 'a clay bed', keys: ['xa_kiln_yard', 'xa_workshop'], proposed: true},
    quarry: {resource: 'a stone face', keys: ['xa_quarry_yard', 'xa_smithy'], proposed: true},
    mill: {resource: 'water for the wheels below a lode (the ore comes down from the adits)', keys: ['xa_stamp_mill', 'xa_smithy', 'xa_workshop', 'xa_corral', 'xa_placer_sluice', 'xa_fort_post'], proposed: true},
    diggings: {resource: 'a potch line\'s outcrop (opal)', keys: ['xa_mine_head', 'xa_adit', 'xa_sorting_shed', 'xa_workshop'], proposed: true},
    landing: {resource: 'a lake shore (the quay: spec.landing)', keys: ['xa_warehouse', 'xa_watch', 'xa_workshop', 'xa_boatshed'], landing: 'xa_quay', proposed: true}
  };

  KHAMLET.xanaduRow = function (opts) {
    var o = opts || {};
    var shrine = o.shrine == null ? true : !!o.shrine, mineHead = o.mineHead == null ? true : !!o.mineHead;
    var shallows = o.shallows == null ? false : !!o.shallows, camp = o.camp == null ? false : !!o.camp;
    var X = BASE, k;
    var works = {};
    for (k in X.works) works[k] = X.works[k].map(function (w) { return W(w.key, w.jobs, w.share); });
    if (mineHead) works.mine = [W('xa_adit', 8, 0.45), W('xa_mine_head', 12, 0.15), W('xa_workshop', 8, 0.25), W('xa_smithy', 6, 0.15)];
    /* the reeling house in the workshop's place, the paper mill on the water kept, a loom house and a dye works */
    works.silk = [W('xa_farmhouse', 8, 0.35), W('xa_reeling_house', 10, 0.3), W('xa_watermill', 6, 0.15), W('xa_loom_house', 10, 0.1), W('xa_dye_works', 6, 0.1)];
    works.fishing = shallows
      ? [W('xa_boatshed', 8, 0.4), W('xa_fish_racks', 4, 0.3), W('xa_fishponds', 6, 0.15), W('xa_mat_shed', 6, 0.15)]
      : [W('xa_boatshed', 8, 0.55), W('xa_fish_racks', 4, 0.45)];
    works.orchard = [W('xa_farmhouse', 10, 0.6), W('xa_fermentary', 12, 0.25), W('xa_apiary', 8, 0.15)];
    works.tea = [W('xa_farmhouse', 10, 0.45), W('xa_tea_factory', 50, 0.55)];
    works.saffron = [W('xa_farmhouse', 10, 0.45), W('xa_saffron_house', 12, 0.55)];
    works.estate = [W('xa_farmhouse', 10, 0.6), W('xa_granary', 9, 0.2), W('xa_apiary', 9, 0.2)];
    works.placer = [W('xa_placer_sluice', 8, 0.7), W('xa_workshop', 8, 0.2), W('xa_smithy', 6, 0.1)];
    works.pottery = [W('xa_kiln_yard', 12, 0.7), W('xa_workshop', 8, 0.3)];
    works.quarry = [W('xa_quarry_yard', 40, 0.75), W('xa_smithy', 12, 0.25)];
    works.mill = [W('xa_stamp_mill', 40, 0.4), W('xa_smithy', 8, 0.15), W('xa_workshop', 10, 0.15), W('xa_corral', 12, 0.2),
                  W('xa_placer_sluice', 10, 0.1), W('xa_fort_post', 1, 0)];
    works.diggings = [W('xa_mine_head', 10, 0.3), W('xa_adit', 8, 0.25), W('xa_sorting_shed', 16, 0.35), W('xa_workshop', 8, 0.1)];
    works.landing = [W('xa_warehouse', 20, 0.35), W('xa_watch', 6, 0.1), W('xa_workshop', 8, 0.25), W('xa_boatshed', 8, 0.3)];
    /* the wayside shrine: one in every village (share 0 gives one building and takes no focus jobs, core/hamlet 30's
       census); a camp's shrine is its religious building instead */
    if (shrine && !camp) for (k in works) works[k].push(W(SHRINE, 1, 0));
    var focusJobs = {}, reach = {};
    for (k in X.focusJobs) focusJobs[k] = X.focusJobs[k];
    for (k in X.reach) reach[k] = X.reach[k];
    var J = {fishing: 90, orchard: 80, tea: 90, saffron: 70, estate: 90, placer: 40, pottery: 36, quarry: 48, mill: 120, diggings: 120, landing: 60};
    var R = {fishing: 260, orchard: 420, tea: 420, saffron: 380, estate: 420, placer: 400, pottery: 300, quarry: 300, mill: 380, diggings: 420, landing: 300};
    for (k in J) { focusJobs[k] = J[k]; reach[k] = R[k]; }
    var pending = {};
    for (k in X.pending) pending[k] = Object.assign({}, X.pending[k]);
    for (k in PENDING) pending[k] = Object.assign({}, PENDING[k]);
    var row = Object.assign({}, X, {
      services: Object.assign({}, X.services), houses: copyHouses(X.houses),
      works: works, focusJobs: focusJobs, reach: reach, pending: pending,
      landing: {key: 'xa_quay', jobs: 3},
      camp: {workShare: CAMP.workShare, household: CAMP.household, services: Object.assign({}, CAMP.services), houses: copyHouses(CAMP.houses),
             religious: shrine ? SHRINE : X.religious}
    });
    if (camp) {
      row.workShare = CAMP.workShare; row.household = CAMP.household;
      row.services = Object.assign({}, CAMP.services); row.houses = copyHouses(CAMP.houses);
      if (shrine) row.religious = SHRINE;
    }
    return row;
  };
  /* the row every Xanadu village is laid on by name: the full form's default (shrine and mine head on, no shallows, no camp) */
  KHAMLET.CULTURES.xanadu = KHAMLET.xanaduRow();
})();
/* The History Monks' houses (openworld/oidong-highrift, 2026-11-11): the Order's own row, in the Xanadu building kit's
   pieces. A house is a village whose people are nearly all at work (monks, novices, lay brothers): the chapter house is
   its civic heart, the chapel its religious one, the refectory its food, dormitories its houses (four households of
   monks each) and the abbot's lodging its head. Its works are the Order's: the scriptorium and listening hall, the lens
   house and the relic works, the smithy for its own upkeep. No mill, furnace or foundry: the Order keeps light crafts
   for maintenance and its relic crafting, and no heavy industry (the owner, 2026-11-11). */
KHAMLET.CULTURES.order = {
  kit: 'xanadu', household: 6, workShare: 0.85, slopeMax: 0.22,
  religious: 'xa_temple', civic: 'xa_monastery', general: 'xa_shops', food: 'xa_teahouse', warehouse: 'xa_granary',
  services: {religious: 6, civic: 8, general: 3, food: 8, warehouse: 3},
  houses: {
    poor: [['xa_mid_c', 4, 3], ['xa_mid_b', 2, 1]],
    middling: [['xa_mid_a', 2, 1]],
    head: [['xa_rich_a', 1, 1]],
    middlingShare: 0.15
  },
  works: {
    /* the scriptorium and listening hall, the lens house, the relic works (gilt reliquaries, crystal), the smithy */
    monastery: [{key: 'xa_guild_gold', jobs: 30, share: 0.45}, {key: 'xa_workshop', jobs: 10, share: 0.25},
                {key: 'xa_guild_alch', jobs: 16, share: 0.2}, {key: 'xa_smithy', jobs: 6, share: 0.1}]
  },
  focusJobs: {monastery: 260},
  reach: {monastery: 300}
};
KHAMLET.FOCI = ['salt', 'mine', 'quarry', 'clay', 'lumber', 'ranch', 'fishing', 'farming'];
