// node settlements/flashing-eye/test-people.js: the house's people (src/41-fe-people.js) on the layout, FE_WATCH and core/rand.
// Every check has a negative: a census, a lane, a watch, a pilgrim or a procession broken in one way must fail it.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
require('../../core/sched/20-core-sched.js');
require('../../core/rand/08-core-rand.js');
const L = require('./src/30-fe-layout.js');
const W = require('./src/40-fe-watch.js');
const F = require('./src/31-fe-rules.js');
const P = require('./src/41-fe-people.js');
const HR = 3600, DAY = 86400;
const ENV = { day: t => { const h = ((t % DAY) + DAY) % DAY / HR; return h >= 6.2 && h < 18.4; } };
const D = 120, DS = D + (5 - (D % 8) + 8) % 8;   /* the page's day and the next Station's night */
const at = (d, h) => d * DAY + h * HR;

/* ---- 1. the census: 320 residents in the layout's groups, 280 sleeping on the bench and 40 at the Foot House */
const censusRight = ps => { const by = {}; ps.forEach(q => { by[q.group] = (by[q.group] || 0) + 1; });
  const zone = id => (L.parts.find(p => p.id === id) || {}).zone, bench = ps.filter(q => zone(q.home) === 'bench' || zone(q.home) === 'cap').length, foot = ps.filter(q => zone(q.home) === 'foot').length;
  return Object.keys(L.census).every(g => by[g] === L.census[g]) && ps.length === 320 && bench === 280 && foot === 40 && new Set(ps.map(q => q.id)).size === ps.length; };
T.ok('the census is the layout\'s: 320 residents, 280 on the bench and its cap, 40 at the Foot House, each with an id of its own', censusRight(P.people));
T.neg('a census a novice short is caught', censusRight, P.people.filter(q => q.id !== 'fe.novices.000'), P.people);

/* ---- 2. the Rim Watch is FE_WATCH's: its 24 in six watches of four, and the watch on duty at the rim */
const rim = q => Math.hypot(q.u - P.POST[0], q.v - P.POST[1]) < 150;
const watchRight = pose => { const rw = P.people.filter(q => q.office === 'rimwatch'); if (rw.length !== 24) return false;
  for (let h = 5; h < 27; h += 1.5) { const t = at(D + 1, h), Wt = W.watch(t / DAY), on = rw.filter(q => Wt.monks.indexOf(q.j) >= 0);
    if (on.length !== 4) return false; const seen = on.map(q => pose(q, t, ENV)).filter(o => !o.hidden);
    if (!seen.every(rim)) return false; if (ENV.day(t) && seen.length < 2) return false; } return true; };
T.ok('the Rim Watch on duty is FE_WATCH\'s four, at the post (two seen by day: the platform and the rim)', watchRight(P.pose));
T.neg('a watch drawn on the bench is caught', watchRight, (q, t, e) => { const o = P.pose(q, t, e); return o.hidden ? o : Object.assign({}, o, { u: -60 }); }, P.pose);

/* ---- 3. pilgrims stop at the Threshold Chorten: none on the rim beyond it, ever; on an ordinary day some reach it */
const beyond = o => !o.hidden && o.u < P.THR[0] - 14;
const thresholdRight = pose => { let reach = 0;
  for (const d of [D, DS]) for (const Q of P.pilgrims(d)) for (let h = 8; h < 30; h += 0.05) { const o = pose(Q, at(d, h), ENV); if (beyond(o)) return false;
    if (d === D && !o.hidden && Math.hypot(o.u - P.THR[0], o.v - P.THR[1]) < 14) { reach++; break; } }
  return reach >= 5; };
T.ok('pilgrims climb the Way of Breath to the Threshold Chorten and no further (' + P.pilgrims(D).length + ' today)', thresholdRight(P.pose));
T.neg('a pilgrim walking on to the rim is caught', thresholdRight, (q, t, e) => { const o = P.pose(q, t, e); return !o.hidden && Math.hypot(o.u - P.THR[0], o.v - P.THR[1]) < 14 ? Object.assign({}, o, { u: o.u - 40 }) : o; }, P.pose);

/* ---- 4. the Station's night: FE_WATCH's kora flag is on, the professed walk the rim clockwise, the novices keep the vigil */
const onRim = o => !o.hidden && Math.abs(Math.hypot(o.u - L.crater.centre[0], o.v - L.crater.centre[1]) - P.paths.open.P[0].length * 0 - (L.crater.r + 12)) < 3;
const koraRight = pose => { const t = at(DS, 21), t0 = at(D, 21);
  if (!W.state(t, Object.assign({ station: P.stationAt }, ENV)).kora || W.state(t0, Object.assign({ station: P.stationAt }, ENV)).kora) return false;
  const on = P.people.filter(q => q.professed && onRim(pose(q, t, ENV))); if (on.length < 100) return false;
  if (P.people.some(q => onRim(pose(q, t0, ENV)))) return false;
  const cw = on.filter(q => { const a = pose(q, t, ENV), b = pose(q, t + 10, ENV), A = Math.atan2(a.v, a.u - L.crater.centre[0]), B = Math.atan2(b.v, b.u - L.crater.centre[0]); return ((B - A + 3 * Math.PI) % (2 * Math.PI)) - Math.PI < 0; }).length;
  const vig = P.people.filter(q => q.group === 'novices').map(q => pose(q, t, ENV)).filter(o => !o.hidden && Math.hypot(o.u - P.THR[0], o.v - P.THR[1]) < 12).length;
  return cw === on.length && vig === 8; };
T.ok('on a Station\'s night the professed walk the rim clockwise (FE_WATCH\'s kora flag), eight novices keep the vigil; not on another night', koraRight(P.pose));
T.neg('a procession on an ordinary night is caught', koraRight, (q, t, e) => { const d = P.dayOf(t); return P.pose(q, d === D ? t + (DS - D) * DAY : t, e); }, P.pose);

/* ---- 5. the lanes run clear of every building on the bench, and so does the kora; every place reaches every other */
/* the gatehouses and the novices' court are walked through their passages */
const SOLID = L.parts.filter(p => p.zone === 'bench' && ['court', 'stair_way', 'chorten', 'terrace', 'gatehouse', 'novices'].indexOf(p.kind) < 0);
const inside = (u, v, sh) => SOLID.find(p => u > p.box[0] + sh && u < p.box[1] - sh && v > p.box[2] + sh && v < p.box[3] - sh);
const clearOf = (Tp, ends) => { for (let d = ends; d <= Tp.L - ends; d += 0.5) { const q = P.pathAt(Tp, d); const b = inside(q.u, q.v, 0.3); if (b) return b.id + ' at ' + q.u.toFixed(1) + ',' + q.v.toFixed(1); } return null; };
const lanesRight = (route, kora) => { const ids = Object.keys(P.PLACES), bad = [];
  for (const a of ids) for (const b of ids) { if (a === b) continue; let Tp; try { Tp = route(a, b); } catch (e) { bad.push(a + '>' + b + ' ' + e.message); continue; } const c = clearOf(Tp, 3.5); if (c) bad.push(a + '>' + b + ': ' + c); }
  const k = clearOf(kora, 0); if (k) bad.push('kora: ' + k); return bad; };
const lb = lanesRight(P.route, P.paths.kora);
T.ok('every route between the bench\'s ' + Object.keys(P.PLACES).length + ' places, and the lower kora, runs clear of its buildings', lb.length === 0, lb.slice(0, 4).join('; '));
T.neg('a lane through the Red Monastery is caught', (r) => lanesRight(r, P.paths.kora).length === 0, (a, b) => a === 'court' && b === 'ember' ? P.path([[-26, 0], [-74, 0], [-116, 0]]) : P.route(a, b), P.route);

/* ---- 6. the lanes are on the ground they cross: each node at its terrace's level (the stairs' heads and feet, the yard's plinth, at theirs) */
const levelRight = N => Object.keys(N).every(k => { const n = N[k]; if (k === 'nvy') return n[2] === 4.5; return Math.abs(F.terraceY(L, n[0]) - n[2]) < 1e-9 || (/h$/.test(k) && Math.abs(F.terraceY(L, n[0] + 1) - n[2] + (n[2] === 9 ? 5 : 4)) < 1e-9); });
T.ok('each lane node stands at its terrace\'s level (+0, +4, +9 m)', levelRight(P.N));
T.neg('a node of the Lip terrace put at the middle terrace\'s level is caught', levelRight, Object.assign({}, P.N, { court: [-26, 0, 4] }), P.N);

/* ---- 7. a function of the clock: the same pose twice; walkers move and standers stand */
const clockRight = pose => { let walk = 0, still = 0; const ps = P.people.concat(P.pilgrims(D));
  for (const q of ps) { const t = at(D, 9.3), a = pose(q, t, ENV), b = pose(q, t, ENV), c = pose(q, t + 5, ENV); if (JSON.stringify(a) !== JSON.stringify(b)) return false;
    if (a.hidden || c.hidden) continue; const m = Math.hypot(c.u - a.u, c.v - a.v); if (a.act === 'walk' && c.act === 'walk') { if (m < 0.5) return false; walk++; } else if (a.act !== 'walk' && c.act !== 'walk') { if (m > 1e-6) return false; still++; } }
  return walk >= 5 && still >= 20; };
T.ok('each pose is a function of the clock; at 09:18 the walkers move (more than 0.5 m in 5 s) and the rest stand still', clockRight(P.pose));
T.neg('a crowd that jitters is caught', clockRight, (q, t, e) => { const o = P.pose(q, t, e); return o.hidden ? o : Object.assign({}, o, { u: o.u + (t % 7) * 1e-3 }); }, P.pose);

/* ---- 8. no two people stand in one place (a court full on the Station's night) */
const crowdRight = pose => { const t = at(DS, 20.6), S = [], cell = new Map();
  for (const q of P.people.concat(P.pilgrims(DS - 1), P.pilgrims(DS))) { const o = pose(q, t, ENV); if (o.hidden || o.act === 'walk') continue; S.push(o); }
  for (const o of S) { const k = Math.floor(o.u / 2) + ',' + Math.floor(o.v / 2); (cell.get(k) || cell.set(k, []).get(k)).push(o); }
  for (const o of S) for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const p of cell.get((Math.floor(o.u / 2) + a) + ',' + (Math.floor(o.v / 2) + b)) || [])
    if (p !== o && Math.hypot(p.u - o.u, p.v - o.v) < 0.55 && Math.abs((p.lift || 0) - (o.lift || 0)) < 1) return false;
  return S.length >= 300; };
T.ok('on a Station\'s evening some hundreds stand on the bench and at the chorten, none in another\'s place', crowdRight(P.pose));
T.neg('two pilgrims put in one place are caught', crowdRight, (q, t, e) => { const o = P.pose(q, t, e); return q.group === 'pilgrim' && q.i === 1 && !o.hidden ? P.pose(P.pilgrims(q.d)[0], t, e) : o; }, P.pose);

T.done();
