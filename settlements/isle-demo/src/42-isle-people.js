/* ============================== 7c. THE PEOPLE: ROLES BY KIND OF WORK, DEALT PER TOWN (P7b) ============================== */
/* [G data] A town's people as core/simulation roles (SCHEMA.md "roles"), keyed to the town (`settlement`) and dealt by
   SIM.populate({settlement, prefix}) over the town's own beds, once a town (P7a: homes and work in one's own town):
     - a role for each kind of work (ISLE.TUNE.sim.jobs): its count the posts (WORK slots) its kinds of place offer in
       the town, so every post is filled; it lives in the houses (the soldiers in the barracks first) and works where
       the deal puts it: the nearest place of its kinds with a free post (core/simulation's `work.near`);
     - the kin (children, elders, those who keep the house): the `fill` role, every bed left (the residences' and the
       barracks' too: ISLE.TUNE.sim.homes).
   The census's people are the sim's: the beds are the households at five a household (40), so the town holds the
   census's citizens exactly. No slaves and no cantons (Voth's 44 is trimmed, not copied). Each actor then carries its
   home's class and wealth (the items' meals and eating out read them) and `job`, the census trade of its work place.
   Returns SIM.populate's report with the workers, the posts and the census trades worked. */
ISLE.simPeople = function (TS, places) {
  var T = ISLE.TUNE.sim, s = TS.id, org = s + '.folk', posts = {}, out;
  places.forEach(function (P) { if (P.activities.WORK) posts[P.kind] = (posts[P.kind] || 0) + P.activities.WORK; });
  var prefers = function () { return { SLEEP: { pin: 'home' }, EAT: { pin: 'home' }, REST: { pin: 'home' }, IDLE: { pin: 'home' }, WORK: { pin: 'work' } }; };
  var counts = {};
  Object.keys(T.jobs).forEach(function (j) {
    var J = T.jobs[j], n = J.kinds.reduce(function (a, k) { return a + (posts[k] || 0); }, 0); if (!n) return;
    counts[j] = n;
    SIM.role({ id: s + '.' + j, org: org, name: j, settlement: s, count: n, homes: (J.homes || ['home']).slice(), work: { kinds: J.kinds.slice(), act: 'WORK', near: true }, sched: T.sched[J.sched || 'work'], prefers: prefers() });
  });
  SIM.role({ id: s + '.kin', org: org, name: 'kin', settlement: s, fill: true, homes: T.homes.slice(), sched: T.sched.kin, prefers: prefers() });
  out = SIM.populate({ settlement: s, prefix: TS.prefix });
  var W = T.items.wealth, trades = {}, workers = 0;
  SIM.all('actor').forEach(function (a) {
    var H = SIM.R.place[a.home]; if (!H || H.settlement !== s || a.driven) return;
    a.cls = H.cls || 'middle'; a.wealth = W[a.cls] == null ? 0.5 : W[a.cls];
    var P = a.work ? SIM.R.place[a.work] : null; a.job = P ? P.tags.trade || P.kind : null;
    if (P) { workers++; trades[a.job] = (trades[a.job] || 0) + 1; }
  });
  out.posts = counts; out.workers = workers; out.trades = trades;
  return out;
};
