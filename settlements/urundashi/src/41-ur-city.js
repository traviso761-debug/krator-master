/* ================================================================= URUNDASHI WALLED STEPPE GARRISON TOWN ON KCITY.GRID
   [G data] Walled Mamluk steppe garrison seat of S4 Sorun-Dubnu (srbp1bvh1r, 3,500 town people; settlements/urundashi/PLAN.md):
     1. UR_QASBA — Bastioned irregular square on KCITY.grid (core/city/37-city-grid.js) encircled by a 13 m wet moat with 4 stone
        gate-bridges, 4 Giant-clearance pishtaq gates, NW 4th-Regiment Keep (Qappu al-Fursan), Crossroads Bazaar & Mother Qubbas,
        SW Metallurgy & Powder Ward (6 of 9 SHUMAR_TUNE works), and NE/SE Hearth-Commons blocks;
     2. UR_EAST  — Rabad al-Sarq (East Gate Outlander Wikala & Order of Historians Caravan Suburb, ~200 -no outlanders);
     3. UR_STUD  — Rabad al-Dubnu (SW Ayn al-Dubnu / Mill-Race Cavalry Remount Stud, Sunu-sikaru Copper Stills & Nitre Vats);
     4. UR_WEST  — Mahallat Amaru (West Gate Royal Highway Suburb & active construction lots).
   Plain records only: no THREE, no DOM. */

var UR_CITY = (function () {
  'use strict';

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

  function urDims(key, v) {
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

  var BASE_PEOPLE = {
    sm_terrace_house: 9,
    sm_hearth_house: 8,
    sm_courtyard_house: 9,
    sm_shop_house: 8,
    sm_sword_villa: 10,
    sm_captain_bayt: 14,
    sm_giant_sword_hall: 12,
    sm_outlander_lodging: 9,
    sm_cliff_cot: 6,
    sm_herder_house: 6,
    sm_cadet_cell: 7,
    sm_giant_cadet_cell: 7
  };

  var POOLS = {
    sword:   [['sm_sword_villa', 4], ['sm_captain_bayt', 2], ['sm_giant_sword_hall', 2], ['sm_courtyard_house', 3]],
    bazaar:  [['sm_shop_house', 5], ['sm_courtyard_house', 3], ['sm_hearth_house', 3]],
    hearth:  [['sm_hearth_house', 5], ['sm_courtyard_house', 4], ['sm_shop_house', 2], ['sm_herder_house', 2]],
    forges:  [['sm_hearth_house', 3], ['sm_cadet_cell', 3], ['sm_giant_cadet_cell', 1], ['sm_cliff_cot', 2]],
    wikala:  [['sm_outlander_lodging', 6], ['sm_shop_house', 2]],
    stud:    [['sm_herder_house', 5], ['sm_hearth_house', 3], ['sm_cadet_cell', 2]],
    highway: [['sm_hearth_house', 4], ['sm_herder_house', 3], ['sm_shop_house', 2], ['sm_cliff_cot', 2]]
  };

  var SMALL = {
    sword:   [['sm_sword_villa', 2], ['sm_courtyard_house', 2]],
    bazaar:  [['sm_shop_house', 3], ['sm_hearth_house', 2]],
    hearth:  [['sm_hearth_house', 3], ['sm_herder_house', 2], ['sm_cadet_cell', 2]],
    forges:  [['sm_cadet_cell', 3], ['sm_cliff_cot', 2]],
    wikala:  [['sm_outlander_lodging', 4], ['sm_shop_house', 1]],
    stud:    [['sm_herder_house', 3], ['sm_cadet_cell', 2]],
    highway: [['sm_herder_house', 3], ['sm_cliff_cot', 2]]
  };

  var GAPS = {
    sword: [3.8, 7.2],
    bazaar: [2.0, 4.0],
    hearth: [2.6, 5.2],
    forges: [2.8, 5.5],
    wikala: [2.8, 5.5],
    stud: [3.6, 7.0],
    highway: [3.2, 6.2]
  };

  /* KCITY.grid irregular Mamluk square spec (oriented ~6.8 deg along the Amaro-Iziz plateau spine) */
  var GRID_SPEC = {
    id: 'ur.grid',
    seed: 77914,
    c: [0, 0],
    u: [0.993, -0.118],
    half: [285, 265],
    cells: [5, 5],
    jitter: 0.13,
    corner: 0.032,
    bow: 0.022,
    drop: 0.20,
    bend: 0.32,
    avenues: { u: 2, v: 2 },
    wallGap: 18,
    out: 64,
    zoneIn: 6,
    moat: { gap: 18, width: 13 }
  };

  var GATE_NAMES = {
    'u-': 'Bābu ʾAmāru (West Highway Gate)',
    'u+': 'Bābu al-Šarq (East Historian & Iziz Gate)',
    'v-': 'Bābu Yāmu (North Silver-Water Gate)',
    'v+': 'Bābu Dubnu (South Stud & Ordeal Gate)'
  };

  function getCityLib() {
    if (KCITY.lib) return KCITY.lib;
    KCITY.lib = {
      SL: SL,
      plan: function () { return PLAN; },
      KSPACE: KSPACE,
      Raster: Raster,
      OCC: OCC,
      obb: obb,
      obbCorners: obbCorners,
      offsetConvex: offsetConvex
    };
    return KCITY.lib;
  }

  function makeTune(half, maxSlope, maxDrop) {
    return {
      cell: 2.5,
      rasterHalf: half,
      maxSlope: maxSlope == null ? 0.30 : maxSlope,
      exact: true,
      width: { avenue: 13, main: 9, side: 6, alley: 3.5, highway: 10, lane: 5 },
      lot: { side: 1.2, setback: 1.5, rear: 2.5, inset: 0.8, step: 2.8 },
      classes: {
        rich: [['sm_sword_villa', 0], ['sm_captain_bayt', 0]],
        middle: [['sm_hearth_house', 0], ['sm_courtyard_house', 0]],
        poor: [['sm_herder_house', 0], ['sm_cadet_cell', 0]]
      },
      fallback: { rich: 'middle', middle: 'poor', poor: null },
      civic: [],
      civicSpacing: 90,
      voidMax: 42,
      voidIters: 0,
      voidBatch: 0,
      sideSpacing: 46,
      sideMax: 200,
      alleyFrac: 0.22,
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
      stanceOpt: { maxDrop: maxDrop == null ? 7 : maxDrop }
    };
  }

  function makeLevel(origin) {
    return {
      o: origin,
      h: function (x, z) { return urundashiH(x + origin[0], z + origin[1]); },
      P: function (x, z) { return [x - origin[0], z - origin[1]]; }
    };
  }

  function stampWaterAndMoatClear(R, L, OCC) {
    for (var ri = 0; ri < UR.RIVERS.length; ri++) {
      var rv = UR.RIVERS[ri];
      var pts = rv.pts;
      for (var i = 1; i < pts.length; i++) {
        var a = L.P(pts[i - 1][0], pts[i - 1][1]);
        var b = L.P(pts[i][0], pts[i][1]);
        var band = Math.max(pts[i - 1][3], pts[i][3]) + 6.5;
        R.eachNearSeg(a, b, band, function (k) { R.occ[k] = OCC.GREEN; });
      }
    }
    var M = UR.moat();
    if (M && M.line) {
      for (var mi = 1; mi < M.line.length; mi++) {
        var ma = L.P(M.line[mi - 1][0], M.line[mi - 1][1]);
        var mb = L.P(M.line[mi][0], M.line[mi][1]);
        R.eachNearSeg(ma, mb, M.width * 0.5 + 6.5, function (k) { R.occ[k] = OCC.GREEN; });
      }
    }
  }

  function stampHosts(C, L, list) {
    var K = getCityLib(), SLx = K.SL, PLAN_ = K.plan(), out = [];
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var v = s.v == null ? 0 : s.v;
      var D = urDims(s.key, v);
      if (!D) continue;
      var q = L.P(s.x, s.z);
      var ry = s.ry == null ? 0 : s.ry;
      var u = [Math.cos(ry), -Math.sin(ry)];
      var bo = K.obb(q, u, D.w * 0.5, D.d * 0.5);
      if (!s.force && SLx.clash(bo)) continue;
      var st = KCITY.stance(bo, L.h, { maxDrop: s.maxDrop == null ? 10 : s.maxDrop });
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

  function shrinkPoly(poly, inset) {
    var cx = 0, cz = 0;
    for (var i = 0; i < poly.length; i++) {
      cx += poly[i][0];
      cz += poly[i][1];
    }
    cx /= poly.length;
    cz /= poly.length;
    var out = [];
    for (var k = 0; k < poly.length; k++) {
      var dx = poly[k][0] - cx, dz = poly[k][1] - cz;
      var d0 = Math.hypot(dx, dz);
      var d = d0 > 1e-9 ? d0 : 1;
      var s = Math.max(0.25, (d - inset) / d);
      out.push([cx + dx * s, cz + dz * s]);
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

  function segD2(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    var t = L2 > 1e-9 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
    return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
  }

  /* ================================================================= 1. WALLED MAMLUK QASBA ON KCITY.GRID */
  function buildQasbaPlan(GR) {
    var L = makeLevel([0, 0]);
    var K = getCityLib;
    var state = { civic: [], wallLots: [], courts: null, grid: GR };

    var cellMap = {};
    for (var ci = 0; ci < GR.cells.length; ci++) {
      var gc = GR.cells[ci];
      cellMap[gc.i + ',' + gc.j] = gc;
    }
    var cellC = function (i, j, ox, oz) {
      var c = cellMap[i + ',' + j];
      var base = c ? c.c : [0, 0];
      return [base[0] + (ox == null ? 0 : ox), base[1] + (oz == null ? 0 : oz)];
    };

    var faceYaw = Math.atan2(GRID_SPEC.u[0], GRID_SPEC.u[1]);
    var crossYaw = faceYaw + Math.PI * 0.5;

    function buildWallHosts(Wr) {
      var W = [];
      /* 4 Corner Mamluk polygonal bastions */
      for (var i = 0; i < GR.corners.length; i++) {
        var cn = GR.corners[i];
        W.push({
          key: 'sm_payaru_tower', x: cn.x, z: cn.z, ry: faceYaw + i * Math.PI * 0.5,
          force: true, hero: true, pad: 1.5, people: 10, why: 'Qaṣba Corner Bastion ' + (i + 1)
        });
      }
      /* 4 Named Giant-clearance pishtaq gates */
      for (var g = 0; g < GR.gates.length; g++) {
        var gt = GR.gates[g];
        var isU = gt.side.charAt(0) === 'u';
        var gyaw = isU ? faceYaw + (gt.side === 'u-' ? -Math.PI * 0.5 : Math.PI * 0.5) : crossYaw + (gt.side === 'v-' ? Math.PI : 0);
        W.push({
          key: 'sm_pishtaq_gate', x: gt.x, z: gt.z, ry: gyaw,
          force: true, hero: true, pad: 2.0, people: 12, why: GATE_NAMES[gt.side] || gt.id
        });
      }
      /* Interval towers & curtain segments from KCITY.grid.wall */
      var nodes = Wr.nodes || [];
      for (var ni = 0; ni < nodes.length; ni++) {
        var nd = nodes[ni];
        if (nd.skip || nd.kind !== 'tower') continue;
        var nearGate = GR.gates.some(function (gt2) { return Math.hypot(gt2.x - nd.x, gt2.z - nd.z) < 26; });
        var nearCorner = GR.corners.some(function (cn2) { return Math.hypot(cn2.x - nd.x, cn2.z - nd.z) < 22; });
        if (nearGate || nearCorner) continue;
        W.push({
          key: 'sm_payaru_tower', x: nd.x, z: nd.z, ry: faceYaw,
          hero: false, pad: 1.2, people: 4, why: 'Steppe Wall Watchtower'
        });
      }
      var segs = Wr.segs || [];
      for (var si = 0; si < segs.length; si++) {
        var sg = segs[si];
        var ax = sg.ax, az = sg.az, bx = sg.bx, bz = sg.bz;
        var len = Math.hypot(bx - ax, bz - az);
        if (len < 16) continue;
        var steps = Math.max(1, Math.floor((len - 10) / 19.5));
        var syaw = Math.atan2(bx - ax, bz - az) + Math.PI * 0.5;
        for (var k = 0; k < steps; k++) {
          var t = (k + 0.5) / steps;
          var wx = ax + (bx - ax) * t, wz = az + (bz - az) * t;
          if (GR.gates.some(function (gt3) { return Math.hypot(gt3.x - wx, gt3.z - wz) < 19; })) continue;
          if (GR.corners.some(function (cn3) { return Math.hypot(cn3.x - wx, cn3.z - wz) < 15; })) continue;
          W.push({
            key: 'sm_curtain_wall', x: wx, z: wz, ry: syaw,
            hero: false, pad: 0.8, people: 0, why: 'Qaṣba Ablaq Curtain Wall'
          });
        }
      }
      return W;
    }

    function buildInteriorHosts() {
      var H = [];
      var addC = function (ci, cj, ox, oz, key, v, ry, hero, people, workId, why) {
        var p = cellC(ci, cj, ox, oz);
        H.push({ key: key, v: v, x: p[0], z: p[1], ry: ry, hero: hero, people: people, workId: workId, why: why, pad: 2.0 });
      };

      /* A. NW 4th-Regiment Keep (Qappu al-Fursan — "Horsemen of the Steppe", cells [0,0], [1,0], [0,1], [1,1]) */
      addC(0, 0, -14, -12, 'sm_citadel_keep',      0, crossYaw, true, 45, null, 'Qappu al-Fursān (4th Regiment Keep)');
      addC(0, 0,  16,  14, 'sm_armoury',           0, crossYaw, true, 16, null, '4th-Regiment Cavalry Arsenal');
      addC(1, 0, -14, -10, 'sm_diwan_hall',        0, crossYaw, true, 24, null, 'Dīwān of Ṣōrun-Dubnu');
      addC(1, 0,  16,  12, 'sm_kattu_chancery',    0, faceYaw,  true, 18, null, 'Šumaru-Kattu Chancery & Longsong Book Archive');
      addC(0, 1, -14, -10, 'sm_regiment_barracks', 0, faceYaw,  true, 55, null, 'Horsemen of the Steppe Barracks W');
      addC(0, 1,  15,  12, 'sm_ordeal_yard',       0, faceYaw,  true, 20, null, '4th-Regiment Cavalry & Cadet Muster Yard');
      addC(1, 1, -14, -10, 'sm_state_granary',     0, crossYaw, true, 10, null, 'Iqtaʿ Wool, Cheese & Grain Tithe Granary');
      addC(1, 1,  15,  12, 'sm_captain_bayt',      0, crossYaw, true, 22, null, 'Bayt of the 4th-Regiment Amir');
      addC(2, 0,   0,  -8, 'sm_giant_sword_hall',  0, crossYaw, true, 22, null, 'Gēdu-šu Free Giant Cavalry Hall');

      /* B. Central Crossroads Bazaar, Mother Qubbas & Doriyan Mirror Memorial (cells [2,2], [2,1], [3,1], [3,2], [2,3]) */
      addC(2, 2, -20, -18, 'sm_sabil_shrine',      0, crossYaw, true,  6, null, 'Sabil al-Rikāb Crossroads Fountain Shrine');
      addC(2, 2,  20, -18, 'sm_bazaar_hall',       0, crossYaw, true,  8, null, 'Sūq al-Rikāb Wool & Kashkaval Hall');
      addC(2, 2,  20,  18, 'sm_bazaar_hall',       1, crossYaw, false, 8, null, 'Sūq al-Rikāb Blades & Harness Arcade');
      addC(2, 1, -15,   8, 'sm_regiment_qubba',    0, crossYaw, true, 10, null, 'Qubbat al-Fursān (+1 Spiral Regiment Shrine)');
      addC(2, 1,  16,   8, 'sm_regiment_qubba',    1, crossYaw, true, 10, null, 'Qubbat al-Dubnu (Star-Carved Waqf Mausoleum)');
      addC(3, 1, -14,  -8, 'sm_doriyan_stele',     0, crossYaw, true,  6, null, 'Eastern Nazāru Mirror-Spiral Stele (-1)');
      addC(3, 1,  15,  12, 'sm_bimaristan',        0, faceYaw,  true, 18, null, 'Steppe Regiment Bimaristan (Iziz Medicine Ward)');
      addC(3, 2, -15, -10, 'sm_hammam',            0, faceYaw,  true, 10, null, 'Ḥammām al-Šarq');
      addC(3, 2,  16,  12, 'sm_cistern_hall',      0, faceYaw,  true,  6, null, 'Vaulted Snowmelt Cistern Hall');
      addC(2, 3, -15,  -8, 'sm_regiment_qubba',    0, crossYaw, true,  8, null, 'South Avenue Spiral Qubba');
      addC(2, 3,  16,  10, 'sm_brewery_teahouse',  0, crossYaw, true, 10, null, 'Caravan Samovar & Boza House');

      /* C. SW Metallurgy, Bladesmith, Armourer & Ordnance Ward (cells [0,3], [1,3], [0,4], [1,4] — 6 SHUMAR_TUNE works!) */
      addC(0, 3, -15, -10, 'sm_blade_smithy',      0, faceYaw,  true, 10, 'urundashi.crucible',    '4th-Regiment Watered-Steel Crucible Hearths');
      addC(0, 3,  15,  12, 'sm_blade_smithy',      0, faceYaw,  false, 8, 'urundashi.coal-hearth', 'Steppe Coal & Scrap Refining Hearths');
      addC(1, 3, -15, -10, 'sm_blade_smithy',      0, crossYaw, true, 12, 'urundashi.bladesmiths', 'Urundashi Master Bladesmiths Guild');
      addC(1, 3,  15,  12, 'sm_lacquer_inlay_shop',0, crossYaw, true,  8, 'urundashi.bladesmiths', 'Crimson Scabbard & Brass Damascene Shop');
      addC(0, 4, -15, -10, 'sm_blade_smithy',      0, faceYaw,  true, 12, 'urundashi.armourers',   'Urundashi Cavalry Mirror-Plate Armourers');
      addC(0, 4,  15,  12, 'sm_armoury',           0, faceYaw,  false,10, 'urundashi.armourers',   'Barded Mount Lamellar & Helm Workshop');
      addC(1, 4, -15, -10, 'sm_blade_smithy',      0, crossYaw, false, 8, 'urundashi.smithy',      'Steppe Stirrup, Bit & Toolsmiths');
      addC(1, 4,  15,  12, 'sm_saltpeter_works',   0, crossYaw, true,  8, 'urundashi.powder',      'Eastern Ordnance & Black-Powder Mill');

      /* D. NE & SE Hearth, Wool-Kilim & Cheese Guild Anchors (cells [3,0], [4,0], [4,2], [3,3], [4,4]) */
      addC(3, 0,   0,   6, 'sm_sword_villa',       0, crossYaw, true, 14, null, 'Silver-Water Gate Muqṭaʿ Villa');
      addC(4, 0,   0,   8, 'sm_regiment_qubba',    1, crossYaw, true,  8, null, 'NE Bastion Star-Carved Qubba');
      addC(4, 2, -12,  -8, 'sm_weaver_dyer',       0, faceYaw,  true, 10, null, 'Ṣōrun-Dubnu Highland Wool & Kilim Looms');
      addC(3, 3,  12,   8, 'sm_bakery',            0, crossYaw, false, 8, null, 'Steppe Emmer & Flatbread Ovens');
      addC(4, 4, -10,  -8, 'sm_butcher',           0, faceYaw,  false, 8, null, 'Aged Sheep-Cheese & Mutton Cellars');

      return H;
    }

    var tune = makeTune(480, 0.30, 6);
    var steps = [
      {
        name: 'walled qasba zone',
        run: function () {
          var S = K().SL, R = S.R = new (K().Raster)(tune.rasterHalf, tune.cell);
          R.occ.fill(K().OCC.OUT);
          var P = K().plan();
          P.site = [{ id: 0, name: 'Urundashi Walled Qasba', role: 'zone', poly: GR.zone }];
          P.zone = GR.zone;
          KCITY.site.zoneRaster(R, GR.zone, { dry: -999, maxSlope: tune.maxSlope, h: L.h });
          stampWaterAndMoatClear(R, L, K().OCC);
          /* Open central sabil meydan at (0,0) */
          var meydan = rectPoly(L, -14, -14, 14, 14, 0);
          R.stampPoly(meydan, K().OCC.HARD, -10);
          S.minSpacing = KCITY.site.minSpacing();
        }
      },
      {
        name: 'grid avenues, ring street & irregular grid streets',
        run: function () {
          var S = K().SL;
          for (var i = 0; i < GR.ways.length; i++) {
            var w = GR.ways[i];
            var tag = w.role === 'avenue' ? (w.line === 'u' ? 'Tariq Amaru-Iziz (Cross-Steppe Spine)' : 'Tariq Yamu-Dubnu (Lake-to-Stud Axis)')
              : (w.role === 'ring' ? 'Darb al-Sur (Inner Wall Ring)' : 'Qasba Grid Street');
            S.addWay(w.kind, w.pts, 3, { tag: tag });
          }
        }
      },
      {
        name: 'bastioned wall, gates & interior monuments',
        run: function (C) {
          var P = K().plan();
          var avWays = P.ways.filter(function (w) { return w.cls === 'avenue'; });
          var named = GR.gates.map(function (g) { return { x: g.x, z: g.z, marker: g.side, name: GATE_NAMES[g.side] }; });
          var Wr = KCITY.grid.wall(GR, avWays, { towerGap: 88, clear: 14, gateFind: 36, named: named, side: 1, health: 2 });
          Wr.nodes.forEach(function (n) {
            n.gx = n.x;
            n.gz = n.z;
            if (n.kind === 'gate' && n.way) n.towerOff = 18;
          });
          Wr.corners = GR.corners;
          Wr.segs = KCITY.site.wallSegs(Wr.nodes.filter(function (n) { return !n.skip; }));
          KCITY.site.stampWall(Wr, { thick: 12, step: 4, gateTower: 13 });
          state.wallLots = stampHosts(C, L, buildWallHosts(Wr));
          state.civic = stampHosts(C, L, buildInteriorHosts());
        }
      },
      {
        name: 'frontage-court infill of all 25 irregular cells',
        run: function () {
          var blocks = [];
          for (var idx = 0; idx < GR.cells.length; idx++) {
            var gc = GR.cells[idx];
            var kind = 'hearth';
            var wealth = 0.55;
            if (gc.i <= 1 && gc.j <= 1) { kind = 'sword'; wealth = 0.88; }
            else if (gc.i === 2 || gc.j === 2) { kind = 'bazaar'; wealth = 0.70; }
            else if (gc.i <= 1 && gc.j >= 3) { kind = 'forges'; wealth = 0.36; }
            else if (gc.i >= 3 && gc.j <= 1) { kind = 'sword'; wealth = 0.78; }
            blocks.push({
              id: gc.id,
              i: gc.i,
              j: gc.j,
              poly: shrinkPoly(gc.poly, 6.2),
              kind: kind,
              wealth: wealth,
              lanes: true
            });
          }
          state.courts = KCITY.strategies['frontage-courts'].run(blocks, {
            step: 5.5,
            seed: UR.SEED + 11,
            focus: [0, 0],
            pools: POOLS,
            small: SMALL,
            gaps: GAPS,
            garden: { sword: 0.10, hearth: 0.06, bazaar: 0.03, forges: 0.02 },
            infill: { step: 8.2, yard: 0.18, reach: 30 }
          });
        }
      }
    ];

    var city = KCITY.create({
      name: 'urundashi-qasba',
      seed: UR.SEED + 1,
      rand: 'krand',
      tune: tune,
      ground: { h: L.h },
      kit: { dims: urDims },
      steps: steps
    });
    city.run();
    return { city: city, L: L, state: state };
  }

  /* ================================================================= 2. EXTRA-MURAL SUBURBS (EAST WIKALA, SW STUD/STILLS, WEST HIGHWAY) */
  function buildSuburb(name, seedOff, origin, zonePoly, kind, wealth, waysSpec, hostsSpec) {
    var L = makeLevel(origin);
    var K = getCityLib;
    var tune = makeTune(340, 0.32, 8);
    var localPoly = zonePoly.map(function (p) { return L.P(p[0], p[1]); });
    var steps = [
      {
        name: name + ' zone',
        run: function () {
          var S = K().SL, R = S.R = new (K().Raster)(tune.rasterHalf, tune.cell);
          R.occ.fill(K().OCC.OUT);
          var P = K().plan();
          P.site = [{ id: 0, name: name, role: 'zone', poly: localPoly }];
          P.zone = localPoly;
          KCITY.site.zoneRaster(R, localPoly, { dry: -999, maxSlope: tune.maxSlope, h: L.h });
          stampWaterAndMoatClear(R, L, K().OCC);
          S.minSpacing = KCITY.site.minSpacing();
        }
      },
      {
        name: name + ' ways',
        run: function () {
          var S = K().SL;
          for (var i = 0; i < waysSpec.length; i++) {
            var w = waysSpec[i];
            S.addWay(w.cls, w.pts.map(function (p) { return L.P(p[0], p[1]); }), 3, { tag: w.tag });
          }
        }
      },
      {
        name: name + ' hosts',
        run: function (C) {
          stampHosts(C, L, hostsSpec);
        }
      },
      {
        name: name + ' infill',
        run: function () {
          var blocks = [{ id: name + '.blk', i: 0, j: 0, poly: shrinkPoly(localPoly, 5.5), kind: kind, wealth: wealth, lanes: true }];
          KCITY.strategies['frontage-courts'].run(blocks, {
            step: 6.0,
            seed: UR.SEED + seedOff,
            focus: [0, 0],
            pools: POOLS,
            small: SMALL,
            gaps: GAPS,
            garden: { wikala: 0.05, stud: 0.12, highway: 0.08 },
            infill: { step: 8.8, yard: 0.24, reach: 28 }
          });
        }
      }
    ];
    var city = KCITY.create({
      name: name,
      seed: UR.SEED + seedOff,
      rand: 'krand',
      tune: tune,
      ground: { h: L.h },
      kit: { dims: urDims },
      steps: steps
    });
    city.run();
    return { city: city, L: L };
  }

  /* ================================================================= MASTER BUILD & RECONCILIATION */
  function runAll() {
    var GR = KCITY.grid.plan(GRID_SPEC);
    /* Carve the 13 m moat trench into UR ground BEFORE any KCITY raster or stance reads urundashiH */
    UR.setMoat(GR.moat);

    var S_QASBA = buildQasbaPlan(GR);

    /* East Gate Outlander Wikala & Historian Caravan Suburb (Rabad al-Sarq, outside u+ gate across East Moat Bridge) */
    var eGate = GR.gates.filter(function (g) { return g.side === 'u+'; })[0];
    var ex0 = eGate.x + 56, ez0 = eGate.z;
    var S_EAST = buildSuburb(
      'ur-east-wikala', 101, [ex0 + 95, ez0],
      [[ex0, ez0 - 108], [ex0 + 210, ez0 - 122], [ex0 + 215, ez0 + 96], [ex0, ez0 + 104]],
      'wikala', 0.48,
      [
        { cls: 'highway', pts: [[eGate.x + 28, eGate.z], [ex0 + 225, ez0 - 24]], tag: 'Iziz & Longsong Historian Caravan Road' },
        { cls: 'main', pts: [[ex0 + 68, ez0 - 98], [ex0 + 72, ez0 + 88]], tag: 'Wikala Customs Lane' },
        { cls: 'side', pts: [[ex0 + 148, ez0 - 102], [ex0 + 152, ez0 + 84]], tag: 'Envoy Compound Walk' }
      ],
      [
        { key: 'sm_wikala_caravanserai', x: ex0 + 42,  z: ez0 - 44, ry: 0,          hero: true,  people: 26, subward: 'Babu-Iziz',     why: 'Wikālat al-Īzānī (Eastern Caravan Court)' },
        { key: 'sm_wikala_caravanserai', x: ex0 + 44,  z: ez0 + 42, ry: Math.PI,    hero: true,  people: 24, subward: 'Babu-Longsong', why: 'Wikālat al-Muʾarrikhīn (Historians Book Serai)' },
        { key: 'sm_envoy_house',         x: ex0 + 112, z: ez0 - 46, ry: 0,          hero: true,  people: 14, subward: 'Babu-Longsong', why: 'Order of Historians Book-Relay Factor House' },
        { key: 'sm_envoy_house',         x: ex0 + 114, z: ez0 + 44, ry: Math.PI,    hero: true,  people: 14, subward: 'Babu-Iziz',     why: 'Iziz & Pylon Caravan Factor House' },
        { key: 'sm_kattu_chancery',      x: ex0 + 174, z: ez0 - 42, ry: -Math.PI/2, hero: false, people: 10, subward: 'Babu-Iziz',     why: '4% Bābu Customs Weigh-House & Seal Office' },
        { key: 'sm_stock_fold',          x: ex0 + 178, z: ez0 + 44, ry: -Math.PI/2, hero: false, people:  4, subward: 'Babu-Iziz',     why: 'Outlander Pack-Mule & Camel Yard' }
      ]
    );

    /* South-West Ayn al-Dubnu Cavalry Stud, Sunu-sikaru Stills & Nitre Vats Suburb (Rabad al-Dubnu — remaining 3 SHUMAR_TUNE works!) */
    var sGate = GR.gates.filter(function (g) { return g.side === 'v+'; })[0];
    var S_STUD = buildSuburb(
      'ur-sw-stud', 202, [10, 445],
      [[-245, 365], [255, 365], [245, 535], [-255, 525]],
      'stud', 0.42,
      [
        { cls: 'highway', pts: [[sGate.x, sGate.z + 28], [20, 395], [-10, 545], [-60, 700]], tag: 'Dubnosriba & Ordeal Supply Road' },
        { cls: 'main', pts: [[-225, 415], [20, 410], [225, 405]], tag: 'Rabaḍ al-Dubnu Stud & Distillery Terrace' },
        { cls: 'side', pts: [[-205, 478], [185, 468]], tag: 'Mill-Race Lane' }
      ],
      [
        { key: 'sm_stock_fold',       x: -175, z: 392, ry: 0,       hero: true,  people:  8, workId: 'urundashi.stud',   why: '4th-Regiment Cavalry Remount Corral W' },
        { key: 'sm_stock_fold',       x: -115, z: 392, ry: 0,       hero: false, people:  6, workId: 'urundashi.stud',   why: '4th-Regiment Broodmare & Foal Paddock' },
        { key: 'sm_stock_fold',       x:  -55, z: 392, ry: 0,       hero: false, people:  6, workId: 'urundashi.stud',   why: 'Ordeal Pack-Mule Train Corral' },
        { key: 'sm_spirits_still',    x:   58, z: 390, ry: 0,       hero: true,  people:  8, workId: 'urundashi.stills', why: 'Urundashi Ṣūnu-šikaru Copper Alembics I' },
        { key: 'sm_spirits_still',    x:  112, z: 390, ry: 0,       hero: true,  people:  8, workId: 'urundashi.stills', why: 'Urundashi Ṣūnu-šikaru Copper Alembics II' },
        { key: 'sm_apricot_orchard',  x:  172, z: 392, ry: 0,       hero: false, people:  4, workId: null,               why: 'Sheltered South-Slope Whorl-Apricot & Agave Wall' },
        { key: 'sm_saltpeter_works',  x:  195, z: 448, ry: Math.PI, hero: true,  people:  8, workId: 'urundashi.nitre',  why: 'Steppe Limestone Nitre Leaching Vats E' },
        { key: 'sm_saltpeter_works',  x:  138, z: 452, ry: Math.PI, hero: false, people:  6, workId: 'urundashi.nitre',  why: 'Steppe Limestone Nitre Boiling Shed W' },
        { key: 'sm_watermill',        x:   68, z: 456, ry: Math.PI, hero: true,  people:  6, workId: null,               why: 'Ayn al-Dubnu Overshot Grain & Mash Mill' },
        { key: 'sm_watermill',        x:  -72, z: 486, ry: Math.PI, hero: false, people:  6, workId: null,               why: 'Dubnu Wool-Fulling Watermill' }
      ]
    );

    /* West Gate Royal Plateau Highway Suburb (Mahallat Amaru, outside u- gate across West Moat Bridge) */
    var wGate = GR.gates.filter(function (g) { return g.side === 'u-'; })[0];
    var wx0 = wGate.x - 245, wz0 = wGate.z;
    var S_WEST = buildSuburb(
      'ur-west-highway', 303, [wx0 + 95, wz0 + 10],
      [[wx0, wz0 - 88], [wx0 + 190, wz0 - 82], [wx0 + 192, wz0 + 96], [wx0, wz0 + 92]],
      'highway', 0.44,
      [
        { cls: 'highway', pts: [[wGate.x - 28, wGate.z], [wx0 - 40, wz0 + 22]], tag: '92 km Amaro Royal Plateau Highway (supp.ssgsv5zbd2)' },
        { cls: 'main', pts: [[wx0 + 92, wz0 - 76], [wx0 + 96, wz0 + 82]], tag: 'Post-Station Cross-Lane' }
      ],
      [
        { key: 'sm_wayside_cairn',    x: wx0 + 174, z: wz0 - 22, ry: 0,       hero: false, people:  0, why: '92-km Amaro Highway Milestone Cairn' },
        { key: 'sm_brewery_teahouse', x: wx0 + 138, z: wz0 - 38, ry: 0,       hero: true,  people: 10, why: 'Royal Courier Post-House & Samovar Inn' },
        { key: 'sm_state_granary',    x: wx0 + 136, z: wz0 + 42, ry: Math.PI, hero: false, people:  6, why: 'Western Caravan Fodder & Barley Store' }
      ]
    );

    /* Collect all ways in world coordinates + regional trunk road extensions */
    var districtSpecs = [
      { code: 'qasba',   inst: S_QASBA, houseScale: 1.0 },
      { code: 'wikala',  inst: S_EAST,  houseScale: 1.0 },
      { code: 'stud',    inst: S_STUD,  houseScale: 1.0 },
      { code: 'highway', inst: S_WEST,  houseScale: 1.0 }
    ];

    var ways = [];
    for (var di = 0; di < districtSpecs.length; di++) {
      var ds = districtSpecs[di];
      var ox = ds.inst.L.o[0], oz = ds.inst.L.o[1];
      var pways = ds.inst.city.plan.ways;
      for (var wi = 0; wi < pways.length; wi++) {
        var w = pways[wi];
        if (w.died != null || !w.pts || w.pts.length < 2) continue;
        ways.push({
          id: ds.code + ':way:' + wi,
          district: ds.code,
          kind: w.cls,
          w: w.w,
          tag: w.tag || w.cls,
          pts: w.pts.map(function (p) { return [p[0] + ox, p[1] + oz]; })
        });
      }
    }

    /* Regional trunk road extensions out to the ring hamlets and horizon */
    var nGate = GR.gates.filter(function (g) { return g.side === 'v-'; })[0];
    ways.push({
      id: 'road:amaru-west', district: 'highway', kind: 'highway', w: 10, tag: 'Amaro Royal Highway',
      pts: [[wx0 - 40, wz0 + 22], [-780, -180], [-1450, -480]]
    });
    ways.push({
      id: 'road:iziz-east', district: 'wikala', kind: 'highway', w: 10, tag: 'East Foothills & Longsong Caravan Road',
      pts: [[ex0 + 225, ez0 - 24], [880, -140], [1550, -220]]
    });
    ways.push({
      id: 'road:yamu-north', district: 'qasba', kind: 'highway', w: 9.5, tag: 'Yamu-Qappu Silver-Water Road',
      pts: [[nGate.x, nGate.z - 28], [45, -620], [95, -1350]]
    });

    /* Exact moat gate-bridges (4 stone arch bridges spanning GR.moat.bridges) */
    var moatBridges = [];
    if (GR.moat && GR.moat.bridges) {
      for (var bi = 0; bi < GR.moat.bridges.length; bi++) {
        var mb = GR.moat.bridges[bi];
        var run = GR.moat.width + 11;
        var b0 = [mb.x - mb.dir[0] * run * 0.5, mb.z - mb.dir[1] * run * 0.5];
        var b1 = [mb.x + mb.dir[0] * run * 0.5, mb.z + mb.dir[1] * run * 0.5];
        var deckY = Math.max(UR.base(b0[0], b0[1]), UR.base(b1[0], b1[1])) + 0.18;
        moatBridges.push({
          id: 'moat.bridge.' + mb.side,
          side: mb.side,
          name: (GATE_NAMES[mb.side] || mb.side) + ' Moat Bridge',
          x: mb.x,
          z: mb.z,
          y: deckY,
          dir: mb.dir,
          len: run,
          w: 11.6,
          ry: Math.atan2(mb.dir[0], mb.dir[1])
        });
      }
    }

    /* Filter, deduplicate & validate all buildings in world coordinates */
    var globalSpace = KSPACE.create({ cell: 24 });
    var allLots = [];
    var vacantPicked = 0;

    for (var dj = 0; dj < districtSpecs.length; dj++) {
      var ds2 = districtSpecs[dj];
      var ox2 = ds2.inst.L.o[0], oz2 = ds2.inst.L.o[1];
      var raw = ds2.inst.city.plan.lots;
      for (var li = 0; li < raw.length; li++) {
        var T = raw[li];
        if (T.died != null || !T.bo || !T.key) continue;
        var wx = T.x + ox2, wz = T.z + oz2;
        var v = T.v == null ? 0 : T.v;
        var D = urDims(T.key, v);
        var u = [Math.cos(T.ry), -Math.sin(T.ry)];
        var wbo = getCityLib().obb([wx, wz], u, T.w * 0.5, T.d * 0.5);
        var rBound = Math.hypot(wbo.hw, wbo.hd);

        /* Never place any building in wet moat or river channels */
        var wetHit = false;
        var corners = getCityLib().obbCorners(wbo);
        corners.push([wx, wz]);
        for (var ci2 = 0; ci2 < corners.length; ci2++) {
          var cp = corners[ci2];
          if (urundashiWater(cp[0], cp[1]).wet || UR.inMoat(cp[0], cp[1], 1.5)) {
            wetHit = true;
            break;
          }
        }
        if (wetHit) continue;

        /* Ensure non-civic houses stay strictly clear of every street carriageway */
        if (!T.civic) {
          var onWay = false;
          for (var wj = 0; wj < ways.length && !onWay; wj++) {
            var wy = ways[wj];
            if (wy.district !== ds2.code && wy.kind !== 'highway') continue;
            var need = (wy.w == null ? 6 : wy.w) * 0.5 + Math.min(T.w, T.d) * 0.42;
            for (var pk = 1; pk < wy.pts.length; pk++) {
              if (segD2(wx, wz, wy.pts[pk - 1][0], wy.pts[pk - 1][1], wy.pts[pk][0], wy.pts[pk][1]) < need) {
                onWay = true;
                break;
              }
            }
          }
          if (onWay) continue;
        }

        /* Exact global OBB non-overlap check */
        var clash = false;
        var hits = globalSpace.query(wx, wz, rBound + 20);
        for (var qk = 0; qk < hits.length; qk++) {
          if (getCityLib().SL.pen(wbo, hits[qk].bo) > 0.05) { clash = true; break; }
        }
        if (clash) continue;

        /* Pick 10 active construction sites across outer qasba & highway/stud suburbs */
        var isVacant = false, progress = 1.0;
        if (!T.civic && vacantPicked < 10 && (ds2.code === 'highway' || ds2.code === 'stud' || T.cls === 'hearth')) {
          var vh = KRAND.hash(UR.SEED, T.id, dj + 503) % 23;
          if (vh === 0) {
            isVacant = true;
            vacantPicked++;
            progress = 0.22 + ((KRAND.hash(UR.SEED, T.id, 509) % 62) / 100);
          }
        }

        var resPop = 0;
        if (T.civic) {
          resPop = T.people == null ? 0 : T.people;
        } else if (!isVacant) {
          var bp = BASE_PEOPLE[T.key] == null ? 8 : BASE_PEOPLE[T.key];
          resPop = Math.max(2, Math.round(bp * ds2.houseScale));
        }

        var caste = T.key === 'sm_outlander_lodging' || ds2.code === 'wikala' ? 'outlander'
          : (D && D.giant ? 'sword' : (T.key.indexOf('cadet') >= 0 ? 'cadet' : 'hearth'));

        var rec = {
          id: ds2.code + ':' + T.id,
          district: ds2.code,
          simId: 'srbp1bvh1r',
          subward: T.subward || null,
          caste: caste,
          key: T.key,
          v: v,
          x: wx,
          z: wz,
          y: T.y == null ? urundashiH(wx, wz) : T.y,
          ry: T.ry,
          w: T.w,
          d: T.d,
          h: T.h,
          giant: D ? D.giant : false,
          kind: T.civic ? 'civic' : 'house',
          hero: !!T.hero,
          vacant: isVacant,
          progress: progress,
          workId: T.workId || null,
          people: resPop,
          drop: T.drop == null ? 0 : T.drop,
          why: T.why || T.role || T.key,
          bo: wbo
        };
        globalSpace.insert(rec, wx, wz, rBound);
        allLots.push(rec);
      }
    }

    /* Calibrate residential occupancy so Urundashi's town population matches SHUMAR_TUNE (3,500 people, ~200 outlanders in wikala) */
    var wikalaFixed = 0, wikalaHouse = 0, wikalaHouses = [];
    var mainFixed = 0, mainHouse = 0, mainHouses = [];
    for (var i2 = 0; i2 < allLots.length; i2++) {
      var r2 = allLots[i2];
      if (r2.district === 'wikala') {
        if (r2.kind === 'civic' || r2.vacant) wikalaFixed += r2.people;
        else { wikalaHouse += r2.people; wikalaHouses.push(r2); }
      } else {
        if (r2.kind === 'civic' || r2.vacant) mainFixed += r2.people;
        else { mainHouse += r2.people; mainHouses.push(r2); }
      }
    }
    if (wikalaHouses.length > 0 && wikalaHouse > 0) {
      var wNeed = Math.max(wikalaHouses.length, 200 - wikalaFixed);
      var wRatio = wNeed / wikalaHouse;
      for (var wi2 = 0; wi2 < wikalaHouses.length; wi2++) {
        wikalaHouses[wi2].people = Math.max(1, Math.round(wikalaHouses[wi2].people * wRatio));
      }
    }
    var wikalaTotal = wikalaFixed + wikalaHouses.reduce(function (a, b) { return a + b.people; }, 0);
    if (mainHouses.length > 0 && mainHouse > 0) {
      var mTarget = 3500 - wikalaTotal;
      var mRatio = Math.max(0.35, Math.min(2.2, Math.max(mainHouses.length * 2, mTarget - mainFixed) / mainHouse));
      for (var mi2 = 0; mi2 < mainHouses.length; mi2++) {
        mainHouses[mi2].people = Math.max(2, Math.round(mainHouses[mi2].people * mRatio));
      }
    }

    var byDistrict = { qasba: 0, wikala: 0, stud: 0, highway: 0 };
    var heroCount = 0, vacantCount = 0, giantCount = 0, totalPeople = 0;
    var worksPlaced = {};
    for (var k2 = 0; k2 < allLots.length; k2++) {
      var b2 = allLots[k2];
      totalPeople += b2.people;
      byDistrict[b2.district] = (byDistrict[b2.district] == null ? 0 : byDistrict[b2.district]) + b2.people;
      if (b2.hero) heroCount++;
      if (b2.vacant) vacantCount++;
      if (b2.giant) giantCount++;
      if (b2.workId) worksPlaced[b2.workId] = (worksPlaced[b2.workId] == null ? 0 : worksPlaced[b2.workId]) + 1;
    }

    return {
      dims: urDims,
      grid: GR,
      moatBridges: moatBridges,
      lots: allLots,
      ways: ways,
      space: globalSpace,
      census: {
        total: totalPeople,
        byDistrict: byDistrict,
        outlanders: byDistrict.wikala,
        buildings: allLots.length,
        heroCount: heroCount,
        vacantCount: vacantCount,
        giantBuildings: giantCount,
        worksPlaced: worksPlaced
      }
    };
  }

  var built = null;
  function get() {
    if (!built) built = runAll();
    return built;
  }

  return {
    KIT_BOXES: KIT_BOXES,
    GRID_SPEC: GRID_SPEC,
    GATE_NAMES: GATE_NAMES,
    dims: urDims,
    run: runAll,
    get: get
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.UR_CITY = UR_CITY;
}
