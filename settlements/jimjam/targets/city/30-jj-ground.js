/* ================================================================= JIMJAM — Scale Model 5.1 Ground, Lake Cove & Lotus Terraces
   [G data] Pure data and functions over JJ_MODEL (28-jj-model.js), KCOAST (30-core-coast.js), and KRAND (08-core-rand.js):
   no THREE, no DOM, no Math.random.
   Provides:
     JJ_GROUND.datum             +486.2 m ASL at pin (745, 546)
     JJ_GROUND.lakeY             -56.42 m rel (+429.78 m ASL Great Trough Lake lbl=77)
     JJ_GROUND.base(x, z)        1:1 Scale Model 5.1 ground relative to datum (Catmull-Rom over 2 km grid + micro-relief)
     JJ_GROUND.landHook(x,z,h0)  deterministic site hook: NNW Great Trough Lake shore & Lotus Harbour pocket cove (-680, -1760),
                                 +514 m Solar Acropolis, +496 m Palace & Sunray Plaza spine, celestial district benches,
                                 Four-Day & Thirteen water basins, -6.5 m Amphitheater bowl, handu pads & monsoon feeder canal
     JJ_GROUND.h(x, z)           shaped ground relative to datum (+486.2 m ASL)
     JJ_GROUND.asl(x, z)         elevation in metres above sea level (datum + h(x, z))
     JJ_GROUND.slope(x, z, e)    terrain gradient magnitude |dh/ds|
     JJ_GROUND.shoreZ(x)         NNW Great Trough Lake shoreline z(x) in local metres
     JJ_GROUND.canal             Eastern Monsoon Feeder Canal polyline & channel sampler
     JJ_GROUND.nearGrid()        deterministic 10 m grid over [-2600..2800, -2500..2400] registered in KDRAWN
     JJ_GROUND.farGrid()         deterministic 380 m regional grid over [-15200..15200] (30.4 x 30.4 km) registered in KDRAWN */
var JJ_GROUND = (function () {
  'use strict';
  var M = JJ_MODEL;
  var SEED = KRAND.hash(745, 546, 51, 4862);
  var RSEED = KRAND.child(SEED, 'rhythmite-silt-marl');
  var LAKE_REL = M.lakeAsl - M.datum;   /* 429.78 - 486.2 = -56.42 m */

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
    var att = d > 16000 ? 0 : d > 4800 ? cosEase((d - 4800) / 11200) : 1;
    if (att <= 0) return 0;
    var n1 = (KRAND.fbm(x * 0.0013 + 1.9, z * 0.0013 - 2.4, 3.7, 3, RSEED) - 0.5) * 2.8;
    var n2 = (KRAND.fbm(x * 0.0052 - 3.8, z * 0.0052 + 4.1, 6.9, 2, RSEED) - 0.5) * 0.7;
    return (n1 + n2) * att;
  }
  var ZERO_MICRO = microRelief(0, 0);

  function base(x, z) {
    var pinFade = 1 - radialBlend(x, z, 0, 0, 0, 260);
    return rawModel(x, z) + (microRelief(x, z) - ZERO_MICRO) * pinFade;
  }

  /* ---- NNW Great Trough Lake (+429.78 m) Shoreline & Sheltered Lotus Harbour Pocket Cove (-680, -1760) ---- */
  function shoreZ(x) {
    /* Indents south-eastward around x = -680 to form the sheltered NNW pocket bay, while the WSW headland juts out west */
    var coveIndent = Math.exp(-Math.pow((x + 680) / 360, 2)) * 210;
    var headlandPush = x < -1250 ? clamp((-1250 - x) * 0.22, 0, 380) : 0;
    var eastPush = x > 450 ? clamp((x - 450) * 0.14, 0, 320) : 0;
    var w1 = (KRAND.fbm(x * 0.00055 + 3.2, 2.1, 2.3, 3, SEED) - 0.5) * 140;
    var w2 = (KRAND.fbm(x * 0.0021 - 1.7, 5.9, 4.1, 2, SEED) - 0.5) * 38;
    return -1890 + coveIndent - headlandPush - eastPush + w1 + w2;
  }

  /* ---- Eastern Monsoon Feeder Canal (upland runoff -> East Sluice Gate -> Four-Day Tank -> Harbour Sluice Gate -> Lake!) ---- */
  var CANAL_PTS = [
    [1640, 480],
    [1450, 320],
    [1380, 320],     /* Enters perpendicularly through East Sluice Water-Gate (1380, 320) */
    [1290, 320],
    [980, -180],
    [740, -490],     /* Enters SE rim of Four-Day Lotus Tank (680, -560) */
    [620, -630],     /* Exits NW rim of Four-Day Lotus Tank */
    [260, -920],
    [-160, -1180],
    [-490, -1410],
    [-610, -1510],   /* Straightens onto exact 10 m grid column x = -610 for zero-sawtooth harbour cut */
    [-610, -1580],   /* Exits perpendicularly through Harbour Sluice Water-Gate (-610, -1580) */
    [-610, -1670],   /* Passes beneath arched Quayside Sluice Bridge at seawall z = -1670.5 */
    [-610, -1682]    /* Merges cleanly 12 m past the seawall into +429.78 m Great Trough Lake! */
  ];

  /* Stepped-Brick Intramural Water Tanks (Kulam & Tar-Sea Mirror Pool, PLAN.md P3) */
  var KULAM_BASINS = [
    { id: 'kulam.thirteen_tarsea', name: 'Thirteen Temple Black-Clinker Tar-Sea Mirror Pool', x: 160,  z: 480,  w: 52, d: 28, rimY: 23.8, waterY: 23.15, dark: true },
    { id: 'kulam.companion',       name: 'Companion Dial Stepped Lotus Kulam',                x: -310, z: -850, w: 34, d: 34, rimY: -9.8, waterY: -10.45, dark: false },
    { id: 'kulam.week',            name: 'Week Mansions Stepped Lotus Kulam',                 x: -860, z: 490,  w: 44, d: 34, rimY: 16.8, waterY: 16.15, dark: false }
  ];

  function segDist(px, pz, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    var t = l2 > 0 ? clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1) : 0;
    var qx = ax + dx * t, qz = az + dz * t;
    return { d: Math.hypot(px - qx, pz - qz), t: t, x: qx, z: qz };
  }

  function canalDist(x, z) {
    if (x < -740 || x > 1680 || z < -1760 || z > 860) return 9999;
    /* Pause open channel cut right inside the 68x68 m Four-Day Lotus Tank box so the island sanctuary stays intact */
    if (Math.abs(x - 680) < 42 && Math.abs(z + 560) < 42) return 9999;
    var best = 9999;
    for (var i = 0; i + 1 < CANAL_PTS.length; i++) {
      var a = CANAL_PTS[i], b = CANAL_PTS[i + 1];
      var sd = segDist(x, z, a[0], a[1], b[0], b[1]).d;
      if (sd < best) best = sd;
    }
    return best;
  }

  /* ---- Six Handu Hinterland Allotment & Works Pads (zone11.handu) + WSW Windmill Headland ---- */
  var HANDU_PADS = [
    { id: 'handu.1', name: 'First Handu — Tamarai Paddy & Lotus Fan (SW)',    x: -1380, z: 1420,  y: 26.0,  w: 360, d: 300, ease: 130, focus: 'farming' },
    { id: 'handu.2', name: 'Second Handu — Cotton & Saffron Terrace (S)',     x: 680,   z: 1680,  y: 44.0,  w: 360, d: 300, ease: 130, focus: 'farming' },
    { id: 'handu.3', name: 'Third Handu — Whorl-Olive & Citron Groves (SE)',  x: 1840,  z: 1180,  y: 46.0,  w: 340, d: 280, ease: 130, focus: 'orchard' },
    { id: 'handu.4', name: 'Fourth Handu — Rhythmite Clay & Kiln Bank (E)',   x: 2040,  z: -280,  y: 18.0,  w: 320, d: 280, ease: 120, focus: 'clay' },
    { id: 'handu.5', name: 'Fifth Handu — Gypsum & Vellai-Kal Plaster (ENE)', x: 1680,  z: -1380, y: -12.0, w: 320, d: 280, ease: 120, focus: 'quarry' },
    { id: 'handu.6', name: 'Sixth Handu — Cinna-aru Lake-Shore Fishery (NW)', x: -1620, z: -1540, y: -48.0, w: 300, d: 240, ease: 110, focus: 'fishing' }
  ];
  /* WSW Windmill Headland ridge strictly south of Az 249 deg / north of Az 239 deg keepout (centered at Az ~224 deg) */
  var WINDMILL_PAD = { id: 'handu.windmills', x: -1960, z: 980, y: 36.0, rFlat: 150, rEase: 140 };

  /* ---- Compacted Voth-Density Urban District Benches (rel to +486.2 m ASL datum) ---- */
  var URBAN_BENCHES = [
    /* Zone 3 Giant Waterfront & White-Pass North Apron (+432..+464 m ASL -> -54.2..-22.2 m rel) */
    { x0: -1150, z0: -1640, x1: 880,  z1: -1220, ease: 130, y0: -32.0, gx: 0.004, gz: 0.028 },
    /* Zone 2 Companion Terrace (+472..+488 m ASL -> -14.2..+1.8 m rel) */
    { x0: -520,  z0: -1220, x1: 380,  z1: -420,  ease: 120, y0: -9.5,  gx: 0.003, gz: 0.016 },
    /* Zone 4 Two-Day Shaded Alabaster Cloisters (+476..+494 m ASL -> -10.2..+7.8 m rel) */
    { x0: -1260, z0: -1220, x1: -520, z1: -420,  ease: 120, y0: -5.0,  gx: -0.004, gz: 0.016 },
    /* Zone 7 Four-Day Lotus-Tank & Dye-Vat Bench (+478..+496 m ASL -> -8.2..+9.8 m rel) */
    { x0: 320,   z0: -1220, x1: 980,  z1: 120,   ease: 120, y0: -4.2,  gx: 0.005, gz: 0.012 },
    /* Zone 8 Day Leeward Clinker-Kiln & Glass Bench (+492..+514 m ASL -> +5.8..+27.8 m rel) */
    { x0: 880,   z0: -980,  x1: 1380, z1: 580,   ease: 130, y0: 12.5,  gx: 0.007, gz: 0.010 },
    /* Zone 5 Week Law-Court & West Mansions Bench (+496..+508 m ASL -> +9.8..+21.8 m rel) */
    { x0: -1260, z0: 180,   x1: -340, z1: 920,   ease: 120, y0: 16.5,  gx: -0.003, gz: 0.008 },
    /* Zone 6 Thirteen Almanac & Chapterhouse Terrace (+506..+518 m ASL -> +19.8..+31.8 m rel) */
    { x0: -340,  z0: 240,   x1: 580,  z1: 940,   ease: 120, y0: 24.5,  gx: 0.004, gz: 0.009 },
    /* Zone 9 Former Izani Occupation Enclave & Dilihan Factor Row (+522..+536 m ASL -> +35.8..+49.8 m rel) */
    { x0: 560,   z0: 580,   x1: 1280, z1: 960,   ease: 120, y0: 37.5,  gx: 0.008, gz: 0.012 },
    /* Zone 10 South Cut-Gate, Caravanserai & Great Pilgrim's Market Suburb (+524..+534 m ASL -> +37.8..+47.8 m rel) */
    { x0: -560,  z0: 960,   x1: 980,  z1: 1380,  ease: 130, y0: 40.0,  gx: 0.003, gz: 0.006 }
  ];

  /* Exact level pads for monumental ensembles (zero tilt on joined/sightline podiums) */
  var LEVEL_PADS = [
    { id: 'pad.acropolis',        x: -740, z: -120, w: 340, d: 310, ease: 100, y: 27.8 },  /* +514.0 m ASL Solar Acropolis */
    { id: 'pad.rajas_eye',        x: -860, z: -340, w: 72,  d: 72,  ease: 55,  y: 31.8 },  /* +518.0 m ASL NW Observatory Bastion */
    { id: 'pad.palace_spine',     x: -18,  z: 0,    w: 210, d: 240, ease: 100, y: 9.8  },  /* +496.0 m ASL Palace + Sunray Plaza Spine */
    { id: 'pad.whitepass',        x: 340,  z: -1380,w: 110, d: 96,  ease: 65,  y: -24.2 }, /* +462.0 m ASL White-Pass Trans-Rim Compound */
    { id: 'pad.temple_companion', x: -80,  z: -860, w: 96,  d: 104, ease: 60,  y: -10.2 }, /* +476.0 m ASL Companion Dial Temple */
    { id: 'pad.temple_twoday',    x: -960, z: -840, w: 96,  d: 104, ease: 60,  y: -4.2 },  /* +482.0 m ASL Two-Day Alabaster Temple */
    { id: 'pad.temple_fourday',   x: 680,  z: -560, w: 120, d: 120, ease: 65,  y: -4.2 },  /* +482.0 m ASL Four-Day Lotus-Tank Rim */
    { id: 'pad.temple_day',       x: 1060, z: -180, w: 110, d: 104, ease: 65,  y: 9.8  },  /* +496.0 m ASL Day Fan-Temple */
    { id: 'pad.temple_week',      x: -760, z: 560,  w: 110, d: 96,  ease: 65,  y: 17.8 },  /* +504.0 m ASL Week Two-Faced Temple */
    { id: 'pad.temple_thirteen',  x: 160,  z: 560,  w: 120, d: 136, ease: 65,  y: 23.8 },  /* +510.0 m ASL Thirteen Pyramid & Tar Pool */
    { id: 'pad.chapterhouse',     x: 420,  z: 520,  w: 88,  d: 82,  ease: 50,  y: 25.8 },  /* +512.0 m ASL Order of Historians Chapterhouse */
    { id: 'pad.izani_ruin',       x: 860,  z: 740,  w: 120, d: 106, ease: 60,  y: 37.8 },  /* +524.0 m ASL Decayed Izani Governor's House */
    { id: 'pad.fortress_crest',   x: 1140, z: 860,  w: 146, d: 140, ease: 65,  y: 49.8 },  /* +536.0 m ASL South Crest Citadel */
    { id: 'pad.pilgrim_market',   x: -40,  z: 1060, w: 540, d: 240, ease: 95,  y: 40.2 }   /* +526.4 m ASL Cut-Gate Caravanserai & Pilgrim Market */
  ];

  function shapedNoCanal(x, z, h0) {
    var h = h0 == null ? base(x, z) : h0;
    var rSite = Math.hypot(x, z);

    /* 1. NNW Great Trough Lake (+429.78 m ASL = -56.42 m rel) shoreline & bathymetry */
    var sz = shoreZ(x);
    var cDist = z - sz;   /* > 0 inland (south), <= 0 in Great Trough Lake (north) */
    if (cDist <= 0) {
      var depth = clamp(-cDist * 0.026, 0.9, 140.0);
      h = LAKE_REL - depth;
    } else if (cDist < 420) {
      var tSh = cDist / 420;
      var strandY = LAKE_REL + 0.55 + tSh * 22.0;
      var wSh = cosEase(tSh);
      h = h * (1 - wSh) + strandY * wSh;
    }

    /* 2. Hinterland Handu Village Pads & WSW Windmill Headland */
    if (rSite < 3200) {
      for (var hi = 0; hi < HANDU_PADS.length; hi++) {
        var hp = HANDU_PADS[hi];
        var wh = boxBlend(x, z, hp.x - hp.w * 0.5, hp.z - hp.d * 0.5, hp.x + hp.w * 0.5, hp.z + hp.d * 0.5, hp.ease);
        if (wh > 0 && z > sz + 25) {
          var hy = hp.y + 0.008 * (z - hp.z);
          h = h * (1 - wh) + hy * wh;
        }
      }
      var ww = radialBlend(x, z, WINDMILL_PAD.x, WINDMILL_PAD.z, WINDMILL_PAD.rFlat, WINDMILL_PAD.rEase);
      if (ww > 0) h = h * (1 - ww) + WINDMILL_PAD.y * ww;
    }

    /* 3. Urban Celestial District Benches */
    if (rSite < 2950 && z > sz + 35) {
      for (var bi = 0; bi < URBAN_BENCHES.length; bi++) {
        var b = URBAN_BENCHES[bi];
        var wb = boxBlend(x, z, b.x0, b.z0, b.x1, b.z1, b.ease);
        if (wb > 0) {
          var cx = (b.x0 + b.x1) * 0.5, cz = (b.z0 + b.z1) * 0.5;
          var by = b.y0 + b.gx * (x - cx) + b.gz * (z - cz);
          h = h * (1 - wb) + by * wb;
        }
      }

      /* 3b. Solstice WSW Foreground Garden Keep-Low Apron (x in [-1820..-1040], z in [-60..420]): gently graded <= +494 m ASL (+7.8 m rel)
             so nothing west-southwest of the +514 m Solar Acropolis ever intrudes on the Az 244.04 deg sunset sightline! */
      var wSol = boxBlend(x, z, -1820, -40, -1040, 400, 120);
      if (wSol > 0) {
        var ySol = 6.2 - 0.004 * (x + 1400) + 0.006 * (z - 160);
        h = h * (1 - wSol) + ySol * wSol;
      }

      /* 3c. Level Monumental Pads */
      for (var pi = 0; pi < LEVEL_PADS.length; pi++) {
        var p = LEVEL_PADS[pi];
        var wp = boxBlend(x, z, p.x - p.w * 0.5, p.z - p.d * 0.5, p.x + p.w * 0.5, p.z + p.d * 0.5, p.ease);
        if (wp > 0) {
          h = h * (1 - wp) + p.y * wp;
        }
      }

      /* 3d. Slope-cut Amphitheater cavea bowl at (-180, 780) facing NNW toward the Palace & Great Trough Lake */
      var dxA = (x + 180) / 42.0, dzA = (z - 780) / 33.0;
      var dAmp = Math.hypot(dxA, dzA);
      if (dAmp < 1.35) {
        h -= cosEase(dAmp / 1.35) * 5.2;
      }
    }

    /* 4. Dredged NNW Sheltered Lotus Harbour Basin (-680, -1760) & Crisp +432.0 m ASL (-54.2 m rel) Masonry Wharf Apron */
    var wQuay = boxBlend(x, z, -945, -1670, -475, -1530, 48);
    if (wQuay > 0) {
      var quayY = LAKE_REL + 2.22 + clamp((z + 1670) / 140, 0, 1) * 4.2;
      h = h * (1 - wQuay) + quayY * wQuay;
    }
    var wBasin = boxBlend(x, z, -960, -1930, -460, -1675, 22);
    if (wBasin > 0) {
      h = h * (1 - wBasin) + (LAKE_REL - 3.8) * wBasin;
    }

    /* 5. Depress intramural stepped-brick Kulam & Tar-Sea water basins so WATER.still sits cleanly inside masonry rims */
    for (var ki = 0; ki < KULAM_BASINS.length; ki++) {
      var kb = KULAM_BASINS[ki];
      var wk = boxBlend(x, z, kb.x - kb.w * 0.46, kb.z - kb.d * 0.46, kb.x + kb.w * 0.46, kb.z + kb.d * 0.46, 4.0);
      if (wk > 0) {
        h = h * (1 - wk) + (kb.waterY - 1.4) * wk;
      }
    }

    return h;
  }

  function canalSurfaceY(x, z) {
    if (z <= -1668) return LAKE_REL + 0.04;
    var sY = shapedNoCanal(x, z) - 0.72;
    if (z < -1510) {
      /* Smoothly grade the water surface through the Harbour Water-Gate & Quayside Sluice down to exact lake level! */
      var tOut = clamp((-1510 - z) / 158.0, 0, 1);
      var targetLake = LAKE_REL + 0.04;
      sY = sY * (1 - tOut) + Math.max(targetLake, sY * (1 - tOut) + targetLake * tOut) * tOut;
      sY = Math.max(targetLake, shapedNoCanal(x, -1510) * (1 - tOut) + targetLake * tOut - 0.55 * (1 - tOut));
    }
    return Math.max(LAKE_REL + 0.03, sY);
  }

  function landHook(x, z, h0) {
    var h = shapedNoCanal(x, z, h0);
    /* Incise perennial Monsoon Feeder Canal all the way through the Harbour Quay Apron into Great Trough Lake! */
    var cd = canalDist(x, z);
    if (cd < 10.5) {
      var prof = cosEase(cd / 10.5);
      if (z < -1505) {
        var bedTarget = LAKE_REL - 2.2;
        if (h > bedTarget) {
          h = h - (h - bedTarget) * prof;
        }
      } else if (h > LAKE_REL + 0.5) {
        h -= prof * 2.35;
      }
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

  function soilAt(x, z) {
    if (z <= shoreZ(x) + 12) return 'lakebed';
    if (Math.hypot(x - 2440, z + 320) < 280) return 'rhythmite-clay';
    if (Math.hypot(x - 1820, z + 1480) < 280) return 'gypsum-marl';
    var sl = slope(x, z, 8);
    return sl > 0.20 ? 'rock-bench' : 'alluvium';
  }

  var NEAR_CACHE = null, FAR_CACHE = null;
  function nearGrid() {
    if (NEAR_CACHE) return NEAR_CACHE;
    /* 5.4 x 4.9 km high-res 10 m grid enclosing the entire 4.6 x 4.0 km metropolis, harbour cove & inner handu belt */
    var x0 = -2600, z0 = -2500, dx = 10, dz = 10, nx = 540, nz = 490;
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
    /* 30.4 x 30.4 km regional extract around (745, 546): Great Trough Lake (+429.78 m), WSW headland & eastern monsoon hills */
    var x0 = -15200, z0 = -15200, dx = 380, dz = 380, nx = 80, nz = 80;
    var row = nx + 1, H = new Float32Array(row * (nz + 1));
    for (var iz = 0; iz <= nz; iz++) {
      var z = z0 + iz * dz;
      for (var ix = 0; ix <= nx; ix++) {
        var x = x0 + ix * dx;
        var y = hAt(x, z);
        var inside = boxBlend(x, z, -2420, -2320, 2620, 2220, 340);
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
    lakeY: LAKE_REL,
    lakeAsl: M.lakeAsl,
    seed: SEED,
    shoreZ: shoreZ,
    handuPads: HANDU_PADS,
    windmillPad: WINDMILL_PAD,
    levelPads: LEVEL_PADS,
    kulamBasins: KULAM_BASINS,
    canal: {
      pts: CANAL_PTS,
      dist: canalDist,
      bedY: hAt,
      surfaceY: canalSurfaceY
    },
    base: base,
    shapedNoCanal: shapedNoCanal,
    landHook: landHook,
    h: hAt,
    asl: function (x, z) { return M.datum + hAt(x, z); },
    slope: slope,
    soilAt: soilAt,
    nearGrid: nearGrid,
    farGrid: farGrid,
    registerDrawn: registerDrawn
  };
})();
