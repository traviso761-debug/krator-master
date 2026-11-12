/* ==================== core/region 50: a valley of settlements at the abstract level (S3) [G data] ==================== */
/* core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S3 (the owner, 2026-11-11). The isle demo's towns are declared from
   their core/city plans (40: their lots, streets and doors). A valley of houses, villages and work camps planned on the
   open world (core/world KSITES) has no street plan: it is declared here from a plain spec, every settlement at the
   abstract level (its books, its producers by their workers' hours, no one posed), so a year runs in seconds. The spec
   is data (a culture's tune builds it: settlements/longsong/src/15-ls-tune.js LS_TUNE.valley(ring)):

     H.simValley(V)          declare it; V:
       seed, scale (people an actor stands for: 10), start (the clock's first minute), calendar (77-sim-6-season.js),
       factions: [{id, name}], relations: [{a, b, stance}], goods: {good: {unit, ...}} (every economy knows them all),
       settlements: [{id, name, faction, parent?, people, x, z, eats: {good: a person a day}, start: {good: n},
                      keepDays? (days of its own use a road keeps back: 30),
                      works: [{id, kind, name?, crew (people at work), out?: [good], rate? (units an actor-hour), cap?,
                               season?, seasonRate?, batch?: {in, out, hours}, herd?: {out, rate, animals, seasonRate?},
                               pasture?: {id, window} (a summer pasture the herd moves to while `window` is open)}]}],
       roads: [{id, from, to, minutes, cap, carriers?, stagger?, share?: {settlement: {good: fraction}} (a tithe),
                goods?: {settlement: [goods]}, expect?: {settlement: {good: a day}}, keep?}],
       transfers: [SIM.transfer's spec] (the grant of fealty, the grants of esteem)
     H.valleyRun(minutes, step)   the clock stepped `step` minutes at a time (60: the abstract level's hour)
     H.valleyBooks()         a snapshot: each settlement's people, stock, made, imported, exported, used and short by good,
                             what it ate and went without (`eaten`, `hungry`), and SIM.ledgerSnap()

   Each work is its own store (a warehouse: the farmstead's granary, the scriptorium's shelves), so what it makes is in
   the settlement's stock at once, with no carts to walk. Each settlement's people eat from its warehouses every hour
   (`eats`, by SIM.supply: booked used, a shortfall booked short), whatever their work. A road is SIM.trade on the timer
   between two settlements' first works' stores; a tithe road (`share`) carries a fraction of what the village made and
   nothing for want from it; the other end sends for want as any road does. Deterministic: no draws but SIM.init's. */
KREGION.part('50-region-valley', function (H) {
H.simValley = function (V) {
  var K = V.scale == null ? 10 : V.scale, m0 = V.start == null ? 0 : V.start, C = { m: m0, day: Math.floor(m0 / 1440), hour: (m0 % 1440 + 0.5) / 60, t: 0 };
  var S = H.SIM = { clock: C, valley: V, towns: {}, order: [], problems: [], eaten: {}, hungry: {}, fed: {}, starved: {}, away: {}, carry: {}, moves: [], last: m0 };
  SIM.init({ seed: V.seed == null ? 1 : V.seed, hour: function () { return C.hour; }, day: function () { return C.day; }, t: function () { return C.t; }, err: function (m) { S.problems.push(m); } });
  ['SLEEP', 'WORK', 'REST'].forEach(function (a) { if (!SIM.R.activity[a]) SIM.activity({ id: a, indoor: a !== 'WORK' }); });
  if (V.calendar) SIM.calendar(V.calendar);
  (V.factions || []).forEach(function (f) { if (!SIM.R.faction[f.id]) SIM.faction(f); });
  (V.relations || []).forEach(function (r) { SIM.relation(r); });
  var nodes = [], edges = [], node = function (x, z) { nodes.push({ id: nodes.length, x: x, y: 0, z: z }); return nodes.length - 1; };
  V.settlements.forEach(function (Sd) {
    var s = Sd.id, x0 = Sd.x == null ? 0 : Sd.x, z0 = Sd.z == null ? 0 : Sd.z, X = S.towns[s] = { id: s, spec: Sd, places: [], actors: 0, herds: 0, works: [] };
    SIM.settlement({ id: s, faction: Sd.faction, name: Sd.name, parent: Sd.parent });
    SIM.org({ id: s + '.folk', faction: Sd.faction, name: 'The people of ' + Sd.name });
    SIM.role({ id: s + '.worker', org: s + '.folk', sched: [[0, 'SLEEP'], [6, 'WORK'], [18, 'REST'], [21, 'SLEEP']] });
    SIM.role({ id: s + '.beast', org: s + '.folk', sched: [[0, 'REST']] });
    SIM.economy({ goods: V.goods, every: 60, window: 7, imports: { days: 3, scan: 60 }, exports: { minDays: Sd.keepDays == null ? 30 : Sd.keepDays, made: true } }, { settlement: s });
    var first = node(x0, z0), home = SIM.place({ id: s + '.home', kind: 'home', x: x0, z: z0, activities: { SLEEP: 1e4, REST: 1e4 }, indoor: true, settlement: s });
    X.places.push(home);
    Sd.works.forEach(function (Wk, i) {
      var x = x0 + 30 * (i + 1), z = z0, n = node(x, z); edges.push({ id: edges.length, a: first, b: n, kind: 'ground', len: 30 * (i + 1), w: 4 });
      var crew = Math.max(Wk.crew > 0 ? 1 : 0, Math.round((Wk.crew == null ? 0 : Wk.crew) / K));
      var P = SIM.place({ id: Wk.id, kind: Wk.kind, name: Wk.name || Wk.kind, x: x, z: z, activities: { WORK: Math.max(1, crew) }, indoor: true, settlement: s });
      X.places.push(P);
      SIM.store(Wk.id, { kind: 'warehouse', cap: Wk.cap });
      var R = { cap: Wk.cap, season: Wk.season, seasonRate: Wk.seasonRate };
      if (Wk.batch) R.batch = Object.assign({}, Wk.batch, { hours: Wk.batch.hours / K }); else   /* an actor's hour is K people's */
      { R.out = Wk.out || []; R.rate = (Wk.rate == null ? 0 : Wk.rate) * K; }
      if (Wk.herd) R.herd = { out: Wk.herd.out, rate: Wk.herd.rate * K, seasonRate: Wk.herd.seasonRate };
      SIM.recipe(Wk.id, R);
      for (var k = 0; k < crew; k++) { SIM.actor({ id: Wk.id + '.w' + k, role: s + '.worker', home: s + '.home', work: Wk.id }); X.actors++; }
      if (Wk.herd) for (var b = 0, nb = Math.round(Wk.herd.animals / K); b < nb; b++) { SIM.actor({ id: Wk.id + '.b' + b, role: s + '.beast', home: s + '.home', herd: Wk.id }); X.herds++; }
      if (Wk.pasture) {   /* the summer pasture: a herd place of its own the beasts move to while its window is open */
        var Pp = SIM.place({ id: Wk.pasture.id, kind: 'pasture', name: (Wk.name || Wk.kind) + ': the summer pasture', x: x, z: z - 200, activities: { WORK: 1 }, indoor: false, settlement: s });
        SIM.store(Wk.pasture.id, { kind: 'warehouse' });
        SIM.recipe(Wk.pasture.id, { out: [], rate: 0, herd: { out: Wk.herd.out, rate: Wk.herd.rate * K * (Wk.pasture.rate == null ? 1 : Wk.pasture.rate) } });
        X.works.push({ id: Wk.id, pasture: Wk.pasture.id, window: Wk.pasture.window });
      }
    });
    var W0 = SIM.econ(s).warehouses[0];
    if (W0) Object.keys(Sd.start || {}).forEach(function (g) { W0.stock[g] = (W0.stock[g] || 0) + Sd.start[g]; });
    S.order.push(s); S.eaten[s] = {}; S.hungry[s] = {}; S.carry[s] = {};
  });
  SIM.nav.layer('pedestrian', { nodes: nodes, edges: edges });
  (V.roads || []).forEach(function (Rd) {
    var a = S.towns[Rd.from], b = S.towns[Rd.to];
    if (!a || !b) { S.problems.push('road ' + Rd.id + ': no settlement ' + (a ? Rd.to : Rd.from)); return; }
    SIM.trade({ id: Rd.id, stops: [{ settlement: Rd.from, place: a.spec.works[0].id }, { settlement: Rd.to, place: b.spec.works[0].id }], cap: Rd.cap, carriers: Rd.carriers,
      minutes: Rd.minutes, stagger: Rd.stagger, mins: Rd.mins == null ? 60 : Rd.mins, goods: Rd.goods, expect: Rd.expect, share: Rd.share, keep: Rd.keep });
  });
  (V.transfers || []).forEach(function (Tr) { SIM.transfer(Tr); });
  /* the herds to their summer pasture and home again (77-sim-6-season.js: the window's turn) */
  if (SIM.onSeason) SIM.onSeason(function (now, before, minute) {
    S.order.forEach(function (s) { S.towns[s].works.forEach(function (w) { if (!w.pasture) return; var on = !!now.windows[w.window], was = !!before.windows[w.window]; if (on === was) return;
      SIM.all('actor').forEach(function (a) { if (a.herd === (on ? w.id : w.pasture)) a.herd = on ? w.pasture : w.id; });
      S.moves.push({ minute: minute, settlement: s, herd: w.id, to: on ? w.pasture : w.id }); }); });
  });
  /* each settlement's people eat from its warehouses, every hour of the clock, whatever their work; then its beasts (S4:
     `feeds`, {good: kg a day} for all its beasts, a culture's table worked out by core/camp KCAMP.beastNeeds), booked `fed`
     and `starved`. A settlement that is away (H.valleyAway: a band out ranging, its books with core/camp's world tick)
     neither eats nor works here */
  SIM.stepHooks.push(function (minute) {
    var hrs = (minute - S.last) / 60; if (hrs <= 0) return; S.last = minute;
    S.order.forEach(function (s) { var Sd = S.towns[s].spec, E = Sd.eats || {}; if (S.away && S.away[s]) return;
      Object.keys(E).sort().forEach(function (g) { var c = (S.carry[s][g] || 0) + Sd.people * E[g] * hrs / 24, n = Math.floor(c); S.carry[s][g] = c - n; if (n <= 0) return;
        var got = SIM.supply(g, n, false, s); S.eaten[s][g] = (S.eaten[s][g] || 0) + got; if (got < n) S.hungry[s][g] = (S.hungry[s][g] || 0) + n - got; });
      if (Sd.feeds) { var F = S.fed[s] || (S.fed[s] = {}), St = S.starved[s] || (S.starved[s] = {});
        Object.keys(Sd.feeds).sort().forEach(function (g) { var k = 'beast:' + g, c = (S.carry[s][k] || 0) + Sd.feeds[g] * hrs / 24, n = Math.floor(c); S.carry[s][k] = c - n; if (n <= 0) return;
          var got = SIM.supply(g, n, false, s); F[g] = (F[g] || 0) + got; if (got < n) St[g] = (St[g] || 0) + n - got; }); } });
  });
  S.order.forEach(function (s) { SIM.level(s, 'abstract'); });
  S.problems = S.problems.concat(SIM.check());
  return S;
};
H.valleyRun = function (minutes, step) {
  var C = H.SIM.clock, st = step == null ? 60 : step, end = C.m + minutes;
  while (C.m < end) { C.m = Math.min(end, C.m + st); C.day = Math.floor(C.m / 1440); C.hour = (C.m % 1440 + 0.5) / 60; C.t += st; SIM.step(); }
  return C.m;
};
H.valleyBooks = function () {
  var S = H.SIM, out = { minute: S.clock.m, towns: {}, ledger: SIM.ledgerSnap ? SIM.ledgerSnap() : null };
  S.order.forEach(function (s) { var E = SIM.econ(s), st = {};
    Object.keys(E.goods).forEach(function (g) { var n = SIM.stockOf(g, s); if (n) st[g] = Math.round(n); });
    out.towns[s] = { people: S.towns[s].spec.people, stock: st, made: Object.assign({}, E.made), imported: Object.assign({}, E.imported), exported: Object.assign({}, E.exported),
      used: Object.assign({}, E.used), short: Object.assign({}, E.short), eaten: Object.assign({}, S.eaten[s]), hungry: Object.assign({}, S.hungry[s]) };
    if (S.towns[s].spec.feeds) { out.towns[s].fed = Object.assign({}, S.fed[s]); out.towns[s].starved = Object.assign({}, S.starved[s]); } });
  return out;
};
/* core/camp's host (C4, S6: core/camp/60-camp-world.js, THE HOST): the world tick's view of the valley's books. A band's
   stock handed in lands in its settlement's warehouses (imported); taken back out (exported) when it leaves; a market's
   side of a caravan's barter; a raid's loot leaving the target (exported, tallied in H.SIM.raided) and its dead. Every
   load is booked, so the sim's ledger holds across the hand-overs (off the map: the ledger's abroad columns) */
H.valleyHost = function () {
  var S = H.SIM; S.raided = S.raided || {}; S.killed = S.killed || {};
  var wh = function (s, g) { var n = 0; SIM.econ(s).warehouses.forEach(function (P) { n += P.stock[g] || 0; }); return n; };
  var put = function (s, goods, kind) { var out = {}; SIM.withEcon(s, function () { Object.keys(goods).sort().forEach(function (g) { var n = goods[g];
    if (!(n > 0) || !SIM.ECON.goods[g]) return; if (SIM.economyLand(g, n) == null) return; SIM.economyBook(kind || 'imported', g, n); out[g] = n; }); }); return out; };
  var out = function (s, goods) { var got = {}; SIM.withEcon(s, function () { Object.keys(goods).sort().forEach(function (g) { var n = Math.floor(Math.min(goods[g], wh(s, g)));
    if (!(n > 0)) return; n = SIM.economyTake(g, n); if (n > 0) { SIM.economyBook('exported', g, n); got[g] = n; } }); }); return got; };
  return {
    land: function (s, goods) { return put(s, goods); },
    take: function (s) { var all = {}; Object.keys(SIM.econ(s).goods).forEach(function (g) { var n = Math.floor(wh(s, g)); if (n > 0) all[g] = n; }); return out(s, all); },
    away: function (s, a) { H.valleyAway(s, a); },
    people: function (s) { return S.towns[s].spec.people; },
    stock: function (s, g) { return wh(s, g); },
    raid: function (s, goods) { var got = out(s, goods), R = S.raided[s] || (S.raided[s] = {}); Object.keys(got).forEach(function (g) { R[g] = (R[g] || 0) + got[g]; }); return got; },
    kill: function (s, n) { var Sd = S.towns[s].spec; n = Math.min(n, Sd.people); Sd.people -= n; S.killed[s] = (S.killed[s] || 0) + n; },
    trade: function (s, sold, bought) { put(s, sold); out(s, bought); }
  };
};
/* a band out ranging (S6: core/camp's hand-over): away, its people and beasts neither eat here nor its works make (each
   held by SIM.recipeHold, 'away'); home again, they do */
H.valleyAway = function (s, away) {
  var S = H.SIM, X = S.towns[s]; if (!X) return false;
  S.away[s] = !!away;
  X.spec.works.forEach(function (Wk) { SIM.recipeHold(Wk.id, away ? 'away' : null); if (Wk.pasture) SIM.recipeHold(Wk.pasture.id, away ? 'away' : null); });
  return true;
};
});
