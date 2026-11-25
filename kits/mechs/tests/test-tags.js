#!/usr/bin/env node
/* kits/mechs/tests/test-tags.js: the mechs register through core/tags as class 'vehicle', kind 'mech' (Stage 8 T9, 2026-11-24;
   the owner: make new tags). The kit's bundle (mech_bundle.bundle(None): every culture) is evaluated with three.js, then
   core/rand and core/tags, and:
   1. the vocabulary holds the kit's lists: every value of KratorMechs.TYPES, DRIVES, PILOTS and WEAPONS is in core/tags'
      types, drives, pilots and weapons, and every mech culture is a core/tags culture or an alias of one;
   2. KratorMechs.record(key, {variant}) gives every variant of every mech a record of class 'vehicle', kind 'mech', its box its
      size, its tags the variant's in core/tags' keys (no class tag); KratorMechs.register(T, key, o) stores it as veh_*;
   3. the registry's audit finds no unknown key and no unknown value, and a query for vehicles finds every mech;
   4. NEGATIVE: a record with a drive core/tags does not know is caught by that audit;
   5. NEGATIVE: a kit drive missing from the vocabulary is caught by check 1's comparison.
     node kits/mechs/tests/test-tags.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

let js = null;
for (const py of [process.env.PYTHON, 'python3', 'python'].filter(Boolean)) {
  try {
    js = cp.execFileSync(py, ['-c', 'import sys; sys.path.insert(0, sys.argv[1]); import mech_bundle; sys.stdout.buffer.write(mech_bundle.bundle(None).encode("utf-8"))',
      path.join(ROOT, 'kits', 'mechs')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] });
    break;
  } catch (e) { /* the next name */ }
}
if (!js) { console.log('FAIL python could not seal kits/mechs/mech_bundle.py'); process.exit(1); }
const threePath = ['kits/mechs/three.min.js', 'kits/motor-vehicles/three.min.js', 'kits/ancients/three.min.js'].find(p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) { console.log('FAIL three.min.js not found (a Git LFS pointer?)'); process.exit(1); }
const C = { console, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, TypeError, Float32Array, Float64Array,
  Uint8Array, Uint16Array, Uint32Array, Int32Array, Map, Set, WeakMap, Proxy };
C.window = C; C.globalThis = C; C.self = C;
vm.createContext(C);
vm.runInContext(fs.readFileSync(path.join(ROOT, threePath), 'utf8'), C);
for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), C, { filename: f });
vm.runInContext(js + ';globalThis.KM=KratorMechs;', C, { filename: 'mech_bundle.js' });
const KM = C.KM, KTAGS = C.KTAGS, V = KTAGS.VOCAB, list = KM.list();

/* 1. the vocabulary holds the kit's lists */
const LISTS = { TYPES: 'types', DRIVES: 'drives', PILOTS: 'pilots', WEAPONS: 'weapons' };
const missing = (kit, vocab) => {
  const out = [];
  for (const k in LISTS) (kit[k] || []).forEach(x => { if (!Array.isArray(vocab[LISTS[k]]) || vocab[LISTS[k]].indexOf(x) < 0) out.push(LISTS[k] + ':' + x); });
  return out;
};
const gaps = missing(KM, V), cultures = KM.cultures(), badCult = cultures.filter(c => V.cultures.indexOf(c) < 0 && !(V.cultureAlias[c] && V.cultures.indexOf(V.cultureAlias[c].culture) >= 0));
T.ok('core/tags holds the kit\'s types, drives, pilots and weapons, and every mech culture is a culture or an alias of one',
  !gaps.length && !badCult.length && cultures.length >= 3, gaps.concat(badCult.map(c => 'culture:' + c)).join(', '));

/* 2. the record and the registry, every variant */
const reg = KTAGS.create({ build: 'test-mechs' }), bad = [], HAS = typeof KM.record === 'function' && typeof KM.register === 'function';
let n = 0;
if (!HAS) bad.push('no KratorMechs.record / register');
if (HAS) list.forEach((e, i) => {
  for (let v = 0; v < e.variants; v++) {
    const t = KM.tagsOf(e.key, v), o = { at: [i * 20, 0, v * 20], ry: 0.5, variant: v };
    const r = KM.record(e.key, o);
    if (!r || r['class'] !== 'vehicle' || r.kind !== 'mech' || r.key !== e.key || r.size[0] !== e.w || r.size[1] !== e.d || r.size[2] !== e.h ||
        r.tags.culture !== e.culture || 'class' in r.tags || 'type' in r.tags || JSON.stringify(r.tags.types) !== JSON.stringify(t.type) ||
        r.tags.drive !== t.drive || JSON.stringify(r.tags.weapon) !== JSON.stringify(t.weapon) || r.tags.pilot !== t.pilot) bad.push(e.key + '#' + v);
    const s = KM.register(reg, e.key, o); n++;
    if (!s || s['class'] !== 'vehicle' || s.kind !== 'mech' || !/^veh_/.test(s.id)) bad.push(e.key + '#' + v + ' (stored ' + (s && s.id) + ')');
  }
});
T.ok('every mech variant\'s record is class vehicle, kind mech, with its box, culture, types, drive, pilot and weapons, and registers as veh_*',
  !bad.length && HAS && n > 30 && KM.record('no-such-mech', {}) === null, bad.slice(0, 5).join(', '));

/* 3. the audit, and a query for vehicles */
const A = reg.audit(), uk = A.unknownKeys || {}, uv = A.unknownValues || {};
T.ok('core/tags\' audit finds no unknown key or value in the mechs\' records, and a query for vehicles finds every one',
  !Object.keys(uk).length && !Object.keys(uv).length && (A.byClass || {}).vehicle === n && reg.query({ 'class': 'vehicle' }).length === n &&
  reg.query({ 'class': 'vehicle', kind: 'mech' }).length === n && reg.query({ 'class': 'vehicle', tags: { drive: 'tripod' } }).length >= 1,
  'unknown keys ' + JSON.stringify(uk) + ' values ' + JSON.stringify(uv) + ' byClass ' + JSON.stringify(A.byClass) + ' of ' + n);

/* 4. negative: an unknown drive */
const valuesOf = rec => { const t = KTAGS.create({ build: 'neg' }); t.add(rec); const a = t.audit(); return Object.keys(a.unknownKeys || {}).concat(Object.keys(a.unknownValues || {})); };
const good = HAS ? KM.record(list[0].key, {}) : { 'class': 'vehicle', kind: 'mech', key: list[0].key, at: [0, 0, 0], tags: { culture: 'ancient', drive: 'biped' } };
const pogo = JSON.parse(JSON.stringify(good)); pogo.tags.drive = 'pogo';
T.neg('a mech record with a drive core/tags does not know is caught by the audit', rec => !valuesOf(rec).length, pogo, good);

/* 5. negative: the drift check catches a kit drive the vocabulary lacks */
T.neg('a kit drive missing from core/tags\' drives is caught', vocab => !missing(KM, vocab).length,
  Object.assign({}, V, { drives: V.drives.filter(d => d !== 'hexapod') }), V);
T.done();
