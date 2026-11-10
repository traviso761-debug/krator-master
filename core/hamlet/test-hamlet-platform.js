// node core/hamlet/test-hamlet-platform.js: the defended platform village (32-hamlet-platform.js). Each check has a
// negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
const OLD = fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f)).sort().filter(f => !/^3[2-9]-/.test(f));
OLD.forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- the opt-in proof: every existing village answers the same before and after the new files load
const DIMS = {};
for (const f of fs.readdirSync(path.join(ROOT, 'kits', 'islanders', 'src')).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(ROOT, 'kits', 'islanders', 'src', f), 'utf8'), re = /defBuilding\(\{\s*key\s*:\s*'([^']+)'([\s\S]*?)\bbuild\s*[:(]/g; let m;
  const num = (b, n) => { const q = new RegExp('\\b' + n + '\\s*:\\s*([\\d.]+)').exec(b); return q ? +q[1] : null; };
  while ((m = re.exec(s))) if (num(m[2], 'w')) DIMS[m[1]] = { w: num(m[2], 'w'), d: num(m[2], 'd'), h: num(m[2], 'h') || 8 };
}
const vspec = (focus, w) => ({ id: 'old-' + focus, world: w == null ? 7 : w, culture: 'islander_east', focus, site: { x: 0, z: 0 }, link: { x: 500, z: 80 },
  resource: { x: -180, z: 60 }, dims: k => DIMS[k] || null });
const xspec = focus => ({ id: 'oldx-' + focus, world: 3, culture: 'xanadu', focus, site: { x: 0, z: 0 }, link: { x: 400, z: -60 }, dims: k => (k.length % 3 ? { w: 10, d: 8, h: 5 } : { w: 7, d: 6, h: 4 }) });
const digest = () => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES), v: H.FOCI.map(f => [H.hashOf(H.village(vspec(f))), H.village(vspec(f)).census]),
  x: ['farming', 'ranch'].map(f => H.hashOf(H.village(xspec(f)))) });
const before = digest();
fs.readdirSync(__dirname).filter(f => /^3[2-9]-hamlet-.*\.js$/.test(f)).sort().forEach(f => load('core/hamlet/' + f));
const after = digest();
ok('loading the new fragments moves no existing village (every focus, both rows, the FOCI and the rows unchanged)', before === after,
  H.hashOf(H.village(vspec('salt', 8))) !== H.hashOf(H.village(vspec('salt'))));

// ---- a Kimr pueblo on a plinth (no Kimr row: every key pending)
const rot = (p, a, c) => [c[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), c[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const C0 = [1000, 2000], ROT = 0.3;
const box = (w, d, c, a) => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(p => rot(p, a, c));
const pspec = o => Object.assign({ id: 'kimr-gate', world: 11, culture: 'kimr', focus: 'farming',
  plinth: { pts: box(72, 58, C0, ROT), top: 12, foot: 0 }, link: { x: C0[0] + 300, z: C0[1] + 60 } }, o || {});
const V = H.platform(pspec());
ok('a pueblo on a plinth comes back with no error', !V.error && V.records.length > 40, !!H.platform(pspec({ focus: 'piracy' })).error && !!H.platform(pspec({ plinth: null })).error,
  V.error || (V.records.length + ' records, ' + V.ladders.length + ' ladders, census ' + V.census.pop + ' people'));
const rooms = v => v.records.filter(r => r.storey != null);
const inPoly = H.inPoly, inside = (r, pts) => H.corners(H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d)).every(q => inPoly(pts, q[0], q[1]));
const rinside = v => rooms(v).every(r => inside(r, v.outline));
ok('every room stands inside the plinth\'s outline', rinside(V), !rinside(Object.assign({}, V, { records: V.records.concat([Object.assign({}, rooms(V)[0], { x: rooms(V)[0].x + 80 })]) })),
  rooms(V).length + ' rooms in ' + new Set(rooms(V).map(r => r.cell.join(','))).size + ' cells, up to ' + (Math.max(...rooms(V).map(r => r.storey)) + 1) + ' storeys');
const rectOf = r => H.rect(r.x, r.z, Math.cos(r.ry), -Math.sin(r.ry), r.w, r.d);
const overlaps = v => {
  const S = KSPACE.create({ cell: 16 }), out = [];
  v.records.forEach(r => S.insert(r, r.x, r.z, Math.hypot(r.w, r.d) / 2));
  v.records.forEach(a => S.query(a.x, a.z, Math.hypot(a.w, a.d) / 2).forEach(b => {
    if (a.id >= b.id) return;
    if ((a.holds && a.holds.includes(b.id)) || (b.holds && b.holds.includes(a.id))) return;
    if (!(a.y < b.y + b.h - 1e-6 && b.y < a.y + a.h - 1e-6)) return;
    if (H.overlap(rectOf(a), rectOf(b), -0.05)) out.push(a.id + '/' + b.id);
  }));
  return out;
};
ok('no two records overlap (plan and height, filed in core/space; a court holds its kivas)', overlaps(V).length === 0,
  overlaps(Object.assign({}, V, { records: V.records.concat([Object.assign({}, rooms(V)[3], { id: 'dup', x: rooms(V)[3].x + 1 })]) })).length > 0, overlaps(V).slice(0, 3).join(' '));
const cellOf = (v, i, j) => v.cells.find(c => c.i === i && c.j === j);
const doorsOk = v => rooms(v).every(r => {
  if (r.storey === 0) return r.entry === 'hatch' && !r.door;
  if (!r.door) return r.entry === 'hatch';
  const dx = Math.round((r.door.x - r.x) / (r.d / 2)), dz = Math.round((r.door.z - r.z) / (r.d / 2)), f = v.frame;
  const di = Math.round(dx * f.v[0] + dz * f.v[1]), dj = Math.round(dx * f.u[0] + dz * f.u[1]), n = cellOf(v, r.cell[0] + di, r.cell[1] + dj);
  return !!n && n.level === r.storey && n.ring < r.ring;
});
const doors = rooms(V).filter(r => r.door).length;
ok('no door at the ground: ground rooms by hatches; an upper door opens only inward onto a terrace at its floor',
  doorsOk(V) && rooms(V).filter(r => r.storey === 0).length > 10, !doorsOk(Object.assign({}, V, { records: [Object.assign({}, rooms(V).find(r => r.storey === 0), { door: { x: 0, z: 0, y: 0 }, entry: 'door' })] })),
  doors + ' terrace doors, ' + rooms(V).filter(r => r.storey === 0).length + ' ground rooms by hatch');
// the walk: from the foot by ladders, and between cells at one level that share a side
const walk = (v, ladders) => {
  const lv = {}, seen = { foot: true }, Q = ['foot'];
  v.cells.forEach(c => { lv['c:' + c.i + ':' + c.j] = c; });
  const adj = {}; const link = (a, b) => { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); };
  ladders.forEach(l => link(l.from, l.to));
  v.cells.forEach(c => [[1, 0], [0, 1]].forEach(d => { const n = lv['c:' + (c.i + d[0]) + ':' + (c.j + d[1])]; if (n && n.level === c.level) link('c:' + c.i + ':' + c.j, 'c:' + n.i + ':' + n.j); }));
  for (let h = 0; h < Q.length; h++) (adj[Q[h]] || []).forEach(n => { if (!seen[n]) { seen[n] = true; Q.push(n); } });
  return seen;
};
const reachAll = (v, L) => { const s = walk(v, L); return rooms(v).every(r => s['c:' + r.cell[0] + ':' + r.cell[1]]) && v.cells.every(c => s['c:' + c.i + ':' + c.j]); };
const maxLv = Math.max(...V.cells.map(c => c.level)), HS = rooms(V)[0].h;
const levelsOk = v => { for (let L = 1; L <= maxLv; L++) if (!v.ladders.some(l => Math.abs(l.top.y - (12 + L * HS)) < 1e-6)) return false; return true; };
const footL = V.ladders.filter(l => l.from === 'foot');
ok('ladders: one from the foot (at the foot\'s level) up to the top, one onto each storey, and every roof reached from the foot',
  footL.length >= 1 && footL.every(l => Math.abs(l.foot.y) < 1e-6 && l.top.y >= 12) && levelsOk(V) && reachAll(V, V.ladders),
  !reachAll(V, V.ladders.filter(l => l.from !== 'foot')) && !reachAll(V, V.ladders.filter((l, k) => k !== V.ladders.length - 1)),
  V.ladders.length + ' ladders, ' + footL.map(l => l.from + '>' + l.to + ' ' + l.rise.toFixed(1) + ' m in ' + l.stages).join(', '));
const penOk = (v, fy) => {
  const p = v.pen, path = v.paths.find(q => q.to === p.id), foot = v.ladders.find(l => l.from === 'foot');
  return Math.abs(p.y - (fy || 0)) < 1e-6 && H.polyOutside(v.outline, rectOf(p), 0) && !!path && Math.hypot(path.pts[0][0] - foot.foot.x, path.pts[0][1] - foot.foot.z) < 1e-6 &&
    Math.hypot(path.pts[1][0] - p.gate.x, path.pts[1][1] - p.gate.z) < 1e-6;
};
ok('the pen stands at the foot, outside the plinth, a path from the ladder\'s foot to its gate (and the court\'s kivas inside it)',
  penOk(V) && V.court && V.records.filter(r => r.sunk).every(r => r.court === V.court.id) && H.polyOutside(V.outline, rectOf(V.court), 0),
  !penOk(Object.assign({}, V, { pen: Object.assign({}, V.pen, { x: C0[0], z: C0[1] }) })),
  'pen ' + Math.round(Math.hypot(V.pen.x - C0[0], V.pen.z - C0[1])) + ' m from the middle; works: ' + V.records.filter(r => r.role === 'works').map(r => r.key).join(', '));
const sameJ = JSON.stringify(H.platform(pspec())) === JSON.stringify(V);
const DX = 500, DZ = 300, mv = p => [p[0] + DX, p[1] + DZ];
const Vm = H.platform(pspec({ plinth: { pts: box(72, 58, C0, ROT).map(mv), top: 12, foot: 0 }, link: { x: C0[0] + 300 + DX, z: C0[1] + 60 + DZ } }));
const stable = (a, b) => a.records.length === b.records.length && a.records.every((r, k) => { const q = b.records[k];
  return q.id === r.id && q.key === r.key && q.role === r.role && q.storey === r.storey && Math.abs(q.x - r.x - DX) < 1e-6 && Math.abs(q.z - r.z - DZ) < 1e-6; });
ok('the same spec gives the same village; moved 500 m, every record keeps its id, key, role and storey', sameJ && stable(V, Vm),
  JSON.stringify(H.platform(pspec({ world: 12 })).records) !== JSON.stringify(V.records) && !stable(V, H.platform(pspec({ world: 12 }))));
const tiny = H.platform(pspec({ plinth: { pts: box(14, 11, C0, 0), top: 8, foot: 0 } }));
let threw = false; try { H.platform(pspec({ plinth: { pts: [[0, 0], [1, 1]], top: 3 } })); H.platform(pspec({ plinth: { pts: box(30, 24, C0, 0), top: 8 } })); } catch (e) { threw = e; }
ok('a plinth too small gives an error, not an exception', !!tiny.error && /too small/.test(tiny.error) && !threw &&
  !!H.platform(pspec({ plinth: { pts: [[0, 0], [1, 1]], top: 3 } })).error, !V.error, tiny.error);
ok('no Kimr row: every record and ladder is pending, with the pending row\'s boxes', V.records.every(r => r.pending) && V.ladders.every(l => l.pending) &&
  V.pendingKeys.includes('kimr-room') && rooms(V).every(r => r.h === H.pendingRow('kimr').pending['kimr-room'].h),
  H.platform(pspec({ dims: k => k === 'kimr-room' ? { w: 5, d: 4, h: 2.6 } : null })).records.some(r => !r.pending), V.pendingKeys.join(' '));
// a village row's own census keys: Xanadu's farming works, the platform keys pending under its kit's name
const VX = H.platform(pspec({ id: 'xa-bench', culture: 'xanadu', dims: k => k.indexOf('xa_') === 0 ? { w: 10, d: 8, h: 5 } : null }));
const xw = VX.records.filter(r => r.role === 'works');
ok('a village row keeps its census and works; only the platform keys are pending (under its kit\'s name)', !VX.error && xw.length > 0 &&
  xw.every(r => r.key.indexOf('xa_') === 0 && !r.pending) && rooms(VX).every(r => r.key.indexOf('xanadu-') === 0 && r.pending),
  !xw.every(r => r.pending), VX.error || xw.map(r => r.key).join(', '));

// ---- a cliff dwelling: an alcove under an overhang, the ladder down the face to the pen
const aspec = o => Object.assign({ id: 'painted-ledge', world: 5, culture: 'painted', focus: 'ranch',
  alcove: { line: [[0, 0], [60, -6], [120, 0]], depth: 26, floor: 40, height: 6, foot: 10 }, link: { x: 60, z: 300 } }, o || {});
const A = H.platform(aspec());
const capOk = v => rooms(v).every(r => r.storey < 2);
ok('a cliff dwelling: rooms inside the alcove, two storeys under a 6 m overhang, its kivas in the plaza on the drip line',
  !A.error && rinside(A) && capOk(A) && A.records.filter(r => r.sunk).length === 2 && !A.court && overlaps(A).length === 0 && doorsOk(A),
  !capOk({ records: [Object.assign({}, rooms(A)[0], { storey: 2 })] }),
  A.error || (rooms(A).length + ' rooms, ' + A.records.filter(r => r.sunk).length + ' kivas'));
const aFoot = A.ladders.filter(l => l.from === 'foot');
ok('the ladder down the face: from the foot (10 m) to the ledge (40 m), staged; the pen below the lip, every roof reached',
  aFoot.length === 1 && Math.abs(aFoot[0].foot.y - 10) < 1e-6 && Math.abs(aFoot[0].top.y - 40) < 1e-6 && aFoot[0].stages >= 4 && penOk(A, 10) && reachAll(A, A.ladders) && A.pen.z > 20,
  !!H.platform(aspec({ alcove: { line: [[0, 0], [60, -6], [120, 0]], depth: 26, floor: 40, height: 2, foot: 10 } })).error,
  aFoot.map(l => l.rise + ' m, ' + l.stages + ' flights').join('') + '; pen at z ' + Math.round(A.pen.z));

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
