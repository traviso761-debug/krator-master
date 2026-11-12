/* ======================================================================
   Krator Fauna: the native hexapods of the late biome plans (kits/fauna/krator-fauna-xeno.js; group `xeno`)
   Vertebrate-grade hexapods, NOT insects (the owner's briefs: biomes/siphon-pits/PLAN.md section 4, kits/fauna/BIOME-FAUNA-PLAN.md): an internal
   skeleton, six limbs from two girdles and a middle pair, fur or hide, lungs. First: Region 98, the Siphon Pits and the Ostrukh Terraces
   (biomes/siphon-pits, 2026-11-11): the Ghaunt-Ox, the Flenser-Hound and the Pipe-Borer. Dimensions are the measured boxes of the builds (verify.py --assert). Drawn by the wild file's shared builder (faWdHex, the
   'centaur' and 'hexapod' gaits), so this file sorts after krator-fauna-wild.js and a bundle that takes `xeno` must take `wild` and `hyperjungle`
   too (as `wild` itself needs `hyperjungle`). Each animal is a record first (tags, traits, yields, life, data, schedule): the biome kit publishes
   where it lives (its herds and lairs) and a world places it. The 5.1 climate classes the vocabulary lacks (Cwb, Dsc) are given as their nearest
   (KNOWN_ISSUES.md).
   ====================================================================== */
const FA_XN_SRC = { build: 'kits/fauna', file: 'krator-fauna-xeno.js', lines: '-' };
/* an animal by the wild file's maker, filed under this group and this file */
function faXnAnimal(d) {
  faWdAnimal(d);
  const e = ANIMAL_BY_KEY[d.key];
  e.group = 'xeno';
  e.source = [Object.assign({}, FA_XN_SRC, { note: 'first drawn here (2026-11-11), biomes/siphon-pits PLAN.md section 4: ' + d.note })];
  if (d.lives) e.tags.stations = d.lives;
  return e;
}
/* a coat over the wild file's hexapod (o.coat [amp, freq]): a shaggy shell round the torso, shoulder to rump, hanging to the knees as a musk
   ox's skirt does, the back a little proud of the body. Here and not in faWdHex, so no other group's bundle changes */
function faXnCoat(A, o) {
  faWdHex(A, o);
  if (!o.coat) return;
  const S = A.S, c = o.c, kS = o.stock || 1, yb = o.yb / kS, th = {}, ab = {};
  for (const a in o.th) th[a] = o.th[a] * kS;
  for (const a in o.ab) ab[a] = o.ab[a] * kS;
  const W = (th.w + ab.w) * 0.5, H = (th.h + ab.h) * 0.5, row = (z, w, h, dy) => [0, (yb + (dy || 0) + 0.025 * h) * S, z * S, w * S, h * 1.025 * S];
  faHjRows(A, 'shag', [row(th.l * 0.95, th.w * 0.55, th.h * 0.6, 0.05), row(th.l * 0.55, th.w * 1.1, th.h * 1.05, 0.06), row(0, th.w * 1.14, th.h * 1.1, 0.04),
    row(-ab.z * 0.5, W * 1.14, H * 1.08), row(-ab.z, ab.w * 1.12, ab.h * 1.06), row(-ab.z - ab.l * 0.55, ab.w * 0.9, ab.h * 0.92), row(-ab.z - ab.l * 0.8, ab.w * 0.3, ab.h * 0.3)],
    18, 22, null, { round: [0.1, 0.12], shag: o.coat, colf: (t, a, q) => faWdM(faWdM(c.a, c.m || c.d, 0.35), c.d, 0.4 * faNoise(q[0] / S * 5, q[1] / S * 5, q[2] / S * 5)) });
}
const FA_XN_98 = { biomes: ['siphon-pits'], aridity: ['semiarid', 'subhumid'], climate: ['temperate', 'cold'] };

/* THE WOOLLY GHAUNT-OX (Ovisaphon borealis): 1,800 kg; crampon forelimbs for the talus, columnar middle limbs, hind levers that jump a ledge.
   Domesticated on the Ostrukh Terraces (pairs at the stone seed-drills), wild herds on the scarp's ledges and the pit floors */
faXnAnimal(Object.assign({}, FA_WD_C, FA_XN_98, { koppen: ['Cfb', 'Dfb', 'ET', 'Cfa'], dom: true, herdedBy: ['the Ostrukh farmers'], key: 'ghaunt-ox', name: 'Woolly Ghaunt-Ox', kind: faXnCoat,
  dim: [1.95, 5.25, 1.85], mass: 1800, meat: 650, hide: 7, hideNote: 'thick, oily under the wool: boots, harness, the ropers\' cradles',
  extra: { wool: { amount: 9, note: 'a shaggy undercoat combed out each spring: the terraces\' felt and rope' }, milk: { amount: 5, note: 'thick and fatty: the farms\' cheese' } },
  traits: { rideable: true, draught: true, milkable: true }, lives: ['terraces', 'scarp', 'pitfloor'],
  tags: { diet: 'herbivore', feeding: 'grazer', temperament: 'docile', activity: 'diurnal', habitat: ['ground', 'rock', 'pen'], locomotion: ['walks', 'runs', 'leaps'] },
  note: 'the woolly six-limbed ox of Region 98: a deep barrel body in a shaggy brown coat, a low broad head with short curved tusks; its fore pair end in crampon claws that grip the talus, the middle pair are columns that carry its weight, the hind pair are long levers that jump it up a ledge; the terraces yoke them in pairs to the stone seed-drills, and the wild herds walk the scarp\'s ledges and graze the felt of the pit floors',
  herd: 'a farm keeps two to six; wild herds of twenty', life: [4, 35, 1, 300], speed: { walk: 1.1, run: 6 }, flee: 10, aggr: 0.15, gait: { type: 'centaur', freq: 0.85, stride: 0.9 }, grazePitch: 0.6, sch: 'graze',
  spec: { stock: 1.1, amb: true, fam: 'shag', coat: [0.14, 5], yb: 1.25, th: { w: 0.66, h: 0.62, l: 0.9 }, ab: { w: 0.7, h: 0.62, l: 1.2, z: 1.05, dy: 0.04 }, hd: { w: 0.38, h: 0.32, l: 0.52 }, tusks: 0.28, tail: { len: 0.6 }, R: 0.85, Hh: 0.7, lt: 0.18 },
  variants: [['brown', { a: 0x6a4a2c, b: 0x8a6a48, m: 0x4a3420, d: 0x3a2814 }], ['grey-dun', { a: 0x8a8070, b: 0xa89c88, m: 0x5e564a, d: 0x403a30 }], ['wax-stained (the pits\')', { a: 0x8a6230, b: 0xb08a50, m: 0x5e4220, d: 0x3e2c14 }]] }));

/* THE FLENSER-HOUND (Scyllatherium fissum): the Arete Way's ambusher. Tripartite limbs: two folding raptorial scythe-arms for a silent strike at
   the neck, two lateral claspers that lock to the rock in a gale, two long sprinting hind legs. Pale as rime; it crouches under the rims in a blizzard */
faXnAnimal(Object.assign({}, FA_WD_C, FA_XN_98, { koppen: ['ET', 'Dfc', 'Dfb'], aridity: ['semiarid', 'arid'], climate: ['cold'], key: 'flenser-hound', name: 'Flenser-Hound', kind: faWdHex,
  dim: [2.15, 5.23, 2.87], mass: 420, meat: 120, hide: 3, hideNote: 'a pale, close, waxy hide: blizzard capes', lives: ['arete', 'scarp'],
  tags: { diet: 'carnivore', feeding: 'predator', temperament: 'aggressive', activity: 'cathemeral', habitat: ['rock', 'ground'], locomotion: ['walks', 'runs', 'climbs', 'leaps'] },
  note: 'the apex predator of the plateau\'s rims: a lean pale six-limbed hunter; its fore pair fold like a mantis\'s scythes and strike at the neck without a sound, its middle pair are claspers that lock to the basalt when the gale gusts, its hind pair are long sprinting legs; it waits under the fog line below the Arete Way\'s rims in a blizzard and lunges at the straggler of a caravan',
  herd: 'alone, or a mated pair sharing a rim', life: [3, 18, 2, 120], speed: { walk: 1.4, run: 16 }, flee: 3, aggr: 0.9, gait: { type: 'centaur', freq: 1.2, stride: 1.2 }, grazePitch: 0.2, sch: 'hunt',
  spec: { stock: 1.15, amb: true, fangs: 0.08, fam: 'skin', yb: 1.1, th: { w: 0.34, h: 0.36, l: 0.62 }, ab: { w: 0.3, h: 0.3, l: 0.8, z: 0.7, dy: 0.05 }, hd: { w: 0.24, h: 0.22, l: 0.46 },
   neck: { len: 0.3, rise: 0.4, w: 0.16 }, scythes: { len: 1.3, w: 0.22 }, hindBig: true, tail: { len: 1.4 }, R: 0.95, Hh: 1.0, lt: 0.1, eyeC: 0xc8d8e0, pat: (x, y, z) => (faNoise(x * 7, y * 7, z * 7) > 0.62 ? 0x8a9098 : null) },
  variants: [['rime-white', { a: 0xd8dce0, b: 0xeceef0, m: 0x9aa0a8, d: 0x6a7078 }], ['basalt-grey', { a: 0x5a5a5e, b: 0x8a8a8e, m: 0x3a3a3e, d: 0x2a2a2e }]] }));

/* THE BASALT PIPE-BORER (Chthonomys perforans): a burrowing hexapod of the diatreme breccia: spade fore-limbs, a blunt armoured snout; it tunnels
   the breccia under the groves and carries the siphons' seeds, which root in its spoil */
faXnAnimal(Object.assign({}, FA_WD_HX, FA_XN_98, { koppen: ['Cfa', 'Cfb', 'ET'], key: 'pipe-borer', name: 'Basalt Pipe-Borer', kind: faWdHex, dim: [0.94, 1.86, 0.58], mass: 25, meat: 8, hide: 0, lives: ['pitfloor', 'arete'],
  tags: { diet: 'omnivore', feeding: 'detritivore', temperament: 'wary', activity: 'nocturnal', habitat: ['burrow', 'ground', 'rock'], locomotion: ['walks', 'burrows'] },
  note: 'a stocky six-limbed burrower the size of a badger, a blunt plated snout and broad spade fore-limbs that grind through the maars\' breccia and the old diatreme pipes; it eats fallen wax, grubs and the siphons\' seed pods, and leaves the seeds in its spoil heaps, where the next grove roots',
  herd: 'a family of four to six in one warren', life: [1, 8, 3, 50], speed: { walk: 0.6, run: 3 }, flee: 6, aggr: 0.2, gait: { type: 'hexapod', freq: 1.4, stride: 0.25 }, grazePitch: 0.4, sch: 'graze',
  spec: { stock: 1.2, amb: true, fam: 'skin', yb: 0.38, th: { w: 0.2, h: 0.17, l: 0.28 }, ab: { w: 0.22, h: 0.18, l: 0.38, z: 0.36, dy: 0.02 }, hd: { w: 0.14, h: 0.12, l: 0.18 }, snout: 0.35, spade: 0.12, digger: true, R: 0.45, Hh: 0.35, lt: 0.06, shellDome: 0.15 },
  variants: [['ash-grey', { a: 0x6a6460, b: 0x8a847e, m: 0x4a4440, d: 0x2e2a28 }], ['wax-brown', { a: 0x7a5a38, b: 0x9a7a54, m: 0x5a4024, d: 0x3a2814 }]] }));
