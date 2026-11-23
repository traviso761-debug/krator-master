// node settlements/beacon/test-lamp.js: the lamp's night (src/40-bc-lamp.js) on core/sched. Every check has a negative:
// a broken lamp, code or rota must fail it and the real one pass.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
require('../../core/sched/20-core-sched.js');
const LAMP = require('./src/40-bc-lamp.js');
const LAYOUT = require('./src/30-bc-layout.js');
const H = 3600, D = 86400;
const night = t => { const h = ((t % D) + D) % D / H; return h >= 18 || h < 6; };   /* a twelve-hour night for the test */
const ENV = { night };
const at = (h, env) => LAMP.state(h * H, Object.assign({}, ENV, env == null ? {} : env));

/* ---- 1. lit at night only, and dark when the engines stop */
const litRight = L => [2, 23, 3.5].every(h => L(h).lit) && [8, 12, 17.9].every(h => !L(h).lit) && !L(2, { engines: () => false }).lit;
T.ok('the lamp is lit dusk to dawn and dark by day or with the engines down', litRight(at));
T.neg('a lamp lit at noon is caught', litRight, (h, e) => h === 12 ? { lit: true } : at(h, e), at);

/* ---- 2. the sweep keeps to the southern arc over the Rift, and turns through it */
const sweepRight = L => {
  let lo = 999, hi = -999;
  for (let s = 0; s < 240; s += 2) { const st = L(22 + 0.5 + s / H); if (st.mode !== 'sweep') return false; lo = Math.min(lo, st.bearing); hi = Math.max(hi, st.bearing); }
  return lo >= LAMP.ARC[0] - 1e-6 && hi <= LAMP.ARC[1] + 1e-6 && hi - lo > 150;
};
T.ok('the sweep keeps to the southern arc (100-260 deg) and covers it', sweepRight(at));
T.neg('a sweep that swings north over the house is caught', sweepRight, (h, e) => { const s = at(h, e); return s.mode === 'sweep' ? Object.assign({}, s, { bearing: s.bearing - 120 }) : s; }, at);

/* ---- 3. on the hour the beam holds each station's bearing for its slot, in turn */
const signalRight = L => LAMP.STATIONS.every((S, i) => { const s = L(20 + (i * LAMP.SLOT + 10) / H); return s.mode === 'signal' && s.station === S.id && s.bearing === S.bearing; })
  && L(20 + (LAMP.SIGNAL + 5) / H).mode === 'sweep';
T.ok('on the hour the beam stops on the Rim Post, G1, the Tempest and the Tears\' camp in turn, then sweeps', signalRight(at));
T.neg('a signal hour that skips a station is caught', signalRight, (h, e) => { const s = at(h, e); return s.station === 'tempest' ? Object.assign({}, s, { station: 'g1', bearing: 149 }) : s; }, at);

/* ---- 4. the bearings are the layout's (the stations the lamp must reach, and the relay to the Eye) */
const bearingsRight = St => St.every(S => { const s = LAYOUT.lamp.sights.find(x => x.id === S.id) || LAYOUT.lamp.relays.find(x => x.id === S.id);
  if (!s) return false; const b = s.bearing == null ? (Math.atan2(s.px[0] - LAYOUT.frame.px[0], -(s.px[1] - LAYOUT.frame.px[1])) * 180 / Math.PI + 360) % 360 : s.bearing; return Math.abs(b - S.bearing) < 1; });
T.ok('every signal station\'s bearing is the layout\'s (sights and relays)', bearingsRight(LAMP.STATIONS));
T.neg('a station aimed 10 degrees off is caught', bearingsRight, LAMP.STATIONS.map(S => S.id === 'g1' ? Object.assign({}, S, { bearing: 159 }) : S), LAMP.STATIONS);

/* ---- 5. an alarm overrides everything; the Station's pass raises the beam */
const priorityRight = L => { const a = L(20 + 10 / H, { alarm: () => ({ bearing: 248 }), station: () => ({ az: 40, el: 70 }) }), s = L(22.5, { station: () => ({ az: 40, el: 70 }) });
  return a.mode === 'alarm' && a.bearing === 248 && s.mode === 'station' && s.elevation === 70; };
T.ok('an alarm holds the beam on the raid\'s bearing over all else; the Station\'s pass raises it', priorityRight(at));
T.neg('a signal hour that hides an alarm is caught', priorityRight, (h, e) => { const s = at(h, e); return s.mode === 'alarm' ? at(h, Object.assign({}, e, { alarm: null })) : s; }, at);

/* ---- 6. the grid code: row flashes, a pause, column flashes; the reader gets back what was sent */
const MSG = [[3, 4], [1, 7], [6, 6], [2, 1]];
const roundTrip = F => JSON.stringify(LAMP.read(F(MSG))) === JSON.stringify(MSG);
T.ok('the grid code reads back what it flashes (rows, a pause, columns; syllables apart)', roundTrip(LAMP.flashes));
T.neg('a code that drops a flash is caught', roundTrip, m => { const p = LAMP.flashes(m); p.splice(p.findIndex(x => x[0]), 2); return p; }, LAMP.flashes);
const shutterRight = L => { const p = LAMP.flashes(LAMP.STATIONS[1].call); let on = 0, t0 = 20 * H + LAMP.SLOT;
  for (let k = 0; k < 200; k++) { const s = L(t0 / H + k * 0.1 / H); if (s.station === 'g1' && s.shutter) on++; } return on > 0 && on < 200; };
T.ok('during a station\'s slot the shutters beat its message (not a steady beam)', shutterRight(at));
T.neg('a slot with the shutters held open is caught', shutterRight, (h, e) => Object.assign({}, at(h, e), { shutter: true }), at);

/* ---- 7. the Lamp Watch: three a night, a week each, every keeper one week in five, never two weeks running */
const rotaRight = W => {
  const served = new Array(LAMP.KEEPERS).fill(0);
  for (let n = 0; n < 35; n++) { const w = W(n); if (w.length !== 3 || new Set(w).size !== 3) return false; w.forEach(k => served[k]++);
    if (n % 7 && JSON.stringify(W(n)) !== JSON.stringify(W(n - 1))) return false; }
  for (let wk = 1; wk < 5; wk++) if (W(wk * 7).some(k => W(wk * 7 - 1).includes(k))) return false;
  return served.every(s => s === 7);
};
T.ok('the Lamp Watch: three keepers a night, a week each, fifteen brothers each one week in five', rotaRight(LAMP.watch));
T.neg('a rota that keeps a brother two weeks running is caught', rotaRight, n => { const w = LAMP.watch(n); return Math.floor(n / 7) === 1 ? LAMP.watch(0) : w; }, LAMP.watch);

/* ---- 8. the lamp's year fits the oil the tune sends (the layout's power) */
const fits = Y => Y(12) <= LAYOUT.power.oilKgYr * LAYOUT.power.kWhPerKg;
T.ok('a year of twelve-hour nights (' + LAMP.yearKWh(12) + ' kWh) fits the fiftieth of the licence (' + LAYOUT.power.oilKgYr * LAYOUT.power.kWhPerKg + ' kWh)', fits(LAMP.yearKWh));
T.neg('a lamp burning 1.2 kW is caught', fits, h => 1.2 * h * 365, LAMP.yearKWh);
T.done();
