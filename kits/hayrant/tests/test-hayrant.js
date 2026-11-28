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
  '../../kits/eternian/src/42-et-head.js',
  '../../kits/resources/src/42r-res-ore.js',
  'src/26k-kit.js',
  'src/34-hy-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const HY_STYLES = vm.runInContext('HY_STYLES', ctx);
const HY_SEATS = vm.runInContext('HY_SEATS', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const HY_TRADES = vm.runInContext('HY_TRADES', ctx);
const hyRigMath = vm.runInContext('hyRigMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);
const etHeadParams = vm.runInContext('etHeadParams', ctx);
const etHeadGeo = vm.runInContext('etHeadGeo', ctx);
const etFigureGeo = vm.runInContext('etFigureGeo', ctx);

T.ok('kit identity is hayrant under The Eternal State',
  KIT.culture === 'hayrant' && KIT.id === 'hayrant' && KIT.faction === 'The Eternal State');

T.ok('HY_SEATS anchors Mirabilis (350,726), Sheritu (384,666) and the 124,710 Hueru-Kuran pass',
  HY_SEATS.mirabilis.coords[0] === 350 && HY_SEATS.mirabilis.coords[1] === 726 &&
  HY_SEATS.sheritu.coords[0] === 384 && HY_SEATS.sheritu.coords[1] === 666 &&
  HY_SEATS.ukorPass.coords[0] === 124 && HY_SEATS.ukorPass.coords[1] === 710 &&
  ['bench', 'hybrid', 'prefect', 'sanctuary'].every(k => HY_STYLES[k] === k));

T.ok('all katabatic wind-rigged plaid, hemp, hide, netting, chime, flag and sign buckets join SV_CLOTH',
  ['plaid', 'hemp', 'hide', 'netting', 'chime', 'flag', 'sign'].every(k => SV_CLOTH[k] === 1));

T.ok('cornerPin is exact zero at all four awning corners and peaks in belly',
  hyRigMath.cornerPin(0, 0) === 0 && hyRigMath.cornerPin(1, 0) === 0 &&
  hyRigMath.cornerPin(0, 1) === 0 && hyRigMath.cornerPin(1, 1) === 0 &&
  hyRigMath.cornerPin(0.5, 0.5) > 0.8);

T.neg('spanPin rejects unpinned rope ends and passes exact zeroed ends',
  fn => fn(0) === 0 && fn(1) === 0 && fn(0.5) > 0.9,
  u => 0.4 + 0.6 * Math.cos(u),
  hyRigMath.spanPin);

T.neg('chimePin anchors nephrite suspension cord v=0 and releases lower chime end v=1 linearly',
  fn => fn(0) === 0 && fn(1) === 1 && Math.abs(fn(0.5) - 0.5) < 1e-9,
  v => 0.2 + 0.8 * v,
  hyRigMath.chimePin);

T.ok('nuragheRadius tapers monotonically with concave Sardinian batter',
  hyRigMath.nuragheRadius(5.2, 3.6, 0) === 5.2 &&
  hyRigMath.nuragheRadius(5.2, 3.6, 1) === 3.6 &&
  hyRigMath.nuragheRadius(5.2, 3.6, 0.5) < 4.5 &&
  hyRigMath.nuragheRadius(5.2, 3.6, 0.5) > 4.4);

T.ok('cruckArc rises smoothly from stone ring-wall spring to kaen-doki smoke-collar',
  (() => {
    const p0 = hyRigMath.cruckArc(3.8, 2.4, 0.55, 5.1, 0);
    const pm = hyRigMath.cruckArc(3.8, 2.4, 0.55, 5.1, 0.5);
    const p1 = hyRigMath.cruckArc(3.8, 2.4, 0.55, 5.1, 1);
    return Math.abs(p0[0] - 3.8) < 1e-9 && Math.abs(p0[1] - 2.4) < 1e-9 &&
      pm[1] > 4.2 &&
      Math.abs(p1[0] - 0.55) < 1e-9 && Math.abs(p1[1] - 5.1) < 1e-9;
  })());

T.ok('pierStepTops builds symmetric organ-pipe Deco-Gothic ranks peaking at centre pier',
  (() => {
    const tops = hyRigMath.pierStepTops(5, 6.0, 1.25);
    return tops.length === 5 && tops[0] === 6.0 && tops[1] === 7.25 && tops[2] === 8.5 &&
      tops[3] === 7.25 && tops[4] === 6.0;
  })());

T.neg('corniceDeltaOk enforces VASSAL-KITS.md <= 0.50 m eaves delta against Eternian peers',
  fn => fn(7.05, 7.20) === true && fn(11.50, 11.90) === true && fn(6.20, 7.00) === false,
  () => true,
  hyRigMath.corniceDeltaOk);

T.ok('totemTierY spaces stacked Eternian ancestor heads evenly from plinth base',
  (() => {
    const ys = hyRigMath.totemTierY(0.52, 4, 1.25);
    return ys.length === 4 && ys[0] === 0.52 && ys[1] === 1.77 && ys[2] === 3.02 && ys[3] === 4.27;
  })());

T.neg('puBaffleRadius enforces >= 2.35x basalt post radius for nezumi-gaeshi marmot baffles',
  fn => [0.14, 0.18, 0.22].every(r => fn(r) >= 2.35 * r),
  r => 1.5 * r,
  hyRigMath.puBaffleRadius);

T.neg('formlineLayerZ steps non-coplanar relief layers by >= 0.018 m per layer',
  fn => fn(0, 1) >= 0.018 && (fn(0, 2) - fn(0, 1)) >= 0.018 && (fn(0, 4) - fn(0, 3)) >= 0.018,
  (z, k) => z + 0.002 * k,
  hyRigMath.formlineLayerZ);

T.ok('insulatorShedRadii builds monotonically tapering wide shed skirts and narrower porcelain necks',
  (() => {
    const sh = hyRigMath.insulatorShedRadii(0.08, 3);
    return sh.length === 3 &&
      sh.every(s => s.shed > s.neck && s.neck > 0.03) &&
      sh[0].shed > sh[1].shed && sh[1].shed > sh[2].shed;
  })());

T.neg('catenarySagPt pins exact jumper cable endpoints at t=0 and t=1 and sags at mid-span',
  fn => {
    const a = [-2.5, 5.0, 1.0], b = [2.5, 5.0, 1.0];
    const p0 = fn(a, b, 0.30, 0), pm = fn(a, b, 0.30, 0.5), p1 = fn(a, b, 0.30, 1);
    return p0[0] === -2.5 && p0[1] === 5.0 && p1[0] === 2.5 && p1[1] === 5.0 &&
      Math.abs(pm[1] - 4.7) < 1e-4;
  },
  (a, b, sag, t) => [a[0] + (b[0] - a[0]) * t, a[1] - sag, a[2]],
  hyRigMath.catenarySagPt);

T.ok('read-in-place 42-et-head.js generates deterministic closed-eye heads and lintel-bearing ancestors',
  (() => {
    const hClosed = etHeadGeo(etHeadParams(34101, {}));
    const fLintel = etFigureGeo({ pose: 'lintel', seed: 34101 });
    return hClosed.eyes === 'closed' && hClosed.pos.length > 90 &&
      fLintel.eyes === 'closed' && fLintel.pos.length > 150;
  })());

T.ok('HY_TRADES covers all 44 Voth census rows with 41 active trades, 0 gaps, 3 explicit na reasons, and cyber-totem defs',
  (() => {
    const allTradeKeys = new Set(HY_TRADES.filter(r => !r.na).flatMap(r => r.keys));
    const reqNew = [
      'hy_head_totem_court', 'hy_censorate_warden', 'hy_veilpass_picket',
      'hy_rare_earth_smelter', 'hy_charcoal_tar_kiln', 'hy_pu_chandlery',
      'hy_grand_cyber_totem', 'hy_cyber_totem_obelisk'
    ];
    return HY_TRADES.length === 44 &&
      HY_TRADES.filter(r => !r.na).length === 41 &&
      HY_TRADES.filter(r => r.gap).length === 0 &&
      reqNew.every(k => allTradeKeys.has(k)) &&
      HY_TRADES.every(r => r.na ? r.na.length > 20 : (Array.isArray(r.keys) && r.keys.length > 0 && r.keys.every(k => k.startsWith('hy_'))));
  })());

T.ok('FAMILIES rows use survey-clean view names and place all 54 hy_ buildings plus mixed street and statuary (56 total hy_*)',
  (() => {
    const hyKeys = FAMILIES.flatMap(f => f.keys).filter(k => k.startsWith('hy_'));
    return FAMILIES.length === 11 &&
      FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
      new Set(hyKeys).size === 56;
  })());

/* HYK sealed world bundle check (kits/hayrant/kit_bundle.py) */
const cp = require('child_process');
const ROOT = path.resolve(HERE, '..', '..');
const pyBundle = cp.execFileSync('python3',
  ['-c', 'import sys; sys.path.insert(0, "kits/hayrant"); import kit_bundle; print(kit_bundle.bundle("HYK")[0])'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const threePath = ['kits/ancients/three.min.js', 'tools/three.min.js'].find(
  p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) throw new Error('three.min.js not found: run git lfs pull --include="kits/ancients/three.min.js"');
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
vm.runInContext(pyBundle, bCtx, { filename: 'hyk_bundle.js' });
const HYK = bCtx.HYK;
const hykDims = HYK.dims();
const bldgKeys = Object.keys(hykDims);
const allProtosOk = bldgKeys.every(k => {
  const g = HYK.proto(k, 0);
  return !!(g && g.userData.tris > 250);
});
const pPrefect = HYK.proto('hy_prefect_seat', 0);
const pLegation = HYK.proto('hy_kuran_legation', 0);
const pTotemCourt = HYK.proto('hy_head_totem_court', 0);
const pGrandTotem = HYK.proto('hy_grand_cyber_totem', 0);
const pObelisk = HYK.proto('hy_cyber_totem_obelisk', 0);
const pWarden = HYK.proto('hy_censorate_warden', 0);
const allTradeMap = HYK.tradeDefs();

T.ok('HYK settlement bundle exports all 54 building dims, 41 trade mappings, rare-earth resSource, and builds all 54 prototypes with zero errors',
  bldgKeys.length === 54 && allProtosOk && HYK.errors.length === 0 &&
  Object.keys(allTradeMap).length === 41 &&
  hykDims.hy_rare_earth_smelter.resSource === 'rare-earth' &&
  hykDims.hy_grand_cyber_totem.h >= 20 &&
  hykDims.hy_cyber_totem_obelisk.h >= 16 &&
  !!(pPrefect && pPrefect.userData.tris > 4000 && pPrefect.userData.doors >= 4) &&
  !!(pLegation && pLegation.userData.tris > 2000 && pLegation.userData.doors >= 3) &&
  !!(pTotemCourt && pTotemCourt.userData.tris > 3000 && pTotemCourt.userData.doors >= 2) &&
  !!(pGrandTotem && pGrandTotem.userData.tris > 4000) &&
  !!(pObelisk && pObelisk.userData.tris > 2500) &&
  !!(pWarden && pWarden.userData.tris > 2000 && pWarden.userData.doors >= 2));

T.done();
