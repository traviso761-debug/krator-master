/* ============================== 7h2. THE HAMLETS IN THE SIM (core/hamlet H5, 2026-10-26) ============================== */
/* [G data] core/hamlet/PLAN.md section 5: each resource village a settlement of its parent town on core/simulation, at
   the abstract level always (its books, its carts, its households' meals by the hour; nobody posed), tuned by
   ISLE.TUNE.sim.hamlets (15). The villages come from core/hamlet's KHAMLET.village records: the open world hands in its
   six, laid out on the map (openworld/isle-demo 48: ISLE_HAMLETS.make); the node test hands in the same six on its
   stand-in ground. A page that hands in none keeps its towns' economies as they were.
     ISLE.simHamlets(villages)   villages: [{spec: {id, name, focus, parent}, village: KHAMLET.village's result}], after
                                 ISLE.simDeclare. For each, in order:
       - THE SETTLEMENT: its own (the parent's faction), its parent named;
       - THE PLACES, one a record: its houses homes (beds: households times the culture row's household), its works by
         `kinds` with the row's jobs as WORK posts, its warehouse a store, its food store selling the parent's foods;
       - THE PEOPLE: a worker role for the works and services (the census's workers), the kin to fill the beds, dealt by
         SIM.populate in the village;
       - ITS ECONOMY: its works' recipes (`producers`), its carts, the governor and spoilage (49's rules: working to its
         town's need, its town's stock counted with its own, its shipping not counted as demand), its warehouse
         opened with `startDays` of the parent's foods and `startLots` of its own goods; the households' stores with two
         to three days of meals;
       - THE ROAD (SIM.trade on the timer, `road`): OUT, all the village makes but its own use, to the parent's warehouse
         nearest the village; IN, the parent's foods the village eats (not those it makes), to the village's warehouse;
       - lowered to the abstract level.
     Before the first village, the towns take the villages' goods (`goods`), their new inputs, recipes and uses (`town`),
     and the lakatoi the charcoal and the iron (`lakatoi`, `expect`), and the iron tools go on sale (`wares`).
     ISLE.simHamletBooks()       a snapshot: each village's people, workers, made, shipped and landed by good, its food
     ISLE.hamletChecks(a, b)     over two snapshots: each village staffed and fed (no meal without food, its food never
                                 out after its first day), making its goods, every load it sent landed in its town or at
                                 sea, its town's books showing them imported, the books balancing in the village */
ISLE.simHamlets = function (villages) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, HT = T.hamlets, I = T.items, out = { villages: [], routes: [], errors: [] };
  if (!S || !HT || !villages || !villages.length) return out;
  S.hamlets = out;
  ISLE.simHamletTowns();
  villages.forEach(function (V) {
    var sp = V.spec, v = V.village;
    if (!v || v.error || !v.records) { out.errors.push(sp.id + ': ' + (v && v.error || 'no village')); return; }
    try { out.villages.push(ISLE.simHamlet(sp, v, V.resource)); } catch (e) { out.errors.push(sp.id + ': ' + (e && e.stack ? e.stack : e)); }
  });
  out.villages.forEach(function (X) { out.routes.push(X.out, X['in']); });
  if (SIM.MONEY) out.villages.forEach(function (X) { ISLE.simMoneyTown(X.id); });   /* their accounts (47m) */
  return out;
};
/* the towns take the villages' goods: new goods in every economy, the inputs, the recipes, the lakatoi's goods */
ISLE.simHamletTowns = function () {
  var S = ISLE.SIM, HT = ISLE.TUNE.sim.hamlets;
  S.order.forEach(function (s) {
    var E = SIM.econ(s), TW = HT.town[s] || {}, X = S.towns[s];
    HT.goods.forEach(function (g) { if (!E.goods[g]) E.goods[g] = { id: g, minLoad: HT.minLoad[g], unit: 'lot' }; });
    Object.keys(TW.inputs || {}).forEach(function (g) { E.inputs[g] = TW.inputs[g]; });
    Object.keys(TW.recipes || {}).forEach(function (kind) { var R0 = TW.recipes[kind];
      X.places.places.forEach(function (P) { if (P.kind !== kind || E.recipes[P.id] || !P.activities.WORK) return;
        SIM.recipe(P.id, R0);
        Object.keys(R0.batch.out).forEach(function (g) { X.econ.goods[g] = (X.econ.goods[g] || 0) + 1; }); }); });
    Object.keys(TW.batches || {}).forEach(function (kind) { var R1 = TW.batches[kind], n = 0;
      X.places.places.forEach(function (P) { if (P.kind !== kind || !P.activities.WORK || (n++ % R1.every)) return; SIM.recipe(P.id, { batch: R1.batch, cap: R1.cap }); }); });
    var W = E.warehouses[0]; if (W) Object.keys(TW.startLots || {}).forEach(function (g) { W.stock[g] = (W.stock[g] || 0) + TW.startLots[g]; });
    if (TW.stockpile) SIM.stockpile(s, TW.stockpile);   /* the town's ceilings on the villages' chain (Kautoa's iron tools, Valapo's iron) */
    /* the iron tools on sale where the villages' goods reach (`wares`: the markets, the shops, the smithies) */
    var IS = SIM.ITEMS; if (IS && HT.wares) X.places.places.forEach(function (P) { var add = HT.wares[P.kind]; if (!add) return;
      var L = (IS.sells[P.id] || []).slice(); add.forEach(function (k) { if (IS.kinds[k] && L.indexOf(k) < 0) L.push(k); }); if (L.length === (IS.sells[P.id] || []).length) return;
      SIM.shop(P.id, L); if (!(P.activities.BUY >= 2)) { P.activities.BUY = 2; S.waresMoved = true; } });
  });
  if (S.waresMoved && SIM.placesChanged) SIM.placesChanged();
  /* the lakatoi carries the charcoal to Valapo's smithies and their iron back; Valapo expects its charcoal before any has come */
  var L = SIM.TRADE && SIM.TRADE.routes.lakatoi;
  if (L && L.goods) { var G = {}; Object.keys(L.goods).forEach(function (s) { G[s] = L.goods[s].concat((HT.lakatoi || {})[s] || []); }); L.goods = G;
    var X = {}; Object.keys(L.expect || {}).forEach(function (s) { X[s] = Object.assign({}, L.expect[s]); });
    Object.keys(HT.expect || {}).forEach(function (s) { X[s] = Object.assign(X[s] || {}, HT.expect[s]); }); L.expect = X; }
  S.hamletUses = { carry: {}, drawn: {}, short: {} };
  if (SIM.stepHooks.indexOf(ISLE.simHamletUses) < 0) SIM.stepHooks.push(ISLE.simHamletUses);
};
/* the towns' hourly uses of the villages' goods (`town[s].uses`: Kautoa builds with timber), a person a day */
ISLE.simHamletUses = function (minute) {
  if (minute % 60) return; var S = ISLE.SIM, HT = ISLE.TUNE.sim.hamlets, U = S.hamletUses;
  S.order.forEach(function (s) { var us = (HT.town[s] || {}).uses, X = S.towns[s]; if (!us || !X) return;
    Object.keys(us).forEach(function (g) { var k = s + ':' + g, c = (U.carry[k] || 0) + us[g] * X.pop.actors / 24, n = Math.floor(c); U.carry[k] = c - n; if (n <= 0) return;
      var got = SIM.supply(g, n, false, s); U.drawn[k] = (U.drawn[k] || 0) + got; if (got < n) U.short[k] = (U.short[k] || 0) + n - got; }); });
};
ISLE.simHamlet = function (sp, v, res) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, HT = T.hamlets, I = T.items, id = sp.id, TSp = T.towns[sp.parent], ps = TSp.id, Xp = S.towns[ps];
  var row = KHAMLET.row('islander_east'), C = v.census, h = function (x, z) { return typeof WORLD !== 'undefined' && WORLD.H ? WORLD.H(x, z) : 0; };
  SIM.settlement({ id: id, faction: TSp.faction, name: sp.name, parent: ps });
  if (!SIM.R.org[id + '.folk']) SIM.org({ id: id + '.folk', faction: TSp.faction, name: 'The people of the ' + sp.name.toLowerCase() });
  /* the places */
  var jobsOf = {}; (row.works[sp.focus] || []).forEach(function (w) { jobsOf[w.key] = w.jobs; });
  var places = [], beds = 0, kinds = {};
  v.records.forEach(function (r) {
    var role = r.role, K = HT.kinds[role === 'works' ? r.key : role]; if (!K) return;
    var acts = Object.assign({}, K[1]), y = h(r.x, r.z);
    if (role === 'house') { var b = Math.round((r.households || 1) * row.household); Object.keys(acts).forEach(function (a) { acts[a] = b; }); beds += b; }
    else if (role === 'works') acts.WORK = jobsOf[r.key] || 4;
    else acts.WORK = (row.services[role] || 2);
    var P = SIM.place({ id: r.id, name: sp.name + ': ' + (role === 'works' ? K[0] : role), kind: K[0], x: r.x, y: y, z: r.z, ry: r.ry || 0, door: { x: r.x, y: y, z: r.z },
      activities: acts, indoor: true, settlement: id, tags: { key: r.key, role: role, hamlet: id, focus: sp.focus } });
    places.push(P); kinds[K[0]] = (kinds[K[0]] || 0) + 1;
  });
  /* the felling crew (`crew`, core/camp 40): the range's stands, the camp pitched at the first, its posts the sawpits' share */
  var CR = HT.crew && sp.focus === HT.crew.focus && res && res.forest && typeof KCAMP !== 'undefined' ? HT.crew : null;
  var crew = CR ? ISLE.simCrewPlace(id, sp, places, res, CR, h) : null; if (crew) kinds.fellcamp = 1;
  /* the people: the workers for every post, the kin to fill the beds */
  var posts = 0, wk = {}; places.forEach(function (P) { if (P.activities.WORK && P.kind !== 'home') { posts += P.activities.WORK; wk[P.kind] = 1; } });
  var prefers = { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' } };
  SIM.role({ id: id + '.worker', name: 'villager', org: id + '.folk', settlement: id, count: Math.min(posts, beds), homes: ['home'], prefers: prefers,
    work: { kinds: Object.keys(wk), act: 'WORK', near: true }, sched: T.sched.work });
  SIM.role({ id: id + '.kin', name: 'kin', org: id + '.folk', settlement: id, fill: true, homes: ['home'], prefers: prefers, sched: T.sched.kin });
  var pop = SIM.populate({ settlement: id, prefix: id + '.' });
  var mine = SIM.all('actor').filter(function (a) { return SIM.settlementOf(a) === id && !a.driven; });
  mine.forEach(function (a) { a.cls = 'poor'; a.wealth = 0; });
  /* its economy: the parent's goods, its works' recipes, the governor (49) */
  var EP = SIM.econ(ps), goods = {}; Object.keys(EP.goods).forEach(function (g) { goods[g] = EP.goods[g].minLoad != null ? { minLoad: EP.goods[g].minLoad } : {}; goods[g].unit = EP.goods[g].unit; });
  var foods = Xp.econ.foods.slice(), makes = {};
  var rules = ISLE.simRules(id); if (rules.govern) rules.govern = Object.assign({}, rules.govern, { exported: false, pool: [ps] });   /* it works to its town's need, its town's stock its own */
  var E = SIM.economy(Object.assign({ goods: goods, inputs: CR ? Object.assign({}, CR.inputs) : {}, every: T.economy.every, window: T.economy.window, imports: T.economy.imports, cart: T.economy.cart,
    meal: { per: I.perMeal, foods: foods.slice() }, useShort: true }, rules), { settlement: id });
  /* the resource it works, by the map record's own id: its grade the yield (nothing runs out: the owner's rule) */
  var outs = {}; places.forEach(function (P) { var Pr = HT.producers[P.kind]; if (Pr && P.activities.WORK) Pr.out.forEach(function (g) { outs[g] = 1; }); });
  var siteId = res && res.id && !crew ? res.id : null;   /* a crew's range is its stands' sites (below) */
  var SK = (HT.sites || {})[res && res.kind] || {};
  if (siteId) SIM.site({ id: siteId, settlement: id, kind: res.kind, goods: Object.keys(outs), grade: res.grade == null ? null : res.grade, amount: null, regen: SK.regen,
    yield: res.grade != null && HT.gradeYield[res.grade] != null ? HT.gradeYield[res.grade] : 1, capacity: res.cap == null ? null : res.cap });   /* its amount set from its life once its works are known (below) */
  places.forEach(function (P) {
    if (P.kind === 'warehouse') { SIM.store(P.id, { kind: 'warehouse' }); return; }
    var Pr = HT.producers[P.kind]; if (!Pr || !P.activities.WORK) return;
    SIM.recipe(P.id, Object.assign({ out: Pr.out.slice(), rate: Pr.rate, cap: Pr.cap }, siteId ? { site: siteId } : {})); Pr.out.forEach(function (g) { makes[g] = (makes[g] || 0) + 1; });
  });
  /* the site's amount from its life (`life`, `sites[kind].years`): what its works draw flat out a day, less its regrowth */
  var life = null; if (crew) life = ISLE.simCrewStart(crew, CR, id);
  if (siteId) { life = ISLE.siteLife(places, res, SK);
    SIM.site({ id: siteId, settlement: id, kind: res.kind, goods: Object.keys(outs), grade: res.grade == null ? null : res.grade, amount: life.amount, regen: SK.regen,
      yield: life.yield, capacity: res.cap == null ? null : res.cap }); }
  var pol = {}; Object.keys(makes).concat(crew ? crew.goods.concat(Object.keys(CR.batch.by || {})) : []).forEach(function (g) { if (HT.stockpile && HT.stockpile[g]) pol[g] = HT.stockpile[g]; }); SIM.stockpile(id, pol);
  var W = E.warehouses; if (!W.length) throw new Error('no warehouse');
  var people = mine.length, need = people * I.meals * I.perMeal * HT.startDays;
  foods.forEach(function (f, j) { var n = Math.round(need / foods.length); W[j % W.length].stock[f] = (W[j % W.length].stock[f] || 0) + n; });
  Object.keys(HT.startLots).forEach(function (g) { if (makes[g]) W[0].stock[g] = (W[0].stock[g] || 0) + HT.startLots[g]; });
  for (var c = 0; c < HT.carts; c++) { var Hw = W[c % W.length], a = SIM.actor({ id: id + '.cart' + c, role: 'cart', org: id + '.folk', home: Hw.id, cls: 'cart', job: 'carters' });
    a.pos = { x: Hw.x, y: Hw.y || 0, z: Hw.z }; SIM.cart(a); }
  /* the households and the food store */
  var ppl = {}; mine.forEach(function (a) { if (a.home) ppl[a.home] = (ppl[a.home] || 0) + 1; });
  var u = function (a, b, cc) { return KRAND.unit(KRAND.hash(T.seed, 71, a, b, cc || 0)); };
  places.forEach(function (P, i) {
    if (P.kind === 'staples') SIM.shop(P.id, foods.slice());
    if (!ppl[P.id]) return; P.people = ppl[P.id];
    var days = I.storeDays[0] + (I.storeDays[1] - I.storeDays[0]) * u(i, 1), serv = Math.round(P.people * I.meals * I.perMeal * days), k = 2 + Math.floor(u(i, 2) * 2);
    P.store = {}; for (var j = 0; j < k; j++) { var f = foods[Math.floor(u(i, 3, j) * foods.length) % foods.length]; P.store[f] = (P.store[f] || 0) + Math.round(serv / k); }
  });
  /* the road: OUT what it makes, IN the parent's foods; the parent's warehouse nearest the village */
  var R = HT.road, W0 = W[0], Wp = null, bd = Infinity;
  EP.warehouses.forEach(function (P) { var d = Math.hypot(P.x - W0.x, P.z - W0.z); if (d < bd) { bd = d; Wp = P; } });
  var mins = Math.max(60, Math.round(bd * R.detour / (R.kmh * 1000 / 60))), goodsOut = Object.keys(makes), expect = {}, expIn = {};
  goodsOut.forEach(function (g) { expect[g] = 1; });
  foods.forEach(function (f) { if (!makes[f]) expIn[f] = people * I.meals * I.perMeal / foods.length; });
  var gOut = {}, gIn = {}, eOut = {}, eIn = {}; gOut[id] = goodsOut; gOut[ps] = []; gIn[ps] = foods.filter(function (f) { return !makes[f]; }); gIn[id] = []; eOut[ps] = expect; eIn[id] = expIn;   /* not what it makes (the ranch's meat) */
  var Ro = SIM.trade({ id: id + ':out', stops: [{ settlement: id, place: W0.id }, { settlement: ps, place: Wp.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins,
    keep: 0, want: 1e6, goods: gOut, expect: eOut });
  var Ri = SIM.trade({ id: id + ':in', stops: [{ settlement: ps, place: Wp.id }, { settlement: id, place: W0.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins,
    keep: R.keep, want: R.want, goods: gIn, expect: eIn });
  SIM.level(id, 'abstract');
  return { id: id, name: sp.name, focus: sp.focus, parent: ps, people: people, workers: mine.filter(function (a) { return a.work; }).length, posts: posts, beds: beds,
    census: { pop: C.pop, workers: C.workers }, kinds: kinds, makes: goodsOut, foods: foods, minutes: mins, km: Math.round(bd / 100) / 10, out: Ro.id, 'in': Ri.id, landing: Wp.id, warehouse: W0.id, populate: pop, resource: crew ? res.id : siteId, life: life, crew: crew, siteGoods: crew ? crew.goods.slice() : null };
};
/* THE FELLING CREW (`crew`; core/camp 40-camp-work.js). Its place (kind `fellcamp`, out of doors) stands at the stand the camp
   is pitched at; its posts are `share` of the sawpits' (taken off them, so the village's workers are the same people);
   the range is KCAMP.stands round the first sawpit (the yard), each cell's timber its forest share (`res.forest`, sampled)
   x its hectares x `treesPerHa` x `lotsPerTree`. ISLE.simCrewStart declares the first stand's site and the crew's batch
   recipe on it, and returns the range's life (its full day's draw against what the range grows back a day for ever:
   KCAMP.workYield). ISLE.simCrews (a step hook, hourly) moves the camp when its stand is down to its seed trees */
ISLE.simCrewPlace = function (id, sp, places, res, CR, h) {
  var saw = places.filter(function (P) { return P.kind === 'sawpit' && P.activities.WORK; }), yard = saw.length ? [saw[0].x, saw[0].z] : [res.x, res.z];
  var C = Object.assign({}, KCAMP.WORK, CR.cfg || {}), n = CR.samples == null ? 4 : CR.samples, ha = C.cell * C.cell / 1e4;
  var cap = function (x, z, cell) { var f = 0; for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) f += res.forest(x + ((i + 0.5) / n - 0.5) * cell, z + ((j + 0.5) / n - 0.5) * cell) || 0;
    return f / (n * n) * ha * CR.treesPerHa * CR.lotsPerTree; };
  var stands = KCAMP.stands({ id: id + ':crew', range: CR.range, yard: yard, capacity: cap, cell: C.cell, minCap: C.cell * C.cell / 1e4 * CR.treesPerHa * CR.lotsPerTree * 0.25 });
  var W = KCAMP.workCamp({ id: id + ':crew', world: ISLE.TUNE.sim.seed, yard: yard, stands: stands, cfg: CR.cfg });
  var op = KCAMP.workStart(W, SIM.minute() / 1440); if (!op) throw new Error(id + ': no stand in the crew\'s range');
  var was = 0, now = 0; saw.forEach(function (P) { was += P.activities.WORK; P.activities.WORK = Math.max(1, Math.round(P.activities.WORK * (1 - CR.share))); now += P.activities.WORK; });
  var y = h(op.x, op.z), P = SIM.place({ id: id + ':crew', name: sp.name + ': felling camp', kind: 'fellcamp', x: op.x, y: y, z: op.z, door: { x: op.x, y: y, z: op.z },
    activities: { WORK: was - now }, indoor: false, settlement: id, tags: { role: 'camp', hamlet: id, focus: sp.focus } });
  places.push(P);
  return { id: W.id, settlement: id, place: P.id, W: W, posts: was - now, goods: Object.keys(CR.batch.out), taken0: 0, moves: 0, h: h };
};
ISLE.simCrewStart = function (crew, CR, id) {
  var W = crew.W, op = W.log[0], T = ISLE.TUNE.sim, w = T.sched.work, hours = 0;
  SIM.site({ id: op.stand, settlement: id, kind: 'stand', goods: crew.goods.slice(), amount: op.left, regen: 0 });
  SIM.recipe(crew.place, { batch: CR.batch, cap: CR.cap, site: op.stand });
  var S = ISLE.SIM; (S.crews || (S.crews = [])).push(crew); if (SIM.stepHooks.indexOf(ISLE.simCrews) < 0) SIM.stepHooks.push(ISLE.simCrews);
  for (var i = 0; i < w.length; i++) if (w[i][1] === 'WORK') hours += (i + 1 < w.length ? w[i + 1][0] : 24) - w[i][0];
  var out = 0; crew.goods.forEach(function (g) { out += CR.batch.out[g]; });
  var full = crew.posts * hours * out / CR.batch.hours, back = KCAMP.workYield(W), total = 0; W.stands.forEach(function (s) { total += s.cap; });
  return { full: Math.round(full), regen: Math.round(back), years: back >= full ? Infinity : total / (full - back) / 365, yield: 1, amount: total, stands: W.stands.length };
};
ISLE.simCrews = function (minute) { if (minute % 60) return; ((ISLE.SIM || {}).crews || []).forEach(function (c) { ISLE.crewStep(c, minute); }); };
ISLE.crewStep = function (c, minute) {
  var W = c.W, E = SIM.econ(c.settlement); if (!W.cur || !E) return;
  var R = E.recipes[c.place]; if (!R || R.hold) return;   /* on the march, or its range worked out */
  var St = E.resSites[W.cur.stand]; if (!St || !KCAMP.workDue(W, St.amount)) return;
  var m = KCAMP.workMove(W, minute / 1440, St.taken - c.taken0);
  if (!m.pitch) { SIM.recipeHold(c.place, 'range worked out'); return; }
  var to = m.pitch.stand, S2 = E.resSites[to];
  if (S2) SIM.siteRestore(to, m.pitch.left, c.settlement);   /* worked before: grown back since */
  else S2 = SIM.site({ id: to, settlement: c.settlement, kind: 'stand', goods: c.goods.slice(), amount: m.pitch.left, regen: 0 });
  c.taken0 = S2.taken; c.moves++;
  SIM.recipeSite(c.place, to); SIM.recipeHold(c.place, 'moving camp', Math.ceil(m.pitch.day * 1440));
  var P = SIM.R.place[c.place], y = c.h(m.pitch.x, m.pitch.z); P.x = m.pitch.x; P.y = y; P.z = m.pitch.z; P.door = { x: m.pitch.x, y: y, z: m.pitch.z };
  if (SIM.placesChanged) SIM.placesChanged();
};
/* the crew's range as one site, for the books: what its stands gave and grew back, what they hold now */
ISLE.crewSite = function (X) {
  var c = X.crew, W = c.W, E = SIM.econ(X.id), day = SIM.minute() / 1440, taken = 0, regrown = 0, amount = 0, start = 0, pre = W.id + ':stand:';
  Object.keys(E.resSites || {}).forEach(function (k) { if (k.indexOf(pre) === 0) { taken += E.resSites[k].taken; regrown += E.resSites[k].regrown || 0; } });
  var cur = W.cur && E.resSites[W.cur.stand], ct = cur ? cur.taken - c.taken0 : 0, R = E.recipes[c.place], Pc = SIM.R.place[c.place], wip = 0;
  if (R && R.batch && Pc && Pc.order) Object.keys(R.batch.out).forEach(function (g) { wip += R.batch.out[g]; });   /* a batch in hand: felled, not yet logs */
  W.stands.forEach(function (s) { start += s.cap; amount += KCAMP.workLeft(W, s.id, day, ct); });
  var at = KCAMP.workAt(W, day);
  return { id: X.resource, kind: 'stand', grade: null, yield: 1, taken: taken, wip: wip, regrown: regrown, amount: Math.round(amount), start: start,
    camp: { stand: W.cur ? W.cur.stand : null, state: at ? at.state : null, x: at ? at.x : null, z: at ? at.z : null, moves: c.moves, log: W.log.length, place: c.place,
      site: (E.recipes[c.place] || {}).site || null, held: E.recipes[c.place] && E.recipes[c.place].hold ? E.recipes[c.place].hold.reason : null } };
};
/* a site's life (the owner, 2026-11-02: a resource a major settlement's village works lasts at least five years): its full
   day's draw (every WORK post of the works on it, the `sched.work` hours, at the recipe's rate and the grade's yield), the
   years it is to last (`sites[kind].years`, by grade for an ore node, else `life.years`), and the amount that holds them
   against its nightly regrowth -> {full, regen, years, yield, amount} */
ISLE.siteLife = function (places, res, SK) {
  var T = ISLE.TUNE.sim, HT = T.hamlets, L = HT.life || {}, hours = 0, w = T.sched.work;
  for (var i = 0; i < w.length; i++) if (w[i][1] === 'WORK') hours += (i + 1 < w.length ? w[i + 1][0] : 24) - w[i][0];
  var yld = res.grade != null && HT.gradeYield[res.grade] != null ? HT.gradeYield[res.grade] : 1, full = 0;
  places.forEach(function (P) { var Pr = HT.producers[P.kind]; if (Pr && P.activities.WORK) full += P.activities.WORK * Pr.rate * hours * yld; });
  var Y = SK.years != null && typeof SK.years === 'object' ? SK.years[res.grade || 'medium'] : SK.years, years = Math.max(L.years == null ? 5 : L.years, Y == null ? 0 : Y);
  var regen = SK.regen || 0, amount = Math.ceil(Math.max(years * 365 * Math.max(0, full - regen), (L.minDays == null ? 30 : L.minDays) * full));
  return { full: Math.round(full), regen: regen, years: years, yield: yld, amount: amount };
};
/* a snapshot of the villages' books */
ISLE.simHamletBooks = function () {
  var S = ISLE.SIM, H = S && S.hamlets, out = { minute: SIM.minute(), villages: {}, towns: {}, ledger: SIM.ledgerSnap() }; if (!H) return out;
  var I = SIM.ITEMS;
  H.villages.forEach(function (X) {
    var E = SIM.econ(X.id), B = (I.statsBy || {})[X.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, B.meals || {});
    var R1 = SIM.tradeReport(X.out), R2 = SIM.tradeReport(X['in']), stock = function (g) { var n = 0; E.warehouses.concat(E.sites).forEach(function (P) { n += P.stock[g] || 0; }); return n; };
    var rows = {}; Object.keys(E.goods).forEach(function (g) { rows[g] = { made: E.made[g] || 0, used: E.used[g] || 0, imported: E.imported[g] || 0, exported: E.exported[g] || 0,
      short: E.short[g] || 0, stock: stock(g) + SIM.all('place').reduce(function (n, P) { return n + (P.settlement === X.id && P.store ? P.store[g] || 0 : 0); }, 0) }; });
    var Si = X.crew ? ISLE.crewSite(X) : SIM.sitesReport(X.id)[0] || null;
    out.villages[X.id] = { resource: X.resource, site: Si, life: X.life, siteGoods: X.siteGoods, policy: JSON.parse(JSON.stringify(E.policy || {})), parent: X.parent, people: X.people, workers: X.workers, posts: X.posts, makes: X.makes, foods: X.foods, meals: M, goods: rows,
      shipped: (R1.shipped[X.id + '>' + X.parent]) || {}, landed: (R1.landed[X.id + '>' + X.parent]) || {}, fed: (R2.landed[X.parent + '>' + X.id]) || {},
      atSea: R1.carriers.concat(R2.carriers).reduce(function (n, C) { C.cargo.forEach(function (c) { n[c.good] = (n[c.good] || 0) + c.n; }); return n; }, {}), level: SIM.levelOf(X.id) };
  });
  S.order.forEach(function (s) { var E = SIM.econ(s); (out.blocked || (out.blocked = {}))[s] = SIM.blockedReport(s); out.towns[s] = { imported: Object.assign({}, E.imported), made: Object.assign({}, E.made), used: Object.assign({}, E.used) }; });
  return out;
};
/* the checks over two snapshots (a at the start, b at the end of a run) */
ISLE.hamletChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'the hamlets: ' + name, ok: !!pass, detail: detail }); };
  var ids = Object.keys(b.villages), H = ISLE.SIM.hamlets;
  ok('every village declared (' + ids.length + '), each a settlement of its town, at the abstract level', ids.length === (ISLE.SIM.hamlets ? ISLE.SIM.hamlets.villages.length : 0) && ids.length >= 4 && ids.every(function (id) { return b.villages[id].level === 'abstract' && SIM.R.settlement[id].parent === b.villages[id].parent; }),
    ids.map(function (id) { return id + ' (' + b.villages[id].parent + ', ' + b.villages[id].people + ' people)'; }).join('; ') + (H.errors.length ? '; ERRORS ' + H.errors.join('; ') : ''));
  ok('every post staffed and every bed filled', ids.length && ids.every(function (id) { var X = b.villages[id]; return X.workers >= Math.min(X.posts, X.people) && X.people > 0; }),
    ids.map(function (id) { var X = b.villages[id]; return id + ' ' + X.workers + ' of ' + X.posts + ' posts, ' + X.people + ' people'; }).join('; '));
  var made = ids.map(function (id) { var X = b.villages[id], A = a.villages[id]; return { id: id, by: X.makes.map(function (g) { return [g, X.goods[g].made - A.goods[g].made]; }) }; });
  ok('each village makes its goods', made.every(function (m) { return m.by.length && m.by.every(function (p) { return p[1] > 0; }); }),
    made.map(function (m) { return m.id + ' ' + m.by.map(function (p) { return p[0] + ' ' + p[1]; }).join(', '); }).join('; '));
  var land = ids.map(function (id) { var X = b.villages[id], T = b.towns[X.parent], T0 = a.towns[X.parent];
    return { id: id, by: X.makes.map(function (g) { var sh = X.shipped[g] || 0, la = X.landed[g] || 0, sea = X.atSea[g] || 0; return { g: g, sh: sh, la: la, sea: sea, imp: (T.imported[g] || 0) - (T0.imported[g] || 0) }; }) }; });
  ok('every load a village sent landed in its town or is on the road, and its town booked it imported', land.every(function (L) { return L.by.some(function (x) { return x.la > 0; }) && L.by.every(function (x) { return x.sh === x.la + x.sea && x.imp >= x.la - (a.villages[L.id].landed[x.g] || 0); }); }),
    land.map(function (L) { return L.id + ' ' + L.by.map(function (x) { return x.g + ' ' + x.sh + ' sent, ' + x.la + ' landed, ' + x.sea + ' on the road'; }).join(', '); }).join('; '));
  var fed = ids.map(function (id) { var X = b.villages[id], A = a.villages[id], M = X.meals, M0 = A.meals, short = X.foods.reduce(function (n, f) { return n + (X.goods[f].short - A.goods[f].short); }, 0);
    return { id: id, meals: M.meal - M0.meal + M.single - M0.single, none: M.none - M0.none, short: short, fed: Object.keys(X.fed).reduce(function (n, g) { return n + X.fed[g]; }, 0) }; });
  ok('every village fed by its town (no meal without food, none of its food short)', fed.every(function (f) { return f.meals > 0 && f.none === 0 && f.short === 0 && f.fed > 0; }),
    fed.map(function (f) { return f.id + ' ' + f.meals + ' meals, ' + f.none + ' without food, ' + f.short + ' short, ' + f.fed + ' servings landed'; }).join('; '));
  /* Phase 1: each village works the record the map gave it, its grade setting the yield, its take what its books made;
     nothing past its stockpile ceiling by more than a load already on its way */
  var sites = ids.map(function (id) { var X = b.villages[id], A = a.villages[id], Si = X.site || {}, A0 = A.site || {}, mk = (X.siteGoods || X.makes).reduce(function (n, g) { return n + X.goods[g].made - A.goods[g].made; }, 0);
    return { id: id, ok: !!X.resource && Si.id === X.resource, gave: (Si.taken || 0) - (Si.wip || 0) - (A0.taken || 0) + (A0.wip || 0), made: mk, grade: Si.grade, yield: Si.yield }; });
  ok('each village works its record from the map, all its goods from it', sites.every(function (s) { return s.ok && s.gave > 0 && s.gave === s.made; }),
    sites.map(function (s) { return s.id + ': ' + (s.ok ? '' : 'NOT ITS RECORD ') + s.gave + ' taken, ' + s.made + ' made, grade ' + s.grade + ' x' + s.yield; }).join('; '));
  /* the felling crew (core/camp 40): it fells one stand at a time from its camp, the crew's recipe on the camp's stand, the
     camp's place where the log puts it; the logs it made all came from its range's stands */
  var crews = ids.filter(function (id) { return b.villages[id].site && b.villages[id].site.camp; }).map(function (id) { var X = b.villages[id], C = X.site.camp, A0 = a.villages[id].site || {};
    var P = SIM.R.place[C.place] || {}, fell = (X.siteGoods || []).reduce(function (n, g) { return n + X.goods[g].made - a.villages[id].goods[g].made; }, 0);
    return { id: id, C: C, ok: !!C.stand && (C.held === 'moving camp' || C.site === C.stand) && (C.state === 'pitched' || C.held === 'moving camp') && Math.hypot((P.x || 0) - C.x, (P.z || 0) - C.z) < 1 && X.site.taken - (X.site.wip || 0) - (A0.taken || 0) + (A0.wip || 0) === fell, fell: fell }; });
  if (crews.length) ok('the felling crew works one stand at a time from its camp, its logs all from its range', crews.every(function (q) { return q.ok; }),
    crews.map(function (q) { return q.id + ': ' + q.C.state + ' at ' + q.C.stand + (q.C.site === q.C.stand ? '' : ' (felling ' + q.C.site + ')') + (q.C.held ? ', ' + q.C.held : '') + ', ' + q.C.moves + ' moves, ' + q.fell + ' logs'; }).join('; '));
  /* the owner's rule (2026-11-02): each village's resource lasts at least `life.years`, flat out (its amount at the start
     against its full day's draw less its regrowth) and at the draw this run measured (what is left against the day's net take) */
  var LY = (ISLE.TUNE.sim.hamlets.life || {}).years || 5, days = Math.max(1e-9, (b.minute - a.minute) / 1440);
  var lives = ids.map(function (id) { var X = b.villages[id], A = a.villages[id], Si = X.site || {}, A0 = A.site || {}, Lf = X.life || {};
    var net = ((Si.taken || 0) - (A0.taken || 0)) / days - (Lf.regen || 0), flat = Lf.full > Lf.regen ? (Si.start || 0) / (Lf.full - Lf.regen) / 365 : Infinity;
    return { id: id, flat: flat, run: Si.amount == null ? Infinity : net > 0 ? Si.amount / net / 365 : Infinity, left: Si.amount, full: Lf.full, regen: Lf.regen }; });
  var yrs = function (v) { return v === Infinity ? 'for ever' : (Math.round(v * 10) / 10) + ' y'; };
  ok('each village\'s resource lasts at least ' + LY + ' years, flat out and at this run\'s draw', lives.every(function (L) { return L.flat >= LY && L.run >= LY - days / 365; }),
    lives.map(function (L) { return L.id + ': ' + yrs(L.flat) + ' flat out (' + L.full + ' a day, ' + L.regen + ' back a night), ' + yrs(L.run) + ' at this draw, ' + L.left + ' left'; }).join('; '));
  var over = []; ids.forEach(function (id) { var X = b.villages[id], T = b.ledger.towns[X.parent] || {}, V = b.ledger.towns[id] || {}, CAP = (ISLE.TUNE.sim.hamlets.road || {}).cap || 0;
    Object.keys(X.policy).forEach(function (g) { var m = X.policy[g].max, h = ((T[g] || {}).total || 0) + ((V[g] || {}).total || 0) + ((T[g] || {}).inbound || 0); if (m != null && h > m + CAP * 0.5 && (X.goods[g].made - a.villages[id].goods[g].made) > 0 && h > (((a.ledger.towns[X.parent] || {})[g] || {}).total || 0) + 0.2 * m + m) over.push(id + ' ' + g + ' ' + Math.round(h) + ' over ' + m); }); });
  /* and the towns' own ceilings on the chain (`town[s].stockpile`): what the town holds and has on its way, past `max` by
     more than a quarter (a batch or a load landing after the stop), and more than it held at the start, is a pile */
  var HTt = ISLE.TUNE.sim.hamlets.town || {}, towns = Object.keys(HTt).filter(function (s) { return HTt[s].stockpile && b.ledger.towns[s]; });
  towns.forEach(function (s) { Object.keys(HTt[s].stockpile).forEach(function (g) { var m = HTt[s].stockpile[g].max, R = b.ledger.towns[s][g] || {}, R0 = (a.ledger.towns[s] || {})[g] || {},
    h = (R.total || 0) + (R.inbound || 0), h0 = (R0.total || 0) + (R0.inbound || 0); if (m != null && h > m * 1.25 + 10 && h > h0) over.push(s + ' ' + g + ' ' + Math.round(h) + ' over ' + m); }); });
  ok('no village piles its goods past its stockpile ceiling, nor a town the iron chain past its own', !over.length, over.length ? over.join('; ') : ids.map(function (id) { return id + ' ' + JSON.stringify(b.villages[id].policy); }).join('; ') +
    towns.map(function (s) { return '; ' + s + ' ' + Object.keys(HTt[s].stockpile).map(function (g) { var R = b.ledger.towns[s][g] || {}; return g + ' ' + Math.round((R.total || 0) + (R.inbound || 0)) + ' of ' + HTt[s].stockpile[g].max; }).join(', '); }).join(''));
  var LG = SIM.ledger(a.ledger, b.ledger);
  ok('the books balance in every town and village, every road and sea leg reconciled (the ledger)', LG.ok, LG.ok ? Object.keys(LG.towns).length + ' settlements, ' + Object.keys(LG.routes).length + ' routes' : LG.problems.slice(0, 3).join('; '));
  return res;
};
