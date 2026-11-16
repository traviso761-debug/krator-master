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
       roads: [{id, from, to, minutes, cap, carriers?, stagger?, want? (days of use a load fills the far end to: SIM.trade's
                `want`; a long road's carriers come seldom, so its want must cover the gap), most?, share?: {settlement: {good: fraction}} (a tithe),
                goods?: {settlement: [goods]}, expect?: {settlement: {good: a day}}, keep?}],
       transfers: [SIM.transfer's spec] (the grant of fealty, the grants of esteem)
     X1 (core/simulation/PROPOSAL-XANADU.md, 2026-11-16), each inert where its field is absent:
       a settlement's `scale` (people an actor stands for there; V.scale otherwise): a valley of 350,000 keeps its
         countrysides at 200 a head and its drawn villages at 10, and Longsong's 10 joins it unchanged (X2);
       a work's `site`: {id?, kind, grade?, yield?, amount?, regen?, capacity?}: SIM.site in its settlement, the work's
         recipe drawing on it (a lode that runs out, a stand that regrows a night up to its start: 77-sim-6-economy.js);
       a road's `stops`: [settlement, ...] (three or more) in place of from/to: a round, 0, 1, ... and back to 0, each
         leg `minutes` long (SIM.trade's round: a carrier buys at each stop what the next one wants and lands it there;
         the lake's market boats round a shore)
     X2 (2026-11-16, the owner: "the gold and opal lodes should collectively last >200 years but individually lodes may
     dry up over the course of 2-3 years"; the Guilds of the Twins "try to profit from trade"):
       a work's `site.veins`: [{amount}, ...]: a field of veins, one SIM.site each; the work draws on one until it runs dry,
         then moves to the next (SIM.recipeSite), booked in S.veinMoves; the field is spent when the last runs dry;
       a road's `cut`: [{at, to, share, goods?}]: of what the road lands at `at`, `share` goes on to `to` (a merchant
         house's margin, a lift's toll), taken from `at`'s warehouses and landed in `to`'s first work (booked exported
         and imported, so the books balance); S.cuts[road] = {taken: {good: n}}
     C1-C2 (core/simulation/PROPOSAL-CATCH.md, 2026-11-16), passed to SIM.trade as they are:
       a road's `legs`: [minutes, ...], a passage per leg of a round (a caravan's stages differ);
       a road's `provision`: {beasts, eat: {good: a beast a day}, loss?, home?}: a caravan's beasts draw water and fodder at
         each stop for the leg ahead, a shortfall kills some, a train short of beasts carries less until it remounts at home
     C3-C5 (the same proposal): a road's `halts`, `sells` and `closed` (SIM.trade's: waystations that keep the cargo
       aboard, the oasis towns that buy from it as it passes, legs shut in a season); a road's `losses`: [{legs, every,
       spare, share, window?, why}] (a provisioned caravan's beasts lost on those legs, by a fixed rule: the Stalkers, the
       col, an unguided crossing of the Twins); V.siteSeasons: [{settlement, site, window, regen}] (a site's recharge cut in
       a season: an oasis found dry)
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
  var KV = V.scale == null ? 10 : V.scale, m0 = V.start == null ? 0 : V.start, C = { m: m0, day: Math.floor(m0 / 1440), hour: (m0 % 1440 + 0.5) / 60, t: 0 };
  var S = H.SIM = { clock: C, valley: V, towns: {}, order: [], problems: [], eaten: {}, hungry: {}, carry: {}, moves: [], last: m0, veinWorks: [], veinMoves: [], cuts: {} };
  SIM.init({ seed: V.seed == null ? 1 : V.seed, hour: function () { return C.hour; }, day: function () { return C.day; }, t: function () { return C.t; }, err: function (m) { S.problems.push(m); } });
  ['SLEEP', 'WORK', 'REST'].forEach(function (a) { if (!SIM.R.activity[a]) SIM.activity({ id: a, indoor: a !== 'WORK' }); });
  if (V.calendar) SIM.calendar(V.calendar);
  (V.factions || []).forEach(function (f) { if (!SIM.R.faction[f.id]) SIM.faction(f); });
  (V.relations || []).forEach(function (r) { SIM.relation(r); });
  var nodes = [], edges = [], node = function (x, z) { nodes.push({ id: nodes.length, x: x, y: 0, z: z }); return nodes.length - 1; };
  V.settlements.forEach(function (Sd) {
    var s = Sd.id, x0 = Sd.x == null ? 0 : Sd.x, z0 = Sd.z == null ? 0 : Sd.z, X = S.towns[s] = { id: s, spec: Sd, places: [], actors: 0, herds: 0, works: [] };
    var K = Sd.scale == null ? KV : Sd.scale;   /* X1: the settlement's own scale */
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
      if (Wk.site && Wk.site.veins) {   /* X2: a field of veins, worked one at a time */
        var Sv = Wk.site, vids = Sv.veins.map(function (v, i) { var vid = Wk.id + '.vein' + i;
          SIM.site({ id: vid, settlement: s, kind: Sv.kind || Wk.kind, goods: Sv.goods || Wk.out, grade: v.grade == null ? Sv.grade : v.grade, yield: Sv.yield, amount: v.amount });
          return vid; });
        R.site = vids[0]; S.veinWorks.push({ work: Wk.id, settlement: s, veins: vids, at: 0 });
      } else if (Wk.site) {   /* X1: the work draws on a resource site of its settlement */
        var St = Wk.site, sid = St.id || Wk.id + '.site';
        SIM.site({ id: sid, settlement: s, kind: St.kind || Wk.kind, goods: St.goods || Wk.out, grade: St.grade, yield: St.yield, amount: St.amount, regen: St.regen, capacity: St.capacity });
        R.site = sid; }
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
    var ids = Rd.stops || [Rd.from, Rd.to], miss = ids.filter(function (k) { return !S.towns[k]; });
    if (miss.length) { S.problems.push('road ' + Rd.id + ': no settlement ' + miss[0]); return; }
    SIM.trade({ id: Rd.id, stops: ids.map(function (k) { return { settlement: k, place: S.towns[k].spec.works[0].id }; }), cap: Rd.cap, carriers: Rd.carriers,
      minutes: Rd.minutes, stagger: Rd.stagger, mins: Rd.mins == null ? 60 : Rd.mins, goods: Rd.goods, expect: Rd.expect, share: Rd.share, keep: Rd.keep, want: Rd.want, most: Rd.most,
      legs: Rd.legs, provision: Rd.provision, halts: Rd.halts, sells: Rd.sells, forHalts: Rd.forHalts, closed: Rd.closed });
  });
  /* C4-C5: a caravan's losses on the way, as data: on a road's leg (from stop `leg`), of every `every` passages a carrier
     makes, `spare` cross whole and the others lose `share` of the beasts (deterministic, by the carrier's count of
     passages of the loss's legs); `window` limits it to a season. S.losses[road] = [{carrier, leg, dead, why, minute}] */
  var LOSS = (V.roads || []).filter(function (Rd) { return Rd.losses && Rd.losses.length && SIM.TRADE && SIM.TRADE.routes[Rd.id] && SIM.TRADE.routes[Rd.id].provision; });
  S.losses = {}; LOSS.forEach(function (Rd) { S.losses[Rd.id] = []; });
  if (LOSS.length) SIM.stepHooks.push(function (minute) {
    LOSS.forEach(function (Rd) { var TR = SIM.TRADE.routes[Rd.id];
      TR.carriers.forEach(function (Cr) { if (Cr.phase !== 'sail' || Cr.from == null) return; var mark = Cr.from + '@' + Cr.eta;
        if (Cr._lossSeen === mark) return; Cr._lossSeen = mark;
        Rd.losses.forEach(function (Ls) { if (Ls.legs.indexOf(Cr.from) < 0) return; if (Ls.window && !(SIM.inSeason && SIM.inSeason(Ls.window, minute))) return;
          var cnt = Cr._lossN || (Cr._lossN = {}), key = Ls.why, n = cnt[key] = (cnt[key] || 0) + 1, every = Ls.every || 1, spare = Ls.spare || 0;   /* counted over every leg of its kind */
          if ((n - 1) % every < spare || Cr.beasts <= 0) return;
          var dead = Math.max(1, Math.round(Cr.beasts * Ls.share)); Cr.beasts -= dead; TR.died += dead;
          S.losses[Rd.id].push({ carrier: Cr.k, leg: Cr.from, dead: dead, why: Ls.why, minute: minute });
          SIM.logEvent('caravan loss', { route: Rd.id, carrier: Cr.k, leg: Cr.from, dead: dead, why: Ls.why }); }); }); });
  });
  /* C5: a well run down in a season: a site's nightly regen times `regen` while `window` is open (an oasis found dry) */
  var SS = (V.siteSeasons || []).map(function (q) { var E = SIM.econ(q.settlement), st = E && E.resSites && E.resSites[q.site]; return st ? { q: q, st: st, base: st.regen } : null; }).filter(Boolean);
  if (SS.length) SIM.stepHooks.push(function (minute) {
    SS.forEach(function (o) { o.st.regen = SIM.inSeason && SIM.inSeason(o.q.window, minute) ? o.base * o.q.regen : o.base; }); });
  (V.transfers || []).forEach(function (Tr) { SIM.transfer(Tr); });
  /* X2: the cuts: what a road landed at a stop since the last hour, a share of it moved on */
  var CUTS = (V.roads || []).filter(function (Rd) { return Rd.cut && Rd.cut.length && SIM.TRADE && SIM.TRADE.routes[Rd.id]; });
  CUTS.forEach(function (Rd) { S.cuts[Rd.id] = { taken: {}, seen: {} }; });
  if (CUTS.length) SIM.stepHooks.push(function () {
    CUTS.forEach(function (Rd) { var L = SIM.TRADE.routes[Rd.id].landed, Cx = S.cuts[Rd.id];
      Rd.cut.forEach(function (c, ci) { if (!S.towns[c.at] || !S.towns[c.to]) return;
        Object.keys(L).sort().forEach(function (leg) { if (leg.split('>')[1] !== c.at) return; var got = L[leg];
          Object.keys(got).sort().forEach(function (g) { if (c.goods && c.goods.indexOf(g) < 0) return;
            var k = ci + '|' + leg + '|' + g, d = (got[g] || 0) - (Cx.seen[k] || 0); if (d <= 0) return; Cx.seen[k] = got[g];
            var owe = (Cx.carry && Cx.carry[k] || 0) + d * c.share, n = Math.floor(owe); (Cx.carry || (Cx.carry = {}))[k] = owe - n; if (n <= 0) return;
            var took = 0; SIM.withEcon(c.at, function () { took = SIM.economyTake(g, n); if (took > 0) SIM.economyBook('exported', g, took); });
            if (took <= 0) return;
            SIM.withEcon(c.to, function () { SIM.economyLand(g, took, S.towns[c.to].spec.works[0].id); SIM.economyBook('imported', g, took); });
            Cx.taken[c.to + ':' + g] = (Cx.taken[c.to + ':' + g] || 0) + took; }); }); }); });
  });
  /* X2: a vein run dry moves its work to the next vein of its field */
  if (S.veinWorks.length) SIM.stepHooks.push(function (minute) {
    S.veinWorks.forEach(function (Vw) { if (Vw.at >= Vw.veins.length - 1) return; var E = SIM.econ(Vw.settlement), st = E && E.resSites && E.resSites[Vw.veins[Vw.at]];
      if (!st || st.amount == null || st.amount >= 1) return;
      Vw.at++; SIM.recipeSite(Vw.work, Vw.veins[Vw.at]); S.veinMoves.push({ minute: minute, work: Vw.work, from: Vw.veins[Vw.at - 1], to: Vw.veins[Vw.at] }); });
  });
  /* the herds to their summer pasture and home again (77-sim-6-season.js: the window's turn) */
  if (SIM.onSeason) SIM.onSeason(function (now, before, minute) {
    S.order.forEach(function (s) { S.towns[s].works.forEach(function (w) { if (!w.pasture) return; var on = !!now.windows[w.window], was = !!before.windows[w.window]; if (on === was) return;
      SIM.all('actor').forEach(function (a) { if (a.herd === (on ? w.id : w.pasture)) a.herd = on ? w.pasture : w.id; });
      S.moves.push({ minute: minute, settlement: s, herd: w.id, to: on ? w.pasture : w.id }); }); });
  });
  /* each settlement's people eat from its warehouses, every hour of the clock, whatever their work */
  SIM.stepHooks.push(function (minute) {
    var hrs = (minute - S.last) / 60; if (hrs <= 0) return; S.last = minute;
    S.order.forEach(function (s) { var Sd = S.towns[s].spec, E = Sd.eats || {};
      Object.keys(E).sort().forEach(function (g) { var c = (S.carry[s][g] || 0) + Sd.people * E[g] * hrs / 24, n = Math.floor(c); S.carry[s][g] = c - n; if (n <= 0) return;
        var got = SIM.supply(g, n, false, s); S.eaten[s][g] = (S.eaten[s][g] || 0) + got; if (got < n) S.hungry[s][g] = (S.hungry[s][g] || 0) + n - got; }); });
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
      used: Object.assign({}, E.used), short: Object.assign({}, E.short), eaten: Object.assign({}, S.eaten[s]), hungry: Object.assign({}, S.hungry[s]) }; });
  return out;
};
});
