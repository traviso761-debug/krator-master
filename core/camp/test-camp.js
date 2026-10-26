// node core/camp/test-camp.js: core/camp's data side (the census and the pitch). Each check has a negative that must fail.
// The program is the Beast Riders' Raptor band's (kits/beast-riders/src/79-br-camp.js, read in place) and the boxes the
// kit's own declared ones (its ASSETs' w, d, h and variantDims, read from the source), so a change to the kit is covered.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-camp-.*\.js$/.test(f)).sort().forEach(f => load('core/camp/' + f));
load('kits/beast-riders/src/79-br-camp.js');
const BR_CAMP = vm.runInThisContext('BR_CAMP');
let bad = 0;
const ok = (name, pass, neg, detail) => { const r = pass && neg; if (!r) bad++;
  console.log((r ? 'PASS  ' : 'FAIL  ') + name + (detail ? '  (' + detail + ')' : '') + (pass && !neg ? '  [its negative did not fail]' : '')); };

// ---- the kit's boxes, from its ASSET declarations
const DIMS = {};
for (const f of fs.readdirSync(path.join(ROOT, 'kits/beast-riders/src')).filter(f => /^7\d-br-tents?-/.test(f))) {
  const t = fs.readFileSync(path.join(ROOT, 'kits/beast-riders/src', f), 'utf8');
  for (const m of t.matchAll(/key:\s*'(br_[a-z_]+)'[\s\S]*?w:\s*([\d.]+),\s*d:\s*([\d.]+),\s*h:\s*([\d.]+)(?:,\s*variants:[^\n]*?)?(?:[\s\S]{0,400}?variantDims:\s*(\[[^\]]*\]))?/g)) {
    let vd = null;
    if (m[5]) try { vd = JSON.parse(m[5].replace(/(\w+):/g, '"$1":')); } catch (e) { vd = null; }
    DIMS[m[1]] = { w: +m[2], d: +m[3], h: +m[4], vd };
  }
}
const dims = (k, v) => { const D = DIMS[k]; if (!D) return null; const q = D.vd && D.vd[v]; return q ? { w: q.w, d: q.d, h: q.h } : { w: D.w, d: D.d, h: D.h }; };
const PROG = BR_CAMP.raptor.grounds.lower;
const keysOf = p => p.tents.concat(p.pens).map(e => e.key);
ok('the kit declares a box for every key of the Raptor band\'s program', keysOf(PROG).every(k => dims(k, 0)), !dims('br_tent_nonesuch', 0),
  keysOf(PROG).filter(k => !dims(k, 0)).join(', '));

// ---- the census
const C0 = KCAMP.census({ id: 'raptor-1', world: 7, culture: 'beast-rider', program: PROG });
const pops = [];
for (let w = 0; w < 60; w++) pops.push(KCAMP.census({ id: 'raptor-' + w, world: w, culture: 'beast-rider', program: PROG }).pop);
const small = { tents: PROG.tents.filter(e => !/dome_(family|double)/.test(e.key)), pens: PROG.pens };
ok('a Raptor band is 40 to 70 people at every seed (60 seeds)', pops.every(p => p >= 40 && p <= 70),
  KCAMP.census({ id: 'x', world: 1, culture: 'beast-rider', program: small }).pop < 40, 'from ' + Math.min(...pops) + ' to ' + Math.max(...pops));
const T0 = KCAMP.tentIds('raptor-1', PROG);
const dwell = T0.filter(t => /dome_(family|double)|chief/.test(t.key)).map(t => t.id);
ok('every household lives in a dwelling or the chief\'s pavilion, and every dwelling is lived in',
  C0.households.every(h => dwell.indexOf(h.tent) >= 0) && dwell.every(id => C0.households.some(h => h.tent === id)),
  !dwell.concat(['raptor-1:br_tent_dome_family:9']).every(id => C0.households.some(h => h.tent === id)), C0.households.length + ' households');
const works = T0.filter(t => KCAMP.CULTURES['beast-rider'].work[t.key]).map(t => t.id);
ok('every workshop, the shrine and every staffed pen has its workers; one chief', works.every(id => C0.people.some(p => p.work === id)) &&
  C0.people.filter(p => p.role === 'chief').length === 1, !works.concat(['raptor-1:br_tent_council:0']).every(id => C0.people.some(p => p.work === id)),
  works.length + ' places of work');
ok('the census is the band\'s: the same at every call, another band\'s differs',
  JSON.stringify(KCAMP.census({ id: 'raptor-1', world: 7, culture: 'beast-rider', program: PROG })) === JSON.stringify(C0),
  JSON.stringify(KCAMP.census({ id: 'raptor-2', world: 7, culture: 'beast-rider', program: PROG }).households.map(h => h.size)) !== JSON.stringify(C0.households.map(h => h.size)));

// ---- the pitch, on open ground
const base = { id: 'raptor-1', world: 7, culture: 'beast-rider', program: PROG, site: { x: 1000, z: -500 }, dims, way: [-1, 0] };
const P = KCAMP.pitch(base), chk = KCAMP.check(P);
const nAll = T0.length;
ok('on open ground everything is pitched: no overlap (2 m clear), every box inside the hedge', P.short.length === 0 && P.records.length === nAll &&
  chk.overlaps === 0 && chk.outside === 0,
  (() => { const R = P.records.map(r => Object.assign({}, r)); R[1].x = R[0].x + 1; R[1].z = R[0].z; return KCAMP.check({ records: R, hedge: P.hedge }).overlaps > 0; })(),
  P.records.length + ' records, ring ' + P.R.toFixed(1) + ' m, short: ' + P.short.join(','));
const rel = r => [r.x - P.site.x, r.z - P.site.z];
const dot = (a, b) => (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]) || 1);
const chief = P.records.find(r => r.kind === 'chief');
const Pf = KCAMP.pitch(Object.assign({}, base, { way: [1, 0] })), chiefF = Pf.records.find(r => r.kind === 'chief');
ok('the chief\'s pavilion stands opposite the way in', dot(rel(chief), [1, 0]) > 0.95, dot([chiefF.x - Pf.site.x, chiefF.z - Pf.site.z], [1, 0]) < 0,
  'its bearing ' + dot(rel(chief), [1, 0]).toFixed(3));
const tradeD = P.records.filter(r => r.kind === 'trade').map(r => dot(rel(r), base.way)), dwellD = P.records.filter(r => r.kind === 'dwelling').map(r => dot(rel(r), base.way));
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const relF = r => [r.x - Pf.site.x, r.z - Pf.site.z];
ok('the trades stand nearer the way in than the dwellings', mean(tradeD) > mean(dwellD),
  !(mean(Pf.records.filter(r => r.kind === 'trade').map(r => dot(relF(r), base.way))) > mean(Pf.records.filter(r => r.kind === 'dwelling').map(r => dot(relF(r), base.way)))),
  mean(tradeD).toFixed(2) + ' against ' + mean(dwellD).toFixed(2));
const doorOk = r => dot([Math.sin(r.ry), Math.cos(r.ry)], [P.site.x - r.x, P.site.z - r.z]) > 0.99;
ok('every door faces the hearth', P.records.every(doorOk), !doorOk(Object.assign({}, P.records[0], { ry: P.records[0].ry + Math.PI })));
const tents = P.records.filter(r => r.kind !== 'pen'), pens = P.records.filter(r => r.kind === 'pen');
const W = KCAMP.CULTURES['beast-rider'].wind, far = Math.max(...tents.map(r => Math.hypot(...rel(r))));
const Pw = KCAMP.pitch(Object.assign({}, base, { wind: [-W[0], -W[1]] }));
ok('the pens stand downwind, beyond the ring', pens.length === PROG.pens.reduce((s, e) => s + e.n, 0) && pens.every(r => dot(rel(r), W) > 0.3 && Math.hypot(...rel(r)) > far),
  Pw.records.filter(r => r.kind === 'pen').every(r => dot([r.x - Pw.site.x, r.z - Pw.site.z], W) < 0), pens.length + ' pens');
const area = pts => Math.abs(pts.reduce((s, a, i) => { const b = pts[(i + 1) % pts.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2;
ok('the pasture is its program\'s hectares, downwind, inside the hedge; the hedge has two gates, the rails one',
  P.pasture && Math.abs(area(P.pasture.pts) / 1e4 - PROG.pasture.ha) < 0.01 * PROG.pasture.ha && dot(P.pasture.dir, W) > 0.5 &&
  P.pasture.pts.every(q => KCAMP.inPoly(P.hedge.pts, q[0], q[1])) && P.hedge.gates.length === 2 && P.fence.gates.length === 1,
  !(Math.abs(area(P.pasture.pts) / 1e4 - 2 * PROG.pasture.ha) < 0.01 * PROG.pasture.ha), P.pasture ? (area(P.pasture.pts) / 1e4).toFixed(2) + ' ha' : 'none');

// ---- the ground: a hole in the ring (a pond, a rock) is kept off, and the camp still pitches round it
const hole = { x: chief.x, z: chief.z, r: 12 }, holeOk = (x, z) => Math.hypot(x - hole.x, z - hole.z) > hole.r;
const Ph = KCAMP.pitch(Object.assign({}, base, { ground: { ok: holeOk } })), chkH = KCAMP.check(Ph, { ok: holeOk });
ok('a hole in the ground is kept off and the camp pitches round it', chkH.offGround === 0 && chkH.overlaps === 0 && Ph.short.length === 0,
  KCAMP.check(P, { ok: holeOk }).offGround > 0, 'short: ' + Ph.short.join(','));

// ---- the formation, the ids, the sameness
const Ps = KCAMP.pitch(Object.assign({}, base, { formation: 'horseshoe' }));
const inMouth = R => R.filter(r => r.kind !== 'pen').filter(r => dot([r.x - base.site.x, r.z - base.site.z], base.way) > Math.cos(Math.PI / 5)).length;
ok('the horseshoe keeps its mouth open toward the way in', inMouth(Ps.records) === 0 && KCAMP.check(Ps).overlaps === 0,
  inMouth(Ps.records.map(r => Object.assign({}, r, { x: 2 * base.site.x - r.x }))) > 0);
const P2 = KCAMP.pitch(Object.assign({}, base, { site: { x: -40000, z: 9000 } }));
ok('a tent is the same record at every site (its id is the band\'s and the program\'s)', JSON.stringify(P2.records.map(r => r.id).sort()) === JSON.stringify(P.records.map(r => r.id).sort()) &&
  P2.records.every(r => C0.households.some(h => h.tent === r.id) || r.kind !== 'dwelling'), P2.records[0].x !== P.records[0].x);
ok('the same band at the same site pitches the same camp', JSON.stringify(KCAMP.pitch(base)) === JSON.stringify(P),
  JSON.stringify(KCAMP.pitch(Object.assign({}, base, { gap: 3 }))) !== JSON.stringify(P));

console.log(bad ? bad + ' FAILED' : 'all passed');
process.exit(bad ? 1 : 0);
