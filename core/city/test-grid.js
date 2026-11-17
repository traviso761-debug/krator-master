// node core/city/test-grid.js — KCITY.grid (37-city-grid.js), the irregular square: the plan is plain, seeded and the same
// twice; the wall is nearly square (corners near right angles, sides near equal); the grid is irregular (lines off their
// places, runs missing, runs bent) but every crossing is still reached; only the avenues pass the wall, each once at each end;
// the build zone lies inside the wall. Each check with a negative (tools/ktest.js).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
global.window = global;
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
['core/rand/08-core-rand.js', 'core/space/20-core-space.js'].forEach(load);
fs.readdirSync(path.join(ROOT, 'core', 'city')).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host|squares|radial|covered/.test(f)).sort().forEach(f => load('core/city/' + f));

const SPEC = { id: 'tg', seed: 41700, c: [100, -50], u: [Math.SQRT1_2, -Math.SQRT1_2], v: [Math.SQRT1_2, Math.SQRT1_2], half: 300, cells: 5 };
const G = KCITY.grid.plan(SPEC);
console.log('the grid: ' + G.ways.length + ' ways (' + G.ways.filter(w => w.kind === 'avenue').length + ' avenues), ' + G.edges.kept + ' runs kept, ' + G.edges.dropped +
  ' dropped, ' + G.gates.length + ' gates, wall ' + (G.wall.length - 1) + ' points');

/* plain, seeded, the same twice, ids unique */
const ids = G => [].concat(G.ways.map(w => w.id), G.gates.map(g => g.id), G.cells.map(c => c.id), G.corners.map(c => c.id), [].concat(...G.nodes).map(n => n.id));
const unique = G => new Set(ids(G)).size === ids(G).length;
T.ok('the plan is the same twice', JSON.stringify(KCITY.grid.plan(SPEC)) === JSON.stringify(G));
T.ok('the plan is plain records (a JSON round trip keeps it)', JSON.stringify(JSON.parse(JSON.stringify(G))) === JSON.stringify(G));
T.neg('every id is unique (a repeated id is caught)', g => unique(g), Object.assign({}, G, { gates: G.gates.concat([G.gates[0]]) }), G);
T.ok('another seed gives another plan', JSON.stringify(KCITY.grid.plan(Object.assign({}, SPEC, { seed: 41701 })).ways) !== JSON.stringify(G.ways));

/* nearly square: the wall's corners within 10 degrees of a right angle, its sides within 12 % of their mean */
function square(g) {
  const C = g.corners.map(c => [c.x, c.z]), ang = [], len = [];
  for (let k = 0; k < 4; k++) {
    const p = C[(k + 3) % 4], q = C[k], r = C[(k + 1) % 4], a = [p[0] - q[0], p[1] - q[1]], b = [r[0] - q[0], r[1] - q[1]];
    ang.push(Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180 / Math.PI); len.push(Math.hypot(...b));
  }
  const m = len.reduce((s, x) => s + x, 0) / 4;
  return ang.every(x => Math.abs(x - 90) < 10) && len.every(x => Math.abs(x - m) / m < 0.12);
}
const skew = JSON.parse(JSON.stringify(G)); skew.corners[2].x += 160; skew.corners[2].z += 90;
T.neg('the wall is nearly square (a skewed corner is caught)', square, skew, G);

/* irregular: some inner lines off their places, some runs missing, some bent; a regular grid is caught */
function irregular(g) {
  const s = g.spec, off = [];
  for (let i = 1; i < s.cells[0]; i++) { const n = g.nodes[i][0], o = g.nodes[0][0], d = (n.x - o.x) * g.frame.u[0] + (n.z - o.z) * g.frame.u[1]; off.push(Math.abs(d - 2 * s.half[0] * i / s.cells[0])); }
  const bent = g.ways.some(w => w.role === 'grid' && w.pts.some((p, k) => k > 0 && k < w.pts.length - 1 && !g.nodes.some(c => c.some(n => n.x === p[0] && n.z === p[1]))));
  return off.some(d => d > 1) && g.edges.dropped > 0 && bent;
}
T.neg('the grid is irregular (a regular grid is caught)', irregular, KCITY.grid.plan(Object.assign({}, SPEC, { jitter: 0, corner: 0, bow: 0, drop: 0, bend: 0 })), G);

/* every crossing reached by the kept runs and the inner street */
function reached(g) {
  const k = p => p[0].toFixed(2) + ',' + p[1].toFixed(2), adj = {};
  g.ways.forEach(w => { const P = w.pts.filter(p => g.nodes.some(c => c.some(n => n.x === p[0] && n.z === p[1]))); for (let i = 1; i < P.length; i++) { (adj[k(P[i - 1])] = adj[k(P[i - 1])] || []).push(k(P[i])); (adj[k(P[i])] = adj[k(P[i])] || []).push(k(P[i - 1])); } });
  const all = [].concat(...g.nodes).map(n => k([n.x, n.z])), seen = new Set([all[0]]), st = [all[0]];
  while (st.length) (adj[st.pop()] || []).forEach(m => { if (!seen.has(m)) { seen.add(m); st.push(m); } });
  return all.every(a => seen.has(a));
}
const cut = JSON.parse(JSON.stringify(G)); cut.ways = cut.ways.filter(w => w.role !== 'ring' && w.role !== 'avenue');
T.neg('every crossing is reached by the streets (a grid with its inner street and avenues gone is caught)', reached, cut, G);

/* only the avenues pass the wall, each at both its ends; every other street stays inside */
const crossings = (g, w) => { const L = g.wall; let n = 0;
  for (let i = 1; i < w.pts.length; i++) for (let k = 1; k < L.length; k++) {
    const p = w.pts[i - 1], q = w.pts[i], r = L[k - 1], s = L[k], d1 = [q[0] - p[0], q[1] - p[1]], d2 = [s[0] - r[0], s[1] - r[1]], den = d1[0] * d2[1] - d1[1] * d2[0];
    if (Math.abs(den) < 1e-9) continue; const t = ((r[0] - p[0]) * d2[1] - (r[1] - p[1]) * d2[0]) / den, u = ((r[0] - p[0]) * d1[1] - (r[1] - p[1]) * d1[0]) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) n++; }
  return n; };
const gatesOnly = g => g.ways.every(w => crossings(g, w) === (w.role === 'avenue' ? 2 : 0)) && g.gates.length === 2 * g.ways.filter(w => w.role === 'avenue').length;
const leak = JSON.parse(JSON.stringify(G)), lw = leak.ways.find(w => w.role === 'grid'); lw.pts.push([lw.pts[0][0] + 2000, lw.pts[0][1]]);
T.neg('only the avenues pass the wall, once at each end (a street run out through it is caught)', gatesOnly, leak, G);
T.ok('two avenues cross in the middle, four gates', G.ways.filter(w => w.role === 'avenue').length === 2 && G.gates.length === 4 && new Set(G.gates.map(g => g.side)).size === 4);

/* the build zone inside the wall, the inner street inside the zone */
const zoneIn = g => g.zone.every(p => KCITY.grid.inside(g, p[0], p[1])) && g.ring.every(p => inZone(g, p));
function inZone(g, p) { let c = false; const P = g.zone; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
const fat = JSON.parse(JSON.stringify(G)); fat.zone = KCITY.grid.offset(fat.zone, 40);
T.neg('the build zone lies inside the wall and holds the inner street (a zone past the wall is caught)', zoneIn, fat, G);

/* the cells: one a grid square, a missing run joining two */
T.ok('the cells: one per grid square, the joined ones listed both ways', G.cells.length === 25 && G.cells.every(c => c.merged.every(m => G.cells.find(d => d.id === m).merged.indexOf(c.id) >= 0)) &&
  G.cells.filter(c => c.merged.length).length >= 2 * Math.min(1, G.edges.dropped));
/* the wall's records laid on the square keep its corners (core/city's own walk round the whole line cuts them) */
const avs = G.ways.filter(w => w.role === 'avenue').map(w => ({ cls: 'avenue', pts: w.pts, F: plFrame(w.pts) }));
const WR = KCITY.grid.wall(G, avs, { towerGap: 90, clear: 12, gateFind: 40, named: G.gates.map(g => ({ x: g.x, z: g.z, marker: g.side, name: g.side })), side: 1, health: 2 });
const keeps = W => G.corners.every(c => W.nodes.some(n => n.kind === 'corner' && Math.hypot(n.x - c.x, n.z - c.z) < 0.5)) && W.gates.filter(g => g.named).length === 4 &&
  W.nodes.every((n, i) => !i || n.s >= W.nodes[i - 1].s);
T.neg('the wall keeps its four corners as nodes, its four named gates, its nodes in order (the whole-line walk, which cuts the corners, is caught)', keeps,
  KCITY.site.wall(G.wall, avs, { towerGap: 90, clear: 12, gateFind: 40, named: G.gates.map(g => ({ x: g.x, z: g.z, marker: g.side, name: g.side })), side: 1, health: 2 }), WR);
T.done();
