'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

const ctx = { Math, Object, Array, Number, String, JSON, RegExp, isFinite };
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const rel of [
  '../../core/rand/08-core-rand.js',
  '../../kits/resources/src/42r-res-ore.js',
  'src/26k-kit.js',
  'src/34-pm-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const PM_STYLES = vm.runInContext('PM_STYLES', ctx);
const PM_SITES = vm.runInContext('PM_SITES', ctx);
const PM_PIGMENTS = vm.runInContext('PM_PIGMENTS', ctx);
const SV_LIB = vm.runInContext('SV_LIB', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const PM_TRADES = vm.runInContext('PM_TRADES', ctx);
const pmRigMath = vm.runInContext('pmRigMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

T.ok('kit identity is painted-men under culture painted (Payntja-Mana)',
  KIT.id === 'painted-men' && KIT.culture === 'painted' && KIT.band === 'Payntja-Mana' &&
  ['alcove', 'maloca', 'hung', 'salvage'].every(k => PM_STYLES[k] === k));

T.ok('PM_SITES & PM_PIGMENTS encode Painted Canyon, Canyon Fans, Silkhead Rim and 5 mineral + Korona orchil pigments',
  PM_SITES.paintedCanyon.mode === 'cliff-alcove' &&
  PM_SITES.canyonFans.mode === 'talus-bench' &&
  PM_SITES.silkheadRim.mode === 'cliff-ledge' &&
  PM_PIGMENTS.ochreRed === 0xb53324 &&
  PM_PIGMENTS.rabbitGold === 0xc98724 &&
  PM_PIGMENTS.pipeclay === 0xf4ede0 &&
  PM_PIGMENTS.ligniteBlack === 0x181614 &&
  PM_PIGMENTS.celadoniteTeal === 0x267974 &&
  PM_PIGMENTS.orchilPurple === 0x7e2854);

T.ok('plateau material audit: zero bamboo, zero kiln brick/pottery, zero Tlingit tokens in SV_LIB & materials.json',
  (() => {
    const matJson = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8'));
    const fams = Object.entries(matJson.families);
    const svOk = Object.keys(SV_LIB).every(k => pmRigMath.isPlateauMaterialAllowed(k) && pmRigMath.isPlateauMaterialAllowed(SV_LIB[k]));
    const famOk = fams.every(([k, v]) => pmRigMath.isPlateauMaterialAllowed(k) && pmRigMath.isPlateauMaterialAllowed(v.lib));
    return svOk && famOk;
  })());

T.neg('isPlateauMaterialAllowed rejects bamboo, brick, terracotta, amphora and Tlingit formlines',
  fn => fn('danxia') && fn('paintedjuniper') && fn('bunchgrass') && !fn('bamboo_wall') && !fn('terracotta_kiln') && !fn('tlingit_totem'),
  () => true,
  pmRigMath.isPlateauMaterialAllowed);

T.neg('vigaSpanOk enforces <= 4.20 m peeled juniper viga ceiling (PLAN.md §0)',
  fn => fn(2.8) === true && fn(4.2) === true && fn(4.25) === false && fn(6.0) === false,
  () => true,
  pmRigMath.vigaSpanOk);

T.ok('all canyon-updraught wind-rigged feather, wild-silk, hide, herbBundle & flag buckets join SV_CLOTH',
  ['feather', 'featherWarm', 'wildSilk', 'hide', 'herbBundle', 'flag'].every(k => SV_CLOTH[k] === 1));

T.neg('featherPin & cornerPin stay exact zero at anchor points and release smoothly',
  fn => fn(0) === 0 && fn(1) === 1 && fn(0.5) > 0.3,
  v => 0.15 + 0.85 * v,
  pmRigMath.featherPin);

T.ok('cornerPin is exact zero at all four wild-silk canopy corners and peaks in belly',
  pmRigMath.cornerPin(0, 0) === 0 && pmRigMath.cornerPin(1, 0) === 0 &&
  pmRigMath.cornerPin(0, 1) === 0 && pmRigMath.cornerPin(1, 1) === 0 &&
  pmRigMath.cornerPin(0.5, 0.5) > 0.8);

T.ok('malocaCruckArc rises smoothly from danxia wind-wall spring to Stripe-bunchgrass ridge',
  (() => {
    const p0 = pmRigMath.malocaCruckArc(4.2, 4.8, 1.2, 0.5, 1.6, 5.8, 0);
    const pm = pmRigMath.malocaCruckArc(4.2, 4.8, 1.2, 0.5, 1.6, 5.8, 0.5);
    const p1 = pmRigMath.malocaCruckArc(4.2, 4.8, 1.2, 0.5, 1.6, 5.8, 1);
    return Math.abs(p0[0] - 4.2) < 1e-9 && Math.abs(p0[2] - 1.2) < 1e-9 &&
      pm[2] > 4.2 && Math.abs(p1[2] - 5.8) < 1e-9;
  })());

T.ok('PM_TRADES covers all 44 Voth census rows with 0 gaps, explicit na exclusions, and wires pm_ochre_cake_press & pm_songline_gallery',
  (() => {
    const census = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'trades_census.json'), 'utf8')).map(c => c.trade);
    const byTrade = new Map(PM_TRADES.map(r => [r.trade, r]));
    const allCensus = census.every(t => byTrade.has(t));
    const reqNa = ['shipwrights and boatbuilders', 'potters', 'glassmakers', 'bankers', 'scribes', 'printers']
      .every(t => byTrade.has(t) && typeof byTrade.get(t).na === 'string' && byTrade.get(t).na.length > 20 && !byTrade.get(t).keys);
    const noGaps = PM_TRADES.every(r => !r.gap && (r.na ? r.na.length > 20 : (Array.isArray(r.keys) && r.keys.length > 0 && r.keys.every(k => k.startsWith('pm_')))));
    const pressTrades = ['weavers and dyers', 'shopkeepers and assistants', 'market traders', 'healers and nurses']
      .every(t => byTrade.get(t).keys.includes('pm_ochre_cake_press'));
    const galleryTrades = ['shrine keepers', 'teachers and scholars', 'monks and lay brothers']
      .every(t => byTrade.get(t).keys.includes('pm_songline_gallery'));
    return allCensus && reqNa && noGaps && pressTrades && galleryTrades;
  })());

T.ok('FAMILIES rows use clean view names (no apostrophes or colons) and place all 34 pm_ buildings plus pm_cliff_village',
  (() => {
    const pmKeys = FAMILIES.flatMap(f => f.keys).filter(k => k.startsWith('pm_'));
    return FAMILIES.length === 9 &&
      FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
      new Set(pmKeys).size === 35;
  })());

/* PMK sealed world bundle & painted_men.py check */
const pyBundle = cp.execFileSync('python3',
  ['-c', 'import sys; sys.path.insert(0, "kits/painted-men"); import painted_men, kit_bundle; assert len(painted_men.paths()) >= 11; print(kit_bundle.bundle("PMK")[0])'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

const threePath = ['kits/ancients/three.min.js', 'tools/three.min.js'].find(
  p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) throw new Error('three.min.js not found: run git lfs pull --include="kits/ancients/three.min.js"');

const bCtx = {
  console, Math, Date, JSON, Object, Array, Number, String, Boolean, RegExp, Error, TypeError, isFinite,
  Float32Array, Float64Array, Uint8Array, Uint16Array, Uint32Array, Int8Array, Int32Array, Map, Set, WeakMap, Proxy,
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
vm.runInContext(pyBundle, bCtx, { filename: 'pmk_bundle.js' });
const PMK = bCtx.PMK;
const pmkDims = PMK.dims();
const bldgKeys = Object.keys(pmkDims);
const cleanDefNames = bldgKeys.every(k => !/[':\\/*?"<>|]/.test(pmkDims[k].name));
const allProtosOk = bldgKeys.every(k => {
  const g = PMK.proto(k, 0);
  return !!(g && g.userData.tris > 180);
});
const pPalace = PMK.proto('pm_spring_palace_rich', 0);
const pWarrior = PMK.proto('pm_maloca_warrior_hall', 0);
const pCakePress = PMK.proto('pm_ochre_cake_press', 0);
const pGallery = PMK.proto('pm_songline_gallery', 0);
const allTradeMap = PMK.tradeDefs();

T.ok('PMK settlement bundle exports exact 34 pm_* building dims with clean view names and builds all 34 prototypes with zero errors',
  bldgKeys.length === 34 && cleanDefNames && allProtosOk && PMK.errors.length === 0 &&
  Object.keys(allTradeMap).length === 39 &&
  !!(pPalace && pPalace.userData.tris > 1500 && pPalace.userData.doors >= 3) &&
  !!(pWarrior && pWarrior.userData.tris > 1200 && pWarrior.userData.doors >= 2) &&
  !!(pCakePress && pCakePress.userData.tris > 800 && pCakePress.userData.doors >= 2) &&
  !!(pGallery && pGallery.userData.tris > 800 && pGallery.userData.doors >= 2));

T.done();
