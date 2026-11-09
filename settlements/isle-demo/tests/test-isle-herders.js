// node settlements/isle-demo/tests/test-isle-herders.js [days] — the herding bands (src/47n; the owner, 2026-11-09: "semi
// nomadic herding camps") without a browser. Plans and declares both towns, gives each a band on stand-in pasture (a range
// 15 km east of the town's frame, its grass at 0.8 everywhere: the open world's survey finds the real ranges,
// openworld/isle-demo 48n), runs `days` (default 20) with Kautoa watched and checks ISLE.herdChecks: each band in its camp
// beside its herd, fed, grazing its range, its meat in its town, its camp moving with its herd; each with a negative.
// Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
['10-camp-cultures.js', '40-camp-work.js'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(HERE, '..', '..', 'core', 'camp', f), 'utf8'), { filename: f }));   /* the work camp */
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
ISLE.initWorld();
const days = +(process.argv[2] || 20);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const frame = town => plans[ISLE.TOWNS.indexOf(town)].G.frame;
ISLE.simDeclare(plans);
const bands = ISLE.TOWNS.map(t => ({ id: t.toLowerCase() + '.herders', town: t, name: 'Test band of ' + t, yard: { x: frame(t).x + 15000, z: frame(t).z }, pasture: () => 0.8, h: () => 0 }));
const H = ISLE.simHerders(bands);
ok('the bands declared with no errors', !H.errors.length && H.bands.length === 2, H.errors.join('; ') || H.bands.map(x => x.id + ': ' + x.people + ' people, ' + x.stands + ' pasture cells').join('; '));
ISLE.simWatch('Kautoa');
const a = ISLE.herdBooks(), t0 = Date.now(); ISLE.simRun(days * 1440 + 1); const b = ISLE.herdBooks();
console.log('ran ' + days + ' days in ' + Math.round((Date.now() - t0) / 1000) + ' s');
ISLE.herdChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
ok('over ' + days + ' days every band grazed a cell down and moved its camp at least once', b.bands.every(x => x.moves >= 1 && x.moved >= 1), b.bands.map(x => x.id + ' ' + x.moves + ' moves').join('; '));
/* THE NEGATIVES */
{ const B = cp(b); B.bands[0].here -= 3; caught('three herders missing from the camp', ISLE.herdChecks(a, B), /its herding band/); }
{ const B = cp(b); B.bands[0].meals.none = 6; caught('a band going hungry', ISLE.herdChecks(a, B), /every band fed/); }
{ const B = cp(b); B.bands[0].made.meat = 0; caught('a herd that made no meat', ISLE.herdChecks(a, B), /grazes its range/); }
{ const B = cp(b); B.bands[0].landed.meat = 0; caught('meat that never reached the town', ISLE.herdChecks(a, B), /reached its town/); }
{ const B = cp(b); B.bands.forEach(x => { x.campAt = [x.campAt[0] + 5000, x.campAt[1]]; }); caught('a camp left behind when its herd moved', ISLE.herdChecks(a, B), /moved its whole camp/); }
console.log(bad ? 'FAILED ' + bad : 'ALL PASS');
process.exit(bad ? 1 : 0);
