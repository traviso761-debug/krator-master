#!/usr/bin/env node
/* settlements/marches/tests/test-marches.js: the Marches' west and south watch forts as records (src/80n-mr-forts.js, MRF; PLAN.md
   sections 1, 3 and 7, M1 and M3). The forts' ids, names, px, people and state are XAN_TUNE's (read in place, the region's plan
   or none giving the same records), the garrison sums to the tune's people with the tune's musketeers, the fort asset's watch
   plan keeps every rule (XFORT.check: []), the two forts fall differently, and the M3 pins are the forts'. Each negative is a
   pair (tools/ktest.js): the check fails the fault and passes the fix.

     node settlements/marches/tests/test-marches.js */
'use strict';
const fs = require('fs'), path = require('path');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
global.window = global;
(0, eval)(fs.readFileSync(path.join(ROOT, 'core', 'rand', '08-core-rand.js'), 'utf8'));
const KR = global.KRAND;
const XT = require(path.join(ROOT, 'core', 'region', 'data', 'xan-tune.js'));
const XF = require(path.join(ROOT, 'kits', 'xanadu', 'src', '80f-xa-fort-data.js'));
const MRF = require(path.join(__dirname, '..', 'src', '80n-mr-forts.js'));
const PLAN = JSON.parse(fs.readFileSync(path.join(ROOT, 'openworld', 'xanadu-oidong-highrift', 'plan', 'sites.json'), 'utf8'));

const R = MRF.records(XT, XF, KR), RP = MRF.records(XT, XF, KR, XT.valley(PLAN, {}));
const keyOf = F => [F.id, F.name, F.px.join(','), F.people, F.state, F.parent].join('|');

// 1. the forts are the tune's: the two ids, read with no region plan exactly as with the region's
T.ok('the two forts are march.w and march.s', R.forts.map(F => F.id).join(',') === 'march.w,march.s', R.forts.map(F => F.id).join(','));
T.ok('the records with no region plan are the region plan\'s (ids, names, px, people, state, parent)',
  R.forts.map(keyOf).join(' / ') === RP.forts.map(keyOf).join(' / '), R.forts.map(keyOf).join(' / ') + ' against ' + RP.forts.map(keyOf).join(' / '));
{const tuneFort = id => XT.valley({ sites: [] }, {}).settlements.find(s => s.id === id);
 for (const F of R.forts) {
   const s = tuneFort(F.id);
   T.ok(F.id + ' reads the tune: ' + F.people + ' people, state ' + F.state + ', px ' + F.px.join(','),
     s && F.people === s.people && F.state === s.state && F.name === s.name && F.px[0] === Math.round(s.x / 2000 + 1191) && F.px[1] === Math.round(s.z / 2000 + 1569),
     JSON.stringify(s && { people: s.people, state: s.state, x: s.x, z: s.z }));
 }}
T.ok('the px are the plan\'s (march.w 818,1531; march.s 843,1546)', R.forts[0].px.join(',') === '818,1531' && R.forts[1].px.join(',') === '843,1546', R.forts.map(F => F.px.join(',')).join(' '));
T.ok('both forts are 150 and kept (PLAN.md section 1)', R.forts.every(F => F.people === 150 && F.state === 'kept'), R.forts.map(F => F.people + ' ' + F.state).join(', '));

// 2. the garrison: the musketeers are T.muskets', the split sums to the tune's people, every part a real number of men
const sums = F => { const g = F.garrison, n = g.household + g.foot + g.horse + g.musketeers + g.gunners + g.postRota;
  return n === F.people && g.musketeers === (XT.muskets.men[F.id] | 0) && Object.keys(g).every(k => g[k] >= 0 && Number.isInteger(g[k])) && g.foot > 0; };
for (const F of R.forts)
  T.ok(F.id + '\'s garrison sums to ' + F.people + ' with the tune\'s ' + F.musketeers + ' musketeers (' + JSON.stringify(F.garrison) + ')', sums(F), JSON.stringify(F.garrison));
T.ok('the musketeers are 10 a fort (T.muskets.men)', R.forts.every(F => F.musketeers === 10), R.forts.map(F => F.musketeers).join(','));
{const F = R.forts[0], bad = JSON.parse(JSON.stringify(F));
 bad.garrison.foot += 4;   /* a split that no longer sums to the tune's people */
 T.neg('a garrison that does not sum to the tune\'s people is caught', sums, bad, F);
 const bad2 = JSON.parse(JSON.stringify(F)); bad2.garrison.musketeers = 12; bad2.garrison.foot -= 2;   /* sums, but not the tune's musketeers */
 T.neg('a garrison with other than the tune\'s musketeers is caught', sums, bad2, F);}
{/* read, not copied: a tune whose west fort hires 14 musketeers gives records with 14, and a garrison that still sums */
 const T2 = Object.assign({}, XT, { muskets: Object.assign({}, XT.muskets, { men: Object.assign({}, XT.muskets.men, { 'march.w': 14 }) }) });
 const R2 = MRF.records(T2, XF, KR);
 const g = R2.forts[0].garrison, n = g.household + g.foot + g.horse + g.musketeers + g.gunners + g.postRota;
 T.ok('the records follow the tune (14 musketeers hired at march.w give 14, the split still sums to 150)', R2.forts[0].musketeers === 14 && g.musketeers === 14 && n === 150, JSON.stringify(g));}

// 3. the plan: the asset's watch fort keeps every rule; its keep carries the beacon, one gun on the gate
T.ok('XFORT.check of the watch plan is [] (' + R.P.curtains.length + ' curtains, ' + R.P.towers.length + ' towers, ' + R.P.buildings.length + ' buildings)', R.faults.length === 0, R.faults.slice(0, 4).join(' | '));
T.ok('the plan is the watch size, dress march, 150 garrison, 12 t of grain', R.size === 'watch' && R.dress === 'march' && R.P.garrison === 150 && R.P.stores.grain_t === 12, R.size + ' ' + R.P.garrison + ' ' + R.P.stores.grain_t);
T.ok('the asset\'s garrison is the tune\'s people', R.forts.every(F => F.people === R.P.garrison), R.P.garrison + '');
T.ok('the keep carries the beacon basket and the gate one gun', R.P.beacon && R.P.beacon.on === 'keep' && R.P.buildings.some(b => b.kind === 'keep' && b.beacon) && R.P.guns.length === 1 && R.P.guns[0].gate === 'gate',
  JSON.stringify({ beacon: R.P.beacon, guns: R.P.guns }));
{const fixed = XF.plan({ size: 'watch' }), faulty = XF.plan({ size: 'watch' });
 faulty.towers = faulty.towers.filter(t => t.kind !== 'corner' || t.id !== faulty.towers.find(q => q.kind === 'corner').id);   /* a corner without its tower */
 T.neg('XFORT.check catches a watch fort missing a corner tower', P => XF.check(P).length === 0, faulty, fixed);}

// 4. the states: the two forts fall differently (their own seeds), each the same every time
{const [w, s] = R.forts, dw = XF.damage(R.P, 'damaged', w.seed), ds = XF.damage(R.P, 'damaged', s.seed);
 const sig = D => JSON.stringify([D.breaches, Object.keys(D.towers).sort()]);
 T.ok('the two forts have their own seeds', w.seed !== s.seed && w.seed === (KR.child(20261123, 'march.w') >>> 0), w.seed + ' ' + s.seed);
 T.ok('the same seed gives the same damage', sig(dw) === sig(XF.damage(R.P, 'damaged', w.seed)), sig(dw));
 T.ok('the west and the south fort are breached differently', sig(dw) !== sig(ds), sig(dw) + ' / ' + sig(ds));
 for (const F of R.forts) {
   const D = XF.damage(R.P, 'damaged', F.seed), U = XF.damage(R.P, 'ruined', F.seed);
   T.ok(F.id + ' damaged: a breach with its heap, a fallen tower top, the gate burnt; ruined: every curtain in stubs, the keep low',
     D.breaches.length === 1 && D.heaps.length >= 1 && Object.keys(D.towers).length === 1 && D.gates.gate === 'burnt' &&
     Object.keys(U.stubs).length === R.P.curtains.length && U.keep && U.keep.storeys >= 1 && U.keep.storeys <= 2,
     JSON.stringify({ breaches: D.breaches.length, heaps: D.heaps.length, gate: D.gates.gate, stubs: Object.keys(U.stubs).length, keep: U.keep }));
 }}

// 5. M3: the pins are listed for the queue, records only, the fort type, at the tune's px
{const P = MRF.pins(R);
 T.ok('the pins: smarchw0001 at 818,1531 and smarchs0001 at 843,1546, type fort, records only',
   P.length === 2 && P[0].id === 'smarchw0001' && P[0].px.join(',') === '818,1531' && P[1].id === 'smarchs0001' && P[1].px.join(',') === '843,1546' && P.every(p => p.type === 'fort' && p.records_only),
   JSON.stringify(P));}
T.done();
