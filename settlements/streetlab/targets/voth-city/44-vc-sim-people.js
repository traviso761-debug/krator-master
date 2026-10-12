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

VC.simPeople = function () {
  if (typeof SIM === 'undefined' || !SIM.actor || !VC.PED || !VC.PED.comp) return null;
  var T = TUNE.sim.people, share = TUNE.census.workingShare, t0 = Date.now();
  if (!SIM.R.faction.voth) SIM.faction({ id: 'voth' });
  ['citizens', 'slaves'].forEach(function (o) { if (!SIM.R.org[o]) SIM.org({ id: o, faction: 'voth' }); });
  var roleOf = function (id, org, sched, name, pin) {
    if (!SIM.R.role[id]) SIM.role({ id: id, org: org, name: name, sched: sched, prefers: pin });
    return id;
  };
  var pinBoth = { SLEEP: { pin: 'home' }, WORK: { pin: 'work' } };
  var comp = function (Q) { return Q.navNode != null ? VC.PED.comp(Q.navNode) : -1; };
  var at = function (Q) { var d = Q.door || Q; return [d.x, d.z]; };
  /* ---- the homes and their people */
  var homes = [], places = SIM.all('place');
  places.forEach(function (P) {
    var u = P.unit != null ? VC.IX.units[P.unit] : null, res = 0, cls = 'other', kind = P.kind;
    if (u && u.residents) { res = u.residents; cls = u.cls; kind = u.site || u.cls; }
    else if (/^canton-/.test(P.kind) && P.activities.SLEEP) { res = P.activities.SLEEP; cls = 'canton'; }
    res = Math.round(res); if (res > 0) homes.push({ P: P, res: res, cls: cls, kind: kind, c: comp(P), xz: at(P) });
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
    if (n) { P.activities.SLEEP = (P.activities.SLEEP || 0) + n; P.quarters = n; }   /* they sleep at the site: quarters the plan has not built (the report says so) */
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
  var made = 0, n = 0;
  workers.forEach(function (wk) {
    var H = wk.H, idle = gentry.indexOf(H.cls) >= 0 ? roleOf('gentry', 'citizens', T.sched.dependant, 'of independent means', { SLEEP: { pin: 'home' } }) : roleOf('unemployed', 'citizens', T.sched.dependant, 'out of work', { SLEEP: { pin: 'home' } });
    var role = wk.job ? roleOf('w.' + wk.job, 'citizens', T.sched.worker, wk.job, pinBoth) : idle;
    wk.a = SIM.actor({ id: 'c' + (n++), role: role, home: H.P.id, work: wk.work || undefined, cls: H.cls, wealth: T.wealth[H.cls] != null ? T.wealth[H.cls] : T.wealth.other, job: wk.job, how: wk.how, workAt: wk.at });
    made++;
  });
  deps.forEach(function (d) {
    var H = d.H; SIM.actor({ id: 'c' + (n++), role: roleOf('dependant', 'citizens', T.sched.dependant, 'household', { SLEEP: { pin: 'home' } }), home: H.P.id, cls: H.cls, wealth: T.wealth[H.cls] != null ? T.wealth[H.cls] : T.wealth.other });
    made++;
  });
  slaves.forEach(function (s, i) {
    s.a = SIM.actor({ id: 's' + i, role: roleOf('s.' + s.P.job, 'slaves', T.sched.slave, 'enslaved ' + s.P.job, pinBoth), home: s.P.id, work: s.P.id, cls: 'slave', wealth: T.wealth.slave, job: s.P.job, how: 'slave', quarters: false });
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
  VC.PEOPLE = R;
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
  var A = SIM.all('actor'), k = Math.max(1, Math.floor(A.length / (n || 200))), out = { asked: 0, chose: 0, pinned: 0, wrong: 0, failed: 0, none: 0, wrongList: [], ms: 0 }, t0 = Date.now();
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
