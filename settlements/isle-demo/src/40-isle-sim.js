/* ============================== 7. THE TOWNS ON core/simulation: THE BINDING, THE SETTLEMENT, THE PLACES (P7b) ============================== */
/* [G data] The isle host (PLAN.md section 9): each town declared into core/simulation (SCHEMA.md, "How a world is
   declared" and "Settlements and their economies"), in the order Dhelv's 74-dhelv-sim.js gives, one town at a time:
     ISLE.simInit(clock)        the host binding (SIM.init: the clock's hour, day and motion seconds), the activities,
                                the faction, the items (43); once a page
     ISLE.simDeclare(plans)     plans: [{R, G}] from ISLE.plan / ISLE.city. Each town's nav (41) joins one 'pedestrian'
                                layer; then, town by town, its settlement record, its places (below), its people (42),
                                its households and shops (43) and its own economy (44); SIM.check last
     ISLE.simPlaces(TS, R, G, nav)  the places, from the plan's records alone:
       - every lot whose key ISLE.TUNE.sim.kinds names, as [kind, {ACTIVITY: slots}] (Dhelv's table), its slots from its
         footprint (no interiors yet: Verge's rule), a dwelling's from its households (34: ISLE.households);
       - every farm parcel (R.fields) by its kind, its crop kept for the economy;
       - the door on the street nearest the lot (41: a split of the way), so a walk starts and ends on its street.
     Places are in WORLD metres (the town's frame added), keyed to their settlement; each carries tags {key, lot, trade
     (the census trade its key carries: kits/islanders IS_TRADES, as ISLE_TRADES), cls, district, role, crop}.
     The houses are registered in a hashed order (core/rand), so the roles dealt first (42) do not all live in the
     first-built streets. ISLE.SIM is the report verify.py reads. */
ISLE.SIM = null;
ISLE.simInit = function (clock) {
  if (ISLE.SIM) return ISLE.SIM;
  var T = ISLE.TUNE.sim, C = clock || { m: 0, day: 0, hour: 0.5 / 60, t: 0 };
  var S = ISLE.SIM = { clock: C, towns: {}, order: [], problems: [], nav: null, ms: {} };
  SIM.init({ seed: T.seed, hour: function () { return C.hour; }, day: function () { return C.day; }, t: function () { return C.t; }, err: function (m) { S.problems.push(m); } });
  SIM.STEP_MAX = T.clock.stepMax; SIM.LAG = T.clock.lag;
  T.activities.forEach(function (a) { if (!SIM.R.activity[a]) SIM.activity({ id: a, indoor: T.indoor.indexOf(a) >= 0 }); });
  if (!SIM.R.faction.islanders) SIM.faction({ id: 'islanders', name: 'The Ring Sea Islanders' });
  ISLE.simItemsInit();
  return S;
};
/* the census trade a key carries (the first IS_TRADES row naming it), or null */
ISLE.tradeOf = function (key) {
  if (!ISLE._trade) { ISLE._trade = {}; (typeof ISLE_TRADES !== 'undefined' ? ISLE_TRADES : []).forEach(function (r) { (r.east || []).concat(r.west || []).forEach(function (k) { if (!ISLE._trade[k]) ISLE._trade[k] = r.trade; }); }); }
  return ISLE._trade[key] || null;
};
ISLE.simPlaces = function (TS, R, G, nav) {
  var T = ISLE.TUNE.sim, F = G.frame, s = TS.id, out = { places: [], homes: 0, beds: 0, posts: 0, byKind: {}, unmapped: {}, far: 0 };
  var world = function (x, z) { return { x: +(x + F.x).toFixed(2), y: +(G.h(x, z) + F.sea).toFixed(2), z: +(z + F.z).toFixed(2) }; };
  var put = function (id, name, K, x, z, ry, area, beds, tags) {
    var o = K[2] || {}, acts = {}, w = world(x, z), dn = nav.door(x, z, 3000), door = dn >= 0 ? nav.at(dn) : { x: w.x, y: w.y, z: w.z };
    if (dn < 0) out.far++;
    if (beds) T.home.acts.forEach(function (a) { acts[a] = beds; });
    for (var a in K[1]) acts[a] = o.posts === 'beds' && a === 'WORK' ? beds : Math.max(1, Math.round(area / 100 * K[1][a]));
    var P = SIM.place({ id: id, name: name, kind: K[0], x: w.x, y: w.y, z: w.z, ry: ry || 0, door: door, activities: acts, open: o.open, indoor: o.out ? {} : true,
      wander: o.wander || 0, settlement: s, tags: tags });
    if (o.mess) P.mess = true;
    if (o.cls) P.cls = o.cls;
    if (o.shop) P.shopAs = o.shop;
    out.places.push(P); out.byKind[K[0]] = (out.byKind[K[0]] || 0) + 1; out.beds += beds; out.posts += acts.WORK || 0; if (beds) out.homes++;
    return P;
  };
  var homes = [];
  R.lots.forEach(function (L, i) {
    var K = T.kinds[L.key]; if (!K) { out.unmapped[L.key] = (out.unmapped[L.key] || 0) + 1; return; }
    var hh = ISLE.households(L.key), beds = hh * T.home.per;
    var tags = { key: L.key, lot: L.id, trade: ISLE.tradeOf(L.key), cls: L.cls, district: L.district, role: L.role };
    var rec = [s + '.' + L.lot, L.name || ISLE_DIMS[L.key] && ISLE_DIMS[L.key].role || L.key, K, L.x, L.z, L.ry, L.w * L.d, beds, tags];
    if (K[0] === 'home') homes.push({ h: KRAND.hash(T.seed, 71, i), rec: rec }); else put.apply(null, rec);
  });
  (R.fields || []).forEach(function (Fr) {
    var K = T.field[Fr.kind]; if (!K) return;
    put(s + '.' + Fr.id.split('.').pop(), Fr.kind + ' of ' + Fr.crop, K, Fr.x, Fr.z, 0, Fr.size * Fr.size, 0,
      { key: 'field:' + Fr.crop, lot: Fr.id, trade: ISLE.tradeOf(Fr.kind === 'orchard' ? 'ie-farm-poor' : 'ie-farm'), cls: Fr.kind, district: 'farmland', role: null, crop: Fr.crop });
  });
  homes.sort(function (a, b) { return a.h - b.h || (a.rec[0] < b.rec[0] ? -1 : 1); }).forEach(function (H) { put.apply(null, H.rec); });
  return out;
};
/* the towns declared: plans [{R, G}] */
ISLE.simDeclare = function (plans, clock) {
  var S = ISLE.simInit(clock), T = ISLE.TUNE.sim, t0 = Date.now();
  var navs = plans.map(function (p) { var TS = T.towns[p.R.town]; return ISLE.navOf(p.R, p.G, TS.prefix + 'n'); });
  plans.forEach(function (p, i) {
    var TS = T.towns[p.R.town], t1 = Date.now(); if (S.towns[TS.id]) return;
    SIM.settlement({ id: TS.id, faction: TS.faction, name: TS.name });
    if (!SIM.R.org[TS.id + '.folk']) SIM.org({ id: TS.id + '.folk', faction: TS.faction, name: 'The people of ' + TS.name });
    var PL = ISLE.simPlaces(TS, p.R, p.G, navs[i]);
    S.towns[TS.id] = { town: p.R.town, id: TS.id, frame: p.G.frame, places: PL, nav: navs[i].stats };
    S.order.push(TS.id);
    S.towns[TS.id].ms = { places: Date.now() - t1 };
  });
  /* the one walking layer: every town's graph (their doors split in), in world metres */
  var nodes = [], edges = [];
  navs.forEach(function (n) { var W = n.world(); nodes = nodes.concat(W.nodes); edges = edges.concat(W.edges); });
  SIM.nav.layer('pedestrian', { nodes: nodes, edges: edges, cost: { alley: 1.1, join: 1.2 } });
  S.nav = { nodes: nodes.length, edges: edges.length, bodies: navs.map(function (n) { return n.bodies(); }) };
  plans.forEach(function (p) {
    var TS = T.towns[p.R.town], X = S.towns[TS.id]; if (X.pop) return; var t1 = Date.now();
    X.pop = ISLE.simPeople(TS, X.places.places);
    X.items = ISLE.simHouseholds(TS, X.places.places);
    X.econ = ISLE.simEconomy(TS, X.places.places);
    X.ms.people = Date.now() - t1;
  });
  S.problems = S.problems.concat(SIM.check());
  S.ms.declare = Date.now() - t0;
  return S;
};
/* the world run a minute at a time, as the clock would: its day, hour and motion seconds (never twice for a minute) */
ISLE.simRun = function (minutes, each) {
  var C = ISLE.SIM.clock, spm = ISLE.TUNE.sim.clock.secPerMinute;
  for (var i = 0; i < minutes; i++) { C.m++; C.day = Math.floor(C.m / 1440); C.hour = (C.m % 1440 + 0.5) / 60; C.t += spm; SIM.step(); if (each) each(C.m); }
  return C.m;
};
