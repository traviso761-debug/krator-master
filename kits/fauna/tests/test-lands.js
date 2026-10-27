// node kits/fauna/tests/test-lands.js: fauna by land (H8; fauna-lands.js, fauna-lands-host.js; README.md "Fauna by land"),
// on the kit's real catalog (fauna-core.js, every species file and the runtime, read in a vm with three as the bundle wraps
// them). Each check with a negative.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..'), KIT = path.join(ROOT, 'kits', 'fauna');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const THREE = require(path.join(ROOT, 'kits', 'ancients', 'three.min.js'));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const throws = f => { try { f(); return false; } catch (e) { return true; } };

const ctx = { console, Math, THREE }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['core/rand/08-core-rand.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js', 'kits/fauna/fauna-lands.js', 'kits/fauna/fauna-lands-host.js'])
  vm.runInContext(read(f), ctx, { filename: f });
const species = fs.readdirSync(KIT).filter(f => /^krator-fauna-.*\.js$/.test(f) && f !== 'krator-fauna-runtime.js').sort();
const body = ['fauna-core.js'].concat(species, ['krator-fauna-runtime.js']).map(f => fs.readFileSync(path.join(KIT, f), 'utf8')).join('\n');
vm.runInContext('var KratorFauna = (function () { const FA_TEX = null; const FA_MODELS = null;\n' + body + '\nreturn KratorFaunaAPI; })();', ctx, { filename: 'fauna-bundle' });
const KF = ctx.KratorFauna, FL = ctx.FAUNALANDS, KTAGS = ctx.KTAGS;
const CAT = FL.catalog(KF.list().map(e => KF.entry(e.key)));
const row = k => CAT.find(c => c.key === k);

// ---------------------------------------------------------------- the data module stays data
{ const src = fs.readFileSync(path.join(KIT, 'fauna-lands.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/THREE|document|window|getImageData|Math\.(sin|cos|random|pow)/.test(src), 'fauna-lands.js names no THREE, DOM, canvas, trig, pow or Math.random');
  const host = fs.readFileSync(path.join(KIT, 'fauna-lands-host.js'), 'utf8');
  ok(/scene\.add/.test(host), 'the negative: the drawing is the host file\'s (it adds to the scene)');
  const bundle = fs.readFileSync(path.join(KIT, 'fauna_bundle.py'), 'utf8');
  ok(/startswith\(PREFIX\)/.test(bundle) && !/^krator-fauna-/.test('fauna-lands.js'), 'the module is not a krator-fauna-*.js file, so the bundle is unchanged'); }

// ---------------------------------------------------------------- roles and groups
ok(CAT.length === KF.list().length && CAT.every(c => c.size.length === 3), 'catalog: a row for every animal (' + CAT.length + ')');
ok(FL.roleOf(row('threehorn')) === 'grazer' && FL.roleOf(row('riding-raptor')) === 'predator' && FL.roleOf(row('quetzalcoatlus')) === 'flyer',
  'roleOf: threehorn grazer, raptor predator, quetzalcoatlus flyer');
ok(FL.roleOf({ habitat: ['deep water'], locomotion: ['swims'] }) === 'water' && FL.roleOf({ habitat: ['ground', 'water'], locomotion: ['walks', 'swims'], diet: 'herbivore' }) === 'grazer',
  'roleOf: deep water swims; an animal of the ground that also swims is not water (the negative)');
ok(FL.roleOf({ habitat: ['ground'] }) === null && FL.roleOf(null) === null, 'roleOf: no diet and no water or air is no role');
const G = h => JSON.stringify(FL.groupOf({ herd: h }));
ok(G('troops of twenty') === '[10,20]' && G('small groups of six, a bull with his cows') === '[3,6]' && G('herds of 12') === '[6,12]', 'groupOf reads the herd\'s number');
ok(G('alone') === '[1,1]' && G('alone, or a pair') === '[1,2]' && G(null) === '[1,2]' && G('shoals') === '[1,3]', 'groupOf: alone, a pair, unknown, no number');

// ---------------------------------------------------------------- the pool by land
const sav = FL.pool(CAT, 'hyperjungle.savage'), pure = FL.pool(CAT, 'hyperjungle.pure');
const inRole = (P, r, k) => P.roles[r].some(p => p.key === k);
ok(inRole(sav, 'grazer', 'threehorn') && inRole(sav, 'grazer', 'hardshell') && inRole(sav, 'grazer', 'jungle-mammoth') && inRole(sav, 'predator', 'riding-raptor'),
  'savage: the Riders\' beasts are wild there (threehorn, hardshell, mammoth, raptor)');
ok(!inRole(pure, 'grazer', 'threehorn') && !inRole(pure, 'predator', 'riding-raptor'), 'the negative: the pure land leaves the ridden beasts out (tagged domestic)');
ok(inRole(pure, 'grazer', 'hyperjungle-strider') && inRole(pure, 'predator', 'vine-boa'), 'pure: the kit\'s own hyperjungle animals by their biome tag');
ok(!['grazer', 'predator', 'flyer', 'water'].some(r => pure.roles[r].some(p => !row(p.key).biomes.includes('hyperjungle') || row(p.key).domestic)),
  'pure: nothing untagged for the hyperjungle and nothing domestic');
ok(['longcrawler', 'wingclaw', 'nightwing'].every(k => sav.missing.includes(k)) && sav.missing.every(k => !KF.has(k)), 'savage: the plan\'s beasts the kit lacks are listed missing: ' + sav.missing.join(', '));
ok(!pure.missing.length, 'the negative: the pure land misses nothing');
ok(sav.roles.grazer.find(p => p.key === 'threehorn').w === 3 && sav.roles.grazer.find(p => p.key === 'hyperjungle-strider').w === 0.4, 'savage: the weights (threehorn 3, strider 0.4)');

// ---------------------------------------------------------------- the plan: hashed per cell
const base = { world: 4242, land: 'hyperjungle.savage', catalog: CAT, box: [0, 0, 4000, 4000], ground: (x, z) => 0.01 * x };
const p1 = FL.plan(base), p2 = FL.plan(Object.assign({}, base));
ok(p1.groups.length > 20 && p1.animals.length > p1.groups.length, 'a 4 km square holds ' + p1.groups.length + ' groups, ' + p1.animals.length + ' animals');
ok(JSON.stringify(p1) === JSON.stringify(p2), 'the same input, the same plan');
ok(JSON.stringify(FL.plan(Object.assign({}, base, { world: 4243 })).animals) !== JSON.stringify(p1.animals), 'the negative: another world, another plan');
{ const W = FL.plan(Object.assign({}, base, { box: [0, 0, 2000, 4000] })), E = FL.plan(Object.assign({}, base, { box: [2000, 0, 4000, 4000] }));
  const key = p => p.groups.map(g => g.gid + ':' + g.key + ':' + g.n + ':' + p.animals[g.animals[0]].at.join(',')).sort().join('|');
  const both = { groups: W.groups.concat(E.groups), animals: W.animals.concat(E.animals) };
  E.groups.forEach(g => { g.animals = g.animals.map(i => i + W.animals.length); });
  ok(key(both) === key(p1), 'two half boxes give the whole box\'s groups, at the same places (cell by cell, no draw order)');
  const odd = FL.plan(Object.assign({}, base, { box: [0, 0, 1000, 1000] }));
  ok(odd.groups.every(g => p1.groups.some(h => h.gid === g.gid && h.key === g.key)), 'a smaller box is a subset of the larger one'); }
ok(p1.animals.every(a => a.at[0] >= 0 - 200 && a.at[2] >= -200 && Math.abs(a.at[1] - (a.role === 'flyer' ? a.at[1] : 0.01 * a.at[0])) < 1e-9),
  'animals stand on the ground function (flyers above it)');
ok(p1.animals.filter(a => a.role === 'flyer').every(a => a.at[1] >= 0.01 * a.at[0] + 30 && a.at[1] <= 0.01 * a.at[0] + 120), 'flyers fly 30 to 120 m over the ground by default');
ok(!p1.groups.some(g => g.role === 'water'), 'the negative: without a where, no water groups (the host knows its water)');

// ---------------------------------------------------------------- the land's scale
const within = (a, lo, hi) => { const r = row(a.key).sizeRange || [1, 1]; return a.scale >= lo * r[0] - 1e-9 && a.scale <= hi * r[1] + 1e-9; };
ok(p1.animals.every(a => within(a, 1.2, 1.4)), 'savage: every scale is 1.2 to 1.4 times the animal\'s own range');
ok(p1.groups.every(g => g.scale >= 1.2 && g.scale <= 1.4) && new Set(p1.groups.map(g => g.scale.toFixed(3))).size > 5, 'savage: the group scales spread over 1.2 to 1.4');
{ const th = p1.animals.find(a => a.key === 'threehorn'), r = row('threehorn');
  ok(th && Math.abs(th.size[2] - r.size[2] * th.scale) < 1e-9 && th.size[2] > r.size[2], 'a savage threehorn\'s size is its box times its scale (' + (th ? th.size[2].toFixed(2) : '?') + ' m tall)'); }
const pp = FL.plan(Object.assign({}, base, { land: 'hyperjungle.pure' }));
ok(pp.animals.length && pp.animals.every(a => within(a, 1, 1)), 'the negative: the pure land\'s animals keep their own size');
ok(pp.animals.every(a => !['threehorn', 'hardshell', 'jungle-mammoth'].includes(a.key)), 'the pure land places none of the Riders\' beasts');
ok(p1.groups.every(g => g.n <= 10) && p1.groups.some(g => g.n > 1), 'groups are herds (some over one) and capped at the land\'s maxGroup (10)');

// ---------------------------------------------------------------- where and density
const water = FL.plan(Object.assign({}, base, { land: 'hyperjungle.pure', where: () => true }));
ok(water.groups.some(g => g.role === 'water') === pure.roles.water.length > 0, 'a where that allows water places the water role\'s animals (' + pure.roles.water.length + ' kinds)');
ok(!FL.plan(Object.assign({}, base, { where: () => false })).groups.length, 'the negative: a where that allows nothing places nothing');
{ const east = FL.plan(Object.assign({}, base, { where: (r, x) => x >= 2000 }));
  ok(east.animals.length && east.animals.every(a => a.at[0] >= 2000), 'where is asked at every animal (all east of 2 km)'); }
ok(FL.plan(Object.assign({}, base, { density: { grazer: 0, predator: 0, flyer: 0 } })).groups.length === 0, 'density 0 for every role: nothing');
ok(FL.plan(Object.assign({}, base, { density: { grazer: 2 } })).groups.filter(g => g.role === 'grazer').length > p1.groups.filter(g => g.role === 'grazer').length,
  'a higher density places more groups');

// ---------------------------------------------------------------- registered before drawn
const T = KTAGS.create({ build: 'test-lands' });
const pr = FL.register(T, FL.plan(base), { frag: 'kits/fauna/tests' });
const recs = T.query({ 'class': 'life' });
ok(recs.length === pr.groups.length + pr.animals.length, 'register: a record per group and per animal (' + recs.length + ')');
ok(pr.animals.every(a => { const r = T.get(a.id); return r && r.parent === pr.groups[a.group].id && r.kind === a.key && r['class'] === 'life'; }),
  'every animal is a life record, its species the kind, its group\'s herd record the parent');
ok(pr.groups.every(g => T.get(g.id).kind === 'herd' && T.get(g.id).tags.biome === 'hyperjungle'), 'every group is a herd record tagged with its biome');
{ const A = T.audit(); ok(A.unknown === 0, 'the registry reads zero unknown tags (' + A.unknown + ')'); }
ok(throws(() => FL.register(null, pr)) && throws(() => FL.plan(Object.assign({}, base, { land: 'hyperjungle.nowhere' }))),
  'the negative: no registry, or no such land, throws');
ok(throws(() => FL.land('x.y', { scale: [1.4, 1.2] })) && !FL.LANDS['x.y'], 'the negative: a land whose scale is not [lo, hi] is refused');
ok(FL.land('test.big', { biome: 'hyperjungle', scale: [2, 2] }).biome === 'hyperjungle' && FL.plan(Object.assign({}, base, { land: 'test.big', box: [0, 0, 1200, 1200] })).animals.every(a => within(a, 2, 2)),
  'a land added by a host scales its animals');

// ---------------------------------------------------------------- the draw: the bundle builds each, scaled, after its record
{ const scene = new THREE.Scene(), seen = [], small = FL.register(KTAGS.create({ build: 'test-draw' }), FL.plan(Object.assign({}, base, { box: [0, 0, 1200, 1200] })));
  const KF2 = { has: KF.has, animate: KF.animate, build: (k, o) => { seen.push(k); return KF.build(k, o); } };
  const errs = [], D = FL.draw(KF2, scene, small, { err: m => errs.push(m) });
  ok(D.list.length > 0 && D.list.length === small.animals.length && !errs.length, 'draw: every animal built (' + D.list.length + ')');
  ok(D.list.every(it => Math.abs(it.g.scale.x - it.a.scale) < 1e-6 && it.g.userData.krator === it.a.id && it.a.id), 'draw: scaled by the plan, tagged with its record\'s id');
  ok(D.list.every(it => it.g.position.x === it.a.at[0] && it.g.rotation.y === it.a.ry), 'draw: at its record\'s place and yaw');
  let threw = null; try { D.tick(1.5); } catch (e) { threw = e.message; }
  ok(!threw, 'tick animates every animal in its mode' + (threw ? ': ' + threw : ''));
  const none = FL.draw(null, scene, small);
  ok(none.list.length === 0, 'the negative: no bundle, nothing drawn'); }

console.log(fails ? fails + ' FAILED' : 'all passed');
process.exit(fails ? 1 : 0);
