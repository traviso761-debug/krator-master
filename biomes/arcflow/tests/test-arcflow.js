/* Node unit tests for biomes/arcflow (ARCFLOW_PHYS, ARCFLOW_SITES, KSTRATA, KFRONTIER, CROPS & FAUNA) on tools/ktest.js. */
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
loadInGlobal('core/frontier/18-core-frontier.js');
loadInGlobal('core/terrain/35-core-strata.js');
loadInGlobal('core/terrain/35f-core-strata-arcflow.js');
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { ARCFLOW_PHYS: PHYS, ARCFLOW_SITES: SITES } = require('../src/15-arcflow-phys.js');
const AF_CROPS = require('../src/22-arcflow-crops.js');
const AF_FAUNA = require('../src/24-arcflow-fauna.js');

// 1. Onshore Arch ophiolite / serpentinite toxicity (Mg/Ca > 8, Ni > 2,200 ppm) vs fertile foredeep
{
  const skerry = PHYS.ophioliteBeltAt(-64, -44, SITES.neva);
  const fenLoam = PHYS.ophioliteBeltAt(0, 0, SITES.neva);
  T.ok('kalju-selka serpentinite skerry reaches Mg/Ca > 8 and Ni > 2,200 ppm while surrounding Musta-Jogi fen stays Ca/Mg-safe',
    skerry.serpentinite01 > 0.85 && skerry.mgCaRatio > 8.0 && skerry.niPpm > 2200.0 && skerry.carnelianRefuge01 > 0.85 &&
    fenLoam.mgCaRatio < 2.5 && fenLoam.carnelianRefuge01 === 0);
  T.neg('serpentine Carnelian refuge requires elevated Mg/Ca > 8 rather than foredeep clay-loam',
    pt => PHYS.ophioliteBeltAt(pt[0], pt[1], SITES.neva).carnelianRefuge01 > 0.5,
    [0, 0],
    [-64, -44]);
}

// 2. Active continental serpentinization: pH 11.5 cerulean travertine & abiotic H2/CH4 Jumala-Tuli cold-flames
{
  const vent = PHYS.alkalineSeepAt(-46, -22, SITES.seep);
  const cascade = PHYS.alkalineSeepAt(-8, 0, SITES.seep);
  const nonSeep = PHYS.alkalineSeepAt(0, 0, SITES.klint);
  T.ok('Station 3 (seep) vents pH > 11.2 Ca-OH cerulean travertine and abiotic H2/CH4 cold-flames',
    cascade.ph >= 11.2 && cascade.ceruleanTufa01 > 0.85 && vent.h2FlameProb01 > 0.85 && nonSeep.ceruleanTufa01 === 0);
}

// 3. Helme-Koski zebra-cumulate rapids, Hiidenkirnu pothole Froude number & sampo hydro-head
{
  const calm = PHYS.koskiHydraulicsAt(433.0, false, 0.4);
  const sill = PHYS.koskiHydraulicsAt(433.0, true, 4.8);
  T.ok('Helme-Koski accelerates from subcritical pool (Fr < 0.55) to supercritical sill (Fr > 0.95) with >= 400 kW sampo head',
    calm.froude < 0.55 && sill.froude > 0.95 && sill.pothole01 > 0.70 && sill.millHeadKw >= 400.0);
  T.neg('Hiidenkirnu swirl-kettle drilling requires supercritical chromitite sill hydraulics',
    onSill => PHYS.koskiHydraulicsAt(433.0, onSill, onSill ? 4.8 : 0.4).pothole01 > 0.5,
    false,
    true);
}

// 4. Musta-Jogi humic peat-acid leaching (pH 4.3) & regenerating Fe-Ni raha-maak ("penny-ore") shoals
{
  const humicShoal = PHYS.bogOreShoalAt(4.35, 0.85, 0.78);
  const neutralReach = PHYS.bogOreShoalAt(7.5, 0.85, 0.78);
  T.ok('pH 4.3 humic water meeting oxygenated shoal precipitates >= 10 kg/m2 Fe-Ni penny-ore with >= 5% Ni',
    humicShoal.rakeReady === true && humicShoal.pennyOreKgM2 >= 10.0 && humicShoal.niWtPct >= 5.0 && !neutralReach.rakeReady);
  T.neg('regenerating raha-maak penny-ore requires humic peat acidity rather than neutral river water',
    ph => PHYS.bogOreShoalAt(ph, 0.85, 0.78).rakeReady === true,
    7.5,
    4.35);
}

// 5. NE Ecocide Bleach-Swath & 45 m ecof_soil_auger Lime-Phosphate Oasis partition on Station 5 (auger)
{
  const inSwath = PHYS.frontierQuiltAt(-68, 24, SITES.auger);
  const inOasis = PHYS.frontierQuiltAt(52, -24, SITES.auger);
  const inBarren = PHYS.frontierQuiltAt(-18, -82, SITES.auger);
  T.ok('Station 5 (auger) partitions cleanly into bleach swath, 45 m green Earth lime-oasis, and surrounding Carnelian serpentinite barren',
    inSwath.biosphere === 'bleach' && inSwath.bleachScar01 > 0.85 &&
    inOasis.biosphere === 'earth' && inOasis.augerOasis01 > 0.80 &&
    inBarren.biosphere === 'carnelian' && inBarren.redDominance01 > 0.65);
}

// 6. KSTRATA stacks, KHAZ.make specs, CROPS.BIOMES.arcflow & ARCFLOW_FAUNA contracts across all 5 stations
{
  for (const key of ['klint', 'koski', 'seep', 'neva', 'auger']) {
    const st = SITES[key];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(0, 10, 0);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) throw new Error('KSTRATA failed on station ' + key);
  }
  const hazOk = ['klintdrop', 'koskisweep', 'causticseep', 'coldflame', 'peatmire', 'bleach'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });
  const crops = AF_CROPS.queryAll();
  T.ok('all 5 Arcflow KSTRATA stacks and 6 KHAZ specs compile, CROPS.BIOMES.arcflow yields >= 50 crops, and 6 fauna schedules resolve',
    hazOk && crops.length >= 50 && AF_FAUNA.SPECIES.length === 6 &&
    AF_FAUNA.stateAt('silicagrazer', 12) === 'RASP_ORGANPIPE' &&
    AF_FAUNA.stateAt('belldrifter', 12) === 'DRIFT_SEEP_PLUME');
}

T.done();
