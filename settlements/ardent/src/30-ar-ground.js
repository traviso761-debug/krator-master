/* ================================================================= ARDENT — Scale Model 5.1 ground, burn & citadel crag
   [G data] Pure data and functions over AR_MODEL (28-ar-model.js) and KRAND (08-core-rand.js): no THREE, no DOM.
   Provides:
     AR_GROUND.datum             +2801.9 m ASL at pin (830, 553)
     AR_GROUND.burnZ(x)          centerline z of Ardent Burn (Mekam-aru headwater) flowing E -> W north of the North Wall
     AR_GROUND.burnBedY(x)       monotonically falling stream bed y along x (+820 -> -820)
     AR_GROUND.burnWaterY(x)     stream surface y along x
     AR_GROUND.h(x, z)           shaped ground after smooth cosine-eased walled burgh, Thing-Crag, burn & bench deltas
     AR_GROUND.hNoBurn(x, z)     shaped ground without stream trench (for KCITY slope raster)
     AR_GROUND.slope(x, z, e)    terrain gradient magnitude |dh/ds|
     AR_GROUND.nearGrid()        deterministic 8 m grid over [-2000, +2000] registered in KDRAWN
     AR_GROUND.farGrid()         deterministic 400 m skirt over [-26000, +26000] registered in KDRAWN */
var AR_GROUND = (function () {
  'use strict';
  var M = AR_MODEL;
  var SEED = KRAND.hash(830, 553, 51, 6401);
  var RSEED = KRAND.child(SEED, 'ardent-granite-relief');

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function cosEase(t) {
    if (t <= 0) return 1;
    if (t >= 1) return 0;
    return 0.5 + 0.5 * Math.cos(Math.PI * t);
  }
  function radialBlend(x, z, cx, cz, rFlat, rEase) {
    var d = Math.hypot(x - cx, z - cz);
    if (d <= rFlat) return 1;
    if (d >= rFlat + rEase) return 0;
    return cosEase((d - rFlat) / rEase);
  }
  function boxBlend(x, z, x0, z0, x1, z1, ease) {
    var dx = x < x0 ? x0 - x : x > x1 ? x - x1 : 0;
    var dz = z < z0 ? z0 - z : z > z1 ? z - z1 : 0;
    var d = Math.hypot(dx, dz);
    if (d <= 0) return 1;
    if (d >= ease) return 0;
    return cosEase(d / ease);
  }

  function crm(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function regAt(ix, iy) {
    var cx = clamp(ix, 0, M.rnx - 1), cy = clamp(iy, 0, M.rny - 1);
    return M.regDm[cy * M.rnx + cx] * 0.1;
  }
  function rawModel(x, z) {
    var fx = (M.px - M.rx0) + x / M.cell;
    var fy = (M.py - M.ry0) + z / M.cell;
    var ix = Math.floor(fx), iy = Math.floor(fy);
    var tx = fx - ix, ty = fy - iy;
    var r0 = crm(regAt(ix - 1, iy - 1), regAt(ix, iy - 1), regAt(ix + 1, iy - 1), regAt(ix + 2, iy - 1), tx);
    var r1 = crm(regAt(ix - 1, iy),     regAt(ix, iy),     regAt(ix + 1, iy),     regAt(ix + 2, iy),     tx);
    var r2 = crm(regAt(ix - 1, iy + 1), regAt(ix, iy + 1), regAt(ix + 1, iy + 1), regAt(ix + 2, iy + 1), tx);
    var r3 = crm(regAt(ix - 1, iy + 2), regAt(ix, iy + 2), regAt(ix + 1, iy + 2), regAt(ix + 2, iy + 2), tx);
    return crm(r0, r1, r2, r3, ty);
  }

  function microRelief(x, z) {
    var d = Math.hypot(x, z);
    var att = d > 16000 ? 0 : d > 5000 ? cosEase((d - 5000) / 11000) : 1;
    if (att <= 0) return 0;
    var n1 = (KRAND.fbm(x * 0.0018 + 2.7, z * 0.0018 - 1.9, 2.1, 3, RSEED) - 0.5) * 3.8;
    var n2 = (KRAND.fbm(x * 0.0072 - 4.1, z * 0.0072 + 3.5, 5.4, 2, RSEED) - 0.5) * 0.9;
    return (n1 + n2) * att;
  }
  var ZERO_MICRO = microRelief(0, 0);

  function base(x, z) {
    var pinFade = 1 - radialBlend(x, z, 0, 0, 0, 320);
    return rawModel(x, z) + (microRelief(x, z) - ZERO_MICRO) * pinFade;
  }

  /* Ardent Burn (headwater of Mekam-aru r024): flows E (+820) -> W (-820) along z ≈ -310 north of the North Curtain Wall */
  function burnZ(x) {
    return -310.0 + 9.0 * Math.sin(x * 0.0062);
  }
  function burnTangent(x) {
    var dzdx = 9.0 * 0.0062 * Math.cos(x * 0.0062);
    var L = Math.hypot(-1, -dzdx);
    return [-1 / L, -dzdx / L];
  }
  function burnWaterY(x) {
    var cx = clamp(x, -860, 860);
    return -7.8 + cx * 0.011;
  }
  function burnBedY(x) {
    return burnWaterY(x) - 1.60;
  }

  var THING_CRAG = { x: 0, z: 342, y: 26.5, rFlat: 126, rEase: 120 };
  var MUSTER_GREEN = { x0: 288, z0: -140, x1: 505, z1: 140, ease: 95, y0: 5.8 };
  var FOUNDRY_BANK = { x0: -235, z0: -445, x1: 235, z1: -340, ease: 70 };
  var ORE_BENCH = { x0: -250, z0: -585, x1: 250, z1: -475, ease: 95 };
  var CROFT_MEADOW = { x0: -535, z0: -155, x1: -292, z1: 155, ease: 95, y0: -3.8 };

  function hNoBurn(x, z) {
    var h = base(x, z);

    /* 1. Walled Capital Burgh Spur (500 x 500 m, ~80% previous area; gentle NW grade toward Ardent Burn) */
    var wb = boxBlend(x, z, -268, -262, 268, 262, 105);
    if (wb > 0) {
      var burghY = 2.4 + 0.011 * x + 0.028 * z;
      h = h * (1 - wb) + burghY * wb;
    }

    /* 2. Upper Thing-Crag Citadel & Nine-Clan Koshki Crown overlooking the South Gate */
    var wc = radialBlend(x, z, THING_CRAG.x, THING_CRAG.z, THING_CRAG.rFlat, THING_CRAG.rEase);
    if (wc > 0) {
      var cragRib = wc * (1 - wc) * 4.2 * (KRAND.fbm(x * 0.022, z * 0.022, 7.1, 2, RSEED) - 0.35);
      var cragTop = THING_CRAG.y + 0.020 * (z - THING_CRAG.z);
      h = h * (1 - wc) + cragTop * wc + cragRib;
    }

    /* 3. East Silk-Trail Muster Green outside East Gate */
    var wm = boxBlend(x, z, MUSTER_GREEN.x0, MUSTER_GREEN.z0, MUSTER_GREEN.x1, MUSTER_GREEN.z1, MUSTER_GREEN.ease);
    if (wm > 0) {
      var my = MUSTER_GREEN.y0 + 0.010 * (x - 390) + 0.014 * z;
      h = h * (1 - wm) + my * wm;
    }

    /* 4. North Burn Foundry Suburb Bank & Opposite Copper/Tin Ore-Hill Bench */
    var wf = boxBlend(x, z, FOUNDRY_BANK.x0, FOUNDRY_BANK.z0, FOUNDRY_BANK.x1, FOUNDRY_BANK.z1, FOUNDRY_BANK.ease);
    if (wf > 0) {
      var fy = burnWaterY(x) + 2.35 + 0.026 * (-340 - z);
      h = h * (1 - wf) + fy * wf;
    }
    var wo = boxBlend(x, z, ORE_BENCH.x0, ORE_BENCH.z0, ORE_BENCH.x1, ORE_BENCH.z1, ORE_BENCH.ease);
    if (wo > 0) {
      var oy = burnWaterY(x) + 11.2 + 0.058 * (-475 - z);
      h = h * (1 - wo) + oy * wo;
    }

    /* 5. West Valley Frostoat & Sheep Croft Meadow outside West Gate */
    var wcr = boxBlend(x, z, CROFT_MEADOW.x0, CROFT_MEADOW.z0, CROFT_MEADOW.x1, CROFT_MEADOW.z1, CROFT_MEADOW.ease);
    if (wcr > 0) {
      var cry = CROFT_MEADOW.y0 + 0.012 * (x + 410) + 0.016 * z;
      h = h * (1 - wcr) + cry * wcr;
    }

    return h;
  }

  function hAt(x, z) {
    var h = hNoBurn(x, z);
    if (x > -860 && x < 860) {
      var ex = x < -760 ? cosEase((-760 - x) / 100) : x > 760 ? cosEase((x - 760) / 100) : 1;
      var bz = burnZ(x);
      var dz = Math.abs(z - bz);
      var halfBed = 4.6, bankEase = 16.0;
      if (dz < halfBed + bankEase && ex > 0) {
        var wb = dz <= halfBed ? 1 : cosEase((dz - halfBed) / bankEase);
        var targetBed = burnBedY(x);
        var bankFloor = burnWaterY(x) + 1.50;
        if (dz > halfBed && h < bankFloor) {
          h = h * (1 - wb * 0.5) + bankFloor * (wb * 0.5);
        }
        h = h * (1 - wb * ex) + targetBed * (wb * ex);
      }
    }
    return h;
  }

  function slope(x, z, e) {
    var d = e == null ? 4 : e;
    var gx = (hAt(x + d, z) - hAt(x - d, z)) / (2 * d);
    var gz = (hAt(x, z + d) - hAt(x, z - d)) / (2 * d);
    return Math.hypot(gx, gz);
  }

  var NEAR_CACHE = null, FAR_CACHE = null;
  function nearGrid() {
    if (NEAR_CACHE) return NEAR_CACHE;
    var x0 = -2000, z0 = -2000, dx = 8, dz = 8, nx = 500, nz = 500;
    var row = nx + 1, H = new Float32Array(row * (nz + 1));
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        H[iz * row + ix] = hAt(x0 + ix * dx, z);
      }
    }
    NEAR_CACHE = { x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H };
    return NEAR_CACHE;
  }

  function farGrid() {
    if (FAR_CACHE) return FAR_CACHE;
    var x0 = -26000, z0 = -26000, dx = 400, dz = 400, nx = 130, nz = 130;
    var row = nx + 1, H = new Float32Array(row * (nz + 1));
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        var x = x0 + ix * dx;
        var y = hAt(x, z);
        var inside = boxBlend(x, z, -1720, -1720, 1720, 1720, 260);
        H[iz * row + ix] = y - inside * 36.0;
      }
    }
    FAR_CACHE = { x0: x0, z0: z0, dx: dx, dz: dz, nx: nx, nz: nz, h: H };
    return FAR_CACHE;
  }

  function registerDrawn() {
    if (typeof KDRAWN === 'undefined') return null;
    KDRAWN.clear();
    var ng = KDRAWN.grid(nearGrid());
    var fg = KDRAWN.grid(farGrid());
    KDRAWN.add(ng);
    KDRAWN.add(fg);
    return { near: ng, far: fg };
  }
  registerDrawn();

  return {
    datum: M.datum,
    seed: SEED,
    thingCrag: THING_CRAG,
    musterGreen: MUSTER_GREEN,
    base: base,
    burnZ: burnZ,
    burnTangent: burnTangent,
    burnWaterY: burnWaterY,
    burnBedY: burnBedY,
    hNoBurn: hNoBurn,
    h: hAt,
    asl: function (x, z) { return M.datum + hAt(x, z); },
    slope: slope,
    nearGrid: nearGrid,
    farGrid: farGrid,
    registerDrawn: registerDrawn
  };
})();
