/* ============================== 5o. THE ANIMALS: THE RANCHES' HERDS, THE ARENA'S BEASTS ============================== */
/* [G data] The owner, 2026-10-13: "basic needs for animals as part of their ranch (feeding, idling) and arena (the
   former, plus a forced command to move and engage in combat). In addition to beetle ranches, add pigs, ducks, cow
   ranches / coops. Cows and other appropriate animals to be able to make milk which can be cooked with or converted to
   cheese, a higher quality food item." Tuned by TUNE.sim.animals.
     - THE HERDS: every pen (33-vc-country.js: the beetle ranches, the dairy pastures, the pig sties, the duck coops) is
       its trade's work place (42-vc-sim-places.js) and its animals' home: a herd of `n` (a KRAND hash of the pen) of
       the species' fauna-kit animal (`fauna`, a variant by hash), each an actor (`animal`, `herd` = the pen) on the
       straight `pen` layer, standing at the pen's spots (laid out inside its fence).
     - THEIR NEEDS (core/simulation 77-sim-6-needs.js, the role's own `free`): hunger, thirst, sleep and ease rise by
       the species' `rate`; in the hours their schedule leaves free they FEED at the trough, GRAZE, WATER, BED down or
       LOAF by what the meters ask; the night's hours are BED (the fauna kit's REST and ROOST hours). Their condition
       (SIM.mood) is their yield's: the herd recipes (core 77-sim-6-economy.js `herd`, TUNE.sim.economy.producers)
       make eggs, milk, pork and fowl by the animal-hour while their keepers tend them, and the dairymen turn milk into
       cheese (four to one; a better meal: 77-sim-6-items.js `quality`).
     - SLAUGHTER AND BIRTH (owner, 2026-10-13): a species' `meat` share is raised for meat, slaughtered once grown (a
       year: `growDays`) for its meat into the pen's store, a newborn in its place; the young yield nothing (core: herds
       count the grown) and are drawn small (a pig's piglet). Breeding and real maturity times come later.
     - THE PETS (owner, 2026-10-13): a dog and a cat for every `pets.per` citizens, each in a household (a hash),
       asleep at home by night; by day they roam the greens and squares, moving on (`cycle`), and now and then mingle
       where people gather, by their meters (socialize, ease, sleep); no hunger, no thirst for now.
     - THE ARENA: the Arena canton's stables (its interior's `stable` rooms) keep `arena.perStable` beasts each (the
       arena tiger, the pit lizard, the pit beetle), on the same needs. A BOUT (`arena.bouts`: the hours, the minutes):
       its keepers' forced command (core SIM.command) sends two sound beasts from the stables onto the sand, face to
       face, to FIGHT; at its end the stronger by mass, aggression, condition and a hash of the bout wins, and the loser
       is hurt (`heal` days out of the bouts, its meters spent). VC.arenaBout(a, b) commands one at any time.
   VC.simAnimalsReport is the report's. */
VC.simAnimals = function () {
  if (typeof SIM === 'undefined' || !TUNE.sim.animals) return null;
  var T = TUNE.sim.animals, t0 = Date.now(), u = function (a, b, c) { return KRAND.unit(KRAND.hash(8181, a, b, c || 0)); };
  var out = { herds: {}, animals: 0, pens: 0, arena: { stables: 0, beasts: 0 }, why: [] };
  T.acts.forEach(function (a) { if (!SIM.R.activity[a]) SIM.activity({ id: a, indoor: a === 'BED' }); });
  if (!SIM.R.org.livestock) SIM.org({ id: 'livestock', faction: 'voth' });
  var ground = function (x, z) { var y = VC.walkY ? VC.walkY(x, z) : null; return y != null && isFinite(y) ? y : baseH(x, z); };
  if (!SIM.nav.layers.pen) SIM.nav.layer('pen', { route: function (ax, az, bx, bz, o) { return { pts: [[ax, o && o.ay != null ? o.ay : ground(ax, az), az], [bx, o && o.by != null ? o.by : ground(bx, bz), bz]] }; } });   /* within a pen, or the stables to the sand: straight, between the ends' heights */
  /* a species' role: its schedule (BED in the fauna kit's resting hours), its needs, its own free choices, all pinned home */
  var roleOf = function (sp) {
    var id = 'animal.' + sp, S = T.species[sp]; if (SIM.R.role[id]) return id;
    var L = typeof KratorFauna !== 'undefined' && KratorFauna.lifeOf ? KratorFauna.lifeOf(S.fauna) : null, sch = L && (L.schedule || (L.data && L.data.schedule)), rows = [], prev = null;
    for (var h = 0; h < 24; h++) { var a = sch && sch[h] ? (/REST|ROOST|SLEEP/.test(sch[h]) ? 'BED' : 'LOAF') : (h < 5 || h >= 21 ? 'BED' : 'LOAF'); if (a !== prev) rows.push([h, a]); prev = a; }
    var pin = {}; T.acts.forEach(function (a) { pin[a] = { pin: 'home' }; }); pin.FIGHT = {};
    SIM.role({ id: id, org: 'livestock', name: S.name || sp, sched: rows, layer: 'pen', speed: S.speed || 0.9, prefers: pin, needs: { rate: S.rate, free: T.free } });
    return id;
  };
  /* a pen's spots: a grid inside its fence (its local frame: x along the pen, z across), a few metres in */
  var spotsOf = function (c, ry, w, d, n, y) { var cols = Math.max(1, Math.ceil(Math.sqrt(n * w / d))), rows = Math.max(1, Math.ceil(n / cols)), cs = Math.cos(ry), sn = Math.sin(ry), sp = [];
    for (var i = 0; i < n; i++) { var lx = -w / 2 + T.inset + (w - 2 * T.inset) * ((i % cols) + 0.5) / cols, lz = -d / 2 + T.inset + (d - 2 * T.inset) * (Math.floor(i / cols) + 0.5) / rows;
      var x = c[0] + cs * lx + sn * lz, z = c[1] - sn * lx + cs * lz; sp.push([Math.round(x * 100) / 100, Math.round(z * 100) / 100, Math.round(ground(x, z) * 100) / 100]); }
    return sp; };
  var house = function (P, sp, n) { var acts = P.activities; T.acts.forEach(function (a) { if (a !== 'FIGHT') acts[a] = Math.max(acts[a] || 0, n); }); return roleOf(sp); };
  var make = function (P, sp, i, j, role) {
    var S = T.species[sp], v = S.variants[Math.floor(u(i, j, 7) * S.variants.length) % S.variants.length];
    var a = SIM.actor({ id: 'animal.' + P.id + '.' + j, role: role, home: P.id, cls: 'animal', job: null });
    a.animal = { sp: sp, fauna: S.fauna, variant: v, breed: S.breed || null, seed: (i * 131 + j) | 0, mass: S.mass, aggression: S.aggression };
    a.herd = P.id; a.issued = true;   /* the items' errands are not theirs */
    /* its age: a meat animal (the species' `meat` share) somewhere in its first year, so the herd's slaughters come
       steadily; the rest (the sows, the layers, the milkers, the beasts) grown */
    var G = T.growDays * 1440, now = SIM.minute(); a.animal.meat = !!(S.meat && u(i, j, 11) < S.meat.share);
    a.born = a.animal.meat ? now - Math.floor(u(i, j, 12) * G) : now - G - 1; a.grownAt = a.born + G;
    if (SIM.NEED) { a.nd = SIM.NEED.list.map(function (nm) { return Math.round(15 + 40 * u(i, j, nm.length)); }); }
    var s = P.spots && P.spots.length ? P.spots[j % P.spots.length] : [P.x, P.z, P.y || 0]; a.pos = { x: s[0], y: s[2], z: s[1] };
    out.animals++; return a;
  };
  /* ---- the ranches' herds */
  (VC.industry && VC.industry.pens || []).forEach(function (pen, i) {
    var sp = T.penSpecies[pen.kind], S = sp && T.species[sp]; if (!S) return;
    var P = SIM.R.place['work.' + T.placeKind[pen.kind] + '.' + pen.i]; if (!P) { out.why.push('no place for ' + pen.kind + ' pen ' + pen.i); return; }
    var n = S.n[0] + Math.floor(u(i, 1) * (S.n[1] - S.n[0] + 1));
    P.spots = spotsOf([pen.x, pen.z], pen.ry, pen.w, pen.d, Math.max(n, 4), pen.y); P.r = 0;
    var role = house(P, sp, n);
    for (var j = 0; j < n; j++) make(P, sp, i, j, role);
    out.herds[pen.kind] = (out.herds[pen.kind] || 0) + n; out.pens++;
  });
  /* ---- the arena: its stables' beasts, the sand */
  var AR = T.arena, CA = typeof CANT !== 'undefined' && CANT.by && CANT.by.Arena;
  if (AR && CA) {
    var cy = ground(CA.x, CA.z), sy = CA.top && CA.top.y != null && Math.abs(cy - CA.top.y) > 8 ? CA.top.y : cy;
    SIM.place({ id: 'arena.sand', kind: 'arena', name: 'The Arena’s sand', x: CA.x, z: CA.z, y: sy, activities: { FIGHT: 2 }, open: null, access: 'private', layer: 'pen', r: 0,
                spots: [[CA.x - AR.apart / 2, CA.z, sy], [CA.x + AR.apart / 2, CA.z, sy]], tags: ['Arena', 'arena'] });
    var stables = SIM.all('place').filter(function (P) { return P.kind === 'canton-stable' && (P.tags || []).indexOf('Arena') >= 0; });
    stables.forEach(function (P, i) {
      var n = AR.perStable, keys = AR.species; P.spots = spotsOf([P.x, P.z], 0, Math.max(4, (P.r || 3) * 2), Math.max(4, (P.r || 3) * 2), n, P.y); P.spots.forEach(function (s) { s[2] = P.y; });
      for (var j = 0; j < n; j++) { var sp = keys[(i + j) % keys.length], role = house(P, sp, n), a = make(P, sp, 100 + i, j, role); a.arena = true; out.arena.beasts++; }
      out.arena.stables++;
    });
    VC.ARENA = { sand: 'arena.sand', bouts: [], next: null, stables: stables.length, y: sy };
    if (SIM.stepHooks.indexOf(VC.arenaStep) < 0) SIM.stepHooks.push(VC.arenaStep);
  } else out.why.push('no arena');
  if (SIM.stepHooks.indexOf(VC.animalsStep) < 0) SIM.stepHooks.push(VC.animalsStep);
  out.slaughter = {};
  /* ---- the pets: a dog and a cat for every `per` citizens */
  var PT = T.pets;
  if (PT) {
    ['ROAM', 'MINGLE'].forEach(function (a) { if (!SIM.R.activity[a]) SIM.activity({ id: a }); });
    SIM.all('place').forEach(function (P) { if (PT.kinds.indexOf(P.kind) < 0) return; var soc = P.activities.SOCIALIZE || 0;   /* where they roam and mingle: the greens and squares */
      P.activities.ROAM = Math.max(P.activities.ROAM || 0, Math.max(10, soc)); P.activities.MINGLE = Math.max(P.activities.MINGLE || 0, Math.max(2, Math.ceil(soc * PT.mingle))); });
    var citizens = SIM.all('actor').filter(function (a) { return !a.animal && !a.driven && !a.transient; }).length, n = Math.floor(citizens / PT.per);
    var homes = SIM.all('place').filter(function (P) { return P.kind === 'home' && P.people > 0 && !P.mess; });
    out.pets = {};
    Object.keys(PT.species).forEach(function (sp, si) {
      var S = PT.species[sp], id = 'pet.' + sp, order = homes.map(function (P, k) { return [u(k, si, 21), P]; }).sort(function (p, q) { return p[0] - q[0]; }).map(function (x) { return x[1]; });
      if (!SIM.R.role[id]) SIM.role({ id: id, org: 'livestock', name: S.name, sched: [[0, 'BED'], [PT.night[1], 'ROAM'], [PT.night[0], 'BED']], speed: S.speed, cycle: { ROAM: PT.cycle }, fallback: { ROAM: 'BED', MINGLE: 'BED' },   /* nowhere to go: home, not the citizens' places */
        prefers: { BED: { pin: 'home' }, ROAM: { kinds: PT.kinds, spread: PT.spread, reach: PT.reach }, MINGLE: { kinds: PT.kinds, spread: 3, reach: PT.reach } }, needs: { rate: S.rate, free: PT.free } });
      for (var j = 0; j < n && order.length; j++) {
        var H = order[j % order.length], a = SIM.actor({ id: id + '.' + j, role: id, home: H.id, cls: 'animal', job: null });
        H.activities.BED = (H.activities.BED || 0) + 1;
        a.animal = { sp: sp, fauna: S.fauna, variant: S.variants[0], seed: (si * 7919 + j) | 0, mass: S.mass, aggression: S.aggression }; a.pet = true; a.issued = true;
        if (SIM.NEED) a.nd = SIM.NEED.list.map(function (nm) { return Math.round(10 + 40 * u(j, si, nm.length + 40)); });
        a.pos = { x: H.door.x, y: H.door.y || 0, z: H.door.z };
      }
      out.pets[sp] = Math.min(n, n && order.length ? n : 0); out.animals += out.pets[sp];
    });
    out.petHours = {}; out.petsPer = PT.per; out.citizens = citizens;
    if (SIM.stepHooks.indexOf(VC.petsStep) < 0) SIM.stepHooks.push(VC.petsStep);
  }
  if (SIM.placesChanged) SIM.placesChanged();
  out.ms = Date.now() - t0; VC.SIMANIMALS = out;
  return out;
};

/* the slaughter (each hour of the keepers' `slaughterHours`, SIM.stepHooks): every meat animal grown is slaughtered,
   its meat (`kg` x `servingsPerKg` x its condition) into its pen's store (core SIM.produce), and a newborn takes its
   place (the same record: a new generation, a new look by its seed, born now, grown `growDays` on) */
VC.animalsStep = function (minute) {
  var T = TUNE.sim.animals, h = (minute % 1440) / 60; if (minute % 60 !== 0 || h < T.slaughterHours[0] || h >= T.slaughterHours[1] || !VC.SIMANIMALS) return;
  var st = VC.SIMANIMALS.slaughter;
  SIM.all('actor').forEach(function (a) { var o = a.animal; if (!o || !o.meat || a.grownAt > minute || a.cmd) return;
    var M = T.species[o.sp].meat, mo = SIM.mood ? SIM.mood(a) : null, got = SIM.ECON ? SIM.produce(a.herd, M.good, M.kg * T.servingsPerKg * (mo ? mo.eff : 1)) : 0;
    o.gen = (o.gen || 0) + 1; o.seed = (o.seed * 31 + o.gen * 977) | 0; a.born = minute; a.grownAt = minute + T.growDays * 1440;
    if (SIM.NEED && a.nd) { a.nd = SIM.NEED.list.map(function () { return 20; }); a.ndT = minute; a.ndFrom = minute; }
    var R = st[o.sp] || (st[o.sp] = { n: 0, servings: 0 }); R.n++; R.servings += got;
    SIM.logEvent('slaughter', { animal: a.id, sp: o.sp, good: M.good, n: got }); });
};

/* the pets' day, tallied each hour (SIM.stepHooks): pet-hours by what they do (the report's, verify's) */
VC.petsStep = function (minute) {
  if (minute % 60 !== 0 || !VC.SIMANIMALS) return; var H = VC.SIMANIMALS.petHours;
  SIM.all('actor').forEach(function (a) { if (a.pet && a.present) H[a.activity || 'none'] = (H[a.activity || 'none'] || 0) + 1; });
};

/* a bout: the keepers' forced command (core SIM.command) puts `a` and `b` on the sand face to face for `mins` minutes */
VC.arenaBout = function (a, b, mins) {
  var A = VC.ARENA, AR = TUNE.sim.animals.arena; if (!A || !a || !b) return null;
  var m = SIM.minute(), until = m + (mins || AR.mins), S = SIM.R.place[A.sand];
  [a, b].forEach(function (x, k) { var s = S.spots[k]; SIM.command(x, { act: 'FIGHT', place: A.sand, spot: { x: s[0], z: s[1], y: s[2] }, until: until, by: 'arena keepers' }); SIM.decide(x, m, SIM.time()); x.wanted = 'FIGHT'; });   /* obeyed at once, not in the minute's queue */
  var B = { a: a.id, b: b.id, start: m, until: until, won: null }; A.bouts.push(B); SIM.logEvent('bout', { a: a.id, b: b.id, until: until });
  return B;
};
/* each minute (SIM.stepHooks): a bout due at one of `bouts.hours`; a bout ended: its result */
VC.arenaStep = function (minute) {
  var A = VC.ARENA, AR = TUNE.sim.animals.arena; if (!A) return;
  A.bouts.forEach(function (B) {
    if (B.won || minute < B.until) return;
    var a = SIM.R.actor[B.a], b = SIM.R.actor[B.b], d = Math.floor(minute / 1440);
    var score = function (x, k) { var M = SIM.mood ? SIM.mood(x) : null, e = M ? M.eff : 1; return x.animal.mass * (0.6 + x.animal.aggression) * e * (0.75 + 0.5 * KRAND.unit(KRAND.hash(9191, d, x.k, k))); };
    var sa = score(a, 1), sb = score(b, 2), win = sa >= sb ? a : b, lose = win === a ? b : a;
    B.won = win.id; B.lost = lose.id; lose.hurtTill = minute + AR.heal * 1440;
    if (SIM.NEED && lose.nd) { SIM.needsOf(lose, minute); var ix = SIM.NEED.idx; if (ix.sleep != null) lose.nd[ix.sleep] = Math.min(100, lose.nd[ix.sleep] + 45); if (ix.eat != null) lose.nd[ix.eat] = Math.min(100, lose.nd[ix.eat] + 25); }
    SIM.logEvent('bout won', { winner: win.id, loser: lose.id, sp: [win.animal.sp, lose.animal.sp] });
  });
  if (AR.bouts.hours.indexOf(Math.floor((minute % 1440) / 60)) < 0 || minute % 60 !== 0 || A.next === minute) return;
  A.next = minute;
  var sound = SIM.all('actor').filter(function (x) { return x.arena && x.present && !x.cmd && !(x.hurtTill > minute); });
  if (sound.length < 2) return;
  var d = Math.floor(minute / 1440), i = Math.floor(KRAND.unit(KRAND.hash(9292, d, minute)) * sound.length), a = sound[i], rest = sound.filter(function (x) { return x !== a && x.home !== a.home; });
  if (!rest.length) rest = sound.filter(function (x) { return x !== a; });
  VC.arenaBout(a, rest[Math.floor(KRAND.unit(KRAND.hash(9393, d, minute)) * rest.length)], AR.mins);
};

VC.simAnimalsReport = function () {
  var S = VC.SIMANIMALS; if (!S || typeof SIM === 'undefined') return null;
  var A = SIM.all('actor').filter(function (a) { return a.animal; }), by = {}, act = {};
  A.forEach(function (a) { var k = a.animal.sp, B = by[k] || (by[k] = { n: 0, happy: 0, eff: 0 }); B.n++; var M = SIM.mood ? SIM.mood(a) : null; if (M) { B.happy += M.happiness; B.eff += M.eff; }
    act[a.activity || 'none'] = (act[a.activity || 'none'] || 0) + 1; });
  Object.keys(by).forEach(function (k) { var B = by[k]; B.happy = Math.round(B.happy / B.n * 10) / 10; B.eff = Math.round(B.eff / B.n * 100) / 100; });
  var bouts = VC.ARENA ? VC.ARENA.bouts.map(function (B) { return { a: B.a, b: B.b, start: B.start, won: B.won }; }) : [];
  var m = SIM.minute(), young = {}, next = Infinity; A.forEach(function (a) { if (a.grownAt > m) { young[a.animal.sp] = (young[a.animal.sp] || 0) + 1; if (a.animal.meat) next = Math.min(next, a.grownAt - m); } });
  var ages = A.filter(function (a) { return a.grownAt > m && a.grownAt - a.born !== TUNE.sim.animals.growDays * 1440; }).length;   /* every young one a year from its birth to grown */
  return { setup: S, bySpecies: by, doing: act, bouts: bouts, hurt: A.filter(function (a) { return a.hurtTill > m; }).length,
           slaughter: JSON.parse(JSON.stringify(S.slaughter || {})), young: young, nextSlaughterMins: next === Infinity ? null : next, badAges: ages,
           pets: S.pets || null, petHours: JSON.parse(JSON.stringify(S.petHours || {})), petsPer: S.petsPer, citizens: S.citizens };
};
