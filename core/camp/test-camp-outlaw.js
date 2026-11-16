// node core/camp/test-camp-outlaw.js: outlaw bands, their size and their lookouts (50-camp-outlaw.js). Each check has a
// negative that must fail.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
const NEW = f => /^5\d-camp-outlaw\.js$/.test(f);
fs.readdirSync(__dirname).filter(f => /^\d\d-camp-.*\.js$/.test(f) && !NEW(f)).sort().forEach(f => load('core/camp/' + f));
load('kits/beast-riders/src/79-br-camp.js');
const BR_CAMP = vm.runInThisContext('BR_CAMP');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- the opt-in proof: the Beast Riders' census and pitch answer bit for bit the same before and after 50 loads
const PROG = BR_CAMP.raptor.grounds.lower, bdims = (k, v) => ({ w: 5 + (k.length % 4), d: 5 + (v || 0), h: 4 });
const digest = () => JSON.stringify({ c: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(w => KCAMP.census({ id: 'raptor-' + w, world: w, culture: 'beast-rider', program: PROG })),
  p: [3, 4].map(w => KCAMP.pitch({ id: 'raptor-' + w, world: w, culture: 'beast-rider', program: PROG, site: { x: 100, z: -50 }, dims: bdims, way: [0, 1] })),
  rows: Object.keys(KCAMP.CULTURES) });
const before = digest(), rowsBefore = Object.keys(KCAMP.CULTURES);
fs.readdirSync(__dirname).filter(NEW).forEach(f => load('core/camp/' + f));
const after = digest();
ok('loading 50 moves no Beast Rider census or pitch (a row with no `band` goes to the old census)',
  after.replace(/,"outlaw"\]/, ']') === before && typeof KCAMP.census.base === 'function' && Object.keys(KCAMP.CULTURES).length === rowsBefore.length + 1,
  JSON.stringify(KCAMP.census({ id: 'raptor-1', world: 1, culture: 'beast-rider', program: PROG })) !== JSON.stringify(KCAMP.census({ id: 'raptor-1', world: 2, culture: 'beast-rider', program: PROG })));

// ---- the band's size
const OL = KCAMP.CULTURES.outlaw, OP = OL.program;
const pops = []; for (let w = 0; w < 200; w++) pops.push(KCAMP.census({ id: 'ranjo-' + w, world: w, culture: 'outlaw', program: OP }).pop);
const rp = []; for (let w = 0; w < 30; w++) rp.push(KCAMP.census({ id: 'raptor-' + w, world: w, culture: 'beast-rider', program: PROG }).pop);
ok('an outlaw band is 10 to 30 people at every seed (200 seeds), and spans the range', pops.every(p => p >= 10 && p <= 30) && Math.min(...pops) <= 12 && Math.max(...pops) >= 28,
  !rp.every(p => p >= 10 && p <= 30), 'from ' + Math.min(...pops) + ' to ' + Math.max(...pops) + '; the Raptor band ' + Math.min(...rp) + '-' + Math.max(...rp));
const tight = { tents: [{ key: 'ol_tent_chief', n: 1 }, { key: 'ol_leanto', n: 1 }], pens: [] };
const huge = { tents: [{ key: 'ol_tent_chief', n: 1 }, { key: 'ol_tent_family', n: 12 }, { key: 'ol_leanto', n: 12 }], pens: [] };
const tp = [], hp = [], he = [];
for (let w = 0; w < 50; w++) { tp.push(KCAMP.census({ id: 'b' + w, world: w, culture: 'outlaw', program: tight }).pop); const c = KCAMP.census({ id: 'b' + w, world: w, culture: 'outlaw', program: huge }); hp.push(c.pop); he.push(c.empty.length); }
ok('the band holds its size whatever the program: crowded in a small camp, tents left empty in a big one',
  tp.every(p => p >= 10 && p <= 30) && hp.every(p => p >= 10 && p <= 30) && he.every(n => n > 0),
  KCAMP.census.base({ id: 'b1', world: 1, culture: 'outlaw', program: huge }).pop > 30 && KCAMP.census.base({ id: 'b1', world: 1, culture: 'outlaw', program: tight }).pop < 10,
  'small ' + Math.min(...tp) + '-' + Math.max(...tp) + ', big ' + Math.min(...hp) + '-' + Math.max(...hp) + ' with ' + Math.min(...he) + '-' + Math.max(...he) + ' empty tents');
KCAMP.CULTURES['nw-bandit'] = Object.assign({}, OL, { band: [12, 16] });
const nw = []; for (let w = 0; w < 60; w++) nw.push(KCAMP.census({ id: 'nw' + w, world: w, culture: 'nw-bandit', program: OP }).pop);
KCAMP.CULTURES['nw-plain'] = Object.assign({}, OL, { band: null });
ok('a row\'s own band is its size (the north-western bandits at 12-16); a row with no band takes the old census',
  nw.every(p => p >= 12 && p <= 16), KCAMP.census({ id: 'nw1', world: 1, culture: 'nw-plain', program: OP }).target === undefined, nw.join(','));
const C1 = KCAMP.census({ id: 'ranjo-7', world: 3, culture: 'outlaw', program: OP });
const rolesOk = c => c.people.every(p => p.role) && c.people.filter(p => p.role === 'chief').length === 1 && c.people.some(p => p.role === 'raider') &&
  c.people.filter(p => p.role === 'quartermaster').length === 1 && !c.people.some(p => p.role === 'hunter' || p.role === 'gatherer');
ok('the band\'s people: one leader, a quartermaster at the cache, the rest raiders and scouts (the row\'s idle roles)', rolesOk(C1),
  !rolesOk(KCAMP.census({ id: 'raptor-1', world: 1, culture: 'beast-rider', program: PROG })), C1.pop + ' people: ' + JSON.stringify(C1.people.reduce((a, p) => (a[p.role] = (a[p.role] || 0) + 1, a), {})));
ok('the same band has the same people', JSON.stringify(KCAMP.census({ id: 'ranjo-7', world: 3, culture: 'outlaw', program: OP })) === JSON.stringify(C1),
  JSON.stringify(KCAMP.census({ id: 'ranjo-8', world: 3, culture: 'outlaw', program: OP })) !== JSON.stringify(C1));

// ---- the lookout, on a valley with the road on its floor: a parabolic side up to a crest at x 250, a hollow behind it
const valley = crestDrop => (x, z) => { const a = Math.abs(x); return a <= 250 ? 0.0025 * a * a : crestDrop ? Math.max(36, 156.25 - 0.8 * (a - 250)) : 0.0025 * a * a; };
const G = valley(true), road = [[0, -400], [0, 400]];
const cover = (x, z) => Math.hypot(x - 150, z - 100) < 15 ? 1 : 0;
const lo = o => Object.assign({ id: 'ranjo-7', world: 3, road, ground: G, cover, box: { x0: 40, z0: -300, x1: 400, z1: 300 } }, o || {});
const crest = KCAMP.lookoutAt(lo(), 250, 0), below = KCAMP.lookoutAt(lo(), 200, 0), hid = KCAMP.lookoutAt(lo(), 150, 100);
ok('a skylined crest point is seen from the road more, and scores worse, than a point below the crest with ground behind it',
  crest.skyline > 0.9 && below.skyline < 0.1 && crest.seen > below.seen && crest.score < below.score && below.sees > 0.9,
  KCAMP.lookoutAt(lo({ ground: valley(false) }), 250, 0).skyline < 0.1,
  'crest sees ' + crest.sees.toFixed(2) + ' seen ' + crest.seen.toFixed(2) + ' score ' + crest.score.toFixed(2) + '; below sees ' + below.sees.toFixed(2) + ' seen ' + below.seen.toFixed(2) + ' score ' + below.score.toFixed(2));
ok('a fully covered point (not skylined) is unseen, and still sees the road', hid.seen === 0 && hid.sees > 0.9, KCAMP.lookoutAt(lo({ cover: null }), 150, 100).seen > 0.3,
  'sees ' + hid.sees.toFixed(2));
const LK = KCAMP.lookout(lo());
ok('the chosen lookout sees most of the road and is not seen from it; the ones returned stand apart', LK.length === 3 && LK[0].sees > 0.6 && LK[0].seen < 0.1 && LK[0].score >= LK[1].score &&
  LK.every((a, i) => LK.every((b, j) => i === j || Math.hypot(a.x - b.x, a.z - b.z) >= 80)),
  KCAMP.lookout(lo({ cover: null }))[0].seen > 0.2, LK.map(l => l.id + ' ' + l.sees.toFixed(2) + '/' + l.seen.toFixed(2)).join(', '));
ok('the same lookout search gives the same ranks and ids', JSON.stringify(KCAMP.lookout(lo())) === JSON.stringify(LK),
  KCAMP.lookout(lo({ id: 'other' }))[0].id !== LK[0].id);

// ---- the camp: out of sight of the road, near its lookout; no pasture, no hedge; the watch posted
const OC = KCAMP.outlawCamp({ id: 'ranjo-7', world: 3, road, ground: { h: G, ok: () => true }, cover, box: { x0: 40, z0: -300, x1: 420, z1: 300 }, water: [{ x: 380, z: 60 }] });
const tgt = 1.6, R = []; for (let z = -400; z <= 400; z += 10) R.push([0, z]);
const seenFromRoad = (x, z, h) => R.some(r => { const ay = G(r[0], r[1]) + tgt, by = G(x, z) + h, d = Math.hypot(x - r[0], z - r[1]), n = Math.ceil(d / 4);
  for (let k = 1; k < n; k++) { const t = k / n; if (G(r[0] + (x - r[0]) * t, r[1] + (z - r[1]) * t) > ay + (by - ay) * t) return false; } return true; });
const hiddenCamp = c => !seenFromRoad(c.site.x, c.site.z, 3) && c.camp.records.every(r => !seenFromRoad(r.x, r.z, r.h));
const watch = OC.census && OC.census.people.filter(p => p.role === 'lookout');
ok('the camp: hidden from the road (its site and every tent\'s top), near its lookout, no pasture or hedge, its empty tents unpitched',
  !OC.error && hiddenCamp(OC) && Math.hypot(OC.site.x - OC.lookouts[0].x, OC.site.z - OC.lookouts[0].z) <= 500 && OC.site.x >= 150 && !OC.camp.pasture && !OC.camp.hedge &&
  OC.camp.unpitched.length === OC.census.empty.filter(id => OC.camp.unpitched.includes(id)).length && OC.camp.records.every(r => !OC.census.empty.includes(r.id)) &&
  KCAMP.check(OC.camp).overlaps === 0,
  !hiddenCamp(Object.assign({}, OC, { site: { x: 120, z: 0 } })),
  OC.error || ('site ' + Math.round(OC.site.x) + ',' + Math.round(OC.site.z) + ', ' + OC.camp.records.length + ' tents pitched, ' + OC.camp.unpitched.length + ' empty'));
ok('two of the band watch from each lookout; the camp\'s tents are pending (no Yuni camp kit) at the row\'s boxes',
  watch.length === 2 * OC.lookouts.length && watch.every(p => OC.lookouts.some(l => l.id === p.work)) && OC.camp.records.every(r => r.pending && r.w === OL.pending[r.key].w),
  KCAMP.outlawCamp({ id: 'ranjo-7', world: 3, road, ground: { h: G }, cover, box: { x0: 40, z0: -300, x1: 420, z1: 300 }, dims: () => ({ w: 3, d: 3, h: 2 }) }).camp.records.every(r => !r.pending),
  watch.map(p => p.id).join(' '));
let threw = false, e1 = null;
try { e1 = KCAMP.outlawCamp({ id: 'x', world: 1, road, ground: { h: (x, z) => 0 }, box: { x0: 40, z0: -300, x1: 420, z1: 300 } }).error; } catch (e) { threw = e; }
ok('on open flat ground there is nowhere to hide: an error, not an exception', !threw && !!e1, !OC.error, e1 || String(threw));

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
