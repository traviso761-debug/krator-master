// node kits/fauna/rig/intake.js <key> [raw.glb ...]: C2, the anatomy intake (PLAN-MESHY.md). Reads raw GLBs in rig/sources/<key>/ before any money goes
// on rigging one, against rig/sources/<key>/spec.json. It needs no generator's cooperation: any GLB with plain meshes reads the same.
//   contacts   separate feet on the ground, against the spec
//   mirror     how far the body is from mirroring itself, % of its length
//   debris     share of the triangles outside the largest connected piece, and how many pieces
// Numbers, not a verdict: a person still looks at the views (rig/sheet.py). It prints a line per GLB and writes intake.json beside them.
'use strict';
const fs = require('fs'), path = require('path');

function glb(file) {
  const b = fs.readFileSync(file), jl = b.readUInt32LE(12), J = JSON.parse(b.slice(20, 20 + jl).toString('utf8')), bin = b.slice(20 + jl + 8);
  const ext = (J.extensionsRequired || []).concat(J.extensionsUsed || []);
  const acc = i => { const a = J.accessors[i], v = J.bufferViews[a.bufferView], n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type], T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array, 5121: Uint8Array }[a.componentType];
    const o = (v.byteOffset || 0) + (a.byteOffset || 0), st = v.byteStride || T.BYTES_PER_ELEMENT * n, out = new T(a.count * n), dv = new DataView(bin.buffer, bin.byteOffset);
    for (let i2 = 0; i2 < a.count; i2++) for (let c = 0; c < n; c++) { const p = o + i2 * st + c * T.BYTES_PER_ELEMENT; out[i2 * n + c] = T === Float32Array ? dv.getFloat32(p, true) : T === Uint32Array ? dv.getUint32(p, true) : T === Uint16Array ? dv.getUint16(p, true) : dv.getUint8(p); }
    return out; };
  const P = [], F = []; let prims = 0;
  const mul = (a, b2) => { const r = new Float64Array(16); for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) r[c * 4 + w] = a[w] * b2[c * 4] + a[4 + w] * b2[c * 4 + 1] + a[8 + w] * b2[c * 4 + 2] + a[12 + w] * b2[c * 4 + 3]; return r; };
  const local = n => { if (n.matrix) return Float64Array.from(n.matrix); const t = n.translation || [0, 0, 0], q = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1], [x, y, z, w] = q;
    return Float64Array.of((1 - 2 * (y * y + z * z)) * s[0], 2 * (x * y + z * w) * s[0], 2 * (x * z - y * w) * s[0], 0, 2 * (x * y - z * w) * s[1], (1 - 2 * (x * x + z * z)) * s[1], 2 * (y * z + x * w) * s[1], 0, 2 * (x * z + y * w) * s[2], 2 * (y * z - x * w) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0, t[0], t[1], t[2], 1); };
  const walk = (i, M) => { const n = J.nodes[i], W = mul(M, local(n));
    if (n.mesh != null) for (const pr of J.meshes[n.mesh].primitives) { if (pr.mode != null && pr.mode !== 4) continue; if (pr.attributes.POSITION == null) continue; prims++; const p = acc(pr.attributes.POSITION), base = P.length / 3;
      for (let k = 0; k < p.length; k += 3) P.push(W[0] * p[k] + W[4] * p[k + 1] + W[8] * p[k + 2] + W[12], W[1] * p[k] + W[5] * p[k + 1] + W[9] * p[k + 2] + W[13], W[2] * p[k] + W[6] * p[k + 1] + W[10] * p[k + 2] + W[14]);
      const I = pr.indices == null ? Uint32Array.from({ length: p.length / 3 }, (_, q) => q) : acc(pr.indices); for (const q of I) F.push(base + q); }
    for (const c of n.children || []) walk(c, W); };
  for (const r of J.scenes[J.scene || 0].nodes) walk(r, Float64Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));
  const mat = (J.materials || [])[0] || {}, pbr = mat.pbrMetallicRoughness || {};
  return { P: Float64Array.from(P), F: Uint32Array.from(F), prims, mats: (J.materials || []).length, tex: { base: !!pbr.baseColorTexture, normal: !!mat.normalTexture, mr: !!pbr.metallicRoughnessTexture }, ext: [...new Set(ext)], mb: b.length / 1e6 };
}

/* the long axis across the ground: the eigenvector of the x, z spread */
function axis(P) {
  let cx = 0, cz = 0, n = P.length / 3; for (let i = 0; i < P.length; i += 3) { cx += P[i]; cz += P[i + 2]; } cx /= n; cz /= n;
  let xx = 0, xz = 0, zz = 0; for (let i = 0; i < P.length; i += 3) { const a = P[i] - cx, b = P[i + 2] - cz; xx += a * a; xz += a * b; zz += b * b; }
  const t = 0.5 * Math.atan2(2 * xz, xx - zz); return { cx, cz, ax: Math.cos(t), az: Math.sin(t) };
}
function measure(file, spec) {
  const g = glb(file), P = g.P, F = g.F, nv = P.length / 3; let lo = [1e18, 1e18, 1e18], hi = [-1e18, -1e18, -1e18];
  for (let i = 0; i < P.length; i += 3) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], P[i + c]); hi[c] = Math.max(hi[c], P[i + c]); }
  const size = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]], A = axis(P), bs = Math.max(size[0], size[2]);
  const u = new Float64Array(nv), v = new Float64Array(nv); for (let i = 0; i < nv; i++) { const a = P[i * 3] - A.cx, b = P[i * 3 + 2] - A.cz; u[i] = a * A.ax + b * A.az; v[i] = -a * A.az + b * A.ax; }
  // re-centre the body's midline on the median of v (a generator need not centre it)
  const sv = Float64Array.from(v).sort(), mid = sv[nv >> 1]; for (let i = 0; i < nv; i++) v[i] -= mid;
  let ul = 1e18, uh = -1e18; for (let i = 0; i < nv; i++) { ul = Math.min(ul, u[i]); uh = Math.max(uh, u[i]); } const L = uh - ul;
  // mirror: each sampled vertex against the nearest of its mirror image, on a hash of cells
  const cell = L / 60, key = (a, b, c) => Math.floor(a / cell) * 73856093 ^ Math.floor(b / cell) * 19349663 ^ Math.floor(c / cell) * 83492791, H = new Map();
  for (let i = 0; i < nv; i++) { const k = key(u[i], P[i * 3 + 1], v[i]); let q = H.get(k); if (!q) H.set(k, q = []); q.push(i); }
  const step = Math.max(1, nv >> 14); let sum = 0, n = 0;
  for (let i = 0; i < nv; i += step) { const a = u[i], b = P[i * 3 + 1], c = -v[i]; let d = 1e18; for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) { const q = H.get(key(a + dx * cell, b + dy * cell, c + dz * cell)); if (q) for (const j of q) d = Math.min(d, (u[j] - a) ** 2 + (P[j * 3 + 1] - b) ** 2 + (v[j] - c) ** 2); } sum += Math.min(Math.sqrt(d), 2.5 * cell); n++; }
  const mirror = 100 * sum / n / L;
  // contacts: the separate patches of surface within 3% of the height of the lowest point
  const band = lo[1] + 0.03 * size[1], cg = L / 80, cells = new Map();
  for (let i = 0; i < nv; i++) if (P[i * 3 + 1] <= band) { const k = Math.floor(u[i] / cg) + ',' + Math.floor(v[i] / cg); cells.set(k, (cells.get(k) || 0) + 1); }
  const seen = new Set(); let contacts = 0; const sizes = [];
  for (const k0 of cells.keys()) { if (seen.has(k0)) continue; let c = 0; const st = [k0]; seen.add(k0); while (st.length) { const k = st.pop(), [a, b] = k.split(',').map(Number); c += cells.get(k); for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++) { const q = (a + x) + ',' + (b + y); if (cells.has(q) && !seen.has(q)) { seen.add(q); st.push(q); } } } sizes.push(c); }
  contacts = sizes.length;
  // pieces, welded
  const W = new Map(), id = new Int32Array(nv); for (let i = 0; i < nv; i++) { const k = Math.round(P[i * 3] * 1e5) + ',' + Math.round(P[i * 3 + 1] * 1e5) + ',' + Math.round(P[i * 3 + 2] * 1e5); if (!W.has(k)) W.set(k, W.size); id[i] = W.get(k); }
  const up = new Int32Array(W.size).map((_, i) => i), find = a => { while (up[a] !== a) a = up[a] = up[up[a]]; return a; };
  for (let t = 0; t < F.length; t += 3) { const a = find(id[F[t]]), b = find(id[F[t + 1]]); up[b] = a; up[find(id[F[t + 2]])] = find(a); }
  const cnt = new Map(); for (let t = 0; t < F.length; t += 3) { const r = find(id[F[t]]); cnt.set(r, (cnt.get(r) || 0) + 1); } const pcs = [...cnt.values()].sort((a, b) => b - a), tris = F.length / 3;
  return { tris, mb: +g.mb.toFixed(1), prims: g.prims, mats: g.mats, tex: Object.keys(g.tex).filter(k => g.tex[k]).join('+') || 'none', ext: g.ext.join(' '), contacts, want: spec && spec.contacts, mirror: +mirror.toFixed(2), pieces: pcs.length, tiny: pcs.filter(s => s < 12).length, debris: +(100 * (1 - pcs[0] / tris)).toFixed(1) };
}

const key = process.argv[2], dir = path.join(__dirname, 'sources', key), spec = fs.existsSync(path.join(dir, 'spec.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'spec.json'), 'utf8')) : null;
const files = process.argv.length > 3 ? process.argv.slice(3) : fs.readdirSync(dir).filter(f => /^raw-.*\.glb$/.test(f)).sort(), out = {};
for (const f of files) { try { const m = measure(path.join(dir, f), spec); out[f] = m; console.log(key.padEnd(16), f.padEnd(17), 'tris', String(m.tris).padEnd(8), 'MB', String(m.mb).padEnd(6), 'feet', m.contacts + '/' + m.want, 'mirror', String(m.mirror) + '%', 'pieces', m.pieces, 'tiny', m.tiny, 'debris', m.debris + '%', 'prims', m.prims, 'tex', m.tex, m.ext); } catch (e) { console.log(key, f, 'FAILED', e.message); } }
fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify(out, null, 1) + '\n');
