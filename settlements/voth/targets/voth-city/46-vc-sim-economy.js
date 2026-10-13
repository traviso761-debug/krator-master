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
       (and what the sites hold) lasts under `imports.days`.
     - THE CARRIERS (`carriers`, VC.simCarriers; session 2): the road's caravans (a beetle, its driver and two guards a
       unit) come in by the strider ports on the highways, unload at the caravanserai and lodge there, then leave the
       way they came; the river's barges (six bargemen and two guards) come down from the river's upstream end to the
       river quay nearest it, unload and go; the sea's ships (ten sailors and four marines) come in from the north edge
       to the harbour pier nearest it. The lot lands in that place's store and the carts take it on; leaving, each buys
       the good the city has most days of (core: exports). A route whose port or way cannot be found falls back to the
       timer (the report says why).
     - THE SHIPWRIGHTS (session 2) build boats from wood; a kayak is bought from their stock.
   VC.simEconomyReport is the report's and the panel's. */
VC.simEconomy = function () {
  if (typeof SIM === 'undefined' || !SIM.economy || !TUNE.sim.economy || !SIM.ITEMS) return null;
  var T = TUNE.sim.economy, I = SIM.ITEMS, t0 = Date.now(), u = function (k, a, b) { return KRAND.unit(KRAND.hash(6161, k, a, b || 0)); };
  var foods = I.foods.slice(), ports = SIM.all('port'), routes = {};
  Object.keys(T.routes).forEach(function (r) { var R = T.routes[r], P = ports.filter(function (p) { return p.layer === R.layer; })[0]; routes[r] = { minutes: R.minutes, port: P ? P.id : null }; });
  SIM.economy({ goods: T.goods, inputs: T.inputs, every: T.every, cart: T.cart, imports: T.imports, routes: routes, window: T.window, exports: T.exports, meal: { per: I.perMeal, foods: foods } });
  /* the items' goods */
  Object.keys(I.kinds).forEach(function (k) { var K = I.kinds[k], g = T.itemGood[k] !== undefined ? T.itemGood[k] : T.catGood[K.cat];
    if (g && T.goods[g]) { K.good = g; K.per = T.per[k] != null ? T.per[k] : T.per[K.cat] != null ? T.per[K.cat] : 1; } });
  /* the warehouses and the producers */
  var by = { warehouse: 0 }, lotKey = function (P) { var U = P.unit != null ? VC.IX.units[P.unit] : null, L = U && U.lot >= 0 ? PLAN.lots[U.lot] : null; return L ? L.key : null; };
  SIM.all('place').forEach(function (P, i) {
    if (T.warehouses.indexOf(P.kind) >= 0) { SIM.store(P.id, { kind: 'warehouse' }); by.warehouse++; return; }
    if (!P.activities || !P.activities.WORK) return;
    var key = lotKey(P), R = T.producers.filter(function (r) { return r.kind ? r.kind === P.kind : r.lot === key; })[0]; if (!R) return;
    var out = R.out || []; if (R.one) { var wt = R.weights || R.out.map(function () { return 1; }), tot = wt.reduce(function (s, w) { return s + w; }, 0), x = u(i, 1) * tot, j = 0;
      while (j < wt.length - 1 && x >= wt[j]) { x -= wt[j]; j++; } out = [R.out[j]]; }   /* one crop a field, by its hash and the crops' weights */
    SIM.recipe(P.id, { out: out, rate: R.rate || 0, cap: R.cap, herd: R.herd || null }); var nm = R.kind || R.lot; by[nm] = (by[nm] || 0) + 1;
  });
  /* the opening stock: `startDays` of each food at the population's use, `startLots` of the rest, dealt round the warehouses */
  var SF = T.startFood || {}, staples = foods.filter(function (f) { return SF[f] == null; });   /* the new foods (milk, cheese, pork, fowl) open with their own few days */
  var E = SIM.ECON, W = E.warehouses, pop = SIM.all('actor').filter(function (a) { return !a.animal; }).length, perFood = pop * I.meals * I.perMeal / Math.max(1, staples.length);
  if (W.length) Object.keys(T.goods).forEach(function (g) { var n = Math.round(SF[g] != null ? SF[g] : foods.indexOf(g) >= 0 || T.inputs.bread && T.inputs.bread[g] ? perFood * T.startDays : (T.startLots[g] || 0));
    W.forEach(function (P, j) { P.stock[g] = Math.floor(n / W.length) + (j < n % W.length ? 1 : 0); }); });
  /* the carts */
  if (!SIM.R.activity.HAUL) SIM.activity({ id: 'HAUL' });
  if (!SIM.R.role.cart) SIM.role({ id: 'cart', org: 'citizens', name: 'carter', sched: [[0, 'HAUL']], speed: SIM.SPEED.cart });
  for (var c = 0; c < T.carts && W.length; c++) {
    var H = W[c % W.length], a = SIM.actor({ id: 'cart.' + c, role: 'cart', home: H.id, cls: 'cart', job: 'carters' });
    a.pos = { x: H.door.x, y: H.door.y || 0, z: H.door.z }; a.minW = T.cart.minW; SIM.cart(a);
  }
  var CR = VC.simCarriers(T);
  VC.SIMECON = { producers: by, warehouses: W.length, carts: E.carts.length, routes: routes, carriers: CR.carriers, noCarrier: CR.why, ms: Date.now() - t0 };
  return VC.SIMECON;
};

/* the carriers: each route's ports (the strider ports coming in on the highways; a water port at the north edge for
   the sea; one at the river's upstream end, the end of VOTH.RIVER farther from the harbour, for the river), the place
   it unloads at (the caravanserai; the river quay or harbour pier nearest the port), its crews' roles; checked by a
   route on its layer from the first port to the place */
VC.simCarriers = function (T) {
  var C = T.carriers || {}, E = SIM.ECON, out = {}, why = {}, d2 = function (P, q) { return Math.hypot(P.x - q.x, P.z - q.z); };
  if (!SIM.R.org.carriers) SIM.org({ id: 'carriers', faction: 'voth', resident: false });
  var all = SIM.all('place'), kind = function (k) { return all.filter(function (P) { return P.kind === k; }); }, piers = kind('pier'), quays = kind('quay');
  var cv = all.filter(function (P) { var U = P.unit != null ? VC.IX.units[P.unit] : null, L = U && U.lot >= 0 ? PLAN.lots[U.lot] : null; return L && L.role === 'caravanserai'; })[0];
  Object.keys(C).forEach(function (r) {
    var c = C[r], ports = [], Ed = TUNE.portEdge;
    if (c.ports === 'strider') ports = SIM.all('port').filter(function (p) { return p.layer === 'strider' && /:in$/.test(p.id); }).map(function (p) { return p.id; });
    else if (c.ports === 'sea' && piers.length) { var P = VC.edgePort('sea:' + r, { x: piers[0].x, z: piers[0].z }, c.side, 'water'); if (P) ports = [P.id]; }
    else if (c.ports === 'river' && VOTH.RIVER && VOTH.RIVER.length > 1) {
      var R = VOTH.RIVER, hb = piers[0] || { x: 0, z: 0 }, a0 = R[0], a1 = R[R.length - 1], up = Math.hypot(a0[0] - hb.x, a0[1] - hb.z) > Math.hypot(a1[0] - hb.x, a1[1] - hb.z) ? a0 : a1;
      SIM.port({ id: 'river:' + r, x: Math.max(-Ed, Math.min(Ed, up[0])), z: Math.max(-Ed, Math.min(Ed, up[1])), layer: 'water', kind: 'water' }); ports = ['river:' + r];
    }
    var first = ports.length ? SIM.R.port[ports[0]] : null;
    var at = c.at === 'caravanserai' ? cv : (c.at === 'quay' ? quays : piers).slice().sort(function (p, q) { return first ? d2(p, first) - d2(q, first) || (p.id < q.id ? -1 : 1) : 0; })[0];
    if (!at || !first) { why[r] = !at ? 'no ' + c.at : 'no port'; return; }
    var rt = SIM.nav.route(c.layer, { x: first.x, y: 0, z: first.z }, { x: at.door.x, y: 0, z: at.door.z });
    if (!rt) { why[r] = 'no ' + c.layer + ' way from ' + first.id + ' to ' + at.id; return; }
    c.unit.forEach(function (U) { if (!SIM.R.role[U.role]) SIM.role({ id: U.role, org: 'carriers', name: U.role, sched: [[0, c.activity]] }); });
    if (!SIM.R.activity[c.activity]) SIM.activity({ id: c.activity });
    SIM.store(at.id, { kind: 'site' });
    E.carriers[r] = { kind: c.kind, org: 'carriers', from: ports, unit: c.unit, size: c.size, cap: c.cap, layer: c.layer, mode: c.mode, speed: c.speed, beasts: c.beasts || 0, mount: c.mount || null,
                      at: at.id, activity: c.activity, mins: c.mins };
    out[r] = { kind: c.kind, at: at.id, ports: ports, km: Math.round(rt.len / 100) / 10 };
  });
  return { carriers: out, why: why };
};

VC.simEconomyReport = function () {
  var R = typeof SIM !== 'undefined' && SIM.ECON ? SIM.economyReport() : null; if (!R) return null;
  R.setup = VC.SIMECON; R.sites = R.sites.slice(0, 12);
  var I = SIM.ITEMS; if (I) { R.outOf = Object.assign({}, I.stats.outOf); R.mealsOut = I.stats.meals.out; }
  return R;
};
