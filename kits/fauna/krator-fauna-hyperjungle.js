/* ======================================================================
   Krator Fauna: the hyperjungle (kits/fauna/krator-fauna-hyperjungle.js)
   The animals of the central hyperjungle belt, ported from biomes/hyperjungle/src/58-biome-hyperjungle-fauna.js
   (2026-10-06): the sky ray, the canopy dart, the jungle butterfly, the strider and the bough sloth. The kit drew
   each as one vertex-coloured instanced body in a unit frame (+x forward), scaled per instance (the scale is metres:
   the kit is in metres) and tinted per instance; here each is drawn at its typical scale, the instance tints are the
   variants, and the colour is the kit's vertex colour times the tint (both linear, as the kit's shader did).
   The spore motes of the same pass are not ported: they are additive billboard discs of drifting spores, not animals
   (no body, no life); they belong with a particle or flora pass, not here.
   ====================================================================== */
/* the vertex colour times the instance tint, both sRGB hex, multiplied in linear (as the kit's instanced shader did),
   times k; a THREE.Color in linear, which the builder takes as it is */
function faHjLin(hex, tint, k) {
  const a = new THREE.Color(hex).convertSRGBToLinear();
  if (tint != null) { const b = new THREE.Color(tint).convertSRGBToLinear(); a.r *= b.r; a.g *= b.g; a.b *= b.b; }
  if (k) { a.r = Math.min(1, a.r * k); a.g = Math.min(1, a.g * k); a.b = Math.min(1, a.b * k); }
  return a;
}
/* a polyline as a curve t 0..1 */
function faHjPath(pts) {
  const n = pts.length - 1;
  return t => { const f = Math.min(n - 1e-6, Math.max(0, t * n)), k = Math.floor(f), r = f - k, a = pts[k], b = pts[k + 1];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; };
}
/* a flat wing as a lens-section tube from its root out along +x (s = 1, the left) or -x (s = -1): span from rootX to
   tipX (metres), the chord's centre from z0 to z1, the chord c0 to c1, rising dih, thickness th at the root; the tip
   rounds off. Drawn inside the current part. */
function faHjWing(A, fam, s, y0, rootX, tipX, z0, z1, c0, c1, dih, th, col) {
  A.tube(fam, t => [s * (rootX + (tipX - rootX) * t), y0 + dih * t, z0 + (z1 - z0) * t],
    t => { const e = Math.sqrt(Math.max(0, 1 - Math.pow(t, 6))); return [Math.max(0.004, (c0 + (c1 - c0) * t) / 2 * e), Math.max(0.0015, th * (1 - 0.7 * t) * Math.max(0.3, e))]; },
    18, 10, col, { caps: true });
}
/* the instance tints of the kit's pass (the variants) */
const FA_HJ_RAY_TINT = [0x6a6e74, 0x7a7060, 0x5e6672, 0x8a8070];
const FA_HJ_DART_TINT = [0x6a7a62, 0x7a6a4a, 0x5a7a7a, 0x8a7a5a, 0x4a6a5a];
const FA_HJ_FLY_TINT = [0xc4566a, 0xc98d2e, 0xa85ab8, 0xbe4632, 0xd0a848, 0x8e5ea0, 0x4a8ae0, 0xe8d040, 0xf0f0e8];   /* PAL.bloom, then blue, yellow, white */
const FA_HJ_STRIDER_TINT = [0x9a9e86, 0xa8987a, 0x8e9682, 0xb0a48c];
const FA_HJ_SLOTH_TINT = [0x5a4a38, 0x6a5a44, 0x4a4034];
const FA_HJ_BIOME = { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], abyssal: false };
const FA_HJ_SRC = { build: 'biomes/hyperjungle', file: 'src/58-biome-hyperjungle-fauna.js' };

/* ---------------------------------------------------------------- the sky ray */
ANIMAL({
  key: 'sky-ray', name: 'Sky ray', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'omnivore', feeding: 'filter feeder', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky'], locomotion: ['flies', 'glides'] }),
  size: { length: 11.2, height: 1.5, span: 18.9 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '28-34, 133-139', note: 'rayGeo (body, head, tail, two wing pairs) and the flocks: 5 to 12 rays wheeling 30-120 m above the canopy of the hero disc on banked orbits, a slow glide-flap; scale 6.5-11.5 per ray (LORE.md: "6-12 m soarers"; the drawn span is 2.1x the scale)' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 150, note: 'only from a ray brought down or found fallen; lean and dark' },
    hide: { amount: 1, hideM2: 60, note: 'the wing membrane, thin and tough: prized for sails, awnings and roofing' } },
  life: { maturity: 8, lifespan: 60, litter: 1, gestation: 360, note: 'invented: a single pup born on the wing, as a manta' },
  variants: 4, variantNames: ['slate', 'dun', 'blue-grey', 'sand'],
  w: 19.2, d: 11.4, h: 1.6,
  data: { mass: 380, legs: 0, wings: 2, sizeRange: [0.72, 1.28], speed: { walk: 14, run: 26, fly: 18, note: 'never lands: walk is its slowest soar, run a dive' },
    gait: { type: 'flyer', freq: 0.18, stride: 0 }, flap: { freq: 0.18, amp: 0.12, glide: 0.4, fold: 0 },
    herd: 'flocks of 5 to 12 wheeling together over the canopy', fleeDistance: 30, aggression: 0.05, neverLands: true,
    schedule: ['FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY'],
    scheduleNote: 'aloft day and night; it sieves the drifting insects and spores over the canopy by day and soars slow and high by night' },
  build: function (A) {
    /* in flight pose (it never lands): the kit's unit body at scale 9, lifted so the belly clears y = 0 */
    const v = A.variant, tint = FA_HJ_RAY_TINT[v], K = 9 * A.S, Y = y => (y + 0.09) * K, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x5a5e62), belly = col(0x5a5e62, 1.25), headC = col(0x50545a), tailC = col(0x44484c), wingC = col(0x62666a), finC = col(0x50545a);
    A.ellip('skin', 0, Y(0), 0.05 * K, 0.105 * K, 0.077 * K, 0.266 * K, null, { seg: 20, colf: (x, y, z) => y < 0 ? belly : bodyC });
    A.part('head', [0, Y(0.01), 0.27 * K], () => {
      A.ellip('skin', 0, Y(0.02), 0.36 * K, 0.063 * K, 0.056 * K, 0.112 * K, headC, { seg: 14 });
      for (const s of [-1, 1]) A.ellip('eye', s * 0.05 * K, Y(0.035), 0.41 * K, 0.011 * K, 0.011 * K, 0.011 * K, 0x0c0c0e, { seg: 8 });
    });
    A.part('tail', [0, Y(0.01), -0.215 * K], () => A.tube('skin', t => [0, Y(0.01), (-0.215 - 0.56 * t) * K], t => { const r = (0.03 - 0.02 * t) * K; return [r, r]; }, 6, 8, tailC, { caps: true }));
    /* the great wings (root chord 0.42, tip chord 0.22 swept back, a little dihedral) and the hind fins at the tail root */
    for (const s of [1, -1]) {
      A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.07 * K, Y(0), -0.03 * K], () => faHjWing(A, 'skin', s, Y(0), 0.07 * K, 1.05 * K, -0.03 * K, -0.12 * K, 0.42 * K, 0.22 * K, 0.06 * K, 0.03 * K, wingC));
      A.part(s > 0 ? 'wing2L' : 'wing2R', [s * 0.01 * K, Y(0.005), -0.28 * K], () => faHjWing(A, 'skin', s, Y(0.005), 0.01 * K, 0.28 * K, -0.28 * K, -0.40 * K, 0.12 * K, 0.10 * K, 0.02 * K, 0.012 * K, finC));
    }
  }
});

/* ---------------------------------------------------------------- the canopy dart */
ANIMAL({
  key: 'canopy-dart', name: 'Canopy dart', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['canopy', 'trunks'], locomotion: ['flies', 'leaps'] }),
  size: { length: 1.0, height: 0.36, span: 1.39 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '35-41, 140-146', note: 'dartGeo (body, head, beak, wings, a fanned tail) and the groups: 2 to 6 flitting through the openings 10-45 m up under the canopy; scale 1.2-2.1. The kit never lands them: the legs here are new, for the perch' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 0.6, note: 'netted in the openings; a mouthful' },
    eggs: { amount: 6, note: 'two clutches of three in a bark hollow; taken by climbers' },
    feathers: { amount: 0.04, note: 'the green and teal flight feathers, for fletching and finery' } },
  life: { maturity: 1, lifespan: 8, litter: 3, gestation: 18, note: 'gestation here is the incubation' },
  variants: 5, variantNames: ['moss', 'umber', 'teal', 'ochre', 'jade'],
  w: 1.42, d: 1.17, h: 0.38,
  data: { mass: 1.5, legs: 2, wings: 1, sizeRange: [0.73, 1.27], speed: { walk: 0.3, run: 0.8, fly: 12 },
    gait: { type: 'flyer', freq: 1.75, stride: 0.1 }, flap: { freq: 1.75, amp: 0.32, glide: 0.15, fold: 0.12, sweep: 1.3, tuck: 0.9 },
    herd: 'loose groups of 2 to 6', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'REST', 'REST', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    /* the kit's unit body at scale 1.65, standing on two new legs (the kit's darts never perch) */
    const v = A.variant, tint = FA_HJ_DART_TINT[v], K = 1.65 * A.S, Y = y => (y + 0.13) * K, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a7a62), belly = col(0x6a7a62, 1.3), headC = col(0x5a6a56), beakC = col(0x3a3a30), wingC = col(0x5e6e58), tailC = col(0x4e5e4a);
    A.ellip('coat', 0, Y(0), 0, 0.072 * K, 0.072 * K, 0.162 * K, null, { seg: 14, colf: (x, y, z) => y < 0 ? belly : bodyC });
    A.part('head', [0, Y(0.02), 0.12 * K], () => {
      A.ellip('coat', 0, Y(0.03), 0.17 * K, 0.055 * K, 0.055 * K, 0.055 * K, headC, { seg: 12 });
      A.cone('horn', [0, Y(0.03), 0.2 * K], [0, Y(0.025), 0.295 * K], 0.02 * K, 0.002 * K, beakC, 6);
      for (const s of [-1, 1]) A.ellip('eye', s * 0.042 * K, Y(0.045), 0.19 * K, 0.01 * K, 0.01 * K, 0.01 * K, 0x0a0806, { seg: 8 });
    });
    A.part('tail', [0, Y(0), -0.12 * K], () => A.tube('coat', t => [0, Y(0.005 * t), (-0.12 - 0.18 * t) * K], t => [(0.03 + 0.07 * t) * K, (0.012 - 0.006 * t) * K], 5, 8, tailC, { caps: true }));
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.04 * K, Y(0.01), 0], () => faHjWing(A, 'coat', s, Y(0.01), 0.04 * K, 0.42 * K, 0, -0.04 * K, 0.16 * K, 0.14 * K, 0.05 * K, 0.012 * K, wingC));
    /* the legs: a short tarsus, three toes forward and one back */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', [s * 0.03 * K, Y(-0.05), -0.01 * K], () => {
      const ank = [s * 0.035 * K, 0.012 * K, 0.01 * K];
      A.tube('skin', faHjPath([[s * 0.03 * K, Y(-0.05), -0.01 * K], [s * 0.034 * K, 0.05 * K, -0.012 * K], ank]), t => { const r = (0.011 - 0.004 * t) * K; return [r, r]; }, 4, 6, beakC, { caps: true });
      for (const a of [-0.45, 0, 0.45, Math.PI]) { const L = (a === Math.PI ? 0.035 : 0.05) * K;
        A.cone('skin', [ank[0], 0.007 * K, ank[2]], [ank[0] + Math.sin(a) * L, 0.004 * K, ank[2] + Math.cos(a) * L], 0.005 * K, 0.002 * K, beakC, 5); }
    });
  }
});

/* ---------------------------------------------------------------- the jungle butterfly */
/* one wing's outline (the kit's painted wing texture, WINGTEX): four quadratic curves in the wing's (u, v), u 0 the
   body root to 1 the tip, v 0 the fore edge to 1 the aft; and its eye spots [u, v, radius] */
const FA_HJ_FLY_OUT = [[[0.016, 0.5], [0.35, 0.02], [0.96, 0.10]], [[0.96, 0.10], [0.98, 0.55], [0.80, 0.72]], [[0.80, 0.72], [0.55, 0.98], [0.20, 0.90]], [[0.20, 0.90], [0.04, 0.75], [0.016, 0.5]]];
const FA_HJ_FLY_SPOT = [[0.62, 0.32, 0.086], [0.55, 0.68, 0.0625], [0.80, 0.50, 0.047]];
function faHjFlyOutline(s) {
  const f = Math.min(3.99999, Math.max(0, s * 4)), k = Math.floor(f), t = f - k, q = FA_HJ_FLY_OUT[k], m = 1 - t;
  return [m * m * q[0][0] + 2 * m * t * q[1][0] + t * t * q[2][0], m * m * q[0][1] + 2 * m * t * q[1][1] + t * t * q[2][1]];
}
ANIMAL({
  key: 'jungle-butterfly', name: 'Jungle butterfly', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'both', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'frugivore', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'canopy'], locomotion: ['flies', 'walks'] }),
  size: { length: 0.45, height: 0.4, span: 1.0 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '42-45, 69-73, 147-151', note: 'flyGeo (a thread body, two painted wing quads) and WINGTEX (dark rim, veins, three eye spots); 1 to 4 drifting 1-4 m up in the openings and round the blooms of the near floor; scale 0.8-1.6, tinted from the bloom palette. Head, antennae and legs are new' })],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 0.25, lifespan: 0.6, litter: 200, gestation: 7, note: 'egg, caterpillar and chrysalis in the first quarter year; litter the eggs a female lays; gestation the egg to hatching' },
  variants: 9, variantNames: ['rose', 'amber', 'violet', 'scarlet', 'gold', 'plum', 'blue', 'yellow', 'white'],
  w: 0.78, d: 0.64, h: 0.4,
  data: { mass: 0.4, legs: 6, wings: 1, sizeRange: [0.67, 1.33], speed: { walk: 0.05, run: 0.1, fly: 4 },
    gait: { type: 'insect', freq: 1.1, stride: 0.03 }, flap: { freq: 1.1, amp: 0.6, glide: 0 },
    herd: 'alone or 2 to 4 round a bloom', fleeDistance: 3, aggression: 0,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'FLY', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'BROWSE', 'BROWSE', 'FLY', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
    scheduleNote: 'BROWSE: at the blooms (nectar) and the fallen fruit' },
  build: function (A) {
    /* perched on six new legs, the wings half raised (they beat about this) */
    const v = A.variant, tint = FA_HJ_FLY_TINT[v], K = 1.2 * A.S, yb = 0.06 * K, RAISE = 0.7;
    const bodyC = faHjLin(0x2a2420, tint), wingC = faHjLin(0xffffff, tint, 0.68), rimC = faHjLin(0xffffff, tint, 0.045), spotC = faHjLin(0xffffff, tint, 0.021), paleC = faHjLin(0xffffff, tint, 0.79);
    /* the body: a thread, thicker aft, and the thorax */
    A.tube('plain', t => [0, yb, (-0.17 + 0.34 * t) * K], t => { const r = (0.02 - 0.005 * t) * K * Math.sqrt(Math.max(0.15, 1 - Math.pow(2 * t - 1, 8))); return [r, r]; }, 8, 6, bodyC, { caps: true });
    A.ellip('plain', 0, yb, 0.07 * K, 0.022 * K, 0.022 * K, 0.05 * K, bodyC, { seg: 8 });
    A.part('head', [0, yb, 0.15 * K], () => {
      A.ellip('plain', 0, yb, 0.185 * K, 0.019 * K, 0.019 * K, 0.019 * K, bodyC, { seg: 8 });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.014 * K, yb + 0.004 * K, 0.195 * K, 0.009 * K, 0.009 * K, 0.009 * K, 0x0a0806, { seg: 6 });
        const tip = [s * 0.06 * K, yb + 0.09 * K, 0.33 * K];
        A.cone('plain', [s * 0.008 * K, yb + 0.012 * K, 0.2 * K], tip, 0.003 * K, 0.0025 * K, bodyC, 4);
        A.ellip('plain', tip[0], tip[1], tip[2], 0.007 * K, 0.007 * K, 0.009 * K, bodyC, { seg: 6 });
      }
    });
    /* the wings: one outline (the kit's painted wing) fanned from a point near its root, both faces drawn, raised by
       RAISE about the body's long axis; the texture's dark rim in the vertex colour, its eye spots as discs */
    const C0 = [0.12, 0.5], jr = j => 1 - Math.pow(1 - j, 1.5);
    const uvAt = (i, j) => { const o = faHjFlyOutline(i), r = jr(j); return [C0[0] + (o[0] - C0[0]) * r, C0[1] + (o[1] - C0[1]) * r]; };
    const wcol = (i, j) => {
      if (jr(j) > 0.955) return rimC;
      return wingC;
    };
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.012 * K, yb, 0.02 * K], () => {
      const cw = Math.cos(RAISE), sw = Math.sin(RAISE);
      const at = (i, j, off) => { const p = uvAt(i, j), u = p[0], w = p[1];
        const fore = (0.16 - 0.32 * w) * (1 - u) + (0.13 - 0.30 * w) * u, lat = 0.40 * u * K;
        return [s * (0.012 * K + lat * cw + off * sw), yb + lat * sw - off * cw, (0.02 + fore) * K]; };
      A.sheet('plain', (i, j) => at(i, j, 0), 40, 12, null, { colf: wcol });
      A.sheet('plain', (i, j) => at(1 - i, j, 0.0012), 40, 12, null, { colf: (i, j) => wcol(1 - i, j) });
      /* the eye spots: a dark disc with a pale centre, laid in the wing's plane through both faces */
      for (const e of FA_HJ_FLY_SPOT) { const lat = 0.40 * e[0] * K, c = [s * (0.012 * K + lat * cw), yb + lat * sw, (0.02 + (0.16 - 0.32 * e[1]) * (1 - e[0]) + (0.13 - 0.30 * e[1]) * e[0]) * K];
        A.ellip('plain', c[0], c[1], c[2], e[2] * 0.40 * K, 0.0016 * K, e[2] * 0.31 * K, spotC, { seg: 12, rz: s * RAISE });
        A.ellip('plain', c[0], c[1], c[2], e[2] * 0.18 * K, 0.0024 * K, e[2] * 0.14 * K, paleC, { seg: 10, rz: s * RAISE }); }
    });
    /* six legs: pairs front to back, left then right */
    [[0.10, 0.05], [0.06, 0], [0.02, -0.05]].forEach(([z, dz], k) => { for (const s of [1, -1]) A.part('leg' + (2 * k + (s > 0 ? 0 : 1)), [s * 0.008 * K, yb - 0.01 * K, z * K], () => {
      A.tube('plain', faHjPath([[s * 0.008 * K, yb - 0.01 * K, z * K], [s * 0.05 * K, yb + 0.015 * K, (z + dz * 0.3) * K], [s * 0.085 * K, 0.0035 * K, (z + dz) * K]]), t => { const r = 0.0035 * K; return [r, r]; }, 6, 4, bodyC, { caps: true });
    }); });
  }
});

/* ---------------------------------------------------------------- the strider */
ANIMAL({
  key: 'hyperjungle-strider', name: 'Hyperjungle strider', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground'], locomotion: ['walks', 'runs'] }),
  size: { length: 9.0, height: 6.5 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '47-59, 103-127, 157-167', note: 'striderGeo (body, rump, neck, head, ears, tail, three dorsal plates, four legs and hooves) and the herds: 4 to 9 walking between waypoints on the open floor between the boles, grazing between legs; scale 4.6-6.4, legs swung in the shader' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 6500, note: 'a living hill: one feeds a village for a season, smoked' },
    hide: { amount: 1, hideM2: 70, note: 'thick grey-green hide: boots, shields, boat skins' },
    horn: { amount: 25, note: 'the three dorsal plates: cut for bowls, scrapers and tiles' } },
  life: { maturity: 6, lifespan: 45, litter: 1, gestation: 480 },
  variants: 4, variantNames: ['sage', 'fawn', 'grey-green', 'pale'],
  w: 2.6, d: 9.3, h: 6.6,
  data: { mass: 15000, legs: 4, sizeRange: [0.84, 1.16], speed: { walk: 1.7, run: 6 }, gait: { type: 'quadruped', freq: 0.3, stride: 2.8 }, grazePitch: 1.0,
    herd: 'herds of 4 to 9 on the open floor', fleeDistance: 40, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    /* the kit's unit body at scale 5.5: kit x forward is z here, kit z across is x */
    const v = A.variant, tint = FA_HJ_STRIDER_TINT[v], K = 5.5 * A.S, P = (x, y, z) => [z * K, y * K, x * K], col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a6e5a), belly = col(0x6a6e5a, 1.28), rumpC = col(0x646852), neckC = col(0x62665a), headC = col(0x5c6054), darkC = col(0x4a4e44), plateC = col(0x8a7a58), legC = col(0x4e5246), hoofC = col(0x2e3028);
    A.ellip('skin', 0, 0.66 * K, 0, 0.22 * K, 0.231 * K, 0.418 * K, null, { seg: 22, colf: (x, y, z) => y < -0.04 * K ? belly : bodyC });
    A.ellip('skin', 0, 0.64 * K, -0.34 * K, 0.144 * K, 0.144 * K, 0.176 * K, rumpC, { seg: 16 });
    /* the dorsal ridge: three four-sided horny plates */
    for (let k = 0; k < 3; k++) A.cone('horn', P(0.14 - k * 0.16, 0.87, 0), P(0.14 - k * 0.16, 1.01, 0), 0.045 * K, 0.003 * K, plateC, 4);
    A.part('head', P(0.27, 0.70, 0), () => {
      A.tube('skin', t => P(0.296 + 0.328 * t, 0.729 + 0.262 * t, 0), t => { const r = (0.09 - 0.03 * t) * K; return [r, r]; }, 6, 12, neckC, {});
      A.ellip('skin', 0, 1.04 * K, 0.66 * K, 0.0675 * K, 0.072 * K, 0.162 * K, headC, { seg: 14 });
      for (const s of [-1, 1]) A.ellip('eye', s * 0.06 * K, 1.055 * K, 0.70 * K, 0.011 * K, 0.011 * K, 0.011 * K, 0x0a0a08, { seg: 8 });
    });
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', P(0.58, 1.08, s * 0.06), () => A.cone('skin', P(0.58, 1.075, s * 0.06), P(0.575, 1.18, s * 0.075), 0.025 * K, 0.002 * K, darkC, 5));
    A.part('tail', P(-0.434, 0.528, 0), () => A.tube('skin', t => P(-0.434 - 0.372 * t, 0.528 + 0.144 * t, 0), t => { const r = (0.03 - 0.018 * t) * K; return [r, r]; }, 5, 6, darkC, { caps: true }));
    /* the legs: long columns with a slight knee (front) and hock (hind), a hoof each; they turn at the kit's leg top */
    for (const [x, z, front, i] of [[0.13, 0.28, 1, 0], [-0.13, 0.28, 1, 1], [0.13, -0.28, 0, 2], [-0.13, -0.28, 0, 3]]) A.part('leg' + i, P(z, 0.64, x), () => {
      const pts = (front ? [[z, 0.66], [z + 0.015, 0.36], [z + 0.005, 0.08], [z + 0.008, 0.04]] : [[z, 0.66], [z - 0.03, 0.40], [z - 0.005, 0.10], [z, 0.04]]).map(q => P(q[0], q[1], x));
      A.tube('skin', faHjPath(pts), t => { const r = (t < 0.33 ? 0.058 - 0.048 * t : t < 0.9 ? 0.042 - 0.012 * (t - 0.33) / 0.57 : 0.036) * K; return [r, r]; }, 9, 8, legC, {});
      const hf = pts[3];
      A.cone('hoof', [hf[0], 0, hf[2] + 0.004 * K], [hf[0], 0.05 * K, hf[2]], 0.045 * K, 0.04 * K, hoofC, 8);
    });
  }
});

/* ---------------------------------------------------------------- the bough sloth */
ANIMAL({
  key: 'bough-sloth', name: 'Bough sloth', group: 'hyperjungle',
  tags: Object.assign({}, FA_HJ_BIOME, { riparian: 'non', domestic: false, herdedBy: [],
    diet: 'herbivore', feeding: 'browser', activity: 'cathemeral', temperament: 'docile',
    habitat: ['canopy', 'trunks'], locomotion: ['climbs'] }),
  size: { length: 1.5, height: 1.7 },
  source: [Object.assign({}, FA_HJ_SRC, { lines: '60-65, 168-171', note: 'slothGeo (body, head, four limbs reaching up) hung under the big limbs (r >= 1.5 m, 40 m up or more) of the near hero hypertrees, static; scale 2-3.4; drawn in the instance tint alone (its material took no vertex colour)' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 160, note: 'a climber\'s prize, brought down with ropes' },
    hide: { amount: 1, hideM2: 4, note: 'the long coarse fur: rugs, bedding, rain capes' } },
  life: { maturity: 3, lifespan: 30, litter: 1, gestation: 300, note: 'the young rides its mother\'s belly for its first year' },
  variants: 3, variantNames: ['brown', 'tawny', 'dark'], poses: ['hang'],
  w: 1.12, d: 1.6, h: 1.8,
  data: { mass: 400, legs: 4, sizeRange: [0.74, 1.26], speed: { walk: 0.1, run: 0.25 }, gait: { type: 'quadruped', freq: 0.2, stride: 0.3 }, grazePitch: 0.5,
    herd: 'alone; a mother with one young', fleeDistance: 0, aggression: 0.1, hangs: true,
    schedule: ['REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'BROWSE', 'REST', 'REST'] },
  build: function (A) {
    /* the one pose, 'hang': as the kit hung it, four limbs straight up into the underside of a bough; built with its
       back (lowest) on y = 0, so a host hangs it by its 'grip' anchor (the bough's underside) */
    const v = A.variant, tint = FA_HJ_SLOTH_TINT[v], K = 2.7 * A.S, Y = y => (y + 0.56) * K;
    const fur = faHjLin(tint), furD = faHjLin(tint, null, 0.7), headC = faHjLin(tint, null, 1.3), faceC = faHjLin(tint, null, 1.9), limbC = faHjLin(tint, null, 0.75), clawC = 0x2a241c;
    const rx = 0.192 * K, ry = 0.18 * K, rz = 0.24 * K, by = Y(-0.38);
    A.ellip('coat', 0, by, 0, rx, ry, rz, null, { seg: 18, colf: (x, y, z) => faNoise(x * 6 + 1.3, y * 6, z * 6) > 0.6 ? furD : fur });
    /* (no hair locks: as strips they read as spines; the coat is the fur grain and the darker noise streaks) */
    A.part('head', [0, Y(-0.33), 0.15 * K], () => {
      A.ellip('coat', 0, Y(-0.30), 0.2 * K, 0.11 * K, 0.11 * K, 0.11 * K, headC, { seg: 14 });
      A.ellip('coat', 0, Y(-0.30), 0.285 * K, 0.075 * K, 0.07 * K, 0.03 * K, faceC, { seg: 12 });
      for (const s of [-1, 1]) A.ellip('eye', s * 0.035 * K, Y(-0.285), 0.306 * K, 0.012 * K, 0.012 * K, 0.008 * K, 0x0a0806, { seg: 8 });
      A.ellip('mouth', 0, Y(-0.315), 0.312 * K, 0.016 * K, 0.012 * K, 0.008 * K, 0x1a1410, { seg: 8 });
    });
    /* the limbs: leg0/1 the arms (front), leg2/3 the legs, each turning at the body; hooked claws dug into the bark */
    for (const [x, z, top, i] of [[0.12, 0.1, 0.05, 0], [-0.12, 0.1, 0.05, 1], [0.1, -0.14, -0.02, 2], [-0.1, -0.14, -0.02, 3]]) A.part('leg' + i, [x * K, Y(-0.27), z * K], () => {
      A.tube('coat', t => [x * K, Y(-0.33 + (top + 0.33) * t), z * K], t => { const r = (0.025 + 0.005 * t) * K; return [r, r]; }, 5, 8, limbC, {});
      for (const dx of [-0.018, 0, 0.018]) A.tube('horn', faHjPath([[(x + dx) * K, Y(top - 0.01), z * K], [(x + dx) * K, Y(top + 0.03), (z + 0.012) * K], [(x + dx) * K, Y(top + 0.045), (z + 0.04) * K]]), t => { const r = (0.007 - 0.005 * t) * K; return [r, r]; }, 6, 5, clawC, { caps: true });
    });
    A.anchor('grip', [0, Y(0.04), 0]);
  }
});
