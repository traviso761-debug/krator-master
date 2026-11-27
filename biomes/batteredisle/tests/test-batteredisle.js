// Node unit test for biomes/batteredisle ([G data] physics, sites, crops, fauna & M2 specular AA):
//   node biomes/batteredisle/tests/test-batteredisle.js
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const T = require('../../../tools/ktest.js')(__filename);

const HERE = path.resolve(__dirname, '..');
const ROOT = path.resolve(HERE, '..', '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const ctx = { console: console, Math: Math, JSON: JSON, Object: Object, Array: Array, Number: Number };
ctx.globalThis = ctx;
vm.createContext(ctx);

[
 'core/rand/08-core-rand.js',
 'core/materials/record/27-matlib-m1.js',
 'kits/crops/src/10-crop-core.js',
 'kits/crops/src/20-crop-records.js',
 'kits/crops/src/22-crop-material.js',
 'kits/crops/src/40-crop-query.js',
 'biomes/batteredisle/src/28-batter-mipvar.js',
 'biomes/batteredisle/src/40-biome-batter-phys.js',
 'biomes/batteredisle/src/41-biome-batter-sites.js'
].forEach(f => vm.runInContext(read(f), ctx, { filename: f }));

const { BATTER_PHYS, BATTER_FAUNA, BATTER_SITES, CROPS, KMAT_M1, KMAT_MIPVAR } = ctx;

/* 1. Asymmetric megatsunami trimline: WNW direct exposure (+55..+62 m) vs ESE/SSE island wave-shadow (+14..+22 m) */
const tsWNW = BATTER_PHYS.tsunamiShadowAt({ azFromCenterDeg: 278, coastSlope: 0.16, shoalDepthM: 95, tier: 3 });
const tsLee = BATTER_PHYS.tsunamiShadowAt({ azFromCenterDeg: 135, coastSlope: 0.12, shoalDepthM: 28, tier: 3 });
T.ok('WNW tsunami exposure sets trimline >= +55 m and megaboulders >= 2 m',
 tsWNW.exposedWNW === true && tsWNW.trimElevM >= 55.0 && tsWNW.trimElevM <= 62.0 && tsWNW.boulderMaxM >= 2.0,
 JSON.stringify(tsWNW));
T.ok('ESE/SSE island wave-shadow attenuates trimline to +14..+22 m',
 tsLee.exposedWNW === false && tsLee.trimElevM >= 14.0 && tsLee.trimElevM <= 22.0,
 JSON.stringify(tsLee));
T.neg('canopy tree elevation check catches trees below WNW +55 m trimline',
 elev => elev >= tsWNW.trimElevM,
 28.0,
 62.0);

/* 2. Bimodal worn cinder-cone lithology: ultramafic plug/cone (Ni=180) vs upturned SE coal collar (coal=201) */
const conePlug = BATTER_PHYS.cinderConeAt({ px: 474, py: 248, elevM: 868.8 });
const coneCollar = BATTER_PHYS.cinderConeAt({ px: 494, py: 250, elevM: 24.0 });
const coneBench = BATTER_PHYS.cinderConeAt({ px: 444, py: 244, elevM: 18.0 });
T.ok('summit volcanic neck (474, 248, +868.8 m) is ultramafic columnar basalt (Ni=180, coal=0)',
 conePlug.lithology === 'ultramafic' && conePlug.plugColumnar01 > 0.85 && conePlug.nickelByte === 180 && conePlug.coalCollarByte === 0,
 JSON.stringify(conePlug));
T.ok('SE strait collar (494, 250) exposes sedimentary upturned coal=201 seam (Ni=0)',
 coneCollar.lithology === 'sedimentary' && coneCollar.coalCollarByte >= 160 && coneCollar.nickelByte === 0,
 JSON.stringify(coneCollar));
T.ok('WNW tsunami abrasion bench (< trimline) strips loose scoria to 0 m',
 coneBench.scoriaDepthM === 0,
 'scoriaDepthM=' + coneBench.scoriaDepthM);
T.neg('metallophyte nickelmyrtle substrate gate rejects sedimentary collar',
 sub => sub === 'ultramafic',
 coneCollar.lithology,
 conePlug.lithology);

/* 3. Extinct cinder-cone pneumatic wave-compression blowhole physics (ZERO volcanic vents!) */
const bhActive = BATTER_PHYS.blowholeAt({ dikeRib01: 0.85, palagonite01: 0.65, elevM: 14, coastDistM: 22, waveEnergy: 1.15, swellPhase: 0.25, exposedWNW: true, drawdownM: 0 });
const bhDrawdown = BATTER_PHYS.blowholeAt({ dikeRib01: 0.85, palagonite01: 0.65, elevM: 14, coastDistM: 22, waveEnergy: 1.15, swellPhase: 0.25, exposedWNW: true, drawdownM: -12 });
const bhLee = BATTER_PHYS.blowholeAt({ dikeRib01: 0.85, palagonite01: 0.65, elevM: 14, coastDistM: 22, waveEnergy: 1.15, swellPhase: 0.25, exposedWNW: false, drawdownM: 0 });
T.ok('WNW dike-palagonite blowhole fires [12, 34] m non-volcanic spray plume with 28-55 Hz boom',
 bhActive.active === true && bhActive.volcanic === false && bhActive.jetHeightM >= 12 && bhActive.jetHeightM <= 34 && bhActive.boomHz >= 28 && bhActive.boomHz <= 55,
 JSON.stringify(bhActive));
T.ok('tsunami -12 m drawdown and leeward coves silence blowhole compression',
 bhDrawdown.active === false && bhLee.active === false);
T.neg('blowhole validator rejects hydrothermal/volcanic flag',
 rec => rec.active === true && rec.volcanic === false && rec.jetHeightM >= 12 && rec.jetHeightM <= 34,
 { active: true, volcanic: true, jetHeightM: 20 },
 bhActive);

/* 4. Basal palagonite tuff-contact freshwater springs & wind-shear ship-knees */
const spGood = BATTER_PHYS.springLineAt({ elevM: 42, scoriaDepthM: 2.4, palagonite01: 0.78, upslopeCatchKm2: 2.2 });
const spDry = BATTER_PHYS.springLineAt({ elevM: 820, scoriaDepthM: 0.0, palagonite01: 0.05, upslopeCatchKm2: 0.1 });
T.ok('basal palagonite aquitard contact (+42 m) discharges potable freshwater spring > 2 L/s',
 spGood.seepFlowLs > 2.0 && spGood.fernPocket01 > 0.3 && spDry.seepFlowLs === 0,
 JSON.stringify(spGood));
const ws = BATTER_PHYS.windShearAt({ elevM: 185, azFromCenterDeg: 280, gullyShelter01: 0 });
T.ok('exposed WNW ridge shears tree crowns ESE with curved ship-knee wood grade > 0.5',
 ws.leanRad > 0.35 && ws.leanDirAzDeg === 102 && ws.shipKneeGrade01 > 0.5,
 JSON.stringify(ws));

/* 5. Station catalogue, custom KSTRATA columns, CROPS.BIOMES.batteredisle & M2 specular AA */
T.ok('all 4 stations (cove, rampart, strait, plug) and aliases resolve cleanly',
 BATTER_SITES.ORDER.length === 4 &&
 BATTER_SITES.get('portcove').key === 'cove' &&
 BATTER_SITES.get('archcove').key === 'strait' &&
 BATTER_SITES.get('plugcrest').key === 'plug');
T.ok('all 3 custom worn-cone KSTRATA columns and 6 fauna schedules are present',
 Object.keys(BATTER_SITES.STRATA).length === 3 && BATTER_FAUNA.length === 6);

const cropList = CROPS.forBiome('batteredisle', { underground: true, works: ['cellar'], nodes: ['coal', 'iron'] });
const cropKeys = cropList.map(c => (c.crop && c.crop.id) || c.id || c);
const cocoEntry = cropList.find(c => ((c.crop && c.crop.id) || c.id) === 'coconut');
T.ok('CROPS.forBiome(batteredisle) yields wild coconut, sweet-potato, taro, tea, and kelp',
 cropList.length >= 13 && !!cocoEntry && cocoEntry.how === 'wild' &&
 cropKeys.indexOf('sweet-potato') >= 0 && cropKeys.indexOf('taro') >= 0 && cropKeys.indexOf('tea') >= 0 && cropKeys.indexOf('kelp') >= 0,
 'crops=' + cropList.length + ' coco=' + JSON.stringify(cocoEntry));

/* 6. Drift-sown coconut (Cocos nucifera) wave-shadow strand physics & species HV metadata */
const csLee = BATTER_PHYS.coconutStrandAt({ exposedWNW: false, hasSea: true, elevASL: 9.5, seaClearM: 9.5, slope: 0.16, dikeRib01: 0.08, azFromCenterDeg: 138 });
const csRampart = BATTER_PHYS.coconutStrandAt({ exposedWNW: true, hasSea: true, elevASL: 12.0, seaClearM: 12.0, slope: 0.14, dikeRib01: 0.10, azFromCenterDeg: 278 });
const csPlug = BATTER_PHYS.coconutStrandAt({ exposedWNW: false, hasSea: false, elevASL: 710.0, seaClearM: 710.0, slope: 0.22, dikeRib01: 0.15, azFromCenterDeg: 280 });
const csSurf = BATTER_PHYS.coconutStrandAt({ exposedWNW: false, hasSea: true, elevASL: 1.2, seaClearM: 1.2, slope: 0.12, dikeRib01: 0.0, azFromCenterDeg: 140 });
T.ok('coconutStrandAt accepts sheltered ESE/SSE wave-shadow coves (+3..+45 m) and rejects WNW scour rampart, +868 m plug, and surf zone',
 csLee.strandOk === true && csLee.suitability01 > 0.4 &&
 csRampart.strandOk === false && csPlug.strandOk === false && csSurf.strandOk === false,
 JSON.stringify(csLee));
T.neg('coconutStrandAt rejects wave-planed WNW rampart and accepts sheltered leeward cove',
 rec => rec.strandOk === true,
 csRampart,
 csLee);

const spSrc = read('biomes/batteredisle/src/50-biome-batter-species.js');
const reqKeys = [
 'batteredlaurel', 'ironkneepodocarp', 'nickelmyrtle', 'scoriathrift', 'cindersedge', 'covepandan', 'tuffcress', 'soundkelp',
 'coconut', 'seatamanu', 'seahibiscus', 'craterfern', 'beachsheoak', 'saltnaupaka', 'cinderglory', 'archfern',
 'olivinesheoak', 'nickelphyllanthus', 'springsundew', 'coalhorsetail', 'rampartpalm', 'corallineturf', 'cliffsamphire', 'plugohia', 'plugcushion'
];
const missSp = reqKeys.filter(k => spSrc.indexOf("key: '" + k + "'") < 0);
T.ok('50-biome-batter-species.js registers all 25 canonical species including coconut (Cocos nucifera) with HV tags',
 missSp.length === 0 &&
 spSrc.indexOf('Cocos nucifera') >= 0 &&
 spSrc.indexOf("['coconuts']") >= 0 &&
 spSrc.indexOf('palmFrond') >= 0 &&
 spSrc.indexOf('BATTER.HARVEST') >= 0,
 'missing=' + missSp.join(','));

const rBase = 0.35;
const rFar = KMAT_M1.roughnessWithVariance(rBase, 5.0, KMAT_MIPVAR['rock.basalt']);
T.ok('KMAT_M1 M2 mipVariance widens distant wet basalt roughness monotonically without exceeding 1',
 rFar > rBase + 0.05 && rFar <= 1.0,
 'rBase=' + rBase + ' -> rFar=' + rFar);

/* Determinism check */
const detA = JSON.stringify(BATTER_PHYS.cinderConeAt({ px: 438, py: 258, localX: 42, localZ: -88, elevM: 64 }));
const detB = JSON.stringify(BATTER_PHYS.cinderConeAt({ px: 438, py: 258, localX: 42, localZ: -88, elevM: 64 }));
T.ok('BATTER_PHYS is bit-identical across repeated calls', detA === detB);

T.done();
