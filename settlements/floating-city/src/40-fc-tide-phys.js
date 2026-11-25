// ================================================================= FLOATING CITY — Site Bathymetry, Macrotidal Head & KHAZ.TIDE [G data]
// Scale-Model 5.1 px [635, 138] in reshaped 3-river dendritic Ria Sound (edit_528_ria_sound.py), twinned 28 km ENE across
// sheltered sound water with East Bluff Suudme-Kuluuna [649, 141].
// Pure [G data]: zero THREE, zero DOM, deterministic on KRAND.
const FC_SR = 2200;

const FC_SITE = (function () {
  'use strict';
  const SEED = 0xFC1000;
  const WEIR_CX = 0.0;
  const WEIR_CZ = 80.0;
  const WEIR_R = 700.0;
  const KOLK_R = 132.0;
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

  /* Northern / NNE Crown Headland shoreline z(x): matches 2D Master Blueprint Sheet FC-01 */
  function bluffShoreZ(x) {
    const u = clamp((x + 650) / 2700, -0.35, 1.15);
    return -1080 + 540 * u - 85 * Math.sin(u * 2.7) + 18 * siteRelief(x, 0, 0.0018, 3);
  }

  /* Twin 64 m Waterfall Plunge-Harbour & Aqueduct Chutes on the Crown Headland */
  const WATERFALLS = [
    { id: 'fc_fall_west', x0: 548, z0: -1012, y0: 86.0, x1: 518, z1: -765, y1: 0.0, width: 14.0 },
    { id: 'fc_fall_east', x0: 642, z0: -992,  y0: 86.0, x1: 612, z1: -745, y1: 0.0, width: 14.0 }
  ];

  /* Monumental D5 Stone Harbour Moles flanking the Waterfall Plunge-Basin (solid masonry from -24 m seabed to +7.8 m deck) */
  const HARBOUR_MOLES = [
    {
      id: 'fc_mole_west',
      name: 'West Waterfall-Harbour & Boulevard Viaduct Mole',
      x0: 150.0, x1: 492.0,
      zNorth: -1025.0, zSouth: -732.0,
      deckY: 7.8, baseY: -25.0
    },
    {
      id: 'fc_mole_east',
      name: 'East Suudme Treaty & Timber Wharf Mole',
      x0: 642.0, x1: 960.0,
      zNorth: -955.0, zSouth: -668.0,
      deckY: 7.8, baseY: -25.0
    }
  ];

  function elevAt(x, z) {
    const rWeir = Math.hypot(x - WEIR_CX, z - WEIR_CZ);
    const sz = bluffShoreZ(x);
    /* Distance inland northward into the NNE Crown Headland (positive = on bluff land) */
    const dInland = sz - z;

    if (dInland > -35.0 && rWeir > WEIR_R + 28.0) {
      if (dInland <= 0) {
        const t = sstep(-35.0, 0.0, dInland);
        return -18.0 * (1 - t);
      }
      /* D5 Lower Slipway & Careening Ghat bench (0..72 m inland: +3.5..+15 m), then sheer limestone cliff to +96..+140 m */
      const ghat = 3.5 + 11.5 * sstep(0, 72, dInland);
      const cliffJump = 94.0 * sstep(64, 144, dInland);
      const plateau = 38.0 * sstep(158, 680, dInland) + 5.0 * siteRelief(x, z, 0.0024, 11);
      let y = ghat + cliffJump + plateau;

      /* Upper Bluff Reservoir depression feeding the twin 64 m waterfalls */
      const dRes = Math.hypot((x - 615) / 132, (z + 1095) / 66);
      if (dRes < 1.22) {
        y = y * sstep(0.76, 1.22, dRes) + 83.5 * (1 - sstep(0.76, 1.22, dRes));
      }
      /* Plunge-harbour embayment at foot of the twin waterfalls (between West & East Stone Moles) */
      const dPlunge = Math.hypot((x - 568) / 96, (z + 755) / 68);
      if (dPlunge < 1.15) {
        const w = 1 - sstep(0.55, 1.15, dPlunge);
        y = y * (1 - w) + (-9.5) * w;
      }
      return y;
    }

    /* Inside 1,400 m Circular Noahbabel Lagoon & -95 m Central Kolk */
    if (rWeir <= WEIR_R) {
      const kolkW = 1 - sstep(78.0, 178.0, rWeir);
      const lagoonBed = -13.2 + 1.1 * siteRelief(x, z, 0.0032, 23);
      return lagoonBed * (1 - kolkW) + (-95.0) * kolkW;
    }

    /* Outer Reshaped Ria Sound (-48 m deep thalweg, rising slightly toward delta bars & shoals) */
    const shoal = 6.0 * siteRelief(x, z, 0.0014, 31);
    const weirApron = -24.0 * (1 - sstep(WEIR_R, WEIR_R + 140.0, rWeir));
    const deepSound = -48.0 * sstep(WEIR_R, WEIR_R + 180.0, rWeir);
    return weirApron + deepSound + shoal;
  }

  /* Four 90-second Pioneer Eddy-Braked Cliff-Funiculars seated squarely on the +7.8 m Stone Harbour Moles at the cliff toe
     and terminating right on the Grand Cliff-Lip Esplanade (+106..+114 m) in the Bluff Town! */
  const CLIFF_HOISTS = [
    { x0: 215, x1: 215, liftSec: 84, moleId: 'fc_mole_west' },
    { x0: 312, x1: 312, liftSec: 85, moleId: 'fc_mole_west' },
    { x0: 412, x1: 412, liftSec: 86, moleId: 'fc_mole_west' },
    { x0: 785, x1: 785, liftSec: 82, moleId: 'fc_mole_east' }
  ].map(function (h, idx) {
    const sz0 = bluffShoreZ(h.x0);
    /* Lower station sits on the +7.8 m Stone Harbour Mole right at the cliff ghat toe (never in open ocean!) */
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
  const CHIME_WELL = { id: 'fc_santa_cristina_well', x: 458, z: -875, rimY: 8.6, poolY: 0.0, leadTimeMin: 25 };

  function isOnMole(x, z, pad) {
    const p = pad == null ? 0 : pad;
    for (let i = 0; i < HARBOUR_MOLES.length; i++) {
      const M = HARBOUR_MOLES[i];
      if (x >= M.x0 + p && x <= M.x1 - p && z >= M.zNorth + p && z <= M.zSouth - p) return M;
    }
    return null;
  }

  function isBluffLand(x, z) {
    return elevAt(x, z) > 1.5 && Math.hypot(x - WEIR_CX, z - WEIR_CZ) > WEIR_R + 24.0;
  }

  function ecotoneAt(x, z) {
    const y = elevAt(x, z);
    const inLagoon = Math.hypot(x - WEIR_CX, z - WEIR_CZ) < WEIR_R - 18.0;
    const onMole = !!isOnMole(x, z, -8.0);
    const woodyOk = y >= WOODY_TRIM_Y && !inLagoon && !onMole;
    const dwellOk = y >= SAFE_DWELL_Y && !inLagoon;
    const intertidalOk = y >= -6.0 && y < WOODY_TRIM_Y && !onMole;
    const psu = clamp(18.0 - 0.0032 * x - 0.0028 * z, 4.0, 31.0);
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
    mwPerMetre: 5.6
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
      at: [340, 4.2, -775],
      r: 135,
      h: 18,
      tags: { hazard: KHAZ.TIDE.bench({ w: 280, d: 86, h: 18 }, { basin: 'sound', full: 1.4, drawdownY: -6.5 }) }
    }));

    /* 2. Four Sea-Ring Sector Ship-Lock Reversing Tidal Races (safe k=0 at Slack, strong flood/ebb race otherwise) */
    const locks = [
      { id: 'fc.haz.lock_west',  name: 'West Ocean Sector Lock Race',     ang: 192 },
      { id: 'fc.haz.lock_bluff', name: 'Bluff Harbour Cut Tidal Race',    ang: -66 },
      { id: 'fc.haz.lock_suur',  name: 'Suur-Neva Treaty Sector Lock Race', ang: -16 },
      { id: 'fc.haz.lock_riwa',  name: 'Riwa-Wata Royal Sector Lock Race',  ang: 74 }
    ];
    for (let i = 0; i < locks.length; i++) {
      const L = locks[i], a = L.ang * Math.PI / 180;
      const ux = -Math.cos(a), uz = -Math.sin(a);
      recs.push(tagReg.add({
        id: L.id,
        class: 'feature',
        kind: 'narrows',
        name: L.name,
        at: [FC_SITE.WEIR_CX + 680 * Math.cos(a), 0, FC_SITE.WEIR_CZ + 680 * Math.sin(a)],
        tags: { hazard: KHAZ.TIDE.race({ w: 54, d: 44, h: 24 }, { basin: 'sound', axis: [ux, uz], vMax: 4.8, slackV: 0.45 }) }
      }));
    }

    /* 3. Submarine Hydro-Dynamo Penstock Suction Zone (-48 m around central cone) */
    recs.push(tagReg.add({
      id: 'fc.haz.penstock_intake',
      class: 'feature',
      kind: 'intake',
      name: 'Submarine Bulb-Turbine Penstock Suction Ring',
      at: [FC_SITE.WEIR_CX, -48, FC_SITE.WEIR_CZ],
      r: 155,
      h: 36,
      tags: {
        hazard: {
          kind: 'grab',
          effect: 'drown',
          danger: 0.95,
          dose: 1.1,
          falloff: 'smooth',
          shape: { type: 'cyl', r: 155, h: 36, y0: -20, y1: 16 },
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
