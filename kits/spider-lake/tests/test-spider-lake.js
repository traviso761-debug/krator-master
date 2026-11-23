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
  'src/34-sl-trades.js',
  'src/89-rows.js'
]) {
  const code = fs.readFileSync(path.join(HERE, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

const KIT = vm.runInContext('KIT', ctx);
const SV_CLOTH = vm.runInContext('SV_CLOTH', ctx);
const SL_TRADES = vm.runInContext('SL_TRADES', ctx);
const slSilkMath = vm.runInContext('slSilkMath', ctx);
const FAMILIES = vm.runInContext('FAMILIES', ctx);

T.ok('kit culture is spider-lake', KIT.culture === 'spider-lake' && KIT.id === 'spider-lake');
T.ok('all six silk material buckets join SV_CLOTH',
  ['silk', 'velarium', 'shamiyana', 'veil', 'streamer', 'brocade'].every(k => SV_CLOTH[k] === 1));
T.ok('cornerPin is exact zero at all four rigging corners',
  slSilkMath.cornerPin(0, 0) === 0 && slSilkMath.cornerPin(1, 0) === 0 &&
  slSilkMath.cornerPin(0, 1) === 0 && slSilkMath.cornerPin(1, 1) === 0);
T.ok('cornerPin peaks in the canopy belly', slSilkMath.cornerPin(0.5, 0.5) > 0.8);
T.neg('spanPin rejects detached crossbar ends and passes zeroed ends',
  fn => fn(0) === 0 && fn(1) === 0 && fn(0.5) > 0.9,
  u => 0.5 + 0.5 * Math.cos(u),
  slSilkMath.spanPin);
T.neg('hangPin anchors top curtain rail v=0 and releases lower hem v=1',
  fn => fn(0) === 0 && fn(1) === 1 && fn(0.5) > 0.3,
  v => 0.2 + 0.8 * v,
  slSilkMath.hangPin);
T.ok('hyparY forms anticlastic saddle with high diagonal peaks and low orthogonal valleys',
  slSilkMath.hyparY(0, 0, 4, 10, 0.2) === 10 &&
  slSilkMath.hyparY(1, 1, 4, 10, 0.2) === 10 &&
  slSilkMath.hyparY(0, 1, 4, 10, 0.2) === 4 &&
  slSilkMath.hyparY(1, 0, 4, 10, 0.2) === 4);
T.ok('Voth census trades table has 44 rows and every active trade names at least one sl_ def',
  SL_TRADES.length === 44 && SL_TRADES.every(r => r.na || (Array.isArray(r.defs) && r.defs.length > 0 && r.defs.every(d => d.startsWith('sl_')))));
T.ok('showcase FAMILIES rows have view-safe names with no apostrophes or colons',
  FAMILIES.length === 11 && FAMILIES.every(f => !/[':\\/*?"<>|]/.test(f.name)));
T.ok('Silkhead Great Central Caravanserai has its own hero showcase row and Voth caravanserai mapping',
  FAMILIES.some(f => f.keys.length === 1 && f.keys[0] === 'sl_caravanserai_silkhead') &&
  SL_TRADES.some(r => r.voth === 'voth_bldg_caravanserai' && r.defs.includes('sl_caravanserai_silkhead')));

T.done();
