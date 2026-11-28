/* ================================================================= AMARO MULTI-TIER CITY PLAN ON CORE/CITY (Step A1)
   [G data] Six core/city (KCITY) instances across Amaro's four-tier canyon promontory (settlements/shumar/PLAN.md):
     1. AM_UPPER   — Upper Walled Canyon-Lip City (ssgsv5zbd2 proper: Lip Meydan, Qasaba spine, -su Giant Rim Ward, -ra Hearth courts)
     2. AM_CITADEL — Qappu al-Subaru (amaro.citadel, +257..+263 m west prow across the rock-cut dry fosse)
     3. AM_QUBAB   — Madinat al-Qubab (amaro.necropolis, +250..+253 m eastern cliff crest with unblocked 15-qubba Mamluk dome skyline)
     4. AM_CUSTOMS — Terraced Outlander Customs Shelf (-38 m below North Gate rim at +202 m: Babu-Dalab & Babu-Iziz)
     5. AM_FORGES  — Darb al-Kir Forge & Crucible Ledges (+68 m & +138 m shelves + switchback hairpins, 9 city works bound)
     6. AM_GISR    — Payaru-Gisr (amaro.gisr, +4.5..+13 m triple-confluence bridgehead, mill-race watermills & Sunu-sikaru stills)
   Plain records only: no THREE, no DOM. */

var AM_CITY = (function () {
  'use strict';

  /* Exact footprints [w, d, h, variants, giant] matching kits/shumari/src/50..66 (kit DEFS win when loaded on page) */
  var KIT_BOXES = {
    sm_cadet_cell:          [7.4,  8.6,  6.2, 2, false],
    sm_giant_cadet_cell:    [9.8, 12.0,  9.4, 1, true],
    sm_cliff_cot:           [9.2,  9.8,  7.8, 1, false],
    sm_herder_house:       [11.6, 10.4,  6.6, 1, false],
    sm_outlander_lodging:  [11.8, 10.6,  9.4, 1, false],
    sm_hearth_house:       [10.6, 11.6, 10.2, 2, false],
    sm_courtyard_house:    [13.4, 13.6,  9.4, 1, false],
    sm_terrace_house:       [9.4, 11.8, 14.2, 2, false],
    sm_shop_house:         [11.6, 11.4, 10.2, 2, false],
    sm_sword_villa:        [14.6, 16.8, 17.8, 2, true],
    sm_captain_bayt:       [18.2, 18.6, 16.8, 1, true],
    sm_giant_sword_hall:   [16.4, 16.8, 13.8, 1, true],
    sm_rim_pavilion:       [12.4, 14.2, 17.2, 1, true],
    sm_regiment_qubba:     [14.2, 17.2, 19.6, 2, true],
    sm_doriyan_stele:      [11.6, 13.6, 16.2, 1, true],
    sm_hall_of_blades:     [24.8, 18.6, 19.6, 1, true],
    sm_sabil_shrine:       [12.6, 15.0, 16.8, 1, true],
    sm_ordeal_gate:        [13.8, 12.6, 17.8, 1, true],
    sm_wayside_cairn:       [4.8,  5.2,  6.4, 1, false],
    sm_diwan_hall:         [18.8, 20.4, 22.4, 1, true],
    sm_kattu_chancery:     [16.2, 16.2, 13.2, 1, true],
    sm_wikala_caravanserai:[22.4, 21.6, 15.4, 1, true],
    sm_hammam:             [16.8, 16.4, 15.2, 1, true],
    sm_bimaristan:         [18.4, 19.0, 15.6, 1, true],
    sm_state_granary:      [16.6, 16.0, 12.4, 1, true],
    sm_cistern_hall:       [14.4, 16.8, 16.8, 1, true],
    sm_envoy_house:        [15.4, 17.6, 14.2, 1, true],
    sm_citadel_keep:       [19.6, 22.0, 22.2, 1, true],
    sm_curtain_wall:       [18.4, 11.6, 11.2, 1, true],
    sm_pishtaq_gate:       [17.6, 14.4, 15.8, 1, true],
    sm_payaru_tower:       [11.6, 13.4, 22.8, 1, true],
    sm_regiment_barracks:  [19.2, 17.2, 12.8, 1, true],
    sm_ordeal_yard:        [18.6, 19.0, 12.2, 1, true],
    sm_armoury:            [15.2, 15.6, 11.6, 1, true],
    sm_gorge_bridge_tower: [19.6, 13.8, 16.4, 1, true],
    sm_blade_smithy:       [12.8, 12.4,  9.2, 1, false],
    sm_saltpeter_works:    [13.4, 12.2,  8.4, 1, false],
    sm_lacquer_inlay_shop: [10.8, 10.8,  8.6, 1, false],
    sm_stonecutters_yard:  [14.2, 12.6,  8.6, 1, false],
    sm_mine_head:          [13.8, 12.8,  9.4, 1, false],
    sm_salt_evaporator:    [14.4, 12.4,  8.4, 1, false],
    sm_charcoal_kiln:      [14.2, 12.4,  7.2, 1, false],
    sm_placer_sluice:      [14.4, 12.2,  7.4, 1, false],
    sm_bakery:             [10.8, 10.8,  8.8, 1, false],
    sm_butcher:            [10.6, 10.8, 10.2, 1, false],
    sm_weaver_dyer:        [13.8, 13.0,  8.6, 1, false],
    sm_tannery:            [13.6, 12.0,  8.4, 1, false],
    sm_brewery_teahouse:   [13.6, 13.4, 12.8, 1, false],
    sm_bazaar_hall:        [16.8, 12.6,  9.6, 2, false],
    sm_spirits_still:      [14.4, 12.6,  9.2, 1, false],
    sm_lake_jetty:         [15.2, 13.6,  8.2, 1, false],
    sm_watermill:          [13.6, 11.8,  9.4, 1, false],
    sm_apricot_orchard:    [15.2, 13.4,  7.8, 1, false],
    sm_terrace_farm:       [15.6, 13.6,  7.2, 1, false],
    sm_fungus_cellar:      [11.6, 11.8,  6.8, 1, false],
    sm_stock_fold:         [14.6, 13.2,  7.6, 1, false]
  };

  function amDims(key, v) {
    var d = typeof DEFS !== 'undefined' && DEFS && DEFS[key] ? DEFS[key] : null;
    var fb = KIT_BOXES[key];
    if (!d && !fb) return null;
    var w = d && d.w != null ? d.w : fb[0];
    var dp = d && d.d != null ? d.d : fb[1];
    var h = d && d.h != null ? d.h : fb[2];
    var vars = d && d.variants != null ? d.variants : (fb ? fb[3] : 1);
    var giant = d && d.giant != null ? !!d.giant : (fb ? !!fb[4] : false);
    return { key: key, v: v == null ? 0 : v, w: w, d: dp, h: h, variants: vars, giant: giant };
  }

  /* Resident occupancy per building key by district context (Mamluk multi-storey bayt & rab' households) */
  var BASE_PEOPLE = {
    sm_terrace_house: 15,
    sm_hearth_house: 12,
    sm_courtyard_house: 13,
    sm_shop_house: 11,
    sm_sword_villa: 16,
    sm_captain_bayt: 22,
    sm_giant_sword_hall: 18,
    sm_outlander_lodging: 11,
    sm_cliff_cot: 8,
    sm_herder_house: 8,
    sm_cadet_cell: 8,
    sm_giant_cadet_cell: 8
  };

  /* Frontage-courts pools for each district/ward kind */
  var POOLS = {
    rim:     [['sm_sword_villa', 4], ['sm_captain_bayt', 3], ['sm_giant_sword_hall', 3], ['sm_courtyard_house', 2]],
    qasaba:  [['sm_shop_house', 5], ['sm_terrace_house', 3], ['sm_hearth_house', 2], ['sm_courtyard_house', 1]],
    hearth:  [['sm_hearth_house', 4], ['sm_terrace_house', 4], ['sm_courtyard_house', 3], ['sm_shop_house', 2]],
    outer:   [['sm_hearth_house', 3], ['sm_cliff_cot', 3], ['sm_herder_house', 2], ['sm_terrace_house', 2], ['sm_cadet_cell', 1]],
    customs: [['sm_outlander_lodging', 6], ['sm_shop_house', 2]],
    forges:  [['sm_terrace_house', 4], ['sm_cliff_cot', 3], ['sm_cadet_cell', 2], ['sm_giant_cadet_cell', 1]],
    gisr:    [['sm_hearth_house', 3], ['sm_terrace_house', 3], ['sm_cliff_cot', 3], ['sm_herder_house', 2], ['sm_shop_house', 2]],
    citadel: [['sm_cadet_cell', 4], ['sm_giant_cadet_cell', 3], ['sm_sword_villa', 2], ['sm_giant_sword_hall', 1]],
    qubab:   [['sm_courtyard_house', 3], ['sm_sword_villa', 2], ['sm_cadet_cell', 2], ['sm_giant_cadet_cell', 1]]
  };

  var SMALL = {
    rim:     [['sm_sword_villa', 2], ['sm_courtyard_house', 2]],
    qasaba:  [['sm_shop_house', 3], ['sm_terrace_house', 2]],
    hearth:  [['sm_terrace_house', 3], ['sm_hearth_house', 3], ['sm_cliff_cot', 2]],
    outer:   [['sm_cliff_cot', 3], ['sm_cadet_cell', 2], ['sm_terrace_house', 2]],
    customs: [['sm_outlander_lodging', 4], ['sm_shop_house', 1]],
    forges:  [['sm_cliff_cot', 3], ['sm_cadet_cell', 2], ['sm_terrace_house', 2]],
    gisr:    [['sm_cliff_cot', 3], ['sm_herder_house', 2], ['sm_terrace_house', 2]],
    citadel: [['sm_cadet_cell', 3], ['sm_giant_cadet_cell', 2]],
    qubab:   [['sm_cadet_cell', 2], ['sm_courtyard_house', 2]]
  };

  var GAPS = {
    rim: [4, 8],
    qasaba: [1.8, 3.8],
    hearth: [2.2, 4.6],
    outer: [3.0, 6.0],
    customs: [2.5, 5.0],
    forges: [2.5, 5.0],
    gisr: [3.0, 6.0],
    citadel: [3.0, 5.5],
    qubab: [4.0, 7.5]
  };

  function makeTune(half, maxSlope, maxDrop) {
    return {
      cell: 2.5,
      rasterHalf: half,
      maxSlope: maxSlope == null ? 0.34 : maxSlope,
      exact: true,
      width: { avenue: 13, main: 9, side: 6, alley: 3.5, highway: 10, lane: 5 },
      lot: { side: 1.2, setback: 1.4, rear: 2.4, inset: 0.8, step: 2.8 },
      classes: {
        rich: [['sm_sword_villa', 0], ['sm_captain_bayt', 0]],
        middle: [['sm_hearth_house', 0], ['sm_terrace_house', 0]],
        poor: [['sm_cliff_cot', 0], ['sm_cadet_cell', 0]]
      },
      fallback: { rich: 'middle', middle: 'poor', poor: null },
      civic: [],
      civicSpacing: 90,
      voidMax: 42,
      voidIters: 0,
      voidBatch: 0,
      sideSpacing: 46,
      sideMax: 200,
      alleyFrac: 0.24,
      blindMax: 85,
      interiorDepth: 9,
      interiorRounds: 0,
      avenueSnap: 50,
      ringGap: 7,
      verge: 6,
      wall: {},
      plazaArt: {},
      mapHalf: half,
      stance: 'high',
      stanceOpt: { maxDrop: maxDrop == null ? 11 : maxDrop }
    };
  }

  function makeLevel(origin) {
    return {
      o: origin,
      h: function (x, z) { return amaroH(x + origin[0], z + origin[1]); },
      P: function (x, z) { return [x - origin[0], z - origin[1]]; }
    };
  }

  /* Stamp river channels and mill-leat as GREEN/OUT on a KCITY raster so no house or lane enters water */
  function stampRiversClear(R, L, OCC, allowBridgeX) {
    for (var ri = 0; ri < AM.RIVERS.length; ri++) {
      var rv = AM.RIVERS[ri];
      var pts = rv.pts;
      for (var i = 1; i < pts.length; i++) {
        var a = L.P(pts[i - 1][0], pts[i - 1][1]);
        var b = L.P(pts[i][0], pts[i][1]);
        var band = Math.max(pts[i - 1][3], pts[i][3]) + (rv.leat ? 4.5 : 8.5);
        R.eachNearSeg(a, b, band, function (k) {
          if (allowBridgeX != null) {
            var cx = (k % R.n - R.n * 0.5 + 0.5) * R.cell + L.o[0];
            if (Math.abs(cx - allowBridgeX) < 12) return;
          }
          R.occ[k] = OCC.GREEN;
        });
      }
    }
  }

  /* Stamp Darb al-Kir switchback & Sullam al-Gedu compound stair corridors as GREEN so no house touches their carriageways */
  function stampRampCorridors(R, L, OCC) {
    var i, a, b;
    for (i = 1; i < AM.SWITCHBACK.length; i++) {
      a = L.P(AM.SWITCHBACK[i - 1][0], AM.SWITCHBACK[i - 1][1]);
      b = L.P(AM.SWITCHBACK[i][0], AM.SWITCHBACK[i][1]);
      R.eachNearSeg(a, b, 9.0, function (k) {
        if (R.occ[k] !== OCC.HARD) R.occ[k] = OCC.GREEN;
      });
    }
    for (i = 1; i < AM.COMPOUND_STAIR.length; i++) {
      a = L.P(AM.COMPOUND_STAIR[i - 1][0], AM.COMPOUND_STAIR[i - 1][1]);
      b = L.P(AM.COMPOUND_STAIR[i][0], AM.COMPOUND_STAIR[i][1]);
      R.eachNearSeg(a, b, 7.0, function (k) {
        if (R.occ[k] !== OCC.HARD) R.occ[k] = OCC.GREEN;
      });
    }
  }

  function getCityLib() {
    if (KCITY.lib) return KCITY.lib;
    KCITY.lib = {
      SL: SL,
      plan: function () { return PLAN; },
      KSPACE: KSPACE,
      Raster: Raster,
      OCC: OCC,
      obb: obb,
      obbCorners: obbCorners
    };
    return KCITY.lib;
  }

  /* Stamp explicit host/civic/defence/works buildings onto the bound KCITY instance with exact OBB collision safety */
  function stampHosts(C, L, list) {
    var K = getCityLib(), SLx = K.SL, PLAN_ = K.plan(), out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var v = s.v == null ? 0 : s.v;
      var D = amDims(s.key, v);
      if (!D) continue;
      var q = L.P(s.x, s.z);
      var ry = s.ry == null ? 0 : s.ry;
      var u = [Math.cos(ry), -Math.sin(ry)];
      var bo = K.obb(q, u, D.w * 0.5, D.d * 0.5);
      if (!s.force && SLx.clash(bo)) continue;
      var st = KCITY.stance(bo, L.h, { maxDrop: s.maxDrop == null ? 18 : s.maxDrop });
      var y = s.y != null ? s.y : (st ? st.y : L.h(q[0], q[1]));
      var drop = s.y != null ? Math.max(0, y - L.h(q[0], q[1])) : (st ? st.drop : 0);
      var pad = s.pad == null ? 2.2 : s.pad;
      var lot = {
        id: PLAN_.lots.length,
        cls: 'landmark',
        role: s.role || 'civic',
        key: s.key,
        v: v,
        slot: 0,
        wealth: 1,
        x: q[0],
        z: q[1],
        y: y,
        ry: ry,
        w: D.w,
        d: D.d,
        h: D.h,
        lot: bo,
        bo: bo,
        way: -1,
        side: 0,
        s: 0,
        born: 1,
        died: null,
        civic: true,
        hero: !!s.hero,
        skyline: !!s.skyline,
        workId: s.workId || null,
        subward: s.subward || null,
        people: s.people == null ? 0 : s.people,
        why: s.why || s.key,
        drop: drop
      };
      PLAN_.lots.push(lot);
      SLx.hashLot(lot);
      SLx.register(lot);
      SLx.R.stampPoly(K.obbCorners(K.obb(q, u, D.w * 0.5 + pad, D.d * 0.5 + pad)), K.OCC.HARD, lot.id);
      out.push(lot);
    }
    return out;
  }

  function rectPoly(L, x0, z0, x1, z1, inset) {
    var e = inset == null ? 0 : inset;
    return [
      L.P(x0 + e, z0 + e),
      L.P(x1 - e, z0 + e),
      L.P(x1 - e, z1 - e),
      L.P(x0 + e, z1 - e)
    ];
  }

  /* ================================================================= 1. UPPER WALLED CITY (AM_UPPER: ssgsv5zbd2 proper) */
  var L_UPPER = makeLevel([0, 0]);
  var UX = [-466, -315, -165, -24, 24, 170, 305, 414];
  var UZ = [-412, -295, -155, -15, 130, 275, 418];

  function buildUpperHosts() {
    var H = [];
    /* A. Four overhanging cliff-lip belvederes along the sheer northern chasm brink (z = -426) */
    H.push(
      { key: 'sm_rim_pavilion', x: -372, z: -426, ry: Math.PI, hero: true, why: 'West Rim Belvedere overhanging the Citadel fosse & confluence' },
      { key: 'sm_rim_pavilion', x: -182, z: -426, ry: Math.PI, hero: true, why: 'Forge-Chute Rim Pavilion above Sullam al-Gedu' },
      { key: 'sm_rim_pavilion', x:  205, z: -426, ry: Math.PI, hero: true, why: 'Customs Overlook Pavilion watching Babu-Dalab & Babu-Iziz (-38 m below)' },
      { key: 'sm_rim_pavilion', x:  368, z: -426, ry: Math.PI, hero: true, why: 'East Rim Pavilion facing Madinat al-Qubab dome crest' }
    );
    /* B. Gates & Watch-Minarets: Cliff-Ramp North Gate (96, -432), Citadel West Gate (-482, -265), Necropolis East Gate (424, -345), South Plateau Gate (0, 438) */
    H.push(
      { key: 'sm_pishtaq_gate', x:   96, z: -432, ry: Math.PI, hero: true, why: 'Babu al-Samal (North Cliff-Ramp Pishtaq Gate above the -38 m Customs Shelf)' },
      { key: 'sm_payaru_tower', x:  124, z: -430, ry: Math.PI, hero: false, why: 'Babu al-Samal East Watch-Minaret overlooking the Customs Shelf' },
      { key: 'sm_pishtaq_gate', x:    0, z:  438, ry: 0,       hero: true, why: 'Babu al-Qibla (South Plateau Highway Pishtaq Gate)' },
      { key: 'sm_payaru_tower', x:  -28, z:  438, ry: 0,       hero: false, why: 'South Gate Beacon Minaret' },
      { key: 'sm_pishtaq_gate', x: -482, z: -265, ry: -Math.PI * 0.5, hero: false, why: 'Babu al-Qappu (Citadel Causeway Gate)' },
      { key: 'sm_pishtaq_gate', x:  424, z: -345, ry: Math.PI * 0.5,  hero: false, why: 'Babu al-Qubab (East Necropolis Processional Gate)' }
    );
    /* C. Landward South, SE and SW Curtain Wall segments & corner towers (northern lip needs no blind wall over 240 m sheer drop) */
    var sx;
    for (sx = -420; sx <= 380; sx += 52) {
      if (Math.abs(sx) < 38) continue;
      H.push({ key: 'sm_curtain_wall', x: sx, z: 440, ry: 0, pad: 1.2, why: 'South landward battered basalt curtain wall' });
    }
    H.push(
      { key: 'sm_payaru_tower', x: -468, z: 436, ry: -Math.PI * 0.25, why: 'SW Corner Bastion Watch-Minaret' },
      { key: 'sm_payaru_tower', x:  418, z: 436, ry:  Math.PI * 0.25, why: 'SE Corner Bastion Watch-Minaret' }
    );
    for (var sz = -180; sz <= 390; sz += 62) {
      H.push({ key: 'sm_curtain_wall', x: -482, z: sz, ry: -Math.PI * 0.5, pad: 1.2, why: 'West flank basalt curtain wall' });
      if (sz > -280) {
        H.push({ key: 'sm_curtain_wall', x: 426, z: sz, ry: Math.PI * 0.5, pad: 1.2, why: 'East plateau basalt curtain wall' });
      }
    }
    /* D. Lip Meydan (-56..+56, -432..-340) & Crossed Qasaba Spine civic/trade monuments */
    H.push(
      { key: 'sm_cistern_hall',       x:  -46, z: -372, ry: Math.PI * 0.5,  hero: true,  why: 'Vaulted Snowmelt Cistern Hall on the Lip Meydan' },
      { key: 'sm_sabil_shrine',       x:   46, z: -372, ry: -Math.PI * 0.5, hero: true,  why: 'Lip Meydan Sabil-Kuttab Fountain at the head of Sullam al-Gedu' },
      { key: 'sm_captain_bayt',       x: -245, z: -386, ry: Math.PI,        hero: true,  people: 24, why: '1st-Regiment Giant Sword-Captain Bayt on the Canyon Lip' },
      { key: 'sm_sword_villa',        x:  278, z: -386, ry: Math.PI, v: 0,  hero: true,  people: 18, why: 'Cliff-Lip Sword-Officer Villa overlooking the triple confluence' },
      { key: 'sm_giant_sword_hall',   x: -108, z: -386, ry: Math.PI,        hero: true,  people: 20, why: 'Gedu-su Free Giant Sword-Brotherhood Hall on the Rim' },
      { key: 'sm_hearth_house',       x:   68, z: -195, ry: -Math.PI * 0.5, v: 0, hero: true, people: 12, why: 'Qasaba Master-Artisan Hearth House (walk-in sample)' },
      { key: 'sm_bazaar_hall',        x:  -38, z: -225, ry: Math.PI * 0.5,  v: 0, hero: true, why: 'Qasaba North Vaulted Qaysariyya Bazaar Hall' },
      { key: 'sm_bazaar_hall',        x:   38, z: -225, ry: -Math.PI * 0.5, v: 1, hero: false, why: 'Qasaba Cloth & Spice Qaysariyya Arcade' },
      { key: 'sm_bazaar_hall',        x:  -38, z:   55, ry: Math.PI * 0.5,  v: 0, hero: false, why: 'Qasaba Central Hardware & Copperware Bazaar' },
      { key: 'sm_bazaar_hall',        x:   38, z:  195, ry: -Math.PI * 0.5, v: 1, hero: false, why: 'Qasaba South Grain & Provision Market Hall' },
      { key: 'sm_lacquer_inlay_shop', x:   38, z:  -92, ry: -Math.PI * 0.5, hero: true,  workId: 'amaro.inlay', why: 'Damascene Brass, Bronze & Crimson-Lacquer Guild Court (amaro.inlay)' },
      { key: 'sm_lacquer_inlay_shop', x:  -38, z:  -92, ry: Math.PI * 0.5,  hero: false, workId: 'amaro.inlay', why: 'Scabbard-Lacquer & Niello Inlay Workshop' },
      { key: 'sm_blade_smithy',       x:  -96, z:  -48, ry: 0,              hero: false, workId: 'amaro.toolsmiths', why: 'Canyon-Lip Tool & Hardware Guild Smithy (amaro.toolsmiths)' },
      { key: 'sm_blade_smithy',       x: -124, z:  -48, ry: 0,              hero: false, workId: 'amaro.toolsmiths', why: 'Qasaba Edge-Tool & Lock Hearth (amaro.toolsmiths)' },
      { key: 'sm_blade_smithy',       x:  -96, z: -122, ry: Math.PI,        hero: false, workId: 'amaro.armourers', why: 'Upper Armourers Mirror-Plate Finishing Hall (amaro.armourers)' },
      { key: 'sm_weaver_dyer',        x:  112, z:   88, ry: Math.PI,        hero: false, workId: 'amaro.looms', why: 'Regimental Crimson Kilim & Scabbard-Felt Loom Court (amaro.looms)' },
      { key: 'sm_weaver_dyer',        x:  142, z:   88, ry: Math.PI,        hero: false, workId: 'amaro.looms', why: 'Madder-Vat Wool & Felt Weavers Guild (amaro.looms)' },
      { key: 'sm_brewery_teahouse',   x:   38, z:  -42, ry: -Math.PI * 0.5, hero: true,  why: 'Qasaba Crossing Boza Brewhouse & Canyon-Tea Samovar House' },
      { key: 'sm_hammam',             x: -235, z: -215, ry: 0,              hero: true,  why: 'Hammam al-Subaru (Star-Pierced Twin-Dome Bathhouse)' },
      { key: 'sm_hammam',             x:  235, z:   62, ry: Math.PI,        hero: false, why: 'East Hearth-Commons Neighbourhood Hammam' },
      { key: 'sm_cistern_hall',       x:  235, z:  215, ry: 0,              hero: false, why: 'South Ward Vaulted Snowmelt Cistern' },
      { key: 'sm_sabil_shrine',       x: -235, z:   62, ry: 0,              hero: false, why: 'West Ward Corner Sabil Fountain' },
      { key: 'sm_sabil_shrine',       x:   40, z:  340, ry: -Math.PI * 0.5, hero: false, why: 'South Gate Sabil-Kuttab' },
      { key: 'sm_bakery',             x:  -95, z:  195, ry: 0,              hero: false, why: 'Hearth-Ward Flatbread & Millet Oven' },
      { key: 'sm_bakery',             x:  235, z: -105, ry: 0,              hero: false, why: 'East Ward Communal Stone Bakery' },
      { key: 'sm_butcher',            x: -235, z:  205, ry: 0,              hero: false, why: 'Basturma & Highland Mutton Hall' },
      { key: 'sm_butcher',            x:  112, z:  340, ry: Math.PI,        hero: false, why: 'South Market Cold-Stone Butcher' }
    );
    return H;
  }

  function upperSteps(state) {
    var L = L_UPPER, K = function () { return getCityLib(); };
    return [
      {
        name: 'upper ground & lip meydan',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var Z = [[-488, -436], [430, -436], [430, 444], [-488, 444]];
          k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = Z;
          /* Lip Meydan open basalt cliff-overlook square at head of Sullam al-Gedu */
          var meydan = [[-58, -434], [58, -434], [58, -342], [-58, -342]];
          R.stampPoly(meydan, k.OCC.GREEN, -1);
          stampRampCorridors(R, L, k.OCC);
          k.plan().greens.push({ id: 0, kind: 'plaza', poly: meydan, district: 'Meydan al-Haffa (Cliff-Lip Plaza)', born: 2 });
        }
      },
      {
        name: 'upper civic & defence hosts',
        run: function (C) {
          state.civic = stampHosts(C, L, buildUpperHosts());
        }
      },
      {
        name: 'upper qasaba & rim streets',
        run: function () {
          var S = K().SL;
          /* Rim Promenade right along the cliff brink */
          S.addWay('avenue', [[-470, -412], [418, -412]], 3, { tag: 'Tariq al-Haffa (Cliff-Lip Promenade)' });
          /* N-S Grand Qasaba Spine from Lip Meydan to South Plateau Gate */
          S.addWay('avenue', [[0, -342], [0, 434]], 3, { tag: 'Qasaba al-Amaru (Grand Bazaar Spine)' });
          /* North Cliff-Ramp connector to Babu al-Samal (96, -432) */
          S.addWay('avenue', [[96, -432], [96, -295]], 3, { tag: 'Babu al-Samal Approach' });
          /* W-E Citadel-to-Necropolis Ceremonial Way */
          S.addWay('avenue', [[-480, -295], [422, -295]], 3, { tag: 'Tariq al-Subaru (Citadel-to-Qubab Spine)' });
          S.addWay('main', [[-480, -265], [-315, -265]], 3, { tag: 'Citadel Causeway Approach' });
          S.addWay('main', [[305, -345], [422, -345]], 3, { tag: 'Necropolis Gate Approach' });
          for (var zi = 2; zi < UZ.length; zi++) {
            S.addWay(Math.abs(UZ[zi]) < 160 ? 'main' : 'side', [[-468, UZ[zi]], [414, UZ[zi]]], 3, { tag: 'East-West Street z' + UZ[zi] });
          }
          for (var xi = 0; xi < UX.length; xi++) {
            var x = UX[xi];
            if (Math.abs(x) === 24) continue;
            S.addWay(Math.abs(x) < 200 ? 'main' : 'side', [[x, -412], [x, 420]], 3, { tag: 'North-South Street x' + x });
          }
        }
      },
      {
        name: 'upper frontage-courts infill',
        run: function () {
          var blocks = [];
          for (var j = 0; j < UZ.length - 1; j++) {
            for (var i = 0; i < UX.length - 1; i++) {
              var x0 = UX[i], x1 = UX[i + 1], z0 = UZ[j], z1 = UZ[j + 1];
              if (x0 === -24 && x1 === 24) continue; /* Qasaba avenue */
              if (j === 0 && x0 >= -65 && x1 <= 65) continue; /* Lip Meydan */
              var cx = (x0 + x1) * 0.5, cz = (z0 + z1) * 0.5;
              var kind = j === 0 ? 'rim' : (Math.abs(cx) < 150 && Math.abs(cz) < 210 ? 'qasaba' : (Math.hypot(cx, cz) < 380 ? 'hearth' : 'outer'));
              var e = j === 0 ? 5.5 : 4.8;
              blocks.push({
                id: 'up-' + i + '-' + j,
                i: i,
                j: j,
                poly: rectPoly(L, x0, z0, x1, z1, e),
                kind: kind,
                wealth: kind === 'rim' ? 0.92 : (kind === 'qasaba' ? 0.72 : (kind === 'hearth' ? 0.55 : 0.35)),
                lanes: (x1 - x0) > 125 && (z1 - z0) > 120
              });
            }
          }
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 10,
            focus: [0, -360],
            pools: POOLS,
            small: SMALL,
            gaps: GAPS,
            garden: { rim: 0.22, qasaba: 0.06, hearth: 0.12, outer: 0.18 },
            infill: { step: 9.5, yard: 0.28, reach: 26 }
          });
        }
      }
    ];
  }

  /* ================================================================= 2. QAPPU AL-SUBARU CITADEL (amaro.citadel, 1,100 people) */
  var L_CITADEL = makeLevel([-695, -265]);

  function buildCitadelHosts() {
    var H = [];
    /* Dry-fosse causeway bridge + twin gatehouse + perimeter towers & walls */
    H.push(
      { key: 'sm_gorge_bridge_tower', x: -528, z: -265, ry: 0, hero: true, force: true, y: 249.2, why: 'Dry-Fosse Pointed-Arch Causeway & Guard Tower' },
      { key: 'sm_pishtaq_gate',       x: -566, z: -265, ry: Math.PI * 0.5, hero: true, why: 'Babu al-Diwan (Giant Pishtaq Citadel Gate)' },
      { key: 'sm_payaru_tower',       x: -566, z: -305, ry: Math.PI * 0.5, why: 'Citadel Fosse North Watch-Tower' },
      { key: 'sm_payaru_tower',       x: -566, z: -225, ry: Math.PI * 0.5, why: 'Citadel Fosse South Watch-Tower' },
      { key: 'sm_curtain_wall',       x: -566, z: -350, ry: Math.PI * 0.5, pad: 1.0, why: 'Citadel East Fosse Rampart' },
      { key: 'sm_curtain_wall',       x: -566, z: -180, ry: Math.PI * 0.5, pad: 1.0, why: 'Citadel SE Fosse Rampart' },
      { key: 'sm_curtain_wall',       x: -618, z: -102, ry: 0, pad: 1.0, why: 'Citadel South Gorge-Brink Rampart' },
      { key: 'sm_curtain_wall',       x: -685, z: -102, ry: 0, pad: 1.0, why: 'Citadel SW Gorge-Brink Rampart' }
    );
    /* High Prow (+262.7 m overhanging 265 m three-sided confluence cliff): Diwan, Chancery, Keep & Signal Beacon */
    H.push(
      { key: 'sm_diwan_hall',     x: -754, z: -315, ry: Math.PI * 0.5, hero: true, people: 32, why: 'Grand Diwan of the Six Regimental Captains on the High Prow' },
      { key: 'sm_kattu_chancery', x: -712, z: -378, ry: 0,             hero: true, people: 24, why: 'Chancery of the Sumaru-kattu Oath-Rolls' },
      { key: 'sm_citadel_keep',   x: -714, z: -246, ry: Math.PI,       hero: true, people: 85, why: 'Qappu al-Subaru Dark-Basalt Citadel Keep' },
      { key: 'sm_payaru_tower',   x: -810, z: -320, ry: -Math.PI * 0.5,hero: true, people: 12, why: 'Supreme Prow Beacon Minaret (+263 m above Qappu-Betun confluence)' }
    );
    /* Outer Bailey (+257.5 m): Ordeal Yard, 3 Regiment Barracks, 4 State Granaries, Armoury + Citadel Powder Mill (citadel.powder) */
    H.push(
      { key: 'sm_ordeal_yard',       x: -632, z: -265, ry: Math.PI * 0.5, hero: true,  people: 42,  why: '1st-Regiment Initiation & Sword-Drill Ordeal Yard' },
      { key: 'sm_regiment_barracks', x: -628, z: -348, ry: 0,             hero: false, people: 165, why: '1st-Regiment North Giant & Human Vaulted Barracks' },
      { key: 'sm_regiment_barracks', x: -628, z: -182, ry: Math.PI,       hero: false, people: 165, why: '1st-Regiment South Garrison Barracks' },
      { key: 'sm_regiment_barracks', x: -676, z: -162, ry: Math.PI,       hero: false, people: 160, why: 'Gedu-su Free Giant Wing Barracks' },
      { key: 'sm_state_granary',     x: -600, z: -404, ry: 0,             hero: false, why: 'Diwan Iqta State Granary I (S1-S2 tribute)' },
      { key: 'sm_state_granary',     x: -626, z: -404, ry: 0,             hero: false, why: 'Diwan Iqta State Granary II (S3-S4 tribute)' },
      { key: 'sm_state_granary',     x: -652, z: -404, ry: 0,             hero: false, why: 'Diwan Iqta State Granary III (S5-S6 tribute)' },
      { key: 'sm_state_granary',     x: -678, z: -404, ry: 0,             hero: false, why: 'Diwan Siege Reserve Granary IV' },
      { key: 'sm_armoury',           x: -600, z: -132, ry: Math.PI,       hero: true,  people: 18,  why: 'Royal Blade & Mirror-Plate Arsenal' },
      { key: 'sm_saltpeter_works',   x: -632, z: -132, ry: Math.PI,       hero: true,  workId: 'citadel.powder', people: 24, why: 'Citadel Saltpeter & Sulfur Ordnance Powder Mill (citadel.powder)' },
      { key: 'sm_cistern_hall',      x: -676, z: -322, ry: Math.PI * 0.5, hero: false, why: 'Citadel Rock-Cut Siege Cistern' },
      { key: 'sm_hammam',            x: -676, z: -206, ry: Math.PI * 0.5, hero: false, why: 'Garrison Vaulted Bathhouse' },
      { key: 'sm_captain_bayt',      x: -758, z: -242, ry: 0,             hero: false, people: 26,  why: 'First Captain Residence on the Prow' },
      { key: 'sm_giant_sword_hall',  x: -758, z: -384, ry: 0,             hero: false, people: 24,  why: 'Giant Guard-of-the-Oath Hall' }
    );
    return H;
  }

  function citadelSteps(state) {
    var L = L_CITADEL, K = function () { return getCityLib(); };
    return [
      {
        name: 'citadel ground',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var Z = [L.P(-828, -434), L.P(-558, -434), L.P(-558, -94), L.P(-828, -94)];
          k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = Z;
        }
      },
      {
        name: 'citadel monuments & ordnance',
        run: function (C) {
          state.civic = stampHosts(C, L, buildCitadelHosts());
        }
      },
      {
        name: 'citadel courts & streets',
        run: function () {
          var S = K().SL;
          S.addWay('avenue', [L.P(-528, -265), L.P(-735, -265)], 3, { tag: 'Citadel Causeway & Diwan Axis' });
          S.addWay('main', [L.P(-655, -418), L.P(-655, -115)], 3, { tag: 'Outer Bailey Parade' });
          S.addWay('side', [L.P(-735, -395), L.P(-735, -225)], 3, { tag: 'High Prow Terrace Walk' });
        }
      },
      {
        name: 'citadel cadet & officer quarters',
        run: function () {
          var blocks = [
            { id: 'cit-nw', i: 0, j: 0, poly: rectPoly(L, -818, -424, -738, -342, 3.5), kind: 'citadel', wealth: 0.8, lanes: false },
            { id: 'cit-sw', i: 0, j: 1, poly: rectPoly(L, -812, -222, -700, -120, 3.5), kind: 'citadel', wealth: 0.7, lanes: false },
            { id: 'cit-se', i: 1, j: 1, poly: rectPoly(L, -650, -238, -578, -155, 3.5), kind: 'citadel', wealth: 0.6, lanes: false }
          ];
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 20,
            focus: L.P(-695, -265),
            pools: POOLS,
            small: SMALL,
            gaps: GAPS,
            garden: { citadel: 0.08 },
            infill: { step: 8.5, yard: 0.22, reach: 28 }
          });
        }
      }
    ];
  }

  /* ================================================================= 3. MADINAT AL-QUBAB (amaro.necropolis, 300 people — SKYLINE SILHOUETTE) */
  var L_QUBAB = makeLevel([800, -330]);

  function buildQubabHosts() {
    var H = [];
    /* OWNER CALL #4: Skyline silhouette! String 15 sm_regiment_qubba (alternating v=0 +1 spiral gadroons & v=1 carved star-interlace)
       + sm_doriyan_stele (-1 mirror-spiral at NW promontory) + sm_hall_of_blades (at +252.8 m crest peak) directly along the
       northern canyon brink (z = -424..-418), with ZERO buildings north of them (z < -418)! */
    H.push({
      key: 'sm_doriyan_stele', x: 492, z: -424, ry: 0, hero: true, people: 4,
      skyline: true, why: 'Mirror-Spiral Dome Stele of Lost Doriyan (sole -1 left-handed dome on the NW cliff point)'
    });
    var qx = [530, 568, 606, 644, 682, 720, 758, 790, 854, 892, 930, 968, 1006, 1044, 1082, 1114];
    for (var i = 0; i < 15; i++) {
      var x = qx[i];
      var v = i % 2;
      var regNum = (i % 6) + 1;
      H.push({
        key: 'sm_regiment_qubba', x: x, z: -421 - (i % 2) * 2.5, ry: 0, v: v, hero: true, people: 4,
        skyline: true,
        why: 'Regiment ' + regNum + ' Waqf Qubba Mausoleum #' + (i + 1) + (v === 0 ? ' (+1 spiral gadroon dome)' : ' (carved star-interlace dome)')
      });
    }
    H.push({
      key: 'sm_hall_of_blades', x: 822, z: -420, ry: 0, hero: true, people: 20,
      skyline: true, why: 'Qubbat al-Suyuf (Twin-Domed Hall of Blades crowning the +252.8 m Skyline Crest)'
    });
    /* Ceremonial Gate, Bimaristan Trauma Hospice, Sabils & Waqf Sword-Warden Courts (all south of z = -388) */
    H.push(
      { key: 'sm_ordeal_gate',    x:  476, z: -388, ry: -Math.PI * 0.5, hero: true,  people: 8,  why: 'Babu al-Imtihan (Ceremonial Necropolis & Ordeal Departure Arch)' },
      { key: 'sm_bimaristan',     x:  648, z: -344, ry: Math.PI,        hero: true,  people: 48, why: 'Waqf Bimaristan (Veteran Sword Trauma Surgery & Hospice)' },
      { key: 'sm_sabil_shrine',   x:  552, z: -368, ry: Math.PI,        hero: false, people: 4,  why: 'West Avenue of Domes Pilgrim Sabil' },
      { key: 'sm_sabil_shrine',   x:  948, z: -368, ry: Math.PI,        hero: false, people: 4,  why: 'East Avenue of Domes Pilgrim Sabil' },
      { key: 'sm_wayside_cairn',  x: 1118, z: -388, ry: -Math.PI * 0.5, hero: false, why: 'Way-of-Blades Departure Blade-Pillar Cairn' },
      { key: 'sm_giant_sword_hall', x: 822, z: -344, ry: Math.PI,       hero: false, people: 22, why: 'Hall of the Forty Waqf Wardens (Gedu-su & -su Keepers)' }
    );
    return H;
  }

  function qubabSteps(state) {
    var L = L_QUBAB, K = function () { return getCityLib(); };
    return [
      {
        name: 'qubab skyline crest ground',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var Z = [L.P(468, -442), L.P(1132, -442), L.P(1132, -214), L.P(468, -214)];
          k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = Z;
          /* Reserve the entire cliff-edge skyline strip z = -444..-402 against residential infill so ZERO houses block the domes! */
          R.stampPoly([L.P(468, -444), L.P(1132, -444), L.P(1132, -402), L.P(468, -402)], k.OCC.GREEN, -1);
        }
      },
      {
        name: 'qubab skyline domes & bimaristan',
        run: function (C) {
          state.civic = stampHosts(C, L, buildQubabHosts());
        }
      },
      {
        name: 'avenue of domes ceremonial way',
        run: function () {
          var S = K().SL;
          S.addWay('avenue', [L.P(468, -388), L.P(1126, -388)], 3, { tag: 'Shari al-Qubab (Ceremonial Avenue of Domes)' });
          S.addWay('side', [L.P(540, -310), L.P(980, -310)], 3, { tag: 'Waqf Custodians Lane' });
          S.addWay('side', [L.P(740, -388), L.P(740, -230)], 3, { tag: 'Bimaristan & Waqf Cross-Walk' });
        }
      },
      {
        name: 'qubab waqf custodian courts',
        run: function () {
          /* Sized specifically for ~130 custodian residents (+ ~170 monument wardens/bimaristan = ~300 total for amaro.necropolis) */
          var blocks = [
            { id: 'qub-w', i: 0, j: 0, poly: rectPoly(L, 565, -302, 728, -242, 4.0), kind: 'qubab', wealth: 0.72, lanes: false },
            { id: 'qub-e', i: 1, j: 0, poly: rectPoly(L, 752, -302, 905, -248, 4.0), kind: 'qubab', wealth: 0.68, lanes: false }
          ];
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 30,
            focus: L.P(822, -388),
            pools: POOLS,
            small: SMALL,
            gaps: { qubab: [8.0, 14.0] },
            garden: { qubab: 0.35 },
            infill: { step: 14.0, yard: 0.55, reach: 20 }
          });
        }
      }
    ];
  }

  /* ================================================================= 4. TERRACED OUTLANDER CUSTOMS SHELF (AM_CUSTOMS, -38 m at y = +202 m) */
  var L_CUSTOMS = makeLevel([288, -568]);

  function buildCustomsHosts() {
    /* OWNER CALL #3: Terrace Babu-Dalab (west half) & Babu-Iziz (east half) onto a stepped mid-cliff shelf -38 m below North Gate! */
    return [
      { key: 'sm_wikala_caravanserai', x: 182, z: -598, ry: 0,       hero: true,  subward: 'Babu-Dalab', people: 48, why: 'Wikala Babu-Dalab (Coal, Halite & Scrap Caravan Court, -38 m Customs Shelf)' },
      { key: 'sm_envoy_house',         x: 146, z: -542, ry: Math.PI, hero: false, subward: 'Babu-Dalab', people: 14, why: 'Dalabi & Fulcrum Factor Envoy House' },
      { key: 'sm_stock_fold',          x: 144, z: -618, ry: 0,       hero: false, subward: 'Babu-Dalab', why: 'Babu-Dalab Heavy Mule & Ox Pack-Corral' },
      { key: 'sm_stock_fold',          x: 224, z: -620, ry: 0,       hero: false, subward: 'Babu-Dalab', why: 'Vrivolci Giant Timber-Drover Corral' },
      { key: 'sm_bazaar_hall',         x: 282, z: -598, ry: 0, v: 0, hero: false, subward: 'Customs',    why: 'Diwan 4% Customs Weigh-House & Bonded Scale Hall' },
      { key: 'sm_payaru_tower',        x: 282, z: -628, ry: Math.PI, hero: false, subward: 'Customs',    why: 'Customs Shelf Cliff-Brink Watch-Tower' },
      { key: 'sm_wikala_caravanserai', x: 368, z: -598, ry: 0,       hero: false, subward: 'Babu-Iziz',  people: 48, why: 'Wikala Babu-Iziz (Izani Glass, Sugar & Longsong Books Court, -38 m Shelf)' },
      { key: 'sm_envoy_house',         x: 418, z: -598, ry: -Math.PI * 0.5, hero: true, subward: 'Babu-Iziz', people: 14, why: 'Izani & Longsong Historian Envoy Residence' },
      { key: 'sm_envoy_house',         x: 422, z: -542, ry: Math.PI, hero: false, subward: 'Babu-Iziz',  people: 14, why: 'Eastern Caravan Factor House' },
      { key: 'sm_stock_fold',          x: 426, z: -624, ry: 0,       hero: false, subward: 'Babu-Iziz',  why: 'Babu-Iziz Camel & Steppe-Mule Pen' },
      { key: 'sm_brewery_teahouse',    x: 318, z: -542, ry: Math.PI, hero: false, subward: 'Babu-Iziz',  people: 6,  why: 'Outlander Caravan Samovar & Boza Inn' }
    ];
  }

  function customsSteps(state) {
    var L = L_CUSTOMS, K = function () { return getCityLib(); };
    return [
      {
        name: 'customs shelf ground (-38 m)',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var Z = [L.P(124, -638), L.P(452, -638), L.P(452, -502), L.P(124, -502)];
          k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = Z;
          stampRampCorridors(R, L, k.OCC);
        }
      },
      {
        name: 'customs wikalas & weigh-house',
        run: function (C) {
          state.civic = stampHosts(C, L, buildCustomsHosts());
        }
      },
      {
        name: 'customs terrace street',
        run: function () {
          var S = K().SL;
          S.addWay('avenue', [L.P(126, -566), L.P(446, -566)], 3, { tag: 'Tariq al-Ghuraba (Customs Shelf Avenue, y=+202 m)' });
          S.addWay('side', [L.P(282, -632), L.P(282, -508)], 3, { tag: 'Weigh-House Divide between Babu-Dalab & Babu-Iziz' });
        }
      },
      {
        name: 'outlander lodgings infill',
        run: function () {
          var blocks = [
            { id: 'cust-dalab', i: 0, j: 0, poly: rectPoly(L, 168, -558, 274, -508, 3.0), kind: 'customs', wealth: 0.45, lanes: false, subward: 'Babu-Dalab' },
            { id: 'cust-iziz',  i: 1, j: 0, poly: rectPoly(L, 336, -558, 412, -508, 3.0), kind: 'customs', wealth: 0.48, lanes: false, subward: 'Babu-Iziz' },
            { id: 'cust-north', i: 1, j: 1, poly: rectPoly(L, 244, -634, 344, -608, 2.5), kind: 'customs', wealth: 0.42, lanes: false, subward: 'Babu-Dalab' }
          ];
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 40,
            focus: L.P(282, -566),
            pools: POOLS,
            small: SMALL,
            gaps: { customs: [3.2, 6.2] },
            garden: { customs: 0.08 },
            infill: { step: 9.0, yard: 0.25, reach: 24 }
          });
        }
      }
    ];
  }

  /* ================================================================= 5. DARB AL-KIR FORGE & CRUCIBLE LEDGES (AM_FORGES: +68 m & +138 m) */
  var L_FORGES = makeLevel([-120, -618]);

  function buildForgeHosts() {
    var H = [];
    /* Tier 1 Lower Forge Shelf (y = +68.0 m, z in -692..-634): Coal-refining hearths (amaro.coal-hearth) & heavy armourers (amaro.armourers) */
    var l1x = [-296, -252, -208, -164, -120, -76, 52];
    for (var i = 0; i < l1x.length; i++) {
      var wid1 = i < 3 ? 'amaro.coal-hearth' : 'amaro.armourers';
      H.push({
        key: 'sm_blade_smithy', x: l1x[i], z: -678, ry: 0, hero: false, workId: wid1,
        why: (wid1 === 'amaro.coal-hearth' ? 'Tier 1 Blast & Scrap Refining Hearth (' : 'Tier 1 Heavy Plate & Lamellar Forge (') + wid1 + ')'
      });
    }
    H.push(
      { key: 'sm_charcoal_kiln',     x: -292, z: -646, ry: Math.PI, hero: false, why: 'Tier 1 Rope-Pine Beehive Charcoal Clamp Yard' },
      { key: 'sm_stonecutters_yard', x:  -32, z: -678, ry: 0,       hero: false, why: 'Tier 1 Basalt & Travertine Ablaq Dressing Yard' },
      { key: 'sm_sabil_shrine',      x:   34, z: -676, ry: 0,       hero: true,  why: 'Sullam al-Gedu Lower Ledge Landing Sabil (+68 m)' }
    );
    /* Tier 2 Upper Crucible & Blade-Smithy Ledge (y = +138.0 m, z in -604..-544): Watered-steel crucibles (amaro.crucible) & Master Bladesmiths (amaro.bladesmiths) */
    var l2x = [-332, -288, -244, -200, -156, -112, 48];
    for (var j = 0; j < l2x.length; j++) {
      var wid2 = j < 3 ? 'amaro.crucible' : 'amaro.bladesmiths';
      H.push({
        key: 'sm_blade_smithy', x: l2x[j], z: -589, ry: 0, hero: j === 0, workId: wid2,
        why: (wid2 === 'amaro.crucible' ? 'Tier 2 Watered-Steel Crucible Furnace (' : 'Tier 2 Master Bladesmiths Hearth (') + wid2 + ')'
      });
    }
    H.push(
      { key: 'sm_charcoal_kiln',     x: -328, z: -556, ry: Math.PI, hero: false, why: 'Tier 2 Crucible Fuel Charcoal Yard' },
      { key: 'sm_stonecutters_yard', x:  -62, z: -589, ry: 0,       hero: false, why: 'Tier 2 Dome-Rib & Grindstone Yard' },
      { key: 'sm_wayside_cairn',     x:   26, z: -584, ry: 0,       hero: false, why: 'Sullam al-Gedu Upper Ledge Blade-Cairn (+138 m)' }
    );
    return H;
  }

  function forgeSteps(state) {
    var L = L_FORGES, K = function () { return getCityLib(); };
    return [
      {
        name: 'forge ledges ground (+68 m & +138 m)',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var Z1 = [L.P(-316, -690), L.P(108, -690), L.P(108, -636), L.P(-316, -636)];
          var Z2 = [L.P(-350, -602), L.P(92, -602), L.P(92, -546), L.P(-350, -546)];
          KCITY.site.zoneRaster(R, Z1, { dry: 1, h: L.h });
          k.SL.R.land = KCITY.site.zoneRaster(R, Z2, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = Z1;
          /* Keep Sullam al-Gedu compound stair corridor x in [-6, 22] clear */
          R.stampPoly([L.P(-8, -700), L.P(22, -700), L.P(22, -540), L.P(-8, -540)], k.OCC.GREEN, -1);
          stampRampCorridors(R, L, k.OCC);
        }
      },
      {
        name: 'crucible & bladesmith hosts',
        run: function (C) {
          state.civic = stampHosts(C, L, buildForgeHosts());
        }
      },
      {
        name: 'forge ledge streets',
        run: function () {
          var S = K().SL;
          S.addWay('main', [L.P(-312, -663), L.P(104, -663)], 3, { tag: 'Tier 1 Lower Forge Ledge Street (+68 m)' });
          S.addWay('main', [L.P(-346, -574), L.P(88, -574)], 3, { tag: 'Tier 2 Upper Crucible Ledge Street (+138 m)' });
        }
      },
      {
        name: 'smith & probationer terrace houses',
        run: function () {
          var blocks = [
            { id: 'fg-1w', i: 0, j: 0, poly: rectPoly(L, -270, -658, -14, -638, 2.0), kind: 'forges', wealth: 0.45, lanes: false },
            { id: 'fg-1e', i: 1, j: 0, poly: rectPoly(L,   26, -658, 102, -638, 2.0), kind: 'forges', wealth: 0.45, lanes: false },
            { id: 'fg-2w', i: 0, j: 1, poly: rectPoly(L, -305, -569, -14, -548, 2.0), kind: 'forges', wealth: 0.50, lanes: false },
            { id: 'fg-2e', i: 1, j: 1, poly: rectPoly(L,   24, -569,  88, -548, 2.0), kind: 'forges', wealth: 0.50, lanes: false }
          ];
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 50,
            focus: L.P(8, -618),
            pools: POOLS,
            small: SMALL,
            gaps: { forges: [2.4, 4.8] },
            garden: { forges: 0.05 },
            infill: { step: 8.5, yard: 0.18, reach: 24 }
          });
        }
      }
    ];
  }

  /* ================================================================= 6. PAYARU-GISR GORGE FOOT (amaro.gisr, 850 people — 3rd Sub-District) */
  var L_GISR = makeLevel([40, -920]);

  function buildGisrHosts() {
    var H = [];
    /* A. Fortified Triple-Confluence Toll Bridge (x = 60, z = -920; ry = PI/2 aligns X-arch deck across Betun-Narun along Z!) */
    H.push(
      { key: 'sm_gorge_bridge_tower', x: 60, z: -885, ry: Math.PI * 0.5, hero: true, force: true, people: 12, why: 'Payaru-Gisr South Fortified Bridgehead & Toll-Arch' },
      { key: 'sm_gorge_bridge_tower', x: 60, z: -955, ry: -Math.PI * 0.5, hero: true, force: true, people: 12, why: 'Payaru-Gisr North Fortified Bridgehead & Cable-Ferry Winch' }
    );
    /* B. Six Overshot Canyon-Chute Watermills along the South Mill-Race Leat (z = -848..-832) */
    var mx = [355, 275, 195, 115, -35, -135];
    for (var i = 0; i < mx.length; i++) {
      H.push({
        key: 'sm_watermill', x: mx[i], z: -846, ry: Math.PI, hero: i === 2, force: true,
        why: 'Payaru-Gisr Overshot Leat Watermill & Trip-Hammer #' + (i + 1)
      });
    }
    /* C. Eight Copper-Dome Sunu-sikaru (`tequila`) Alembic Still-Houses (amaro.stills-glass & amaro.stills-jug) + Sheltered Apricot/Aloe Orchards */
    var sx = [415, 365, 315, 255, 195, 135, -185, -245];
    for (var j = 0; j < sx.length; j++) {
      var wid = j < 5 ? 'amaro.stills-glass' : 'amaro.stills-jug';
      H.push({
        key: 'sm_spirits_still', x: sx[j], z: -764, ry: Math.PI, hero: j === 3, workId: wid,
        why: 'Copper-Dome Sunu-sikaru Alembic Still-House (' + wid + ')'
      });
    }
    var ox = [430, 385, 340, 295, -210, -255, -300, -345];
    for (var k = 0; k < ox.length; k++) {
      var oz = k < 4 ? -798 : -768;
      H.push({
        key: 'sm_apricot_orchard', x: ox[k], z: oz, ry: Math.PI, hero: false,
        why: 'Sheltered Canyon Whorlapricot & Spiralaloe Terrace #' + (k + 1)
      });
    }
    /* D. Fungus Cellars, Downwind Tanneries (west of bridge), Gorge Wikala, Sabils & Granary */
    H.push(
      { key: 'sm_fungus_cellar',      x:  -95, z: -760, ry: Math.PI, hero: false, why: 'Cliff-Foot Vaulted Alecap & Glow-Mushroom Cellar I' },
      { key: 'sm_fungus_cellar',      x: -125, z: -760, ry: Math.PI, hero: false, why: 'Cliff-Foot Vaulted Fungus Cellar II' },
      { key: 'sm_fungus_cellar',      x: -155, z: -760, ry: Math.PI, hero: false, why: 'Cliff-Foot Vaulted Fungus Cellar III' },
      { key: 'sm_tannery',            x: -235, z: -872, ry: 0,       hero: false, why: 'Downstream Riverbank Hide Tannery I' },
      { key: 'sm_tannery',            x: -275, z: -872, ry: 0,       hero: false, why: 'Downstream Riverbank Hide Tannery II' },
      { key: 'sm_tannery',            x: -315, z: -872, ry: 0,       hero: false, why: 'Downstream Riverbank Hide Tannery III' },
      { key: 'sm_wikala_caravanserai',x:   98, z: -802, ry: -Math.PI * 0.5, hero: false, people: 32, why: 'Payaru-Gisr Bridgehead Mule-Train Caravanserai' },
      { key: 'sm_state_granary',      x:   16, z: -802, ry: Math.PI * 0.5,  hero: false, why: 'Payaru-Gisr Waqf Grain & Dried-Apricot Store' },
      { key: 'sm_sabil_shrine',       x:   84, z: -864, ry: Math.PI,        hero: false, why: 'South Bridgehead Sabil Shrine' },
      { key: 'sm_brewery_teahouse',   x:   28, z: -985, ry: 0,              hero: false, people: 8, why: 'North Bank Ferry & Way-of-Blades Teahouse' },
      { key: 'sm_wayside_cairn',      x:   82, z: -978, ry: 0,              hero: false, why: 'North Bank Confluence Blade-Pillar Cairn' }
    );
    return H;
  }

  function gisrSteps(state) {
    var L = L_GISR, K = function () { return getCityLib(); };
    return [
      {
        name: 'payaru-gisr river benches',
        run: function (C) {
          var k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
          R.occ.fill(k.OCC.OUT);
          var ZS = [L.P(-372, -878), L.P(462, -878), L.P(462, -746), L.P(-372, -746)];
          var ZN = [L.P(-332, -1112), L.P(122, -1112), L.P(122, -962), L.P(-332, -962)];
          KCITY.site.zoneRaster(R, ZS, { dry: 1, h: L.h });
          k.SL.R.land = KCITY.site.zoneRaster(R, ZN, { dry: 1, h: L.h });
          k.SL.minSpacing = KCITY.site.minSpacing();
          k.plan().zone = ZS;
          stampRiversClear(R, L, k.OCC, 60);
          stampRampCorridors(R, L, k.OCC);
        }
      },
      {
        name: 'payaru-gisr bridge, mills & copper stills',
        run: function (C) {
          state.civic = stampHosts(C, L, buildGisrHosts());
        }
      },
      {
        name: 'payaru-gisr streets & bridge span',
        run: function () {
          var S = K().SL;
          S.addWay('avenue', [L.P(60, -1108), L.P(60, -748)], 3, { tag: 'Payaru-Gisr Fortified Bridge & Ramp Axis' });
          S.addWay('main', [L.P(-358, -818), L.P(448, -818)], 3, { tag: 'South Gorge Mill & Still Street' });
          S.addWay('main', [L.P(-320, -1012), L.P(116, -1012)], 3, { tag: 'North Gorge Riverbank Street' });
        }
      },
      {
        name: 'payaru-gisr terraced village infill',
        run: function () {
          var blocks = [
            { id: 'gisr-se', i: 0, j: 0, poly: rectPoly(L,  128, -812,  278, -776, 3.0), kind: 'gisr', wealth: 0.48, lanes: false },
            { id: 'gisr-sw', i: 1, j: 0, poly: rectPoly(L, -182, -812,  -12, -776, 3.0), kind: 'gisr', wealth: 0.44, lanes: false },
            { id: 'gisr-nw', i: 0, j: 1, poly: rectPoly(L, -295, -1006,  14, -968, 3.0), kind: 'gisr', wealth: 0.45, lanes: false },
            { id: 'gisr-nn', i: 1, j: 1, poly: rectPoly(L, -275, -1088,  44, -1020, 3.5), kind: 'gisr', wealth: 0.42, lanes: false }
          ];
          state.blocks = blocks;
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6,
            seed: AM.SEED + 60,
            focus: L.P(60, -920),
            pools: POOLS,
            small: SMALL,
            gaps: { gisr: [4.2, 8.2] },
            garden: { gisr: 0.20 },
            infill: { step: 11.5, yard: 0.38, reach: 24 }
          });
        }
      }
    ];
  }

  /* ================================================================= RUN ALL 6 KCITY INSTANCES & ASSEMBLE UNIFIED RECORDS */
  function runAll() {
    if (typeof KTAGS !== 'undefined' && !KTAGS.page) {
      KTAGS.page = KTAGS.create({ build: 'shumar' });
    }

    var S_UP = {}, S_CIT = {}, S_QUB = {}, S_CUS = {}, S_FRG = {}, S_GSR = {};

    var mk = function (name, half, steps, seed, L, maxSl, maxDr) {
      return KCITY.create({
        name: name,
        tune: makeTune(half, maxSl, maxDr),
        seed: seed,
        ground: { h: L.h },
        kit: { dims: amDims },
        rand: 'krand',
        index: { order: 'insertion' },
        steps: steps
      });
    };

    var C_UP  = mk('amaro-upper',   540, upperSteps(S_UP),    AM.SEED + 1, L_UPPER,   0.30, 10);
    var C_CIT = mk('amaro-citadel', 220, citadelSteps(S_CIT), AM.SEED + 2, L_CITADEL, 0.34, 14);
    var C_QUB = mk('amaro-qubab',   380, qubabSteps(S_QUB),   AM.SEED + 3, L_QUBAB,   0.30, 12);
    var C_CUS = mk('amaro-customs', 220, customsSteps(S_CUS), AM.SEED + 4, L_CUSTOMS, 0.30, 11);
    var C_FRG = mk('amaro-forges',  280, forgeSteps(S_FRG),   AM.SEED + 5, L_FORGES,  0.34, 14);
    var C_GSR = mk('amaro-gisr',    480, gisrSteps(S_GSR),    AM.SEED + 6, L_GISR,    0.30, 10);

    S_UP.C  = C_UP;  S_UP.plan  = C_UP.run();
    S_CIT.C = C_CIT; S_CIT.plan = C_CIT.run();
    S_QUB.C = C_QUB; S_QUB.plan = C_QUB.run();
    S_CUS.C = C_CUS; S_CUS.plan = C_CUS.run();
    S_FRG.C = C_FRG; S_FRG.plan = C_FRG.run();
    S_GSR.C = C_GSR; S_GSR.plan = C_GSR.run();

    /* Global KSPACE OBB filter across all 6 adjacent KCITY instances + deterministic variants + 10 vacant construction lots */
    var globalSpace = KSPACE.create({ cell: 32 });
    var allLots = [];
    var ways = [];

    var distSpecs = [
      { code: 'upper',      simId: 'ssgsv5zbd2',       S: S_UP,  L: L_UPPER,   houseScale: 1.0 },
      { code: 'citadel',    simId: 'amaro.citadel',    S: S_CIT, L: L_CITADEL, houseScale: 1.45 },
      { code: 'necropolis', simId: 'amaro.necropolis', S: S_QUB, L: L_QUBAB,   houseScale: 0.72 },
      { code: 'customs',    simId: 'ssgsv5zbd2',       S: S_CUS, L: L_CUSTOMS, houseScale: 1.0 },
      { code: 'forges',     simId: 'ssgsv5zbd2',       S: S_FRG, L: L_FORGES,  houseScale: 1.0 },
      { code: 'gisr',       simId: 'amaro.gisr',       S: S_GSR, L: L_GISR,    houseScale: 0.78 }
    ];

    /* Add switchback & compound-stair ways first */
    ways.push({
      cls: 'highway',
      w: 10.5,
      tag: 'Darb al-Kir (4-Tier Switchback Wagon & Giant Ramp, <=7.5% grade)',
      pts: AM.SWITCHBACK.map(function (p) { return [p[0], p[1]]; })
    });
    ways.push({
      cls: 'alley',
      w: 6.5,
      stair: true,
      tag: 'Sullam al-Gedu (Direct Compound Giant+Human Stair-Chute)',
      pts: AM.COMPOUND_STAIR.map(function (p) { return [p[0], p[1]]; })
    });

    var vacantPicked = 0;
    for (var di = 0; di < distSpecs.length; di++) {
      var ds = distSpecs[di];
      var P = ds.S.plan, L = ds.L;
      for (var wi = 0; wi < P.ways.length; wi++) {
        var w = P.ways[wi];
        ways.push({
          cls: w.cls,
          w: w.w,
          tag: w.tag,
          district: ds.code,
          closed: !!w.closed,
          pts: w.pts.map(function (p) { return [p[0] + L.o[0], p[1] + L.o[1]]; })
        });
      }
      for (var li = 0; li < P.lots.length; li++) {
        var T = P.lots[li];
        if (T.died != null || !T.bo) continue;
        var wx = T.x + L.o[0], wz = T.z + L.o[1];
        var D = amDims(T.key, T.v);
        var nVar = D ? D.variants : 1;
        var v = T.civic ? (T.v == null ? 0 : T.v) : (nVar > 1 ? (KRAND.hash(AM.SEED, di + 1, T.id, 31) % nVar) : 0);
        var wbo = getCityLib().obb([wx, wz], T.bo.u, T.bo.hw, T.bo.hd);
        var rBound = Math.hypot(wbo.hw, wbo.hd) + 0.5;
        /* Cross-instance OBB check via KSPACE */
        var clash = false;
        var hits = globalSpace.query(wx, wz, rBound + 20);
        for (var qk = 0; qk < hits.length; qk++) {
          if (getCityLib().SL.pen(wbo, hits[qk].bo) > 0.05) { clash = true; break; }
        }
        if (clash) continue;

        /* Mark 10 outer/hearth residential lots in Upper City as active construction sites (kits/construction + KCITY.constructMesh) */
        var isVacant = false, progress = 1.0;
        if (!T.civic && ds.code === 'upper' && vacantPicked < 10 && (T.cls === 'outer' || T.cls === 'hearth')) {
          var vh = KRAND.hash(AM.SEED, T.id, 911) % 29;
          if (vh === 0) {
            isVacant = true;
            vacantPicked++;
            progress = 0.18 + ((KRAND.hash(AM.SEED, T.id, 917) % 65) / 100);
          }
        }

        var resPop = 0;
        if (T.civic) {
          resPop = T.people == null ? 0 : T.people;
        } else if (!isVacant) {
          var bp = BASE_PEOPLE[T.key] == null ? 9 : BASE_PEOPLE[T.key];
          resPop = Math.max(2, Math.round(bp * ds.houseScale));
        }

        var rec = {
          id: ds.code + ':' + T.id,
          district: ds.code,
          simId: ds.simId,
          subward: T.subward || (ds.code === 'customs' ? (wx < 288 ? 'Babu-Dalab' : 'Babu-Iziz') : null),
          key: T.key,
          v: v,
          x: wx,
          z: wz,
          y: T.y == null ? amaroH(wx, wz) : T.y,
          ry: T.ry,
          w: T.w,
          d: T.d,
          h: T.h,
          giant: D ? D.giant : false,
          kind: T.civic ? 'civic' : 'house',
          hero: !!T.hero,
          skyline: !!T.skyline,
          vacant: isVacant,
          progress: progress,
          workId: T.workId || null,
          people: resPop,
          drop: T.drop == null ? 0 : T.drop,
          why: T.why || T.role || T.key,
          court: T.court || null,
          bo: wbo
        };
        globalSpace.insert(rec, wx, wz, rBound);
        allLots.push(rec);
      }
    }

    /* Hairpin roadside shrines & cairns on Darb al-Kir switchback turns (clear of all rasters & carriageway) */
    var hairpinStops = [
      { key: 'sm_wayside_cairn', x: -372, z: -724, ry: Math.PI * 0.5, why: 'Hairpin 1 Wayside Blade-Cairn (+38.5 m)' },
      { key: 'sm_wayside_cairn', x: -382, z: -628, ry: Math.PI * 0.5, why: 'Hairpin 2 Wayside Blade-Cairn (+103 m)' },
      { key: 'sm_sabil_shrine',  x: -384, z: -538, ry: Math.PI * 0.5, why: 'Hairpin 3 Mule-Trough Sabil Shrine (+171 m)' }
    ];
    for (var hi = 0; hi < hairpinStops.length; hi++) {
      var hs = hairpinStops[hi];
      var hd = amDims(hs.key, 0);
      var hu = [Math.cos(hs.ry), -Math.sin(hs.ry)];
      var hbo = getCityLib().obb([hs.x, hs.z], hu, hd.w * 0.5, hd.d * 0.5);
      var hy = amaroH(hs.x, hs.z) + 0.15;
      var hrec = {
        id: 'switchback:' + hi,
        district: 'forges',
        simId: 'ssgsv5zbd2',
        subward: null,
        key: hs.key,
        v: 0,
        x: hs.x,
        z: hs.z,
        y: hy,
        ry: hs.ry,
        w: hd.w,
        d: hd.d,
        h: hd.h,
        giant: hd.giant,
        kind: 'civic',
        hero: false,
        skyline: false,
        vacant: false,
        progress: 1.0,
        workId: null,
        people: 0,
        drop: 1.6,
        why: hs.why,
        court: null,
        bo: hbo
      };
      globalSpace.insert(hrec, hs.x, hs.z, Math.hypot(hbo.hw, hbo.hd));
      allLots.push(hrec);
    }

    /* Calibrate residential household occupancy per simId so census matches SHUMAR_TUNE within tight realistic bounds */
    var simTargets = {
      'ssgsv5zbd2': 10600,
      'amaro.citadel': 1100,
      'amaro.necropolis': 300,
      'amaro.gisr': 850
    };
    Object.keys(simTargets).forEach(function (sid) {
      var target = simTargets[sid];
      var fixedPop = 0, housePop = 0, houses = [];
      for (var i = 0; i < allLots.length; i++) {
        var r = allLots[i];
        if (r.simId !== sid) continue;
        if (r.kind === 'civic' || r.vacant) fixedPop += r.people;
        else { housePop += r.people; houses.push(r); }
      }
      if (houses.length > 0 && housePop > 0) {
        var need = Math.max(houses.length * 2, target - fixedPop);
        var ratio = clampRatio(need / housePop, 0.25, 1.85);
        for (var j = 0; j < houses.length; j++) {
          houses[j].people = Math.max(2, Math.round(houses[j].people * ratio));
        }
      }
    });

    /* Summarize census by simId and district */
    var bySim = { 'ssgsv5zbd2': 0, 'amaro.citadel': 0, 'amaro.necropolis': 0, 'amaro.gisr': 0 };
    var byDistrict = { upper: 0, citadel: 0, necropolis: 0, customs: 0, forges: 0, gisr: 0 };
    var heroCount = 0, vacantCount = 0, giantCount = 0;
    var worksPlaced = {};
    for (var k = 0; k < allLots.length; k++) {
      var b = allLots[k];
      bySim[b.simId] = (bySim[b.simId] == null ? 0 : bySim[b.simId]) + b.people;
      byDistrict[b.district] = (byDistrict[b.district] == null ? 0 : byDistrict[b.district]) + b.people;
      if (b.hero) heroCount++;
      if (b.vacant) vacantCount++;
      if (b.giant) giantCount++;
      if (b.workId) worksPlaced[b.workId] = (worksPlaced[b.workId] == null ? 0 : worksPlaced[b.workId]) + 1;
    }

    var totalPeople = bySim['ssgsv5zbd2'] + bySim['amaro.citadel'] + bySim['amaro.necropolis'] + bySim['amaro.gisr'];

    return {
      dims: amDims,
      lots: allLots,
      ways: ways,
      space: globalSpace,
      levels: { upper: S_UP, citadel: S_CIT, qubab: S_QUB, customs: S_CUS, forges: S_FRG, gisr: S_GSR },
      census: {
        total: totalPeople,
        bySim: bySim,
        byDistrict: byDistrict,
        buildings: allLots.length,
        heroCount: heroCount,
        vacantCount: vacantCount,
        giantBuildings: giantCount,
        worksPlaced: worksPlaced
      }
    };
  }

  function clampRatio(v, a, b) { return v < a ? a : v > b ? b : v; }

  var built = null;
  function get() {
    if (!built) built = runAll();
    return built;
  }

  return {
    KIT_BOXES: KIT_BOXES,
    dims: amDims,
    run: runAll,
    get: get
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.AM_CITY = AM_CITY;
}
