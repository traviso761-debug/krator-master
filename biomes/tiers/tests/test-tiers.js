// node biomes/tiers/tests/test-tiers.js: the Tiers' data side, without a browser (tools/ktest.js)
//   - the five KSTRATA recipes (src/44r) load through the core's KSTRATA.add, and the stack TIERS_STRATA builds gives the steps' formations
//     at their heights (the Black Step's basalt at the lake tread, the Red, White and Grey Steps above)
//   - station 1's far field (stations/lake/44f + src/44v): the plan's sill stands on the 79 dry rim cells under the upper lake's level
//     (PLAN.md section 8a), the notch held at the level, and the model's own cells elsewhere untouched
const fs = require('fs'), vm = require('vm'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const ctx = {console, Math, JSON}; ctx.globalThis = ctx; ctx.window = ctx; vm.createContext(ctx);
const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, {filename: f});
['core/rand/08-core-rand.js', 'core/terrain/35-core-strata.js'].forEach(load);
// BIO.strata is the host shade's (35z); the data side is KSTRATA.create with the same options
vm.runInContext(`var BIO={strata:o=>KSTRATA.create(o),fn:{TAU:Math.PI*2,clamp:(v,a,b)=>v<a?a:v>b?b:v,lerp:(a,b,t)=>a+(b-a)*t,mix:(a,b,t)=>a+(b-a)*t,
 smooth:(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);}}};`, ctx);
load('biomes/tiers/src/44r-biome-tiers-strata.js');

// ---- the recipes
const names = ['tiers-floor', 'tiers-black', 'tiers-red', 'tiers-white', 'tiers-grey'];
const have = n => { try { return !!ctx.KSTRATA.recipe(n); } catch (e) { return false; } };
T.ok('the five tiers recipes are added to KSTRATA', names.every(have), names.filter(n => !have(n)).join(', '));
const S = ctx.TIERS_STRATA({});
const recAt = y => S.at(0, y, 0).recipe;
T.ok('the lake tread stands in the Black Step\'s basalt', recAt(1300) === 'tiers-black', recAt(1300));
T.ok('the stair climbs Red, White and Grey', recAt(2600) === 'tiers-red' && recAt(3400) === 'tiers-white' && recAt(5000) === 'tiers-grey',
  [recAt(2600), recAt(3400), recAt(5000)].join(' '));
T.neg('a height in the wrong formation is caught', y => recAt(y) === 'tiers-black', 3400, 1300);
const hardCap = S.kinds.filter(k => k.recipe === 'tiers-black' && k.kind === 'flow')[0];
T.ok('the Black Step\'s flows are hard (a cliff-maker)', hardCap && hardCap.hard >= .9, JSON.stringify(hardCap));

// ---- station 1's far field: the sill
load('biomes/tiers/stations/lake/44f-host-far-data.js');
vm.runInContext(fs.readFileSync(path.join(ROOT, 'biomes/tiers/src/44v-host-landlib.js'), 'utf8').replace(/^const \{TAU[^\n]*\n/m, 'const {TAU,clamp,lerp,mix,smooth}=BIO.fn;\n') + '\n;globalThis.MODEL=MODEL;', ctx);
const M = ctx.MODEL, F = vm.runInContext('FAR_MODEL', ctx);
T.ok('the sill raises the 79 rim cells the plan counts (PLAN.md section 8a)', M.sill === 79, 'sill cells ' + M.sill);
// every sill cell stands at the level + 30 or (the notch) at the level; a cell the sill does not touch is the model's own
const n = F.n, r = F.r;
let bad = 0, own = 0;
for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
  const v = M.raw(i - r, j - r), h = F.h[j * n + i];
  if (v !== h) { if (!(v === 1180 || v === 1150)) bad++; } else own++;
}
T.ok('the sill cells stand at 1,180 m (the notch at 1,150 m), the rest are the model\'s own', bad === 0 && own === n * n - 79, 'bad ' + bad + ', own ' + own);
const notch = M.raw(1246 - F.site.cx, 531 - F.site.cy);
T.ok('the notch at 1246,531 is held at the level (the outfall)', notch === 1150, 'notch ' + notch);
T.neg('a sill cell left under the level is caught', v => v >= 1150, 284, 1180);
T.done();
