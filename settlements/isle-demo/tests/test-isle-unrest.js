// node settlements/isle-demo/tests/test-isle-unrest.js [calm days] [famine days] — unrest on the isles (src/47u, core/simulation
// 77-sim-6-unrest.js; core/simulation/PLAN-MONEY.md M6) without a browser. Plans and declares both towns, Kautoa watched,
// Valapo not. First `calm days` (4) as they are: every town calm (its pool over 50), and ISLE.unrestChecks. Then a blight
// on Valapo (its food works held, its warehouses' food spoiled, the canoes carrying it no food: the households eat their stores down) for `famine days` (14): its people go
// hungry at the abstract level (core/simulation 77-sim-6-needs.js SIM.needsAbstract), its pool falls, it grumbles and
// demands food of the polity, and Kautoa ships what it holds over its keep. Each check with a negative. Build first.
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
const calm = +(process.argv[2] || 4), famine = +(process.argv[3] || 14);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const S = ISLE.simDeclare(plans);
ok('unrest declared with the towns', S.unrest && SIM.UNREST, JSON.stringify(S.unrest));
ISLE.simWatch('Kautoa');
const a = ISLE.unrestBooks(); ISLE.simRun(calm * 1440 + 1); const b = ISLE.unrestBooks();
ISLE.unrestChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
const calmAll = ['kautoa', 'valapo'].every(s => b.report.towns[s] && b.report.towns[s].stage.all === 'calm');
ok('as they are, both towns calm (their pools over ' + ISLE.TUNE.sim.unrest.stages.grumble + ')', calmAll, ['kautoa', 'valapo'].map(s => s + ' ' + Math.round(b.report.towns[s].level.all)).join(', '));
{ const B = cp(b); B.report.towns.valapo.stage.all = 'strike'; caught('Valapo at strike with its level ' + Math.round(b.report.towns.valapo.level.all), ISLE.unrestChecks(a, B), /the one its level gives/); }
{ const B = cp(b); delete B.report.towns.kautoa.level.all; caught('Kautoa with no level', ISLE.unrestChecks(a, B), /has a level and a stage/); }
/* the blight on Valapo */
const E = SIM.econ('valapo'), foods = SIM.ITEMS.foods, foodWorks = Object.keys(E.recipes).filter(id => (E.recipes[id].out || []).some(g => foods.indexOf(g) >= 0));
/* the blight spoils what the warehouses hold (booked used and spoiled, so the books hold) and holds the food works; a storm
   season keeps the canoes from carrying food to Valapo. The households eat their stores down and cannot restock, until
   the polity answers */
const spoil = () => { E.warehouses.forEach(W => foods.forEach(f => { const n = W.stock[f] || 0; if (!n) return;
  SIM.withEcon('valapo', () => SIM.economyBook('used', f, n)); E.spoiled = E.spoiled || {}; E.spoiled[f] = (E.spoiled[f] || 0) + n; W.stock[f] = 0; })); };
foodWorks.forEach(id => SIM.recipeHold(id, 'blight')); spoil();
Object.keys(SIM.TRADE ? SIM.TRADE.routes : {}).forEach(id => { const R = SIM.TRADE.routes[id], G = R.goods || {};
  R.stops.forEach(st => { if (st.settlement === 'valapo') return; const all = G[st.settlement] || Object.keys(SIM.econ(st.settlement).goods); G[st.settlement] = all.filter(g => foods.indexOf(g) < 0); }); R.goods = G; });
const k0 = ISLE.unrestBooks(), kExp0 = cp(SIM.econ('kautoa').exported);
for (let d = 0; d < famine; d++) ISLE.simRun(1440);
const k1 = ISLE.unrestBooks(), V = k1.report.towns.valapo, ev = k1.report.events.filter(e => e.settlement === 'valapo' && e.m > k0.minute);
ISLE.unrestChecks(k0, k1).forEach(c => ok('blight: ' + c.name, c.ok, c.detail));
const stages = ev.filter(e => e.kind === 'stage' && e.key === 'all').map(e => e.to), D = V.demands.filter(x => x.kind === 'goods');
ok('blighted, Valapo grows restless and demands food of the polity (' + stages.join(' > ') + '; level ' + Math.round(V.level.all) + '; ' + D.length + ' demands for ' + [...new Set(D.flatMap(x => x.goods))].join(', ') + ')',
  stages.indexOf('demand') >= 0 && D.length > 0 && D.every(x => x.goods.every(g => foods.indexOf(g) >= 0)), JSON.stringify(V.stage));
const G = D.filter(x => x.answer === 'granted'), sent = {}; D.forEach(x => Object.keys(x.sent || {}).forEach(k => { sent[k] = (sent[k] || 0) + x.sent[k]; }));
ok('the polity answers: food shipped from the towns and villages with spare, each demand for days of the town\'s normal use, however long the famine (' + JSON.stringify(sent) + '; ' + D.map(x => x.answer + ' ' + x.came + ' of ' + x.asked).join(', ') + ')', G.length > 0 && Object.keys(sent).length > 0 && D.every(x => x.asked >= 1000), D.map(x => x.answer).join(', '));
const dOf = k => { const e = ev.find(x => x.kind === 'stage' && x.key === 'all' && x.to === k); return e ? e.m / 1440 : null; }, gD = dOf('grumble'), tD = dOf('treason');
ok('treason comes about a week into the hunger, not in days (grumbling on day ' + gD + ', treason on day ' + tD + ')', gD != null && (tD == null || tD - gD >= 5), tD + ' - ' + gD);
ok('Kautoa stays calm (' + Math.round(k1.report.towns.kautoa.level.all) + ')', k1.report.towns.kautoa.stage.all === 'calm', k1.report.towns.kautoa.stage.all);
{ const B = cp(k1); const x = B.report.towns.valapo.demands[0]; if (x) { x.answer = null; x.m = k0.minute; } caught('a demand left unanswered for days', ISLE.unrestChecks(k0, B), /answered within a day/); }
console.log('--- events: ' + ev.map(e => (e.m / 1440).toFixed(1) + ' ' + e.kind + ' ' + e.key + (e.to ? ' ' + e.to : '') + (e.answer ? ' ' + e.answer : '') + (e.goods ? ' ' + e.goods.join('+') : '')).join('; ').slice(0, 1500));
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
