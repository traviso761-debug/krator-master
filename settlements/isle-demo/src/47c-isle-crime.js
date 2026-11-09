/* ============================== 7h1. CRIME AND PUNISHMENT (2026-11-02) ============================== */
/* [G data] core/simulation's crime (77-sim-6-crime.js, opt-in) on the isles, tuned by ISLE.TUNE.sim.crime (15): the Voth
   brief's rules (settlements/voth/SIM-ROADMAP.md 1.7) proved here first. Each town's soldiers are its guards and its
   barracks its jails; its criminals are a share of its adults; pickpockets work the markets, shops and greens, burglars
   the households' food stores, and any adult unhappy enough may start a fight. THE THIEVES' GUILD (owner, 2026-11-02): one
   tavern a town, the farthest from its barracks, where a criminal hides from the watch and fences what it stole.
     ISLE.simCrime()            after both towns are declared (40): SIM.crime with the isles' roles -> its report
     ISLE.crimeBooks()          a snapshot: each town's criminals, stats, the held, and each household food store's total
     ISLE.crimeChecks(a, b)     over two snapshots: the criminals a share of the adults and never a guard; every arrest
                                held in a barracks of the arrested's own town for its days and out of work; every one let
                                go when its days are up; what burglars took moved between households of one town (none
                                lost); a fight's victim hurt; nothing done by someone held; one guild a town (its
                                tavern farthest from the barracks); nobody hidden there arrested; what was fenced
                                at the guild, no more than was stolen */
ISLE.simCrime = function () {
  var T = ISLE.TUNE.sim, K = T.crime, S = ISLE.SIM; if (!K || !SIM.crime) return null;
  var job = function (a) { var s = SIM.settlementOf(a); return s != null && a.role.indexOf(s + '.') === 0 ? a.role.slice(s.length + 1) : a.role; };
  var mine = function (a) { return S.order.indexOf(SIM.settlementOf(a)) >= 0; };
  var C = SIM.crime({ seed: T.seed, share: K.share, who: function (a) { return mine(a) && K.not.indexOf(job(a)) < 0; },
    guard: function (a) { return mine(a) && K.guards.indexOf(job(a)) >= 0; }, jails: K.jails, guardActs: K.guardActs,
    crimes: K.crimes, seen: K.seen, arrest: K.arrest, jail: K.jail, abstract: K.abstract, guild: K.guild || null });
  var guilds = {}; S.order.forEach(function (s) { var G = SIM.guildOf(s); if (G) guilds[s] = G.id; });
  return { criminals: C.crooks.length, guilds: guilds };
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
  /* the thieves' guild */
  var kinds = (K.guild || {}).kinds || [], jails = K.jails, place = function (id) { return SIM.R.place[id]; };
  var gl = towns.map(function (s) { var G = b.towns[s].report.guild, far = function (P) { var d = Infinity;
      SIM.all('place').forEach(function (J) { if (jails.indexOf(J.kind) >= 0 && SIM.settlementOf(J.id) === s) d = Math.min(d, Math.hypot(J.x - P.x, J.z - P.z)); }); return d; };
    var best = SIM.all('place').filter(function (P) { return kinds.indexOf(P.kind) >= 0 && SIM.settlementOf(P.id) === s; }).reduce(function (m, P) { return Math.max(m, far(P)); }, -1);
    return { s: s, G: G, ok: !!G && kinds.indexOf(G.kind) >= 0 && SIM.settlementOf(G.place) === s && Math.abs(far(place(G.place)) - best) < 1e-6, d: G ? Math.round(far(place(G.place))) : null }; });
  if (K.guild) ok('one thieves\' guild a town: its tavern farthest from the barracks', gl.every(function (g) { return g.ok; }),
    gl.map(function (g) { return g.s + ' ' + (g.G ? g.G.place + ' (' + g.G.kind + ', ' + g.d + ' m from the barracks)' : 'none'); }).join('; '));
  var hides = b.log.filter(function (e) { return e.kind === 'hide'; }), caughtHid = b.log.filter(function (r) { return r.kind === 'arrest' && hides.some(function (h) { return h.actor === r.actor && h.m <= r.m && r.m < h.until; }); });
  if (K.guild) ok('nobody hidden at the guild is arrested', !caughtHid.length, caughtHid.length ? caughtHid.length + ' arrested while hidden' : hides.length + ' hid' + (hides.length ? ': ' + hides.slice(0, 3).map(function (h) { return h.actor + ' at ' + h.guild; }).join(', ') : ''));
  if (K.guild) ok('what was fenced is at the guild, and no more than was stolen', towns.every(function (s) { var R = b.towns[s].report, st = R.stats, G = R.guild || { store: {}, stash: {} };
      var held = Object.keys(G.store).reduce(function (n, f) { return n + G.store[f]; }, 0), shelf = Object.keys(G.stash).reduce(function (n, k) { return n + G.stash[k]; }, 0);
      return st.fenced <= st.stolen && st.fencedItems <= st.taken && held === st.fenced && shelf === st.fencedItems; }),
    towns.map(function (s) { var st = b.towns[s].report.stats; return s + ': ' + (st.fenced || 0) + ' of ' + (st.stolen || 0) + ' servings and ' + (st.fencedItems || 0) + ' of ' + (st.taken || 0) + ' things fenced, ' + (b.towns[s].report.carrying || []).length + ' still carrying, ' + (st.recovered || 0) + ' recovered'; }).join('; '));
  return res;
};
/* THE GUILD ON THE MAP (owner, 2026-11-02): each town's guild as a record a page can mark. ISLE.guildMarks() -> [{settlement,
   town, place, tag, name, x, z}] (world metres; `tag` the tavern's core/tags record, core/city's); ISLE.tagGuilds(tagsOf)
   registers a `landmark` "Thieves' guild" under that tavern in its town's registry (tagsOf(town) -> KTAGS), so the inspector
   names it and a page draws its sign there -> the marks with their record and frame position (at, size, ry). Once a page */
ISLE.guildMarks = function () {
  var S = ISLE.SIM, out = []; if (!S || !SIM.CRIME || !SIM.guildOf) return out;
  S.order.forEach(function (s) { var G = SIM.guildOf(s); if (!G) return;
    out.push({ settlement: s, town: S.towns[s].town, place: G.id, tag: G.tags && G.tags.tag != null ? G.tags.tag : null, name: G.name, x: G.x, z: G.z }); });
  return out;
};
ISLE.tagGuilds = function (tagsOf) {
  return ISLE.guildMarks().map(function (m) {
    var T = tagsOf(m.town), P = T && m.tag != null ? T.get(m.tag) : null; if (!P) return Object.assign({ record: null }, m);
    var R = T.child(P.id, { 'class': 'landmark', kind: "thieves' guild", key: 'thieves-guild', name: "Thieves' guild", at: P.at.slice(), ry: P.ry || 0,
      r: P.size ? Math.max(6, Math.hypot(P.size[0], P.size[1]) / 2) : 6, h: P.size ? P.size[2] : 6, tags: { culture: 'islander', types: ['tavern'], role: 'guild' },
      note: 'the thieves\' guild of ' + m.town + ': a criminal hides here from the watch and fences what it stole (47c)', src: 'isle-demo' });
    return Object.assign({ record: R.id, at: P.at.slice(), size: P.size ? P.size.slice() : null, ry: P.ry || 0 }, m);
  });
};
