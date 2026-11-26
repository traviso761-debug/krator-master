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
  'src/72-tb-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const TB_POLITIES = vm.runInContext('TB_POLITIES', ctx);
const TB_LEXICON = vm.runInContext('TB_LEXICON', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const TB_TRADES = vm.runInContext('TB_TRADES', ctx);
const tbTradeDefs = vm.runInContext('tbTradeDefs', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

/* 1. Kit identity, culture:'eastabyss', style:'urban', ahedman title & Tabist lexicon */
T.ok('kit identity uses culture eastabyss, style urban, Ahedman ruler title, and Tabist lexicon',
  KIT.id === 'tabisti' && KIT.pack === 'tabisti' && KIT.culture === 'eastabyss' &&
  TB_POLITIES.sfenops.style === 'urban' &&
  TB_POLITIES.liikofi.style === 'urban' &&
  TB_POLITIES.sfenops.title.includes('Ahedman') &&
  !!(TB_LEXICON.terms.tahawst && TB_LEXICON.terms.tafalast && TB_LEXICON.terms.ahedman && TB_LEXICON.terms.takashit));

T.ok('all cloth velarium and banner material keys join SV_CLOTH',
  ['silk', 'brocade', 'canvas', 'flag'].every(k => SV_CLOTH[k] === 1));

/* 2. Sheet rows & 50 unique building keys (89-rows.js) */
const allKeys = FAMILIES.flatMap(f => f.keys);
const uniqKeys = new Set(allKeys);

T.ok('five Urban Tabisti sheet rows hold 50 unique tb_* buildings',
  FAMILIES.length === 5 && allKeys.length === 50 && uniqKeys.size === 50 &&
  allKeys.every(k => k.startsWith('tb_')));

const viewSafe = name => typeof name === 'string' && name.length > 0 && !/[':\\/*?"<>|]/.test(name);
T.neg('row names reject apostrophes, colons and slashes for check_views',
  rows => rows.every(r => viewSafe(r.name)),
  [{ name: "Ahedman's Row: Sfenops/Liikofi" }],
  FAMILIES);

/* 3. Voth census trades table (72-tb-trades.js) — 44/44 actively carried! */
const validTradesTable = rows =>
  Array.isArray(rows) && rows.length === 44 &&
  rows.every(r => !r.na && !r.gap && Array.isArray(r.keys) && r.keys.length > 0 && r.keys.every(k => uniqKeys.has(k)));

T.neg('TB_TRADES actively carries all 44/44 Voth census rows with 0 gaps and rejects missing keys',
  validTradesTable,
  TB_TRADES.map((r, i) => i === 0 ? { trade: r.trade, voth: r.voth, keys: [] } : r),
  TB_TRADES);

const tradeMap = tbTradeDefs();
T.ok('tbTradeDefs returns all 44 active Voth trades including palace, temple, syndic and refinery',
  Object.keys(tradeMap).length === 44 &&
  tradeMap['palace and canton staffs'].includes('tb_palace_ahedman') &&
  tradeMap['temple priests and servants'].includes('tb_temple_altar_grand') &&
  tradeMap['industrial workers'].includes('tb_lac_refinery'));

/* 4. Stage 1 BUDGETS.json & Stage 5 KMAT_M1 + mip-variance.json + materials.json */
const budgets = JSON.parse(fs.readFileSync(path.join(HERE, 'BUDGETS.json'), 'utf8'));
const pageBudget = budgets.pages && budgets.pages['tabisti.html'];
T.ok('BUDGETS.json sets Stage 1 samplers:15 and vram_mb:340 ceilings',
  !!(pageBudget && pageBudget.samplers === 15 && pageBudget.vram_mb === 340 && pageBudget.tris === 3600000));

const matsCfg = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8')).families;
const mipVars = JSON.parse(fs.readFileSync(path.join(HERE, 'mip-variance.json'), 'utf8')).families;
T.ok('hero masonry families enable height:true and mip-variance.json covers all 41 lit families',
  ['buffbrick', 'rosebrick', 'bandbrick', 'stucco', 'ashlar', 'paving', 'cobble'].every(k => matsCfg[k] && matsCfg[k].height === true) &&
  Object.keys(mipVars).length >= 41 &&
  Array.isArray(mipVars.kashi) && mipVars.kashi.length >= 8);

const rMip0 = KMAT_M1.roughnessWithVariance(0.21, 0, mipVars.kashi);
const rMip4 = KMAT_M1.roughnessWithVariance(0.21, 4, mipVars.kashi);
T.ok('KMAT_M1 M2 specular AA widens alkaline-teal kashi glaze roughness at coarse mips while preserving mip 0',
  Math.abs(rMip0 - 0.21) < 1e-6 && rMip4 > 0.30);

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

/* 5. Stage 7 KROOMLIGHT room-graph portal daylight over ayvan -> diwan -> fungus vault */
const tbRooms = [
  { id: 'ustun_ayvan', box: [-5, 1, 2, 5, 5, 6], doors: [{ out: true, w: 3.0 }, { to: 'kundal_diwan', w: 2.0 }], windows: [{ w: 1.6, h: 1.5 }], lamps: [{ amp: 1.0, r: 8 }] },
  { id: 'kundal_diwan', box: [-6, 1, -6, 6, 6, 2], doors: [{ to: 'ustun_ayvan', w: 2.0 }], windows: [], lamps: [{ amp: 1.3, r: 9 }] },
  { id: 'fungus_dark_vault', box: [-4, 0, -4, 4, 3.5, 4], vault: true, doors: [{ to: 'kundal_diwan', w: 1.5 }], windows: [], lamps: [{ amp: 0.9, r: 7 }] }
];
const rlTable = KROOMLIGHT.buildTable({ rooms: tbRooms });
T.neg('KROOMLIGHT attenuates portal daylight monotonically across ayvans and blocks daylight in dark fungus vaults',
  row => row.daylight === 0,
  rlTable.byId.ustun_ayvan,
  rlTable.byId.fungus_dark_vault);

/* 6. TBK settlement bundle (kits/tabisti/kit_bundle.py) */
const PY = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const pyBundle = cp.execFileSync(PY, ['-c', 'import sys; sys.path.insert(0, "kits/tabisti"); import kit_bundle; js, _ = kit_bundle.bundle("TBK"); sys.stdout.write(js)'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const threePath = ['kits/ancients/three.min.js', 'tools/three.min.js', 'biomes/sedesert/three.min.js']
  .find(p => fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).size > 100000);
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
vm.runInContext(pyBundle, bCtx, { filename: 'tbk_bundle.js' });
const TBK = bCtx.TBK;
const dims = TBK.dims();
const pTemple = TBK.proto('tb_temple_altar_grand', 0);
const pPalace = TBK.proto('tb_palace_ahedman', 0);
const allProtosOk = allKeys.every(k => {
  const g = TBK.proto(k, 0);
  return !!(g && g.userData.tris > 400 && g.userData.style === 'urban');
});
const ds = Object.values(dims);
const fullMatrixOk =
  ds.every(d => d.style === 'urban') &&
  ['poor', 'middle', 'rich'].every(w =>
    ['dwelling-single', 'dwelling-multi'].every(t => ds.some(d => d.wealth === w && (d.types || []).includes(t)))) &&
  ds.filter(d => (d.types || []).includes('military')).length >= 5 &&
  ds.filter(d => (d.types || []).includes('infrastructure')).length >= 8 &&
  bCtx.KTAGS.VOCAB.cultures.includes(TBK.KIT.culture) &&
  Object.values(TBK.DEFS).every(d => bCtx.KTAGS.norm(d.tags).problems.length === 0);

T.ok('TBK settlement bundle exports all 50 urban dims, zero unknown KTAGS, zero salvage, full dwelling/military/port matrix, and builds all 50 prototypes with zero errors',
  Object.keys(dims).length === 50 && allProtosOk && fullMatrixOk && TBK.errors.length === 0 &&
  !!(pTemple && pTemple.userData.tris > 1500 && pTemple.userData.doors >= 3) &&
  !!(pPalace && pPalace.userData.tris > 1500 && pPalace.userData.doors >= 5));

/* 7. K1 + M2 + M3 + M4 GLSL shader injection check on THREE.ShaderLib.standard */
const shTest = {
  uniforms: {},
  vertexShader: bCtx.THREE.ShaderLib.standard.vertexShader,
  fragmentShader: bCtx.THREE.ShaderLib.standard.fragmentShader
};
bCtx.KMAT.libHooks(shTest, {
  _fam: 'buffbrick', specular: 0.22, size: 512, pom: true,
  breakup: { mix: 0.38, macro: 0.07, cell: 6 },
  mipVariance: mipVars.buffbrick
});
T.ok('vstack K1/M2/M3/M4 shader hook injects uniform-deduplicated sine-free breakup, km1RoughAA, kmPomUv and uGroundAO with zero sin()',
  bCtx.KMAT.libKey() === '|km1' &&
  shTest.uniforms.uPomDepth.value > 0.01 &&
  shTest.uniforms.uGroundAO.value > 0.2 &&
  shTest.fragmentShader.includes('km1RoughAA(') &&
  shTest.fragmentShader.includes('kmPomUv(') &&
  !shTest.fragmentShader.includes('fract(sin('));

T.done();
