/* ==================== DROWN_PHYS: Drownlands physics, geochemistry, crops & fauna ([G data]) ==================== */
/* Pure data and deterministic functions for biomes/drownlands (PLAN.md sections 1.2, 4.2, 5, 6.2).
   Zero THREE, zero DOM, zero Math.random, zero sin-hash; numeric defaults strictly x == null ? d : x. */

var DROWN_PHYS = (function () {
  'use strict';

  var G_KRATOR = 7.4;
  var P_ATM_BASE = 1.60;
  var SEAMOUNTS = [
    { id: 'krakatoan-caldera', px: 176, py: 322, rKm: 32 },
    { id: 'surtseyan-vent', px: 166, py: 338, rKm: 24 }
  ];
  var SHIELDS = [
    { id: 'farside-shield-s', distKm: 2210, bearingDeg: 287 },
    { id: 'equatorial-shield-n', distKm: 3920, bearingDeg: 294 }
  ];

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function smooth(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function nearestSeamountKm(px, py) {
    var best = 1e9, i, dx, dy, d;
    for (i = 0; i < SEAMOUNTS.length; i++) {
      dx = (px - SEAMOUNTS[i].px) * 2.0;
      dy = (py - SEAMOUNTS[i].py) * 2.0;
      d = Math.hypot(dx, dy);
      if (d < best) best = d;
    }
    return best;
  }

  /* 1. Two-source tsunami shoaling, trimline & deep-trench Ark-Ward escape vs Prou-Torre refuge */
  function tsunamiAt(o) {
    o = o || {};
    var px = o.px == null ? 145 : o.px;
    var py = o.py == null ? 520 : o.py;
    var elevM = o.elevM == null ? 6.1 : o.elevM;
    var depthM = o.depthM == null ? (elevM < 0 ? -elevM : 8.0) : o.depthM;
    var smKm = o.seamountDistKm == null ? nearestSeamountKm(px, py) : o.seamountDistKm;
    var trenchDistM = o.trenchDistM == null ? 450 : o.trenchDistM;
    var tier = o.tier == null ? 3 : o.tier;

    /* Near-field Steaming Seamounts arrival (14-55 min across -70..-180 m shelf/grabens) */
    var cShelfKmMin = 10.8;
    var travelMinNear = +(clamp(11.5 + smKm / cShelfKmMin, 14.0, 55.0)).toFixed(1);
    /* Far-field Farside Tsunami Shields (2,050-4,100 km WNW at c = 627 km/h -> 3.3-6.2 hr) */
    var farDistKm = 2050 + clamp((py - 332) / 306, 0, 1) * 320 + (tier >= 3 ? 820 : 0);
    var travelHrFar = +(clamp(farDistKm / 627.0, 3.3, 6.5)).toFixed(2);

    /* Green's Law shoaling H ~ (d0 / d)^(1/4) from 180 m graben reference onto shoal bench */
    var effDepth = clamp(depthM, 2.5, 180.0);
    var greensK = Math.pow(180.0 / effDepth, 0.25);
    var nearBoost = 1.18 - 0.24 * clamp((smKm - 40.0) / 480.0, 0, 1);
    var baseOpenM = tier === 1 ? 2.4 : tier === 2 ? 7.6 : 16.2;
    var rawWave = baseOpenM * greensK * nearBoost;
    var shoalWaveM = +(tier === 1 ? clamp(rawWave, 4.0, 10.0)
      : tier === 2 ? clamp(rawWave, 16.0, 28.0)
      : clamp(rawWave, 38.0, 55.0)).toFixed(2);

    /* Trimline governed by recurring Tier-3 megatsunami run-up (45-62 m, canonical +48 m at central skerries) */
    var trimElevM = +(clamp(46.0 + 12.0 * smooth(420, 60, smKm), 45.0, 62.0)).toFixed(1);
    if (Math.abs(px - 145) <= 8 && Math.abs(py - 495) <= 30 && o.seamountDistKm == null) {
      trimElevM = 48.0;
    }

    var boreVelMs = +(1.32 * Math.sqrt(G_KRATOR * Math.max(1.0, shoalWaveM * 0.65))).toFixed(2);
    var arkEscapeOk = (depthM >= 80.0) || (trenchDistM <= 1200.0);
    var prouTorreReq = !arkEscapeOk && elevM < trimElevM && trenchDistM > 1500.0;

    return {
      tier: tier,
      travelMinNear: travelMinNear,
      travelHrFar: travelHrFar,
      shoalWaveM: shoalWaveM,
      boreVelMs: boreVelMs,
      trimElevM: trimElevM,
      arkEscapeOk: arkEscapeOk,
      prouTorreReq: prouTorreReq,
      sourceBearings: [287, 294]
    };
  }

  /* 2. Submarine-to-intertidal Lost City brucite-aragonite chimney precipitation (pH 10.5-11.8) */
  function bruciteStackAt(o) {
    o = o || {};
    var ultra = o.ultramaficByte == null ? 255 : o.ultramaficByte;
    var faultDistM = o.faultDistM == null ? 35 : o.faultDistM;
    var bedY = o.waterDepthM == null ? (o.bedElevM == null ? -2.2 : o.bedElevM) : o.waterDepthM;
    var tidalRangeM = o.tidalRangeM == null ? 1.2 : o.tidalRangeM;
    var shear = o.waveShearPa == null ? 90 : o.waveShearPa;

    if (ultra < 128 || faultDistM > 220 || bedY < -8.0 || bedY > 0.65 || shear >= 320) {
      return {
        active: false,
        pH: ultra >= 128 ? 8.35 : 7.95,
        h2Mmol: 0,
        stackHeightM: 0,
        subaerialTopM: bedY,
        turquoiseMilk01: 0
      };
    }

    var faultK = smooth(220, 12, faultDistM);
    var shelterK = smooth(320, 45, shear);
    var depthWindowK = smooth(-8.0, -3.6, bedY) * smooth(0.65, -0.15, bedY);
    var ultraK = clamp((ultra - 128) / 127, 0, 1);
    var vigor = clamp(faultK * (0.45 + 0.55 * shelterK) * (0.35 + 0.65 * ultraK), 0.12, 1.0);

    var pH = +(10.52 + 1.24 * vigor).toFixed(2);
    var h2Mmol = +(0.85 + 4.65 * vigor).toFixed(2);
    /* 0.75 g low gravity boosts slender brucite-aragonite spire height by 1.33x */
    var rawH = (0.75 + 4.15 * vigor * (0.45 + 0.55 * depthWindowK)) * 1.33;
    /* Crown accretes up to low-tide libration ceiling (+0.2..+1.1 m relative to mean tide) */
    var maxCrownTop = 0.25 + 0.55 * tidalRangeM * shelterK;
    var maxHFromBed = Math.max(0.85, maxCrownTop - bedY);
    var stackHeightM = +(clamp(Math.min(rawH, maxHFromBed), 0.8, 6.5)).toFixed(2);
    var subaerialTopM = +(bedY + stackHeightM).toFixed(2);
    var turquoiseMilk01 = +(clamp(0.28 + 0.68 * vigor * shelterK, 0, 1)).toFixed(3);

    return {
      active: true,
      pH: pH,
      h2Mmol: h2Mmol,
      stackHeightM: stackHeightM,
      subaerialTopM: subaerialTopM,
      turquoiseMilk01: turquoiseMilk01
    };
  }

  /* 3. Amphibious nickel-hyperaccumulating prop-root woods vs refuge-crown araucaria trimline */
  function nickelMangroveAt(o) {
    o = o || {};
    var ultra = o.ultramaficByte == null ? 255 : o.ultramaficByte;
    var ni = o.niByte == null ? 180 : o.niByte;
    var elevM = o.elevM == null ? 2.5 : o.elevM;
    var depthM = o.depthM == null ? Math.max(0, -elevM) : o.depthM;
    var trim = o.trimElevM == null ? 48.0 : o.trimElevM;
    var shear = o.waveShearPa == null ? 110 : o.waveShearPa;

    var ultraOk = ultra >= 128 && ni >= 80;
    var propRootOk = ultraOk && elevM >= -1.2 && elevM <= 18.0 && depthM <= 1.25 && shear <= 420;
    var coppiceShrubOk = ultraOk && elevM >= 2.0 && elevM < trim && shear <= 540;
    var refugeTreeOk = elevM >= trim && shear <= 620;
    var grainStapleOk = !ultraOk && elevM >= 2.5 && elevM >= 0;

    var niFrac = ultraOk ? clamp((ni - 80) / 150, 0, 1) : 0;
    var latexNiPct = ultraOk ? +(18.0 + 6.5 * niFrac).toFixed(2) : 0;
    var barkCrust01 = ultraOk ? +(clamp(0.32 + 0.58 * niFrac * smooth(18.0, 0.0, elevM), 0, 1)).toFixed(3) : 0;

    return {
      propRootOk: propRootOk,
      coppiceShrubOk: coppiceShrubOk,
      refugeTreeOk: refugeTreeOk,
      grainStapleOk: grainStapleOk,
      latexNiPct: latexNiPct,
      barkCrust01: barkCrust01
    };
  }

  /* 4. Subsiding coal-measure drowned-valley snag lagoons & high-tide oyster collar ceiling */
  function snagLagoonAt(o) {
    o = o || {};
    var sed = o.sedimentary01 == null ? 1.0 : o.sedimentary01;
    var coal = o.coalByte == null ? 214 : o.coalByte;
    var bedY = o.elevM != null ? o.elevM : -(o.depthM == null ? 1.6 : o.depthM);
    var subM = o.subsidenceM == null ? 6.0 : o.subsidenceM;
    var shelter = o.shelter01 == null ? 0.82 : o.shelter01;

    if (sed < 0.5 || bedY < -4.5 || bedY > 1.5 || shelter < 0.32) {
      return {
        snagOk: false,
        snagDensity01: 0,
        encrustHeightM: 0,
        collarTopM: Math.min(1.8, bedY),
        peatMat01: sed >= 0.5 ? +(clamp((coal / 255) * 0.45, 0, 1)).toFixed(3) : 0,
        driftwoodBoom01: +(clamp(sed * shelter * 0.5, 0, 1)).toFixed(3)
      };
    }

    var subK = smooth(1.5, 7.5, subM);
    var coalK = clamp(coal / 220, 0.25, 1.0);
    var depthK = smooth(-4.5, -2.4, bedY) * smooth(1.5, 0.45, bedY);
    var snagDensity01 = +(clamp(sed * shelter * (0.35 + 0.65 * subK) * (0.4 + 0.6 * depthK), 0.08, 1.0)).toFixed(3);
    /* Oyster and shoalsponge bioherm collars strictly terminate at <= +1.8 m high-water line */
    var collarTopM = +(clamp(0.65 + 1.12 * shelter, 0.65, 1.8)).toFixed(2);
    var encrustHeightM = +(Math.max(0, collarTopM - bedY)).toFixed(2);
    var peatMat01 = +(clamp(coalK * shelter * smooth(1.4, -2.8, bedY), 0, 1)).toFixed(3);
    var driftwoodBoom01 = +(clamp(shelter * (0.45 + 0.55 * subK) * smooth(-3.8, 0.6, bedY), 0, 1)).toFixed(3);

    return {
      snagOk: true,
      snagDensity01: snagDensity01,
      encrustHeightM: encrustHeightM,
      collarTopM: collarTopM,
      peatMat01: peatMat01,
      driftwoodBoom01: driftwoodBoom01
    };
  }

  /* 5. Submarine kelp & seagrass bathymetric gate (strictly submarine for shoalkelp: bedY <= -0.5 m) */
  function shoalFloraAt(o) {
    o = o || {};
    var bedY = o.elevM == null ? -4.0 : o.elevM;
    var shear = o.waveShearPa == null ? 110 : o.waveShearPa;
    var sand01 = o.sand01 == null ? 0.6 : o.sand01;
    var kelpOk = bedY <= -0.5 && bedY >= -28.0 && shear <= 480;
    var seagrassOk = bedY <= 0.2 && bedY >= -11.5 && sand01 >= 0.22 && shear <= 340;
    var spongeOk = bedY <= 2.4 && bedY >= -8.5;
    var fanOk = bedY <= 0.35 && bedY >= -14.0 && shear >= 40;
    return {
      kelpOk: kelpOk,
      seagrassOk: seagrassOk,
      spongeOk: spongeOk,
      fanOk: fanOk,
      kelpLenM: kelpOk ? +(clamp((-bedY - 0.25) * 0.92, 1.2, 13.8)).toFixed(2) : 0
    };
  }

  /* 6. Six-zone bimodal ecotone classifier */
  function ecotoneAt(o) {
    o = o || {};
    var elevM = o.elevM == null ? 0 : o.elevM;
    var ultra = o.ultramaficByte == null ? 255 : o.ultramaficByte;
    var ni = o.niByte == null ? 180 : o.niByte;
    var coal = o.coalByte == null ? 0 : o.coalByte;
    var faultDistM = o.faultDistM == null ? 140 : o.faultDistM;
    var shear = o.waveShearPa == null ? 120 : o.waveShearPa;
    var shelter = o.shelter01 == null ? clamp(1 - shear / 420, 0, 1) : o.shelter01;
    var trim = o.trimElevM == null ? 48.0 : o.trimElevM;

    var br = bruciteStackAt({ ultramaficByte: ultra, faultDistM: faultDistM, waterDepthM: elevM, waveShearPa: shear });
    var nm = nickelMangroveAt({ ultramaficByte: ultra, niByte: ni, elevM: elevM, trimElevM: trim, waveShearPa: shear });
    var sn = snagLagoonAt({ sedimentary01: ultra < 128 ? 1 : 0, coalByte: coal, elevM: elevM, shelter01: shelter });

    var zone = 'kelpchannel';
    if (elevM >= trim) zone = 'refugeskerry';
    else if (br.active) zone = 'bruciteflat';
    else if (sn.snagOk || (ultra < 128 && elevM > -0.5)) zone = 'snaglagoon';
    else if (elevM >= 0.4 && shear >= 230) zone = 'boulderbar';
    else if (nm.propRootOk || nm.coppiceShrubOk) zone = 'propwood';
    else if (elevM > 0.5) zone = 'boulderbar';

    return {
      zone: zone,
      ultramafic: ultra >= 128,
      brucite: br,
      mangrove: nm,
      snag: sn
    };
  }

  /* 7. Interactive host mode table ([Low Water] / [Drawdown] / [Swell] / [Mean Tide]) */
  function tideState(mode) {
    var m = mode || 'Mean Tide';
    if (m === 'Low Water') {
      return { mode: 'Low Water', levelM: -0.35, flexRad: 0.06, drawdown: false, hydrophoneHz: 0, label: 'Libration low water (-0.35 m): steaming pH 11.4 brucite bases and sealed shoalsponge flats exposed' };
    }
    if (m === 'Drawdown') {
      return { mode: 'Drawdown', levelM: -9.5, flexRad: 0.03, drawdown: true, hydrophoneHz: 260, label: 'Pre-Ghost-Tsunami drawdown (-9.5 m): < 10 m seagrass shoals drained dry; -84 m escape trench holds safe depth; 260 Hz hydrophone alert active' };
    }
    if (m === 'Swell') {
      return { mode: 'Swell', levelM: 5.5, flexRad: 0.61, drawdown: false, hydrophoneHz: 180, label: 'Tier-1 bore surge (+5.5 m): low skerries awash while elastoplastic verdigrismangrove cable-roots flex 35 deg without snapping' };
    }
    return { mode: 'Mean Tide', levelM: 0.0, flexRad: 0.12, drawdown: false, hydrophoneHz: 0, label: 'Mean tide (0.0 m): sunlit turquoise < 14 m shoals meeting deep indigo fault-graben channels' };
  }

  return {
    G_KRATOR: G_KRATOR,
    P_ATM_BASE: P_ATM_BASE,
    SEAMOUNTS: SEAMOUNTS,
    SHIELDS: SHIELDS,
    nearestSeamountKm: nearestSeamountKm,
    tsunamiAt: tsunamiAt,
    bruciteStackAt: bruciteStackAt,
    nickelMangroveAt: nickelMangroveAt,
    snagLagoonAt: snagLagoonAt,
    shoalFloraAt: shoalFloraAt,
    ecotoneAt: ecotoneAt,
    tideState: tideState
  };
})();

/* Register CROPS.BIOMES.drownlands in memory when kits/crops is loaded on the page (PLAN.md section 4.2) */
if (typeof CROPS !== 'undefined' && CROPS && CROPS.BIOMES) {
  CROPS.BIOMES.drownlands = {
    atm: 2,
    zones: {
      shoal: { warmth: [4, 4], arid: [4, 4], wet: true, salt: true },
      ultramafic: { warmth: [4, 4], arid: [3, 4], salt: true },
      drowned: { warmth: [4, 4], arid: [3, 4], wet: true, salt: true },
      highskerry: { warmth: [3, 4], arid: [3, 4] }
    }
  };
}

/* Six amphibious, cetacean-commensal & shoal fauna records ([G data], PLAN.md section 5) */
var DROWN_FAUNA = [
  {
    key: 'chelahexapod', name: 'Verdigris Reef-Walker', clade: 'hexapod', scale: 0.65,
    diet: 'herbivore', temperament: 'wary', aggression: 0.1,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'yes', koppen: ['Am', 'Cfa'], zone: 'propwood' },
    yields: ['nickel-shell', 'chitin'],
    schedule: [[0, 7, 'FORAGE_PROP'], [7, 16, 'SUBMERGE_LEDGE'], [16, 24, 'GRAZE_FLAT']]
  },
  {
    key: 'clickporpoise', name: 'Sounder-Hound Dolphin', clade: 'cetacean', scale: 2.4,
    diet: 'piscivore', temperament: 'commensal', aggression: 0,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'yes', koppen: ['Am', 'Cfa'], zone: 'kelpchannel' },
    yields: [],
    note: 'Sacred acoustic dive-kin of the cFlit-qBon; flees into > 80 m trenches 30 min before silent Ghost Tsunamis.',
    schedule: [[5, 19, 'HERD_SHOAL'], [19, 24, 'REST_TRENCH'], [0, 5, 'REST_TRENCH']]
  },
  {
    key: 'snagbooby', name: 'Oyster-Snag Plunge-Gannet', clade: 'avian', scale: 0.95, span: 1.6,
    diet: 'piscivore', temperament: 'colonial', aggression: 0,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'both', koppen: ['Am', 'Cfa'], zone: 'snaglagoon' },
    yields: ['eggs', 'guano', 'feathers'],
    schedule: [[6, 18, 'DIVE_SHOAL'], [18, 24, 'ROOST_SNAG'], [0, 6, 'ROOST_SNAG']]
  },
  {
    key: 'brucitesnail', name: 'Alkali-Stack Limpet-Hexapod', clade: 'hexapod', scale: 0.28,
    diet: 'chemolithovore', temperament: 'passive', aggression: 0,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'yes', koppen: ['Am'], zone: 'bruciteflat' },
    yields: ['aragonite-shell', 'vent-nacre'],
    schedule: [[0, 10, 'GRAZE_CHIMNEY'], [10, 18, 'SEAL_POOL'], [18, 24, 'GRAZE_CHIMNEY']]
  },
  {
    key: 'shoaldugong', name: 'Dense-Air Seagrass Sirenian', clade: 'sirenian', scale: 3.1,
    diet: 'herbivore', temperament: 'docile', aggression: 0,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'yes', koppen: ['Am', 'Cfa'], zone: 'kelpchannel' },
    yields: ['blubber-oil', 'hide', 'dense-ivory'],
    schedule: [[4, 11, 'GRAZE_MEADOW'], [11, 16, 'DOZE_CHANNEL'], [16, 24, 'GRAZE_MEADOW'], [0, 4, 'GRAZE_MEADOW']]
  },
  {
    key: 'leviathancalf', name: 'Sound Filter-Whale', clade: 'cetacean', scale: 15.5,
    diet: 'planktivore', temperament: 'migratory', aggression: 0.15,
    tags: { climate: 'tropic', aridity: 'humid', abyssal: false, riparian: 'yes', koppen: ['Am', 'Cfa'], zone: 'kelpchannel' },
    yields: ['whale-oil', 'baleen', 'whale-rib', 'ambergris'],
    schedule: [[0, 24, 'MIGRATE_TRENCH']]
  }
];
