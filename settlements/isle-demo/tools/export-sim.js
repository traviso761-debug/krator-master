// node settlements/isle-demo/tools/export-sim.js [out] [days] — the isle demo's `sim` export for Godot (P8: "Godot reads
// the books after a replayed week", PLAN.md sections 7 and 9). Runs the city page's [G data] half (dist/isle-city.plan.js),
// plans and declares both towns, takes the books at the start, runs a week with Valapo watched and Kautoa abstract
// (ISLE.simWeek, the week test's first week) and writes to `out` (default godot/data/isle):
//   sim.json     the krator-sim export at the week's end (src/50 ISLE.simExport: core/simulation's records and the
//                isles' settlements, routes and buyers)
//   golden.json  the books at the start (each town's goods, the routes), the week (minutes, levels), and the page's own
//                answers: src/50's checks and each town's books over the week (the balance residual by good), which
//                godot/tests/isle/isle_books_test.gd derives again from the data and must agree with
// Deterministic: the same build writes the same files. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), ROOT = path.join(HERE, '..', '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'godot', 'data', 'isle')), DAYS = +(process.argv[3] || 7);
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
ISLE.initWorld();
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
ISLE.simDeclare(plans);
const books = d => ({ clock: d.clock, settlements: d.settlements.map(T => ({ id: T.id, level: T.level, goods: T.goods })), routes: d.routes });
const start = books(ISLE.simExport());
const t0 = Date.now(), W = ISLE.simWeek('Valapo', DAYS * 1440);
const end = ISLE.simExport();
const B0 = {}; start.settlements.forEach(T => { B0[T.id] = T.goods; });
const balance = {};
end.settlements.forEach(T => { const o = balance[T.id] = {};
  Object.keys(T.goods).forEach(g => { const b = T.goods[g], a = B0[T.id][g] || {}, d = k => (b[k] || 0) - (a[k] || 0);
    o[g] = +(d('total') - (d('made') + d('imported') - d('exported') - (d('used') - d('bought') + d('eaten')))).toFixed(6); }); });
const golden = { format: 'krator-sim-golden', build: 'isle-demo', week: { minutes: DAYS * 1440, from: start.clock.minute, to: end.clock.minute, watched: W.watched, abstract: W.abstract, decided: W.decided, moved: W.moved },
  start, page: { checks: ISLE.simExportChecks(end).map(c => ({ name: c.name, ok: c.ok })), balance,
    counts: { places: end.places.length, actors: end.actors.length, people: end.settlements.map(T => [T.id, T.people]), routes: end.routes.length } } };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'sim.json'), JSON.stringify(end));
fs.writeFileSync(path.join(OUT, 'golden.json'), JSON.stringify(golden, null, 1));
const off = Object.keys(balance).reduce((n, s) => n + Object.values(balance[s]).filter(r => Math.abs(r) > 1).length, 0);
console.log('ran ' + DAYS + ' days (Valapo watched, Kautoa abstract) in ' + (Date.now() - t0) + ' ms; wrote ' + path.relative(ROOT, OUT).split(path.sep).join('/') + '/sim.json (' +
  (fs.statSync(path.join(OUT, 'sim.json')).size / 1024 | 0) + ' KB) and golden.json; checks ' + golden.page.checks.filter(c => c.ok).length + '/' + golden.page.checks.length + ', goods off balance ' + off);
