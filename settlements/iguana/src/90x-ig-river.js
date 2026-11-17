/* ==================== Iguana 90x: Muckle Weyt Beck (r202) on core/water WATER.flow ([draw]) ==================== */
/* settlements/iguana/PLAN.md section 1: Muckle Weyt Beck (r202, perennial, 22 m3/s) crosses the NW corner of Iguana's
   10 x 10 km near grid 5.4 km from the pin. Draws its channel ribbon on WATER.flow + WATER.drawFlow. */
(function () {
  if (typeof WATER === 'undefined' || !WATER.flow || !WATER.drawFlow || !LZV_SPEC.beckPts) return;
  var G = LZV_SITE, pts = [], prevY = 1e9, i, p, y;
  for (i = 0; i < LZV_SPEC.beckPts.length; i++) {
    p = LZV_SPEC.beckPts[i];
    y = Math.min(prevY - 0.05, G.groundH(p[0], p[1]) + 1.05);
    prevY = y;
    pts.push([p[0], p[1], +y.toFixed(3)]);
  }
  try {
    var fl = WATER.flow({ name: 'Muckle Weyt Beck (r202, 22 m3/s)', pts: pts, width: 15, speed: 1.35 });
    var dr = WATER.drawFlow(fl, {
      pick: true, step: 8, across: 6, margin: 1.5, renderOrder: 1,
      shallow: 0x4c6e5c, deep: 0x22423a, roughness: 0.08, metalness: 0.08, envMapIntensity: 0.45
    });
    if (dr && dr.mesh) dr.mesh.userData.inspectLabel = 'Muckle Weyt Beck (r202, perennial, 22.0 m3/s)';
    if (window._lzvWater) window._lzvWater.flows = 1;
  } catch (e) {
    reportErr('iguana beck: ' + (e && e.stack ? e.stack : e));
  }
})();
