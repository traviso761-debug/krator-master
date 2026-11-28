// node core/hamlet/test-hamlet-shorekin-row.js: the Shore-kin Arch hinterland & harbour-crew row passed by name
// (core/hamlet/shorekin/26-hamlet-shorekin.js, opt-in): all 8 Shore-kin foci + standard KHAMLET.FOCI aliases, exact 16 sk_*
// footprint boxes verified against kits/shore-kin/src, client-tithe metadata, landing shed, determinism, and negative guards.
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

/* Parse exact declared {w, d, h} from kits/shore-kin/src/50-sk-houses.js & 58-sk-works.js */
const SK_KIT_DIMS = {};
for (const f of ['50-sk-houses.js', '58-sk-works.js']) {
  const src = fs.readFileSync(path.join(ROOT, 'kits/shore-kin/src', f), 'utf8');
  for (const m of src.matchAll(/defBuilding\(\{\s*key:'(sk_[a-z_]+)'[\s\S]{0,260}?\bw:([\d.]+),d:([\d.]+),h:([\d.]+)/g)) {
    SK_KIT_DIMS[m[1]] = { w: +m[2], d: +m[3], h: +m[4] };
  }
}

/* Subset dims callback so we verify both kit dims override and row.pending fallback */
const KIT_SAMPLE = {
  sk_tide_shrine: SK_KIT_DIMS.sk_tide_shrine,
  sk_compound_house: SK_KIT_DIMS.sk_compound_house,
  sk_stilt_cot: SK_KIT_DIMS.sk_stilt_cot
};
const dims = k => KIT_SAMPLE[k] || null;

// ---- 1. Opt-in isolation: zero mutation on KHAMLET.CULTURES or KHAMLET.FOCI
const digest = () => JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES), cultures: H.CULTURES });
const before = digest();
load('core/hamlet/shorekin/26-hamlet-shorekin.js');
T.ok('loading 26-hamlet-shorekin.js mutates nothing on KHAMLET.CULTURES or KHAMLET.FOCI',
  digest() === before && typeof H.shorekinRow === 'function' && Array.isArray(H.SHOREKIN_FOCI));
T.neg('mutation guard catches stray culture registration on KHAMLET.CULTURES',
  d => d === before, JSON.stringify({ foci: H.FOCI, rows: Object.keys(H.CULTURES).concat(['shore-kin']), cultures: H.CULTURES }), digest());

// ---- 2. Base row parameters, clientHall / pop >= 180 promotion, and shrine toggle
const R0 = H.shorekinRow();
const R_HALL = H.shorekinRow({ clientHall: true });
const R_POP180 = H.shorekinRow({ pop: 185 });
const R_POP150 = H.shorekinRow({ pop: 150 });
const rowShapeOk = r => r && r.kit === 'shore-kin' && r.household === 5.0 && r.workShare === 0.48 && r.slopeMax === 0.30 &&
  r.religious === 'sk_tide_shrine' && r.civic === 'sk_compound_house' && r.general === 'sk_byssus_court' &&
  r.food === 'sk_serpentine_lodge' && r.warehouse === 'sk_compound_house' &&
  r.landing && r.landing.key === 'sk_boat_grid_shed' && r.landing.jobs > 0;
T.ok('shorekinRow() defaults match contract and promote civic to sk_client_hall when clientHall: true or pop >= 180',
  rowShapeOk(R0) && R_HALL.civic === 'sk_client_hall' && R_POP180.civic === 'sk_client_hall' && R_POP150.civic === 'sk_compound_house');
T.neg('row parameter check catches wrong workShare or civic key',
  rowShapeOk, Object.assign({}, R0, { workShare: 0.35 }), R0);

// ---- 3. Exact 16 sk_* keys & footprint dimensions match kits/shore-kin/src, with zero Crookshore keys
const allSkKeys = Object.keys(SK_KIT_DIMS).sort();
const rowReferencedKeys = () => {
  const s = new Set();
  for (const r of [R0, R_HALL]) {
    [r.religious, r.civic, r.general, r.food, r.warehouse, r.landing && r.landing.key].forEach(k => k && s.add(k));
    ['poor', 'middling', 'head'].forEach(c => r.houses[c].forEach(h => s.add(h[0])));
    Object.keys(r.works).forEach(f => r.works[f].forEach(w => s.add(w.key)));
  }
  return [...s].sort();
};
const refKeys = rowReferencedKeys();
const zeroCrookshore = keys => keys.every(k => /^sk_/.test(k) && !/^(hk|et|ra)_/.test(k) && !/nephrite|cypress/i.test(k));
const exactPendingMatch = pending => allSkKeys.length === 16 && allSkKeys.every(k => {
  const p = pending[k], q = SK_KIT_DIMS[k];
  return p && Math.abs(p.w - q.w) < 1e-6 && Math.abs(p.d - q.d) < 1e-6 && Math.abs(p.h - q.h) < 1e-6;
});
T.ok('all 16 real sk_* keys from kits/shore-kin are used across shorekinRow with exact {w, d, h} boxes and zero Crookshore keys',
  allSkKeys.length === 16 && JSON.stringify(refKeys) === JSON.stringify(allSkKeys) &&
  zeroCrookshore(refKeys) && exactPendingMatch(R0.pending),
  'kit=' + allSkKeys.length + ' ref=' + refKeys.length);
T.neg('Crookshore key guard rejects any hk_*, et_* or ra_* key',
  zeroCrookshore, refKeys.concat(['hk_chise_lodge']), refKeys);
T.neg('footprint box guard catches drifted pending dimension',
  exactPendingMatch, Object.assign({}, R0.pending, { sk_client_hall: { w: 19, d: 19, h: 12 } }), R0.pending);

// ---- 4. SHOREKIN_FOCI, aliases, and SHOREKIN_FOCUS_INFO client-tithe metadata
const EXPECTED_FOCI = ['ash', 'spars', 'cordage', 'smelt', 'saltery', 'lime', 'fishing', 'farming'];
const titheOk = inf => inf && typeof inf.what === 'string' && typeof inf.feeds === 'string' &&
  Array.isArray(inf.worksKeys) && inf.worksKeys.length >= 1 &&
  Array.isArray(inf.outputs) && inf.outputs.length >= 1 &&
  inf.clientTithe && inf.clientTithe.status === 'client' &&
  inf.clientTithe.patron === 'arcoforte_caretaker_house' &&
  Array.isArray(inf.clientTithe.owes) && inf.clientTithe.owes.length >= 1 &&
  inf.clientTithe.receives.includes('paktong_tools') &&
  inf.clientTithe.receives.includes('paktong_ingots') &&
  inf.clientTithe.receives.includes('cradle_shallow_berths');
T.ok('SHOREKIN_FOCI and SHOREKIN_FOCUS_INFO record all 8 foci + aliases and caretaker client-tithe terms',
  JSON.stringify(H.SHOREKIN_FOCI) === JSON.stringify(EXPECTED_FOCI) &&
  EXPECTED_FOCI.concat(['lumber', 'mine', 'salt', 'quarry']).every(f => titheOk(H.SHOREKIN_FOCUS_INFO[f])));
T.neg('client-tithe check rejects partner status or missing cradle_shallow_berths',
  titheOk,
  Object.assign({}, H.SHOREKIN_FOCUS_INFO.ash, {
    clientTithe: { status: 'partner', patron: 'arcoforte_caretaker_house', owes: ['ash'], receives: ['paktong_ingots'] }
  }),
  H.SHOREKIN_FOCUS_INFO.ash);

// ---- 5. KHAMLET.village across all 5 Arcoforte hinterland foci + remaining foci + standard KHAMLET.FOCI aliases
const spec = (focus, o) => Object.assign({
  id: 'sk-' + focus, world: 8601, culture: H.shorekinRow(), focus,
  site: { x: 0, z: 0 }, link: { x: 420, z: 40 }, resource: { x: -40, z: 220 }, dims
}, o || {});
const worksOf = v => (v.records || []).filter(r => r.role === 'works').map(r => r.key);

const EXPECTED_WORKS = {
  ash: ['sk_ash_kelp_kiln', 'sk_lime_kiln'],
  spars: ['sk_spar_sawpit', 'sk_boat_grid_shed'],
  lumber: ['sk_spar_sawpit', 'sk_boat_grid_shed'],
  cordage: ['sk_ropewalk_pitch'],
  smelt: ['sk_paktong_foundry', 'sk_ash_kelp_kiln'],
  mine: ['sk_paktong_foundry', 'sk_ash_kelp_kiln'],
  saltery: ['sk_fish_saltery', 'sk_boat_grid_shed'],
  salt: ['sk_fish_saltery', 'sk_boat_grid_shed'],
  fishing: ['sk_fish_saltery', 'sk_boat_grid_shed'],
  lime: ['sk_lime_kiln'],
  quarry: ['sk_lime_kiln'],
  farming: ['sk_ash_kelp_kiln', 'sk_fish_saltery']
};

const V = {};
Object.keys(EXPECTED_WORKS).forEach(f => { V[f] = H.village(spec(f)); });
const laysFocus = (v, f) => !!v && !v.error && v.records.length >= 12 &&
  zeroCrookshore(v.records.map(r => r.key)) &&
  EXPECTED_WORKS[f].every(k => worksOf(v).includes(k));

Object.keys(EXPECTED_WORKS).forEach(f => {
  T.ok('focus `' + f + '` lays a valid Shore-kin village with works (' + EXPECTED_WORKS[f].join(', ') + ')',
    laysFocus(V[f], f), V[f].error || worksOf(V[f]).join(', '));
});

T.ok('standard KHAMLET.FOCI keys (lumber, mine, salt, quarry) produce identical work buildings to Shore-kin domain names',
  JSON.stringify(worksOf(V.lumber).sort()) === JSON.stringify(worksOf(V.spars).sort()) &&
  JSON.stringify(worksOf(V.mine).sort()) === JSON.stringify(worksOf(V.smelt).sort()) &&
  JSON.stringify(worksOf(V.salt).sort()) === JSON.stringify(worksOf(V.saltery).sort()) &&
  JSON.stringify(worksOf(V.quarry).sort()) === JSON.stringify(worksOf(V.lime).sort()));

// ---- 6. Coastal landing shed (`sk_boat_grid_shed`) & shrine: false option
const LD = { x: -185, z: 30, ux: -1, uz: 0 };
const VSALT_LAND = H.village(spec('saltery', { id: 'sk-outer-saltery', culture: H.shorekinRow({ clientHall: true }), landing: LD }));
const landingOk = v => {
  const q = (v.records || []).find(r => r.role === 'landing');
  return !v.error && !!q && q.key === 'sk_boat_grid_shed' &&
    Math.hypot(q.x - LD.x, q.z - LD.z) < 28 &&
    v.landing && v.landing.quay === q.id && v.lanes.some(l => l.landing) &&
    v.records.some(r => r.role === 'civic' && r.key === 'sk_client_hall');
};
T.ok('coastal Shore-kin saltery places sk_boat_grid_shed at spec.landing and sk_client_hall on the green',
  landingOk(VSALT_LAND), VSALT_LAND.error || JSON.stringify(VSALT_LAND.landing));
T.neg('landing check catches a village laid without spec.landing', landingOk, V.saltery, VSALT_LAND);

const V_NO_SHRINE = H.village(spec('ash', { culture: H.shorekinRow({ shrine: false }) }));
T.ok('shrine: false omits sk_tide_shrine cleanly while default shrine: true places it on the green',
  !V_NO_SHRINE.error && !V_NO_SHRINE.records.some(r => r.key === 'sk_tide_shrine') &&
  V.ash.records.some(r => r.role === 'religious' && r.key === 'sk_tide_shrine'));

// ---- 7. Determinism, row isolation, and negative fault-injection guards
T.ok('identical specs produce identical hashes and mutating one shorekinRow() never mutates another', (() => {
  const a = H.shorekinRow(), b = H.shorekinRow();
  a.works.ash[0].jobs = 99;
  a.houses.poor[0][1] = 9;
  a.pending.sk_stilt_cot.w = 99;
  return b.works.ash[0].jobs === 10 && b.houses.poor[0][1] === 1 && b.pending.sk_stilt_cot.w === 13.6 &&
    H.SHOREKIN_FOCI.every(f => H.hashOf(H.village(spec(f))) === H.hashOf(V[f]));
})());
T.neg('determinism check distinguishes different world seeds',
  v => H.hashOf(v) === H.hashOf(V.cordage), H.village(spec('cordage', { world: 8602 })), H.village(spec('cordage')));

T.neg('unknown focus is refused cleanly',
  f => { const v = H.village(spec(f)); return !v.error && v.records.length > 0; }, 'beetle_ranch', 'ash');
T.neg('shorekinRow refuses non-positive or >1 workShare',
  ws => { H.shorekinRow({ workShare: ws }); return true; }, 0, 0.48);
T.neg('shorekinRow refuses non-positive household size',
  hh => { H.shorekinRow({ household: hh }); return true; }, -3, 5.0);

T.done();
