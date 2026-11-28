// ================================================================= FLOATING CITY — Stage 5 M2 Specular Roughness AA & M4 AO [G data]
const FC_MIPVAR = (function () {
  'use strict';
  const CURVES = {
    ancient_ceramic:  [0.000, 0.003, 0.009, 0.018, 0.032, 0.050, 0.072],
    ancient_concrete: [0.000, 0.006, 0.016, 0.030, 0.048, 0.070, 0.095],
    celadon_roof:     [0.000, 0.004, 0.012, 0.025, 0.044, 0.068, 0.098],
    gilt_chofa:       [0.000, 0.005, 0.015, 0.032, 0.056, 0.088, 0.125],
    cobalt_glaze:     [0.000, 0.004, 0.011, 0.024, 0.042, 0.065, 0.092],
    travertine_stone: [0.000, 0.005, 0.014, 0.028, 0.046, 0.068, 0.094],
    paktong_metal:    [0.000, 0.005, 0.014, 0.030, 0.052, 0.080, 0.112],
    cypress_hull:     [0.000, 0.006, 0.015, 0.029, 0.047, 0.069, 0.095],
    celadon:          [0.000, 0.004, 0.012, 0.025, 0.044, 0.068, 0.098],
    emerald:          [0.000, 0.004, 0.012, 0.025, 0.044, 0.068, 0.098],
    cobalt:           [0.000, 0.004, 0.011, 0.024, 0.042, 0.065, 0.092],
    giltroof:         [0.000, 0.005, 0.015, 0.032, 0.056, 0.088, 0.125],
    brass:            [0.000, 0.005, 0.015, 0.032, 0.056, 0.088, 0.125],
    copper:           [0.000, 0.005, 0.014, 0.030, 0.052, 0.080, 0.112],
    travertine:       [0.000, 0.005, 0.014, 0.028, 0.046, 0.068, 0.094]
  };

  function forFamily(slot) {
    return CURVES[slot] || null;
  }

  function roughAtMip(baseRough, slot, mip) {
    const c = CURVES[slot];
    if (!c) return baseRough;
    const idx = Math.max(0, Math.min(c.length - 1, mip | 0));
    return Math.min(1.0, Math.sqrt(baseRough * baseRough + c[idx]));
  }

  function plotBaseAO(hAboveDeckM) {
    const t = Math.max(0, Math.min(1, hAboveDeckM / 2.6));
    const s = t * t * (3 - 2 * t);
    return 0.68 + 0.32 * s;
  }

  return { CURVES: CURVES, forFamily: forFamily, roughAtMip: roughAtMip, plotBaseAO: plotBaseAO };
})();
