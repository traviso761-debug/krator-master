// node settlements/isle-demo/tests/test-isle-sim.js [minutes] — the isle host on core/simulation (P7b) without a browser.
// Runs the city page's [G data] half (dist/isle-city.plan.js), plans both towns, declares them on core/simulation
// (src/40-45: one walking layer, a settlement and an economy each) and runs a world day minute by minute (or `minutes`),
// then checks for each town what verify.py --assert checks (src/45-isle-sim-checks.js): every lot of a census trade a
// place, every resident a home and every worker a job in the town, the stocks map finding every place from its lot, the
// food made, hauled and eaten with nothing short; each check with a negative. EVERY=360 prints the books every 6 hours.
// Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const minutes = +(process.argv[2] || 1440), every = +(process.env.EVERY || 1440);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
let t0 = Date.now();
const S = ISLE.simDeclare(plans);
console.log('--- declared in ' + (Date.now() - t0) + ' ms; nav ' + JSON.stringify(S.nav) + (S.problems.length ? '; problems: ' + S.problems.slice(0, 5).join(' | ') : ''));
const towns = plans.map(p => ({ R: p.R, X: S.towns[ISLE.TUNE.sim.towns[p.R.town].id] }));
towns.forEach(({ R, X }) => {
  console.log('--- ' + R.town + ': ' + X.places.places.length + ' places (' + X.places.homes + ' homes, ' + X.places.beds + ' beds, ' + X.places.posts + ' posts), nav ' + JSON.stringify(X.nav) +
    (Object.keys(X.places.unmapped).length ? ', UNMAPPED ' + JSON.stringify(X.places.unmapped) : ''));
  console.log('    people ' + JSON.stringify({ actors: X.pop.actors, workers: X.pop.workers, homeless: X.pop.homeless, bedsLeft: X.pop.bedsLeft, posts: X.pop.posts }));
  console.log('    households ' + JSON.stringify(X.items) + '; economy ' + JSON.stringify(X.econ));
  ISLE.simChecks(R).forEach(c => ok(c.name, c.ok, c.detail));
});
const line = (X) => { const B = ISLE.simBooks(X.id); return X.id + ': ' + Object.keys(B.foods).map(f => f + ' ' + B.foods[f].made + '/' + B.foods[f].hauled + '/' + B.foods[f].used + '/' + B.foods[f].stock).join(', ') + ' carts ' + JSON.stringify(B.carts); };
t0 = Date.now();
ISLE.simRun(minutes, m => { if (m % every === 0) { console.log('    ' + (m / 60) + ' h (' + (Date.now() - t0) + ' ms), made/hauled/used/stock'); towns.forEach(({ X }) => console.log('      ' + line(X))); } });
console.log('--- ' + minutes + ' minutes run in ' + (Date.now() - t0) + ' ms; route failures ' + SIM.routeFail.length);
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
towns.forEach(({ R, X }) => {
  const books = ISLE.simBooks(X.id);
  ISLE.simFoodChecks(R, books).forEach(c => ok(c.name, c.ok, c.detail));
  /* the negatives: each check fed what should fail it */
  const own = () => SIM.all('place').filter(P => P.settlement === X.id), res = () => SIM.all('actor').filter(a => !a.driven && SIM.R.role[a.role].settlement === X.id).map(a => Object.assign({}, a));
  { const L = R.lots.find(l => ISLE.tradeOf(l.key)); caught(R.town + ': a census trade\'s lot that is no place', ISLE.simChecks(R, { places: own().filter(P => P.tags.lot !== L.id) }), /census trade/); }
  { const A = res(); A[0].home = X.id === 'valapo' ? 'kautoa.0' : 'valapo.0'; caught(R.town + ': a resident housed outside the town', ISLE.simChecks(R, { actors: A }), /resident/); }
  { const A = res(), w = A.find(a => a.work); w.work = undefined; caught(R.town + ': a worker without a job', ISLE.simChecks(R, { actors: A }), /worker/); }
  { const P = own().filter(q => q.tags.lot).map(q => Object.assign({}, q, { tags: Object.assign({}, q.tags) })); P[0].tags.lot = 'nowhere'; caught(R.town + ': a place the stocks map cannot find', ISLE.simChecks(R, { places: P }), /stocks map/); }
  const f0 = Object.keys(books.foods)[0];
  { const B = JSON.parse(JSON.stringify(books)); B.foods[f0].hauled = 0; caught(R.town + ': a food never hauled', ISLE.simFoodChecks(R, B), /made and hauled/); }
  { const B = JSON.parse(JSON.stringify(books)); B.foods[f0].outOf = 12; caught(R.town + ': a purchase out of stock', ISLE.simFoodChecks(R, B), /nothing short/); }
  { const B = JSON.parse(JSON.stringify(books)); Object.keys(B.foods).forEach(f => { B.foods[f].made = Math.floor(B.foods[f].made / 2); }); caught(R.town + ': too little made', ISLE.simFoodChecks(R, B), /covers/); }
});
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
