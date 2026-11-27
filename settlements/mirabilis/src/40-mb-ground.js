// prefix: mb
/* ================================================================= MIRABILIS — 1:1 Scale Model 5.1 Geomorphology & Stratigraphy ([G data])
   Pin: spwjwosq9c / s9h1fb5qsc at px [350, 726] (+3,124.9 m ASL, 1.08 atm, 12.0 C, 627 mm Csa).
   Local frame: x (east+), z (south+) in [-1800, +1800] m around cx = 350.0, cy = 725.6.
   Landforms sculpted deterministically over bicubic MB_MODEL:
     1. Pepar-Yuan South Tableland (W1 + W3, +3125..+3144 m): golden-buff wind-packed loess crown.
     2. Yut-Ma ("Moon-Bridge River", r227, 14.3 m3/s) Box-Canyon Chasm (z ~ -195 m, bed +2956 -> +2842 m):
        cuts ~150 m of sheer buff loess into ~52 m of dark Outer Wall impact megabreccia, spanned at x = 0 by the
        164.5 m-high Yut Moon-Bridge (+3088 m deck, 10.5 deg wagon ramps to North & South Yuan!).
     3. Sunny North-Facing Loess Cliff-Benches (W4, 40 deg S sunny aspect): 3 contoured yaodong shelves
        (+3094, +3060, +3026 m) with KCARVE cave-alcove portals.
     4. Sutar-Tawar Star-Spur (+3156 m) & Siru-Spring Amphitheatre Bench (+3068 m, WOW.springAt contact).
     5. Fulcrum Brow Eastern Escarpment Lip (W6, +3068 m dropping 218 m sheer east to +2850 m convoy switchback).
     6. North Yuan Agricultural Terraces (H1, +3048 m, contoured treads & WOW.dustTowers) + SW Breccia Adit Scarp (H2, +3174 m).
   Plain data and pure functions: zero THREE, zero DOM, zero Math.random. */

var MB_GROUND = (function () {
  'use strict';
  var M = MB_MODEL;

  function mbClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function mbLerp(a, b, t) { return a + (b - a) * t; }
  function mbSmooth(e0, e1, x) {
    var t = mbClamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function mbBoxBlend(x, z, x0, x1, z0, z1, feather) {
    var f = feather == null ? 24 : feather;
    var wx = mbSmooth(x0 - f, x0 + f, x) * (1 - mbSmooth(x1 - f, x1 + f, x));
    var wz = mbSmooth(z0 - f, z0 + f, z) * (1 - mbSmooth(z1 - f, z1 + f, z));
    return wx * wz;
  }
  function mbDiscBlend(x, z, cx, cz, rIn, rOut) {
    var d = Math.hypot(x - cx, z - cz);
    return 1 - mbSmooth(rIn, rOut, d);
  }

  /* Hoskins hash21 without Math.sin for deterministic micro-relief */
  function mbHash2(ix, iz) {
    var px = ix * 0.1031, py = iz * 0.1030, pz = ix * 0.0973;
    px -= Math.floor(px); py -= Math.floor(py); pz -= Math.floor(pz);
    var d = px * (py + 33.33) + py * (pz + 33.33) + pz * (px + 33.33);
    px += d; py += d; pz += d;
    var v = (px + py) * pz;
    return v - Math.floor(v);
  }
  function mbNoise2(x, z) {
    var ix = Math.floor(x), iz = Math.floor(z);
    var fx = x - ix, fz = z - iz;
    var ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
    var a = mbHash2(ix, iz), b = mbHash2(ix + 1, iz);
    var c = mbHash2(ix, iz + 1), d = mbHash2(ix + 1, iz + 1);
    return a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz;
  }
  function mbFbm(x, z) {
    return 0.58 * mbNoise2(x, z) + 0.29 * mbNoise2(x * 2.07 + 17.3, z * 2.07 - 11.1) +
           0.13 * mbNoise2(x * 4.19 - 7.7, z * 4.19 + 23.4);
  }

  function cellH(ix, iy) {
    var cx = mbClamp(ix, 0, M.nx - 1), cy = mbClamp(iy, 0, M.ny - 1);
    return M.hd[cy * M.nx + cx] * 0.1;
  }
  function cr(p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  }
  function modelH(x, z) {
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

  /* Yut-Ma ("Moon-Bridge River", r227) centerline z(x) & strictly monotonic downstream water surface wlev(x) */
  function riverCenterZ(x) {
    /* Passes right under the Yut Moon-Bridge at (x = 0, z = -195), gently curving through the box canyon */
    var bend = 22.0 * Math.sin(mbClamp(x, -1600, 1600) * 0.0021) - 14.0 * mbSmooth(-900, -150, x) + 14.0 * mbSmooth(150, 750, x);
    return -195.0 + bend;
  }

  function riverWaterY(x) {
    /* Strictly monotonically decreasing west (-1600 m) -> east (+1600 m):
       +2958 m at west mouth -> +2932.0 m above Moon-Bridge cascade -> 8.5 m step -> +2923.5 m below Moon-Bridge ->
       +2910.5 m at escarpment throat (x=+720) -> plunges down eastern escarpment notch to +2836 m at x=+1500 */
    var xx = mbClamp(x, -1800, 1800);
    var base = 2932.0 - (xx > 0 ? 0 : xx * 0.01625);
    if (xx > -16) {
      var step = 8.5 * mbSmooth(-14, 14, xx);
      var midSlope = Math.max(0, xx) * 0.0185;
      var plunge = 62.0 * mbSmooth(720, 1380, xx);
      base = 2932.0 - step - midSlope - plunge;
    }
    return base;
  }

  /* Engineered W5 south mill-leat centerline & water level (diverted at weir x=-410, rejoining at x=-45) */
  function millLeatAt(x, z) {
    if (x < -418 || x > -38) return null;
    var lz = -164.0 + 3.0 * mbSmooth(-410, -60, x);
    var lw = mbLerp(2940.0, 2935.2, mbClamp((x + 415) / 375.0, 0, 1));
    return { z: lz, wlev: lw, d: Math.abs(z - lz) };
  }

  /* Contoured agricultural terraces on H1 North Yuan shoulder (6 dead-level 66 m treads stepped by just 2.0 m each!) */
  var H1_TERRACES = [
    { id: 'terr_n1', x0: -492, x1: -30, z0: -468, z1: -402, y: 3068.0, crop: 'dustmillet' },
    { id: 'terr_n2', x0: -516, x1: -30, z0: -540, z1: -474, y: 3070.0, crop: 'redstem' },
    { id: 'terr_n3', x0: -528, x1: -300, z0: -612, z1: -546, y: 3072.0, crop: 'wallhemp' },
    { id: 'terr_n4', x0: -522, x1: -300, z0: -684, z1: -618, y: 3074.0, crop: 'buckwheat' },
    { id: 'terr_n5', x0: -516, x1: -48, z0: -756, z1: -690, y: 3076.0, crop: 'dust-lentil' },
    { id: 'terr_n6', x0: -480, x1: -78, z0: -828, z1: -762, y: 3078.0, crop: 'bench-garlic' }
  ];

  /* Sunny north-facing W4 amphitheatre terraces (4 broad level shelves stepped by 5.5 m = 1 yaodong vault height!) */
  var W4_BENCHES = [
    { id: 'B1', x0: -498, x1: -42, z0: 0, z1: 42, y: 3119.5 },
    { id: 'B2', x0: -492, x1: -42, z0: -42, z1: -6, y: 3114.0 },
    { id: 'B3', x0: -480, x1: -42, z0: -84, z1: -48, y: 3108.5 },
    { id: 'B4', x0: -468, x1: -42, z0: -120, z1: -90, y: 3103.0 }
  ];

  /* KCARVE cave-alcove recesses behind W4 yaodong rows & W5 nitre cave overhang */
  var CAVE_ALCOVES = [
    { id: 'alcove_b1_w', x: -370, z: 40, y: 3119.5, w: 46, d: 9, h: 5.4, ry: Math.PI, kind: 'yaodong' },
    { id: 'alcove_b1_e', x: -195, z: 40, y: 3119.5, w: 46, d: 9, h: 5.4, ry: Math.PI, kind: 'yaodong' },
    { id: 'alcove_b2_w', x: -355, z: -8, y: 3114.0, w: 44, d: 9, h: 5.4, ry: Math.PI, kind: 'yaodong' },
    { id: 'alcove_b2_e', x: -185, z: -8, y: 3114.0, w: 44, d: 9, h: 5.4, ry: Math.PI, kind: 'yaodong' },
    { id: 'alcove_b3_m', x: -275, z: -50, y: 3108.5, w: 38, d: 8.5, h: 5.2, ry: Math.PI, kind: 'mushroom' },
    { id: 'alcove_nitre', x: -135, z: -129, y: 2944.0, w: 32, d: 11, h: 7.5, ry: Math.PI, kind: 'saltpeter' }
  ];

  /* WOW.dustTowers loess pillar stacks on the unploughed North-East & North-West Yuan rims */
  var DUST_TOWERS = [
    { id: 'dt_1', x: 245, z: -470, r: 7.5, h: 19.5, cap: 1.16 },
    { id: 'dt_2', x: 295, z: -535, r: 9.2, h: 24.0, cap: 1.22 },
    { id: 'dt_3', x: 348, z: -492, r: 6.4, h: 15.5, cap: 1.12 },
    { id: 'dt_4', x: 215, z: -595, r: 8.0, h: 21.0, cap: 1.18 },
    { id: 'dt_5', x: -625, z: -510, r: 8.6, h: 22.5, cap: 1.20 },
    { id: 'dt_6', x: -680, z: -585, r: 6.8, h: 16.8, cap: 1.14 },
    { id: 'dt_7', x: 392, z: -610, r: 10.2, h: 26.5, cap: 1.24 }
  ];

  /* Core sculpted heightfield h(x, z): merges into raw Scale Model 5.1 outside [-1350..+1350] */
  function sculptInner(x, z) {
    /* Base regional tilt: North Yuan ~3068..3080 m (gentle 1.3 deg shoulder), South Yuan ~3126 m, rising SW gently */
    var nMicro = (mbFbm(x * 0.0085, z * 0.0085) - 0.5) * 2.4;
    var southRise = mbSmooth(-260, 110, z);
    var swClimb = mbSmooth(540, 1040, z) * 26.0 + mbSmooth(-620, -1060, x) * 16.0 * mbSmooth(220, 760, z);
    var northTilt = (1 - southRise) * mbSmooth(-380, -920, z) * 13.5;
    var y = mbLerp(3066.8 + northTilt, 3125.0 + swClimb, southRise) + nMicro;

    /* 1. Eastern Fulcrum Escarpment plunge (x > +752 m drops 262 m sheer east to +2850 m switchback bench!) */
    var eastDrop = mbSmooth(752, 858, x);
    if (eastDrop > 0) {
      var lowBench = 2850.0 - Math.max(0, x - 920) * 0.095 + nMicro * 0.7;
      y = mbLerp(y, lowBench, eastDrop);
    }

    /* 2. Flatten W1 Pepar-Hom Citadel & Suzerain Spine (+3125..+3128.4 m) */
    var wW1 = mbBoxBlend(x, z, -270, 255, 58, 535, 18);
    if (wW1 > 0) {
      var yW1 = 3125.2 + 3.0 * mbSmooth(60, 520, z) + (mbNoise2(x * 0.02, z * 0.02) - 0.5) * 0.18;
      y = mbLerp(y, yW1, wW1);
    }

    /* 3. Flatten W3 Kuran-Kotan & West Pass Gate (+3127.5..+3138 m, 1.7 deg) + C1 Caravan Meadow (+3139.0 m, seamless across gate!) */
    var wW3 = mbBoxBlend(x, z, -645, -268, 82, 495, 20);
    if (wW3 > 0) {
      var yW3 = mbLerp(3127.2, 3138.0, mbClamp((-270 - x) / 365.0, 0, 1)) + 1.2 * mbSmooth(90, 480, z);
      y = mbLerp(y, yW3, wW3);
    }
    var wC1 = mbBoxBlend(x, z, -860, -625, 190, 360, 20);
    if (wC1 > 0) {
      var yC1 = mbLerp(3138.0, 3139.5, mbClamp((-630 - x) / 180.0, 0, 1));
      y = mbLerp(y, yC1, wC1);
    }

    /* 4. W1 -> W6 Stepped Freight Plazas (+3121.4 -> +3116.8 -> +3112.0 m, z >= 142 so Sutar-Tawar spur north of z=142 stays untouched!) */
    var wE1 = mbBoxBlend(x, z, 262, 390, 146, 468, 5.5);
    if (wE1 > 0) y = mbLerp(y, 3121.4, wE1);
    var wE2 = mbBoxBlend(x, z, 396, 518, 146, 468, 5.5);
    if (wE2 > 0) y = mbLerp(y, 3116.8, wE2);
    var wW6 = mbBoxBlend(x, z, 524, 754, 95, 470, 5.0);
    if (wW6 > 0 && x <= 756) y = mbLerp(y, 3112.0, wW6);
    var wRampE = mbBoxBlend(x, z, 250, 536, 238, 282, 8.0);
    if (wRampE > 0) {
      var yRE = mbLerp(3126.2, 3112.0, mbClamp((x - 252) / 283.0, 0, 1));
      y = mbLerp(y, yRE, wRampE);
    }
    var wRampEN = mbBoxBlend(x, z, 324, 548, 144, 160, 5.0);
    if (wRampEN > 0) {
      var yREN = x <= 456
        ? mbLerp(3121.4, 3116.8, mbClamp((x - 326) / 130.0, 0, 1))
        : mbLerp(3116.8, 3112.0, mbClamp((x - 456) / 89.0, 0, 1));
      y = mbLerp(y, yREN, wRampEN);
    }
    var wRampES = mbBoxBlend(x, z, 324, 548, 377, 393, 5.0);
    if (wRampES > 0) {
      var yRES = x <= 456
        ? mbLerp(3121.4, 3116.8, mbClamp((x - 326) / 130.0, 0, 1))
        : mbLerp(3116.8, 3112.0, mbClamp((x - 456) / 89.0, 0, 1));
      y = mbLerp(y, yRES, wRampES);
    }
    /* Lower Fulcrum Switchback Convoy Yard at foot of hoist (+2850 m, x in [+865, +1045], z in [+70, +440]) */
    var wLowYard = mbBoxBlend(x, z, 862, 1045, 70, 440, 14);
    if (wLowYard > 0) {
      y = mbLerp(y, 2850.0, wLowYard);
    }
    /* Ensure Eastern Escarpment cliff face never rises above the 4-leg convoy switchback strips */
    var wEscarpCut = mbBoxBlend(x, z, 753, 902, 76, 434, 2.5);
    if (wEscarpCut > 0) {
      var yEscCap = mbLerp(3111.5, 2850.0, mbClamp((x - 753.0) / 135.0, 0, 1));
      y = Math.min(y, yEscCap);
    }

    /* 5. W2 Sutar-Tawar Stepped Acropolis Terraces (+3130.5 & +3136.0 m, 3.8 deg Star-Path) & South Barrow Meadow */
    var wSpurLow = mbBoxBlend(x, z, 258, 370, 34, 140, 5.5);
    if (wSpurLow > 0) y = mbLerp(y, 3130.5, wSpurLow);
    var wSpurHigh = mbBoxBlend(x, z, 372, 472, 42, 140, 5.5);
    if (wSpurHigh > 0) y = mbLerp(y, 3136.0, wSpurHigh);
    var wSpurRamp = mbBoxBlend(x, z, 230, 420, 86, 142, 8.0);
    if (wSpurRamp > 0) {
      var ySRp = mbLerp(3126.0, 3136.0, mbClamp((x - 235) / 160.0, 0, 1));
      y = mbLerp(y, ySRp, wSpurRamp);
    }
    var wBarrow = mbBoxBlend(x, z, -560, -180, 485, 645, 22.0);
    if (wBarrow > 0) {
      var yBrw = mbLerp(3128.4, 3135.5, mbClamp((-210 - x) / 340.0, 0, 1));
      y = mbLerp(y, yBrw, wBarrow);
    }

    /* 6. H1 Madder-Terrace Village Green (+3072.0 m) & 6 Dead-Flat 2.0 m-Stepped Agricultural Terraces */
    var wH1 = mbBoxBlend(x, z, -300, -84, -684, -546, 5.5);
    if (wH1 > 0) {
      y = mbLerp(y, 3072.0, wH1);
    }
    for (var ti = 0; ti < H1_TERRACES.length; ti++) {
      var tr = H1_TERRACES[ti];
      var wt = mbBoxBlend(x, z, tr.x0, tr.x1, tr.z0, tr.z1, 2.4);
      if (wt > 0) y = mbLerp(y, tr.y, wt);
    }
    /* Graded 0.9 deg North Spine & 2.6 deg Terrace Cart-Ramp Corridors across H1 so farm roads never step steeply */
    var wNorthRoad = mbBoxBlend(x, z, -46, 16, -768, -398, 6.0);
    if (wNorthRoad > 0) {
      var yNRd = mbLerp(3068.0, 3076.0, mbClamp((-404 - z) / 352.0, 0, 1));
      y = mbLerp(y, yNRd, wNorthRoad);
    }
    var wH1Link = mbBoxBlend(x, z, -206, -184, -740, -560, 5.0);
    if (wH1Link > 0) {
      var yHL = mbLerp(3072.0, 3076.0, mbClamp((-620 - z) / 112.0, 0, 1));
      y = mbLerp(y, yHL, wH1Link);
    }
    var wH1West = mbBoxBlend(x, z, -318, -284, -634, -616, 4.5);
    if (wH1West > 0) {
      var yHW = mbLerp(3072.0, 3074.0, mbClamp((-286 - x) / 28.0, 0, 1));
      y = mbLerp(y, yHW, wH1West);
    }

    /* 7. H2 Breccia-Adit Mining Bench (+3150.0 m, just +12 m above W3!) backed by +3196 m megabreccia ore scarp */
    var wH2Scarp = mbBoxBlend(x, z, -940, -620, 742, 890, 14);
    if (wH2Scarp > 0) {
      y = mbLerp(y, 3196.0, wH2Scarp);
    }
    var wH2 = mbBoxBlend(x, z, -895, -635, 560, 730, 12);
    if (wH2 > 0) {
      y = mbLerp(y, 3150.0, wH2);
    }
    var wH2Haul = mbBoxBlend(x, z, -765, -575, 375, 640, 14);
    if (wH2Haul > 0) {
      var yH2R = mbLerp(3138.2, 3150.0, mbClamp((z - 378) / 252.0, 0, 1));
      y = mbLerp(y, yH2R, wH2Haul * 0.88);
    }

    /* 8. Yut-Ma Inner Box-Canyon Chasm (sheer loess & megabreccia gorge walls) */
    var rz = riverCenterZ(x);
    var rw = riverWaterY(x);
    var dz = z - rz;
    var adz = Math.abs(dz);
    var bridgeNarrow = 1.0 - 0.36 * mbSmooth(-95, -24, x) * (1 - mbSmooth(24, 95, x));
    var halfRim = 104.0 * bridgeNarrow + 28.0 * mbSmooth(680, 1100, x);
    if (adz < halfRim + 32.0) {
      var cFrac = 1 - mbSmooth(14.0, halfRim, adz);
      var steep = Math.pow(mbClamp(cFrac, 0, 1), 0.58);
      var bedY = rw - 2.4 * (1 - mbSmooth(7.5, 14.5, adz));
      y = mbLerp(y, bedY, steep);
    }

    /* 9. W5 Mill-Gorge & Kiln Bedrock Benches (carved dry shelves >= 6 m above river) */
    var wW5S = mbBoxBlend(x, z, -468, -36, -184, -124, 4.5);
    if (wW5S > 0) {
      var yW5S = 2943.5;
      var ml = millLeatAt(x, z);
      if (ml && ml.d < 2.8 && Math.abs(x + 335) > 6.5 && Math.abs(x + 235) > 6.5) {
        yW5S = ml.wlev - 1.15 * (1 - mbSmooth(1.2, 2.7, ml.d));
      }
      y = mbLerp(y, yW5S, wW5S);
    }
    var wW5N = mbBoxBlend(x, z, -52, 412, -284, -228, 5.5);
    if (wW5N > 0) {
      var yW5N = mbLerp(2939.5, 2930.5, mbClamp((x + 42.0) / 107.0, 0, 1));
      y = mbLerp(y, yW5N, wW5N);
    }

    /* 10. W4 Sunny North-Facing Amphitheatre: 4 Broad Flat Terraces (+3119.5, +3114.0, +3108.5, +3103.0 m) */
    var wW4Slope = mbBoxBlend(x, z, -504, -38, -119, 62, 4.5);
    if (wW4Slope > 0) {
      var ySlopeW4 = mbLerp(3102.5, 3125.5, mbClamp((z + 119.0) / 181.0, 0, 1));
      y = mbLerp(y, ySlopeW4, wW4Slope);
    }
    for (var bi = 0; bi < W4_BENCHES.length; bi++) {
      var bn = W4_BENCHES[bi];
      var wb = mbBoxBlend(x, z, bn.x0, bn.x1, bn.z0, bn.z1, 2.2);
      if (wb > 0) y = mbLerp(y, bn.y, wb);
    }
    /* Carve canyon wall recess along z in [-152..-116], x in [-476..-244] so 4-leg gorge switchback stands proud of cliff! */
    var wGorgeCut = mbBoxBlend(x, z, -476, -244, -152, -116, 2.0);
    if (wGorgeCut > 0) {
      y = Math.min(y, 2943.5);
    }

    /* 11. Siru-Spring Stepped Sanctuary Amphitheatre (smooth backing slope + 3 flat 5 m-stepped shelves: +3120.5, +3115.5, +3110.0 m) */
    var wSiruSlope = mbBoxBlend(x, z, 252, 442, -122, 38, 6.0);
    if (wSiruSlope > 0) {
      var ySlopeSiru = mbLerp(3109.8, 3125.8, mbClamp((z + 122.0) / 160.0, 0, 1));
      y = mbLerp(y, ySlopeSiru, wSiruSlope);
    }
    var wSiru1 = mbBoxBlend(x, z, 256, 426, -12, 30, 2.6);
    if (wSiru1 > 0) y = mbLerp(y, 3120.5, wSiru1);
    var wSiru2 = mbBoxBlend(x, z, 256, 432, -54, -18, 2.6);
    if (wSiru2 > 0) y = mbLerp(y, 3115.5, wSiru2);
    var wSiru = mbBoxBlend(x, z, 256, 438, -120, -60, 2.8);
    if (wSiru > 0) y = mbLerp(y, 3110.0, wSiru);
    var wPlunge = mbDiscBlend(x, z, 338, -142, 13, 22);
    if (wPlunge > 0) {
      y = mbLerp(y, 3071.5, wPlunge);
    }

    /* 12. Yut Moon-Bridge Ceremonial Approaches (x in [-18, +18]):
       South Ramp (+3125.2 m at z=+68 -> +3088.0 m abutment at z=-140, 10.1 deg wagon grade);
       North Ramp (+3088.0 m abutment at z=-246 -> +3068.0 m North Yuan road at z=-415, 6.7 deg wagon grade!). */
    if (Math.abs(x) < 26) {
      var wxB = 1 - mbSmooth(13, 25, Math.abs(x));
      if (z >= -141.5 && z <= 70) {
        var tSR = mbClamp((z + 140) / 208.0, 0, 1);
        var ySR = mbLerp(3088.0, 3125.2, tSR);
        var wSR = wxB * mbSmooth(-142.5, -139.8, z);
        y = mbLerp(y, ySR, wSR);
      } else if (z >= -418 && z <= -244.5) {
        var tNR = mbClamp((-246 - z) / 169.0, 0, 1);
        var yNR = mbLerp(3088.0, 3068.0, tNR);
        var wNR = wxB * (1 - mbSmooth(-246.2, -243.5, z));
        y = mbLerp(y, yNR, wNR);
      }
    }

    return y;
  }

  function h(x, z) {
    var r = Math.max(Math.abs(x), Math.abs(z));
    if (r >= 1650) return modelH(x, z);
    var inner = sculptInner(x, z);
    if (r <= 1180) return inner;
    var blend = mbSmooth(1180, 1650, r);
    return mbLerp(inner, modelH(x, z), blend);
  }

  function grad(x, z) {
    var e = 2.5;
    var gx = (h(x + e, z) - h(x - e, z)) / (2 * e);
    var gz = (h(x, z + e) - h(x, z - e)) / (2 * e);
    return { gx: gx, gz: gz, g: Math.hypot(gx, gz) };
  }

  function plateauRefY(x, z) {
    return z >= -195 ? 3126.0 + Math.max(0, z - 520) * 0.05 : 3072.0;
  }

  /* Unconformity contact between upper golden-buff loess and lower Outer Wall megabreccia (~+2972 m) */
  function brecciaTopY(x, z) {
    return 2972.0 + 6.0 * Math.sin(x * 0.0045) + 4.0 * Math.cos(z * 0.0052) +
           (z > 545 && x < -600 ? 195.0 * mbSmooth(545, 735, z) : 0);
  }

  /* Fields record F matching biomes/wouterwall/BIOME-API.md */
  function fieldsAt(x, z) {
    var y = h(x, z);
    var gr = grad(x, z);
    var rz = riverCenterZ(x);
    var rw = riverWaterY(x);
    var streamD = Math.abs(z - rz);
    var ml = millLeatAt(x, z);
    if (ml && ml.d < streamD) streamD = ml.d;
    var isWater = (Math.abs(z - rz) < 13.5 && y < rw + 0.35) || (ml != null && ml.d < 2.2 && y < ml.wlev + 0.25);

    /* Krator stands near 40 S: north-facing slopes (gz > 0, ground rising toward +z south) face the SUN (sunny > 0)! */
    var slope01 = mbClamp(gr.g / 0.85, 0, 1);
    var sunny = gr.g > 1e-4 ? mbClamp((gr.gz / gr.g) * mbSmooth(0.04, 0.22, gr.g), -1, 1) : 0;
    var refY = plateauRefY(x, z);
    var cut = Math.max(0, refY - y);
    var bTop = brecciaTopY(x, z);
    var loessDepth = Math.max(0, refY - bTop);
    var thru = y < bTop + 1.5;

    var inTerr = false;
    for (var ti = 0; ti < H1_TERRACES.length; ti++) {
      var tr = H1_TERRACES[ti];
      if (x >= tr.x0 && x <= tr.x1 && z >= tr.z0 && z <= tr.z1) { inTerr = true; break; }
    }
    var inPillar = false;
    for (var pi = 0; pi < DUST_TOWERS.length; pi++) {
      var dt = DUST_TOWERS[pi];
      if (Math.hypot(x - dt.x, z - dt.z) < dt.r + 2.5) { inPillar = true; break; }
    }

    var meanT = 12.0 - (y - 3125.0) * 0.0062 + sunny * 1.4;
    var yuan = (cut < 12.0 && gr.g < 0.09 && !inTerr) ? 1.0 : 0.0;
    var floor = (!isWater && streamD < 34.0 && gr.g < 0.22 && cut > 80.0) ? 1.0 : 0.0;
    var gully = (cut > 14.0 && !floor && gr.g < 0.95) ? mbSmooth(14.0, 65.0, cut) : 0.0;
    var spring = (!thru && Math.abs(y - bTop) < 22.0) ? (1 - Math.abs(y - bTop) / 22.0) :
                 (Math.hypot(x - 340, z + 72) < 65 ? 0.85 : 0);

    return {
      y: y,
      g: gr.g,
      slope: slope01,
      sunny: sunny,
      mean: meanT,
      perma: 0,
      water: isWater,
      streamD: streamD,
      cave: false,
      floor: floor > 0.5,
      pillar: inPillar,
      terrace: inTerr,
      terrW: inTerr ? 1 : 0,
      yuan: yuan,
      gully: gully,
      cut: cut,
      loess: thru ? 0 : Math.max(4, y - bTop),
      spring: spring,
      tp: (y % 5.0) / 5.0,
      rubble: (z > 550 && x < -600) ? 0.45 : 0,
      runout: null,
      thru: thru,
      shore: 0,
      field: inTerr,
      aufeis: false,
      pocket: false,
      rock: thru && gr.g > 0.45 ? 1 : 0
    };
  }

  function inCanyonVoid(x, z, margin) {
    var m = margin == null ? 0 : margin;
    var rz = riverCenterZ(x);
    /* Exclude Moon-Bridge deck only when explicitly on the bridge structure; lots must never sit in the gorge chasm! */
    if (Math.abs(z - rz) < 20.0 + m) return true;
    var ml = millLeatAt(x, z);
    if (ml && ml.d < 3.4 + m) return true;
    return false;
  }

  return {
    MODEL: M,
    R: 1800,
    H1_TERRACES: H1_TERRACES,
    W4_BENCHES: W4_BENCHES,
    CAVE_ALCOVES: CAVE_ALCOVES,
    DUST_TOWERS: DUST_TOWERS,
    MOON_BRIDGE: { x: 0, z0: -246, z1: -140, deckY: 3088.0, width: 13.6, archSpan: 56.0, soffitY: 3082.5 },
    WEIR_BRIDGE: { x: -42, z0: -238, z1: -148, deckY: 2941.5, width: 5.4 },
    clamp: mbClamp,
    lerp: mbLerp,
    smooth: mbSmooth,
    hash2: mbHash2,
    noise2: mbNoise2,
    fbm: mbFbm,
    modelH: modelH,
    h: h,
    grad: grad,
    riverCenterZ: riverCenterZ,
    riverWaterY: riverWaterY,
    millLeatAt: millLeatAt,
    brecciaTopY: brecciaTopY,
    fieldsAt: fieldsAt,
    inCanyonVoid: inCanyonVoid
  };
})();
