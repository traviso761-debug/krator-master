/* ======================================================================
   Krator Fauna: flyers (kits/fauna/krator-fauna-flyers.js)
   The riding flyers of the Beast Riders (LORE 6.6: the Quetzal, Wingclaw, Dragonfly and Nightwing tribes): the
   quetzalcoatlus, the giant bat, the giant archaeopteryx and the giant dragonfly. Ported from Mav's Refuge and Girder
   (src/84-flyers.js, "the models"): the same points, proportions and palette, in metres (the originals were already).

   The originals were one merged mesh each, posed in a vertex shader by a small skeleton (FLY bones: pivot, axis,
   parent; flyFold, the perched angles). Here the same skeleton poses the points at BUILD time (faFlRig): the default
   build is perched (pose 'perch' or anything but 'fly'), A.pose 'fly' builds the rest pose of the original, wings spread
   flat and legs trailing, for a host that flies the animal. The fauna runtime only turns parts, so a perched build
   flaps its folded wings in mode 'fly' (data.flap.fold is 0: the fold is in the geometry); build pose 'fly' to fly one.
   Perched stances: the quetzalcoatlus stands as azhdarchids did, on its hind feet and the hands of its folded wings;
   the bat stands on its wrists and feet with the fingers folded back along the forearm (the original hung it from a
   perch beam); the archaeopteryx stands on its feet, wings folded back along its flanks; the dragonfly rests on its
   six legs with its wings flat.
   ====================================================================== */
function faFlRot(q, a, th) {   /* q turned about the unit axis a by th (right hand, Rodrigues) */
  if (!th) return [q[0], q[1], q[2]];
  const c = Math.cos(th), s = Math.sin(th), d = a[0] * q[0] + a[1] * q[1] + a[2] * q[2];
  return [q[0] * c + (a[1] * q[2] - a[2] * q[1]) * s + a[0] * d * (1 - c), q[1] * c + (a[2] * q[0] - a[0] * q[2]) * s + a[1] * d * (1 - c),
    q[2] * c + (a[0] * q[1] - a[1] * q[0]) * s + a[2] * d * (1 - c)];
}
const faFlAdd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], faFlSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  faFlMul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], faFlLerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
  faFlCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  faFlLen = a => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]),
  faFlNorm = a => { const l = faFlLen(a); return l > 1e-9 ? [a[0] / l, a[1] / l, a[2] / l] : null; };
/* the original's shade(): toward white (f > 0) or toward a warm black (f < 0), in sRGB */
function faFlShade(hex, f) {
  const c = new THREE.Color(hex);
  if (f >= 0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x120f0a), -f);
  return c.getHex();
}
/* the skeleton of an original (bones [{p, a, par}], one angle per bone), then the animal's own placing: pitched nose-up
   by `pitch` about the shoulders (the original's perchPitch), lifted by stand, slid back by z0 (origin under the body).
   R.P(p, bone, side) poses a LEFT-side point and mirrors it for side -1 (the original's mirrored bones do the same). */
function faFlRig(bones, F, pitch) {
  const R = { stand: 0, z0: 0 };
  const pose = (p, b) => {
    let q = [p[0], p[1], p[2]];
    while (b != null && b >= 0) { const B = bones[b], v = faFlRot(faFlSub(q, B.p), B.a, F[b] || 0); q = faFlAdd(B.p, v); b = B.par; }
    return q;
  };
  R.raw = (p, b) => faFlRot(pose(p, b), [1, 0, 0], -pitch);
  R.P = (p, b, s) => { const q = R.raw(p, b); return [q[0] * (s || 1), q[1] + R.stand, q[2] - R.z0]; };
  return R;
}
/* a membrane or feather vane: the polygon fanned from its first point, as two sheets a hair apart facing away from each
   other (the families' materials are one-sided; hair is double-sided but carries the hair grain) */
function faFlFan(A, fam, pts, col, col2, off) {
  off = off == null ? 0.006 : off; const p0 = pts[0];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], n = faFlNorm(faFlCross(faFlSub(a, p0), faFlSub(b, p0)));
    if (!n) continue;
    for (const sd of [1, -1]) {   /* sd 1: the face toward +n, laid a hair toward +n */
      const o = faFlMul(n, off * sd), q0 = faFlAdd(p0, o), qa = faFlAdd(a, o), qb = faFlAdd(b, o);
      A.sheet(fam, (u, v) => { const w = sd > 0 ? 1 - v : v, e = faFlLerp(qa, qb, w); return faFlLerp(q0, e, u); }, 1, 1, sd > 0 ? col : (col2 == null ? col : col2));
    }
  }
}
/* a vane of a double-sided family (membrane, feather): the same fan as ONE sheet, its triangles paired into quads
   (pi, pi+1, p0) and (p0, pi+1, pi+2), half the triangles of faFlFan's two sheets and none of them degenerate but an odd
   last one; one colour for both faces */
function faFlVane(A, fam, pts, col) {
  const p0 = pts[0];
  for (let i = 1; i < pts.length - 1; i += 2) {
    const a = pts[i], b = pts[i + 1], c = pts[i + 2] || b;
    A.sheet(fam, (u, v) => u ? (v ? c : p0) : (v ? b : a), 1, 1, col);
  }
}
function faFlRod(A, fam, a, b, r0, r1, col, seg) { A.cone(fam, a, b, r0, r1, col, seg || 6); }

/* ================================================================ QUETZALCOATLUS: span 12 m
   The original (84-flyers.js, "QUETZALCOATLUS"): bones neck, headP, headY, wing sweep, flap, twist at the shoulder S,
   outer sweep and flap at the wrist W, the legs at the hip H. Perched: the original's fold (neck up, head down, the
   arm down, the wing finger folded back up at the wrist) with the arm swung on down to the ground and the pitch eased
   from 0.35 to 0.15, so it stands on its feet and the three small fingers of each hand; the hand membrane is furled
   toward the wing finger. */
const FA_FL_Q = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], NK = [0, 0.12, 0.5], HD = [0, 0.30, 3.3], S = [0.35, 0.10, 0.25], W = [2.55, 0.10, 0.80], H = [0.22, -0.15, -1.05];
  return { NK: NK, HD: HD, S: S, W: W, H: H,
    bones: [{ p: NK, a: X, par: -1 }, { p: HD, a: X, par: 0 }, { p: HD, a: Y, par: 1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: W, a: Y, par: 5 }, { p: W, a: Z, par: 6 }, { p: H, a: X, par: -1 }],
    /*                 neck  headP headY wSw  wFlap wTw  oSw  oFlap leg */
    perch: { F: [-0.85, 1.05, 0, 0.30, -1.50, -0.30, -0.20, 2.60, -1.00], pitch: 0.15 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.6 } };
})();
ANIMAL({
  key: 'quetzalcoatlus', name: 'Quetzalcoatlus', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'defensive',
    habitat: ['sky', 'canopy', 'ground', 'shallows'], locomotion: ['flies', 'glides', 'walks'] },
  size: { length: 7.5, height: 5.6, span: 12 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '129-162, 335-340', note: 'first drawn here (FLY_Q): the Quetzal tribe\'s mount, kept in the Rookery and the hold roosts; ridden on circuits and patrols, roost traffic in the hypertrees' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '133-167, 349-354', note: 'the same model ported 2026-10-01 (plus the detail-atlas slots): 68 roost stalls on the four tower roof decks' },
    { build: 'kits/ringsea', file: 'src/75-rs-beast-rookery.js', lines: '12-19, 38-39', note: 'rsFlyer, "a great crested flyer" (10 m span, long beak, red crest): a teal-green stand-in for this animal on the Rookery Raft, three folded on the roost tower and one with wings open' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 90, note: 'dressed; the riders never eat a flyer, the jungle\'s other peoples do' },
    hide: { amount: 1, hideM2: 7, note: 'the wing membranes, tanned thin: kite and drum skins' },
    horn: { amount: 4, note: 'the beak sheath and crest' },
    eggs: { amount: 2, note: 'a clutch of two a year, laid, not eaten: the rookeries hatch every egg' } },
  life: { maturity: 6, lifespan: 45, litter: 2, gestation: 80, note: 'eggs (gestation: days of incubation); a chick is ridden from its sixth year' },
  poses: ['perch', 'fly'],
  w: 2.3, d: 6.3, h: 5.8,
  data: { mass: 280, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.6, run: 4, fly: [18, 24] }, gait: { type: 'flyer', freq: 0.8, stride: 1.4 },
    flap: { freq: 0.7, amp: 0.62, glide: 0.6, fold: 0 }, grazePitch: 1.0,
    herd: 'a pair in the wild; a rookery keeps 20 to 70 in stalls', fleeDistance: 12, aggression: 0.35,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'FLY', 'HUNT', 'PATROL', 'FLY', 'REST', 'REST', 'REST', 'PATROL', 'FLY', 'HUNT', 'FLY', 'IDLE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const Q = FA_FL_Q, fly = A.pose === 'fly', pz = fly ? Q.fly : Q.perch, F = pz.F, R = faFlRig(Q.bones, F, pz.pitch);
    R.stand = fly ? pz.stand : 0.16 - R.raw([0.27, -0.20, -2.92], 8)[1];
    R.z0 = R.raw([0, -0.05, -0.35], -1)[2];
    const P = R.P, C = [0xc8b48a, 0x8a5a3a, 0xd86a3a], body = C[0], belly = faFlShade(C[0], 0.25), dark = faFlShade(C[0], -0.35),
      mem = C[1], mem2 = faFlShade(C[1], -0.18), crest = C[2], beak = faFlShade(C[0], 0.35), eye = 0x181410;
    /* ---- the body: a fuzzed barrel, its belly paler */
    const bc = P([0, -0.05, -0.35], -1);
    A.ellip('coat', bc[0], bc[1], bc[2], 0.42, 0.40, 0.98, null, { rx: -pz.pitch, seg: 16, colf: (x, y) => y < -0.12 ? belly : body });
    A.part('tail', P([0, -0.05, -1.25], -1), () => faFlRod(A, 'coat', P([0, -0.05, -1.25], -1), P([0, -0.02, -1.75], -1), 0.12, 0.01, body, 8));
    /* ---- the head with its long neck, the dagger beak and the crest */
    const hx = F[0] + F[1] - pz.pitch;
    A.part('head', P(Q.NK, 0), () => {
      A.tube('coat', t => P(faFlLerp([0, 0.12, 0.40], [0, 0.30, 3.32], t), 0), t => { const r = 0.21 - 0.08 * t; return [r, r * 1.05]; }, 6, 10, body);
      const hc = P([0, 0.37, 3.62], 2);
      A.ellip('coat', hc[0], hc[1], hc[2], 0.17, 0.21, 0.45, body, { rx: hx, seg: 12 });
      faFlRod(A, 'horn', P([0, 0.40, 3.90], 2), P([0, 0.30, 5.75], 2), 0.15, 0.005, beak, 8);
      faFlFan(A, 'skin', [[0, 0.52, 3.35], [0, 1.12, 3.05], [0, 1.00, 3.80], [0, 0.56, 4.15]].map(p => P(p, 2)), crest, crest, 0.012);
      for (const s of [1, -1]) { const e = P([0.15, 0.42, 3.72], 2, s); A.ellip('eye', e[0], e[1], e[2], 0.035, 0.035, 0.05, eye, { rx: hx, seg: 8 }); }
    });
    A.part('jaw', P([0, 0.26, 3.70], 2), () => faFlRod(A, 'horn', P([0, 0.24, 3.85], 2), P([0, 0.24, 5.55], 2), 0.09, 0.005, beak, 7));
    /* ---- the wings: the arm (humerus to the hand) with the brachial membrane, then the great wing finger */
    const tipLine = [Q.W, [6.0, 0.10, -0.50]];
    const furl = p => {   /* perched: the hand membrane drawn in toward the wing finger */
      if (fly) return p;
      const d = faFlNorm(faFlSub(tipLine[1], tipLine[0])), q = faFlSub(p, tipLine[0]), k = q[0] * d[0] + q[1] * d[1] + q[2] * d[2], f = faFlAdd(tipLine[0], faFlMul(d, k));
      return faFlAdd(f, faFlMul(faFlSub(p, f), 0.14));
    };
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(Q.S, 5, s), () => {
      const Wp = P(Q.W, 5, s);
      faFlRod(A, 'coat', P(Q.S, 5, s), Wp, 0.13, 0.085, body, 8);
      /* the brachial membrane; perched, its body edge stays on the flank and its trailing edge is furled to the arm */
      const arm = p => { if (fly) return P(p, 5, s); const d = faFlNorm(faFlSub(Q.W, Q.S)), q = faFlSub(p, Q.S), k = q[0] * d[0] + q[1] * d[1] + q[2] * d[2], f = faFlAdd(Q.S, faFlMul(d, k));
        return P(faFlAdd(f, faFlMul(faFlSub(p, f), 0.14)), 5, s); };
      faFlVane(A, 'membrane', [fly ? P([0.35, 0.06, 0.30], 5, s) : P([0.33, 0.0, 0.25], -1, s), Wp, arm([2.62, 0.06, -0.78]), arm([1.55, 0.06, -0.95]),
        fly ? P([0.30, 0.02, -1.25], 5, s) : P([0.36, -0.02, 0.04], -1, s)], mem);
      faFlVane(A, 'membrane', [[0.35, 0.06, 0.30], [0.25, 0.10, 0.65], Q.W].map(p => P(p, 5, s)), mem2);
      /* the hand: three small clawed fingers (on the ground when perched) */
      if (fly) for (const c of [[2.62, 0.10, 1.12], [2.80, 0.10, 0.78], [2.72, 0.10, 0.95]]) faFlRod(A, 'horn', Wp, P(c, 5, s), 0.035, 0.008, dark, 5);
      else for (const o of [[-0.06, 0.30], [0.05, 0.27], [0.14, 0.18]]) faFlRod(A, 'horn', Wp, [Wp[0] + s * o[0], 0.02, Wp[2] + o[1]], 0.04, 0.012, dark, 5);
      faFlRod(A, 'coat', P(Q.W, 7, s), P(tipLine[1], 7, s), 0.075, 0.015, body, 7);
      faFlVane(A, 'membrane', [Q.W, [4.3, 0.07, 0.18], [4.75, 0.06, -0.72], [3.60, 0.06, -0.88], [2.62, 0.06, -0.78]].map(p => P(furl(p), 7, s)), mem);
      faFlVane(A, 'membrane', [[4.3, 0.07, 0.18], tipLine[1], [4.75, 0.06, -0.72]].map(p => P(furl(p), 7, s)), mem2);
    });
    /* ---- the legs: thigh and shank on one bone; the foot flat on the ground when perched */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(Q.H, 8, s), () => {
      const kn = P([0.27, -0.18, -2.05], 8, s), an = P([0.27, -0.20, -2.92], 8, s);
      faFlRod(A, 'coat', P(Q.H, 8, s), kn, 0.12, 0.07, body, 8);
      faFlRod(A, 'skin', kn, an, 0.07, 0.04, dark, 7);
      if (fly) faFlRod(A, 'skin', an, P([0.27, -0.12, -3.3], 8, s), 0.05, 0.01, dark, 5);
      else { faFlRod(A, 'skin', an, [an[0], 0.03, an[2] - 0.05], 0.045, 0.04, dark, 6);
        for (const o of [[-0.08, 0.32], [0, 0.38], [0.08, 0.32]]) faFlRod(A, 'horn', [an[0], 0.04, an[2] - 0.02], [an[0] + s * o[0], 0.015, an[2] + o[1]], 0.035, 0.01, dark, 5); }
    });
    A.anchor('saddle', P([0, 0.40, 0.10], -1)); A.anchor('bridle', P([0, 0.30, 3.3], 0));
  }
});

/* ================================================================ GIANT BAT: span 9 m
   The original ("GIANT BAT"): the arm in three (humerus S-E, forearm E-W, the three long fingers at the wrist W), the
   leg at H, ears on the head. Flight (pose 'fly'): the original's rest pose. Perched: the original hung it from a beam
   (perchPitch -90 degrees); here it stands as a bat crawls, on its wrists and feet, the elbows high, the fingers
   folded back along the forearm and down the flank with the membrane furled between them. */
const FA_FL_B = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], S = [0.40, 0.10, 0.20], E = [1.50, 0.10, -0.10], W = [2.60, 0.10, 0.60], H = [0.20, -0.10, -1.0], HD = [0, 0.10, 0.65];
  return { S: S, E: E, W: W, H: H, HD: HD, T: [[4.5, 0.10, -0.10], [3.95, 0.10, -1.35], [3.05, 0.10, -1.75]], K: [2.72, 0.06, -1.62], J: [1.40, 0.04, -1.50],
    bones: [{ p: HD, a: X, par: -1 }, { p: HD, a: Y, par: 0 }, { p: HD, a: X, par: -1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: E, a: Z, par: 5 }, { p: W, a: Y, par: 6 }, { p: W, a: Z, par: 7 }, { p: H, a: X, par: -1 }],
    perch: { F: [0.12, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0.15, stand: 0.70 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.3 } };
})();
ANIMAL({
  key: 'giant-bat', name: 'Giant bat', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'insectivore', activity: 'nocturnal', temperament: 'wary',
    habitat: ['sky', 'canopy', 'trunks'], locomotion: ['flies', 'climbs', 'walks'] },
  size: { length: 2.6, height: 2.2, span: 9 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '164-199, 335-340', note: 'first drawn here (FLY_B): the Nightwing tribe\'s mount; hangs from the roost beams by day, hunts through the night on sim-time timers and comes home staggered' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '169-205, 349-354', note: 'the same model (plus the detail-atlas slots) on Girder\'s roof-deck roosts' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 45, note: 'dressed; not eaten by the riders' },
    hide: { amount: 1, hideM2: 5, note: 'the dark fur pelt with the wing membranes: night cloaks' },
    hair: { amount: 0.4, note: 'the soft underfur, moulted at the end of the rains: felt' } },
  life: { maturity: 3, lifespan: 30, litter: 1, gestation: 160, note: 'one pup a year, carried in flight for its first month' },
  poses: ['perch', 'fly'],
  w: 2.5, d: 3.4, h: 2.0,
  data: { mass: 140, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.0, run: 2.5, fly: [12, 16] }, gait: { type: 'flyer', freq: 1.2, stride: 0.6 },
    flap: { freq: 2.0, amp: 0.78, glide: 0.1, fold: 0 }, grazePitch: 0.5,
    herd: 'a colony of 30 to 200 in a hollow trunk; the riders keep them on roost beams', fleeDistance: 10, aggression: 0.2,
    schedule: ['HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'FLY', 'HUNT', 'HUNT', 'PATROL', 'HUNT', 'HUNT'] },
  build: function (A) {
    const B = FA_FL_B, fly = A.pose === 'fly', pz = fly ? B.fly : B.perch, F = pz.F, R = faFlRig(B.bones, F, pz.pitch);
    R.stand = pz.stand;
    R.z0 = R.raw([0, 0, -0.10], -1)[2];
    const P = R.P, C = [0x3a2e2a, 0x5a4238, 0x8a6a5a], fur = C[0], fur2 = C[1], mem = faFlShade(C[1], -0.1), mem2 = faFlShade(C[1], -0.3), bone = C[2], ear = faFlShade(C[2], -0.3), eye = 0x0c0a08;
    /* ---- the body: the barrel and the deep chest */
    let c = P([0, 0, -0.30], -1); A.ellip('coat', c[0], c[1], c[2], 0.45, 0.42, 0.88, fur, { rx: -pz.pitch, seg: 14 });
    c = P([0, 0.06, 0.28], -1); A.ellip('coat', c[0], c[1], c[2], 0.54, 0.47, 0.46, fur2, { rx: -pz.pitch, seg: 14 });
    /* ---- the head: a fox face, the ears its own parts */
    const hx = F[0] - pz.pitch;
    A.part('head', P(B.HD, 0), () => {
      const h = P([0, 0.20, 0.98], 1); A.ellip('coat', h[0], h[1], h[2], 0.28, 0.27, 0.36, fur, { rx: hx, seg: 12 });
      faFlRod(A, 'coat', P([0, 0.13, 1.20], 1), P([0, 0.10, 1.55], 1), 0.14, 0.07, fur2, 8);
      const n = P([0, 0.11, 1.56], 1); A.ellip('skin', n[0], n[1], n[2], 0.06, 0.045, 0.03, 0x1a1412, { rx: hx, seg: 8 });
      for (const s of [1, -1]) { const e = P([0.19, 0.25, 1.22], 1, s); A.ellip('eye', e[0], e[1], e[2], 0.04, 0.035, 0.03, eye, { rx: hx, seg: 8 }); }
    });
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', P([0.2, 0.38, 0.95], 1, s), () => {
      faFlVane(A, 'membrane', [[0.10, 0.36, 0.92], [0.46, 1.12, 0.84], [0.32, 0.40, 1.10]].map(p => P(p, 1, s)), ear);
      faFlFan(A, 'coat', [[0.12, 0.36, 0.90], [0.44, 1.02, 0.82], [0.30, 0.38, 0.86]].map(p => P(p, 1, s)), fur, fur, 0.012);
    });
    /* ---- the wings (membrane: the wing skin, one double-sided sheet per panel) */
    const Ln = B.T.map(t => faFlLen(faFlSub(t, B.W)));
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(B.S, 5, s), () => {
      const M = p => [p[0] * s, p[1], p[2]];
      if (fly) {
        const S = P(B.S, 5, s), E = P(B.E, 6, s), W = P(B.W, 8, s), T = B.T.map(t => P(t, 8, s)), K = P(B.K, 6, s), J = P(B.J, 5, s), F1 = P([1.9, 0.09, 0.42], 5, s);
        faFlRod(A, 'coat', S, E, 0.11, 0.08, fur2, 7);
        faFlVane(A, 'membrane', [P([0.40, 0.06, 0.15], 5, s), E, J, P([0.30, 0.0, -1.15], 5, s)], mem);
        faFlVane(A, 'membrane', [P([0.40, 0.08, 0.30], 5, s), F1, E], mem2);
        faFlRod(A, 'coat', E, W, 0.08, 0.06, fur2, 7);
        faFlVane(A, 'membrane', [E, W, K, J], mem);
        faFlVane(A, 'membrane', [E, F1, W], mem2);
        faFlRod(A, 'horn', W, P([2.70, 0.13, 0.98], 8, s), 0.045, 0.01, bone, 5);
        for (let i = 0; i < 3; i++) faFlRod(A, 'skin', W, T[i], 0.045, 0.012, bone, 5);
        faFlVane(A, 'membrane', [W, T[0], P([4.0, 0.07, -0.62], 8, s), T[1]], mem);
        faFlVane(A, 'membrane', [W, T[1], P([3.38, 0.07, -1.38], 8, s), T[2]], mem2);
        faFlVane(A, 'membrane', [W, T[2], K], mem);
        return;
      }
      /* grounded, as a bat crawls: the humerus up and back to an elbow just over the back line, the forearm angled
         down and forward to the wrist beside the chest, the thumb claw planted ahead of it; each finger folded in a Z
         tight along the back of the forearm (metacarpal up to the elbow, the phalanges back down toward the wrist), the
         membrane furled between them; the flank membrane draped from the arm to the knee against the body */
      const S = P(B.S, -1, s), E = M([0.98, 1.22, -0.36]), W = M([1.02, 0.20, 0.42]),
        up = faFlNorm(faFlSub(E, W)), out = M([1, 0, 0]), Jn = [], Tp = [];
      faFlRod(A, 'coat', S, E, 0.11, 0.08, fur2, 7);
      faFlRod(A, 'coat', E, W, 0.08, 0.06, fur2, 7);
      faFlRod(A, 'horn', W, M([1.07, 0.015, 0.70]), 0.05, 0.012, bone, 5);
      for (let i = 0; i < 3; i++) {
        const o = faFlAdd(faFlMul(out, 0.05 + 0.04 * i), [0, -0.015 * i, -0.04 - 0.035 * i]);
        const j = faFlAdd(faFlAdd(W, faFlMul(up, Math.min(0.55 * Ln[i], 1.18))), o);
        const t = faFlAdd(faFlAdd(j, faFlMul(up, -0.42 * Ln[i])), faFlAdd(faFlMul(out, 0.035), [0, 0, -0.03]));
        faFlRod(A, 'skin', W, j, 0.04, 0.028, bone, 5); faFlRod(A, 'skin', j, t, 0.028, 0.01, bone, 5);
        Jn.push(j); Tp.push(t);
      }
      for (let i = 0; i < 2; i++) { faFlVane(A, 'membrane', [W, Jn[i], Jn[i + 1]], i ? mem2 : mem); faFlVane(A, 'membrane', [Jn[i], Tp[i], Tp[i + 1], Jn[i + 1]], i ? mem2 : mem); }
      faFlVane(A, 'membrane', [W, faFlLerp(W, E, 0.92), Jn[0]], mem2);
      /* the flank membrane: from the shoulder along the humerus to the elbow, then drawn in against the flank (a slack
         fold a hand outside the body) and back to the thigh */
      const kn = FA_FL_B.knee(P, s), an = FA_FL_B.ankle(P, s);
      faFlVane(A, 'membrane', [P([0.42, 0.04, 0.10], -1, s), E, M([0.50, 0.66, -0.72]), faFlLerp(P(B.H, 9, s), kn, 0.55), P([0.36, 0.0, -0.95], -1, s)], mem);
      faFlVane(A, 'membrane', [P([0.40, 0.08, 0.30], -1, s), faFlLerp(S, E, 0.55), E], mem2);
    });
    /* ---- the legs: perched, knees up and out, the feet turned back (a bat's are) */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(B.H, 9, s), () => {
      const Hp = P(B.H, 9, s);
      if (fly) {
        const an = P([0.32, -0.10, -1.95], 9, s);
        faFlRod(A, 'coat', Hp, an, 0.08, 0.04, fur2, 7);
        for (const x of [0.25, 0.32, 0.39]) faFlRod(A, 'horn', an, P([x, -0.06, -2.22], 9, s), 0.025, 0.006, bone, 4);
        return;
      }
      const kn = FA_FL_B.knee(P, s), an = FA_FL_B.ankle(P, s);
      faFlRod(A, 'coat', Hp, kn, 0.09, 0.06, fur2, 7); faFlRod(A, 'coat', kn, an, 0.06, 0.04, fur2, 7);
      for (const x of [-0.06, 0, 0.06]) faFlRod(A, 'horn', an, [an[0] + s * x, 0.012, an[2] - 0.2], 0.03, 0.008, bone, 4);
    });
    /* ---- the tail membrane between the legs */
    for (const s of [1, -1]) {
      if (fly) faFlVane(A, 'membrane', [[0, -0.04, -1.0], [0.30, 0.0, -1.15], [0.32, -0.06, -1.9], [0, -0.06, -1.55]].map(p => P(p, 9, s)), mem2);
      else { const an = FA_FL_B.ankle(P, s), kn = FA_FL_B.knee(P, s), m = P([0, -0.06, -1.15], -1);
        faFlVane(A, 'membrane', [m, P([0.22, -0.06, -1.05], -1, s), faFlLerp(kn, an, 0.4), an, [0, an[1] + 0.22, an[2] - 0.12]], mem2); }
    }
    A.anchor('saddle', P([0, 0.44, -0.15], -1));
  }
});
/* the perched bat's knee and ankle (shared by the leg, the flank membrane and the tail membrane) */
FA_FL_B.knee = (P, s) => { const h = P(FA_FL_B.H, 9, s); return [h[0] + s * 0.42, h[1] + 0.12, h[2] - 0.30]; };
FA_FL_B.ankle = (P, s) => { const k = FA_FL_B.knee(P, s); return [k[0] + s * 0.06, 0.07, k[2] - 0.32]; };

/* ================================================================ GIANT ARCHAEOPTERYX: span 7 m
   The original ("GIANT ARCHAEOPTERYX"): a feathered raptor-bird, blue with rust flight feathers and a cream belly, a
   toothed snout and the long feathered tail of the real animal; three claws on each wing. Perched: the original's fold
   (wings swept back along the flanks, the tail raised, pitched up 0.5), standing on bird's feet. */
const FA_FL_A = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], S = [0.35, 0.15, 0.20], W = [1.70, 0.15, 0.52], H = [0.22, -0.20, -0.70], NK = [0, 0.15, 0.40], HD = [0, 0.58, 1.15], TL = [0, 0.0, -1.15];
  return { S: S, W: W, H: H, NK: NK, HD: HD, TL: TL,
    bones: [{ p: NK, a: X, par: -1 }, { p: HD, a: Y, par: 10 }, { p: TL, a: X, par: -1 }, { p: S, a: Y, par: -1 }, { p: S, a: Z, par: 3 }, { p: S, a: X, par: 4 },
      { p: W, a: Y, par: 5 }, { p: W, a: Z, par: 6 }, { p: H, a: X, par: -1 }, { p: TL, a: Y, par: 2 }, { p: HD, a: X, par: 0 }],
    /* bone 10 (not in the original): the head pitched down on the neck when perched, so the snout looks ahead, not up
                       neck headY tailP wSw  wFlap  wTw  oSw   oFlap leg   tailY */
    perch: { F: [-0.05, 0, 0.20, 1.25, -0.38, 0.15, 0.22, 0.10, -1.27, 0, 0.45], pitch: 0.30 },
    fly: { F: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], pitch: 0, stand: 1.2 } };
})();
ANIMAL({
  key: 'giant-archaeopteryx', name: 'Giant archaeopteryx', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['sky', 'canopy', 'trunks', 'ground'], locomotion: ['flies', 'glides', 'climbs', 'walks', 'runs'] },
  size: { length: 7.5, height: 3.7, span: 7 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '201-246, 335-340', note: 'first drawn here (FLY_A): the Wingclaw tribe\'s mount; roost traffic and Rookery training circuits' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '207-249, 349-354', note: 'the same model (plus the detail-atlas slots: feathers, scaled skin) on Girder\'s roof-deck roosts' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 55, note: 'dressed; not eaten by the riders' },
    hide: { amount: 1, hideM2: 2.5, note: 'the scaled leg and snout skin is the only leather' },
    feathers: { amount: 1.6, note: 'the moult of flight and tail feathers: fletching, the riders\' plumes (library card.feather.archae)' },
    eggs: { amount: 3, note: 'a clutch of three a year, hatched in the rookeries, not eaten' } },
  life: { maturity: 3, lifespan: 22, litter: 3, gestation: 50, note: 'eggs (gestation: days of incubation)' },
  poses: ['perch', 'fly'],
  w: 2.8, d: 7.2, h: 3.5,
  data: { mass: 160, legs: 2, wings: 1, budget: 9000, speed: { walk: 1.5, run: 7, fly: [14, 20] }, gait: { type: 'flyer', freq: 1.2, stride: 0.9 },
    flap: { freq: 1.4, amp: 0.8, glide: 0.35, fold: 0 }, grazePitch: 0.85,
    herd: 'alone or a mated pair; the rookeries keep them in single stalls, apart', fleeDistance: 6, aggression: 0.55,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'HUNT', 'FLY', 'PATROL', 'HUNT', 'REST', 'REST', 'IDLE', 'PATROL', 'FLY', 'HUNT', 'HUNT', 'IDLE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const Q = FA_FL_A, fly = A.pose === 'fly', pz = fly ? Q.fly : Q.perch, F = pz.F, R = faFlRig(Q.bones, F, pz.pitch);
    R.stand = fly ? pz.stand : 0.12 - R.raw([0.26, -0.30, -2.20], 8)[1];
    R.z0 = R.raw([0, 0, -0.80], -1)[2];
    const P = R.P, C = [0x2a4a7a, 0xb8683e, 0xe8d8a0], blue = C[0], blue2 = faFlShade(C[0], 0.22), rust = C[1], rust2 = faFlShade(C[1], -0.22), cream = C[2],
      eye = 0x100c08, skin = faFlShade(C[2], -0.35);
    const bc = P([0, 0, -0.35], -1);
    A.ellip('feather', bc[0], bc[1], bc[2], 0.40, 0.42, 0.92, null, { rx: -pz.pitch, seg: 16, colf: (x, y) => y < -0.12 ? cream : blue });
    /* ---- the head and neck: a toothed snout, a rust crest. The neck an arc: up from the shoulders, then forward into the
       head, thicker (the original's straight rod, held near upright perched, read as a long thin stalk) */
    const hx = F[0] + F[10] - pz.pitch;
    A.part('head', P(Q.NK, 0), () => {
      A.tube('feather', t => P(faFlLerp(faFlLerp([0, 0.10, 0.30], [0, 0.50, 0.78], t), faFlLerp([0, 0.50, 0.78], [0, 0.62, 1.22], t), t), 0),
        t => { const r = 0.27 - 0.11 * t; return [r, r * 1.1]; }, 6, 10, blue, { caps: true });
      const h = P([0, 0.64, 1.36], 1); A.ellip('feather', h[0], h[1], h[2], 0.19, 0.19, 0.31, blue2, { rx: hx, seg: 12 });
      faFlRod(A, 'scale', P([0, 0.64, 1.52], 1), P([0, 0.57, 2.20], 1), 0.11, 0.035, skin, 8);
      faFlVane(A, 'feather', [[0, 0.78, 1.30], [0, 1.02, 0.95], [0, 0.80, 1.05]].map(p => P(p, 1)), rust);
      for (const s of [1, -1]) {
        const e = P([0.15, 0.68, 1.46], 1, s); A.ellip('eye', e[0], e[1], e[2], 0.035, 0.035, 0.045, eye, { rx: hx, seg: 8 });
        for (let t = 0; t < 3; t++) { const tz = 1.68 + t * 0.16; faFlRod(A, 'horn', P([0.06, 0.56, tz + 0.05], 1, s), P([0.05, 0.47, tz + 0.05], 1, s), 0.022, 0.003, cream, 4); }
      }
    });
    A.part('jaw', P([0, 0.53, 1.45], 1), () => faFlRod(A, 'scale', P([0, 0.53, 1.50], 1), P([0, 0.50, 2.10], 1), 0.07, 0.025, skin, 7));
    /* ---- the tail: a bony rod fringed with six pairs of feathers and a fan at the tip */
    A.part('tail', P(Q.TL, 9), () => {
      faFlRod(A, 'feather', P(Q.TL, 9), P([0, 0, -4.35], 9), 0.13, 0.02, blue, 8);
      /* each pair a hair above the one before, so the overlaps do not fight */
      for (const s of [1, -1]) {
        for (let i = 0; i < 6; i++) { const zb = -1.45 - i * 0.52, w = 0.50 + i * 0.05, y = 0.004 + 0.008 * i;
          faFlVane(A, 'feather', [[0.02, y, zb], [w, y, zb - 0.62], [w - 0.05, y, zb - 0.95], [0.02, y, zb - 0.34]].map(p => P(p, 9, s)), (i % 2) ? rust : blue2); }
        faFlVane(A, 'feather', [[0.02, 0.056, -4.3], [0.34, 0.056, -5.05], [0.12, 0.056, -5.35], [0, 0.056, -4.6]].map(p => P(p, 9, s)), rust2);
      }
    });
    /* ---- the wings: the arm with the secondaries and coverts, the hand with three claws and five primaries */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', P(Q.S, 5, s), () => {
      faFlRod(A, 'feather', P(Q.S, 5, s), P(Q.W, 5, s), 0.12, 0.07, blue, 7);
      faFlVane(A, 'feather', [[0.35, 0.12, 0.22], Q.W, [1.82, 0.12, -0.98], [1.10, 0.12, -1.08], [0.40, 0.10, -1.0]].map(p => P(p, 5, s)), rust);
      faFlVane(A, 'feather', [[0.35, 0.17, 0.24], [1.70, 0.17, 0.50], [1.74, 0.17, -0.30], [0.40, 0.17, -0.38]].map(p => P(p, 5, s)), blue);
      faFlRod(A, 'feather', P(Q.W, 7, s), P([2.65, 0.15, 0.22], 7, s), 0.06, 0.03, blue, 6);
      for (let c = 0; c < 3; c++) faFlRod(A, 'horn', P([1.78 + c * 0.12, 0.15, 0.49 - c * 0.03], 7, s), P([1.86 + c * 0.12, 0.13, 0.86 - c * 0.05], 7, s), 0.03, 0.004, cream, 4);
      const tips = [[3.5, 0.15, -0.42], [3.38, 0.14, -1.02], [3.02, 0.13, -1.38], [2.60, 0.12, -1.52], [2.18, 0.11, -1.46]];
      for (let f = 0; f < 5; f++) { const k = f / 5 * 0.72, r0 = [Q.W[0] + (2.65 - Q.W[0]) * k, 0.15 - f * 0.008, Q.W[2] + (0.22 - Q.W[2]) * k], r1 = [r0[0] - 0.22, r0[1], r0[2] - 0.12], tp = tips[f];
        faFlVane(A, 'feather', [r0, [tp[0] + 0.10, tp[1], tp[2] + 0.16], [tp[0] - 0.12, tp[1], tp[2] - 0.10], r1].map(p => P(p, 7, s)), (f % 2) ? rust2 : rust); }
      faFlVane(A, 'feather', [[1.70, 0.19, 0.50], [2.65, 0.19, 0.22], [2.45, 0.19, -0.38], [1.74, 0.19, -0.30]].map(p => P(p, 7, s)), blue2);
    });
    /* ---- the legs: feathered thighs, scaled shanks; three toes forward and one back on the ground */
    for (const s of [1, -1]) A.part(s > 0 ? 'leg0' : 'leg1', P(Q.H, 8, s), () => {
      const kn = P([0.26, -0.30, -1.48], 8, s), an = P([0.26, -0.30, -2.20], 8, s);
      A.tube('feather', t => faFlLerp(P(Q.H, 8, s), kn, t), t => { const r = 0.25 - 0.15 * t; return [r * 0.8, r]; }, 3, 10, blue, { caps: true });
      faFlRod(A, 'scale', kn, an, 0.07, 0.045, cream, 7);
      if (fly) { faFlRod(A, 'horn', an, P([0.26, -0.24, -2.55], 8, s), 0.045, 0.008, cream, 5); return; }
      const g = [an[0], 0.05, an[2]];
      faFlRod(A, 'scale', an, g, 0.045, 0.04, skin, 6);
      for (const o of [[-0.12, 0.34], [0, 0.42], [0.12, 0.34], [0.02, -0.2]]) faFlRod(A, 'horn', g, [g[0] + s * o[0], 0.012, g[2] + o[1]], 0.035, 0.008, cream, 5);
    });
    A.anchor('saddle', P([0, 0.45, -0.15], -1));
  }
});

/* ================================================================ GIANT DRAGONFLY: 6 m body, 4 wings
   The original ("GIANT DRAGONFLY"): a teal and blue thorax and seven-ring abdomen, great compound eyes, six bristled
   legs, and four wings on a separate translucent mesh with veins and a pterostigma (a second, opposite-phase wing set
   drew the motion blur). Here each wing is one opaque double-sided membrane sheet (the fauna families have no
   transparent one; membrane takes the library's wing skin) and the blur set is left out; the forewings are wingL/wingR, the hindwings wing2L/wing2R. Perched: wings flat, the legs splayed. */
const FA_FL_D = (function () {
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1], AB = [0, 0, -0.45], AB2 = [0, 0, -2.55], LG = [0.30, -0.35, 0.45], FW = [0.28, 0.50, 0.78], HW = [0.28, 0.50, 0.12];
  return { AB: AB, AB2: AB2, LG: LG, FW: FW, HW: HW, HDP: [0, 0, 1.0],
    bones: [{ p: AB, a: X, par: -1 }, { p: AB2, a: X, par: 0 }, { p: LG, a: Z, par: -1 }, { p: FW, a: Z, par: -1 }, { p: HW, a: Z, par: -1 },
      { p: FW, a: Z, par: -1 }, { p: HW, a: Z, par: -1 }, { p: [0, 0, 1.0], a: Y, par: -1 }],
    /*                abd   abd2   legs  fw    hw */
    perch: { F: [-0.12, -0.10, -0.25, 0.04, -0.04, 0, 0, 0], pitch: 0 },
    fly: { F: [-0.04, -0.04, 0.45, 0, 0, 0, 0, 0], pitch: 0, stand: 1.6 } };
})();
ANIMAL({
  key: 'giant-dragonfly', name: 'Giant dragonfly', group: 'flyers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'riparian', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'skittish',
    habitat: ['sky', 'marsh', 'shallows', 'canopy'], locomotion: ['flies'] },
  size: { length: 6.9, height: 1.9, span: 7.3 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/84-flyers.js', lines: '248-294, 335-340', note: 'first drawn here (FLY_D, the wings flyWingGeom): the Dragonfly tribe\'s mount, the fastest of the four; patrols and transients over the canopy and the water' },
    { build: 'settlements/girder', file: 'src/84-flyers.js', lines: '251-307, 349-354', note: 'the same model; Girder adds the library wing sheet (materials.json family flywing, wing.dragonfly) on the wing cards' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { meat: { amount: 22, note: 'the flight muscle of the thorax, roasted in the shell; not eaten by the riders' } },
  life: { maturity: 2, lifespan: 5, litter: 300, gestation: 25, note: 'eggs laid in still water (gestation: days to hatch); two years a nymph in the marsh pools, then three on the wing' },
  poses: ['perch', 'fly'],
  w: 7.3, d: 7.0, h: 1.9,
  data: { mass: 90, legs: 6, wings: 2, budget: 9000, speed: { walk: 0.5, run: 1, fly: [25, 35] }, gait: { type: 'flyer', freq: 1.5, stride: 0.3 },
    flap: { freq: 9, amp: 0.5, glide: 0, fold: 0 }, grazePitch: 0.3,
    herd: 'alone, holding a stretch of water; the riders keep them in open stalls by the pools', fleeDistance: 15, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'REST', 'HUNT', 'FLY', 'HUNT', 'PATROL', 'HUNT', 'FLY', 'PATROL', 'HUNT', 'HUNT', 'REST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const D = FA_FL_D, fly = A.pose === 'fly', pz = fly ? D.fly : D.perch, F = pz.F, R = faFlRig(D.bones, F, pz.pitch);
    const legTip = l => { const z0 = 0.85 - l * 0.4, kx = 0.80 + l * 0.06; return [kx - 0.1, -1.12, z0 + 0.12 - l * 0.22]; };
    R.stand = fly ? pz.stand : 0.02 - Math.min(R.raw(legTip(0), 2)[1], R.raw(legTip(1), 2)[1], R.raw(legTip(2), 2)[1]);
    R.z0 = R.raw([0, 0, -1.2], -1)[2];
    const P = R.P, C = [0x2f8a7a, 0x3a5a9a, 0xd8f0f0], teal = C[0], teal2 = faFlShade(C[0], -0.3), blu = C[1], blu2 = faFlShade(C[1], 0.3), wing = C[2], vein = faFlShade(C[1], -0.45), legc = 0x1c1a16;
    /* ---- the thorax */
    const th = P([0, 0, 0.30], -1);
    A.ellip('chitin', th[0], th[1], th[2], 0.50, 0.56, 0.82, null, { rx: -pz.pitch, seg: 14, colf: (x, y) => y < -0.18 ? blu : teal });
    /* ---- the head: the great compound eyes meet over it */
    A.part('head', P(D.HDP, 7), () => {
      const h = P([0, 0.05, 1.28], 7); A.ellip('chitin', h[0], h[1], h[2], 0.36, 0.32, 0.30, teal2, { rx: -pz.pitch, seg: 12 });
      faFlRod(A, 'chitin', P([0, -0.10, 1.5], 7), P([0, -0.18, 1.78], 7), 0.16, 0.06, legc, 7);
      for (const s of [1, -1]) { const e = P([0.30, 0.13, 1.38], 7, s); A.ellip('eye', e[0], e[1], e[2], 0.30, 0.29, 0.30, blu2, { rx: -pz.pitch, seg: 12 }); }
    });
    /* ---- the abdomen: seven rings, the claspers at its tip */
    A.part('tail', P(D.AB, 0), () => {
      const zs = [-0.45, -1.2, -1.9, -2.6, -3.3, -4.0, -4.7], rs = [0.30, 0.24, 0.21, 0.19, 0.17, 0.15, 0.11];
      for (let i = 0; i < 6; i++) { const b = i < 3 ? 0 : 1;
        A.tube('chitin', t => P([0, 0, zs[i] + (zs[i + 1] + 0.06 - zs[i]) * t], b), t => { const r = rs[i] + (rs[i + 1] - rs[i]) * t, k = 1 - 0.12 * Math.sin(Math.PI * t); return [r * k, r * k]; }, 3, 8, (i % 2) ? blu : teal, { caps: true }); }
      for (const s of [1, -1]) faFlRod(A, 'chitin', P([0.05, 0, -4.66], 1, s), P([0.12, 0, -5.15], 1, s), 0.04, 0.008, legc, 4);
    });
    /* ---- the legs: three pairs, femur out and down, tibia down */
    for (let l = 0; l < 3; l++) for (const s of [1, -1]) {
      const z0 = 0.85 - l * 0.4, kx = 0.80 + l * 0.06, root = [0.30, -0.35, z0];
      A.part('leg' + (l * 2 + (s > 0 ? 0 : 1)), P(root, 2, s), () => {
        const kn = P([kx, -0.62, z0 - 0.18], 2, s);
        faFlRod(A, 'chitin', P(root, 2, s), kn, 0.06, 0.04, legc, 5);
        faFlRod(A, 'chitin', kn, P(legTip(l), 2, s), 0.04, 0.015, legc, 5);
      });
    }
    /* ---- the wings: fore and hind, each a seven-point vane with its veins and the dark pterostigma near the tip */
    const vane = (root, len, sweep, y) => {
      const z = root[2], dx = u => root[0] + len * u, dz = (u, o) => z + sweep * u + o;
      return [[root[0], y, z + 0.05], [dx(0.35), y, dz(0.35, 0.40)], [dx(0.85), y, dz(0.85, 0.36)], [dx(1.0), y, dz(1.0, 0.05)], [dx(0.88), y, dz(0.88, -0.36)], [dx(0.30), y, dz(0.30, -0.30)], [root[0], y, z - 0.08]];
    };
    const veins = { 3: [[[0.28, 0.52, 0.86], [3.2, 0.52, 1.42], [3.2, 0.52, 1.34], [0.28, 0.52, 0.78]], [[0.28, 0.52, 0.74], [3.3, 0.52, 0.92], [3.3, 0.52, 0.86], [0.28, 0.52, 0.68]]],
      4: [[[0.28, 0.52, 0.20], [3.0, 0.52, -0.02], [3.0, 0.52, -0.10], [0.28, 0.52, 0.12]], [[0.28, 0.52, 0.06], [3.1, 0.52, -0.42], [3.1, 0.52, -0.48], [0.28, 0.52, 0.0]]] };
    const stig = { 3: [[2.75, 0.52, 1.36], [3.15, 0.52, 1.42], [3.15, 0.52, 1.24], [2.75, 0.52, 1.18]], 4: [[2.6, 0.52, 0.02], [3.0, 0.52, -0.04], [3.0, 0.52, -0.22], [2.6, 0.52, -0.16]] };
    for (const [b, nm, root, len, sweep] of [[3, 'wing', D.FW, 3.35, 0.35], [4, 'wing2', D.HW, 3.15, -0.45]]) for (const s of [1, -1]) A.part(nm + (s > 0 ? 'L' : 'R'), P(root, b, s), () => {
      /* one double-sided membrane sheet; the veins and the pterostigma laid a hair above it and a hair below */
      faFlVane(A, 'membrane', vane(root, len, sweep, 0.50).map(p => P(p, b, s)), wing);
      for (const y of [0.508, 0.492]) {
        for (const v of veins[b]) faFlVane(A, 'membrane', v.map(p => P([p[0], y, p[2]], b, s)), vein);
        faFlVane(A, 'membrane', stig[b].map(p => P([p[0], y + (y > 0.5 ? 0.004 : -0.004), p[2]], b, s)), 0x2a2420);
      }
    });
    A.anchor('saddle', P([0, 0.58, 0.25], -1));
  }
});
