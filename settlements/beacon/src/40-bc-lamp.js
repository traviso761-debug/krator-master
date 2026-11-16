/* ================================================================= THE BEACON: the lamp's night, as data  [G data]
   settlements/beacon/PLAN.md section 4, step B9. The owner, 2026-11-16 (the fork "how the lamp is served"): lit every
   night, with the signal book, raised to the Station when it passes. Everything else is *proposed*.

   A pure function of a clock t (seconds) and what the host tells it (`env`), on core/sched (KSCHED): the page, a test,
   the sim and Godot read the same lamp. No THREE, no DOM, no randomness.

     BEACON_LAMP.state(t, env) -> {lit, mode, bearing, elevation, shutter, station, keepers}
        env (all optional but `night`):
          night(t)   -> bool         dusk to dawn (core/atmos's sun)
          engines(t) -> bool         the generator running (the sim's power); default true
          station(t) -> null | {az, el}   the Station overhead (the sky); the beam is raised to it
          alarm(t)   -> null | {bearing}  a raid seen: the beam held on its bearing, the shutters beating fast
          message(hour, stationId) -> [[row, col], ...]   that hour's message (default: the station's call sign)
        mode: 'dark' | 'alarm' | 'station' | 'signal' | 'sweep'
     BEACON_LAMP.flashes(syllables) -> [[on (bool), dur (s)], ...]   the grid code: a syllable is `row` flashes, a
        pause, `col` flashes (the sound grid of the syllabary; PLAN.md question 5)
     BEACON_LAMP.read(pulses) -> syllables      the reader's side: the inverse of flashes()
     BEACON_LAMP.watch(night) -> [keeper, keeper, keeper]   the Lamp Watch: three keepers a night, a week each, the
        keepers in a ring so a brother serves one week in five
     BEACON_LAMP.yearKWh(nightHours) -> kWh     the lamp's year at its draw, for the tune's oil */
const BEACON_LAMP = (function () {
  'use strict';
  const K = typeof KSCHED !== 'undefined' ? KSCHED : (typeof require !== 'undefined' ? (require('../../../core/sched/20-core-sched.js'), globalThis.KSCHED) : null);
  if (!K) throw new Error('BEACON_LAMP needs core/sched (KSCHED)');

  /* the sweep: the southern arc over the Rift, out and back in two minutes, easing at the ends */
  const ARC = [100, 260];
  const sweep = K.timeline({ period: 120, segments: [
    { dur: 60, from: ARC[0], to: ARC[1], ease: 'inOut', name: 'out' },
    { dur: 60, from: ARC[1], to: ARC[0], ease: 'inOut', name: 'back' }] });

  /* the signal hour: from the top of each hour the beam stops on each station in turn for its slot. Bearings from the
     lamp (30-bc-layout.js `lamp.sights` and `relays`): the Rim Post carries the line on to the Flashing Eye and Erehwon */
  const STATIONS = [
    { id: 'rimpost', name: 'the Rim Post (to the Flashing Eye and the capital)', bearing: 21, call: [[1, 1], [8, 2]] },
    { id: 'g1', name: 'G1, the Brow post (Strongwall\'s line)', bearing: 149, call: [[3, 4], [1, 7]] },
    { id: 'tempest', name: 'the House of the Tempest', bearing: 157, call: [[6, 6], [2, 3]] },
    { id: 'tears', name: 'the Golden Tears\' camp', bearing: 181, call: [[4, 2], [5, 5]] },
    { id: 'march.s', name: 'the south watch fort', bearing: 239, call: [[7, 3], [2, 8]] }];
  const SLOT = 150;
  const slotStarts = K.slots(STATIONS.length, STATIONS.length * SLOT, SLOT);
  const SIGNAL = STATIONS.length * SLOT;

  /* the grid code: a flash and a dark beat of `beat` s; `gap` s between row and column; `sep` s between syllables */
  const CODE = { beat: 0.6, gap: 1.8, sep: 3.6, fast: 0.25 };
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
  function shutterAt(pulses, u) {
    let acc = 0;
    for (let i = 0; i < pulses.length; i++) { acc += pulses[i][1]; if (u < acc) return pulses[i][0]; }
    return false;
  }

  /* the Lamp Watch: KEEPERS brothers in a ring, a week each in threes, so each serves one week in KEEPERS/3 */
  const KEEPERS = 15, WEEK = 7;
  function watch(night) {
    const w = Math.floor(night / WEEK), base = (w * 3) % KEEPERS;
    return [base, (base + 1) % KEEPERS, (base + 2) % KEEPERS];
  }

  const KW = 1.0;
  const yearKWh = nightHours => KW * (nightHours == null ? 12 : nightHours) * 365;

  function state(t, env) {
    env = env == null ? {} : env;
    const night = Math.floor(t / 86400), keepers = watch(night);
    const lit = !!env.night(t) && (env.engines == null ? true : !!env.engines(t));
    if (!lit) return { lit: false, mode: 'dark', bearing: null, elevation: 0, shutter: false, station: null, keepers };
    const al = env.alarm == null ? null : env.alarm(t);
    if (al) return { lit: true, mode: 'alarm', bearing: al.bearing, elevation: 0, shutter: Math.floor(t / CODE.fast) % 2 === 0, station: null, keepers };
    const st = env.station == null ? null : env.station(t);
    if (st) return { lit: true, mode: 'station', bearing: st.az, elevation: st.el, shutter: true, station: null, keepers };
    const inHour = ((t % 3600) + 3600) % 3600;
    if (inHour < SIGNAL) {
      let k = 0; for (let i = slotStarts.length - 1; i >= 0; i--) if (inHour >= slotStarts[i]) { k = i; break; }
      const S = STATIONS[k], hour = Math.floor(t / 3600), msg = env.message == null ? null : env.message(hour, S.id);
      const pulses = flashes(msg == null ? S.call : msg), u = inHour - slotStarts[k];
      return { lit: true, mode: 'signal', bearing: S.bearing, elevation: 0, shutter: u < length(pulses) ? shutterAt(pulses, u) : true, station: S.id, keepers };
    }
    return { lit: true, mode: 'sweep', bearing: sweep.at(t).value, elevation: 0, shutter: true, station: null, keepers };
  }

  return { state, flashes, read, watch, yearKWh, STATIONS, ARC, SLOT, SIGNAL, CODE, KEEPERS, WEEK, KW, sweep };
})();
if (typeof module !== 'undefined') module.exports = BEACON_LAMP;
