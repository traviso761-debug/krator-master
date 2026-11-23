#!/usr/bin/env node
/* node core/catalog/test-k3-foot.js: K3 (GRAPHICS-TERRAIN-PROPOSAL.md 12d), the foot grounding an indexed batch bakes into
   its vertex colours (krator-furniture-runtime.js FOOT_AO), on every catalog piece, headless:
     - the soup batch (no index) and an indexed batch with footAO false are what they were: no colour moves;
     - in an indexed batch a piece's lowest vertices take FOOT_AO.lo, nothing above the band is darkened and nothing is
       brightened; the darkening ends at the band (a tall part is clipped there, so no triangle straddles it);
     - the same triangles stand where they stood (the clipped parts cover the same area);
     - a wall- or ceiling-hung piece is left alone, and a piece placed 2 m up grounds on its own floor. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = require('../../tools/ktest.js')(__filename);
const CAT = path.join(__dirname, '..', '..', 'kits', 'catalog');
const AT = require(path.join(__dirname, 'catalog-files.js'));
const ctx2d = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  return typeof k === 'string' ? () => {} : undefined;
}, set: () => true });
const g = { console: { log() {}, warn() {}, error() {} } };
for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
g.self = g; g.window = g; g.globalThis = g;
g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener() {} }) };
vm.createContext(g);
vm.runInContext(fs.readFileSync(path.join(CAT, 'three.min.js'), 'utf8'), g);
const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js']
  .concat(fs.readdirSync(CAT).filter(f => f.startsWith('krator-master-furniture-') && f.endsWith('.js')).sort())
  .concat(['krator-furniture-runtime.js']);
vm.runInContext('var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(AT(f), 'utf8')).join('\n;\n') + '\n;globalThis.KF = KF_API;', g);
const KF = g.KF, LO = KF.FOOT_AO.lo, BAND = KF.FOOT_AO.band;

/* every bucket's vertices: [{y, c (0..255 per channel), base colour unknown}] and its triangles */
function run(keys, opt, y){
  const B = KF.batch(opt), recs = keys.map((k, i) => B.place(k, (i % 40) * 6, y || 0, Math.floor(i / 40) * 6, 0, { seed: 1 }));
  const out = {};
  for (const bk in B.buckets) { const b = B.buckets[bk]; out[bk] = { pos: b.pos.view().slice(), col: b.col.view().slice(), idx: b.idx ? b.idx.view().slice() : null }; }
  return { out, recs, tris: B.tris };
}
const area = R => { let a = 0; for (const k in R.out) { const b = R.out[k], P = b.pos, n = b.idx ? b.idx.length : P.length / 3;
  for (let t = 0; t < n; t += 3) { const i = b.idx ? [b.idx[t], b.idx[t + 1], b.idx[t + 2]] : [t, t + 1, t + 2];
    const A = [P[i[0] * 3], P[i[0] * 3 + 1], P[i[0] * 3 + 2]], Bv = [P[i[1] * 3] - A[0], P[i[1] * 3 + 1] - A[1], P[i[1] * 3 + 2] - A[2]], C = [P[i[2] * 3] - A[0], P[i[2] * 3 + 1] - A[1], P[i[2] * 3 + 2] - A[2]];
    a += Math.hypot(Bv[1] * C[2] - Bv[2] * C[1], Bv[2] * C[0] - Bv[0] * C[2], Bv[0] * C[1] - Bv[1] * C[0]) / 2; } } return a; };

const floorKeys = KF.FURNS.filter(A => A.anchor !== 'wall' && A.anchor !== 'ceiling').map(A => A.key);
const hungKeys = KF.FURNS.filter(A => A.anchor === 'wall' || A.anchor === 'ceiling').map(A => A.key);
T.ok('the catalog loads (pieces on floors and hung)', floorKeys.length > 500 && hungKeys.length > 10, floorKeys.length + ' / ' + hungKeys.length);
const sample = floorKeys.filter((k, i) => i % 7 === 0);
const off = run(sample, { indexed: true, footAO: false }), on = run(sample, { indexed: true });
const soup = run(sample.slice(0, 40), {}), soupRef = run(sample.slice(0, 40), { footAO: true });
T.ok('the soup batch never takes it (its arrays are as before, footAO asked or not)', JSON.stringify(Object.keys(soup.out)) === JSON.stringify(Object.keys(soupRef.out)) &&
  Object.keys(soup.out).every(k => Buffer.compare(Buffer.from(soup.out[k].col.buffer), Buffer.from(soupRef.out[k].col.buffer)) === 0));
/* per vertex: darkened (c below its part's colour)? Compare against the footAO:false batch is not vertex-aligned once a part
   is clipped, so check the colour against the band directly: in the on batch, a vertex above floor + band keeps a colour that
   also appears in the off batch's bucket, and the darkest vertex of each bucket sits at the floor */
let darkAbove = 0, straddle = 0, grounded = 0;
for (const k in on.out) { const b = on.out[k], P = b.pos, C = b.col, I = b.idx;
  for (let t = 0; t < I.length; t += 3) { const ys = [P[I[t] * 3 + 1], P[I[t + 1] * 3 + 1], P[I[t + 2] * 3 + 1]];
    const cs = [I[t], I[t + 1], I[t + 2]].map(i => C[i * 3] + C[i * 3 + 1] + C[i * 3 + 2]);
    if (Math.min.apply(null, ys) < BAND - 1e-4 && Math.max.apply(null, ys) > 1.5 * BAND + 1e-4 && new Set(cs).size > 1) straddle++; } }   /* a part under 1.5 bands ramps to its top: by design */
/* darkening only below the band: a vertex above it is never darker than the same part's... use the off batch as the reference set of colours */
for (const k in on.out) { const P = on.out[k].pos, C = on.out[k].col, ref = new Set(); const R = off.out[k];
  for (let i = 0; i < R.col.length; i += 3) ref.add(R.col[i] + ',' + R.col[i + 1] + ',' + R.col[i + 2]);
  for (let i = 0; i < P.length / 3; i++) { const key = C[i * 3] + ',' + C[i * 3 + 1] + ',' + C[i * 3 + 2];
    if (P[i * 3 + 1] > BAND + 1e-4 && !ref.has(key)) darkAbove++;
    if (P[i * 3 + 1] < 1e-4 && !ref.has(key)) grounded++; } }
T.ok('nothing above the band changes colour', darkAbove === 0, darkAbove + ' vertices');
T.ok('no ramped triangle straddles the band (tall parts are clipped at it)', straddle === 0, straddle + ' triangles');
T.ok('vertices at the floor are darkened', grounded > 1000, grounded + ' vertices');
T.ok('the same surface stands where it stood (area within 1e-4)', Math.abs(area(on) - area(off)) / area(off) < 1e-4, area(on) + ' vs ' + area(off));
T.ok('clipping adds triangles, never removes any', on.tris >= off.tris, on.tris + ' vs ' + off.tris);
/* the ramp's floor value: every darkened vertex at the floor is its part's colour times FOOT_AO.lo (within uint8 rounding) */
T.ok('a part\'s colour at the floor is FOOT_AO.lo of its own', (() => { let n = 0, bad = 0;
  for (const k in on.out) { const P = on.out[k].pos, C = on.out[k].col, R = off.out[k], ref = new Set();
    for (let i = 0; i < R.col.length; i += 3) ref.add(R.col[i] + ',' + R.col[i + 1] + ',' + R.col[i + 2]);
    const refs = Array.from(ref).map(s => s.split(',').map(Number));
    for (let i = 0; i < P.length / 3; i++) { if (P[i * 3 + 1] > 1e-4) continue; const c = [C[i * 3], C[i * 3 + 1], C[i * 3 + 2]];
      if (ref.has(c.join(','))) continue; n++;
      if (!refs.some(r => r.every((v, q) => Math.abs(Math.round(v * LO) - c[q]) <= 1))) bad++; } }
  return n > 1000 && bad === 0; })());T.neg('a hung piece is left alone (the wall shelf at 1.4 m keeps every colour)',
  R => Object.keys(R.on.out).every(k => { const a = R.on.out[k].col, b = R.off.out[k].col; return a.length === b.length && a.every((v, i) => v === b[i]); }),
  (() => { const H = hungKeys.slice(0, 30), was = H.map(k => KF.FURN_BY_KEY[k].anchor); H.forEach(k => { KF.FURN_BY_KEY[k].anchor = 'floor'; });   /* the fault: hung pieces grounded */
    const r = { on: run(H, { indexed: true }, 1.4), off: run(H, { indexed: true, footAO: false }, 1.4) }; H.forEach((k, i) => { KF.FURN_BY_KEY[k].anchor = was[i]; }); return r; })(),
  { on: run(hungKeys.slice(0, 30), { indexed: true }, 1.4), off: run(hungKeys.slice(0, 30), { indexed: true, footAO: false }, 1.4) });
const up = run(sample.slice(0, 60), { indexed: true }, 2), upOff = run(sample.slice(0, 60), { indexed: true, footAO: false }, 2);
T.ok('a piece placed 2 m up grounds on its own floor', (() => { let n = 0, bad = 0;
  for (const k in up.out) { const P = up.out[k].pos, C = up.out[k].col, ref = new Set(); const R = upOff.out[k];
    for (let i = 0; i < R.col.length; i += 3) ref.add(R.col[i] + ',' + R.col[i + 1] + ',' + R.col[i + 2]);
    for (let i = 0; i < P.length / 3; i++) { const d = !ref.has(C[i * 3] + ',' + C[i * 3 + 1] + ',' + C[i * 3 + 2]);
      if (d && P[i * 3 + 1] < 2 + 1e-4) n++; if (d && P[i * 3 + 1] > 2 + BAND + 1e-4) bad++; } }
  return n > 100 && bad === 0; })());
T.done();
