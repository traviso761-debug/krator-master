// node settlements/isle-demo/tests/test-isle-crime.js [days] — crime and punishment on the isles (src/47c, core/simulation
// 77-sim-6-crime.js) without a browser. Plans and declares both towns (crime is declared with them), runs `days` (7) with
// Kautoa watched (Valapo abstract), then the same with Valapo watched, and checks ISLE.crimeChecks over each: the criminals
// a share of the adults and never a soldier, every arrest held in its own town's barracks for its days and out of work,
// every one let go on time, what burglars took moved within one town, nobody held committing a crime. Each with a
// negative. Build first (python3 build.py).
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
const S = ISLE.simDeclare(plans);
ok('crime declared with the towns', S.crime && S.crime.criminals > 0, JSON.stringify(S.crime));
const cp = x => JSON.parse(JSON.stringify(x));
const caught = (what, rs, re) => { const r = rs.filter(c => re.test(c.name))[0]; ok('negative: ' + what + ' is caught', r && !r.ok, r && r.detail); };
let first = null, last = null;
for (const watched of ['Kautoa', 'Valapo']) {
  ISLE.simWatch(watched); const t0 = Date.now(), a = ISLE.crimeBooks(); ISLE.simRun(days * 1440); const b = ISLE.crimeBooks();
  console.log('--- ' + days + ' days with ' + watched + ' watched: ' + (Date.now() - t0) + ' ms');
  ISLE.crimeChecks(a, b).forEach(c => ok(c.name + ' (' + watched + ' watched)', c.ok, c.detail));
  if (!first) first = { a, b }; last = { a, b };
}
const { a, b } = first, T = Object.keys(b.towns);
{ const B = cp(b); B.towns.kautoa.report.crooks.push(SIM.all('actor').find(x => /\.soldier$/.test(x.role)).id); caught('a soldier among the criminals', ISLE.crimeChecks(a, B), /never a soldier/); }
{ const B = cp(b), H = { actor: 'x', place: 'p', jailKind: 'home', jailTown: 'kautoa', town: 'kautoa', until: 1e9, cmd: { place: 'p', until: 1e9, by: 'jail' }, working: false }; B.towns.kautoa.held.push(H);
  caught('one held in a house', ISLE.crimeChecks(a, B), /held in a barracks/); }
{ const B = cp(b), H = { actor: 'x', place: 'p', jailKind: 'barracks', jailTown: 'kautoa', town: 'kautoa', until: 1e9, cmd: { place: 'p', until: 1e9, by: 'jail' }, working: true }; B.towns.kautoa.held.push(H);
  caught('one held but at work', ISLE.crimeChecks(a, B), /held in a barracks/); }
{ const A = cp(a), B = cp(b), H = { actor: 'late', place: 'p', jailKind: 'barracks', jailTown: 'kautoa', town: 'kautoa', until: a.minute + 60, cmd: null };
  A.towns.kautoa.held.push(H); B.towns.kautoa.held.push(H); caught('one held past its days', ISLE.crimeChecks(A, B), /let go/); }
{ const B = cp(b); B.towns[T[0]].report.stats.stolen = (B.towns[T[0]].report.stats.stolen || 0) + 40; caught('40 servings stolen that no burglary logged', ISLE.crimeChecks(a, B), /burglars took/); }
{ const B = cp(b), r = { kind: 'arrest', actor: 'z', m: a.minute + 10, days: 7 }, c = { kind: 'crime', crime: 'pickpocket', actor: 'z', m: a.minute + 100 }; B.log.push(r, c);
  caught('a crime by one held', ISLE.crimeChecks(a, B), /nobody held/); }
{ const B = cp(b); B.towns.kautoa.report.guild.place = SIM.all('place').find(P => P.kind === 'tavern' && SIM.settlementOf(P.id) === 'kautoa' && P.id !== b.towns.kautoa.report.guild.place).id;
  caught('a guild at a tavern nearer the barracks', ISLE.crimeChecks(a, B), /one thieves' guild/); }
{ const B = cp(b), h = B.log.find(e => e.kind === 'hide') || { actor: 'h', m: a.minute + 5, until: a.minute + 200 }; if (!B.log.includes(h)) B.log.push(Object.assign({ kind: 'hide' }, h));
  B.log.push({ kind: 'arrest', actor: h.actor, m: h.m + 1, days: 7 }); caught('one arrested while hidden', ISLE.crimeChecks(a, B), /nobody hidden/); }
{ const B = cp(b); B.towns.kautoa.report.guild.stash.shirt = (B.towns.kautoa.report.guild.stash.shirt || 0) + 3; caught('three shirts on the guild\'s shelf nobody fenced', ISLE.crimeChecks(a, B), /fenced is at the guild/); }
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK');
process.exit(bad ? 1 : 0);
