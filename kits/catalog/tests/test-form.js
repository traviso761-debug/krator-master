#!/usr/bin/env node
/* The catalog's export form (krator-furniture-core.js, "THE EXPORT FORM"; GODOT-LOOK-PLAN.md section 13): the chamfered
   box on the box's own vertices and the grain's way a vertex, behind KF.setForm and off without it. Every piece of the
   generic set is batched three ways (as it is, chamfered, chamfered with grain) and compared. Each check has a negative.
     node kits/catalog/tests/test-form.js */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const CAT = path.join(__dirname, '..');
const AT = require(path.join(__dirname, '..', '..', '..', 'core', 'catalog', 'catalog-files.js'));
const ctx2d = new Proxy({}, { get: (t, k) => {
  if (k === 'measureText') return () => ({ width: 10 });
  if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
  if (k === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
  return typeof k === 'string' ? () => {} : undefined;
}, set: () => true });
function run(form) {
  const g = { console: { log() {}, warn() {}, error() {} } };
  for (const k of Object.getOwnPropertyNames(globalThis)) if (!(k in g)) g[k] = globalThis[k];
  g.self = g; g.window = g; g.globalThis = g;
  g.document = { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ctx2d, addEventListener() {} }) };
  vm.createContext(g);
  vm.runInContext(fs.readFileSync(path.join(CAT, 'three.min.js'), 'utf8'), g);
  const files = ['krator-furniture-core.js', 'krator-symbols.js', 'krator-furniture-kit.js', 'krator-master-furniture.js', 'krator-master-furniture-generic.js', 'krator-furniture-runtime.js'];
  const src = 'var scene = { add() {}, remove() {} };\n' + files.map(f => fs.readFileSync(AT(f), 'utf8')).join('\n;\n') + `
;(function () {
  const API = KF_API;
  if (${JSON.stringify(form)}) API.setForm(${JSON.stringify(form)});
  const keys = Object.keys(FURN_BY_KEY).sort().slice(0, 120), out = { keys: keys.length, verts: 0, tris: 0, grain: 0, grainUnit: 0, grainZero: 0, open: 0, errors: 0, pos: [] };
  const B = API.batch({ indexed: true });
  keys.forEach((k, i) => { const r = B.place(k, (i % 12) * 4, 0, Math.floor(i / 12) * 4, 0.3 * i); if (r && r.error) out.errors++; });
  for (const k in B.buckets) { const b = B.buckets[k]; out.verts += b.pos.n / 3; out.tris += b.idx.n / 3;
    if (out.pos.length < 3000) for (let i = 0; i < Math.min(b.pos.n, 600); i++) out.pos.push(b.pos.a[i]);
    if (b.grn) { out.grain += b.grn.n / 3; for (let i = 0; i < b.grn.n; i += 3) { const L = Math.hypot(b.grn.a[i], b.grn.a[i + 1], b.grn.a[i + 2]); if (Math.abs(L - 1) < 1e-4) out.grainUnit++; else if (L < 1e-6) out.grainZero++; } } }
  const grp = new THREE.Group(); B.flush(grp);
  out.attr = 0; grp.traverse(o => { if (o.isMesh && o.geometry.attributes.aGrain) out.attr++; });
  globalThis.__out = out;
})();`;
  vm.runInContext(src, g, { filename: 'catalog' });
  return g.__out;
}
const plain = run(null), ch = run({ chamfer: 0.008 }), both = run({ chamfer: 0.008, grain: true }), sel = run({ chamfer: 'none' });
T.ok('the generic set builds either way (' + plain.keys + ' pieces)', plain.keys > 50 && plain.errors === 0 && ch.errors === 0 && both.errors === 0, JSON.stringify([plain.errors, ch.errors, both.errors]));
T.ok('chamfered, the pieces have the same vertices and more triangles (' + plain.tris + ' to ' + ch.tris + ' on ' + plain.verts + ' vertices)', ch.verts === plain.verts && ch.tris > plain.tris * 1.2, ch.verts + ' ' + ch.tris);
T.ok('and the vertices have moved by no more than a bevel along each of two edges', (() => { let far = 0, moved = 0; for (let i = 0; i < plain.pos.length; i += 3) { const d = Math.hypot(ch.pos[i] - plain.pos[i], ch.pos[i + 1] - plain.pos[i + 1], ch.pos[i + 2] - plain.pos[i + 2]); if (d > 1e-7) moved++; if (d > 0.008 * Math.SQRT2 + 1e-5) far++; } return moved > 0 && far === 0; })());
T.neg('with no form set nothing is chamfered and no grain is written', r => r.tris === plain.tris && r.grain === 0 && r.attr === 0, ch, plain);
T.ok('with grain on every vertex of an indexed batch carries a way: a unit vector on a box or a beam, nothing on a turned part',
  both.grain === both.verts && both.grainUnit > 0 && both.grainZero > 0 && both.grainUnit + both.grainZero === both.grain && both.attr > 0, JSON.stringify([both.grain, both.verts, both.grainUnit, both.grainZero, both.attr]));
T.ok('negative: chamfer alone writes no grain', ch.grain === 0 && ch.attr === 0);
T.ok('negative: a chamfer that is not a number or a function chamfers nothing', sel.tris === plain.tris);
T.done();
