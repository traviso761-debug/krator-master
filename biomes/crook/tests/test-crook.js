/* Node unit tests for biomes/crook (CROOK_PHYS, CROOK_SITES, CROPS zones, and FAUNA schedules) on tools/ktest.js. */
'use strict';
const path = require('path');
const T = require('../../../tools/ktest.js')(__filename);

require('../../../core/rand/08-core-rand.js');
const PHYS = require('../src/40-biome-crook-phys.js');
const SITES = require('../src/41-biome-crook-sites.js');

// 1. +65 m tsunami trimline & sponge/woody partition (sprayTrimAt)
{
  const low = PHYS.sprayTrimAt({elevM: 24, coastDistKm: 0.25, wnwExposure01: 0.9, calderaShelter01: 0.0, silicaByte: 150});
  const high = PHYS.sprayTrimAt({elevM: 78, coastDistKm: 0.35, wnwExposure01: 0.9, calderaShelter01: 0.0, silicaByte: 150});
  const lagoon = PHYS.sprayTrimAt({elevM: 38, coastDistKm: 0.2, wnwExposure01: 0.3, calderaShelter01: 0.92, silicaByte: 150});
  const draw = PHYS.sprayTrimAt({elevM: 18, coastDistKm: 0.2, wnwExposure01: 0.9, silicaByte: 150, drawdownM: 12});

  T.ok('exposed Crookshore sets +65 m trimline and +65 m safe town elevation', low.trimElevM === 65 && low.safeTownElevM === 65);
  T.ok('< +65 m basalt bench hosts lithistid sponges and forbids woody trees', low.basaltSpongeOk === true && low.woodyOk === false);
  T.ok('>= +65 m fog belt hosts canopy sponges and woody rainforest, forbidding basalt sponges', high.woodyOk === true && high.canopySpongeOk === true && high.basaltSpongeOk === false);
  T.ok('baffled caldera lagoon lowers local trimline while keeping safeTownElevM >= 65 m', lagoon.trimElevM >= 28 && lagoon.trimElevM <= 42 && lagoon.safeTownElevM >= 65);
  T.ok('pre-bore Ghost Tsunami drawdown seals lithistid sponge ostia', draw.ostiaOpen01 < 0.05 && low.ostiaOpen01 > 0.95);
  T.neg('basalt sponges fail on silica-poor substrate (< 100) or above +65 m',
    inp => PHYS.sprayTrimAt(inp).basaltSpongeOk === true,
    {elevM: 22, coastDistKm: 0.2, wnwExposure01: 0.9, silicaByte: 40},
    {elevM: 22, coastDistKm: 0.2, wnwExposure01: 0.9, silicaByte: 150});
  T.neg('woody trees are rejected below trimline on exposed coast',
    inp => PHYS.sprayTrimAt(inp).woodyOk === true,
    {elevM: 42, coastDistKm: 0.2, wnwExposure01: 0.85, silicaByte: 150},
    {elevM: 72, coastDistKm: 0.2, wnwExposure01: 0.85, silicaByte: 150});
}

// 2. Fluvial-incision invariance & southern-hemisphere aspect split (talwegSeepAt & aspectClimateAt)
{
  const gentle = PHYS.talwegSeepAt({elevM: 1450, slope: 0.12, talwegDistM: 45, qLocalM3s: 120, incision01: 0.15, rainMm: 1180});
  const incised = PHYS.talwegSeepAt({elevM: 1450, slope: 0.28, talwegDistM: 45, qLocalM3s: 120, incision01: 0.85, rainMm: 1180});
  const sunnyN = PHYS.aspectClimateAt({elevM: 1850, nx: 0.15, nz: 0.65, rainMm: 880, leeShelter01: 0.45, gorgeMist01: 0.1});
  const shadedS = PHYS.aspectClimateAt({elevM: 1850, nx: -0.1, nz: -0.65, rainMm: 1250, leeShelter01: 0.0, gorgeMist01: 0.65});

  T.ok('V-gorge incision boosts gorge mist and bedrock wall seepage without NaN', incised.gorgeMist01 > gentle.gorgeMist01 && incised.seepDischarge01 > gentle.seepDischarge01);
  T.ok('southern-hemisphere N-facing lee slope is sunny Csa/Dsb leeslope while S-facing wall is shaded gorge', sunnyN.sunny01 > 0.65 && sunnyN.zoneBand === 'leeslope' && shadedS.sunny01 < 0.35 && shadedS.zoneBand === 'gorge');
  T.ok('barometric pressure follows scale height from 1.60 atm coast to ~1.20 atm gorge and ~1.07 atm tarn',
    Math.abs(PHYS.aspectClimateAt({elevM: 0}).pAtm - 1.60) < 0.01 &&
    PHYS.aspectClimateAt({elevM: 2250}).pAtm < 1.25 &&
    PHYS.aspectClimateAt({elevM: 3200}).pAtm < 1.10);
  T.neg('shaded poleward gorge wall cannot be classified as dry sunny leeslope',
    inp => PHYS.aspectClimateAt(inp).zoneBand === 'leeslope',
    {elevM: 1800, nx: 0, nz: -0.7, rainMm: 1300, leeShelter01: 0, gorgeMist01: 0.6},
    {elevM: 1800, nx: 0.1, nz: 0.7, rainMm: 820, leeShelter01: 0.5, gorgeMist01: 0.05});
}

// 3. Skarn, nephrite, iron & malachite biomineral gating (biomineralAt)
{
  const skarn = PHYS.biomineralAt({jadeByte: 200, skarnByte: 200, ironByte: 255, copperByte: 60, tinByte: 200, seepDischarge01: 0.72, incision01: 0.8, slope: 0.38});
  const malachite = PHYS.biomineralAt({jadeByte: 200, skarnByte: 120, ironByte: 255, copperByte: 130, tinByte: 200, seepDischarge01: 0.45, incision01: 0.5, slope: 0.26});
  const barren = PHYS.biomineralAt({jadeByte: 0, skarnByte: 0, ironByte: 20, copperByte: 0, tinByte: 0, seepDischarge01: 0.5, incision01: 0.4, slope: 0.2});

  T.ok('Crookwash skarn seeps drive porcelain silica frond glaze and metallic cedar bark scales >= 0.5', skarn.silicaGlaze01 >= 0.5 && skarn.rustScale01 >= 0.5);
  T.ok('Crookhead copper-iron moraines drive malachite cushion rind chelation >= 0.5', malachite.malachiteRind01 >= 0.5);
  T.neg('unmineralized clay alluvium fails skarn/malachite indicator threshold (>= 0.05)',
    inp => { const b = PHYS.biomineralAt(inp); return b.silicaGlaze01 >= 0.05 || b.rustScale01 >= 0.05 || b.malachiteRind01 >= 0.05; },
    {jadeByte: 0, skarnByte: 0, ironByte: 20, copperByte: 0, seepDischarge01: 0.5, incision01: 0.4, slope: 0.2},
    {jadeByte: 200, skarnByte: 200, ironByte: 255, copperByte: 130, seepDischarge01: 0.7, incision01: 0.7, slope: 0.35});
}

// 4. Monotone rimstone bog step geometry (rimstoneAt)
{
  let prevLvl = 1e9, monotone = true, lipsValid = true;
  for (let i = 0; i < 14; i++) {
    const baseE = 1520 - i * 0.75;
    const r = PHYS.rimstoneAt({x: -80 + i * 6, z: -60 + i * 4, baseElevM: baseE, topElevM: 1525, slope: 0.18, seepDischarge01: 0.68, ironByte: 255, jadeByte: 200, seed: 5201});
    if (!r.active || r.lipHeightM < 0.25 || r.lipHeightM > 0.95) lipsValid = false;
    if (r.poolLevelM > prevLvl + 1e-6) monotone = false;
    prevLvl = r.poolLevelM;
  }
  T.ok('rimstone terrace pool levels step monotonically downslope with lip heights in [0.25, 0.95] m', monotone && lipsValid);
  T.neg('rimstone terraces deactivate on cliffs (slope > 0.45) or dry ground (seep < 0.2)',
    inp => PHYS.rimstoneAt(inp).active === true,
    {baseElevM: 1500, topElevM: 1520, slope: 0.62, seepDischarge01: 0.12, ironByte: 200, jadeByte: 200},
    {baseElevM: 1500, topElevM: 1520, slope: 0.18, seepDischarge01: 0.65, ironByte: 200, jadeByte: 200});
}

// 5. Thermogenic +15 degC hearth-ring snow-well physics (thermogenicWellAt)
{
  const well = PHYS.thermogenicWellAt({tAirC: -3.0, snowPackM: 0.55, starchReserve01: 0.9, colonyRadiusM: 0.56, peatByte: 140});
  T.ok('hearth-ring rosette holds +14..+17 degC core warmth and melts 1.1..2.2 m circular snow well',
    well.coreTempC >= 14.0 && well.coreTempC <= 17.0 && well.meltWellRadiusM >= 0.55 && well.meltWellRadiusM <= 1.10);
  T.neg('zero snowpack or depleted starch produces zero snow-melt well radius',
    inp => PHYS.thermogenicWellAt(inp).meltWellRadiusM > 0,
    {tAirC: -3.0, snowPackM: 0.0, starchReserve01: 0.0, colonyRadiusM: 0.55, peatByte: 140},
    {tAirC: -3.0, snowPackM: 0.55, starchReserve01: 0.85, colonyRadiusM: 0.55, peatByte: 140});
}

// 6. Aero-acoustic resonance & Silent Vales Great Hush decoupling (aeroResonanceAt & hushAt)
{
  const westHush = PHYS.hushAt({x: 60, z: 0, passLineX: 195, passNormalXZ: [1, 0], bandWidthM: 120});
  const eastHush = PHYS.hushAt({x: 280, z: 0, passLineX: 195, passNormalXZ: [1, 0], bandWidthM: 120});
  const bamboo = PHYS.aeroResonanceAt({culmDiaM: 0.095, chamberLenM: 0.34, apertureDiaM: 0.024, pAtm: 1.20, windSpeedMs: 7.5, hushSuppression01: 0});
  const chimneyWest = PHYS.aeroResonanceAt({culmDiaM: 0.032, chamberLenM: 0.28, apertureDiaM: 0.012, pAtm: 0.88, windSpeedMs: 9.0, hushSuppression01: westHush.suppression01});
  const chimneyEast = PHYS.aeroResonanceAt({culmDiaM: 0.032, chamberLenM: 0.28, apertureDiaM: 0.012, pAtm: 0.88, windSpeedMs: 22.0, hushSuppression01: eastHush.suppression01});

  T.ok('1.20 atm chambered canyon bamboo hums in [140, 300] Hz', bamboo.f0Hz >= 140 && bamboo.f0Hz <= 300 && bamboo.audible01 > 0.6);
  T.ok('0.88 atm alpine seed-chimneys sigh in [360, 660] Hz west of the Silent Vales pass', chimneyWest.f0Hz >= 360 && chimneyWest.f0Hz <= 660 && chimneyWest.audible01 > 0.6);
  T.ok('inside Silent Vales Great Hush audible01 drops to exact 0 while visualWindScale stays 1.0',
    eastHush.suppression01 === 1 && chimneyEast.audible01 === 0 && eastHush.visualWindScale === 1.0 && westHush.visualWindScale === 1.0);
  T.neg('Great Hush suppresses aero-acoustic sound even in 22 m/s gale',
    inp => PHYS.aeroResonanceAt(inp).audible01 > 0,
    {culmDiaM: 0.032, chamberLenM: 0.28, apertureDiaM: 0.012, pAtm: 0.88, windSpeedMs: 22.0, hushSuppression01: 1.0},
    {culmDiaM: 0.032, chamberLenM: 0.28, apertureDiaM: 0.012, pAtm: 0.88, windSpeedMs: 9.0, hushSuppression01: 0.0});
}

// 7. Station survey records, zero ultramafic rock, & 7 fauna 24h schedules
{
  const keys = ['shore', 'wash', 'head'];
  const skyMatch = keys.every(k => SITES[k].sky[0] === SITES[k].px[0] - 272 && SITES[k].sky[1] === SITES[k].px[1] - 330);
  const zeroUltra = keys.every(k => SITES[k].minerals.ultramafic === 0);
  const fullSched = PHYS.FAUNA.length === 7 && PHYS.FAUNA.every(f => {
    const s = f.schedule;
    return s[0][0] === 0 && s[s.length - 1][1] === 24 && f.yields.length > 0;
  });
  T.ok('shore, wash, and head stations carry exact sky-frame shifts (-272, -330) and 0% ultramafic rock', skyMatch && zeroUltra);
  T.ok('all 7 Crook fauna & pollinator records carry continuous 0..24h schedules and yields', fullSched);
}

// 8. Drift-sown coastal coconut niche gating & CROPS.BIOMES.crook registration
{
  const fs = require('fs');
  const vm = require('vm');
  const ROOT = path.resolve(__dirname, '..', '..', '..');
  const cctx = { globalThis: null };
  cctx.globalThis = cctx;
  vm.createContext(cctx);
  for (const rel of [
    'core/rand/08-core-rand.js',
    'kits/crops/src/10-crop-core.js',
    'kits/crops/src/20-crop-records.js',
    'kits/crops/src/21-crop-termites.js',
    'kits/crops/src/22-crop-material.js',
    'kits/crops/src/24-crop-vale-wild.js',
    'kits/crops/src/40-crop-query.js'
  ]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), cctx, { filename: rel });
  }
  const fits = PHYS.registerCrops(cctx.CROPS) || [];
  const cocoFit = fits.find(r => r.crop && r.crop.id === 'coconut');
  const cfHow = cocoFit ? cctx.CROPS.fitZone(cocoFit.crop, PHYS.CROPS.zones.cloudforest, 2, 'crook') : 'no';
  T.ok('CROOK_PHYS.registerCrops enables coconut in warm coastal crookshore/cloudforest zones',
    !!cocoFit && cfHow === 'rain');

  const okCaldera = PHYS.coconutAt({station: 'shore', elevM: 76, slope: 0.22, nx: 0.15, nz: 0.45, calderaShelter01: 0.65, wnwExposure01: 0.4});
  const okBench = PHYS.coconutAt({station: 'crater', elevM: 84, slope: 0.14, nx: 0.2, nz: 0.55, calderaShelter01: 0.15, reserveNear01: 0.75});
  T.ok('frost-free Crookshore/crater benches (+65.5..+116 m) accept drift-sown coconut palms', okCaldera.ok === true && okBench.ok === true);
  T.neg('coconuts are rejected below +65 m tsunami trimline on exposed basalt spray-benches',
    inp => PHYS.coconutAt(inp).ok === true,
    {station: 'shore', elevM: 28, slope: 0.12, nx: 0.1, nz: 0.5, calderaShelter01: 0.0, wnwExposure01: 0.9},
    {station: 'shore', elevM: 78, slope: 0.18, nx: 0.1, nz: 0.55, calderaShelter01: 0.5, wnwExposure01: 0.5});
  T.neg('coconuts are rejected on cold montane/alpine gorge, skarn, tarn, and hushpass stations',
    inp => PHYS.coconutAt(inp).ok === true,
    {station: 'head', elevM: 80, slope: 0.12, nx: 0.1, nz: 0.6, calderaShelter01: 0.8},
    {station: 'shore', elevM: 80, slope: 0.12, nx: 0.1, nz: 0.6, calderaShelter01: 0.8});

  const spSrc = fs.readFileSync(path.join(ROOT, 'biomes/crook/src/50-biome-crook-species.js'), 'utf8');
  const spKeys = Array.from(spSrc.matchAll(/\{key:'([a-z0-9_]+)',name:'([^']+)'/g)).map(m => m[1]);
  T.ok('50-biome-crook-species.js defines 35 distinct species including coconut and regional diversity guild',
    spKeys.length === 35 && spKeys.includes('coconut') && spKeys.includes('calderapalm') &&
    spKeys.includes('canyonyew') && spKeys.includes('cobaltgentian') && spKeys.includes('calderaseagrass'));
}

T.done();
