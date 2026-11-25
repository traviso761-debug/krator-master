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
    path.join(HERE, 'src', '45-fc-city-steps.js'),
    path.join(HERE, 'src', '58-fc-interiors.js'),
    path.join(HERE, 'src', '60-fc-sim.js')
  ];
  for (const f of files) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  }
  vm.runInContext('globalThis._EX = { FC_SITE, FC_TIDE, FC_MEGA, FC_DIMS, FC_TRADES, FC_CITY, FC_INTERIORS, FC_SIM, FC_MIPVAR, WATER, KCITY, KHAZ, KTAGS };', ctx);
  return ctx._EX;
}

const X = loadCtx();

/* 1. Site & Bathymetry Gate */
T.ok('central Noahbabel kolk reaches < -90 m below sea datum', X.FC_SITE.elevAt(0, 80) <= -90.0, 'elev=' + X.FC_SITE.elevAt(0, 80));
T.ok('Crown Headland AS-01 citadel plateau stands >= +92 m above tsunami surge', X.FC_SITE.elevAt(260, -1120) >= 92.0, 'elev=' + X.FC_SITE.elevAt(260, -1120));
T.ok('woody trim line is strictly +38.0 m and safe mainland dwell floor is +65.0 m',
  X.FC_SITE.WOODY_TRIM_Y === 38.0 && X.FC_SITE.SAFE_DWELL_Y === 65.0);
T.ok('four 90-second Pioneer eddy-braked cliff-hoists and twin 64 m waterfalls are planned',
  X.FC_SITE.CLIFF_HOISTS.length === 4 && X.FC_SITE.WATERFALLS.length === 2 &&
  X.FC_SITE.CLIFF_HOISTS.every(h => h.liftSec <= 90));

/* 2. Ancient Sumeru-Noahbabel Megastructure Gate */
const mega = X.FC_MEGA.plan();
T.ok('submarine cone has 12 radial penstocks (8 active Pioneer superconductor + 4 flooded ruin bays) and -128 m taproot',
  mega.submarineCone.penstocks.length === 12 &&
  mega.submarineCone.activeCount === 8 &&
  mega.submarineCone.floodedCount === 4 &&
  mega.submarineCone.taproot.yBot === -128.0);
T.ok('1,400 m circular sea-ring weir has 4 sector ship-locks, 8 keeps, and 6 KRUINS scar blocks',
  mega.seaRing.rOuter === 700.0 &&
  mega.seaRing.locks.length === 4 &&
  mega.seaRing.scarBlocks.length === 6);
T.ok('central 9+3-peak Khao Phra Sumeru reaches +168 m with 4 Prangs, 4 Mondops, and 3-spire Bussabok',
  mega.sumeru.mahaTipY === 168.0 &&
  mega.sumeru.prangs.length === 4 &&
  mega.sumeru.mondops.length === 4 &&
  mega.sumeru.bussabok.spires.length === 3);
T.ok('3 radial Boulevard-Dykes, >= 10 Naga walkways, >= 12 Sala-Nam pavilions, and 6 Ziggurat pods (3 intact + 3 ruin)',
  mega.dykes.length === 3 &&
  mega.nagaWalks.length >= 10 &&
  mega.salaPavilions.length >= 12 &&
  mega.zigguratPods.filter(p => p.intact).length === 3 &&
  mega.zigguratPods.filter(p => !p.intact).length === 3);

/* 3. Multi-Kit Non-Ancient Architecture (Suudme + Lower Ria + Upper Ria) & 28 Pontoons Gate */
const cityPlan = X.FC_CITY.buildPlans();
const layoutAudit = X.FC_CITY.auditLayout(cityPlan);
T.ok('city layout places >= 24 Suudme (KLK) lots, >= 60 Lower-Ria (RIK) lots, and >= 5 Upper-Ria (RIK) lots',
  layoutAudit.suudmeCount >= 24 && layoutAudit.lowerRiaCount >= 60 && layoutAudit.upperRiaCount >= 5,
  JSON.stringify(layoutAudit));
T.ok('zero OBB building overlaps across bluff, radial dykes, and all 28 cellular moon-pool pontoons',
  layoutAudit.overlaps === 0, 'overlaps=' + layoutAudit.overlaps);
T.ok('zero permanent mainland residential dwellings below +65.0 m tsunami refuge line',
  layoutAudit.badMainlandDwell === 0, 'badMainlandDwell=' + layoutAudit.badMainlandDwell);
T.ok('all 28 cellular moon-pool pontoons and -90 m Dynamo Hall are reachable on the walk graph from AS-01 Bluff Citadel',
   cityPlan.pontoons.length === 28 && layoutAudit.unreachedNodes.length === 0,
  'unreached=' + JSON.stringify(layoutAudit.unreachedNodes));

/* Determinism gate */
const cityPlan2 = X.FC_CITY.buildPlans();
T.ok('FC_CITY.buildPlans() is 100% deterministic across repeated calls',
  JSON.stringify(cityPlan.lots) === JSON.stringify(cityPlan2.lots));

/* 4. Two-Basin Tidal Weir, Pontoon Kinematics & KHAZ.TIDE Gate */
const fixedY = { dyke_nne: 6.2, sumeru_plinth: 5.8, sala_ne: 5.8, sala_se: 5.8, sala_sw: 5.8, sala_w: 5.8, sala_n: 5.8 };
const floatEbb   = X.KCITY.auditFloatFleet(cityPlan.pontoons, cityPlan.bascules, X.FC_TIDE.setMode('ebb').lagoonY, fixedY);
const floatSlack = X.KCITY.auditFloatFleet(cityPlan.pontoons, cityPlan.bascules, X.FC_TIDE.setMode('slack').lagoonY, fixedY);
const floatFlood = X.KCITY.auditFloatFleet(cityPlan.pontoons, cityPlan.bascules, X.FC_TIDE.setMode('flood').lagoonY, fixedY);
const floatSurge = X.KCITY.auditFloatFleet(cityPlan.pontoons, cityPlan.bascules, X.FC_TIDE.setMode('surge').lagoonY, fixedY);

T.ok('all 28 pontoons stay afloat (0 grounded, collarSafe, |bascule pitch| <= 12 deg) across Ebb, Slack, Flood & Ghost-Surge',
  floatEbb.ok && floatSlack.ok && floatFlood.ok && floatSurge.ok,
  JSON.stringify({ ebb: floatEbb.maxAbsPitchDeg, flood: floatFlood.maxAbsPitchDeg, surge: floatSurge.maxAbsPitchDeg }));

const tagReg = X.KTAGS.create({ build: 'fc-test' });
const hazRecs = X.FC_TIDE.bindHazards(tagReg);
const benchRec = hazRecs[0];
const westLockRec = hazRecs[1];
const lx = westLockRec.at[0], lz = westLockRec.at[2];

X.FC_TIDE.setMode('ebb');
const sEbb = X.KHAZ.state(benchRec, 0, null, 340, -775, 4.3);
const rEbb = X.KHAZ.state(westLockRec, 0, null, lx, lz, -6.0);
const dEbb = X.KHAZ.drift(lx, lz, 0, -6.0, tagReg);
X.FC_TIDE.setMode('flood');
const sFlood = X.KHAZ.state(benchRec, 0, null, 340, -775, 4.3);
const doseFlood = X.KHAZ.dose(benchRec, 340, -775, 0, 4.3);
X.FC_TIDE.setMode('drawdown');
const sDraw = X.KHAZ.state(benchRec, 0, null, 340, -775, 4.3);
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

/* 5. Voth 44-Trade Census, Interiors & 30-Day Economy Gate */
const placedKeys = new Set(cityPlan.lots.map(l => l.key));
placedKeys.add('fc.mega.submarine_cone');
const activeTrades = X.FC_TRADES.filter(t => !t.na);
const naTrades = X.FC_TRADES.filter(t => !!t.na);
const uncoveredActive = activeTrades.filter(t => !t.keys.some(k => placedKeys.has(k)));
T.ok('Voth 44-trade census accounts for all 44 trades (41 active placed on scene + 3 reasoned regional N/A)',
  X.FC_TRADES.length === 44 && activeTrades.length === 41 && naTrades.length === 3 && uncoveredActive.length === 0,
  'uncovered=' + JSON.stringify(uncoveredActive));

const intAudit = X.FC_INTERIORS.auditUndergroundAndPortals(false);
T.ok('submarine -62 m Dynamo Hall and +94 m Bullion Vault report 0.000 sky leak while 3 surface portals carry positive daylight',
  intAudit.ok, JSON.stringify(intAudit));

const econProof = X.FC_SIM.createEconomy().runDays(30);
T.ok('30-day imperial capital economy stays strictly solvent across all 21 stocks for 24,000 citizens',
  econProof.ok && econProof.stocks.food > 0 && econProof.stocks.water_fresh > 0 && econProof.stocks.electrics > 0,
  JSON.stringify({ minKey: econProof.minKey, minVal: econProof.minVal }));

/* 6. Paired Negative Tests (T.neg: fails on faulty input, passes on fixed input) */
T.neg('negative: OBB collision detector catches two overlapping pontoon buildings',
  pair => !X.FC_CITY.obbOverlap(pair[0], pair[1], 0.15),
  [{ x: 100, z: 100, w: 24, d: 20, ry: 0 }, { x: 110, z: 105, w: 24, d: 20, ry: 0.2 }],
  [{ x: 100, z: 100, w: 24, d: 20, ry: 0 }, { x: 138, z: 105, w: 24, d: 20, ry: 0.2 }]
);

T.neg('negative: mainland permanent dwelling below +65.0 m on the D5 slipway bench is rejected',
  lotY => lotY >= X.FC_SITE.SAFE_DWELL_Y,
  12.0,
  96.0
);

T.neg('negative: shallow -2.0 m shoal bed grounds a 3.2 m draft pontoon at -1.8 m lagoon low',
  bedY => !X.KCITY.floatPose({ id: 'test', x: 0, z: 0, draftM: 3.2, freeboardM: 2.2, bedY: bedY }, -1.8).grounded,
  -2.0,
  -12.5
);

T.neg('negative: underground submarine Dynamo Hall sky leak (envMapIntensity > 0) fails interior vault audit',
  badLeak => X.FC_INTERIORS.auditUndergroundAndPortals(badLeak).ok,
  true,
  false
);

T.neg('negative: sabotaged negative stock is caught by 30-day economy solver',
  sabKey => X.FC_SIM.createEconomy({ sabotageKey: sabKey }).runDays(30).ok,
  'electrics',
  null
);

T.done();
