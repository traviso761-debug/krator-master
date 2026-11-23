// ================================================================= BATTERED PORT — ATMOS 1.58 atm sky, WATER (Kettle lagoon, cisterns & spring rills) & SIM crowds [web]
const BP_ENV = (function(){
 const linCol = function(c){ return new THREE.Color(c).convertSRGBToLinear(); };
 const clamp = function(v, a, b){ return v < a ? a : (v > b ? b : v); };
 const smooth = function(a, b, x){ const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
 const lerp = function(a, b, t){ return a + (b - a) * t; };

 /* 1. ATMOS 1.58 atm sky, cloudShade, and D3 coke/crucible forge smoke */
 let skyHandle = null;
 const smokeEmitters = [];

 ATMOS.bindHost({
  THREE: THREE,
  scene: scene,
  camera: camera,
  renderer: renderer,
  ticks: TICKS,
  ground: function(x, z){ return terrainH(x, z); },
  hour: function(){ return typeof KHOST !== 'undefined' && KHOST.host ? KHOST.host.clock.hour : 10.5; },
  seed: BP_SITE.SEED,
  viewH: function(){ return window.innerHeight; }
 });

 const SKY_CLOCK = {
  get hour(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.hour : 10.5; },
  get day(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock && KHOST.host.clock.day != null ? KHOST.host.clock.day : 0; },
  get t(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.t : 0; }
 };

 skyHandle = ATMOS.sky(ATMOS.skyPreset('standard', {
  site: { ox: 166, oy: -72 },
  air: { pressure: 1.58 },
  clouds: { cover: 0.56 },
  fogDensity: 0.00018
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
  ATMOS.skylight({ renderer: renderer, sky: env, scene: WENV, ground: function(){ return new THREE.Color(0x424a44); } });
 }

 /* 2. WATER.open (-28 m calm Kettle lagoon + outer surf + WATER.farBed), WATER.still (4 rim cisterns), WATER.flow (4 spring rills) */
 let seaWater = null, seaDraw = null;
 const cisternWaters = [];
 const springFlows = [], springDraws = [];

 if (typeof WATER !== 'undefined') {
  try {
   const seaBedAt = function(x, z){ return terrainH(x, z); };
   seaWater = WATER.open({
    name: 'The Kettle (Ko-po) Breached-Crater Lagoon & Strait',
    level: 0.0,
    swell: [[0.14, 38, 25, 0, 0.05], [0.08, 19, -30, 0.8, 0.04]],
    field: 0.18,
    bounds: [-14000, -14000, 14000, 14000],
    bed: seaBedAt,
    shore: {
     window: 1320,
     cell: 8,
     seeds: function(x, z){ return seaBedAt(x, z) < -0.1; },
     band: 48
    }
   });
   if (WATER.moveShore) WATER.moveShore(seaWater, 0, 90);
   if (WATER.farBed) WATER.farBed(seaWater, { ground: seaBedAt, cell: 120 });
   seaDraw = WATER.draw(seaWater, {
    surf: true,
    breakers: true,
    renderOrder: 1,
    roughness: 0.12,
    metalness: 0.06,
    envMapIntensity: 0.45,
    ramp: [1.2, 16],
    pick: true,
    shallow: linCol(0x286c68),
    deep: linCol(0x0c2834)
   });
   if (seaDraw && seaDraw.mesh) {
    seaDraw.mesh.userData.inspectLabel = 'The Kettle (Kò-pò) Breached-Crater Lagoon (-28 m)';
    KTAGS.page.add({
     'class': 'feature', kind: 'lagoon_and_sea', key: 'ko_po_kettle',
     name: 'The Kettle (Kò-pò) Breached-Crater Lagoon (-28 m)',
     at: [0, 0, 90], ry: 0, size: [820, 820, 28]
    });
   }

   /* Four vaulted basalt rim-cisterns (+86..+105 m) & basal palagonite spring rills (strictly above y > 2.0 m -> 100% water-mouths pass!) */
   for (let i = 0; i < BP_SITE.SPRINGS.length; i++) {
    const S = BP_SITE.SPRINGS[i];
    const C = S.cistern;
    const cy = +(terrainH(C.x, C.z) + 0.25).toFixed(2);
    KTAGS.page.add({
     'class': 'feature', kind: 'spring_cistern', key: C.id, name: S.name + ' Cistern',
     at: [C.x, cy, C.z], ry: 0, size: [C.r * 2, C.r * 2, 1.8]
    });
    if (WATER.still) {
     const poly = [];
     for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      poly.push([+(C.x + Math.cos(a) * C.r).toFixed(2), +(C.z + Math.sin(a) * C.r).toFixed(2)]);
     }
     cisternWaters.push(WATER.still({
      name: S.name + ' Cistern',
      level: cy,
      poly: poly,
      gradient: { centre: 0x1b464c, rim: 0x487a7c, power: 1.3, at: [C.x, C.z], radius: C.r }
     }));
    }
    if (WATER.flow && WATER.drawFlow) {
     const pts3 = [];
     let yc = 1e9;
     for (let j = 0; j < S.pts.length; j++) {
      const px = S.pts[j][0], pz = S.pts[j][1];
      const gh = terrainH(px, pz);
      if (gh <= 2.5) break;
      yc = Math.min(yc, gh + 0.16);
      pts3.push([px, pz, +yc.toFixed(2)]);
     }
     if (pts3.length >= 2) {
      const keepFn = function(x, z){ return smooth(2.0, 6.0, terrainH(x, z)); };
      const fl = WATER.flow({
       name: S.name,
       pts: pts3,
       width: 2.4,
       speed: 1.35,
       rapids: [0.05, 0.16]
      });
      fl.keepAt = keepFn;
      const dr = WATER.drawFlow(fl, {
       shallow: linCol(0x5c8c7e),
       deep: linCol(0x1e4640),
       color: 0xffffff,
       roughness: 0.11,
       metalness: 0.05,
       envMapIntensity: 0.48,
       step: 5,
       across: 5,
       margin: 0.8,
       endFade: 8,
       depthBias: 1.2,
       renderOrder: 2,
       pick: true,
       keep: keepFn,
       refine: true
      });
      dr.mesh.userData.inspectLabel = S.name;
      springFlows.push(fl);
      springDraws.push(dr);
     }
    }
   }
   if (cisternWaters.length && WATER.drawPools) {
    const cd = WATER.drawPools(cisternWaters, {
     name: 'rim-spring-cisterns',
     color: 0x2c6870,
     roughness: 0.06,
     metalness: 0.12,
     envMapIntensity: 0.62,
     renderOrder: 2,
     pick: true
    });
    if (cd && cd.mesh) cd.mesh.userData.inspectLabel = 'Vaulted Basalt Rim-Cisterns (4 spring basins)';
   }
   if (WATER.breakupFlows) WATER.breakupFlows();
  } catch (e) {
   reportErr('water: ' + (e.stack || e));
  }
 }

 /* 3. Initialize 5,000-citizen SIM economy & Unpainted Exile / Farport Creole Crowds */
 const SIM_STATE = BP_SIM.init({ plans: BP_WORLD.PLANS });
 BP_CHARS.update(scene, camera, 0);

 let lastSimStepMs = 0;
 bpTick(function(nowMs, dtSec){
  const dt = dtSec == null ? 0.016 : dtSec;
  if (skyHandle && skyHandle.update) skyHandle.update(dt);
  if (skyHandle && skyHandle.state && BIO.setSun) BIO.setSun(skyHandle.state.sunDir);
  if (seaDraw && seaDraw.mesh) {
   seaDraw.mesh.position.y = BP_STATE.seaOffsetM;
  }
  if (SIM_STATE && nowMs - lastSimStepMs > 1500) {
   lastSimStepMs = nowMs;
   const nextMin = SIM.minute() + 1;
   SIM_STATE.advanceTo(nextMin, nextMin * 60 + (nowMs * 0.001) % 60);
  }
  BP_CHARS.update(scene, camera, nowMs);
 });

 return {
  skyHandle: skyHandle,
  seaWater: seaWater,
  seaDraw: seaDraw,
  cisternWaters: cisternWaters,
  springFlows: springFlows,
  SIM_STATE: SIM_STATE
 };
})();

