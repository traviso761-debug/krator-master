#!/usr/bin/env node
/* kits/tents/tests/test-bundle.js: the Tents kit sealed for another world (kits/tents/tents_bundle.py, TNK; Stage 8 B9, T27).
   The bundle is evaluated as a page would take it (three.js, core/rand, core/materials/record, core/tags and core/door before
   it, as kits/kulanewa/tests/test-kulanewa.js loads KLK), then:
   1. TNK.dims() lists the kit's 25 defs with the table's declared boxes (tnDims), and nothing else;
   2. every def builds at the origin in the generic dress and in two peoples' (Xanadu's silk, the desert nomads'), with
      geometry, no error, its own key and the dress asked for;
   3. the same placement builds the same tent (the colours are KRAND.hash of world, cell and index, never a draw count);
   4. a dress the kit lacks falls back to generic and says so (TNK.dress), a culture's spelling aliases;
   5. NEGATIVES: an unknown key gives null; a second world seed changes the colours of a dress that draws them.
     node kits/tents/tests/test-bundle.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

let js = null;
for (const py of [process.env.PYTHON, 'python3', 'python'].filter(Boolean)) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import tents_bundle; sys.stdout.buffer.write(tents_bundle.bundle("TNK")[0].encode("utf-8"))',
      path.join(ROOT, 'kits', 'tents')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL no TNK: python could not seal kits/tents/tents_bundle.py'); process.exit(1); }
const threePath = ['kits/ancients/three.min.js', 'kits/catalog/three.min.js', 'tools/three.min.js'].find(p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) { console.log('FAIL three.min.js not found (a Git LFS pointer?)'); process.exit(1); }
const C = { console, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, TypeError, Float32Array, Float64Array,
  Uint8Array, Uint16Array, Uint32Array, Int32Array, Map, Set, WeakMap, Proxy, performance: { now: () => 0 }, location: { search: '', hash: '' },
  Image: class { set src(v) { if (this.onload) this.onload(); } } };
C.window = C; C.globalThis = C; C.self = C;
vm.createContext(C);
vm.runInContext(fs.readFileSync(path.join(ROOT, threePath), 'utf8'), C);
for (const f of ['core/rand/08-core-rand.js', 'core/materials/record/23-mat-record.js', 'core/materials/record/24-tex-def.js',
  'core/materials/record/25-matlib-host.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js',
  'core/door/10-core-door.js', 'core/door/20-core-glass.js', 'core/door/30-core-door-leaf.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), C, { filename: f });
vm.runInContext(js + ';globalThis.TNK=TNK;', C, { filename: 'tnk_bundle.js' });
const TNK = C.TNK;

/* 1. the dims */
const dims = TNK.dims(), keys = Object.keys(dims);
const boxOk = keys.every(k => { const s = TNK.spec(k); return s && dims[k].w > 0 && dims[k].d > 0 && dims[k].h > 0 && dims[k].form === s.form; });
T.ok('TNK.dims(): the 25 defs, each with its declared box and form', keys.length === 25 && keys.length === TNK.KEYS.length && boxOk, keys.length + ' defs');

/* 2. every def in three dresses */
const fails = [];
for (const dr of ['generic', 'xanadu', 'desert']) for (const k of TNK.KEYS) {
  const G = TNK.proto(k, { dress: dr, world: 7, cell: 3, index: 1 });
  if (!G || !(G.userData.tris > 0) || G.userData.key !== k || G.userData.dress !== dr || !G.children.length) fails.push(dr + ' ' + k);
}
T.ok('every def builds in the generic, Xanadu and desert dresses, with geometry and no error', !fails.length && !TNK.errors.length,
  fails.slice(0, 6).join(', ') + (TNK.errors.length ? ' errors: ' + TNK.errors.slice(0, 2).join(' | ') : ''));

/* 3. the same placement, the same tent */
const sig = G => { const out = []; G.traverse(o => { if (o.geometry && o.geometry.attributes.color) { const c = o.geometry.attributes.color.array; out.push(o.name + ':' + c.length + ':' + c[0].toFixed(4) + ',' + c[c.length - 1].toFixed(4)); } }); return out.join('|'); };
const a = sig(TNK.proto('tn-yurt-m', { dress: 'scyvoi', world: 11, cell: 2, index: 5 })), b = sig(TNK.proto('tn-yurt-m', { dress: 'scyvoi', world: 11, cell: 2, index: 5 }));
T.ok('the same placement builds the same tent', a.length > 0 && a === b);

/* 4. the dress a culture pitches in */
T.ok('an unknown culture falls back to the generic dress and says so; a spelling aliases', TNK.dress('no-such-people').key === 'generic' &&
  !!TNK.dress('no-such-people').fallback && TNK.dress('nomad').key === 'desert');

/* 5. negatives */
T.neg('an unknown key builds nothing', k => TNK.proto(k, {}) !== null, 'tn-castle-m', 'tn-ridge-s');
const other = sig(TNK.proto('tn-yurt-m', { dress: 'scyvoi', world: 12, cell: 2, index: 5 }));
T.neg('another world seed is caught as another tent (the colours come from the seed)', s => s === a, other, b);
T.done();
