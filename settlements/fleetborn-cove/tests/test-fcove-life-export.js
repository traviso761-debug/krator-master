// node settlements/fleetborn-cove/tests/test-fcove-life-export.js
// Verifies Phase P6 (FCOVE_NAMES + FCOVE_LIFE_PLAN on core/sched + FCOVE_TIDE + FCOVE_SIM) and Phase P7 (core/export contract):
//   1. FCOVE_NAMES: deterministic KRAND-seeded Fleet-born click names (c, q, x, ɓ, ɗ), Shore-kin 4-strand creole names
//      (strictly Arch/sea trade bynames), Hueru-Kuran whaler names, peoples.json skin stops, and diveClass invariants.
//   2. FCOVE_LIFE_PLAN:
//      - 0 non-diving citizens below seaLevel across -7.26 m, 0.0 m, +7.05 m, and a full [-7.27..+7.11 m] sweep;
//      - Great Careening Cradle crew active on -3.0 m floor of cradle_deep at -7.26 m, dry stepped altars at 0.0 m, and 0 in pit at +7.05 m;
//      - White Stacks sea-byssus gatherers on -6.0 m causeway ONLY when seaLevel <= -6.0 m (0 at -5.8 m, 0.0 m, +7.05 m);
//      - Sill rotor tenders dive in water during slack (|v| <= 0.65 m/s) and climb to +8.6 m pier tops during peak race;
//      - Double Dark Moot Day 91 active citizen count (~788) > 1.8x Neap Day 67 (~327).
//   3. SIM.export() + KTAGS + EXPORT.world / EXPORT.check / EXPORT.glb glTF binary magic (0x46546C67) + T.neg fault injections!
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);
const ROOT = path.join(__dirname, '..', '..', '..');

global.window = global;
const load = rel => vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), {filename: rel});

load('core/export/07-core-export.js');
load('core/rand/08-core-rand.js');
load('core/export/09-core-export-adapters.js');
load('core/space/20-core-space.js');
load('core/sched/20-core-sched.js');
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

/* Load real peoples.json slice matching build.py */
const rawPeoples = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/charactermodels/data/peoples.json'), 'utf8'));
const pMap = {};
(rawPeoples.peoples || []).forEach(p => {
  if (p && (p.id === 'cflit_qbon' || p.id === 'shore_kin' || p.id === 'hueru_kuran')) pMap[p.id] = p;
});
global.FCOVE_PEOPLES = pMap;

const FCOVE_TIDE = require(path.join(__dirname, '..', 'src/40-fcove-tide-rules.js'));
const FCOVE_NAMES = require(path.join(__dirname, '..', 'src/41-fcove-names.js'));
const FCOVE_LAYOUT = require(path.join(__dirname, '..', 'src/42-fcove-layout.js'));
const FCOVE_LIFE_PLAN = require(path.join(__dirname, '..', 'src/43-fcove-life-plan.js'));
const FCOVE_SIM = require(path.join(__dirname, '..', 'src/60-fcove-sim.js'));

const SLICE_JSON = cp.execFileSync(
  process.env.PYTHON || 'python3',
  [path.join(ROOT, 'core/water/tide/tide.py'), '--box', '226', '232', '246', '252'],
  {encoding: 'utf8'}
);
const R = FCOVE_TIDE.create(JSON.parse(SLICE_JSON), {ktide: global.KTIDE});

const TAGS = global.KTAGS.create();
const WORLD = FCOVE_SIM.create({
  layout: FCOVE_LAYOUT,
  khamlet: global.KHAMLET,
  kcamp: global.KCAMP,
  sim: global.SIM,
  tideRules: R,
  tags: TAGS
});
WORLD.runDays(0, 92);

const LP = FCOVE_LIFE_PLAN.create({
  layout: FCOVE_LAYOUT,
  names: FCOVE_NAMES,
  ksched: global.KSCHED,
  peoples: pMap
});

/* ---------------- 1. FCOVE_NAMES & PEOPLES METADATA ---------------- */
T.ok('peoples.json provides both cflit_qbon and shore_kin presets resolved into FCOVE_NAMES',
  !!(pMap.cflit_qbon && pMap.shore_kin) &&
  LP.roster.length >= 700 &&
  LP.roster.some(c => c.people === 'cflit_qbon') &&
  LP.roster.some(c => c.people === 'shore_kin') &&
  LP.roster.some(c => c.people === 'hueru_kuran'),
  'roster=' + LP.roster.length + ' cflit=' + !!pMap.cflit_qbon + ' shore_kin=' + !!pMap.shore_kin);

const fbCitizens = LP.roster.filter(c => c.people === 'cflit_qbon');
const skCitizens = LP.roster.filter(c => c.people === 'shore_kin');
const hkCitizens = LP.roster.filter(c => c.people === 'hueru_kuran');
const clickRe = /^[cqx\u0253\u0257][A-Z\u0100\u0112\u012a\u014c\u016a]/;

T.ok('all Fleet-born citizens carry click prefixes + hyphenated chain-clan bynames and full_diver_25m100m trait',
  fbCitizens.length >= 350 &&
  fbCitizens.every(c => clickRe.test(c.given) && /-/.test(c.byname) && c.diveClass === 'full_diver_25m100m' && pMap.cflit_qbon.skin.indexOf(c.skin) >= 0),
  'sample=' + fbCitizens.slice(0, 3).map(c => c.name).join(', '));

T.ok('all Shore-kin citizens carry 4-strand Arch creole names, shore_kin skin stops, and zero nephrite/red-cypress bynames',
  skCitizens.length >= 250 &&
  skCitizens.every(c =>
    !clickRe.test(c.given) &&
    !/nephrite|cypress/i.test(c.name + ' ' + c.gloss) &&
    (c.diveClass === 'half_diver_3m25m' || c.diveClass === 'land_bound') &&
    pMap.shore_kin.skin.indexOf(c.skin) >= 0
  ) &&
  hkCitizens.length >= 40 && hkCitizens.every(c => c.diveClass === 'land_bound'),
  'sample=' + skCitizens.slice(0, 3).map(c => c.name).join(', '));

/* ---------------- 2. TIDE-GATED COHORTS & ZERO SUBMERGED NON-DIVERS ---------------- */
const mootFleets = WORLD.dayState(90).fleetIds;
const neapFleets = WORLD.dayState(67).fleetIds;

const audEbb = LP.auditState({seaLevel: -7.26, sillVelocity: -0.35, smeltActive: true, day: 90, activeFleetIds: mootFleets, motionSec: 12});
const audMid = LP.auditState({seaLevel: 0.0, sillVelocity: 4.1, smeltActive: true, day: 90, activeFleetIds: mootFleets, motionSec: 25});
const audFlood = LP.auditState({seaLevel: 7.05, sillVelocity: 0.25, smeltActive: true, day: 90, activeFleetIds: mootFleets, motionSec: 40});

let sweepViolations = 0;
for (let lv = -7.27; lv <= 7.12; lv += 0.45) {
  const a = LP.auditState({seaLevel: +lv.toFixed(2), sillVelocity: lv < 0 ? -2.8 : 2.8, smeltActive: Math.abs(lv) > 5, day: 90, activeFleetIds: mootFleets, motionSec: 18});
  if (!a.ok) sweepViolations++;
}

T.ok('0 non-diving citizens below seaLevel across -7.26 m, 0.0 m, +7.05 m, and full [-7.27..+7.11 m] tide sweep',
  audEbb.ok && audMid.ok && audFlood.ok && sweepViolations === 0 &&
  audEbb.summary.submergedNonDivers === 0 &&
  audMid.summary.submergedNonDivers === 0 &&
  audFlood.summary.submergedNonDivers === 0 &&
  audEbb.summary.landBoundInWater === 0,
  'ebbSub=' + audEbb.summary.submergedNonDivers + ', midSub=' + audMid.summary.submergedNonDivers + ', floodSub=' + audFlood.summary.submergedNonDivers + ', sweepViolations=' + sweepViolations);

T.ok('Great Careening Cradle crew work on -3.0 m floor of cradle_deep at -7.26 m and relocate completely out of pit (0 in pit) at +7.05 m',
  audEbb.summary.careeningDeepPit >= 34 &&
  audEbb.summary.careeningInPit >= 44 &&
  audMid.summary.careeningInPit >= 44 &&
  audFlood.summary.careeningInPit === 0 &&
  audFlood.summary.careeningBench >= 44,
  'ebbDeepPit=' + audEbb.summary.careeningDeepPit + ', midInPit=' + audMid.summary.careeningInPit + ', floodInPit=' + audFlood.summary.careeningInPit + ' (bench=' + audFlood.summary.careeningBench + ')');

const audNearCwy = LP.auditState({seaLevel: -5.85, sillVelocity: -1.4, smeltActive: true, day: 90, activeFleetIds: mootFleets, motionSec: 10});
T.ok('White Stacks sea-byssus gatherers walk onto -6.0 m causeway ONLY when seaLevel <= -6.0 m and relocate ashore when > -6.0 m',
  audEbb.summary.byssusOnCauseway >= 22 &&
  audEbb.summary.byssusOnShore === 0 &&
  audNearCwy.summary.byssusOnCauseway === 0 &&
  audMid.summary.byssusOnCauseway === 0 &&
  audFlood.summary.byssusOnCauseway === 0 &&
  audMid.summary.byssusOnShore >= 22,
  'at -7.26m=' + audEbb.summary.byssusOnCauseway + ', at -5.85m=' + audNearCwy.summary.byssusOnCauseway + ', at 0.0m=' + audMid.summary.byssusOnCauseway + ', at +7.05m=' + audFlood.summary.byssusOnCauseway);

T.ok('sill-race paktong rotor tenders dive in water during slack (|v| <= 0.65 m/s) and tend +8.6 m pier tops during strong race',
  audEbb.summary.diversOnPier === 0 &&
  audEbb.summary.diversInWater >= 34 &&
  audMid.summary.diversOnPier === 12 &&
  audMid.summary.diversInWater >= 22,
  'slackDiversInWater=' + audEbb.summary.diversInWater + ' (pier=' + audEbb.summary.diversOnPier + '), raceDiversOnPier=' + audMid.summary.diversOnPier);

/* ---------------- 3. DYNAMIC MOOT SWELL (DAY 91 VS NEAP DAY 67) ---------------- */
const sumNeap67 = LP.summary({seaLevel: -3.6, sillVelocity: -1.8, smeltActive: false, day: 67, fcoveWorld: WORLD, motionSec: 15});
const sumMoot91 = LP.summary({seaLevel: 6.9, sillVelocity: 0.3, smeltActive: true, day: 91, fcoveWorld: WORLD, motionSec: 15});
const mootRatio = sumMoot91.totalActive / Math.max(1, sumNeap67.totalActive);

T.ok('Double Dark Moot Day 91 crowd (~788, 5/5 fleets) swells > 1.8x over Neap Day 67 (~327, 1/5 fleets)',
  neapFleets.length === 1 && mootFleets.length === 5 &&
  sumNeap67.totalActive >= 280 && sumNeap67.totalActive <= 355 &&
  sumMoot91.totalActive >= 680 && sumMoot91.totalActive <= 860 &&
  mootRatio > 1.8,
  'neap67=' + sumNeap67.totalActive + ' (fleets=' + sumNeap67.activeFleets + '), moot91=' + sumMoot91.totalActive + ' (fleets=' + sumMoot91.activeFleets + '), ratio=' + mootRatio.toFixed(2) + 'x');

/* ---------------- 4. SIM ACTORS, KTAGS & CORE/EXPORT CONTAINER ---------------- */
const addedSim = LP.registerSimActors(global.SIM);
const lifeTagIds = LP.registerTags(TAGS, {seaLevel: 0.0, day: 90, activeFleetIds: mootFleets});
const simExp = global.SIM.export();
const tagAud = TAGS.audit();
const lifeRecs = TAGS.query({'class': 'life'});

T.ok('named citizens register cleanly into SIM.export().actors and KTAGS life records with 0 vocabulary errors',
  addedSim >= 700 && simExp.format === 'krator-sim' && simExp.actors.length >= 700 &&
  lifeTagIds.length >= 700 && lifeRecs.length === lifeTagIds.length &&
  lifeRecs.every(r => global.KTAGS.norm(r.tags).problems.length === 0) &&
  tagAud.missingCulture === 0 && tagAud.missingTypes === 0,
  'simActors=' + simExp.actors.length + ', lifeTags=' + lifeRecs.length);

/* Test core/export world + check + binary glTF packer on registered data */
global.KTAGS.page = TAGS;
global.EXPORT.ground({terrainH: (x, z) => FCOVE_LAYOUT.groundAt(x, z, 12, null), step: 16});
global.EXPORT.register('materials', () => [{id: 'fcove:paktong', family: 'metal', kind: 'standard', colour: '#d8d4c8', roughness: 0.28, metal: 0.84}], {by: 'fcove-test'});
global.EXPORT.register('items', () => [{
  id: 'fcove/rotor_blade',
  name: 'rotor_blade',
  kit: 'fcove',
  label: 'Paktong Rotor Blade',
  material: 'fcove:paktong',
  lod: null,
  count: 1,
  dynamic: false,
  geometry: {
    position: global.EXPORT.pack(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])),
    normal: global.EXPORT.pack(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])),
    index: global.EXPORT.pack(new Uint16Array([0, 1, 2]))
  },
  matrices: global.EXPORT.pack(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 20, 8, -20, 1])),
  colours: null,
  extras: {}
}], {by: 'fcove-test'});
global.EXPORT.register('fixtures', () => ({
  format: 'krator-fixtures',
  version: 1,
  records: [{id: 'fix.cradle_deep', uid: '00000001', 'class': 'fixture', kind: 'drydock', parent: 'fcove.cradle_deep', at: [0, -3, 0], ry: 0, size: [20, 50, 9.6], tags: {culture: 'islander'}, host: {wall: null, side: 'outside', sill: 0}}]
}), {by: 'fcove-test'});
global.EXPORT.register('sim', () => Object.assign({}, global.SIM.export(), {
  fcove: {tideSpec: FCOVE_TIDE.SPEC, stocks: WORLD.dayState(90).stocks}
}), {by: 'fcove-test'});

const expWorld = global.EXPORT.world({box: [-700, -900, 900, 750], build: 'settlements/fleetborn-cove', ground: 32});
const expChk = global.EXPORT.check(expWorld, {uid: global.KTAGS.uid, profile: ['registry', 'items', 'materials', 'terrain', 'fixtures', 'sim']});
const expGlb = global.EXPORT.glb(expWorld);
const glbMagic = new DataView(expGlb.glb.buffer, expGlb.glb.byteOffset, expGlb.glb.byteLength).getUint32(0, true);

T.ok('EXPORT.world + EXPORT.check + EXPORT.glb pack valid glTF 2.0 binary (0x46546C67) with 0 errors and 0 broken joins',
  expWorld.errors.length === 0 && expChk.ok && expChk.problems.length === 0 &&
  glbMagic === 0x46546C67 && expGlb.glb.byteLength > 120 && expGlb.json.sim.fcove.tideSpec.meanRange === 11,
  'magic=0x' + glbMagic.toString(16) + ', bytes=' + expGlb.glb.byteLength + ', records=' + expWorld.stats.records);

/* ---------------- 5. NEGATIVE FAULT-INJECTION PROOFS (T.neg) ---------------- */
T.neg('FCOVE_NAMES refuses unknown people key',
  badPeople => {
    try {
      FCOVE_NAMES.citizen({id: 'bad.1', people: badPeople});
      return true;
    } catch (e) {
      return false;
    }
  },
  'martian_squid',
  'shore_kin');

T.neg('floodedCradleCrewFault leaves careening crew submerged at +7.05 m flood, caught by auditState()',
  faultOn => LP.auditState({
    seaLevel: 7.05,
    sillVelocity: 0.2,
    smeltActive: true,
    day: 90,
    activeFleetIds: mootFleets,
    motionSec: 15,
    faults: {floodedCradleCrewFault: faultOn}
  }).ok,
  true,
  false);

T.neg('submergedCausewayFault leaves byssus gatherers underwater on -6.0 m causeway at 0.0 m tide, caught by auditState()',
  faultOn => LP.auditState({
    seaLevel: 0.0,
    sillVelocity: 2.5,
    smeltActive: true,
    day: 90,
    activeFleetIds: mootFleets,
    motionSec: 15,
    faults: {submergedCausewayFault: faultOn}
  }).ok,
  true,
  false);

T.neg('ignoreMootFleetsFault collapses Day 91 Moot crowd swell below 1.8x Neap Day 67',
  faultOn => {
    const s91 = LP.summary({seaLevel: 6.9, day: 91, fcoveWorld: WORLD, faults: {ignoreMootFleetsFault: faultOn}});
    return (s91.totalActive / sumNeap67.totalActive) > 1.8;
  },
  true,
  false);

T.neg('EXPORT.check rejects a profile requiring an unfilled stub section (city)',
  requireStub => {
    const prof = requireStub ? ['registry', 'sim', 'city'] : ['registry', 'sim'];
    return global.EXPORT.check(expWorld, {profile: prof}).ok;
  },
  true,
  false);

T.done();
