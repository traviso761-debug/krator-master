/* Node unit tests for biomes/veiledmountains (VEIL_PHYS, VEIL_SITES, KSTRATA megabreccia, KSPAN, KFROST, KHAZ, CROPS & FAUNA) on tools/ktest.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const ROOT = path.resolve(__dirname, '..', '..', '..');
function loadInGlobal(relPath) {
  const full = path.join(ROOT, relPath);
  vm.runInThisContext(fs.readFileSync(full, 'utf8'), { filename: full });
}

loadInGlobal('core/rand/08-core-rand.js');
loadInGlobal('core/tags/50-core-tags.js');
loadInGlobal('core/tags/52-core-tags-vocab.js');
loadInGlobal('core/biome/37-core-traps.js');
loadInGlobal('core/biome/45-core-span.js');
loadInGlobal('core/terrain/35-core-strata.js');
loadInGlobal('core/terrain/37-core-stacks.js');
loadInGlobal('core/terrain/42-core-frost.js');
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { VEIL_PHYS: PHYS, VEIL_SITES: SITES } = require('../src/15-veil-phys.js');
const VEIL_CROPS = require('../src/22-veil-crops.js');
const VEIL_FAUNA = require('../src/24-veil-fauna.js');

// 1. Omnipresent condensational mist: mistAt > 0 across every station, hour, elevation, and weather mode (never 0!)
{
  let minMist = 1.0, minWet = 1.0;
  for (const sk of ['hall', 'gorge', 'kanopi', 'veilpass', 'southvale']) {
    const st = SITES[sk];
    for (const hr of [0, 5.5, 9.0, 14.0, 20.5]) {
      for (const mode of ['veil', 'sunbreak', 'deepveil']) {
        const m = PHYS.mistAt(0, 0, st, { hour: hr, mode, localY: 4 });
        if (m.totalMist01 < minMist) minMist = m.totalMist01;
        if (m.wetness01 < minWet) minWet = m.wetness01;
      }
    }
  }
  const kanopiPlume = PHYS.mistAt(-24, 0, SITES.kanopi, { hour: 7.0, mode: 'deepveil', localY: 1.5 });
  const hallSun = PHYS.mistAt(80, 90, SITES.hall, { hour: 14.0, mode: 'sunbreak', localY: 18 });
  T.ok('condensational mist never drops to zero (min >= 0.22, wet bark >= 0.55) and intensifies in Kanopi spray plume & deepveil',
    minMist >= 0.22 && minWet >= 0.55 && kanopiPlume.sprayMist01 > 0.80 && kanopiPlume.totalMist01 > hallSun.totalMist01 && kanopiPlume.whiteout);
  T.neg('whiteout sightline (< 28 m) requires dense veil/plunge plume rather than midday sunbreak',
    mode => PHYS.mistAt(-24, 0, SITES.kanopi, { hour: 14.0, mode, localY: 6 }).whiteout,
    'sunbreak',
    'deepveil');
}

// 2. Z1..Z5 altitudinal & topographic stratification (mistfloor, gorge, cloudbelt, alderchute, highcol)
{
  const z1 = PHYS.zoneAt(2380, 0.05, 0.0);
  const z2 = PHYS.zoneAt(2580, 0.86, 0.0);
  const z3 = PHYS.zoneAt(3050, 0.10, 0.0);
  const z4 = PHYS.zoneAt(4050, 0.10, 0.75);
  const z5 = PHYS.zoneAt(5350, 0.05, 0.1);
  T.ok('altitudinal transect partitions cleanly across Z1 mistfloor, Z2 gorge, Z3 cloudbelt, Z4 alderchute, and Z5 highcol',
    z1.zone === 'mistfloor' && z2.zone === 'gorge' && z3.zone === 'cloudbelt' && z4.zone === 'alderchute' && z5.zone === 'highcol');
  T.neg('incised Z2 gorge zone requires high slot confinement rather than open U-valley floor',
    slot => PHYS.zoneAt(2580, slot, 0.0).zone === 'gorge',
    0.05,
    0.86);
}

// 3. Straight nurse-log colonnade lines & cloud-belt epiphyte load
{
  const onLog = PHYS.nurseColonnadeAt(-45, -26, SITES.hall);
  const offLog = PHYS.nurseColonnadeAt(0, -95, SITES.hall);
  const cloudEpi = PHYS.epiphyteLoadAt(2980, 0.88, 0.62);
  const colEpi = PHYS.epiphyteLoadAt(5100, 0.55, 0.50);
  T.ok('nurse-log colonnade lifts stilt-roots along fallen trunks and Z3 cloud-belt maximizes bolsters, drapes, and crimson-chalices',
    onLog.colonnade01 > 0.70 && onLog.stiltLiftM > 0.8 && offLog.colonnade01 === 0 &&
    cloudEpi.bolsterMul > 2.4 && cloudEpi.drapeLenM > 3.5 && cloudEpi.crimsonChalice01 > 0.65 && colEpi.crimsonChalice01 === 0);
  T.neg('crimson-chalice tank epiphytes freeze out on +5,100 m nival cols',
    elev => PHYS.epiphyteLoadAt(elev, 0.80, 0.60).crimsonChalice01 > 0.40,
    5100,
    2980);
}

// 4. Barometric pressure, high-wall hypoxia (< 0.65 atm), KSPAN chasm nurse-logs, KSTACKS megabreccia spires & KFROST stripes
{
  const floorH = PHYS.hypoxiaAt(2380);
  const cragH = PHYS.hypoxiaAt(7600);
  const span = globalThis.KSPAN.solve(SITES.gorge.spanLogs[0].a, SITES.gorge.spanLogs[0].b, { sag: 0.35 });
  const spire = globalThis.KSTACKS.make(Object.assign({ kind: 'spire', y0: 0, seed: 9204 }, SITES.veilpass.spires[0]));
  const frost = globalThis.KFROST.create({ seed: 9204, ground: () => 0, polygons: { cell: 14, trough: 0.28, rim: 0.08 } });
  T.ok('valley floor holds ~1.21 atm breathable air while > +7,450 m crags trigger hypoxia, and KSPAN/KSTACKS/KFROST solve deterministically',
    floorH.pAtm > 1.15 && !floorH.hypoxic && cragH.hypoxic && cragH.pAtm < 0.65 &&
    span.sag > 0.30 && spire.beds.length >= 3 && typeof frost.h(12, -8) === 'number');
}

// 5. KSTRATA megabreccia, KHAZ specs, CROPS.BIOMES.veiledmountains (canPlaid === true!) & 6 VEIL_FAUNA species
{
  for (const sk of ['hall', 'gorge', 'kanopi', 'veilpass', 'southvale']) {
    const st = SITES[sk];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(10, 25, -8);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) {
      throw new Error('KSTRATA megabreccia failed on station ' + sk);
    }
  }
  const hazOk = ['whiteout', 'chasm', 'torrent', 'avalanche', 'hypoxia'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });
  const crops = VEIL_CROPS.queryAll();
  const plaidOk = globalThis.CROPS.canPlaid('veiledmountains') && globalThis.CROPS.canPlaid('veiledmountains', { wool: false });
  T.ok('all 5 megabreccia KSTRATA stacks & 5 KHAZ specs compile, CROPS.canPlaid("veiledmountains") is true, and 6 fauna schedules resolve',
    hazOk && crops.length >= 35 && plaidOk && VEIL_FAUNA.SPECIES.length === 6 &&
    VEIL_FAUNA.stateAt('veil_elk', 8) === 'GRAZE_FERN_GLADE' &&
    VEIL_FAUNA.stateAt('oculus_swallow', 12) === 'WHEEL_SPRAY_PLUME');
}

T.done();
