// ================================================================= BATTERED PORT — Stage 5 M2 normal mipVariance & M4 plot-base AO parameters [G data]
// Precomputed normal-map mip-variance ladders [mip1, mip2, mip3, mip4+] for KMAT_M1.patch / KMAT_M1.roughAtMip
// on glazed celadon & slate roofs, wet oxidized scoria & columnar basalt plinths, yellow-tan palagonite tuff,
// and forged nickel-steel cliff-hoist chains (GRAPHICS-TERRAIN-PROPOSAL.md Stage 5 M1/M2/M4).
// Pure data + deterministic function: zero THREE, zero DOM, zero Math.random.
const BP_MIPVAR = (function(){
 const BY_FAMILY = {
  plinth_scoria:  [0.0110, 0.0285, 0.0550, 0.0890],
  plinth_basalt:  [0.0085, 0.0220, 0.0440, 0.0720],
  mortar_tuff:    [0.0072, 0.0185, 0.0365, 0.0600],
  wall_lime:      [0.0042, 0.0110, 0.0215, 0.0360],
  roof_grey:      [0.0095, 0.0245, 0.0480, 0.0780],
  roof_celadon:   [0.0068, 0.0195, 0.0410, 0.0680],
  metal_cuproni:  [0.0055, 0.0148, 0.0295, 0.0500],
  metal_nickel:   [0.0062, 0.0170, 0.0345, 0.0580],
  wood_drift:     [0.0076, 0.0192, 0.0380, 0.0620],
  ground_scoria:  [0.0102, 0.0260, 0.0505, 0.0815],
  ground_cobble:  [0.0092, 0.0235, 0.0455, 0.0740],
  strata_coal:    [0.0065, 0.0172, 0.0340, 0.0565],
  /* Eternian kit MAT family keys dressed with M2 km1RoughAA */
  celadon:        [0.0068, 0.0195, 0.0410, 0.0680],
  glaze:          [0.0064, 0.0185, 0.0390, 0.0650],
  tile:           [0.0095, 0.0245, 0.0480, 0.0780],
  stone:          [0.0085, 0.0220, 0.0440, 0.0720],
  iron:           [0.0062, 0.0170, 0.0345, 0.0580],
  gunmetal:       [0.0058, 0.0160, 0.0325, 0.0550],
  bronze:         [0.0055, 0.0148, 0.0295, 0.0500],
  verdigris:      [0.0055, 0.0148, 0.0295, 0.0500]
 };

 /* Stage 5 M4: Analytic plot-base contact AO (0.72 at footing y <= 0 rising smoothly to 1.00 above reachM) */
 function plotBaseAO(localY, reachM){
  const r = reachM == null ? 1.85 : reachM;
  if (!(r > 0)) return 1.0;
  let t = localY / r;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const s = t * t * (3 - 2 * t);
  return 0.72 + 0.28 * s;
 }

 function forFamily(fam){
  return BY_FAMILY[fam] || null;
 }

 return {
  BY_FAMILY: BY_FAMILY,
  forFamily: forFamily,
  plotBaseAO: plotBaseAO
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BP_MIPVAR;
