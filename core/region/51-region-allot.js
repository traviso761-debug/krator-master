/* ==================== core/region 51: the Allotment, a command economy's plan (Z1-Z2) [G data] ==================== */
/* core/simulation/PROPOSAL-LIZARDMEN.md sections 3-4 (the owner, 2026-11-16: "a command economy directly moving goods and
   agents with little concern for 'profit' as such"; the Coil Rounds endorsed). OPT-IN: inert unless the valley spec has
   `allot` (core/region/data/lz-tune.js LZ_TUNE.valley({allot: true})); every other tune runs exactly as before.

   SIM.trade's carriers buy what the far end wants and never send what the sender is short of. The Allotment is the other
   way round: at each quarter-day (`every` days) the planners sum every place's stock, what it will make and use over the
   season ahead, and its reserve, and ISSUE loads, from where the plan says to where it says, the heaviest need first:
     V.allot = {every (days), horizon (days the plan looks ahead), reserve (days of its use a place keeps), deep (the share of
       its stock a place whose need weighs less may be told to send from below its reserve), kmDay (a drove's day), hold
       (days a load waits at each stop it passes), weight: {place: n} (whose need weighs more), goods: [...] (what the plan
       moves), sinks: {good: true} (a place's whole stock of it goes to the place's `sink`: the relics to the reliquaries),
       coil: {hub, loops: {name: [place, ...]}, seasons: [...], dir: {season: 'outward'|'inward'}},
       gifts: [{id, kind, holder, dir}] (Z2), moves: false (the plan reckons but sends nothing: the negative)}
     each settlement's `plan`: {make: {good: a year}, use: {good: a year}} (what it is known to make and use: the Interpreters
       plan from what they remember, not from a market's signals); `sink`: the place its sunk goods go to
   THE COIL (Z2). A load never goes straight: it rides its season's way round its loop (outward: forward, away from the hub;
   inward: back), stopping `hold` days at each stop; a load for the other loop rides to the hub first, then out round the
   other loop. Its time on the road is its legs' length at `kmDay` and its holds. The gifts go round the whole coil (the west
   loop, then the east) each way once a year, bronze outward and bone inward, each held at every stop; a place a bronze gift
   reaches owes bone back to the place it came from (the memory debt), settled when a bone gift passes back.
   RECORDS (plain data by id: the Godot rule): S.allot.loads [{id, season, turn, good, from, to, qty, by, via, deep, leave, arrive,
   landed}], S.allot.turns [{turn, season, minute, loads}], S.allot.gifts [{id, kind, holder, dir, at, since}], S.allot.giftLog
   [{gift, from, to, minute}], S.allot.debts [{id, from, to, kind, coil, settled}].
   The books: a load is booked exported where it leaves and imported where it lands (the ledger's abroad flows), and
   H.allotCheck() holds the plan to itself: taken = landed + on the road, by good. Deterministic: no draws. */
KREGION.part('51-region-allot', function (H) {
var base = H.simValley;
H.simValley = function (V) {
  var S = base(V);
  if (V.allot) H.allotInit(V, S);
  return S;
};
/* the stops a load passes from a to b in a season's direction (the Coil), a and b included */
H.allotRoute = function (C, a, b, dir) {
  if (a === b) return [a];
  var loopOf = function (x) { var out = []; Object.keys(C.loops).sort().forEach(function (k) { if (C.loops[k].indexOf(x) >= 0) out.push(k); }); return out; };
  var walk = function (L, from, to, step) { var n = L.length, i = L.indexOf(from), out = [from], k = 0; while (L[i] !== to && k++ < n) { i = (i + step + n) % n; out.push(L[i]); } return L[i] === to ? out : null; };
  var la = loopOf(a), lb = loopOf(b), step = dir === 'inward' ? -1 : 1, share = la.filter(function (k) { return lb.indexOf(k) >= 0; });
  if (share.length) return walk(C.loops[share[0]], a, b, step);
  var first = walk(C.loops[la[0]], a, C.hub, step), second = walk(C.loops[lb[0]], C.hub, b, 1);
  return first && second ? first.concat(second.slice(1)) : null;
};
H.allotInit = function (V, S) {
  var A = V.allot, C = A.coil, every = (A.every == null ? 91.25 : A.every) * 1440, m0 = S.clock.m;
  var R = S.allot = { loads: [], turns: [], gifts: [], giftLog: [], debts: [], taken: {}, landed: {}, problems: [] };
  var spec = {}; V.settlements.forEach(function (Sd) { spec[Sd.id] = Sd; });
  var placed = V.settlements.filter(function (Sd) { return Sd.plan; }).map(function (Sd) { return Sd.id; });
  var stock = function (g, s) { return SIM.withEcon(s, function () { return SIM.stockOf(g); }); };
  var weight = function (s) { var w = (A.weight || {})[s]; return w == null ? 1 : w; };
  var dist = function (a, b) { var p = spec[a], q = spec[b]; return Math.hypot(p.x - q.x, p.z - q.z); };
  var onRoad = function (g, to) { var n = 0; R.loads.forEach(function (L) { if (!L.landed && L.good === g && L.to === to) n += L.qty; }); return n; };
  var next = m0 + 60, turn = 0, id = 0;
  /* issue one load: take it from the sender now, put it on the road */
  var issue = function (season, g, from, to, qty, deep, minute) {
    var via = H.allotRoute(C, from, to, C.dir[season]);
    if (!via) { R.problems.push('no Coil route ' + from + ' > ' + to); return null; }
    var took = 0; if (A.moves === false) return null;
    SIM.withEcon(from, function () { took = SIM.economyTake(g, Math.floor(qty)); if (took > 0) SIM.economyBook('exported', g, took); });
    if (took <= 0) return null;
    var km = 0; for (var i = 1; i < via.length; i++) km += dist(via[i - 1], via[i]) / 1000;
    var days = km / (A.kmDay == null ? 20 : A.kmDay) + (A.hold == null ? 1 : A.hold) * Math.max(0, via.length - 2);
    var L = { id: 'allot.' + turn + '.' + (id++), season: season, turn: turn, good: g, from: from, to: to, qty: took, by: 'drovers', via: via, deep: !!deep,
      km: Math.round(km), leave: minute, arrive: minute + Math.ceil(days * 1440), landed: false };
    R.loads.push(L); R.taken[g] = (R.taken[g] || 0) + took;
    return L;
  };
  /* the plan for one good at a quarter-day */
  var planGood = function (season, g, minute) {
    var H0 = (A.horizon == null ? 91.25 : A.horizon) / 365, res = (A.reserve == null ? 60 : A.reserve) / 365, bal = {}, have = {};
    placed.forEach(function (s) { var P = spec[s].plan, mk = (P.make[g] || 0), us = (P.use[g] || 0); if (!mk && !us && !stock(g, s)) return;
      have[s] = stock(g, s); bal[s] = have[s] + onRoad(g, s) + (mk - us) * H0 - us * res; });
    var need = Object.keys(bal).filter(function (s) { return bal[s] < -1; }).sort(function (a, b) { return weight(b) - weight(a) || bal[a] - bal[b] || (a < b ? -1 : 1); });
    var left = {}; Object.keys(bal).forEach(function (s) { left[s] = Math.max(0, Math.min(have[s], bal[s])); });
    var given = {};
    need.forEach(function (d) { var want = -bal[d];
      Object.keys(left).filter(function (s) { return s !== d && left[s] > 0; }).sort(function (a, b) { return left[b] - left[a] || (a < b ? -1 : 1); }).forEach(function (s) {
        if (want <= 0) return; var q = Math.min(want, left[s]); left[s] -= q; want -= q; given[s] = (given[s] || 0) + q; issue(season, g, s, d, q, false, minute); });
      /* the plan sends from below a lighter place's reserve when a heavier need would still go short */
      if (want > 1 && A.deep) Object.keys(bal).filter(function (s) { return s !== d && weight(s) < weight(d) && bal[s] < 1; })
        .sort(function (a, b) { return weight(a) - weight(b) || (a < b ? -1 : 1); }).forEach(function (s) {
          if (want <= 0) return; var room = have[s] * A.deep - (given[s] || 0); if (room <= 1) return;
          var q = Math.min(want, room); want -= q; given[s] = (given[s] || 0) + q; issue(season, g, s, d, q, true, minute); }); });
  };
  /* a place's whole stock of a sunk good to its sink (the relics to the cluster's reliquary) */
  var sink = function (season, g, minute) {
    placed.concat(V.settlements.filter(function (Sd) { return Sd.sink && !Sd.plan; }).map(function (Sd) { return Sd.id; })).forEach(function (s) {
      var to = spec[s].sink; if (!to || to === s) return; var n = stock(g, s); if (n >= 1) issue(season, g, s, to, n, false, minute); });
  };
  /* Z2: the gifts on the whole coil, the west loop then the east */
  var cycle = []; Object.keys(C.loops).sort().reverse().forEach(function (k) { cycle = cycle.concat(C.loops[k]); });
  var giftEvery = Math.floor(365 * 1440 / cycle.length), nextGift = m0 + giftEvery, coilN = 0;
  (A.gifts || []).forEach(function (Gf) { R.gifts.push({ id: Gf.id, kind: Gf.kind, holder: Gf.holder, dir: Gf.dir, at: cycle.indexOf(Gf.holder), since: m0, home: cycle.indexOf(Gf.holder), laps: 0 }); });
  SIM.stepHooks.push(function (minute) {
    /* land what has arrived */
    R.loads.forEach(function (L) { if (L.landed || L.arrive > minute) return; L.landed = true;
      SIM.withEcon(L.to, function () { SIM.economyLand(L.good, L.qty, spec[L.to].works[0].id); SIM.economyBook('imported', L.good, L.qty); });
      R.landed[L.good] = (R.landed[L.good] || 0) + L.qty; });
    /* the quarter-day: the plan */
    if (minute >= next) { var season = C.seasons[turn % C.seasons.length], n0 = R.loads.length;
      (A.goods || []).forEach(function (g) { planGood(season, g, minute); });
      Object.keys(A.sinks || {}).forEach(function (g) { sink(season, g, minute); });
      R.turns.push({ turn: turn, season: season, minute: minute, loads: R.loads.length - n0 }); turn++; next += every; }
    /* the gifts: one stop on, each its way round */
    if (R.gifts.length && minute >= nextGift) { nextGift += giftEvery;
      R.gifts.forEach(function (Gf) { var from = cycle[Gf.at], i = (Gf.at + (Gf.dir === 'inward' ? -1 : 1) + cycle.length) % cycle.length, to = cycle[i];
        Gf.at = i; Gf.holder = to; Gf.since = minute; if (i === Gf.home) Gf.laps++;
        R.giftLog.push({ gift: Gf.id, kind: Gf.kind, from: from, to: to, minute: minute });
        if (from === to) return;
        if (Gf.kind === 'bronze') R.debts.push({ id: 'debt.' + R.debts.length, from: to, to: from, kind: 'bone', coil: coilN, settled: false });
        else { var Dt = R.debts.find(function (d) { return !d.settled && d.from === from && d.to === to; }); if (Dt) Dt.settled = minute; } });
      if (R.giftLog.length % cycle.length === 0) coilN++; }
  });
};
/* the plan held to itself: what it took is what it landed and what is still on the road, good by good; no load straight */
H.allotCheck = function () {
  var R = H.SIM && H.SIM.allot, out = { ok: true, problems: [] }; if (!R) return { ok: false, problems: ['no Allotment on this valley'] };
  var road = {}; R.loads.forEach(function (L) { if (!L.landed) road[L.good] = (road[L.good] || 0) + L.qty; });
  Object.keys(R.taken).forEach(function (g) { var d = R.taken[g] - (R.landed[g] || 0) - (road[g] || 0); if (Math.abs(d) > 0.5) { out.ok = false; out.problems.push(g + ': ' + d + ' unaccounted'); } });
  R.loads.forEach(function (L) { if (!L.via || L.via[0] !== L.from || L.via[L.via.length - 1] !== L.to) { out.ok = false; out.problems.push(L.id + ': bad route'); } });
  out.problems = out.problems.concat(R.problems); if (R.problems.length) out.ok = false;
  return out;
};
});
