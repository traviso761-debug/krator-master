/* ======================================================================
   Krator Fauna: the Outlands' animals (group 'outlands'; biomes/outlands/PLAN.md section 7, 2026-11-11)

   The Outlands and the Outland Gate's: about 14 species planned, 8 native and 6 Earth-like. This file draws the eleven the
   kit had none of: the native HEXAPODS (on faWdHex with the `amb` anatomy, as the plan asks: hide, vertebrate eyes, padded
   feet, not insects) that graze, tend, nest in and carry the spores of the colonial fungoid flora, and three Earth-like BIRDS:
   the ostrich (farmed and wild, ridden by scouts), the runner bird (the trickster's form, which runs the ancient roads) and the
   golden bird (the phoenix's living form, a great golden raptor: sacred). The Earth-like goat, vulture and gazelle-like grazer
   are the kit's already (goat, the wild file's).

   It draws on the wild file's builders (faWdHex, faWdQuad) and the hyperjungle file's bird (faHiBird): a page that takes this
   group takes 'wild' and 'hyperjungle' too. Those are function declarations (hoisted in the bundle); this file's tables are its
   own (the wild file's constants load after it: the bundle orders the files by name).
   ====================================================================== */
const FA_OL_SRC = { build: 'kits/fauna', file: 'krator-fauna-outlands.js', lines: '-' };
const FA_OL_SCH = {
  graze: ['REST', 'REST', 'REST', 'REST', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'GRAZE', 'GRAZE', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'GRAZE', 'IDLE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
  hunt: ['HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT', 'HUNT'],
  fly: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'FLY', 'FLY', 'HUNT', 'FLY', 'FLY', 'REST', 'FLY', 'HUNT', 'FLY', 'FLY', 'HUNT', 'FLY', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST'],
  tend: ['REST', 'REST', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'IDLE', 'IDLE', 'GRAZE', 'REST', 'REST', 'REST', 'IDLE', 'GRAZE', 'GRAZE', 'IDLE', 'IDLE', 'GRAZE', 'REST', 'REST', 'REST', 'REST', 'REST'],
};
const FA_OL_FLAP = { freq: 1.6, amp: 0.4, glide: 0.55, fold: 0.05, sweep: 1.3, foldScale: 0.6, roll: 0.75, tuck: 0.9 };
const FA_OL_BIRD = (A, o) => faHiBird(A, Object.assign({}, o, o.c));
/* faWdAnimal's record, in this group and with this file's tables */
function faOlAnimal(d) {
  const T = d.tags || {};
  ANIMAL({
    key: d.key, name: d.name, group: 'outlands',
    tags: { biomes: d.biomes, koppen: d.koppen, aridity: d.aridity, climate: d.climate, riparian: T.riparian || 'non', abyssal: false, domestic: !!d.dom, herdedBy: d.herdedBy || [],
      diet: T.diet || 'herbivore', feeding: T.feeding || 'grazer', activity: T.activity || 'diurnal', temperament: T.temperament || 'skittish', habitat: T.habitat || ['ground'],
      locomotion: T.locomotion || ['walks', 'runs'] },
    size: { length: d.dim[1], height: d.dim[2] },
    source: [Object.assign({}, FA_OL_SRC, { note: 'first drawn here (2026-11-11), for the Outlands and the Outland Gate (biomes/outlands/PLAN.md section 7): ' + d.note })],
    traits: Object.assign({ edible: !!d.meat, milkable: false, tameable: !!d.dom, rideable: false, draught: false, eggs: !!d.eggs }, d.traits || {}),
    yields: Object.assign({}, d.meat ? { meat: { amount: d.meat, note: d.meatNote || 'dressed' } } : {}, d.eggs ? { eggs: { amount: d.eggs, note: d.eggNote || 'a clutch a year' } } : {},
      d.hide ? { hide: { amount: 1, hideM2: d.hide, note: d.hideNote || 'a tough hide' } } : {}, d.extra || {}),
    life: { maturity: d.life[0], lifespan: d.life[1], litter: d.life[2], gestation: d.life[3], note: d.lifeNote || '' },
    variants: d.variants.length, variantNames: d.variants.map(v => v[0]),
    w: d.dim[0], d: d.dim[1], h: d.dim[2],
    data: Object.assign({ mass: d.mass, legs: d.legs == null ? 4 : d.legs, sizeRange: [0.8, 1.2], speed: d.speed || { walk: 1, run: 6 }, gait: d.gait || { type: 'quadruped', freq: 1.4, stride: 0.5 },
      grazePitch: d.grazePitch == null ? 0.7 : d.grazePitch, herd: d.herd, fleeDistance: d.flee == null ? 8 : d.flee, aggression: d.aggr == null ? 0.1 : d.aggr, schedule: FA_OL_SCH[d.sch || 'graze'] }, d.data || {}),
    /* d.scale: the whole animal drawn at that size of its spec (the frame's scale, A.S), so a spec borrowed from a bigger or smaller
       kin draws this animal at its own length */
    build: function (A) { const s0 = A.S; A.S = s0 * (d.scale == null ? 1 : d.scale); try { d.kind(A, Object.assign({}, d.spec, { c: d.variants[A.variant][1] })); } finally { A.S = s0; } }
  });
}
const FA_OL_HX = { legs: 6, gait: { type: 'hexapod', freq: 1.4, stride: 0.4 } };
const FA_OL_N = { biomes: ['outlands'], aridity: ['arid', 'semiarid'], climate: ['temperate', 'cold'] };   /* the natives: the basins' dry and cold ground */

/* ---------------------------------------------------------------- the native hexapods */
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Cfa'], scale: 0.912, key: 'plain-grazer', name: 'Plains grazer', kind: faWdHex, dim: [1.33, 2.5, 0.86], mass: 240, meat: 100, hide: 2.4, hideNote: 'a supple, short-haired hide: the herders\' tents',
  tags: { diet: 'herbivore', feeding: 'grazer', temperament: 'skittish' }, herdedBy: ['coyote'],
  note: 'the N basin\'s herd beast, the size of a small horse: it crops the steppe colonies\' needle fur and grey cushions and walks the seams between them, carrying their spores; herds of it drift down the gap on the floor\'s grass', herd: 'herds of twenty to sixty', life: [2, 18, 1, 220], speed: { walk: 1.3, run: 12 }, flee: 30, aggr: 0.05, grazePitch: 0.6,
  spec: { stock: 1.15, amb: true, fam: 'sleek', yb: 0.75, th: { w: 0.26, h: 0.24, l: 0.34 }, ab: { w: 0.3, h: 0.27, l: 0.5, z: 0.42, dy: 0.02 }, hd: { w: 0.15, h: 0.14, l: 0.22 }, snout: 0.45, tail: { len: 0.5 }, R: 0.8, Hh: 0.75, lt: 0.055 },
  variants: [['dun', { a: 0xa88a62, b: 0xdcc8a4, m: 0x8a6a48, d: 0x4a3626 }], ['rust', { a: 0x9a5a38, b: 0xd8b08a, m: 0x7a4428, d: 0x3a2014 }], ['grey', { a: 0x8a8478, b: 0xc8c4b8, m: 0x6a645a, d: 0x3a362e }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { koppen: ['BWk', 'BSk'], scale: 0.68, key: 'nurser', name: 'Nursery-tender', kind: faWdHex, dim: [0.89, 1.3, 0.52], mass: 40, meat: 12, sch: 'tend',
  tags: { diet: 'herbivore', feeding: 'browser', temperament: 'docile', activity: 'crepuscular' },
  note: 'the nursery colony\'s keeper on the Nursery Bench: it lays in the pod towers\' chambers and feeds its young on the brood pads, and in return crops the rival colonies\' forms at the seams and carries the nursery\'s spores; the Outland Bore takes them down the gap', herd: 'a family round a nest', life: [1, 9, 4, 60], speed: { walk: 0.8, run: 6 }, flee: 10, aggr: 0.15, grazePitch: 0.6,
  spec: { stock: 1.05, amb: true, fam: 'shag', yb: 0.45, th: { w: 0.28, h: 0.24, l: 0.32 }, ab: { w: 0.32, h: 0.28, l: 0.48, z: 0.4, dy: 0.02 }, hd: { w: 0.16, h: 0.15, l: 0.18 }, snout: 0.4, R: 0.65, Hh: 0.5, lt: 0.055, shellDome: true },
  variants: [['ochre', { a: 0xb88a48, b: 0xe8d0a0, m: 0x9a6a30, d: 0x5a3a18 }], ['bone', { a: 0xd8ccb4, b: 0xf0e8d8, m: 0xb8a888, d: 0x7a6a50 }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { koppen: ['Dfb', 'Cfa'], aridity: ['humid', 'subhumid'], scale: 0.722, key: 'fog-drinker', name: 'Fog-drinker', kind: faWdHex, dim: [0.86, 1.9, 0.67], mass: 90, meat: 30,
  tags: { diet: 'herbivore', feeding: 'browser', temperament: 'wary', activity: 'crepuscular', habitat: ['ground', 'canopy'] },
  note: 'a long-limbed browser of the fog belt that drinks at the veil caps\' drip rings at dawn and eats the lantern stalks\' pods, carrying the veil colony\'s spores along the wall', herd: 'a few together at a drip ring', life: [2, 14, 1, 150], speed: { walk: 1.0, run: 9 }, flee: 18, aggr: 0.05, grazePitch: 0.2,
  spec: { stock: 1.4, amb: true, fam: 'sleek', yb: 1.0, th: { w: 0.17, h: 0.15, l: 0.28 }, ab: { w: 0.16, h: 0.14, l: 0.42, z: 0.38, dy: 0.04 }, hd: { w: 0.11, h: 0.1, l: 0.18 }, tail: { len: 0.6 }, R: 0.78, Hh: 1.2, lt: 0.044 },
  variants: [['violet-grey', { a: 0x6a6278, b: 0xc8c0d0, m: 0x4e4a5e, d: 0x2e2a36 }], ['teal-grey', { a: 0x5a7270, b: 0xb8ccc8, m: 0x3e5654, d: 0x223432 }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { koppen: ['BWk', 'BSk'], scale: 0.623, key: 'rock-grazer', name: 'Rock-grazer', kind: faWdHex, dim: [0.85, 1.6, 0.28], mass: 70, meat: 22,
  tags: { diet: 'herbivore', feeding: 'grazer', temperament: 'docile', habitat: ['rock', 'ground'], locomotion: ['walks', 'climbs'] },
  note: 'a low, broad, scaled grazer of the gem hills that scrapes the copper colonies\' lace crust off the beds with a horny lip; the Peak tribe follow its green-stained trails to the ore', herd: 'a few on a bed', life: [3, 25, 2, 120], speed: { walk: 0.5, run: 4 }, flee: 6, aggr: 0.1, grazePitch: 0.9, gait: { type: 'hexapod', freq: 1.0, stride: 0.3 },
  spec: { stock: 1.2, amb: true, fam: 'scale', yb: 0.4, th: { w: 0.3, h: 0.1, l: 0.4 }, ab: { w: 0.32, h: 0.1, l: 0.5, z: 0.45, dy: 0.0 }, hd: { w: 0.14, h: 0.08, l: 0.14 }, tail: { len: 0.6 }, R: 0.8, Hh: 0.4, lt: 0.035, pat: (x, y, z) => (faNoise(x * 14, y * 14, z * 14) > 0.7 ? 0x3e9a86 : null) },
  variants: [['copper-green', { a: 0x6a7a64, b: 0xb8c4a8, m: 0x4a8a72, d: 0x2a3a2e }], ['red-bed', { a: 0x8a5a44, b: 0xd0a888, m: 0x6a3e2c, d: 0x3a2018 }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { koppen: ['BSk', 'BWk'], scale: 0.427, key: 'pan-digger', name: 'Pan-digger', kind: faWdHex, dim: [0.8, 1.4, 0.45], mass: 35, meat: 10,
  tags: { diet: 'carnivore', feeding: 'insectivore', temperament: 'wary', habitat: ['ground', 'shallows'], locomotion: ['walks', 'runs', 'burrows'], riparian: 'riparian' },
  note: 'a big-haunched digger of the salt pans that scrapes the brine shrimp-analogues out of the crust and the brine\'s pink film; its heaped spoil is white with salt', herd: 'pairs on a pan', life: [1, 8, 3, 50], speed: { walk: 0.9, run: 8 }, flee: 14, aggr: 0.2, grazePitch: 0.9,
  spec: { stock: 1.3, amb: true, fam: 'skin', yb: 0.6, th: { w: 0.2, h: 0.2, l: 0.35 }, ab: { w: 0.2, h: 0.18, l: 0.5, z: 0.4, dy: 0.03 }, hd: { w: 0.13, h: 0.14, l: 0.2 }, whisk: 1.2, R: 1.0, Hh: 0.65, lt: 0.05, hindBig: true },
  variants: [['salt-white', { a: 0xd8d0c8, b: 0xf4f0ec, m: 0xc8a8a8, d: 0x8a7a76 }], ['pink-grey', { a: 0xb89a9a, b: 0xe8d8d8, m: 0x9a7a7a, d: 0x5a4444 }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { koppen: ['BSk', 'BWk'], scale: 0.376, key: 'burrower', name: 'Steppe burrower', kind: faWdHex, dim: [0.45, 0.7, 0.26], mass: 3, meat: 1,
  tags: { diet: 'herbivore', feeding: 'grazer', temperament: 'skittish', habitat: ['ground', 'burrow'], locomotion: ['walks', 'runs', 'burrows'] },
  note: 'a small six-legged burrower of the steppe and the cold desert, living in colonies under the grey cushions; the stalkers\' and the golden bird\'s prey', herd: 'warrens of thirty', life: [0.5, 4, 6, 25], speed: { walk: 0.5, run: 7 }, flee: 15, aggr: 0.02, grazePitch: 0.8,
  spec: { stock: 1.05, amb: true, fam: 'shag', yb: 0.45, th: { w: 0.28, h: 0.24, l: 0.32 }, ab: { w: 0.32, h: 0.28, l: 0.48, z: 0.4, dy: 0.02 }, hd: { w: 0.16, h: 0.15, l: 0.18 }, snout: 0.35, R: 0.6, Hh: 0.45, lt: 0.05 },
  variants: [['sand', { a: 0xb8a078, b: 0xe8dcc0, m: 0x9a8058, d: 0x5a4830 }], ['rust', { a: 0x9a6040, b: 0xd8b090, m: 0x7a4428, d: 0x3a2014 }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Dfb', 'Cfa'], scale: 0.779, key: 'outland-stalker', name: 'Outland stalker', kind: faWdHex, dim: [1.02, 2.5, 0.69], mass: 110, meat: 30, hide: 1.4, sch: 'hunt',
  tags: { diet: 'carnivore', feeding: 'predator', temperament: 'aggressive', activity: 'crepuscular' },
  note: 'the basins\' long, low hunter, running down the grazers on the plains at dusk and lying up on the seams by day; it follows the herds down the gap', herd: 'alone, or a mated pair', life: [2, 14, 2, 90], speed: { walk: 1.2, run: 17 }, flee: 4, aggr: 0.8, grazePitch: 0.15, gait: { type: 'hexapod', freq: 2.2, stride: 0.6 },
  spec: { stock: 1.4, amb: true, fam: 'sleek', yb: 0.9, th: { w: 0.19, h: 0.17, l: 0.3 }, ab: { w: 0.17, h: 0.15, l: 0.44, z: 0.38, dy: 0.04 }, hd: { w: 0.14, h: 0.12, l: 0.22 }, tail: { len: 1.0 }, R: 0.85, Hh: 1.0, lt: 0.05,
    pat: (x, y, z) => (Math.sin(z * 22) > 0.55 && y > 0.8 ? 0x2a1e14 : null) },
  variants: [['tawny, barred', { a: 0x9a7448, b: 0xd8bc90, m: 0x7a5432, d: 0x2a1e14 }], ['grey, barred', { a: 0x6e6a62, b: 0xbcb8ae, m: 0x54504a, d: 0x24221e }]] }));
faOlAnimal(Object.assign({}, FA_OL_HX, FA_OL_N, { biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Cfa', 'Dfb'], scale: 0.693, key: 'carrion-hexapod', name: 'Carrion hexapod', kind: faWdHex, dim: [1.02, 1.6, 0.58], mass: 45, meat: 0,
  tags: { diet: 'carnivore', feeding: 'scavenger', temperament: 'defensive', activity: 'cathemeral' },
  note: 'a hunched, bare-headed scavenger that finds a kill by the bone bloom\'s smell and strips it beside the vultures; nobody eats it', herd: 'a few on a carcass', life: [1, 10, 3, 60], speed: { walk: 0.9, run: 7 }, flee: 6, aggr: 0.4, grazePitch: 0.8,
  spec: { stock: 1.2, amb: true, fam: 'skin', yb: 0.7, th: { w: 0.2, h: 0.2, l: 0.32 }, ab: { w: 0.22, h: 0.2, l: 0.46, z: 0.4, dy: 0.04 }, hd: { w: 0.11, h: 0.11, l: 0.2 }, tail: { len: 0.4 }, R: 0.85, Hh: 0.8, lt: 0.05 },
  variants: [['bone, bare-headed', { a: 0x8a7a68, b: 0xc8b8a0, m: 0xb86a5a, d: 0x3a3028 }], ['dark', { a: 0x4e4440, b: 0x8a807a, m: 0xa85a4a, d: 0x221c1a }]] }));

/* ---------------------------------------------------------------- the Earth-like birds */
faOlAnimal({ biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Cfa'], aridity: ['arid', 'semiarid', 'subhumid'], climate: ['temperate'], key: 'ostrich', name: 'Ostrich', kind: faWdQuad, legs: 2, dim: [0.68, 1.76, 2.58],
  mass: 120, meat: 40, eggs: 40, eggNote: 'the hens\' shared nest: 30 to 60 eggs a season, each a meal for ten', hide: 1.2, hideNote: 'the quilled leather', herdedBy: ['coyote'],
  extra: { feathers: { amount: 1.2, note: 'the plumes: the Outlands\' common export (PLAN.md section 6)' } }, traits: { tameable: true, rideable: true },
  tags: { diet: 'omnivore', feeding: 'mixed', temperament: 'wary', habitat: ['ground'], locomotion: ['walks', 'runs'] },
  note: 'the Earth-like great running bird of the N basin\'s plains, farmed and wild; the Sunrise and Sunset herders keep flocks for the plumes and the eggs, and their scouts ride the big cocks', herd: 'flocks of five to thirty', life: [3, 40, 40, 42],
  lifeNote: 'gestation: the clutch\'s incubation in days', speed: { walk: 1.4, run: 19 }, flee: 60, aggr: 0.3, grazePitch: 1.0, gait: { type: 'biped', freq: 1.3, stride: 0.9 },
  spec: { fam: 'coat', biped: true, L: 1.1, bh: 0.36, bw: 0.32, legH: 1.0, nk: { len: 0.22, rise: 0.95 }, nkw: 0.32, hd: { len: 0.16, hh: 0.07, hw: 0.06, sn: 0.55, drop: 0.02 }, tl: { kind: 'brush', len: 0.3, w: 0.2 }, ear: { kind: 'none' }, lt: 0.07, foot: 'claw', eyeC: 0x3a2a1a,
  },
  variants: [['cock, black and white', { a: 0x1e1c1a, b: 0x2a2826, m: 0xf0ece4, d: 0xc8a8a0, f: 0x8a7464 }], ['hen, grey-brown', { a: 0x7a6a58, b: 0x8a7a68, m: 0xc8bca8, d: 0xc8a8a0, f: 0x8a7464 }]] });
faOlAnimal({ biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Cfa'], aridity: ['arid', 'semiarid', 'subhumid'], climate: ['temperate'], key: 'runner-bird', name: 'Runner bird', kind: faWdQuad, legs: 2, dim: [0.12, 0.78, 0.47],
  mass: 0.4, meat: 0, extra: { feathers: { amount: 0.02, note: 'the most sacred of feathers; not taken from a live bird' } },
  tags: { diet: 'carnivore', feeding: 'predator', temperament: 'wary', habitat: ['ground'], locomotion: ['walks', 'runs'] },
  note: 'a small, crested, long-tailed bird that runs rather than flies, on the old roads above all: the trickster\'s form (PLAN.md section 6). A boy is a man when he has caught one; the surest place is the god\'s road\'s end', herd: 'alone, or a pair', life: [1, 8, 4, 20],
  speed: { walk: 1.0, run: 9 }, flee: 20, aggr: 0.1, grazePitch: 0.5, gait: { type: 'biped', freq: 3.0, stride: 0.35 },
  spec: { fam: 'coat', biped: true, L: 0.26, bh: 0.075, bw: 0.06, legH: 0.16, nk: { len: 0.07, rise: 0.11 }, hd: { len: 0.12, hh: 0.04, hw: 0.03, sn: 0.45, drop: 0.01 }, crest: 0.04, tl: { kind: 'long', len: 0.32, w: 0.05 }, ear: { kind: 'none' }, lt: 0.012, foot: 'claw', eyeC: 0xe0a020,
    pat: (z, a) => (Math.sin(z * 90) > 0.3 && Math.cos(a) > 0 ? 0x2a2018 : null) },
  variants: [['streaked brown', { a: 0x7a6248, b: 0xd8ccb4, m: 0x4a3a2a, d: 0x2a2018, f: 0x6a7a8a }]] });
faOlAnimal({ biomes: ['outlands', 'outlandgate'], koppen: ['BSk', 'BWk', 'Cfa', 'Dfb', 'ET'], aridity: ['arid', 'semiarid', 'subhumid', 'humid'], climate: ['temperate', 'cold'], key: 'golden-bird', name: 'Golden bird', kind: FA_OL_BIRD, legs: 2, dim: [3.4, 1.89, 0.9],
  mass: 11, meat: 0, sch: 'fly', tags: { diet: 'carnivore', feeding: 'predator', habitat: ['rock', 'sky'], locomotion: ['flies', 'glides'], temperament: 'wary' },
  note: 'the phoenix\'s living form (the owner, 2026-10-26): a great golden raptor of the thermals over the fog wall and the rim, the one Earth animal that crossed the rim on its own wings. Wholly sacred: one known to have killed one is attacked on sight', herd: 'a pair over a wall', life: [6, 50, 2, 45],
  speed: { walk: 0.4, run: 1, fly: 18 }, gait: { type: 'flyer', freq: 1.4, stride: 0.1 }, data: { wings: 1, flap: Object.assign({}, FA_OL_FLAP) },
  spec: { k: 1.7, bw: 1.05, tailL: 0.36, tailW: 0.055, beakL: 0.11, hook: 0.09, beakW: 0.045, span: 0.9, chord: 1.05 },
  variants: [['gold', { body: 0xb8862a, belly: 0xd8a83a, head: 0xf0c850, wing: 0x9a6a1e, tip: 0x3a2610, tail: 0xc8962e, beak: 0xe8d8a0, leg: 0xe8c040 }]] });
