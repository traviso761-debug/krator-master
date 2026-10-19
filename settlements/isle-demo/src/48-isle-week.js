/* ============================== 7i. THE LEVELS AND THE WEEK TEST (P7d) ============================== */
/* [G data] The town in the window runs PRESENTED, the other ABSTRACT (core/simulation 77-sim-7-lod.js, SCHEMA.md "The three
   levels"): its actors neither decide nor move, its economy makes by the workers its schedule has at work, its carts make
   timed trips, its households eat and restock by the hour, and the canoe line ticks as ever. PLAN.md section 7's week
   test: a week with Valapo watched (Kautoa abstract), then a week the other way.
     ISLE.simWatch(town)        that town presented, every other abstract
     ISLE.weekSnap()            each town's books (per good: its stocks' total; made, used, imported and exported; bought
                                and eaten), its food made, its workers; each route's shipped and landed and what is at sea
     ISLE.simWeek(town, minutes)  watch the town, snapshot, run the minutes (a week), snapshot: {town, abstract, ms, a, b,
                                decided: the decisions made in the abstract town (SIM.decide counted for the run), moved:
                                in the watched town}
     ISLE.weekChecks(w1, w2)    over each week, per town and good: change = made + imported - exported - consumed (consumed
                                = used - bought into households + eaten); every load shipped landed or at sea; the loads
                                toward the abstract town landed and booked there; each town's food made a worker a day
                                abstract within a band of the same town's watched; nobody in the abstract town decided */
ISLE.simWatch = function (town) {
  var S = ISLE.SIM, me = ISLE.TUNE.sim.towns[town].id;
  S.order.forEach(function (s) { SIM.level(s, s === me ? 'presented' : 'abstract'); });
  S.watched = town; return me;
};
ISLE.weekSnap = function () {
  var S = ISLE.SIM, I = SIM.ITEMS, out = { minute: SIM.minute(), towns: {}, routes: {} };
  S.order.forEach(function (s) {
    var E = SIM.econ(s), St = SIM.stocks(s), B = (I.statsBy || {})[s] || {}, X = S.towns[s], T = { goods: {}, food: 0, workers: X.pop.workers };
    Object.keys(E.goods).forEach(function (g) {
      var r = St.by[g]; T.goods[g] = { total: r ? r.total : 0, made: E.made[g] || 0, used: E.used[g] || 0, imported: E.imported[g] || 0, exported: E.exported[g] || 0,
        bought: (B.bought || {})[g] || 0, eaten: (B.eaten || {})[g] || 0 };
    });
    X.econ.foods.forEach(function (f) { T.food += E.made[f] || 0; });
    out.towns[s] = T;
  });
  var rep = SIM.tradeReport ? SIM.tradeReport() : {};
  Object.keys(rep || {}).forEach(function (id) { var R = rep[id], sea = {};
    R.carriers.forEach(function (C) { if (!C.to || C.at) return; var k = (R.stops[0] === C.to ? R.stops[1] : R.stops[0]) + '>' + C.to; C.cargo.forEach(function (c) { var o = sea[k] || (sea[k] = {}); o[c.good] = (o[c.good] || 0) + c.n; }); });
    out.routes[id] = { shipped: R.shipped, landed: R.landed, sea: sea }; });
  return JSON.parse(JSON.stringify(out));
};
ISLE.simWeek = function (town, minutes) {
  var S = ISLE.SIM, me = ISLE.simWatch(town), other = S.order.filter(function (s) { return s !== me; })[0];
  var who = function (s) { return SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === s; }); };
  /* the decisions made in the week, counted by town (SIM.decide wrapped for the run, then restored) */
  var who0 = who(other).length, per = {}, dec = SIM.decide;
  SIM.decide = function (x) { var k = SIM.settlementOf(x); per[k] = (per[k] || 0) + 1; return dec.apply(this, arguments); };
  var a, b, ms, t0;
  try { a = ISLE.weekSnap(); t0 = Date.now(); ISLE.simRun(minutes); ms = Date.now() - t0; b = ISLE.weekSnap(); } finally { SIM.decide = dec; }
  var decided = per[other] || 0, moved = per[me] || 0;
  return { town: town, watched: me, abstract: other, minutes: minutes, ms: ms, a: a, b: b, decided: decided, moved: moved, people: who0 };
};
ISLE.weekChecks = function (w1, w2, o) {
  o = o || {}; var out = [], band = o.band || [0.6, 1.6];
  var ok = function (name, pass, detail) { out.push({ name: 'the week test: ' + name, ok: !!pass, detail: detail }); };
  var weeks = [w1, w2];
  /* the books over each week */
  var off = [], n = 0;
  weeks.forEach(function (W) { Object.keys(W.b.towns).forEach(function (s) { var A = W.a.towns[s].goods, B = W.b.towns[s].goods;
    Object.keys(B).forEach(function (g) { var d = function (k) { return B[g][k] - (A[g] ? A[g][k] : 0); }; n++;
      var r = d('total') - (d('made') + d('imported') - d('exported') - (d('used') - d('bought') + d('eaten')));
      if (Math.abs(r) > 1) off.push(W.watched + ' watched, ' + s + ' ' + g + ' ' + Math.round(r)); }); }); });
  ok('each town\'s books balance over a week at either level (change = made + imported - exported - consumed)', n > 0 && !off.length,
    n + ' town-goods over two weeks' + (off.length ? '; OFF: ' + off.slice(0, 4).join('; ') : ''));
  /* every load shipped landed or is at sea, at the end of each week */
  var lost = [];
  weeks.forEach(function (W) { Object.keys(W.b.routes).forEach(function (id) { var R = W.b.routes[id];
    Object.keys(R.shipped).forEach(function (k) { Object.keys(R.shipped[k]).forEach(function (g) { var sh = R.shipped[k][g], la = (R.landed[k] || {})[g] || 0, se = (R.sea[k] || {})[g] || 0;
      if (sh !== la + se) lost.push(W.watched + ' watched, ' + id + ' ' + k + ' ' + g + ': ' + sh + ' shipped, ' + la + ' landed, ' + se + ' at sea'); }); }); }); });
  ok('every load shipped has landed or is at sea', !lost.length, lost.length ? lost.slice(0, 3).join('; ') : 'both weeks, every route');
  /* the loads toward the abstract town: landed in the week, and booked there as imports */
  var into = [];
  weeks.forEach(function (W) { var s = W.abstract, land = 0, imp = 0;
    Object.keys(W.b.routes).forEach(function (id) { Object.keys(W.b.routes[id].landed).forEach(function (k) { if (k.split('>')[1] !== s) return;
      var L1 = W.b.routes[id].landed[k], L0 = (W.a.routes[id] && W.a.routes[id].landed[k]) || {}; for (var g in L1) land += L1[g] - (L0[g] || 0); }); });
    var A = W.a.towns[s].goods, B = W.b.towns[s].goods; for (var g in B) imp += B[g].imported - (A[g] ? A[g].imported : 0);
    into.push({ s: s, land: land, imp: imp }); });
  ok('the loads that sailed to the abstract town landed and are booked there', into.every(function (x) { return x.land > 0 && x.land === x.imp; }),
    into.map(function (x) { return x.s + ' (abstract): ' + x.land + ' landed, ' + x.imp + ' booked imported'; }).join('; '));
  /* each town's food made a worker a day, abstract against watched */
  var rate = function (W, s) { var d = (W.b.minute - W.a.minute) / 1440; return (W.b.towns[s].food - W.a.towns[s].food) / Math.max(1, W.b.towns[s].workers) / Math.max(1e-9, d); };
  var rows = [];
  weeks.forEach(function (W) { var s = W.abstract, Wp = weeks.filter(function (V) { return V.watched === s; })[0]; if (!Wp) return;
    var ab = rate(W, s), pr = rate(Wp, s); rows.push({ s: s, ab: ab, pr: pr, q: pr > 0 ? ab / pr : 0 }); });
  ok('a town\'s food made a worker a day, abstract, within ' + band.join('-') + ' of the same town watched', rows.length === 2 && rows.every(function (r) { return r.q >= band[0] && r.q <= band[1]; }),
    rows.map(function (r) { return r.s + ' ' + r.ab.toFixed(1) + ' abstract, ' + r.pr.toFixed(1) + ' watched (' + r.q.toFixed(2) + ')'; }).join('; '));
  /* nobody in the abstract town decided; the watched town's people did */
  ok('nobody in the abstract town decided (the watched town\'s people did)', weeks.every(function (W) { return W.decided === 0 && W.moved > 0; }),
    weeks.map(function (W) { return W.abstract + ' abstract (' + W.people + ' people): ' + W.decided + ' decisions; ' + W.watched + ' watched: ' + W.moved + ' decisions'; }).join('; '));
  return out;
};
