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
  '../../kits/resources/src/42r-res-ore.js',
  'src/26k-kit.js',
  'src/34-hk-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const HK_POLITIES = vm.runInContext('HK_POLITIES', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const HK_TRADES = vm.runInContext('HK_TRADES', ctx);
const hkRigMath = vm.runInContext('hkRigMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

T.ok('kit culture is hueru-kuran', KIT.culture === 'hueru-kuran' && KIT.id === 'hueru-kuran');
T.ok('HK_POLITIES covers all four drowned ejecta craters and the +690 m cypress-flume terrace',
  Object.keys(HK_POLITIES).length === 5 &&
  HK_POLITIES.kuranOta.coords[0] === 89 && HK_POLITIES.kuranOta.coords[1] === 604 &&
  HK_POLITIES.ukorTera.coords[0] === 124 && HK_POLITIES.ukorTera.coords[1] === 710);
T.ok('all wind-rigged gutskin, hide, kelp, netting, banner and nephrite chime buckets join SV_CLOTH',
  ['gutskin', 'hide', 'kelp', 'netting', 'banner', 'chime', 'flag'].every(k => SV_CLOTH[k] === 1));
T.ok('cornerPin is exact zero at all four gutskin awning corners and peaks in belly',
  hkRigMath.cornerPin(0, 0) === 0 && hkRigMath.cornerPin(1, 0) === 0 &&
  hkRigMath.cornerPin(0, 1) === 0 && hkRigMath.cornerPin(1, 1) === 0 &&
  hkRigMath.cornerPin(0.5, 0.5) > 0.8);
T.neg('spanPin rejects detached ends and passes zeroed ends',
  fn => fn(0) === 0 && fn(1) === 0 && fn(0.5) > 0.9,
  u => 0.5 + 0.5 * Math.cos(u),
  hkRigMath.spanPin);
T.neg('chimePin anchors baleen suspension cord v=0 and releases lower nephrite slab end v=1',
  fn => fn(0) === 0 && fn(1) === 1 && Math.abs(fn(0.5) - 0.5) < 1e-9,
  v => 0.15 + 0.85 * v,
  hkRigMath.chimePin);
T.ok('nuragheRadius tapers monotonically from rBase to rTop',
  hkRigMath.nuragheRadius(5.0, 3.5, 0) === 5.0 &&
  hkRigMath.nuragheRadius(5.0, 3.5, 1) === 3.5 &&
  hkRigMath.nuragheRadius(5.0, 3.5, 0.5) < 4.35 &&
  hkRigMath.nuragheRadius(5.0, 3.5, 0.5) > 4.0);
T.ok('whaleRibArc rises from basalt ring-wall spring to smoke-ring crown',
  (() => {
    const p0 = hkRigMath.whaleRibArc(4.0, 2.8, 0.6, 5.2, 0);
    const p1 = hkRigMath.whaleRibArc(4.0, 2.8, 0.6, 5.2, 1);
    return Math.abs(p0[0] - 4.0) < 1e-9 && Math.abs(p0[1] - 2.8) < 1e-9 &&
      Math.abs(p1[0] - 0.6) < 1e-9 && Math.abs(p1[1] - 5.2) < 1e-9;
  })());
T.ok('keyholeHalfWidth narrows smoothly from upper threshold to aquifer mirror pool',
  Math.abs(hkRigMath.keyholeHalfWidth(6.2, 3.7, 0) - 3.1) < 1e-9 &&
  Math.abs(hkRigMath.keyholeHalfWidth(6.2, 3.7, 1) - 1.85) < 1e-9);
T.ok('Voth census trades table has 44 rows and every active trade names at least one hk_ def',
  HK_TRADES.length === 44 && HK_TRADES.every(r => r.na || (Array.isArray(r.defs) && r.defs.length > 0 && r.defs.every(d => d.startsWith('hk_')))));
T.ok('showcase FAMILIES rows have view-safe names and place all 45 hk_ building defs',
  FAMILIES.length === 10 &&
  FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)) &&
  FAMILIES.flatMap(f => f.keys).filter(k => k.startsWith('hk_')).length === 45);

T.done();
