// node settlements/isle-demo/tests/test-isle-week.js [days] — the isle demo's week test (P7d, PLAN.md section 7) without a
// browser. Plans both towns, declares them (src/40-48), runs a week with Valapo watched (Kautoa abstract), then a week with
// Kautoa watched (Valapo abstract), and checks src/48-isle-week.js ISLE.weekChecks: each town's books balance over each week
// at either level, every load shipped landed or at sea, the loads to the abstract town landed and booked there, each
// town's food a worker a day abstract within a band of the same town watched, nobody in the abstract town decided. Each
// check with a negative. Prints the wall time of each week. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const days = +(process.argv[2] || 7);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
ISLE.simDeclare(plans);
const w1 = ISLE.simWeek('Valapo', days * 1440);
console.log('--- ' + days + ' days with Valapo watched (Kautoa abstract): ' + w1.ms + ' ms');
const w2 = ISLE.simWeek('Kautoa', days * 1440);
console.log('--- ' + days + ' days with Kautoa watched (Valapo abstract): ' + w2.ms + ' ms');
ISLE.weekChecks(w1, w2).forEach(c => ok(c.name, c.ok, c.detail));
const cp = w => JSON.parse(JSON.stringify(w));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
{ const a = cp(w1); a.b.towns.valapo.goods.fish.total += 50; caught('50 fish from nowhere', ISLE.weekChecks(a, w2), /balance/); }
{ const a = cp(w1), R = a.b.routes.lakatoi, k = Object.keys(R.landed)[0], g = Object.keys(R.landed[k])[0]; R.landed[k][g] -= 10; caught('10 units lost at sea', ISLE.weekChecks(a, w2), /landed or is at sea/); }
{ const a = cp(w1), s = a.abstract, g = Object.keys(a.b.towns[s].goods).find(g => a.b.towns[s].goods[g].imported > a.a.towns[s].goods[g].imported); a.b.towns[s].goods[g].imported -= 5; caught('an import landed but not booked in the abstract town', ISLE.weekChecks(a, w2), /booked there/); }
{ const a = cp(w1); a.b.towns.kautoa.food = a.a.towns.kautoa.food; caught('an abstract town that made no food', ISLE.weekChecks(a, w2), /a worker a day/); }
{ const a = cp(w1); a.decided = 3; caught('three of the abstract town deciding', ISLE.weekChecks(a, w2), /decided/); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
