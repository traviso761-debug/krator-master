// node core/camp/test-camp-fleet.js: sea-nomad `fleet` bands, Deep-Ward 1.9 m diurnal roadstead, harbour mooring ring,
// and 92-day macrotidal careening simulation on real KTIDE / FCOVE_TIDE (core/camp/fleet/58-camp-fleet.js, [G data]).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const T = require('../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..');
const load = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
global.window = global;

load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/camp/10-camp-cultures.js');
load('core/camp/20-camp-census.js');
load('core/camp/30-camp-pitch.js');
load('core/camp/fleet/58-camp-fleet.js');

const KTIDE = require(path.join(ROOT, 'core/water/tide/23-core-water-tide.js'));
const FCOVE_TIDE = require(path.join(ROOT, 'settlements/fleetborn-cove/src/40-fcove-tide-rules.js'));
const TIDES_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/scale-model/model/data/tides.json'), 'utf8'));

const near = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 1e-6 : eps);

// ---- 1. Culture rows & vessel hull specs match kits/ringsea 89c..89h
const EXPECTED_DRAFTS = {
  '89g': 5.4, ark_ward: 5.4,
  '89c': 5.2, ark_catamaran: 5.2,
  '89d': 4.8, smelt_barge: 4.8,
  '89e': 2.0, vent_tender: 2.0,
  '89f': 1.5, scout_trimaran: 1.5,
  '89h': 1.9, hk_whaler: 1.9
};
const hullTableOk = () => Object.keys(EXPECTED_DRAFTS).every(k => {
  const h = KCAMP.hullSpec(k);
  return h && near(h.draft_m, EXPECTED_DRAFTS[k], 1e-9) &&
    h.deepCareen === (h.draft_m > 2.2) && h.crewCap > 0 && h.cargoCap > 0;
});
T.ok('KCAMP.CULTURES.fleetborn & fleetborn-whaler map all 6 ringsea vessel types with exact draft_m and deepCareen (draft_m > 2.2)',
  !!KCAMP.CULTURES.fleetborn && !!KCAMP.CULTURES['fleetborn-whaler'] &&
  hullTableOk() &&
  KCAMP.CULTURES.fleetborn.kind('89g') === 'chief' &&
  KCAMP.CULTURES.fleetborn.kind('89c') === 'dwelling' &&
  KCAMP.CULTURES.fleetborn.kind('89h') === null &&
  KCAMP.CULTURES['fleetborn-whaler'].kind('89h') === 'sleep');

/* Verify L, B, H against kits/ringsea/src/89[c-h]-*.js declarations */
const RS_DIMS = {};
for (const f of fs.readdirSync(path.join(ROOT, 'kits/ringsea/src')).filter(n => /^89[c-h]-/.test(n))) {
  const s = fs.readFileSync(path.join(ROOT, 'kits/ringsea/src', f), 'utf8');
  const m = s.match(/RS_VESSEL\(\{key:'(\w+)'[^\n]*?\bL:([\d.]+),B:([\d.]+),H:([\d.]+)/);
  if (m) RS_DIMS[m[1]] = { L: +m[2], B: +m[3], H: +m[4] };
}
T.ok('every fleet hull box matches kits/ringsea RS_VESSEL (B -> w, L -> d, H -> h) bit-for-bit',
  ['89c', '89d', '89e', '89f', '89g', '89h'].every(k => {
    const h = KCAMP.hullSpec(k), r = RS_DIMS[h.rsKey];
    return r && h.w === r.B && h.d === r.L && h.h === r.H;
  }), JSON.stringify(RS_DIMS));

/* KCAMP.census compatibility on a Fleet-born detachment program */
const fcCensus = KCAMP.census({
  id: 'ward-detachment', world: 42, culture: 'fleetborn-whaler',
  program: { tents: [{ key: '89g', n: 1 }, { key: '89c', n: 2 }, { key: '89d', n: 1 }, { key: '89e', n: 2 }, { key: '89h', n: 2 }] }
});
T.ok('fleetborn-whaler row integrates cleanly with KCAMP.census (zero land mounts, staffed smelters/divers/whalers)',
  !fcCensus.error && fcCensus.pop > 140 && fcCensus.mounts === 0 &&
  fcCensus.people.some(p => p.role === 'smelter') &&
  fcCensus.people.some(p => p.role === 'diver') &&
  fcCensus.people.some(p => p.role === 'whaler'));

// ---- 2. Canonical scale-model ports & Deep-Ward ~530 km SSW (199 deg) 1.9 m diurnal tide
const P = KCAMP.PORTS;
const distDW = KCAMP.portDistanceKm('arcoforte', 'deep_ward');
const bearDW = KCAMP.portBearingDeg('arcoforte', 'deep_ward');
const tdModel = KTIDE.load(TIDES_DATA);
const dwSite = tdModel.site({ px: P.deep_ward.px[0], py: P.deep_ward.px[1] });
const portGeometryOk = p => p.arcoforte && p.deep_ward && p.farport && p.copper_tarn_landing && p.arch_trench && p.ria_sound &&
  p.arcoforte.canCareenDeep === true && p.deep_ward.canCareenDeep === false &&
  p.deep_ward.settlementId === 'sdeepward1' && p.deep_ward.diurnal === true &&
  near(p.deep_ward.tideRange_m, 1.9, 0.05) &&
  Math.abs(distDW - 530) < 2.0 && Math.abs(bearDW - 199) < 1.0 &&
  dwSite && Math.abs(dwSite.range - 1.9) < 0.12 && dwSite.a[0] > 10 * dwSite.a[1];
T.ok('Deep-Ward sits ~530 km SSW (199 deg) of Arcoforte with ~1.9 m diurnal D1 tide (D1 > 10x D2) and canCareenDeep === false',
  portGeometryOk(P), 'dist=' + distDW.toFixed(1) + ' km, bear=' + bearDW.toFixed(1) + ' deg, dwRange=' + (dwSite && dwSite.range.toFixed(2)));
T.neg('port check rejects Deep-Ward if mistakenly marked canCareenDeep: true',
  portGeometryOk, Object.assign({}, P, { deep_ward: Object.assign({}, P.deep_ward, { canCareenDeep: true }) }), P);

// ---- 3. Canonical 5 nomad fleets & Great Careening population envelope
const totalFleetPop = KCAMP.DEFAULT_FLEETS.reduce((s, f) => s + f.people, 0);
T.ok('KCAMP.DEFAULT_FLEETS defines all 5 nomad fleets (~280..520 each, totaling 2,060 visiting + 420 caretakers = 2,480)',
  KCAMP.DEFAULT_FLEETS.length === 5 &&
  JSON.stringify(KCAMP.DEFAULT_FLEETS.map(f => f.id)) === JSON.stringify(['ward_ring', 'smelt_fleet', 'trench_fleet', 'outer_whalers', 'island_traders']) &&
  KCAMP.DEFAULT_FLEETS.every(f => f.homePort === 'deep_ward' && f.people >= 280 && f.people <= 520 && f.hulls.some(h => h.draft_m > 2.2)) &&
  totalFleetPop >= 2000 && totalFleetPop <= 2200 && (totalFleetPop + 420) >= 2300 && (totalFleetPop + 420) <= 2600,
  'visitingPop=' + totalFleetPop);

// ---- 4. Full 92-day simulation with real KTIDE & FCOVE_TIDE (Laws 1, 2 & 3)
const ftCove = FCOVE_TIDE.create(TIDES_DATA, { ktide: KTIDE });
const realTideGate = d => {
  const s = ftCove.daySummary(d);
  const mod = ((Math.floor(d) % 91) + 91) % 91;
  const isMoot = (mod >= 0 && mod <= 2) || (mod >= 43 && mod <= 46) || (mod >= 89 && mod <= 90);
  return {
    dayRange: s.range,
    dayHighest: s.highest,
    deepCradleOpen: s.cradles.cradle_deep.open,
    greatCradleOpen: s.cradles.cradle_great.open,
    isMoot
  };
};

const W = KCAMP.fleetWorld({ world: 9101, tideGate: realTideGate });
KCAMP.fleetRun(W, 0, 92);

/* Law 2a: ZERO deep hulls (draft_m > 2.2) ever careened on a non-spring / neap day (deepCradleOpen === false) */
const deepCareens = W.careenLog.filter(e => e.draft_m > 2.2);
const illegalNeapDeepCareens = deepCareens.filter(e => !realTideGate(e.day).deepCradleOpen || e.dayHighest < 5.6);
const checkNoNeapCareen = log => log.filter(e => e.draft_m > 2.2).every(e => realTideGate(e.day).deepCradleOpen && e.dayHighest >= 5.6);
T.ok('Law 2: 0 deep hulls (draft_m > 2.2) are ever careened when deepCradleOpen === false across all 92 days (' + deepCareens.length + ' spring deep careenings)',
  deepCareens.length >= 25 && illegalNeapDeepCareens.length === 0 && checkNoNeapCareen(W.careenLog),
  'deepCareens=' + deepCareens.length + ' illegal=' + illegalNeapDeepCareens.length);
T.neg('Law 2 audit catches a synthetic neap-day (day 67) deep-hull careening entry',
  checkNoNeapCareen,
  W.careenLog.concat([{ day: 67, fleetId: 'ward_ring', hullId: 'ward_ring:89g:0', draft_m: 5.4, dayHighest: 3.66, dayRange: 7.5 }]),
  W.careenLog);

/* Every one of the 5 fleets careens all of its deep hulls on spring days */
const fleetsCareenedAllDeep = KCAMP.DEFAULT_FLEETS.every(fd => {
  const f = W.fleets[fd.id];
  return f.hulls.filter(h => h.draft_m > 2.2).every(h => h.careenCount >= 2);
});
T.ok('every one of the 5 fleets careens all of its deep hulls multiple times on spring days over the 92-day cycle',
  fleetsCareenedAllDeep);

/* Law 1 & Law 2b: Forced mid-neap arrival with overdue deep hull stretches stay until next spring day */
{
  const Wneap = KCAMP.fleetWorld({
    world: 77,
    tideGate: realTideGate,
    fleets: [Object.assign({}, KCAMP.DEFAULT_FLEETS[0], {
      startPort: 'deep_ward',
      hulls: KCAMP.DEFAULT_FLEETS[0].hulls.map(h => Object.assign({}, h, { initialDaysSinceCareen: 40 }))
    })]
  });
  /* Start at day 12 at deep_ward with overdue 89g (draft 5.4 m): cannot careen at deep_ward (Law 1), sails 3 days -> arrives day 15 (neap, highest 4.25 m),
     waits across neap day 15, careens on spring day 16 (highest >= 5.6 m)! */
  KCAMP.fleetRun(Wneap, 12, 18);
  const f0 = Wneap.fleets.ward_ring;
  const d15AtArco = KCAMP.fleetsAt(Wneap, 'arcoforte', 15).length === 1;
  const d15Careens = Wneap.careenLog.filter(e => e.day === 15 && e.draft_m > 2.2).length;
  const d16Careens = Wneap.careenLog.filter(e => e.day === 16 && e.draft_m > 2.2).length;
  T.ok('Laws 1 & 2: overdue fleet at Deep-Ward sails to Arcoforte, stretches stay across neap day 15 (0 deep careens), and careens on spring day 16',
    d15AtArco && d15Careens === 0 && d16Careens === 6 && f0.totalStretchedDays >= 1 && Wneap.stretchLog.some(s => s.day === 15),
    JSON.stringify({ d15AtArco, d15Careens, d16Careens, stretched: f0.totalStretchedDays }));
}

/* Law 3: Double Dark (days 0..2, 89..91) & Double Full (days 43..46) Great Careening Moots vs mid-cycle neap troughs */
const MOOT_DAYS = [0, 1, 2, 43, 44, 45, 46, 89, 90, 91];
const MID_NEAP_DAYS = [];
for (let d = 5; d <= 86; d++) {
  if (MOOT_DAYS.includes(d)) continue;
  const s = ftCove.daySummary(d);
  if (s.phase === 'neap') MID_NEAP_DAYS.push(d);
}
const mootConverged = MOOT_DAYS.every(d => {
  const fl = KCAMP.fleetsAt(W, 'arcoforte', d);
  const pop = fl.reduce((a, f) => a + f.people, 0);
  return fl.length === 5 && pop >= 2000;
});
const neapSparse = MID_NEAP_DAYS.length >= 10 && MID_NEAP_DAYS.every(d => {
  const fl = KCAMP.fleetsAt(W, 'arcoforte', d);
  const pop = fl.reduce((a, f) => a + f.people, 0);
  return fl.length <= 2 && pop < 1100;
});
T.ok('Law 3: all 5 fleets converge at Double Dark (0..2, 89..91) & Double Full (43..46) moots (pop = ' + totalFleetPop + ' >= 2000) while all ' +
  MID_NEAP_DAYS.length + ' mid-cycle neap days hold <= 2 fleets (pop < 1100)',
  mootConverged && neapSparse,
  'mootMin=' + Math.min(...MOOT_DAYS.map(d => KCAMP.fleetsAt(W, 'arcoforte', d).length)) +
  ' neapMaxPop=' + Math.max(...MID_NEAP_DAYS.map(d => KCAMP.fleetsAt(W, 'arcoforte', d).reduce((a, f) => a + f.people, 0))));
T.neg('moot convergence check rejects a mid-cycle neap day (day 67) as a moot',
  d => KCAMP.fleetsAt(W, 'arcoforte', d).length === 5, 67, 44);

/* Standalone analytical tideGate fallback (without FCOVE_TIDE injected) */
{
  const Wpure = KCAMP.fleetWorld({ world: 9101 });
  KCAMP.fleetRun(Wpure, 0, 92);
  const badPure = Wpure.careenLog.filter(e => e.draft_m > 2.2 && !Wpure.tideGate(e.day).deepCradleOpen);
  T.ok('standalone default tideGate model also runs 92 days with 0 neap deep careenings and 5-fleet moot peaks',
    badPure.length === 0 && KCAMP.fleetsAt(Wpure, 'arcoforte', 44).length === 5 && KCAMP.fleetsAt(Wpure, 'arcoforte', 90).length === 5);
}

// ---- 5. KCAMP.fleetMooring: zero overlaps, inner 89g -> outer tenders/trimarans, avoidFn, determinism
const rock = { x: 45, z: -30, r: 24 };
const avoidRock = (x, z, r) => Math.hypot(x - rock.x, z - rock.z) < rock.r + (r == null ? 0 : r) * 0.25;
const M5 = KCAMP.fleetMooring({
  world: 505,
  fleets: KCAMP.DEFAULT_FLEETS,
  center: { x: 0, z: 0 },
  rx: 280,
  rz: 260,
  minClear_m: 6,
  avoidFn: avoidRock
});
const countOverlaps = (berths, minClear) => {
  let n = 0;
  for (let i = 0; i < berths.length; i++) {
    for (let j = i + 1; j < berths.length; j++) {
      if (KCAMP.berthOverlaps(berths[i], berths[j], minClear - 1e-3)) n++;
    }
  }
  return n;
};
const meanRad = pred => {
  const sub = M5.berths.filter(pred);
  return sub.reduce((s, b) => s + Math.hypot(b.x, b.z), 0) / sub.length;
};
const rWard = meanRad(b => b.key === '89g');
const rDeep = meanRad(b => b.key === '89c' || b.key === '89d');
const rSmall = meanRad(b => b.key === '89e' || b.key === '89f' || b.key === '89h');

T.ok('KCAMP.fleetMooring berths all 83 moot hulls (pop ' + M5.totalPop + ') with 0 overlaps, respecting avoidFn, and ordering 89g inner < 89c/89d < tenders/trimarans outer',
  M5.short.length === 0 && M5.totalHulls === 83 && M5.totalPop === totalFleetPop &&
  countOverlaps(M5.berths, 6) === 0 &&
  M5.berths.every(b => !avoidRock(b.x, b.z, 0)) &&
  rWard < rDeep && rDeep < rSmall,
  'rWard=' + rWard.toFixed(1) + ' rDeep=' + rDeep.toFixed(1) + ' rSmall=' + rSmall.toFixed(1));

T.neg('mooring overlap detector catches two colliding hulls',
  berths => countOverlaps(berths, 6) === 0,
  (() => { const bad = M5.berths.map(b => Object.assign({}, b)); bad[1].x = bad[0].x + 2; bad[1].z = bad[0].z; return bad; })(),
  M5.berths);

// ---- 6. Determinism & negative fault-injection tests
const M5_AGAIN = KCAMP.fleetMooring({
  world: 505, fleets: KCAMP.DEFAULT_FLEETS, center: { x: 0, z: 0 }, rx: 280, rz: 260, minClear_m: 6, avoidFn: avoidRock
});
const W_AGAIN = KCAMP.fleetWorld({ world: 9101, tideGate: realTideGate });
KCAMP.fleetRun(W_AGAIN, 0, 92);
T.ok('fleetMooring and 92-day fleetRun are 100% deterministic across runs',
  JSON.stringify(M5) === JSON.stringify(M5_AGAIN) &&
  JSON.stringify(W.careenLog) === JSON.stringify(W_AGAIN.careenLog) &&
  JSON.stringify(W.ops) === JSON.stringify(W_AGAIN.ops));
T.neg('fleetMooring distinguishes different world seeds',
  m => JSON.stringify(m) === JSON.stringify(M5),
  KCAMP.fleetMooring({ world: 506, fleets: KCAMP.DEFAULT_FLEETS, center: { x: 0, z: 0 }, rx: 280, rz: 260, minClear_m: 6, avoidFn: avoidRock }),
  M5);

T.neg('fleetMooring refuses non-positive basin radius rx',
  rx => { KCAMP.fleetMooring({ rx, rz: 200 }); return true; }, 0, 200);
T.neg('fleetMooring refuses unknown vessel key',
  k => { KCAMP.fleetMooring({ fleets: [{ id: 'bad', hulls: [{ key: k, draft_m: 3, pop: 10 }] }] }); return true; }, '99z_flying_saucer', '89c');
T.neg('fleetWorld refuses non-function tideGate',
  tg => { KCAMP.fleetWorld({ tideGate: tg }); return true; }, 'not-a-fn', realTideGate);
T.neg('fleetsAt refuses unknown port id',
  pid => { KCAMP.fleetsAt(W, pid, 0); return true; }, 'atlantis', 'arcoforte');
T.neg('portDistanceKm refuses unknown port id',
  pid => KCAMP.portDistanceKm('arcoforte', pid) >= 0, 'atlantis', 'deep_ward');

T.done();
