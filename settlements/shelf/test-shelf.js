// node settlements/shelf/test-shelf.js: Shelf's layout (src/30-shelf-layout.js) against its rules (src/31-shelf-rules.js) and the
// kit's cliff-city records (kits/ancients/cliff/10-cliff-stack.js). Every check passes on the layout, and each has a negative: a copy
// broken in that one way fails that check and the layout passes it (tools/ktest.js T.neg). Also the ground at the plan's marks, the
// seeds, the tags and AREAS.md.
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
load('settlements/shelf/src/30-shelf-layout.js');
load('settlements/shelf/src/31-shelf-rules.js');
const L = SHELF_LAYOUT;
const clone = () => JSON.parse(JSON.stringify(L));
const check = prefix => M => { const c = SHELF.checks(M).find(x => x.name.startsWith(prefix)); if (!c) throw new Error('no check ' + prefix); return c.pass; };
const deck = (M, id) => M.decks.find(d => d.id === id), part = (M, id) => M.parts.find(p => p.id === id);
const broke = fn => { const M = clone(); fn(M); return M; };

SHELF.checks(L).forEach(c => T.ok(c.name, c.pass, c.detail.trim()));

T.neg('a duplicated id is caught', check('every record has a unique'), broke(M => { M.parts[1].id = M.parts[0].id; }), L);
T.neg('an unknown holder is caught', check('every deck and part has a known state'), broke(M => { deck(M, 'd.20.e1').by = 'voth'; }), L);
T.neg('a deck the ruin table missed is caught', check('every deck has a state'), broke(M => { deck(M, 'd.3.c').state = null; }), L);
T.neg('a layer reaching less than the one below fails the ziggurat', check('the shell is an inverted ziggurat'), broke(M => { M.stack.r1 = -10; }), L);
T.neg('a face dressed too short leaves roots in the air', check('every deck\'s root is in the rock'), broke(M => { M.ground.dressed = 100; }), L);
T.neg('a top layer off the plateau is caught', check('the top layer\'s floor is the plateau\'s level'), broke(M => { M.stack.y0 = 2950; }), L);
T.neg('a face off the target\'s 850 m is caught', check('the face is the target\'s 850 m'), broke(M => { M.ground.shelf = 2700; }), L);
T.neg('a shell wider than the dressed face is caught', check('every deck hangs off the dressed face'), broke(M => { M.stack.w1 = 2400; }), L);
T.neg('a deck in another zone\'s layers is caught', check('every deck lies in its zone\'s layers'), broke(M => { deck(M, 'd.10.c').zone = 'Z1'; }), L);
T.neg('a lived deck not Dalab\'s is caught', check('Dalab holds every lived deck'), broke(M => { deck(M, 'd.20.e1').by = 'fellgang'; }), L);
T.neg('a shell with nothing broken fails the ruin\'s share', check('held and mended'), broke(M => { M.decks.forEach(d => { if (SHELF.BROKEN.indexOf(d.state) >= 0) d.state = 'dead'; }); }), L);
T.neg('people on a broken deck are caught', check('nobody lives on a broken'), broke(M => { deck(M, 'd.25.c').people = 5; }), L);
T.neg('a census off by one is caught', check('the census:'), broke(M => { part(M, 'head_inn_1').people++; }), L);
T.neg('a crowded deck is caught', check('no lived deck is crowded'), broke(M => { deck(M, 'd.0.c').people = 9000; }), L);
T.neg('a building lifted off the plateau is caught', check('every building on the plateau or the shelf stands'), broke(M => { part(M, 'head_inn_1').y += 6; }), L);
T.neg('platforms cut through the face are caught', check('the station\'s platforms lie in the rock'), broke(M => { part(M, 'station').shape[4] = 30; }), L);
T.neg('two buildings on one plot are caught', check('no two buildings'), broke(M => { part(M, 'head_tower_2').shape = part(M, 'head_tower_1').shape.slice(); }), L);
T.neg('a great lift landing on a gone deck is caught', check('the great lifts run in the rock'), broke(M => { M.lifts[0].stops[2] = 'd.22.c'; }), L);
T.neg('a great lift out on the face is caught', check('the great lifts run in the rock'), broke(M => { M.lifts[0].z = 10; }), L);
T.neg('a lived deck with no way to it is caught', check('every lived deck and peopled part is reached'),
  broke(M => { M.links = M.links.filter(k => k[0] !== 'd.28.e1' && k[1] !== 'd.28.e1'); M.lifts.forEach(l => { l.stops = l.stops.filter(s => s !== 'd.28.e1'); }); }), L);
T.neg('the road tunnel shut leaves the shelf to the lifts', check('the plateau reaches the shelf by Dalab\'s road'), broke(M => { M.links = M.links.filter(k => k[0] !== 'tunnel' && k[1] !== 'tunnel'); }), L);
T.neg('a road cut to a steeper grade than Dalab\'s is caught', check('Dalab\'s road holds its 9 %'), broke(M => { M.road.grade = .3; }), L);
T.neg('a road with no cut under it is caught', check('Dalab\'s road holds its 9 %'), broke(M => { delete M.road; }), L);
T.neg('a road tunnel bored out to the face is caught', check('the road tunnel climbs inside the Wall'), broke(M => { M.ways.find(w => w.id === 'tunnel').helix.c[1] = -120; }), L);
T.neg('a road tunnel steeper than the road is caught', check('the road tunnel climbs inside the Wall'), broke(M => { const h = M.ways.find(w => w.id === 'tunnel').helix; h.grade = .15; h.length = (h.y1 - h.y0) / .15; }), L);
T.neg('a road tunnel ending off its portal is caught', check('the road tunnel climbs inside the Wall'), broke(M => { M.ways.find(w => w.id === 'tunnel').pts[0][0] = -900; }), L);
T.neg('a Line falling to its station is caught', check('the Line climbs the spirals'), broke(M => { M.line.approach[2][2] = 3600; }), L);
T.neg('a Line steeper than the ruling grade is caught', check('the Line climbs the spirals'), broke(M => { M.line.helix.grade = .06; }), L);
T.neg('a wreck heap behind the face is caught', check('every wreck heap lies before the face'), broke(M => { M.heaps[0].z = -50; }), L);
T.neg('the prow\'s wreck far from the gash is caught', check('the prow\'s wreck lies across the shelf'), broke(M => { M.heaps[0].x = 600; }), L);

const G = L.ground, H = (x, z) => SHELF.groundAt(L, x, z);
T.ok('the plateau is flat at 3,680 m behind the dressed face', [[-500, -300], [0, -20], [800, -500]].every(q => Math.abs(H(q[0], q[1]) - G.head) < .01), [[-500, -300], [0, -20], [800, -500]].map(q => H(q[0], q[1]).toFixed(1)).join(', '));
T.ok('the shelf is flat at 2,830 m out to 1.2 km', [[-900, 5], [0, 600], [900, 1100]].every(q => Math.abs(H(q[0], q[1]) - G.shelf) < .01));
T.ok('the face is sheer: 850 m in a metre at x 0', H(0, -.5) - H(0, .5) > 845);
T.ok('the Wall rises behind the plateau to the pin\'s height', Math.abs(H(0, -1500) - 3759) < 40, H(0, -1500).toFixed(0) + ' m 1.5 km back (the model: 3,759 m at the pin)');
T.ok('the lower escarpment falls to Dalab\'s plain', H(0, 2500) < G.shelf - 40 && H(0, 9000) < 1500, H(0, 2500).toFixed(0) + ' m 2.5 km out, ' + H(0, 9000).toFixed(0) + ' m 9 km out');
T.ok('the shelf runs on past the dressed face', Math.abs(H(-1300, 450) - G.shelf) < 3, H(-1300, 450).toFixed(1) + ' m at the halting place');
T.ok('a seed is the record\'s own and the world\'s', SHELF.draw(4610, 'd.20.c', 3, 1) === SHELF.draw(4610, 'd.20.c', 3, 1) && SHELF.draw(4610, 'd.20.c', 3, 1) !== SHELF.draw(4610, 'd.21.c', 3, 1)
  && SHELF.draw(4610, 'd.20.c', 3, 1) !== SHELF.draw(4611, 'd.20.c', 3, 1));
const Rg = KTAGS.create({ build: 'shelf' }), recs = SHELF.tags(L, Rg), A = Rg.audit();
T.ok('every record registers in core/tags with known vocabulary and a culture', recs.length === L.decks.length + L.parts.filter(p => p.shape).length + L.lifts.length + L.heaps.length && A.unknown === 0 && !A.missingCulture,
  recs.length + ' records, unknown ' + A.unknown + ', missing culture ' + A.missingCulture);
const areas = path.join(__dirname, 'AREAS.md'), txt = fs.existsSync(areas) ? fs.readFileSync(areas, 'utf8') : '', a = SHELF.area(L), f = Math.round(a.floor).toLocaleString('en');
T.ok('AREAS.md holds the layout\'s floor and broken share (python3 shelf_blueprint.py writes it)', txt.indexOf(f) >= 0 && txt.indexOf((a.brokenShare * 100).toFixed(1) + ' %') >= 0, f + ' m2, ' + (a.brokenShare * 100).toFixed(1) + ' %');
T.done();
