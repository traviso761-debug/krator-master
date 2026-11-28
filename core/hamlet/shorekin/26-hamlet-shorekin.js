/* ==================== core/hamlet 26 (opt-in): the Shore-kin Arch hinterland & harbour-crew row, passed by name (plain data, [G data]) ==================== */
/* arcoforte_tide_plan.md sections 2.2b and 2.4; kits/shore-kin/API.md.
   OPT-IN: this file sits in core/hamlet/shorekin/, which no build lists unless it asks for it by name, and test-hamlet.js
   loads only core/hamlet/NN-hamlet-*.js, so adding it changes 0 bytes on unrelated pages (core/hamlet/shorekin/README.md).
   It mutates nothing on KHAMLET.CULTURES or KHAMLET.FOCI: a host passes KHAMLET.shorekinRow(opts) as spec.culture.
   Fold into 20-hamlet-cultures.js on the next all-builds rebuild (TODO.md, "Ride along").

     KHAMLET.shorekinRow(opts)    -> a fresh Shore-kin village row (kit: 'shore-kin', household: 5.0, workShare: 0.48, slopeMax: 0.30)
     KHAMLET.SHOREKIN_FOCI        -> ['ash', 'spars', 'cordage', 'smelt', 'saltery', 'lime', 'fishing', 'farming']
     KHAMLET.SHOREKIN_FOCUS_INFO  -> metadata per focus (what, feeds, worksKeys, outputs, clientTithe), plus standard
                                     KHAMLET.FOCI aliases ('lumber' -> spars, 'mine' -> smelt, 'salt' -> saltery, 'quarry' -> lime)

   Politics (owner, 2026-11-25): the Shore-kin are clients of the Arcoforte Fleet-born caretaker house (not partners in the moot),
   owing campaign labour, Pycnandra/kelp nickel-ash, Araucaria spars, coir/byssus cordage and salt-fish in return for white
   paktong tools/ingots and cradle_shallow careening berths for their own small hulls. */
(function () {
  'use strict';
  if (typeof KHAMLET === 'undefined' || !KHAMLET.CULTURES || !KHAMLET.FOCI) {
    throw new Error('core/hamlet/shorekin: load core/hamlet 20 first');
  }

  var W = function (key, jobs, share) { return {key: key, jobs: jobs, share: share}; };

  /* Exact footprint boxes read from kits/shore-kin/src/50-sk-houses.js & 58-sk-works.js (all 16 sk_* keys; zero Crookshore keys) */
  var PENDING = {
    'sk_stilt_cot': {w: 13.6, d: 14.8, h: 9.6, what: 'poor fisherman and gatherer stilt cot on arched pillow-basalt and laterite flood socle'},
    'sk_boardwalk_shack': {w: 13.4, d: 14.2, h: 8.4, what: 'salvaged hull-plank and Melaleuca paperbark shore cot on tarred mangrove-pile cribs'},
    'sk_crib_rowhouse': {w: 18.6, d: 13.8, h: 9.2, what: 'two-family yard-crew rowhouse on shared arched laterite piers and tarred mangrove boardwalk'},
    'sk_hex_lime_house': {w: 14.6, d: 15.4, h: 10.4, what: 'six-sided shell-limewashed pumice and laterite artisan house with brucite screens'},
    'sk_serpentine_lodge': {w: 17.2, d: 17.8, h: 9.6, what: 'extended-family battered serpentinite and dunite ring lodge with mangrove-knee and whale-rib turf dome'},
    'sk_compound_house': {w: 18.4, d: 17.8, h: 14.2, what: 'prosperous factor and master-shipwright two-storey arched-socle house with paktong mask'},
    'sk_byssus_court': {w: 20.4, d: 19.2, h: 11.4, what: 'multi-family sea-silk weaver and catechu-dyer courtyard house with rainwater basin'},
    'sk_client_hall': {w: 22.8, d: 23.6, h: 15.8, what: 'Fleet-born caretaker house Shore-kin client moot and paktong tally hall'},
    'sk_ash_kelp_kiln': {w: 18.8, d: 15.4, h: 8.4, what: 'Pycnandra nickel-shrub turf-sealed ash clamp and stone intertidal kelp trench kiln'},
    'sk_spar_sawpit': {w: 20.4, d: 16.2, h: 9.4, what: 'Araucaria and Agathis spar-cutter saw pit, kauri-gum pitch pot and mangrove-knee steaming trough'},
    'sk_ropewalk_pitch': {w: 22.4, d: 14.6, h: 8.8, what: 'coir, Hibiscus bast and sea-byssus rope walk under sharkskin canopy and gjar bitumen boiler'},
    'sk_paktong_foundry': {w: 20.6, d: 17.2, h: 10.8, what: 'Casuarina-bedded copper/zinc roast heap and serpentinite/laterite paktong cupola foundry'},
    'sk_fish_saltery': {w: 21.2, d: 17.6, h: 9.2, what: 'intertidal basalt and wattled mangrove V-weir, brucite salt pans and twin-crown smokehouse'},
    'sk_lime_kiln': {w: 17.6, d: 15.4, h: 8.8, what: 'battered serpentinite and laterite draw-arch shell and limeshelf travertine kiln'},
    'sk_boat_grid_shed': {w: 16.8, d: 20.4, h: 10.2, what: 'tarred mangrove-crib skiff and tender careening grid and repair shed'},
    'sk_tide_shrine': {w: 16.4, d: 17.2, h: 11.6, what: 'stepped serpentinite and brucite shrine with spring/neap/Double-Dark paktong tide post'}
  };

  /* Dwellings poor -> rich across all 7 Shore-kin residential pieces */
  var HOUSES = {
    poor: [['sk_stilt_cot', 1, 3], ['sk_boardwalk_shack', 1, 2], ['sk_crib_rowhouse', 2, 2]],
    middling: [['sk_hex_lime_house', 1, 3], ['sk_serpentine_lodge', 2, 2], ['sk_compound_house', 1, 1], ['sk_byssus_court', 2, 1]],
    head: [['sk_byssus_court', 2, 1], ['sk_compound_house', 1, 1]],
    middlingShare: 0.42
  };

  var CAMP_HOUSES = {
    poor: [['sk_crib_rowhouse', 3, 3], ['sk_boardwalk_shack', 2, 2]],
    middling: [['sk_serpentine_lodge', 3, 2], ['sk_crib_rowhouse', 3, 2]],
    head: [['sk_compound_house', 1, 1]],
    middlingShare: 0
  };

  var FOCI = ['ash', 'spars', 'cordage', 'smelt', 'saltery', 'lime', 'fishing', 'farming'];
  var ALIASES = {lumber: 'spars', mine: 'smelt', salt: 'saltery', quarry: 'lime'};

  var FOCUS_JOBS = {
    ash: 62,
    spars: 68,
    cordage: 54,
    smelt: 78,
    saltery: 66,
    lime: 48,
    fishing: 66,
    farming: 64
  };

  var REACH = {
    ash: 420,
    spars: 520,
    cordage: 380,
    smelt: 460,
    saltery: 360,
    lime: 380,
    fishing: 360,
    farming: 480
  };

  var makeTithe = function (owes) {
    return {
      status: 'client',
      patron: 'arcoforte_caretaker_house',
      owes: owes.slice(),
      receives: ['paktong_tools', 'paktong_ingots', 'cradle_shallow_berths'],
      note: 'Shore-kin client village of the Arcoforte Fleet-born caretaker house: owes ' + owes.join(', ') +
            ' and spring yard labour in return for paktong tools/ingots and cradle_shallow careening berths'
    };
  };

  var BASE_INFO = {
    ash: {
      what: 'laterite plateau Pycnandra and verdigris-mangrove nickel-ash clamps and intertidal kelp kilns',
      feeds: 'paktong_smelt_hearth',
      worksKeys: ['sk_ash_kelp_kiln', 'sk_lime_kiln'],
      outputs: ['nickel_ash', 'kelp_ash', 'shell_lime'],
      clientTithe: makeTithe(['nickel_ash', 'kelp_ash', 'kiln_labour'])
    },
    spars: {
      what: 'Araucaria and Agathis spar-cutting saw pits, kauri-gum pitch pots and mangrove-knee steaming troughs above the gjar chute',
      feeds: 'graving_yard',
      worksKeys: ['sk_spar_sawpit', 'sk_boat_grid_shed'],
      outputs: ['araucaria_spars', 'mangrove_knees', 'kauri_gum'],
      clientTithe: makeTithe(['araucaria_spars', 'mangrove_knees', 'yard_carpentry_labour'])
    },
    cordage: {
      what: 'gjar-neck coir, Hibiscus bast and sea-byssus ropewalks and bitumen caulking boilers',
      feeds: 'graving_yard_and_fleet',
      worksKeys: ['sk_ropewalk_pitch'],
      outputs: ['cordage', 'caulking_pitch', 'byssus_cloth'],
      clientTithe: makeTithe(['cordage', 'caulking_pitch', 'rigging_labour'])
    },
    smelt: {
      what: 'Casuarina-bedded copper/zinc ore roast heaps, Pycnandra nickel-ash fluxing and spring-campaign paktong cupolas',
      feeds: 'paktong_smelt_hearth',
      worksKeys: ['sk_paktong_foundry', 'sk_ash_kelp_kiln'],
      outputs: ['paktong_ingots', 'roasted_copper_zinc', 'nickel_ash'],
      clientTithe: makeTithe(['roasted_copper_zinc', 'nickel_ash', 'smelt_campaign_labour'])
    },
    saltery: {
      what: 'outer-shore intertidal basalt and mangrove fish weirs, brucite solar salt pans and twin-crown smokehouses',
      feeds: 'great_careening_moot',
      worksKeys: ['sk_fish_saltery', 'sk_boat_grid_shed'],
      outputs: ['salt_fish', 'sea_salt'],
      landing: 'sk_boat_grid_shed',
      clientTithe: makeTithe(['salt_fish', 'sea_salt', 'shallop_transport_labour'])
    },
    lime: {
      what: 'limeshelf brucite-travertine and oyster-shell draw-arch kilns and slaking sheds',
      feeds: 'harbour_masonry_and_flux',
      worksKeys: ['sk_lime_kiln'],
      outputs: ['shell_lime', 'brucite_block'],
      clientTithe: makeTithe(['shell_lime', 'brucite_block', 'mason_labour'])
    },
    fishing: {
      what: 'coastal fish-weir salteries, pumice-float net racks and tarred mangrove tender careening sheds',
      feeds: 'great_careening_moot',
      worksKeys: ['sk_fish_saltery', 'sk_boat_grid_shed'],
      outputs: ['salt_fish', 'cured_roe', 'shark_ray_hide'],
      landing: 'sk_boat_grid_shed',
      clientTithe: makeTithe(['salt_fish', 'shark_ray_hide', 'harbour_crew_labour'])
    },
    farming: {
      what: 'wrack-mulched taro, breadfruit, coconut and pandan swale holdings paired with kelp-ash clamps and shore salteries',
      feeds: 'hinterland_and_moot_provisions',
      worksKeys: ['sk_ash_kelp_kiln', 'sk_fish_saltery'],
      outputs: ['taro_breadfruit', 'pandan_fibre', 'kelp_ash', 'salt_fish'],
      clientTithe: makeTithe(['provisions', 'pandan_mats', 'spring_yard_labour'])
    }
  };

  var cloneInfo = function (inf, aliasOf) {
    var out = {
      what: inf.what,
      feeds: inf.feeds,
      worksKeys: inf.worksKeys.slice(),
      keys: inf.worksKeys.slice(),
      outputs: inf.outputs.slice(),
      clientTithe: {
        status: inf.clientTithe.status,
        patron: inf.clientTithe.patron,
        owes: inf.clientTithe.owes.slice(),
        receives: inf.clientTithe.receives.slice(),
        note: inf.clientTithe.note
      }
    };
    if (inf.landing) out.landing = inf.landing;
    if (aliasOf) out.aliasOf = aliasOf;
    return out;
  };

  var FOCUS_INFO = {};
  (function () {
    var i, f, a;
    for (i = 0; i < FOCI.length; i++) {
      f = FOCI[i];
      FOCUS_INFO[f] = cloneInfo(BASE_INFO[f], null);
    }
    for (a in ALIASES) {
      FOCUS_INFO[a] = cloneInfo(BASE_INFO[ALIASES[a]], ALIASES[a]);
    }
  })();

  var copyHouses = function (H) {
    var c = function (list) { return list.map(function (h) { return h.slice(); }); };
    return {poor: c(H.poor), middling: c(H.middling), head: c(H.head), middlingShare: H.middlingShare};
  };

  var baseWorks = function () {
    var w = {
      ash: [W('sk_ash_kelp_kiln', 10, 0.72), W('sk_lime_kiln', 8, 0.28)],
      spars: [W('sk_spar_sawpit', 12, 0.70), W('sk_boat_grid_shed', 8, 0.30)],
      cordage: [W('sk_ropewalk_pitch', 12, 1.0)],
      smelt: [W('sk_paktong_foundry', 14, 0.68), W('sk_ash_kelp_kiln', 10, 0.32)],
      saltery: [W('sk_fish_saltery', 12, 0.70), W('sk_boat_grid_shed', 8, 0.30)],
      lime: [W('sk_lime_kiln', 10, 1.0)],
      fishing: [W('sk_fish_saltery', 12, 0.70), W('sk_boat_grid_shed', 8, 0.30)],
      farming: [W('sk_ash_kelp_kiln', 10, 0.50), W('sk_fish_saltery', 10, 0.50)]
    };
    var a;
    for (a in ALIASES) {
      w[a] = w[ALIASES[a]].map(function (it) { return W(it.key, it.jobs, it.share); });
    }
    return w;
  };

  KHAMLET.SHOREKIN_FOCI = FOCI.slice();
  KHAMLET.SHOREKIN_FOCUS_ALIASES = Object.assign({}, ALIASES);
  KHAMLET.SHOREKIN_FOCUS_INFO = FOCUS_INFO;

  KHAMLET.shorekinRow = function (opts) {
    var o = opts || {};
    var shrine = o.shrine == null ? true : !!o.shrine;
    var useClientHall = (o.clientHall == null ? false : !!o.clientHall) || (o.pop != null && o.pop >= 180);
    var workShare = o.workShare == null ? 0.48 : o.workShare;
    var household = o.household == null ? 5.0 : o.household;
    var slopeMax = o.slopeMax == null ? 0.30 : o.slopeMax;
    var camp = o.camp == null ? false : !!o.camp;

    if (!isFinite(workShare) || workShare <= 0 || workShare > 1) {
      throw new Error('KHAMLET.shorekinRow: workShare must be in (0, 1]');
    }
    if (!isFinite(household) || household <= 0) {
      throw new Error('KHAMLET.shorekinRow: household must be > 0');
    }
    if (!isFinite(slopeMax) || slopeMax <= 0) {
      throw new Error('KHAMLET.shorekinRow: slopeMax must be > 0');
    }

    var works = baseWorks(), focusJobs = {}, reach = {}, pending = {}, k, a;
    for (k in FOCUS_JOBS) focusJobs[k] = FOCUS_JOBS[k];
    for (k in REACH) reach[k] = REACH[k];
    for (a in ALIASES) {
      focusJobs[a] = FOCUS_JOBS[ALIASES[a]];
      reach[a] = REACH[ALIASES[a]];
    }
    for (k in PENDING) pending[k] = Object.assign({}, PENDING[k]);

    var religiousKey = shrine ? 'sk_tide_shrine' : 'sk_serpentine_lodge';
    var civicKey = useClientHall ? 'sk_client_hall' : 'sk_compound_house';
    var services = {
      religious: shrine ? 2 : 0,
      civic: useClientHall ? 4 : 3,
      general: 3,
      food: 3,
      warehouse: 3
    };

    var campSpec = {
      workShare: 0.85,
      household: 5.5,
      civic: 'sk_client_hall',
      religious: religiousKey,
      services: {religious: shrine ? 1 : 0, civic: 3, general: 1, food: 2, warehouse: 2},
      houses: copyHouses(CAMP_HOUSES)
    };

    var row = {
      kit: 'shore-kin',
      household: household,
      workShare: workShare,
      slopeMax: slopeMax,
      religious: religiousKey,
      civic: civicKey,
      general: 'sk_byssus_court',
      food: 'sk_serpentine_lodge',
      warehouse: 'sk_compound_house',
      services: services,
      houses: copyHouses(HOUSES),
      works: works,
      focusJobs: focusJobs,
      reach: reach,
      landing: {key: 'sk_boat_grid_shed', jobs: 4},
      pending: pending,
      camp: campSpec,
      clientTithe: makeTithe(['nickel_ash', 'araucaria_spars', 'cordage', 'salt_fish', 'spring_yard_labour'])
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
})();
