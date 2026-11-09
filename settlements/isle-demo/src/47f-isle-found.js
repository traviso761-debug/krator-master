/* ============================== 7h7. FOUNDING: A FARMING CAMP THAT BECOMES A HAMLET (PLAN.md section 11, step 5; 2026-11-09) ============================== */
/* [G data] The owner (2026-11-04: "work crews at deposits, housing sought or left, hamlets that grow"; 2026-11-09: "highways
   are buildable when a farming camp converts to a farming hamlet"). A town whose refugee camp holds `households` households
   that have waited `waitDays` for a house sends them out as a FARMING CAMP: a settlement of the town's (kind 'camp') on
   farmland the page finds beyond the town's villages (ISLE.hooks.farmSite), its people in tents (a camp place, a mess fed
   by its store), its grown-ups working the land (a farm place with a farmland site, the town's first staple), its crop
   carted to the town and its food back at the detour rate (the roads of 47h). After `days` the camp CONVERTS: the page lays
   a farming village on the camp's site (ISLE.hooks.layVillage: core/hamlet's village and its farmland, as 48 lays them),
   the sim declares it as the town's hamlet with the campers as its first people (47h ISLE.simHamlet `people`: the
   founders housed and at posts first, settlers dealt for the rest), named from the Sikau list, and its HIGHWAY becomes a
   PROJECT: the page routes it live (ISLE.hooks.routeRoad: the world's ROADS.route from the village's lane end to the
   nearest point of the baked network) and the hamlet's own hands build it on core's building (a `road:<id>` kind of
   `hoursPerKm` worker-hours and `timberPerKm` timber a kilometre, 47b); built, the page adds it to the world
   (ISLE.hooks.roadBuilt) and the hamlet's carts take it (its routes retimed from the detour rate to the road).
   The page's hooks (ISLE.hooks): farmSite(townName, n) -> {x, z, ground?, avoid?} | null; layVillage(spec) -> {village,
   resource, error?}; routeRoad(village, spec) -> {pts, length_m, townKm} | null; roadBuilt(road, village report); founded(village report, camp, layout) once the hamlet is declared.
   A page without the hooks founds nothing (the city page).
     ISLE.simFound()          after the refugees (40): the state, the hourly step
     ISLE.foundBooks()        a snapshot: the camps (people, fed, made, converted), the founded hamlets, the road projects
     ISLE.foundChecks(a, b)   over two snapshots, each with a negative in tests/test-isle-found.js */
ISLE.hooks = ISLE.hooks || {};   /* the page's hooks (above); none on a page that founds nothing */
ISLE.simFound = function () {
  var S = ISLE.SIM, F = ISLE.TUNE.sim.found; if (!F || !S.rf) return null;
  S.found = { camps: [], n: {}, noSite: {}, log: [] };
  if (SIM.stepHooks.indexOf(ISLE.foundStep) < 0) SIM.stepHooks.push(ISLE.foundStep);
  return S.found;
};
ISLE.foundStep = function (minute) {
  var S = ISLE.SIM, F = ISLE.TUNE.sim.found; if (!S.found || minute % F.every) return;
  S.order.forEach(function (s) {
    if ((S.found.n[s] || 0) >= F.maxPerTown) return;
    if (S.found.noSite[s] != null && minute - S.found.noSite[s] < 1440) return;
    var camp = S.rf.camps[s]; if (!camp) return;
    /* the households in the camp that have waited long enough, longest first */
    var byHh = {}; ISLE.refugeesAt(s).forEach(function (a) { if (a.home !== camp || !a.refugee) return; var h = byHh[a.refugee.hh] || (byHh[a.refugee.hh] = { hh: a.refugee.hh, landed: a.refugee.landed, people: [] }); h.people.push(a); });
    var hhs = Object.keys(byHh).map(function (k) { return byHh[k]; }).filter(function (h) { return minute - h.landed >= F.waitDays * 1440; })
      .sort(function (p, q) { return p.landed - q.landed || (p.hh < q.hh ? -1 : 1); });
    if (hhs.length < F.households) return;
    ISLE.foundCamp(s, hhs.slice(0, F.households), minute);
  });
  S.found.camps.forEach(function (C) { if (!C.converted && minute >= C.founded + F.days * 1440 && (C.retryAt == null || minute >= C.retryAt)) ISLE.foundConvert(C, minute); });
};
/* the town's first staple row (15 hamlets.farming.crops) as the camp's crop */
ISLE.foundCrop = function (s) {
  var T = ISLE.TUNE.sim, rows = (T.hamlets.farming.crops[s] || {}).staples || [], best = null;
  rows.forEach(function (C) { if (!best || (C.w || 1) > (best.w || 1)) best = C; });
  return best ? { row: best, good: T.economy.crops[best.crop], rows: rows } : null;
};
ISLE.foundCamp = function (s, hhs, minute) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, F = T.found, HT = T.hamlets, I = T.items, TSp = null;
  Object.keys(T.towns).forEach(function (k) { if (T.towns[k].id === s) TSp = T.towns[k]; });
  var n = (S.found.n[s] || 0) + 1, site = ISLE.hooks.farmSite ? ISLE.hooks.farmSite(TSp.name, n, S) : null;
  if (!site) { S.found.noSite[s] = minute; S.found.log.push({ op: 'no site', town: s, minute: minute }); return null; }
  var cid = s + '.farmcamp' + n, crop = ISLE.foundCrop(s); if (!crop) return null;
  var people = []; hhs.forEach(function (h) { h.people.forEach(function (a) { people.push(a); }); });
  var grown = people.filter(function (a) { return a.ageBand !== 'child'; }), hands = Math.max(1, grown.length);
  SIM.settlement({ id: cid, faction: TSp.faction, name: 'Farming camp ' + n + ' of ' + TSp.name, parent: s, kind: 'camp' });
  SIM.org({ id: cid + '.folk', faction: TSp.faction, name: 'The farming camp\'s people' });
  var y = site.y == null ? 0 : site.y, np = people.length;
  var camp = SIM.place({ id: cid + '.camp', name: 'the farming camp', kind: 'camp', x: site.x, y: y, z: site.z, door: { x: site.x, y: y, z: site.z },
    activities: { SLEEP: np, EAT: np, REST: np, IDLE: np, HOUSEWORK: np, SOCIALIZE: Math.ceil(np / 3) }, indoor: {}, wander: 12, settlement: cid, tags: { key: 'farming camp', role: 'camp', hamlet: cid } });
  camp.mess = true; camp.cls = 'refugee'; camp.people = np;
  var store = SIM.place({ id: cid + '.store', name: 'the camp\'s store', kind: 'warehouse', x: site.x + 20, y: y, z: site.z, door: { x: site.x + 20, y: y, z: site.z }, activities: { WORK: 1 }, indoor: true, settlement: cid, tags: { key: 'tent store', role: 'warehouse', hamlet: cid } });
  var farm = SIM.place({ id: cid + '.farm', name: 'the camp\'s fields', kind: 'farm', x: site.x + 60, y: y, z: site.z + 40, door: { x: site.x + 60, y: y, z: site.z + 40 }, activities: { WORK: hands }, indoor: {}, wander: 15, settlement: cid, tags: { key: 'field:' + crop.row.crop, role: 'works', hamlet: cid, crop: crop.row.crop } });
  /* the roles: the grown-ups work the fields, the children keep the camp */
  var prefers = { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' } };
  SIM.role({ id: cid + '.worker', name: 'camp hand', org: cid + '.folk', settlement: cid, count: 0, homes: ['camp'], prefers: prefers, work: { kinds: ['farm', 'warehouse'], act: 'WORK', near: true }, sched: T.sched.work, needs: T.needs ? { labour: T.needs.labour.farmhand || 0 } : undefined });
  SIM.role({ id: cid + '.kin', name: 'kin', org: cid + '.folk', settlement: cid, count: 0, homes: ['camp'], prefers: prefers, sched: T.sched.kin });
  var townCamp = SIM.R.place[S.rf.camps[s]], posts = hands;
  people.forEach(function (a) {
    var g = a.ageBand !== 'child'; a.home = camp.id; a.role = g ? cid + '.worker' : cid + '.kin'; a.work = g && posts > 0 ? (posts--, farm.id) : null;
    a.status = g ? 'employed' : 'housework'; a.job = g ? 'farmhand' : null; a.cls = 'refugee'; a.refugee.farmcamp = cid; a.refugee.camp = cid;
    if (a.hmods) a.hmods = a.hmods.filter(function (x) { return x.why !== 'camp'; });
  });
  if (townCamp) townCamp.people = Math.max(0, (townCamp.people || 0) - np);
  /* its economy: the town's goods and foods, its crop on a farmland site that regrows what it gives, its store opened with
     the town's food; a cart; the roads at the detour rate (as 47h's) */
  var EP = SIM.econ(s), Xp = S.towns[s], goods = {}; Object.keys(EP.goods).forEach(function (g) { goods[g] = EP.goods[g].minLoad != null ? { minLoad: EP.goods[g].minLoad } : {}; goods[g].unit = EP.goods[g].unit; });
  var foods = Xp.econ.foods.slice(), rules = ISLE.simRules(cid); if (rules.govern) rules.govern = Object.assign({}, rules.govern, { exported: false, pool: [s] });
  SIM.economy(Object.assign({ goods: goods, inputs: {}, every: T.economy.every, window: T.economy.window, imports: T.economy.imports, cart: T.economy.cart, meal: { per: I.perMeal, foods: foods.slice() }, useShort: true }, rules), { settlement: cid });
  SIM.store(store.id, { kind: 'warehouse' });
  var hours = 0, w = T.sched.work; for (var i = 0; i < w.length; i++) if (w[i][1] === 'WORK') hours += (i + 1 < w.length ? w[i + 1][0] : 24) - w[i][0];
  var rate = HT.producers.farm.rate * (T.economy.cropRate && T.economy.cropRate[crop.good] != null ? T.economy.cropRate[crop.good] : 1), full = hands * rate * hours, gmax = T.economy.govern && T.economy.govern.max != null ? T.economy.govern.max : 1;
  var siteId = cid + ':farmland';
  SIM.site({ id: siteId, settlement: cid, kind: 'farmland', goods: [crop.good], grade: 'medium', amount: Math.ceil(30 * full), regen: Math.round(full * gmax), yield: 1 });
  SIM.recipe(farm.id, { out: [crop.good], rate: rate, cap: 3000, site: siteId });
  var need = np * I.meals * I.perMeal * HT.startDays; foods.forEach(function (f) { store.stock[f] = (store.stock[f] || 0) + Math.round(need / foods.length); });
  var cart = SIM.actor({ id: cid + '.cart0', role: 'cart', org: cid + '.folk', home: store.id, cls: 'cart', job: 'carters' }); cart.pos = { x: store.x, y: store.y || 0, z: store.z }; SIM.cart(cart);
  var R = HT.road, Wp = null, bd = Infinity; EP.warehouses.forEach(function (P) { var d = Math.hypot(P.x - store.x, P.z - store.z); if (d < bd) { bd = d; Wp = P; } });
  var mins = Math.max(60, Math.round(bd * R.detour / (R.kmh * 1000 / 60))), gO = {}, gI = {}, eO = {}, eI = {}; gO[cid] = [crop.good]; gO[s] = []; gI[s] = foods.filter(function (f) { return f !== crop.good; }); gI[cid] = []; eO[s] = {}; eO[s][crop.good] = 1; eI[cid] = {};
  foods.forEach(function (f) { if (f !== crop.good) eI[cid][f] = np * I.meals * I.perMeal / foods.length; });
  var Ro = SIM.trade({ id: cid + ':out', stops: [{ settlement: cid, place: store.id }, { settlement: s, place: Wp.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins, keep: 1, want: 1e6, goods: gO, expect: eO });
  var Ri = SIM.trade({ id: cid + ':in', stops: [{ settlement: s, place: Wp.id }, { settlement: cid, place: store.id }], cap: R.cap, carriers: 1, minutes: mins, mins: R.mins, keep: R.keep, want: R.want, goods: gI, expect: eI });
  if (SIM.MONEY && ISLE.simMoneyTown) ISLE.simMoneyTown(cid);
  SIM.level(cid, 'abstract');
  if (SIM.placesChanged) SIM.placesChanged();
  /* the land it works, for the drawing and the village to come (core/hamlet 14): the campers' hands */
  var farmland = KHAMLET.farmland({ id: cid + ':farmland', world: T.seed, centre: { x: farm.x, z: farm.z }, hands: hands, crops: crop.rows, ground: site.ground || {}, avoid: site.avoid || null });
  var C = { id: cid, town: s, townName: TSp.name, n: n, site: { x: site.x, z: site.z, y: y, ground: site.ground || null, avoid: site.avoid || null }, founded: minute, people: people.map(function (a) { return a.id; }),
    households: hhs.map(function (h) { return h.hh; }), hands: hands, crop: crop.good, farm: { inCropHa: farmland.inCropHa, farmedHa: farmland.farmedHa, parcels: farmland.parcels, poly: farmland.poly }, places: { camp: camp.id, store: store.id, farm: farm.id }, out: Ro.id, 'in': Ri.id, converted: null, village: null, road: null };
  S.found.camps.push(C); S.found.n[s] = n;
  SIM.logEvent('farming camp founded', { settlement: s, camp: cid, people: np, households: hhs.length, at: [Math.round(site.x), Math.round(site.z)] });
  return C;
};
/* the camp becomes a hamlet: the page lays the village on the camp's site, the sim declares it with the campers first */
ISLE.foundConvert = function (C, minute) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, F = T.found, s = C.town, vid = s + '.hamlet' + C.n;
  if (!ISLE.hooks.layVillage) { C.retryAt = minute + 1440 * 365; return null; }
  var people = C.people.map(function (id) { return SIM.R.actor[id]; }).filter(Boolean), grown = people.filter(function (a) { return a.ageBand !== 'child'; }).length;
  var spec = { id: vid, name: 'farming hamlet ' + C.n + ' of ' + C.townName, focus: 'farming', parent: C.townName, crops: 'staples', founded: C.founded, share: null, hands: Math.max(10, grown),
    popMax: Math.max(60, Math.ceil(people.length * F.settlers)), site: { x: C.site.x, z: C.site.z }, world: T.seed };
  var L = ISLE.hooks.layVillage(spec, C);
  if (!L || L.error || !L.village || L.village.error) { C.retryAt = minute + 1440; S.found.log.push({ op: 'conversion failed', camp: C.id, why: (L && (L.error || (L.village && L.village.error))) || 'no village', minute: minute }); return null; }
  if (!S.hamlets) ISLE.simHamletsInit();
  var used = {}; Object.keys(S.hamletNames || {}).forEach(function (k) { used[S.hamletNames[k]] = true; });
  var nm = KHAMLET.hamletName ? KHAMLET.hamletName('islander', T.seed, vid, used) : null;
  var road = ISLE.hooks.routeRoad ? ISLE.hooks.routeRoad(L.village, spec, C) : null;
  var X = ISLE.simHamlet(spec, L.village, L.resource, nm ? nm.name : null, { people: people, road: road ? { km: road.length_m / 1000, townKm: road.townKm, rec: road } : null });
  X.founded = C.founded; X.converted = minute; X.camp = C.id;
  S.hamlets.villages.push(X); S.hamlets.routes.push(X.out, X['in']);
  if (SIM.MONEY && ISLE.simMoneyTown) ISLE.simMoneyTown(X.id);
  /* the camp struck: its tents empty, its fields the village's now, its carts' roads idle */
  var camp = SIM.R.place[C.places.camp]; camp.people = 0;
  var E = SIM.econ(C.id); if (E && E.recipes[C.places.farm]) E.recipes[C.places.farm].rate = 0;
  [C.out, C['in']].forEach(function (rid) { var Rt = SIM.TRADE && SIM.TRADE.routes[rid]; if (Rt && Rt.goods) Object.keys(Rt.goods).forEach(function (k) { Rt.goods[k] = []; }); });
  C.converted = minute; C.village = vid; C.road = road ? { km: Math.round(road.length_m / 100) / 10, townKm: road.townKm } : null;
  if (SIM.placesChanged) SIM.placesChanged();
  if (ISLE.hooks.founded) ISLE.hooks.founded(X, C, L);   /* the page: the new village named and drawn, its camp struck */
  SIM.logEvent('farming camp converted', { camp: C.id, hamlet: vid, name: nm ? nm.name : null, people: people.length, road: C.road });
  return X;
};
/* a hamlet's road built (47b onBuilt, a lot tagged `road`): the page takes it into the world; the hamlet's carts take it */
ISLE.roadBuilt = function (P) {
  var S = ISLE.SIM, T = ISLE.TUNE.sim, X = S.hamlets && S.hamlets.villages.filter(function (v) { return v.id === P.settlement; })[0]; if (!X || !X.roadProject) return;
  var R = T.hamlets.road, mins = Math.max(60, Math.round(X.roadProject.townKm * 1000 / (R.kmh * 1000 / 60)));
  [X.out, X['in']].forEach(function (rid) { var Rt = SIM.TRADE && SIM.TRADE.routes[rid]; if (Rt) Rt.minutes = mins; });
  X.roadProject.built = SIM.minute(); X.minutes = mins; X.km = X.roadProject.townKm;
  if (ISLE.hooks.roadBuilt) ISLE.hooks.roadBuilt(X.roadProject.rec, X);
  SIM.logEvent('hamlet road built', { hamlet: X.id, km: X.roadProject.km, townKm: X.roadProject.townKm });
};
ISLE.foundBooks = function () {
  var S = ISLE.SIM, out = { minute: SIM.minute(), camps: [], villages: [], roads: [], log: S.found ? S.found.log.slice() : [] }; if (!S.found) return out;
  var I = SIM.ITEMS;
  S.found.camps.forEach(function (C) {
    var E = SIM.econ(C.id), B = (I.statsBy || {})[C.id] || {}, M = Object.assign({ meal: 0, single: 0, none: 0, mess: 0, out: 0 }, B.meals || {});
    var here = C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && a.home === C.places.camp; }).length;
    var inVillage = C.village ? C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && SIM.settlementOf(a) === C.village; }).length : 0;
    var atWork = C.village ? C.people.filter(function (id) { var a = SIM.R.actor[id]; return a && a.work && SIM.R.place[a.work] && SIM.R.place[a.work].settlement === C.village; }).length : 0;
    var townCamp = SIM.R.place[S.rf.camps[C.town]];
    out.camps.push({ id: C.id, town: C.town, founded: C.founded, people: C.people.length, households: C.households.length, here: here, inVillage: inVillage, atWork: atWork, crop: C.crop, made: E ? (E.made[C.crop] || 0) : 0, meals: M,
      converted: C.converted, village: C.village, road: C.road, townCampPeople: townCamp ? townCamp.people : null, farm: { inCropHa: C.farm.inCropHa, parcels: C.farm.parcels.length } });
  });
  (S.hamlets ? S.hamlets.villages : []).filter(function (X) { return X.founded != null; }).forEach(function (X) {
    var BR = SIM.buildReport ? SIM.buildReport().towns[X.id] : null, Pj = BR && X.roadProject ? BR.projects.filter(function (p) { return p.lot === X.roadProject.place; })[0] : null;
    out.villages.push({ id: X.id, name: X.name, people: X.people, workers: X.workers, posts: X.posts, converted: X.converted, camp: X.camp, level: SIM.levelOf(X.id) });
    if (X.roadProject) out.roads.push({ village: X.id, km: X.roadProject.km, townKm: X.roadProject.townKm, hours: X.roadProject.hours, done: Pj ? Pj.done : 0, state: Pj ? Pj.state : (X.roadProject.built ? 'built' : 'waiting'), got: Pj ? Pj.got : {}, built: X.roadProject.built || null, minutes: X.minutes });
  });
  return out;
};
ISLE.foundChecks = function (a, b) {
  var res = [], ok = function (name, pass, detail) { res.push({ name: 'founding: ' + name, ok: !!pass, detail: detail }); }, F = ISLE.TUNE.sim.found;
  var camps = b.camps;
  ok('a town whose refugee households waited ' + F.waitDays + ' days founded a farming camp of them (' + F.households + ' households), its camp the lighter by them', camps.length > 0 && camps.every(function (C) { return C.households === F.households && C.people > 0 && (C.converted ? C.inVillage === C.people : C.here === C.people); }),
    camps.map(function (C) { return C.id + ': ' + C.people + ' people in ' + C.households + ' households at day ' + Math.round(C.founded / 1440) + ' (' + (C.converted ? C.inVillage + ' in the hamlet' : C.here + ' in the camp') + '; the town\'s camp ' + C.townCampPeople + ')'; }).join('; ') || 'no camp founded' + (b.log.length ? '; log: ' + JSON.stringify(b.log.slice(0, 3)) : ''));
  ok('every camp grew its staple on its land and was fed at its ration line', camps.length > 0 && camps.every(function (C) { return C.made > 0 && C.meals.none === 0 && C.farm.parcels > 0; }),
    camps.map(function (C) { return C.id + ' ' + C.crop + ' ' + Math.round(C.made) + ' made on ' + C.farm.inCropHa + ' ha, ' + C.meals.mess + ' mess meals, ' + C.meals.none + ' without food'; }).join('; '));
  var due = camps.filter(function (C) { return b.minute >= C.founded + F.days * 1440 + 1440; });
  if (due.length) ok('a camp of ' + F.days + ' days converted to a hamlet: the founders its first people, housed and at work there, the hamlet named and in the hamlets\' books', due.every(function (C) { return C.converted && C.village && C.inVillage === C.people && C.atWork > 0 && b.villages.some(function (V) { return V.id === C.village && V.name && V.level === 'abstract'; }); }),
    due.map(function (C) { var V = b.villages.filter(function (v) { return v.id === C.village; })[0]; return C.id + (C.converted ? ' -> ' + (V ? V.name : C.village) + ' at day ' + Math.round(C.converted / 1440) + ': ' + C.inVillage + ' of ' + C.people + ' there, ' + C.atWork + ' at work, ' + (V ? V.people + ' people in all' : '') : ' not converted' + (b.log.length ? ' (' + JSON.stringify(b.log.slice(-1)) + ')' : '')); }).join('; '));
  if (b.roads.length) ok('the hamlet\'s highway is a project of its own hands: routed, under way (hours done, its timber drawn) or built, the carts retimed to it', b.roads.every(function (R) { return R.km > 0 && (R.state === 'built' ? R.minutes > 0 : R.done > 0); }),
    b.roads.map(function (R) { return R.village + ': ' + R.km + ' km (' + R.townKm + ' km to the town), ' + R.state + ' ' + Math.round(R.done) + ' of ' + R.hours + ' h, timber got ' + (R.got.timber || 0) + (R.built ? ', built day ' + Math.round(R.built / 1440) + ', ' + R.minutes + ' min a way' : ''); }).join('; '));
  return res;
};
