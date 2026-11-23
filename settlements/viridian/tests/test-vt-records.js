#!/usr/bin/env node
/* settlements/viridian/tests/test-vt-records.js: the Order of Viridian Thought's own buildings (src/89qv, 89qw; PLAN.md
   section 7) built headless and checked:
     - every planned qb_vt_* def is registered, and builds at every variant without a throw;
     - every one stays on its lot (its def's w x d) within TOL, measured from every instance it drew, as the Xanadu kit's
       footprint test measures (kits/xanadu/tests/test-footprints.js, read for the method; townsfolk left out);
     - every reseed() in this settlement's src is in the block the Qiblai kit's session gave it, 34200-34399;
     - the dress is the green spoke's (QSPOKE[3]).
   The bundle is the Xanadu kit with the Qiblai kit (kits/xanadu/kit_bundle.py, bundle(qiblai=True)) and this folder's src/
   added in filename order.

     node settlements/viridian/tests/test-vt-records.js [--all] [--why]   (--all prints every def's box; --why the items past a lot)
   Needs python3 (or python) to seal the bundle. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..');
const T = require(path.join(ROOT, 'tools', 'ktest.js'))(__filename);
const ALL = process.argv.includes('--all'), WHY = process.argv.includes('--why');
const TOL = 0.3;
const FIGURES = new Set(['figB', 'figH']);
const SEED_LO = 34200, SEED_HI = 34399;
const PLANNED = ['qb_vt_wither', 'qb_vt_roll_fire', 'qb_vt_pack', 'qb_vt_tasting', 'qb_vt_drying', 'qb_vt_still', 'qb_vt_curing',
  'qb_vt_shade', 'qb_vt_log_yard', 'qb_vt_spring', 'qb_vt_grange', 'qb_vt_shelter', 'qb_vt_hermitage', 'qb_vt_terrace_plot', 'qb_vt_physic'];
const SRC = fs.readdirSync(path.join(HERE, 'src')).filter(f => /^\d\d[\w-]*\.js$/.test(f)).sort().map(f => path.join(HERE, 'src', f));

/* the bundle: kit_bundle.files() with this folder's fragments added, sorted by name as the kit's own are */
const PY = 'import os, sys; sys.path.insert(0, sys.argv[1]); import kit_bundle as kb\n' +
  'extra = sys.argv[2:]\norig = kb.files\n' +
  'kb.files = lambda scrap=False, qiblai=False: sorted(orig(scrap, qiblai) + extra, key=os.path.basename)\n' +
  'sys.stdout.buffer.write(kb.bundle(qiblai=True)[0].encode("utf-8"))';
let js = null;
for (const py of ['python3', 'python']) {
  try {
    js = cp.execFileSync(py, ['-c', PY, path.join(ROOT, 'kits', 'xanadu'), ...SRC],
      { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL the bundle did not seal (python3 or python, kits/xanadu/kit_bundle.py)'); process.exit(1); }
global.THREE = require(path.join(ROOT, 'kits', 'catalog', 'three.min.js'));
const ctx = () => new Proxy({}, { get: (t, k) => (k === 'createImageData' || k === 'getImageData')
  ? ((w, h) => ({ data: new Uint8ClampedArray(Math.max(4, (w | 0) * (h | 0) * 4)), width: w, height: h }))
  : (k === 'canvas' ? { width: 1, height: 1 } : () => ({ addColorStop() {} })) });
global.document = { createElement: () => ({ getContext: ctx, width: 0, height: 0, style: {} }), getElementById: () => null, body: { appendChild() {} } };
global.addEventListener = () => {};
global.requestAnimationFrame = () => {};
(0, eval)(js + ';global.XAK=XAK;');

const dims = XAK.dims(), m = new THREE.Matrix4(), b = new THREE.Box3(), p = new THREE.Vector3();
function instBox(geo, M) {
  const P = geo.attributes && geo.attributes.position;
  if (!P || P.count > 256) return b.copy(geo.boundingBox).applyMatrix4(M);
  b.makeEmpty();
  for (let i = 0; i < P.count; i++) b.expandByPoint(p.fromBufferAttribute(P, i).applyMatrix4(M));
  return b;
}
/* one def at one variant: the box of all it drew (x, z) and how far it reaches past a lot w x d */
function measure(key, v, D) {
  const e0 = XAK.errors.length, ce = console.error;
  console.error = () => {};
  let G;
  try { G = XAK.proto(key, v); } finally { console.error = ce; }
  if (XAK.errors.length > e0) return { err: XAK.errors.slice(e0).join(' | ').slice(0, 300) };
  if (!G) return { err: 'XAK.proto returned null' };
  G.updateMatrixWorld(true);
  const box = [Infinity, Infinity, -Infinity, -Infinity], by = {};
  let n = 0;
  G.traverse(o => {
    if (!o.geometry) return;
    const name = (o.userData && o.userData.kdef) || o.name || 'mesh';
    if (FIGURES.has(name)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const k = o.isInstancedMesh ? o.count : 1;
    for (let i = 0; i < k; i++) {
      if (o.isInstancedMesh) { o.getMatrixAt(i, m); m.premultiply(o.matrixWorld); } else m.copy(o.matrixWorld);
      instBox(o.geometry, m);
      if (!isFinite(b.min.x) || !isFinite(b.max.x)) continue;
      n++;
      box[0] = Math.min(box[0], b.min.x); box[1] = Math.min(box[1], b.min.z); box[2] = Math.max(box[2], b.max.x); box[3] = Math.max(box[3], b.max.z);
      const o2 = Math.max(b.max.x - D.w / 2, -D.w / 2 - b.min.x, b.max.z - D.d / 2, -D.d / 2 - b.min.z);
      if (o2 > TOL && o2 > (by[name] || 0)) by[name] = o2;
    }
  });
  return { box, n, by };
}
const past = (B, w, d) => Math.max(B[2] - w / 2, -w / 2 - B[0], B[3] - d / 2, -d / 2 - B[1]);
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);

/* ---- registered */
const keys = Object.keys(dims).filter(k => /^qb_vt_/.test(k));
const missing = PLANNED.filter(k => !dims[k]);
T.ok('every planned qb_vt_ def is registered (' + keys.length + ')', missing.length === 0 && keys.length === PLANNED.length,
  missing.length ? 'missing ' + missing.join(', ') : keys.filter(k => !PLANNED.includes(k)).join(', '));

/* ---- built, on its lot */
const fails = [], errs = [];
let measured = 0;
const cache = {};
for (const key of keys) {
  const D = dims[key], nv = Math.min(D.variants || 1, 5);
  for (let v = 0; v < nv; v++) {
    const r = measure(key, v, D);
    if (r.err) { errs.push(key + ' v' + v + ': ' + r.err); continue; }
    if (!r.n) { errs.push(key + ' v' + v + ': drew nothing'); continue; }
    measured++;
    cache[key + '/' + v] = r;
    const over = past(r.box, D.w, D.d);
    if (ALL) console.log('  ' + key + ' v' + v + '  ' + r.n + ' instances; x ' + f2(r.box[0]) + '..' + f2(r.box[2]) + ', z ' + f2(r.box[1]) + '..' + f2(r.box[3]) + '  (lot ' + D.w + ' x ' + D.d + ', past ' + f2(over) + ')');
    if (WHY && over > TOL) console.log('  ' + key + ' v' + v + ' past its lot: ' + Object.entries(r.by).map(([k, x]) => k + ' ' + f2(x)).join(', '));
    if (over > TOL) fails.push(key + ' v' + v + ' reaches ' + f2(over) + ' m past its ' + D.w + ' x ' + D.d + ' lot');
  }
}
T.ok('every qb_vt_ def builds at every variant', errs.length === 0, errs.slice(0, 4).join(' | '));
T.ok('every qb_vt_ def stays on its lot within ' + TOL + ' m (' + measured + ' builds)', fails.length === 0 && measured > 0, fails.slice(0, 6).join('; '));
/* the lot check would catch a def drawn past its lot: the spring house's box against a lot 2 m narrower fails, against its own passes */
{ const r = cache['qb_vt_spring/0'], D = dims.qb_vt_spring;
  T.neg('a def drawn past its lot is caught', w => !!r && past(r.box, w, D.d) <= TOL, D.w - 4, D.w); }

/* ---- the seed block */
const seedsOf = text => { const out = []; const re = /\breseed\(\s*(\d+)/g; let mm; while ((mm = re.exec(text))) out.push(+mm[1]); return out; };
const seeds = SRC.flatMap(f => seedsOf(fs.readFileSync(f, 'utf8')));
const inBlock = list => list.length > 0 && list.every(s => s >= SEED_LO && s <= SEED_HI);
T.ok('every reseed() in src/ is in 34200-34399 (' + seeds.length + ' builders)', inBlock(seeds), seeds.filter(s => s < SEED_LO || s > SEED_HI).join(','));
T.neg('a seed outside the block is caught', list => inBlock(list), [34201, 34400], [34201, 34399]);
const dup = seeds.filter((s, i) => seeds.indexOf(s) !== i);
T.ok('no two builders share a base seed', dup.length === 0, dup.join(','));

/* ---- the dress: the green spoke's */
const src = SRC.map(f => fs.readFileSync(f, 'utf8')).join('\n');
T.ok('the records wear the green spoke (QSPOKE[3])', /const VT_SP=QSPOKE\[3\]/.test(src), 'VT_SP is not QSPOKE[3]');
T.done();
