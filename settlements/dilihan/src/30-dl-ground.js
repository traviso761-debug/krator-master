/* ================================================================= DILIHAN — Scale Model 5.1 ground, Cut wall & Dellu bench
   [G data] Pure data and functions over DL_MODEL (28-dl-model.js), CUT (41-cut-field.js), KCOAST (30-core-coast.js),
   and KRAND (08-core-rand.js): no THREE, no DOM.
   Provides:
     DL_GROUND.datum             -888.6 m ASL at pin (744, 663)
     DL_GROUND.lakeY             -719.4 m rel (-1,608.0 m ASL SE Cut Salt Lake sump shore 8 km north)
     DL_GROUND.base(x, z)        1:1 Scale Model 5.1 ground relative to datum (Catmull-Rom over 2 km grid + micro-relief)
     DL_GROUND.landHook(x,z,h0)  deterministic site hook: Cut bowl wall polish, -892 m colonia spur, -878 m palace join,
                                 terraced Vernacular districts, -923 m lower-town shelf, handu pads & spring stream cut
     DL_GROUND.h(x, z)           shaped ground relative to datum (-888.6 m ASL)
     DL_GROUND.asl(x, z)         elevation in metres above sea level (datum + h(x, z))
     DL_GROUND.slope(x, z, e)    terrain gradient magnitude |dh/ds|
     DL_GROUND.rockAt(x, z)      surface rock / evaporite class ('contact-marble', 'rock.cut.polished', 'evaporite', 'granite', 'alluvium')
     DL_GROUND.stream            West-Wall contact-marble spring stream polyline & channel depth sampler
     DL_GROUND.nearGrid()        deterministic 10 m grid over [-2400, +2400] registered in KDRAWN
     DL_GROUND.farGrid()         deterministic 380 m regional grid over [-15200, +15200] (30.4 x 30.4 km) registered in KDRAWN */
var DL_GROUND = (function () {
  'use strict';
  var M = DL_MODEL;
  var SEED = KRAND.hash(744, 663, 51, 8886);
  var RSEED = KRAND.child(SEED, 'cut-granite-marble');
  var LAKE_REL = M.lakeAsl - M.datum;   /* -1608.0 - (-888.6) = -719.4 m */

  /* Align CUT.PX0 to Scale Model 5.1 (732, 632) per PLAN.md §1.1 & §6 Q2 so CUT.px(744, 663) = [+24000, +62000] */
  if (typeof CUT !== 'undefined' && CUT.PX0) {
    CUT.PX0 = [M.cutPx0[0], M.cutPx0[1]];
  }

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

  /* Catmull-Rom 1D kernel over Scale Model 5.1's 2,000 m/px grid */
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
    var n1 = (KRAND.fbm(x * 0.0014 + 2.3, z * 0.0014 - 1.9, 4.1, 3, RSEED) - 0.5) * 3.6;
    var n2 = (KRAND.fbm(x * 0.0058 - 4.7, z * 0.0058 + 3.2, 7.3, 2, RSEED) - 0.5) * 0.9;
    return (n1 + n2) * att;
  }
  var ZERO_MICRO = microRelief(0, 0);

  function base(x, z) {
    var pinFade = 1 - radialBlend(x, z, 0, 0, 0, 280);
    return rawModel(x, z) + (microRelief(x, z) - ZERO_MICRO) * pinFade;
  }

  function rawSlope(x, z) {
    var e = 40;
    var gx = (rawModel(x + e, z) - rawModel(x - e, z)) / (2 * e);
    var gz = (rawModel(x, z + e) - rawModel(x, z - e)) / (2 * e);
    return Math.hypot(gx, gz);
  }

  /*Cut bowl coordinate transform: (x, z) site-local -> (bx, bz) Cut bowl frame*/
  function toBowl(x, z) {
    return [x + M.cutOffset[0], z + M.cutOffset[1]];
  }

  /* ---- Perennial West-Wall contact-marble spring stream (PLAN.md §1.3 & §6 Q1) ---- */
  var STREAM_PTS = [
    [-1480, 920],
    [-1120, 640],
    [-760, 410],
    [-465, 220],
    [-430, 60],
    [-430, -40],    /* Stone bridge crossing in Zone 4 Lower Town */
    [-430, -180],
    [-445, -420],
    [-485, -860],
    [-520, -1380],
    [-500, -1920],
    [-440, -2380]
  ];

  function segDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    var t = l2 > 0 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
    var qx = ax + dx * t, qz = az + dz * t;
    return { d: Math.hypot(px - qx, pz - qz), t: t, x: qx, z: qz };
  }

  function streamDist(x, z) {
    if (x < -1600 || x > -260 || z < -2480 || z > 1020) return 9999;
    var best = 9999;
    for (var i = 0; i + 1 < STREAM_PTS.length; i++) {
      var a = STREAM_PTS[i], b = STREAM_PTS[i + 1];
      var sd = segDist(x, z, a[0], a[1], b[0], b[1]).d;
      if (sd < best) best = sd;
    }
    return best;
  }

  /* ---- Eight orthogonal Dellu-Handu veteran allotment benches + NW Brickworks + NE Skarn + SE Portal ---- */
  var HANDU_PADS = [
    { id: 'handu.1', name: 'First Cohort Handu (West Apron)',     x: -820,  z: -620,  y: -48.0, w: 300, d: 260, ease: 110 },
    { id: 'handu.2', name: 'Second Cohort Handu (Stream West)',   x: -840,  z: -1040, y: -74.0, w: 300, d: 260, ease: 110 },
    { id: 'handu.3', name: 'Third Cohort Handu (North Road W)',   x: -220,  z: -860,  y: -52.0, w: 320, d: 260, ease: 110 },
    { id: 'handu.4', name: 'Fourth Cohort Handu (North Road E)',  x: 260,   z: -860,  y: -50.0, w: 320, d: 260, ease: 110 },
    { id: 'handu.5', name: 'Fifth Cohort Handu (Central Apron)',  x: -180,  z: -1340, y: -96.0, w: 320, d: 260, ease: 120 },
    { id: 'handu.6', name: 'Sixth Cohort Handu (East Apron)',     x: 340,   z: -1320, y: -92.0, w: 320, d: 260, ease: 120 },
    { id: 'handu.7', name: 'Seventh Cohort Handu (East Terrace)', x: 880,   z: -540,  y: -26.0, w: 300, d: 260, ease: 110 },
    { id: 'handu.8', name: 'Eighth Cohort Handu (Upper Olive)',   x: 560,   z: 740,   y: 54.0,  w: 300, d: 260, ease: 120 }
  ];
  var BRICK_PAD = { id: 'works.brick', x: -1080, z: -1480, y: -112.0, rFlat: 135, rEase: 130 };
  var SKARN_PAD = { id: 'works.skarn', x: 1140,  z: -1080, y: -68.0,  rFlat: 145, rEase: 140 };
  var PORTAL_PAD = { id: 'works.portal', x: 860, z: 680,   y: 44.0,   rFlat: 85,  rEase: 110 };
  var SALT_PAD = { id: 'works.salt', x: 0, z: -7620, y: LAKE_REL + 2.4, w: 540, d: 340, ease: 180 };

  /* Natural evaporite shoreline wobble along z = -7950 m (8 km north, py = 659) using KRAND */
  function saltShoreZ(x) {
    var w1 = (KRAND.fbm(x * 0.00028 + 5.1, 1.7, 2.1, 3, SEED) - 0.5) * 420;
    var w2 = (KRAND.fbm(x * 0.0011 - 2.4, 8.3, 4.7, 2, SEED) - 0.5) * 110;
    return -7960 + w1 + w2;
  }

  function shapedNoStream(x, z, h0) {
    var h = h0 == null ? base(x, z) : h0;

    /* 1. Eigenweapon spherical Cut wall polish on steep outer slopes (PLAN.md §1.2 rule 1) */
    var rSite = Math.hypot(x, z);
    if (rSite > 1950 && typeof CUT !== 'undefined' && CUT.bowl) {
      var b = toBowl(x, z);
      var rCut = Math.hypot(b[0], b[1]);
      var brg = CUT.bearing(b[0], b[1]);
      var lipR = CUT.lipR(brg);
      if (rCut < lipR) {
        var sl = rawSlope(x, z);
        if (sl > 0.18) {
          var wWall = clamp((sl - 0.18) / 0.18, 0, 0.72) * clamp((rSite - 1950) / 1400, 0, 1);
          var cutRel = CUT.bowl.h(b[0], b[1]) - M.datum;
          h = h * (1 - wWall) + cutRel * wWall;
        }
      }
    }

    /* 2. Cut Salt Lake SE sump (-1,608 m ASL = -719.4 m rel) & D2 evaporite shore profile 8 km north */
    if (z < -6200) {
      var sz = saltShoreZ(x);
      var cDist = z - sz;   /* > 0 inland (south), < 0 in lake (north) */
      if (cDist <= 0) {
        var depth = clamp(-cDist * 0.018, 0.6, 42.0);
        h = LAKE_REL - depth;
      } else if (cDist < 1400) {
        var tShore = cDist / 1400;
        var marshY = LAKE_REL + 0.45 + tShore * 18.0;
        var wSh = cosEase(tShore);
        h = h * (1 - wSh) + marshY * wSh;
      }
      var wsalt = boxBlend(x, z, SALT_PAD.x - SALT_PAD.w * 0.5, SALT_PAD.z - SALT_PAD.d * 0.5,
                           SALT_PAD.x + SALT_PAD.w * 0.5, SALT_PAD.z + SALT_PAD.d * 0.5, SALT_PAD.ease);
      if (wsalt > 0 && z > sz + 35) {
        h = h * (1 - wsalt) + SALT_PAD.y * wsalt;
      }
    }

    /* 3. Hinterland Dellu-Handu allotment benches, NW clay brickyard, NE skarn adits & SE tunnel portal */
    if (rSite < 2450) {
      for (var i = 0; i < HANDU_PADS.length; i++) {
        var hp = HANDU_PADS[i];
        var wh = boxBlend(x, z, hp.x - hp.w * 0.5, hp.z - hp.d * 0.5, hp.x + hp.w * 0.5, hp.z + hp.d * 0.5, hp.ease);
        if (wh > 0) {
          var hy = hp.y + 0.012 * (z - hp.z);
          h = h * (1 - wh) + hy * wh;
        }
      }
      var wb = radialBlend(x, z, BRICK_PAD.x, BRICK_PAD.z, BRICK_PAD.rFlat, BRICK_PAD.rEase);
      if (wb > 0) h = h * (1 - wb) + BRICK_PAD.y * wb;
      var wsk = radialBlend(x, z, SKARN_PAD.x, SKARN_PAD.z, SKARN_PAD.rFlat, SKARN_PAD.rEase);
      if (wsk > 0) h = h * (1 - wsk) + SKARN_PAD.y * wsk;
      var wpt = radialBlend(x, z, PORTAL_PAD.x, PORTAL_PAD.z, PORTAL_PAD.rFlat, PORTAL_PAD.rEase);
      if (wpt > 0) h = h * (1 - wpt) + PORTAL_PAD.y * wpt;
    }

    /* 4. Urban Dilihan terraced benches, Governor's Precinct, Lower Town shelf & 500x500 m Colonia spur */
    if (rSite < 1650) {
      /* 4a. Zone 3 Vernacular Districts: East, SE Pass, South & North Caravanserai shelves (slope <= 0.060) */
      var wEast = boxBlend(x, z, 245, -335, 785, 510, 130);
      if (wEast > 0) {
        var yEast = -3.0 + 0.040 * Math.max(0, x - 262) + 0.016 * Math.max(0, z + 60);
        h = h * (1 - wEast) + yEast * wEast;
      }
      var wSouthEast = boxBlend(x, z, 245, 485, 785, 905, 130);
      if (wSouthEast > 0) {
        var ySE = 5.8 + 0.036 * Math.max(0, x - 262) + 0.032 * Math.max(0, z - 490);
        h = h * (1 - wSouthEast) + ySE * wSouthEast;
      }
      var wSouth = boxBlend(x, z, -265, 192, 265, 675, 130);
      if (wSouth > 0) {
        var ySouth = -2.8 + 0.050 * Math.max(0, z - 202) + 0.008 * Math.max(0, x);
        h = h * (1 - wSouth) + ySouth * wSouth;
      }
      var wNorth = boxBlend(x, z, -260, -580, 525, -322, 105);
      if (wNorth > 0) {
        var yNorth = -8.4 + 0.018 * (z + 440);
        h = h * (1 - wNorth) + yNorth * wNorth;
      }

      /* 4b. Zone 4 Lower Town pass-road fork shelf (-923.0 m ASL = -34.4 m rel, 31 m below colonia scarp) */
      var wLow = boxBlend(x, z, -575, -300, -292, 395, 42);
      if (wLow > 0) {
        var yLow = -34.4 + 0.010 * (z + 40) - 0.006 * (x + 420);
        h = h * (1 - wLow) + yLow * wLow;
      }

      /* Graded switchback ramp connecting Lower Town (-300, +240) up to South Wall Street (-210, +240) */
      var wRamp = boxBlend(x, z, -295, 210, -195, 275, 22);
      if (wRamp > 0) {
        var tr = clamp((x + 295) / 100, 0, 1);
        var yRamp = -33.2 * (1 - tr) + (-1.8) * tr;
        h = h * (1 - wRamp) + yRamp * wRamp;
      }

      /* 4c. Zone 1 Colonia projecting bedrock spur (-892.0 m ASL = -3.4 m rel, crisp 30 m W/NW marble-granite scarp) */
      var wCol = boxBlend(x, z, -258, -314, 254, 194, 34);
      if (wCol > 0) {
        /* Very gentle <= 0.008 drainage crown so KCITY, dl_solstice_plaza & jj_temple_sun sit level */
        var yCol = -3.4 + 0.004 * ((z + 60) / 100) + 0.003 * (x / 100);
        /* Amphitheater cavea bowl carved into the NW bench scarp (-168, -238) */
        var dAmp = Math.hypot(x + 168, z + 238);
        if (dAmp < 36) {
          yCol -= cosEase(dAmp / 36) * 4.2;
        }
        h = h * (1 - wCol) + yCol * wCol;
      }

      /* 4d. Zone 2 Governor's Precinct (-878.0 m ASL = +10.6 m rel at the upper SE join of colonia & Izani quarter) */
      var wPal = boxBlend(x, z, 162, 194, 358, 394, 52);
      if (wPal > 0) {
        var yPal = 10.6 + 0.005 * ((z - 280) / 100);
        h = h * (1 - wPal) + yPal * wPal;
      }
    }

    return h;
  }

  function landHook(x, z, h0) {
    var h = shapedNoStream(x, z, h0);
    /* Incise perennial West-Wall contact-marble spring stream bed (width ~9 m, depth 2.2 m) */
    var sd = streamDist(x, z);
    if (sd < 11.0) {
      var cut = cosEase(sd / 11.0) * 2.25;
      h -= cut;
    }
    return h;
  }

  function hAt(x, z) {
    return landHook(x, z, base(x, z));
  }

  function slope(x, z, e) {
    var d = e == null ? 4 : e;
    var gx = (hAt(x + d, z) - hAt(x - d, z)) / (2 * d);
    var gz = (hAt(x, z + d) - hAt(x, z - d)) / (2 * d);
    return Math.hypot(gx, gz);
  }

  function rockAt(x, z) {
    if (z < saltShoreZ(x) + 380) return 'evaporite';
    var sl = slope(x, z, 8);
    if (x > -296 && x < -244 && z > -330 && z < 210 && sl > 0.24) return 'contact-marble';
    var rSite = Math.hypot(x, z);
    if (rSite > 1950 && sl > 0.25) {
      var b = toBowl(x, z);
      if (Math.hypot(b[0], b[1]) < CUT.lipR(CUT.bearing(b[0], b[1]))) return 'rock.cut.polished';
      return 'contact-marble';
    }
    if (Math.hypot(x - SKARN_PAD.x, z - SKARN_PAD.z) < 260) return 'skarn';
    if (Math.hypot(x - BRICK_PAD.x, z - BRICK_PAD.z) < 260) return 'clay';
    return sl > 0.18 ? 'granite' : 'alluvium';
  }

  var NEAR_CACHE = null, FAR_CACHE = null;
  function nearGrid() {
    if (NEAR_CACHE) return NEAR_CACHE;
    var x0 = -2400, z0 = -2400, dx = 10, dz = 10, nx = 480, nz = 480;
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
    /* 30.4 x 30.4 km regional extract around (744, 663), covering the -1,608 m Cut Salt Lake 8 km north & +45 m S sill */
    var x0 = -15200, z0 = -15200, dx = 380, dz = 380, nx = 80, nz = 80;
    var row = nx + 1, H = new Float32Array(row * (nz + 1));
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        var x = x0 + ix * dx;
        var y = hAt(x, z);
        var inside = boxBlend(x, z, -2020, -2020, 2020, 2020, 340);
        H[iz * row + ix] = y - inside * 38.0;
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
    lakeY: LAKE_REL,
    lakeAsl: M.lakeAsl,
    seed: SEED,
    toBowl: toBowl,
    saltShoreZ: saltShoreZ,
    handuPads: HANDU_PADS,
    brickPad: BRICK_PAD,
    skarnPad: SKARN_PAD,
    portalPad: PORTAL_PAD,
    saltPad: SALT_PAD,
    stream: {
      pts: STREAM_PTS,
      dist: streamDist,
      bedY: hAt,
      surfaceY: function (x, z) { return shapedNoStream(x, z) - 0.85; }
    },
    base: base,
    shapedNoStream: shapedNoStream,
    landHook: landHook,
    h: hAt,
    asl: function (x, z) { return M.datum + hAt(x, z); },
    slope: slope,
    rockAt: rockAt,
    nearGrid: nearGrid,
    farGrid: farGrid,
    registerDrawn: registerDrawn
  };
})();
