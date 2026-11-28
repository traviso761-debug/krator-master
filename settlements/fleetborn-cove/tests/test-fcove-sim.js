// node settlements/fleetborn-cove/tests/test-fcove-sim.js
// Verifies FCOVE_SIM ([G data]) over a full 92-day macrotidal lunar cycle:
//   1. P4: All 5 Shore-kin client hinterland villages (village_ash, village_spars, village_cordage, village_ore, village_saltery)
//      + harbour client hall/foundry/shed register in KTAGS with SKK keys, dry terrestrial elevations (>= +8.5 m), client-patron
//      contracts to the Caretaker House, and positive stock output.
//   2. P4: Tide-gated Paktong Reverberatory Cupola smelts nickel_ash + copper_zinc + shell_lime -> paktong ONLY on spring rotor
//      campaigns (0 on neap banked days), with 92-day SIM ledger solvency (0 residual, >= 0 stocks) + negative fault-injection
//      proofs (disableSpringRotors, cutAshSupply, cutCopperZinc).
//   3. P5: 5 Visiting Nomad Fleets (KCAMP.fleetWorld, Deep-Ward px [148, 492], 530 km SSW, 1.9 m diurnal tide) trade Copper Tarn
//      copper_zinc, salvage, and whale_oil for paktong, spars, pitch_cordage, and salt_fish, careen deep hulls (89c, 89g, 89d)
//      STRICTLY on spring days (0 on neaps; 0 at Deep-Ward; caught by neapDeepCareenFault), and converge 5/5 at Double Dark & Double Full!
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

global.window = global;
const load = rel => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), {filename: rel});

load('core/rand/08-core-rand.js');
load('core/space/20-core-space.js');
load('core/city/33-city-strategies.js');
load('core/water/tide/23-core-water-tide.js');
load('core/tags/50-core-tags.js');
load('core/tags/52-core-tags-vocab.js');

[
  '10-hamlet-wood.js', '12-hamlet-gather.js', '14-hamlet-farmland.js',
  '16-hamlet-names.js', '18-hamlet-names.js', '20-hamlet-cultures.js',
  'shorekin/26-hamlet-shorekin.js', '30-hamlet-village.js'
].forEach(f => load('core/hamlet/' + f));

[
  '10-camp-cultures.js', '20-camp-census.js', '30-camp-pitch.js', 'fleet/58-camp-fleet.js'
].forEach(f => load('core/camp/' + f));

[
  '77-sim-0-core.js', '77-sim-1-world.js', '77-sim-2-places.js', '77-sim-3-actors.js',
  '77-sim-4-nav.js', '77-sim-5-motion.js', '77-sim-5r-routes.js', '77-sim-6-economy.js',
  '77-sim-6-govern.js', '77-sim-6-items.js', '77-sim-6-needs.js', '77-sim-6-trade.js',
  '77-sim-7-stocks.js', '77-sim-7-ledger.js', '77-sim-7-lod.js', '77-sim-8-export.js'
].forEach(f => load('core/simulation/' + f));

const FCOVE_TIDE = require(path.join(__dirname, '..', 'src/40-fcove-tide-rules.js'));
const FCOVE_LAYOUT = require(path.join(__dirname, '..', 'src/42-fcove-layout.js'));
const FCOVE_SIM = require(path.join(__dirname, '..', 'src/60-fcove-sim.js'));

const SLICE_JSON = cp.execFileSync(
  process.env.PYTHON || 'python3',
  [path.join(ROOT, 'core/water/tide/tide.py'), '--box', '226', '232', '246', '252'],
  {encoding: 'utf8'}
);
const SLICE_DATA = JSON.parse(SLICE_JSON);
const R = FCOVE_TIDE.create(SLICE_DATA, {ktide: global.KTIDE});

function makeWorld(faults) {
  const tags = global.KTAGS.create();
  const inst = FCOVE_SIM.create({
    layout: FCOVE_LAYOUT,
    khamlet: global.KHAMLET,
    kcamp: global.KCAMP,
    sim: global.SIM,
    tideRules: R,
    tags: tags,
    faults: faults || null
  });
  inst.runDays(0, 92);
  return {inst, tags, audit: inst.audit()};
}

const {inst: M, tags: TAGS, audit: A0} = makeWorld();

/* 1. P4 — All 5 Shore-kin Client Hinterland Villages + Harbour Client Hall & KTAGS */
const VD = M.villagesData;
T.ok('places all 5 Shore-kin client villages cleanly with 0 layout errors and 950..1350 total Shore-kin population',
  VD.errors.length === 0 && VD.villages.length === 5 && VD.totalShorekinPop >= 950 && VD.totalShorekinPop <= 1350,
  'pop=' + VD.totalShorekinPop + ' (hamlets=' + VD.hamletPop + ', harbour=' + VD.harbourCrewPop + '), errs=' + VD.errors.length);

const byId = {};
VD.villages.forEach(v => { byId[v.spec.id] = v; });

T.ok('village elevations satisfy site zonation: ash > +90 m, ore > +25 m, saltery > +9 m, cordage >= +8.5 m, 0 drowned < +8.0 m',
  byId.village_ash.minY > 90 &&
  byId.village_ore.minY > 25 &&
  byId.village_saltery.minY > 9 &&
  byId.village_cordage.minY >= 8.5 &&
  VD.villages.every(v => v.minY >= 8.5) &&
  VD.harbourBuildings.every(b => b.y >= 8.0),
  JSON.stringify(VD.villages.map(v => [v.spec.id, v.minY, v.maxY])));

T.ok('village_saltery places its coastal sk_boat_grid_shed landing and every village uses strictly sk_* Shore-kin keys',
  !!(byId.village_saltery.village.landing && byId.village_saltery.village.landing.quay) &&
  VD.villages.every(v => v.village.records.length >= 25 && v.village.records.every(r => /^sk_/.test(r.key))),
  'landing=' + JSON.stringify(byId.village_saltery.village.landing));

const tagAudit = TAGS.audit();
const skBuildingsInTags = TAGS.query({'class': 'building'}).filter(r => /^shore-kin:sk_/.test(r.key));
const clientHallTag = TAGS.get('fcove.harbour.client_hall');
const sparChuteTag = TAGS.get('fcove.spar_log_chute');
T.ok('all 5 Shore-kin villages, harbour sk_client_hall, and 3D timber log-chute register cleanly in KTAGS with 0 vocabulary errors',
  skBuildingsInTags.length >= 180 && !!clientHallTag && clientHallTag.kind === 'sk_client_hall' &&
  !!sparChuteTag && tagAudit.missingCulture === 0 && tagAudit.missingTypes === 0,
  'skBuildings=' + skBuildingsInTags.length + ' missCul=' + tagAudit.missingCulture + ' missTypes=' + tagAudit.missingTypes);

T.ok('all 5 Shore-kin villages stand under client-patron contract to Caretaker House, delivering tithes and receiving paktong + shallow berths',
  VD.villages.every(v => {
    const vt = M.villageTotals[v.spec.id];
    const prod = Object.values(vt.produced).reduce((a, b) => a + b, 0);
    const tithe = Object.values(vt.tithed).reduce((a, b) => a + b, 0);
    return v.clientContract.status === 'client' && v.clientContract.patron === 'arcoforte_caretaker_house' &&
      prod > 80 && tithe > 40 && vt.paktongReceived > 0 && vt.shallowBerthsUsed === 92;
  }),
  'titheTotal=' + M.metrics.clientTitheUnits + ' paktongIssued=' + M.metrics.clientPaktongIssued);

/* 2. P4 — Tide-Gated Paktong Smelt & 92-Day SIM Ledger Solvency */
const springLogs = M.dailyLog.filter(d => d.smeltActive);
const bankedLogs = M.dailyLog.filter(d => !d.smeltActive);
T.ok('reverberatory cupola smelts paktong ONLY on spring rotor campaigns (>= 11 MWh) and smelts 0 on all neap banked days',
  springLogs.length >= 16 && bankedLogs.length >= 30 &&
  M.metrics.paktongSmeltedSpring >= 80 &&
  M.metrics.paktongSmeltedBanked === 0 &&
  bankedLogs.every(d => d.paktongSmelted === 0),
  'springSmelted=' + M.metrics.paktongSmeltedSpring + ' over ' + springLogs.length + ' campaign days; banked=' + M.metrics.paktongSmeltedBanked);

T.ok('92-day SIM ledger balances to zero residual across all 9 goods with strictly solvent (>= 0) stocks every day',
  A0.ok && A0.ledgerOk && A0.ledgerProblems.length === 0 && A0.simProblems.length === 0 && !A0.negativeStock &&
  FCOVE_SIM.GOOD_KEYS.every(g => M.metrics.minStockSeen[g] >= 0),
  'problems=' + JSON.stringify(A0.ledgerProblems.concat(A0.simProblems)) + ' minStocks=' + JSON.stringify(M.metrics.minStockSeen));

T.ok('White Stacks spring-low sea-byssus harvest boosts Seep-Walk pitch_cordage strictly on spring low ebbs',
  M.metrics.byssusSpringBonus >= 36 && M.dailyLog.filter(d => !d.causewayOpen).every(d => !R.causewayDay(d.day).byssusGatherable),
  'byssusBonus=' + M.metrics.byssusSpringBonus);

/* 3. P5 — Deep-Ward Roadstead, 5 Visiting Nomad Fleets, Spring-Only Deep Careening & Great Careening Moot Peaks */
const dwDist = global.KCAMP.portDistanceKm('arcoforte', 'deep_ward');
const dwBear = global.KCAMP.portBearingDeg('arcoforte', 'deep_ward');
const dwPort = global.KCAMP.PORTS.deep_ward;
T.ok('Deep-Ward Anchorage sits at px [148, 492] (~530 km SSW at ~199 deg, 1.9 m diurnal tide, canCareenDeep=false)',
  dwPort.px[0] === 148 && dwPort.px[1] === 492 && Math.abs(dwDist - 531.5) < 8 && Math.abs(dwBear - 199.4) < 3 &&
  dwPort.tideRange_m === 1.9 && dwPort.diurnal === true && dwPort.canCareenDeep === false,
  'dist=' + dwDist.toFixed(1) + ' km, bearing=' + dwBear.toFixed(1) + ' deg');

const deepCareens = M.fleetWorld.careenLog.filter(c => c.deepCareen);
const deepKeys = new Set(deepCareens.map(c => global.KCAMP.hullSpec(c.key).key));
T.ok('deep hulls (89c, 89g, 89d; draft > 2.2 m) careen ONLY on spring days at Arcoforte (0 on neaps, 0 at Deep-Ward)',
  deepCareens.length >= 25 &&
  deepKeys.has('89c') && deepKeys.has('89g') && deepKeys.has('89d') &&
  A0.neapDeepCareens === 0 && A0.deepWardCareens === 0 &&
  deepCareens.every(c => R.cradleDay('cradle_deep', c.day).open === true),
  'deepCareens=' + deepCareens.length + ' neapViolations=' + A0.neapDeepCareens);

const d0State = M.dayState(0), d44State = M.dayState(44), d67State = M.dayState(67), d90State = M.dayState(90);
T.ok('all 5 nomad fleets converge at Double Dark (day 0 & day 90) and Double Full (day 44) Great Careenings (2,480 moot pop vs < 5 fleets at Neap day 67)',
  d0State.fleetCount === 5 && d44State.fleetCount === 5 && d90State.fleetCount === 5 &&
  d90State.mootPop === 2480 && d90State.totalHullsInCove >= 30 &&
  d67State.fleetCount >= 1 && d67State.fleetCount < 5 && d67State.mootPop < d90State.mootPop,
  'd0=' + d0State.fleetCount + ', d44=' + d44State.fleetCount + ', d67(neap)=' + d67State.fleetCount + ' (' + d67State.totalHullsInCove + ' hulls), d90(moot)=' + d90State.fleetCount + ' (' + d90State.totalHullsInCove + ' hulls)');

T.ok('visiting fleets import Copper Tarn copper_zinc, salvage, and whale_oil and export paktong, spars, pitch_cordage, and salt_fish',
  (M.metrics.fleetImports.copper_zinc || 0) >= 38 &&
  (M.metrics.fleetImports.salvage || 0) >= 40 &&
  (M.metrics.fleetImports.whale_oil || 0) >= 18 &&
  (M.metrics.fleetExports.paktong || 0) > 0 &&
  (M.metrics.fleetExports.spars || 0) > 0 &&
  (M.metrics.fleetExports.pitch_cordage || 0) > 0 &&
  (M.metrics.fleetExports.salt_fish || 0) > 0,
  'imports=' + JSON.stringify(M.metrics.fleetImports) + ' exports=' + JSON.stringify(M.metrics.fleetExports));

/* 4. Negative Fault-Injection Proofs (T.neg: fails on faulty world, passes on nominal world) */
T.neg('disableSpringRotors collapses 92-day paktong smelt output to 0',
  faultOn => makeWorld({disableSpringRotors: faultOn}).inst.metrics.paktongSmeltedTotal >= 80,
  true,
  false);

T.neg('cutAshSupply starves cupola of Pycnandra nickel_ash and collapses paktong output to 0',
  faultOn => makeWorld({cutAshSupply: faultOn}).inst.metrics.paktongSmeltedTotal >= 80,
  true,
  false);

T.neg('cutCopperZinc starves cupola of Dyke-Roast & Copper Tarn copper_zinc and collapses paktong output to 0',
  faultOn => makeWorld({cutCopperZinc: faultOn}).inst.metrics.paktongSmeltedTotal >= 80,
  true,
  false);

T.neg('neapDeepCareenFault causes illegal neap deep-hull careening caught by audit()',
  faultOn => makeWorld({neapDeepCareenFault: faultOn}).audit.ok,
  true,
  false);

T.done();
