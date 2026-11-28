/* ================================================================= AMARO GROUND, 4-TIER ABLAQ CANYON & TRIPLE CONFLUENCE (Step A1)
   [G data] Pure closed-form elevation, slope, river channels, cliff-shelf classification, and world-frame transform for Amaro
   (ssgsv5zbd2, px 731,1192 on scale model 5.1; settlements/shumar/PLAN.md). No THREE, no DOM.
   Local coordinates: metres from px (731, 1192), +x east, +z south, -z north out over the cliff lip into the Betun-Narun chasm.
   Vertical datum: AM.DATUM = 2848.0 m asl (confluence water surface at Payaru-Gisr = local y 0.0 m; Amaro rim = +240.7 m). */

var AM = (function () {
  'use strict';

  var DATUM = 2848.0;
  var SEED = 73192;
  var PIN = [731, 1192];

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

  /* Point-to-segment distance and parameter t in [0, 1] */
  function segDist(x, z, ax, az, bx, bz) {
    var dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    var t = L2 > 1e-9 ? clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1) : 0;
    var px = ax + dx * t, pz = az + dz * t;
    return [Math.hypot(x - px, z - pz), t, px, pz];
  }

  /* Nearest point on a 3D/4D polyline [[x, z, wy, hw], ...] */
  function polyNear(x, z, pts) {
    var bestD = 1e9, bestY = 0, bestHw = 10, bestS = 0, acc = 0;
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

  /* Smooth axis-aligned or rounded box weight: 1 inside box inset by feather, 0 outside box */
  function boxMask(x, z, x0, z0, x1, z1, fx, fz) {
    var ex = fx == null ? 24 : fx;
    var ez = fz == null ? ex : fz;
    if (x <= x0 - ex || x >= x1 + ex || z <= z0 - ez || z >= z1 + ez) return 0;
    return smooth(x0 - ex, x0 + ex, x) * smooth(x1 + ex, x1 - ex, x) *
           smooth(z0 - ez, z0 + ez, z) * smooth(z1 + ez, z1 - ez, z);
  }

  /* ---- 1. THREE CONFLUENCE RIVERS + MILL-RACE LEAT ([x, z, waterY, halfWidth]) ---- */
  /* r007 Betun-Narun (135 -> 209 m3/s): flows E->W under the north cliff, bends SW around Citadel prow */
  var RIV_BETUN = [
    [2800, -1010, 9.6, 22],
    [1850, -965, 6.2, 22],
    [1050, -935, 3.4, 23],
    [480, -920, 1.5, 23],
    [180, -920, 0.5, 24],
    [60, -920, 0.0, 22],      /* Payaru-Gisr fortified toll-bridge throat */
    [-220, -915, -0.7, 25],
    [-560, -895, -1.5, 26],
    [-860, -780, -2.2, 26],
    [-1030, -520, -2.8, 27],
    [-1060, -220, -3.4, 28],  /* Qappu-Narun junction under Citadel west cliff */
    [-1380, -40, -4.4, 29],
    [-1950, 150, -5.8, 30],
    [-2800, 360, -7.6, 31]
  ];

  /* r288 Payaru-Buruqu (60 m3/s): descends from NNE canyon into Betun-Narun at (180, -920) */
  var RIV_PAYARU = [
    [780, -2700, 26.0, 12],
    [560, -2050, 16.5, 12],
    [390, -1540, 8.8, 13],
    [255, -1160, 2.8, 13],
    [180, -920, 0.5, 14]
  ];

  /* r287 Qappu-Narun (69 m3/s): descends from Station 4 SSE gorge into Betun-Narun at (-1060, -220) */
  var RIV_QAPPU = [
    [-1340, 2200, 29.0, 13],
    [-1240, 1380, 17.5, 13],
    [-1155, 640, 7.8, 14],
    [-1095, 80, 0.8, 14],
    [-1060, -220, -3.4, 15]
  ];

  /* Stone diversion mill-race leat feeding Payaru-Gisr overshot watermills along the south gorge terrace */
  var RIV_LEAT = [
    [460, -895, 6.8, 2.6],
    [340, -838, 6.4, 2.4],
    [140, -836, 5.8, 2.4],
    [-80, -836, 5.1, 2.4],
    [-250, -858, 4.4, 2.4],
    [-330, -905, 1.2, 2.6]
  ];

  var RIVERS = [
    { id: 'r007', name: 'Betun-Narun', flow: 175, pts: RIV_BETUN, main: true },
    { id: 'r288', name: 'Payaru-Buruqu', flow: 60, pts: RIV_PAYARU, main: true },
    { id: 'r287', name: 'Qappu-Narun', flow: 69, pts: RIV_QAPPU, main: true },
    { id: 'leat.gisr', name: 'Payaru-Gisr Mill-Race', flow: 6, pts: RIV_LEAT, leat: true }
  ];

  /* ---- 2. DARB AL-KIR EASTERN-FLANK SWITCHBACK WAGON & GIANT RAMP (<= 7.4% grade every leg, clear of Forge Amphitheatre) ---- */
  var SWITCHBACK = [
    [60, -868, 5.2],      /* South bridgehead plaza at Payaru-Gisr */
    [60, -764, 11.2],     /* Gorge-foot ramp head on Payaru-Gisr Avenue */
    [860, -730, 70.0],    /* Lower eastern gorge-bench sweep beneath Madinat al-Qubab (7.34% grade) */
    [138, -688, 123.4],   /* Mid-cliff westbound gallery on the Customs flank (7.38% grade) */
    [885, -646, 178.6],   /* Upper-east cliff gallery (7.38% grade) */
    [444, -566, 202.3],   /* Enters east gate of Tariq al-Ghuraba Customs Shelf (-38 m, 5.29% grade) */
    [130, -566, 201.8],   /* Traverses Customs Shelf Avenue past Babu-Iziz, Weigh-House & Babu-Dalab */
    [130, -502, 203.0],   /* Turns south behind Babu-Dalab apron */
    [645, -464, 240.0],   /* Final upper riser ascent onto plateau rim (7.16% grade) */
    [96, -444, 240.0],    /* North Curtain Wall esplanade */
    [96, -432, 240.1]     /* Babu al-Samal (North Pishtaq Gate into Upper City) */
  ];

  /* Direct monumental compound Giant+human stair-chute (Sullam al-Gedu) linking Gisr -> Forge Ledges 1 & 2 -> Lip Meydan */
  var COMPOUND_STAIR = [
    [14, -748, 12.1],     /* Foot of Riser 1 at Gisr South terrace */
    [12, -692, 67.4],     /* Top of Flight 1 at Tier 1 Lower Forge Shelf brink */
    [10, -635, 68.7],     /* Across Tier 1 Shelf landing to foot of Riser 2 */
    [8, -603, 137.4],     /* Top of Flight 2 at Tier 2 Upper Crucible Shelf brink */
    [6, -545, 138.7],     /* Across Tier 2 Shelf landing to foot of Riser 3 */
    [0, -442, 239.8]      /* Top of Flight 3 at Upper City Lip Meydan rim */
  ];

  /* ---- 3. EXPLICIT DISTRICT SHELVES & TIERS ---- */
  var ZONES = {
    gisrSouth: { x0: -380, z0: -882, x1: 470, z1: -742, y0: 4.5, y1: 12.2 },
    gisrNorth: { x0: -340, z0: -1120, x1: 128, z1: -958, y0: 4.5, y1: 13.0 },
    ledge1:    { x0: -320, z0: -692, x1: 112, z1: -635, y: 68.0 },
    ledge2:    { x0: -355, z0: -603, x1: 96, z1: -545, y: 138.0 },
    customs:   { x0: 118, z0: -642, x1: 458, z1: -498, y: 202.0 },  /* -38.0 m below +240.0 m North Gate rim */
    upperCity: { x0: -496, z0: -442, x1: 436, z1: 462, y: 240.7 },
    qubab:     { x0: 464, z0: -446, x1: 1136, z1: -208, y: 251.2 },  /* Skyline crest */
    citadel:   { x0: -836, z0: -442, x1: -556, z1: -86, y: 257.5 },
    citadelProw: { x0: -826, z0: -428, x1: -668, z1: -210, y: 262.4 },
    fosse:     { x0: -544, z0: -446, x1: -512, z1: -82, y: 227.5 }
  };

  /* Four-tier ablaq riser profile for u in [0, 1]: 4 steep basalt column risers + 3 limestone ledges */
  function tierStep4(u) {
    var c = clamp(u, 0, 1) * 4;
    var iq = Math.min(3, Math.floor(c));
    var fq = c - iq;
    var step = 0.86 * smooth(0.04, 0.62, fq) + 0.14 * smooth(0.62, 1.0, fq);
    return (iq + step) * 0.25;
  }

  /* Two-step ablaq riser profile for individual cliff risers */
  function tierStep2(u) {
    var c = clamp(u, 0, 1) * 2;
    var iq = Math.min(1, Math.floor(c));
    var fq = c - iq;
    var step = 0.84 * smooth(0.04, 0.66, fq) + 0.16 * smooth(0.66, 1.0, fq);
    return (iq + step) * 0.5;
  }

  /* Nearest main gorge river (Betun, Payaru, Qappu) */
  function gorgeNearest(x, z) {
    var b = polyNear(x, z, RIV_BETUN);
    var p = polyNear(x, z, RIV_PAYARU);
    var q = polyNear(x, z, RIV_QAPPU);
    var best = b;
    if (p.d < best.d) best = p;
    if (q.d < best.d) best = q;
    /* Smooth minimum distance so confluence junctions have zero crease */
    var k = 38;
    var e1 = Math.exp(-b.d / k), e2 = Math.exp(-p.d / k), e3 = Math.exp(-q.d / k);
    var es = e1 + e2 + e3;
    var dSmooth = es > 1e-12 ? -k * Math.log(es) : best.d;
    var wy = es > 1e-12 ? (b.wy * e1 + p.wy * e2 + q.wy * e3) / es : best.wy;
    var hw = es > 1e-12 ? (b.hw * e1 + p.hw * e2 + q.hw * e3) / es : best.hw;
    return { d: Math.min(best.d, dSmooth + 12), rawD: best.d, wy: wy, hw: hw };
  }

  /* Monotonic north-to-south stepped cliff amphitheatre & eastern flank profile (x in [-440, +940], z in [-764, -440]):
     Adds organic basalt headland/buttress undulation along X on the cliff risers while keeping occupied shelf pads level
     and guaranteeing dh/dz >= 0 everywhere so zero troughs or lip dams ever form. */
  function northAmphitheatreH(x, z, baseGisrY, upperRimY, nMed) {
    /* Organic basalt headland cragging along X (fades out near Sullam al-Gedu stair corridor x in [-8, 24]) */
    var stairKeep = 1.0 - smooth(26, 8, Math.abs(x - 8));
    var cragA = ((krandField(x * 0.0085 + 2.1, 0.5, 2, 73141) - 0.5) * 16.0 +
                 (krandField(x * 0.024 - 1.7, 1.3, 2, 73142) - 0.5) * 5.5) * stairKeep;
    var cragB = ((krandField(x * 0.0092 - 3.4, 2.1, 2, 73143) - 0.5) * 10.0 +
                 (krandField(x * 0.026 + 0.9, 3.7, 2, 73144) - 0.5) * 3.8) * stairKeep;

    /* Riser 1 brink (-692) & foot (-754) undulate organically OUTWARD (northward) so Ledge 1 pad [-690..-636] stays intact */
    var zFoot1 = -752 - Math.max(0, cragA) * 0.8;
    var zBrink1 = -692 - Math.abs(cragA) * 0.45;
    /* Riser 2 spans [-635 .. -603] with subtle cragging inside [-635 .. -603] */
    var zFoot2 = -635 + clamp(cragB * 0.16, -1.5, 2.5);
    var zBrink2 = -603 - clamp(Math.abs(cragB) * 0.22, 0, 2.8);
    /* Riser 3 spans [-545 .. -442] with organic buttresses */
    var zFoot3 = -545 + clamp(cragA * 0.25, -2.0, 5.0);
    var zBrink3 = -442 + clamp(cragB * 0.18, -3.5, 1.0);

    var fH;
    if (z <= zFoot1) {
      fH = baseGisrY;
    } else if (z <= zBrink1) {
      fH = mix(baseGisrY, 67.4, tierStep2((z - zFoot1) / Math.max(18.0, zBrink1 - zFoot1)));
    } else if (z <= zFoot2) {
      fH = mix(67.4, 68.7, clamp((z + 692) / 57.0, 0, 1)) + nMed * 0.05;
    } else if (z <= zBrink2) {
      fH = mix(68.7, 137.4, tierStep2((z - zFoot2) / Math.max(16.0, zBrink2 - zFoot2)));
    } else if (z <= zFoot3) {
      fH = mix(137.4, 138.7, clamp((z + 603) / 58.0, 0, 1)) + nMed * 0.05;
    } else if (z <= zBrink3) {
      fH = mix(138.7, upperRimY, tierStep2((z - zFoot3) / Math.max(35.0, zBrink3 - zFoot3)));
    } else {
      fH = upperRimY;
    }

    /* B. East Customs Shelf & Qubab Flank (x >= 132): monotonic stepped cliff up to +202 m shelf (x <= 462) or +250 m Qubab */
    var cFoot = -762 - Math.abs(cragA) * 0.5;
    var cBrink = -642 - Math.abs(cragB) * 0.55;
    var cBack = -498 + clamp(cragA * 0.18, -2.0, 3.0);
    var cS0 = 201.2 + clamp(x - 288, -180, 180) * 0.002;
    var cS1 = 203.0 + clamp(x - 288, -180, 180) * 0.002;
    var cH;
    if (z <= cFoot) {
      cH = baseGisrY;
    } else if (z <= cBrink) {
      cH = mix(baseGisrY, cS0, tierStep2((z - cFoot) / Math.max(40.0, cBrink - cFoot)));
    } else if (z <= cBack) {
      /* East of x=465 (beyond Customs Shelf), continue rising cleanly up the Qubab cliff instead of extending a flat shelf */
      var beyondCust = smooth(458, 535, x);
      var shelfY = mix(cS0, cS1, clamp((z + 642) / 144.0, 0, 1)) + nMed * 0.05;
      var qubSlopeY = mix(cS0, upperRimY, smooth(cBrink, -446, z));
      cH = mix(shelfY, qubSlopeY, beyondCust);
    } else if (z <= -442) {
      var beyondCust2 = smooth(458, 535, x);
      var upCustY = mix(cS1, upperRimY, smooth(cBack, -442, z));
      var qubSlopeY2 = mix(cS0, upperRimY, smooth(cBrink, -446, z));
      cH = mix(upCustY, qubSlopeY2, beyondCust2);
    } else {
      cH = upperRimY;
    }

    /* Broad, natural rocky buttress transition between Forge Amphitheatre (x <= 94) and Customs Promontory (x >= 146) */
    var spurShift = cragB * 0.65;
    var wEast = smooth(94 + spurShift, 146 + spurShift, x);
    var profH = mix(fH, cH, wEast);

    /* Linear rock-cut ramp groove along Sullam al-Gedu (COMPOUND_STAIR, x around 0..14) so stair flights have constant pitch */
    var stX = z <= -692 ? mix(14, 12, clamp((z + 748) / 56, 0, 1))
            : z <= -635 ? mix(12, 10, clamp((z + 692) / 57, 0, 1))
            : z <= -603 ? mix(10, 8, clamp((z + 635) / 32, 0, 1))
            : z <= -545 ? mix(8, 6, clamp((z + 603) / 58, 0, 1))
            : mix(6, 0, clamp((z + 545) / 103, 0, 1));
    var dStair = Math.abs(x - stX);
    if (dStair < 14.0 && z > -748 && z < -442) {
      var stLinear = z <= -692 ? mix(baseGisrY, 67.4, clamp((z + 748) / 56, 0, 1))
                   : z <= -635 ? mix(67.4, 68.7, (z + 692) / 57.0)
                   : z <= -603 ? mix(68.7, 137.4, clamp((z + 635) / 32, 0, 1))
                   : z <= -545 ? mix(137.4, 138.7, (z + 603) / 58.0)
                   : mix(138.7, upperRimY, clamp((z + 545) / 103, 0, 1));
      profH = mix(profH, stLinear, smooth(14.0, 4.5, dStair));
    }

    return profH;
  }

  /* Core canyon & promontory height before far-field blend */
  function localCanyonH(x, z) {
    var nBig = (krandField(x * 0.00075 + 3.1, z * 0.00075 - 5.4, 3, 73101) - 0.5) * 14.0;
    var nMed = (krandField(x * 0.0028 - 1.7, z * 0.0028 + 4.2, 2, 73102) - 0.5) * 4.5;

    /* Base plateau bench elevation (~240.7 m at origin, gently rising S and WSW, dipping slightly E) */
    var platH = 240.7 + clamp(z, -900, 1600) * 0.0052 - clamp(x, -1200, 1400) * 0.0014 + nBig * 0.55 + nMed * 0.35;
    /* North bluff across the Betun-Narun chasm (px 730..732, 1190..1191 rises back to ~222..236 m) */
    if (z < -920) {
      platH = 228.0 + clamp(-z - 1200, 0, 1400) * 0.008 + nBig * 0.7 + nMed * 0.45;
    }

    var G = gorgeNearest(x, z);
    var spurWarp = (krandField(x * 0.0034 + 6.2, z * 0.0034 - 2.8, 2, 73103) - 0.5) * 36.0;

    /* Canyon floor half-width around the river and cliff-wall horizontal span */
    var gisrExpand = boxMask(x, z, -440, -1150, 520, -720, 140, 90);
    var floorW = G.hw + 26 + 135 * gisrExpand + spurWarp * 0.22;
    var wallW = 245 + 55 * gisrExpand + spurWarp * 0.45;

    var u = clamp((G.d - floorW) / Math.max(90, wallW), 0, 1);
    var wallT = tierStep4(u);

    /* River channel & gravel bar floor */
    var barH = G.wy + 2.4 + 6.8 * smooth(G.hw + 3, floorW, G.d) + nMed * 0.18 * smooth(G.hw + 4, G.hw + 24, G.d);
    var bedH = G.wy - 2.6 * smooth(G.hw + 4, G.hw * 0.25, G.rawD);
    var floorH = mix(bedH, barH, smooth(G.hw - 1, G.hw + 5, G.rawD));

    var h = mix(floorH, platH, wallT);

    /* ---- Explicit flat-graded architectural tiers & monotonic cliff amphitheatre ---- */
    /* 1. Tier 0: Payaru-Gisr South & North river terraces (clear of river channels) */
    var rivKeep = smooth(G.hw + 4, G.hw + 16, G.rawD);
    var wGS = boxMask(x, z, ZONES.gisrSouth.x0, ZONES.gisrSouth.z0, ZONES.gisrSouth.x1, ZONES.gisrSouth.z1, 26, 18) * rivKeep;
    if (wGS > 0) {
      var tGS = clamp((z - ZONES.gisrSouth.z0) / (ZONES.gisrSouth.z1 - ZONES.gisrSouth.z0), 0, 1);
      var hGS = mix(ZONES.gisrSouth.y0, ZONES.gisrSouth.y1, tGS) + nMed * 0.06;
      h = mix(h, hGS, wGS);
    }
    var wGN = boxMask(x, z, ZONES.gisrNorth.x0, ZONES.gisrNorth.z0, ZONES.gisrNorth.x1, ZONES.gisrNorth.z1, 26, 18) * rivKeep;
    if (wGN > 0) {
      var tGN = clamp((ZONES.gisrNorth.z1 - z) / (ZONES.gisrNorth.z1 - ZONES.gisrNorth.z0), 0, 1);
      var hGN = mix(ZONES.gisrNorth.y0, ZONES.gisrNorth.y1, tGN) + nMed * 0.06;
      h = mix(h, hGN, wGN);
    }

    /* 2. North Cliff Amphitheatre & Eastern Customs Flank (x in [-415, +910], z in [-766, -438]) */
    var wAmph = boxMask(x, z, -385, -764, 905, -440, 55, 18) * rivKeep;
    if (wAmph > 0) {
      var rimAtX = x > 460 ? 250.2 : (240.7 - 442 * 0.0046 + nMed * 0.06);
      var amphH = northAmphitheatreH(x, z, 11.4, rimAtX, nMed);
      h = mix(h, amphH, wAmph);
    }

    /* Carve shallow stone leat channel along South Gisr */
    var qLeat = polyNear(x, z, RIV_LEAT);
    if (qLeat.d < qLeat.hw + 3.5) {
      var wL = smooth(qLeat.hw + 3.5, qLeat.hw * 0.5, qLeat.d);
      h = mix(h, qLeat.wy - 0.85, wL * 0.85);
    }

    /* 3. Tier 3 (+239..+244 m): Upper Walled City promontory table */
    var wUp = boxMask(x, z, ZONES.upperCity.x0, ZONES.upperCity.z0, ZONES.upperCity.x1, ZONES.upperCity.z1, 22, 16);
    if (wUp > 0) {
      var hUp = 240.7 + z * 0.0046 + nMed * 0.08;
      h = mix(h, hUp, wUp);
    }

    /* 4. Tier 3E (+249..+254 m): Madinat al-Qubab Skyline Crest along the eastern cliff lip */
    var wQub = boxMask(x, z, ZONES.qubab.x0, ZONES.qubab.z0, ZONES.qubab.x1, ZONES.qubab.z1, 24, 16);
    if (wQub > 0) {
      var crestPeak = 2.6 * Math.exp(-Math.pow((x - 820) / 210, 2)) * Math.exp(-Math.pow((z + 418) / 95, 2));
      var hQub = 250.2 + crestPeak - Math.max(0, z + 390) * 0.012 + nMed * 0.06;
      h = mix(h, hQub, wQub);
    }

    /* 5. Tier 4 (+257..+263 m): Qappu al-Subaru Citadel Spur & Inner Prow */
    var wCit = boxMask(x, z, ZONES.citadel.x0, ZONES.citadel.z0, ZONES.citadel.x1, ZONES.citadel.z1, 20, 18);
    if (wCit > 0) {
      var wProw = boxMask(x, z, ZONES.citadelProw.x0, ZONES.citadelProw.z0, ZONES.citadelProw.x1, ZONES.citadelProw.z1, 24, 24);
      var hCit = mix(ZONES.citadel.y, ZONES.citadelProw.y, wProw) - (z + 260) * 0.004 + nMed * 0.06;
      h = mix(h, hCit, wCit);
    }

    /* Rock-cut dry fosse isolating Qappu al-Subaru from Upper City (spanned by causeway at z = -265) */
    var wFos = boxMask(x, z, ZONES.fosse.x0, ZONES.fosse.z0, ZONES.fosse.x1, ZONES.fosse.x1 ? ZONES.fosse.z1 : -82, 6, 12);
    if (wFos > 0) {
      var causeway = Math.exp(-Math.pow((z + 265) / 9.5, 2));
      var fosFloor = mix(ZONES.fosse.y, 248.5, causeway);
      h = mix(h, fosFloor, wFos * (1 - causeway * 0.82));
    }

    /* 6. Subtle contour-matched shelf for Darb al-Kir eastern switchback (no sunken trough, capped 5.5 m retaining shoulder) */
    if (x > 35 && x < 915 && z > -875 && z < -425) {
      var bestR = 1e9, rY = h;
      for (var i = 1; i < SWITCHBACK.length; i++) {
        var sa = SWITCHBACK[i - 1], sb = SWITCHBACK[i];
        var sq = segDist(x, z, sa[0], sa[1], sb[0], sb[1]);
        if (sq[0] < bestR) {
          bestR = sq[0];
          rY = mix(sa[2], sb[2], sq[1]);
        }
      }
      if (bestR < 13.0) {
        var wRoad = smooth(13.0, 5.0, bestR);
        var targetRoadY = h > rY ? h : Math.min(rY, h + 5.5);
        h = mix(h, targetRoadY, wRoad * 0.85);
      }
    }

    return h;
  }

  /* Master terrain height amaroH(x, z): local 4-tier gorge inside 2.5 km, smoothly blending to 5.1 AM_MODEL by 3.9 km */
  function amaroH(x, z) {
    var r = Math.hypot(x, z);
    if (r >= 3950 && typeof AM_MODEL !== 'undefined') {
      var mFar = AM_MODEL.bilinear(x, z);
      var micro = (krandField(x * 0.0018 + 9.1, z * 0.0018 - 3.7, 2, 73109) - 0.5) * 2.2;
      return mFar + micro;
    }
    var loc = localCanyonH(x, z);
    if (r <= 2450 || typeof AM_MODEL === 'undefined') return loc;
    var t = smooth(2450, 3950, r);
    var mod = AM_MODEL.bilinear(x, z) + (krandField(x * 0.0018 + 9.1, z * 0.0018 - 3.7, 2, 73109) - 0.5) * 2.2;
    return mix(loc, mod, t);
  }

  /* Central-difference ground slope (rise / run) */
  function amaroSlope(x, z, step) {
    var e = step == null ? 4.0 : step;
    var gx = (amaroH(x + e, z) - amaroH(x - e, z)) / (2 * e);
    var gz = (amaroH(x, z + e) - amaroH(x, z - e)) / (2 * e);
    return Math.hypot(gx, gz);
  }

  /* Water info at (x, z): { wet, wy, depth, river } */
  function amaroWater(x, z) {
    if (Math.hypot(x, z) > 3600) return { wet: false, wy: -1e9, depth: 0, id: null };
    for (var i = 0; i < RIVERS.length; i++) {
      var R = RIVERS[i];
      var q = polyNear(x, z, R.pts);
      if (q.d <= q.hw) {
        var gh = amaroH(x, z);
        var wy = q.wy;
        if (gh < wy + 0.35 || R.leat) {
          return { wet: true, wy: wy, depth: Math.max(0.25, wy - gh), id: R.id };
        }
      }
    }
    return { wet: false, wy: -1e9, depth: 0, id: null };
  }

  /* Tier classification for tags, ground painting, flora & tests */
  function amaroTierAt(x, z) {
    if (boxMask(x, z, ZONES.citadel.x0, ZONES.citadel.z0, ZONES.citadel.x1, ZONES.citadel.z1, 8, 8) > 0.5) return 'citadel';
    if (boxMask(x, z, ZONES.qubab.x0, ZONES.qubab.z0, ZONES.qubab.x1, ZONES.qubab.z1, 8, 8) > 0.5) return 'necropolis';
    if (boxMask(x, z, ZONES.customs.x0, ZONES.customs.z0, ZONES.customs.x1, ZONES.customs.z1, 8, 8) > 0.5) return 'customs';
    if (boxMask(x, z, ZONES.upperCity.x0, ZONES.upperCity.z0, ZONES.upperCity.x1, ZONES.upperCity.z1, 8, 8) > 0.5) return 'upper';
    if (boxMask(x, z, ZONES.ledge2.x0, ZONES.ledge2.z0, ZONES.ledge2.x1, ZONES.ledge2.z1, 8, 8) > 0.5) return 'ledge2';
    if (boxMask(x, z, ZONES.ledge1.x0, ZONES.ledge1.z0, ZONES.ledge1.x1, ZONES.ledge1.z1, 8, 8) > 0.5) return 'ledge1';
    if (boxMask(x, z, ZONES.gisrSouth.x0, ZONES.gisrSouth.z0, ZONES.gisrSouth.x1, ZONES.gisrSouth.z1, 8, 8) > 0.5 ||
        boxMask(x, z, ZONES.gisrNorth.x0, ZONES.gisrNorth.z0, ZONES.gisrNorth.x1, ZONES.gisrNorth.z1, 8, 8) > 0.5) return 'gisr';
    var h = amaroH(x, z);
    return h < 35 ? 'gorge' : h < 225 ? 'cliff' : 'plateau';
  }

  /* core/world/bake_towns.py 'closed' contract */
  function amaroWorldFrame() {
    return { rot: 0, centre: [0, 0], y0: DATUM, pin: PIN.slice() };
  }

  function amaroToWorld(x, z) {
    return [x, z, amaroH(x, z) + DATUM];
  }

  return {
    SEED: SEED,
    DATUM: DATUM,
    PIN: PIN,
    ZONES: ZONES,
    RIVERS: RIVERS,
    SWITCHBACK: SWITCHBACK,
    COMPOUND_STAIR: COMPOUND_STAIR,
    h: amaroH,
    slope: amaroSlope,
    water: amaroWater,
    tierAt: amaroTierAt,
    polyNear: polyNear,
    segDist: segDist,
    boxMask: boxMask,
    worldFrame: amaroWorldFrame,
    toWorld: amaroToWorld
  };
})();

var amaroH = AM.h;
var amaroSlope = AM.slope;
var amaroWater = AM.water;
var amaroWorldFrame = AM.worldFrame;
var amaroToWorld = AM.toWorld;

if (typeof globalThis !== 'undefined') {
  globalThis.AM = AM;
  globalThis.amaroH = amaroH;
  globalThis.amaroSlope = amaroSlope;
  globalThis.amaroWater = amaroWater;
  globalThis.amaroWorldFrame = amaroWorldFrame;
  globalThis.amaroToWorld = amaroToWorld;
}
