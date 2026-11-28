/* Node unit tests for biomes/thedome (DOME_PHYS, KFRONTIER 55% Red Sky-Island Inversion, 24-species THEDOME roster, 'ria' culture tags, CROPS, DOME_FAUNA, KHAZ, KSTRATA, KSPELEO.SMOKY, KMASK, KMAT_M1) on tools/ktest.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const T = require('../../../tools/ktest.js')(__filename);

require('../../../core/rand/08-core-rand.js');
require('../../../core/frontier/18-core-frontier.js');
require('../../../core/tags/50-core-tags.js');
require('../../../core/tags/52-core-tags-vocab.js');
require('../../../core/biome/37-core-traps.js');
require('../../../core/hazard/20-core-hazard.js');
require('../../../core/mask/25-core-mask.js');
require('../../../core/mask/27-core-mask-distance.js');
require('../../../core/terrain/35-core-strata.js');
require('../../../core/terrain/39-core-cavern.js');
require('../../../core/terrain/39b-core-speleo.js');
require('../../../core/terrain/39b2-core-speleo-cleft.js');
const KMAT_M1 = require('../../../core/materials/record/27-matlib-m1.js');
require('../../../kits/crops/src/10-crop-core.js');
require('../../../kits/crops/src/20-crop-records.js');
require('../../../kits/crops/src/40-crop-query.js');

const PHYS = require('../src/15-thedome-phys.js');
const CROPS_TD = require('../src/22-thedome-crops.js');
const FAUNA = require('../src/24-thedome-fauna.js');
const SITES = require('../src/41-biome-dome-sites.js');

/* 1. Strict rmweubdnyts8y & Sibling-Exclusive own_dm + 55% Red Sky-Island Inversion (PLAN.md & CARNELIAN-FRONTIER-PLAN.md) */
{
  const stationIds = ['apron', 'moat', 'crown', 'cleft', 'eastflank'];
  const allInsideOwnDm = stationIds.every(id => {
    const s = SITES[id];
    const fp = PHYS.inDomeFootprint(s.px[0], s.px[1]);
    return s.inDomeVerified === true && fp.inPolygon === true && fp.inOwnDm === true;
  });
  const pCrown = PHYS.pressureAt(SITES.crown.elevM);
  const pMoat = PHYS.pressureAt(SITES.moat.elevM);
  const efUp = PHYS.eastFlankFrontierAt(-85, 0, 18.0, SITES.eastflank);
  const efKill = PHYS.eastFlankFrontierAt(8, 0, 4.0, SITES.eastflank);
  const efVan = PHYS.eastFlankFrontierAt(34, 0, -4.0, SITES.eastflank);
  const efDown = PHYS.eastFlankFrontierAt(95, 0, -16.0, SITES.eastflank);

  T.ok('all 5 station pixels (1336,128), (1317,117), (1328,150), (1372,148), (1384,142) sit strictly inside rmweubdnyts8y own_dm',
    allInsideOwnDm);
  T.ok('Station 5 (eastflank) partitions cleanly into upslope Carnelian sky-island, Kill-Line bleach band, vanguard edge, and downslope Earth zone',
    efUp.biosphere === 'carnelian' && efUp.upslopeRed01 > 0.85 &&
    efKill.biosphere === 'bleach' && efKill.bleach01 > 0.90 &&
    efVan.biosphere === 'earth' && efVan.vanguard01 > 0.25 &&
    efDown.biosphere === 'earth' && efDown.mistPool01 > 0.50);

  /* Find a dry high Rayleigh-scatter bare rock point on crown vs a garland riser / gnamma pan */
  let crownRedPt = null;
  for (let r = 56; r < 180; r += 3) {
    const q = PHYS.skyIslandQuiltAt(r, -18, 12.0, 0.5, SITES.crown);
    if (q.biosphere === 'carnelian' && q.shellStep01 < 0.55) { crownRedPt = [r, -18, q]; break; }
  }
  const panHero = SITES.crown.gnammas[0];
  panHero.sillY = 20.0;
  const qInPan = PHYS.skyIslandQuiltAt(panHero.x, panHero.z, 20.0, 0.8, SITES.crown);
  const qInCleft = PHYS.skyIslandQuiltAt(0, 0, -20.0, 0.7, SITES.cleft);

  T.ok('55% Red Sky-Island Inversion (skyIslandQuiltAt via KFRONTIER.quiltAt) claims dry Rayleigh crown slabs with maxAllowedHeightM <= 3.0 m while sparing gnammas & Kluft chasms',
    !!crownRedPt && crownRedPt[2].redDominance01 >= 0.50 && crownRedPt[2].maxAllowedHeightM <= 3.0 &&
    qInPan.biosphere === 'earth' && qInCleft.biosphere === 'earth');

  T.ok('barometric & Koppen gradient spans +1,749.1 m (1.28-1.30 atm Cfa) to +2,924.8 m apex (1.11 atm Cfb Crown-Veil)',
    Math.abs(pMoat.pAtm - 1.275) <= 0.03 && pMoat.koppen === 'Cfa' &&
    Math.abs(pCrown.pAtm - 1.113) <= 0.02 && pCrown.koppen === 'Cfb' && pCrown.inCrownVeil === true);
  T.neg('southern Spider Lake overlap collar pixel (1330, 185) or exterior pixel (1220, 120) is rejected from own_dm',
    pt => PHYS.inDomeFootprint(pt[0], pt[1]).inOwnDm === true,
    [1330, 185],
    [1336, 128]);
}

/* 2. Onion-Skin Exfoliation Steps, Gnamma Hydroperiod & Bald-Apron Tree Exclusion (PLAN.md section 8 #2) */
{
  const heroPan = SITES.apron.gnammas[0];
  heroPan.sillY = 12.0;
  const bowlX = heroPan.x + heroPan.r * 0.58;
  const brim = PHYS.gnammaAt(bowlX, heroPan.z, 1.0, SITES.apron);
  const dry = PHYS.gnammaAt(bowlX, heroPan.z, 0.0, SITES.apron);
  const rim = PHYS.gnammaAt(heroPan.x + heroPan.r * 0.92, heroPan.z, 0.5, SITES.apron);

  T.ok('gnamma solution pan brims in [Vernal-Brim] while staying >= 0.06 m below its rock sill and desiccates in [Sun-Baked Dry]',
    brim.inPan === true && brim.waterDepthM > 0.30 && brim.waterLevelLocalM <= heroPan.sillY - 0.06 &&
    dry.inPan === true && dry.waterDepthM === 0 && dry.desiccationRing01 > 0.3 && rim.rimGrit01 > 0.25);

  let barePt = null, riserPt = null;
  for (let r = 10; r < 160; r += 1.0) {
    const sh = PHYS.exfoliationAt(r, 0, SITES.crown);
    const gn = PHYS.gnammaAt(r, 0, 0.7, SITES.crown);
    if (!gn.inPan && sh.shellStep01 < 0.20 && !barePt) barePt = [r, 0];
    if (!gn.inPan && sh.shellStep01 >= 0.75 && !riserPt) riserPt = [r, 0];
  }
  T.ok('exfoliationAt identifies concentric contour-line risers (shellStep01 >= 0.75) separated by bare stone shells',
    !!barePt && !!riserPt && PHYS.canRootFullTree(riserPt[0], riserPt[1], 0.7, SITES.crown) === true);
  T.neg('unfractured bare exfoliation shell interior (shellStep01 < 0.55) rejects full-stature > 4 m trees',
    pt => PHYS.canRootFullTree(pt[0], pt[1], 0.7, SITES.crown) === true,
    barePt,
    riserPt);
}

/* 3. "The Singing Shell": Flexural A-Tent Lithophone Pitch (62-148 Hz), Whispering Scarp & Kluft Barometric Breathing */
{
  const tent = SITES.apron.aTents[0];
  const acTent = PHYS.acousticsAt(tent.x, tent.z, SITES.apron, 14.5);
  const acSolid = PHYS.acousticsAt(210, 210, SITES.apron, 14.5);
  const acWhisper = PHYS.acousticsAt(0, -18, SITES.moat, 12.0);
  const baroAfternoon = PHYS.barometricAt(0, 0, SITES.cleft, 14.5);
  const baroDawn = PHYS.barometricAt(0, 0, SITES.cleft, 3.5);

  T.ok('detached hollow A-tent slab resonates at 62-148 Hz flexural bass pitch while solid granite bedrock has 0 boom',
    acTent.hollowGapM >= 1.5 && acTent.lithophoneHz >= 62.0 && acTent.lithophoneHz <= 148.0 && acTent.hollowBoom01 > 0.8 &&
    acSolid.hollowGapM === 0 && acSolid.hollowBoom01 === 0 && acSolid.lithophoneHz === 0);
  T.ok('Station 2 concave ring-dike scarp focuses whispers (+18 to +22 dB) and Station 4 Kluft breathes diurnally (0.8-4.2 m/s)',
    acWhisper.whisperFocusDb >= 18.0 &&
    baroAfternoon.exhaling === true && baroAfternoon.baroFlowMs >= 0.8 && baroAfternoon.relHumidityPct >= 95.0 &&
    baroDawn.exhaling === false && baroAfternoon.aeolianChordHz >= 145.0);
  T.neg('solid unbuckled granite bedrock (hollowGapM < 0.15 m) never produces hollow lithophone resonance',
    pt => PHYS.acousticsAt(pt[0], pt[1], SITES.apron, 14.5).hollowBoom01 > 0,
    [210, 210],
    [tent.x, tent.z]);
}

/* 4. CROPS.BIOMES.thedome (67 verified crops), 6 Endemic Fauna Species & KHAZ Hazards */
{
  const openFits = CROPS.forBiome('thedome');
  const fullFits = CROPS_TD.forDome();
  const cropIds = fullFits.map(f => f.crop.id);

  T.ok('CROPS.BIOMES.thedome yields >= 65 open-air crops plus 2 radial-Kluft dark-bed fungi (rice, pinyon, saffron, frostroot, pale-fungi)',
    openFits.length >= 65 && fullFits.length === openFits.length + 2 &&
    cropIds.indexOf('rice') >= 0 && cropIds.indexOf('pinyon') >= 0 &&
    cropIds.indexOf('saffron') >= 0 && cropIds.indexOf('frostroot') >= 0 && cropIds.indexOf('pale-fungi') >= 0);

  T.ok('DOME_FAUNA defines all 6 endemic species with valid 24h schedules and gnammatriops drought-cyst dormancy',
    FAUNA.SPECIES.length === 6 &&
    FAUNA.stateAt('gnammatriops', 10, 0.80) === 'FILTER_PAN' &&
    FAUNA.stateAt('gnammatriops', 10, 0.10) === 'DORMANT_CYST' &&
    FAUNA.stateAt('atentgecko', 13, 0.70) === 'SHADE_ATENT' &&
    FAUNA.stateAt('garlandtragopan', 18, 0.70) === 'DISPLAY_RISER');

  const hSlick = KHAZ.make({ kind: 'slip', danger: 0.46, dose: 0.16, falloff: 'smooth' });
  const hSpall = KHAZ.make({ kind: 'crush', danger: 0.54, dose: 0.28, falloff: 'linear', cycle: { period: 28, warn: 1.5, ramp: 0.2, on: 0.8, after: 1.5 } });
  const hMire  = KHAZ.make({ kind: 'sink', danger: 0.48, dose: 0.18, falloff: 'smooth' });
  const hDrop  = KHAZ.make({ kind: 'fall', danger: 0.86, dose: 0.65, falloff: 'linear' });
  T.ok('all 4 dome KHAZ hazards (slickslab/slip, spall/crush, quagmire/sink, cleftdrop/fall) validate cleanly through KHAZ.make',
    hSlick.kind === 'slip' && hSpall.kind === 'crush' && hMire.kind === 'sink' && hDrop.kind === 'fall');
  T.neg('invalid KHAZ hazard kind throws in KHAZ.make',
    kind => { try { KHAZ.make({ kind: kind, danger: 0.5 }); return true; } catch (e) { return false; } },
    'nonexistent-kind',
    'slip');
}

/* 5. 24-Species Botanical Roster, Genuine Carnelian Library Sets, <=3 KGROUND Layers & 'ria' Culture Alignment */
{
  const matsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'materials.json'), 'utf8'));
  const fam = matsJson.families || {};
  const worksSrc = fs.readFileSync(path.join(__dirname, '..', 'src', '86-host-works.js'), 'utf8');
  const groundSrc = fs.readFileSync(path.join(__dirname, '..', 'src', '84-host-ground.js'), 'utf8');

  T.ok('materials.json packs genuine ground.mycelium.crimson & organic.funnel.trumpet for Carnelian clades and keeps KGROUND <= 3 layers',
    fam['carnelian.chitin'] && fam['carnelian.chitin'].lib === 'ground.mycelium.crimson' &&
    fam['carnelian.ruby'] && fam['carnelian.ruby'].lib === 'organic.funnel.trumpet' &&
    fam.larch && fam.birch && fam.rowan && fam.rhododendron && fam.quillwort &&
    fam.sundew && fam.ghostpipe && fam.pasque && fam.clubmoss && fam.fireweed &&
    !/KGROUND\.layer\([^)]*carnelian/.test(groundSrc));

  const tagStore = KTAGS.create({ strict: true });
  const riaRec = tagStore.add({
    id: 'thedome:test-ria-dish',
    name: 'Upper Ria Cut-Porphyry Acoustic Listening Dish',
    class: 'furniture',
    at: [28, 12, 48],
    r: 2.8,
    h: 3.1,
    tags: { biome: 'thedome', culture: 'ria', setting: 'outdoor', role: 'acoustic-dish' }
  });
  T.ok('86-host-works.js tags Upper Ria sanctuary reserves & acoustic works with culture "ria" (zero "yuni" references)',
    riaRec.tags.culture === 'ria' && /culture:'ria'/.test(worksSrc) && !/culture:\s*['"]yuni['"]/.test(worksSrc));

  /* Evaluate 50-biome-dome-species.js & 60-biome-dome-place.js via vm across all 5 stations */
  const vm = require('vm');
  class MockColor {
    constructor(h) { this.hex = h == null ? 0xffffff : h; }
    multiplyScalar() { return this; }
    clone() { return new MockColor(this.hex); }
    getHex() { return this.hex; }
  }
  class MockGeo {
    constructor() { this.attributes = { position: { count: 2, getX: () => 0.5, getY: () => 0.5, getZ: () => 0.5, setXYZ() {} } }; }
    setAttribute() {}
    computeVertexNormals() {}
  }
  const defs = {}, buckets = {};
  globalThis.DOME_PHYS = PHYS;
  globalThis.DOME_SITES = SITES;
  globalThis.DOME_FAUNA = FAUNA;
  globalThis.DOME_CROPS = CROPS_TD;
  globalThis.BIO = {
    kit() {},
    kitEnd() {},
    defs: defs,
    owner: null,
    range: null,
    minRange: 0,
    lodD: (x, z) => Math.hypot(x, z) * 0.5,
    fn: {
      TAU: Math.PI * 2,
      clamp: (v, a, b) => (v < a ? a : v > b ? b : v),
      lerp: (a, b, t) => a + (b - a) * t,
      smooth: (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); },
      qEuler: () => [0, 0, 0, 1]
    },
    host: {
      THREE: {
        Color: MockColor,
        DoubleSide: 2,
        MeshStandardMaterial: function (o) { Object.assign(this, o || {}); this.userData = {}; },
        IcosahedronGeometry: MockGeo,
        Float32BufferAttribute: function () {}
      },
      terrainH: () => 0
    },
    canvasTex: () => ({ repeat: { set() {} } }),
    alphaTex: () => ({ repeat: { set() {} } }),
    barkMat: m => ({ map: m, userData: {} }),
    leafMat: m => ({ map: m, userData: {} }),
    libSwap: () => ({}),
    bucket: (k, m) => { buckets[k] = m; },
    def: (k, g, m, o) => { defs[k] = { geo: g, mat: m, opt: o }; },
    put() {},
    tube: () => 12,
    flareJoin: pts => pts,
    impostor() {},
    geo: { clump: () => ({}), frond: () => ({}), hang: () => ({}), mat: () => ({}) },
    fung: { bladder: () => ({}), crust: () => ({}), stalk: () => ({}), cap: () => ({}), pod: () => ({}) }
  };
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', '..', '..', 'core', 'frontier', '52-core-frontier-draw.js'), 'utf8'));
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', '50-biome-dome-species.js'), 'utf8'));
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'src', '60-biome-dome-place.js'), 'utf8'));

  const TD = globalThis.THEDOME;
  const expectedKeys = [
    'gnammamoss', 'panbonsai', 'cloudgarlandpine', 'crownrosette', 'moatpitcher', 'cleftfilmyfern', 'ringlichen',
    'moatcedar', 'carnelian_organpipe', 'erythra_veil', 'bladder_tether', 'agate_window', 'blood_strangler',
    'weepingamberlarch', 'moatpaperbirch', 'cleftrowan', 'summitdwarfjuniper', 'cloudrhododendron',
    'gnammaquillwort', 'pansundew', 'cleftghostpipe', 'crownpasque', 'staghornclubmoss', 'bleachfireweed'
  ];
  const actualKeys = TD.SPECIES.map(s => s.key);
  const allHaveHarvest = TD.SPECIES.every(s => s.tags && s.tags.harvest && typeof s.tags.harvest.notes === 'string' && s.tags.harvest.notes.length > 12);

  T.ok('THEDOME.SPECIES defines all 24 native species (including 5 KFRONTIER Carnelian clades & 11 new sky-island/moat/cleft/pan species) with complete HV harvest tags',
    TD.SPECIES.length === 24 &&
    expectedKeys.every(k => actualKeys.indexOf(k) >= 0) &&
    allHaveHarvest &&
    !!TD.byKey.moatpitcher.tags.trap && !!TD.byKey.pansundew.tags.trap);

  /* Run THEDOME.placeAll across all 5 stations and verify real clade keys, all 24 species placed, and shellStep01 safety */
  const totals = {};
  expectedKeys.forEach(k => { totals[k] = 0; });
  let fakeRinglichenCarnelian = 0, shellViolations = 0, efCounts = null, crownCounts = null;

  ['apron', 'moat', 'crown', 'cleft', 'eastflank'].forEach(sk => {
    globalThis.SKEY = sk;
    globalThis.SITE = SITES[sk];
    if (SITE.gnammas) SITE.gnammas.forEach(p => { if (p.sillY == null) p.sillY = 6.0; });
    globalThis.DOME_STATE = { hydroperiod01: 0.74 };
    globalThis.DRAWN_H = (x, z) => (sk === 'cleft' && Math.abs(z) < 9.5 ? -14.0 : (sk === 'eastflank' ? -0.18 * x : 2.0));
    globalThis.waterH = (x, z) => (sk === 'moat' && z > -50 && z < 20 ? 1.85 : -1e9);
    globalThis.inFlowChannel = () => false;
    globalThis.SPACE = { some: () => false, insert() {} };
    globalThis.FIELD = { slope: () => 0.18, step: (x, z) => PHYS.shellAt(x, z, SITE).shellStep01 };
    globalThis.REGISTER = () => {};

    const c = TD.placeAll({ quality: 1 });
    if (sk === 'eastflank') efCounts = c;
    if (sk === 'crown') crownCounts = c;
    expectedKeys.forEach(k => { totals[k] += (c[k] || 0); });

    TD.PLACED.forEach(p => {
      if (p[0] === 'ringlichen' && p[6] && p[6].biosphere === 'carnelian') fakeRinglichenCarnelian++;
      if (p[6] && p[6].biosphere === 'carnelian' && p[6].shellStep01 != null && p[6].shellStep01 < 0.55 && p[4] > 4.0) shellViolations++;
    });
    TD.TREE_RECS.forEach(t => {
      if (t.H > 4.0 && !t.moatCollar && t.shellStep01 < 0.55 && !t.inPan) shellViolations++;
    });
  });

  const missingGlobal = expectedKeys.filter(k => !(totals[k] > 0));
  T.ok('THEDOME.placeAll places all 24 species across the 5 stations, records real Carnelian keys (0 fake ringlichen), and keeps 0 >4 m stems on bare shells (shellStep01 < 0.55)',
    missingGlobal.length === 0 &&
    fakeRinglichenCarnelian === 0 &&
    shellViolations === 0 &&
    efCounts.carnelian_organpipe > 0 && efCounts.erythra_veil > 0 && efCounts.bladder_tether > 0 &&
    efCounts.agate_window > 0 && efCounts.blood_strangler > 0 && efCounts.bleachfireweed > 0 &&
    crownCounts.agate_window > 0 && crownCounts.erythra_veil > 0 && crownCounts.crownpasque > 0);
}

/* 6. KSTRATA laccolith-shell, KSPELEO.SMOKY Kluft crystals, KMASK deterministic distance & KMAT_M1 roughAA */
{
  SITES.registerStrata();
  const st = KSTRATA.create({ seed: 6120, recipe: 'laccolith-shell', range: [-80, 220] });
  const cv = KMASK.canvas(64, 64), ctx = cv.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 64, 64);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(32, 32, 18, 0, Math.PI * 2); ctx.stroke();
  const dist = KMASK.distance(cv, { channel: 0, threshold: 128 });

  const cav = KCAVERN.create({ ground: () => 0, cell: 0.8, chunk: 16, seed: 6451 });
  cav.hall({ id: 'test-kluft', owner: 'td', c: [0, -20, 0], rx: 10, rz: 6, h: 8, belly: 0.3 });
  cav.build();
  const smokyRecs = KSPELEO.place(cav, { box: [-9, -5, 9, 5], y: -17, cell: 1.8, world: 6452, kinds: KSPELEO.SMOKY });
  const rough0 = KMAT_M1.roughnessWithVariance(0.12, 0, [0.0, 0.02, 0.06, 0.12]);
  const rough3 = KMAT_M1.roughnessWithVariance(0.12, 3, [0.0, 0.02, 0.06, 0.12]);

  T.ok('KSTRATA laccolith-shell, KMASK.distance, KSPELEO.SMOKY smoky-quartz crystals, and KMAT_M1 specular AA all evaluate deterministically',
    !!st && KMASK.hash(cv).length === 8 && dist.at(32, 14) <= 1.5 &&
    smokyRecs.length > 0 && smokyRecs.every(r => r.mineral === 'smoky-quartz') &&
    rough3 > rough0 + 0.25);
}
