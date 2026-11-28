/* Node unit tests for biomes/swouterwall (SWOW_PHYS, SWOW_SITES, KSTRATA, KFROST, KHAZ, CROPS & FAUNA) on tools/ktest.js. */
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
loadInGlobal('core/terrain/35-core-strata.js');
loadInGlobal('core/terrain/42-core-frost.js');
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { SWOW_PHYS: PHYS, SWOW_SITES: SITES } = require('../src/15-swow-phys.js');
const SW_CROPS = require('../src/22-swow-crops.js');
const SW_FAUNA = require('../src/24-swow-fauna.js');

// 1. Barometric pressure curve & 0.60 atm hypoxia ceiling across all 4 stations
{
  const pBoreal = PHYS.pressureAt(3040);
  const pMoraine = PHYS.pressureAt(4360);
  const pTrigemini = PHYS.pressureAt(5680);
  const pBreathFloor = PHYS.pressureAt(6100);
  const pHeadwall = PHYS.pressureAt(6520);
  const pCrest = PHYS.pressureAt(8746);

  T.ok('pressureAt(elevM) steps monotonically from ~1.10 atm in north boreal lakes to ~0.76 atm at Trigemini and < 0.60 atm on southern headwalls',
    pBoreal > 1.07 && pBoreal < 1.13 &&
    pMoraine > 0.88 && pMoraine < 0.94 &&
    pTrigemini > 0.74 && pTrigemini <= 0.77 &&
    pBreathFloor > 0.66 && pBreathFloor < 0.72 &&
    pHeadwall < 0.60 && pHeadwall >= 0.58 &&
    pCrest < 0.30 &&
    PHYS.HYPOXIA_CEILING_M > 6350 && PHYS.HYPOXIA_CEILING_M < 6550);

  T.neg('hypoxia lethal ceiling (< 0.60 atm) is crossed only above the +6,100 m breath-vale floor',
    elev => PHYS.pressureAt(elev) < PHYS.HYPOXIA_LETHAL_ATM,
    6100,
    6520);
}

// 2. North-to-south Veil-spill boreal-to-hypoxic transect (Belt A -> Belt B -> Belt C -> O)
{
  const north = PHYS.transectAt(904, 3040);
  const mid = PHYS.transectAt(1024, 4360);
  const pass = PHYS.transectAt(1120, 5680);
  const rim = PHYS.transectAt(1213, 6600);

  T.ok('transectAt resolves Dfc/Dfb Veil-spill boreal lakes in north, ET moraine bench in mid-north, hypoxic ET/HT pass at Trigemini, and O above headwall',
    (north.koppen === 'Dfc' || north.koppen === 'Dfb') && north.veilSpill01 > 0.85 && north.belt === 'A_boreal' && !north.hypoxic &&
    mid.koppen === 'ET' && mid.belt === 'B_moraine' && !mid.hypoxic &&
    (pass.koppen === 'ET' || pass.koppen === 'HT') && pass.belt === 'C_hypoxic' && pass.hypoxic && !pass.lethalHypoxia &&
    rim.koppen === 'O' && rim.belt === 'O_airless' && rim.lethalHypoxia);
}

// 3. Glacial lake ice-margin cover (iceShareAt) & katabatic open lead on +5,680 m Trigemini Tarn
{
  const iceBoreal = PHYS.iceShareAt(3040, 0.0, 0.25);
  const iceMoraine = PHYS.iceShareAt(4360, 0.15, 0.30);
  const iceTrigemini = PHYS.iceShareAt(5680, 0.20, 0.75);
  const iceBreath = PHYS.iceShareAt(6150, 0.35, 0.20);

  T.ok('iceShareAt keeps northern boreal lakes ice-free in summer, half-freezes Trigemini Tarn with an open katabatic lead, and freezes +6,150 m seeps',
    iceBoreal === 0 &&
    iceMoraine > 0.04 && iceMoraine < 0.30 &&
    iceTrigemini >= 0.40 && iceTrigemini <= 0.72 &&
    iceBreath >= 0.85);

  T.neg('year-round half-frozen tarn ice shelves require high subpolar altitude rather than +3,040 m boreal basins',
    z => PHYS.iceShareAt(z, 0.15, 0.5) >= 0.40,
    3040,
    5680);
}

// 4. Periglacial KFROST sorted stone circles, aufeis & moraine rock-flour rules
{
  const borealBench = PHYS.frostAt(3040, 0.04, 0.6);
  const moraineBench = PHYS.frostAt(4360, 0.05, 0.7);
  const steepWall = PHYS.frostAt(5680, 0.65, 0.5);

  const kf = globalThis.KFROST.create({
    seed: 9302,
    ground: (x, z) => 0.02 * x,
    polygons: { cell: 15, trough: 0.32, rim: 0.09, width: 0.18, where: () => 1 },
    aufeis: [{ id: 'swow-aufeis', pts: [[-120, 0], [120, 0]], w: 18, thick: 1.4, seg: [60, 110], gap: [20, 40], cover: 0.85 }]
  });
  const smp = kf.sample(0, 0);

  T.ok('KFROST sorted stone rings & aufeis peak on flat permafrost moraine benches and vanish on sheer cliffs or warm boreal floors',
    borealBench.permafrost01 === 0 && borealBench.sortedRings01 === 0 &&
    moraineBench.permafrost01 > 0.90 && moraineBench.sortedRings01 > 0.70 && moraineBench.moraineFlour01 > 0.80 &&
    steepWall.sortedRings01 === 0 &&
    typeof smp._h === 'number' && kf.records().length >= 1);
}

// 5. Endemic lungcushion (+12 C warmer / ~28% O2 dome) & sunblood_crust (down to 0.58 atm)
{
  const domePass = PHYS.lungcushionAt(5680, 0.92, 0.25);
  const domeLow = PHYS.lungcushionAt(3040, 0.92, 0.25);
  const domeAirless = PHYS.lungcushionAt(6800, 0.92, 0.25);
  const sunCrust = PHYS.sunbloodViableAt(6500, 0.9);
  const sunTooHigh = PHYS.sunbloodViableAt(7200, 0.9);

  T.ok('sunlit lungcushion at +5,680 m warms interior by >= +11.5 C and enriches O2 to ~27-29%, relieving courier hypoxia while failing above 0.60 atm ceiling',
    domePass.viable && domePass.deltaTC >= 11.5 && domePass.internalO2Pct >= 27.0 && domePass.relievesHypoxia &&
    !domeLow.viable && !domeAirless.viable &&
    sunCrust.viable && sunCrust.pressureAtm < 0.60 && sunCrust.pressureAtm >= 0.58 && !sunTooHigh.viable);

  T.neg('lungcushion viability stops once ambient pressure drops below the 0.60 atm lethal ceiling',
    z => PHYS.lungcushionAt(z, 0.9, 0.25).viable,
    6800,
    5680);
}

// 6. KSTRATA megabreccia, KHAZ ambient thin-air + cold + placed specs, CROPS.BIOMES.swouterwall & SWOW_FAUNA
{
  for (const key of ['boreallakes', 'morainetarn', 'trigemini', 'breathvale']) {
    const st = SITES[key];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(12, 24, -8);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) {
      throw new Error('KSTRATA megabreccia failed on station ' + key);
    }
  }

  globalThis.KHAZ.provide('pressure', (x, y) => PHYS.pressureAt(y));
  globalThis.KHAZ.provide('temperature', (x, y) => PHYS.transectAt(1120, y).tcC);
  const ambSafe = globalThis.KHAZ.ambient(0, 3040, 0, 0);
  const ambLethal = globalThis.KHAZ.ambient(0, 6600, 0, 0);

  const hazOk = ['quakingbog', 'thinice', 'rockfall', 'hypoxiaceiling'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });

  const cropsAll = SW_CROPS.queryAll();
  const cropsHypoxic = SW_CROPS.queryZone('hypoxicvale');

  T.ok('KSTRATA megabreccia, KHAZ thin-air + cold ambient fields, 4 placed hazards, CROPS.BIOMES.swouterwall (barren in hypoxicvale), and 6 SWOW_FAUNA pass',
    hazOk &&
    !ambSafe.some(a => a.kind === 'thin-air') &&
    ambLethal.some(a => a.kind === 'thin-air') &&
    ambLethal.some(a => a.kind === 'cold') &&
    cropsAll.length >= 12 &&
    cropsHypoxic.length === 0 &&
    SW_FAUNA.SPECIES.length === 6 &&
    SW_FAUNA.stateAt('boreal_loon', 8) === 'DIVE_PATERNOSTER_TARN' &&
    SW_FAUNA.stateAt('thinair_ibex', 10) === 'LEAP_MEGABRECCIA_SCARP');
}

T.done();
