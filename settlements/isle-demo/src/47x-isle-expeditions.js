/* ============================== 7h8. EXPEDITIONS: CAMPS BY BOAT TO THE OTHER ISLES (PLAN.md section 12; 2026-11-09) ============================== */
/* [G data] The owner (2026-11-09): "can we arrange to have the cities deploy camps by boat to the other islands and collect
   resources?" Each town sends a CREW of `expeditions.hands` (its unemployed first, then its dockers) by lakatoi to the
   nearest forest island shore with a sea route from its trade landing (the page's hook: ISLE.hooks.expeditionShore). The
   camp is a settlement of the town's (kind 'camp'): a mess (the shelters, 88h), a store on the shore that is the boat's
   stop, and the crew's WORK CAMP of core/camp 40 (47h's machine: the lumber village's crew that pitches at a stand, works
   it down to its seed trees, strikes and marches to the next), its stands the island's forest round the shore, its batch
   mahogany with gum and kapok by it (`expeditions.crew`). The boat is a SEA LEG each way (`boat`; 47h `sea`): the goods
   home to the town's canoe stop, the town's food out. After `days` (a season), or when the range is worked out, the
   crew COMES HOME (its people to their old homes and posts) and the camp is struck; `rest` days later the next sails.
   The canoe sheds build canoes of the mahogany and gum (`expeditions.yards`). The page's hooks (ISLE.hooks):
   expeditionShore(townName, n) -> {x, z (the camp, inland of the shore), shore: {x, z, ux, uz}, seaKm, forest(x, z),
   h?(x, z), name?} | null; expeditionPitched(C), expeditionStruck(C) (the drawing). A page without the shore hook sends none.
     ISLE.expYards()            before the money (40): the canoe sheds' batch and the towns' ceilings
     ISLE.simExpeditions()      after the founding (40): the state, the hourly step
     ISLE.expBooks()            a snapshot: the camps (state, people, made, landed, fed, the stand), the towns' canoes
     ISLE.expChecks(a, b)       over two snapshots, each with a negative in tests/test-isle-expeditions.js */
ISLE.hooks = ISLE.hooks || {};
ISLE.simExpeditions = function () {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions; if (!X) return null;
  S.exp = { camps: [], n: {}, rest: {}, noShore: {}, log: [] };
  if (!S.yards) ISLE.expYards();   /* a page that declared without them (40 calls it before the money) */
  if (ISLE.simHouses && X.house && SIM.MONEY && SIM.MONEY.m1 && ISLE.hooks.expeditionShore) ISLE.simHouses();   /* the towns' merchant houses (47y), after the money; only where expeditions can sail */
  if (SIM.stepHooks.indexOf(ISLE.expStep) < 0) SIM.stepHooks.push(ISLE.expStep);
  if (X.uses && ISLE.hooks.expeditionShore && SIM.stepHooks.indexOf(ISLE.expUses) < 0) SIM.stepHooks.push(ISLE.expUses);
  return S.exp;
};
/* what the households use of the camps' goods (`uses`, a person a day, at noon): drawn from the warehouses and booked used,
   what was not there booked short (the governor's want, the house's market) */
ISLE.expUses = function (minute) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions; if (minute % 1440 !== 720) return;
  var pop = {}; SIM.all('actor').forEach(function (a) { if (a.driven || a.transient) return; var s = SIM.settlementOf(a); if (s != null) pop[s] = (pop[s] || 0) + 1; });
  S.order.forEach(function (s) { Object.keys(X.uses).forEach(function (g) { var n = Math.round((pop[s] || 0) * X.uses[g]); if (!(n > 0)) return;
    SIM.withEcon(s, function () { SIM.supply(g, n); }); }); });   /* the economy's draw: booked used, and short when unmet */
};
/* the towns' canoe sheds build canoes of what the camps bring (`yards`), the towns' ceilings on the goods (`stockpile`);
   declared before the money (40), so the canoes are priced on their mahogany and gum and the sheds get their accounts -> {s: sheds} */
ISLE.expYards = function () {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions, out = {}; if (!X) return null;
  S.order.forEach(function (s) { var E = SIM.econ(s), Xs = S.towns[s]; out[s] = 0;
    Object.keys(X.yards || {}).forEach(function (kind) { var Y = X.yards[kind], i = 0, ev = Y.every || 1, from = Y.from || 0;
      if (Y.expOnly && !ISLE.hooks.expeditionShore) return;   /* a page with no expeditions keeps its makers as they were */
      Xs.places.places.forEach(function (P) { if (P.kind !== kind || !P.activities.WORK || (E.recipes[P.id] && E.recipes[P.id].batch && kind !== 'canoeshed')) return; if ((i++ % ev) !== from) return;
        SIM.recipe(P.id, { batch: Y.batch, cap: Y.cap }); out[s]++;
        Object.keys(Y.batch.out).forEach(function (g) { Xs.econ.goods[g] = (Xs.econ.goods[g] || 0) + 1; }); }); });
    var XS = X.towns && X.towns[s] && X.towns[s].stockpile; if (X.stockpile || XS) SIM.stockpile(s, Object.assign({}, X.stockpile, XS || {})); });   /* a town's own ceilings over the rest (47k: Nephtos's pearls) */
  S.yards = out; return out;
};
/* may town s send kind k (47k): a kind with `only` goes from those towns; a town with its own list (`towns[s].kinds`) sends those */
ISLE.expKindOk = function (s, k) { var X = ISLE.TUNE.sim.expeditions, K = X.kinds[k], L = X.towns && X.towns[s] && X.towns[s].kinds;
  return !!K && (K.only ? K.only.indexOf(s) >= 0 : true) && (L ? L.indexOf(k) >= 0 : !K.only); };
ISLE.expStep = function (minute) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions; if (!S.exp || minute % 60) return;
  if (ISLE.hooks.expeditionShore) S.order.forEach(function (s) {
    if (minute < X.firstDay * 1440) return;
    var H = S.houses && S.houses[s], outK = S.exp.camps.filter(function (C) { return C.town === s && !C.struck; }).map(function (C) { return C.kind; });
    if (outK.length >= (H ? (X.house.maxOut || 1) : 1)) return;   /* a house runs `maxOut` camps at once; a town without one, one */
    if ((S.exp.n[s] || 0) >= X.maxPerTown) return;
    if (S.exp.rest[s] != null && minute < S.exp.rest[s]) return;   /* a house that declined tries again later */
    /* the kinds it may send: none of that kind out, rested since the last came home, a shore found (or not yet asked) */
    var free = Object.keys(X.kinds).filter(function (k) { var rk = s + '|' + k; return ISLE.expKindOk(s, k) && outK.indexOf(k) < 0 && !(S.exp.rest[rk] != null && minute < S.exp.rest[rk]) && !(S.exp.noShore[rk] != null && minute - S.exp.noShore[rk] < 1440 * 7); });
    if (!H) free = free.filter(function (k) { return k === 'forest'; });   /* a town without a house: the forest */
    if (!free.length) return;
    /* the town's merchant house decides (47y): the kind with the best expected margin, with the purse to pay for it */
    var kind = free[0];
    if (H) { var D = ISLE.houseDecide(s, minute, free); if (!D.go) { S.exp.rest[s] = minute + (X.house.retryDays || 7) * 1440; return; } kind = D.kind; }
    ISLE.expSail(s, minute, kind);
  });
  S.exp.camps.forEach(function (C) { if (C.struck) return;
    var E = SIM.econ(C.id), R = E && E.recipes[C.places.crew], St = C.node && E ? E.resSites[C.node] : null;
    var out = (R && R.hold && R.hold.reason === 'range worked out') || (St && St.amount != null && St.amount <= 0);
    if (minute >= C.sailed + (C.days || X.days) * 1440 || out) ISLE.expReturn(C, minute, out ? (C.node ? 'the bed worked out' : 'range worked out') : 'the season');   /* the house's planned season (47y), else the tune's */
  });
};
/* the crew: the town's grown-ups with no post first, then its dockers, never a refugee or an elder -> actors */
ISLE.expCrew = function (s, n) {
  var dock = { dockyard: 1, fishdock: 1, quay: 1, 'canoe stop': 1, ferry: 1 };
  var A = SIM.all('actor').filter(function (a) { return !a.driven && !a.transient && !a.refugee && !a.herd && a.ageBand !== 'child' && a.ageBand !== 'elder' && a.home != null && SIM.settlementOf(a) === s && !a.exp; });
  var rank = function (a) { if (a.work == null) return 0; var P = SIM.R.place[a.work]; return P && dock[P.kind] ? 1 : 2; };
  A.sort(function (p, q) { return rank(p) - rank(q) || p.k - q.k; });
  return A.slice(0, n);
};
ISLE.expSail = function (s, minute, kind) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = T.expeditions, HT = T.hamlets, I = T.items, TSp = null; kind = kind || 'forest';
  var K = X.kinds[kind], rk = s + '|' + kind;
  Object.keys(T.towns).forEach(function (k) { if (T.towns[k].id === s) TSp = T.towns[k]; });
  var n = (S.exp.n[s] || 0) + 1, site = ISLE.hooks.expeditionShore(TSp.name, n, K.shore || kind);   /* the pearl ships work a reef's shore (47k) */
  if (!site || !site.shore || !(site.seaKm > 0)) { S.exp.noShore[rk] = minute; S.exp.log.push({ op: 'no shore', town: s, kind: kind, minute: minute }); return null; }
  var crew = ISLE.expCrew(s, K.hands); if (crew.length < Math.ceil(K.hands / 2)) { S.exp.log.push({ op: 'no crew', town: s, kind: kind, found: crew.length, minute: minute }); S.exp.noShore[rk] = minute; return null; }
  var cid = s + '.exp' + n, h = site.h || function () { return site.y == null ? 0 : site.y; }, y = h(site.x, site.z), np = crew.length;
  SIM.settlement({ id: cid, faction: TSp.faction, name: 'Expedition ' + n + ' of ' + TSp.name + (site.name ? ' to ' + site.name : ''), parent: s, kind: 'camp' });
  SIM.org({ id: cid + '.folk', faction: TSp.faction, name: 'The expedition\'s crew' });
  var camp = SIM.place({ id: cid + '.camp', name: 'the expedition camp', kind: 'camp', x: site.x, y: y, z: site.z, door: { x: site.x, y: y, z: site.z },
    activities: { SLEEP: np, EAT: np, REST: np, IDLE: np, HOUSEWORK: Math.ceil(np / 4), SOCIALIZE: Math.ceil(np / 3) }, indoor: {}, wander: 12, settlement: cid, tags: { key: 'expedition camp', role: 'camp', hamlet: cid } });
  camp.mess = true; camp.cls = 'poor'; camp.people = np;
  var sh = site.shore, sy = h(sh.x, sh.z);
  var store = SIM.place({ id: cid + '.store', name: 'the camp\'s store on the shore', kind: 'warehouse', x: sh.x, y: sy, z: sh.z, door: { x: sh.x, y: sy, z: sh.z }, activities: { WORK: 1 }, indoor: true, settlement: cid, tags: { key: 'camp store', role: 'warehouse', hamlet: cid, landing: true } });
  var places = [camp, store], CR = null, cr = null, nodeId = null, NK = K.node;
  if (K.crew) {   /* the forest: core/camp's work camp ranging the stands (47h's machine) */
    CR = Object.assign({}, K.crew, { posts: np - 1, focus: 'expedition' });
    var res = { id: cid + ':forest', kind: 'stand', x: site.x, z: site.z, forest: site.forest };
    cr = ISLE.simCrewPlace(cid, { name: 'Expedition ' + n, focus: 'expedition' }, places, res, CR, h);
  } else {   /* the vents and the reef: a works at the node, its recipe on the node's site */
    var nx = site.node ? site.node.x : site.x, nz = site.node ? site.node.z : site.z, ny = h(nx, nz);
    var W = SIM.place({ id: cid + '.works', name: 'the ' + NK.place, kind: NK.place, x: nx, y: ny, z: nz, door: { x: nx, y: ny, z: nz }, activities: { WORK: np - 1 }, indoor: false, settlement: cid, tags: { role: 'works', hamlet: cid, key: NK.place } });
    places.push(W); cr = { id: cid + ':node', place: W.id, goods: Object.keys(NK.batch.out), moves: 0 }; nodeId = cid + ':node';
  }
  /* the people: their town places kept to come home to */
  var prefers = { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' } };
  SIM.role({ id: cid + '.worker', name: 'expedition hand', org: cid + '.folk', settlement: cid, count: 0, homes: ['camp'], prefers: prefers, work: { kinds: ['fellcamp', 'warehouse'].concat(NK ? [NK.place] : []), act: 'WORK', near: true }, sched: T.sched.work });
  var posts = { crew: np - 1, store: 1 };
  crew.forEach(function (a, i) {
    a.exp = { camp: cid, home: a.home, work: a.work, role: a.role, status: a.status, job: a.job, cls: a.cls };
    a.home = camp.id; a.role = cid + '.worker'; a.cls = 'poor'; a.status = 'employed'; a.job = i === 0 ? 'storekeeper' : 'expedition hand'; a.work = i === 0 ? store.id : cr.place;
    if (a.mem) a.mem.WORK = a.work;
  });
  /* its economy: the town's goods and foods; the store opened with the town's food for the voyage and the first days;
     the crew's work camp started; the recipe held while the boat is at sea */
  var EP = SIM.econ(s), Xp = S.towns[s], goods = {}; Object.keys(EP.goods).forEach(function (g) { goods[g] = EP.goods[g].minLoad != null ? { minLoad: EP.goods[g].minLoad } : {}; goods[g].unit = EP.goods[g].unit; });
  var foods = Xp.econ.foods.slice(), rules = ISLE.simRules(cid); if (rules.govern) rules.govern = Object.assign({}, rules.govern, { exported: false, pool: [s] });
  SIM.economy(Object.assign({ goods: goods, inputs: {}, every: T.economy.every, window: T.economy.window, imports: T.economy.imports, cart: T.economy.cart, meal: { per: I.perMeal, foods: foods.slice() }, useShort: true }, rules), { settlement: cid });
  SIM.store(store.id, { kind: 'warehouse' });
  var carried = ISLE.carryFood(s, cid, store, foods, np * I.meals * I.perMeal * X.startDays);   /* the voyage's food from the town's warehouses, booked out of it and into the camp */
  var life;
  if (K.crew) life = ISLE.simCrewStart(cr, CR, cid);
  else { SIM.site({ id: nodeId, settlement: cid, kind: NK.kind, goods: cr.goods.slice(), amount: NK.amount, regen: NK.regen || 0, yield: 1 });
    SIM.recipe(cr.place, { batch: NK.batch, cap: NK.cap, site: nodeId }); life = { stands: 1, amount: NK.amount, full: null }; }
  /* a hand-cart (as a hamlet's, 47h): the crew's felled goods from its camp among the trees to the store on the shore, where
     the boat loads; without it the goods stay where they were made */
  var cart = SIM.actor({ id: cid + '.cart0', role: 'cart', org: cid + '.folk', home: store.id, cls: 'cart', job: 'carters' }); cart.pos = { x: store.x, y: store.y || 0, z: store.z }; SIM.cart(cart);
  var B = Object.assign({}, X.boat, K.boat || {}), smin = Math.max(60, Math.round(site.seaKm * 1000 / (B.kmh * 1000 / 60)));
  SIM.recipeHold(cr.place, 'at sea', minute + smin);
  /* the sea legs: the camp's goods to the town's canoe stop; the town's food to the camp's store */
  var by = Object.keys(((K.crew || K.node).batch.by) || {}), ship = cr.goods.concat(by.filter(function (g) { return cr.goods.indexOf(g) < 0; }));   /* the main good and what comes by it (the forest's gum, kapok and bark) */
  var tstop = SIM.R.place[s + '.stop'], Wp = tstop || EP.warehouses[0], gO = {}, gI = {}, eO = {}, eI = {}; gO[cid] = ship.slice(); gO[s] = []; gI[s] = foods.slice(); gI[cid] = []; eO[s] = {}; ship.forEach(function (g) { eO[s][g] = 1; }); eI[cid] = {};
  foods.forEach(function (f) { eI[cid][f] = np * I.meals * I.perMeal / foods.length; });
  var Ro = SIM.trade({ id: cid + ':out', stops: [{ settlement: cid, place: store.id }, { settlement: s, place: Wp.id }], cap: B.cap, carriers: B.carriers == null ? 1 : B.carriers, minutes: smin, mins: B.mins, keep: B.keep == null ? 0 : B.keep, want: 1e6, goods: gO, expect: eO });
  var Ri = SIM.trade({ id: cid + ':in', stops: [{ settlement: s, place: Wp.id }, { settlement: cid, place: store.id }], cap: B.cap, carriers: 1, minutes: smin, mins: B.mins, keep: HT.road.keep, want: HT.road.want, goods: gI, expect: eI });
  SIM.level(cid, 'abstract');
  if (SIM.placesChanged) SIM.placesChanged();
  var C = { id: cid, kind: kind, main: K.main, node: nodeId, town: s, townName: TSp.name, n: n, site: { x: site.x, z: site.z, name: site.name || null }, shore: { x: sh.x, z: sh.z, ux: sh.ux, uz: sh.uz }, seaKm: site.seaKm, minutes: smin, sailed: minute, lands: minute + smin,
    days: S.houses && S.houses[s] && S.houses[s].plan ? S.houses[s].plan.days : X.days, people: crew.map(function (a) { return a.id; }), places: { camp: camp.id, store: store.id, crew: cr.place }, crew: K.crew ? cr : null, life: life, goods: ship.slice(), out: Ro.id, 'in': Ri.id, vessel: B.vessel, struck: null, why: null };
  S.exp.camps.push(C); S.exp.n[s] = n;
  /* its money: the town's merchant house runs it (47y), or a grant from the town's treasury on a page without one */
  if (SIM.MONEY && S.houses && S.houses[s]) ISLE.houseOpen(C, carried, minute); else if (SIM.MONEY && ISLE.simMoneyTown) ISLE.simMoneyTown(cid, { fundedBy: 'treasury:' + s });
  SIM.logEvent('expedition sailed', { settlement: s, camp: cid, kind: kind, people: np, seaKm: site.seaKm, to: site.name || null, stands: life.stands });
  if (ISLE.hooks.expeditionPitched) ISLE.hooks.expeditionPitched(C);
  return C;
};
/* food carried from a town to a new settlement of its own (an expedition, a farming camp): taken from the town's warehouses
   and booked out of it, put in the new place's store and booked in, so the ledger's balance holds for both (a settlement
   declared after a snapshot opens at nothing) -> what was carried, by good */
ISLE.carryFood = function (s, to, store, foods, need) {
  var got = {}; foods.forEach(function (f) { var want = Math.round(need / foods.length); if (want <= 0) return;
    var k = SIM.withEcon(s, function () { var n = SIM.economyTake(f, want); if (n > 0) SIM.economyBook('exported', f, n); return n; });
    if (k > 0) SIM.withEcon(to, function () { store.stock[f] = (store.stock[f] || 0) + k; SIM.economyBook('imported', f, k); });
    if (k > 0) got[f] = k; });
  return got;
};
/* the crew home: its people to the places they left, the camp's places emptied, the boats' goods cleared, the stands' site
   left as it is (the next crew finds what grew back) */
ISLE.expReturn = function (C, minute, why) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions;
  C.people.forEach(function (id) { var a = SIM.R.actor[id]; if (!a || !a.exp) return; var e = a.exp;
    a.home = e.home; a.work = e.work; a.role = e.role; a.status = e.status; a.job = e.job; a.cls = e.cls; if (a.mem) a.mem.WORK = e.work; delete a.exp; });
  var camp = SIM.R.place[C.places.camp]; camp.people = 0;
  var E = SIM.econ(C.id); if (E && E.recipes[C.places.crew]) SIM.recipeHold(C.places.crew, 'struck');
  [C.out, C['in']].forEach(function (rid) { var Rt = SIM.TRADE && SIM.TRADE.routes[rid]; if (Rt && Rt.goods) Object.keys(Rt.goods).forEach(function (k) { Rt.goods[k] = []; }); });
  S.crews = (S.crews || []).filter(function (c) { return c !== C.crew; });
  C.struck = minute; C.why = why; S.exp.rest[C.town + '|' + C.kind] = minute + X.rest * 1440;   /* that kind rests; another may sail */
  if (SIM.placesChanged) SIM.placesChanged();
  if (S.houses && S.houses[C.town]) ISLE.houseSettle(C, minute, false);   /* settled at once; the season is booked when the boats' last loads are in (47y) */
  SIM.logEvent('expedition home', { camp: C.id, why: why, days: Math.round((minute - C.sailed) / 144) / 10 });
  if (ISLE.hooks.expeditionStruck) ISLE.hooks.expeditionStruck(C);
};
ISLE.expBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), camps: [], towns: {}, log: S.exp ? S.exp.log.slice() : [] }; if (!S.exp) return out;
  var I = SIM.ITEMS, X = ISLE.TUNE.sim.expeditions;
  S.exp.camps.forEach(function (C) {
    var E = SIM.econ(C.id), B = (I.statsBy || {})[C.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, B.meals || {});
    var here = C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && a.home === C.places.camp; }).length;
    var home = C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && !(a.exp && a.exp.camp === C.id) && (a.exp ? true : SIM.settlementOf(a) === C.town); }).length;   /* back from this one (home, or out again on a later expedition of the town's) */
    var R = SIM.tradeReport(C.out), landed = R.landed[C.id + '>' + C.town] || {}, atSea = {}; R.carriers.forEach(function (K) { K.cargo.forEach(function (c) { atSea[c.good] = (atSea[c.good] || 0) + c.n; }); });
    var Rc = E && E.recipes[C.places.crew], made = {}; C.goods.forEach(function (g) { made[g] = E ? (E.made[g] || 0) : 0; });
    var site = C.crew ? ISLE.crewSite({ crew: C.crew, id: C.id, resource: C.crew.id }) : (function () { var St = E && E.resSites[C.node]; return { taken: St ? St.taken : 0, camp: { stand: C.node, state: 'at work' } }; })();
    out.camps.push({ id: C.id, town: C.town, n: C.n, to: C.site.name, seaKm: C.seaKm, days: C.days, sailed: C.sailed, lands: C.lands, struck: C.struck, why: C.why, people: C.people.length, here: here, home: home,
      state: C.struck ? 'struck' : Rc && Rc.hold ? Rc.hold.reason : 'at work', made: made, landed: landed, atSea: atSea, meals: M, stands: C.life.stands, stand: site.camp, taken: site.taken, moves: C.crew ? C.crew.moves : 0, kind: C.kind, main: C.main, hands: SIM.R.settlement[C.id] ? C.people.length : 0 });
  });
  S.order.forEach(function (s) { var E = SIM.econ(s), Hh = S.houses && S.houses[s]; out.towns[s] = { declined: Hh ? Hh.decisions.filter(function (D) { return !D.go; }).length : 0, canoes: E.made.canoes || 0, mahogany: { imported: E.imported.mahogany || 0, used: E.used.mahogany || 0 }, gum: { imported: E.imported.gum || 0, used: E.used.gum || 0 }, kapok: { imported: E.imported.kapok || 0 },
    imported: (function () { var o = {}; Object.keys(X.kinds).forEach(function (k) { var Kk = X.kinds[k], B = (Kk.crew || Kk.node).batch; Object.keys(B.out).concat(Object.keys(B.by || {})).forEach(function (g) { o[g] = E.imported[g] || 0; }); }); return o; })(), dockyards: SIM.all('place').filter(function (P) { return P.settlement === s && (ISLE.TUNE.sim.expeditions.yards || {})[P.kind] && P.activities.WORK; }).length }; });
  return out;
};
ISLE.expChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'expeditions: ' + name, ok: !!pass, detail: detail }); }, X = ISLE.TUNE.sim.expeditions, camps = b.camps;
  var towns = Object.keys(b.towns);
  ok('each town sent a crew by boat to another isle\'s shore with a sea route (or its merchant house declined on its margin: 47y), the camp pitched at its forest\'s stand, its vent or its reef, its people the town\'s own at work', towns.length > 0 && towns.every(function (s) { return camps.some(function (C) { return C.town === s; }) || b.towns[s].declined > 0; }) &&
    camps.every(function (C) { return C.people === X.kinds[C.kind].hands && C.seaKm > 0 && C.stands > 0 && (C.struck ? true : C.here === C.people); }),
    camps.map(function (C) { return C.id + ' (' + C.kind + ')' + (C.to ? ' to ' + C.to : '') + ': ' + C.people + ' hands, ' + C.seaKm + ' km by sea, ' + C.stands + ' stands, ' + C.state + (C.stand && C.stand.stand ? ' at ' + C.stand.stand.split(':').slice(-2).join(':') : ''); }).concat(towns.filter(function (s) { return b.towns[s].declined; }).map(function (s) { return s + '\'s house declined ' + b.towns[s].declined + ' times'; })).join('; ') || ('no camp' + (b.log.length ? '; log ' + JSON.stringify(b.log.slice(0, 3)) : '')));
  var landedCamps = camps.filter(function (C) { return b.minute >= C.lands + 2 * 1440; });
  if (landedCamps.length) ok('every camp landed two days or more made its main good and what comes by it (the forest\'s mahogany with gum, kapok and bark; the vents\' sulphur; the reef\'s pearls), from its stand or its node', landedCamps.every(function (C) { return Object.keys(C.made).every(function (g) { return C.made[g] > 0; }) && C.taken > 0; }),
    landedCamps.map(function (C) { return C.id + ': ' + Object.keys(C.made).map(function (g) { return g + ' ' + Math.round(C.made[g]); }).join(', ') + '; ' + Math.round(C.taken) + ' taken from its stands, ' + C.moves + ' moves'; }).join('; '));
  var shipped = camps.filter(function (C) { return b.minute >= C.lands + 6 * 1440 && (!C.struck || C.struck >= C.lands + 6 * 1440); });   /* a camp that worked six days or more (one recalled sooner may have shipped nothing) */
  if (shipped.length) ok('its goods landed at the town\'s canoe stop by the boat and were booked imported there (a load is in the camp, at sea or landed)', shipped.every(function (C) { return (C.landed[C.main] || 0) > 0 && (b.towns[C.town].imported[C.main] || 0) > 0; }),
    shipped.map(function (C) { return C.id + ': ' + C.main + ' ' + Math.round(C.landed[C.main] || 0) + ' landed, ' + Math.round(C.atSea[C.main] || 0) + ' at sea; ' + C.town + ' imported ' + Math.round(b.towns[C.town].imported[C.main] || 0); }).join('; '));
  ok('every camp fed by the town\'s boat at its ration line (no meal without food)', camps.every(function (C) { return C.meals.none === 0 && (C.struck || C.meals.mess > 0 || b.minute < C.lands + 1440); }),
    camps.map(function (C) { return C.id + ' ' + C.meals.mess + ' mess meals, ' + C.meals.none + ' without food'; }).join('; '));
  var yards = towns.filter(function (s) { return b.towns[s].dockyards > 0; }), late = camps.filter(function (C) { return b.minute >= C.lands + 12 * 1440; });
  if (yards.length && late.length) ok('the canoe sheds build canoes of the mahogany and gum (expeditions.yards)', yards.some(function (s) { return b.towns[s].canoes > 0 && b.towns[s].mahogany.used > 0 && b.towns[s].gum.used > 0; }),
    yards.map(function (s) { var T = b.towns[s]; return s + ': ' + T.canoes + ' canoes from ' + Math.round(T.mahogany.used) + ' mahogany and ' + Math.round(T.gum.used) + ' gum (' + T.dockyards + ' canoe sheds)'; }).join('; '));
  var due = camps.filter(function (C) { return b.minute >= C.sailed + (C.days || X.days) * 1440 + 1440; });
  if (due.length) ok('after its season (the house\'s plan, at most ' + X.days + ' days) the crew came home: every hand back in its own home and post, the camp struck', due.every(function (C) { return C.struck && C.home === C.people && C.here === 0; }),
    due.map(function (C) { return C.id + (C.struck ? ' struck day ' + Math.round(C.struck / 1440) + ' (' + C.why + '): ' + C.home + ' of ' + C.people + ' home' : ' still out'); }).join('; '));
  return res;
};
