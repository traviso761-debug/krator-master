// node core/world/test-world-camps-core.js: core/world's pitched tent camps (48w-world-camps.js, KWCAMPS; Stage 8 T26) on a
// synthetic world, each check with its negative (tools/ktest.js: a fault and its fix):
//   1. every shipped formation (ring, horseshoe, halt, line, cluster) lays the same camp twice, whole, on good ground, no two
//      tents within half a metre (counted through core/space, KSPACE);
//   2. a formation a region registers is used, and an unknown one is an error, not a camp;
//   3. the site plan (48s KSITES.plan): a region with no tent camp is planned as version 1 with no `camps`; a region's camps
//      and a site's go into version 2, a site the cut lacks is `uncut`; KWCAMPS.of reads an old plan as no camps;
//      KSITES.check catches a tent laid on another;
//   4. no tents kit: pending boxes and no error; the kit's bundle (TNK.box), its table (tnDims) or a region's kitDims each fill
//      them;
//   5. `when`: a window across the year's end, a calendar's window, a rule and a function pitch and strike;
//   6. people: a count, a census record, core/camp's census of a program, a provider; an unknown provider is an error;
//   7. works and marks: the bed works in the wadi, a custom works rule, a mark on the supply tent nearest the chief.
// Read in place: core/rand, core/space, core/camp (10, 20, 30, 50), core/world 48s and 48w; the Tents kit's table
// (kits/tents/src/33-tn-table.js) in a context of its own, so the page's tnDims is absent until a test gives it.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = f => vm.runInThisContext(rd(f), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/camp/10-camp-cultures.js', 'core/camp/20-camp-census.js',
  'core/camp/30-camp-pitch.js', 'core/camp/50-camp-tents.js'].forEach(load);
const TN = {}; vm.runInNewContext(rd('kits/tents/src/33-tn-table.js') + '\n;this.tnDims = tnDims;', TN);
/* the synthetic world: a floor falling gently east, a wadi down it at x = 600 (its bed 4 m down, the flow strongest in it), a
   wet hollow at (-900, 0), a steep bank west of x = -1400; the cut a 6 km square */
const wadi = (x, z) => Math.exp(-Math.pow((x - 600 - 30 * Math.sin(z / 400)) / 40, 2));
global.WORLD = {
  inside: (x, z) => Math.abs(x) < 3000 && Math.abs(z) < 3000,
  Hland: (x, z) => -1200 - x * 0.02 - 4 * wadi(x, z) + (x < -1400 ? (-1400 - x) * 0.6 : 0),
  H: (x, z) => WORLD.Hland(x, z),
  water: (x, z) => Math.hypot(x + 900, z) < 120 ? WORLD.Hland(x, z) + 1 : -1e9,
  townW: () => 0,
  at: (x, z) => ({ flow: wadi(x, z) }),
  fromPx: (px, py) => [(px - 100) * 2000, (py - 100) * 2000]
};
const SITES = [{ id: 's1', name: 'One', type: 'town', x: 0, z: 0 }, { id: 's2', name: 'Two', type: 'town', x: 0, z: -2200 }];
global.WORLD_DATA = { meta: { sites: SITES } };
load('core/world/48s-world-sites.js');
load('core/world/48w-world-camps.js');
const dims = KCAMP.tentDims(k => TN.tnDims(k)), ground = { ok: KSITES.groundOk };
const lay = (S, o) => KWCAMPS.lay(S, 7, Object.assign({ dims, ground }, o || {}));
const J = x => JSON.stringify(x);

/* whole, on good ground, no two tents within half a metre: the boxes filed in core/space, each tested against its neighbours */
function apart(c) {
  const R = c.records.concat(c.escort ? c.escort.records : []), sp = KSPACE.create({ cell: 16 });
  let ov = 0;
  R.forEach(r => { const rr = Math.hypot(r.w, r.d) / 2;
    sp.some(r.x, r.z, rr + 0.5, q => { if (KCAMP.overlaps(r, q, 0.5)) ov++; return false; });
    sp.insert(r, r.x, r.z, rr); });
  const off = R.filter(r => !KCAMP.box(r, 0).every(q => KSITES.groundOk(q[0], q[1]))).length;
  return !ov && !off && !c.short.length && R.length >= 5;
}
const moved = c => { const q = JSON.parse(J(c)); q.records[0].x = q.records[1].x; q.records[0].z = q.records[1].z; return q; };

// ---- 1. the shipped formations
const FORMS = {
  ring: { culture: 'scyvoi', people: 40, hedge: { key: 'thorn' } },
  horseshoe: { culture: 'desert', people: 40 },
  halt: { culture: 'iziz', wagons: 16, formation: 'laager', escort: { culture: 'republican', people: 16, program: { supply: 0 } } },
  line: { culture: 'republican', people: 60, program: { guard: 2, mess: 2 } },
  cluster: { culture: 'ash', people: 50, group: 3 }
};
for (const kind of Object.keys(FORMS)) {
  const S = Object.assign({ id: 's1/camp/' + kind, kind, site: 's1', near: [-300, 400], way: [1, 0] }, FORMS[kind]);
  const a = lay(S), b = lay(S), c = a.camp;
  T.ok('the ' + kind + ' is laid with no error, the same twice (' + (c ? c.records.length + ' tents' : a.error) + ')',
    !!c && !a.error && !(a.errors || []).length && c.kind === kind && J(a) === J(b), a.error);
  T.neg('the ' + kind + ': whole on good ground, no two tents within half a metre (a tent laid on another is caught)', apart, c ? moved(c) : null, c);
}
T.ok('a ring has its hedge, one gate on the way in, the chief\'s pavilion', (() => { const c = lay(Object.assign({ id: 'r', kind: 'ring', site: 's1', near: [-300, 400], way: [1, 0] }, FORMS.ring)).camp;
  return c.hedge && c.hedge.gates.length === 1 && c.records.some(r => r.role === 'chief') && KWCAMPS.check(c).ok; })());
T.ok('a halt\'s laager: its wagons, the escort\'s camp beside it', (() => { const c = lay(Object.assign({ id: 'h', kind: 'halt', site: 's1', near: [-300, 400], way: [1, 0] }, FORMS.halt)).camp;
  return c.formation === 'laager' && c.records.filter(r => /wagon/.test(r.def)).length === 16 && c.escort && c.escort.records.length >= 4 && KWCAMPS.check(c).ok; })());

// ---- 2. a formation a region registers
KWCAMPS.formation('spokes', (S, X) => {
  const P = X.place(2), T0 = X.tents().filter(t => !t.pen), short = [];
  T0.forEach((t, i) => { const a = i / T0.length * Math.PI * 2, r0 = 20 + (i % 2) * 12 + t.d / 2, x = X.site.x + Math.cos(a) * r0, z = X.site.z + Math.sin(a) * r0;
    const r = P.first([{ id: t.id, key: t.key, v: t.v, kind: t.kind, x, z, ry: Math.atan2(X.site.x - x, X.site.z - z), w: t.w, d: t.d, h: t.h, spoke: i }]);
    if (!r) short.push(t.id); });
  return { records: P.placed, R: 50, short };
}, { R: 50, check: C => ({ ok: C.records.every(r => r.spoke != null), detail: 'spokes' }) });
const spoke = k => lay({ id: 's1/camp/spokes', kind: k, site: 's1', near: [-300, -400], culture: 'generic', people: 24 });
T.neg('a registered formation lays its camp (an unknown kind is an error, not a camp)', r => !!r.camp && r.camp.kind === 'spokes' && r.camp.records.every(q => q.spoke != null) && apart(r.camp),
  spoke('no-such-formation'), spoke('spokes'));
T.ok('the unknown kind\'s error names the registered formations', /no formation no-such-formation .*spokes/.test(spoke('no-such-formation').error || ''));

// ---- 3. the site plan
const kit = { dims: () => null, programs: () => null };
const P1 = KSITES.plan({ region: 't', world: 7, sites: {} }, kit);
T.ok('a region with no tent camp is planned as version 1, with no camps (its baked hash stands)', P1.version === 1 && !('camps' in P1) && !('uncut' in P1));
const SPEC2 = { region: 't', world: 7, sites: { s2: { camps: [{ id: 's2/camp/fair', kind: 'line', near: [300, 300], culture: 'generic', people: 30 }] },
  s9: { camps: [{ id: 's9/camp/far', kind: 'ring', culture: 'generic', people: 20 }] } },
  camps: [{ id: 's1/camp/band', kind: 'cluster', site: 's1', near: [-300, 400], culture: 'desert', people: 30 },
    { id: 'free/camp/px', kind: 'ring', px: [100.5, 100.25], culture: 'generic', people: 20 }] };
const P2 = KSITES.plan(SPEC2, kit);
T.ok('a region\'s camps and a site\'s go into version 2 (' + J({ camps: (P2.camps || []).length, site: P2.sites.map(s => s.camps.length), uncut: P2.uncut, errors: P2.errors }) + ')',
  P2.version === 2 && P2.camps.length === 2 && P2.camps[1].id === 'free/camp/px' && P2.sites.find(s => s.id === 's2').camps[0].kind === 'line' &&
  P2.uncut.length === 1 && P2.uncut[0].id === 's9/camp/far' && !P2.errors.length && J(KSITES.plan(SPEC2, kit)) === J(P2));
const V1 = { format: 'krator-site-plan', version: 1, sites: [{ id: 's1', camps: [{ id: 's1/camp/raptor', tribe: 'raptor', records: [] }], roads: [] }], errors: [] };
T.neg('KWCAMPS.of: an old plan (version 1) carries no tent camps (a version 2 plan carries its three)', P => KWCAMPS.of(P).camps.length === 0, P2, V1);
T.ok('KWCAMPS.of a version 2 plan: its three camps and its one awaiting the recut', KWCAMPS.of(P2).camps.length === 3 && KWCAMPS.of(P2).uncut.length === 1);
const shoved = P => { const Q = JSON.parse(J(P)); Q.camps[0].records[0].x = Q.camps[0].records[1].x; Q.camps[0].records[0].z = Q.camps[0].records[1].z; return Q; };
T.neg('KSITES.check reads the tent camps (a tent laid on another is caught)', P => KSITES.check(P).ok && KSITES.check(P).counts.tents === 3, shoved(P2), P2);

// ---- 4. the boxes: no tents kit gives pending boxes, never a failed plan
const base = { id: 's1/camp/boxes', kind: 'ring', site: 's1', near: [-300, 400], way: [1, 0], culture: 'xanadu', people: 30 };
const bare = KWCAMPS.lay(base, 7, { ground }), bc = bare.camp;
T.ok('no tents kit on the page: every tent a pending box, no error (' + (bc ? bc.boxes + ', ' + bc.records.filter(r => r.pending).length + ' of ' + bc.records.length : bare.error) + ')',
  !!bc && !bare.error && bc.boxes === 'pending' && bc.records.every(r => r.pending && r.w > 0 && r.d > 0));
global.TNK = { box: k => TN.tnDims(k), proto: () => null };
const kitted = KWCAMPS.lay(base, 7, { ground }).camp;
delete global.TNK;
T.neg('the Tents kit\'s bundle on the page fills the boxes (the camp without it is caught pending)', c => c.boxes === 'tents-kit' && !c.records.some(r => r.pending), bc, kitted);
T.ok('the kit\'s bundle and the given dims lay the same camp', J(kitted.records.map(r => [r.x, r.z, r.w])) === J(lay(base).camp.records.map(r => [r.x, r.z, r.w])));
global.tnDims = TN.tnDims;
const table = KWCAMPS.lay(base, 7, { ground }).camp;
delete global.tnDims;
KWCAMPS.kitDims('test-region', k => /^tn-bell-/.test(k) ? TN.tnDims(k) : null);
const region = KWCAMPS.lay(base, 7, { ground }).camp;
KWCAMPS.kitDims('test-region', null);
T.ok('the kit\'s table read in place (tnDims) fills them; a region\'s kitDims fills what it has, the rest stay pending (' + table.boxes + '; ' + region.boxes + ')',
  table.boxes === 'tents-table' && !table.records.some(r => r.pending) && region.boxes === 'pending+region' &&
  region.records.some(r => r.pending) && region.records.filter(r => /^tn-bell-/.test(r.def)).every(r => !r.pending));

// ---- 5. when
const at = w => lay(Object.assign({}, base, { id: 'w', when: w })).camp;
const rift = at([[300, 60]]);
const riftSeason = c => KWCAMPS.inSeason(c, 320) && KWCAMPS.inSeason(c, 30) && !KWCAMPS.inSeason(c, 200) && !KWCAMPS.inSeason(c, 61);
T.neg('a window across the year\'s end pitches in it and strikes out of it (the window read backwards is caught)', riftSeason, at([[60, 300]]), rift);
KWCAMPS.calendar('test', n => n === 'spring' ? [60, 150] : null);
const spring = at({ window: 'spring' });
T.ok('a calendar\'s window: its days and its name', J(spring.season.days) === '[[60,150]]' && spring.season.name === 'spring' && KWCAMPS.inSeason(spring, 100) && !KWCAMPS.inSeason(spring, 200));
T.ok('a window no calendar has is an error, not a camp', /no window autumn/.test(lay(Object.assign({}, base, { id: 'w2', when: { window: 'autumn' } })).error || ''));
KWCAMPS.when('even', (d, a) => d % (a.every == null ? 2 : a.every) === 0);
const even = at({ rule: 'even', every: 3 }), fnc = at(d => d >= 100 && d < 110);
T.neg('a rule pitches on its days (a camp with no `when` stands all year and is caught)', c => KWCAMPS.inSeason(c, 9) && !KWCAMPS.inSeason(c, 10), at(undefined), even);
T.ok('a function of the day is registered as a rule, the record stays JSON', fnc.season.rule === 'camp:w' && J(JSON.parse(J(fnc)).season) === J(fnc.season) &&
  KWCAMPS.inSeason(JSON.parse(J(fnc)), 105) && !KWCAMPS.inSeason(fnc, 111));
T.ok('no `when`: pitched every day of the year', (() => { const c = at(undefined); for (let d = 0; d < 365; d++) if (!KWCAMPS.inSeason(c, d)) return false; return true; })());
T.ok('the clock\'s day 0 is year day 259, its day 41 year day 300 (core/clock)', KWCAMPS.yearDay(0) === 259 && KWCAMPS.yearDay(41) === 300);

// ---- 6. people
const ppl = p => lay(Object.assign({}, base, { id: 'p', people: p }));
KWCAMPS.people('test-tune', a => a.n * 2);
const band = KCAMP.tentProgram({ culture: 'scyvoi', households: 5, sleeping: 1 });
const sizes = [ppl(40), ppl({ pop: 55 }), ppl({ provider: 'test-tune', n: 35 }), ppl({ census: { culture: band.culture, program: band.program } })].map(r => r.camp ? r.camp.people : r.error);
const bandPop = KCAMP.census({ id: 'p', world: KWCAMPS.seedOf(7, 'p'), culture: band.culture, program: band.program }).pop;
T.ok('people from a count, a census record, a provider and core/camp\'s census of a program (' + sizes.join(', ') + ')', J(sizes) === J([40, 55, 70, bandPop]) && bandPop > 10);
T.neg('an unknown provider is an error, not a camp', r => !!r.camp && r.camp.people === 70, ppl({ provider: 'no-such-tune', n: 35 }), ppl({ provider: 'test-tune', n: 35 }));
T.ok('the program follows the people: more people, more sleeping tents', lay(Object.assign({}, base, { id: 'q', people: 120 })).camp.records.length > lay(Object.assign({}, base, { id: 'q', people: 30 })).camp.records.length);

// ---- 7. works and marks
KWCAMPS.works('cairns', (W, C, X) => [0, 1].map(i => ({ id: C.id + ':cairn:' + i, key: 'cairn', kind: 'cairn', x: X.site.x + (i ? 1 : -1) * (C.R + 20), z: X.site.z, ry: 0, w: 2, d: 2, h: 1.5, pending: true })));
const wk = lay(Object.assign({}, base, { id: 'k', site: 's1', near: [500, 0], look: 3000,
  works: [{ rule: 'bed', kind: 'sluice', key: 'sluice', n: 4, look: 2500, w: 12, d: 32, h: 3 }, { rule: 'beside', of: 'sluice', kind: 'heap', key: 'tailings', n: 2, w: 9, d: 7, h: 1.6 }, { rule: 'cairns' }],
  marks: [{ as: 'goldRoom', role: 'supply', near: 'chief' }], program: { supply: 2 } })).camp;
const inBed = c => { const S = c.works.filter(w => w.kind === 'sluice'); return S.length >= 2 && S.every(w => wadi(w.x, w.z) > 0.5); };
const dry = JSON.parse(J(wk)); dry.works.filter(w => w.kind === 'sluice').forEach(w => { w.x -= 300; });
T.neg('the bed works stand in the wadi\'s bed (works 300 m off it are caught)', inBed, dry, wk);
T.ok('a beside rule and a registered works rule are laid (' + wk.works.map(w => w.kind).join(',') + ')', wk.works.filter(w => w.kind === 'heap').length === 2 && wk.works.filter(w => w.kind === 'cairn').length === 2);
const gold = c => { const G = c.records.filter(r => r.goldRoom), ch = c.records.find(r => r.role === 'chief'), sup = c.records.filter(r => r.role === 'supply');
  return G.length === 1 && G[0].role === 'supply' && sup.every(s => Math.hypot(s.x - ch.x, s.z - ch.z) >= Math.hypot(G[0].x - ch.x, G[0].z - ch.z)); };
const far = JSON.parse(J(wk)), sups = far.records.filter(r => r.role === 'supply'); sups.forEach(r => { r.goldRoom = false; });
const chiefR = far.records.find(r => r.role === 'chief');
sups.sort((a, b) => Math.hypot(b.x - chiefR.x, b.z - chiefR.z) - Math.hypot(a.x - chiefR.x, a.z - chiefR.z))[0].goldRoom = true;
T.neg('a mark falls on the supply tent nearest the chief\'s (the farther one marked is caught)', gold, far, wk);
T.done();
