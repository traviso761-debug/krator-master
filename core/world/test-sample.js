// node core/world/test-sample.js — the countryside sample's cells (core/world/48v-world-sample.js WSAMPLE) on a stubbed world:
// a cell's village is a pure function of (world, province, cell), the same whatever order the cells are asked in; two villages
// stand at least 0.4 of a cell apart; a candidate on a place, a road or water is refused; farmland decides which cells keep one.
// Each check with its negative (tools/ktest.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8'));
/* the stubbed world: a 60 km square region, land everywhere at 10 m but a lake in its south-west quarter; farmland by a ramp */
let FARM = (x, z) => .3 + .6 * (x + 30000) / 60000;
global.WORLD = { inside: (x, z) => Math.abs(x) < 30000 && Math.abs(z) < 30000, H: () => 10, water: (x, z) => (x < -15000 && z > 15000 ? 20 : -1e9) };
global.WRES = { farm: (x, z) => FARM(x, z) };
global.WORLD_DATA = { meta: { frame: { origin_px: [100, 100], box_px: [85, 85, 115, 115], m_per_px: 2000 } } };
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'core', 'world', '48v-world-sample.js'), 'utf8'));
const spec = { prov: 'p1', culture: 'xanadu', cell: 6000, foci: [['farming', 3], ['ranch', 1]], pop: [120, 300] };
const S = WSAMPLE.cfg(spec, { world: 1191569, avoid: [{ x: 0, z: 0, r: 4000, why: 'a site' }], roads: [[[-30000, 9000], [30000, 9000]]] });

// 1. a pure function of the cell
const fwd = WSAMPLE.all(S), back = [];
const B = WSAMPLE.regionBox();
for (let i = Math.floor(B[2] / S.cell); i >= Math.floor(B[0] / S.cell); i--) for (let j = Math.floor(B[3] / S.cell); j >= Math.floor(B[1] / S.cell); j--) { const c = WSAMPLE.at(S, i, j); if (c && !WSAMPLE.why(S, c)) back.push(c); }
const key = L => JSON.stringify(L.map(c => [c.id, c.x, c.z, c.focus, c.pop]).sort());
T.ok('a cell lays the same village whatever order the cells are asked in', fwd.length > 5 && key(fwd) === key(back), fwd.length + ' villages');
T.neg('...its negative: another world seed lays others', L => key(L) === key(fwd), WSAMPLE.all(WSAMPLE.cfg(spec, { world: 7, avoid: S.avoid, roads: S.roads })), fwd);

// 2. apart
const gap = L => { let m = 1e9; for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) m = Math.min(m, Math.hypot(L[a].x - L[b].x, L[a].z - L[b].z)); return m; };
T.ok('two villages stand at least 0.4 of a cell apart', gap(fwd) >= .4 * S.cell, Math.round(gap(fwd)) + ' m at the closest');
T.neg('...its negative: two villages a metre apart are caught', L => gap(L) >= .4 * S.cell, fwd.concat([Object.assign({}, fwd[0], { x: fwd[0].x + 1 })]), fwd);

// 3. refused on a place, a road, water
const bad = fwd.filter(c => Math.hypot(c.x, c.z) < 4000 || Math.abs(c.z - 9000) < 250 || (c.x < -15000 && c.z > 15000));
T.ok('no village on the site, the road or the lake', !bad.length, bad.length + ' on them');
T.neg('...its negative: a candidate on the site, the road and the lake is refused each time', c => !WSAMPLE.why(S, c), { x: 100, z: 100 }, { x: 20000, z: -20000 });
T.ok('the refusals name their reason', WSAMPLE.why(S, { x: 100, z: 100 }) === 'a site' && WSAMPLE.why(S, { x: 20000, z: 9100 }) === 'a road' && WSAMPLE.why(S, { x: -20000, z: 20000 }) === 'water' && WSAMPLE.why(S, { x: 40000, z: 0 }) === 'outside');

// 4. farmland decides
FARM = () => 0;
const none = WSAMPLE.all(S);
T.ok('no farmland, no village', none.length === 0, none.length + ' villages');
FARM = (x, z) => .3 + .6 * (x + 30000) / 60000;
const east = fwd.filter(c => c.x > 0).length, west = fwd.filter(c => c.x < 0).length;
T.ok('more villages where the farmland is better (the east half)', east > west, east + ' east, ' + west + ' west');
T.neg('...its negative: an even count is caught', ([e, w]) => e > w, [5, 5], [east, west]);
console.log(fwd.length + ' villages: ' + JSON.stringify(fwd.slice(0, 3).map(c => [c.id, c.focus, c.pop])));
T.done();
