/* ======================================================================
   Krator master catalog — biome fruit
   One edible fruit (or nut, seed, pod or fungus) for each fruiting plant the
   biome kits draw, harvested and brought indoors. Culture 'generic', type
   'food' (one 'drink'), anchor 'surface': each fits a shelf board or a table
   top like the pieces in krator-master-furniture-generic-goods.js. Two variants each: as
   picked, and as served or prepared.

   Every entry carries two extra fields, outside the SPEC:
     biome   the kit under biomes/ it comes from
     source  the species keys there that bear it (biomes/<kit>/src/50-*-species.js),
             or the floor plant's name where it has no key
   Colours follow the part the biome draws (pods, berries, fruit heads), in
   FPAL['generic'] under fruit* / fungus*. biomes/FRUIT.md has the notes.

   KFRUIT holds shared shapes; like KGEN it takes colours, never palette keys.
   ====================================================================== */

const KFRUIT = {
  /* a flat leaf or husk to serve on, lying on the top */
  leaf(F, x, z, r, col) { F.blob(x, 0.01, z, r, 0.02, 0, col, 'food'); },
  /* a halved round fruit, cut face up: rind cup and a flesh disc */
  half(F, x, y, z, r, rind, flesh) {
    F.frustum(x, y, z, r * 0.55, r, r * 0.6, 0, rind, 'food', 16);
    F.cyl(x, y + r * 0.6 - 0.015, z, r * 0.92, 0.02, 0, flesh, 'food');
  },
  /* a pod lying along x with n ridges round it */
  ridged(F, x0, x1, y, z, r, col, n) {
    KGEN.capsule(F, x0, x1, y, z, r, col);
    for (let i = 0; i < n; i++) {
      const a = i * F.TAU / n, dy = Math.sin(a) * r * 0.85, dz = Math.cos(a) * r * 0.85;
      if (dy < -r * 0.5) continue;
      F.rod(x0, y + r + dy, z + dz, x1, y + r + dy, z + dz, Math.max(r * 0.3, 0.008), F.shade(col, i % 2 ? -0.12 : 0.06), 'food');
    }
  },
  /* a wedge (three-sided prism) of flesh with a rind strip, lying on y */
  wedge(F, x, y, z, r, h, ry, flesh, rind) {
    F.frustum(x, y, z, r, r, h, ry, flesh, 'food', 3);
    F.box(x - Math.sin(ry) * r * 0.5, y, z - Math.cos(ry) * r * 0.5, r * 1.6, h, 0.02, ry, rind, 'food');
  },
  /* a round head of short stubby keys or scales over a core */
  studded(F, x, y, z, r, core, tip, n) {
    const cy = y + r * 0.85;                    /* the core rests on y, the lowest studs just clear it */
    F.ball(x, cy, z, r * 0.85, core, 'food');
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, phi = Math.acos(1 - 2 * u), th = i * 2.39996;
      const px = Math.sin(phi) * Math.cos(th), py = Math.cos(phi), pz = Math.sin(phi) * Math.sin(th);
      if (py < -0.75) continue;
      F.ball(x + px * r * 0.82, cy + py * r * 0.82, z + pz * r * 0.82, Math.max(r * 0.2, 0.02), i % 3 ? tip : F.shade(tip, 0.1), 'food');
    }
  }
};

const FRUIT_ROOMS = ['kitchen', 'market', 'store', 'hall', 'tavern'];

/* ================= Eastern Abyss (4 pieces) ================= */

FURN({
  key: 'generic_fruit_scalefruit', name: 'Scalefruit', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'eastabyss', source: ['skyscale', 'forktree', 'bellbark'],
  w: 0.28, d: 0.27, h: 0.25, variants: 2, variantNames: ['whole pod', 'wedges on a leaf'],
  variantDims: [{ w: 0.15, d: 0.15, h: 0.25 }, { w: 0.28, d: 0.27, h: 0.06 }],
  build: function (F) {
    const red = F.col('fruitScaleRed'), flesh = F.col('fruitScaleFlesh');
    if (F.variant === 0) {
      /* stacked rings of scales, widest a third of the way up, a woody stalk where it broke off the bole */
      const rs = [0.05, 0.07, 0.075, 0.07, 0.06, 0.045, 0.03];
      for (let i = 0; i < rs.length; i++) F.frustum(0, i * 0.03, 0, rs[i], rs[i] * 0.8, 0.034, i * 0.4, F.shade(red, i % 2 ? -0.1 : 0.05), 'food', 9);
      F.cyl(0, 0.21, 0, 0.012, 0.04, 0, F.col('timberWalnut'), 'wood');
    } else {
      KFRUIT.leaf(F, 0, 0, 0.14, F.col('vegLeaf'));
      for (let i = 0; i < 4; i++) KFRUIT.wedge(F, -0.07 + i * 0.05, 0.02, (i % 2 ? 0.03 : -0.03), 0.05, 0.035, i * 0.5, flesh, red);
    }
  }
});

FURN({
  key: 'generic_fruit_fern_egg', name: 'Fern-egg', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'eastabyss', source: ['seedfern'],
  w: 0.25, d: 0.24, h: 0.11, variants: 2, variantNames: ['three in the husk', 'roasted and split'],
  variantDims: [{ w: 0.25, d: 0.23, h: 0.11 }, { w: 0.24, d: 0.24, h: 0.06 }],
  build: function (F) {
    const shell = F.col('fruitFernEgg'), meal = F.col('fruitFernMeal');
    if (F.variant === 0) {
      for (const [x, z] of [[-0.07, -0.03], [0.06, -0.04], [0, 0.06]]) {
        F.dome(x, 0, z, 0.055, 0.04, 0, F.shade(shell, -0.2), 'food');           /* the husk cup */
        F.blob(x, 0.055, z, 0.042, 0.1, 0, shell, 'food');
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneBuff'));
      for (const [x, z] of [[-0.045, 0], [0.045, 0.01]]) KFRUIT.half(F, x, 0.02, z, 0.045, F.shade(shell, -0.15), meal);
      F.cyl(0.0, 0.02, 0.07, 0.02, 0.02, 0, F.col('saltWhite'), 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_tideheart', name: 'Tideheart', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'glass'],
  biome: 'eastabyss', source: ['waterpalm'],
  w: 0.27, d: 0.27, h: 0.25, variants: 2, variantNames: ['fruit head', 'jelly in a glass dish'],
  variantDims: [{ w: 0.27, d: 0.27, h: 0.25 }, { w: 0.26, d: 0.26, h: 0.12 }],
  build: function (F) {
    const husk = F.col('fruitTideHusk'), jelly = F.col('fruitTideJelly');
    if (F.variant === 0) KFRUIT.studded(F, 0, 0, 0, 0.13, F.shade(husk, -0.2), husk, 40);
    else {
      F.frustum(0, 0, 0, 0.08, 0.13, 0.05, 0, F.col('glassClear'), 'glass', 16);
      KGEN.heap(F, 0, 0.03, 0, 0.12, 0.025, [jelly, F.shade(jelly, -0.08)], 'food', (x, y, z, c) => F.box(x, y, z, 0.04, 0.035, 0.04, x * 9, c, 'food'));
    }
  }
});

FURN({
  key: 'generic_fruit_salt_cone', name: 'Salt-cone Kernels', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'eastabyss', source: ['cycad'],
  w: 0.24, d: 0.22, h: 0.28, variants: 2, variantNames: ['seed cone', 'leached kernels'],
  variantDims: [{ w: 0.24, d: 0.21, h: 0.28 }, { w: 0.22, d: 0.22, h: 0.14 }],
  build: function (F) {
    const red = F.col('fruitCycadRed');
    if (F.variant === 0) {
      F.cone(0, 0, 0, 0.1, 0.28, 0, F.shade(red, -0.25), 'food');
      for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) {
        const a = i * F.TAU / 6 + j * 0.5, y = 0.03 + j * 0.045, r = 0.1 * (1 - y / 0.28) + 0.005;
        F.ball(Math.cos(a) * r, y, Math.sin(a) * r, 0.022, F.shade(red, (i + j) % 2 ? 0 : 0.12), 'food');
      }
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.11, 0.06, F.col('timberOak'), 'wood', red);
      KGEN.heap(F, 0, 0.045, 0, 0.09, 0.022, [red, F.shade(red, 0.15)], 'food');
    }
  }
});

/* ================= Hyperjungle (3 pieces, and the pandan keys it shares with the North-western Lowlands) ================= */

FURN({
  key: 'generic_fruit_gatepod', name: 'Gatepod', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'hyperjungle', source: ['baobab', 'swbay:baobab', 'nwbay:baobab'],
  w: 0.37, d: 0.37, h: 0.11, variants: 2, variantNames: ['cut round of pod', 'gatepod chalk'],
  variantDims: [{ w: 0.37, d: 0.37, h: 0.11 }, { w: 0.37, d: 0.22, h: 0.07 }],
  build: function (F) {
    const rind = F.col('fruitGateRind'), pulp = F.col('fruitGatePulp');
    if (F.variant === 0) {
      /* the pods hang metres long; what comes indoors is a round sawn off one */
      F.cyl(0, 0, 0, 0.18, 0.08, 0, rind, 'food');
      F.cyl(0, 0.07, 0, 0.165, 0.02, 0, pulp, 'food');
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.03 + (i % 3) * 0.04; F.ball(Math.cos(a) * r, 0.085, Math.sin(a) * r, 0.02, F.col('timberDark'), 'food'); }
    } else {
      F.box(0, 0, 0, 0.36, 0.025, 0.22, 0, F.col('timberPine'), 'wood');
      for (let i = 0; i < 8; i++) F.box(-0.12 + (i % 4) * 0.08, 0.025, i < 4 ? -0.045 : 0.045, 0.055, 0.04, 0.055, (i % 3) * 0.2, F.shade(pulp, -(i % 3) * 0.04), 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_mahogany_nut', name: 'Mahogany Nut', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'hyperjungle', source: ['mahogany'],
  w: 0.22, d: 0.22, h: 0.2, variants: 2, variantNames: ['capsule', 'roasted seeds'],
  variantDims: [{ w: 0.14, d: 0.14, h: 0.2 }, { w: 0.22, d: 0.22, h: 0.04 }],
  build: function (F) {
    const wood = F.col('fruitMahogany'), seed = F.col('fruitMahoganySeed');
    if (F.variant === 0) {
      F.blob(0, 0.09, 0, 0.07, 0.18, 0, wood, 'food');
      for (let i = 0; i < 5; i++) { const a = i * F.TAU / 5; F.beam(Math.cos(a) * 0.06, 0.02, Math.sin(a) * 0.06, Math.cos(a) * 0.06, 0.16, Math.sin(a) * 0.06, 0.02, 0.02, F.shade(wood, -0.2), 'food'); }
      F.cone(0, 0.17, 0, 0.02, 0.03, 0, F.shade(wood, -0.3), 'food');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.11, F.col('stoneClay'));
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9, r = i ? 0.06 : 0, x = Math.cos(a) * r, z = Math.sin(a) * r;
        F.blob(x, 0.03, z, 0.025, 0.02, 0, seed, 'food');
        F.box(x + Math.cos(a) * 0.03, 0.02, z + Math.sin(a) * 0.03, 0.04, 0.02, 0.02, -a, F.shade(seed, 0.2), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_fruit_silkpod', name: 'Silkpod', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food'],
  biome: 'hyperjungle', source: ['kapok'],
  w: 0.28, d: 0.2, h: 0.12, variants: 2, variantNames: ['young pods', 'ripe pod, burst'],
  variantDims: [{ w: 0.27, d: 0.16, h: 0.05 }, { w: 0.28, d: 0.2, h: 0.12 }],
  build: function (F) {
    if (F.variant === 0) {
      for (const z of [-0.055, 0, 0.055]) KGEN.capsule(F, -0.11, 0.11, 0, z, 0.025, F.shade('fruitSilkGreen', z * 2));
    } else {
      KFRUIT.ridged(F, -0.1, 0.1, 0, 0, 0.04, F.col('fruitMahogany'), 5);
      F.blob(0, 0.08, 0, 0.1, 0.07, 0, F.col('fruitSilkFloss'), 'food');
      for (let i = 0; i < 5; i++) F.ball(-0.06 + i * 0.03, 0.1, (i % 2 ? 0.02 : -0.02), 0.02, F.col('inkBlack'), 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_pandan_keys', name: 'Pandan Keys', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'nwlowlands', source: ['pandan', 'hyperjungle:screwpine', 'nwbay:pandan'],
  w: 0.34, d: 0.28, h: 0.26, variants: 2, variantNames: ['fruit head', 'loose keys and paste'],
  variantDims: [{ w: 0.29, d: 0.28, h: 0.26 }, { w: 0.34, d: 0.23, h: 0.09 }],
  build: function (F) {
    const key = F.col('fruitPandanKey'), tip = F.col('fruitPandanTip');
    if (F.variant === 0) KFRUIT.studded(F, 0, 0, 0, 0.14, key, tip, 48);
    else {
      KFRUIT.leaf(F, -0.05, 0, 0.12, F.col('vegLeaf'));
      for (let i = 0; i < 6; i++) {
        const x = -0.12 + (i % 3) * 0.06, z = i < 3 ? -0.04 : 0.04;
        F.frustum(x, 0.015, z, 0.025, 0.018, 0.06, i * 0.3, key, 'food', 5);
        F.cyl(x, 0.07, z, 0.018, 0.02, 0, tip, 'food');
      }
      KGEN.bowl(F, 0.11, 0, 0, 0.06, 0.05, F.col('stoneCream'), 'stone', F.col('fruitPandanPaste'));
    }
  }
});

/* ================= Northern Highlands (5 pieces) ================= */

FURN({
  key: 'generic_fruit_yew_lantern', name: 'Yew-lantern Arils', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber', 'stone'],
  biome: 'nhighlands', source: ['elderyew'],
  w: 0.29, d: 0.18, h: 0.12, variants: 2, variantNames: ['sprig', 'dish of arils'],
  variantDims: [{ w: 0.29, d: 0.15, h: 0.06 }, { w: 0.18, d: 0.18, h: 0.12 }],
  build: function (F) {
    const red = F.col('fruitAril'), seed = F.col('fruitArilSeed');
    const aril = (x, y, z) => { F.ball(x, y + 0.02, z, 0.02, red, 'food'); F.cyl(x, y + 0.03, z, 0.01, 0.02, 0, seed, 'food'); };
    if (F.variant === 0) {
      F.rod(-0.14, 0.012, 0, 0.14, 0.012, 0.02, 0.008, F.col('timberWalnut'), 'wood');
      for (let i = 0; i < 14; i++) { const x = -0.12 + i * 0.018, s = i % 2 ? 1 : -1; F.beam(x, 0.012, 0.01, x + 0.01, 0.012, 0.01 + s * 0.06, 0.02, 0.02, F.col('vegHerb'), 'food'); }
      for (const x of [-0.08, -0.02, 0.05, 0.1]) aril(x, 0.01, 0.0);
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.04, F.col('stoneCream'), 'stone');
      KGEN.heap(F, 0, 0.03, 0, 0.08, 0.02, [red], 'food', (x, y, z) => aril(x, y - 0.005, z));
    }
  }
});

FURN({
  key: 'generic_fruit_rowan', name: 'Frost Rowan', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber', 'glass', 'cloth'],
  biome: 'nhighlands', source: ['rowan'],
  w: 0.25, d: 0.19, h: 0.15, variants: 2, variantNames: ['berry cluster', 'rowan jelly'],
  variantDims: [{ w: 0.25, d: 0.19, h: 0.08 }, { w: 0.23, d: 0.14, h: 0.15 }],
  build: function (F) {
    const red = F.col('fruitRowan');
    if (F.variant === 0) {
      F.rod(-0.12, 0.015, 0, 0.0, 0.03, 0, 0.007, F.col('timberWalnut'), 'wood');
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i) * 0.016; F.ball(0.03 + Math.cos(a) * r, 0.025 + (0.08 - r) * 0.4, Math.sin(a) * r, 0.02, F.shade(red, (i % 3) * 0.06 - 0.06), 'food'); }
    } else {
      KGEN.clothJar(F, -0.04, 0, 0, 0.06, 0.12, F.col('glassClear'), F.col('fruitRowanJelly'), F.col('clothLinen'), F.col('clothMadder'));
      for (let i = 0; i < 6; i++) F.ball(0.07 + (i % 2) * 0.025, 0.02, -0.04 + Math.floor(i / 2) * 0.03, 0.02, red, 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_bilberry', name: 'Wall Bilberries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'bark', 'stone'],
  biome: 'nhighlands', source: ['heath and bilberry'],
  w: 0.2, d: 0.2, h: 0.13, variants: 2, variantNames: ['birch-bark punnet', 'with cream'],
  build: function (F) {
    const blue = F.col('fruitBilberry');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.18, 0.07, 0.18, 0, F.col('paperCream'), 'bark');
      F.box(0, 0.04, 0, 0.185, 0.015, 0.185, 0, F.col('timberDark'), 'bark');
      for (let i = 0; i < 16; i++) F.ball(-0.06 + (i % 4) * 0.04, 0.075 + (i % 3) * 0.008, -0.06 + Math.floor(i / 4) * 0.04, 0.02, F.shade(blue, (i % 3) * 0.05), 'food');
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.06, F.col('stoneCream'), 'stone', blue);
      KGEN.heap(F, 0, 0.045, 0, 0.085, 0.02, [blue, F.shade(blue, 0.1)], 'food');
      F.dome(0.02, 0.08, 0.02, 0.035, 0.025, 0, F.col('creamWhite'), 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_lantern_pod', name: 'Lantern Pods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'emissive', 'thatch', 'stone'],
  biome: 'nhighlands', source: ['lantern pod epiphyte'],
  w: 0.28, d: 0.28, h: 0.15, variants: 2, variantNames: ['basket of pods', 'sliced'],
  variantDims: [{ w: 0.28, d: 0.28, h: 0.15 }, { w: 0.24, d: 0.24, h: 0.06 }],
  build: function (F) {
    const pod = F.col('fruitLanternPod'), glow = F.col('fruitLanternPodGlow');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.11, 0.14, 0.07, 0, F.col('wickerDark'), 'thatch', 14);
      for (const [x, z] of [[-0.05, -0.03], [0.05, -0.02], [0, 0.05]]) {
        F.blob(x, 0.1, z, 0.045, 0.1, 0, pod, 'food');
        F.ball(x, 0.1, z + 0.035, 0.02, glow, 'glow');                         /* the light under the skin */
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneSlate'));
      for (let i = 0; i < 5; i++) { const a = i * 1.26; F.cyl(Math.cos(a) * 0.065, 0.02, Math.sin(a) * 0.065, 0.035, 0.02, 0, pod, 'food'); F.cyl(Math.cos(a) * 0.065, 0.035, Math.sin(a) * 0.065, 0.025, 0.02, 0, glow, 'glow'); }
    }
  }
});

FURN({
  key: 'generic_fruit_mast', name: 'Beechmast and Acorns', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'nhighlands', source: ['bluebeech', 'gnarloak', 'ebadlands:oak'],
  w: 0.22, d: 0.22, h: 0.14, variants: 2, variantNames: ['beechmast in husks', 'acorns'],
  build: function (F) {
    KGEN.bowl(F, 0, 0, 0, 0.11, 0.05, F.col('timberOak'), 'wood');
    if (F.variant === 0) KGEN.heap(F, 0, 0.035, 0, 0.1, 0.025, F.cols(['fruitMast', 'fruitMastHusk']), 'food',
      (x, y, z, c) => F.frustum(x, y, z, 0.022, 0.012, 0.04, x * 20, c, 'food', 3));
    else KGEN.heap(F, 0, 0.035, 0, 0.1, 0.022, [F.col('fruitAcorn')], 'food', (x, y, z, c) => {
      F.blob(x, y + 0.025, z, 0.02, 0.05, 0, c, 'food'); F.dome(x, y + 0.035, z, 0.022, 0.018, 0, F.col('fruitMastHusk'), 'food');
    });
  }
});

/* ================= North-western Lowlands (1 piece; pandan keys above) ================= */

FURN({
  key: 'generic_fruit_candle_nectar', name: 'Candle Nectar', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'drink', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'glass'],
  biome: 'nwlowlands', source: ['banksia'],
  w: 0.26, d: 0.15, h: 0.23, variants: 2, variantNames: ['flower candles', 'steeping jug'],
  variantDims: [{ w: 0.24, d: 0.14, h: 0.16 }, { w: 0.26, d: 0.15, h: 0.23 }],
  build: function (F) {
    const cone = F.col('fruitBanksia');
    const candle = (x, y, z, h) => {
      F.cyl(x, y, z, 0.03, h, 0, cone, 'food');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { const a = i * 1.05 + j * 0.5; F.ball(x + Math.cos(a) * 0.03, y + 0.02 + j * h / 4.5, z + Math.sin(a) * 0.03, 0.02, F.shade(cone, (i + j) % 2 ? 0.1 : -0.08), 'food'); }
    };
    if (F.variant === 0) {
      /* lying candles: drawn standing short, since a vertical cylinder cannot lie down */
      candle(-0.07, 0, 0, 0.16); candle(0.06, 0, 0.02, 0.13);
    } else {
      const glass = F.col('glassClear');
      F.cyl(-0.05, 0.005, 0, 0.065, 0.16, 0, F.col('drinkNectar'), 'food');
      F.frustum(-0.05, 0, 0, 0.075, 0.07, 0.2, 0, glass, 'glass', 14);
      candle(-0.05, 0.07, 0, 0.16);
      KGEN.mug(F, 0.08, 0, 0.03, 0.03, 0.08, glass, 'glass', F.col('drinkNectar'));
    }
  }
});

/* ================= Rift (4 pieces; lantern fruit is shared with Xanadu) ================= */

FURN({
  key: 'generic_fruit_ballmelon', name: 'Ballmelon', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'timber'],
  biome: 'rift', source: ['ball vine'],
  w: 0.28, d: 0.28, h: 0.26, variants: 2, variantNames: ['whole', 'slices'],
  variantDims: [{ w: 0.27, d: 0.25, h: 0.26 }, { w: 0.28, d: 0.28, h: 0.06 }],
  build: function (F) {
    const rind = F.col('fruitBallmelon'), flesh = F.col('fruitBallmelonFlesh');
    if (F.variant === 0) {
      F.ball(0, 0.125, 0, 0.125, rind, 'food');
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.blob(Math.cos(a) * 0.105, 0.125, Math.sin(a) * 0.105, 0.03, 0.22, 0, F.shade(rind, -0.18), 'food'); }
      F.cyl(0, 0.24, 0, 0.012, 0.02, 0, F.col('timberWalnut'), 'wood');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.14, F.col('stoneCream'));
      for (let i = 0; i < 5; i++) { const a = i * 1.26; KFRUIT.wedge(F, Math.cos(a) * 0.065, 0.02, Math.sin(a) * 0.065, 0.05, 0.04, a, flesh, rind); }
    }
  }
});

FURN({
  key: 'generic_fruit_frillpod', name: 'Frillpods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'rope', 'stone'],
  biome: 'rift', source: ['carrotfrill'],
  w: 0.25, d: 0.18, h: 0.09, variants: 2, variantNames: ['tied bunch', 'coins in a bowl'],
  variantDims: [{ w: 0.25, d: 0.12, h: 0.09 }, { w: 0.18, d: 0.18, h: 0.08 }],
  build: function (F) {
    const pink = F.col('fruitFrillPink'), core = F.col('fruitFrillCore');
    if (F.variant === 0) {
      for (const [z, y] of [[-0.035, 0], [0.035, 0], [0, 0.04]]) KGEN.capsule(F, -0.1, 0.1, y, z, 0.022, F.shade(pink, z * 3));
      F.box(-0.07, 0, 0, 0.015, 0.09, 0.12, 0, F.col('vegHerb'), 'rope');
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.05, F.col('stoneGlazeGreen'), 'stone', pink);
      for (let i = 0; i < 8; i++) { const a = i * 2.4, r = i ? 0.02 + (i % 3) * 0.02 : 0; F.cyl(Math.cos(a) * r, 0.045 + (i % 2) * 0.005, Math.sin(a) * r, 0.022, 0.02, 0, pink, 'food'); F.cyl(Math.cos(a) * r, 0.05 + (i % 2) * 0.005, Math.sin(a) * r, 0.012, 0.02, 0, core, 'food'); }
    }
  }
});

FURN({
  key: 'generic_fruit_lantern_fruit', name: 'Lantern Fruit', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'timber'],
  biome: 'rift', source: ['lanterntree', 'xanadu:lanterntree'],
  w: 0.26, d: 0.26, h: 0.18, variants: 2, variantNames: ['bowl of husks', 'husks peeled back'],
  variantDims: [{ w: 0.26, d: 0.26, h: 0.18 }, { w: 0.26, d: 0.26, h: 0.07 }],
  build: function (F) {
    const husks = ['fruitLanternPink', 'fruitLanternGold', 'fruitLanternOrange', 'fruitLanternBlue', 'fruitLanternViolet', 'fruitLanternTeal'];
    if (F.variant === 0) {
      KGEN.bowl(F, 0, 0, 0, 0.13, 0.06, F.col('timberWalnut'), 'wood');
      KGEN.heap(F, 0, 0.045, 0, 0.12, 0.033, F.cols(husks), 'food', (x, y, z, c) => {
        F.dome(x, y, z, 0.033, 0.035, 0, c, 'food'); F.cone(x, y + 0.03, z, 0.026, 0.035, 0, F.shade(c, 0.1), 'food');
      });
    } else {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneCream'));
      for (let i = 0; i < 4; i++) {
        const a = i * F.TAU / 4 + 0.4, x = Math.cos(a) * 0.065, z = Math.sin(a) * 0.065, c = F.col(husks[i]);
        for (let k = 0; k < 4; k++) { const b = k * F.TAU / 4; F.beam(x, 0.022, z, x + Math.cos(b) * 0.045, 0.022, z + Math.sin(b) * 0.045, 0.02, 0.025, c, 'food'); }
        F.ball(x, 0.042, z, 0.02, F.shade(c, -0.3), 'food');
      }
    }
  }
});

FURN({
  key: 'generic_fruit_bell_date', name: 'Bell Dates', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber', 'stone'],
  biome: 'rift', source: ['bellpalm', 'cloudbell'],
  w: 0.35, d: 0.2, h: 0.11, variants: 2, variantNames: ['strand', 'pitted on a plate'],
  variantDims: [{ w: 0.35, d: 0.11, h: 0.04 }, { w: 0.2, d: 0.2, h: 0.11 }],
  build: function (F) {
    const date = F.col('fruitBellDate');
    if (F.variant === 0) {
      F.rod(-0.17, 0.012, 0, 0.17, 0.012, 0, 0.008, F.col('timberBirch'), 'wood');
      for (let i = 0; i < 9; i++) for (const s of [-1, 1]) F.blob(-0.15 + i * 0.037, 0.02, s * 0.03, 0.022, 0.035, 0, F.shade(date, F.rr(-0.1, 0.1)), 'food');
    } else {
      KGEN.plate(F, 0, 0, 0, 0.1, F.col('stoneBuff'));
      KGEN.heap(F, 0, 0.02, 0, 0.09, 0.022, [date, F.shade(date, -0.12)], 'food', (x, y, z, c) => F.blob(x, y + 0.018, z, 0.022, 0.035, 0, c, 'food'));
    }
  }
});

/* ================= South-eastern Desert (3 pieces) ================= */

FURN({
  key: 'generic_fruit_mesquite', name: 'Mesquite Pods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'rope', 'stone', 'timber'],
  biome: 'sedesert', source: ['mesquite'],
  w: 0.35, d: 0.22, h: 0.09, variants: 2, variantNames: ['bundle of pods', 'mesquite cakes'],
  variantDims: [{ w: 0.33, d: 0.13, h: 0.05 }, { w: 0.35, d: 0.22, h: 0.09 }],
  build: function (F) {
    const pod = F.col('fruitMesquite');
    if (F.variant === 0) {
      for (let i = 0; i < 9; i++) {
        const z = -0.04 + (i % 5) * 0.02, y = i < 5 ? 0 : 0.02;
        const pts = [[-0.16, z], [-0.05, z + 0.012], [0.05, z - 0.008], [0.16, z + 0.01]];
        for (let k = 0; k < 3; k++) F.beam(pts[k][0], y + 0.01, pts[k][1], pts[k + 1][0], y + 0.01, pts[k + 1][1], 0.02, 0.022, F.shade(pod, (i % 3) * 0.05 - 0.05), 'food');
      }
      F.box(0, 0, 0, 0.02, 0.05, 0.13, 0, F.col('wickerTan'), 'rope');
    } else {
      KGEN.plate(F, -0.04, 0, 0, 0.11, F.col('stoneClay'));
      for (let i = 0; i < 4; i++) F.cyl(-0.04 + (i % 2) * 0.01, 0.02 + i * 0.016, 0, 0.07, 0.016, 0, F.shade('fruitMesquiteCake', i * 0.03), 'food');
      KGEN.bowl(F, 0.12, 0, 0, 0.055, 0.04, F.col('timberOak'), 'wood', F.col('fruitMesquite'));
    }
  }
});

FURN({
  key: 'generic_fruit_wadi_date', name: 'Wadi Dates', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'thatch'],
  biome: 'sedesert', source: ['palm'],
  w: 0.31, d: 0.31, h: 0.13, variants: 2, variantNames: ['bunch on the strand', 'basket of dates'],
  variantDims: [{ w: 0.31, d: 0.31, h: 0.05 }, { w: 0.24, d: 0.24, h: 0.13 }],
  build: function (F) {
    const date = F.col('fruitDate'), strand = F.col('fruitDateStrand');
    if (F.variant === 0) {
      for (let k = 0; k < 6; k++) {
        const a = -0.5 + k * 0.2, ex = Math.cos(a) * 0.3 - 0.15, ez = Math.sin(a) * 0.3;
        F.rod(-0.15, 0.012, 0, ex, 0.012, ez, 0.005, strand, 'food');
        for (let j = 1; j <= 4; j++) { const t = 0.3 + j * 0.16; F.blob(-0.15 + (ex + 0.15) * t, 0.022, ez * t, 0.02, 0.04, 0, F.shade(date, F.rr(-0.1, 0.1)), 'food'); }
      }
    } else {
      F.frustum(0, 0, 0, 0.1, 0.12, 0.06, 0, F.col('wickerStraw'), 'thatch', 14);
      KGEN.heap(F, 0, 0.045, 0, 0.11, 0.022, [date, F.shade(date, -0.15)], 'food', (x, y, z, c) => F.blob(x, y + 0.018, z, 0.022, 0.04, 0, c, 'food'));
    }
  }
});

FURN({
  key: 'generic_fruit_tuna', name: 'Desert Tunas', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'cloth', 'stone'],
  biome: 'sedesert', source: ['prickly pear', 'xanadu:opuntia', 'ebadlands:prickly pear'],
  w: 0.32, d: 0.24, h: 0.09, variants: 2, variantNames: ['on a cloth', 'peeled and sliced'],
  variantDims: [{ w: 0.32, d: 0.24, h: 0.09 }, { w: 0.24, d: 0.24, h: 0.06 }],
  build: function (F) {
    const skin = F.col('fruitTuna'), flesh = F.col('fruitTunaFlesh');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.3, 0.02, 0.22, 0.05, F.col('clothLinen'), 'cloth');
      for (const [x, z] of [[-0.08, -0.04], [0.02, -0.05], [0.09, 0.04], [-0.03, 0.05]]) {
        F.blob(x, 0.055, z, 0.035, 0.07, 0, F.shade(skin, F.rr(-0.1, 0.06)), 'food');
        for (let i = 0; i < 5; i++) { const a = i * 1.26; F.ball(x + Math.cos(a) * 0.032, 0.05 + (i % 2) * 0.02, z + Math.sin(a) * 0.032, 0.02, F.shade(skin, 0.25), 'food'); }
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneCream'));
      for (let i = 0; i < 6; i++) { const a = i * 1.05; F.cyl(Math.cos(a) * 0.065, 0.02, Math.sin(a) * 0.065, 0.032, 0.02, 0, flesh, 'food'); }
      F.cyl(0, 0.02, 0, 0.032, 0.035, 0, flesh, 'food');
    }
  }
});

/* ================= South-west Bay (1 piece; gatepod above) ================= */

FURN({
  key: 'generic_fruit_bay_fungi', name: 'Bay Fungi', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'metal', 'stone'],
  biome: 'swbay', source: ['coral', 'parasol'],
  w: 0.35, d: 0.3, h: 0.15, variants: 2, variantNames: ['coral clump', 'grilled parasol caps'],
  variantDims: [{ w: 0.29, d: 0.3, h: 0.15 }, { w: 0.35, d: 0.26, h: 0.06 }],
  build: function (F) {
    if (F.variant === 1) F.shift(-0.045, 0);
    if (F.variant === 0) {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneSlate'));
      const cs = ['fungusCoralOrange', 'fungusCoralPink', 'fungusCoralViolet'];
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, r = 0.02 + (i % 3) * 0.03, x = Math.cos(a) * r, z = Math.sin(a) * r, c = F.col(cs[i % 3]);
        F.rod(x, 0.02, z, x * 1.6, 0.1 + (i % 2) * 0.03, z * 1.6, 0.012, c, 'food');
        F.ball(x * 1.6, 0.1 + (i % 2) * 0.03, z * 1.6, 0.02, F.shade(c, 0.3), 'food');
      }
    } else {
      const iron = F.col('iron');
      F.cyl(0, 0, 0, 0.13, 0.03, 0, iron, 'metal');
      F.box(0.17, 0.015, 0, 0.1, 0.02, 0.03, 0, iron, 'metal');
      for (const [x, z] of [[-0.05, -0.03], [0.05, -0.02], [0, 0.06]]) {
        F.cone(x, 0.03, z, 0.055, 0.025, 0, F.col('fungusParasol'), 'food');
        F.cyl(x, 0.03, z, 0.05, 0.02, 0, F.shade('fungusParasol', -0.35), 'food');
      }
    }
  }
});

/* ================= South-western Lowlands (4 pieces) ================= */

FURN({
  key: 'generic_fruit_madrone', name: 'Madrone Berries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'timber'],
  biome: 'swlowlands', source: ['madrone', 'manzanita', 'toyon shrub'],
  w: 0.25, d: 0.2, h: 0.27, variants: 2, variantNames: ['bowl of berries', 'manzanita cider'],
  variantDims: [{ w: 0.2, d: 0.2, h: 0.12 }, { w: 0.25, d: 0.1, h: 0.27 }],
  build: function (F) {
    const red = F.col('fruitMadrone');
    if (F.variant === 0) {
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.05, F.col('stoneBuff'), 'stone', red);
      KGEN.heap(F, 0, 0.035, 0, 0.09, 0.02, [red, F.shade(red, 0.12), F.col('fruitArbutusOrange')], 'food');
    } else {
      KGEN.bottle(F, -0.06, 0, 0, 0.05, 0.26, F.col('stoneBuff'), F.col('timberBirch'), null, 'stone');
      KGEN.mug(F, 0.07, 0, 0, 0.035, 0.08, F.col('timberOak'), 'wood', F.col('drinkCider'));
    }
  }
});

FURN({
  key: 'generic_fruit_rattlepod', name: 'Rattlepods', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'timber'],
  biome: 'swlowlands', source: ['rattlepod'],
  w: 0.28, d: 0.24, h: 0.12, variants: 2, variantNames: ['pod cluster', 'rattle coffee'],
  variantDims: [{ w: 0.28, d: 0.24, h: 0.04 }, { w: 0.26, d: 0.16, h: 0.12 }],
  build: function (F) {
    const pod = F.col('fruitRattlepod'), bean = F.col('fruitRattleBean');
    if (F.variant === 0) {
      /* flat pods, each a chain of lenses, a seed bulge in every one */
      for (let i = 0; i < 4; i++) {
        const z = -0.06 + i * 0.04, y = (i % 2) * 0.012, c = F.shade(pod, (i % 3) * 0.06 - 0.06);
        for (let k = 0; k < 6; k++) F.blob(-0.11 + k * 0.044, y + 0.014, z + (i % 2 ? 0.006 : -0.006) * k, 0.028, 0.026, 0, k % 2 ? c : F.shade(c, 0.08), 'food');
      }
    } else {
      KGEN.bowl(F, -0.05, 0, 0, 0.08, 0.04, F.col('timberOak'), 'wood', bean);
      KGEN.heap(F, -0.05, 0.03, 0, 0.07, 0.02, [bean, F.shade(bean, 0.1)], 'food');
      F.cyl(0.08, 0, 0.02, 0.045, 0.02, 0, F.col('stoneCream'), 'stone');
      KGEN.mug(F, 0.08, 0.02, 0.02, 0.03, 0.05, F.col('stoneCream'), 'stone', F.col('drinkTea'));
    }
  }
});

FURN({
  key: 'generic_fruit_ember_tamarind', name: 'Ember Tamarind', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'swlowlands', source: ['flame'],
  w: 0.34, d: 0.2, h: 0.07, variants: 2, variantNames: ['pods', 'cracked, with pulp cake'],
  variantDims: [{ w: 0.31, d: 0.17, h: 0.05 }, { w: 0.34, d: 0.2, h: 0.07 }],
  build: function (F) {
    const shell = F.col('fruitTamarindShell'), pulp = F.col('fruitTamarindPulp');
    const pod = (x, z, n, col) => { for (let i = 0; i < n; i++) F.ball(x - 0.12 + i * 0.045, 0.022 + (i % 2) * 0.004, z + Math.sin(i * 1.3) * 0.01, i === 0 || i === n - 1 ? 0.02 : 0.024, col, 'food'); };
    if (F.variant === 0) { pod(0.02, -0.05, 6, shell); pod(0.0, 0.0, 5, F.shade(shell, 0.1)); pod(0.03, 0.05, 6, F.shade(shell, -0.1)); }
    else {
      F.box(0, 0, 0, 0.34, 0.02, 0.2, 0, F.col('timberPine'), 'wood');
      for (let i = 0; i < 5; i++) F.ball(-0.12 + i * 0.045, 0.042, -0.05, 0.022, i % 2 ? pulp : shell, 'food');
      F.box(0.08, 0.02, 0.03, 0.12, 0.04, 0.08, 0.2, pulp, 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_pillar_fig', name: 'Pillar Figs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'swlowlands', source: ['pillarfig'],
  w: 0.26, d: 0.26, h: 0.1, variants: 2, variantNames: ['plate of figs', 'halved'],
  variantDims: [{ w: 0.26, d: 0.26, h: 0.1 }, { w: 0.26, d: 0.26, h: 0.05 }],
  build: function (F) {
    const fig = F.col('fruitFig'), flesh = F.col('fruitFigFlesh');
    KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneGlazeOchre'));
    for (let i = 0; i < 5; i++) {
      const a = i * 1.26 + 0.3, r = i === 4 ? 0 : 0.07, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (F.variant === 0) { F.blob(x, 0.055, z, 0.035, 0.07, 0, F.shade(fig, F.rr(-0.1, 0.1)), 'food'); F.cone(x, 0.08, z, 0.015, 0.02, 0, F.shade(fig, -0.2), 'food'); }
      else KFRUIT.half(F, x, 0.02, z, 0.035, fig, flesh);
    }
  }
});

/* ================= Xanadu (7 pieces; tunas and lantern fruit are shared) ================= */

FURN({
  key: 'generic_fruit_cacao', name: 'Cacao', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'timber'],
  biome: 'xanadu', source: ['cacao'],
  w: 0.33, d: 0.21, h: 0.12, variants: 2, variantNames: ['two pods', 'split pod and a cup'],
  variantDims: [{ w: 0.29, d: 0.21, h: 0.1 }, { w: 0.33, d: 0.13, h: 0.12 }],
  build: function (F) {
    const pod = F.pick(['fruitCacaoRed', 'fruitCacaoGold', 'fruitCacaoOrange']);
    if (F.variant === 0) {
      KFRUIT.ridged(F, -0.1, 0.06, 0, -0.04, 0.045, pod, 8);
      KFRUIT.ridged(F, -0.04, 0.1, 0, 0.055, 0.04, F.pick(['fruitCacaoRed', 'fruitCacaoGold', 'fruitCacaoOrange']), 8);
    } else {
      KGEN.capsule(F, -0.12, 0.02, 0, 0, 0.045, pod);
      F.blob(-0.05, 0.09, 0, 0.065, 0.04, 0, F.col('fruitCacaoPulp'), 'food');
      for (let i = 0; i < 5; i++) F.ball(-0.1 + i * 0.025, 0.1, (i % 2 ? 0.015 : -0.015), 0.02, F.col('fruitCacaoPulp'), 'food');
      F.cyl(0.1, 0, 0, 0.045, 0.02, 0, F.col('stoneCream'), 'stone');
      KGEN.mug(F, 0.1, 0.02, 0, 0.032, 0.06, F.col('stoneGlazeOchre'), 'stone', F.col('drinkCacao'));
    }
  }
});

FURN({
  key: 'generic_fruit_pitaya', name: 'Pitaya', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'xanadu', source: ['pitaya', 'ebadlands:moonflower cactus'],
  w: 0.26, d: 0.26, h: 0.14, variants: 2, variantNames: ['whole', 'halved'],
  variantDims: [{ w: 0.16, d: 0.16, h: 0.14 }, { w: 0.26, d: 0.26, h: 0.07 }],
  build: function (F) {
    const skin = F.col('fruitPitaya'), flame = F.col('fruitPitayaFlame'), flesh = F.col('fruitPitayaFlesh');
    if (F.variant === 0) {
      F.blob(0, 0.07, 0, 0.065, 0.14, 0, skin, 'food');
      for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) {
        const a = i * 1.26 + j * 0.6, y = 0.03 + j * 0.035, r = 0.062 - Math.abs(y - 0.07) * 0.4;
        F.cone(Math.cos(a) * r, y, Math.sin(a) * r, 0.018, 0.04, 0, j === 2 ? flame : F.shade(skin, 0.1), 'food');
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneCream'));
      for (const [x, z] of [[-0.05, -0.02], [0.05, 0.02]]) {
        KFRUIT.half(F, x, 0.02, z, 0.06, skin, flesh);
        for (let i = 0; i < 6; i++) { const a = i * 2.4, r = 0.01 + (i % 3) * 0.015; F.cyl(x + Math.cos(a) * r, 0.04, z + Math.sin(a) * r, 0.01, 0.02, 0, F.col('inkBlack'), 'food'); }
      }
    }
  }
});

FURN({
  key: 'generic_fruit_plantain', name: 'Violet Plantains', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'xanadu', source: ['violetplantain'],
  w: 0.32, d: 0.24, h: 0.08, variants: 2, variantNames: ['hand with its bract', 'fried slices'],
  variantDims: [{ w: 0.32, d: 0.16, h: 0.08 }, { w: 0.24, d: 0.24, h: 0.05 }],
  build: function (F) {
    const yel = F.col('fruitPlantain');
    if (F.variant === 0) {
      F.blob(-0.12, 0.03, 0, 0.04, 0.06, 0, F.col('fruitPlantainBract'), 'food');
      for (let i = 0; i < 5; i++) {
        const z = -0.06 + i * 0.03, y = (i % 2) * 0.01, bow = 0.02;
        F.rod(-0.11, y + 0.025, 0, -0.02, y + 0.025, z * 0.7, 0.02, F.shade(yel, i * 0.02), 'food');
        F.rod(-0.02, y + 0.025, z * 0.7, 0.13, y + 0.025 + bow, z, 0.02, F.shade(yel, i * 0.02), 'food');
        F.ball(0.13, y + 0.025 + bow, z, 0.02, F.col('timberDark'), 'food');
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.12, F.col('stoneGlazeBlue'));
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = i ? 0.03 + (i % 2) * 0.04 : 0; F.cyl(Math.cos(a) * r, 0.02 + (i % 3) * 0.004, Math.sin(a) * r, 0.028, 0.02, i, F.col('fruitPlantainFried'), 'food'); }
    }
  }
});

FURN({
  key: 'generic_fruit_wingnut', name: 'Wingnut Chains', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'xanadu', source: ['wingnut'],
  w: 0.38, d: 0.18, h: 0.13, variants: 2, variantNames: ['catkin chains', 'roasted nuts'],
  variantDims: [{ w: 0.38, d: 0.18, h: 0.04 }, { w: 0.18, d: 0.18, h: 0.13 }],
  build: function (F) {
    const green = F.col('fruitWingnut');
    if (F.variant === 0) {
      for (const z of [-0.05, 0.05]) {
        F.rod(-0.19, 0.01, z, 0.19, 0.01, z, 0.005, F.shade(green, -0.3), 'food');
        for (let i = 0; i < 11; i++) {
          const x = -0.17 + i * 0.034;
          F.ball(x, 0.02, z, 0.02, F.shade(green, -0.1), 'food');
          F.box(x, 0.012, z, 0.02, 0.02, 0.07, 0.3, F.shade(green, 0.1), 'food');
        }
      }
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.05, F.col('timberWalnut'), 'wood', F.col('nutBrown'));
      KGEN.heap(F, 0, 0.04, 0, 0.08, 0.02, [F.col('fruitMahoganySeed'), F.col('nutBrown')], 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_arbutus', name: 'Strawberry-tree Berries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'glass', 'cloth'],
  biome: 'xanadu', source: ['arbutus'],
  w: 0.22, d: 0.21, h: 0.15, variants: 2, variantNames: ['bowl of berries', 'arbutus jam'],
  variantDims: [{ w: 0.22, d: 0.21, h: 0.15 }, { w: 0.21, d: 0.13, h: 0.14 }],
  build: function (F) {
    const cols = F.cols(['fruitArbutusRed', 'fruitArbutusOrange', 'fruitAril']);
    if (F.variant === 0) {
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.05, F.col('stoneCream'), 'stone');
      KGEN.heap(F, 0, 0.035, 0, 0.09, 0.024, cols, 'food', (x, y, z, c) => KFRUIT.studded(F, x, y, z, 0.024, c, F.shade(c, 0.15), 8));
    } else {
      KGEN.clothJar(F, -0.04, 0, 0, 0.055, 0.11, F.col('glassClear'), F.col('fruitArbutusRed'), F.col('clothOchre'), F.col('wickerTan'));
      for (let i = 0; i < 3; i++) F.ball(0.07, 0.024, -0.04 + i * 0.04, 0.024, cols[i], 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_whorl_olive', name: 'Whorl Olives', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'glass', 'metal', 'timber'],
  biome: 'xanadu', source: ['whorlolive'],
  w: 0.28, d: 0.16, h: 0.21, variants: 2, variantNames: ['dish of olives', 'with pressed oil'],
  variantDims: [{ w: 0.16, d: 0.16, h: 0.12 }, { w: 0.28, d: 0.16, h: 0.21 }],
  build: function (F) {
    const ol = F.col('fruitWhorlOlive'), cr = F.col('fruitWhorlCream');
    /* the bole's cream-and-umber twist shows in the fruit: a pale band round each */
    const olive = (x, y, z) => { F.blob(x, y + 0.02, z, 0.02, 0.04, 0, ol, 'food'); F.cyl(x, y + 0.015, z, 0.021, 0.02, x * 30, cr, 'food'); };
    KGEN.bowl(F, F.variant ? 0.06 : 0, 0, 0, 0.08, 0.04, F.col('stoneGlazeGreen'), 'stone', ol);
    KGEN.heap(F, F.variant ? 0.06 : 0, 0.03, 0, 0.07, 0.02, [ol], 'food', (x, y, z) => olive(x, y, z));
    if (F.variant) KGEN.bottle(F, -0.08, 0, 0, 0.04, 0.2, F.col('glassClear'), F.col('pewter'), F.col('drinkOil'));
  }
});

FURN({
  key: 'generic_fruit_lotus_seed', name: 'Lotus Seeds', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'xanadu', source: ['lotus'],
  w: 0.23, d: 0.18, h: 0.13, variants: 2, variantNames: ['seed head', 'shelled seeds'],
  variantDims: [{ w: 0.23, d: 0.16, h: 0.11 }, { w: 0.18, d: 0.18, h: 0.13 }],
  build: function (F) {
    if (F.variant === 0) F.shift(-0.031, 0);
    const pod = F.col('fruitLotusPod'), seed = F.col('fruitLotusSeed');
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.03, 0.08, 0.09, 0, pod, 'food', 16);
      F.cyl(0, 0.08, 0, 0.075, 0.02, 0, F.shade(pod, 0.1), 'food');
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = i ? 0.02 + (i % 2) * 0.03 : 0; F.cyl(Math.cos(a) * r, 0.09, Math.sin(a) * r, 0.012, 0.02, 0, F.shade(pod, -0.35), 'food'); }
      F.rod(0.02, 0.012, 0, 0.14, 0.012, 0.04, 0.01, F.shade(pod, -0.15), 'food');
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.05, F.col('stoneCream'), 'stone', seed);
      KGEN.heap(F, 0, 0.04, 0, 0.08, 0.02, [seed, F.shade(seed, -0.08)], 'food');
    }
  }
});

/* ================= Eastern Badlands (6 pieces; tunas, acorns and pitaya are shared) ================= */

FURN({
  key: 'generic_fruit_pinyon', name: 'Pinyon Nuts', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'cloth', 'timber'],
  biome: 'ebadlands', source: ['pinyon'],
  w: 0.3, d: 0.22, h: 0.09, variants: 2, variantNames: ['cones on a cloth', 'roasted nuts'],
  variantDims: [{ w: 0.3, d: 0.22, h: 0.09 }, { w: 0.22, d: 0.22, h: 0.08 }],
  build: function (F) {
    const cone = F.col('fruitPinyonCone'), nut = F.col('fruitPinyonNut');
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.28, 0.02, 0.2, 0.08, F.col('clothLinen'), 'cloth');
      for (const [x, z] of [[-0.07, -0.03], [0.04, 0.04], [0.08, -0.05]]) {
        F.ball(x, 0.045, z, 0.028, F.shade(cone, -0.15), 'food');
        for (let i = 0; i < 8; i++) { const a = i * 0.785, y = 0.03 + (i % 2) * 0.03; F.frustum(x + Math.cos(a) * 0.03, y, z + Math.sin(a) * 0.03, 0.006, 0.02, 0.012, a, F.shade(cone, (i % 3) * 0.05), 'food', 4); }
      }
      for (let i = 0; i < 7; i++) F.blob(-0.1 + i * 0.035, 0.03, 0.07 - (i % 2) * 0.02, 0.008, 0.016, i, nut, 'food');
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.045, F.col('timberOak'), 'wood');
      KGEN.heap(F, 0, 0.03, 0, 0.085, 0.012, [nut, F.shade(nut, 0.12), F.col('fruitPinyonKernel')], 'food',
        (x, y, z, c) => F.blob(x, y + 0.012, z, 0.009, 0.018, x * 30, c, 'food'));
    }
  }
});

FURN({
  key: 'generic_fruit_juniper', name: 'Juniper Berries', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'glass', 'metal'],
  biome: 'ebadlands', source: ['juniper'],
  w: 0.26, d: 0.16, h: 0.12, variants: 2, variantNames: ['a sprig with berries', 'dried in a jar'],
  variantDims: [{ w: 0.26, d: 0.16, h: 0.04 }, { w: 0.12, d: 0.12, h: 0.12 }],
  build: function (F) {
    const berry = F.col('fruitJuniper'), twig = F.col('fruitJuniperTwig');
    if (F.variant === 0) {
      F.rod(-0.12, 0.012, 0, 0.12, 0.012, 0.01, 0.006, F.shade(twig, -0.2), 'food');
      for (let i = 0; i < 9; i++) {
        const x = -0.1 + i * 0.025, sd = i % 2 ? 1 : -1;
        F.rod(x, 0.012, 0, x + 0.02, 0.014, sd * 0.06, 0.008, F.shade(twig, (i % 3) * 0.04), 'food');
        if (i % 2 === 0) F.ball(x + 0.01, 0.022, sd * 0.03, 0.011, F.shade(berry, (i % 4) * 0.04), 'food');
      }
    } else KGEN.jar(F, 0, 0, 0, 0.05, 0.09, F.col('glassClear'), F.col('iron'), 'glass', F.col('fruitJuniperDry'));
  }
});

FURN({
  key: 'generic_fruit_yucca', name: 'Roasted Yucca Stalk', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone', 'thatch'],
  biome: 'ebadlands', source: ['yucca', 'crater-drylands:yucca', 'crater-drylands:joshua'],
  w: 0.26, d: 0.26, h: 0.1, variants: 2, variantNames: ['pit-roasted stalk rounds', 'a basket of blossoms'],
  variantDims: [{ w: 0.26, d: 0.26, h: 0.06 }, { w: 0.22, d: 0.22, h: 0.1 }],
  build: function (F) {
    if (F.variant === 0) {
      KGEN.plate(F, 0, 0, 0, 0.13, F.col('stoneClay'));
      for (let i = 0; i < 6; i++) {
        const a = i * 1.05, x = Math.cos(a) * 0.07, z = Math.sin(a) * 0.07;
        F.cyl(x, 0.02, z, 0.032, 0.028, 0, F.col('fruitYuccaStalk'), 'food');
        F.cyl(x, 0.047, z, 0.034, 0.004, 0, F.col('fruitYuccaRoast'), 'food');
      }
    } else {
      F.frustum(0, 0, 0, 0.08, 0.11, 0.06, 0, F.col('wickerStraw'), 'thatch', 14);
      KGEN.heap(F, 0, 0.045, 0, 0.1, 0.018, [F.col('fruitYuccaBloom'), F.shade('fruitYuccaBloom', -0.08)], 'food',
        (x, y, z, c) => F.dome(x, y + 0.01, z, 0.02, 0.022, x * 20, c, 'food'));
    }
  }
});

FURN({
  key: 'generic_fruit_canyon_grape', name: 'Canyon Grapes', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'timber'],
  biome: 'ebadlands', source: ['canyon grape (floor and dressing; on cottonwood and maple)'],
  w: 0.24, d: 0.22, h: 0.1, variants: 2, variantNames: ['a cluster on its leaf', 'raisins in a bowl'],
  variantDims: [{ w: 0.24, d: 0.2, h: 0.06 }, { w: 0.22, d: 0.22, h: 0.08 }],
  build: function (F) {
    const grape = F.col('fruitGrape');
    if (F.variant === 0) {
      KFRUIT.leaf(F, 0, 0, 0.11, F.col('fruitGrapeLeaf'));
      for (let i = 0; i < 14; i++) { const t = i / 14, a = i * 2.39996, r = 0.045 * (1 - t) + 0.008; F.ball(-0.06 + t * 0.14 + Math.cos(a) * r * 0.3, 0.025 + (i % 3) * 0.008, Math.sin(a) * r, 0.015, F.shade(grape, (i % 4) * 0.05), 'food'); }
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.045, F.col('timberOak'), 'wood');
      KGEN.heap(F, 0, 0.03, 0, 0.085, 0.01, [F.col('fruitRaisin'), F.shade('fruitRaisin', 0.1)], 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_stiltpod', name: 'Stilt Pod', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'ebadlands', source: ['stiltpod'],
  w: 0.28, d: 0.28, h: 0.2, variants: 2, variantNames: ['whole', 'halved'],
  variantDims: [{ w: 0.18, d: 0.18, h: 0.2 }, { w: 0.28, d: 0.28, h: 0.08 }],
  build: function (F) {
    const skin = F.col('fruitStiltPod');
    if (F.variant === 0) {
      F.blob(0, 0.1, 0, 0.085, 0.2, 0, skin, 'food');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) {
        const a = i * 0.9 + j * 0.45, y = 0.04 + j * 0.04, r = 0.082 - Math.abs(y - 0.1) * 0.45;
        F.ball(Math.cos(a) * r, y, Math.sin(a) * r, 0.016, F.shade(skin, j % 2 ? -0.1 : 0.08), 'food');
      }
    } else {
      KGEN.plate(F, 0, 0, 0, 0.14, F.col('stoneCream'));
      for (const [x, z] of [[-0.055, 0], [0.055, 0.01]]) {
        KFRUIT.half(F, x, 0.02, z, 0.065, skin, F.col('fruitStiltFlesh'));
        for (let i = 0; i < 5; i++) { const a = i * 1.26; F.ball(x + Math.cos(a) * 0.022, 0.06, z + Math.sin(a) * 0.022, 0.008, F.col('fruitStiltSeed'), 'food'); }
      }
    }
  }
});

FURN({
  key: 'generic_fruit_umbel_seed', name: 'Umbel Seed', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'ebadlands', source: ['umbel'],
  w: 0.34, d: 0.22, h: 0.07, variants: 2, variantNames: ['a dried head', 'seed in a bowl'],
  variantDims: [{ w: 0.34, d: 0.22, h: 0.04 }, { w: 0.18, d: 0.18, h: 0.07 }],
  build: function (F) {
    const seed = F.col('fruitUmbelSeed'), stalk = F.col('fruitUmbelStalk');
    if (F.variant === 0) {
      F.rod(-0.16, 0.01, 0, 0.04, 0.01, 0, 0.008, stalk, 'food');
      for (let i = 0; i < 9; i++) {
        const a = -1.1 + i * 0.275, ex = 0.04 + Math.cos(a) * 0.1, ez = Math.sin(a) * 0.1;
        F.rod(0.04, 0.012, 0, ex, 0.014, ez, 0.003, stalk, 'food');
        for (let k = 0; k < 4; k++) F.ball(ex + Math.cos(k * 1.57) * 0.012, 0.016, ez + Math.sin(k * 1.57) * 0.012, 0.006, F.shade(seed, (k % 2) * 0.08), 'food');
      }
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.05, F.col('stoneCream'), 'stone', seed);
      KGEN.heap(F, 0, 0.04, 0, 0.08, 0.008, [seed, F.shade(seed, -0.1)], 'food');
    }
  }
});

/* ================= Crater Drylands (2 pieces; the yucca stalk is shared with the Eastern Badlands) ================= */

FURN({
  key: 'generic_fruit_fireseed', name: 'Frill-tree Fireseed', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'crater-drylands', source: ['frill'],
  w: 0.35, d: 0.26, h: 0.09, variants: 2, variantNames: ['a burst pod and its seed', 'roasted and ground'],
  variantDims: [{ w: 0.35, d: 0.26, h: 0.085 }, { w: 0.31, d: 0.2, h: 0.08 }],
  build: function (F) {
    const husk = F.col('fruitFireseedHusk'), nut = F.col('fruitFireseedNut'), meal = F.col('fruitFireseedMeal');
    if (F.variant === 0) {
      /* the ruffled collar, burst open by the heat, its fireproof seed in the cup and spilled on the ash */
      F.frustum(0, 0, 0, 0.03, 0.11, 0.07, 0, F.shade(husk, -0.3), 'food', 10);
      for (let i = 0; i < 10; i++) { const a = i * F.TAU / 10; F.blob(Math.cos(a) * 0.1, 0.07, Math.sin(a) * 0.1, 0.03, 0.025, a, F.shade(husk, i % 2 ? -0.12 : 0.06), 'food'); }
      for (let i = 0; i < 5; i++) { const a = i * 1.26; F.ball(Math.cos(a) * 0.035, 0.058, Math.sin(a) * 0.035, 0.018, F.shade(nut, (i % 2) * 0.08), 'food'); }
      for (const [x, z] of [[-0.155, 0.03], [-0.15, -0.035], [0.155, -0.02], [0.15, 0.04]]) F.blob(x, 0.01, z, 0.016, 0.02, x * 20, nut, 'food');
    } else {
      F.shift(-0.055, 0);
      KGEN.bowl(F, 0, 0, 0, 0.1, 0.05, F.col('stoneBuff'), 'stone', meal);
      F.dome(0, 0.05, 0, 0.08, 0.03, 0, F.shade(meal, 0.06), 'food');
      KFRUIT.leaf(F, 0.15, 0, 0.06, F.col('vegLeaf'));
      for (const [x, z] of [[0.13, -0.015], [0.16, 0.02], [0.17, -0.02]]) F.ball(x, 0.035, z, 0.015, F.shade(nut, 0.1), 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_parasol_pine', name: 'Parasol Pine Nuts', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'cloth', 'stone'],
  biome: 'crater-drylands', source: ['parasolpine'],
  w: 0.26, d: 0.18, h: 0.12, variants: 2, variantNames: ['a cone and cracked nuts', 'shelled nuts in a bowl'],
  variantDims: [{ w: 0.26, d: 0.16, h: 0.12 }, { w: 0.18, d: 0.18, h: 0.075 }],
  build: function (F) {
    const cone = F.col('fruitParasolCone'), shell = F.col('fruitParasolShell'), kern = F.col('fruitParasolKernel');
    if (F.variant === 0) {
      /* the big glossy cone, rounded like a stone pine's, its scales in rings; beside it the hard nuts and their kernels */
      F.box(0, 0, 0, 0.26, 0.01, 0.16, 0, F.col('clothLinen'), 'cloth');
      F.blob(-0.05, 0.065, 0, 0.065, 0.11, 0, F.shade(cone, -0.2), 'food');
      for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) {
        const y = 0.03 + j * 0.025, e = (y - 0.065) / 0.055, r = 0.065 * Math.sqrt(Math.max(0, 1 - e * e)) * 0.95, a = i * F.TAU / 8 + j * 0.39;
        F.ball(-0.05 + Math.cos(a) * r, y, Math.sin(a) * r, 0.014, F.shade(cone, (i + j) % 2 ? -0.06 : 0.08), 'food');
      }
      for (let i = 0; i < 6; i++) F.blob(0.04 + (i % 3) * 0.035, 0.022, -0.045 + Math.floor(i / 3) * 0.05, 0.014, 0.024, i, F.shade(shell, (i % 2) * 0.08), 'food');
      for (let i = 0; i < 3; i++) F.blob(0.06 + i * 0.03, 0.02, 0.05, 0.012, 0.02, i * 0.7, kern, 'food');
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.09, 0.045, F.col('stoneCream'), 'stone', kern);
      KGEN.heap(F, 0, 0.03, 0, 0.075, 0.01, [kern, F.shade(kern, -0.06)], 'food',
        (x, y, z, c) => F.blob(x, y + 0.01, z, 0.01, 0.02, x * 30, c, 'food'));
    }
  }
});

/* ================= North-west Bay (3 pieces; the gatepod and the pandan keys are shared) ================= */

FURN({
  key: 'generic_fruit_cliff_fig', name: 'Cliff Figs', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food'],
  biome: 'nwbay', source: ['clifffig'],
  w: 0.26, d: 0.2, h: 0.045, variants: 2, variantNames: ['a sprig with figs', 'halved on a leaf'],
  variantDims: [{ w: 0.26, d: 0.14, h: 0.04 }, { w: 0.2, d: 0.2, h: 0.045 }],
  build: function (F) {
    const fig = F.col('fruitCliffFig'), ripe = F.col('fruitCliffFigRipe'), flesh = F.col('fruitCliffFigFlesh');
    if (F.variant === 0) {
      /* small strangler figs in the leaf axils, orange-red going purple as they ripen */
      KFRUIT.leaf(F, -0.06, 0, 0.07, F.col('vegLeaf'));
      F.rod(-0.12, 0.012, 0, 0.11, 0.012, 0, 0.006, F.col('timberWalnut'), 'food');
      for (let i = 0; i < 7; i++) F.ball(-0.09 + i * 0.03, 0.02, i % 2 ? 0.024 : -0.024, 0.017, i % 3 ? fig : ripe, 'food');
    } else {
      KFRUIT.leaf(F, 0, 0, 0.1, F.col('vegLeaf'));
      for (const [x, z, k] of [[-0.04, -0.035, 0], [0.04, -0.035, 1], [-0.04, 0.035, 1], [0.04, 0.035, 0]]) KFRUIT.half(F, x, 0.015, z, 0.03, k ? ripe : fig, flesh);
    }
  }
});

FURN({
  key: 'generic_fruit_avenue_baobab', name: 'Avenue Baobab Fruit', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'nwbay', source: ['avenuebaobab'],
  w: 0.28, d: 0.28, h: 0.11, variants: 2, variantNames: ['whole fruit', 'cracked: pulp and seeds'],
  variantDims: [{ w: 0.27, d: 0.11, h: 0.11 }, { w: 0.28, d: 0.28, h: 0.065 }],
  build: function (F) {
    const pod = F.col('fruitAvenuePod'), pulp = F.col('fruitAvenuePulp'), seed = F.col('fruitAvenueSeed');
    if (F.variant === 0) {
      /* the velvety ochre egg of the avenue baobab, on its stalk */
      F.shift(-0.0265, 0);
      KGEN.capsule(F, -0.05, 0.05, 0, 0, 0.055, pod);
      F.rod(0.1, 0.06, 0, 0.15, 0.07, 0, 0.008, F.col('timberWalnut'), 'food');
    } else {
      /* the shell cracked open: dry cream pulp round dark kidney seeds (the pulp eaten, the seed pressed for oil) */
      KGEN.plate(F, 0, 0, 0, 0.14, F.col('stoneCream'));
      KFRUIT.half(F, -0.05, 0.02, 0, 0.06, pod, pulp);
      for (let i = 0; i < 5; i++) F.box(0.04 + (i % 3) * 0.03, 0.02, -0.04 + Math.floor(i / 3) * 0.05, 0.028, 0.024, 0.028, i * 0.4, F.shade(pulp, -(i % 2) * 0.05), 'food');
      for (let i = 0; i < 4; i++) F.blob(0.0 + i * 0.03, 0.03, 0.08, 0.012, 0.016, i, seed, 'food');
    }
  }
});

FURN({
  key: 'generic_fruit_traveller_aril', name: 'Traveller\'s Fan Arils', culture: 'generic', tier: 'common', wealth: [0, 1], type: 'food', setting: 'both',
  rooms: FRUIT_ROOMS, anchor: 'surface', clearance: {}, materials: ['food', 'stone'],
  biome: 'nwbay', source: ['travellerfan'],
  w: 0.17, d: 0.17, h: 0.09, variants: 2, variantNames: ['an open capsule', 'arils in a dish'],
  variantDims: [{ w: 0.17, d: 0.17, h: 0.08 }, { w: 0.16, d: 0.16, h: 0.09 }],
  build: function (F) {
    const cap = F.col('fruitTravellerCapsule'), aril = F.col('fruitTravellerAril');
    if (F.variant === 0) {
      /* the woody capsule split in three valves, the seeds in their electric-blue arils packed inside */
      F.frustum(0, 0, 0, 0.03, 0.045, 0.05, 0, F.shade(cap, -0.15), 'food', 6);
      for (let k = 0; k < 3; k++) { const a = k * F.TAU / 3; F.blob(Math.cos(a) * 0.055, 0.04, Math.sin(a) * 0.055, 0.03, 0.07, a, F.shade(cap, k * 0.05), 'food'); }
      for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6 + 0.5; F.ball(Math.cos(a) * 0.025, 0.06, Math.sin(a) * 0.025, 0.02, F.shade(aril, (i % 2) * 0.1), 'food'); }
    } else {
      KGEN.bowl(F, 0, 0, 0, 0.08, 0.04, F.col('stoneCream'), 'stone', F.shade(aril, -0.2));
      KGEN.heap(F, 0, 0.03, 0, 0.065, 0.012, [aril, F.shade(aril, 0.12)], 'food');
    }
  }
});
