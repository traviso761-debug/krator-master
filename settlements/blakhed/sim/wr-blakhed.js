// ================================================================= BLAKHED — economy adapter over core/region/data/wr-tune.js (B5)
// [G data] Delegates to WR_TUNE (`core/region/data/wr-tune.js`), keeping `WR_BLAKHED.valley(o)` scoped to Blakhed's 20-settlement
// district (`slice: 'blakhed'`) by default so `settlements/blakhed/test-bk-economy.js` runs unchanged, while `WR_BLAKHED.full(o)`
// and `WR_TUNE.valley(o)` build the complete 35-settlement West Rift & 12,250-Fellgang regional economy.
var WR_BLAKHED = (function () {
  'use strict';
  var W = typeof WR_TUNE !== 'undefined' ? WR_TUNE : null;
  if (!W && typeof require === 'function') {
    var path = require('path');
    W = require(path.join(__dirname, '..', '..', '..', 'core', 'region', 'data', 'wr-tune.js'));
  }
  if (!W) throw new Error('WR_BLAKHED: load core/region/data/wr-tune.js before settlements/blakhed/sim/wr-blakhed.js');
  return {
    tune: W,
    px: W.px,
    yearDay0: W.yearDay0,
    goods: W.goods,
    diet: W.diet,
    calendar: W.calendar,
    hamlets: W.hamlets,
    toll: W.toll,
    tearsCut: W.tearsCut,
    factions: W.factions,
    valley: function (o) { return W.valley(Object.assign({ slice: 'blakhed' }, o || {})); },
    full: function (o) { return W.valley(Object.assign({ slice: 'full' }, o || {})); },
    join: function (XV, o) { return W.join(XV, Object.assign({ slice: 'blakhed' }, o || {})); },
    marketPeace: W.marketPeace,
    rising: W.rising,
    stepRising: W.stepRising
  };
})();
if (typeof module !== 'undefined') module.exports = WR_BLAKHED;
