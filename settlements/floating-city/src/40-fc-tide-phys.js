// ================================================================= FLOATING CITY — Site Bathymetry, Macrotidal Head & KHAZ.TIDE [G data]
// Scale-Model 5.1 px [635, 138] in reshaped 3-river dendritic Ria Sound (edit_528_ria_sound.py), twinned 28 km ENE across
// sheltered sound water with East Bluff Suudme-Kuluuna [649, 141].
// V3 Imperial Regional Capital Scale: 2,040 m diameter Noahbabel Sea-Ring (R = 1,020 m), deep -26..-32 m inner lagoon
// (zero grounded pontoons), -96 m central submarine kolk, and +88..+148 m Crown Headland Bluff Metropolis.
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND.
const FC_SR = 2600;

const FC_SITE = (function () {
  'use strict';
  const SEED = 0xFC1000;
  const WEIR_CX = 0.0;
  const WEIR_CZ = 180.0;
  const WEIR_R = 1020.0;
  const KOLK_R = 168.0;
  const WOODY_TRIM_Y = 38.0;
  const SAFE_DWELL_Y = 65.0;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function sstep(a, b, x) {
    if (x <= a) return 0;
    if (x >= b) return 1;
    const t = (x - a) / (b - a);
    return t * t * (3 - 2 * t);
  }

  const WORLD_OX = 635 * 2000;
  const WORLD_OZ = 138 * 2000;
  if (typeof WRELIEF !== 'undefined' && WRELIEF.init) {
    WRELIEF.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED });
  }
  if (typeof WMICRO !== 'undefined' && WMICRO.init) {
    WMICRO.init({ ox: WORLD_OX, oz: WORLD_OZ, seed: SEED, version: 2 });
  }

  function siteRelief(x, z, sc, salt) {
    return 2.0 * (KRAND.fbm((x + WORLD_OX) * sc, 0.5, (z + WORLD_OZ) * sc, 2, SEED ^ salt) - 0.5);
  }

  /* Expanded Northern / NNE Crown Headland shoreline z(x): >= 330 m clear of the R=1,020 m Sea-Ring across [-1200..+1850] */
  function bluffShoreZ(x) {
    const u = clamp((x + 950) / 3100, -0.35, 1.25);
    return -1260 + 360 * u - 55 * Math.sin(u * 2.5) + 14 * siteRelief(x, 0, 0.0016, 3);
  }

  /* Twin 64 m Waterfall Plunge-Harbour & Aqueduct Chutes framed cleanly between West & East Stone Harbour Moles */
  const WATERFALLS = [
    { id: 'fc_fall_west', x0: 606, z0: -1286, y0: 86.5, x1: 606, z1: -1108, y1: 0.0, width: 16.0 },
    { id: 'fc_fall_east', x0: 666, z0: -1278, y0: 86.5, x1: 666, z1: -1100, y1: 0.0, width: 16.0 }
  ];

  /* Monumental D5 Stone Harbour Moles flanking the Waterfall Plunge-Basin (solid masonry from -28 m seabed to +7.8 m deck) */
  const HARBOUR_MOLES = [
    {
      id: 'fc_mole_west',
      name: 'West Waterfall-Harbour & Boulevard Viaduct Mole',
      x0: 60.0, x1: 565.0,
      zNorth: -1230.0, zSouth: -945.0,
      deckY: 7.8, baseY: -28.0
    },
    {
      id: 'fc_mole_east',
      name: 'East Suudme Treaty & Timber Wharf Mole',
      x0: 705.0, x1: 1220.0,
      zNorth: -1175.0, zSouth: -890.0,
      deckY: 7.8, baseY: -28.0
    }
  ];

  function elevAt(x, z) {
    const rWeir = Math.hypot(x - WEIR_CX, z - WEIR_CZ);
    const sz = bluffShoreZ(x);
    /* Distance inland northward into the Crown Headland (positive = on bluff land) */
    const dInland = sz - z;

    if (dInland > -42.0 && rWeir > WEIR_R + 36.0) {
      if (dInland <= 0) {
        const t = sstep(-42.0, 0.0, dInland);
        return -24.0 * (1 - t);
      }
      /* D5 Lower Slipway & Careening Ghat bench (0..70 m inland: +3.5..+15 m), then sheer limestone cliff to +96..+148 m */
      const ghat = 3.5 + 11.5 * sstep(0, 70, dInland);
      const cliffJump = 94.0 * sstep(62, 144, dInland);
      const plateau = 42.0 * sstep(156, 860, dInland) + 4.5 * siteRelief(x, z, 0.0022, 11);
      let y = ghat + cliffJump + plateau;

      /* Upper Bluff Reservoir depression feeding the twin 64 m waterfalls */
      const dRes = Math.hypot((x - 636) / 124, (z + 1358) / 62);
      if (dRes < 1.22) {
        y = y * sstep(0.76, 1.22, dRes) + 84.0 * (1 - sstep(0.76, 1.22, dRes));
      }
      /* Plunge-harbour embayment at foot of the twin waterfalls (between West & East Stone Moles) */
      const dPlunge = Math.hypot((x - 636) / 66, (z + 1098) / 64);
      if (dPlunge < 1.15) {
        const w = 1 - sstep(0.52, 1.15, dPlunge);
        y = y * (1 - w) + (-14.5) * w;
      }
      return y;
    }

    /* Inside 2,040 m Circular Noahbabel Lagoon (deep -26..-31 m basin so zero pontoons ever ground!) & -96 m Central Kolk */
    if (rWeir <= WEIR_R) {
      const kolkW = 1 - sstep(118.0, 218.0, rWeir);
      const lagoonBed = -28.0 + 2.2 * siteRelief(x, z, 0.0024, 23);
      return lagoonBed * (1 - kolkW) + (-96.0) * kolkW;
    }

    /* Outer Reshaped Ria Sound (-50 m deep macrotidal thalweg, -30 m sea-ring toe apron) */
    const shoal = 5.0 * siteRelief(x, z, 0.0012, 31);
    const weirApron = -30.0 * (1 - sstep(WEIR_R, WEIR_R + 150.0, rWeir));
    const deepSound = -50.0 * sstep(WEIR_R, WEIR_R + 200.0, rWeir);
    return weirApron + deepSound + shoal;
  }

  /* Four 90-second Pioneer Eddy-Braked Cliff-Funiculars seated squarely on the +7.8 m Stone Harbour Moles at the cliff toe
     and terminating right on the Grand Cliff-Brow Promenade (+106..+116 m) in the Bluff Metropolis! */
  const CLIFF_HOISTS = [
    { x0: 165, x1: 165, liftSec: 84, moleId: 'fc_mole_west' },
    { x0: 315, x1: 315, liftSec: 85, moleId: 'fc_mole_west' },
    { x0: 465, x1: 465, liftSec: 86, moleId: 'fc_mole_west' },
    { x0: 865, x1: 865, liftSec: 82, moleId: 'fc_mole_east' }
  ].map(function (h, idx) {
    const sz0 = bluffShoreZ(h.x0);
    const z0 = +(sz0 - 18.0).toFixed(1);
    const z1 = +(sz0 - 168.0).toFixed(1);
    const y1 = +Math.max(98.0, elevAt(h.x1, z1)).toFixed(2);
    return {
      id: 'fc_hoist_' + (idx + 1),
      moleId: h.moleId,
      x0: h.x0,
      z0: z0,
      y0: 7.8,
      x1: h.x1,
      z1: z1,
      y1: y1,
      liftSec: h.liftSec
    };
  });

  /* Santa Cristina Nephrite Drawdown Chime-Well seated on the West Stone Harbour Mole */
  const CHIME_WELL = { id: 'fc_santa_cristina_well', x: 522, z: -1025, rimY: 8.6, poolY: 0.0, leadTimeMin: 25 };

  function isOnMole(x, z, pad) {
    const p = pad == null ? 0 : pad;
    for (let i = 0; i < HARBOUR_MOLES.length; i++) {
      const M = HARBOUR_MOLES[i];
      if (x >= M.x0 + p && x <= M.x1 - p && z >= M.zNorth + p && z <= M.zSouth - p) return M;
    }
    return null;
  }

  function isBluffLand(x, z) {
    return elevAt(x, z) > 1.5 && Math.hypot(x - WEIR_CX, z - WEIR_CZ) > WEIR_R + 30.0;
  }

  function ecotoneAt(x, z) {
    const y = elevAt(x, z);
    const inLagoon = Math.hypot(x - WEIR_CX, z - WEIR_CZ) < WEIR_R - 18.0;
    const onMole = !!isOnMole(x, z, -8.0);
    const woodyOk = y >= WOODY_TRIM_Y && !inLagoon && !onMole;
    const dwellOk = y >= SAFE_DWELL_Y && !inLagoon;
    const intertidalOk = y >= -6.0 && y < WOODY_TRIM_Y && !onMole;
    const psu = clamp(18.0 - 0.0026 * x - 0.0024 * z, 4.0, 31.0);
    return {
      elevM: y,
      inLagoon: inLagoon,
      woodyOk: woodyOk,
      dwellOk: dwellOk,
      intertidalOk: intertidalOk,
      psu: psu,
      silicaMgL: 16.5
    };
  }

  return {
    SEED: SEED,
    SR: FC_SR,
    WEIR_CX: WEIR_CX,
    WEIR_CZ: WEIR_CZ,
    WEIR_R: WEIR_R,
    KOLK_R: KOLK_R,
    WOODY_TRIM_Y: WOODY_TRIM_Y,
    SAFE_DWELL_Y: SAFE_DWELL_Y,
    WATERFALLS: WATERFALLS,
    HARBOUR_MOLES: HARBOUR_MOLES,
    CLIFF_HOISTS: CLIFF_HOISTS,
    CHIME_WELL: CHIME_WELL,
    bluffShoreZ: bluffShoreZ,
    elevAt: elevAt,
    isOnMole: isOnMole,
    isBluffLand: isBluffLand,
    ecotoneAt: ecotoneAt
  };
})();

const FC_TIDE = (function () {
  'use strict';
  const ctrl = WATER.tideBasins({
    period: 86400,
    ampOuter: 5.4,
    riverSetup: 0.2,
    lagoonMin: -1.8,
    lagoonMax: 2.2,
    riverBoostHead: 1.85,
    activeUnits: 8,
    mwPerMetre: 6.2
  });

  function bindHazards(tagReg) {
    if (typeof KHAZ === 'undefined' || !KHAZ.bindTide || !KHAZ.TIDE) return [];
    KHAZ.bindTide('sound', ctrl.tideHazardFn('sound'));
    KHAZ.bindTide('lagoon', ctrl.tideHazardFn('lagoon'));
    if (!tagReg || !tagReg.add) return [];

    const recs = [];
    /* 1. D5 Lower Slipway & Careening Ghat macrotidal bench (dry at ebb, incoming warn, submerged at spring flood/surge) */
    recs.push(tagReg.add({
      id: 'fc.haz.slipway_ghat',
      class: 'feature',
      kind: 'slipway',
      name: 'Lower Bluff Careening Ghat Tidal Zone',
      at: [-220, 4.2, -1195],
      r: 155,
      h: 18,
      tags: { hazard: KHAZ.TIDE.bench({ w: 310, d: 96, h: 18 }, { basin: 'sound', full: 1.4, drawdownY: -6.5 }) }
    }));

    /* 2. Four Sea-Ring Sector Ship-Lock Reversing Tidal Races (safe k=0 at Slack, strong flood/ebb race otherwise) */
    const locks = [
      { id: 'fc.haz.lock_west',  name: 'West Ocean Sector Lock Race',       ang: 180 },
      { id: 'fc.haz.lock_bluff', name: 'Bluff Harbour Cut Tidal Race',      ang: -42 },
      { id: 'fc.haz.lock_suur',  name: 'Suur-Neva Treaty Sector Lock Race', ang: -8  },
      { id: 'fc.haz.lock_riwa',  name: 'Riwa-Wata Royal Sector Lock Race',  ang: 84  }
    ];
    const rLock = FC_SITE.WEIR_R - 18.0;
    for (let i = 0; i < locks.length; i++) {
      const L = locks[i], a = L.ang * Math.PI / 180;
      const ux = -Math.cos(a), uz = -Math.sin(a);
      recs.push(tagReg.add({
        id: L.id,
        class: 'feature',
        kind: 'narrows',
        name: L.name,
        at: [+(FC_SITE.WEIR_CX + rLock * Math.cos(a)).toFixed(2), 0, +(FC_SITE.WEIR_CZ + rLock * Math.sin(a)).toFixed(2)],
        tags: { hazard: KHAZ.TIDE.race({ w: 58, d: 48, h: 24 }, { basin: 'sound', axis: [ux, uz], vMax: 4.8, slackV: 0.45 }) }
      }));
    }

    /* 3. Submarine Hydro-Dynamo Penstock Suction Zone (-48 m around central cone) */
    recs.push(tagReg.add({
      id: 'fc.haz.penstock_intake',
      class: 'feature',
      kind: 'intake',
      name: 'Submarine Bulb-Turbine Penstock Suction Ring',
      at: [FC_SITE.WEIR_CX, -48, FC_SITE.WEIR_CZ],
      r: 175,
      h: 36,
      tags: {
        hazard: {
          kind: 'grab',
          effect: 'drown',
          danger: 0.95,
          dose: 1.1,
          falloff: 'smooth',
          shape: { type: 'cyl', r: 175, h: 36, y0: -20, y1: 16 },
          move: { speed: 0.35, pull: 3.8, to: [0, 0, 0] },
          tell: { colour: '#22c8e8', fx: 'vortex', sound: 'hum', sign: 'paktong trash-racks vibrating with submarine turbine draw' }
        }
      }
    }));

    return recs;
  }

  return {
    ctrl: ctrl,
    sample: function (t) { return ctrl.sample(t); },
    setMode: function (m) { return ctrl.setMode(m); },
    getMode: function () { return ctrl.getMode(); },
    tideY: function (b, t) { return ctrl.tideY(b, t); },
    bindHazards: bindHazards
  };
})();
