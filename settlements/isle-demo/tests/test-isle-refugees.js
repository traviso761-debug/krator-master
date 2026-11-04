// node settlements/isle-demo/tests/test-isle-refugees.js [days] — refugees on the isles (src/47r, 33's camp ground; core/
// simulation 77-sim-6-build.js's growth) without a browser. Plans and declares both towns, runs `days` (60) with Valapo
// watched: a ship a week lands its people at the camps, fed at the ration line, the camps' households moved into finished
// houses before the towns' own, and building answers them. ISLE.refugeeChecks, each with a negative; the camps reported.
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
const days = +(process.argv[2] || 60);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
ok('each town\'s plan has its camp\'s ground, tagged (' + plans.map(p => p.R.town + ' ' + (p.R.camp ? Math.round(p.R.camp.x) + ',' + Math.round(p.R.camp.z) : 'none')).join('; ') + ')', plans.every(p => p.R.camp && p.R.camp.tag), '');
const S = ISLE.simDeclare(plans);
ok('the camps declared (' + JSON.stringify(S.refugees) + ')', S.refugees && S.refugees.camps === 2, JSON.stringify(S.refugees));
ISLE.simWatch('Valapo');
const a = ISLE.refugeeBooks(); ISLE.simRun(days * 1440 + 1); const b = ISLE.refugeeBooks();
ISLE.refugeeChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
const housed = Object.keys(b.housed).reduce((n, s) => n + b.housed[s], 0), BR = SIM.buildReport();
ok('the camps\' households moved into finished houses first (' + housed + ' housed; ' + ISLE.SIM.order.map(s => s + ' ' + BR.towns[s].built + ' built, ' + BR.towns[s].settled + ' settled, ' + BR.towns[s].waiting + ' waiting').join('; ') + ')',
  housed > 0 && housed % ISLE.TUNE.sim.refugees.per === 0, housed);
{ const B = cp(b); B.ships[0].people += 5; caught('five landed that nobody counted', ISLE.refugeeChecks(a, B), /every ship/); }
{ const B = cp(b), s = Object.keys(B.camps)[0]; B.camps[s].people += 3; caught('a camp counting three it does not have', ISLE.refugeeChecks(a, B), /count is its people/); }
{ const B = cp(b), s = Object.keys(B.camps)[0]; B.camps[s].hunger = { median: 95, p90: 99, n: 30 }; caught('a starving camp', ISLE.refugeeChecks(a, B), /fed at their ration/); }
{ const x = SIM.all('actor').find(q => q.refugee), was = x.home; x.home = SIM.all('place').find(P => P.settlement !== SIM.settlementOf(x) && P.kind === 'home').id; caught('a refugee housed in the other town', ISLE.refugeeChecks(a, b), /in its town/); x.home = was; }
{ const ie = SIM.NEED.idx.eat; ISLE.SIM.order.forEach(s => { const L = ISLE.refugeesAt(s).map(q => { SIM.needsOf(q, SIM.minute()); return q; }), H = L.map(q => q.nd[ie]).sort((x, y) => x - y), qn = f => H.length ? Math.round(H[Math.min(H.length - 1, Math.floor(f * H.length))]) : '-';
  console.log('--- ' + s + ' camp hunger: median ' + qn(0.5) + ', 90% ' + qn(0.9) + ', max ' + qn(1) + '; at ' + JSON.stringify(L.slice(0, 40).reduce((o, q) => (o[(q.activity || '-') + '@' + (q.place === q.home ? 'camp' : q.place ? 'away' : '-')] = (o[(q.activity || '-') + '@' + (q.place === q.home ? 'camp' : q.place ? 'away' : '-')] || 0) + 1, o), {}))); }); }
const U = SIM.unrestReport ? SIM.unrestReport() : null;
console.log('--- unrest by class: ' + (U ? Object.keys(U.towns).filter(s => ISLE.SIM.order.indexOf(s) >= 0).map(s => s + ' ' + Object.keys(U.towns[s].level).map(k => k + ' ' + Math.round(U.towns[s].level[k]) + ' ' + U.towns[s].stage[k]).join(', ')).join('; ') : '-'));
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
