/* Node unit tests for biomes/matronscoast (SNAIL_PHYS, SNAIL_SITES, KSTRATA, KHAZ, CROPS & SNAIL_FAUNA) on tools/ktest.js. */
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
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { SNAIL_PHYS: PHYS, SNAIL_SITES: SITES } = require('../src/15-snail-phys.js');
const SNAIL_CROPS = require('../src/22-snail-crops.js');
const SNAIL_FAUNA = require('../src/24-snail-fauna.js');

// 1. 0.75 g + 1.43-1.60 atm hyper-humid pulmonate gigantism vs thin/dry air ceiling
{
  const skerry = PHYS.pulmonateCeilingAt(14.0, 0.98);
  const cloud = PHYS.pulmonateCeilingAt(2150.0, 0.96);
  const dry = PHYS.pulmonateCeilingAt(100.0, 0.42);
  T.ok('0.75 g and 1.59 atm humid coast supports >= 1.0 m pulmonate shells while +2,150 m cloud-slope scales down to ~0.55-0.75 m',
    skerry.pAtm >= 1.58 && skerry.maxShellM >= 1.00 && skerry.megafaunaViable === true &&
    cloud.maxShellM < skerry.maxShellM && cloud.maxShellM >= 0.50 && !dry.megafaunaViable);
  T.neg('giant pulmonate snails require hyper-humid coastal air rather than < 50% arid humidity',
    hum => PHYS.pulmonateCeilingAt(100.0, hum).megafaunaViable === true,
    0.42,
    0.98);
}

// 2. Deterministic spiral chirality: ~98% dextral (+1) and ~2% sacred Lone-Born sinistral (-1) Queen-Shells
{
  let sinN = 0;
  const total = 10000;
  for (let i = 0; i < total; i++) {
    const ch = PHYS.chiralityOf(90000 + i, 0x51a1);
    if (ch.sinistral) sinN++;
  }
  const rate = sinN / total;
  const detA = PHYS.chiralityOf(424242, 0x77);
  const detB = PHYS.chiralityOf(424242, 0x77);
  T.ok('chiralityOf is order-free deterministic and yields ~2% (1.5-2.6%) sinistral Queen-Shells and ~98% dextral',
    rate >= 0.015 && rate <= 0.026 && detA.sinistral === detB.sinistral && detA.bucketPermil === detB.bucketPermil);
}

// 3. The 2.20 m radula browse-skirt height & silica-thorn / alkaloid anti-radula refugia
{
  const openGrove = PHYS.browseLineAt(0, 0, SITES.browsewood, { elevM: 210 });
  const thornProtected = PHYS.browseLineAt(0, 0, SITES.browsewood, { elevM: 210, silicaCollar01: 0.96 });
  const cloudGrove = PHYS.browseLineAt(0, 0, SITES.cloudslope, { elevM: 2150 });
  T.ok('lowland browsewood cathedral trims soft foliage up to ~2.20 m while silica-thorn collars shield seedlings to ground level',
    openGrove.treeSkirtM >= 2.10 && openGrove.skirtM >= 2.05 && openGrove.cathedralOpenness01 > 0.85 &&
    thornProtected.skirtM < 0.35 && thornProtected.protectedUnderstorey === true &&
    cloudGrove.treeSkirtM < openGrove.treeSkirtM);
  T.neg('unarmoured saplings cannot keep low understorey foliage inside the lowland snail cathedral',
    armour => PHYS.browseLineAt(0, 0, SITES.browsewood, { elevM: 210, silicaCollar01: armour }).protectedUnderstorey === true,
    0.0,
    0.96);
}

// 4. Opalescent Mucus Silver-Highways & Coquina Conch-Middens (Yonni sealime + harpoon-snail crevices)
{
  const onTrail = PHYS.mucusHighwayAt(0, 0, SITES.browsewood, 0.36);
  const offTrail = PHYS.mucusHighwayAt(110, -110, SITES.browsewood, 0.05);
  const midden = PHYS.coquinaMiddenAt(-72, -22, SITES.skerry);
  const granite = PHYS.coquinaMiddenAt(120, -120, SITES.skerry);
  T.ok('Mucus Silver-Highway carves iridescent U-grooves with elevated steep-slope slip risk, and Coquina Middens yield > 1,000 kg/m2 sealime',
    onTrail.trail01 > 0.85 && onTrail.grooveDepthM >= 0.25 && onTrail.iridescence01 > 0.55 && onTrail.slipRisk01 > 0.65 &&
    offTrail.trail01 === 0 && offTrail.slipRisk01 === 0 &&
    midden.thicknessM >= 3.5 && midden.soilPh >= 7.8 && midden.sealimeKgM2 >= 1000 && midden.harpoonRisk01 > 0.65 &&
    granite.thicknessM === 0);
  T.neg('mucus slip hazard requires a steep active slime-highway rather than gentle off-trail leaf-mould',
    pt => PHYS.mucusHighwayAt(pt[0], pt[1], SITES.browsewood, pt[2]).slipRisk01 > 0.5,
    [110, -110, 0.05],
    [0, 0, 0.38]);
}

// 5. Border ecology: Farside landkelp grazing suppression (SW) & Shroudhills Shroud-Ant mucus exclusion (NE)
{
  const grazedFront = PHYS.kelpFrontBalanceAt(-40, 20, SITES.kelpfront, { spray01: 0.88, snailDensity01: 0.92, goatKiln01: 0.0 });
  const ungrazedKelp = PHYS.kelpFrontBalanceAt(-40, 20, SITES.kelpfront, { spray01: 0.88, snailDensity01: 0.0, goatKiln01: 0.0 });
  const glazedTrunk = PHYS.antExclusionAt(220.0, 0.72, 3920);
  const unglazedTrunk = PHYS.antExclusionAt(450.0, 0.0, 2800);
  T.ok('Tower-Snail radulae crop Farside landkelp down to <= 1.2 m stubs, and saponin pedal mucus blocks Shroud-Ants below +1,400 m',
    grazedFront.kelpSuppressed === true && grazedFront.survivingStipeM <= 1.20 && ungrazedKelp.survivingStipeM >= 20.0 &&
    glazedTrunk.antSurvival01 === 0 && glazedTrunk.drumGallAllowed === false && glazedTrunk.smudgeFreeSafe === true &&
    unglazedTrunk.drumGallAllowed === true);
  T.neg('Shroud-Ant drum-galls are excluded on mucus-glazed lowland Matrons Coast trunks',
    muc => PHYS.antExclusionAt(220.0, muc, 3920).drumGallAllowed === true,
    0.75,
    0.0);
}

// 6. All 4 KSTRATA stacks, KHAZ specs, CROPS.canPlaid('matronscoast') & 7 SNAIL_FAUNA species
{
  for (const key of ['skerry', 'browsewood', 'kelpfront', 'cloudslope']) {
    const st = SITES[key];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(0, 12, 0);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) {
      throw new Error('KSTRATA failed on station ' + key);
    }
  }
  const hazOk = ['mucusslip', 'harpoon', 'surf', 'radulathorn'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });
  const crops = SNAIL_CROPS.queryAll();
  const plaidOk = SNAIL_CROPS.canPlaid({ wool: false });
  T.ok('all 4 stations KSTRATA + KHAZ compile, CROPS.canPlaid("matronscoast") passes with >= 55 crops, and all 7 SNAIL_FAUNA schedules resolve',
    hazOk && crops.length >= 55 && plaidOk === true && SNAIL_FAUNA.SPECIES.length === 7 &&
    SNAIL_FAUNA.stateAt('matron_towersnail', 4) === 'GLIDE_SILVER_HIGHWAY' &&
    SNAIL_FAUNA.stateAt('harpoon_conesnail', 20) === 'HARPOON_HUNT');
}

T.done();
