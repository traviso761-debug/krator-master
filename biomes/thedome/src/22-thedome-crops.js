/* ================================================================= THE DOME — crops registration (CROPS.BIOMES.thedome; [G data])
   Registers CROPS.BIOMES.thedome onto kits/crops (read in place: 10-crop-core, 20-crop-records, 40-crop-query).
   1.11-1.31 atm standard upland air (atm: 1) across 4 concentric elevation/edaphic zones:
     ringmoat  (+1,442..+1,900 m annular seepage fens & spring-fed collar benches, wet: true)
     gnammapan (+1,900..+2,550 m perched seasonal solution-pan micro-gardens, wet: true)
     garland   (+2,200..+2,780 m fog-drip exfoliation step-riser trenches)
     crown     (+2,780..+2,925 m Cfb lenticular cap-cloud summit benches)
   Yields 65 open-air fits + 2 damp radial-Kluft dark-bed fungi (pale-fungi, alecap) = 67 verified crops.
*/
var DOME_CROPS = (function () {
  'use strict';

  var SPEC = {
    atm: 1,
    zones: {
      ringmoat:  { warmth: [2, 3], arid: [2, 3], wet: true },
      gnammapan: { warmth: [2, 2], arid: [1, 2], wet: true },
      garland:   { warmth: [2, 2], arid: [2, 3] },
      crown:     { warmth: [1, 2], arid: [2, 3] }
    }
  };

  function register(C) {
    var target = C || (typeof CROPS !== 'undefined' ? CROPS : (typeof globalThis !== 'undefined' ? globalThis.CROPS : null));
    if (target && target.BIOMES) {
      target.BIOMES.thedome = SPEC;
    }
    return SPEC;
  }

  function paletteForDome(opts) {
    var C = typeof CROPS !== 'undefined' ? CROPS : (typeof globalThis !== 'undefined' ? globalThis.CROPS : null);
    if (!C || typeof C.forBiome !== 'function') return [];
    register(C);
    var o = Object.assign({ works: ['dark-beds'] }, opts || {});
    return C.forBiome('thedome', o);
  }

  register(null);

  var api = {
    SPEC: SPEC,
    register: register,
    forDome: paletteForDome
  };
  if (typeof DOME_PHYS !== 'undefined') DOME_PHYS.CROPS = api;
  return api;
})();

if (typeof window !== 'undefined') window.DOME_CROPS = DOME_CROPS;
if (typeof module !== 'undefined' && module.exports) module.exports = DOME_CROPS;
