// ================================================================= TORUS — 34: Forest Ring & Stepped Terrace Walk/Interior Plan ([G data])
// Pure engine-neutral 3D interior slabs, 10-terrace radial stair cascades (T10 +1m -> T1 +44m), Arcaded Foot vaults,
// 4 Atrium Express Hoist/Stair shafts + 5 Barrel waystations, 4 Radial Wheel Bridges (WY = 300m), Wheel Town & Cider Tube
// decks (y = 294m & 300m), 44 Tether-Winch platforms, Stepped Botanical Crown (y = 600..672m), KDOORs, and KFURN placements.
// Zero THREE, zero DOM. Avoids `|| <number>` per tools/check_source.py ORNUM rule.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});
  var DEG = Math.PI / 180;

  function normDeg(d) {
    var x = d % 360;
    return x < 0 ? x + 360 : x;
  }

  function angDiff(a, b) {
    var d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  function cPt(r, deg, off, y) {
    var a = deg * DEG;
    var ca = Math.cos(a), sa = Math.sin(a);
    return [
      +(r * ca - off * sa).toFixed(2),
      +(r * sa + off * ca).toFixed(2),
      +(y == null ? 0 : y).toFixed(2)
    ];
  }

  function wedgePts(r0, r1, d0, d1, y) {
    var a0 = d0 * DEG, a1 = d1 * DEG;
    return [
      [+(r0 * Math.cos(a0)).toFixed(2), +(r0 * Math.sin(a0)).toFixed(2), y],
      [+(r1 * Math.cos(a0)).toFixed(2), +(r1 * Math.sin(a0)).toFixed(2), y],
      [+(r1 * Math.cos(a1)).toFixed(2), +(r1 * Math.sin(a1)).toFixed(2), y],
      [+(r0 * Math.cos(a1)).toFixed(2), +(r0 * Math.sin(a1)).toFixed(2), y]
    ];
  }

  function buildArcologyStage4(plan) {
    var arc = plan.arcology;
    var rng = KRAND.stream(KRAND.child(plan.seed, 'torus_stage4_arc'));
    var slabs = [];
    var stairs = [];
    var walls = [];
    var doors = [];
    var furn = [];

    // ----------------------------------------------------------------- 1. 10-Level Stepped Terrace Radial Stair Cascades (T10 +1m -> T1 +44m)
    // Allows seamless walking from the outer plain (y=0) up every basalt terrace riser onto T1 (y=44m) along all 12 radial spokes.
    var terraces = plan.agTerraces;
    for (var sk = 0; sk < 12; sk++) {
      var sdeg = normDeg(7.5 + 30.0 * sk);
      var sa = sdeg * DEG;
      for (var ti = 0; ti < terraces.length; ti++) {
        var tr = terraces[ti];
        var nextElev = (ti + 1 < terraces.length) ? terraces[ti + 1].elev : 0.0;
        var mx = tr.rOut * Math.cos(sa), mz = tr.rOut * Math.sin(sa);
        if (ti >= 8 && TORUS.inRiverCorridor(mx, mz, 6)) continue;
        // Walkable radial avenue segment across terrace bench
        var rStart = ti === 0 ? 292.0 : tr.rIn + 2.0;
        var rEnd = tr.rOut - 2.0;
        stairs.push({
          id: 'terrace_ave_T' + (ti + 1) + '_S' + sk,
          level: 0,
          render: false,
          a: cPt(rStart, sdeg, 0, tr.elev),
          b: cPt(rEnd, sdeg, 0, tr.elev),
          w: 9.5,
          mat: 'roadStone'
        });
        // Fieldstone stair/ramp flight climbing the terrace riser at tr.rOut (9.6m run for <= 5m rise -> slope <= 0.52)
        stairs.push({
          id: 'terrace_riser_T' + (ti + 1) + '_S' + sk,
          level: 0,
          render: true,
          a: cPt(tr.rOut + 4.8, sdeg, 0, nextElev),
          b: cPt(tr.rOut - 4.8, sdeg, 0, tr.elev),
          w: 8.4,
          mat: 'fieldstoneWall'
        });
      }
    }

    // ----------------------------------------------------------------- 2. Level 1: Arcaded Foot & Terrace Vaults (y = 44.0 m)
    // 7 intact Foot Portals (open blastside gates) + 1 collapsed ENE Wheel-Fall Portal (welded shut, locked)
    for (var pi = 0; pi < arc.portals.length; pi++) {
      var prt = arc.portals[pi];
      var pDeg = prt.deg;
      var gAt = cPt(291.5, pDeg, 0, 44.0);
      if (prt.ruined) {
        doors.push({
          id: 'door_' + prt.id, building: 'forest_ring_arcology', level: 1,
          at: [gAt[0], 44.0, gAt[1]], yaw: -(pDeg * DEG) + 0.5 * Math.PI,
          w: 6.4, h: 4.4, t: 0.24, preset: 'blastside', style: 'plate', open: 0, locked: true
        });
        walls.push({
          level: 1, x: gAt[0], y: 44.0, z: gAt[1], ry: -(pDeg * DEG) + 0.5 * Math.PI,
          w: 14.0, h: 5.0, d: 2.0, mat: 'rustPlate', walkBlock: true
        });
      } else {
        slabs.push({
          level: 1, kind: 'foot_portal_avenue', mat: 'roadStone', thick: 0.36, y: 44.0,
          pts: [cPt(236.0, pDeg, -6.5, 44.0), cPt(304.0, pDeg, -7.2, 44.0), cPt(304.0, pDeg, 7.2, 44.0), cPt(236.0, pDeg, 6.5, 44.0)]
        });
        doors.push({
          id: 'door_' + prt.id, building: 'forest_ring_arcology', level: 1,
          at: [gAt[0], 44.0, gAt[1]], yaw: -(pDeg * DEG) + 0.5 * Math.PI,
          w: 6.2, h: 4.4, t: 0.18, preset: 'blastside', style: 'plate', open: 1
        });
        for (var sj = -1; sj <= 1; sj += 2) {
          var jAt = cPt(291.5, pDeg, sj * 5.8, 44.0);
          walls.push({
            level: 1, x: jAt[0], y: 44.0, z: jAt[1], ry: -(pDeg * DEG) + 0.5 * Math.PI,
            w: 5.4, h: 4.6, d: 1.4, mat: 'tankSteel', walkBlock: true
          });
        }
      }
    }

    // Foot Annular Arcade & Atrium Concourse (24 wedges around r = 64..286 m at y = 44.0 m, skipping ENE ruin wedge 45..67.5 deg)
    for (var fw = 0; fw < 24; fw++) {
      var fd0 = fw * 15.0, fd1 = fd0 + 15.0, fdm = fd0 + 7.5;
      if (angDiff(fdm, 55.0) < 14.0) continue;
      slabs.push({
        level: 1, kind: 'foot_vault_wedge', mat: 'floorTile', thick: 0.40, y: 44.0,
        pts: wedgePts(64.0, 286.0, fd0, fd1, 44.0)
      });
      if (fw % 3 === 0) {
        var fp = cPt(218.0, fdm, 0, 44.0);
        furn.push({
          key: fw % 6 === 0 ? 'pa_pallet_load' : 'generic_barrel',
          x: fp[0], y: 44.0, z: fp[1], ry: rng.range(0, 6.28),
          building: 'forest_ring_arcology', room: 'foot_arcade_vault', wealth: 0.5, setting: 'indoor'
        });
        var fp2 = cPt(184.0, fdm, 5.0, 44.0);
        furn.push({
          key: fw % 6 === 0 ? 'pa_bunk_stall' : 'pa_long_table',
          x: fp2[0], y: 44.0, z: fp2[1], ry: -(fdm * DEG),
          building: 'forest_ring_arcology', room: 'foot_arcade_flats', wealth: 0.45, setting: 'indoor'
        });
      }
    }

    // ----------------------------------------------------------------- 3. Level 2: 4 Atrium Hoist/Stair Cores & Sparse Middle Barrel Waystations
    // Vertical transit stops: y = 44 -> 111 -> 240 -> 300 (Wheel Lobby) -> 346.8 -> 459 -> 538.2 -> 600 (Crown Lobby)
    var V_STOPS = [44.0, 111.0, 240.0, 300.0, 346.8, 459.0, 538.2, 600.0];
    for (var hi = 0; hi < arc.hoists.length; hi++) {
      var hst = arc.hoists[hi];
      var hDeg = hst.deg;
      for (var vs = 0; vs < V_STOPS.length; vs++) {
        var vy = V_STOPS[vs];
        var lvTag = vy <= 58 ? 1 : (vy < 290 ? 2 : (vy <= 315 ? 3 : (vy < 590 ? 4 : 5)));
        slabs.push({
          level: lvTag, kind: 'hoist_landing', mat: 'tankSteel', thick: 0.34, y: vy,
          pts: wedgePts(66.0, 92.0, hDeg - 10.0, hDeg + 10.0, vy)
        });
        if (vs + 1 < V_STOPS.length) {
          var ny = V_STOPS[vs + 1];
          var nFlights = Math.max(2, Math.ceil((ny - vy) / 15.0));
          var prevDeg = hDeg;
          var prevY = vy;
          for (var fl = 1; fl <= nFlights; fl++) {
            var nextY = +(vy + (ny - vy) * (fl / nFlights)).toFixed(2);
            // Alternate +24 deg / -24 deg switchbacks on the r=78m atrium ring (32.4m chord, <= 15m rise -> slope <= 0.46)
            var nextDeg = (fl % 2 === 1) ? (hDeg + 24.0) : hDeg;
            stairs.push({
              id: hst.id + '_up_' + vs + '_' + fl, level: lvTag, render: true,
              a: cPt(78.0, prevDeg, 0, prevY), b: cPt(78.0, nextDeg, 0, nextY), w: 3.8, mat: 'tankSteel'
            });
            if (fl < nFlights) {
              slabs.push({
                level: lvTag, kind: 'hoist_mid_landing', mat: 'tankSteel', thick: 0.28, y: nextY,
                pts: wedgePts(72.0, 84.0, nextDeg - 5.5, nextDeg + 5.5, nextY)
              });
            }
            prevDeg = nextDeg;
            prevY = nextY;
          }
          if (prevDeg !== hDeg) {
            // Tie odd-flight top landing back across the r=78m gallery to hDeg at ny
            slabs.push({
              level: ny <= 315 ? 3 : (ny < 590 ? 4 : 5), kind: 'hoist_tie_gallery', mat: 'tankSteel', thick: 0.30, y: ny,
              pts: wedgePts(72.0, 86.0, hDeg - 4.0, prevDeg + 5.5, ny)
            });
          }
        }
      }
    }

    // 5 Sparse Middle Barrel Waystation Decks (150 riggers/pump-keepers total) connected to the hoist ring
    var midTier = arc.tiers[1];
    for (var ms = 0; ms < midTier.sectors.length; ms++) {
      var msec = midTier.sectors[ms];
      var my = msec.y;
      var mDeg = msec.deg;
      var rOuterM = +(TORUS.rBarrelAt(my) - 8.0).toFixed(1);
      slabs.push({
        level: my < 300 ? 2 : 4, kind: 'barrel_waystation', mat: msec.state === 'ruined' ? 'rustPlate' : 'ashStone', thick: 0.36, y: my,
        pts: wedgePts(84.0, rOuterM, mDeg - 9.0, mDeg + 9.0, my)
      });
      // Annular catwalk linking nearest hoist landing at `my` to this waystation
      for (var cw = 0; cw < 24; cw++) {
        var cd0 = cw * 15.0, cd1 = cd0 + 15.0;
        slabs.push({
          level: my < 300 ? 2 : 4, kind: 'barrel_catwalk', mat: 'tankSteel', thick: 0.28, y: my,
          pts: wedgePts(74.0, 86.0, cd0, cd1, my)
        });
      }
      if (msec.state === 'ruined') {
        var rAt = cPt(120.0, mDeg, 0, my);
        doors.push({
          id: 'door_' + msec.id + '_bulkhead', building: 'forest_ring_arcology', level: 4,
          at: [rAt[0], my, rAt[1]], yaw: -(mDeg * DEG),
          w: 4.2, h: 3.4, t: 0.20, preset: 'blastside', style: 'plate', open: 0, locked: true
        });
      } else {
        var wp = cPt(148.0, mDeg, 0, my);
        furn.push({
          key: ms % 2 === 0 ? 'pa_tool_rack' : 'pa_bunk_stall',
          x: wp[0], y: my, z: wp[1], ry: -(mDeg * DEG),
          building: 'forest_ring_arcology', room: msec.simRole, wealth: 0.45, setting: 'indoor'
        });
      }
    }

    // ----------------------------------------------------------------- 4. Level 3: WY = 300m Barrel Concourse, 4 Wheel Bridges & Outer Wheel
    var rBar300 = +(TORUS.rBarrelAt(300.0) - 4.0).toFixed(1);
    for (var b3 = 0; b3 < 24; b3++) {
      slabs.push({
        level: 3, kind: 'y300_barrel_ring', mat: 'ancientStone', thick: 0.38, y: 300.0,
        pts: wedgePts(74.0, rBar300, b3 * 15.0, (b3 + 1) * 15.0, 300.0)
      });
    }
    // 4 Radial Sky-Bridges spanning Barrel (rBar300) -> Suspended Outer Wheel (WR0 = 560 m) at WY = 300 m
    for (var bri = 0; bri < arc.wheelBridges.length; bri++) {
      var br = arc.wheelBridges[bri];
      slabs.push({
        level: 3, kind: 'wheel_radial_bridge', mat: 'ancientStone', thick: 0.48, y: 300.0,
        pts: [
          cPt(rBar300 - 4.0, br.deg, -7.5, 300.0),
          cPt(564.0, br.deg, -7.5, 300.0),
          cPt(564.0, br.deg, 7.5, 300.0),
          cPt(rBar300 - 4.0, br.deg, 7.5, 300.0)
        ]
      });
      var bGate = cPt(558.0, br.deg, 0, 300.0);
      doors.push({
        id: 'door_' + br.id, building: 'forest_ring_arcology', level: 3,
        at: [bGate[0], 300.0, bGate[1]], yaw: -(br.deg * DEG) + 0.5 * Math.PI,
        w: 6.4, h: 4.2, t: 0.18, preset: 'double', style: 'plate', open: 1
      });
    }

    // 21 Intact Outer Wheel Sectors (WY = 300m main deck + y = 294.8m Cider Tube cellar gallery) + Breach Bulkheads
    var wheelTier = arc.tiers[2];
    for (var ws = 0; ws < wheelTier.sectors.length; ws++) {
      var wsec = wheelTier.sectors[ws];
      var wd0 = wsec.sector * 15.0, wd1 = wd0 + 15.0, wdm = wsec.deg;
      if (wsec.state === 'ruined') continue;

      // Main Wheel Town / Cider-Press promenade slab (r = 560..720 m at y = 300.0 m)
      // Leave stairwell cutout around lm_ciderhall on S13 (deg 202.5) handled cleanly by Cider Hall F-1..F1
      var isCiderSector = (wsec.sector === 13);
      if (!isCiderSector) {
        slabs.push({
          level: 3, kind: 'wheel_main_deck', mat: ws % 3 === 0 ? 'ashStone' : 'ancientStone', thick: 0.42, y: 300.0,
          pts: wedgePts(560.0, 720.0, wd0, wd1, 300.0)
        });
      } else {
        // Flanking inner/outer Wheel Rim aprons around Great Cider-Press Hall (r=560..598 & r=674..720)
        slabs.push({
          level: 3, kind: 'wheel_cider_apron_in', mat: 'ancientStone', thick: 0.42, y: 300.0,
          pts: wedgePts(560.0, 602.0, wd0, wd1, 300.0)
        });
        slabs.push({
          level: 3, kind: 'wheel_cider_apron_out', mat: 'ancientStone', thick: 0.42, y: 300.0,
          pts: wedgePts(670.0, 720.0, wd0, wd1, 300.0)
        });
      }

      // Cider Tube Lower Cellar Gallery (y = 294.8 m, r = 612..668 m) + sector stair on every 4th intact sector
      slabs.push({
        level: 3, kind: 'wheel_cider_tube_cellar', mat: 'basalt', thick: 0.36, y: 294.8,
        pts: wedgePts(612.0, 668.0, wd0, wd1, 294.8)
      });
      if (ws % 4 === 0 && !isCiderSector) {
        stairs.push({
          id: 'wheel_cellar_stair_S' + ws, level: 3, render: true,
          a: cPt(610.0, wdm - 2.0, 0, 294.8), b: cPt(610.0, wdm + 2.0, 0, 300.0), w: 3.0, mat: 'tankSteel'
        });
      }

      // Seal bulkheads on sectors immediately bordering the WA = 57.3 deg collapsed Wheel breach
      var prevSec = wheelTier.sectors[(ws + 23) % 24];
      var nextSec = wheelTier.sectors[(ws + 1) % 24];
      if (prevSec.state === 'ruined') {
        var bPrev = cPt(640.0, wd0 + 0.4, 0, 300.0);
        walls.push({ level: 3, x: bPrev[0], y: 300.0, z: bPrev[1], ry: -(wd0 * DEG), w: 158.0, h: 4.5, d: 1.5, mat: 'rustPlate', walkBlock: true });
        doors.push({
          id: 'door_wheel_breach_S' + ws + '_prev', building: 'forest_ring_arcology', level: 3,
          at: [bPrev[0], 300.0, bPrev[1]], yaw: -(wd0 * DEG),
          w: 4.6, h: 3.6, t: 0.24, preset: 'blastside', style: 'plate', open: 0, locked: true
        });
      }
      if (nextSec.state === 'ruined') {
        var bNext = cPt(640.0, wd1 - 0.4, 0, 300.0);
        walls.push({ level: 3, x: bNext[0], y: 300.0, z: bNext[1], ry: -(wd1 * DEG), w: 158.0, h: 4.5, d: 1.5, mat: 'rustPlate', walkBlock: true });
        doors.push({
          id: 'door_wheel_breach_S' + ws + '_next', building: 'forest_ring_arcology', level: 3,
          at: [bNext[0], 300.0, bNext[1]], yaw: -(wd1 * DEG),
          w: 4.6, h: 3.6, t: 0.24, preset: 'blastside', style: 'plate', open: 0, locked: true
        });
      }

      // Wheel Town cider barrels, fruit crates & tenement tables
      if (!isCiderSector) {
        var wf1 = cPt(572.0, wdm, -3.5, 300.0);
        var wf2 = cPt(708.0, wdm, 3.5, 300.0);
        var wf3 = cPt(640.0, wdm, 0, 294.8);
        furn.push({ key: 'pa_produce_crate', x: wf1[0], y: 300.0, z: wf1[1], ry: -(wdm * DEG), building: 'forest_ring_arcology', room: 'inner_tether_deck', wealth: 0.55, setting: 'outdoor' });
        furn.push({ key: 'generic_barrel', x: wf2[0], y: 300.0, z: wf2[1], ry: rng.range(0, 6.28), building: 'forest_ring_arcology', room: 'outer_tether_deck', wealth: 0.55, setting: 'outdoor' });
        furn.push({ key: 'generic_keg', x: wf3[0], y: 294.8, z: wf3[1], ry: -(wdm * DEG), building: 'forest_ring_arcology', room: 'cider_tube_cellar', wealth: 0.6, setting: 'indoor' });
      }
    }

    // ----------------------------------------------------------------- 5. Level 5: Stepped Botanical Crown (y = 600..672 m, 600 pop)
    var CROWN_RINGS = [
      { y: 600.0, r0: 74.0, r1: 326.0, mat: 'ancientStone', room: 'crown_band0_terrace' },
      { y: 632.0, r0: 96.0, r1: 242.0, mat: 'ashStone', room: 'crown_mother_orchard' },
      { y: 664.0, r0: 84.0, r1: 162.0, mat: 'ancientStone', room: 'sacred_wild_ring_shrine' }
    ];
    for (var cr = 0; cr < CROWN_RINGS.length; cr++) {
      var cRing = CROWN_RINGS[cr];
      for (var cs = 0; cs < 24; cs++) {
        var cd0b = cs * 15.0, cd1b = cd0b + 15.0, cdmb = cd0b + 7.5;
        // Skip the NW-SE Crown Fracture Notch around FRA_DEG = 131.78 deg
        if (angDiff(cdmb, arc.crownFractureDeg) < 15.5) continue;
        slabs.push({
          level: 5, kind: 'crown_ring_' + cr, mat: cRing.mat, thick: 0.38, y: cRing.y,
          pts: wedgePts(cRing.r0, cRing.r1, cd0b, cd1b, cRing.y)
        });
        if (cs % 4 === 0) {
          var cp = cPt(0.5 * (cRing.r0 + cRing.r1), cdmb, 0, cRing.y);
          var cKey = cr === 0 ? 'pa_planter' : (cr === 1 ? 'pa_cold_frame' : (cs === 0 ? 'voth_shrine_lantern' : 'voth_planter'));
          furn.push({
            key: cKey, x: cp[0], y: cRing.y, z: cp[1], ry: -(cdmb * DEG),
            building: 'forest_ring_arcology', room: cRing.room, wealth: 0.65, setting: 'outdoor'
          });
        }
      }
    }
    // Helical Crown Stair Cascades linking y=600 -> 632 -> 664 along 45, 225, 315 deg (clear of 131.8 deg fracture, slope <= 0.35)
    var CROWN_STAIR_DEGS = [45.0, 225.0, 315.0];
    for (var csi = 0; csi < CROWN_STAIR_DEGS.length; csi++) {
      var csd = CROWN_STAIR_DEGS[csi];
      stairs.push({
        id: 'crown_stair_b0_b1_' + csi + 'a', level: 5, render: true,
        a: cPt(246.0, csd, 0, 600.0), b: cPt(236.0, csd + 12.0, 0, 616.0), w: 5.2, mat: 'ancientStone'
      });
      slabs.push({
        level: 5, kind: 'crown_stair_landing', mat: 'ancientStone', thick: 0.32, y: 616.0,
        pts: wedgePts(230.0, 242.0, csd + 9.0, csd + 15.0, 616.0)
      });
      stairs.push({
        id: 'crown_stair_b0_b1_' + csi + 'b', level: 5, render: true,
        a: cPt(236.0, csd + 12.0, 0, 616.0), b: cPt(222.0, csd, 0, 632.0), w: 5.2, mat: 'ancientStone'
      });
      stairs.push({
        id: 'crown_stair_b1_b2_' + csi + 'a', level: 5, render: true,
        a: cPt(176.0, csd, 0, 632.0), b: cPt(166.0, csd + 16.0, 0, 648.0), w: 4.8, mat: 'ancientStone'
      });
      slabs.push({
        level: 5, kind: 'crown_stair_landing', mat: 'ancientStone', thick: 0.32, y: 648.0,
        pts: wedgePts(160.0, 172.0, csd + 13.0, csd + 19.0, 648.0)
      });
      stairs.push({
        id: 'crown_stair_b1_b2_' + csi + 'b', level: 5, render: true,
        a: cPt(166.0, csd + 16.0, 0, 648.0), b: cPt(152.0, csd, 0, 664.0), w: 4.8, mat: 'ancientStone'
      });
    }

    return {
      id: 'forest_ring_arcology',
      levels: [
        { level: 1, name: 'L1 Foot Arcade & Vaults (+44m)', y0: 44.0, y1: 58.0 },
        { level: 2, name: 'L2 Lower Barrel Waystations (+111..240m)', y0: 60.0, y1: 280.0 },
        { level: 3, name: 'L3 Outer Wheel & Cider Tube (+294..316m)', y0: 290.0, y1: 325.0 },
        { level: 4, name: 'L4 Upper Barrel Waystations (+347..538m)', y0: 330.0, y1: 585.0 },
        { level: 5, name: 'L5 Stepped Botanical Crown (+600..672m)', y0: 595.0, y1: 780.0 }
      ],
      slabs: slabs,
      stairs: stairs,
      walls: walls,
      doors: doors,
      furn: furn
    };
  }

  TORUS.buildArcologyStage4 = buildArcologyStage4;
})(typeof window !== 'undefined' ? window : globalThis);
