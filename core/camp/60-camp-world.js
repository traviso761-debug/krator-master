/* ==================== core/camp 60: the world tick and the hand-over (C3, C4; S6) [G data] ==================== */
/* core/camp/PLAN.md sections 5 and 7; core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S6 (the owner, 2026-11-11). The
   bands nobody is watching live here, at the WORLD level, one day at a time: they eat (their people and, by
   50-camp-beasts.js, their beasts), hunt, gather, graze and keep their herds at the site they are camped on, strike camp
   when the site is spent, come home for their home season and leave it again, and go on ventures (65: caravans; 66:
   raids). At home a band is handed over to the sim (C4): its stock lands in its SIM.settlement's books, and its people
   and works run there; leaving, the settlement's books fold back into the band's stock. Every decision is an op in the
   log; between ops a band's place is a pure function of the minute (KCAMP.at). Plain data and pure functions of the
   records: no three.js, no DOM, no SIM.rng (every choice is KRAND.hash(world, band, day, salt)).
     KCAMP.world(o) -> W   o: {world (seed), cal: {yearD (365), home: [from, to] year days (the home season; wrapping)},
                           beasts (a culture's beast table, 50), rules (the band rules, below), host (the sim's adapter,
                           below; null: no hand-over), graph (KTRAVEL.graph, or null), place: {id: {x, z, name}} (the
                           markets', targets' and homes' points), sites: [SITE], bands: [BAND], ventures: (65, 66 add)}
     KCAMP.tick(W, day)    one world day for every band not handed over (and the hand-overs themselves)
     KCAMP.run(W, d0, d1)  the days d0 .. d1-1
     KCAMP.at(W, id, minute) -> {x, z, state, site, heading}   where a band is, pure of the records
     KCAMP.books(W, id) -> {opening, made, imported, exported, consumed, lost, closing, residual} by good: the identity
                           made + imported - exported - consumed - lost = closing - opening, across every hand-over
     KCAMP.travel(W, from, to, pace) -> {minutes, length_m, planned, path}   by the plans' links (KTRAVEL), else across
                           country on the straight line (x the rules' `detour`), marked planned
   SITE {id, band (whose range), x, z, kind: 'jungle' | 'savanna' | ..., cap: {good: amount when whole}, regrow (days to
        grow back whole), left: {good: amount at lastLeft}, lastLeft (day)}: what is there on day d is a pure function of
        what was left and the days since (the hamlet felling rule); `taken` while a band is on it
   BAND {id, tribe, home: {settlement (the sim's id), site, x, z}, people, warriors, beasts: {kind: n}, roles: {hunter,
        gatherer, herder}, stock: {good: n}, range: [site ids], at, state, leg, venture, last (the site it last left),
        loaded, books}
   RULES {diet: {good: kg a person a day} (the people's food, taken in that order, any food standing in for another by
         its `food` value), food: {good: grain-equivalent of a kg}, hunt: {meat, hides} (a hunter-day's take when the
         game is there), spoil: {good: share a day} (what spoils in the packs, booked lost), selfHunt (the share of its own meat a meat-eating mount takes itself, hunting beside its rider), gather: {fruit} (a gatherer-day's), minDays (a site is struck when it holds fewer days of the
         band's take than this), cross (pace factor across country, off the links), detour (the straight line's
         stretch), siteKm (a move inside the range: km), keep: {good: days} (what a band keeps of its own use when it
         lands its stock at home; the rest is the town's to trade for)}
   THE HOST (C4) {land(settlement, {good: n}) -> {good: landed}, take(settlement, keep {good: n}) -> {good: n} (everything
         above keep), away(settlement, bool), people(settlement), stock(settlement, g), raid(settlement, {good: n}) (66)}:
         core/region's valley gives one (H.valleyHost). */
KCAMP.world = function (o) {
  var W = { world: o.world == null ? 1 : o.world, cal: Object.assign({ yearD: 365 }, o.cal || {}), beasts: o.beasts, rules: o.rules, host: o.host || null,
    graph: o.graph || null, place: o.place || {}, sites: {}, bands: {}, order: [], ops: [], day: null, ventures: o.ventures || {}, assign: o.assign || null, dayHooks: o.dayHooks || [], log: [] };
  (o.sites || []).forEach(function (S) { W.sites[S.id] = Object.assign({ left: Object.assign({}, S.cap), lastLeft: -1e9, taken: null }, S); });
  (o.bands || []).forEach(function (B) {
    var b = W.bands[B.id] = Object.assign({ stock: {}, at: null, state: 'home', leg: null, venture: null, last: null, loaded: false }, B);
    if (b.at == null && b.state === 'home') b.at = b.home.settlement;
    b.books = { opening: Object.assign({}, b.stock), made: {}, imported: {}, exported: {}, consumed: {}, lost: {}, short: {} };
    W.order.push(B.id);
  });
  W.order.sort();
  return W;
};
/* a hash of a seed and any parts, strings named through KRAND.child (KRAND.hash floors its arguments: a string would be 0) */
KCAMP.hashOf = function (seed) { var h = seed >>> 0; for (var i = 1; i < arguments.length; i++) { var p = arguments[i]; h = typeof p === 'string' ? KRAND.child(h, p) : KRAND.hash(h, p); } return h >>> 0; };
KCAMP.u = function () { return KRAND.unit(KCAMP.hashOf.apply(null, arguments)); };
KCAMP.op = function (W, day, who, what, args) { var op = { id: W.ops.length, day: day, minute: day * 1440, who: who, what: what, args: args || {} }; W.ops.push(op); return op; };
function kcAdd(o, g, n) { o[g] = (o[g] || 0) + n; }
KCAMP.bookIn = function (b, kind, goods) { Object.keys(goods).forEach(function (g) { var n = goods[g]; if (!(n > 0)) return; kcAdd(b.books[kind], g, n); kcAdd(b.stock, g, n); }); };
KCAMP.bookOut = function (b, kind, goods) {   /* takes what there is; returns what was taken */
  var got = {}; Object.keys(goods).forEach(function (g) { var n = Math.min(goods[g], b.stock[g] || 0); if (!(n > 0)) return; b.stock[g] -= n; kcAdd(b.books[kind], g, n); got[g] = n; }); return got; };
/* the season: is day d in the band's home window? */
KCAMP.inHome = function (W, d) { var H = W.cal.home; if (!H) return false; var yd = ((d % W.cal.yearD) + W.cal.yearD) % W.cal.yearD; return H[0] <= H[1] ? yd >= H[0] && yd < H[1] : yd >= H[0] || yd < H[1]; };
KCAMP.daysToHomeEnd = function (W, d) { var H = W.cal.home, yd = ((d % W.cal.yearD) + W.cal.yearD) % W.cal.yearD; return ((H[1] - yd) % W.cal.yearD + W.cal.yearD) % W.cal.yearD; };
KCAMP.daysToHome = function (W, d) { var H = W.cal.home, yd = ((d % W.cal.yearD) + W.cal.yearD) % W.cal.yearD; return ((H[0] - yd) % W.cal.yearD + W.cal.yearD) % W.cal.yearD; };
/* what a site holds on day d: grown back from what was left, linearly over `regrow` days, to its cap */
KCAMP.siteHas = function (S, d) {
  var out = {}; Object.keys(S.cap).forEach(function (g) {
    var base = S.taken ? S.taken.left[g] : S.left[g], since = S.taken ? 0 : d - S.lastLeft;
    out[g] = Math.min(S.cap[g], base + S.cap[g] * Math.max(0, since) / S.regrow); });
  return out;
};
function kcPoint(W, id) { var S = W.sites[id]; if (S) return S; var P = W.place[id]; if (P) return P; var B = W.bands[id]; if (B && B.home) return B.home; if (W.graph && W.graph.nodes[id]) return W.graph.nodes[id]; return null; }
KCAMP.travel = function (W, from, to, pace) {
  var R = W.rules, G = W.graph;
  if (G && G.nodes[from] && G.nodes[to] && typeof KTRAVEL !== 'undefined') { var P = KTRAVEL.path(G, from, to, pace); if (P) return { minutes: P.minutes, length_m: P.length_m, planned: P.legs.some(function (l) { return l.planned; }), path: P }; }
  var a = kcPoint(W, from), b = kcPoint(W, to); if (!a || !b) return null;
  var m = Math.hypot(b.x - a.x, b.z - a.z) * (R.detour == null ? 1.3 : R.detour), kmDay = pace.kmDay * (R.cross == null ? 0.7 : R.cross);
  var days = m / 1000 / kmDay; return { minutes: Math.floor(days) * 1440 + (days % 1) * pace.hours * 60, length_m: m, planned: true, path: null };
};
KCAMP.bandPace = function (W, b) { var p = KCAMP.pace(W.beasts, b.beasts); return { kmDay: p == null ? 25 : p, hours: W.rules.hours == null ? 8 : W.rules.hours }; };
/* the band's take a day at a site: its hunters' and gatherers' work, its herd's offtake, its grazers' fodder */
KCAMP.dayNeeds = function (W, b) {
  var R = W.rules, out = {}, N = KCAMP.beastNeeds(W.beasts, b.beasts);
  Object.keys(R.diet).forEach(function (g) { kcAdd(out, g, R.diet[g] * b.people); });
  Object.keys(N).forEach(function (g) { kcAdd(out, g, N[g]); });
  return out;
};
/* one day's eating: the people's food by the diet, any food for another by its value; the beasts' meat, then fodder */
KCAMP.eat = function (W, b, d) {
  var R = W.rules, F = R.food || {}, need = 0, short = 0;
  Object.keys(R.diet).forEach(function (g) { need += R.diet[g] * b.people * (F[g] || 1); });
  Object.keys(R.diet).concat(Object.keys(F)).filter(function (g, i, a) { return a.indexOf(g) === i; }).forEach(function (g) {
    if (need <= 1e-9) return; var v = F[g] || 1, want = g in R.diet ? Math.min(R.diet[g] * b.people, need / v) : need / v;
    var got = KCAMP.bookOut(b, 'consumed', { [g]: want })[g] || 0; need -= got * v; });
  Object.keys(F).sort().forEach(function (g) { if (need <= 1e-9) return; var got = KCAMP.bookOut(b, 'consumed', { [g]: need / (F[g] || 1) })[g] || 0; need -= got * (F[g] || 1); });   /* any food for another */
  if (need > 1e-6) { kcAdd(b.books.short, 'food', need); short += need; }
  var N = KCAMP.beastNeeds(W.beasts, b.beasts);
  Object.keys(N).sort().forEach(function (g) { var got = KCAMP.bookOut(b, 'consumed', { [g]: N[g] })[g] || 0; if (got < N[g] - 1e-6) kcAdd(b.books.short, 'beast:' + g, N[g] - got); });
  return short;
};
/* the day's take where the band is: `k` 1 camped, less on the march; the grazers' fodder is made where they stand */
KCAMP.forage = function (W, b, d, k, S) {
  var R = W.rules, ro = b.roles || {}, made = {}, want = {}, T = W.beasts;
  kcAdd(want, 'meat', ro.hunter * R.hunt.meat * k); kcAdd(want, 'hides', ro.hunter * R.hunt.hides * k);
  kcAdd(want, 'fruit', ro.gatherer * R.gather.fruit * k);
  var N = KCAMP.beastNeeds(T, b.beasts); if (N.fodder) kcAdd(want, 'fodder', N.fodder);
  if (N.meat && R.selfHunt) kcAdd(want, 'meat', N.meat * R.selfHunt * k);   /* the meat-eating mounts hunt beside their riders */
  var have = S ? KCAMP.siteHas(S, d) : null;
  Object.keys(want).forEach(function (g) {
    var n = want[g]; if (have && have[g] != null) { n = Math.min(n, have[g]); have[g] -= n; S.taken.left[g] = have[g]; }
    else if (!S && g === 'fodder') n *= (R.roadside == null ? 1 : R.roadside);
    if (n > 0) made[g] = n; });
  var H = T.herd && b.beasts[T.herd.kind], row = H && T.rows[T.herd.kind];
  if (H && row.offtake) kcAdd(made, 'meat', H * row.offtake);
  KCAMP.bookIn(b, 'made', made);
  return made;
};
/* the move rule inside the range: the best site by what it holds over its distance; never the one just left; a hash
   breaks a tie, so two bands with the same scores choose differently and a replay the same */
KCAMP.nextSite = function (W, b, d) {
  var cur = kcPoint(W, b.at) || b.home, need = KCAMP.dayNeeds(W, b), best = null, bs = -1;
  b.range.forEach(function (id, i) {
    if (id === b.at || id === b.last) return; var S = W.sites[id], h = KCAMP.siteHas(S, d), days = Infinity;
    ['meat', 'fodder', 'fruit'].forEach(function (g) { if (need[g] > 0 && S.cap[g] != null) days = Math.min(days, h[g] / need[g]); });
    if (days === Infinity) days = 0;
    var km = Math.hypot(S.x - cur.x, S.z - cur.z) / 1000, s = days / (1 + km / (W.rules.siteKm || 15)) * (1 + 0.05 * KCAMP.u(W.world, b.id, d, i, 'site'));
    if (s > bs) { bs = s; best = id; } });
  return best;
};
function kcLeave(W, b, d) {   /* strike the site the band is on: its take is left to grow back from today */
  var S = b.at && W.sites[b.at]; if (S && S.taken) { S.left = S.taken.left; S.lastLeft = d; S.taken = null; } b.last = b.at; }
function kcPitch(W, b, id, d) { var S = W.sites[id]; b.at = id; b.state = 'camped'; b.leg = null; if (S) { S.left = KCAMP.siteHas(S, d); S.lastLeft = d; S.taken = { band: b.id, left: Object.assign({}, S.left) }; } KCAMP.op(W, d, b.id, 'pitch', { site: id }); }
KCAMP.march = function (W, b, to, d, why) {
  var from = b.at || b.home.settlement, pace = KCAMP.bandPace(W, b), Tr = KCAMP.travel(W, from, to, pace);
  kcLeave(W, b, d); KCAMP.op(W, d, b.id, 'strike', { site: from });
  var days = Math.max(1, Math.ceil((Tr ? Tr.minutes : 1440) / 1440));
  b.state = 'march'; b.leg = { from: from, to: to, d0: d, d1: d + days, length_m: Tr ? Tr.length_m : 0, planned: Tr ? Tr.planned : true, why: why || 'move' }; b.at = null;
  KCAMP.op(W, d, b.id, 'march', { from: from, to: to, d0: d, d1: d + days, km: Tr ? Math.round(Tr.length_m / 100) / 10 : 0, planned: Tr ? Tr.planned : true, why: why || 'move' });
  return b.leg;
};
/* C4: home. The band's stock lands in its settlement's books (less what it keeps for its own use on the way out: none,
   it eats the town's store at home); leaving, everything above the town's share comes back out with it */
KCAMP.load = function (W, b, d) {
  b.state = 'home'; b.at = b.home.settlement; b.leg = null; b.loaded = true;
  if (W.host) { var landed = W.host.land(b.home.settlement, b.stock); KCAMP.bookOut(b, 'exported', landed); W.host.away(b.home.settlement, false); }
  KCAMP.op(W, d, b.id, 'load', { settlement: b.home.settlement });
};
KCAMP.unload = function (W, b, d) {
  if (W.host) { var got = W.host.take(b.home.settlement, b); KCAMP.bookIn(b, 'imported', got); W.host.away(b.home.settlement, true); }
  b.loaded = false; KCAMP.op(W, d, b.id, 'unload', { settlement: b.home.settlement });
};
function kcBusy(b) { return !!(b.venture && b.venture.busy); }
function kcHomeward(b) { return !!(b.leg && b.leg.to === b.home.settlement); }
KCAMP.tick = function (W, d) {
  W.day = d;
  (W.dayHooks || []).forEach(function (fn) { fn(W, d); });
  W.order.forEach(function (id) {
    var b = W.bands[id], home = KCAMP.inHome(W, d);
    if (b.dead) return;
    /* arrivals */
    if (b.state === 'march' && d >= b.leg.d1) {
      var to = b.leg.to, why = b.leg.why, V = b.venture && W.ventures[b.venture.kind];
      if (to === b.home.settlement) { b.state = 'home'; b.at = to; b.leg = null; b.venture = null; KCAMP.op(W, d, b.id, 'arrive', { at: to, why: why }); }
      else if (W.sites[to]) { kcPitch(W, b, to, d);   /* back from a venture: another, if the dry season has a month (rules.again) left */
        if (why === 'return') { b.venture = null; b.trips = (b.trips || 0) + 1; if (!home && KCAMP.daysToHome(W, d) > (W.rules.again == null ? 1e9 : W.rules.again)) KCAMP.plan(W, b, d); } }
      else { b.state = 'venture'; b.at = to; b.leg = null; KCAMP.op(W, d, b.id, 'arrive', { at: to, why: why }); if (V && V.arrive) V.arrive(W, b, d, to); }
    }
    /* the home season: a loaded band lives in the sim; at its end it folds out and leaves */
    if (b.state === 'home') {
      if (home && !b.loaded) KCAMP.load(W, b, d);
      if (b.loaded && home) return;
      if (b.loaded && !home) { KCAMP.unload(W, b, d); b.trips = 0; KCAMP.plan(W, b, d); }
      else if (!b.loaded && !home && KCAMP.daysToHome(W, d) > 2) KCAMP.plan(W, b, d);
    }
    /* homeward, to be there when the home season opens */
    if (b.state !== 'home' && !kcHomeward(b) && !kcBusy(b) && b.state !== 'march') {
      var due = home ? 0 : KCAMP.daysToHome(W, d), Tr = KCAMP.travel(W, b.at, b.home.settlement, KCAMP.bandPace(W, b));
      if (home || due <= Math.ceil((Tr ? Tr.minutes : 0) / 1440) + 1) { b.venture = null; KCAMP.march(W, b, b.home.settlement, d, 'home'); }
    }
    /* the day's living, wherever the band is not handed over */
    var S = b.state === 'camped' ? W.sites[b.at] : null;
    KCAMP.forage(W, b, d, S ? 1 : (W.rules.marchHunt == null ? 0.4 : W.rules.marchHunt), S);
    KCAMP.eat(W, b, d);
    if (W.rules.spoil) Object.keys(W.rules.spoil).sort().forEach(function (g) { var n = (b.stock[g] || 0) * W.rules.spoil[g]; if (n > 0) KCAMP.bookOut(b, 'lost', { [g]: n }); });   /* what spoils in the packs (rules.spoil: a share a day) */
    var Vd = b.venture && W.ventures[b.venture.kind]; if (Vd && Vd.day) Vd.day(W, b, d);
    /* the move rule: the site is spent */
    if (b.state === 'camped' && S && !home) {
      var need = KCAMP.dayNeeds(W, b), h = KCAMP.siteHas(S, d), days = Infinity;
      ['meat', 'fodder', 'fruit'].forEach(function (g) { if (need[g] > 0 && S.cap[g] != null) days = Math.min(days, h[g] / need[g]); });
      if (days < (W.rules.minDays == null ? 3 : W.rules.minDays)) { var nx = KCAMP.nextSite(W, b, d); if (nx) KCAMP.march(W, b, nx, d, 'move'); }
    }
  });
};/* the dry season's plan: the world's `assign` (a culture's: which venture each band takes this year) names a kind and a
   destination; that kind's `plan` says whether it can be done before the home season (else null); otherwise the range */
KCAMP.plan = function (W, b, d) {
  var A = W.assign ? W.assign(W, b, d) : null, V = A && W.ventures[A.kind], pick = V && V.plan ? V.plan(W, b, d, A) : null;
  if (pick) { b.venture = pick; KCAMP.op(W, d, b.id, 'venture', { kind: pick.kind, to: pick.to }); KCAMP.march(W, b, pick.to, d, pick.kind); return pick; }
  var nx = KCAMP.nextSite(W, b, d); if (nx) KCAMP.march(W, b, nx, d, 'range');
  return null;
};
/* a venture's way back: to the site of the band's range nearest its home, to range there until the home season */
KCAMP.returnTo = function (W, b) {
  var h = b.home, best = null, bd = Infinity;
  b.range.forEach(function (id) { var S = W.sites[id], k = Math.hypot(S.x - h.x, S.z - h.z); if (k < bd) { bd = k; best = id; } });
  return best;
};
/* can a venture to `to` (working `work` days there) be done and the band back in its range before the home season? */
KCAMP.fits = function (W, b, d, to, work) {
  var pace = KCAMP.bandPace(W, b), there = KCAMP.travel(W, b.at || b.home.settlement, to, pace), back = there && KCAMP.travel(W, to, KCAMP.returnTo(W, b), pace);
  if (!there || !back) return null;
  var days = Math.ceil(there.minutes / 1440) + (work || 0) + Math.ceil(back.minutes / 1440), left = KCAMP.daysToHome(W, d);
  return days + 2 <= left ? { days: days, there: there, back: back } : null;
};KCAMP.run = function (W, d0, d1) { for (var d = d0; d < d1; d++) KCAMP.tick(W, d); return W; };
KCAMP.at = function (W, id, minute) {
  var b = W.bands[id]; if (!b) return null;
  if (b.state === 'march' && b.leg) { var a = kcPoint(W, b.leg.from), z = kcPoint(W, b.leg.to), t = Math.max(0, Math.min(1, (minute / 1440 - b.leg.d0) / (b.leg.d1 - b.leg.d0)));
    if (a && z) return { x: a.x + (z.x - a.x) * t, z: a.z + (z.z - a.z) * t, state: 'march', site: null, heading: Math.atan2(z.x - a.x, z.z - a.z) }; }
  var p = kcPoint(W, b.at) || b.home; return { x: p.x, z: p.z, state: b.state, site: b.at, heading: 0 };
};
KCAMP.books = function (W, id) {
  var b = W.bands[id], B = b.books, out = {}, goods = {};
  [B.opening, B.made, B.imported, B.exported, B.consumed, B.lost, b.stock].forEach(function (o) { Object.keys(o).forEach(function (g) { goods[g] = 1; }); });
  Object.keys(goods).sort().forEach(function (g) {
    var r = { opening: B.opening[g] || 0, made: B.made[g] || 0, imported: B.imported[g] || 0, exported: B.exported[g] || 0, consumed: B.consumed[g] || 0, lost: B.lost[g] || 0, closing: b.stock[g] || 0 };
    r.residual = r.opening + r.made + r.imported - r.exported - r.consumed - r.lost - r.closing; out[g] = r; });
  return out;
};
