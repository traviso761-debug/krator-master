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
  '../../kits/eternian/src/42-et-head.js',
  '../../kits/resources/src/42r-res-ore.js',
  'src/26k-kit.js',
  'src/34-tk-trades.js',
  'src/52z-tk-vocab.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const TK_STYLES = vm.runInContext('TK_STYLES', ctx);
const TK_CRESTS = vm.runInContext('TK_CRESTS', ctx);
const TK_VALLEYS = vm.runInContext('TK_VALLEYS', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const TK_TRADES = vm.runInContext('TK_TRADES', ctx);
const tkRigMath = vm.runInContext('tkRigMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);
const KTAGS = vm.runInContext('KTAGS', ctx);
const etHeadParams = vm.runInContext('etHeadParams', ctx);
const etHeadGeo = vm.runInContext('etHeadGeo', ctx);

T.ok('kit identity is timpar-kuran and 52z-tk-vocab registers timpar-kuran onto KTAGS.VOCAB with 0 problems',
  KIT.culture === 'timpar-kuran' && KIT.id === 'timpar-kuran' &&
  KTAGS.VOCAB.cultures.includes('timpar-kuran') &&
  KTAGS.VOCAB.noCatalog.includes('timpar-kuran') &&
  KTAGS.VOCAB.cultureNames['timpar-kuran'] === 'Timpar-Kuran Timber Clans' &&
  KTAGS.norm({ culture: 'timpar-kuran', types: ['dwelling-single'], wealth: 'rich' }).problems.length === 0);

T.ok('TK_CRESTS defines all 5 clan crests (kuma, kapac, rapan, hueru, wurup) and TK_STYLES covers jomon, plank and crest',
  ['kuma', 'kapac', 'rapan', 'hueru', 'wurup'].every(k => TK_CRESTS[k] && TK_CRESTS[k].key === k) &&
  ['jomon', 'plank', 'crest'].every(s => TK_STYLES[s] === s) &&
  Object.keys(TK_VALLEYS).length === 4);

T.ok('all valley-mist wind-rigged chilkat, attus, inau, hide, netting and flag buckets join SV_CLOTH',
  ['chilkat', 'attus', 'inau', 'hide', 'netting', 'flag'].every(k => SV_CLOTH[k] === 1));

T.ok('cornerPin and hangPin are exact zero at pinned crossbar/corners and peak in free belly/hem',
  tkRigMath.cornerPin(0, 0) === 0 && tkRigMath.cornerPin(1, 0) === 0 &&
  tkRigMath.cornerPin(0, 1) === 0 && tkRigMath.cornerPin(1, 1) === 0 &&
  tkRigMath.cornerPin(0.5, 0.5) > 0.8 &&
  tkRigMath.hangPin(0) === 0 && tkRigMath.hangPin(1) === 1);

T.neg('spanPin rejects unpinned drying-line ends and passes exact zeroed ends',
  fn => fn(0) === 0 && fn(1) === 0 && fn(0.5) > 0.9,
  u => 0.35 + 0.65 * Math.cos(u),
  tkRigMath.spanPin);

T.neg('formlineLayerZ enforces >= 1.4 cm depth stepping per layer so formline reliefs never z-fight',
  fn => fn(4.0, 1) - 4.0 >= 0.014 && fn(4.0, 2) - fn(4.0, 1) >= 0.014 && fn(4.0, 3) - fn(4.0, 2) >= 0.014,
  (z) => z + 0.001,
  tkRigMath.formlineLayerZ);

T.ok('ratGuardRadius, kaenCrownR and daakTierHeights produce valid Ainu pu, Jomon kaen and Tlingit daak geometry',
  (() => {
    const rg = tkRigMath.ratGuardRadius(0.2);
    const kr0 = tkRigMath.kaenCrownR(0.36, 0);
    const krMid = tkRigMath.kaenCrownR(0.36, 0.45);
    const krTop = tkRigMath.kaenCrownR(0.36, 1);
    const daak = tkRigMath.daakTierHeights(0.46, 2, 0.36);
    return rg >= 0.48 && krMid < kr0 && krTop > kr0 &&
      daak.length === 3 && Math.abs(daak[1] - 0.82) < 1e-6 && Math.abs(daak[2] - 1.18) < 1e-6;
  })());

T.neg('trophyEyeRuleOk enforces open-eyed Timpar-Kuran war-visors vs closed-eyed inverted/war-painted Eternian loot heads',
  fn => fn('open', 'closed', true) === true && fn('closed', 'closed', true) === false && fn('open', 'open', true) === false && fn('open', 'closed', false) === false,
  () => true,
  tkRigMath.trophyEyeRuleOk);

T.ok('read-in-place 42-et-head.js generates deterministic closed-eye war-loot heads',
  (() => {
    const hClosed = etHeadGeo(etHeadParams(35201, { eyes: 'closed', neck: false }));
    return hClosed.eyes === 'closed' && hClosed.pos.length > 90;
  })());

T.ok('TK_TRADES covers all 44 Voth census rows with 41 active trades, 0 gaps and 3 explicit na reasons',
  TK_TRADES.length === 44 &&
  TK_TRADES.filter(r => !r.na).length === 41 &&
  TK_TRADES.filter(r => r.gap).length === 0 &&
  TK_TRADES.every(r => r.na ? r.na.length > 20 : (Array.isArray(r.keys) && r.keys.length > 0 && r.keys.every(k => k.startsWith('tk_')))));

T.ok('FAMILIES rows use survey-clean view names (no apostrophes or colons) and place all 38 tk_ buildings',
  (() => {
    const tkKeys = FAMILIES.flatMap(f => f.keys).filter(k => k.startsWith('tk_'));
    return FAMILIES.length === 10 &&
      FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
      tkKeys.length === 38 && new Set(tkKeys).size === 38;
  })());

/* TKK sealed world bundle check (kits/timpar-kuran/kit_bundle.py) */
const cp = require('child_process');
const ROOT = path.resolve(HERE, '..', '..');
const pyBundle = cp.execFileSync('python3',
  ['-c', 'import sys; sys.path.insert(0, "kits/timpar-kuran"); import kit_bundle; print(kit_bundle.bundle("TKK")[0])'],
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
vm.runInContext(pyBundle, bCtx, { filename: 'tkk_bundle.js' });
const TKK = bCtx.TKK;
const tkkDims = TKK.dims();
const bldgKeys = Object.keys(tkkDims);
const allProtosOk = bldgKeys.every(k => {
  const g = TKK.proto(k, 0);
  return !!(g && g.userData.tris > 150);
});
const pGreat = TKK.proto('tk_timpar_cise_rich', 0);
const pFort = TKK.proto('tk_chasi_noow_fort', 0);
const pCarver = TKK.proto('tk_totem_carving_shed', 0);
const pGrease = TKK.proto('tk_grease_tryworks', 0);
const allTradeMap = TKK.tradeDefs();

T.ok('TKK settlement bundle exports all 38 building dims, 41 trade mappings, and builds all 38 prototypes with zero errors',
  bldgKeys.length === 38 && allProtosOk && TKK.errors.length === 0 &&
  Object.keys(allTradeMap).length === 41 &&
  !!(pGreat && pGreat.userData.tris > 1500 && pGreat.userData.doors >= 1) &&
  !!(pFort && pFort.userData.tris > 1500 && pFort.userData.doors >= 2) &&
  !!(pCarver && pCarver.userData.tris > 800 && pGrease && pGrease.userData.tris > 800));

T.done();
