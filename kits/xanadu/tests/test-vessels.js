#!/usr/bin/env node
/* kits/xanadu/tests/test-vessels.js: the lake craft in the kit, registered as core/tags vessels (Stage 8 B9, T7 and T9).
   XAK (kit_bundle.bundle(): the kit's FILES, no extra/) is sealed and run headless, as test-footprints.js runs it, then:
   1. the lake craft (88d: the dugout, the launch, the cargo barge) and the harbour (88f) are in the kit itself, not opt-in;
   2. each craft is a def of class 'vessel' whose tags are core/tags' vessel keys: KTAGS takes the record a page's REG gives
      (settlements/xanadu/src/91t-xanadu-tags.js passes cls through) with no unknown key or value, its id ves_*;
   3. NEGATIVE: a craft tagged with a propulsion core/tags does not know (oars) is caught by the audit.
     node kits/xanadu/tests/test-vessels.js */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const KIT = path.join(__dirname, '..'), ROOT = path.join(KIT, '..', '..');

let js = null;
for (const py of ['python3', 'python']) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import kit_bundle; sys.stdout.buffer.write(kit_bundle.bundle()[0].encode("utf-8"))', KIT],
      { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL no python to seal the bundle (kits/xanadu/kit_bundle.py)'); process.exit(1); }
global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
const ctx = () => new Proxy({}, { get: (t, k) => (k === 'createImageData' || k === 'getImageData')
  ? ((w, h) => ({ data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)), width: w, height: h }))
  : (k === 'canvas' ? { width: 1, height: 1 } : () => ({ addColorStop() {} })) });
global.document = { createElement: () => ({ getContext: ctx, width: 0, height: 0, style: {} }), getElementById: () => null, body: { appendChild() {} } };
global.addEventListener = () => {};
global.requestAnimationFrame = () => {};
(0, eval)(js + ';global.XAK=XAK;');
for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'])
  (0, eval)(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const KTAGS = global.KTAGS, V = global.XAK.VERN;

const CRAFT = ['xa_dugout', 'xa_launch', 'xa_lake_barge'];
T.ok('the lake craft and the harbour are in the kit (XAK without extra/)', CRAFT.every(k => V.defs[k]) && !!V.defs.xa_harbour_quay,
  CRAFT.filter(k => !V.defs[k]).join(', '));
/* the record 91t-xanadu-tags.js makes of a placed def's REG entry */
const recOf = (D, x) => { const t = Object.assign({}, D.tags); delete t.note; delete t.kit;   /* 91t drops these: the key says the kit */
  return { 'class': D.cls, kind: D.key, key: D.key, name: D.name, at: [x, 0, 0], size: [D.w, D.d, D.h || 2], tags: t }; };
const audit = recs => { const t = KTAGS.create({ build: 'xanadu-vessels' }); const ids = recs.map(r => t.add(r).id); const A = t.audit(); return { ids, A }; };
const crafts = CRAFT.filter(k => V.defs[k]).map(k => V.defs[k]);
T.ok('every craft is a def of class vessel', crafts.length === 3 && crafts.every(D => D.cls === 'vessel'));
const R = audit(crafts.map((D, i) => recOf(D, i * 30)));
T.ok('core/tags takes the crafts as vessels (ves_*), no unknown key or value', R.ids.length === 3 && R.ids.every(id => /^ves_/.test(id)) &&
  !Object.keys(R.A.unknownKeys || {}).length && !Object.keys(R.A.unknownValues || {}).length,
  R.ids.join(',') + ' ' + JSON.stringify(R.A.unknownKeys) + ' ' + JSON.stringify(R.A.unknownValues));
const clean = recOf(crafts[0] || { cls: 'vessel', key: 'x', name: 'x', w: 1, d: 1, tags: { propulsion: ['paddles'] } }, 0);
const oars = JSON.parse(JSON.stringify(clean)); oars.tags.propulsion = ['oars'];
T.neg('a propulsion core/tags does not know (oars, not oar) is caught', r => !Object.keys(audit([r]).A.unknownValues || {}).length, oars, clean);
T.done();
