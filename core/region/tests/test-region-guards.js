// node core/region/tests/test-region-guards.js: core/region's host parts on a host that is not the isle demo (S2-C15). 40-region-sim
// named a place from the isle's ISLE_DIMS and called the host's simTrade unguarded, so a host without them threw (Pinnacle Rock's
// test host defined both as stand-ins). Here a bare host: a stub SIM that records places, one town, one lot. Each negative runs
// the same check on the source with the old line put back (the fault) and on the file as it is (the fix): tools/ktest.js.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..'), rd = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const CORE = rd('core/region/00-region-core.js'), SRC = rd('core/region/40-region-sim.js');

/* one bare host in a fresh context: no ISLE_DIMS unless given, no simTrade; the other parts' entry points stubbed */
function host(src, dims) {
  const places = [];
  const box = { console, Date, KRAND: { hash: function () { return 1; }, unit: function () { return 0.5; } } };
  if (dims) box.ISLE_DIMS = dims;
  box.SIM = { place: o => { places.push(o); return o; }, nav: { layer() {} }, check: () => [], R: { faction: {}, org: {} } };
  vm.createContext(box);
  vm.runInContext(CORE, box);
  box.H = { TUNE: { sim: { kinds: { xa_shop: ['work', { WORK: 2 }] }, home: { acts: ['SLEEP'], per: 2 }, seed: 1, field: {},
    greens: { cap: 0, per: 0, open: [0, 24] }, parks: { types: [] } } }, TOWNS: [], households: () => 0,
    simBuild: () => null, simCrime: () => null, simMoney: () => null, simUnrest: () => null };
  vm.runInContext('KREGION.use(H);', box);
  vm.runInContext(src, box);
  return { H: box.H, places };
}
const nav = { door: () => -1, at: () => null };
const town = { id: 'pr', name: 'A town', prefix: 'p' };
const plan = { lots: [{ id: 'l1', lot: 'l1', key: 'xa_shop', x: 0, z: 0, ry: 0, w: 10, d: 10 }], plan: { greens: [] } };
const ground = { frame: { x: 0, z: 0, sea: 0 }, h: () => 0 };

/* the place a lot becomes, its name from the kit's role where the host has ISLE_DIMS, else its key; null when it throws */
const placeName = (src, dims) => { try { const h = host(src, dims); h.H.simPlaces(town, plan, ground, nav); return h.places[0] ? h.places[0].name : null; }
  catch (e) { return null; } };
/* the declare's trade: null on a host with no simTrade; undefined when it throws */
const declaredTrade = src => { try { const h = host(src); h.H.SIM = { towns: {}, order: [], problems: [], ms: {} };
  return h.H.simDeclare([], null).trade; } catch (e) { return undefined; } };

const OLD_DIMS = SRC.replace("L.name || DM && DM.role || L.key", "L.name || ISLE_DIMS[L.key] && ISLE_DIMS[L.key].role || L.key");
const OLD_TRADE = SRC.replace('S.trade = RH.simTrade ? RH.simTrade() : null;', 'S.trade = RH.simTrade();');
T.ok('the fault sources differ from the file (the old lines are found to put back)', OLD_DIMS !== SRC && OLD_TRADE !== SRC);

T.neg('a lot on a host without ISLE_DIMS is placed, named by its key (the unguarded read is caught)', src => placeName(src) === 'xa_shop', OLD_DIMS, SRC);
T.ok('on the isle\'s host the lot keeps its kit role for a name', placeName(SRC, { xa_shop: { role: 'the shop' } }) === 'the shop');
T.neg('a host without simTrade declares its towns, with no trade (the unguarded call is caught)', src => declaredTrade(src) === null, OLD_TRADE, SRC);
T.done();
