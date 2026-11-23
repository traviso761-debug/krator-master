// node core/hamlet/test-hamlet-shumari-row.js: the Shumari plateau row and work-camp row passed by name
// (core/hamlet/shumari/25-hamlet-shumari.js, opt-in): all 10 foci, wayside cairn-shrine, lake jetty landing, pending boxes,
// and Free Giant + human work-camp mode. Every check is paired with a negative control (tools/ktest.js).
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

/* deterministic subset of kit boxes (as a page loading kits/shumari answers dims(k)); keys omitted fall back to row.pending */
const KIT_SAMPLE = {
  sm_sabil_shrine: { w: 9.2, d: 9.2, h: 11.4 },
  sm_sword_villa: { w: 18.4, d: 16.2, h: 10.8 },
  sm_hearth_house: { w: 12.0, d: 10.0, h: 7.4 },
  sm_herder_house: { w: 11.0, d: 9.0, h: 4.8 }
};
const dims = k => KIT_SAMPLE[k] || null;

// ---- 1. Loading the opt-in file mutates nothing on KHAMLET.CULTURES or KHAMLET.FOCI
const digest = () => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES), cultures: H.CULTURES });
const before = digest();
load('core/hamlet/shumari/25-hamlet-shumari.js');
T.ok('loading 25-hamlet-shumari.js registers no shared row or focus, leaving KHAMLET.CULTURES and KHAMLET.FOCI untouched',
  digest() === before && typeof H.shumariRow === 'function' && typeof H.shumariCampRow === 'function');
T.neg('mutation guard catches any stray culture registration on KHAMLET.CULTURES',
  d => d === before, JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES).concat(['shumari']), cultures: H.CULTURES }), digest());

// ---- 2. Base row parameters match settlements/shumar/BUILD-OUT.md section 4b
const R0 = H.shumariRow();
const rowShapeOk = r => r && r.kit === 'shumari' && r.household === 5.2 && r.workShare === 0.46 && r.slopeMax === 0.28 &&
  r.religious === 'sm_sabil_shrine' && r.civic === 'sm_sword_villa' && r.general === 'sm_bazaar_hall' &&
  r.food === 'sm_brewery_teahouse' && r.warehouse === 'sm_state_granary' &&
  r.services.religious === 2 && r.services.civic === 3 && r.services.general === 3 && r.services.food === 3 && r.services.warehouse === 3 &&
  r.houses.middlingShare === 0.42 && r.houses.head[0][0] === 'sm_captain_bayt' &&
  r.landing && r.landing.key === 'sm_lake_jetty' && r.landing.jobs === 3;
T.ok('shumariRow() carries exact BUILD-OUT.md section 4b parameters, services, houses and lake landing', rowShapeOk(R0));
T.neg('row parameter check catches wrong slopeMax or civic key', rowShapeOk, Object.assign({}, R0, { slopeMax: 0.22 }), R0);

// ---- 3. All 10 foci lay complete villages with their declared works and wayside cairn
const EXPECTED_FOCI = ['farming', 'orchard', 'ranch', 'lumber', 'quarry', 'clay', 'salt', 'fishing', 'mine', 'placer'];
T.ok('SHUMARI_FOCI lists all 10 plateau/canyon/lake foci in order, each with SHUMARI_FOCUS_INFO metadata',
  JSON.stringify(H.SHUMARI_FOCI) === JSON.stringify(EXPECTED_FOCI) &&
  EXPECTED_FOCI.every(f => H.SHUMARI_FOCUS_INFO[f] && Array.isArray(H.SHUMARI_FOCUS_INFO[f].keys) && H.SHUMARI_FOCUS_INFO[f].keys.length >= 2));

const spec = (focus, o) => Object.assign({
  id: 'sm-' + focus, world: 5173, culture: H.shumariRow(), focus,
  site: { x: 0, z: 0 }, link: { x: 420, z: 50 }, resource: { x: -50, z: 240 }, dims
}, o || {});
const worksOf = v => (v.records || []).filter(r => r.role === 'works').map(r => r.key);

const V = {};
H.SHUMARI_FOCI.forEach(f => { V[f] = H.village(spec(f)); });
const focusKeys = f => H.shumariRow().works[f].map(w => w.key);
const laysFocus = (v, f) => !!v && !v.error && v.records.length > 10 && focusKeys(f).every(k => worksOf(v).includes(k));
H.SHUMARI_FOCI.forEach(f => {
  T.ok('the ' + f + ' focus lays a Shumari village with all its works (' + focusKeys(f).join(', ') + ')',
    laysFocus(V[f], f), V[f].error || worksOf(V[f]).join(', '));
});

T.ok('census-discovered Shumari trade structures appear in their foci (spirits still, charcoal kiln, lake jetty, placer sluice)',
  [['orchard', 'sm_spirits_still'], ['lumber', 'sm_charcoal_kiln'], ['fishing', 'sm_lake_jetty'], ['placer', 'sm_placer_sluice'],
   ['clay', 'sm_kiln_yard'], ['clay', 'sm_lacquer_inlay_shop'], ['mine', 'sm_saltpeter_works']]
    .every(p => worksOf(V[p[0]]).includes(p[1])));

// ---- 4. Unknown focus refused; Shumari custom foci ('orchard', 'placer') accepted without mutating KHAMLET.FOCI
T.neg('an unknown focus is refused while row-defined orchard and placer foci succeed',
  f => { const v = H.village(spec(f)); return !v.error && v.records.length > 0; }, 'chinampa', 'orchard');

// ---- 5. Wayside cairn-shrine option: 1 per village by default, 0 focus jobs taken, omitted when shrine: false
const cairns = v => worksOf(v).filter(k => k === 'sm_wayside_cairn').length;
T.ok('every civilian Shumari village includes exactly one sm_wayside_cairn among its works',
  H.SHUMARI_FOCI.every(f => cairns(V[f]) === 1),
  H.SHUMARI_FOCI.map(f => f + ':' + cairns(V[f])).join(', '));
const V_NO_SHRINE = H.village(spec('orchard', { culture: H.shumariRow({ shrine: false }) }));
T.neg('wayside cairn check catches a village laid with shrine: false', v => cairns(v) === 1, V_NO_SHRINE, V.orchard);
T.ok('sm_wayside_cairn (share: 0) takes zero focus jobs and does not inflate village population',
  V.orchard.census.pop === V_NO_SHRINE.census.pop && V.orchard.census.workers === V_NO_SHRINE.census.workers,
  V.orchard.census.pop + ' vs ' + V_NO_SHRINE.census.pop);

// ---- 6. NE-Lakes fishing village (`Siru-Yamu`): lake jetty at spec.landing with a lane to the shore
const LD = { x: -190, z: 35, ux: -1, uz: 0 };
const VF = H.village(spec('fishing', { id: 'sm-siru-maru', landing: LD }));
const quay = (VF.records || []).find(r => r.role === 'landing');
const landingOk = v => {
  const q = (v.records || []).find(r => r.role === 'landing');
  return !v.error && worksOf(v).includes('sm_lake_jetty') && worksOf(v).includes('sm_butcher') &&
    !!q && q.key === 'sm_lake_jetty' && Math.hypot(q.x - LD.x, q.z - LD.z) < 25 &&
    v.landing && v.landing.quay === q.id && v.lanes.some(l => l.landing);
};
T.ok('a Siru-Yamu shore fishing village places sm_lake_jetty at spec.landing with a connecting lane',
  landingOk(VF), VF.error || JSON.stringify(VF.landing));
T.neg('landing check catches a village laid without spec.landing', landingOk, V.fishing, VF);

// ---- 7. Population cap (POP_MAX = 500) and custom popMax ceiling respected
const VBIG = H.village(spec('mine', { id: 'sm-big', popMax: 1200 }));
const VSMALL = H.village(spec('ranch', { id: 'sm-urudiru-ring', popMax: 160 }));
const inCap = v => !v.error && v.census.pop > 0 && v.census.pop <= H.POP_MAX && v.census.pop <= v.census.popMax;
T.ok('every village stays within POP_MAX (500) and respects a 160-person upland ranch ring ceiling',
  H.SHUMARI_FOCI.every(f => inCap(V[f])) && inCap(VBIG) && VBIG.census.popMax === 500 && inCap(VSMALL) && VSMALL.census.pop <= 160);
T.neg('cap check catches an over-cap census', inCap,
  Object.assign({}, VBIG, { census: Object.assign({}, VBIG.census, { pop: 505, popMax: 600 }) }), VBIG);

// ---- 8. Pending boxes cover every sm_* key across village and camp rows, and yield to kit dims when provided
const keysOf = row => {
  const s = new Set([row.religious, row.civic, row.general, row.food, row.warehouse, row.landing && row.landing.key]);
  ['poor', 'middling', 'head'].forEach(c => row.houses[c].forEach(h => s.add(h[0])));
  Object.keys(row.works).forEach(f => row.works[f].forEach(w => s.add(w.key)));
  s.delete(undefined);
  return [...s];
};
const pendingComplete = row => keysOf(row).every(k => row.pending[k] && row.pending[k].w > 0 && row.pending[k].d > 0 && row.pending[k].h > 0);
const ALL_ROWS = [H.shumariRow(), H.shumariRow({ shrine: false }), H.shumariRow({ camp: true }), H.shumariCampRow(), H.shumariCampRow({ shrine: false })];
T.ok('every sm_* key referenced in shumariRow and shumariCampRow has a positive pending footprint box',
  ALL_ROWS.every(pendingComplete),
  ALL_ROWS.map(r => keysOf(r).filter(k => !r.pending[k]).join(' ')).join(' | '));
T.neg('pending completeness check catches an unboxed sm_* key', pendingComplete,
  (() => { const r = H.shumariRow(); delete r.pending.sm_spirits_still; return r; })(), H.shumariRow());

const V_ALL_PENDING = H.village(spec('orchard', { dims: () => null }));
const recOf = (v, k) => (v.records || []).find(r => r.key === k);
T.ok('with dims: () => null every record uses row.pending cleanly; when dims answers a box, pending is cleared',
  !V_ALL_PENDING.error && recOf(V_ALL_PENDING, 'sm_sabil_shrine').pending === true &&
  !recOf(V.orchard, 'sm_sabil_shrine').pending && recOf(V.orchard, 'sm_spirits_still').pending === true);

// ---- 9. Work-camp mode (`shumariCampRow` & `shumariRow({camp: true})`): 0.88 workShare, 6.0 household, cadet + Giant cells
const CAMP_ROW = H.shumariCampRow();
const VCAMP = H.village(spec('mine', { id: 'sm-urudiru-lode', culture: CAMP_ROW, popMax: 400 }));
const VCAMP_OPT = H.village(spec('mine', { id: 'sm-urudiru-lode', culture: H.shumariRow({ camp: true }), popMax: 400 }));
const VMINE_VIL = H.village(spec('mine', { id: 'sm-urudiru-lode', popMax: 400 }));
const houseKeys = v => (v.records || []).filter(r => r.role === 'house' && !r.head).map(r => r.key);
const campOk = v => !v.error && v.census.workers / v.census.pop > 0.80 &&
  v.records.some(r => r.role === 'civic' && r.key === 'sm_regiment_barracks') &&
  v.records.some(r => r.role === 'religious' && r.key === 'sm_wayside_cairn') &&
  cairns(v) === 0 &&
  houseKeys(v).length > 0 &&
  houseKeys(v).every(k => k === 'sm_cadet_cell' || k === 'sm_giant_cadet_cell') &&
  houseKeys(v).includes('sm_cadet_cell') && houseKeys(v).includes('sm_giant_cadet_cell');
T.ok('shumariCampRow() lays a high-altitude lode camp (' + VCAMP.census.workers + '/' + VCAMP.census.pop +
  ' workers) with barracks, wayside cairn, and both human sm_cadet_cell and Free Giant sm_giant_cadet_cell bunks',
  campOk(VCAMP) && H.hashOf(VCAMP) === H.hashOf(VCAMP_OPT) && VMINE_VIL.census.workers / VMINE_VIL.census.pop < 0.55,
  VCAMP.error || houseKeys(VCAMP).join(', '));
T.neg('camp check rejects a civilian village with family cottages and low workShare', campOk, VMINE_VIL, VCAMP);
T.ok('every returned row carries its camp override block', ALL_ROWS.every(r => r.camp && r.camp.workShare === 0.88 && r.camp.household === 6.0));

// ---- 10. Determinism & row isolation
T.ok('identical specs produce identical hashes and records; mutating one shumariRow() call never affects another', (() => {
  const a = H.shumariRow(), b = H.shumariRow();
  a.works.orchard[0].jobs = 99;
  a.houses.poor[0][1] = 9;
  a.pending.sm_sabil_shrine.w = 99;
  return b.works.orchard[0].jobs === 12 && b.houses.poor[0][1] === 1 && b.pending.sm_sabil_shrine.w === 9 &&
    H.SHUMARI_FOCI.every(f => H.hashOf(H.village(spec(f))) === H.hashOf(V[f]));
})());
T.neg('determinism check distinguishes different world seeds',
  v => H.hashOf(v) === H.hashOf(V.placer), H.village(spec('placer', { world: 5174 })), H.village(spec('placer')));

T.done();
