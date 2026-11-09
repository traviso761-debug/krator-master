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
     ISLE.houseChecks(a, b)      over two snapshots, each with a negative in tests/test-isle-expeditions.js */
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
    var head = hh[0] || null, id = 'house:' + s, org = s + '.house', name = 'the merchant house of ' + TSp.name;
    SIM.org({ id: org, faction: TSp.faction, name: name });
    SIM.account({ id: id, owner: head ? head.owner : s, kind: 'house', currency: c, settlement: s, name: name });
    S.houses[s] = { id: id, org: org, name: name, town: s, head: head ? head.id : null, capital: 0, decisions: [], seasons: [], settled: [], camps: {}, flows: { 'in': {}, out: {} } };
    S.houses[s].capital = ISLE.housePay(S.houses[s], tre, id, HS.capital, 'charter capital');
  });
  if (SIM.stepHooks.indexOf(ISLE.houseStep) < 0) SIM.stepHooks.push(ISLE.houseStep);
  return S.houses;
};
ISLE.housePay = function (H, from, to, n, why) {
  n = Math.round(n); if (!(n > 0)) return 0; var paid = SIM.pay(from, to, n, why, true);
  if (paid) { var side = from === H.id ? 'out' : to === H.id ? 'in' : null; if (side) H.flows[side][why] = (H.flows[side][why] || 0) + paid; }
  return paid;
};
/* the season planned: as long as the town will buy its main good (the room under the town's ceiling, with what the
   town uses meanwhile), at most `expeditions.days`; its haul at wholesale against its costs, a day at a time
   -> {go, why, days, revenue, wages, food, charter, profit, purse} */
ISLE.houseDecide = function (s, minute) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = T.expeditions, HS = X.house, H = S.houses[s], I = T.items, hands = X.hands, E = SIM.econ(s);
  var last = H.seasons.length ? H.seasons[H.seasons.length - 1] : null, per = {};
  if (last && last.handDays > 0) Object.keys(last.haul).forEach(function (g) { per[g] = last.haul[g] / last.handDays; }); else per = Object.assign({}, HS.prior);
  var main = Object.keys(X.crew.batch.out)[0], pol = E.policy || {}, lines = {}, perDay = 0, days = X.days;
  Object.keys(per).forEach(function (g) { var held = SIM.withEcon(s, function () { return SIM.stockOf(g); }), max = pol[g] && pol[g].max != null ? pol[g].max : Infinity;
    var use = (E.used[g] || 0) / Math.max(1, SIM.minute() / 1440), room = max === Infinity ? Infinity : Math.max(0, max - held), daily = per[g] * hands, p = ISLE.houseWholesale(s, g);
    lines[g] = { daily: Math.round(daily * 10) / 10, room: room === Infinity ? null : Math.round(room), use: Math.round(use * 10) / 10, price: Math.round(p * 10) / 10 };
    if (g === main && room !== Infinity && daily > use) days = Math.min(days, Math.floor(room / (daily - use)));   /* the town takes no more of its main good than fills it */
    perDay += daily * p; });
  var wage = hands * ISLE.houseHours() * T.money.m1.wage;
  var foods = S.towns[s].econ.foods, fp = 0; foods.forEach(function (f) { fp += ISLE.houseWholesale(s, f); }); fp = foods.length ? fp / foods.length : 0;
  var feed = hands * I.meals * I.perMeal * fp, minDays = HS.minDays == null ? 10 : HS.minDays;
  var revenue = perDay * days, wages = wage * days, food = feed * days, charter = HS.charter * days, profit = revenue - wages - food - charter, purse = SIM.acct(H.id).balance, need = wage * HS.reserveDays;
  var go = days >= minDays && profit > 0 && purse >= need;
  var D = { minute: minute, go: go, why: go ? 'a margin' : days < minDays ? 'the town is stocked' : profit <= 0 ? 'no margin' : 'a thin purse', days: days, revenue: Math.round(revenue), wages: Math.round(wages), food: Math.round(food), charter: Math.round(charter), profit: Math.round(profit), purse: purse, need: Math.round(need), lines: lines };
  H.decisions.push(D); H.plan = go ? D : null; SIM.logEvent('house decided', { house: H.id, go: go, why: D.why, days: days, profit: D.profit });
  return D;
};
/* the camp's money under the house: its treasury empty, its workplaces the house's, the crew's mess; the food carried paid for */
ISLE.houseOpen = function (C, carried, minute) {
  var S = ISLE.SIM, s = C.town, H = S.houses[s], c = ISLE.currencyOf(s), cid = C.id;
  SIM.account({ id: 'treasury:' + cid, owner: cid, kind: 'treasury', currency: c, settlement: cid, name: 'the expedition\'s (nothing in it: the house pays)' });
  SIM.account({ id: 'hh:' + C.places.camp, owner: C.places.camp, kind: 'mess', currency: c, settlement: cid });
  [C.places.crew, C.places.store].forEach(function (p) { SIM.account({ id: 'wp:' + p, owner: p, kind: 'workplace', currency: c, settlement: cid, ownedBy: H.id }); });
  var home = {}; C.people.forEach(function (id) { var a = SIM.R.actor[id]; if (a && a.exp && a.exp.home != null) home[id] = a.exp.home; });
  H.camps[cid] = { haul: {}, food: {}, home: home, opened: minute, purse0: SIM.acct(H.id).balance, flows0: JSON.parse(JSON.stringify(H.flows)), carried: carried };
  var v = 0; Object.keys(carried || {}).forEach(function (f) { var n = carried[f], p = ISLE.houseWholesale(s, f); v += n * p; H.settled.push({ minute: minute, camp: cid, kind: 'provisions', good: f, n: n, price: p }); });
  ISLE.housePay(H, H.id, 'treasury:' + s, v, 'provisions');
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
  ISLE.housePay(H, 'treasury:' + s, H.id, buy, 'haul');
  var cost = 0; Object.keys(fed).forEach(function (f) { var d = (fed[f] || 0) - (K.food[f] || 0); if (!(d > 0)) return; K.food[f] = fed[f]; var p = ISLE.houseWholesale(s, f); cost += d * p; H.settled.push({ minute: minute, camp: C.id, kind: 'provisions', good: f, n: d, price: p }); });
  ISLE.housePay(H, H.id, 'treasury:' + s, cost, 'provisions');
  if (daily) ISLE.housePay(H, H.id, 'treasury:' + s, HS.charter, 'charter');
  /* the mess's wages home: shared over the households the crew left */
  var mess = SIM.acct('hh:' + C.places.camp), homes = Object.keys(K.home).map(function (id) { return K.home[id]; }).filter(function (h) { return SIM.acct('hh:' + h); });
  if (mess && mess.balance > 0 && homes.length) { var each = Math.floor(mess.balance / homes.length); if (each > 0) homes.forEach(function (h) { SIM.pay(mess.id, 'hh:' + h, each, 'remittance', true); }); }
  /* the purse: under `recallDays` of the crew's wages, the crew comes home */
  var day = C.people.length * ISLE.houseHours() * ISLE.TUNE.sim.money.m1.wage;
  if (daily && SIM.acct(H.id).balance < HS.recallDays * day) ISLE.expReturn(C, minute, 'the house\'s purse');
};
/* the crew home and the boats' last loads landed: the last settling, the season's books, the dividend to the house's head */
ISLE.houseClose = function (C, minute) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions, HS = X.house, s = C.town, H = S.houses[s], K = H.camps[C.id]; if (!K || K.closed) return;
  ISLE.houseSettle(C, minute, false); K.closed = minute;
  var f0 = K.flows0, f1 = H.flows, d = function (side, why) { return ((f1[side] || {})[why] || 0) - ((f0[side] || {})[why] || 0); };
  var purse = SIM.acct(H.id).balance, revenue = d('in', 'haul'), provisions = d('out', 'provisions'), charter = d('out', 'charter');
  /* the wages: what left the house that it did not pay itself (core's payroll covering the camp's workplaces, less their takings) */
  var wages = K.purse0 + revenue - provisions - charter - purse;
  var hauled = {}; Object.keys(K.haul).forEach(function (g) { hauled[g] = K.haul[g]; });
  var handDays = C.people.length * Math.max(1, (minute - C.lands) / 1440);
  var season = { camp: C.id, sailed: C.sailed, home: minute, days: Math.round((minute - C.sailed) / 144) / 10, why: C.why, haul: hauled, handDays: Math.round(handDays), revenue: revenue, wages: Math.round(wages), provisions: provisions, charter: charter, profit: Math.round(revenue - wages - provisions - charter), purse: purse };
  var over = purse - H.capital * (1 + HS.keep);
  if (over > 0 && H.head && SIM.acct(H.head)) season.dividend = ISLE.housePay(H, H.id, H.head, over * HS.dividend, 'dividend');
  H.seasons.push(season);
  SIM.logEvent('house season', { house: H.id, camp: C.id, profit: season.profit, dividend: season.dividend || 0 });
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
      settled: H.settled.map(function (e) { return Object.assign({}, e); }), camps: camps, minted: (((SIM.MONEY.books[s] || {})[A.currency]) || {}).minted || 0 }; });
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
    badD.length ? badD.join('; ') : towns.map(function (s) { return s + ': ' + b.houses[s].decisions.map(function (D) { return (D.go ? 'sailed for ' + D.days + ' days' : 'declined (' + D.why + ')') + ' expecting ' + D.revenue + ' against ' + (D.wages + D.food + D.charter); }).join(', '); }).join('; '));
  var done = []; towns.forEach(function (s) { b.houses[s].seasons.forEach(function (x) { done.push({ s: s, x: x }); }); });
  if (done.length) ok('every season booked: its haul, wages, provisions and charter, its profit or loss, the house\'s purse (reported)', done.every(function (d) { return d.x.revenue >= 0 && d.x.wages >= 0 && d.x.profit === Math.round(d.x.revenue - d.x.wages - d.x.provisions - d.x.charter); }),
    done.map(function (d) { var x = d.x; return d.s + ' ' + x.days + ' days (' + x.why + '): sold ' + x.revenue + ', wages ' + x.wages + ', provisions ' + x.provisions + ', charter ' + x.charter + ' = ' + (x.profit >= 0 ? 'profit ' : 'loss ') + Math.abs(x.profit) + (x.dividend ? ', dividend ' + x.dividend : '') + '; purse ' + x.purse; }).join('; '));
  return res;
};
