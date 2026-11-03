/* ============================== 7h3. MONEY: THE ACCOUNTS (PLAN-MONEY.md M0, 2026-11-03) ============================== */
/* [G data] core/simulation's money (77-sim-6-money.js) on the isles, tuned by ISLE.TUNE.sim.money (15): the Kautoan shell
   the Islanders' currency, the Izani Talent the traders'. M0 opens the accounts; nothing is paid yet (M1: wages and
   purchases). Each settlement (the towns, and the villages when a page hands them in) gets:
     - its TREASURY (`treasury:<s>`), `treasury` shells a person: it owns every workplace to start (PLAN-MONEY 2a);
     - a WORKPLACE account (`wp:<place>`) for every place with a recipe or wares, owned by the treasury, empty;
     - a HOUSEHOLD account (`hh:<home>`) for every home with people (not a barracks' mess), `endow` shells by the home's class;
     - its thieves' GUILD (`guild:<s>`, 47c), `guild` shells;
   and the crater's: the money changers' reserves (shells and Talents) and the traders from beyond (`foreign:beyond`, Talents).
   Every opening sum is minted and booked `endowment` or `reserve`, so the books balance from the first snapshot.
     ISLE.simMoney()            after the towns are declared (40) -> {currencies, accounts, supply by town}
     ISLE.simMoneyTown(s)       one settlement's accounts (the villages: 47h calls it)
     ISLE.moneyBooks()          a snapshot: the money report and the ledger's money
     ISLE.moneyChecks(a, b)     over two snapshots: every household, workplace, treasury and guild of a settlement has its
                                account in its nation's currency; every workplace owned by its own town's treasury; nobody
                                below zero; each settlement's money balanced to its books (the ledger) */
ISLE.simMoney = function () {
  var T = ISLE.TUNE.sim, K = T.money, S = ISLE.SIM; if (!K || !SIM.money) return null;
  var M1 = K.m1; SIM.money({ currencies: K.currencies, spread: K.spread, m1: M1 ? { wage: function () { return M1.wage; }, priceWage: M1.wage, calibrate: M1.calibrate, fallback: M1.fallback, ration: M1.ration !== false } : null, m2: K.m2 || null });
  Object.keys(K.changers || {}).forEach(function (c) { if (SIM.acct('changer:' + c)) SIM.mint('changer:' + c, K.changers[c], 'reserve'); });
  Object.keys(K.foreign || {}).forEach(function (c) { SIM.account({ id: 'foreign:beyond', owner: 'ships from beyond', kind: 'foreign', currency: c, name: 'the traders from beyond the isles' });
    SIM.mint('foreign:beyond', K.foreign[c], 'reserve'); });
  S.order.forEach(function (s) { ISLE.simMoneyTown(s); });
  if (M1) S.order.forEach(function (s) { SIM.moneyPrices(s); });   /* the towns' costs first: a village's foods are costed at its town's */
  var R = SIM.moneyReport(), sup = {}; S.order.forEach(function (s) { sup[s] = (R.towns[s] || {}); });
  return { currencies: Object.keys(K.currencies), accounts: SIM.accounts().length, towns: sup };
};
ISLE.currencyOf = function (s) { var K = ISLE.TUNE.sim.money, St = SIM.R.settlement[s], f = St && St.faction; return (K.nation || {})[f] || Object.keys(K.currencies)[0]; };
ISLE.simMoneyTown = function (s) {
  var K = ISLE.TUNE.sim.money, c = ISLE.currencyOf(s), tre = 'treasury:' + s, I = SIM.ITEMS, E = SIM.econ(s), out = { households: 0, workplaces: 0 };
  if (SIM.acct(tre)) return out;
  var places = SIM.all('place').filter(function (P) { return SIM.settlementOf(P.id) === s; }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
  var people = places.reduce(function (n, P) { return n + (P.people || 0); }, 0);
  var clsOf = {}; SIM.all('actor').forEach(function (a) { if (a.home != null && clsOf[a.home] == null && a.cls) clsOf[a.home] = a.cls; });   /* a home's class, from its people */
  SIM.account({ id: tre, owner: s, kind: 'treasury', currency: c, settlement: s, name: 'the treasury of ' + ((SIM.R.settlement[s] || {}).name || s) });
  SIM.mint(tre, Math.round((K.treasury || 0) * people), 'reserve');
  places.forEach(function (P) {
    if (P.people && P.mess) { SIM.account({ id: 'hh:' + P.id, owner: P.id, kind: 'mess', currency: c, settlement: s }); }   /* a barracks: its soldiers' wages (M1) */
    if (P.people && !P.mess) { var cls = P.cls || clsOf[P.id] || 'poor';
      SIM.account({ id: 'hh:' + P.id, owner: P.id, kind: 'household', currency: c, settlement: s }); SIM.mint('hh:' + P.id, (K.endow || {})[cls] || 0, 'endowment'); out.households++; }
    var works = (E && E.recipes && E.recipes[P.id]) || (I && I.sells && I.sells[P.id] && I.sells[P.id].length);
    if (works) { SIM.account({ id: 'wp:' + P.id, owner: P.id, kind: 'workplace', currency: c, settlement: s, ownedBy: tre }); out.workplaces++; }
  });
  if (SIM.MONEY.m1) SIM.moneyPrices(s);
  var G = SIM.guildOf && SIM.guildOf(s);
  if (G) { SIM.account({ id: 'guild:' + s, owner: G.id, kind: 'guild', currency: c, settlement: s, name: "the thieves' guild" }); SIM.mint('guild:' + s, K.guild || 0, 'reserve'); }
  return out;
};
ISLE.moneyBooks = function () { var hh = {}; SIM.accounts().forEach(function (A) { if (A.kind === 'household' || A.kind === 'mess') hh[A.id] = A.balance; });
  return { minute: SIM.minute(), report: SIM.moneyReport(), ledger: SIM.ledgerSnap(), m1: SIM.moneyM1(), households: hh, rel: SIM.MONEY && SIM.MONEY.m1 ? JSON.parse(JSON.stringify(SIM.MONEY.m1.rel)) : null,
    prices: SIM.MONEY && SIM.MONEY.m1 ? JSON.parse(JSON.stringify(SIM.MONEY.m1.price)) : null }; };
/* M1's checks, over two snapshots taken after the calibration: the prices whole, at least 1, and a made good dearer than
   its inputs' cost (bread over its taro); the wage bill paid in full each day (none unpaid); the circular flow in every
   settlement (the wages paid into its households = what they spent + what they saved); the dole's share reported */
ISLE.moneyM1Checks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'money M1: ' + name, ok: !!pass, detail: detail }); };
  var P = b.prices || {}, towns = Object.keys(P).filter(function (k) { return ISLE.SIM.order.indexOf(k) >= 0; }), badP = [];
  towns.forEach(function (s) { var E = SIM.econ(s), C = SIM.MONEY.m1.cost[s] || {};
    Object.keys(P[s]).forEach(function (g) { var p = P[s][g]; if (!(p >= 1) || Math.floor(p) !== p) badP.push(s + ' ' + g + ' ' + p);
      var made = Object.keys(E.recipes).some(function (id) { var R = E.recipes[id]; return R && R.out && R.out.indexOf(g) >= 0; }), In = E.inputs[g]; if (made && In && C[g] != null) { var ic = Object.keys(In).reduce(function (n, i) { return n + In[i] * (C[i] || 0); }, 0); if (C[g] < ic - 1e-9) badP.push(s + ' ' + g + ' costs less than its inputs'); } }); });
  ok('prices whole, at least 1, each made good dearer than its inputs', towns.length >= 2 && !badP.length,
    badP.length ? badP.slice(0, 4).join('; ') : towns.map(function (s) { return s + ' (markup ' + (b.m1.markup[s] || 1).toFixed(2) + '): bread ' + P[s].bread + ', fish ' + P[s].fish + ', garments ' + P[s].garments + ', tools ' + P[s].tools + ', a meal out ' + P[s].meal; }).join('; '));
  var days = function (k) { var A = (a.m1.days[k] || []).length; return (b.m1.days[k] || []).slice(A); };
  var all = Object.keys(b.m1.days), flow = [], unpaid = 0, live = all.every(function (k) { return days(k).every(function (d) { return d.wages > 0 || d.spent >= 0; }); });
  all.forEach(function (k) { var D = days(k), w = 0, sp = 0, dl = 0; D.forEach(function (d) { w += d.wages + (d.ration || 0); sp += d.spent; dl += d.dole; unpaid += d.unpaid; });
    var dh = 0; Object.keys(b.households).forEach(function (id) { var A = SIM.acct(id); if (A && (A.settlement == null ? '' : A.settlement) === k) dh += b.households[id] - (a.households[id] || 0); });
    flow.push({ k: k, w: w, sp: sp, dh: dh, dl: dl, ok: w === sp + dh && D.length > 0 }); });
  ok('the circular flow in every settlement: wages + rations = what its households spent + what they saved', b.m1.live && flow.length && flow.every(function (f) { return f.ok; }),
    flow.map(function (f) { return f.k + ' ' + f.w + ' = ' + f.sp + ' + ' + f.dh + (f.ok ? '' : ' (NOT)'); }).join('; '));
  var rs = {}; all.forEach(function (k) { var D = days(k), r = 0, due = 0; D.forEach(function (d) { r += d.ration || 0; due += d.rationDue || 0; }); rs[k] = due > 0 ? r / due : null; });
  ok('the wage bill paid in full every day (the treasury and its workplaces never short)', unpaid === 0 && live, unpaid ? unpaid + ' shells of wages or purchases unpaid' :
    flow.map(function (f) { return f.k + ': dole ' + f.dl + ' (' + (f.sp + f.dl > 0 ? Math.round(100 * f.dl / (f.sp + f.dl)) : 0) + '% of what was bought), the ration ' + (rs[f.k] == null ? '-' : Math.round(100 * rs[f.k]) + '% of a full keep'); }).join('; '));
  /* the treasury and its workplaces break even, near enough, over the paid days: the markup set on the earners' keep */
  var tre = ISLE.SIM.order.map(function (s) { var t0 = 0, t1 = 0; [a, b].forEach(function (X, j) { Object.keys(X.ledger.money.accounts).forEach(function (id) { var A = SIM.acct(id);
      if (A && A.settlement === s && (A.kind === 'treasury' || A.kind === 'workplace')) { if (j) t1 += X.ledger.money.accounts[id]; else t0 += X.ledger.money.accounts[id]; } }); });
    var f = flow.filter(function (x) { return x.k === s; })[0] || { w: 0 }; return { s: s, d: t1 - t0, out: f.w }; });
  ok('each town\'s treasury breaks even, near enough (within a quarter of what it paid out)', tre.every(function (t) { return t.out > 0 && Math.abs(t.d) <= 0.25 * t.out; }),
    tre.map(function (t) { return t.s + ' ' + (t.d >= 0 ? '+' : '') + t.d + ' on ' + t.out + ' paid out'; }).join('; '));
  return res;
};
ISLE.moneyChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'money: ' + name, ok: !!pass, detail: detail }); };
  var S = ISLE.SIM, towns = Object.keys(SIM.R.settlement).filter(function (s) { return SIM.acct('treasury:' + s); }).sort(), acc = b.ledger.money ? b.ledger.money.accounts : {};
  var miss = [], held = function (id) { return acc[id] != null; };
  towns.forEach(function (s) { var c = ISLE.currencyOf(s), E = SIM.econ(s), I = SIM.ITEMS;
    SIM.all('place').forEach(function (P) { if (SIM.settlementOf(P.id) !== s) return;
      if (P.people && !P.mess && (!held('hh:' + P.id) || SIM.acct('hh:' + P.id).currency !== c)) miss.push('hh:' + P.id);
      var works = (E && E.recipes && E.recipes[P.id]) || (I && I.sells && I.sells[P.id] && I.sells[P.id].length);
      if (works && (!held('wp:' + P.id) || SIM.acct('wp:' + P.id).ownedBy !== 'treasury:' + s)) miss.push('wp:' + P.id); });
    if (SIM.guildOf && SIM.guildOf(s) && !held('guild:' + s)) miss.push('guild:' + s); });
  var R = b.report || {}, cur = R.currencies || {};
  ok('every household, workplace, treasury and guild has its account in its nation\'s currency, every workplace its town\'s', !miss.length && towns.length >= 2,
    miss.length ? miss.length + ' missing or wrong: ' + miss.slice(0, 4).join(', ') : towns.map(function (s) { return s + ' ' + SIM.accounts({ settlement: s }).length + ' accounts in ' + ISLE.currencyOf(s); }).join('; '));
  var neg = Object.keys(acc).filter(function (id) { return acc[id] < 0; });
  ok('nobody holds less than nothing', !neg.length, neg.length ? neg.join(', ') : Object.keys(cur).map(function (c) { return cur[c].supply + ' ' + c + ' in ' + cur[c].accounts + ' accounts'; }).join('; '));
  var L = SIM.ledger(a.ledger, b.ledger);
  ok('each settlement\'s money is what its books say (the ledger)', L.ok && !!L.money, L.ok ? Object.keys(L.money ? L.money.towns : {}).map(function (k) { return (k || 'the crater') + ' ' + Object.keys(L.money.towns[k]).map(function (c) { return L.money.towns[k][c].closing + ' ' + c; }).join(', '); }).join('; ') : L.problems.slice(0, 3).join('; '));
  return res;
};
/* M2's checks (moving prices), over the same two snapshots: every governed good's scarcity within [lo, hi] of its cost x
   markup; the town's price index (its foods' prices over their cost) within `drift` of where it opened, no runaway; a good
   short of its target dearer than one over it, on the whole */
ISLE.moneyM2Checks = function (a, b, drift) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'money M2: ' + name, ok: !!pass, detail: detail }); };
  var Z = ISLE.TUNE.sim.money.m2; if (!Z) return res; drift = drift == null ? 0.15 : drift;
  var towns = ISLE.SIM.order, bad = [], idx = [], short = [];
  towns.forEach(function (s) { var R = (b.rel || {})[s] || {}; Object.keys(R).forEach(function (g) { if (!(R[g] >= Z.lo - 1e-9 && R[g] <= Z.hi + 1e-9)) bad.push(s + ' ' + g + ' ' + R[g]); });
    var H = (b.m1.days[s] || []).filter(function (d) { return d.cpi != null; }), c0 = H.length ? H[0].cpi : null, c1 = H.length ? H[H.length - 1].cpi : null, mx = 0;
    H.forEach(function (d) { mx = Math.max(mx, Math.abs(d.cpi / c0 - 1)); }); idx.push({ s: s, c0: c0, c1: c1, mx: mx, n: H.length });
    var V = SIM.econ(s).govern && SIM.econ(s).govern.view, up = 0, n = 0; if (V) Object.keys(R).forEach(function (g) { var v = V[g]; if (!v || !(v.target > 0)) return; n++; if ((v.pos < v.target) === (R[g] > 1) || Math.abs(R[g] - 1) < 0.02) up++; });
    short.push({ s: s, n: n, up: up }); });
  ok('every governed good priced within ' + Z.lo + ' to ' + Z.hi + ' of its cost x markup', !bad.length && towns.every(function (s) { return Object.keys((b.rel || {})[s] || {}).length > 0; }),
    bad.length ? bad.slice(0, 4).join('; ') : towns.map(function (s) { var R = b.rel[s], k = Object.keys(R).sort(function (x, y) { return R[y] - R[x]; }); return s + ': dearest ' + k.slice(0, 3).map(function (g) { return g + ' x' + R[g].toFixed(2); }).join(', ') + '; cheapest ' + k.slice(-2).map(function (g) { return g + ' x' + R[g].toFixed(2); }).join(', '); }).join(' | '));
  ok('each town\'s price index within ' + Math.round(drift * 100) + '% of where it opened (no runaway)', idx.every(function (x) { return x.n >= 3 && x.mx <= drift; }),
    idx.map(function (x) { return x.s + ' ' + (x.c0 || 0).toFixed(2) + ' to ' + (x.c1 || 0).toFixed(2) + ' (at most ' + Math.round(x.mx * 100) + '% off)'; }).join('; '));
  ok('a good short of its target dearer, one over it cheaper (on the whole)', short.every(function (x) { return x.n > 0 && x.up >= 0.75 * x.n; }),
    short.map(function (x) { return x.s + ' ' + x.up + ' of ' + x.n + ' goods'; }).join('; '));
  return res;
};

