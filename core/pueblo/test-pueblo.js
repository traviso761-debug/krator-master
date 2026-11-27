// node core/pueblo/test-pueblo.js: core/pueblo's records (no browser, no three.js). Each check has a negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/tags/50-core-tags.js', 'core/tags/52-core-tags-vocab.js'].forEach(load);
const SRC = fs.readdirSync(__dirname).filter(f => /^\d\d-pueblo-.*\.js$/.test(f)).sort();
SRC.forEach(f => load('core/pueblo/' + f));
const K = KPUEBLO;
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };
const clone = P => { const Q = JSON.parse(JSON.stringify(P)); Object.defineProperty(Q, 'byId', { value: K.link(Q.cells), enumerable: false }); return Q; };

// ---- the data side touches no browser
const BROWSER = /\bTHREE\.|\bdocument\.|\bwindow\.|\bcanvas\b|getImageData|Math\.random/;
const hits = SRC.filter(f => BROWSER.test(fs.readFileSync(path.join(__dirname, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')));
ok('the fragments touch no three.js, DOM or Math.random (' + SRC.join(', ') + ')', hits.length === 0 && SRC.length >= 3, BROWSER.test('const g = new THREE.BoxGeometry()'), hits.join(', '));

// ---- the shapes
const GREAT = { id: 'gh', world: 7101, shape: 'D', R: 74, rows: 5, maxStoreys: 5, frontRows: 2, frontRise: 1, frontMax: 2, spineMax: 2, ragged: 0.12, people: 2.4,
  kivas: { great: [0], small: 3 }, enclosure: 24 };
const SPECS = { D: GREAT, rect: { id: 'ct', world: 7102, shape: 'rect', pw: 30, pd: 24, rows: 3, maxStoreys: 4, kivas: { great: [0], small: 1 }, enclosure: 10 },
  U: { id: 'u', world: 7103, shape: 'U', pw: 18, pd: 16, rows: 3, sideRows: 2, maxStoreys: 3, kivas: { great: [], small: 1 } },
  L: { id: 'l', world: 7104, shape: 'L', pw: 18, pd: 16, rows: 3, sideRows: 2, maxStoreys: 3, kivas: { great: [], small: 1 } },
  line: { id: 'b', world: 7105, shape: 'line', segs: 6, rows: 3, maxStoreys: 3, hero: true } };
const P = {}; for (const k in SPECS) P[k] = K.house(SPECS[k]);
const allOk = p => { const c = K.checkAll(p); return Object.keys(c).filter(k => !c[k].ok).map(k => k + ': ' + c[k].bad.slice(0, 3).join('|')); };
const fails = Object.keys(P).map(k => [k, P[k].errors.concat(allOk(P[k]))]).filter(e => e[1].length);
ok('every shape builds with every check passing (D, rect, U, L, line: ' + Object.keys(P).map(k => k + ' ' + P[k].census.rooms + ' rooms').join(', ') + ')',
  fails.length === 0 && Object.values(P).every(p => p.rooms.length > 10), K.house({ shape: 'hexagon' }).errors.length === 1, fails.map(f => f[0] + ': ' + f[1].join('; ')).join(' / '));

// ---- determinism and stable ids
ok('the same spec gives the same plan (digest ' + K.digest(P.D) + ')', K.digest(K.house(GREAT)) === K.digest(P.D),
  K.digest(K.house(Object.assign({}, GREAT, { world: 7199 }))) !== K.digest(P.D));
const ids = p => p.cells.map(c => c.id).join(','), other = K.house(Object.assign({}, GREAT, { world: 7199 }));
ok('the ids come from the plan\'s structure, not from the draws (another world seed: the same ' + P.D.cells.length + ' cell ids, other storeys)',
  ids(other) === ids(P.D) && other.rooms.map(r => r.id).join() !== P.D.rooms.map(r => r.id).join(), ids(K.house(Object.assign({}, GREAT, { R: 66 }))) !== ids(P.D));
const idc = K.check.ids(P.D), dup = clone(P.D); dup.ladders.push(dup.ladders[0]);
ok('every id unique (' + (P.D.cells.length + P.D.rooms.length + P.D.ladders.length + P.D.kivas.length + P.D.hatches.length) + ' records)', idc.ok, !K.check.ids(dup).ok);

// ---- the terraces
const T = K.check.terraces(P.D), broken = clone(P.D), front = broken.cells.find(c => c.row === 0 && c.block === 'arc' && c.storeys === 1);
front.storeys = 6;
ok('a terrace is never higher than the cell behind it', T.ok, !K.check.terraces(broken).ok);
const arc = P.D.cells.filter(c => c.block === 'arc'), rowMax = k => Math.max(...arc.filter(c => c.row === k).map(c => c.storeys)),
  back = arc.filter(c => c.row === 4), mid = back.filter(c => Math.abs(c.t / c.len - .5) < .1), ends = back.filter(c => Math.abs(c.t / c.len - .5) > .45);
const avg = L => L.reduce((a, c) => a + c.storeys, 0) / L.length;
ok('the great house steps up from the plaza (rows ' + [0, 1, 2, 3, 4].map(rowMax).join(', ') + ' storeys) and down to the arc\'s ends (' + avg(mid).toFixed(1) + ' in the middle, ' + avg(ends).toFixed(1) + ' at the ends)',
  rowMax(0) === 1 && rowMax(4) === 5 && [0, 1, 2, 3].every(k => rowMax(k) < rowMax(k + 1)) && avg(mid) > avg(ends) + 1.5, !(avg(ends) > avg(mid) + 1.5));
ok('the hero\'s rooms are on the top terrace of the back row (' + P.D.census.hero + ' rooms)', P.D.census.hero > 0 && P.D.cells.filter(c => c.hero).every(c => c.block === 'arc' && c.row === 4 && c.storeys === 5),
  !P.D.cells.filter(c => c.hero).every(c => c.row === 0));

// ---- the way up
const R = K.check.reach(P.D), noL = clone(P.D); noL.ladders = [];
ok('every room, roof, kiva and plaza is reachable from outside (' + P.D.ladders.length + ' ladders: ' + Object.entries(P.D.ladders.reduce((m, L) => (m[L.kind] = (m[L.kind] || 0) + 1, m), {})).map(e => e.join(' ')).join(', ') + ')',
  Object.values(P).every(p => K.check.reach(p).ok), !K.check.reach(noL).ok, R.bad.slice(0, 4).join(', '));
const noEntry = clone(P.D); noEntry.ladders = noEntry.ladders.filter(L => L.kind !== 'entry');
ok('the great house\'s plaza is closed: it is reached over the roofs, by the ladders up the front\'s outer face (' + P.D.ladders.filter(L => L.kind === 'entry').length + ')',
  P.D.plazas.every(p => !p.open) && P.D.ladders.some(L => L.kind === 'entry'), K.reach(noEntry)[P.D.plazas[0].id] !== true);
const noLL = clone(P.L); noLL.ladders = [];
ok('an L\'s plaza is open: reached from outside with no ladder', K.reach(noLL)[P.L.plazas[0].id] === true, !(K.reach(noL)[P.D.plazas[0].id] === true));
const gd = K.check.groundDoors(P.D), gdn = clone(P.D); gdn.rooms.find(r => r.storey === 0).face = 'door';
ok('no door opens at the ground (' + P.D.rooms.filter(r => r.face === 'door').length + ' doors onto terraces, ' + P.D.hatches.length + ' roof hatches)', Object.values(P).every(p => K.check.groundDoors(p).ok) && gd.ok, !K.check.groundDoors(gdn).ok);
const dr = P.D.rooms.filter(r => r.face === 'door'), byId = P.D.byId;
ok('a door opens onto the terrace at its floor (the roof of the cell before it)', dr.length > 50 && dr.every(r => { const c = byId[r.cell], f = byId[c.nb.front]; return f && f.storeys === r.storey && r.entry.from === f.id; }),
  !dr.every(r => r.storey === 0));

// ---- overlap and the kivas
const ov = K.check.overlap(P.D), ovn = clone(P.D); ovn.cells.push(Object.assign({}, ovn.cells[5], { id: 'dup' }));
ok('no two cells overlap', Object.values(P).every(p => K.check.overlap(p).ok) && ov.ok, !K.check.overlap(ovn).ok);
const kc = K.check.kivas(P.D), kn = clone(P.D), gk = P.D.kivas.find(k => k.great);
kn.kivas[0].x = kn.cells[3].cx; kn.kivas[0].z = kn.cells[3].cz;
ok('the round room (the great kiva) sits in the first plaza, the small kivas clear of the blocks and each other (' + P.D.kivas.map(k => k.plaza + (k.great ? ' great ' : ' ') + 'r ' + k.r.toFixed(1)).join(', ') + ')',
  kc.ok && gk && gk.plaza === P.D.plazas[0].id && gk.r === 8.5 && P.D.kivas.length === 4, !K.check.kivas(kn).ok, kc.bad.join('; '));

// ---- the census
const C = P.D.census;
ok('a great house holds 1,000 to 2,000 people (' + C.pop + ' in ' + C.homes + ' dwelling rooms; ' + C.rooms + ' rooms in all, ' + C.stores + ' stores)', C.pop >= 1000 && C.pop <= 2000 && !C.over && !P.D.errors.length,
  K.house(Object.assign({}, GREAT, { popMax: 500 })).census.over === true);

// ---- the enclosure
const E = P.D.enclosure, corners = [].concat(...P.D.cells.map(c => c.pts)), inside = ring => corners.every(p => K.inPoly(ring, p[0], p[1]));
ok('the enclosure rings every cell (' + E.pts.length + ' points, ' + E.margin + ' m out), its gate on the front (z ' + E.gate.z.toFixed(1) + ')',
  inside(E.pts) && E.gate && E.gate.z > P.D.bounds.z1 + E.margin - 1 && Math.abs(E.gate.ry) < .01, !inside(E.pts.map(p => [p[0] * .5, p[1] * .5])));

// ---- core/tags
const TG = KTAGS.create({ build: 'test-pueblo' }), house = TG.add({ 'class': 'building', kind: 'pueblo', key: 'gh', name: 'A great house', at: [0, 0, 0], ry: 0, size: [P.D.bounds.w, P.D.bounds.d, P.D.bounds.h], tags: { culture: 'fellgang', types: ['multi-family dwelling'] } });
const reg = K.register(P.D, TG, { parent: house.id, culture: 'fellgang', name: 'The great house', at: (x, y, z) => [x + 100, y + 5, z - 40] }), au = TG.audit();
const want = P.D.rooms.length + P.D.kivas.length + P.D.ladders.length + P.D.plazas.length, kids = TG.query({ parent: house.id });
const TN = KTAGS.create({ build: 'neg' }), hn = TN.add({ 'class': 'building', kind: 'x', key: 'x', name: 'x', at: [0, 0, 0], size: [1, 1, 1], tags: { culture: 'fellgang', types: ['multi-family dwelling'] } });
K.register(P.line, TN, { parent: hn.id, culture: 'nonesuch' });
ok('every room, kiva, ladder and plaza registered in core/tags as the house\'s children (' + reg.count + ' records), the audit clean',
  reg.count === want && kids.length >= want && au.unknown === 0 && TG.get(reg.ids[P.D.rooms[0].id]).at[0] === +(byId[P.D.rooms[0].cell].cx + 100).toFixed(4), TN.audit().unknown > 0,
  'unknown ' + au.unknown + ' ' + JSON.stringify(au.unknownValues));

// ---- the bar: a wall across a pass, with a gate and a culvert under its rooms
const BAR = { id: 'bar', world: 7106, shape: 'bar', L: 168, rows: 4, maxStoreys: 5, wallBase: 2, wingLen: 44, wingRows: 2, ragged: 0.1, people: 2.4,
  passages: [{ x: 20, w: 8.4, clear: 2, kind: 'gate' }, { x: -4, w: 12.6, clear: 1, kind: 'culvert' }], kivas: { great: [0], small: 3 } };
const B = K.house(BAR), bc = allOk(B), wall = B.cells.filter(c => c.block === 'wall'), outer = wall.filter(c => c.row === 3);
const endsH = Math.min(...outer.filter(c => c.seg < 2 || c.seg >= c.segs - 2).map(c => c.storeys)), midH = Math.max(...outer.filter(c => c.seg >= 2 && c.seg < c.segs - 2).map(c => c.storeys));
ok('a wall across a pass: ' + B.census.rooms + ' rooms, ' + B.census.pop + ' people, its outer row ' + midH + ' storeys and bastions of ' + endsH + ' at the ends, every check passing',
  !bc.length && !B.errors.length && endsH === midH + 1 && B.census.pop > 600, !(endsH === midH), bc.join(', '));
const gate = B.passages.find(p => p.kind === 'gate'), culv = B.passages.find(p => p.kind === 'culvert'), G2 = K.graph(B);
ok('the gate and the culvert run under the rooms (gate ' + gate.cells.length + ' columns clear ' + gate.clear + ' storeys, culvert ' + culv.cells.length + ' clear ' + culv.clear + '); the gate joins the outside to the plaza, the culvert does not',
  gate.cells.length === 8 && culv.cells.length === 12 && B.rooms.every(r => { const c = B.byId[r.cell]; return !c.passage || r.storey >= c.base; }) && G2.out.filter(n => n === gate.plaza).length >= 1 && K.check.passages(B).ok,
  (() => { const Q = clone(B); Q.rooms.push({ id: gate.cells[0] + ':0', cell: gate.cells[0], storey: 0, y0: 0, h: 2.6, use: 'store', entry: { by: 'hatch', from: 'out' } }); return !K.check.passages(Q).ok; })());
ok('the kivas keep off the trail and the river across the plaza (' + B.keepOut.length + ' strips)', K.check.kivas(B).ok && B.kivas.length >= 3,
  (() => { const Q = clone(B); Q.kivas[1].x = (B.keepOut[0].pts[0][0] + B.keepOut[0].pts[1][0]) / 2; Q.kivas[1].z = B.keepOut[0].pts[0][1] + 8; return !K.check.kivas(Q).ok; })());

// ---- inside the rooms: frames and furniture
const TABLE = { store: [{ key: 'bin', w: 1.4, d: .8, at: 'wall', n: [1, 3] }, { key: 'jars', w: .9, d: .7, at: 'corner', n: [0, 2] }],
  home: [{ key: 'platform', w: 2.0, d: 1.0, at: 'back', n: [1, 1] }, { key: 'hearth', w: .9, d: .9, at: 'corner', n: [1, 1] }, { key: 'niche', w: .9, d: .35, at: 'wall', n: [0, 2] }],
  hero: [{ key: 'seat', w: 1.2, d: 1, at: 'back', n: [1, 1] }, { key: 'platform', w: 2.0, d: 1.0, at: 'wall', n: [1, 1] }] };
const FU = K.furnish(B, TABLE), fc = K.check.furniture(B), homes = B.rooms.filter(r => r.use === 'home'), plat = new Set(B.furniture.filter(f => f.key === 'platform').map(f => f.room));
const fn = clone(B); fn.furniture = fn.furniture.slice(); fn.hatchByCell = B.hatchByCell; const fr = fn.furniture[0], F0 = K.frame(fn, fn.rooms.find(r => r.id === fr.room));
fn.furniture[0] = Object.assign({}, fr, { lx: F0.hx, lz: F0.hz + .3 });
ok('the rooms are furnished by their use (' + FU.pieces + ' pieces: ' + Object.entries(FU.byUse).map(e => e.join(' ')).join(', ') + '; ' + FU.skipped + ' did not fit), each piece inside its room, clear of its door and hatch, none overlapping',
  fc.ok && FU.pieces > 1000 && plat.size >= homes.length * .9, !K.check.furniture(fn).ok, fc.bad.slice(0, 3).join('; '));
ok('the same plan furnishes the same (' + B.furniture.length + ' pieces)', JSON.stringify(K.furnish(K.house(BAR), TABLE)) === JSON.stringify(FU) && JSON.stringify(K.house(BAR).rooms) === JSON.stringify(B.rooms),
  JSON.stringify(K.furnish(K.house(Object.assign({}, BAR, { world: 9 })), TABLE)) !== JSON.stringify(FU));
const TB = KTAGS.create({ build: 'test-pueblo-bar' }), hb = TB.add({ 'class': 'building', kind: 'bar', key: 'bar', name: 'A wall house', at: [0, 0, 0], size: [1, 1, 1], tags: { culture: 'fellgang', types: ['dwelling-multi'] } });
const rb = K.register(B, TB, { parent: hb.id, culture: 'fellgang' }), nf = K.registerFurniture(B, TB, rb.ids, { culture: 'fellgang' });
ok('every piece registered in core/tags as its room\'s child (' + nf + ')', nf === B.furniture.length && TB.query({ 'class': 'furniture' }).length === nf && TB.audit().unknown === 0,
  !(nf === B.furniture.length + 1));

process.exit(bad ? 1 : 0);
