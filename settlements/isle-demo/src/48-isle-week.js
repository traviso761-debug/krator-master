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
    var U = S.uses || {};
    Object.keys(E.goods).forEach(function (g) {
      var r = St.by[g]; T.goods[g] = { total: r ? r.total : 0, made: E.made[g] || 0, used: E.used[g] || 0, imported: E.imported[g] || 0, exported: E.exported[g] || 0,
        bought: (B.bought || {})[g] || 0, eaten: (B.eaten || {})[g] || 0,
        short: (E.short[g] || 0) + ((B.outOf || {})[g] || 0) + ((U.short || {})[s + ':' + g] || 0) };
    });
    X.econ.foods.forEach(function (f) { T.food += E.made[f] || 0; });
    T.sold = Object.assign({}, (S.buyersSold || {})[s] || {});
    /* the tools and the household pots: who keeps one, who holds it, who is on an errand for it */
    var Wr = { tooled: 0, held: 0, errand: 0, pots: 0, potHeld: 0, potErrand: 0, dressed: 0, clad: 0, hurt: 0, hurtOld: 0 }, today = Math.floor(out.minute / 1440), HL = (I.heal == null ? 3 : I.heal) + 1;
    SIM.all('actor').forEach(function (a) { if (a.driven || SIM.settlementOf(a) !== s) return;
      if (a.tool || a.toolNeed) { Wr.tooled++; if (a.tool) Wr.held++; else if (a.errand && a.errand.item === a.toolNeed) Wr.errand++; }
      if ((a.wears || []).indexOf('pot') >= 0) { Wr.pots++; if (SIM.owns(a, 'pot')) Wr.potHeld++; else if (a.errand && a.errand.item === 'pot') Wr.potErrand++; }
      /* the clothes kept: every kept kind held to its count, or an errand out for one; a hurt not healed past its days */
      if (a.wears && a.wears.length) { Wr.dressed++; var ok = a.wears.every(function (k) { return k === 'pot' || SIM.owns(a, k) >= ((a.keep && a.keep[k]) || a.sets || 1); });
        if (ok || (a.errand && a.wears.indexOf(a.errand.item) >= 0)) Wr.clad++; }
      if (a.hurt != null) { Wr.hurt++; if (today - a.hurt > HL) Wr.hurtOld++; } });
    T.wear = Wr;
    /* the needs (77-sim-6-needs.js): each meter's mean, the mean happiness, as read now (SIM.needsPeek: nobody moved) */
    var NE = SIM.NEED; if (NE) { var nd = NE.list.map(function () { return 0; }), hp = 0, nn = 0, mm = out.minute;
      SIM.all('actor').forEach(function (a) { if (a.driven || !a.nd || SIM.settlementOf(a) !== s) return; var v = SIM.needsPeek(a, mm); if (!v) return;
        v.forEach(function (x, i) { nd[i] += x; }); hp += SIM.happiness(a, v); nn++; });
      T.needs = { n: nn, happy: nn ? hp / nn : 0, mean: {} }; NE.list.forEach(function (k, i) { T.needs.mean[k] = nn ? nd[i] / nn : 0; }); }
    /* the governor's view of the town's food: its supply line and its target (cover days of demand) */
    var GV = ISLE.simGoverned(s), GC = ISLE.TUNE.sim.economy.govern; T.gov = { pos: 0, target: 0 };
    if (GC) X.econ.foods.forEach(function (f) { var v = GV[f]; if (v) { T.gov.pos += v.pos; T.gov.target += GC.cover * v.use; } });
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
  /* a snapshot at each midnight too (the shortfall and the stock checks), its time kept out of the week's */
  var days = [], snapMs = 0, snap = function (m) { if (m % 1440) return; var t = Date.now(); days.push(ISLE.weekSnap()); snapMs += Date.now() - t; };
  try { a = ISLE.weekSnap(); t0 = Date.now(); ISLE.simRun(minutes, snap); ms = Date.now() - t0 - snapMs; b = ISLE.weekSnap(); } finally { SIM.decide = dec; }
  var decided = per[other] || 0, moved = per[me] || 0;
  return { town: town, watched: me, abstract: other, minutes: minutes, ms: ms, a: a, b: b, days: days, decided: decided, moved: moved, people: who0 };
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
  /* the ships from beyond the isles bought what the towns make for them (the cloves and the cacao): over the two weeks,
     at least three quarters of what was made, at either level (the governor keeps three days of each in hand, so
     the stock grows while the towns fill) */
  var buy = [];
  ['clove', 'cacao'].forEach(function (g) { var made = 0, sold = 0;
    weeks.forEach(function (W) { Object.keys(W.b.towns).forEach(function (s) { var A = W.a.towns[s], Bt = W.b.towns[s];
      made += (Bt.goods[g] ? Bt.goods[g].made : 0) - (A.goods[g] ? A.goods[g].made : 0); sold += (Bt.sold[g] || 0) - (A.sold[g] || 0); }); });
    buy.push({ g: g, made: made, sold: sold }); });
  ok('the ships from beyond the isles bought the cloves and the cacao the towns made', buy.every(function (x) { return x.made > 0 && x.sold >= 0.75 * x.made; }),
    buy.map(function (x) { return x.g + ' ' + x.sold + ' bought of ' + x.made + ' made'; }).join('; '));
  /* the other town's foods eaten (2026-10-26, `trade.diet`): over the two weeks each imported food bought a person a day
     within half to twice its ration, and the canoes landed at least three quarters of what was bought */
  var DT = (ISLE.TUNE.sim.trade && ISLE.TUNE.sim.trade.diet) || {}, eat = [];
  Object.keys(DT).forEach(function (s) { Object.keys(DT[s]).forEach(function (g) { var bought = 0, landed = 0, days = 0, ppl = ISLE.SIM.towns[s] ? ISLE.SIM.towns[s].pop.actors : 0;
    weeks.forEach(function (W) { var A = W.a.towns[s].goods[g] || {}, Bt = W.b.towns[s].goods[g] || {}; bought += (Bt.bought || 0) - (A.bought || 0); landed += (Bt.imported || 0) - (A.imported || 0); days += (W.b.minute - W.a.minute) / 1440; });
    eat.push({ s: s, g: g, per: ppl && days ? bought / ppl / days : 0, plan: DT[s][g], bought: bought, landed: landed }); }); });
  ok('the other town\'s foods eaten near their ration and landed by the canoes', eat.every(function (x) { return x.per >= 0.5 * x.plan && x.per <= 2 * x.plan && x.landed >= 0.75 * x.bought; }),
    eat.map(function (x) { return x.s + ' ' + x.g + ' ' + x.per.toFixed(3) + ' a person a day (ration ' + x.plan + '), ' + x.bought + ' bought, ' + x.landed + ' landed'; }).join('; ') || 'none');
  /* the households' restocking spread out (2026-10-26, core's `stagger` and the opening stores' spread): the food the
     watched town's households buy a day, from its third day, varies by at most `wave` (its standard deviation over its
     mean); in step, every house buying on the same morning, it swung by 0.7 on a three-day round */
  var wv = o.wave == null ? 0.25 : o.wave, waves = [];
  weeks.forEach(function (W) { var s = W.watched, D = [W.a].concat(W.days || []), fo = ISLE.SIM.towns[s].econ.foods, v = [];
    var tot = function (x) { var n = 0; fo.forEach(function (g) { n += (x.towns[s].goods[g] || {}).bought || 0; }); return n; };
    for (var i = 1; i < D.length; i++) if (Math.round(D[i].minute / 1440) - Math.round(W.a.minute / 1440) >= 3) v.push(tot(D[i]) - tot(D[i - 1]));
    var m = v.reduce(function (p, c) { return p + c; }, 0) / Math.max(1, v.length), sd = Math.sqrt(v.reduce(function (p, c) { return p + (c - m) * (c - m); }, 0) / Math.max(1, v.length));
    waves.push({ s: s, n: v.length, m: m, cv: m > 0 ? sd / m : 1 }); });
  ok('the watched town\'s households buy their food steadily (a day\'s buying within ' + wv + ' of its mean, its standard deviation)', waves.every(function (x) { return x.n >= 2 && x.cv <= wv; }),
    waves.map(function (x) { return x.s + ' ' + Math.round(x.m) + ' a day, ' + x.cv.toFixed(3) + ' over ' + x.n + ' days'; }).join('; '));
  /* the governor's regression checks (49), on the midnight snapshots: no good short after the second day; each good's
     stock steady (its mean day-to-day change at most `swing` of its mean, where it holds `swingMin` or more; not the
     goods the ships buy, drawn a thousand at a call); each town's food supply line (the governor's position) holding,
     its trend at most `drift` of what it eats a day, or moving toward its target, or within `near` of it on the mean (a
     governor relearning its capacity after the level changes runs a day or two off; a town filling from its opening stock,
     or drawing down what it made at the abstract level, is the governor at work; a pile above the target or a drain
     below it is not). From the second day of each week */
  var nr = o.near == null ? 0.05 : o.near, sw = o.swing == null ? 0.3 : o.swing, swMin = o.swingMin == null ? 500 : o.swingMin, dr = o.drift == null ? 0.03 : o.drift;
  var late = [], wide = [], drift = [], nSw = 0;
  var BU = ISLE.TUNE.sim.trade && ISLE.TUNE.sim.trade.buyers, lumpy = {};
  if (BU) BU.ships.forEach(function (sh) { Object.keys(sh.buys).forEach(function (g) { lumpy[g] = 1; }); });
  if (ISLE.SIM.hamlets) ISLE.SIM.hamlets.villages.forEach(function (X) { X.makes.forEach(function (g) { lumpy[X.parent + ':' + g] = 1; }); });   /* in their town, the villages' goods come by the road a cart's load at a time (47h) */
  var DTL = ISLE.TUNE.sim.trade && ISLE.TUNE.sim.trade.diet; if (DTL) Object.keys(DTL).forEach(function (s) { Object.keys(DTL[s]).forEach(function (g) { lumpy[s + ':' + g] = 1; }); });   /* in the town that eats it, an imported food lands by the lakatoi in lumps */
  weeks.forEach(function (W) { var D = [W.a].concat(W.days || []);
    for (var i = 1; i < D.length; i++) { var day = Math.round(D[i].minute / 1440); if (day <= 2) continue;
      Object.keys(D[i].towns).forEach(function (s) { var A = D[i - 1].towns[s].goods, B = D[i].towns[s].goods;
        Object.keys(B).forEach(function (g) { var x = (B[g].short || 0) - (A[g] ? A[g].short || 0 : 0); if (x > 0) late.push(W.watched + ' watched, day ' + day + ', ' + s + ' ' + g + ' ' + x); }); }); }
    var F = D.filter(function (x) { return Math.round(x.minute / 1440) >= 2; }); if (F.length < 3) return;
    Object.keys(F[0].towns).forEach(function (s) {
      Object.keys(F[0].towns[s].goods).forEach(function (g) { var m = 0, d = 0; if (lumpy[g] || lumpy[s + ':' + g]) return;
        F.forEach(function (x, j) { m += x.towns[s].goods[g].total; if (j) d += Math.abs(x.towns[s].goods[g].total - F[j - 1].towns[s].goods[g].total); });
        m /= F.length; d /= F.length - 1; if (m < swMin) return; nSw++;
        if (d > sw * m) wide.push(W.watched + ' watched, ' + s + ' ' + g + ' ' + Math.round(100 * d / m) + '% of ' + Math.round(m)); });
      /* the supply line's trend a day: a least-squares slope over the days (the stores refill in waves, so not end to end) */
      var foods = ISLE.SIM.towns[s].econ.foods, A = F[0].towns[s].goods, B = F[F.length - 1].towns[s].goods, days = (F[F.length - 1].minute - F[0].minute) / 1440, ate = 0;
      foods.forEach(function (g) { if (!B[g]) return; ate += (B[g].used - A[g].used) - (B[g].bought - A[g].bought) + (B[g].eaten - A[g].eaten); });
      var xs = F.map(function (x) { return x.minute / 1440; }), ys = F.map(function (x) { return x.towns[s].gov.pos; });
      var gap = F.reduce(function (p, x) { return p + x.towns[s].gov.target - x.towns[s].gov.pos; }, 0) / F.length,
        tgt = F.reduce(function (p, x) { return p + x.towns[s].gov.target; }, 0) / F.length;
      var mx = xs.reduce(function (p, c) { return p + c; }, 0) / xs.length, my = ys.reduce(function (p, c) { return p + c; }, 0) / ys.length, nu = 0, de = 0;
      xs.forEach(function (x, j) { nu += (x - mx) * (ys[j] - my); de += (x - mx) * (x - mx); });
      drift.push({ w: W.watched, s: s, ch: de > 0 ? nu / de : 0, ate: ate / days, gap: gap, tgt: tgt }); }); });
  ok('no good short after the second day (households, economy draws, uses)', !late.length, late.length ? late.length + ' shortfalls: ' + late.slice(0, 4).join('; ') : 'both weeks, both towns, every good');
  ok('each good\'s stock steady: its day-to-day change at most ' + Math.round(100 * sw) + '% of its mean', nSw > 0 && !wide.length,
    nSw + ' town-goods over two weeks' + (wide.length ? '; WIDE: ' + wide.slice(0, 4).join('; ') : ''));
  var holds = function (x) { return x.ate > 0 && (Math.abs(x.ch) <= dr * x.ate || (x.gap > 0 && x.ch > 0) || (x.gap < 0 && x.ch < 0) || Math.abs(x.gap) <= nr * x.tgt); };
  ok('each town\'s food supply line holds (its trend at most ' + Math.round(100 * dr) + '% of what it eats a day), moves toward its target or stays within ' + Math.round(100 * nr) + '% of it', drift.length === 4 && drift.every(holds),
    drift.map(function (x) { return x.w + ' watched, ' + x.s + ' ' + (x.ch > 0 ? '+' : '') + Math.round(x.ch) + ' a day of ' + Math.round(x.ate) + ' eaten, ' + Math.round(x.gap) + ' below its target' + (holds(x) ? '' : ' (AWAY)'); }).join('; '));
  /* the tools and the pots (PLAN.md 9b): at each week's end, in each town, at least `gear` of the workers of a tooled
     trade hold their tool or are on an errand for it, and of the households' pot keepers a pot (a broken one is bought
     on time off, in work time for a tool; a worker caught between errands counts against) */
  var gr = o.gear == null ? 0.98 : o.gear, gear = [];
  weeks.forEach(function (W) { Object.keys(W.b.towns).forEach(function (s) { var X = W.b.towns[s].wear; if (!X) return;
    var qt = X.tooled ? (X.held + X.errand) / X.tooled : 0, qp = X.pots ? (X.potHeld + X.potErrand) / X.pots : 0;
    gear.push({ w: W.watched, s: s, qt: qt, qp: qp, X: X }); }); });
  ok('the tooled trades hold their tools and the households their pots (at least ' + Math.round(100 * gr) + '%)', gear.length === 4 && gear.every(function (x) { return x.qt >= gr && x.qp >= gr; }),
    gear.map(function (x) { return x.w + ' watched, ' + x.s + ': tools ' + x.X.held + '+' + x.X.errand + ' of ' + x.X.tooled + ', pots ' + x.X.potHeld + '+' + x.X.potErrand + ' of ' + x.X.pots; }).join('; '));
  /* the clothes and the hurt (PLAN.md 9b steps 2 and 5), in the watched town (the abstract one wears nothing): at least
     `clad` of its people keep their sets of everything they wear or are buying what they lack, and nobody hurt is
     still hurt past its healing days (a poultice bought, or healed) */
  var cl = o.clad == null ? 0.95 : o.clad, dress = [];
  weeks.forEach(function (W) { var X = W.b.towns[W.watched] && W.b.towns[W.watched].wear; if (X) dress.push({ w: W.watched, X: X, q: X.dressed ? X.clad / X.dressed : 0 }); });
  ok('the watched town' + '\'' + 's people keep their clothes (at least ' + Math.round(100 * cl) + '%) and nobody stays hurt past its healing days', dress.length === 2 && dress.every(function (x) { return x.q >= cl && !x.X.hurtOld; }),
    dress.map(function (x) { return x.w + ' watched: ' + x.X.clad + ' of ' + x.X.dressed + ' clad, ' + x.X.hurt + ' hurt, ' + x.X.hurtOld + ' past healing'; }).join('; '));
  /* the needs, in the watched town at each week's end (the abstract town's people do not decide: its meters stand
     still): its mean happiness at least `happy`, and no need's mean meter above `needHi` but material (nothing to buy
     yet but what wears out: KNOWN_ISSUES.md) */
  var hpMin = o.happy == null ? 60 : o.happy, nHi = o.needHi == null ? 70 : o.needHi, nd = [];
  weeks.forEach(function (W) { var X = W.b.towns[W.watched] && W.b.towns[W.watched].needs; if (!X) return;
    var hi = Object.keys(X.mean).filter(function (k) { return k !== 'material' && X.mean[k] > nHi; });
    nd.push({ w: W.watched, X: X, hi: hi }); });
  ok('the watched town' + '\'' + 's people content enough (mean happiness at least ' + hpMin + ', no need but material above ' + nHi + ' on the mean)', nd.length === 2 && nd.every(function (x) { return x.X.happy >= hpMin && !x.hi.length; }),
    nd.map(function (x) { return x.w + ' watched: happiness ' + x.X.happy.toFixed(1) + '; ' + Object.keys(x.X.mean).map(function (k) { return k + ' ' + x.X.mean[k].toFixed(0); }).join(', ') + (x.hi.length ? ' (HIGH: ' + x.hi.join(', ') + ')' : ''); }).join('; '));
  /* nobody in the abstract town decided; the watched town's people did */
  ok('nobody in the abstract town decided (the watched town\'s people did)', weeks.every(function (W) { return W.decided === 0 && W.moved > 0; }),
    weeks.map(function (W) { return W.abstract + ' abstract (' + W.people + ' people): ' + W.decided + ' decisions; ' + W.watched + ' watched: ' + W.moved + ' decisions'; }).join('; '));
  return out;
};
