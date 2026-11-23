#!/usr/bin/env node
/* kits/xanadu/tests/test-fort.js: the Xanadui fort's plan (src/80f-xa-fort-data.js, XFORT; settlements/strongwall/PLAN.md
   section 5, F1). Every size plans a fort that keeps the rules, a ward of any convex outline does too, and each rule
   catches the fault it is for (a negative is a pair: it fails the faulty plan and passes the fixed one, tools/ktest.js).
   The damaged and ruined states are hashed from core/rand: the same seed gives the same ruin, and every ruin keeps its
   outline (no breach in a gated curtain, none on a tower).

     node kits/xanadu/tests/test-fort.js */
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
global.window = global;
(0, eval)(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8'));
const XF = require(path.join(__dirname, '..', 'src', '80f-xa-fort-data.js'));
const clone = o => JSON.parse(JSON.stringify(o, (k, v) => k === 'S' ? undefined : v));
const withS = (P, Q) => Object.assign(Q, { S: P.S });

// 1. every size keeps the rules
for (const size of ['watch', 'march', 'gate']) {
  const P = XF.plan({ size }), F = XF.check(P);
  T.ok('the ' + size + ' fort keeps every rule (' + P.curtains.length + ' curtains, ' + P.towers.length + ' towers, ' + P.gates.length + ' gates, ' + P.buildings.length + ' buildings; ' + P.w + ' x ' + P.d + ' m)',
    F.length === 0, F.slice(0, 6).join(' | '));
}
// 2. a ward of another outline (a pentagon on a spur, given clockwise: the plan turns it) keeps them too
{const pent = [[-30, 18], [30, 18], [36, -6], [0, -26], [-36, -6]].reverse(), P = XF.plan({ size: 'watch', outline: pent, gateEdge: 0 }), F = XF.check(P);
 T.ok('a pentagonal watch fort keeps every rule (' + P.towers.length + ' towers)', F.length === 0, F.slice(0, 6).join(' | '));}
// 3. Strongwall: its gates, its gorge wall, its assay, the Tears' court, its guns
{const P = XF.plan({ size: 'march' }), ids = P.gates.map(g => g.id).sort().join(',');
 const has = k => P.buildings.some(b => b.kind === k);
 T.ok('Strongwall: the Qiblai, inner, Gold and water gates; the gorge wall with its rock towers; the keep, the assay, the strongroom, the Tears\' court, three guns',
   ids === 'gate.gold,gate.inner,gate.qiblai,gate.water' && P.towers.filter(t => t.kind === 'rock').length === 2 && has('keep') && has('assay-furnace') && has('strongroom') && !!P.court && P.guns.length === 3,
   ids + '; rock towers ' + P.towers.filter(t => t.kind === 'rock').length + '; guns ' + P.guns.length);
 T.ok('Strongwall\'s towers stand proud of the wall: every tower\'s inner face flush with the wall, its centre pushed out',
   P.towers.every(t => Math.hypot(t.ctr[0] - t.at[0], t.ctr[1] - t.at[1]) <= XF.half(t) + .01), '');}
// 4. each rule catches its fault
{const P = XF.plan({ size: 'watch' }), rule = k => Q => XF.RULES[k](Q).length === 0;
 const noCorner = withS(P, clone(P)); noCorner.towers = noCorner.towers.filter(t => t.kind !== 'corner' || t.id !== noCorner.towers.find(q => q.kind === 'corner').id);
 T.neg('a ward missing a corner tower is caught', rule('a tower at every corner'), noCorner, P);
 const sparse = withS(P, clone(P)); sparse.towers = sparse.towers.filter(t => t.kind === 'corner');
 T.neg('towers too far apart are caught', rule('towers no further apart than the size allows'), sparse, P);
 const cornerGate = withS(P, clone(P)); cornerGate.gates[0].t = .05;
 T.neg('a gate in a corner is caught', rule('the gate on an edge, never in a corner'), cornerGate, P);
 const noStair = withS(P, clone(P)); noStair.stairs = [];
 T.neg('a wall walk with no stair is caught', rule('every wall walk reaches a stair'), noStair, P);
 const clash = withS(P, clone(P)); clash.buildings.find(b => b.kind === 'stables').at = clash.buildings.find(b => b.kind === 'keep').at.slice();
 T.neg('a building on another is caught', rule('no building overlaps another, a tower or a curtain'), clash, P);
 const hug = withS(P, clone(P)); hug.buildings.find(b => b.kind === 'keep').at[1] -= 6;
 T.neg('a keep against the curtain is caught', rule('the keep clear of the curtain by 6 m'), hug, P);}
// 5. the states: hashed (the same seed, the same ruin), and they keep the outline
const D = (size, state, seed) => XF.damage(XF.plan({ size }), state, seed);
{const a = JSON.stringify(D('march', 'ruined', 7)), b = JSON.stringify(D('march', 'ruined', 7)), c = JSON.stringify(D('march', 'ruined', 8));
 T.ok('a ruin is hashed: the same seed gives the same ruin, another seed another', a === b && a !== c, '');}
const stateCheck = (P, Dm) => {const bad = [], gated = new Set(P.gates.map(g => g.curtain));
  Dm.breaches.forEach(br => {const c = P.curtains.find(q => q.id === br.curtain), L = Math.hypot(c.b[0] - c.a[0], c.b[1] - c.a[1]);
    if (gated.has(br.curtain)) bad.push('a breach in the gated ' + br.curtain);
    P.towers.forEach(t => {const f = ((t.at[0] - c.a[0]) * (c.b[0] - c.a[0]) + (t.at[1] - c.a[1]) * (c.b[1] - c.a[1])) / (L * L), off = Math.abs((t.at[0] - c.a[0]) * (c.b[1] - c.a[1]) - (t.at[1] - c.a[1]) * (c.b[0] - c.a[0])) / L;
      if (off < 1 && f > br.u0 - .02 && f < br.u1 + .02) bad.push('a breach through the tower ' + t.id);});
    if (!(br.u1 > br.u0 && br.u0 > 0 && br.u1 < 1)) bad.push('a breach off its curtain ' + br.curtain);});
  Object.keys(Dm.stubs).forEach(id => {const s = Dm.stubs[id]; if (Math.abs(s[0].u0) > 1e-6 || Math.abs(s[s.length - 1].u1 - 1) > .011) bad.push('the stubs of ' + id + ' do not run its length');});
  if (Dm.state === 'damaged' && !Dm.breaches.length) bad.push('a damaged fort with no breach');
  if (Dm.state === 'ruined' && Object.keys(Dm.stubs).length !== P.curtains.length) bad.push('a ruined fort with a curtain left whole');
  return bad;};
for (const size of ['watch', 'march', 'gate']) for (const st of ['damaged', 'ruined']) {
  if (size === 'gate' && st === 'damaged') continue;   // the gate works has no ungated curtain over 24 m to breach
  const P = XF.plan({ size }), bad = []; for (let seed = 0; seed < 25; seed++) bad.push(...stateCheck(P, XF.damage(P, st, seed)));
  T.ok('the ' + size + ' fort ' + st + ' (25 seeds): its breaches clear of gates and towers, its stubs the whole of every curtain', bad.length === 0, bad.slice(0, 4).join(' | '));
}
{const P = XF.plan({ size: 'watch' }), Dm = XF.damage(P, 'damaged', 3), gated = P.gates[0].curtain;
 const bad = JSON.parse(JSON.stringify(Dm)); bad.breaches = [{ curtain: gated, u0: .45, u1: .55 }];
 T.neg('a breach through the gate\'s curtain is caught', x => stateCheck(P, x).length === 0, bad, Dm);}
// 6. the watch post
{const W = XF.post(); T.ok('the watch post: a tower, its basket, a fuel store and a hut on its lot', W.tower.h > 6 && Math.abs(W.tower.at[0]) + W.tower.w / 2 <= W.w / 2 && W.rota === 4, JSON.stringify(W.tower));}
T.done();
