/* Node unit tests for biomes/springhollows (HOLLOW_PHYS, HOLLOW_SITES, 25-species roster & placement, CROPS, FAUNA, KHAZ & KKARST/KSPELEO) on tools/ktest.js. */
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
loadInGlobal('core/space/20-core-space.js');
loadInGlobal('core/frontier/18-core-frontier.js');
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

// 1. Porphyry dike intrusion & Tlila-Wada shut-in hydraulic pinch (PLAN.md section 7.3 #1)
{
  const site = SITES.shutin;
  const inDike = PHYS.porphyryDikeAt(0, 0, site);
  const inDolomite = PHYS.porphyryDikeAt(160, 0, site);
  const flowOpen = PHYS.shutInFlowAt({ qM3s: 195.0, inDike: inDolomite.inDike, signedDistM: inDolomite.signedDistM, baseSlope: 0.0014 });
  const flowChute = PHYS.shutInFlowAt({ qM3s: 195.0, inDike: inDike.inDike, signedDistM: inDike.signedDistM, baseSlope: 0.0014 });

  T.ok('purple-red rhyolite porphyry dike sets strataKind = porphyry-dike (hardness 0.96) vs carbonate-shelf (0.42)',
    inDike.inDike === true && inDike.strataKind === 'porphyry-dike' && inDike.rockHardness01 >= 0.94 &&
    inDolomite.inDike === false && inDolomite.strataKind === 'carbonate-shelf' && inDolomite.rockHardness01 <= 0.45);
  T.ok('Tlila-Wada pinches from >= 65 m subcritical dolomite pool (Fr < 0.35) to <= 24 m supercritical porphyry chute (Fr > 1.15, whitewater > 0.85, liftBypassReq)',
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

  T.ok('all 6 Springhollows fauna species register valid 24h schedules across all 5 stations',
    SH_FAUNA.SPECIES.length === 6 &&
    SH_FAUNA.stateAt('alabastercraw', 3.0) === 'FORAGE_SUMP' &&
    SH_FAUNA.stateAt('fenestregnat', 21.0) === 'SWARM_GLOW' &&
    SH_FAUNA.stateAt('porphyrylizard', 9.0) === 'BASK_DIKE' &&
    SH_FAUNA.forStation('spring').length >= 3 &&
    SH_FAUNA.forStation('glade').length >= 3 &&
    SH_FAUNA.forStation('porphyryrelict').length >= 3);

  const hazKeys = ['shutin', 'fenestre', 'sump', 'crystal'];
  const builtHaz = hazKeys.map(k => globalThis.KHAZ.make(PHYS.hazardSpec(k)));
  T.ok('all 4 Springhollows KHAZ hazard specs (shutin, fenestre, sump, crystal) validate cleanly via KHAZ.make',
    builtHaz.length === 4 && builtHaz.every(h => h && h.danger > 0 && h.tell && h.tell.colour));
  T.neg('KHAZ.make accepts valid vocab hazard kinds and rejects unknown non-vocab kinds',
    spec => { const h = globalThis.KHAZ.make(spec); return !!(h && h.kind); },
    { kind: 'nonexistent-rapid', danger: 0.5 },
    PHYS.hazardSpec('shutin'));

  const rBase = 0.14;
  const rAA = globalThis.KMAT_M1.roughnessWithVariance(rBase, 3.0, [0.002, 0.008, 0.022, 0.055, 0.095, 0.14, 0.18, 0.22]);
  T.ok('KMAT_M1 M2 roughnessWithVariance widens grazing/far crystal and wet-porphyry roughness cleanly',
    rAA > rBase && rAA < 0.65 && globalThis.KMAT_M1.GLSL_COMMON.indexOf('km1RoughAA') >= 0);

  const prKnob = PHYS.porphyryRelictQuiltAt(12, 8, 28.0, SITES.porphyryrelict);
  const prHollow = PHYS.porphyryRelictQuiltAt(-90, 20, 4.5, SITES.porphyryrelict);
  T.ok('Station 5 (porphyryrelict) crowns high purple-red porphyry knob in Carnelian clades while keeping dolomite hollows Earthlike',
    prKnob.inDike === true && prKnob.biosphere === 'carnelian' && prKnob.redDominance01 > 0.70 &&
    prHollow.inDike === false && prHollow.biosphere === 'earth');
}

// 7. Ria Dynasty culture ('ria', zero 'xanadu') & materials.json library fidelity
{
  const vocabCultures = globalThis.KTAGS.VOCAB.cultures;
  const riaReserves = ['spring', 'shutin', 'fenestre', 'porphyryrelict'].map(k => SITES[k].reserves[0]);
  const physSrc = fs.readFileSync(path.join(__dirname, '..', 'src', '15-springhollows-phys.js'), 'utf8');
  const worksSrc = fs.readFileSync(path.join(__dirname, '..', 'src', '86-host-works.js'), 'utf8');
  const matJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'materials.json'), 'utf8'));
  const fams = matJson.families || {};
  const groundKeys = Object.keys(fams).filter(k => k.indexOf('ground.') === 0);

  T.ok('High-Ria reserves & stelae use KTAGS vocab culture = ria (Sikwingi-Khaloyi) with zero leftover xanadu strings',
    vocabCultures.indexOf('ria') >= 0 &&
    riaReserves.every(r => r && r.culture === 'ria') &&
    SITES.glade.reserves[0].culture === 'ancient' &&
    physSrc.indexOf('xanadu') === -1 &&
    worksSrc.indexOf('xanadu') === -1 &&
    worksSrc.indexOf("culture:'ria'") >= 0);

  const wantLibs = {
    pine: 'card.pine.b',
    saffron: 'card.crop.saffron',
    glowmush: 'card.mushroom.glow',
    alecap: 'card.mushroom.alecap',
    'bark.amber': 'bark.amber',
    samara: 'card.samara.maple',
    'bark.mossy': 'bark.mossy',
    broadleaf: 'card.broadleaf',
    'bark.plane': 'bark.plane',
    heartleaf: 'card.heartleaf',
    spicebush: 'card.orchard.broad',
    watercress: 'card.wingreed',
    maidenhair: 'card.fan.lace',
    zincviolet: 'card.cushion.anemone',
    wildtea: 'card.crop.tea',
    fireweed: 'card.fireweed'
  };
  const allLibsMatch = Object.keys(wantLibs).every(k => fams[k] && fams[k].lib === wantLibs[k]);
  T.ok('materials.json binds genuine packed library sets for all 16 new/fixed bark & foliage slots without adding KGROUND layers',
    allLibsMatch && groundKeys.length === 8);
}

// 8. 25-Species Roster, HV Harvest Tags & Multi-Station Placement Invariants (spring, shutin, fenestre, glade, porphyryrelict)
{
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  class MockColor {
    constructor(h) { this.hex = h == null ? 0xffffff : h; }
    offsetHSL() { return this; }
    setHex(h) { this.hex = h; return this; }
  }
  class MockGeo {
    constructor() {
      this.attributes = { position: { count: 3, getX: () => 0, getY: () => 0, getZ: () => 0, setXYZ: () => {} } };
      this.userData = {};
    }
    setAttribute() {}
    computeVertexNormals() {}
  }
  const mockTHREE = {
    Color: MockColor,
    DoubleSide: 2,
    IcosahedronGeometry: MockGeo,
    Float32BufferAttribute: function () {},
    MeshStandardMaterial: function (o) { Object.assign(this, o || {}); this.userData = {}; }
  };

  let rngSeed = 1;
  const reseed = s => { rngSeed = (s >>> 0) || 1; };
  const rng = () => { rngSeed = (Math.imul(rngSeed, 1664525) + 1013904223) >>> 0; return rngSeed / 4294967296; };
  const rr = (a, b) => a + (b - a) * rng();

  const buckets = {}, defs = {};
  const mockBIO = {
    cur: null,
    owner: null,
    host: { THREE: mockTHREE, terrainH: () => 10, waterH: () => -1e9 },
    fn: { TAU, clamp, lerp, smooth, reseed, rng, rr, qEuler: () => [0, 0, 0, 1] },
    kit: () => {},
    kitEnd: () => {},
    canvasTex: () => ({ repeat: { set: () => {} } }),
    alphaTex: () => ({ repeat: { set: () => {} } }),
    barkMat: () => ({ userData: {} }),
    leafMat: (_t, key, o) => ({ key, opts: o, userData: {} }),
    libSwap: () => ({}),
    bucket: (k, mat, o) => { buckets[k] = { mat, o }; },
    def: (k, geo, mat, o) => {
      if (defs[k]) throw new Error('duplicate BIO.def: ' + k);
      defs[k] = { geo, mat, o, count: 0 };
    },
    geo: { clump: () => new MockGeo(), frond: () => new MockGeo(), mat: () => new MockGeo() },
    fung: { stalk: () => new MockGeo(), pod: () => new MockGeo(), crust: () => new MockGeo(), cap: () => new MockGeo() },
    flareJoin: pts => pts,
    tube: () => 12,
    put: k => {
      if (!defs[k]) throw new Error('BIO.put unknown item: ' + k);
      defs[k].count++;
    },
    lodD: (x, z) => Math.hypot(x, z),
    impostorSet: () => ({ slots: 9 }),
    impostor: k => ({ key: k }),
    impostorItem: k => { defs[k] = { count: 0 }; },
    impostorPut: k => { defs[k].count++; }
  };

  const sandbox = {
    console, Math, Object, Array, Number, String, Boolean, Error,
    KRAND: globalThis.KRAND,
    KSPACE: globalThis.KSPACE,
    KFRONTIER: Object.assign({}, globalThis.KFRONTIER),
    HOLLOW_PHYS: PHYS,
    HOLLOW_SITES: SITES,
    SPRINGHOLLOWS_CROPS: SH_CROPS,
    SPRINGHOLLOWS_FAUNA: SH_FAUNA,
    BIO: mockBIO,
    INIT_DUSK: false
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);

  for (const rel of [
    'core/frontier/52-core-frontier-draw.js',
    'biomes/springhollows/src/50-springhollows-species.js',
    'biomes/springhollows/src/60-springhollows-place.js',
    'biomes/springhollows/src/70-springhollows.js'
  ]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), sandbox, { filename: rel });
  }

  const SH = sandbox.SPRINGHOLLOWS;
  const EXPECTED_25 = [
    'springcypress', 'chinkapinoak', 'porphyrypine', 'redbudkarst',
    'tufabryum', 'calaminefern', 'springsponge', 'stranglervine',
    'whorlolive', 'karstsaffron', 'fenestreglowmush', 'karstalecap',
    'carnelian_organpipe', 'erythra_veil', 'agate_window', 'blood_strangler',
    'weepingamberstorax', 'dolomitehornbeam', 'springtupelo', 'fenestrespicebush',
    'artesianwatercress', 'travertinemaidenhair', 'zincviolet', 'karstwildtea', 'bleachfireweed'
  ];

  const gotKeys = SH.SPECIES.map(s => s.key);
  const allHaveHV = SH.SPECIES.every(s => s.tags && s.tags.harvest && typeof s.tags.harvest.wood === 'string' && s.tags.harvest.notes.length > 8);
  const pineUsesOwnCard = defs.sh_pine_fol && defs.sh_pine_fol.mat === SH.M.pine && SH.M.pine !== SH.M.cypress;
  const saffronUsesOwnCard = defs.sh_saffron_tuft && defs.sh_saffron_tuft.mat === SH.M.saffron && SH.M.saffron !== SH.M.gladegrass;

  T.ok('SPRINGHOLLOWS.SPECIES registers all 25 native/karst/Carnelian species with valid HV tags and dedicated pine & saffron cards',
    SH.SPECIES.length === 25 &&
    EXPECTED_25.every(k => gotKeys.indexOf(k) >= 0) &&
    allHaveHV &&
    pineUsesOwnCard &&
    saffronUsesOwnCard);

  // Representative station terrain & water models matching 45-host-stage.js
  function stationEnv(skey) {
    const site = SITES[skey];
    const terrainH = (x, z) => {
      const dk = PHYS.porphyryDikeAt(x, z, site);
      if (skey === 'spring') {
        if (x < -88) return 28.0;
        const dBoil = Math.hypot((x + 36) / 54, z / 27);
        if (dBoil < 0.95) return -4.2;
        const u = clamp((x - 16) / 430, 0, 1);
        const zm = 18 * Math.sin(u * 4.6);
        const dz = Math.abs(z - (x > 16 ? zm : 0));
        const wy = 0.04 - 2.85 * u;
        if (dz < 14) return wy - 0.85;
        if (dz < 22) return wy + 0.35;
        return wy + 2.5 + 0.08 * dz + (dk.inDike ? 6.0 : 0);
      }
      if (skey === 'shutin') {
        const zR = 6 * Math.sin(x * 0.012);
        const dz = Math.abs(z - zR);
        const halfC = dk.inDike ? 9.2 : 42.0;
        const wy = x < -66 ? 6.25 : (x <= 76 ? 3.2 : 0.20);
        if (dz < halfC - 2) return wy - 1.5;
        if (dz < halfC + 4) return wy + 0.8;
        return wy + 6.0 + (dk.inDike ? 21.0 * smooth(halfC, 65, dz) : 12.0 * smooth(halfC, 120, dz));
      }
      if (skey === 'fenestre') {
        return 8.5 + (dk.inDike ? 11.0 : 0) + 4.0 * smooth(20, 180, Math.hypot(x, z));
      }
      if (skey === 'porphyryrelict') {
        const dTarn = Math.hypot(x + 88, z + 24);
        if (dTarn < 11) return 1.25;
        if (dTarn < 17) return 2.05;
        const knob = dk.inDike ? 26.5 * smooth(148, 18, Math.hypot((x - 12) * 0.82, (z - 8) * 0.95)) : 0;
        return 5.2 + knob;
      }
      // glade
      const knob = dk.inDike ? 16.5 * smooth(250, 50, Math.hypot(x - 68, z + 42)) : 0;
      return 8.5 + knob;
    };
    const waterH = (x, z) => {
      if (skey === 'spring') {
        if (Math.hypot((x + 36) / 54, z / 27) < 1.05) return 0.14;
        if (x >= 12 && x <= 450) {
          const u = clamp((x - 16) / 430, 0, 1);
          if (Math.abs(z - 18 * Math.sin(u * 4.6)) < 20.0) return 0.04 - 2.85 * u;
        }
        return -1e9;
      }
      if (skey === 'shutin') {
        const dk = PHYS.porphyryDikeAt(x, z, site);
        const halfW = dk.inDike ? 9.5 : 43.0;
        if (Math.abs(z - 6 * Math.sin(x * 0.012)) > halfW) return -1e9;
        return x < -66 ? 6.25 : (x <= 76 ? 3.2 : 0.20);
      }
      if (skey === 'porphyryrelict') {
        return Math.hypot(x + 88, z + 24) < 16.5 ? 1.85 : -1e9;
      }
      return -1e9;
    };
    return { terrainH, waterH };
  }

  const totalBySpecies = {};
  EXPECTED_25.forEach(k => { totalBySpecies[k] = 0; });
  const stationPlaced = {};

  const UPLAND_TREES = new Set([
    'chinkapinoak', 'porphyrypine', 'redbudkarst', 'whorlolive',
    'weepingamberstorax', 'dolomitehornbeam', 'springtupelo', 'fenestrespicebush', 'karstwildtea'
  ]);
  const CALCIPHILE_TREES = new Set([
    'chinkapinoak', 'dolomitehornbeam', 'weepingamberstorax', 'redbudkarst', 'whorlolive', 'karstwildtea', 'fenestrespicebush'
  ]);

  let badKeys = 0, badPines = 0, badBleachTrees = 0, badTufa = 0, badWaterTrees = 0;

  for (const skey of ['spring', 'shutin', 'fenestre', 'glade', 'porphyryrelict']) {
    const env = stationEnv(skey);
    mockBIO.host.terrainH = env.terrainH;
    mockBIO.host.waterH = env.waterH;
    SH.build({
      station: skey,
      quality: 1,
      R: 580,
      seed: 7417,
      terrainH: env.terrainH,
      waterH: env.waterH,
      space: globalThis.KSPACE.create({ cell: 12 })
    });
    const placed = SH.PLACED.slice();
    stationPlaced[skey] = placed;

    for (const r of placed) {
      const spKey = r[0], px = r[1], py = r[2], pz = r[3], meta = r[6] || {};
      if (!SH.byKey[spKey]) badKeys++;
      totalBySpecies[spKey] = (totalBySpecies[spKey] || 0) + 1;

      if (spKey === 'porphyrypine') {
        if (!PHYS.porphyryDikeAt(px, pz, SITES[skey]).inDike || meta.inDike !== true) badPines++;
      }
      if (CALCIPHILE_TREES.has(spKey)) {
        if (PHYS.ecocideScarAt(px, pz, SITES[skey]).inBleachBelt || meta.inBleachBelt === true) badBleachTrees++;
      }
      if (spKey === 'tufabryum') {
        if (!(meta.skyOpenness01 >= 0.04 && meta.skyOpenness01 <= 0.42)) badTufa++;
      }
      if (UPLAND_TREES.has(spKey)) {
        const wy = env.waterH(px, pz);
        if (wy > -1e5 && py <= wy + 0.42) badWaterTrees++;
      }
    }
  }

  const unplaced = EXPECTED_25.filter(k => !(totalBySpecies[k] > 0));
  T.ok('all 25 species place across the 5 stations using their genuine species keys (' + EXPECTED_25.map(k => k + ':' + totalBySpecies[k]).join(', ') + ')',
    unplaced.length === 0 && badKeys === 0);

  T.ok('ecological invariants hold 100% across all 5 stations (porphyrypine inDike, calciphiles outside bleach core, tufabryum 0.04..0.42, upland trees > wy + 0.42 m)',
    badPines === 0 && badBleachTrees === 0 && badTufa === 0 && badWaterTrees === 0);

  const countOn = (skey, key) => stationPlaced[skey].filter(r => r[0] === key).length;
  const carnKeys = ['carnelian_organpipe', 'erythra_veil', 'agate_window', 'blood_strangler'];

  T.ok('25% Red Carnelian crazy-quilt crowns porphyryrelict in all 4 clades, places relicts on shutin & glade porphyry knobs, and contests glade Bleach-Scar with blood_strangler & bleachfireweed',
    carnKeys.every(k => countOn('porphyryrelict', k) > 0) &&
    countOn('shutin', 'agate_window') > 0 &&
    (countOn('shutin', 'carnelian_organpipe') + countOn('shutin', 'erythra_veil')) > 0 &&
    countOn('glade', 'agate_window') > 0 &&
    countOn('glade', 'blood_strangler') > 0 &&
    countOn('glade', 'bleachfireweed') > 0 &&
    countOn('glade', 'stranglervine') > 0);
}

T.done();
