// ================================================================= ARDENT — economy adapter over core/region/data/fc-tune.js
// [G data] Delegates to FC_TUNE (`core/region/data/fc-tune.js`), exposing `FC_ARDENT.valley(o)` (open neighbour trade across
// R1-R4), `FC_ARDENT.autarky(o)` (closed borders to measure what the 27,200-soul Free Clans polygon runs out of over 365 days),
// and `FC_ARDENT.embargo(o)` (unpaid Silk-Trail retainers -> BF-04 Broken-Kin highwaymen raids).
var FC_ARDENT = (function () {
  'use strict';
  var F = typeof FC_TUNE !== 'undefined' ? FC_TUNE : null;
  if (!F && typeof require === 'function') {
    var path = require('path');
    F = require(path.join(__dirname, '..', '..', '..', 'core', 'region', 'data', 'fc-tune.js'));
  }
  if (!F) throw new Error('FC_ARDENT: load core/region/data/fc-tune.js before settlements/ardent/sim/fc-ardent.js');
  return {
    tune: F,
    px: F.px,
    yearDay0: F.yearDay0,
    goods: F.goods,
    food: F.food,
    diet: F.diet,
    calendar: F.calendar,
    factions: F.factions,
    freeClansIds: F.freeClansIds,
    neighbourIds: F.neighbourIds,
    evaluateBandState: F.evaluateBandState,
    summarizeFreeClans: F.summarizeFreeClans,
    valley: function (o) { return F.valley(Object.assign({ autarky: false }, o || {})); },
    autarky: function (o) { return F.valley(Object.assign({ autarky: true }, o || {})); },
    embargo: function (o) { return F.valley(Object.assign({ autarky: false, embargo: true }, o || {})); }
  };
})();
if (typeof module !== 'undefined') module.exports = FC_ARDENT;
