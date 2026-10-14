/* ======================================================================
   Voth furniture: common and court tiers (the harvested Voth street and
   tavern pieces stay in krator-master-furniture.js).
   Influences: Morrowind Dunmer, Aztec, Ottoman. Dark timber and ash-glazed
   stone, stepped-fret bands, pointed finials, lanterns of slate glass, low
   divans; court pieces in gilt on black with the deep purple of the Voth pack
   (core/sockets/80-cultures.js: field #4b2a6e, band #6a4a8f, ink #d8cdb4).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('voth', { name: 'Voth', pack: 'voth', influences: 'Morrowind Dunmer; Aztec; Ottoman',
  materials: 'dark walnut, ash-glazed stone, slate glass, brass; court: gilt, obsidian, plum silk',
  palette: {
    clothVothPurple: 0x4b2a6e, clothVothMauve: 0x6a4a8f, clothAsh: 0xd8cdb4,
    obsidian: 0x1a1a1e, obsidianLight: 0x2c2c34, lacquerBlack: 0x1e1a1a, ceramicAsh: 0x8a8a7a
  } });
/* END PALETTE */
const VOTH_COMMON = {
  emblem: { field: 'clothVothPurple', edge: 'clothVothMauve', band: 'clothVothMauve', ink: 'clothAsh' },
  wood: 'timberWalnut', woodDark: 'stoneEbony', woodLight: 'timberTeak', woodFam: 'wood',
  cloth: ['clothPlum', 'clothIndigo', 'clothTeal', 'clothMud'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'stoneUmber', clayFam: 'ceramic', stone: 'stoneGraphite', stoneFam: 'stone', rope: 'clothKhaki',
  flame: 'flame', ember: 'ember', lampCol: 'glassSlate',
  legs: 'block', motif: 'step', bedBase: 'plank', seat: 'cushion', finial: 'point',
  hearth: 'stone', fire: 'bowl', lamp: 'lantern', rug: 'knotted', screen: 'carved', store: 'jars',
  shelfFill: 'scrolls', rack: 'weapons', art: 'mask', art2: 'relief', statue: 'idol', tapestry: 'diamond',
  canopy: false, board: 'slate'
};
const VOTH_COURT = Object.assign({}, VOTH_COMMON, {
  wood: 'lacquerBlack', woodDark: 'obsidian', woodLight: 'stoneGraphite', woodFam: 'lacquer',
  cloth: ['clothVothPurple', 'clothPlum', 'clothGold', 'clothAsh'],
  accent: 'gilt', accentFam: 'gold', stone: 'obsidianLight', stoneFam: 'obsidian',
  motif: 'step', finial: 'point', statue: 'idol', art: 'relief', art2: 'mask', screen: 'carved', rug: 'knotted'
});
FK.set({ culture: 'voth', tier: 'common', S: VOTH_COMMON, names: {
  bed: 'Walnut bed with a stepped head', bench: 'Canton bench', chair: 'Fretted chair', stool: 'Block stool', table: 'Walnut table',
  low_table: 'Low walnut table', desk: 'Scribe desk', chest: 'Brass-banded chest', bookcase: 'Scroll case', wall_shelves: 'Ash-glaze shelves',
  store: 'Ash-glazed jars', hearth: 'Ashlar hearth', fire: 'Brass fire-bowl', lamp: 'Slate-glass lantern', candle: 'Candle dish',
  hanging: 'Hanging lantern', rug: 'Knotted rug', screen: 'Fretted screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Weaver\'s loom', rack: 'Guard rack', ladder: 'Ladder', board: 'Slate board', art: 'Ancestor mask', bowl: 'Ash-glaze bowl',
  jug: 'Ash-glaze jug and cups', books: 'Scroll cases' } });
FK.set({ culture: 'voth', tier: 'court', S: VOTH_COURT, names: {
  bed: 'Dais bed with a gilt head', throne: 'Councillor\'s seat', divan: 'Great divan', table: 'Council table', low_table: 'Gilt tray table',
  desk: 'Magistrate\'s desk', cabinet: 'Lacquer cabinet', bookcase: 'Great scroll case', hearth: 'Obsidian hearth', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern', candelabra: 'Gilt candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great carpet', screen: 'Gilt fretted screen',
  tapestry: 'Diamond hanging', art: 'Stepped relief', statue: 'Ancestor idol', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'voth_common_ash_niche', name: 'Ancestor niche', culture: 'voth', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'shrine', 'antechamber'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'ceramic', 'metal', 'emissive', 'plaster'],
  w: 0.8, d: 0.4, h: 1.6, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), ash = F.col('ceramicAsh');
    F.box(0, 0, -0.1, 0.8, 1.6, 0.2, 0, st, 'stone');
    F.box(0, 0.6, -0.04, 0.5, 0.7, 0.28, 0, F.shade(st, -0.45), 'stone');        /* the recess */
    for (let i = 0; i < 3; i++) F.box(-0.25 + i * 0.25, 1.36, 0.02, 0.14, 0.1, 0.03, 0, F.shade(st, 0.15), 'stone');
    F.box(0, 0.55, 0, 0.8, 0.05, 0.4, 0, F.shade(st, 0.1), 'stone');              /* the ledge */
    F.frustum(0, 0.6, 0.02, 0.08, 0.13, 0.22, 0, ash, 'ceramic', 10);                 /* the urn */
    F.frustum(0, 0.82, 0.02, 0.13, 0.07, 0.1, 0, F.shade(ash, 0.08), 'ceramic', 10);
    F.cyl(0, 0.92, 0.02, 0.08, 0.04, 0, F.col('brass'), 'metal');
    for (const s of [-1, 1]) { F.cyl(s * 0.22, 0.6, 0.1, 0.02, 0.12, 0, F.col('clothBone'), 'plaster'); F.cone(s * 0.22, 0.72, 0.1, 0.01, 0.04, 0, F.col('flame'), 'glow'); }
    F.lamp(0, 0.9, 0.15, 0.3, 3);
  }
});
FURN({
  key: 'voth_court_armour_stand', name: 'Ordinator armour stand', culture: 'voth', tier: 'court', type: 'rack', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'gold', 'cloth', 'metal'],
  w: 0.7, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    const gilt = F.col('gilt'), wood = F.col('lacquerBlack');
    F.cyl(0, 0, 0, 0.3, 0.06, 0, wood, 'wood');
    F.cyl(0, 0.06, 0, 0.04, 1.4, 0, wood, 'wood');
    F.box(0, 1.0, 0, 0.62, 0.5, 0.3, 0, gilt, 'gold');                               /* cuirass */
    F.box(0, 1.5, 0, 0.5, 0.08, 0.3, 0, F.shade(gilt, -0.1), 'gold');
    for (const s of [-1, 1]) F.frustum(s * 0.28, 1.42, 0, 0.1, 0.06, 0.16, 0, F.shade(gilt, -0.15), 'gold', 8);   /* pauldrons */
    F.ball(0, 1.72, 0, 0.14, gilt, 'gold');                                           /* the mask helm */
    F.box(0, 1.6, 0.1, 0.18, 0.2, 0.06, 0, F.shade(gilt, 0.15), 'gold');
    F.cone(0, 1.86, 0, 0.03, 0.04, 0, F.col('clothVothPurple'), 'cloth');
    F.box(0, 0.4, -0.08, 0.5, 0.62, 0.04, 0, F.col('clothVothPurple'), 'cloth');       /* the skirt of the robe */
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed voth_training_<role> */
FK.set({ culture: 'voth', tier: 'common', roles: 'training', prefix: 'voth_training_', S: VOTH_COMMON, names: {
  training_dummy: 'Cane-wrapped practice post', archery_butt: 'Reed-bundle archery butt' } });

/* trades and households (2026-10-09, for the Voth city plan's canton interiors: settlements/voth,
   targets/voth-city/40-vc-interiors.js): the FK.ROLES.trade pieces in Voth's common style sheet, keyed voth_trade_<role> */
FK.set({ culture: 'voth', tier: 'common', roles: 'trade', prefix: 'voth_trade_', S: VOTH_COMMON, names: {
  forge: 'Ash-brick forge', anvil: 'Anvil on a walnut block', trough: 'Quench trough', stall: 'Beetle stall', hayrack: 'Fodder rack',
  display: 'Wares table', armour_stand: 'Armour stand', weapon_rack: 'Spear and blade rack', vat: 'Dye vat', still: 'Alembic still',
  bin: 'Grain bin', larder: 'Larder', bunk: 'Garrison bunk', locker: 'Walnut locker', lathe: 'Pole lathe', press: 'Screw press',
  kiln: 'Glaze kiln', grindstone: 'Grindstone', altar: 'Ancestor altar', barrel: 'Barrel rack' } });

/* the canton interiors' own pieces (2026-10-09): a bakery's oven, a cell's grate, a tomb's sarcophagus, a catacomb's
   ossuary shelves */
FURN({
  key: 'voth_bread_oven', name: 'Ash-brick bread oven', culture: 'voth', tier: 'common', type: 'stove', role: 'oven', setting: 'indoor',
  rooms: ['kitchen', 'bakery'], anchor: 'wall', clearance: { front: 1.4 },
  materials: ['stone', 'ceramic', 'metal', 'emissive', 'timber'],
  w: 2.6, d: 1.9, h: 2.3, variants: 1,
  build: function (F) {
    const br = F.col('stoneGraphite'), ash = F.col('ceramicAsh'), soot = F.shade(br, -0.6);
    F.box(0, 0, -0.1, 2.6, 0.9, 1.7, 0, F.shade(br, 0.05), 'stone');                      /* the hearth plinth */
    F.frustum(0, 0.9, -0.03, 0.9, 0.62, 1.0, 0, ash, 'ceramic', 12);                       /* the beehive dome, inside the back plane */
    F.ball(0, 1.78, -0.03, 0.5, F.shade(ash, -0.08), 'ceramic');
    F.box(0, 0.95, 0.8, 0.9, 0.62, 0.18, 0, soot, 'stone');                                /* the mouth */
    F.box(0, 1.0, 0.82, 0.7, 0.4, 0.12, 0, F.col('ember'), 'glow');
    F.box(0, 1.6, 0.86, 1.1, 0.14, 0.16, 0, F.shade(br, 0.12), 'stone');                   /* the arch */
    F.cyl(0.5, 1.75, -0.5, 0.14, 0.52, 0, soot, 'stone');                                  /* the flue */
    F.box(-1.05, 0.9, 0.4, 0.5, 0.06, 0.9, 0, F.col('timberWalnut'), 'wood');               /* the peel rest and a peel */
    F.box(-1.05, 0.96, 0.25, 0.32, 0.03, 0.32, 0, F.col('timberWalnut'), 'wood');
    F.lamp(0, 1.0, 0.8, 0.6, 4);
  }
});
FURN({
  key: 'voth_cell_grate', name: 'Cell grate', culture: 'voth', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['cell', 'jail'], anchor: 'wall', clearance: {},
  materials: ['metal', 'stone'],
  w: 2.4, d: 0.25, h: 2.6, variants: 1,
  build: function (F) {
    const iron = F.col('iron'), st = F.col('stoneGraphite');
    F.box(0, 0, 0, 2.4, 0.12, 0.25, 0, st, 'stone');
    F.box(0, 2.48, 0, 2.4, 0.12, 0.25, 0, st, 'stone');
    for (let i = 0; i < 11; i++) F.cyl(-1.1 + i * 0.22, 0.12, 0, 0.025, 2.36, 0, iron, 'metal');
    for (const y of [0.9, 1.7]) F.box(0, y, 0, 2.3, 0.06, 0.08, 0, iron, 'metal');
    F.box(0.55, 1.1, 0.06, 0.12, 0.2, 0.06, 0, F.shade(iron, 0.2), 'metal');                /* the lock */
  }
});
FURN({
  key: 'voth_sarcophagus', name: 'Ancestor sarcophagus', culture: 'voth', tier: 'common', type: 'tomb', setting: 'indoor',
  rooms: ['tomb', 'catacomb', 'shrine'], anchor: 'floor', clearance: { front: 0.8, left: 0.5, right: 0.5 },
  materials: ['stone', 'ceramic', 'metal'],
  w: 1.3, d: 2.6, h: 1.25, variants: 2, variantNames: ['plain', 'effigy'],
  build: function (F) {
    const st = F.col('stoneGraphite'), lid = F.shade(st, 0.12), ash = F.col('ceramicAsh');
    F.box(0, 0, 0, 1.3, 0.2, 2.6, 0, F.shade(st, -0.1), 'stone');                           /* the plinth */
    F.box(0, 0.2, 0, 1.12, 0.72, 2.42, 0, st, 'stone');                                      /* the chest */
    for (let i = 0; i < 4; i++) F.box(0, 0.36 + i * 0.12, 1.22, 1.0, 0.04, 0.02, 0, F.shade(st, 0.18), 'stone');   /* the stepped fret */
    F.box(0, 0.92, 0, 1.24, 0.14, 2.56, 0, lid, 'stone');                                    /* the lid */
    if (F.variant === 1) {
      F.box(0, 1.06, -0.1, 0.5, 0.16, 1.7, 0, F.shade(lid, 0.08), 'stone');                 /* the effigy, lying */
      F.ball(0, 1.12, 0.92, 0.17, F.shade(lid, 0.1), 'stone');
    } else F.frustum(0, 1.06, 0, 0.5, 0.28, 0.14, 0, F.shade(lid, 0.06), 'stone', 4);
    F.frustum(0.42, 1.06, 1.0, 0.07, 0.11, 0.18, 0, ash, 'ceramic', 8);                       /* an urn of ash at its head */
  }
});
FURN({
  key: 'voth_ossuary_shelves', name: 'Ossuary niches', culture: 'voth', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['catacomb', 'tomb', 'shrine'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['stone', 'ceramic', 'plaster'],
  w: 2.4, d: 0.6, h: 2.4, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), ash = F.col('ceramicAsh'), bone = F.col('clothBone');
    F.box(0, 0, -0.05, 2.4, 2.4, 0.5, 0, st, 'stone');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = -0.9 + c * 0.6, y = 0.25 + r * 0.72;
      F.box(x, y, 0.12, 0.46, 0.52, 0.16, 0, F.shade(st, -0.55), 'stone');                  /* a niche */
      if ((r + c) % 3) F.frustum(x, y, 0.16, 0.1, 0.07, 0.24, 0, F.shade(ash, ((r * 4 + c) % 3) * 0.05), 'ceramic', 8);   /* its urn */
      else F.ball(x, y + 0.12, 0.17, 0.11, bone, 'plaster');                                  /* or a skull */
    }
  }
});

/* ---------------------------------------------------------------- small shrines for the parks and the clan courtyards
   (owner, 2026-10-12: "make 3 small tomb size shrines as furniture to distribute around parks that 2-3 people can use at
   a time. Clan compounds can also take this furniture shrine"): each about a sarcophagus's size, `holds` the people who
   can worship at it at once (the Voth city's simulation reads it); role 'yard shrine' (a clan compound's shrine room
   asks for one) */
FURN({
  key: 'voth_shrine_stele', name: 'Ash-saint stele', culture: 'voth', tier: 'common', type: 'shrine', role: 'yard shrine', setting: 'both',
  rooms: ['shrine', 'yard', 'court', 'garden', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0 }, holds: 3,
  materials: ['stone', 'ceramic', 'metal', 'emissive'],
  w: 2.0, d: 1.4, h: 2.5, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), lt = F.shade(st, 0.22), ash = F.col('ceramicAsh');
    F.box(0, 0, -0.1, 2.0, 0.16, 1.2, 0, F.shade(st, -0.1), 'stone');                  /* the stepped base */
    F.box(0, 0.16, -0.25, 1.5, 0.14, 0.8, 0, st, 'stone');
    F.box(0, 0.3, -0.42, 0.9, 1.8, 0.28, 0, lt, 'stone');                              /* the stele */
    F.pyrRoof(0, 2.1, -0.42, 1.0, 0.3, 0.4, 0, lt, 'stone');                            /* its capstone, as deep as the stele */
    F.box(0, 0.85, -0.27, 0.5, 0.8, 0.05, 0, F.shade(st, -0.45), 'stone');             /* the niche */
    F.frustum(0, 0.87, -0.29, 0.1, 0.06, 0.5, 0, F.shade(lt, 0.1), 'stone', 8);        /* the saint */
    F.ball(0, 1.44, -0.29, 0.08, F.shade(lt, 0.14), 'stone');
    for (let i = 0; i < 4; i++) F.box(-0.3 + i * 0.2, 1.84, -0.27, 0.1, 0.07, 0.03, 0, F.col('gilt'), 'metal');   /* the glyphs */
    F.frustum(0, 0.3, 0.18, 0.13, 0.21, 0.18, 0, ash, 'ceramic', 10);                  /* the offering bowl */
    F.ball(0, 0.53, 0.18, 0.07, F.col('ember'), 'glow');
    for (const s of [-1, 1]) F.box(s * 0.62, 0, 0.52, 0.42, 0.1, 0.32, 0, F.shade(st, -0.04), 'stone');   /* two kneeling stones */
  }
});
FURN({
  key: 'voth_shrine_lantern', name: 'Lantern shrine', culture: 'voth', tier: 'common', type: 'shrine', role: 'yard shrine', setting: 'both',
  rooms: ['shrine', 'yard', 'court', 'garden', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0 }, holds: 2,
  materials: ['stone', 'timber', 'cloth', 'emissive', 'roofTile', 'ceramic', 'plaster', 'metal'],
  w: 1.9, d: 1.9, h: 2.7, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), wd = F.col('timberWalnut'), cl = F.col('clothVothPurple');
    F.box(0, 0, 0, 1.7, 0.12, 1.7, 0, F.shade(st, -0.08), 'stone');                   /* the paving */
    for (const x of [-0.72, 0.72]) for (const z of [-0.72, 0.72]) F.box(x, 0.12, z, 0.12, 2.0, 0.12, 0, wd, 'wood');   /* four posts */
    F.pyrRoof(0, 2.12, 0, 1.9, 0.52, 1.9, 0, F.col('lacquerBlack'), 'roof');            /* the little roof */
    F.ball(0, 2.66, 0, 0.07, F.col('gilt'), 'metal');
    F.cyl(0, 0.12, -0.3, 0.13, 0.78, 0, F.shade(st, 0.12), 'stone');                    /* the lantern's column */
    F.box(0, 0.9, -0.3, 0.42, 0.36, 0.42, 0, F.shade(st, 0.2), 'stone');               /* the lantern */
    F.box(0, 0.97, -0.08, 0.22, 0.22, 0.02, 0, F.col('flame'), 'glow');
    F.pyrRoof(0, 1.26, -0.3, 0.56, 0.2, 0.56, 0, F.shade(st, 0.06), 'stone');
    F.box(0, 0.12, 0.38, 1.0, 0.04, 0.56, 0, cl, 'cloth');                             /* the prayer mat */
    F.frustum(0.5, 0.12, -0.35, 0.08, 0.06, 0.15, 0, F.col('ceramicAsh'), 'ceramic', 8);   /* incense */
    F.rod(0.5, 0.27, -0.35, 0.5, 0.47, -0.35, 0.007, F.col('clothBone'), 'plaster');
  }
});
FURN({
  key: 'voth_shrine_urn', name: 'Ancestor urn shrine', culture: 'voth', tier: 'common', type: 'shrine', role: 'yard shrine', setting: 'both',
  rooms: ['shrine', 'yard', 'court', 'garden', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0 }, holds: 3,
  materials: ['stone', 'ceramic', 'metal', 'emissive'],
  w: 1.8, d: 1.8, h: 2.5, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), ash = F.col('ceramicAsh');
    F.cyl(0, 0, 0, 0.9, 0.14, 0, F.shade(st, -0.1), 'stone');                         /* two round steps */
    F.cyl(0, 0.14, 0, 0.72, 0.14, 0, st, 'stone');
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + Math.PI / 6; F.cyl(Math.sin(a) * 0.56, 0.28, Math.cos(a) * 0.56, 0.07, 1.55, 0, F.shade(st, 0.18), 'stone'); }   /* three columns */
    F.cyl(0, 1.83, 0, 0.72, 0.12, 0, F.shade(st, 0.1), 'stone');
    F.dome(0, 1.95, 0, 0.68, 0.46, 0, F.shade(ash, -0.12), 'stone');                   /* the dome */
    F.ball(0, 2.45, 0, 0.06, F.col('gilt'), 'metal');
    F.frustum(0, 0.28, 0, 0.2, 0.3, 0.42, 0, ash, 'ceramic', 12);                      /* the great urn */
    F.frustum(0, 0.7, 0, 0.3, 0.15, 0.24, 0, F.shade(ash, 0.06), 'ceramic', 12);
    F.cyl(0, 0.94, 0, 0.12, 0.05, 0, F.col('brass'), 'metal');
    for (const a of [0.4, 2.1, 4.0]) F.ball(Math.sin(a) * 0.4, 0.32, Math.cos(a) * 0.4, 0.04, F.col('flame'), 'glow');   /* candles on the step */
  }
});
