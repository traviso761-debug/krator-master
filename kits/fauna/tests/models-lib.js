// The packed baked models (models/*.json, models_pack.py) read and posed without three.js, and a small CPU rasterizer. No GPU and no
// browser, so the render checks in test-models.js run on every push. Not a test itself (its name has no test- prefix).
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const b64 = (s, T) => { const b = Buffer.from(s, 'base64'), a = new Uint8Array(b.length); a.set(b); return new T(a.buffer); };

/* a model: {M, nodes, parts: {name: {pos, nrm, uv, idx, node}}}; positions in the node's own frame, model units */
function load(file, pick) {
  const F = JSON.parse(fs.readFileSync(file, 'utf8')), M = pick ? registry(path.join(__dirname, '..', '..', '..')).KF.pickModel(F, pick) : F, parts = {}, byName = {};
  M.nodes.forEach((n, i) => { byName[n.name] = i; });
  for (const n in M.meshes) {
    const m = M.meshes[n], q = b64(m.pos, Uint16Array), pos = new Float64Array(q.length), n8 = b64(m.nrm, Int8Array), nrm = new Float64Array(n8.length), uq = b64(m.uv, Uint16Array), uv = new Float64Array(uq.length);
    for (let i = 0; i < q.length; i++) pos[i] = m.min[i % 3] + q[i] / 65535 * m.size[i % 3];
    for (let i = 0; i < n8.length; i++) nrm[i] = n8[i] / 127;
    for (let i = 0; i < uq.length; i++) uv[i] = uq[i] / 65535;
    parts[n] = { name: n, pos, nrm, uv, idx: m.wide ? b64(m.idx, Uint32Array) : b64(m.idx, Uint16Array), node: byName[n] };
  }
  const clips = {};
  for (const cn in M.anims) {
    const A = M.anims[cn], tr = {};
    for (const k of A.tracks) (tr[k.node] || (tr[k.node] = {}))[k.path] = { t: b64(k.t, Float32Array), v: b64(k.v, Float32Array) };
    clips[cn] = { dur: A.dur, tracks: tr, extras: A.extras };
  }
  return { M, key: M.key, parts, clips, byName };
}

const mul = (a, b) => { const r = new Float64Array(16); for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) r[c * 4 + w] = a[w] * b[c * 4] + a[4 + w] * b[c * 4 + 1] + a[8 + w] * b[c * 4 + 2] + a[12 + w] * b[c * 4 + 3]; return r; };
function compose(t, q, s) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  return Float64Array.of((1 - 2 * (y * y + z * z)) * s[0], 2 * (x * y + z * w) * s[0], 2 * (x * z - y * w) * s[0], 0,
    2 * (x * y - z * w) * s[1], (1 - 2 * (x * x + z * z)) * s[1], 2 * (y * z + x * w) * s[1], 0,
    2 * (x * z + y * w) * s[2], 2 * (y * z - x * w) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0, t[0], t[1], t[2], 1);
}
function sample(tr, t, n, d) {
  if (!tr) return d;
  let i = 0; while (i < tr.t.length - 1 && tr.t[i + 1] <= t) i++;
  const k = i + 1 < tr.t.length ? Math.max(0, Math.min(1, (t - tr.t[i]) / Math.max(1e-9, tr.t[i + 1] - tr.t[i]))) : 0, out = [];
  for (let c = 0; c < n; c++) out.push(tr.v[i * n + c] * (1 - k) + (k ? tr.v[(i + 1) * n + c] * k : 0));
  if (n === 4) { const l = Math.hypot(out[0], out[1], out[2], out[3]) || 1; for (let c = 0; c < 4; c++) out[c] /= l; }
  return out;
}
/* every node's world matrix at clip time t; clip null is the rest pose (no tracks) */
function pose(mdl, clip, t) {
  const nodes = mdl.M.nodes, W = new Array(nodes.length), tracks = clip ? clip.tracks : {};
  const go = i => { if (W[i]) return W[i]; const n = nodes[i], tr = tracks[n.name] || {};
    const L = compose(sample(tr.position, t, 3, n.t), sample(tr.quaternion, t, 4, [0, 0, 0, 1]), sample(tr.scale, t, 3, [1, 1, 1]));
    return (W[i] = n.parent < 0 ? L : mul(go(n.parent), L)); };
  nodes.forEach((_, i) => go(i)); return W;
}
const apply = (m, p, o, r) => { const x = p[o], y = p[o + 1], z = p[o + 2]; r[0] = m[0] * x + m[4] * y + m[8] * z + m[12]; r[1] = m[1] * x + m[5] * y + m[9] * z + m[13]; r[2] = m[2] * x + m[6] * y + m[10] * z + m[14]; };

/* the rest pose's bounding sphere over every clip's first frame, so a model's framing does not change with the frame */
function bounds(mdl) {
  let c = null, r = 0; const v = [0, 0, 0], pts = [];
  for (const clip of [null].concat(Object.values(mdl.clips))) { const W = pose(mdl, clip, 0);
    for (const n in mdl.parts) { const P = mdl.parts[n]; for (let i = 0; i < P.pos.length; i += 9) { apply(W[P.node], P.pos, i, v); pts.push(v[0], v[1], v[2]); } } }
  const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < pts.length; i += 3) for (let c2 = 0; c2 < 3; c2++) { lo[c2] = Math.min(lo[c2], pts[i + c2]); hi[c2] = Math.max(hi[c2], pts[i + c2]); }
  c = [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
  for (let i = 0; i < pts.length; i += 3) r = Math.max(r, Math.hypot(pts[i] - c[0], pts[i + 1] - c[1], pts[i + 2] - c[2]));
  return { c, r };
}

/* the camera basis looking along d (unit, world), orthographic */
function basis(d) {
  const up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nz = a => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };
  const x = nz(cr(up, d)), y = cr(d, x); return { x, y, z: d };
}
const SOLID = { none: 0, front: 1, back: 2, other: 3 };
/* Rasterize. classify(partName) -> true for a part whose back faces count as a hole. Returns {res, id, ...}: per pixel 0 empty, 1 a
   watched part's front, 2 a watched part's back (looking in), 3 any other part. Winding decides facing, as a culled material would. */
function raster(mdl, W, B, dir, res, watched) {
  const { x, y, z } = basis(dir), s = res / (2.1 * B.r), N = res * res, zb = new Float64Array(N).fill(-1e30), id = new Uint8Array(N), v = [0, 0, 0];
  for (const n in mdl.parts) {
    const P = mdl.parts[n], w = watched(n), np = P.pos.length / 3, sx = new Float64Array(np), sy = new Float64Array(np), sz = new Float64Array(np);
    for (let i = 0; i < np; i++) { apply(W[P.node], P.pos, i * 3, v); const a = v[0] - B.c[0], b = v[1] - B.c[1], c = v[2] - B.c[2];
      sx[i] = (a * x[0] + b * x[1] + c * x[2]) * s + res / 2; sy[i] = res / 2 - (a * y[0] + b * y[1] + c * y[2]) * s; sz[i] = a * z[0] + b * z[1] + c * z[2]; }
    const I = P.idx;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t], b = I[t + 1], c = I[t + 2], ax = sx[a], ay = sy[a], bx = sx[b], by = sy[b], cx = sx[c], cy = sy[c];
      const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); if (area === 0) continue;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(res - 1, Math.ceil(Math.max(ax, bx, cx))), y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(res - 1, Math.ceil(Math.max(ay, by, cy)));
      const tag = !w ? 3 : (area < 0 ? 1 : 2);   /* y runs down the screen, so a counter-clockwise (front) face has negative area here */
      for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
        const qx = px + 0.5, qy = py + 0.5, l0 = ((bx - qx) * (cy - qy) - (by - qy) * (cx - qx)) / area, l1 = ((cx - qx) * (ay - qy) - (cy - qy) * (ax - qx)) / area, l2 = 1 - l0 - l1;
        if (l0 < 0 || l1 < 0 || l2 < 0) continue;
        const d = l0 * sz[a] + l1 * sz[b] + l2 * sz[c], o = py * res + px; if (d > zb[o]) { zb[o] = d; id[o] = tag; }
      }
    }
  }
  return { res, id, pxPerUnit: s };
}
/* the largest 4-connected blob of value v, in pixels */
function blob(R, v) {
  const { res, id } = R, seen = new Uint8Array(id.length), st = []; let best = 0;
  for (let i = 0; i < id.length; i++) { if (id[i] !== v || seen[i]) continue; let n = 0; st.push(i); seen[i] = 1;
    while (st.length) { const o = st.pop(); n++; const x = o % res, y = (o / res) | 0;
      for (const q of [x > 0 ? o - 1 : -1, x < res - 1 ? o + 1 : -1, y > 0 ? o - res : -1, y < res - 1 ? o + res : -1]) if (q >= 0 && id[q] === v && !seen[q]) { seen[q] = 1; st.push(q); } }
    if (n > best) best = n; }
  return best;
}
/* a debug picture: grey body, magenta where you look into a watched part, dark other parts */
function png(R, file) {
  const { res, id } = R, pal = [[236, 232, 214], [150, 170, 190], [255, 0, 255], [70, 70, 80]], rows = Buffer.alloc((res * 3 + 1) * res);
  for (let y = 0; y < res; y++) { rows[y * (res * 3 + 1)] = 0; for (let x = 0; x < res; x++) { const c = pal[id[y * res + x]], o = y * (res * 3 + 1) + 1 + x * 3; rows[o] = c[0]; rows[o + 1] = c[1]; rows[o + 2] = c[2]; } }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = b => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const h = Buffer.alloc(13); h.writeUInt32BE(res, 0); h.writeUInt32BE(res, 4); h[8] = 8; h[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', h), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]));
}
const dirs = () => { const out = [], k = Math.SQRT1_2, c = 1 / Math.sqrt(3); for (const a of [-1, 1]) { out.push([a, 0, 0], [0, a, 0], [0, 0, a]); for (const b of [-1, 1]) for (const d of [-1, 1]) out.push([a * c, b * c, d * c]); } return out.filter((v, i, A) => A.findIndex(q => q.every((x, j) => x === v[j])) === i); };
const TRUNK = /^(torso|thorax|midsheet|abd2?|seg\d+)$/;

/* the kit's real catalog in a vm, without the baked models, so build() draws the procedural animal (tests/test-lands.js's way) */
function registry(root, models) {
  const vm = require('vm'), KIT = path.join(root, 'kits', 'fauna'), THREE = require(path.join(root, 'kits', 'ancients', 'three.min.js'));
  class Img { set src(v) { this._s = v; } }      /* no browser: a model's maps are never decoded, only its data is read */
  const ctx = { console, Math, THREE, Image: Img, atob: s => Buffer.from(s, 'base64').toString('latin1'), MODELS: models || null }; ctx.globalThis = ctx; vm.createContext(ctx);
  const sp = fs.readdirSync(KIT).filter(f => /^krator-fauna-.*\.js$/.test(f) && f !== 'krator-fauna-runtime.js').sort();
  const body = ['fauna-core.js'].concat(sp, ['krator-fauna-runtime.js']).map(f => fs.readFileSync(path.join(KIT, f), 'utf8')).join('\n');
  vm.runInContext('var KratorFauna = (function () { const FA_TEX = null; const FA_MODELS = MODELS;\n' + body + '\nreturn KratorFaunaAPI; })();', ctx, { filename: 'fauna-bundle' });
  return { KF: ctx.KratorFauna, THREE };
}
/* the entries that name a model: [{key, variant, model, E}] */
function modelled(KF) {
  const out = [];
  for (const L of KF.list()) { const E = KF.entry(L.key); for (const v in (E.models || {})) out.push({ key: L.key, variant: +v, model: E.models[v], E }); }
  return out;
}

module.exports = { load, pose, apply, bounds, raster, blob, png, dirs, TRUNK, registry, modelled };
