// node openworld/outposts/tests/test-outposts.js: the player's settlements (KOUTPOST, openworld/outposts/PLAN.md).
// Each check has a negative that must fail. "Outpost" means any settlement the player founds (owner, 2026-11-09); the
// NPC places stay apart. The scale model's settlement list and the three open worlds' region.json are READ here only to
// check coordinates and the references across the boundary: nothing NPC is ever registered.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
const SRC = 'openworld/outposts/src/10-outposts-registry.js';
load(SRC);
const K = vm.runInThisContext('KOUTPOST');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const J = o => JSON.stringify(o);
const readJ = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
/* the test's own generator, not the code under test's */
const mul = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* the scale model's NPC settlements (map 5.1), read in place */
const line = fs.readFileSync(path.join(ROOT, 'tools/scale-model/model/src/60-settlements.js'), 'utf8').split('\n').find(l => /const defSetts\s*=/.test(l));
const NPC = JSON.parse(line.slice(line.indexOf('['), line.lastIndexOf(']') + 1)).map(s => Object.assign({ map: '5.1' }, s));
const gateNpc = NPC.find(s => s.id === 'sthegate');
const PL = { kind: 'player', id: 'player' };
const spec = (px, py, o) => Object.assign({ name: 'Camp', kind: 'hunt', size: 'camp', place: K.place(px, py, '5.1', 100), day: 1 }, o || {});
const fresh = () => K.create();

// ---- coordinates: the regions' frames against the scale model's own pixels
/* the little demo was retired to archive/ (2026-10-20); its region file is read there */
const REGIONS = ['archive/little-demo', 'openworld/isle-demo', 'openworld/north-basin'].map(n => readJ(n + '/data/region.json'));
/* a region's own pixels (the old canvas, map '4') give its x, z exactly; the model's 5.1 pixels give them too, but for a
   place moved on the model since the region was cut (reported, not failed) */
let pairs = 0, off = 0, offOld = 0, own = 0, ownOff = 0;
const moved = [];
for (const j of REGIONS) for (const s of j.settlements) {
  own++;
  const q = K.toRegion(K.place(s.px, s.py, '4'), j.frame);
  if (Math.abs(q.x - s.x) > 1e-6 || Math.abs(q.z - s.z) > 1e-6) ownOff++;
  const m = NPC.find(n => n.id === s.doc); if (!m) continue;
  pairs++;
  const p = K.toRegion(K.place(m.px, m.py, '5.1'), j.frame), w = K.toRegion(K.place(m.px, m.py, '4'), j.frame);
  if (Math.abs(p.x - s.x) > 1e-6 || Math.abs(p.z - s.z) > 1e-6) { off++; moved.push(s.name); }
  if (Math.abs(w.x - s.x) > 1e-6 || Math.abs(w.z - s.z) > 1e-6) offOld++;
}
ok('the regions\' own pixels land on their region.json x, z', own >= 30 && ownOff === 0,
  REGIONS.every(j => j.settlements.every(s => J(K.toRegion(K.place(s.px, s.py, '5.1'), j.frame)) !== J({ x: s.x, z: s.z }))), own + ' places');
ok('the model\'s 5.1 pixels less 272, 330 land there too, but for places moved since the cut', pairs >= 20 && off <= pairs / 10,
  offOld === pairs, pairs + ' places; moved since: ' + (moved.join(', ') || 'none'));
const fr = REGIONS[0].frame, p0 = K.fromRegion(-12000, 34000, fr, '5.1'), back = K.toRegion(p0, fr);
const onOld = K.toMap(p0, '4');
ok('fromRegion and toRegion invert; toMap moves the pixel and keeps the place',
  back.x === -12000 && back.z === 34000 && onOld.px === p0.px - 272 && J(K.toMap(onOld, '5.1')) === J(p0),
  J(K.toRegion(onOld, fr)) === J(back) && J(K.toRegion(Object.assign({}, onOld, { map: '5.1' }), fr)) !== J(back));

// ---- the boundary: nothing NPC is registered
const R0 = fresh();
ok('the registry starts empty: it is not seeded from the NPC world', K.list(R0).length === 0 && K.save(R0).ops.length === 0 && !('seed' in K.save(R0)),
  K.fold({ seed: [{ id: 'op-sthegate' }], ops: [] }).errors.length === 1);
const npcAdd = { op: 'ADD', id: 'op-sthegate', rec: { id: 'op-sthegate', player: 'player', name: 'The Gate', kind: 'fort', size: 'town', place: K.place(gateNpc.px, gateNpc.py, '5.1'), founded: 0 } };
const r1 = K.apply(R0, npcAdd);
const plAdd = { op: 'ADD', id: 'ps-gate', rec: Object.assign({}, npcAdd.rec, { id: 'ps-gate' }) };
ok('an NPC place cannot be ADDed: only ps- ids, only this player\'s', !r1.ok && /not a player settlement id/.test(r1.why) &&
  !K.apply(fresh(), { op: 'ADD', id: 'ps-x', rec: Object.assign({}, plAdd.rec, { id: 'ps-x', player: 'screamers' }) }).ok,
  K.apply(fresh(), plAdd).ok, r1.why);
const withRef = refs => Object.assign({}, plAdd.rec, { refs, links: {}, tags: [], state: 'active', left: null, lostTo: null });
ok('refs only cross to the NPC world, by a known kind and relation',
  K.check(withRef([{ kind: 'scale', id: 'sthegate', rel: 'near' }, { kind: 'sim', id: 'kautoa', rel: 'trade' }])).length === 0,
  K.check(withRef([{ kind: 'scale', id: 'ps-other', rel: 'near' }])).length > 0 && K.check(withRef([{ kind: 'npc', id: 'x', rel: 'near' }])).length > 0 &&
  K.check(withRef([{ kind: 'sim', id: 'x', rel: 'love' }])).length > 0);
/* near the Gate as the model has it now (moved from 1408,414 to the Narrows on 2026-11-09): read from its record */
const nw = K.nearWorld(K.place(gateNpc.px + 2, gateNpc.py + 1, '5.1'), NPC, 20000);
ok('nearWorld reads the NPC places near a spot as refs, nearest first, keeping none', nw.length >= 1 && nw[0].id === 'sthegate' && nw[0].kind === 'scale' &&
  nw.every((f, i) => i === 0 || f.d >= nw[i - 1].d) && K.list(R0).length === 0,
  K.nearWorld(K.place(gateNpc.px + 2, gateNpc.py + 1, '5.1'), NPC, 1).length === 0, nw.map(f => f.name).join(', '));

// ---- founding
const R1 = fresh(), f1 = K.found(R1, spec(700, 900));
const rec1 = K.get(R1, f1.id);
ok('a founded settlement is the player\'s, claimed, dated, a ps- id, and valid',
  f1.ok && /^ps-[0-9a-z]+$/.test(f1.id) && rec1.player === 'player' && rec1.state === 'claimed' && rec1.founded === 1 && K.check(rec1).length === 0,
  !K.found(fresh(), Object.assign(spec(700, 900), { day: null })).ok && K.check(Object.assign({}, rec1, { founded: null })).length > 0);
const at = (dx, r) => Object.assign(spec(700, 900), { place: Object.assign(K.place(700, 900, '5.1', r), { x: K.place(700, 900, '5.1').x + dx }), day: 2 });
ok('the founding rule: apart from the player\'s own live settlements by gap',
  !K.canFound(R1, at(0, 100)).ok && !K.canFound(R1, at(399, 100)).ok && K.canFound(R1, at(401, 100)).ok,
  K.canFound(R1, at(399, 100), { gap: 0 }).ok && !K.canFound(R1, at(401, 100), { gap: 300 }).ok);
const clearNpc = (x, z, r) => { const h = K.nearWorld({ map: '5.1', x, z }, NPC, r + 3000)[0]; return h ? h.name + ' (' + h.id + ')' : null; };
const byGate = spec(gateNpc.px + 1, gateNpc.py);
ok('the world\'s NPC keep-clears and the page\'s ground can refuse a spot; the registry knows neither',
  !K.canFound(fresh(), byGate, { clear: clearNpc }).ok && /The Gate/.test(K.canFound(fresh(), byGate, { clear: clearNpc }).why) &&
  !K.canFound(fresh(), spec(10, 10), { ground: () => false }).ok,
  K.canFound(fresh(), byGate).ok && K.canFound(fresh(), spec(10, 10), { clear: clearNpc }).ok);
ok('founding refuses an unknown kind or size and a point that is not finite',
  !K.canFound(fresh(), Object.assign(spec(10, 10), { kind: 'castle' })).ok && !K.canFound(fresh(), Object.assign(spec(10, 10), { size: 'city' })).ok &&
  !K.canFound(fresh(), Object.assign(spec(10, 10), { place: { x: NaN, z: 0 } })).ok,
  K.canFound(fresh(), spec(10, 10)).ok);
const ra = fresh(), rb = fresh(), ia = K.found(ra, spec(10, 10)).id, ib = K.found(rb, spec(10, 10)).id;
const rc = fresh(); K.apply(rc, { op: 'ADD', id: ia, rec: Object.assign({}, plAdd.rec, { id: ia, place: K.place(900, 900, '5.1') }) });
const ic = K.found(rc, spec(10, 10)).id;
ok('a founded id is stable: the same founding gives the same id; a taken id moves on', ia === ib && ic !== ia,
  K.found(fresh(), Object.assign(spec(10, 10), { day: 2 })).id !== ia, ia + ', ' + ic);

// ---- the life of a settlement, as a log
function sample() {
  const reg = fresh(), A = [];
  const a = K.found(reg, spec(700, 900, { name: 'Ridge camp' })); A.push(a);
  A.push(K.apply(reg, { op: 'SET', id: a.id, day: 4, cause: 'built', set: { state: 'active', tags: ['palisade'] } }));
  A.push(K.apply(reg, { op: 'SET', id: a.id, day: 30, cause: 'grew', set: { size: 'village', links: { hamlet: 'ps-village-1' }, refs: [{ kind: 'sim', id: 'kautoa', rel: 'trade' }] } }));
  const b = K.found(reg, spec(720, 920, { name: 'Lookout', kind: 'fort', day: 31 })); A.push(b);
  A.push(K.abandon(reg, b.id, 40, 'starved'));
  A.push(K.apply(reg, { op: 'MOVE', id: a.id, day: 41, place: K.place(701, 900, '5.1', 150) }));
  const c = K.found(reg, spec(760, 960, { name: 'Mistake', day: 42 })); A.push(c);
  A.push(K.apply(reg, { op: 'REMOVE', id: c.id, day: 42, cause: 'undo' }));
  return { reg, A, a: a.id, b: b.id, c: c.id };
}
const S1 = sample(), sv = K.save(S1.reg), F2 = K.fold(JSON.parse(J(sv)));
const less = JSON.parse(J(sv)); less.ops.splice(2, 1);
ok('the player\'s save is the log: fold(save(reg)) gives the same settlements, through JSON',
  S1.A.every(x => x.ok) && F2.errors.length === 0 && J(K.list(F2.reg)) === J(K.list(S1.reg)) && sv.ops.length === 8 && sv.format === 'krator-player-settlements/1',
  J(K.list(K.fold(less).reg)) !== J(K.list(S1.reg)));
const grown = K.get(S1.reg, S1.a), left = K.get(S1.reg, S1.b);
ok('growing changes the size and the layout module; abandoning dates it', grown.size === 'village' && J(K.layout(grown)) === J({ module: 'core/hamlet', id: 'ps-village-1' }) &&
  left.state === 'abandoned' && left.left === 40 && K.layout(rec1).module === 'core/camp',
  K.check(Object.assign({}, left, { left: null })).length > 0);
const R3 = sample().reg;
const lost = K.apply(R3, { op: 'SET', id: S1.a, day: 50, set: { state: 'lost', lostTo: { kind: 'faction', id: 'screamers' } } });
const lostRec = K.get(R3, S1.a);
const back2 = K.apply(R3, { op: 'SET', id: S1.a, day: 60, cause: 'retaken', set: { state: 'active' } });
ok('a settlement taken by others is lost (with its taker, a ref out) and can be retaken', lost.ok && lostRec.lostTo.id === 'screamers' && lostRec.left === 50 &&
  back2.ok && K.get(R3, S1.a).lostTo === null && K.get(R3, S1.a).left === null,
  !K.apply(sample().reg, { op: 'SET', id: S1.a, day: 50, set: { state: 'lost' } }).ok);

/* each refused op must leave the registry exactly as it was */
const R2 = sample().reg;
K.apply(R2, { op: 'SET', id: S1.b, day: 45, set: { state: 'ruined' } });
const REFUSED = [
  ['ADD of an existing id', { op: 'ADD', id: S1.a, rec: Object.assign({}, plAdd.rec, { id: S1.a }) }],
  ['ADD of a removed id', { op: 'ADD', id: S1.c, rec: Object.assign({}, plAdd.rec, { id: S1.c }) }],
  ['ADD whose rec id differs', { op: 'ADD', id: 'ps-new', rec: Object.assign({}, plAdd.rec, { id: 'ps-other' }) }],
  ['ADD of an invalid record', { op: 'ADD', id: 'ps-new', rec: Object.assign({}, plAdd.rec, { id: 'ps-new', state: 'thriving' }) }],
  ['SET of the id', { op: 'SET', id: S1.a, set: { id: 'ps-x' } }],
  ['SET of the player', { op: 'SET', id: S1.a, set: { player: 'screamers' } }],
  ['SET of founded', { op: 'SET', id: S1.a, set: { founded: 0 } }],
  ['SET of the place (MOVE moves)', { op: 'SET', id: S1.a, set: { place: K.place(1, 1, '5.1') } }],
  ['SET of an unknown link', { op: 'SET', id: S1.a, set: { links: { shop: 'x' } } }],
  ['SET of a ref into the registry', { op: 'SET', id: S1.a, set: { refs: [{ kind: 'sim', id: S1.b, rel: 'trade' }] } }],
  ['ruined straight to lost', { op: 'SET', id: S1.b, day: 46, set: { state: 'lost', lostTo: { kind: 'people', id: 'kimr' } } }],
  ['left set on a live settlement', { op: 'SET', id: S1.a, set: { left: 4 } }],
  ['lostTo on a settlement that is not lost', { op: 'SET', id: S1.a, set: { lostTo: { kind: 'faction', id: 'x' } } }],
  ['MOVE to a place whose x, z disagree with its pixel', { op: 'MOVE', id: S1.a, place: Object.assign(K.place(5, 5, '5.1'), { z: 1 }) }],
  ['MOVE onto an unknown map', { op: 'MOVE', id: S1.a, place: Object.assign(K.place(5, 5, '5.1'), { map: '9' }) }],
  ['an op on a missing id', { op: 'SET', id: 'ps-nobody', set: { name: 'x' } }],
  ['an unknown op', { op: 'RENAME', id: S1.a }],
  ['a fractional day', { op: 'SET', id: S1.a, day: 2.5, set: { name: 'x' } }]
];
K.apply(R2, { op: 'SET', id: S1.a, day: 47, set: { state: 'destroyed' } });
REFUSED.push(['a destroyed settlement brought back', { op: 'SET', id: S1.a, day: 48, set: { state: 'active' } }]);
REFUSED.forEach(x => { if (x[1].id === S1.a && x[0] !== 'a destroyed settlement brought back' && x[1].op !== 'ADD') x[1].id = S1.b; });
const before = J(K.list(R2)) + J(R2.log);
const leaks = REFUSED.filter(([n, op]) => K.apply(R2, op).ok || J(K.list(R2)) + J(R2.log) !== before).map(x => x[0]);
ok('every bad op is refused and changes nothing (' + REFUSED.length + ' kinds)', leaks.length === 0,
  K.apply(R2, { op: 'SET', id: S1.b, set: { name: 'Old lookout' } }).ok && J(K.list(R2)) + J(R2.log) !== before, leaks.join('; '));
const broken = K.save(S1.reg); broken.ops.splice(1, 0, { op: 'SET', id: 'ps-nobody', set: { name: 'x' } });
const FB = K.fold(broken);
ok('fold stops at the first refused op and names it', FB.errors.length === 1 && /^op 1:/.test(FB.errors[0]) && FB.reg.log.length === 1,
  K.fold(K.save(S1.reg)).errors.length === 0);

// ---- where it touches the world
const kc = K.keepClear(S1.reg);
ok('keepClear gives the world every settlement still standing, abandoned ones too, never a destroyed one',
  kc.length === 2 && kc.some(d => d.id === S1.b) && kc.find(d => d.id === S1.a).r === 150,
  K.keepClear(R2).every(d => d.id !== S1.a) && K.keepClear(R2).length === 1);
ok('simSpec: the player\'s faction runs it as a player settlement; tradeWith reads its sim refs',
  J(K.simSpec(grown)) === J({ id: S1.a, faction: 'player', name: 'Ridge camp', kind: 'player', size: 'village', outpost: S1.a }) &&
  J(K.tradeWith(grown)) === J(['kautoa']),
  K.simSpec(Object.assign({}, grown, { links: Object.assign({}, grown.links, { settlement: 'pl-1' }) })).id === 'pl-1' && K.tradeWith(rec1).length === 0);

// ---- nearness through KSPACE equals a scan
const R5 = fresh(), rnd = mul(20261109);
for (let i = 0; i < 300; i++) K.found(R5, spec(Math.floor(400 + rnd() * 1200), Math.floor(300 + rnd() * 1400), { place: K.place(Math.floor(400 + rnd() * 1200), Math.floor(300 + rnd() * 1400), '5.1', 50 + Math.floor(rnd() * 3000)) }), { gap: 0 });
let diff = 0;
for (let q = 0; q < 200; q++) {
  const x = (400 + rnd() * 1200) * 2000, z = (300 + rnd() * 1400) * 2000, r = rnd() * 20000;
  const a = K.near(R5, x, z, r).map(o => o.id), b = K.list(R5).filter(o => Math.hypot(o.place.x - x, o.place.z - z) <= o.place.r + r).map(o => o.id);
  if (J(a) !== J(b)) diff++;
}
ok('near() answers what a scan answers, in registry order (' + K.list(R5).length + ' settlements, 200 queries)', diff === 0 && K.list(R5).length > 250,
  J(K.near(R5, 0, 0, 1)) === '[]');
const box = fr.box_px.map((v, i) => (v - fr.origin_px[i % 2]) * 2000);
const RB = fresh(); K.found(RB, spec(1229, 885, { name: 'In' })); K.found(RB, spec(448, 838, { name: 'Out' }));
ok('inRegion keeps the settlements inside a region\'s box', J(K.inRegion(RB, fr, box).map(r => r.name)) === J(['In']), K.inRegion(RB, fr, [0, 0, 1, 1]).length === 0);

// ---- candidates (the kits' hints)
const FIREBLISS = [
  { id: 'firebliss:great-vale', kit: 'firebliss', name: 'Great Firebliss Vale', place: { map: '5.1', px: 184, py: 1318, r: 900 },
    suits: ['home', 'farm', 'hunt', 'trade'], has: { water: 1, warmth: 1, ground: 1, resource: 0.5, shelter: 1 }, risks: ['gas', 'flood'],
    _note: 'the largest valley and tarn; the best ground to grow on' },
  { id: 'firebliss:solfatara-glen', kit: 'firebliss', name: 'Solfatara Glen', place: { map: '5.1', px: 238, py: 1322, r: 600 },
    suits: ['works'], has: { water: 0.6, warmth: 1, ground: 0.2, resource: 1, shelter: 0.6 }, risks: ['acid', 'fumes', 'heat'],
    _note: 'the sulphur: a works, not a home' },
  { id: 'firebliss:east-vale', kit: 'firebliss', name: 'East Bliss Vale', place: { map: '5.1', px: 284, py: 1318, r: 700 },
    suits: ['trade', 'hunt'], has: { water: 1, warmth: 1, ground: 0.7, resource: 0.5, shelter: 0.5 }, risks: ['lahar'],
    _note: 'the lowest and warmest; the hunters\' way in' },
  { id: 'firebliss:west-cauldron', kit: 'firebliss', name: 'West Bliss Cauldron', place: { map: '5.1', px: 126, py: 1344, r: 600 },
    suits: ['fort'], has: { water: 1, warmth: 0.5, ground: 0.4, resource: 0.3, shelter: 1 }, risks: ['gas', 'cold'],
    _note: 'the most hidden and defensible: a crater moat under Mount Pyre' }];
const LABYRINTH = [
  { id: 'labyrinth:nw-pit-tarn', kit: 'labyrinth', name: 'NW pit tarn', place: { map: '5.1', px: 148, py: 1467, r: 500 },
    suits: ['hunt'], has: { water: 1, warmth: 0.1, shelter: 0.6 }, risks: ['cold'] },
  { id: 'labyrinth:sw-pit-tarn', kit: 'labyrinth', name: 'SW pit tarn', place: { map: '5.1', px: 176, py: 1564, r: 500 },
    suits: ['hunt'], has: { water: 1, warmth: 0.1, shelter: 0.6 }, risks: ['cold'] }];
K.clearCandidates();
const o1 = K.offer('firebliss', FIREBLISS), o2 = K.offer('labyrinth', LABYRINTH);
const BAD = [
  Object.assign({}, FIREBLISS[0], { id: 'firebliss:x1', suits: ['castle'] }),
  Object.assign({}, FIREBLISS[0], { id: 'firebliss:x2', has: { water: 2 } }),
  Object.assign({}, FIREBLISS[0], { id: 'firebliss:x3', has: { gold: 1 } }),
  Object.assign({}, FIREBLISS[0], { id: 'other:x4' }),
  Object.assign({}, FIREBLISS[0], { id: 'firebliss:x5', place: { map: '9', px: 1, py: 1, r: 9 } }),
  Object.assign({}, FIREBLISS[0], { id: 'firebliss:x6', place: { map: '5.1', px: 1, py: 1 } }),
  Object.assign({}, LABYRINTH[0], { id: 'labyrinth:x7' }),
  FIREBLISS[0]];
const o3 = K.offer('firebliss', BAD);
ok('the kits\' candidates are kept; bad ones are reported and dropped', o1.kept.length === 4 && o2.kept.length === 2 && o1.errors.length + o2.errors.length === 0 &&
  K.candidates().length === 6, o3.kept.length === 0 && o3.errors.length === BAD.length, o3.errors.length + ' refused');
const cx = 200 * 2000, cz = 1320 * 2000;
const byWorks = K.candidatesNear(null, cx, cz, 300000, { kind: 'works', only: true }), byAny = K.candidatesNear(null, cx, cz, 300000);
ok('candidatesNear: best first, those that suit the kind asked for first', byWorks.length === 1 && byWorks[0].cand.id === 'firebliss:solfatara-glen' &&
  byAny[0].cand.id === 'firebliss:great-vale' && K.candidatesNear(null, cx, cz, 300000, { kind: 'fort' })[0].cand.id === 'firebliss:west-cauldron',
  K.candidatesNear(null, cx, cz, 10).length === 0);
const R6 = fresh();
const fc = K.found(R6, { candidate: 'firebliss:east-vale', kind: 'trade', day: 12 });
const fcr = fc.ok && K.get(R6, fc.id);
const heldNow = K.candidatesNear(R6, cx, cz, 300000).find(e => e.cand.id === 'firebliss:east-vale').held;
ok('founding on a candidate takes its place and name and links it; the candidate then reads as held',
  fc.ok && fcr.name === 'East Bliss Vale' && fcr.links.candidate === 'firebliss:east-vale' && fcr.place.r === 700 && J(heldNow) === J([fc.id]),
  !K.found(R6, { candidate: 'firebliss:nowhere', kind: 'trade', day: 12 }).ok && !K.found(R6, { candidate: 'firebliss:east-vale', kind: 'trade', day: 13 }).ok);

// ---- engine-neutral source
const text = fs.readFileSync(path.join(ROOT, SRC), 'utf8');
const BROWSER = /\bdocument\.|\bTHREE\.|Math\.random|getImageData|localStorage|requestAnimationFrame|\bSIM\.\w+\s*\(/;
const FALSY = /[A-Za-z_$][\w$.]*\s*\|\|\s*-?\d*[1-9]/;
ok('the source is engine-neutral: no DOM, three.js, Math.random, SIM call or `|| number` default', !BROWSER.test(text) && !FALSY.test(text),
  BROWSER.test('var c = document.body') && BROWSER.test('SIM.settlement({id})') && FALSY.test('r = opt.r || 100'));

console.log(bad ? '\n' + bad + ' check(s) FAILED' : '\nall checks pass');
process.exit(bad ? 1 : 0);
