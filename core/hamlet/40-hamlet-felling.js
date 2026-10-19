/* ==================== core/hamlet 40: felling and regrowth on the world clock (plain data, [G data]) ==================== */
/* core/hamlet/PLAN.md section 2 (owner, 2026-10-18): timber is effectively infinite for now: a felled tree regrows in one
   game year (core/clock's world days: one day is 72 real minutes). A lumber village fells its stand's trees in a fixed
   order (nearest its sawpit first) at a steady rate; a tree is a stump for a while, then a sapling, then whole again, and
   the order comes round again. The state of a tree is a pure function of the world day, so no felling is stored: the
   deltas are what the function says at the hour (kept only while the game runs, owner 2026-10-18), and Godot reads the
   same function.
     KHAMLET.FELL                      the tunables: regrowDays (365), stumpDays (20), treesPerWorkerDay
     KHAMLET.fellSchedule(n, workers, o) -> {n, rate (trees a day), cycle (days), regrowDays, stumpDays, start}
                                       cycle: the days from one felling of a tree to its next; never under the regrowth
                                       (the cutters wait for the stand to grow back). start: the day this round began, half a
                                       round before day 0, so a world opens on fresh stumps, saplings and grown trees
     KHAMLET.fellState(S, k, day)      tree k's state on a world day (day + hour / 24): 'gone' (a stump), 'young' (its
                                       sapling) or null (standing)
     KHAMLET.standOrder(trees, at)     the felling order: by distance from the works `at` [x, z], then by the tree's own
                                       id (its placement hash), so the order never depends on what was loaded first */
KHAMLET.FELL = {regrowDays: 365, stumpDays: 20, treesPerWorkerDay: 0.1};
KHAMLET.fellSchedule = function (n, workers, o) {
  o = o || {};
  var F = KHAMLET.FELL, regrow = o.regrowDays == null ? F.regrowDays : o.regrowDays, stump = o.stumpDays == null ? F.stumpDays : o.stumpDays;
  var rate = Math.max(1e-6, (workers || 0) * (o.treesPerWorkerDay == null ? F.treesPerWorkerDay : o.treesPerWorkerDay));
  var cycle = Math.max(n / rate, regrow + stump);
  return {n: n, rate: rate, cycle: cycle, regrowDays: regrow, stumpDays: Math.min(stump, regrow), start: -n / rate / 2};
};
KHAMLET.fellState = function (S, k, day) {
  if (!(k >= 0 && k < S.n)) return null;
  var tk = S.start + k / S.rate;
  var ph = ((day - tk) % S.cycle + S.cycle) % S.cycle;     /* the order has always been running: the past repeats every cycle */
  if (ph < S.stumpDays) return 'gone';
  if (ph < S.regrowDays) return 'young';
  return null;
};
KHAMLET.standOrder = function (trees, at) {
  return trees.map(function (t) { return {t: t, d: Math.hypot(t.x - at[0], t.z - at[1])}; })
    .sort(function (a, b) { return a.d - b.d || (a.t.id > b.t.id ? 1 : a.t.id < b.t.id ? -1 : 0); })
    .map(function (q) { return q.t; });
};
