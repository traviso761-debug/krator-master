/* ======================================================================
   Zeijani furniture: common and court tiers, the trade roles, and the loose
   pieces the Zeijani building kit (kits/zeijani) and Dhelv place by key.
   The Zeijani live in and around the Throne's lava tubes and tuff spires:
   carved rooms in cream tuff and blue-grey basalt, polished oxide reds for
   the rich ("red rooms"), kipuka timber, fleece and hide, terracotta ollas,
   copper, obsidian; murals in cave oxides and alecap purple. They brew the
   purple alecap into beer, farm cave fungi, and their alchemists distil the
   fungus medicines that are the city's real wealth. Influences: Cappadocia,
   Petra, Ethiopian rock churches, fantasy dwarves, the Pueblo and the kiva
   (style only: their spirits, the Hidden Ones, the Lamp Mother and the
   Serpent, are their own), the Ashlanders, Varanasi, Babylon.
   Carved-in-place benches, bed shelves, niches and the kiva's great incense
   burner are STRUCTURE (the kit's fixtures), never furniture: the pieces here
   are what a household carries in. The fleeces lie on the carved bed shelves.
   Lights are data (F.lamp; the interiors adapter strips them into records). The household pieces (the fleeces, the water
   jars, the stools, the lamps, the masks) take wealth [0, 1]: the poorest Zeijani homes use their own before the generic set.
   kits/zeijani/PLAN.md section 6.6 is the list this file answers.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('zeijani', { name: 'Zeijani', pack: 'zeijani', influences: 'Cappadocia, Petra, Ethiopian rock churches, fantasy dwarves, Pueblo and kiva, Ashlander, Varanasi, Babylon',
  materials: 'carved tuff and basalt, polished oxide stone, kipuka hardwood, fleece, hide, felt, terracotta and turquoise glaze, copper, obsidian, bone; court: polished red and purple oxide, bronze, turquoise inlay',
  palette: {
    tuff: 0xd9c8a6, tuffRose: 0xc9a28c, tuffDark: 0xa8987a, basalt: 0x5c6672, basaltDark: 0x2b2e34, lining: 0xaab4c0,
    oxideRed: 0x9a3a3c, oxideRose: 0xc06a74, rust: 0xb4602e, mauve: 0x9a6a86, magenta: 0x74406e, violet: 0x4a4e8a, teal: 0x4a9490,
    sulphur: 0xd6c25a, mineral: 0xdcd8d0,
    alecap: 0x5e3470, lilac: 0x9a78ac, alecapStem: 0xd8cce0, compost: 0x3a2a1c, mash: 0x8a6a3a, beer: 0x6a3a1a,
    cinnabar: 0xa23a2a, ochre: 0xc49a4a, turquoise: 0x3f8f88, soot: 0x221e1c, bone: 0xe8e0cc, boneOld: 0xb8a888,
    copper: 0xa8683a, copperDark: 0x6e4224, bronze: 0x9a7a3a, obsidian: 0x1a181c,
    glow: 0x8fe8c8, glowDeep: 0x3fb89a, flame: 0xffb04a, ember: 0xe0521e, resin: 0x8a1e14, smoke: 0xc8c4bc,
    timber: 0x7a5a3a, timberDark: 0x4a3424, timberLight: 0xa88a5e, wicker: 0xb08a52, ropeHemp: 0xb09a6a,
    hide: 0xa87a4a, hideDark: 0x5a3a22, fleece: 0xd8ccb4, fleeceDark: 0x8a7a64, felt: 0x6e5440, linen: 0xd8ccb0,
    clay: 0xb0683e, clayLight: 0xc8946a, clayDark: 0x7a4428, glaze: 0x2f7f86, wax: 0xe8dcb0, water: 0x3a5a62, leaf: 0x4a6a34
  } });
/* END PALETTE */

const ZJ_COMMON = {
  sym: 'spiralarch',
  emblem: { field: 'alecap', edge: 'soot', band: 'ochre', ink: 'bone', ink2: 'turquoise' },
  wood: 'timber', woodDark: 'timberDark', woodLight: 'timberLight', woodFam: 'wood',
  cloth: ['alecap', 'cinnabar', 'ochre', 'fleece'], clothFam: 'cloth',
  accent: 'copper', accentFam: 'bronze', metal: 'copperDark', metalFam: 'metal',
  clay: 'clay', clayFam: 'ceramic', stone: 'tuff', stoneFam: 'stone', rope: 'ropeHemp',
  flame: 'flame', ember: 'ember', lampCol: 'flame',
  legs: 'block', motif: 'step', bedBase: 'slab', seat: 'hide', finial: 'knob',
  hearth: 'stone', fire: 'bowl', lamp: 'oil', rug: 'woven', screen: 'carved', store: 'jars',
  shelfFill: 'jars', rack: 'spears', art: 'mask', art2: 'relief', statue: 'figure', tapestry: 'diamond',
  canopy: false, board: 'hide'
};
const ZJ_COURT = Object.assign({}, ZJ_COMMON, {
  emblem: { field: 'oxideRed', edge: 'soot', band: 'ochre', disc: 'alecap', ink: 'bone', ink2: 'ochre' },
  cloth: ['alecap', 'oxideRed', 'turquoise', 'bone'], stone: 'oxideRed',
  accent: 'bronze', accentFam: 'bronze', finial: 'disc', rug: 'knotted', screen: 'lattice',
  art: 'relief', statue: 'guardian', tapestry: 'figure'
});
FK.set({ culture: 'zeijani', tier: 'common', S: ZJ_COMMON, names: {
  bed: 'Timber bed with fleeces', bench: 'Plank bench with hides', chair: 'Hide-seated chair', stool: 'Three-legged stool', table: 'Kipuka plank table',
  low_table: 'Low hearth table', desk: 'Scribe\'s slate desk', chest: 'Copper-cornered chest', bookcase: 'Jar and tablet shelves', wall_shelves: 'Hanging shelves',
  store: 'Storage jars', hearth: 'Tuff hearth with smoke hood', fire: 'Copper fire-bowl', lamp: 'Oil lamp on a stand', candle: 'Clay lamp',
  hanging: 'Hanging copper lamp', rug: 'Woven rug', screen: 'Carved timber screen', counter: 'Stone-topped counter', workbench: 'Workbench',
  loom: 'Upright loom', rack: 'Spear rack', ladder: 'Ladder', board: 'Hide map board', art: 'Spirit mask', banner: 'Alecap-purple banner',
  scroll: 'Painted hide scroll', pennants: 'Felt pennants', bowl: 'Terracotta bowl', jug: 'Beer jug and cups', books: 'Tablets and hide rolls' } });
FK.set({ culture: 'zeijani', tier: 'court', S: ZJ_COURT, names: {
  bed: 'Fleece-piled dais bed', throne: 'Clan elder\'s seat', divan: 'Cushioned stone divan', table: 'Polished stone feast table', low_table: 'Inlaid low table',
  desk: 'Elder\'s writing desk', cabinet: 'Bronze-bound cabinet', bookcase: 'Record shelves', hearth: 'Red-stone hearth', fire: 'Bronze fire-bowl',
  lamp: 'Bronze lamp tree', candelabra: 'Branched clay lamp', hanging: 'Hanging bronze lamp', carpet: 'Knotted carpet', screen: 'Pierced lattice screen',
  tapestry: 'Spirit hanging', banner: 'Clan banner', frieze: 'Felt frieze', wall_rug: 'Knotted wall carpet', scroll: 'Painted hide scroll',
  painted_hanging: 'Painted procession hide', art: 'Carved relief panel', statue: 'Guardian figure', jug: 'Glazed jug and cups', bowl: 'Glazed bowl' } });
/* trades and households (FK.ROLES.trade): keyed zeijani_trade_<role> */
FK.set({ culture: 'zeijani', tier: 'common', roles: 'trade', prefix: 'zeijani_trade_', S: ZJ_COMMON, names: {
  forge: 'Smith\'s forge under a smoke shaft', anvil: 'Anvil on a basalt block', trough: 'Stone quench trough', stall: 'Beast stall', hayrack: 'Fodder rack',
  display: 'Trader\'s display', armour_stand: 'Hide armour on a stand', weapon_rack: 'Spear and axe rack', vat: 'Steeping vat',
  still: 'Fungus-spirit still', bin: 'Grain bins', larder: 'Hanging larder', bunk: 'Two-tier bunk', locker: 'Painted locker',
  lathe: 'Bow lathe', press: 'Oil press', kiln: 'Potter\'s kiln', grindstone: 'Grindstone', altar: 'Spirit altar', barrel: 'Beer crocks in a cradle' } });

/* ---------------------------------------------------------------------- shared shapes
   Everything here draws through the frame F it is handed, and takes colours, not palette keys. */
const ZJ_FX = {
  /* a round-bellied terracotta jar standing on y: r its belly radius, h its height (rim included) */
  jar: function (F, x, z, r, h, col, fam, lid, y0) {
    const c = col, cd = F.shade(c, -0.18), b = y0 || 0;
    F.cyl(x, b, z, r * 0.55, h * 0.06, 0, cd, fam);
    F.blob(x, b + h * 0.42, z, r, h * 0.72, 0, c, fam);
    F.frustum(x, b + h * 0.74, z, r * 0.5, r * 0.36, h * 0.16, 0, c, fam, 12);
    F.cyl(x, b + h * 0.9, z, r * 0.44, h * 0.1, 0, F.shade(c, 0.08), fam);
    if (lid) F.cyl(x, b + h * 0.96, z, r * 0.47, h * 0.04, 0, lid, 'wood');
  },
  /* a clump of alecap mushrooms on a mound of compost, at (x, y0, z); s scales it */
  alecaps: function (F, x, y0, z, s, n) {
    F.blob(x, y0 + 0.02 * s, z, 0.16 * s, 0.05 * s, 0, F.col('compost'), 'food');
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996 + F.rr(-0.3, 0.3), rr = (i ? 0.04 + 0.06 * Math.sqrt(i / n) : 0) * s;
      const px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr, hs = F.rr(0.05, 0.11) * s, rc = F.rr(0.035, 0.06) * s;
      F.cyl(px, y0 + 0.02 * s, pz, rc * 0.28, hs, 0, F.col('alecapStem'), 'food');
      F.dome(px, y0 + 0.02 * s + hs - rc * 0.15, pz, rc, rc * 0.62, 0, F.pick(['alecap', 'alecap', 'lilac']), 'food');
    }
  },
  /* a small flame on a wick at (x, y, z), with its light as data */
  flame: function (F, x, y, z, s, light) {
    F.cone(x, y, z, 0.018 * s, 0.07 * s, 0, F.col('flame'), 'glow');
    if (light) F.lamp(x, y + 0.08 * s, z, light, 6);
  },
  /* glow fungus: a cluster of pale teal domes */
  glowCaps: function (F, x, y0, z, s, n) {
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996, rr = (i ? 0.03 + 0.05 * Math.sqrt(i / n) : 0) * s;
      F.dome(x + Math.cos(a) * rr, y0, z + Math.sin(a) * rr, F.rr(0.02, 0.04) * s, F.rr(0.015, 0.03) * s, 0, F.pick(['glow', 'glowDeep']), 'glow');
    }
  }
};

/* ====================================================================== home */
FURN({
  key: 'zeijani_fleece_bed', name: 'Fleeces and a hide blanket', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'bed', role: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'cell', 'cottage', 'barracks', 'dormitory'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth', 'hide', 'stone'],
  w: 0.95, d: 1.9, h: 0.42, variants: 2, variantNames: ['on the floor', 'on a stone kerb'], variantDims: [{ w: 0.95, d: 1.9, h: 0.3 }, { w: 0.95, d: 1.9, h: 0.42 }],
  build: function (F) {
    let y = 0;
    if (F.variant === 1) {
      const t = F.col('tuff');
      F.box(-0.425, 0, 0, 0.1, 0.14, 1.9, 0, F.shade(t, -0.05), 'stone'); F.box(0.425, 0, 0, 0.1, 0.14, 1.9, 0, F.shade(t, -0.05), 'stone');
      F.box(0, 0, -0.9, 0.75, 0.14, 0.1, 0, t, 'stone'); F.box(0, 0, 0.9, 0.75, 0.14, 0.1, 0, t, 'stone');
      F.box(0, 0, 0, 0.75, 0.08, 1.7, 0, F.col('compost'), 'stone');
      y = 0.12;
    }
    F.pillow(0, y + 0.06, 0, 0.9, 0.12, 1.84, 0, F.col('hide'), 'hide', { puff: 0.3, side: 0.4 });
    F.pillow(0, y + 0.14, -0.1, 0.82, 0.08, 1.5, 0, F.pick(['fleece', 'fleece', 'fleeceDark']), 'cloth', { puff: 0.6, round: 3 });
    F.pillow(0, y + 0.2, 0.42, 0.86, 0.05, 0.8, 0, F.pick(['alecap', 'cinnabar', 'ochre']), 'cloth', { puff: 0.4 });
    F.bolster(0, y + 0.24, -0.72, 0.62, 0.06, 0, F.col('fleeceDark'), 'cloth');
  }
});
FURN({
  key: 'zeijani_olla', name: 'Water olla', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'storage', role: 'store', setting: 'both',
  rooms: ['kitchen', 'cell', 'cottage', 'living', 'store', 'cistern', 'hall', 'brewery', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['ceramic', 'timber', 'stone'],
  w: 0.6, d: 0.6, h: 0.86, variants: 2, variantNames: ['one jar on a ring', 'three jars'], variantDims: [{ w: 0.6, d: 0.6, h: 0.86 }, { w: 0.62, d: 0.6, h: 0.62 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.2, 0.08, 0, F.col('tuffDark'), 'stone');
      ZJ_FX.jar(F, 0, 0, 0.29, 0.86, F.col('clay'), 'ceramic', F.col('timberDark'));
    } else {
      [[-0.16, -0.12, 0.62], [0.16, -0.12, 0.54], [0, 0.15, 0.48]].forEach(function (p) { ZJ_FX.jar(F, p[0], p[1], 0.145, p[2], F.pick(['clay', 'clayLight', 'clayDark']), 'ceramic'); });
    }
  }
});
FURN({
  key: 'zeijani_jar_cradle', name: 'Jars in a timber cradle', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'storage', role: 'store', setting: 'indoor',
  rooms: ['cistern', 'kitchen', 'store', 'brewery', 'tavern'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['ceramic', 'timber'],
  w: 1.6, d: 0.55, h: 1.0, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    F.box(0, 0, -0.25, 1.6, 0.9, 0.05, 0, wd, 'wood');
    for (const x of [-0.76, 0.76]) F.box(x, 0, 0, 0.08, 0.5, 0.5, 0, wd, 'wood');
    for (const z of [-0.18, 0.18]) F.rod(-0.72, 0.3, z, 0.72, 0.3, z, 0.03, F.col('timber'), 'wood');
    for (let i = 0; i < 4; i++) ZJ_FX.jar(F, -0.54 + i * 0.36, 0.0, 0.16, 0.56, F.pick(['clay', 'clayLight']), 'ceramic', F.col('timberDark'), 0.06);
    F.box(0, 0, 0, 1.5, 0.06, 0.48, 0, F.col('timberDark'), 'wood');
  }
});
FURN({
  key: 'zeijani_stone_stool', name: 'Tuff block stool', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'chair', role: 'stool', setting: 'both',
  rooms: ['hall', 'cell', 'cottage', 'living', 'kitchen', 'tavern', 'workshop', 'guardroom', 'kiva', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'hide'],
  w: 0.42, d: 0.42, h: 0.46, variants: 2, variantNames: ['bare', 'with a hide'],
  build: function (F) {
    F.frustum(0, 0, 0, 0.2, 0.17, 0.42, 0, F.shade('tuff', F.rr(-0.08, 0.04)), 'stone', 10);
    if (F.variant === 1) F.pillow(0, 0.44, 0, 0.34, 0.04, 0.34, F.rr(-0.4, 0.4), F.col('hide'), 'hide', { puff: 0.3, round: 2.4 });
  }
});
FURN({
  key: 'zeijani_stone_bench', name: 'Tuff slab bench', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'bench', role: 'bench', setting: 'both',
  rooms: ['hall', 'tavern', 'guardroom', 'kiva', 'yard', 'court', 'cistern', 'street', 'plaza'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone'],
  w: 1.6, d: 0.45, h: 0.46, variants: 1,
  build: function (F) {
    const t = F.col('tuff');
    for (const x of [-0.6, 0.6]) F.box(x, 0, 0, 0.28, 0.36, 0.38, 0, F.shade(t, -0.08), 'stone');
    F.box(0, 0.36, 0, 1.6, 0.1, 0.45, 0, t, 'stone');
  }
});

/* ====================================================================== brewing and fungi */
FURN({
  key: 'zeijani_mash_tun', name: 'Stone mash tun', culture: 'zeijani', tier: 'common', type: 'storage', role: 'mash_tun', job: 'brewing', setting: 'indoor',
  rooms: ['brewery', 'workshop', 'store', 'kitchen'], anchor: 'floor', clearance: { front: 0.8, left: 0.4, right: 0.4 },
  materials: ['stone', 'metal', 'timber', 'food'],
  w: 1.3, d: 1.3, h: 1.25, variants: 1,
  build: function (F) {
    const t = F.col('tuffDark');
    F.frustum(0, 0, 0, 0.62, 0.58, 0.9, 0, t, 'stone', 16);
    F.cyl(0, 0.9, 0, 0.6, 0.06, 0, F.col('copper'), 'metal');
    F.cyl(0, 0.82, 0, 0.53, 0.1, 0, F.col('mash'), 'food');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.ball(Math.cos(a) * 0.3, 0.92, Math.sin(a) * 0.3, 0.04, F.col('lilac'), 'food'); }
    F.rod(-0.2, 0.75, 0.1, 0.38, 1.25, -0.28, 0.025, F.col('timber'), 'wood');
    F.box(0, 0.12, 0.6, 0.2, 0.08, 0.1, 0, F.col('copperDark'), 'metal');
  }
});
FURN({
  key: 'zeijani_ferment_crocks', name: 'Fermenting crocks', culture: 'zeijani', tier: 'common', type: 'storage', role: 'crock', job: 'brewing', setting: 'indoor',
  rooms: ['brewery', 'store', 'tavern', 'kitchen'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['ceramic', 'stone', 'timber', 'cloth'],
  w: 1.6, d: 0.6, h: 0.92, variants: 2, variantNames: ['three crocks', 'two crocks and jugs'],
  build: function (F) {
    F.box(0, 0, 0, 1.6, 0.12, 0.6, 0, F.col('tuff'), 'stone');
    F.box(0, 0, -0.27, 1.6, 0.5, 0.06, 0, F.shade('tuff', -0.06), 'stone');
    const xs = F.variant === 0 ? [-0.5, 0, 0.5] : [-0.45, 0.25];
    for (const x of xs) {
      ZJ_FX.jar(F, x, 0.02, 0.24, 0.8, F.pick(['clay', 'clayDark']), 'ceramic', null, 0.12);
      F.cyl(x, 0.86, 0.02, 0.12, 0.05, 0, F.pick(['alecap', 'linen']), 'cloth');
    }
    if (F.variant === 1) [[0.62, 0.12], [0.72, -0.1]].forEach(function (q) { ZJ_FX.jar(F, q[0], q[1], 0.06, 0.24, F.col('glaze'), 'ceramic', null, 0.12); });
  }
});
FURN({
  key: 'zeijani_spawn_rack', name: 'Alecap spawn rack', culture: 'zeijani', tier: 'common', type: 'rack', role: 'spawn_rack', job: 'fungiculture', setting: 'indoor',
  rooms: ['farm', 'workshop', 'store', 'lab', 'cellar'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'food'],
  w: 1.6, d: 0.5, h: 1.8, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    for (const x of [-0.76, 0.76]) for (const z of [-0.22, 0.2]) F.box(x, 0, z, 0.06, 1.8, 0.06, 0, wd, 'wood');
    for (let k = 0; k < 4; k++) {
      const y = 0.15 + k * 0.45;
      F.box(0, y, -0.01, 1.56, 0.04, 0.46, 0, F.col('timber'), 'wood');
      F.box(0, y + 0.04, -0.01, 1.44, 0.06, 0.4, 0, F.col('compost'), 'food');
      if (k < 3) for (let j = 0; j < 4; j++) ZJ_FX.alecaps(F, -0.54 + j * 0.36, y + 0.07, F.rr(-0.06, 0.06), 0.9, 3 + (j + k) % 3);
    }
  }
});
FURN({
  key: 'zeijani_drying_trays', name: 'Mushroom drying trays', culture: 'zeijani', tier: 'common', type: 'rack', role: 'drying_rack', job: 'fungiculture', setting: 'both',
  rooms: ['farm', 'workshop', 'store', 'lab', 'kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'wicker', 'food'],
  w: 1.0, d: 0.7, h: 1.5, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    for (const x of [-0.46, 0.46]) for (const z of [-0.31, 0.31]) F.box(x, 0, z, 0.05, 1.5, 0.05, 0, wd, 'wood');
    for (let k = 0; k < 5; k++) {
      const y = 0.2 + k * 0.28;
      F.box(0, y, 0, 0.88, 0.03, 0.6, 0, F.col('wicker'), 'wicker');
      for (let j = 0; j < 7; j++) F.blob(F.rr(-0.36, 0.36), y + 0.04, F.rr(-0.24, 0.24), F.rr(0.03, 0.05), 0.02, 0, F.pick(['alecap', 'lilac', 'mauve']), 'food');
    }
  }
});
FURN({
  key: 'zeijani_alecap_basket', name: 'Basket of alecaps', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'storage', role: 'basket', job: 'fungiculture', setting: 'both',
  rooms: ['kitchen', 'store', 'shop', 'market', 'brewery', 'farm', 'yard', 'cottage', 'cell'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['wicker', 'food'],
  w: 0.55, d: 0.55, h: 0.48, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.2, 0.27, 0.32, 0, F.col('wicker'), 'wicker', 14);
    F.cyl(0, 0.3, 0, 0.27, 0.03, 0, F.shade('wicker', -0.12), 'wicker');
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.06 + 0.13 * Math.sqrt(i / 9); F.dome(Math.cos(a) * r, 0.3, Math.sin(a) * r, F.rr(0.05, 0.075), F.rr(0.04, 0.06), 0, F.pick(['alecap', 'alecap', 'lilac']), 'food'); }
  }
});

/* ====================================================================== the alchemist */
FURN({
  key: 'zeijani_retort_bench', name: 'Retort bench', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'retort', job: 'alchemy', setting: 'indoor',
  rooms: ['lab', 'workshop', 'study', 'shop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['stone', 'ceramic', 'glass', 'metal', 'emissive', 'timber'],
  w: 1.6, d: 0.7, h: 1.6, variants: 1,
  build: function (F) {
    const t = F.col('tuff');
    F.box(0, 0, -0.05, 1.6, 0.8, 0.6, 0, F.shade(t, -0.06), 'stone');
    F.box(0, 0.8, 0, 1.6, 0.06, 0.7, 0, t, 'stone');
    F.box(0, 0.86, -0.33, 1.6, 0.74, 0.04, 0, F.col('timberDark'), 'wood');
    /* the charcoal brazier and the retort over it, its neck running to a receiver */
    F.cyl(-0.45, 0.86, 0.05, 0.16, 0.14, 0, F.col('copperDark'), 'metal');
    F.blob(-0.45, 1.0, 0.05, 0.13, 0.04, 0, F.col('ember'), 'glow');
    F.blob(-0.45, 1.13, 0.05, 0.12, 0.2, 0, F.col('clayDark'), 'ceramic');
    F.rod(-0.4, 1.2, 0.05, 0.12, 1.02, 0.12, 0.018, F.col('clayDark'), 'ceramic');
    F.blob(0.17, 0.95, 0.12, 0.08, 0.15, 0, F.col('lining'), 'glass');
    F.lamp(-0.45, 1.05, 0.15, 0.6, 4);
    /* jars on the back board's shelf */
    F.box(0, 1.3, -0.24, 1.5, 0.03, 0.14, 0, F.col('timber'), 'wood');
    for (let i = 0; i < 7; i++) F.cyl(-0.63 + i * 0.21, 1.33, -0.24, 0.045, F.rr(0.08, 0.16), 0, F.pick(['glaze', 'clay', 'lining', 'alecap']), 'ceramic');
    F.cyl(0.55, 0.86, 0.12, 0.08, 0.1, 0, F.col('tuffDark'), 'stone');
  }
});
FURN({
  key: 'zeijani_specimen_shelf', name: 'Shelf of specimen jars', culture: 'zeijani', tier: 'common', type: 'shelf', role: 'shelf', job: 'alchemy', setting: 'indoor',
  rooms: ['lab', 'study', 'shop', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'ceramic', 'glass', 'emissive', 'food'],
  w: 1.3, d: 0.35, h: 1.9, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    F.box(0, 0, -0.155, 1.3, 1.9, 0.04, 0, wd, 'wood');
    for (const x of [-0.62, 0.62]) F.box(x, 0, 0, 0.06, 1.9, 0.35, 0, wd, 'wood');
    for (let k = 0; k < 5; k++) {
      const y = 0.08 + k * 0.42;
      F.box(0, y, 0, 1.18, 0.03, 0.33, 0, F.col('timber'), 'wood');
      if (k === 4) continue;
      for (let i = 0; i < 6; i++) {
        const x = -0.48 + i * 0.19, hj = F.rr(0.14, 0.26), glow = (i + k) % 5 === 0;
        F.cyl(x, y + 0.03, 0.02, 0.06, hj, 0, glow ? F.col('glowDeep') : F.pick(['lining', 'glaze', 'clayLight']), glow ? 'glow' : 'glass');
        F.cyl(x, y + 0.03 + hj, 0.02, 0.045, 0.03, 0, F.col('wax'), 'ceramic');
        if (!glow && F.chance(0.5)) F.ball(x, y + 0.03 + hj * 0.4, 0.02, 0.035, F.pick(['alecap', 'resin', 'sulphur', 'leaf']), 'food');
      }
    }
  }
});
FURN({
  key: 'zeijani_mortar', name: 'Mortar, pestle and resin', culture: 'zeijani', tier: 'common', type: 'vessel', role: 'mortar', job: 'alchemy', setting: 'indoor',
  rooms: ['lab', 'kitchen', 'shop', 'workshop', 'kiva'], anchor: 'surface', clearance: {},
  materials: ['stone', 'food'],
  w: 0.32, d: 0.28, h: 0.3, variants: 1,
  build: function (F) {
    F.frustum(-0.05, 0, 0, 0.1, 0.12, 0.12, 0, F.col('basalt'), 'stone', 12);
    F.cyl(-0.05, 0.1, 0, 0.09, 0.02, 0, F.col('resin'), 'food');
    F.rod(-0.05, 0.08, 0, 0.02, 0.3, 0.03, 0.022, F.col('basaltDark'), 'stone');
    for (let i = 0; i < 4; i++) F.blob(0.11 + F.rr(-0.02, 0.02), 0.012, F.rr(-0.08, 0.08), 0.02, 0.02, 0, F.col('resin'), 'food');
  }
});
FURN({
  key: 'zeijani_glow_jar', name: 'Glow-culture jar', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'lamp', role: 'glow_jar', job: 'alchemy', setting: 'indoor',
  rooms: ['lab', 'cell', 'hall', 'shop', 'kiva', 'ossuary', 'bedroom', 'cottage', 'study'], anchor: 'surface', clearance: {},
  materials: ['glass', 'emissive', 'ceramic'],
  w: 0.24, d: 0.24, h: 0.34, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.1, 0.04, 0, F.col('clayDark'), 'ceramic');
    F.cyl(0, 0.04, 0, 0.095, 0.24, 0, F.col('lining'), 'glass');
    ZJ_FX.glowCaps(F, 0, 0.05, 0, 0.9, 5);
    F.cyl(0, 0.28, 0, 0.07, 0.06, 0, F.col('wax'), 'ceramic');
    F.lamp(0, 0.16, 0, 0.25, 3);
  }
});

/* ====================================================================== light */
FURN({
  key: 'zeijani_glow_basin', name: 'Glow-fungus basin on a pillar', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'lamp', role: 'lamp', setting: 'both',
  rooms: ['hall', 'kiva', 'shrine', 'ossuary', 'cistern', 'court', 'antechamber', 'street', 'plaza', 'tavern'], anchor: 'floor', clearance: {},
  materials: ['stone', 'emissive', 'food'],
  w: 0.5, d: 0.5, h: 1.1, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.18, 0.12, 0.85, 0, F.col('tuffDark'), 'stone', 8);
    F.frustum(0, 0.85, 0, 0.13, 0.25, 0.14, 0, F.col('tuff'), 'stone', 12);
    F.cyl(0, 0.96, 0, 0.22, 0.03, 0, F.col('compost'), 'food');
    ZJ_FX.glowCaps(F, 0, 0.99, 0, 2.6, 11);
    F.lamp(0, 1.05, 0, 0.35, 5);
  }
});
FURN({
  key: 'zeijani_slipper_lamp', name: 'Clay slipper lamp', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'lamp', role: 'candle', setting: 'indoor',
  rooms: ['hall', 'cell', 'bedroom', 'cottage', 'living', 'kiva', 'shrine', 'ossuary', 'study', 'tavern'], anchor: 'surface', clearance: {},
  materials: ['ceramic', 'emissive'],
  w: 0.22, d: 0.12, h: 0.14, variants: 1,
  build: function (F) {
    F.blob(-0.02, 0.03, 0, 0.07, 0.06, 0, F.col('clay'), 'ceramic');
    F.beam(0.03, 0.03, 0, 0.1, 0.035, 0, 0.04, 0.05, F.col('clay'), 'ceramic');
    ZJ_FX.flame(F, 0.09, 0.05, 0, 1.2, 0.3);
  }
});
FURN({
  key: 'zeijani_hanging_lamp', name: 'Hanging copper bowl lamp', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'lamp', role: 'hanging', setting: 'indoor',
  rooms: ['hall', 'tavern', 'kiva', 'shop', 'brewery', 'lab', 'antechamber', 'guardroom', 'inn'], anchor: 'ceiling', clearance: {},
  materials: ['metal', 'emissive'],
  w: 0.5, d: 0.5, h: 1.0, variants: 1,
  build: function (F) {
    const c = F.col('copper');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2, 0, 1.0, 0, 0.008, F.col('copperDark'), 'metal'); }
    F.frustum(0, 0.04, 0, 0.1, 0.24, 0.14, 0, c, 'metal', 16);
    F.cyl(0, 0.96, 0, 0.1, 0.04, 0, F.col('copperDark'), 'metal');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; ZJ_FX.flame(F, Math.cos(a) * 0.16, 0.18, Math.sin(a) * 0.16, 1.4, i ? 0 : 0.6); }
  }
});

/* ====================================================================== crafts */
FURN({
  key: 'zeijani_mealing_bins', name: 'Mealing bins with grinding stones', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'workstation', role: 'mealing', job: 'milling', setting: 'indoor',
  rooms: ['kitchen', 'cell', 'cottage', 'living', 'workshop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['stone', 'food'],
  w: 1.4, d: 0.7, h: 0.42, variants: 1,
  build: function (F) {
    const t = F.col('tuff'), td = F.shade(t, -0.1);
    F.box(0, 0, -0.325, 1.4, 0.42, 0.05, 0, td, 'stone');
    for (const x of [-0.675, -0.225, 0.225, 0.675]) F.box(x, 0, 0, 0.05, 0.36, 0.7, 0, td, 'stone');
    F.box(0, 0, 0.325, 1.4, 0.2, 0.05, 0, td, 'stone');
    for (let i = 0; i < 3; i++) {
      const x = -0.45 + i * 0.45, c = [F.col('basalt'), F.col('tuffDark'), F.col('basaltDark')][i];
      F.beam(x, 0.3, -0.26, x, 0.12, 0.2, 0.34, 0.07, c, 'stone');
      F.box(x, 0.24, -0.02, 0.24, 0.06, 0.09, 0, F.shade(c, 0.1), 'stone');
      F.blob(x, 0.04, 0.24, 0.1, 0.05, 0, F.col('linen'), 'food');
    }
  }
});
FURN({
  key: 'zeijani_dye_vat', name: 'Alecap dye vat', culture: 'zeijani', tier: 'common', type: 'storage', role: 'vat', job: 'dyeing', setting: 'both',
  rooms: ['workshop', 'yard', 'shop'], anchor: 'floor', clearance: { front: 0.7, left: 0.3, right: 0.3 },
  materials: ['stone', 'timber', 'cloth', 'food'],
  w: 1.2, d: 1.2, h: 1.5, variants: 2, variantNames: ['alecap purple', 'cinnabar red'],
  build: function (F) {
    F.frustum(0, 0, 0, 0.58, 0.55, 0.7, 0, F.col('tuffDark'), 'stone', 14);
    F.cyl(0, 0.66, 0, 0.5, 0.04, 0, F.col(F.variant ? 'cinnabar' : 'alecap'), 'food');
    for (const x of [-0.5, 0.5]) F.box(x, 0.7, 0, 0.06, 0.8, 0.06, 0, F.col('timberDark'), 'wood');
    F.rod(-0.53, 1.45, 0, 0.53, 1.45, 0, 0.025, F.col('timber'), 'wood');
    for (let i = 0; i < 4; i++) F.box(-0.3 + i * 0.2, 0.95, 0, 0.1, 0.5, 0.05, 0, F.col(F.variant ? (i % 2 ? 'cinnabar' : 'oxideRed') : (i % 2 ? 'alecap' : 'magenta')), 'cloth');
  }
});
FURN({
  key: 'zeijani_yarn_rack', name: 'Dyed yarn drying on poles', culture: 'zeijani', tier: 'common', type: 'rack', role: 'yarn_rack', job: 'dyeing', setting: 'both',
  rooms: ['workshop', 'shop', 'yard', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'cloth'],
  w: 1.4, d: 0.4, h: 1.9, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    for (const x of [-0.66, 0.66]) F.box(x, 0, -0.17, 0.06, 1.9, 0.06, 0, wd, 'wood');
    for (const y of [1.0, 1.75]) {
      F.rod(-0.68, y, -0.17, 0.68, y, -0.17, 0.018, wd, 'wood');
      F.rod(-0.68, y, -0.17, -0.68, y, 0.17, 0.018, wd, 'wood'); F.rod(0.68, y, -0.17, 0.68, y, 0.17, 0.018, wd, 'wood');
      F.rod(-0.68, y, 0.17, 0.68, y, 0.17, 0.018, wd, 'wood');
      for (let i = 0; i < 6; i++) F.box(-0.5 + i * 0.2, y - 0.5, 0.15, 0.09, 0.48, 0.04, 0, F.pick(['alecap', 'cinnabar', 'ochre', 'turquoise', 'magenta']), 'cloth');
    }
  }
});
FURN({
  key: 'zeijani_potters_wheel', name: 'Potter\'s kick wheel', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'wheel', job: 'pottery', setting: 'both',
  rooms: ['workshop', 'yard', 'shop'], anchor: 'floor', clearance: { front: 0.6, back: 0.4 },
  materials: ['timber', 'stone', 'ceramic'],
  w: 0.9, d: 1.0, h: 0.9, variants: 1,
  build: function (F) {
    F.cyl(0, 0.02, 0.1, 0.36, 0.1, 0, F.col('basalt'), 'stone');
    F.cyl(0, 0.12, 0.1, 0.03, 0.55, 0, F.col('timberDark'), 'wood');
    F.cyl(0, 0.66, 0.1, 0.2, 0.05, 0, F.col('timber'), 'wood');
    F.blob(0, 0.78, 0.1, 0.1, 0.16, 0, F.col('clayLight'), 'ceramic');
    F.box(0, 0, -0.38, 0.8, 0.5, 0.24, 0, F.col('timber'), 'wood');
    F.box(0, 0.5, -0.38, 0.8, 0.05, 0.24, 0, F.col('timberLight'), 'wood');
  }
});
FURN({
  key: 'zeijani_pot_stack', name: 'Finished pots on planks', culture: 'zeijani', tier: 'common', type: 'stack', role: 'pots', job: 'pottery', setting: 'both',
  rooms: ['shop', 'store', 'workshop', 'market', 'kitchen', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'ceramic'],
  w: 1.2, d: 0.6, h: 1.0, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    F.box(0, 0, -0.28, 1.2, 1.0, 0.04, 0, wd, 'wood');
    for (const x of [-0.57, 0.57]) F.box(x, 0, 0, 0.06, 0.62, 0.56, 0, wd, 'wood');
    F.box(0, 0.5, 0, 1.14, 0.04, 0.56, 0, F.col('timber'), 'wood');
    for (let i = 0; i < 4; i++) ZJ_FX.jar(F, -0.4 + i * 0.27, 0.04, 0.12, F.rr(0.3, 0.42), F.pick(['clay', 'clayLight', 'glaze']), 'ceramic');
    for (let i = 0; i < 3; i++) F.blob(-0.3 + i * 0.3, 0.6, 0.02, 0.13, 0.18, 0, F.pick(['clay', 'clayDark', 'glaze']), 'ceramic');
  }
});
FURN({
  key: 'zeijani_knapping_bench', name: 'Obsidian knapper\'s bench', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'knapping', job: 'knapping', setting: 'both',
  rooms: ['workshop', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['stone', 'obsidian', 'hide', 'bone'],
  w: 1.2, d: 0.7, h: 0.75, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.0, 0.6, 0.55, 0, F.col('tuffDark'), 'stone');
    F.pillow(0, 0.62, 0, 0.9, 0.03, 0.5, 0.1, F.col('hide'), 'hide', { puff: 0.2 });
    for (let i = 0; i < 3; i++) F.blob(-0.3 + i * 0.25, 0.68, -0.08, F.rr(0.05, 0.07), 0.08, F.rr(0, 3), F.col('obsidian'), 'obsidian');
    for (let i = 0; i < 6; i++) F.beam(-0.35 + i * 0.13, 0.65, 0.12, -0.3 + i * 0.13, 0.65, 0.2, 0.03, 0.006, F.col('obsidian'), 'obsidian');
    F.rod(0.38, 0.65, 0.05, 0.5, 0.67, 0.18, 0.018, F.col('bone'), 'bone');
    for (let i = 0; i < 5; i++) F.blob(F.rr(-0.55, 0.55), 0.01, F.rr(0.28, 0.34), 0.03, 0.015, 0, F.col('obsidian'), 'obsidian');
  }
});
FURN({
  key: 'zeijani_obsidian_mirror', name: 'Polished obsidian mirror', culture: 'zeijani', tier: 'common', type: 'art', role: 'mirror', job: 'knapping', setting: 'indoor',
  rooms: ['shop', 'hall', 'bedroom', 'court', 'shrine', 'kiva', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['obsidian', 'metal'],
  w: 0.7, d: 0.1, h: 0.9, variants: 1,
  build: function (F) {
    F.box(0, 0.3, -0.04, 0.7, 0.6, 0.02, 0, F.col('copperDark'), 'metal');
    F.rod(0, 0.58, -0.04, 0, 0.58, -0.02, 0.3, F.col('copper'), 'metal');
    F.rod(0, 0.58, -0.02, 0, 0.58, -0.005, 0.26, F.col('obsidian'), 'obsidian');
  }
});
FURN({
  key: 'zeijani_rope_rack', name: 'Rope and caving gear on pegs', culture: 'zeijani', tier: 'common', type: 'rack', role: 'rope_rack', job: 'ropemaking', setting: 'indoor',
  rooms: ['shop', 'store', 'guardroom', 'barracks', 'workshop', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'rope', 'hide', 'metal'],
  w: 1.4, d: 0.36, h: 1.9, variants: 1,
  build: function (F) {
    F.box(0, 0.2, -0.16, 1.4, 1.7, 0.04, 0, F.col('timberDark'), 'wood');
    for (let i = 0; i < 4; i++) {
      const x = -0.5 + i * 0.33;
      F.rod(x, 1.65, -0.14, x, 1.68, 0.06, 0.015, F.col('timber'), 'wood');
      F.blob(x, 1.3, -0.02, 0.13, 0.55, 0, F.col('ropeHemp'), 'rope');
    }
    F.box(-0.42, 0.25, 0, 0.36, 0.5, 0.26, 0, F.col('hide'), 'hide');
    F.box(0.4, 0.25, 0, 0.36, 0.42, 0.24, 0, F.col('hideDark'), 'hide');
    for (let k = 0; k < 6; k++) F.rod(-0.1, 0.25 + k * 0.14, 0.02, 0.1, 0.25 + k * 0.14, 0.02, 0.01, F.col('timberLight'), 'wood');
    for (const x of [-0.1, 0.1]) F.rod(x, 0.2, 0.02, x, 1.0, 0.02, 0.01, F.col('ropeHemp'), 'rope');
  }
});
FURN({
  key: 'zeijani_rope_coils', name: 'Coils of rope', culture: 'zeijani', tier: 'common', type: 'stack', role: 'coils', job: 'ropemaking', setting: 'both',
  rooms: ['shop', 'store', 'yard', 'market', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['rope'],
  w: 0.8, d: 0.8, h: 0.42, variants: 1,
  build: function (F) {
    [[-0.18, -0.18, 0], [0.18, -0.14, 0], [0, 0.18, 0], [0, -0.02, 0.18]].forEach(function (p) {
      F.cyl(p[0], p[2], p[1], 0.2, 0.12, 0, F.shade('ropeHemp', F.rr(-0.1, 0.08)), 'rope');
      F.cyl(p[0], p[2] + 0.11, p[1], 0.1, 0.02, 0, F.shade('ropeHemp', -0.25), 'rope');
    });
    F.blob(0, 0.36, -0.02, 0.18, 0.1, 0, F.col('ropeHemp'), 'rope');
  }
});
FURN({
  key: 'zeijani_masons_banker', name: 'Mason\'s banker with a relief block', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'banker', job: 'masonry', setting: 'both',
  rooms: ['workshop', 'yard', 'shop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'timber', 'metal'],
  w: 1.0, d: 0.8, h: 1.1, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.8, 0.62, 0.6, 0, F.col('tuffDark'), 'stone');
    F.box(0, 0.62, 0, 0.62, 0.45, 0.42, 0, F.col('tuff'), 'stone');
    for (let k = 0; k < 3; k++) F.box(0, 0.68 + k * 0.13, 0.205, 0.5 - k * 0.1, 0.06, 0.03, 0, F.col('tuffRose'), 'stone');
    F.rod(0.3, 0.63, 0.32, 0.45, 0.63, 0.38, 0.04, F.col('timber'), 'wood');
    for (let i = 0; i < 3; i++) F.rod(-0.42 + i * 0.05, 0.63, 0.32, -0.38 + i * 0.05, 0.63, 0.12, 0.008, F.col('copperDark'), 'metal');
    for (let i = 0; i < 5; i++) F.blob(F.rr(-0.48, 0.48), 0.01, F.rr(0.32, 0.38), 0.03, 0.02, 0, F.col('tuff'), 'stone');
  }
});
FURN({
  key: 'zeijani_lampwright_bench', name: 'Lampwright\'s bench', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'lampwright', job: 'lampmaking', setting: 'indoor',
  rooms: ['workshop', 'shop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'ceramic', 'emissive', 'rope', 'food', 'metal'],
  w: 1.5, d: 0.6, h: 1.3, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    for (const x of [-0.68, 0.68]) F.box(x, 0, 0, 0.08, 0.82, 0.55, 0, wd, 'wood');
    F.box(0, 0.82, 0, 1.5, 0.06, 0.6, 0, F.col('timber'), 'wood');
    F.box(0, 0.88, -0.28, 1.5, 0.42, 0.04, 0, wd, 'wood');
    for (let i = 0; i < 5; i++) { F.blob(-0.5 + i * 0.18, 0.92, 0.05, 0.05, 0.05, 0, F.col('clay'), 'ceramic'); }
    F.blob(0.48, 0.98, -0.05, 0.1, 0.2, 0, F.col('clayDark'), 'ceramic');
    for (let i = 0; i < 6; i++) F.rod(0.1 + i * 0.03, 0.88, -0.18, 0.1 + i * 0.03, 1.2, -0.24, 0.006, F.col('linen'), 'rope');
    F.cyl(-0.25, 0.85, -0.12, 0.08, 0.1, 0, F.col('compost'), 'food');
    ZJ_FX.glowCaps(F, -0.25, 0.95, -0.12, 1.5, 5);
    F.box(-0.55, 0.85, -0.12, 0.2, 0.14, 0.14, 0, F.col('copperDark'), 'metal');
  }
});
FURN({
  key: 'zeijani_leather_bench', name: 'Leatherworker\'s bench', culture: 'zeijani', tier: 'common', type: 'workstation', role: 'leather', job: 'tanning', setting: 'indoor',
  rooms: ['workshop', 'shop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'hide', 'bone', 'metal'],
  w: 1.6, d: 0.6, h: 1.6, variants: 1,
  build: function (F) {
    const wd = F.col('timberDark');
    for (const x of [-0.72, 0.72]) F.box(x, 0, 0, 0.08, 0.8, 0.55, 0, wd, 'wood');
    F.box(0, 0.8, 0, 1.6, 0.06, 0.6, 0, F.col('timber'), 'wood');
    F.box(0, 0.86, -0.28, 1.6, 0.74, 0.04, 0, wd, 'wood');
    F.pillow(-0.2, 0.88, 0.04, 0.8, 0.02, 0.45, 0.2, F.col('hide'), 'hide', { puff: 0.15, round: 2.5 });
    for (let i = 0; i < 3; i++) F.rod(0.4 + i * 0.06, 0.87, 0.1, 0.42 + i * 0.06, 0.87, -0.05, 0.008, F.col('bone'), 'bone');
    for (let i = 0; i < 3; i++) { const x = -0.5 + i * 0.5; F.rod(x, 1.45, -0.26, x, 1.45, -0.15, 0.012, F.col('copperDark'), 'metal'); F.box(x, 1.05, -0.2, 0.32, 0.4, 0.06, 0, F.pick(['hide', 'hideDark']), 'hide'); }
  }
});

/* ====================================================================== the sacred */
FURN({
  key: 'zeijani_spirit_mask', name: 'Spirit mask', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'art', role: 'mask', setting: 'indoor',
  rooms: ['kiva', 'shrine', 'hall', 'antechamber', 'cell', 'cottage', 'living', 'tavern'], anchor: 'wall', clearance: {},
  materials: ['timber', 'cloth', 'bone', 'emissive'],
  w: 0.6, d: 0.16, h: 0.95, variants: 3, variantNames: ['a Hidden One', 'the Lamp Mother', 'the Serpent'],
  build: function (F) {
    const v = F.variant, base = F.col(['soot', 'turquoise', 'cinnabar'][v]), y0 = 0.2;
    /* the face: a round mask with rectangular eyes and a straight mouth */
    F.rod(0, y0 + 0.21, -0.08, 0, y0 + 0.21, -0.045, 0.19, base, 'wood');
    for (const x of [-0.08, 0.08]) F.box(x, y0 + 0.22, -0.04, 0.08, 0.04, 0.02, 0, F.col('bone'), 'wood');
    F.box(0, y0 + 0.08, -0.04, 0.16, 0.025, 0.02, 0, F.col('bone'), 'wood');
    /* the tablita: a stepped headdress (cloud terraces) */
    for (let k = 0; k < 3; k++) F.box(0, y0 + 0.42 + k * 0.1, -0.07, 0.56 - k * 0.16, 0.1, 0.02, 0, F.col(['ochre', 'alecap', 'turquoise'][(k + v) % 3]), 'wood');
    /* below: the ruff (gills for the Lamp Mother, scales for the Serpent, a fleece for a Hidden One) */
    if (v === 1) { for (let i = 0; i < 9; i++) F.box(-0.2 + i * 0.05, 0.02, -0.06, 0.02, 0.18, 0.02, 0, F.col('alecapStem'), 'wood'); ZJ_FX.glowCaps(F, 0, y0 + 0.36, 0.0, 0.6, 3); }
    else if (v === 2) { for (let i = 0; i < 5; i++) F.box(-0.16 + i * 0.08, 0.04 + (i % 2) * 0.04, -0.06, 0.07, 0.07, 0.02, 0, F.col('ochre'), 'wood'); }
    else F.pillow(0, 0.1, -0.05, 0.4, 0.04, 0.06, 0, F.col('fleeceDark'), 'cloth', { puff: 0.6 });
    for (const x of [-0.23, 0.23]) F.rod(x, y0 + 0.3, -0.06, x * 1.2, 0.0, -0.06, 0.01, F.col('bone'), 'bone');
  }
});
FURN({
  key: 'zeijani_ancestor_figures', name: 'Ancestor figurines', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'statue', role: 'figurines', setting: 'indoor',
  rooms: ['kiva', 'shrine', 'hall', 'bedroom', 'cell', 'cottage', 'living', 'ossuary'], anchor: 'surface', clearance: {},
  materials: ['stone', 'cloth'],
  w: 0.4, d: 0.16, h: 0.32, variants: 1,
  build: function (F) {
    [[-0.13, 0.24], [0, 0.32], [0.13, 0.22]].forEach(function (p, i) {
      const c = F.pick(['tuff', 'tuffRose', 'basalt']);
      F.frustum(p[0], 0, 0, 0.045, 0.03, p[1] * 0.7, 0, c, 'stone', 6);
      F.ball(p[0], p[1] * 0.78, 0, 0.035, c, 'stone');
      F.box(p[0], p[1] * 0.85, 0, 0.07, 0.04, 0.02, 0, F.col(['ochre', 'alecap', 'turquoise'][i]), 'cloth');
    });
  }
});
FURN({
  key: 'zeijani_prayer_sticks', name: 'Prayer sticks in a stone', culture: 'zeijani', tier: 'common', wealth: [0, 1], type: 'shrine', role: 'prayer_sticks', setting: 'both',
  rooms: ['kiva', 'shrine', 'ossuary', 'cell', 'cottage', 'yard'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['stone', 'timber', 'bone', 'cloth'],
  w: 0.4, d: 0.4, h: 0.9, variants: 1,
  build: function (F) {
    F.blob(0, 0.08, 0, 0.17, 0.16, 0, F.col('basalt'), 'stone');
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6, tx = Math.cos(a) * 0.12, tz = Math.sin(a) * 0.12, hh = F.rr(0.6, 0.85);
      F.rod(Math.cos(a) * 0.03, 0.14, Math.sin(a) * 0.03, tx, hh, tz, 0.01, F.pick(['timberLight', 'ochre', 'turquoise', 'cinnabar']), 'wood');
      F.box(tx * 0.95, hh - 0.08, tz * 0.95, 0.02, 0.08, 0.01, a, F.pick(['bone', 'alecap', 'ochre']), 'cloth');
    }
  }
});
FURN({
  key: 'zeijani_kiva_altar', name: 'Cloud-terrace altar', culture: 'zeijani', tier: 'common', type: 'altar', role: 'altar', setting: 'indoor',
  rooms: ['kiva', 'shrine'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'metal', 'food', 'emissive', 'cloth'],
  w: 1.4, d: 0.8, h: 1.2, variants: 1,
  build: function (F) {
    const t = F.col('tuff');
    for (let k = 0; k < 3; k++) F.box(0, k * 0.22, -0.05 * k, 1.4 - k * 0.36, 0.22, 0.8 - k * 0.15, 0, F.shade(t, -0.04 * k), 'stone');
    F.box(0, 0.66, -0.15, 0.3, 0.3, 0.3, 0, F.col('tuffRose'), 'stone');
    F.box(0, 0.22, 0.395, 1.36, 0.06, 0.01, 0, F.col('cinnabar'), 'cloth');
    /* the spice censer bowl on the top step: red resin smouldering */
    F.cyl(0.42, 0.44, 0.05, 0.12, 0.08, 0, F.col('copper'), 'metal');
    F.blob(0.42, 0.52, 0.05, 0.08, 0.03, 0, F.col('resin'), 'food');
    F.blob(0.42, 0.535, 0.05, 0.05, 0.015, 0, F.col('ember'), 'glow');
    for (const x of [-0.45, -0.3]) { F.frustum(x, 0.44, 0.05, 0.04, 0.025, 0.2, 0, F.col('basalt'), 'stone', 6); F.ball(x, 0.67, 0.05, 0.03, F.col('basalt'), 'stone'); }
    F.blob(0, 1.02, -0.15, 0.1, 0.18, 0, F.col('alecap'), 'food');
    F.lamp(0.42, 0.62, 0.05, 0.35, 4);
  }
});
FURN({
  key: 'zeijani_censer', name: 'Spice censer on a tripod', culture: 'zeijani', tier: 'common', type: 'brazier', role: 'censer', setting: 'indoor',
  rooms: ['kiva', 'shrine', 'hall', 'court', 'ossuary', 'antechamber'], anchor: 'floor', clearance: { front: 0.4, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['metal', 'food', 'emissive'],
  w: 0.5, d: 0.5, h: 1.0, variants: 1,
  build: function (F) {
    const c = F.col('copper');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22, Math.cos(a) * 0.12, 0.7, Math.sin(a) * 0.12, 0.014, F.col('copperDark'), 'metal'); }
    F.frustum(0, 0.68, 0, 0.07, 0.18, 0.15, 0, c, 'metal', 16);
    F.blob(0, 0.83, 0, 0.12, 0.03, 0, F.col('resin'), 'food');
    F.blob(0, 0.845, 0, 0.07, 0.015, 0, F.col('ember'), 'glow');
    F.lamp(0, 0.95, 0, 0.3, 3);
  }
});
FURN({
  key: 'zeijani_drum', name: 'Hide drum on a stand', culture: 'zeijani', tier: 'common', type: 'shrine', role: 'drum', setting: 'both',
  rooms: ['kiva', 'shrine', 'hall', 'barracks', 'yard', 'tavern'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'rope'],
  w: 0.7, d: 0.7, h: 0.8, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3, Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2, 0.02, F.col('timberDark'), 'wood'); }
    F.frustum(0, 0.4, 0, 0.3, 0.32, 0.34, 0, F.col('timber'), 'wood', 16);
    F.cyl(0, 0.74, 0, 0.33, 0.03, 0, F.col('hide'), 'hide');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.rod(Math.cos(a) * 0.32, 0.42, Math.sin(a) * 0.32, Math.cos(a + 0.4) * 0.33, 0.74, Math.sin(a + 0.4) * 0.33, 0.006, F.col('ropeHemp'), 'rope'); }
  }
});
FURN({
  key: 'zeijani_kiva_ladder', name: 'Kiva ladder', culture: 'zeijani', tier: 'common', type: 'ladder', role: 'ladder', setting: 'both',
  rooms: ['kiva', 'cell', 'store', 'yard'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'hide'],
  w: 0.84, d: 1.1, h: 4.2, variants: 1,
  build: function (F) {
    const wd = F.col('timber'), z0 = 0.5, z1 = -0.5;
    for (const x of [-0.32, 0.32]) F.rod(x, 0, z0, x * 1.15, 4.2, z1, 0.045, F.shade(wd, -0.05), 'wood');
    for (let k = 1; k <= 9; k++) {
      const t = k / 10.5, y = 4.2 * t * 0.86, z = z0 + (z1 - z0) * t * 0.86;
      F.rod(-0.34, y, z, 0.34, y, z, 0.022, F.col('timberLight'), 'wood');
      F.cyl(-0.32, y - 0.02, z, 0.05, 0.04, 0, F.col('hideDark'), 'hide');
    }
  }
});
FURN({
  key: 'zeijani_staff_stand', name: 'Ceremonial staffs in a stand', culture: 'zeijani', tier: 'common', type: 'rack', role: 'staffs', setting: 'indoor',
  rooms: ['kiva', 'shrine', 'hall', 'court', 'antechamber'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['stone', 'timber', 'metal', 'bone', 'cloth'],
  w: 0.8, d: 0.3, h: 2.1, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.03, 0.8, 0.2, 0.24, 0, F.col('tuffDark'), 'stone');
    F.box(0, 1.5, -0.13, 0.8, 0.08, 0.04, 0, F.col('timberDark'), 'wood');
    for (let i = 0; i < 4; i++) {
      const x = -0.27 + i * 0.18;
      F.rod(x, 0.2, -0.03, x, 2.0, -0.08, 0.016, F.pick(['timberDark', 'timberLight']), 'wood');
      if (i % 2) F.ball(x, 2.03, -0.08, 0.05, F.col('copper'), 'metal'); else F.cone(x, 2.0, -0.08, 0.04, 0.1, 0, F.col('bone'), 'bone');
      F.box(x, 1.8, -0.06, 0.03, 0.2, 0.01, 0, F.pick(['alecap', 'ochre', 'turquoise']), 'cloth');
    }
  }
});

/* ====================================================================== the dead */
FURN({
  key: 'zeijani_ossuary_box', name: 'Ossuary box', culture: 'zeijani', tier: 'common', type: 'tomb', role: 'ossuary', setting: 'indoor',
  rooms: ['ossuary', 'shrine'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['stone', 'timber'],
  w: 0.7, d: 0.4, h: 0.46, variants: 2, variantNames: ['carved tuff', 'painted timber'],
  build: function (F) {
    const c = F.variant ? F.col('timber') : F.col('tuff'), fam = F.variant ? 'wood' : 'stone';
    F.box(0, 0, 0, 0.7, 0.36, 0.4, 0, c, fam);
    F.box(0, 0.36, 0, 0.72, 0.06, 0.42, 0, F.shade(c, -0.08), fam);
    F.box(0, 0.42, 0, 0.5, 0.04, 0.26, 0, F.shade(c, -0.12), fam);
    for (let k = 0; k < 3; k++) F.box(0, 0.08 + k * 0.08, 0.201, 0.54 - k * 0.14, 0.04, 0.005, 0, F.variant ? F.col(['ochre', 'cinnabar', 'soot'][k]) : F.shade(c, -0.15), fam);
  }
});
FURN({
  key: 'zeijani_mummy_bundle', name: 'Hide-wrapped mummy bundle', culture: 'zeijani', tier: 'common', type: 'tomb', role: 'mummy', setting: 'indoor',
  rooms: ['ossuary'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['hide', 'rope', 'reed'],
  w: 0.7, d: 1.9, h: 0.62, variants: 2, variantNames: ['seated', 'lying'], variantDims: [{ w: 0.7, d: 0.7, h: 0.62 }, { w: 0.6, d: 1.9, h: 0.36 }],
  build: function (F) {
    if (F.variant === 0) {
      F.box(0, 0, 0, 0.66, 0.02, 0.66, 0, F.col('wicker'), 'reed');
      F.blob(0, 0.26, 0, 0.3, 0.5, 0, F.col('hideDark'), 'hide');
      F.ball(0, 0.5, -0.05, 0.12, F.col('hide'), 'hide');
      for (let k = 0; k < 4; k++) F.cyl(0, 0.1 + k * 0.1, 0, 0.29 - Math.abs(k - 1.5) * 0.03, 0.02, 0, F.col('ropeHemp'), 'rope');
    } else {
      F.box(0, 0, 0, 0.6, 0.03, 1.9, 0, F.col('wicker'), 'reed');
      F.pillow(0, 0.17, 0, 0.5, 0.28, 1.76, 0, F.col('hideDark'), 'hide', { puff: 0.9, round: 2.4 });
      for (let k = 0; k < 6; k++) F.box(0, 0.03, -0.7 + k * 0.28, 0.52, 0.31, 0.02, 0, F.col('ropeHemp'), 'rope');
    }
  }
});
FURN({
  key: 'zeijani_bone_stack', name: 'Stacked long bones and skulls', culture: 'zeijani', tier: 'common', type: 'tomb', role: 'bones', setting: 'indoor',
  rooms: ['ossuary'], anchor: 'wall', clearance: { front: 0.4 },
  materials: ['bone', 'stone'],
  w: 1.2, d: 0.5, h: 0.9, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.23, 1.2, 0.9, 0.04, 0, F.col('tuffDark'), 'stone');
    for (let r = 0; r < 4; r++) {
      const y = 0.06 + r * 0.17;
      if (r === 2) { for (let i = 0; i < 7; i++) F.ball(-0.48 + i * 0.16, y + 0.05, 0.12, 0.075, F.pick(['bone', 'boneOld']), 'bone'); continue; }
      for (let i = 0; i < 9; i++) { const x = -0.52 + i * 0.13; F.rod(x, y, -0.18, x, y, 0.2, 0.035, F.pick(['bone', 'boneOld']), 'bone'); F.ball(x, y, 0.2, 0.045, F.col('bone'), 'bone'); }
    }
  }
});
FURN({
  key: 'zeijani_funerary_lamp', name: 'Funerary lamp stand', culture: 'zeijani', tier: 'common', type: 'lamp', role: 'lamp', setting: 'indoor',
  rooms: ['ossuary', 'kiva', 'shrine', 'antechamber'], anchor: 'floor', clearance: {},
  materials: ['stone', 'ceramic', 'emissive'],
  w: 0.4, d: 0.4, h: 1.3, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.17, 0.14, 0.12, 0, F.col('basaltDark'), 'stone', 8);
    F.frustum(0, 0.12, 0, 0.07, 0.06, 1.0, 0, F.col('basalt'), 'stone', 8);
    F.frustum(0, 1.12, 0, 0.07, 0.17, 0.1, 0, F.col('basaltDark'), 'stone', 8);
    F.cyl(0, 1.22, 0, 0.14, 0.03, 0, F.col('clay'), 'ceramic');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; ZJ_FX.flame(F, Math.cos(a) * 0.09, 1.24, Math.sin(a) * 0.09, 0.9, i ? 0 : 0.4); }
  }
});

/* ====================================================================== the scouts and the cistern */
FURN({
  key: 'zeijani_map_table', name: 'Scouts\' map table', culture: 'zeijani', tier: 'common', type: 'table', role: 'table', setting: 'indoor',
  rooms: ['hall', 'study', 'guardroom', 'court', 'barracks'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.6, right: 0.6 },
  materials: ['stone', 'hide', 'rope', 'ceramic', 'emissive'],
  w: 1.8, d: 1.1, h: 0.95, variants: 1,
  build: function (F) {
    const t = F.col('tuff');
    for (const x of [-0.6, 0.6]) F.box(x, 0, 0, 0.3, 0.72, 0.7, 0, F.shade(t, -0.08), 'stone');
    F.box(0, 0.72, 0, 1.8, 0.08, 1.1, 0, t, 'stone');
    F.box(-0.15, 0.8, 0.05, 1.1, 0.01, 0.75, 0.08, F.col('hide'), 'hide');
    F.box(0.45, 0.805, -0.2, 0.6, 0.01, 0.45, -0.2, F.col('hideDark'), 'hide');
    for (const p of [[-0.68, 0.35], [0.38, 0.38], [-0.62, -0.28]]) F.blob(p[0], 0.84, p[1], 0.05, 0.06, 0, F.col('basalt'), 'stone');
    F.cyl(0.7, 0.8, 0.35, 0.1, 0.05, 0, F.col('ropeHemp'), 'rope');
    ZJ_FX.flame(F, 0.7, 0.86, -0.4, 1.2, 0.4);
    F.blob(0.7, 0.82, -0.42, 0.06, 0.05, 0, F.col('clay'), 'ceramic');
  }
});
FURN({
  key: 'zeijani_dipping_frame', name: 'Cistern dipping sweep', culture: 'zeijani', tier: 'common', type: 'well', role: 'well', setting: 'both',
  rooms: ['cistern', 'yard', 'court', 'street'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'stone', 'hide', 'rope'],
  w: 1.4, d: 2.2, h: 2.3, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.75, 0.6, 0.3, 0.6, 0, F.col('tuffDark'), 'stone');
    F.rod(0, 0.3, -0.75, 0, 2.0, -0.75, 0.06, F.col('timberDark'), 'wood');
    F.rod(0, 2.0, -1.05, 0, 2.3, 0.95, 0.04, F.col('timber'), 'wood');
    F.blob(0, 2.04, -1.02, 0.12, 0.18, 0, F.col('basalt'), 'stone');
    F.rod(0, 2.25, 0.92, 0, 0.75, 0.92, 0.008, F.col('ropeHemp'), 'rope');
    F.frustum(0, 0.5, 0.92, 0.12, 0.16, 0.25, 0, F.col('hide'), 'hide', 10);
    for (const x of [-0.62, 0.62]) F.box(x, 0, 0.5, 0.06, 0.4, 0.8, 0, F.col('tuff'), 'stone');
  }
});
