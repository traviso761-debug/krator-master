// node openworld/outposts/tests/test-outposts.js: the outpost registry's data side (KOUTPOST, openworld/outposts/PLAN.md).
// Each check has a negative that must fail. The seed is the scale model's real list (data/scale-outposts.json), the
// frames the three open worlds' region.json, and the candidates the Firebliss and Labyrinth plans' sites.
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

// ---- the seed
const SCALE = readJ('openworld/outposts/data/scale-outposts.json');
const SEED = K.seed(SCALE.settlements, SCALE.map);
const names = SEED.map(r => r.name).sort();
ok('the scale model seeds the ten outposts, every record valid',
  SEED.length === 10 && SEED.every(r => K.check(r).length === 0) &&
  J(names) === J(['Bastion', 'Boatmurder', 'Fort Vaklu', 'Furrow', 'Shade', 'Strongwall', 'Tallhouse', 'The Gate', 'Tzunfort', 'Veil']),
  K.check(Object.assign({}, SEED[0], { kind: 'castle' })).length > 0 && K.check(Object.assign({}, SEED[0], { id: 'Bad Id' })).length > 0,
  names.join(', '));
const gate = SEED.find(r => r.name === 'The Gate');
ok('seed ids are the model\'s doc ids, and the hints type the forts and The Gate',
  gate.id === 'op-sthegate' && gate.kind === 'waystation' && gate.owner.id === 'tierhounds' && gate.links.scale === 'sthegate' &&
  SEED.filter(r => r.kind === 'fort').length === 3 && SEED.every(r => r.founded === null && r.state === 'active'),
  K.seed([{ id: 'x1', name: 'Town', type: 'city', px: 1, py: 1 }], '5.1').length === 0);
ok('a seeded record\'s owner is unknown unless a hint names one; a live record may not be owned by none',
  SEED.filter(r => r.owner.kind === 'unknown').length === 9,
  K.check(Object.assign({}, SEED[0], { owner: { kind: 'none' } })).length > 0 &&
  K.check(Object.assign({}, SEED[0], { owner: { kind: 'faction' } })).length > 0);

// ---- coordinates against the three regions' region.json
const REGIONS = ['little-demo', 'isle-demo', 'north-basin'].map(n => ({ n, j: readJ('openworld/' + n + '/data/region.json') }));
let pairs = 0, off = 0, offOld = 0;
for (const { j } of REGIONS) for (const s of j.settlements.filter(s => s.type === 'outpost')) {
  const rec = SEED.find(r => r.links.scale === s.doc); if (!rec) { off++; continue; }
  pairs++;
  const p = K.toRegion(rec.place, j.frame);
  if (Math.abs(p.x - s.x) > 1e-6 || Math.abs(p.z - s.z) > 1e-6) off++;
  const wrong = K.toRegion(Object.assign({}, rec.place, { map: '4' }), j.frame);
  if (Math.abs(wrong.x - s.x) > 1e-6 || Math.abs(wrong.z - s.z) > 1e-6) offOld++;
}
ok('every outpost the regions list lands on its region.json x, z (map 5.1 less 272, 330)', pairs >= 4 && off === 0,
  offOld === pairs, pairs + ' outposts in the regions');
const fr = REGIONS[0].j.frame, p0 = K.fromRegion(-12000, 34000, fr, '5.1'), back = K.toRegion(p0, fr);
const onOld = K.toMap(p0, '4'), round = K.toMap(onOld, '5.1');
ok('fromRegion and toRegion invert; toMap moves the pixel and keeps the place',
  back.x === -12000 && back.z === 34000 && onOld.px === p0.px - 272 && J(round) === J(p0) && K.check(Object.assign({}, gate, { place: p0 })).length === 0,
  K.check(Object.assign({}, gate, { place: Object.assign({}, p0, { x: p0.x + 5 }) })).length > 0);
const boxN = REGIONS[0].j.frame.box_px, inL = K.fold({ seed: SEED }).reg;
const box = [(boxN[0] - fr.origin_px[0]) * 2000, (boxN[1] - fr.origin_px[1]) * 2000, (boxN[2] - fr.origin_px[0]) * 2000, (boxN[3] - fr.origin_px[1]) * 2000];
const inside = K.inRegion(inL, fr, box).map(r => r.name).sort();
ok('inRegion keeps the outposts inside a region\'s box', inside.includes('Shade') && inside.includes('Furrow') && !inside.includes('Veil'),
  K.inRegion(inL, fr, [0, 0, 1, 1]).length === 0, inside.join(', '));

// ---- the operation log
function sample() {
  const reg = K.fold({ seed: SEED }).reg;
  const A = [];
  const f = K.found(reg, { name: 'Player camp', kind: 'hunt', owner: { kind: 'player', id: 'player' }, place: K.place(700, 900, '5.1', 80), day: 3 });
  A.push(f);
  A.push({ ok: K.apply(reg, { op: 'SET', id: f.id, day: 4, cause: 'built', set: { state: 'active', tags: ['palisade'] } }).ok });
  A.push(K.abandon(reg, 'op-s10ioj4r5u', 5, 'raided'));
  A.push({ ok: K.apply(reg, { op: 'SET', id: 'op-sthegate', day: 6, set: { links: { settlement: 'gate' }, _note: 'owner: the toll fort' } }).ok });
  A.push({ ok: K.apply(reg, { op: 'MOVE', id: 'op-smqy5z5eek', day: 6, place: K.place(684, 1184, '5.1') }).ok });
  A.push({ ok: K.apply(reg, { op: 'REMOVE', id: 'op-s2iq6zqe2x', day: 7, cause: 'owner: not an outpost' }).ok });
  return { reg, A };
}
const S1 = sample();
const file = K.save(S1.reg), F2 = K.fold(JSON.parse(J(file)));
const lessOne = JSON.parse(J(file)); lessOne.ops.splice(2, 1);
ok('the log replays: fold(save(reg)) gives the same registry, through JSON',
  S1.A.every(a => a.ok) && F2.errors.length === 0 && J(K.list(F2.reg)) === J(K.list(S1.reg)) && file.ops.length === 6,
  J(K.list(K.fold(lessOne).reg)) !== J(K.list(S1.reg)));
const veil = K.get(S1.reg, 'op-s10ioj4r5u');
ok('abandoning a live outpost dates it and leaves it to nobody', veil.state === 'abandoned' && veil.abandoned === 5 && veil.owner.kind === 'none',
  K.check(Object.assign({}, veil, { abandoned: null, state: 'active', owner: { kind: 'none' } })).length > 0);
const retake = K.apply(S1.reg, { op: 'SET', id: veil.id, day: 9, set: { state: 'active', owner: { kind: 'people', id: 'kimr' } } });
const veil2 = K.get(S1.reg, veil.id);
ok('retaking it names the new owner and clears the date', retake.ok && veil2.abandoned === null && veil2.owner.id === 'kimr' && veil2.state === 'active',
  !K.apply(sample().reg, { op: 'SET', id: veil.id, day: 9, set: { state: 'active' } }).ok);

/* each refused op must leave the registry exactly as it was */
const REFUSED = [
  ['ADD of an existing id', { op: 'ADD', id: 'op-sthegate', rec: Object.assign({}, gate) }],
  ['ADD of a removed id', { op: 'ADD', id: 'op-s2iq6zqe2x', rec: Object.assign({}, gate, { id: 'op-s2iq6zqe2x' }) }],
  ['ADD whose rec id differs', { op: 'ADD', id: 'op-new', rec: Object.assign({}, gate, { id: 'op-other' }) }],
  ['ADD of an invalid record', { op: 'ADD', id: 'op-new', rec: Object.assign({}, gate, { id: 'op-new', state: 'thriving' }) }],
  ['SET of the id', { op: 'SET', id: 'op-sthegate', set: { id: 'op-x' } }],
  ['SET of the place (MOVE moves)', { op: 'SET', id: 'op-sthegate', set: { place: K.place(1, 1, '5.1') } }],
  ['SET of an unknown link', { op: 'SET', id: 'op-sthegate', set: { links: { shop: 'x' } } }],
  ['a destroyed outpost brought back', null],
  ['abandoned set on a live outpost', { op: 'SET', id: 'op-sthegate', set: { abandoned: 4 } }],
  ['a dead state with a named owner', { op: 'SET', id: 'op-sthegate', set: { state: 'abandoned', owner: { kind: 'people', id: 'x' } } }],
  ['MOVE to a place whose x, z disagree with its pixel', { op: 'MOVE', id: 'op-sthegate', place: Object.assign(K.place(5, 5, '5.1'), { z: 1 }) }],
  ['MOVE onto an unknown map', { op: 'MOVE', id: 'op-sthegate', place: Object.assign(K.place(5, 5, '5.1'), { map: '9' }) }],
  ['an op on a missing id', { op: 'SET', id: 'op-nobody', set: { name: 'x' } }],
  ['an unknown op', { op: 'RENAME', id: 'op-sthegate' }],
  ['a fractional day', { op: 'SET', id: 'op-sthegate', day: 2.5, set: { name: 'x' } }]
];
const R2 = K.fold({ seed: SEED }).reg;
K.apply(R2, { op: 'REMOVE', id: 'op-s2iq6zqe2x' });
K.apply(R2, { op: 'SET', id: 'op-se4hiep1n7', day: 1, set: { state: 'destroyed' } });
REFUSED[7][1] = { op: 'SET', id: 'op-se4hiep1n7', day: 2, set: { state: 'active', owner: { kind: 'player', id: 'player' } } };
const before = J(K.list(R2)) + J(R2.log);
const leaks = REFUSED.filter(([n, op]) => K.apply(R2, op).ok || J(K.list(R2)) + J(R2.log) !== before).map(x => x[0]);
ok('every bad op is refused and changes nothing (' + REFUSED.length + ' kinds)', leaks.length === 0,
  K.apply(R2, { op: 'SET', id: 'op-sthegate', set: { name: 'The Gate of the Outlands' } }).ok && J(K.list(R2)) + J(R2.log) !== before,
  leaks.join('; '));
const broken = K.save(S1.reg); broken.ops.splice(1, 0, { op: 'SET', id: 'op-nobody', set: { name: 'x' } });
const FB = K.fold(broken);
ok('fold stops at the first refused op and names it', FB.errors.length === 1 && /^op 1:/.test(FB.errors[0]) && FB.reg.log.length === 1,
  K.fold(K.save(S1.reg)).errors.length === 0);
ok('fold refuses a bad or doubled seed', K.fold({ seed: [Object.assign({}, gate, { kind: 'castle' })] }).errors.length === 1 &&
  K.fold({ seed: [gate, gate] }).errors.length === 1, K.fold({ seed: [gate] }).errors.length === 0);

// ---- founding
const R3 = K.fold({ seed: SEED }).reg, gp = gate.place;
const at = (dx, r) => ({ name: 'P', kind: 'trade', owner: { kind: 'player', id: 'player' }, place: Object.assign(K.place(gp.px, gp.py, '5.1', r), { x: gp.x + dx }), day: 1 });
const atPx = (px, py, r) => ({ name: 'P', kind: 'trade', owner: { kind: 'player', id: 'player' }, place: K.place(px, py, '5.1', r), day: 1 });
ok('the founding rule: claims at least gap apart from a live outpost',
  !K.canFound(R3, at(0, 100)).ok && !K.canFound(R3, at(399, 100)).ok && K.canFound(R3, at(401, 100)).ok,
  K.canFound(R3, at(399, 100), { gap: 0 }).ok === true && K.canFound(R3, at(401, 100), { gap: 300 }).ok === false);
const R4 = K.fold({ seed: SEED }).reg; K.abandon(R4, 'op-sthegate', 2);
ok('a dead outpost\'s spot can be refounded; the page\'s ground can say no',
  K.canFound(R4, at(0, 100)).ok && !K.canFound(R4, at(0, 100), { ground: () => false }).ok,
  !K.canFound(R3, at(0, 100)).ok);
ok('founding refuses an unknown kind, an ownerless claim and a point that is not finite',
  !K.canFound(R3, Object.assign(atPx(10, 10), { kind: 'castle' })).ok && !K.canFound(R3, Object.assign(atPx(10, 10), { owner: { kind: 'none' } })).ok &&
  !K.canFound(R3, Object.assign(atPx(10, 10), { place: { x: NaN, z: 0 } })).ok,
  K.canFound(R3, atPx(10, 10)).ok);
const ra = K.fold({ seed: SEED }).reg, rb = K.fold({ seed: SEED }).reg;
const ia = K.found(ra, atPx(10, 10)).id, ib = K.found(rb, atPx(10, 10)).id;
const rc = K.fold({ seed: SEED }).reg; K.apply(rc, { op: 'ADD', id: ia, rec: Object.assign({}, gate, { id: ia, place: K.place(900, 900, '5.1') }) });
const ic = K.found(rc, atPx(10, 10)).id;
ok('a founded id is stable: the same founding gives the same id; a taken id moves on', /^op-[0-9a-z]+$/.test(ia) && ia === ib && ic !== ia,
  K.found(K.fold({ seed: SEED }).reg, Object.assign(atPx(10, 10), { day: 2 })).id !== ia, ia + ', ' + ic);
const fnd = K.get(ra, ia);
ok('a founded outpost is claimed, dated, and valid', fnd.state === 'claimed' && fnd.founded === 1 && K.check(fnd).length === 0,
  !K.found(ra, atPx(10, 10)).ok);

// ---- nearness through KSPACE equals a scan
const R5 = K.fold({ seed: SEED }).reg, rnd = mul(20261109);
for (let i = 0; i < 300; i++) K.found(R5, atPx(Math.floor(400 + rnd() * 1200), Math.floor(300 + rnd() * 1400), 50 + Math.floor(rnd() * 3000)), { gap: 0 });
let diff = 0;
for (let q = 0; q < 200; q++) {
  const x = (400 + rnd() * 1200) * 2000, z = (300 + rnd() * 1400) * 2000, r = rnd() * 20000;
  const a = K.near(R5, x, z, r).map(o => o.id), b = K.list(R5).filter(o => Math.hypot(o.place.x - x, o.place.z - z) <= o.place.r + r).map(o => o.id);
  if (J(a) !== J(b)) diff++;
}
ok('near() answers what a scan answers, in registry order (' + K.list(R5).length + ' outposts, 200 queries)', diff === 0,
  J(K.near(R5, 0, 0, 1)) === '[]' && K.near(R5, gate.place.x, gate.place.z, 1)[0].id === 'op-sthegate');

// ---- candidates (the kits' hints)
const FIREBLISS = [
  { id: 'firebliss:great-vale', kit: 'firebliss', name: 'Great Firebliss Vale', place: { map: '5.1', px: 184, py: 1318, r: 900 },
    suits: ['farm', 'hunt', 'trade'], has: { water: 1, warmth: 1, ground: 1, resource: 0.5, shelter: 1 }, risks: ['gas', 'flood'],
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
ok('candidatesNear: best first, by what each has and the kind asked for', byWorks.length === 1 && byWorks[0].cand.id === 'firebliss:solfatara-glen' &&
  byAny[0].cand.id === 'firebliss:great-vale' && K.candidatesNear(null, cx, cz, 300000, { kind: 'fort' })[0].cand.id === 'firebliss:west-cauldron',
  K.candidatesNear(null, cx, cz, 10).length === 0);
const R6 = K.fold({ seed: SEED }).reg;
const fc = K.found(R6, { candidate: 'firebliss:east-vale', kind: 'trade', owner: { kind: 'player', id: 'player' }, day: 12 });
const fcr = fc.ok && K.get(R6, fc.id);
const heldNow = K.candidatesNear(R6, cx, cz, 300000).find(e => e.cand.id === 'firebliss:east-vale').held;
ok('founding on a candidate takes its place and name and links it; the candidate then reads as held',
  fc.ok && fcr.name === 'East Bliss Vale' && fcr.links.candidate === 'firebliss:east-vale' && fcr.place.r === 700 && J(heldNow) === J([fc.id]),
  !K.found(R6, { candidate: 'firebliss:nowhere', kind: 'trade', owner: { kind: 'player', id: 'player' } }).ok &&
  !K.found(R6, { candidate: 'firebliss:east-vale', kind: 'trade', owner: { kind: 'player', id: 'player' }, day: 13 }).ok);
ok('the registry stores candidates nowhere: they are hints until something is founded',
  K.list(K.fold({ seed: SEED }).reg).every(r => r.links.candidate === null), K.list(R6).some(r => r.links.candidate !== null));

// ---- the simulation's spec
const pl = K.get(R6, fc.id), gt = K.get(S1.reg, 'op-sthegate');
ok('simSpec: the player\'s outpost runs as the player\'s settlement; a linked one keeps its settlement id',
  J(K.simSpec(pl)) === J({ id: fc.id, faction: 'player', name: 'East Bliss Vale', kind: 'outpost', outpost: fc.id }) && K.simSpec(gt).id === 'gate' && K.simSpec(gt).faction === null,
  K.simSpec(K.get(R6, 'op-sthegate')).id !== 'gate');

// ---- engine-neutral source
const text = fs.readFileSync(path.join(ROOT, SRC), 'utf8');
const BROWSER = /\bdocument\.|\bTHREE\.|Math\.random|getImageData|localStorage|requestAnimationFrame|\bSIM\.\w+\s*\(/;
const FALSY = /[A-Za-z_$][\w$.]*\s*\|\|\s*-?\d*[1-9]/;
ok('the source is engine-neutral: no DOM, three.js, Math.random, SIM call or `|| number` default', !BROWSER.test(text) && !FALSY.test(text),
  BROWSER.test('var c = document.body') && BROWSER.test('SIM.settlement({id})') && FALSY.test('r = opt.r || 100'));

console.log(bad ? '\n' + bad + ' check(s) FAILED' : '\nall checks pass');
process.exit(bad ? 1 : 0);
