/* ============================== 7h. THE CANOE LINE BETWEEN THE TOWNS (P7c) ============================== */
/* [G data] Kautoa and Valapo trade by sea on core/simulation's SIM.trade (77-sim-6-trade.js), tuned by ISLE.TUNE.sim.trade
   (the owner's timetable, 2026-10-19: two lakatoi a day, one each way; an oruwa for light, urgent goods):
     - THE CANOE STOPS: each town's trade landing (32: R.landings, with a berth for each vessel) is a place of the town
       (40: kind 'canoe stop', its dockers' posts), with a site store: a load lands there and the carts take it on to the
       warehouses, as from any producer;
     - THE LINES: one SIM.trade route each, on the timer, their stops Kautoa's canoe stop then Valapo's; a carrier leaving
       buys from its town's warehouses what the other town wants and this one can spare (its `goods`), books it exported,
       is at sea in neither town's stock (outbound for the sender, inbound for the receiver), lands into the other stop's
       store and is booked imported;
     - THE USES: every hour each town draws on its warehouses what it uses of the other's goods (`uses`, a person a day):
       that use, and what it could not get, are the want the line serves (a town that never had a good shows its want by
       its unmet draws).
     ISLE.simTrade()            after both towns are declared (40); returns the routes
     ISLE.tradeBooks()          a snapshot: each route's shipped, landed and carriers; each town's imports and exports by
                                good (its economy's books), its stocks' rows of the traded goods (inbound, outbound, today's
                                flows); the berths
     ISLE.tradeChecks(books)    the berths afloat and clear; the lakatoi sailing both ways with loads; a load traced from
                                Valapo's warehouses to Kautoa's and back; each town's books showing the other's goods
                                imported; what is at sea counted as in transit; the books balancing in both towns */
ISLE.simTrade = function () {
  var S = ISLE.SIM, T = ISLE.TUNE.sim.trade, towns = S.order.slice(), out = { routes: [], stops: {} };
  if (towns.length < 2 || !T) return out;
  towns.forEach(function (s) { var id = s + '.stop'; if (SIM.R.place[id]) { SIM.store(id, { kind: 'site' }); out.stops[s] = id; } });
  var pair = ['kautoa', 'valapo'].filter(function (s) { return out.stops[s]; }); if (pair.length < 2) return out;
  T.lines.forEach(function (L) {
    SIM.trade({ id: L.id, stops: pair.map(function (s) { return { settlement: s, place: out.stops[s] }; }), cap: L.cap, carriers: L.carriers, minutes: L.minutes, mins: L.mins,
      keep: L.keep, want: L.want, goods: L.goods });
    out.routes.push(L.id);
  });
  /* the uses: each town's people counted once, the hourly draw carried in fractions */
  S.uses = { pop: {}, carry: {}, drawn: {}, short: {} };
  towns.forEach(function (s) { S.uses.pop[s] = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === s; }).length; });
  SIM.stepHooks.push(ISLE.simUses);
  return out;
};
ISLE.simUses = function (minute) {
  if (minute % 60) return;
  var S = ISLE.SIM, U = S.uses, T = ISLE.TUNE.sim.trade.uses;
  Object.keys(T).forEach(function (s) {
    if (!U.pop[s]) return;
    Object.keys(T[s]).forEach(function (g) {
      var k = s + ':' + g, c = (U.carry[k] || 0) + T[s][g] * U.pop[s] / 24, n = Math.floor(c); U.carry[k] = c - n; if (n <= 0) return;
      var got = SIM.supply(g, n, false, s); U.drawn[k] = (U.drawn[k] || 0) + got; if (got < n) U.short[k] = (U.short[k] || 0) + n - got;
    });
  });
};
ISLE.tradeBooks = function () {
  var S = ISLE.SIM, T = ISLE.TUNE.sim.trade, rep = SIM.tradeReport ? SIM.tradeReport() : {}, out = { routes: rep, towns: {}, minute: SIM.minute(), atSea: {}, berths: {} };
  var goods = {}; T.lines.forEach(function (L) { Object.keys(L.goods).forEach(function (s) { L.goods[s].forEach(function (g) { goods[g] = 1; }); }); });
  out.goods = Object.keys(goods).sort();
  S.order.forEach(function (s) {
    var E = SIM.econ(s), St = SIM.stocks ? SIM.stocks(s) : null, rows = {};
    out.goods.forEach(function (g) { var r = St && St.by[g]; if (!r) return;
      rows[g] = { total: r.total, inbound: r.inbound || 0, outbound: r.outbound || 0, today: r.today ? { made: r.today.made || 0, imported: r.today.imported || 0, exported: r.today.exported || 0,
        consumed: r.today.consumed || 0, change: r.today.change || 0 } : null, imported: E.imported[g] || 0, exported: E.exported[g] || 0, used: E.used[g] || 0, hauled: E.hauled[g] || 0 }; });
    out.towns[s] = { rows: rows, drawn: {}, short: {} };
    Object.keys((S.uses || {}).drawn || {}).forEach(function (k) { var p = k.split(':'); if (p[0] === s) out.towns[s].drawn[p[1]] = S.uses.drawn[k]; });
    Object.keys((S.uses || {}).short || {}).forEach(function (k) { var p = k.split(':'); if (p[0] === s) out.towns[s].short[p[1]] = S.uses.short[k]; });
  });
  /* what is at sea, by the carriers themselves: toward and from each town */
  Object.keys(rep).forEach(function (id) { rep[id].carriers.forEach(function (C) { if (!C.to) return; C.cargo.forEach(function (c) {
    var k = C.to + '<' + c.good, f = (rep[id].stops[0] === C.to ? rep[id].stops[1] : rep[id].stops[0]) + '>' + c.good;
    out.atSea[k] = (out.atSea[k] || 0) + c.n; out.atSea[f] = (out.atSea[f] || 0) + c.n; }); }); });
  S.order.forEach(function (s) { var P = SIM.R.place[s + '.stop']; out.berths[s] = P && P.tags.berths ? P.tags.berths.map(function (B) { return Object.assign({}, B); }) : []; });
  return out;
};
/* the checks, on a snapshot (the negatives change a copy); plans: {town: {R, G}}, the plan and the ground the berths float on */
ISLE.tradeChecks = function (books, plans) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: 'the canoe line: ' + name, ok: !!pass, detail: detail }); };
  var R = books.routes, lk = R.lakatoi || { shipped: {}, landed: {}, voyages: 0, carriers: [] }, T = ISLE.TUNE.sim, sum = function (o) { var n = 0; for (var k in o || {}) n += o[k]; return n; };
  /* the berths: two at each stop, each afloat (bow, middle and stern in water) and clear of the moored vessels */
  var bad = [], nb = 0;
  Object.keys(books.berths).forEach(function (s) {
    var town = ISLE.SIM.towns[s].town, P = plans[town];
    books.berths[s].forEach(function (B) { nb++;
      var h = P.G.h, s0 = Math.sin(B.heading), c0 = Math.cos(B.heading), dry = [0, 0.45, -0.45].some(function (q) { return h(B.x + s0 * q * B.L, B.z + c0 * q * B.L) > -0.8; });
      var hit = P.R.vessels.some(function (V) { return Math.hypot(V.x - B.x, V.z - B.z) < (V.L + B.L) / 2; });
      if (dry || hit) bad.push(B.id + (dry ? ' aground' : ' on a moored vessel')); });
  });
  ok('a berth at each canoe stop for the lakatoi and the oruwa, afloat and clear', nb === 2 * Object.keys(books.berths).length && nb > 0 && !bad.length,
    nb + ' berths' + (bad.length ? '; ' + bad.join(', ') : ''));
  /* the lakatoi both ways, with loads */
  var kv = sum(lk.shipped['kautoa>valapo']), vk = sum(lk.shipped['valapo>kautoa']);
  ok('the lakatoi sails both ways with loads (one leaves each town a day)', lk.voyages >= 2 && kv > 0 && vk > 0,
    lk.voyages + ' voyages, Kautoa to Valapo ' + JSON.stringify(lk.shipped['kautoa>valapo'] || {}) + ', Valapo to Kautoa ' + JSON.stringify(lk.shipped['valapo>kautoa'] || {}));
  /* a load traced: out of the sender's warehouses (exported), landed at the receiver's stop (imported), in the receiver's
     books and used there; both ways */
  var trace = function (a, b) {
    var L = lk.landed[a + '>' + b] || {}, g = Object.keys(L).sort(function (p, q) { return L[q] - L[p]; })[0]; if (!g) return { ok: false, why: 'nothing landed' };
    var A = books.towns[a].rows[g], B = books.towns[b].rows[g];
    var okk = A && B && A.exported >= L[g] && B.imported >= L[g] && (B.used > 0 || B.total > 0);
    return { ok: okk, why: g + ' ' + L[g] + ': exported by ' + a + ' ' + (A ? A.exported : '-') + ', imported by ' + b + ' ' + (B ? B.imported : '-') + ', used there ' + (B ? B.used : '-') };
  };
  var t1 = trace('valapo', 'kautoa'), t2 = trace('kautoa', 'valapo');
  ok('a load traced from Valapo\'s warehouses to Kautoa\'s, and one back', t1.ok && t2.ok, 'Valapo to Kautoa: ' + t1.why + '; Kautoa to Valapo: ' + t2.why);
  /* each town's books show the other's goods imported */
  var imp = function (s, g) { var r = books.towns[s].rows[g]; return r ? r.imported : 0; };
  var vi = T.trade.lines[0].goods.kautoa.filter(function (g) { return imp('valapo', g) > 0; }), ki = T.trade.lines[0].goods.valapo.filter(function (g) { return imp('kautoa', g) > 0; });
  ok('each town\'s books show the other\'s goods imported', vi.length > 0 && ki.length > 0,
    'Valapo imported ' + vi.map(function (g) { return g + ' ' + imp('valapo', g); }).join(', ') + '; Kautoa imported ' + ki.map(function (g) { return g + ' ' + imp('kautoa', g); }).join(', '));
  /* at sea: every unit the carriers hold toward a town is its stocks' inbound, from a town its outbound */
  var miss = [], seaN = 0;
  Object.keys(books.towns).forEach(function (s) { books.goods.forEach(function (g) { var r = books.towns[s].rows[g]; if (!r) return;
    var inb = books.atSea[s + '<' + g] || 0, outb = books.atSea[s + '>' + g] || 0; seaN += inb;
    if (r.inbound !== inb || r.outbound !== outb) miss.push(s + ' ' + g + ' inbound ' + r.inbound + '/' + inb + ', outbound ' + r.outbound + '/' + outb); }); });
  ok('what is at sea is counted in transit (inbound and outbound) in both towns\' stocks', seaN > 0 && !miss.length, seaN + ' units at sea' + (miss.length ? '; ' + miss.slice(0, 3).join('; ') : ''));
  /* the books: today's change is made + imported - exported - consumed in each town; and every unit shipped has landed
     or is at sea */
  var off = [];
  Object.keys(books.towns).forEach(function (s) { books.goods.forEach(function (g) { var r = books.towns[s].rows[g], f = r && r.today; if (!f) return;
    var d = f.made + f.imported - f.exported - f.consumed - f.change; if (Math.abs(d) > 1) off.push(s + ' ' + g + ' ' + d); }); });
  Object.keys(R).forEach(function (id) { ['kautoa>valapo', 'valapo>kautoa'].forEach(function (k) { var sh = R[id].shipped[k] || {}, la = R[id].landed[k] || {}, p = k.split('>');
    Object.keys(sh).forEach(function (g) { var sea = R[id].carriers.filter(function (C) { return C.to === p[1] && C.at == null; }).reduce(function (n, C) { return n + C.cargo.filter(function (c) { return c.good === g; }).reduce(function (m, c) { return m + c.n; }, 0); }, 0);
      if (sh[g] !== (la[g] || 0) + sea) off.push(id + ' ' + k + ' ' + g + ' shipped ' + sh[g] + ', landed ' + (la[g] || 0) + ', at sea ' + sea); }); }); });
  ok('the books balance in both towns (change = made + imported - exported - consumed; shipped = landed + at sea)', !off.length,
    off.length ? off.slice(0, 4).join('; ') : books.goods.length + ' goods in ' + Object.keys(books.towns).length + ' towns, ' + Object.keys(R).length + ' routes');
  return out;
};
