/* ======================================================================
   Krator Fauna: pets (kits/fauna/krator-fauna-pets.js)
   The dog and the cat: the farm's two small companions (the shepherd's dog of the sheepfold, the cat of the granary and the
   stall). Both are baked Meshy models only (models/dog.json, models/cat.json, packed by models_pack.py from the rigs made by
   rig/qmodel.py: four legs with planted feet, a head and a tail, perch / graze / walk clips), so a bundle that takes the
   `pets` group must be made with fauna_bundle.bundle([...], mdl=True). Without the models the build is an empty frame
   (nothing to draw), which a host treats as a missing animal.
   ====================================================================== */
ANIMAL({
  key: 'dog', name: 'Dog', group: 'pets',
  tags: { biomes: ['nhighlands', 'nwlowlands', 'hyperjungle'], koppen: ['Cfb', 'Dfb', 'Dfc', 'Af'], aridity: ['semiarid', 'subhumid', 'humid'], climate: ['temperate', 'cold', 'hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: [], diet: 'omnivore', feeding: 'scavenger', activity: 'cathemeral', temperament: 'wary',
    habitat: ['ground', 'pen'], locomotion: ['walks', 'runs', 'leaps'] },
  size: { length: 0.95, height: 0.65 },
  source: [{ build: 'kits/fauna', file: 'models/dog.json', lines: '-', note: 'a Meshy text-to-3D model (a tan and black shepherd type), split and rigged by rig/qmodel.py' }],
  traits: { edible: false, milkable: false, tameable: true, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 1.5, lifespan: 13, litter: 6, gestation: 63, note: 'a bitch whelps once a year; the shepherd keeps one pup in a litter' },
  variants: 1, variantNames: ['farm dog, tan and black'],
  w: 0.22, d: 0.85, h: 0.7,
  variantDims: [{ w: 0.22, d: 0.85, h: 0.7 }],
  models: { 0: 'dog' }, modelData: { 0: { budget: 12000 } },
  data: { mass: 22, legs: 4, speed: { walk: 1.1, run: 9 }, gait: { type: 'quadruped', freq: 1.7, stride: 0.45 }, grazePitch: 0.7,
    herd: 'one or two to a farm; the sheepfold keeps a dog to a shepherd', fleeDistance: 4, aggression: 0.2,
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'GRAZE', 'IDLE', 'IDLE', 'REST', 'REST', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST'] },
  build: function (A) { }
});
ANIMAL({
  key: 'cat', name: 'Cat', group: 'pets',
  tags: { biomes: ['nhighlands', 'nwlowlands', 'hyperjungle'], koppen: ['Cfb', 'Dfb', 'Af'], aridity: ['semiarid', 'subhumid', 'humid'], climate: ['temperate', 'hypertropic'], riparian: 'non', abyssal: false,
    domestic: true, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'crepuscular', temperament: 'skittish',
    habitat: ['ground', 'pen', 'rock'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] },
  size: { length: 0.5, height: 0.28 },
  source: [{ build: 'kits/fauna', file: 'models/cat.json', lines: '-', note: 'a Meshy text-to-3D model (a grey-brown tabby), split and rigged by rig/qmodel.py' }],
  traits: { edible: false, milkable: false, tameable: true, rideable: false, draught: false, eggs: false },
  yields: {},
  life: { maturity: 1, lifespan: 14, litter: 4, gestation: 65, note: 'the granary cat keeps the rats down; a queen has two or three litters a year' },
  variants: 1, variantNames: ['tabby'],
  w: 0.14, d: 0.5, h: 0.38,
  variantDims: [{ w: 0.14, d: 0.5, h: 0.38 }],
  models: { 0: 'cat' }, modelData: { 0: { budget: 12000 } },
  data: { mass: 4, legs: 4, speed: { walk: 0.8, run: 8 }, gait: { type: 'quadruped', freq: 2.0, stride: 0.25 }, grazePitch: 0.7,
    herd: 'alone; a granary keeps two or three', fleeDistance: 5, aggression: 0.15,
    schedule: ['HUNT', 'HUNT', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'REST', 'IDLE', 'IDLE', 'HUNT', 'HUNT', 'HUNT', 'IDLE', 'REST', 'HUNT', 'HUNT'] },
  build: function (A) { }
});
