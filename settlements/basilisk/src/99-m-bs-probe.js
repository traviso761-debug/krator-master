/* ==================== Basilisk 99-m: host camera range, inspector enrichment, and verify probe ([web]) ==================== */
/* Sorts after 99-host-take.js and before 99-tail.html: widens KHOST's orbit radius so Basilisk's 6.8 km peninsula, 700 m ley
   mole, Dholavira reservoirs and southern paddies can be framed cleanly, enriches click-to-inspect, and exposes window._basilisk. */
(function () {
  if (typeof KHOST !== 'undefined' && KHOST.cam && KHOST.cam.ctl) {
    KHOST.cam.ctl.maxR = 28000;
  }
  if (typeof VIEWS !== 'undefined' && VIEWS['Overview']) {
    setView.apply(null, VIEWS['Overview']);
  }

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
        return 'Basilisk stone foundation (lizardmen · infrastructure)\n' + pt.x.toFixed(1) + ', ' + pt.y.toFixed(1) + ', ' + pt.z.toFixed(1);
      }
      return res;
    };
  }

  function auditGround() {
    var G = BS_SITE, floating = [], buried = [], i, pl, c, s, k, pts, px, pz, gy;
    pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (i = 0; i < G.plinths.length; i++) {
      pl = G.plinths[i];
      c = Math.cos(pl.ry); s = Math.sin(pl.ry);
      for (k = 0; k < 4; k++) {
        px = pl.x + pts[k][0] * pl.w / 2 * c + pts[k][1] * pl.d / 2 * s;
        pz = pl.z - pts[k][0] * pl.w / 2 * s + pts[k][1] * pl.d / 2 * c;
        gy = KDRAWN.h(px, pz);
        if (gy === null) continue;
        if (pl.y0 > gy + 0.06) floating.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z));
        if (pl.y1 < gy - 0.08) buried.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z));
      }
    }
    return { checked: G.plinths.length, floating: floating, buried: buried };
  }

  function auditLey() {
    var leyRec = REG.find(function (r) { return r.key === 'lz-ley'; });
    var hallRec = REG.find(function (r) { return r.key === 'lk-greathall'; });
    if (!leyRec || !hallRec) return { ok: false, detail: 'missing lz-ley or lk-greathall in REG' };
    /* lz-ley aims its -z local axis: world unit vector (-sin ry, -cos ry); lk-greathall aims its +z door: (sin ry, cos ry) */
    var ax = -Math.sin(leyRec.ry), az = -Math.cos(leyRec.ry);
    var hx = Math.sin(hallRec.ry), hz = Math.cos(hallRec.ry);
    var relPx = BS_REC.site.reliquary.px, pinPx = BS_REC.site.px;
    var dx = (relPx[0] - pinPx[0]) * 2000, dz = (relPx[1] - pinPx[1]) * 2000, L = Math.hypot(dx, dz) || 1;
    var dotLey = Math.max(-1, Math.min(1, ax * (dx / L) + az * (dz / L)));
    var dotHall = Math.max(-1, Math.min(1, hx * (dx / L) + hz * (dz / L)));
    var errLey = Math.acos(dotLey) * 180 / Math.PI;
    var errHall = Math.acos(dotHall) * 180 / Math.PI;
    return {
      ok: errLey < 0.25 && errHall < 0.25 && Math.abs(L - 60590) < 200,
      errDeg: +errLey.toFixed(4),
      hallErrDeg: +errHall.toFixed(4),
      distKm: +(L / 1000).toFixed(2)
    };
  }

  var tuneChk = typeof LZ_TUNE !== 'undefined' ? LZ_TUNE.checkTown(BS_REC) : { ok: false, problems: ['LZ_TUNE missing'] };

  window._basilisk = {
    err: BS_SITE.cityErr,
    manifestPlaced: BS_SITE.manifestPlaced,
    sites: BS_SITE.sites.length,
    regTop: REG.filter(function (r) { return !r.parent; }).length,
    byWhere: BS_SITE.byWhere,
    people: BS_SITE.people,
    pin: BS_SITE.pin,
    inward: { checked: BS_SITE.inwardChecked, bad: BS_SITE.inwardBad, flaws: BS_SITE.flawCount },
    overlapPairs: BS_SITE.overlapPairs,
    ground: auditGround(),
    ley: auditLey(),
    paddyHamlet: BS_SITE.paddyHamlet,
    water: window._bsWater,
    records: tuneChk
  };
  if (window._api) {
    window._api.basilisk = function () { return window._basilisk; };
    window._api.view = function (name) {
      if (VIEWS && VIEWS[name]) { setView.apply(null, VIEWS[name]); return true; }
      return false;
    };
  }
})();
