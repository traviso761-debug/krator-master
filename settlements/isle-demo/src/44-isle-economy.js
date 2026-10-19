/* ============================== 7e. EACH TOWN'S OWN ECONOMY (P7b) ============================== */
/* [G data] A town's economy on core/simulation (77-sim-6-economy.js, keyed: SIM.economy(config, {settlement})), tuned by
   ISLE.TUNE.sim.economy. Units are servings for food (a meal is the items' perMeal of them) and lots for the rest.
     - THE PRODUCERS: each farm parcel grows its own crop (PLAN.md 8c, the programme's farm: sweet potato, banana and
       coconut to eat; sugar cane and cotton for the mill and the weavers), the fish docks land fish, the pens raise
       pork, the bakehouses bake bread from sweet potato, the windmill crushes cane to sugar, the weavers make cloth from
       cotton, the potters pots; each at `rate` a worker-hour into its own store (`cap`). The smithies wait for ore (the
       iron mine is a hinterland village, core/hamlet: H5).
     - THE WAREHOUSES: the warehouses and the granaries are the town's store, opened with `startDays` of each food at
       the town's use (its people's meals) and `startLots` of the rest, dealt round them.
     - THE CARTS (`towns[town].carts`): driven actors on the walking layer, one at each warehouse in turn, their home
       that warehouse (so they are the town's: SIM.settlementOf).
     - No imports by route yet: the town lives on what it makes, and what it lacks comes by the canoe line (P7c,
       SIM.trade). Returns the setup: producers by kind and good, warehouses, carts. */
ISLE.simEconomy = function (TS, places) {
  var T = ISLE.TUNE.sim.economy, I = ISLE.TUNE.sim.items, s = TS.id, goods = {};
  T.goods.forEach(function (g) { goods[g] = {}; });
  var E = SIM.economy({ goods: goods, inputs: T.inputs, every: T.every, window: T.window, imports: T.imports, cart: T.cart, meal: { per: I.perMeal, foods: I.foods.slice() } }, { settlement: s });
  var out = { producers: {}, goods: {}, warehouses: 0, carts: 0 };
  places.forEach(function (P) {
    if (T.warehouses.indexOf(P.kind) >= 0) { SIM.store(P.id, { kind: 'warehouse' }); out.warehouses++; return; }
    var Pr = T.producers[P.kind]; if (!Pr || !P.activities.WORK) return;
    var g = Pr.out ? Pr.out : P.tags.crop && T.crops[P.tags.crop] ? [T.crops[P.tags.crop]] : null; if (!g) return;
    SIM.recipe(P.id, { out: g.slice(), rate: Pr.rate, cap: Pr.cap });
    out.producers[P.kind] = (out.producers[P.kind] || 0) + 1; g.forEach(function (x) { out.goods[x] = (out.goods[x] || 0) + 1; });
  });
  /* the opening stock */
  var W = E.warehouses, pop = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === s; }).length;
  var perFood = pop * I.meals * I.perMeal / I.foods.length;
  if (W.length) T.goods.forEach(function (g) {
    var n = Math.round(I.foods.indexOf(g) >= 0 ? perFood * T.startDays : (T.startLots[g] || 0));
    W.forEach(function (P, j) { P.stock[g] = Math.floor(n / W.length) + (j < n % W.length ? 1 : 0); });
  });
  /* the carts */
  if (!SIM.R.role.cart) SIM.role({ id: 'cart', org: s + '.folk', name: 'carter', sched: [[0, 'HAUL']], speed: SIM.SPEED.cart });
  for (var c = 0; c < TS.carts && W.length; c++) {
    var H = W[c % W.length], a = SIM.actor({ id: s + '.cart' + c, role: 'cart', org: s + '.folk', home: H.id, cls: 'cart', job: 'carters' });
    a.pos = { x: H.door.x, y: H.door.y || 0, z: H.door.z }; SIM.cart(a); out.carts++;
  }
  out.people = pop;
  return out;
};
