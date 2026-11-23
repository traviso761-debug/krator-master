/* ================================================================= SKYWATCH — Scale Model 5.1 ground & deltas
   [G data] Pure data and functions over SW_MODEL (28-sw-model.js) and KRAND (08-core-rand.js): no THREE, no DOM.
   Provides:
     SW_GROUND.datum             +3745.5 m ASL at pin (776, 470)
     SW_GROUND.base(x, z)        1:1 Scale Model 5.1 ground relative to datum (bicubic over 2 km grid + basalt micro-relief)
     SW_GROUND.h(x, z)           shaped ground after <= 4 cosine-eased site delta families (crag, benches, cisterns, moot)
     SW_GROUND.asl(x, z)         elevation in metres above sea level (datum + h(x, z))
     SW_GROUND.slope(x, z, e)    terrain gradient magnitude |dh/ds|
     SW_GROUND.cisterns          the two rock-cut vaulted step-cistern definitions (rimY, floorY, waterY)
     SW_GROUND.nearGrid()        deterministic 10 m grid over [-2200, +2200] registered in KDRAWN
     SW_GROUND.farGrid()         deterministic 400 m skirt over [-28000, +28000] registered in KDRAWN */
var SW_GROUND = (function () {
  'use strict';
  var M = SW_MODEL;
  var SEED = KRAND.hash(776, 470, 51, 8921);
  var RSEED = KRAND.child(SEED, 'basalt-relief');

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

  /* Catmull-Rom 1D kernel for smooth C1 terrain over the 2,000 m/px Scale Model 5.1 grid */
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
    var att = d > 18000 ? 0 : d > 6000 ? cosEase((d - 6000) / 12000) : 1;
    if (att <= 0) return 0;
    var n1 = (KRAND.fbm(x * 0.0016 + 3.1, z * 0.0016 - 1.7, 2.4, 3, RSEED) - 0.5) * 4.2;
    var n2 = (KRAND.fbm(x * 0.0065 - 5.2, z * 0.0065 + 4.3, 6.1, 2, RSEED) - 0.5) * 1.1;
    return (n1 + n2) * att;
  }
  var ZERO_MICRO = microRelief(0, 0);

  function base(x, z) {
    /* Pin (0, 0) sits at exact 0.0 m relative to datum (+3745.5 m ASL); exact 2 km pixels past 8 km stay true to 5.1 */
    var pinFade = 1 - radialBlend(x, z, 0, 0, 0, 260);
    return rawModel(x, z) + (microRelief(x, z) - ZERO_MICRO) * pinFade;
  }

  /* ---- Four cosine-eased [G data] site delta families (PLAN.md §0 & §3) ---- */
  /* 1. Tier I Crag & Signal Beacon pads */
  var CRAG = { x: -620, z: -280, y: 48.0, rFlat: 108, rEase: 150 };
  var BEACON_S = { x: -520, z: 420, y: 18.0, rFlat: 22, rEase: 95 };
  var BEACON_N = { x: -560, z: -620, y: 26.0, rFlat: 20, rEase: 95 };

  /* 2. Tier II-IV Gentle terraced benches & NNW-SSE saddle pass road cut */
  function townTargetY(x, z) {
    /* Gentle WNW-to-ESE & S-to-N sunny aspect slope across the walled pass town, passing through 0.0 m at (0, 0) */
    return -0.022 * x - 0.008 * z;
  }
  var LEE_BENCH = { x0: 350, z0: 90, x1: 730, z1: 490, ease: 130, y0: -7.5 };
  var SKARN_BENCH = { x0: 590, z0: -370, x1: 950, z1: -45, ease: 130, y0: -13.5 };

  /* 3. Two vaulted rock-cut Step-Cisterns in Tier II (aligned to 10 m grid nodes so drawn triangles excavate cleanly) */
  var CISTERNS = [
    {
      id: 'sw.cistern.upper', name: 'Upper Crag-Melt Step-Cistern',
      x: -50, z: -130, rimW: 22, rimD: 30, pitW: 12, pitD: 20,
      rimY: 2.2, floorY: -2.4, waterY: 0.35
    },
    {
      id: 'sw.cistern.lower', name: 'Lower Market Vaulted Step-Cistern',
      x: 190, z: -10, rimW: 22, rimD: 30, pitW: 12, pitD: 20,
      rimY: -4.1, floorY: -8.7, waterY: -5.95
    }
  ];

  /* 4. Tier V Outer Megalithic Silent-Barter Ring (The Silent Moot) & seasonal Sasquatch camp benches */
  var MOOT = { x: 380, z: -1140, y: -21.0, rFlat: 64, rEase: 150 };
  var SQ_PADS = [
    { id: 'sq1', x: 225, z: -1415, y: -26.5, rFlat: 54, rEase: 80 },
    { id: 'sq2', x: 395, z: -1465, y: -27.5, rFlat: 54, rEase: 80 },
    { id: 'sq3', x: 565, z: -1405, y: -29.0, rFlat: 54, rEase: 80 }
  ];

  function shapedNoCistern(x, z) {
    var h = base(x, z);

    /* Family 1: Observatory Crag spur + rugged basalt brow ribs + N/S Beacon pads */
    var wc = radialBlend(x, z, CRAG.x, CRAG.z, CRAG.rFlat, CRAG.rEase);
    if (wc > 0) {
      var skirtRib = wc * (1 - wc) * 5.5 * (KRAND.fbm(x * 0.022, z * 0.022, 9.3, 2, RSEED) - 0.35);
      h = h * (1 - wc) + CRAG.y * wc + skirtRib;
    }
    var wbs = radialBlend(x, z, BEACON_S.x, BEACON_S.z, BEACON_S.rFlat, BEACON_S.rEase);
    if (wbs > 0) h = h * (1 - wbs) + BEACON_S.y * wbs;
    var wbn = radialBlend(x, z, BEACON_N.x, BEACON_N.z, BEACON_N.rFlat, BEACON_N.rEase);
    if (wbn > 0) h = h * (1 - wbn) + BEACON_N.y * wbn;

    /* Family 2: Walled Pass Town, Leeward Caravanserai & Skarn Foundry benches */
    var wt = boxBlend(x, z, -295, -385, 315, 250, 135);
    if (wt > 0) h = h * (1 - wt) + townTargetY(x, z) * wt;

    var wl = boxBlend(x, z, LEE_BENCH.x0, LEE_BENCH.z0, LEE_BENCH.x1, LEE_BENCH.z1, LEE_BENCH.ease);
    if (wl > 0) {
      var ly = LEE_BENCH.y0 - 0.010 * (x - 520) - 0.005 * (z - 280);
      h = h * (1 - wl) + ly * wl;
    }

    var ws = boxBlend(x, z, SKARN_BENCH.x0, SKARN_BENCH.z0, SKARN_BENCH.x1, SKARN_BENCH.z1, SKARN_BENCH.ease);
    if (ws > 0) {
      var sy = SKARN_BENCH.y0 - 0.018 * (x - 740) + 0.006 * (z + 200);
      h = h * (1 - ws) + sy * ws;
    }

    /*Family 4: The Silent Moot level truce meadow & Sasquatch timberline camp clearings */
    var wm = radialBlend(x, z, MOOT.x, MOOT.z, MOOT.rFlat, MOOT.rEase);
    if (wm > 0) h = h * (1 - wm) + MOOT.y * wm;
    for (var i = 0; i < SQ_PADS.length; i++) {
      var sp = SQ_PADS[i];
      var wsp = radialBlend(x, z, sp.x, sp.z, sp.rFlat, sp.rEase);
      if (wsp > 0) h = h * (1 - wsp) + sp.y * wsp;
    }
    return h;
  }

  function hAt(x, z) {
    var h = shapedNoCistern(x, z);
    /* Family 3: Recessed rock-cut Step-Cisterns (rim pad + excavated water basin) */
    for (var i = 0; i < CISTERNS.length; i++) {
      var c = CISTERNS[i];
      var wr = boxBlend(x, z, c.x - c.rimW * 0.5 - 4, c.z - c.rimD * 0.5 - 4, c.x + c.rimW * 0.5 + 4, c.z + c.rimD * 0.5 + 4, 14);
      if (wr > 0) {
        h = h * (1 - wr) + c.rimY * wr;
        var dx = Math.abs(x - c.x), dz = Math.abs(z - c.z);
        var phw = c.pitW * 0.5, phd = c.pitD * 0.5;
        if (dx < phw + 3.5 && dz < phd + 3.5) {
          var ox = dx <= phw ? 0 : (dx - phw) / 3.5;
          var oz = dz <= phd ? 0 : (dz - phd) / 3.5;
          var wp = cosEase(clamp(Math.max(ox, oz), 0, 1));
          h = c.rimY * (1 - wp) + c.floorY * wp;
        }
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

  function inCistern(x, z, pad) {
    var p = pad == null ? 0 : pad;
    for (var i = 0; i < CISTERNS.length; i++) {
      var c = CISTERNS[i];
      if (Math.abs(x - c.x) <= c.rimW * 0.5 + p && Math.abs(z - c.z) <= c.rimD * 0.5 + p) return c;
    }
    return null;
  }

  var NEAR_CACHE = null, FAR_CACHE = null;
  function nearGrid() {
    if (NEAR_CACHE) return NEAR_CACHE;
    var x0 = -2200, z0 = -2200, dx = 10, dz = 10, nx = 440, nz = 440;
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
    var x0 = -28000, z0 = -28000, dx = 400, dz = 400, nx = 140, nz = 140;
    var row = nx + 1, H = new Float32Array(row * (nz + 1));
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        var x = x0 + ix * dx;
        var y = hAt(x, z);
        /* Depress the coarse skirt cleanly inside the near mesh [-2200, +2200] so it never pokes through */
        var inside = boxBlend(x, z, -1850, -1850, 1850, 1850, 320);
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
    crag: CRAG,
    beaconSouth: BEACON_S,
    beaconNorth: BEACON_N,
    moot: MOOT,
    sqPads: SQ_PADS,
    cisterns: CISTERNS,
    base: base,
    shapedNoCistern: shapedNoCistern,
    h: hAt,
    asl: function (x, z) { return M.datum + hAt(x, z); },
    slope: slope,
    inCistern: inCistern,
    nearGrid: nearGrid,
    farGrid: farGrid,
    registerDrawn: registerDrawn
  };
})();
