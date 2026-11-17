// prefix: lw
// ================================================================= THE WORKS: the pieces the villages needed (core/simulation/PLAN-LIZARDMEN.md step 7)
// The owner, 2026-11-17: "implement the lizardmen settlements". KNOWN_ISSUES.md owed a mine head ("ore for the bronze hall") and a
// fishing weir and drying racks; core/hamlet's Lizardmen row named them (lz-mine, lz-weir) as pending boxes. With them, three more
// the towns after Gila take: the placer floor (Komodo's tin and gold), the cistern (Tuatara has no perennial water), the fungus
// beds (the Tubes' crop grown in the dark: kits/crops pale fungi, works 'dark-beds'). Open works, no interior: each declares its
// front; their caste is the one that works them. Bronze and bone, never iron; odd counts; the leiwen with its one flaw.
// Frame: origin on the ground at the plot centre, +z the front.
/* a heap of ore or gravel: a squat cone with a few lumps on it */
function lwHeap(x, z, r, h, mk, col, lump) {
  cone(mk, x, 0, z, r, h, col, 9);
  for (let i = 0; i < 5; i++) { const a = i * 2.39996, rr = r * (0.25 + 0.12 * i); sph(lump || mk, x + Math.cos(a) * rr, h * (0.55 - 0.08 * i), z + Math.sin(a) * rr, r * 0.16, col, 0.7, 6); }
}
/* a rectangle as the toolkit's corners (lzSlab) */
function lwRect(x0, z0, x1, z1) { return {bl: [x0, z0], br: [x1, z0], fr: [x1, z1], fl: [x0, z1]}; }
/* a bone trestle: two crossed legs at each end and a cane bar */
function lwTrestle(x, z, ry, L, h) {
  W(x, 0, z, ry, () => {
    for (const s of [-1, 1]) for (const t of [-1, 1]) beam('bones', [s * L / 2, 0, t * 0.45], [s * L / 2, h, -t * 0.1], 0.06, P('boneO'), true, 6);
    beam('cane', [-L / 2 - 0.2, h, 0], [L / 2 + 0.2, h, 0], 0.05, P('cane'), true, 6);
  });
}
defBuilding({key: 'lz-mine', name: 'Mine head', seed: 7211, caste: 2, cut: false, w: 16, d: 14, h: 9, budget: 70000,
  tags: {types: ['industry'], wealth: 'poor', role: 'mine'}, front: {x: 0, z: 7, yaw: 0},
  note: 'the copper and sulfur diggings: a battered basalt collar round the shaft, five bone legs of a headframe crossing above it, a cane windlass on bronze axles, the ore basket on its rope, a spoil heap streaked green, and the sorting floor with heaps of green copper ore and yellow sulfur',
  build(o) {
    lzDust(0, 0, 6);
    /* the collar: four leaning basalt walls round the shaft, a dark floor deep in it */
    lzBatterRoom(4.2, 4.2, 0, 1.1, 'basalt', P('basaltD'), {lean: {front: 0.08, back: -0.05, left: 0.06, right: -0.07}});
    cyl('basalt', 0, -0.2, 0, 1.6, 0.2, P('black'), 12);
    /* the headframe: five bone legs from a ring round the collar, crossing at the top and running past it (DESIGN.md: ribs outside) */
    for (let i = 0; i < 5; i++) { const a = i * 2 * PI / 5 + 0.3, x = Math.cos(a) * 3.4, z = Math.sin(a) * 3.4;
      beam('bones', [x, 0, z], [-x * 0.12, 7.6, -z * 0.12], 0.13, P('boneO'), true, 7, 0.07); }
    ring('rope', 0, 6.9, 0, 0.55, 0.06, P('reedD'), 0, PI / 2, 0, 12);
    /* the windlass: a cane drum on two bronze-capped bone posts, its crank, and the rope over the head to the basket */
    for (const s of [-1, 1]) { beam('bones', [s * 1.6, 0, 3.2], [s * 1.6, 1.9, 3.2], 0.11, P('bone'), true, 6); cyl('bronzeC', s * 1.6, 1.9, 3.2, 0.13, 0.12, P('bronze'), 8); }
    W(0, 1.9, 3.2, 0, () => WX(0, 0, 0, 0, 0, PI / 2, () => cyl('cane', 0, -1.5, 0, 0.32, 3.0, P('cane'), 10)));
    beam('bronzeC', [1.75, 1.9, 3.2], [2.3, 1.5, 3.2], 0.04, P('bronze'), true, 5);
    beam('rope', [0, 2.2, 3.1], [0, 6.8, 0.2], 0.03, P('reedD'), true, 5);
    beam('rope', [0, 6.8, 0], [0, 1.6, 0], 0.03, P('reedD'), true, 5);
    lathe('cane', 0, 0, [[0.2, 1.0], [0.45, 1.1], [0.5, 1.55], [0.46, 1.6]], 10, P('reedL'), {});
    /* the spoil heap behind, streaked green, and the sorting floor in front with the ore and the sulfur */
    lwHeap(-4.6, -3.6, 2.6, 2.4, 'earth', P('earth'), 'basalt');
    for (let i = 0; i < 7; i++) sph('bronze', -4.6 + Math.cos(i * 2.4) * 1.6, 0.7 + (i % 3) * 0.4, -3.6 + Math.sin(i * 2.4) * 1.6, 0.22, P('verd'), 0.6, 6);
    lzSlab(lwRect(2.2, 1.2, 7.4, 6.4), 0, 0.14, 'stoneP', P('basaltD'));
    lwHeap(3.6, 2.6, 0.9, 0.8, 'bronze', P('verd'));
    lwHeap(5.9, 2.8, 0.8, 0.7, 'bronze', P('verd'));
    lwHeap(4.4, 4.9, 0.85, 0.75, 'earth', P('ember'));
    lwHeap(6.4, 5.2, 0.6, 0.5, 'earth', P('ember'));
    FURNISH('generic_basket', 2.8, 0.14, 5.6, 0.3, {setting: 'outdoor'});
    FURNISH('generic_storage_jar', -2.6, 0, 4.6, 0, {setting: 'outdoor'});
    /* a stela with the flawed leiwen at the head of the diggings */
    lzStela(-5.6, 3.6, 0.4, 2.6, 0.8, {});
  }});
defBuilding({key: 'lz-weir', name: 'Fishing weir and drying racks', seed: 7212, caste: 3, cut: false, w: 18, d: 14, h: 5.5, budget: 60000,
  tags: {types: ['industry'], wealth: 'poor', role: 'fishery'}, front: {x: 0, z: 7, yaw: 0},
  note: 'a V of cane stakes and reed screens running out into the shallows (the -z side stands in the water), the trap at its point, and on the shore five bone racks of split fish drying, with baskets and a bone-hall cart',
  build(o) {
    /* the weir: two lines of thirteen cane stakes converging on the trap, reed mat screens between them */
    for (const s of [-1, 1]) { for (let i = 0; i < 13; i++) { const t = i / 12, x = s * (7.5 - 6.3 * t), z = -0.8 - 5.6 * t;
        beam('cane', [x, -0.6, z], [x, 1.5 - 0.3 * t, z], 0.05, P('cane'), true, 5); }
      plane4('mat', [s * 7.5, -0.4, -0.8], [s * 1.2, -0.4, -6.4], [s * 1.2, 1.1, -6.4], 0.03, P('reedL')); }
    /* the trap: a round cane basket at the point */
    lathe('cane', 0, -6.6, [[0.4, -0.6], [1.0, -0.4], [1.1, 0.6], [0.7, 1.2], [0.3, 1.3]], 12, P('reedL'), {});
    /* the drying racks on the shore: five bone frames, cane bars, the fish split and hung */
    for (let r = 0; r < 5; r++) { const x = -6 + r * 3;
      for (const s of [-1, 1]) beam('bones', [x + s * 1.2, 0, 3.4], [x + s * 1.2, 2.6, 3.4], 0.07, P('boneO'), true, 6);
      for (const y of [1.6, 2.3]) { beam('cane', [x - 1.35, y, 3.4], [x + 1.35, y, 3.4], 0.04, P('cane'), true, 5);
        for (let f = 0; f < 5; f++) ellip('hide', x - 1 + f * 0.5, y - 0.32, 3.4, 0.12, 0.3, 0.04, P('hideD'), 0, 6); } }
    FURNISH('generic_basket', -4.5, 0, 5.6, 0.2, {setting: 'outdoor'});
    FURNISH('generic_basket', 4.2, 0, 5.9, -0.4, {setting: 'outdoor'});
    lzStela(7.2, 4.8, -0.3, 2.0, 0.6, {});
  }});
defBuilding({key: 'lz-placer', name: 'Placer washing floor', seed: 7213, caste: 2, cut: false, w: 18, d: 10, h: 4.2, budget: 55000,
  tags: {types: ['industry'], wealth: 'poor', role: 'mine'}, front: {x: 0, z: 5, yaw: 0},
  note: 'Komodo\'s tin and gold from the river gravels: three cane sluice boxes with bone riffles on trestles, falling toward the river (the -z side), the gravel heaps, the washed tailings, the panning basin and the bronze-bound chest for the concentrate',
  build(o) {
    lzDust(0, 0, 5);
    for (let i = 0; i < 3; i++) { const x = -5 + i * 5;
      lwTrestle(x, 1.2, PI / 2, 2.4, 1.3); lwTrestle(x, -2.6, PI / 2, 2.4, 0.9);
      W(x, 0, -0.7, 0, () => { box('cane', 0, 1.1, 0, 1.0, 0.08, 6.4, P('cane'), 0, 0.07);
        for (const s of [-1, 1]) box('cane', s * 0.5, 1.15, 0, 0.06, 0.32, 6.4, P('reedL'), 0, 0.07);
        for (let k = 0; k < 7; k++) box('bones', 0, 1.25 - k * 0.07, -2.8 + k * 0.85, 0.94, 0.05, 0.06, P('bone'), 0, 0.07); }); }
    lwHeap(-6.8, 3.4, 1.6, 1.4, 'earth', P('earthP'), 'basalt');
    lwHeap(6.6, 3.2, 1.4, 1.2, 'earth', P('earth'), 'basalt');
    lwHeap(0, -4.2, 1.8, 0.7, 'earth', P('earthP'));
    cyl('brick', 3.2, 0, 3.6, 0.9, 0.3, P('brick'), 12);
    FURNISH('lizardmen_common_chest', -2.6, 0, 3.8, 0, {setting: 'outdoor'});
    FURNISH('generic_basket', 1.0, 0, 3.9, 0.5, {setting: 'outdoor'});
  }});
defBuilding({key: 'lz-cistern', name: 'Cistern', seed: 7214, caste: 'all', cut: false, w: 12, d: 12, h: 4, budget: 50000,
  tags: {types: ['infrastructure'], wealth: 'middle', role: 'cistern'}, front: {x: 0, z: 6, yaw: 0},
  note: 'Tuatara has no perennial water: a sunken brick cistern filled in the wet season, roofed with basalt slabs on a squared brick rim (the leiwen band round it, one flaw), a square draw hole with a bone sweep and a lacquered bucket, and the paved catchment draining to it',
  build(o) {
    /* the paved catchment sloping to the rim, the rim, the slab roof, the draw hole */
    lzSlab(lwRect(-5.6, -5.6, 5.6, 5.6), 0, 0.12, 'brick', P('brick'));
    lzBatterRoom(7.2, 7.2, 0.12, 0.9, 'brick', P('brick'), {lean: {front: 0.05, back: -0.04, left: 0.05, right: -0.05}});
    for (const s of [-1, 1]) { box('stoneP', s * 2.25, 1.02, 0, 2.7, 0.22, 7.4, P('basaltD')); }
    box('stoneP', 0, 1.02, -2.4, 1.8, 0.22, 2.6, P('basaltD'));
    box('stoneP', 0, 1.02, 2.4, 1.8, 0.22, 2.6, P('basaltD'));
    W(0, 0.45, 3.62, 0, () => lzLeiwen(6.4, 0.42, {cell: 0.26, mk: 'bronze', back: false, t: 0.025, proud: 0.02}));
    /* the sweep over the draw hole */
    for (const s of [-1, 1]) beam('bones', [-2.4 + s * 0.4, 1.24, -1.8], [-2.4 + s * 0.1, 3.4, -1.5], 0.08, P('boneO'), true, 6);
    beam('bones', [-2.4, 2.6, -3.6], [0, 3.9, 0], 0.07, P('bone'), true, 6, 0.04);
    box('basalt', -2.4, 2.1, -3.5, 0.5, 0.42, 0.42, P('basaltD'), 0.2);
    beam('rope', [0, 3.88, 0], [0, 1.9, 0], 0.016, P('reedD'), true, 5);
    lathe('lacqR', 0, 0, [[0.06, 1.3], [0.22, 1.33], [0.25, 1.64], [0.23, 1.72]], 12, P('oxblood'), {});
    FURNISH('generic_storage_jar', 4.6, 0.12, 4.4, 0, {setting: 'outdoor'});
    FURNISH('lizardmen_common_jug', 4.0, 0.12, 4.9, 0.6, {setting: 'outdoor'});
  }});
defBuilding({key: 'lz-fungus', name: 'Fungus beds', seed: 7215, caste: 1, cut: false, w: 20, d: 14, h: 5, budget: 65000,
  tags: {types: ['farm'], wealth: 'poor', role: 'farm'}, front: {x: 0, z: 5.5, yaw: 0},
  note: 'the Tubes\' crop grown in the dark (kits/crops pale fungi, works dark-beds): seven long brick beds of dung and reed under a low reed vault on eleven bone ribs, the pale caps crowding the beds, shade mats hung at the ends, the Tenders\' baskets',
  build(o) {
    lzDust(0, 0, 6);
    lzRibRoof(18, 9.2, 0.6, 4.2, 11, {mk: 'thatch', drop: 0.3});
    for (let i = 0; i < 7; i++) { const z = -3.6 + i * 1.2;
      box('brick', 0, 0, z, 15.5, 0.38, 0.8, P('brick'));
      box('earth', 0, 0.38, z, 15.2, 0.06, 0.66, P('earthP'));
      for (let k = 0; k < 13; k++) { const x = -7 + k * 1.15 + ((i * 7 + k * 3) % 5) * 0.08;
        cyl('ivory', x, 0.42, z, 0.04, 0.12, P('white'), 6); sph('ivory', x, 0.56, z, 0.13, P('spore'), 0.45, 7); } }
    for (const s of [-1, 1]) plane4('mat', [s * 8.6, 0.2, -4.4], [s * 8.6, 0.2, 4.4], [s * 8.6, 3.2, 4.4], 0.03, P('reedD'));
    FURNISH('generic_basket', -5.2, 0, 4.8, 0.2, {setting: 'outdoor'});
    FURNISH('generic_basket', 5.0, 0, 4.9, -0.3, {setting: 'outdoor'});
    FURNISH('generic_storage_jar', 0.4, 0, 4.9, 0, {setting: 'outdoor'});
  }});
