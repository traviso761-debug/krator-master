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

/* a gnarled Rift fruit and pod tree for lz-orchard: twisted trunk, three limbs, layered matW/thatch whorl canopy, hanging pods */
function lwGroveTree(x, z, h, seedOff) {
  W(x, 0, z, seedOff * 1.1, () => {
    cyl('brick', 0, 0, 0, 1.15, 0.14, P('brick'), 10);
    cyl('earth', 0, 0.14, 0, 0.98, 0.05, P('earth'), 10);
    tube('wood', t => [Math.sin(t * 2.4 + seedOff) * 0.18 * t, t * h * 0.58, Math.cos(t * 1.9) * 0.14 * t],
      t => { const r = 0.22 * (1 - 0.48 * t); return [r, r]; }, 8, 7, P('reedD'), {caps: true});
    const cy = h * 0.56;
    for (let k = 0; k < 5; k++) {
      const a = k * TAU / 5 + 0.35, lx = Math.cos(a) * 1.35, lz = Math.sin(a) * 1.35, ly = cy + 0.65 + (k % 2) * 0.22;
      beam('wood', [0, cy - 0.15, 0], [lx, ly, lz], 0.075, P('reedD'), true, 6);
      W(lx * 0.92, ly + 0.08, lz * 0.92, a, () => {
        cone('matW', 0, 0, 0, 1.18, 0.52, P(k % 2 ? 'jade' : 'moss'), 8);
        for (let p = 0; p < 3; p++) {
          const pa = p * TAU / 3 + k;
          sph(p === 0 ? 'lacqR' : 'cane', Math.cos(pa) * 0.45, -0.14 - p * 0.05, Math.sin(pa) * 0.45, 0.13, P(p === 0 ? 'oxblood' : 'reedL'), 1.25, 7);
        }
      });
    }
    cone('thatch', 0, cy + 0.85, 0, 1.45, 0.68, P('moss'), 9);
  });
}

/* a loaded bone-runner haul sledge for quarries and Coil waystones */
function lwSledge(x, z, ry, kind) {
  W(x, 0, z, ry, () => {
    for (const s of [-1, 1]) {
      beam('bones', [s * 0.62, 0.08, -1.45], [s * 0.62, 0.08, 1.25], 0.07, P('boneO'), true, 6);
      lzHorn(s * 0.62, 0.08, 1.25, 0, 0.55, 0.065, {curl: 0.75, lean: 0.6, mk: 'bones', nt: 6, ns: 5});
    }
    for (let i = 0; i < 5; i++) {
      const rz = -1.2 + i * 0.58;
      beam('cane', [-0.68, 0.16, rz], [0.68, 0.16, rz], 0.045, P('cane'), true, 5);
    }
    if (kind === 'stone') {
      box('cyclo', 0, 0.2, -0.1, 1.05, 0.72, 1.65, P('basalt'), 0.04);
      for (const rz of [-0.55, 0.35]) ring('rope', 0, 0.52, rz, 0.62, 0.024, P('reedD'), PI / 2, 0, 0, 12);
    } else {
      box('matW', 0, 0.2, -0.15, 1.16, 0.08, 2.2, P('reedL'));
      FURNISH('generic_sack', -0.26, 0.24, -0.55, 0.2, {setting: 'outdoor'});
      FURNISH('generic_sack', 0.28, 0.24, -0.45, -0.4, {setting: 'outdoor'});
      FURNISH('generic_crate', 0, 0.24, 0.42, 0.08, {setting: 'outdoor'});
    }
  });
}

defBuilding({key: 'lz-quarry', name: 'Basalt quarry and splitting yard', seed: 7216, caste: 6, cut: false, w: 20, d: 18, h: 7.4, budget: 80000,
  tags: {types: ['industry'], wealth: 'poor', role: 'quarry', job: 'quarrying'}, front: {x: 0, z: 9, yaw: 0},
  note: 'where the cyclopean and plinth basalt is wedged from the Rift floor: three stepped polygonal benches, a half-cleaved block with seven bronze splitting wedges along a groove, a five-spar bone sheerlegs crane hoisting a dressed stone in a rope sling, a bone-runner stone sledge and a reed shade lean-to',
  build(o) {
    lzDust(0, 0, 8.2);
    lzSlab(lwRect(-8.8, -7.8, 8.8, 7.6), 0, 0.12, 'stoneP', P('basaltD'));
    /* three stepped polygonal basalt quarry benches along the back and west face */
    for (let b = 0; b < 3; b++) {
      const bh = 3.1 - b * 0.92, bz = -6.6 + b * 1.55, bw = 15.6 - b * 1.8;
      box('cyclo', -0.6, 0.12, bz, bw, bh, 1.7, P(b % 2 ? 'basalt' : 'basaltD'), (b - 1) * 0.02);
      for (let k = 0; k < 5; k++) {
        box('basalt', -6.8 + k * 3.1, 0.12, bz + 0.72, 0.85, bh * 0.94, 0.48, P('basaltC'), (k % 3 - 1) * 0.06);
      }
    }
    /* splitting block in the yard: seven bronze wedges (odd) driven along a cleaved seam */
    W(-2.8, 0.12, -0.6, 0.08, () => {
      box('cyclo', 0, 0, 0, 3.4, 1.12, 1.55, P('basalt'));
      box('stoneP', 0, 1.12, 0, 3.36, 0.05, 0.12, P('black'));
      for (let w = 0; w < 7; w++) {
        cone('bronzeC', -1.32 + w * 0.44, 1.34, 0, 0.065, -0.26, P('bronze'), 5);
        box('bronzeC', -1.32 + w * 0.44, 1.12, 0, 0.09, 0.18, 0.06, P('bronze'));
      }
    });
    /* five-spar bone sheerlegs crane over a hoisted dressed basalt block */
    W(3.2, 0.12, -1.1, 0, () => {
      for (let i = 0; i < 5; i++) {
        const a = i * TAU / 5 + 0.22, rx = Math.cos(a) * 2.9, rz = Math.sin(a) * 2.9;
        beam('bones', [rx, 0, rz], [-rx * 0.1, 6.4, -rz * 0.1], 0.12, P('boneO'), true, 7, 0.05);
      }
      ring('rope', 0, 5.85, 0, 0.44, 0.05, P('reedD'), 0, PI / 2, 0, 12);
      beam('rope', [0, 5.85, 0], [0, 2.05, 0], 0.032, P('reedD'), true, 5);
      cyl('bronzeC', 0, 1.92, 0, 0.14, 0.16, P('bronze'), 8);
      box('stoneP', 0, 0.78, 0, 1.55, 0.96, 1.05, P('basaltC'), 0.05);
      for (const sx of [-0.48, 0.48]) ring('rope', sx, 1.26, 0, 0.62, 0.025, P('reedD'), 0, 0, PI / 2, 12);
    });
    lwSledge(4.8, 4.4, -0.32, 'stone');
    for (let r = 0; r < 5; r++) {
      W(4.8, 0.12, 4.4, -0.32, () => WX(0, 0.05, -1.3 + r * 0.65, 0, 0, PI / 2, () => cyl('wood', 0, -0.75, 0, 0.06, 1.5, P('reedD'), 7)));
    }
    /* stonecutters' three-post reed shade awning and tool chest */
    W(-5.6, 0.12, 4.5, 0.1, () => {
      for (const sx of [-1.6, 0, 1.6]) for (const sz of [-1.1, 1.1]) beam('bones', [sx, 0, sz], [sx, 2.25 + (sz < 0 ? 0.25 : 0), sz], 0.065, P('boneO'), true, 6);
      box('matW', 0, 2.38, 0, 3.6, 0.06, 2.6, P('reedL'), 0, 0, 0);
      FURNISH('lizardmen_common_chest', -0.7, 0, -0.3, 0, {setting: 'outdoor'});
      FURNISH('generic_storage_jar', 0.85, 0, 0.25, 0.4, {setting: 'outdoor'});
      FURNISH('lizardmen_common_jug', 0.4, 0, 0.65, -0.3, {setting: 'outdoor'});
    });
    lwHeap(-7.2, 0.8, 1.45, 1.15, 'basalt', P('basaltD'));
    lwHeap(7.4, 1.2, 1.2, 0.95, 'basalt', P('basaltC'));
    lzStela(7.4, 6.2, -0.35, 2.4, 0.72, {});
  }});

defBuilding({key: 'lz-bakehouse', name: 'Earth-oven and yam bakehouse', seed: 7217, caste: 'all', cut: true, w: 17, d: 16, h: 8.4, budget: 95000,
  tags: {types: ['industry'], wealth: 'middle', role: 'workshop', job: 'baking'},
  note: 'where the panemone windmills\' flour and the fields\' Rift tubers are baked: a battered brick-and-earth hall under seven smoke-darkened reed ribs, and in its paved forecourt three domed brick beehive ovens glowing with embers, wooden peels on a bone rack and cooling trays of ash-cakes',
  build(o) {
    W(0, 0, -1.6, 0, () => {
      ltHall(11.6, 7.2, 2.2, 3.9, 'earth', P('earth'), 'thatch', P('reedD'), {
        mkf: s => s === 'front' || s === 'back' ? 'brick' : 'earth',
        colf: s => s === 'front' || s === 'back' ? P('brick') : P('earth'),
        portalMk: 'lacqR', endMk: 'reed', endCol: P('reedD'), n: 7
      });
      W(-2.8, 0.14, 7.2 / 2 - 0.06, 0, () => lzLeiwen(2.5, 0.96, {cell: 0.32, mk: 'lacqR', back: 'lacq'}));
      lzFurnRoom(10.6, 6.2, 0.14, 'common', {
        beds: 0, noHearth: true, ceil: 3.9,
        extra: [
          ['lizardmen_common_workbench', -3.4, -1.8, 0],
          ['lizardmen_common_workbench', 1.4, -1.9, 0],
          ['generic_sack', -4.4, 1.4, 0.3],
          ['generic_sack', -3.5, 1.6, 1.1],
          ['generic_veg_basket', 3.8, 1.3, -0.4],
          ['generic_storage_jar', 4.3, -1.6, 0],
          ['lizardmen_common_board', 0, 1.2, 0]
        ]
      });
    });
    lzNoCut(() => {
      lzSlab(lwRect(-6.8, 2.1, 6.8, 7.1), 0, 0.14, 'brick', P('brick'));
      /* three domed brick beehive earth-ovens (odd count: 3) in the forecourt */
      for (let i = 0; i < 3; i++) {
        const ox = -4.2 + i * 4.2, oz = 4.8 + (i === 1 ? 0.35 : 0);
        W(ox, 0.14, oz, i === 0 ? 0.18 : i === 2 ? -0.18 : 0, () => {
          cyl('stoneP', 0, 0, 0, 1.38, 0.36, P('basaltD'), 12);
          lathe('brick', 0, 0, [[1.28, 0.36], [1.32, 0.86], [1.02, 1.46], [0.46, 1.88], [0.22, 1.98]], 14, P('brick'), {});
          cyl('brick', 0, 1.86, -0.15, 0.22, 0.48, P('reedD'), 8);
          box('stoneP', 0, 0.36, 1.16, 0.72, 0.62, 0.32, P('basaltD'));
          box('lacq', 0, 0.4, 1.06, 0.48, 0.42, 0.24, P('black'));
          sph('bronze', 0, 0.46, 1.02, 0.2, P('ember'), 0.45, 7);
        });
        if (i !== 2) smokeAt(ox, 2.6, oz - 0.15, {r: 0.24, kind: 'fire'});
      }
      /* bone cooling rack of woven cane trays holding ash-cakes and roasted yams, plus baking peels */
      lwTrestle(0, 6.55, 0, 3.2, 0.88);
      for (const tx of [-0.95, 0, 0.95]) {
        cyl('matW', tx, 0.9, 6.55, 0.42, 0.04, P('reedL'), 10);
        for (let c = 0; c < 3; c++) cyl('cane', tx + (c - 1) * 0.18, 0.94, 6.55 + (c % 2 - 0.5) * 0.14, 0.11, 0.06, P('brick'), 8);
      }
      for (let p = 0; p < 3; p++) {
        beam('wood', [6.1, 0.16, 3.2 + p * 0.45], [6.25, 2.1, 2.5 + p * 0.45], 0.025, P('reedD'), true, 5);
        box('wood', 6.08, 0.22, 3.25 + p * 0.45, 0.05, 0.34, 0.28, P('cane'));
      }
      FURNISH('generic_basket', -6.0, 0.14, 6.2, 0.2, {setting: 'outdoor'});
      FURNISH('generic_sack', 5.8, 0.14, 6.1, -0.5, {setting: 'outdoor'});
    });
    door(0, 0.14, 2.1, 0, 2.2);
  }});

defBuilding({key: 'lz-fermentery', name: 'Spore-and-yam fermenting house', seed: 7218, caste: 'all', cut: true, w: 18, d: 15, h: 8.6, budget: 100000,
  tags: {types: ['industry'], wealth: 'middle', role: 'workshop', job: 'brewing'},
  note: 'a cool thick-walled hall of rammed earth and black lacquer under nine bone ribs and damp reed matting, where roasted tubers, grain mash and sweet-rot cultures steep in seven lacquered vats set along a brick bench; pressing and straining frames stand under the front awning',
  build(o) {
    W(0, 0, -1.2, 0, () => {
      ltHall(12.6, 7.6, 2.4, 4.2, 'earthR', P('earth'), 'matW', P('reedD'), {
        portalMk: 'bronze', endMk: 'lacq', endCol: P('lacq'), n: 9, past: 0.26
      });
      W(3.1, 0.14, 7.6 / 2 - 0.05, 0, () => lzLeiwen(2.9, 1.08, {cell: 0.34, mk: 'bronze', back: 'lacq'}));
      /* brick vat-bench along the back wall holding seven sunken lacquered mash vats (odd count: 7) */
      box('brick', 0, 0.14, -2.55, 11.2, 0.78, 1.55, P('brick'));
      for (let v = 0; v < 7; v++) {
        const vx = -4.5 + v * 1.5;
        lathe('lacqR', vx, -2.55, [[0.42, 0.88], [0.54, 1.06], [0.5, 1.38], [0.44, 1.44]], 12, P(v % 2 ? 'oxblood' : 'lacq'), {});
        cyl('matW', vx, 1.42, -2.55, 0.45, 0.04, P('reedL'), 10);
        if (v % 2 === 0) beam('bones', [vx - 0.1, 1.44, -2.55], [vx + 0.22, 2.15, -2.2], 0.026, P('bone'), true, 5);
      }
      lzFurnRoom(11.4, 6.4, 0.14, 'common', {
        beds: 0, noHearth: true, ceil: 4.1,
        extra: [
          ['generic_trade_press', -4.2, 1.2, PI / 2],
          ['generic_trade_vat', 4.2, 1.2, -PI / 2],
          ['lizardmen_common_workbench', 0, 1.3, 0],
          ['lizardmen_court_jug', -2.2, 1.8, 0.4],
          ['lizardmen_common_jug', -1.5, 1.9, -0.3],
          ['generic_storage_jar', 2.4, 1.8, 0.2],
          ['generic_barrel', 3.4, -0.4, 0]
        ]
      });
    });
    lzNoCut(() => {
      /* front shade awning with straining jars and mash baskets */
      W(-3.8, 0, 4.9, 0, () => {
        for (const sx of [-1.8, 0, 1.8]) beam('bones', [sx, 0, 1.1], [sx, 2.15, 1.1], 0.06, P('boneO'), true, 6);
        for (const sx of [-1.8, 0, 1.8]) beam('cane', [sx, 2.35, -1.2], [sx, 2.12, 1.25], 0.045, P('cane'), true, 5);
        box('matW', 0, 2.24, 0, 4.0, 0.05, 2.5, P('reedL'));
        FURNISH('generic_storage_jar', -1.1, 0, 0.2, 0, {setting: 'outdoor'});
        FURNISH('generic_storage_jar', -0.3, 0, 0.35, 0.7, {setting: 'outdoor'});
        FURNISH('lizardmen_common_jug', 0.6, 0, 0.25, -0.4, {setting: 'outdoor'});
        FURNISH('generic_basket', 1.3, 0, 0.3, 0.2, {setting: 'outdoor'});
      });
    });
    door(0, 0.14, 2.6, 0, 2.4);
  }});

defBuilding({key: 'lz-orchard', name: 'Walled Rift fruit and pod grove', seed: 7219, caste: 3, cut: false, w: 24, d: 18, h: 6.8, budget: 85000,
  tags: {types: ['industry', 'farm'], wealth: 'poor', role: 'orchard', job: 'farming'}, front: {x: 0, z: 9, yaw: 0},
  note: 'a drystone basalt-and-earth walled grove sheltering seven gnarled Rift fruit, bell-date and aril-pod trees watered by brick rills from a corner basin, with bone picking tripods and reed drying mats',
  build(o) {
    const Wd = 22, Dp = 16;
    box('earthR', 0, 0, 0, Wd + 0.6, 0.08, Dp + 0.6, P('earthP'));
    /* low battered basalt-and-earth perimeter wall with gated gap on +z and horned gateposts */
    for (const [wx, wz, wl, wry] of [[-6.2, Dp / 2, 8.6, 0], [6.2, Dp / 2, 8.6, 0], [0, -Dp / 2, Wd, 0], [-Wd / 2, 0, Dp, PI / 2], [Wd / 2, 0, Dp, PI / 2]]) {
      W(wx, 0.08, wz, wry, () => box('basalt', 0, 0, 0, wl, 0.88, 0.52, P('basalt')));
    }
    for (const s of [-1, 1]) {
      box('stoneP', s * 1.85, 0.08, Dp / 2, 0.62, 1.25, 0.62, P('basaltD'));
      lzHorn(s * 1.85, 1.32, Dp / 2, s > 0 ? -0.3 : 0.3, 1.35, 0.08, {curl: 0.55, mk: 'horn'});
    }
    /* brick irrigation spine and cross-rills feeding seven gnarled Rift fruit trees (odd count: 7) */
    box('brick', 0, 0.08, -0.4, 17.6, 0.1, 0.42, P('brick'));
    const trees = [[-7.2, -4.4, 5.2], [0, -4.8, 5.6], [7.2, -4.2, 5.1], [-4.2, 0.2, 5.4], [4.2, 0.4, 5.5], [-6.8, 4.4, 4.9], [6.8, 4.2, 5.0]];
    for (let i = 0; i < trees.length; i++) {
      const [tx, tz, th] = trees[i];
      box('brick', tx, 0.08, (tz - 0.4) / 2, 0.34, 0.09, Math.abs(tz + 0.4), P('brick'));
      lwGroveTree(tx, tz, th, i + 1);
    }
    /* bone picking tripod and woven drying mats of harvested fruit near the gate */
    W(-2.2, 0.08, 4.8, 0.3, () => {
      for (let k = 0; k < 3; k++) {
        const a = k * TAU / 3;
        beam('bones', [Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75], [0, 2.35, 0], 0.05, P('boneO'), true, 5);
      }
      for (let r = 1; r <= 4; r++) beam('cane', [-0.55 + r * 0.09, r * 0.45, 0.38 - r * 0.07], [0.55 - r * 0.09, r * 0.45, 0.38 - r * 0.07], 0.025, P('cane'), true, 4);
    });
    for (const mx of [1.6, 3.4]) {
      cyl('matW', mx, 0.09, 5.2, 0.72, 0.04, P('reedL'), 10);
      for (let f = 0; f < 5; f++) sph('lacqR', mx + Math.cos(f * 2.4) * 0.34, 0.19, 5.2 + Math.sin(f * 2.4) * 0.34, 0.11, P(f % 2 ? 'oxblood' : 'reedL'), 0.85, 6);
    }
    FURNISH('generic_veg_basket', -0.4, 0.08, 6.2, 0.2, {setting: 'outdoor'});
    FURNISH('generic_basket', 0.8, 0.08, 6.4, -0.5, {setting: 'outdoor'});
    FURNISH('lizardmen_common_jug', -3.6, 0.08, 6.1, 0.4, {setting: 'outdoor'});
  }});

defBuilding({key: 'lz-skimmer', name: 'Lakecake skimming jetty and presses', seed: 7220, caste: 3, cut: false, w: 16, d: 14, h: 4.8, budget: 60000,
  tags: {types: ['industry'], wealth: 'poor', role: 'fishery', job: 'fishing'}, front: {x: 0, z: 7, yaw: 0},
  note: 'Gila\'s salt-lake alga harvest: a basalt-and-bone skimming jetty stepping into the brine (-z in the water), fine cane skimming frames, three stone-weighted reed presses squeezing green algal curds, and five bone racks of square lakecakes curing in the sun',
  build(o) {
    /* basalt-and-bone skimming causeway running out into the shallows (-z) */
    box('stoneP', 0, -0.35, -2.6, 3.2, 0.55, 7.6, P('basaltD'));
    for (let i = 0; i < 5; i++) {
      const pz = -0.4 - i * 1.45;
      for (const s of [-1, 1]) beam('bones', [s * 1.75, -0.55, pz], [s * 1.65, 1.35, pz], 0.065, P('boneO'), true, 6);
      if (i % 2 === 0) {
        W(i === 2 ? -2.2 : 2.2, -0.15, pz - 0.3, i === 2 ? 0.25 : -0.25, () => {
          box('cane', 0, 0.12, 0, 1.5, 0.05, 1.9, P('cane'));
          box('matW', 0, 0.15, 0, 1.38, 0.04, 1.78, P('moss'));
          beam('bones', [0, 0.16, 0.9], [0, 1.05, 2.4], 0.04, P('bone'), true, 5);
        });
      }
    }
    /* three stone-weighted algal pressing troughs on shore (+z) */
    lzSlab(lwRect(-6.8, 1.2, 6.8, 6.2), 0, 0.12, 'stoneP', P('basaltD'));
    for (let p = 0; p < 3; p++) {
      const px = -4.6 + p * 2.2;
      W(px, 0.12, 2.8, 0, () => {
        box('brick', 0, 0, 0, 1.45, 0.52, 1.45, P('brick'));
        box('matW', 0, 0.52, 0, 1.28, 0.18, 1.28, P('moss'));
        box('wood', 0, 0.7, 0, 1.32, 0.08, 1.32, P('reedD'));
        box('cyclo', 0, 0.78, 0, 0.68, 0.36, 0.68, P('basaltD'), 0.15);
      });
    }
    /* five bone drying racks hung with square olive-green lakecakes */
    for (let r = 0; r < 5; r++) {
      const rx = 1.2 + (r % 3) * 2.2, rz = r < 3 ? 2.6 : 4.8;
      W(rx, 0.12, rz, 0, () => {
        for (const s of [-1, 1]) beam('bones', [s * 0.85, 0, 0], [s * 0.85, 2.15, 0], 0.055, P('boneO'), true, 5);
        for (const yy of [1.15, 1.85]) {
          beam('cane', [-0.95, yy, 0], [0.95, yy, 0], 0.035, P('cane'), true, 5);
          for (let c = 0; c < 3; c++) box('matW', -0.52 + c * 0.52, yy - 0.24, 0, 0.38, 0.36, 0.05, P(c === 1 ? 'jade' : 'moss'));
        }
      });
    }
    FURNISH('generic_basket', -5.4, 0.12, 5.2, 0.3, {setting: 'outdoor'});
    FURNISH('generic_sack', -4.2, 0.12, 5.4, -0.4, {setting: 'outdoor'});
    lzStela(-6.2, 4.9, 0.28, 2.0, 0.6, {});
  }});

defBuilding({key: 'lz-waystone', name: 'Coil waystone and haul sledge', seed: 7221, caste: 'all', cut: false, w: 8, d: 7, h: 4.8, budget: 40000,
  tags: {types: ['infrastructure', 'religious'], wealth: 'poor', role: 'shrine'}, front: {x: 0, z: 3.5, yaw: 0},
  note: 'a roadside station on the Coil Rounds: a five-course twisted basalt mile-cairn with a flawed bronze leiwen band and spiral eye, a three-rib bone water-jar shelter, and a loaded Drovers\' bone-runner haul sledge',
  build(o) {
    lzDust(0, 0, 3.2);
    box('stoneP', -1.8, 0, -0.6, 2.2, 0.24, 2.2, P('basaltD'));
    W(-1.8, 0.24, -0.6, 0, () => {
      lzTwist(0, 0, 3.2, 5, 1.15, 0.58, 0.09, {
        mk: 'cyclo', col: P('basalt'),
        each: (i, y, w, ry) => {
          if (i === 1) W(0, y + 0.08, 0, ry, () => W(0, 0, w / 2 + 0.015, 0, () => lzLeiwen(w * 0.86, 0.36, {cell: 0.18, mk: 'bronze', back: false, t: 0.02, proud: 0.02})));
          if (i === 4) W(0, y + 0.24, 0, ry, () => lzEye(0, 0, w / 2 + 0.02, 0, w * 0.32, {mk: 'bronze'}));
        }
      });
      cone('stoneP', 0, 3.2, 0, 0.38, 0.85, P('basaltD'), 4);
    });
    /* small three-rib bone-and-mat water-jar shelter for passing Coil carriers */
    W(-1.8, 0, 1.5, 0, () => {
      for (const sx of [-0.85, 0.85]) for (const sz of [-0.6, 0.6]) beam('bones', [sx, 0, sz], [sx, 1.45, sz], 0.045, P('boneO'), true, 5);
      box('matW', 0, 1.48, 0, 1.95, 0.05, 1.45, P('reedL'));
      FURNISH('generic_storage_jar', -0.35, 0, 0, 0.2, {setting: 'outdoor'});
      FURNISH('lizardmen_common_jug', 0.35, 0, 0.1, -0.5, {setting: 'outdoor'});
    });
    lwSledge(1.65, 0.2, 0.18, 'cargo');
  }});
