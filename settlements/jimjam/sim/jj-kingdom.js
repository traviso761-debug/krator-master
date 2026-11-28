// ================================================================= JIMJAM — regional economy adapter over core/region/data/jj-tune.js
// [G data] Delegates to JJ_TUNE (`core/region/data/jj-tune.js`) + FC_TUNE (`core/region/data/fc-tune.js`), exposing:
//   - JJ_KINGDOM.valley(o)  : coupled 27-settlement open trade across JJ1-JJ4, FC1-FC4, Dilihan, Serai, Silkhead, Shell/K10, Palewharf & Whitelake
//   - JJ_KINGDOM.autarky(o) : closed inter-polity borders over 365 days (measures exact exhaustion days, stalled Royal Almanac Press & Silkhead hunger)
//   - JJ_KINGDOM.embargo(o) : unpaid Silk-Trail retainers -> BF-04 Broken-Kin Free-Clan highwaymen raids on Spur S-A
var JJ_KINGDOM = (function () {
  'use strict';
  var J = typeof JJ_TUNE !== 'undefined' ? JJ_TUNE : null;
  if (!J && typeof require === 'function') {
    var path = require('path');
    J = require(path.join(__dirname, '..', '..', '..', 'core', 'region', 'data', 'jj-tune.js'));
  }
  if (!J) throw new Error('JJ_KINGDOM: load core/region/data/jj-tune.js before settlements/jimjam/sim/jj-kingdom.js');
  return {
    tune: J,
    px: J.px,
    yearDay0: J.yearDay0,
    jimjamIds: J.jimjamIds,
    dilihanIds: J.dilihanIds,
    sodaAxisIds: J.sodaAxisIds,
    foreignIds: J.foreignIds,
    summarizePolity: J.summarizePolity,
    attachUnrest: J.attachUnrest,
    valley: function (o) { return J.valley(Object.assign({ autarky: false }, o || {})); },
    autarky: function (o) { return J.valley(Object.assign({ autarky: true }, o || {})); },
    embargo: function (o) { return J.valley(Object.assign({ autarky: false, embargo: true }, o || {})); }
  };
})();
if (typeof module !== 'undefined') module.exports = JJ_KINGDOM;
