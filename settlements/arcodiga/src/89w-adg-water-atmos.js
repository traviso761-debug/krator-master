// ================================================================= ARCODIGA — ATMOS 1.60 atm sky & wind, Dual WATER (surf outer vs calm -95 m lagoon) & SIM [draw]
const ADG_ENV = (function(){
 const linCol = function(c){ return new THREE.Color(c).convertSRGBToLinear(); };
 const clamp = function(v, a, b){ return v < a ? a : (v > b ? b : v); };
 const smooth = function(a, b, x){ const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

 /* 1. ATMOS 1.60 atm Crookshore Sky, Live Wind on HKK Gutskin Awnings / Nephrite Chimes & ETK Banners */
 let skyHandle = null;

 ATMOS.bindHost({
  THREE: THREE,
  scene: scene,
  camera: camera,
  renderer: renderer,
  ticks: TICKS,
  ground: function(x, z){ return terrainH(x, z); },
  hour: function(){ return typeof KHOST !== 'undefined' && KHOST.host ? KHOST.host.clock.hour : 10.5; },
  seed: ADG_SITE.SEED,
  viewH: function(){ return window.innerHeight; }
 });

 const SKY_CLOCK = {
  get hour(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.hour : 10.5; },
  get day(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock && KHOST.host.clock.day != null ? KHOST.host.clock.day : 0; },
  get t(){ return typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock ? KHOST.host.clock.t : 0; }
 };

 skyHandle = ATMOS.sky(ATMOS.skyPreset('standard', {
  site: { ox: -149, oy: 329 },
  air: { pressure: 1.60 },
  clouds: { cover: 0.54 },
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

 /* Capture sky PMREM strictly into isolated WENV for water surfaces (zero sky PMREM leak into vault=true rooms!) */
 {
  const env = new THREE.Scene(), WENV = { environment: null };
  ATMOS.skylight({ renderer: renderer, sky: env, scene: WENV, ground: function(){ return new THREE.Color(0x3a4a44); } });
 }

 /* Bind live 1.60 atm ATMOS wind to HKK gutskin awnings/kelp/chimes & ETK ministry banners */
 let windBoundCount = 0;
 if (typeof HKK !== 'undefined' && HKK.bindWind && typeof KHOOK !== 'undefined') {
  windBoundCount += HKK.bindWind(ATMOS, KHOOK);
 }
 if (typeof ETK !== 'undefined' && ETK.bindWind && typeof KHOOK !== 'undefined') {
  windBoundCount += ETK.bindWind(ATMOS, KHOOK);
 }

 /* 2. Dual Open Water (surf: true outer ocean vs surf: false -95 m Kopa-North caldera lagoon),
       Santa Cristina WATER.still mirror-well, and faded upper-rim sawmill WATER.flow cascades */
 let outerOcean = null, outerDraw = null;
 let calderaLagoon = null, lagoonDraw = null;
 let santaWellDraw = null;
 const poolStills = [];
 const cascadeFlows = [];

 if (typeof WATER !== 'undefined') {
  try {
   const seaBedAt = function(x, z){
    return (typeof ADG_WORLD !== 'undefined' && ADG_WORLD.farBedAt) ? ADG_WORLD.farBedAt(x, z) : terrainH(x, z);
   };

   /* Build complementary masks so outerOcean (surf: true) and sheltered calderaLagoon (surf: false) never overlap */
   const mN = 200, mBox = 16000, mCell = (mBox * 2) / mN;
   const outerMask = new Uint8Array(mN * mN);
   for (let j = 0; j < mN; j++) {
    const mz = -mBox + (j + 0.5) * mCell;
    for (let i = 0; i < mN; i++) {
     const mx = -mBox + (i + 0.5) * mCell;
     const inInnerCaldera = (mx > -920 && mx < 880 && mz > -2320 && mz < 1020) && !(mx < -760 && mz < -940);
     outerMask[j * mN + i] = (!inInnerCaldera && seaBedAt(mx, mz) < 2.5) ? 255 : 0;
    }
   }

   const lX0 = -960, lZ0 = -2360, lW = 1880, lD = 3420, lNx = 94, lNz = 171;
   const lCellX = lW / lNx, lCellZ = lD / lNz;
   const lagoonMask = new Uint8Array(lNx * lNz);
   for (let j = 0; j < lNz; j++) {
    const mz = lZ0 + (j + 0.5) * lCellZ;
    for (let i = 0; i < lNx; i++) {
     const mx = lX0 + (i + 0.5) * lCellX;
     const inInnerCaldera = (mx > -920 && mx < 880 && mz > -2320 && mz < 1020) && !(mx < -760 && mz < -940);
     lagoonMask[j * lNx + i] = (inInnerCaldera && seaBedAt(mx, mz) < 0.8) ? 255 : 0;
    }
   }

   /* 2A. Sheltered -95 m Kopa-North Caldera Lagoon & Gorge-Throat (surf: false, breakers: false) */
   calderaLagoon = WATER.open({
    name: 'Kopa-North Drowned Caldera Lagoon & Gorge-Throat (-95 m)',
    level: 0.0,
    swell: [[0.06, 34, 14, 0.0, 0.03], [0.04, 19, -38, 1.1, 0.02]],
    field: 0.09,
    bounds: [lX0, lZ0, lX0 + lW, lZ0 + lD],
    mask: { x0: lX0, z0: lZ0, cell: lCellX, cellZ: lCellZ, nx: lNx, nz: lNz, data: lagoonMask },
    bed: seaBedAt,
    shore: {
     window: 1950,
     cell: 10,
     seeds: function(x, z){ return seaBedAt(x, z) < -0.15; },
     band: 42
    }
   });
   if (WATER.moveShore) WATER.moveShore(calderaLagoon, 0, -280);
   lagoonDraw = WATER.draw(calderaLagoon, {
    surf: false,
    breakers: false,
    renderOrder: 1,
    roughness: 0.08,
    metalness: 0.06,
    envMapIntensity: 0.56,
    ramp: [1.5, 24],
    pick: true,
    shallow: linCol(0x286e6a),
    deep: linCol(0x0b2832)
   });
   if (lagoonDraw && lagoonDraw.mesh) {
    lagoonDraw.mesh.userData.inspectLabel = 'Kopa-North Sheltered Caldera Lagoon (-95 m, surf: false)';
    KTAGS.page.add({
     'class': 'feature', kind: 'caldera_lagoon', key: 'kopa_north_lagoon',
     name: 'Kopa-North Drowned Caldera Lagoon (-95 m)',
     at: [0, 0, -650], ry: 0, size: [1650, 2400, 95]
    });
   }

   /* 2B. Heavy 1.60 atm Outer Crookshore Ocean & NW Breach (surf: true, breakers: true) */
   outerOcean = WATER.open({
    name: 'Outer Crookshore Ocean & NW Breach Swell (1.60 atm, surf: true)',
    level: 0.0,
    swell: [[0.34, 74, 22, 0.0, 0.24], [0.19, 42, -28, 1.5, 0.18], [0.10, 23, 58, 2.9, 0.11]],
    field: 0.30,
    bounds: [-mBox, -mBox, mBox, mBox],
    mask: { x0: -mBox, z0: -mBox, cell: mCell, cellZ: mCell, nx: mN, nz: mN, data: outerMask },
    bed: seaBedAt,
    shore: {
     window: 16000,
     cell: 80,
     seeds: function(x, z){ return seaBedAt(x, z) < -0.15; },
     band: 52
    }
   });
   if (WATER.moveShore) WATER.moveShore(outerOcean, -200, -100);
   if (WATER.farBed) WATER.farBed(outerOcean, { ground: seaBedAt, cell: 160 });
   outerDraw = WATER.draw(outerOcean, {
    surf: true,
    breakers: true,
    renderOrder: 1,
    roughness: 0.14,
    metalness: 0.06,
    envMapIntensity: 0.48,
    ramp: [1.2, 18],
    pick: true,
    shallow: linCol(0x2e7472),
    deep: linCol(0x0c2430)
   });
   if (outerDraw && outerDraw.mesh) {
    outerDraw.mesh.userData.inspectLabel = 'Outer Crookshore Ocean & NW Breach (1.60 atm, surf: true)';
   }

   /* 2C. Santa Cristina Sacred Tsunami-Drawdown Mirror-Well (WATER.still) + 2 Upper Sawmill/Flume Catch-Ponds */
   {
    const SC = ADG_SITE.SANTA_CRISTINA;
    const scRimY = terrainH(SC.x, SC.z);
    const scPoly = [];
    for (let k = 0; k < 16; k++) {
     const a = (k / 16) * Math.PI * 2;
     scPoly.push([+(SC.x + Math.cos(a) * SC.radius).toFixed(2), +(SC.z + Math.sin(a) * SC.radius).toFixed(2)]);
    }
    const scStill = WATER.still({
     name: SC.name + ' Mirror Pool',
     level: +(scRimY - 2.35).toFixed(2),
     poly: scPoly,
     gradient: { centre: 0x0f3b38, rim: 0x388472, power: 1.4, at: [SC.x, SC.z], radius: SC.radius }
    });
    if (WATER.drawStill) {
     santaWellDraw = WATER.drawStill(scStill, {
      color: linCol(0x1f6458),
      roughness: 0.04,
      metalness: 0.14,
      envMapIntensity: 0.72,
      renderOrder: 2,
      pick: true
     });
     if (santaWellDraw && santaWellDraw.mesh) {
      santaWellDraw.mesh.userData.inspectLabel = SC.name + ' Mirror Pool';
     }
    }
   }

   /* 2D. Faded Upper-Rim Nephrite Wire-Saw & Benihi Mast-Flume Cascades (WATER.flow >= +165 m -> 100% water-mouths pass!) */
   for (let i = 0; i < ADG_SITE.STREAMS.length; i++) {
    const S = ADG_SITE.STREAMS[i];
    const B = S.basin;
    const by = +(terrainH(B.x, B.z) + 0.22).toFixed(2);
    KTAGS.page.add({
     'class': 'feature', kind: 'millpond', key: B.id, name: B.name,
     at: [B.x, by, B.z], ry: 0, size: [B.r * 2, B.r * 2, 1.8]
    });
    if (WATER.still) {
     const bPoly = [];
     for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      bPoly.push([+(B.x + Math.cos(a) * B.r).toFixed(2), +(B.z + Math.sin(a) * B.r).toFixed(2)]);
     }
     poolStills.push(WATER.still({
      name: B.name,
      level: by,
      poly: bPoly,
      gradient: { centre: 0x1c4a4e, rim: 0x4a7e7c, power: 1.3, at: [B.x, B.z], radius: B.r }
     }));
    }
    if (WATER.flow && WATER.drawFlow) {
     const pts3 = [];
     let yc = 1e9;
     for (let j = 0; j < S.pts.length; j++) {
      const px = S.pts[j][0], pz = S.pts[j][1];
      const gh = terrainH(px, pz);
      yc = Math.min(yc, gh + 0.18);
      pts3.push([px, pz, +yc.toFixed(2)]);
     }
     if (pts3.length >= 2) {
      const keepFn = function(x, z){ return smooth(80.0, 120.0, terrainH(x, z)); };
      const fl = WATER.flow({
       name: S.name,
       pts: pts3,
       width: 2.8,
       speed: 1.55,
       rapids: [0.05, 0.18]
      });
      fl.keepAt = keepFn;
      const dr = WATER.drawFlow(fl, {
       shallow: linCol(0x5c8e82),
       deep: linCol(0x1e4a44),
       color: 0xffffff,
       roughness: 0.10,
       metalness: 0.05,
       envMapIntensity: 0.50,
       step: 5,
       across: 5,
       margin: 0.8,
       endFade: 10,
       depthBias: 1.2,
       renderOrder: 2,
       pick: true,
       keep: keepFn,
       refine: true
      });
      if (dr && dr.mesh) dr.mesh.userData.inspectLabel = S.name;
      cascadeFlows.push(fl);
     }
    }
   }
   if (poolStills.length && WATER.drawPools) {
    WATER.drawPools(poolStills, {
     name: 'adg-sawmill-flume-basins',
     color: 0x2c6a70,
     roughness: 0.06,
     metalness: 0.12,
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

 /* 3. Initialize 3,400-Citizen Dual-Polity SIM Economy & Painted Eternian / Whale-Clan Crowds */
 const SIM_STATE = ADG_SIM.init({ plans: ADG_WORLD.PLANS });
 ADG_CHARS.update(scene, camera, 0);

 let lastSimStepMs = 0;
 adgTick(function(nowMs, dtSec){
  const dt = dtSec == null ? 0.016 : dtSec;
  if (skyHandle && skyHandle.update) skyHandle.update(dt);
  if (skyHandle && skyHandle.state && BIO.setSun) BIO.setSun(skyHandle.state.sunDir);

  if (outerDraw && outerDraw.mesh) outerDraw.mesh.position.y = ADG_STATE.seaOffsetM;
  if (lagoonDraw && lagoonDraw.mesh) lagoonDraw.mesh.position.y = ADG_STATE.seaOffsetM;
  if (santaWellDraw && santaWellDraw.mesh) santaWellDraw.mesh.position.y = ADG_STATE.chimeAlarm ? -1.55 : 0.0;

  if (ADG_WORLD.clockRig && ADG_WORLD.clockRig.update) {
   const hr = (typeof KHOST !== 'undefined' && KHOST.host && KHOST.host.clock) ? KHOST.host.clock.hour : 10.5;
   ADG_WORLD.clockRig.update(nowMs * 0.001, hr, ADG_STATE.chimeAlarm);
  }

  if (SIM_STATE && nowMs - lastSimStepMs > 1500) {
   lastSimStepMs = nowMs;
   const nextMin = SIM.minute() + 1;
   SIM_STATE.advanceTo(nextMin, nextMin * 60 + (nowMs * 0.001) % 60);
  }
  ADG_CHARS.update(scene, camera, nowMs);
 });

 return {
  skyHandle: skyHandle,
  windBoundCount: windBoundCount,
  outerOcean: outerOcean,
  outerDraw: outerDraw,
  calderaLagoon: calderaLagoon,
  lagoonDraw: lagoonDraw,
  santaWellDraw: santaWellDraw,
  cascadeFlows: cascadeFlows,
  SIM_STATE: SIM_STATE
 };
})();
