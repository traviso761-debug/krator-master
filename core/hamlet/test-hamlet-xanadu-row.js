// node core/hamlet/test-hamlet-xanadu-row.js: the Xanadu row passed by name (core/hamlet/xanadu/23-hamlet-xanadu-row.js,
// opt-in): fishing and the new foci, the wayside shrine, the camp option. Every negative is a fault and its fix (tools/ktest.js).
// The boxes are the Xanadu kit's own, read from kits/xanadu/src (XA.def), so a key the kit lacks takes the row's pending box.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;
load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
fs.readdirSync(__dirname).filter(f => /^\d\d-hamlet-.*\.js$/.test(f)).sort().forEach(f => load('core/hamlet/' + f));
const H = KHAMLET;

/* the kit's boxes: every XA.def in kits/xanadu/src (the pieces a page that loads the kit's src answers dims for) */
const KIT = {};
const srcDir = path.join(ROOT, 'kits', 'xanadu', 'src');
for (const f of fs.readdirSync(srcDir).filter(n => n.endsWith('.js'))) {
  const t = fs.readFileSync(path.join(srcDir, f), 'utf8'), re = /\bdef\(\{\s*key:\s*'(xa_\w+)'[^\n]*?\bw:\s*([\d.]+),\s*d:\s*([\d.]+),\s*h:\s*([\d.]+)/g;
  let m; while ((m = re.exec(t))) KIT[m[1]] = { w: +m[2], d: +m[3], h: +m[4] };
}
const dims = k => KIT[k] || null;

// ---- loading the file moves nothing: it registers no row and no focus
const digest = () => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES), x: H.CULTURES.xanadu });
const before = digest();
load('core/hamlet/xanadu/23-hamlet-xanadu-row.js');
T.ok('loading the row registers no row and no focus, and leaves the shared xanadu row as it was', digest() === before && typeof H.xanaduRow === 'function');

const spec = (focus, o) => Object.assign({ id: 'xr-' + focus, world: 4021, culture: H.xanaduRow(), focus, site: { x: 0, z: 0 }, link: { x: 400, z: 60 },
  resource: { x: -40, z: 260 }, dims }, o || {});
const worksOf = v => (v.records || []).filter(r => r.role === 'works').map(r => r.key);

// ---- each focus lays a village with its focus's works and a wayside shrine
const NEW = ['fishing', 'orchard', 'tea', 'saffron', 'estate', 'placer', 'pottery', 'quarry'];
const V = {};
H.XANADU_FOCI.forEach(f => { V[f] = H.village(spec(f)); });
const focusKeys = f => H.xanaduRow().works[f].map(w => w.key);
const laysFocus = (v, f) => !!v && !v.error && v.records.length > 10 && focusKeys(f).every(k => worksOf(v).includes(k));
H.XANADU_FOCI.forEach(f => {
  T.ok('the ' + f + ' focus lays a village with every works it draws ('+ focusKeys(f).join(', ') + ')', laysFocus(V[f], f),
    V[f].error || worksOf(V[f]).join(', '));
});
T.ok('the eight new foci are all in the row, and each has its info for a host',
  NEW.every(f => H.XANADU_FOCI.includes(f) && H.XANADU_FOCUS_INFO[f] && H.XANADU_FOCUS_INFO[f].keys.every(k => focusKeys(f).includes(k))));
T.ok('the focus keys asked for: kiln yard (pottery), saffron house, sluice (placer), mine head (mine), quarry yard, tea factory, reeling house (silk)',
  [['pottery', 'xa_kiln_yard'], ['saffron', 'xa_saffron_house'], ['placer', 'xa_placer_sluice'], ['mine', 'xa_mine_head'], ['quarry', 'xa_quarry_yard'],
   ['tea', 'xa_tea_factory'], ['silk', 'xa_reeling_house'], ['silk', 'xa_loom_house'], ['silk', 'xa_dye_works'], ['orchard', 'xa_apiary'], ['estate', 'xa_apiary']]
    .every(p => worksOf(V[p[0]]).includes(p[1])));
const shrines = v => worksOf(v).filter(k => k === 'xa_wayside_shrine').length;
T.ok('every village has one wayside shrine', H.XANADU_FOCI.every(f => shrines(V[f]) === 1),
  H.XANADU_FOCI.map(f => f + ' ' + shrines(V[f])).join(', '));
T.neg('a village laid with shrine off has none (the check catches a shrine-less village)', v => shrines(v) === 1,
  H.village(spec('tea', { culture: H.xanaduRow({ shrine: false }) })), V.tea);
const C0 = H.village(spec('tea', { culture: H.xanaduRow({ shrine: false }) })).census;
T.ok('the shrine takes no focus jobs: the people are those of the village without it', V.tea.census.pop === C0.pop && V.tea.census.workers === C0.workers,
  V.tea.census.pop + ' vs ' + C0.pop);

// ---- an unknown focus is refused, a new one is not (a row's own focus needs no FOCI entry)
T.neg('a focus the row does not have is refused; the row\'s own focus is laid', f => { const v = H.village(spec(f)); return !v.error && v.records.length > 0; }, 'weaving', 'saffron');

// ---- fishing: the shore works and the quay at the landing; the shallows add the ponds and the mat shed
const LD = { x: -180, z: 30, ux: -1, uz: 0 };
const F = H.village(spec('fishing', { id: 'xr-jal', landing: LD })), q = F.records.find(r => r.role === 'landing');
T.ok('a fishing village on the shore works the boat shed and the fish racks, and its quay stands at the landing with a lane to it',
  !F.error && worksOf(F).includes('xa_boatshed') && worksOf(F).includes('xa_fish_racks') && !!q && q.key === 'xa_quay' && Math.hypot(q.x - LD.x, q.z - LD.z) < 25 &&
    F.landing && F.landing.quay === q.id && F.lanes.some(l => l.landing), F.error || JSON.stringify(F.landing));
T.neg('a fishing village is caught without its shore works (the shared row has no fishing works)', v => !v.error && worksOf(v).includes('xa_boatshed') && worksOf(v).includes('xa_fish_racks'),
  H.village(spec('fishing', { culture: 'xanadu' })), F);
const FS = H.village(spec('fishing', { id: 'xr-ponds', culture: H.xanaduRow({ shallows: true }), landing: LD }));
T.ok('a fishing village in the shallows adds the fishponds and the mat shed', !FS.error && ['xa_boatshed', 'xa_fish_racks', 'xa_fishponds', 'xa_mat_shed'].every(k => worksOf(FS).includes(k)),
  FS.error || worksOf(FS).join(', '));
T.ok('the default fishing village has no fishponds or mat shed', !worksOf(F).includes('xa_fishponds') && !worksOf(F).includes('xa_mat_shed'));

// ---- the people stay within the cap (POP_MAX 500), and a smaller popMax is kept
const BIG = H.village(spec('fishing', { id: 'xr-big', popMax: 1400 })), SMALL = H.village(spec('orchard', { id: 'xr-small', popMax: 120 }));
const inCap = v => !v.error && v.census.pop <= H.POP_MAX && v.census.pop <= v.census.popMax && v.census.pop > 0;
T.ok('every village within the cap of ' + H.POP_MAX + ' people, a 1,400-person ask laid as its first 500, a 120 ceiling kept',
  H.XANADU_FOCI.every(f => inCap(V[f])) && inCap(BIG) && BIG.census.popMax === 500 && inCap(SMALL) && SMALL.census.pop <= 120,
  H.XANADU_FOCI.map(f => f + ' ' + V[f].census.pop).join(', ') + '; big ' + BIG.census.pop + ', small ' + SMALL.census.pop);
T.neg('the cap check catches a census over POP_MAX', v => inCap(v), Object.assign({}, BIG, { census: Object.assign({}, BIG.census, { pop: 501, popMax: 600 }) }), BIG);

// ---- determinism: the same seed lays the same village; another world another
T.ok('the same spec lays the same village, building for building', NEW.every(f => H.hashOf(H.village(spec(f))) === H.hashOf(V[f]) &&
  JSON.stringify(H.village(spec(f)).records) === JSON.stringify(V[f].records)));
T.neg('the determinism check tells two worlds apart', v => H.hashOf(v) === H.hashOf(V.saffron), H.village(spec('saffron', { world: 4022 })), H.village(spec('saffron')));
T.ok('two calls give separate rows: changing one moves no other', (() => { const a = H.xanaduRow(), b = H.xanaduRow(); a.works.tea[0].jobs = 99; a.houses.poor[0][1] = 9;
  return b.works.tea[0].jobs === 10 && b.houses.poor[0][1] === H.CULTURES.xanadu.houses.poor[0][1] && H.CULTURES.xanadu.houses.poor[0][1] !== 9; })());

// ---- no village depends on a key a page lacks: every key is the kit's (src) or pending with a box
const keysOf = row => { const s = new Set([row.religious, row.civic, row.general, row.food, row.warehouse, row.landing && row.landing.key]);
  ['poor', 'middling', 'head'].forEach(c => row.houses[c].forEach(h => s.add(h[0])));
  Object.keys(row.works).forEach(f => row.works[f].forEach(w => s.add(w.key))); s.delete(undefined); return [...s]; };
const covered = row => keysOf(row).every(k => KIT[k] || (row.pending[k] && row.pending[k].w > 0 && row.pending[k].d > 0));
const allRows = [H.xanaduRow(), H.xanaduRow({ shallows: true }), H.xanaduRow({ camp: true }), H.xanaduRow({ shrine: false, mineHead: false })];
T.ok('every key each row names is a kit def in kits/xanadu/src or pending with a box', allRows.every(covered),
  allRows.map(r => keysOf(r).filter(k => !KIT[k] && !r.pending[k]).join(' ')).join(' | '));
T.neg('a key with neither a kit box nor a pending box is caught', covered,
  (() => { const r = H.xanaduRow(); r.works.tea.push({ key: 'xa_tea_garden', jobs: 4, share: 0.1 }); return r; })(), H.xanaduRow());
const recOf = (v, k) => v.records.find(r => r.key === k);
T.ok('a new works piece is pending on a page without it, and drawn on one whose kit answers its box (88g loaded)',
  recOf(V.pottery, 'xa_kiln_yard').pending && !recOf(H.village(spec('pottery', { dims: k => KIT[k] || (k === 'xa_kiln_yard' ? { w: 22, d: 18, h: 6 } : null) })), 'xa_kiln_yard').pending &&
    !recOf(V.tea, 'xa_tea_factory').pending);

// ---- the switch: with the shrine and the mine head off, the row lays the villages the shared row lays (farming, ranch,
// mine), the ones Kirstabal's fishingRow lays (its fishing, and its Landing's farming), and the Vein Camp's
const same = (a, b) => !a.error && !b.error && H.hashOf(a) === H.hashOf(b) && a.records.length === b.records.length && a.census.pop === b.census.pop;
const plain = H.xanaduRow({ shrine: false, mineHead: false });
T.ok('farming, ranch and mine on the plain row are the shared row\'s villages', ['farming', 'ranch', 'mine'].every(f => same(H.village(spec(f, { culture: plain })), H.village(spec(f, { culture: 'xanadu' })))));
/* Kirstabal's fishingRow as settlements/kirstabal/src/42-ks-ring.js has it (2026-11-17), the fixture */
const X = H.CULTURES.xanadu;
const KS = Object.assign({}, X, { works: Object.assign({}, X.works, { fishing: [{ key: 'xa_boatshed', jobs: 8, share: .55 }, { key: 'xa_fish_racks', jobs: 4, share: .45 }] }),
  focusJobs: Object.assign({}, X.focusJobs, { fishing: 90 }), reach: Object.assign({}, X.reach, { fishing: 260 }), landing: { key: 'xa_quay', jobs: 3 },
  pending: Object.assign({}, X.pending, { xa_fish_racks: { w: 16, d: 11, h: 3.6, what: 'fish racks and a smokehouse' } }) });
const ksSpec = (focus, culture, o) => spec(focus, Object.assign({ id: 'll.timbar', world: 41617, culture, landing: LD, popMax: 500 }, o || {}));
T.ok('Kirstabal can switch: its fishing and farming villages are the same on the plain row as on its fishingRow',
  same(H.village(ksSpec('fishing', plain)), H.village(ksSpec('fishing', KS))) && same(H.village(ksSpec('farming', plain, { id: 'll.landing' })), H.village(ksSpec('farming', KS, { id: 'll.landing' }))));
T.neg('the switch check catches a moved village (the default row\'s shrine moves the houses)', r => same(H.village(ksSpec('fishing', r)), H.village(ksSpec('fishing', KS))), H.xanaduRow(), plain);
/* the Vein Camp's row as openworld/oidong-highrift/src/48-world-site.js has it (2026-11-17), the fixture */
const VEIN = Object.assign({}, X, { workShare: 0.9, household: 4, services: { religious: 0, civic: 1, general: 1, food: 2, warehouse: 1 },
  houses: { poor: [['xa_poor_b', 3, 2], ['xa_mid_c', 4, 1]], middling: [['xa_mid_c', 4, 1]], head: [['xa_rich_a', 1, 1]], middlingShare: 0 } });
const camp0 = H.xanaduRow({ camp: true, shrine: false, mineHead: false });
T.ok('the camp option with the shrine and mine head off is the Vein Camp\'s row: the same camp', same(H.village(spec('mine', { id: 'vein-camp', culture: camp0, popMax: 50 })),
  H.village(spec('mine', { id: 'vein-camp', culture: VEIN, popMax: 50 }))));

// ---- the camp: nearly all at work, the miners' shrine its religious building, no second shrine
const CP = H.village(spec('mine', { id: 'xr-camp', culture: H.xanaduRow({ camp: true }), popMax: 120 })), VL = H.village(spec('mine', { id: 'xr-camp', popMax: 120 }));
const campLike = v => !v.error && v.census.workers / v.census.pop > 0.8 && v.records.some(r => r.role === 'religious' && r.key === 'xa_wayside_shrine') && shrines(v) === 0;
T.ok('a work camp: ' + CP.census.workers + ' of ' + CP.census.pop + ' at work (a village: ' + VL.census.workers + ' of ' + VL.census.pop + '), the shrine its religious building',
  campLike(CP) && VL.census.workers / VL.census.pop < 0.5, CP.error || '');
T.neg('the camp check catches a village (a temple, a shrine among the works, families)', campLike, VL, CP);
T.ok('every row carries its camp overrides for a later census option', allRows.every(r => r.camp && r.camp.workShare === 0.9 && r.camp.household === 4));

T.done();
