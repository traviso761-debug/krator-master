// node openworld/xanadu-oidong-highrift/tests/test-world-camps.js: the pitched camps' planner (core/world/48w-world-camps.js, KWCAMPS,
// with this region's src/48c-camps-xanadu.js;
// settlements/xanadu/WORKS-PLAN.md W2) on a synthetic world: the Golden Tears' fortified ring as the region's WORLD_CAMPS
// spec has it, and the Great Caravan's halt as openworld/xanadu-lake-shore's has it, each with its negatives (tools/ktest.js:
// a fault and its fix). The Tears' camp's point is outside the region's cut until its next recut (48-world-site.js), so its
// ring is proven here. Read in place: core/rand, core/space, core/camp (10, 20, 30, 50-camp-tents), kits/tents/src/33-tn-table.js
// (the tents' boxes), core/region/data/xan-tune.js, core/world/48s-world-sites.js (KSITES: the ground rule), both specs.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const load = f => vm.runInThisContext(rd(f), { filename: f });
global.window = global;
['core/rand/08-core-rand.js', 'core/space/20-core-space.js', 'core/camp/10-camp-cultures.js', 'core/camp/20-camp-census.js',
 'core/camp/30-camp-pitch.js', 'core/camp/50-camp-tents.js', 'core/region/data/xan-tune.js'].forEach(load);
const TN = vm.runInThisContext(rd('kits/tents/src/33-tn-table.js') + '\n;({tnDims})', { filename: '33-tn-table.js' });
/* the synthetic world: a floor falling gently east, a wadi running down it north-south at x = 600 (its bed 4 m down, the flow
   strongest in it), a wet hollow (water) at (-900, 0), a steep bank west of x = -1400, the cut a 6 km square */
const wadi = (x, z) => Math.exp(-Math.pow((x - 600 - 30 * Math.sin(z / 400)) / 40, 2));
global.WORLD = {
  inside: (x, z) => Math.abs(x) < 3000 && Math.abs(z) < 3000,
  Hland: (x, z) => -1200 - x * 0.02 - 4 * wadi(x, z) + (x < -1400 ? (-1400 - x) * 0.6 : 0),
  H: (x, z) => WORLD.Hland(x, z),
  water: (x, z) => Math.hypot(x + 900, z) < 120 ? WORLD.Hland(x, z) + 1 : -1e9,
  townW: () => 0,
  at: (x, z) => ({ flow: wadi(x, z) })
};
global.WORLD_DATA = { meta: { sites: [] } };
load('core/world/48s-world-sites.js');
load('core/world/48w-world-camps.js');   /* KWCAMPS: core/world's since Stage 8 T26 (this region's 48t until 2026-11-24) */
load('openworld/xanadu-oidong-highrift/src/48c-camps-xanadu.js');   /* the Sultanate's people and windows, registered on it */
/* the spec as the region's file writes it: its `var WORLD_CAMPS=...` to the end of the file, run alone (the rest of the file needs core/hamlet) */
const spec = f => { const t = rd(f), i = t.indexOf('var WORLD_CAMPS='); if (i < 0) throw new Error(f + ': no WORLD_CAMPS'); const s = {}; vm.runInNewContext(t.slice(i) + '\n;this.WC = WORLD_CAMPS;', s); return s.WC; };
const TEARS = spec('openworld/xanadu-oidong-highrift/src/48-world-site.js'), HALT = spec('openworld/xanadu-lake-shore/src/48-world-site.js');
const dims = KCAMP.tentDims(k => TN.tnDims(k)), ground = { ok: KSITES.groundOk };
const sites = [{ id: 'stearscamp01', x: 0, z: 0 }, { id: 's57bkv9741', x: 0, z: -2200 }];
const plan = (S, o) => KWCAMPS.plan(S, Object.assign({ dims, ground, sites, inside: WORLD.inside }, o || {}));

// ---- the Tears' ring
const P = plan(TEARS), C = P.camps[0];
T.ok('the Tears\' camp is planned from the region\'s own spec with no error (' + (C ? C.records.length + ' tents, ' + C.works.length + ' works' : P.errors.join('; ')) + ')',
  !P.errors.length && !!C && C.kind === 'ring' && C.id === 'stearscamp01/camp/tears');
const whole = c => { const R = c.records; let ov = 0, off = 0;
  for (let i = 0; i < R.length; i++) { for (let j = i + 1; j < R.length; j++) if (KCAMP.overlaps(R[i], R[j], .5)) ov++;
    if (!KCAMP.box(R[i], 0).every(q => KSITES.groundOk(q[0], q[1]))) off++; }
  return !ov && !off && !c.short.length && R.length >= 8; };
const moved = c => { const q = JSON.parse(JSON.stringify(c)); q.records[0].x = q.records[1].x; q.records[0].z = q.records[1].z; return q; };
T.neg('the ring pitched whole on good ground, no two tents within half a metre (a tent laid on another is caught)', whole, moved(C), C);
const fort = c => !!c.hedge && c.hedge.gates.length === 1 && c.records.filter(r => r.goldRoom).length === 1 && c.records.some(r => r.role === 'chief');
T.ok('a fortified ring: the zariba with one gate, the captain\'s pavilion, one gold room (the supply tent nearest it)', fort(C),
  'gates ' + (C.hedge ? C.hedge.gates.length : 0));
const noGate = JSON.parse(JSON.stringify(C)); noGate.hedge.gates.push(0);
T.neg('one gate only (a second gate is caught)', fort, noGate, C);
const people = c => Math.abs(c.census.pop - c.people) <= c.people * .25 && c.people === XAN_TUNE.tears.camp.people;
T.ok('its people: the census of its tents about the tune\'s ' + XAN_TUNE.tears.camp.people + ' (' + C.census.pop + ')', people(C));
const inBed = c => { const S = c.works.filter(w => w.kind === 'sluice'); return S.length >= 2 && S.every(w => wadi(w.x, w.z) > .5); };
const dry = JSON.parse(JSON.stringify(C)); dry.works.filter(w => w.kind === 'sluice').forEach(w => { w.x -= 300; });
T.neg('the placer sluices stand in the wadi\'s bed (the strongest flow; sluices 300 m off it are caught)', inBed, dry, C);
const season = c => KWCAMPS.inSeason(c, 320) && KWCAMPS.inSeason(c, 30) && !KWCAMPS.inSeason(c, 200) && !KWCAMPS.inSeason(c, 61);
const backwards = Object.assign({}, C, { season: { days: [[60, 300]] } });
T.neg('pitched in the rift season (year days 300-60, XAN_TUNE.calendar), struck otherwise (the window read backwards is caught)', season, backwards, C);
T.ok('the clock\'s day 0 is year day 259, its day 41 year day 300 (core/clock, XAN_TUNE.yearDay0)', KWCAMPS.yearDay(0) === 259 && KWCAMPS.yearDay(41) === 300 && XAN_TUNE.yearDay0 === 259);
T.ok('struck, the zariba\'s ring and the pits stay', C.struck.hedge && C.struck.works.join() === 'pit');
T.ok('the same camp from the same spec and world', JSON.stringify(plan(TEARS).camps[0]) === JSON.stringify(C));
const U = plan(TEARS, { sites: [] }), U2 = plan(TEARS, { inside: () => false });
T.ok('a site the cut does not hold yet is awaiting the recut, not an error', U.uncut.length === 1 && !U.errors.length && !U.camps.length && U2.uncut.length === 1);

// ---- the Great Caravan's halt at Erehwon
const Q = plan(HALT), H = Q.camps[0];
T.ok('the halt is planned with no error (' + (H ? H.records.length + ' pieces, the escort ' + (H.escort ? H.escort.records.length : 0) : Q.errors.join('; ')) + ')', !Q.errors.length && !!H && H.kind === 'halt');
const laager = h => h.formation === 'laager' && h.records.filter(r => /wagon/.test(r.def || r.key)).length === h.wagons && h.records.some(r => r.role === 'chief') && !!(h.escort && h.escort.records.length >= 4);
const lost = JSON.parse(JSON.stringify(H)); lost.records = lost.records.filter((r, i) => !/wagon/.test(r.def || r.key) || i % 2);
T.neg('a laager of its wagons round the caravan master\'s pavilion, the Tears\' escort\'s ring beside it (wagons lost are caught)', laager, lost, H);
T.ok('the caravan\'s tents in the Dalab dress fall back to the generic canvas, and the record says so', H.records.every(r => r.dress === 'generic' && r.fallback === 'dalab'));
T.ok('the halt stands in its windows of the round (from 311 and from 107) and is struck between',
  KWCAMPS.inSeason(H, 311) && KWCAMPS.inSeason(H, 110) && !KWCAMPS.inSeason(H, 200) && !KWCAMPS.inSeason(H, 330));
T.done();
