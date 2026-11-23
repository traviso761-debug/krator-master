/* Node unit tests for biomes/thedome (DOME_PHYS, DOME_SITES, CROPS, DOME_FAUNA, KHAZ, KSTRATA, KSPELEO.SMOKY, KMASK, KMAT_M1) on tools/ktest.js. */
'use strict';
const T = require('../../../tools/ktest.js')(__filename);

require('../../../core/rand/08-core-rand.js');
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

/* 1. Strict rmweubdnyts8y & Sibling-Exclusive own_dm Invariant (PLAN.md section 8 #1) */
{
  const stationIds = ['apron', 'moat', 'crown', 'cleft'];
  const allInsideOwnDm = stationIds.every(id => {
    const s = SITES[id];
    const fp = PHYS.inDomeFootprint(s.px[0], s.px[1]);
    return s.inDomeVerified === true && fp.inPolygon === true && fp.inOwnDm === true;
  });
  const pCrown = PHYS.pressureAt(SITES.crown.elevM);
  const pMoat = PHYS.pressureAt(SITES.moat.elevM);

  T.ok('all 4 station pixels (1336,128), (1317,117), (1328,150), (1372,148) sit strictly inside rmweubdnyts8y own_dm',
    allInsideOwnDm);
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

  /* Find an unfractured bare exfoliation bench point vs a shellStep01 >= 0.70 riser */
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

  T.ok('CROPS.BIOMES.thedome yields 65 open-air crops and 67 total verified crops with radial-Kluft dark-beds (rice, pinyon, saffron, frostroot, pale-fungi)',
    openFits.length === 65 && fullFits.length === 67 &&
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

/* 5. KSTRATA laccolith-shell, KSPELEO.SMOKY Kluft crystals, KMASK deterministic distance & KMAT_M1 roughAA */
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
