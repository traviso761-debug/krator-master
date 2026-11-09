/* ============================== 7h6. REFUGEES (PLAN-POLITICS.md section 4, 2026-11-04) ============================== */
/* [G data] The owner (2026-11-04): "add a shipload of refugees once a week to see how things develop", tuned by
   ISLE.TUNE.sim.refugees (15). PLAN-POLITICS.md section 4: refugees go to a camp first, not into the city.
     ISLE.simRefugees()          after the towns, their building and money (40): each town's CAMP, a place of kind `camp` on
                                 the camp's ground of its plan (33 ISLE.campSite; out of doors, SLEEP and the rest for `cap`,
                                 a ration line: a mess, so its meals come from the town's warehouses), its purse (a mess's),
                                 and the ship's step hook
     ISLE.refugeeShip(minute)    a ship lands `people` (two grown-ups and three children a household of `per`), at the
                                 town whose turn it is (the next if its camp is full; none if all are): each set up as the
                                 census's people are (age, trait, meters, dressed), class `refugee`, `unhappy` points down
                                 at landing fading over `days`, home the camp
     ISLE.refugeeWaiting(s)      the camp's households not yet housed (core/simulation's building counts them as demand)
     ISLE.refugeeSettle(lot, s)  the camp's longest-waiting household moved into a finished house (its class now its
                                 street's, `poor`; the camp's unhappiness lifted, its purse opened) -> true, or false when
                                 the camp is empty (the town's own new household then: 47b)
     ISLE.refugeeBooks()         a snapshot: ships, landed, in the camps, housed, each camp's people, the refugees' pool
     ISLE.refugeeChecks(a, b)    every ship's people landed; every refugee in its town's camp or in a house of its town;
                                 each camp's count its people; the camps fed (their people's hunger under the vital line);
                                 the camps, the housed and the refugees' happiness (reported) */
ISLE.simRefugees = function () {
  var S = ISLE.SIM, K = ISLE.TUNE.sim.refugees; if (!K || !S.plans) return null;
  var out = { camps: {} };
  S.order.forEach(function (s) {
    var Pn = S.plans[s], site = Pn && Pn.R.camp; if (!site) return;
    var F = Pn.G.frame, h = Pn.G.h, w = { x: +(site.x + F.x).toFixed(2), y: +(h(site.x, site.z) + F.sea).toFixed(2), z: +(site.z + F.z).toFixed(2) }, cap = K.cap;
    var P = SIM.place({ id: s + '.camp', name: 'the refugee camp', kind: 'camp', x: w.x, y: w.y, z: w.z, door: site.door || { x: w.x, y: w.y, z: w.z },   /* its door on the walking graph (40) */
      activities: { SLEEP: cap, EAT: cap, REST: cap, IDLE: cap, HOUSEWORK: cap, SOCIALIZE: Math.ceil(cap / 4) }, indoor: {}, wander: site.size / 3, settlement: s,
      tags: { key: 'refugee camp', lot: null, tag: site.tag, trade: null, cls: 'refugee', district: 'outside the town', role: 'camp' } });
    P.mess = true; P.cls = 'refugee'; P.people = 0;
    if (SIM.MONEY && !SIM.acct('hh:' + P.id)) SIM.account({ id: 'hh:' + P.id, owner: P.id, kind: 'mess', currency: ISLE.currencyOf(s), settlement: s });
    out.camps[s] = P.id;
  });
  S.rf = { camps: out.camps, ships: [], n: 0, turned: 0 };   /* the camps' state (S.refugees is the declaration's summary: 40) */
  if (SIM.placesChanged) SIM.placesChanged();
  if (SIM.stepHooks.indexOf(ISLE.refugeeStep) < 0) SIM.stepHooks.push(ISLE.refugeeStep);
  return { camps: Object.keys(out.camps).length, every: K.every, people: K.people };
};
ISLE.refugeeStep = function (minute) {
  var K = ISLE.TUNE.sim.refugees, d = Math.floor(minute / 1440); if (!K) return;
  if (minute % 1440 === 0 && minute > 0) ISLE.tentDay(minute);
  if (minute % 1440 !== 6 * 60 || d < K.first || (d - K.first) % K.every) return;
  ISLE.refugeeShip(minute);
};
/* THE TENTS' DAY (midnight): everyone living in a tent (a home of kind `camp`, or one a host marks `tent`) carries the
   tent's unhappiness (refreshed, fading over two days); then each household in a tent `stay` days or more whose people's
   mean happiness is under `leave` moves on: they leave the isles (out of the sim), the camp's count and its builders' posts
   following (core's rebalance) */
ISLE.tentDay = function (minute) {
  var K = ISLE.TUNE.sim.refugees, Tn = K && K.tent, S = ISLE.SIM, R = S.rf; if (!Tn || !SIM.NEED) return;
  var tented = SIM.all('actor').filter(function (a) { var H = SIM.R.place[a.home]; return H && (H.kind === 'camp' || H.tent) && !a.driven; });
  tented.forEach(function (a) { a.hmods = (a.hmods || []).filter(function (x) { return x.why !== 'tent'; }); SIM.happinessAdd(a, Tn.n, 2, 'tent'); });
  var hh = {}; tented.forEach(function (a) { var k = a.refugee ? a.refugee.hh : a.crew ? a.crew.hh : null; if (k) (hh[k] || (hh[k] = [])).push(a); });
  Object.keys(hh).sort().forEach(function (k) {
    var L = hh[k], since = Math.min.apply(null, L.map(function (a) { return a.refugee ? a.refugee.landed : a.crew.since; })); if ((minute - since) / 1440 < Tn.stay) return;
    var mean = L.reduce(function (n, a) { var nd = SIM.needsOf(a, minute); return n + (SIM.happiness(a, nd) || 0); }, 0) / L.length; if (mean >= Tn.leave) return;
    var H = SIM.R.place[L[0].home], s = SIM.settlementOf(L[0]);
    L.forEach(function (a) { if (SIM.release) SIM.release(a); a.present = false; SIM.remove('actor', a.id); });
    H.people = Math.max(0, (H.people || 0) - L.length);
    if (R) { R.left = (R.left || 0) + L.length; (R.leftBy || (R.leftBy = {}))[s] = ((R.leftBy || {})[s] || 0) + L.length; }
    SIM.logEvent('moved on', { settlement: s, household: k, people: L.length, days: Math.round((minute - since) / 1440), happiness: Math.round(mean) });
  });
};
ISLE.refugeeShip = function (minute) {
  var S = ISLE.SIM, R = S.rf, K = ISLE.TUNE.sim.refugees, T = ISLE.TUNE.sim; if (!R) return null;
  var k = R.ships.length, towns = K.towns.filter(function (s) { return R.camps[s]; }), s = null;
  for (var i = 0; i < towns.length; i++) { var t = towns[(k + i) % towns.length], C = SIM.R.place[R.camps[t]]; if ((C.people || 0) + K.people <= K.cap) { s = t; break; } }
  var ship = { k: k, m: minute, settlement: s, people: s ? K.people : 0, turned: s ? 0 : K.people }; R.ships.push(ship);
  if (!s) { R.turned += K.people; SIM.logEvent('refugees turned away', { people: K.people }); return ship; }
  var camp = SIM.R.place[R.camps[s]], TS = null; Object.keys(T.towns).forEach(function (x) { if (T.towns[x].id === s) TS = T.towns[x]; });
  var kin = SIM.R.role[s + '.kin'] ? s + '.kin' : null, child = SIM.R.role[s + '.child'] ? s + '.child' : kin, NE = T.needs, A = T.ages;
  for (var j = 0; j < K.people; j++) {
    var grown = j % K.per < 2, a = SIM.actor({ id: TS.prefix + 'r' + (R.n++), role: grown ? kin : child, home: camp.id }), B0 = A.bands[grown ? 'adult' : 'child'];
    a.age = B0[0] + Math.floor(KRAND.unit(KRAND.hash(T.seed, 61, a.k)) * (B0[1] - B0[0] + 1)); a.ageBand = grown ? 'adult' : 'child'; a.status = grown ? 'home' : 'housework';
    a.cls = 'refugee'; a.wealth = 0; a.job = null; a.refugee = { ship: k, town: s, hh: s + ':ship' + k + ':' + Math.floor(j / K.per), landed: minute, housed: null };
    if (NE && SIM.NEED) { var TR = Object.keys(NE.traits); a.trait = TR[KRAND.hash(T.seed, 67, a.k) % TR.length];
      a.nd = NE.list.map(function (nm, q) { var r = NE.init[nm]; return NE.rate[nm] && r ? r[0] + (r[1] - r[0]) * KRAND.unit(KRAND.hash(T.seed, 68, a.k, q)) : 0; });
      if (K.unhappy && K.unhappy.n) SIM.happinessAdd(a, K.unhappy.n, K.unhappy.days, 'camp'); }
    if (grown && K.work) ISLE.refugeeToWork(a, s, K.work);
    if (SIM.ITEMS && T.items.worn) ISLE.dressPerson(a, s);
  }
  camp.people = (camp.people || 0) + K.people;
  if (SIM.placesChanged) SIM.placesChanged();
  SIM.logEvent('refugees landed', { settlement: s, people: K.people, ship: k });
  return ship;
};
/* a grown-up refugee to work (`work`, 2026-11-04): its town's role of that trade, at the lot of the project with the
   fewest hands (the builders' crew; core's rebalance keeps them even and the lots' posts following); employed */
ISLE.refugeeToWork = function (a, s, job) {
  var R = SIM.R.role[s + '.' + job]; if (!R) return false;
  var B = SIM.BUILD, lots = B ? Object.keys(B.lots).filter(function (id) { return B.lots[id].settlement === s && B.lots[id].state !== 'built'; }) : [];
  var on = {}; SIM.all('actor').forEach(function (q) { if (q.work != null && B.lots[q.work]) on[q.work] = (on[q.work] || 0) + 1; });
  var at = lots.filter(function (id) { return B.lots[id].state === 'building'; }).concat(lots).sort(function (p, q) { return (B.lots[q].state === 'building') - (B.lots[p].state === 'building') || (on[p] || 0) - (on[q] || 0) || (p < q ? -1 : 1); })[0];
  if (at == null) return false;
  a.role = R.id; a.work = at; if (a.mem) a.mem.WORK = at; a.status = 'employed'; a.job = job; a.refugee.work = job;
  var P = SIM.R.place[at]; P.activities.WORK = (P.activities.WORK || 0) + 1;   /* its post (core's rebalance evens them out) */
  return true;
};
ISLE.refugeesAt = function (s) {
  var R = ISLE.SIM.rf, id = R && R.camps[s]; if (!id) return [];
  return SIM.all('actor').filter(function (a) { return a.home === id && a.refugee; });
};
ISLE.refugeeWaiting = function (s) { var hh = {}; ISLE.refugeesAt(s).forEach(function (a) { hh[a.refugee.hh] = 1; }); return Object.keys(hh).length; };
ISLE.refugeeSettle = function (lot, s) {
  var L = ISLE.refugeesAt(s); if (!L.length) return false;
  L.sort(function (p, q) { return p.refugee.landed - q.refugee.landed || (p.refugee.hh < q.refugee.hh ? -1 : p.refugee.hh > q.refugee.hh ? 1 : p.k - q.k); });
  var hh = L[0].refugee.hh, them = L.filter(function (a) { return a.refugee.hh === hh; }), H = SIM.R.place[lot], camp = SIM.R.place[ISLE.SIM.rf.camps[s]], m = SIM.minute();
  them.forEach(function (a) { a.home = lot; a.cls = H.cls || 'poor'; a.refugee.housed = m; if (a.hmods) a.hmods = a.hmods.filter(function (x) { return x.why !== 'camp'; });
    var WS = ISLE.TUNE.sim.items.wealthSpread && ISLE.TUNE.sim.items.wealthSpread[a.cls]; a.wealth = WS ? WS[0] : 0; });
  camp.people = Math.max(0, (camp.people || 0) - them.length); H.people = them.length; H.store = H.store || {};
  if (SIM.MONEY && !SIM.acct('hh:' + lot)) SIM.account({ id: 'hh:' + lot, owner: lot, kind: 'household', currency: ISLE.currencyOf(s), settlement: s });
  if (SIM.placesChanged) SIM.placesChanged();
  SIM.logEvent('refugees housed', { settlement: s, lot: lot, people: them.length, household: hh });
  return true;
};
ISLE.refugeeBooks = function () {
  var R = ISLE.SIM.rf || { ships: [], camps: {} }, out = { minute: SIM.minute(), ships: JSON.parse(JSON.stringify(R.ships)), camps: {}, housed: {}, people: {}, pool: {}, left: R.left || 0, leftBy: Object.assign({}, R.leftBy || {}), ledger: SIM.ledgerSnap ? SIM.ledgerSnap() : null };
  Object.keys(R.camps).forEach(function (s) {
    var C = SIM.R.place[R.camps[s]], all = SIM.all('actor').filter(function (a) { return a.refugee && SIM.settlementOf(a) === s; });
    out.camps[s] = { people: C.people || 0, here: all.filter(function (a) { return a.home === C.id; }).length, households: ISLE.refugeeWaiting(s) };
    out.housed[s] = all.filter(function (a) { return a.refugee.housed != null; }).length; out.people[s] = all.length;
    var hs = all.filter(function (a) { return a.home === C.id && a.nd; }).map(function (a) { return SIM.happiness(a, SIM.ABSTRACT && SIM.ABSTRACT[s] ? SIM.needsOf(a) : SIM.needsPeek(a)); });
    out.pool[s] = hs.length ? hs.reduce(function (p, q) { return p + q; }, 0) / hs.length : null;
    var ie = SIM.NEED ? SIM.NEED.idx.eat : null, ab = SIM.ABSTRACT && SIM.ABSTRACT[s];
    var qs = function (L) { var H = L.map(function (a) { var nd = ab ? SIM.needsOf(a) : SIM.needsPeek(a); return nd ? nd[ie] : 0; }).sort(function (p, q) { return p - q; });
      return H.length ? { median: H[Math.floor(H.length / 2)], p90: H[Math.min(H.length - 1, Math.floor(H.length * 0.9))], n: H.length } : null; };
    out.camps[s].hunger = ie == null ? null : qs(all.filter(function (a) { return a.home === C.id && a.nd; }));
    out.camps[s].town = ie == null ? null : qs(SIM.all('actor').filter(function (a) { return !a.refugee && !a.driven && a.nd && SIM.settlementOf(a) === s && SIM.R.place[a.home] && SIM.R.place[a.home].kind === 'home'; }).filter(function (a, i) { return i % 7 === 0; }));   /* a sample of the town's own */
  });
  return out;
};
ISLE.refugeeChecks = function (a, b) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: name, ok: !!pass, detail: detail || '' }); };
  var landed = b.ships.reduce(function (n, x) { return n + x.people; }, 0), people = Object.keys(b.people).reduce(function (n, s) { return n + b.people[s]; }, 0);
  ok('every ship\'s people landed and are here or have moved on (' + b.ships.length + ' ships, ' + landed + ' people, ' + b.left + ' moved on, ' + b.ships.reduce(function (n, x) { return n + x.turned; }, 0) + ' turned away)', landed === people + b.left && b.ships.length > 0, landed + ' landed, ' + people + ' here, ' + b.left + ' gone');
  var lost = SIM.all('actor').filter(function (x) { if (!x.refugee) return false; var H = SIM.R.place[x.home], s = x.refugee.town; return !H || H.settlement !== s || !(H.kind === 'camp' || (H.kind === 'home' && H.activities.SLEEP > 0)); });
  ok('every refugee in its town\'s camp or in a house of its town', !lost.length, lost.slice(0, 4).map(function (x) { return x.id + ' at ' + x.home; }).join(', '));
  var off = Object.keys(b.camps).filter(function (s) { return b.camps[s].people !== b.camps[s].here; });
  ok('each camp\'s count is its people', !off.length, off.map(function (s) { return s + ' ' + b.camps[s].people + ' for ' + b.camps[s].here; }).join(', '));
  var V = SIM.NEED && SIM.NEED.vital && SIM.NEED.vital.length ? SIM.NEED.vital[0].at : 100, desc = function (q) { return q ? 'median ' + Math.round(q.median) + ', nine in ten under ' + Math.round(q.p90) : '-'; };
  var hungry = Object.keys(b.camps).filter(function (s) { var C = b.camps[s], h = C.hunger, t = C.town; return h && (h.median >= V * 0.6 || (t && h.p90 > t.p90 + 35)); });
  ok('the camps fed at their ration lines as well as the town feeds its own (hunger: the camp\'s median under ' + Math.round(V * 0.6) + ', its nine in ten within 35 of the town\'s: a camp of a few dozen has its outliers)', !hungry.length,
    Object.keys(b.camps).map(function (s) { return s + ' camp ' + desc(b.camps[s].hunger) + ', town ' + desc(b.camps[s].town); }).join('; '));
  var idle = SIM.all('actor').filter(function (x) { return x.refugee && x.ageBand === 'adult' && ISLE.TUNE.sim.refugees.work && (!x.work || !SIM.R.place[x.work] || !(SIM.R.place[x.work].activities.WORK > 0)); });
  ok('every grown-up refugee at work (' + (ISLE.TUNE.sim.refugees.work || 'none') + ', at a post of its town)', !idle.length, idle.slice(0, 4).map(function (x) { return x.id + ' at ' + x.work; }).join(', '));
  if (a.ledger && b.ledger) { var Lg = SIM.ledger(a.ledger, b.ledger); ok('the books hold with the ships, the camps and those who moved on', Lg.ok, Lg.ok ? '' : Lg.problems.slice(0, 2).join('; ')); }
  ok('the camps, the housed and the refugees\' happiness (reported)', true, Object.keys(b.camps).map(function (s) { var C = b.camps[s];
    return s + ': ' + b.people[s] + ' here, ' + b.housed[s] + ' housed, ' + C.people + ' in the camp (' + C.households + ' households waiting), ' + (b.leftBy[s] || 0) + ' moved on, happiness in the camp ' + (b.pool[s] == null ? '-' : Math.round(b.pool[s])); }).join('; '));
  return out;
};
