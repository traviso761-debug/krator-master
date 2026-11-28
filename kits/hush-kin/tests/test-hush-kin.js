'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ctx = { Math, Object, Array, Number, String, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const rel of [
  '../../core/rand/08-core-rand.js',
  '../../core/tags/50-core-tags.js',
  '../../core/tags/52-core-tags-vocab.js',
  '../../kits/resources/src/42r-res-ore.js',
  'src/26k-kit.js',
  'src/34-hs-trades.js',
  'src/52z-hs-vocab.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const HS = vm.runInContext('HS', ctx);
const HS_STYLES = vm.runInContext('HS_STYLES', ctx);
const HS_LAKES = vm.runInContext('HS_LAKES', ctx);
const HS_HARMONICS = vm.runInContext('HS_HARMONICS', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const HS_TRADES = vm.runInContext('HS_TRADES', ctx);
const hsRigMath = vm.runInContext('hsRigMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);
const KTAGS = vm.runInContext('KTAGS', ctx);

T.ok('kit identity is hush-kin and 52z-hs-vocab registers hush-kin onto KTAGS.VOCAB with 0 problems',
  KIT.culture === 'hush-kin' && KIT.id === 'hush-kin' &&
  KTAGS.VOCAB.cultures.includes('hush-kin') &&
  KTAGS.VOCAB.noCatalog.includes('hush-kin') &&
  KTAGS.VOCAB.cultureNames['hush-kin'] === 'Hush-Kin Sanctuary Folk' &&
  KTAGS.norm({ culture: 'hush-kin', types: ['dwelling-single'], wealth: 'rich' }).problems.length === 0);

T.ok('HS_LAKES defines all 4 Silent Vales zones, HS_HARMONICS carries 440/660 Hz ladder, and HS_STYLES covers terrace, gallery and spire',
  Object.keys(HS_LAKES).length === 4 &&
  HS_HARMONICS.length === 4 && HS_HARMONICS[0].hz === 440 && HS_HARMONICS[1].hz === 660 &&
  ['terrace', 'gallery', 'spire'].every(s => HS_STYLES[s] === s) &&
  HS.HAND_LAMP_Y === 1.25);

T.ok('all silent wind-rigged linen, felt, netting, flag, chimeBronze and chimeNephrite buckets join SV_CLOTH',
  ['linen', 'felt', 'netting', 'flag', 'chimeBronze', 'chimeNephrite'].every(k => SV_CLOTH[k] === 1));

T.neg('chimePin and hangPin are exact zero at pinned suspension eyes and rise cleanly toward free rims/hems',
  fn => fn(0) === 0 && fn(0.5) === 0.5 && fn(1) === 1,
  v => 0.2 + 0.8 * v,
  hsRigMath.chimePin);

T.neg('spanPin rejects unpinned span ends and passes exact zeroed ends',
  fn => fn(0) === 0 && fn(1) === 0 && fn(0.5) > 0.9,
  u => 0.3 + 0.7 * Math.cos(u),
  hsRigMath.spanPin);

T.neg('formlineLayerZ enforces >= 1.8 cm depth stepping per layer so Open-Palm monoliths and quartz reflectors never z-fight',
  fn => fn(3.0, 1) - 3.0 >= 0.018 && fn(3.0, 2) - fn(3.0, 1) >= 0.018 && fn(3.0, 3) - fn(3.0, 2) >= 0.018,
  z => z + 0.002,
  hsRigMath.formlineLayerZ);

T.ok('quartzStepWidth, heliographAngle, harmonicFreqHz and handLampReach satisfy Silent Vales optical & harmonic invariants',
  (() => {
    const w0 = hsRigMath.quartzStepWidth(2.6, 0.4, 8, 0);
    const w3 = hsRigMath.quartzStepWidth(2.6, 0.4, 8, 3);
    const w7 = hsRigMath.quartzStepWidth(2.6, 0.4, 8, 7);
    const a0 = hsRigMath.heliographAngle(0, 1.2, 0.45);
    const a1 = hsRigMath.heliographAngle(4, 1.2, 0.45);
    const f0 = hsRigMath.harmonicFreqHz(0);
    const f1 = hsRigMath.harmonicFreqHz(1);
    const f2 = hsRigMath.harmonicFreqHz(2);
    const f3 = hsRigMath.harmonicFreqHz(3);
    const rIdeal = hsRigMath.handLampReach(1.25, 1);
    const rOff = hsRigMath.handLampReach(2.4, 1);
    return w0 > w3 && w3 > w7 && Math.abs(w7 - 0.4) < 1e-4 &&
      a0 >= 0 && a0 < Math.PI * 2 && Math.abs(a1 - a0) > 0.1 &&
      f0 === 440 && f1 === 660 && f2 === 880 && f3 === 1320 &&
      rIdeal > 3.7 && rIdeal > rOff && hsRigMath.hangPin(0) === 0 && hsRigMath.hangPin(1) === 1;
  })());

T.ok('HS_TRADES covers all 44 Voth census rows with 41 active trades, 0 gaps and 3 explicit na reasons',
  HS_TRADES.length === 44 &&
  HS_TRADES.filter(r => !r.na).length === 41 &&
  HS_TRADES.filter(r => r.gap).length === 0 &&
  HS_TRADES.every(r => r.na ? r.na.length > 20 : (Array.isArray(r.keys) && r.keys.length > 0 && r.keys.every(k => k.startsWith('hs_')))));

T.ok('FAMILIES rows use survey-clean view names (no apostrophes or colons) and place all 36 hs_ defs (35 standalone + showcase)',
  (() => {
    const hsKeys = FAMILIES.flatMap(f => f.keys).filter(k => k.startsWith('hs_'));
    return FAMILIES.length === 11 &&
      FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
      hsKeys.length === 36 && new Set(hsKeys).size === 36 &&
      hsKeys.includes('hs_lakeside_sanctuary_row');
  })());

/* HSK sealed world bundle check (kits/hush-kin/kit_bundle.py) */
const cp = require('child_process');
const ROOT = path.resolve(HERE, '..', '..');
const pyBundle = cp.execFileSync('python3',
  ['-c', 'import sys; sys.path.insert(0, "kits/hush-kin"); import kit_bundle; print(kit_bundle.bundle("HSK")[0])'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const threePath = ['kits/ancients/three.min.js', 'tools/three.min.js'].find(
  p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) throw new Error('three.min.js not found');
const bCtx = {
  console, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, TypeError,
  Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int32Array, Map, Set, WeakMap, Proxy,
  performance: { now: () => 0 },
  location: { search: '', hash: '' },
  Image: class { set src(v) { if (this.onload) this.onload(); } }
};
bCtx.window = bCtx;
bCtx.globalThis = bCtx;
bCtx.self = bCtx;
vm.createContext(bCtx);
vm.runInContext(fs.readFileSync(path.join(ROOT, threePath), 'utf8'), bCtx);
for (const coreRel of [
  'core/rand/08-core-rand.js',
  'core/materials/record/23-mat-record.js',
  'core/materials/record/24-tex-def.js',
  'core/materials/record/25-matlib-host.js',
  'core/tags/50-core-tags.js',
  'core/tags/52-core-tags-vocab.js',
  'core/door/10-core-door.js',
  'core/door/20-core-glass.js',
  'core/door/30-core-door-leaf.js'
]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, coreRel), 'utf8'), bCtx, { filename: coreRel });
}
vm.runInContext(pyBundle, bCtx, { filename: 'hsk_bundle.js' });
const HSK = bCtx.HSK;
const hskDims = HSK.dims();
const bldgKeys = Object.keys(hskDims);
const allProtosOk = bldgKeys.every(k => {
  const g = HSK.proto(k, 0);
  return !!(g && g.userData.tris > 150);
});
const pBeacon = HSK.proto('hs_heliograph_beacon', 0);
const pMoot = HSK.proto('hs_handspeak_moot', 0);
const pBelfry = HSK.proto('hs_bianzhong_belfry', 0);
const pFerry = HSK.proto('hs_silent_ferry', 0);
const allTradeMap = HSK.tradeDefs();

T.ok('HSK settlement bundle exports all 35 standalone building dims, 41 trade mappings, and builds all 35 prototypes with zero errors',
  bldgKeys.length === 35 && allProtosOk && HSK.errors.length === 0 &&
  Object.keys(allTradeMap).length === 41 &&
  !!(pBeacon && pBeacon.userData.tris > 800 && pBeacon.userData.doors >= 1) &&
  !!(pMoot && pMoot.userData.tris > 900 && pMoot.userData.doors >= 1) &&
  !!(pBelfry && pBelfry.userData.tris > 800 && pFerry && pFerry.userData.tris > 800));

T.done();
