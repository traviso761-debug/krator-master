// node core/hamlet/test-hamlet-camp.js: the work camp's census (core/hamlet/camp/26-hamlet-camp.js, opt-in; TODO.md "a work
// camp", settlements/xanadu/WORKS-PLAN.md W1): spec.camp takes the row's camp overrides, spec.share splits one tune record over
// several camps, and a spec with neither lays as before. Every negative is a fault and its fix (tools/ktest.js).
// test-hamlet.js runs this file as its last step.
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
load('core/hamlet/xanadu/23-hamlet-xanadu-row.js');
const H = KHAMLET;

/* the kit's boxes (every XA.def in kits/xanadu/src, as test-hamlet-xanadu-row.js reads them); a key it lacks takes the row's pending box */
const KIT = {};
for (const f of fs.readdirSync(path.join(ROOT, 'kits', 'xanadu', 'src')).filter(n => n.endsWith('.js'))) {
  const t = fs.readFileSync(path.join(ROOT, 'kits', 'xanadu', 'src', f), 'utf8'), re = /\bdef\(\{\s*key:\s*'(xa_\w+)'[^\n]*?\bw:\s*([\d.]+),\s*d:\s*([\d.]+),\s*h:\s*([\d.]+)/g;
  let m; while ((m = re.exec(t))) KIT[m[1]] = { w: +m[2], d: +m[3], h: +m[4] };
}
const dims = k => KIT[k] || null;
/* the villages a page lays without the camp file, to hold it to them once it is loaded */
const base = (focus, o) => Object.assign({ id: 'cp-' + focus, world: 5120, culture: H.xanaduRow(), focus, site: { x: 0, z: 0 },
  link: { x: 400, z: 60 }, resource: { x: -40, z: 260 }, dims }, o || {});
const before = ['farming', 'mine', 'ranch'].map(f => H.hashOf(H.village(base(f))));
const census0 = H.census(base('mine'), H.xanaduRow());
load('core/hamlet/camp/26-hamlet-camp.js');
load('core/hamlet/camp/26-hamlet-camp.js');   /* twice: it wraps once */

// ---- opt-in: a spec without camp or share lays as before, bit for bit
const after = ['farming', 'mine', 'ranch'].map(f => H.hashOf(H.village(base(f))));
T.ok('loading the camp file moves no village: farming, mine and ranch hash as before (' + after.join(', ') + ')',
  after.join() === before.join() && JSON.stringify(H.census(base('mine'), H.xanaduRow())) === JSON.stringify(census0) && !!H.census.base);
T.neg('a spec with camp: false lays the village a spec without it lays (and camp: true does not)',
  s => H.hashOf(H.village(s)) === before[1], base('mine', { camp: true }), base('mine', { camp: false }));

// ---- the camp census: nearly all at work, in households of four, no families' middling houses
const row = H.xanaduRow({ mineHead: true, shrine: true });   /* the row as a village takes it: no camp in it */
const campOf = C => C.workers / C.pop >= 0.88 && C.households === Math.ceil(C.pop / 4);
const famC = H.census(base('mine', { popMax: 300 }), row), campC = H.census(base('mine', { popMax: 300, camp: true }), row);
T.ok('a camp census: workers ' + campC.workers + ' of ' + campC.pop + ' people, ' + campC.households + ' households of 4 (the families\' row: ' +
  famC.workers + ' of ' + famC.pop + ', ' + famC.households + ')', campOf(campC) && campC.camp === true);
T.neg('the camp census is the camp\'s, not the families\' (a census without spec.camp is caught)', campOf, famC, campC);
const vCamp = H.village(base('mine', { camp: true, popMax: 300 }));
const housesOf = v => v.records.filter(r => r.role === 'house').map(r => r.key);
const bunk = v => !v.error && housesOf(v).every(k => ['xa_poor_b', 'xa_mid_c', 'xa_rich_a'].includes(k)) &&
  v.records.some(r => r.role === 'religious' && r.key === 'xa_wayside_shrine');
T.ok('a camp village lays bunkhouses only (xa_poor_b, xa_mid_c, the overseer\'s xa_rich_a) and the miners\' shrine as its religious building (' +
  vCamp.records.length + ' buildings)', bunk(vCamp));
T.neg('the row\'s camp overrides reach the layout (the families\' village is caught)', bunk, H.village(base('mine', { popMax: 300 })), vCamp);
const bare = Object.assign({}, H.CULTURES.xanadu);
const cBare = H.census(base('mine', { culture: bare, camp: true, popMax: 200 }), bare);
T.ok('a row with no camp overrides takes KHAMLET.CAMP (' + cBare.workers + ' of ' + cBare.pop + ', households of 4)', campOf(cBare));
const cObj = H.census(base('mine', { camp: { household: 5 }, popMax: 200 }), row);
T.ok('spec.camp as an object overrides the row\'s camp (households of 5: ' + cObj.households + ' for ' + cObj.pop + ')',
  cObj.households === Math.ceil(cObj.pop / 5) && cObj.workers / cObj.pop >= 0.88);

// ---- one record, two camps: the parts add up to the record's people
const sum = a => a.reduce((s, n) => s + n, 0);
T.ok('the largest remainder: 950 over [500, 450] is 500 and 450; 951 over [1, 1] is 476 and 475; 7 over [1, 1, 1] is 3, 2, 2',
  H.shareParts({ pop: 950, parts: [500, 450] }).join() === '500,450' && H.shareParts({ pop: 951, parts: [1, 1] }).join() === '476,475' &&
  H.shareParts({ pop: 7, parts: [1, 1, 1] }).join() === '3,2,2' && H.shareParts({ pop: 5, parts: [] }) === null && H.shareParts({ pop: 5, parts: [1, -1] }) === null);
const camps = (pop, parts, focus) => parts.map((w, i) => H.census(base(focus[i], { camp: true, share: { pop, parts, i } }), row));
const adds = (pop, Cs) => sum(Cs.map(C => C.pop)) === pop && Cs.every(C => campOf(C) && !C.capped);
const gold = camps(950, [500, 450], ['mine', 'mill']), opal = camps(850, [500, 350], ['diggings', 'landing']);
T.ok('Kōlḍ-Lōḍ\'s 950 as the adit camp and the mill camp (' + gold.map(C => C.pop).join(' + ') + '), Opal Valley\'s 850 as the diggings and the landing (' +
  opal.map(C => C.pop).join(' + ') + ')', adds(950, gold) && adds(850, opal));
T.neg('the parts add up to the record (a camp laid twice as part 0 is caught)', Cs => adds(950, Cs),
  [0, 0].map(i => H.census(base('mine', { camp: true, share: { pop: 950, parts: [500, 450], i } }), row)), gold);
T.neg('a share over the hamlet ceiling is capped and says so (a part of 600 caught; 500 passes)',
  C => !C.capped && C.pop === C.share.part,
  H.census(base('mine', { camp: true, share: { pop: 1100, parts: [600, 500], i: 0 } }), row),
  H.census(base('mine', { camp: true, share: { pop: 1100, parts: [600, 500], i: 1 } }), row));
const works = (C, keys) => keys.every(k => C.works.some(w => w.key === k && w.n > 0));
T.ok('the shared camps staff their works: the adit camp\'s adits and mine heads, the mill camp\'s stamp mills and corrals, the diggings\' sorting sheds, the landing\'s warehouses',
  works(gold[0], ['xa_adit', 'xa_mine_head']) && works(gold[1], ['xa_stamp_mill', 'xa_corral', 'xa_fort_post']) &&
  works(opal[0], ['xa_sorting_shed', 'xa_mine_head']) && works(opal[1], ['xa_warehouse', 'xa_watch']));
/* laid whole: the 500 of the adit camp on open ground (the row's pending boxes stand in for the keys a page's kit lacks) */
const vg = H.village(base('mine', { id: 'kold-lod.adit', camp: true, share: { pop: 950, parts: [500, 450], i: 0 }, siteReach: 800 }));
const roof = v => v.records.filter(r => r.role === 'house').reduce((s, r) => s + (r.head ? 1 : ({ xa_poor_b: 3, xa_mid_c: 4, xa_rich_a: 1 }[r.key] || 0)), 0);
T.ok('the adit camp lays whole: ' + vg.records.length + ' buildings, every household under a roof (' + roof(vg) + ' of ' + vg.census.households + ')',
  !vg.error && vg.census.pop === 500 && roof(vg) >= vg.census.households, vg.error);
T.ok('the camp lays the same twice (no draw from order)', H.hashOf(vg) === H.hashOf(H.village(base('mine', { id: 'kold-lod.adit', camp: true, share: { pop: 950, parts: [500, 450], i: 0 }, siteReach: 800 }))));
T.done();
