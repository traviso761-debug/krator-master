// node settlements/isle-demo/tests/test-isle-build.js [days] — building and upkeep on the isles (src/47b, core/simulation
// 77-sim-6-build.js; PLAN-POLITICS.md section 4) without a browser. Plans and declares both towns (the plan leaves its
// empty lots), runs `days` (12) with Kautoa watched, and checks ISLE.buildChecks: the lots, no project ahead of its
// bill, every built lot a home and marked built, the upkeep drawn as the homes wear, the books. Each with a negative.
// Then Kautoa's stone taken away and its quarry held twenty days: the upkeep owed, a share of the houses worn. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
ISLE.initWorld();
const days = +(process.argv[2] || 12);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const vac = plans.map(p => p.R.town + ' ' + p.R.lots.filter(L => L.vacant).length).join(', ');
const S = ISLE.simDeclare(plans);
ok('the empty lots handed to the sim (' + vac + '; ' + JSON.stringify(S.build) + ')', S.build && S.build.lots > 0, JSON.stringify(S.build));
const nb = SIM.all('actor').filter(a => /\.builder$/.test(a.role)).length;
ok('a builder a lot (' + nb + ' builders)', nb === S.build.lots * ISLE.TUNE.sim.build.posts, nb + ' for ' + S.build.lots);
ISLE.simWatch('Kautoa');
const a = ISLE.buildBooks(); ISLE.simRun(days * 1440 + 1); const b = ISLE.buildBooks();
ISLE.buildChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
const built = b.lots.filter(x => x.built).length;
ok('houses go up (' + built + ' built in ' + days + ' days; ' + b.report.events.filter(e => e.kind === 'built').map(e => (e.m / 1440).toFixed(1) + ' ' + e.lot + ' in ' + e.days + ' days by ' + e.hands).slice(0, 6).join(', ') + ')', built > 0, built);
{ const B = cp(b), x = B.lots.find(l => l.kind === 'lot'); x.kind = 'warehouse'; caught('an empty lot turned warehouse', ISLE.buildChecks(a, B), /every empty lot/); }
{ const B = cp(b), P = Object.values(B.report.towns)[0].projects[0]; P.done = P.hours; P.got = {}; Object.keys(P.bill).forEach(g => { P.got[g] = 0; }); caught('a house finished with nothing delivered', ISLE.buildChecks(a, B), /ahead of the bill/); }
{ const B = cp(b), s = Object.keys(B.report.towns)[0], g = Object.keys(B.report.towns[s].upkeep.taken)[0]; B.report.towns[s].upkeep.taken[g] += 500; caught('500 more drawn than the homes wear', ISLE.buildChecks(a, B), /upkeep drawn/); }
/* the stone taken away: the upkeep owed and a share of the houses worn */
const E = SIM.econ('kautoa'), was = E.warehouses.map(W => W.stock.stone || 0);
E.warehouses.forEach(W => { const n = W.stock.stone || 0; if (n) { SIM.withEcon('kautoa', () => SIM.economyBook('used', 'stone', n)); E.spoiled = E.spoiled || {}; E.spoiled.stone = (E.spoiled.stone || 0) + n; W.stock.stone = 0; } });
const holdQ = Object.keys(E.recipes).filter(id => (E.recipes[id].out || []).indexOf('stone') >= 0); holdQ.forEach(id => SIM.recipeHold(id, 'test: no stone'));
ISLE.simWatch('Valapo'); ISLE.simRun(20 * 1440);   /* Kautoa unwatched: the abstract level's upkeep */
const R2 = SIM.buildReport('kautoa').towns.kautoa, homes = SIM.all('place').filter(P => P.settlement === 'kautoa' && ISLE.buildKind(P)), worn = homes.filter(P => SIM.buildWorn(P.id) > 0).length;
ok('the stone out twenty days: the upkeep owed and a share of Kautoa\'s houses shows it (' + R2.upkeep.owed.stone + ' stone owed, neglect ' + R2.upkeep.neglect.toFixed(2) + ', ' + worn + ' of ' + homes.length + ' houses worn)',
  R2.upkeep.owed.stone > 0 && worn > 0 && worn < homes.length, worn);
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
