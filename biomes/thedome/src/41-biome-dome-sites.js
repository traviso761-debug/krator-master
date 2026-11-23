/* ================================================================= THE DOME — verified Scale-Model 5.1 stations & KSTRATA ([G data])
   Defines all 4 sibling-exclusive own_dm stations inside rmweubdnyts8y (PLAN.md section 3):
     1. apron (1336, 128) +2,268.5 m, 1.20 atm, Cfa — Onion-Skin Bald-Rock Apron, 128 Gnamma Sky-Mirrors & 3 A-Tent Lithophones
     2. moat  (1317, 117) +1,749.1 m, 1.29 atm, Cfa — Concentric Ring-Dike Hogback, Seepage Pitcher-Fen & Whispering Scarp
     3. crown (1328, 150) +2,924.8 m, 1.11 atm, Cfb — Lenticular Cloud-Cap Apex, Concentric Treeline Garlands & Observatory Plinth
     4. cleft (1372, 148) +2,537.7 m, 1.17 atm, Cfa — 40 m Radial Unloading Kluft Fissure, KSPELEO.SMOKY Quartz Vault & Wind-Organ
   Also registers the custom 'laccolith-shell' KSTRATA column when KSTRATA is present.
   Zero THREE, zero DOM.
*/
var DOME_SITES = (function () {
  'use strict';

  function needRand() {
    var R = typeof KRAND !== 'undefined' ? KRAND : (typeof globalThis !== 'undefined' ? globalThis.KRAND : null);
    if (!R) throw new Error('DOME_SITES requires core/rand (KRAND) loaded first');
    return R;
  }

  /* Register custom surface-parallel quartz-porphyry & leucogranite exfoliation column onto KSTRATA */
  function registerStrata() {
    var KS = typeof KSTRATA !== 'undefined' ? KSTRATA : (typeof globalThis !== 'undefined' ? globalThis.KSTRATA : null);
    if (!KS || typeof KS.add !== 'function') return false;
    if (!KS.RECIPES || !KS.RECIPES['laccolith-shell']) {
      KS.add({
        name: 'laccolith-shell',
        main: 'porphyry',
        noRepeat: false,
        kinds: {
          porphyry:  { p: 0.48, th: [1.1, 2.8], col: [0xc4a89e, 0xbba096, 0xccb2a8, 0xb5988e], hard: 0.90, xbed: 0.0, varnish: 0.35 },
          leuco:     { p: 0.30, th: [0.8, 2.2], col: [0xdad4ce, 0xe2dcd6, 0xcfc8c2], hard: 0.86, xbed: 0.0, varnish: 0.25 },
          aplite:    { p: 0.12, th: [0.15, 0.45], col: [0xede9e2, 0xf2eee8], hard: 0.94, xbed: 0.0, varnish: 0.12, between: true },
          parting:   { p: 0.10, th: [0.12, 0.38], col: [0x7e6d68, 0x6e5f5a], hard: 0.28, xbed: 0.0, varnish: 0.55, between: true }
        },
        fx: { varnish: 0.35 }
      });
    }
    if (!KS.RECIPES || !KS.RECIPES['ring-dike-collar']) {
      KS.add({
        name: 'ring-dike-collar',
        main: 'redporph',
        kinds: {
          redporph:  { p: 0.44, th: [2.0, 6.5], col: [0x8c484c, 0x9a5256, 0x7c3e42], hard: 0.92, xbed: 0.0, varnish: 0.55 },
          arkose:    { p: 0.32, th: [1.2, 4.0], col: [0xb88e74, 0xc49a80, 0xa87e66], hard: 0.68, xbed: 0.45, varnish: 0.40 },
          carbonate: { p: 0.24, th: [1.0, 3.5], col: [0xd2ccc0, 0xdcd6ca, 0xc4beb2], hard: 0.74, xbed: 0.1, varnish: 0.28 }
        },
        fx: { xbed: 0.35, varnish: 0.45 }
      });
    }
    return true;
  }

  /* Deterministic non-overlapping gnamma solution-pan generator for bare exfoliation benches */
  function makeGnammas(seed, targetCount, spanR, excludeFn, heroList) {
    var R = needRand();
    var out = [];
    var i, k;
    if (heroList) {
      for (i = 0; i < heroList.length; i++) out.push(Object.assign({}, heroList[i]));
    }
    var cell = 38.0;
    var nHalf = Math.ceil(spanR / cell);
    for (var cz = -nHalf; cz <= nHalf && out.length < targetCount; cz++) {
      for (var cx = -nHalf; cx <= nHalf && out.length < targetCount; cx++) {
        var h = R.hash(seed >>> 0, cx, cz, 0x4711);
        if (R.unit(h) > 0.58) continue;
        var px = (cx + 0.18 + 0.64 * R.unit(R.hash(h, 1, 0, 1))) * cell;
        var pz = (cz + 0.18 + 0.64 * R.unit(R.hash(h, 2, 0, 2))) * cell;
        if (Math.hypot(px, pz) > spanR) continue;
        var pr = 1.65 + 5.25 * Math.pow(R.unit(R.hash(h, 3, 0, 3)), 1.45);
        if (excludeFn && excludeFn(px, pz, pr)) continue;
        var clash = false;
        for (k = 0; k < out.length; k++) {
          if (Math.hypot(px - out[k].x, pz - out[k].z) < (pr + out[k].r) * 1.42 + 4.5) {
            clash = true;
            break;
          }
        }
        if (clash) continue;
        var depth = 0.36 + 0.34 * R.unit(R.hash(h, 4, 0, 4));
        var hasIsl = pr >= 4.6 && R.unit(R.hash(h, 5, 0, 5)) < 0.34;
        out.push({
          id: 'gnamma-' + out.length,
          x: +px.toFixed(2),
          z: +pz.toFixed(2),
          r: +pr.toFixed(2),
          depth: +depth.toFixed(3),
          islandR: hasIsl ? +(pr * (0.24 + 0.12 * R.unit(R.hash(h, 6, 0, 6)))).toFixed(2) : 0,
          islandDx: hasIsl ? +((R.unit(R.hash(h, 7, 0, 7)) - 0.5) * pr * 0.22).toFixed(2) : 0,
          islandDz: hasIsl ? +((R.unit(R.hash(h, 8, 0, 8)) - 0.5) * pr * 0.22).toFixed(2) : 0,
          sillY: null
        });
      }
    }
    return out;
  }

  registerStrata();

  var APRON_TENTS = [
    { id: 'atent-hero', x: -18.0, z: 26.0, spanM: 22.0, lengthM: 17.5, gapM: 2.15, thickM: 0.92, ry: 0.16 },
    { id: 'atent-east', x: 66.0,  z: -48.0, spanM: 19.5, lengthM: 15.0, gapM: 1.75, thickM: 0.98, ry: -0.24 },
    { id: 'atent-west', x: -94.0, z: -62.0, spanM: 24.5, lengthM: 18.0, gapM: 1.95, thickM: 1.04, ry: 0.30 }
  ];

  var APRON_HERO_PANS = [
    { id: 'gnamma-hero-mirror', x: -34.0, z: -22.0, r: 7.4, depth: 0.58, islandR: 0, islandDx: 0, islandDz: 0, sillY: null },
    { id: 'gnamma-hero-bonsai', x: 20.0,  z: -14.0, r: 8.2, depth: 0.64, islandR: 2.15, islandDx: 0.3, islandDz: -0.2, sillY: null },
    { id: 'gnamma-terrace-a',   x: -56.0, z: -6.0,  r: 5.8, depth: 0.50, islandR: 1.45, islandDx: -0.2, islandDz: 0.2, sillY: null },
    { id: 'gnamma-terrace-b',   x: 4.0,   z: -42.0, r: 6.4, depth: 0.54, islandR: 0, islandDx: 0, islandDz: 0, sillY: null },
    { id: 'gnamma-terrace-c',   x: 48.0,  z: 12.0,  r: 6.1, depth: 0.52, islandR: 1.55, islandDx: 0.1, islandDz: 0.1, sillY: null },
    { id: 'gnamma-terrace-d',   x: -12.0, z: -68.0, r: 5.5, depth: 0.48, islandR: 0, islandDx: 0, islandDz: 0, sillY: null }
  ];

  var APRON_GNAMMAS = makeGnammas(6110, 128, 520, function (x, z, r) {
    /* Keep clear of A-tent lithophone arches, acoustic listening dish (28, 48), and primary radial rills */
    if (Math.hypot(x - 28, z - 48) < r + 16) return true;
    if (Math.abs(x + 68) < r + 9) return true;
    for (var i = 0; i < APRON_TENTS.length; i++) {
      var A = APRON_TENTS[i];
      if (Math.hypot(x - A.x, z - A.z) < r + A.spanM * 0.72 + 5) return true;
    }
    /* Avoid steep shell step risers on apron so pans sit cleanly on < 16 deg benches */
    var centerLocal = [-180, 920];
    var rLoc = Math.hypot(x - centerLocal[0], z - centerLocal[1]);
    var frac = (rLoc / 54.0) - Math.floor(rLoc / 54.0);
    if (Math.min(frac, 1.0 - frac) * 54.0 < r + 6.5) return true;
    return false;
  }, APRON_HERO_PANS);

  var CROWN_HERO_PANS = [
    { id: 'crown-mirror-n', x: 18.0,  z: -64.0, r: 6.2, depth: 0.52, islandR: 0, islandDx: 0, islandDz: 0, sillY: null },
    { id: 'crown-mirror-w', x: -66.0, z: -14.0, r: 6.8, depth: 0.56, islandR: 0, islandDx: 0, islandDz: 0, sillY: null },
    { id: 'crown-mirror-e', x: 68.0,  z: 18.0,  r: 5.8, depth: 0.48, islandR: 0, islandDx: 0, islandDz: 0, sillY: null },
    { id: 'crown-mirror-s', x: -22.0, z: 68.0,  r: 6.0, depth: 0.50, islandR: 0, islandDx: 0, islandDz: 0, sillY: null }
  ];

  var CROWN_GNAMMAS = makeGnammas(6310, 38, 340, function (x, z, r) {
    var d0 = Math.hypot(x, z);
    /* Keep summit observatory plinth (r < 42 m) and concentric garland step-risers (multiples of 46 m) clear! */
    if (d0 < 42 + r) return true;
    var frac = (d0 / 46.0) - Math.floor(d0 / 46.0);
    if (Math.min(frac, 1.0 - frac) * 46.0 < r + 6.2) return true;
    return false;
  }, CROWN_HERO_PANS);

  var SITES = {
    apron: {
      id: 'apron',
      out: 'thedome.html',
      name: 'Onion-Skin Exfoliation Apron & Gnamma Sky-Mirror Gardens',
      region: 'The Dome, North Flank',
      px: [1336, 128],
      skyOffset: [1064, -202],
      domeApexPx: [1328, 150],
      inDomeVerified: true,
      ownDmVerified: true,
      elevM: 2268.5,
      baseElevM: 2268.5,
      pAtm: 1.20,
      koppen: 'Cfa',
      rainMmYr: 1255,
      tempMeanC: 16.0,
      wind: [2.8, -3.6],
      seed: 6101,
      strataStack: 'laccolith-shell',
      strataRange: [-90, 260],
      domeCenterLocal: [-180, 920],
      shellSpacingM: 54.0,
      riserBandM: 5.2,
      riserHeightM: 2.25,
      shellThicknessM: 1.05,
      baseSlopeDeg: 11.5,
      kin: ['swlowlands'],
      modes: ['Vernal-Brim', 'Sun-Baked Dry', 'Crown-Mist'],
      aTents: APRON_TENTS,
      gnammas: APRON_GNAMMAS,
      reserves: [],
      geology: { stone: 182, iron: 40, clay: 24, limestone: 0, zinc: 0 }
    },

    moat: {
      id: 'moat',
      out: 'thedome-moat.html',
      name: 'Concentric Ring-Dike Hogback & Annular Seepage Fen',
      region: 'The Dome, NW Collar Moat',
      px: [1317, 117],
      skyOffset: [1045, -213],
      domeApexPx: [1328, 150],
      inDomeVerified: true,
      ownDmVerified: true,
      elevM: 1749.1,
      baseElevM: 1749.1,
      pAtm: 1.29,
      koppen: 'Cfa',
      rainMmYr: 1098,
      tempMeanC: 19.0,
      wind: [2.4, -2.8],
      seed: 6201,
      strataStack: 'laccolith-shell',
      lateralStrata: 'ring-dike-collar',
      strataRange: [-60, 240],
      domeCenterLocal: [210, 980],
      apronToeZ: 42.0,
      shellSpacingM: 58.0,
      riserBandM: 5.0,
      riserHeightM: 1.95,
      shellThicknessM: 1.35,
      baseSlopeDeg: 13.8,
      whisperArc: { cx: 0.0, cz: -18.0, radiusM: 112.0 },
      fenLevelLocal: 0.0,
      fenPools: [
        { id: 'moat-fen-main',   cx: -18.0, cz: -18.0, rx: 92.0, rz: 36.0, level: 0.0 },
        { id: 'moat-fen-east',   cx: 82.0,  cz: -26.0, rx: 46.0, rz: 24.0, level: 0.0 },
        { id: 'moat-fen-west',   cx: -124.0, cz: -8.0, rx: 44.0, rz: 22.0, level: 0.0 }
      ],
      kin: ['swlowlands'],
      modes: ['Vernal-Brim', 'Sun-Baked Dry', 'Crown-Mist'],
      aTents: [],
      gnammas: [],
      reserves: [
        { id: 'site:moat-waystation', name: 'Upper Ria Moat Pilgrimage Waystation Reserve', x: 158.0, z: -42.0, r: 92.0 }
      ],
      geology: { stone: 202, clay: 48, iron: 36, limestone: 255, zinc: 90 }
    },

    crown: {
      id: 'crown',
      out: 'thedome-crown.html',
      name: 'Lenticular Cloud-Cap Crown & Concentric Treeline Garlands',
      region: 'The Dome, +2,924.8 m True Apex',
      px: [1328, 150],
      skyOffset: [1056, -180],
      domeApexPx: [1328, 150],
      inDomeVerified: true,
      ownDmVerified: true,
      elevM: 2924.8,
      baseElevM: 2924.8,
      pAtm: 1.11,
      koppen: 'Cfb',
      rainMmYr: 1255,
      tempMeanC: 11.0,
      wind: [3.8, -2.2],
      seed: 6301,
      strataStack: 'laccolith-shell',
      strataRange: [-180, 120],
      domeCenterLocal: [0.0, 0.0],
      shellSpacingM: 46.0,
      riserBandM: 5.6,
      riserHeightM: 2.05,
      shellThicknessM: 1.25,
      baseSlopeDeg: 7.5,
      hasCrownVeil: true,
      kin: ['swlowlands'],
      modes: ['Crown-Mist', 'Vernal-Brim', 'Sun-Baked Dry'],
      aTents: [],
      gnammas: CROWN_GNAMMAS,
      reserves: [
        { id: 'site:dome-observatory', name: 'Upper Ria Barometric & Acoustic Sanctuary Plinth', x: 0.0, z: 0.0, r: 38.0 }
      ],
      geology: { stone: 60, clay: 33, iron: 12, limestone: 0, zinc: 0 }
    },

    cleft: {
      id: 'cleft',
      out: 'thedome-cleft.html',
      name: 'Radial Unloading Kluft Fissure & Smoky-Quartz Vault',
      region: 'The Dome, High East Shoulder',
      px: [1372, 148],
      skyOffset: [1100, -182],
      domeApexPx: [1328, 150],
      inDomeVerified: true,
      ownDmVerified: true,
      elevM: 2537.7,
      baseElevM: 2537.7,
      pAtm: 1.17,
      koppen: 'Cfa',
      rainMmYr: 1004,
      tempMeanC: 14.0,
      wind: [3.4, -1.6],
      seed: 6401,
      strataStack: 'laccolith-shell',
      strataRange: [-110, 180],
      domeCenterLocal: [-940, 60],
      shellSpacingM: 52.0,
      riserBandM: 5.0,
      riserHeightM: 2.10,
      shellThicknessM: 2.85,
      baseSlopeDeg: 10.5,
      cleftDepthM: 40.0,
      cleft: {
        x0: -250.0, z0: -6.0,
        x1: 250.0,  z1: 6.0,
        halfW: 9.5,
        depthM: 40.0,
        rampX0: -128.0,
        rampX1: -18.0,
        bridgeX: 54.0,
        bridgeY: -13.5,
        pocketCenter: [14.0, -32.5, -10.5]
      },
      kin: ['swlowlands'],
      modes: ['Vernal-Brim', 'Sun-Baked Dry', 'Crown-Mist'],
      aTents: [],
      gnammas: [],
      reserves: [],
      geology: { stone: 214, iron: 40, copper: 10, clay: 28, smokyQuartz: 1 }
    }
  };

  SITES.registerStrata = registerStrata;
  return SITES;
})();

if (typeof window !== 'undefined') window.DOME_SITES = DOME_SITES;
if (typeof module !== 'undefined' && module.exports) module.exports = DOME_SITES;
