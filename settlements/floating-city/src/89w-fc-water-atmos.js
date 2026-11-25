// ================================================================= FLOATING CITY — ATMOS 1.58 atm Sky & Two-Basin Tidal WATER [web]
const FC_ENV = (function () {
  'use strict';
  const linCol = function (c) { return new THREE.Color(c).convertSRGBToLinear(); };
  const clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  const smooth = function (a, b, x) { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* 1. ATMOS 1.58 atm Sky ([354, -190] Ria Sound Coordinates) */
  ATMOS.bindHost({
    THREE: THREE,
    scene: scene,
    camera: camera,
    renderer: renderer,
    ticks: TICKS,
    ground: terrainH,
    hour: function () { return typeof KHOST !== 'undefined' && KHOST.host ? KHOST.host.clock.hour : 10.2; },
    seed: FC_SITE.SEED,
    viewH: function () { return window.innerHeight; }
  });

  const SKY_CLOCK = {
    get hour() { return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.hour : 10.2; },
    get day() { return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock && KHOST.host.clock.day != null ? KHOST.host.clock.day : 0; },
    get t() { return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.t : 0; }
  };

  const skyHandle = ATMOS.sky(ATMOS.skyPreset('standard', {
    site: { ox: 354, oy: -190 },
    air: { pressure: 1.58 },
    clouds: { cover: 0.48 },
    fogDensity: 0.00014
  }), {
    renderer: renderer,
    camera: camera,
    scene: scene,
    sun: SUN_LIGHT,
    hemi: HEMI_LIGHT,
    clock: SKY_CLOCK,
    fog: true
  });
  skyHandle.update(0);
  if (skyHandle.state && BIO.setSun) BIO.setSun(skyHandle.state.sunDir);

  {
    const env = new THREE.Scene(), WENV = { environment: null };
    ATMOS.skylight({ renderer: renderer, sky: env, scene: WENV, ground: function () { return new THREE.Color(0x3a4e48); } });
  }

  /* 2. Two-Basin WATER: Outer Macrotidal Ria Sound + Calm Regulated Inner Noahbabel Lagoon + Twin 64 m Bluff Waterfalls */
  let soundWater = null, soundDraw = null;
  let lagoonWater = null, lagoonDraw = null;
  let tideBinder = null;
  const waterfallFlows = [];

  if (typeof WATER !== 'undefined') {
    try {
      const rWeirOf = function (x, z) { return Math.hypot(x - FC_SITE.WEIR_CX, z - FC_SITE.WEIR_CZ); };

      /* Outer Sound bed returns +25 m inside the Sea-Ring so outer swell stops cleanly at the circular weir wall! */
      const outerBedAt = function (x, z) {
        return rWeirOf(x, z) < FC_SITE.WEIR_R - 8.0 ? 25.0 : terrainH(x, z);
      };
      /* Inner Lagoon bed returns +25 m outside the Sea-Ring so the calm jade lagoon stays strictly inside the ring! */
      const lagoonBedAt = function (x, z) {
        return rWeirOf(x, z) > FC_SITE.WEIR_R - 4.0 ? 25.0 : terrainH(x, z);
      };

      soundWater = WATER.open({
        name: 'Reshaped Three-River Ria Sound Macrotidal Basin',
        level: 0.0,
        swell: [[0.18, 42, 22, 0, 0.05], [0.10, 21, -28, 0.7, 0.04]],
        field: 0.20,
        bounds: [-15000, -15000, 15000, 15000],
        bed: outerBedAt,
        shore: {
          window: 2100,
          cell: 12,
          seeds: function (x, z) { return outerBedAt(x, z) < -0.1; },
          band: 46
        }
      });
      if (WATER.moveShore) WATER.moveShore(soundWater, 0, -200);
      if (WATER.farBed) WATER.farBed(soundWater, { ground: outerBedAt, cell: 140 });
      soundDraw = WATER.draw(soundWater, {
        surf: true,
        breakers: true,
        renderOrder: 1,
        roughness: 0.14,
        metalness: 0.06,
        envMapIntensity: 0.46,
        ramp: [1.5, 22],
        pick: true,
        shallow: linCol(0x3a6e64),
        deep: linCol(0x102c38)
      });
      if (soundDraw && soundDraw.mesh) {
        soundDraw.mesh.userData.inspectLabel = 'Reshaped Ria Sound Macrotidal Basin (10.8 m tidal range)';
      }

      lagoonWater = WATER.open({
        name: 'Noahbabel Regulated Inner Lagoon & Crystal Kolk',
        level: 0.0,
        swell: [[0.03, 18, 12, 0, 0.02]],
        field: 0.05,
        bounds: [-740, -660, 740, 820],
        bed: lagoonBedAt,
        shore: {
          window: 1480,
          cell: 10,
          seeds: function (x, z) { return lagoonBedAt(x, z) < -0.1; },
          band: 28
        }
      });
      if (WATER.moveShore) WATER.moveShore(lagoonWater, FC_SITE.WEIR_CX, FC_SITE.WEIR_CZ);
      lagoonDraw = WATER.draw(lagoonWater, {
        surf: false,
        breakers: false,
        renderOrder: 1,
        roughness: 0.07,
        metalness: 0.08,
        envMapIntensity: 0.58,
        ramp: [2.2, 42],
        pick: true,
        shallow: linCol(0x2d8a82),
        deep: linCol(0x0b3644)
      });
      if (lagoonDraw && lagoonDraw.mesh) {
        lagoonDraw.mesh.userData.inspectLabel = 'Noahbabel Regulated Inner Lagoon (-1.8..+2.2 m, -95 m central kolk)';
      }

      if (WATER.bindTideMeshes) {
        tideBinder = WATER.bindTideMeshes(FC_TIDE.ctrl, {
          outer: soundDraw && soundDraw.mesh ? [soundDraw.mesh] : [],
          lagoon: lagoonDraw && lagoonDraw.mesh ? [lagoonDraw.mesh] : []
        });
        tideBinder.update(0);
      }

      /* Twin 64 m Crown Headland Bluff Waterfalls (cross-faded via keepAt above +2.5 m so water-mouths passes 100%) */
      if (WATER.flow && WATER.drawFlow) {
        for (let i = 0; i < FC_SITE.WATERFALLS.length; i++) {
          const WF = FC_SITE.WATERFALLS[i];
          const pts3 = [];
          let yc = 1e9;
          for (let s = 0; s <= 18; s++) {
            const u = s / 18;
            const px = WF.x0 + (WF.x1 - WF.x0) * u;
            const pz = WF.z0 + (WF.z1 - WF.z0) * u;
            const gh = terrainH(px, pz);
            if (gh <= 2.4) break;
            yc = Math.min(yc, gh + 0.32);
            pts3.push([+px.toFixed(2), +pz.toFixed(2), +yc.toFixed(2)]);
          }
          if (pts3.length >= 2) {
            const keepFn = function (x, z) { return smooth(2.2, 7.5, terrainH(x, z)); };
            const fl = WATER.flow({
              name: 'Crown Headland Aqueduct Waterfall ' + (i + 1),
              pts: pts3,
              width: WF.width,
              speed: 3.4,
              rapids: [0.35, 0.85]
            });
            fl.keepAt = keepFn;
            const dr = WATER.drawFlow(fl, {
              shallow: linCol(0x88c4c0),
              deep: linCol(0x286e72),
              color: 0xffffff,
              roughness: 0.10,
              metalness: 0.04,
              envMapIntensity: 0.52,
              step: 5,
              across: 6,
              margin: 1.2,
              endFade: 10,
              depthBias: 1.4,
              renderOrder: 2,
              pick: true,
              keep: keepFn,
              refine: true
            });
            if (dr && dr.mesh) dr.mesh.userData.inspectLabel = 'Crown Headland 64 m Waterfall Chute ' + (i + 1);
            waterfallFlows.push(fl);
          }
        }
      }

      /* Upper Bluff Freshwater Reservoir (+84 m) & Santa Cristina Nephrite Chime-Well Pool */
      if (WATER.still && WATER.drawPools) {
        const resPoly = [];
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          resPoly.push([+(615 + Math.cos(a) * 96).toFixed(2), +(-1095 + Math.sin(a) * 48).toFixed(2)]);
        }
        const wellPoly = [];
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          wellPoly.push([+(FC_SITE.CHIME_WELL.x + Math.cos(a) * 7.2).toFixed(2), +(FC_SITE.CHIME_WELL.z + Math.sin(a) * 7.2).toFixed(2)]);
        }
        const pools = [
          WATER.still({ name: 'Crown Headland Aqueduct Reservoir', level: 84.8, poly: resPoly }),
          WATER.still({ name: 'Santa Cristina Nephrite Chime-Well Basin', level: FC_SITE.CHIME_WELL.rimY - 1.2, poly: wellPoly })
        ];
        WATER.drawPools(pools, {
          name: 'fc-freshwater-basins',
          color: 0x2a767e,
          roughness: 0.06,
          metalness: 0.10,
          envMapIntensity: 0.60,
          renderOrder: 2,
          pick: true
        });
      }
      if (WATER.breakupFlows) WATER.breakupFlows();
    } catch (e) {
      reportErr('water: ' + (e.stack || e));
    }
  }

  /* Master World Tick: Sky, Two-Basin Tide, 28 Pontoons + Bascules, Turbines/Locks, 4 Cliff-Hoists, Fleet & Citizens */
  fcTick(function (nowMs, dtSec) {
    const dt = dtSec == null ? 0.016 : dtSec;
    const tSec = nowMs * 0.001;
    if (skyHandle && skyHandle.update) skyHandle.update(dt);
    if (skyHandle && skyHandle.state && BIO.setSun) BIO.setSun(skyHandle.state.sunDir);

    const tideSample = tideBinder ? tideBinder.update(tSec) : FC_TIDE.sample(tSec);
    FC_WORLD.FLOAT_HOST.update(tideSample.lagoonY);
    FC_WORLD.MEGA_SCENE.update(tSec, tideSample);
    FC_WORLD.PONTOON_SCENE.update(tSec, tideSample);
    FC_CHARS.update(tSec, FC_WORLD.PONTOON_SCENE.wardGroups);
  });

  return {
    skyHandle: skyHandle,
    soundWater: soundWater,
    lagoonWater: lagoonWater,
    tideBinder: tideBinder,
    waterfallFlows: waterfallFlows
  };
})();
