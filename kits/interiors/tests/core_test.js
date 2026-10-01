/* kits/interiors/tests/core_test.js: the engine-neutral core in node, with a FAKE catalog adapter that
   exercises what the master catalog cannot: a surface piece (on a table), a ceiling piece, a
   wall piece, a custom room program, a rotated L-shaped room with two doors, and a room whose
   culture has nothing (so it must fall back). Run by verify.py --assert; alone:
     node tests/core_test.js dist/interiors-core.js       exit 0 = pass */
'use strict';
const IX = require(require('path').resolve(process.argv[2] || 'dist/interiors-core.js'));
const P = [
  { key: 't_table', culture: 'x', type: 'table', setting: 'indoor', rooms: ['hall', 'testhall'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.4, right: 0.4 }, variants: 2, dims: [[1.6, 0.9, 0.75], [1.2, 0.8, 0.75]] },
  { key: 't_chair', culture: 'x', type: 'chair', setting: 'indoor', rooms: ['hall', 'testhall'], anchor: 'floor', clearance: { front: 0.4 }, variants: 1, dims: [[0.5, 0.5, 0.9]] },
  { key: 't_cup', culture: 'x', type: 'vessel', setting: 'indoor', rooms: ['testhall'], anchor: 'surface', clearance: {}, variants: 1, dims: [[0.2, 0.2, 0.15]] },
  { key: 't_lamp', culture: 'x', type: 'lamp', setting: 'indoor', rooms: ['hall', 'testhall'], anchor: 'ceiling', clearance: {}, variants: 1, dims: [[0.6, 0.6, 0.4]] },
  { key: 't_shelf', culture: 'x', type: 'shelf', setting: 'both', rooms: ['testhall', 'store'], anchor: 'wall', clearance: { front: 0.6 }, variants: 1, dims: [[1.2, 0.4, 2.0]] },
  { key: 't_bench_out', culture: 'x', type: 'bench', setting: 'outdoor', rooms: ['testhall'], anchor: 'floor', clearance: {}, variants: 1, dims: [[1.5, 0.5, 0.5]] }
];
const BY = {}; P.forEach(function (d) { BY[d.key] = d; });
const cat = {
  list: function () { return P; },
  dims: function (k, v) { const a = BY[k].dims[v || 0]; return { w: a[0], d: a[1], h: a[2] }; },
  anchorY: function (k, v, at) {
    const A = BY[k];
    if (A.anchor === 'surface') return at.surfaceY != null ? at.surfaceY : at.floorY;
    if (A.anchor === 'ceiling') return at.ceilingY - cat.dims(k, v).h;
    return at.floorY;
  },
  build: function () { return null; }
};
IX.PROGRAMS.testhall = { require: [{ need: 'table', types: ['table'], n: 1 }, { need: 'seats', types: ['chair'], n: 2 }, { need: 'cup', types: ['vessel'], n: 1 },
  { need: 'light', types: ['lamp'], n: 1 }, { need: 'shelf', types: ['shelf'], n: 1 }, { need: 'outdoor bench', types: ['bench'], n: 1 }], optional: [], extra: 99 };
const c = Math.cos(0.5), s = Math.sin(0.5), xf = function (p) { return [10 + p[0] * c + p[1] * s, 4 - p[0] * s + p[1] * c]; };
const L = [[0, 0], [6, 0], [6, 2.5], [3, 2.5], [3, 5], [0, 5]].map(xf);
const fails = [];
function ok(cond, msg) { if (!cond) fails.push(msg); }
const R1 = IX.ROOM({ id: 'test.L', kind: 'testhall', culture: 'x', poly: L, y: 1.5, h: 2.8, wealth: 0.9,
  doors: [{ at: xf([1.5, 0]), w: 1.0 }, { at: xf([6, 1.25]), w: 0.9, swing: 'out' }], windows: [{ at: xf([0, 2.5]), w: 1.0, sill: 0.8 }] });
const p1 = IX.furnishRoom(R1, cat);
const a1 = IX.audit(R1, p1, cat);
a1.fails.forEach(function (f) { fails.push(f.check + ': ' + f.msg); });
const by = {}; p1.placements.forEach(function (p) { by[p.key] = (by[p.key] || []).concat([p]); });
ok(by.t_table && by.t_chair && by.t_chair.length === 2, 'table and two chairs placed');
ok(by.t_cup && by.t_cup[0].host === by.t_table[0].id && Math.abs(by.t_cup[0].y - (1.5 + 0.75)) < 1e-6, 'cup stands on the table top');
ok(by.t_lamp && Math.abs(by.t_lamp[0].y - (1.5 + 2.8 - 0.4)) < 1e-6, 'lamp hangs from the ceiling');
ok(by.t_shelf && ['back', 'wall'].indexOf(by.t_shelf[0].role) >= 0, 'shelf against a wall');
ok(!by.t_bench_out, 'an outdoor-only piece is never placed indoors');
ok(p1.report.missing.some(function (m) { return m.need === 'outdoor bench' && m.reason === 'none-in-catalog'; }), 'the outdoor bench is reported none-in-catalog');
ok(by.t_chair && by.t_chair.every(function (ch) { return ch.host === by.t_table[0].id; }), 'chairs drawn up to the table');
ok(p1.grid.toJSON().rows.length === p1.grid.nz, 'grid exports');
/* fallback: a culture with nothing gets culture x's pieces, reported */
const R2 = IX.ROOM({ id: 'test.fb', kind: 'hall', culture: 'nobody', poly: [[0, 0], [5, 0], [5, 4], [0, 4]], h: 3, doors: [{ at: [2.5, 0], w: 1 }] });
const p2 = IX.furnishRoom(R2, cat);
ok(p2.report.fallbacks.length >= 3 && p2.report.thin, 'fallback reported for an empty culture');
ok(IX.audit(R2, p2, cat).ok, 'fallback room audits clean');
const p2b = IX.furnishRoom(R2, cat, { fallback: 'none' });
ok(p2b.placements.length === 0 && p2b.report.missing.every(function (m) { return m.reason === 'none-in-catalog'; }), "fallback 'none' places nothing and says why");
/* determinism and seeds */
ok(JSON.stringify(IX.furnishRoom(R1, cat).placements) === JSON.stringify(p1.placements), 'deterministic');
let seedsOk = true;
for (let sd = 1; sd < 12; sd++) { const pp = IX.furnishRoom(R1, cat, { seed: sd }); if (!IX.audit(R1, pp, cat, { furnishOpts: { seed: sd } }).ok) seedsOk = false; }
ok(seedsOk, 'seeds 1..11 audit clean');
console.log(JSON.stringify({ placed: p1.placements.map(function (p) { return p.key + '@' + p.role; }), fails: fails }));
process.exit(fails.length ? 1 : 0);
