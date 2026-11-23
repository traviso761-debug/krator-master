// node settlements/beacon/test-beacon.js: the beacon house's layout (src/30-bc-layout.js) against its rules
// (src/31-bc-rules.js). Every rule passes on the layout, and each has a negative: a copy broken in that one way must fail
// that rule and the unbroken copy pass it. Also: the frame's origin is the tune's shoulder, and the power and the census
// are the tune's and the owner's numbers.
'use strict';
const T = require('../../tools/ktest.js')(__filename);
const L = require('./src/30-bc-layout.js');
const B = require('./src/31-bc-rules.js');
const clone = () => JSON.parse(JSON.stringify(L));
const part = (M, id) => M.parts.find(p => p.id === id);
const rule = name => M => B.RULES[name](M).length === 0;

/* ---- every rule on the layout */
B.checks(L).forEach(c => T.ok(c.name, c.pass, c.detail));

/* ---- each rule's negative: [rule, how to break it] */
const NEG = [
  ['every part, wall, gate and way has a unique id', M => { M.parts.push(Object.assign({}, part(M, 'hives'))); }],
  ['every part stands in its zone', M => { part(M, 'generator').box = [-60, -42, -64, -48]; }],
  ['every part stands in its zone', M => { part(M, 'hives').box = [-200, -180, -10, 10]; }],
  ['no two parts on one level overlap, nor a part and a fort tower', M => { part(M, 'workshop').box = [-60, -46, -20, -6]; }],
  ['no two parts on one level overlap, nor a part and a fort tower', M => { part(M, 'barracks').box = [-21.6, 4.4, 24, 32]; }],
  ['no building stands in a wall', M => { part(M, 'guests').box = [-232, -206, 28, 61]; }],
  ["Gyantse's walls join the fort's corner towers to the precinct's corners", M => { M.walls.find(w => w.id === 'join.e').b = [-28.87, 10]; }],
  ['every gate is on its wall', M => { M.gates.find(g => g.id === 'gate.ward').at = [-48, -30]; }],
  ['the fort is reached without passing the cloister, the cloister without passing the fort', M => { M.gates = M.gates.filter(g => g.id !== 'gate.ward' && g.id !== 'gate.lamp'); M.gates.push({ id: 'gate.through', wall: null, at: [-83, 0], w: 3, from: 'cloister', to: 'lampward' }); }],
  ['the hosted monastery stands clear of the precinct wall by 4 m', M => { part(M, 'monastery').box = [-128, -76, -26, 26].map((x, i) => i < 2 ? x + 6 : x); }],
  ['the cable runs from the engines to the plinth, into the fort only through its gate', M => { M.cable.pts = [[-50, -16], [-34, -16], [-6, -2]]; }],
  ['the cable runs from the engines to the plinth, into the fort only through its gate', M => { M.cable.pts[M.cable.pts.length - 1] = [-20, -1.5]; }],
  ['the lamp sees every place the order must reach, by 10 m or more', M => { M.lamp.sights.find(s => s.id === 'tempest').clear = -5; }],
  ["the lamp's year fits the oil the tune sends", M => { M.lamp.kw = 1.2; }],
  ['a station the lamp cannot see is reached through a relay or a station it sees', M => { M.lamp.relays[0].seeFar = -20; }],
  ['a station the lamp cannot see is reached through a relay or a station it sees', M => { M.lamp.sights.find(s => s.id === 'eye').via = 'nowhere'; }],
  ['gold only on the gate pavilion, the chapel and the holy crown', M => { part(M, 'labrang').gold = 'crown'; }],
  ['everyone has a bed: the census sleeps where the parts say', M => { delete part(M, 'school').sleeps; }],
  ['everyone has a bed: the census sleeps where the parts say', M => { M.census.novices = 80; part(M, 'novrange').sleeps.novices = 80; }]];
NEG.forEach(([name, brk], i) => {
  const bad = clone(); brk(bad);
  T.neg(name + ' [negative ' + (i + 1) + ']', rule(name), bad, clone());
});

/* ---- the numbers the plan quotes */
T.ok('the frame stands on the east shoulder, 14 km east of the tune pin', L.frame.px[0] === 853 && L.frame.px[1] === 1540, L.frame.px.join(','));
T.ok('the oil is the tune\'s fiftieth of the licence: 1,600 kg, 4,800 kWh a year', L.power.oilKgYr === 1600 && L.power.oilKgYr * L.power.kWhPerKg === 4800);
const P0 = B.toPx(L, 2000, -2000);
T.ok('the frame turns onto the map: 2 km south and 2 km west is one pixel down and one left', P0[0] === 852 && P0[1] === 1541, P0.join(','));
const A = B.area(L);
T.ok('the order\'s floor is between 18,000 and 26,000 m2 (a house of 300, 60-85 m2 a head)', A.order > 18000 && A.order < 26000, A.order);
T.ok('the hosted block is the kit\'s 52 m great monastery in the gold dress', (b => b[1] - b[0] === 52 && b[3] - b[2] === 52)(part(L, 'monastery').box) && part(L, 'monastery').host.v === 2);
T.done();
