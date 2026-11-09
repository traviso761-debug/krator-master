// node settlements/isle-demo/tests/test-isle-expeditions.js [days] — the expedition camps by boat (PLAN.md section 12;
// src/47x) without a browser. Plans and declares both towns, gives the sim a stand-in shore hook (an island shore 25 km
// by sea east of each town's frame, its forest full: the open world's hook finds the real shores, openworld/isle-demo
// 48x), sets the test's fast season (30 days), runs `days` (default 40) with Kautoa watched and checks ISLE.expChecks:
// each town's crew sailed and pitched, made mahogany with gum and kapok from its stands, the goods landed at the town
// and booked imported, the camp fed by the boat, the canoe sheds' canoes built of them, the crew home after the season;
// each with a negative (the towns' own checks: tests/test-isle-week.js). Build first (python3 build.py).
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
const days = +(process.argv[2] || 40), T = ISLE.TUNE.sim, X = T.expeditions;
X.days = 30;   /* the test's season (the real one is 90 days) */
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const frame = town => plans[ISLE.TOWNS.indexOf(town)].G.frame;
/* THE PAGE'S STAND-IN HOOK: an island shore 25 km east of the town's frame, the camp 150 m inland, the forest full */
const pitched = [], struck = [];
ISLE.hooks.expeditionShore = (townName, n) => { const F0 = frame(townName), sh = { x: F0.x + 25000, z: F0.z + 2000 * n, ux: -1, uz: 0 };
  return { x: sh.x + 150, z: sh.z, shore: sh, seaKm: 25, forest: () => 0.9, h: () => 0, name: 'the test isle' }; };
ISLE.hooks.expeditionPitched = C => pitched.push(C.id); ISLE.hooks.expeditionStruck = C => struck.push(C.id);
ISLE.simDeclare(plans);
ok('the expeditions declared (ISLE.simExpeditions: the state and the hourly step), the goods in the towns\' economies', ISLE.SIM.exp && SIM.stepHooks.indexOf(ISLE.expStep) >= 0 && ISLE.SIM.order.every(s => SIM.econ(s).goods.mahogany && SIM.econ(s).goods.canoes), JSON.stringify(X));
ISLE.simWatch('Kautoa');
const a = ISLE.expBooks(), t0 = Date.now(); ISLE.simRun(days * 1440 + 1); const b = ISLE.expBooks();
console.log('ran ' + days + ' days in ' + Math.round((Date.now() - t0) / 1000) + ' s; log ' + JSON.stringify(b.log.slice(0, 4)) + '; pitched ' + pitched.join(',') + '; struck ' + struck.join(','));
const checks = ISLE.expChecks(a, b); checks.forEach(c => ok(c.name, c.ok, c.detail));
ok('both towns\' crews sailed on day ' + X.firstDay + ' and came home after the season; the page was told of each pitch and strike', b.camps.length === 2 && b.camps.every(C => C.struck) && pitched.length === 2 && struck.length === 2,
  b.camps.map(C => C.id + ' sailed day ' + Math.round(C.sailed / 1440) + (C.struck ? ', struck day ' + Math.round(C.struck / 1440) : '')).join('; '));
/* THE NEGATIVES */
{ const B = cp(b); B.camps.forEach(C => { C.here = C.people - 2; C.struck = null; }); caught('two hands nobody can find', ISLE.expChecks(a, B), /sent a crew/); }
{ const B = cp(b); B.camps.forEach(C => { C.made.gum = 0; }); caught('a camp that tapped no gum', ISLE.expChecks(a, B), /made the island/); }
{ const B = cp(b); B.camps.forEach(C => { C.landed.mahogany = 0; }); caught('mahogany that never landed', ISLE.expChecks(a, B), /landed at the town/); }
{ const B = cp(b); B.camps.forEach(C => { C.meals.none = 9; }); caught('a camp going hungry', ISLE.expChecks(a, B), /fed by the town/); }
{ const B = cp(b); Object.keys(B.towns).forEach(s => { B.towns[s].canoes = 0; }); caught('a canoe shed that built no canoe', ISLE.expChecks(a, B), /canoe sheds build canoes/); }
{ const B = cp(b); B.camps.forEach(C => { C.home = C.people - 1; }); caught('a hand that never came home', ISLE.expChecks(a, B), /came home/); }
console.log(bad ? 'FAILED ' + bad : 'ALL PASS');
process.exit(bad ? 1 : 0);
