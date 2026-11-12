// node settlements/pinnacle-rock/tests/test-pr-sim.js [days | --year] — Pinnacle Rock's full sim (the owner, 2026-11-12:
// "implement full sim to the level of isle demo including needs and happiness"): the town's people on core/region's host
// from the page's plan (plan/pinnacle.json) and its table (src/16-pr-sim.js), with needs, happiness, loyalty, items, the
// economy and unrest; the clearings, the eighteen bands at home, the markets and the targets attached (core/region 50,
// V.attach); the bands' dry season on core/camp's world tick. Runs `days` (21) from the year's day 0 (the dry season: the
// town on its granary), or the whole year with --year (about 12 minutes). Each check with a negative.
const { world } = require('./pr-sim-host.js');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && !neg; if (!r) bad++; console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (neg ? ' (its negative passed)' : '')); };
const YEAR = process.argv.indexOf('--year') >= 0, DAYS = YEAR ? 365 : +(process.argv[2] || 21);
function run(o) {
  o = o || {};
  const Y = world({ startDays: 3 }), { H, S, VS, W, town } = Y, X = S.towns[town], foods = X.econ.foods;
  if (o.maxShare != null) SIM.ITEMS.maxShare = o.maxShare;
  const a = SIM.ledgerSnap(), log = [];
  for (let d = 0; d < (o.days || DAYS); d++) {
    KCAMP.tick(W, d); H.simRun(1440);
    const c = SIM.needsCensus(p => SIM.settlementOf(p))[town], U = SIM.unrestReport().towns[town];
    log.push({ d, happy: c.happy, eat: c.mean.eat, unrest: U.level.all, stage: U.stage.all, home: W.order.filter(id => W.bands[id].loaded).length,
      food: foods.reduce((s, g) => s + SIM.stockOf(g, town), 0) });
  }
  const B = ((SIM.ITEMS.statsBy || {})[town] || {}).bought || {};
  return { Y, X, log, a, b: SIM.ledgerSnap(), bought: Object.fromEntries(foods.map(g => [g, B[g] || 0])) };
}
const t0 = Date.now(), R = run(), { Y, X, log } = R, town = Y.town, last = log[log.length - 1];
console.log(DAYS + ' days of Pinnacle Rock in ' + ((Date.now() - t0) / 1000).toFixed(0) + ' s: ' + X.pop.actors + ' people, ' + X.places.places.length + ' places, ' + Y.VS.order.length + ' settlements attached');
// 1. declared: about 3,000 people (the owner), every lot of the plan a place, every post filled, nothing wrong
{ const posts = Object.values(X.pop.posts).reduce((s, n) => s + n, 0);
  ok('declared from the page\'s plan: about 3,000 people, every lot a place, every post worked, the valley attached', X.pop.actors >= 2850 && X.pop.actors <= 3150 && !Object.keys(X.places.unmapped).length && X.pop.workers >= posts && !Y.S.problems.length && !Y.VS.problems.length,
    X.pop.actors < 2000, X.pop.actors + ' people, ' + X.places.homes + ' homes, ' + X.pop.workers + ' workers for ' + posts + ' posts; unmapped ' + JSON.stringify(X.places.unmapped)); }
// 2. the books balance over the run, the town and every attached settlement
{ const L = SIM.ledger(R.a, R.b, { tol: 1 });
  ok('the books balance (opening + made + imported = consumed + spoiled + exported + closing), every settlement', L.ok, false, L.ok ? 'all goods' : L.problems.slice(0, 3).join('; ')); }
// 3. needs and happiness: the town fed (its hunger meter low) and calm (its happiness pool over 50) every day
{ const worst = log.reduce((m, r) => Math.min(m, r.unrest), 100), hungry = log.reduce((m, r) => Math.max(m, r.eat), 0);
  ok('the town fed and calm every day: its people\'s hunger under 40, its happiness pool over 50', hungry < 40 && worst > 50, false,
    'hunger at most ' + Math.round(hungry) + ', the pool at least ' + Math.round(worst) + '; at the end happiness ' + Math.round(last.happy) + ', ' + last.stage); }
// 4. the balanced basket (core/simulation 77-sim-6-items.js): a household buys two foods at least, no one food over half its
//    purchase while another is on the shelf, so a granary of one staple makes two-food meals; with the old share by stock,
//    the granary's grain is nearly all the town buys
{ const B = R.bought, tot = Object.values(B).reduce((s, n) => s + n, 0), top = Object.entries(B).sort((p, q) => q[1] - p[1])[0];
  const N = run({ maxShare: 1, days: Math.min(DAYS, 8) }), NB = N.bought, nt = Object.values(NB).reduce((s, n) => s + n, 0), ntop = Object.entries(NB).sort((p, q) => q[1] - p[1])[0];
  ok('the balanced basket: no food more than about half of what the households bought (a meal is two foods)', top[1] / tot <= 0.55, ntop[1] / nt <= 0.55,
    top[0] + ' ' + Math.round(top[1] / tot * 100) + '% of ' + Math.round(tot) + ' servings bought; by stock alone ' + ntop[0] + ' ' + Math.round(ntop[1] / nt * 100) + '%'); }
// 5. the season: the bands out ranging in the dry season, home (handed over) in the wet
{ const wrong = log.filter(r => { const yd = r.d % 365, home = yd >= 120 && yd < 300; return home ? r.home !== 18 : r.home !== 0; });
  ok('the eighteen bands ranging in the dry season and home in the wet, day by day', !wrong.length, false, wrong.length + ' days wrong; ' + (YEAR ? 'home ' + log.filter(r => r.home === 18).length + ' days' : 'all dry-season days')); }
if (YEAR) {
  // 6. the year: the town never past grumbling, ending with food in store
  const worst = log.reduce((m, r) => Math.min(m, r.unrest), 100);
  ok('the year: the town never past grumbling (pool over 40), food in store at the year\'s end', worst > 40 && last.food > 0, false, 'pool at least ' + Math.round(worst) + ', ' + Math.round(last.food) + ' servings at the end');
  console.log(log.filter((r, i) => i % 15 === 0 || i === log.length - 1).map(r => 'day ' + r.d + ': happy ' + Math.round(r.happy) + ', hunger ' + Math.round(r.eat) + ', ' + r.stage + ', ' + Math.round(r.food) + ' servings, bands home ' + r.home).join('\n'));
}
console.log(bad ? '\n' + bad + ' FAILED' : '\nOK'); process.exit(bad ? 1 : 0);
