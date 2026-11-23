/* Node unit tests for biomes/spiderlake (SPIDER_PHYS, SPIDER_SITES, slSilkMath pin invariants, crops & fauna) on tools/ktest.js. */
'use strict';
const T = require('../../../tools/ktest.js')(__filename);

require('../../../core/rand/08-core-rand.js');
const PHYS = require('../src/40-biome-spider-phys.js');
const SITES = require('../src/41-biome-spider-sites.js');

// 1. Unified 1.33 atm / 0.28 atm O2 lake-level aerodynamics & 0.75 g bridge-casting (PLAN.md section 7.2 #1)
{
  const lake = PHYS.aerodynamicsAt({elevM: 1460.0, windSpeedMs: 4.8, threadDiaUm: 4.2, spanM: 180.0, anchorHighM: 25.0, curtainDropM: 12.0});
  const rampart = PHYS.aerodynamicsAt({elevM: 2040.0, windSpeedMs: 4.8, threadDiaUm: 4.2, spanM: 180.0, anchorHighM: 25.0, curtainDropM: 12.0});
  const thinAlpine = PHYS.aerodynamicsAt({elevM: 6400.0, windSpeedMs: 1.5, threadDiaUm: 8.5, spanM: 180.0, anchorHighM: 25.0, curtainDropM: 12.0});

  T.ok('+1,460.0 m lake datum locks P = 1.333 +- 0.005 atm, pO2 = 0.280 +- 0.003 atm, rho = 1.56 +- 0.02 kg/m3',
    Math.abs(lake.pAtm - 1.333) <= 0.005 &&
    Math.abs(lake.pO2Atm - 0.280) <= 0.003 &&
    Math.abs(lake.rhoKgM3 - 1.560) <= 0.02 &&
    Math.abs(lake.dragLiftRatio - 1.77) <= 0.03);
  T.ok('+1,460 m dense hyperoxic air supports maxCastSpanM >= 220 m and boatClearanceM >= 6.5 m',
    lake.maxCastSpanM >= 220.0 && lake.boatClearanceM >= 6.5 && lake.tensileGPa === 1.3);
  T.ok('+2,040 m North Rampart crest drops barometric pressure to ~1.24 atm',
    Math.abs(rampart.pAtm - 1.240) <= 0.01);
  T.neg('thin < 0.75 atm alpine air with heavy thread fails 220 m bridge-casting threshold (< 90 m)',
    inp => PHYS.aerodynamicsAt(inp).maxCastSpanM >= 90.0,
    {elevM: 6400.0, windSpeedMs: 1.5, threadDiaUm: 8.5, spanM: 180.0},
    {elevM: 1460.0, windSpeedMs: 4.8, threadDiaUm: 4.2, spanM: 180.0});
}

// 2. ATMOS wind-pinned silk integrity: 0.000 m anchor drift under any gale (PLAN.md section 7.2 #2)
{
  const pinLeft = PHYS.silkPinWeight('bridgecurtain', 0.0, 0.5);
  const pinRight = PHYS.silkPinWeight('bridgecurtain', 1.0, 0.5);
  const pinBelly = PHYS.silkPinWeight('bridgecurtain', 0.5, 0.5);
  const weirEdge0 = PHYS.silkPinWeight('weirframe_wild', 0.0, 0.4);
  const weirEdge1 = PHYS.silkPinWeight('weirframe_wild', 0.6, 1.0);
  const weirCenter = PHYS.silkPinWeight('weirframe_wild', 0.5, 0.5);

  const driftAnchor = PHYS.displaceSilk(-28, 25, -68, 0, 0, 0, 14.2, 9.5, 4.2, 0.85);
  const driftBelly = PHYS.displaceSilk(0, 18, 0, 0.35 * pinBelly, 0.05 * pinBelly, 0.9 * pinBelly, 14.2, 9.5, 4.2, 0.85);
  const bellyMag = Math.hypot(driftBelly[0], driftBelly[1], driftBelly[2]);

  T.ok('bridgecurtain and weirframe_wild pin weights are strictly 0 at all rock/tree/crossbar anchors and > 0.4 in sheet belly',
    pinLeft === 0 && pinRight === 0 && pinBelly > 0.85 &&
    weirEdge0 === 0 && weirEdge1 === 0 && weirCenter > 0.40);
  T.ok('ATMOS silk displacement is exact [0, 0, 0] at pinned anchor vertices while belly billows downwind',
    driftAnchor[0] === 0 && driftAnchor[1] === 0 && driftAnchor[2] === 0 && bellyMag > 0.5);
  T.neg('pinned silk anchor vertex never drifts > 0 under extreme 25 m/s gale',
    inp => {
      const w = PHYS.silkPinWeight(inp.kind, inp.u, inp.v);
      const d = PHYS.displaceSilk(10, 20, 30, w, 0, w, 7.3, 22.0, -12.0, 1.0);
      return Math.hypot(d[0], d[1], d[2]) > 1e-6;
    },
    {kind: 'bridgecurtain', u: 0.0, v: 0.5},
    {kind: 'bridgecurtain', u: 0.5, v: 0.5});
}

// 3. Hydrothermal "Lake-Smoke" trophic gradient & North Rampart eusocial cutoff (PLAN.md section 7.2 #4)
{
  const fenDusk = PHYS.lakeSmokeAt({shoreDistM: 25, elevAboveLakeM: 2, seepProximity01: 0.96, hour24: 19.0, windOnshore01: 0.85});
  const pavilionDay = PHYS.lakeSmokeAt({shoreDistM: 160, elevAboveLakeM: 18, seepProximity01: 0.66, hour24: 13.0, windOnshore01: 0.75});
  const northRampart = PHYS.lakeSmokeAt({shoreDistM: 3600, elevAboveLakeM: 580, seepProximity01: 0.0, hour24: 19.0, windOnshore01: 0.5});

  T.ok('Stations 1-4 sustain midgeFlux >= 12 g/m2/day, ~280-315 m dusk lake-smoke pillars, and eusocial 20k-250k colonies',
    fenDusk.midgeFluxGm2Day >= 30.0 && fenDusk.pillarHeightM >= 270.0 && fenDusk.eusocialOk === true &&
    pavilionDay.midgeFluxGm2Day >= 12.0 && pavilionDay.eusocialOk === true);
  T.ok('+2,040 m North Rampart sits above the midge line with 0 eusocial colony capacity',
    northRampart.midgeFluxGm2Day === 0 && northRampart.eusocialOk === false && northRampart.colonyPopCap === 0);
  T.neg('high dry ramparts (> +400 m above lake, > 2.5 km from shore) reject eusocial brood-pavilions',
    inp => PHYS.lakeSmokeAt(inp).eusocialOk === true,
    {shoreDistM: 3200, elevAboveLakeM: 520, seepProximity01: 0.0, hour24: 19.0},
    {shoreDistM: 80, elevAboveLakeM: 12, seepProximity01: 0.75, hour24: 19.0});
}

// 4. Zero-Kill Hum & Smudge 6-day rotational harvest covenant (PLAN.md section 2.4 & CROOK-RIA-DECISIONS.md section 2.5.5)
{
  const calmDay6 = PHYS.harvestCycleAt({dayMod6: 5, smudgeActive01: 0.95, humFreqHz: 132.0, strikingBrood: false});
  const uncalmed = PHYS.harvestCycleAt({dayMod6: 5, smudgeActive01: 0.0, humFreqHz: 40.0, strikingBrood: false});
  const taboo = PHYS.harvestCycleAt({dayMod6: 5, smudgeActive01: 1.0, humFreqHz: 132.0, strikingBrood: true});

  T.ok('132 Hz Hum resonance + porphyryfern smudge peacefully retreats workers for zero-kill reeling',
    calmDay6.workersRetreated === true && calmDay6.reelReady === true && calmDay6.broodUnharmed === true && calmDay6.killYield === 0);
  T.ok('uncalmed frames hold active riggers while keeping broodUnharmed === true',
    uncalmed.workersRetreated === false && uncalmed.broodUnharmed === true);
  T.neg('striking brood-domes or omitting smudge/Hum fails peaceful reelReady check',
    inp => { const h = PHYS.harvestCycleAt(inp); return h.reelReady === true && h.broodUnharmed === true; },
    {dayMod6: 5, smudgeActive01: 1.0, humFreqHz: 132.0, strikingBrood: true},
    {dayMod6: 5, smudgeActive01: 0.95, humFreqHz: 132.0, strikingBrood: false});
  if (taboo.tabooViolated !== true) throw new Error('expected tabooViolated on strikingBrood');
}

// 5. Hydrological divide, single SW outlet & thermal degumming pool separation (PLAN.md section 7.2 #3 & #4)
{
  const stationKeys = ['spillway', 'narrows', 'pavilion', 'fen', 'dolomite', 'rampart'];
  const outlets = stationKeys.filter(k => (SITES[k].outflowM3s || 0) > 0);
  const fenPools = SITES.fen.thermalPools;
  const allFenAboveLake = fenPools.every(p => p.level >= SITES.fen.lakeLevelLocal + 0.10);
  const brineApron = PHYS.mvtBrineAt({ventDistM: 10.0, depthBelowRimM: 28.0, zincByte: 190, limestoneByte: 255});

  T.ok('Spider Lake exits via a single unbifurcated 380 m3/s SW breach at (1272, 193) while North Rampart has 0 surface outflow',
    outlets.length === 1 && outlets[0] === 'spillway' && SITES.spillway.outflowM3s === 380.0 &&
    SITES.rampart.hasOpenLake === false && SITES.rampart.outflowM3s === 0.0);
  T.ok('all Station 4 fen thermal degumming spring planes sit >= +0.10 m above +1,460.0 m WATER.open lake datum',
    fenPools.length >= 4 && allFenAboveLake);
  T.ok('alkaline carbonate seep apron (+38-41 C, pH > 8.1) degums sericin safely and saturates celestine/calcite in tube_ozarks_15',
    brineApron.degumSafeOk === true && brineApron.celestineSat01 >= 0.7);
  T.neg('vent throat >= +43 C triggers thermal scald warning rather than safe hand-degumming apron',
    inp => PHYS.mvtBrineAt(inp).degumSafeOk === true,
    {ventDistM: 0.2, depthBelowRimM: 28.0, zincByte: 190, limestoneByte: 255},
    {ventDistM: 10.0, depthBelowRimM: 28.0, zincByte: 190, limestoneByte: 255});
}
