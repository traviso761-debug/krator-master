// node settlements/flashing-eye/test-watch.js: the vent, the Rim Watch and the line (src/40-fe-watch.js) on core/sched and
// core/rand. Every check has a negative: a broken vent, line, code or rota must fail it and the real one pass.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
require('../../core/sched/20-core-sched.js');
require('../../core/rand/08-core-rand.js');
const W = require('./src/40-fe-watch.js');
const LAYOUT = require('./src/30-fe-layout.js');
const LAMP = require('../beacon/src/40-bc-lamp.js');
const H = 3600, D = 86400;
const day = t => { const h = ((t % D) + D) % D / H; return h >= 6 && h < 18; };   /* a twelve-hour day for the test */
const ENV = { day };
const at = (h, env) => W.state(h * H, Object.assign({}, ENV, env == null ? {} : env));

/* ---- 1. the vent bursts every 10 to 20 minutes, the same bursts every time it is asked */
const gapsRight = B => { const s = B(0, 3 * D); if (s.length < 3 * D / 1200) return false; for (let i = 1; i < s.length; i++) { const g = s[i] - s[i - 1]; if (g < 600 - 1e-6 || g > 1200 + 1e-6) return false; } return true; };
T.ok('the vent bursts every 10 to 20 minutes over three days (' + W.bursts(0, 3 * D).length + ' bursts)', gapsRight(W.bursts));
T.neg('a vent that bursts twice in a minute is caught', gapsRight, (a, b) => { const s = W.bursts(a, b); return s.concat(s.slice(0, 5).map(x => x + 30)).sort((x, y) => x - y); }, W.bursts);
const sameRight = V => { const s = W.bursts(5 * D, 5 * D + 6 * H); return s.every(b => { const v = V(b + 1); return v.on && Math.abs(v.since - 1) < 1e-6; }) && JSON.stringify(V(5 * D + 777)) === JSON.stringify(V(5 * D + 777)); };
T.ok('the vent is a function of the clock: each listed burst is on at its start, the same answer twice', sameRight(W.vent));
T.neg('a vent whose bursts drift from the list is caught', sameRight, t => { const v = W.vent(t); return Object.assign({}, v, { since: v.since + 40, on: false }); }, W.vent);

/* ---- 2. a burst flashes (bright within a second or two, dark between) and leaves a puff of ash that lingers */
const flashRight = V => { const b = W.bursts(D, D + H)[1], pk = V(b + 1).amp, mid = V(b + 300), ash = V(b + 40);
  return pk > 0.9 && mid.amp === 0 && !mid.on && ash.ash > 0.3 && V(b + 200).ash === 0; };
T.ok('a burst flashes bright, goes dark between bursts, and its ash lingers about a minute and a half', flashRight(W.vent));
T.neg('a vent that glows steadily is caught', flashRight, t => Object.assign({}, W.vent(t), { amp: 1 }), W.vent);

/* ---- 3. by day, from the top of each hour the mirror holds each station's bearing for its slot, then the post keeps watch */
const lineRight = S => W.DAY.every((st, i) => { const s = S(10 + (i * W.SLOT + 5) / H); return s.mode === 'mirror' && s.station === st.id && s.bearing === st.bearing; })
  && S(10 + (W.DAY_LINE + 5) / H).mode === 'watch';
T.ok('on the hour the mirror sends to the Beacon, Erehwon, the Rim Post and the Tears\' camp in turn, then keeps watch', lineRight(at));
T.neg('a day line that skips Erehwon is caught', lineRight, (h, e) => { const s = at(h, e); return s.station === 'erehwon' ? Object.assign({}, s, { station: 'beacon' }) : s; }, at);
const cloudRight = S => S(10 + 5 / H, { clear: () => false }).mode === 'watch' && S(10 + 5 / H).mode === 'mirror';
T.ok('in cloud the mirror is still and the post keeps watch', cloudRight(at));
T.neg('a mirror that flashes through cloud is caught', cloudRight, (h, e) => { const s = at(h, e); return s.mode === 'watch' && e && e.clear ? at(h) : s; }, at);

/* ---- 4. the Opening of the Eye: at sunrise the first mirror goes to the Beacon, then to Erehwon; the Closing at sunset */
const openRight = S => S(6 + 60 / H).mode === 'opening' && S(6 + 60 / H).station === 'beacon' && S(6 + 420 / H).station === 'erehwon'
  && S(18 + 120 / H).mode === 'closing' && !S(18 + 120 / H).shutter;
T.ok('the Opening sends the first mirror to the Beacon, then Erehwon; the Closing at sunset sends nothing', openRight(at));
T.neg('an Opening that greets Erehwon first is caught', openRight, (h, e) => { const s = at(h, e); return s.mode === 'opening' ? Object.assign({}, s, { station: s.station === 'beacon' ? 'erehwon' : 'beacon' }) : s; }, at);

/* ---- 5. by night the fire basket answers only after the Beacon's signal hour, never over it, to the Rim Post then Erehwon */
const nightRight = S => {
  for (let s = 0; s < 3600; s += 15) { const st = S(22 + s / H); if (st.mode === 'basket' && s < LAMP.SIGNAL) return false; if (st.mode === 'mirror') return false; }
  return S(22 + (LAMP.SIGNAL + 10) / H).station === 'rimpost' && S(22 + (LAMP.SIGNAL + W.SLOT + 10) / H).station === 'erehwon';
};
T.ok('the fire basket speaks after the Beacon\'s signal hour (' + LAMP.SIGNAL + ' s): the Rim Post, then Erehwon', nightRight(at));
T.neg('a basket that speaks over the Beacon\'s lamp is caught', nightRight, (h, e) => { const s = at(h, e), u = (h * H) % H; return !day(h * H) && u < 100 ? Object.assign({}, s, { mode: 'basket', station: 'rimpost' }) : s; }, at);

/* ---- 6. the bearings are the layout's (the Eye Post's sights) */
const bearingsRight = St => St.every(S => { const s = LAYOUT.sights.post.list.find(x => x.id === S.id); return s && Math.abs(s.bearing - S.bearing) < 1 && s.clear >= 10; });
T.ok('every station on the line is one the Eye Post sees, at the layout\'s bearing', bearingsRight(W.DAY));
T.neg('a station aimed 10 degrees off is caught', bearingsRight, W.DAY.map(S => S.id === 'erehwon' ? Object.assign({}, S, { bearing: 293 }) : S), W.DAY);

/* ---- 7. one signal book: the mirror's code is the Beacon lamp's, and it reads back what it sends */
const MSG = [[3, 4], [1, 7], [6, 6], [2, 1]];
const codeRight = F => JSON.stringify(F(MSG)) === JSON.stringify(LAMP.flashes(MSG)) && JSON.stringify(W.read(F(MSG))) === JSON.stringify(MSG);
T.ok('the mirror\'s code is the Beacon lamp\'s grid code and reads back what it flashes', codeRight(W.flashes));
T.neg('a code with a longer beat than the lamp\'s is caught', codeRight, m => W.flashes(m).map(([on, d]) => [on, on ? d * 1.5 : d]), W.flashes);
const shutterRight = S => { let on = 0; for (let k = 0; k < 200; k++) { const s = S(11 + (W.SLOT + k * 0.1) / H); if (s.station === 'erehwon' && s.shutter) on++; } return on > 0 && on < 200; };
T.ok('during a station\'s slot the shutter beats its call (not a steady glare)', shutterRight(at));
T.neg('a slot with the shutter held open is caught', shutterRight, (h, e) => Object.assign({}, at(h, e), { shutter: true }), at);

/* ---- 8. the Rim Watch: six watches of four, a week each in turn; two awake at a time; every monk in one watch */
const rotaRight = F => {
  const served = new Array(24).fill(0);
  for (let wk = 0; wk < 12; wk++) { const w = F(wk * 7 + 0.3); if (w.monks.length !== 4 || w.awake.length !== 2 || !w.awake.every(m => w.monks.includes(m))) return false;
    if (JSON.stringify(F(wk * 7 + 6.3).monks) !== JSON.stringify(w.monks)) return false; w.monks.forEach(m => served[m]++);
    if (wk && F((wk - 1) * 7).monks.some(m => w.monks.includes(m))) return false; }
  const a = F(3.1).awake, b = F(3.4).awake;
  return served.every(s => s === 2) && JSON.stringify(a) !== JSON.stringify(b);
};
T.ok('the Rim Watch: 24 monks in six watches of four, each a week on the rim in six, two awake in six-hour turns', rotaRight(W.watch));
T.neg('a rota that keeps one watch on the rim two weeks running is caught', rotaRight, d => Math.floor(d / 7) === 1 ? W.watch(0.3) : W.watch(d), W.watch);
const tally = LAYOUT.rota.watch === W.WATCHES * W.PER && LAYOUT.parts.find(p => p.id === 'hut').rota === W.PER;
T.ok('the rota is the layout\'s (24 on the Watch; the hut\'s four bunks hold one watch)', tally);

/* ---- 9. the Station's nights: the professed walk the Open Kora */
const koraRight = S => S(23, { station: () => true }).kora && !S(23).kora && !S(12, { station: () => true }).kora;
T.ok('on the Station\'s nights the professed walk the Open Kora (and only by night)', koraRight(at));
T.neg('a kora walked at noon is caught', koraRight, (h, e) => Object.assign({}, at(h, e), { kora: !!(e && e.station) }), at);
T.done();
