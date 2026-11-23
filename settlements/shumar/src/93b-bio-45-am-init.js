/* ================================================================= AMARO HIGHLAND FLORA HOST BINDING (Step A2)
   [G data] Binds biomes/shighlands Station 4 (shumar: 62-biome-shigh-shumar.js) to Amaro's canyon and plateau terrain
   (amaroH, amaroSlope, amaroWater, AM_RING.get().floraClear), recording every plant in KTAGS and KSPACE. */

const AM_FLORA = (function () {
  if (typeof BIO === 'undefined' || typeof AM === 'undefined' || typeof AM_RING === 'undefined') return null;
  const ring = AM_RING.get();
  const R = 1280;
  const mask = (x, z) => {
    const r = Math.hypot(x, z + 240);
    if (r > R) return 0;
    const sl = amaroSlope(x, z, 4);
    if (sl > 1.05) return 0;
    const h = amaroH(x, z);
    /* Arid rain-shadow steppe plateau (h > 228 away from canyon lip z < -320): sparse windbreak groves + understorey */
    if (h > 228 && z > -300) {
      const cellH = KRAND.unit(KRAND.hash(Math.round(x / 18), Math.round(z / 18), 7391));
      if (cellH > 0.14) return 0;
    }
    return ring.floraClear(x, z, 1.8) ? 1 : 0;
  };
  const tags = (typeof KTAGS !== 'undefined' && KTAGS.VOCAB) ? KTAGS.create({ build: 'shumar-flora' }) : null;
  const space = typeof KSPACE !== 'undefined' ? KSPACE.create({ cell: 24 }) : null;
  const regs = [];
  return {
    R: R,
    cx: 0,
    cz: -240,
    mask: mask,
    tags: tags,
    space: space,
    regs: regs,
    seed: KRAND.hash(0x5b41, 7311)
  };
})();

function amFloraZoneAt(x, z) {
  const h = amaroH(x, z);
  const sl = amaroSlope(x, z, 4);
  const wt = amaroWater(x, z);
  const tier = AM.tierAt(x, z);
  const e = 6;
  const gz = (amaroH(x, z + e) - amaroH(x, z - e)) / (2 * e);
  const gx = (amaroH(x + e, z) - amaroH(x - e, z)) / (2 * e);
  const gm = Math.hypot(gx, gz);
  const north = gm < 1e-4 ? 0.35 : clamp((gz / gm) * 0.5 + 0.5, 0, 1);

  let rivDist = 999;
  for (let i = 0; i < AM.RIVERS.length; i++) {
    const q = AM.polyNear(x, z, AM.RIVERS[i].pts);
    const d = Math.max(0, q.d - q.hw);
    if (d < rivDist) rivDist = d;
  }

  const riparian = wt.wet ? 0 : smooth(58, 4, rivDist) * (1 - smooth(0.55, 0.9, sl));
  const isPlateau = h > 224 && sl < 0.32 ? 1 : 0;
  const isShelf = (h >= 32 && h <= 224 && sl < 0.52) ? 1 : 0;
  const isRim = (h > 210 && h < 252 && z < -360 && z > -520 && sl < 0.65) ? 1 : 0;
  const rock = clamp(smooth(0.45, 0.95, sl) + (tier === 'cliff' ? 0.35 : 0), 0, 1);
  const seep = clamp(isShelf * smooth(0.42, 0.78, KRAND.fbm(x * 0.005 + 3.1, z * 0.005 - 2.4, 0, 2, 7321)) * (0.4 + 0.6 * north) + riparian * 0.55, 0, 1);

  return {
    bench: isPlateau * (1 - rock) * 0.22,
    terrace: clamp(riparian + (h < 38 && sl < 0.35 ? 0.55 : 0), 0, 1),
    shelf: isShelf * (1 - rock * 0.6),
    rim: isRim,
    seep: seep,
    rock: rock,
    slope: sl,
    north: north,
    wet: clamp(0.18 + riparian * 0.62 + seep * 0.48, 0, 1),
    fog: h < 45 ? 0.08 : 0,
    flow: smooth(26, 2, rivDist),
    canyon: smooth(235, 30, h),
    cold: clamp(0.28 + smooth(220, 275, h) * 0.18, 0, 1)
  };
}

const amFloraFields = {
  bench: (x, z) => amFloraZoneAt(x, z).bench,
  terrace: (x, z) => amFloraZoneAt(x, z).terrace,
  shelf: (x, z) => amFloraZoneAt(x, z).shelf,
  rim: (x, z) => amFloraZoneAt(x, z).rim,
  seep: (x, z) => amFloraZoneAt(x, z).seep,
  rock: (x, z) => amFloraZoneAt(x, z).rock,
  slope: (x, z) => amFloraZoneAt(x, z).slope,
  north: (x, z) => amFloraZoneAt(x, z).north,
  wet: (x, z) => amFloraZoneAt(x, z).wet,
  fog: (x, z) => amFloraZoneAt(x, z).fog,
  flow: (x, z) => amFloraZoneAt(x, z).flow,
  oasis: () => 0,
  canyon: (x, z) => amFloraZoneAt(x, z).canyon,
  cold: (x, z) => amFloraZoneAt(x, z).cold
};

if (AM_FLORA) {
  BIO.init({
    THREE: THREE,
    scene: scene,
    terrainH: amaroH,
    waterH: (x, z) => {
      const w = amaroWater(x, z);
      return w.wet ? w.wy : -1e9;
    },
    mask: AM_FLORA.mask,
    obstacles: [],
    fields: amFloraFields,
    ticks: fn => FRAME_HOOKS.push((dt, now) => fn(dt, now / 1000)),
    seed: AM_FLORA.seed,
    origin: [[-95, -910], [420, -455], [-520, 620]],
    center: [AM_FLORA.cx, AM_FLORA.cz],
    tags: AM_FLORA.tags,
    register: o => {
      AM_FLORA.regs.push(o);
      if (AM_FLORA.space) AM_FLORA.space.insert(o, o.x, o.z, o.r == null ? 1.5 : o.r);
    },
    err: m => reportErr('flora ' + m),
    eye: () => [camera.position.x, camera.position.y, camera.position.z],
    lod: { hero: 420, mid: 950, far: 3200, floor: [380, 820] }
  });
}
