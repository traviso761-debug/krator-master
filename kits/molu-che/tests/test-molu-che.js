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
  'src/72-mc-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const MC_CLANS = vm.runInContext('MC_CLANS', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const MC_TRADES = vm.runInContext('MC_TRADES', ctx);
const mcTradeDefs = vm.runInContext('mcTradeDefs', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

/* 1. Kit identity & clan metadata (26k-kit.js) */
T.ok('kit identity is molu-che with Dikengyuan Bench Clans and Dipu-Bonduwe Vault metadata',
  KIT.id === 'molu-che' && KIT.culture === 'molu-che' &&
  KIT.faction === 'Molu-Che Fossorial Clans of Moleshelf' &&
  KIT.band === 'Moleshelf' &&
  MC_CLANS.dikengyuan.style === 'dikengyuan' &&
  MC_CLANS.bonduwe.style === 'bonduwe');

T.ok('all mole-felt, Cucuteni tapestry and safe-conduct flag keys join SV_CLOTH',
  ['molefelt', 'tapestry', 'flag'].every(k => SV_CLOTH[k] === 1));

/* 2. Sheet rows & 38 building keys (89-rows.js) */
const allKeys = FAMILIES.flatMap(f => f.keys);
const uniqKeys = new Set(allKeys);
const dikengKeys = FAMILIES.slice(0, 2).flatMap(f => f.keys);
const bonduweKeys = FAMILIES.slice(2, 4).flatMap(f => f.keys);

T.ok('four Molu-Che sheet rows hold 38 unique buildings (19 dikengyuan + 19 bonduwe)',
  FAMILIES.length === 4 && allKeys.length === 38 && uniqKeys.size === 38 &&
  dikengKeys.length === 19 && bonduweKeys.length === 19 &&
  allKeys.every(k => k.startsWith('mc_')));

const viewSafe = name => typeof name === 'string' && name.length > 0 && !/[':\\/*?"<>|]/.test(name);
T.neg('row names reject apostrophes, colons and slashes for check_views',
  rows => rows.every(r => viewSafe(r.name)),
  [{ name: "Lonko's Row: Dikengyuan/Vaults" }],
  FAMILIES);

/* 3. Voth census trades table (72-mc-trades.js) */
const dikengSet = new Set(dikengKeys);
const bonduweSet = new Set(bonduweKeys);
const validTradesTable = rows =>
  Array.isArray(rows) && rows.length === 44 &&
  rows.every(r => r.na || (
    Array.isArray(r.dikengyuan) && r.dikengyuan.length > 0 && r.dikengyuan.every(k => dikengSet.has(k)) &&
    Array.isArray(r.bonduwe) && r.bonduwe.length > 0 && r.bonduwe.every(k => bonduweSet.has(k))
  ));

T.neg('MC_TRADES covers all 44 Voth census rows in both Dikengyuan and Bonduwe and rejects missing branch defs',
  validTradesTable,
  MC_TRADES.map((r, i) => i === 0 ? { trade: r.trade, voth: r.voth, dikengyuan: r.dikengyuan, bonduwe: [] } : r),
  MC_TRADES);

const dikengMap = mcTradeDefs('dikengyuan');
const bonduweMap = mcTradeDefs('bonduwe');
T.ok('mcTradeDefs returns all 41 active Voth trades including mushroom growers for both styles',
  Object.keys(dikengMap).length === 41 && Object.keys(bonduweMap).length === 41 &&
  dikengMap['mushroom growers'].includes('mc_tuber_seep_gallery') &&
  bonduweMap['porters and warehousemen'].includes('mc_grand_bullion_vault'));

/* 4. Stage 1 BUDGETS.json & Stage 5 KMAT_M1 + mip-variance.json + materials.json */
const budgets = JSON.parse(fs.readFileSync(path.join(HERE, 'BUDGETS.json'), 'utf8'));
const pageBudget = budgets.pages && budgets.pages['molu-che.html'];
T.ok('BUDGETS.json sets Stage 1 samplers:15 and vram_mb:320 ceilings',
  !!(pageBudget && pageBudget.samplers === 15 && pageBudget.vram_mb === 320 && pageBudget.tris === 3200000 && pageBudget.calls === 220));

const matsCfg = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8')).families;
const mipVars = JSON.parse(fs.readFileSync(path.join(HERE, 'mip-variance.json'), 'utf8')).families;
T.ok('hero loess and masonry families enable height:true and mip-variance.json covers 38 lit families',
  ['loess', 'rammed', 'limewash', 'dolomite', 'kilnbrick', 'basalt', 'paving', 'cobble'].every(k => matsCfg[k] && matsCfg[k].height === true) &&
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
const mcRooms = [
  { id: 'yaodong_forehall', box: [-5, 0.4, -4, 5, 4.0, 2], doors: [{ out: true, w: 2.0 }, { to: 'inner_hearth_vault', w: 1.8 }], windows: [{ w: 1.1, h: 0.5 }], lamps: [{ amp: 1.0, r: 8 }] },
  { id: 'inner_hearth_vault', box: [-5, 0.4, -10, 5, 4.0, -4], doors: [{ to: 'yaodong_forehall', w: 1.8 }], windows: [], lamps: [{ amp: 1.3, r: 9 }] },
  { id: 'bonduwe_silver_strongroom', box: [-4, 0.4, -15, 4, 4.0, -10], vault: true, doors: [{ to: 'inner_hearth_vault', w: 1.5 }], windows: [], lamps: [{ amp: 0.9, r: 7.5 }] }
];
const rlTable = KROOMLIGHT.buildTable({ rooms: mcRooms });
T.neg('KROOMLIGHT attenuates portal daylight across yaodong vaults and blocks daylight in sealed bonduwe strongrooms',
  row => row.daylight === 0,
  rlTable.byId.yaodong_forehall,
  rlTable.byId.bonduwe_silver_strongroom);

T.ok('KROOMLIGHT pickPool & vertexCornerAO gate room lights and darken floor-wall corners',
  rlTable.byId.yaodong_forehall.daylight > rlTable.byId.inner_hearth_vault.daylight &&
  rlTable.byId.inner_hearth_vault.daylight > 0.1 &&
  KROOMLIGHT.pickPool({
    eye: [0, 2.0, -7], eyeRoom: 'inner_hearth_vault', table: rlTable, count: 6, sunUp: 1.0,
    windows: [{ room: 'yaodong_forehall', x: 0, y: 2.8, z: 1.8 }],
    lamps: [{ room: 'inner_hearth_vault', x: 0, y: 2.2, z: -7.0, amp: 1.2, r: 9 }]
  }).length === 2 &&
  KROOMLIGHT.vertexCornerAO(0, 0.02, 2.0, 1, 0, 0, [0, 0, 0, 6, 4, 6], 0.85) < 0.82);

/* 6. MCK settlement bundle (kits/molu-che/kit_bundle.py) */
const pyBundle = cp.execFileSync('python3', ['-c', 'import sys; sys.path.insert(0, "kits/molu-che"); import kit_bundle; js, _ = kit_bundle.bundle("MCK"); sys.stdout.write(js)'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const threePath = cp.execSync('find tools core settlements kits -maxdepth 3 -name "three.min.js" | head -n 1', { cwd: ROOT, encoding: 'utf8' }).trim();
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
vm.runInContext(pyBundle, bCtx, { filename: 'mck_bundle.js' });
const MCK = bCtx.MCK;
const dims = MCK.dims();
const pDikeng = MCK.proto('mc_clan_great_pit', 0);
const pBonduwe = MCK.proto('mc_grand_bullion_vault', 0);
const allProtosOk = allKeys.every(k => {
  const g = MCK.proto(k, 0);
  return !!(g && g.userData.tris > 450);
});
const fullMatrixOk = ['dikengyuan', 'bonduwe'].every(st => {
  const ds = Object.values(dims).filter(d => d.style === st);
  const dwellOk = ['poor', 'middle', 'rich'].every(w =>
    ['dwelling-single', 'dwelling-multi'].every(t => ds.some(d => d.wealth === w && (d.types || []).includes(t))));
  const milN = ds.filter(d => (d.types || []).includes('military')).length;
  const infN = ds.filter(d => (d.types || []).includes('infrastructure')).length;
  return ds.length === 19 && dwellOk && milN >= 3 && infN >= 5;
});

T.ok('MCK settlement bundle exports all 38 dims, full 6-cell dwelling/military/logistics matrix, and builds all 38 prototypes with zero errors',
  Object.keys(dims).length === 38 && allProtosOk && fullMatrixOk && MCK.errors.length === 0 &&
  !!(MCK.clans && MCK.clans.dikengyuan && MCK.clans.bonduwe) &&
  !!(pDikeng && pDikeng.userData.tris > 1200 && pDikeng.userData.doors >= 5) &&
  !!(pBonduwe && pBonduwe.userData.tris > 1200 && pBonduwe.userData.doors >= 5));

/* 7. K1 + M2 + M3 + M4 GLSL shader injection check on THREE.ShaderLib.standard */
const shTest = {
  uniforms: {},
  vertexShader: bCtx.THREE.ShaderLib.standard.vertexShader,
  fragmentShader: bCtx.THREE.ShaderLib.standard.fragmentShader
};
bCtx.KMAT.libHooks(shTest, {
  _fam: 'loess', specular: 0.16, size: 512, pom: true,
  breakup: { mix: 0.42, macro: 0.08, cell: 7 },
  mipVariance: mipVars.loess
});
T.ok('vstack K1/M2/M3/M4 shader hook injects uniform-deduplicated sine-free breakup, km1RoughAA, kmPomUv and uGroundAO with zero sin()',
  bCtx.KMAT.libKey() === '|km1' &&
  shTest.uniforms.uPomDepth.value > 0.01 &&
  shTest.uniforms.uGroundAO.value > 0.2 &&
  shTest.fragmentShader.includes('km1RoughAA(') &&
  shTest.fragmentShader.includes('kmPomUv(') &&
  !shTest.fragmentShader.includes('fract(sin('));

T.done();
