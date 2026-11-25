// node core/frontier/test-frontier.js: verifies KFRONTIER [G data] Crazy-Quilt, Erythrophyll, Bleach-Scar & rogue machines
'use strict';
const path = require('path');
const T = require(path.join(__dirname, '..', '..', 'tools', 'ktest.js'))(__filename);

require(path.join(__dirname, '..', 'rand', '08-core-rand.js'));
require(path.join(__dirname, '..', 'tags', '50-core-tags.js'));
require(path.join(__dirname, '..', 'tags', '52-core-tags-vocab.js'));
require(path.join(__dirname, '..', 'biome', '37-core-traps.js'));
require(path.join(__dirname, '..', 'hazard', '20-core-hazard.js'));
require(path.join(__dirname, '18-core-frontier.js'));

const KF = globalThis.KFRONTIER;
const KHAZ = globalThis.KHAZ;

T.ok('KFRONTIER exports all 5 Carnelian clades and 4 rogue ecoforming machines',
  Boolean(KF && Object.keys(KF.CLADES).length === 5 && Object.keys(KF.MACHINES).length === 4));

T.ok('every Erythrophyll swatch reflects 605-710 nm carnelian/crimson/plum with zero chlorophyll green',
  KF.ERYTHRO_SWATCH.every(h => KF.isErythrophyllHex(h)));
T.neg('chlorophyll leaf green (0x3e7838) is rejected while carnelian passes',
  h => KF.isErythrophyllHex(h), 0x3e7838, KF.PALETTE.carnelian);

{
  const serpentinite = KF.quiltAt(40, -30, {seed: 8100, edaphicToxicity01: 0.92, xericExposure01: 0.65, skyExposure01: 0.55});
  const foredeep = KF.quiltAt(40, -30, {seed: 8100, edaphicToxicity01: 0.05, xericExposure01: 0.12, skyExposure01: 0.20});
  T.ok('Crazy-Quilt partition assigns Ni/Mg serpentinite & porphyry islands to carnelian and neutral loams to earth',
    serpentinite.biosphere === 'carnelian' && serpentinite.redDominance01 > 0.75 &&
    foredeep.biosphere === 'earth' && foredeep.redDominance01 < 0.20);
}

{
  const auger = {x: 120, z: -80, radiusM: 45};
  const inside = KF.quiltAt(135, -70, {seed: 8105, edaphicToxicity01: 0.90, xericExposure01: 0.70, skyExposure01: 0.60, auger});
  const outside = KF.quiltAt(210, -80, {seed: 8105, edaphicToxicity01: 0.90, xericExposure01: 0.70, skyExposure01: 0.60, auger});
  T.ok('ecof_soil_auger 45 m lime-phosphate disc flips serpentine red barrens into an emerald Earth oasis',
    inside.biosphere === 'earth' && inside.augerOasis01 > 0.80 && outside.biosphere === 'carnelian');
}

{
  const swath = {x0: 0, z0: 0, dx: 0.8, dz: 0.6, halfWidthM: 35, vanguardWidthM: 24, lengthM: 2400, mode: 'swath'};
  const core = KF.bleachSwathAt(0, 0, swath);
  const edge = KF.bleachSwathAt(-27, 36, swath); // signedDist = 45 m -> vanguard band
  const far = KF.bleachSwathAt(-120, 160, swath);
  T.ok('Bleach-Scar tri-band produces bone-white bleach core + skeleton probability + vanguard margin',
    core.band === 'bleach' && core.bleach01 > 0.90 && core.skeletonProb01 > 0.50 &&
    edge.band === 'vanguard' && edge.vanguard01 > 0.20 && far.band === 'outside');
}

{
  const pylon = {x: 0, z: 0, poolElevM: 1200, bandM: 25, reachM: 900, state: 'active'};
  const valley = KF.mistInversionAt(80, 60, 1175, pylon);
  const knob = KF.mistInversionAt(80, 60, 1265, pylon);
  const inertHz = KF.hazardSpec('ecof_mist_pylon', {state: 'inert'});
  const activeHz = KF.hazardSpec('ecof_mist_pylon', {state: 'active'});
  const allValidKhaz = Object.keys(KF.MACHINES).every(k => {
    const hz = KF.hazardSpec(k, {state: 'active'});
    const made = KHAZ.make({
      kind: hz.kind,
      effect: hz.kind === 'heat' ? 'burn' : hz.kind === 'crush' ? 'bleed' : 'poison',
      danger: hz.severity,
      dose: 0.35,
      falloff: 'smooth'
    });
    return Boolean(made && made.kind === hz.kind);
  });
  T.ok('ecof_mist_pylon pools defoliant mist in valley depressions while sparing high knobs, and all 4 machine hazards pass KHAZ.make',
    valley.defoliatedFloor01 > 0.80 && knob.hilltopRefuge01 > 0.85 &&
    inertHz.active === false && activeHz.active === true && activeHz.kind === 'gas' && allValidKhaz);
  T.ok('machine 24h schedule switches ecof_mist_pylon into PULSE_DEFOLIANT_MIST at dawn (06:00)',
    KF.schedule24('ecof_mist_pylon', 6) === 'PULSE_DEFOLIANT_MIST' &&
    KF.schedule24('ecof_mist_pylon', 13) === 'SOLAR_RECHARGE');
}

T.done();
