/* Node unit tests for biomes/springhollows (HOLLOW_PHYS, HOLLOW_SITES, CROPS, FAUNA, KHAZ & KKARST/KSPELEO) on tools/ktest.js. */
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
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('core/terrain/39-core-cavern.js');
loadInGlobal('core/terrain/39b-core-speleo.js');
loadInGlobal('core/terrain/39c-core-karst.js');
loadInGlobal('core/terrain/39d-core-cavern-floor.js');
loadInGlobal('core/materials/record/27-matlib-m1.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');

const { HOLLOW_PHYS: PHYS, HOLLOW_SITES: SITES } = require('../src/15-springhollows-phys.js');
const SH_CROPS = require('../src/22-springhollows-crops.js');
const SH_FAUNA = require('../src/24-springhollows-fauna.js');

// 1. Porphyry dike intrusion & Ching-Ma shut-in hydraulic pinch (PLAN.md section 7.3 #1)
{
  const site = SITES.shutin;
  const inDike = PHYS.porphyryDikeAt(0, 0, site);
  const inDolomite = PHYS.porphyryDikeAt(160, 0, site);
  const flowOpen = PHYS.shutInFlowAt({ qM3s: 195.0, inDike: inDolomite.inDike, signedDistM: inDolomite.signedDistM, baseSlope: 0.0014 });
  const flowChute = PHYS.shutInFlowAt({ qM3s: 195.0, inDike: inDike.inDike, signedDistM: inDike.signedDistM, baseSlope: 0.0014 });

  T.ok('purple-red rhyolite porphyry dike sets strataKind = porphyry-dike (hardness 0.96) vs carbonate-shelf (0.42)',
    inDike.inDike === true && inDike.strataKind === 'porphyry-dike' && inDike.rockHardness01 >= 0.94 &&
    inDolomite.inDike === false && inDolomite.strataKind === 'carbonate-shelf' && inDolomite.rockHardness01 <= 0.45);
  T.ok('Ching-Ma pinches from >= 65 m subcritical dolomite pool (Fr < 0.35) to <= 24 m supercritical porphyry chute (Fr > 1.15, whitewater > 0.85, liftBypassReq)',
    flowOpen.channelWidthM >= 65.0 && flowOpen.froude < 0.35 && flowOpen.liftBypassReq === false &&
    flowChute.channelWidthM <= 24.0 && flowChute.froude > 1.15 && flowChute.whitewater01 > 0.85 && flowChute.liftBypassReq === true);
  T.neg('counterweight boat-lift bypass requires supercritical porphyry shut-in constriction',
    inp => PHYS.shutInFlowAt(inp).liftBypassReq === true,
    { qM3s: 195.0, inDike: false, signedDistM: 85.0, baseSlope: 0.0014 },
    { qM3s: 195.0, inDike: true, signedDistM: -32.0, baseSlope: 0.0014 });
}

// 2. First-magnitude sapphire artesian karst mammoth-spring resurgence (PLAN.md section 1.2 #3)
{
  const bigSpring = PHYS.mammothSpringAt({ headDropM: 485.0, conduitAreaM2: 15.2, spiderSeepShare01: 0.24, airTempC: 28.0 });
  T.ok('cav_ozarks_resurgence delivers 12-34 m3/s artesian discharge at +17.5..+21.5 C with > 10 m sapphire optical clarity and mist plume',
    bigSpring.qSpringM3s >= 12.0 && bigSpring.qSpringM3s <= 34.0 &&
    bigSpring.tempC >= 17.5 && bigSpring.tempC <= 21.5 &&
    bigSpring.caMgPpm >= 240.0 && bigSpring.sapphireDepthM >= 10.0 && bigSpring.mistPlume01 > 0.4);
  T.neg('thermal condensation mist plume requires warm hollow air above constant +18 C spring temperature',
    inp => PHYS.mammothSpringAt(inp).mistPlume01 > 0.25,
    { headDropM: 485.0, conduitAreaM2: 15.2, spiderSeepShare01: 0.24, airTempC: 14.0 },
    { headDropM: 485.0, conduitAreaM2: 15.2, spiderSeepShare01: 0.24, airTempC: 29.0 });
}

// 3. 0.75 g MVT celestine/calcite crystal growth window & KSPELEO.CALCITE walkability (PLAN.md section 7.3 #2)
{
  const fenestreMvt = PHYS.mvtCrystalAt({ dikeDistM: 8.0, spiderSeepShare01: 0.56, depthBelowTableM: 52.0, gKrator: 7.4 });
  const surfaceRock = PHYS.mvtCrystalAt({ dikeDistM: 8.0, spiderSeepShare01: 0.56, depthBelowTableM: 0.5, gKrator: 7.4 });

  T.ok('cav_ozarks_porphyry MVT contact activates KSPELEO.CALCITE with 14.0-14.5 m celestine megabeams under 0.75 g',
    fenestreMvt.speleoPreset === 'CALCITE' &&
    fenestreMvt.maxBeamLenM >= 14.0 && fenestreMvt.maxBeamLenM <= 14.5 &&
    fenestreMvt.celestineShare01 >= 0.65 && fenestreMvt.galenaZinc01 >= 0.25);
  T.neg('MVT celestine megabeams require deep porphyry-dolomite contact rather than open surface terrain',
    inp => PHYS.mvtCrystalAt(inp).maxBeamLenM >= 10.0,
    { dikeDistM: 8.0, spiderSeepShare01: 0.56, depthBelowTableM: 0.5, gKrator: 7.4 },
    { dikeDistM: 8.0, spiderSeepShare01: 0.56, depthBelowTableM: 52.0, gKrator: 7.4 });
  if (surfaceRock.speleoPreset !== 'NONE') throw new Error('expected NONE speleoPreset on surface');

  // Verify KCAVERN + KSPELEO.CALCITE + KCAVERN.floorFn in pure [G data] Node
  const cav = globalThis.KCAVERN.create({ ground: () => 0, cell: 1.0, chunk: 16, seed: 7403 });
  cav.hall({ id: 'test-fenestre-hall', c: [0, -26, 0], rx: 28, rz: 24, h: 22 });
  cav.opening({ id: 'test-fenestre-mouth', c: [0, 0], r: 8, rim: 5, kind: 'well' });
  cav.build();
  const floorH = globalThis.KCAVERN.floorFn(cav, { from: -32, to: -4, step: 0.5, fallback: 0, cell: 2 });
  const speleoRecs = globalThis.KSPELEO.place(cav, {
    box: [-22, -18, 22, 18], y: -22, cell: 3.0, world: 7403,
    kinds: {
      beam: { p: 0.25, len: [6.0, 14.2], r: [0.22, 0.55], el: [0.18, 0.85], minGap: 3.0, mineral: 'celestine' },
      block: { p: 0.25, len: [0.5, 1.8], r: [0.35, 1.1], n: [2, 5], mineral: 'calcite' },
      druse: { p: 0.35, len: [0.15, 0.65], r: [0.8, 2.2], n: [10, 24], mineral: 'calcite' }
    }
  });
  const blocks = globalThis.KSPELEO.blocks(speleoRecs);
  T.ok('KCAVERN + KSPELEO.CALCITE places celestine beams & calcite druse on cavern floor with solid KSPELEO.blocks',
    speleoRecs.length >= 6 && blocks.length >= 2 && floorH(12, 0) < -20 && !!cav.holeAt(0, 0));
}

// 4. Twilight calcifying tufabryum confinement & dusk 495 nm glow (PLAN.md section 7.3 #3)
{
  const archDay = PHYS.caveMouthGlowAt({ skyOpenness01: 0.19, springHumidity01: 0.88, isNight: false });
  const archNight = PHYS.caveMouthGlowAt({ skyOpenness01: 0.19, springHumidity01: 0.88, isNight: true });

  T.ok('humid cave-arch twilight zone (0.04 <= skyOpenness01 <= 0.42) accretes tufa by day and glows 495 nm cyan-jade at dusk/night',
    archDay.bryoCover01 >= 0.85 && archDay.tufaAccretionMmYr >= 5.0 && archDay.biolumRadiance01 === 0.0 &&
    archNight.bryoCover01 >= 0.85 && archNight.biolumRadiance01 >= 0.75);
  T.neg('twilight tufabryum colonization rejects open sunlit hillsides (skyOpenness01 > 0.6)',
    inp => PHYS.caveMouthGlowAt(inp).bryoCover01 > 0.0,
    { skyOpenness01: 0.82, springHumidity01: 0.90, isNight: true },
    { skyOpenness01: 0.20, springHumidity01: 0.90, isNight: true });
}

// 5. Ancient defoliant bleach-belt scar & biological strangler-front (PLAN.md section 3.4)
{
  const gladeSite = SITES.glade;
  const scarCore = PHYS.ecocideScarAt(-148.0, 112.0, gladeSite);
  const scarEdge = PHYS.ecocideScarAt(-148.0 - Math.sin(-0.52) * 51.0, 112.0 + Math.cos(-0.52) * 51.0, gladeSite);
  const unscarred = PHYS.ecocideScarAt(120.0, -80.0, gladeSite);

  T.ok('Station 4 glade Ancient bleach-belt sterilizes hardpan core while strangler-front peaks along scar margins',
    scarCore.inBleachBelt === true && scarCore.hardpan01 >= 0.90 &&
    scarEdge.stranglerFront01 >= 0.75 &&
    unscarred.inBleachBelt === false && unscarred.hardpan01 === 0.0);
  T.neg('Ancient defoliant bleach-belt is absent on unscarred Station 1 spring hollow',
    inp => PHYS.ecocideScarAt(inp.x, inp.z, inp.site).inBleachBelt === true,
    { x: -148.0, z: 112.0, site: SITES.spring },
    { x: -148.0, z: 112.0, site: SITES.glade });
}

// 6. CROPS.BIOMES.springhollows (>= 71 crops & all 20 signature crops) + 6 fauna + KHAZ.make validation
{
  const allCrops = SH_CROPS.queryAll({ works: ['dark-beds'], nodes: ['iron', 'copper'] });
  const idSet = new Set(allCrops.map(r => r.crop.id));
  const missingSig = SH_CROPS.SIGNATURE.filter(id => !idSet.has(id));

  T.ok('CROPS.BIOMES.springhollows yields >= 71 verified crops including all 20 signature crops (saffron, whorl-olive, rice, alecap, glow-mushroom)',
    allCrops.length >= 71 && missingSig.length === 0);
  T.neg('dark-cavern mushroom crops (alecap, glow-mushroom) require dark-beds works',
    opts => SH_CROPS.queryAll(opts).some(r => r.crop.id === 'alecap'),
    { works: [] },
    { works: ['dark-beds'] });

  T.ok('all 6 Springhollows fauna species register valid 24h schedules across stations',
    SH_FAUNA.SPECIES.length === 6 &&
    SH_FAUNA.stateAt('alabastercraw', 3.0) === 'FORAGE_SUMP' &&
    SH_FAUNA.stateAt('fenestregnat', 21.0) === 'SWARM_GLOW' &&
    SH_FAUNA.stateAt('porphyrylizard', 9.0) === 'BASK_DIKE' &&
    SH_FAUNA.forStation('spring').length >= 3 &&
    SH_FAUNA.forStation('glade').length >= 3);

  const hazKeys = ['shutin', 'fenestre', 'sump', 'crystal'];
  const builtHaz = hazKeys.map(k => globalThis.KHAZ.make(PHYS.hazardSpec(k)));
  T.ok('all 4 Springhollows KHAZ hazard specs (shutin, fenestre, sump, crystal) validate cleanly via KHAZ.make',
    builtHaz.length === 4 && builtHaz.every(h => h && h.danger > 0 && h.tell && h.tell.colour));
  T.neg('KHAZ.make accepts valid vocab hazard kinds and rejects unknown non-vocab kinds',
    spec => { const h = globalThis.KHAZ.make(spec); return !!(h && h.kind); },
    { kind: 'nonexistent-rapid', danger: 0.5 },
    PHYS.hazardSpec('shutin'));

  // Verify KMAT_M1 M2 roughness variance AA math
  const rBase = 0.14;
  const rAA = globalThis.KMAT_M1.roughnessWithVariance(rBase, 3.0, [0.002, 0.008, 0.022, 0.055, 0.095, 0.14, 0.18, 0.22]);
  T.ok('KMAT_M1 M2 roughnessWithVariance widens grazing/far crystal and wet-porphyry roughness cleanly',
    rAA > rBase && rAA < 0.65 && globalThis.KMAT_M1.GLSL_COMMON.indexOf('km1RoughAA') >= 0);
}

T.done();
