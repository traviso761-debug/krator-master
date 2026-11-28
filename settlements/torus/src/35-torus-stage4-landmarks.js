// ================================================================= TORUS — 35: Multi-Storey Landmarks, Ag-Domes & Walk/Door Registry ([G data])
// Pure engine-neutral room-by-room floorplans (F-1..F2), dogleg stairs, KDOOR doors, KFURN placements for:
//   1. Board Hall & Tenders' Botanical Archive (lm_boardhall, T3 +34m, F-1..F2)
//   2. Vothic Emissary's Residence & Chichani Compound (lm_emissary, T7 +14m, F-1..F2)
//   3. Ordinator Palace of Torus (lm_ordinators, T7 +14m, F-1..F2)
//   4. Great Cider-Press & Fruitvine Winch Hall (lm_ciderhall, WY +300m, F-1..F1)
//   5. 8 Surviving Tenders' Out-of-Zone & Amber-Sap Ag-Domes (open airlocks + apothecary/botanical interiors)
//   6. 4 Quarantined Feral Ag-Domes (welded shut KDOORs, locked: true + KHAZ poison/thorn/acid zones)
// Zero THREE, zero DOM. Avoids `|| <number>` per tools/check_source.py ORNUM rule.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});

  function findLm(plan, id) {
    for (var i = 0; i < plan.landmarks.length; i++) {
      if (plan.landmarks[i].id === id) return plan.landmarks[i];
    }
    return null;
  }

  function makeLocalFrame(lm) {
    var c = Math.cos(lm.ry), s = Math.sin(lm.ry);
    function pt(lx, lz, ly) {
      return [
        +(lm.x + lx * c + lz * s).toFixed(2),
        +(lm.z - lx * s + lz * c).toFixed(2),
        +(lm.y + (ly == null ? 0 : ly)).toFixed(2)
      ];
    }
    function ptY(lx, ly, lz) {
      var p = pt(lx, lz, ly);
      return [p[0], p[2], p[1]];
    }
    function rectPoly(x0, x1, z0, z1, ly) {
      return [pt(x0, z0, ly), pt(x1, z0, ly), pt(x1, z1, ly), pt(x0, z1, ly)];
    }
    return { lm: lm, c: c, s: s, pt: pt, ptY: ptY, rectPoly: rectPoly };
  }

  function addSlabsWithHoles(out, F, storey, x0, x1, z0, z1, ly, mat, holes) {
    if (!holes || !holes.length) {
      out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(x0, x1, z0, z1, ly) });
      return;
    }
    var hs = holes.slice().sort(function (a, b) { return a[2] - b[2]; });
    var curZ = z0;
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i];
      if (h[2] > curZ + 0.05) {
        out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(x0, x1, curZ, h[2], ly) });
      }
      if (h[0] > x0 + 0.05) {
        out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(x0, h[0], h[2], h[3], ly) });
      }
      if (x1 > h[1] + 0.05) {
        out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(h[1], x1, h[2], h[3], ly) });
      }
      curZ = Math.max(curZ, h[3]);
    }
    if (z1 > curZ + 0.05) {
      out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(x0, x1, curZ, z1, ly) });
    }
  }

  function addWallSeg(walls, doors, F, bldId, storey, axis, a0, a1, fixed, ly, h, thick, mat, doorSpec) {
    var len = a1 - a0;
    if (len <= 0.1) return;
    if (!doorSpec) {
      var mid = 0.5 * (a0 + a1);
      var lx = axis === 'x' ? mid : fixed;
      var lz = axis === 'x' ? fixed : mid;
      var p = F.ptY(lx, ly, lz);
      walls.push({
        storey: storey, x: p[0], y: p[1], z: p[2],
        ry: F.lm.ry + (axis === 'x' ? 0 : 0.5 * Math.PI),
        w: len, h: h, d: thick, mat: mat, walkBlock: h >= 0.9
      });
      return;
    }
    var dc = doorSpec.pos == null ? 0.5 * (a0 + a1) : doorSpec.pos;
    var dw = doorSpec.w == null ? 2.6 : doorSpec.w;
    var dh = doorSpec.h == null ? Math.min(3.2, h - 0.5) : doorSpec.h;
    var leftLen = (dc - 0.5 * dw) - a0;
    var rightLen = a1 - (dc + 0.5 * dw);
    if (leftLen > 0.15) addWallSeg(walls, doors, F, bldId, storey, axis, a0, dc - 0.5 * dw, fixed, ly, h, thick, mat, null);
    if (rightLen > 0.15) addWallSeg(walls, doors, F, bldId, storey, axis, dc + 0.5 * dw, a1, fixed, ly, h, thick, mat, null);
    if (h - dh > 0.25) {
      var lp = F.ptY(axis === 'x' ? dc : fixed, ly + dh, axis === 'x' ? fixed : dc);
      walls.push({
        storey: storey, x: lp[0], y: lp[1], z: lp[2],
        ry: F.lm.ry + (axis === 'x' ? 0 : 0.5 * Math.PI),
        w: dw, h: +(h - dh).toFixed(2), d: thick, mat: mat, walkBlock: false
      });
    }
    if (!doorSpec.archOnly) {
      var dp = F.ptY(axis === 'x' ? dc : fixed, ly, axis === 'x' ? fixed : dc);
      doors.push({
        id: doorSpec.id, building: bldId, storey: storey,
        at: [dp[0], dp[1], dp[2]],
        yaw: F.lm.ry + (axis === 'x' ? 0 : 0.5 * Math.PI),
        w: dw, h: dh, t: doorSpec.t == null ? 0.12 : doorSpec.t,
        preset: doorSpec.preset == null ? 'single' : doorSpec.preset,
        style: doorSpec.style == null ? 'plank+ring' : doorSpec.style,
        open: doorSpec.open == null ? 1 : doorSpec.open,
        locked: !!doorSpec.locked
      });
    }
  }

  function addDoglegStair(slabs, stairs, F, storey, sx0, sz0, y0, y1, idPrefix) {
    var yMid = +(0.5 * (y0 + y1)).toFixed(2);
    stairs.push({
      id: idPrefix + '_A', storey: storey,
      a: F.pt(sx0 + 1.5, sz0, y0), b: F.pt(sx0 + 1.5, sz0 + 6.6, yMid), w: 2.6, mat: 'tankSteel'
    });
    slabs.push({
      storey: storey, y: yMid, thick: 0.28, mat: 'tankSteel',
      pts: F.rectPoly(sx0, sx0 + 6.2, sz0 + 6.2, sz0 + 9.2, yMid)
    });
    stairs.push({
      id: idPrefix + '_B', storey: storey,
      a: F.pt(sx0 + 4.7, sz0 + 6.6, yMid), b: F.pt(sx0 + 4.7, sz0, y1), w: 2.6, mat: 'tankSteel'
    });
  }

  function addFurn(list, F, bldId, room, key, lx, ly, lz, lry, wealth, setting) {
    var p = F.ptY(lx, ly, lz);
    list.push({
      key: key, x: p[0], y: p[1], z: p[2],
      ry: +(F.lm.ry + (lry == null ? 0 : lry)).toFixed(4),
      building: bldId, room: room, wealth: wealth == null ? 0.65 : wealth,
      setting: setting || 'indoor'
    });
  }

  // ----------------------------------------------------------------- 1. Board Hall & Tenders' Botanical Archive (T3 +34m, 78 x 64 m)
  function buildBoardHallSpec(plan) {
    var lm = findLm(plan, 'lm_boardhall');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    var stairHole = [[16.0, 22.6, -22.4, -12.8]];

    // F-1 (-4.2m): Ancient Botanical Manual Vault, Cryo-Dry Seed Bank & Rinkvolk Charter Strongroom
    addSlabsWithHoles(slabs, F, 0, -32, 32, -25, 21, -4.2, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -32, 32, -25, -4.2, 4.2, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -32, 32, 21, -4.2, 4.2, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -25, 21, -32, -4.2, 4.2, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -25, 21, 32, -4.2, 4.2, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -32, 14, -4, -4.2, 4.0, 0.7, 'ashStone',
      { id: 'door_board_manual_vault', pos: -10, w: 2.8, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -25, -4, 0, -4.2, 4.0, 0.7, 'ashStone',
      { id: 'door_board_seed_bank', pos: -14, w: 2.4, preset: 'single', style: 'plate', open: 1 });
    addFurn(furn, F, lm.id, 'botanical_manual_vault', 'generic_writing_supplies', -18, -4.2, -16, 0, 0.9);
    addFurn(furn, F, lm.id, 'botanical_manual_vault', 'pa_long_table', -18, -4.2, -12, 0, 0.85);
    addFurn(furn, F, lm.id, 'botanical_manual_vault', 'generic_pantry_shelf', -28, -4.2, -18, 1.57, 0.85);
    addFurn(furn, F, lm.id, 'seed_bank_vault', 'generic_canister_set', 8, -4.2, -18, 0, 0.9);
    addFurn(furn, F, lm.id, 'seed_bank_vault', 'generic_strongbox', 8, -4.2, -10, 0, 0.95);
    addFurn(furn, F, lm.id, 'charter_strongroom', 'generic_strongbox', -20, -4.2, 10, 0, 0.9);
    addDoglegStair(slabs, stairs, F, 0, 16.2, -22.2, -4.2, 0.0, 'stair_board_bm_f0');

    // F0 (0.0m): Colonnaded Portico, Elected Chairman & 12-Seat Board Assize Rotunda, Law Court & Herbarium Assay
    addSlabsWithHoles(slabs, F, 1, -34, 34, -26, 28, 0.0, 'ancientStone', stairHole);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -32, 32, -25, 0.0, 5.4, 1.0, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -32, 32, 21, 0.0, 5.4, 1.0, 'ancientStone',
      { id: 'door_board_main_portal', pos: 0, w: 4.8, h: 4.0, preset: 'double', style: 'panel+pull', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -25, 21, -32, 0.0, 5.4, 1.0, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -25, 21, 32, 0.0, 5.4, 1.0, 'ancientStone', null);
    // Flanking Law Court (west) & Tenders' Herbarium Assay (east) partitions
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -25, 21, -14, 0.0, 5.2, 0.65, 'ashStone',
      { id: 'door_board_law_court', pos: 4, w: 2.8, preset: 'double', style: 'panel+pull', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -10, 21, 14, 0.0, 5.2, 0.65, 'ashStone',
      { id: 'door_board_herbarium', pos: 6, w: 2.8, preset: 'double', style: 'glazed+pull', open: 1 });
    // Chairman's Dais & 12-Seat Board Assize Table
    addFurn(furn, F, lm.id, 'board_assize_rotunda', 'pa_chief_throne', 0, 0.0, -14, 0, 0.95);
    addFurn(furn, F, lm.id, 'board_assize_rotunda', 'pa_long_table', 0, 0.0, 0, 1.57, 0.9);
    addFurn(furn, F, lm.id, 'board_assize_rotunda', 'pa_council_chair', -5, 0.0, 0, 1.57, 0.85);
    addFurn(furn, F, lm.id, 'board_assize_rotunda', 'pa_council_chair', 5, 0.0, 0, -1.57, 0.85);
    addFurn(furn, F, lm.id, 'rinkvolk_law_court', 'pa_bench', -23, 0.0, 6, 0, 0.7);
    addFurn(furn, F, lm.id, 'rinkvolk_law_court', 'generic_writing_supplies', -23, 0.0, -8, 0, 0.8);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'generic_herb_bundles', 24, 0.0, 4, 0, 0.85);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'generic_medicine', 24, 0.0, 11, 0, 0.9);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'generic_fruit_madrone', 21, 0.0, 7.5, 0, 0.88);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'generic_fruit_rattlepod', 26, 0.0, 7.5, 0, 0.88);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'generic_fruit_gatepod', 21, 0.0, 1.0, 0, 0.85);
    addFurn(furn, F, lm.id, 'tenders_herbarium', 'pa_cold_frame', 24, 0.0, -4, 0, 0.8);
    addDoglegStair(slabs, stairs, F, 1, 16.2, -22.2, 0.0, 5.4, 'stair_board_f0_f1');

    // F1 (+5.4m): Chairman's Council Gallery & Botanical Reading Mezzanine (cutout over rotunda + stair hole)
    addSlabsWithHoles(slabs, F, 2, -32, 32, -25, 19, 5.4, 'ancientStone', [[-10.5, 10.5, -7.5, 10.5], stairHole[0]]);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -32, 32, -25, 5.4, 4.8, 0.9, 'ashStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -32, 32, 19, 5.4, 4.8, 0.9, 'ashStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -25, 19, -32, 5.4, 4.8, 0.9, 'ashStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -25, 19, 32, 5.4, 4.8, 0.9, 'ashStone', null);
    addFurn(furn, F, lm.id, 'chairman_gallery', 'generic_tea_set', -22, 5.4, -12, 0, 0.9);
    addFurn(furn, F, lm.id, 'chairman_gallery', 'pa_council_chair', -22, 5.4, -15, 0, 0.9);
    addFurn(furn, F, lm.id, 'botanical_mezzanine', 'voth_planter', 24, 5.4, 4, 0, 0.85);
    addDoglegStair(slabs, stairs, F, 2, 16.2, -22.2, 5.4, 10.4, 'stair_board_f1_f2');

    // F2 (+10.4m): Copper-Domed Clock & Harvest-Bell Lantern Deck
    addSlabsWithHoles(slabs, F, 3, 10, 30, -25, -4, 10.4, 'verdigris', stairHole);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', 10, 30, -25, 10.4, 1.3, 0.5, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', 10, 30, -4, 10.4, 1.3, 0.5, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -25, -4, 10, 10.4, 1.3, 0.5, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -25, -4, 30, 10.4, 1.3, 0.5, 'ancientStone', null);

    return {
      id: lm.id, lm: lm,
      levels: [
        { storey: 0, name: 'F-1 Botanical Manual & Seed Vault', y0: -4.2, y1: 0.0 },
        { storey: 1, name: 'F0 Board Assize & Rinkvolk Law Court', y0: 0.0, y1: 5.4 },
        { storey: 2, name: 'F1 Chairman\'s & Herbarium Gallery', y0: 5.4, y1: 10.4 },
        { storey: 3, name: 'F2 Harvest-Bell Lantern Deck', y0: 10.4, y1: 16.5 }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  // ----------------------------------------------------------------- 2. Vothic Emissary's Residence & Chichani Compound (T7 +14m, 84 x 72 m)
  function buildEmissarySpec(plan) {
    var lm = findLm(plan, 'lm_emissary');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    var stairHole = [[14.0, 20.6, -24.4, -14.8]];

    // F-1 (-4.2m): Medical & Cacao/Spice Tithe Strongroom, Vintage Cider Cellar & Guard Magazine
    addSlabsWithHoles(slabs, F, 0, -34, 34, -26, 22, -4.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -34, 34, -26, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -34, 34, 22, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -26, 22, -34, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -26, 22, 34, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -34, 12, -6, -4.2, 4.0, 0.7, 'ashStone',
      { id: 'door_emis_tithe_vault', pos: -10, w: 2.8, preset: 'double', style: 'plate', open: 1 });
    addFurn(furn, F, lm.id, 'medical_tithe_strongroom', 'generic_strongbox', -22, -4.2, -18, 0, 0.95);
    addFurn(furn, F, lm.id, 'medical_tithe_strongroom', 'generic_spice_box', -12, -4.2, -18, 0, 0.9);
    addFurn(furn, F, lm.id, 'medical_tithe_strongroom', 'generic_medicine', -4, -4.2, -18, 0, 0.9);
    addFurn(furn, F, lm.id, 'medical_tithe_strongroom', 'generic_fruit_cacao', -16, -4.2, -13, 0, 0.92);
    addFurn(furn, F, lm.id, 'medical_tithe_strongroom', 'generic_fruit_pomegranate', -8, -4.2, -13, 0, 0.90);
    addFurn(furn, F, lm.id, 'emissary_cider_cellar', 'generic_wine', -20, -4.2, 8, 0, 0.85);
    addFurn(furn, F, lm.id, 'emissary_cider_cellar', 'generic_barrel', 14, -4.2, 8, 0, 0.8);
    addDoglegStair(slabs, stairs, F, 0, 14.2, -24.2, -4.2, 0.0, 'stair_emis_bm_f0');

    // F0 (0.0m): Treaty Gatehouse, Diplomatic Courtyard, Chichani Factoria, Chancery & Sun-Missionary Cloister
    addSlabsWithHoles(slabs, F, 1, -38, 38, -32, 34, 0.0, 'ashStone', stairHole);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -38, 38, -32, 0.0, 8.2, 1.4, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -38, 38, 32, 0.0, 8.2, 1.4, 'basalt',
      { id: 'door_emis_treaty_gate', pos: 0, w: 6.2, h: 4.8, preset: 'double', style: 'banded', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -32, 32, -38, 0.0, 8.2, 1.4, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -32, 32, 38, 0.0, 8.2, 1.4, 'basalt', null);
    // Manor front wall at lz=-4 + West Chichani Factoria + East Sun-Missionary Cloister
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -24, 24, -4, 0.0, 5.4, 0.9, 'ashStone',
      { id: 'door_emis_chancery', pos: 0, w: 3.6, preset: 'double', style: 'panel+pull', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -4, 24, -20, 0.0, 5.2, 0.7, 'ashStone',
      { id: 'door_emis_factoria', pos: 10, w: 2.8, preset: 'single', style: 'plank+ring', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -4, 24, 20, 0.0, 5.2, 0.7, 'ashStone',
      { id: 'door_emis_missionary_cloister', pos: 10, w: 2.8, preset: 'double', style: 'banded', open: 1 });
    addFurn(furn, F, lm.id, 'treaty_chancery', 'pa_long_table', -6, 0.0, -16, 0, 0.9);
    addFurn(furn, F, lm.id, 'treaty_chancery', 'generic_writing_supplies', -6, 0.0, -14, 0, 0.9);
    addFurn(furn, F, lm.id, 'treaty_chancery', 'voth_court_armour_stand', -18, 0.0, -22, 0, 0.9);
    addFurn(furn, F, lm.id, 'chichani_factoria', 'pa_shop_counter', -28, 0.0, 8, 1.57, 0.75);
    addFurn(furn, F, lm.id, 'chichani_factoria', 'generic_tea_set', -28, 0.0, 14, 0, 0.85);
    addFurn(furn, F, lm.id, 'sun_missionary_cloister', 'voth_shrine_stele', 29, 0.0, 4, 0, 0.9);
    addFurn(furn, F, lm.id, 'sun_missionary_cloister', 'voth_shrine_lantern', 29, 0.0, 12, 0, 0.9);
    addFurn(furn, F, lm.id, 'courtyard', 'voth_planter', -9, 0.0, 12, 0, 0.85, 'outdoor');
    addFurn(furn, F, lm.id, 'courtyard', 'voth_planter', 9, 0.0, 12, 0, 0.85, 'outdoor');
    addDoglegStair(slabs, stairs, F, 1, 14.2, -24.2, 0.0, 5.4, 'stair_emis_f0_f1');

    // F1 (+5.4m): Imperial Emissary's Audience & Banquet Hall
    addSlabsWithHoles(slabs, F, 2, -24, 24, -26, -4, 5.4, 'ancientStone', stairHole);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -24, 24, -26, 5.4, 5.2, 0.9, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -24, 24, -4, 5.4, 5.2, 0.9, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -26, -4, -24, 5.4, 5.2, 0.9, 'ancientStone', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -26, -4, 24, 5.4, 5.2, 0.9, 'ancientStone', null);
    addFurn(furn, F, lm.id, 'emissary_audience_hall', 'pa_chief_throne', 0, 5.4, -22, 0, 0.98);
    addFurn(furn, F, lm.id, 'emissary_audience_hall', 'pa_long_table', -6, 5.4, -12, 0, 0.92);
    addFurn(furn, F, lm.id, 'emissary_audience_hall', 'generic_tea_set', -6, 5.4, -12, 0, 0.95);
    addFurn(furn, F, lm.id, 'emissary_audience_hall', 'voth_shrine_lantern', 8, 5.4, -10, 0, 0.92);
    addDoglegStair(slabs, stairs, F, 2, 14.2, -24.2, 5.4, 10.6, 'stair_emis_f1_f2');

    // F2 (+10.6m): Copper-Domed Emissary Pavilion Terrace
    addSlabsWithHoles(slabs, F, 3, -18, 23, -26, -8, 10.6, 'porphyry', stairHole);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -18, 23, -26, 10.6, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -18, 23, -8, 10.6, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -26, -8, -18, 10.6, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -26, -8, 23, 10.6, 1.3, 0.5, 'basalt', null);

    return {
      id: lm.id, lm: lm,
      levels: [
        { storey: 0, name: 'F-1 Medical & Spice Tithe Vault', y0: -4.2, y1: 0.0 },
        { storey: 1, name: 'F0 Diplomatic Court & Missionary Cloister', y0: 0.0, y1: 5.4 },
        { storey: 2, name: 'F1 Emissary\'s Audience & Banquet Hall', y0: 5.4, y1: 10.6 },
        { storey: 3, name: 'F2 Copper-Domed Pavilion Suite', y0: 10.6, y1: 18.0 }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  // ----------------------------------------------------------------- 3. Ordinator Palace of Torus (T7 +14m, 80 x 70 m)
  function buildOrdinatorsSpec(plan) {
    var lm = findLm(plan, 'lm_ordinators');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    var stairHole = [[-23.4, -16.8, -22.4, -12.8]];

    // F-1 (-4.2m): History-Monk Interrogation Vault, Confiscated Scroll Lockup & Detention Cells
    addSlabsWithHoles(slabs, F, 0, -32, 32, -25, 21, -4.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -32, 32, -25, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -32, 32, 21, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -25, 21, -32, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -25, 21, 32, -4.2, 4.2, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -12, 32, -2, -4.2, 4.0, 0.75, 'ashStone',
      { id: 'door_ord_monk_cells', pos: 8, w: 2.4, preset: 'single', style: 'grille', open: 1 });
    addFurn(furn, F, lm.id, 'history_monk_cells', 'pa_prisoner_cage', 16, -4.2, 10, 0, 0.35);
    addFurn(furn, F, lm.id, 'history_monk_cells', 'voth_cell_grate', 4, -4.2, 10, 0, 0.4);
    addFurn(furn, F, lm.id, 'confiscated_scroll_vault', 'generic_strongbox', 14, -4.2, -16, 0, 0.85);
    addFurn(furn, F, lm.id, 'confiscated_scroll_vault', 'generic_writing_supplies', 4, -4.2, -16, 0, 0.85);
    addDoglegStair(slabs, stairs, F, 0, -23.2, -22.2, -4.2, 0.0, 'stair_ord_bm_f0');

    // F0 (0.0m): Gate Pylons, Hall of Scrutinies, Inquisitorial Guardroom & Sun-Cult Sanctuary Octagon
    addSlabsWithHoles(slabs, F, 1, -36, 36, -31, 32, 0.0, 'basalt', stairHole);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -36, 36, -31, 0.0, 9.2, 1.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -36, 36, 31, 0.0, 9.2, 1.5, 'basalt',
      { id: 'door_ord_scrutinies_gate', pos: 0, w: 5.8, h: 4.8, preset: 'double', style: 'banded', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -31, 31, -36, 0.0, 9.2, 1.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -31, 31, 36, 0.0, 9.2, 1.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -28, 28, 6, 0.0, 5.6, 0.9, 'basalt',
      { id: 'door_ord_sanctuary', pos: 4, w: 3.6, preset: 'double', style: 'banded', open: 1 });
    addFurn(furn, F, lm.id, 'sun_cult_sanctuary', 'voth_shrine_stele', 4, 0.0, -16, 0, 0.95);
    addFurn(furn, F, lm.id, 'sun_cult_sanctuary', 'voth_shrine_lantern', -4, 0.0, -10, 0, 0.9);
    addFurn(furn, F, lm.id, 'sun_cult_sanctuary', 'voth_shrine_urn', 12, 0.0, -10, 0, 0.9);
    addFurn(furn, F, lm.id, 'inquisitorial_guardroom', 'pa_weapon_rack', -26, 0.0, 16, 1.57, 0.75);
    addFurn(furn, F, lm.id, 'inquisitorial_guardroom', 'voth_court_armour_stand', 24, 0.0, 16, -1.57, 0.85);
    addDoglegStair(slabs, stairs, F, 1, -23.2, -22.2, 0.0, 5.6, 'stair_ord_f0_f1');

    // F1 (+5.6m): Amber-Sap Longevity Surveillance Registry & Parabolic Sun-Dish Gallery
    addSlabsWithHoles(slabs, F, 2, -28, 24, -25, 6, 5.6, 'porphyry', stairHole);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -28, 24, -25, 5.6, 5.2, 0.9, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -28, 24, 6, 5.6, 5.2, 0.9, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -25, 6, -28, 5.6, 5.2, 0.9, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -25, 6, 24, 5.6, 5.2, 0.9, 'basalt', null);
    addFurn(furn, F, lm.id, 'ambersap_surveillance_registry', 'pa_long_table', 4, 5.6, -10, 0, 0.9);
    addFurn(furn, F, lm.id, 'ambersap_surveillance_registry', 'generic_writing_supplies', 4, 5.6, -10, 0, 0.95);
    addFurn(furn, F, lm.id, 'ambersap_surveillance_registry', 'generic_medicine', 14, 5.6, -16, 0, 0.95);
    addDoglegStair(slabs, stairs, F, 2, -23.2, -22.2, 5.6, 11.2, 'stair_ord_f1_f2');

    // F2 (+11.2m): Scrutiny Watchtower Belfry
    addSlabsWithHoles(slabs, F, 3, -26, -12, -25, -10, 11.2, 'tankSteel', stairHole);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -26, -12, -25, 11.2, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -26, -12, -10, 11.2, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -25, -10, -26, 11.2, 1.3, 0.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -25, -10, -12, 11.2, 1.3, 0.5, 'basalt', null);

    return {
      id: lm.id, lm: lm,
      levels: [
        { storey: 0, name: 'F-1 History-Monk Cells & Scroll Vault', y0: -4.2, y1: 0.0 },
        { storey: 1, name: 'F0 Hall of Scrutinies & Sun Sanctuary', y0: 0.0, y1: 5.6 },
        { storey: 2, name: 'F1 Amber-Sap Surveillance Registry', y0: 5.6, y1: 11.2 },
        { storey: 3, name: 'F2 Scrutiny Watchtower Deck', y0: 11.2, y1: 19.0 }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  // ----------------------------------------------------------------- 4. Great Cider-Press & Fruitvine Winch Hall (WY=+300m, 88 x 56 m)
  function buildCiderHallSpec(plan) {
    var lm = findLm(plan, 'lm_ciderhall');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    var stairHole = [[-22.4, -15.8, -16.4, -6.8]];

    // F-1 (-5.2m -> world y=294.8m): Deep Cider-Tube Fermentation Tun Vault (connects flush to Cider Tube gallery!)
    addSlabsWithHoles(slabs, F, 0, -38, 38, -20, 20, -5.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -38, 38, -20, -5.2, 5.2, 0.9, 'tankSteel',
      { id: 'door_cider_tube_north', pos: 0, w: 4.2, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -38, 38, 20, -5.2, 5.2, 0.9, 'tankSteel',
      { id: 'door_cider_tube_south', pos: 0, w: 4.2, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -20, 20, -38, -5.2, 5.2, 0.9, 'tankSteel', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -20, 20, 38, -5.2, 5.2, 0.9, 'tankSteel', null);
    for (var bx = -24; bx <= 24; bx += 16) {
      addFurn(furn, F, lm.id, 'fermentation_tun_vault', 'generic_barrel', bx, -5.2, -12, 0, 0.65);
      addFurn(furn, F, lm.id, 'fermentation_tun_vault', 'generic_keg', bx, -5.2, 12, 0, 0.65);
    }
    addDoglegStair(slabs, stairs, F, 0, -22.2, -16.2, -5.2, 0.0, 'stair_cider_bm_f0');

    // F0 (0.0m -> world y=300.0m): Twin-Rim Winch Receiving Decks, Hydraulic Twin-Screw Crush Floor & Cooperage
    addSlabsWithHoles(slabs, F, 1, -42, 42, -24, 24, 0.0, 'ancientStone', stairHole);
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -28, 28, -18, 0.0, 5.6, 0.85, 'tankSteel',
      { id: 'door_cider_wheel_north', pos: 0, w: 5.2, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -28, 28, 18, 0.0, 5.6, 0.85, 'tankSteel',
      { id: 'door_cider_wheel_south', pos: 0, w: 5.2, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -18, 18, -28, 0.0, 5.6, 0.85, 'tankSteel',
      { id: 'door_cider_rim_west', pos: 0, w: 4.8, preset: 'blastside', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -18, 18, 28, 0.0, 5.6, 0.85, 'tankSteel',
      { id: 'door_cider_rim_east', pos: 0, w: 4.8, preset: 'blastside', style: 'plate', open: 1 });
    addFurn(furn, F, lm.id, 'crush_floor', 'pa_water_trough', -6, 0.0, 0, 0, 0.7);
    addFurn(furn, F, lm.id, 'crush_floor', 'pa_water_trough', 8, 0.0, 0, 0, 0.7);
    addFurn(furn, F, lm.id, 'crush_floor', 'pa_produce_crate', -14, 0.0, 10, 0, 0.65);
    addFurn(furn, F, lm.id, 'crush_floor', 'generic_fruit_canyon_grape', -12, 0.0, 11.5, 0, 0.75);
    addFurn(furn, F, lm.id, 'crush_floor', 'generic_fruit_pomelo', -16, 0.0, 11.5, 0, 0.75);
    addFurn(furn, F, lm.id, 'crush_floor', 'generic_fruit_madrone', -14, 0.0, 8.0, 0, 0.75);
    addFurn(furn, F, lm.id, 'crush_floor', 'pa_hand_cart', 16, 0.0, 10, 0.5, 0.6);
    addFurn(furn, F, lm.id, 'crush_floor', 'generic_bottle_crate', 16, 0.0, -10, 0, 0.7);
    addDoglegStair(slabs, stairs, F, 1, -22.2, -16.2, 0.0, 5.6, 'stair_cider_f0_f1');

    // F1 (+5.6m -> world y=305.6m): Press-Master's Assay & Cider-Tasting Gallery
    addSlabsWithHoles(slabs, F, 2, -26, 26, -20.5, 15, 5.6, 'verdigris', [[-8.0, 12.0, -5.5, 7.0], stairHole[0]]);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -26, 26, -20.5, 5.6, 4.4, 0.7, 'tankSteel', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -26, 26, 15, 5.6, 4.4, 0.7, 'tankSteel', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -20.5, 15, -26, 5.6, 4.4, 0.7, 'tankSteel', null);
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -20.5, 15, 26, 5.6, 4.4, 0.7, 'tankSteel', null);
    addFurn(furn, F, lm.id, 'cider_tasting_gallery', 'pa_servery', 18, 5.6, 0, -1.57, 0.8);
    addFurn(furn, F, lm.id, 'cider_tasting_gallery', 'generic_wine', 18, 5.6, 5, 0, 0.85);
    addFurn(furn, F, lm.id, 'cider_tasting_gallery', 'generic_fruit_bowl', 18, 5.6, -5, 0, 0.85);
    addFurn(furn, F, lm.id, 'cider_tasting_gallery', 'generic_fruit_pillar_fig', 15, 5.6, -5, 0, 0.85);

    return {
      id: lm.id, lm: lm,
      levels: [
        { storey: 0, name: 'F-1 Cider-Tube Fermentation Vault (y=294.8m)', y0: -5.2, y1: 0.0 },
        { storey: 1, name: 'F0 Rim Winch & Twin-Screw Crush Floor (y=300m)', y0: 0.0, y1: 5.6 },
        { storey: 2, name: 'F1 Press-Master\'s Tasting Gallery (y=305.6m)', y0: 5.6, y1: 16.5 }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  // ----------------------------------------------------------------- 5. 8 Surviving Tenders' Ag-Domes + 4 Quarantined Feral Ag-Domes
  function buildDomesStage4(plan) {
    var slabs = [], walls = [], doors = [], furn = [];

    for (var i = 0; i < plan.specimenDomes.length; i++) {
      var dm = plan.specimenDomes[i];
      var F = makeLocalFrame(dm);
      slabs.push({ storey: 0, y: 0.0, thick: 0.30, mat: 'ancientStone', pts: F.rectPoly(-9.5, 9.5, -9.5, 12.2, 0.0) });
      // Airlock entrance door on +z side (open for Tenders & visitors)
      var dAt = F.ptY(0, 0.0, 12.0);
      doors.push({
        id: 'door_' + dm.id + '_airlock', building: dm.id, storey: 0,
        at: [dAt[0], dAt[1], dAt[2]], yaw: dm.ry,
        w: 2.6, h: 3.0, t: 0.14, preset: 'double', style: 'glazed+pull', open: 1
      });
      addFurn(furn, F, dm.id, 'specimen_conservatory', 'pa_cold_frame', -4.2, 0.4, -2.0, 0, 0.85);
      addFurn(furn, F, dm.id, 'specimen_conservatory', 'voth_planter', 4.2, 0.4, -2.0, 0, 0.85);
      var code = dm.specimenCode || '';
      if (code === 'cloud_mist_tea') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_tea_set', 0, 0.4, 4.5, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_lotus_seed', -1.4, 0.4, 5.2, 0, 0.9);
      } else if (code === 'equatorial_cacao') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_spice_box', 0, 0.4, 4.5, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_cacao', -1.5, 0.4, 5.2, 0, 0.92);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_plantain', 1.5, 0.4, 5.2, 0, 0.88);
      } else if (code === 'highland_volcanic_spice') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_spice_box', 0, 0.4, 4.5, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_juniper', -1.5, 0.4, 5.2, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_ember_plum', 1.5, 0.4, 5.2, 0, 0.9);
      } else if (code === 'dryland_oil_nut') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_whorl_olive', 0, 0.4, 4.5, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_pomegranate', -1.6, 0.4, 5.2, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_pitaya', 1.6, 0.4, 5.2, 0, 0.88);
      } else if (code === 'fibre_dye_latex') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_herb_bundles', 0, 0.4, 4.5, 0, 0.9);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_acacia_pod', 1.5, 0.4, 5.2, 0, 0.88);
      } else if (code === 'earthlike_med_febrifuge') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_medicine', 0, 0.4, 4.5, 0, 0.95);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_bell_pod', 1.5, 0.4, 5.2, 0, 0.92);
      } else if (code === 'earthlike_med_tonics') {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_medicine', 0, 0.4, 4.5, 0, 0.95);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_osmanthus', 1.5, 0.4, 5.2, 0, 0.92);
      } else {
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_medicine', 0, 0.4, 4.5, 0, 0.95);
        addFurn(furn, F, dm.id, 'specimen_conservatory', 'generic_fruit_tower_honey', 1.5, 0.4, 5.2, 0, 0.95);
      }
      if (dm.ordinatorsWatch === 'strict_surveillance') {
        // Sanctuary Dome III (Amber-Sap): Ordinator audit desk right beside the airlock!
        addFurn(furn, F, dm.id, 'ordinator_watch_post', 'generic_writing_supplies', 6.5, 0.0, 8.2, 0, 0.9, 'outdoor');
      }
    }

    // 4 Quarantined Feral Ag-Domes: welded shut & locked bulkhead KDOORs + physical walk blockers around the ring wall
    for (var j = 0; j < plan.feralDomes.length; j++) {
      var fd = plan.feralDomes[j];
      var Ff = makeLocalFrame(fd);
      var fAt = Ff.ptY(0, 0.0, 12.1);
      doors.push({
        id: 'door_' + fd.id + '_quarantine', building: fd.id, storey: 0,
        at: [fAt[0], fAt[1], fAt[2]], yaw: fd.ry,
        w: 3.4, h: 3.4, t: 0.28, preset: 'blastside', style: 'plate', open: 0, locked: true
      });
      // Seal all 4 faces of the ruptured dome ring so walkers cannot step inside the welded bulkhead
      addWallSeg(walls, doors, Ff, fd.id, 0, 'x', -11, 11, -11, 0.0, 3.6, 1.2, 'rustPlate', null);
      addWallSeg(walls, doors, Ff, fd.id, 0, 'x', -11, 11, 11, 0.0, 3.6, 1.2, 'rustPlate', null);
      addWallSeg(walls, doors, Ff, fd.id, 0, 'z', -11, 11, -11, 0.0, 3.6, 1.2, 'rustPlate', null);
      addWallSeg(walls, doors, Ff, fd.id, 0, 'z', -11, 11, 11, 0.0, 3.6, 1.2, 'rustPlate', null);
    }

    return { slabs: slabs, walls: walls, doors: doors, furn: furn };
  }

  function buildStage4Plans(plan) {
    var arc4 = TORUS.buildArcologyStage4(plan);
    var board4 = buildBoardHallSpec(plan);
    var emis4 = buildEmissarySpec(plan);
    var ord4 = buildOrdinatorsSpec(plan);
    var cider4 = buildCiderHallSpec(plan);
    var domes4 = buildDomesStage4(plan);
    return {
      arcology: arc4,
      boardHall: board4,
      emissary: emis4,
      ordinators: ord4,
      ciderHall: cider4,
      landmarks: [board4, emis4, ord4, cider4],
      domes: domes4
    };
  }

  function populateStage4WalkAndDoors(plan, s4, W, D) {
    function addWallBlocks(wRec, tag) {
      if (!wRec.walkBlock) return;
      var c = Math.cos(wRec.ry), s = Math.sin(wRec.ry);
      var longIsX = wRec.w >= wRec.d;
      var L = longIsX ? wRec.w : wRec.d;
      var thin = longIsX ? wRec.d : wRec.w;
      var ux = longIsX ? c : s;
      var uz = longIsX ? -s : c;
      var step = 0.74;
      var n = Math.max(1, Math.ceil(L / step));
      var half = 0.5 * Math.max(0.78, Math.min(thin, 1.3));
      for (var i = 0; i < n; i++) {
        var t = ((i + 0.5) / n - 0.5) * L;
        var bx = wRec.x + ux * t, bz = wRec.z + uz * t;
        W.block([bx - half, bx + half, bz - half, bz + half, wRec.y, wRec.y + wRec.h], tag);
      }
    }

    // 1. Forest Ring Arcology + 10-Level Stepped Terrace Radial Stairs
    var A = s4.arcology;
    for (var i = 0; i < A.slabs.length; i++) {
      var sl = A.slabs[i];
      W.poly({ pts: sl.pts, name: 'arc_L' + sl.level + '_' + sl.kind, tag: 'forest_ring_arcology:L' + sl.level });
    }
    for (var j = 0; j < A.stairs.length; j++) {
      var st = A.stairs[j];
      W.strip({ a: st.a, b: st.b, w: st.w, name: st.id, tag: 'forest_ring_arcology:stair' });
    }
    for (var k = 0; k < A.walls.length; k++) addWallBlocks(A.walls[k], 'forest_ring_arcology:wall');
    for (var d = 0; d < A.doors.length; d++) D.add(A.doors[d]);

    // 2. Hero Floorplanned Landmarks (Board Hall, Vothic Emissary, Ordinator Palace, Great Cider-Press Hall)
    for (var li = 0; li < s4.landmarks.length; li++) {
      var B = s4.landmarks[li];
      for (var si = 0; si < B.slabs.length; si++) {
        var bsl = B.slabs[si];
        W.poly({ pts: bsl.pts, name: B.id + '_S' + bsl.storey, tag: B.id + ':S' + bsl.storey });
      }
      for (var sti = 0; sti < B.stairs.length; sti++) {
        var bst = B.stairs[sti];
        W.strip({ a: bst.a, b: bst.b, w: bst.w, name: bst.id, tag: B.id + ':stair' });
      }
      for (var wi = 0; wi < B.walls.length; wi++) addWallBlocks(B.walls[wi], B.id + ':wall');
      for (var di = 0; di < B.doors.length; di++) D.add(B.doors[di]);
    }

    // 3. Surviving Tenders' Ag-Domes & Quarantined Feral Ag-Domes
    var DM = s4.domes;
    for (var ds = 0; ds < DM.slabs.length; ds++) {
      W.poly({ pts: DM.slabs[ds].pts, name: 'dome_slab_' + ds, tag: 'tender_dome:floor' });
    }
    for (var dw = 0; dw < DM.walls.length; dw++) addWallBlocks(DM.walls[dw], 'feral_dome:wall');
    for (var dd = 0; dd < DM.doors.length; dd++) D.add(DM.doors[dd]);

    D.walk(W);
    D.clearDoorways(W);
    return { floors: W.floors.length, blocks: W.blocks.length, doors: D.list.length };
  }

  TORUS.buildStage4Plans = buildStage4Plans;
  TORUS.populateStage4WalkAndDoors = populateStage4WalkAndDoors;
})(typeof window !== 'undefined' ? window : globalThis);
