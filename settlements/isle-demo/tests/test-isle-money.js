// node settlements/isle-demo/tests/test-isle-money.js [days] — money's accounts on the isles (src/47m, core/simulation
// 77-sim-6-money.js; core/simulation/PLAN-MONEY.md M0) without a browser. Plans and declares both towns (their accounts
// are opened with them), runs `days` (1) with Kautoa watched, and checks ISLE.moneyChecks: every household, workplace,
// treasury and guild has its account in its nation's currency (Kautoan shells), every workplace owned by its town's
// treasury, nobody below zero, each settlement's money balanced to its books. Each with a negative. Then a payment
// across the towns and an exchange into Talents, the books still balanced. Build first (python3 build.py).
const fs = require('fs'), path = require('path'), vm = require('vm');
const HERE = path.join(__dirname, '..'), PLAN = path.join(HERE, 'dist', 'isle-city.plan.js');
if (!fs.existsSync(PLAN) || fs.readFileSync(PLAN, 'utf8').startsWith('version https://git-lfs')) { console.log('FAIL  dist/isle-city.plan.js is missing (python3 build.py)'); process.exit(1); }
global.window = global;
vm.runInThisContext(fs.readFileSync(PLAN, 'utf8'), { filename: 'isle-city.plan.js' });
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
ISLE.initWorld();
const days = +(process.argv[2] || 1);
const plans = ISLE.TOWNS.map(town => { const S0 = SITE_INIT.towns[town], G = ISLE.siteGround(S0, ISLE.PROG[town]);
  return { G, R: ISLE.city(town, { site: S0, ground: G, tags: KTAGS.create({ build: 'isle-demo:' + town }), dims: k => ISLE_DIMS[k] || null, vdims: k => ISLE_VDIMS[k] || null }) }; });
const S = ISLE.simDeclare(plans);
ok('money declared with the towns', S.money && S.money.accounts > 0, JSON.stringify(S.money).slice(0, 300));
ISLE.simWatch('Kautoa');
const a = ISLE.moneyBooks(); ISLE.simRun(days * 1440); const b = ISLE.moneyBooks();
ISLE.moneyChecks(a, b).forEach(c => ok(c.name, c.ok, c.detail));
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
{ const B = cp(b), id = Object.keys(B.ledger.money.accounts).find(k => k.startsWith('hh:kautoa')); delete B.ledger.money.accounts[id]; caught('a household with no account', ISLE.moneyChecks(a, B), /has its account/); }
{ const B = cp(b), id = Object.keys(B.ledger.money.accounts).find(k => k.startsWith('hh:valapo')); B.ledger.money.accounts[id] = -5; caught('a household five shells in debt', ISLE.moneyChecks(a, B), /less than nothing/); }
{ const B = cp(b); B.ledger.money.towns.kautoa.shell.total += 300; caught('300 shells from nowhere in Kautoa', ISLE.moneyChecks(a, B), /what its books say/); }
{ const W = SIM.acct(SIM.accounts({ kind: 'workplace', settlement: 'valapo' })[0].id), was = W.ownedBy; W.ownedBy = 'treasury:kautoa';
  caught("a workplace of Valapo's owned by Kautoa's treasury", ISLE.moneyChecks(a, b), /has its account/); W.ownedBy = was; }
/* money moving: a Kautoan household pays a Valapo household across the towns; a trader from beyond changes Talents into shells */
{ const c0 = ISLE.moneyBooks(), k = SIM.accounts({ kind: 'household', settlement: 'kautoa' })[0], v = SIM.accounts({ kind: 'household', settlement: 'valapo' })[0];
  const paid = SIM.pay(k.id, v.id, 25, 'a gift'), got = SIM.exchange('foreign:beyond', 'treasury:kautoa', 100, 'a ship buys shells'), c1 = ISLE.moneyBooks(), L = SIM.ledger(c0.ledger, c1.ledger);
  ok('money moves between towns and currencies and the books still balance (25 shells Kautoa to Valapo; 100 Talents for ' + got + ' shells)',
    paid === 25 && got === Math.floor(100 / 0.05 * 0.97) && L.ok && L.money.towns.valapo.shell['in'] === 25 && L.money.towns.kautoa.shell.out === 25, L.ok ? '' : L.problems.slice(0, 2).join('; ')); }
const R = SIM.moneyReport();
console.log('--- the report: ' + Object.keys(R.currencies).map(c => R.currencies[c].name + ' ' + R.currencies[c].supply + ' in ' + R.currencies[c].accounts + ' accounts').join('; '));
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
