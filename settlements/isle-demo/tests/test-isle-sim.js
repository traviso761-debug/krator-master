// node settlements/isle-demo/tests/test-isle-sim.js — the isle host on core/simulation (P7b) without a browser.
// Runs the city page's [G data] half (dist/isle-city.plan.js), plans Valapo, declares it on core/simulation (src/40-45) and
// runs a world day minute by minute, then checks what verify.py --assert checks (src/45-isle-sim-checks.js): every lot of
// a census trade a place, every resident a home and every worker a job in the town, the food made, hauled and eaten
// with nothing short; each check with a negative. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const town = process.argv[2] || 'Valapo', minutes = +(process.argv[3] || 1440);
const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
const R = ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null });
let t0 = Date.now();
const S = ISLE.simDeclare([{ R, G }]), X = S.towns[ISLE.TUNE.sim.towns[town].id];
console.log('--- ' + town + ' declared in ' + (Date.now() - t0) + ' ms: ' + X.places.places.length + ' places (' + X.places.homes + ' homes, ' + X.places.beds + ' beds, ' + X.places.posts + ' posts), nav ' + JSON.stringify(S.nav) + ' ' + JSON.stringify(X.nav));
console.log('    people ' + JSON.stringify({ actors: X.pop.actors, workers: X.pop.workers, homeless: X.pop.homeless, bedsLeft: X.pop.bedsLeft, posts: X.pop.posts }));
console.log('    households ' + JSON.stringify(X.items) + '; economy ' + JSON.stringify(X.econ));
if (S.problems.length) console.log('    problems: ' + S.problems.slice(0, 5).join(' | '));
ISLE.simChecks(R).forEach(c => ok(c.name, c.ok, c.detail));
t0 = Date.now();
ISLE.simRun(minutes, m => { if (m % (+process.env.EVERY || 360) === 0) { const B = ISLE.simBooks(X.id); console.log('    ' + (m / 60) + ' h: ' + Object.keys(B.foods).map(f => f + ' ' + B.foods[f].made + '/' + B.foods[f].hauled + '/' + B.foods[f].used + '/' + B.foods[f].stock).join(', ') + ' carts ' + JSON.stringify(B.carts) + ' meals ' + JSON.stringify(B.meals) + ' (' + (Date.now() - t0) + ' ms)'); } });
console.log('--- a day run in ' + (Date.now() - t0) + ' ms; route failures ' + SIM.routeFail.length);
const books = ISLE.simBooks(X.id);
ISLE.simFoodChecks(R, books).forEach(c => ok(c.name, c.ok, c.detail));
/* the negatives: each check fed what should fail it */
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
{ const places = SIM.all('place').filter(P => P.settlement === X.id), L = R.lots.find(l => ISLE.tradeOf(l.key));
  caught('a census trade\'s lot that is no place', ISLE.simChecks(R, { places: places.filter(P => P.tags.lot !== L.id) }), /census trade/); }
{ const A = SIM.all('actor').filter(a => !a.driven && SIM.R.role[a.role].settlement === X.id).map(a => Object.assign({}, a)); A[0].home = 'kautoa.0';
  caught('a resident housed outside the town', ISLE.simChecks(R, { actors: A }), /resident/); }
{ const A = SIM.all('actor').filter(a => !a.driven && SIM.R.role[a.role].settlement === X.id).map(a => Object.assign({}, a)), w = A.find(a => a.work); w.work = undefined;
  caught('a worker without a job', ISLE.simChecks(R, { actors: A }), /worker/); }
{ const B = JSON.parse(JSON.stringify(books)); B.foods.fish.hauled = 0; caught('a food never hauled', ISLE.simFoodChecks(R, B), /made and hauled/); }
{ const B = JSON.parse(JSON.stringify(books)); B.foods['sweet-potato'].outOf = 12; caught('a purchase out of stock', ISLE.simFoodChecks(R, B), /nothing short/); }
{ const B = JSON.parse(JSON.stringify(books)); Object.keys(B.foods).forEach(f => { B.foods[f].made = Math.floor(B.foods[f].made / 2); }); caught('too little made', ISLE.simFoodChecks(R, B), /covers/); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
