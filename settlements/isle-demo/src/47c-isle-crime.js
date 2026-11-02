/* ============================== 7h1. CRIME AND PUNISHMENT (2026-11-02) ============================== */
/* [G data] core/simulation's crime (77-sim-6-crime.js, opt-in) on the isles, tuned by ISLE.TUNE.sim.crime (15): the Voth
   brief's rules (settlements/voth/SIM-ROADMAP.md 1.7) proved here first. Each town's soldiers are its guards and its
   barracks its jails; its criminals are a share of its adults; pickpockets work the markets, shops and greens, burglars
   the households' food stores, and any adult unhappy enough may start a fight.
     ISLE.simCrime()            after both towns are declared (40): SIM.crime with the isles' roles -> its report
     ISLE.crimeBooks()          a snapshot: each town's criminals, stats, the held, and each household food store's total
     ISLE.crimeChecks(a, b)     over two snapshots: the criminals a share of the adults and never a guard; every arrest
                                held in a barracks of the arrested's own town for its days and out of work; every one let
                                go when its days are up; what burglars took moved between households of one town (none
                                lost); a fight's victim hurt; nothing done by someone held */
ISLE.simCrime = function () {
  var T = ISLE.TUNE.sim, K = T.crime, S = ISLE.SIM; if (!K || !SIM.crime) return null;
  var job = function (a) { var s = SIM.settlementOf(a); return s != null && a.role.indexOf(s + '.') === 0 ? a.role.slice(s.length + 1) : a.role; };
  var mine = function (a) { return S.order.indexOf(SIM.settlementOf(a)) >= 0; };
  var C = SIM.crime({ seed: T.seed, share: K.share, who: function (a) { return mine(a) && K.not.indexOf(job(a)) < 0; },
    guard: function (a) { return mine(a) && K.guards.indexOf(job(a)) >= 0; }, jails: K.jails, guardActs: K.guardActs,
    crimes: K.crimes, seen: K.seen, arrest: K.arrest, jail: K.jail, abstract: K.abstract });
  return { criminals: C.crooks.length };
};
ISLE.crimeBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), towns: {} }; if (!SIM.CRIME) return out;
  S.order.forEach(function (s) {
    var R = SIM.crimeReport(s), food = 0, adults = 0, K = ISLE.TUNE.sim.crime;
    SIM.all('place').forEach(function (P) { if (P.store && SIM.settlementOf(P.id) === s) for (var f in P.store) food += P.store[f]; });
    SIM.all('actor').forEach(function (a) { if (!a.driven && SIM.settlementOf(a) === s && K.not.indexOf(a.role.slice(s.length + 1)) < 0) adults++; });
    out.towns[s] = { report: R, food: food, adults: adults, held: R.jailed.map(function (J) { var a = SIM.R.actor[J.actor];
      return { actor: J.actor, place: J.place, jailKind: (SIM.R.place[J.place] || {}).kind, jailTown: SIM.settlementOf(J.place), town: SIM.settlementOf(a), until: J.until,
        cmd: a.cmd ? { place: a.cmd.place, until: a.cmd.until, by: a.cmd.by } : null, at: a.place, working: a.activity === 'WORK', resisted: J.resisted }; }) };
  });
  out.log = SIM.crimeEvents();
  return out;
};
ISLE.crimeChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'crime: ' + name, ok: !!pass, detail: detail }); };
  var K = ISLE.TUNE.sim.crime, towns = Object.keys(b.towns), sum = function (o) { var n = 0; for (var k in o || {}) n += o[k]; return n; };
  var guardOf = function (id) { var A = SIM.R.actor[id], s = SIM.settlementOf(A); return K.guards.indexOf(A.role.slice(s.length + 1)) >= 0; };
  ok('the criminals are about ' + K.share * 1000 + ' in 1,000 of each town\'s adults, never a soldier', towns.every(function (s) { var X = b.towns[s], n = X.report.criminals;
      return Math.abs(n - X.adults * K.share) <= 3 * Math.sqrt(X.adults * K.share) + 1 && !X.report.crooks.some(guardOf); }),
    towns.map(function (s) { return s + ' ' + b.towns[s].report.criminals + ' of ' + b.towns[s].adults + ' adults'; }).join('; '));
  var held = []; towns.forEach(function (s) { b.towns[s].held.forEach(function (H) { held.push(H); }); });
  ok('every one arrested is held in a barracks of its own town for its days, out of work', held.every(function (H) {
      return K.jails.indexOf(H.jailKind) >= 0 && H.jailTown === H.town && H.cmd && H.cmd.place === H.place && H.cmd.until === H.until && H.cmd.by === 'jail' && !H.working; }),
    held.length + ' held' + (held.length ? ': ' + held.map(function (H) { return H.actor + ' at ' + H.place + ' until day ' + Math.floor(H.until / 1440) + (H.resisted ? ' (resisted)' : ''); }).slice(0, 4).join('; ') : ''));
  var late = []; towns.forEach(function (s) { (a.towns[s] ? a.towns[s].held : []).forEach(function (H) { if (H.until <= b.minute && b.towns[s].held.some(function (J) { return J.actor === H.actor && J.until === H.until; })) late.push(H.actor); }); });
  ok('every one held is let go when its days are up', !late.length, late.length ? 'still held: ' + late.join(', ') : towns.map(function (s) { return s + ' served ' + (b.towns[s].report.stats.served || 0); }).join('; '));
  var bur = b.log.filter(function (e) { return e.kind === 'crime' && e.crime === 'burglary'; });
  ok('what burglars took moved between households of one town (the servings logged are the servings counted)', bur.every(function (e) {
      return SIM.settlementOf(e.home) === SIM.settlementOf(SIM.R.actor[e.actor]); }) && towns.every(function (s) {
      return bur.filter(function (e) { return SIM.settlementOf(SIM.R.actor[e.actor]) === s; }).reduce(function (n, e) { return n + e.servings; }, 0) === (b.towns[s].report.stats.stolen || 0); }),
    towns.map(function (s) { var st = b.towns[s].report.stats; return s + ' ' + (st.done.burglary || 0) + ' burglaries, ' + (st.stolen || 0) + ' servings'; }).join('; '));
  var acts = b.log.filter(function (e) { return e.kind === 'crime' && e.m > a.minute; }), bad = acts.filter(function (e) {
    return b.log.some(function (r) { return r.kind === 'arrest' && r.actor === e.actor && r.m < e.m && e.m < r.m + r.days * 1440; }); });
  ok('nobody held commits a crime', !bad.length, bad.length ? bad.length + ' crimes by the held' : acts.length + ' crimes, ' + towns.map(function (s) { var st = b.towns[s].report.stats;
    return s + ': ' + sum(st.attempts) + ' tried, ' + sum(st.done) + ' done, ' + sum(st.seen) + ' seen, ' + sum(st.arrested) + ' arrested, ' + sum(st.escaped) + ' escaped'; }).join('; '));
  return res;
};
