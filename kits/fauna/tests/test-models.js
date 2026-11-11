// node kits/fauna/tests/test-models.js [--report] [--write-waivers] [--png dir]: the gate on the packed baked models (PLAN-MESHY.md section 4).
// Reads models/*.json and the kit's catalog; no GPU, no browser, no source GLB. A new model must clear every LIMIT. The models shipped
// before this test are held by tests/models-waivers.json: a waived number may only get better, and a waiver no longer needed fails, so
// the list can only shrink. Each check has a negative on damaged copies of a clean model.
'use strict';
const fs = require('fs'), path = require('path');
const L = require('./models-lib.js');
const ROOT = path.join(__dirname, '..', '..', '..'), DIR = path.join(ROOT, 'kits', 'fauna', 'models'), WFILE = path.join(__dirname, 'models-waivers.json');
const arg = n => process.argv.includes(n), argv = n => process.argv[process.argv.indexOf(n) + 1];
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

const LIMITS = {
  closure: 0.015,      // C4: largest view into a body, any clip, frame and view, as a share of the body's broadest view
  pieces: 0,           // C3: limb parts in more than one piece (rigs with overlap bands count only true breaks: see limbPieces)
  sides: 1.5,          // C3: triangles of a limb part against its mirror
  pivot: 0.06,         // C6: a child part's pivot from its parent's surface, as a share of the body's longest side
  slide: 3,            // C7: a planted foot's slide, % of a stride
  below: 0.005,        // C7: lowest point of a leg under the ground, as a share of the height
  mb: 1.5,             // C9: file size
  parts: 30,           // C9: parts, each a draw call (eight legs of three, a thorax, abdomen, jaws and eyes: 28)
  density: 150,        // C9: colour map, pixels a metre (a floor: the one limit a higher number clears)
  lift: 0.008,         // C7: the least any foot rises in its swing, as a share of the height (a floor)
  through: 0.06,       // C7: share of the shins and feet inside a trunk part, worst frame of the walk
  lossyNormal: 0,      // C9: 1 when the normal map is a JPEG
  sourceLost: 0,       // C1: 1 when the model carries no source record
};
/* an animal over 6 m has more skin than one colour map can cover at the floor: it may take 2.5 MB, and the floor falls with its length, to 50 px/m at 17 m */
const bigSide = M => Math.max(M.rest.w, M.rest.d, M.rest.h), LIMIT = (c, M) => (M && bigSide(M) > 6 ? (c === 'mb' ? 2.5 : c === 'density' ? Math.max(50, 850 / bigSide(M)) : LIMITS[c]) : LIMITS[c]);
const CHECKS = Object.keys(LIMITS), FLOOR = { density: 1, lift: 1 }, over = (c, v, M) => (FLOOR[c] ? v < LIMIT(c, M) : v > LIMIT(c, M));
const worse = (c, v, w) => (FLOOR[c] ? v < w / 1.02 : v > w * 1.02);   /* a waived number may only get better, past rounding */
const FRAMES = 7, RES = 240, DIRS = L.dirs();

/* ---- C4: render every clip from every side and look for the inside of a body */
function closure(m, B) {
  B = B || L.bounds(m); const watched = n => L.TRUNK.test(n); let worst = { px: 0 }, area = 0;
  for (const [cn, c] of [['rest', null]].concat(Object.entries(m.clips))) for (let f = 0; f < (c ? FRAMES : 1); f++) { const W = L.pose(m, c, c ? c.dur * f / FRAMES : 0);
    for (let d = 0; d < DIRS.length; d++) { const R = L.raster(m, W, B, DIRS[d], RES, watched); let a = 0; for (let i = 0; i < R.id.length; i++) if (R.id[i] === 1 || R.id[i] === 2) a++;
      area = Math.max(area, a); const px = L.blob(R, 2); if (px > worst.px) worst = { px, clip: cn, frame: f, dir: d, R }; } }
  worst.v = worst.px / Math.max(area, 1); return worst;   /* against the body's broadest view, so an end-on view with little body in it does not inflate the share */
}
/* ---- C3: welded pieces of a part. Rigs that overlap a join carry a band of the neighbour's faces, so small pieces are not breaks: a
   second piece counts only over 15% of the part's triangles */
function pieces(P) {
  const idOf = new Map(), wid = new Int32Array(P.pos.length / 3);
  for (let i = 0; i < wid.length; i++) { const k = Math.round(P.pos[i * 3] * 2e4) + ',' + Math.round(P.pos[i * 3 + 1] * 2e4) + ',' + Math.round(P.pos[i * 3 + 2] * 2e4); if (!idOf.has(k)) idOf.set(k, idOf.size); wid[i] = idOf.get(k); }
  const up = new Int32Array(idOf.size).map((_, i) => i), find = a => { while (up[a] !== a) a = up[a] = up[up[a]]; return a; };
  for (let t = 0; t < P.idx.length; t += 3) { const a = find(wid[P.idx[t]]), b = find(wid[P.idx[t + 1]]), c = find(wid[P.idx[t + 2]]); up[b] = a; up[find(c)] = a; }
  const n = {}; for (let t = 0; t < P.idx.length; t += 3) { const r = find(wid[P.idx[t]]); n[r] = (n[r] || 0) + 1; }
  const sizes = Object.values(n).sort((a, b) => b - a), tot = P.idx.length / 3;
  return { all: sizes.length, big: sizes.filter(s => s >= 0.15 * tot).length };
}
const isLimb = n => /^(leg|foot|arm)/.test(n), walksOn = n => /^(leg|foot)/.test(n), mirror = n => { const q = /^(.*?)([LR])([tf]?)$/.exec(n); return q ? q[1] + (q[2] === 'L' ? 'R' : 'L') + q[3] : null; };
function worldVert(m, W, P, i, v) { L.apply(W[P.node], P.pos, i * 3, v); return v; }
/* ---- C7: slide and depth of the limb ends over the walk */
function walk(m) {
  const c = m.clips.walk, ex = c && c.extras; if (!ex || !ex.speed) return { slide: 0, below: 0, lift: 1 };
  const G = ex.ground == null ? m.M.rest.ground : ex.ground, nodes = m.M.nodes, T = []; for (let k = 0; k < 24; k++) T.push(c.dur * k / 24);
  const hasKid = n => Object.keys(m.parts).some(q => walksOn(q) && nodes[m.parts[q].node].parent === m.parts[n].node);
  const ends = Object.keys(m.parts).filter(n => walksOn(n) && !hasKid(n)), per = ex.speed * c.dur, Ws = T.map(t => L.pose(m, c, t)), v = [0, 0, 0]; let worst = 0, lo = 1e9, lift = 1e9;
  for (const n of ends) { const P = m.parts[n], np = P.pos.length / 3, ys = T.map((_, k) => { let y = 1e9; for (let i = 0; i < np; i++) y = Math.min(y, worldVert(m, Ws[k], P, i, v)[1]); return y; });
    const ymin = Math.min(...ys), kst = ys.indexOf(ymin); lo = Math.min(lo, ymin); lift = Math.min(lift, Math.max(...ys) - ymin); let tip = 0, ty = 1e9; for (let i = 0; i < np; i++) { const y = worldVert(m, Ws[kst], P, i, v)[1]; if (y < ty) { ty = y; tip = i; } }
    const zs = []; for (let k = 0; k < T.length; k++) { if (ys[k] > ymin + 0.004) continue; const q = worldVert(m, Ws[k], P, tip, v); zs.push(q[2] + ex.speed * T[k]); }
    for (let i = 1; i < zs.length; i++) { while (zs[i] - zs[i - 1] > per / 2) zs[i] -= per; while (zs[i] - zs[i - 1] < -per / 2) zs[i] += per; }
    if (zs.length > 1) worst = Math.max(worst, Math.max(...zs) - Math.min(...zs)); }
  return { slide: ex.stride ? 100 * worst / ex.stride : 0, below: Math.max(0, (G - lo) * m.M.scale / Math.max(m.M.rest.h, 1e-6)), lift: (ends.length ? lift : 1) * m.M.scale / Math.max(m.M.rest.h, 1e-6) };
}
/* ---- C7: does a limb pass through the body? Each trunk part as a solid: voxels the outside cannot reach past its skin, in the part's own frame. A part that is not a closed shell has no inside and reads 0 */
function solidOf(P) { const n = 56, lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9]; for (let i = 0; i < P.pos.length; i += 3) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], P.pos[i + c]); hi[c] = Math.max(hi[c], P.pos[i + c]); }
  const st = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / (n - 4), o = lo.map(x => x - 2 * st), id = (a, b, c) => a + n * (b + n * c), skin = new Uint8Array(n * n * n), I = P.idx;
  for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, e = Math.ceil(Math.max(Math.hypot(P.pos[a] - P.pos[b], P.pos[a + 1] - P.pos[b + 1], P.pos[a + 2] - P.pos[b + 2]), Math.hypot(P.pos[a] - P.pos[c], P.pos[a + 1] - P.pos[c + 1], P.pos[a + 2] - P.pos[c + 2])) / st) + 1;
    for (let u = 0; u <= e; u++) for (let w = 0; w <= e - u; w++) { const k = 1 - (u + w) / e, f = u / e, g = w / e; skin[id(Math.floor((P.pos[a] * k + P.pos[b] * f + P.pos[c] * g - o[0]) / st), Math.floor((P.pos[a + 1] * k + P.pos[b + 1] * f + P.pos[c + 1] * g - o[1]) / st), Math.floor((P.pos[a + 2] * k + P.pos[b + 2] * f + P.pos[c + 2] * g - o[2]) / st))] = 1; } }
  const out = new Uint8Array(n * n * n), q = [0]; out[0] = 1;
  while (q.length) { const i = q.pop(), a = i % n, b = ((i / n) | 0) % n, c = (i / (n * n)) | 0; for (const [x, y, z] of [[a + 1, b, c], [a - 1, b, c], [a, b + 1, c], [a, b - 1, c], [a, b, c + 1], [a, b, c - 1]]) { if (x < 0 || y < 0 || z < 0 || x >= n || y >= n || z >= n) continue; const j = id(x, y, z); if (!out[j] && !skin[j]) { out[j] = 1; q.push(j); } } }
  return p => { const a = Math.floor((p[0] - o[0]) / st), b = Math.floor((p[1] - o[1]) / st), c = Math.floor((p[2] - o[2]) / st); return a >= 0 && b >= 0 && c >= 0 && a < n && b < n && c < n && !out[id(a, b, c)] && !skin[id(a, b, c)]; }; }
function through(m) { const c = m.clips.walk; if (!c) return 0; const T = Object.keys(m.parts).filter(n => L.TRUNK.test(n)), inside = {}; for (const n of T) inside[n] = solidOf(m.parts[n]);
  const low = Object.keys(m.parts).filter(n => /^(leg|arm|foot)/.test(n) && /[tf]$/.test(n)); if (!low.length) return 0; let worst = 0; const v = [0, 0, 0], w = [0, 0, 0];
  for (let f = 0; f < 8; f++) { const W = L.pose(m, c, c.dur * f / 8); let hit = 0, tot = 0; for (const n of low) { const P = m.parts[n]; for (let i = 0; i < P.pos.length; i += 3 * 3) { L.apply(W[P.node], P.pos, i, v); tot++;
    for (const t of T) { const M = W[m.parts[t].node], dx = v[0] - M[12], dy = v[1] - M[13], dz = v[2] - M[14]; w[0] = dx * M[0] + dy * M[1] + dz * M[2]; w[1] = dx * M[4] + dy * M[5] + dz * M[6]; w[2] = dx * M[8] + dy * M[9] + dz * M[10]; if (inside[t](w)) { hit++; break; } } } } worst = Math.max(worst, hit / Math.max(tot, 1)); }
  return worst; }
/* ---- C6: a child's pivot must sit on or in its parent (rest; pivots are fixed in the parent's frame) */
function pivots(m) {
  const nodes = m.M.nodes, S = m.M.scale, side = Math.max(m.M.rest.w, m.M.rest.d, m.M.rest.h); let worst = 0, who = '';
  for (const n in m.parts) { const nd = nodes[m.parts[n].node]; if (nd.parent < 0) continue; const pn = nodes[nd.parent].name, Q = m.parts[pn]; if (!Q) continue;
    let d = 1e18; const p = nd.t, I = Q.idx, A = [0, 0, 0], B = [0, 0, 0], C = [0, 0, 0], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    for (let t = 0; t < I.length; t += 3) {      /* to the surface, not its corners: a capped cut has one wide fan with no corner near a leg's root */
      for (let k = 0; k < 3; k++) { A[k] = Q.pos[I[t] * 3 + k]; B[k] = Q.pos[I[t + 1] * 3 + k]; C[k] = Q.pos[I[t + 2] * 3 + k]; }
      const ab = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], ac = [C[0] - A[0], C[1] - A[1], C[2] - A[2]], ap = [p[0] - A[0], p[1] - A[1], p[2] - A[2]], d00 = dot(ab, ab), d01 = dot(ab, ac), d11 = dot(ac, ac), den = d00 * d11 - d01 * d01 || 1e-12, b0 = dot(ap, ab), b1 = dot(ap, ac);
      let v = Math.max(0, (d11 * b0 - d01 * b1) / den), w = Math.max(0, (d00 * b1 - d01 * b0) / den); const s = v + w; if (s > 1) { v /= s; w /= s; }
      const q = [A[0] + v * ab[0] + w * ac[0] - p[0], A[1] + v * ab[1] + w * ac[1] - p[1], A[2] + v * ab[2] + w * ac[2] - p[2]]; d = Math.min(d, dot(q, q)); }
    const v = Math.sqrt(d) * S / side; if (v > worst) { worst = v; who = n; } }
  return { pivot: worst, who };
}
/* a JPEG data URL's width, from its frame header */
function mapWidth(url) { const b = Buffer.from(url.split(',')[1], 'base64'); let i = 2; while (i < b.length - 9) { if (b[i] !== 0xff) { i++; continue; } const k = b[i + 1]; if (k >= 0xc0 && k <= 0xc2) return b.readUInt16BE(i + 7); i += 2 + b.readUInt16BE(i + 2); } return 1024; }
/* ---- C9: the colour map's pixels a metre, and the UV area of each part (a card sampling the whole atlas has one near 1) */
function density(m) {
  let a3 = 0, a2 = 0; const S = m.M.scale, px = mapWidth(m.M.tex.map);
  for (const n in m.parts) { if (uvOwn(m, n)) continue; const P = m.parts[n], I = P.idx;
    for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, ux = P.pos[b] - P.pos[a], uy = P.pos[b + 1] - P.pos[a + 1], uz = P.pos[b + 2] - P.pos[a + 2], vx = P.pos[c] - P.pos[a], vy = P.pos[c + 1] - P.pos[a + 1], vz = P.pos[c + 2] - P.pos[a + 2];
      const u2 = uvArea(P, t); if (u2 < 1e-12) continue;      /* a cap or a core is one colour by design, sampled at a point: no map is stretched over it */
      a3 += 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) * S * S; a2 += 0.5 * u2; } }
  return px * Math.sqrt(a2 / Math.max(a3, 1e-9));
}
const uvOwn = (m, n) => Object.values(m.M.mats || {}).some(q => q.parts.indexOf(n) >= 0);
function uvArea(P, t) { const a = P.idx[t] * 2, b = P.idx[t + 1] * 2, c = P.idx[t + 2] * 2, e = P.uv[b] - P.uv[a], f = P.uv[b + 1] - P.uv[a + 1], g = P.uv[c] - P.uv[a], h = P.uv[c + 1] - P.uv[a + 1]; return Math.abs(e * h - f * g); }
/* parts drawing a shared map whose charts add up to more than the map holds: a card that lost its own material. A big part may fill much of the atlas by itself */
const fillsAtlas = m => { const area = {}; let tot = 0; for (const n of Object.keys(m.parts)) { if (uvOwn(m, n)) continue; const P = m.parts[n]; let a = 0; for (let t = 0; t < P.idx.length; t += 3) a += 0.5 * uvArea(P, t); area[n] = a; tot += a; } return tot <= 1.2 ? [] : Object.keys(area).filter(n => area[n] > 0.7); };

/* the numbers a model is held to */
function measure(m, file, full) {
  const c = full === false ? { v: 0 } : closure(m), lim = Object.keys(m.parts).filter(isLimb), w = walk(m), piv = pivots(m); let side = 1;
  for (const n of lim) { const q = mirror(n); if (!q || !m.parts[q]) continue; side = Math.max(side, m.parts[n].idx.length / m.parts[q].idx.length); }
  return { closure: c.v, closureAt: c, pieces: lim.filter(n => pieces(m.parts[n]).big > 1).length, sides: side, pivot: piv.pivot, slide: w.slide, below: w.below, lift: w.lift, through: full === false ? 0 : through(m),
    mb: fs.statSync(file).size / 1e6 / (m.M.share || 1), parts: m.M.merge ? 1 : Object.keys(m.parts).length, density: density(m), lossyNormal: /^data:image\/jpeg/.test(m.M.tex.nrm) ? 1 : 0, sourceLost: m.M.source ? 0 : 1 };
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort(), MODELS = {}, MEASURED = {};
const waivers = fs.existsSync(WFILE) ? JSON.parse(fs.readFileSync(WFILE, 'utf8')).models : {};
for (const f of files) { const q = path.join(DIR, f), F = JSON.parse(fs.readFileSync(q, 'utf8'));      /* a family is gated species by species, its file shared among them */
  for (const p of F.family ? Object.keys(F.picks) : [null]) { const m = L.load(q, p); MODELS[m.key] = m; MEASURED[m.key] = measure(m, q); } }
const pad = (x, n) => String(x).padEnd(n), num = x => (typeof x === 'number' ? (Number.isInteger(x) ? x : +x.toFixed(4)) : x);
if (arg('--report')) { console.log(pad('model', 21) + CHECKS.map(k => pad(k, 11)).join('')); for (const k in MEASURED) console.log(pad(k, 21) + CHECKS.map(q => pad(num(MEASURED[k][q]), 11)).join('') + (MEASURED[k].closureAt.clip || '')); }
if (arg('--png')) for (const k in MEASURED) { const a = MEASURED[k].closureAt; if (a.R) L.png(a.R, path.join(argv('--png'), k + '-' + a.clip + '.png')); }
if (arg('--write-waivers')) { const out = {};
  for (const k in MEASURED) { const w = {}; for (const c of CHECKS) if (over(c, MEASURED[k][c], MODELS[k].M)) w[c] = num(MEASURED[k][c]); if (Object.keys(w).length) out[k] = w; }
  fs.writeFileSync(WFILE, JSON.stringify({ note: 'The models shipped before tests/test-models.js, as measured. A number here may only fall: see PLAN-MESHY.md. A new model gets no row.', models: out }, null, 1) + '\n'); console.log('wrote', WFILE); process.exit(0); }

// ---------------------------------------------------------------- every model against the limits, or its waiver
for (const k in MEASURED) { const v = MEASURED[k], w = waivers[k] || {}, bad = [], stale = [];
  for (const c of CHECKS) { const o = over(c, v[c], MODELS[k].M); if (o && !(c in w)) bad.push(c + ' ' + num(v[c]) + ' past ' + num(LIMIT(c, MODELS[k].M))); else if (o && worse(c, v[c], w[c])) bad.push(c + ' ' + num(v[c]) + ' worse than its waiver ' + w[c]); else if (!o && c in w) stale.push(c); }
  ok(!bad.length && !stale.length, k + ': ' + (bad.concat(stale.map(s => s + ' passes now: remove its waiver')).join('; ') || (Object.keys(w).length ? 'holds its ' + Object.keys(w).length + ' waiver(s): ' + Object.keys(w).join(', ') : 'clear of every limit'))); }
for (const k in waivers) ok(k in MODELS, 'the waiver for ' + k + ' names a model');

// ---------------------------------------------------------------- C8: the contract with the catalog
{ const { KF } = L.registry(ROOT), rows = L.modelled(KF), base0 = 'giant-dragonfly';
  ok(rows.length === new Set(rows.map(r => r.model)).size || rows.length >= files.length, 'catalog: ' + rows.length + ' model variants');
  const named = new Set(rows.map(r => r.model));
  ok(files.every(f => [...named].some(n => n.split('#')[0] === f.slice(0, -5))) && rows.every(r => MODELS[r.model]), 'every model file has an entry, and every entry its file');
  const contract = (m, r) => { const bad = [], E = r.E, D = Object.assign({}, E.data || {}, (E.modelData || {})[r.variant] || {});
    let legs = 0; for (const nd of m.M.nodes) if (/^leg(\d+|\d?[LR])$/.test(nd.name)) legs++;
    if (D.legs != null && legs !== D.legs) bad.push('legs ' + legs + ' against ' + D.legs);
    if (!m.clips.perch || !m.clips.walk) bad.push('perch and walk clips');
    if (D.wings && !m.clips.flap && !m.clips.hover) bad.push('a wing clip');
    if (m.M.tris > (D.budget || 9000)) bad.push('tris ' + m.M.tris + ' over ' + (D.budget || 9000));
    const fa = fillsAtlas(m); if (fa.length) bad.push('parts filling the atlas (a lost material?): ' + fa.join(' '));
    let g = null; try { g = KF.build(r.key, { variant: r.variant, seed: 3 }); } catch (e) { g = null; }
    if (g) { let nan = 0; g.traverse(o => { if (o.isMesh) { const q = o.geometry.attributes.position.array; for (let i = 0; i < q.length; i++) if (!isFinite(q[i])) nan++; } }); if (nan) bad.push('the procedural fallback has NaN positions'); }
    const want = g ? Object.keys(g.userData.anchors || {}).filter(n => !/^spread\d/.test(n)) : [], have = m.M.anchors || {}, side = Math.max(m.M.rest.w, m.M.rest.d, m.M.rest.h), S = m.M.scale, W = L.pose(m, m.clips.perch, 0), v = [0, 0, 0];
    for (const a of want) { const q = have[a]; if (!q) { bad.push('anchor ' + a + ' missing'); continue; }
      const off = [-m.M.rest.center[0] * S, -m.M.rest.ground * S, -m.M.rest.center[1] * S]; let d = 1e18;
      for (const n in m.parts) { const P = m.parts[n]; for (let i = 0; i < P.pos.length / 3; i++) { worldVert(m, W, P, i, v); d = Math.min(d, Math.hypot(v[0] * S + off[0] - q.p[0], v[1] * S + off[1] - q.p[1], v[2] * S + off[2] - q.p[2])); } }
      if (d > 0.05 * side) bad.push('anchor ' + a + ' ' + d.toFixed(2) + ' m off the body'); if (m.byName[q.node] == null) bad.push('anchor ' + a + ' on a node that does not exist'); }
    { const W0 = L.pose(m, null, 0); for (const nd of m.M.nodes) { if (!/^(leg\d|foot|wing2?|wingO2?)L/.test(nd.name)) continue; const o = mirror(nd.name); if (m.byName[o] != null && W0[m.byName[nd.name]][12] <= W0[m.byName[o]][12]) bad.push(nd.name + ' on the wrong side'); } }   /* +x is the animal's left */
    return bad; };
  for (const r of rows) { const b = contract(MODELS[r.model], r); ok(!b.length, 'contract ' + r.key + '#' + r.variant + ': ' + (b.join('; ') || 'legs, clips, budget, anchors, materials and sides')); }

  // ---------------------------------------------------------------- what a host really gets: KratorFauna.build() down the model's branch
  const packed = {}; for (const f of files) packed[f.slice(0, -5)] = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const realBuild = (KFm, r, M) => { const bad = []; let g; try { g = KFm.build(r.key, { variant: r.variant, seed: 3 }); } catch (e) { return ['build threw: ' + e.message]; } const u = g.userData;
    if (u.model !== r.model) bad.push('built ' + u.model + ', not the model'); const want = Object.keys(M.anchors || {}).sort().join(), have = Object.keys(u.anchors).sort().join(), on = Object.keys(u.anchorOn || {}).sort().join();
    if (want !== have || want !== on) bad.push('anchors: packed [' + want + '], built [' + have + '], on parts [' + on + ']');
    for (const a in (u.anchorOn || {})) if (!u.anchorOn[a].part || !u.anchorOn[a].part.isObject3D) bad.push('anchorOn ' + a + ' has no part');
    const clear = new Set(); g.traverse(o => { if (o.isMesh && o.material.transparent) clear.add(o.parent.name); }); const wantClear = Object.values(M.mats || {}).reduce((a, q) => a.concat(q.parts), []);
    if (wantClear.sort().join() !== [...clear].sort().join()) bad.push('see-through parts: packed [' + wantClear + '], built [' + [...clear] + ']');
    for (const [mode, clip] of [['idle', 'perch'], ['walk', 'walk']]) { KFm.animate(g, 1, mode); if (u._mx.cur !== clip) bad.push(mode + ' played ' + u._mx.cur); }
    if (u.parts.legs.filter(Boolean).length !== Object.keys(M.meshes).filter(n => /^leg(\d+|\d?[LR])$/.test(n)).length) bad.push('legs on the built animal'); return bad; };
  { const KFm = L.registry(ROOT, packed).KF; for (const r of rows) { const b = realBuild(KFm, r, MODELS[r.model].M); ok(!b.length, 'built ' + r.key + '#' + r.variant + ': ' + (b.join('; ') || 'the model, its anchors on parts, its materials, its clips')); }
    const q = JSON.parse(JSON.stringify(packed[base0])); delete q.anchors; const KF2 = L.registry(ROOT, Object.assign({}, packed, { [base0]: q })).KF; ok(realBuild(KF2, rows.find(r => r.model === base0), packed[base0]).some(s => /^anchors/.test(s)), 'negative: a build that lost its anchors fails, whatever the file says'); }

  // ---------------------------------------------------------------- a candidate, not in the kit yet: --candidate <packed.json> <entry key>, every limit and no waiver
  if (arg('--candidate')) { const file = argv('--candidate'), key = process.argv[process.argv.indexOf('--candidate') + 2], m = L.load(file), E = KF.entry(key), v = measure(m, file), bad = [];
    for (const c of CHECKS) { const o = over(c, v[c], m.M); console.log((o ? 'FAIL ' : 'ok   ') + pad(c, 12) + pad(num(v[c]), 10) + 'limit ' + LIMITS[c] + (c === 'closure' && v.closureAt.clip ? '   worst: ' + v.closureAt.clip : '') + (c === 'pivot' ? '   worst: ' + pivots(m).who : '') + (c === 'pieces' && v[c] ? '   ' + Object.keys(m.parts).filter(n => isLimb(n) && pieces(m.parts[n]).big > 1).join(' ') : '')); if (o) bad.push(c); }
    const b = contract(m, { key, variant: 0, model: m.key, E }); console.log((b.length ? 'FAIL ' : 'ok   ') + 'contract    ' + (b.join('; ') || 'legs, clips, budget, anchors, materials and sides'));
    console.log('tris ' + m.M.tris + ', ' + Object.keys(m.parts).length + ' parts, ' + (fs.statSync(file).size / 1e6).toFixed(2) + ' MB');
    if (arg('--png')) { const a = v.closureAt; if (a.R) L.png(a.R, path.join(argv('--png'), path.basename(file, '.json') + '-' + a.clip + '.png')); }
    process.exit(bad.length || b.length ? 1 : 0); }

  // ---------------------------------------------------------------- the negatives: every check bites
  const base = 'giant-dragonfly', fresh = () => L.load(path.join(DIR, base + '.json')), file = path.join(DIR, base + '.json'), row = rows.find(r => r.model === base);
  { const m = fresh(), P = m.parts.thorax, n = P.idx.length, keep = []; const v = [0, 0, 0], W = L.pose(m, null, 0); for (let t = 0; t < n; t += 3) { L.apply(W[P.node], P.pos, P.idx[t] * 3, v); if (!(v[1] > 0.04 && Math.abs(v[0]) < 0.12)) keep.push(P.idx[t], P.idx[t + 1], P.idx[t + 2]); }
    P.idx = Uint32Array.from(keep); const c = closure(m); ok(c.v > LIMITS.closure, 'negative C4: a hole cut in the dragonfly\'s back is seen (' + num(c.v) + ')'); }
  ok(MEASURED.quetzalcoatlus.closure > LIMITS.closure && MEASURED['giant-bat'].closure > LIMITS.closure && MEASURED['giant-archaeopteryx'].closure > LIMITS.closure, 'negative C4: the three flyers, known to open, read over the limit (' + ['quetzalcoatlus', 'giant-bat', 'giant-archaeopteryx'].map(k => num(MEASURED[k].closure)).join(', ') + ')');
  ok(MEASURED[base].closure <= LIMITS.closure, 'the dragonfly, known to stay shut, reads under it (' + num(MEASURED[base].closure) + ')');
  { const m = fresh(), n = Object.keys(m.parts).find(q => /^leg\dL$/.test(q)), P = m.parts[n], ks = []; const zs = []; for (let t = 0; t < P.idx.length; t += 3) zs.push(P.pos[P.idx[t] * 3 + 1]); const mid = zs.slice().sort((a, b) => a - b)[zs.length >> 1];
    for (let t = 0; t < P.idx.length; t += 3) if (Math.abs(P.pos[P.idx[t] * 3 + 1] - mid) > 0.04 * (Math.max(...zs) - Math.min(...zs)) + 0.004) ks.push(P.idx[t], P.idx[t + 1], P.idx[t + 2]); P.idx = Uint32Array.from(ks);
    ok(measure(m, file, false).pieces > 0, 'negative C3: a leg cut in two is two pieces'); }
  { const m = fresh(), n = Object.keys(m.parts).find(q => /^leg\dL$/.test(q)), P = m.parts[n]; P.idx = P.idx.slice(0, (P.idx.length / 18 | 0) * 3); ok(measure(m, file, false).sides > LIMITS.sides, 'negative C3: a leg with a sixth of its mirror\'s faces'); }
  { const m = fresh(), nd = m.M.nodes[m.parts.wingL.node]; nd.t = [nd.t[0] + 1.5, nd.t[1], nd.t[2]]; ok(pivots(m).pivot > LIMITS.pivot, 'negative C6: a wing moved off the thorax'); }
  { const m = fresh(); m.clips.walk.extras = Object.assign({}, m.clips.walk.extras, { speed: m.clips.walk.extras.speed * 3 }); ok(walk(m).slide > LIMITS.slide, 'negative C7: the wrong root speed slides the feet'); }
  { const m = fresh(); m.M.rest = Object.assign({}, m.M.rest, { h: m.M.rest.h }); const c = m.clips.walk; c.extras = Object.assign({}, c.extras, { ground: c.extras.ground + 0.3 }); ok(walk(m).below > LIMITS.below, 'negative C7: a ground above the feet reads as through the floor'); }
  { const m = L.load(path.join(DIR, 'harvester-ant.json')); for (const n in m.clips.walk.tracks) if (/^leg/.test(n)) delete m.clips.walk.tracks[n]; ok(walk(m).lift < LIMITS.lift, 'negative C7: legs that never lift read as dragging'); }
  { const m = L.load(path.join(DIR, 'harvester-ant.json')), nd = m.M.nodes[m.parts.leg0Lt.node], T = m.M.nodes[m.parts.thorax.node], th = m.M.nodes[m.parts.leg0L.node], own = m.M.nodes[nd.parent]; own.t = [0, 0, 0]; nd.t = [0, 0, 0]; th.t = [0, 0, 0]; const big = m.clips.walk.tracks; delete big.leg0L; delete big.leg0Lt; delete big.leg0Lf; const P = m.parts.leg0Lt, Q = P.pos, c = [0, 0, 0]; for (let i = 0; i < Q.length; i += 3) for (let k = 0; k < 3; k++) c[k] += Q[i + k] * 3 / Q.length; for (let i = 0; i < Q.length; i += 3) for (let k = 0; k < 3; k++) Q[i + k] = (Q[i + k] - c[k]) * 0.05; const f = m.parts.leg0Lf.pos; for (let i = 0; i < f.length; i++) f[i] *= 0.05; m.M.nodes[m.parts.leg0Lf.node].t = [0, 0, 0]; const ok2 = through(m); const n = Object.keys(m.parts).filter(q => /^(leg|arm|foot)/.test(q) && /[tf]$/.test(q)).length; ok(ok2 >= 1 / n * 0.5, 'negative C7: a shin moved inside the thorax is found (' + num(ok2) + ')'); }
  { const m = fresh(); delete m.M.mats; ok(contract(m, row).some(s => /filling the atlas/.test(s)), 'negative C8: the dragonfly without its wing material fails (the bug that shipped)'); }
  { const m = fresh(); delete m.M.anchors; ok(contract(m, row).some(s => /anchor saddle missing/.test(s)), 'negative C8: a rideable model without its saddle fails'); }
  { const m = fresh(), a = m.M.anchors.saddle; a.p = [a.p[0], a.p[1] + 4, a.p[2]]; ok(contract(m, row).some(s => /off the body/.test(s)), 'negative C8: a saddle floating over the body fails'); }
  { const m = fresh(), L0 = m.M.nodes.find(n => n.name === 'wingL'), R0 = m.M.nodes.find(n => n.name === 'wingR'); L0.name = 'wingR'; R0.name = 'wingL'; m.byName.wingL = m.M.nodes.indexOf(R0); m.byName.wingR = m.M.nodes.indexOf(L0); ok(contract(m, row).some(s => /wrong side/.test(s)), 'negative C8: left and right swapped fail'); }
  ok(over('density', 100) && !over('density', 200) && worse('closure', 0.09, 0.05) && !worse('closure', 0.05, 0.05) && worse('density', 90, 120), 'negative: limits and waivers read the right way up (a floor for density)');
  { const m = fresh(); m.M.tris = 99999; ok(contract(m, row).some(s => /over/.test(s)), 'negative C9: over the budget fails'); }
  { const m = fresh(); m.M.tex = Object.assign({}, m.M.tex, { nrm: 'data:image/jpeg;base64,' }); m.M.source = { raw: 'x' }; const v = measure(m, file, false); ok(v.lossyNormal === 1 && v.sourceLost === 0, 'negative C9, C1: a JPEG normal map is flagged; a source record clears C1'); }
}
console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);
