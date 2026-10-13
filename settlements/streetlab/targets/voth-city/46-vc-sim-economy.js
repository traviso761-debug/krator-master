/* ============================== 5n. PRODUCTION, STORES, CARTS, IMPORTS (phase E) ============================== */
/* [G data] The economy (SIM-ROADMAP.md 1.6, 2.6; core/simulation 77-sim-6-economy.js), tuned by TUNE.sim.economy.
   Units are servings for food (a meal is `perMeal` of them) and lots for the craft goods.
     - THE PRODUCERS (`producers`, by place kind or by the kit model of the building): the fields grow one crop each (a
       hash of the field, by the crops' `weights`: wheat, corn or peppers), the chinampas corn and peppers, the mushroom farms mushrooms, the
       fishers' docks fish, the beetle ranches eggs, the bakeries bread from wheat, the weavers cloth, the tanneries
       leather, the mines metal; each at `rate` a worker-hour into its own store (`cap`).
     - THE WAREHOUSES (`warehouses`: the warehouse buildings and the Granary deck's granaries) are the settlement's
       store, started with `startDays` of each food at the population's use (and `startLots` of each craft good).
     - THE ITEMS draw on it (`itemGood`, `catGood`, `per`): clothes cloth, shoes leather, tools and arms metal, poultices
       herbs, luxuries the imported luxuries; a household's food, a meal out or at a mess, the foods themselves.
     - THE CARTS (`carts`, 50): driven actors on the pedestrian layer (`minW`: the streets a cart fits), started at
       the warehouses in turn.
     - THE IMPORTS (`goods[g].import`): a good with no producer, or too little, is sent for by its route when its stock
       lasts under `imports.days`; the route's port is the map-edge entry of its layer (the ships, barges and caravans
       that carry them are the next session's).
   VC.simEconomyReport is the report's and the panel's. */
VC.simEconomy = function () {
  if (typeof SIM === 'undefined' || !SIM.economy || !TUNE.sim.economy || !SIM.ITEMS) return null;
  var T = TUNE.sim.economy, I = SIM.ITEMS, t0 = Date.now(), u = function (k, a, b) { return KRAND.unit(KRAND.hash(6161, k, a, b || 0)); };
  var foods = I.foods.slice(), ports = SIM.all('port'), routes = {};
  Object.keys(T.routes).forEach(function (r) { var R = T.routes[r], P = ports.filter(function (p) { return p.layer === R.layer; })[0]; routes[r] = { minutes: R.minutes, port: P ? P.id : null }; });
  SIM.economy({ goods: T.goods, inputs: T.inputs, every: T.every, cart: T.cart, imports: T.imports, routes: routes, window: T.window, meal: { per: I.perMeal, foods: foods } });
  /* the items' goods */
  Object.keys(I.kinds).forEach(function (k) { var K = I.kinds[k], g = T.itemGood[k] !== undefined ? T.itemGood[k] : T.catGood[K.cat];
    if (g && T.goods[g]) { K.good = g; K.per = T.per[k] != null ? T.per[k] : T.per[K.cat] != null ? T.per[K.cat] : 1; } });
  /* the warehouses and the producers */
  var by = { warehouse: 0 }, lotKey = function (P) { var U = P.unit != null ? VC.IX.units[P.unit] : null, L = U && U.lot >= 0 ? PLAN.lots[U.lot] : null; return L ? L.key : null; };
  SIM.all('place').forEach(function (P, i) {
    if (T.warehouses.indexOf(P.kind) >= 0) { SIM.store(P.id, { kind: 'warehouse' }); by.warehouse++; return; }
    if (!P.activities || !P.activities.WORK) return;
    var key = lotKey(P), R = T.producers.filter(function (r) { return r.kind ? r.kind === P.kind : r.lot === key; })[0]; if (!R) return;
    var out = R.out; if (R.one) { var wt = R.weights || R.out.map(function () { return 1; }), tot = wt.reduce(function (s, w) { return s + w; }, 0), x = u(i, 1) * tot, j = 0;
      while (j < wt.length - 1 && x >= wt[j]) { x -= wt[j]; j++; } out = [R.out[j]]; }   /* one crop a field, by its hash and the crops' weights */
    SIM.recipe(P.id, { out: out, rate: R.rate, cap: R.cap }); var nm = R.kind || R.lot; by[nm] = (by[nm] || 0) + 1;
  });
  /* the opening stock: `startDays` of each food at the population's use, `startLots` of the rest, dealt round the warehouses */
  var E = SIM.ECON, W = E.warehouses, pop = SIM.all('actor').length, perFood = pop * I.meals * I.perMeal / Math.max(1, foods.length);
  if (W.length) Object.keys(T.goods).forEach(function (g) { var n = Math.round(foods.indexOf(g) >= 0 || T.inputs.bread && T.inputs.bread[g] ? perFood * T.startDays : (T.startLots[g] || 0));
    W.forEach(function (P, j) { P.stock[g] = Math.floor(n / W.length) + (j < n % W.length ? 1 : 0); }); });
  /* the carts */
  if (!SIM.R.activity.HAUL) SIM.activity({ id: 'HAUL' });
  if (!SIM.R.role.cart) SIM.role({ id: 'cart', org: 'citizens', name: 'carter', sched: [[0, 'HAUL']], speed: SIM.SPEED.cart });
  for (var c = 0; c < T.carts && W.length; c++) {
    var H = W[c % W.length], a = SIM.actor({ id: 'cart.' + c, role: 'cart', home: H.id, cls: 'cart', job: 'carters' });
    a.pos = { x: H.door.x, y: H.door.y || 0, z: H.door.z }; a.minW = T.cart.minW; SIM.cart(a);
  }
  VC.SIMECON = { producers: by, warehouses: W.length, carts: E.carts.length, routes: routes, ms: Date.now() - t0 };
  return VC.SIMECON;
};

VC.simEconomyReport = function () {
  var R = typeof SIM !== 'undefined' && SIM.ECON ? SIM.economyReport() : null; if (!R) return null;
  R.setup = VC.SIMECON; R.sites = R.sites.slice(0, 12);
  var I = SIM.ITEMS; if (I) { R.outOf = Object.assign({}, I.stats.outOf); R.mealsOut = I.stats.meals.out; }
  return R;
};
