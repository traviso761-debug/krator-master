/* ================================================================= URUNDASHI GROUND, STEPPE BENCH, MOAT & DUBNOSRIBA HEADWATERS
   [G data] Pure closed-form elevation, slope, snowmelt rivers, defensive moat trench, and world-frame transform for Urundashi
   (srbp1bvh1r, px 779,1153 on scale model 5.1; settlements/urundashi/PLAN.md). No THREE, no DOM.
   Local coordinates: metres from px (779, 1153), +x east, +z south, -z north toward Yamu-Qappu / Siru-Yamu.
   Vertical datum: UR.DATUM = 3154.0 m asl (Dubnosriba / Ayn al-Dubnu confluence = local y 0.0 m; town centre = +65.7 m). */

var UR = (function () {
  'use strict';

  var DATUM = 3154.0;
  var SEED = 77953;
  var PIN = [779, 1153];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* Deterministic noise through core/rand (KRAND) */
  function krandField(x, z, oct, salt) {
    return KRAND.fbm(x, z, 0, oct == null ? 3 : oct, salt == null ? SEED : salt);
  }

  function segDist(x, z, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    var t = L2 > 1e-9 ? clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    var px = ax + dx * t, pz = az + dz * t;
    return [Math.hypot(x - px, z - pz), t, px, pz];
  }

  function polyNear(x, z, pts) {
    var bestD = 1e9, bestY = 0, bestHw = 8, bestS = 0, acc = 0;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var segLen = Math.hypot(b[0] - a[0], b[1] - a[1]);
      var q = segDist(x, z, a[0], a[1], b[0], b[1]);
      if (q[0] < bestD) {
        bestD = q[0];
        bestY = mix(a[2], b[2], q[1]);
        bestHw = mix(a[3], b[3], q[1]);
        bestS = acc + segLen * q[1];
      }
      acc += segLen;
    }
    return { d: bestD, wy: bestY, hw: bestHw, s: bestS };
  }

  function boxMask(x, z, x0, z0, x1, z1, fx, fz) {
    var ex = fx == null ? 28 : fx;
    var ez = fz == null ? ex : fz;
    if (x <= x0 - ex || x >= x1 + ex || z <= z0 - ez || z >= z1 + ez) return 0;
    return smooth(x0 - ex, x0 + ex, x) * smooth(x1 + ex, x1 - ex, x) *
           smooth(z0 - ez, z0 + ez, z) * smooth(z1 + ez, z1 - ez, z);
  }

  /* ---- 1. SNOWMELT RIVERS & MILL-RACE LEAT ([x, z, waterY, halfWidth]) ---- */
  /* r011 Dubnosriba (Dubnu-Narun, 422.8 m3/s trunk river rising SW of Urundashi, flowing ESE -> WNW) */
  var RIV_DUBNU = [
    [2400, 1080, 18.5, 16],
    [1600, 970, 13.4, 17],
    [900, 880, 8.6, 17],
    [280, 810, 4.4, 18],
    [-160, 760, 1.8, 19],
    [-460, 720, 0.0, 20],
    [-980, 640, -3.2, 20],
    [-1650, 510, -7.5, 21],
    [-2500, 340, -12.8, 22]
  ];

  /* Ayn al-Dubnu: limestone spring brook descending from NE bench past the East moat weir & SW stud/stills into Dubnosriba */
  var RIV_AYN = [
    [1450, -980, 79.8, 6.0],
    [980, -680, 74.6, 6.5],
    [590, -390, 69.8, 7.0],
    [595, 110, 66.2, 7.5],
    [410, 390, 51.5, 8.0],
    [120, 535, 32.5, 8.5],
    [-210, 655, 14.5, 9.0],
    [-460, 720, 0.0, 9.5]
  ];

  /* Rabad al-Dubnu mill-race & cavalry remount watering leat */
  var LEAT_STUD = [
    [410, 390, 51.5, 3.4],
    [150, 445, 45.8, 3.6],
    [-110, 495, 39.2, 3.6],
    [-310, 610, 21.0, 3.4],
    [-460, 720, 0.0, 3.4]
  ];

  var RIVERS = [
    { id: 'r011', name: 'Dubnosriba (Dubnu-Nārun)', q: 165, pts: RIV_DUBNU },
    { id: 'r_ayn', name: 'ʿAyn al-Dubnu', q: 28, pts: RIV_AYN },
    { id: 'leat.stud', name: 'Rabaḍ al-Dubnu Mill-Race', q: 5, pts: LEAT_STUD }
  ];

  /* ---- 2. DEFENSIVE MOAT (KCITY.grid moat record registered by 41-ur-city.js before KCITY runs) ---- */
  var MOAT = null;
  var MOAT_BOX = null;

  function setMoat(M) {
    MOAT = M && M.line ? M : null;
    if (!MOAT) {
      MOAT_BOX = null;
      return;
    }
    var pad = MOAT.width * 0.5 + 24;
    var xs = MOAT.line.map(function (p) { return p[0]; });
    var zs = MOAT.line.map(function (p) { return p[1]; });
    MOAT_BOX = [
      Math.min.apply(null, xs) - pad,
      Math.max.apply(null, xs) + pad,
      Math.min.apply(null, zs) - pad,
      Math.max.apply(null, zs) + pad
    ];
  }

  function moatDist(x, z) {
    if (!MOAT || !MOAT_BOX) return 1e9;
    if (x < MOAT_BOX[0] || x > MOAT_BOX[1] || z < MOAT_BOX[2] || z > MOAT_BOX[3]) return 1e9;
    var best = 1e9;
    var L = MOAT.line;
    for (var i = 1; i < L.length; i++) {
      var d = segDist(x, z, L[i - 1][0], L[i - 1][1], L[i][0], L[i][1])[0];
      if (d < best) best = d;
    }
    return best;
  }

  function nearBridge(x, z, rad) {
    if (!MOAT || !MOAT.bridges) return false;
    var r = rad == null ? 9.0 : rad;
    for (var i = 0; i < MOAT.bridges.length; i++) {
      var b = MOAT.bridges[i];
      if (Math.hypot(x - b.x, z - b.z) <= r) return true;
    }
    return false;
  }

  /* ---- 3. BASE STEPPE & VALLEY TERRAIN (WITHOUT MOAT TRENCH) ---- */
  function localSteppeH(x, z) {
    var nBig = (krandField(x * 0.00065 + 2.3, z * 0.00065 - 4.1, 3, 77901) - 0.5) * 11.0;
    var nMed = (krandField(x * 0.0024 - 1.9, z * 0.0024 + 3.6, 2, 77902) - 0.5) * 2.8;

    /* Gentle 1.2% steppe glacis sloping NE -> SW across the walled town so both moat branches flow monotonically NE -> SW */
    var townPad = boxMask(x, z, -520, -480, 560, 390, 140, 120);
    var glacisH = 65.7 + x * 0.0058 - z * 0.0076 + nMed * (1 - 0.72 * townPad);

    /* Rolling upland steppe outside the town bench, dipping south-west into the Dubnosriba meadow basin */
    var basinDip = smooth(280, 820, z + x * 0.16) * 52.0;
    var rawH = glacisH - basinDip * (1 - 0.85 * townPad) + nBig * (1 - 0.82 * townPad);

    /* Gentle dampening of micro-relief across Rabad al-Dubnu cavalry stud paddocks without creating a terrace cliff */
    var studBench = boxMask(x, z, -340, 410, 260, 590, 95, 75);
    if (studBench > 0) {
      rawH -= nBig * 0.55 * studBench;
    }

    /* Carve smooth alluvial channels for Dubnosriba, Ayn al-Dubnu, and the mill-race */
    var qD = polyNear(x, z, RIV_DUBNU);
    if (qD.d < qD.hw + 95) {
      var wVal = smooth(qD.hw + 95, qD.hw + 8, qD.d);
      var bankY = qD.wy + 2.4 + nMed * 0.25;
      rawH = mix(rawH, Math.min(rawH, bankY), wVal);
      if (qD.d < qD.hw + 12) {
        var wBed = smooth(qD.hw + 12, Math.max(2, qD.hw - 5), qD.d);
        rawH = mix(rawH, qD.wy - 2.6, wBed);
      }
    }

    var qA = polyNear(x, z, RIV_AYN);
    if (qA.d < qA.hw + 85) {
      var wA = smooth(qA.hw + 85, qA.hw + 6, qA.d);
      rawH = mix(rawH, Math.min(rawH, qA.wy + 1.5), wA);
      if (qA.d < qA.hw + 7) {
        var wABed = smooth(qA.hw + 7, Math.max(1.5, qA.hw - 2.5), qA.d);
        rawH = mix(rawH, qA.wy - 1.5, wABed);
      }
    }

    var qL = polyNear(x, z, LEAT_STUD);
    if (qL.d < qL.hw + 75) {
      var wL = smooth(qL.hw + 75, qL.hw + 4.0, qL.d);
      rawH = mix(rawH, Math.min(rawH, qL.wy + 1.2), wL);
      if (qL.d < qL.hw + 4.5) {
        var wLBed = smooth(qL.hw + 4.5, Math.max(1.0, qL.hw - 1.2), qL.d);
        rawH = mix(rawH, qL.wy - 0.95, wLBed);
      }
    }

    return rawH;
  }

  function baseH(x, z) {
    var r = Math.hypot(x, z);
    if (r >= 3800 && typeof UR_MODEL !== 'undefined') {
      return UR_MODEL.bilinear(x, z) + (krandField(x * 0.0017 + 5.1, z * 0.0017 - 2.9, 2, 77909) - 0.5) * 2.0;
    }
    var loc = localSteppeH(x, z);
    if (r <= 2300 || typeof UR_MODEL === 'undefined') return loc;
    var t = smooth(2300, 3800, r);
    var mod = UR_MODEL.bilinear(x, z) + (krandField(x * 0.0017 + 5.1, z * 0.0017 - 2.9, 2, 77909) - 0.5) * 2.0;
    return mix(loc, mod, t);
  }

  function moatLevel(x, z) {
    return baseH(x, z) - 1.35;
  }

  function inMoat(x, z, margin) {
    if (!MOAT) return false;
    var m = margin == null ? 0 : margin;
    return moatDist(x, z) < MOAT.width * 0.5 + m;
  }

  function h(x, z) {
    var y = baseH(x, z);
    if (!MOAT) return y;
    var d = moatDist(x, z);
    var half = MOAT.width * 0.5;
    if (d >= half + 5.5) return y;
    return y - 2.95 * smooth(half + 5.5, Math.max(1.0, half - 1.5), d);
  }

  function slope(x, z, e) {
    var d = e == null ? 3.0 : e;
    var gx = (h(x + d, z) - h(x - d, z)) / (2 * d);
    var gz = (h(x, z + d) - h(x, z - d)) / (2 * d);
    return Math.hypot(gx, gz);
  }

  function waterAt(x, z) {
    if (MOAT && !nearBridge(x, z, 7.5)) {
      var dm = moatDist(x, z);
      if (dm < MOAT.width * 0.5 + 0.8) {
        var mw = moatLevel(x, z);
        var ghM = h(x, z);
        if (ghM < mw + 0.25) {
          return { wet: true, y: mw, depth: Math.max(0, mw - ghM), id: 'moat.qasba' };
        }
      }
    }
    var best = null;
    for (var i = 0; i < RIVERS.length; i++) {
      var q = polyNear(x, z, RIVERS[i].pts);
      if (q.d <= q.hw + 1.2) {
        var gh = h(x, z);
        if (gh < q.wy + 0.35 && (!best || q.wy - gh > best.depth)) {
          best = { wet: true, y: q.wy, depth: Math.max(0, q.wy - gh), id: RIVERS[i].id };
        }
      }
    }
    return best || { wet: false, y: -999, depth: 0, id: null };
  }

  function tierAt(x, z) {
    var wt = waterAt(x, z);
    if (wt.wet) return wt.id === 'moat.qasba' ? 'moat' : 'river';
    if (inMoat(x, z, 5.5)) return 'moat-bank';
    var y = h(x, z);
    if (Math.abs(x) < 380 && Math.abs(z) < 360) return 'walled-qasba';
    if (y < 24) return 'dubnu-meadow';
    if (y < 48) return 'stud-terrace';
    return 'steppe-bench';
  }

  function worldFrame() {
    return {
      settlement: 'srbp1bvh1r',
      name: 'Urundashi',
      px: PIN[0],
      py: PIN[1],
      cellM: 2000,
      datumM: DATUM,
      rimElevM: +(DATUM + h(0, 0)).toFixed(1),
      confluenceElevM: DATUM
    };
  }

  return {
    DATUM: DATUM,
    SEED: SEED,
    PIN: PIN,
    RIVERS: RIVERS,
    h: h,
    base: baseH,
    slope: slope,
    waterAt: waterAt,
    tierAt: tierAt,
    polyNear: polyNear,
    segDist: segDist,
    setMoat: setMoat,
    inMoat: inMoat,
    nearBridge: nearBridge,
    moatLevel: moatLevel,
    moat: function () { return MOAT; },
    worldFrame: worldFrame
  };
})();

var urundashiH = UR.h;
var urundashiSlope = UR.slope;
var urundashiWater = UR.waterAt;
var urundashiWorldFrame = UR.worldFrame;

if (typeof globalThis !== 'undefined') {
  globalThis.UR = UR;
  globalThis.urundashiH = urundashiH;
  globalThis.urundashiSlope = urundashiSlope;
  globalThis.urundashiWater = urundashiWater;
  globalThis.urundashiWorldFrame = urundashiWorldFrame;
}
