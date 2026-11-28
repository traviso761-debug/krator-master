/* kits/interiors/tests/test-fixtures.js: a room's fixtures and the walk check (found 2026-11-11 by the Qiblai kit session).
   A fixture is reachable unless it says reach: false, so the placer keeps a cell in front of it reachable. Its use zone was its
   declared front clearance only: at 0.2 m that strip lay inside the fixture's own footprint as the grid stamps it (grown by the
   agent), and with no front clearance there was no zone at all, so no cell could reach it, every floor piece failed the walk
   check, and a shrine's altar or a hall's table came out 'no-fit'. A reachable fixture now keeps MIN_USE (0.45 m) in front, as
   a usable piece does (the audit and the life layer already read it so), and one whose front has no walkable cell even in the
   empty room is reported and left out of the walk check instead of voiding the room.
   Run by verify.py --assert; alone:
     node tests/test-fixtures.js dist/interiors-core.js       exit 0 = pass */
'use strict';
const IX = require(require('path').resolve(process.argv[2] || 'dist/interiors-core.js'));
const P = [
  { key: 'q_altar', culture: 'q', type: 'altar', setting: 'indoor', rooms: ['shrine'], anchor: 'floor', clearance: { front: 0.9 }, variants: 1, dims: [[1.4, 0.8, 1.0]] },
  { key: 'q_lamp', culture: 'q', type: 'lamp', setting: 'indoor', rooms: ['shrine', 'hall'], anchor: 'ceiling', clearance: {}, variants: 1, dims: [[0.6, 0.6, 0.4]] },
  { key: 'q_table', culture: 'q', type: 'table', setting: 'indoor', rooms: ['hall'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.4, right: 0.4 }, variants: 1, dims: [[1.6, 0.9, 0.75]] },
  { key: 'q_chair', culture: 'q', type: 'chair', setting: 'indoor', rooms: ['hall'], anchor: 'floor', clearance: { front: 0.4 }, variants: 1, dims: [[0.5, 0.5, 0.9]] }
];
const BY = {}; P.forEach(function (d) { BY[d.key] = d; });
const cat = {
  list: function () { return P; },
  dims: function (k) { const a = BY[k].dims[0]; return { w: a[0], d: a[1], h: a[2] }; },
  anchorY: function (k, v, at) { return BY[k].anchor === 'ceiling' ? at.ceilingY - BY[k].dims[0][2] : BY[k].anchor === 'surface' ? at.surfaceY : at.floorY; },
  build: function () { return null; }
};
const fails = [];
function ok(cond, msg) { if (!cond) fails.push(msg); }
let n = 0;
/* a 22 x 16 m room, one 3 m door in the front (+z) wall */
function room(kind, fixtures) {
  return IX.ROOM({ id: 'fx' + (n++), kind: kind, culture: 'q', wealth: 0.6, poly: [[-11, -8], [11, -8], [11, 8], [-11, 8]], y: 0, h: 4.4,
    doors: [{ at: [0, 8], w: 3 }], fixtures: fixtures });
}
function noFit(plan) { return plan.report.missing.filter(function (m) { return m.reason === 'no-fit'; }); }
const FRONTS = [undefined, 0, 0.2, 0.4, 0.6];
function clr(f) { return f === undefined ? undefined : { front: f }; }

/* the shrine's altar against the back wall, with one fixture of every front clearance: a column, a long bench, a low plinth */
for (const front of FRONTS) {
  const fixes = [
    [{ id: 'col', kind: 'column', x: -6, z: 0, ry: 0, w: 0.6, d: 0.6, h: 4.4, clearance: clr(front) }],
    [{ id: 'bench', kind: 'bench', x: -5, z: -1, ry: 0, w: 0.9, d: 9, h: 0.5, clearance: clr(front) }],
    [{ id: 'plinth', kind: 'plinth', x: 5, z: 4, ry: 0.4, w: 1.2, d: 1.2, h: 0.3, clearance: clr(front) }]
  ];
  for (const fx of fixes) {
    const R = room('shrine', fx), p = IX.furnishRoom(R, cat, { optional: false });
    const altar = p.placements.filter(function (q) { return q.key === 'q_altar'; })[0];
    const tag = fx[0].id + ' front ' + front;
    ok(!noFit(p).length, tag + ': the altar fits (' + JSON.stringify(p.report.missing) + ')');
    ok(altar && altar.role === 'back' && altar.z < -7, tag + ': the altar stands on the back wall');
    const A = IX.audit(R, p, cat, { furnishOpts: { optional: false } });
    ok(A.ok, tag + ': audits clean ' + JSON.stringify(A.fails.slice(0, 3)));
    /* the fixture keeps MIN_USE free in front: nothing stands in it */
    const Fz = IX.clearanceZones({ w: fx[0].w, d: fx[0].d, clear: fx[0].clearance || {}, usable: true }, fx[0].x, fx[0].z, fx[0].ry)
      .filter(function (z) { return z.side === 'front'; })[0];
    ok(Fz && p.placements.every(function (q) { return q.anchor === 'ceiling' || !IX.geom.overlap(IX.geom.rect(q.x, q.z, q.ry, q.w, q.d), Fz.r, 0.005); }),
      tag + ': nothing stands in the 0.45 m in front of the fixture');
  }
}

/* a hall's table and seats, with a column of no front clearance */
for (const front of FRONTS) {
  const R = room('hall', [{ id: 'col', kind: 'column', x: -6, z: -3, ry: 0, w: 0.6, d: 0.6, h: 4.4, clearance: clr(front) }]);
  const p = IX.furnishRoom(R, cat);
  const k = function (key) { return p.placements.filter(function (q) { return q.key === key; }).length; };
  ok(!noFit(p).length && k('q_table') >= 1 && k('q_chair') >= 2, 'hall, column front ' + front + ': table and two seats (' + JSON.stringify(p.report.missing) + ')');
  ok(IX.audit(R, p, cat).ok, 'hall, column front ' + front + ': audits clean');
}

/* reach: false needs nothing in front (Girder's posts and benches) */
{
  const R = room('shrine', [{ id: 'post', kind: 'post', x: 0, z: 0, ry: 0, w: 0.5, d: 0.5, h: 4.4, reach: false }]);
  const p = IX.furnishRoom(R, cat, { optional: false });
  ok(!p.report.missing.length, 'an unreachable post: nothing missing ' + JSON.stringify(p.report.missing));
}

/* a fixture facing straight into a wall has no walkable cell in front: reported, and the room still furnishes */
{
  const R = room('shrine', [{ id: 'blind', kind: 'cabinet', x: 6, z: 7.5, ry: 0, w: 1.0, d: 0.8, h: 2, clearance: { front: 0.3 } }]);
  const p = IX.furnishRoom(R, cat, { optional: false });
  ok(p.report.blockedFixtures.some(function (m) { return m.id === 'blind' && /no walkable cell/.test(m.reason); }), 'a blind fixture is listed in blockedFixtures');
  ok(!p.report.missing.length, 'a blind fixture is not a missing need ' + JSON.stringify(p.report.missing));
  ok(!noFit(p).length && p.placements.some(function (q) { return q.key === 'q_altar'; }), 'a blind fixture does not void the room');
}

/* a fixture in a pocket walled off by two reach: false screens (a corner pen, x 7..11, z 4..8): its front is walkable but the
   door never reaches it. Reported, and the room still furnishes */
{
  const R = room('shrine', [
    { id: 'screen-a', kind: 'screen', x: 9, z: 4, ry: 0, w: 4, d: 0.3, h: 2, reach: false },
    { id: 'screen-b', kind: 'screen', x: 7, z: 6, ry: 0, w: 0.3, d: 4.3, h: 2, reach: false },
    { id: 'penned', kind: 'cabinet', x: 9, z: 5, ry: 0, w: 1.0, d: 0.6, h: 1.2, clearance: { front: 0.6 } }]);
  const p = IX.furnishRoom(R, cat, { optional: false });
  ok(p.report.blockedFixtures.some(function (m) { return m.id === 'penned' && /cut off/.test(m.reason); }), 'a penned fixture is listed in blockedFixtures ' + JSON.stringify(p.report.blockedFixtures));
  ok(!p.report.missing.length, 'a penned fixture is not a missing need');
  ok(!noFit(p).length && p.placements.some(function (q) { return q.key === 'q_altar'; }), 'a penned fixture does not void the room');
}

/* the planner's stairs (front S.land - 0.1) are untouched: a two-storey building furnishes as before (its own tests: core_test.js) */

if (fails.length) { console.log('FAIL ' + fails.length + '\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('ok: fixtures of every front clearance (none, 0, 0.2, 0.4, 0.6) leave the altar, the table and its seats a fit');
