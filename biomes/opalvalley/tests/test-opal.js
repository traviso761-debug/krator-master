// node biomes/opalvalley/tests/test-opal.js: Opal Valley's data (src/40-biome-opal-sites.js, [G data]) without a page.
// The diggings are a pure function of the site (the same twice; every grade one of kits/resources' three; every id unique), every chain steps down
// link by link, every site's pressure is 1.6 atm x e^(-h/8 km) of its height, and the strata recipes are well formed. Each check has a negative.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const ctx = {console, Math, Object, Array, JSON, Error, Number, String, Set, Map};
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'biomes/opalvalley/src/40-biome-opal-sites.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8') + '\n;globalThis.OPAL_SITES=typeof OPAL_SITES!=="undefined"?OPAL_SITES:globalThis.OPAL_SITES;' +
    'globalThis.OPAL_DIGGINGS=typeof OPAL_DIGGINGS!=="undefined"?OPAL_DIGGINGS:globalThis.OPAL_DIGGINGS;globalThis.OPAL_STRATA=typeof OPAL_STRATA!=="undefined"?OPAL_STRATA:globalThis.OPAL_STRATA;', ctx, {filename: f});
const S = ctx.OPAL_SITES, D = ctx.OPAL_DIGGINGS, ST = ctx.OPAL_STRATA;
let fail = 0;
const check = (name, ok, detail) => { console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (detail ? ' : ' + detail : '')); if (!ok) fail++; };
const GR = {low: 1, medium: 1, high: 1};
const digsOk = list => list.length > 0 && list.every(r => GR[r.grade] && r.resource && r.resource.kind === 'opal' && r.resource.grade === r.grade) &&
  new Set(list.map(r => r.id)).size === list.length;
const stepsDown = chain => chain.every((L, i) => i === 0 || (L.y < chain[i - 1].y && L.x0 < chain[i - 1].x1));
const airOk = s => Math.abs(1.6 * Math.exp(-s.base / 8000) - s.atm) <= 0.02;
for (const k of Object.keys(S)) {
  const s = S[k], a = D(s), b = D(s);
  check(k + ': the diggings are the same twice', JSON.stringify(a) === JSON.stringify(b), a.length + ' records');
  check(k + ': every digging has one of the three grades, as kits/resources\' contract', digsOk(a), a.map(r => r.kind[0] + r.grade[0]).join(''));
  if (s.chain) check(k + ': the chain steps down link by link', stepsDown(s.chain), s.chain.map(L => L.y).join(' > '));
  check(k + ': the pressure is the height\'s', airOk(s), s.base + ' m, ' + s.atm + ' atm');
}
for (const r in ST) {
  const R = ST[r], ks = Object.keys(R.kinds), p = ks.reduce((t, k) => t + R.kinds[k].p, 0);
  check(r + ': a strata recipe (its main kind present, its shares sum to 1)', R.kinds[R.main] && Math.abs(p - 1) < 1e-6, ks.length + ' kinds, sum ' + p.toFixed(3));
}
// the negatives: each must fail
check('negative: a digging with a grade the resources kit does not have', !digsOk([{id: 'x', grade: 'rich', resource: {kind: 'opal', grade: 'rich'}}]));
check('negative: two diggings with one id', !digsOk([{id: 'x', grade: 'low', resource: {kind: 'opal', grade: 'low'}}, {id: 'x', grade: 'low', resource: {kind: 'opal', grade: 'low'}}]));
check('negative: a chain that climbs', !stepsDown([{x0: 100, x1: 0, y: 10}, {x0: -50, x1: -100, y: 12}]));
check('negative: a site at the wrong pressure', !airOk({base: 1340, atm: 1.5}));
check('negative: a different site gives different diggings', JSON.stringify(D(S.middlebed)) !== JSON.stringify(D(S.lowerbed)));
console.log(fail ? fail + ' FAILED' : 'all passed');
process.exit(fail ? 1 : 0);
