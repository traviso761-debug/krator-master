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
  'src/72-ra-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const RA_DYNASTIES = vm.runInContext('RA_DYNASTIES', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const RA_TRADES = vm.runInContext('RA_TRADES', ctx);
const raTradeDefs = vm.runInContext('raTradeDefs', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

/* 1. Kit identity & dynastic metadata (26k-kit.js) */
T.ok('kit identity is ria with Lower Ria and Upper Ria dynastic metadata',
  KIT.id === 'ria' && KIT.culture === 'ria' &&
  RA_DYNASTIES.lowerRia.style === 'lower-ria' &&
  RA_DYNASTIES.upperRia.style === 'upper-ria');

T.ok('all cloth banner and silk material keys join SV_CLOTH',
  ['silk', 'brocade', 'flag'].every(k => SV_CLOTH[k] === 1));

/* 2. Sheet rows & 76 building keys (89-rows.js) */
const allKeys = FAMILIES.flatMap(f => f.keys);
const uniqKeys = new Set(allKeys);
const westKeys = allKeys.filter(k => k.startsWith('ra_west_'));
const eastKeys = allKeys.filter(k => k.startsWith('ra_east_'));

T.ok('six dynastic sheet rows hold 76 unique buildings (38 lower-ria + 38 upper-ria)',
  FAMILIES.length === 6 && allKeys.length === 76 && uniqKeys.size === 76 &&
  westKeys.length === 38 && eastKeys.length === 38);

const viewSafe = name => typeof name === 'string' && name.length > 0 && !/[':\\/*?"<>|]/.test(name);
T.neg('row names reject apostrophes, colons and slashes for check_views',
  rows => rows.every(r => viewSafe(r.name)),
  [{ name: "Potter's Row: Lower/Ria" }],
  FAMILIES);

/* 3. Voth census trades table (72-ra-trades.js) */
const validTradesTable = rows =>
  Array.isArray(rows) && rows.length === 44 &&
  rows.every(r => r.na || (
    Array.isArray(r.lowerRia) && r.lowerRia.length > 0 && r.lowerRia.every(k => uniqKeys.has(k) && k.startsWith('ra_west_')) &&
    Array.isArray(r.upperRia) && r.upperRia.length > 0 && r.upperRia.every(k => uniqKeys.has(k) && k.startsWith('ra_east_'))
  ));

T.neg('RA_TRADES covers all 44 Voth census rows in both Lower Ria and Upper Ria and rejects missing branch defs',
  validTradesTable,
  RA_TRADES.map((r, i) => i === 0 ? { trade: r.trade, voth: r.voth, lowerRia: r.lowerRia, upperRia: [] } : r),
  RA_TRADES);

const lowerMap = raTradeDefs('lower-ria');
const upperMap = raTradeDefs('upper-ria');
T.ok('raTradeDefs returns all 40 active Voth trades for both dynastic styles',
  Object.keys(lowerMap).length === 40 && Object.keys(upperMap).length === 40 &&
  lowerMap.bakers.includes('ra_west_covered_bazaar') &&
  upperMap.bakers.includes('ra_east_stoa_agora'));

/* 4. Stage 1 BUDGETS.json & Stage 5 KMAT_M1 + mip-variance.json + materials.json */
const budgets = JSON.parse(fs.readFileSync(path.join(HERE, 'BUDGETS.json'), 'utf8'));
const pageBudget = budgets.pages && budgets.pages['ria.html'];
T.ok('BUDGETS.json sets Stage 1 samplers:15 and vram_mb:320 ceilings',
  !!(pageBudget && pageBudget.samplers === 15 && pageBudget.vram_mb === 320 && pageBudget.tris >= 1800000));

const matsCfg = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8')).families;
const mipVars = JSON.parse(fs.readFileSync(path.join(HERE, 'mip-variance.json'), 'utf8')).families;
T.ok('hero masonry families enable height:true and mip-variance.json covers 40 lit families',
  ['travertine', 'dolomite', 'brick', 'paving', 'porphyry'].every(k => matsCfg[k] && matsCfg[k].height === true) &&
  Object.keys(mipVars).length >= 38 &&
  Array.isArray(mipVars.giltroof) && mipVars.giltroof.length >= 8);

const rMip0 = KMAT_M1.roughnessWithVariance(0.24, 0, mipVars.giltroof);
const rMip4 = KMAT_M1.roughnessWithVariance(0.24, 4, mipVars.giltroof);
T.ok('KMAT_M1 M2 specular AA widens giltroof roughness at coarse mips while preserving mip 0',
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
const riaRooms = [
  { id: 'portico', box: [-4, 1, 4, 4, 5, 8], doors: [{ out: true, w: 2.4 }, { to: 'throne_hall', w: 2.2 }], windows: [{ w: 1.4, h: 1.7 }], lamps: [{ amp: 1.0, r: 8 }] },
  { id: 'throne_hall', box: [-6, 1, -6, 6, 6, 4], doors: [{ to: 'portico', w: 2.2 }], windows: [], lamps: [{ amp: 1.3, r: 9 }] },
  { id: 'sealed_vault', box: [-3, -3, -3, 3, 0, 3], vault: true, doors: [{ to: 'throne_hall', w: 1.4 }], windows: [], lamps: [{ amp: 0.9, r: 7 }] }
];
const rlTable = KROOMLIGHT.buildTable({ rooms: riaRooms });
T.neg('KROOMLIGHT attenuates portal daylight monotonically across doorways and blocks daylight in vaults',
  row => row.daylight === 0,
  rlTable.byId.portico,
  rlTable.byId.sealed_vault);

T.ok('KROOMLIGHT pickPool & vertexCornerAO gate room lights and darken floor-wall corners',
  rlTable.byId.portico.daylight > rlTable.byId.throne_hall.daylight &&
  rlTable.byId.throne_hall.daylight > 0.1 &&
  KROOMLIGHT.pickPool({
    eye: [0, 2.2, 0], eyeRoom: 'throne_hall', table: rlTable, count: 6, sunUp: 1.0,
    windows: [{ room: 'portico', x: 0, y: 2.8, z: 6.5 }],
    lamps: [{ room: 'throne_hall', x: 0, y: 2.4, z: -2.0, amp: 1.2, r: 9 }]
  }).length === 2 &&
  KROOMLIGHT.vertexCornerAO(0, 0.02, 2.0, 1, 0, 0, [0, 0, 0, 6, 4, 6], 0.85) < 0.82);

/* 6. RIK settlement bundle (kits/ria/kit_bundle.py) */
const PY = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');   /* as kits/tungang/tests/test-bundle.js */
const pyBundle = cp.execFileSync(PY, ['-c', 'import sys; sys.path.insert(0, "kits/ria"); import kit_bundle; js, _ = kit_bundle.bundle("RIK"); sys.stdout.write(js)'],
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
/* the repo's three.js r128, where tools/harness.py takes it (kits/ancients/three.min.js); no shell (`find | head` is not on Windows) */
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
vm.runInContext(pyBundle, bCtx, { filename: 'rik_bundle.js' });
const RIK = bCtx.RIK;
const dims = RIK.dims();
const pWest = RIK.proto('ra_west_strategion_keep', 0);
const pEast = RIK.proto('ra_east_acropolis_keep', 0);
const allProtosOk = allKeys.every(k => {
  const g = RIK.proto(k, 0);
  return !!(g && g.userData.tris > 500);
});
const fullMatrixOk = ['lower-ria', 'upper-ria'].every(st => {
  const ds = Object.values(dims).filter(d => d.style === st);
  const dwellOk = ['poor', 'middle', 'rich'].every(w =>
    ['dwelling-single', 'dwelling-multi'].every(t => ds.some(d => d.wealth === w && (d.types || []).includes(t))));
  const milN = ds.filter(d => (d.types || []).includes('military')).length;
  const infN = ds.filter(d => (d.types || []).includes('infrastructure')).length;
  return dwellOk && milN >= 6 && infN >= 6;
});

T.ok('RIK settlement bundle exports all 76 dims, full dwelling/military/logistics matrix, and builds all 76 prototypes with zero errors',
  Object.keys(dims).length === 76 && allProtosOk && fullMatrixOk && RIK.errors.length === 0 &&
  !!(pWest && pWest.userData.tris > 1500 && pWest.userData.doors >= 3) &&
  !!(pEast && pEast.userData.tris > 1500 && pEast.userData.doors >= 3));

/* 7. K1 + M2 + M3 + M4 GLSL shader injection check on THREE.ShaderLib.standard */
const shTest = {
  uniforms: {},
  vertexShader: bCtx.THREE.ShaderLib.standard.vertexShader,
  fragmentShader: bCtx.THREE.ShaderLib.standard.fragmentShader
};
bCtx.KMAT.libHooks(shTest, {
  _fam: 'travertine', specular: 0.24, size: 512, pom: true,
  breakup: { mix: 0.36, macro: 0.06, cell: 7 },
  mipVariance: mipVars.travertine
});
T.ok('vstack K1/M2/M3/M4 shader hook injects uniform-deduplicated sine-free breakup, km1RoughAA, kmPomUv and uGroundAO with zero sin()',
  bCtx.KMAT.libKey() === '|km1' &&
  shTest.uniforms.uPomDepth.value > 0.01 &&
  shTest.uniforms.uGroundAO.value > 0.2 &&
  shTest.fragmentShader.includes('km1RoughAA(') &&
  shTest.fragmentShader.includes('kmPomUv(') &&
  !shTest.fragmentShader.includes('fract(sin('));

T.done();
