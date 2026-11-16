// node core/city/test-squares.js [--write] — the nested-squares site (35-city-squares.js) on Qiblai's numbers
// (kits/qiblai/PLAN.md section 3), each check with a negative that must fail: the records are plain and their ids
// unique; the grid is strict (96 m blocks, 12 m streets, a 108 m pitch, 15 x 15, true north); no block reaches a
// street, a wall or a tower; every ring walled with four gates on its avenues and no street through a wall; the
// terraces one to three 2 m steps above the ring outside, built up and never cut; the kora's chortens, the eight
// monasteries one a spoke, the four gate markets; the plan's hash is golden-squares.json's (--write rewrites it);
// then the site laid on an instance and its blocks filled by frontage-courts: no overlap, nothing on a street, a
// wall or a tower, every house in its block, at its ring's level, none fronting its wall.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
fs.readdirSync(__dirname).filter(f => /^\d\d-city-.*\.js$/.test(f) && !/host/.test(f)).sort().forEach(f => load('core/city/' + f));
const WRITE = process.argv.includes('--write');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const Q = KCITY.squares;
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h.toString(16); };

// ---------------------------------------------------------------- 1. the records: plain, unique ids
const S = Q.plan({ id: 'qb' });
const plain = o => { if (o === null || typeof o === 'string' || typeof o === 'boolean') return true; if (typeof o === 'number') return isFinite(o);
  if (Array.isArray(o)) return o.every(plain); if (typeof o === 'object') return Object.keys(o).every(k => o[k] !== undefined && plain(o[k])); return false; };
const ids = P => { const all = [P.landmark].concat(P.rings, P.blocks, P.ways, P.crossings, P.walls, P.terraces, P.monasteries, P.markets,
  [].concat.apply([], P.walls.map(W => W.gates.concat(W.towers, W.runs)))).map(r => r.id); return { n: all.length, uniq: new Set(all).size, pre: all.every(i => i.indexOf(P.id + ':') === 0) }; };
{ const I = ids(S), dup = ids(Object.assign({}, S, { blocks: S.blocks.concat([S.blocks[0]]) }));
  ok('the plan is plain records (numbers, strings, arrays: no function, no NaN), every id unique and under the plan\'s id',
    plain(S) && I.n === I.uniq && I.pre && KCITY.cur == null, !plain({ f: () => 0 }) && !plain({ x: NaN }) && dup.n !== dup.uniq, I.n + ' ids, made with no instance bound'); }

// ---------------------------------------------------------------- 2. Qiblai's numbers and the strict grid
{ const cells = S.rings.map(r => r.cells).join(), side = S.zone[1][0] - S.zone[0][0], core = 2 * S.rings[0].half;
  const small = Q.plan({ rings: KCITY.squares.RINGS.map((r, k) => Object.assign({}, r, { to: k + 1 })) });
  ok('Qiblai\'s numbers: 15 x 15 blocks of 96 m, 12 m streets, a 108 m pitch, the outer square ~1.6 km, ring 0 the central 3 x 3, ring 1 16 blocks, ring 2 24',
    S.n === 15 && S.block === 96 && S.street === 12 && S.pitch === 108 && side === 1608 && core === 312 && cells === '9,16,24,32,40,104' &&
    S.rings.map(r => r.kind).join() === 'temple,clergy,kora,lay,lay,lay' && S.blocks.length === 216 + 24,
    small.n !== 15, 'outer ' + side + ' m, ring 0 ' + core + ' m, cells ' + cells + ', ' + S.blocks.length + ' block records (the 24 axial ones halved by their avenues)'); }
const axisAligned = pts => pts.every((p, i) => !i || Math.abs(p[0] - pts[i - 1][0]) < 1e-9 || Math.abs(p[1] - pts[i - 1][1]) < 1e-9);
const inCell = b => { const x0 = b.a * 108 - 48, z0 = b.b * 108 - 48; return b.box[0] >= x0 - 1e-9 && b.box[2] <= x0 + 96 + 1e-9 && b.box[1] >= z0 - 1e-9 && b.box[3] <= z0 + 96 + 1e-9 && b.box[2] - b.box[0] > 20 && b.box[3] - b.box[1] > 20; };
{ const rot = p => [p[0] * 0.98 - p[1] * 0.2, p[0] * 0.2 + p[1] * 0.98];
  ok('the strict grid: every block in its own 96 m cell on the 108 m pitch, every way true north (each run along x or z), streets 12 m, avenues 24 m on the axes',
    S.blocks.every(b => inCell(b) && axisAligned(b.poly.concat([b.poly[0]]))) && S.ways.every(w => axisAligned(w.closed ? w.pts.concat([w.pts[0]]) : w.pts)) &&
    S.ways.every(w => w.w === (w.kind === 'avenue' ? 24 : 12)) && S.ways.filter(w => w.kind === 'avenue').every(w => w.pts.every(p => p[0] === 0 || p[1] === 0)),
    !S.ways.map(w => w.pts.map(rot)).every(axisAligned) && !inCell(Object.assign({}, S.blocks[0], { box: S.blocks[0].box.map(v => v + 20) })),
    S.ways.length + ' ways'); }

// ---------------------------------------------------------------- 3. nothing on a street, a wall or a tower
const segDist2 = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz, t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
// the distance from a box [x0, z0, x1, z1] to an axis-aligned run (0 when it crosses)
const boxSeg = (B, a, b) => { const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
  const dx = Math.max(0, B[0] - x1, x0 - B[2]), dz = Math.max(0, B[1] - z1, z0 - B[3]); return Math.hypot(dx, dz); };
const runs = w => { const P = w.closed ? w.pts.concat([w.pts[0]]) : w.pts, out = []; for (let i = 1; i < P.length; i++) out.push([P[i - 1], P[i]]); return out; };
// a run's carriageway: the run widened by w/2 across it, flat at an open way's ends (a closed ring's corners filled)
const runRect = (w, r) => { const e = w.closed ? w.w / 2 : 0, h = w.w / 2;
  return r[0][0] === r[1][0] ? [r[0][0] - h, Math.min(r[0][1], r[1][1]) - e, r[0][0] + h, Math.max(r[0][1], r[1][1]) + e] : [Math.min(r[0][0], r[1][0]) - e, r[0][1] - h, Math.max(r[0][0], r[1][0]) + e, r[0][1] + h]; };
const shrink = (B, t) => [B[0] + t, B[1] + t, B[2] - t, B[3] - t];
const boxBox = (A, B) => Math.min(A[2], B[2]) - Math.max(A[0], B[0]) > 1e-6 && Math.min(A[3], B[3]) - Math.max(A[1], B[1]) > 1e-6;
function clashes(P) {
  const boxes = P.blocks.map(b => b.box).concat([[P.landmark.x - P.landmark.hw, P.landmark.z - P.landmark.hd, P.landmark.x + P.landmark.hw, P.landmark.z + P.landmark.hd]]);
  let street = 0, wall = 0, tower = 0, block = 0;
  boxes.forEach((B, i) => {
    if (P.ways.some(w => runs(w).some(r => boxBox(B, runRect(w, r))))) street++;
    if (P.walls.some(W => W.segs.some(s => boxSeg(B, [s.ax, s.az], [s.bx, s.bz]) < W.thick / 2 - 1e-6))) wall++;
    if (P.walls.some(W => W.towers.some(t => boxBox(B, [t.x - t.size / 2, t.z - t.size / 2, t.x + t.size / 2, t.z + t.size / 2])))) tower++;
    for (let j = i + 1; j < boxes.length; j++) if (boxBox(B, boxes[j])) block++;
  });
  return { street, wall, tower, block };
}
{ const c = clashes(S), grown = Object.assign({}, S, { blocks: S.blocks.map(b => Object.assign({}, b, { box: [b.box[0] - 3, b.box[1] - 3, b.box[2] + 3, b.box[3] + 3] })) }), g = clashes(grown);
  ok('no block (nor the landmark) reaches a street\'s carriageway, a wall, a tower or another block',
    c.street + c.wall + c.tower + c.block === 0, g.street > 0 && g.wall > 0 && g.tower > 0, JSON.stringify(c) + '; every block grown 3 m: ' + JSON.stringify(g)); }

// ---------------------------------------------------------------- 4. the walls and the gates
const cross = (p, q, r, s) => { const d1 = [q[0] - p[0], q[1] - p[1]], d2 = [s[0] - r[0], s[1] - r[1]], den = d1[0] * d2[1] - d1[1] * d2[0]; if (Math.abs(den) < 1e-12) return null;
  const t = ((r[0] - p[0]) * d2[1] - (r[1] - p[1]) * d2[0]) / den, u = ((r[0] - p[0]) * d1[1] - (r[1] - p[1]) * d1[0]) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [p[0] + d1[0] * t, p[1] + d1[1] * t] : null; };
const throughWalls = P => { let n = 0; P.ways.filter(w => w.kind !== 'avenue').forEach(w => runs(w).forEach(r => P.walls.forEach(W => W.segs.forEach(s => { if (cross(r[0], r[1], [s.ax, s.az], [s.bx, s.bz])) n++; })))); return n; };
{ const last = S.walls[S.walls.length - 1], inner = S.walls.slice(0, -1);
  const gatesOk = S.walls.every(W => W.gates.length === 4 && W.gates.every(g => { const av = S.ways.find(w => w.id === g.way); return av && segDist2([g.x, g.z], av.pts[0], av.pts[1]) < 1e-6 && (g.x === 0 || g.z === 0); }));
  // each avenue passes every wall it meets at a gate, nowhere else
  const avOk = S.ways.filter(w => w.kind === 'avenue').every(av => S.walls.every(W => { const hits = W.segs.filter(s => cross(av.pts[0], av.pts[1], [s.ax, s.az], [s.bx, s.bz])); return hits.length === 0; }));
  const longer = Object.assign({}, S, { ways: S.ways.map(w => w.kind === 'cross' ? Object.assign({}, w, { pts: [w.pts[0], w.pts[1].map((v, i) => v + Math.sign(w.pts[1][i] - w.pts[0][i]) * 10)] }) : w) });
  ok('every ring walled on its outer face, four gates on the cardinal axes on their avenues (the avenues pass only there), no other street through a wall; inner walls low, the outer a full wall with corner and curtain towers',
    S.walls.length === 6 && gatesOk && avOk && throughWalls(S) === 0 && inner.every(W => W.h <= 5 && W.kind === 'inner' && W.towers.every(t => t.kind === 'gate')) &&
    last.kind === 'outer' && last.h >= 8 && last.towers.filter(t => t.kind === 'corner').length === 4 && last.towers.filter(t => t.kind === 'curtain').length > 8 && last.nodes.length === last.gates.length + last.towers.length - 8,
    throughWalls(longer) > 0, S.walls.map(W => W.towers.length).join('+') + ' towers; cross streets 10 m longer: ' + throughWalls(longer) + ' through a wall'); }

// ---------------------------------------------------------------- 5. the terraces: built up, never cut
const bumpy = (x, z) => -1900 + 18 * Math.sin(x / 400) + 12 * Math.cos(z / 300) + 0.004 * x;
{ const T = S.terraces, rises = T.map(t => t.rise), Sb = Q.plan({ h: bumpy }), Sz = Q.plan({ base: -1900 });
  let cut = 0, cutZ = 0, fillOnly = 0; const G = Q.ground(Sb, bumpy);
  for (let x = -830; x <= 830; x += 10) for (let z = -830; z <= 830; z += 10) {
    const y = Q.levelAt(Sb, x, z); if (y != null && y < bumpy(x, z) - 1e-9) cut++;
    const yz = Q.levelAt(Sz, x, z); if (yz != null && yz < bumpy(x, z) - 1e-9) cutZ++;
    if (G(x, z) < bumpy(x, z) - 1e-9) fillOnly++; }
  ok('the terraces: each ring one to three 2 m steps (2-6 m) above the ring outside, rising to the Temple Mountain; with the ground given, the base at its highest, so every terrace is built up and none cut',
    rises.every(r => r >= 2 && r <= 6) && T.every((t, k) => !k || t.y < T[k - 1].y) && T[T.length - 1].below === S.base && cut === 0 && fillOnly === 0 && Q.levelAt(S, 0, 0) === T[0].y && Q.levelAt(S, 900, 0) === null,
    cutZ > 0, 'rises ' + rises.join(',') + ' m, the Temple Mountain ' + (T[0].y - S.base) + ' m up; on base -1900 ' + cutZ + ' samples would be cut'); }
{ // the delta grid: fill only
  const Sb = Q.plan({ h: bumpy }), N = 120, cell = 15, ext = 900, D = new Float64Array(N * N);
  const G = { N, cell, ext, h: (x, z) => bumpy(x, z), at: (i, j, k) => bumpy(-ext + i * cell, -ext + j * cell) + D[k], add: (k, dv) => { D[k] += dv; } };
  const r = Q.fill(G, Sb); let lowered = 0; D.forEach(d => { if (d < 0) lowered++; });
  const bad2 = Q.fill({ N, cell, ext, at: () => 1e9, add: (k, dv) => { lowered += dv < 0 ? 1 : 0; } }, Sb);
  ok('the terraces onto a ground-delta grid: filled up to each ring\'s level, nothing lowered (a grid already above them is left alone)',
    r.cells > 5000 && lowered === 0 && r.max > 0, bad2.cells === 0, r.cells + ' cells filled, ' + r.max.toFixed(1) + ' m at most, ' + Math.round(r.volume / 1e6) + ' million m3'); }

// ---------------------------------------------------------------- 6. the kora, the monasteries, the gate markets
{ const chortens = S.crossings.filter(x => x.chorten), kora = S.ways.find(w => w.kind === 'kora'), noKora = Q.plan({ kora: null });
  const mons = S.monasteries, onSpoke = mons.every(m => m.blocks.every(id => { const b = S.blocks.find(x => x.id === id); return b.spoke === m.spoke && b.ring === 1 && b.use === 'monastery'; }));
  const mk = S.markets, straddle = mk.every(m => { const B = m.blocks.map(id => S.blocks.find(x => x.id === id)); return B.length === 2 && B.every(b => b.ring === 2 && b.use === 'market' && (b.a === 0 || b.b === 0)); });
  ok('the kora: ring 2\'s inner ring street with a chorten at every crossing; the eight great monasteries one a spoke (eight colours) in ring 1; four gate markets either side of the avenues in ring 2',
    kora && kora.ring === 2 && chortens.length === 24 && chortens.every(x => x.way === kora.id) && mons.length === 8 && new Set(mons.map(m => m.colour)).size === 8 &&
    mons.map(m => m.spoke).join() === '0,1,2,3,4,5,6,7' && onSpoke && mk.length === 4 && straddle,
    noKora.crossings.filter(x => x.chorten).length === 0 && Q.plan({ monasteries: null }).monasteries.length === 0, chortens.length + ' chortens, ' + mons.length + ' monasteries (' +
    mons.map(m => m.dir + ':' + m.blocks.length).join(' ') + '), ' + mk.length + ' markets'); }

// ---------------------------------------------------------------- 7. the golden hash
const GOLD = path.join(__dirname, 'golden-squares.json');
const G0 = fs.existsSync(GOLD) ? JSON.parse(fs.readFileSync(GOLD, 'utf8')) : {}, gold = {};
gold.plan = fnv(JSON.stringify(S));
{ const again = fnv(JSON.stringify(Q.plan({ id: 'qb' }))), moved = fnv(JSON.stringify(Q.plan({ id: 'qb', centre: [10, 0] })));
  ok('the plan reruns the same and its hash is golden-squares.json\'s', again === gold.plan && (WRITE || G0.plan === gold.plan), moved !== gold.plan, gold.plan + (G0.plan === gold.plan ? '' : '; golden ' + G0.plan)); }

// ---------------------------------------------------------------- 8. laid on an instance, the blocks filled by frontage-courts
const KIT = { qb_cell: [10, 8, 7], qb_college: [20, 16, 12], qb_hostel: [16, 12, 10], qb_arcade: [10, 8, 6], qb_rich: [12, 14, 12], qb_court: [20, 20, 9],
  qb_mid: [9, 12, 9], qb_mid2: [10, 11, 9], qb_poor: [7, 10, 6], qb_poor2: [8, 9, 6] };
const dims = (key, v) => KIT[key] ? { key, v: v || 0, w: KIT[key][0], d: KIT[key][1], h: KIT[key][2] } : null;
const POOLS = { clergy: [['qb_college', 1], ['qb_cell', 3]], kora: [['qb_hostel', 2], ['qb_arcade', 3]], rich: [['qb_rich', 3], ['qb_court', 1]],
  middle: [['qb_mid', 3], ['qb_mid2', 2]], poor: [['qb_poor', 3], ['qb_poor2', 3]] };
const SMALL = { clergy: [['qb_cell', 1]], kora: [['qb_arcade', 1]], rich: [['qb_mid', 1]], middle: [['qb_mid2', 1], ['qb_poor', 1]], poor: [['qb_poor', 1], ['qb_poor2', 1]] };
const flat = (x, z) => -1900 + 0.004 * x - 0.002 * z;
function laid(o) {
  o = o || {};
  const P = Q.plan({ id: 'qb', h: flat });
  const tune = { cell: 2.5, rasterHalf: 300, maxSlope: 0.35, exact: true, width: { avenue: 12, main: 8, side: 5.5, alley: 3, highway: 10, lane: 4.5 },
    lot: { side: 1.6, setback: 1.4, rear: 3, inset: 1.0, step: 3 }, classes: { middle: [['qb_mid', 0]], poor: [['qb_poor', 0]] }, fallback: { middle: 'poor', poor: null } };
  const steps = Q.steps(P).concat([{ name: 'the blocks: frontage and courts', run() {
    PLAN.courts = o.allSides ? KCITY.strategies['frontage-courts'].run(Q.courtBlocks(P), { step: 6, focus: P.centre, pools: POOLS, small: SMALL })
      : Q.infill(P, { step: 6, pools: POOLS, small: SMALL, gaps: { clergy: [4, 8], kora: [1, 3], rich: [5, 10], middle: [2, 5], poor: [1, 3] } }); } }]);
  const C = KCITY.create({ name: 'qiblai-test', tune, seed: 33000, rand: 'krand', index: { order: 'insertion' }, ground: { h: Q.ground(P, flat) }, kit: { dims }, steps });
  return { C, P, plan: C.run() };
}
const t0 = Date.now(), L1 = laid(), PL = L1.plan, SQ = L1.P, lots = PL.courts.lots, secs = ((Date.now() - t0) / 1000).toFixed(1);
const standing = PL.lots.filter(L => L.died == null && L.bo && L.cls !== 'landmark');
const corners = o => [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(s => [o.c[0] + o.u[0] * o.hw * s[0] + o.v[0] * o.hd * s[1], o.c[1] + o.u[1] * o.hw * s[0] + o.v[1] * o.hd * s[1]]);
const obbBox = o => { const C = corners(o), xs = C.map(p => p[0]), zs = C.map(p => p[1]); return [Math.min.apply(null, xs), Math.min.apply(null, zs), Math.max.apply(null, xs), Math.max.apply(null, zs)]; };
// inside its block: within half a raster cell (the ground for lots is the raster's 2.5 m cells inside the block; a lot's
// edge may reach into the wall's clearance by less than that, never onto the wall: that is checked exactly)
const slack = 1.25;
function lotChecks(list, P) {
  const I = KSPACE.create({ cell: 40 }); let over = 0, street = 0, wall = 0, outside = 0, level = 0;
  list.forEach(L => I.insert(L, L.x, L.z, Math.hypot(L.bo.hw, L.bo.hd)));
  list.forEach(A => I.query(A.x, A.z, Math.hypot(A.bo.hw, A.bo.hd)).forEach(B => { if (B.id > A.id && SL.pen(A.bo, B.bo) > 0.1) over++; }));
  const byId = {}; P.blocks.forEach(b => { byId[b.id] = b; });
  list.forEach(L => { const B = obbBox(L.bo), blk = byId[L.court];
    if (P.ways.some(w => runs(w).some(r => boxBox(B, shrink(runRect(w, r), 0.05))))) street++;
    if (P.walls.some(W => W.segs.some(s => boxSeg(B, [s.ax, s.az], [s.bx, s.bz]) < W.thick / 2) || W.towers.some(t => boxBox(B, [t.x - t.size / 2, t.z - t.size / 2, t.x + t.size / 2, t.z + t.size / 2])))) wall++;
    if (!blk || B[0] < blk.box[0] - slack || B[1] < blk.box[1] - slack || B[2] > blk.box[2] + slack || B[3] > blk.box[3] + slack) outside++;
    if (!blk || Math.abs(L.y - (blk.level - 0.15)) > 0.01) level++; });
  return { over, street, wall, outside, level };
}
{ const kinds = {}; lots.forEach(L => { kinds[L.cls] = (kinds[L.cls] || 0) + 1; });
  const blocksWith = new Set(lots.map(L => L.court)).size, nBlocks = Q.courtBlocks(SQ).length;
  ok('the site laid on an instance (steps 0-5) and its blocks filled by frontage-courts: houses in every ring\'s quarters, the Temple Mountain a landmark, the rings districts, the outer wall the plan\'s wall records',
    lots.length > 3000 && ['clergy', 'kora', 'rich', 'middle', 'poor'].every(k => kinds[k] > 30) && blocksWith >= nBlocks - 2 && PL.landmarks.length === 1 && PL.landmarks[0].key === 'temple_mountain' &&
    PL.districts.length === 6 && PL.wallRec.gates.length === 4 && PL.wallRec.gates.every(g => g.way && g.way.cls === 'avenue') && PL.walls.length === 6,
    lots.every(L => SQ.blocks.find(b => b.id === L.court).use === 'quarter') && Q.courtBlocks(SQ, { uses: ['quarter', 'market', 'monastery'] }).length === nBlocks + 20, lots.length + ' houses in ' + blocksWith + ' of ' + nBlocks + ' blocks, ' + JSON.stringify(kinds) + ', ' + PL.ways.length + ' ways, ' + secs + ' s'); }
{ const c = lotChecks(standing, SQ), house = standing[0], wallSeg = SQ.walls[3].segs[0];
  const fake = [Object.assign({}, house, { id: 1e6, bo: Object.assign({}, house.bo, { c: [wallSeg.ax + 30, wallSeg.az] }), x: wallSeg.ax + 30, z: wallSeg.az, y: 0 })], f = lotChecks(fake, SQ);
  ok('the houses: no overlap, none on a street\'s carriageway, a wall or a tower, each inside its block (within half a raster cell), each at its ring\'s terrace level',
    c.over + c.street + c.wall + c.outside + c.level === 0, f.wall === 1 && f.outside === 1 && f.level === 1, JSON.stringify(c) + '; one moved onto a wall: ' + JSON.stringify(f)); }
{ // no frontage house fronts its own wall: its front looks out across a block side that backs onto the wall
  const byId = {}; SQ.blocks.forEach(b => { byId[b.id] = b; });
  const N = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  const facingWall = list => list.filter(L => L.why === 'frontage' && byId[L.court].walls.some(sd => { const f = [Math.sin(L.ry), Math.cos(L.ry)]; return f[0] * N[sd][0] + f[1] * N[sd][1] > 0.9; })).length;
  const A2 = laid({ allSides: true }), all = A2.plan.courts.lots;
  ok('frontage on the streets only: no house fronts its ring\'s wall (each block fronts the sides that face a street; fronting all four would)',
    facingWall(lots) === 0, facingWall(all) > 0, facingWall(all) + ' front the wall when every side is fronted'); }
{ const E = L1.C.export();
  ok('the export carries the outer wall\'s records and the rings', E.wall && E.wall.nodes.filter(n => n.kind === 'gate').length === 4 && E.wall.segs.length === 8 && E.districts.length === 6,
    KCITY.exportWall(null) === null, E.wall ? E.wall.nodes.length + ' wall nodes, ' + E.wall.segs.length + ' runs' : 'no wall'); }

if (WRITE) fs.writeFileSync(GOLD, JSON.stringify(gold, null, 1) + '\n');
console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
