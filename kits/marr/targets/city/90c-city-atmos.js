// ================================================================= MARR CITY — 90c-city-atmos.js
// Binds core/atmos (ATMOS) to Marr: street lamps along thoroughfares, lighthouse beacon & sweep beams
// at Bigon de Mol and Forta de Poinda, temple/palace braziers, canal mist, weather, and window boxes.
// Tagged [web] in PORT.md.
reseed(424306);
ATMOS.init({
 THREE,
 scene,
 camera,
 hour: () => CITYSKY.hour,
 onFrame: fn => FRAME_HOOKS.push(fn),
 ground: (x, z) => terrainH(x, z),
 seed: 424306,
 err: reportErr,
 viewH: () => innerHeight,
 pixelRatio: () => renderer.getPixelRatio()
});
const CITY_ATM = { t0: performance.now() };
const cityClear = (x, z, r) => insideWall(x, z, 8) && !inWater(x, z, 3.5) && !isRoad(x, z) && occFree({ x, z, hx: r || 0.5, hz: r || 0.5, ry: 0 }, 0.3);

// 1. Street furniture: lamps & planters along thoroughfares and gate roads
{
 let n = 0;
 for (const R of ROADS) {
  const z = R.zone || '';
  if (!(z.startsWith('gate:') || z === 'thoroughfare')) continue;
  const row = ATMOS.lampRow(R.pts, { off: R.w / 2 + 1.4, step: 22, ok: (x, zz) => cityClear(x, zz, 0.5) });
  n += row.length;
 }
 CITY_ATM.lamps = n;
}

// 2. Harbour Lighthouse Beacon & Sweep Beams (Bigon de Mol, Forta de Poinda, Palas de Govarnar, Templa de Son & Si)
{
 ATMOS.beacon(60, 23.5, -288);
 ATMOS.sweepBeam(60, 22.8, -288, { heading: -Math.PI / 2, on: 17.5, off: 29.8, len: 320, rad: 8 });
 ATMOS.sweepBeam(-216, 25.0, -220, { heading: -Math.PI * 0.7, on: 17.7, off: 29.7, len: 280, rad: 7 });
 ATMOS.brazier(-52, 12.5, -74, { on: 17.4, off: 29.9 });
 ATMOS.brazier(-40, 12.5, -74, { on: 17.45, off: 29.85 });
 ATMOS.brazier(-54, 11.5, 16, { on: 17.5, off: 29.9 });
 ATMOS.brazier(-38, 11.5, 16, { on: 17.55, off: 29.85 });
 CITY_ATM.braziers = 4;
}

// 3. Glow sprites on vernacular/marr bulbs
{
 let n = 0;
 const take = (item, col, size, max) => {
  const it = KIT.items[item] || [];
  const step = Math.max(1, Math.ceil(it.length / max));
  for (let i = 0; i < it.length; i += step) {
   const p = it[i].p;
   ATMOS.glowAdd(p[0], p[1], p[2], col, size, -1);
   n++;
  }
 };
 take('vBulb', [1, 0.82, 0.45], 3.2, 2200);
 take('lampI', [1, 0.8, 0.4], 4.0, 600);
 CITY_ATM.cityGlows = n;
}

// 4. Particles: smoke, fireflies in Gardon parks, moths, and canal mist
{
 const smokePts = [
  [215, 9.5, 65, 1], [248, 9.5, 145, 1], [235, 9.5, 225, 1],
  [92, 10.0, 185, 1], [-85, 9.0, 240, 1], [105, 8.5, 440, 1]
 ];
 ATMOS.smoke(smokePts);
 CITY_ATM.smoke = smokePts.length;

 const ff = [];
 for (const p of PARKS) {
  for (let k = 0; k < 5; k++) {
   const a = k / 5 * TAU, r = (p.r == null ? 12 : p.r) * 0.5;
   const fx = p.x + r * Math.cos(a), fz = p.z + r * Math.sin(a);
   ff.push([fx, terrainH(fx, fz), fz]);
  }
 }
 ATMOS.fireflies(ff, { n: 5, spread: 5 });
 CITY_ATM.moths = (ATMOS.moths({ p: 0.5, max: 500 }) || { geometry: { instanceCount: 0 } }).geometry.instanceCount;

 const fogPts = [];
 for (let z = -140; z <= 380; z += 18) {
  fogPts.push([gretaCx(z), 0.8, z]);
  fogPts.push([gardonzCx(z), 0.8, z]);
  fogPts.push([xedazCx(z), 0.8, z]);
 }
 ATMOS.fogBank(fogPts);
}

// 5. Weather hook (wet ground & water roughness)
{
 const g0 = new THREE.Color(1, 1, 1), gWet = new THREE.Color(0.74, 0.74, 0.76);
 ATMOS.weather({
  reduceMotion: !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),
  apply: W => {
   scene.fog.density = 0.00028 * (1 + 3.8 * W.fog + 1.6 * W.rain);
   sun.intensity *= 1 - 0.52 * W.rain - 0.28 * W.fog;
   if (cityHemi) cityHemi.intensity += W.flash * 1.4;
   if (groundM) {
    groundM.material.roughness = 0.94 - 0.48 * W.wet;
    groundM.material.color.copy(g0).lerp(gWet, W.wet);
   }
  }
 });
}

// 6. Window boxes under lit/glass panes
{
 if (KIT.meshes.vWinLit) ATMOS.windowBoxesOnPanes(KIT.meshes.vWinLit, { p: 0.26 });
 if (KIT.meshes.vWinGlass) ATMOS.windowBoxesOnPanes(KIT.meshes.vWinGlass, { p: 0.18 });
}

ATMOS.finish();
ATMOS.cull(scene, { keep: m => !!m.userData.biome, pad: 2 });
CITY_ATM.ms = Math.round(performance.now() - CITY_ATM.t0);
window._atmos = Object.assign({}, CITY_ATM, { stats: ATMOS.stats });
