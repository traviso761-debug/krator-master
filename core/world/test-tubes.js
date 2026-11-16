// node core/world/test-tubes.js: the open world's caverns (42k-world-caverns.js, WTUBES) on a made-up ground: rolling hills rising
// east, a gully across, two tubes (T1 with two portals, a hall with its roof crack, chokes and skylights drawn by cell; T2 with one
// portal and a spec skylight). Each claim has its negative (tools/ktest.js): the records are the same planned again, in any order
// and beside any other tube; every tube meets the surface where the spec says; the floor and the roof stay under the ground between
// the openings, and KCAVERN's own field agrees; the ground opens only at the openings; the squares' meshes meet at their seams;
// a walker goes in at one portal, along the floor, and out at the other, and is stopped by the wall.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
if (typeof window === 'undefined') global.window = global;
const ROOT = path.join(__dirname, '..', '..');
for (const f of ['core/rand/08-core-rand.js', 'core/terrain/39-core-cavern.js', 'core/world/42k-world-caverns.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const T = require('../../tools/ktest.js')(__filename);

// ---------------------------------------------------------------- the made-up world: 2 km a pixel, px 100,100 at the origin
const fromPx = (px, py) => [(px - 100) * 2000, (py - 100) * 2000];
const H = (x, z) => 1200 + .03 * x + 40 * Math.sin(x / 700) * Math.cos(z / 900) + 6 * Math.sin((x + z) / 260) - 30 * Math.exp(-Math.pow((x - 4000) / 90, 2));
const ground = WTUBES.drawnGround((x, z) => H(x, z));
const SPEC = () => [
  { id: 'T1', name: 'the long tube', px: [[100, 100], [102, 100.5], [104, 100]], seg: [{ w: 16, h: 12 }, { w: 20, h: 15 }], depth: 40,
    open: [{ kind: 'portal', at: 'start', name: 'west portal' }, { kind: 'portal', at: 'end', name: 'east portal' }],
    halls: [{ px: [102, 100.5], name: 'the hall', rx: 30, rz: 20, h: 18, skylight: { r: 2.5, name: 'the roof crack' } }],
    chokes: { every: 2500, p: .9, w: 3.5, h: 4.5, len: [48, 72] }, skylights: { every: 2000, p: .9, r: [3, 5] } },
  { id: 'T2', name: 'the short tube', px: [[100, 103], [103, 103]], seg: { w: 14, h: 11 }, depth: 35,
    open: [{ kind: 'portal', at: 'start', name: 'its one portal' }, { kind: 'skylight', at: [102, 103], r: 4, name: 'its skylight' }] },
  { id: 'T3', name: 'the branch', px: [[101.2, 102.3], [101.7, 101.4], [102, 100.5]], seg: { w: 12, h: 10 }, depth: 32, join: { tube: 'T1', at: 'end' },
    open: [{ kind: 'portal', at: 'start', name: 'the branch portal' }] }];
const plan = (spec, seed) => WTUBES.plan(spec, { ground, fromPx, seed: seed == null ? 4242 : seed });
const clone = P => WTUBES.bind(JSON.parse(JSON.stringify(P)), { ground });
const P = plan(SPEC()), h0 = WTUBES.hash(P), T1 = P.tubes[0], T2 = P.tubes[1], T3 = P.tubes[2];
const checks = Q => WTUBES.check(Q, { ground, fromPx });
const named = (Q, key) => checks(Q).find(r => r.name.indexOf(key) >= 0);

// ---------------------------------------------------------------- the ground as drawn
{ const g0 = ground(200, 300), g1 = ground(201, 300.5), lin = (ground(200, 300) + ground(202, 300)) / 2;
  T.ok('the drawn ground is the lattice\'s heights at its points', Math.abs(g0 - H(200, 300)) < 1e-9, g0 - H(200, 300));
  T.ok('and the cell\'s triangle between them (the terrain\'s diagonal)', Math.abs(ground(201, 300) - lin) < 1e-9 && isFinite(g1)); }

// ---------------------------------------------------------------- determinism
const one = (Q, id) => WTUBES.hash({ tubes: Q.tubes.filter(t => t.id === id) });
T.neg('the records are the same planned again (a plan of another world seed differs)', Q => WTUBES.hash(Q) === h0, plan(SPEC(), 4243), plan(SPEC()));
T.ok('the records do not hang on the spec\'s order (a branch listed before the tube it joins)', ['T1', 'T2', 'T3'].every(id => one(plan(SPEC().reverse()), id) === one(P, id)));
T.ok('a tube\'s records do not change when another is added', one(plan([SPEC()[0]]), 'T1') === one(P, 'T1'));
T.ok('the chokes and skylights are drawn (by cell)', T1.sec.some(s => s.kind === 'choke') && T1.open.some(O => O.kind === 'skylight' && !O.name),
  T1.sec.filter(s => s.kind === 'choke').length + ' chokes, ' + T1.open.filter(O => O.kind === 'skylight').length + ' skylights');

// ---------------------------------------------------------------- the checks on the plan, each with its fault
const R = checks(P);
R.forEach(r => T.ok('check: ' + r.name, r.ok, r.detail));
const noOpen = SPEC(); noOpen[1].open = [];
T.neg('a tube with no opening is caught', spec => named(plan(spec), 'meets the surface').ok, noOpen, SPEC());
const raised = clone(P), mid = raised.tubes[0].st[7 * Math.floor(raised.tubes[0].st.length * .3 / 7)]; mid[2] = mid[3] + 3;
T.neg('a tube floor above the ground between openings is caught', Q => named(Q, 'floor under the ground').ok, raised, P);
const thin = clone(P), mt = thin.tubes[0].st[7 * Math.floor(thin.tubes[0].st.length * .3 / 7)]; mt[2] = mt[3] - 10;   /* the roof 2 m over the ground */
T.neg('a roof short of the cover between openings is caught', Q => named(Q, 'roof under the ground').ok, thin, P);
const moved = clone(P), pe = moved.tubes[0].open.find(O => O.kind === 'portal' && O.i > 0); pe.i = Math.floor(moved.tubes[0].st.length / 2);
T.neg('an opening away from where the spec puts it is caught', Q => named(Q, 'where the spec puts it').ok, moved, P);
const steep = clone(P), sp = steep.tubes[0].st, si = Math.floor(sp.length * .45); sp[si][2] -= 9;
T.neg('a floor over its grade is caught', Q => named(Q, 'keeps its grade').ok, steep, P);
const offJoin = clone(P), oj = offJoin.tubes[2]; oj.st[oj.join.i][2] += 4;
T.neg('a branch whose floor misses the tube it joins is caught', Q => named(Q, 'joined tube').ok, offJoin, P);
T.ok('the branch ends on the hall\'s station, on its floor', T3.join && T3.join.tube === 'T1' && T3.join.j === T1.halls[0].i
  && T3.st[T3.st.length - 1][2] === T1.st[T1.halls[0].i][2], JSON.stringify(T3.join));
{ let threw = ''; try { plan([SPEC()[2]]); } catch (e) { threw = e.message; }
  T.ok('a branch joined to a tube not in the spec is refused', /not in the spec/.test(threw), threw); }
{ const [x0, z0] = fromPx(100, 100), s = T1.st[0], O = T1.open[0];
  T.ok('the west portal is where the spec puts it, its floor at the ground', s[0] === x0 && s[1] === z0 && O.kind === 'portal' && O.i === 0 && Math.abs(s[2] - ground(s[0], s[1])) < .5); }

// ---------------------------------------------------------------- KCAVERN's own field agrees with the records
const between = Q => { const t = Q.tubes[0], wv = new Uint8Array(t.st.length); t.open.forEach(O => { for (let i = O.a; i <= O.b; i++) wv[i] = 1; });
  const bad = []; for (let i = 0; i < t.st.length; i += 7) { if (wv[i]) continue; const s = t.st[i], gy = ground(s[0], s[1]);
    if (!(WTUBES.voidAt(Q, s[0], gy - 2, s[1]) > 0)) bad.push(i); if (!(WTUBES.voidAt(Q, s[0], s[2] + 1.5, s[1]) < 0)) bad.push('floor ' + i); } return bad; };
T.neg('KCAVERN: the rock holds 2 m under the ground between the openings, the void over the floor', Q => between(Q).length === 0, thin, P);
T.ok('KCAVERN: at each portal the void reaches the ground (open air at the mouth)', P.tubes.every(t => t.open.filter(O => O.kind === 'portal').every(O => {
  const s = t.st[O.i]; return WTUBES.voidAt(P, s[0], ground(s[0], s[1]) + .2, s[1]) < 0; })));
T.ok('KCAVERN: each skylight\'s shaft is open at the ground', P.tubes.every(t => t.open.filter(O => O.kind === 'skylight').every(O => {
  const c = O.shaft.c; return WTUBES.voidAt(P, c[0], ground(c[0], c[1]) - .5, c[1]) < 0; })));

// ---------------------------------------------------------------- the ground opens at the openings and only there
const holes = Q => Q.tubes.every(t => t.open.every(O => { const s = O.kind === 'portal' ? t.st[O.i] : O.shaft.c; return !!WTUBES.holeAt(Q, s[0], s[1]); }));
const noHoles = clone(P); noHoles.tubes.forEach(t => t.open.forEach(O => { O.holes = []; }));
T.neg('every opening holds a hole in the ground', holes, noHoles, P);
{ const t = T1, wv = new Uint8Array(t.st.length); t.open.forEach(O => { for (let i = O.a; i <= O.b; i++) wv[i] = 1; });
  const stray = []; for (let i = 0; i < t.st.length; i += 3) if (!wv[i] && WTUBES.holeAt(P, t.st[i][0], t.st[i][1])) stray.push(i);
  T.ok('no hole between the openings', !stray.length, stray.slice(0, 5).join(', ')); }

// ---------------------------------------------------------------- the squares: their meshes, the ground drawn only in the holes, the seams
const S = P.square, keyOf = (x, z) => Math.floor(x / S) + ',' + Math.floor(z / S);
{ const s = T1.st[0], C = WTUBES.cavern(P, keyOf(s[0], s[1])); let rock = 0, gnd = 0, stray = 0;
  C.own.forEach(k => { const m = C.meshChunk(k); for (let t = 0; t < m.idx.length; t += 3) { const a = m.idx[t];
    if (m.prim[a] === 65535) { gnd++; const x = m.pos[a * 3] + C.origin[0], z = m.pos[a * 3 + 2] + C.origin[2]; if (!WTUBES.holeAt(P, x, z) && !WTUBES.holeAt(P, x + 3, z) && !WTUBES.holeAt(P, x - 3, z) && !WTUBES.holeAt(P, x, z + 3) && !WTUBES.holeAt(P, x, z - 3)) stray++; } else rock++; } });
  T.ok('the portal\'s square draws the rock and, in its holes only, the ground', rock > 500 && gnd > 100 && stray === 0, rock + ' rock, ' + gnd + ' ground, ' + stray + ' ground outside a hole'); }
{ const i = T1.open.find(O => O.kind === 'skylight' && !O.name) ? 0 : 0, s = T1.st[Math.floor(T1.st.length * .3)], C = WTUBES.cavern(P, keyOf(s[0], s[1])); let rock = 0, gnd = 0;
  C.own.forEach(k => { const m = C.meshChunk(k); for (let t = 0; t < m.idx.length; t += 3) (m.prim[m.idx[t]] === 65535 ? gnd++ : rock++); });
  T.ok('a square between the openings draws rock and no ground', rock > 500 && gnd === 0 + i, rock + ' rock, ' + gnd + ' ground'); }
{ // two squares side by side along T1: every vertex B computes in its low apron (the cells it shares with A) is one A computes too
  const s = T1.st[Math.floor(T1.st.length * .3)], ka = keyOf(s[0], s[1]), [ia, kk] = ka.split(',').map(Number);
  let A = null, B = null;
  for (const [di, dk] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const kb = (ia + di) + ',' + (kk + dk); if (!WTUBES.squares(P).has(kb)) continue;
    const lo = di + dk > 0; A = WTUBES.cavern(P, lo ? ka : kb); B = WTUBES.cavern(P, lo ? kb : ka); B.axis = di ? 0 : 2; break; }
  const verts = (C, keep) => { const out = []; C.own.forEach(k => { const m = C.meshChunk(k); for (let v = 0; v < m.pos.length / 3; v++) { const w = [m.pos[v * 3] + C.origin[0], m.pos[v * 3 + 1], m.pos[v * 3 + 2] + C.origin[2]]; if (keep(w)) out.push(w); } }); return out; };
  const ax = B.axis, edge = B.origin[ax], vb = verts(B, w => w[ax] > edge - 1 && w[ax] < edge), va = verts(A, w => w[ax] > edge - 1 && w[ax] < edge);
  const miss = vb.filter(p => !va.some(q => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) < 1e-4));
  T.ok('two squares\' meshes meet at their seam (one lattice, the same field)', vb.length > 10 && !miss.length, vb.length + ' seam vertices, ' + miss.length + ' unmatched'); }

// ---------------------------------------------------------------- the walker: in at the west portal, along the floor, out at the east
const walkLine = (Q, t, inside) => { const st = t.st, n = st.length, e = (a, b) => [a[0] + (a[0] - b[0]) * 1.5, a[1] + (a[1] - b[1]) * 1.5];
  const pts = [e(st[0], st[1])].concat(st.map(s => [s[0], s[1]]), inside ? [] : [e(st[n - 1], st[n - 2])]);
  let feet = ground(pts[0][0], pts[0][1]), blocked = 0, jump = 0, tube = 0, kinds = '', last = 0, from = pts[0];
  for (let i = 0; i < pts.length - 1; i++) { const A = pts[i], B = pts[i + 1], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    for (let s = 0; s < L; s += 2) { const x = A[0] + (B[0] - A[0]) * s / L, z = A[1] + (B[1] - A[1]) * s / L, gy = ground(x, z), w = WTUBES.walk(Q, x, z, feet, gy, from);
      if (!w) { blocked++; continue; } jump = Math.max(jump, Math.abs(w.y - feet)); if (w.kind === 'tube') tube++; if (kinds.slice(-1) !== w.kind[0]) kinds += w.kind[0]; feet = w.y; last = gy; from = [x, z]; } }
  return { blocked, jump, tube, kinds, end: feet - last, feet }; };
{ const w = walkLine(P, T1);
  T.ok('the walker goes in at the west portal, along the floor, and out at the east', w.blocked === 0 && w.kinds === 'gtg' && Math.abs(w.end) < 1e-9 && w.tube > 1000 && w.jump < 2.5,
    JSON.stringify(w)); }
{ const w = walkLine(P, T3, true), hy = T1.st[T1.halls[0].i][2];
  T.ok('the walker goes in at the branch portal and along it onto the hall\'s floor', w.blocked === 0 && w.kinds === 'gt' && w.tube > 50 && w.jump < 2.5 && Math.abs(w.feet - hy) < .75,
    JSON.stringify(w) + ', the hall floor ' + hy); }
{ const s = T1.st[Math.floor(T1.st.length * .3)], q = T1.st[Math.floor(T1.st.length * .3) + 1], l = Math.hypot(q[0] - s[0], q[1] - s[1]), px = -(q[1] - s[1]) / l, pz = (q[0] - s[0]) / l;
  const feet = s[2], at = d => [s[0] + px * d, s[1] + pz * d];
  T.neg('the walker is stopped by the tube\'s wall', p => WTUBES.walk(P, p[0], p[1], feet, ground(p[0], p[1])) !== null, at(14), at(0));
  const top = ground(s[0], s[1]), w = WTUBES.walk(P, s[0], s[1], top, top);
  T.ok('on the ground over the tube the walker keeps to the ground', w && w.kind === 'ground' && w.y === top);
  /* the terrain's detail changing under a walker far from any tube can lift its ground by metres in a frame: that is still the
     ground, since it came from no tube floor (without where it came from, the walk reads it as a wall) */
  const fx = 6000, fz = 9000, fg = ground(fx, fz);
  T.neg('a ground that jumps away from the tubes is still walked (the walker came from no tube)', from => { const r = WTUBES.walk(P, fx, fz, fg - 5, fg, from); return r && r.kind === 'ground'; },
    undefined, [fx - 2, fz]); }
T.done();
