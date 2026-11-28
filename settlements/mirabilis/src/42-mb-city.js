// prefix: mb
/* ================================================================= MIRABILIS — Multi-Kit City Plan, Hamlets, Camp & Walk Graph ([G data])
   Built on KRATOR_KITS (core/kits/10-core-kits.js) + KCITY.multikit (core/city/42-city-multikit.js) +
   KHAMLET.village (core/hamlet) + KCAMP.halt (core/camp/50-camp-tents.js) + KSPACE + KMASK.
   Showcases all 47 non-diorama hy_* pieces from kits/hayrant alongside 38 et_* suzerain pieces from kits/eternian:
     - W1 Pepar-Hom Citadel & Suzerain Spine (55% Hayrant / 45% Eternian, <= 0.50 m mixed-avenue cornice delta)
     - W2 Sutar-Tawar Star-Spur & Siru-Spring Sanctuary (90% Hayrant / 10% Eternian)
     - W3 Kuran-Kotan & West Pass Gate (88% Hayrant / 12% Eternian + 36-city-covered winter market galleries)
     - W4 Yut-Gully Sunny Loess Cliff-Benches (100% Hayrant contoured yaodong & artisan terraces)
     - W5 Yut-Ma Mill-Gorge & Kiln Floor (92% Hayrant / 8% Eternian along river & mill-leat)
     - W6 Fulcrum Brow Escarpment Lip (70% Hayrant / 30% Eternian + 5 active KCONS rising construction lots)
     - H1 Madder-Terrace Farming Hamlet (North Yuan across the Yut Moon-Bridge)
     - H2 Breccia-Adit Mining Hamlet (SW megabreccia scarp + RES_ORE iron/gold/silver/tin/saltpeter nodes)
     - C1 Ukor-Tera Whale-Clan Caravan Halt (KCAMP.halt laager outside hy_pass_gate)
   Plain data and pure functions: zero THREE, zero DOM, zero Math.random. */

var MB_CITY = (function () {
  'use strict';
  var G = MB_GROUND;
  var H = MB_HYD;

  if (typeof KTAGS !== 'undefined' && KTAGS && KTAGS.VOCAB) {
    if (KTAGS.VOCAB.cultures && KTAGS.VOCAB.cultures.indexOf('hayrant') < 0) {
      KTAGS.VOCAB.cultures.push('hayrant');
    }
    if (KTAGS.VOCAB.noCatalog && KTAGS.VOCAB.noCatalog.indexOf('hayrant') < 0) {
      KTAGS.VOCAB.noCatalog.push('hayrant');
    }
    if (KTAGS.VOCAB.cultureNames) {
      KTAGS.VOCAB.cultureNames.hayrant = 'Hayrant';
    }
  }
  if (typeof DEFS !== 'undefined' && DEFS) {
    for (var ek in DEFS) {
      if (ek.indexOf('et_') === 0 && DEFS[ek] && DEFS[ek].tags && !DEFS[ek].tags.culture) {
        DEFS[ek].tags.culture = 'eternian';
      }
    }
  }

  /* Canonical cornice heights (m) for mixed Eternian-Hayrant avenue frontage (matching 70-hy-street.js <= 0.50 m law) */
  var CORNICE_M = {
    et_official_villa: 10.40,
    hy_clan_lord_compound: 10.79,
    et_merchant_house: 11.90,
    hy_merchant_tower_rich: 11.82,
    et_canal_house: 7.20,
    hy_bench_house_mid: 7.16,
    et_court_house: 7.35,
    hy_courtyard_loess_mid: 7.18,
    et_corner_turret: 8.60,
    hy_corner_turret_mid: 8.42,
    et_canal_row: 5.40,
    hy_terrace_row_poor: 5.36,
    et_shophouse: 7.10,
    hy_nuraghe_chise_mid: 7.04
  };

  /* All 47 standalone Hayrant pieces expected in Mirabilis (every hy_* def except the kit-sheet hy_mixed_street diorama) */
  var REQUIRED_HY_KEYS = [
    'hy_loess_yaodong', 'hy_larch_chise_poor', 'hy_scarp_cellar_poor', 'hy_terrace_row_poor',
    'hy_bench_house_mid', 'hy_nuraghe_chise_mid', 'hy_courtyard_loess_mid', 'hy_corner_turret_mid',
    'hy_clan_lord_compound', 'hy_merchant_tower_rich',
    'hy_prefect_seat', 'hy_clock_observatory', 'hy_assay_registry', 'hy_examination_school',
    'hy_tube_relay', 'hy_talking_head', 'hy_kuran_legation',
    'hy_spring_stepwell', 'hy_withdrawn_sanctuary', 'hy_ancestor_barrow',
    'hy_nuraghe_fort', 'hy_pass_gate', 'hy_wall_segment', 'hy_beacon_nuraghe',
    'hy_saltpeter_works', 'hy_ore_adit', 'hy_stoneware_kiln', 'hy_nephrite_lapidary',
    'hy_larch_flume_yard', 'hy_iron_smithy', 'hy_plaid_weaver',
    'hy_millet_bakehouse', 'hy_smokehouse_butcher', 'hy_buckwheat_brewery', 'hy_pelt_tannery',
    'hy_granary_nuraghe', 'hy_warehouse_vault', 'hy_escarpment_hoist',
    'hy_caravanserai_inn', 'hy_hearth_tavern', 'hy_market_hall', 'hy_healer_bath',
    'hy_terrace_farmstead', 'hy_fell_fold', 'hy_mushroom_drift', 'hy_trench_fishery',
    'hy_statuary_ranks'
  ];

  function makeObb(x, z, ry, w, d, pad) {
    var p = pad == null ? 0 : pad;
    var hw = w * 0.5 + p, hd = d * 0.5 + p;
    var c = Math.cos(ry), s = Math.sin(ry);
    /* Local +x = (c, -s), local +z = (s, c) matching Three.js rotation.y */
    return {
      x: x, z: z, ry: ry, hw: hw, hd: hd,
      ux: c, uz: -s, vx: s, vz: c,
      r: Math.hypot(hw, hd)
    };
  }

  function obbOverlap(a, b) {
    var dx = b.x - a.x, dz = b.z - a.z;
    if (dx * dx + dz * dz > (a.r + b.r) * (a.r + b.r)) return false;
    var axes = [[a.ux, a.uz], [a.vx, a.vz], [b.ux, b.uz], [b.vx, b.vz]];
    for (var i = 0; i < 4; i++) {
      var ax = axes[i][0], az = axes[i][1];
      var proj = Math.abs(dx * ax + dz * az);
      var ra = a.hw * Math.abs(a.ux * ax + a.uz * az) + a.hd * Math.abs(a.vx * ax + a.vz * az);
      var rb = b.hw * Math.abs(b.ux * ax + b.uz * az) + b.hd * Math.abs(b.vx * ax + b.vz * az);
      if (proj >= ra + rb - 1e-4) return false;
    }
    return true;
  }

  function tradesMapFromTable() {
    var out = {};
    var rows = typeof HY_TRADES !== 'undefined' && HY_TRADES
      ? (Array.isArray(HY_TRADES) ? HY_TRADES : HY_TRADES.rows)
      : null;
    if (Array.isArray(rows)) {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (!r || !r.trade || r.na) continue;
        if (Array.isArray(r.keys) && r.keys.length) out[r.trade] = r.keys.slice();
      }
    }
    return out;
  }

  function registerKitsInRegistry(dimsFn) {
    if (typeof KRATOR_KITS === 'undefined' || !KRATOR_KITS) return null;
    var hyPieces = {}, etPieces = {};
    if (typeof DEFS !== 'undefined' && DEFS) {
      var ks = Object.keys(DEFS).sort();
      for (var i = 0; i < ks.length; i++) {
        var k = ks[i], d = DEFS[k];
        if (!d || k === 'hy_mixed_street') continue;
        /* Stamp canonical culture & frag on read-in-place Eternian suzerain defs */
        if (k.indexOf('et_') === 0) {
          if (d.tags) d.tags.culture = 'eternian';
          d.frag = 'kits/eternian';
        }
        var w = +(d.w == null ? 8 : d.w);
        var dp = +(d.d == null ? 8 : d.d);
        var h = +(d.h == null ? 7 : d.h);
        var types = (d.tags && Array.isArray(d.tags.types)) ? d.tags.types.slice() : ['residential'];
        var fam = k.indexOf('_poor') > 0 ? 'poor' : (k.indexOf('_rich') > 0 || k.indexOf('compound') > 0 || k.indexOf('villa') > 0 ? 'rich' :
                  (types.indexOf('civic') >= 0 ? 'civic' : (types.indexOf('industrial') >= 0 ? 'works' :
                  (types.indexOf('commercial') >= 0 ? 'trade' : 'mid'))));
        var wealth = fam === 'poor' ? 0.25 : (fam === 'rich' ? 0.82 : (fam === 'civic' ? 'civic' : 0.52));
        var meta = { w: w, d: dp, h: h, name: d.name || k, family: fam, types: types, wealth: wealth, variants: d.variants == null ? 3 : d.variants };
        if (k.indexOf('hy_') === 0) hyPieces[k] = meta;
        else if (k.indexOf('et_') === 0) etPieces[k] = meta;
      }
    }
    var hyTrades = tradesMapFromTable();
    KRATOR_KITS.loadManifest({
      version: 1,
      kits: {
        hayrant: {
          id: 'hayrant', name: 'Hayrant Western Outer Wall Vassal Kit', culture: 'hayrant',
          lineage: 'core_engine', pack: 'hayrant', defaultDoorH: 2.35, access: 'ground',
          pieces: hyPieces, trades: hyTrades
        },
        eternian: {
          id: 'eternian', name: 'Eternal State Suzerain Kit', culture: 'eternian',
          lineage: 'core_engine', pack: 'hayrant', defaultDoorH: 2.55, access: 'ground',
          pieces: etPieces, trades: {}
        }
      }
    });
    KRATOR_KITS.register('hayrant', {
      id: 'hayrant', name: 'Hayrant Vassal Kit', culture: 'hayrant', lineage: 'core_engine', pack: 'hayrant',
      dims: function () { return hyPieces; },
      proto: function () { return null; },
      trades: hyTrades, errors: []
    });
    KRATOR_KITS.register('eternian', {
      id: 'eternian', name: 'Eternal State Kit', culture: 'eternian', lineage: 'core_engine', pack: 'hayrant',
      dims: function () { return etPieces; },
      proto: function () { return null; },
      trades: {}, errors: []
    });

    var st = KRATOR_KITS.createStyleState('hayrant');
    /* Circuit E6 Prefectural Charter permanently unlocks suzerain Eternian Tier 1-3 architecture */
    KRATOR_KITS.unlockBlueprint(st, { kitId: 'eternian', tier: 3, id: 'charter:eternal-state:circuit-e6' });
    KRATOR_KITS.setWardPolicy(st, 'W1', { allowedKits: ['hayrant', 'eternian'] });
    KRATOR_KITS.setWardPolicy(st, 'W2', { allowedKits: ['hayrant', 'eternian'] });
    KRATOR_KITS.setWardPolicy(st, 'W3', { allowedKits: ['hayrant', 'eternian'] });
    KRATOR_KITS.setWardPolicy(st, 'W4', { allowedKits: ['hayrant'] });
    KRATOR_KITS.setWardPolicy(st, 'W5', { allowedKits: ['hayrant', 'eternian'] });
    KRATOR_KITS.setWardPolicy(st, 'W6', { allowedKits: ['hayrant', 'eternian'] });
    return st;
  }

  function hayrantHamletRow(focus) {
    var isMine = focus === 'mine';
    return {
      kit: 'hayrant',
      household: isMine ? 4.4 : 5.0,
      workShare: isMine ? 0.60 : 0.48,
      slopeMax: 0.30,
      religious: 'hy_talking_head',
      civic: 'hy_nuraghe_chise_mid',
      general: 'hy_hearth_tavern',
      food: 'hy_millet_bakehouse',
      warehouse: 'hy_granary_nuraghe',
      services: { religious: 1, civic: 2, general: 2, food: 2, warehouse: 2 },
      houses: {
        poor: isMine
          ? [['hy_scarp_cellar_poor', 1, 3], ['hy_larch_chise_poor', 1, 3]]
          : [['hy_larch_chise_poor', 1, 3], ['hy_terrace_row_poor', 2, 2]],
        middling: [['hy_bench_house_mid', 2, 2], ['hy_nuraghe_chise_mid', 2, 2]],
        head: [['hy_courtyard_loess_mid', 1, 1]],
        middlingShare: 0.28
      },
      works: {
        farming: [{ key: 'hy_terrace_farmstead', jobs: 8, share: 0.60 }, { key: 'hy_fell_fold', jobs: 4, share: 0.25 }, { key: 'hy_granary_nuraghe', jobs: 2, share: 0.15 }],
        mine: [{ key: 'hy_ore_adit', jobs: 12, share: 0.75 }, { key: 'hy_iron_smithy', jobs: 4, share: 0.25 }]
      },
      focusJobs: { farming: 36, mine: 32 },
      reach: { farming: 420, mine: 320 },
      pending: {}
    };
  }

  function wardOfXZ(x, z) {
    if (z < -130 && z > -295) return 'W5';
    if (z <= 46 && x < 200 && z >= -126) return 'W4';
    if (x > 250 && z < 238) return 'W2';
    if (x > 505 && z >= 85) return 'W6';
    if (x < -272 && z >= 65) return 'W3';
    return 'W1';
  }

  function make(opt) {
    opt = opt || {};
    var seed = opt.seed == null ? 350726 : (opt.seed | 0);
    var getDims = function (rawKey) {
      if (!rawKey) return { w: 10, d: 10, h: 7 };
      var sKey = String(rawKey);
      var rk = sKey.indexOf(':') > 0 ? sKey.split(':')[1] : sKey;
      if (opt.dims) {
        var d0 = opt.dims(rk);
        if (d0) return d0;
      }
      if (typeof DEFS !== 'undefined' && DEFS[rk]) {
        return { w: DEFS[rk].w, d: DEFS[rk].d, h: DEFS[rk].h };
      }
      return { w: 10, d: 10, h: 7 };
    };

    var styleState = registerKitsInRegistry(getDims);

    /* Spatial occupancy & street-reserve index */
    var occ = KSPACE.create({ cell: 24 });
    var roadSpace = KSPACE.create({ cell: 20 });
    var lots = [];
    var lotById = {};

    /* Primary & secondary street ways across all 6 wards + Moon-Bridge + H1/H2 approaches (ALL switchbacks & stairs <= 13.5 deg!) */
    var ways = [
      /* Trunk North-South Moon-Bridge Spine (6.7 deg North Ramp, 10.1 deg South Ramp) */
      { id: 'way.sheritu_north', cls: 'main', w: 8.5, ward: 'H1', causeway: true, tag: 'Sheritu North Road',
        pts: [[0, -756, 3076.0], [0, -435, 3068.0], [0, -415, 3068.0], [0, -246, 3088.0]] },
      { id: 'way.moon_bridge', cls: 'bridge', w: 11.0, ward: 'W1', benchY: 3088.0, tag: 'Yut Moon-Bridge', pts: [[0, -246, 3088.0], [0, -140, 3088.0]] },
      { id: 'way.moon_ramp_s', cls: 'main', w: 10.0, ward: 'W1', causeway: true, tag: 'Moon-Bridge Ramp',
        pts: [[0, -140, 3088.0], [0, 68, 3125.2]] },
      { id: 'way.citadel_ns', cls: 'avenue', w: 11.0, ward: 'W1', tag: 'Moon-Bridge Imperial Avenue', pts: [[0, 68], [0, 495]] },

      /* Trunk East-West Suzerain <-> Pass <-> Escarpment Spine */
      { id: 'way.ukor_pass_w', cls: 'main', w: 8.5, ward: 'W3', tag: 'Ukor-Tera Pass Approach', pts: [[-840, 260], [-625, 260]] },
      { id: 'way.kuran_bazaar', cls: 'avenue', w: 10.5, ward: 'W3', covered: true, tag: 'Kuran Covered Market', pts: [[-625, 260], [-272, 260]] },
      { id: 'way.suzerain_ew', cls: 'avenue', w: 11.5, ward: 'W1', mixedAvenue: true, tag: 'Pepar-Hom Suzerain Avenue', pts: [[-272, 260], [252, 260]] },
      { id: 'way.fulcrum_ramp', cls: 'main', w: 9.0, ward: 'W6', causeway: true, tag: 'Fulcrum Brow Descent',
        pts: [[252, 260, 3126.2], [392, 260, 3119.1], [535, 260, 3112.0], [714, 260, 3112.0]] },

      /* W1 Pepar-Hom Grid Streets */
      { id: 'way.w1.north_ew', cls: 'main', w: 8.5, ward: 'W1', mixedAvenue: true, tag: 'North Censorate Street', pts: [[-245, 135], [235, 135]] },
      { id: 'way.w1.south_ew', cls: 'main', w: 8.5, ward: 'W1', mixedAvenue: true, tag: 'South Registry Street', pts: [[-245, 390], [235, 390]] },
      { id: 'way.w1.far_south', cls: 'side', w: 7.0, ward: 'W1', tag: 'South Wall Lane', pts: [[-235, 485], [225, 485]] },
      { id: 'way.w1.west_ns', cls: 'side', w: 7.5, ward: 'W1', tag: 'West Ward Cross', pts: [[-145, 85], [-145, 485]] },
      { id: 'way.w1.east_ns', cls: 'side', w: 7.5, ward: 'W1', tag: 'East Ward Cross', pts: [[142, 85], [142, 485]] },

      /* W2 Sutar-Tawar Observatory Spur (3.6 deg) & Siru-Spring 10.2 deg Switchback Sanctuary Walk */
      { id: 'way.w2.spur', cls: 'main', w: 7.5, ward: 'W2', causeway: true, tag: 'Sutar-Tawar Star-Path',
        pts: [[235, 135], [335, 115], [402, 98]] },
      { id: 'way.w2.spring', cls: 'side', w: 6.0, ward: 'W2', causeway: true, tag: 'Siru-Spring Terrace Switchback',
        pts: [[235, 135, 3126.0], [268, 32, 3125.6], [296, 22, 3120.5], [296, -12, 3120.5], [268, -22, 3115.5], [268, -54, 3115.5], [298, -64, 3110.0], [388, -66, 3110.0]] },
      { id: 'way.w2.barrow', cls: 'side', w: 5.8, ward: 'W2', causeway: true, tag: 'Windward Barrow Terrace Walk', pts: [[-212, 485], [-212, 558], [-468, 558]] },

      /* W3 Kuran-Kotan West Ward Streets */
      { id: 'way.w3.north', cls: 'side', w: 7.5, ward: 'W3', tag: 'Legation Row', pts: [[-585, 148], [-272, 148]] },
      { id: 'way.w3.south', cls: 'side', w: 7.5, ward: 'W3', tag: 'Caravanserai Row', pts: [[-585, 378], [-272, 378]] },
      { id: 'way.w3.mid_ns', cls: 'side', w: 7.0, ward: 'W3', tag: 'Weavers Cross', pts: [[-435, 110], [-435, 455]] },
      { id: 'way.w3.rim_link_m', cls: 'side', w: 6.0, ward: 'W1', tag: 'Central Rim Approach', pts: [[-245, 135, 3126.0], [-250, 85, 3125.6], [-250, 44, 3125.2]] },
      { id: 'way.w3.rim_link_w', cls: 'side', w: 6.0, ward: 'W3', tag: 'West Rim Approach', pts: [[-435, 110, 3133.0], [-442, 76, 3128.5], [-442, 44, 3125.5]] },

      /* W4 Sunny Loess Amphitheatre Terraces (4 flat 5.5 m-stepped shelves + 11.5 deg zig-zag switchback staircases!) */
      { id: 'way.w4.b1', cls: 'side', w: 6.0, ward: 'W4', hillside: true, causeway: true, benchY: 3119.5, tag: 'Upper Yaodong Terrace', pts: [[-482, 16], [-52, 16]] },
      { id: 'way.w4.b2', cls: 'side', w: 6.0, ward: 'W4', hillside: true, causeway: true, benchY: 3114.0, tag: 'Upper-Mid Yaodong Terrace', pts: [[-476, -26], [-52, -26]] },
      { id: 'way.w4.b3', cls: 'side', w: 6.0, ward: 'W4', hillside: true, causeway: true, benchY: 3108.5, tag: 'Lower-Mid Guild Terrace', pts: [[-466, -68], [-52, -68]] },
      { id: 'way.w4.b4', cls: 'side', w: 5.8, ward: 'W4', hillside: true, singleNorth: true, causeway: true, benchY: 3103.0, tag: 'Canyon Belvedere Terrace', pts: [[-466, -104], [-52, -104]] },
      { id: 'way.w4.rim_link_e', cls: 'side', w: 6.0, ward: 'W1', tag: 'East Rim Approach', pts: [[-145, 85, 3125.4], [-52, 85, 3125.3], [-52, 44, 3125.2]] },
      { id: 'way.w4.stairs_e', cls: 'stair', w: 4.4, ward: 'W4', causeway: true, tag: 'Moon-Bridge Switchback Stairs',
        pts: [[-52, 44, 3125.2], [-78, 35.5, 3119.5], [-78, 16, 3119.5], [-78, 2, 3119.5], [-52, -6.5, 3114.0], [-52, -26, 3114.0], [-52, -40, 3114.0], [-78, -48.5, 3108.5], [-78, -68, 3108.5], [-78, -82, 3108.5], [-52, -90.5, 3103.0], [-52, -104, 3103.0]] },
      { id: 'way.w4.stairs_m', cls: 'stair', w: 4.4, ward: 'W4', causeway: true, tag: 'Central Amphitheatre Switchback Stairs',
        pts: [[-250, 44, 3125.2], [-276, 35.5, 3119.5], [-276, 16, 3119.5], [-276, 2, 3119.5], [-250, -6.5, 3114.0], [-250, -26, 3114.0], [-250, -40, 3114.0], [-276, -48.5, 3108.5], [-276, -68, 3108.5], [-276, -82, 3108.5], [-250, -90.5, 3103.0], [-250, -104, 3103.0]] },
      { id: 'way.w4.stairs_w', cls: 'stair', w: 4.4, ward: 'W4', causeway: true, tag: 'West Gully Switchback Stairs',
        pts: [[-442, 44, 3125.5], [-468, 35.5, 3119.5], [-468, 16, 3119.5], [-468, 2, 3119.5], [-442, -6.5, 3114.0], [-442, -26, 3114.0], [-442, -40, 3114.0], [-468, -48.5, 3108.5], [-468, -68, 3108.5], [-468, -82, 3108.5], [-442, -90.5, 3103.0], [-442, -104, 3103.0]] },

      /* W5 Yut-Ma Mill-Gorge & Kiln Benches + 11.3-deg 4-Leg Gorge Switchback Road + Weir Bridge */
      { id: 'way.w5.mule_down', cls: 'side', w: 5.0, ward: 'W5', causeway: true, cliffSwitchback: true, tag: 'Gorge 4-Leg Mule Switchback',
        pts: [[-466, -104, 3103.0], [-466, -118, 3103.0], [-256, -120, 3061.0], [-256, -126.5, 3061.0], [-466, -128.5, 3019.0], [-466, -135.0, 3019.0], [-256, -137.0, 2977.0], [-256, -142.0, 2977.0], [-424, -142.0, 2943.5], [-424, -148.0, 2943.5]] },
      { id: 'way.w5.south_mill', cls: 'side', w: 6.0, ward: 'W5', causeway: true, benchY: 2943.5, tag: 'Yut-Ma Mill & Lapidary Leat', pts: [[-424, -148], [-42, -148]] },
      { id: 'way.w5.weir_bridge', cls: 'bridge', w: 5.4, ward: 'W5', tag: 'Weir Packhorse Bridge',
        pts: [[-42, -148, 2943.5], [-42, -238, 2939.5], [65, -248, 2930.5]] },
      { id: 'way.w5.north_kiln', cls: 'side', w: 6.5, ward: 'W5', causeway: true, benchY: 2930.5, tag: 'Dragon-Kiln & Insulator Terrace', pts: [[65, -248], [395, -248]] },

      /* W6 Stepped Freight Plazas & Fulcrum Brow + <=15.5-deg 4-Leg Escarpment Convoy Switchback */
      { id: 'way.w6.plaza_e1', cls: 'side', w: 7.0, ward: 'W6', benchY: 3121.4, tag: 'Upper Freight Plaza Cross', pts: [[326, 152], [326, 385]] },
      { id: 'way.w6.plaza_e2', cls: 'side', w: 7.0, ward: 'W6', benchY: 3116.8, tag: 'Middle Freight Plaza Cross', pts: [[456, 152], [456, 385]] },
      { id: 'way.w6.north', cls: 'side', w: 7.5, ward: 'W6', causeway: true, tag: 'Hoist North Apron',
        pts: [[326, 152, 3121.4], [456, 152, 3116.8], [545, 152, 3112.0], [705, 152, 3112.0]] },
      { id: 'way.w6.south', cls: 'side', w: 7.5, ward: 'W6', causeway: true, tag: 'Hoist South Apron',
        pts: [[326, 385, 3121.4], [456, 385, 3116.8], [545, 385, 3112.0], [705, 385, 3112.0]] },
      { id: 'way.w6.cross', cls: 'side', w: 7.5, ward: 'W6', benchY: 3112.0, tag: 'Beacon Cross', pts: [[625, 115], [625, 435]] },
      { id: 'way.w6.switchback', cls: 'main', w: 6.2, ward: 'W6', causeway: true, cliffSwitchback: true, tag: 'Fulcrum Escarpment Convoy Switchback',
        pts: [[705, 385, 3112.0], [752, 385, 3112.0], [792, 85, 3046.0], [812, 85, 3046.0], [838, 425, 2976.0], [856, 425, 2976.0], [876, 85, 2904.0], [892, 85, 2904.0], [896, 285, 2850.0], [904, 285, 2850.0], [904, 260, 2850.0]] },
      { id: 'way.w6.low_convoy', cls: 'main', w: 7.5, ward: 'W6', causeway: true, tag: 'Fulcrum Switchback Foot', pts: [[904, 260], [1030, 260]] },

      /* H1 Gentle 2 m-Stepped Agricultural Terrace Tracks & H2 Graded Haul Road */
      { id: 'way.h1.link', cls: 'main', w: 6.5, ward: 'H1', causeway: true, tag: 'Madder-Terrace Spine Causeway', pts: [[0, -435], [-38, -435], [-38, -579], [-195, -579], [-195, -625], [-345, -625]] },
      { id: 'way.h1.terr1', cls: 'side', w: 5.2, ward: 'H1', causeway: true, benchY: 3068.0, tag: 'Lower Millet Terrace Track', pts: [[-38, -435], [-476, -435]] },
      { id: 'way.h1.terr2', cls: 'side', w: 5.2, ward: 'H1', causeway: true, benchY: 3070.0, tag: 'Redstem Terrace Track', pts: [[-38, -507], [-502, -507]] },
      { id: 'way.h1.terr3', cls: 'side', w: 5.2, ward: 'H1', causeway: true, benchY: 3072.0, tag: 'Wallhemp Terrace Track', pts: [[-195, -579], [-512, -579]] },
      { id: 'way.h1.terr5', cls: 'side', w: 5.2, ward: 'H1', causeway: true, benchY: 3076.0, tag: 'Upper Lentil Terrace Track', pts: [[0, -723], [-195, -723], [-502, -723]] },
      { id: 'way.h1.north_tie', cls: 'side', w: 5.2, ward: 'H1', causeway: true, tag: 'Terrace Hamlet Link', pts: [[-195, -625], [-195, -723]] },
      { id: 'way.h2.link', cls: 'main', w: 6.5, ward: 'H2', causeway: true, tag: 'Breccia-Adit Graded Haul Road', pts: [[-585, 378], [-618, 462], [-668, 548], [-755, 635]] }
    ];

    /* Index all ways in roadSpace so no building footprint ever steps into a street carriageway */
    for (var wi = 0; wi < ways.length; wi++) {
      var wy = ways[wi];
      var rhw = (wy.w == null ? 6.0 : wy.w) * 0.5 + 0.85;
      for (var wk = 0; wk + 1 < wy.pts.length; wk++) {
        var pa = wy.pts[wk], pb = wy.pts[wk + 1];
        var mx = 0.5 * (pa[0] + pb[0]), mz = 0.5 * (pa[1] + pb[1]);
        var segL = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        if (segL < 0.5) continue;
        var sry = Math.atan2(pb[0] - pa[0], pb[1] - pa[1]);
        var ro = makeObb(mx, mz, sry, rhw * 2, segL, 0);
        roadSpace.insert(ro, mx, mz, ro.r);
      }
    }

    function canPlaceObb(ob, allowSteep, skipRoad) {
      if (G.inCanyonVoid(ob.x, ob.z, Math.max(ob.hw, ob.hd) + 1.5)) return false;
      /* Keep clear of eastern sheer cliff face x in [742, 868] */
      if (ob.x + ob.r > 740 && ob.x - ob.r < 868) return false;
      /* Keep clear of Siru-Spring pools */
      for (var pi = 0; pi < H.STILL_POOLS.length; pi++) {
        var sp = H.STILL_POOLS[pi];
        if (Math.hypot(ob.x - sp.cx, ob.z - sp.cz) < ob.r + 7.0) return false;
      }
      if (!skipRoad && roadSpace.some(ob.x, ob.z, ob.r, function (ro) { return obbOverlap(ob, ro); })) return false;
      if (occ.some(ob.x, ob.z, ob.r, function (eo) { return obbOverlap(ob, eo); })) return false;
      if (!allowSteep) {
        var gr = G.grad(ob.x, ob.z);
        if (gr.g > 0.34) return false;
      }
      return true;
    }

    function tryAddLot(spec) {
      var P = KRATOR_KITS.parseKey(spec.key, 'hayrant');
      var dm = getDims(P.key);
      var pad = spec.pad == null ? 0.55 : spec.pad;
      var ob = makeObb(spec.x, spec.z, spec.ry == null ? 0 : spec.ry, dm.w, dm.d, pad);
      if (!spec.force && !canPlaceObb(ob, !!spec.allowSteep, !!spec.skipRoad)) return null;
      if (spec.force && occ.some(ob.x, ob.z, ob.r, function (eo) { return obbOverlap(ob, eo); })) return null;
      occ.insert(ob, ob.x, ob.z, ob.r);
      var padY = spec.y != null ? spec.y : G.h(spec.x, spec.z);
      var rec = {
        id: spec.id,
        ward: spec.ward || wardOfXZ(spec.x, spec.z),
        kit: P.kitId,
        rawKey: P.key,
        key: P.qkey,
        v: spec.v == null ? 0 : (spec.v | 0),
        cls: spec.cls || 'middle',
        landmark: !!spec.landmark,
        constructing: spec.constructing == null ? null : +spec.constructing,
        cornice: CORNICE_M[P.key] == null ? dm.h : CORNICE_M[P.key],
        avenuePair: spec.avenuePair || null,
        x: +spec.x.toFixed(3),
        z: +spec.z.toFixed(3),
        y: +padY.toFixed(3),
        padY: +padY.toFixed(3),
        ry: +(spec.ry == null ? 0 : spec.ry).toFixed(4),
        w: dm.w,
        d: dm.d,
        h: dm.h,
        obb: ob
      };
      lots.push(rec);
      lotById[rec.id] = rec;
      return rec;
    }

    /* ==== STEP 1: Pinned Civic, Sacred, Diplomatic, Defence & Industrial Landmarks ==== */
    var PINNED = [
      /* W1 Pepar-Hom Citadel & Suzerain Spine */
      { id: 'lm.prefect_seat', ward: 'W1', key: 'hayrant:hy_prefect_seat', x: -48, z: 215, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.statuary_ranks', ward: 'W1', key: 'hayrant:hy_statuary_ranks', x: -48, z: 298, ry: Math.PI, cls: 'civic', landmark: true },
      { id: 'lm.assay_registry', ward: 'W1', key: 'hayrant:hy_assay_registry', x: 52, z: 218, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.exam_school', ward: 'W1', key: 'hayrant:hy_examination_school', x: 55, z: 302, ry: Math.PI, cls: 'civic', landmark: true },
      { id: 'lm.tube_relay', ward: 'W1', key: 'hayrant:hy_tube_relay', x: 192, z: 222, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.et_ministry', ward: 'W1', key: 'eternian:et_ministry', x: -52, z: 102, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.et_exam', ward: 'W1', key: 'eternian:et_examination_hall', x: 52, z: 102, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.et_registry', ward: 'W1', key: 'eternian:et_registry', x: -52, z: 425, ry: Math.PI, cls: 'civic', landmark: true },
      { id: 'lm.et_heir_pav', ward: 'W1', key: 'eternian:et_heir_pavilion', x: 52, z: 425, ry: Math.PI, cls: 'civic', landmark: true },

      /* W2 Sutar-Tawar Star-Spur & Siru-Spring Stepped Sanctuary */
      { id: 'lm.clock_obs', ward: 'W2', key: 'hayrant:hy_clock_observatory', x: 422, z: 95, y: 3136.0, ry: -Math.PI * 0.5, cls: 'civic', landmark: true, allowSteep: true },
      { id: 'lm.sanctuary', ward: 'W2', key: 'hayrant:hy_withdrawn_sanctuary', x: 342, z: 58, y: 3130.5, ry: Math.PI, cls: 'civic', landmark: true, allowSteep: true },
      { id: 'lm.stepwell', ward: 'W2', key: 'hayrant:hy_spring_stepwell', x: 302, z: -84, y: 3110.0, ry: 0, cls: 'civic', landmark: true, force: true },
      { id: 'lm.healer_bath', ward: 'W2', key: 'hayrant:hy_healer_bath', x: 376, z: -84, y: 3110.0, ry: 0, cls: 'civic', landmark: true, force: true },
      { id: 'lm.talking_head', ward: 'W2', key: 'hayrant:hy_talking_head', x: 338, z: -34, y: 3115.5, ry: Math.PI, cls: 'civic', landmark: true, allowSteep: true, skipRoad: true },
      { id: 'lm.barrow', ward: 'W2', key: 'hayrant:hy_ancestor_barrow', x: -492, z: 562, ry: 0.4, cls: 'civic', landmark: true, allowSteep: true },

      /* W3 Kuran-Kotan & West Pass Gate */
      { id: 'lm.pass_gate', ward: 'W3', key: 'hayrant:hy_pass_gate', x: -625, z: 243, ry: 0, cls: 'civic', landmark: true, force: true },
      { id: 'lm.nuraghe_fort', ward: 'W3', key: 'hayrant:hy_nuraghe_fort', x: -565, z: 202, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.wall_seg_n', ward: 'W3', key: 'hayrant:hy_wall_segment', x: -625, z: 222, ry: Math.PI * 0.5, cls: 'civic', landmark: true, force: true },
      { id: 'lm.wall_seg_s', ward: 'W3', key: 'hayrant:hy_wall_segment', x: -625, z: 282, ry: Math.PI * 0.5, cls: 'civic', landmark: true, force: true },
      { id: 'lm.kuran_legation', ward: 'W3', key: 'hayrant:hy_kuran_legation', x: -485, z: 215, ry: 0, cls: 'civic', landmark: true },
      { id: 'lm.caravanserai', ward: 'W3', key: 'hayrant:hy_caravanserai_inn', x: -485, z: 306, ry: Math.PI, cls: 'tavern', landmark: true },
      { id: 'lm.market_hall', ward: 'W3', key: 'hayrant:hy_market_hall', x: -355, z: 218, ry: 0, cls: 'shop', landmark: true },
      { id: 'lm.hearth_tavern', ward: 'W3', key: 'hayrant:hy_hearth_tavern', x: -355, z: 298, ry: Math.PI, cls: 'tavern', landmark: true },
      { id: 'lm.plaid_weaver', ward: 'W3', key: 'hayrant:hy_plaid_weaver', x: -398, z: 122, ry: 0, cls: 'industrial', landmark: true },

      /* W4 Sunny Loess Amphitheatre Terraces (yaodong cave rows & artisan terraces facing 40 S sun) */
      { id: 'lm.yaodong_b1w', ward: 'W4', key: 'hayrant:hy_loess_yaodong', x: -370, z: 30, y: 3119.5, ry: Math.PI, cls: 'poor', landmark: true, allowSteep: true },
      { id: 'lm.yaodong_b1e', ward: 'W4', key: 'hayrant:hy_loess_yaodong', x: -195, z: 30, y: 3119.5, ry: Math.PI, cls: 'poor', landmark: true, allowSteep: true },
      { id: 'lm.yaodong_b2w', ward: 'W4', key: 'hayrant:hy_loess_yaodong', x: -355, z: -13, y: 3114.0, ry: Math.PI, cls: 'poor', landmark: true, allowSteep: true },
      { id: 'lm.yaodong_b2e', ward: 'W4', key: 'hayrant:hy_loess_yaodong', x: -185, z: -13, y: 3114.0, ry: Math.PI, cls: 'poor', landmark: true, allowSteep: true },
      { id: 'lm.mushroom_b3', ward: 'W4', key: 'hayrant:hy_mushroom_drift', x: -318, z: -55, y: 3108.5, ry: Math.PI, cls: 'industrial', landmark: true, allowSteep: true },
      { id: 'lm.bakehouse_w4', ward: 'W4', key: 'hayrant:hy_millet_bakehouse', x: -115, z: 29, y: 3119.5, ry: Math.PI, cls: 'shop', allowSteep: true },
      { id: 'lm.brewery_w4', ward: 'W4', key: 'hayrant:hy_buckwheat_brewery', x: -115, z: -14, y: 3114.0, ry: Math.PI, cls: 'industrial', allowSteep: true },
      { id: 'lm.butcher_w4', ward: 'W4', key: 'hayrant:hy_smokehouse_butcher', x: -125, z: -56, y: 3108.5, ry: Math.PI, cls: 'shop', allowSteep: true },

      /* W5 Yut-Ma Mill-Gorge & Kiln Floor */
      { id: 'lm.flume_yard', ward: 'W5', key: 'hayrant:hy_larch_flume_yard', x: -335, z: -171, y: 2943.5, ry: 0, cls: 'industrial', landmark: true, force: true },
      { id: 'lm.nephrite_lap', ward: 'W5', key: 'hayrant:hy_nephrite_lapidary', x: -235, z: -171, y: 2943.5, ry: 0, cls: 'industrial', landmark: true, force: true },
      { id: 'lm.saltpeter', ward: 'W5', key: 'hayrant:hy_saltpeter_works', x: -135, z: -133, y: 2943.5, ry: Math.PI, cls: 'industrial', landmark: true, force: true },
      { id: 'lm.gorge_smithy', ward: 'W5', key: 'hayrant:hy_iron_smithy', x: -88, z: -171, y: 2943.5, ry: 0, cls: 'industrial', force: true },
      { id: 'lm.tannery_w5', ward: 'W5', key: 'hayrant:hy_pelt_tannery', x: -190, z: -133, y: 2943.5, ry: Math.PI, cls: 'industrial', force: true },
      { id: 'lm.dragon_kiln', ward: 'W5', key: 'hayrant:hy_stoneware_kiln', x: 135, z: -268, y: 2930.5, ry: 0, cls: 'industrial', landmark: true, allowSteep: true },
      { id: 'lm.gorge_granary', ward: 'W5', key: 'hayrant:hy_granary_nuraghe', x: 215, z: -268, y: 2930.5, ry: 0, cls: 'industrial', allowSteep: true },
      { id: 'lm.et_porcelain', ward: 'W5', key: 'eternian:et_porcelain', x: 295, z: -268, y: 2930.5, ry: 0, cls: 'industrial', allowSteep: true },
      { id: 'lm.et_kiln', ward: 'W5', key: 'eternian:et_kiln', x: 362, z: -268, y: 2930.5, ry: 0, cls: 'industrial', allowSteep: true },

      /* W6 Fulcrum Brow Eastern Escarpment Lip (+3112.0 m) */
      { id: 'lm.cliff_hoist', ward: 'W6', key: 'hayrant:hy_escarpment_hoist', x: 726, z: 260, y: 3112.0, ry: -Math.PI * 0.5, cls: 'industrial', landmark: true, skipRoad: true, force: true },
      { id: 'lm.beacon_nuraghe', ward: 'W6', key: 'hayrant:hy_beacon_nuraghe', x: 716, z: 112, y: 3112.0, ry: Math.PI * 0.5, cls: 'civic', landmark: true, force: true },
      { id: 'lm.vault_w6', ward: 'W6', key: 'hayrant:hy_warehouse_vault', x: 668, z: 222, y: 3112.0, ry: 0, cls: 'industrial', landmark: true },
      { id: 'lm.et_customs', ward: 'W6', key: 'eternian:et_customs_house', x: 668, z: 298, y: 3112.0, ry: Math.PI, cls: 'civic', landmark: true },
      { id: 'lm.et_warehouse', ward: 'W6', key: 'eternian:et_warehouse', x: 582, z: 222, y: 3112.0, ry: 0, cls: 'industrial' },
      { id: 'lm.fishery_cure', ward: 'W6', key: 'hayrant:hy_trench_fishery', x: 582, z: 298, y: 3112.0, ry: Math.PI, cls: 'industrial' }
    ];

    for (var pi = 0; pi < PINNED.length; pi++) {
      tryAddLot(PINNED[pi]);
    }

    /* ==== STEP 2: Paired Suzerain-Vassal Mixed Avenue Blocks in W1 (enforcing <= 0.50 m cornice delta!) ==== */
    var MIXED_PAIRS = [
      /* North Censorate Street (z = 135) & South Registry Street (z = 390) paired plots */
      { pairId: 'pair.1', a: ['eternian:et_official_villa', -222, 102, 0], b: ['hayrant:hy_clan_lord_compound', -180, 102, 0] },
      { pairId: 'pair.2', a: ['eternian:et_merchant_house', 172, 110, 0], b: ['hayrant:hy_merchant_tower_rich', 202, 110, 0] },
      { pairId: 'pair.3', a: ['eternian:et_canal_house', -218, 162, Math.PI], b: ['hayrant:hy_bench_house_mid', -192, 162, Math.PI] },
      { pairId: 'pair.4', a: ['eternian:et_court_house', 172, 166, Math.PI], b: ['hayrant:hy_courtyard_loess_mid', 206, 166, Math.PI] },
      { pairId: 'pair.5', a: ['eternian:et_corner_turret', -116, 228, 0], b: ['hayrant:hy_corner_turret_mid', -90, 228, 0] },
      { pairId: 'pair.6', a: ['eternian:et_merchant_house', 98, 228, 0], b: ['hayrant:hy_merchant_tower_rich', 124, 228, 0] },
      { pairId: 'pair.7', a: ['eternian:et_canal_house', -116, 292, Math.PI], b: ['hayrant:hy_bench_house_mid', -90, 292, Math.PI] },
      { pairId: 'pair.8', a: ['eternian:et_shophouse', 98, 292, Math.PI], b: ['hayrant:hy_nuraghe_chise_mid', 124, 292, Math.PI] },
      { pairId: 'pair.9', a: ['eternian:et_canal_row', -218, 362, 0], b: ['hayrant:hy_terrace_row_poor', -188, 362, 0] },
      { pairId: 'pair.10', a: ['eternian:et_official_villa', 170, 356, 0], b: ['hayrant:hy_clan_lord_compound', 212, 356, 0] }
    ];

    var avenuePairs = [];
    for (var mpi = 0; mpi < MIXED_PAIRS.length; mpi++) {
      var mp = MIXED_PAIRS[mpi];
      var la = tryAddLot({ id: 'av.' + mpi + '.et', ward: 'W1', key: mp.a[0], x: mp.a[1], z: mp.a[2], ry: mp.a[3], cls: 'rich', avenuePair: mp.pairId });
      var lb = tryAddLot({ id: 'av.' + mpi + '.hy', ward: 'W1', key: mp.b[0], x: mp.b[1], z: mp.b[2], ry: mp.b[3], cls: 'rich', avenuePair: mp.pairId });
      if (la && lb) {
        avenuePairs.push({
          id: mp.pairId,
          etKey: la.rawKey,
          hyKey: lb.rawKey,
          etCornice: la.cornice,
          hyCornice: lb.cornice,
          delta: +Math.abs(la.cornice - lb.cornice).toFixed(3)
        });
      }
    }

    /* ==== STEP 3: KCITY.create + KCITY.multikit Core Grid Pass on W1/W3 Plateau ==== */
    var mk = KCITY.multikit({
      kits: KRATOR_KITS,
      foundingKit: 'hayrant',
      styleState: styleState,
      wardAt: function (p) { return wardOfXZ(p[0], p[1]); }
    });

    var cityInst = KCITY.create({
      name: 'mirabilis',
      seed: seed,
      rand: 'krand',
      tune: { exact: true, stance: 'door' },
      ground: { h: G.h },
      kit: mk.kit,
      rules: Object.assign({}, mk.rules, {
        wealth: function (p) {
          var w = wardOfXZ(p[0], p[1]);
          return w === 'W1' ? 0.72 : (w === 'W3' ? 0.56 : 0.42);
        },
        groundOk: function (bo) {
          var ry = Math.atan2(bo.v[0], bo.v[1]);
          var ob = makeObb(bo.c[0], bo.c[1], ry, bo.hw * 2, bo.hd * 2, 0.45);
          return canPlaceObb(ob, false, false);
        }
      }),
      finish: [mk.finish],
      steps: [
        { name: 'seed-ways', run: function () {
          var SL = KCITY.lib.SL;
          SL.note(1, 'Mirabilis plateau streets seeded');
        } }
      ]
    });
    cityInst.run();

    /* ==== STEP 4: Multi-Kit Ward-Zoned Street-Frontage Completion Across W1..W6 ==== */
    var WARD_POOLS = {
      W1: [
        'hayrant:hy_bench_house_mid', 'hayrant:hy_courtyard_loess_mid',
        'hayrant:hy_merchant_tower_rich', 'hayrant:hy_corner_turret_mid',
        'hayrant:hy_clan_lord_compound', 'hayrant:hy_nuraghe_chise_mid',
        'hayrant:hy_millet_bakehouse', 'hayrant:hy_hearth_tavern',
        'hayrant:hy_plaid_weaver',
        'eternian:et_canal_house', 'eternian:et_court_house',
        'eternian:et_merchant_house', 'eternian:et_corner_turret',
        'eternian:et_official_villa', 'eternian:et_shophouse',
        'eternian:et_tea_house'
      ],
      W2: [
        'hayrant:hy_nuraghe_chise_mid', 'hayrant:hy_courtyard_loess_mid',
        'hayrant:hy_bench_house_mid', 'hayrant:hy_larch_chise_poor',
        'hayrant:hy_healer_bath', 'hayrant:hy_terrace_row_poor',
        'eternian:et_tea_house'
      ],
      W3: [
        'hayrant:hy_bench_house_mid', 'hayrant:hy_nuraghe_chise_mid',
        'hayrant:hy_terrace_row_poor', 'hayrant:hy_larch_chise_poor',
        'hayrant:hy_corner_turret_mid', 'hayrant:hy_plaid_weaver',
        'hayrant:hy_millet_bakehouse', 'hayrant:hy_smokehouse_butcher',
        'hayrant:hy_buckwheat_brewery', 'hayrant:hy_pelt_tannery',
        'hayrant:hy_hearth_tavern', 'eternian:et_shophouse'
      ],
      W4: [
        'hayrant:hy_loess_yaodong', 'hayrant:hy_scarp_cellar_poor',
        'hayrant:hy_terrace_row_poor', 'hayrant:hy_larch_chise_poor',
        'hayrant:hy_nuraghe_chise_mid', 'hayrant:hy_bench_house_mid',
        'hayrant:hy_mushroom_drift', 'hayrant:hy_millet_bakehouse',
        'hayrant:hy_plaid_weaver', 'hayrant:hy_iron_smithy'
      ],
      W5: [
        'hayrant:hy_scarp_cellar_poor', 'hayrant:hy_larch_chise_poor',
        'hayrant:hy_iron_smithy', 'hayrant:hy_pelt_tannery',
        'hayrant:hy_granary_nuraghe', 'hayrant:hy_stoneware_kiln',
        'eternian:et_smithy'
      ],
      W6: [
        'hayrant:hy_warehouse_vault', 'hayrant:hy_granary_nuraghe',
        'hayrant:hy_bench_house_mid', 'hayrant:hy_terrace_row_poor',
        'hayrant:hy_iron_smithy', 'eternian:et_granary',
        'eternian:et_warehouse', 'eternian:et_barracks'
      ]
    };

    /* Subdivide large W1, W3, and W6 urban blocks with landmark-safe neighborhood alleys before street infill */
    var NEIGHBORHOOD_LANES = [
      /* W1 block-spanning inner alleys (each endpoint lands directly on an existing W1 street!) */
      { id: 'way.w1.alley_n1', cls: 'side', w: 5.6, ward: 'W1', tag: 'Censorate West Lane', pts: [[-145, 198], [0, 198]] },
      { id: 'way.w1.alley_n2', cls: 'side', w: 5.6, ward: 'W1', tag: 'Censorate East Lane', pts: [[0, 198], [142, 198]] },
      { id: 'way.w1.alley_s1', cls: 'side', w: 5.6, ward: 'W1', tag: 'Registry West Lane', pts: [[-145, 326], [0, 326]] },
      { id: 'way.w1.alley_s2', cls: 'side', w: 5.6, ward: 'W1', tag: 'Registry East Lane', pts: [[0, 326], [142, 326]] },
      { id: 'way.w1.alley_f1', cls: 'side', w: 5.4, ward: 'W1', tag: 'South Compound West', pts: [[-145, 438], [0, 438]] },
      { id: 'way.w1.alley_f2', cls: 'side', w: 5.4, ward: 'W1', tag: 'South Compound East', pts: [[0, 438], [142, 438]] },
      { id: 'way.w1.alley_wn', cls: 'side', w: 5.6, ward: 'W1', tag: 'West Compound Lane N', pts: [[-212, 135], [-212, 260]] },
      { id: 'way.w1.alley_ws', cls: 'side', w: 5.6, ward: 'W1', tag: 'West Compound Lane S', pts: [[-212, 260], [-212, 390]] },
      { id: 'way.w1.alley_wf', cls: 'side', w: 5.6, ward: 'W1', tag: 'West Wall Cross', pts: [[-212, 390], [-212, 485]] },
      { id: 'way.w1.alley_en', cls: 'side', w: 5.6, ward: 'W1', tag: 'East Compound Lane N', pts: [[208, 135], [208, 260]] },
      { id: 'way.w1.alley_es', cls: 'side', w: 5.6, ward: 'W1', tag: 'East Compound Lane S', pts: [[208, 260], [208, 390]] },
      { id: 'way.w1.alley_ef', cls: 'side', w: 5.6, ward: 'W1', tag: 'East Wall Cross', pts: [[208, 390], [208, 485]] },
      /* W3 block-spanning inner alleys */
      { id: 'way.w3.alley_nw', cls: 'side', w: 5.6, ward: 'W3', tag: 'Kuran North Alley W', pts: [[-585, 204], [-435, 204]] },
      { id: 'way.w3.alley_ne', cls: 'side', w: 5.6, ward: 'W3', tag: 'Kuran North Alley E', pts: [[-435, 204], [-272, 204]] },
      { id: 'way.w3.alley_sw', cls: 'side', w: 5.6, ward: 'W3', tag: 'Caravan Alley W', pts: [[-585, 318], [-435, 318]] },
      { id: 'way.w3.alley_se', cls: 'side', w: 5.6, ward: 'W3', tag: 'Caravan Alley E', pts: [[-435, 318], [-272, 318]] },
      { id: 'way.w3.alley_wn', cls: 'side', w: 5.4, ward: 'W3', tag: 'Tanners Cross N', pts: [[-515, 148], [-515, 260]] },
      { id: 'way.w3.alley_ws', cls: 'side', w: 5.4, ward: 'W3', tag: 'Tanners Cross S', pts: [[-515, 260], [-515, 378]] },
      { id: 'way.w3.alley_en', cls: 'side', w: 5.4, ward: 'W3', tag: 'Packhorse Cross N', pts: [[-352, 148], [-352, 260]] },
      { id: 'way.w3.alley_es', cls: 'side', w: 5.4, ward: 'W3', tag: 'Packhorse Cross S', pts: [[-352, 260], [-352, 378]] },
      /* W6 block-spanning inner alleys */
      { id: 'way.w6.alley_nw', cls: 'side', w: 5.6, ward: 'W6', tag: 'Freight North Alley W', pts: [[545, 202], [625, 202]] },
      { id: 'way.w6.alley_ne', cls: 'side', w: 5.6, ward: 'W6', tag: 'Freight North Alley E', pts: [[625, 202], [705, 202]] },
      { id: 'way.w6.alley_sw', cls: 'side', w: 5.6, ward: 'W6', tag: 'Freight South Alley W', pts: [[545, 322], [625, 322]] },
      { id: 'way.w6.alley_se', cls: 'side', w: 5.6, ward: 'W6', tag: 'Freight South Alley E', pts: [[625, 322], [705, 322]] }
    ];
    for (var nli = 0; nli < NEIGHBORHOOD_LANES.length; nli++) {
      var nl = NEIGHBORHOOD_LANES[nli];
      var nlA = nl.pts[0], nlB = nl.pts[1];
      var cmX = 0.5 * (nlA[0] + nlB[0]), cmZ = 0.5 * (nlA[1] + nlB[1]);
      var cLen = Math.hypot(nlB[0] - nlA[0], nlB[1] - nlA[1]);
      var nlRy = Math.atan2(nlB[0] - nlA[0], nlB[1] - nlA[1]);
      var cObb = makeObb(cmX, cmZ, nlRy, nl.w + 1.3, cLen, 0);
      if (!occ.some(cmX, cmZ, cObb.r, function (eo) { return obbOverlap(cObb, eo); })) {
        ways.push({ id: nl.id, cls: nl.cls, w: nl.w, ward: nl.ward, tag: nl.tag, pts: [[nlA[0], nlA[1]], [nlB[0], nlB[1]]] });
        roadSpace.insert(cObb, cmX, cmZ, cObb.r);
      }
    }

    var fillIdx = 0;
    for (var fwi = 0; fwi < ways.length; fwi++) {
      var fw = ways[fwi];
      if (fw.cls === 'bridge' || fw.cls === 'stair' || fw.cliffSwitchback || fw.ward === 'H1' || fw.ward === 'H2') continue;
      var pool = WARD_POOLS[fw.ward] || WARD_POOLS.W1;
      var halfW = (fw.w == null ? 7.0 : fw.w) * 0.5;
      var isHillside = !!fw.hillside;
      var sides = fw.singleNorth ? [1] : (isHillside ? [1, -1] : [-1, 1]);
      for (var fk = 0; fk + 1 < fw.pts.length; fk++) {
        var pA = fw.pts[fk], pB = fw.pts[fk + 1];
        var dx = pB[0] - pA[0], dz = pB[1] - pA[1];
        var segLen = Math.hypot(dx, dz);
        if (segLen < 16.0) continue;
        var tx = dx / segLen, tz = dz / segLen;
        for (var si = 0; si < sides.length; si++) {
          var sgn = sides[si];
          /* On hillside contour benches, south side (+z, sgn = +1 for +x way) backs into the loess terrace wall; north side faces view */
          if (fw.id === 'way.ukor_pass_w' || fw.id === 'way.w6.low_convoy') continue;
          var nx = -tz * sgn, nz = tx * sgn;
          var faceRy = Math.atan2(-nx, -nz);
          var stepS = isHillside ? 21.0 : 20.5;
          for (var distS = 10.5, slot = 0; distS <= segLen - 10.5; distS += stepS, slot++) {
            var sx = pA[0] + tx * distS, sz = pA[1] + tz * distS;
            var hHash = KRAND.hash(seed, 0x42B1, fwi, fk * 64 + slot * 2 + (sgn > 0 ? 1 : 0));
            var cands = [
              pool[hHash % pool.length],
              pool[(hHash >>> 4) % pool.length],
              pool[(hHash >>> 9) % pool.length],
              fw.ward === 'W4' ? 'hayrant:hy_scarp_cellar_poor' : 'hayrant:hy_larch_chise_poor'
            ];
            for (var ci = 0; ci < cands.length; ci++) {
              var qk = cands[ci];
              var rk = qk.split(':')[1];
              var cd = getDims(rk);
              var setback = halfW + 1.25 + cd.d * 0.5;
              var bx = sx + nx * setback, bz = sz + nz * setback;
              var fixedY = ((isHillside || fw.ward === 'W5' || fw.ward === 'H1') && fw.benchY != null) ? fw.benchY : null;
              var added = tryAddLot({
                id: 'mb.lot.' + (fillIdx++),
                ward: fw.ward,
                key: qk,
                v: (hHash >>> 7) % 3,
                x: bx,
                z: bz,
                y: fixedY,
                ry: faceRy,
                pad: 0.36,
                allowSteep: isHillside || fw.ward === 'W5'
              });
              if (added) break;
            }
          }
        }
      }
    }

    /* ==== STEP 5: Satellite Hamlets H1 (Madder-Terrace Farming) & H2 (Breccia-Adit Mining) via KHAMLET.village ==== */
    var oreNodes = [
      { id: 'ore.iron.1', kind: 'iron', grade: 'high', key: 'node-iron-high', x: -792, z: 736, y: G.h(-792, 736) },
      { id: 'ore.gold.1', kind: 'gold', grade: 'medium', key: 'node-gold-medium', x: -738, z: 742, y: G.h(-738, 742) },
      { id: 'ore.silver.1', kind: 'silver', grade: 'medium', key: 'node-silver-medium', x: -688, z: 734, y: G.h(-688, 734) },
      { id: 'ore.tin.1', kind: 'tin', grade: 'low', key: 'node-tin-low', x: -835, z: 722, y: G.h(-835, 722) },
      { id: 'ore.nitre.1', kind: 'saltpeter', grade: 'medium', key: 'node-saltpeter-medium', x: -158, z: -133, y: 2943.6 }
    ];

    var h1Spec = KHAMLET.village({
      id: 'h1_madder_terrace',
      world: seed,
      culture: hayrantHamletRow('farming'),
      focus: 'farming',
      site: { x: -195, z: -625 },
      link: { x: 0, z: -579 },
      resource: { x: -260, z: -507, workers: 36 },
      popMax: 165,
      dims: getDims,
      ground: {
        ok: function (x, z) {
          return x > -298 && x < -86 && z > -680 && z < -548 && G.grad(x, z).g < 0.22;
        }
      }
    });

    var h2Spec = KHAMLET.village({
      id: 'h2_breccia_adit',
      world: seed + 17,
      culture: hayrantHamletRow('mine'),
      focus: 'mine',
      site: { x: -755, z: 635 },
      link: { x: -585, z: 378 },
      resource: { x: -792, z: 736, workers: 32 },
      popMax: 135,
      dims: getDims,
      ground: {
        ok: function (x, z) {
          return x > -890 && x < -638 && z > 564 && z < 726 && G.grad(x, z).g < 0.24;
        }
      }
    });

    var hamlets = [h1Spec, h2Spec];
    for (var hi = 0; hi < hamlets.length; hi++) {
      var hm = hamlets[hi];
      var hWard = hi === 0 ? 'H1' : 'H2';
      var hRecs = hm && hm.records ? hm.records : [];
      for (var hri = 0; hri < hRecs.length; hri++) {
        var hr = hRecs[hri];
        tryAddLot({
          id: hm.id + '.' + hri,
          ward: hWard,
          key: 'hayrant:' + hr.key,
          v: hr.v | 0,
          x: hr.x,
          z: hr.z,
          ry: hr.ry == null ? 0 : hr.ry,
          cls: hr.kind === 'work' ? 'industrial' : 'poor',
          allowSteep: false,
          skipRoad: true
        });
      }
    }

    /* Guarantee explicit collared ore adits on H2 scarp & farmsteads/folds on H1 so every rural hy_* def stands on site */
    var RURAL_PINS = [
      { id: 'h2.adit.iron', ward: 'H2', key: 'hayrant:hy_ore_adit', x: -792, z: 716, y: 3150.2, ry: Math.PI, cls: 'industrial', allowSteep: true, skipRoad: true },
      { id: 'h2.adit.gold', ward: 'H2', key: 'hayrant:hy_ore_adit', x: -738, z: 716, y: 3150.2, ry: Math.PI, cls: 'industrial', allowSteep: true, skipRoad: true },
      { id: 'h1.farmstead.1', ward: 'H1', key: 'hayrant:hy_terrace_farmstead', x: -345, z: -598, y: 3072.0, ry: 0, cls: 'industrial', allowSteep: true, skipRoad: true },
      { id: 'h1.fell_fold.1', ward: 'H1', key: 'hayrant:hy_fell_fold', x: -345, z: -654, y: 3074.0, ry: 0, cls: 'industrial', allowSteep: true, skipRoad: true }
    ];
    for (var rpi = 0; rpi < RURAL_PINS.length; rpi++) {
      tryAddLot(RURAL_PINS[rpi]);
    }

    /* Bind every mine/saltpeter works to its nearest RES_ORE node via resSource (42r-res-ore.js) */
    var oreBindings = [];
    if (typeof resSource === 'function') {
      for (var li = 0; li < lots.length; li++) {
        var lt = lots[li];
        if (lt.rawKey === 'hy_ore_adit' || lt.rawKey === 'hy_saltpeter_works') {
          var src = resSource({ x: lt.x, z: lt.z, works: 'mine' }, oreNodes, { radius: 260 });
          if (src) {
            lt.oreSource = src;
            oreBindings.push({ lotId: lt.id, key: lt.rawKey, nodeId: src.node.id, kind: src.kind, grade: src.grade, rate: src.rate, dist: +src.dist.toFixed(1) });
          }
        }
      }
    }

    /* ==== STEP 6: Mark 5 Active KCONS Rising Construction Lots in W6 (Fulcrum Brow expansion) ==== */
    var consFracs = [0.24, 0.42, 0.58, 0.74, 0.88];
    var consAssigned = 0;
    for (var cli = 0; cli < lots.length && consAssigned < consFracs.length; cli++) {
      var cl = lots[cli];
      if (cl.ward === 'W6' && !cl.landmark && cl.id.indexOf('mb.lot.') === 0) {
        cl.constructing = consFracs[consAssigned++];
      }
    }

    /* ==== STEP 6B: Walled Domestic Yards, Kitchen Gardens & Highland Livestock Pens (filling rear lots & block pockets) ==== */
    var enclosures = [];
    var GARDEN_CROPS = ['dustmillet', 'redstem', 'wallhemp', 'dust-lentil', 'bench-garlic'];
    function w4BenchYAt(x, z, hw, hd) {
      for (var bi = 0; bi < G.W4_BENCHES.length; bi++) {
        var bn = G.W4_BENCHES[bi];
        if (x - hw >= bn.x0 + 2.0 && x + hw <= bn.x1 - 2.0 && z - hd >= bn.z0 + 2.0 && z + hd <= bn.z1 - 2.0) {
          return bn.y;
        }
      }
      return null;
    }
    function tryAddEnclosure(kind, ward, x, z, ry, ew, ed, salt) {
      var eObb = makeObb(x, z, ry, ew, ed, 0.45);
      var w4Y = ward === 'W4' ? w4BenchYAt(x, z, eObb.hw, eObb.hd) : null;
      if (ward === 'W4' && w4Y == null) return false;
      if (!canPlaceObb(eObb, ward === 'W4', false)) return false;
      /* Exclude C1 caravan camp ground */
      if (x > -852 && x < -668 && z > 198 && z < 356) return false;
      occ.insert(eObb, x, z, eObb.r);
      var crop = GARDEN_CROPS[KRAND.hash(seed, 0x6A2D, enclosures.length, salt) % GARDEN_CROPS.length];
      var ey = w4Y != null ? w4Y : G.h(x, z);
      enclosures.push({
        id: 'mb.enc.' + enclosures.length,
        kind: kind,
        ward: ward,
        x: +x.toFixed(2),
        z: +z.toFixed(2),
        y: +ey.toFixed(2),
        ry: +ry.toFixed(4),
        w: +ew.toFixed(2),
        d: +ed.toFixed(2),
        crop: crop,
        seed: KRAND.hash(seed, 0xEC01, enclosures.length, salt)
      });
      return true;
    }

    /* 1. Attach rear walled gardens, drying yards, or livestock folds behind street-frontage lots */
    for (var eli = 0; eli < lots.length; eli++) {
      var el = lots[eli];
      if (el.landmark || el.ward === 'W5') continue;
      var eh = KRAND.hash(seed, 0xBA4E, eli, 11);
      var ew = Math.max(8.5, Math.min(15.5, el.w * 0.94));
      var ed = el.ward === 'W4' ? 7.5 : (9.0 + (eh % 6));
      var backDist = el.d * 0.5 + ed * 0.5 + 0.95;
      var ex = el.x - Math.sin(el.ry) * backDist;
      var ez = el.z - Math.cos(el.ry) * backDist;
      var eKind = 'yard';
      if (el.ward === 'W4') eKind = (eh % 2 === 0) ? 'garden' : 'yard';
      else if (el.ward === 'H1') eKind = (eh % 3 === 0) ? 'pen' : 'garden';
      else if (el.ward === 'H2') eKind = (eh % 2 === 0) ? 'pen' : 'yard';
      else if (el.ward === 'W3') eKind = (eh % 3 === 0) ? 'pen' : ((eh % 3 === 1) ? 'garden' : 'yard');
      else if (el.ward === 'W6') eKind = (eh % 3 === 0) ? 'pen' : 'yard';
      else eKind = (eh % 2 === 0) ? 'garden' : 'yard';
      tryAddEnclosure(eKind, el.ward, ex, ez, el.ry, ew, ed, eli);
    }

    /* 2. Fill remaining open block interiors & terrace pockets with communal gardens, yards & pack-animal corrals */
    var BLOCK_ZONES = [
      { ward: 'W1', x0: -252, x1: 242, z0: 92, z1: 492, step: 19.0, kinds: ['garden', 'yard', 'garden', 'yard'] },
      { ward: 'W3', x0: -608, x1: -268, z0: 108, z1: 452, step: 19.5, kinds: ['pen', 'garden', 'yard', 'pen'] },
      { ward: 'W6', x0: 272, x1: 712, z0: 112, z1: 438, step: 20.0, kinds: ['yard', 'pen', 'garden', 'yard'] },
      { ward: 'W4', x0: -478, x1: -62, z0: -114, z1: 36, step: 18.0, kinds: ['garden', 'yard', 'garden', 'garden'] },
      { ward: 'W2', x0: 262, x1: 422, z0: -108, z1: 175, step: 20.5, kinds: ['garden', 'garden', 'yard', 'pen'] },
      { ward: 'H1', x0: -295, x1: -88, z0: -678, z1: -552, step: 20.5, kinds: ['garden', 'pen', 'garden', 'pen'] },
      { ward: 'H2', x0: -865, x1: -642, z0: 568, z1: 715, step: 22.0, kinds: ['pen', 'yard', 'pen', 'yard'] }
    ];
    for (var bzi = 0; bzi < BLOCK_ZONES.length; bzi++) {
      var bz0 = BLOCK_ZONES[bzi];
      var zSlot = 0;
      for (var gz = bz0.z0; gz <= bz0.z1; gz += bz0.step, zSlot++) {
        var xSlot = 0;
        for (var gx = bz0.x0; gx <= bz0.x1; gx += bz0.step, xSlot++) {
          var bh = KRAND.hash(seed, 0xB10C + bzi, xSlot, zSlot);
          var jx = gx + ((bh & 7) - 3.5) * 0.85;
          var jz = gz + (((bh >>> 3) & 7) - 3.5) * 0.85;
          var bw = 12.5 + ((bh >>> 6) % 5) * 1.1;
          var bd = 11.5 + ((bh >>> 9) % 5) * 1.1;
          var bry = ((bh >>> 12) & 1) ? 0 : Math.PI * 0.5;
          var bk = bz0.kinds[(bh >>> 14) % bz0.kinds.length];
          tryAddEnclosure(bk, bz0.ward, jx, jz, bry, bw, bd, xSlot * 31 + zSlot);
        }
      }
    }

    /* ==== STEP 7: C1 Ukor-Tera Whale-Clan Caravan Halt outside hy_pass_gate via KCAMP.halt ==== */
    var campHalt = KCAMP.halt({
      id: 'c1_ukor_caravan',
      world: seed + 99,
      culture: 'xanadu',
      wagons: 4,
      site: { x: -758, z: 296 },
      way: [-758, 260],
      formation: 'laager',
      dims: function (pkey) {
        var parsed = KCAMP.tentParse ? KCAMP.tentParse(pkey) : { key: pkey };
        var tk = parsed.key || 'tn-ridge-m';
        if (typeof MB_TENTS !== 'undefined' && MB_TENTS && typeof MB_TENTS.dims === 'function') {
          var td = MB_TENTS.dims()[tk];
          if (td) return { w: td.w, d: td.d, h: td.h };
        }
        return { w: 5.2, d: 5.2, h: 3.4 };
      },
      ground: {
        ok: function (x, z) {
          return x > -845 && x < -672 && z > 202 && z < 352;
        }
      }
    });

    /* ==== STEP 8: Overhead Porcelain-Insulator Telegraph Catenary Poles (W1 hy_tube_relay -> W6 hy_escarpment_hoist) ==== */
    var telegraphPts = [
      [192, 232], [252, 246], [335, 246], [425, 246], [525, 246], [625, 246], [712, 246], [712, 152]
    ];
    var telegraphPoles = telegraphPts.map(function (pt, idx) {
      var gy = G.h(pt[0], pt[1]);
      return { id: 'tel.pole.' + idx, x: pt[0], z: pt[1], y: +gy.toFixed(3), topY: +(gy + 7.4).toFixed(3) };
    });

    /* ==== STEP 9: KMASK Road Raster & Single-Component KWALK Connectivity Graph ==== */
    var rmSize = 960, rmX0 = -1200, rmZ0 = -1200, rmCell = 2.5;
    var rmCanvas = KMASK.canvas(rmSize, rmSize);
    var rmCtx = rmCanvas.getContext('2d');
    rmCtx.strokeStyle = '#ff0000';
    for (var mwi = 0; mwi < ways.length; mwi++) {
      var mw = ways[mwi];
      if (mw.cls === 'bridge') continue;
      rmCtx.lineWidth = ((mw.w == null ? 6.5 : mw.w) + 1.6) / rmCell;
      rmCtx.beginPath();
      for (var mpk = 0; mpk < mw.pts.length; mpk++) {
        var mpx = (mw.pts[mpk][0] - rmX0) / rmCell;
        var mpz = (mw.pts[mpk][1] - rmZ0) / rmCell;
        if (mpk === 0) rmCtx.moveTo(mpx, mpz);
        else rmCtx.lineTo(mpx, mpz);
      }
      rmCtx.stroke();
    }
    var roadMask = {
      canvas: rmCanvas,
      hash: KMASK.hash(rmCanvas),
      roadAt: function (x, z) {
        var ix = Math.floor((x - rmX0) / rmCell), iz = Math.floor((z - rmZ0) / rmCell);
        if (ix < 0 || ix >= rmSize || iz < 0 || iz >= rmSize) return 0;
        return rmCanvas.data[(iz * rmSize + ix) * 4] / 255.0;
      }
    };

    /* Build connected walk graph over way endpoints, 2D crossings & T-junctions (tolerance 8.5 m snaps shared junctions) */
    var rawSegs = [];
    for (var gwi = 0; gwi < ways.length; gwi++) {
      var gw = ways[gwi];
      for (var gk = 0; gk + 1 < gw.pts.length; gk++) {
        var pa0 = gw.pts[gk], pb0 = gw.pts[gk + 1];
        var ayH = pa0.length > 2 && pa0[2] != null ? pa0[2] : (gw.benchY != null ? gw.benchY : null);
        var byH = pb0.length > 2 && pb0[2] != null ? pb0[2] : (gw.benchY != null ? gw.benchY : null);
        rawSegs.push({
          ax: pa0[0], az: pa0[1], ay: ayH,
          bx: pb0[0], bz: pb0[1], by: byH,
          w: gw.w == null ? 6.0 : gw.w, cls: gw.cls, id: gw.id, ts: [0, 1]
        });
      }
    }
    /* way.w6.switchback already links W6 (+3112 m) to way.w6.low_convoy (+2850 m) at <= 13 deg */

    function segYAt(S, t) {
      if (S.ay != null && S.by != null) return G.lerp(S.ay, S.by, t);
      var px = G.lerp(S.ax, S.bx, t), pz = G.lerp(S.az, S.bz, t);
      if (Math.abs(px) < 8 && pz >= -246 && pz <= -140) return G.MOON_BRIDGE.deckY;
      return G.h(px, pz);
    }

    for (var s1 = 0; s1 < rawSegs.length; s1++) {
      var A = rawSegs[s1];
      var dAx = A.bx - A.ax, dAz = A.bz - A.az;
      var lenA2 = dAx * dAx + dAz * dAz;
      if (lenA2 < 1e-4) continue;
      for (var s2 = s1 + 1; s2 < rawSegs.length; s2++) {
        var B = rawSegs[s2];
        var dBx = B.bx - B.ax, dBz = B.bz - B.az;
        var det = dAx * dBz - dAz * dBx;
        if (Math.abs(det) > 1e-4) {
          var tA = ((B.ax - A.ax) * dBz - (B.az - A.az) * dBx) / det;
          var tB = ((B.ax - A.ax) * dAz - (B.az - A.az) * dAx) / det;
          if (tA >= -0.03 && tA <= 1.03 && tB >= -0.03 && tB <= 1.03) {
            var tcA = G.clamp(tA, 0, 1), tcB = G.clamp(tB, 0, 1);
            if (Math.abs(segYAt(A, tcA) - segYAt(B, tcB)) <= 4.5) {
              A.ts.push(tcA);
              B.ts.push(tcB);
            }
          }
        }
        /* T-junction projection: snap each endpoint onto the interior of the other segment within 3.0 m AND <= 4.5 m vertical */
        var endB = [[B.ax, B.az, 0], [B.bx, B.bz, 1]];
        for (var eb = 0; eb < 2; eb++) {
          var projA = G.clamp(((endB[eb][0] - A.ax) * dAx + (endB[eb][1] - A.az) * dAz) / lenA2, 0, 1);
          if (Math.hypot(A.ax + dAx * projA - endB[eb][0], A.az + dAz * projA - endB[eb][1]) <= 3.0 &&
              Math.abs(segYAt(A, projA) - segYAt(B, endB[eb][2])) <= 4.5) {
            A.ts.push(projA);
          }
        }
        var lenB2 = dBx * dBx + dBz * dBz;
        if (lenB2 > 1e-4) {
          var endA = [[A.ax, A.az, 0], [A.bx, A.bz, 1]];
          for (var ea = 0; ea < 2; ea++) {
            var projB = G.clamp(((endA[ea][0] - B.ax) * dBx + (endA[ea][1] - B.az) * dBz) / lenB2, 0, 1);
            if (Math.hypot(B.ax + dBx * projB - endA[ea][0], B.az + dBz * projB - endA[ea][1]) <= 3.0 &&
                Math.abs(segYAt(B, projB) - segYAt(A, endA[ea][2])) <= 4.5) {
              B.ts.push(projB);
            }
          }
        }
      }
    }

    var walkNodes = [];
    var walkAdj = [];
    function nodeFor(x, z, yHint) {
      var wy = (Math.abs(x) < 8 && z >= -246 && z <= -140) ? G.MOON_BRIDGE.deckY :
               (yHint != null ? yHint : G.h(x, z));
      for (var i = 0; i < walkNodes.length; i++) {
        if (Math.hypot(walkNodes[i].x - x, walkNodes[i].z - z) <= 3.0 && Math.abs(walkNodes[i].y - wy) <= 4.5) return i;
      }
      walkNodes.push({ id: 'wn.' + walkNodes.length, x: +x.toFixed(2), z: +z.toFixed(2), y: +wy.toFixed(2) });
      walkAdj.push([]);
      return walkNodes.length - 1;
    }
    var walkEdges = [];
    for (var rsi = 0; rsi < rawSegs.length; rsi++) {
      var sg = rawSegs[rsi];
      sg.ts.sort(function (p, q) { return p - q; });
      for (var ti2 = 0; ti2 + 1 < sg.ts.length; ti2++) {
        if (sg.ts[ti2 + 1] - sg.ts[ti2] < 1e-3) continue;
        var t0 = sg.ts[ti2], t1 = sg.ts[ti2 + 1];
        var yh0 = (sg.ay != null && sg.by != null) ? G.lerp(sg.ay, sg.by, t0) : null;
        var yh1 = (sg.ay != null && sg.by != null) ? G.lerp(sg.ay, sg.by, t1) : null;
        var u = nodeFor(G.lerp(sg.ax, sg.bx, t0), G.lerp(sg.az, sg.bz, t0), yh0);
        var v = nodeFor(G.lerp(sg.ax, sg.bx, t1), G.lerp(sg.az, sg.bz, t1), yh1);
        if (u !== v) {
          walkAdj[u].push(v);
          walkAdj[v].push(u);
          walkEdges.push({ a: u, b: v, w: sg.w, cls: sg.cls, id: sg.id });
        }
      }
    }

    /* BFS from Moon-Bridge south head (0, 68) to verify single connected walk network across all wards & hamlets */
    var rootIdx = nodeFor(0, 68);
    var seen = {};
    var q = [rootIdx];
    seen[rootIdx] = true;
    while (q.length) {
      var cur = q.shift();
      var nb = walkAdj[cur];
      for (var ni = 0; ni < nb.length; ni++) {
        if (!seen[nb[ni]]) {
          seen[nb[ni]] = true;
          q.push(nb[ni]);
        }
      }
    }
    var reachableCount = Object.keys(seen).length;

    /* ==== STEP 10: Census, Kit Shares, 47/47 hy_* Piece Audit & 41/41 Trade Coverage Audit ==== */
    var byWard = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0, W6: 0, H1: 0, H2: 0 };
    var byKit = { hayrant: 0, eternian: 0 };
    var w1Kit = { hayrant: 0, eternian: 0 };
    var placedHyKeys = {};
    var placedAllKeys = {};

    for (var ci2 = 0; ci2 < lots.length; ci2++) {
      var L = lots[ci2];
      byWard[L.ward] = (byWard[L.ward] == null ? 0 : byWard[L.ward]) + 1;
      byKit[L.kit] = (byKit[L.kit] == null ? 0 : byKit[L.kit]) + 1;
      if (L.ward === 'W1') w1Kit[L.kit] = (w1Kit[L.kit] == null ? 0 : w1Kit[L.kit]) + 1;
      placedAllKeys[L.rawKey] = (placedAllKeys[L.rawKey] == null ? 0 : placedAllKeys[L.rawKey]) + 1;
      if (L.kit === 'hayrant') placedHyKeys[L.rawKey] = (placedHyKeys[L.rawKey] == null ? 0 : placedHyKeys[L.rawKey]) + 1;
    }

    var missingHyKeys = [];
    for (var rki = 0; rki < REQUIRED_HY_KEYS.length; rki++) {
      var reqK = REQUIRED_HY_KEYS[rki];
      if (!placedHyKeys[reqK]) missingHyKeys.push(reqK);
    }

    var tradesMap = tradesMapFromTable();
    var tradeKeys = Object.keys(tradesMap);
    var unstaffedTrades = [];
    for (var tti = 0; tti < tradeKeys.length; tti++) {
      var trName = tradeKeys[tti];
      var candKeys = tradesMap[trName];
      var staffed = false;
      for (var cki = 0; cki < candKeys.length; cki++) {
        if (placedAllKeys[candKeys[cki]]) { staffed = true; break; }
      }
      if (!staffed) unstaffedTrades.push(trName);
    }

    var maxCorniceDelta = 0;
    for (var api = 0; api < avenuePairs.length; api++) {
      if (avenuePairs[api].delta > maxCorniceDelta) maxCorniceDelta = avenuePairs[api].delta;
    }

    return {
      seed: seed,
      styleState: styleState,
      lots: lots,
      lotById: lotById,
      ways: ways,
      enclosures: enclosures,
      avenuePairs: avenuePairs,
      maxCorniceDelta: +maxCorniceDelta.toFixed(3),
      hamlets: hamlets,
      oreNodes: oreNodes,
      oreBindings: oreBindings,
      campHalt: campHalt,
      telegraphPoles: telegraphPoles,
      roadMask: roadMask,
      walk: {
        nodes: walkNodes,
        edges: walkEdges,
        reachable: reachableCount,
        total: walkNodes.length,
        connected: reachableCount === walkNodes.length && walkNodes.length > 15
      },
      census: {
        totalLots: lots.length,
        enclosures: enclosures.length,
        constructingLots: consAssigned,
        campRecords: campHalt && campHalt.records ? campHalt.records.length : 0,
        byWard: byWard,
        byKit: byKit,
        w1Kit: w1Kit,
        hayrantShare: +(byKit.hayrant / Math.max(1, lots.length)).toFixed(3),
        w1HayrantShare: +(w1Kit.hayrant / Math.max(1, w1Kit.hayrant + w1Kit.eternian)).toFixed(3),
        hyUniquePlaced: Object.keys(placedHyKeys).length,
        hyRequiredTotal: REQUIRED_HY_KEYS.length,
        missingHyKeys: missingHyKeys,
        activeTradesTotal: tradeKeys.length,
        staffedTrades: tradeKeys.length - unstaffedTrades.length,
        unstaffedTrades: unstaffedTrades
      },
      obbOverlap: obbOverlap
    };
  }

  return {
    REQUIRED_HY_KEYS: REQUIRED_HY_KEYS,
    CORNICE_M: CORNICE_M,
    makeObb: makeObb,
    obbOverlap: obbOverlap,
    wardOfXZ: wardOfXZ,
    make: make
  };
})();
