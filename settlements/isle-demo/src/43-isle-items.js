/* ============================== 7d. THE FOODS, THE SHOPS AND THE HOUSEHOLDS (P7b) ============================== */
/* [G data] The items (core/simulation 77-sim-6-items.js), for now the food alone: each food of ISLE.TUNE.sim.items is
   an item kind and a good of the economy (44), so a household's purchase draws on its town's warehouses.
     ISLE.simItemsInit()        once a page: the kinds (the foods and the meal bought out), the free hours errands run
                                in, the meal's size, the household stores' low mark and the days a purchase buys
     ISLE.simHouseholds(TS, places, foods)  a town's shops and homes, with the foods the town makes (44):
       - a place whose kind's opts name a `shop` sells that list, of the town's foods (the market every food, a chandler's
         or a trader's the staples, the butcher pork and milk, the bakehouse bread, the fish dock fish; the kava house,
         the guest house and the Vernacular's tavern a meal): a food nobody makes there is not on its shelves;
       - every home knows its people; the barracks eat at their mess (the garrison's kitchen draws on the warehouses);
         every other home keeps a food store, opened with a hashed `storeDays` of meals in two or three of the town's foods.
   No clothes, tools or wear yet: the census's crafts make goods the town stores (44); what people keep is a later pass. */
ISLE.simItemsInit = function () {
  if (SIM.ITEMS) return SIM.ITEMS;
  var T = ISLE.TUNE.sim, I = T.items, kinds = {};
  I.foods.forEach(function (f) { kinds[f] = { cat: 'food', food: true }; });
  kinds.meal = { cat: 'food' };
  return SIM.items({ kinds: kinds, free: T.sched.free, secPerMinute: T.clock.secPerMinute, mins: I.mins, cool: I.cool, low: I.low, days: I.days,
    meals: I.meals, perMeal: I.perMeal, eatOut: I.eatOut, hurt: 0 });
};
ISLE.simHouseholds = function (TS, places, foods) {
  var T = ISLE.TUNE.sim, I = T.items, s = TS.id, out = { shops: {}, sellers: 0, stores: 0, messes: 0, people: 0, servings: 0, foods: foods.slice() };
  var ours = function (L) { return L.filter(function (k) { return k === 'meal' || foods.indexOf(k) >= 0; }); };   /* what the town makes */
  var u = function (a, b, c) { return KRAND.unit(KRAND.hash(T.seed, 53, a, b, c || 0)); };
  places.forEach(function (P) {
    if (!P.shopAs) return; var L = I.shops[P.shopAs] ? ours(I.shops[P.shopAs]) : []; if (!L.length) return;
    SIM.shop(P.id, L); out.shops[P.shopAs] = (out.shops[P.shopAs] || 0) + 1; out.sellers++;
  });
  var people = {};
  SIM.all('actor').forEach(function (a) { if (a.home && !a.driven) people[a.home] = (people[a.home] || 0) + 1; });
  places.forEach(function (P, i) {
    if (!people[P.id]) return; P.people = people[P.id]; out.people += P.people;
    if (P.mess) { out.messes++; return; }
    var days = I.storeDays[0] + (I.storeDays[1] - I.storeDays[0]) * u(i, 1), serv = Math.round(P.people * I.meals * I.perMeal * days), k = 2 + Math.floor(u(i, 2) * 2);
    P.store = {};
    for (var j = 0; j < k; j++) { var f = foods[Math.floor(u(i, 3, j) * foods.length) % foods.length]; P.store[f] = (P.store[f] || 0) + Math.round(serv / k); }
    for (var f2 in P.store) out.servings += P.store[f2];
    out.stores++;
  });
  if (SIM.placesChanged) SIM.placesChanged();
  return out;
};
