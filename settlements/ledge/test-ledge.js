// node settlements/ledge/test-ledge.js: Ledge's layout (src/30-ledge-layout.js) against its rules (src/31-ledge-rules.js).
// Every check passes on the layout, and each has a negative: a copy broken in that one way fails that check and the layout
// passes it (tools/ktest.js T.neg). Also: the seeds are a record's own, the ground is what the plan says at its marks, every
// record registers in core/tags with no unknown vocabulary, and AREAS.md says what the layout says.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('kits/ancients/cliff/10-cliff-stack.js');
load('core/tags/50-core-tags.js'); load('core/tags/52-core-tags-vocab.js'); load('core/tags/53-core-tags-host.js');
load('settlements/ledge/src/30-ledge-layout.js');
load('settlements/ledge/src/31-ledge-rules.js');
const L = LEDGE_LAYOUT;
const clone = () => JSON.parse(JSON.stringify(L));
const check = prefix => M => { const c = LEDGE.checks(M).find(x => x.name.startsWith(prefix)); if (!c) throw new Error('no check ' + prefix); return c.pass; };
const deck = (M, id) => M.decks.find(d => d.id === id), part = (M, id) => M.parts.find(p => p.id === id);
const broke = (fn) => { const M = clone(); fn(M); return M; };

// ---- every check on the layout
LEDGE.checks(L).forEach(c => T.ok(c.name, c.pass, c.detail.trim()));

// ---- each with a negative: the fault fails it, the layout passes it
T.neg('a duplicated id is caught', check('every record has a unique'), broke(M => { M.parts[1].id = M.parts[0].id; }), L);
T.neg('an unknown state is caught', check('every deck and part has a known state'), broke(M => { deck(M, 'd.30.w1').state = 'crumbly'; }), L);
T.neg('a deck the ruin table missed is caught', check('every deck has a state'), broke(M => { deck(M, 'd.3.c').state = null; }), L);
T.neg('a layer reaching less than the one below fails the ziggurat', check('the shell is an inverted ziggurat'), broke(M => { M.stack.r1 = -10; }), L);
T.neg('a face dressed too short leaves roots in the air', check('every deck\'s root is in the rock'), broke(M => { M.ground.dressed = 100; }), L);
T.neg('a top layer off the head\'s level is caught', check('the top layer\'s floor is the head\'s level'), broke(M => { M.stack.y0 = 300; }), L);
T.neg('a shell wider than the dressed face is caught', check('every deck hangs off the dressed face'), broke(M => { M.stack.w1 = 1600; }), L);
T.neg('a deck in another zone\'s layers is caught', check('every deck lies in its zone\'s layers'), broke(M => { deck(M, 'd.10.c').zone = 'Z1'; }), L);
T.neg('a kept deck outside the middle is caught', check('Loj Fower holds the middle decks'), broke(M => { deck(M, 'd.30.w1').state = 'kept'; }), L);
T.neg('a whole shell fails half ruined', check('half ruined'), broke(M => { M.decks.forEach(d => { if (LEDGE.BROKEN.indexOf(d.state) >= 0) d.state = 'dead'; }); }), L);
T.neg('people on a broken deck are caught', check('nobody lives on a broken'), broke(M => { deck(M, 'd.30.c').people = 5; }), L);
T.neg('a census off by one is caught', check('the census:'), broke(M => { part(M, 'head_inn_1').people++; }), L);
T.neg('a crowded deck is caught', check('no lived deck is crowded'), broke(M => { deck(M, 'd.0.w2').people = 5000; }), L);
T.neg('a building lifted off the head is caught', check('every building on the head or the apron stands'), broke(M => { part(M, 'head_inn_1').y += 6; }), L);
T.neg('a station cut through the face is caught', check('the station and the vault lie in the rock'), broke(M => { part(M, 'station').shape[4] = 30; }), L);
T.neg('a part outside its parent is caught', check('every part with a parent lies inside it'), broke(M => { part(M, 'station_customs').shape[2] = 400; }), L);
T.neg('two buildings on one plot are caught', check('no two buildings'), broke(M => { const a = part(M, 'head_inn_1'), b = part(M, 'head_tavern'); b.shape = a.shape.slice(); }), L);
T.neg('a great lift landing on a gone deck is caught', check('the great lifts run in the rock'), broke(M => { M.lifts[0].stops[3] = 'd.30.c'; }), L);
T.neg('a great lift out on the face is caught', check('the great lifts run in the rock'), broke(M => { M.lifts[0].z = 10; }), L);
T.neg('a dead great lift fails section 0', check('both great lifts run'), broke(M => { M.lifts[1].state = 'dead'; }), L);
T.neg('a car too small for beasts fails section 0', check('both great lifts run'), broke(M => { M.lifts[0].car = { w: 3, d: 3, beasts: 1 }; }), L);
T.neg('a lived deck with no way to it is caught', check('every lived deck and peopled part is reached'),
  broke(M => { M.links = M.links.filter(k => k[0] !== 'd.20.e1' && k[1] !== 'd.20.e1' && k[0] !== 'd.20.c' && k[1] !== 'd.20.c'); M.lifts.forEach(l => { l.stops = l.stops.filter(s => s.indexOf('d.20.') < 0); }); }), L);
T.neg('a stair through the dead decks breaks the strike\'s seal', check('a strike seals Ledge'), broke(M => { M.links.push(['d.39.e1', 'd.20.e1', { via: 'a dead stair' }]); }), L);
T.neg('a Line rising to its station is caught', check('the Line slopes down'), broke(M => { M.line.approach[2][2] = 990; }), L);
T.neg('a Line steeper than the ruling grade is caught', check('the Line slopes down'), broke(M => { M.line.helix.grade = .06; }), L);
T.neg('a wreck heap behind the face is caught', check('every wreck heap lies before the face'), broke(M => { M.heaps[0].z = -50; }), L);
T.neg('a road cut to a steeper grade than Dalab\'s is caught', check('Dalab\'s road holds its 9 %'), broke(M => { M.road.grade = .3; }), L);
T.neg('a road with no cut under it is caught', check('Dalab\'s road holds its 9 %'), broke(M => { delete M.road; }), L);

// ---- the ground at the plan's marks (PLAN.md 9.2)
const G = L.ground;
T.ok('the head is flat at 1,562 m behind the dressed face', [[-500, -300], [0, -20], [600, -600], [820, -200]].every(q => Math.abs(LEDGE.groundAt(L, q[0], q[1]) - G.head) < .01),
  [[-500, -300], [0, -20], [600, -600], [820, -200]].map(q => LEDGE.groundAt(L, q[0], q[1]).toFixed(1)).join(', '));
T.ok('the apron is flat at 312 m to the quay', [[-400, 5], [0, 100], [500, 179]].every(q => Math.abs(LEDGE.groundAt(L, q[0], q[1]) - G.apron) < .01));
T.ok('the face is sheer: 1,250 m in a metre at x 0', LEDGE.groundAt(L, 0, -.5) - LEDGE.groundAt(L, 0, .5) > 1240);
T.ok('the lake\'s bed lies under the water beyond the quay', [[-300, 200], [0, 600], [400, 1500], [-2500, 1500]].every(q => LEDGE.groundAt(L, q[0], q[1]) < G.lake - 1));
T.ok('the escarpment rises north of the bench', LEDGE.groundAt(L, 0, -1500) > G.head + 150, LEDGE.groundAt(L, 0, -1500).toFixed(0) + ' m at z -1500');
T.ok('the natural cliff beyond the dressed face falls from the head to the lake', LEDGE.groundAt(L, -1500, -400) > 1500 && LEDGE.groundAt(L, -1500, 900) < G.lake);

// ---- seeds: a record's own (same world, same draw; another id or world, another)
T.ok('a seed is the record\'s own and the world\'s', LEDGE.draw(4370, 'd.30.c', 3, 1) === LEDGE.draw(4370, 'd.30.c', 3, 1) && LEDGE.draw(4370, 'd.30.c', 3, 1) !== LEDGE.draw(4370, 'd.31.c', 3, 1)
  && LEDGE.draw(4370, 'd.30.c', 3, 1) !== LEDGE.draw(4371, 'd.30.c', 3, 1));

// ---- core/tags: every deck, part, lift and heap, no unknown vocabulary, a culture each
const R = KTAGS.create({ build: 'ledge' }), recs = LEDGE.tags(L, R), A = R.audit();
T.ok('every record registers in core/tags with known vocabulary and a culture', recs.length === L.decks.length + L.parts.filter(p => p.shape).length + L.lifts.length + L.heaps.length && A.unknown === 0 && !A.missingCulture,
  recs.length + ' records, unknown ' + A.unknown + ', missing culture ' + A.missingCulture);

// ---- AREAS.md says what the layout says (written by ledge_blueprint.py)
const areas = path.join(__dirname, 'AREAS.md'), txt = fs.existsSync(areas) ? fs.readFileSync(areas, 'utf8') : '', a = LEDGE.area(L), f = Math.round(a.floor).toLocaleString('en');
T.ok('AREAS.md holds the layout\'s floor and broken share (python3 ledge_blueprint.py writes it)', txt.indexOf(f) >= 0 && txt.indexOf((a.brokenShare * 100).toFixed(1) + ' %') >= 0, f + ' m2, ' + (a.brokenShare * 100).toFixed(1) + ' %');
T.done();
