/* ==================== Gila 99-m: host camera range, inspector enrichment, and verify probe ([web]) ==================== */
/* Sorts after 99-host-take.js and before 99-tail.html: widens KHOST's orbit radius so Gila's 9 km spit and 3.8 km reliquary
   can be framed without clamping, enriches click-to-inspect for terrain/water/plinths, and exposes window._gila + _api.gila(). */
(function () {
  if (typeof KHOST !== 'undefined' && KHOST.cam && KHOST.cam.ctl) {
    KHOST.cam.ctl.maxR = 24000;
  }
  /* Re-apply the initial view now that maxR is widened */
  if (typeof VIEWS !== 'undefined' && VIEWS['Overview']) {
    setView.apply(null, VIEWS['Overview']);
  }

  /* Enrich SV_TAKE.inspect so clicking terrain, salt lake, wells or plinths gives a clear label */
  if (typeof SV_TAKE !== 'undefined' && SV_TAKE.inspect) {
    var baseDescribe = SV_TAKE.inspect;
    SV_TAKE.inspect = function (first, hits) {
      var res = baseDescribe(first, hits);
      if (res && res.indexOf('unregistered mesh') < 0 && res !== '(nothing)') return res;
      var h = (hits || []).find(function (q) { return q.object && q.object.userData && q.object.userData.inspectLabel; });
      if (h) {
        var p = h.point;
        return h.object.userData.inspectLabel + '\n' + p.x.toFixed(1) + ', ' + p.y.toFixed(1) + ', ' + p.z.toFixed(1);
      }
      if (res && res.indexOf('unregistered mesh') === 0 && hits && hits.length) {
        var pt = hits[0].point;
        return 'Hillside footing plinth (lizardmen · infrastructure)\n' + pt.x.toFixed(1) + ', ' + pt.y.toFixed(1) + ', ' + pt.z.toFixed(1);
      }
      return res;
    };
  }

  /* Measure actual ground seating & ley-line aim on the built REG records for verify.py */
  function auditGround() {
    var G = GL_SITE, floating = [], buried = [], i, pl, c, s, k, pts, px, pz, gy;
    pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (i = 0; i < G.plinths.length; i++) {
      pl = G.plinths[i];
      c = Math.cos(pl.ry); s = Math.sin(pl.ry);
      for (k = 0; k < 4; k++) {
        px = pl.x + pts[k][0] * pl.w / 2 * c + pts[k][1] * pl.d / 2 * s;
        pz = pl.z - pts[k][0] * pl.w / 2 * s + pts[k][1] * pl.d / 2 * c;
        gy = KDRAWN.h(px, pz);
        if (gy === null) continue;
        if (pl.y0 > gy + 0.05) floating.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z));
        if (pl.y1 < gy - 0.08) buried.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z));
      }
    }
    return { checked: G.plinths.length, floating: floating, buried: buried };
  }

  function auditLey() {
    var leyRec = REG.find(function (r) { return r.key === 'lz-ley'; });
    var relRec = REG.find(function (r) { return r.key === 'lz-reliquary'; });
    if (!leyRec || !relRec) return { ok: false, detail: 'missing lz-ley or lz-reliquary in REG' };
    /* lz-ley aims its -z local axis: world unit vector (-sin ry, -cos ry) */
    var ax = -Math.sin(leyRec.ry), az = -Math.cos(leyRec.ry);
    var dx = relRec.x - leyRec.x, dz = relRec.z - leyRec.z, L = Math.hypot(dx, dz) || 1;
    var dot = Math.max(-1, Math.min(1, ax * (dx / L) + az * (dz / L)));
    var errDeg = Math.acos(dot) * 180 / Math.PI;
    return {
      ok: errDeg < 0.25 && L > 3000 && L < 4500 && GL_SITE.reliquary.los.hidden,
      errDeg: +errDeg.toFixed(4),
      distM: +L.toFixed(1),
      hiddenBehindShoulder: GL_SITE.reliquary.los.hidden,
      shoulderClearM: GL_SITE.reliquary.los.crestAboveLineM
    };
  }

  var rep = {
    err: GL_SITE.cityErr,
    sites: GL_SITE.sites.length,
    regTop: REG.filter(function (r) { return !r.parent; }).length,
    byKind: GL_SITE.byKind,
    people: GL_SITE.people,
    pin: GL_SITE.pin,
    spiral: {
      vertices: GL_SITE.spiralPts.length,
      blocks: GL_SITE.spiralBlocks.length,
      cornerAnglesDeg: GL_SITE.cornerAnglesDeg,
      windingDepths: GL_SITE.windingDepths,
      inwardBad: GL_SITE.inwardBad
    },
    overlapPairs: GL_SITE.overlapPairs,
    ground: auditGround(),
    ley: auditLey(),
    saltHamlet: GL_SITE.saltHamlet,
    water: window._glWater,
    books: GL_REC.balance()
  };
  window._gila = rep;
  if (window._api) {
    window._api.gila = function () { return window._gila; };
    window._api.view = function (name) {
      if (VIEWS && VIEWS[name]) { setView.apply(null, VIEWS[name]); return true; }
      return false;
    };
  }
})();
