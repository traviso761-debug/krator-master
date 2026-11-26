// node kits/fauna/rig/fit_anchors.js: the anchors of each model variant, written to rig/anchors.json, which rig/patch_models.py merges
// into models/<key>.json. The procedural build of the same variant says which anchors the animal has and roughly where. A Meshy body
// differs in shape, so each anchor is stretched along the body to the model's length and moved to the nearest surface of the model at
// rest: the trunk for what straps on (saddle, pack ...), the trunk or head for the rest. Run it after models_pack.py.
'use strict';
const fs = require('fs'), path = require('path');
const L = require('../tests/models-lib.js');
const ROOT = path.join(__dirname, '..', '..', '..'), { KF, THREE } = L.registry(ROOT), out = {};
const STRAPPED = /^(saddle|pack|howdah|yoke|harness|trace)$/, HEADISH = /^(head|neck)$/;
const r4 = x => Math.round(x * 1e4) / 1e4;

const cand = process.argv.indexOf('--candidate'), rows = cand > 0 ? [{ key: process.argv[cand + 2], variant: 0, file: process.argv[cand + 1] }] : L.modelled(KF);      /* --candidate <packed.json> <entry key>: fit a model not in the kit yet, in place */
for (const row of rows) {
  let g; try { g = KF.build(row.key, { variant: row.variant, seed: 3 }); } catch (e) { continue; }   /* a model-only animal (dog, cat) has no procedural build */
  const A = g.userData.anchors || {}, names = Object.keys(A).filter(n => !/^spread\d/.test(n)); if (!names.length) continue;
  const m = L.load(row.file || path.join(ROOT, 'kits', 'fauna', 'models', row.model.split('#')[0] + '.json'), row.model && row.model.split('#')[1]), M = m.M, S = M.scale, W = L.pose(m, m.clips.perch, 0), v = [0, 0, 0];
  const off = [-M.rest.center[0] * S, -M.rest.ground * S, -M.rest.center[1] * S], box = new THREE.Box3().setFromObject(g), cz = (box.min.z + box.max.z) / 2, kz = M.rest.d / Math.max(box.max.z - box.min.z, 1e-6);
  const pts = [];
  for (const n in m.parts) { const P = m.parts[n]; if (!L.TRUNK.test(n) && !HEADISH.test(n)) continue;
    for (let i = 0; i < P.pos.length; i += 3) { L.apply(W[P.node], P.pos, i, v); pts.push({ n, node: P.node, x: v[0] * S + off[0], y: v[1] * S + off[1], z: v[2] * S + off[2] }); } }
  const res = {};
  for (const a of names) { const p = A[a], q = [p[0], p[1], (p[2] - cz) * kz]; let best = null, bd = 1e30;
    for (const c of pts) { if (STRAPPED.test(a) && !L.TRUNK.test(c.n)) continue; const d = (c.x - q[0]) ** 2 + (c.y - q[1]) ** 2 + (c.z - q[2]) ** 2; if (d < bd) { bd = d; best = c; } }
    if (!best) continue;
    const w = [best.x, best.y, best.z], lx = (w[0] - off[0]) / S, ly = (w[1] - off[1]) / S, lz = (w[2] - off[2]) / S, Mx = W[best.node], dx = lx - Mx[12], dy = ly - Mx[13], dz = lz - Mx[14];
    res[a] = { p: w.map(r4), node: M.nodes[best.node].name, at: [dx * Mx[0] + dy * Mx[1] + dz * Mx[2], dx * Mx[4] + dy * Mx[5] + dz * Mx[6], dx * Mx[8] + dy * Mx[9] + dz * Mx[10]].map(x => Math.round(x * 1e6) / 1e6) }; }
  if (row.file) { M.anchors = res; fs.writeFileSync(row.file, JSON.stringify(M)); console.log(row.key, Object.keys(res).map(a => a + ' on ' + res[a].node).join(', ')); process.exit(0); }
  out[row.model] = res; console.log(row.model, Object.keys(res).map(a => a + ' on ' + res[a].node).join(', '));
}
fs.writeFileSync(path.join(__dirname, 'anchors.json'), JSON.stringify(out, null, 1) + '\n');
