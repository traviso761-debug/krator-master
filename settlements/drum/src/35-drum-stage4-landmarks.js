// ================================================================= DRUM — 35: Multi-Storey Landmarks, Market/Quarry & Walk/Door Registry ([G data])
// Pure engine-neutral room-by-room floorplans (F-1..F2), stairs/ramps, KDOOR doors, KFURN placements,
// Scrap-Market & Quarry rigs, and deterministic KWALK + KDOOR population. Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});
  var DEG = Math.PI / 180;

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

  // Helper to emit a slab rectangle with optional rectangular stairwell holes [(hx0,hx1,hz0,hz1), ...]
  function addSlabsWithHoles(out, F, storey, x0, x1, z0, z1, ly, mat, holes) {
    if (!holes || !holes.length) {
      out.push({ storey: storey, y: ly, thick: 0.36, mat: mat, pts: F.rectPoly(x0, x1, z0, z1, ly) });
      return;
    }
    // Slice along z around each hole, then left/right strips in x
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

  // Helper to emit a local wall along X (at fixed lz) or along Z (at fixed lx), with an optional central doorway
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
    // Lintel above doorway
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

  // 2-flight dogleg stair inside a [sx0..sx1, sz0..sz1] shaft (8.0m along z, 6.4m along x)
  function addDoglegStair(slabs, stairs, F, storey, sx0, sz0, y0, y1, idPrefix) {
    var yMid = +(0.5 * (y0 + y1)).toFixed(2);
    // Flight A climbs +z on left half (sx0+1.5, sz0 -> sz0+6.6)
    stairs.push({
      id: idPrefix + '_A', storey: storey,
      a: F.pt(sx0 + 1.5, sz0, y0), b: F.pt(sx0 + 1.5, sz0 + 6.6, yMid), w: 2.6, mat: 'tankSteel'
    });
    // Mid-landing bridging sx0..sx0+6.2, sz0+6.2..sz0+9.2
    slabs.push({
      storey: storey, y: yMid, thick: 0.28, mat: 'tankSteel',
      pts: F.rectPoly(sx0, sx0 + 6.2, sz0 + 6.2, sz0 + 9.2, yMid)
    });
    // Flight B climbs -z on right half (sx0+4.7, sz0+6.6 -> sz0)
    stairs.push({
      id: idPrefix + '_B', storey: storey,
      a: F.pt(sx0 + 4.7, sz0 + 6.6, yMid), b: F.pt(sx0 + 4.7, sz0, y1), w: 2.6, mat: 'tankSteel'
    });
  }

  function addFurn(list, F, bldId, room, key, lx, ly, lz, lry, wealth) {
    var p = F.ptY(lx, ly, lz);
    list.push({
      key: key, x: p[0], y: p[1], z: p[2],
      ry: +(F.lm.ry + (lry == null ? 0 : lry)).toFixed(4),
      building: bldId, room: room, wealth: wealth == null ? 0.55 : wealth, setting: 'indoor'
    });
  }

  function buildGarrisonSpec(plan) {
    var lm = findLm(plan, 'garrison_fortress');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    // Stair shaft at lx=[12..18.4], lz=[-26.2..-16.6] inside Praetorium Keep connecting F-1(-4.5) -> F0(0) -> F1(5.5) -> F2(10.5)
    var hole = [[11.8, 18.4, -26.2, -16.6]];

    // F-1 (-4.5m): Tribute Alloy Vault, Bullion Strongroom, Magazine, Cistern, Deserter Cells
    addSlabsWithHoles(slabs, F, 0, -36, 36, -44, 24, -4.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -36, 36, -44, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -36, 36, 24, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -44, 24, -36, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -44, 24, 36, -4.5, 4.5, 1.2, 'basalt', null);
    // F-1 Spine walls & Vault/Cell doors (clear of stair shaft lz=-26.2..-16.6)
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -36, 36, -30, -4.5, 4.3, 0.7, 'ashStone', { id: 'door_fort_vault_alloy', pos: -12, w: 3.0, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -36, 36, 4, -4.5, 4.3, 0.7, 'ashStone', { id: 'door_fort_cells', pos: -8, w: 2.4, preset: 'single', style: 'grille', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -44, -30, 0, -4.5, 4.3, 0.7, 'ashStone', { id: 'door_fort_bullion', pos: -37, w: 2.2, preset: 'single', style: 'plate', open: 1 });
    addFurn(furn, F, lm.id, 'tribute_vault', 'generic_strongbox', -22, -4.5, -38, 0, 0.9);
    addFurn(furn, F, lm.id, 'tribute_vault', 'pa_pallet_load', -12, -4.5, -38, 0, 0.7);
    addFurn(furn, F, lm.id, 'bullion_vault', 'generic_strongbox', 14, -4.5, -38, 0, 0.95);
    addFurn(furn, F, lm.id, 'ordnance_mag', 'pa_weapon_rack', -26, -4.5, -8, 1.57, 0.7);
    addFurn(furn, F, lm.id, 'deserter_cells', 'pa_prisoner_cage', -22, -4.5, 14, 0, 0.3);
    addFurn(furn, F, lm.id, 'deserter_cells', 'voth_cell_grate', 16, -4.5, 14, 0, 0.35);

    // F0 (0.0m): Curtain Walls, Gatehouse of Purple Diamond (+z=48), Muster Bailey, Barracks, Levy Hall, Governor's Tribunal (-z)
    addSlabsWithHoles(slabs, F, 1, -41, 41, -49, 49, 0.0, 'ashStone', hole);
    // Approach bridge outside F0 Gatehouse (y=0.036m cleanly above streets & collars)
    slabs.push({ storey: -1, approach: true, y: 0.036, thick: 0.38, mat: 'ancientStone', pts: F.rectPoly(-12, 12, 49.02, 62, 0.036) });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -41, 41, 49, 0.0, 9.5, 2.6, 'basalt', { id: 'door_fort_main_portcullis', pos: 0, w: 7.2, h: 4.8, t: 0.45, preset: 'portcullis', style: 'grille', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -41, 41, -49, 0.0, 10.5, 2.6, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -49, 49, -41, 0.0, 9.5, 2.6, 'basalt', { id: 'door_fort_sally', pos: 8, w: 3.4, h: 3.4, t: 0.45, preset: 'blast', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -49, 49, 41, 0.0, 9.5, 2.6, 'basalt', null);
    // West Cohort Barracks & Levy/Assimilation Hall (lx = -41..-22)
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -10, 42, -22, 0.0, 5.2, 0.65, 'ashStone', { id: 'door_fort_levy_hall', pos: 24, w: 3.4, preset: 'double', style: 'panel+pull', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -41, -22, 14, 0.0, 5.2, 0.55, 'ashStone', { id: 'door_fort_barracks_w', pos: -31, w: 2.4, open: 1 });
    // East Cohort Barracks, Armoury & Mess (lx = 22..41)
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -10, 42, 22, 0.0, 5.2, 0.65, 'ashStone', { id: 'door_fort_armoury', pos: 22, w: 3.2, preset: 'double', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', 22, 41, 14, 0.0, 5.2, 0.55, 'ashStone', { id: 'door_fort_mess', pos: 31, w: 2.4, open: 1 });
    // Rear Praetorium Keep & Governor's Tribunal Hall (lz = -49..-10)
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -41, 41, -10, 0.0, 5.4, 1.1, 'ancientStone', { id: 'door_fort_tribunal', pos: 0, w: 4.8, h: 4.0, preset: 'double', style: 'banded', open: 1 });
    addFurn(furn, F, lm.id, 'tribunal_hall', 'pa_chief_throne', 0, 0.6, -41, 0, 0.95);
    addFurn(furn, F, lm.id, 'tribunal_hall', 'voth_court_armour_stand', -7, 0.0, -41, 0, 0.9);
    addFurn(furn, F, lm.id, 'tribunal_hall', 'voth_court_armour_stand', 7, 0.0, -41, 0, 0.9);
    addFurn(furn, F, lm.id, 'tribunal_hall', 'voth_shrine_lantern', -9, 0.0, -24, 0, 0.85);
    addFurn(furn, F, lm.id, 'tribunal_hall', 'voth_shrine_lantern', 9, 0.0, -32, 0, 0.85);
    addFurn(furn, F, lm.id, 'levy_hall', 'pa_shop_counter', -31, 0.0, 28, 1.57, 0.7);
    addFurn(furn, F, lm.id, 'levy_hall', 'generic_writing_supplies', -31, 0.0, 34, 0, 0.7);
    addFurn(furn, F, lm.id, 'barracks_w', 'pa_bunk_stall', -34, 0.0, 2, 1.57, 0.5);
    addFurn(furn, F, lm.id, 'armoury', 'pa_weapon_rack', 34, 0.0, 28, -1.57, 0.7);
    addFurn(furn, F, lm.id, 'armoury', 'pa_helmet_board', 34, 0.0, 20, -1.57, 0.7);
    addFurn(furn, F, lm.id, 'mess_hall', 'voth_bread_oven', 34, 0.0, -2, -1.57, 0.6);
    addFurn(furn, F, lm.id, 'mess_hall', 'pa_long_table', 29, 0.0, 4, 0, 0.55);

    // F1 (5.5m): Keep Upper Deck (War Room, State Dining, Sun Chapel) + Wing Ramparts
    addSlabsWithHoles(slabs, F, 2, -40, 40, -48, -10, 5.5, 'ancientStone', hole);
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(-40, -22, -10, 46, 5.5) });
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(22, 40, -10, 46, 5.5) });
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(-22, 22, 38, 48, 5.5) });
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -36, 36, -10, 5.5, 4.8, 0.8, 'ancientStone', { id: 'door_fort_war_room', pos: 0, w: 3.4, preset: 'double', style: 'glazed+pull', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 2, 'z', -48, -10, -14, 5.5, 4.8, 0.6, 'ashStone', { id: 'door_fort_chapel', pos: -28, w: 2.6, open: 1 });
    addFurn(furn, F, lm.id, 'war_room', 'pa_long_table', -2, 5.5, -28, 0, 0.85);
    addFurn(furn, F, lm.id, 'war_room', 'pa_council_chair', -2, 5.5, -33, 0, 0.85);
    addFurn(furn, F, lm.id, 'sun_chapel', 'voth_shrine_stele', -28, 5.5, -40, 0, 0.9);
    addFurn(furn, F, lm.id, 'sun_chapel', 'voth_shrine_urn', -24, 5.5, -40, 0, 0.85);
    addFurn(furn, F, lm.id, 'infirmary', 'post-apoc_court_cryo_berth', -31, 5.5, 16, 1.57, 0.75);

    // F2 (10.5m): Governor's Private Suite, Cipher Study & Signal Drum Tower Base
    addSlabsWithHoles(slabs, F, 3, -24, 24, -44, -8, 10.5, 'ancientStone', hole);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -24, 24, -44, 10.5, 4.6, 0.8, 'ashStone', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -24, 24, -8, 10.5, 4.6, 0.8, 'ashStone', { id: 'door_fort_gov_terrace', pos: 0, w: 2.8, preset: 'double', style: 'glazed', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -44, -8, -24, 10.5, 4.6, 0.8, 'ashStone', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'z', -44, -8, 24, 10.5, 4.6, 0.8, 'ashStone', null);
    addFurn(furn, F, lm.id, 'cipher_study', 'pa_radio_sets', -14, 10.5, -34, 0, 0.9);
    addFurn(furn, F, lm.id, 'cipher_study', 'pa_battery_bank', -18, 10.5, -34, 0, 0.85);
    addFurn(furn, F, lm.id, 'gov_suite', 'pa_chief_throne', 4, 10.5, -36, 0, 0.9);

    // Roof cap above F2 (y=15.2m) so cutaway slices it cleanly when viewing F2!
    slabs.push({ storey: 3, y: 15.2, thick: 0.45, mat: 'verdigris', pts: F.rectPoly(-25, 25, -45, -7, 15.2) });

    addDoglegStair(slabs, stairs, F, 0, 12.0, -26.0, -4.5, 0.0, 'fort_stair_bm');
    addDoglegStair(slabs, stairs, F, 1, 12.0, -26.0, 0.0, 5.5, 'fort_stair_f0');
    addDoglegStair(slabs, stairs, F, 2, 12.0, -26.0, 5.5, 10.5, 'fort_stair_f1');

    return {
      id: lm.id, lm: lm, F: F, w: lm.w, d: lm.d,
      excavation: { x0: -38, x1: 38, z0: -46, z1: 26, y: -4.6 },
      levels: [
        { y: -4.5, h: 4.5, name: 'F-1 Tribute Vaults & Brig' },
        { y: 0.0, h: 5.5, name: 'F0 Muster Bailey, Levy Hall & Tribunal' },
        { y: 5.5, h: 5.0, name: 'F1 Ramparts, War Room & Sun Chapel' },
        { y: 10.5, h: 10.5, name: 'F2 Governor Suite, Cipher Study & Signal Drum' }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  function buildOrdinatorSpec(plan) {
    var lm = findLm(plan, 'ordinator_fortress');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    var hole = [[9.6, 16.2, -23.2, -13.6]];

    // F-1 (-4.5m): The Quiet Vaults (Rebel Cells, Sealed History-Monk Cell, Questioning Chambers, Confiscated Ancient Devices)
    addSlabsWithHoles(slabs, F, 0, -28, 28, -32, 22, -4.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -28, 28, -32, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -28, 28, 22, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -32, 22, -28, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -32, 22, 28, -4.5, 4.5, 1.2, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -28, 28, -25, -4.5, 4.3, 0.7, 'ashStone', { id: 'door_ord_ancient_vault', pos: -10, w: 2.6, preset: 'blast', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -28, 28, 6, -4.5, 4.3, 0.7, 'ashStone', { id: 'door_ord_quiet_cells', pos: -6, w: 2.4, preset: 'single', style: 'grille', open: 1 });
    addFurn(furn, F, lm.id, 'ancient_devices_vault', 'post-apoc_court_cryo_berth', -18, -4.5, -29, 0, 0.85);
    addFurn(furn, F, lm.id, 'ancient_devices_vault', 'pa_battery_bank', -8, -4.5, -29, 0, 0.85);
    addFurn(furn, F, lm.id, 'ancient_devices_vault', 'pa_radio_sets', 2, -4.5, -29, 0, 0.85);
    addFurn(furn, F, lm.id, 'questioning_chamber', 'pa_stocks', -18, -4.5, -3, 0, 0.4);
    addFurn(furn, F, lm.id, 'questioning_chamber', 'pa_drum_cage', -8, -4.5, -3, 0, 0.4);
    addFurn(furn, F, lm.id, 'rebel_cells', 'pa_prisoner_cage', -18, -4.5, 14, 0, 0.3);
    addFurn(furn, F, lm.id, 'history_monk_cell', 'voth_ossuary_shelves', 18, -4.5, 14, -1.57, 0.6);

    // F0 (0.0m): Iron-Drum Gatehouse, Whispering Vestibule, Cloister of Ash, Hall of Scrutinies, Dormitories
    addSlabsWithHoles(slabs, F, 1, -31, 31, -35, 35, 0.0, 'ashStone', hole);
    slabs.push({ storey: -1, approach: true, y: 0.036, thick: 0.38, mat: 'ancientStone', pts: F.rectPoly(-10, 10, 35.02, 46, 0.036) });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -31, 31, 35, 0.0, 10.0, 2.4, 'basalt', { id: 'door_ord_iron_gate', pos: 0, w: 5.6, h: 4.4, t: 0.45, preset: 'blastside', style: 'plate', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -31, 31, -35, 0.0, 10.0, 2.4, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -35, 35, -31, 0.0, 10.0, 2.4, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -35, 35, 31, 0.0, 10.0, 2.4, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -8, 30, -16, 0.0, 5.2, 0.6, 'ashStone', { id: 'door_ord_scrutinies', pos: 12, w: 2.8, preset: 'double', style: 'banded', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'z', -8, 30, 16, 0.0, 5.2, 0.6, 'ashStone', { id: 'door_ord_dorm', pos: 12, w: 2.6, open: 1 });
    addWallSeg(walls, doors, F, lm.id, 1, 'x', -31, 31, -8, 0.0, 5.2, 0.8, 'basalt', { id: 'door_ord_cloister_sanctum', pos: 0, w: 3.6, preset: 'double', style: 'banded', open: 1 });
    addFurn(furn, F, lm.id, 'cloister_of_ash', 'voth_common_ash_niche', -8, 0.0, 18, 0, 0.8);
    addFurn(furn, F, lm.id, 'cloister_of_ash', 'voth_shrine_urn', 8, 0.0, 18, 0, 0.8);
    addFurn(furn, F, lm.id, 'hall_of_scrutinies', 'pa_chief_throne', -24, 0.0, 6, 1.57, 0.85);
    addFurn(furn, F, lm.id, 'hall_of_scrutinies', 'pa_shop_counter', -22, 0.0, 16, 1.57, 0.75);
    addFurn(furn, F, lm.id, 'ordinator_armoury', 'voth_court_armour_stand', 24, 0.0, 22, -1.57, 0.9);
    addFurn(furn, F, lm.id, 'ordinator_dorm', 'pa_bunk_stall', 24, 0.0, 4, -1.57, 0.6);

    // F1 (5.5m): Hall of the Rolls of Drum (13,500 Dossiers), Censors' Scriptorium, Parabolic-Dish Chapel of the Sun
    addSlabsWithHoles(slabs, F, 2, -30, 30, -34, 34, 5.5, 'ancientStone', hole);
    addWallSeg(walls, doors, F, lm.id, 2, 'x', -30, 30, 4, 5.5, 4.8, 0.7, 'ashStone', { id: 'door_ord_rolls_hall', pos: 0, w: 3.4, preset: 'double', style: 'glazed+pull', open: 1 });
    addFurn(furn, F, lm.id, 'hall_of_rolls', 'voth_ossuary_shelves', -20, 5.5, 14, 0, 0.85);
    addFurn(furn, F, lm.id, 'hall_of_rolls', 'voth_ossuary_shelves', -10, 5.5, 14, 0, 0.85);
    addFurn(furn, F, lm.id, 'hall_of_rolls', 'voth_ossuary_shelves', 10, 5.5, 14, 0, 0.85);
    addFurn(furn, F, lm.id, 'hall_of_rolls', 'voth_ossuary_shelves', 20, 5.5, 14, 0, 0.85);
    addFurn(furn, F, lm.id, 'censors_scriptorium', 'generic_writing_supplies', -16, 5.5, 24, 0, 0.8);
    addFurn(furn, F, lm.id, 'parabolic_sun_chapel', 'voth_shrine_stele', 0, 5.5, -24, 0, 0.95);
    addFurn(furn, F, lm.id, 'parabolic_sun_chapel', 'voth_shrine_lantern', -6, 5.5, -20, 0, 0.9);
    addFurn(furn, F, lm.id, 'parabolic_sun_chapel', 'voth_shrine_lantern', 6, 5.5, -28, 0, 0.9);

    // F2 (10.5m): Twin High-Watch Steel Drums & Solar Observatory Deck
    addSlabsWithHoles(slabs, F, 3, -22, 22, -28, 2, 10.5, 'tankSteel', hole);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -22, 22, -28, 10.5, 1.2, 0.45, 'tankSteel', null);
    addWallSeg(walls, doors, F, lm.id, 3, 'x', -22, 22, 2, 10.5, 1.2, 0.45, 'tankSteel', null);
    addFurn(furn, F, lm.id, 'high_watch_deck', 'pa_radio_sets', -14, 10.5, -18, 0, 0.85);

    addDoglegStair(slabs, stairs, F, 0, 9.8, -23.0, -4.5, 0.0, 'ord_stair_bm');
    addDoglegStair(slabs, stairs, F, 1, 9.8, -23.0, 0.0, 5.5, 'ord_stair_f0');
    addDoglegStair(slabs, stairs, F, 2, 9.8, -23.0, 5.5, 10.5, 'ord_stair_f1');

    return {
      id: lm.id, lm: lm, F: F, w: lm.w, d: lm.d,
      excavation: { x0: -30, x1: 30, z0: -34, z1: 24, y: -4.6 },
      levels: [
        { y: -4.5, h: 4.5, name: 'F-1 The Quiet Vaults & Confiscated Tech' },
        { y: 0.0, h: 5.5, name: 'F0 Cloister of Ash & Hall of Scrutinies' },
        { y: 5.5, h: 5.0, name: 'F1 Hall of the Rolls & Parabolic Sun Chapel' },
        { y: 10.5, h: 7.0, name: 'F2 High-Watch Steel Drums & Solar Lantern' }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  function buildArenaSpec(plan) {
    var lm = findLm(plan, 'gladiatorial_arena');
    var F = makeLocalFrame(lm);
    var slabs = [], walls = [], stairs = [], doors = [], furn = [];
    // Stair shaft at lx=[21.8..28.4], lz=[19.8..29.4] cleanly surrounded by F-1, F0, and F1 concourses
    var hole = [[21.8, 28.4, 19.8, 29.4]];

    // F-1 (-4.5m): The Hypogeum — Central Counterweight Pit-Lift, Ludus, Scyvoi Cells, Beast Pens, Chirurgeon, Spoliarium
    addSlabsWithHoles(slabs, F, 0, -38, 38, -28, 31, -4.5, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -38, 38, -28, -4.5, 4.5, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -38, 38, 31, -4.5, 4.5, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -28, 31, -38, -4.5, 4.5, 1.1, 'basalt', null);
    addWallSeg(walls, doors, F, lm.id, 0, 'z', -28, 31, 38, -4.5, 4.5, 1.1, 'basalt', null);
    // Hypogeum cell & beast pen partitions (leaving central lx=-26..26, lz=-7..7 clear for Ramps & Pit-Lift!)
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -24, 20, 10, -4.5, 4.2, 0.55, 'rustPlate', { id: 'door_arena_ludus', pos: -10, w: 2.6, preset: 'single', style: 'grille', open: 1 });
    addWallSeg(walls, doors, F, lm.id, 0, 'x', -24, 20, -10, -4.5, 4.2, 0.55, 'rustPlate', { id: 'door_arena_beast_pens', pos: 8, w: 2.8, preset: 'portcullis', style: 'grille', open: 1 });
    addFurn(furn, F, lm.id, 'ludus_bunks', 'pa_bunk_stall', -18, -4.5, 20, 0, 0.45);
    addFurn(furn, F, lm.id, 'arena_armoury', 'pa_weapon_rack', -6, -4.5, 22, 0, 0.55);
    addFurn(furn, F, lm.id, 'arena_armoury', 'pa_spear_drum', 2, -4.5, 20, 0, 0.5);
    addFurn(furn, F, lm.id, 'scyvoi_cells', 'pa_prisoner_cage', 12, -4.5, 20, 0, 0.3);
    addFurn(furn, F, lm.id, 'beast_pens', 'pa_drum_cage', 12, -4.5, -20, 0, 0.35);
    addFurn(furn, F, lm.id, 'beast_pens', 'pa_drum_cage', 2, -4.5, -20, 0, 0.35);
    addFurn(furn, F, lm.id, 'chirurgeon', 'post-apoc_court_cryo_berth', -16, -4.5, -20, 0, 0.5);
    addFurn(furn, F, lm.id, 'chirurgeon', 'generic_medicine', -10, -4.5, -20, 0, 0.5);
    addFurn(furn, F, lm.id, 'spoliarium', 'voth_sarcophagus', -28, -4.5, -20, 1.57, 0.4);

    // West Champions' Ramp (lx = -34 -> -18, y = -4.5 -> 0.0) & East Corpse Ramp (lx = 34 -> 18, y = -4.5 -> 0.0)
    stairs.push({ id: 'arena_ramp_sun', storey: 0, a: F.pt(-34.0, 0, -4.5), b: F.pt(-18.0, 0, 0.0), w: 4.2, mat: 'sand' });
    stairs.push({ id: 'arena_ramp_ash', storey: 0, a: F.pt(34.0, 0, -4.5), b: F.pt(18.0, 0, 0.0), w: 4.2, mat: 'sand' });

    // F0 (0.0m): Blood-Sand Pit (-18..18 x -14..14) + Outer Concourse Ring (Bookmakers, Cookshops, Taproom, Gates)
    // Central sand floor (leaving narrow ramp slots at lx=-34..-18, lz=-2.2..2.2 and lx=18..34, lz=-2.2..2.2!)
    slabs.push({ storey: 1, y: 0.0, thick: 0.35, mat: 'sand', pts: F.rectPoly(-18.2, 18.2, -15.0, 15.0, 0.0) });
    // North & South concourse decks + West & East gate decks + approach apron
    addSlabsWithHoles(slabs, F, 1, -42, 42, 15.0, 36, 0.0, 'ashStone', hole);
    slabs.push({ storey: -1, approach: true, y: 0.036, thick: 0.38, mat: 'ancientStone', pts: F.rectPoly(-16, 16, 36.02, 48, 0.036) });
    slabs.push({ storey: 1, y: 0.0, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(-42, 42, -36, -15.0, 0.0) });
    slabs.push({ storey: 1, y: 0.0, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(-46, -34.2, -15.0, 15.0, 0.0) });
    slabs.push({ storey: 1, y: 0.0, thick: 0.36, mat: 'ashStone', pts: F.rectPoly(34.2, 46, -15.0, 15.0, 0.0) });
    // Gate of the Sun (West, lx=-38) & Gate of Ash (East, lx=+38) + North/South public entrances
    doors.push({
      id: 'door_arena_gate_sun', building: lm.id, storey: 1,
      at: F.ptY(-38.0, 0.0, 0.0), yaw: F.lm.ry + 0.5 * Math.PI,
      w: 5.4, h: 4.2, t: 0.16, preset: 'portcullis', style: 'grille', open: 1
    });
    doors.push({
      id: 'door_arena_gate_ash', building: lm.id, storey: 1,
      at: F.ptY(38.0, 0.0, 0.0), yaw: F.lm.ry + 0.5 * Math.PI,
      w: 5.4, h: 4.2, t: 0.16, preset: 'portcullis', style: 'grille', open: 1
    });
    addFurn(furn, F, lm.id, 'bookmakers_arcade', 'pa_shop_counter', -14, 0.0, 26, 0, 0.6);
    addFurn(furn, F, lm.id, 'beetle_cookshop', 'pa_brick_grill', 4, 0.0, -26, 0, 0.5);
    addFurn(furn, F, lm.id, 'cactus_taproom', 'generic_barrel', -14, 0.0, -26, 0, 0.5);
    addFurn(furn, F, lm.id, 'cactus_taproom', 'pa_long_table', -8, 0.0, -26, 0, 0.5);

    // F1 (5.5m): Upper Bleacher Concourse, Governor's Tank-Head Box (+z), Guild Container Loggia (-z), Ordinator Box
    addSlabsWithHoles(slabs, F, 2, -40, 40, 15.0, 37, 5.5, 'timber', hole);
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'timber', pts: F.rectPoly(-40, 40, -37, -20.0, 5.5) });
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'timber', pts: F.rectPoly(-42, -24, -20.0, 15.0, 5.5) });
    slabs.push({ storey: 2, y: 5.5, thick: 0.36, mat: 'timber', pts: F.rectPoly(24, 42, -20.0, 15.0, 5.5) });
    addFurn(furn, F, lm.id, 'governors_box', 'pa_chief_throne', 0, 5.5, 31, 3.14, 0.95);
    addFurn(furn, F, lm.id, 'governors_box', 'voth_shrine_lantern', -5, 5.5, 31, 0, 0.9);
    addFurn(furn, F, lm.id, 'governors_box', 'voth_shrine_lantern', 5, 5.5, 31, 0, 0.9);
    addFurn(furn, F, lm.id, 'guild_loggia', 'pa_council_chair', 0, 5.5, -30, 0, 0.75);

    addDoglegStair(slabs, stairs, F, 0, 22.0, 20.0, -4.5, 0.0, 'arena_stair_bm');
    addDoglegStair(slabs, stairs, F, 1, 22.0, 20.0, 0.0, 5.5, 'arena_stair_f0');

    return {
      id: lm.id, lm: lm, F: F, w: lm.w, d: lm.d,
      excavation: { x0: -40, x1: 40, z0: -30, z1: 33, y: -4.6 },
      levels: [
        { y: -4.5, h: 4.5, name: 'F-1 The Hypogeum, Pit-Lift & Beast Cages' },
        { y: 0.0, h: 5.5, name: 'F0 Blood-Sand Clarifier Pit & Concourse' },
        { y: 5.5, h: 11.5, name: 'F1 Split-Tank Bleachers & Governor Box' }
      ],
      slabs: slabs, walls: walls, stairs: stairs, doors: doors, furn: furn
    };
  }

  function buildMarketAndQuarrySpec(plan) {
    var rng = KRAND.stream(KRAND.child(plan.seed, 'drum_stage4_mkt_qry'));
    var stalls = [], gantries = [], furn = [];
    // Regional Scrap-Market stalls along radial market avenues (deg = 58..82, r = 242..498, skipping W1 r=392..414)
    var mRadii = [248, 294, 344, 430, 468];
    for (var mi = 0; mi < mRadii.length; mi++) {
      var mr = mRadii[mi];
      for (var md = 60; md <= 80; md += 5) {
        var a = md * DEG;
        var sx = +(mr * Math.cos(a)).toFixed(2), sz = +(mr * Math.sin(a)).toFixed(2);
        var syaw = -(a) + 0.5 * Math.PI;
        // Skip if colliding with Bourse Rotunda or Voth Market Hall
        var bourse = findLm(plan, 'scrap_market_rotunda'), vhall = findLm(plan, 'scrap_market_voth_hall');
        if (bourse && Math.hypot(sx - bourse.x, sz - bourse.z) < 22) continue;
        if (vhall && Math.hypot(sx - vhall.x, sz - vhall.z) < 22) continue;
        stalls.push({ x: sx, y: 0, z: sz, ry: syaw, w: 7.2, d: 4.6, h: 3.6, shade: (mi + md) % 2 === 0 });
        furn.push({
          key: (mi + md) % 3 === 0 ? 'pa_lean_to_stall' : ((mi + md) % 3 === 1 ? 'pa_market_table' : 'pa_pallet_load'),
          x: sx, y: 0, z: sz, ry: syaw, building: 'scrap_market_rotunda', room: 'regional_scrap_market', wealth: 0.5, setting: 'outdoor'
        });
      }
    }
    // ENE Collapse Quarry salvage crane gantries & cutting yards (deg = 8..32, r = 240..440)
    var qSpots = [[252, 16], [308, 24], [368, 14], [426, 22]];
    for (var qi = 0; qi < qSpots.length; qi++) {
      var qr = qSpots[qi][0], qd = qSpots[qi][1], qa = qd * DEG;
      var qx = +(qr * Math.cos(qa)).toFixed(2), qz = +(qr * Math.sin(qa)).toFixed(2);
      var qyaw = -qa;
      gantries.push({ x: qx, y: 0, z: qz, ry: qyaw, span: 16.0, h: 13.5, len: 22.0 });
      furn.push({ key: 'pa_scrap_bin', x: +(qx + 4 * Math.sin(qa)).toFixed(2), y: 0, z: +(qz - 4 * Math.cos(qa)).toFixed(2), ry: rng.range(0, 6.28), building: 'quarry_salvage_foundry', room: 'collapse_quarry', wealth: 0.4, setting: 'outdoor' });
      furn.push({ key: 'pa_hand_cart', x: +(qx - 4 * Math.sin(qa)).toFixed(2), y: 0, z: +(qz + 4 * Math.cos(qa)).toFixed(2), ry: qyaw, building: 'quarry_salvage_foundry', room: 'collapse_quarry', wealth: 0.4, setting: 'outdoor' });
    }
    return { stalls: stalls, gantries: gantries, furn: furn };
  }

  function buildStage4Plans(plan) {
    var arc4 = DRUM.buildArcologyStage4(plan);
    var fort4 = buildGarrisonSpec(plan);
    var ord4 = buildOrdinatorSpec(plan);
    var arena4 = buildArenaSpec(plan);
    var mq4 = buildMarketAndQuarrySpec(plan);
    return {
      arcology: arc4,
      garrison: fort4,
      ordinator: ord4,
      arena: arena4,
      landmarks: [fort4, ord4, arena4],
      marketQuarry: mq4
    };
  }

  // Deterministic registration of Stage 4 floors, stairs/ramps, wall blockers, and KDOOR doors into KWALK + KDOOR
  function populateStage4WalkAndDoors(plan, s4, W, D) {
    function addWallBlocks(wRec, tag) {
      if (!wRec.walkBlock) return;
      var c = Math.cos(wRec.ry), s = Math.sin(wRec.ry);
      var longIsX = wRec.w >= wRec.d;
      var L = longIsX ? wRec.w : wRec.d;
      var thin = longIsX ? wRec.d : wRec.w;
      var ux = longIsX ? c : s;
      var uz = longIsX ? -s : c;
      var step = 0.72;
      var n = Math.max(1, Math.ceil(L / step));
      var half = 0.5 * Math.max(0.78, Math.min(thin, 1.3));
      for (var i = 0; i < n; i++) {
        var t = ((i + 0.5) / n - 0.5) * L;
        var bx = wRec.x + ux * t, bz = wRec.z + uz * t;
        W.block([bx - half, bx + half, bz - half, bz + half, wRec.y, wRec.y + wRec.h], tag);
      }
    }

    // 1. Arcology slabs, stairs, walls & doors
    var A = s4.arcology;
    for (var i = 0; i < A.slabs.length; i++) {
      var sl = A.slabs[i];
      W.poly({ pts: sl.walkPts || sl.pts, name: 'arc_L' + sl.level + '_' + sl.kind, tag: 'drum_arcology:L' + sl.level });
    }
    for (var j = 0; j < A.stairs.length; j++) {
      var st = A.stairs[j];
      W.strip({ a: st.a, b: st.b, w: st.w, name: st.id, tag: 'drum_arcology:stair' });
    }
    for (var k = 0; k < A.walls.length; k++) addWallBlocks(A.walls[k], 'drum_arcology:wall');
    for (var d = 0; d < A.doors.length; d++) D.add(A.doors[d]);

    // 2. Hero Landmarks (Garrison Fortress, Ordinator Fortress, Gladiatorial Arena)
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

    D.walk(W);
    D.clearDoorways(W);
    return { floors: W.floors.length, blocks: W.blocks.length, doors: D.list.length };
  }

  DRUM.buildStage4Plans = buildStage4Plans;
  DRUM.populateStage4WalkAndDoors = populateStage4WalkAndDoors;
})(typeof window !== 'undefined' ? window : globalThis);
