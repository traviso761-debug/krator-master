/* ==================== kits/lizardmen/settle 99-m: a Lizardmen village's probe ([web]) ==================== */
/* Gila's probe (settlements/gila/src/99-m-gl-probe.js) made general. Sorts after 99-host-take.js and before 99-tail.html:
   widens the orbit for the town's ground, labels the ground and the water for the inspector, and exposes window._lzv and
   _api.lzv() for the shared verify (kits/lizardmen/settle/lzv_verify.py): the site's checks, the ground audit (every plinth
   meets the drawn ground), the ley line's aim at its reliquary, the water, and the town's records held to LZ_TUNE. */
(function () {
  var G = LZV_SITE, S = G.spec;
  if (typeof KHOST !== 'undefined' && KHOST.cam && KHOST.cam.ctl) KHOST.cam.ctl.maxR = 24000;
  if (typeof VIEWS !== 'undefined' && VIEWS['Overview']) setView.apply(null, VIEWS['Overview']);
  if (typeof SV_TAKE !== 'undefined' && SV_TAKE.inspect) {
    var base = SV_TAKE.inspect;
    SV_TAKE.inspect = function (first, hits) {
      var res = base(first, hits);
      if (res && res.indexOf('unregistered mesh') < 0 && res !== '(nothing)') return res;
      var h = (hits || []).find(function (q) { return q.object && q.object.userData && q.object.userData.inspectLabel; });
      if (h) return h.object.userData.inspectLabel + '\n' + h.point.x.toFixed(1) + ', ' + h.point.y.toFixed(1) + ', ' + h.point.z.toFixed(1);
      if (res && res.indexOf('unregistered mesh') === 0 && hits && hits.length) return 'Footing plinth (lizardmen, infrastructure)';
      return res;
    };
  }
  function auditGround() {
    var floating = [], buried = [];
    G.plinths.forEach(function (pl) { var c = Math.cos(pl.ry), s = Math.sin(pl.ry);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { var px = pl.x + q[0] * pl.w / 2 * c + q[1] * pl.d / 2 * s, pz = pl.z - q[0] * pl.w / 2 * s + q[1] * pl.d / 2 * c, gy = KDRAWN.h(px, pz);
        if (gy === null) return; if (pl.y0 > gy + 0.05) floating.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z)); if (pl.y1 < gy - 0.08) buried.push(pl.key + '@' + Math.round(pl.x) + ',' + Math.round(pl.z)); }); });
    return { checked: G.plinths.length, floating: floating, buried: buried };
  }
  function auditLey() {
    if (!G.ley) return { ok: true, none: true };
    var r = REG.find(function (q) { return q.key === 'lz-ley'; }); if (!r) return { ok: false, detail: 'no lz-ley placed' };
    var ax = -Math.sin(r.ry), az = -Math.cos(r.ry), u = G.ley.unit, err = Math.acos(Math.max(-1, Math.min(1, ax * u[0] + az * u[1]))) * 180 / Math.PI;
    return { ok: err < 0.25, errDeg: +err.toFixed(4), distM: G.ley.distM, to: G.ley.to, name: S.ley.name };
  }
  var rec = S.records || null, chk = rec && typeof LZ_TUNE !== 'undefined' ? LZ_TUNE.checkTown(rec) : { ok: false, problems: ['no records or no LZ_TUNE on the page'] };
  var placed = {}; REG.forEach(function (r) { placed[r.key] = (placed[r.key] || 0) + 1; });
  var unworked = rec ? rec.works.filter(function (w) { return !w.keys.some(function (k) { return placed[k]; }); }).map(function (w) { return w.good; }) : [];
  window._lzv = {
    key: S.key, name: S.name, err: G.cityErr, sites: G.sites.length, regTop: REG.filter(function (r) { return !r.parent; }).length, byKind: G.byKind, placed: placed,
    people: G.people, pin: G.pin, expect: S.expect || {},
    spiral: { vertices: G.spiralPts.length, blocks: G.spiralBlocks.length, cornerAnglesDeg: G.cornerAnglesDeg, windingDepths: G.windingDepths, inwardBad: G.inwardBad, depth0: S.spiral.depth0, windings: S.spiral.windings },
    overlapPairs: G.overlapPairs, ground: auditGround(), ley: auditLey(), hamlet: G.hamlet, water: window._lzvWater,
    records: { ok: chk.ok && !unworked.length, problems: chk.problems.concat(unworked.map(function (g) { return 'no works placed for ' + g; })) }
  };
  if (window._api) {
    window._api.lzv = function () { return window._lzv; };
    window._api.view = function (name) { if (VIEWS && VIEWS[name]) { setView.apply(null, VIEWS[name]); return true; } return false; };
  }
})();
