/* ======================================================================
   Krator Fauna: the eastern abyss and its caravan beasts (kits/fauna/krator-fauna-abyss.js)
   The abyss floor's wild animals (the salt-lake flamingo, the frilled lizard, the marsh emu: biomes/eastabyss and Locus) and
   the beasts the abyss's and the high desert's peoples keep: the pack lizard (the Locus and Mungo caravans), the riding lizard
   (Locus, Lower Verge, the Mungo nomads) and the dromedary (Upper Verge's caravans and porters, Yuni's caravanserai). Ported
   2026-10-06 from each build's own builder (listed in `source`, the richest copy drawn); the tack (saddles, packs, bales,
   blankets) stays with the cultures, which fit it to the anchors and the lizards' body profiles.
   ====================================================================== */

/* ---------------------------------------------------------------- helpers (private to this file: the faAb prefix) */
/* a Catmull-Rom curve through rows of numbers (any width), t 0..1 by row index */
function faAbCR(P) {
  const n = P.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i, out = [];
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
    for (let k = 0; k < p1.length; k++) {
      const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
      out.push(0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u));
    }
    return out;
  };
}
/* a tube along part of a curve of rows [x, y, z, hw, hh]: global t0..t1; o.colf(T, angle) gets the global T; o.inset
   [below, above]: the radius shrinks a little outside that span (so an overlapped seam between parts never z-fights) */
function faAbSpan(A, fam, f, t0, t1, nt, ns, col, o) {
  o = o || {};
  const at = t => f(t0 + (t1 - t0) * t), ins = o.inset, k = T => ins && (T < ins[0] || T > ins[1]) ? 0.965 : 1;
  A.tube(fam, t => { const q = at(t); return [q[0], q[1], q[2]]; },
    t => { const q = at(t), T = t0 + (t1 - t0) * t; return [Math.max(0.002, q[3] * k(T)), Math.max(0.002, (q[4] == null ? q[3] : q[4]) * k(T))]; }, nt, ns, col,
    { caps: o.caps, colf: o.colf ? (t, a) => o.colf(t0 + (t1 - t0) * t, a) : null });
}
/* a limb (or a bending neck): straight segments through [x, y, z, r] points, each its own tube so a section never twists
   where the curve turns steep, with a ball at each inner joint; col(i, joint) a segment's or a joint's colour;
   o.knob(i) the joint ball's size against the segment's radius */
function faAbLimb(A, fam, pts, ns, col, o) {
  o = o || {};
  const cf = typeof col === 'function' ? col : () => col, kn = typeof o.knob === 'function' ? o.knob : () => (o.knob || 1.02);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    A.tube(fam, t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], t => { const r = a[3] + (b[3] - a[3]) * t; return [r, r]; }, 1, ns, cf(i, false),
      { caps: (i === 0 && !!o.cap0) || (i === pts.length - 2 && o.cap1 !== false) });
    if (i > 0) { const r = a[3] * kn(i); A.ellip(fam, a[0], a[1], a[2], r, r, r, cf(i, true), { seg: ns }); }
  }
}
/* a sheet seen from both sides (a frill, a web): the same surface twice, wound both ways (hair is already two-sided) */
function faAbSheet2(A, fam, f, nu, nv, col, colf) {
  A.sheet(fam, f, nu, nv, col, colf ? { colf: colf } : {});
  if (fam !== 'hair') A.sheet(fam, (u, v) => f(1 - u, v), nu, nv, col, colf ? { colf: (u, v) => colf(1 - u, v) } : {});
}
function faAbRGB(c) { if (Array.isArray(c)) return c; const k = new THREE.Color(c); return [k.r, k.g, k.b]; }
function faAbShade(c, k) { const p = faAbRGB(c); return [Math.min(1, p[0] * k), Math.min(1, p[1] * k), Math.min(1, p[2] * k)]; }
function faAbMix(a, b, t, k) {
  const p = faAbRGB(a), q = faAbRGB(b), m = k == null ? 1 : k;
  return [Math.min(1, (p[0] + (q[0] - p[0]) * t) * m), Math.min(1, (p[1] + (q[1] - p[1]) * t) * m), Math.min(1, (p[2] + (q[2] - p[2]) * t) * m)];
}
function faAbLerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
/* a body table [z, y, hw, hh] (tail tip first) as curve rows [x, y, z, hw, hh] at scale S, lifted by dy */
function faAbRows(T, S, dy) { return T.map(r => [0, (r[1] + (dy || 0)) * S, r[0] * S, r[2] * S, r[3] * S]); }

/* ================================================================ the salt-lake flamingo
   biomes/eastabyss (the richer rig: an S-neck in two pieces, the bent bill with its black tip, the ankle band, black
   flight feathers), first drawn in Locus. Origin under the body; the neck's root at (0, .85, .2). The wings are drawn
   half-folded (the hand swept back along the flank) so the runtime's fold, a turn about z, lays them on the flank. */
const FA_AB_FLA = [
  { body: 0xf2909e, deep: 0xe4687e, black: 0x1c1818, leg: 0xdc7c8a, band: 0xe4687e, bill: 0xe6d6cc, tip: 0x1a1414, eye: 0xf0d060, K: 1 },
  { body: 0xccc4bc, deep: 0xaaa098, black: 0x3a3430, leg: 0x6e6862, band: 0x5a5450, bill: 0x9a9490, tip: 0x1a1414, eye: 0xb8a878, K: 0.82 }];
ANIMAL({
  key: 'flamingo', name: 'Salt-lake flamingo', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['humid', 'subhumid'], climate: ['hypertropic', 'tropic'], riparian: 'both', abyssal: true,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'filter feeder', activity: 'diurnal', temperament: 'skittish',
    habitat: ['shallows', 'water', 'marsh', 'sky'], locomotion: ['walks', 'wades', 'flies', 'swims'] },
  size: { length: 1.25, height: 1.45, span: 1.5 },
  source: [{ build: 'biomes/eastabyss', file: 'src/75-biome-eastabyss-fauna.js', lines: '21, 71-87, 102, 169-180', note: 'ported from here (the richer): flocks of 12 to 60 wading the salt lake\'s margin, the channels and the delta, heads down to feed, and skeins in V formation over the lake; Verge (Lower Verge) and openworld/little-demo take it from this kit' },
    { build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '16-17, 35-48', note: 'the first flamingo: static standing, feeding and flying meshes (a taller bird, 1.9 m), flocks at the delta mouths and along the lake shore, two skeins between the lake and the delta' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 1.6, note: 'a bird dressed; dark and salty from the lake' },
    eggs: { amount: 1, note: 'one egg a year on a mud mound in the colony; taken from the colonies\' edges' },
    feathers: { amount: 0.05, note: 'moulted: the crimson coverts and black primaries, prized for fans and headdresses' } },
  life: { maturity: 4, lifespan: 40, litter: 1, gestation: 29, note: 'gestation: the egg\'s incubation in days; the young are grey for two or three years' },
  variants: 2, variantNames: ['adult', 'juvenile, grey'],
  w: 0.72, d: 0.92, h: 1.46,
  variantDims: [{ w: 0.72, d: 0.92, h: 1.46 }, { w: 0.6, d: 0.76, h: 1.2 }],
  data: { mass: [3.2, 2.4], legs: 2, wings: 1, speed: { walk: 0.6, run: 4, fly: 15 }, gait: { type: 'flyer', freq: 1.1, stride: 0.5 },
    flap: { freq: 0.9, amp: 0.55, glide: 0.1, fold: 1.2 }, grazePitch: 2.7,
    herd: 'flocks of 12 to 60 in the shallows; skeins of 10 to 15 in V formation between the lakes', fleeDistance: 30, aggression: 0.02,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'FLY', 'GRAZE', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_AB_FLA[A.variant] || FA_AB_FLA[0], K = C.K, P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    /* ---- the body: an egg, the tail end raised a little; the folded scapulars over the back, black at their tips */
    const bf = faAbCR([[-.34, .87, .02, .02], [-.27, .85, .085, .07], [-.13, .815, .145, .13], [.04, .80, .16, .15], [.17, .80, .14, .135], [.27, .83, .07, .075]].map(r => [0, r[1] * K, r[0] * K, r[2] * K, r[3] * K]));
    faAbSpan(A, 'coat', bf, 0, 1, 14, 14, null, { caps: true, colf: (t, a) => faAbMix(C.body, C.deep, Math.max(0, Math.cos(a)) * 0.35) });
    A.ellip('coat', 0, 0.875 * K, -0.15 * K, 0.125 * K, 0.055 * K, 0.19 * K, null, { seg: 12, colf: (x, y, z) => z < -0.09 * K ? C.black : C.deep });
    /* ---- the head with the neck: the S-neck turns about its root (graze: the head goes down to the water, upside down) */
    A.part('head', P(0, .85, .2), () => {
      faAbLimb(A, 'coat', [[0, .84, .2, .056], [0, .95, .29, .048], [0, 1.06, .36, .042], [0, 1.17, .385, .037], [0, 1.27, .35, .034], [0, 1.35, .29, .032], [0, 1.385, .262, .031]].map(PR), 8, C.body, { cap1: false });
      A.ellip('coat', 0, 1.4 * K, 0.262 * K, 0.04 * K, 0.042 * K, 0.062 * K, C.body, { seg: 10 });
      /* the bill: pale, thick, bending down at its middle, the black tip */
      const bl = faAbCR([[0, 1.395, .305, .021, .019], [0, 1.392, .345, .018, .016], [0, 1.38, .375, .014, .013], [0, 1.355, .395, .01, .01], [0, 1.33, .405, .005, .005]].map(r => [r[0], r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbSpan(A, 'horn', bl, 0, 1, 8, 8, null, { caps: true, colf: t => t > 0.5 ? C.tip : C.bill });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.033 * K, 1.41 * K, 0.272 * K, 0.009 * K, 0.009 * K, 0.009 * K, C.eye, { seg: 6 });
        A.ellip('eye', s * 0.039 * K, 1.41 * K, 0.275 * K, 0.004 * K, 0.004 * K, 0.004 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the wings (half-folded): from the shoulder out along +x (left) and back; coverts deep pink, flight feathers black */
    const LE = [[.1, .9, .17], [.34, .93, .08], [.24, .9, -.5]], TE = [[.1, .9, -.14], [.3, .92, -.2], [.24, .9, -.5]];
    const edge = (E, u) => u < 0.45 ? faAbLerp3(E[0], E[1], u / 0.45) : faAbLerp3(E[1], E[2], (u - 0.45) / 0.55);
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * .1, .9, .1), () => {
      A.sheet('hair', (u, v) => { const a = edge(LE, u), b = edge(TE, u);
        return [s * (a[0] + (b[0] - a[0]) * v) * K, (a[1] + (b[1] - a[1]) * v + 0.018 * Math.sin(Math.PI * v) * (1 - u)) * K, (a[2] + (b[2] - a[2]) * v) * K]; },
      9, 4, null, { colf: (u, v) => v < 0.14 && u < 0.5 ? C.body : (u < 0.5 && v < 0.55 ? C.deep : C.black) });
    });
    /* ---- the legs: long and thin, the ankle (the 'knee' that bends back) a darker knob; webbed feet, three toes */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .06, .69, -.02), () => {
      const x = s * 0.06;
      faAbLimb(A, 'skin', [[x, .72, -.02, .022], [x, .36, -.045, .014], [x, .03, -.01, .011]].map(PR), 6, (j, jt) => jt ? C.band : C.leg, { knob: 1.5 });
      const heel = P(x, .012, -.008), toes = [-1, 0, 1].map(k => P(x + k * 0.034, 0.006, 0.075 - Math.abs(k) * 0.012));
      for (const tp of toes) A.cone('skin', heel, tp, 0.008 * K, 0.004 * K, C.leg, 5);
      faAbSheet2(A, 'skin', (u, v) => { const e = u < 0.5 ? faAbLerp3(toes[0], toes[1], u * 2) : faAbLerp3(toes[1], toes[2], u * 2 - 1); const p = faAbLerp3(heel, e, v * 0.92); return [p[0], 0.008 * K, p[2]]; }, 4, 2, C.leg);
    });
    A.anchor('perch', P(0, 0, 0)); A.anchor('back', P(0, .95, -.05));
  }
});

/* ================================================================ the frilled lizard
   biomes/eastabyss (shaded back and belly, a banded tail, the frill's two colours), first drawn in Locus; 0.95 m nose to
   tail. Variant 1 (or pose 'display') has the frill open, the way it faces a threat; otherwise it lies folded on the
   neck like a pleated cape. The eastern abyss's frill opens with the viewer's distance: a host swaps the variant. */
const FA_AB_FL = [[-.68, .035, .006, .006], [-.5, .044, .012, .011], [-.32, .054, .02, .018], [-.17, .067, .031, .027], [-.07, .077, .05, .04], [.03, .082, .062, .048],
  [.12, .085, .056, .045], [.18, .092, .04, .035], [.225, .1, .041, .037], [.27, .1, .036, .031], [.305, .092, .018, .016]];
const FA_AB_FLC = { liz: 0x7c6444, dark: 0x56442e, belly: 0xb8a482, frill: 0xd2502c, frillC: 0xe8a848 };
ANIMAL({
  key: 'frilled-lizard', name: 'Frilled lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'Aw', 'BSh'], aridity: ['semiarid', 'subhumid'], climate: ['hypertropic', 'tropic'], riparian: 'both', abyssal: true,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'insectivore', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'trunks', 'rock'], locomotion: ['walks', 'runs', 'climbs'] },
  size: { length: 0.95, height: 0.12 },
  source: [{ build: 'biomes/eastabyss', file: 'src/75-biome-eastabyss-fauna.js', lines: '22, 88-94, 143-151, 183-190', note: 'ported from here (the richer): singles on dry ground near the rivers and the salt flats\' damp edges; they bask, dash on the hind legs, and inside ~25 m of the viewer open the frill, rear and turn to face it' },
    { build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '18, 55-58', note: 'singles on dry open ground at the town\'s edge; box body, the frill its own mesh, raised when the camera comes close' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 0.25, note: 'roasted whole; little on it' } },
  life: { maturity: 1.5, lifespan: 12, litter: 12, gestation: 80, note: 'a clutch of 8 to 20 eggs buried in warm soil; gestation: incubation days' },
  variants: 2, variantNames: ['basking, frill folded', 'display, frill open'],
  w: 0.3, d: 1.0, h: 0.16,
  variantDims: [{ w: 0.3, d: 1.0, h: 0.16 }, { w: 0.42, d: 1.0, h: 0.32 }],
  data: { mass: 0.6, legs: 4, speed: { walk: 0.5, run: 4 }, gait: { type: 'sprawl', freq: 2.2, stride: 0.12 }, grazePitch: 0.15,
    herd: 'solitary; a male holds a few trees and the ground between', fleeDistance: 6, aggression: 0.2, display: 'opens the frill, gapes and hisses inside ~25 m, then dashes off upright on its hind legs',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const F = FA_AB_FLC, open = A.variant === 1 || A.pose === 'display', R = faAbRows(FA_AB_FL, 1, 0), f = faAbCR(R), n = R.length - 1;
    const skin = (T, a) => { const top = Math.cos(a), q = f(T);
      if (T < 4.2 / n) return Math.floor(-q[2] * 14) % 2 ? F.dark : (top < -0.5 ? F.belly : F.liz);
      if (top < -0.45) return F.belly;
      const sp = faNoise(q[2] * 40, a * 3, 2.3);
      return top > 0.5 ? (sp > 0.68 ? F.liz : F.dark) : (sp > 0.72 ? F.dark : F.liz); };
    /* the trunk; the tail sways about the hips; the head (with the frill) turns about the neck */
    faAbSpan(A, 'skin', f, 3.6 / n, 8.4 / n, 12, 12, null, { colf: skin, inset: [-1, 2] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'skin', f, 0, 4.4 / n, 16, 10, null, { caps: true, colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.5 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'skin', f, 7.5 / n, 1, 8, 12, null, { caps: true, colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.03, 0.112, 0.25, 0.008, 0.008, 0.008, 0x1a1208, { seg: 6 });
        A.ellip('eye', s * 0.035, 0.113, 0.252, 0.0035, 0.0035, 0.0035, 0xd8a040, { seg: 6 });
        A.cone('mouth', [s * 0.035, 0.088, 0.215], [s * 0.019, 0.085, 0.3], 0.0025, 0.0025, 0x2a1a12, 4);
      }
      /* the frill: a ruff on cartilage spines round the neck, the inner face saffron, the rim red */
      const NY = 0.1, NZ = 0.17, A0 = -0.4, A1 = Math.PI + 0.8;
      const fr = open ? (u, v) => { const a = A0 + A1 * u, r = (0.035 + 0.165 * v) * (1 + 0.06 * Math.sin(u * Math.PI * 13) * v * v), y = Math.sin(a) * r;
          return [Math.cos(a) * r, NY + y * Math.cos(0.15), NZ - y * Math.sin(0.15) - 0.045 * v * v]; }
        : (u, v) => { const a = A0 + A1 * u, pl = 1 + 0.12 * Math.sin(u * Math.PI * 13) * v;
          return [Math.cos(a) * (0.042 + 0.03 * v) * pl, NY - 0.015 * v + Math.sin(a) * (0.038 + 0.022 * v) * pl, NZ - 0.1 * v]; };
      faAbSheet2(A, 'skin', fr, 26, 4, null, (u, v) => { const rib = Math.abs(((u * 13) % 1) - 0.5) > 0.4;
        if (!open) return faAbMix(F.liz, F.frill, 0.3 + 0.2 * v, rib ? 0.8 : 1);
        return v > 0.52 ? (rib ? faAbShade(F.frill, 0.78) : F.frill) : (rib ? faAbShade(F.frillC, 0.8) : F.frillC); });
    });
    /* the legs: splayed out from the shoulder and the hip, elbow and knee out, five thin toes */
    const LEGS = [[.1, 1, 1, 0], [.1, 1, -1, 1], [-.1, 0, 1, 2], [-.1, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * (front ? 0.04 : 0.045), 0.072, z];
      A.part('leg' + i, b, () => {
        const pts = front ? [[b[0], b[1], z, .014], [s * .1, .068, z + .015, .011], [s * .115, .012, z + .04, .009]] : [[b[0], b[1], z, .016], [s * .11, .066, z + .01, .012], [s * .125, .012, z - .035, .009]];
        faAbLimb(A, 'skin', pts, 6, F.dark, { knob: 1.1 });
        const ft = pts[2];
        for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.35 + s * (front ? 0.3 : 0.6);
          A.cone('skin', [ft[0], 0.008, ft[2]], [ft[0] + Math.sin(a) * 0.035, 0.006, ft[2] + Math.cos(a) * 0.035], 0.005, 0.0025, F.dark, 4); }
      });
    }
  }
});

/* ================================================================ the marsh emu
   Locus (its only drawer): a shaggy grey-brown body, the long neck dark below and blue-grey bare skin above, stout legs.
   The plumage is drooping locks over a smaller body (the original's 0.76 m-wide ellipsoid, slimmed: the locks make up
   the bulk); the chick is striped. */
const FA_AB_EMU = [
  { body: 0x5e5446, dark: 0x4a4238, skin: 0x6a7a8a, crown: 0x3a3430, leg: 0x6a6050, bill: 0x2a2622, eye: 0x8a4a1a, K: 1, hair: 1 },
  { body: 0xcdb98e, dark: 0x3e3226, skin: 0xb8a684, crown: 0x3e3226, leg: 0x8a7a68, bill: 0x4a4038, eye: 0x3a2a1a, K: 0.42, hair: 0.45, stripes: true }];
ANIMAL({
  key: 'marsh-emu', name: 'Marsh emu', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'Aw', 'BSh'], aridity: ['subhumid', 'semiarid'], climate: ['tropic'], riparian: 'non', abyssal: true,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'marsh'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 1.3, height: 1.95 },
  source: [{ build: 'settlements/locus', file: 'src/83-locus-fauna.js', lines: '17, 50-53', note: 'small mobs on the dry hummocks and ridges of the marsh, clear of the town; a static mesh (body, rear shag, neck, blue-grey head, two legs)' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 14, note: 'a bird dressed: lean red meat; the fat rendered for oil' },
    eggs: { amount: 10, note: 'a clutch of 5 to 15 dark green eggs a year, sat by the cock; taken from wild nests' },
    feathers: { amount: 0.3, note: 'moulted: the double-shafted body feathers, for fletching, brushes and capes' },
    hide: { amount: 1, hideM2: 0.7, note: 'a thin, pitted leather' } },
  life: { maturity: 2, lifespan: 15, litter: 9, gestation: 52, note: 'gestation: the clutch\'s incubation in days; the cock rears the striped chicks' },
  variants: 2, variantNames: ['adult', 'chick, striped'],
  w: 0.86, d: 1.36, h: 1.98,
  variantDims: [{ w: 0.86, d: 1.36, h: 1.98 }, { w: 0.36, d: 0.58, h: 0.84 }],
  data: { mass: [42, 4], legs: 2, speed: { walk: 1.2, run: 13 }, gait: { type: 'biped', freq: 1.4, stride: 0.6 }, grazePitch: 1.0,
    herd: 'mobs of 3 to 8 on the marsh hummocks; a cock alone with his chicks', fleeDistance: 25, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_EMU[A.variant] || FA_AB_EMU[0], K = C.K, H = C.hair, P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    const plume = (a, z) => C.stripes ? (Math.sin(a * 4.5) > 0.15 ? C.body : C.dark) : faAbMix(C.body, C.dark, faHash(a * 7, z * 13, 1.3) * 0.7);
    /* ---- the body under its plumage */
    const bf = faAbCR([[-.5, 1.1, .04, .04], [-.42, 1.1, .2, .21], [-.22, 1.12, .29, .3], [.05, 1.13, .3, .31], [.27, 1.16, .24, .27], [.4, 1.22, .13, .15]].map(r => [0, r[1] * K, r[0] * K, r[2] * K, r[3] * K]));
    faAbSpan(A, 'coat', bf, 0, 1, 12, 14, null, { caps: true, colf: (t, a) => plume(a, t) });
    const locks = [];
    for (let i = 0; i < 150; i++) {
      const t = A.rr(0.12, 0.95), a = A.rr(-1, 1) * 1.75, q = bf(t), at = [Math.sin(a) * q[3] * 1.02, q[1] + Math.cos(a) * q[4] * 1.02, q[2]];
      locks.push({ at: at, dir: [Math.sin(a) * 0.3, -1, -0.3], len: A.rr(0.16, 0.32) * K * H * (t < 0.4 ? 1.25 : 1), w: A.rr(0.04, 0.06) * K, col: plume(a, at[2] / K), curl: 0.15 });
    }
    A.locks('hair', locks);
    /* ---- the rump's shag: the long feathers that hang off the back end (they sway as the tail does) */
    A.part('tail', P(0, 1.08, -.42), () => {
      const rl = [];
      for (let i = 0; i < 34; i++) { const t = A.rr(0, 0.2), a = A.rr(-1, 1) * 1.9, q = bf(t), at = [Math.sin(a) * q[3], q[1] + Math.cos(a) * q[4], q[2]];
        rl.push({ at: at, dir: [Math.sin(a) * 0.35, -1, -0.55], len: A.rr(0.24, 0.4) * K * H, w: 0.055 * K, col: plume(a, at[2] / K), curl: 0.18 }); }
      A.locks('hair', rl);
    });
    /* ---- the neck and head: feathered dark below, the bare blue-grey skin above, the dark crown, a flat bill */
    A.part('head', P(0, 1.22, .36), () => {
      const nf = faAbCR([[0, 1.18, .3, .1, .11], [0, 1.45, .36, .075, .075], [0, 1.7, .41, .055, .055], [0, 1.86, .44, .048, .048]].map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbSpan(A, 'coat', nf, 0, 1, 10, 10, null, { colf: (t, a) => C.stripes ? (Math.sin(a * 3) > 0.1 ? C.body : C.dark) : (t < 0.45 ? C.dark : faAbMix(C.dark, C.skin, Math.min(1, (t - 0.45) * 4))) });
      const nl = [];
      for (let i = 0; i < 30; i++) { const t = A.rr(0, 0.45), a = A.rr(-1, 1) * Math.PI, q = nf(t), at = [Math.sin(a) * q[3], q[1] + Math.cos(a) * q[4], q[2] + Math.cos(a) * 0.01];
        nl.push({ at: at, dir: [Math.sin(a) * 0.4, -1, -0.1], len: A.rr(0.07, 0.13) * K * H, w: 0.035 * K, col: C.stripes ? plume(a, 0) : C.dark, curl: 0.1 }); }
      A.locks('hair', nl);
      A.ellip('coat', 0, 1.9 * K, 0.485 * K, 0.055 * K, 0.058 * K, 0.085 * K, C.skin, { seg: 10 });
      A.ellip('coat', 0, 1.935 * K, 0.47 * K, 0.046 * K, 0.03 * K, 0.062 * K, C.crown, { seg: 8 });
      const bl = faAbCR([[0, 1.888, .545, .026, .016], [0, 1.88, .6, .02, .012], [0, 1.866, .64, .01, .007]].map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbSpan(A, 'horn', bl, 0, 1, 5, 8, C.bill, { caps: true });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.047 * K, 1.912 * K, 0.505 * K, 0.011 * K, 0.011 * K, 0.011 * K, C.eye, { seg: 6 });
        A.ellip('eye', s * 0.054 * K, 1.913 * K, 0.508 * K, 0.005 * K, 0.005 * K, 0.005 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the legs: the feathered thigh under the skirt, the long shank, the ankle that bends back, three toes */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .12, .95, .02), () => {
      const x = s * 0.13;
      A.ellip('coat', x * K, 0.88 * K, 0.03 * K, 0.085 * K, 0.14 * K, 0.12 * K, C.stripes ? C.body : C.dark, { seg: 10 });
      faAbLimb(A, 'skin', [[x, .82, .07, .05], [x, .46, -.03, .036], [x, .07, .015, .03]].map(PR), 8, C.leg, { knob: 1.2 });
      for (const k of [-1, 0, 1]) A.cone('skin', P(x, .04, .02), P(x + k * .055, .012, .15 + (k ? -0.02 : 0.02)), 0.02 * K, 0.009 * K, C.leg, 6);
    });
    A.anchor('back', P(0, 1.42, 0));
  }
});

/* ================================================================ the pack lizard
   Locus's and Mungo's caravan beast (gBeast): a long heavy body on four splayed legs, a thick tail, a blunt head; olive.
   Kept by the Locus carters and the caravans that stop at Mungo: it pulls the carts and carries the bales (the pack is
   tack: not drawn here; fit it to the anchors or the profile). The originals' boxes are rounded into a table body;
   the tail now droops to the ground (theirs rose). */
const FA_AB_PL = [[-2.8, .3, .035, .03], [-2.3, .5, .1, .09], [-1.8, .68, .17, .15], [-1.3, .83, .27, .23], [-.85, .93, .40, .32], [-.3, .97, .46, .36], [.3, .98, .46, .36],
  [.78, .99, .40, .31], [1.08, 1.02, .28, .23], [1.33, 1.08, .275, .225], [1.58, 1.12, .25, .19], [1.8, 1.13, .19, .13]];
const FA_AB_PLC = [{ back: 0x6a6a4a, tail: 0x5e5e40, leg: 0x55553a, belly: 0x8c8664 }, { back: 0x6e6450, tail: 0x625844, leg: 0x564e3c, belly: 0x9a8e70 }];
ANIMAL({
  key: 'pack-lizard', name: 'Pack lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['semiarid', 'subhumid', 'arid'], climate: ['tropic', 'hypertropic'], riparian: 'both', abyssal: true,
    domestic: true, herdedBy: ['locus', 'mungo'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'swims'] },
  size: { length: 4.6, height: 1.33 },
  source: [{ build: 'settlements/locus', file: 'src/84-life.js', lines: '427-430', note: 'the life layer\'s pack lizard: in the caravans\' columns and before the carts, a load lashed on its back (tack, not ported); kept by the Locus carters and caravans' },
    { build: 'settlements/mungo', file: 'src/84-mungo-life.js', lines: '34, 38-40', note: 'the caravans\' pack lizards, a little bigger (2.4 m body), bales lashed on: walking in the column, stabled in the caravanserai\'s court while the caravan stays' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 300, note: 'an old beast dressed; tough, eaten smoked or stewed' },
    eggs: { amount: 15, note: 'a clutch a year in a warm sand pit in the yard; most are left to hatch' },
    hide: { amount: 1, hideM2: 6, note: 'heavy scaled leather: harness, sandals, shields' } },
  life: { maturity: 6, lifespan: 50, litter: 10, gestation: 90, note: 'gestation: the clutch\'s incubation in days; worked from its eighth year' },
  variants: 2, variantNames: ['olive', 'dun'],
  w: 1.45, d: 4.66, h: 1.36,
  data: { mass: 800, legs: 4, speed: { walk: 1.2, run: 4 }, gait: { type: 'quadruped', freq: 0.75, stride: 0.6 }, grazePitch: 0.4,
    herd: 'worked singly before a cart or in a string of 2 to 6 in a caravan', fleeDistance: 0, aggression: 0.05, load: 'about 250 kg on its back; a two-wheeled cart',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_PLC[A.variant] || FA_AB_PLC[0], S = A.S, R = faAbRows(FA_AB_PL, S, 0), f = faAbCR(R), n = R.length - 1;
    const skin = (T, a) => { const top = Math.cos(a), q = f(T), base = T < 3.8 / n ? faAbMix(C.tail, C.back, Math.max(0, (T - 2 / n) / (1.8 / n))) : C.back;
      const mot = 0.86 + 0.22 * faNoise(q[2] * 3.1, a * 2.2, 5.1), band = top > 0.25 && Math.sin(q[2] / S * 5.2) > 0.72 ? 0.82 : 1;
      return faAbMix(base, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.2)), mot * band); };
    faAbSpan(A, 'skin', f, 3.6 / n, 8.4 / n, 20, 16, null, { colf: skin, inset: [-1, 2] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'skin', f, 0, 4.4 / n, 16, 12, null, { caps: true, colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.6 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'skin', f, 7.6 / n, 1, 12, 14, null, { caps: true, colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.245 * S, 1.17 * S, 1.38 * S, 0.045 * S, 0.04 * S, 0.045 * S, 0x16100a, { seg: 8 });
        A.ellip('eye', s * 0.27 * S, 1.175 * S, 1.385 * S, 0.018 * S, 0.018 * S, 0.018 * S, 0xc89a3a, { seg: 6 });
        const L = [[s * .262, 1.04, 1.2], [s * .225, 1.02, 1.58], [s * .12, 1.015, 1.8]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.012 * S, 0.012 * S, 0x24200e, 5);
        A.ellip('mouth', s * 0.06 * S, 1.17 * S, 1.88 * S, 0.012 * S, 0.01 * S, 0.008 * S, 0x1a160c, { seg: 6 });
      }
    });
    /* the legs: thick, the elbow and the knee a little out (the originals' four posts), broad clawed feet */
    const LEGS = [[.72, 1, 1, 0], [.72, 1, -1, 1], [-.72, 0, 1, 2], [-.72, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const top = [s * 0.36 * S, (front ? 0.86 : 0.9) * S, z * S];
      A.part('leg' + i, top, () => {
        const pts = (front ? [[.36, .86, .72, .14], [.55, .52, .68, .12], [.55, .12, .76, .1]] : [[.36, .9, -.72, .16], [.56, .55, -.6, .13], [.56, .12, -.76, .1]]).map(q => [s * q[0] * S, q[1] * S, q[2] * S, q[3] * S]);
        faAbLimb(A, 'skin', pts, 10, (j, jt) => j === 0 && !jt ? C.back : C.leg, { knob: 1.06 });
        const ft = pts[2], fz = ft[2] + (front ? 0.07 : 0.09) * S;
        A.ellip('skin', ft[0], 0.05 * S, fz, 0.16 * S, 0.05 * S, 0.2 * S, C.leg, { seg: 10 });
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.32 + s * 0.12;
          A.cone('horn', [ft[0] + Math.sin(a) * 0.12 * S, 0.035 * S, fz + Math.cos(a) * 0.12 * S], [ft[0] + Math.sin(a) * 0.27 * S, 0.012 * S, fz + Math.cos(a) * 0.27 * S], 0.035 * S, 0.01 * S, 0x2a2a20, 6); }
      });
    }
    A.profile(t => { const q = f(t); return { z: q[2], y: q[1], hw: q[3], hh: q[4] }; });
    A.anchor('saddle', [0, 1.33 * S, 0]); A.anchor('pack', [0, 1.33 * S, -0.05 * S]); A.anchor('bridle', [0, 1.12 * S, 1.62 * S]);
    A.anchor('chest', [0, 0.95 * S, 0.95 * S]); A.anchor('tailRoot', [R[4][0], R[4][1], R[4][2]]); A.anchor('headRoot', [hp[0], hp[1], hp[2]]);
  }
});

/* ================================================================ the riding lizard
   Verge's rig (the richer: the trunk, the neck and head, the two-piece tail, the flared frill, the splayed two-joint legs,
   the pale belly and the mottled back): the abyss's mount, 3 m and 0.9 m at the back. Locus and Mungo draw a much bigger
   upright beast (6 m, 1.8 m at the back): that is the 'great' breed here. The saddle and blanket are tack (not drawn). */
const FA_AB_RL = [[-1.68, .13, .012, .012], [-1.35, .30, .06, .055], [-1.0, .45, .105, .09], [-.65, .52, .155, .13], [-.4, .58, .24, .2], [-.15, .60, .36, .26],
  [.2, .62, .40, .27], [.48, .60, .32, .23], [.7, .62, .2, .165], [.9, .645, .17, .14], [1.08, .635, .155, .12], [1.24, .60, .11, .085], [1.36, .565, .045, .038]];
const FA_AB_RLC = [{ skin: 0x4a4e44, belly: 0xb8a888, frill: 0xb84a2a }, { skin: 0x3a4048, belly: 0x9a8a6a, frill: 0xd0902a }, { skin: 0x6a5a48, belly: 0xc0b090, frill: 0x3a7a6a }];
ANIMAL({
  key: 'riding-lizard', name: 'Riding lizard', group: 'abyss',
  tags: { biomes: ['eastabyss'], koppen: ['X', 'BWh', 'Aw'], aridity: ['semiarid', 'subhumid', 'arid'], climate: ['tropic', 'hypertropic'], riparian: 'both', abyssal: true,
    domestic: true, herdedBy: ['locus', 'verge', 'mungo'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen', 'marsh'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 3.05, height: 0.9 },
  source: [{ build: 'settlements/verge', file: 'src/77-verge-rigs.js', lines: '311-364', note: 'ported from here (the richer): ridden by Lower Verge\'s people and the nomad squads below the descent (camels above); four looks (skin, belly, frill), a saddle (tack)' },
    { build: 'settlements/locus', file: 'src/84-life.js', lines: '431-434', note: 'the life layer\'s riding lizard: a big upright beast (back 1.8 m, 6 m long) with a raised frill and a saddle; ridden by Locus\'s people (the great breed)' },
    { build: 'settlements/mungo', file: 'src/84-mungo-life.js', lines: '34-37', note: 'the nomads\' riding lizards, the Locus beast again: ridden in, left in the caravanserai\'s court for the night (the great breed)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: true },
  yields: { meat: { amount: 120, note: 'a riding beast dressed (the great breed about 800); eaten only when old or lamed' },
    eggs: { amount: 14, note: 'a clutch a year in the stable yard\'s warm sand; most are left to hatch' },
    hide: { amount: 1, hideM2: 2.4, note: 'supple scaled leather: boots, belts, the saddles themselves' } },
  life: { maturity: 4, lifespan: 35, litter: 14, gestation: 75, note: 'gestation: the clutch\'s incubation in days; broken to the saddle in its fifth year' },
  variants: 3, variantNames: ['olive, red frill', 'slate, saffron frill', 'sand, teal frill'],
  breeds: { riding: { scale: 1, mass: 340, role: 'riding mount (Verge)' }, great: { scale: 1.9, mass: 2300, role: 'the great riding lizard of Locus and Mungo' } },
  w: 1.5, d: 3.1, h: 1.1,
  data: { mass: 340, legs: 4, speed: { walk: 1.5, run: 8 }, gait: { type: 'sprawl', freq: 1.2, stride: 0.6 }, grazePitch: 0.3,
    herd: 'kept singly by its rider; a string in a nomad squad', fleeDistance: 0, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_RLC[A.variant] || FA_AB_RLC[0], S = A.S, R = faAbRows(FA_AB_RL, S, 0), f = faAbCR(R), n = R.length - 1, edge = faAbMix(C.frill, 0x1a1410, 0.55);
    const skin = (T, a) => { const top = Math.cos(a), mot = 0.82 + 0.26 * faHash(Math.floor(T * 90), Math.floor((a + 7) * 3.2), 3.3);
      return faAbMix(C.skin, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.15)), mot); };
    faAbSpan(A, 'skin', f, 3.6 / n, 8.4 / n, 18, 16, null, { colf: skin, inset: [-1, 2] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'skin', f, 0, 4.4 / n, 18, 12, null, { caps: true, colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.4 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'skin', f, 7.4 / n, 1, 14, 14, null, { caps: true, colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.128 * S, 0.69 * S, 0.97 * S, 0.032 * S, 0.03 * S, 0.032 * S, 0x120c08, { seg: 8 });
        A.ellip('eye', s * 0.146 * S, 0.695 * S, 0.975 * S, 0.013 * S, 0.013 * S, 0.013 * S, 0xd8a040, { seg: 6 });
        const L = [[s * .15, .6, .92], [s * .12, .585, 1.18], [s * .05, .56, 1.34]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.008 * S, 0.008 * S, 0x2a1a12, 5);
        A.ellip('mouth', s * 0.025 * S, 0.588 * S, 1.35 * S, 0.008 * S, 0.006 * S, 0.006 * S, 0x140e0a, { seg: 6 });
      }
      /* the frill: a collar flaring back over the shoulders, open underneath, ribbed, its rim dark */
      faAbSheet2(A, 'skin', (u, v) => { const a = -0.22 * Math.PI + 1.44 * Math.PI * u, sc = 1 + 0.07 * Math.sin(u * Math.PI * 11) * v * v;
          return [Math.cos(a) * (0.17 + 0.33 * v) * sc * S, (0.63 + 0.04 * v + Math.sin(a) * (0.145 + 0.275 * v) * sc) * S, (0.8 - 0.12 * v) * S]; },
        22, 4, null, (u, v) => { const rib = Math.abs(((u * 11) % 1) - 0.5) > 0.4; return v > 0.8 ? edge : faAbShade(C.frill, (rib ? 0.72 : 0.9) + 0.1 * (1 - v)); });
    });
    /* the legs: out from the shoulder and the hip (the upper limb near level), then straight down to a broad pad, four toes */
    const LEGS = [[.27, .42, 1, 1, 0], [.27, .42, 1, -1, 1], [.28, -.26, 0, 1, 2], [.28, -.26, 0, -1, 3]];
    for (const [x, z, front, s, i] of LEGS) {
      const jt = [s * x * S, 0.55 * S, z * S];
      A.part('leg' + i, jt, () => {
        const yaw = s * (front ? -0.12 : 0.18), ox = s * Math.sin(1.25) * Math.cos(yaw), oz = -s * Math.sin(1.25) * Math.sin(yaw);
        const kn = [jt[0] + 0.38 * ox * S, jt[1] - 0.38 * Math.cos(1.25) * S, jt[2] + 0.38 * oz * S], an = [kn[0], 0.08 * S, kn[2] + 0.03 * S];
        faAbLimb(A, 'skin', [[jt[0], jt[1], jt[2], 0.12 * S], [kn[0], kn[1], kn[2], 0.085 * S], [an[0], an[1], an[2], 0.058 * S]], 10, (j, jj) => j === 0 && !jj ? faAbShade(C.skin, 0.95) : C.skin, { knob: 1.08 });
        A.ellip('skin', an[0], 0.035 * S, an[2] + 0.06 * S, 0.12 * S, 0.035 * S, 0.15 * S, faAbMix(C.skin, C.belly, 0.25), { seg: 10 });
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.4 + (front ? 0 : s * 0.15);
          A.cone('skin', [an[0], 0.03 * S, an[2] + 0.08 * S], [an[0] + Math.sin(a) * 0.17 * S, 0.012 * S, an[2] + 0.08 * S + Math.cos(a) * 0.17 * S], 0.03 * S, 0.01 * S, C.skin, 6); }
      });
    }
    A.profile(t => { const q = f(t); return { z: q[2], y: q[1], hw: q[3], hh: q[4] }; });
    A.anchor('saddle', [0, 0.89 * S, 0.04 * S]); A.anchor('bridle', [0, 0.6 * S, 1.25 * S]); A.anchor('chest', [0, 0.6 * S, 0.6 * S]);
    A.anchor('tailRoot', [R[4][0], R[4][1], R[4][2]]); A.anchor('headRoot', [hp[0], hp[1], hp[2]]);
  }
});

/* ================================================================ the dromedary
   Verge's camel rig (the richer: the deep barrel and the hump, the arched neck dropping before it rises, the darker
   muzzle, the callused knees, the broad dark pads, the tail's tuft); Yuni's caravanserai draws a simpler pack camel.
   Shoulder 1.9 m, hump 2.31 m, 3 m long. The legs bend as a camel's do: the front leg's knee (the wrist) a callused knob
   with the cannon below it; the hind leg's stifle low under the belly, the gaskin running back to the hock. */
const FA_AB_DROM = [0xc8a878, 0x9a7048, 0xd8c4a0];
ANIMAL({
  key: 'dromedary', name: 'Dromedary', group: 'abyss',
  tags: { biomes: ['sedesert'], koppen: ['BWh', 'BSh', 'BWk'], aridity: ['arid', 'semiarid'], climate: ['tropic', 'temperate'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['iziz', 'verge', 'yuni'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs'] },
  size: { length: 2.9, height: 2.31 },
  source: [{ build: 'settlements/verge', file: 'src/77-verge-rigs.js', lines: '240-309', note: 'ported from here (the richer): Upper Verge\'s caravans (3 to 5 laden camels, each with its driver) and porters, who lead them down the trail to Lower Verge; ridden by the nomads above the descent; bales, crates and a riding saddle (tack)' },
    { build: 'settlements/yuni', file: 'src/56-mid.js', lines: '452-465, 523', note: 'a static pack camel (swept body, hump, arched neck, a load) at the caravanserai of the desert road' }],
  traits: { edible: true, milkable: true, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 260, note: 'dressed; the hump\'s fat rendered' },
    milk: { amount: 5, note: 'in milk about a year after each calf' },
    hide: { amount: 1, hideM2: 4, note: 'thick leather: water bags, saddlery, sandals' },
    hair: { amount: 2, note: 'shed and combed out each spring: rope, cloth and tent felt' } },
  life: { maturity: 4, lifespan: 40, litter: 1, gestation: 390 },
  variants: 3, variantNames: ['sand', 'brown', 'cream'],
  w: 0.88, d: 2.95, h: 2.34,
  data: { mass: 520, legs: 4, speed: { walk: 1.4, run: 11 }, gait: { type: 'quadruped', freq: 0.8, stride: 0.75 }, grazePitch: 1.2,
    herd: 'a caravan string of 3 to 5, each with its driver; a porter leads 1 or 2', fleeDistance: 0, aggression: 0.1, load: 'about 180 kg: bales, crates, or a rider',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'BROWSE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'WORK', 'BROWSE', 'BROWSE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const coat = FA_AB_DROM[A.variant] || FA_AB_DROM[0], muzzle = faAbMix(coat, 0x3a2a1e, 0.35), pad = faAbShade(coat, 0.45), call = faAbShade(coat, 0.62);
    const fur = (k) => (t, a) => faAbMix(coat, faAbShade(coat, 1.12), Math.max(0, -Math.cos(a)) * 0.5, k * (0.94 + 0.1 * faNoise(t * 9, a * 1.7, 4.2)));
    /* ---- the barrel, the chest deep, the belly tucked; the hump; the chest's callus */
    const bf = faAbCR([[-1.0, 1.48, .04, .04], [-.92, 1.45, .27, .3], [-.72, 1.44, .38, .42], [-.2, 1.43, .41, .44], [.32, 1.45, .39, .46], [.62, 1.5, .3, .41], [.8, 1.55, .06, .06]].map(r => [0, r[1], r[0], r[2], r[3]]));
    faAbSpan(A, 'coat', bf, 0, 1, 20, 16, null, { caps: true, colf: fur(1) });
    const hf = faAbCR([[0, 1.7, -.1, .38, .6], [0, 1.9, -.11, .34, .51], [0, 2.08, -.12, .25, .37], [0, 2.22, -.13, .15, .22], [0, 2.31, -.13, .02, .03]]);
    faAbSpan(A, 'coat', hf, 0, 1, 10, 16, null, { colf: fur(0.95) });
    A.ellip('skin', 0, 0.99, 0.3, 0.13, 0.06, 0.17, call, { seg: 10 });
    const hl = [];
    for (let i = 0; i < 14; i++) { const a = A.rr(-1, 1) * 1.2, z = A.rr(-0.32, 0.08), at = [Math.sin(a) * 0.14, 2.22 + Math.cos(a) * 0.06, z];
      hl.push({ at: at, dir: [Math.sin(a) * 0.6, -0.4, A.rr(-0.3, 0.3)], len: A.rr(0.07, 0.12), w: 0.04, col: faAbShade(coat, 0.85), curl: 0.3 }); }
    A.locks('hair', hl);
    /* ---- the tail, a dark tuft at its end */
    A.part('tail', [0, 1.6, -.95], () => {
      faAbLimb(A, 'coat', [[0, 1.62, -.94, .05], [0, 1.25, -1.03, .037], [0, 1.0, -1.035, .025]], 6, coat);
      const tl = [];
      for (let i = 0; i < 6; i++) tl.push({ at: [A.rr(-0.015, 0.015), 1.04, -1.035], dir: [A.rr(-0.2, 0.2), -1, A.rr(-0.2, 0.1)], len: A.rr(0.1, 0.16), w: 0.035, col: faAbShade(coat, 0.35), curl: 0.05 });
      A.locks('hair', tl);
    });
    /* ---- the neck (down from the shoulders, then up) and the head, the muzzle darker, the heavy lower lip */
    A.part('head', [0, 1.6, .62], () => {
      const nf = faAbCR([[0, 1.7, .46, .19, .25], [0, 1.58, .74, .145, .19], [0, 1.51, .98, .125, .155], [0, 1.6, 1.24, .105, .125], [0, 1.8, 1.37, .1, .11], [0, 1.93, 1.46, .095, .1]]);
      faAbSpan(A, 'coat', nf, 0, 1, 16, 12, null, { colf: fur(1.02) });
      const hd = faAbCR([[0, 2.02, 1.28, .04, .05], [0, 2.01, 1.34, .1, .12], [0, 2.0, 1.55, .085, .105], [0, 1.96, 1.74, .064, .084], [0, 1.93, 1.83, .035, .045]]);
      faAbSpan(A, 'coat', hd, 0, 1, 12, 12, null, { caps: true, colf: (t, a) => t > 0.62 ? muzzle : faAbMix(coat, muzzle, Math.max(0, t - 0.4) * 2) });
      A.ellip('coat', 0, 1.875, 1.77, 0.05, 0.03, 0.07, muzzle, { seg: 8 });
      for (const s of [-1, 1]) {
        A.ellip('coat', s * 0.08, 2.09, 1.42, 0.04, 0.02, 0.05, faAbShade(coat, 0.9), { seg: 8 });
        A.ellip('eye', s * 0.088, 2.06, 1.42, 0.028, 0.028, 0.028, 0x1a120c, { seg: 8 });
        A.ellip('mouth', s * 0.03, 1.965, 1.815, 0.008, 0.012, 0.008, 0x1a120c, { seg: 6 });
      }
    });
    for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.08, 2.08, 1.36], () => A.cone('coat', [s * 0.075, 2.07, 1.37], [s * 0.12, 2.17, 1.33], 0.03, 0.006, coat, 6));
    /* ---- the legs: each turns about its top; front: elbow, forearm, the callused knee, the cannon; hind: thigh, the low
       stifle, the gaskin back to the hock, the cannon; then the fetlock, the pastern, the broad pad and two nails */
    const LEGS = [[.2, .5, 1, 0], [-.2, .5, 1, 1], [.21, -.66, 0, 2], [-.21, -.66, 0, 3]];
    for (const [x, z, front, i] of LEGS) A.part('leg' + i, [x, 1.32, z], () => {
      const s = Math.sign(x), X = q => x + s * q;
      const pts = front ? [[x, 1.4, z, .13], [X(.01), 1.12, z - .06, .11], [x, .92, z - .01, .082], [x, .72, z + .03, .072], [x, .42, z + .02, .05], [x, .14, z + .02, .054]]
        : [[x, 1.42, z, .17], [X(.01), 1.14, z + .08, .14], [X(.01), .99, z + .16, .095], [x, .73, z - .12, .066], [x, .42, z - .09, .05], [x, .14, z - .06, .054]];
      faAbLimb(A, 'coat', pts, 8, (j, jt) => jt && j === 3 ? call : coat, { knob: j => j === 3 ? 1.28 : 1.05 });
      const fz = pts[5][2];
      A.ellip('coat', x, 0.085, fz + 0.03, 0.05, 0.05, 0.055, faAbShade(coat, 0.85), { seg: 8 });
      A.ellip('skin', x, 0.04, fz + 0.06, 0.1, 0.04, 0.13, pad, { seg: 10 });
      for (const k of [-1, 1]) A.ellip('hoof', x + k * 0.04, 0.03, fz + 0.15, 0.035, 0.025, 0.04, 0x2a2018, { seg: 6 });
    });
    A.anchor('saddle', [0, 2.31, -0.13]); A.anchor('pack', [0, 2.27, -0.13]); A.anchor('bridle', [0, 1.98, 1.62]);
    A.anchor('lead', [0, 1.95, 1.75]); A.anchor('chest', [0, 1.5, 0.7]);
  }
});
