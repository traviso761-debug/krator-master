/* ======================================================================
   Krator Fauna: the riders (kits/fauna/krator-fauna-riders.js)
   The mounts of the Beast Rider tribes that had none in the kit (LORE.md 6.6, the known tribes; README.md, "The Beast
   Riders' mounts", holds the whole audit): the riding tiger (Tiger), the riding raptor ([Veloci-] Raptor), the threehorn
   (Threehorn [triceratops]), the hardshell (Hardshell [glyptodont]) and the jungle mammoth (Mammoth). First drawn here
   2026-10-19. Ground beasts of the hyperjungle floor, ranched round Pinnacle Rock's mesa and the Refuge's gateway trees
   (settlements/pinnacle-rock/PLAN.md, section 1: the ranches of the ground tribes), each grown large by the ~2 atm lowland
   air and each big enough to carry a rider in a saddle (or a howdah: the threehorn, the hardshell, the mammoth).
   Procedural, on the hyperjungle file's tube helpers (faHjRows, faHjTube, faHjCR, faHjSm, faHiMix), so a bundle that takes
   `riders` must also take `hyperjungle`. Every mount publishes a body profile (t from the tail tip, 0, to the snout, 1:
   centre line and half sizes) and the anchors a culture fits tack to (saddle, bridle, chest, pack; howdah, harness and
   trace on the big three), the way the salamander and the riding lizard do; the tack stays with the Beast Riders.
   Sizes are metres at breed scale 1; the declared boxes are the measured boxes of the builds (verify.py --assert).
   ====================================================================== */
const FA_RD_SRC = { build: 'kits/fauna', file: 'krator-fauna-riders.js', lines: '-' };
/* the hyperjungle floor, from the Refuge's lee shore to the thinning margin under Pinnacle Rock (3,000 mm of rain) */
const FA_RD_BIOME = { biomes: ['hyperjungle'], koppen: ['Af', 'Am'], aridity: ['humid'], climate: ['hypertropic', 'tropic'], riparian: 'non', abyssal: false };
/* a working beast's day (the ranch's: out to graze at dawn, worked in the cool hours, penned at dusk) and a hunter's */
const FA_RD_SCH = {
  work: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST'],
  hunt: ['REST', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'WORK', 'WORK', 'WORK', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'WORK', 'WORK', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST']
};
/* an entry with the riders' common fields: d.tribe (LORE.md 6.6), d.lore (the lore line), d.note (what it is modelled on) */
function faRdAnimal(d) {
  return ANIMAL(Object.assign({
    group: 'riders',
    size: { length: d.d, height: d.h },
    source: [Object.assign({}, FA_RD_SRC, { note: 'first drawn here (2026-10-19), the mount of the ' + d.tribe + ' tribe of the Beast Riders (LORE.md 6.6: "' + d.lore + '"): ' + d.note })]
  }, d, { data: Object.assign({ tribe: d.tribe, sizeRange: [0.85, 1.15] }, d.data) }));
}
/* the drawing helpers at the build's scale S: rows [x, y, z, half-width, half-height], points, ellipsoids, cones */
function faRdKit(A) {
  const S = A.S, P = p => [p[0] * S, p[1] * S, p[2] * S];
  return {
    S: S, P: P,
    rows: (fam, rows, nt, ns, col, o) => faHjRows(A, fam, rows.map(r => r.map(x => x * S)), nt, ns, col, o),
    el: (fam, x, y, z, rx, ry, rz, col, o) => A.ellip(fam, x * S, y * S, z * S, rx * S, ry * S, rz * S, col, o || { seg: 10 }),
    co: (fam, a, b, r0, r1, col, seg) => A.cone(fam, P(a), P(b), r0 * S, r1 * S, col, seg || 6),
    /* a trunk from [z, top, bottom, half-width] stations (rump to chest): the centre line halfway, the half-height half the depth */
    trunk: st => st.map(q => [0, (q[1] + q[2]) / 2, q[0], q[3], (q[1] - q[2]) / 2]),
    /* a leg of joints [x, y, z, hw, hh] given for the left side (+x): part leg<i> turning about its first joint, mirrored for
       the right (odd i); fn(rows) draws it */
    leg: (i, joints, fn) => { const s = (i & 1) ? -1 : 1, J = joints.map(q => [s * q[0], q[1], q[2], q[3], q[4]]);
      A.part('leg' + i, P(J[0]), () => fn(J, s)); },
    /* the body profile a host fits tack to: rows [z, y, hw, hh] from the tail tip to the snout (t 0..1) */
    profile: rows => { const f = faHjCR(rows); A.profile(t => { const q = f(t); return { z: q[0] * S, y: q[1] * S, hw: q[2] * S, hh: q[3] * S }; }); }
  };
}
/* a point turned about x by `a` (radians) round a centre: the frill's rim */
function faRdRotX(p, a, c) { const y = p[1], z = p[2], ca = Math.cos(a), sa = Math.sin(a); return [c[0] + p[0], c[1] + y * ca - z * sa, c[2] + y * sa + z * ca]; }

/* ====================================================================== the riding tiger (Tiger) */
const FA_RD_TIGER = [
  { a: 0xd06c28, b: 0xf2e8d6, s: 0x1a120c, d: 0x8a4416 },     /* jungle orange, black stripes */
  { a: 0x4e4036, b: 0xa09080, s: 0x0e0a08, d: 0x2a201a },     /* smoke: the dark tiger of the deep floor, its stripes faint */
  { a: 0xd8a862, b: 0xf4ecdc, s: 0x5a3a20, d: 0xa87a40 }      /* pale gold, brown stripes */
];
const FA_RD_TIGER_T = [[-1.38, 1.46, 1.12, 0.16], [-1.1, 1.56, 0.98, 0.32], [-0.55, 1.51, 1.08, 0.31], [0.1, 1.55, 0.96, 0.35], [0.65, 1.62, 0.86, 0.37], [1.1, 1.52, 0.95, 0.28]];
faRdAnimal({
  key: 'riding-tiger', name: 'Riding tiger', tribe: 'Tiger', lore: 'Tiger',
  note: 'a tiger grown to the size of a horse on the hyperjungle floor (about 1.5 times a real tiger in every length, three and a half times its mass), broken to the saddle; the lore names only the tribe, so the beast is chosen: a striped great cat, ridden fast and low through the understorey and on the hunt (the arena tiger of Voth, kits/fauna voth group, is its wild cousin of the bay, not a mount)',
  tags: Object.assign({}, FA_RD_BIOME, { riparian: 'both', domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'aggressive',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps', 'swims', 'climbs'] }),
  traits: { edible: false, milkable: false, tameable: true, rideable: true, draught: false, eggs: false },
  yields: { hide: { amount: 1, hideM2: 7, note: 'the striped pelt of a beast that dies: a chief\'s cloak; the tribe does not eat its tigers' } },
  life: { maturity: 4, lifespan: 22, litter: 2, gestation: 110, note: 'cubs are hand-reared in the tribe\'s kennels from weaning, and first take a saddle at three' },
  variants: 3, variantNames: ['jungle orange', 'smoke (the dark tiger)', 'pale gold'],
  breeds: { hunter: { scale: 1, mass: 780, role: 'riding mount and hunter: carries one rider and a kill' }, war: { scale: 1.12, mass: 1100, role: 'war mount of the Tiger tribe\'s Wing' } },
  d: 5.4, h: 1.85, w: 0.95,
  data: { mass: 780, legs: 4, speed: { walk: 1.6, run: 17 }, gait: { type: 'quadruped', freq: 0.9, stride: 1.2 }, grazePitch: 0.45,
    idle: { headYaw: 0.35, headPitch: 0.05, tailYaw: 0.2 },
    herd: 'one to a rider, kept in the tribe\'s kennels and runs by the ranches; fed on the ranch\'s stock and what it hunts', fleeDistance: 0, aggression: 0.7, schedule: FA_RD_SCH.hunt },
  build: function (A) {
    const C = FA_RD_TIGER[A.variant] || FA_RD_TIGER[0], K = faRdKit(A), S = K.S, mix = faHiMix, F = 'sleek';
    const pelt = (x, y, z, up, side) => {   /* stripes round the body, the belly and the inner legs white, the back darker */
      const band = Math.sin(z * 8.5 + 2.2 * faNoise(z * 1.4, y * 2.2, Math.abs(x) * 2.5) + side * 1.5);
      let c = mix(C.a, C.d, 0.35 * faHjSm(0.3, 1, up));
      if (up < -0.25) c = mix(c, C.b, faHjSm(-0.25, -0.6, up));
      return band > 0.8 && up > -0.55 ? mix(c, C.s, 0.92) : c;
    };
    K.rows(F, K.trunk(FA_RD_TIGER_T), 22, 18, null, { round: [0.12, 0], colf: (t, a, q) => pelt(q[0] / S, q[1] / S, q[2] / S, Math.cos(a), 0) });
    /* the head and neck: they turn together about the neck's root */
    A.part('head', K.P([0, 1.3, 1.0]), () => {
      K.rows(F, [[0, 1.3, 0.9, 0.27, 0.31], [0, 1.38, 1.22, 0.25, 0.27], [0, 1.46, 1.5, 0.29, 0.27], [0, 1.46, 1.72, 0.29, 0.25], [0, 1.38, 1.96, 0.22, 0.19], [0, 1.3, 2.12, 0.15, 0.13], [0, 1.27, 2.22, 0.11, 0.09]], 16, 16, null,
        { round: [0, 0.12], colf: (t, a, q) => { const x = q[0] / S, y = q[1] / S, z = q[2] / S, up = Math.cos(a);
          if (z > 1.62 && (up < -0.1 || (z > 1.97 && up < 0.5))) return C.b;                         /* the white cheeks and muzzle */
          if (z > 1.45 && Math.abs(Math.sin(x * 24 + z * 6)) > 0.93 && up > 0.2) return mix(C.a, C.s, 0.9);   /* the brow's stripes */
          if (z > 1.52 && z < 1.92 && up < 0.35 && Math.sin(z * 30 + y * 12) > 0.75) return mix(C.a, C.s, 0.9);   /* the cheek's */
          return pelt(x, y, z, up, 1); } });
      K.el(F, 0, 1.2, 2.02, 0.13, 0.07, 0.17, C.b);                                                            /* the chin */
      K.el('mouth', 0, 1.31, 2.24, 0.06, 0.045, 0.03, 0x3a2420, { seg: 8 });                                  /* the nose */
      for (const s of [-1, 1]) {
        K.el('eye', s * 0.17, 1.52, 1.9, 0.04, 0.036, 0.032, 0xd8a028, { seg: 8 });
        K.el('eye', s * 0.195, 1.52, 1.915, 0.016, 0.024, 0.012, 0x0a0806, { seg: 6 });
        K.co('mouth', [s * 0.11, 1.22, 2.18], [s * 0.19, 1.25, 1.96], 0.012, 0.012, 0x2a1410, 5);               /* the mouth line */
        for (let k = 0; k < 2; k++) K.co('horn', [s * 0.09, 1.23, 2.14 - k * 0.04], [s * 0.095, 1.15, 2.15 - k * 0.04], 0.018, 0.004, 0xf0e8d8, 4);   /* the canines */
      }
    });
    for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', K.P([s * 0.17, 1.66, 1.56]), () => {
      K.el(F, s * 0.17, 1.74, 1.56, 0.08, 0.085, 0.032, C.d, { seg: 8 }); K.el(F, s * 0.17, 1.75, 1.535, 0.037, 0.042, 0.012, C.b, { seg: 6 }); });
    /* the tail: ringed, the tip black */
    A.part('tail', K.P([0, 1.42, -1.35]), () => K.rows(F, [[0, 1.42, -1.3, 0.1, 0.1], [0, 1.36, -1.75, 0.08, 0.08], [0, 1.1, -2.25, 0.07, 0.07], [0, 0.85, -2.6, 0.065, 0.065], [0, 0.72, -2.85, 0.06, 0.06], [0, 0.74, -3.0, 0.05, 0.05]], 18, 10, null,
      { round: [0, 0.15], colf: t => (t > 0.9 || Math.sin(t * 34) > 0.55 ? C.s : mix(C.a, C.b, 0.15)) }));
    /* the legs: shoulder, elbow, wrist and paw in front; hip, stifle, hock and paw behind */
    const FRONT = [[0.24, 1.22, 0.72, 0.21, 0.26], [0.27, 0.82, 0.56, 0.16, 0.16], [0.26, 0.42, 0.62, 0.12, 0.12], [0.25, 0.14, 0.72, 0.11, 0.11]];
    const HIND = [[0.24, 1.28, -1.0, 0.24, 0.32], [0.28, 0.84, -0.7, 0.17, 0.18], [0.27, 0.44, -1.15, 0.11, 0.11], [0.25, 0.14, -1.02, 0.1, 0.1]];
    for (let i = 0; i < 4; i++) K.leg(i, i < 2 ? FRONT : HIND, (J, s) => {
      K.rows(F, J, 16, 12, null, { round: [0.1, 0.1], colf: (t, a, q) => { const y = q[1] / S, inner = s * q[0] / S < 0.19; return inner ? mix(C.a, C.b, 0.7) : (y < 0.3 ? mix(C.a, C.b, 0.3) : (Math.sin(y * 11 + q[2] / S * 3) > 0.8 ? mix(C.a, C.s, 0.9) : C.a)); } });
      const f = J[J.length - 1], fz = f[2] + 0.07;
      K.el(F, f[0], 0.08, fz, 0.14, 0.08, 0.18, mix(C.a, C.b, 0.3));
      for (let k = -1; k <= 1; k++) K.el(F, f[0] + k * 0.075, 0.05, fz + 0.15, 0.045, 0.05, 0.055, mix(C.a, C.b, 0.35), { seg: 6 });   /* the toes */
    });
    /* for the tack: the profile and the anchors (the rider sits behind the withers) */
    K.profile([[-3.0, 0.74, 0.05, 0.05], [-2.6, 0.85, 0.065, 0.065], [-1.8, 1.36, 0.08, 0.08], [-1.38, 1.29, 0.16, 0.17], [-1.1, 1.27, 0.32, 0.29], [-0.55, 1.3, 0.31, 0.22], [0.1, 1.26, 0.35, 0.3],
      [0.65, 1.24, 0.37, 0.38], [1.1, 1.24, 0.28, 0.29], [1.22, 1.38, 0.25, 0.27], [1.5, 1.46, 0.29, 0.27], [1.96, 1.38, 0.22, 0.19], [2.22, 1.27, 0.11, 0.09]]);
    A.anchor('saddle', K.P([0, 1.6, 0.3])); A.anchor('pack', K.P([0, 1.55, -0.6])); A.anchor('bridle', K.P([0, 1.36, 2.04])); A.anchor('chest', K.P([0, 1.05, 1.05]));
    A.anchor('lead', K.P([0, 1.3, 2.24])); A.anchor('headRoot', K.P([0, 1.3, 1.0])); A.anchor('tailRoot', K.P([0, 1.42, -1.35]));
  }
});

/* ====================================================================== the riding raptor (Raptor) */
const FA_RD_RAPTOR = [
  { a: 0x4a6a34, b: 0xd8d0a0, m: 0xc8a030, d: 0x1e2a14, k: 0x5a5a3a },     /* jungle green, barred, an amber crest */
  { a: 0x8a3a1a, b: 0xe0c8a0, m: 0x1a1410, d: 0x2a140c, k: 0x6a4a30 },     /* rust, the crest black */
  { a: 0x4a5a6a, b: 0xd8d8d0, m: 0xe8e8e0, d: 0x1a2028, k: 0x4a4a48 }      /* slate blue, the crest white */
];
faRdAnimal({
  key: 'riding-raptor', name: 'Riding raptor', tribe: 'Raptor', lore: '[Veloci-] Raptor',
  note: 'a feathered dromaeosaur on the scale of Utahraptor and past it (6 m from snout to tail, the hip at 1.9 m, 600 kg), its arms folded wings of quills, the sickle claw raised on the second toe; the lore names a velociraptor, which is a turkey-sized animal, so the beast is a giant of the kind: the fastest of the ground tribes\' mounts, ridden in packs, a saddle over the hips',
  tags: Object.assign({}, FA_RD_BIOME, { domestic: true, herdedBy: ['beast-riders'], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps'] }),
  traits: { edible: false, milkable: false, tameable: true, rideable: true, draught: false, eggs: true },
  yields: { eggs: { amount: 14, note: 'two clutches of seven a year; the tribe hatches the best and eats the rest' },
    feathers: { amount: 3, note: 'the moulted quills: the Raptor tribe\'s crests, fletching and the lance pennons' } },
  life: { maturity: 4, lifespan: 30, litter: 7, gestation: 70, note: 'eggs brooded in the kennel\'s nest mounds; gestation: the incubation. The chicks imprint on their keeper' },
  variants: 3, variantNames: ['jungle green, barred', 'rust, black crest', 'slate blue, white crest'],
  breeds: { courser: { scale: 1, mass: 600, role: 'riding mount: the pack\'s runners' }, war: { scale: 1.15, mass: 900, role: 'war mount: a heavier bird for the Wing' } },
  d: 5.8, h: 3.05, w: 1.05,
  data: { mass: 600, legs: 2, speed: { walk: 1.8, run: 16 }, gait: { type: 'biped', freq: 1.1, stride: 1.6 }, grazePitch: 0.5,
    idle: { headYaw: 0.45, headPitch: 0.08, tailYaw: 0.08 },
    herd: 'packs of six to a dozen, a rider to each, kennelled together; they hunt as a pack under their riders', fleeDistance: 0, aggression: 0.75, schedule: FA_RD_SCH.hunt },
  build: function (A) {
    const C = FA_RD_RAPTOR[A.variant] || FA_RD_RAPTOR[0], K = faRdKit(A), S = K.S, mix = faHiMix;
    const plume = (z, up) => { let c = mix(C.a, C.b, faHjSm(-0.1, -0.6, up)); if (up > -0.2 && Math.sin(z * 11) > 0.55) c = mix(c, C.d, 0.75); return c; };   /* barred above, pale below */
    K.rows('feather', [[0, 2.02, -0.8, 0.22, 0.25], [0, 2.02, -0.35, 0.33, 0.4], [0, 1.96, 0.2, 0.35, 0.46], [0, 1.98, 0.62, 0.3, 0.38], [0, 2.1, 0.95, 0.22, 0.26]], 18, 16, null,
      { round: [0, 0.1], colf: (t, a, q) => plume(q[2] / S, Math.cos(a)) });
    /* the tail: stiff and long, a fan of quills along its last half */
    A.part('tail', K.P([0, 2.02, -0.8]), () => {
      K.rows('feather', [[0, 2.02, -0.75, 0.22, 0.25], [0, 2.06, -1.4, 0.15, 0.16], [0, 2.06, -2.1, 0.09, 0.09], [0, 2.02, -2.8, 0.05, 0.055], [0, 1.98, -3.4, 0.025, 0.03]], 16, 10, null,
        { round: [0, 0.1], colf: (t, a, q) => plume(q[2] / S, Math.cos(a)) });
      A.sheet('feather', (u, v) => { const z = -1.9 - 1.6 * u, w = (0.05 + 0.3 * Math.sqrt(u) * (u < 0.9 ? 1 : (1 - u) / 0.1 * 0.6 + 0.4)) * (2 * v - 1); return K.P([w, 2.04 - 0.05 * u, z]); }, 10, 4, null,
        { colf: (u, v) => (Math.abs(2 * v - 1) > 0.75 || u > 0.85 ? C.d : (Math.sin(u * 22) > 0.4 ? mix(C.a, C.d, 0.5) : C.a)) });
    });
    /* the neck and head */
    A.part('head', K.P([0, 2.12, 0.95]), () => {
      K.rows('feather', [[0, 2.1, 0.9, 0.22, 0.26], [0, 2.32, 1.18, 0.16, 0.17], [0, 2.52, 1.36, 0.13, 0.14], [0, 2.64, 1.56, 0.14, 0.15], [0, 2.67, 1.66, 0.14, 0.15]], 14, 12, null,
        { round: [0, 0], colf: (t, a) => mix(C.a, C.b, faHjSm(-0.1, -0.6, Math.cos(a))) });
      K.rows('scale', [[0, 2.66, 1.58, 0.14, 0.15], [0, 2.67, 1.72, 0.15, 0.16], [0, 2.62, 1.95, 0.12, 0.125], [0, 2.56, 2.15, 0.08, 0.08], [0, 2.53, 2.3, 0.05, 0.05]], 12, 12, null,
        { round: [0, 0.15], colf: (t, a, q) => (Math.cos(a) < -0.3 ? mix(C.k, C.b, 0.5) : (Math.abs(Math.sin(a)) > 0.75 && q[2] / S > 1.7 && q[2] / S < 1.95 ? C.d : C.k)) });
      K.el('scale', 0, 2.5, 2.0, 0.09, 0.05, 0.25, mix(C.k, C.b, 0.4));                                          /* the lower jaw */
      for (const s of [-1, 1]) {
        K.el('eye', s * 0.115, 2.7, 1.86, 0.036, 0.034, 0.034, 0xe0b020, { seg: 8 });
        K.el('eye', s * 0.135, 2.7, 1.87, 0.012, 0.026, 0.012, 0x0a0806, { seg: 6 });
        K.co('mouth', [s * 0.08, 2.53, 2.27], [s * 0.115, 2.55, 1.82], 0.01, 0.012, 0x2a1810, 5);
        for (let k = 0; k < 5; k++) K.co('horn', [s * (0.07 + 0.008 * k), 2.53, 2.22 - k * 0.08], [s * (0.072 + 0.008 * k), 2.48, 2.23 - k * 0.08], 0.011, 0.002, 0xf0e8d0, 4);   /* the teeth */
      }
      /* the crest: a fan of quills off the back of the skull, and a mane down the nape */
      const qu = [], cc = mix(C.m, C.a, 0.1);
      for (let k = 0; k < 6; k++) qu.push({ at: K.P([(k - 2.5) * 0.03, 2.8, 1.66 - 0.02 * Math.abs(k - 2.5)]), dir: [(k - 2.5) * 0.08, 0.9, -0.6], len: (0.34 - 0.025 * Math.abs(k - 2.5)) * S, w: 0.06 * S, col: cc, curl: 0.2 });
      for (let k = 0; k < 5; k++) qu.push({ at: K.P([0, 2.72 - k * 0.1, 1.5 - k * 0.12]), dir: [0, 0.5, -1], len: 0.22 * S, w: 0.08 * S, col: k & 1 ? C.d : cc, curl: 0.25 });
      A.locks('feather', qu);
    });
    /* the arms, folded: a fan of quills along each forearm, three claws */
    for (const s of [-1, 1]) {
      const sh = [s * 0.24, 1.98, 0.72], el = [s * 0.32, 1.68, 0.5], wr = [s * 0.3, 1.62, 0.92];
      K.rows('feather', [sh.concat([0.1, 0.12]), el.concat([0.075, 0.075]), wr.concat([0.05, 0.05])], 8, 8, null, { round: [0.1, 0.1], colf: (t, a) => mix(C.a, C.b, faHjSm(0, -0.7, Math.cos(a))) });
      for (let k = -1; k <= 1; k++) K.co('horn', wr, [s * (0.3 + 0.02 * k), 1.48, 1.08 + 0.02 * k], 0.022, 0.004, 0x1a1410, 4);
      A.sheet('feather', (u, v) => { const p = [el[0] + (wr[0] - el[0]) * u, el[1] + (wr[1] - el[1]) * u, el[2] + (wr[2] - el[2]) * u]; return K.P([p[0] + s * 0.03 * v, p[1] - (0.42 - 0.12 * u) * v, p[2] - (0.32 - 0.1 * u) * v]); }, 6, 3, null,
        { colf: (u, v) => (v > 0.7 ? C.d : (Math.sin(u * 20) > 0.3 ? mix(C.a, C.d, 0.45) : C.a)) });
    }
    /* the legs: a feathered thigh, the scaled shank and foot; two toes on the ground, the sickle claw held up */
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1, x = 0.3 * s;
      A.part('leg' + i, K.P([0.28 * s, 1.95, -0.2]), () => {
        K.rows('feather', [[0.28 * s, 1.98, -0.2, 0.24, 0.36], [0.31 * s, 1.55, 0.05, 0.19, 0.22], [0.33 * s, 1.22, 0.28, 0.12, 0.13]], 10, 12, null, { round: [0.12, 0.1], colf: (t, a, q) => plume(q[2] / S + q[1] / S, Math.cos(a) * 0.3) });
        K.rows('scale', [[0.33 * s, 1.25, 0.27, 0.12, 0.13], [0.32 * s, 0.92, 0.05, 0.1, 0.1], [0.31 * s, 0.58, -0.24, 0.08, 0.085], [0.31 * s, 0.3, -0.14, 0.065, 0.065], [0.31 * s, 0.1, -0.03, 0.06, 0.06]], 14, 10, C.k, { round: [0, 0.1] });
        K.el('scale', x, 0.06, 0.06, 0.085, 0.06, 0.15, C.k);
        for (const k of [-1, 1]) { const tip = [x + k * 0.06, 0.04, 0.42];
          K.co('scale', [x + k * 0.03, 0.05, 0.06], tip, 0.05, 0.035, C.k, 6); K.co('horn', tip, [tip[0] + k * 0.01, 0.02, tip[2] + 0.1], 0.03, 0.004, 0x1a1410, 5); }
        const d2 = [x + s * 0.09, 0.2, 0.18];   /* digit II, raised, and its sickle */
        K.co('scale', [x + s * 0.06, 0.08, 0.02], d2, 0.045, 0.035, C.k, 6);
        K.co('horn', d2, [d2[0], 0.3, d2[2] + 0.1], 0.035, 0.025, 0x1a1410, 5); K.co('horn', [d2[0], 0.3, d2[2] + 0.1], [d2[0], 0.17, d2[2] + 0.22], 0.025, 0.004, 0x1a1410, 5);
        K.co('scale', [x, 0.1, -0.06], [x, 0.06, -0.16], 0.03, 0.015, C.k, 5);   /* the hallux */
      });
    }
    K.profile([[-3.4, 1.98, 0.025, 0.03], [-2.8, 2.02, 0.05, 0.055], [-2.1, 2.06, 0.09, 0.09], [-1.4, 2.06, 0.15, 0.16], [-0.8, 2.02, 0.22, 0.25], [-0.35, 2.02, 0.33, 0.4], [0.2, 1.96, 0.35, 0.46],
      [0.62, 1.98, 0.3, 0.38], [0.95, 2.1, 0.22, 0.26], [1.18, 2.32, 0.16, 0.17], [1.36, 2.52, 0.13, 0.14], [1.66, 2.67, 0.15, 0.16], [1.95, 2.62, 0.12, 0.125], [2.3, 2.53, 0.05, 0.05]]);
    A.anchor('saddle', K.P([0, 2.43, -0.05])); A.anchor('pack', K.P([0, 2.3, -0.7])); A.anchor('bridle', K.P([0, 2.6, 2.05])); A.anchor('chest', K.P([0, 1.9, 0.95]));
    A.anchor('lead', K.P([0, 2.53, 2.3])); A.anchor('headRoot', K.P([0, 2.12, 0.95])); A.anchor('tailRoot', K.P([0, 2.02, -0.8]));
  }
});

/* ====================================================================== the threehorn (Threehorn) */
const FA_RD_THREE = [
  { a: 0x6a6a42, b: 0xa8a078, d: 0x3a3a22, f: 0xb8402a, r: 0xe8c890, h: 0xe0d4b0, k: 0x2a2420 },     /* olive, a red frill */
  { a: 0x5a6068, b: 0x9aa0a0, d: 0x2a2e34, f: 0xd8a030, r: 0x2a2420, h: 0xe0d8c0, k: 0x1e1e20 },     /* slate, a gold frill */
  { a: 0x7a4a2a, b: 0xb89068, d: 0x3a2414, f: 0x2a6a8a, r: 0xe8e0c0, h: 0xe8dcc0, k: 0x241a14 }      /* rust-brown, a blue frill */
];
const FA_RD_THREE_T = [[-2.6, 2.72, 2.12, 0.34], [-1.8, 3.05, 1.38, 0.95], [-0.6, 3.02, 0.98, 1.25], [0.6, 2.78, 1.02, 1.2], [1.6, 2.42, 1.15, 0.95], [2.3, 2.05, 1.32, 0.6]];
faRdAnimal({
  key: 'threehorn', name: 'Threehorn', tribe: 'Threehorn', lore: 'Threehorn [triceratops]',
  note: 'a triceratops at its real size (9 m, the hips at 3 m, 9 t; the hyperjungle grows it no larger, it is already the largest of its kind): the brow horns, the short nose horn, the parrot beak and the great frill; the Threehorn tribe\'s draught beast and war mount, a rider in a saddle on the shoulders behind the frill, a howdah on the back. Not the Dalab tricorn (wild group), a smaller wild cousin of the south-west',
  tags: Object.assign({}, FA_RD_BIOME, { riparian: 'both', domestic: true, herdedBy: ['beast-riders'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'marsh', 'pen'], locomotion: ['walks', 'runs', 'wades'] }),
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: true },
  yields: { meat: { amount: 3600, note: 'an old or lamed beast culled: a feast for the whole ranch' }, eggs: { amount: 18, note: 'a clutch a year in a mound; most are hatched' },
    hide: { amount: 1, hideM2: 40, note: 'thick and pebbled: shields, boots, the howdah\'s covers' }, horn: { amount: 90, note: 'the brow horns and the frill\'s rim: lance butts, bows\' horn, cups' } },
  life: { maturity: 10, lifespan: 60, litter: 12, gestation: 120, note: 'eggs in a mound of rotting leaf; gestation: the incubation. A calf is herded with the ranch\'s stock for its first ten years before it is worked' },
  variants: 3, variantNames: ['olive, red frill', 'slate, gold frill', 'rust-brown, blue frill'],
  breeds: { draught: { scale: 1, mass: 9000, role: 'draught: the plough, the timber sledge, the beast lift\'s capstan; brow horns short' }, war: { scale: 1.08, mass: 11000, role: 'war mount and howdah beast: long brow horns' } },
  d: 9.1, h: 3.6, w: 2.85,
  data: { mass: 9000, legs: 4, speed: { walk: 1.3, run: 7 }, gait: { type: 'quadruped', freq: 0.6, stride: 1.6 }, grazePitch: 0.35,
    idle: { headYaw: 0.2, headPitch: 0.04, tailYaw: 0.08 }, budget: 11000,
    herd: 'the ranch\'s herd of a dozen to forty, a bull kept apart; each worked beast has its own driver', fleeDistance: 0, aggression: 0.45, schedule: FA_RD_SCH.work },
  build: function (A) {
    const C = FA_RD_THREE[A.variant] || FA_RD_THREE[0], K = faRdKit(A), S = K.S, mix = faHiMix, F = 'scale', war = A.breed === 'war';
    const hide = (x, y, z, up) => { let c = mix(C.a, C.b, faHjSm(-0.2, -0.7, up)); const n = faNoise(x * 3, y * 3, z * 3);
      if (up > -0.2 && Math.sin(z * 2.2 + n * 2) > 0.7) c = mix(c, C.d, 0.55); return mix(c, C.d, 0.25 * n); };   /* banded above, pale below, mottled */
    K.rows(F, K.trunk(FA_RD_THREE_T), 22, 20, null, { round: [0.06, 0], colf: (t, a, q) => hide(q[0] / S, q[1] / S, q[2] / S, Math.cos(a)) });
    A.part('head', K.P([0, 1.75, 2.3]), () => {
      K.rows(F, [[0, 1.74, 2.15, 0.58, 0.55], [0, 1.75, 2.7, 0.6, 0.62], [0, 1.62, 3.3, 0.5, 0.56], [0, 1.4, 3.85, 0.34, 0.42], [0, 1.12, 4.28, 0.2, 0.26], [0, 0.98, 4.45, 0.09, 0.12]], 16, 16, null,
        { round: [0, 0.12], colf: (t, a, q) => hide(q[0] / S, q[1] / S, q[2] / S, Math.cos(a)) });
      K.co('horn', [0, 1.02, 4.38], [0, 0.86, 4.64], 0.11, 0.02, C.k, 7); K.co('horn', [0, 0.88, 4.3], [0, 0.8, 4.48], 0.08, 0.02, C.k, 6);   /* the beak */
      K.co('horn', [0, 1.42, 4.0], [0, 1.84, 4.26], 0.11, 0.02, C.h, 7);                                                                  /* the nose horn */
      const bl = war ? 1.35 : 0.9;   /* the brow horns: a war beast's long */
      for (const s of [-1, 1]) {
        K.co('horn', [s * 0.3, 2.02, 3.0], [s * (0.3 + 0.15 * bl), 2.02 + 0.5 * bl, 3.0 + 1.05 * bl], 0.15, 0.02, C.h, 8);
        K.el('eye', s * 0.49, 1.92, 3.18, 0.06, 0.055, 0.06, 0x1a120a, { seg: 8 }); K.el(F, s * 0.47, 2.0, 3.18, 0.1, 0.05, 0.14, C.d, { seg: 8 });   /* the eye and its brow */
        K.co('mouth', [s * 0.14, 1.0, 4.32], [s * 0.33, 1.25, 3.8], 0.02, 0.02, 0x1a1210, 5);
      }
      /* the frill: a broad plate tilted back over the neck, its rim scalloped with horn knobs, two eye-spots */
      const FC = [0, 2.5, 2.25], FT = -0.85;
      K.el(F, FC[0], FC[1], FC[2], 1.3, 1.0, 0.09, null, { seg: 20, rx: FT, colf: (x, y, z) => { const yl = (y * Math.cos(FT) + z * Math.sin(FT)) / S, r = Math.hypot(x / (1.3 * S), yl / 1.0), sp = Math.hypot(Math.abs(x / S) - 0.55, yl - 0.15);
        return r > 0.86 ? C.r : (sp < 0.2 ? (sp < 0.1 ? C.k : C.r) : mix(C.f, C.d, 0.3 * faNoise(x * 4, y * 4, 1))); } });
      for (let k = 0; k <= 12; k++) { const ph = -0.25 + (Math.PI + 0.5) * k / 12, rim = [1.3 * Math.cos(ph), 1.0 * Math.sin(ph), 0], out = [1.47 * Math.cos(ph), 1.15 * Math.sin(ph), 0];
        K.co('horn', faRdRotX(rim, FT, FC), faRdRotX(out, FT, FC), 0.09, 0.015, C.h, 5); }
    });
    A.part('tail', K.P([0, 2.4, -2.55]), () => K.rows(F, [[0, 2.42, -2.5, 0.34, 0.3], [0, 2.12, -3.3, 0.22, 0.21], [0, 1.68, -3.95, 0.12, 0.12], [0, 1.28, -4.4, 0.05, 0.05]], 16, 12, null,
      { round: [0, 0.15], colf: (t, a, q) => hide(q[0] / S, q[1] / S, q[2] / S, Math.cos(a)) }));
    /* the legs: columns behind, the fore-limbs a little out to the side; hoof-nails on the broad feet */
    const HIND = [[0.82, 2.35, -1.6, 0.5, 0.6], [0.9, 1.35, -1.2, 0.34, 0.36], [0.9, 0.55, -1.62, 0.24, 0.24], [0.9, 0.27, -1.52, 0.24, 0.22]];
    const FRONT = [[0.85, 1.85, 1.6, 0.4, 0.46], [1.12, 1.15, 1.35, 0.28, 0.28], [1.1, 0.5, 1.55, 0.2, 0.2], [1.1, 0.26, 1.62, 0.2, 0.19]];
    for (let i = 0; i < 4; i++) K.leg(i, i < 2 ? FRONT : HIND, (J, s) => {
      K.rows(F, J, 14, 12, null, { round: [0.1, 0.1], colf: (t, a, q) => hide(q[0] / S, q[1] / S, q[2] / S, 0.2 - t) });
      const f = J[J.length - 1], front = i < 2;
      K.el(F, f[0], 0.13, f[2] + 0.06, front ? 0.27 : 0.3, 0.13, front ? 0.3 : 0.34, mix(C.a, C.d, 0.3), { seg: 12 });
      for (let k = 0; k < (front ? 4 : 3); k++) { const ang = (k - (front ? 1.5 : 1)) * 0.45; K.el('hoof', f[0] + Math.sin(ang) * 0.24, 0.07, f[2] + 0.06 + Math.cos(ang) * 0.27, 0.07, 0.07, 0.07, C.k, { seg: 6 }); }
    });
    K.profile([[-4.4, 1.28, 0.05, 0.05], [-3.95, 1.68, 0.12, 0.12], [-3.3, 2.12, 0.22, 0.21], [-2.6, 2.42, 0.34, 0.3], [-1.8, 2.22, 0.95, 0.84], [-0.6, 2.0, 1.25, 1.02], [0.6, 1.9, 1.2, 0.88],
      [1.6, 1.79, 0.95, 0.64], [2.3, 1.72, 0.6, 0.5], [2.7, 1.75, 0.6, 0.62], [3.3, 1.62, 0.5, 0.56], [3.85, 1.4, 0.34, 0.42], [4.28, 1.12, 0.2, 0.26], [4.45, 0.98, 0.09, 0.12]]);
    A.anchor('saddle', K.P([0, 2.8, 1.0])); A.anchor('howdah', K.P([0, 3.03, -0.7])); A.anchor('pack', K.P([0, 2.95, -1.6])); A.anchor('bridle', K.P([0, 1.1, 4.35]));
    A.anchor('chest', K.P([0, 1.6, 2.25])); A.anchor('harness', K.P([0, 2.42, 1.75])); A.anchor('trace', K.P([0, 1.6, -2.6]));
    A.anchor('lead', K.P([0, 0.95, 4.5])); A.anchor('headRoot', K.P([0, 1.75, 2.3])); A.anchor('tailRoot', K.P([0, 2.4, -2.55]));
  }
});

/* ====================================================================== the hardshell (Hardshell) */
const FA_RD_SHELL = [
  { a: 0xa8885a, g: 0x5a4430, c: 0xc8a878, k: 0x6a6258 },     /* ochre shell, grey hide */
  { a: 0x4a3e30, g: 0x241c14, c: 0xb8a078, k: 0x5a544c },     /* dark shell, pale rosettes */
  { a: 0x7a7a50, g: 0x3a3a24, c: 0x9aa070, k: 0x5e5a4a }      /* moss-streaked */
];
faRdAnimal({
  key: 'hardshell', name: 'Hardshell', tribe: 'Hardshell', lore: 'Hardshell [glyptodont]',
  note: 'a glyptodont grown large (5.3 m with the tail, the dome 2.1 m high, 3.5 t: Glyptodon is 3.3 m and 2 t): the high dome of fused rosette plates, a small armoured head under its front notch, short pillar legs, a ringed tail; the war breed carries Doedicurus\'s spiked tail club. Slow, steady and nearly unkillable: the Hardshell tribe\'s draught beast and a moving fort, a saddle frame or a howdah strapped on the dome',
  tags: Object.assign({}, FA_RD_BIOME, { riparian: 'both', domestic: true, herdedBy: ['beast-riders'], diet: 'herbivore', feeding: 'grazer', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'marsh', 'pen'], locomotion: ['walks', 'wades'] }),
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 900, note: 'dark and fat, from a culled beast' }, hide: { amount: 1, hideM2: 6, note: 'the soft hide of the legs and belly' },
    horn: { amount: 450, note: 'the carapace of a beast that dies: a hut\'s roof, a cistern, a boat; its plates shields and bowls' } },
  life: { maturity: 6, lifespan: 50, litter: 1, gestation: 300, note: 'one calf, its shell soft for the first year' },
  variants: 3, variantNames: ['ochre shell', 'dark shell, pale rosettes', 'moss-streaked'],
  breeds: { draught: { scale: 1, mass: 3500, role: 'draught and pack: the plough, the ranch\'s carts' }, war: { scale: 1.06, mass: 4200, role: 'war beast: the spiked tail club, a howdah of archers' } },
  d: 5.25, h: 2.15, w: 2.6,
  data: { mass: 3500, legs: 4, speed: { walk: 0.9, run: 3 }, gait: { type: 'quadruped', freq: 0.7, stride: 0.6 }, grazePitch: 0.5,
    idle: { headYaw: 0.25, headPitch: 0.05, tailYaw: 0.12 }, budget: 10000,
    herd: 'the ranch\'s herd of ten to thirty, grazing the cleared ground round the fields; drawn into a ring round the calves when threatened', fleeDistance: 0, aggression: 0.15, schedule: FA_RD_SCH.work },
  build: function (A) {
    const C = FA_RD_SHELL[A.variant] || FA_RD_SHELL[0], K = faRdKit(A), S = K.S, mix = faHiMix, war = A.breed === 'war';
    /* the dome: v from its crown (0) to the rim (1), u round it; the rim lifts over the head and a little over the tail */
    const Z0 = -0.05, RX = 1.18, RZ = 1.62, TOP = 2.12;
    const rimY = (dz) => 0.5 + 0.38 * Math.pow(Math.max(0, dz), 2) + 0.1 * Math.pow(Math.max(0, -dz), 2);
    const dome = (u, v) => { const th = -TAU * u, dx = Math.cos(th), dz = Math.sin(th), hr = Math.pow(Math.sin(v * Math.PI / 2), 0.7) * (1 + 0.05 * Math.pow(v, 6)), ry = rimY(dz);
      return [RX * hr * dx, ry + (TOP - ry) * Math.pow(Math.cos(v * Math.PI / 2), 0.9), Z0 + RZ * hr * dz]; };
    const rosette = (u, v) => {   /* the plates: rows of rosettes, each a pale centre, a ring, a dark groove */
      if (v > 0.93) return C.g;
      const cu = u * 30 + ((Math.floor(v * 8) & 1) ? 0.5 : 0), cv = v * 8, du = cu - Math.floor(cu) - 0.5, dv = cv - Math.floor(cv) - 0.5, d = Math.hypot(du, dv * 1.1);
      const base = mix(C.a, C.g, 0.25 * faNoise(u * 20, v * 8, 2));
      return d > 0.43 ? C.g : (d < 0.17 ? C.c : base); };
    A.sheet('scale', (u, v) => K.P(dome(u, v)), 48, 14, null, { colf: rosette });
    { const rim = t => K.P(dome(t, 1)); faHjTube(A, 'scale', rim, () => [0.07 * S, 0.06 * S], 48, 6, C.g); }   /* the rim's rolled lip */
    K.el('skin', 0, 1.0, -0.05, 1.05, 0.55, 1.62, C.k, { seg: 14 });                                                      /* the belly under the dome */
    A.part('head', K.P([0, 0.95, 1.45]), () => {
      K.rows('skin', [[0, 0.98, 1.3, 0.36, 0.36], [0, 0.92, 1.62, 0.32, 0.33], [0, 0.86, 1.9, 0.27, 0.3], [0, 0.74, 2.12, 0.2, 0.24], [0, 0.62, 2.26, 0.13, 0.16]], 12, 14, C.k, { round: [0, 0.2] });
      K.el('scale', 0, 1.1, 1.9, 0.26, 0.11, 0.24, null, { seg: 12, colf: (x, y, z) => (Math.sin(x / S * 30) * Math.sin(z / S * 30) > 0.3 ? C.g : C.a) });   /* the armoured cap */
      for (const s of [-1, 1]) { K.el('eye', s * 0.25, 0.96, 1.98, 0.035, 0.03, 0.035, 0x0e0a08, { seg: 6 }); K.el('skin', s * 0.24, 1.12, 1.68, 0.07, 0.06, 0.03, C.k, { seg: 6 });
        K.el('mouth', s * 0.05, 0.64, 2.36, 0.025, 0.02, 0.02, 0x1a1210, { seg: 5 }); }
    });
    A.part('tail', K.P([0, 0.9, -1.6]), () => {
      const ring = t => (Math.sin(t * 30) > 0.2 ? C.a : C.g);
      if (!war) K.rows('horn', [[0, 0.92, -1.55, 0.32, 0.3], [0, 0.8, -2.05, 0.24, 0.23], [0, 0.66, -2.5, 0.16, 0.16], [0, 0.55, -2.85, 0.09, 0.09]], 18, 12, null, { round: [0, 0.15], colf: ring });
      else { K.rows('horn', [[0, 0.92, -1.55, 0.32, 0.3], [0, 0.82, -1.95, 0.22, 0.22], [0, 0.76, -2.3, 0.2, 0.2]], 12, 12, null, { colf: ring });
        K.el('horn', 0, 0.76, -2.58, 0.34, 0.3, 0.42, C.a, { seg: 12 });                                                   /* the club */
        for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, dx = Math.cos(a), dy = Math.sin(a), b = [dx * 0.3, 0.76 + dy * 0.26, -2.62];
          K.co('horn', b, [dx * 0.55, 0.76 + dy * 0.48, -2.72], 0.07, 0.01, C.c, 5); }
        K.co('horn', [0, 0.76, -2.95], [0, 0.76, -3.15], 0.08, 0.01, C.c, 5); }
    });
    const FRONT = [[0.62, 1.1, 1.0, 0.24, 0.26], [0.68, 0.5, 1.06, 0.24, 0.24], [0.7, 0.14, 1.1, 0.23, 0.23]], HIND = [[0.62, 1.12, -0.95, 0.26, 0.3], [0.7, 0.52, -0.84, 0.27, 0.27], [0.72, 0.14, -0.92, 0.25, 0.25]];
    for (let i = 0; i < 4; i++) K.leg(i, i < 2 ? FRONT : HIND, (J) => {
      K.rows('skin', J, 10, 12, C.k, { round: [0.1, 0.1] });
      const f = J[J.length - 1];
      K.el('skin', f[0], 0.09, f[2] + 0.04, 0.27, 0.09, 0.3, mix(C.k, C.g, 0.2), { seg: 10 });
      for (let k = -1; k <= 1; k++) K.el('hoof', f[0] + k * 0.13, 0.06, f[2] + 0.3, 0.06, 0.06, 0.07, 0x1e1a14, { seg: 6 });
    });
    K.profile([[-2.9, 0.55, 0.09, 0.09], [-2.5, 0.66, 0.16, 0.16], [-2.05, 0.8, 0.24, 0.23], [-1.55, 1.1, 0.7, 0.6], [-0.9, 1.3, 1.08, 0.8], [-0.05, 1.31, 1.18, 0.81], [0.8, 1.3, 1.08, 0.75],
      [1.4, 1.1, 0.6, 0.45], [1.62, 0.92, 0.32, 0.33], [1.9, 0.86, 0.27, 0.3], [2.12, 0.74, 0.2, 0.24], [2.26, 0.62, 0.13, 0.16]]);
    A.anchor('saddle', K.P([0, 2.12, 0.15])); A.anchor('howdah', K.P([0, 2.1, -0.15])); A.anchor('pack', K.P([0, 1.9, -0.95])); A.anchor('bridle', K.P([0, 0.75, 2.15]));
    A.anchor('chest', K.P([0, 0.85, 1.42])); A.anchor('harness', K.P([0, 1.2, 1.45])); A.anchor('trace', K.P([0, 0.9, -1.6]));
    A.anchor('lead', K.P([0, 0.62, 2.3])); A.anchor('headRoot', K.P([0, 0.95, 1.45])); A.anchor('tailRoot', K.P([0, 0.9, -1.6]));
  }
});

/* ====================================================================== the jungle mammoth (Mammoth) */
const FA_RD_MAMMOTH = [
  { a: 0x7a4a2a, k: 0x4a3a30, d: 0x2a1c12, i: 0xe8dcc0, hairy: 1 },     /* russet: the hair on the head, the hump and the flanks */
  { a: 0x6a6660, k: 0x6a6660, d: 0x3a3834, i: 0xe0d4b8, hairy: 0 },     /* grey, near bare */
  { a: 0x3a2a20, k: 0x3a3028, d: 0x1a120c, i: 0xd8c8a8, hairy: 1 }      /* dark brown */
];
const FA_RD_MAMMOTH_T = [[-2.05, 2.9, 1.95, 0.5], [-1.5, 3.2, 1.5, 0.98], [-0.4, 3.55, 1.32, 1.18], [0.7, 3.98, 1.42, 1.14], [1.45, 3.85, 1.65, 0.92], [1.9, 3.5, 2.0, 0.7]];
faRdAnimal({
  key: 'jungle-mammoth', name: 'Jungle mammoth', tribe: 'Mammoth', lore: 'Mammoth',
  note: 'the lore names only the tribe, and a woolly mammoth would cook in the hyperjungle, so the beast is chosen: a mammoth of the hot lowland on the Columbian mammoth\'s frame (4 m at the shoulder, 9 t), the domed head and the sloping back, the long spiralled tusks, its hair thin and russet on the head, the hump and the flanks (one variant near bare); the Mammoth tribe\'s war beast and heavy draught, a mahout on the neck and a howdah on the back',
  tags: Object.assign({}, FA_RD_BIOME, { riparian: 'both', domestic: true, herdedBy: ['beast-riders'], diet: 'herbivore', feeding: 'browser', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'marsh', 'shallows', 'pen'], locomotion: ['walks', 'runs', 'wades', 'swims'] }),
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 3000, note: 'only from a beast that dies or is culled lame' }, ivory: { amount: 160, note: 'the pair of tusks: the Beast Riders\' carving, a chief\'s gifts' },
    hair: { amount: 6, note: 'the moulted hair, spun for rope and felt' }, hide: { amount: 1, hideM2: 45, note: 'thick: shields, the howdah\'s armour' } },
  life: { maturity: 12, lifespan: 65, litter: 1, gestation: 640, note: 'a calf every five years; the tribe keeps cow herds and works the bulls' },
  variants: 3, variantNames: ['russet-haired', 'grey, near bare', 'dark brown'],
  breeds: { riding: { scale: 1, mass: 9000, role: 'riding and draught: a mahout on the neck, a howdah or a load on the back' }, war: { scale: 1.08, mass: 11500, role: 'war beast: the longest tusks, a fighting howdah' } },
  d: 7.7, h: 4.35, w: 2.65,
  data: { mass: 9000, legs: 4, speed: { walk: 1.5, run: 6 }, gait: { type: 'quadruped', freq: 0.55, stride: 1.4 }, grazePitch: 0.22,
    idle: { headYaw: 0.15, headPitch: 0.04, tailYaw: 0.15 }, budget: 10000,
    herd: 'cow herds of eight to twenty with their calves under a matriarch; the worked bulls kept singly, each with its mahout', fleeDistance: 0, aggression: 0.35, schedule: FA_RD_SCH.work },
  build: function (A) {
    const C = FA_RD_MAMMOTH[A.variant] || FA_RD_MAMMOTH[0], K = faRdKit(A), S = K.S, mix = faHiMix, war = A.breed === 'war';
    const F = C.hairy ? 'shag' : 'skin', coat = (up, n) => mix(C.hairy ? C.a : C.k, C.d, 0.25 * n + 0.2 * faHjSm(-0.2, -0.8, up));
    const T = K.trunk(FA_RD_MAMMOTH_T);
    K.rows(F, T, 22, 20, null, Object.assign({ round: [0.1, 0], colf: (t, a, q) => coat(Math.cos(a), faNoise(q[0] / S * 2, q[1] / S * 2, q[2] / S * 2)) }, C.hairy ? { shag: [0.035, 2.2] } : {}));
    /* the hair: locks down the flanks and over the hump (a near-bare beast keeps a topknot only) */
    if (C.hairy) { const L = [], tr = faHjCR(T);
      for (let k = 0; k < 17; k++) for (const s of [-1, 1]) for (const a0 of [0.95, 1.35, 1.75]) { const j = faHash(k, s, a0), q = tr(0.1 + 0.8 * (k + 0.6 * j) / 17), a = a0 + 0.18 * (faHash(a0, k, s) - 0.5);
        L.push({ at: K.P([s * q[3] * Math.sin(a) * 0.96, q[1] + q[4] * Math.cos(a) * 0.96, q[2]]), dir: [s * (0.15 + 0.2 * j), -1, 0.15 * (j - 0.5)], len: (0.6 + 0.45 * faHash(s, a0, k)) * S, w: (0.16 + 0.08 * j) * S, col: mix(C.a, C.d, 0.45 * faHash(k, a0, s)), curl: 0.08, side: [0.3 * s, 0, 1] }); }
      A.locks('hair', L); }
    A.part('head', K.P([0, 3.05, 1.75]), () => {
      K.rows(F, [[0, 3.0, 1.6, 0.82, 0.92], [0, 3.25, 2.0, 0.78, 1.0], [0, 3.25, 2.3, 0.68, 0.88], [0, 2.95, 2.6, 0.5, 0.62], [0, 2.62, 2.78, 0.36, 0.4]], 14, 16, null,
        Object.assign({ round: [0, 0], colf: (t, a) => coat(Math.cos(a), 0.3) }, C.hairy ? { shag: [0.03, 2.5] } : {}));
      /* the trunk: hanging, creased, its tip turned forward */
      K.rows('skin', [[0, 2.7, 2.75, 0.36, 0.38], [0, 2.2, 2.95, 0.26, 0.26], [0, 1.6, 3.05, 0.2, 0.2], [0, 1.05, 3.02, 0.15, 0.15], [0, 0.65, 2.92, 0.12, 0.12], [0, 0.45, 2.98, 0.1, 0.1], [0, 0.42, 3.12, 0.08, 0.08]], 20, 12, null,
        { round: [0, 0.12], colf: t => (Math.sin(t * 90) > 0.6 ? mix(C.k, C.d, 0.35) : C.k) });
      /* the tusks: down, out, forward and up, spiralling in at the tips; a war bull's longer */
      const tk = war ? 1.18 : 1;
      for (const s of [-1, 1]) { const R = [[0.36, 2.6, 2.62, 0.15], [0.46, 2.0, 3.15, 0.14], [0.72, 1.55, 3.8, 0.12], [1.0, 1.6, 4.45, 0.095], [1.05, 2.0, 4.9, 0.07], [0.85, 2.4, 5.05, 0.04]]
        .map((q, k) => k ? [s * (0.36 + (q[0] - 0.36) * tk), 2.6 + (q[1] - 2.6) * tk, 2.62 + (q[2] - 2.62) * tk, q[3], q[3]] : [s * q[0], q[1], q[2], q[3], q[3]]);
        K.rows('horn', R, 18, 10, C.i, { round: [0, 0.1] }); }
      for (const s of [-1, 1]) { K.el('eye', s * 0.6, 3.25, 2.42, 0.045, 0.04, 0.045, 0x120c08, { seg: 6 }); }
      if (!C.hairy) A.locks('hair', [0, 1, 2, 3, 4].map(k => ({ at: K.P([(k - 2) * 0.12, 4.18, 2.0 - 0.05 * Math.abs(k - 2)]), dir: [(k - 2) * 0.3, 0.4, -1], len: 0.45 * S, w: 0.18 * S, col: C.d, curl: 0.3 })));
      else A.locks('hair', [0, 1, 2, 3, 4, 5, 6].map(k => ({ at: K.P([(k - 3) * 0.13, 4.18 - 0.02 * Math.abs(k - 3), 2.05 - 0.06 * Math.abs(k - 3)]), dir: [(k - 3) * 0.35, 0.3, -1], len: 0.6 * S, w: 0.22 * S, col: C.a, curl: 0.3 })));
    });
    for (const s of [-1, 1]) A.part(s > 0 ? 'earL' : 'earR', K.P([s * 0.7, 3.45, 1.85]), () => K.el(F, s * 0.74, 3.32, 1.8, 0.07, 0.38, 0.3, C.hairy ? mix(C.a, C.d, 0.35) : mix(C.k, C.d, 0.2), { seg: 12, rz: s * 0.12 }));
    A.part('tail', K.P([0, 2.75, -2.05]), () => { K.rows('skin', [[0, 2.78, -2.0, 0.13, 0.13], [0, 2.3, -2.3, 0.08, 0.08], [0, 1.85, -2.42, 0.055, 0.055], [0, 1.55, -2.45, 0.04, 0.04]], 12, 8, C.k, { round: [0, 0.1] });
      A.locks('hair', [-1, 0, 1].map(k => ({ at: K.P([k * 0.03, 1.6, -2.45]), dir: [k * 0.2, -1, -0.1], len: 0.4 * S, w: 0.1 * S, col: C.d, curl: 0.1 }))); });
    const FRONT = [[0.66, 2.4, 1.05, 0.5, 0.55], [0.7, 1.4, 0.98, 0.42, 0.42], [0.7, 0.6, 1.08, 0.36, 0.36], [0.7, 0.2, 1.1, 0.39, 0.39]], HIND = [[0.7, 2.3, -1.45, 0.55, 0.62], [0.74, 1.3, -1.25, 0.43, 0.43], [0.72, 0.6, -1.38, 0.36, 0.36], [0.72, 0.2, -1.36, 0.39, 0.39]];
    for (let i = 0; i < 4; i++) K.leg(i, i < 2 ? FRONT : HIND, (J) => {
      K.rows(F, J, 12, 14, null, { round: [0.12, 0], colf: (t, a) => coat(0, 0.2 + 0.4 * t) });
      const f = J[J.length - 1];
      K.el('skin', f[0], 0.12, f[2] + 0.02, 0.42, 0.12, 0.44, mix(C.k, C.d, 0.3), { seg: 14 });
      for (let k = -1; k <= 1; k++) K.el('hoof', f[0] + k * 0.18, 0.07, f[2] + 0.4, 0.08, 0.07, 0.06, 0xd8ccb0, { seg: 6 });
    });
    K.profile([[-2.45, 1.55, 0.04, 0.04], [-2.3, 2.3, 0.08, 0.08], [-2.05, 2.42, 0.5, 0.48], [-1.5, 2.35, 0.98, 0.85], [-0.4, 2.43, 1.18, 1.12], [0.7, 2.7, 1.14, 1.28], [1.45, 2.75, 0.92, 1.1],
      [1.9, 2.75, 0.7, 0.75], [2.0, 3.25, 0.78, 1.0], [2.3, 3.25, 0.68, 0.88], [2.6, 2.95, 0.5, 0.62], [2.78, 2.62, 0.36, 0.4]]);
    A.anchor('saddle', K.P([0, 4.0, 1.5])); A.anchor('howdah', K.P([0, 3.88, 0.15])); A.anchor('pack', K.P([0, 3.5, -1.1])); A.anchor('bridle', K.P([0, 3.3, 2.5]));
    A.anchor('chest', K.P([0, 2.3, 1.75])); A.anchor('harness', K.P([0, 3.6, 1.35])); A.anchor('trace', K.P([0, 2.4, -2.05]));
    A.anchor('lead', K.P([0, 0.45, 3.1])); A.anchor('headRoot', K.P([0, 3.05, 1.75])); A.anchor('tailRoot', K.P([0, 2.75, -2.05]));
  }
});
