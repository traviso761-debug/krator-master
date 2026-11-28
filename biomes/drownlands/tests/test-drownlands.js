// node biomes/drownlands/tests/test-drownlands.js — pure [G data] invariants & fault-injection negatives for DROWN_PHYS & DROWN_SITES
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
loadGlobal('biomes/drownlands/src/40-biome-drown-phys.js');
loadGlobal('biomes/drownlands/src/41-biome-drown-sites.js');

const P = DROWN_PHYS;
const S = DROWN_SITES;

/* 1. Two-source tsunami shoaling, +48 m central trimline, Ark-Ward trench escape vs Prou-Torre refuge */
const tsuShoal = P.tsunamiAt({ px: 145, py: 520, elevM: 6.1, depthM: 84, trenchDistM: 380, tier: 3 });
const tsuBar = P.tsunamiAt({ px: 195, py: 420, elevM: 14.5, depthM: 8.0, seamountDistKm: 174, trenchDistM: 2150, tier: 3 });
const tsuSkerry = P.tsunamiAt({ px: 145, py: 495, elevM: 72.0, depthM: 12.0, trenchDistM: 520, tier: 3 });

T.ok('central shoal & skerry set +48.0 m tsunami trimline and enable Ark-Ward escape over -84 m trench',
  tsuShoal.trimElevM === 48.0 && tsuSkerry.trimElevM === 48.0 &&
  tsuShoal.arkEscapeOk === true && tsuShoal.prouTorreReq === false &&
  tsuShoal.travelMinNear >= 14 && tsuShoal.travelMinNear <= 55 &&
  tsuShoal.travelHrFar >= 3.3 && tsuShoal.travelHrFar <= 6.5,
  JSON.stringify({ tsuShoal, tsuSkerry }));

T.ok('wide northern boulder-bar shoal (trench > 1.5 km away) requires Prou-Torre inundation refuge keep',
  tsuBar.shoalWaveM >= 38.0 && tsuBar.shoalWaveM <= 55.0 &&
  tsuBar.arkEscapeOk === false && tsuBar.prouTorreReq === true,
  JSON.stringify(tsuBar));

T.neg('Ark-Ward deep-water escape check rejects shallow wide shoals and accepts -84 m graben trench',
  cfg => P.tsunamiAt(cfg).arkEscapeOk === true,
  { px: 195, py: 420, elevM: 8.0, depthM: 9.0, trenchDistM: 2200, tier: 3 },
  { px: 145, py: 520, elevM: 6.1, depthM: 84.0, trenchDistM: 380, tier: 3 });

/* 2. Intertidal Lost-City brucite-aragonite hydrothermal chimney window (pH 10.5-11.8, 0.8-6.5 m) */
const brVent = P.bruciteStackAt({ ultramaficByte: 255, faultDistM: 28, waterDepthM: -1.8, tidalRangeM: 1.4, waveShearPa: 95 });
const brSed = P.bruciteStackAt({ ultramaficByte: 0, faultDistM: 28, waterDepthM: -1.8, tidalRangeM: 1.4, waveShearPa: 95 });
const brSurf = P.bruciteStackAt({ ultramaficByte: 255, faultDistM: 28, waterDepthM: -1.8, tidalRangeM: 1.4, waveShearPa: 360 });
const brCliff = P.bruciteStackAt({ ultramaficByte: 255, faultDistM: 28, waterDepthM: 4.5, tidalRangeM: 1.4, waveShearPa: 95 });

T.ok('sheltered ultramafic fault seep precipitates active pH >= 10.5 brucite-aragonite stack (0.8-6.5 m)',
  brVent.active === true && brVent.pH >= 10.5 && brVent.pH <= 11.8 &&
  brVent.stackHeightM >= 0.8 && brVent.stackHeightM <= 6.5 && brVent.turquoiseMilk01 > 0.25,
  JSON.stringify(brVent));

T.ok('brucite chimneys stay inactive on sedimentary rock, heavy outer-bar surf, and dry cliffs',
  brSed.active === false && brSurf.active === false && brCliff.active === false,
  JSON.stringify({ brSed, brSurf, brCliff }));

T.neg('brucite-stack precipitation rejects sedimentary coal bed and accepts ultramafic detachment seep',
  cfg => P.bruciteStackAt(cfg).active === true,
  { ultramaficByte: 0, faultDistM: 25, waterDepthM: -1.6, waveShearPa: 85 },
  { ultramaficByte: 255, faultDistM: 25, waterDepthM: -1.6, waveShearPa: 85 });

T.neg('brucite-stack precipitation rejects surf-hammered bar (>= 320 Pa) and accepts sheltered shoal',
  cfg => P.bruciteStackAt(cfg).active === true,
  { ultramaficByte: 255, faultDistM: 30, waterDepthM: -1.5, waveShearPa: 380 },
  { ultramaficByte: 255, faultDistM: 30, waterDepthM: -1.5, waveShearPa: 90 });

/* 3. Nickel-hyperaccumulating teal-sap mangroves vs +48 m refuge-crown araucaria trimline */
const nmShore = P.nickelMangroveAt({ ultramaficByte: 255, niByte: 180, elevM: 1.8, trimElevM: 48.0, waveShearPa: 95 });
const nmCrown = P.nickelMangroveAt({ ultramaficByte: 255, niByte: 180, elevM: 64.0, trimElevM: 48.0, waveShearPa: 145 });
const nmSed = P.nickelMangroveAt({ ultramaficByte: 0, niByte: 0, elevM: 3.5, trimElevM: 47.0, waveShearPa: 55 });

T.ok('ultramafic shore enables 18-24.5% Ni teal-sap prop-roots while barring rigid araucaria below +48 m',
  nmShore.propRootOk === true && nmShore.latexNiPct >= 18.0 && nmShore.latexNiPct <= 24.5 &&
  nmShore.refugeTreeOk === false && nmShore.grainStapleOk === false,
  JSON.stringify(nmShore));

T.ok('high >= +48 m skerry crown unlocks refuge araucaria while sedimentary neck allows grain/taro',
  nmCrown.refugeTreeOk === true && nmCrown.propRootOk === false &&
  nmSed.propRootOk === false && nmSed.coppiceShrubOk === false && nmSed.grainStapleOk === true,
  JSON.stringify({ nmCrown, nmSed }));

T.neg('nickel prop-root mangrove rejects sedimentary coal lagoon and accepts ultramafic skerry margin',
  cfg => P.nickelMangroveAt(cfg).propRootOk === true,
  { ultramaficByte: 0, niByte: 0, elevM: 1.5, trimElevM: 47.0, waveShearPa: 60 },
  { ultramaficByte: 255, niByte: 180, elevM: 1.5, trimElevM: 48.0, waveShearPa: 95 });

T.neg('refuge-crown araucaria rejects < +48 m tsunami-swept skerry bench and accepts >= +48 m crown',
  cfg => P.nickelMangroveAt(cfg).refugeTreeOk === true,
  { ultramaficByte: 255, niByte: 180, elevM: 22.0, trimElevM: 48.0, waveShearPa: 140 },
  { ultramaficByte: 255, niByte: 180, elevM: 54.0, trimElevM: 48.0, waveShearPa: 140 });

/* 4. Subsiding drowned-valley snag lagoon & <= +1.8 m oyster collar ceiling */
const snLagoon = P.snagLagoonAt({ sedimentary01: 1.0, coalByte: 214, elevM: -2.2, subsidenceM: 6.2, shelter01: 0.85 });
const snUltra = P.snagLagoonAt({ sedimentary01: 0.0, coalByte: 0, elevM: -2.2, subsidenceM: 6.2, shelter01: 0.85 });

T.ok('subsided sedimentary coal lagoon preserves drowned snags with oyster collars strictly <= +1.80 m',
  snLagoon.snagOk === true && snLagoon.snagDensity01 > 0.3 &&
  snLagoon.collarTopM >= 0.65 && snLagoon.collarTopM <= 1.80 && snUltra.snagOk === false,
  JSON.stringify({ snLagoon, snUltra }));

T.neg('drowned-snag grove rejects ultramafic shoal and accepts subsided sedimentary coal basin',
  cfg => P.snagLagoonAt(cfg).snagOk === true,
  { sedimentary01: 0.0, coalByte: 0, elevM: -2.0, subsidenceM: 6.0, shelter01: 0.85 },
  { sedimentary01: 1.0, coalByte: 214, elevM: -2.0, subsidenceM: 6.0, shelter01: 0.85 });

/* 5. Submarine shoalkelp bathymetric gate (strictly bedY <= -0.5 m and >= -28.0 m) */
const sfShoal = P.shoalFloraAt({ elevM: -6.5, waveShearPa: 95, sand01: 0.65 });
const sfDry = P.shoalFloraAt({ elevM: 0.8, waveShearPa: 95, sand01: 0.65 });
const sfTrench = P.shoalFloraAt({ elevM: -84.0, waveShearPa: 40, sand01: 0.2 });

T.ok('shoalkelp grows across sunlit -28..-0.5 m shoals and terminates at both dry land and -84 m trench',
  sfShoal.kelpOk === true && sfShoal.seagrassOk === true && sfShoal.kelpLenM > 4.0 &&
  sfDry.kelpOk === false && sfTrench.kelpOk === false,
  JSON.stringify({ sfShoal, sfDry, sfTrench }));

T.neg('shoalkelp bathymetric gate rejects subaerial beach (+0.4 m) and accepts submarine shoal (-5.0 m)',
  cfg => P.shoalFloraAt(cfg).kelpOk === true,
  { elevM: 0.4, waveShearPa: 90, sand01: 0.5 },
  { elevM: -5.0, waveShearPa: 90, sand01: 0.5 });

/* 6. Six-zone ecotone classifier, tide modes, surveyed station sites & crops/fauna contracts */
const zBrucite = P.ecotoneAt({ elevM: -1.4, ultramaficByte: 255, niByte: 180, faultDistM: 22, waveShearPa: 90 });
const zProp = P.ecotoneAt({ elevM: 3.0, ultramaficByte: 255, niByte: 180, faultDistM: 180, waveShearPa: 110 });
const zBar = P.ecotoneAt({ elevM: 8.0, ultramaficByte: 255, niByte: 180, faultDistM: 200, waveShearPa: 310 });
const zSnag = P.ecotoneAt({ elevM: -1.8, ultramaficByte: 0, niByte: 0, coalByte: 214, waveShearPa: 55, shelter01: 0.85 });
const zRefuge = P.ecotoneAt({ elevM: 75.0, ultramaficByte: 255, niByte: 180, trimElevM: 48.0, waveShearPa: 145 });

T.ok('ecotoneAt partitions bruciteflat, propwood, boulderbar, snaglagoon and refugeskerry cleanly',
  zBrucite.zone === 'bruciteflat' && zProp.zone === 'propwood' && zBar.zone === 'boulderbar' &&
  zSnag.zone === 'snaglagoon' && zRefuge.zone === 'refugeskerry',
  JSON.stringify({ z1: zBrucite.zone, z2: zProp.zone, z3: zBar.zone, z4: zSnag.zone, z5: zRefuge.zone }));

const tdDraw = P.tideState('Drawdown');
const tdSwell = P.tideState('Swell');
T.ok('tideState models -9.5 m Ghost-Tsunami drawdown (260 Hz alert) and +5.5 m bore surge',
  tdDraw.levelM === -9.5 && tdDraw.drawdown === true && tdDraw.hydrophoneHz === 260 &&
  tdSwell.levelM === 5.5 && tdSwell.flexRad > 0.5);

T.ok('DROWN_SITES defines shoal (145,520), bar (195,420), drowned (95,545) and skerry (145,495) with valid brucite pool heights',
  S.shoal.px[0] === 145 && S.shoal.px[1] === 520 &&
  S.bar.px[0] === 195 && S.bar.px[1] === 420 &&
  S.drowned.px[0] === 95 && S.drowned.px[1] === 545 && S.drowned.ultramaficByte === 0 && S.drowned.coalByte === 214 &&
  S.skerry.px[0] === 145 && S.skerry.px[1] === 495 && S.skerry.trimElevM === 48.0 &&
  S.shoal.brucitePools.every(p => p.level >= 0.12 && p.rimH - p.level >= 0.04) &&
  DROWN_FAUNA.length === 6);

const coStrand = P.coconutStrandAt({ elevM: 4.2, ultramaficByte: 255, tidalRangeM: 1.4, brucite01: 0, bruciteActive: false, waveShearPa: 95, shelter01: 0.72, slope: 0.12 });
const coBrucite = P.coconutStrandAt({ elevM: 4.2, ultramaficByte: 255, tidalRangeM: 1.4, brucite01: 0.55, bruciteActive: true, waveShearPa: 95, shelter01: 0.72, slope: 0.12 });
const coScarp = P.coconutStrandAt({ elevM: 32.0, ultramaficByte: 255, tidalRangeM: 1.5, brucite01: 0, bruciteActive: false, waveShearPa: 215, shelter01: 0.52, slope: 0.25, trimElevM: 48.0, isHorstSkerry: true });
const coCove = P.coconutStrandAt({ elevM: 3.4, ultramaficByte: 255, tidalRangeM: 1.5, brucite01: 0, bruciteActive: false, waveShearPa: 85, shelter01: 0.84, slope: 0.10, trimElevM: 48.0, isHorstSkerry: true });
T.ok('coconutStrandAt accepts sheltered leeward strand pockets (pH 5..8.8) and rejects caustic pH > 9.5 brucite pools and scoured horst scarps',
  coStrand.strandOk === true && coStrand.pH >= 5.0 && coStrand.pH <= 8.8 &&
  coCove.strandOk === true && coBrucite.strandOk === false && coScarp.strandOk === false,
  JSON.stringify({ coStrand, coCove, coBrucite, coScarp }));

T.neg('coconutStrandAt rejects caustic pH 11.4 brucite sinter pool and accepts sheltered pH 7.05 lagoon levee',
  cfg => P.coconutStrandAt(cfg).strandOk === true,
  { elevM: 3.5, ultramaficByte: 255, tidalRangeM: 1.4, brucite01: 0.65, bruciteActive: true, waveShearPa: 90, shelter01: 0.75, slope: 0.08 },
  { elevM: 3.5, ultramaficByte: 0, tidalRangeM: 1.5, brucite01: 0, bruciteActive: false, waveShearPa: 55, shelter01: 0.85, slope: 0.08 });

const dlCrops = CROPS.forBiome('drownlands');
const cropIds = dlCrops.map(r => r.crop.id);
const dlCoco = dlCrops.find(r => r.crop.id === 'coconut');
T.ok('CROPS.forBiome(drownlands) resolves wild coconut, kelp, eelgrass and taro across shoal, drowned and highskerry zones',
  dlCrops.length >= 18 && cropIds.indexOf('kelp') >= 0 && cropIds.indexOf('coconut') >= 0 && dlCoco && dlCoco.how === 'wild' && cropIds.indexOf('taro') >= 0,
  'count=' + dlCrops.length + ', coconut=' + (dlCoco && dlCoco.how));

const dlSpSrc = fs.readFileSync(path.join(ROOT, 'biomes/drownlands/src/50-biome-drown-species.js'), 'utf8');
const reqDl = [
 'verdigrismangrove','tealcoppice','brucitestack','spongecoral','tidefan','shoalkelp','ribbonseagrass','snaggrove',
 'limeshelf','seepcomb','stormwrack','coconut','araucaria','pycnandra','gymnostoma','verdigris',
 'refugekauri','skerrypaperbark','skerryphyllanthus','skerrysedge','skerrypitcher','skerrycasuarina',
 'skerrypandan','skerryhibiscus','skerrynaupaka','greymangrove','byssusmussel','skerryoyster','halimedaturf'
];
const missDl = reqDl.filter(k => dlSpSrc.indexOf("key:'" + k + "'") < 0);
T.ok('50-biome-drown-species.js registers all 29 canonical species including coconut (Cocos nucifera) with HV tags',
  missDl.length === 0 && dlSpSrc.indexOf("coconut:HV(") >= 0 && dlSpSrc.indexOf("['coconuts']") >= 0 && dlSpSrc.indexOf('BIO.alphaTex(512') >= 0,
  'missing=' + missDl.join(','));

T.done();
