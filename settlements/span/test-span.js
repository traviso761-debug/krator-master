// node settlements/span/test-span.js: Span's layout (src/30-span-layout.js) against its rules (src/31-span-rules.js).
// Every check passes on the layout, and each has a negative: a copy broken in that one way must fail that check.
// Also: the decay seeds are the part's own (same world, same draw; another world, another), the frame round-trips,
// every part registers in core/tags with no unknown vocabulary, and AREAS.md says what the layout says.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/tags/50-core-tags.js'); load('core/tags/52-core-tags-vocab.js'); load('core/tags/53-core-tags-host.js');
load('settlements/span/src/30-span-layout.js');
load('settlements/span/src/31-span-rules.js');
const L = SPAN_LAYOUT;
let bad = 0;
const ok = (name, pass, detail) => { if (!pass) bad++; console.log((pass ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '')); };
const clone = () => JSON.parse(JSON.stringify(L));
const part = (M, id) => M.parts.find(p => p.id === id);
const result = (M, prefix) => SPAN.checks(M).find(c => c.name.startsWith(prefix));

// ---- every check on the layout
const C = SPAN.checks(L);
C.forEach(c => ok(c.name, c.pass, c.detail.trim()));

// ---- each check's negative: break the layout in that one way, and that check must fail
const NEG = [
  ['every part and way has a unique', M => M.parts.push(Object.assign({}, part(M, 'market')))],
  ['every part\'s state', M => { part(M, 'market').state = 'shiny'; }],
  ['every part with a parent', M => { part(M, 'market').shape = ['box', -100, -50, -10, 10]; }],
  ['no two parts overlap', M => { part(M, 'tavern').shape = part(M, 'market').shape.slice(); }],
  ['every gallery and service ledge', M => { part(M, 'gal_s40').y = -50; }],
  ['every bridge\'s ends', M => { part(M, 'middle_bridge').shape[4] = 100; }],
  ['pads, domes, ranges and sites at the rim', M => { part(M, 'pad_2').shape = ['circ', 300, -120, 36]; }],
  ['the bay\'s terrace domes', M => { part(M, 'bay_dome_1').shape = ['circ', -520, 100, 17]; }],
  ['floor parts stand on the floor', M => { part(M, 'tank_1').shape = ['circ', 40, 65, 22]; }],
  ['the Basin Tunnel opens', M => { part(M, 'basin_portal').shape = ['circ', -520, -100, 18]; }],
  ['every road runs clear', M => { part(M, 'rdome_1').shape = ['circ', 20, 210, 26]; }],
  ['every walkable part is reached', M => { M.links = M.links.filter(k => k[0] !== 'tunnel_road' && k[1] !== 'tunnel_road'); }],
  ['every link joins two known ids', M => { M.links.push(['cross', 'nowhere', {}]); }],
  ['every way out of Dalab\'s hold', M => { M.links.push(['cross', 'rim_n', {}]); }],
  ['with its gates shut', M => { M.links.find(k => k[0] === 'line' && k[1] === 'floor_road')[2].state = 'open'; }],
  ['every part that stands on rock', M => { part(M, 'pad_1').y = 10; }],
  ['the floor at the peak', M => { M.parts.filter(p => /^gal_/.test(p.id)).forEach(p => { p.st = 6; }); }],
];
NEG.forEach(([prefix, breakIt]) => {
  const M = clone(); breakIt(M);
  const r = result(M, prefix);
  ok('negative: ' + prefix + '... fails when broken', !!r && !r.pass, r ? r.detail.trim() : 'no such check');
});
ok('every check has a negative', C.every(c => NEG.some(n => c.name.startsWith(n[0]))), C.filter(c => !NEG.some(n => c.name.startsWith(n[0]))).map(c => c.name).join('; '));

// ---- decay draws: the part's own seed (KRAND.child), not a stream's position
const cross = part(L, 'cross'), pad1 = part(L, 'pad_1');
const d1 = [0, 1, 2].map(i => SPAN.draw(7, cross, i, 3)), d2 = [0, 1, 2].map(i => SPAN.draw(7, cross, i, 3));
ok('a part\'s draws repeat in the same world', d1.join() === d2.join() && d1.every(x => x >= 0 && x < 1));
ok('another world or another part draws differently', SPAN.draw(8, cross, 0, 3) !== d1[0] && SPAN.draw(7, pad1, 0, 3) !== d1[0]);
const before = SPAN.draw(7, pad1, 5, 1); [0, 1, 2, 3].forEach(i => SPAN.draw(7, cross, i, 9));
ok('drawing for one part never moves another\'s', SPAN.draw(7, pad1, 5, 1) === before);

// ---- the frame
const F = { x: 1000, z: -2000, ang: 0.7, y0: 2600 };
const w = SPAN.toWorld(F, 123, -45, -40), back = SPAN.fromWorld(F, w[0], w[1], w[2]);
ok('the frame round-trips (u, v, y) -> world -> (u, v, y)', Math.abs(back[0] - 123) < 1e-9 && Math.abs(back[1] + 45) < 1e-9 && Math.abs(back[2] + 40) < 1e-9);
const r1 = SPAN.toWorld({ x: 0, z: 0, ang: 0, y0: 0 }, 0, 10, 0);
ok('the right bank (v > 0) is on the right looking downstream (u east: v south)', Math.abs(r1[0]) < 1e-9 && r1[2] > 0);

// ---- core/tags
const T = KTAGS.create({ build: 'span' });
const recs = SPAN.tags(L, F, T), A = T.audit();
ok('every part registers in core/tags (' + recs.length + ' records)', recs.length === L.parts.length && new Set(recs.map(r => r.id)).size === recs.length);
ok('the tags use only known vocabulary, every record a culture', A.unknown === 0 && !A.missingCulture, JSON.stringify({ unknown: A.unknown, unknownKeys: A.unknownKeys, unknownValues: A.unknownValues, missingCulture: A.missingCulture }));
ok('Dalab\'s buildings are tagged dalab, the arcology ancient', T.query({ tags: { culture: 'dalab' } }).length === L.parts.filter(p => p.by === 'dalab').length);

// ---- AREAS.md says what the layout says
const AR = SPAN.area(L), md = fs.readFileSync(path.join(__dirname, 'AREAS.md'), 'utf8');
const m = md.match(/\*\*Total\*\*.*?\*\*(\d+)\*\*.*?\*\*(\d+)\*\*/);
ok('AREAS.md\'s totals are the layout\'s (python3 span_blueprint.py rewrites it)', !!m && +m[1] === Math.round(AR.floor) && +m[2] === Math.round(AR.people),
  m ? m[1] + ' / ' + m[2] + ' vs ' + Math.round(AR.floor) + ' / ' + Math.round(AR.people) : 'no total line');

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
