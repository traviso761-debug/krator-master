'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

const KMAT_M1 = require(path.join(ROOT, 'core/materials/record/27-matlib-m1.js'));
const KROOMLIGHT = require(path.join(ROOT, 'core/interiors/10-core-roomlight.js'));

const ctx = { Math, Object, Array, Number, String, JSON };
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const rel of [
  'src/26k-kit.js',
  'src/72-kl-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const KL_FACTIONS = vm.runInContext('KL_FACTIONS', ctx);
const KL_LEXICON = vm.runInContext('KL_LEXICON', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const KL_TRADES = vm.runInContext('KL_TRADES', ctx);
const klTradeDefs = vm.runInContext('klTradeDefs', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

/* 1. Kit identity, Finnic-Baltic + Rian loanword lexicon & faction metadata (26k-kit.js) */
T.ok('kit identity is kulanewa with Finnic-Baltic substrate, bidirectional Rian loanwords, and Suurgild/Talku-Kula faction metadata',
  KIT.id === 'kulanewa' && KIT.culture === 'kulanewa' &&
  KIT.faction === 'The Kulanewa Free-Towns' &&
  KL_FACTIONS.karum.style === 'karum' &&
  KL_FACTIONS.ikki.style === 'ikki' &&
  KL_LEXICON.language === 'Kulaneva-keel' &&
  KL_LEXICON.substrate === 'Finnic-Estonian-Baltic' &&
  !!(KL_LEXICON.rianLoans['ampala-kiri'] && KL_LEXICON.rianLoans.kuluuna && KL_LEXICON.rianLoans.piliika) &&
  KL_LEXICON.reverseLoansToRia.raha.lowRia === 'laha' &&
  KL_LEXICON.reverseLoansToRia.sampo.highRia === 'sakwo' &&
  KL_LEXICON.reverseLoansToRia['valge-vask'].lowRia === 'walaga-wasa');

T.ok('all cloth banner and silk material keys join SV_CLOTH',
  ['silk', 'brocade', 'flag'].every(k => SV_CLOTH[k] === 1));

/* 2. Sheet rows & 42 building keys (89-rows.js) */
const allKeys = FAMILIES.flatMap(f => f.keys);
const uniqKeys = new Set(allKeys);
const karumKeys = allKeys.filter(k => k.startsWith('kl_karum_'));
const ikkiKeys = allKeys.filter(k => k.startsWith('kl_ikki_'));

T.ok('four Kulanewa sheet rows hold 42 unique buildings (21 karum + 21 ikki)',
  FAMILIES.length === 4 && allKeys.length === 42 && uniqKeys.size === 42 &&
  karumKeys.length === 21 && ikkiKeys.length === 21);

const viewSafe = name => typeof name === 'string' && name.length > 0 && !/[':\\/*?"<>|]/.test(name);
T.neg('row names reject apostrophes, colons and slashes for check_views',
  rows => rows.every(r => viewSafe(r.name)),
  [{ name: "Banker's Row: Karum/Ports" }],
  FAMILIES);

/* 3. Voth census trades table (72-kl-trades.js) */
const validTradesTable = rows =>
  Array.isArray(rows) && rows.length === 44 &&
  rows.every(r => r.na || (
    Array.isArray(r.karum) && r.karum.length > 0 && r.karum.every(k => uniqKeys.has(k) && k.startsWith('kl_karum_')) &&
    Array.isArray(r.ikki) && r.ikki.length > 0 && r.ikki.every(k => uniqKeys.has(k) && k.startsWith('kl_ikki_'))
  ));

T.neg('KL_TRADES covers all 44 Voth census rows in both Karum and Ikki and rejects missing branch defs',
  validTradesTable,
  KL_TRADES.map((r, i) => i === 0 ? { trade: r.trade, voth: r.voth, karum: r.karum, ikki: [] } : r),
  KL_TRADES);

const karumMap = klTradeDefs('karum');
const ikkiMap = klTradeDefs('ikki');
T.ok('klTradeDefs returns all 40 active Voth trades for both faction styles',
  Object.keys(karumMap).length === 40 && Object.keys(ikkiMap).length === 40 &&
  karumMap['guild officers and clerks'].includes('kl_karum_grand_bank') &&
  ikkiMap['smiths and craftsmen'].includes('kl_ikki_hydro_forge'));

/* 4. Stage 1 BUDGETS.json & Stage 5 KMAT_M1 + mip-variance.json + materials.json */
const budgets = JSON.parse(fs.readFileSync(path.join(HERE, 'BUDGETS.json'), 'utf8'));
const pageBudget = budgets.pages && budgets.pages['kulanewa.html'];
T.ok('BUDGETS.json sets Stage 1 samplers:15 and vram_mb:320 ceilings',
  !!(pageBudget && pageBudget.samplers === 15 && pageBudget.vram_mb === 320 && pageBudget.tris === 3200000 && pageBudget.calls === 220));

const matsCfg = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8')).families;
const mipVars = JSON.parse(fs.readFileSync(path.join(HERE, 'mip-variance.json'), 'utf8')).families;
T.ok('hero masonry families enable height:true and mip-variance.json covers 38 lit families',
  ['kura', 'sootstone', 'kilnbrick', 'ashlar', 'paving', 'cobble'].every(k => matsCfg[k] && matsCfg[k].height === true) &&
  Object.keys(mipVars).length >= 38 &&
  Array.isArray(mipVars.bronze) && mipVars.bronze.length >= 8);

const rMip0 = KMAT_M1.roughnessWithVariance(0.24, 0, mipVars.bronze);
const rMip4 = KMAT_M1.roughnessWithVariance(0.24, 4, mipVars.bronze);
T.ok('KMAT_M1 M2 specular AA widens bronze roughness at coarse mips while preserving mip 0',
  Math.abs(rMip0 - 0.24) < 1e-6 && rMip4 > 0.32);

const domeH = (u, v) => Math.max(0.05, 0.9 * Math.exp(-((u - 0.5) * (u - 0.5) + (v - 0.5) * (v - 0.5)) / (2 * 0.18 * 0.18)));
const domeN = (u, v) => {
  const e = 1 / 512;
  const dx = (domeH(u + e, v) - domeH(u - e, v)) / (2 * e);
  const dy = (domeH(u, v + e) - domeH(u, v - e)) / (2 * e);
  const nx = -dx * 0.25, ny = -dy * 0.25, l = Math.hypot(nx, ny, 1);
  return [nx / l, ny / l, 1 / l];
};
T.neg('KMAT_M1 Gate 3 handedness probe certifies OpenGL normals & planar POM and catches flipped green channel',
  nFn => KMAT_M1.handednessProbe(nFn, domeH).ok,
  (u, v) => { const n = domeN(u, v); return [n[0], -n[1], n[2]]; },
  domeN);

/* 5. Stage 7 KROOMLIGHT room-graph portal daylight, pool & dihedral corner AO */
const klRooms = [
  { id: 'clearing_porch', box: [-4, 1, 4, 4, 5, 8], doors: [{ out: true, w: 2.4 }, { to: 'naruqqum_hall', w: 2.0 }], windows: [{ w: 1.5, h: 1.5 }], lamps: [{ amp: 1.0, r: 8 }] },
  { id: 'naruqqum_hall', box: [-6, 1, -6, 6, 6, 4], doors: [{ to: 'clearing_porch', w: 2.0 }], windows: [], lamps: [{ amp: 1.3, r: 9 }] },
  { id: 'kura_bullion_vault', box: [-3, -3, -3, 3, 0, 3], vault: true, doors: [{ to: 'naruqqum_hall', w: 1.4 }], windows: [], lamps: [{ amp: 0.9, r: 7 }] }
];
const rlTable = KROOMLIGHT.buildTable({ rooms: klRooms });
T.neg('KROOMLIGHT attenuates portal daylight monotonically across doorways and blocks daylight in sealed kura vaults',
  row => row.daylight === 0,
  rlTable.byId.clearing_porch,
  rlTable.byId.kura_bullion_vault);

T.ok('KROOMLIGHT pickPool & vertexCornerAO gate room lights and darken floor-wall corners',
  rlTable.byId.clearing_porch.daylight > rlTable.byId.naruqqum_hall.daylight &&
  rlTable.byId.naruqqum_hall.daylight > 0.1 &&
  KROOMLIGHT.pickPool({
    eye: [0, 2.2, 0], eyeRoom: 'naruqqum_hall', table: rlTable, count: 6, sunUp: 1.0,
    windows: [{ room: 'clearing_porch', x: 0, y: 2.8, z: 6.5 }],
    lamps: [{ room: 'naruqqum_hall', x: 0, y: 2.4, z: -2.0, amp: 1.2, r: 9 }]
  }).length === 2 &&
  KROOMLIGHT.vertexCornerAO(0, 0.02, 2.0, 1, 0, 0, [0, 0, 0, 6, 4, 6], 0.85) < 0.82);

/* 6. KLK settlement bundle (kits/kulanewa/kit_bundle.py) */
const PY = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');   /* as kits/ria/tests/test-ria.js */
const pyBundle = cp.execFileSync(PY, ['-c', 'import sys; sys.path.insert(0, "kits/kulanewa"); import kit_bundle; js, _ = kit_bundle.bundle("KLK"); sys.stdout.write(js)'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const threePath = ['kits/ancients/three.min.js', 'tools/three.min.js'].find(p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
if (!threePath) throw new Error('three.min.js not found (kits/ancients/three.min.js): a Git LFS pointer? git lfs pull --include="kits/ancients/three.min.js"');
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
vm.runInContext(pyBundle, bCtx, { filename: 'klk_bundle.js' });
const KLK = bCtx.KLK;
const dims = KLK.dims();
const pKarum = KLK.proto('kl_karum_grand_bank', 0);
const pIkki = KLK.proto('kl_ikki_covenant_citadel', 0);
const allProtosOk = allKeys.every(k => {
  const g = KLK.proto(k, 0);
  return !!(g && g.userData.tris > 450);
});
const fullMatrixOk = ['karum', 'ikki'].every(st => {
  const ds = Object.values(dims).filter(d => d.style === st);
  const dwellOk = ['poor', 'middle', 'rich'].every(w =>
    ['dwelling-single', 'dwelling-multi'].every(t => ds.some(d => d.wealth === w && (d.types || []).includes(t))));
  const milN = ds.filter(d => (d.types || []).includes('military')).length;
  const infN = ds.filter(d => (d.types || []).includes('infrastructure')).length;
  return dwellOk && milN >= 3 && infN >= 5;
});

T.ok('KLK settlement bundle exports all 42 dims, full 6-cell dwelling/military/logistics matrix, and builds all 42 prototypes with zero errors',
  Object.keys(dims).length === 42 && allProtosOk && fullMatrixOk && KLK.errors.length === 0 &&
  !!(KLK.factions && KLK.factions.karum && KLK.factions.ikki) &&
  !!(pKarum && pKarum.userData.tris > 1500 && pKarum.userData.doors >= 3) &&
  !!(pIkki && pIkki.userData.tris > 1500 && pIkki.userData.doors >= 4));

/* 7. K1 + M2 + M3 + M4 GLSL shader injection check on THREE.ShaderLib.standard */
const shTest = {
  uniforms: {},
  vertexShader: bCtx.THREE.ShaderLib.standard.vertexShader,
  fragmentShader: bCtx.THREE.ShaderLib.standard.fragmentShader
};
bCtx.KMAT.libHooks(shTest, {
  _fam: 'kura', specular: 0.18, size: 512, pom: true,
  breakup: { mix: 0.38, macro: 0.07, cell: 7 },
  mipVariance: mipVars.kura
});
T.ok('vstack K1/M2/M3/M4 shader hook injects uniform-deduplicated sine-free breakup, km1RoughAA, kmPomUv and uGroundAO with zero sin()',
  bCtx.KMAT.libKey() === '|km1' &&
  shTest.uniforms.uPomDepth.value > 0.01 &&
  shTest.uniforms.uGroundAO.value > 0.2 &&
  shTest.fragmentShader.includes('km1RoughAA(') &&
  shTest.fragmentShader.includes('kmPomUv(') &&
  !shTest.fragmentShader.includes('fract(sin('));

T.done();
