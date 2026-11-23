/* ================================================================= THE DOME — laccolith physics & acoustics (DOME_PHYS; [G data])
   Pure deterministic math for Scale-Model 5.1 polygon rmweubdnyts8y ("the dome", 28,960 km2, 100.0% dry land,
   apex (1328, 150) at +2,924.8 m, g = 7.4 m/s2 / 0.75 g, P = 1.34 -> 1.11 atm).
   Zero THREE, zero DOM, zero Math.random, zero getImageData; every draw uses core/rand (KRAND).
   Tested by biomes/thedome/tests/test-thedome.js on tools/ktest.js.
*/
var DOME_PHYS = (function () {
  'use strict';

  var CONST = {
    POLYGON_ID: 'rmweubdnyts8y',
    AREA_KM2: 28960,
    OWN_DM_KM2: 22520,
    APEX_PX: [1328, 150],
    CENTROID_PX: [1351.0, 145.7],
    BOUNDS_PX: [1298, 100, 1403, 194],
    ELEV_MIN_M: 1442.0,
    ELEV_MED_M: 2301.9,
    ELEV_MAX_M: 2924.8,
    PROMINENCE_M: 1482.8,
    GRAVITY_MS2: 7.4,
    YOUNGS_PORPHYRY_PA: 6.4e10,
    DENSITY_PORPHYRY_KGM3: 2640.0,
    POISSON_NU: 0.23,
    SCALE_HEIGHT_M: 10950.0,
    SEA_P_ATM: 1.564,
    O2_SHARE: 0.210,
    CROWN_CLOUD_BASE_M: 2720.0
  };

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) {
    var t = clamp((x - a) / ((b - a) === 0 ? 1e-6 : (b - a)), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function def(v, d) { return v == null ? d : v; }

  function needRand() {
    var R = typeof KRAND !== 'undefined' ? KRAND : (typeof globalThis !== 'undefined' ? globalThis.KRAND : null);
    if (!R) throw new Error('DOME_PHYS requires core/rand (KRAND) loaded first');
    return R;
  }

  /* Barometric envelope across the resurgent dome: +1,442 m (~1.34 atm) -> +1,749 m (1.29 atm) -> +2,268.5 m (1.20 atm) -> +2,924.8 m (1.11 atm) */
  function pressureAt(elevM) {
    var e = def(elevM, CONST.ELEV_MED_M);
    var pAtm = 1.20 * Math.exp(-(e - 2268.5) / 8600.0);
    var tMeanC = clamp(16.0 - (e - 2268.5) * 0.0074, -6.0, 26.0);
    var rho = pAtm * 1.195 * (289.15 / (273.15 + tMeanC));
    var inCrownVeil = e >= CONST.CROWN_CLOUD_BASE_M;
    return {
      elevM: +e.toFixed(2),
      pAtm: +pAtm.toFixed(4),
      pO2Atm: +(pAtm * CONST.O2_SHARE).toFixed(4),
      rhoKgM3: +rho.toFixed(4),
      tempMeanC: +tMeanC.toFixed(2),
      koppen: e >= 2780.0 ? 'Cfb' : 'Cfa',
      inCrownVeil: inCrownVeil,
      cloudDripMmYr: inCrownVeil ? Math.round(280 + 160 * smooth(2720.0, 2924.8, e)) : 0
    };
  }

  /* Scale-Model 5.1 footprint & sibling-exclusive own_dm verification for station / world coordinates */
  function inDomeFootprint(px, py) {
    var bx = CONST.BOUNDS_PX;
    if (px < bx[0] || py < bx[1] || px > bx[2] || py > bx[3]) {
      return { inPolygon: false, inOwnDm: false, domeRadiusKm: 999, apexDistPx: 999 };
    }
    var dx = (px - CONST.CENTROID_PX[0]) / 52.5;
    var dy = (py - CONST.CENTROID_PX[1]) / 47.0;
    var rNorm = Math.hypot(dx, dy);
    var dApexPx = Math.hypot(px - CONST.APEX_PX[0], py - CONST.APEX_PX[1]);
    var rKm = dApexPx * 2.0;
    var inPoly = rNorm <= 1.02;
    /* Sibling collar exclusions: Spider Lake (S, py > 168), Springhollows (WSW, px < 1313 & py > 136), Upper Ria (NW, px < 1309 & py < 112), Tharn Hills (E, px > 1397) */
    var inCollar = (py > 168) || (px < 1313 && py > 136) || (px < 1309 && py < 112) || (px > 1397);
    return {
      inPolygon: inPoly,
      inOwnDm: !!(inPoly && !inCollar),
      domeRadiusKm: +rKm.toFixed(2),
      apexDistPx: +dApexPx.toFixed(2)
    };
  }

  /* 1. Onion-skin exfoliation shell geometry, A-tent hollow buckles, and radial rainwater scour flutes */
  function shellAt(x, z, site) {
    var R = needRand();
    var s = site || {};
    var seed = def(s.seed, 6101) >>> 0;
    var px = s.px ? s.px[0] : 1336;
    var py = s.px ? s.px[1] : 128;
    var apexVecX = (px - CONST.APEX_PX[0]) * 2000.0 + x;
    var apexVecZ = (py - CONST.APEX_PX[1]) * 2000.0 + z;
    var domeDistM = Math.hypot(apexVecX, apexVecZ);
    var domeRadiusKm = domeDistM * 0.001;

    /* Concentric step spacing around apex (on crown centered at 0,0; on flank stations curved arcs wrapping apex) */
    var centerLocal = s.id === 'crown' ? [0, 0] : (s.domeCenterLocal || [-320, 420]);
    var rx = x - centerLocal[0], rz = z - centerLocal[1];
    var rLocal = Math.hypot(rx, rz);
    var shellSpacingM = def(s.shellSpacingM, s.id === 'crown' ? 46.0 : 54.0);
    var warp = (R.fbm(x * 0.0055, 0.5, z * 0.0055, 2, seed + 11) - 0.5) * shellSpacingM * 0.32;
    var phase = (rLocal + warp) / shellSpacingM;
    var frac = phase - Math.floor(phase);

    /* Sharp riser notch where one onion-skin sheet peels back from the underlying shell (frac near 0 / 1) */
    var distToRiser = Math.min(frac, 1.0 - frac) * shellSpacingM;
    var riserBandM = def(s.riserBandM, 5.2);
    var shellStep01 = 1.0 - smooth(1.2, riserBandM, distToRiser);
    var riserHeightM = def(s.riserHeightM, s.id === 'crown' ? 1.85 : 2.15) * (0.78 + 0.44 * R.unit(R.hash(seed, Math.floor(phase), 3, 17)));

    /* Base convex dome slope + steeper inclination on exfoliation step-riser faces */
    var baseSlopeDeg = def(s.baseSlopeDeg, s.id === 'crown' ? 8.5 : s.id === 'moat' ? 14.5 : 13.5);
    var microSlope = 5.5 * Math.abs(R.fbm(x * 0.012, 0.5, z * 0.012, 2, seed + 23) - 0.5);
    var fluteAng = Math.atan2(rz, rx);
    var fluteWave = R.fbm(fluteAng * 9.5, 0.5, rLocal * 0.004, 2, seed + 31);
    var slickFlute01 = clamp(smooth(0.54, 0.78, fluteWave) * (1.0 - shellStep01 * 0.55) * (s.id === 'crown' ? 0.35 : 1.0), 0, 1);
    var slopeDeg = clamp(baseSlopeDeg + microSlope + shellStep01 * 16.5 + slickFlute01 * (s.id === 'apron' || s.id === 'moat' ? 11.5 : 3.5), 1.5, 58.0);

    /* Cantilevered hollow A-tent pop-up buckles (Station 1 apron & explicit site.aTents) */
    var hollowGapM = 0.0;
    var plateSpanM = 0.0;
    var plateThickM = def(s.shellThicknessM, 1.25);
    var tents = s.aTents || [];
    for (var i = 0; i < tents.length; i++) {
      var A = tents[i];
      var c = Math.cos(def(A.ry, 0)), sn = Math.sin(def(A.ry, 0));
      var lx = (x - A.x) * c + (z - A.z) * sn;
      var lz = -(x - A.x) * sn + (z - A.z) * c;
      var hw = def(A.spanM, 20.0) * 0.5;
      var hl = def(A.lengthM, 16.0) * 0.5;
      if (Math.abs(lx) < hw && Math.abs(lz) < hl) {
        var ux = 1.0 - Math.abs(lx) / hw;
        var uz = 1.0 - smooth(0.62, 1.0, Math.abs(lz) / hl);
        var gap = def(A.gapM, 1.85) * ux * uz;
        if (gap > hollowGapM) {
          hollowGapM = gap;
          plateSpanM = def(A.spanM, 20.0);
          plateThickM = def(A.thickM, 0.95);
        }
      }
    }

    return {
      domeRadiusKm: +domeRadiusKm.toFixed(3),
      slopeDeg: +slopeDeg.toFixed(2),
      shellStep01: +shellStep01.toFixed(4),
      riserHeightM: +riserHeightM.toFixed(3),
      hollowGapM: +hollowGapM.toFixed(3),
      plateSpanM: +plateSpanM.toFixed(2),
      plateThickM: +plateThickM.toFixed(2),
      slickFlute01: +slickFlute01.toFixed(4),
      shellIndex: Math.floor(phase)
    };
  }

  /* 2. Perched circular flat-floored solution-pan (gnamma) sky-mirrors & hydroperiod rings */
  function gnammaAt(x, z, hydroperiod01, site) {
    var hydro = clamp(def(hydroperiod01, 0.65), 0, 1);
    var s = site || {};
    var pans = s.gnammas || [];
    var best = null, bestU = 999;

    for (var i = 0; i < pans.length; i++) {
      var P = pans[i];
      var dx = x - P.x, dz = z - P.z;
      var r = P.r;
      if (Math.abs(dx) > r * 1.65 || Math.abs(dz) > r * 1.65) continue;
      var u = Math.hypot(dx, dz) / r;
      if (u < bestU) {
        bestU = u;
        best = P;
      }
    }

    if (!best || bestU > 1.55) {
      return {
        inPan: false,
        panId: null,
        panRadiusM: 0,
        depthM: 0,
        sillElevLocalM: null,
        waterLevelLocalM: null,
        waterDepthM: 0,
        rimGrit01: 0,
        desiccationRing01: 0,
        island01: 0
      };
    }

    var depthM = def(best.depth, 0.52);
    var sillY = best.sillY;
    var floorY = sillY - depthM;
    /* Water stands strictly below rock sill (>= +0.06 m freeboard even at Vernal-Brim hydro=1.0) so 0 floating water edges ever occur! */
    var maxFill = Math.max(0.08, depthM - 0.08);
    var fillFrac = smooth(0.08, 0.98, hydro);
    var waterY = floorY + maxFill * fillFrac;
    var hasIsland = !!best.islandR && best.islandR > 0.3;
    var uIsland = hasIsland ? Math.hypot(x - (best.x + def(best.islandDx, 0)), z - (best.z + def(best.islandDz, 0))) / best.islandR : 999;
    var island01 = hasIsland ? (1.0 - smooth(0.65, 1.05, uIsland)) : 0;

    var inBowl = bestU <= 1.0;
    var bedProfile = inBowl ? lerp(floorY, sillY + 0.08, smooth(0.76, 1.0, bestU)) : sillY + 0.08;
    if (island01 > 0) {
      bedProfile = lerp(bedProfile, sillY + 0.28, island01);
    }
    var wDepth = (inBowl && fillFrac > 0.02) ? Math.max(0, waterY - bedProfile) : 0;
    var rimGrit01 = clamp(smooth(0.72, 1.02, bestU) * (1.0 - smooth(1.08, 1.48, bestU)), 0, 1);
    var dryBand = clamp((1.0 - fillFrac) * smooth(0.25, 0.92, bestU) * (inBowl ? 1 : 0), 0, 1);
    var desiccationRing01 = clamp(Math.max(rimGrit01 * 0.85, dryBand), 0, 1);

    return {
      inPan: inBowl,
      panId: best.id || null,
      panRadiusM: +best.r.toFixed(2),
      depthM: +depthM.toFixed(3),
      sillElevLocalM: sillY == null ? null : +sillY.toFixed(3),
      waterLevelLocalM: sillY == null ? null : +waterY.toFixed(3),
      waterDepthM: +wDepth.toFixed(3),
      rimGrit01: +rimGrit01.toFixed(4),
      desiccationRing01: +desiccationRing01.toFixed(4),
      island01: +island01.toFixed(4)
    };
  }

  /* 3. Radial *Kluft* cleft barometric breathing & thermal stack exhalation */
  function barometricAt(x, z, site, hour24) {
    var s = site || {};
    var hr = def(hour24, 14.5);
    /* Slab-vs-cleft thermal contrast: slabs heat to +36 C in afternoon while 42 m deep Kluft stays at +14 C */
    var diurnalPhase = Math.cos(((hr - 14.5) / 24.0) * Math.PI * 2.0);
    var slabDeltaTC = 14.0 * diurnalPhase;
    var cleftDepthM = def(s.cleftDepthM, s.id === 'cleft' ? 42.0 : 0.0);
    if (!(cleftDepthM > 4.0)) {
      return {
        inCleftZone: false,
        deltaPa: 0,
        baroFlowMs: 0,
        exhaling: false,
        relHumidityPct: 58.0,
        aeolianChordHz: 0
      };
    }
    var cl = s.cleft || { x0: -260, z0: -18, x1: 260, z1: 18, halfW: 8.5 };
    var vx = cl.x1 - cl.x0, vz = cl.z1 - cl.z0, L2 = vx * vx + vz * vz;
    var t = L2 > 1e-6 ? clamp(((x - cl.x0) * vx + (z - cl.z0) * vz) / L2, 0, 1) : 0.5;
    var dist = Math.hypot(x - (cl.x0 + vx * t), z - (cl.z0 + vz * t));
    var proximity = 1.0 - smooth(cl.halfW * 0.6, cl.halfW * 4.2, dist);

    /* Hydrostatic stack pressure delta: dP = rho * g * H * |dT| / T */
    var pEnv = pressureAt(def(s.elevM, 2537.7));
    var dT = Math.abs(slabDeltaTC) + 2.6;
    var deltaPa = pEnv.rhoKgM3 * CONST.GRAVITY_MS2 * cleftDepthM * (dT / 287.15);
    var peakMs = clamp(0.85 + Math.sqrt((2.0 * deltaPa) / Math.max(0.8, pEnv.rhoKgM3)) * 0.46, 0.8, 4.2);
    var flowMs = peakMs * (0.28 + 0.72 * proximity);
    var exhaling = diurnalPhase >= -0.15;
    var cSound = 331.3 * Math.sqrt(1.0 + pEnv.tempMeanC / 273.15);
    /* Quarter/half-wave organ-pipe resonance of a 40-45 m open granite slot */
    var chordHz = (cSound / (2.0 * cleftDepthM)) * 2.0 * (1.0 + 0.5 * smooth(0, 20, dist));

    return {
      inCleftZone: dist <= cl.halfW * 3.0,
      cleftDistM: +dist.toFixed(2),
      deltaPa: +(deltaPa * (exhaling ? 1 : -1)).toFixed(2),
      baroFlowMs: +flowMs.toFixed(3),
      exhaling: exhaling,
      relHumidityPct: +(lerp(56.0, 98.5, proximity)).toFixed(1),
      aeolianChordHz: +clamp(chordHz, 145.0, 265.0).toFixed(1)
    };
  }

  /* 4. "The Singing Shell": flexural A-tent lithophone pitch (62-148 Hz), concave ring-dike whispering gallery & cleft chords */
  function acousticsAt(x, z, site, hour24) {
    var sh = shellAt(x, z, site);
    var baro = barometricAt(x, z, site, hour24);
    var s = site || {};

    /* Flexural circular/rectangular plate fundamental f0 ~ k * (h / L^2) * sqrt(E / (12 * rho * (1 - nu^2)))
       Strictly active ONLY over detached hollow exfoliation shells (hollowGapM >= 0.15 m); solid bedrock returns hollowBoom01 === 0! */
    var lithophoneHz = 0.0;
    var hollowBoom01 = 0.0;
    if (sh.hollowGapM >= 0.15 && sh.plateSpanM > 4.0) {
      var cPlate = Math.sqrt(CONST.YOUNGS_PORPHYRY_PA / (12.0 * CONST.DENSITY_PORPHYRY_KGM3 * (1.0 - CONST.POISSON_NU * CONST.POISSON_NU)));
      /* Effective clamped-cantilever A-tent arch stiffness yields 65-140 Hz fundamental bass gong resonance */
      var rawHz = 18.4 * (sh.plateThickM / (sh.plateSpanM * sh.plateSpanM)) * cPlate * (1.0 + 0.12 * Math.min(1.5, sh.hollowGapM));
      lithophoneHz = clamp(rawHz, 62.0, 148.0);
      hollowBoom01 = clamp(smooth(0.15, 0.85, sh.hollowGapM), 0.05, 1.0);
    }

    /* Parabolic / arcuate ring-dike scarp whispering-gallery focus (+12 to +22 dB on Station 2 moat concave inner wall) */
    var whisperFocusDb = 0.0;
    if (s.whisperArc) {
      var W = s.whisperArc;
      var dCenter = Math.hypot(x - W.cx, z - W.cz);
      var wallBand = 1.0 - smooth(6.0, 68.0, Math.abs(dCenter - W.radiusM));
      var focusSpot = 1.0 - smooth(8.0, 52.0, dCenter);
      whisperFocusDb = clamp(12.0 * wallBand + 21.5 * focusSpot, 0, 22.0);
    } else if (sh.shellStep01 > 0.65) {
      whisperFocusDb = +(3.5 * sh.shellStep01).toFixed(2);
    }

    return {
      lithophoneHz: +lithophoneHz.toFixed(2),
      hollowBoom01: +hollowBoom01.toFixed(4),
      hollowGapM: sh.hollowGapM,
      whisperFocusDb: +whisperFocusDb.toFixed(2),
      aeolianChordHz: baro.aeolianChordHz,
      baroFlowMs: baro.baroFlowMs
    };
  }

  /* Tree-rooting eligibility rule (PLAN.md section 8 #2): full-stature trees (height > 4 m) NEVER root on unfractured bare aprons */
  function canRootFullTree(x, z, hydroperiod01, site) {
    var s = site || {};
    if (s.id === 'moat' && z < def(s.apronToeZ, 38)) {
      /* Ring-moat collar bench / fen margin outside bare inner dome apron */
      var gM = gnammaAt(x, z, hydroperiod01, s);
      return !(gM.inPan && gM.waterDepthM > 0.15);
    }
    var sh = shellAt(x, z, site);
    var gn = gnammaAt(x, z, hydroperiod01, site);
    if (sh.hollowGapM > 0.05) return false;
    if (gn.inPan && gn.island01 < 0.5) return false;
    /* Full-stature trees (> 4 m, e.g. cloudgarlandpine) require deep exfoliation riser trenches (shellStep01 >= 0.55; garlands >= 0.70) */
    return sh.shellStep01 >= 0.55;
  }

  return {
    CONST: CONST,
    pressureAt: pressureAt,
    inDomeFootprint: inDomeFootprint,
    shellAt: shellAt,
    exfoliationAt: shellAt,
    gnammaAt: gnammaAt,
    barometricAt: barometricAt,
    acousticsAt: acousticsAt,
    canRootFullTree: canRootFullTree
  };
})();

if (typeof window !== 'undefined') window.DOME_PHYS = DOME_PHYS;
if (typeof module !== 'undefined' && module.exports) module.exports = DOME_PHYS;
