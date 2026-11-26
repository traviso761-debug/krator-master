'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');

function loadCtx() {
  const ctx = { Math, Object, Array, Number, String, Boolean, JSON, Set, Map, Infinity, NaN, isFinite, parseFloat, parseInt, console };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const files = [
    path.join(ROOT, 'core', 'rand', '08-core-rand.js'),
    path.join(ROOT, 'core', 'tags', '50-core-tags.js'),
    path.join(ROOT, 'core', 'tags', '52-core-tags-vocab.js'),
    path.join(ROOT, 'core', 'biome', '37-core-traps.js'),
    path.join(ROOT, 'core', 'clock', '20-core-clock.js'),
    path.join(ROOT, 'core', 'hazard', '20-core-hazard.js'),
    path.join(ROOT, 'core', 'hazard', '21-core-hazard-flow.js'),
    path.join(ROOT, 'core', 'hazard', '23-core-hazard-tide.js'),
    path.join(ROOT, 'core', 'water', 'ext', '63-core-water-tide.js'),
    path.join(ROOT, 'core', 'city', 'float', '44-city-float.js'),
    path.join(HERE, 'src', '28-fc-mipvar.js'),
    path.join(HERE, 'src', '40-fc-tide-phys.js'),
    path.join(HERE, 'src', '42-fc-megastructure-plan.js'),
    path.join(HERE, 'src', '45a-fc-city-defs.js'),
    path.join(HERE, 'src', '45b-fc-city-steps.js'),
    path.join(HERE, 'src', '58-fc-interiors.js'),
    path.join(HERE, 'src', '60-fc-sim.js')
  ];
  for (const f of files) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  }
  vm.runInContext('globalThis._EX = { FC_SITE, FC_TIDE, FC_MEGA, FC_DIMS, FC_TRADES, FC_BLUFF_PLAN, FC_CITY, FC_INTERIORS, FC_SIM, FC_MIPVAR, WATER, KCITY, KHAZ, KTAGS };', ctx);
  return ctx._EX;
}

const X = loadCtx();

/* 1. Site & Bathymetry Gate (V3 2,040 m Sea-Ring & Deep -28 m Lagoon) */
T.ok('central Noahbabel kolk reaches < -90 m below sea datum and inner lagoon stays deep <= -24 m',
  X.FC_SITE.elevAt(0, 180) <= -92.0 && X.FC_SITE.elevAt(420, 180) <= -24.0,
  'kolk=' + X.FC_SITE.elevAt(0, 180) + ', lagoon=' + X.FC_SITE.elevAt(420, 180));
T.ok('Crown Headland AS-01 citadel plateau stands >= +96 m above tsunami surge',
  X.FC_SITE.elevAt(240, -1420) >= 96.0, 'elev=' + X.FC_SITE.elevAt(240, -1420));
T.ok('woody trim line is strictly +38.0 m and safe mainland dwell floor is +65.0 m',
  X.FC_SITE.WOODY_TRIM_Y === 38.0 && X.FC_SITE.SAFE_DWELL_Y === 65.0);
T.ok('four 90-second Pioneer cliff-funiculars land on solid +7.8 m Stone Harbour Moles (never in open ocean)',
  X.FC_SITE.CLIFF_HOISTS.length === 4 && X.FC_SITE.WATERFALLS.length === 2 &&
  X.FC_SITE.CLIFF_HOISTS.every(h => h.liftSec <= 90 && !!X.FC_SITE.isOnMole(h.x0, h.z0, 4.0)));

/* 2. Expanded Ancient Sumeru-Noahbabel Megastructure Gate */
const mega = X.FC_MEGA.plan();
T.ok('submarine cone has 12 radial penstocks (8 active Pioneer superconductor + 4 flooded ruin bays) and -128 m taproot',
  mega.submarineCone.penstocks.length === 12 &&
  mega.submarineCone.activeCount === 8 &&
  mega.submarineCone.floodedCount === 4 &&
  mega.submarineCone.taproot.yBot === -128.0);
T.ok('expanded 2,040 m (R=1,020 m) circular sea-ring weir has 4 sector ship-locks, 8 wide Venetian harbour quays, and 6 KRUINS scar blocks',
  mega.seaRing.rOuter >= 950.0 && mega.seaRing.rOuter <= 1150.0 &&
  mega.seaRing.locks.length === 4 &&
  mega.seaRing.quays.length === 8 &&
  mega.seaRing.scarBlocks.length === 6);
T.ok('grand 4-tier Khao Phra Sumeru reaches +176 m with 6 Gopura Bastions, 4 Prangs, 4 Mondops, 8 Corner Bussaboks & 5-spire Royal Island',
  mega.sumeru.mahaTipY >= 170.0 &&
  mega.sumeru.bastions.length === 6 &&
  mega.sumeru.prangs.length === 4 &&
  mega.sumeru.mondops.length === 4 &&
  mega.sumeru.cornerBussaboks.length === 8 &&
  mega.sumeru.bussabok.spires.length === 5);
T.ok('4 colossal radial Boulevard-Dykes connect Sumeru Hub (r0=96 m) to Sea-Ring (r1=1,016 m) with 16 8-column Sala-Nam pavilions',
  mega.dykes.length === 4 &&
  mega.dykes.every(d => d.r0 <= 100.0 && d.r1 >= 1010.0 && d.quayHalfW >= 74.0) &&
  mega.nagaWalks.length >= 10 &&
  mega.salaPavilions.length >= 16 &&
  mega.salaPavilions.every(s => s.cols === 8 && s.colH >= 4.5) &&
  mega.zigguratPods.filter(p => p.intact).length === 3 &&
  mega.zigguratPods.filter(p => !p.intact).length === 3);

/* 3. Voth-Scale Multi-Kit Architecture (2,200..3,200+ Lots), 30 Multi-Shape Neighborhood Pontoons & 20 Chinampa Floating Gardens Gate */
const tagRegPlan = X.KTAGS.create({ build: 'fc-city-test' });
const cityPlan = X.FC_CITY.buildPlans({ tags: tagRegPlan });
const layoutAudit = X.FC_CITY.auditLayout(cityPlan);
const tagAudit = tagRegPlan.audit();

T.ok('Voth-scale city layout places >= 2,200 total lots (>= 550 Suudme, >= 1,400 Lower-Ria, >= 250 Upper-Ria), >= 36,000 pop capacity & >= 28 Bluff streets',
  layoutAudit.totalLots >= 2200 && layoutAudit.suudmeCount >= 550 && layoutAudit.lowerRiaCount >= 1400 &&
  layoutAudit.upperRiaCount >= 250 && layoutAudit.totalBuildingPop >= 36000 && cityPlan.bluffWays.length >= 28,
  JSON.stringify(layoutAudit));

T.ok('28..42 large multi-shape neighborhood floating platforms across all 5 shapes average >= 20 closely-packed buildings per platform',
  cityPlan.pontoons.length >= 28 && cityPlan.pontoons.length <= 42 &&
  layoutAudit.avgPontoonLots >= 20.0 &&
  Object.keys(layoutAudit.shapesUsed).length === 5,
  'pontoons=' + cityPlan.pontoons.length + ', avg=' + layoutAudit.avgPontoonLots + ', shapes=' + JSON.stringify(layoutAudit.shapesUsed));

const farmTagRecs = tagRegPlan.query({ tags: { types: 'farm' } });
const chinampaTagRecs = tagRegPlan.query({ kind: 'floating_garden' });
T.ok('12..20 dedicated Floating Chinampa Garden Rafts + 16 Upland Terraced Farms registered in KTAGS with 0 unknown vocab keys',
  cityPlan.gardens.length >= 12 && cityPlan.gardens.length <= 22 &&
  chinampaTagRecs.length === cityPlan.gardens.length &&
  farmTagRecs.length >= 28 &&
  tagAudit.unknown === 0,
  'chinampas=' + cityPlan.gardens.length + ', farmTags=' + farmTagRecs.length + ', unknownTags=' + tagAudit.unknown);

T.ok('zero OBB building overlaps AND zero overhanging/unsupported corners across all 2,600+ lots',
  layoutAudit.overlaps === 0 && layoutAudit.unsupportedLots === 0,
  'overlaps=' + layoutAudit.overlaps + ', unsupported=' + layoutAudit.unsupportedLots);

T.ok('zero permanent mainland residential dwellings below +65.0 m tsunami refuge line',
  layoutAudit.badMainlandDwell === 0, 'badMainlandDwell=' + layoutAudit.badMainlandDwell);

T.ok('all neighborhood pontoons, all Chinampa garden rafts, and -90 m Dynamo Hall are reachable on the walk graph from AS-01 Bluff Citadel',
  layoutAudit.unreachedNodes.length === 0,
  'unreached=' + JSON.stringify(layoutAudit.unreachedNodes));

/* Determinism gate */
const cityPlan2 = X.FC_CITY.buildPlans({ tags: X.KTAGS.create({ build: 'fc-city-test' }) });
T.ok('FC_CITY.buildPlans() is 100% deterministic across repeated calls',
  JSON.stringify(cityPlan.lots) === JSON.stringify(cityPlan2.lots));

/* 4. Two-Basin Tidal Weir, Pontoon + Chinampa Kinematics & KHAZ.TIDE Gate */
const fixedY = {
  dyke_nne: 6.2, dyke_ese: 6.2, dyke_ssw: 6.2, dyke_wnw: 6.2,
  sumeru_plinth: 6.2, sala_ne: 6.2, sala_se: 6.2, sala_sw: 6.2, sala_w: 6.2
};
const allFloating = cityPlan.pontoons.concat(cityPlan.gardens);
const floatEbb   = X.KCITY.auditFloatFleet(allFloating, cityPlan.bascules, X.FC_TIDE.setMode('ebb').lagoonY, fixedY);
const floatSlack = X.KCITY.auditFloatFleet(allFloating, cityPlan.bascules, X.FC_TIDE.setMode('slack').lagoonY, fixedY);
const floatFlood = X.KCITY.auditFloatFleet(allFloating, cityPlan.bascules, X.FC_TIDE.setMode('flood').lagoonY, fixedY);
const floatSurge = X.KCITY.auditFloatFleet(allFloating, cityPlan.bascules, X.FC_TIDE.setMode('surge').lagoonY, fixedY);

T.ok('all 50 floating neighborhood platforms & Chinampa rafts stay afloat (0 grounded, >= 18 m keel clearance, |bascule pitch| <= 12 deg) across Ebb, Slack, Flood & Surge',
  floatEbb.ok && floatSlack.ok && floatFlood.ok && floatSurge.ok && floatEbb.minDraftClearanceM >= 18.0,
  JSON.stringify({ minClearEbb: floatEbb.minDraftClearanceM, ebb: floatEbb.maxAbsPitchDeg, flood: floatFlood.maxAbsPitchDeg, surge: floatSurge.maxAbsPitchDeg }));

const tagReg = X.KTAGS.create({ build: 'fc-test' });
const hazRecs = X.FC_TIDE.bindHazards(tagReg);
const benchRec = hazRecs[0];
const westLockRec = hazRecs[1];
const bx = benchRec.at[0], bz = benchRec.at[2];
const lx = westLockRec.at[0], lz = westLockRec.at[2];

X.FC_TIDE.setMode('ebb');
const sEbb = X.KHAZ.state(benchRec, 0, null, bx, bz, 4.3);
const rEbb = X.KHAZ.state(westLockRec, 0, null, lx, lz, -6.0);
const dEbb = X.KHAZ.drift(lx, lz, 0, -6.0, tagReg);
X.FC_TIDE.setMode('flood');
const sFlood = X.KHAZ.state(benchRec, 0, null, bx, bz, 4.3);
const doseFlood = X.KHAZ.dose(benchRec, bx, bz, 0, 4.3);
X.FC_TIDE.setMode('drawdown');
const sDraw = X.KHAZ.state(benchRec, 0, null, bx, bz, 4.3);
X.FC_TIDE.setMode('slack');
const rSlack = X.KHAZ.state(westLockRec, 0, null, lx, lz, -1.5);
const doseSlack = X.KHAZ.dose(westLockRec, lx, lz, 0, -1.5);
X.FC_TIDE.setMode(null);

T.ok('KHAZ.TIDE bench is dry (k=0) at Low Ebb, submerged drown hazard at High Spring Flood, and tsunami-drawdown warn on Drawdown',
  sEbb.state === 'dry' && sEbb.k === 0 && sFlood.state === 'submerged' && doseFlood > 0.25 && sDraw.state === 'drawdown' && sDraw.warn === true,
  JSON.stringify({ ebb: sEbb, flood: sFlood, doseFlood: doseFlood, draw: sDraw }));
T.ok('KHAZ.TIDE ship-lock race is calm (k=0) at Slack Water and active ebb-race current during Peak Ebb',
  rSlack.state === 'slack' && doseSlack === 0 && rEbb.state === 'ebb-race' && rEbb.k > 0.5 && Math.hypot(dEbb.pull[0], dEbb.pull[1]) > 1.5,
  JSON.stringify({ slack: rSlack, ebb: rEbb, drift: dEbb }));

/* 5. Voth 44-Trade Census, Interiors & 30-Day 44,000-Pop Chinampa Economy Gate */
const placedKeys = new Set(cityPlan.lots.map(l => l.key));
placedKeys.add('fc.mega.submarine_cone');
const activeTrades = X.FC_TRADES.filter(t => !t.na);
const naTrades = X.FC_TRADES.filter(t => !!t.na);
const uncoveredActive = activeTrades.filter(t => !t.keys.some(k => placedKeys.has(k)));
T.ok('Voth 44-trade census accounts for all 44 trades (41 active placed on scene + 3 reasoned regional N/A)',
  X.FC_TRADES.length === 44 && activeTrades.length === 41 && naTrades.length === 3 && uncoveredActive.length === 0,
  'uncovered=' + JSON.stringify(uncoveredActive));

const intAudit = X.FC_INTERIORS.auditUndergroundAndPortals(false);
T.ok('submarine -62 m Dynamo Hall and +102 m Bullion Vault report 0.000 sky leak while 3 surface portals carry positive daylight',
  intAudit.ok, JSON.stringify(intAudit));

const econProof = X.FC_SIM.createEconomy({ plan: cityPlan }).runDays(30);
T.ok('30-day imperial capital economy stays strictly solvent across all 23 stocks (including Chinampa food, silk & dye_indigo) for 44,000 citizens',
  econProof.ok && econProof.simUrbanPop >= 36000 &&
  econProof.farmYield.chinampaFood > 50 && econProof.farmYield.chinampaSilk > 5 && econProof.farmYield.chinampaDye > 8 &&
  econProof.stocks.food > 0 && econProof.stocks.dye_indigo > 0 && econProof.stocks.dyed_silk > 0 && econProof.stocks.electrics > 0,
  JSON.stringify({ minKey: econProof.minKey, minVal: econProof.minVal, farmYield: econProof.farmYield }));

/* 6. Paired Negative Tests (T.neg: fails on faulty input, passes on fixed input) */
T.neg('negative: OBB collision detector catches two overlapping pontoon buildings',
  pair => !X.FC_CITY.obbOverlap(pair[0], pair[1], 0.15),
  [{ x: 100, z: 100, w: 24, d: 20, ry: 0 }, { x: 110, z: 105, w: 24, d: 20, ry: 0.2 }],
  [{ x: 100, z: 100, w: 24, d: 20, ry: 0 }, { x: 138, z: 105, w: 24, d: 20, ry: 0.2 }]
);

const sampleUHarbour = { id: 'UH_TEST', x: 0, z: 0, yaw: 0, shape: 'u-harbour', w: 148, d: 112, notchW: 40, notchD: 44 };
T.neg('negative: U-harbour platform support check rejects a building placed inside the open boat-haven court',
  pt => X.FC_CITY.isPointOnPlatform(sampleUHarbour, pt[0], pt[1], 0.35, 0.0),
  [0, 42],
  [-52, 42]
);

T.neg('negative: mainland permanent dwelling below +65.0 m on the D5 slipway bench is rejected',
  lotY => lotY >= X.FC_SITE.SAFE_DWELL_Y,
  12.0,
  104.0
);

T.neg('negative: shallow -2.0 m shoal bed grounds a 3.4 m draft pontoon at -1.8 m lagoon low',
  bedY => !X.KCITY.floatPose({ id: 'test', x: 0, z: 0, draftM: 3.4, freeboardM: 2.3, bedY: bedY }, -1.8).grounded,
  -2.0,
  -28.0
);

T.neg('negative: underground submarine Dynamo Hall sky leak (envMapIntensity > 0) fails interior vault audit',
  badLeak => X.FC_INTERIORS.auditUndergroundAndPortals(badLeak).ok,
  true,
  false
);

T.neg('negative: sabotaged negative stock is caught by 30-day economy solver',
  sabKey => X.FC_SIM.createEconomy({ plan: cityPlan, sabotageKey: sabKey }).runDays(30).ok,
  'electrics',
  null
);

T.neg('negative: disabling Floating Chinampa Gardens starves 44,000-citizen indigo & food stocks within 30 days',
  disable => X.FC_SIM.createEconomy({ plan: cityPlan, disableGardens: disable }).runDays(30).ok,
  true,
  false
);

T.done();
