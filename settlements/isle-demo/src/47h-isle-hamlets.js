/* ============================== 7h2. THE HAMLETS IN THE SIM (core/hamlet H5, 2026-10-26) ============================== */
/* [G data] core/hamlet/PLAN.md section 5: each resource village a settlement of its parent town on core/simulation, at
   the abstract level always (its books, its carts, its households' meals by the hour; nobody posed), tuned by
   ISLE.TUNE.sim.hamlets (15). The villages come from core/hamlet's KHAMLET.village records: the open world hands in its
   four, laid out on the map (openworld/isle-demo 48: ISLE_HAMLETS.make); the node test hands in the same four on its
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
     and the lakatoi the charcoal and the iron (`lakatoi`, `expect`).
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
    try { out.villages.push(ISLE.simHamlet(sp, v)); } catch (e) { out.errors.push(sp.id + ': ' + (e && e.stack ? e.stack : e)); }
  });
  out.villages.forEach(function (X) { out.routes.push(X.out, X['in']); });
  return out;
};
/* the towns take the villages' goods: new goods in every economy, the inputs, the recipes, the lakatoi's goods */
ISLE.simHamletTowns = function () {
  var S = ISLE.SIM, HT = ISLE.TUNE.sim.hamlets;
  S.order.forEach(function (s) {
    var E = SIM.econ(s), TW = HT.town[s] || {}, X = S.towns[s];
    HT.goods.forEach(function (g) { if (!E.goods[g]) E.goods[g] = { id: g, minLoad: HT.minLoad[g] }; });
    Object.keys(TW.inputs || {}).forEach(function (g) { E.inputs[g] = TW.inputs[g]; });
    Object.keys(TW.recipes || {}).forEach(function (kind) { var R0 = TW.recipes[kind];
      X.places.places.forEach(function (P) { if (P.kind !== kind || E.recipes[P.id] || !P.activities.WORK) return;
        SIM.recipe(P.id, { out: R0.out.slice(), rate: R0.rate, cap: R0.cap });
        R0.out.forEach(function (g) { X.econ.goods[g] = (X.econ.goods[g] || 0) + 1; }); }); });
    var W = E.warehouses[0]; if (W) Object.keys(TW.startLots || {}).forEach(function (g) { W.stock[g] = (W.stock[g] || 0) + TW.startLots[g]; });
  });
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
ISLE.simHamlet = function (sp, v) {
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
  var EP = SIM.econ(ps), goods = {}; Object.keys(EP.goods).forEach(function (g) { goods[g] = EP.goods[g].minLoad != null ? { minLoad: EP.goods[g].minLoad } : {}; });
  var foods = Xp.econ.foods.slice(), makes = {};
  var rules = ISLE.simRules(id); if (rules.govern) rules.govern = Object.assign({}, rules.govern, { exported: false, pool: [ps] });   /* it works to its town's need, its town's stock its own */
  var E = SIM.economy(Object.assign({ goods: goods, inputs: {}, every: T.economy.every, window: T.economy.window, imports: T.economy.imports, cart: T.economy.cart,
    meal: { per: I.perMeal, foods: foods.slice() }, useShort: true }, rules), { settlement: id });
  places.forEach(function (P) {
    if (P.kind === 'warehouse') { SIM.store(P.id, { kind: 'warehouse' }); return; }
    var Pr = HT.producers[P.kind]; if (!Pr || !P.activities.WORK) return;
    SIM.recipe(P.id, { out: Pr.out.slice(), rate: Pr.rate, cap: Pr.cap }); Pr.out.forEach(function (g) { makes[g] = (makes[g] || 0) + 1; });
  });
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
    census: { pop: C.pop, workers: C.workers }, kinds: kinds, makes: goodsOut, foods: foods, minutes: mins, km: Math.round(bd / 100) / 10, out: Ro.id, 'in': Ri.id, landing: Wp.id, warehouse: W0.id, populate: pop };
};
/* a snapshot of the villages' books */
ISLE.simHamletBooks = function () {
  var S = ISLE.SIM, H = S && S.hamlets, out = { minute: SIM.minute(), villages: {}, towns: {} }; if (!H) return out;
  var I = SIM.ITEMS;
  H.villages.forEach(function (X) {
    var E = SIM.econ(X.id), B = (I.statsBy || {})[X.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, B.meals || {});
    var R1 = SIM.tradeReport(X.out), R2 = SIM.tradeReport(X['in']), stock = function (g) { var n = 0; E.warehouses.concat(E.sites).forEach(function (P) { n += P.stock[g] || 0; }); return n; };
    var rows = {}; Object.keys(E.goods).forEach(function (g) { rows[g] = { made: E.made[g] || 0, used: E.used[g] || 0, imported: E.imported[g] || 0, exported: E.exported[g] || 0,
      short: E.short[g] || 0, stock: stock(g) + SIM.all('place').reduce(function (n, P) { return n + (P.settlement === X.id && P.store ? P.store[g] || 0 : 0); }, 0) }; });
    out.villages[X.id] = { parent: X.parent, people: X.people, workers: X.workers, posts: X.posts, makes: X.makes, foods: X.foods, meals: M, goods: rows,
      shipped: (R1.shipped[X.id + '>' + X.parent]) || {}, landed: (R1.landed[X.id + '>' + X.parent]) || {}, fed: (R2.landed[X.parent + '>' + X.id]) || {},
      atSea: R1.carriers.concat(R2.carriers).reduce(function (n, C) { C.cargo.forEach(function (c) { n[c.good] = (n[c.good] || 0) + c.n; }); return n; }, {}), level: SIM.levelOf(X.id) };
  });
  S.order.forEach(function (s) { var E = SIM.econ(s); out.towns[s] = { imported: Object.assign({}, E.imported), made: Object.assign({}, E.made), used: Object.assign({}, E.used) }; });
  return out;
};
/* the checks over two snapshots (a at the start, b at the end of a run) */
ISLE.hamletChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'the hamlets: ' + name, ok: !!pass, detail: detail }); };
  var ids = Object.keys(b.villages), H = ISLE.SIM.hamlets;
  ok('four villages declared, each a settlement of its town, at the abstract level', ids.length === 4 && ids.every(function (id) { return b.villages[id].level === 'abstract' && SIM.R.settlement[id].parent === b.villages[id].parent; }),
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
  return res;
};
