// node core/terrain/test-cavern.js — the cavern module's contract (kits/zeijani/PLAN.md section 7), each check with a
// negative control: a broken input that the same check must fail. No node here: tools/node_in_chromium.py runs it.
'use strict';
const fs = require('fs'), path = require('path');
if (typeof window === 'undefined') global.window = global;
eval(fs.readFileSync(path.join(__dirname, '..', 'rand', '08-core-rand.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '..', 'walk', '20-core-walk.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '39-core-cavern.js'), 'utf8'));
let bad = 0;
const ok = (name, pass, neg) => { const r = pass && !neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (neg ? ' (its negative passed)' : '')); };

// ---- the test block: a braided tube into a bottle hall under a light well; house1 (a domed room down a stair from the
// tube, an air shaft to the sky, a carved bench); house2 next door, 1.5 m of rock away; a monolith left in the hall
const ground = (x, z) => 30 + 0.02 * x;
function block(o) {
  o = o || {};
  const W = KWALK.create(), C = KCAVERN.create({ ground, cell: 0.5, chunk: 16, seed: 7, walk: W });
  C.tube({ id: 'T1', owner: 'braid', pts: [[-40, 10, 0], [-10, 10.5, 0], [21, 11, 8]], w: 8, h: 7, ledge: { v: 2.5, d: 0.6 }, blend: 3 });
  C.hall({ id: 'H', owner: 'braid', c: [30, 11, 10], rx: 12, rz: 10, h: 14, throat: { r0: 4, r1: 5, top: 32 } });
  C.opening({ id: 'well', c: [30, 10], r: 5.5, rim: 3 });
  C.monolith({ id: 'M', owner: 'braid', poly: [[32.5, 10.5], [35.5, 10.5], [35.5, 13.5], [32.5, 13.5]], y0: 11, y1: 16 });
  C.room({ id: 'R1', owner: 'house1', poly: KCAVERN_circle(-20, -12, 3, 16), y: 12.2, h: 2.6, ceil: 'dome', rise: 0.8, finish: 'polished' });
  C.stair({ id: 'S1', owner: 'house1', joins: ['T1', 'R1'], a: [-20, 10.4, -2.5], b: [-20, 12.2, -9.4], w: 1.4, h: 2.4 });
  C.shaft({ id: 'V1', owner: 'house1', joins: ['R1'], c: [-20, -12], y0: 14, y1: 31, r0: 0.5 });
  C.opening({ id: 'vent', c: [-20, -12], r: 0.8, rim: 1 });
  C.fixture({ id: 'bench', owner: 'house1', box: [-22.6, -21.8, -13, -11, 12.2, 12.65], tag: 'cavern:bench' });
  const dx = o.nudge || 0;
  C.room({ id: 'R2', owner: 'house2', poly: [[-15.5 + dx, -14], [-11.5 + dx, -14], [-11.5 + dx, -10], [-15.5 + dx, -10]], y: 12.2, h: 2.5, ceil: 'vault', rise: 0.6, r: 0.4 });
  if (o.tooClose) C.room({ id: 'R3', owner: 'house3', poly: [[-11.1, -14], [-8, -14], [-8, -10], [-11.1, -10]], y: 12.2, h: 2.5 });
  if (o.leak) C.shaft({ id: 'V9', owner: 'house2', c: [-13.5, -12], y0: 14, y1: 31, r0: 0.4 });
  C.build();
  return { C, W };
}
function KCAVERN_circle(cx, cz, r, n) { const P = []; for (let i = 0; i < n; i++) { const a = i * Math.PI * 2 / n; P.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } return P; }

const A = block(), Ameshes = A.C.meshAll();
const tris = Ameshes.reduce((s, m) => s + m.idx.length / 3, 0);
console.log('test block: ' + A.C.chunks.length + ' chunks listed, ' + Ameshes.length + ' with surface, ' + tris + ' triangles; hash ' + KCAVERN.hash(Ameshes));

// 1 determinism
const B = block(), Bm = B.C.meshAll(), N1 = block({ nudge: 0.01 }), N1m = N1.C.meshAll();
ok('determinism: the same plan meshes to the same hash', KCAVERN.hash(Ameshes) === KCAVERN.hash(Bm), KCAVERN.hash(N1m) === KCAVERN.hash(Ameshes));

// 2 watertight chunks with matching seams: weld every chunk's vertices; every edge is used by exactly two triangles,
// except the ground's surface at an opening's rim, where the host's hole takes over
function openEdges(meshes, C) {
  const vid = new Map(), E = new Map(), T = new Set(); let nv = 0, dup = 0;
  const key = (m, i) => { const k = Math.round(m.pos[i * 3] * 1e4) + ',' + Math.round(m.pos[i * 3 + 1] * 1e4) + ',' + Math.round(m.pos[i * 3 + 2] * 1e4); let v = vid.get(k); if (v === undefined) { v = nv++; vid.set(k, v); } return v; };
  meshes.forEach(m => { for (let t = 0; t < m.idx.length; t += 3) { const a = key(m, m.idx[t]), b = key(m, m.idx[t + 1]), c = key(m, m.idx[t + 2]);
    const tk = [a, b, c].sort((p, q) => p - q).join(':'); if (T.has(tk)) dup++; else T.add(tk);
    [[a, b], [b, c], [c, a]].forEach(([p, q]) => { const k = p < q ? p + ':' + q : q + ':' + p; E.set(k, (E.get(k) || 0) + 1); }); } });
  let over = 0, overAt = [], open = [], pts = [...vid.keys()].map(k => k.split(',').map(Number).map(v => v / 1e4));
  E.forEach((n, k) => { if (n > 2) { over++; overAt.push(pts[+k.split(':')[0]].map(v => v.toFixed(1)).join(' ')); } if (n === 1) { const [p] = k.split(':').map(Number); open.push(pts[p]); } });
  const stray = open.filter(p => !C.openings.some(Q => { const d = Math.hypot(p[0] - Q.c[0], p[2] - Q.c[1]); return d > Q.r + Q.rim - 1 && d < Q.r + Q.rim + 2.5; }));
  return { over, overAt, open: open.length, stray: stray.length, dup, edges: E.size };
}
const wt = openEdges(Ameshes, A.C), half = Math.floor(Ameshes.length / 2);
const dropped = openEdges(Ameshes.filter((m, i) => i !== half), A.C), doubled = openEdges(Ameshes.concat([Ameshes[half]]), A.C);
console.log('  edges: ' + wt.edges + '; ' + wt.open + ' open (all at an opening\'s rim: ' + (wt.stray === 0) + '), ' + wt.dup + ' duplicate triangles, ' + wt.over +
  ' non-manifold (a surface-nets cell holding two sheets of a sliver thinner than a cell)' + (wt.over ? ': ' + wt.overAt.slice(0, 4).join(' | ') : ''));
ok('watertight: no hole but the openings\' rims (a chunk left out: holes)', wt.stray === 0 && wt.open > 0, dropped.stray === 0);
ok('matching seams: no triangle meshed by two chunks (a chunk meshed twice: duplicates)', wt.dup === 0, doubled.dup === 0);
const twice = openEdges(Ameshes.concat(Ameshes), A.C);
ok('non-manifold edges under 0.1% of all edges (the whole mesh twice over: every edge four times)', wt.over <= wt.edges * 0.001, twice.over <= twice.edges * 0.001);

// 3 the walk floors within 0.15 m of the meshed floor: a ray down through the meshes at points on every floor
function meshFloorBelow(meshes, x, y, z) {
  let best = null;
  meshes.forEach(m => { for (let t = 0; t < m.idx.length; t += 3) { const P = [0, 1, 2].map(k => m.idx[t + k]);
    const ax = m.pos[P[0] * 3], az = m.pos[P[0] * 3 + 2], bx = m.pos[P[1] * 3], bz = m.pos[P[1] * 3 + 2], cx = m.pos[P[2] * 3], cz = m.pos[P[2] * 3 + 2];
    const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
    const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d, l3 = 1 - l1 - l2;
    if (l1 < 0 || l2 < 0 || l3 < 0) continue;
    const yy = l1 * m.pos[P[0] * 3 + 1] + l2 * m.pos[P[1] * 3 + 1] + l3 * m.pos[P[2] * 3 + 1];
    if (yy <= y + 0.3 && (best === null || yy > best)) best = yy; } });
  return best;
}
function floorSamples(W) {
  const out = [];
  W.floors.forEach(f => {
    if (f.kind === 'strip') for (const t of [0.25, 0.5, 0.75]) out.push({ f, x: f.a[0] + (f.b[0] - f.a[0]) * t, z: f.a[1] + (f.b[1] - f.a[1]) * t, y: f.a[2] + (f.b[2] - f.a[2]) * t });
    else if (f.kind === 'poly') { let x = 0, z = 0; f.pts.forEach(p => { x += p[0]; z += p[1]; }); x /= f.pts.length; z /= f.pts.length; out.push({ f, x, z, y: W.heightOn(f, x, z) });
      out.push({ f, x: (x * 2 + f.pts[0][0]) / 3, z: (z * 2 + f.pts[0][1]) / 3, y: W.heightOn(f, (x * 2 + f.pts[0][0]) / 3, (z * 2 + f.pts[0][1]) / 3) }); }
  });
  return out;
}
const S3 = floorSamples(A.W), off = S3.map(s => { const m = meshFloorBelow(Ameshes, s.x, s.y, s.z); return { s, d: m === null ? 1e9 : Math.abs(m - s.y) }; });
const worst = off.reduce((a, b) => b.d > a.d ? b : a);
const liar = KWALK.create(); liar.poly({ pts: A.W.floors.find(f => f.name === 'R1').pts.map(p => [p[0], p[1], p[2] + 0.4]), name: 'R1 too high' });
const liarOff = floorSamples(liar).map(s => Math.abs((meshFloorBelow(Ameshes, s.x, s.y, s.z) || -1e9) - s.y));
console.log('  ' + S3.length + ' floor samples; the worst is ' + worst.d.toFixed(3) + ' m (' + worst.s.f.name + ')');
ok('the walk floors lie within 0.15 m of the meshed floor', worst.d <= 0.15, liarOff.every(d => d <= 0.15));

// 4 rock at least minRock thick between different buildings' voids (joined voids excepted), and to the sky
function thin(C) {
  const out = [];
  C.prims.forEach(P => C.prims.forEach(Q => {
    if (P === Q || P.owner === Q.owner || P.kind === 'monolith' || Q.kind === 'monolith') return;
    if ((P.joins || []).indexOf(Q.id) >= 0 || (Q.joins || []).indexOf(P.id) >= 0) return;
    const t = C.thickness(P.id, Q.id); if (t < C.minRock) out.push(P.id + '/' + Q.id + ' ' + t.toFixed(2));
  }));
  C.prims.forEach(P => { if (P.kind === 'monolith') return; const r = C.roof(P.id); if (r < C.minRock) out.push(P.id + '/sky ' + r.toFixed(2)); });
  return out;
}
const thinA = thin(A.C), thinB = thin(block({ tooClose: true }).C);
console.log('  thickness R1/R2 ' + A.C.thickness('R1', 'R2').toFixed(2) + ' m, R2/T1 ' + A.C.thickness('R2', 'T1').toFixed(2) + ' m, R1 to the sky ' + A.C.roof('R1').toFixed(2) + ' m' + (thinB.length ? '; the negative: ' + thinB.join(', ') : ''));
ok('rock at least 0.8 m between different buildings\' voids and to the sky', thinA.length === 0, thinB.length === 0);

// 5 no void open to the sky except at a declared opening
const leaks = A.C.skyLeaks(0.5), leaksB = block({ leak: true }).C.skyLeaks(0.5);
ok('no void meets the sky outside an opening (the light well and the vent are declared)', leaks.length === 0, leaksB.length === 0);

// 6 the queries
const C = A.C, fyT = 10 + (10.5 - 10) * (10 / 30);
ok('sdf: open inside the tube, rock beside it', C.sdf(-30, 12, 0) > 0.5 && C.sdf(-30, 12, 6) < 0, C.sdf(-30, 12, 0) < 0);
ok('inRock and voidSD agree with sdf', C.inRock(-30, 12, 9) && !C.inRock(30, 15, 10) && C.voidSD(30, 15, 10) < 0, C.inRock(30, 15, 10));
const ct = C.ceilingAt(-30, 0, fyT + 1);
ok('ceilingAt: the tube\'s crown over its floor (7 m)', ct !== null && Math.abs(ct - (fyT + 7)) < 0.3, ct === null || Math.abs(ct - fyT) < 0.3);
ok('ceilingAt: under the vent the sky (null); under the dome its crown', C.ceilingAt(-20, -12, 13) === null && (c => c > 14.75 && c < 15.65)(C.ceilingAt(-19.2, -11.9, 13)), C.ceilingAt(-25, -12, 13) === null);
ok('ownerAt names the void', C.ownerAt(-20, 13, -12) === 'R1' && C.ownerAt(-30, 12, 0) === 'T1', C.ownerAt(-30, 12, 0) === 'R1');
ok('holeAt: the light well\'s hole, nowhere else', !!C.holeAt(30, 10) && !C.holeAt(0, 0), !!C.holeAt(0, 0));
// the floors went to the walk registry as the plan was built: the tube's strips, the hall, the rooms, the stair, the blocks
const W = A.W;
ok('the plan wrote its floors and blocks to core/walk', W.floors.filter(f => f.tag === 'cavern:tube').length === 2 && W.floorsAt(30, 10).length === 1 &&
  W.floorBelow(-20, -12, 12.3)[1].name === 'R1' && W.blocked(-22.2, 12.2, -12) !== null && W.blocked(34, 11, 12) !== null, W.floorsAt(0, 30).length > 0);
ok('the stair is a rising strip from the tube to the room', Math.abs(W.floorsAt(-20, -6)[0][0] - (10.4 + 1.8 * (3.5 / 6.9))) < 0.05, W.floorsAt(-20, -6).length === 0);
// the meshes carry their attributes
const m0 = Ameshes.find(m => m.idx.length > 300), nV = m0.pos.length / 3;
ok('every vertex carries its normal, occlusion, weights, rare hue, material and ground flag', m0.nrm.length === nV * 3 && m0.occ.length === nV && m0.w.length === nV * 4 && m0.mat.length === nV && m0.ground.length === nV &&
  [...m0.occ].every(v => v >= 0.25 && v <= 1) && [...m0.w].every(v => v >= 0 && v <= 1), [...m0.occ].some(v => isNaN(v)));
const mats = new Set(); Ameshes.forEach(m => m.mat.forEach(v => mats.add(KCAVERN.MATS[v])));
ok('materials: basalt for the braid and the hall, tuff for the houses (hewn, polished)', mats.has('basalt-raw') && mats.has('tuff-hewn') && mats.has('tuff-polished'), !mats.has('basalt-raw'));
const lined = Ameshes.reduce((s, m) => { for (let i = 0; i < m.w.length; i += 4) if (m.w[i] > 0.9) s++; return s; }, 0), broken = Ameshes.reduce((s, m) => { for (let i = 0; i < m.w.length; i += 4) if (m.w[i + 1] > 0.9) s++; return s; }, 0);
ok('the lining low on the walls, the breakdown above it', lined > 100 && broken > 100, lined === 0);
const ex = C.export();
ok('the plan exports as krator-cavern JSON', ex.format === 'krator-cavern' && ex.prims.length === 7 && ex.openings.length === 2 && JSON.parse(JSON.stringify(ex)).prims[0].pts.length === 3, ex.prims.length === 0);
// the plan refuses what it cannot carve
let threw = false; try { KCAVERN.create({ ground }).tube({ id: 'x', pts: [[0, 0, 0]], w: 4, h: 4 }); } catch (e) { threw = true; } ok('a tube of one point is refused', threw, false);
threw = false; try { const D = KCAVERN.create({ ground }); D.room({ id: 'a', poly: [[0, 0], [1, 0], [1, 1]], y: 0, h: 2 }); D.room({ id: 'a', poly: [[0, 0], [1, 0], [1, 1]], y: 0, h: 2 }); } catch (e) { threw = true; } ok('a duplicate id is refused', threw, false);
console.log(bad ? bad + ' FAILED' : 'all passed'); process.exit(bad ? 1 : 0);
