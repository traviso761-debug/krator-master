// node biomes/tiers/tests/test-tiers.js: the Tiers' data side, without a browser (tools/ktest.js)
//   - the five KSTRATA recipes (src/44r) load through the core's KSTRATA.add, and the stack TIERS_STRATA builds gives the steps' formations
//     at their heights (the Black Step's basalt at the lake tread, the Red, White and Grey Steps above)
//   - station 1's far field (stations/lake/44f + src/44v): the plan's sill stands on the 79 dry rim cells under the upper lake's level
//     (PLAN.md section 8a), the notch held at the level, and the model's own cells elsewhere untouched
//   - the gorge flood (src/44g): its segments' phases put the front down the channel at its speed, each segment's poly over its piece of the line
//   - the terracettes (src/44t): cut and fill balance across the steps, none on the flats or the cliffs, the lip a thin line along each row
//   - outposts.json: the three candidate sites pass the open world's registry (KOUTPOST.offer), each clear of the Kingdom's places
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

// ---- the gorge flood (TIERS_FLOOD): a straight channel 1 km long falling 50 m, 90 m segments, a front at 4 m/s
load('biomes/tiers/src/44g-biome-tiers-flood.js');
const FL = ctx.TIERS_FLOOD({id: 'test', line: [[0, 0], [1000, 0]], floor: (x, z) => 100 - x * .05, w: 20, depth: 2, seg: 90, front: 4});
const frontOK = F => F.records.every((R, i) => i === 0 || Math.abs((F.startOf(i, 1) - F.startOf(i - 1, 1)) - ((R.flood.s0 - F.records[i - 1].flood.s0) / F.front)) < 1e-6);
T.ok('the flood: each segment\'s warning starts s / front seconds after the head\'s', frontOK(FL), FL.records.map((R, i) => FL.startOf(i, 1).toFixed(1)).join(' '));
const rev = Object.assign({}, FL, {records: FL.records.map((R, i, A) => Object.assign({}, R, {cycle: Object.assign({}, R.cycle, {offset: A[A.length - 1 - i].cycle.offset})}))});
T.neg('a flood running uphill is caught', frontOK, rev, FL);
const inPoly = (pts, x, z) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j];
  if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const covers = F => F.records.every(R => inPoly(R.shape.pts, 0, 0) && inPoly(R.shape.pts, 0, R.shape.pts[0][1] * .5)) && F.records.every(R => R.y < 100 - (R.x + 45) * .05);
T.ok('the flood: every segment\'s poly holds its middle, its band from under the bed', covers(FL), FL.records.length + ' segments');
T.neg('a segment set above its bed is caught', covers, Object.assign({}, FL, {records: FL.records.map(R => Object.assign({}, R, {y: R.y + 10}))}), FL);

// ---- the terracettes (TIERS_TERRACETTES) on a plane rising .5 a metre (27 degrees), no breaks
load('biomes/tiers/src/44t-biome-tiers-terracettes.js');
const TT = ctx.TIERS_TERRACETTES({h: (x, z) => x * .5, breaks: 0});
const balance = F => { let m = 0, n = 0; for (let x = 0; x < 60; x += .01) { m += F.shape(x, 0, x * .5) - x * .5; n++; } return Math.abs(m / n) < .01; };
T.ok('the terracettes: cut and fill balance across the steps', balance(TT), 'mean offset over 60 m');
T.neg('a stepped ground lifted 0.2 m is caught', balance, Object.assign({}, TT, {shape: (x, z, g) => TT.shape(x, z, g) + .2}), TT);
const bands = F => F.k(5, 0) > .9 && ctx.TIERS_TERRACETTES({h: (x, z) => x * .02, breaks: 0}).k(5, 0) === 0 && ctx.TIERS_TERRACETTES({h: (x, z) => x * 1.4, breaks: 0}).k(5, 0) === 0;
T.ok('the terracettes form on the grazed slope, not on the flats or the cliffs', bands(TT), 'k ' + TT.k(5, 0).toFixed(2));
T.neg('terracettes on the flats are caught', F => F.k(5, 0) > .9 && F.k(500, 0) === 0, {k: () => 1}, {k: x => x < 100 ? 1 : 0});
let lipN = 0, N = 0; for (let x = 0; x < 60; x += .01) { N++; if (TT.lip(x, 0, x * .5) > .5) lipN++; }
T.ok('the terracettes: the lip is a thin line along each row (5-20% of the slope)', lipN / N > .05 && lipN / N < .2, (lipN / N).toFixed(3));

// ---- the candidate sites (outposts.json) offered to the open world's registry
load('openworld/outposts/src/10-outposts-registry.js');
const OP = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'outposts.json'), 'utf8'));
const off = ctx.KOUTPOST.offer('tiers', OP.candidates);
T.ok('outposts.json: every candidate kept by KOUTPOST.offer', off.kept.length === OP.candidates.length && !off.errors.length, JSON.stringify(off));
const KINGDOM = [[1265, 500], [1262, 512], [1272, 522]];   /* the capital and the lake towns (PLAN.md section 6) */
const clear = c => KINGDOM.every(([x, y]) => Math.hypot(c.place.px - x, c.place.py - y) >= 2);   /* 4 km and more (2 km a pixel) */
T.ok('outposts.json: every candidate 4 km or more from the Kingdom\'s places', OP.candidates.every(clear), OP.candidates.filter(c => !clear(c)).map(c => c.id).join(', '));
T.neg('a candidate on the lake town is caught', c => clear(c), {place: {px: 1272, py: 522}}, OP.candidates[0]);
ctx.KOUTPOST.clearCandidates();
T.neg('a candidate with an unknown kind is refused', c => ctx.KOUTPOST.offer('tiers', [c]).errors.length === 0,
  Object.assign({}, OP.candidates[0], {id: 'tiers:test', suits: ['castle']}), Object.assign({}, OP.candidates[0], {id: 'tiers:test2'}));

// ---- the 25 native plants (src/50): every one tiered, tagged inside the region's Koppen classes, and carrying a harvest record
{
  const spSrc = fs.readFileSync(path.join(ROOT, 'biomes/tiers/src/50-biome-tiers-species.js'), 'utf8');
  const dataEnd = spSrc.indexOf('// ---------------------------------------------------------------- procedural textures');
  const bctx = {console, Math, JSON}; bctx.globalThis = bctx; vm.createContext(bctx);
  vm.runInContext('var BIO={kit:function(){},fn:{TAU:Math.PI*2,clamp:function(v,a,b){return v<a?a:v>b?b:v;}},host:{THREE:{}}};', bctx);
  vm.runInContext(spSrc.slice(0, dataEnd) + '\n})();', bctx, {filename: '50-biome-tiers-species.js'});
  const PL = bctx.TIERS.PLANTS, SP = bctx.TIERS.SPECIES, KP = Object.keys(bctx.TIERS.KOPPEN), BAR = bctx.TIERS.BARREN;
  const pkeys = Object.keys(PL);
  T.ok('TIERS.PLANTS defines 25 native tiered species (7 tree-scale + 18 floor)', pkeys.length === 25 && SP.length === 7, 'plants ' + pkeys.length + ', trees ' + SP.length);
  const allTiered = P => Object.keys(P).every(k => P[k].tags && P[k].tags.tiered === true && P[k].tags.harvest && P[k].tags.harvest.note.length > 10 &&
    Array.isArray(P[k].tags.koppen) && P[k].tags.koppen.length > 0 && P[k].tags.koppen.every(c => KP.indexOf(c) >= 0 && BAR.indexOf(c) < 0));
  T.ok('every native species obeys the tiers rule, carries harvest notes, and stays within non-barren Koppen classes', allTiered(PL), pkeys.join(', '));
  T.neg('an untiered or EF-tagged plant is caught', allTiered,
    Object.assign({}, PL, {bad: {tags: {tiered: false, koppen: ['EF'], harvest: {note: 'bad'}}}}), PL);
  const treeTiersOK = A => A.every(s => Array.isArray(s.tiers) && s.tiers.length === 2 && s.tiers[0] >= 2 && s.tiers[1] >= s.tiers[0] && PL[s.key]);
  T.ok('all 7 tree-scale species declare valid whorl/tier counts and link to TIERS.PLANTS', treeTiersOK(SP), SP.map(s => s.key + ':' + s.tiers.join('-')).join(' '));
  T.neg('a tree species with fewer than 2 tiers is caught', treeTiersOK, SP.concat([{key: 'shelfoak', tiers: [1, 1]}]), SP);
}
T.done();
