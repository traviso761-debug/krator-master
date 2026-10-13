/* ============================== 5m. THE CITIZENS' THINGS (phase D) ============================== */
/* [G data] Items, inventory, equipment, shopping (SIM-ROADMAP.md 1.5, 2.5; core/simulation 77-sim-6-items.js), tuned by
   TUNE.sim.items. Stock is abstract (the owner's Q7): every purchase succeeds and is logged, so what shows first is
   which shops are missing or far, not which goods.
     - THE SHOPS: a building sells by its kit model (`shops`: the alchemist poultices, the clothier and the weaver
       clothes, the smithy tools, arms and armour, the provisioner and the markets' stalls food, the trader luxuries...),
       and takes `shopBuy` buyers at once; a tavern serves a meal (core: a meal bought).
     - THE HOUSEHOLDS: every home knows its people (`people`); one with no kitchen of its own (a canton's rooms, a
       dormitory, the slaves' quarters, a barracks) eats at its mess (`mess`); every other keeps a food store, started
       at a hashed `foodDays` of meals.
     - THE CITIZENS: the slaves are `issued` (the owner's Q5: no market trips; their keepers replace what wears out
       and own their tools); everyone keeps the clothes sets of their class (`sets`: the worn set at a hashed wear, the rest at home), a hat or
       hood for some (`hats`), a dress or trousers (`dress`); their work's tool (owned, at a hashed wear) or the rack's
       (`tools`); arms and armour if their work is `armed` (one of each kept), a sword for some of the rich
       (`richSword`); a waterskin if they labour, a kayak if they grow the chinampas.
   VC.simItemsReport is the report's: what is kept against what is wanted, the purchases by item and by kind of shop,
   the trips (world minutes), the errands that found no seller, the items no shop sells, the tools broken at work and
   replaced in work time, the hurt and the poultices, the meals (at home, out, at a mess), the household stores; the
   chinampa growers' kayaks (VC.simKayaks). */
VC.simItems = function () {
  if (typeof SIM === 'undefined' || !SIM.items || !TUNE.sim.items) return null;
  var T = TUNE.sim.items, NE = TUNE.sim.needs, t0 = Date.now();
  SIM.items({ kinds: T.kinds, free: NE ? NE.free : ['SOCIALIZE', 'RELAX', 'IDLE'], secPerMinute: VC.simSecPerMin(), mins: T.mins, cool: T.cool, meal: T.meal, lack: T.lack,
              hurt: T.hurt, heal: T.heal, low: T.low, days: T.days, treat: T.treat, eatOut: T.eatOut });
  var u = function (k, a, b) { return KRAND.unit(KRAND.hash(5151, k, a, b || 0)); };
  /* ---- the shops */
  var shops = {}, n = 0;
  SIM.all('place').forEach(function (P) {
    var items = null, key = null;
    if (P.unit != null) { var U = VC.IX.units[P.unit], L = U && U.lot >= 0 ? PLAN.lots[U.lot] : null; if (L && T.shops[L.key]) { items = T.shops[L.key]; key = L.key; } }
    if (!items && P.kind === 'market') { items = T.market; key = 'market'; }
    if (!items && P.kind === 'tavern' && P.activities.EAT && P.access !== 'private') { items = ['meal']; key = 'tavern'; }   /* a meal out: the taverns and the caravanserai */
    if (!items) return;
    SIM.shop(P.id, items); P.activities.BUY = Math.max(P.activities.BUY || 0, T.shopBuy); P.shopKey = key; shops[key] = (shops[key] || 0) + 1; n++;
  });
  /* ---- the households */
  var people = {}; SIM.all('actor').forEach(function (a) { if (a.home) people[a.home] = (people[a.home] || 0) + 1; });
  var foods = Object.keys(T.kinds).filter(function (k) { return T.kinds[k].food; }), stores = 0, messes = 0;
  Object.keys(people).forEach(function (id, i) {
    var P = SIM.R.place[id]; if (!P) return; P.people = people[id];
    if (P.mess) { messes++; return; }
    var days = T.foodDays[0] + (T.foodDays[1] - T.foodDays[0]) * u(i, 1), serv = Math.round(P.people * 2 * 2 * days), k = 2 + Math.floor(u(i, 2) * 2);
    P.store = {}; for (var j = 0; j < k; j++) { var f = foods[Math.floor(u(i, 3, j) * foods.length) % foods.length]; P.store[f] = (P.store[f] || 0) + Math.round(serv / k); }
    stores++;
  });
  /* ---- the citizens */
  var armed = {}; T.armed.forEach(function (j) { armed[j] = 1; });
  var gear = { waterskin: 0, kayak: 0, sword: 0, armed: 0, tools: 0, rack: 0 };
  SIM.all('actor').forEach(function (a, i) {
    var k = a.k, sets = T.sets[a.cls] != null ? T.sets[a.cls] : T.sets.other, legs = u(k, 4) < T.dress ? 'dress' : 'trousers';
    a.sets = sets; a.wears = ['shirt', legs, 'shoes'];
    if (u(k, 5) < T.hats) a.wears.push(u(k, 6) < 0.5 ? 'hat' : 'hood');
    a.wears.forEach(function (it, j) { SIM.equip(a, it, u(k, 7, j) * 0.999); if (sets > 1) SIM.give(a, it, sets - 1); });
    if (armed[a.job]) {
      a.keep = { cuirass: 1, greaves: 1, boots: 1, helm: 1 };
      ['cuirass', 'greaves', 'boots', 'helm', 'sword', 'shield'].forEach(function (it, j) { SIM.equip(a, it, u(k, 8, j) * 0.999); });   /* boots on the feet, the shoes home */
      a.wears = a.wears.concat(['cuirass', 'greaves', 'boots', 'helm']); gear.armed++;
    } else if (a.cls === 'rich' && u(k, 9) < T.richSword) { SIM.give(a, 'sword', 1); gear.sword++; }
    if (a.cls === 'slave') a.issued = true;   /* the owner's Q5: no market trips; their keepers clothe them and own their tools */
    var tool = a.job ? (a.issued ? 'rack' : T.tools[a.job]) : null;
    if (tool === 'rack') { a.toolRack = true; gear.rack++; }
    else if (tool) { a.tool = { k: tool, w: u(k, 10) * 0.999 }; gear.tools++; }
    var R = SIM.R.role[a.role]; if (R && R.needs && R.needs.labour > 0) { SIM.give(a, 'waterskin', 1); gear.waterskin++; }
    if (a.job === 'chinampa growers') { SIM.give(a, 'kayak', 1); gear.kayak++; }
  });
  var K = VC.simKayaks();
  if (SIM.placesChanged) SIM.placesChanged();   /* the shops' BUY */
  VC.SIMITEMS = { shops: shops, shopPlaces: n, stores: stores, messes: messes, gear: gear, kayaks: K, ms: Date.now() - t0 };
  return VC.SIMITEMS;
};

/* the kayaks (the brief, 1.5: "chinampa workers mostly live on the chinampas and carry a kayak, used automatically on
   water"): the stilt huts and the chinampa work sites stand on the beds, off the pedestrian layer. Each such place is on
   the 'kayak' layer (a straight line over the water and the beds) and reached through a landing (a place at the
   pedestrian node nearest it); everyone who lives or works on the beds keeps a kayak there (core/simulation: an actor's
   boat {dock, layer}, a place's via 'boat'): to town by kayak to the landing, then on foot; home the other way */
VC.simKayaks = function () {
  if (!SIM.nav.layers.kayak) SIM.nav.layer('kayak', { route: function (ax, az, bx, bz) { return { pts: [[ax, 0, az], [bx, 0, bz]] }; } });
  var far = TUNE.sim.nav.far, landing = {}, onBeds = {}, n = 0, P0 = VC.PED;
  SIM.all('place').forEach(function (P) {
    if ((P.kind !== 'chinampa hut' && P.kind !== 'chinampa') || P.navNode == null || !(P.navOff > far)) return;
    var nd = P0.nodes[P.navNode], id = 'landing.' + P.navNode;
    if (!landing[id]) { SIM.place({ id: id, kind: 'landing', name: 'Kayak landing', x: nd.x, z: nd.z, y: nd.y || 0, activities: {}, layer: 'pedestrian', tags: ['chinampa'] }); landing[id] = SIM.R.place[id]; landing[id].navNode = P.navNode; landing[id].navOff = 0; }
    P.layer = 'kayak'; P.via = 'boat'; P.landing = id; onBeds[P.id] = 1; n++;
  });
  var people = 0;
  SIM.all('actor').forEach(function (a) {
    var H = onBeds[a.home] ? SIM.R.place[a.home] : null, W = a.work && onBeds[a.work] ? SIM.R.place[a.work] : null; if (!H && !W) return;
    a.boat = { dock: (H || W).landing, layer: 'kayak' }; if (H) a.inVehicle = 'boat';   /* at home on the beds: afloat */
    if (!SIM.owns(a, 'kayak')) SIM.give(a, 'kayak', 1); people++;
  });
  return { places: n, landings: Object.keys(landing).length, people: people };
};

VC.simItemsReport = function () {
  var I = typeof SIM !== 'undefined' && SIM.ITEMS; if (!I) return null;
  var S = I.stats, T = TUNE.sim.items, A = SIM.all('actor'), out = { setup: VC.SIMITEMS };
  /* what is kept against what is wanted, by class */
  var kept = {}; A.forEach(function (a) { var K = kept[a.cls] || (kept[a.cls] = { n: 0, want: 0, have: 0, short: 0, bare: 0 });
    K.n++; (a.wears || []).forEach(function (it) { var w = (a.keep && a.keep[it]) || a.sets || 1, h = SIM.owns(a, it); K.want += w; K.have += Math.min(w, h); if (h < w) K.short++; });
    if (a.eq && (!a.eq.torso || !a.eq.legs || !a.eq.feet)) K.bare++; });
  out.kept = kept;
  /* purchases by kind of shop */
  var byKey = {}; Object.keys(S.byShop).forEach(function (id) { var P = SIM.R.place[id], k = (P && P.shopKey) || (P ? P.kind : 'gone'), B = byKey[k] || (byKey[k] = {}); Object.keys(S.byShop[id]).forEach(function (it) { B[it] = (B[it] || 0) + S.byShop[id][it]; }); });
  out.byShopKind = byKey; out.bought = S.bought; out.errands = S.errands; out.done = S.done; out.failed = S.failed; out.noShop = S.noShop; out.worn = S.worn;
  out.trip = {}; Object.keys(S.trip).forEach(function (k) { var t = S.trip[k]; out.trip[k] = { n: t.n, mean: Math.round(t.mins / Math.max(1, t.n)), max: t.max }; });
  out.unsold = Object.keys(T.kinds).filter(function (k) { return !SIM.sellersOf(k).length; });
  out.tools = { broken: S.brokenAtWork, replacedAtWork: S.replacedAtWork, missingNow: A.filter(function (a) { return a.toolNeed; }).length,
                missingBy: A.reduce(function (o, a) { if (a.toolNeed) o[a.toolNeed] = (o[a.toolNeed] || 0) + 1; return o; }, {}) };
  out.hurt = { total: S.hurt, now: A.filter(function (a) { return a.hurt != null; }).length, poultices: S.poultice, healed: S.healed };
  out.meals = S.meals;
  var low = 0, homes = 0, days = 0; SIM.all('place').forEach(function (P) { if (!P.store || !P.people) return; homes++; var tot = 0; for (var f in P.store) tot += P.store[f]; var d = tot / (P.people * 4); days += d; if (d < T.low) low++; });
  out.stores = { homes: homes, low: low, meanDays: homes ? Math.round(days / homes * 10) / 10 : 0 };
  out.errandsNow = A.filter(function (a) { return a.errand; }).length;
  out.slotErrors = A.reduce(function (s, a) { return s + SIM.itemsCheck(a).length; }, 0);
  out.kayakNow = A.filter(function (a) { return a.task && a.task.legs && a.task.legs.some(function (L) { return L.layer === 'kayak'; }) && SIM.time() < a.task.arrive; }).length;
  out.emptyStores = SIM.all('place').filter(function (P) { if (!P.store || !P.people) return false; for (var f in P.store) if (P.store[f] > 0) return false; return true; }).length;
  return out;
};
