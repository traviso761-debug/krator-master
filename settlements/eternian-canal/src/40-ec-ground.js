// prefix: ec
// ================================================================= SHUANG-ZHA — Scale Model 5.1 ground & hydraulic trenching ([G data])
// Centered at px 450.5, 782.0 (SE shore of Jing-Hai +45.87 m ASL, settlement pin 451, 782).
// Town axis: SX up-canal (SE bearing 138 deg toward Hak-Ma foothills), UX cross-canal (NE bearing 48 deg).
// Built on KCANAL.frame; zero DOM, zero THREE, zero Math.random.
var EC_GROUND = (function () {
  'use strict';
  var M = EC_MODEL;
  /* Bearing 138 deg (SE, up-canal): sin(138 deg) = 0.6691306064, -cos(138 deg) = 0.7431448255 */
  var SX = [0.6691306064, 0.7431448255];
  var UX = [0.7431448255, -0.6691306064];
  var FRAME = KCANAL.frame({ sx: SX, ux: UX });
  var P0 = 45.87, P1 = 52.47, P2 = 58.87, P3 = 61.87;

  var ecClamp = KCANAL.clamp;
  var ecSmooth = KCANAL.smooth;
  var ecLerp = KCANAL.lerp;

  var at = FRAME.at;
  var uOf = FRAME.uOf;
  var sOf = FRAME.sOf;
  var us = FRAME.us;
  function fromPx(px, py) { return [(px - M.cx) * M.cell, (py - M.cy) * M.cell]; }
  function toPx(x, z) { return [M.cx + x / M.cell, M.cy + z / M.cell]; }

  /* Building (+z front) yaws and Vessel (+x bow) yaws */
  var YAW_S = FRAME.YAW_S, YAW_NS = FRAME.YAW_NS, YAW_U = FRAME.YAW_U, YAW_NU = FRAME.YAW_NU;
  var VYAW_S = FRAME.VYAW_S, VYAW_NS = FRAME.VYAW_NS, VYAW_U = FRAME.VYAW_U, VYAW_NU = FRAME.VYAW_NU;

  function cellH(ix, iy) {
    var cx = ecClamp(ix, 0, M.nx - 1), cy = ecClamp(iy, 0, M.ny - 1);
    return M.hd[cy * M.nx + cx] * 0.1;
  }
  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function model(x, z) {
    var fx = (M.cx - M.px0) + x / M.cell;
    var fy = (M.cy - M.py0) + z / M.cell;
    var ix = Math.floor(fx), iy = Math.floor(fy);
    var tx = fx - ix, ty = fy - iy;
    var r0 = cr(cellH(ix - 1, iy - 1), cellH(ix, iy - 1), cellH(ix + 1, iy - 1), cellH(ix + 2, iy - 1), tx);
    var r1 = cr(cellH(ix - 1, iy), cellH(ix, iy), cellH(ix + 1, iy), cellH(ix + 2, iy), tx);
    var r2 = cr(cellH(ix - 1, iy + 1), cellH(ix, iy + 1), cellH(ix + 1, iy + 1), cellH(ix + 2, iy + 1), tx);
    var r3 = cr(cellH(ix - 1, iy + 2), cellH(ix, iy + 2), cellH(ix + 1, iy + 2), cellH(ix + 2, iy + 2), tx);
    return cr(r0, r1, r2, r3, ty);
  }

  function polyTrack(pts, u, s) {
    var bestD = 1e9, bestT = 0, bestY = 0, acc = 0, tot = 0;
    var i, ax, az, bx, bz, dx, dz, len2, len, t, px, pz, d;
    for (i = 0; i < pts.length - 1; i++) {
      tot += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    }
    for (i = 0; i < pts.length - 1; i++) {
      ax = pts[i][0]; az = pts[i][1];
      bx = pts[i + 1][0]; bz = pts[i + 1][1];
      dx = bx - ax; dz = bz - az;
      len2 = dx * dx + dz * dz;
      len = Math.sqrt(len2);
      t = len2 > 1e-9 ? ecClamp(((u - ax) * dx + (s - az) * dz) / len2, 0, 1) : 0;
      px = ax + dx * t; pz = az + dz * t;
      d = Math.hypot(u - px, s - pz);
      if (d < bestD) {
        bestD = d;
        bestT = tot > 1e-6 ? (acc + len * t) / tot : 0;
        bestY = pts[i][2] + (pts[i + 1][2] - pts[i][2]) * t;
      }
      acc += len;
    }
    return { d: bestD, t: bestT, y: bestY };
  }

  /* Hak-Ma mainstem (r012, Q = 379.5 m3/s) in (u, s, wlev_ASL, halfW) */
  var HAK_MA_US = [
    [250, 1260, 69.20, 26],
    [195, 1060, 64.50, 27],
    [155, 920, 61.87, 30],
    [180, 875, 58.10, 26],
    [295, 770, 52.20, 28],
    [395, 620, 49.40, 30],
    [455, 340, 47.90, 32],
    [485, -40, 46.70, 35],
    [505, -430, 45.87, 40],
    [520, -680, 45.87, 46]
  ];

  /* Lok-Ma spate tributary (r305, Q = 29.2 m3/s) crossing s = +680 under P2 aqueduct (arch soffit +55.10 m) */
  var LOK_MA_US = [
    [-640, 770, 56.40, 9],
    [-340, 726, 53.40, 9.5],
    [-90, 692, 51.35, 10],
    [0, 680, 51.00, 10.5],
    [95, 667, 50.65, 10.5],
    [255, 642, 49.95, 11],
    [395, 620, 49.40, 12]
  ];

  /* Oriented rectangular canal/basin trench boxes in (u, s): [u0, u1, s0, s1, bedY, batter, id, pound]
     Note: flat bed extends ~1.3 m under the solid 3.2 m dressed-stone canal quay walls so zero diagonal terrain
     grid triangles ever poke sawtooth wedges above the water surface along canal edges!
     P2 aqueduct span s in [656, 704] is omitted so Lok-Ma flows cleanly underneath! */
  var TRENCHES = [
    /* P0 Harbour basin, drydock & twin-lock wide approach (+45.87 m water) */
    [-196, 196, -625, -429, 41.87, 2.8, 'harbour_basin', 'P0'],
    [-153, -117, -456, -412, 43.20, 1.1, 'drydock_basin', 'P0'],
    [-9.6, 9.6, -430, -395.5, 43.07, 1.0, 'p0_approach', 'P0'],
    /* L1 Twin-Lock Flight pits (L1a u=-4.8, L1b u=+4.8, central island pier u in [-2.0, +2.0] kept solid) */
    [-8.6, -1.8, -396, -368, 43.67, 0.8, 'lock_L1a_low', 'L1'],
    [1.8, 8.6, -396, -368, 43.67, 0.8, 'lock_L1b_low', 'L1'],
    [-8.6, -1.8, -368, -340, 47.17, 0.8, 'lock_L1a_high', 'L1'],
    [1.8, 8.6, -368, -340, 47.17, 0.8, 'lock_L1b_high', 'L1'],
    /* P1 Lock Forebays, Middle Town Trunk, Turning Basin, East Kiln Lateral & West Market Lateral (+52.47 m water) */
    [-9.6, 9.6, -340.5, -310, 49.97, 0.9, 'p1_l1_forebay', 'P1'],
    [-6.9, 6.9, -310, 348, 49.97, 0.9, 'p1_trunk', 'P1'],
    [-9.6, 9.6, 348, 380.5, 49.97, 0.9, 'p1_l2_forebay', 'P1'],
    [-29.4, 29.4, -25.2, 25.2, 49.67, 1.0, 'p1_turning_basin', 'P1'],
    [5.5, 346.0, 104.9, 115.1, 50.37, 0.85, 'p1_east_arm', 'P1'],
    [234.9, 245.1, -91, 251, 50.37, 0.85, 'p1_east_leg', 'P1'],
    [-346.0, -5.5, -115.1, -104.9, 50.37, 0.85, 'p1_west_arm', 'P1'],
    [-225.1, -214.9, -261, 41, 50.37, 0.85, 'p1_west_leg', 'P1'],
    /* L2 Twin-Lock Flight pits (P1 +52.47 <-> P2 +58.87) */
    [-8.6, -1.8, 380, 408, 50.47, 0.8, 'lock_L2a_low', 'L2'],
    [1.8, 8.6, 380, 408, 50.47, 0.8, 'lock_L2b_low', 'L2'],
    [-8.6, -1.8, 408, 436, 53.67, 0.8, 'lock_L2a_high', 'L2'],
    [1.8, 8.6, 408, 436, 53.67, 0.8, 'lock_L2b_high', 'L2'],
    /* P2 Lock Forebay, Upper Feeder south & north of Lok-Ma aqueduct + Settling Basin (+58.87 m water) */
    [-9.6, 9.6, 435.5, 468, 56.47, 0.9, 'p2_l2_forebay', 'P2'],
    [-6.0, 6.0, 468, 655.5, 56.47, 0.85, 'p2_lower_reach', 'P2'],
    [-6.0, 6.0, 704.5, 722, 56.47, 0.85, 'p2_north_abut', 'P2'],
    [-23.8, 23.8, 719, 811, 55.87, 0.95, 'p2_settling_basin', 'P2'],
    [-3.8, 76.8, 806.5, 815.5, 56.87, 0.8, 'p2_feeder_bend', 'P2'],
    [68.2, 76.8, 810, 868, 56.87, 0.8, 'p2_feeder_head', 'P2'],
    /* P3 Intake Headrace behind Sluice Gate (+61.87 m water) */
    [67.5, 152.5, 868, 882.5, 59.37, 0.9, 'p3_headrace', 'P3']
  ];

  var MOLES = [
    [-204, -188, -625, -430, 46.15],
    [-204, -52, -625, -609, 46.15],
    [188, 204, -625, -430, 46.15],
    [52, 204, -625, -609, 46.15]
  ];

  function boxDist(u, s, u0, u1, s0, s1) {
    var du = u < u0 ? u0 - u : u > u1 ? u - u1 : 0;
    var ds = s < s0 ? s0 - s : s > s1 ? s - s1 : 0;
    return Math.hypot(du, ds);
  }

  function terraceBase(u, s) {
    var y;
    if (s < -430) {
      y = ecLerp(43.20, 38.28, ecSmooth(-430, -760, s));
      if (Math.abs(u) > 220) {
        y = ecLerp(y, 47.60 + (Math.abs(u) - 220) * 0.012, ecSmooth(220, 420, Math.abs(u)));
      }
      return y;
    }
    if (s < -396) {
      return 47.50 + 0.18 * ecSmooth(40, 320, Math.abs(u));
    }
    if (s < -340) {
      return ecLerp(47.50, 53.95, (s - (-396)) / 56.0) + 0.15 * ecSmooth(35, 300, Math.abs(u));
    }
    if (s < 380) {
      return 53.95 + 0.35 * ecSmooth(24, 340, Math.abs(u)) + 0.15 * ecSmooth(-340, 380, s);
    }
    if (s < 436) {
      return ecLerp(54.10, 60.35, (s - 380) / 56.0) + 0.15 * ecSmooth(30, 260, Math.abs(u));
    }
    if (s < 868) {
      return 60.35 + 0.30 * ecSmooth(436, 868, s) + 0.25 * ecSmooth(40, 260, Math.abs(u));
    }
    return ecLerp(60.65, 63.65, ecSmooth(856, 882, s)) + Math.max(0, s - 920) * 0.018;
  }

  function h(x, z) {
    var hMod = model(x, z);
    var u = uOf(x, z), s = sOf(x, z);
    var wu = 1 - ecSmooth(620, 1280, Math.abs(u));
    var ws = (1 - ecSmooth(1040, 1520, s)) * (1 - ecSmooth(-780, -1450, s));
    var wTown = wu * ws;
    if (s < -620 && Math.abs(u) < 950) {
      hMod = Math.min(hMod, ecLerp(42.0, 38.28, ecSmooth(-620, -1200, s)));
    }
    var y = wTown > 1e-4 ? ecLerp(hMod, terraceBase(u, s), wTown) : hMod;

    if (u > -780 && u < -330 && s > -450 && s < -40) {
      var wPad = (1 - ecSmooth(180, 240, Math.abs(u + 540))) * (1 - ecSmooth(150, 215, Math.abs(s + 245)));
      if (wPad > 0) y = ecLerp(y, 48.30 + (s + 430) * 0.004, wPad * 0.85);
    }
    if (u > 440 && u < 860 && s > 480 && s < 960) {
      var wKao = (1 - ecSmooth(150, 220, Math.abs(u - 645))) * (1 - ecSmooth(170, 240, Math.abs(s - 720)));
      if (wKao > 0) y = ecLerp(y, 66.80 + (s - 720) * 0.010 + (u - 645) * 0.006, wKao * 0.85);
    }

    if (u > 60 && u < 640 && s > -720 && s < 1300) {
      var hm = polyTrack(HAK_MA_US, u, s);
      var hmW = ecLerp(27, 42, 1 - hm.t);
      if (hm.d < hmW + 28) {
        var hmBed = hm.y - 2.90;
        if (Math.abs(s - 906) < 9 && u > 125 && u < 188) hmBed = 60.20;
        var khm = 1 - ecSmooth(hmW * 0.72, hmW + 24, hm.d);
        y = ecLerp(y, hmBed, khm);
      }
    }

    if (u > -660 && u < 430 && s > 585 && s < 810) {
      var lm = polyTrack(LOK_MA_US, u, s);
      var lmW = 10.5;
      if (lm.d < lmW + 17) {
        var shoulder = Math.abs(u) < 9.5 ? 6.5 : 16.5;
        var lmBed = lm.y - 1.80;
        var klm = 1 - ecSmooth(lmW * 0.68, lmW + shoulder, lm.d);
        y = ecLerp(y, lmBed, klm);
      }
    }

    if (Math.abs(u) < 380 && s > -640 && s < 910) {
      for (var i = 0; i < TRENCHES.length; i++) {
        var tr = TRENCHES[i];
        var d = boxDist(u, s, tr[0], tr[1], tr[2], tr[3]);
        if (d < tr[5]) {
          var kt = 1 - ecSmooth(0, tr[5], d);
          y = Math.min(y, ecLerp(y, tr[4], kt));
        }
      }
    }

    if (s < -425 && s > -635 && Math.abs(u) < 215) {
      for (var m = 0; m < MOLES.length; m++) {
        var ml = MOLES[m];
        var dm = boxDist(u, s, ml[0], ml[1], ml[2], ml[3]);
        if (dm < 5.0) {
          y = Math.max(y, ecLerp(ml[4], 42.0, ecSmooth(0, 5.0, dm)));
        }
      }
    }

    return y;
  }

  function poundWaterAt(x, z) {
    var s = sOf(x, z);
    if (s < -382) return P0;
    if (s < 394) return P1;
    if (s < 868) return P2;
    return P3;
  }

  return {
    FRAME: FRAME,
    SX: SX, UX: UX,
    YAW_S: YAW_S, YAW_NS: YAW_NS, YAW_U: YAW_U, YAW_NU: YAW_NU,
    VYAW_S: VYAW_S, VYAW_NS: VYAW_NS, VYAW_U: VYAW_U, VYAW_NU: VYAW_NU,
    P0: P0, P1: P1, P2: P2, P3: P3,
    HAK_MA_US: HAK_MA_US, LOK_MA_US: LOK_MA_US, TRENCHES: TRENCHES, MOLES: MOLES,
    at: at, uOf: uOf, sOf: sOf, us: us, fromPx: fromPx, toPx: toPx,
    model: model, h: h, poundWaterAt: poundWaterAt,
    clamp: ecClamp, smooth: ecSmooth, lerp: ecLerp
  };
})();
