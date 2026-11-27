/* ================================================================= THE BEACON: the house's day and night, as data  [G data]
   settlements/beacon/PLAN.md section 7, step P3 (the owner, 2026-11-23: "have them build to stage 4"). *proposed* throughout:
   - THE LAMP WATCH (the lamp's night, 40-bc-lamp.js): its three keepers leave the monastery's gate at dusk, walk the Lamp
     Stair, pass the fort's gate and go into the plinth before the lamp is lit; they come down at dawn when it is put out.
   - THE KORA: six monks walk the kora round the Yellow Monastery, clockwise, three rounds and a rest, all day and evening.
   - THE NOVICES' ROUND: at dusk and dawn three novices carry the butter from the novices' range to the Butter Lamp House and
     back (the gold spoke's thousand lamps lit and trimmed with the lamp's).
   - THE OFFICES (P6): the Lamp School's six masters to the Yellow Monastery at dawn, noon and dusk, forty minutes in its hall.
   - THE OIL CARTS (P6): two ox carts on days 110 and 290 by the fort road and the Ward Gate to the Oil Pit; pitYear() keeps the
     pit's level over the year (the lamp's burn against the deliveries). The clock t runs over days: day = floor(t / 86400).
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
    novices: [[-168, -47.5], [-168, -30], [-72, -30], [-72, 30], [-89, 33]],
    /* the Lamp School's door (its west face) to the Yellow Monastery's gate, by the lane between the kora garden and the school and
       the kora's east leg */
    school: [[-153, 33.5], [-153, 29.5], [-74, 29.5], [-74, 4]],
    /* the oil carts: the fort road from the road's fork to the Ward Gate, and in to the Oil Pit's west side (PLAN.md section 4) */
    cart: [[-310, -40], [-250, -72], [-120, -72], [-60, -60], [-48.44, -44.64], [-56, -41.5]]
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
  /* the Lamp Watch: up from 17:40 (in the plinth before 18:00, when core/atmos's evening lights the lamp), down from 06:30 (the
     lamp out at about 06:21, the dawn half light) */
  const WATCH = { up: 17 * HR + 40 * 60, down: 6 * HR + 30 * 60, gap: 4 };
  /* the kora: three rounds, then a rest at the monastery's gate, a round every so many minutes; six walkers spread apart */
  const KORA = { n: 6, rounds: 3, rest: 20 * 60, from: 5.5 * HR, to: 21 * HR };
  /* the novices' round: out at 17:50 and back by 18:20; out at 05:40 and back by 06:10 */
  const NOVICES = { n: 3, times: [17 * HR + 50 * 60, 5 * HR + 40 * 60], stay: 10 * 60, gap: 3 };
  /* the offices: the Lamp School's masters go to the Yellow Monastery for dawn, noon and the dusk office before the lamp is lit,
     forty minutes in the assembly hall (the chapter lives in the monastery's own ranges and does not cross the precinct) */
  const OFFICE = { n: 6, hours: [5 * HR, 12 * HR, 17.5 * HR], stay: 40 * 60, gap: 3 };
  /* the oil carts: twice a year from the oil field (925,1598, about 240 km), two ox carts of 400 kg each, at the Ward Gate by
     11:00, two hours unloading at the Oil Pit, then home; the pit (3 m3, 2,500 kg) takes what it holds and the rest goes to the
     fort's stores */
  const CARTS = { n: 2, days: [110, 290], arrive: 11 * HR, unload: 2 * HR, kg: 800, cap: 2500, pace: 0.9, gap: 12 };

  const koraLen = length(ROUTES.kora), koraLap = koraLen / WALK, koraCycle = KORA.rounds * koraLap + KORA.rest;
  const koraSlots = K.slots(KORA.n, koraCycle, 10 / WALK);
  const koraLine = K.timeline({ period: koraCycle, segments: [{ dur: KORA.rounds * koraLap, from: 0, to: KORA.rounds * koraLen, ease: 'linear', name: 'walking' }, { dur: KORA.rest, from: KORA.rounds * koraLen, name: 'resting' }] });

  function walkers() {
    const out = [];
    for (let i = 0; i < 3; i++) out.push({ id: 'watch.' + i, group: 'watch', route: 'watch', k: i });
    for (let i = 0; i < KORA.n; i++) out.push({ id: 'kora.' + i, group: 'kora', route: 'kora', k: i, phase: koraSlots[i] });
    for (let i = 0; i < NOVICES.n; i++) out.push({ id: 'novice.' + i, group: 'novices', route: 'novices', k: i });
    for (let i = 0; i < OFFICE.n; i++) out.push({ id: 'school.' + i, group: 'school', route: 'school', k: i });
    for (let i = 0; i < CARTS.n; i++) out.push({ id: 'cart.' + i, group: 'carts', route: 'cart', k: i });
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
    if (w.group === 'school') {
      for (const t0 of OFFICE.hours) {
        const T = trip(r, tod, t0, OFFICE.stay, w.k * OFFICE.gap);
        if (T) { const p = along(r, T.s); if (T.back) p.heading += Math.PI; return Object.assign(p, { visible: !T.stay, where: T.stay ? 'at the office' : T.back ? 'going back to the school' : 'going to the office' }); }
      }
      const p = along(r, 0);
      return Object.assign(p, { visible: false, where: 'in the school' });
    }
    if (w.group === 'carts') {
      const day = ((Math.floor(t / DAY) % 365) + 365) % 365, L = length(r), d = L / CARTS.pace, x = tod - (CARTS.arrive - d) - w.k * CARTS.gap;
      if (CARTS.days.indexOf(day) >= 0) {
        if (x >= 0 && x <= d) { const p = along(r, x * CARTS.pace); return Object.assign(p, { visible: true, where: 'coming up the fort road' }); }
        if (x > d && x <= d + CARTS.unload) { const p = along(r, L); p.u += w.k * 4; return Object.assign(p, { visible: true, where: 'unloading at the oil pit' }); }   /* side by side at the pit */
        if (x > d + CARTS.unload && x <= 2 * d + CARTS.unload) { const p = along(r, L - (x - d - CARTS.unload) * CARTS.pace); p.heading += Math.PI; return Object.assign(p, { visible: true, where: 'going home' }); }
      }
      const p = along(r, 0);
      return Object.assign(p, { visible: false, where: 'away (the oil field)' });
    }
    for (const t0 of NOVICES.times) {
      const T = trip(r, tod, t0, NOVICES.stay, w.k * NOVICES.gap);
      if (T) { const p = along(r, T.s); if (T.back) p.heading += Math.PI; return Object.assign(p, { visible: !T.stay, where: T.stay ? 'trimming the lamps' : T.back ? 'going home' : 'carrying the butter' }); }
    }
    const p = along(r, 0);
    return Object.assign(p, { visible: false, where: 'in the range' });
  }

  /* the Oil Pit's year: the kg in it at each day's end over the third of three years (o.burn kg a day, the lamp's; o.start; o.days,
     o.kg, o.cap: the carts'), each delivery topped up to the cap: {min, max, levels} */
  function pitYear(o) {
    const days = o.days == null ? CARTS.days : o.days, kg = o.kg == null ? CARTS.kg : o.kg, cap = o.cap == null ? CARTS.cap : o.cap;
    let lv = o.start == null ? cap / 2 : o.start; const levels = [];
    for (let y = 0; y < 3; y++) for (let d = 0; d < 365; d++) {
      if (days.indexOf(d) >= 0) lv = Math.min(cap, lv + kg);
      lv -= o.burn;
      if (y === 2) levels.push(lv);
    }
    return { min: Math.min(...levels), max: Math.max(...levels), levels };
  }

  return { ROUTES, WATCH, KORA, NOVICES, OFFICE, CARTS, WALK, walkers, at, along, length, pitYear, koraLap, koraCycle };
})();
if (typeof module !== 'undefined') module.exports = BEACON_LIFE;
