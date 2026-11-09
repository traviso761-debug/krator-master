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
     ISLE.simExpeditions()      after the founding (40): the state, the hourly step
     ISLE.expBooks()            a snapshot: the camps (state, people, made, landed, fed, the stand), the towns' canoes
     ISLE.expChecks(a, b)       over two snapshots, each with a negative in tests/test-isle-expeditions.js */
ISLE.hooks = ISLE.hooks || {};
ISLE.simExpeditions = function () {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions; if (!X) return null;
  S.exp = { camps: [], n: {}, rest: {}, noShore: {}, log: [] };
  /* the towns' canoe sheds build canoes of what the camps bring (`yards`), the towns' ceilings on the goods (`stockpile`) */
  S.order.forEach(function (s) { var E = SIM.econ(s), Xs = S.towns[s];
    Object.keys(X.yards || {}).forEach(function (kind) { var Y = X.yards[kind];
      Xs.places.places.forEach(function (P) { if (P.kind !== kind || !P.activities.WORK || (E.recipes[P.id] && !E.recipes[P.id].batch)) return; SIM.recipe(P.id, { batch: Y.batch, cap: Y.cap });
        Object.keys(Y.batch.out).forEach(function (g) { Xs.econ.goods[g] = (Xs.econ.goods[g] || 0) + 1; }); }); });
    if (X.stockpile) SIM.stockpile(s, X.stockpile); });
  if (SIM.stepHooks.indexOf(ISLE.expStep) < 0) SIM.stepHooks.push(ISLE.expStep);
  return S.exp;
};
ISLE.expStep = function (minute) {
  var S = ISLE.SIM, X = ISLE.TUNE.sim.expeditions; if (!S.exp || minute % 60) return;
  if (ISLE.hooks.expeditionShore) S.order.forEach(function (s) {
    if (minute < X.firstDay * 1440) return;
    if (S.exp.camps.some(function (C) { return C.town === s && !C.struck; })) return;   /* one out at a time */
    if ((S.exp.n[s] || 0) >= X.maxPerTown) return;
    if (S.exp.rest[s] != null && minute < S.exp.rest[s]) return;
    if (S.exp.noShore[s] != null && minute - S.exp.noShore[s] < 1440) return;
    ISLE.expSail(s, minute);
  });
  S.exp.camps.forEach(function (C) { if (C.struck) return;
    var E = SIM.econ(C.id), R = E && E.recipes[C.crew.place], out = R && R.hold && R.hold.reason === 'range worked out';
    if (minute >= C.sailed + X.days * 1440 || out) ISLE.expReturn(C, minute, out ? 'range worked out' : 'the season');
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
ISLE.expSail = function (s, minute) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = T.expeditions, HT = T.hamlets, I = T.items, TSp = null;
  Object.keys(T.towns).forEach(function (k) { if (T.towns[k].id === s) TSp = T.towns[k]; });
  var n = (S.exp.n[s] || 0) + 1, site = ISLE.hooks.expeditionShore(TSp.name, n, S);
  if (!site || !site.shore || !(site.seaKm > 0)) { S.exp.noShore[s] = minute; S.exp.log.push({ op: 'no shore', town: s, minute: minute }); return null; }
  var crew = ISLE.expCrew(s, X.hands); if (crew.length < Math.ceil(X.hands / 2)) { S.exp.log.push({ op: 'no crew', town: s, found: crew.length, minute: minute }); S.exp.noShore[s] = minute; return null; }
  var cid = s + '.exp' + n, h = site.h || function () { return site.y == null ? 0 : site.y; }, y = h(site.x, site.z), np = crew.length;
  SIM.settlement({ id: cid, faction: TSp.faction, name: 'Expedition ' + n + ' of ' + TSp.name + (site.name ? ' to ' + site.name : ''), parent: s, kind: 'camp' });
  SIM.org({ id: cid + '.folk', faction: TSp.faction, name: 'The expedition\'s crew' });
  var camp = SIM.place({ id: cid + '.camp', name: 'the expedition camp', kind: 'camp', x: site.x, y: y, z: site.z, door: { x: site.x, y: y, z: site.z },
    activities: { SLEEP: np, EAT: np, REST: np, IDLE: np, HOUSEWORK: Math.ceil(np / 4), SOCIALIZE: Math.ceil(np / 3) }, indoor: {}, wander: 12, settlement: cid, tags: { key: 'expedition camp', role: 'camp', hamlet: cid } });
  camp.mess = true; camp.cls = 'poor'; camp.people = np;
  var sh = site.shore, sy = h(sh.x, sh.z);
  var store = SIM.place({ id: cid + '.store', name: 'the camp\'s store on the shore', kind: 'warehouse', x: sh.x, y: sy, z: sh.z, door: { x: sh.x, y: sy, z: sh.z }, activities: { WORK: 1 }, indoor: true, settlement: cid, tags: { key: 'camp store', role: 'warehouse', hamlet: cid, landing: true } });
  var places = [camp, store], CR = Object.assign({}, X.crew, { posts: np - 1, focus: 'expedition' });
  var res = { id: cid + ':forest', kind: 'stand', x: site.x, z: site.z, forest: site.forest };
  var cr = ISLE.simCrewPlace(cid, { name: 'Expedition ' + n, focus: 'expedition' }, places, res, CR, h);
  /* the people: their town places kept to come home to */
  var prefers = { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' } };
  SIM.role({ id: cid + '.worker', name: 'expedition hand', org: cid + '.folk', settlement: cid, count: 0, homes: ['camp'], prefers: prefers, work: { kinds: ['fellcamp', 'warehouse'], act: 'WORK', near: true }, sched: T.sched.work });
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
  ISLE.carryFood(s, cid, store, foods, np * I.meals * I.perMeal * X.startDays);   /* the voyage's food from the town's warehouses, booked out of it and into the camp */
  var life = ISLE.simCrewStart(cr, CR, cid);
  /* a hand-cart (as a hamlet's, 47h): the crew's felled goods from its camp among the trees to the store on the shore, where
     the boat loads; without it the goods stay where they were made */
  var cart = SIM.actor({ id: cid + '.cart0', role: 'cart', org: cid + '.folk', home: store.id, cls: 'cart', job: 'carters' }); cart.pos = { x: store.x, y: store.y || 0, z: store.z }; SIM.cart(cart);
  var B = X.boat, smin = Math.max(60, Math.round(site.seaKm * 1000 / (B.kmh * 1000 / 60)));
  SIM.recipeHold(cr.place, 'at sea', minute + smin);
  /* the sea legs: the camp's goods to the town's canoe stop; the town's food to the camp's store */
  var ship = cr.goods.concat(Object.keys(CR.batch.by || {}));   /* the felled timber and what comes by it (the gum, the kapok) */
  var tstop = SIM.R.place[s + '.stop'], Wp = tstop || EP.warehouses[0], gO = {}, gI = {}, eO = {}, eI = {}; gO[cid] = ship.slice(); gO[s] = []; gI[s] = foods.slice(); gI[cid] = []; eO[s] = {}; ship.forEach(function (g) { eO[s][g] = 1; }); eI[cid] = {};
  foods.forEach(function (f) { eI[cid][f] = np * I.meals * I.perMeal / foods.length; });
  var Ro = SIM.trade({ id: cid + ':out', stops: [{ settlement: cid, place: store.id }, { settlement: s, place: Wp.id }], cap: B.cap, carriers: B.carriers == null ? 1 : B.carriers, minutes: smin, mins: B.mins, keep: B.keep == null ? 0 : B.keep, want: 1e6, goods: gO, expect: eO });
  var Ri = SIM.trade({ id: cid + ':in', stops: [{ settlement: s, place: Wp.id }, { settlement: cid, place: store.id }], cap: B.cap, carriers: 1, minutes: smin, mins: B.mins, keep: HT.road.keep, want: HT.road.want, goods: gI, expect: eI });
  if (SIM.MONEY && ISLE.simMoneyTown) ISLE.simMoneyTown(cid);
  SIM.level(cid, 'abstract');
  if (SIM.placesChanged) SIM.placesChanged();
  var C = { id: cid, town: s, townName: TSp.name, n: n, site: { x: site.x, z: site.z, name: site.name || null }, shore: { x: sh.x, z: sh.z, ux: sh.ux, uz: sh.uz }, seaKm: site.seaKm, minutes: smin, sailed: minute, lands: minute + smin,
    people: crew.map(function (a) { return a.id; }), places: { camp: camp.id, store: store.id, crew: cr.place }, crew: cr, life: life, goods: ship.slice(), out: Ro.id, 'in': Ri.id, vessel: B.vessel, struck: null, why: null };
  S.exp.camps.push(C); S.exp.n[s] = n;
  SIM.logEvent('expedition sailed', { settlement: s, camp: cid, people: np, seaKm: site.seaKm, to: site.name || null, stands: life.stands });
  if (ISLE.hooks.expeditionPitched) ISLE.hooks.expeditionPitched(C);
  return C;
};
/* food carried from a town to a new settlement of its own (an expedition, a farming camp): taken from the town's warehouses
   and booked out of it, put in the new place's store and booked in, so the ledger's balance holds for both (a settlement
   declared after a snapshot opens at nothing) -> what was carried */
ISLE.carryFood = function (s, to, store, foods, need) {
  var got = 0; foods.forEach(function (f) { var want = Math.round(need / foods.length); if (want <= 0) return;
    var k = SIM.withEcon(s, function () { var n = SIM.economyTake(f, want); if (n > 0) SIM.economyBook('exported', f, n); return n; });
    if (k > 0) SIM.withEcon(to, function () { store.stock[f] = (store.stock[f] || 0) + k; SIM.economyBook('imported', f, k); });
    got += k; });
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
  C.struck = minute; C.why = why; S.exp.rest[C.town] = minute + X.rest * 1440;
  if (SIM.placesChanged) SIM.placesChanged();
  SIM.logEvent('expedition home', { camp: C.id, why: why, days: Math.round((minute - C.sailed) / 144) / 10 });
  if (ISLE.hooks.expeditionStruck) ISLE.hooks.expeditionStruck(C);
};
ISLE.expBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), camps: [], towns: {}, log: S.exp ? S.exp.log.slice() : [] }; if (!S.exp) return out;
  var I = SIM.ITEMS, X = ISLE.TUNE.sim.expeditions;
  S.exp.camps.forEach(function (C) {
    var E = SIM.econ(C.id), B = (I.statsBy || {})[C.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, B.meals || {});
    var here = C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && a.home === C.places.camp; }).length;
    var home = C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && !a.exp && SIM.settlementOf(a) === C.town; }).length;
    var R = SIM.tradeReport(C.out), landed = R.landed[C.id + '>' + C.town] || {}, atSea = {}; R.carriers.forEach(function (K) { K.cargo.forEach(function (c) { atSea[c.good] = (atSea[c.good] || 0) + c.n; }); });
    var Rc = E && E.recipes[C.places.crew], made = {}; C.goods.forEach(function (g) { made[g] = E ? (E.made[g] || 0) : 0; });
    var site = ISLE.crewSite({ crew: C.crew, id: C.id, resource: C.crew.id });
    out.camps.push({ id: C.id, town: C.town, n: C.n, to: C.site.name, seaKm: C.seaKm, sailed: C.sailed, lands: C.lands, struck: C.struck, why: C.why, people: C.people.length, here: here, home: home,
      state: C.struck ? 'struck' : Rc && Rc.hold ? Rc.hold.reason : 'at work', made: made, landed: landed, atSea: atSea, meals: M, stands: C.life.stands, stand: site.camp, taken: site.taken, moves: C.crew.moves });
  });
  S.order.forEach(function (s) { var E = SIM.econ(s); out.towns[s] = { canoes: E.made.canoes || 0, mahogany: { imported: E.imported.mahogany || 0, used: E.used.mahogany || 0 }, gum: { imported: E.imported.gum || 0, used: E.used.gum || 0 }, kapok: { imported: E.imported.kapok || 0 },
    dockyards: SIM.all('place').filter(function (P) { return P.settlement === s && (ISLE.TUNE.sim.expeditions.yards || {})[P.kind] && P.activities.WORK; }).length }; });
  return out;
};
ISLE.expChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'expeditions: ' + name, ok: !!pass, detail: detail }); }, X = ISLE.TUNE.sim.expeditions, camps = b.camps;
  var towns = Object.keys(b.towns);
  ok('each town sent a crew of ' + X.hands + ' by boat to an island shore with a sea route, the camp pitched at a stand of its forest, its people the town\'s own at work', camps.length >= towns.length && towns.every(function (s) { return camps.some(function (C) { return C.town === s; }); }) &&
    camps.every(function (C) { return C.people === X.hands && C.seaKm > 0 && C.stands > 0 && (C.struck ? true : C.here === C.people); }),
    camps.map(function (C) { return C.id + (C.to ? ' to ' + C.to : '') + ': ' + C.people + ' hands, ' + C.seaKm + ' km by sea, ' + C.stands + ' stands, ' + C.state + (C.stand && C.stand.stand ? ' at ' + C.stand.stand.split(':').slice(-2).join(':') : ''); }).join('; ') || ('no camp' + (b.log.length ? '; log ' + JSON.stringify(b.log.slice(0, 3)) : '')));
  var landedCamps = camps.filter(function (C) { return b.minute >= C.lands + 2 * 1440; });
  if (landedCamps.length) ok('every camp landed two days or more made the island\'s mahogany with gum and kapok by it, from its stand', landedCamps.every(function (C) { return C.made.mahogany > 0 && C.made.gum > 0 && C.made.kapok > 0 && C.taken > 0; }),
    landedCamps.map(function (C) { return C.id + ': ' + Object.keys(C.made).map(function (g) { return g + ' ' + Math.round(C.made[g]); }).join(', ') + '; ' + Math.round(C.taken) + ' taken from its stands, ' + C.moves + ' moves'; }).join('; '));
  var shipped = camps.filter(function (C) { return b.minute >= C.lands + 6 * 1440; });
  if (shipped.length) ok('its goods landed at the town\'s canoe stop by the boat and were booked imported there (a load is in the camp, at sea or landed)', shipped.every(function (C) { return (C.landed.mahogany || 0) > 0 && (b.towns[C.town].mahogany.imported || 0) > 0; }),
    shipped.map(function (C) { return C.id + ': mahogany ' + Math.round(C.landed.mahogany || 0) + ' landed, ' + Math.round(C.atSea.mahogany || 0) + ' at sea; ' + C.town + ' imported ' + Math.round(b.towns[C.town].mahogany.imported); }).join('; '));
  ok('every camp fed by the town\'s boat at its ration line (no meal without food)', camps.every(function (C) { return C.meals.none === 0 && (C.struck || C.meals.mess > 0 || b.minute < C.lands + 1440); }),
    camps.map(function (C) { return C.id + ' ' + C.meals.mess + ' mess meals, ' + C.meals.none + ' without food'; }).join('; '));
  var yards = towns.filter(function (s) { return b.towns[s].dockyards > 0; }), late = camps.filter(function (C) { return b.minute >= C.lands + 12 * 1440; });
  if (yards.length && late.length) ok('the canoe sheds build canoes of the mahogany and gum (expeditions.yards)', yards.some(function (s) { return b.towns[s].canoes > 0 && b.towns[s].mahogany.used > 0 && b.towns[s].gum.used > 0; }),
    yards.map(function (s) { var T = b.towns[s]; return s + ': ' + T.canoes + ' canoes from ' + Math.round(T.mahogany.used) + ' mahogany and ' + Math.round(T.gum.used) + ' gum (' + T.dockyards + ' canoe sheds)'; }).join('; '));
  var due = camps.filter(function (C) { return b.minute >= C.sailed + X.days * 1440 + 1440; });
  if (due.length) ok('after ' + X.days + ' days the crew came home: every hand back in its own home and post, the camp struck', due.every(function (C) { return C.struck && C.home === C.people && C.here === 0; }),
    due.map(function (C) { return C.id + (C.struck ? ' struck day ' + Math.round(C.struck / 1440) + ' (' + C.why + '): ' + C.home + ' of ' + C.people + ' home' : ' still out'); }).join('; '));
  return res;
};
