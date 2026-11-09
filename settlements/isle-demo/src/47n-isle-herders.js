/* ============================== 7h10. THE HERDING BANDS: SEMI-NOMADIC CAMPS ON THE PASTURE (2026-11-09) ============================== */
/* [G data] The owner (2026-11-09): "add some ranch hamlets / semi nomadic herding camps on the map". A town's HERDING BAND
   (`herders` in the tune) is a settlement of the town's (kind 'camp'): its households in a camp of the Islanders kit's
   shelters (a mess fed from its store), its herders working the herd. The herd is core/camp 40's work camp (47h's
   machine, the lumber village's crew): its range is the pasture round the band's home ground (the page's `pasture(x, z)`,
   0..1), cut into cells each holding its pasture share x its hectares x head a hectare x meat lots a head; the herd grazes
   one cell down to `strikeAt`, then the band STRIKES AND MOVES ITS WHOLE CAMP to the next (its camp, store and herd places
   move together: ISLE.herdStep); the grass it left grows back. Its meat and hides go to its town by cart, the town's
   staples back, at the detour rate from wherever the camp stands (the routes' minutes follow it); it eats its own meat
   first. The page hands the bands in (openworld/isle-demo 48n: ISLE_HERDERS.make): [{id, town, name?, gloss?, yard: {x, z},
   pasture(x, z), h(x, z)}].
     ISLE.simHerders(bands)   after the hamlets (48t): each band declared -> {bands: [report], errors}
     ISLE.herdBooks()         a snapshot: each band's people, meals, made, taken, moves, stand, what reached its town
     ISLE.herdChecks(a, b)    over two snapshots, each with a negative in tests/test-isle-herders.js */
ISLE.simHerders = function (bands) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, HB = T.herders, out = { bands: [], errors: [] }; if (!HB || !bands || typeof KCAMP === 'undefined') return out;
  S.herders = S.herders || [];
  /* the goods a band makes, in its town's economy (hides are the villages' good: a page with no ranch has none yet) */
  var Bg = Object.keys(HB.crew.batch.out).concat(Object.keys(HB.crew.batch.by || {}));
  S.order.forEach(function (s) { var E = SIM.econ(s); Bg.forEach(function (g) { if (!E.goods[g]) E.goods[g] = { id: g, minLoad: (T.hamlets.minLoad || {})[g], unit: 'lot' }; }); });
  bands.forEach(function (B) { try { var X = ISLE.simHerdBand(B); S.herders.push(X); out.bands.push({ id: X.id, town: X.town, people: X.people, stands: X.life.stands, at: [Math.round(X.at.x), Math.round(X.at.z)] }); }
    catch (e) { out.errors.push(B.id + ': ' + (e && e.message || e)); } });
  if (SIM.stepHooks.indexOf(ISLE.herdStep) < 0) SIM.stepHooks.push(ISLE.herdStep);
  if (SIM.placesChanged) SIM.placesChanged();
  return out;
};
ISLE.simHerdBand = function (B) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, HB = T.herders, HT = T.hamlets, I = T.items, s = null, TSp = null;
  Object.keys(T.towns).forEach(function (k) { if (T.towns[k].name === B.town || T.towns[k].id === B.town) { TSp = T.towns[k]; s = T.towns[k].id; } });
  if (!s) throw new Error('no town ' + B.town);
  var id = B.id, h = B.h || function () { return 0; }, name = (B.name ? B.name + ' (' : '') + 'the herding band of ' + TSp.name + (B.name ? ')' : '');
  SIM.settlement({ id: id, faction: TSp.faction, name: name, parent: s, kind: 'camp' });
  SIM.org({ id: id + '.folk', faction: TSp.faction, name: 'The herders' });
  var hh = HB.households, np = hh * 5, places = [], y0 = h(B.yard.x, B.yard.z);
  /* the herd: the work camp on the pasture round the band's home ground; its first pitch is where the band camps */
  var CR = Object.assign({}, HB.crew, { posts: HB.hands, focus: 'herding' });
  var res = { id: id + ':range', kind: 'pasture', x: B.yard.x, z: B.yard.z, forest: B.pasture };
  var cr = ISLE.simCrewPlace(id, { name: name, focus: 'herding' }, places, res, CR, h); cr.herd = true;
  var P0 = SIM.R.place[cr.place]; P0.kind = 'herd'; P0.name = name + ': the herd at pasture'; P0.tags.key = 'herd';
  var at = { x: P0.x + 60, z: P0.z };
  var camp = SIM.place({ id: id + '.camp', name: 'the herders\' camp', kind: 'camp', x: at.x, y: h(at.x, at.z), z: at.z, door: { x: at.x, y: h(at.x, at.z), z: at.z },
    activities: { SLEEP: np, EAT: np, REST: np, IDLE: np, HOUSEWORK: np, SOCIALIZE: Math.ceil(np / 3) }, indoor: {}, wander: 15, settlement: id, tags: { key: 'herders camp', role: 'camp', hamlet: id } });
  camp.mess = true; camp.cls = 'poor';
  var store = SIM.place({ id: id + '.store', name: 'the herders\' store', kind: 'warehouse', x: at.x + 20, y: h(at.x + 20, at.z), z: at.z, door: { x: at.x + 20, y: h(at.x + 20, at.z), z: at.z }, activities: { WORK: 1 }, indoor: true, settlement: id, tags: { key: 'herders store', role: 'warehouse', hamlet: id } });
  places.push(camp, store);
  /* the people: the herders at the herd and the store, their kin in the camp */
  var prefers = { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' } };
  SIM.role({ id: id + '.worker', name: 'herder', org: id + '.folk', settlement: id, count: HB.hands + 1, homes: ['camp'], prefers: prefers, work: { kinds: ['herd', 'warehouse'], act: 'WORK', near: true }, sched: T.sched.work });
  SIM.role({ id: id + '.kin', name: 'kin', org: id + '.folk', settlement: id, fill: true, homes: ['camp'], prefers: prefers, sched: T.sched.kin });
  var pop = SIM.populate({ settlement: id, prefix: id + '.' });
  var mine = SIM.all('actor').filter(function (a) { return SIM.settlementOf(a) === id && !a.driven; });
  mine.forEach(function (a) { a.cls = 'poor'; a.wealth = 0; }); camp.people = mine.length;
  /* its economy: its town's goods; its own meat first at its meals; its store opened with the town's food */
  var EP = SIM.econ(s), Xp = S.towns[s], goods = {}; Object.keys(EP.goods).forEach(function (g) { goods[g] = EP.goods[g].minLoad != null ? { minLoad: EP.goods[g].minLoad } : {}; goods[g].unit = EP.goods[g].unit; });
  var foods = ['meat'].concat(Xp.econ.foods.filter(function (f) { return f !== 'meat'; })), rules = ISLE.simRules(id); if (rules.govern) rules.govern = Object.assign({}, rules.govern, { exported: false, pool: [s] });
  SIM.economy(Object.assign({ goods: goods, inputs: {}, every: T.economy.every, window: T.economy.window, imports: T.economy.imports, cart: T.economy.cart, meal: { per: I.perMeal, foods: foods.slice() }, useShort: true }, rules), { settlement: id });
  SIM.store(store.id, { kind: 'warehouse' });
  ISLE.carryFood(s, id, store, foods.filter(function (f) { return f !== 'meat'; }), mine.length * I.meals * I.perMeal * HB.startDays);
  var life = ISLE.simCrewStart(cr, CR, id);
  for (var c = 0; c < (HB.carts || 1); c++) { var a = SIM.actor({ id: id + '.cart' + c, role: 'cart', org: id + '.folk', home: store.id, cls: 'cart', job: 'carters' }); a.pos = { x: store.x, y: store.y || 0, z: store.z }; SIM.cart(a); }
  /* the roads: its meat and hides to its town's nearest warehouse, the staples back (meat it makes itself) */
  var R = HT.road, ship = cr.goods.concat(Object.keys(CR.batch.by || {})), Wp = null, bd = Infinity; EP.warehouses.forEach(function (P) { var d = Math.hypot(P.x - store.x, P.z - store.z); if (d < bd) { bd = d; Wp = P; } });
  var mins = ISLE.herdMinutes(store, Wp), gO = {}, gI = {}, eO = {}, eI = {}; gO[id] = ship.slice(); gO[s] = []; gI[s] = foods.filter(function (f) { return f !== 'meat'; }); gI[id] = []; eO[s] = {}; ship.forEach(function (g) { eO[s][g] = 1; }); eI[id] = {};
  gI[s].forEach(function (f) { eI[id][f] = mine.length * I.meals * I.perMeal / foods.length; });
  var Ro = SIM.trade({ id: id + ':out', stops: [{ settlement: id, place: store.id }, { settlement: s, place: Wp.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins, keep: 1, want: 1e6, goods: gO, expect: eO });
  var Ri = SIM.trade({ id: id + ':in', stops: [{ settlement: s, place: Wp.id }, { settlement: id, place: store.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins, keep: R.keep, want: R.want, goods: gI, expect: eI });
  if (SIM.MONEY && ISLE.simMoneyTown) ISLE.simMoneyTown(id, { fundedBy: 'treasury:' + s });   /* its money from its town's treasury, not minted */
  SIM.level(id, 'abstract');
  SIM.logEvent('herding band', { settlement: s, band: id, people: mine.length, stands: life.stands });
  return { id: id, town: s, townName: TSp.name, name: B.name || null, gloss: B.gloss || null, people: mine.length, households: hh, crew: cr, life: life, places: { camp: camp.id, store: store.id, herd: cr.place }, out: Ro.id, 'in': Ri.id, warehouse: Wp.id, at: at, goods: ship, moved: 0, ms: mins };
};
ISLE.herdMinutes = function (from, to) { var R = ISLE.TUNE.sim.hamlets.road, d = Math.hypot(to.x - from.x, to.z - from.z); return Math.max(60, Math.round(d * R.detour / (R.kmh * 1000 / 60))); };
/* each hour: a herd that moved takes its camp and store with it, and the carts' road from the new ground */
ISLE.herdStep = function (minute) {
  var S = ISLE.SIM; if (minute % 60 || !S.herders) return;
  S.herders.forEach(function (X) { var P = SIM.R.place[X.places.herd]; if (!P) return; var nx = P.x + 60, nz = P.z; if (Math.abs(nx - X.at.x) < 1 && Math.abs(nz - X.at.z) < 1) return;
    X.at = { x: nx, z: nz }; X.moved++;
    [[X.places.camp, 0], [X.places.store, 20]].forEach(function (q) { var Q = SIM.R.place[q[0]]; if (!Q) return; Q.x = nx + q[1]; Q.z = nz; Q.y = P.y; Q.door = { x: Q.x, y: Q.y, z: Q.z }; });
    var Wp = SIM.R.place[X.warehouse], m = ISLE.herdMinutes(SIM.R.place[X.places.store], Wp); X.ms = m;
    [X.out, X['in']].forEach(function (rid) { var Rt = SIM.TRADE && SIM.TRADE.routes[rid]; if (Rt) Rt.minutes = m; });
    if (SIM.placesChanged) SIM.placesChanged();
    SIM.logEvent('herders moved', { band: X.id, to: [Math.round(nx), Math.round(nz)], minutes: m }); });
};
ISLE.herdBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), bands: [] }; if (!S.herders) return out; var I = SIM.ITEMS;
  S.herders.forEach(function (X) {
    var E = SIM.econ(X.id), Bk = (I.statsBy || {})[X.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, Bk.meals || {}), made = {};
    X.goods.forEach(function (g) { made[g] = E ? (E.made[g] || 0) : 0; });
    var here = SIM.all('actor').filter(function (a) { return !a.driven && a.home === X.places.camp; }).length, R = SIM.tradeReport(X.out), landed = R.landed[X.id + '>' + X.town] || {};
    var site = ISLE.crewSite({ crew: X.crew, id: X.id, resource: X.crew.id }), P = SIM.R.place[X.places.herd], Pc = SIM.R.place[X.places.camp];
    out.bands.push({ id: X.id, town: X.town, name: X.name, people: X.people, here: here, meals: M, made: made, landed: Object.assign({}, landed), imported: SIM.econ(X.town).imported.meat || 0, taken: site.taken,
      stands: X.life.stands, stand: site.camp.stand, state: site.camp.state, moves: X.crew.moves, moved: X.moved, campAt: [Math.round(Pc.x), Math.round(Pc.z)], herdAt: [Math.round(P.x), Math.round(P.z)], minutes: X.ms }); });
  return out;
};
ISLE.herdChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'herders: ' + name, ok: !!pass, detail: detail }); }, L = b.bands, HB = ISLE.TUNE.sim.herders;
  ok('each town has its herding band, its households in their camp beside the herd', L.length >= 2 && L.every(function (x) { return x.people >= HB.households * 3 && x.here === x.people && Math.hypot(x.campAt[0] - x.herdAt[0], x.campAt[1] - x.herdAt[1]) < 100; }),
    L.map(function (x) { return (x.name ? x.name + ', ' : '') + x.id + ': ' + x.people + ' people, ' + x.here + ' in the camp, the herd ' + Math.round(Math.hypot(x.campAt[0] - x.herdAt[0], x.campAt[1] - x.herdAt[1])) + ' m off'; }).join('; '));
  var fed = L.filter(function (x) { return b.minute >= 1440; });
  if (fed.length) ok('every band fed (its own meat first, its town\'s staples by cart): no meal without food', fed.every(function (x) { return x.meals.none === 0 && x.meals.mess > 0; }),
    fed.map(function (x) { return x.id + ' ' + x.meals.mess + ' mess meals, ' + x.meals.none + ' without food'; }).join('; '));
  var work = L.filter(function (x) { return b.minute >= 2 * 1440; });
  if (work.length) ok('the herd grazes its range: meat and hides made from the pasture cell it stands on', work.every(function (x) { return x.made.meat > 0 && x.taken > 0 && x.stands > 1; }),
    work.map(function (x) { return x.id + ': meat ' + Math.round(x.made.meat) + ', hides ' + Math.round(x.made.hides || 0) + ', ' + Math.round(x.taken) + ' taken of ' + x.stands + ' cells'; }).join('; '));
  var sent = L.filter(function (x) { return b.minute >= 4 * 1440; });
  if (sent.length) ok('its meat reached its town by cart and was booked imported', sent.every(function (x) { return (x.landed.meat || 0) > 0; }),
    sent.map(function (x) { return x.id + ': ' + Math.round(x.landed.meat || 0) + ' meat landed in ' + x.town + ' (' + x.minutes + ' min a way)'; }).join('; '));
  var moved = L.filter(function (x) { return x.moves > 0; });
  if (moved.length) ok('a band that grazed a cell down moved its whole camp with its herd to the next', moved.every(function (x) { return x.moved >= 1 && Math.hypot(x.campAt[0] - x.herdAt[0], x.campAt[1] - x.herdAt[1]) < 100; }),
    moved.map(function (x) { return x.id + ': ' + x.moves + ' moves, the camp moved ' + x.moved + ' times, now at ' + x.campAt.join(','); }).join('; '));
  return res;
};
