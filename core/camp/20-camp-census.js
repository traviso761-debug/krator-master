/* ==================== core/camp 20: a band's census (plain data, [G data]) ==================== */
/* core/camp/PLAN.md section 3. A band's people are given and its tents follow them: the census deals the program's
   dwellings to households, the sleeping tents to young riders, and the workshops, the shrine and the pens to the band's
   adults by the culture row's `work`. Every draw is KRAND.hash(seed, index, salt) of the band's own seed, so the same
   band has the same people wherever it pitches and in Godot.
     KCAMP.census({id, world, culture, program}) ->
       {pop, adults, children, elders, riders, mounts, households: [{id, tent, size, chief}],
        people: [{id, household, tent, age: 'adult' | 'child' | 'elder', role, work}], error?}
       tent and work are tent ids, `<band id>:<key>:<i>` (i counts that key in the program, from 0): the ids KCAMP.pitch
       gives the records, so a family's tent is the same record at every site.
     KCAMP.tentIds(id, program) -> [{id, key, v, pen}]  the program's tents and pens, in program order, with their ids
     KCAMP.seedOf(world, id)                           the band's seed */
KCAMP.seedOf = function (world, id) { return KRAND.child(world == null ? 0 : world, 'camp:' + id) >>> 0; };
KCAMP.tentIds = function (id, program) {
  var out = [], seen = {};
  [['tents', false], ['pens', true]].forEach(function (p) {
    (program[p[0]] || []).forEach(function (e) {
      for (var i = 0; i < (e.n == null ? 1 : e.n); i++) {
        var j = seen[e.key] == null ? 0 : seen[e.key];
        seen[e.key] = j + 1;
        out.push({id: id + ':' + e.key + ':' + j, key: e.key, v: e.v == null ? 0 : e.v, pen: p[1]});
      }
    });
  });
  return out;
};
KCAMP.census = function (o) {
  var C = KCAMP.CULTURES[o.culture];
  if (!C) return {error: 'no culture row ' + o.culture, people: [], households: [], pop: 0};
  var seed = KCAMP.seedOf(o.world, o.id), u = function () { return KRAND.unit(KRAND.hash.apply(null, [seed].concat([].slice.call(arguments)))); };
  var span = function (r, a, b) { return r[0] + Math.floor(u(a, b) * (r[1] - r[0] + 1)); };
  var T = KCAMP.tentIds(o.id, o.program), households = [], people = [];
  var person = function (hh, tent, age) { var p = {id: o.id + ':p' + people.length, household: hh, tent: tent, age: age, role: null, work: null}; people.push(p); return p; };
  /* the households: the chief's first, then each dwelling's in program order */
  T.forEach(function (t, ti) {
    var k = C.kind(t.key), nh = C.households[t.key];
    if ((k !== 'dwelling' && k !== 'chief') || !nh) return;
    for (var h = 0; h < nh; h++) {
      var chief = k === 'chief', size = span(chief ? C.chiefHousehold : C.household, 1, ti * 4 + h), hid = o.id + ':h' + households.length;
      households.push({id: hid, tent: t.id, size: size, chief: chief});
      var elder = u(2, ti * 4 + h) < C.elderShare ? 1 : 0;
      for (var m = 0; m < size; m++) {
        var p = person(hid, t.id, m < 2 ? 'adult' : m < 2 + elder ? 'elder' : (m === size - 1 && u(3, ti * 4 + h) < 0.5) ? 'adult' : 'child');
        if (chief && m === 0) p.role = 'chief';
      }
    }
  });
  /* the sleeping tents: young riders, no household's */
  T.forEach(function (t, ti) {
    if (C.kind(t.key) !== 'sleep') return;
    var n = span(C.sleepers, 4, ti);
    for (var m = 0; m < n; m++) person(null, t.id, 'adult');
  });
  /* the work: each workshop, the shrine and the pens take adults without a role, drawn by hash (not the first found) */
  var free = function () { return people.filter(function (p) { return p.age === 'adult' && !p.role; }); };
  T.forEach(function (t, ti) {
    var w = C.work[t.key];
    if (!w) return;
    for (var m = 0; m < w.n; m++) {
      var F = free();
      if (!F.length) return;
      var p = F[Math.floor(u(5, ti, m) * F.length)];
      p.role = w.role; p.work = t.id;
    }
  });
  /* everyone else who can ride hunts or gathers; children and elders keep the camp */
  people.forEach(function (p, i) {
    if (p.role) return;
    p.role = p.age === 'child' ? 'child' : p.age === 'elder' ? 'elder' : u(6, i) < 0.55 ? 'hunter' : 'gatherer';
  });
  var adults = people.filter(function (p) { return p.age === 'adult'; }).length, riders = people.filter(function (p) { return p.age === 'adult' && p.role !== 'shaman'; }).length;
  return {pop: people.length, adults: adults, children: people.filter(function (p) { return p.age === 'child'; }).length,
    elders: people.filter(function (p) { return p.age === 'elder'; }).length, riders: riders, mounts: Math.round(riders * C.mountsPer),
    households: households, people: people};
};
