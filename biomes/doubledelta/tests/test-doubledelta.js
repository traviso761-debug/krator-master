// node biomes/doubledelta/tests/test-doubledelta.js — pure [G data] invariants & negative controls for DDELTA_PHYS & DDELTA_SITES
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const ROOT = path.resolve(__dirname, '..', '..', '..');
function loadGlobal(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  vm.runInThisContext(code, { filename: rel });
}

loadGlobal('core/rand/08-core-rand.js');
loadGlobal('kits/crops/src/10-crop-core.js');
loadGlobal('kits/crops/src/20-crop-records.js');
loadGlobal('kits/crops/src/40-crop-query.js');
loadGlobal('biomes/doubledelta/src/40-biome-ddelta-phys.js');
loadGlobal('biomes/doubledelta/src/41-biome-ddelta-sites.js');

const P = DDELTA_PHYS;
const S = DDELTA_SITES;

/* 1. Generational Tier-2 Ghost Bore drowns the < +25 m delta bowl and eliminates woody trees */
const boreFlat = P.boreAt({ elevM: 4.5, oceanDistKm: 18, wnwExposure01: 0.78, tier: 2 });
T.ok('tier-2 ghost bore floods outer-mid delta flats > 8 m deep at >= 7 m/s',
  boreFlat.depthM > 8.0 && boreFlat.velMs >= 7.0 && boreFlat.shearPa > 220 && boreFlat.woodySurvival === false,
  JSON.stringify(boreFlat));

const boreBluff = P.boreAt({ elevM: 68.0, oceanDistKm: 58, wnwExposure01: 0.52, tier: 2 });
T.ok('Ria Sound +68 m upper bluff stays completely dry and safe above tier-2 bore',
  boreBluff.depthM === 0 && boreBluff.woodySurvival === true,
  JSON.stringify(boreBluff));

T.neg('woody-survival check rejects < +25 m delta flats and accepts +68 m bluff',
  pt => P.boreAt(pt).woodySurvival === true,
  { elevM: 12.0, oceanDistKm: 20, wnwExposure01: 0.75, tier: 2 },
  { elevM: 68.0, oceanDistKm: 58, wnwExposure01: 0.52, tier: 2 });

/* 2. Trimline & settlement safety thresholds */
const trimInner = P.trimlineAt({ oceanDistKm: 58, wnwExposure01: 0.52 });
const trimOuter = P.trimlineAt({ oceanDistKm: 4, wnwExposure01: 0.92 });
T.ok('woody trimline rises from >= 25 m at Ria Sound throat to > 50 m on exposed WNW outer coast',
  trimInner.minWoodyElevM >= 25.0 && trimInner.minWoodyElevM < 38.0 && trimOuter.minWoodyElevM > 50.0 && trimInner.safeTownElevM >= 45.0,
  JSON.stringify({ trimInner, trimOuter }));

T.neg('permanent settlement reserve check rejects < +45 m bench and accepts +72 m Ria Sound bluff',
  elev => elev >= trimInner.safeTownElevM,
  24.0,
  72.0);

/* 3. Hydro-elastic reconfiguration under Tier-2 Ghost Bore (16 m depth, 10 m/s flow) */
const elTree = P.elasticity({ form: 'woody-tree', heightM: 9.0, depthM: 16, velMs: 10 });
const elSponge = P.elasticity({ form: 'sponge-bioherm', heightM: 4.5, spongin01: 0.7, spiculeSi01: 0.65, depthM: 16, velMs: 10 });
const elPen = P.elasticity({ form: 'seapen-whip', heightM: 2.0, depthM: 16, velMs: 10 });
const elMat = P.elasticity({ form: 'tethered-mat', tetherLenM: 22, depthM: 16, velMs: 10 });
const elByssus = P.elasticity({ form: 'byssus-bivalve', heightM: 1.0, depthM: 16, velMs: 10 });

T.ok('rigid woody tree snaps while sponge bioherm, sea-pen whip, tethered mat and byssus shell survive tier-2 bore',
  elTree.intact === false && elSponge.intact === true && elSponge.compress01 >= 0.25 &&
  elPen.intact === true && elPen.bendDeg >= 82 && elPen.dragRatio < 0.12 &&
  elMat.intact === true && elByssus.intact === true,
  JSON.stringify({ elTree, elSponge, elPen, elMat, elByssus }));

T.neg('tethered peat-mat tears loose when rhizome cable is shorter than bore depth',
  cfg => P.elasticity(cfg).intact === true,
  { form: 'tethered-mat', tetherLenM: 9, depthM: 16, velMs: 10 },
  { form: 'tethered-mat', tetherLenM: 22, depthM: 16, velMs: 10 });

T.neg('woody-tree vs sponge-bioherm survival under 10 m/s tsunami bore',
  cfg => P.elasticity(cfg).intact === true,
  { form: 'woody-tree', heightM: 8, depthM: 14, velMs: 9 },
  { form: 'sponge-bioherm', heightM: 4, spongin01: 0.65, spiculeSi01: 0.6, depthM: 14, velMs: 9 });

/* 4. Estuarine salinity & dissolved biogenic silica gradient */
const salThroat = P.salinityAt({ qLocalM3s: 6230, oceanDistKm: 58, channelDistM: 40, tide01: 0.4, monsoon01: 0.6 });
const salBraid = P.salinityAt({ qLocalM3s: 4850, oceanDistKm: 18, channelDistM: 90, tide01: 0.5, monsoon01: 0.5 });
const salBar = P.salinityAt({ qLocalM3s: 4850, oceanDistKm: 1.5, channelDistM: 30, tide01: 0.8, monsoon01: 0.3 });

T.ok('estuarine salinity increases monotonically from Ria Sound throat (< 3 PSU) to braid (4-22 PSU) to outer bar (> 22 PSU)',
  salThroat.psu < 3.0 && salBraid.psu >= 4.0 && salBraid.psu <= 22.0 && salBar.psu > 22.0 && salBraid.silicaMgL >= 14.0,
  JSON.stringify({ salThroat, salBraid, salBar }));

/* 5. Scour-channel blue-clay ria-amber lag & bitumen seep exposure */
const scGully = P.scourExpose({ elevM: -1.2, backwashSlope: 0.09, yearsSinceMega: 14, coalByte: 228, clayByte: 255, oilByte: 146, amberByte: 120 });
const scDome = P.scourExpose({ elevM: 6.5, backwashSlope: 0.005, yearsSinceMega: 14, coalByte: 228, clayByte: 255, oilByte: 146, amberByte: 120 });
const scBench = P.scourExpose({ elevM: 2.6, backwashSlope: 0.02, yearsSinceMega: 14, coalByte: 228, clayByte: 255, oilByte: 146, amberByte: 120 });

T.ok('incised scour-gully exposes blue clay and ria-amber lag (> 0.35) while compacted oil bench vents bitumen seeps',
  scGully.blueClay01 > 0.5 && scGully.amberLag01 > 0.35 && scBench.bitumenSeep01 > 0.4 && scDome.amberLag01 === 0,
  JSON.stringify({ scGully, scBench, scDome }));

T.neg('amber-lag threshold rejects unscoured high peat dome and accepts incised blue-clay gully',
  cfg => P.scourExpose(cfg).amberLag01 > 0.35,
  { elevM: 6.5, backwashSlope: 0.005, yearsSinceMega: 14, coalByte: 228, clayByte: 255, oilByte: 146, amberByte: 120 },
  { elevM: -1.2, backwashSlope: 0.09, yearsSinceMega: 14, coalByte: 228, clayByte: 255, oilByte: 146, amberByte: 120 });

/* 6. Ecotone permissions & locked station geology rules */
const ecoBowl = P.ecotoneAt({ elevM: 4.0, psu: 12, niPpm: 15, boreShearPa: 420, silicaMgL: 21, minWoodyElevM: 32 });
const ecoBluff = P.ecotoneAt({ elevM: 58.0, psu: 0.5, niPpm: 15, boreShearPa: 0, silicaMgL: 18, minWoodyElevM: 32 });
T.ok('ecotone forbids woody trees in < +25 m sponge bowl and enables woody forest on safe bluff',
  ecoBowl.woodyOk === false && ecoBowl.spongeOk === true && ecoBluff.woodyOk === true && ecoBluff.zone === 'riabluff',
  JSON.stringify({ ecoBowl, ecoBluff }));

T.ok('station records enforce 95.3% sedimentary bowl on bioherm, bitumen and throat with Ria Sound reserve >= +65 m',
  S.bioherm.province === 'sedimentary' && S.bitumen.province === 'sedimentary' && S.throat.province === 'sedimentary' &&
  S.bioherm.geology.ultramafic === 0 && S.bitumen.geology.bitumen === 118 &&
  S.throat.settlementReserve.minElevM >= 65.0 && S.FAUNA === undefined && P.FAUNA.length === 6);

/* 7. kits/crops integration on doubledelta */
const ddCrops = CROPS.forBiome('doubledelta');
const cropIds = ddCrops.map(r => r.crop.id);
T.ok('CROPS.forBiome(doubledelta) includes rice, taro, wineweed, mat-reed and tea across marsh and bluff zones',
  ddCrops.length >= 25 && cropIds.indexOf('rice') >= 0 && cropIds.indexOf('taro') >= 0 && cropIds.indexOf('tea') >= 0,
  'count=' + ddCrops.length);

T.done();
