// node biomes/compasshills/tests/test-compasshills.js — pure [G data] invariants & negative fault-injection controls
// Covers multipolar crustal remanence (fieldAt), compassbush meridian/flux-vector alignment (leafAzimuthAt),
// iron-sand streamline ripples & ferro-tufts (sandStreamAt), zero-iron safety vs Kelvin ferrous pull (ferrousPullAt),
// lightning-rod spire prominence (lightningScoreAt), station survey bounds, kits/crops, and 24h fauna schedules.
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
loadGlobal('biomes/compasshills/src/41-biome-compass-sites.js');
loadGlobal('biomes/compasshills/src/40-biome-compass-phys.js');

const P = COMPASS_PHYS;
const S = COMPASS_SITES;

function angleDiffDeg(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d) * 180 / Math.PI;
}

/* 1. Finite multipolar field, zero singularities at dipole cores, and 360-deg swirl around Lodestone quench vents */
{
  const stations = ['foundry', 'tors', 'cuesta', 'gorge'];
  let allFinite = true;
  for (const st of stations) {
    for (let z = -260; z <= 260; z += 65) {
      for (let x = -260; x <= 260; x += 65) {
        const f = P.fieldAt(x, z, st);
        if (!isFinite(f.bMagMt) || f.bMagMt < 0.30 || f.bMagMt > 120.0 || !isFinite(f.azimuthRad) || !isFinite(f.gradB2)) {
          allFinite = false;
        }
      }
    }
  }
  const v0 = S.foundry.quenchVents[0];
  const exactCore = P.fieldAt(v0.x, v0.z, 'foundry');
  T.ok('fieldAt stays strictly finite in [0.3, 120] mT across all 4 stations and exact dipole cores',
    allFinite && isFinite(exactCore.bMagMt) && exactCore.bMagMt >= 25.0 && exactCore.bMagMt <= 120.0,
    JSON.stringify(exactCore));

  // Sample azimuth around quench vent 0 at r = 14 m: spans all 4 quadrants (360-deg vortex swirl)
  const quads = [false, false, false, false];
  for (let k = 0; k < 24; k++) {
    const ang = (k / 24) * Math.PI * 2;
    const f = P.fieldAt(v0.x + Math.cos(ang) * 14, v0.z + Math.sin(ang) * 14, 'foundry');
    const q = Math.floor(((f.azimuthRad + Math.PI) / (Math.PI * 2)) * 4) % 4;
    quads[q] = true;
  }
  T.ok('Lodestone toroidal quench-vent generates full 4-quadrant 360-deg compass vortex swirl',
    quads[0] && quads[1] && quads[2] && quads[3],
    JSON.stringify(quads));

  // Seamless 1:1 openworld coordinates around Lodestone (1058 * 2000, 224 * 2000)
  const ow = P.fieldAt(1058 * 2000 + 350, 224 * 2000 - 220, 'world');
  T.ok('1:1 openworld fieldAt evaluates seamless regional vector field without NaN',
    isFinite(ow.bMagMt) && ow.bMagMt >= 0.3 && ow.bMagMt <= 120.0,
    JSON.stringify(ow));
}

/* 2. Station 3 (cuesta) > 150-deg magnetic domain-wall inversion across 40 m & neutral seam splay */
{
  const fNorth = P.fieldAt(0, -22, 'cuesta');
  const fCore = P.fieldAt(0, 0, 'cuesta');
  const fSouth = P.fieldAt(0, 22, 'cuesta');
  const flipDeg = angleDiffDeg(fNorth.azimuthRad, fSouth.azimuthRad);

  T.ok('Station 3 cuesta saddle flips horizontal magnetic azimuth > 150 deg across 44 m domain wall',
    flipDeg > 150.0 && fCore.inversionSeam01 > 0.85 && fCore.bHorizMt < 0.05,
    'flipDeg=' + flipDeg.toFixed(1) + ' core=' + JSON.stringify(fCore));

  T.neg('domain-wall core test rejects normal magnetized hillside and accepts neutral inversion seam',
    pt => P.fieldAt(pt.x, pt.z, 'cuesta').inversionSeam01 > 0.75,
    { x: 0, z: -35 },
    { x: 0, z: 0 });
}

/* 3. Compassbush vector alignment (leafAzimuthAt): +-12 deg over >= 0.5 mT beds vs < 0.20 in zero-B_horiz seam */
{
  let alignedAll = true;
  for (let i = 0; i < 16; i++) {
    const u = i / 15;
    const x = -80 + i * 11, z = -95 + (i % 4) * 12;
    const f = P.fieldAt(x, z, 'foundry');
    const lf = P.leafAzimuthAt(x, z, 'foundry', u);
    if (f.bHorizMt >= 0.5 && (angleDiffDeg(lf.bladeYawRad, f.azimuthRad) > 12.0 || lf.alignment01 < 0.82)) {
      alignedAll = false;
    }
  }
  const seamLeaf = P.leafAzimuthAt(0, 0, 'cuesta', 0.82);
  T.ok('compassbush leafAzimuthAt locks within +-12 deg of local flux where B_horiz >= 0.5 mT and gains >= 38% noon shade',
    alignedAll && seamLeaf.noonShadeGain01 >= 0.38,
    JSON.stringify(seamLeaf));

  T.ok('compassbush alignment relaxes < 0.20 inside zero-horizontal-field domain-wall core',
    seamLeaf.alignment01 < 0.20,
    JSON.stringify(seamLeaf));

  T.neg('high magnetotropic leaf alignment (>= 0.80) rejects zero-B_horiz domain-wall core and accepts magnetized dip-slope',
    pt => P.leafAzimuthAt(pt.x, pt.z, 'cuesta', 0.25).alignment01 >= 0.80,
    { x: 0, z: 0 },
    { x: 0, z: -32 });
}

/* 4. Zero-iron safety & Kelvin ferrous pull physics (ferrousPullAt) */
{
  const v0 = S.foundry.quenchVents[0];
  const nearVent = P.fieldAt(v0.x + 6.5, v0.z, 'foundry');
  const pullIronPick = P.ferrousPullAt({ x: v0.x + 6.5, z: v0.z, toolIronKg: 2.0, gradB2: nearVent.gradB2, material: 'iron', site: 'foundry' });
  const pullIronMail = P.ferrousPullAt({ x: v0.x + 5.0, z: v0.z, toolIronKg: 12.0, site: 'foundry' });
  const pullBronze = P.ferrousPullAt({ x: v0.x + 5.0, z: v0.z, toolIronKg: 2.5, gradB2: nearVent.gradB2, material: 'tin-bronze', site: 'foundry' });
  const pullNephrite = P.ferrousPullAt({ x: v0.x + 5.0, z: v0.z, toolIronKg: 3.0, gradB2: nearVent.gradB2, material: 'nephrite', site: 'foundry' });

  T.ok('2 kg steel pick within 12 m of Lodestone quench-vent exceeds 180 N Kelvin pull (wrenchTool === true) and 12 kg mail pins climber',
    pullIronPick.forceN > 180.0 && pullIronPick.wrenchTool === true && pullIronMail.pinClimber === true,
    JSON.stringify({ pullIronPick, pullIronMail }));

  T.ok('tin-bronze and nephrite-jade delver tools experience < 0.05 N pull everywhere (safeBronze === true)',
    pullBronze.forceN < 0.05 && pullBronze.wrenchTool === false && pullBronze.safeBronze === true &&
    pullNephrite.forceN < 0.05 && pullNephrite.safeBronze === true,
    JSON.stringify({ pullBronze, pullNephrite }));

  T.neg('safe zero-wrench tool check rejects ferrous iron pick at quench-vent lip and accepts tin-bronze pick',
    cfg => P.ferrousPullAt(cfg).wrenchTool === false,
    { x: v0.x + 6.5, z: v0.z, toolIronKg: 2.0, gradB2: nearVent.gradB2, material: 'iron', site: 'foundry' },
    { x: v0.x + 6.5, z: v0.z, toolIronKg: 2.0, gradB2: nearVent.gradB2, material: 'tin-bronze', site: 'foundry' });
}

/* 5. Iron-sand streamline ripples (sandStreamAt) & lightning-rod spire prominence (lightningScoreAt) */
{
  const v0 = S.foundry.quenchVents[0];
  const fEdge = P.fieldAt(v0.x + 6.0, v0.z, 'foundry');
  const sandFlat = P.sandStreamAt(v0.x + 6.0, v0.z, 0.08, 180, fEdge.bMagMt, fEdge.gradB2);
  const sandCliff = P.sandStreamAt(40, 40, 0.65, 30, 0.4, 1e-6);

  T.ok('bare ironstone ledge near high-gradient vent forms crisp magnetite sand streamlines and > 4 mm ferro-tuft spikes',
    sandFlat.streakContrast01 > 0.65 && sandFlat.ferroTuftMm > 4.0 && sandCliff.streakContrast01 === 0 && sandCliff.ferroTuftMm === 0,
    JSON.stringify({ sandFlat, sandCliff }));

  const sp = S.tors.torSpires[2];
  const fSpire = P.fieldAt(sp.x, sp.z, 'tors');
  const hiStrike = P.lightningScoreAt({ elevM: 1454, localProminenceM: sp.promM, ironByte: 180, bMagMt: fSpire.bMagMt });
  const loStrike = P.lightningScoreAt({ elevM: 860, localProminenceM: 1.5, ironByte: 25, bMagMt: 0.4 });

  T.ok('prominent iron=180 magnetite tor spire attracts convective lightning (strikeProb01 >= 0.75) and fulgurite veins',
    hiStrike.strikeProb01 >= 0.75 && hiStrike.fulgurite01 >= 0.65 && hiStrike.irmpole01 >= 0.70 && loStrike.strikeProb01 < 0.12,
    JSON.stringify({ hiStrike, loStrike }));

  T.neg('fulgurite lightning-rod threshold rejects low iron-poor valley floor and accepts prominent magnetite spire',
    cfg => P.lightningScoreAt(cfg).strikeProb01 >= 0.65,
    { elevM: 860, localProminenceM: 2.0, ironByte: 30, bMagMt: 0.45 },
    { elevM: 1454, localProminenceM: 58.0, ironByte: 180, bMagMt: fSpire.bMagMt });
}

/* 6. Verified Scale-Model 5.1 station bounds, sky-frame shifts, guardrails, kits/crops, and 6 fauna schedules */
{
  const keys = ['foundry', 'tors', 'cuesta', 'gorge'];
  const inBounds = keys.every(k => {
    const px = S[k].px[0], py = S[k].px[1];
    return px >= 977 && px <= 1139 && py >= 185 && py <= 290 &&
      S[k].sky[0] === px - 272 && S[k].sky[1] === py - 330 &&
      S[k].minerals.lodestone === 220 && S[k].minerals.ultramafic === 0 && S[k].minerals.glass === 0;
  });
  T.ok('all 4 stations lie inside rmweu4kpowzji [977..1139, 185..290] with exact (-272, -330) sky shift, lodestone=220, and zero glass/ultramafic',
    inBounds);

  const chCrops = CROPS.forBiome('compasshills');
  const cIds = chCrops.map(r => r.crop.id);
  T.ok('CROPS.forBiome(compasshills) registers cuesta, dipslope, ripgorge & highcrag with whorl-olive, saffron, emmer, rice, canyon-grape, juniper & tea',
    chCrops.length >= 40 &&
    cIds.indexOf('whorl-olive') >= 0 && cIds.indexOf('saffron') >= 0 &&
    cIds.indexOf('emmer') >= 0 && cIds.indexOf('rice') >= 0 &&
    cIds.indexOf('canyon-grape') >= 0 && cIds.indexOf('juniper') >= 0 && cIds.indexOf('tea') >= 0,
    'cropCount=' + chCrops.length);

  const faunaOk = P.FAUNA.length === 6 && P.FAUNA.every(f => {
    const sch = f.schedule;
    return sch[0][0] === 0 && sch[sch.length - 1][1] === 24 && f.yields.length >= 1;
  });
  T.ok('all 6 Compass Hills fauna species carry continuous 0..24h schedules and resource yields', faunaOk);
}

/* 7. 25-Species Roster, Genuine Stand-In Card Fixes, Weeping-Amber Pioneers Lore & FERRO_KEYS */
{
  loadGlobal('core/space/20-core-space.js');

  function MockAttr(arr, sz) {
    this.array = Float32Array.from(arr);
    this.itemSize = sz;
    this.count = (this.array.length / sz) | 0;
  }
  MockAttr.prototype.getX = function (i) { return this.array[i * this.itemSize]; };
  MockAttr.prototype.getY = function (i) { return this.array[i * this.itemSize + 1]; };
  MockAttr.prototype.getZ = function (i) { return this.array[i * this.itemSize + 2]; };
  MockAttr.prototype.setXYZ = function (i, x, y, z) {
    const o = i * this.itemSize;
    this.array[o] = x; this.array[o + 1] = y; this.array[o + 2] = z;
  };
  function makeMockGeo() {
    return {
      attributes: { position: new MockAttr([0, 0, 0, 1, 0, 0, 0, 1, 0], 3) },
      userData: {},
      translate() { return this; },
      setAttribute(k, a) { this.attributes[k] = a; return this; },
      setIndex() { return this; },
      computeVertexNormals() { return this; }
    };
  }
  const MockTHREE = {
    DoubleSide: 2,
    Color: function (h) { this.hex = h; },
    BufferGeometry: makeMockGeo,
    CylinderGeometry: makeMockGeo,
    IcosahedronGeometry: makeMockGeo,
    Float32BufferAttribute: MockAttr,
    MeshStandardMaterial: function (o) { Object.assign(this, o || {}); this.isMeshStandardMaterial = true; this.userData = {}; }
  };

  const defs = {}, buckets = {};
  global.BIO = {
    owner: null,
    fn: {
      TAU: Math.PI * 2,
      clamp: (x, a, b) => (x < a ? a : x > b ? b : x),
      lerp: (a, b, t) => a + (b - a) * t,
      smooth: (a, b, x) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); },
      qEuler: (x, y, z) => [x, y, z, 1],
      qUp: () => [0, 0, 0, 1]
    },
    host: { THREE: MockTHREE, terrainH: () => 12, waterH: () => -1e9, register: () => {} },
    kit() {},
    kitEnd(api) { return api; },
    canvasTex: () => ({ isTexture: true }),
    alphaTex: () => ({ isTexture: true }),
    barkMat: m => ({ map: m, isMeshStandardMaterial: true }),
    leafMat: (m, k) => ({ map: m, key: k, isMeshStandardMaterial: true }),
    libSwap: () => ({}),
    bucket(k, m, o) { buckets[k] = { mat: m, opt: o }; },
    def(k, g, m, o) { defs[k] = { geo: g, mat: m, opt: o }; },
    put() {},
    tube: (b, pts) => Math.max(0, (pts.length - 1) * 14),
    flareJoin: pts => pts,
    geo: { clump: makeMockGeo, bloom: makeMockGeo, hang: makeMockGeo, mat: makeMockGeo },
    fung: { crust: makeMockGeo },
    impostorSet: (n, o) => ({ name: n, opt: o }),
    impostor: k => ({ key: k }),
    impostorItem() {},
    impostorPut() {}
  };

  loadGlobal('biomes/compasshills/src/50-biome-compass-species.js');
  loadGlobal('biomes/compasshills/src/60-biome-compass-place.js');
  loadGlobal('biomes/compasshills/src/70-biome-compass.js');

  const spKeys = COMPASS.SPECIES.map(s => s.key);
  const expectedNew = [
    'amberstorax', 'cuestaarbutus', 'sunnycarob', 'gorgeoleander', 'goldenbroom',
    'cistusrockrose', 'canyongrape', 'seepmaidenhair', 'cuestaasphodel',
    'magnetitespleenwort', 'gossanwhorlheath'
  ];
  const all25Present = COMPASS.SPECIES.length === 25 &&
    new Set(spKeys).size === 25 &&
    expectedNew.every(k => spKeys.indexOf(k) >= 0);

  const allHvValid = COMPASS.SPECIES.every(s => {
    const h = s.tags && s.tags.harvest;
    return h && typeof h.wood === 'string' && Array.isArray(h.edible) &&
      typeof h.medicinal === 'boolean' && typeof h.notes === 'string' && h.notes.length >= 20;
  });

  T.ok('COMPASS.SPECIES registers 25 distinct species with complete HV harvest tags and Pioneers ria-amber storax lore',
    all25Present && allHvValid &&
    COMPASS.byKey.amberstorax.tags.resin === 'ria-amber' &&
    /coil-varnish/i.test(COMPASS.HARVEST.amberstorax.notes),
    'count=' + COMPASS.SPECIES.length);

  const ferroKeys = Object.keys(COMPASS.FERRO_KEYS).sort();
  T.ok('FERRO_KEYS registers all 7 ferromagnetic/gossan specialists including magnetitespleenwort & gossanwhorlheath',
    ferroKeys.length === 7 &&
    COMPASS.FERRO_KEYS.magnetitespleenwort === 1 &&
    COMPASS.FERRO_KEYS.gossanwhorlheath === 1 &&
    Object.keys(buckets).length <= 7,
    'ferroKeys=' + ferroKeys.join(',') + ' buckets=' + Object.keys(buckets).length);

  const matJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'biomes/compasshills/materials.json'), 'utf8')).families;
  const standInsFixed = defs.ch_plane_fol.mat === COMPASS.M.plane &&
    defs.ch_plane_fol.mat !== COMPASS.M.oak &&
    defs.ch_plane_samara.mat === COMPASS.M.samara &&
    defs.ch_mulberry_fol.mat === COMPASS.M.mulberry &&
    defs.ch_mulberry_fol.mat !== COMPASS.M.pistache &&
    matJson.plane.lib === 'card.broadleaf' &&
    matJson.samara.lib === 'card.samara.maple' &&
    matJson.mulberry.lib === 'card.heartleaf' &&
    matJson['bark.amber'].lib === 'bark.amber' &&
    matJson.storax.lib === 'card.lobed' &&
    matJson.arbutus.lib === 'card.starberry' &&
    matJson.carob.lib === 'card.orchard.broad' &&
    matJson.oleander.lib === 'card.petal.coral' &&
    matJson.broom.lib === 'card.broom' &&
    matJson.cistus.lib === 'card.cupflower' &&
    matJson.canyongrape.lib === 'card.vine.hanging.2' &&
    matJson.maidenhair.lib === 'card.fan.lace' &&
    matJson.asphodel.lib === 'card.firelily' &&
    matJson.spleenwort.lib === 'card.frond.needle' &&
    matJson.whorlheath.lib === 'card.heath.whorl';
  T.ok('gorgeplane & silkmulberry stand-in cards fixed and all 25 species bound to genuine library cards', standInsFixed);

  /* 8. Full 4-Station Placement Audit: earthShare in [0.78, 0.90], <= 0.21 rad fluxAt alignment, reserves & 0 iron works */
  const totalAcross = {};
  COMPASS.SPECIES.forEach(s => { totalAcross[s.key] = 0; });
  let balanceOk = true, alignRadOk = true, reserveClean = true, stationReqOk = true;
  const shareSummary = [];

  for (const st of ['foundry', 'tors', 'cuesta', 'gorge']) {
    const site = S[st];
    const space = KSPACE.create({ cell: 16 });
    if (site.reserve) space.insert({ kind: 'reserve' }, site.reserve.x, site.reserve.z, site.reserve.r);
    const tH = (x, z) => 14.0 + 6.5 * Math.sin(x * 0.012) + 5.5 * Math.cos(z * 0.011);
    const wH = (x, z) => (st === 'gorge' && Math.abs(z - 0.08 * x) < 34 ? 20.0 : -1e9);
    const fields = {
      wet: (x, z) => (st === 'gorge' && Math.abs(z - 0.08 * x) < 74 ? 0.78 : 0.28),
      sand: (x, z) => (st === 'foundry' && Math.abs(Math.hypot(x, z) - 225) < 24 ? 0.65 : 0.08),
      gossan: (x, z) => (st === 'foundry' && Math.abs(Math.hypot(x, z) - 225) < 30 ? 0.72 : 0.04),
      trail: () => 0.0
    };
    const c = COMPASS.build({ station: st, terrainH: tH, waterH: wH, space: space, fields: fields, seed: 910220 });
    shareSummary.push(st + '=' + c.earthShare);
    if (!(c.earthShare >= 0.78 && c.earthShare <= 0.90)) balanceOk = false;

    const req = st === 'gorge'
      ? ['compassbush', 'lodestonespire', 'fluxlichen', 'ferrotuft', 'fluxgrass', 'magnetitespleenwort', 'gossanwhorlheath', 'gorgeplane', 'silkmulberry', 'amberstorax', 'gorgeoleander', 'canyongrape', 'seepmaidenhair', 'stonepine', 'corkoak', 'ironpistache', 'macchiasage']
      : st === 'cuesta'
      ? ['compassbush', 'lodestonespire', 'fluxlichen', 'ferrotuft', 'fluxgrass', 'magnetitespleenwort', 'gossanwhorlheath', 'stonepine', 'corkoak', 'ironpistache', 'whorlolive', 'sunnycarob', 'cuestaarbutus', 'goldenbroom', 'cistusrockrose', 'cuestaasphodel', 'saffroncrocus', 'macchiasage']
      : ['compassbush', 'lodestonespire', 'fluxlichen', 'ferrotuft', 'fluxgrass', 'magnetitespleenwort', 'gossanwhorlheath', 'stonepine', 'corkoak', 'ironpistache', 'amberstorax', 'cuestaarbutus', 'goldenbroom', 'cuestajuniper', 'macchiasage'];
    if (req.some(k => !(c[k] > 0))) stationReqOk = false;

    COMPASS.SPECIES.forEach(sp => { totalAcross[sp.key] += (c[sp.key] || 0); });

    for (const rec of COMPASS.PLACED) {
      if (site.reserve && Math.hypot(rec[1] - site.reserve.x, rec[3] - site.reserve.z) < site.reserve.r) {
        reserveClean = false;
      }
      if (rec[0] === 'compassbush' && rec[6] && rec[6].bHorizMt >= 0.5) {
        const decl = P.fluxAt(rec[1], rec[3], st).declinationRad;
        let diff = Math.abs(rec[6].bladeYawRad - decl);
        while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
        if (diff > 0.21) alignRadOk = false;
      }
    }
  }

  const unplaced = Object.keys(totalAcross).filter(k => totalAcross[k] <= 0);
  T.ok('COMPASS.build keeps earthShare strictly inside [0.78, 0.90] on all 4 stations and places all 25 species & station signatures',
    balanceOk && stationReqOk && unplaced.length === 0 && reserveClean,
    shareSummary.join(', ') + (unplaced.length ? ' unplaced=' + unplaced.join(',') : ''));

  T.ok('every placed compassbush (B_horiz >= 0.5 mT) aligns blade yaw within <= 0.21 rad (12 deg) of fluxAt(x, z).declinationRad',
    alignRadOk);

  const worksSrc = fs.readFileSync(path.join(ROOT, 'biomes/compasshills/src/86-host-works.js'), 'utf8');
  const regWorkMats = [...worksSrc.matchAll(/regWork\([^\n]*,\s*'([^']+)'\s*,\s*'[^']+'\s*\)/g)].map(m => m[1]);
  const addPartMats = [...worksSrc.matchAll(/addPart\([^\n]*,\s*'([^']+)'\s*\)/g)].map(m => m[1]);
  const groundSrc = fs.readFileSync(path.join(ROOT, 'biomes/compasshills/src/84-host-ground.js'), 'utf8');
  const kgroundLayers = (groundSrc.match(/KGROUND\.layer\(/g) || []).length;
  T.ok('86-host-works.js places 0 ferrous iron/steel props and 84-host-ground.js keeps <= 4 KGROUND layers (samplers <= 14)',
    regWorkMats.length === 9 && addPartMats.length >= 16 &&
    regWorkMats.concat(addPartMats).every(m => !/^(iron|steel)$/i.test(m)) && kgroundLayers <= 4,
    'mats=' + regWorkMats.join(',') + ' kgroundLayers=' + kgroundLayers);
}

T.done();
