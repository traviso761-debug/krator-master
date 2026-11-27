/* ================================================================= URUNDASHI LIVE REGIONAL ECONOMY BINDING
   [G data] Binds core/region (KREGION.use + H.simValley) and core/region/data/shumar-tune.js (SHUMAR_TUNE) live on the page
   for Urundashi (srbp1bvh1r, 3,500 seat people + 5 ring hamlets = 990 people, Province S4 Sorun-Dubnu).
   Plain data & functions: no THREE, no DOM. */

var UR_SIM = (function () {
  'use strict';

  var instance = null;

  function activeSeasons(yearDay) {
    if (typeof SHUMAR_TUNE === 'undefined' || !SHUMAR_TUNE.calendar) return [];
    var wins = SHUMAR_TUNE.calendar.windows;
    var yd = ((yearDay % 365) + 365) % 365;
    var out = [];
    Object.keys(wins).forEach(function (k) {
      var w = wins[k];
      var on = w[0] <= w[1] ? (yd >= w[0] && yd < w[1]) : (yd >= w[0] || yd < w[1]);
      if (on) out.push(k);
    });
    return out;
  }

  function init(opts) {
    if (instance && !(opts && opts.reset)) return instance;
    if (typeof KREGION === 'undefined' || typeof SIM === 'undefined' || typeof SHUMAR_TUNE === 'undefined') {
      return null;
    }
    var o = opts || {};
    var H = { TUNE: { sim: {} } };
    KREGION.use(H);
    KREGION.install(H);
    if (typeof H.simValley !== 'function') return null;
    var spec = SHUMAR_TUNE.valley({ rings: o.rings == null ? true : !!o.rings });
    var S = H.simValley(spec);
    var warmDays = o.warmDays == null ? 6 : o.warmDays;
    for (var d = 0; d < warmDays; d++) {
      H.valleyRun(1440, 60);
    }
    instance = {
      host: H,
      spec: spec,
      state: S,
      tick: function (days) {
        var n = days == null ? 1 : days;
        for (var i = 0; i < n; i++) H.valleyRun(1440, 60);
        return snapshot();
      },
      snapshot: snapshot
    };
    return instance;
  }

  function snapshot() {
    var I = init();
    if (!I || !I.host || !I.state) return null;
    var books = I.host.valleyBooks();
    var towns = books ? books.towns : {};
    var day = I.state.clock ? I.state.clock.day : 0;
    var yearDay = ((SHUMAR_TUNE.yearDay0 + day) % 365 + 365) % 365;
    var pick = function (id) {
      var b = towns[id];
      if (!b) return null;
      return {
        id: id,
        people: b.people,
        stock: Object.assign({}, b.stock || {}),
        made: Object.assign({}, b.made || {}),
        used: Object.assign({}, b.used || {}),
        imported: Object.assign({}, b.imported || {}),
        exported: Object.assign({}, b.exported || {}),
        short: Object.assign({}, b.short || {})
      };
    };
    return {
      day: day,
      yearDay: yearDay,
      seasons: activeSeasons(yearDay),
      problems: I.state.problems.length,
      settlementsCount: I.state.order.length,
      census: SHUMAR_TUNE.census(),
      urundashi: pick('srbp1bvh1r'),
      amaro: pick('ssgsv5zbd2'),
      yamu: pick('sm.yamu-qappu'),
      tequilaGloss: SHUMAR_TUNE.goods.tequila.gloss,
      vothEmbargoCount: SHUMAR_TUNE.vothEmbargo.length
    };
  }

  return {
    init: init,
    snapshot: snapshot,
    activeSeasons: activeSeasons
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.UR_SIM = UR_SIM;
}
