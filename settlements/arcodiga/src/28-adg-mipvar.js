// ================================================================= ARCODIGA — Stage 5 KMAT_M1 mip-variance & M4 plot-base AO [G data]
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_MIPVAR = (function(){
 const BY_FAMILY = {
  plinth_columnar: [0.004, 0.012, 0.028, 0.052, 0.088, 0.135, 0.185, 0.230],
  plinth_basalt:   [0.005, 0.014, 0.032, 0.058, 0.095, 0.145, 0.195, 0.240],
  nephrite_sawn:   [0.001, 0.003, 0.007, 0.014, 0.026, 0.042, 0.062, 0.085],
  bronze_lintel:   [0.002, 0.006, 0.015, 0.030, 0.052, 0.082, 0.118, 0.155],
  iron_girder:     [0.003, 0.008, 0.019, 0.038, 0.066, 0.102, 0.142, 0.182],
  cypress_timber:  [0.004, 0.010, 0.024, 0.046, 0.078, 0.120, 0.165, 0.210],
  cobble_plaza:    [0.005, 0.015, 0.034, 0.062, 0.104, 0.156, 0.208, 0.252],
  whalebone_bleached: [0.002, 0.006, 0.014, 0.028, 0.048, 0.076, 0.108, 0.140],
  celadon:         [0.001, 0.003, 0.008, 0.016, 0.030, 0.048, 0.070, 0.095],
  bronze:          [0.002, 0.006, 0.015, 0.030, 0.052, 0.082, 0.118, 0.155],
  stone:           [0.004, 0.012, 0.028, 0.052, 0.088, 0.135, 0.185, 0.230]
 };

 function forFamily(fam){
  return BY_FAMILY[fam] || BY_FAMILY.plinth_basalt;
 }

 function plotBaseAO(localY, spanM){
  const sp = spanM == null ? 1.8 : spanM;
  if (localY <= 0) return 0.72;
  if (localY >= sp) return 1.0;
  const t = localY / sp;
  const s = t * t * (3 - 2 * t);
  return 0.72 + 0.28 * s;
 }

 return {
  BY_FAMILY: BY_FAMILY,
  forFamily: forFamily,
  plotBaseAO: plotBaseAO
 };
})();
