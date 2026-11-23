/* ==================== Komodo 90x: Kruk Warra (r088) on core/water WATER.flow ([draw]) ==================== */
/* settlements/komodo/PLAN.md section 1: Kruk Warra (r088, perennial, 51.3 m3/s) flows north across the eastern end of Komodo's
   near grid 11.9 km east of the pin, past the tin and gold placer washing floors into the eastern terminal sea. */
(function () {
  if (typeof WATER === 'undefined' || !WATER.flow || !WATER.drawFlow || !LZV_SPEC.krukPts) return;
  var G = LZV_SITE, pts = [], prevY = 1e9, i, p, y;
  for (i = 0; i < LZV_SPEC.krukPts.length; i++) {
    p = LZV_SPEC.krukPts[i];
    y = Math.max(G.lakeY + 0.04, Math.min(prevY - 0.04, G.groundH(p[0], p[1]) + 1.15));
    prevY = y;
    pts.push([p[0], p[1], +y.toFixed(3)]);
  }
  try {
    var fl = WATER.flow({ name: 'Kruk Warra (r088, 51.3 m3/s)', pts: pts, width: 30, speed: 1.55 });
    var dr = WATER.drawFlow(fl, {
      pick: true, step: 12, across: 8, margin: 2.0, renderOrder: 1,
      shallow: 0x4e6e60, deep: 0x1e3f38, roughness: 0.08, metalness: 0.08, envMapIntensity: 0.45
    });
    if (dr && dr.mesh) dr.mesh.userData.inspectLabel = 'Kruk Warra (r088, perennial, 51.3 m3/s)';
    if (window._lzvWater) window._lzvWater.flows = 1;
  } catch (e) {
    reportErr('komodo kruk warra: ' + (e && e.stack ? e.stack : e));
  }
})();
