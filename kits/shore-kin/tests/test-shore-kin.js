'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ctx = { Math, Object, Array, Number, String, JSON, Error };
ctx.globalThis = ctx;
ctx.PI = Math.PI;
ctx.TAU = Math.PI * 2;
ctx.lerp = (a, b, t) => a + (b - a) * t;
ctx.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
ctx.pick = arr => arr[0];
ctx.jc = hex => hex;
ctx.MAT_VAR = {};
ctx.DEFS = {};
ctx.THREE = { Matrix4: function () {}, Vector3: function () {} };
ctx.defBuilding = function (d) {
  const kit = vm.runInContext('KIT', ctx);
  d.cls = d.cls || 'building';
  d.tags = Object.assign({ culture: kit.culture }, d.tags || {});
  ctx.DEFS[d.key] = d;
  return d;
};
vm.createContext(ctx);

for (const rel of [
  '../../core/rand/08-core-rand.js',
  'src/26k-kit.js',
  'src/31-alt-takes.js',
  'src/34-sk-trades.js',
  'src/35-sk-head-geo.js',
  'src/89-rows.js',
  'src/50-sk-houses.js',
  'src/58-sk-works.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const SK = vm.runInContext('SK', ctx);
const SK_ARCH_MATERIALS = vm.runInContext('SK_ARCH_MATERIALS', ctx);
const SK_FORBIDDEN_MATERIALS = vm.runInContext('SK_FORBIDDEN_MATERIALS', ctx);
const SK_BILLS = vm.runInContext('SK_BILLS', ctx);
const skValidateBill = vm.runInContext('skValidateBill', ctx);
const skRigMath = vm.runInContext('skRigMath', ctx);
const skMaskParams = vm.runInContext('skMaskParams', ctx);
const skMaskGeo = vm.runInContext('skMaskGeo', ctx);
const SK_TRADES = vm.runInContext('SK_TRADES', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);
const DEFS = ctx.DEFS;

const REQUIRED_14 = [
  'sk_stilt_cot', 'sk_boardwalk_shack', 'sk_hex_lime_house', 'sk_serpentine_lodge',
  'sk_compound_house', 'sk_client_hall', 'sk_ash_kelp_kiln', 'sk_spar_sawpit',
  'sk_ropewalk_pitch', 'sk_paktong_foundry', 'sk_fish_saltery', 'sk_lime_kiln',
  'sk_boat_grid_shed', 'sk_tide_shrine'
];

T.ok('kit culture and id are shore-kin',
  KIT.culture === 'shore-kin' && KIT.id === 'shore-kin' && KIT.pack === 'shore-kin');

T.ok('registers >= 14 defBuildings including all 14 required Arcoforte P3c vernacular houses, works & shrine',
  Object.keys(DEFS).length === 16 && REQUIRED_14.every(k => !!DEFS[k]));

T.ok('SK_ARCH_MATERIALS palette contains strictly Arch local & sea-derived materials and zero Crookshore nephrite/jade/cypress',
  Object.keys(SK_ARCH_MATERIALS).length >= 30 &&
  Object.keys(SK_ARCH_MATERIALS).every(m => {
    const s = SK_ARCH_MATERIALS[m];
    const txt = (m + '|' + s.good + '|' + s.bucket + '|' + s.origin).toLowerCase();
    return SK_FORBIDDEN_MATERIALS.every(f => !txt.includes(f));
  }));

T.ok('every defBuilding carries structured per-part materials and aggregated bill from SK_ARCH_MATERIALS with zero nephrite or red-cypress',
  Object.keys(DEFS).every(k => {
    const d = DEFS[k];
    const v = skValidateBill(k, d);
    return v.ok && d.materials && d.materials.length >= 6 && d.bill && Object.keys(d.bill).length >= 4;
  }));

T.neg('skValidateBill rejects Crookshore nephrite or red-cypress material entries and accepts Arch serpentinite/mangrove/paktong',
  fn => fn('bad_house', {
    materials: [
      { part: 'lintel', mat: 'nephrite', good: 'jade', qty: 2 },
      { part: 'frame', mat: 'red-cypress', good: 'timber', qty: 4 },
      { part: 'socle', mat: 'laterite', good: 'brick', qty: 4 },
      { part: 'roof', mat: 'thatch_costularia', good: 'thatch', qty: 4 }
    ],
    bill: { jade: 2, timber: 4, brick: 4, thatch: 4 }
  }).ok === false && fn('sk_client_hall', SK_BILLS.sk_client_hall).ok === true,
  () => ({ ok: true, errs: [] }),
  skValidateBill);

T.ok('materials.json packs zero nephrite, jade, or cedar/cypress families', (() => {
  const matCfg = JSON.parse(fs.readFileSync(path.join(HERE, 'materials.json'), 'utf8'));
  const fams = Object.entries(matCfg.families);
  return fams.length >= 80 && fams.every(([fam, spec]) => {
    const check = (fam + '|' + spec.lib).toLowerCase();
    return !check.includes('nephrite') && !check.includes('jade') && !check.includes('cypress') && !check.includes('cedar.red');
  });
})());

T.ok('cornerPin is exact zero at all four sharkskin/ray-hide awning corners and peaks in belly',
  skRigMath.cornerPin(0, 0) === 0 && skRigMath.cornerPin(1, 0) === 0 &&
  skRigMath.cornerPin(0, 1) === 0 && skRigMath.cornerPin(1, 1) === 0 &&
  skRigMath.cornerPin(0.5, 0.5) > 0.8);

T.neg('chimePin anchors shell suspension cord v=0 and releases lower nacre shell v=1',
  fn => fn(0) === 0 && fn(1) === 1 && Math.abs(fn(0.5) - 0.5) < 1e-9,
  v => 0.2 + 0.8 * v,
  skRigMath.chimePin);

T.ok('ribVaultArc rises smoothly from serpentinite ring-wall head to terracotta crown collar', (() => {
  const p0 = skRigMath.ribVaultArc(4.2, 2.8, 0.6, 5.2, 0);
  const p1 = skRigMath.ribVaultArc(4.2, 2.8, 0.6, 5.2, 1);
  return Math.abs(p0[0] - 4.2) < 1e-9 && Math.abs(p0[1] - 2.8) < 1e-9 &&
    Math.abs(p1[0] - 0.6) < 1e-9 && Math.abs(p1[1] - 5.2) < 1e-9;
})());

T.ok('tideMarkY orders Neap < Mean < Spring < Double-Dark paktong inlays monotonically on sk_tide_shrine post', (() => {
  const yNeap = skRigMath.tideMarkY(1.0, 1 / 3, SK.TIDE_NEAP);
  const yMean = skRigMath.tideMarkY(1.0, 1 / 3, SK.TIDE_MEAN);
  const ySpring = skRigMath.tideMarkY(1.0, 1 / 3, SK.TIDE_SPRING);
  const yDD = skRigMath.tideMarkY(1.0, 1 / 3, SK.TIDE_DOUBLE_DARK);
  return yNeap < yMean && yMean < ySpring && ySpring < yDD;
})());

T.ok('skMaskGeo produces deterministic closed-eyed ancestor door-mask geometry via KRAND', (() => {
  const g1 = skMaskGeo(skMaskParams(4242));
  const g2 = skMaskGeo(skMaskParams(4242));
  return g1.eyes === 'closed' && g1.pos.length > 300 && g1.pos.length % 9 === 0 &&
    JSON.stringify(g1.pos.slice(0, 30)) === JSON.stringify(g2.pos.slice(0, 30));
})());

T.ok('SK_TRADES covers all 44 Voth census rows and maps every active trade to valid sk_ defs',
  SK_TRADES.length === 44 &&
  SK_TRADES.every(r => r.na || (Array.isArray(r.defs) && r.defs.length > 0 && r.defs.every(k => !!DEFS[k]))));

T.ok('showcase FAMILIES rows have view-safe names and place all 16 sk_ defs without duplicates', (() => {
  const keys = FAMILIES.flatMap(f => f.keys);
  return FAMILIES.length === 3 &&
    FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
    keys.length === 16 && new Set(keys).size === 16 &&
    keys.every(k => !!DEFS[k]);
})());

T.done();
