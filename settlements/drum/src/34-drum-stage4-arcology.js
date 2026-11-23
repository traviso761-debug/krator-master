// ================================================================= DRUM — 34: Arcology Levels 1-15 Subdivided Floorplan ([G data])
// Pure engine-neutral 3D interior slabs, stairwell voids, 4 Fin dogleg stairs, subdivided multi-apartment & multi-workshop
// partition walls, KDOOR records, built-in architectural room fixtures, and KFURN placements across Levels 1-15 (y = 0..66 m).
// Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});
  var DEG = Math.PI / 180;

  function normDeg(d) {
    var x = d % 360;
    return x < 0 ? x + 360 : x;
  }

  function angDiff(a, b) {
    var d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  // Polar + tangential helper: point at radius r along azimuth deg, shifted tangentially by off (+theta)
  function cPt(r, deg, off, y) {
    var a = deg * DEG;
    var ca = Math.cos(a), sa = Math.sin(a);
    return [
      +(r * ca - off * sa).toFixed(2),
      +(r * sa + off * ca).toFixed(2),
      +(y == null ? 0 : y).toFixed(2)
    ];
  }

  function pushBoxList(arr, mat, r, deg, off, y, w, h, d, ry) {
    var p = cPt(r, deg, off, y);
    arr.push({
      mat: mat,
      x: p[0],
      y: p[2],
      z: p[1],
      w: +w.toFixed(2),
      h: +h.toFixed(2),
      d: +d.toFixed(2),
      ry: +(ry == null ? 0 : ry).toFixed(4)
    });
  }

  // Emits a wall running tangentially at radius r from off0 to off1, with optional open doorway [dCenter, dWidth]
  function addTangentialWall(walls, lv, r, bDeg, off0, off1, y0, h, thick, mat, doorAt, doorW, collide) {
    var bYaw = -(bDeg * DEG) + 0.5 * Math.PI;
    var lo = Math.min(off0, off1), hi = Math.max(off0, off1);
    var blk = collide == null ? (h >= 0.9) : !!collide;
    if (hi - lo <= 0.2) return;
    if (doorAt == null) {
      var mid = 0.5 * (lo + hi);
      var p = cPt(r, bDeg, mid, y0);
      walls.push({
        level: lv, x: p[0], y: y0, z: p[1], ry: bYaw,
        w: +(hi - lo).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
      return;
    }
    var dw = doorW == null ? 2.0 : doorW;
    var dh = 2.75;
    var d0 = doorAt - 0.5 * dw, d1 = doorAt + 0.5 * dw;
    if (d0 - lo > 0.2) {
      var pL = cPt(r, bDeg, 0.5 * (lo + d0), y0);
      walls.push({
        level: lv, x: pL[0], y: y0, z: pL[1], ry: bYaw,
        w: +(d0 - lo).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
    }
    if (hi - d1 > 0.2) {
      var pR = cPt(r, bDeg, 0.5 * (d1 + hi), y0);
      walls.push({
        level: lv, x: pR[0], y: y0, z: pR[1], ry: bYaw,
        w: +(hi - d1).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
    }
    if (h - dh > 0.2) {
      var pTop = cPt(r, bDeg, doorAt, y0 + dh);
      walls.push({
        level: lv, x: pTop[0], y: +(y0 + dh).toFixed(2), z: pTop[1], ry: bYaw,
        w: dw, h: +(h - dh).toFixed(2), d: thick, mat: mat, walkBlock: false
      });
    }
  }

  // Emits a wall running radially along fixed tangential offset `off` from r0 to r1, with optional doorway at rDoor
  function addRadialOffsetWall(walls, lv, bDeg, off, r0, r1, y0, h, thick, mat, rDoor, doorW, collide) {
    var rYaw = -(bDeg * DEG);
    var lo = Math.min(r0, r1), hi = Math.max(r0, r1);
    var blk = collide == null ? (h >= 0.9) : !!collide;
    if (hi - lo <= 0.2) return;
    if (rDoor == null) {
      var mid = 0.5 * (lo + hi);
      var p = cPt(mid, bDeg, off, y0);
      walls.push({
        level: lv, x: p[0], y: y0, z: p[1], ry: rYaw,
        w: +(hi - lo).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
      return;
    }
    var dw = doorW == null ? 2.0 : doorW;
    var dh = 2.75;
    var d0 = rDoor - 0.5 * dw, d1 = rDoor + 0.5 * dw;
    if (d0 - lo > 0.2) {
      var pA = cPt(0.5 * (lo + d0), bDeg, off, y0);
      walls.push({
        level: lv, x: pA[0], y: y0, z: pA[1], ry: rYaw,
        w: +(d0 - lo).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
    }
    if (hi - d1 > 0.2) {
      var pB = cPt(0.5 * (d1 + hi), bDeg, off, y0);
      walls.push({
        level: lv, x: pB[0], y: y0, z: pB[1], ry: rYaw,
        w: +(hi - d1).toFixed(2), h: h, d: thick, mat: mat, walkBlock: blk
      });
    }
    if (h - dh > 0.2) {
      var pTop = cPt(rDoor, bDeg, off, y0 + dh);
      walls.push({
        level: lv, x: pTop[0], y: +(y0 + dh).toFixed(2), z: pTop[1], ry: rYaw,
        w: dw, h: +(h - dh).toFixed(2), d: thick, mat: mat, walkBlock: false
      });
    }
  }

  // Built-in architectural Vinvolk 2-tier double bunk alcove (frame + lower & upper berths)
  function addDoubleBunkSet(fixtures, r, bDeg, off, y0, yaw) {
    pushBoxList(fixtures, 'tankSteel', r, bDeg, off, y0, 2.18, 2.05, 0.12, yaw);
    pushBoxList(fixtures, 'canvas', r, bDeg, off, y0 + 0.44, 2.02, 0.22, 0.94, yaw);
    pushBoxList(fixtures, 'canvas', r, bDeg, off, y0 + 1.40, 2.02, 0.22, 0.94, yaw);
  }

  // Built-in apartment hearth stove + flue rising cleanly into slab soffit + table & twin benches + wall locker
  function addApartmentFixtures(fixtures, rMid, bDeg, offMid, sign, y0, bYaw, roomH) {
    var rYaw = -(bDeg * DEG);
    // Two 2-tier bunk alcoves along rear/outer wall (4 sleeping berths per apartment!)
    addDoubleBunkSet(fixtures, rMid - 3.6, bDeg, offMid + sign * 2.1, y0, bYaw);
    addDoubleBunkSet(fixtures, rMid + 3.6, bDeg, offMid + sign * 2.1, y0, bYaw);
    // Central communal/family table + twin benches
    pushBoxList(fixtures, 'timber', rMid, bDeg, offMid - sign * 0.4, y0, 2.4, 0.78, 1.05, bYaw);
    pushBoxList(fixtures, 'timber', rMid, bDeg, offMid - sign * 1.25, y0, 2.2, 0.44, 0.38, bYaw);
    pushBoxList(fixtures, 'timber', rMid, bDeg, offMid + sign * 0.45, y0, 2.2, 0.44, 0.38, bYaw);
    // Sheet-metal box stove + flue pipe rising to ceiling slab
    pushBoxList(fixtures, 'rustPlate', rMid - 4.2, bDeg, offMid - sign * 1.8, y0, 0.75, 0.85, 0.75, bYaw);
    pushBoxList(fixtures, 'tankSteel', rMid - 4.2, bDeg, offMid - sign * 1.8, y0 + 0.85, 0.22, roomH - 0.85, 0.22, bYaw);
    // Tall riveted storage locker / shelving rack
    pushBoxList(fixtures, 'tankSteel', rMid + 4.4, bDeg, offMid - sign * 1.7, y0, 0.65, 2.05, 1.8, rYaw);
    // Warm ceiling strip lamp
    pushBoxList(fixtures, 'warmGlow', rMid, bDeg, offMid, y0 + roomH - 0.16, 1.8, 0.12, 0.36, bYaw);
  }

  // Built-in trade / salvage / workshop / mushroom bay architectural fixtures
  function addWorkRoomFixtures(fixtures, role, rMid, bDeg, offMid, sign, y0, bYaw, roomH) {
    var rYaw = -(bDeg * DEG);
    pushBoxList(fixtures, 'warmGlow', rMid, bDeg, offMid, y0 + roomH - 0.16, 2.2, 0.14, 0.42, bYaw);
    if (role === 'mushroom_vat_vault') {
      // 3 parallel dark-vault limestone & timber mushroom cultivation troughs
      for (var t = -1; t <= 1; t++) {
        pushBoxList(fixtures, 'ancientDark', rMid + t * 3.4, bDeg, offMid, y0, 3.6, 0.68, 1.35, bYaw);
        pushBoxList(fixtures, 'verdigris', rMid + t * 3.4, bDeg, offMid, y0 + 0.68, 3.3, 0.18, 1.15, bYaw);
      }
    } else if (role === 'fin_workshop') {
      // Brick/steel forge hearth + glowing coal bed + 2 iron stanchion posts supporting exhaust hood + workbench + parts rack
      pushBoxList(fixtures, 'basalt', rMid - 3.6, bDeg, offMid + sign * 1.8, y0, 1.8, 1.15, 1.4, bYaw);
      pushBoxList(fixtures, 'warmGlow', rMid - 3.6, bDeg, offMid + sign * 1.8, y0 + 1.15, 1.1, 0.10, 0.9, bYaw);
      pushBoxList(fixtures, 'tankSteel', rMid - 4.35, bDeg, offMid + sign * 1.8, y0 + 1.15, 0.16, 0.78, 1.25, bYaw);
      pushBoxList(fixtures, 'tankSteel', rMid - 2.85, bDeg, offMid + sign * 1.8, y0 + 1.15, 0.16, 0.78, 1.25, bYaw);
      pushBoxList(fixtures, 'rustPlate', rMid - 3.6, bDeg, offMid + sign * 1.8, y0 + 1.9, 2.0, roomH - 1.9, 1.5, bYaw);
      pushBoxList(fixtures, 'timber', rMid + 1.8, bDeg, offMid + sign * 1.6, y0, 3.4, 0.88, 0.95, bYaw);
      pushBoxList(fixtures, 'tankSteel', rMid + 4.4, bDeg, offMid - sign * 1.5, y0, 0.75, 2.2, 2.4, rYaw);
    } else if (role === 'bonded_alloy_vault' || role === 'bonded_warehouse') {
      // Heavy 2-tier steel pallet racks & alloy ingot/drum stacks
      for (var rk = -1; rk <= 1; rk += 2) {
        pushBoxList(fixtures, 'tankSteel', rMid + rk * 2.8, bDeg, offMid + sign * 0.6, y0, 3.8, 2.4, 1.1, bYaw);
        pushBoxList(fixtures, 'rustPlate', rMid + rk * 2.8, bDeg, offMid + sign * 0.6, y0 + 0.2, 3.4, 0.75, 0.9, bYaw);
        pushBoxList(fixtures, 'bronze', rMid + rk * 2.8, bDeg, offMid + sign * 0.6, y0 + 1.35, 3.2, 0.65, 0.85, bYaw);
      }
    } else if (role === 'communal_mess_bakehouse') {
      // Twin long mess tables + benches + masonry oven hood
      for (var mt = -1; mt <= 1; mt += 2) {
        pushBoxList(fixtures, 'timber', rMid + mt * 2.6, bDeg, offMid, y0, 3.8, 0.78, 1.05, bYaw);
        pushBoxList(fixtures, 'timber', rMid + mt * 2.6, bDeg, offMid - 0.82, y0, 3.6, 0.44, 0.36, bYaw);
        pushBoxList(fixtures, 'timber', rMid + mt * 2.6, bDeg, offMid + 0.82, y0, 3.6, 0.44, 0.36, bYaw);
      }
      pushBoxList(fixtures, 'porphyry', rMid - 4.4, bDeg, offMid + sign * 1.9, y0, 2.1, roomH - 0.2, 1.5, bYaw);
    } else {
      // Salvage Bourse / Ancient-Parts Exchange / Tribute Assay shop booth: L-counter + display shelves + canopy
      pushBoxList(fixtures, 'timber', rMid, bDeg, offMid - sign * 1.2, y0, 3.6, 0.96, 0.82, bYaw);
      pushBoxList(fixtures, 'tankSteel', rMid - 3.2, bDeg, offMid + sign * 1.8, y0, 3.4, 2.25, 0.68, bYaw);
      pushBoxList(fixtures, 'rustPlate', rMid + 3.0, bDeg, offMid + sign * 1.6, y0, 2.4, 1.1, 1.2, bYaw);
    }
  }

  function buildArcologyStage4(plan) {
    var arc = plan.arcology;
    var rng = KRAND.stream(KRAND.child(plan.seed, 'drum_stage4_arc_v2'));
    var slabs = [];
    var stairs = [];
    var walls = [];
    var doors = [];
    var furn = [];
    var fixtures = [];
    var props = [];

    var R_PIT = 18.0;
    var R_GAL = 40.0;
    var R_CORE = 83.4;
    var R_BAY_OUT = 108.0; // Enclosed fin-to-fin buttress block radius (grounded y=-0.95m .. +66.0m, inside RF(y)>=104..196m!)
    var ROOM_H = 4.04;     // 4.04m wall + 0.36m slab above = 4.40m storeyH (zero gap at ceiling!)

    // 1. Grounded Vaulted Buttress Forecourts (r = 107..226m) & Grounded Portal Gatehouses (r = 108m) at L1 (y = 0 m)
    for (var pi = 0; pi < arc.portals.length; pi++) {
      var prt = arc.portals[pi];
      var pDeg = prt.deg;
      var pYaw = -(pDeg * DEG) + 0.5 * Math.PI;

      // Deep grounded forecourt flagstone apron (3D pts start at r=108.05 outside bay_block for zero Z-fighting; walkPts bridge r=106.5 doorway!)
      slabs.push({
        level: 1, kind: 'portal_avenue', bay: prt.bay, mat: 'boursePave', thick: 0.85, y: 0.012,
        pts: [
          cPt(108.05, pDeg, -20.5, 0.012),
          cPt(226.0, pDeg, -14.5, 0.012),
          cPt(226.0, pDeg, 14.5, 0.012),
          cPt(108.05, pDeg, 20.5, 0.012)
        ],
        walkPts: [
          cPt(106.5, pDeg, -20.5, 0),
          cPt(226.0, pDeg, -14.5, 0),
          cPt(226.0, pDeg, 14.5, 0),
          cPt(106.5, pDeg, 20.5, 0)
        ]
      });

      // Armored Portal Gatehouse door at r = 108.0 m (flush with the enclosed Buttress-Bay Block facade!)
      var gAt = cPt(R_BAY_OUT, pDeg, 0, 0);
      doors.push({
        id: 'door_' + prt.id, building: 'drum_arcology', level: 1,
        at: [gAt[0], 0.0, gAt[1]], yaw: pYaw,
        w: 6.4, h: 4.2, t: 0.24, preset: 'blastside', style: 'plate', open: 1
      });

      // Grounded L1 facade wall spanning fin-to-fin at r = 108.0 m around the 6.4 m portal gate + L2..15 doorway lintel
      // At r=108, fin centerlines are at +-28.9m, fin inner faces (~3.5m half-thickness) are at +-25.0m
      addTangentialWall(walls, 1, R_BAY_OUT, pDeg, -25.4, 25.4, -0.6, 5.0, 0.85, 'drConcR', 0.0, 6.4);

      // Grounded Forecourt Salvage Weigh-Booths & Bollards tucked along the sweeping concrete buttress fins (r = 132 & 164 m)
      for (var fs = -1; fs <= 1; fs += 2) {
        pushBoxList(fixtures, 'ancientDark', 136.0, pDeg, fs * 13.5, -0.5, 4.8, 0.65, 3.6, pYaw);
        pushBoxList(fixtures, 'rustPlate', 136.0, pDeg, fs * 13.5, 0.15, 4.2, 2.6, 3.1, pYaw);
        pushBoxList(fixtures, 'timber', 136.0, pDeg, fs * 11.4, 0.012, 3.6, 0.92, 0.85, pYaw);
        pushBoxList(fixtures, 'ancientStone', 172.0, pDeg, fs * 11.8, -0.5, 1.4, 1.65, 1.4, pYaw);
        pushBoxList(fixtures, 'warmGlow', 172.0, pDeg, fs * 11.8, 1.18, 0.9, 0.35, 0.9, pYaw);
      }
      var fcL = cPt(148.0, pDeg, -11.5, 0.012), fcR = cPt(148.0, pDeg, 11.5, 0.012);
      furn.push({ key: 'pa_pallet_load', x: fcL[0], y: 0.012, z: fcL[1], ry: pYaw, building: 'drum_arcology', room: prt.id, wealth: 0.5 });
      furn.push({ key: 'pa_hand_cart', x: fcR[0], y: 0.012, z: fcR[1], ry: pYaw + 0.4, building: 'drum_arcology', room: prt.id, wealth: 0.45 });
    }

    // ENE Rubble Throat grounded haul ramp (AF = 20 deg) starting cleanly at r=83.45 outside core_wedge (zero overlap!)
    slabs.push({
      level: 1, kind: 'rubble_throat', bay: 0, mat: 'ashStone', thick: 0.90, y: 0.015,
      pts: [cPt(83.45, 20.0, -10.0, 0.015), cPt(232.0, 20.0, -14.0, 0.015), cPt(232.0, 20.0, 14.0, 0.015), cPt(83.45, 20.0, 10.0, 0.015)]
    });

    // 2. All 15 Inhabited Levels (y0 = 0.0 .. 61.6 m) + L15 Sky-Terrace (y = 66.0 m)
    for (var lv = 1; lv <= arc.levelCount; lv++) {
      var L = arc.levels[lv - 1];
      var y0 = L.y0;
      var coreThick = lv === 1 ? 0.95 : 0.36;

      // 2a. Inner Ring Gallery & Core Annulus (24 wedges of 15 deg, leaving stair cutouts on lv >= 2)
      for (var w = 0; w < 24; w++) {
        var d0 = w * 15.0, d1 = d0 + 15.0, dm = d0 + 7.5;
        var inScar = angDiff(dm, 20.0) < 31.0;
        if (inScar && lv > 1 && angDiff(dm, 20.0) < 18.0) continue;

        var hasStairHole = false;
        for (var sc = 0; sc < arc.stairs.length; sc++) {
          if (angDiff(dm, arc.stairs[sc].deg) < 7.6 && lv > 1) hasStairHole = true;
        }

        var rCoreMax = inScar ? (lv === 1 ? R_CORE : 52.0) : R_CORE;
        var slabMat = lv === 1 ? 'boursePave' : (lv <= 3 ? 'ancientStone' : (lv <= 6 ? 'ashStone' : 'ancientDark'));

        if (hasStairHole) {
          slabs.push({
            level: lv, kind: 'ring_lip', mat: slabMat, thick: coreThick, y: y0,
            pts: [
              [+(R_PIT * Math.cos(d0 * DEG)).toFixed(2), +(R_PIT * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(25.2 * Math.cos(d0 * DEG)).toFixed(2), +(25.2 * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(25.2 * Math.cos(d1 * DEG)).toFixed(2), +(25.2 * Math.sin(d1 * DEG)).toFixed(2), y0],
              [+(R_PIT * Math.cos(d1 * DEG)).toFixed(2), +(R_PIT * Math.sin(d1 * DEG)).toFixed(2), y0]
            ]
          });
          slabs.push({
            level: lv, kind: 'core_outer', mat: slabMat, thick: coreThick, y: y0,
            pts: [
              [+(36.2 * Math.cos(d0 * DEG)).toFixed(2), +(36.2 * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(rCoreMax * Math.cos(d0 * DEG)).toFixed(2), +(rCoreMax * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(rCoreMax * Math.cos(d1 * DEG)).toFixed(2), +(rCoreMax * Math.sin(d1 * DEG)).toFixed(2), y0],
              [+(36.2 * Math.cos(d1 * DEG)).toFixed(2), +(36.2 * Math.sin(d1 * DEG)).toFixed(2), y0]
            ]
          });
        } else {
          slabs.push({
            level: lv, kind: 'core_wedge', mat: slabMat, thick: coreThick, y: y0,
            pts: [
              [+(R_PIT * Math.cos(d0 * DEG)).toFixed(2), +(R_PIT * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(rCoreMax * Math.cos(d0 * DEG)).toFixed(2), +(rCoreMax * Math.sin(d0 * DEG)).toFixed(2), y0],
              [+(rCoreMax * Math.cos(d1 * DEG)).toFixed(2), +(rCoreMax * Math.sin(d1 * DEG)).toFixed(2), y0],
              [+(R_PIT * Math.cos(d1 * DEG)).toFixed(2), +(R_PIT * Math.sin(d1 * DEG)).toFixed(2), y0]
            ]
          });
        }

        // Hoist-pit continuous safety parapet & cargo-landing rail (h = 1.08 m)
        if (!inScar) {
          var pMid = cPt(R_PIT + 0.35, dm, 0, y0);
          walls.push({
            level: lv, x: pMid[0], y: y0, z: pMid[1], ry: -(dm * DEG) + 0.5 * Math.PI,
            w: 4.5, h: 1.08, d: 0.30, mat: 'tankSteel', walkBlock: lv > 1
          });
        }
      }

      // 2b. 10 Intact Bay Sectors — Subdivided into 10 Distinct Apartments / Workshops / Shops per Bay!
      for (var bi = 0; bi < L.sectors.length; bi++) {
        var sec = L.sectors[bi];
        if (sec.state === 'ruined') continue;
        var bDeg = sec.deg;
        var bYaw = -(bDeg * DEG) + 0.5 * Math.PI;
        var isRes = !sec.simRole; // Residential Tenement Bays (Levels 5-15) vs SIM Trade/Storage/Workshop Bays

        // Fin-to-fin Buttress-Bay Block slab (r = 83.0 .. 108.0 m), socketed cleanly into both flanking 7m concrete fins!
        slabs.push({
          level: lv, kind: 'buttress_bay', bay: sec.bay,
          mat: lv === 1 ? 'boursePave' : (sec.state === 'salvage' ? 'timber' : 'ancientDark'),
          thick: coreThick, y: y0,
          pts: [
            cPt(R_CORE - 0.6, bDeg, -20.2, y0),
            cPt(R_BAY_OUT - 0.65, bDeg, -25.2, y0),
            cPt(R_BAY_OUT - 0.65, bDeg, 25.2, y0),
            cPt(R_CORE - 0.6, bDeg, 20.2, y0)
          ]
        });

        // Full floor-to-floor windowed exterior facade wall on L2..L15 at r = 108.0 m (spanning fin-to-fin, ZERO ceiling gap!)
        if (lv > 1) {
          var extMat = sec.state === 'salvage' ? 'rustPlate' : 'drBlkR';
          addTangentialWall(walls, lv, R_BAY_OUT - 0.35, bDeg, -25.4, 25.4, y0, 4.40, 0.65, extMat, null, null);
        }

        // Ring Gallery main facade wall at r = 40.0 m with 3.2 m central street doorway
        var galMat = lv <= 3 ? 'ancientStone' : (lv <= 6 ? 'tankSteel' : 'rustPlate');
        addTangentialWall(walls, lv, R_GAL, bDeg, -10.2, 10.2, y0, ROOM_H, 0.42, galMat, 0.0, 3.2);

        if (lv <= 6 || sec.bay === 2 || sec.bay === 5 || sec.bay === 8) {
          var dPos = cPt(R_GAL, bDeg, 0, y0);
          var isVault = sec.simRole === 'bonded_alloy_vault' || sec.simRole === 'bonded_warehouse';
          doors.push({
            id: 'door_arc_L' + (lv < 10 ? '0' + lv : lv) + '_B' + (sec.bay < 10 ? '0' + sec.bay : sec.bay),
            building: 'drum_arcology', level: lv,
            at: [dPos[0], y0, dPos[1]], yaw: bYaw,
            w: 3.0, h: 2.75, t: 0.12,
            preset: isVault ? 'double' : 'single',
            style: isVault ? 'grille' : (lv <= 3 ? 'half+pull' : 'plank+ring'),
            open: 1
          });
        }

        // Main radial inter-sector fire/structural wall along fin centerline (bDeg - 15 deg, r = 40.2 .. 83.4 m)
        var finDeg = bDeg - 15.0;
        var hasStairOnFin = (finDeg === 80 || finDeg === 170 || finDeg === 260 || finDeg === 320);
        var rwMid = cPt(61.8, finDeg, 0, y0);
        walls.push({
          level: lv, x: rwMid[0], y: y0, z: rwMid[1], ry: -(finDeg * DEG),
          w: 43.2, h: ROOM_H, d: hasStairOnFin ? 0.85 : 0.50,
          mat: hasStairOnFin ? 'ancientDark' : 'ashStone', walkBlock: true
        });
        // Close the far side of Bay 10 (335 + 15 = 350 deg, bordering ruined Bay 11)
        if (sec.bay === 10) {
          var endDeg = bDeg + 15.0;
          var endMid = cPt(61.8, endDeg, 0, y0);
          walls.push({
            level: lv, x: endMid[0], y: y0, z: endMid[1], ry: -(endDeg * DEG),
            w: 43.2, h: ROOM_H, d: 0.75, mat: 'ancientDark', walkBlock: true
          });
        }

        // ---- SUBDIVIDE CORE INTO 6 DISTINCT ROOMS (3 Left + 3 Right of the 4.6m Central Radial Street!) ----
        var partMat = isRes ? ((lv + sec.bay) % 2 === 0 ? 'ashStone' : 'timber') : (lv <= 3 ? 'ancientStone' : 'tankSteel');
        var roomCollide = lv <= 3;
        for (var side = -1; side <= 1; side += 2) {
          var corrOff = side * 2.35;
          // Corridor side walls for Ring A (40.4..54.6), Ring B (54.8..69.0), Ring C (69.2..82.8) — each with a 2.0m open doorway!
          addRadialOffsetWall(walls, lv, bDeg, corrOff, 40.4, 54.6, y0, ROOM_H, 0.28, partMat, 47.5, 2.0, roomCollide);
          addRadialOffsetWall(walls, lv, bDeg, corrOff, 54.8, 69.0, y0, ROOM_H, 0.28, partMat, 61.9, 2.0, roomCollide);
          addRadialOffsetWall(walls, lv, bDeg, corrOff, 69.2, 82.8, y0, ROOM_H, 0.28, partMat, 76.0, 2.0, roomCollide);

          // Cross-partition walls separating Suite A / Suite B (at r = 54.7 m) and Suite B / Suite C (at r = 69.1 m)
          addTangentialWall(walls, lv, 54.7, bDeg, side * 2.4, side * 14.1, y0, ROOM_H, 0.28, partMat, null, null, roomCollide);
          addTangentialWall(walls, lv, 69.1, bDeg, side * 2.4, side * 17.9, y0, ROOM_H, 0.28, partMat, null, null, roomCollide);

          // Secondary internal room divider inside wide Outer-Core Suite C (splitting front living/shop from rear bedroom/workshop!)
          addRadialOffsetWall(walls, lv, bDeg, side * 10.6, 69.3, 82.8, y0, ROOM_H, 0.22, 'timber', 75.8, 1.9, false);

          // Populate architectural built-in bunks / stoves / tables / stalls in all 3 Core Suites on this side!
          if (isRes) {
            addApartmentFixtures(fixtures, 47.5, bDeg, side * 7.2, side, y0, bYaw, ROOM_H);
            addApartmentFixtures(fixtures, 61.9, bDeg, side * 8.8, side, y0, bYaw, ROOM_H);
            addApartmentFixtures(fixtures, 76.0, bDeg, side * 6.4, side, y0, bYaw, ROOM_H);
            addDoubleBunkSet(fixtures, 76.0, bDeg, side * 14.8, y0, bYaw);
          } else {
            addWorkRoomFixtures(fixtures, sec.simRole, 47.5, bDeg, side * 7.2, side, y0, bYaw, ROOM_H);
            addWorkRoomFixtures(fixtures, sec.simRole, 61.9, bDeg, side * 8.8, side, y0, bYaw, ROOM_H);
            addWorkRoomFixtures(fixtures, sec.simRole, 76.0, bDeg, side * 6.4, side, y0, bYaw, ROOM_H);
          }
        }

        // ---- SUBDIVIDE BUTTRESS-BAY BLOCK (r = 88.2 .. 107.4 m) INTO 4 EXTERIOR WINDOW APARTMENTS / WORKSHOPS! ----
        // Transverse Buttress Arcade runs fin-to-fin along r = 84.2 .. 88.2 m.
        // Corridor wall at r = 88.2 m with doorways into Outer-Left, Inner-Left, Inner-Right, Outer-Right suites
        // (leaving central +/-3.4m wide portal throat open on L1!)
        addTangentialWall(walls, lv, 88.2, bDeg, -21.2, -12.0, y0, ROOM_H, 0.30, partMat, -16.6, 2.0, roomCollide);
        addTangentialWall(walls, lv, 88.2, bDeg, -11.8, -3.4, y0, ROOM_H, 0.30, partMat, -7.6, 2.0, roomCollide);
        addTangentialWall(walls, lv, 88.2, bDeg, 3.4, 11.8, y0, ROOM_H, 0.30, partMat, 7.6, 2.0, roomCollide);
        addTangentialWall(walls, lv, 88.2, bDeg, 12.0, 21.2, y0, ROOM_H, 0.30, partMat, 16.6, 2.0, roomCollide);
        if (lv > 1) {
          // On L2..L15, central bay end at r=88.2m has a 2.8m archway into a bright central window common room / lookout!
          addTangentialWall(walls, lv, 88.2, bDeg, -3.4, 3.4, y0, ROOM_H, 0.30, partMat, 0.0, 2.6, roomCollide);
        }

        // Radial party walls dividing the 4 exterior window units (r = 88.4 .. 107.4 m)
        for (var bSide = -1; bSide <= 1; bSide += 2) {
          addRadialOffsetWall(walls, lv, bDeg, bSide * 3.4, 88.4, 107.4, y0, ROOM_H, 0.30, lv === 1 ? 'drConcR' : partMat, null, null, lv === 1 ? true : roomCollide);
          addRadialOffsetWall(walls, lv, bDeg, bSide * 11.9, 88.4, 107.4, y0, ROOM_H, 0.28, partMat, 97.5, 1.9, false);
          if (isRes) {
            addApartmentFixtures(fixtures, 97.6, bDeg, bSide * 7.6, bSide, y0, bYaw, ROOM_H);
            addApartmentFixtures(fixtures, 97.6, bDeg, bSide * 17.2, bSide, y0, bYaw, ROOM_H);
          } else {
            addWorkRoomFixtures(fixtures, sec.simRole, 97.6, bDeg, bSide * 7.6, bSide, y0, bYaw, ROOM_H);
            addWorkRoomFixtures(fixtures, sec.simRole, 97.6, bDeg, bSide * 17.2, bSide, y0, bYaw, ROOM_H);
          }
        }

        // ---- DETAILED KratorFurniture (KFURN) PLACEMENTS ACROSS MULTIPLE ROOMS PER BAY ----
        var pAL = cPt(47.5, bDeg, -6.2, y0), pAR = cPt(47.5, bDeg, 6.2, y0);
        var pBL = cPt(62.0, bDeg, -8.2, y0), pBR = cPt(62.0, bDeg, 8.2, y0);
        var pCL = cPt(76.0, bDeg, -14.2, y0), pCR = cPt(76.0, bDeg, 14.2, y0);
        var pDL = cPt(98.0, bDeg, -8.0, y0), pDR = cPt(98.0, bDeg, 8.0, y0);

        if (sec.simRole === 'salvage_bourse' || sec.simRole === 'ancient_parts_exchange') {
          furn.push({ key: 'pa_shop_counter', x: pAL[0], y: y0, z: pAL[1], ry: bYaw + 0.5 * Math.PI, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.6 });
          furn.push({ key: 'pa_market_table', x: pAR[0], y: y0, z: pAR[1], ry: bYaw - 0.5 * Math.PI, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.55 });
          furn.push({ key: 'pa_goods_shelf', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.6 });
          furn.push({ key: 'pa_shop_counter', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.6 });
          furn.push({ key: 'pa_pallet_load', x: pCL[0], y: y0, z: pCL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_CL', wealth: 0.5 });
          furn.push({ key: 'pa_scrap_bin', x: pCR[0], y: y0, z: pCR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_CR', wealth: 0.45 });
          furn.push({ key: 'pa_market_table', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.5 });
          furn.push({ key: 'pa_goods_shelf', x: pDR[0], y: y0, z: pDR[1], ry: bYaw + Math.PI, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.55 });
        } else if (sec.simRole === 'tribute_assay') {
          furn.push({ key: 'pa_shop_counter', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.8 });
          furn.push({ key: 'generic_strongbox', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.85 });
          furn.push({ key: 'voth_shrine_stele', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.8 });
          furn.push({ key: 'generic_writing_supplies', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.75 });
          furn.push({ key: 'generic_strongbox', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.85 });
          furn.push({ key: 'pa_goods_shelf', x: pDR[0], y: y0, z: pDR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.75 });
        } else if (sec.simRole === 'bonded_alloy_vault' || sec.simRole === 'bonded_warehouse') {
          furn.push({ key: 'pa_drum_store', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.5 });
          furn.push({ key: 'pa_pallet_load', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.5 });
          furn.push({ key: 'generic_crate', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.45 });
          furn.push({ key: 'job_oil_drum_rack', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.5 });
          furn.push({ key: 'pa_pallet_load', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.5 });
          furn.push({ key: 'pa_drum_store', x: pDR[0], y: y0, z: pDR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.5 });
        } else if (sec.simRole === 'mushroom_vat_vault') {
          furn.push({ key: 'pa_cold_frame', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.4 });
          furn.push({ key: 'generic_mushrooms', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.4 });
          furn.push({ key: 'pa_water_butt', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.4 });
          furn.push({ key: 'generic_mushrooms', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.4 });
          furn.push({ key: 'pa_cold_frame', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.4 });
          furn.push({ key: 'generic_mushrooms', x: pDR[0], y: y0, z: pDR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.4 });
        } else if (sec.simRole === 'fin_workshop') {
          furn.push({ key: 'pa_forge', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.5 });
          furn.push({ key: 'pa_anvil', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.5 });
          furn.push({ key: 'pa_vice_bench', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.5 });
          furn.push({ key: 'pa_tool_rack', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.5 });
          furn.push({ key: 'pa_forge', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.5 });
          furn.push({ key: 'pa_vice_bench', x: pDR[0], y: y0, z: pDR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.5 });
        } else if (sec.simRole === 'arcology_infirmary') {
          furn.push({ key: 'post-apoc_court_cryo_berth', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.65 });
          furn.push({ key: 'post-apoc_court_cryo_berth', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.65 });
          furn.push({ key: 'generic_medicine', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.6 });
          furn.push({ key: 'pa_goods_shelf', x: pBR[0], y: y0, z: pBR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.6 });
        } else if (sec.simRole === 'communal_mess_bakehouse') {
          furn.push({ key: 'voth_bread_oven', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.55 });
          furn.push({ key: 'pa_long_table', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.5 });
          furn.push({ key: 'pa_bench', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.45 });
          furn.push({ key: 'voth_bread_oven', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.55 });
        } else if (sec.simRole === 'header_cistern' || sec.simRole === 'sky_catch_basin') {
          furn.push({ key: 'pa_water_trough', x: pAL[0], y: y0, z: pAL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.5 });
          furn.push({ key: 'pa_drum', x: pAR[0], y: y0, z: pAR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.5 });
          furn.push({ key: 'pa_water_butt', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.5 });
        } else {
          // Every residential tenement bay across L5..L15 receives multi-apartment KFURN props on top of the 8 built-in apartment suites!
          furn.push({ key: 'pa_bunk_stall', x: pAL[0], y: y0, z: pAL[1], ry: bYaw + 0.5 * Math.PI, building: 'drum_arcology', room: sec.id + '_AL', wealth: 0.38 });
          furn.push({ key: 'pa_bunk_stall', x: pAR[0], y: y0, z: pAR[1], ry: bYaw - 0.5 * Math.PI, building: 'drum_arcology', room: sec.id + '_AR', wealth: 0.38 });
          furn.push({ key: 'pa_long_table', x: pBL[0], y: y0, z: pBL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_BL', wealth: 0.4 });
          furn.push({ key: (lv + sec.bay) % 2 === 0 ? 'pa_vice_bench' : 'pa_goods_shelf', x: pBR[0], y: y0, z: pBR[1], ry: rng.range(0, 6.28), building: 'drum_arcology', room: sec.id + '_BR', wealth: 0.42 });
          furn.push({ key: 'generic_poor_straw_bed', x: pCL[0], y: y0, z: pCL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_CL', wealth: 0.32 });
          furn.push({ key: 'generic_poor_straw_bed', x: pCR[0], y: y0, z: pCR[1], ry: bYaw + Math.PI, building: 'drum_arcology', room: sec.id + '_CR', wealth: 0.32 });
          furn.push({ key: 'pa_bunk_stall', x: pDL[0], y: y0, z: pDL[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DL', wealth: 0.4 });
          furn.push({ key: 'pa_bench', x: pDR[0], y: y0, z: pDR[1], ry: bYaw, building: 'drum_arcology', room: sec.id + '_DR', wealth: 0.38 });
        }
      }

      // 2c. 4 Continuous Fin Dogleg Staircases climbing L(lv) -> L(lv+1) (and L15 -> y=66.0m Sky-Terrace!)
      for (var st = 0; st < arc.stairs.length; st++) {
        var stCore = arc.stairs[st];
        var sDeg = stCore.deg;
        var yTop = +(y0 + arc.storeyH).toFixed(2);
        var yMid = +(y0 + 0.5 * arc.storeyH).toFixed(2);
        stairs.push({
          id: stCore.id + '_fA_L' + lv, level: lv,
          a: cPt(28.0, sDeg, -5.4, y0), b: cPt(28.0, sDeg, 2.6, yMid), w: 2.8, mat: 'tankSteel'
        });
        slabs.push({
          level: lv, kind: 'stair_landing', mat: 'tankSteel', thick: 0.32, y: yMid,
          pts: [cPt(26.4, sDeg, 2.2, yMid), cPt(34.8, sDeg, 2.2, yMid), cPt(34.8, sDeg, 5.8, yMid), cPt(26.4, sDeg, 5.8, yMid)]
        });
        stairs.push({
          id: stCore.id + '_fB_L' + lv, level: lv,
          a: cPt(33.0, sDeg, 2.6, yMid), b: cPt(33.0, sDeg, -5.4, yTop), w: 2.8, mat: 'tankSteel'
        });
      }
    }

    // 3. L15 Crown Sky-Terrace Deck at y = 66.0 m (reachable via L15 Flight B, capping all Core & Buttress-Bay Blocks cleanly!)
    for (var kw = 0; kw < 24; kw++) {
      var kd0 = kw * 15.0, kd1 = kd0 + 15.0, kdm = kd0 + 7.5;
      if (angDiff(kdm, 20.0) < 28.0) continue;
      var hasTopHole = false;
      for (var ksc = 0; ksc < arc.stairs.length; ksc++) {
        if (angDiff(kdm, arc.stairs[ksc].deg) < 7.6) hasTopHole = true;
      }
      var rInTop = hasTopHole ? 36.2 : 20.0;
      slabs.push({
        level: 16, kind: 'sky_terrace', mat: 'ancientStone', thick: 0.48, y: 66.0,
        pts: [
          [+(rInTop * Math.cos(kd0 * DEG)).toFixed(2), +(rInTop * Math.sin(kd0 * DEG)).toFixed(2), 66.0],
          [+(148.0 * Math.cos(kd0 * DEG)).toFixed(2), +(148.0 * Math.sin(kd0 * DEG)).toFixed(2), 66.0],
          [+(148.0 * Math.cos(kd1 * DEG)).toFixed(2), +(148.0 * Math.sin(kd1 * DEG)).toFixed(2), 66.0],
          [+(rInTop * Math.cos(kd1 * DEG)).toFixed(2), +(rInTop * Math.sin(kd1 * DEG)).toFixed(2), 66.0]
        ]
      });
      if (hasTopHole) {
        slabs.push({
          level: 16, kind: 'sky_terrace_lip', mat: 'ancientStone', thick: 0.48, y: 66.0,
          pts: [
            [+(20.0 * Math.cos(kd0 * DEG)).toFixed(2), +(20.0 * Math.sin(kd0 * DEG)).toFixed(2), 66.0],
            [+(25.2 * Math.cos(kd0 * DEG)).toFixed(2), +(25.2 * Math.sin(kd0 * DEG)).toFixed(2), 66.0],
            [+(25.2 * Math.cos(kd1 * DEG)).toFixed(2), +(25.2 * Math.sin(kd1 * DEG)).toFixed(2), 66.0],
            [+(20.0 * Math.cos(kd1 * DEG)).toFixed(2), +(20.0 * Math.sin(kd1 * DEG)).toFixed(2), 66.0]
          ]
        });
      }
    }

    props.push({ kind: 'central_hoist_rig', x: 0, y: 0, z: 0, rPit: R_PIT, yTop: 68.5 });

    return {
      rPit: R_PIT,
      rGallery: R_GAL,
      rCore: R_CORE,
      rBayOut: R_BAY_OUT,
      slabs: slabs,
      stairs: stairs,
      walls: walls,
      doors: doors,
      furn: furn,
      fixtures: fixtures,
      props: props
    };
  }

  DRUM.buildArcologyStage4 = buildArcologyStage4;
})(typeof window !== 'undefined' ? window : globalThis);
