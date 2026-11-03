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
  SIM.money({ currencies: K.currencies, spread: K.spread });
  Object.keys(K.changers || {}).forEach(function (c) { if (SIM.acct('changer:' + c)) SIM.mint('changer:' + c, K.changers[c], 'reserve'); });
  Object.keys(K.foreign || {}).forEach(function (c) { SIM.account({ id: 'foreign:beyond', owner: 'ships from beyond', kind: 'foreign', currency: c, name: 'the traders from beyond the isles' });
    SIM.mint('foreign:beyond', K.foreign[c], 'reserve'); });
  S.order.forEach(function (s) { ISLE.simMoneyTown(s); });
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
    if (P.people && !P.mess) { var cls = P.cls || clsOf[P.id] || 'poor';
      SIM.account({ id: 'hh:' + P.id, owner: P.id, kind: 'household', currency: c, settlement: s }); SIM.mint('hh:' + P.id, (K.endow || {})[cls] || 0, 'endowment'); out.households++; }
    var works = (E && E.recipes && E.recipes[P.id]) || (I && I.sells && I.sells[P.id] && I.sells[P.id].length);
    if (works) { SIM.account({ id: 'wp:' + P.id, owner: P.id, kind: 'workplace', currency: c, settlement: s, ownedBy: tre }); out.workplaces++; }
  });
  var G = SIM.guildOf && SIM.guildOf(s);
  if (G) { SIM.account({ id: 'guild:' + s, owner: G.id, kind: 'guild', currency: c, settlement: s, name: "the thieves' guild" }); SIM.mint('guild:' + s, K.guild || 0, 'reserve'); }
  return out;
};
ISLE.moneyBooks = function () { return { minute: SIM.minute(), report: SIM.moneyReport(), ledger: SIM.ledgerSnap() }; };
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
