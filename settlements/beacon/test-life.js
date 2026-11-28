// node settlements/beacon/test-life.js: the house's day and night (src/41-bc-life.js) on core/sched. Every check has a
// negative: a broken walker, route or schedule must fail it and the real one pass.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
require('../../core/sched/20-core-sched.js');
const LIFE = require('./src/41-bc-life.js');
const L = require('./src/30-bc-layout.js');
const LAMP = require('./src/40-bc-lamp.js');
const H = 3600, D = 86400;
const W = LIFE.walkers(), watch = W.filter(w => w.group === 'watch'), kora = W.filter(w => w.group === 'kora');
/* the lamp's night as the page has it: core/atmos's evening half dark or more (loaded as core/atmos/test-atmos.js loads it) */
const fs = require('fs'), path = require('path');
global.window = global; global.THREE = global.THREE || {};
eval(['89-atmos-0-core.js', '89-atmos-0p-presets.js'].map(f => fs.readFileSync(path.join(__dirname, '../../core/atmos', f), 'utf8')).join('\n') + ';global.ATMOS=ATMOS;');
const night = t => ATMOS.night(((t % D) + D) % D / H) >= .5;

/* 1. the Lamp Watch is in the plinth whenever the lamp is lit (its night), and in the monastery by midday */
const watchRight = at => { for (let m = 0; m < 24 * 60; m += 5) { const t = m * 60, lit = LAMP.state(t, { night }).lit;
  for (const w of watch) { const p = at(w, t); if (lit && p.where !== 'in the plinth') return false; } }
  return watch.every(w => at(w, 12 * H).where === 'in the monastery'); };
T.ok('the Lamp Watch is in the plinth whenever the lamp is lit, in the monastery by day', watchRight(LIFE.at));
T.neg('a watch that walks out at midnight is caught', watchRight, (w, t) => ((t % D) === 0 && w.k === 0 ? { where: 'out', visible: true } : LIFE.at(w, t)), LIFE.at);

/* 2. the watch's route passes the Gate of the Lamp and the fort's gate, and ends at the plinth's door */
const gatesOn = r => ['gate.lamp', 'gate.fort'].every(id => { const g = L.gates.find(q => q.id === id); return r.some(p => Math.hypot(p[0] - g.at[0], p[1] - g.at[1]) < 1); })
  && (e => e[0] > -8 && e[0] < -6 && Math.abs(e[1]) < 1)(r[r.length - 1]);
T.ok('the watch walks through the Gate of the Lamp and the fort\'s gate to the plinth\'s door', gatesOn(LIFE.ROUTES.watch));
T.neg('a watch route that climbs the knoll\'s face instead of the gates is caught', gatesOn, [[-76, 0], [-60, 20], [-20, 20], [-6.4, 0]], LIFE.ROUTES.watch);

/* 3. no route crosses a building (sampled every half metre; the gatehouses and the plinth are passed through by their doors) */
const THROUGH = ['gatehouse', 'plinth'], SOLID = L.parts.filter(p => p.level === 0 && THROUGH.indexOf(p.kind) < 0 && ['court', 'garden', 'yard', 'stair_way', 'terrace', 'field', 'threshing', 'midden', 'tank', 'oil_pit', 'chorten', 'hosted'].indexOf(p.kind) < 0 && p.zone !== 'site');
const crosses = r => { const bad = []; for (let s = 0; s <= LIFE.length(r); s += .5) { const p = LIFE.along(r, s);
  SOLID.forEach(q => { if (p.u > q.box[0] + .2 && p.u < q.box[1] - .2 && p.v > q.box[2] + .2 && p.v < q.box[3] - .2 && bad.indexOf(q.id) < 0) bad.push(q.id); }); } return bad; };
const clear = rs => Object.values(rs).every(r => !crosses(r).length);
T.ok('no walker\'s route crosses a building', clear(LIFE.ROUTES), Object.entries(LIFE.ROUTES).map(([k, r]) => k + ': ' + crosses(r).join(',')).join('; '));
T.neg('a kora cut through the refectory is caught', clear, Object.assign({}, LIFE.ROUTES, { kora: [[-72, 0], [-90, -45], [-130, 0]] }), LIFE.ROUTES);

/* 4. the kora clear of the monastery block (it walks round it) and clockwise seen from above (north at -u, east at +v) */
const area = r => { let s = 0; for (let i = 0; i + 1 < r.length; i++) s += r[i][1] * r[i + 1][0] - r[i + 1][1] * r[i][0]; return s / 2; };
const koraRight = r => { const m = L.parts.find(p => p.id === 'monastery').box; const out = r.every(p => p[0] <= m[0] - 2 || p[0] >= m[1] + 2 || p[1] <= m[2] - 2 || p[1] >= m[3] + 2);
  return out && area(r) > 0; };   /* (v east, u south) is x right, y down on a map: a clockwise loop seen from above has a positive signed area */
T.ok('the kora walks round the monastery, clockwise', koraRight(LIFE.ROUTES.kora));
const sameAsLayout = r => JSON.stringify(r) === JSON.stringify(L.ways.find(w => w.id === 'kora.path').pts);
T.ok('the walkers\' kora is the layout\'s kora.path', sameAsLayout(LIFE.ROUTES.kora));
T.neg('a kora the layout does not draw is caught', sameAsLayout, LIFE.ROUTES.kora.slice().reverse(), LIFE.ROUTES.kora);
T.neg('an anticlockwise kora is caught', koraRight, LIFE.ROUTES.kora.slice().reverse(), LIFE.ROUTES.kora);

/* 5. the kora's walkers keep apart (10 m or more on the loop) while they walk */
const apart = at => { for (let t = 7 * H; t < 7 * H + 3600; t += 7) { const ps = kora.map(w => at(w, t)).filter(p => p.where === 'walking the kora');
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) if (Math.hypot(ps[i].u - ps[j].u, ps[i].v - ps[j].v) < 6) return false; } return true; };
T.ok('the kora\'s six keep apart as they walk', apart(LIFE.at));
T.neg('two walkers set off together are caught', apart, (w, t) => LIFE.at(w.k === 1 ? kora[0] : w, t), LIFE.at);

/* 6. the novices carry the butter at dusk and dawn and are home by night */
const novRight = at => { const n = W.filter(w => w.group === 'novices');
  return n.every(w => at(w, 17 * H + 51 * 60).where === 'carrying the butter' && at(w, 18 * H).where === 'trimming the lamps' && at(w, 23 * H).where === 'in the range' && at(w, 5 * H + 41 * 60).where === 'carrying the butter'); };
T.ok('the novices carry the butter at dusk and dawn and are in the range by night', novRight(LIFE.at));
T.neg('a novice left out at night is caught', novRight, (w, t) => (w.group === 'novices' && ((t % D) / H) > 22 ? { where: 'carrying the butter', visible: true } : LIFE.at(w, t)), LIFE.at);
/* 7. the Lamp School's masters keep the offices: in the monastery's hall at noon and at the dusk office, in the school between */
const school = W.filter(w => w.group === 'school');
const officeRight = at => school.length === 6 && school.every(w => at(w, 12 * H + 20 * 60).where === 'at the office' && at(w, 17 * H + 50 * 60).where === 'at the office'
  && at(w, 15 * H).where === 'in the school' && at(w, 12 * H + 1 * 60).visible);
T.ok('the Lamp School keeps the offices: at the hall at noon and dusk, in the school between', officeRight(LIFE.at));
T.neg('a master who skips the noon office is caught', officeRight, (w, t) => (w.k === 2 && ((t % D) / H) > 12.2 && ((t % D) / H) < 12.5 ? { where: 'in the school', visible: false } : LIFE.at(w, t)), LIFE.at);

/* 8. the oil carts come only on their two days, up the fort road to the Oil Pit by 11:00, and are gone by evening */
const carts = W.filter(w => w.group === 'carts');
const cartsRight = at => { const on = d => carts.every(w => at(w, d * D + 11.5 * H).where === 'unloading at the oil pit'), off = d => carts.every(w => !at(w, d * D + 11.5 * H).visible);
  return carts.length === 2 && LIFE.CARTS.days.every(on) && off(200) && off(111) && LIFE.CARTS.days.every(d => carts.every(w => !at(w, d * D + 18 * H).visible)); };
T.ok('the oil carts come on days 110 and 290 only, unloading at the pit at 11:30, gone by evening', cartsRight(LIFE.at));
T.neg('carts that come every day are caught', cartsRight, (w, t) => LIFE.at(w, LIFE.CARTS.days[0] * D + ((t % D) + D) % D), LIFE.at);

/* 9. the Oil Pit never runs dry nor overflows: the lamp burns its year's kWh (12.4 h a night on core/atmos's evening at 1 kW) at
   the tune's 3 kWh a kg, the carts bring 800 kg twice a year and the pit takes up to 2,500 kg */
const burn = LAMP.yearKWh(12.4) / L.power.kWhPerKg / 365;
const pitRight = days => { const P = LIFE.pitYear({ burn, days }); return P.min > 0 && P.max <= LIFE.CARTS.cap; };
T.ok('the Oil Pit holds out the year: never dry, never over its 2,500 kg', pitRight(LIFE.CARTS.days), (() => { const P = LIFE.pitYear({ burn }); return 'burn ' + burn.toFixed(2) + ' kg a day; the pit ' + P.min.toFixed(0) + '..' + P.max.toFixed(0) + ' kg'; })());
T.neg('one cart trip a year is caught (the pit runs dry)', pitRight, [110], LIFE.CARTS.days);
T.done();
