#!/usr/bin/env node
/* kits/motor-vehicles/tests/test-tags.js: the vehicles register through core/tags as the class 'vehicle' (Stage 8 B9, T9).
   The kit's bundle (vehicle_bundle.bundle(None, tex=False): every culture, vertex colours only) is evaluated with three.js,
   then core/rand and core/tags, and:
   1. no def carries a tag `class` any more (its 'motor vehicle' was a key core/tags does not know: the class is the record's);
   2. KratorVehicles.record(key, o) gives every vehicle a core/tags record of class 'vehicle', its box its size, its tags the
      kit's own in core/tags' keys; KratorVehicles.register(T, key, o) stores it (an id with the class's prefix, ves_ / veh_);
   3. the registry's audit finds no unknown key in any vehicle's record;
   4. NEGATIVE: a record that still carries tags.class 'motor vehicle' is caught by that audit.
     node kits/motor-vehicles/tests/test-tags.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

let js = null;
for (const py of [process.env.PYTHON, 'python3', 'python'].filter(Boolean)) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import vehicle_bundle; sys.stdout.buffer.write(vehicle_bundle.bundle(None, tex=False).encode("utf-8"))',
      path.join(ROOT, 'kits', 'motor-vehicles')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL python could not seal kits/motor-vehicles/vehicle_bundle.py'); process.exit(1); }
const threePath = ['kits/motor-vehicles/three.min.js', 'kits/ancients/three.min.js', 'kits/catalog/three.min.js'].find(p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) { console.log('FAIL three.min.js not found (a Git LFS pointer?)'); process.exit(1); }
const C = { console, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, TypeError, Float32Array, Float64Array,
  Uint8Array, Uint16Array, Uint32Array, Int32Array, Map, Set, WeakMap, Proxy };
C.window = C; C.globalThis = C; C.self = C;
vm.createContext(C);
vm.runInContext(fs.readFileSync(path.join(ROOT, threePath), 'utf8'), C);
for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), C, { filename: f });
vm.runInContext(js + ';globalThis.KV=KratorVehicles;', C, { filename: 'vehicle_bundle.js' });
const KV = C.KV, KTAGS = C.KTAGS, list = KV.list();

/* 1. no class tag */
const tagged = list.filter(e => e.tags && e.tags['class'] !== undefined).map(e => e.key);
T.ok('no vehicle def carries a tag class (the class is the core/tags record\'s)', list.length > 20 && !tagged.length, tagged.join(', ') || list.length + ' vehicles');

/* 2. the record and the registry */
const reg = KTAGS.create({ build: 'test-vehicles' }), bad = [], HAS = typeof KV.record === 'function' && typeof KV.register === 'function';
if (!HAS) bad.push('no KratorVehicles.record / register');
if (HAS) list.forEach((e, i) => {
  const r = KV.record(e.key, { at: [i * 20, 0, 5], ry: 0.5 });
  if (!r || r['class'] !== 'vehicle' || r.key !== e.key || r.size[0] !== e.w || r.size[2] !== e.h || r.tags.culture !== e.culture ||
      JSON.stringify(r.tags.types) !== JSON.stringify(e.tags.type) || r.tags.drive !== e.tags.drive) bad.push(e.key);
  const s = KV.register(reg, e.key, { at: [i * 20, 0, 5], ry: 0.5 });
  if (!s || s['class'] !== 'vehicle' || !/^veh_/.test(s.id)) bad.push(e.key + ' (stored ' + (s && s.id) + ')');
});
T.ok('every vehicle\'s record is class vehicle with its box, culture, types and drive, and registers as veh_*', !bad.length && HAS && KV.record('no-such-car', {}) === null,
  bad.slice(0, 5).join(', '));

/* 3. the audit */
const A = reg.audit(), unknownKeys = A.unknownKeys || {};
T.ok('core/tags\' audit finds no unknown key in the vehicles\' records', !Object.keys(unknownKeys).length && (A.byClass || {}).vehicle === list.length,
  JSON.stringify(unknownKeys) + ' byClass ' + JSON.stringify(A.byClass) + ' unknown values ' + JSON.stringify(A.unknownValues));

/* 4. negative: the old class tag */
const keysOf = rec => { const t = KTAGS.create({ build: 'neg' }); t.add(rec); return Object.keys(t.audit().unknownKeys || {}); };
const good = HAS ? KV.record(list[0].key, {}) : { 'class': 'vehicle', key: list[0].key, at: [0, 0, 0], tags: { culture: list[0].culture } }, old = JSON.parse(JSON.stringify(good)); old.tags['class'] = 'motor vehicle';
T.neg('a record still tagged class \'motor vehicle\' is caught by the audit', rec => !keysOf(rec).length, old, good);
T.done();
