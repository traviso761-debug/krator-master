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
/* a smooth skin along a curve f(t) -> [x, y, z, hw, hh], t 0..1: its section carried along by parallel transport, so it never
   flips or pinches where the curve turns steep (A.tube swaps its 'up' near vertical); the seam runs along the underside.
   o.round [a, b]: the radius closes in a dome over the first a and the last b of t (a snout, a tail tip: no flat caps);
   o.bump(t, angle) adds to the radius (a hump); o.colf(t, angle), angle 0 the top; o.up the first section's up */
function faAbTube(A, fam, f, nt, ns, col, o) {
  o = o || {};
  const P = [], T = [], B = [], N = [];
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (let i = 0; i <= nt; i++) P.push(f(i / nt));
  for (let i = 0; i <= nt; i++) { const a = P[Math.max(0, i - 1)], c = P[Math.min(nt, i + 1)]; T.push(nrm([c[0] - a[0], c[1] - a[1], c[2] - a[2]])); }
  let up = o.up || [0, 1, 0]; if (Math.abs(dot(up, T[0])) > 0.95) up = [0, 0, 1];
  let b = nrm(cross(up, T[0]));
  for (let i = 0; i <= nt; i++) {
    if (i) { const d = dot(b, T[i]); b = nrm([b[0] - d * T[i][0], b[1] - d * T[i][1], b[2] - d * T[i][2]]); }
    B.push(b); N.push(cross(T[i], b));
  }
  const rd = o.round || [0, 0], dome = t => { let k = 1;
    if (rd[0] > 0 && t < rd[0]) k = Math.sqrt(Math.max(0, 1 - Math.pow((rd[0] - t) / rd[0], 2)));
    if (rd[1] > 0 && t > 1 - rd[1]) k = Math.min(k, Math.sqrt(Math.max(0, 1 - Math.pow((t - 1 + rd[1]) / rd[1], 2))));
    return Math.max(0.03, k); };
  const ang = u => (u + 0.5) * 2 * Math.PI;
  A.sheet(fam, (u, v) => { const i = Math.round(v * nt), p = P[i], a = ang(u), k = dome(v), bu = o.bump ? o.bump(v, a) : 0;
      const sx = Math.sin(a) * (p[3] * k + bu), ny = Math.cos(a) * ((p[4] == null ? p[3] : p[4]) * k + bu);
      return [p[0] + B[i][0] * sx + N[i][0] * ny, p[1] + B[i][1] * sx + N[i][1] * ny, p[2] + B[i][2] * sx + N[i][2] * ny]; },
    ns, nt, col, o.colf ? { colf: (u, v) => o.colf(v, ang(u)) } : {});
}
/* a tube along part of a curve of rows [x, y, z, hw, hh]: global t0..t1; o.colf(T, angle) and o.bump(T, angle) get the global
   T; o.inset [below, above]: the radius shrinks a little outside that span (so an overlapped seam between parts never
   z-fights); o.round as faAbTube (o.caps: both ends domed) */
function faAbSpan(A, fam, f, t0, t1, nt, ns, col, o) {
  o = o || {};
  const ins = o.inset, k = T => ins && (T < ins[0] || T > ins[1]) ? 0.965 : 1, G = t => t0 + (t1 - t0) * t;
  faAbTube(A, fam, t => { const T = G(t), q = f(T), m = k(T); return [q[0], q[1], q[2], Math.max(0.002, q[3] * m), Math.max(0.002, (q[4] == null ? q[3] : q[4]) * m)]; }, nt, ns, col,
    { round: o.round || (o.caps ? [0.08, 0.08] : null), colf: o.colf ? (t, a) => o.colf(G(t), a) : null, bump: o.bump ? (t, a) => o.bump(G(t), a) : null });
}
/* a limb as one smooth skin through joint points [x, y, z, r] (shoulder to foot): each inner joint keeps a short rounded
   bend (rows either side of it, o.sharp of the way along), the radius following the points; o.round as faAbTube */
function faAbLeg(A, fam, pts, ns, col, o) {
  o = o || {}; const rows = [], k = o.sharp == null ? 0.2 : o.sharp;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (i > 0 && i < pts.length - 1) { const a = pts[i - 1], c = pts[i + 1];
      rows.push(p.map((v, j) => v + (a[j] - v) * k), p.slice(), p.map((v, j) => v + (c[j] - v) * k)); }
    else rows.push(p.slice());
  }
  faAbTube(A, fam, faAbCR(rows.map(r => [r[0], r[1], r[2], r[3], r[3]])), o.nt || rows.length * 4, ns, col, { round: o.round, colf: o.colf });
}
/* a monitor's sprawled leg (the pack and riding lizards): one skin from the shoulder or hip through the elbow or knee held
   out wide, down to the wrist or ankle and the pad; pts [shoulder, elbow, wrist, pad] as [x, y, z, r]; then the broad pad and
   five toes splayed (forward and out in front, out and a little back behind), each with a dark claw. s: the side (+1 left) */
function faAbSprawlLeg(A, fam, pts, front, s, col, padCol, claw) {
  faAbLeg(A, fam, pts, 12, col, { sharp: 0.22, nt: 30 });
  const p = pts[3], r = pts[2][3], aim = s * (front ? 0.3 : 0.75);
  A.ellip(fam, p[0], r * 0.5, p[2] + Math.cos(aim) * r * 0.3, r * 1.45, r * 0.55, r * 1.7, padCol, { seg: 12, ry: aim });
  for (let k = 0; k < 5; k++) {
    const a = (k - 2) * 0.36 + aim, L = r * (1.7 + (k === 3 ? 0.55 : k === 2 ? 0.35 : k === 0 ? -0.4 : 0)), dx = Math.sin(a), dz = Math.cos(a);
    const b = [p[0] + dx * r * 0.9, r * 0.42, p[2] + dz * r * 0.9], t = [b[0] + dx * L, r * 0.24, b[2] + dz * L];
    A.cone(fam, b, t, r * 0.36, r * 0.22, padCol, 7);
    A.cone('horn', t, [t[0] + dx * r * 0.55, r * 0.04, t[2] + dz * r * 0.55], r * 0.2, r * 0.03, claw, 6);
  }
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
   flight feathers), first drawn in Locus. Origin under the body; the neck's root at (0, .85, .2). The wings are built
   spread to the real 1.5 m span; perched, flap.foldScale and flap.sweep fold each back inside the body, and the folded
   wing that shows (coverts, tertials) is drawn on the flanks. Pose 'fly' stretches the neck out ahead (the legs trail
   by flap.tuck). Body and wings are the feather family, the legs scale. */
const FA_AB_FLA = [
  { body: 0xf2909e, deep: 0xe4687e, cov: 0xdc4a64, black: 0x1c1818, leg: 0xdc7c8a, band: 0xc85a6c, bill: 0xe6d6cc, tip: 0x1a1414, eye: 0xf0d060, K: 1 },
  { body: 0xccc4bc, deep: 0xaaa098, cov: 0xb0948e, black: 0x3a3430, leg: 0x6e6862, band: 0x5a5450, bill: 0x9a9490, tip: 0x1a1414, eye: 0xb8a878, K: 0.82 }];
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
  w: 1.56, d: 0.92, h: 1.46,
  variantDims: [{ w: 1.56, d: 0.92, h: 1.46 }, { w: 1.28, d: 0.76, h: 1.2 }],
  poses: ['stand', 'fly'],
  data: { mass: [3.2, 2.4], legs: 2, wings: 1, speed: { walk: 0.6, run: 4, fly: 15 }, gait: { type: 'flyer', freq: 1.1, stride: 0.5 },
    flap: { freq: 0.9, amp: 0.5, glide: 0.1, fold: 0.12, sweep: 1.5, foldScale: 0.28, tuck: 1.45 }, grazePitch: 2.7,
    herd: 'flocks of 12 to 60 in the shallows; skeins of 10 to 15 in V formation between the lakes', fleeDistance: 30, aggression: 0.02,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'FLY', 'GRAZE', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_AB_FLA[A.variant] || FA_AB_FLA[0], K = C.K, fly = A.pose === 'fly', P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    const RK = T => T.map(r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K, (r[4] == null ? r[3] : r[4]) * K]);
    /* ---- the body: a smooth teardrop, the breast full and forward, tapering back to the short tail */
    const bf = faAbCR(RK([[0, .866, -.37, .01, .01], [0, .858, -.315, .048, .042], [0, .842, -.23, .096, .088], [0, .826, -.13, .133, .128], [0, .816, -.03, .151, .146],
      [0, .816, .07, .152, .149], [0, .826, .16, .137, .142], [0, .846, .235, .105, .114], [0, .864, .285, .06, .07], [0, .872, .312, .018, .022]]));
    faAbTube(A, 'feather', bf, 26, 16, null, { round: [0.04, 0.06], colf: (t, a) => { const top = Math.max(0, Math.cos(a));
      return faAbShade(faAbMix(C.body, C.deep, top * (t > 0.12 && t < 0.8 ? 0.35 : 0.15)), 0.95 + 0.08 * faNoise(t * 18, a * 3, 1.7)); } });
    /* the folded wings as they show on a standing bird: the crimson coverts laid along each upper flank, the long pink
       tertials over the tail, the black flight feathers only a line at the lower back edge (the flying wing folds away
       inside the body: wingL/wingR below) */
    if (!fly) for (const s of [1, -1]) A.ellip('feather', s * 0.086 * K, 0.872 * K, -0.12 * K, 0.042 * K, 0.075 * K, 0.27 * K, null, { seg: 16, rx: -0.12, ry: s * 0.2,
      colf: (x, y, z) => { const yy = y / (0.075 * K), zz = z / (0.27 * K);
        return zz < -0.62 && yy < 0 ? C.black : faAbMix(C.body, C.cov, Math.max(0.15, Math.min(0.8, 0.42 - 0.3 * yy - 0.25 * zz))); } });
    /* ---- the head with the neck: the S-neck turns about its root (graze: the head goes down to the water, upside down);
       in the 'fly' pose the neck is stretched straight out ahead */
    A.part('head', P(0, .85, .2), () => {
      const nk = fly ? [[0, .80, .17, .072], [0, .84, .27, .052], [0, .85, .38, .037], [0, .845, .5, .03], [0, .838, .62, .027], [0, .832, .71, .027], [0, .83, .745, .029], [0, .83, .76, .03]]
        : [[0, .80, .17, .072], [0, .86, .235, .056], [0, .95, .295, .041], [0, 1.06, .343, .033], [0, 1.17, .36, .029], [0, 1.27, .338, .027], [0, 1.34, .3, .026], [0, 1.383, .27, .028], [0, 1.4, .262, .03]];
      faAbTube(A, 'feather', faAbCR(RK(nk)), 30, 10, C.body);
      /* the head and the bill are drawn in the standing pose's frame and set on the neck's end (pitched a little down in flight) */
      const HC = fly ? [.83, .76] : [1.4, .262], HP = fly ? 0.15 : 0, cp = Math.cos(HP), sp = Math.sin(HP);
      const hp = (x, y, z) => { const dy = y - 1.4, dz = z - .262; return [x * K, (HC[0] + dy * cp - dz * sp) * K, (HC[1] + dy * sp + dz * cp) * K]; };
      { const q = hp(0, 1.402, .264); A.ellip('feather', q[0], q[1], q[2], 0.037 * K, 0.04 * K, 0.058 * K, C.body, { seg: 12, rx: HP }); }
      /* the bill: pale, deep at the face, bending sharply down at its middle, the black tip */
      const bl = [[0, 1.398, .292, .022, .021], [0, 1.396, .325, .02, .019], [0, 1.386, .355, .017, .016], [0, 1.368, .377, .013, .012], [0, 1.345, .39, .009, .009], [0, 1.322, .394, .006, .006]]
        .map(r => { const q = hp(r[0], r[1], r[2]); return [q[0], q[1], q[2], r[3] * K, r[4] * K]; });
      faAbTube(A, 'horn', faAbCR(bl), 12, 10, null, { round: [0, 0.18], colf: t => t > 0.5 ? C.tip : C.bill });
      for (const s of [-1, 1]) {
        const e = hp(s * 0.031, 1.41, .274), p = hp(s * 0.037, 1.41, .277);
        A.ellip('eye', e[0], e[1], e[2], 0.009 * K, 0.009 * K, 0.009 * K, C.eye, { seg: 8 });
        A.ellip('eye', p[0], p[1], p[2], 0.004 * K, 0.004 * K, 0.004 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the wings, built spread (1.5 m tip to tip): from the shoulder out along +x (left), the crimson coverts on the
       leading half, the flight feathers black, the primaries' tips fingered. Perched, the runtime shortens each along its
       span (flap.foldScale) and turns it back along the flank (flap.sweep): folded so, it lies inside the body. */
    const LE = faAbCR([[.1, .17], [.3, .19], [.49, .17], [.645, .1], [.78, -.01]]), TE = faAbCR([[.1, -.02], [.3, -.035], [.49, -.05], [.645, -.035], [.78, -.01]]);
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(s * .1, .85, .17), () => {
      A.sheet('feather', (u, v) => { const a = LE(u), b = TE(u), prim = Math.max(0, (u - 0.45) / 0.55);
          const serr = (prim > 0 ? 0.03 * Math.abs(Math.sin(prim * Math.PI * 4.5)) * (1 - 0.6 * prim) : 0.008 * Math.abs(Math.sin(u * Math.PI * 9))) * v * v;
          return [s * (a[0] + (b[0] - a[0]) * v) * K, (0.85 + 0.03 * u + 0.02 * Math.sin(Math.PI * Math.min(1, v * 1.4)) * (1 - 0.6 * u)) * K, (a[1] + (b[1] - a[1]) * v - serr) * K]; },
        22, 6, null, { colf: (u, v) => v < 0.12 ? C.body : (u > 0.55 ? (v < 0.22 ? C.cov : C.black) : (v < 0.5 ? C.cov : C.black)) });
      /* the leading edge: the arm's thickness under the coverts */
      faAbTube(A, 'feather', t => { const u = t * 0.92, a = LE(u); return [s * a[0] * K, (0.852 + 0.03 * u) * K, (a[1] - 0.012) * K, (0.016 - 0.011 * t) * K, (0.011 - 0.007 * t) * K]; }, 12, 6, C.cov, { round: [0, 0.1] });
    });
    /* ---- the legs: long and thin, scaled, the ankle (the 'knee' that bends back) a darker knob; webbed feet, three toes */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .06, .69, -.02), () => {
      const x = s * 0.06;
      faAbLimb(A, 'scale', [[x, .74, -.02, .02], [x, .38, -.045, .0135], [x, .03, -.008, .011]].map(PR), 8, (j, jt) => jt ? C.band : C.leg, { knob: 1.45 });
      const heel = P(x, .012, -.008), toes = [-1, 0, 1].map(k => P(x + k * 0.034, 0.006, 0.075 - Math.abs(k) * 0.012));
      for (const tp of toes) A.cone('scale', heel, tp, 0.008 * K, 0.004 * K, C.leg, 5);
      faAbSheet2(A, 'scale', (u, v) => { const e = u < 0.5 ? faAbLerp3(toes[0], toes[1], u * 2) : faAbLerp3(toes[1], toes[2], u * 2 - 1); const p = faAbLerp3(heel, e, v * 0.92); return [p[0], 0.008 * K, p[2]]; }, 4, 2, C.leg);
    });
    A.anchor('perch', P(0, 0, 0)); A.anchor('back', P(0, .95, -.05));
  }
});

/* ================================================================ the frilled lizard
   biomes/eastabyss (shaded back and belly, a banded tail, the frill's two colours), first drawn in Locus; 0.95 m nose to
   tail. Variant 1 (or pose 'display') has the frill open, the way it faces a threat; otherwise it lies folded on the
   neck like a pleated cape. The eastern abyss's frill opens with the viewer's distance: a host swaps the variant. */
const FA_AB_FL = [[-.68, .035, .006, .006], [-.5, .044, .012, .011], [-.32, .054, .02, .018], [-.17, .067, .031, .027], [-.07, .077, .05, .04], [.03, .082, .062, .048],
  [.12, .085, .056, .045], [.18, .092, .04, .035], [.215, .1, .04, .036], [.25, .099, .035, .03], [.28, .094, .025, .021], [.305, .088, .013, .011]];
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
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 14, 14, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 18, 10, null, { round: [0.05, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.5 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      /* the head: a wedge from the neck to a rounded snout, the eyes high on its sides, the long mouth line */
      faAbSpan(A, 'scale', f, 7.5 / n, 1, 12, 14, null, { round: [0, 0.22], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.029, 0.113, 0.248, 0.0085, 0.0085, 0.0085, 0x1a1208, { seg: 8 });
        A.ellip('eye', s * 0.034, 0.114, 0.25, 0.0035, 0.0035, 0.0035, 0xd8a040, { seg: 6 });
        A.cone('mouth', [s * 0.036, 0.089, 0.215], [s * 0.012, 0.083, 0.296], 0.0022, 0.0022, 0x2a1a12, 4);
      }
      /* the frill: a ruff on cartilage spines round the neck, the inner face saffron, the rim red */
      const NY = 0.1, NZ = 0.17, A0 = -0.4, A1 = Math.PI + 0.8;
      const fr = open ? (u, v) => { const a = A0 + A1 * u, r = (0.035 + 0.165 * v) * (1 + 0.06 * Math.sin(u * Math.PI * 13) * v * v), y = Math.sin(a) * r;
          return [Math.cos(a) * r, NY + y * Math.cos(0.15), NZ - y * Math.sin(0.15) - 0.045 * v * v]; }
        : (u, v) => { const a = A0 + A1 * u, pl = 1 + 0.12 * Math.sin(u * Math.PI * 13) * v;
          return [Math.cos(a) * (0.042 + 0.03 * v) * pl, NY - 0.015 * v + Math.sin(a) * (0.038 + 0.022 * v) * pl, NZ - 0.1 * v]; };
      faAbSheet2(A, 'scale', fr, 26, 4, null, (u, v) => { const rib = Math.abs(((u * 13) % 1) - 0.5) > 0.4;
        if (!open) return faAbMix(F.liz, F.frill, 0.3 + 0.2 * v, rib ? 0.8 : 1);
        return v > 0.52 ? (rib ? faAbShade(F.frill, 0.78) : F.frill) : (rib ? faAbShade(F.frillC, 0.8) : F.frillC); });
    });
    /* the legs, sprawled: the upper arm and the thigh out level from the body, the elbow and the knee out wide (the knee
       forward), the forearm and the shin down to the wrist and the ankle; a flat palm and five long thin toes */
    const LEGS = [[.1, 1, 1, 0], [.1, 1, -1, 1], [-.1, 0, 1, 2], [-.1, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const b = [s * 0.03, 0.072, z];
      A.part('leg' + i, b, () => {
        const pts = front ? [[s * .02, .075, z, .015], [s * .074, .066, z - .014, .0105], [s * .094, .026, z + .008, .0075], [s * .1, .008, z + .026, .006]]
          : [[s * .022, .075, z, .018], [s * .084, .07, z + .024, .0125], [s * .112, .026, z - .022, .0085], [s * .12, .008, z - .042, .006]];
        faAbLeg(A, 'scale', pts, 8, null, { colf: (t, a) => Math.cos(a) < -0.4 ? faAbMix(F.dark, F.belly, 0.4) : F.dark });
        const ft = pts[3];
        A.ellip('scale', ft[0], 0.006, ft[2], 0.011, 0.005, 0.012, F.dark, { seg: 8, ry: front ? s * 0.35 : s * 0.75 });
        for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.38 + s * (front ? 0.35 : 0.75), L = (front ? 0.022 : 0.028) + (k === 3 ? 0.01 : k === 2 ? 0.006 : 0);
          A.cone('scale', [ft[0], 0.006, ft[2]], [ft[0] + Math.sin(a) * L, 0.0025, ft[2] + Math.cos(a) * L], 0.0042, 0.0014, F.dark, 5); }
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
    domestic: false, herdedBy: ['nomad'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',   /* wild; the abyssal nomads keep a few penned for eggs and feathers */
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
  w: 0.92, d: 1.42, h: 1.98,
  variantDims: [{ w: 0.92, d: 1.42, h: 1.98 }, { w: 0.36, d: 0.58, h: 0.84 }],
  data: { mass: [42, 4], legs: 2, speed: { walk: 1.2, run: 13 }, gait: { type: 'biped', freq: 1.4, stride: 0.6 }, grazePitch: 1.0,
    herd: 'mobs of 3 to 8 on the marsh hummocks; a cock alone with his chicks', fleeDistance: 25, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_EMU[A.variant] || FA_AB_EMU[0], K = C.K, H = C.hair, P = (x, y, z) => [x * K, y * K, z * K], PR = r => [r[0] * K, r[1] * K, r[2] * K, r[3] * K];
    const plume = (a, z) => C.stripes ? (Math.sin(a * 4.5) > 0.15 ? C.body : C.dark) : faAbMix(C.body, C.dark, faHash(a * 7, z * 13, 1.3) * 0.7);
    /* ---- the body under its plumage: highest over the hips, the rump falling away behind, the breast forward */
    const bf = faAbCR([[-.52, 1.0, .03, .03], [-.44, 1.06, .19, .22], [-.28, 1.12, .27, .29], [-.06, 1.14, .3, .3], [.14, 1.13, .28, .28], [.3, 1.15, .21, .22], [.4, 1.19, .12, .13], [.44, 1.21, .03, .03]]
      .map(r => [0, r[1] * K, r[0] * K, r[2] * K, r[3] * K]));
    faAbTube(A, 'feather', bf, 18, 16, null, { round: [0.06, 0.06], colf: (t, a) => plume(a, t) });
    /* the plumage: broad drooping locks laid along the body (down round its sides and a little back), overlapping like a
       thatch, longest at the rump; the strips lie flat on the plumage (their width along the body), not edge-on */
    const lay = (q, t, a, len, w, cl) => { const ca = Math.cos(a), sa = Math.sin(a), sg = a < 0 ? -1 : 1;
      const at = [sa * q[3] * 0.97, q[1] + ca * q[4] * 0.97, q[2]], dn = [sg * ca * q[3], -sg * sa * q[4], 0], l = Math.hypot(dn[0], dn[1]) || 1;
      return { at: at, dir: [dn[0] / l + 0.18 * sa, dn[1] / l + 0.18 * ca, -0.4], side: [0, 0, 1], len: len, w: w, col: plume(a, at[2] / K), curl: cl }; };
    const locks = [];
    /* (a chick is in striped down: its body's own stripes, no locks) */
    if (!C.stripes) for (let i = 0; i < 260; i++) { const t = A.rr(0.1, 0.95), a = A.rr(-1, 1) * 2.05;
      locks.push(lay(bf(t), t, a, A.rr(0.17, 0.3) * K * H * (t < 0.4 ? 1.25 : 1), A.rr(0.07, 0.1) * K, 0.15)); }
    if (locks.length) A.locks('feather', locks);
    /* ---- the rump's shag: the long feathers that hang off the back end (they sway as the tail does) */
    A.part('tail', P(0, 1.08, -.42), () => {
      const rl = [];
      for (let i = 0; i < 40; i++) { const t = A.rr(0, 0.22), a = A.rr(-1, 1) * 2.1, L = lay(bf(t), t, a, A.rr(0.24, 0.4) * K * H, 0.075 * K, 0.18);
        L.dir = [L.dir[0] * 0.8, L.dir[1], -0.7]; rl.push(L); }
      A.locks('feather', rl);
    });
    /* ---- the neck and head: a long neck rising from the breast with a slight forward lean, feathered dark below and the
       blue-grey bare skin above, a dark crown, the flat bill */
    A.part('head', P(0, 1.22, .36), () => {
      const nf = faAbCR([[0, 1.1, .26, .12, .13], [0, 1.32, .345, .082, .088], [0, 1.52, .385, .06, .062], [0, 1.7, .41, .05, .05], [0, 1.83, .44, .046, .046], [0, 1.9, .475, .045, .045]]
        .map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbTube(A, 'feather', nf, 20, 12, null, { colf: (t, a) => C.stripes ? (Math.sin(a * 3) > 0.1 ? C.body : C.dark) : (t < 0.45 ? C.dark : faAbMix(C.dark, C.skin, Math.min(1, (t - 0.45) * 4))) });
      const nl = [];
      for (let i = 0; i < 36; i++) { const t = A.rr(0, 0.5), a = A.rr(-1, 1) * Math.PI, q = nf(t), at = [Math.sin(a) * q[3] * 0.97, q[1] + Math.cos(a) * q[4] * 0.97, q[2]];
        nl.push({ at: at, dir: [Math.sin(a) * 0.35, -1, Math.cos(a) * 0.25 - 0.1], len: A.rr(0.07, 0.13) * K * H, w: 0.04 * K, col: C.stripes ? plume(a, 0) : C.dark, curl: 0.1 }); }
      A.locks('feather', nl);
      A.ellip('feather', 0, 1.9 * K, 0.485 * K, 0.055 * K, 0.058 * K, 0.085 * K, C.skin, { seg: 12 });
      A.ellip('feather', 0, 1.935 * K, 0.47 * K, 0.046 * K, 0.03 * K, 0.062 * K, C.crown, { seg: 10 });
      const bl = faAbCR([[0, 1.888, .54, .027, .017], [0, 1.88, .6, .021, .012], [0, 1.866, .638, .012, .008]].map(r => [0, r[1] * K, r[2] * K, r[3] * K, r[4] * K]));
      faAbTube(A, 'horn', bl, 8, 10, C.bill, { round: [0, 0.3] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.047 * K, 1.912 * K, 0.505 * K, 0.011 * K, 0.011 * K, 0.011 * K, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.054 * K, 1.913 * K, 0.508 * K, 0.005 * K, 0.005 * K, 0.005 * K, 0x050403, { seg: 6 });
      }
    });
    /* ---- the legs: the thigh's plumage up in the body's skirt, the bare shank (scaled, thick at the top), the ankle that
       bends back, the long scaled tarsus, three stout toes with claws */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, P(s * .12, .95, .02), () => {
      const x = s * 0.13;
      A.ellip('feather', x * K, 0.96 * K, 0.02 * K, 0.1 * K, 0.15 * K, 0.14 * K, C.stripes ? C.body : C.dark, { seg: 12 });
      faAbLeg(A, 'scale', [[x, .9, .05, .058], [x, .47, -.04, .036], [x, .08, .012, .029]].map(PR), 10, C.leg, { sharp: 0.14 });
      A.ellip('scale', x * K, 0.47 * K, -0.045 * K, 0.042 * K, 0.046 * K, 0.044 * K, faAbShade(C.leg, 0.92), { seg: 10 });
      A.ellip('scale', x * K, 0.06 * K, 0.03 * K, 0.04 * K, 0.03 * K, 0.05 * K, C.leg, { seg: 10 });
      for (const k of [-1, 0, 1]) { const a = k * 0.42, L = k ? 0.13 : 0.155, tip = P(x + Math.sin(a) * L, .014, .03 + Math.cos(a) * L);
        A.cone('scale', P(x, .035, .035), tip, 0.022 * K, 0.012 * K, C.leg, 7);
        A.cone('horn', tip, P(x + Math.sin(a) * (L + 0.035), .006, .03 + Math.cos(a) * (L + 0.035)), 0.011 * K, 0.002 * K, C.bill, 5); }
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
  w: 2.05, d: 4.7, h: 1.36,
  data: { mass: 800, legs: 4, speed: { walk: 1.2, run: 4 }, gait: { type: 'quadruped', freq: 0.75, stride: 0.6 }, grazePitch: 0.4,
    herd: 'worked singly before a cart or in a string of 2 to 6 in a caravan', fleeDistance: 0, aggression: 0.05, load: 'about 250 kg on its back; a two-wheeled cart',
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_PLC[A.variant] || FA_AB_PLC[0], S = A.S, R = faAbRows(FA_AB_PL, S, 0), f = faAbCR(R), n = R.length - 1;
    const skin = (T, a) => { const top = Math.cos(a), q = f(T), base = T < 3.8 / n ? faAbMix(C.tail, C.back, Math.max(0, (T - 2 / n) / (1.8 / n))) : C.back;
      const mot = 0.86 + 0.22 * faNoise(q[2] * 3.1, a * 2.2, 5.1), band = top > 0.25 && Math.sin(q[2] / S * 5.2) > 0.72 ? 0.82 : 1;
      return faAbMix(base, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.2)), mot * band); };
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 22, 18, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 18, 14, null, { round: [0.04, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.6 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'scale', f, 7.6 / n, 1, 14, 16, null, { round: [0, 0.16], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.245 * S, 1.17 * S, 1.38 * S, 0.045 * S, 0.04 * S, 0.045 * S, 0x16100a, { seg: 8 });
        A.ellip('eye', s * 0.27 * S, 1.175 * S, 1.385 * S, 0.018 * S, 0.018 * S, 0.018 * S, 0xc89a3a, { seg: 6 });
        const L = [[s * .262, 1.04, 1.2], [s * .225, 1.02, 1.58], [s * .1, 1.05, 1.74]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.012 * S, 0.012 * S, 0x24200e, 5);
        A.ellip('mouth', s * 0.055 * S, 1.16 * S, 1.755 * S, 0.014 * S, 0.01 * S, 0.01 * S, 0x1a160c, { seg: 6 });
      }
    });
    /* the legs, a monitor's: the upper arm and the thigh out and down from the body, the elbow and the knee held wide (the
       knee forward), the forearm and the shin down to the wrist and the ankle, broad pads, five splayed clawed toes */
    const LEGS = [[.72, 1, 1, 0], [.72, 1, -1, 1], [-.72, 0, 1, 2], [-.72, 0, -1, 3]];
    for (const [z, front, s, i] of LEGS) {
      const top = [s * 0.36 * S, (front ? 0.86 : 0.9) * S, z * S];
      A.part('leg' + i, top, () => {
        const pts = (front ? [[.3, .88, .72, .2], [.62, .62, .64, .15], [.66, .2, .78, .115], [.67, .08, .85, .1]]
          : [[.32, .92, -.72, .24], [.66, .7, -.56, .17], [.71, .2, -.8, .12], [.72, .08, -.86, .105]]).map(q => [s * q[0] * S, q[1] * S, q[2] * S, q[3] * S]);
        faAbSprawlLeg(A, 'scale', pts, front, s, C.leg, C.leg, 0x2a2a20);
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
    domestic: true, herdedBy: ['locus', 'verge', 'mungo', 'nomad'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
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
  w: 1.65, d: 3.1, h: 1.1,
  data: { mass: 340, legs: 4, speed: { walk: 1.5, run: 8 }, gait: { type: 'sprawl', freq: 1.2, stride: 0.6 }, grazePitch: 0.3,
    herd: 'kept singly by its rider; a string in a nomad squad', fleeDistance: 0, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_AB_RLC[A.variant] || FA_AB_RLC[0], S = A.S, R = faAbRows(FA_AB_RL, S, 0), f = faAbCR(R), n = R.length - 1, edge = faAbMix(C.frill, 0x1a1410, 0.55);
    const skin = (T, a) => { const top = Math.cos(a), mot = 0.82 + 0.26 * faHash(Math.floor(T * 90), Math.floor((a + 7) * 3.2), 3.3);
      return faAbMix(C.skin, C.belly, Math.max(0, Math.min(1, -top * 1.7 - 0.15)), mot); };
    faAbSpan(A, 'scale', f, 3.6 / n, 8.4 / n, 20, 18, null, { colf: skin, inset: [4 / n, 8 / n] });
    A.part('tail', [R[4][0], R[4][1], R[4][2]], () => faAbSpan(A, 'scale', f, 0, 4.4 / n, 20, 14, null, { round: [0.04, 0], colf: skin, inset: [0, 4 / n] }));
    const hp = f(7.4 / n);
    A.part('head', [hp[0], hp[1], hp[2]], () => {
      faAbSpan(A, 'scale', f, 7.4 / n, 1, 16, 16, null, { round: [0, 0.14], colf: skin, inset: [8 / n, 2] });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.128 * S, 0.69 * S, 0.97 * S, 0.032 * S, 0.03 * S, 0.032 * S, 0x120c08, { seg: 8 });
        A.ellip('eye', s * 0.146 * S, 0.695 * S, 0.975 * S, 0.013 * S, 0.013 * S, 0.013 * S, 0xd8a040, { seg: 6 });
        const L = [[s * .15, .6, .92], [s * .12, .585, 1.18], [s * .05, .57, 1.3]].map(q => [q[0] * S, q[1] * S, q[2] * S]);
        for (let i = 0; i < L.length - 1; i++) A.cone('mouth', L[i], L[i + 1], 0.008 * S, 0.008 * S, 0x2a1a12, 5);
        A.ellip('mouth', s * 0.03 * S, 0.6 * S, 1.31 * S, 0.009 * S, 0.007 * S, 0.007 * S, 0x140e0a, { seg: 6 });
      }
      /* the frill: a collar flaring back over the shoulders like a shallow cone, open underneath, ribbed, its rim dark */
      faAbSheet2(A, 'scale', (u, v) => { const a = -0.22 * Math.PI + 1.44 * Math.PI * u, sc = 1 + 0.07 * Math.sin(u * Math.PI * 11) * v * v;
          return [Math.cos(a) * (0.16 + 0.3 * v) * sc * S, (0.63 + 0.03 * v + Math.sin(a) * (0.14 + 0.25 * v) * sc) * S, (0.83 - 0.2 * v - 0.04 * v * v) * S]; },
        22, 4, null, (u, v) => { const rib = Math.abs(((u * 11) % 1) - 0.5) > 0.4; return v > 0.8 ? edge : faAbShade(C.frill, (rib ? 0.72 : 0.9) + 0.1 * (1 - v)); });
    });
    /* the legs, sprawled as a monitor's: the upper limb out and a little down from the shoulder and the hip, the elbow and
       the knee wide (the knee forward), then down to the wrist and the ankle, a broad pad and five splayed clawed toes */
    const LEGS = [[.27, .42, 1, 1, 0], [.27, .42, 1, -1, 1], [.28, -.26, 0, 1, 2], [.28, -.26, 0, -1, 3]];
    for (const [x, z, front, s, i] of LEGS) {
      const jt = [s * x * S, 0.55 * S, z * S];
      A.part('leg' + i, jt, () => {
        const pts = (front ? [[.2, .57, .42, .13], [.5, .42, .37, .09], [.55, .13, .47, .066], [.56, .055, .51, .062]]
          : [[.21, .57, -.26, .15], [.53, .46, -.15, .105], [.58, .13, -.35, .072], [.59, .055, -.39, .068]]).map(q => [s * q[0] * S, q[1] * S, q[2] * S, q[3] * S]);
        faAbSprawlLeg(A, 'scale', pts, front, s, C.skin, faAbMix(C.skin, C.belly, 0.25), 0x1e1a14);
      });
    }
    A.profile(t => { const q = f(t); return { z: q[2], y: q[1], hw: q[3], hh: q[4] }; });
    A.anchor('saddle', [0, 0.89 * S, 0.04 * S]); A.anchor('bridle', [0, 0.6 * S, 1.25 * S]); A.anchor('chest', [0, 0.6 * S, 0.6 * S]); A.anchor('pack', [0, 0.83 * S, -0.3 * S]);
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
    domestic: true, herdedBy: ['iziz', 'verge', 'yuni', 'nomad'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'docile',
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
    /* ---- the barrel, the chest deep, the belly tucked up to the narrow loins; the hump grows out of the back in one skin
       (a swelling of the barrel's section, not a separate piece), high and rounded over the middle; the chest's callus */
    const bf = faAbCR([[0, 1.52, -1.0, .03, .03], [0, 1.5, -.94, .18, .26], [0, 1.48, -.82, .26, .35], [0, 1.46, -.56, .29, .39], [0, 1.44, -.2, .315, .44],
      [0, 1.43, .15, .325, .47], [0, 1.44, .45, .3, .44], [0, 1.47, .65, .24, .35], [0, 1.52, .8, .12, .19], [0, 1.55, .86, .03, .04]]);
    const hump = (t, a) => { const q = bf(t), u = (q[2] + 0.16) / 0.45, v = Math.sin(a) * q[3] / 0.23; if (Math.abs(u) >= 1 || Math.abs(v) >= 1 || Math.cos(a) <= 0) return 0;
      return 0.43 * Math.pow(1 - u * u, 1.05) * Math.pow(1 - v * v, 1.2); };
    faAbTube(A, 'sleek', bf, 30, 22, null, { round: [0.05, 0.05], bump: hump, colf: fur(1) });
    A.ellip('skin', 0, 0.99, 0.3, 0.13, 0.06, 0.17, call, { seg: 10 });
    /* ---- the tail, a dark tuft at its end */
    A.part('tail', [0, 1.6, -.95], () => {
      faAbLeg(A, 'sleek', [[0, 1.62, -.93, .05], [0, 1.3, -1.025, .036], [0, 1.02, -1.035, .024]], 8, coat, { sharp: 0.3, round: [0, 0.1] });
      const tl = [];
      for (let i = 0; i < 7; i++) tl.push({ at: [A.rr(-0.015, 0.015), 1.06, -1.035], dir: [A.rr(-0.2, 0.2), -1, A.rr(-0.2, 0.1)], len: A.rr(0.1, 0.16), w: 0.035, col: faAbShade(coat, 0.35), curl: 0.05 });
      A.locks('hair', tl);
    });
    /* ---- the neck (deep at the withers, down from the shoulders, then up) and the head, the muzzle darker, the heavy lower lip */
    A.part('head', [0, 1.6, .62], () => {
      const nf = faAbCR([[0, 1.6, .52, .19, .26], [0, 1.555, .68, .16, .22], [0, 1.51, .9, .13, .16], [0, 1.51, 1.08, .118, .135], [0, 1.6, 1.25, .105, .12], [0, 1.8, 1.37, .1, .11], [0, 1.95, 1.45, .095, .1]]);
      faAbTube(A, 'sleek', nf, 24, 14, null, { round: [0.12, 0], colf: fur(1.02) });
      const hd = faAbCR([[0, 2.02, 1.28, .04, .05], [0, 2.01, 1.34, .1, .12], [0, 2.0, 1.55, .085, .105], [0, 1.96, 1.74, .064, .084], [0, 1.93, 1.83, .035, .045]]);
      faAbTube(A, 'sleek', hd, 16, 14, null, { round: [0.12, 0.14], colf: (t, a) => t > 0.62 ? muzzle : faAbMix(coat, muzzle, Math.max(0, t - 0.4) * 2) });
      A.ellip('sleek', 0, 1.875, 1.77, 0.05, 0.03, 0.07, muzzle, { seg: 10 });
      for (const s of [-1, 1]) {
        A.ellip('sleek', s * 0.08, 2.09, 1.42, 0.04, 0.02, 0.05, faAbShade(coat, 0.9), { seg: 8 });
        A.ellip('eye', s * 0.088, 2.06, 1.42, 0.028, 0.028, 0.028, 0x1a120c, { seg: 8 });
        A.ellip('mouth', s * 0.03, 1.965, 1.815, 0.008, 0.012, 0.008, 0x1a120c, { seg: 6 });
      }
    });
    for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.08, 2.08, 1.36], () => A.cone('sleek', [s * 0.075, 2.07, 1.37], [s * 0.12, 2.17, 1.33], 0.03, 0.006, coat, 7));
    /* ---- the legs, each one smooth skin turning about its top; front: the elbow free of the chest, the long forearm, the
       callused knee (the wrist), the thin cannon, the fetlock and the pastern; hind: the thigh, the low stifle, the gaskin
       back to the hock, the cannon; then the broad dark pad and its two nails */
    const LEGS = [[.2, .5, 1, 0], [-.2, .5, 1, 1], [.21, -.66, 0, 2], [-.21, -.66, 0, 3]];
    for (const [x, z, front, i] of LEGS) A.part('leg' + i, [x, 1.32, z], () => {
      const s = Math.sign(x), X = q => x + s * q;
      const pts = front ? [[X(-.06), 1.4, z + .02, .13], [x, 1.12, z - .06, .1], [x, .73, z + .02, .062], [x, .2, z + .02, .044], [x, .075, z + .07, .052]]
        : [[X(-.07), 1.42, z, .16], [x, 1.0, z + .15, .1], [x, .74, z - .12, .058], [x, .2, z - .07, .044], [x, .075, z - .02, .052]];
      faAbLeg(A, 'sleek', pts, 12, null, { sharp: 0.16, nt: 30, round: [0.08, 0.04], colf: fur(0.98) });
      const kn = pts[2];
      if (front) A.ellip('skin', kn[0], kn[1], kn[2] + 0.028, 0.05, 0.06, 0.04, faAbMix(coat, call, 0.6), { seg: 10 });
      else A.ellip('sleek', kn[0], kn[1] + 0.01, kn[2] - 0.025, 0.05, 0.07, 0.05, coat, { seg: 10 });
      const fz = pts[4][2];
      A.ellip('skin', x, 0.045, fz + 0.04, 0.1, 0.045, 0.13, pad, { seg: 12 });
      for (const k of [-1, 1]) A.ellip('hoof', x + k * 0.04, 0.03, fz + 0.13, 0.035, 0.025, 0.04, 0x2a2018, { seg: 8 });
    });
    A.anchor('saddle', [0, 2.31, -0.13]); A.anchor('pack', [0, 2.27, -0.13]); A.anchor('bridle', [0, 1.98, 1.62]);
    A.anchor('lead', [0, 1.95, 1.75]); A.anchor('chest', [0, 1.5, 0.7]);
  }
});
