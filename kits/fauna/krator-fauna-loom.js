/* ======================================================================
   Krator Fauna: the Loom-Chasms (kits/fauna/krator-fauna-loom.js)
   The two native hexapods of biomes/loom-chasms (its PLAN.md section 4, "Fauna"), on the wild group's hexapod builder (faWdHex),
   so a bundle that takes `loom` must also take `wild` (and so `hyperjungle`). The builder is read only when an animal is built, so this file may load
   before the wild group's.
   - the cable-stryder: a sinuous ambusher of the cable canopy over the Loom's slots; runs along single cables, sleeps hanging
   - the halite sifter: a low, armoured grazer of the White Loom's playa, breaking the salt crust for the brine mats under it
   ====================================================================== */
const FA_LM_SRC = { build: 'kits/fauna', file: 'krator-fauna-loom.js', lines: '-' };
const FA_LM_SCH = {
  hunt: ['HUNT', 'HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT'],
  graze: ['REST', 'REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'REST', 'REST', 'REST', 'REST']
};
const FA_LM_TAGS = { biomes: ['loom-chasms'], abyssal: false, domestic: false, herdedBy: [] };
ANIMAL({
  key: 'cable-stryder', name: 'Cable-stryder', group: 'loom',
  tags: Object.assign({}, FA_LM_TAGS, { koppen: ['BWk', 'BSk'], aridity: ['arid', 'semiarid'], climate: ['temperate'], riparian: 'non',
    diet: 'carnivore', feeding: 'predator', activity: 'nocturnal', temperament: 'aggressive', habitat: ['canopy', 'rock'], locomotion: ['walks', 'climbs'] }),
  size: { length: 2.92, height: 0.48 },
  source: [Object.assign({}, FA_LM_SRC, { note: 'first drawn here (2026-11-11), biomes/loom-chasms PLAN.md section 4: a sinuous hexapod of the cable canopy, 2.9 m nose to tail tip, six limbs with pincer claws and locking tendons; it runs along single cables, sleeps hanging under them, and drops on what crosses below' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 14, note: 'stringy, iron-tasting' }, eggs: { amount: 6, note: 'a clutch a year, hung in a bladder-sac' }, hide: { amount: 1, hideM2: 1.4, note: 'a supple, banded skin' },
    chitin: { amount: 1.2, note: 'the claws and the tendon locks: the cable-cutters\' hooks' } },
  life: { maturity: 2, lifespan: 14, litter: 6, gestation: 60, note: 'a clutch hung in a bladder-sac under the canopy; the young run the shoots first' },
  variants: 3, variantNames: ['rust-banded', 'iron grey', 'pale (the White Loom\'s)'],
  w: 1.08, d: 2.92, h: 0.48,
  data: { mass: 38, legs: 6, sizeRange: [0.8, 1.2], speed: { walk: 1.2, run: 9 }, gait: { type: 'hexapod', freq: 1.8, stride: 0.45 }, grazePitch: 0.1,
    herd: 'alone, or a pair on a tier', fleeDistance: 4, aggression: 0.85, schedule: FA_LM_SCH.hunt, hangs: true,
    hazard: { kind: 'hunter', note: 'drops from the canopy on what crosses the slot\'s floor' } },
  build: function (A) {
    const V = [{ a: 0x6a3e26, b: 0xa8805a, m: 0x8a5634, d: 0x2a160c }, { a: 0x4a4c4e, b: 0x8a8c8a, m: 0x6a6c6a, d: 0x1c1e20 }, { a: 0xb8b0a0, b: 0xe0d8c8, m: 0x9a9080, d: 0x5a5244 }][A.variant];
    faWdHex(A, { stock: 1.2, amb: true, fam: 'sleek', yb: 0.42, th: { w: 0.11, h: 0.09, l: 0.34 }, ab: { w: 0.1, h: 0.085, l: 0.5, z: 0.46, dy: 0.02 },
      hd: { w: 0.085, h: 0.07, l: 0.14 }, tail: { len: 1.0 }, R: 0.62, Hh: 0.46, lt: 0.03, pincers: true, fangs: 0.035, eyeC: 0xd8c040,
      pat: (x, y, z) => (Math.sin(z * 26) > 0.45 ? V.d : null), c: V });
  }
});
ANIMAL({
  key: 'halite-sifter', name: 'Halite sifter', group: 'loom',
  tags: Object.assign({}, FA_LM_TAGS, { koppen: ['BWh', 'BWk'], aridity: ['arid'], climate: ['temperate', 'tropic'], riparian: 'riparian',
    diet: 'herbivore', feeding: 'grazer', activity: 'crepuscular', temperament: 'defensive', habitat: ['ground', 'shallows'], locomotion: ['walks'] }),
  size: { length: 5.72, height: 1.7 },
  source: [Object.assign({}, FA_LM_SRC, { note: 'first drawn here (2026-11-11), biomes/loom-chasms PLAN.md section 4: a low, armoured playa grazer of 2.2 t, 5.7 m from its shovels to its tail, four walking legs and two shovel limbs that break the salt crust for the brine mats under it' })],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: true },
  yields: { meat: { amount: 700, note: 'salt-cured on the playa where it falls' }, eggs: { amount: 2, note: 'two a year, in the warm brine' }, hide: { amount: 1, hideM2: 9, note: 'a plated, salt-crusted hide' },
    chitin: { amount: 60, note: 'the back plates: the salt-camps\' roofing' } },
  life: { maturity: 7, lifespan: 60, litter: 2, gestation: 300, note: 'eggs laid in the warm brine at the pools\' rims' },
  variants: 2, variantNames: ['salt-white', 'brine-stained'],
  w: 2.8, d: 5.72, h: 1.7,
  data: { mass: 2200, legs: 6, sizeRange: [0.85, 1.15], speed: { walk: 0.7, run: 3 }, gait: { type: 'hexapod', freq: 0.8, stride: 0.6 }, grazePitch: 0.5,
    herd: 'a few along a pool\'s rim', fleeDistance: 6, aggression: 0.3, schedule: FA_LM_SCH.graze },
  build: function (A) {
    const V = [{ a: 0xd8d0c0, b: 0xf0ece0, m: 0xa89c88, d: 0x6a5e4c }, { a: 0xb88a6a, b: 0xe0c8b0, m: 0x8a5a40, d: 0x4a3020 }][A.variant];
    faWdHex(A, { stock: 1.15, amb: true, fam: 'scale', yb: 1.05, th: { w: 0.7, h: 0.5, l: 0.85 }, ab: { w: 0.8, h: 0.52, l: 1.2, z: 1.05, dy: 0.05 },
      hd: { w: 0.32, h: 0.24, l: 0.38 }, spikes: { n: 6, len: 0.22 }, spade: 0.55, digger: true, tail: { len: 0.8 }, R: 1.45, Hh: 1.05, lt: 0.15,
      pat: (x, y, z) => (Math.abs(Math.sin(x * 7) * Math.sin(z * 6)) > 0.7 ? V.m : null), c: V });
  }
});
