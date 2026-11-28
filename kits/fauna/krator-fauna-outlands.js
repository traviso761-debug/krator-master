/* ======================================================================
   Krator Fauna: the Outlands' birds (kits/fauna/krator-fauna-outlands.js)
   The three Earth-like birds of the Outlands and the Tiers that the Coyote Men live with (biomes/outlands/PLAN.md section 7,
   biomes/tiers/PLAN.md section 4; kits/coyote, culture `coyote`), added 2026-11-16:
   - the ostrich, farmed and wild, ridden by scouts and packed by caravans, every part used. Two procedural plumages (the
     cock, the hen) drawn on the desert file's ratite helpers (faDs*: this file needs krator-fauna-desert.js, which sorts
     before it), and a baked Tripo model. Every variant carries the anchors (saddle, pack, bridle ...) the Coyote kit's
     saddles and pack frames fit to; the tack stays with the kit.
   - the runner bird, the trickster god's form on the roads: a ground cuckoo grown large (1.1 m), its own bird with a
     blue-violet crest and tail (the nod to the cartoon is the colour and the run, not the drawing). A baked model only.
   - the golden bird, the phoenix's living form: a great golden raptor of the thermals (span about 2.5 m, Rueppell's
     vulture's altitude). A baked model only, standing with its wings raised; its own flap and glide clips.
   The models were made on Tripo (rig/tripo_gen.py: a reference image, Tripo's four views, the textured model) and cut and
   rigged by the kit's scripts (rig/qmodel.py for the two walkers, rig/fbuild.py and rig/frig.py for the raptor), packed by
   models_pack.py; their sources are in rig/sources/<key>/. A bundle without models (mdl=False) draws the ostrich's
   procedural build and nothing for the other two (an empty frame, as for the dog and the cat).
   ====================================================================== */
const FA_OL_TAGS = { biomes: ['outlands', 'tiers', 'outlandgate', 'greatchasm'], koppen: ['BSk', 'BWk', 'Dfb', 'Cfa'], aridity: ['arid', 'semiarid', 'subhumid'],
  climate: ['temperate', 'cold'], riparian: 'non', abyssal: false };
const FA_OL_SRC = 'biomes/outlands/PLAN.md';

/* ---------------------------------------------------------------- the ostrich */
/* the ostrich of the plains and the herders' pens: 2.5 m to the crown, about 110 kg. The cock black with white wing and tail
   plumes, the bare neck and legs flushed pink; the hen grey-brown with dun plumes. Drawn as the sand strider is (the desert
   file's egg body, skirt, neck and bare legs) at 0.86 of its size, with the ostrich's two toes: the great inner toe with its
   nail, the small outer toe */
const FA_OL_OSTRICH = [
  { body: 0x1b1817, mott: 0x2c2826, plume: 0xefebe2, skin: 0xd8a097, leg: 0xc98a82, bill: 0xc7a090, eye: 0x2a1a0a },
  { body: 0x6c6053, mott: 0x7f725f, plume: 0xb9ad99, skin: 0xa3958a, leg: 0x968880, bill: 0x9a8a78, eye: 0x2a1a0a }];
function faOlOstrich(A, V) {
  const K = 0.86, P = p => [p[0] * K, p[1] * K, p[2] * K];
  const coat = (x, y, z, k) => { const n = faNoise(x * 6 + 1.3, y * 6, z * 6); return faDsShade(n > 0.6 ? V.mott : V.body, k * (0.94 + 0.12 * n)); };
  /* the body: the egg, deepest under the wings, the back level, narrowing to the rump */
  const BZ = [[-0.86, 1.56, 0.05, 0.06], [-0.72, 1.53, 0.2, 0.22], [-0.42, 1.5, 0.3, 0.32], [-0.05, 1.48, 0.33, 0.36], [0.3, 1.52, 0.31, 0.34], [0.55, 1.6, 0.22, 0.24], [0.7, 1.68, 0.07, 0.08]];
  const bc0 = faDsSpline(BZ.map(b => [0, b[1], b[0]])), br0 = faDsRad(BZ.map(b => [b[2], b[3]]));
  const bc = t => P(bc0(t)), br = t => { const r = br0(t); return [r[0] * K, r[1] * K]; };
  faDsTube(A, 'feather', bc, br, 16, 16, null, { caps: true, colf: (t, a) => { const p = bc(t); return coat(Math.sin(a) * 0.4, p[1] + Math.cos(a) * 0.4, p[2], Math.cos(a) < -0.3 ? 0.98 : 0.8); } });
  /* the plumage over the thighs; the small wings at the flanks with their white plumes; the tail's plumes */
  const skirt = [];
  for (let i = 0; i < 40; i++) {
    const z = A.rr(-0.6, 0.45), s = A.rnd() < 0.5 ? -1 : 1, t = (z + 0.86) / 1.56, r = br0(t), p = bc0(t), a = A.rr(1.9, 2.5);
    const at = [s * Math.sin(a) * r[0] * 0.98, p[1] + Math.cos(a) * r[1] * 0.98, z];
    skirt.push({ at: P(at), dir: [s * 0.25, -1, A.rr(-0.25, 0.1)], side: [0, 0, 1], len: A.rr(0.14, 0.26), w: A.rr(0.09, 0.12), col: coat(at[0], at[1], at[2], 0.78), curl: 0.25 });
  }
  for (const s of [-1, 1]) {
    A.ellip('feather', s * 0.27 * K, 1.56 * K, -0.08 * K, 0.075 * K, 0.13 * K, 0.34 * K, null, { seg: 12, rx: -0.18, rz: s * 0.12, colf: (x, y, z) => coat(s * 0.3 + x, 1.56 + y, z, 0.66) });
    for (let k = 0; k < 9; k++) { const z = 0.14 - k * 0.07; skirt.push({ at: P([s * 0.33, 1.46 + 0.02 * k, z]), dir: [s * 0.22, -0.9, -0.5], side: [0, 0, 1], len: A.rr(0.26, 0.34), w: 0.12, col: faDsShade(V.plume, k % 2 ? 1.0 : 0.92), curl: 0.45 }); }
  }
  A.locks('feather', skirt);
  /* the neck: bare and flushed, a ruff of body feathers at its root; a small flat head, big eyes, the broad bill */
  A.part('head', P([0, 1.25, 0.4]), () => {
    const nc0 = faDsSpline([[0, 1.3, 0.15], [0, 1.8, 0.6], [0, 2.2, 0.82], [0, 2.55, 0.99], [0, 2.76, 1.09]]), nc = t => P(nc0(t));
    const nr0 = faDsRad([[0.2, 0.22], [0.13, 0.14], [0.075, 0.08], [0.06, 0.062], [0.06, 0.062]]);
    faDsTube(A, 'skin', nc, t => { const r = nr0(t); return [r[0] * K, r[1] * K]; }, 14, 10, null,
      { caps: true, colf: (t, a) => { const p = nc(t); return t < 0.22 ? coat(0, p[1], p[2], 0.78) : faDsShade(V.skin, 0.95 - 0.1 * Math.max(0, Math.cos(a))); } });
    const ruff = [];
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, p = nc0(0.22), r = 0.15; ruff.push({ at: P([Math.sin(a) * r, p[1] + Math.cos(a) * r * 0.6, p[2] - Math.cos(a) * 0.04]), dir: [Math.sin(a) * 0.6, -1, -Math.cos(a) * 0.5], len: 0.1, w: 0.06, col: coat(0, p[1], p[2], 0.8), curl: 0.2 }); }
    A.locks('feather', ruff);
    A.ellip('feather', 0, 2.85 * K, 1.15 * K, 0.085 * K, 0.09 * K, 0.125 * K, null, { seg: 12, colf: (x, y, z) => faDsShade(V.skin, y > 0.03 ? 0.85 : 1.0) });
    faDsTube(A, 'horn', t => P([0, 2.835 - 0.04 * t * t, 1.23 + 0.25 * t]), t => [(0.062 - 0.022 * t) * K, (0.03 - 0.013 * t) * K], 6, 10, V.bill, { caps: true, round: [0.3, 0.7] });
    A.ellip('horn', 0, 2.81 * K, 1.33 * K, 0.05 * K, 0.012 * K, 0.11 * K, faDsShade(V.bill, 0.7), { seg: 8 });
    for (const s of [-1, 1]) { A.ellip('eye', s * 0.074 * K, 2.875 * K, 1.19 * K, 0.028 * K, 0.032 * K, 0.034 * K, V.eye, { seg: 10 }); A.ellip('eye', s * 0.088 * K, 2.877 * K, 1.198 * K, 0.012 * K, 0.015 * K, 0.015 * K, 0x050403, { seg: 6 }); }
  });
  A.part('tail', P([0, 1.56, -0.8]), () => {
    const pl = [];
    for (let k = 0; k < 30; k++) { const a = A.rr(-1, 1), at = [a * 0.12, 1.56 + A.rr(-0.06, 0.12), -0.8 + A.rr(-0.04, 0.06)];
      pl.push({ at: P(at), dir: [a * 0.6, A.rr(-0.7, 0.3), -1], side: k % 2 ? [1, 0, 0] : [0, 0, 1], len: A.rr(0.28, 0.42), w: A.rr(0.1, 0.14), col: faDsShade(V.plume, k % 3 ? 0.95 : 0.82), curl: 0.55 }); }
    A.locks('feather', pl);
  });
  /* the legs: the bare thigh, the drumstick down and back to the ankle, the long scaled tarsus forward to the two toes */
  const bare = faDsShade(V.leg, 1.0), scl = faDsShade(V.leg, 0.85);
  for (const s of [1, -1]) {
    const x = s * 0.19;
    A.part(s > 0 ? 'leg0' : 'leg1', P([x, 1.38, 0.0]), () => {
      faDsLimb(A, 'skin', [P([x, 1.4, 0.0]), P([x * 1.08, 1.12, 0.1])], [[0.14 * K, 0.16 * K], [0.115 * K, 0.125 * K]], () => bare, { nt: 2, ns: 10 });
      faDsLimb(A, 'scale', [P([x * 1.08, 1.12, 0.1]), P([x, 0.62, -0.12]), P([x, 0.07, 0.05])], [[0.095 * K, 0.115 * K], [0.058 * K, 0.064 * K], [0.045 * K, 0.05 * K]], () => bare, { bulge: [0.2, 0], nt: 2, ns: 10 });
      A.ellip('scale', x * K, 0.055 * K, 0.08 * K, 0.065 * K, 0.045 * K, 0.08 * K, scl, { seg: 8 });
      const ft = P([x, 0.035, 0.08]);
      faDsToes(A, ft, [[-0.01 * s * K, -0.008 * K, 0.26 * K]], 0.045 * K, scl, 0x3a2c22, 'scale');      /* the great inner toe and its nail */
      faDsToes(A, ft, [[0.085 * s * K, -0.008 * K, 0.15 * K]], 0.03 * K, scl, 0x3a2c22, 'scale');       /* the small outer toe */
    });
  }
  /* for the tack (kits/coyote's saddle and pack frame): the profile along the body and the anchors. The scout sits on the
     back behind the wings' roots; the pack frame rides the rump */
  A.profile(t => { const p = bc(t), r = br(t); return { z: p[2], y: p[1], hw: r[0], hh: r[1] }; });
  A.anchor('saddle', P([0, 1.84, 0.05])); A.anchor('pack', P([0, 1.8, -0.42])); A.anchor('bridle', P([0, 2.84, 1.2])); A.anchor('chest', P([0, 1.45, 0.62]));
  A.anchor('lead', P([0, 2.8, 1.32])); A.anchor('headRoot', P([0, 1.62, 0.5])); A.anchor('tailRoot', P([0, 1.6, -0.82]));
}
ANIMAL({
  key: 'ostrich', name: 'Ostrich', group: 'outlands',
  tags: Object.assign({}, FA_OL_TAGS, { domestic: true, herdedBy: ['coyote'], diet: 'omnivore', feeding: 'mixed', activity: 'diurnal', temperament: 'wary',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs'] }),
  size: { length: 2.1, height: 2.5 },
  source: [{ build: 'biomes/outlands', file: FA_OL_SRC, lines: 'section 7', note: 'Earth-like, farmed and wild on the N plains and the S steppe; ridden by scouts, packed by caravans, every part used' },
    { build: 'kits/fauna', file: 'models/ostrich.json', lines: '-', note: 'a Tripo model (rig/sources/ostrich), split and rigged by rig/qmodel.py' }],
  traits: { edible: true, milkable: false, tameable: true, rideable: true, draught: true, eggs: true },
  yields: { meat: { amount: 40, note: 'dressed, mostly the thighs: lean red meat, dried for the road' },
    eggs: { amount: 45, note: 'a hen lays forty to sixty a season in a shared scrape; one egg (1.4 kg) feeds a family, the shells are water flasks and beads' },
    hide: { amount: 1, hideM2: 1.4, note: 'the quilled leather: tipi covers sewn with goat hide, bags, sandals' },
    feathers: { amount: 1.2, note: 'the plumes, plucked at the moult: the common export (the runner bird\'s are the dear ones)' } },
  life: { maturity: 3, lifespan: 40, litter: 15, gestation: 42, note: 'eggs; gestation is the incubation (the hen by day, the cock by night)' },
  variants: 3, variantNames: ['cock (black, white plumes)', 'hen (grey-brown)', 'Tripo model (baked maps)'],
  w: 0.78, d: 2.6, h: 2.55,
  variantDims: [{ w: 0.78, d: 2.6, h: 2.55 }, { w: 0.78, d: 2.6, h: 2.55 }, { w: 0.98, d: 2.41, h: 2.56 }],
  models: { 2: 'ostrich' }, modelData: { 2: { budget: 12000 } },
  data: { mass: 110, legs: 2, speed: { walk: 1.2, run: 16 }, gait: { type: 'biped', freq: 0.95, stride: 1.2 }, grazePitch: 1.5, sizeRange: [0.88, 1.08],
    herd: 'flocks of 10 to 40 on the plains; the herders keep a pen of 20 to 60, the scouts one bird each',
    tack: 'saddle, pack, bridle, chest, lead anchors on every variant; the saddle and pack frame are kits/coyote catalog pieces (light rider, about 60 kg of load)',
    fleeDistance: 25, aggression: 0.3,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) { faOlOstrich(A, FA_OL_OSTRICH[A.variant === 1 ? 1 : 0]); }      /* variant 2 without its model draws the cock */
});

/* ---------------------------------------------------------------- the runner bird */
ANIMAL({
  key: 'runnerbird', name: 'Runner bird', group: 'outlands',
  tags: Object.assign({}, FA_OL_TAGS, { domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'skittish',
    habitat: ['ground', 'rock'], locomotion: ['walks', 'runs', 'leaps'] }),
  size: { length: 1.1, height: 1.1 },
  source: [{ build: 'biomes/outlands', file: FA_OL_SRC, lines: 'section 7, section 12', note: 'the trickster god\'s form, wild on the ancient roads; a boy is a man when he has caught one; its feathers are sacred and the dearest' },
    { build: 'kits/fauna', file: 'models/runnerbird.json', lines: '-', note: 'a Tripo model (rig/sources/runnerbird), split and rigged by rig/qmodel.py' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { feathers: { amount: 0.05, note: 'the crest and tail feathers of a caught bird, sacred: the dearest feathers of the Outlands' } },
  life: { maturity: 2, lifespan: 8, litter: 4, gestation: 20, note: 'eggs; gestation is the incubation' },
  variants: 1, variantNames: ['Tripo model (baked maps)'],
  w: 0.51, d: 1.1, h: 1.12,
  variantDims: [{ w: 0.51, d: 1.1, h: 1.12 }],
  models: { 0: 'runnerbird' }, modelData: { 0: { budget: 12000 } },
  data: { mass: 6, legs: 2, speed: { walk: 1.0, run: 12 }, gait: { type: 'biped', freq: 1.6, stride: 0.4 }, grazePitch: 0.6,
    herd: 'alone or a pair, on the roads; the surest place to find one is the road\'s end', fleeDistance: 12, aggression: 0.05,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'HUNT', 'REST', 'REST', 'REST', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) { }
});

/* ---------------------------------------------------------------- the golden bird */
ANIMAL({
  key: 'goldbird', name: 'Golden bird', group: 'outlands',
  tags: Object.assign({}, FA_OL_TAGS, { koppen: ['BSk', 'BWk', 'Dfb', 'ET', 'Cfa'], climate: ['temperate', 'cold'], domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'scavenger', activity: 'diurnal', temperament: 'wary',
    habitat: ['sky', 'rock'], locomotion: ['flies', 'glides', 'walks'] }),
  size: { length: 1.1, height: 1.35, span: 2.45 },
  source: [{ build: 'biomes/outlands', file: FA_OL_SRC, lines: 'section 7', note: 'the phoenix\'s living form, an Earth-like great golden raptor on the thermals over S1 and the rim (the owner, 2026-10-26); wholly sacred' },
    { build: 'kits/fauna', file: 'models/goldbird.json', lines: '-', note: 'a Tripo model (rig/sources/goldbird), cut by rig/fbuild.py and rigged by rig/frig.py' }],
  traits: { edible: false, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 6, lifespan: 45, litter: 1, gestation: 55, note: 'one egg on a cliff ledge every other year; gestation is the incubation' },
  poses: ['perch', 'fly'],
  variants: 1, variantNames: ['Tripo model (baked maps)'],
  w: 2.29, d: 1.08, h: 1.35,
  variantDims: [{ w: 2.45, d: 1.25, h: 2.0 }],
  models: { 0: 'goldbird' }, modelData: { 0: { budget: 17000 } },
  data: { mass: 9, legs: 2, wings: 1, speed: { walk: 0.6, run: 2, fly: [12, 18] }, gait: { type: 'flyer', freq: 1.0, stride: 0.3 },
    flap: { freq: 0.9, amp: 0.5, glide: 0.8, fold: 0 }, grazePitch: 0.6,
    herd: 'alone or a mated pair to a thermal; anyone known to have killed one is attacked on sight', fleeDistance: 30, aggression: 0.1,
    schedule: ['ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'IDLE', 'IDLE', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'FLY', 'IDLE', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST', 'ROOST'] },
  build: function (A) { }
});
