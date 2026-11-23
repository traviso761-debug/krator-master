/* ================================================================= URUNDASHI HIGHLAND FLORA HOST BINDING
   [G data] Binds biomes/shighlands Station 4 (shumar: 62-biome-shigh-shumar.js) to Urundashi's steppe bench, moat banks, and
   Dubnosriba / Ayn al-Dubnu riparian meadows (urundashiH, urundashiSlope, urundashiWater, UR_RING.get().floraClear), recording
   every plant in KTAGS and KSPACE. */

const UR_FLORA = (function () {
  if (typeof BIO === 'undefined' || typeof UR === 'undefined' || typeof UR_RING === 'undefined') return null;
  const ring = UR_RING.get();
  const R = 900;
  const mask = (x, z) => {
    const r = Math.hypot(x, z - 80);
    if (r > R) return 0;
    const sl = urundashiSlope(x, z, 4);
    if (sl > 0.85) return 0;
    const h = urundashiH(x, z);
    /* Keep the defensive moat glacis and 4 gate-bridge esplanades clear for garrison sightlines */
    if (UR.nearBridge(x, z, 28) || UR.inMoat(x, z, 14)) return 0;
    /* Inside the walled qasba only court gardens take trees; open dry steppe has windbreak groves + understorey */
    if (KCITY.grid.inside(UR_CITY.get().grid, x, z)) {
      const cellG = KRAND.unit(KRAND.hash(Math.round(x / 16), Math.round(z / 16), 7741));
      if (cellG > 0.05) return 0;
    } else if (h > 44) {
      const cellS = KRAND.unit(KRAND.hash(Math.round(x / 18), Math.round(z / 18), 7743));
      if (cellS > 0.09) return 0;
    }
    return ring.floraClear(x, z, 2.2) ? 1 : 0;
  };
  const tags = (typeof KTAGS !== 'undefined' && KTAGS.VOCAB) ? KTAGS.create({ build: 'urundashi-flora' }) : null;
  const space = typeof KSPACE !== 'undefined' ? KSPACE.create({ cell: 24 }) : null;
  const regs = [];
  return {
    R: R,
    cx: 0,
    cz: 80,
    mask: mask,
    tags: tags,
    space: space,
    regs: regs,
    seed: KRAND.hash(0x5b44, 7791)
  };
})();

function urFloraZoneAt(x, z) {
  const h = urundashiH(x, z);
  const sl = urundashiSlope(x, z, 4);
  const wt = urundashiWater(x, z);
  const e = 6;
  const gz = (urundashiH(x, z + e) - urundashiH(x, z - e)) / (2 * e);
  const gx = (urundashiH(x + e, z) - urundashiH(x - e, z)) / (2 * e);
  const gm = Math.hypot(gx, gz);
  const north = gm < 1e-4 ? 0.35 : clamp((gz / gm) * 0.5 + 0.5, 0, 1);

  let rivDist = 999;
  for (let i = 0; i < UR.RIVERS.length; i++) {
    const q = UR.polyNear(x, z, UR.RIVERS[i].pts);
    const d = Math.max(0, q.d - q.hw);
    if (d < rivDist) rivDist = d;
  }
  const moatBank = UR.inMoat(x, z, 14) && !wt.wet ? 1 : 0;
  const riparian = wt.wet ? 0 : Math.max(smooth(56, 4, rivDist), moatBank * 0.65) * (1 - smooth(0.50, 0.85, sl));
  const isSteppe = h > 44 && sl < 0.28 ? 1 : 0;
  const isShelf = h >= 14 && h <= 48 && sl < 0.42 ? 1 : 0;
  const rock = clamp(smooth(0.32, 0.82, sl) + (UR.inMoat(x, z, 5) ? 0.35 : 0), 0, 1);
  const seep = clamp(isShelf * smooth(0.40, 0.76, KRAND.fbm(x * 0.005 + 2.7, z * 0.005 - 1.9, 0, 2, 7721)) + riparian * 0.55, 0, 1);

  return {
    bench: isSteppe * (1 - rock) * 0.28,
    terrace: clamp(riparian + (h < 28 && sl < 0.30 ? 0.55 : 0), 0, 1),
    shelf: isShelf * (1 - rock * 0.5),
    rim: moatBank,
    seep: seep,
    rock: rock,
    slope: sl,
    north: north,
    wet: clamp(0.22 + riparian * 0.60 + seep * 0.44, 0, 1),
    fog: h < 18 ? 0.06 : 0,
    flow: smooth(24, 2, rivDist),
    canyon: smooth(64, 8, h),
    cold: clamp(0.32 + smooth(50, 85, h) * 0.16, 0, 1)
  };
}

const urFloraFields = {
  bench: (x, z) => urFloraZoneAt(x, z).bench,
  terrace: (x, z) => urFloraZoneAt(x, z).terrace,
  shelf: (x, z) => urFloraZoneAt(x, z).shelf,
  rim: (x, z) => urFloraZoneAt(x, z).rim,
  seep: (x, z) => urFloraZoneAt(x, z).seep,
  rock: (x, z) => urFloraZoneAt(x, z).rock,
  slope: (x, z) => urFloraZoneAt(x, z).slope,
  north: (x, z) => urFloraZoneAt(x, z).north,
  wet: (x, z) => urFloraZoneAt(x, z).wet,
  fog: (x, z) => urFloraZoneAt(x, z).fog,
  flow: (x, z) => urFloraZoneAt(x, z).flow,
  oasis: () => 0,
  canyon: (x, z) => urFloraZoneAt(x, z).canyon,
  cold: (x, z) => urFloraZoneAt(x, z).cold
};

if (UR_FLORA) {
  BIO.init({
    THREE: THREE,
    scene: scene,
    terrainH: urundashiH,
    waterH: (x, z) => {
      const w = urundashiWater(x, z);
      return w.wet ? w.y : -1e9;
    },
    mask: UR_FLORA.mask,
    obstacles: [],
    fields: urFloraFields,
    ticks: fn => FRAME_HOOKS.push((dt, now) => fn(dt, now / 1000)),
    seed: UR_FLORA.seed,
    origin: [[110, 520], [560, -220], [-360, 480]],
    center: [UR_FLORA.cx, UR_FLORA.cz],
    tags: UR_FLORA.tags,
    register: o => {
      UR_FLORA.regs.push(o);
      if (UR_FLORA.space) UR_FLORA.space.insert(o, o.x, o.z, o.r == null ? 1.5 : o.r);
    },
    err: m => reportErr('flora ' + m),
    eye: () => [camera.position.x, camera.position.y, camera.position.z],
    lod: { hero: 420, mid: 950, far: 3000, floor: [360, 780] }
  });
}
