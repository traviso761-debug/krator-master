#!/usr/bin/env node
/* settlements/tempest/tests/test-tempest.js: the House of the Tempest's layout (src/80t-tp-plan-data.js, TEMPEST; step 0).
   The plan keeps the Xanadui fort's rules (kits/xanadu XFORT.check) and the concentric house's own, every wall walk of both
   wards is reached from a stair (XFORT.walks), the plan is the blueprint's (settlements/strongwall/tempest/tempest_plan.json),
   and each rule catches the fault it is for (a negative is a pair: it fails the faulty plan and passes the fixed one,
   tools/ktest.js).

     node settlements/tempest/tests/test-tempest.js */
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
global.window = global;
(0, eval)(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8') + '\nglobal.KRAND=KRAND;');
global.XFORT = require(path.join(ROOT, 'kits', 'xanadu', 'src', '80f-xa-fort-data.js'));
const TP = require(path.join(__dirname, '..', 'src', '80t-tp-plan-data.js'));
const BP = JSON.parse(fs.readFileSync(path.join(ROOT, 'settlements', 'strongwall', 'tempest', 'tempest_plan.json'), 'utf8'));
const P = TP.plan();
const copy = () => { const Q = JSON.parse(JSON.stringify(P)); Q.S = P.S; Q.IN = P.IN; return Q; };
const rule = name => Q => TP.RULES[name](Q).length === 0;
const xrule = name => Q => XFORT.RULES[name](Q).length === 0;

// 1. the plan keeps every rule
{ const f = TP.check(P);
  T.ok('the House keeps the fort asset\'s rules and the concentric ones', f.length === 0, f.join('; ') || (P.towers.length + ' towers, ' + P.gates.length + ' gates, ' + P.buildings.length + ' buildings, ' + P.curtains.length + ' curtains')); }

// 2. every wall walk of both wards is reached from its stairs
for (const w of ['outer', 'inner']) {
  const Q = TP[w](P), W = XFORT.walks(Q), un = W.walks.filter(x => !x.reached).length + W.flights.filter(x => !x.reached).length;
  T.ok('every wall walk and tower stair of the ' + w + ' ward is reached', un === 0 && W.walks.length > 0,
    W.walks.length + ' walks, ' + W.flights.length + ' flights, ' + W.stairs.length + ' stairs; ' + un + ' unreached'); }

// 3. the plan is the blueprint's: its wards, its utse, its monastery and its numbers (tempest_plan.json is in the blueprint's frame)
{ const box = poly => { const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]); return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]; };
  const ob = box(BP.fort.outer.poly.map(p => TP.fromBlueprint(p[0], p[1]))), ib = box(BP.fort.inner.poly.map(p => TP.fromBlueprint(p[0], p[1])));
  const po = box(P.wards.find(w => w.id === 'outer').poly), pi = box(P.wards.find(w => w.id === 'inner').poly);
  const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
  const ur = BP.utse.rect, u0 = TP.fromBlueprint(ur[0], ur[2]), u1 = TP.fromBlueprint(ur[1], ur[3]);
  const hr = BP.hosted.rect, h0 = TP.fromBlueprint(hr[0], hr[2]), h1 = TP.fromBlueprint(hr[1], hr[3]);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], um = mid(u0, u1), hm = mid(h0, h1);
  const ok3 = same(ob, po) && same(ib, pi) && Math.hypot(um[0] - P.utse.at[0], um[1] - P.utse.at[1]) < 1e-6 && Math.hypot(hm[0] - P.hosted.at[0], hm[1] - P.hosted.at[1]) < 1e-6 &&
    BP.hosted.key === P.hosted.key && BP.hosted.o.v === P.hosted.o.v && BP.people.companies === P.people.companies && BP.people.novices === P.people.novices &&
    BP.horses.stalls_flanks === P.horses.stabledFlanks && BP.fort.towers.length > 0 && BP.fort.gates.length === 5;
  T.ok('the plan is the blueprint\'s: its two wards, the utse, the violet monastery and the people (tempest_plan.json)', ok3,
    'outer ' + po.join(',') + ' (blueprint ' + ob.join(',') + '); inner ' + pi.join(',') + ' (' + ib.join(',') + '); utse at ' + P.utse.at + ' (' + um + '); monastery at ' + P.hosted.at + ' (' + hm + ')'); }

// 4. the numbers: the stables hold the war horses, the gold is in three places
{ const R = P.buildings.filter(b => b.kind === 'stable-range'), n = R.reduce((s, b) => s + TP.stalls(b), 0);
  T.ok('the four stable ranges hold the 292 war horses, the eight companies over them', n >= 292 && R.reduce((s, b) => s + b.companies.length, 0) === 8, n + ' stalls in ' + R.length + ' ranges'); }

// 5. each rule catches its fault
T.neg('an inner ward pushed against the outer curtain is caught (the lists)', rule('the inner ward inside the outer, the lists at least 20 m wide'),
  (() => { const Q = copy(); Q.wards.find(w => w.id === 'inner').poly.forEach(p => { p[0] += 40; }); return Q; })(), copy());
T.neg('an inner curtain lower than the outer is caught', rule('the inner curtain commands the outer'),
  (() => { const Q = copy(); Q.curtains.filter(c => c.ward === 'inner').forEach(c => { c.y = 0; c.h = 8; }); return Q; })(), copy());
T.neg('a utse moved off the inner front is caught', rule('the utse astride the inner front, the inner gate through it'),
  (() => { const Q = copy(); Q.utse.at = [0, 20]; return Q; })(), copy());
T.neg('an outer curtain with no south sally gate is caught', rule('three gates: the main on the front, a sally on each flank'),
  (() => { const Q = copy(); Q.gates = Q.gates.filter(g => g.id !== 'gate.sally.s'); return Q; })(), copy());
T.neg('a monastery within 6 m of the inner curtain is caught', rule('the hosted monastery in the inner ward, clear of its curtain by 6 m'),
  (() => { const Q = copy(); Q.hosted.at = [20, -6]; return Q; })(), copy());   /* its north range 0.5 m from the curtain's inner face */
T.neg('an outer building on the inner ward\'s talus is caught', rule('every building in its ward, none on the talus from outside'),
  (() => { const Q = copy(); Q.buildings.find(b => b.id === 'hay.s').at = [-50, 50]; return Q; })(), copy());
T.neg('an outer building on the muster court is caught', rule('every building in its ward, none on the talus from outside'),
  (() => { const Q = copy(); Q.buildings.find(b => b.id === 'east.n').at = [44, 100]; return Q; })(), copy());
T.neg('stables too short for the war horses are caught', rule('the stables hold the war horses, the halls over them the eight companies'),
  (() => { const Q = copy(); Q.buildings.filter(b => b.kind === 'stable-range').forEach(b => { b.d = 40; }); return Q; })(), copy());
T.neg('gold in a fourth place is caught', rule('gold in three places only'), (() => { const Q = copy(); Q.gold.push('the Storm Tower\'s roof'); return Q; })(), copy());
T.neg('a corner of the outer ward without its tower is caught (the fort asset\'s rule, on the House)', xrule('a tower at every corner'),
  (() => { const Q = copy(); Q.towers = Q.towers.filter(t => t.id !== 'outer.t2'); return Q; })(), copy());
T.neg('a curtain with towers 60 m apart is caught (the fort asset\'s rule, on the House)', xrule('towers no further apart than the size allows'),
  (() => { const Q = copy(); Q.towers = Q.towers.filter(t => !/^outer\.c1\.i[1-3]$/.test(t.id)); return Q; })(), copy());
T.neg('a wall walk with no stair is caught (the fort asset\'s rule, on the House)', xrule('every wall walk reaches a stair'),
  (() => { const Q = copy(); Q.stairs = Q.stairs.filter(s => !/^inner/.test(s.curtain)); return Q; })(), copy());
// 6. step 4, the grounds and the crest (src/80w TP_GROUNDS): the sheet T0's fields, tracks and pieces keep their rules
global.TEMPEST = TP;
const GR = require(path.join(__dirname, '..', 'src', '80w-tp-grounds-data.js'));
const gcopy = () => JSON.parse(JSON.stringify({ fields: GR.fields, tracks: GR.tracks, pieces: GR.pieces }));
const grule = name => G => GR.RULES[name](P, G).length === 0;
{ const f = GR.check(P);
  T.ok('the crest\'s grounds keep their rules (sheet T0)', f.length === 0, f.join('; ') || (GR.fields.length + ' fields, ' + GR.tracks.length + ' tracks, ' + GR.pieces.length + ' pieces')); }
T.neg('a field pushed inside the curtain is caught', grule('the crest\'s grounds lie outside the curtain'),
  (() => { const G = gcopy(); G.fields.find(f => f.id === 'hives').box = [0, 0, 20, 20]; return G; })(), gcopy());
T.neg('a sally track that leaves from no gate is caught', grule('the sally tracks leave from the sally gates'),
  (() => { const G = gcopy(); G.tracks.find(t => t.id === 'track.sally.n').pts[0] = [60, 60]; return G; })(), gcopy());
T.neg('a hay rick standing in the tea garden is caught', grule('every piece stands in its ground'),
  (() => { const G = gcopy(); G.pieces.find(p => p.id === 'hay.rick.0').at = GR.fields.find(f => f.id === 'tea').box.slice(0, 2).map(v => v + 5); return G; })(), gcopy());
// 7. step 4b, life on the crest (src/80x TP_LIFE): the herds by day and by night, seeded through core/rand, and the chain of fires
const LI = require(path.join(__dirname, '..', 'src', '80x-tp-life-data.js'));
{ const f = LI.check(GR, P), day = LI.place(GR, 'day'), night = LI.place(GR, 'night');
  T.ok('the herds keep their rules by day and by night', f.ok, f.fails.join('; ') || (day.length + ' beasts by day, ' + night.length + ' by night'));
  const again = LI.place(GR, 'day');
  T.ok('the herds stand where they stood (each beast from its own hash)', JSON.stringify(again) === JSON.stringify(day), 'a second draw moved them'); }
const lrule = name => G => LI.RULES[name](G, P).length === 0;
T.neg('a paddock too small for the horses is caught (a short count)', lrule('every herd is at its count by day and by night'),
  (() => { const G = gcopy(); const b = G.fields.find(f => f.id === 'paddock').box; b[2] = b[0] + 40; b[3] = b[1] + 40; return G; })(), gcopy());
T.neg('a beast standing on a shed is caught', A => LI.RULES['every beast stands inside its field, clear of the pieces and the tracks'](GR, P, null, A).length === 0,
  (() => { const A = LI.place(GR, 'day'), sh = GR.pieces.find(p => p.id === 'byres.shed.a'), a = A.find(q => q.herd === 'milk'); a.x = sh.at[0]; a.z = sh.at[1]; return A; })(),
  LI.place(GR, 'day'));
T.neg('a horse herd kept out of the paddock by night is caught', hs => LI.RULES['the horses come into the walled paddock by night'](GR, P, hs).length === 0,
  LI.herds.map((h, i) => Object.assign({}, h, i === 0 ? { night: 'commons' } : {})), LI.herds.map(h => Object.assign({}, h)));
T.done();
