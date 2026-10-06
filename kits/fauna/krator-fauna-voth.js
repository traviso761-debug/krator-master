/* ======================================================================
   Krator Fauna: Voth (kits/fauna/krator-fauna-voth.js)
   The animals of the Vothic city on the southwest bay of the Ring Sea (settlements/voth), ported from its own builders:
   the ambient seagulls and cliff racers (src/84-fauna.js), the silt strider the strider guild rides (src/79c-strider-model.js:
   the animal only; the howdah, the handler's deck and the hollows carved in the shell are the culture's, left as anchors),
   the arena's tiger and pit lizard (src/78j-life-arena.js) and the giant beetle the ranches keep (src/65k-granary-mills-ranch.js,
   also fought in the arena).
   UNITS: Voth's world units are not metres. A citizen is 2.94 units = 1.75 m, so one unit is 0.595 m (FA_VO_U); every
   coordinate below is written in the original's units and scaled by it, so a number can be checked against the source.
   Biome: settlement-only animals take the nearest biome, the southwest bay (biomes/swbay: tropic, semiarid to humid).
   ====================================================================== */
const FA_VO_U = 1.75 / 2.94;
const FA_VO_KOPPEN = ['Aw', 'Cfa'], FA_VO_CLIMATE = ['tropic', 'temperate'];
/* colour helpers: Voth's own shade() (45-kit.js: toward white, or toward 0x1a1712 for a negative f), and a multiply */
function faVoShade(hex, f) { const c = new THREE.Color(hex); if (f >= 0) c.lerp(new THREE.Color(0xffffff), f); else c.lerp(new THREE.Color(0x1a1712), -f); return c.getHex(); }
function faVoMul(hex, k) { const c = new THREE.Color(hex); return [Math.min(1, c.r * k), Math.min(1, c.g * k), Math.min(1, c.b * k)]; }
function faVoMix(a, b, f) { const c = new THREE.Color(a).lerp(new THREE.Color(b), f); return [c.r, c.g, c.b]; }
/* a Catmull-Rom curve through points, t 0..1 */
function faVoSpline(pts) {
  const n = pts.length - 1;
  return function (t) {
    const f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)], o = [];
    for (let k = 0; k < 3; k++) o.push(0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u));
    return o;
  };
}
/* a profile: keys [[t, a, b ...]] -> f(t) = [a, b ...], smoothstepped between keys */
function faVoProf(keys) {
  return function (t) {
    for (let k = 0; k < keys.length - 1; k++) { const a = keys[k], b = keys[k + 1];
      if (t <= b[0]) { const f = Math.max(0, (t - a[0]) / (b[0] - a[0])), e = f * f * (3 - 2 * f); return a.slice(1).map((v, i) => v + (b[i + 1] - v) * e); } }
    return keys[keys.length - 1].slice(1);
  };
}
/* the upper half of an ellipsoid (Voth's DOME shape: a hemisphere on its rim), faces outward: u runs the polar angle,
   v the azimuth; o.under adds the flat underside (the shell's lining) facing down */
function faVoDome(A, fam, c, r, col, nu, nv, o) {
  o = o || {};
  A.sheet(fam, (u, v) => { const ph = u * Math.PI / 2, th = v * TAU; return [c[0] + Math.sin(ph) * Math.cos(th) * r[0], c[1] + Math.cos(ph) * r[1], c[2] + Math.sin(ph) * Math.sin(th) * r[2]]; },
    nu, nv, col, o.colf ? { colf: o.colf } : null);
  if (o.under != null) A.sheet(fam, (u, v) => { const th = u * TAU, k = v * 0.995; return [c[0] + k * Math.cos(th) * r[0], c[1] + 0.002, c[2] + k * Math.sin(th) * r[2]]; }, nv, 3, o.under);
}
/* a flying wing from its root, along +x for side 1 (the left), -x for side -1: a flattened tube whose section is the
   chord; a straight swept leading edge, the chord tapering to a rounded tip; dihedral lifts it, droop bends the hand */
function faVoWing(A, fam, side, root, o) {
  const L = o.len, ch = o.chord, cd = Math.cos(o.dihedral), sd = Math.sin(o.dihedral), sw = Math.sin(o.sweep);
  const cAt = t => ch * (1 - (o.taper == null ? 0.25 : o.taper) * t) * Math.sqrt(Math.max(0.03, 1 - Math.pow(t, o.tipPow || 4)));
  const c = t => [root[0] + side * L * cd * t, root[1] + L * sd * t - (o.droop || 0) * t * t, root[2] + ch / 2 - L * sw * t - cAt(t) / 2];
  A.tube(fam, c, t => [cAt(t) / 2, o.thick * (1 - 0.7 * t)], o.nt || 12, o.ns || 8, null, { caps: true, colf: o.colf || (() => o.col) });
  return c;
}

/* ====================================================================== the seagull (84-fauna.js 62-73)
   The original: a box body 0.40 x 0.16 x 1.05 units and two box wings 1.15 long, 0.36 chord, raised 0.34 rad and swept
   0.22 rad, body 0xdcd7c8, wings 0xb2ab99. Kept: the size (a 0.62 m bird, 1.4 m span), the dihedral and sweep, both colours;
   added a head and beak, the grey mantle, dark wing tips and the legs it never needed in the air. */
const FA_VO_GULL = { body: 0xdcd7c8, wing: 0xb2ab99, tip: 0x4a4640, beak: 0xe8c040, leg: 0xd89a84 };
ANIMAL({
  key: 'seagull', name: 'Bay seagull', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'omnivore', feeding: 'scavenger', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'water', 'shallows', 'rock'], locomotion: ['flies', 'glides', 'swims', 'walks'] },
  size: { length: 0.62, height: 0.34, span: 1.4 },
  source: [{ build: 'settlements/voth', file: 'src/84-fauna.js', lines: '62-73, 91-163', note: 'ambient: 20 gulls in 5 loose flocks wheeling 16-30 units over the bay\'s open water (WATER\'s three bay circles), an InstancedMesh of boxes' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 0.4, note: 'a lean, fishy bird; eaten by the poor of the cantons' },
    eggs: { amount: 3, note: 'one clutch a year, gathered from the roost ledges' },
    feathers: { amount: 0.05, note: 'moulted down for stuffing' } },
  life: { maturity: 4, lifespan: 20, litter: 3, gestation: 27, note: 'gestation: incubation of the clutch' },
  w: 1.45, d: 0.99, h: 0.52,
  data: { mass: 1.1, legs: 2, wings: 1, speed: { walk: 0.8, run: 2.5, fly: 11 }, gait: { type: 'flyer', freq: 1.6, stride: 0.1 },
    flap: { freq: 2.6, amp: 0.55, glide: 0.45, fold: 0.38, sweep: 1.3, foldScale: 0.6, tuck: 0.9 }, grazePitch: 0.6,
    herd: 'loose flocks of four wheeling over the bay; hundreds at the harbour roosts', fleeDistance: 6, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'FLY', 'FLY', 'HUNT', 'HUNT', 'FLY', 'IDLE', 'REST', 'REST', 'FLY', 'FLY', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_VO_GULL;
    /* the body: tail root to breast; the mantle (the back between the wings) takes the wing grey */
    const bc = faVoSpline([[0, 0.228, -0.27], [0, 0.214, -0.13], [0, 0.205, 0.02], [0, 0.215, 0.13], [0, 0.238, 0.19]]);
    const br = faVoProf([[0, 0.022, 0.018], [0.25, 0.062, 0.052], [0.55, 0.08, 0.07], [0.85, 0.07, 0.066], [1, 0.035, 0.04]]);
    A.tube('feather', bc, br, 12, 12, null, { caps: true, colf: (t, a) => Math.cos(a) > 0.45 && t > 0.15 && t < 0.85 ? C.wing : C.body });
    /* the head and neck */
    A.part('head', [0, 0.235, 0.17], () => {
      A.tube('feather', faVoSpline([[0, 0.228, 0.15], [0, 0.262, 0.2], [0, 0.295, 0.235]]), t => [0.042 - 0.008 * t, 0.045 - 0.008 * t], 4, 10, C.body);
      A.ellip('feather', 0, 0.305, 0.248, 0.04, 0.039, 0.05, C.body, { seg: 12 });
      A.tube('horn', t => [0, 0.299 - 0.012 * t * t, 0.288 + 0.062 * t], t => [0.011 * (1 - 0.65 * t), 0.013 * (1 - 0.45 * t)], 4, 8, C.beak, { caps: true });
      A.ellip('plain', 0, 0.284, 0.336, 0.005, 0.005, 0.007, 0xc83a28, { seg: 6 });   /* the red spot on the bill */
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.031, 0.315, 0.264, 0.008, 0.008, 0.008, 0xe8e0a0, { seg: 8 }); A.ellip('eye', s * 0.036, 0.316, 0.266, 0.004, 0.004, 0.004, 0x080605, { seg: 6 }); }
    });
    /* the tail: a short white fan */
    A.part('tail', [0, 0.226, -0.25], () => {
      A.tube('feather', t => [0, 0.226 - 0.006 * t, -0.25 - 0.1 * t], t => [0.03 + 0.03 * t, 0.012 - 0.008 * t], 4, 8, C.body, { caps: true });
    });
    /* the wings: root on the shoulder; 0.68 m from the body's centre as in the original (1.15 units), raised and swept */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.045, 0.246, 0.05], () => {
      faVoWing(A, 'feather', s, [s * 0.045, 0.246, 0.05], { len: 0.66, chord: 0.21, thick: 0.014, dihedral: 0.34, sweep: 0.22, droop: 0.05, tipPow: 3,
        colf: t => t > 0.8 ? C.tip : C.wing });
    });
    /* the legs: pink, webbed feet */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, [s * 0.032, 0.165, -0.02], () => {
      A.tube('feather', t => [s * 0.032, 0.165 - 0.05 * t, -0.02 + 0.01 * t], t => [0.016 - 0.006 * t, 0.018 - 0.006 * t], 3, 6, C.body);
      A.cone('scale', [s * 0.033, 0.12, -0.012], [s * 0.035, 0.012, 0.0], 0.0065, 0.005, C.leg, 6);
      for (const a of [-0.45, 0, 0.45]) A.cone('scale', [s * 0.035, 0.008, 0.0], [s * 0.035 + Math.sin(a) * 0.045, 0.006, Math.cos(a) * 0.045], 0.004, 0.0025, C.leg, 4);
      A.ellip('scale', s * 0.035, 0.005, 0.024, 0.024, 0.004, 0.022, C.leg, { seg: 8 });   /* the web */
    });
    A.anchor('perch', [0, 0, 0]);
  }
});

/* ====================================================================== the cliff racer (84-fauna.js 75-88)
   The original: a box body 0.55 x 0.42 x 2.6 units, a tail box 0.16 x 0.14 x 1.3 behind it, wings 2.2 long, 0.85 chord,
   raised 0.22 and swept 0.30, body 0x5c6a49, wings 0x3e4a34. Kept: its size (2.3 m nose to tail, 2.6 m span), the long
   tail, the broad swept wings and both colours; given a toothed snout, a paler belly, wing fingers and hind legs to perch on
   the ridges it hunts over. */
const FA_VO_RACER = { body: 0x5c6a49, wing: 0x3e4a34, belly: 0x8a9068, dark: 0x2a3222, tooth: 0xd8d0b8 };
ANIMAL({
  key: 'cliff-racer', name: 'Cliff racer', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid'], climate: FA_VO_CLIMATE, riparian: 'non', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'aggressive',
    habitat: ['sky', 'rock'], locomotion: ['flies', 'glides', 'walks', 'climbs'] },
  size: { length: 2.35, height: 0.85, span: 2.65 },
  source: [{ build: 'settlements/voth', file: 'src/84-fauna.js', lines: '75-88, 91-163', note: 'ambient: 12 racers in 3 flocks circling 65-140 units over the inland ridges (RIDGES, the near ranges) on wide predatory circles' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 3, note: 'stringy; hunters eat it to spite it' },
    hide: { amount: 1, hideM2: 1.6, note: 'the wing leather: thin, tough, for drumheads and kites' } },
  life: { maturity: 2, lifespan: 18, litter: 2, gestation: 45, note: 'two eggs on a cliff ledge, guarded by both; gestation: incubation' },
  w: 2.8, d: 2.6, h: 0.92,
  data: { mass: 14, legs: 2, wings: 1, speed: { walk: 0.6, run: 2, fly: 16 }, gait: { type: 'flyer', freq: 1.2, stride: 0.2 },
    flap: { freq: 1.3, amp: 0.45, glide: 0.6, fold: 0.3, sweep: 1.3, foldScale: 0.6, tuck: 0.9 }, grazePitch: 0.5,
    herd: 'hunting packs of four over the ridges', fleeDistance: 0, aggression: 0.75,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'HUNT', 'ROOST', 'ROOST', 'ROOST', 'HUNT', 'HUNT', 'FLY', 'HUNT', 'FLY', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) {
    const C = FA_VO_RACER, Y = 0.48;
    const skin = (t, a) => { const top = Math.cos(a); return top < -0.5 ? C.belly : top > 0.7 ? faVoMul(C.body, 0.85) : C.body; };
    /* the body: rump to the base of the neck (the original box ran -0.77..0.77 m with the head in it) */
    const bc = faVoSpline([[0, Y - 0.02, -0.76], [0, Y, -0.45], [0, Y + 0.01, -0.05], [0, Y + 0.02, 0.22], [0, Y + 0.04, 0.42]]);
    const br = faVoProf([[0, 0.05, 0.05], [0.3, 0.12, 0.11], [0.62, 0.165, 0.13], [0.85, 0.12, 0.11], [1, 0.07, 0.07]]);
    A.tube('scale', bc, br, 14, 12, null, { caps: true, colf: (t, a) => skin(t, a) });
    /* the head: a long neck and a narrow toothed snout */
    A.part('head', [0, Y + 0.04, 0.38], () => {
      A.tube('scale', faVoSpline([[0, Y + 0.03, 0.36], [0, Y + 0.08, 0.48], [0, Y + 0.11, 0.56]]), t => [0.065 - 0.012 * t, 0.07 - 0.01 * t], 5, 10, null, { colf: (t, a) => skin(t, a) });
      A.ellip('scale', 0, Y + 0.12, 0.6, 0.065, 0.06, 0.08, C.body, { seg: 12 });
      A.tube('scale', t => [0, Y + 0.115 - 0.03 * t, 0.62 + 0.26 * t], t => [0.042 * (1 - 0.8 * t) + 0.004, 0.035 * (1 - 0.75 * t) + 0.004], 6, 8, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.3 ? C.belly : C.body });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.05, Y + 0.145, 0.625, 0.016, 0.014, 0.018, 0xd8a028, { seg: 8 });
        A.ellip('eye', s * 0.058, Y + 0.146, 0.628, 0.008, 0.01, 0.008, 0x0a0806, { seg: 6 });
        for (let k = 0; k < 4; k++) A.cone('horn', [s * 0.028 * (1 - 0.15 * k), Y + 0.095 - 0.006 * k, 0.68 + 0.05 * k], [s * 0.03 * (1 - 0.15 * k), Y + 0.07 - 0.006 * k, 0.685 + 0.05 * k], 0.006, 0.001, C.tooth, 4);
      }
    });
    /* the tail: long and thin (the original's 1.3-unit box), ending in a small diamond vane */
    A.part('tail', [0, Y - 0.02, -0.74], () => {
      const tc = faVoSpline([[0, Y - 0.02, -0.74], [0, Y - 0.06, -1.05], [0, Y - 0.1, -1.35], [0, Y - 0.12, -1.55]]);
      A.tube('scale', tc, t => [0.05 * (1 - 0.8 * t) + 0.006, 0.045 * (1 - 0.8 * t) + 0.006], 10, 8, null, { caps: true, colf: (t, a) => skin(t, a) });
      A.tube('scale', t => [0, Y - 0.115, -1.43 - 0.16 * t], t => [0.07 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)) + 0.004, 0.008], 5, 6, C.wing, { caps: true });
    });
    /* the wings: 1.31 m from the body's centre (2.2 units), chord 0.5 m; darker fingers run out along the membrane */
    for (const s of [1, -1]) A.part(s > 0 ? 'wingL' : 'wingR', [s * 0.11, Y + 0.08, 0.1], () => {
      const W = { len: 1.22, chord: 0.5, thick: 0.022, dihedral: 0.22, sweep: 0.30, droop: 0.06, taper: 0.45, tipPow: 3, nt: 14, ns: 8,
        colf: (t, a) => (Math.sin(t * 9) > 0.8 ? C.dark : C.wing) };
      const c = faVoWing(A, 'membrane', s, [s * 0.11, Y + 0.08, 0.1], W);
      /* the arm and its three fingers, along the leading edge and out across the membrane */
      const le = t => { const p = c(t); return [p[0], p[1] + 0.012, p[2] + 0.5 * (1 - 0.45 * t) * Math.sqrt(Math.max(0.03, 1 - t * t * t)) / 2 - 0.02]; };
      A.tube('scale', le, t => [0.025 * (1 - 0.6 * t), 0.022 * (1 - 0.6 * t)], 10, 6, C.body, { caps: true });
      for (const [t0, back] of [[0.45, 0.32], [0.6, 0.26], [0.75, 0.18]]) { const p = le(t0); A.cone('scale', p, [p[0] + s * 0.06, p[1] - 0.004, p[2] - back], 0.012, 0.004, C.dark, 4); }
    });
    /* the hind legs, to perch: thigh, shank, and three claws */
    for (const [s, i] of [[1, 0], [-1, 1]]) A.part('leg' + i, [s * 0.09, Y - 0.07, -0.1], () => {
      const pts = [[s * 0.09, Y - 0.07, -0.1], [s * 0.13, 0.26, 0.04], [s * 0.12, 0.06, -0.06]];
      /* straight thigh and shank with a knee knob (a spline here turned the tube's frame mid-leg and pinched a band at the ankle) */
      const L3 = (p, q) => t => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
      A.tube('scale', L3(pts[0], pts[1]), t => [0.05 - 0.012 * t, 0.055 - 0.014 * t], 3, 8, C.body);
      A.ellip('scale', pts[1][0], pts[1][1], pts[1][2], 0.039, 0.039, 0.039, C.body, { seg: 8 });
      A.tube('scale', L3(pts[1], pts[2]), t => [0.03 - 0.01 * t, 0.032 - 0.01 * t], 3, 8, C.wing, { caps: true });
      for (const a of [-0.5, 0, 0.5]) A.cone('horn', [s * 0.12, 0.05, -0.06], [s * 0.12 + Math.sin(a) * 0.09, 0.006, -0.06 + Math.cos(a) * 0.09], 0.012, 0.004, C.dark, 5);
      A.cone('horn', [s * 0.12, 0.05, -0.06], [s * 0.12, 0.006, -0.13], 0.01, 0.004, C.dark, 5);
    });
    A.anchor('perch', [0, 0, -0.06]);
  }
});

/* ====================================================================== the silt strider (79c-strider-model.js 37-182, 437-574)
   The original: a 40-unit, six-legged colossus (25 m, 15 m to its crest): a segmented thorax barrel with a keeled belly and
   five chitin ribs, an abdomen cone, a tall arched carapace with a crest and four ridge spikes, a head with two eyes and
   swept antennae, a long four-segment proboscis with joint collars, a hip nub per leg, and spindly two-segment legs with
   a high bent knee (hip, knee pushed 3.6 out and 3.9 up from the hip-foot midpoint, feet splayed to 9.9). Its baked
   colours are the chitin's (bone, mid, dark, light). Kept: every one of those parts at its own place and radius, the
   palette (taken 12% darker: the source bakes it light under a per-instance tint) and the leg geometry; the crest and
   spikes now follow the dome instead of floating off its ends, the ribs stand proud of the barrel all round, the shell gets
   its lining underneath. LEFT OUT (the culture's, not the animal's): the howdah, the handler's deck and the dark hollows
   carved into the shell's flanks: anchors 'howdah', 'handler', 'hollowL', 'hollowR' mark where they go. */
const FA_VO_STR = { chit: 0xd2b888, mid: 0xae9068, dark: 0x866848, lite: 0xf0dcb4, lining: 0x4a3a2c, eye: 0x2a2118, leg: 0x4a3a28 };
const FA_VO_STR_HIPZ = [6.0, 0.4, -5.6], FA_VO_STR_DOME = { c: [0, 14.6, 0.2], r: [5.9, 9.4, 8.6] };
function faVoStrCol(hex) { return faVoMul(hex, 0.88); }
function faVoStrDomeTop(z) { const D = FA_VO_STR_DOME, q = (z - D.c[2]) / D.r[2]; return D.c[1] + D.r[1] * Math.sqrt(Math.max(0, 1 - q * q)); }
ANIMAL({
  key: 'silt-strider', name: 'Silt strider', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['voth'], diet: 'omnivore', feeding: 'detritivore', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'shallows', 'marsh'], locomotion: ['walks', 'wades'] },
  size: { length: 25, height: 15.8 },
  source: [{ build: 'settlements/voth', file: 'src/79c-strider-model.js', lines: '37-182, 437-574', note: 'domestic: the strider guild\'s passenger (jade-tinted) and cargo (grey) convoys walking STRIDER_ROUTES between the stations (src/66-striders.js, routing src/79a-convoys.js, src/79b-strider-nav.js); a howdah on the back, a handler on a deck at the neck' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: false },
  yields: { meat: { amount: 6000, note: 'only when one dies: the guild sells the flesh in the cantons for a week' },
    hide: { amount: 1, hideM2: 450, note: 'the carapace chitin: armour plates, roof shells, a shell-house\'s hull' } },
  life: { maturity: 30, lifespan: 250, litter: 1, gestation: 540, note: 'invented: a strider is older than the guild that drives it' },
  w: 14.2, d: 25.6, h: 16.6,
  data: { mass: 30000, legs: 6, speed: { walk: 2.4, run: 4.5 }, gait: { type: 'hexapod', freq: 0.22, stride: 4.5 }, idle: { headYaw: 0.07, headPitch: 0.02 }, grazePitch: 0.3,
    herd: 'kept singly by the strider guild; walked in convoys of two or three', fleeDistance: 0, aggression: 0.02,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const U = FA_VO_U, P = p => [p[0] * U, p[1] * U, p[2] * U], C = {};
    for (const k in FA_VO_STR) C[k] = k === 'leg' ? FA_VO_STR[k] : faVoStrCol(FA_VO_STR[k]);
    const grain = (base, x, y, z, amp) => { const n = faNoise(x * 0.6, y * 0.6, z * 0.6) - 0.5; const c = new THREE.Color().setRGB(base[0], base[1], base[2]); return [c.r * (1 + amp * n), c.g * (1 + amp * n), c.b * (1 + amp * n)]; };
    /* the thorax barrel: r 5.0 behind to 4.4 in front, z -11.5..5.5, centre 14.2; the keeled underbelly below it */
    const thR = z => 5.0 + (4.4 - 5.0) * (z + 11.5) / 17;
    A.tube('chitin', t => P([0, 14.2, -11.5 + 17 * t]), t => { const r = thR(-11.5 + 17 * t) * U; return [r, r]; }, 16, 18, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.55 ? C.dark : grain(C.mid, 0, a * 4, t * 17, 0.12) });
    A.tube('chitin', t => P([0, 11.7, -10.5 + 15 * t]), t => { const r = (3.7 + (3.3 - 3.7) * t) * U; return [r * 0.95, r]; }, 10, 14, C.dark, { caps: true });
    /* five chitin ribs, proud of the barrel all round (the source's rearmost two sat inside it) */
    for (const [z, r0] of [[5.2, 4.6], [1.6, 5.3], [-2.2, 5.6], [-6.2, 5.3], [-9.8, 4.4]]) {
      const r = Math.max(r0, thR(z) + 0.3) * U;
      A.tube('chitin', t => P([0, 14.2, z - 0.55 + 1.1 * t]), () => [r, r], 1, 18, C.lite, { caps: true });
    }
    /* the abdomen, tapering to a point behind, its segments banded */
    A.tube('chitin', t => P([0, 14.0 + 0.4 * t, -11.2 - 6.65 * t]), t => { const r = 4.3 * U * Math.pow(1 - t, 0.75) + 0.02; return [r, r * 0.95]; }, 12, 16, null,
      { caps: true, colf: (t, a) => (Math.sin(t * 26) > 0.7 ? C.dark : Math.cos(a) < -0.6 ? C.dark : C.mid) });
    /* the tall arched carapace: the upper half of an ellipsoid on its rim, lined beneath */
    const D = FA_VO_STR_DOME;
    faVoDome(A, 'chitin', P(D.c), P(D.r), null, 14, 30, { under: C.lining, colf: (u, v) => { const ph = u * Math.PI / 2; return Math.sin(ph * 22) > 0.88 && u > 0.25 ? C.lite : grain(C.chit, v * 20, u * 8, 0, 0.14); } });
    /* the crest spine along the dome's top, and four ridge spikes on it */
    A.tube('chitin', t => { const z = -6.55 + 13.5 * t; return P([0, faVoStrDomeTop(z) - 0.2, z]); }, t => [0.55 * U, (0.6 + 0.4 * Math.sin(Math.PI * t)) * U], 12, 8, C.lite, { caps: true });
    for (const z of [3.8, 0.6, -2.6, -5.6]) { const y = faVoStrDomeTop(z) + 0.2 + 0.4 * Math.sin(Math.PI * (z + 6.55) / 13.5); A.cone('chitin', P([0, y, z]), P([0, y + 2.4, z - 0.3]), 0.85 * U, 0.04, C.lite, 8); }
    /* hip sockets: a nub per leg, so the legs come out of something */
    for (const hz of FA_VO_STR_HIPZ) for (const s of [1, -1]) A.ellip('chitin', s * 4.7 * U, 12.6 * U, hz * U, 1.55 * U, 1.55 * U, 1.55 * U, C.dark, { seg: 10 });
    /* the head, eyes, antennae and the long segmented proboscis: one part, turning about the back of the head */
    A.part('head', P([0, 14.6, 5.2]), () => {
      A.ellip('chitin', 0, 14.6 * U, 7.8 * U, 3.4 * U, 3.2 * U, 3.6 * U, null, { seg: 16, colf: (x, y, z) => y < -1.2 ? C.dark : grain(C.chit, x, y, z, 0.12) });
      for (const s of [1, -1]) {
        A.ellip('eye', s * 2.2 * U, 16.3 * U, 9.4 * U, 0.95 * U, 0.95 * U, 0.95 * U, C.eye, { seg: 10 });
        /* the antenna, sweeping up and forward (the source's rotated cylinder: base and tip worked out) */
        A.tube('chitin', faVoSpline([P([s * 1.31, 15.74, 8.74]), P([s * 1.95, 17.6, 11.5]), P([s * 2.49, 19.06, 14.06])]), t => { const r = (0.3 - 0.19 * t) * U; return [r, r]; }, 8, 6, C.dark, { caps: true });
      }
      /* four tapering tubes on one line, nose-down, with a collar at each joint (the owner's trimmed proboscis) */
      const z0 = 10.9, y0 = 13.9, dz = 3.3, dy = -1.07, r = [2.35, 1.92, 1.50, 1.02, 0.38];
      for (let i = 0; i < 4; i++) {
        A.tube('chitin', t => P([0, y0 + dy * (i + t * 1.02 - 0.01), z0 + dz * (i + t * 1.02 - 0.01)]), t => { const q = (r[i] + (r[i + 1] - r[i]) * t) * U; return [q, q]; }, 3, 12, i % 2 ? C.mid : C.dark, { caps: i === 3 });
        if (i < 3) { const jz = z0 + dz * (i + 1), jy = y0 + dy * (i + 1), q = r[i + 1] * 1.16 * U, n = 0.45 / Math.hypot(dz, dy);
          A.tube('chitin', t => P([0, jy + dy * n * (2 * t - 1), jz + dz * n * (2 * t - 1)]), () => [q, q], 1, 12, C.lite, { caps: true }); }
      }
      A.ellip('mouth', 0, (y0 + dy * 4) * U, (z0 + dz * 4 + 0.15) * U, 0.3 * U, 0.3 * U, 0.2 * U, 0x2a1810, { seg: 8 });
    });
    /* the six legs: hip, a high knee pushed out and up from the hip-foot midpoint, a foot splayed wide; femur and tibia taper
       as the source's bar (0.62 -> 0.42 of its width: femur 1.15, tibia 0.78). Standing, the front feet reach forward and the
       hind feet back (the source's stride is 7.5 units; this stance takes 1.5 of it) */
    for (let i = 0; i < 6; i++) {
      const pair = i >> 1, s = (i & 1) ? -1 : 1, hz = FA_VO_STR_HIPZ[pair], fz = hz + [1.5, 0, -1.5][pair];
      const hip = [s * 4.7, 12.6, hz], foot = [s * 9.9, 0.25, fz], knee = [(hip[0] + foot[0]) / 2 + s * 3.6, (hip[1] + 0) / 2 + 3.9, (hz + fz) / 2];
      A.part('leg' + i, P(hip), () => {
        const lc = (t, a) => faVoMix(C.leg, 0x2a2016, 0.25 * (1 - Math.cos(a)) / 2);
        A.tube('chitin', t => P([hip[0] + (knee[0] - hip[0]) * t, hip[1] + (knee[1] - hip[1]) * t, hip[2] + (knee[2] - hip[2]) * t]), t => { const q = (0.62 - 0.2 * t) * 1.15 * U; return [q, q]; }, 4, 10, null, { colf: lc });
        A.ellip('chitin', knee[0] * U, knee[1] * U, knee[2] * U, 0.62 * U, 0.62 * U, 0.62 * U, C.leg, { seg: 10 });
        A.tube('chitin', t => P([knee[0] + (foot[0] - knee[0]) * t, knee[1] + (foot[1] - knee[1]) * t, knee[2] + (foot[2] - knee[2]) * t]), t => { const q = (0.62 - 0.2 * t) * 0.78 * U; return [q, q]; }, 6, 10, null, { colf: lc });
        A.cone('chitin', P([foot[0], 0.6, foot[2]]), [foot[0] * U, 0.0, foot[2] * U], 0.4 * U, 0.06 * U, 0x2a2016, 8);   /* the foot's point */
        A.cone('chitin', P([knee[0], knee[1] + 0.3, knee[2]]), P([knee[0] + s * 0.6, knee[1] + 1.6, knee[2]]), 0.22 * U, 0.03, C.leg, 5);   /* a knee spur */
      });
    }
    /* where a people's riding gear goes (the source's howdah floor, handler's deck and the hollows in the flanks) */
    A.anchor('howdah', P([0, 20.2, -7.8])); A.anchor('handler', P([0, 20.4, 7.2]));
    A.anchor('hollowL', P([5.35, 15.6, -0.6])); A.anchor('hollowR', P([-5.35, 15.6, -0.6]));
    A.anchor('lead', P([0, 13.9, 10.9]));
  }
});

/* ====================================================================== the arena tiger (78j-life-arena.js 187-223, 533-535)
   The original: one pit-beast silhouette for tiger and lizard, told apart by instance colour and scale: the tiger is
   0xbe7530 at 1.15. A barrel body (r 0.75 front, 0.90 behind, 3.6 long), a box head with a paler snout, shoulder and haunch
   masses over four leg posts, paler paws and ears, a tail behind. At 1.15 x 0.595 m it is a big beast: 4.8 m nose to tail
   tip, 1.64 m at the shoulder (a real tiger at 1.6x). Kept: that size, the orange, the pale parts. Redrawn as a big cat
   (quality pass 2026-10-06; the boxy masses read as a toy): a long torso tapering from a deep chest to a tucked waist and up
   to the haunch; the scapula riding up into a hump at the withers, the elbow tucked behind the chest; the hind leg
   digitigrade with a high hock; big round paws; a broad, short-muzzled head with a rounded skull, whisker pads and small
   rounded ears (black backs with the white spot); a tiger's stripes, thinning toward the cream belly and inner legs; the
   long tail ringed to a black tip. Written in metres. */
const FA_VO_TIGER = { base: 0xbe7530, pale: 0xeee2cc, stripe: 0x24160c, nose: 0x3a2420, eye: 0xd8a830 };
/* smoothstep */
function faVoSm(a, b, x) { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
/* the tiger's coat at a point (metres) whose surface faces up by `top` (1 the back, -1 the belly) */
function faVoTigerCoat(x, y, z, top) {
  const C = FA_VO_TIGER, pale = faVoSm(-0.42, -0.75, top);
  let col = faVoMix(top > 0.75 ? faVoShade(C.base, -0.1) : C.base, C.pale, pale);
  /* the stripes: bands across the body, warped and forked by noise, thinning down the flank and gone on the belly */
  const q = z * 4.4 + 1.6 * (faNoise(z * 1.7 + 3, y * 2.1, Math.abs(x) * 1.4 + 7) - 0.5) + 0.35 * Math.sin(y * 5 + Math.abs(x) * 3);
  const d = Math.abs(q - Math.round(q)), w = 0.17 * faVoSm(-0.4, 0.45, top);
  if (w > 0.01 && faNoise(z * 3.3 + 11, y * 3.1, Math.abs(x) * 2 + 1) < 0.72) { const k = faVoSm(w, w * 0.45, d); if (k > 0) col = faVoMix(new THREE.Color().setRGB(col[0], col[1], col[2]).getHex(), C.stripe, k); }
  return col;
}
ANIMAL({
  key: 'arena-tiger', name: 'Arena tiger', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'aggressive',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps', 'swims'] },
  size: { length: 4.8, height: 1.7 },
  source: [{ build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '187-223, 525-536', note: 'captive: caught for the arena\'s afternoon bouts (12:00-18:00), loosed from the gate against the condemned and the armed (ARENA_STR tiger 1.8); drawn at 1.15x the pit-beast mesh, tinted 0xbe7530' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { hide: { amount: 1, hideM2: 5, note: 'the striped pelt: a victor\'s cloak, sold at the arena gate' } },
  life: { maturity: 3.5, lifespan: 18, litter: 3, gestation: 105 },
  w: 0.95, d: 5.0, h: 1.85,
  data: { mass: 650, legs: 4, speed: { walk: 1.5, run: 15 }, gait: { type: 'quadruped', freq: 0.9, stride: 1.2 }, grazePitch: 0.6,
    idle: { headYaw: 0.3, headPitch: 0.04, tailYaw: 0.18 },
    herd: 'solitary; the arena keeps a few in its pits', fleeDistance: 0, aggression: 0.85,
    schedule: ['REST', 'REST', 'REST', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'PATROL', 'HUNT', 'HUNT', 'HUNT', 'PATROL', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const C = FA_VO_TIGER, coat = faVoTigerCoat, F = 'sleek';
    const L3 = (a, b) => t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    /* the side a tube's section angle faces (the core's frame: +x along sin(angle) when this is +1) */
    const bx = (a, b) => { const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize(); return Math.abs(v.y) > 0.92 ? Math.sign(-v.y) : Math.sign(v.z) || 1; };
    /* ---- the torso: [z, top, bottom, half-width] from rump to the base of the neck: a deep chest, the waist tucked up,
       the back dipping behind the withers and rising a little over the loins */
    const Z0 = -1.42, Z1 = 1.22, key = faVoProf([[0, 1.30, 1.12, 0.07], [0.04, 1.40, 0.94, 0.23], [0.12, 1.47, 0.87, 0.30], [0.245, 1.50, 1.02, 0.29],
      [0.39, 1.49, 1.08, 0.27], [0.555, 1.51, 0.95, 0.30], [0.70, 1.56, 0.81, 0.33], [0.83, 1.64, 0.75, 0.35], [0.92, 1.61, 0.8, 0.33], [1, 1.50, 0.98, 0.22]]);
    const bc = t => { const k = key(t); return [0, (k[0] + k[1]) / 2, Z0 + (Z1 - Z0) * t]; }, br = t => { const k = key(t); return [k[2], (k[0] - k[1]) / 2]; };
    A.tube(F, bc, br, 48, 20, null, { caps: true, colf: (t, a) => { const p = bc(t), r = br(t); return coat(Math.sin(a) * r[0], p[1] + Math.cos(a) * r[1], p[2], Math.cos(a)); } });
    /* ---- the head (with the neck): a rounded skull, broad cheeks, a short muzzle with whisker pads; ears and jaw ride on it */
    A.part('head', [0, 1.38, 1.08], () => {
      A.tube(F, faVoSpline([[0, 1.3, 0.98], [0, 1.37, 1.22], [0, 1.43, 1.42]]), t => [0.25 - 0.05 * t, 0.3 - 0.07 * t], 6, 16, null,
        { colf: (t, a) => coat(Math.sin(a) * 0.22, 1.36 + Math.cos(a) * 0.26, 1.0 + 0.4 * t, Math.cos(a) * (Math.cos(a) < 0 ? 1.4 : 1)) });
      const head = (cx, cy, cz) => (x, y, z) => {
        const X = cx + x, Y = cy + y, Z = cz + z, ax = Math.abs(X);
        if (Y < 1.39 - 0.25 * Math.max(0, Z - 1.6) || (ax > 0.19 && Y < 1.42)) return Y < 1.36 || ax > 0.2 ? C.pale : faVoMix(C.base, C.pale, 0.55);   /* the cream cheeks, muzzle and chin */
        if (Y > 1.52 && ax < 0.14 && Z < 1.7 && Math.sin(ax * 60 + Z * 9) > 0.55) return C.stripe;   /* the forehead's marks */
        if (ax > 0.15 && Math.sin(Z * 26 - Y * 16) > 0.72) return C.stripe;   /* the cheek stripes */
        return Y > 1.62 ? faVoShade(C.base, -0.08) : C.base;
      };
      A.ellip(F, 0, 1.47, 1.5, 0.235, 0.215, 0.25, null, { seg: 16, colf: head(0, 1.47, 1.5) });   /* the cranium */
      for (const s of [-1, 1]) A.ellip(F, s * 0.15, 1.4, 1.54, 0.13, 0.15, 0.17, null, { seg: 10, rz: s * 0.25, colf: head(s * 0.15, 1.4, 1.54) });   /* cheeks and ruff */
      A.ellip(F, 0, 1.5, 1.7, 0.095, 0.075, 0.16, null, { seg: 10, rx: 0.12, colf: head(0, 1.5, 1.7) });   /* the bridge of the nose */
      A.ellip(F, 0, 1.4, 1.73, 0.15, 0.115, 0.14, null, { seg: 10, colf: head(0, 1.4, 1.73) });   /* the muzzle */
      for (const s of [-1, 1]) {
        A.ellip(F, s * 0.07, 1.365, 1.815, 0.08, 0.062, 0.066, null, { seg: 10, colf: (x, y, z) => (y > 0 && x * s > 0.02 && Math.sin(z * 120) > 0.6 && Math.sin(y * 140) > 0.3 ? C.stripe : C.pale) });   /* the whisker pads */
        A.ellip('eye', s * 0.112, 1.535, 1.7, 0.029, 0.026, 0.026, C.eye, { seg: 8 });
        A.ellip('eye', s * 0.118, 1.537, 1.726, 0.015, 0.015, 0.008, 0x080605, { seg: 6 });
        A.ellip(F, s * 0.112, 1.592, 1.685, 0.04, 0.016, 0.03, C.pale, { seg: 8 });   /* the white brow spot */
        A.ellip(F, s * 0.155, 1.535, 1.695, 0.02, 0.04, 0.02, C.stripe, { seg: 6, rz: s * 0.4 });   /* the dark line from the eye's outer corner */
      }
      A.ellip('skin', 0, 1.432, 1.875, 0.055, 0.032, 0.032, C.nose, { seg: 8, rx: -0.3 });
      A.cone('mouth', [0, 1.41, 1.885], [0, 1.355, 1.865], 0.007, 0.007, 0x2a1a16, 4);   /* the philtrum */
      /* whiskers: white, fanning out of the pads */
      const wh = [];
      for (const s of [-1, 1]) for (let k = 0; k < 6; k++) wh.push({ at: [s * 0.12, 1.33 + 0.012 * k, 1.8 + 0.008 * (k % 3)], dir: [s, 0.08 * (k - 2.5) - 0.1, -0.25 - 0.06 * (k % 2)], len: 0.2 + 0.03 * (k % 3), w: 0.007, col: 0xf2eee4, curl: 0.15 });
      A.locks('hair', wh);
    });
    /* the lower jaw: a pale chin behind the muzzle, the dark lip line along it */
    A.part('jaw', [0, 1.33, 1.52], () => {
      A.ellip(F, 0, 1.285, 1.72, 0.1, 0.055, 0.13, C.pale, { seg: 10 });
      A.ellip('mouth', 0, 1.322, 1.76, 0.115, 0.012, 0.1, 0x2a1a16, { seg: 10 });
    });
    /* small rounded ears, set wide: pale inside, black behind with the white spot */
    for (const s of [1, -1]) A.part(s > 0 ? 'earL' : 'earR', [s * 0.15, 1.64, 1.43], () => {
      A.ellip(F, s * 0.17, 1.705, 1.41, 0.07, 0.075, 0.026, null, { seg: 10, ry: -s * 0.3, rz: -s * 0.35,
        colf: (x, y, z) => z > 0.004 ? (Math.hypot(x, y) > 0.042 ? C.base : faVoMix(C.base, C.pale, 0.7)) : (Math.hypot(x, y + 0.008) < 0.03 ? C.pale : C.stripe) });
    });
    /* ---- the tail: from the rump it falls and hangs in a long curve, lifting at the tip; ringed, the tip black */
    A.part('tail', [0, 1.37, -1.32], () => {
      const tc = faVoSpline([[0, 1.37, -1.32], [0, 1.2, -1.7], [0, 0.9, -2.1], [0, 0.66, -2.5], [0.04, 0.55, -2.8], [0.08, 0.6, -3.02]]);
      A.tube(F, tc, t => { const r = 0.095 - 0.035 * t; return [r, r]; }, 18, 10, null, { caps: true,
        colf: (t, a) => t > 0.9 || (t > 0.42 && Math.sin(t * 46) > 0.45) ? C.stripe : (Math.cos(a) < -0.4 ? faVoMix(C.base, C.pale, 0.6) : (t < 0.42 && Math.sin(t * 40) > 0.6 ? C.stripe : C.base)) });
    });
    /* ---- the legs: each swings about its shoulder or hip. The upper masses (scapula, arm, thigh) take the flank's stripes
       and sit mostly inside the torso, proud only where a cat's are (the hump at the withers, the haunch); the lower leg is
       orange outside with a few thin bars, cream inside */
    const legCol = (s, side, x, y, z) => {
      if (side < -0.35) return faVoMix(C.base, C.pale, 0.6);
      const st = faVoSm(0.35, 0.7, y), q = y * 6 + 0.9 * (faNoise(x * 2 + 4, y * 2.2, z * 2.2) - 0.5), d = Math.abs(q - Math.round(q));
      return st > 0 && d < 0.08 * st && faNoise(x * 3, y * 4, z * 3 + 2) < 0.7 ? C.stripe : (y < 0.3 ? faVoMix(C.base, C.pale, 0.2) : C.base);
    };
    const seg = (s, a, b, ra, rb, nt) => { const sg = bx(a, b), c = L3(a, b);
      A.tube(F, c, t => [ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t], nt || 4, 12, null, { colf: (t, ang) => { const p = c(t); return legCol(s, Math.sin(ang) * sg * s, p[0], p[1], p[2]); } }); };
    const mass = (s, c, r, rx, seg2) => A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], null, { seg: seg2 || 10, rx: rx, colf: (x, y, z) => legCol(s, x * s / r[0], c[0] + x, c[1] + y, c[2] + z) });
    const flank = (s, c, r, rx, seg2) => A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], null, { seg: seg2 || 10, rx: rx,
      colf: (x, y, z) => x * s / r[0] < -0.5 ? faVoMix(C.base, C.pale, 0.6) : coat(c[0] + x, c[1] + y, c[2] + z, Math.max(-1, Math.min(1, 1.2 * y / r[1] + 0.2))) });
    const paw = (s, c, r) => {
      A.ellip(F, c[0], c[1], c[2], r[0], r[1], r[2], faVoMix(C.base, C.pale, 0.3), { seg: 10 });
      for (const k of [-1.5, -0.5, 0.5, 1.5]) A.ellip(F, c[0] + k * r[0] * 0.44, 0.045, c[2] + r[2] * (0.72 - 0.1 * Math.abs(k)), r[0] * 0.34, 0.045, r[2] * 0.36, faVoMix(C.base, C.pale, 0.4), { seg: 5 });
    };
    for (const [front, s, i] of [[1, 1, 0], [1, -1, 1], [0, 1, 2], [0, -1, 3]]) {
      const X = v => [s * v[0], v[1], v[2]];
      if (front) A.part('leg' + i, X([0.24, 1.42, 0.82]), () => {
        const EL = X([0.25, 0.82, 0.69]), WR = X([0.24, 0.21, 0.77]), PS = X([0.24, 0.1, 0.83]);
        flank(s, X([0.22, 1.33, 0.86]), [0.12, 0.3, 0.19], -0.45);   /* the scapula, under the hump at the withers */
        flank(s, X([0.235, 1.0, 0.84]), [0.1, 0.25, 0.16], 0.78);   /* the upper arm, down and back to the elbow */
        mass(s, X([0.24, 0.82, 0.67]), [0.085, 0.085, 0.08], 0, 8);   /* the point of the elbow, behind the chest */
        seg(s, EL, WR, [0.12, 0.13], [0.085, 0.08], 4);
        mass(s, X([0.25, 0.6, 0.735]), [0.12, 0.22, 0.13], -0.12);   /* the forearm's muscle */
        seg(s, WR, PS, [0.085, 0.08], [0.085, 0.08], 2);
        paw(s, X([0.24, 0.075, 0.86]), [0.125, 0.075, 0.14]);
      });
      else A.part('leg' + i, X([0.25, 1.25, -0.95]), () => {
        const ST = X([0.28, 0.8, -0.68]), HK = X([0.25, 0.5, -1.1]), MT = X([0.24, 0.1, -0.98]);
        flank(s, X([0.24, 1.06, -0.9]), [0.15, 0.36, 0.3], -0.54, 12);   /* the thigh and haunch */
        seg(s, ST, HK, [0.12, 0.15], [0.07, 0.075], 4);
        mass(s, X([0.25, 0.72, -0.89]), [0.1, 0.19, 0.12], 0.95);   /* the calf */
        mass(s, X([0.25, 0.52, -1.135]), [0.065, 0.075, 0.085], 0, 8);   /* the hock, high off the ground */
        seg(s, HK, MT, [0.07, 0.075], [0.075, 0.075], 3);
        paw(s, X([0.24, 0.07, -0.91]), [0.115, 0.07, 0.13]);
      });
    }
  }
});

/* ====================================================================== the pit lizard (78j-life-arena.js 187-223, 533-535)
   The original: the same pit-beast silhouette as the tiger at 0.92, tinted 0x6d8a4b (the caravans' draught "lizard" is a
   data field on a generic quadruped, 78i-life-trade.js). Kept: its length (3.9 m nose to tail at 0.92 x 0.595 m), the barrel
   body, the boxy head with a paler jaw, the shoulder and haunch masses and the green; refined into a lizard: the legs
   splay out at the elbow and knee onto clawed feet (a semi-sprawl, so its back is lower than the source's), the tail is
   thick at the root and tapers (the source's thickened toward the tip), a row of scutes runs down the back and it is banded. */
const FA_VO_LIZ = { base: 0x6d8a4b, belly: 0xc4c48a, band: 0x3e5228, scute: 0x4a5c32, eye: 0xc89a28, claw: 0x2a2a20 };
ANIMAL({
  key: 'pit-lizard', name: 'Pit lizard', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'defensive',
    habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'swims'] },
  size: { length: 3.9, height: 1.05 },
  source: [{ build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '187-223, 525-536', note: 'captive: an arena beast, hunted by two armed men in the pit (ARENA_STR lizard 1.2); drawn at 0.92x the pit-beast mesh, tinted 0x6d8a4b' },
    { build: 'settlements/voth', file: 'src/78i-life-trade.js', lines: '195-206, 372', note: 'domestic: a merchant caravan\'s draught animal (ox, lizard or beetle, a data field on one generic quadruped)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 70, note: 'white, tail meat the best' }, eggs: { amount: 18, note: 'one clutch a year, buried in warm sand' },
    hide: { amount: 1, hideM2: 3, note: 'scaled hide: boots, shield facings' } },
  life: { maturity: 3, lifespan: 30, litter: 18, gestation: 70, note: 'eggs; gestation: incubation in the sand' },
  w: 2.0, d: 4.2, h: 1.15,
  data: { mass: 300, legs: 4, speed: { walk: 1.0, run: 6 }, gait: { type: 'sprawl', freq: 1.0, stride: 0.7 }, grazePitch: 0.35,
    herd: 'solitary wild; caravans keep one to a cart', fleeDistance: 2, aggression: 0.5,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = 0.92 * FA_VO_U, P = p => [p[0] * K, p[1] * K, p[2] * K], C = FA_VO_LIZ;
    const skin = (z, a) => { const top = Math.cos(a); if (top < -0.5) return C.belly;
      const n = faNoise(z * 3.1, a * 2.0, 4.4); return (Math.sin(z * 4.2 + 1.3) > 0.55 && top > -0.3) || n > 0.72 ? C.band : C.base; };   /* the phase keeps a band off the neck (it read as a collar) */
    /* the body: low and broad (the source's barrel, r 0.9 behind and 0.75 in front) */
    const bc = faVoSpline([P([0, 1.22, -1.75]), P([0, 1.3, -1.1]), P([0, 1.32, 0.2]), P([0, 1.34, 1.3]), P([0, 1.38, 1.95])]);
    const br = faVoProf([[0, 0.55, 0.45], [0.15, 0.82, 0.62], [0.5, 0.9, 0.66], [0.82, 0.78, 0.6], [1, 0.52, 0.44]]);
    A.tube('scale', bc, t => br(t).map(v => v * K), 16, 14, null, { caps: true, colf: (t, a) => skin(bc(t)[2] / K, a) });
    /* scutes down the spine */
    for (let k = 0; k < 9; k++) { const t = 0.08 + k * 0.105, p = bc(t), h = br(t)[1] * K; A.cone('horn', [0, p[1] + h - 0.02, p[2]], [0, p[1] + h + 0.07 * K + 0.04, p[2] - 0.06], 0.07 * K, 0.008, C.scute, 5); }
    /* the head: a wedge from the neck to the snout, eyes on its sides; the paler jaw beneath it */
    A.part('head', P([0, 1.38, 1.8]), () => {
      const hc = t => P([0, 1.42 - 0.12 * t, 1.75 + 1.55 * t]), hr = faVoProf([[0, 0.5, 0.42], [0.35, 0.52, 0.4], [0.8, 0.34, 0.24], [1, 0.2, 0.14]]);
      A.tube('scale', hc, t => hr(t).map(v => v * K), 10, 12, null, { caps: true, colf: (t, a) => Math.cos(a) < -0.4 ? C.belly : (t > 0.2 && Math.cos(a) > 0.6 && faNoise(t * 9, a * 3, 1) > 0.6 ? C.band : C.base) });
      for (const s of [-1, 1]) { A.ellip('eye', s * 0.4 * K, 1.58 * K, 2.42 * K, 0.1 * K, 0.08 * K, 0.1 * K, C.eye, { seg: 8 }); A.ellip('eye', s * 0.44 * K, 1.58 * K, 2.44 * K, 0.03 * K, 0.07 * K, 0.04 * K, 0x080605, { seg: 6 });
        A.ellip('mouth', s * 0.1 * K, 1.4 * K, 3.24 * K, 0.035 * K, 0.025 * K, 0.03 * K, 0x1a1410, { seg: 6 }); }
    });
    A.part('jaw', P([0, 1.15, 1.95]), () => {
      A.tube('scale', t => P([0, 1.12 - 0.03 * t, 1.85 + 1.35 * t]), t => [(0.42 - 0.24 * t) * K, (0.13 - 0.06 * t) * K], 6, 10, C.belly, { caps: true });
    });
    /* the tail: thick at the root, tapering to a whip that rests near the ground */
    A.part('tail', P([0, 1.2, -1.65]), () => {
      const tc = faVoSpline([P([0, 1.2, -1.65]), P([0, 0.95, -2.5]), P([0.12, 0.6, -3.2]), P([0.32, 0.36, -3.85])]);
      A.tube('scale', tc, t => { const r = (0.55 * Math.pow(1 - t, 0.9) + 0.04) * K; return [r, r * 0.85]; }, 14, 10, null, { caps: true, colf: (t, a) => skin(-1.65 - t * 2.2, a) });
    });
    /* the legs: shoulder and haunch masses at the source's places, the limb splaying out to an elbow (knee) and down onto a
       clawed foot */
    for (const [z, front, s, i] of [[1.2, 1, 1, 0], [1.2, 1, -1, 1], [-1.2, 0, 1, 2], [-1.2, 0, -1, 3]]) A.part('leg' + i, P([s * 0.6, 1.2, z]), () => {
      const m = front ? [0.48, 0.44, 0.6] : [0.55, 0.5, 0.68];
      A.ellip('scale', s * 0.6 * K, 1.2 * K, z * K, m[0] * K, m[1] * K, m[2] * K, null, { seg: 12, colf: (x, y) => y < -0.25 * K ? C.belly : C.base });
      const el = [s * 1.4, 0.84, z + (front ? -0.12 : 0.18)], ft = [s * 1.34, 0.12, z + (front ? 0.25 : -0.08)];   /* the elbow out and back, the knee out and forward: a sprawl */
      A.tube('scale', faVoSpline([P([s * 0.75, 1.15, z]), P([(s * 0.75 + el[0]) / 2, 1.06, (z + el[2]) / 2]), P(el)]), t => { const r = (0.3 - 0.06 * t) * K; return [r, r]; }, 5, 10, null, { colf: (t, a) => Math.cos(a) < -0.3 ? C.belly : C.base });
      A.ellip('scale', el[0] * K, el[1] * K, el[2] * K, 0.24 * K, 0.24 * K, 0.24 * K, C.base, { seg: 10 });
      A.tube('scale', faVoSpline([P(el), P([(el[0] + ft[0]) / 2 + s * 0.05, 0.48, (el[2] + ft[2]) / 2]), P(ft)]), t => { const r = (0.22 - 0.06 * t) * K; return [r, r]; }, 6, 10, null, { colf: (t, a) => skin(z + t, a) });
      A.ellip('scale', ft[0] * K, 0.1 * K, (ft[2] + 0.1) * K, 0.24 * K, 0.1 * K, 0.3 * K, C.base, { seg: 10 });
      for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.38 + s * (front ? 0.35 : 0.5);
        A.cone('horn', [ft[0] * K, 0.06 * K, (ft[2] + 0.2) * K], [(ft[0] + Math.sin(a) * 0.42) * K, 0.02, (ft[2] + 0.2 + Math.cos(a) * 0.42) * K], 0.05 * K, 0.012, C.claw, 4); }
    });
  }
});

/* ====================================================================== the giant beetle (65k-granary-mills-ranch.js 435-476; 78j-life-arena.js 225-251)
   The ranch's beetleModel() is the richer original (the arena's copy lifts its proportions): an abdomen, thorax and head,
   each a dome (r 1.5, 1.0, 0.55 units; 0.88, 0.94, 0.86 as tall) on a body raised by its own legs (0.95 of the abdomen's
   radius); the thorax a shade lighter, the head a shade darker, the legs darker still (shade -0.24); two antennae forward
   and out; six legs in three pairs. Its shell colour is a bark or a leaf tone shaded -0.22; the arena's is 0x4b4034 at
   1.15. Kept: every dome at its place and size, the shades, all three shell colours (variants) and both sizes (breeds);
   refined: the domes get an underside, the elytra a seam, the antennae rise, and the six stub posts become a beetle's legs.
   Quality pass (2026-10-06): the posts held the body high on stilts; now the body sits low (the rim at 0.95 units, not
   1.425) and each leg leaves it sideways under the shell's edge (coxa), the femur rises up and out to a knee past the rim,
   the tibia comes down to the ground well outside the body and the tarsus lies on the ground, front legs forward, hind back. */
const FA_VO_BEETLE_SHELL = [faVoShade(0x5d5140, -0.22), faVoShade(0x4e5a34, -0.22), 0x4b4034];
ANIMAL({
  key: 'giant-beetle', name: 'Giant beetle', group: 'voth',
  tags: { biomes: ['swbay'], koppen: FA_VO_KOPPEN, aridity: ['semiarid', 'subhumid', 'humid'], climate: FA_VO_CLIMATE, riparian: 'both', abyssal: false,
    domestic: true, herdedBy: ['voth'], diet: 'herbivore', feeding: 'mixed', activity: 'diurnal', temperament: 'docile',
    habitat: ['ground', 'marsh', 'pen'], locomotion: ['walks', 'burrows'] },
  size: { length: 3.6, height: 1.35 },
  source: [{ build: 'settlements/voth', file: 'src/65k-granary-mills-ranch.js', lines: '435-476, 556-561', note: 'domestic livestock: a scatter of static beetles in beetleRanch()\'s fenced corral with a byre and feed troughs (defined; not yet placed in the city)' },
    { build: 'settlements/voth', file: 'src/78j-life-arena.js', lines: '225-251, 525-530', note: 'captive: an arena pit beast ("one blade against a shell", ARENA_STR beetle 1.45), drawn at 1.15, tinted 0x4b4034' },
    { build: 'settlements/voth', file: 'src/78i-life-trade.js', lines: '195-206, 372', note: 'draught: a merchant caravan\'s beetle (a data field on one generic quadruped)' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: false, draught: true, eggs: true },
  yields: { meat: { amount: 150, note: 'pale, sweet; boiled in the shell' }, eggs: { amount: 40, note: 'laid in the byre\'s litter; eaten pickled' },
    hide: { amount: 1, hideM2: 5, note: 'the shell: chitin plates for armour, bowls and roofing' } },
  life: { maturity: 1.5, lifespan: 12, litter: 40, gestation: 18, note: 'eggs, then a grub a season in the byre\'s dung; gestation: incubation' },
  variants: 3, variantNames: ['ranch: bark-brown', 'ranch: moss-green', 'arena: umber'],
  breeds: { ranch: { scale: 1, mass: 900, role: 'livestock and draught' }, pit: { scale: 1.15, mass: 1370, role: 'arena pit beetle' } },
  w: 3.4, d: 3.8, h: 1.45,
  data: { mass: 900, legs: 6, speed: { walk: 0.8, run: 2.5 }, gait: { type: 'hexapod', freq: 1.2, stride: 0.45 }, grazePitch: 0.3,
    herd: 'a ranch herd of six to twelve in a corral; caravans keep one to a cart', fleeDistance: 1, aggression: 0.1,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'WORK', 'WORK', 'WORK', 'WORK', 'GRAZE', 'REST', 'REST', 'WORK', 'WORK', 'WORK', 'GRAZE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) {
    const K = FA_VO_U * A.S, P = p => [p[0] * K, p[1] * K, p[2] * K];
    const shell = FA_VO_BEETLE_SHELL[A.variant] || FA_VO_BEETLE_SHELL[0], leg = faVoShade(shell, -0.24), under = faVoShade(shell, -0.4);
    const LH = 0.95, bodyLen = 4.6;   /* the shell's rim: the source's 1.425 held the body high on stilts */
    const sheen = (hex, u, v, k) => { const c = new THREE.Color(hex), n = 1 + 0.18 * (faNoise(u * 6, v * 30, k) - 0.5) + 0.12 * Math.pow(Math.max(0, 1 - u * 1.6), 3); return [c.r * n, c.g * n, c.b * n]; };
    /* the abdomen, thorax and head domes on the leg-top plane; each has an underside */
    const abd = [0, LH, -bodyLen * 0.30], thx = [0, LH, bodyLen * 0.06], hd = [0, LH + 0.15, bodyLen * 0.40];
    faVoDome(A, 'chitin', P(abd), P([1.5, 1.32, 1.5]), null, 10, 24, { colf: (u, v) => Math.abs(Math.cos(v * TAU)) < 0.025 && Math.sin(v * TAU) < 0.3 ? under : sheen(shell, u, v, 1) });
    A.ellip('chitin', abd[0] * K, LH * K, abd[2] * K, 1.42 * K, 0.34 * K, 1.42 * K, under, { seg: 16 });
    const thc = faVoShade(shell, 0.05);
    faVoDome(A, 'chitin', P(thx), P([1.0, 0.94, 1.0]), null, 8, 20, { colf: (u, v) => sheen(thc, u, v, 2) });
    A.ellip('chitin', thx[0] * K, LH * K, thx[2] * K, 0.94 * K, 0.3 * K, 0.94 * K, under, { seg: 14 });
    /* the head, with its antennae: it turns about the thorax's front */
    A.part('head', P([0, LH + 0.1, bodyLen * 0.30]), () => {
      const hc = faVoShade(shell, -0.05);
      faVoDome(A, 'chitin', P(hd), P([0.55, 0.473, 0.55]), null, 6, 16, { colf: (u, v) => sheen(hc, u, v, 3) });
      A.ellip('chitin', hd[0] * K, hd[1] * K, hd[2] * K, 0.5 * K, 0.2 * K, 0.5 * K, under, { seg: 10 });
      for (const s of [-1, 1]) {
        A.ellip('eye', s * 0.4 * K, (hd[1] + 0.18) * K, (hd[2] + 0.22) * K, 0.12 * K, 0.1 * K, 0.12 * K, 0x0e0c0a, { seg: 8 });
        /* the antenna: from the head's front, forward, out and up (the source's 1.1-unit bar at 0.4 rad out) */
        A.tube('chitin', faVoSpline([P([s * 0.2, hd[1] + 0.3, hd[2] + 0.42]), P([s * 0.42, hd[1] + 0.62, hd[2] + 0.9]), P([s * 0.62, hd[1] + 0.72, hd[2] + 1.38])]),
          () => [0.05 * K, 0.05 * K], 6, 5, leg, { caps: true });
        A.cone('chitin', P([s * 0.12, hd[1] - 0.1, hd[2] + 0.5]), P([s * 0.05, hd[1] - 0.22, hd[2] + 0.75]), 0.08 * K, 0.01, under, 5);   /* the mandibles */
      }
    });
    /* six legs, as a beetle's: the coxa under the shell's edge, the femur rising up and out past the rim to a high knee, the
       tibia (spurred) down to the ground well outside the body, the tarsus (three beads and a pair of claws) on the ground;
       the front pair reach forward, the middle out, the hind back. [coxa, knee, tibia's end, tarsus tip] in source units */
    const LEGS = [[[0.7, LH - 0.32, 0.6], [1.45, LH + 0.3, 1.05], [1.9, 0.1, 1.5], [2.05, 0.03, 2.05]],
      [[0.85, LH - 0.32, -0.3], [1.95, LH + 0.4, -0.22], [2.3, 0.1, -0.1], [2.62, 0.03, 0.08]],
      [[0.9, LH - 0.35, -0.8], [1.9, LH + 0.25, -1.35], [2.2, 0.1, -2.0], [2.32, 0.03, -2.55]]];
    const L3 = (a, b) => t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    for (let i = 0; i < 6; i++) {
      const s = (i & 1) ? -1 : 1, X = v => P([s * v[0], v[1], v[2]]), [cx, kn, tb, ts] = LEGS[i >> 1].map(X);
      A.part('leg' + i, cx, () => {
        A.ellip('chitin', cx[0], cx[1], cx[2], 0.22 * K, 0.17 * K, 0.2 * K, under, { seg: 8 });   /* the coxa */
        A.tube('chitin', L3(cx, kn), t => [(0.15 - 0.03 * t) * K, (0.2 - 0.04 * t) * K], 4, 8, null, { colf: (t, a) => Math.cos(a) < -0.3 ? under : leg });   /* the femur */
        A.ellip('chitin', kn[0], kn[1], kn[2], 0.14 * K, 0.14 * K, 0.14 * K, leg, { seg: 8 });
        A.tube('chitin', L3(kn, tb), t => { const r = (0.115 - 0.04 * t) * K; return [r, r]; }, 4, 8, leg);   /* the tibia */
        for (const f of [0.35, 0.6, 0.85]) { const p = L3(kn, tb)(f); A.cone('chitin', p, [p[0], p[1] - 0.05 * K, p[2] - 0.15 * K], 0.03 * K, 0.004, under, 4); }
        /* the tarsus: three beads along the ground and the claws */
        const tr = L3(tb, ts);
        for (const [f, r] of [[0.12, 0.085], [0.42, 0.075], [0.72, 0.065]]) { const p = tr(f); A.ellip('chitin', p[0], Math.max(p[1], r * K * 0.75), p[2], r * K, r * K * 0.75, r * K * 1.6, leg, { seg: 6, ry: Math.atan2(ts[0] - tb[0], ts[2] - tb[2]) }); }
        const tip = tr(0.92), dx = ts[0] - tb[0], dz = ts[2] - tb[2], dl = Math.hypot(dx, dz), ux = dx / dl, uz = dz / dl;
        for (const k of [-1, 1]) A.cone('chitin', tip, [ts[0] + (ux * 0.12 - uz * k * 0.08) * K, 0.0, ts[2] + (uz * 0.12 + ux * k * 0.08) * K], 0.03 * K, 0.004, under, 4);
      });
    }
    A.anchor('pack', P([0, LH + 1.32, abd[2]])); A.anchor('yoke', P([0, LH + 0.6, thx[2]])); A.anchor('lead', P([0, LH, hd[2] + 0.5]));
  }
});
