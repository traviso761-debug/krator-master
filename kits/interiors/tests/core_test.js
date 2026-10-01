/* kits/interiors/tests/core_test.js: the engine-neutral core in node, with a FAKE catalog adapter that
   exercises what the master catalog cannot: a surface piece (on a table), a ceiling piece, a
   wall piece, a custom room program, a rotated L-shaped room with two doors, and a room whose
   culture has nothing (so it must fall back). Then: the 0.2 m / 4-neighbour grid option, no
   corner cutting, the quarter-disc door zone, bounded backtracking on a room greedy cannot
   furnish, the planner (three buildings: one storey, an L, three storeys), and walkers.
   Run by verify.py --assert; alone:
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
/* culture y: enough for planned buildings */
[['y_table', 'table', ['hall', 'tavern', 'kitchen', 'study'], 'floor', { front: 0.5, back: 0.5, left: 0.4, right: 0.4 }, [1.4, 0.8, 0.75]],
  ['y_chair', 'chair', ['hall', 'tavern', 'study'], 'floor', { front: 0.4 }, [0.5, 0.5, 0.9]],
  ['y_bed', 'bed', ['bedroom'], 'floor', { front: 0.6, left: 0.5 }, [1.4, 2.1, 0.6]],
  ['y_stove', 'stove', ['kitchen'], 'floor', { front: 0.8 }, [1.2, 0.8, 1.2]],
  ['y_counter', 'counter', ['tavern'], 'floor', { front: 0.8, back: 0.6 }, [2.4, 0.7, 1.1]],
  ['y_shelf', 'shelf', ['store', 'kitchen', 'workshop', 'study'], 'wall', { front: 0.6 }, [1.2, 0.4, 2.0]],
  ['y_bench', 'workstation', ['workshop'], 'floor', { front: 0.7 }, [1.8, 0.8, 0.9]],
  ['y_desk', 'desk', ['study'], 'floor', { front: 0.7 }, [1.2, 0.6, 0.75]],
  ['y_pot', 'vessel', ['hall', 'kitchen', 'tavern'], 'surface', {}, [0.25, 0.25, 0.2]]
].forEach(function (a) { P.push({ key: a[0], culture: 'y', type: a[1], setting: 'indoor', rooms: a[2], anchor: a[3], clearance: a[4], variants: 1, dims: [a[5]] }); });
/* culture z: a tight room's requirements (backtracking) */
[['z_bed', 'bed', 'floor', { front: 0.6 }, [1.4, 2.0, 0.6]], ['z_stove', 'stove', 'floor', { front: 0.7 }, [1.0, 0.7, 1.2]],
  ['z_shelf', 'shelf', 'wall', { front: 0.6 }, [1.4, 0.4, 2.0]], ['z_desk', 'desk', 'floor', { front: 0.7 }, [1.2, 0.6, 0.75]]
].forEach(function (a) { P.push({ key: a[0], culture: 'z', type: a[1], setting: 'indoor', rooms: ['tight'], anchor: a[2], clearance: a[3], variants: 1, dims: [a[4]] }); });
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
  build: function () { return null; },
  lights: function (k) { return k === 'y_stove' ? [{ lx: 0, ly: 1.0, lz: 0.2, intensity: 1.2, distance: 6 }] : []; }
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

/* ---- the grid: 0.1 m / 8-neighbour by default, 0.2 m / 4-neighbour on request, no corner cutting */
ok(p1.grid.cell === 0.1 && p1.grid.nbr === 8, 'default grid is 0.1 m, 8-neighbour');
const p1c = IX.furnishRoom(R1, cat, { cell: 0.2, nbr: 4 });
ok(p1c.grid.cell === 0.2 && p1c.grid.nbr === 4 && IX.audit(R1, p1c, cat, { furnishOpts: { cell: 0.2, nbr: 4 } }).ok, 'the 0.2 m / 4-neighbour grid still furnishes and audits clean');
(function () {
  const Rg = IX.normRoom({ id: 'test.grid', kind: 'hall', poly: [[0, 0], [3, 0], [3, 3], [0, 3]], doors: [{ at: [1.5, 0], w: 1 }] });
  const g = IX.makeGrid(Rg, {}), k = g.at(1.5, 1.5), nx = g.nx;
  ok(g.neighbours(k).length === 8, 'an open cell has 8 neighbours');
  g.occ[k + 1] = 1;
  ok(g.neighbours(k).indexOf(k + nx + 1) < 0 && g.neighbours(k).indexOf(k - nx + 1) < 0, 'no diagonal past a blocked side cell (no corner cutting)');
  ok(g.neighbours(k).indexOf(k + nx - 1) >= 0, 'the other diagonals stay open');
  const g4 = IX.makeGrid(Rg, { nbr: 4 });
  ok(g4.neighbours(g4.at(1.5, 1.5)).length === 4, 'nbr: 4 moves only straight');
  /* the door's keep-free zone is the leaf's quarter disc, not its bounding square */
  const d = Rg.doors[0], Z = IX.doorZones(Rg, d), hinge = [1.5 - 0.5, 0];
  const sq = function (x, z) { return IX.geom.corners(IX.geom.rect(x, z, 0, 0.06, 0.06)); };
  const inZ = function (x, z) { return Z.some(function (P) { return IX.geom.convexOverlap(sq(x, z), P, 0.001); }); };
  ok(inZ(hinge[0] + 0.6, 0.6), 'inside the swing at 0.85 m from the hinge');
  ok(!inZ(hinge[0] + 0.75, 0.8), 'free beyond the arc (1.10 m from the hinge), where the old rectangle was kept');
})();

/* ---- bounded backtracking: a room greedy (and its three reorders) cannot furnish */
IX.PROGRAMS.tight = { require: [{ need: 'bed', types: ['bed'], n: 1 }, { need: 'stove', types: ['stove'], n: 1 }, { need: 'shelf', types: ['shelf'], n: 1 },
  { need: 'desk', types: ['desk'], n: 1 }], optional: [], extra: 99 };
const RT = IX.ROOM({ id: 'tt.2.6x3.7.0.5.0', kind: 'tight', culture: 'z', poly: [[0, 0], [2.6, 0], [2.6, 3.7], [0, 3.7]], h: 3, doors: [{ at: [1.3, 0], w: 0.9 }] });
const pg = IX.furnishRoom(RT, cat, { backtrack: 0 }), pb = IX.furnishRoom(RT, cat);
ok(pg.report.missing.some(function (m) { return m.reason === 'no-fit'; }), 'greedy with reorders leaves the tight room short');
ok(!pb.report.missing.length && pb.report.backtrack && pb.report.backtrack.skips, 'backtracking fits every required piece: ' + JSON.stringify(pb.report.backtrack));
ok(IX.audit(RT, pb, cat).ok, 'the backtracked plan audits clean (and furnishes the same again)');
ok(pb.stats && pb.stats.runs > 3 && pb.stats.ms >= 0, 'placement time and runs are measured');

/* ---- the planner: rooms, partitions, doors, stairs, multi-storey */
function brect(cx, cz, w, d, rot) { const c = Math.cos(rot || 0), s2 = Math.sin(rot || 0); return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(function (p) { return [cx + p[0] * c + p[1] * s2, cz - p[0] * s2 + p[1] * c]; }); }
const SHELLS = [
  [{ id: 'pb.house', poly: brect(0, 0, 10, 8), levels: 2, doors: [{ at: [0, 4], w: 1.1 }], culture: 'y', wealth: 0.5 }, 'dwelling', 2, 6],
  [{ id: 'pb.inn', poly: [[0, 20], [12, 20], [12, 25], [6, 25], [6, 30], [0, 30]], doors: [{ at: [3, 30], w: 1.3 }], culture: 'y', roof: 'hip' }, ['tavern', 'kitchen', 'store'], 1, 3],
  [{ id: 'pb.tower', poly: brect(30, 0, 9, 7, 0.3), levels: 3, culture: 'y' }, [['workshop', 'store'], ['study', 'bedroom'], ['bedroom']], 3, 5]
];
let climbed = 0, walkersAll = 0;
SHELLS.forEach(function (S) {
  const B = IX.planBuilding(S[0], S[1], {});
  ok(B.levels.length === S[2] && B.rooms.length === S[3], B.id + ': ' + S[2] + ' storeys, ' + S[3] + ' rooms (got ' + B.levels.length + ', ' + B.rooms.length + ')');
  ok(B.stairs.length === S[2] - 1, B.id + ': a stair between every pair of storeys');
  ok(B.walls.filter(function (w) { return w.kind === 'partition'; }).length === B.doors.filter(function (d) { return d.kind === 'interior'; }).length,
    B.id + ': one partition per interior door');
  ok(JSON.stringify(IX.exportBuilding(IX.planBuilding(S[0], S[1], {}))) === JSON.stringify(IX.exportBuilding(B)), B.id + ': planning is deterministic');
  const plans = {};
  B.rooms.forEach(function (R) {
    const pl = IX.furnishRoom(R, cat);
    plans[R.id] = pl;
    const a = IX.audit(R, pl, cat);
    if (!a.ok) fails.push('furnish ' + R.id + ': ' + JSON.stringify(a.fails.slice(0, 2)));
    if (pl.report.missing.length) fails.push('furnish ' + R.id + ' misses ' + JSON.stringify(pl.report.missing));
  });
  const AB = IX.auditBuilding(B, plans);
  ok(AB.ok && AB.routes === B.rooms.length, B.id + ': building audit clean, every room walked to from the street ' + JSON.stringify(AB.fails.slice(0, 3)));
  const N = IX.life.nav({ rooms: B.rooms, plans: plans, stairs: B.stairs });
  const W = IX.life.populate(N, { count: 6, seed: 3 });
  const lf = IX.life.audit(N, W);
  ok(W.length >= 3 && !lf.length, B.id + ': walkers route, arrive, dwell and leave ' + JSON.stringify(lf.slice(0, 3)));
  const W2 = IX.life.populate(IX.life.nav({ rooms: B.rooms, plans: plans, stairs: B.stairs }), { count: 6, seed: 3 });
  let same = true;
  for (let t = 0; t < 200; t += 2.5) W.forEach(function (w, i) { if (JSON.stringify(w.at(t)) !== JSON.stringify(W2[i].at(t))) same = false; });
  ok(same, B.id + ': walkers are deterministic in time');
  climbed += W.filter(function (w) { return w.route.pts.some(function (p) { return p.kind === 'stair'; }); }).length;
  walkersAll += W.length;
  if (B.id === 'pb.house') {
    const kitchen = plans['pb.house.kitchen'];
    ok(kitchen && kitchen.lights.length === 1 && Math.abs(kitchen.lights[0].y - (B.levels[0].y + 1.0)) < 1e-6, 'a stove carries its light as data, in world terms');
  }
});
ok(climbed > 0, 'some walker climbs a stair (' + climbed + ' of ' + walkersAll + ')');
console.log(JSON.stringify({ placed: p1.placements.map(function (p) { return p.key + '@' + p.role; }), fails: fails }));
process.exit(fails.length ? 1 : 0);
