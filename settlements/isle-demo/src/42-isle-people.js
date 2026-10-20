/* ============================== 7c. THE PEOPLE: ROLES BY KIND OF WORK AND BY AGE, DEALT PER TOWN (P7b) ============================== */
/* [G data] A town's people as core/simulation roles (SCHEMA.md "roles"), keyed to the town (`settlement`) and dealt by
   SIM.populate({settlement, prefix}) over the town's own beds, once a town (P7a: homes and work in one's own town):
     - a role for each kind of work (ISLE.TUNE.sim.jobs): its count the posts (WORK slots) its kinds of place offer in
       the town, so every post is filled; it lives in the houses (the soldiers in the barracks first) and works at the
       nearest place of its kinds with a free post (core/simulation's `work.near`);
     - by age (ISLE.TUNE.sim.ages; the owner, 2026-10-19): the children (a share of the town), as many of them pupils as
       the schools', temples' and shrines' STUDY places hold (the nearest), the rest helping at home (HOUSEWORK); the elders (a
       share) keeping house; the adults at home (no post): the `fill` role, every bed left (the residences' and the
       barracks' too: ISLE.TUNE.sim.homes).
   The census's people are the sim's: the beds are the households at five a household (40), so the town holds the
   census's citizens exactly. No slaves and no cantons (Voth's 44 is trimmed, not copied). After the deal:
     - each person's age, a hash of the person within its band (pupils the youngest children), and its status:
       employed, pupil, housework (a child or an elder) or at home;
     - THE HOUSEHOLDS: the deal fills house after house with one role, so the people of each `mix.cell`-metre square are
       dealt round its houses again, the kinds in their shares, so a house holds a family; nobody moves out of the
       square, and everyone keeps the job the deal gave;
     - its home's class and wealth (the items' meals and eating out read them) and `job`, the census trade of its work.
   ISLE.simDemography(s) is the town's breakdown: by age band, by status, by kind of work, the households. */
ISLE.simPeople = function (TS, places) {
  var T = ISLE.TUNE.sim, A = T.ages, s = TS.id, org = s + '.folk', posts = {}, study = 0, beds = 0, out;
  places.forEach(function (P) { if (P.activities.WORK) posts[P.kind] = (posts[P.kind] || 0) + P.activities.WORK; study += P.activities.STUDY || 0; beds += P.activities.SLEEP || 0; });
  var prefers = function () { return { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, HOUSEWORK: { pin: 'home' }, WORK: { pin: 'work' }, STUDY: { pin: 'work' } }; };
  var NE = T.needs, needsOf = function (job) { return NE ? { labour: NE.labour[job] || 0, rate: NE.byTrade[job] || undefined } : undefined; };   /* a trade's labour and rates */
  var counts = {}, role = function (o) { SIM.role(Object.assign({ org: org, settlement: s, homes: ['home'], prefers: prefers(), needs: needsOf(o.name) }, o)); };
  Object.keys(T.jobs).forEach(function (j) {
    var J = T.jobs[j], n = J.kinds.reduce(function (a, k) { return a + (posts[k] || 0); }, 0); if (!n) return;
    counts[j] = n;
    role({ id: s + '.' + j, name: j, count: n, homes: (J.homes || ['home']).slice(), work: { kinds: J.kinds.slice(), act: 'WORK', near: true }, sched: T.sched[J.sched || 'work'] });
  });
  var kids = Math.round(beds * A.children), pupils = Math.min(kids, study), elders = Math.round(beds * A.elders);
  if (pupils) role({ id: s + '.pupil', name: 'pupil', count: pupils, work: { kinds: ['school', 'temple', 'shrine'], act: 'STUDY', near: true }, sched: T.sched.pupil });
  if (kids - pupils) role({ id: s + '.child', name: 'child', count: kids - pupils, sched: T.sched.child });
  if (elders) role({ id: s + '.elder', name: 'elder', count: elders, sched: T.sched.elder });
  role({ id: s + '.kin', name: 'kin', fill: true, homes: T.homes.slice(), sched: T.sched.kin });
  out = SIM.populate({ settlement: s, prefix: TS.prefix });
  /* ages and status */
  var mine = SIM.all('actor').filter(function (a) { var H = SIM.R.place[a.home]; return H && H.settlement === s && !a.driven; });
  mine.forEach(function (a) {
    var R = SIM.R.role[a.role], nm = R.name, band = nm === 'pupil' ? 'pupil' : nm === 'child' ? 'child' : nm === 'elder' ? 'elder' : 'adult', B = A.bands[band];
    a.age = B[0] + Math.floor(KRAND.unit(KRAND.hash(T.seed, 61, a.k)) * (B[1] - B[0] + 1));
    a.ageBand = band === 'pupil' || band === 'child' ? 'child' : band;
    a.status = R.work && R.work.act === 'WORK' ? 'employed' : nm === 'pupil' ? 'pupil' : nm === 'child' || nm === 'elder' ? 'housework' : 'home';
  });
  out.mixed = ISLE.simMixHouseholds(s, mine);
  /* a person's trait and starting meters, by a hash of the person (core/rand) */
  if (NE && SIM.NEED) { var TR = Object.keys(NE.traits);
    mine.forEach(function (a) { a.trait = TR[KRAND.hash(T.seed, 67, a.k) % TR.length];
      a.nd = NE.list.map(function (n, i) { var r = NE.init[n]; return NE.rate[n] && r ? r[0] + (r[1] - r[0]) * KRAND.unit(KRAND.hash(T.seed, 68, a.k, i)) : 0; }); }); }
  var W = T.items.wealth, trades = {}, workers = 0;
  mine.forEach(function (a) {
    var H = SIM.R.place[a.home]; a.cls = H.cls || 'middle'; a.wealth = W[a.cls] == null ? 0.5 : W[a.cls];
    var P = a.work ? SIM.R.place[a.work] : null; a.job = P ? P.tags.trade || P.kind : null;
    if (a.status === 'employed') { workers++; trades[a.job] = (trades[a.job] || 0) + 1; }
  });
  out.posts = counts; out.workers = workers; out.trades = trades; out.ages = { children: kids, pupils: pupils, elders: elders, study: study, beds: beds };
  return out;
};
/* the households mixed: in each square of the town the people living in its houses (kind 'home') dealt round them again,
   the four kinds (employed, at home, children, elders) interleaved in their shares (the kind furthest behind its share
   next), houses filled to their beds in id order; -> {cells, people} */
ISLE.simMixHouseholds = function (s, mine) {
  var C = ISLE.TUNE.sim.mix.cell, cells = {}, kindOf = function (a) { return a.ageBand === 'child' ? 'child' : a.ageBand === 'elder' ? 'elder' : a.status === 'employed' ? 'employed' : 'home'; };
  mine.forEach(function (a) { var H = SIM.R.place[a.home]; if (H.kind !== 'home') return; var k = Math.floor(H.x / C) + ',' + Math.floor(H.z / C);
    var c = cells[k] || (cells[k] = { houses: {}, people: {} }); c.houses[H.id] = H; (c.people[kindOf(a)] || (c.people[kindOf(a)] = [])).push(a); });
  var moved = 0, n = 0;
  Object.keys(cells).sort().forEach(function (k) {
    var c = cells[k], houses = Object.keys(c.houses).sort().map(function (id) { return c.houses[id]; }), kinds = Object.keys(c.people).sort();
    kinds.forEach(function (g) { c.people[g].sort(function (p, q) { return p.k - q.k; }); });
    var N = kinds.reduce(function (t, g) { return t + c.people[g].length; }, 0), took = {}, order = [];
    for (var i = 0; i < N; i++) {
      var best = null, bd = -Infinity;
      kinds.forEach(function (g) { var L = c.people[g], t = took[g] || 0; if (t >= L.length) return; var d = L.length * (i + 1) / N - t; if (d > bd + 1e-9) { bd = d; best = g; } });
      order.push(c.people[best][took[best] || 0]); took[best] = (took[best] || 0) + 1;
    }
    var j = 0;
    houses.forEach(function (H) { for (var b = 0; b < H.activities.SLEEP && j < order.length; b++, j++) { if (order[j].home !== H.id) moved++; order[j].home = H.id; } });
    n += N;
  });
  /* a square too short of grown-ups can still leave a house of children alone: each such house swaps a child with a
     grown-up (one at home, else an elder, else a worker) of the nearest house that has two or more */
  var byHome = {}; mine.forEach(function (a) { var H = SIM.R.place[a.home]; if (H.kind === 'home') (byHome[a.home] || (byHome[a.home] = [])).push(a); });
  var grown = function (a) { return a.ageBand !== 'child'; }, swapped = 0;
  Object.keys(byHome).sort().forEach(function (id) {
    var L = byHome[id]; if (L.some(grown)) return; var H = SIM.R.place[id], best = null, bd = Infinity;
    Object.keys(byHome).forEach(function (j) { if (byHome[j].filter(grown).length < 2) return; var Q = SIM.R.place[j], d = Math.hypot(Q.x - H.x, Q.z - H.z); if (d < bd || (d === bd && j < best)) { bd = d; best = j; } });
    if (!best) return;
    var M = byHome[best], pick = M.filter(function (a) { return a.status === 'home'; })[0] || M.filter(function (a) { return a.ageBand === 'elder'; })[0] || M.filter(grown)[0], c = L[0];
    pick.home = id; c.home = best; L[0] = pick; M[M.indexOf(pick)] = c; swapped++;
  });
  return { cells: Object.keys(cells).length, people: n, moved: moved, swapped: swapped };
};
/* the town's breakdown */
ISLE.simDemography = function (s) {
  var A = SIM.all('actor').filter(function (a) { return !a.driven && SIM.settlementOf(a) === s && a.ageBand; }), out = { people: A.length, ages: {}, status: {}, byBand: {}, work: {}, households: {} };
  var inc = function (o, k) { o[k] = (o[k] || 0) + 1; };
  A.forEach(function (a) {
    inc(out.ages, a.ageBand); inc(out.status, a.status); var b = out.byBand[a.ageBand] || (out.byBand[a.ageBand] = {}); inc(b, a.status);
    if (a.status === 'employed') inc(out.work, SIM.R.role[a.role].name);
  });
  var mean = function (L) { return L.length ? Math.round(L.reduce(function (t, x) { return t + x; }, 0) / L.length * 10) / 10 : null; };
  out.meanAge = { child: mean(A.filter(function (a) { return a.ageBand === 'child'; }).map(function (a) { return a.age; })), adult: mean(A.filter(function (a) { return a.ageBand === 'adult'; }).map(function (a) { return a.age; })),
    elder: mean(A.filter(function (a) { return a.ageBand === 'elder'; }).map(function (a) { return a.age; })), all: mean(A.map(function (a) { return a.age; })) };
  var H = {}; A.forEach(function (a) { var h = H[a.home] || (H[a.home] = { n: 0, child: 0, employed: 0, elder: 0 }); h.n++; if (a.ageBand === 'child') h.child++; if (a.status === 'employed') h.employed++; if (a.ageBand === 'elder') h.elder++; });
  var hs = Object.keys(H).map(function (k) { return H[k]; });
  out.households = { n: hs.length, withChildren: hs.filter(function (h) { return h.child; }).length, withEmployed: hs.filter(function (h) { return h.employed; }).length,
    withElder: hs.filter(function (h) { return h.elder; }).length, noEarner: hs.filter(function (h) { return !h.employed; }).length, onlyChildren: hs.filter(function (h) { return h.child === h.n; }).length };
  out.employedShare = Math.round(100 * (out.status.employed || 0) / A.length);
  return out;
};
