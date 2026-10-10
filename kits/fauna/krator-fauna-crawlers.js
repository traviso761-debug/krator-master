/* ======================================================================
   Krator Fauna: crawlers (kits/fauna/krator-fauna-crawlers.js)
   The many-legged beasts of the hyperjungle: the draught millipede that walks the beast lifts' capstans (Girder, Mav's
   Refuge) and is ranched by the Screamers, and the giant riding spider of Mav's Refuge. Ported 2026-10-06 from the
   settlements' own builders (the sources below); metres throughout (the source builds are already in metres).
   ====================================================================== */
/* a colour lerp the way Girder's and Mav's shade() does it: toward white (f > 0) or toward 0x120f0a (f < 0), sRGB hex */
function faCrShade(hex, f) {
  const to = f >= 0 ? 0xffffff : 0x120f0a, k = Math.abs(f);
  const ch = (h, s) => (h >> s) & 255, mix = s => Math.round(ch(hex, s) + (ch(to, s) - ch(hex, s)) * k);
  return (mix(16) << 16) | (mix(8) << 8) | mix(0);
}
function faCrLerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* ---------------------------------------------------------------- the draught millipede
   Girder's builder (78-life.js): 13 segments 0.56 m apart, each a 1.25 x 0.62 m chitin barrel (dark brown) under a wider,
   paler tergite plate (1.42 m, the paranota), an ochre collar on its front face and one leg pair (an ochre femur angled down
   and out, a darker tibia to the ground at x 1.12); the first segment carries the antennae and mandibles, the fourth the
   harness blanket and the capstan-bar block. Mav's Refuge draws the same segment. The Screamers' ranch herd (94-life.js) is
   a cruder chain of spheres, tapering to both ends, every third segment ochre: variant 1 keeps that taper and banding.
   Variant 2 (2026-10-07): the Ash Nomads' herd, Girder's segment unharnessed, its rings ash-grey and black with ochre bands. */
const FA_CR_MIL = { body: 0x4a2e22, accent: 0xb8683e, plate: faCrShade(0x4a2e22, 0.10), tibia: faCrShade(0xb8683e, -0.25),
  mand: faCrShade(0xb8683e, -0.15), leg2: 0x3a241c, cloth: 0x7a2028, timber: 0x4e3a28, eye: 0x120c08 };
const FA_CR_MIL_N = 13, FA_CR_MIL_D = 0.56;
ANIMAL({
  key: 'draught-millipede', name: 'Draught millipede', group: 'crawlers',
  tags: { biomes: ['hyperjungle', 'crater-drylands'], koppen: ['Af', 'Am', 'BSk'], aridity: ['humid', 'semiarid'], climate: ['hypertropic', 'tropic', 'temperate'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders', 'screamers', 'ashnomad'], diet: 'herbivore', feeding: 'detritivore', activity: 'cathemeral', temperament: 'docile',
    habitat: ['ground', 'trunks', 'pen'], locomotion: ['walks', 'climbs'] },
  size: { length: 7.3, height: 1.05 },
  source: [
    { build: 'settlements/girder', file: 'src/78-life.js', lines: '221-234', note: 'the segment (body, tergite, collar, leg pair; head and saddle bits): the richer model, ported here. Lines 480-498 and 553-558: one beast of 13 segments (0.56 m) per beast lift, walking the capstan round with a Millipede handler (the Beast Riders of Girder); src/55-arch.js 507-515: the millipede pen (shelter, trough, leaf-litter heaps, wallow)' },
    { build: 'settlements/mavs-refuge', file: 'src/78-life.js', lines: '188-203', note: 'the same segment (a saddle blanket on segment 4); lines 462-508: the beast lifts\' millipedes of the Refuge, each with a handler' },
    { build: 'settlements/screamers', file: 'src/94-life.js', lines: '152-207', note: 'the Screamers\' ranch herd: eight beasts of 13 sphere segments (radius to len x 0.085, len 13-25), tapering to both ends, every third segment ochre, box legs 0x3a241c, wandering at 2.2-4.6 m/s inside the stockade (variant 1 here). src/71-village.js 437-458: the millipede ranch (a double stockade, "because they climb"; troughs, shelter) and an unused static builder' },
    { build: 'kits/fauna', file: 'krator-fauna-crawlers.js', note: 'variant 2, the herd of the Ash Nomads (ash plains round the great volcano, 2026-10-07): first drawn here, the Girder segment in ash-grey, black and ochre; herded for chitin and grubs, never for carts' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: false },
  yields: { meat: { amount: 900, note: 'the Screamers ranch them for it: the pale flesh inside the rings, smoked in strips' },
    hide: { amount: 1, hideM2: 9, note: 'the tergite plates, taken off ring by ring: shields, shingles, bowls and scoops' },
    chitin: { amount: 60, note: 'the cast rings of each moult, gathered from the pen (the Ash Nomads herd them for it, and for the grubs): their furniture, vessels and lanterns' } },
  life: { maturity: 3, lifespan: 30, litter: 60, gestation: 40, note: 'eggs in a nest of chewed litter; a young beast adds rings (and legs) at each moult' },
  variants: 4, variantNames: ['Girder draught beast: harnessed for the capstan, ochre collars', 'Screamer ranch beast: tapering, every third ring ochre',
    'ash herd: ash-grey and black rings with ochre bands (herded by the Ash Nomads for chitin and grubs)',
    'Meshy model: the flat-backed millipede, baked maps (17 leg-bearing rings, a tripod-free metachronal walk with planted feet)'],
  w: 2.35, d: 8.3, h: 1.4,
  variantDims: [{ w: 2.35, d: 8.3, h: 1.4 }, { w: 3.55, d: 12.4, h: 1.6 }, { w: 2.35, d: 8.3, h: 1.4 }, { w: 2.95, d: 7.4, h: 0.95 }],
  /* variant 3 is the baked model (kits/fauna/models/draught-millipede.json): 17 rings and 34 leg parts, so its own leg count and budget */
  models: { 3: 'draught-millipede' }, modelData: { 3: { legs: 34, budget: 14000 } },
  data: { mass: [4000, 13000, 4000, 4000], legs: 26, segs: 12, speed: { walk: 1.0, run: 4.0 }, gait: { type: 'multipede', freq: 1.1, stride: 0.35 }, chain: { amp: 0.22, wave: 7 }, grazePitch: 0.25,
    budget: 9000,
    herd: 'Girder and Mav\'s Refuge: one to a beast lift, walked round its capstan by a handler and penned at night; the Screamers ranch herds of eight behind a double stockade',
    fleeDistance: 0, aggression: 0.05,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, K = (v === 1 ? 1.5 : 1) * A.S, C = FA_CR_MIL, N = FA_CR_MIL_N;
    for (let k = 0; k < N; k++) {
      const t = k / (N - 1), f = v === 1 ? 1 - 0.45 * Math.abs(t * 2 - 1) : 1, zk = (6 - k) * FA_CR_MIL_D;
      /* a point of segment k: x and y shrink with the Screamer taper, z (the ring's depth) does not */
      const P = (x, y, dz) => [x * f * K, y * f * K, (zk + dz) * K];
      const band = v === 1 && k % 3 === 0;
      let bodyC = band ? C.accent : C.body, plateC = band ? faCrShade(C.accent, 0.08) : C.plate, collarC = band ? faCrShade(C.accent, -0.2) : C.accent;
      let femC = v === 1 ? C.leg2 : C.accent, tibC = v === 1 ? faCrShade(C.leg2, -0.2) : C.tibia;
      if (v === 2) {   /* the ash herd: rings alternately ash-grey and black, an ochre band every fourth */
        const ash = k % 2 ? 0x6a6662 : 0x1c1a19, ob = k % 4 === 1;
        bodyC = ob ? 0xa8742e : ash; plateC = ob ? 0xb07a32 : (k % 2 ? 0x76726c : 0x262422); collarC = ob ? 0x8a5a24 : 0x34322f;
        femC = 0x232120; tibC = 0x5a5650; }
      const ring = () => {
        /* the barrel, slightly swollen at its middle; its rear tucks under the ring behind */
        A.tube('chitin', u => P(0, 0.62, -0.32 + 0.64 * u), u => { const s = 0.9 + 0.1 * Math.sin(Math.PI * u); return [0.625 * f * K * s, 0.31 * f * K * s]; }, 5, 14, bodyC,
          { colf: (u, a) => Math.cos(a) < -0.6 ? faCrShade(bodyC, 0.08) : bodyC });
        /* the collar: the ochre band on the ring's front face, its upper half */
        A.tube('chitin', u => P(0, 0.63, 0.2 + 0.1 * u), () => [0.655 * f * K, 0.325 * f * K], 1, 14, null,
          { colf: (u, a) => Math.cos(a) > -0.25 ? collarC : bodyC });
        /* the tergite: a wide, paler lens of a plate over the back, overhanging the sides */
        A.tube('chitin', u => P(0, 0.955, -0.25 + 0.5 * u), u => [0.71 * f * K, 0.075 * f * K * (0.75 + 0.25 * Math.sin(Math.PI * u))], 2, 12, plateC, { caps: true });
      };
      const name = k === 0 ? 'head' : 'seg' + (k - 1), pivot = k === 0 ? P(0, 0.62, -0.3) : P(0, 0.62, 0);
      A.part(name, pivot, () => {
        ring();
        if (k === 0) {
          /* the head capsule under the first ring, with its ocelli, and the antennae (Girder: 1.1 m, up, out and forward) */
          A.ellip('chitin', 0, 0.54 * f * K, (zk + 0.33) * K, 0.44 * f * K, 0.26 * f * K, 0.2 * K, v === 2 ? 0x181615 : faCrShade(C.body, -0.15), { seg: 14 });
          for (const s of [-1, 1]) {
            A.ellip('eye', s * 0.31 * f * K, 0.62 * f * K, (zk + 0.43) * K, 0.045 * f * K, 0.04 * f * K, 0.04 * K, C.eye, { seg: 6 });
            const a0 = P(s * 0.18, 0.74, 0.4), a1 = P(s * 0.3, 1.08, 0.72), a2 = P(s * 0.47, 1.34, 1.0);
            A.tube('chitin', u => u < 0.5 ? faCrLerp(a0, a1, u * 2) : faCrLerp(a1, a2, u * 2 - 1), u => { const r = (0.032 - 0.018 * u) * f * K; return [r, r]; }, 6, 6, null,
              { caps: true, colf: u => (Math.floor(u * 6 + 0.01) % 2) ? C.accent : C.tibia });
          }
          /* the mandibles: the jaw, turning with the head */
          A.part('jaw', P(0, 0.45, 0.3), () => {
            for (const s of [-1, 1]) A.tube('chitin', u => faCrLerp(P(s * 0.38, 0.45, 0.24), P(s * 0.2, 0.43, 0.62), u), u => [(0.075 - 0.04 * u) * f * K, (0.08 - 0.045 * u) * f * K], 3, 8, C.mand, { caps: true });
          });
        }
        if (k === 3 && v === 0) {
          /* the harness: a blanket over the fourth ring and the block the capstan bar pegs into */
          A.tube('plain', u => P(0, 1.06, -0.31 + 0.62 * u), () => [0.42 * K, 0.1 * K], 2, 12, C.cloth, { caps: true, colf: (u, a) => Math.abs(Math.sin(a)) > 0.93 ? 0xc2a24e : C.cloth });
          A.tube('plain', u => P(-0.25 + 0.5 * u, 1.26, -0.22), () => [0.05 * K, 0.12 * K], 1, 6, C.timber, { caps: true });
          A.anchor('harness', P(0, 1.26, -0.22));
        }
      });
      if (k === N - 1) A.part('tail', P(0, 0.62, -0.3), () => {
        /* the last ring's anal valves */
        A.ellip('chitin', 0, 0.6 * f * K, (zk - 0.36) * K, 0.4 * f * K, 0.24 * f * K, 0.13 * K, faCrShade(bodyC, -0.1), { seg: 12 });
      });
      /* the leg pair: each leg its own part, swinging at its hip (the multipede gait's wave runs down them) */
      for (const s of [1, -1]) {
        const hip = P(s * 0.58, 0.55, 0), knee = P(s * 1.1, 0.38, 0.03), foot = P(s * 1.14, 0, 0.07);
        A.part('leg' + (2 * k + (s > 0 ? 0 : 1)), hip, () => {
          A.tube('chitin', u => faCrLerp(hip, knee, u), u => { const r = (0.065 - 0.012 * u) * f * K; return [r, r]; }, 2, 6, femC, { caps: true });
          A.tube('chitin', u => faCrLerp(knee, foot, u), u => { const r = (0.055 - 0.028 * u) * f * K; return [r, r]; }, 3, 6, tibC, { caps: true });
        });
      }
    }
    /* the ventral strip the rings ride on (the body part: what a port binds as the root) */
    A.tube('chitin', u => [0, 0.36 * K, (-3.5 + 7.0 * u) * K], u => { const f = v === 1 ? 1 - 0.45 * Math.abs(u * 2 - 1) : 1; return [0.3 * f * K, 0.06 * f * K]; }, 12, 8, v === 2 ? 0x3a3836 : faCrShade(C.body, 0.15));
    A.anchor('headRoot', [0, 0.62 * K, 3.06 * K]);
  }
});

/* ---------------------------------------------------------------- the giant spider
   Mav's Refuge (79-spiders.js): the cephalothorax an ellipsoid 1.0 x 0.55 x 1.3 m with a red stripe and paler flanks, the
   abdomen 1.3 x 1.05 x 1.85 m with a red dorsal stripe, gold chevrons and a spinneret; red chelicerae with gold fangs, eight
   eyes, pedipalps; eight legs of three segments (femur, patella-tibia, tarsus), each dark with a red band at its far end,
   laid out by the build's own table (hips on the cephalothorax, home feet on the ground) and bent by its own two-bone IK
   with the body 1.25 m up. Its frame has the origin at the pedicel; here the origin is under the middle of the body (the
   pedicel 0.85 m behind it). The rider and the tack (saddle, panniers, reins) stay with the Beast Riders: anchor 'saddle'. */
const FA_CR_SPI = { dark: 0x2a2622, red: 0x7a2028, gold: 0xc2a24e };
const FA_CR_SPI_LEG = { hipx: [0.80, 0.92, 0.92, 0.78], hipz: [1.85, 1.35, 0.85, 0.35], homeA: [0.60, 1.22, 1.88, 2.55], homeR: [5.0, 4.6, 4.5, 5.1],
  l1: [2.9, 2.6, 2.55, 2.95], l2: [3.3, 2.9, 2.85, 3.35] };
const FA_CR_SPI_H = 1.25, FA_CR_SPI_Z = 0.85;
/* the build's IK at rest on flat ground (79-spiders.js, 'ankle, then 2-bone IK with the knee lifted along body-up'), in its
   body frame (origin the pedicel, y up): hip, knee, ankle and foot of leg row r on side s */
function faCrSpiderLeg(r, s) {
  const L = FA_CR_SPI_LEG, H = [s * L.hipx[r], 0, L.hipz[r]], F = [s * Math.sin(L.homeA[r]) * L.homeR[r], -FA_CR_SPI_H + 0.02, Math.cos(L.homeA[r]) * L.homeR[r] + 1.0];
  let tox = H[0] - F[0], toz = H[2] - F[2]; const tl = Math.hypot(tox, toz) || 1;
  const k = [F[0] + tox / tl * 0.32, F[1] + 0.62, F[2] + toz / tl * 0.32];
  const l1 = L.l1[r], l2 = L.l2[r]; let dx = k[0] - H[0], dy = k[1] - H[1], dz = k[2] - H[2], D = Math.hypot(dx, dy, dz) || 1e-4;
  dx /= D; dy /= D; dz /= D; D = Math.min(D, (l1 + l2) * 0.985); D = Math.max(D, Math.abs(l2 - l1) + 0.05);
  const aa = (l1 * l1 - l2 * l2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, l1 * l1 - aa * aa));
  let px = -dx * dy, py = 1 - dy * dy, pz = -dz * dy; const pl = Math.hypot(px, py, pz) || 1;
  const K = [H[0] + dx * aa + px / pl * hh, H[1] + dy * aa + py / pl * hh, H[2] + dz * aa + pz / pl * hh];
  return { hip: H, knee: K, ankle: [H[0] + dx * D, H[1] + dy * D, H[2] + dz * D], foot: F };
}
ANIMAL({
  key: 'giant-spider', name: 'Giant riding spider', group: 'crawlers',
  tags: { biomes: ['hyperjungle'], koppen: ['Af'], aridity: ['humid'], climate: ['hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'cathemeral', temperament: 'defensive',
    habitat: ['canopy', 'trunks', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] },
  size: { length: 6.6, height: 3.7 },
  source: [{ build: 'settlements/mavs-refuge', file: 'src/79-spiders.js', lines: '434-508', note: 'the geometry (cephalothorax, abdomen, leg segment, tack); lines 557-560 the leg layout and 764-812 the leg IK. Ridden by the Refuge\'s spider-riders (the Spider tribe of the Beast Riders) on patrols that climb the hypertrees\' trunks, walk the limbs and leap on draglines; nest spiders and juveniles (scale 0.45-0.55) live on and around the Silk Loft, some led by handlers' }],
  traits: { edible: false, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { silk: { amount: 2, note: 'dragline silk drawn from a kept nest spider: for the Silk Loft looms' }, hide: { amount: 1, hideM2: 4, note: 'a moulted or dead beast\'s chitin: lamellar plates, bowls, lamp shades; the dragline silk (the Silk Loft\'s, about 2 kg a year a nest spider) has no yield kind yet' } },
  life: { maturity: 4, lifespan: 25, litter: 300, gestation: 45, note: 'an egg sac of a few hundred in the Silk Loft; the handlers raise a few spiderlings, the rest are let go into the canopy' },
  variants: 2, variantNames: ['adult (patrol and nest spiders)', 'juvenile (half size, paler)'],
  w: 8.8, d: 9.4, h: 3.7,
  variantDims: [{ w: 8.8, d: 9.4, h: 3.7 }, { w: 4.4, d: 4.7, h: 1.85 }],
  data: { mass: [700, 90], legs: 8, legSpan: 8.7, silk: 'draglines and the Silk Loft\'s looms', speed: { walk: 2.8, run: 5.6 }, gait: { type: 'octopod', freq: 0.8, stride: 3.2 }, grazePitch: 0.12,
    herd: 'patrols of riders, one rider to a spider; nest spiders in a colony at the Silk Loft', fleeDistance: 0, aggression: 0.4, leap: 'ballistic leaps between limbs at g 7.4 m/s2, trailing a dragline',
    schedule: ['REST', 'REST', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'PATROL', 'IDLE', 'PATROL', 'PATROL', 'REST', 'REST', 'PATROL', 'PATROL', 'PATROL', 'IDLE', 'PATROL', 'PATROL', 'HUNT', 'HUNT', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const v = A.variant, S = (v === 1 ? 0.5 : 1) * A.S, C = FA_CR_SPI, H0 = FA_CR_SPI_H, Z0 = FA_CR_SPI_Z;
    /* the build's instance tint: adults darkened a little (0.78-1.0), juveniles full and a touch warmer */
    const tint = hex => { const r = ((hex >> 16) & 255) / 255, g = ((hex >> 8) & 255) / 255, b = (hex & 255) / 255; return v === 1 ? [r, g, b * 0.9] : [r * 0.9, g * 0.9, b * 0.9]; };
    const DARK = tint(C.dark), RED = tint(C.red), GOLD = tint(C.gold), DARK2 = tint(faCrShade(C.dark, 0.1)), EYE = tint(faCrShade(C.dark, -0.55));
    const M = p => [p[0] * S, (p[1] + H0) * S, (p[2] + Z0) * S];   /* the build's body frame (pedicel origin) -> this frame */
    /* the cephalothorax: the red stripe down the middle, paler flanks */
    A.ellip('chitin', 0, H0 * S, (1.15 + Z0) * S, 1.0 * S, 0.55 * S, 1.3 * S, null, { seg: 20, colf: (x, y, z) => {
      x /= S; y /= S; z = z / S + 1.15;
      return (Math.abs(x) < 0.26 && y > 0.25 && z < 1.9) ? RED : (y > 0.1 && Math.abs(x) > 0.55 && Math.abs(z - 1.15) < 0.8 ? DARK2 : DARK); } });
    /* eight eyes */
    for (const e of [[-0.17, 0.30, 2.30, 0.15], [0.17, 0.30, 2.30, 0.15], [-0.42, 0.33, 2.12, 0.10], [0.42, 0.33, 2.12, 0.10], [-0.30, 0.45, 1.95, 0.08], [0.30, 0.45, 1.95, 0.08], [-0.55, 0.36, 1.85, 0.08], [0.55, 0.36, 1.85, 0.08]]) {
      const p = M(e); A.ellip('eye', p[0], p[1], p[2], e[3] * S, e[3] * S, e[3] * S, EYE, { seg: 6 });
    }
    /* the abdomen: red dorsal stripe, gold chevrons along its shoulders, a paler belly; the spinneret behind */
    A.ellip('chitin', 0, (0.28 + H0) * S, (-1.9 + Z0) * S, 1.3 * S, 1.05 * S, 1.85 * S, null, { seg: 24, colf: (x, y, z) => {
      x /= S; y = y / S + 0.28; z = z / S - 1.9;
      if (Math.abs(x) < 0.34 && y > 0.75) return RED;
      if (y > 0.55 && Math.abs(x) > 0.45 && Math.abs(x) < 1.0 && Math.sin(z * 3.3) > 0.35) return GOLD;
      return y < -0.2 ? DARK2 : DARK; } });
    A.cone('chitin', M([0, 0.05, -3.55]), M([0, 0.05, -4.15]), 0.22 * S, 0.03 * S, DARK2, 8);
    /* the pedicel, the narrow waist between the two */
    A.tube('chitin', u => M([0, 0.02, -0.3 + 0.4 * u]), () => [0.36 * S, 0.3 * S], 1, 10, DARK2);
    /* a leg segment as the build draws it: radius r at its root, 0.7 r at its end, the last quarter red (the knee band) */
    const U = [0, 0.37, 0.73, 0.75, 1], seg = (a, b, r, ns) => A.tube('chitin', u => faCrLerp(a, b, U[Math.round(u * 4)]),
      u => { const w = r * (1 - 0.3 * U[Math.round(u * 4)]); return [w, w]; }, 4, ns || 8, null, { caps: true, colf: u => U[Math.round(u * 4)] > 0.74 ? RED : DARK });
    /* the mouthparts (the head part): red chelicerae, the pedipalps; the gold fangs are the jaw */
    A.part('head', M([0, -0.1, 2.2]), () => {
      for (const s of [-1, 1]) {
        A.cone('chitin', M([s * 0.27, -0.069, 2.51]), M([s * 0.27, -0.77, 2.13]), 0.24 * S, 0.13 * S, RED, 8);
        const b0 = M([s * 0.34, -0.12, 2.2]), m1 = M([s * 0.52, 0.10, 2.95]), t1 = M([s * 0.40, -0.50, 3.35]);
        seg(b0, m1, 0.15 * S, 6); seg(m1, t1, 0.11 * S, 6);
      }
      A.part('jaw', M([0, -0.72, 2.29]), () => {
        for (const s of [-1, 1]) A.cone('chitin', M([s * 0.24, -0.72, 2.29]), M([s * 0.24, -1.12, 2.43]), 0.08 * S, 0.012 * S, GOLD, 6);
      });
    });
    /* the legs: pairs front to back, left (+x) then right; each turns about its hip */
    for (let r = 0; r < 4; r++) for (const s of [1, -1]) {
      const L = faCrSpiderLeg(r, s), hip = M(L.hip), knee = M(L.knee), ankle = M(L.ankle), foot = M(L.foot);
      A.part('leg' + (2 * r + (s > 0 ? 0 : 1)), hip, () => {
        A.ellip('chitin', hip[0], hip[1], hip[2], 0.26 * S, 0.24 * S, 0.26 * S, DARK, { seg: 8 });
        seg(hip, knee, 0.23 * S);
        A.ellip('chitin', knee[0], knee[1], knee[2], 0.17 * S, 0.17 * S, 0.17 * S, RED, { seg: 8 });
        seg(knee, ankle, 0.17 * S);
        seg(ankle, foot, 0.11 * S, 6);
      });
    }
    A.anchor('saddle', M([0, 0.68, 0.78]));
    A.anchor('bridle', M([0, 0.2, 2.2]));
    A.anchor('pedicel', M([0, 0, 0]));
  }
});
