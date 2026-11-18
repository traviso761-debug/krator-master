/* ================================================================= THE FLASHING EYE: the vent, the Rim Watch and the line, as data  [G data]
   settlements/flashing-eye/PLAN.md sections 1.2 and 2.4. The owner, 2026-11-16: the vent flashes (Strombolian bursts, red at
   night); the Eye keeps the council's mirror line by day and is the relay between the Beacon and the capital. Everything else
   is *proposed*: the burst rhythm, the watch's turns, the hours of the line and the fire basket's slots.

   Pure functions of a clock t (seconds; day d is t / 86400) and what the host tells it (`env`), on core/sched (KSCHED) and
   core/rand (KRAND): the page, a test, the sim and Godot read the same mountain and the same watch. No THREE, no DOM.

     FE_WATCH.vent(t) -> {amp (0..1: the burst's light), ash (0..1: the puff's cloud), on (bool), index (the burst's number),
        next (s to the next burst), since (s since the last)}   a burst every 10-20 minutes: one in each 15-minute window, at a
        hashed offset in its first five (KRAND.hash(seed, window)), so two bursts are 10 to 20 minutes apart
     FE_WATCH.bursts(t0, t1) -> [start, ...]   the bursts' starts in [t0, t1)
     FE_WATCH.state(t, env) -> {mode, station, bearing, shutter, kora, watch}
        env (all optional but `day`):
          day(t)     -> bool           sunrise to sunset (core/atmos's sun)
          clear(t)   -> bool           the air clear enough to read a mirror (default true)
          station(t) -> bool           the Station passes overhead tonight: the professed walk the Open Kora
          message(hour, stationId) -> [[row, col], ...]   that hour's message (default the station's call sign)
        mode: 'opening' (sunrise: the first mirror to the Beacon, then Erehwon) | 'mirror' (the day line's slots on the hour) |
              'closing' (sunset: the day's breaths written; no signal) | 'basket' (the night: the fire basket's slots after the
              Beacon's signal hour) | 'watch' (the post keeps watch, the shutter shut)
     FE_WATCH.flashes(syllables) / FE_WATCH.read(pulses)   the grid code (one signal book for the day and the night: the same
        code as the Beacon's lamp, settlements/beacon/src/40-bc-lamp.js; test-watch.js checks they agree)
     FE_WATCH.watch(d) -> {watch (0..5), monks [4 ids], awake [2 ids], shift}   the Rim Watch: 24 monks in six watches of four;
        each watch keeps the rim a week in turn (the hut's four bunks), two awake at a time in six-hour turns */
const FE_WATCH = (function () {
  'use strict';
  const K = typeof KSCHED !== 'undefined' ? KSCHED : (typeof require !== 'undefined' ? (require('../../../core/sched/20-core-sched.js'), globalThis.KSCHED) : null);
  const R = typeof KRAND !== 'undefined' ? KRAND : (typeof require !== 'undefined' ? (require('../../../core/rand/08-core-rand.js'), globalThis.KRAND) : null);
  if (!K || !R) throw new Error('FE_WATCH needs core/sched (KSCHED) and core/rand (KRAND)');

  /* ---- the vent: one burst in each WINDOW s, at a hashed offset in its first JITTER s */
  const SEED = R.child(34400, 'flashing-eye.vent'), WINDOW = 900, JITTER = 300, FLASH = 8, RISE = 0.8, ASH = 90;
  const startOf = w => w * WINDOW + R.unit(R.hash(SEED, w)) * JITTER;
  function bursts(t0, t1) {
    const out = [];
    for (let w = Math.floor(t0 / WINDOW) - 1; w * WINDOW < t1; w++) { const s = startOf(w); if (s >= t0 && s < t1) out.push(s); }
    return out;
  }
  function vent(t) {
    let w = Math.floor(t / WINDOW), s = startOf(w);
    if (s > t) { w--; s = startOf(w); }
    const since = t - s, n1 = startOf(w + 1);
    const amp = since < RISE ? since / RISE : since < FLASH ? Math.exp(-(since - RISE) / 2.2) : 0;
    const ash = since < ASH ? K.ease.smooth(Math.min(1, since / 6)) * (1 - K.ease.smooth(since / ASH)) : 0;
    return { amp, ash, on: since < FLASH, index: w, next: n1 - t, since };
  }

  /* ---- the grid code: the Beacon's (row flashes, a pause, column flashes); a mirror's beat is the same as the lamp's */
  const CODE = { beat: 0.6, gap: 1.8, sep: 3.6 };
  function flashes(syl) {
    const out = [];
    syl.forEach(([r, c], i) => {
      if (i) out.push([false, CODE.sep]);
      for (let k = 0; k < r; k++) { out.push([true, CODE.beat]); if (k < r - 1) out.push([false, CODE.beat]); }
      out.push([false, CODE.gap]);
      for (let k = 0; k < c; k++) { out.push([true, CODE.beat]); if (k < c - 1) out.push([false, CODE.beat]); }
    });
    return out;
  }
  function read(pulses) {
    const out = []; let r = 0, c = 0, inCol = false;
    pulses.forEach(([on, d]) => {
      if (on) { if (inCol) c++; else r++; return; }
      if (d >= CODE.sep - 1e-9) { out.push([r, c]); r = 0; c = 0; inCol = false; }
      else if (d >= CODE.gap - 1e-9) inCol = true;
    });
    if (r || c) out.push([r, c]);
    return out;
  }
  const length = p => p.reduce((s, x) => s + x[1], 0);
  const shutterAt = (p, u) => { let a = 0; for (let i = 0; i < p.length; i++) { a += p[i][1]; if (u < a) return p[i][0]; } return false; };

  /* ---- the stations, from the Eye Post (30-fe-layout.js sights.post): by day the mirror sends to each in turn from the top of
     the hour; by night the fire basket answers the Beacon (through its Rim Post) and calls Erehwon after the Beacon's signal
     hour (its five slots of 150 s: settlements/beacon/src/40-bc-lamp.js), so the two lights never speak over each other */
  const DAY = [
    { id: 'beacon', name: 'the Beacon', bearing: 243, call: [[2, 4], [8, 1]] },
    { id: 'erehwon', name: 'Erehwon (the capital)', bearing: 283, call: [[5, 5], [1, 8]] },
    { id: 'rimpost', name: 'the Beacon\'s Rim Post', bearing: 257, call: [[1, 1], [8, 2]] },
    { id: 'tears', name: 'the Golden Tears\' camp', bearing: 197, call: [[4, 2], [5, 5]] }];
  const NIGHT = [DAY[2], DAY[1]];
  const SLOT = 150, DAY_LINE = DAY.length * SLOT, NIGHT_FROM = 750, NIGHT_LINE = NIGHT_FROM + NIGHT.length * SLOT;
  const OPENING = 600, CLOSING = 900;

  /* ---- the Rim Watch: six watches of four (24 monks, ids 0-23); watch w keeps the rim in week w mod 6 */
  const WATCHES = 6, PER = 4, WEEK = 7;
  function watch(d) {
    const w = Math.floor(d / WEEK) % WATCHES, monks = [0, 1, 2, 3].map(k => w * PER + k), dayIn = ((d % 1) + 1) % 1;
    const shift = Math.floor(dayIn * 4) % 2;   /* six-hour turns: pairs 0-1 and 2-3 */
    return { watch: w, monks, awake: shift ? monks.slice(2) : monks.slice(0, 2), shift };
  }

  /* the sunrise or sunset nearest before t, found by stepping back a minute at a time (env.day is the only clock the host has) */
  function since(t, env, want) { let s = 0; while (s < 3600 && !!env.day(t - s - 60) === want) s += 60; return s; }

  function state(t, env) {
    const W = watch(t / 86400), day = !!env.day(t), clear = env.clear == null ? true : !!env.clear(t);
    const kora = !day && env.station != null && !!env.station(t);
    const out = (mode, S, shutter) => ({ mode, station: S ? S.id : null, bearing: S ? S.bearing : null, shutter: !!shutter, kora, watch: W });
    const msg = (S, hour) => { const m = env.message == null ? null : env.message(hour, S.id); return flashes(m == null ? S.call : m); };
    const hour = Math.floor(t / 3600), inHour = ((t % 3600) + 3600) % 3600;
    if (day) {
      const up = since(t, env, true);   /* seconds of day so far (to an hour) */
      if (up < OPENING && clear) {
        const S = up < OPENING / 2 ? DAY[0] : DAY[1], p = flashes(S.call), u = up % (OPENING / 2);
        return out('opening', S, u < length(p) ? shutterAt(p, u) : false);
      }
      if (!clear || inHour >= DAY_LINE) return out('watch', null, false);
      const k = Math.floor(inHour / SLOT), S = DAY[k], p = msg(S, hour), u = inHour - k * SLOT;
      return out('mirror', S, u < length(p) ? shutterAt(p, u) : false);
    }
    const down = since(t, env, false);
    if (down < CLOSING) return out('closing', null, false);
    if (inHour >= NIGHT_FROM && inHour < NIGHT_LINE) {
      const k = Math.floor((inHour - NIGHT_FROM) / SLOT), S = NIGHT[k], p = msg(S, hour), u = inHour - NIGHT_FROM - k * SLOT;
      return out('basket', S, u < length(p) ? shutterAt(p, u) : false);
    }
    return out('watch', null, false);
  }

  return { vent, bursts, state, flashes, read, watch, DAY, NIGHT, SLOT, DAY_LINE, NIGHT_FROM, NIGHT_LINE, OPENING, CLOSING, WINDOW, JITTER, FLASH, CODE, WATCHES, PER, WEEK };
})();
if (typeof module !== 'undefined') module.exports = FE_WATCH;
