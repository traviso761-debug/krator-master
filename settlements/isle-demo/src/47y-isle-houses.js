/* ============================== 7h9. THE MERCHANT HOUSES: THE EXPEDITIONS AS A BUSINESS (2026-11-09) ============================== */
/* [G data] The owner (2026-11-09): "wondering if we can experiment with intra-city factions by making each city's long
   distance expeditions organized by a merchant house" (core/simulation/PLAN-MONEY.md 2a: "trading houses to merchant
   princes", waiting for a trade with takings). Each town charters a MERCHANT HOUSE from its treasury (`expeditions.house`
   `capital`, paid, not minted): an org and an account, headed by the town's richest household. The house RUNS the town's
   expeditions (47x) as a business:
     - it DECIDES to sail (ISLE.houseDecide) and for how long: as long as the town will buy its main good (the room under
       the town's ceiling, what the town uses meanwhile), at most a season, at least `minDays`; the expected haul (its last
       season's catch a hand a day, or `prior`) at the town's WHOLESALE price (its live price over its markup: what the goods cost the town, with M2's scarcity in
       it), against the crew's wages (the flat wage for the
       rota's hours), the provisions at wholesale and the boat's `charter` a day; it sails on a positive margin with
       `reserveDays` of wages in its purse, else tries again in `retryDays`;
     - the camp's workplaces are ITS OWN (their accounts owned by the house: core's payroll pays the crew from them and the
       house covers what they lack); the camp's treasury is opened empty (no money is made for a camp);
     - each night before the payroll it SETTLES with the town (ISLE.houseStep): the haul landed at the town is bought by the
       town's treasury at wholesale, the provisions landed at the camp and the food the crew carried out are paid for at
       wholesale, the boat's charter for the day; the crew's mess sends its wages home (to the households they left);
     - it RECALLS the crew when its purse holds under `recallDays` of the crew's wages;
     - after a season (the crew home and the boats' last loads landed and settled) it books the season (revenue, wages,
       provisions, charter, the profit) and pays its head household
       `dividend` of what it holds over its capital and `keep` (the merchant family's wealth: the faction's).
     ISLE.simHouses()            after the money (47x simExpeditions): the houses chartered, the nightly step
     ISLE.houseBooks()           a snapshot: each house's purse, capital, decisions, seasons, its settlings
     ISLE.houseChecks(a, b)      over two snapshots, each with a negative in tests/test-isle-expeditions.js
   The owner's second pass (2026-11-09: "I like all these ideas let's implement them"): the house chooses among the KINDS of
   camp (the forest's timber, gum, kapok and bark; the vents' sulphur; the reef's pearls) by margin, up to `maxOut` at once;
   it sells the plantations' cash crops to THE SHIPS FROM BEYOND for Talents (`exports`, ISLE.houseExports); and it trades
   the canoe line's loads between the towns at each town's wholesale (`carry`, ISLE.houseCarry). */
ISLE.houseWholesale = function (s, g) {
  var C = SIM.MONEY && SIM.MONEY.m1; if (!C) return 0; if (!C.price[s]) SIM.moneyPrices(s);
  var p = (C.price[s] || {})[g]; if (p == null) return 0; var mk = C.markup[s] == null ? 1 : C.markup[s]; return p / mk;
};
ISLE.houseHours = function () { var w = ISLE.TUNE.sim.sched.work, h = 0; for (var i = 0; i < w.length; i++) if (w[i][1] === 'WORK') h += (i + 1 < w.length ? w[i + 1][0] : 24) - w[i][0]; return h; };
ISLE.simHouses = function () {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = T.expeditions, HS = X && X.house; if (!HS || !SIM.MONEY || !SIM.MONEY.m1) return null;
  if (S.houses) return S.houses;
  S.houses = {};
  S.order.forEach(function (s) {
    var tre = 'treasury:' + s, c = ISLE.currencyOf(s), TSp = null; Object.keys(T.towns).forEach(function (k) { if (T.towns[k].id === s) TSp = T.towns[k]; });
    /* its head: the town's richest household (a rich class first) */
    var hh = SIM.accounts().filter(function (A) { return A.kind === 'household' && A.settlement === s; }), cls = {};
    SIM.all('actor').forEach(function (a) { if (a.home != null && a.cls) cls[a.home] = a.cls; });
    var rank = function (A) { var k = cls[A.owner]; return k === 'rich' ? 2 : k === 'middle' ? 1 : 0; };
    hh.sort(function (p, q) { return rank(q) - rank(p) || q.balance - p.balance || (p.id < q.id ? -1 : 1); });
    var head = hh[0] || null, id = 'house:' + s, org = s + '.house', name = TSp.colony && TSp.colony.family ? TSp.colony.family + ' of ' + TSp.colony.polisName : 'the merchant house of ' + TSp.name;   /* a colony's: its merchant family (47k) */
    SIM.org({ id: org, faction: TSp.faction, name: name });
    SIM.account({ id: id, owner: head ? head.owner : s, kind: 'house', currency: c, settlement: s, name: name });
    S.houses[s] = { id: id, org: org, name: name, town: s, head: head ? head.id : null, capital: 0, decisions: [], seasons: [], settled: [], camps: {}, flows: { 'in': {}, out: {} } };
    S.houses[s].capital = ISLE.housePay(S.houses[s], tre, id, TSp.colony && TSp.colony.capital != null ? TSp.colony.capital : HS.capital, 'charter capital');
    if (HS.exports && SIM.MONEY.cur.talent) { S.houses[s].talent = id + ':talent'; SIM.account({ id: S.houses[s].talent, owner: head ? head.owner : s, kind: 'house', currency: 'talent', settlement: s, name: name + ' (its Talents)' }); }
    S.houses[s].exports = []; S.houses[s].carried = [];
  });
  if (SIM.stepHooks.indexOf(ISLE.houseStep) < 0) SIM.stepHooks.push(ISLE.houseStep);
  if (HS.exports && SIM.acct('foreign:beyond') && SIM.stepHooks.indexOf(ISLE.houseExports) < 0) SIM.stepHooks.push(ISLE.houseExports);
  if (HS.carry && SIM.stepHooks.indexOf(ISLE.houseCarry) < 0) { S.carryLast = {}; SIM.stepHooks.push(ISLE.houseCarry); }
  return S.houses;
};
ISLE.housePay = function (H, from, to, n, why) {
  n = Math.round(n); if (!(n > 0)) return 0; var paid = SIM.pay(from, to, n, why, true);
  if (paid) { var side = from === H.id ? 'out' : to === H.id ? 'in' : null; if (side) H.flows[side][why] = (H.flows[side][why] || 0) + paid; }
  return paid;
};
/* the season planned, for each kind of camp the house may send: as long as the town will buy its main good (the room
   under the town's ceiling, with what the town uses meanwhile), at most `expeditions.days`; its haul at wholesale against
   its costs, a day at a time; the kind with the best margin -> {go, why, kind, days, revenue, wages, food, charter, profit,
   purse, alts: {kind: profit}} */
ISLE.houseDecide = function (s, minute, kinds) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = T.expeditions, HS = X.house, H = S.houses[s], I = T.items, E = SIM.econ(s), pol = E.policy || {};
  kinds = kinds || Object.keys(X.kinds);
  var foods = S.towns[s].econ.foods, fp = 0; foods.forEach(function (f) { fp += ISLE.houseWholesale(s, f); }); fp = foods.length ? fp / foods.length : 0;
  var minDays = HS.minDays == null ? 10 : HS.minDays, purse = SIM.acct(H.id).balance, best = null, alts = {};
  kinds.forEach(function (kind) {
    var K = X.kinds[kind], hands = K.hands, last = null; H.seasons.forEach(function (x) { if (x.kind === kind) last = x; });
    var per = {}; if (last && last.handDays > 0) Object.keys(last.haul).forEach(function (g) { per[g] = last.haul[g] / last.handDays; }); else per = Object.assign({}, K.prior);
    var lines = {}, perDay = 0, days = X.days;
    Object.keys(per).forEach(function (g) { var held = SIM.withEcon(s, function () { return SIM.stockOf(g); }), max = pol[g] && pol[g].max != null ? pol[g].max : Infinity;
      var use = (E.used[g] || 0) / Math.max(1, SIM.minute() / 1440), room = max === Infinity ? Infinity : Math.max(0, max - held), daily = per[g] * hands, p = ISLE.houseWholesale(s, g);
      lines[g] = { daily: Math.round(daily * 10) / 10, room: room === Infinity ? null : Math.round(room), use: Math.round(use * 10) / 10, price: Math.round(p * 10) / 10 };
      if (g === K.main && room !== Infinity && daily > use) days = Math.min(days, Math.floor(room / (daily - use)));   /* the town takes no more of its main good than fills it */
      perDay += daily * p; });
    var wage = hands * ISLE.houseHours() * T.money.m1.wage, feed = hands * I.meals * I.perMeal * fp;
    var D = { minute: minute, kind: kind, days: days, revenue: Math.round(perDay * days), wages: Math.round(wage * days), food: Math.round(feed * days), charter: Math.round(HS.charter * days), purse: purse, need: Math.round(wage * HS.reserveDays), lines: lines };
    D.profit = D.revenue - D.wages - D.food - D.charter; alts[kind] = D.days >= minDays ? D.profit : null;
    if (D.days < minDays) return;
    if (!best || D.profit > best.profit) best = D; });
  var D = best || { minute: minute, kind: null, days: 0, revenue: 0, wages: 0, food: 0, charter: 0, profit: 0, purse: purse, need: 0, lines: {} };
  D.go = !!best && D.profit > 0 && purse >= D.need; D.alts = alts;
  D.why = D.go ? 'a margin' : !best ? 'the town is stocked' : D.profit <= 0 ? 'no margin' : 'a thin purse';
  /* a thin purse with Talents in hand: changed to shells and asked again (the exports' coin) */
  if (best && D.profit > 0 && purse < D.need && ISLE.houseChange(H, D.need - purse)) { D.purse = SIM.acct(H.id).balance; D.go = D.purse >= D.need; D.why = D.go ? 'a margin (Talents changed)' : 'a thin purse'; }
  H.decisions.push(D); H.plan = D.go ? D : null; SIM.logEvent('house decided', { house: H.id, go: D.go, why: D.why, kind: D.kind, days: D.days, profit: D.profit });
  return D;
};
/* Talents to shells at the changers (SIM.exchange, its spread), enough to raise `need` shells -> shells got */
ISLE.houseChange = function (H, need) {
  var A = H.talent && SIM.acct(H.talent); if (!A || !(A.balance > 0) || !(need > 0)) return 0;
  var M = SIM.MONEY, rate = M.cur[A.currency].talent / M.cur[SIM.acct(H.id).currency].talent * (1 - M.spread), n = Math.min(A.balance, Math.ceil(need / rate) + 1);
  var got = 0; try { got = SIM.exchange(H.talent, H.id, n, 'change') || 0; } catch (e) { got = 0; }
  if (got) H.flows['in'].change = (H.flows['in'].change || 0) + got;
  return got;
};
/* the camp's money under the house: its treasury empty, its workplaces the house's, the crew's mess; the food carried paid for */
ISLE.houseOpen = function (C, carried, minute) {
  var S = ISLE.SIM, s = C.town, H = S.houses[s], c = ISLE.currencyOf(s), cid = C.id;
  SIM.account({ id: 'treasury:' + cid, owner: cid, kind: 'treasury', currency: c, settlement: cid, name: 'the expedition\'s (nothing in it: the house pays)' });
  SIM.account({ id: 'hh:' + C.places.camp, owner: C.places.camp, kind: 'mess', currency: c, settlement: cid });
  [C.places.crew, C.places.store].forEach(function (p) { SIM.account({ id: 'wp:' + p, owner: p, kind: 'workplace', currency: c, settlement: cid, ownedBy: H.id }); });
  var home = {}; C.people.forEach(function (id) { var a = SIM.R.actor[id]; if (a && a.exp && a.exp.home != null) home[id] = a.exp.home; });
  H.camps[cid] = { haul: {}, food: {}, home: home, opened: minute, carried: carried, rev: 0, prov: 0, charter: 0, remitted: 0 };   /* the camp's own books (a house runs several, and trades besides) */
  var v = 0; Object.keys(carried || {}).forEach(function (f) { var n = carried[f], p = ISLE.houseWholesale(s, f); v += n * p; H.settled.push({ minute: minute, camp: cid, kind: 'provisions', good: f, n: n, price: p }); });
  H.camps[cid].prov += ISLE.housePay(H, H.id, 'treasury:' + s, v, 'provisions');
};
/* each night at 23:00, before the payroll: the haul and the provisions landed since, the charter, the wages sent home, the purse */
ISLE.houseStep = function (minute) {
  var S = ISLE.SIM; if (!S.houses || !S.exp || minute % 1440 !== 1380) return;
  S.exp.camps.forEach(function (C) { var H = S.houses[C.town], K = H && H.camps[C.id]; if (!K || K.closed) return;
    if (!C.struck) { ISLE.houseSettle(C, minute, true); return; }
    /* the crew home: the boats' last loads still land (the town buys them, the house pays for the food), then the season is booked */
    ISLE.houseSettle(C, minute, false); if (!ISLE.houseAtSea(C)) ISLE.houseClose(C, minute); });
};
ISLE.houseAtSea = function (C) { var n = 0; [C.out, C['in']].forEach(function (rid) { var R = SIM.TRADE && SIM.TRADE.routes[rid]; if (R) R.carriers.forEach(function (K) { K.cargo.forEach(function (c) { n += c.n; }); }); }); return n > 0; };
ISLE.houseSettle = function (C, minute, daily) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions, HS = X.house, s = C.town, H = S.houses[s], K = H.camps[C.id]; if (!K) return;
  var Ro = SIM.tradeReport(C.out), Ri = SIM.tradeReport(C['in']), landed = Ro.landed[C.id + '>' + s] || {}, fed = Ri.landed[s + '>' + C.id] || {};
  var buy = 0; Object.keys(landed).forEach(function (g) { var d = (landed[g] || 0) - (K.haul[g] || 0); if (!(d > 0)) return; K.haul[g] = landed[g]; var p = ISLE.houseWholesale(s, g); buy += d * p; H.settled.push({ minute: minute, camp: C.id, kind: 'haul', good: g, n: d, price: p }); });
  K.rev += ISLE.housePay(H, 'treasury:' + s, H.id, buy, 'haul');
  var cost = 0; Object.keys(fed).forEach(function (f) { var d = (fed[f] || 0) - (K.food[f] || 0); if (!(d > 0)) return; K.food[f] = fed[f]; var p = ISLE.houseWholesale(s, f); cost += d * p; H.settled.push({ minute: minute, camp: C.id, kind: 'provisions', good: f, n: d, price: p }); });
  K.prov += ISLE.housePay(H, H.id, 'treasury:' + s, cost, 'provisions');
  if (daily) K.charter += ISLE.housePay(H, H.id, 'treasury:' + s, HS.charter, 'charter');
  /* the mess's wages home: shared over the households the crew left */
  var mess = SIM.acct('hh:' + C.places.camp), homes = Object.keys(K.home).map(function (id) { return K.home[id]; }).filter(function (h) { return SIM.acct('hh:' + h); });
  if (mess && mess.balance > 0 && homes.length) { var each = Math.floor(mess.balance / homes.length); if (each > 0) homes.forEach(function (h) { K.remitted += SIM.pay(mess.id, 'hh:' + h, each, 'remittance', true) || 0; }); }
  /* the purse: under `recallDays` of the crew's wages, the crew comes home */
  var day = C.people.length * ISLE.houseHours() * ISLE.TUNE.sim.money.m1.wage;
  if (daily && SIM.acct(H.id).balance < HS.recallDays * day) ISLE.expReturn(C, minute, 'the house\'s purse');
};
/* the crew home and the boats' last loads landed: the last settling, the season's books, the dividend to the house's head */
ISLE.houseClose = function (C, minute) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions, HS = X.house, s = C.town, H = S.houses[s], K = H.camps[C.id]; if (!K || K.closed) return;
  ISLE.houseSettle(C, minute, false); K.closed = minute;
  var purse = SIM.acct(H.id).balance, revenue = K.rev, provisions = K.prov, charter = K.charter;
  /* the wages: what the crew's mess was paid (core's payroll from the camp's workplaces, the house covering them): sent
     home each night, and what is left in it */
  var mess = SIM.acct('hh:' + (ISLE.SIM.exp.camps.filter(function (c) { return c.id === C.id; })[0] || C).places.camp), wages = K.remitted + (mess ? mess.balance : 0);
  var hauled = {}; Object.keys(K.haul).forEach(function (g) { hauled[g] = K.haul[g]; });
  var handDays = C.people.length * Math.max(1, (minute - C.lands) / 1440);
  var season = { camp: C.id, kind: C.kind, sailed: C.sailed, home: minute, days: Math.round((minute - C.sailed) / 144) / 10, why: C.why, haul: hauled, handDays: Math.round(handDays), revenue: revenue, wages: Math.round(wages), provisions: provisions, charter: charter, profit: Math.round(revenue - wages - provisions - charter), purse: purse };
  var over = purse - H.capital * (1 + HS.keep);
  if (over > 0 && H.head && SIM.acct(H.head)) season.dividend = ISLE.housePay(H, H.id, H.head, over * HS.dividend, 'dividend');
  H.seasons.push(season);
  SIM.logEvent('house season', { house: H.id, camp: C.id, profit: season.profit, dividend: season.dividend || 0 });
};
/* THE SHIPS FROM BEYOND: every `exports.every` days at noon a trader calls at each town with `purse` Talents (minted: the
   world beyond the isles is its own); the house buys from its town, at wholesale, the cash crops the town holds over
   `keepDays` of its own use (up to `load` of each) whose foreign price beats wholesale by `margin`, and sells them to the
   ship for Talents; the goods leave the isles (booked exported from the town) */
ISLE.houseExports = function (minute) {
  var S = ISLE.SIM, XP = ISLE.TUNE.sim.expeditions.house.exports, M = SIM.MONEY; if (!S.houses || minute % 1440 !== 720 || Math.floor(minute / 1440) % XP.every !== 0 || minute < 1440) return;
  var F = 'foreign:beyond', shellsPerTalent = M.cur.talent.talent / M.cur.shell.talent * (1 - M.spread);
  S.order.forEach(function (s) { var H = S.houses[s]; if (!H || !H.talent) return; var E = SIM.econ(s), days = Math.max(1, minute / 1440);
    SIM.mint(F, XP.purse, 'a ship from beyond');   /* the ship's purse */
    var visit = { minute: minute, town: s, lines: {} };
    Object.keys(XP.prices).forEach(function (g) { if (!E.goods[g]) return;
      var held = SIM.withEcon(s, function () { return SIM.stockOf(g); }), use = (E.used[g] || 0) / days, spare = Math.floor(Math.min(XP.load, held - XP.keepDays * use));
      var whole = ISLE.houseWholesale(s, g), abroad = XP.prices[g] * shellsPerTalent; if (!(spare > 0) || !(abroad > whole * (1 + XP.margin))) return;
      var room = Math.floor(SIM.acct(F).balance / XP.prices[g]); spare = Math.min(spare, room); if (!(spare > 0)) return;
      var cost = Math.round(spare * whole); if (SIM.acct(H.id).balance < cost) { spare = Math.floor(SIM.acct(H.id).balance / Math.max(whole, 1e-9)); cost = Math.round(spare * whole); } if (!(spare > 0)) return;
      var k = SIM.withEcon(s, function () { var n = SIM.economyTake(g, spare); if (n > 0) SIM.economyBook('exported', g, n); return n; }); if (!(k > 0)) return;
      var paid = ISLE.housePay(H, H.id, 'treasury:' + s, k * whole, 'cash crops');
      var talents = Math.floor(k * XP.prices[g]), got = talents > 0 ? SIM.pay(F, H.talent, talents, 'export ' + g, true) : 0;
      H.flows['in'].talents = (H.flows['in'].talents || 0) + got;
      visit.lines[g] = { n: k, wholesale: whole, paid: paid, talents: got, abroad: abroad }; });
    H.exports.push(visit); });
};
/* THE LINES BETWEEN THE TOWNS, each night at 23:00: every load landed since is the sending town's house's, bought at the
   sender's wholesale, sold to the receiver at its wholesale (the town's treasuries pay and are paid); a load that would
   sell for less than it cost, or one the house cannot pay for, it leaves to the towns, which settle at the sender's price */
ISLE.houseCarry = function (minute) {
  var S = ISLE.SIM, HS = ISLE.TUNE.sim.expeditions.house; if (!S.houses || minute % 1440 !== 1380) return;
  HS.carry.forEach(function (rid) { var R = SIM.TRADE && SIM.TRADE.routes[rid]; if (!R) return; var Rep = SIM.tradeReport(rid), L = S.carryLast[rid] || (S.carryLast[rid] = {});
    Object.keys(Rep.landed).forEach(function (key) { var ab = key.split('>'), a = ab[0], b = ab[1], H = S.houses[a]; if (!H || !S.houses[b]) return; var last = L[key] || (L[key] = {}), got = Rep.landed[key];
      /* the house takes the loads that pay (the receiver's wholesale at least the sender's); the rest the towns settle
         between them at the sender's price (the goods sail by the towns' want either way) */
      var buy = 0, sell = 0, n = 0, lines = {}, aside = 0, asideLines = {}; Object.keys(got).forEach(function (g) { var d = (got[g] || 0) - (last[g] || 0); if (!(d > 0)) return; last[g] = got[g];
        var pa = ISLE.houseWholesale(a, g), pb = ISLE.houseWholesale(b, g);
        if (pb < pa) { aside += d * pa; asideLines[g] = { n: d, from: pa, to: pb }; return; }
        buy += d * pa; sell += d * pb; n += d; lines[g] = { n: d, from: pa, to: pb }; });
      if (aside > 0) { var ap = SIM.pay('treasury:' + b, 'treasury:' + a, Math.round(aside), 'carried between the towns', true) || 0; H.carried.push({ minute: minute, route: rid, from: a, to: b, lines: asideLines, buy: Math.round(aside), sell: 0, direct: ap, why: 'no margin' }); }
      if (!n) return;
      /* a house that cannot pay for the loads steps aside: the receiving town pays the sending town at the sender's wholesale */
      if (SIM.acct(H.id).balance < Math.round(buy)) { var dp = SIM.pay('treasury:' + b, 'treasury:' + a, Math.round(buy), 'carried between the towns', true) || 0;
        H.carried.push({ minute: minute, route: rid, from: a, to: b, lines: lines, buy: Math.round(buy), sell: Math.round(sell), direct: dp }); return; }
      var paid = ISLE.housePay(H, H.id, 'treasury:' + a, buy, 'carried bought'), took = ISLE.housePay(H, 'treasury:' + b, H.id, sell, 'carried sold');
      /* a treasury that cannot pay the whole: what it holds, the rest owed (booked) */
      var owed = 0; if (!took && Math.round(sell) > 0) { var Tb = SIM.acct('treasury:' + b), part = Math.max(0, Math.min(Tb.balance, Math.round(sell))); took = part > 0 ? ISLE.housePay(H, 'treasury:' + b, H.id, part, 'carried sold') : 0; owed = Math.round(sell) - took; H.owed = (H.owed || 0) + owed; }
      H.carried.push({ minute: minute, route: rid, from: a, to: b, lines: lines, buy: Math.round(buy), sell: Math.round(sell), paid: paid, took: took, owed: owed }); }); });
};
ISLE.houseBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), houses: {} }; if (!S.houses) return out;
  Object.keys(S.houses).forEach(function (s) { var H = S.houses[s], A = SIM.acct(H.id), camps = {};
    Object.keys(H.camps).forEach(function (cid) { var K = H.camps[cid], B = (SIM.MONEY.books[cid] || {})[A.currency] || { minted: 0 };
      var owned = [SIM.acct('wp:' + (S.exp.camps.filter(function (C) { return C.id === cid; })[0] || { places: {} }).places.crew)].filter(Boolean).every(function (W) { return W.ownedBy === H.id; });
      var C = S.exp.camps.filter(function (c) { return c.id === cid; })[0], Ro = SIM.tradeReport(C.out), Ri = SIM.tradeReport(C['in']);
      camps[cid] = { minted: B.minted || 0, owned: owned, atSea: ISLE.houseAtSea(C), landed: Object.assign({}, Ro.landed[cid + '>' + s] || {}), fed: Object.assign({}, Ri.landed[s + '>' + cid] || {}), bought: Object.assign({}, K.haul), paidFood: Object.assign({}, K.food), closed: K.closed || null, struck: C.struck || null }; });
    out.houses[s] = { id: H.id, name: H.name, head: H.head, headBalance: H.head && SIM.acct(H.head) ? SIM.acct(H.head).balance : null, capital: H.capital, purse: A.balance, flows: JSON.parse(JSON.stringify(H.flows)),
      decisions: H.decisions.map(function (D) { return Object.assign({}, D, { lines: Object.assign({}, D.lines) }); }), seasons: H.seasons.map(function (x) { return Object.assign({}, x, { haul: Object.assign({}, x.haul) }); }),
      settled: H.settled.map(function (e) { return Object.assign({}, e); }), camps: camps, talents: H.talent && SIM.acct(H.talent) ? SIM.acct(H.talent).balance : 0,
      exports: JSON.parse(JSON.stringify(H.exports || [])), carried: JSON.parse(JSON.stringify(H.carried || [])), minted: (((SIM.MONEY.books[s] || {})[A.currency]) || {}).minted || 0 }; });
  return out;
};
ISLE.houseChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'houses: ' + name, ok: !!pass, detail: detail }); }, HS = ISLE.TUNE.sim.expeditions.house, towns = Object.keys(b.houses);
  ok('each town chartered a merchant house from its treasury (its capital paid, not minted), headed by one of its households', towns.length >= 2 && towns.every(function (s) { var H = b.houses[s]; return H.capital === HS.capital && H.flows['in']['charter capital'] === HS.capital && H.head; }),
    towns.map(function (s) { var H = b.houses[s]; return H.name + ': ' + H.capital + ' capital from the treasury, head ' + H.head + ', purse ' + H.purse; }).join('; '));
  var camps = []; towns.forEach(function (s) { Object.keys(b.houses[s].camps).forEach(function (cid) { camps.push({ s: s, id: cid, K: b.houses[s].camps[cid] }); }); });
  ok('the house runs its expeditions: no money made for a camp (its treasury opened empty), the camp\'s workplaces owned by the house', camps.length >= 1 && camps.every(function (x) { return x.K.minted === 0 && x.K.owned; }),
    camps.map(function (x) { return x.id + ': minted ' + x.K.minted + ', workplaces the house\'s ' + x.K.owned; }).join('; '));
  /* every load landed bought, at the price the settling recorded; every load of food at the camp paid for */
  var badS = []; camps.forEach(function (x) { if (!x.K.closed) return;   /* a camp still out or its boats still at sea is settled each night: its books close when they are in */
    Object.keys(x.K.landed).forEach(function (g) { if (Math.abs((x.K.landed[g] || 0) - (x.K.bought[g] || 0)) > 0.5) badS.push(x.id + ' ' + g + ' ' + Math.round(x.K.landed[g]) + ' landed, ' + Math.round(x.K.bought[g] || 0) + ' bought'); });
    Object.keys(x.K.fed).forEach(function (f) { if (Math.abs((x.K.fed[f] || 0) - (x.K.paidFood[f] || 0)) > 0.5) badS.push(x.id + ' ' + f + ' ' + Math.round(x.K.fed[f]) + ' fed, ' + Math.round(x.K.paidFood[f] || 0) + ' paid'); }); });
  towns.forEach(function (s) { var H = b.houses[s], sum = 0, sumF = 0; H.settled.forEach(function (e) { if (e.kind === 'haul') sum += e.n * e.price; else sumF += e.n * e.price; });
    if (Math.abs(sum - (H.flows['in'].haul || 0)) > H.settled.length + 1) badS.push(s + ' paid ' + (H.flows['in'].haul || 0) + ' for a haul worth ' + Math.round(sum) + ' at wholesale');
    if (Math.abs(sumF - (H.flows.out.provisions || 0)) > H.settled.length + 1) badS.push(s + ' paid ' + (H.flows.out.provisions || 0) + ' for provisions worth ' + Math.round(sumF)); });
  ok('every load of the haul landed in town bought by the town at its wholesale price that night, every load of provisions paid for', camps.length && !badS.length,
    badS.length ? badS.slice(0, 4).join('; ') : towns.map(function (s) { var H = b.houses[s]; return s + ': haul ' + (H.flows['in'].haul || 0) + ', provisions ' + (H.flows.out.provisions || 0) + ', charter ' + (H.flows.out.charter || 0) + ' (' + H.settled.length + ' settlings)'; }).join('; '));
  var badD = []; towns.forEach(function (s) { b.houses[s].decisions.forEach(function (D) { if (D.go && !(D.profit > 0 && D.purse >= D.need)) badD.push(s + ' sailed on ' + D.profit); if (!D.go && D.profit > 0 && D.purse >= D.need && D.days >= (HS.minDays == null ? 10 : HS.minDays)) badD.push(s + ' declined a margin of ' + D.profit); }); });
  ok('the house sailed only on a positive expected margin with the purse for it, and declined otherwise', towns.every(function (s) { return b.houses[s].decisions.length > 0; }) && !badD.length,
    badD.length ? badD.join('; ') : towns.map(function (s) { return s + ': ' + b.houses[s].decisions.map(function (D) { return (D.go ? 'sent its ' + D.kind + ' camp for ' + D.days + ' days' : 'declined (' + D.why + ')') + ' expecting ' + D.revenue + ' against ' + (D.wages + D.food + D.charter); }).join(', '); }).join('; '));
  var done = []; towns.forEach(function (s) { b.houses[s].seasons.forEach(function (x) { done.push({ s: s, x: x }); }); });
  if (done.length) ok('every season booked: its haul, wages, provisions and charter, its profit or loss, the house\'s purse (reported)', done.every(function (d) { return d.x.revenue >= 0 && d.x.wages >= 0 && d.x.profit === Math.round(d.x.revenue - d.x.wages - d.x.provisions - d.x.charter); }),
    done.map(function (d) { var x = d.x; return d.s + ' ' + x.days + ' days (' + x.why + '): sold ' + x.revenue + ', wages ' + x.wages + ', provisions ' + x.provisions + ', charter ' + x.charter + ' = ' + (x.profit >= 0 ? 'profit ' : 'loss ') + Math.abs(x.profit) + (x.dividend ? ', dividend ' + x.dividend : '') + '; purse ' + x.purse; }).join('; '));
  /* the exports: every cash crop sold abroad was bought from the town at its wholesale (over its keep) for less than the
     ship paid, and the ship's Talents are the house's */
  var vis = []; towns.forEach(function (s) { (b.houses[s].exports || []).forEach(function (v) { vis.push({ s: s, v: v }); }); });
  if (vis.length) { var badX = [], sold = 0, tal = 0; vis.forEach(function (x) { Object.keys(x.v.lines).forEach(function (g) { var l = x.v.lines[g]; sold += l.n; tal += l.talents;
      if (Math.abs(l.paid - Math.round(l.n * l.wholesale)) > 1) badX.push(x.s + ' ' + g + ' paid ' + l.paid + ' for ' + l.n + ' at ' + l.wholesale.toFixed(2));
      if (!(l.abroad > l.wholesale)) badX.push(x.s + ' sold ' + g + ' abroad at ' + l.abroad.toFixed(2) + ' under its wholesale ' + l.wholesale.toFixed(2));
      if (l.talents !== Math.floor(l.n * HS.exports.prices[g]) && l.talents > 0) badX.push(x.s + ' ' + g + ': ' + l.talents + ' Talents for ' + l.n); }); });
    var held = towns.reduce(function (n, s) { return n + (b.houses[s].talents || 0) + ((b.houses[s].flows['in'].change || 0) > 0 ? 0 : 0); }, 0), earned = towns.reduce(function (n, s) { return n + (b.houses[s].flows['in'].talents || 0); }, 0);
    ok('the ships from beyond: each cash crop sold abroad bought from the town at wholesale, sold above it for Talents the house holds (or changed)', !badX.length && earned > 0,
      badX.length ? badX.slice(0, 4).join('; ') : vis.length + ' visits, ' + sold + ' loads of cash crops sold for ' + tal + ' Talents; ' + towns.map(function (s) { return s + ' holds ' + b.houses[s].talents + ' Talents'; }).join(', ')); }
  /* the lines between the towns: every load landed bought at the sender's wholesale and sold at the receiver's */
  var car = []; towns.forEach(function (s) { (b.houses[s].carried || []).forEach(function (c) { car.push(c); }); });
  if (car.length) { var badC = [], pr = {}, aside = 0; car.forEach(function (c) { if (c.direct != null) { aside++; return; } var buy = 0, sell = 0; Object.keys(c.lines).forEach(function (g) { var l = c.lines[g]; buy += l.n * l.from; sell += l.n * l.to; });
      if (Math.abs(c.paid - Math.round(buy)) > 1 || Math.abs(c.took + (c.owed || 0) - Math.round(sell)) > 1) badC.push(c.route + ' ' + c.from + '>' + c.to + ' paid ' + c.paid + ' took ' + c.took + ' for loads worth ' + Math.round(buy) + ' and ' + Math.round(sell));
      pr[c.from] = (pr[c.from] || 0) + c.took - c.paid; });
    ok('the lines between the towns: every load landed bought by the sending town\'s house at its wholesale and sold at the receiver\'s', !badC.length,
      badC.length ? badC.slice(0, 4).join('; ') : car.length + ' nights of loads (' + aside + ' left to the towns: no margin, or a purse too thin); ' + Object.keys(pr).map(function (s) { return s + '\'s house ' + (pr[s] >= 0 ? 'made ' : 'lost ') + Math.abs(pr[s]) + ' carrying'; }).join(', ')); }
  return res;
};
