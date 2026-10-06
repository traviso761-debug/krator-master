/* ======================================================================
   Krator Fauna: mounts (kits/fauna/krator-fauna-mounts.js)
   Animals the peoples ride and drive. First: the fire salamander of the crater drylands, the Scyvoi's mount (moved here
   from kits/scyvoi, 2026-10-06; the Scyvoi kit keeps the tack and fits it with KratorFauna.profile).
   ====================================================================== */
/* the salamander's body: t from the tail tip (0) to the snout (1), at scale 1: [t, z along, y of the centre line,
   half-width, half-height] (a heavy, low beast); the tail is t < FA_SAL_TAIL, the head t > 0.84 */
const FA_SAL = [[0, -2.55, .24, .015, .015], [.12, -2.05, .32, .1, .11], [.28, -1.35, .48, .24, .25], [.4, -.75, .66, .44, .37], [.5, -.3, .76, .56, .43],
  [.62, .3, .8, .6, .45], [.72, .85, .79, .53, .42], [.8, 1.25, .77, .39, .33], [.87, 1.62, .77, .46, .26], [.94, 2.0, .73, .43, .2], [1, 2.28, .69, .21, .11]];
const FA_SAL_TAIL = 0.36;
function faSalKey(t, i) {
  for (let k = 0; k < FA_SAL.length - 1; k++) { const a = FA_SAL[k], b = FA_SAL[k + 1];
    if (t <= b[0]) { const f = (t - a[0]) / (b[0] - a[0]), e = f * f * (3 - 2 * f); return a[i] + (b[i] - a[i]) * (i >= 3 ? e : f); } }
  return FA_SAL[FA_SAL.length - 1][i];
}
/* the markings (sRGB hex): 0 fire-black with ember blotches, 1 dun-red with saffron bands; t along, a round (0 the spine) */
function faSalSkin(v) {
  const base = v ? 0x5a2414 : 0x161414, spot = v ? 0xd8a028 : 0xf07418, spot2 = v ? 0xe8c040 : 0xf4a020, belly = v ? 0xc87a3a : 0xd8843a;
  return function (t, a) {
    const top = Math.cos(a);
    if (top < -0.55) return top < -0.75 ? belly : (faHash(t * 30, a, 1) < 0.5 ? belly : base);
    if (v) return Math.sin(t * 44) > 0.55 && top > -0.3 ? (faHash(Math.floor(t * 20), 1, 2) < 0.5 ? spot : spot2) : base;
    const n = faNoise(t * 22, a * 2.2, 3.7) * 0.74 + 0.26 * faNoise(t * 50, a * 5, 9.1);
    return n > 0.62 && top > -0.4 ? (n > 0.7 ? spot2 : spot) : base;
  };
}
ANIMAL({
  key: 'salamander', name: 'Fire salamander', group: 'mounts',
  tags: { biomes: ['crater-drylands'], koppen: ['BSk', 'BSh'], aridity: ['semiarid', 'arid'], climate: ['temperate', 'tropic'], riparian: 'both',
    abyssal: false, domestic: true, herdedBy: ['scyvoi'], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'defensive',
    habitat: ['ground', 'marsh', 'shallows'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 4.8, height: 1.5 },
  source: [{ build: 'kits/scyvoi', file: 'src/56-sa-beasts.js', note: 'first drawn in the Scyvoi kit (2026-10-05), moved here 2026-10-06; the Scyvoi kit keeps the tack' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: true },
  yields: { meat: { amount: 140, note: 'a riding beast dressed; tough, eaten smoked' },
    eggs: { amount: 40, note: 'one clutch a year in a seep after the rains; a delicacy' },
    hide: { amount: 1, hideM2: 3.5, note: 'thick, slick and slow to burn: fire cloaks, shields, bellows; a beast also sheds its skin in strips each spring' } },
  life: { maturity: 4, lifespan: 40, litter: 40, gestation: 60, note: 'eggs, then an aquatic larva for a year in the seeps; it regrows a lost limb in a season (so, the riders say, do they)' },
  variants: 2, variantNames: ['ember: fire-black with ember blotches', 'dun: dun-red with saffron bands'],
  breeds: { riding: { scale: 1, mass: 420, role: 'riding mount' }, war: { scale: 1.08, mass: 540, role: 'war mount' }, draught: { scale: 1.28, mass: 860, role: 'draught' } },
  w: 2.2, d: 5.0, h: 1.6,
  data: { mass: 420, speed: { walk: 1.6, run: 9 }, gait: { type: 'sprawl', freq: 0.9, stride: 0.9 }, grazePitch: 0.32,
    herd: 'kept singly or in a band\'s string; wild ones lie up alone in the seeps', fleeDistance: 0, aggression: 0.35, regrows: true,
    schedule: ['REST', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, S = A.S, rest = A.pose === 'rest', dy = rest ? -0.42 : 0, skin = faSalSkin(v);
    const span = (t0, t1, curl) => [t => { const tt = t0 + (t1 - t0) * t; return [Math.sin((1 - tt) * 3) * (curl || 0) * Math.pow(1 - tt, 2) * S, (faSalKey(tt, 2) + dy) * S, faSalKey(tt, 1) * S]; },
      t => { const tt = t0 + (t1 - t0) * t; return [faSalKey(tt, 3) * S, faSalKey(tt, 4) * S]; }];
    const at = t => [0, (faSalKey(t, 2) + dy) * S, faSalKey(t, 1) * S];
    /* the trunk */
    { const [c, r] = span(FA_SAL_TAIL - 0.02, 0.86); A.tube('skin', c, r, 26, 16, null, { colf: (t, a) => skin(FA_SAL_TAIL - 0.02 + (0.88 - FA_SAL_TAIL) * t, a) }); }
    /* the tail: it sways about its root */
    A.part('tail', at(FA_SAL_TAIL), () => { const [c, r] = span(0, FA_SAL_TAIL + 0.02, 0.25 + 0.3 * (v % 2)); A.tube('skin', c, r, 14, 14, null, { caps: true, colf: (t, a) => skin(t * (FA_SAL_TAIL + 0.02), a) }); });
    /* the head: a broad flat skull, eyes on top, the long mouth line */
    A.part('head', at(0.84), () => {
      const [c, r] = span(0.84, 1); A.tube('skin', c, r, 10, 16, null, { caps: true, colf: (t, a) => skin(0.84 + 0.16 * t, a) });
      const hy = (faSalKey(0.95, 2) + dy) * S, hz = 1.98 * S;
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.22 * S, hy + 0.11 * S, hz - 0.06 * S, 0.075 * S, 0.075 * S, 0.075 * S, 0x120c08, { seg: 10 });
        A.ellip('eye', s * 0.24 * S, hy + 0.135 * S, hz - 0.03 * S, 0.03 * S, 0.03 * S, 0.03 * S, 0xe8b040, { seg: 6 });
        const L = [[s * 0.31, -0.05, -0.35], [s * 0.3, -0.06, 0], [s * 0.17, -0.07, 0.28], [0, -0.07, 0.34]].map(q => [q[0] * S, hy + q[1] * S, hz + q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.012 * S, 0.012 * S, 0x2a0e08, 5);
      }
    });
    /* the legs: splayed, each turning about its shoulder or hip; the feet flat with four toes */
    const LEGS = [[0.92, 1, 1, 0], [0.92, 1, -1, 1], [-0.42, 0, 1, 2], [-0.42, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * 0.42 * S, (0.66 + dy) * S, z * S];
      A.part('leg' + i, b, () => {
        const kn = rest ? [s * 0.82 * S, 0.3 * S, (z + (front ? 0.2 : -0.1)) * S] : [s * 0.76 * S, 0.46 * S, (z + (front ? 0.08 : -0.1)) * S];
        const ft = rest ? [s * 0.98 * S, 0.07 * S, (z + (front ? 0.48 : 0.12)) * S] : [s * 0.74 * S, 0.06 * S, (z + (front ? 0.26 : 0.04)) * S];
        const lerp3 = (p, q) => t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
        A.tube('skin', lerp3(b, kn), t => [(0.24 - 0.09 * t) * S, (0.26 - 0.1 * t) * S], 4, 10, null, { colf: (t, a) => skin(0.6, a) });
        A.ellip('skin', kn[0], kn[1], kn[2], 0.155 * S, 0.155 * S, 0.155 * S, skin(0.6, 0), { seg: 10 });
        A.tube('skin', lerp3(kn, ft), t => [(0.15 - 0.04 * t) * S, (0.16 - 0.06 * t) * S], 4, 8, null, { caps: true, colf: (t, a) => skin(0.6, a) });
        A.ellip('skin', ft[0], ft[1], ft[2] + 0.06 * S, 0.17 * S, 0.06 * S, 0.2 * S, skin(0.6, 0), { seg: 10 });
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.38 + (front ? 0 : 0.1) * s;
          A.cone('skin', [ft[0], ft[1] - 0.02 * S, ft[2] + 0.08 * S], [ft[0] + Math.sin(a) * 0.24 * S, ft[1] - 0.025 * S, ft[2] + 0.08 * S + Math.cos(a) * 0.24 * S], 0.04 * S, 0.018 * S, skin(0.6, 0), 6); }
      });
    }
    /* for the tack a people fits: the body's profile (t from tail to snout -> centre line and half sizes) and anchors */
    A.profile(t => ({ z: faSalKey(t, 1) * S, y: (faSalKey(t, 2) + dy) * S, hw: faSalKey(t, 3) * S, hh: faSalKey(t, 4) * S }));
    A.anchor('saddle', [0, (faSalKey(0.62, 2) + faSalKey(0.62, 4) + dy) * S, 0.25 * S]);
    A.anchor('bridle', [0, (faSalKey(0.95, 2) + dy) * S, 1.98 * S]);
    A.anchor('chest', [0, (faSalKey(0.78, 2) + dy) * S, 1.18 * S]);
    A.anchor('tailRoot', at(FA_SAL_TAIL)); A.anchor('headRoot', at(0.84));
  }
});
