/* Node unit tests for biomes/ricochetpeaks (RICOCHET_PHYS, RICOCHET_SITES, KSTRATA, KSTACKS, KHAZ, CROPS, FAUNA & RESOURCES) on tools/ktest.js. */
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
loadInGlobal('core/terrain/37-core-stacks.js');
loadInGlobal('core/hazard/20-core-hazard.js');
loadInGlobal('kits/crops/src/10-crop-core.js');
loadInGlobal('kits/crops/src/20-crop-records.js');
loadInGlobal('kits/crops/src/22-crop-material.js');
loadInGlobal('kits/crops/src/40-crop-query.js');
loadInGlobal('kits/resources/src/42r-res-ore.js');
loadInGlobal('kits/resources/src/45r-res-field.js');

const { RICOCHET_PHYS: PHYS, RICOCHET_SITES: SITES } = require('../src/15-ricochet-phys.js');
const RP_CROPS = require('../src/22-ricochet-crops.js');
const RP_FAUNA = require('../src/24-ricochet-fauna.js');

// 1. Oblique skipping-stone crater-bowl, central rebound peak, annular moat & self-watering 3x orographic catch
{
  const peak = PHYS.craterBowlAt(0, 0, SITES.ringlake);
  const moat = PHYS.craterBowlAt(165, 0, SITES.ringlake);
  const catchBowl = PHYS.orographicCatchAt(26.0, 5000.0, 220.0);
  const dryPlain = PHYS.orographicCatchAt(26.0, 300.0, 180.0);
  T.ok('central rebound peak rises >= 40 m above annular moat depression and 5 km crater walls triple 220 mm rain to >= 620 mm/yr Dfc catch',
    peak.reboundLiftM >= 40.0 && moat.moatDepthM >= 8.0 && peak.reboundLiftM > moat.reboundLiftM &&
    catchBowl.funnelRatio >= 2.6 && catchBowl.effectiveMmYr >= 620.0 && catchBowl.lakeSustained === true &&
    dryPlain.lakeSustained === false && PHYS.CRATER_SWARM.length === 12);
  T.neg('permanent WH crater-lake catch requires deep crater-wall snow-trap relief rather than flat exterior plain',
    wallM => PHYS.orographicCatchAt(26.0, wallM, 210.0).lakeSustained === true,
    300.0,
    5000.0);
}

// 2. Inverted "bowl treeline": frosty sedge bottom hollow -> dense spruce-larch thermal belt -> rim krummholz
{
  const bottomHollow = PHYS.bowlTreelineAt(180, 0, 1.5, 0.0, SITES.ringlake);
  const thermalApron = PHYS.bowlTreelineAt(45, -20, 32.0, 0.0, SITES.ringlake);
  const highRim = PHYS.bowlTreelineAt(420, 0, 155.0, 0.0, SITES.ringlake);
  T.ok('inverted bowl treeline separates unheated -20 C frost-hollow bottom, +32 m thermal-belt taiga, and +155 m rim krummholz',
    bottomHollow.band === 'frost_hollow' && bottomHollow.frostHollow01 > 0.65 && bottomHollow.nightMinTempC <= -18.0 &&
    thermalApron.band === 'thermal_taiga' && thermalApron.thermalBelt01 > 0.75 &&
    highRim.band === 'rim_krummholz' && highRim.rimKrummholz01 > 0.65);
  T.neg('dense thermal-belt boreal taiga requires lower-apron/rebound elevation above unheated katabatic frost-hollow floor',
    elevRel => PHYS.bowlTreelineAt(180, 0, elevRel, 0.0, SITES.ringlake).thermalBelt01 > 0.55,
    1.2,
    34.0);
}

// 3. Hydrothermal ground warmth heatAt & snowBareMask melting winter snow around East Hearth fumaroles
{
  const ventCore = PHYS.heatAt(-58, -18, SITES.vents);
  const coldWall = PHYS.heatAt(-480, -480, SITES.vents);
  const mask = PHYS.snowBareMask([-240, -240, 240, 240], 16, SITES.vents);
  const ixVent = Math.round((-58 - mask.x0) / mask.cell);
  const izVent = Math.round((-18 - mask.z0) / mask.cell);
  const ixCold = 0, izCold = 0;
  const ventByte = mask.data[izVent * mask.nx + ixVent];
  const coldByte = mask.data[izCold * mask.nx + ixCold];
  T.ok('East Hearth fumaroles heat ground > 65 C and punch a snow-free bare oasis (byte 0) inside snow-covered crater walls (byte 255)',
    ventCore.surfaceTempC > 65.0 && ventCore.snowMelted01 > 0.95 &&
    coldWall.snowMelted01 === 0 && ventByte === 0 && coldByte === 255 && mask.bareCells >= 12);
  T.neg('snowBare melt ring requires active hydrothermal ground heat rather than cold suevite wall',
    pt => PHYS.heatAt(pt[0], pt[1], SITES.vents).snowMelted01 > 0.5,
    [-480, -480],
    [-58, -18]);
}

// 4. Tagamite impact-glass sheet, meteoritic Fe-Ni-Au nickel_heather indicator & kits/resources node registration
{
  const glass = PHYS.shatterConeAt(-20, 10, SITES.glasssheet);
  const overOre = PHYS.meteoricAnomalyAt(-36, -22, SITES.glasssheet);
  const barrenGlass = PHYS.meteoricAnomalyAt(260, 240, SITES.glasssheet);
  const tagPage = globalThis.KTAGS.create({ build: 'ricochetpeaks-test' });
  const regNodes = globalThis.RES_GEO.register(tagPage, SITES.glasssheet.resNodes, { height: () => 4.0 });
  const mineLink = globalThis.resSource({ x: -40, z: -25, works: 'mine' }, SITES.glasssheet.resNodes);
  T.ok('Glass-Pan melt floor reaches tagamite > 0.75, meteoritic Ni > 2800 ppm triggers nickel_heather tell, and kits/resources iron/nickel/gold nodes register',
    glass.tagamite01 > 0.75 && overOre.niPpm > 2800 && overOre.heatherTell === true &&
    barrenGlass.heatherTell === false && regNodes.length === 4 && mineLink && mineLink.kind === 'nickel' && mineLink.grade === 'high');
  T.neg('meteoritic nickel_heather indicator tell requires buried Fe-Ni impactor fragment rather than barren background rock',
    pt => PHYS.meteoricAnomalyAt(pt[0], pt[1], SITES.glasssheet).heatherTell === true,
    [260, 240],
    [-36, -22]);
}

// 5. Skippers Notch 180 m doublet breach venturi wind & outer crater-rim hypoxia (< 0.60 atm above +5,800 m)
{
  const throat = PHYS.notchVenturiAt(0, 0, SITES.notch);
  const sheltered = PHYS.notchVenturiAt(0, 240, SITES.notch);
  const borealP = PHYS.pressureAtElev(3250.0);
  const rimHypoxiaP = PHYS.pressureAtElev(6400.0);
  T.ok('Skippers Notch accelerates wind >= 2.4x with >= 0.35 rad tree wind-flagging while +6,400 m outer rims drop below 0.60 atm',
    throat.speedup >= 2.4 && throat.leanRad >= 0.35 && sheltered.speedup < 1.15 &&
    borealP >= 1.02 && borealP <= 1.15 && rimHypoxiaP < 0.60);
  T.neg('venturi wind-flagging requires standing inside the 180 m breached septum throat rather than behind the crater wall',
    zPos => PHYS.notchVenturiAt(0, zPos, SITES.notch).speedup > 1.8,
    240.0,
    0.0);
}

// 6. All 5 KSTRATA stacks, KSTACKS Erebus ice chimneys, 5 KHAZ specs, CROPS.BIOMES.ricochetpeaks & 6 FAUNA species
{
  for (const key of ['ringlake', 'notch', 'vents', 'glasssheet', 'highbowl']) {
    const st = SITES[key];
    const sObj = globalThis.KSTRATA.create(Object.assign({ seed: st.seed }, st.strata));
    const sample = sObj.at(0, 20, 0);
    if (!sample || !Array.isArray(sample.colour) || sample.colour.length !== 3) {
      throw new Error('KSTRATA failed on station ' + key);
    }
  }
  const chSpec = SITES.highbowl.chimneys[0];
  const erebusPipe = globalThis.KSTACKS.make({
    kind: 'chimney',
    id: chSpec.id,
    form: 'pipe',
    x: chSpec.x,
    z: chSpec.z,
    H: chSpec.H,
    r: chSpec.r,
    y0: 2.0,
    ice: true,
    seed: chSpec.seed
  });
  const hazOk = ['coldpool', 'bandit_notch', 'scald', 'co2', 'rim_hypoxia'].every(hk => {
    const h = globalThis.KHAZ.make(PHYS.hazardSpec(hk));
    return Boolean(h && h.kind);
  });
  const crops = RP_CROPS.queryAll();
  T.ok('all 5 Ricochet KSTRATA suevite/tagamite stacks, KSTACKS Erebus ice chimney, 5 KHAZ specs, CROPS (>= 35) & 6 fauna schedules pass',
    Boolean(erebusPipe && erebusPipe.beds && erebusPipe.beds.length >= 2) &&
    hazOk && crops.length >= 35 && RP_FAUNA.SPECIES.length === 6 &&
    RP_FAUNA.stateAt('thermal_macaque', 2) === 'SOAK_HOT_SINTER_POOL' &&
    RP_FAUNA.stateAt('crater_caribou', 13) === 'TRANSIT_BREACH_NOTCH');
}

T.done();
