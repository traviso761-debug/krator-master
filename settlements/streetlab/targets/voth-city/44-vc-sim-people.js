/* ============================== 5l. THE CITIZENS (phase C) ============================== */
/* [G data] The census's people as SIM actors (SIM-ROADMAP.md 2.4 item 2; the owner's Q1: every one a record). Each home
   place (42-vc-sim-places.js: a building with residents, a canton room with beds) makes its census residents; a share
   of them work (TUNE.census.workingShare; all of a barracks' or a dorm's, whose workplaces cover its residents), the
   rest are its dependants. The jobs are the places' workplaces, dealt (TUNE.sim.people):
     1. LIVE-IN: a home that is also a workplace fills its own posts first (a shop's family keeps the shop, the garrison
        its castle), but not the kinds of work that come in from outside (household service);
     2. A TRADE BY HOME (`liveAt`): a chinampa hut's workers grow the beds round it;
     3. SLAVES (the owner's Q5): `slaveShare` of the farm, mine and quarry workplaces, housed at the site, counted
        apart from the census (their quarters are not built: the report says so);
     4. THE DEAL: every other post to the nearest free workers by the walk on the pedestrian layer (43-vc-sim-nav.js),
        never past `walkMax`; `gentry` take only `gentryJobs` outside their own house, and those who find none live on
        their means (not counted out of work).
   Every actor carries its home, its work (or none), its class and wealth (the owner's Q6 recommendation, still open).
   VC.PEOPLE is the report: people by class, workers employed and not, posts filled and not by kind of work (with how
   they were filled), the commutes (metres walked, by class and kind of work); VC.simWalkSample checks them with A*.
   Schedules are a plain day for now (TUNE.sim.people.sched); the week, the rota and the shifts are session 2's. */
VC.PEOPLE = null;
/* motion seconds a world minute: the clock's day over 1440, times the motion's timeScale (55-vc-host.js: VC.motionT) */
VC.simSecPerMin = function () { return ((VC.clock && VC.clock.dayLength) || 4320) / 1440 * (TUNE.timeScale || 1); };

VC.simPeople = function () {
  if (typeof SIM === 'undefined' || !SIM.actor || !VC.PED || !VC.PED.comp) return null;
  var T = TUNE.sim.people, share = TUNE.census.workingShare, t0 = Date.now();
  if (!SIM.R.faction.voth) SIM.faction({ id: 'voth' });
  ['citizens', 'slaves'].forEach(function (o) { if (!SIM.R.org[o]) SIM.org({ id: o, faction: 'voth' }); });
  var WK = TUNE.sim.week, NE = TUNE.sim.needs;
  /* needs, happiness, efficiency, loyalty (phase C session 3: core/simulation 77-sim-6-needs.js) */
  if (NE && SIM.needs) SIM.needs({ list: NE.list, rate: NE.rate, fill: NE.fill, work: NE.work, weight: NE.weight, traits: NE.traits, free: NE.free, dwell: NE.dwell, jitter: NE.jitter, keep: NE.keep, done: NE.done,
                                   interrupt: NE.interrupt, bands: NE.bands, loyalty: NE.loyalty, pain: NE.pain, secPerMinute: VC.simSecPerMin() });
  var TRAITS = NE ? Object.keys(NE.traits) : [];
  /* a role's needs: its trade's labour and rates (the slaves' labour `slaveLabour`) */
  var needsOf = function (id) {
    if (!NE) return undefined;
    var job = id.replace(/^[ws]\./, '').replace(/\/night$/, ''), lab = /^s\./.test(id) ? NE.slaveLabour : NE.labour[job] || 0;
    var rate = NE.byTrade[job] || undefined; if (/^s\./.test(id)) rate = Object.assign({}, rate || {}, { material: 0 });   /* the slaves: no material need (the owner's Q5) */
    return { labour: lab, rate: rate };
  };
  /* a citizen's trait and starting meters, by a hash of its index (core/rand) */
  var temper = function (a, k) {
    if (!NE || !a) return;
    a.trait = TRAITS[KRAND.hash(4747, k, 1) % TRAITS.length];
    a.nd = NE.list.map(function (n, i) { var r = NE.init[n]; return NE.rate[n] && r ? r[0] + (r[1] - r[0]) * KRAND.unit(KRAND.hash(4747, k, 10 + i)) : 0; });
  };
  /* a role of a kind of work on a shift: its work, off and rest days (VC.simWeek), its week (essential kinds work the
     rest day), its pins (sleep and eat at home, work at work) */
  var roleOf = function (id, org, name, shift, essential) {
    if (!SIM.R.role[id]) {
      var S = VC.simWeek(shift), half = org === 'slaves' && WK.slaveRest === 'half' && shift, week = [];
      for (var d = 0; d < 7; d++) week.push(d === WK.rest && !essential ? (half ? 'half' : 'rest') : shift ? 'work' : 'day');
      var sc = shift ? { work: S.work, off: S.off, rest: S.rest } : { day: S.day, off: S.day, rest: S.rest };
      (S.services || []).forEach(function (sv, i) { sc['rest_' + i] = sv; });   /* the rest day with one of the services (an actor's alias picks it) */
      if (half) sc.half = VC.simWeek([shift[0], Math.round(shift[1] / 2)]).work;   /* the slaves' rest day: half the shift */
      SIM.role({ id: id, org: org, name: name, fallback: TUNE.sim.week.fallback, scheds: sc, week: week, shift: shift, essential: !!essential, needs: needsOf(id),
                 prefers: { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, IDLE: { pin: 'home' }, REST: { pin: 'home' }, RELAX: { pin: 'home' }, WORK: { pin: 'work' }, WORSHIP: { pin: 'home' } } });   /* WORSHIP at home where it has a shrine (a clan compound's), else the nearest */   /* RELAX at home (its chairs), SOCIALIZE out */
    }
    return id;
  };
  var shiftOf = function (job) { return WK.shifts[job] || WK.shifts.default; };
  var nightN = {}, isNight = function (job) { var N = WK.night[job]; if (!N) return false; var i = nightN[job] = (nightN[job] || 0) + 1; return Math.floor(i * N[0]) > Math.floor((i - 1) * N[0]); };
  var comp = function (Q) { return Q.navNode != null ? VC.PED.comp(Q.navNode) : -1; };
  var at = function (Q) { var d = Q.door || Q; return [d.x, d.z]; };
  /* ---- the homes and their people */
  var homes = [], places = SIM.all('place');
  places.forEach(function (P) {
    var u = P.unit != null ? VC.IX.units[P.unit] : null, res = 0, cls = 'other', kind = P.kind;
    if (u && u.residents) { res = u.residents; cls = u.cls; kind = u.site || u.cls; }
    else if (/^canton-/.test(P.kind) && P.activities.SLEEP) { res = P.activities.SLEEP; cls = 'canton'; if (!P.activities.IDLE) P.activities.IDLE = Math.round(res); }   /* they sit in their room */
    res = Math.round(res); if (res > 0) homes.push({ P: P, res: res, cls: cls, kind: kind, c: comp(P), xz: at(P) });
    if (res > 0 && (!P.activities.EAT || P.workplaces >= res)) P.mess = true;   /* fed by their institution (phase D: no food store of their own) */
    if (res > 0 && !P.activities.EAT) P.activities.EAT = res;   /* quarters with no kitchen (a canton's rooms, the monastery's dormitories) eat at their mess or refectory (phase C session 3: the Fortress is an island) */
  });
  var cum = 0, workers = [], deps = [];
  homes.forEach(function (H) {
    var w;
    if (H.P.workplaces >= H.res) w = H.res;                      /* a barracks, a dorm: everyone in it works there */
    else { var c0 = Math.round(cum * share); cum += H.res; w = Math.round(cum * share) - c0; }
    H.workers = w;
    for (var i = 0; i < H.res; i++) (i < w ? workers : deps).push({ H: H, job: null, work: null, how: null });
  });
  /* ---- the posts */
  var free = {}, jobPlaces = [];
  /* a place's posts are its workplaces rounded so that each kind of work's total is the census's (a jail cell's half a jailer) */
  var cumJ = {};
  places.forEach(function (P) { if (P.job && P.workplaces > 0) { var c0 = cumJ[P.job] || 0, c1 = c0 + P.workplaces; cumJ[P.job] = c1; free[P.id] = Math.round(c1) - Math.round(c0); P.posted = free[P.id]; if (free[P.id] > 0) jobPlaces.push(P); } });
  var take = function (wk, P, how) { wk.job = P.job; wk.work = P.id; wk.how = how; free[P.id]--; };
  var byHome = {}; workers.forEach(function (wk) { (byHome[wk.H.P.id] || (byHome[wk.H.P.id] = [])).push(wk); });
  var notLive = T.notLiveIn || [];
  /* 1. live-in */
  homes.forEach(function (H) {
    var P = H.P; if (!free[P.id] || notLive.indexOf(P.job) >= 0) return;
    (byHome[P.id] || []).forEach(function (wk) { if (free[P.id] > 0 && !wk.job) take(wk, P, 'live-in'); });
  });
  /* 2. a trade by home */
  Object.keys(T.liveAt).forEach(function (kind) {
    var job = T.liveAt[kind], L = jobPlaces.filter(function (P) { return P.job === job; });
    homes.forEach(function (H) {
      if (H.kind !== kind) return;
      (byHome[H.P.id] || []).forEach(function (wk) {
        if (wk.job) return; var P = null, bd = Infinity;
        L.forEach(function (Q) { if (free[Q.id] > 0) { var d = Math.hypot(Q.x - H.xz[0], Q.z - H.xz[1]); if (d < bd) { bd = d; P = Q; } } });
        if (P) { take(wk, P, 'trade of home'); wk.at = H.P.id; }
      });
    });
  });
  /* 3. slaves */
  var slaves = [];
  jobPlaces.forEach(function (P) {
    if (T.slaveJobs.indexOf(P.job) < 0) return;
    var n = Math.round(free[P.id] * T.slaveShare);
    for (var i = 0; i < n; i++) slaves.push({ P: P });
    free[P.id] -= n;
    if (n) { P.activities.SLEEP = (P.activities.SLEEP || 0) + n; P.activities.EAT = (P.activities.EAT || 0) + n; P.activities.DRINK = Math.max(P.activities.DRINK || 0, Math.ceil(n / 4)); P.quarters = n; P.mess = true; }   /* they sleep, are fed and watered at the site: quarters the plan has not built (the report says so) */
  });
  /* 4. the deal, by the walk: each round one search over the pedestrian layer from every place with a free post labels
     every node with its nearest one (SIM.nav.field), and each place takes the workers nearest it among those it labels;
     a worker whose nearest place filled waits for the next round; past `walkMax` (metres walked, stairs dearer) a worker
     finds nothing. The gentry search only the places of their kinds of work */
  var gentry = T.gentry, gj = T.gentryJobs, dealt = 0, rounds = 0, open = workers.filter(function (wk) { return !wk.job && wk.H.P.navNode != null; });
  open.forEach(function (wk) { wk.gen = gentry.indexOf(wk.H.cls) >= 0; });
  var src = function (gen) { var L = []; jobPlaces.forEach(function (P) { if (free[P.id] > 0 && P.navNode != null && (!gen || gj.indexOf(P.job) >= 0)) L.push(P); }); return L; };
  var perRound = [];
  for (; rounds < T.rounds && open.length; rounds++) {
    var made = 0, F = {}, S = {}, cand = {};
    [false, true].forEach(function (gen) {
      if (!open.some(function (wk) { return wk.gen === gen; })) return;
      S[gen] = src(gen); F[gen] = SIM.nav.field('pedestrian', S[gen].map(function (P) { return { node: P.navNode, d: P.navOff || 0 }; }), { max: T.walkMax });
    });
    open.forEach(function (wk) {
      var f = F[wk.gen], k = wk.H.P.navNode, si = f ? f.src[k] : -1;
      if (si < 0) { wk.none = true; return; }
      var P = S[wk.gen][si], d = f.d[k] + (wk.H.P.navOff || 0); if (d > T.walkMax) { wk.none = true; return; }
      (cand[P.id] || (cand[P.id] = [])).push([d, wk]);
    });
    Object.keys(cand).forEach(function (id) {
      var P = SIM.R.place[id]; cand[id].sort(function (a, b) { return a[0] - b[0]; });
      cand[id].forEach(function (c) { if (free[id] > 0) { take(c[1], P, 'dealt'); c[1].d = c[0]; dealt++; made++; } });
    });
    open = open.filter(function (wk) { return !wk.job && !wk.none; });
    perRound.push(made);
    if (!made) break;
  }
  /* ---- the actors */
  /* the week (owner's Q8): each worker's rota day off among the six workdays, dealt by its index */
  var made = 0, n = 0, rota = 0, offDay = function () { var d = rota++ % 6; return d >= WK.rest ? d + 1 : d; };
  /* the rest day's services (owner, 2026-10-12: "3 with half"): a share of everyone (TUNE.sim.worship.share) is dealt one
     of the services in turn, the rest keep the rest day at home */
  var WO = TUNE.sim.worship, ALIAS = WO.at.map(function (h, i) { return { rest: 'rest_' + i }; }), seen = 0, goers = 0;
  var service = function () { var i = seen++; if (Math.floor((i + 1) * WO.share) > Math.floor(i * WO.share)) return ALIAS[goers++ % ALIAS.length]; return undefined; };
  workers.forEach(function (wk) {
    var H = wk.H, idle = gentry.indexOf(H.cls) >= 0 ? roleOf('gentry', 'citizens', 'of independent means', null) : roleOf('unemployed', 'citizens', 'out of work', null), role = idle;
    if (wk.job) { var N = isNight(wk.job) ? WK.night[wk.job] : null; role = roleOf('w.' + wk.job + (N ? '/night' : ''), 'citizens', wk.job + (N ? ' (night)' : ''), N ? [N[1], N[2]] : shiftOf(wk.job), WK.essential.indexOf(wk.job) >= 0); }
    wk.a = SIM.actor({ id: 'c' + (n++), role: role, home: H.P.id, work: wk.work || undefined, cls: H.cls, wealth: T.wealth[H.cls] != null ? T.wealth[H.cls] : T.wealth.other, job: wk.job, how: wk.how, workAt: wk.at,
                       off: wk.job && WK.rota ? offDay() : undefined, alias: service() });
    temper(wk.a, n); made++;
  });
  deps.forEach(function (d) {
    var H = d.H, a = SIM.actor({ id: 'c' + (n++), role: roleOf('dependant', 'citizens', 'household', null), home: H.P.id, cls: H.cls, wealth: T.wealth[H.cls] != null ? T.wealth[H.cls] : T.wealth.other, alias: service() });
    temper(a, n); made++;
  });
  slaves.forEach(function (s, i) {
    s.a = SIM.actor({ id: 's' + i, role: roleOf('s.' + s.P.job, 'slaves', 'enslaved ' + s.P.job, WK.slaveShift, false), home: s.P.id, work: s.P.id, cls: 'slave', wealth: T.wealth.slave, job: s.P.job, how: 'slave', quarters: false,
                         off: WK.slaveRota ? offDay() : undefined });
    temper(s.a, 900000 + i);
  });
  /* ---- the report */
  var R = { citizens: made, census: PLAN.census ? PLAN.census.population : null, homes: homes.length, workers: workers.length, dependants: deps.length, slaves: slaves.length,
    quarters: jobPlaces.filter(function (P) { return P.quarters; }).length, floorSleepers: VC.IX.units.reduce(function (s, u) { return s + (u.floor || 0); }, 0),
    employed: 0, unemployed: 0, gentry: 0, noneInReach: 0, rounds: rounds, perRound: perRound.filter(function (v, i) { return i < 6 || i % 10 === 0 || i === perRound.length - 1; }), walkMax: T.walkMax, byClass: {}, byJob: {}, how: {}, unfilled: 0, unfilledByJob: {}, ms: 0 };
  var cls = function (k) { return R.byClass[k] || (R.byClass[k] = { people: 0, workers: 0, employed: 0, commute: [] }); };
  homes.forEach(function (H) { cls(H.cls).people += H.res; });
  workers.forEach(function (wk) {
    var C = cls(wk.H.cls); C.workers++;
    if (!wk.job) { if (gentry.indexOf(wk.H.cls) >= 0) { R.gentry++; C.gentry = (C.gentry || 0) + 1; } else { R.unemployed++; if (wk.none) R.noneInReach++; } return; }
    R.employed++; C.employed++; R.how[wk.how] = (R.how[wk.how] || 0) + 1;
    var J = R.byJob[wk.job] || (R.byJob[wk.job] = { posts: 0, filled: 0, how: {}, commute: [] });
    J.filled++; J.how[wk.how] = (J.how[wk.how] || 0) + 1;
    var d = wk.how === 'dealt' ? wk.d : 0;   /* metres walked (stairs dearer); live-in and a trade by home: none */
    J.commute.push(d); C.commute.push(d); wk.d = d;
  });
  slaves.forEach(function (s) { var J = R.byJob[s.P.job] || (R.byJob[s.P.job] = { posts: 0, filled: 0, how: {}, commute: [] }); J.filled++; J.how.slave = (J.how.slave || 0) + 1; });
  jobPlaces.forEach(function (P) {
    var J = R.byJob[P.job] || (R.byJob[P.job] = { posts: 0, filled: 0, how: {}, commute: [] }); J.posts += P.posted;
    if (free[P.id] > 0) { R.unfilled += free[P.id]; var U = R.unfilledByJob[P.job] || (R.unfilledByJob[P.job] = { posts: 0, places: 0, offBody: 0 }); U.posts += free[P.id]; U.places++; if (comp(P) !== VC.PED.main) U.offBody += free[P.id]; }
  });
  var stats = function (a) { if (!a.length) return null; var s = a.slice().sort(function (p, q) { return p - q; }), m = 0; s.forEach(function (v) { m += v; });
    return { n: s.length, mean: Math.round(m / s.length), p50: Math.round(s[s.length >> 1]), p90: Math.round(s[Math.floor(s.length * 0.9)]), max: Math.round(s[s.length - 1]) }; };
  Object.keys(R.byClass).forEach(function (k) { R.byClass[k].commute = stats(R.byClass[k].commute); });
  Object.keys(R.byJob).forEach(function (k) { R.byJob[k].commute = stats(R.byJob[k].commute); });
  R.commute = stats(workers.filter(function (wk) { return wk.job; }).map(function (wk) { return wk.d; }));
  /* where the out-of-work live, by district (worst first) */
  var dist = {}; workers.forEach(function (wk) { if (wk.job || gentry.indexOf(wk.H.cls) >= 0) return; var t = (wk.H.P.tags || [])[1] || wk.H.cls; dist[t] = (dist[t] || 0) + 1; });
  R.unemployedBy = Object.keys(dist).map(function (k) { return [k, dist[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
  R.ms = Date.now() - t0;
  if (SIM.placesChanged) SIM.placesChanged();   /* the slaves' quarters added SLEEP to their sites: the place grids rebuild */
  VC.PEOPLE = R;
  if (VC.simItems) VC.simItems();   /* 45-vc-sim-items.js: the shops, the households' stores, everyone's things (phase D) */
  if (VC.simEconomy) VC.simEconomy();   /* 46-vc-sim-economy.js: the producers, the warehouses, the carts, the imports (phase E) */
  return R;
};

/* a check of the deal against the router: a fixed sample of the dealt workers routed home door to work door by A*
   (SIM.nav.route); its length against the deal's walk (the field's: they agree but for the stairs' price). Run on demand
   (the report panel, verify.py): about a second */
VC.simWalkSample = function (n) {
  var A = SIM.all('actor').filter(function (a) { return a.how === 'dealt'; }), k = Math.max(1, Math.floor(A.length / (n || TUNE.sim.people.sample))), ok = 0, fail = 0, off = [], walk = [], fails = {}, t1 = Date.now();
  for (var i = 0; i < A.length; i += k) {
    var a = A[i], H = SIM.R.place[a.home], P = SIM.R.place[a.work], r = SIM.nav.route('pedestrian', H.door, P.door);
    if (!r) { fail++; var fk = H.kind + ' to ' + P.kind; fails[fk] = (fails[fk] || 0) + 1; continue; }
    ok++; walk.push(r.len);
  }
  var s = walk.slice().sort(function (p, q) { return p - q; });
  return { routes: ok + fail, ok: ok, fail: fail, fails: fails, p50: Math.round(s[s.length >> 1] || 0), p90: Math.round(s[Math.floor(s.length * 0.9)] || 0), ms: Date.now() - t1 };
};

/* a check of the actors' wiring (roles, pins, the layer): a fixed sample asked at an hour what they want and where they
   go (SIM.decide), then put back as they were (no reservation kept). A worker at 8 should choose its work place; anyone
   at 2 its home. Returns how many chose as their role pins, how many could not be routed, the decisions' cost */
VC.simDecideSample = function (n, hour) {
  var A = SIM.all('actor').filter(function (a) { return !a.driven; }), k = Math.max(1, Math.floor(A.length / (n || 200))), out = { asked: 0, chose: 0, pinned: 0, wrong: 0, failed: 0, none: 0, wrongList: [], ms: 0 }, t0 = Date.now();
  var minute = (SIM.host.day() | 0) * 1440 + hour * 60, t = SIM.time();
  for (var i = 0; i < A.length; i += k) {
    var a = A[i], want = SIM.desire(a, minute), pin = want === 'WORK' ? a.work : want === 'SLEEP' ? a.home : null;
    out.asked++;
    var P = SIM.decide(a, minute, t);
    if (!P) out.none++;
    else { out.chose++; if (pin) { if (P.id === pin) out.pinned++; else { out.wrong++; if (out.wrongList.length < 8) out.wrongList.push([a.id, a.role, want, pin, P.id]); } } if (a.task && a.task.failed) out.failed++; }
    SIM.release(a); a.task = null; a.place = null; a.activity = null; a.wanted = null; a.since = null; a.mem = {}; a.bad = {};
  }
  out.ms = Date.now() - t0;
  return out;
};

/* a shift's days as 24-hour schedules: `work` (8 hours' sleep ending an hour before the shift, a meal then, the shift,
   a meal, the rest free: SOCIALIZE, RELAX from TUNE.sim.week.relaxFrom), `off` (the same sleep, the day free, meals at
   the wake hour, 13 and 19), `rest` (the off day with WORSHIP at TUNE.sim.week.worship); with no shift (dependants,
   the gentry, the out of work) `day` is TUNE.sim.people.sched.dependant and `rest` it with the worship */
VC.simWeek = function (shift) {
  var W = TUNE.sim.week, h = function (v) { return ((v % 24) + 24) % 24; };
  var free = function (a, from) { for (var k = 0; k < 24; k++) if (a[k] === 'FREE') a[k] = (k >= W.relaxFrom || k < 4) ? 'RELAX' : 'SOCIALIZE'; return a; };
  var base = function (s) { var a = []; for (var k = 0; k < 24; k++) a.push('FREE'); for (var q = 0; q < 8; q++) a[h(s - 9 + q)] = 'SLEEP'; a[h(s - 1)] = 'EAT'; return a; };
  var out = {};
  if (shift) {
    var s = shift[0], n = shift[1], w = base(s); for (var i = 0; i < n; i++) w[h(s + i)] = 'WORK'; if (w[h(s + n)] === 'FREE') w[h(s + n)] = 'EAT';
    var o = base(s); [13, 19].forEach(function (k) { if (o[k] === 'FREE') o[k] = 'EAT'; });
    out.work = free(w); out.off = free(o.slice()); out.rest = free(o.slice());
    out.services = TUNE.sim.worship.at.map(function (sh) { var r = o.slice(); for (var q = 0; q < 24; q++) { var k = (sh + q) % 24; if (r[k] === 'FREE') { r[k] = 'WORSHIP'; break; } } return free(r); });
  } else {
    var d = SIM.sched(TUNE.sim.people.sched.dependant); out.day = d; out.rest = d.slice();
    out.services = TUNE.sim.worship.at.map(function (sh) { var r = d.slice(); for (var q = 0; q < 24; q++) { var k = (sh + q) % 24; if (r[k] !== 'SLEEP' && r[k] !== 'EAT') { r[k] = 'WORSHIP'; break; } } return r; });
  }
  return out;
};

/* the rest day's worship, sized (owner, 2026-10-12: "how many more temples and shrines would we need"): who wants to
   worship at the rest day's worship hour, the room the shrines, chapels, the funerary temple, the canton shrine rooms
   and the parks' shrines give at once (their ground floor at TUNE.sim.worship.m2 each), and for each way of holding it
   (TUNE.sim.worship.services x attend) how many more of an average shrine, and of the city's largest worship place,
   would hold the rest. The Temple canton's interior (the owner's references) is not counted yet */
VC.simWorshipNeed = function () {
  var W = TUNE.sim.week, Wo = TUNE.sim.worship, want = 0, room = 0, byKind = {}, sizes = [], hour = Wo.at[0], perService = {};
  /* the busiest service: the most who want to worship at once */
  Wo.at.forEach(function (h) { var m = W.rest * 1440 + h * 60, n = 0; SIM.all('actor').forEach(function (a) { if (a.present && SIM.desire(a, m) === 'WORSHIP') n++; }); perService[h] = n; if (n > want) { want = n; hour = h; } });
  SIM.all('place').forEach(function (P) { var n = SIM.offers(P, 'WORSHIP'); if (!n || P.access === 'private') return; room += n; var k = byKind[P.kind] || (byKind[P.kind] = { places: 0, room: 0 }); k.places++; k.room += n;
    if (/^(shrine|canton-shrine|chapel|funerary)$/.test(P.kind)) sizes.push(n); });
  sizes.sort(function (a, b) { return a - b; });
  var shrine = byKind.shrine ? Math.round(byKind.shrine.room / byKind.shrine.places) : 0, big = sizes.length ? sizes[sizes.length - 1] : 0, opts = [];
  var allWant = 0; Object.keys(perService).forEach(function (h) { allWant += perService[h]; });
  Wo.services.forEach(function (sv) { Wo.attend.forEach(function (at) { var need = Math.ceil(allWant / Wo.share * at / sv), short = Math.max(0, need - room);
    opts.push({ services: sv, attend: at, atOnce: need, short: short, shrines: shrine ? Math.ceil(short / shrine) : null, largest: big ? Math.ceil(short / big) : null }); }); });
  return { hour: hour, want: want, perService: perService, allWant: allWant, room: room, short: Math.max(0, want - room), byKind: byKind, shrineRoom: shrine, largestRoom: big, options: opts };
};

/* the census of needs (SIM-ROADMAP.md 2.4 item 6): everyone, by class, by kind of work (the dependants 'household'),
   the efficiency of those at work now by kind of work, and the deficits named: for each need the districts where most
   have it at TUNE.sim.needs.high or more (by home), and the free-time places full now (by kind and activity) */
VC.simNeedsReport = function (minute) {
  if (typeof SIM === 'undefined' || !SIM.NEED) return null;
  var NE = TUNE.sim.needs, o = { minute: minute, high: NE.high };
  var district = function (a) { var H = SIM.R.place[a.home]; return H ? ((H.tags || [])[1] || (H.tags || [])[0] || H.kind) : 'none'; };
  var out = { all: SIM.needsCensus(null, o).all, byClass: SIM.needsCensus(function (a) { return a.cls || 'other'; }, o),
              byTrade: SIM.needsCensus(function (a) { return a.job || 'household'; }, o),
              atWork: SIM.needsCensus(function (a) { return a.activity === 'WORK' && a.task && SIM.time() >= a.task.arrive ? a.job || 'other' : null; }, o) };
  var byD = SIM.needsCensus(district, o);
  out.deficits = {};
  NE.list.forEach(function (n) {
    var L = Object.keys(byD).map(function (k) { return [k, byD[k].high[n], byD[k].n]; }).filter(function (x) { return x[1] > 0; }).sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
    var tot = L.reduce(function (s, x) { return s + x[1]; }, 0); if (tot) out.deficits[n] = { n: tot, where: L.slice(0, 5) };
  });
  var full = {};
  SIM.all('place').forEach(function (P) {
    if (P.access === 'private') return;
    NE.free.forEach(function (act) { var c = SIM.offers(P, act); if (c > 0 && SIM.free(P, act) <= 0) { var k = P.kind + ' ' + act; full[k] = (full[k] || 0) + 1; } });
  });
  out.full = Object.keys(full).map(function (k) { return [k, full[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
  return out;
};
