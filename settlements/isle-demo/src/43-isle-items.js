/* ============================== 7d. THE FOODS, THE SHOPS AND THE HOUSEHOLDS (P7b) ============================== */
/* [G data] The items (core/simulation 77-sim-6-items.js), for now the food alone: each food of ISLE.TUNE.sim.items is
   an item kind and a good of the economy (44), so a household's purchase draws on its town's warehouses.
     ISLE.simItemsInit()        once a page: the kinds (the foods and the meal bought out), the free hours errands run
                                in, the meal's size, the household stores' low mark and the days a purchase buys
     ISLE.simHouseholds(TS, places, foods)  a town's shops and homes, with the foods the town makes (44):
       - a place whose kind's opts name a `shop` sells that list, of the town's foods (the market, chandlers, traders,
         butchers, bakehouses and fish docks every food the town makes; the kava house, the guest house and the
         Vernacular's tavern a meal): a food nobody makes there is not on its shelves;
       - every home knows its people; the barracks eat at their mess (the garrison's kitchen draws on the warehouses);
         every other home keeps a food store, opened with a hashed `storeDays` of meals in two or three of the town's foods.
     ISLE.simHouseholds also dresses the town (2026-10-19): everyone wears a shirt, a wrap and sandals (two sets: one on,
     one at home), each wearing out in its days and bought again from a seller of it (the market, the shops, the weavers,
     the workshops), drawing the garments or the sandals from the town's warehouses; the soldiers keep a leather cuirass
     (the smithies). No tools yet. */
ISLE.simItemsInit = function () {
  if (SIM.ITEMS) return SIM.ITEMS;
  var T = ISLE.TUNE.sim, I = T.items, kinds = {};
  I.foods.forEach(function (f) { kinds[f] = { cat: 'food', food: true }; });
  kinds.meal = { cat: 'food' };
  Object.keys(I.worn || {}).forEach(function (k) { kinds[k] = Object.assign({ per: 1 }, I.worn[k]); });   /* the clothes and the armour */
  return SIM.items({ kinds: kinds, free: T.sched.free, secPerMinute: T.clock.secPerMinute, mins: I.mins, cool: I.cool, low: I.low, days: I.days,
    meals: I.meals, perMeal: I.perMeal, eatOut: I.eatOut, hurt: 0 });
};
ISLE.simHouseholds = function (TS, places, foods) {
  var T = ISLE.TUNE.sim, I = T.items, s = TS.id, out = { shops: {}, sellers: 0, stores: 0, messes: 0, people: 0, servings: 0, foods: foods.slice() };
  var ours = function (L) { return L.filter(function (k) { return k === 'meal' || foods.indexOf(k) >= 0; }); };   /* what the town makes */
  var u = function (a, b, c) { return KRAND.unit(KRAND.hash(T.seed, 53, a, b, c || 0)); };
  places.forEach(function (P) {
    var L = P.shopAs && I.shops[P.shopAs] ? ours(I.shops[P.shopAs]) : [], Wr = (I.wares || {})[P.kind] || []; L = L.concat(Wr); if (!L.length) return;
    SIM.shop(P.id, L); if (Wr.length) P.activities.BUY = Math.max(P.activities.BUY || 0, 2);   /* its wares sold at its door */
    var k = P.shopAs || P.kind; out.shops[k] = (out.shops[k] || 0) + 1; out.sellers++;
  });
  /* what everyone wears: the set of each worn kind on, the rest at home, at a hashed wear; the armed a cuirass besides */
  var armed = {}; (I.armed || []).forEach(function (j) { armed[TS.id + '.' + j] = 1; }); out.worn = 0;
  SIM.all('actor').forEach(function (a) {
    if (a.driven || SIM.settlementOf(a) !== s || !I.worn) return;
    a.sets = I.sets; a.wears = ['shirt', 'wrap', 'sandal'];
    a.wears.forEach(function (it, j) { SIM.equip(a, it, u(a.k, 7, j) * 0.999); if (I.sets > 1) SIM.give(a, it, I.sets - 1); });
    if (armed[a.role]) { a.keep = { cuirass: 1 }; SIM.equip(a, 'cuirass', u(a.k, 8) * 0.999); a.wears.push('cuirass'); }
    out.worn++;
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
