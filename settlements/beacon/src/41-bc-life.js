/* ================================================================= THE BEACON: the house's day and night, as data  [G data]
   settlements/beacon/PLAN.md section 7, step P3 (the owner, 2026-11-23: "have them build to stage 4"). *proposed* throughout:
   - THE LAMP WATCH (the lamp's night, 40-bc-lamp.js): its three keepers leave the monastery's gate at dusk, walk the Lamp
     Stair, pass the fort's gate and go into the plinth before the lamp is lit; they come down at dawn when it is put out.
   - THE KORA: six monks walk the kora round the Yellow Monastery, clockwise, three rounds and a rest, all day and evening.
   - THE NOVICES' ROUND: at dusk and dawn three novices carry the butter from the novices' range to the Butter Lamp House and
     back (the gold spoke's thousand lamps lit and trimmed with the lamp's).
   Pure functions of a clock t (seconds) on core/sched (KSCHED), in the layout's frame [u, v]: the page, the tests, the sim and
   Godot read the same walkers. No THREE, no DOM, no randomness.

     BEACON_LIFE.ROUTES                 {watch, kora, novices}: polylines [[u, v], ...]
     BEACON_LIFE.walkers()              [{id, group, route, ...}]
     BEACON_LIFE.at(walker, t)          -> {u, v, heading (rad, 0 toward +u), visible, where}
     BEACON_LIFE.along(route, s)        -> the point s metres along a route
     BEACON_LIFE.length(route)          -> its length */
const BEACON_LIFE = (function () {
  'use strict';
  const K = typeof KSCHED !== 'undefined' ? KSCHED : (typeof require !== 'undefined' ? (require('../../../core/sched/20-core-sched.js'), globalThis.KSCHED) : null);
  if (!K) throw new Error('BEACON_LIFE needs core/sched (KSCHED)');
  const DAY = 86400, HR = 3600;

  /* the routes, in the layout's frame (30-bc-layout.js): u south, v east, the lamp at 0,0 */
  const ROUTES = {
    /* from the monastery's gate south through the Gate of the Lamp, up the Lamp Stair, across the plaza, through the fort's gate
       to the plinth's door (the keep's front face, 6 m north of the lamp), round the fort's cistern before the door */
    watch: [[-76, 0], [-68, 0], [-65, 0], [-40, 0], [-33, 0], [-27.6, 0], [-14, 0], [-11, 2.2], [-7.6, 2.2], [-6.4, 0]],
    /* the kora round the monastery block from its gate (south), clockwise seen from above, west first: the layout's kora.path */
    kora: [[-72, 0], [-72, -30], [-130, -30], [-130, 30], [-72, 30], [-72, 0]],
    /* the novices' range's door to the Butter Lamp House's door, by the west lane, the kora's south leg and the east lane */
    novices: [[-168, -47.5], [-168, -30], [-72, -30], [-72, 30], [-89, 33]]
  };
  const length = r => { let s = 0; for (let i = 0; i + 1 < r.length; i++) s += Math.hypot(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]); return s; };
  function along(r, s) {
    let acc = 0;
    for (let i = 0; i + 1 < r.length; i++) {
      const a = r[i], b = r[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (s <= acc + L || i + 2 === r.length) { const f = L ? Math.max(0, Math.min(1, (s - acc) / L)) : 0; return { u: a[0] + (b[0] - a[0]) * f, v: a[1] + (b[1] - a[1]) * f, heading: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
      acc += L;
    }
    return { u: r[r.length - 1][0], v: r[r.length - 1][1], heading: 0 };
  }

  const WALK = 1.1;   /* m a second, a monk's pace on the stair and the kora */
  /* the Lamp Watch: up from 17:40 (in the plinth before 18:00, the lamp's dusk), down from 06:00 (the lamp out) */
  const WATCH = { up: 17 * HR + 40 * 60, down: 6 * HR, gap: 4 };
  /* the kora: three rounds, then a rest at the monastery's gate, a round every so many minutes; six walkers spread apart */
  const KORA = { n: 6, rounds: 3, rest: 20 * 60, from: 5.5 * HR, to: 21 * HR };
  /* the novices' round: out at 17:50 and back by 18:20; out at 05:40 and back by 06:10 */
  const NOVICES = { n: 3, times: [17 * HR + 50 * 60, 5 * HR + 40 * 60], stay: 10 * 60, gap: 3 };

  const koraLen = length(ROUTES.kora), koraLap = koraLen / WALK, koraCycle = KORA.rounds * koraLap + KORA.rest;
  const koraSlots = K.slots(KORA.n, koraCycle, 10 / WALK);
  const koraLine = K.timeline({ period: koraCycle, segments: [{ dur: KORA.rounds * koraLap, from: 0, to: KORA.rounds * koraLen, ease: 'linear', name: 'walking' }, { dur: KORA.rest, from: KORA.rounds * koraLen, name: 'resting' }] });

  function walkers() {
    const out = [];
    for (let i = 0; i < 3; i++) out.push({ id: 'watch.' + i, group: 'watch', route: 'watch', k: i });
    for (let i = 0; i < KORA.n; i++) out.push({ id: 'kora.' + i, group: 'kora', route: 'kora', k: i, phase: koraSlots[i] });
    for (let i = 0; i < NOVICES.n; i++) out.push({ id: 'novice.' + i, group: 'novices', route: 'novices', k: i });
    return out;
  }

  /* a walk out and back along a route: out from t0, a stay at the far end, back; s the distance along the route (null: at home) */
  function trip(r, t, t0, stay, lag) {
    const L = length(r), d = L / WALK, x = t - t0 - lag;
    if (x < 0 || x > 2 * d + stay) return null;
    if (x <= d) return { s: x * WALK, back: false };
    if (x <= d + stay) return { s: L, back: false, stay: true };
    return { s: L - (x - d - stay) * WALK, back: true };
  }

  function at(w, t) {
    const r = ROUTES[w.route], tod = ((t % DAY) + DAY) % DAY;
    if (w.group === 'watch') {
      const L = length(r), d = L / WALK, lag = w.k * WATCH.gap;
      const up = tod - WATCH.up - lag, down = tod - WATCH.down - lag;
      if (up >= 0 && up <= d) { const p = along(r, up * WALK); return Object.assign(p, { visible: true, where: 'going up' }); }
      if (down >= 0 && down <= d) { const p = along(r, L - down * WALK); return Object.assign(p, { heading: p.heading + Math.PI, visible: true, where: 'coming down' }); }
      const inPlinth = tod > WATCH.up + lag + d || tod < WATCH.down + lag;
      const p = along(r, inPlinth ? L : 0);
      return Object.assign(p, { visible: false, where: inPlinth ? 'in the plinth' : 'in the monastery' });
    }
    if (w.group === 'kora') {
      if (tod < KORA.from || tod > KORA.to) { const p = along(r, 0); return Object.assign(p, { visible: false, where: 'in the cells' }); }
      const S = koraLine.at(tod + w.phase), s = S.value % koraLen, p = along(r, s);
      if (S.name === 'resting') { p.v += (w.k - (KORA.n - 1) / 2) * 1.4; p.heading = Math.PI; }   /* along the gate's front, facing it */
      return Object.assign(p, { visible: true, where: S.name === 'resting' ? 'resting at the gate' : 'walking the kora' });
    }
    for (const t0 of NOVICES.times) {
      const T = trip(r, tod, t0, NOVICES.stay, w.k * NOVICES.gap);
      if (T) { const p = along(r, T.s); if (T.back) p.heading += Math.PI; return Object.assign(p, { visible: !T.stay, where: T.stay ? 'trimming the lamps' : T.back ? 'going home' : 'carrying the butter' }); }
    }
    const p = along(r, 0);
    return Object.assign(p, { visible: false, where: 'in the range' });
  }

  return { ROUTES, WATCH, KORA, NOVICES, WALK, walkers, at, along, length, koraLap, koraCycle };
})();
if (typeof module !== 'undefined') module.exports = BEACON_LIFE;
