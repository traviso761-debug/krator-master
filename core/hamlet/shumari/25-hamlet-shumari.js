/* ==================== core/hamlet 25 (opt-in): the Shumari plateau row and work-camp row, passed by name (plain data, [G data]) ==================== */
/* settlements/shumar/BUILD-OUT.md section 4b and wave 0.3; core/simulation/PROPOSAL-SHUMAR.md (SHUMAR_TUNE).
   OPT-IN: this file sits in a subfolder that no build lists unless it asks for it by name, and test-hamlet.js loads only
   core/hamlet/NN-hamlet-*.js, so adding it changes no page's bytes (core/hamlet/shumari/README.md). It registers nothing on
   KHAMLET.CULTURES or KHAMLET.FOCI: it gives functions, and a host passes the row returned as spec.culture (KHAMLET.village
   takes a row object as well as a row name). The row folds into 20-hamlet-cultures.js on the next all-builds rebuild.

     KHAMLET.shumariRow(opts)     -> a fresh Shumari village row (kit: 'shumari', household: 5.2, workShare: 0.46, slopeMax: 0.28)
     KHAMLET.shumariCampRow(opts) -> a fresh Shumari work-camp row (opts with camp: true: workShare: 0.88, household: 6.0,
                                     sm_cadet_cell & sm_giant_cadet_cell corvee bunks, civic sm_regiment_barracks, religious
                                     sm_wayside_cairn when shrine is on)
     KHAMLET.SHUMARI_FOCI         -> the ten foci the row answers, in order:
                                     farming, orchard, ranch, lumber, quarry, clay, salt, fishing, mine, placer
     KHAMLET.SHUMARI_FOCUS_INFO   -> what each focus works on and the kit keys it draws, for a host's labels and checks

   opts (each `x == null ? default : x`):
     shrine    (true) a wayside cairn-shrine in every village: one sm_wayside_cairn among the works (share 0: one building,
               no focus jobs taken), standing on the works lane. In camp mode, sm_wayside_cairn serves as row.religious and
               no second cairn is added among the works. false omits the wayside cairn
     camp      (false) high-altitude or gorge mining/ordnance camp mode (Urudiru-Ma'dan, Betun-Ma'dan, Sutaru-Ma'dan,
               Suru-Baru nitre vats): replaces civilian cottages with -ko human and Gedu-ko Free Giant initiation cells

   Keys. Every key belongs to kits/shumari (SM.def). Every key is also listed under `pending` with a realistic footprint box,
   so a host or node test that has not loaded all of kits/shumari yet places accurate footprints and marks pending records
   cleanly, while a page whose spec.dims(key) answers the kit's own box uses the kit's box instead. */
(function () {
  if (typeof KHAMLET === 'undefined' || !KHAMLET.CULTURES || !KHAMLET.FOCI) throw new Error('core/hamlet/shumari: load core/hamlet 20 first');
  var W = function (key, jobs, share) { return {key: key, jobs: jobs, share: share}; };
  var SHRINE = 'sm_wayside_cairn';

  /* pending footprint boxes (w, d, h in m; kits/shumari's own dims(key) wins whenever loaded on the page) */
  var PENDING = {
    'sm_sabil_shrine': {w: 9, d: 9, h: 11, what: 'street-corner domed snowmelt fountain and upper cadet recitation loggia'},
    'sm_wayside_cairn': {w: 4.5, d: 4.5, h: 5.2, what: 'stepped basalt ablaq blade-pillar and bronze lamp niche'},
    'sm_sword_villa': {w: 18, d: 16, h: 10.5, what: 'walled ablaq Sword-officer villa with Giant pishtaq and domed hall'},
    'sm_regiment_barracks': {w: 24, d: 20, h: 9.5, what: 'quadrangle tuppu barracks with Giant and human vaulted dormitories'},
    'sm_bazaar_hall': {w: 20, d: 14, h: 8.5, what: 'vaulted stone qaysariyya market arcade'},
    'sm_brewery_teahouse': {w: 15, d: 12, h: 7.5, what: 'millet-beer boza brewhouse and domed canyon-tea samovar house'},
    'sm_state_granary': {w: 18, d: 13, h: 9, what: 'buttressed basalt ablaq vaulted grain and dried-apricot tithe store'},
    'sm_herder_house': {w: 11, d: 9, h: 4.8, what: 'low thick-walled upland basalt house with winter sheepfold'},
    'sm_cliff_cot': {w: 9, d: 8, h: 6, what: 'two-level rubble-basalt cottage with slate lean-to'},
    'sm_cadet_cell': {w: 8.5, d: 7, h: 4.2, what: 'austere basalt single-room probationer cell with stove flue'},
    'sm_giant_cadet_cell': {w: 12, d: 10, h: 6.4, what: 'high-vaulted basalt initiation cell for Free Giant candidates'},
    'sm_hearth_house': {w: 12, d: 10, h: 7.4, what: 'two-storey dressed basalt house with ablaq arch and crimson mashrabiya bay'},
    'sm_courtyard_house': {w: 15, d: 14, h: 7.6, what: 'artisan walled work-court house with snowmelt tank and shurafat parapet'},
    'sm_terrace_house': {w: 10, d: 12, h: 10.2, what: 'narrow three-storey battered-plinth canyon-ledge house'},
    'sm_shop_house': {w: 11, d: 11, h: 7.5, what: 'ground-floor arched stone shopfront with upper family dwelling'},
    'sm_captain_bayt': {w: 20, d: 18, h: 11, what: 'Mamluk bayt compound with courtyard iwan and spiral blade-shrine dome'},
    'sm_terrace_farm': {w: 22, d: 16, h: 5, what: 'dry-stone dustmillet and frostoat bench plot with threshing circle'},
    'sm_watermill': {w: 14, d: 11, h: 8, what: 'stone overshot canyon-chute mill wheel'},
    'sm_apricot_orchard': {w: 22, d: 16, h: 5.5, what: 'stone-walled canyon terrace of whorlapricot trees and kernel-oil press'},
    'sm_spirits_still': {w: 16, d: 13, h: 8.2, what: 'roasting pit and twin Mamluk copper-dome Sunu-sikaru alembic still-house'},
    'sm_stock_fold': {w: 20, d: 16, h: 4.5, what: 'upland sheep and goat dairy fold and mountain pack-mule corral'},
    'sm_butcher': {w: 12, d: 10, h: 6.8, what: 'cold-stone carcass hook and wind-drying basturma and smoked-trout loft'},
    'sm_charcoal_kiln': {w: 18, d: 14, h: 5.2, what: 'stone-banked beehive charcoal clamp pair and ropepine cordwood yard'},
    'sm_stonecutters_yard': {w: 22, d: 18, h: 6, what: 'basalt and travertine ablaq dressing yard and dome-rib templates'},
    'sm_blade_smithy': {w: 15, d: 12, h: 7.8, what: 'double-forge pine-charcoal bloomery and notched-blade smithy'},
    'sm_kiln_yard': {w: 20, d: 16, h: 6.8, what: 'stoneware spirit-flask pottery kilns around a drying court'},
    'sm_lacquer_inlay_shop': {w: 13, d: 11, h: 7, what: 'crimson-lacquer, birch-tar and bronze damascene workshop'},
    'sm_salt_evaporator': {w: 18, d: 13, h: 5.8, what: 'brine-boiling pan shed and rock-halite crushing floor'},
    'sm_lake_jetty': {w: 18, d: 10, h: 4.8, what: 'dressed basalt lake quay, tarred pine skiff slip and trout drying rack'},
    'sm_mine_head': {w: 16, d: 14, h: 10, what: 'timbered adit headframe and ore sorting floor'},
    'sm_saltpeter_works': {w: 20, d: 15, h: 6.5, what: 'leaching vats and sulfur-and-saltpeter ordnance powder mill'},
    'sm_placer_sluice': {w: 24, d: 9, h: 3.6, what: 'stepped basalt diversion race, riffled timber sluice boxes and wash table'}
  };

  var HOUSES = {
    poor: [['sm_herder_house', 1, 3], ['sm_cliff_cot', 1, 2], ['sm_cadet_cell', 2, 1]],
    middling: [['sm_hearth_house', 2, 3], ['sm_courtyard_house', 2, 2], ['sm_terrace_house', 3, 1], ['sm_shop_house', 2, 1]],
    head: [['sm_captain_bayt', 1, 1]],
    middlingShare: 0.42
  };

  var SERVICES = {religious: 2, civic: 3, general: 3, food: 3, warehouse: 3};

  /* work-camp overrides (settlements/shumar/BUILD-OUT.md section 4b: high-altitude polymetallic lode mines and nitre vats) */
  var CAMP = {
    workShare: 0.88,
    household: 6.0,
    civic: 'sm_regiment_barracks',
    religious: SHRINE,
    services: {religious: 0, civic: 2, general: 1, food: 2, warehouse: 2},
    houses: {
      poor: [['sm_cadet_cell', 4, 4], ['sm_giant_cadet_cell', 2, 1]],
      middling: [['sm_cadet_cell', 4, 3], ['sm_giant_cadet_cell', 2, 1]],
      head: [['sm_sword_villa', 1, 1]],
      middlingShare: 0
    }
  };

  var FOCI = ['farming', 'orchard', 'ranch', 'lumber', 'quarry', 'clay', 'salt', 'fishing', 'mine', 'placer'];

  var FOCUS_JOBS = {
    farming: 92, orchard: 88, ranch: 56, lumber: 68, quarry: 64,
    clay: 60, salt: 64, fishing: 64, mine: 110, placer: 80
  };

  var REACH = {
    farming: 480, orchard: 440, ranch: 750, lumber: 600, quarry: 360,
    clay: 320, salt: 340, fishing: 280, mine: 450, placer: 420
  };

  var copyHouses = function (H) {
    var c = function (list) { return list.map(function (h) { return h.slice(); }); };
    return {poor: c(H.poor), middling: c(H.middling), head: c(H.head), middlingShare: H.middlingShare};
  };

  var baseWorks = function () {
    return {
      farming: [W('sm_terrace_farm', 12, 0.70), W('sm_state_granary', 7, 0.15), W('sm_watermill', 7, 0.15)],
      orchard: [W('sm_apricot_orchard', 12, 0.65), W('sm_spirits_still', 9, 0.20), W('sm_state_granary', 7, 0.15)],
      ranch: [W('sm_stock_fold', 8, 0.60), W('sm_herder_house', 5, 0.25), W('sm_butcher', 5, 0.15)],
      lumber: [W('sm_charcoal_kiln', 9, 0.65), W('sm_stonecutters_yard', 12, 0.35)],
      quarry: [W('sm_stonecutters_yard', 16, 0.80), W('sm_blade_smithy', 7, 0.20)],
      clay: [W('sm_kiln_yard', 12, 0.70), W('sm_lacquer_inlay_shop', 9, 0.30)],
      salt: [W('sm_salt_evaporator', 12, 0.80), W('sm_state_granary', 7, 0.20)],
      fishing: [W('sm_lake_jetty', 10, 0.75), W('sm_butcher', 8, 0.25)],
      mine: [W('sm_mine_head', 16, 0.60), W('sm_blade_smithy', 8, 0.20), W('sm_saltpeter_works', 11, 0.20)],
      placer: [W('sm_placer_sluice', 12, 0.75), W('sm_blade_smithy', 10, 0.25)]
    };
  };

  KHAMLET.SHUMARI_FOCI = FOCI.slice();
  KHAMLET.SHUMARI_FOCUS_INFO = {
    farming: {resource: 'plateau bench and canyon terrace grain land (dustmillet, frostoat, frostroot)', keys: ['sm_terrace_farm', 'sm_state_granary', 'sm_watermill']},
    orchard: {resource: 'sheltered canyon whorlapricot and spiralaloe terraces', keys: ['sm_apricot_orchard', 'sm_spirits_still', 'sm_state_granary']},
    ranch: {resource: 'upland sheep, goat and cavalry-remount pasture', keys: ['sm_stock_fold', 'sm_herder_house', 'sm_butcher']},
    lumber: {resource: 'west-gorge ropepine and helixpoplar timber and charcoal woodlots', keys: ['sm_charcoal_kiln', 'sm_stonecutters_yard']},
    quarry: {resource: 'dressed basalt, highland travertine and impactite stone faces', keys: ['sm_stonecutters_yard', 'sm_blade_smithy']},
    clay: {resource: 'river-terrace stoneware clay beds for Sunu-sikaru spirit flasks', keys: ['sm_kiln_yard', 'sm_lacquer_inlay_shop']},
    salt: {resource: 'brine springs and rock-halite seams (Sorun-Narun)', keys: ['sm_salt_evaporator', 'sm_state_granary']},
    fishing: {resource: 'highland lake shore (Siru-Yamu, Nemetu-Yamu, Sutaru-Yamu; spec.landing)', keys: ['sm_lake_jetty', 'sm_butcher'], landing: 'sm_lake_jetty'},
    mine: {resource: 'iron, tin, copper, skarn, silver, gold and saltpeter lodes', keys: ['sm_mine_head', 'sm_blade_smithy', 'sm_saltpeter_works']},
    placer: {resource: 'alluvial tin and gold canyon gravel bars (Doriyan-Narun and Gedun-Buruqu)', keys: ['sm_placer_sluice', 'sm_blade_smithy']}
  };

  KHAMLET.shumariRow = function (opts) {
    var o = opts || {};
    var shrine = o.shrine == null ? true : !!o.shrine;
    var camp = o.camp == null ? false : !!o.camp;
    var works = baseWorks(), k;
    /* one wayside blade-cairn in every civilian village (share 0 gives 1 building and takes 0 focus jobs);
       in camp mode the cairn is the camp's religious marker instead */
    if (shrine && !camp) {
      for (k in works) works[k].push(W(SHRINE, 1, 0));
    }
    var focusJobs = {}, reach = {}, pending = {};
    for (k in FOCUS_JOBS) focusJobs[k] = FOCUS_JOBS[k];
    for (k in REACH) reach[k] = REACH[k];
    for (k in PENDING) pending[k] = Object.assign({}, PENDING[k]);

    var campSpec = {
      workShare: CAMP.workShare,
      household: CAMP.household,
      civic: CAMP.civic,
      religious: shrine ? SHRINE : 'sm_sabil_shrine',
      services: Object.assign({}, CAMP.services),
      houses: copyHouses(CAMP.houses)
    };

    var row = {
      kit: 'shumari',
      household: 5.2,
      workShare: 0.46,
      slopeMax: 0.28,
      religious: 'sm_sabil_shrine',
      civic: 'sm_sword_villa',
      general: 'sm_bazaar_hall',
      food: 'sm_brewery_teahouse',
      warehouse: 'sm_state_granary',
      services: Object.assign({}, SERVICES),
      houses: copyHouses(HOUSES),
      works: works,
      focusJobs: focusJobs,
      reach: reach,
      landing: {key: 'sm_lake_jetty', jobs: 3},
      pending: pending,
      camp: campSpec
    };

    if (camp) {
      row.workShare = campSpec.workShare;
      row.household = campSpec.household;
      row.civic = campSpec.civic;
      row.religious = campSpec.religious;
      row.services = Object.assign({}, campSpec.services);
      row.houses = copyHouses(campSpec.houses);
    }
    return row;
  };

  KHAMLET.shumariCampRow = function (opts) {
    var o = Object.assign({}, opts || {});
    o.camp = true;
    return KHAMLET.shumariRow(o);
  };
})();
