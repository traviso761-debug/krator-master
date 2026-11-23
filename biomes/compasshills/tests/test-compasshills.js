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

T.done();
