/* ======================================================================
   Krator Fauna: the hyperjungle (kits/fauna/krator-fauna-hyperjungle.js)
   The animals of the central hyperjungle belt, ported from biomes/hyperjungle/src/58-biome-hyperjungle-fauna.js
   (2026-10-06): the sky ray, the canopy dart, the jungle butterfly, the strider and the bough sloth. The kit drew
   each as one vertex-coloured instanced body in a unit frame (+x forward), scaled per instance (the scale is metres:
   the kit is in metres) and tinted per instance; here each is drawn at its typical scale, the instance tints are the
   variants, and the colour is the kit's vertex colour times the tint (both linear, as the kit's shader did).
   The quality pass (2026-10-06) kept each kit body's plan and palette and gave it anatomy: the strider jointed,
   muscled legs, a neck that thickens into the chest, a head with a jaw and muzzle, plates with thickness; the sloth
   jointed shaggy limbs with long claws hooked over its bough; the butterfly a butterfly's body; the dart and the
   ray a bird's and a ray's shape, feathers and wing membrane.
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
/* linear colours: a mix, a scale, and a smooth step (e0 may be above e1: the step then falls) */
function faHjMix(a, b, t) { t = Math.max(0, Math.min(1, t)); return new THREE.Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t); }
function faHjK(a, k) { return new THREE.Color(Math.min(1, a.r * k), Math.min(1, a.g * k), Math.min(1, a.b * k)); }
function faHjSm(e0, e1, x) { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
/* a polyline as a curve t 0..1 */
function faHjPath(pts) {
  const n = pts.length - 1;
  return t => { const f = Math.min(n - 1e-6, Math.max(0, t * n)), k = Math.floor(f), r = f - k, a = pts[k], b = pts[k + 1];
    return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, a[2] + (b[2] - a[2]) * r]; };
}
/* a Catmull-Rom curve through rows of numbers (any width), t 0..1 by row index */
function faHjCR(P) {
  const n = P.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i, out = [];
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    for (let k = 0; k < p1.length; k++) { const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      out.push(0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u)); }
    return out;
  };
}
/* a skin along a curve, its section frames carried along the curve (parallel transport), so a leg that runs near
   vertical or bends back and forth never twists or pinches (A.tube flips its section's 'up' there). c(t) -> [x, y, z],
   rad(t) -> [half-width, half-height]; o.up the first section's 'up' (default +y, +z where the curve starts near
   vertical); o.colf(t, angle, p) (angle 0 on the 'up' side); o.round [w0, w1]: each end closes in a dome over that
   much of t; o.shag [amp, freq]: the radius roughened by noise (a shaggy coat). Faces wound outward. */
function faHjTube(A, fam, c, rad, nt, ns, col, o) {
  o = o || {};
  const pts = [], T = [], N = [], B = [];
  for (let i = 0; i <= nt; i++) pts.push(c(i / nt));
  for (let i = 0; i <= nt; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(nt, i + 1)];
    T.push(new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize()); }
  const up = o.up ? new THREE.Vector3(o.up[0], o.up[1], o.up[2]) : (Math.abs(T[0].y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0));
  const n = up.clone().addScaledVector(T[0], -up.dot(T[0])).normalize();
  for (let i = 0; i <= nt; i++) { if (i) n.addScaledVector(T[i], -n.dot(T[i])).normalize(); N.push(n.clone()); B.push(new THREE.Vector3().crossVectors(T[i], n)); }
  const rw = o.round || [0, 0], G = [], CC = [];
  const dome = t => { let k = 1;
    if (rw[0] > 0 && t < rw[0]) k = Math.sqrt(Math.max(0, 1 - Math.pow((rw[0] - t) / rw[0], 2)));
    if (rw[1] > 0 && t > 1 - rw[1]) k = Math.min(k, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + rw[1]) / rw[1], 2))));
    return k; };
  for (let i = 0; i <= nt; i++) {
    const t = i / nt, r = rad(t), k = dome(t), p = pts[i], row = [], crow = [];
    for (let j = 0; j <= ns; j++) {
      const f = (j % ns) / ns * TAU, ca = Math.cos(f), sa = Math.sin(f), a = r[0] * k, b = r[1] * k;
      let q = [p[0] + b * ca * N[i].x - a * sa * B[i].x, p[1] + b * ca * N[i].y - a * sa * B[i].y, p[2] + b * ca * N[i].z - a * sa * B[i].z];
      if (o.shag) { const F = o.shag[1], d = 1 + o.shag[0] * 2 * (faNoise(q[0] * F + 7.1, q[1] * F + 1.3, q[2] * F) - 0.5);
        q = [p[0] + (q[0] - p[0]) * d, p[1] + (q[1] - p[1]) * d, p[2] + (q[2] - p[2]) * d]; }
      row.push(q); crow.push(o.colf ? o.colf(t, f, q) : col);
    }
    G.push(row); CC.push(crow);
  }
  A.sheet(fam, (u, v) => G[Math.round(v * nt)][Math.round(u * ns)], ns, nt, null, { colf: (u, v) => CC[Math.round(v * nt)][Math.round(u * ns)] });
}
/* a tube through rows [x, y, z, half-width, half-height] (a Catmull-Rom curve) */
function faHjRows(A, fam, rows, nt, ns, col, o) {
  const f = faHjCR(rows);
  faHjTube(A, fam, t => { const q = f(t); return [q[0], q[1], q[2]]; }, t => { const q = f(t); return [Math.max(0.0005, q[3]), Math.max(0.0005, q[4])]; }, nt, ns, col, o);
  return f;
}
/* a thin plate (a wing, a fin, a tail fan) for the two-sided families (membrane, feather): P(u, v) its mid surface,
   th(u, v) [up, down] its thickness either side; the top and the underside, colf(u, v, side) (side 1 top, -1 under) */
function faHjPlate(A, fam, P, th, nu, nv, colf) {
  for (const sd of [1, -1]) A.sheet(fam, (u, v) => { const p = P(u, v), h = th(u, v); return [p[0], p[1] + (sd > 0 ? h[0] : -h[1]), p[2]]; }, nu, nv, null, { colf: (u, v) => colf(u, v, sd) });
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
    /* in flight pose (it never lands): the kit's body at scale 9 (head, body and tail one flattened, countershaded
       skin), the great wings and the hind fins as membrane with a thick, muscled leading edge, lifted so the belly
       clears y = 0 */
    const v = A.variant, tint = FA_HJ_RAY_TINT[v], M = A.S, K = 9 * M, Y = y => (y + 0.09) * K, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x5a5e62), belly = col(0x5a5e62, 1.55), headC = col(0x50545a), tailC = col(0x44484c), wingC = col(0x62666a), finC = col(0x50545a);
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const mott = (c, q) => faHjK(c, 0.9 + 0.2 * faNoise(q[0] * 0.9 + 3.3, q[1] * 0.9, q[2] * 0.9));
    const skinCol = base => (t, f, q) => mott(faHjMix(base, belly, faHjSm(-0.1, -0.6, Math.cos(f))), q);
    /* the body: broad and flat, from the tail root to the head's root */
    faHjRows(A, 'skin', R([[0, 0.81, -2.4, 0.22, 0.18], [0, 0.81, -1.7, 0.7, 0.48], [0, 0.81, -0.6, 0.97, 0.66], [0, 0.82, 0.6, 0.98, 0.68],
      [0, 0.83, 1.7, 0.84, 0.6], [0, 0.85, 2.6, 0.62, 0.5]]), 18, 18, null, { round: [0.08, 0], colf: skinCol(bodyC) });
    /* the gill slits under the fore body */
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) A.ellip('mouth', s * (0.42 - 0.02 * i) * M, 0.3 * M, (1.55 + i * 0.2) * M, 0.2 * M, 0.025 * M, 0.03 * M, 0x1c1c1e, { seg: 8, ry: s * 0.15 });
    A.part('head', [0, Y(0.01), 0.27 * K], () => {
      faHjRows(A, 'skin', R([[0, 0.86, 2.3, 0.6, 0.48], [0, 0.89, 3.0, 0.66, 0.5], [0, 0.9, 3.6, 0.6, 0.43], [0, 0.9, 4.05, 0.48, 0.3], [0, 0.88, 4.32, 0.3, 0.16]]),
        12, 18, null, { round: [0, 0.22], colf: skinCol(headC) });
      /* the wide filter mouth, and the two head fins that funnel the drift into it */
      A.ellip('mouth', 0, 0.74 * M, 4.12 * M, 0.34 * M, 0.06 * M, 0.14 * M, 0x18181a, { seg: 14 });
      for (const s of [-1, 1]) {
        A.ellip('skin', s * 0.5 * M, 0.8 * M, 4.12 * M, 0.08 * M, 0.17 * M, 0.3 * M, headC, { seg: 10, rz: -s * 0.35, rx: -0.25 });
        A.ellip('eye', s * 0.6 * M, 0.98 * M, 3.55 * M, 0.1 * M, 0.1 * M, 0.11 * M, 0x0c0c0e, { seg: 10 });
      }
    });
    /* the tail: a long flattened whip */
    A.part('tail', [0, Y(0.01), -0.215 * K], () => faHjRows(A, 'skin', R([[0, 0.82, -2.1, 0.2, 0.16], [0, 0.84, -3.4, 0.12, 0.09], [0, 0.88, -5.2, 0.06, 0.045], [0, 0.92, -6.97, 0.02, 0.016]]),
      14, 8, null, { round: [0, 0.06], colf: skinCol(tailC) }));
    /* the great wings (root chord 3.8 m, tip 2 m swept back, a little dihedral, the tip rounded) and the hind fins: the
       leading edge thick and muscled, the trailing edge a thin membrane; dark above, pale beneath */
    const wing = (s, y0, rootX, tipX, z0, z1, c0, c1, dih, th, base) => faHjPlate(A, 'membrane', (u, w) => {
      const e = Math.sqrt(Math.max(0, 1 - Math.pow(u, 6))), ch = (c0 + (c1 - c0) * u) * Math.max(0.04, e), zc = z0 + (z1 - z0) * u - 0.05 * (c0 - c1) * u * u;
      return [s * (rootX + (tipX - rootX) * u), y0 + dih * u, zc + ch * (0.5 - w)];
    }, (u, w) => { const k = th * (1 - 0.7 * u) * Math.sin(Math.PI * Math.pow(Math.max(0.0001, w), 0.5)) * Math.sqrt(Math.max(0.05, 1 - Math.pow(u, 6))); return [k, 0.4 * k]; },
      22, 8, (u, w, sd) => sd > 0 ? faHjK(base, (w > 0.85 ? 0.72 : 1) * (u > 0.9 ? 0.8 : 1)) : faHjMix(base, belly, 0.75));
    for (const s of [1, -1]) {
      A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.07 * K, Y(0), -0.03 * K], () => wing(s, Y(0), 0.07 * K, 1.05 * K, -0.03 * K, -0.12 * K, 0.42 * K, 0.22 * K, 0.06 * K, 0.03 * K, wingC));
      A.part(s > 0 ? 'wing2L' : 'wing2R', [s * 0.01 * K, Y(0.005), -0.28 * K], () => wing(s, Y(0.005), 0.01 * K, 0.28 * K, -0.28 * K, -0.40 * K, 0.12 * K, 0.10 * K, 0.02 * K, 0.012 * K, finC));
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
    gait: { type: 'flyer', freq: 1.75, stride: 0.1 }, flap: { freq: 1.75, amp: 0.32, glide: 0.15, fold: 0.05, sweep: 1.3, foldScale: 0.6, roll: 0.75, tuck: 0.9 },
    herd: 'loose groups of 2 to 6', fleeDistance: 6, aggression: 0,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'REST', 'REST', 'FLY', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    /* the kit's body at scale 1.65 (in metres here), feathered, standing on two new legs (the kit's darts never perch).
       Perched, the runtime folds each wing back along the flank (flap.sweep, foldScale): its chord is kept narrow at the
       root so the folded wing stays in the body, and the folded wing's colour is laid on the upper flank */
    const v = A.variant, tint = FA_HJ_DART_TINT[v], M = A.S, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a7a62), belly = col(0x6a7a62, 1.45), headC = col(0x5a6a56), beakC = col(0x3a3a30), wingC = col(0x5e6e58), tailC = col(0x4e5e4a);
    const tipC = faHjK(wingC, 0.55), legC = col(0x4a4a3e), clawC = 0x1c1a16;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const plum = (t, f, q) => { const up = Math.cos(f), z = q[2] / M;
      let c = faHjMix(bodyC, belly, faHjSm(-0.05, -0.6, up));
      /* the folded wing's coverts on the upper flank (and the back's darker mantle) */
      c = faHjMix(c, faHjK(wingC, 0.92), faHjSm(0.05, 0.3, up) * faHjSm(0.85, 0.6, up) * faHjSm(0.14, 0.04, z) * faHjSm(-0.34, -0.2, z));
      return faHjK(c, 0.94 + 0.12 * faNoise(q[0] * 40, q[1] * 40, q[2] * 40)); };
    faHjRows(A, 'feather', R([[0, 0.236, -0.31, 0.025, 0.02], [0, 0.228, -0.24, 0.062, 0.056], [0, 0.218, -0.13, 0.097, 0.095], [0, 0.212, -0.01, 0.118, 0.118],
      [0, 0.222, 0.1, 0.112, 0.115], [0, 0.245, 0.18, 0.085, 0.09], [0, 0.27, 0.23, 0.064, 0.068]]), 16, 14, null, { round: [0.1, 0], colf: plum });
    /* the head: rounded, merging into the neck, a pale eye ring, a fine slightly hooked beak */
    A.part('head', [0, 0.26 * M, 0.2 * M], () => {
      faHjRows(A, 'feather', R([[0, 0.262, 0.18, 0.062, 0.066], [0, 0.284, 0.25, 0.08, 0.078], [0, 0.29, 0.31, 0.082, 0.078], [0, 0.285, 0.36, 0.064, 0.058], [0, 0.28, 0.395, 0.034, 0.03]]),
        12, 14, null, { round: [0, 0.22], colf: (t, f) => faHjMix(headC, belly, 0.7 * faHjSm(-0.2, -0.8, Math.cos(f))) });
      faHjTube(A, 'horn', faHjPath([[0, 0.29 * M, 0.37 * M], [0, 0.285 * M, 0.43 * M], [0, 0.27 * M, 0.49 * M]]), t => [0.024 * M * (1 - 0.9 * t), 0.017 * M * (1 - 0.85 * t)], 8, 8, beakC, { round: [0, 0.08] });
      faHjTube(A, 'horn', faHjPath([[0, 0.27 * M, 0.37 * M], [0, 0.264 * M, 0.46 * M]]), t => [0.019 * M * (1 - 0.9 * t), 0.009 * M * (1 - 0.8 * t)], 6, 8, faHjK(beakC, 1.25), { round: [0, 0.1] });
      for (const s of [-1, 1]) {
        A.ellip('feather', s * 0.066 * M, 0.3 * M, 0.315 * M, 0.02 * M, 0.02 * M, 0.019 * M, faHjK(belly, 1.5), { seg: 10 });
        A.ellip('eye', s * 0.075 * M, 0.301 * M, 0.317 * M, 0.014 * M, 0.014 * M, 0.014 * M, 0x0a0806, { seg: 8 });
      }
    });
    /* the fanned tail: a dozen feathers' tips notch its edge, a dark band at the end */
    A.part('tail', [0, 0.232 * M, -0.27 * M], () => faHjPlate(A, 'feather', (u, w) => {
      const a = 2 * u - 1, L = 0.25 + 0.03 * (1 - a * a) - 0.012 * Math.abs(Math.sin(u * Math.PI * 6)) * w;
      return [a * (0.028 + 0.11 * w) * M, (0.236 + 0.012 * w) * M, (-0.27 - L * w) * M];
    }, (u, w) => [0.005 * M * (1 - 0.8 * w), 0.002 * M * (1 - w)], 12, 5, (u, w, sd) => faHjK(faHjMix(tailC, tipC, faHjSm(0.72, 0.9, w)), sd > 0 ? 1 : 1.2)));
    /* the wings: broad at the wrist, pointed primaries with notched tips, coverts paler than the flight feathers; built
       spread (flight), folded by the runtime when perched */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.075 * M, 0.27 * M, 0.07 * M], () => faHjPlate(A, 'feather', (u, w) => {
      const le = 0.09 - 0.12 * Math.pow(u, 1.4);
      let ch = u < 0.35 ? 0.17 + 0.03 * u / 0.35 : 0.2 * (1 - Math.pow((u - 0.35) / 0.65, 1.3)) + 0.03;
      if (u > 0.4) ch *= 1 - 0.07 * Math.abs(Math.sin(u * Math.PI * 7)) * w;
      return [s * (0.075 + 0.64 * u) * M, (0.27 + 0.035 * u) * M, (le - ch * w) * M];
    }, (u, w) => [0.014 * M * (1 - 0.6 * u) * Math.sin(Math.PI * Math.pow(Math.max(0.0001, w), 0.6)), 0.004 * M * Math.sin(Math.PI * w)], 20, 6, (u, w, sd) => {
      let c = w < 0.4 ? faHjK(wingC, 1.12) : faHjK(wingC, 0.85);
      if (u > 0.55 && w > 0.45) c = faHjMix(c, tipC, faHjSm(0.55, 0.9, u));
      return sd > 0 ? c : faHjMix(c, belly, 0.5); }));
    /* the legs: a feathered thigh, a scaled shank, three toes forward and one back, each with its claw */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', [s * 0.045 * M, 0.13 * M, -0.01 * M], () => {
      A.ellip('feather', s * 0.05 * M, 0.135 * M, -0.01 * M, 0.034 * M, 0.042 * M, 0.045 * M, belly, { seg: 10 });
      const ank = [s * 0.056 * M, 0.018 * M, 0.006 * M];
      A.cone('scale', [s * 0.05 * M, 0.12 * M, -0.02 * M], ank, 0.0095 * M, 0.0075 * M, legC, 7);
      for (const a of [-0.45, 0, 0.45, Math.PI]) { const L = (a === Math.PI ? 0.04 : 0.058) * M, tip = [ank[0] + Math.sin(a) * L, 0.005 * M, ank[2] + Math.cos(a) * L];
        A.cone('scale', [ank[0], 0.008 * M, ank[2]], tip, 0.0058 * M, 0.0042 * M, legC, 5);
        A.cone('horn', tip, [tip[0] + Math.sin(a) * 0.016 * M, 0.002 * M, tip[2] + Math.cos(a) * 0.016 * M], 0.0035 * M, 0.0008 * M, clawC, 5); }
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
    /* perched on six short legs, the wings half raised (they beat about this). A butterfly's proportions: a furred
       thorax that carries the wings, a big-eyed head with clubbed antennae and a coiled tongue, a banded abdomen */
    const v = A.variant, tint = FA_HJ_FLY_TINT[v], M = A.S, K = 1.2 * M, yb = 0.075 * M, RAISE = 0.7;
    const bodyC = faHjLin(0x2a2420, tint), furC = faHjLin(0x4a3e34, tint, 1.2), bandC = faHjLin(0x2a2420, tint, 0.55);
    const wingC = faHjLin(0xffffff, tint, 0.68), rimC = faHjLin(0xffffff, tint, 0.045), spotC = faHjLin(0xffffff, tint, 0.021), paleC = faHjLin(0xffffff, tint, 0.79), veinC = faHjLin(0xffffff, tint, 0.3);
    /* the thorax, furred, and the abdomen, banded, its tip drooping a little */
    A.ellip('coat', 0, yb, 0.024 * M, 0.04 * M, 0.043 * M, 0.07 * M, null, { seg: 12, colf: (x, y, z) => faHjK(furC, 0.85 + 0.3 * faNoise(x * 300, y * 300, z * 300)) });
    faHjTube(A, 'plain', faHjPath([[0, yb + 0.004 * M, -0.03 * M], [0, yb - 0.004 * M, -0.15 * M], [0, yb - 0.016 * M, -0.27 * M]]),
      t => { const k = t < 0.25 ? 0.8 + 0.8 * t : 1 - 0.75 * Math.pow((t - 0.25) / 0.75, 1.5); return [0.029 * M * k, 0.031 * M * k]; }, 14, 10, null,
      { round: [0, 0.1], colf: t => Math.sin(t * Math.PI * 9) > 0.55 ? bandC : bodyC });
    A.part('head', [0, yb, 0.08 * M], () => {
      A.ellip('coat', 0, yb + 0.004 * M, 0.11 * M, 0.034 * M, 0.033 * M, 0.03 * M, furC, { seg: 10 });
      A.ellip('plain', 0, yb - 0.014 * M, 0.132 * M, 0.011 * M, 0.017 * M, 0.018 * M, furC, { seg: 8, rx: 0.5 });
      /* the tongue, coiled under the head */
      faHjTube(A, 'plain', t => { const a = t * Math.PI * 3.2, r = (0.016 - 0.011 * t) * M; return [0, yb - 0.034 * M + r * Math.cos(a), 0.13 * M + r * Math.sin(a)]; },
        () => [0.0028 * M, 0.0028 * M], 18, 5, bodyC, { up: [1, 0, 0] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.026 * M, yb + 0.01 * M, 0.122 * M, 0.022 * M, 0.024 * M, 0.022 * M, 0x1c1e14, { seg: 10 });
        const tip = [s * 0.075 * M, yb + 0.15 * M, 0.33 * M];
        faHjTube(A, 'plain', faHjCR([[s * 0.01 * M, yb + 0.025 * M, 0.125 * M], [s * 0.035 * M, yb + 0.1 * M, 0.22 * M], tip]), () => [0.0035 * M, 0.0035 * M], 10, 5, bodyC);
        A.ellip('plain', tip[0], tip[1], tip[2], 0.009 * M, 0.009 * M, 0.018 * M, bodyC, { seg: 8, rx: -0.5 });
      }
    });
    /* the wings: one outline (the kit's painted wing) fanned from a point near its root, raised by RAISE about the body's
       long axis; membrane (seen from both sides); the texture's dark rim, veins and eye spots */
    const C0 = [0.12, 0.5], jr = j => 1 - Math.pow(1 - j, 1.5), NU = 48;
    const uvAt = (i, j) => { const o = faHjFlyOutline(i), r = jr(j); return [C0[0] + (o[0] - C0[0]) * r, C0[1] + (o[1] - C0[1]) * r]; };
    const wcol = (i, j) => {
      const r = jr(j);
      if (r > 0.955) return rimC;
      let c = wingC;
      if (Math.round(i * NU) % 6 === 3 && r > 0.12) c = faHjMix(c, veinC, 0.55);
      return faHjMix(c, bodyC, 0.5 * faHjSm(0.25, 0.0, r));
    };
    const x0 = 0.02 * M, y0 = yb + 0.03 * M, cw = Math.cos(RAISE), sw = Math.sin(RAISE);
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * x0, y0, 0.024 * M], () => {
      const at = (i, j) => { const p = uvAt(i, j), u = p[0], w = p[1];
        const fore = (0.16 - 0.32 * w) * (1 - u) + (0.13 - 0.30 * w) * u, lat = 0.40 * u * K;
        return [s * (x0 + lat * cw), y0 + lat * sw, 0.024 * M + fore * K]; };
      A.sheet('membrane', at, NU, 12, null, { colf: wcol });
      /* the eye spots: a dark disc with a pale centre, laid in the wing's plane through both faces */
      for (const e of FA_HJ_FLY_SPOT) { const lat = 0.40 * e[0] * K, c = [s * (x0 + lat * cw), y0 + lat * sw, 0.024 * M + ((0.16 - 0.32 * e[1]) * (1 - e[0]) + (0.13 - 0.30 * e[1]) * e[0]) * K];
        A.ellip('membrane', c[0], c[1], c[2], e[2] * 0.40 * K, 0.0016 * K, e[2] * 0.31 * K, spotC, { seg: 12, rz: s * RAISE });
        A.ellip('membrane', c[0], c[1], c[2], e[2] * 0.18 * K, 0.0024 * K, e[2] * 0.14 * K, paleC, { seg: 10, rz: s * RAISE }); }
    });
    /* six legs, short and jointed: pairs front to back, left then right; the thigh out and up, the shin down to the foot */
    [[0.055, 0.065], [0.025, 0.005], [-0.005, -0.06]].forEach(([z, dz], k) => { for (const s of [1, -1]) {
      const hip = [s * 0.012 * M, yb - 0.03 * M, z * M], knee = [s * 0.052 * M, yb + 0.002 * M, (z + dz * 0.45) * M], ft = [s * 0.072 * M, 0.0035 * M, (z + dz) * M];
      A.part('leg' + (2 * k + (s > 0 ? 0 : 1)), hip, () => {
        A.cone('plain', hip, knee, 0.0068 * M, 0.0056 * M, bodyC, 6);
        A.ellip('plain', knee[0], knee[1], knee[2], 0.0062 * M, 0.0062 * M, 0.0062 * M, bodyC, { seg: 6 });
        A.cone('plain', knee, ft, 0.0052 * M, 0.0034 * M, bodyC, 6);
      });
    } });
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
  w: 2.4, d: 8.8, h: 6.6,
  data: { mass: 15000, legs: 4, sizeRange: [0.84, 1.16], speed: { walk: 1.7, run: 6 }, gait: { type: 'quadruped', freq: 0.3, stride: 2.8 }, grazePitch: 1.25,
    herd: 'herds of 4 to 9 on the open floor', fleeDistance: 40, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    /* the kit's plan at scale 5.5, in metres: a deep barrel and a heavy rump on long legs, a neck that rises from the
       chest to a long head, three horny plates on the spine. Sleek hide (the library's strider hide), countershaded */
    const v = A.variant, tint = FA_HJ_STRIDER_TINT[v], M = A.S, col = (h, k) => faHjLin(h, tint, k);
    const bodyC = col(0x6a6e5a), belly = col(0x6a6e5a, 1.28), rumpC = col(0x646852), neckC = col(0x62665a), headC = col(0x5c6054), darkC = col(0x4a4e44), plateC = col(0x8a7a58), legC = col(0x4e5246), hoofC = col(0x2e3028);
    const muzC = faHjK(darkC, 0.8), eyeC = 0x2a1c10;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const mott = (c, q) => faHjK(c, 0.93 + 0.14 * faNoise(q[0] * 1.6 + 2.1, q[1] * 1.6, q[2] * 1.6));
    const hide = base => (t, f, q) => { const up = Math.cos(f), z = q[2] / M;
      let c = faHjMix(base, rumpC, faHjSm(-1.2, -2.2, z));
      c = faHjMix(c, belly, faHjSm(-0.15, -0.7, up));
      c = faHjMix(c, darkC, 0.45 * faHjSm(0.86, 0.97, up));
      return mott(c, q); };
    /* the barrel, rump to chest */
    const BODY = faHjRows(A, 'sleek', R([[0, 3.62, -2.95, 0.1, 0.1], [0, 3.66, -2.72, 0.58, 0.64], [0, 3.68, -2.3, 0.88, 0.98], [0, 3.62, -1.5, 1.02, 1.12], [0, 3.56, -0.5, 1.13, 1.24],
      [0, 3.62, 0.5, 1.12, 1.26], [0, 3.78, 1.35, 1.0, 1.22], [0, 3.88, 2.0, 0.8, 1.04], [0, 3.9, 2.4, 0.44, 0.62], [0, 3.9, 2.56, 0.06, 0.06]]), 22, 16, null, { round: [0.05, 0.06], colf: hide(bodyC) });
    const spineY = z => { let best = 1e9, y = 0; for (let i = 0; i <= 200; i++) { const q = BODY(i / 200); if (Math.abs(q[2] - z) < best) { best = Math.abs(q[2] - z); y = q[1] + q[4]; } } return y; };
    /* the shoulder blades and the haunches, under the hide */
    for (const s of [1, -1]) {
      A.ellip('sleek', s * 0.64 * M, 3.6 * M, 1.62 * M, 0.3 * M, 0.95 * M, 0.6 * M, null, { seg: 12, rx: -0.35, colf: (x, y, z) => mott(y < -0.3 * M ? faHjMix(bodyC, belly, 0.4) : bodyC, [x, y, z]) });
      A.ellip('sleek', s * 0.68 * M, 3.55 * M, -1.85 * M, 0.36 * M, 1.0 * M, 0.85 * M, null, { seg: 12, rx: 0.2, colf: (x, y, z) => mott(rumpC, [x, y, z]) });
    }
    /* the dorsal ridge: three horny plates, thick at the root, leaning back, rounded to a point */
    for (let k = 0; k < 3; k++) { const z = (0.77 - k * 0.88) * M, ys = spineY(z), hgt = (0.82 - 0.06 * k) * M;
      faHjTube(A, 'horn', faHjPath([[0, ys - 0.25 * M, z], [0, ys + hgt, z - 0.22 * M]]), t => [0.1 * M * (1 - 0.65 * t), 0.42 * M * Math.pow(Math.max(0, 1 - t), 0.7) * (0.85 + 0.15 * Math.sin(Math.PI * Math.min(1, t * 2)))],
        10, 10, null, { up: [0, 0, 1], round: [0, 0.12], colf: t => t < 0.22 ? faHjMix(bodyC, plateC, t / 0.22) : faHjK(plateC, 1 + 0.25 * faHjSm(0.6, 1, t)) }); }
    /* the head with the neck: the neck thick where it leaves the chest, the head long, the lower jaw its own part */
    A.part('head', [0, 4.05 * M, 1.7 * M], () => {
      faHjRows(A, 'sleek', R([[0, 3.7, 1.2, 0.74, 0.97], [0, 4.1, 1.8, 0.62, 0.86], [0, 4.6, 2.35, 0.47, 0.62], [0, 5.1, 2.8, 0.37, 0.47], [0, 5.5, 3.12, 0.32, 0.4], [0, 5.72, 3.3, 0.3, 0.36]]),
        14, 14, null, { colf: (t, f, q) => { const up = Math.cos(f); return mott(faHjMix(faHjMix(neckC, belly, 0.6 * faHjSm(-0.2, -0.8, up)), darkC, 0.5 * faHjSm(0.82, 0.97, up)), q); } });
      faHjRows(A, 'sleek', R([[0, 5.74, 3.0, 0.29, 0.34], [0, 5.8, 3.3, 0.35, 0.37], [0, 5.74, 3.62, 0.32, 0.33], [0, 5.6, 3.98, 0.24, 0.26], [0, 5.48, 4.28, 0.2, 0.22], [0, 5.42, 4.48, 0.18, 0.2], [0, 5.4, 4.6, 0.12, 0.14]]),
        14, 14, null, { round: [0, 0.12], colf: (t, f, q) => mott(faHjMix(headC, muzC, faHjSm(4.0, 4.4, q[2] / M)), q) });
      for (const s of [-1, 1]) {
        /* the brow over each eye, the eye (an iris and a pupil), the nostrils, the line of the mouth */
        A.ellip('sleek', s * 0.27 * M, 5.98 * M, 3.45 * M, 0.12 * M, 0.07 * M, 0.17 * M, headC, { seg: 10 });
        A.ellip('eye', s * 0.315 * M, 5.86 * M, 3.47 * M, 0.06 * M, 0.07 * M, 0.08 * M, eyeC, { seg: 10 });
        A.ellip('eye', s * 0.36 * M, 5.87 * M, 3.48 * M, 0.02 * M, 0.04 * M, 0.035 * M, 0x050403, { seg: 8 });
        A.ellip('mouth', s * 0.09 * M, 5.46 * M, 4.57 * M, 0.04 * M, 0.03 * M, 0.035 * M, 0x14140f, { seg: 8, ry: s * 0.4 });
        faHjTube(A, 'mouth', faHjPath([[s * 0.15 * M, 5.3 * M, 4.5 * M], [s * 0.2 * M, 5.31 * M, 4.1 * M], [s * 0.23 * M, 5.36 * M, 3.8 * M]]), () => [0.02 * M, 0.016 * M], 6, 6, 0x1c1a14, { round: [0.15, 0.15] });
      }
    });
    A.part('jaw', [0, 5.52 * M, 3.3 * M], () => faHjRows(A, 'sleek', R([[0, 5.5, 3.15, 0.27, 0.2], [0, 5.38, 3.55, 0.22, 0.15], [0, 5.27, 3.95, 0.16, 0.1], [0, 5.22, 4.3, 0.13, 0.08], [0, 5.24, 4.5, 0.1, 0.06]]),
      10, 12, null, { round: [0.15, 0.2], colf: (t, f, q) => mott(faHjMix(faHjMix(headC, belly, 0.45 * faHjSm(0, -0.8, Math.cos(f))), muzC, faHjSm(4.0, 4.4, q[2] / M)), q) }));
    /* the ears: long leaves, tipped out, darker inside */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.27 * M, 6.0 * M, 3.2 * M], () => {
      A.ellip('sleek', s * 0.39 * M, 6.22 * M, 3.17 * M, 0.06 * M, 0.28 * M, 0.13 * M, darkC, { seg: 10, rz: -s * 0.55 });
      A.ellip('skin', s * 0.38 * M, 6.2 * M, 3.22 * M, 0.025 * M, 0.2 * M, 0.08 * M, faHjK(darkC, 0.6), { seg: 8, rz: -s * 0.55 });
    });
    /* the tail: hanging from the top of the rump, a dark tuft at the end */
    A.part('tail', [0, 3.9 * M, -2.72 * M], () => {
      const f = faHjRows(A, 'sleek', R([[0, 3.95, -2.55, 0.17, 0.17], [0, 3.85, -2.95, 0.15, 0.15], [0, 3.45, -3.4, 0.11, 0.11], [0, 2.95, -3.75, 0.08, 0.08], [0, 2.45, -3.95, 0.06, 0.06]]),
        12, 10, darkC, { round: [0, 0.08] });
      const tuft = [];
      for (let i = 0; i < 14; i++) { const q = f(0.82 + 0.18 * A.rnd()); tuft.push({ at: [q[0] + A.rr(-0.04, 0.04) * M, q[1], q[2] + A.rr(-0.04, 0.04) * M], dir: [A.rr(-0.25, 0.25), -1, A.rr(-0.35, 0.05)], len: A.rr(0.35, 0.6) * M, w: 0.09 * M, col: faHjK(darkC, 0.7), curl: 0.1 }); }
      A.locks('hair', tuft);
    });
    /* the legs: each turns about its shoulder or hip joint. The muscle at the top (the upper arm, the thigh) narrows to
       bony joints (elbow and knee in front, stifle and hock behind), a lean cannon, the fetlock, a pastern and the hoof */
    const legCol = (t, f, q) => { const y = q[1] / M; let c = faHjMix(legC, bodyC, faHjSm(1.5, 2.7, y)); if (y < 0.45) c = faHjMix(c, faHjK(darkC, 0.75), faHjSm(0.45, 0.3, y)); return mott(c, q); };
    for (const [front, s, i] of [[1, 1, 0], [1, -1, 1], [0, 1, 2], [0, -1, 3]]) {
      const pv = front ? [s * 0.66 * M, 3.3 * M, 1.75 * M] : [s * 0.72 * M, 3.5 * M, -1.75 * M];
      A.part('leg' + i, pv, () => {
        const rows = front
          ? [[0.66, 3.6, 1.85, 0.3, 0.42], [0.66, 3.1, 1.72, 0.3, 0.44], [0.63, 2.45, 1.42, 0.22, 0.32], [0.62, 2.0, 1.48, 0.2, 0.27], [0.6, 1.2, 1.55, 0.12, 0.14],
            [0.6, 0.85, 1.57, 0.09, 0.115], [0.6, 0.52, 1.58, 0.085, 0.11], [0.6, 0.3, 1.6, 0.1, 0.12], [0.6, 0.16, 1.72, 0.1, 0.1]]
          : [[0.72, 3.8, -1.8, 0.36, 0.6], [0.74, 3.2, -1.62, 0.38, 0.62], [0.72, 2.45, -1.3, 0.25, 0.36], [0.68, 1.95, -1.6, 0.2, 0.33], [0.66, 1.4, -2.0, 0.11, 0.17],
            [0.65, 0.95, -1.95, 0.09, 0.12], [0.64, 0.55, -1.88, 0.085, 0.11], [0.64, 0.3, -1.85, 0.1, 0.12], [0.64, 0.16, -1.74, 0.1, 0.1]];
        faHjRows(A, 'sleek', R(rows.map(r => [s * r[0], r[1], r[2], r[3], r[4]])), 18, 10, null, { up: [0, 0, 1], colf: legCol });
        const knob = (x, y, z, rx, ry, rz) => A.ellip('sleek', s * x * M, y * M, z * M, rx * M, ry * M, rz * M, null, { seg: 8, colf: (a, b, c) => legCol(0, 0, [s * x * M + a, y * M + b, z * M + c]) });
        if (front) {
          A.ellip('sleek', s * 0.66 * M, 2.85 * M, 1.5 * M, 0.26 * M, 0.5 * M, 0.3 * M, null, { seg: 10, rx: -0.3, colf: (a, b, c) => mott(bodyC, [a, b, c]) });   /* the triceps */
          knob(0.63, 2.42, 1.33, 0.15, 0.17, 0.15); knob(0.6, 1.17, 1.57, 0.13, 0.15, 0.13); knob(0.6, 0.31, 1.59, 0.115, 0.12, 0.13);
        } else {
          knob(0.73, 2.45, -1.22, 0.2, 0.22, 0.19); knob(0.66, 1.48, -2.12, 0.09, 0.15, 0.11); knob(0.64, 0.31, -1.86, 0.115, 0.12, 0.13);
        }
        const hz = (front ? 1.75 : -1.71) * M, hx = s * (front ? 0.6 : 0.64) * M;
        A.cone('hoof', [hx, 0.03 * M, hz + 0.035 * M], [hx, 0.26 * M, hz - 0.02 * M], 0.2 * M, 0.14 * M, hoofC, 12);
        A.ellip('hoof', hx, 0.03 * M, hz + 0.035 * M, 0.2 * M, 0.03 * M, 0.2 * M, faHjK(hoofC, 0.7), { seg: 12 });
      });
    }
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
  w: 1.38, d: 1.72, h: 1.9,
  data: { mass: 400, legs: 4, sizeRange: [0.74, 1.26], speed: { walk: 0.1, run: 0.25 }, gait: { type: 'climber', freq: 0.2, stride: 0.3 }, grazePitch: -0.45,
    idle: { headYaw: 0.3, headPitch: 0.06, tailYaw: 0 },
    herd: 'alone; a mother with one young', fleeDistance: 0, aggression: 0.1, hangs: true,
    schedule: ['REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'BROWSE', 'REST', 'REST'] },
  build: function (A) {
    /* the one pose, 'hang': as the kit hung it, back down and belly up, the four limbs reaching up to a bough that runs
       across it; the hands and feet meet under the bough and the long claws hook over it (round a 0.11 m bar, the
       sheet's; on a hero bough they sink into the bark). Built with its back's hair on y = 0, so a host hangs it by
       its 'grip' anchor (the bough's underside). Grazing (browsing) lifts the head to the leaves */
    const v = A.variant, tint = FA_HJ_SLOTH_TINT[v], M = A.S, G = 1.62 * M, BY = G + 0.114 * M, RHO = 0.132 * M;
    const fur = faHjLin(tint), furD = faHjLin(tint, null, 0.7), headC = faHjLin(tint, null, 1.3), faceC = faHjLin(tint, null, 1.9), limbC = faHjLin(tint, null, 0.8), maskC = faHjLin(tint, null, 0.3), clawC = 0x2a241c;
    const R = rows => rows.map(r => [r[0] * M, r[1] * M, r[2] * M, r[3] * M, r[4] * M]);
    const coat = base => (t, f, q) => { const n = faNoise(q[0] * 7 + 1.3, q[1] * 7, q[2] * 7); return faHjK(n > 0.6 ? faHjMix(base, furD, 0.8) : base, 0.92 + 0.16 * faNoise(q[0] * 23, q[1] * 23, q[2] * 23)); };
    /* the body: shaggy, slung low between the limbs */
    const BODY = faHjRows(A, 'shag', R([[0, 0.6, -0.74, 0.12, 0.12], [0, 0.58, -0.6, 0.36, 0.34], [0, 0.55, -0.3, 0.5, 0.42], [0, 0.56, 0.05, 0.52, 0.44],
      [0, 0.6, 0.35, 0.46, 0.4], [0, 0.66, 0.55, 0.32, 0.3], [0, 0.7, 0.66, 0.2, 0.2]]), 18, 20, null, { round: [0.12, 0], shag: [0.1, 6], colf: coat(fur) });
    /* the long coat hangs from the sides and the back toward the ground (a sloth's hair parts on its belly) */
    const hair = [];
    for (let i = 0; i < 170; i++) {
      /* each lock lies along the coat, down the flank toward the back, and only the lowest hang free */
      const t = A.rr(0.06, 0.84), f = A.rr(Math.PI * 0.35, Math.PI * 1.65), q = BODY(t), sn = Math.sin(f), cs = Math.cos(f);
      const at = [q[3] * sn * 0.96, q[1] + q[4] * cs * 0.96, q[2]], sd = f < Math.PI ? 1 : -1;
      const tang = [sd * cs, -sd * sn], dir = [0.65 * tang[0] + 0.25 * sn, 0.65 * tang[1] - 0.55 + 0.25 * cs, A.rr(-0.3, 0.05)];
      const len = Math.min(A.rr(0.09, 0.16) * M, Math.max(0.02 * M, (at[1] - 0.01 * M) / 1.15));
      hair.push({ at: at, dir: dir, len: len, w: A.rr(0.12, 0.17) * M, col: faHjK(A.rnd() < 0.45 ? furD : fur, 0.85), curl: 0.12 });
    }
    A.locks('hair', hair);
    /* the head: round, the pale face mask with a dark band through each eye, the dark nose */
    A.part('head', [0, 0.68 * M, 0.45 * M], () => {
      A.ellip('shag', 0, 0.72 * M, 0.62 * M, 0.28 * M, 0.27 * M, 0.26 * M, null, { seg: 16, colf: (x, y, z) => coat(headC)(0, 0, [x, y, z]) });
      A.ellip('shag', 0, 0.71 * M, 0.79 * M, 0.2 * M, 0.18 * M, 0.1 * M, faceC, { seg: 14 });
      for (const s of [-1, 1]) {
        A.ellip('shag', s * 0.085 * M, 0.745 * M, 0.865 * M, 0.08 * M, 0.034 * M, 0.03 * M, maskC, { seg: 10, rz: -s * 0.35, ry: s * 0.45 });
        A.ellip('eye', s * 0.072 * M, 0.755 * M, 0.89 * M, 0.024 * M, 0.024 * M, 0.018 * M, 0x0a0806, { seg: 8 });
      }
      A.ellip('mouth', 0, 0.69 * M, 0.9 * M, 0.048 * M, 0.032 * M, 0.026 * M, 0x1a1410, { seg: 10 });
      faHjTube(A, 'mouth', faHjCR([[-0.045 * M, 0.648 * M, 0.865 * M], [0, 0.64 * M, 0.882 * M], [0.045 * M, 0.648 * M, 0.865 * M]]), () => [0.006 * M, 0.006 * M], 8, 5, 0x1a1410, { round: [0.2, 0.2] });
    });
    /* the limbs: leg0/1 the arms (front), leg2/3 the legs, each turning at the shoulder or hip: a shaggy upper limb, the
       elbow or knee bent out, the forearm or shin, a padded hand or foot under the bough, three long hooked claws over it */
    const LIMBS = [
      [1, 1, [[0.34, 0.62, 0.36, 0.17], [0.46, 0.9, 0.3, 0.16], [0.53, 1.13, 0.22, 0.13], [0.48, 1.36, 0.1, 0.11], [0.43, 1.52, 0.02, 0.085]], [0.42, 1.575, 0.0], -1],
      [1, -1, null, null, -1],
      [0, 1, [[0.3, 0.56, -0.42, 0.17], [0.4, 0.84, -0.4, 0.16], [0.44, 1.0, -0.33, 0.13], [0.34, 1.32, -0.14, 0.1], [0.24, 1.53, -0.03, 0.08]], [0.22, 1.575, -0.01], 1],
      [0, -1, null, null, 1]];
    LIMBS.forEach((L, i) => {
      const src = L[2] || LIMBS[i - 1][2], hand = L[3] || LIMBS[i - 1][3], s = L[1], wrap = L[4];
      const pts = src.map(p => [s * p[0] * M, p[1] * M, p[2] * M, p[3] * M]);
      A.part('leg' + i, [pts[0][0], pts[0][1], pts[0][2]], () => {
        faHjRows(A, 'shag', pts.map(p => [p[0], p[1], p[2], p[3], p[3]]), 16, 12, null, { up: [0, 0, 1], round: [0, 0.06], shag: [0.24, 8], colf: coat(limbC) });
        /* the hair drapes down off the bent elbow or knee */
        const el = pts[2], drape = [];
        for (let k = 0; k < 9; k++) drape.push({ at: [el[0] + s * A.rr(0.02, 0.1) * M, el[1] + A.rr(-0.12, 0.08) * M, el[2] + A.rr(-0.06, 0.06) * M], dir: [s * 0.4, -1, A.rr(-0.2, 0.2)], len: A.rr(0.1, 0.16) * M, w: 0.1 * M, col: faHjK(k % 3 ? limbC : furD, 0.85), curl: 0.2 });
        A.locks('hair', drape);
        const hx = s * hand[0] * M, hy = hand[1] * M, hz = hand[2] * M;
        A.ellip('shag', hx, hy, hz, 0.075 * M, 0.05 * M, 0.1 * M, faHjK(limbC, 0.85), { seg: 10 });
        /* three claws round the bough (it runs along x, its centre BY above the grip): arms over its back side, feet its front */
        for (const dx of [-0.038, 0, 0.038]) faHjTube(A, 'horn', t => { const th = -0.25 + 2.95 * t; return [hx + dx * M, BY - RHO * Math.cos(th), hz + wrap * RHO * Math.sin(th) * (th < 0 ? 0.5 : 1)]; },
          t => [0.017 * M * (1 - 0.75 * t), 0.021 * M * (1 - 0.75 * t)], 12, 6, clawC, { up: [1, 0, 0], round: [0, 0.06] });
      });
    });
    A.anchor('grip', [0, G, 0]);
  }
});

/* ---------------------------------------------------------------- the giant insects
   LORE: the crater's and the lowland's air is about 2 atm: more oxygen reaches an insect's tracheae, so insects and
   flyers grow larger there (the giant dragonfly is the flyers' file). These four are the hyperjungle's ground and
   trunk insects, drawn (2026-10-12) in the kit's procedural style: jointed chitin legs that turn about their roots
   (the hexapod tripod walk), plated bodies with banding. They are procedural only: a Meshy version waits on credits. */
function faHiMix(a, b, t) { const c = new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t))); return [c.r, c.g, c.b]; }
/* the drawing helpers at one scale K, and a jointed insect leg: pts root, joints..., foot, rad per point */
function faHiKit(A, K) {
  const Q = p => [p[0] * K, p[1] * K, p[2] * K];
  const kit = {
    Q: Q,
    el: (x, y, z, rx, ry, rz, col, o) => A.ellip('chitin', x * K, y * K, z * K, rx * K, ry * K, rz * K, col, o || { seg: 12 }),
    co: (a, b, r0, r1, col, seg) => A.cone('chitin', Q(a), Q(b), r0 * K, r1 * K, col, seg || 6),
    rows: (rows, nt, ns, col, o) => faHjRows(A, 'chitin', rows.map(r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K, r[4] * K]), nt, ns, col, o),
    leg: (pts, rad, col, claw) => {
      for (let k = 0; k < pts.length - 1; k++) {
        A.cone('chitin', Q(pts[k]), Q(pts[k + 1]), rad[k] * K, rad[k + 1] * K, col, 7);
        if (k > 0) A.ellip('chitin', pts[k][0] * K, pts[k][1] * K, pts[k][2] * K, rad[k] * K * 1.25, rad[k] * K * 1.25, rad[k] * K * 1.25, col, { seg: 8 });
      }
      const n = pts.length - 1, a = pts[n - 1], b = pts[n];   /* the tibia's spines and the foot's claws */
      for (let k = 1; k <= 3; k++) { const f = k / 4, p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
        A.cone('chitin', Q(p), Q([p[0] + Math.sign(p[0]) * 0.012, p[1] + 0.016, p[2] + (k & 1 ? 0.02 : -0.02)]), rad[n - 1] * 0.5 * K, 0.0012 * K, col, 4); }
      const c = claw || 0.035; A.cone('chitin', Q(b), Q([b[0] + Math.sign(b[0]) * c * 0.4, b[1] - 0.004, b[2] + c]), rad[n] * K * 1.2, 0.0015 * K, 0x1a1410, 4);
    }
  };
  return kit;
}
const FA_HI_BASE = { koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], biomes: ['hyperjungle'], abyssal: false, riparian: 'non', domestic: false, herdedBy: [] };
const FA_HI_SRC = { build: 'kits/fauna', file: 'krator-fauna-hyperjungle.js', lines: '-' };

/* ---- the lattice mantis: an ambush hunter that waits among the leaves with its raptorial arms folded */
const FA_HI_MANTIS = [{ base: 0x5a8a34, dark: 0x2e5a22, pale: 0xb8d070 }, { base: 0x8a6a40, dark: 0x4a3420, pale: 0xc8a870 }, { base: 0xd8b0c0, dark: 0x9a5a78, pale: 0xf4e8e8 }];
ANIMAL({
  key: 'lattice-mantis', name: 'Lattice mantis', group: 'hyperjungle',
  tags: Object.assign({}, FA_HI_BASE, { diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['ground', 'canopy', 'trunks'], locomotion: ['walks', 'climbs', 'leaps'] }),
  size: { length: 1.6, height: 1.0 },
  source: [Object.assign({}, FA_HI_SRC, { note: 'first drawn here (2026-10-12): a giant praying mantis, grown large by the lowland air (about 2 atm); it waits motionless on a leaf and strikes with spined forearms' })],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { chitin: { amount: 3, note: 'the folded forearms\' plates: light and hard; a hunter\'s bracers' } },
  life: { maturity: 0.5, lifespan: 1.5, litter: 150, gestation: 30, note: 'litter: an egg case of a hundred and fifty; gestation: egg to nymph, a month; the nymphs eat each other' },
  variants: 3, variantNames: ['leaf green', 'bark brown', 'orchid pink and white'],
  w: 0.71, d: 1.62, h: 1.0,
  data: { mass: 6, legs: 4, sizeRange: [0.7, 1.3], speed: { walk: 0.4, run: 3 }, gait: { type: 'quadruped', freq: 1.6, stride: 0.2 }, grazePitch: 0.3,
    herd: 'alone: it holds a leaf and eats what comes within reach', fleeDistance: 3, aggression: 0.8,
    idle: { headYaw: 0.7, headPitch: 0.1, tailYaw: 0.04 },
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'HUNT', 'HUNT', 'IDLE', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_HI_MANTIS[A.variant] || FA_HI_MANTIS[0], k = faHiKit(A, A.S), mix = faHiMix;
    const shade = (t, a) => mix(C.base, C.pale, Math.cos(a) < -0.3 ? 0.7 : 0.15 * faNoise(t * 20, a, 1));
    /* the abdomen, long and tapering, with the folded wings laid along its back */
    k.rows([[0, .46, -.05, .07, .06], [0, .46, -.3, .09, .08], [0, .47, -.55, .075, .065], [0, .48, -.78, .03, .03]], 14, 12, null, { round: [0.1, 0.12], colf: (t, a) => shade(t, a) });
    for (const s of [-1, 1]) k.el(s * .045, .53, -.38, .05, .014, .44, mix(C.dark, C.base, 0.4), { seg: 12, rz: s * 0.04 });
    /* the prothorax: the slender neck, rising forward; the raptorial arms folded at its front */
    k.rows([[0, .46, .0, .065, .06], [0, .52, .2, .035, .035], [0, .63, .42, .03, .03], [0, .69, .52, .028, .028]], 12, 10, null, { colf: (t, a) => shade(t, a) });
    for (const s of [-1, 1]) {
      k.leg([[s * .04, .62, .44], [s * .075, .7, .72], [s * .06, .56, .66], [s * .05, .6, .53]], [.026, .022, .016, .008], C.base);
      for (let i = 0; i < 5; i++) { const z = .5 + i * .045, y = .7 - i * 0.006; k.co([s * .075, y, z], [s * .075, y - .06, z - .01], .006, .001, C.pale, 4); }
    }
    A.part('head', k.Q([0, .69, .5]), () => {
      k.el(0, .73, .57, .075, .045, .045, C.base, { seg: 12 });               /* a triangular head */
      k.el(0, .71, .6, .04, .04, .03, C.pale, { seg: 10 });
      for (const s of [-1, 1]) { k.el(s * .068, .745, .575, .032, .036, .03, 0x1a2812, { seg: 10 }); k.el(s * .075, .752, .585, .012, .014, .012, 0xe8e0a0, { seg: 6 });
        k.co([s * .02, .76, .59], [s * .12, .98, .8], .004, .0015, C.dark, 4); }   /* the antennae */
      k.co([-.012, .7, .62], [-.03, .66, .64], .008, .002, C.dark, 4); k.co([.012, .7, .62], [.03, .66, .64], .008, .002, C.dark, 4);   /* the mandibles */
    });
    /* the four walking legs: out and up to the knee, down to the foot */
    for (let i = 0; i < 4; i++) {
      const s = (i & 1) ? -1 : 1, z = (i >> 1) ? -.12 : .12, X = q => [s * q[0], q[1], q[2] + z];
      A.part('leg' + i, k.Q(X([.05, .46, 0])), () => k.leg([X([.05, .46, 0]), X([.2, .56, .02]), X([.32, .2, .08 * (z > 0 ? 1 : -1)]), X([.34, .0, .12 * (z > 0 ? 1 : -1)])], [.03, .022, .016, .01], C.base));
    }
    A.anchor('lead', k.Q([0, .6, .45])); A.anchor('headRoot', k.Q([0, .69, .5])); A.anchor('tailRoot', k.Q([0, .46, -.05]));
  }
});

/* ---- the stilt walkingstick: a twig the length of a man, on six long legs */
const FA_HI_STICK = [{ base: 0x6a7a3a, dark: 0x3a4a22, pale: 0xa8b060 }, { base: 0x6a5238, dark: 0x3a2c1e, pale: 0x9a8a68 }, { base: 0x7a7e6e, dark: 0x4a4e44, pale: 0xb0b49a }];
ANIMAL({
  key: 'stilt-walkingstick', name: 'Stilt walkingstick', group: 'hyperjungle',
  tags: Object.assign({}, FA_HI_BASE, { diet: 'herbivore', feeding: 'browser', activity: 'nocturnal', temperament: 'skittish',
    habitat: ['canopy', 'trunks', 'ground'], locomotion: ['walks', 'climbs'] }),
  size: { length: 2.0, height: 0.8 },
  source: [Object.assign({}, FA_HI_SRC, { note: 'first drawn here (2026-10-12): a giant stick insect (about 2 m with its legs stretched), grown large by the lowland air (about 2 atm); it freezes and sways like a twig in the wind' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 5, note: 'pale and mild: roasted in the shell' }, eggs: { amount: 60, note: 'seed-like eggs dropped one at a time to the forest floor, which the ants carry off' }, chitin: { amount: 1, note: 'the thin, hollow limb plates' } },
  life: { maturity: 0.7, lifespan: 2, litter: 1, gestation: 90, note: 'litter: one egg dropped at a time (about sixty a year); gestation: egg to nymph, three months, buried by ants' },
  variants: 3, variantNames: ['leaf green', 'bark brown', 'lichen grey'],
  w: 1.0, d: 2.1, h: 0.8,
  data: { mass: 3, legs: 6, sizeRange: [0.7, 1.3], speed: { walk: 0.25, run: 1.2 }, gait: { type: 'hexapod', freq: 1.0, stride: 0.3 }, grazePitch: 0.2,
    herd: 'alone; found by the bitten leaves', fleeDistance: 2, aggression: 0,
    idle: { headYaw: 0.1, headPitch: 0.05, tailYaw: 0.1 },
    schedule: ['BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE'],
    scheduleNote: 'BROWSE: it eats leaves at night' },
  build: function (A) {
    const C = FA_HI_STICK[A.variant] || FA_HI_STICK[0], k = faHiKit(A, A.S), mix = faHiMix;
    const skin = (t, a) => mix(C.base, C.dark, 0.3 * faNoise(t * 30, a * 2, 3) + (Math.sin(t * 150) > 0.9 ? 0.25 : 0));
    /* one long jointed twig: abdomen to head, the thorax a little thicker, the tail a pair of short cerci */
    k.rows([[0, .4, -.95, .012, .012], [0, .4, -.6, .026, .026], [0, .4, -.2, .03, .03], [0, .4, .1, .034, .036], [0, .42, .3, .026, .026]], 20, 8, null, { round: [0.04, 0.04], colf: (t, a) => skin(t, a) });
    for (const s of [-1, 1]) k.co([s * .004, .4, -.95], [s * .02, .4, -1.03], .006, .001, C.dark, 4);
    A.part('head', k.Q([0, .42, .3]), () => {
      k.el(0, .43, .36, .03, .028, .04, C.base, { seg: 10 });
      for (const s of [-1, 1]) { k.el(s * .026, .445, .37, .011, .011, .011, 0x1a1a10, { seg: 6 });
        k.co([s * .01, .45, .39], [s * .06, .62, .95], .0035, .0012, C.dark, 4); }   /* the long antennae */
    });
    /* six long legs, each a thin femur and tibia, the front pair stretched forward along the antennae */
    const spec = [{ z: .22, kn: [.32, .62, .5], ft: [.46, 0, .62] }, { z: .0, kn: [.36, .66, .12], ft: [.52, 0, .08] }, { z: -.2, kn: [.34, .6, -.4], ft: [.46, 0, -.75] }];
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, g = spec[i >> 1], X = q => [s * q[0], q[1], q[2]];
      A.part('leg' + i, k.Q(X([.03, .4, g.z])), () => k.leg([X([.03, .4, g.z]), X(g.kn), X(g.ft)], [.012, .009, .005], C.base, 0.03));
    }
    A.anchor('lead', k.Q([0, .43, .36])); A.anchor('headRoot', k.Q([0, .42, .3])); A.anchor('tailRoot', k.Q([0, .4, -.9]));
  }
});

/* ---- the horned scarab: a rhinoceros beetle the size of a calf, the male with the horn that wins the bough */
const FA_HI_SCARAB = [{ base: 0x5a2c1a, dark: 0x2a140c, pale: 0x8a4a2a }, { base: 0x1e1c22, dark: 0x0c0c10, pale: 0x4a4650 }, { base: 0x3a6a48, dark: 0x16301e, pale: 0x8ab070 }, { base: 0x8a6a3a, dark: 0x4a3418, pale: 0xc8a868 }];
ANIMAL({
  key: 'horned-scarab', name: 'Horned scarab', group: 'hyperjungle',
  tags: Object.assign({}, FA_HI_BASE, { diet: 'herbivore', feeding: 'frugivore', activity: 'nocturnal', temperament: 'defensive',
    habitat: ['ground', 'trunks', 'canopy'], locomotion: ['walks', 'climbs'] }),
  size: { length: 1.2, height: 0.68 },
  source: [Object.assign({}, FA_HI_SRC, { note: 'first drawn here (2026-10-12): a giant rhinoceros beetle, grown large by the lowland air (about 2 atm); it drinks the sap of the split boughs and fights for them with its horn' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 7, note: 'the grubs are the prize: fat, sweet, roasted on a stick; the adult is mostly shell' }, chitin: { amount: 4, note: 'the domed wing cases: shields and bowls, black or bronze' } },
  life: { maturity: 2, lifespan: 3, litter: 40, gestation: 60, note: 'litter: eggs laid in rotting wood; gestation: egg to grub; the grub lives two years and fattens in the log' },
  variants: 4, variantNames: ['chestnut', 'black', 'green bronze', 'tan'],
  w: 0.92, d: 1.19, h: 0.68,
  data: { mass: 8, legs: 6, sizeRange: [0.7, 1.4], speed: { walk: 0.5, run: 2 }, gait: { type: 'hexapod', freq: 1.5, stride: 0.2 }, grazePitch: 0.5,
    herd: 'a few at a split bough, the big males fighting on it', fleeDistance: 2, aggression: 0.4,
    idle: { headYaw: 0.2, headPitch: 0.1, tailYaw: 0 },
    schedule: ['BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE', 'BROWSE'],
    scheduleNote: 'BROWSE: sap and fallen fruit' },
  build: function (A) {
    const C = FA_HI_SCARAB[A.variant] || FA_HI_SCARAB[0], k = faHiKit(A, A.S), mix = faHiMix;
    const sheen = (x, y, z) => mix(C.base, C.pale, 0.35 * Math.max(0, y - 0.3) * 3 + 0.12 * faNoise(x * 12, y * 12, z * 12));
    k.el(0, .3, -.1, .24, .18, .36, null, { seg: 18, colf: (x, y, z) => sheen(x, y, z) });                  /* the domed wing cases */
    k.el(0, .19, -.12, .22, .06, .34, C.dark, { seg: 14 });                                               /* the belly under them */
    for (const s of [-1, 1]) k.co([s * .004, .46, -.46], [s * .004, .46, .24], .006, .006, C.dark, 4);          /* the suture */
    k.el(0, .28, .24, .19, .14, .15, null, { seg: 14, colf: (x, y, z) => sheen(x, y + .05, z) });             /* the thorax shield */
    k.rows([[0, .34, .3, .04, .035], [0, .42, .44, .03, .03], [0, .56, .56, .024, .024], [0, .66, .54, .008, .008]], 10, 8, C.dark, { round: [0.1, 0.1] });   /* the thoracic horn, curving up */
    A.part('head', k.Q([0, .26, .36]), () => {
      k.el(0, .25, .42, .1, .065, .09, C.dark, { seg: 12 });
      k.rows([[0, .3, .45, .036, .034], [0, .36, .58, .03, .03], [0, .5, .68, .022, .022], [0, .6, .64, .007, .007]], 12, 8, C.dark, { round: [0.1, 0.1] });   /* the head horn, forked at its tip */
      k.co([0, .56, .66], [0, .66, .72], .008, .002, C.dark, 4);
      for (const s of [-1, 1]) { k.el(s * .085, .28, .46, .02, .02, .02, 0x120c08, { seg: 6 }); k.co([s * .04, .22, .5], [s * .07, .2, .6], .012, .003, C.dark, 4);
        k.co([s * .03, .26, .5], [s * .05, .34, .62], .004, .0015, C.dark, 4); }
    });
    const spec = [{ z: .22, kn: [.3, .22, .36], ft: [.38, .0, .42] }, { z: .0, kn: [.32, .2, .04], ft: [.44, .0, .02] }, { z: -.2, kn: [.3, .2, -.34], ft: [.36, .0, -.44] }];
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, g = spec[i >> 1], X = q => [s * q[0], q[1], q[2]];
      A.part('leg' + i, k.Q(X([.14, .22, g.z])), () => k.leg([X([.14, .22, g.z]), X(g.kn), X(g.ft)], [.04, .03, .016], C.dark, .045));
    }
    A.anchor('lead', k.Q([0, .3, .5])); A.anchor('headRoot', k.Q([0, .26, .36])); A.anchor('tailRoot', k.Q([0, .3, -.4]));
  }
});

/* ---- the harvester ant: a worker the size of a dog, the soldier with a head like a shield */
const FA_HI_ANT = [{ base: 0x2a1c16, dark: 0x120c08, pale: 0x5a3a2a }, { base: 0x8a3a1c, dark: 0x3a180c, pale: 0xc86a38 }, { base: 0x1e2224, dark: 0x0a0c0e, pale: 0x4a5258 }];
ANIMAL({
  key: 'harvester-ant', name: 'Harvester ant', group: 'hyperjungle',
  tags: Object.assign({}, FA_HI_BASE, { diet: 'omnivore', feeding: 'mixed', activity: 'cathemeral', temperament: 'aggressive',
    habitat: ['ground', 'trunks', 'burrow'], locomotion: ['walks', 'runs', 'climbs'] }),
  size: { length: 1.5, height: 0.81 },
  source: [Object.assign({}, FA_HI_SRC, { note: 'first drawn here (2026-10-12): a giant ant, grown large by the lowland air (about 2 atm); the colony cuts and hauls leaves and seed-pods to the mound, and the soldiers guard the trails' })],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { chitin: { amount: 2, note: 'a soldier\'s jaws and head plate: a scraper and a shield rim' } },
  life: { maturity: 0.3, lifespan: 2, litter: 400, gestation: 30, note: 'litter: the queen\'s clutch (the colony has one queen); gestation: egg to worker, a month' },
  variants: 3, variantNames: ['worker, black', 'soldier, rust red', 'worker, slate'],
  w: 0.79, d: 1.5, h: 0.81,
  data: { mass: 4, legs: 6, sizeRange: [0.7, 1.3], speed: { walk: 0.9, run: 5 }, gait: { type: 'hexapod', freq: 2.2, stride: 0.3 }, grazePitch: 0.4,
    herd: 'a column of fifty on a trail, hauling leaf, with a soldier to every ten', fleeDistance: 3, aggression: 0.7,
    idle: { headYaw: 0.3, headPitch: 0.1, tailYaw: 0.05 },
    schedule: ['WORK', 'WORK', 'WORK', 'WORK', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK'],
    scheduleNote: 'WORK: the colony never sleeps; the trail is always busy' },
  build: function (A) {
    const v = A.variant, soldier = v === 1, C = FA_HI_ANT[v] || FA_HI_ANT[0], k = faHiKit(A, A.S), mix = faHiMix, hs = soldier ? 1.5 : 1;
    const gloss = (x, y, z) => mix(C.base, C.pale, 0.3 * Math.max(0, y - 0.45) * 4 + 0.1 * faNoise(x * 14, y * 14, z * 14));
    k.el(0, .5, -.38, .16, .16, .26, null, { seg: 16, colf: (x, y, z) => gloss(x, y, z) });                  /* the gaster */
    k.co([0, .5, -.16], [0, .5, -.04], .035, .045, C.dark, 8); k.el(0, .54, -.1, .035, .06, .035, C.dark, { seg: 8 });   /* the petiole */
    k.rows([[0, .46, -.04, .075, .07], [0, .5, .1, .085, .09], [0, .53, .24, .06, .06]], 10, 10, null, { round: [0.15, 0.15], colf: (t, a) => gloss(0, .5 + .04 * Math.cos(a), t) });   /* the thorax, humped over the legs' roots */
    A.part('head', k.Q([0, .52, .26]), () => {
      k.el(0, .52, .38, .1 * hs, .08 * hs, .12 * hs, null, { seg: 14, colf: (x, y, z) => gloss(x, y, z) });
      for (const s of [-1, 1]) {
        k.el(s * .09 * hs, .56, .4, .024, .026, .03, 0x0a0806, { seg: 8 });
        k.co([s * .03, .5, .46 + .03 * hs], [s * .06, .46, .6 + .1 * (hs - 1)], .016, .004, C.pale, 5);      /* the mandibles */
        k.co([s * .06, .46, .6 + .1 * (hs - 1)], [s * .02, .46, .66 + .1 * (hs - 1)], .005, .002, C.pale, 4);
        const e = [s * .05, .6, .44]; k.co(e, [s * .12, .74, .6], .005, .003, C.dark, 4); k.co([s * .12, .74, .6], [s * .1, .78, .86], .003, .0012, C.dark, 4);   /* the elbowed antenna */
      }
    });
    const spec = [{ z: .2, kn: [.2, .62, .34], ft: [.32, .0, .5] }, { z: .06, kn: [.24, .66, .08], ft: [.38, .0, .1] }, { z: -.04, kn: [.2, .62, -.2], ft: [.3, .0, -.5] }];
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, g = spec[i >> 1], X = q => [s * q[0], q[1], q[2]];
      A.part('leg' + i, k.Q(X([.05, .5, g.z])), () => k.leg([X([.05, .5, g.z]), X(g.kn), X(g.ft)], [.026, .018, .008], C.base, .03));
    }
    A.anchor('lead', k.Q([0, .52, .45])); A.anchor('headRoot', k.Q([0, .52, .26])); A.anchor('tailRoot', k.Q([0, .5, -.5]));
  }
});
