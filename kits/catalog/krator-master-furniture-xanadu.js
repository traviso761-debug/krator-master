/* ======================================================================
   Xanadu furniture: common and court tiers.
   Influences: Mughal, Yuan dynasty, Tibetan. Rosewood on cabriole legs with
   lozenge inlay, celadon and turquoise tile, lattice (jali) screens, saffron
   and maroon silks with gold bands; the middle class is rich enough for a
   little gold, the court is lacquer and gold throughout. Colours follow the
   Xanadu pack (core/sockets/80-cultures.js: saffron #e89a2a, maroon #7a1a24,
   gold #d8a838, turquoise #1f9aa8).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('xanadu', { name: 'Xanadu', pack: 'xanadu', influences: 'Mughal; Yuan dynasty; Tibetan',
  materials: 'rosewood, celadon, turquoise tile, brass and a little gold; court: red lacquer, gold, jade, marble',
  palette: {
    timberRose: 0x8a4a3a, timberRoseDark: 0x5a2e24, timberRoseLight: 0xa86a52, lacquerRed: 0x9a2020, lacquerBlack: 0x1e1a1a,
    clothSaffron: 0xe89a2a, clothMaroon: 0x7a1a24, clothGoldBand: 0xd8a838, clothTurquoise: 0x1f9aa8, clothIvory: 0xe8dcc0, clothJade: 0x2f8a6a,
    gold: 0xd4af37, goldDark: 0xb08a2a, brass: 0xb08432, jade: 0x3a8a6a, turquoiseStone: 0x2c9aa8, marbleWhite: 0xe8e4dc,
    clayCeladon: 0x9ab8a0, stoneSlate: 0x5a5e62, iron: 0x3a3630, flame: 0xffc861, ember: 0xd9762c, glassSaffron: 0xf0b050,
    /* the Order's house at Longsong (settlements/longsong FURNITURE.md, 2026-10-19): the skylight columns' paint, the chortens'
       lime, the glass of the relic cases, the archive's paper and ink, the map table's crater, the planters, the lead */
    columnRed: 0x9a2a1e, columnBlue: 0x2e5a9c, limeWhite: 0xf0ece0, glassClear: 0xc8dce0, paper: 0xe8dcb8, ink: 0x22201c,
    mapWater: 0x3e6e80, mapLand: 0x6a8a5a, mapOchre: 0xa08050, leaf: 0x4a7a3a, leafDark: 0x2e5a2a, soil: 0x4a3a2a,
    butter: 0xffd890, lead: 0x6a6e72, granite: 0x8a8680, specimen: 0xd8d0b0, bronzeOld: 0x7a6a3a,
    /* the grounds' and the depths' pieces (2026-10-20): the bath's and the fountain's water, the furnace's brick and soot, the seals' wax */
    water: 0x3a6672, brick: 0x8a4a36, soot: 0x2a2624, wax: 0x9a1a1a,
    /* Erewhon's citadel (2026-11-16): the court of Kubla Khan's pieces and the painted stand-ins of its hangings */
    lapis: 0x26449a, peacock: 0x1a6e8a, peacockGreen: 0x2a7a4a, emerald: 0x1e7a52, ruby: 0xa01a2a, pearl: 0xf0ece4,
    ice: 0xd8eef4, iceDeep: 0x8cc4d8, nightBlue: 0x1a2444, silkRose: 0xc85a6a, silkCream: 0xf2e6c8, cypress: 0x2a4a2a,
    marbleVein: 0xcfc8bc, brocade: 0xb88a2c, violet: 0x5a3a6a, umber: 0xa8724e
  } });
/* END PALETTE */
const XAN_COMMON = {
  emblem: { field: 'clothSaffron', edge: 'clothMaroon', band: 'clothGoldBand', ink: 'clothMaroon', ink2: 'clothGoldBand' },
  wood: 'timberRose', woodDark: 'timberRoseDark', woodLight: 'timberRoseLight', woodFam: 'wood',
  cloth: ['clothSaffron', 'clothMaroon', 'clothTurquoise', 'clothIvory'], clothFam: 'cloth',
  accent: 'goldDark', accentFam: 'gold', metal: 'brass', metalFam: 'metal',
  clay: 'clayCeladon', clayFam: 'ceramic', stone: 'stoneSlate', stoneFam: 'stone', rope: 'clothGoldBand', tile: 'turquoiseStone',
  flame: 'flame', ember: 'ember', lampCol: 'glassSaffron',
  legs: 'cabriole', motif: 'lozenge', bedBase: 'plank', seat: 'cushion', finial: 'knob',
  hearth: 'tile', fire: 'bowl', lamp: 'lantern', rug: 'knotted', screen: 'lattice', store: 'jars',
  shelfFill: 'books', rack: 'cloaks', art: 'panel', art2: 'plate', statue: 'vase', tapestry: 'wheel',
  canopy: true, board: 'panel'
};
const XAN_COURT = Object.assign({}, XAN_COMMON, {
  wood: 'lacquerRed', woodDark: 'lacquerBlack', woodLight: 'timberRoseLight', woodFam: 'lacquer',
  cloth: ['clothSaffron', 'clothMaroon', 'clothGoldBand', 'clothJade'],
  accent: 'gold', accentFam: 'gold', stone: 'marbleWhite', stoneFam: 'stone', clay: 'jade', clayFam: 'jade',
  motif: 'lozenge', finial: 'point', statue: 'guardian', screen: 'carved', art: 'panel', art2: 'mosaic'
});
FK.set({ culture: 'xanadu', tier: 'common', S: XAN_COMMON, names: {
  bed: 'Rosewood bed', bench: 'Rosewood bench', chair: 'Cabriole chair', stool: 'Rosewood stool', table: 'Rosewood table',
  low_table: 'Low rosewood table', desk: 'Scholar\'s desk', chest: 'Gold-cornered chest', bookcase: 'Scholar\'s bookcase', wall_shelves: 'Celadon shelves',
  store: 'Celadon jars', hearth: 'Turquoise-tiled stove', fire: 'Brass fire-bowl', lamp: 'Saffron lantern on a stand', candle: 'Butter lamp',
  hanging: 'Hanging saffron lantern', rug: 'Knotted rug', screen: 'Jali screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Robe pegs', ladder: 'Ladder', board: 'Lesson board', art: 'Painted panel', bowl: 'Celadon bowl',
  jug: 'Celadon jug and cups', books: 'Bound books' } });
FK.set({ culture: 'xanadu', tier: 'court', S: XAN_COURT, names: {
  bed: 'Canopied lacquer bed', throne: 'Sultan\'s throne', divan: 'Audience divan', table: 'Lacquer banquet table', low_table: 'Gold tray table',
  desk: 'Vizier\'s lacquer desk', cabinet: 'Gold-inlaid lacquer cabinet', bookcase: 'Great bookcase', hearth: 'Marble hearth', fire: 'Gold fire-bowl',
  lamp: 'Gold lantern on a stand', candelabra: 'Gold candelabra', hanging: 'Hanging gold lantern', carpet: 'Great knotted carpet', screen: 'Carved lacquer screen',
  tapestry: 'Wheel hanging', art: 'Lacquer panel', statue: 'Guardian lion', jug: 'Gold ewer and cups', bowl: 'Jade bowl' } });

FURN({
  key: 'xanadu_common_prayer_wheels', name: 'Row of prayer wheels', culture: 'xanadu', tier: 'common', type: 'shrine', setting: 'both',
  rooms: ['shrine', 'hall', 'antechamber', 'street', 'temple'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'metal', 'gold'],
  w: 1.8, d: 0.4, h: 1.3, variants: 1,
  build: function (F) {
    const wood = F.col('timberRoseDark'), brass = F.col('brass');
    F.box(0, 0, -0.1, 1.8, 0.1, 0.2, 0, wood, 'wood');
    F.box(0, 1.2, -0.1, 1.8, 0.1, 0.2, 0, wood, 'wood');
    F.box(0, 0, -0.18, 1.8, 1.3, 0.04, 0, F.shade(wood, -0.1), 'wood');
    for (let i = 0; i < 5; i++) {
      const x = -0.72 + i * 0.36;
      F.cyl(x, 0.1, 0, 0.012, 1.1, 0, F.col('iron'), 'metal');
      F.cyl(x, 0.4, 0, 0.14, 0.5, F.rr(0, 1), brass, 'metal');
      F.cyl(x, 0.55, 0, 0.145, 0.06, 0, F.col('goldDark'), 'gold');
      F.cyl(x, 0.75, 0, 0.145, 0.06, 0, F.col('goldDark'), 'gold');
      F.box(x, 0.2, 0.14, 0.02, 0.12, 0.03, 0, F.shade(brass, -0.2), 'metal');       /* the knock handle */
    }
  }
});
FURN({
  key: 'xanadu_court_incense_burner', name: 'Gold incense burner', culture: 'xanadu', tier: 'court', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'court', 'shrine', 'bedroom'], anchor: 'surface', clearance: {},
  materials: ['gold', 'emissive', 'lacquer'],
  w: 0.3, d: 0.3, h: 0.4, variants: 1,
  build: function (F) {
    const gold = F.col('gold');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.beam(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1, Math.cos(a) * 0.06, 0.08, Math.sin(a) * 0.06, 0.02, 0.02, gold, 'gold'); }
    F.frustum(0, 0.08, 0, 0.08, 0.14, 0.12, 0, gold, 'gold', 12);
    F.cyl(0, 0.2, 0, 0.145, 0.02, 0, F.shade(gold, -0.1), 'gold');
    F.dome(0, 0.22, 0, 0.13, 0.12, 0, F.shade(gold, 0.1), 'gold');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.ball(Math.cos(a) * 0.09, 0.3, Math.sin(a) * 0.09, 0.015, F.col('lacquerBlack'), 'lacquer'); }
    F.ball(0, 0.36, 0, 0.03, F.col('ember'), 'glow');
    F.cyl(0, 0.34, 0, 0.012, 0.06, 0, F.shade(gold, 0.15), 'gold');
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed xanadu_training_<role> */
FK.set({ culture: 'xanadu', tier: 'common', roles: 'training', prefix: 'xanadu_training_', S: XAN_COMMON, names: {
  training_dummy: 'Gilt practice post', archery_butt: 'Silk-ringed archery target' } });

/* trades and households (FK.ROLES.trade, the 2026-10-19 trades audit) in this culture's style sheet, keyed xanadu_trade_<role> */
FK.set({ culture: 'xanadu', tier: 'common', roles: 'trade', prefix: 'xanadu_trade_', S: XAN_COMMON, names: {
  forge: 'Gilded-hood forge', anvil: 'Anvil on a stone block', trough: 'Carved watering trough', stall: 'Horse stall', hayrack: 'Fodder rack', display: 'Silk-draped display steps', armour_stand: 'Lacquered armour on a stand', weapon_rack: 'Halberd and bow rack', vat: 'Dye vat', still: 'Rice-wine still', bin: 'Grain bins', larder: 'Lacquered larder', bunk: 'Soldier\'s bunk', locker: 'Lacquered locker', lathe: 'Foot-treadle lathe', press: 'Tea and oil press', kiln: 'Porcelain kiln', grindstone: 'Grindstone', altar: 'Household shrine altar', barrel: 'Wine cask cradle' } });
/* the works (FK.ROLES.works): baking, butchery, healing, scribing, shipwrighting, quarrying, customs and dairy pieces, keyed xanadu_works_<role>; skipped here: hull_stocks */
FK.set({ culture: 'xanadu', tier: 'common', roles: 'works', prefix: 'xanadu_works_', S: XAN_COMMON, skip: ['hull_stocks'], names: {
  bread_oven: 'Brick bread oven', butcher_block: 'Butcher\'s block', meat_rack: 'Hanging duck and ham rack', herb_bench: 'Physician\'s herb bench', sickbed: 'Physician\'s sickbed', scribe_desk: 'Scholar\'s writing desk', hull_stocks: 'Barge on its stocks', quarry_block: 'Stonecutter\'s bench', weigh_scale: 'Customs weigh-beam', tally_board: 'Abacus and tally board', churn: 'Butter churn', cheese_press: 'Cheese press' } });

/* ======================================================================
   The Order's house at Longsong (settlements/longsong FURNITURE.md, "Pieces the catalog lacks"; 2026-10-19).
   The Tibetan sacred set the Xanadu sheets lacked: the Assembly Hall's skylight columns and meditation rows, the
   founders' chortens and the altar, the archive's scroll racks, card cabinets and relic cases, the clocks and the
   astronomers' rings, the map table, the debating dais, the great tea copper, the butter-lamp racks, the planters.
   ====================================================================== */
FURN({
  key: 'xanadu_common_skylight_column', name: 'Skylight column', culture: 'xanadu', tier: 'common', type: 'monument', setting: 'indoor',
  rooms: ['assembly', 'hall', 'shrine'], anchor: 'floor', clearance: {},
  materials: ['stone', 'lacquer', 'gold', 'cloth'],
  w: 1.3, d: 1.3, h: 9, variants: 1,
  build: function (F) {
    /* a granite foot, the red lacquered shaft (octagonal) wrapped in a saffron banner at its head, the painted bracket
       capital (blue and gold) carrying the lantern well's beam */
    F.box(0, 0, 0, 1.1, 0.35, 1.1, 0, F.col('granite'), 'stone');
    F.cyl(0, 0.35, 0, 0.36, 7.4, 0, F.col('columnRed'), 'lacquer');
    for (const y of [0.35, 7.45]) F.cyl(0, y, 0, 0.4, 0.12, 0, F.col('gold'), 'gold');
    F.cyl(0, 5.9, 0, 0.42, 1.4, 0, F.col('clothSaffron'), 'cloth');
    F.cyl(0, 6.3, 0, 0.43, 0.14, 0, F.col('clothMaroon'), 'cloth');
    F.box(0, 7.57, 0, 0.9, 0.5, 0.9, 0, F.col('columnBlue'), 'lacquer');
    F.box(0, 8.07, 0, 1.3, 0.38, 0.5, 0, F.col('columnRed'), 'lacquer');
    F.box(0, 8.07, 0, 0.5, 0.38, 1.3, 0, F.col('columnRed'), 'lacquer');
    F.box(0, 8.45, 0, 1.3, 0.55, 1.3, 0, F.col('goldDark'), 'gold');
  }
});
FURN({
  key: 'xanadu_common_meditation_cushion', name: 'Row of meditation cushions', culture: 'xanadu', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['assembly', 'shrine', 'hall', 'stillness'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth'],
  w: 3.2, d: 0.9, h: 0.5, variants: 3, variantDims: [{ w: 3.2, d: 0.9, h: 0.5 }, { w: 3.2, d: 0.9, h: 0.5 }, { w: 0.9, d: 0.9, h: 0.3 }],
  build: function (F) {
    /* a low wooden platform under a maroon felt, four square cushions on it; variant 1 has a low reading table in front;
       variant 2 is one cushion on its own square of felt (the Hall of Stillness) */
    if (F.variant === 2) { F.box(0, 0, 0, 0.9, 0.04, 0.9, 0, F.col('clothMaroon'), 'cloth');
      F.pillow(0, 0.14, 0, 0.66, 0.2, 0.66, 0, F.col('clothSaffron'), 'cloth', { side: 0.4, puff: 0.7, round: 3, pinch: 0.04 }); return; }
    F.box(0, 0, 0, 3.2, 0.16, 0.9, 0, F.col('timberRoseDark'), 'wood');
    F.box(0, 0.16, 0, 3.1, 0.03, 0.84, 0, F.col('clothMaroon'), 'cloth');
    for (let i = 0; i < 4; i++) F.pillow(-1.17 + i * 0.78, 0.25, -0.05, 0.62, 0.12, 0.62, 0, F.col(i % 2 ? 'clothSaffron' : 'clothMaroon'), 'cloth', { side: 0.4, puff: 0.6, round: 3, pinch: 0.04 });
    if (F.variant === 1) for (let i = 0; i < 4; i++) F.box(-1.17 + i * 0.78, 0.19, 0.36, 0.5, 0.3, 0.16, 0, F.col('lacquerRed'), 'wood');
  }
});
FURN({
  key: 'xanadu_common_relic_case', name: 'Relic case on a lacquer stand', culture: 'xanadu', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['shrine', 'founders', 'restoration', 'store', 'hall', 'library'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['lacquer', 'glass', 'gold', 'metal'],
  w: 0.9, d: 0.6, h: 1.55, variants: 2,
  build: function (F) {
    const lac = F.col('lacquerRed');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.38, 0, sz * 0.24, 0.07, 0.85, 0.07, 0, F.col('lacquerBlack'), 'lacquer');
    F.box(0, 0.85, 0, 0.9, 0.08, 0.6, 0, lac, 'lacquer');
    F.box(0, 0.93, 0, 0.84, 0.54, 0.54, 0, F.col('glassClear'), 'glass');
    F.box(0, 1.47, 0, 0.9, 0.08, 0.6, 0, lac, 'lacquer');
    F.box(0, 0.93, 0, 0.3, 0.05, 0.2, 0, F.col('clothSaffron'), 'gold');
    if (F.variant === 1) F.ball(0, 1.08, 0, 0.09, F.col('gold'), 'gold');                 /* a gilt reliquary ball */
    else F.box(0, 0.98, 0, 0.26, 0.16, 0.12, 0, F.col('brass'), 'metal');               /* an instrument of the Ancients */
    F.box(0.32, 1.32, 0.31, 0.12, 0.08, 0.02, 0, F.col('paper'), 'metal');             /* its card */
  }
});
FURN({
  key: 'xanadu_common_scroll_rack', name: 'Scroll rack', culture: 'xanadu', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['library', 'store', 'study', 'archive'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth'],
  w: 1.6, d: 0.45, h: 2.1, variants: 2,
  build: function (F) {
    /* pigeonholes for rolled records, each scroll's end showing its silk tag */
    const wood = F.col('timberRoseDark'), n = 5, m = 7;
    F.box(0, 0, -0.205, 1.6, 2.1, 0.04, 0, F.shade(wood, -0.1), 'wood');
    for (let i = 0; i <= n; i++) F.box(0, i * 2.06 / n, 0, 1.6, 0.04, 0.45, 0, wood, 'wood');
    for (let j = 0; j <= m; j++) F.box(-0.78 + j * 1.56 / m, 0, 0, 0.04, 2.1, 0.45, 0, wood, 'wood');
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const x = -0.78 + (j + 0.5) * 1.56 / m, y = i * 2.06 / n + 0.04, k = (F.variant ? 2 : 1) + ((i * 7 + j) % 2);
      for (let s = 0; s < k; s++) F.rod(x - 0.06 + (s % 2) * 0.12, y + 0.05 + Math.floor(s / 2) * 0.1, -0.18, x - 0.06 + (s % 2) * 0.12, y + 0.05 + Math.floor(s / 2) * 0.1, 0.2, 0.045, F.col('paper'), 'cloth');
      F.box(x, y + 0.02, 0.2, 0.06, 0.08, 0.02, 0, F.col(['clothSaffron', 'clothMaroon', 'clothTurquoise'][(i + j) % 3]), 'cloth');
    }
  }
});
FURN({
  key: 'xanadu_court_card_cabinet', name: 'Catalogue cabinet of small drawers', culture: 'xanadu', tier: 'court', type: 'storage', setting: 'indoor',
  rooms: ['library', 'study', 'archive', 'store'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['lacquer', 'metal', 'cloth'],
  w: 1.4, d: 0.55, h: 1.7, variants: 2,
  build: function (F) {
    const lac = F.col('lacquerRed'), rows = F.variant ? 9 : 7, cols = 5;
    F.box(0, 0, 0, 1.4, 0.12, 0.55, 0, F.col('lacquerBlack'), 'lacquer');
    F.box(0, 0.12, -0.02, 1.36, 1.5, 0.51, 0, lac, 'lacquer');
    F.box(0, 1.62, 0, 1.4, 0.08, 0.55, 0, F.col('lacquerBlack'), 'lacquer');
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const x = -0.54 + j * 0.27, y = 0.17 + i * 1.4 / rows;
      F.box(x, y, 0.245, 0.24, 1.4 / rows - 0.04, 0.02, 0, F.shade(lac, 0.08), 'lacquer');
      F.box(x, y + 0.6 / rows, 0.26, 0.05, 0.03, 0.015, 0, F.col('brass'), 'metal');
      F.box(x, y + 1.0 / rows, 0.256, 0.1, 0.035, 0.005, 0, F.col('paper'), 'cloth');
    }
  }
});
FURN({
  key: 'xanadu_court_chorten', name: 'Reliquary chorten (gilt)', culture: 'xanadu', tier: 'court', type: 'tomb', setting: 'indoor',
  rooms: ['founders', 'shrine', 'hall'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['stone', 'gold', 'cloth'],
  w: 2.4, d: 2.4, h: 4.4, variants: 2,
  build: function (F) {
    /* the stepped throne, the bumpa (the dome where the relics lie, its niche facing out), the harmika, the thirteen
       rings, the parasol and the sun and moon; variant 1 is lime-washed with gilt fittings, variant 0 gilt all over */
    const body = F.col(F.variant ? 'limeWhite' : 'gold'), gold = F.col('gold'), fam = F.variant ? 'stone' : 'gold';
    F.box(0, 0, 0, 2.4, 0.3, 2.4, 0, F.col('granite'), 'stone');
    for (let i = 0; i < 3; i++) F.box(0, 0.3 + i * 0.25, 0, 2.0 - i * 0.28, 0.25, 2.0 - i * 0.28, 0, body, fam);
    F.cyl(0, 1.05, 0, 0.62, 0.12, 0, gold, 'gold');
    F.frustum(0, 1.17, 0, 0.6, 0.72, 0.35, 0, body, fam, 16);
    F.dome(0, 1.52, 0, 0.72, 0.85, 0, body, fam);
    F.box(0, 1.62, 0.6, 0.36, 0.5, 0.14, 0, F.col('lacquerBlack'), 'stone');
    F.box(0, 1.62, 0.66, 0.42, 0.04, 0.12, 0, gold, 'gold');
    F.box(0, 2.3, 0, 0.5, 0.32, 0.5, 0, body, fam);
    F.box(0, 2.62, 0, 0.62, 0.06, 0.62, 0, gold, 'gold');
    F.frustum(0, 2.68, 0, 0.26, 0.1, 1.1, 0, gold, 'gold', 13);
    F.cone(0, 3.78, 0, 0.32, 0.18, 0, gold, 'gold');
    F.cyl(0, 3.96, 0, 0.03, 0.2, 0, gold, 'gold');
    F.ball(0, 4.2, 0, 0.1, gold, 'gold');
    F.box(0, 1.17, 0.66, 0.5, 0.28, 0.04, 0, F.col('clothSaffron'), 'cloth');
  }
});
FURN({
  key: 'xanadu_court_altar', name: 'Altar of the Order', culture: 'xanadu', tier: 'court', type: 'altar', setting: 'indoor',
  rooms: ['shrine', 'founders', 'hall', 'assembly'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['lacquer', 'gold', 'emissive', 'cloth'],
  w: 2.4, d: 0.9, h: 2.0, variants: 1,
  build: function (F) {
    /* three lacquer tiers stepping back, butter lamps in a row on each, the Order's wheel (eight spokes) in gold on the
       back, a saffron cloth over the front */
    const lac = F.col('lacquerRed'), gold = F.col('gold');
    F.box(0, 0, 0, 2.4, 0.8, 0.9, 0, lac, 'lacquer');
    F.box(0, 0.8, -0.15, 2.0, 0.3, 0.6, 0, F.shade(lac, -0.1), 'lacquer');
    F.box(0, 1.1, -0.3, 1.6, 0.25, 0.3, 0, lac, 'lacquer');
    F.box(0, 0.25, 0.455, 2.2, 0.55, 0.01, 0, F.col('clothSaffron'), 'cloth');
    for (const [y, z, n, w] of [[0.8, 0.3, 9, 2.1], [1.1, 0.08, 7, 1.8], [1.35, -0.3, 5, 1.4]]) for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * w / n; F.cyl(x, y, z, 0.05, 0.07, 0, gold, 'gold'); F.ball(x, y + 0.1, z, 0.025, F.col('butter'), 'glow'); }
    const cy = 1.68, R = 0.28;
    for (let k = 0; k < 8; k++) { const a = k * F.TAU / 8; F.beam(0, cy, -0.4, Math.cos(a) * R, cy + Math.sin(a) * R, -0.4, 0.03, 0.03, gold, 'gold'); }
    for (let k = 0; k < 16; k++) { const a = k * F.TAU / 16, b = (k + 1) * F.TAU / 16;
      F.beam(Math.cos(a) * R, cy + Math.sin(a) * R, -0.4, Math.cos(b) * R, cy + Math.sin(b) * R, -0.4, 0.05, 0.05, gold, 'gold'); }
    F.lamp(0, 1.3, 0.2, 0.7, 6);
  }
});
FURN({
  key: 'xanadu_common_water_clock', name: 'Water clock', culture: 'xanadu', tier: 'common', type: 'monument', setting: 'indoor',
  rooms: ['hall', 'study', 'hours'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'bronze', 'metal', 'timber'],
  w: 1.8, d: 1.2, h: 2.8, variants: 1,
  build: function (F) {
    /* four bronze vessels stepping down a stone stair, each dripping into the next; the last holds the float, whose rod
       reads the hours on the board behind it */
    const st = F.col('granite'), br = F.col('bronzeOld');
    for (let i = 0; i < 4; i++) F.box(-0.6 + i * 0.4, 0, 0, 0.4, 2.0 - i * 0.5, 1.0, 0, st, 'stone');
    for (let i = 0; i < 4; i++) { const x = -0.6 + i * 0.4, y = 2.0 - i * 0.5; F.frustum(x, y, 0, 0.14, 0.17, 0.32, 0, br, 'bronze', 14);
      if (i < 3) F.beam(x + 0.14, y + 0.28, 0, x + 0.3, y + 0.1, 0, 0.02, 0.02, F.col('brass'), 'metal'); }
    F.rod(0.6, 0.82, 0, 0.6, 1.9, 0, 0.012, F.col('brass'), 'metal');
    F.box(0.82, 0, -0.45, 0.08, 2.8, 0.3, 0, F.col('timberRoseDark'), 'wood');
    for (let k = 0; k < 12; k++) F.box(0.78, 0.6 + k * 0.18, -0.45, 0.02, 0.02, 0.22, 0, F.col('gold'), 'metal');
  }
});
FURN({
  key: 'xanadu_court_armillary', name: 'Armillary rings and gnomon', culture: 'xanadu', tier: 'court', type: 'statue', setting: 'both',
  rooms: ['study', 'hall', 'observatory', 'roof'], anchor: 'floor', clearance: { front: 0.8, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['bronze', 'stone'],
  w: 1.6, d: 1.6, h: 2.3, variants: 1,
  build: function (F) {
    const br = F.col('bronzeOld'), cy = 1.4, R = 0.7, ring = (tilt, yaw) => {
      const P = []; for (let k = 0; k <= 32; k++) { const a = k * F.TAU / 32, x = Math.cos(a) * R, y = Math.sin(a) * R;
        const y2 = y * Math.cos(tilt), z2 = y * Math.sin(tilt); P.push([x * Math.cos(yaw) - z2 * Math.sin(yaw), cy + y2, x * Math.sin(yaw) + z2 * Math.cos(yaw)]); }
      F.tube(P, 0.025, br, 'bronze'); };
    F.box(0, 0, 0, 1.0, 0.3, 1.0, 0, F.col('granite'), 'stone');
    F.cyl(0, 0.3, 0, 0.12, 0.45, 0, br, 'bronze');
    ring(Math.PI / 2, 0); ring(0, 0); ring(Math.PI / 2, Math.PI / 2); ring(0.41, 0);
    F.rod(0, cy - R - 0.05, -0.2, 0, cy + R + 0.05, 0.2, 0.015, F.col('brass'), 'bronze');
    F.ball(0, cy, 0, 0.07, F.col('gold'), 'bronze');
  }
});
FURN({
  key: 'xanadu_court_map_table', name: 'Map table with the crater inlaid', culture: 'xanadu', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['study', 'library', 'hall', 'council'], anchor: 'floor', clearance: { front: 0.9, back: 0.9, left: 0.9, right: 0.9 },
  materials: ['lacquer', 'stone', 'gold'],
  w: 3.2, d: 2.2, h: 0.95, variants: 1,
  build: function (F) {
    /* the crater of Krator in coloured stone: the ochre rim, the ring sea, the green lands within, the central throne */
    const lac = F.col('lacquerBlack');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 1.45, 0, sz * 0.95, 0.14, 0.85, 0.14, 0, lac, 'lacquer');
    F.box(0, 0.75, 0, 2.9, 0.1, 1.9, 0, F.col('lacquerRed'), 'lacquer');
    F.box(0, 0.85, 0, 3.2, 0.06, 2.2, 0, lac, 'lacquer');
    F.box(0, 0.91, 0, 3.0, 0.02, 2.0, 0, F.col('mapOchre'), 'stone');
    F.cyl(0, 0.93, 0, 0.92, 0.008, 0, F.col('mapWater'), 'stone');
    F.cyl(0, 0.938, 0, 0.66, 0.008, 0, F.col('mapLand'), 'stone');
    F.cyl(0, 0.946, 0, 0.16, 0.004, 0, F.col('granite'), 'stone');
    for (let k = 0; k < 8; k++) { const a = k * F.TAU / 8; F.box(Math.cos(a) * 1.0, 0.93, Math.sin(a) * 0.95, 0.06, 0.012, 0.06, a, F.col('gold'), 'gold'); }
  }
});
FURN({
  key: 'xanadu_common_debate_dais', name: 'Debating dais and the questioner\'s stone', culture: 'xanadu', tier: 'common', type: 'monument', setting: 'both',
  rooms: ['court', 'hall', 'school'], anchor: 'floor', clearance: { front: 2.0 },
  materials: ['stone', 'cloth'],
  w: 3.0, d: 2.4, h: 1.2, variants: 1,
  build: function (F) {
    /* the examiner sits on the dais; the questioner stands at the stone in front of it and claps his point home */
    const st = F.col('granite');
    F.box(0, 0, -0.4, 3.0, 0.45, 1.6, 0, st, 'stone');
    F.box(0, 0.45, -0.6, 2.4, 0.25, 1.0, 0, F.shade(st, 0.08), 'stone');
    F.box(0, 0, 0.55, 1.4, 0.22, 0.3, 0, st, 'stone');
    F.pillow(0, 0.76, -0.6, 0.8, 0.12, 0.7, 0, F.col('clothMaroon'), 'cloth', { side: 0.4, puff: 0.5, round: 3 });
    F.box(0, 0.7, -1.15, 1.2, 0.5, 0.1, 0, F.col('clothSaffron'), 'cloth');
    F.box(0.9, 0, 1.0, 0.4, 0.62, 0.4, 0, F.shade(st, -0.12), 'stone');
  }
});
FURN({
  key: 'xanadu_common_tea_copper', name: 'Great tea copper on its hearth', culture: 'xanadu', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['kitchen', 'hall'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['ceramic', 'metal', 'emissive', 'timber'],
  w: 1.6, d: 1.3, h: 1.9, variants: 1,
  build: function (F) {
    const tile = F.col('turquoiseStone'), cu = F.col('brass');
    F.box(0, 0, 0, 1.6, 0.7, 1.3, 0, tile, 'tile');
    F.box(0, 0.12, 0.62, 0.6, 0.36, 0.04, 0, F.col('lacquerBlack'), 'tile');
    F.ball(0, 0.25, 0.5, 0.14, F.col('ember'), 'glow');
    F.frustum(0, 0.7, 0, 0.5, 0.6, 0.6, 0, cu, 'metal', 18);
    F.dome(0, 1.3, 0, 0.6, 0.25, 0, F.shade(cu, 0.1), 'metal');
    F.cyl(0, 1.55, 0, 0.05, 0.12, 0, F.col('iron'), 'metal');
    F.box(-0.62, 0.7, -0.5, 0.2, 1.2, 0.2, 0, F.col('timberRoseDark'), 'wood');                   /* the churn's stave */
    F.cyl(-0.62, 0.7, -0.5, 0.11, 0.9, 0, F.col('timberRose'), 'wood');
    F.lamp(0, 0.4, 0.6, 0.5, 4);
  }
});
FURN({
  key: 'xanadu_common_specimen_jar', name: 'Specimen jar', culture: 'xanadu', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['restoration', 'store', 'library', 'study'], anchor: 'surface', clearance: {}, surface: false,
  materials: ['glass', 'metal', 'skin'],
  w: 0.24, d: 0.24, h: 0.4, variants: 2,
  build: function (F) {
    F.ell(0, 0.17, 0, 0.06, F.variant ? 0.1 : 0.07, 0.05, F.rr(0, 1), F.col('specimen'), 'skin');
    F.cyl(0, 0, 0, 0.11, 0.34, 0, F.col('glassClear'), 'glass');
    F.cyl(0, 0.34, 0, 0.115, 0.05, 0, F.col('lead'), 'metal');
    F.box(0, 0.12, 0.11, 0.08, 0.06, 0.005, 0, F.col('paper'), 'metal');
  }
});
FURN({
  key: 'xanadu_common_planter', name: 'Celadon planter', culture: 'xanadu', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['hall', 'antechamber', 'court', 'shrine', 'study', 'garden', 'library'], anchor: 'floor', clearance: {},
  materials: ['ceramic', 'foliage'],
  w: 0.8, d: 0.8, h: 1.3, variants: 2,
  build: function (F) {
    F.frustum(0, 0, 0, 0.24, 0.34, 0.5, 0, F.col('clayCeladon'), 'ceramic', 14);
    F.cyl(0, 0.46, 0, 0.36, 0.06, 0, F.col('turquoiseStone'), 'ceramic');
    F.cyl(0, 0.5, 0, 0.32, 0.02, 0, F.col('soil'), 'plant');
    if (F.variant) { for (let k = 0; k < 5; k++) { const a = k * F.TAU / 5 + F.rr(0, 0.4); F.rod(0, 0.5, 0, Math.cos(a) * 0.12, 1.25, Math.sin(a) * 0.12, 0.015, F.col('leafDark'), 'plant');
        F.ell(Math.cos(a) * 0.16, 1.05, Math.sin(a) * 0.16, 0.1, 0.18, 0.08, a, F.col('leaf'), 'plant'); } }
    else F.blob(0, 0.5, 0, 0.38, 0.6, 0, F.col('leaf'), 'plant');
  }
});
FURN({
  key: 'xanadu_common_ancient_clock', name: 'The Ancient clock under glass', culture: 'xanadu', tier: 'common', type: 'statue', setting: 'indoor',
  rooms: ['hall', 'hours', 'study'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'metal', 'glass', 'emissive'],
  w: 1.1, d: 1.1, h: 2.2, variants: 1,
  build: function (F) {
    /* a dull grey case the Ancients made, its face still lit, still keeping a time no one has set, under a glass bell */
    F.box(0, 0, 0, 1.1, 0.9, 1.1, 0, F.col('granite'), 'stone');
    F.box(0, 0.9, 0, 0.6, 0.7, 0.3, 0, F.col('lead'), 'metal');
    F.box(0, 1.0, 0.152, 0.46, 0.46, 0.01, 0, F.col('lacquerBlack'), 'metal');
    F.box(0, 1.15, 0.16, 0.3, 0.1, 0.005, 0, F.col('clothTurquoise'), 'glow');
    F.cyl(0, 0.9, 0, 0.52, 0.9, 0, F.col('glassClear'), 'glass');
    F.dome(0, 1.8, 0, 0.52, 0.38, 0, F.col('glassClear'), 'glass');
  }
});
FURN({
  key: 'xanadu_common_anomaly_instrument', name: 'Instrument of the Eastern Watch', culture: 'xanadu', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['study', 'workshop', 'watch'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['metal', 'glass', 'timber', 'stone'],
  w: 1.0, d: 0.8, h: 1.8, variants: 3,
  build: function (F) {
    /* the needle that should not move (0), the chime (1), the slow pendulum (2): brass, glass and a stone foot */
    const br = F.col('brass');
    F.box(0, 0, 0, 1.0, 0.75, 0.8, 0, F.col('timberRoseDark'), 'wood');
    F.box(0, 0.75, 0, 0.7, 0.08, 0.6, 0, F.col('granite'), 'stone');
    if (F.variant === 0) { F.cyl(0, 0.83, 0, 0.22, 0.3, 0, F.col('glassClear'), 'glass'); F.beam(-0.17, 0.95, 0, 0.17, 0.95, 0.02, 0.012, 0.012, F.col('lacquerRed'), 'metal');
      F.cyl(0, 0.83, 0, 0.24, 0.02, 0, br, 'metal'); }
    else if (F.variant === 1) { F.beam(-0.35, 0.83, 0, -0.35, 1.75, 0, 0.04, 0.04, br, 'metal'); F.beam(0.35, 0.83, 0, 0.35, 1.75, 0, 0.04, 0.04, br, 'metal');
      F.beam(-0.37, 1.75, 0, 0.37, 1.75, 0, 0.05, 0.05, br, 'metal');
      for (let i = 0; i < 5; i++) F.cyl(-0.24 + i * 0.12, 1.75 - 0.25 - i * 0.07, 0, 0.018, 0.25 + i * 0.07, 0, F.shade(br, i * 0.04), 'metal'); }
    else { F.beam(0, 0.83, -0.25, 0, 1.8, -0.25, 0.06, 0.06, br, 'metal'); F.beam(0, 1.78, -0.25, 0, 1.78, 0, 0.04, 0.04, br, 'metal');
      F.rod(0, 1.76, 0, 0.05, 1.05, 0, 0.008, br, 'metal'); F.ball(0.05, 1.02, 0, 0.06, F.col('lead'), 'metal'); }
  }
});
FURN({
  key: 'xanadu_court_name_wall', name: 'The wall of names', culture: 'xanadu', tier: 'court', type: 'monument', setting: 'indoor',
  rooms: ['shrine', 'hall', 'chapel'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['stone', 'gold'],
  w: 3.2, d: 0.2, h: 2.6, variants: 1,
  build: function (F) {
    /* a carved slate panel in a granite frame: the names in gilt rows, the eruption's year over them */
    F.box(0, 0, -0.04, 3.2, 2.6, 0.12, 0, F.col('granite'), 'stone');
    F.box(0, 0.15, 0.02, 2.9, 2.25, 0.04, 0, F.col('stoneSlate'), 'stone');
    F.box(0, 2.15, 0.045, 1.0, 0.12, 0.01, 0, F.col('gold'), 'gold');
    for (let r = 0; r < 14; r++) for (let c = 0; c < 4; c++) F.box(-1.05 + c * 0.7, 0.3 + r * 0.13, 0.045, 0.32 + ((r * 5 + c * 3) % 4) * 0.06, 0.035, 0.008, 0, F.col('goldDark'), 'gold');
  }
});
FURN({
  key: 'xanadu_court_strongbox', name: 'Gold-cornered strongbox', culture: 'xanadu', tier: 'court', type: 'storage', role: 'strongbox', setting: 'indoor',
  rooms: ['study', 'store', 'bedroom', 'library', 'hall'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['lacquer', 'gold', 'metal'],
  w: 0.9, d: 0.55, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.9, 0.62, 0.55, 0, F.col('lacquerRed'), 'lacquer');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.4, 0, sz * 0.23, 0.1, 0.62, 0.1, 0, F.col('gold'), 'gold');
    F.box(0, 0.5, 0, 0.92, 0.04, 0.57, 0, F.col('iron'), 'metal');
    F.box(0, 0.3, 0.28, 0.12, 0.14, 0.01, 0, F.col('brass'), 'metal');
  }
});
FURN({
  key: 'xanadu_common_butter_lamp_rack', name: 'Rack of butter lamps', culture: 'xanadu', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['shrine', 'hall', 'founders', 'antechamber'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'gold', 'emissive'],
  w: 1.8, d: 0.45, h: 1.8, variants: 2,
  build: function (F) {
    /* stepped shelves of brass butter lamps, tended day and night */
    const wood = F.col('timberRoseDark'), n = F.variant ? 4 : 3;
    F.box(0, 0, -0.2, 1.8, 1.8, 0.05, 0, F.shade(wood, -0.15), 'wood');
    for (let i = 0; i < n; i++) { const y = 0.3 + i * 1.3 / n, z = 0.12 - i * 0.08, k = 9;
      F.box(0, 0, z, 1.8, y + 0.04, 0.2, 0, wood, 'wood');
      for (let j = 0; j < k; j++) { const x = -0.8 + j * 1.6 / (k - 1); F.cyl(x, y + 0.04, z, 0.045, 0.06, 0, F.col('gold'), 'gold'); F.ball(x, y + 0.13, z, 0.02, F.col('butter'), 'glow'); } }
    F.lamp(0, 1.0, 0.1, 0.6, 5);
  }
});
FURN({
  key: 'xanadu_court_council_table', name: 'The Council\'s round table', culture: 'xanadu', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['council', 'hall', 'study'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['lacquer', 'gold'],
  w: 4.4, d: 4.4, h: 0.8, variants: 1,
  build: function (F) {
    /* red lacquer on a black drum, the Order's wheel inlaid in gold, eleven places marked round the rim and one left bare */
    F.cyl(0, 0, 0, 1.2, 0.68, 0, F.col('lacquerBlack'), 'lacquer');
    F.cyl(0, 0.68, 0, 2.2, 0.1, 0, F.col('lacquerRed'), 'lacquer');
    F.cyl(0, 0.78, 0, 0.5, 0.01, 0, F.col('gold'), 'gold');
    for (let k = 0; k < 8; k++) { const a = k * F.TAU / 8; F.beam(Math.cos(a) * 0.5, 0.785, Math.sin(a) * 0.5, Math.cos(a) * 1.3, 0.785, Math.sin(a) * 1.3, 0.04, 0.008, F.col('gold'), 'gold'); }
    for (let k = 0; k < 11; k++) { const a = k * F.TAU / 12; F.box(Math.cos(a) * 1.9, 0.78, Math.sin(a) * 1.9, 0.36, 0.01, 0.24, -a, F.col('goldDark'), 'gold'); }
  }
});
/* ======================================================================
   The Order's house at Longsong: the grounds' and the depths' pieces (settlements/longsong FURNITURE.md, "Pieces the
   catalog lacks"; 2026-10-20). The printing house's press and the paper mill's vats and racks, the courtyards' well,
   the quiet cells' lead cases, the unmaking furnace, the bath's pool and basin, the wall fountain, the closed vault's
   sealed crates.
   ====================================================================== */
FURN({
  key: 'xanadu_common_press', name: 'Printing press and woodblock table', culture: 'xanadu', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['printing', 'press', 'bindery'], anchor: 'floor', clearance: { front: 1.0, back: 0.6 },
  materials: ['timber', 'cloth'],
  w: 2.4, d: 1.2, h: 1.1, variants: 2, variantDims: [{ w: 2.4, d: 1.2, h: 1.1 }, { w: 2.4, d: 1.6, h: 1.1 }],
  build: function (F) {
    /* the Tibetan woodblock press: a long low table, the carved block clamped on it (inked black), the printer's roller
       and the dauber, a stack of printed leaves; variant 1 adds the block rack behind (the carved boards on edge) */
    const wood = F.col('timberRose'), dark = F.shade(wood, -0.2), oz = F.variant === 1 ? 0.25 : 0;
    F.box(0, 0.62, oz, 2.4, 0.08, 1.0, 0, wood, 'wood');
    for (const x of [-1.1, 1.1]) for (const z of [-0.42, 0.42]) F.box(x, 0, z + oz, 0.1, 0.62, 0.1, 0, dark, 'wood');
    F.box(-0.3, 0.7, oz, 0.9, 0.08, 0.36, 0, dark, 'wood');
    F.box(-0.3, 0.78, oz, 0.86, 0.006, 0.32, 0, F.col('ink'), 'wood');
    F.rod(0.4, 0.78, oz - 0.2, 0.4, 0.78, oz + 0.2, 0.05, F.shade(wood, 0.1), 'wood');
    F.ball(0.62, 0.78, oz + 0.3, 0.07, F.col('ink'), 'cloth');
    for (let i = 0; i < 6; i++) F.box(0.85, 0.7 + i * 0.012, oz - 0.15, 0.6, 0.008, 0.26, (i % 2) * 0.03, F.col('paper'), 'cloth');
    if (F.variant === 1) {
      F.box(0, 0, -0.62, 2.2, 1.1, 0.3, 0, dark, 'wood');
      for (let i = 0; i < 9; i++) F.box(-0.95 + i * 0.24, 0.12, -0.62, 0.05, 0.9, 0.26, 0, F.shade(wood, 0.05 - (i % 3) * 0.05), 'wood');
    }
  }
});
FURN({
  key: 'xanadu_common_paper_vat', name: 'Paper vat and moulds', culture: 'xanadu', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['paper', 'mill', 'bindery'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'stone', 'glass', 'cloth'],
  w: 2.3, d: 1.1, h: 1.1, variants: 1,
  build: function (F) {
    /* a stone-lined tub of pulp (the daphne bark beaten white), the floating mould on its edge, two more leaning, the
       couching board with a sheet on it */
    const stone = F.col('stoneSlate');
    F.box(0, 0, 0, 1.3, 0.8, 0.9, 0, stone, 'stone');
    F.box(0, 0.8, 0, 1.3, 0.06, 0.9, 0, F.shade(stone, 0.12), 'stone');
    F.box(0, 0.72, 0, 1.12, 0.06, 0.72, 0, F.col('marbleWhite'), 'glass');
    F.box(0.3, 0.86, 0.1, 0.5, 0.04, 0.36, 0.2, F.col('timberRoseLight'), 'wood');
    F.box(0.3, 0.9, 0.1, 0.42, 0.005, 0.3, 0.2, F.col('paper'), 'cloth');
    for (const x of [-0.95, -1.03]) F.box(x, 0, 0.3, 0.04, 0.95, 0.5, 0.25, F.col('timberRose'), 'wood');
    F.box(0.92, 0, -0.2, 0.5, 0.45, 0.5, 0, F.col('timberRoseDark'), 'wood');
    F.box(0.92, 0.45, -0.2, 0.42, 0.01, 0.42, 0, F.col('paper'), 'cloth');
  }
});
FURN({
  key: 'xanadu_common_drying_rack', name: 'Drying rack', culture: 'xanadu', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['paper', 'printing', 'laundry', 'drying'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'cloth', 'rope', 'foliage'],
  w: 2.0, d: 0.6, h: 1.9, variants: 3,
  build: function (F) {
    /* two A-legs and three rails; variant 0 sheets of paper pegged along them, 1 cloths drying (the robes' saffron and
       maroon, a white), 2 bundles of herbs hung head down */
    const wood = F.col('timberRose');
    for (const x of [-0.95, 0.95]) { F.beam(x, 0, -0.28, x, 1.85, 0, 0.06, 0.06, wood, 'wood'); F.beam(x, 0, 0.28, x, 1.85, 0, 0.06, 0.06, wood, 'wood'); }
    const ys = [0.75, 1.25, 1.75];
    for (const y of ys) F.rod(-0.95, y, 0, 0.95, y, 0, 0.022, F.shade(wood, 0.08), 'wood');
    if (F.variant === 0) for (const y of ys) for (let i = 0; i < 6; i++) F.box(-0.75 + i * 0.3, y - 0.36, 0, 0.26, 0.34, 0.006, 0, F.shade(F.col('paper'), (i % 3) * 0.03), 'cloth');
    if (F.variant === 1) { const c = F.cols(['clothSaffron', 'clothMaroon', 'clothIvory']);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 2; i++) F.box(-0.45 + i * 0.9, ys[r] - 0.55, 0, 0.82, 0.54, 0.01, 0, c[(r + i) % 3], 'cloth'); }
    if (F.variant === 2) for (const y of ys) for (let i = 0; i < 7; i++) { const x = -0.78 + i * 0.26; F.rod(x, y, 0, x, y - 0.12, 0, 0.008, F.col('clothGoldBand'), 'rope');
      F.cone(x, y - 0.42, 0, 0.07, 0.3, 0, F.shade(F.col('leaf'), (i % 3) * 0.06 - 0.06), 'plant'); }
  }
});
FURN({
  key: 'xanadu_common_well', name: 'Courtyard well', culture: 'xanadu', tier: 'common', type: 'well', setting: 'outdoor',
  rooms: ['court', 'garden', 'yard', 'street'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 0.8, right: 0.8 },
  materials: ['stone', 'glass', 'timber', 'lacquer', 'roofTile', 'rope', 'metal', 'cloth'],
  w: 2.0, d: 1.8, h: 2.6, variants: 1,
  build: function (F) {
    /* a whitewashed stone ring with a granite coping, two posts and a roofed crossbeam (a prayer flag tied to it), the
       windlass and its bucket */
    F.cyl(0, 0, 0, 0.8, 0.75, 0, F.col('limeWhite'), 'stone');
    F.cyl(0, 0.75, 0, 0.86, 0.1, 0, F.col('granite'), 'stone');
    F.cyl(0, 0.7, 0, 0.6, 0.06, 0, F.col('water'), 'glass');
    const wood = F.col('timberRoseDark');
    for (const x of [-0.85, 0.85]) F.box(x, 0, 0, 0.14, 2.2, 0.14, 0, wood, 'wood');
    F.rod(-0.85, 1.55, 0, 0.85, 1.55, 0, 0.06, F.col('timberRose'), 'wood');
    F.box(0, 2.2, 0, 2.0, 0.08, 0.7, 0, F.col('lacquerRed'), 'lacquer');
    F.pyrRoof(0, 2.28, 0, 2.1, 0.32, 0.8, 0, F.col('goldDark'), 'roof');
    F.rod(0, 1.55, 0, 0, 1.0, 0, 0.01, F.col('clothGoldBand'), 'rope');
    F.frustum(0, 0.82, 0, 0.12, 0.15, 0.22, 0, F.col('brass'), 'metal');
    F.box(0, 1.9, 0.38, 1.4, 0.18, 0.004, 0, F.col('clothSaffron'), 'cloth');
  }
});
FURN({
  key: 'xanadu_common_lead_case', name: 'Lead-lined case on its stone, with its bell', culture: 'xanadu', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['quiet cell', 'vault'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'metal', 'bronze', 'cloth'],
  w: 1.0, d: 0.8, h: 1.6, variants: 1,
  build: function (F) {
    /* a granite block, the grey lead case on it, its lid strapped shut with three bands and sealed in red wax with the
       Order's tag, a small bronze bell on an iron bracket that rings if the lid is lifted */
    F.box(0, 0, 0, 0.95, 0.75, 0.75, 0, F.col('granite'), 'stone');
    F.box(0, 0.75, 0, 0.7, 0.42, 0.52, 0, F.col('lead'), 'metal');
    F.box(0, 1.17, 0, 0.74, 0.06, 0.56, 0, F.shade(F.col('lead'), 0.1), 'metal');
    for (const x of [-0.25, 0, 0.25]) F.box(x, 0.74, 0, 0.05, 0.5, 0.58, 0, F.col('iron'), 'metal');
    F.cyl(0, 0.92, 0.27, 0.05, 0.012, 0, F.col('wax'), 'cloth');
    F.box(0, 0.82, 0.275, 0.12, 0.08, 0.005, 0, F.col('paper'), 'cloth');
    F.beam(0.38, 1.23, 0, 0.38, 1.55, 0, 0.03, 0.03, F.col('iron'), 'metal');
    F.beam(0.38, 1.55, 0, 0.2, 1.55, 0, 0.03, 0.03, F.col('iron'), 'metal');
    F.dome(0.2, 1.38, 0, 0.08, 0.14, 0, F.col('bronzeOld'), 'bronze');
  }
});
FURN({
  key: 'xanadu_common_furnace', name: 'The unmaking furnace and its acid vats', culture: 'xanadu', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['unmaking', 'vault'], anchor: 'wall', clearance: { front: 1.4 },
  materials: ['stone', 'metal', 'ceramic', 'emissive'],
  w: 2.6, d: 1.5, h: 2.6, variants: 1,
  build: function (F) {
    /* a brick kiln with a soot-black mouth and an iron door ajar on the glow, its flue rising to the wall; beside it two
       glazed acid vats with lids and a long iron rake */
    F.box(-0.3, 0, -0.05, 1.8, 1.6, 1.3, 0, F.col('brick'), 'stone');
    F.box(-0.3, 1.6, -0.15, 1.5, 0.3, 1.1, 0, F.shade(F.col('brick'), -0.12), 'stone');
    F.frustum(-0.3, 1.9, -0.3, 0.32, 0.22, 0.7, 0, F.col('soot'), 'stone', 8);
    F.box(-0.3, 0.35, 0.61, 0.7, 0.6, 0.02, 0, F.col('soot'), 'stone');
    F.box(-0.3, 0.4, 0.615, 0.56, 0.48, 0.02, 0, F.col('ember'), 'glow');
    F.box(0.22, 0.38, 0.65, 0.4, 0.52, 0.03, -0.35, F.col('iron'), 'metal');
    for (const z of [-0.3, 0.3]) { F.frustum(0.95, 0, z, 0.24, 0.3, 0.75, 0, F.col('clayCeladon'), 'ceramic', 12); F.cyl(0.95, 0.75, z, 0.31, 0.04, 0, F.shade(F.col('clayCeladon'), -0.15), 'ceramic'); }
    F.rod(0.5, 0.05, 0.62, 0.2, 1.4, 0.62, 0.02, F.col('iron'), 'metal');
    F.lamp(-0.3, 0.7, 0.95, 0.8, 6);
  }
});
FURN({
  key: 'xanadu_court_bath_pool', name: 'Sunken tiled pool', culture: 'xanadu', tier: 'court', type: 'fountain', setting: 'indoor',
  rooms: ['bath'], anchor: 'floor', clearance: { front: 1.2, back: 1.2, left: 1.2, right: 1.2 },
  materials: ['ceramic', 'stone', 'glass', 'gold'],
  w: 6.0, d: 4.0, h: 0.65, variants: 1,
  build: function (F) {
    /* the pool under the bath's dome: a turquoise-tiled rim at the floor, the water a hand below it, a step across one
       end, a gilt lotus spout at the other */
    const tile = F.col('turquoiseStone');
    for (const z of [-1.85, 1.85]) F.box(0, 0, z, 6.0, 0.3, 0.3, 0, tile, 'tile');
    for (const x of [-2.85, 2.85]) F.box(x, 0, 0, 0.3, 0.3, 3.4, 0, tile, 'tile');
    F.box(0, 0.22, 0, 5.4, 0.02, 3.4, 0, F.col('water'), 'glass');
    F.box(-2.45, 0.1, 0, 0.5, 0.12, 3.4, 0, F.col('marbleWhite'), 'stone');
    F.cone(2.85, 0.3, 0, 0.16, 0.22, 0, F.col('gold'), 'gold');
    F.ball(2.85, 0.56, 0, 0.09, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'xanadu_common_bath_basin', name: 'Stone basin', culture: 'xanadu', tier: 'common', type: 'fountain', setting: 'indoor',
  rooms: ['bath', 'laundry', 'court', 'kitchen'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['stone', 'glass', 'metal'],
  w: 0.8, d: 0.8, h: 0.9, variants: 1,
  build: function (F) {
    /* a granite bowl on a squat pedestal, water in it, a brass dipper on its rim */
    F.frustum(0, 0, 0, 0.26, 0.2, 0.55, 0, F.col('granite'), 'stone', 10);
    F.frustum(0, 0.55, 0, 0.28, 0.4, 0.3, 0, F.col('granite'), 'stone', 14);
    F.cyl(0, 0.78, 0, 0.34, 0.02, 0, F.col('water'), 'glass');
    F.rod(0.2, 0.84, 0.1, 0.38, 0.88, 0.2, 0.012, F.col('brass'), 'metal');
    F.ball(0.2, 0.8, 0.1, 0.05, F.col('brass'), 'metal');
  }
});
FURN({
  key: 'xanadu_court_wall_fountain', name: 'Tiled wall fountain', culture: 'xanadu', tier: 'court', type: 'fountain', setting: 'indoor',
  rooms: ['bath', 'court', 'garden', 'hall'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['ceramic', 'stone', 'gold', 'glass'],
  w: 1.4, d: 0.6, h: 2.0, variants: 1,
  build: function (F) {
    /* a turquoise-tiled back under an ogee arch of white marble, a gilt spout, the thin fall of water into a half-round
       basin */
    F.box(0, 0, -0.25, 1.4, 1.8, 0.1, 0, F.col('turquoiseStone'), 'tile');
    F.box(0, 1.8, -0.25, 1.4, 0.2, 0.12, 0, F.col('marbleWhite'), 'stone');
    for (const x of [-0.62, 0.62]) F.box(x, 0, -0.18, 0.16, 1.8, 0.06, 0, F.col('marbleWhite'), 'stone');
    F.cone(0, 1.25, -0.12, 0.06, 0.18, 0, F.col('gold'), 'gold');
    F.beam(0, 1.22, -0.06, 0, 0.5, -0.02, 0.03, 0.01, F.col('water'), 'glass');
    F.frustum(0, 0, 0, 0.24, 0.3, 0.5, 0, F.col('marbleWhite'), 'stone', 16);
    F.cyl(0, 0.46, 0, 0.27, 0.02, 0, F.col('water'), 'glass');
  }
});
FURN({
  key: 'xanadu_common_relic_crate', name: 'Sealed relic crate', culture: 'xanadu', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['vault', 'archive'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'cloth'],
  w: 1.2, d: 0.8, h: 0.8, variants: 3, variantDims: [{ w: 1.2, d: 0.8, h: 0.8 }, { w: 0.8, d: 0.6, h: 0.6 }, { w: 1.8, d: 0.9, h: 0.9 }],
  build: function (F) {
    /* a plank crate banded in iron, its lid nailed down and sealed in red wax across the seam, the register's tag (the
       designation) stencilled on its face; three sizes */
    const D = [{ w: 1.2, d: 0.8, h: 0.8 }, { w: 0.8, d: 0.6, h: 0.6 }, { w: 1.8, d: 0.9, h: 0.9 }][F.variant] || { w: 1.2, d: 0.8, h: 0.8 };
    const wood = F.shade(F.col('timberRose'), 0.08);
    F.box(0, 0, 0, D.w, D.h, D.d, 0, wood, 'wood');
    for (const k of [-0.36, 0.36]) F.box(k * D.w, 0, 0, 0.06, D.h + 0.01, D.d + 0.02, 0, F.col('iron'), 'metal');
    F.box(0, D.h * 0.45, 0, D.w + 0.02, 0.06, D.d + 0.02, 0, F.col('iron'), 'metal');
    F.cyl(0, D.h, D.d / 2 - 0.02, 0.06, 0.015, 0, F.col('wax'), 'cloth');
    F.box(0, D.h * 0.62, D.d / 2 + 0.006, D.w * 0.36, D.h * 0.16, 0.004, 0, F.col('paper'), 'cloth');
    F.box(0, D.h * 0.66, D.d / 2 + 0.009, D.w * 0.26, D.h * 0.05, 0.002, 0, F.col('ink'), 'cloth');
  }
});
/* ======================================================================
   Erewhon's citadel: the Sultan's court in the register of Kubla Khan (settlements/xanadu/citadel/FURNISHING.md, 2026-11-16;
   the owner: "the xanadu citadel desperately needs some fancy furniture"). The stately pleasure-dome in little (the state bed's
   baldachin, the throne's canopy, the gold model on the feast tables), the caves of ice (the sorbet table's grotto), the sinuous
   rills (the salsabil's rippled chute and its rill), the damsel with a dulcimer (the santur, the musicians' dais), Mount Abora
   and the gardens on the hangings; Tibetan massing, Mughal, Turkish and Persian detail (LORE 6.13), gold on everything the
   Sultan touches. The Sultan is carried and very fat: the Great Divan has its own steps, the hoist takes him from bath to bed.
   WALL HANGINGS HANG HIGH (the owner, 2026-11-16: "make sure wall hangings dont wind up near ground"): every hanging here is a
   wall piece that STANDS at the floor and draws its own cloth from its hem up (hem 1.1-1.5 m), never a top-hung cloth that a
   tall room drops toward the floor; settlements/xanadu/citadel/furnish_census.js fails any hanging whose lowest point is under
   1 m. The hangings' pictures are PAINTED STAND-INS (canvas decals) for the generated tapestries owed in
   core/materials/PROMPTS-NEEDED.md section 57; each decal key is its texture id, and each picture keeps the image's aspect
   (2:3, 3:2, 1:1), so a delivered image replaces the painting unstretched: kits/catalog/materials.json "decals" lists all ten,
   tools/textures/pack.py kits/catalog packs each once delivered, and core/catalog's mkDecal shows it on Erewhon and the sheet.
   The rooms lists name the citadel's room kinds (xc_*, kits/interiors/sets/xanadu-citadel.js), which take ONLY the pieces
   that list them (no aliases): the curation of every room is the rooms lists here and the table at the end of this section.
   ====================================================================== */
/* the hangings' pictures, painted on a canvas until the generated tapestries arrive (PROMPTS-NEEDED section 57):
   0 the pleasure-dome above the river Alph, 1 the caves of ice, 2 the damsel with a dulcimer before Mount Abora,
   3 the gardens bright with sinuous rills. g a 2D context, w x h its pixels, P the palette (css strings) */
const XAN_KUBLA_NAMES = ['pleasure-dome', 'caves-of-ice', 'damsel-dulcimer', 'sinuous-rills'];
/* the texture ids: the hangings are 2:3 portrait panels (patterns/xanadu/hanging-*), the great tapestries 3:2 landscape (tapestry-*) */
const XAN_KUBLA_ID = (kind, v) => 'patterns/xanadu/' + kind + '-' + XAN_KUBLA_NAMES[v];
function xanKublaPaint(g, w, h, v, P) {
  const S = Math.min(w, h * 0.667), b = Math.max(4, Math.round(Math.min(w, h) * 0.07)), X = (f) => b * 1.6 + f * (w - b * 3.2), Y = (f) => b * 1.6 + f * (h - b * 3.2);
  g.fillStyle = P.gold; g.fillRect(0, 0, w, h);
  g.fillStyle = P.maroon; g.fillRect(b * 0.4, b * 0.4, w - b * 0.8, h - b * 0.8);
  g.fillStyle = P.gold; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(b * 0.9, b + i * (h - 2 * b) / 11, b * 0.28, 0, 6.283); g.arc(w - b * 0.9, b + i * (h - 2 * b) / 11, b * 0.28, 0, 6.283); g.fill(); }
  const field = [P.night, P.iceDeep, P.night, P.cream][v] || P.night;
  g.fillStyle = field; g.fillRect(b * 1.6, b * 1.6, w - b * 3.2, h - b * 3.2);
  const dome = (cx, cy, r, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx - r, cy); g.quadraticCurveTo(cx - r, cy - r * 1.3, cx, cy - r * 1.7); g.quadraticCurveTo(cx + r, cy - r * 1.3, cx + r, cy); g.fill();
    g.fillRect(cx - r * 1.1, cy, r * 2.2, r * 0.9); g.fillStyle = P.gold; g.fillRect(cx - r * 1.1, cy - r * 0.05, r * 2.2, r * 0.12); g.fillRect(cx - r * 0.04, cy - r * 2.1, r * 0.08, r * 0.45); };
  const river = (y0, y1, wid, col) => { g.strokeStyle = col; g.lineWidth = wid; g.beginPath(); g.moveTo(X(0.5), y0);
    for (let k = 1; k <= 6; k++) { const t = k / 6; g.quadraticCurveTo(X(k % 2 ? 0.15 : 0.85), y0 + (y1 - y0) * (t - 1 / 12), X(0.5), y0 + (y1 - y0) * t); } g.stroke(); };
  const cypress = (cx, cy, s) => { g.fillStyle = P.cypress; g.beginPath(); g.moveTo(cx, cy - s * 2.4); g.quadraticCurveTo(cx + s * 0.5, cy - s, cx, cy); g.quadraticCurveTo(cx - s * 0.5, cy - s, cx, cy - s * 2.4); g.fill(); };
  if (v === 0) {        /* "a stately pleasure-dome decree": the dome on its terrace, walls and towers girdled round, the river below */
    g.fillStyle = P.gold; g.beginPath(); g.arc(X(0.8), Y(0.1), S * 0.05, 0, 6.283); g.fill();
    g.fillStyle = P.wash; g.fillRect(X(0.05), Y(0.48), X(0.95) - X(0.05), h * 0.05);
    for (const f of [0.05, 0.27, 0.73, 0.95]) g.fillRect(X(f) - S * 0.025, Y(0.36), S * 0.05, Y(0.53) - Y(0.36));
    dome(X(0.5), Y(0.42), S * 0.17, P.wash); dome(X(0.5), Y(0.4), S * 0.11, P.turq);
    river(Y(0.56), Y(0.96), Math.max(2, S * 0.05), P.turq);
    for (const f of [0.18, 0.82]) cypress(X(f), Y(0.7), S * 0.06);
    g.fillStyle = P.black; g.beginPath(); g.arc(X(0.5), Y(1), S * 0.12, 3.14, 6.283); g.fill();
  } else if (v === 1) { /* "a sunny pleasure-dome with caves of ice": the dome in sun over arches of ice, icicles hanging */
    g.fillStyle = P.gold; g.beginPath(); g.arc(X(0.5), Y(0.12), S * 0.09, 0, 6.283); g.fill();
    dome(X(0.5), Y(0.38), S * 0.14, P.wash);
    for (let i = 0; i < 3; i++) { const cx = X(0.2 + i * 0.3), r = S * 0.13; g.fillStyle = P.ice; g.beginPath(); g.arc(cx, Y(0.75), r, 3.14, 6.283); g.fill();
      g.fillStyle = P.night; g.beginPath(); g.arc(cx, Y(0.76), r * 0.62, 3.14, 6.283); g.fill();
      g.fillStyle = P.ice; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * r * 0.22 - r * 0.06, Y(0.76) - r * 0.6); g.lineTo(cx + k * r * 0.22 + r * 0.06, Y(0.76) - r * 0.6); g.lineTo(cx + k * r * 0.22, Y(0.76) - r * (0.2 + 0.1 * (k & 1))); g.fill(); } }
    g.fillStyle = P.ice; g.fillRect(X(0), Y(0.76), X(1) - X(0), Y(1) - Y(0.76));
  } else if (v === 2) { /* "a damsel with a dulcimer ... singing of Mount Abora": the mountain under the stars, the maid seated playing */
    g.fillStyle = P.gold; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(X(((i * 37) % 100) / 100), Y(((i * 53) % 40) / 100), Math.max(1, S * 0.008), 0, 6.283); g.fill(); }
    g.fillStyle = P.violet; g.beginPath(); g.moveTo(X(0), Y(0.7)); g.lineTo(X(0.42), Y(0.22)); g.lineTo(X(0.58), Y(0.34)); g.lineTo(X(1), Y(0.72)); g.lineTo(X(1), Y(1)); g.lineTo(X(0), Y(1)); g.fill();
    g.fillStyle = P.wash; g.beginPath(); g.moveTo(X(0.36), Y(0.29)); g.lineTo(X(0.42), Y(0.22)); g.lineTo(X(0.48), Y(0.27)); g.fill();
    g.fillStyle = P.saffron; g.beginPath(); g.ellipse(X(0.5), Y(0.82), S * 0.16, h * 0.08, 0, 0, 6.283); g.fill();
    g.fillStyle = P.rose; g.beginPath(); g.moveTo(X(0.43), Y(0.8)); g.lineTo(X(0.5), Y(0.56)); g.lineTo(X(0.57), Y(0.8)); g.fill();
    g.fillStyle = P.skin; g.beginPath(); g.arc(X(0.5), Y(0.53), S * 0.04, 0, 6.283); g.fill();
    g.fillStyle = P.gold; g.beginPath(); g.moveTo(X(0.36), Y(0.86)); g.lineTo(X(0.64), Y(0.86)); g.lineTo(X(0.6), Y(0.92)); g.lineTo(X(0.4), Y(0.92)); g.fill();
  } else {              /* "gardens bright with sinuous rills, where blossomed many an incense-bearing tree": the chahar bagh */
    g.fillStyle = P.green; for (const fx of [0, 0.55]) for (const fy of [0, 0.55]) g.fillRect(X(fx + 0.02), Y(fy + 0.02), X(0.43) - X(0), Y(0.43) - Y(0));
    g.strokeStyle = P.turq; g.lineWidth = Math.max(2, S * 0.035); g.beginPath(); g.moveTo(X(0.5), Y(0)); g.lineTo(X(0.5), Y(1)); g.moveTo(X(0), Y(0.5)); g.lineTo(X(1), Y(0.5)); g.stroke();
    g.fillStyle = P.turq; g.beginPath(); g.arc(X(0.5), Y(0.5), S * 0.07, 0, 6.283); g.fill();
    g.lineWidth = Math.max(1, S * 0.012); for (const fx of [0.22, 0.78]) for (const fy of [0.22, 0.78]) { g.beginPath(); g.moveTo(X(fx - 0.15), Y(fy));
      for (let k = 1; k <= 4; k++) g.quadraticCurveTo(X(fx - 0.15 + (k - 0.5) * 0.075), Y(fy + (k % 2 ? 0.06 : -0.06)), X(fx - 0.15 + k * 0.075), Y(fy)); g.stroke(); }
    for (const fx of [0.12, 0.32, 0.68, 0.88]) for (const fy of [0.14, 0.62]) cypress(X(fx), Y(fy + 0.2), S * 0.035);
    g.fillStyle = P.rose; for (let i = 0; i < 24; i++) { g.beginPath(); g.arc(X(((i * 29) % 100) / 100), Y(((i * 61) % 100) / 100), Math.max(1, S * 0.012), 0, 6.283); g.fill(); }
  }
}
const XAN_KUBLA_PAL = (F) => ({ gold: F.css(F.col('gold')), maroon: F.css(F.col('clothMaroon')), night: F.css(F.col('nightBlue')), iceDeep: F.css(F.col('iceDeep')),
  ice: F.css(F.col('ice')), cream: F.css(F.col('silkCream')), wash: F.css(F.col('pearl')), turq: F.css(F.col('clothTurquoise')), cypress: F.css(F.col('cypress')),
  black: F.css(F.col('lacquerBlack')), violet: F.css(F.col('violet')), saffron: F.css(F.col('clothSaffron')), rose: F.css(F.col('silkRose')), skin: F.css(F.col('umber')), green: F.css(F.col('peacockGreen')) });
/* a hanging that stands on the floor and hangs its cloth from hem to rod: the rod's brackets carry it at the top (h), the cloth
   (cloth tall) clears the floor by h - cloth - 0.12. o: {w, cloth, design, fringe} */
function xanHangHigh(F, o) {
  const W = o.w, top = o.h, cloth = o.cloth, hem = top - 0.12 - cloth, zb = -o.d / 2;
  F.rod(-W / 2 + 0.06, top - 0.06, zb + 0.06, W / 2 - 0.06, top - 0.06, zb + 0.06, 0.025, F.col('gold'), 'gold');
  for (const s of [-1, 1]) { F.ball(s * (W / 2 - 0.05), top - 0.06, zb + 0.06, 0.045, F.col('gold'), 'gold'); F.box(s * (W / 2 - 0.15), top - 0.14, zb + 0.035, 0.05, 0.14, 0.07, 0, F.col('goldDark'), 'gold'); }
  F.box(0, hem, zb + 0.035, W, cloth, 0.02, 0, F.col('clothMaroon'), 'cloth');
  F.decal(0, hem + 0.05, zb + 0.06, W - 0.1, cloth - 0.1, 0, o.key, o.paint, 'cloth');
  if (o.fringe !== false) for (let i = 0; i < Math.round(W / 0.08); i++) F.box(-W / 2 + 0.04 + i * 0.08, hem - 0.1, zb + 0.035, 0.012, 0.1, 0.012, 0, F.col('gold'), 'gold');
}
FURN({
  key: 'xanadu_court_kubla_hanging', name: 'Hanging of the pleasure-dome (four designs)', culture: 'xanadu', tier: 'court', type: 'banner', role: 'kubla_hanging', setting: 'indoor',
  rooms: ['xc_audience', 'xc_reception', 'xc_dining', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_music', 'xc_study', 'xc_chancery', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_treasury'],
  anchor: 'wall', clearance: {}, materials: ['cloth', 'gold'],
  w: 1.6, d: 0.12, h: 3.7, variants: 4, variantNames: ['the pleasure-dome', 'the caves of ice', 'the damsel with a dulcimer', 'the sinuous rills'], task: [],
  build: function (F) {
    /* the picture 1.5 x 2.25 (2:3), the hem 1.23 m off the floor */
    const v = F.variant | 0, P = XAN_KUBLA_PAL(F);
    xanHangHigh(F, { w: 1.6, d: 0.12, h: 3.7, cloth: 2.35, key: XAN_KUBLA_ID('hanging', v), paint: function (g, cw, ch) { xanKublaPaint(g, cw, ch, v, P); } });
  }
});
FURN({
  key: 'xanadu_court_kubla_tapestry', name: 'Great tapestry of the pleasure-dome (four designs)', culture: 'xanadu', tier: 'court', type: 'banner', role: 'kubla_tapestry', setting: 'indoor',
  rooms: ['xc_audience', 'xc_reception', 'xc_dining', 'xc_dayroom', 'xc_bedchamber', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_music', 'xc_bath'],
  anchor: 'wall', clearance: {}, materials: ['cloth', 'gold'],
  w: 4.0, d: 0.14, h: 4.35, variants: 4, variantNames: ['the pleasure-dome', 'the caves of ice', 'the damsel with a dulcimer', 'the sinuous rills'], task: [],
  build: function (F) {
    /* the picture 3.9 x 2.6 (3:2), the hem 1.53 m off the floor */
    const v = F.variant | 0, P = XAN_KUBLA_PAL(F);
    xanHangHigh(F, { w: 4.0, d: 0.14, h: 4.35, cloth: 2.7, key: XAN_KUBLA_ID('tapestry', v), paint: function (g, cw, ch) { xanKublaPaint(g, cw, ch, v, P); } });
  }
});
FURN({
  key: 'xanadu_court_suzani', name: 'Suzani of blossoms (embroidered hanging)', culture: 'xanadu', tier: 'court', type: 'banner', role: 'suzani', setting: 'indoor',
  rooms: ['xc_harem', 'xc_cage', 'xc_guest', 'xc_family', 'xc_dorm', 'xc_bedchamber', 'xc_dayroom', 'xc_wardrobe', 'xc_chancery', 'xc_study'],
  anchor: 'wall', clearance: {}, materials: ['cloth', 'gold'],
  w: 2.0, d: 0.1, h: 3.3, variants: 2, variantNames: ['ivory ground', 'madder ground'], task: [],
  build: function (F) {
    /* the Central Asian bride's embroidery: great roundels of blossom in madder, saffron and indigo on an ivory (or madder) ground,
       a vine border; the stand-in for patterns/common/suzani-roundels */
    const v = F.variant | 0, ground = F.css(F.col(v ? 'ruby' : 'silkCream')), red = F.css(F.col(v ? 'silkCream' : 'ruby')), sf = F.css(F.col('clothSaffron')), ind = F.css(F.col('lapis')), gr = F.css(F.col('peacockGreen'));
    xanHangHigh(F, { w: 2.0, d: 0.1, h: 3.3, cloth: 2.0, fringe: false, key: 'patterns/common/suzani-roundels' + (v ? '.b' : ''), paint: function (g, w, h) {
      g.fillStyle = ground; g.fillRect(0, 0, w, h); const b = w * 0.08;
      g.strokeStyle = gr; g.lineWidth = Math.max(1, w * 0.012); g.strokeRect(b * 0.5, b * 0.5, w - b, h - b);
      for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? red : sf; g.beginPath(); g.arc(b * 0.5 + (i % 7) * (w - b) / 6, i < 7 ? b * 0.5 : h - b * 0.5, b * 0.3, 0, 6.283); g.fill(); }
      const rows = 3, cols = 2;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const cx = b + (c + 0.5) * (w - 2 * b) / cols, cy = b + (r + 0.5) * (h - 2 * b) / rows, R = Math.min(w / cols, h / rows) * 0.36;
        g.fillStyle = red; g.beginPath(); g.arc(cx, cy, R, 0, 6.283); g.fill();
        g.fillStyle = sf; for (let k = 0; k < 8; k++) { const a = k * 0.785; g.beginPath(); g.arc(cx + Math.cos(a) * R * 0.66, cy + Math.sin(a) * R * 0.66, R * 0.2, 0, 6.283); g.fill(); }
        g.fillStyle = ind; g.beginPath(); g.arc(cx, cy, R * 0.38, 0, 6.283); g.fill(); g.fillStyle = sf; g.beginPath(); g.arc(cx, cy, R * 0.14, 0, 6.283); g.fill(); }
    } });
  }
});
/* ---- seats of state */
FURN({
  key: 'xanadu_court_peacock_throne', name: 'The Peacock Throne of Xanadu', culture: 'xanadu', tier: 'court', type: 'monument', role: 'state_throne', setting: 'indoor',
  rooms: ['xc_audience'], anchor: 'wall', clearance: { front: 2.2, left: 0.6, right: 0.6 },
  materials: ['stone', 'gold', 'cloth', 'jade', 'emissive'],
  w: 4.4, d: 3.4, h: 4.8, variants: 1, task: ['resting'],
  build: function (F) {
    /* three marble steps; the takht, a gilt couch broad enough for the Sultan with bolsters of saffron brocade; behind it the
       peacock's fan, gilt rods spread in an arc each ending in an enamelled eye (peacock blue, emerald, a ruby at the heart); four
       gilt columns carry a little pleasure-dome (white, a gold band, a gold finial) with pearls hung from its rim */
    const gold = F.col('gold'), mar = F.col('marbleWhite');
    for (let i = 0; i < 3; i++) F.box(0, i * 0.18, -0.2 + i * 0.25, 4.4 - i * 0.5, 0.18, 3.0 - i * 0.5, 0, F.shade(mar, -i * 0.03), 'stone');
    F.box(0, 0.54, -0.55, 3.2, 0.36, 1.7, 0, gold, 'gold');
    F.box(0, 0.9, -0.55, 3.0, 0.16, 1.55, 0, F.col('clothSaffron'), 'cloth');
    for (const s of [-1, 1]) { F.box(s * 1.55, 0.88, -0.55, 0.14, 0.52, 1.66, 0, gold, 'gold'); F.bolster(s * 1.2, 1.18, -0.4, 0.5, 0.14, Math.PI / 2, F.col('ruby'), 'cloth'); }
    F.bolster(0, 1.2, -1.2, 2.6, 0.2, 0, F.col('clothSaffron'), 'cloth');
    for (let k = 0; k < 15; k++) { const a = -1.25 + k * (2.5 / 14), x = Math.sin(a) * 1.5, y = 1.2 + Math.cos(a) * 1.5;
      F.rod(0, 1.3, -1.45, x, y, -1.5, 0.018, gold, 'gold'); F.ball(x, y, -1.5, 0.11, F.col(k % 2 ? 'emerald' : 'peacock'), 'jade'); F.ball(x, y, -1.42, 0.05, F.col('lapis'), 'jade'); }
    F.ball(0, 1.75, -1.42, 0.16, F.col('ruby'), 'jade');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.cyl(sx * 1.75, 0.54, -0.55 + sz * 1.0, 0.08, 2.9, 0, gold, 'gold'); F.ball(sx * 1.75, 0.54, -0.55 + sz * 1.0, 0.12, gold, 'gold'); }
    F.box(0, 3.44, -0.55, 3.8, 0.18, 2.3, 0, gold, 'gold');
    F.box(0, 3.62, -0.55, 3.4, 0.12, 2.0, 0, F.col('pearl'), 'stone');
    F.dome(0, 3.74, -0.55, 0.95, 0.85, 0, F.col('pearl'), 'stone');
    F.cyl(0, 3.74, -0.55, 0.97, 0.08, 0, gold, 'gold');
    F.cone(0, 4.55, -0.55, 0.07, 0.25, 0, gold, 'gold');
    for (let i = 0; i < 18; i++) { const x = -1.8 + i * (3.6 / 17); for (const z of [0.6, -1.7]) F.rod(x, 3.44, z, x, 3.2, z, 0.006, F.col('pearl'), 'stone'); }
  }
});
FURN({
  key: 'xanadu_court_great_divan', name: 'The Great Divan (a reinforced gilt couch with its own steps)', culture: 'xanadu', tier: 'court', type: 'monument', role: 'great_divan', setting: 'indoor',
  rooms: ['xc_feast', 'xc_bedchamber', 'xc_dayroom', 'xc_loggia', 'xc_bath'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['lacquer', 'gold', 'cloth', 'stone'],
  w: 3.6, d: 2.0, h: 1.7, variants: 1, task: ['resting'],
  build: function (F) {
    /* a deep couch on eight squat gilt legs braced with iron, a quilted mattress of saffron and maroon brocade, a long bolster at
       the back and round ones at the ends, two broad marble steps in front of it; a gilt back-board cut in a cusped arch */
    const gold = F.col('gold');
    for (const x of [-1.6, -0.55, 0.55, 1.6]) for (const z of [-0.85, 0.35]) F.cyl(x, 0, z - 0.1, 0.11, 0.42, 0, gold, 'gold');
    F.box(0, 0.42, -0.25, 3.5, 0.2, 1.5, 0, F.col('lacquerRed'), 'lacquer');
    F.box(0, 0.62, -0.25, 3.4, 0.08, 1.45, 0, gold, 'gold');
    F.pillow(0, 0.8, -0.25, 3.3, 0.24, 1.4, 0, F.col('clothSaffron'), 'cloth', { side: 0.5, puff: 0.4, round: 6 });
    F.box(0, 0.6, -0.93, 3.46, 1.1, 0.12, 0, gold, 'gold');
    F.bolster(0, 1.05, -0.8, 3.0, 0.2, 0, F.col('clothMaroon'), 'cloth');
    for (const s of [-1, 1]) F.bolster(s * 1.5, 1.05, -0.25, 1.2, 0.17, Math.PI / 2, F.col('clothMaroon'), 'cloth');
    F.box(0, 0, 0.72, 2.0, 0.2, 0.56, 0, F.col('marbleWhite'), 'stone');
    F.box(0, 0.2, 0.62, 1.6, 0.18, 0.36, 0, F.col('marbleWhite'), 'stone');
  }
});
FURN({
  key: 'xanadu_court_masnad', name: 'Masnad: a carpeted platform with bolsters', culture: 'xanadu', tier: 'court', type: 'seating', role: 'masnad', setting: 'both',
  rooms: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_music', 'xc_study', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_court'],
  anchor: 'wall', clearance: { front: 0.9 }, materials: ['timber', 'cloth', 'gold'],
  w: 2.8, d: 1.1, h: 0.8, variants: 3, variantNames: ['saffron', 'turquoise', 'rose'], task: ['resting', 'socializing'],
  build: function (F) {
    /* the Mughal floor seat along a wall: a low platform under a knotted cover, a mattress, the gao takia (the big round back
       bolster) and two side cushions; three colours */
    const c = F.col(['clothSaffron', 'clothTurquoise', 'silkRose'][F.variant | 0] || 'clothSaffron');
    F.box(0, 0, 0, 2.8, 0.16, 1.1, 0, F.col('timberRoseDark'), 'wood');
    F.box(0, 0.16, 0, 2.8, 0.02, 1.1, 0, F.col('clothMaroon'), 'cloth');
    F.box(0, 0.15, 0.545, 2.82, 0.05, 0.03, 0, F.col('gold'), 'gold');
    F.pillow(0, 0.27, 0.05, 2.6, 0.16, 0.85, 0, c, 'cloth', { side: 0.5, puff: 0.4, round: 6 });
    F.bolster(0, 0.5, -0.34, 2.5, 0.2, 0, F.shade(c, -0.15), 'cloth');
    for (const s of [-1, 1]) F.pillow(s * 1.15, 0.5, -0.05, 0.4, 0.38, 0.5, 0, F.col('clothGoldBand'), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
  }
});
FURN({
  key: 'xanadu_court_floor_cushions', name: 'Floor cushions and a bolster', culture: 'xanadu', tier: 'court', type: 'seating', role: 'cushions', setting: 'both',
  rooms: ['xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_music', 'xc_reception', 'xc_divan', 'xc_loggia', 'xc_court'],
  anchor: 'floor', clearance: {}, materials: ['cloth', 'gold'],
  w: 1.3, d: 0.9, h: 0.55, variants: 2, task: ['resting', 'socializing'],
  build: function (F) {
    /* two square cushions of brocade and a round bolster, gold tassels at the corners: drawn up to a low table at a feast */
    const a = F.col(F.variant ? 'clothTurquoise' : 'clothMaroon'), b = F.col(F.variant ? 'clothSaffron' : 'silkRose');
    F.pillow(-0.3, 0.09, 0.05, 0.65, 0.18, 0.65, 0.1, a, 'cloth', { side: 0.4, puff: 0.6, round: 4 });
    F.pillow(0.33, 0.09, 0.08, 0.6, 0.18, 0.6, -0.15, b, 'cloth', { side: 0.4, puff: 0.6, round: 4 });
    F.bolster(0, 0.32, -0.3, 1.1, 0.13, 0, F.col('clothGoldBand'), 'cloth');
    for (const x of [-0.6, 0.6]) F.ball(x, 0.32, -0.3, 0.03, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'xanadu_court_dining_couch', name: 'Gilt dining couch and its tray tables', culture: 'xanadu', tier: 'court', type: 'seating', role: 'dining_couch', setting: 'indoor',
  rooms: ['xc_feast'], anchor: 'floor', clearance: { front: 0.9 }, materials: ['lacquer', 'gold', 'cloth', 'metal', 'jade'],
  w: 2.4, d: 1.5, h: 0.95, variants: 2, task: ['eating', 'resting'],
  build: function (F) {
    /* a low gilt couch with a curled head, a brocade cover and cushions, and in front of it two tray tables of beaten gold on
       folding lacquer stands, a ewer and a dish on each */
    const gold = F.col('gold');
    for (const x of [-1.05, 1.05]) for (const z of [-0.6, 0.0]) F.cyl(x, 0, z, 0.06, 0.3, 0, gold, 'gold');
    F.box(0, 0.3, -0.3, 2.3, 0.14, 0.75, 0, F.col('lacquerRed'), 'lacquer');
    F.pillow(0, 0.5, -0.3, 2.2, 0.14, 0.7, 0, F.col(F.variant ? 'clothTurquoise' : 'clothSaffron'), 'cloth', { side: 0.5, puff: 0.4, round: 6 });
    F.box(-1.1, 0.44, -0.3, 0.12, 0.5, 0.75, 0, gold, 'gold'); F.bolster(-0.9, 0.7, -0.3, 0.6, 0.13, Math.PI / 2, F.col('clothMaroon'), 'cloth');
    for (const x of [-0.6, 0.6]) {
      F.beam(x - 0.2, 0, 0.43, x + 0.2, 0.4, 0.43, 0.03, 0.03, F.col('lacquerBlack'), 'lacquer'); F.beam(x + 0.2, 0, 0.47, x - 0.2, 0.4, 0.47, 0.03, 0.03, F.col('lacquerBlack'), 'lacquer');
      F.cyl(x, 0.4, 0.45, 0.3, 0.03, 0, gold, 'gold'); F.cyl(x, 0.43, 0.45, 0.27, 0.01, 0, F.shade(gold, 0.15), 'gold');
      F.frustum(x - 0.1, 0.44, 0.4, 0.06, 0.03, 0.2, 0, gold, 'gold', 10); F.cyl(x + 0.1, 0.44, 0.5, 0.1, 0.03, 0, F.col('jade'), 'jade');
    }
  }
});
/* ---- tables and the caves of ice */
FURN({
  key: 'xanadu_court_sorbet_table', name: 'Sorbet table with the caves of ice', culture: 'xanadu', tier: 'court', type: 'table', role: 'sorbet_table', setting: 'indoor', surface: false,
  rooms: ['xc_feast'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.6, right: 0.6 }, materials: ['stone', 'glass', 'gold', 'ceramic'],
  w: 2.6, d: 1.2, h: 1.35, variants: 1, task: ['eating'],
  build: function (F) {
    /* a white marble slab on gilt lion feet; let into it four ice wells (snow from the mountains, packed in straw below) with the
       sorbets in jade and celadon cups, and at its heart a grotto carved of ice: a cave mouth under three frozen arches, icicles,
       a gilt dome set on its crown (the sunny dome on its caves of ice) */
    const gold = F.col('gold'), ice = F.col('ice');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.cyl(sx * 1.1, 0, sz * 0.45, 0.08, 0.72, 0, gold, 'gold'); F.ball(sx * 1.1, 0.1, sz * 0.45, 0.1, gold, 'gold'); }
    F.box(0, 0.72, 0, 2.6, 0.1, 1.2, 0, F.col('marbleWhite'), 'stone');
    F.box(0, 0.7, 0, 2.62, 0.03, 1.22, 0, gold, 'gold');
    for (const x of [-0.95, -0.55, 0.55, 0.95]) { F.cyl(x, 0.79, 0, 0.17, 0.04, 0, F.col('iceDeep'), 'glass'); F.cyl(x, 0.82, 0, 0.13, 0.03, 0, ice, 'glass');
      F.frustum(x, 0.85, 0.02, 0.05, 0.07, 0.08, 0, F.col(x < 0 ? 'jade' : 'clayCeladon'), 'ceramic', 10); }
    F.frustum(0, 0.82, 0, 0.36, 0.22, 0.3, 0, ice, 'glass', 12);
    for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; F.box(Math.sin(a) * 0.3, 0.815, Math.cos(a) * 0.3, 0.16, 0.195 + i * 0.012, 0.06, a, F.col('nightBlue'), 'stone'); }
    for (let i = 0; i < 9; i++) { const a = i * 0.7; F.cone(Math.cos(a) * 0.26, 0.98, Math.sin(a) * 0.26, 0.025, -0.12, 0, ice, 'glass'); }
    F.cyl(0, 1.12, 0, 0.16, 0.06, 0, F.col('pearl'), 'stone'); F.dome(0, 1.18, 0, 0.15, 0.13, 0, gold, 'gold'); F.cone(0, 1.31, 0, 0.02, 0.05, 0, gold, 'gold');
  }
});
FURN({
  key: 'xanadu_court_dome_model', name: 'The sunny dome on its caves of ice (a gold model)', culture: 'xanadu', tier: 'court', type: 'statue', role: 'dome_model', setting: 'indoor',
  rooms: ['xc_feast', 'xc_dayroom', 'xc_audience', 'xc_reception', 'xc_harem', 'xc_bedchamber', 'xc_gifts', 'xc_treasury'], anchor: 'surface', clearance: {},
  materials: ['gold', 'glass', 'stone', 'jade'], w: 0.5, d: 0.5, h: 0.6, variants: 1, task: [],
  build: function (F) {
    /* the Sultan's toy: a crystal mound hollowed into ice caves, on it a ring of tiny gilt walls and towers, the dome of white
       jade and gold at its centre */
    F.frustum(0, 0, 0, 0.24, 0.16, 0.18, 0, F.col('ice'), 'glass', 12);
    for (let i = 0; i < 4; i++) { const a = i * 1.571; F.box(Math.sin(a) * 0.2, 0.0, Math.cos(a) * 0.2, 0.08, 0.1, 0.03, a, F.col('nightBlue'), 'stone'); }
    F.cyl(0, 0.18, 0, 0.17, 0.04, 0, F.col('gold'), 'gold');
    for (let i = 0; i < 8; i++) { const a = i * 0.785; F.cyl(Math.cos(a) * 0.15, 0.22, Math.sin(a) * 0.15, 0.015, 0.07, 0, F.col('gold'), 'gold'); }
    F.cyl(0, 0.22, 0, 0.08, 0.1, 0, F.col('pearl'), 'stone'); F.dome(0, 0.32, 0, 0.08, 0.12, 0, F.col('pearl'), 'jade'); F.cone(0, 0.44, 0, 0.012, 0.08, 0, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'xanadu_court_nard_table', name: 'Nard board on a low table, with its cushions', culture: 'xanadu', tier: 'court', type: 'table', role: 'nard_table', setting: 'indoor', surface: false,
  rooms: ['xc_dayroom', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_family', 'xc_loggia'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['lacquer', 'gold', 'cloth', 'bone', 'timber'], w: 1.1, d: 1.9, h: 0.45, variants: 1, task: ['socializing'],
  build: function (F) {
    /* the game of the princes in their cage: a low lacquer table with the open nard board (inlaid points of ivory and lapis),
       the gold and jade men, a cushion each side */
    F.box(0, 0, 0, 0.8, 0.3, 0.7, 0, F.col('lacquerBlack'), 'lacquer');
    F.box(0, 0.3, 0, 0.74, 0.05, 0.6, 0, F.col('timberRoseLight'), 'wood');
    for (let i = 0; i < 12; i++) { const x = -0.33 + (i % 6) * 0.055 + (i >= 6 ? 0.36 : 0); for (const z of [-1, 1]) F.box(x, 0.35, z * 0.17, 0.035, 0.004, 0.22, 0, F.col(i % 2 ? 'lapis' : 'pearl'), 'bone'); }
    for (let i = 0; i < 6; i++) F.cyl(-0.2 + i * 0.08, 0.35, (i % 2 ? 0.2 : -0.2), 0.02, 0.012, 0, F.col(i % 2 ? 'gold' : 'jade'), 'gold');
    for (const z of [-0.65, 0.65]) F.pillow(0, 0.1, z, 0.6, 0.2, 0.55, 0, F.col(z < 0 ? 'clothSaffron' : 'silkRose'), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
  }
});
/* ---- light and scent */
FURN({
  key: 'xanadu_court_censer', name: 'Standing censer of pierced gold', culture: 'xanadu', tier: 'court', type: 'brazier', role: 'censer', setting: 'both',
  rooms: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_music', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_court', 'xc_study'],
  anchor: 'floor', clearance: { front: 0.3, back: 0.3, left: 0.3, right: 0.3 }, materials: ['gold', 'emissive', 'bronze'],
  w: 0.6, d: 0.6, h: 1.65, variants: 1, task: [],
  build: function (F) {
    /* "where blossomed many an incense-bearing tree": a tripod of lion legs, a tall stem, the bowl pierced in a jali of stars, a
       domed lid with a bird on it; the coals glow through the piercing */
    const gold = F.col('gold');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.beam(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26, Math.cos(a) * 0.06, 0.45, Math.sin(a) * 0.06, 0.04, 0.04, gold, 'gold'); F.ball(Math.cos(a) * 0.26, 0.04, Math.sin(a) * 0.26, 0.05, gold, 'gold'); }
    F.cyl(0, 0.45, 0, 0.04, 0.6, 0, F.col('goldDark'), 'gold'); F.ball(0, 0.8, 0, 0.07, gold, 'gold');
    F.frustum(0, 1.05, 0, 0.12, 0.24, 0.22, 0, gold, 'gold', 16);
    F.cyl(0, 1.1, 0, 0.17, 0.12, 0, F.col('ember'), 'glow');
    F.dome(0, 1.27, 0, 0.24, 0.24, 0, F.shade(gold, 0.1), 'gold');
    for (let i = 0; i < 8; i++) { const a = i * 0.785; F.ball(Math.cos(a) * 0.2, 1.36, Math.sin(a) * 0.2, 0.03, F.col('ember'), 'glow'); }
    F.ball(0, 1.55, 0, 0.06, gold, 'gold'); F.cone(0.03, 1.58, 0, 0.03, 0.06, 0, gold, 'gold');
  }
});
FURN({
  key: 'xanadu_court_great_chandelier', name: 'Great chandelier of pierced lanterns', culture: 'xanadu', tier: 'court', type: 'lamp', role: 'chandelier', setting: 'indoor',
  rooms: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_divan', 'xc_hall', 'xc_bath', 'xc_bedchamber', 'xc_gifts', 'xc_music', 'xc_loggia'], anchor: 'ceiling', clearance: {},
  materials: ['gold', 'glass', 'emissive', 'metal', 'cloth'], w: 2.4, d: 2.4, h: 2.2, variants: 1, task: [],
  build: function (F) {
    /* three chains to a gilt ring (a polycandelon) of twelve glass lamp cups, a lesser ring above, a pierced lantern at the centre
       on its own chain, tassels below */
    const gold = F.col('gold');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(0, 2.2, 0, Math.cos(a) * 1.1, 0.5, Math.sin(a) * 1.1, 0.01, F.col('goldDark'), 'gold'); }
    F.tube(Array.from({ length: 25 }, (_, k) => [Math.cos(k * F.TAU / 24) * 1.1, 0.5, Math.sin(k * F.TAU / 24) * 1.1]), 0.04, gold, 'gold');
    F.tube(Array.from({ length: 17 }, (_, k) => [Math.cos(k * F.TAU / 16) * 0.6, 1.0, Math.sin(k * F.TAU / 16) * 0.6]), 0.03, gold, 'gold');
    for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.frustum(Math.cos(a) * 1.1, 0.38, Math.sin(a) * 1.1, 0.04, 0.09, 0.14, 0, F.col('glassSaffron'), 'glass', 8); F.ball(Math.cos(a) * 1.1, 0.48, Math.sin(a) * 1.1, 0.03, F.col('flame'), 'glow'); }
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.ball(Math.cos(a) * 0.6, 1.06, Math.sin(a) * 0.6, 0.04, F.col('flame'), 'glow'); }
    F.rod(0, 2.12, 0, 0, 0.75, 0, 0.012, F.col('goldDark'), 'gold'); F.cyl(0, 2.1, 0, 0.3, 0.1, 0, F.col('gold'), 'gold');
    F.frustum(0, 0.35, 0, 0.12, 0.2, 0.25, 0, gold, 'gold', 8); F.cyl(0, 0.6, 0, 0.18, 0.06, 0, F.col('glassSaffron'), 'glow'); F.dome(0, 0.66, 0, 0.2, 0.12, 0, gold, 'gold');
    F.rod(0, 0.35, 0, 0, 0.05, 0, 0.02, F.col('clothSaffron'), 'cloth'); F.ball(0, 0.05, 0, 0.05, F.col('clothSaffron'), 'cloth');
    F.lamp(0, 0.6, 0, 1.0, 10);
  }
});
FURN({
  key: 'xanadu_court_lamp_tree', name: 'Lamp tree of oil cups', culture: 'xanadu', tier: 'court', type: 'lamp', role: 'lamp_tree', setting: 'indoor',
  rooms: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_bedchamber', 'xc_harem', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_music', 'xc_study', 'xc_bath'], anchor: 'floor', clearance: {},
  materials: ['gold', 'emissive', 'jade'], w: 0.9, d: 0.9, h: 2.3, variants: 1, task: [],
  build: function (F) {
    /* a deepa stambha in gold: a stepped foot, a turned stem, three tiers of branches each holding oil cups, a peacock at its top */
    const gold = F.col('gold');
    F.cyl(0, 0, 0, 0.32, 0.08, 0, gold, 'gold'); F.cyl(0, 0.08, 0, 0.22, 0.08, 0, F.col('goldDark'), 'gold');
    F.lathe(0, 0.16, 0, [[0.07, 0], [0.05, 0.4], [0.08, 0.5], [0.04, 0.9], [0.07, 1.0], [0.035, 1.9]], 0, gold, 'gold');
    const tiers = [[0.4, 0.75, 8], [0.3, 1.35, 6], [0.2, 1.85, 5]];
    for (const [r, y, n] of tiers) for (let i = 0; i < n; i++) { const a = i * F.TAU / n + y; F.rod(0, y, 0, Math.cos(a) * r, y + 0.06, Math.sin(a) * r, 0.012, gold, 'gold');
      F.cyl(Math.cos(a) * r, y + 0.06, Math.sin(a) * r, 0.045, 0.03, 0, gold, 'gold'); F.cone(Math.cos(a) * r, y + 0.09, Math.sin(a) * r, 0.015, 0.05, 0, F.col('flame'), 'glow'); }
    F.ell(0, 2.12, 0, 0.06, 0.08, 0.1, 0, F.col('peacock'), 'jade'); F.cone(0, 2.18, 0.04, 0.03, 0.1, 0, F.col('gold'), 'gold');
    F.lamp(0, 1.4, 0, 0.5, 5);
  }
});
/* ---- beds */
FURN({
  key: 'xanadu_court_state_bed', name: 'The Sultan\'s bed under its dome', culture: 'xanadu', tier: 'court', type: 'bed', role: 'state_bed', setting: 'indoor',
  rooms: ['xc_bedchamber'], anchor: 'floor', clearance: { front: 1.2, left: 0.8, right: 0.8 }, materials: ['lacquer', 'gold', 'cloth', 'stone'],
  w: 3.6, d: 3.8, h: 4.4, variants: 1, task: ['sleeping'],
  build: function (F) {
    /* a dais of white marble, the bed of state on gilt feet (as wide as it is long), its quilts of saffron brocade under a cover of
       rose silk, a bank of bolsters; four twisted gilt posts carry a baldachin with a white dome and a gold finial, the curtains of
       pearl-white silk drawn back to the posts and tied with gold */
    const gold = F.col('gold');
    F.box(0, 0, 0, 3.6, 0.22, 3.8, 0, F.col('marbleWhite'), 'stone');
    F.box(0, 0.22, 0, 3.2, 0.06, 3.4, 0, gold, 'gold');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.ball(sx * 1.35, 0.4, sz * 1.45, 0.14, gold, 'gold');
    F.box(0, 0.45, 0, 2.9, 0.3, 3.1, 0, F.col('lacquerRed'), 'lacquer');
    F.pillow(0, 0.88, 0.1, 2.8, 0.26, 2.8, 0, F.col('clothSaffron'), 'cloth', { side: 0.5, puff: 0.35, round: 8 });
    F.box(0, 0.9, 0.55, 2.84, 0.16, 1.9, 0, F.col('silkRose'), 'cloth');
    F.bolster(0, 1.15, -1.2, 2.6, 0.22, 0, F.col('clothMaroon'), 'cloth');
    for (const x of [-0.8, 0, 0.8]) F.pillow(x, 1.15, -0.85, 0.7, 0.2, 0.45, 0, F.col('clothGoldBand'), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
    F.box(0, 0.75, -1.55, 3.0, 1.6, 0.14, 0, gold, 'gold');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.cyl(sx * 1.6, 0.2, sz * 1.7, 0.09, 3.22, 0, gold, 'gold');
      F.box(sx * 1.45, 1.0, sz * 1.62, 0.28, 2.4, 0.05, 0, F.col('pearl'), 'cloth'); F.cyl(sx * 1.55, 1.6, sz * 1.65, 0.12, 0.08, 0, gold, 'gold'); }
    F.box(0, 3.42, 0, 3.5, 0.24, 3.7, 0, gold, 'gold');
    F.box(0, 3.3, 0, 3.6, 0.14, 3.8, 0, F.col('clothMaroon'), 'cloth');
    F.cyl(0, 3.66, 0, 1.0, 0.12, 0, F.col('pearl'), 'stone'); F.dome(0, 3.78, 0, 0.95, 0.5, 0, F.col('pearl'), 'stone');
    F.cyl(0, 3.78, 0, 0.97, 0.06, 0, gold, 'gold'); F.cone(0, 4.26, 0, 0.06, 0.14, 0, gold, 'gold');
  }
});
FURN({
  key: 'xanadu_court_harem_bed', name: 'Day-bed under a silk canopy', culture: 'xanadu', tier: 'court', type: 'bed', role: 'harem_bed', setting: 'indoor',
  rooms: ['xc_harem', 'xc_cage', 'xc_guest', 'xc_bath'], anchor: 'floor', clearance: { front: 0.8, left: 0.4 }, materials: ['lacquer', 'gold', 'cloth', 'glass'],
  w: 2.0, d: 2.4, h: 2.9, variants: 3, variantNames: ['rose', 'turquoise', 'saffron'], task: ['sleeping', 'resting'],
  build: function (F) {
    /* a low lacquer bed on gilt feet, quilts and a heap of cushions, a canopy of sheer silk falling from a gilt crown hung on four
       slender posts */
    const c = F.col(['silkRose', 'clothTurquoise', 'clothSaffron'][F.variant | 0] || 'silkRose'), gold = F.col('gold');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.9, 0, sz * 1.1, 0.06, 0.25, 0, gold, 'gold');
    F.box(0, 0.25, 0, 1.9, 0.18, 2.3, 0, F.col('lacquerBlack'), 'lacquer');
    F.pillow(0, 0.55, 0.05, 1.8, 0.2, 2.1, 0, c, 'cloth', { side: 0.5, puff: 0.4, round: 7 });
    F.bolster(0, 0.78, -0.9, 1.6, 0.16, 0, F.col('clothGoldBand'), 'cloth');
    for (const x of [-0.45, 0.45]) F.pillow(x, 0.78, -0.65, 0.6, 0.2, 0.4, 0.1, F.shade(c, -0.15), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.95, 0.24, sz * 1.15, 0.03, 2.41, 0, gold, 'gold');
    F.box(0, 2.62, 0, 2.0, 0.1, 2.4, 0, gold, 'gold'); F.dome(0, 2.72, 0, 0.5, 0.18, 0, gold, 'gold');
    for (const sx of [-1, 1]) F.box(sx * 0.98, 0.5, 0, 0.02, 2.1, 2.3, 0, F.col('pearl'), 'glass');
  }
});
FURN({
  key: 'xanadu_court_pallet', name: 'Quilted pallet on a lacquer platform', culture: 'xanadu', tier: 'court', type: 'bed', role: 'pallet', setting: 'indoor',
  rooms: ['xc_dorm', 'xc_harem'], anchor: 'floor', clearance: { front: 0.5 }, materials: ['lacquer', 'cloth', 'gold'],
  w: 1.1, d: 2.2, h: 0.55, variants: 3, task: ['sleeping'],
  build: function (F) {
    /* the concubines' beds in their long rooms: a low red platform, a quilt of brocade, a bolster, a small gilt-cornered box at the foot */
    const c = F.col(['silkRose', 'clothSaffron', 'clothTurquoise'][F.variant | 0] || 'silkRose');
    F.box(0, 0, -0.1, 1.0, 0.14, 1.9, 0, F.col('lacquerRed'), 'lacquer');
    F.pillow(0, 0.22, -0.1, 0.95, 0.14, 1.85, 0, c, 'cloth', { side: 0.5, puff: 0.4, round: 7 });
    F.bolster(0, 0.36, -0.88, 0.85, 0.1, 0, F.col('clothGoldBand'), 'cloth');
    F.box(0, 0, 0.95, 0.7, 0.32, 0.28, 0, F.col('lacquerBlack'), 'lacquer');
    for (const x of [-0.33, 0.33]) F.box(x, 0, 0.95, 0.05, 0.33, 0.3, 0, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'xanadu_court_hoist', name: 'The silk hoist and its gilt chair (bath to bed)', culture: 'xanadu', tier: 'court', type: 'monument', role: 'hoist', setting: 'indoor',
  rooms: ['xc_bedchamber', 'xc_bath'], anchor: 'wall', clearance: { front: 1.2 }, materials: ['lacquer', 'gold', 'rope', 'cloth'],
  w: 2.4, d: 1.6, h: 3.6, variants: 1, task: [],
  build: function (F) {
    /* a lacquered gantry against the wall, its beam carrying a gilt pulley block; silk ropes in saffron run down to a gilt chair
       slung beneath it (a cushioned seat with a back and arms) at the height of the bed, the windlass at the post */
    const lac = F.col('lacquerRed'), gold = F.col('gold');
    for (const x of [-1.1, 1.1]) { F.box(x, 0, -0.6, 0.18, 3.5, 0.18, 0, lac, 'lacquer'); F.box(x, 0, -0.54, 0.3, 0.2, 0.5, 0, gold, 'gold'); }
    F.box(0, 3.35, -0.6, 2.4, 0.22, 0.2, 0, lac, 'lacquer'); F.box(0, 3.3, -0.6, 2.44, 0.06, 0.24, 0, gold, 'gold');
    F.beam(0, 3.35, -0.6, 0, 3.35, 0.2, 0.16, 0.16, lac, 'lacquer');
    F.cyl(0, 3.0, 0.2, 0.14, 0.3, 0, gold, 'gold');
    for (const x of [-0.35, 0.35]) F.rod(x * 0.3, 3.0, 0.2, x, 1.55, 0.2, 0.015, F.col('clothSaffron'), 'rope');
    F.box(0, 0.9, 0.2, 0.9, 0.12, 0.8, 0, gold, 'gold'); F.pillow(0, 1.08, 0.2, 0.8, 0.14, 0.7, 0, F.col('clothSaffron'), 'cloth', { side: 0.4, puff: 0.5, round: 5 });
    F.box(0, 1.0, -0.2, 0.88, 0.7, 0.08, 0, gold, 'gold'); for (const x of [-0.45, 0.45]) F.box(x, 0.99, 0.2, 0.07, 0.41, 0.78, 0, gold, 'gold');
    F.rod(-0.45, 1.55, 0.2, 0.45, 1.55, 0.2, 0.03, gold, 'gold');
    F.cyl(1.1, 1.0, -0.35, 0.14, 0.12, 0, F.col('goldDark'), 'gold'); F.rod(1.1, 1.06, -0.35, 1.1, 1.06, -0.05, 0.02, F.col('lacquerBlack'), 'lacquer');
  }
});
/* ---- music: the damsel with a dulcimer */
FURN({
  key: 'xanadu_court_dulcimer', name: 'The damsel\'s dulcimer (a santur on its stand)', culture: 'xanadu', tier: 'court', type: 'workstation', role: 'dulcimer', setting: 'indoor',
  rooms: ['xc_music', 'xc_feast', 'xc_harem', 'xc_dayroom', 'xc_bedchamber'], anchor: 'floor', clearance: { front: 0.4 }, materials: ['timber', 'metal', 'gold', 'cloth', 'bone', 'lacquer'],
  w: 1.2, d: 1.3, h: 0.75, variants: 1, task: [],
  build: function (F) {
    /* "a damsel with a dulcimer": the trapezoid santur of walnut on a low lacquer stand, its courses of brass strings over ivory
       bridges, two slender hammers laid on it; the player's cushion behind */
    const wood = F.col('timberRose');
    for (const x of [-0.4, 0.4]) F.beam(x, 0, 0.1, x, 0.45, 0.1, 0.05, 0.3, F.col('lacquerRed'), 'lacquer');
    F.box(0, 0.45, 0.1, 0.95, 0.03, 0.4, 0, F.col('lacquerRed'), 'lacquer');
    F.box(0, 0.48, 0.1, 0.9, 0.08, 0.38, 0, wood, 'wood'); F.box(0, 0.485, 0.12, 0.6, 0.08, 0.3, 0, F.shade(wood, 0.12), 'wood');
    for (let i = 0; i < 12; i++) F.rod(-0.42 + i * 0.002, 0.565, -0.07 + i * 0.032, 0.42 - i * 0.002, 0.565, -0.07 + i * 0.032, 0.002, F.col('brass'), 'metal');
    for (const x of [-0.15, 0.2]) F.box(x, 0.565, 0.1, 0.02, 0.012, 0.36, 0, F.col('pearl'), 'bone');
    for (const s of [-1, 1]) F.rod(s * 0.08, 0.58, 0.0, s * 0.16, 0.58, 0.28, 0.006, F.col('gold'), 'gold');
    F.ball(0, 0.75, 0.0, 0.01, F.col('gold'), 'gold');
    F.pillow(0, 0.1, -0.4, 0.75, 0.2, 0.6, 0, F.col('silkRose'), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
  }
});
FURN({
  key: 'xanadu_court_musicians_dais', name: 'Musicians\' dais with its instruments', culture: 'xanadu', tier: 'court', type: 'seating', role: 'musicians_dais', setting: 'indoor',
  rooms: ['xc_music', 'xc_feast'], anchor: 'wall', clearance: { front: 1.0 }, materials: ['timber', 'cloth', 'gold', 'metal', 'hide', 'bone', 'lacquer', 'rope'],
  w: 3.4, d: 2.2, h: 1.5, variants: 1, task: ['socializing'],
  build: function (F) {
    /* a low dais under a carpet; four cushions for the players, and their instruments set down between: the santur on its stand,
       the oud and the long-necked tanbur on their stands, the angular harp (chang), a pair of frame drums and a ney */
    const wood = F.col('timberRose'), gold = F.col('gold');
    F.box(0, 0, 0, 3.4, 0.3, 2.2, 0, F.col('timberRoseDark'), 'wood'); F.box(0, 0.3, 0, 3.3, 0.02, 2.1, 0, F.col('clothMaroon'), 'cloth');
    F.box(0, 0.295, 1.045, 3.32, 0.035, 0.03, 0, gold, 'gold');
    for (let i = 0; i < 4; i++) F.pillow(-1.2 + i * 0.8, 0.4, -0.45, 0.6, 0.16, 0.55, 0, F.col(['clothSaffron', 'silkRose', 'clothTurquoise', 'clothSaffron'][i]), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
    F.box(-1.2, 0.32, 0.3, 0.7, 0.06, 0.3, 0, wood, 'wood');
    F.ell(-0.4, 0.62, 0.35, 0.2, 0.26, 0.09, 0, F.shade(wood, 0.1), 'wood'); F.beam(-0.4, 0.86, 0.35, -0.4, 1.28, 0.32, 0.06, 0.03, F.col('timberRoseDark'), 'wood');
    F.ell(0.4, 0.48, 0.35, 0.1, 0.12, 0.06, 0, wood, 'wood'); F.beam(0.4, 0.58, 0.35, 0.4, 1.45, 0.33, 0.03, 0.02, F.col('timberRoseDark'), 'wood');
    F.beam(1.05, 0.32, 0.2, 1.05, 1.3, 0.2, 0.06, 0.06, F.col('lacquerRed'), 'lacquer'); F.beam(1.05, 1.3, 0.2, 1.4, 0.5, 0.2, 0.05, 0.05, F.col('lacquerRed'), 'lacquer');
    for (let i = 0; i < 9; i++) F.rod(1.05, 0.45 + i * 0.09, 0.2, 1.08 + i * 0.033, 0.5 + i * 0.07, 0.2, 0.003, F.col('silkCream'), 'rope');
    for (const [x, y] of [[1.35, 0.32], [1.45, 0.384]]) { F.cyl(x, y, -0.75, 0.22, 0.06, 0.2, F.col('timberRoseLight'), 'wood'); F.cyl(x, y + 0.06, -0.75, 0.2, 0.004, 0, F.col('silkCream'), 'hide'); }
    F.rod(-1.5, 0.35, 0.65, -0.8, 0.35, 0.75, 0.015, F.col('paper'), 'wood');
  }
});
FURN({
  key: 'xanadu_court_instrument_rack', name: 'Rack of instruments', culture: 'xanadu', tier: 'court', type: 'rack', role: 'instrument_rack', setting: 'indoor',
  rooms: ['xc_music'], anchor: 'wall', clearance: { front: 0.6 }, materials: ['timber', 'lacquer', 'gold', 'rope'],
  w: 1.8, d: 0.35, h: 2.0, variants: 1, task: ['storage'],
  build: function (F) {
    /* a lacquer board with gilt pegs: two ouds and a rebab hung by their necks, ney flutes in a row, a sitar leaning at the end */
    const wood = F.col('timberRose');
    F.box(0, 0.2, -0.15, 1.8, 1.8, 0.05, 0, F.col('lacquerRed'), 'lacquer'); F.box(0, 1.92, -0.12, 1.84, 0.09, 0.09, 0, F.col('gold'), 'gold');
    for (const x of [-0.6, 0.0]) { F.rod(x, 1.75, -0.12, x, 1.75, -0.02, 0.012, F.col('gold'), 'gold'); F.ell(x, 0.9, -0.03, 0.2, 0.26, 0.08, 0, F.shade(wood, x * 0.2), 'wood'); F.beam(x, 1.15, -0.04, x, 1.72, -0.05, 0.06, 0.025, F.col('timberRoseDark'), 'wood'); }
    F.ell(0.32, 1.0, -0.04, 0.09, 0.16, 0.06, 0, wood, 'wood'); F.beam(0.32, 1.15, -0.05, 0.32, 1.7, -0.06, 0.03, 0.02, F.col('timberRoseDark'), 'wood');
    for (let i = 0; i < 5; i++) F.rod(0.47 + i * 0.04, 0.5, -0.08, 0.47 + i * 0.04, 1.35, -0.08, 0.012, F.col('silkCream'), 'wood');
    F.ell(0.76, 0.25, 0.02, 0.12, 0.18, 0.12, 0, F.shade(wood, -0.1), 'wood'); F.beam(0.76, 0.4, 0.02, 0.74, 1.9, -0.05, 0.05, 0.03, F.col('timberRoseDark'), 'wood');
  }
});
FURN({
  key: 'xanadu_court_lattice_box', name: 'The Sultan\'s lattice box (he watches unseen)', culture: 'xanadu', tier: 'court', type: 'seating', role: 'lattice_box', setting: 'indoor',
  rooms: ['xc_music', 'xc_feast', 'xc_dayroom'], anchor: 'wall', clearance: { front: 0.9 }, materials: ['lacquer', 'gold', 'cloth', 'stone'],
  w: 2.6, d: 2.0, h: 3.2, variants: 1, task: ['resting'],
  build: function (F) {
    /* a box of gilt jali three sides round a broad cushioned seat, its door a lattice leaf ajar, a little dome on its roof: the
       Sultan sits in it to hear the musicians and is not seen */
    const gold = F.col('gold'), lac = F.col('lacquerRed');
    F.box(0, 0, -0.1, 2.6, 0.25, 1.8, 0, F.col('marbleWhite'), 'stone');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 1.22, 0.25, -0.1 + sz * 0.82, 0.14, 2.45, 0.14, 0, lac, 'lacquer');
    for (const sx of [-1, 1]) { F.box(sx * 1.24, 0.35, -0.1, 0.04, 2.25, 1.5, 0, gold, 'gold'); for (let k = 0; k < 9; k++) F.box(sx * 1.25, 0.45 + k * 0.24, -0.1, 0.05, 0.03, 1.52, 0, F.col('lacquerBlack'), 'lacquer'); }
    F.box(0.35, 0.35, 0.72, 1.7, 2.25, 0.04, 0, gold, 'gold'); for (let k = 0; k < 9; k++) F.box(0.35, 0.45 + k * 0.24, 0.73, 1.72, 0.03, 0.05, 0, F.col('lacquerBlack'), 'lacquer');
    F.box(-0.85, 0.35, 0.82, 0.7, 2.25, 0.04, -0.3, gold, 'gold');
    F.box(0, 0.25, -0.5, 2.3, 0.3, 0.9, 0, lac, 'lacquer'); F.pillow(0, 0.65, -0.5, 2.2, 0.18, 0.85, 0, F.col('clothSaffron'), 'cloth', { side: 0.5, puff: 0.4, round: 6 });
    F.box(0, 2.7, -0.05, 2.6, 0.18, 1.9, 0, gold, 'gold'); F.dome(0, 2.88, -0.1, 0.55, 0.3, 0, F.col('pearl'), 'stone'); F.cone(0, 3.12, -0.1, 0.04, 0.08, 0, gold, 'gold');
  }
});
/* ---- water: the sinuous rills, the baths */
FURN({
  key: 'xanadu_court_salsabil', name: 'Salsabil: water rippling down a carved slab into its rill', culture: 'xanadu', tier: 'court', type: 'fountain', role: 'salsabil', setting: 'both',
  rooms: ['xc_dayroom', 'xc_dining', 'xc_harem', 'xc_bath', 'xc_audience', 'xc_reception', 'xc_court', 'xc_loggia', 'xc_family', 'xc_bedchamber'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'glass', 'gold', 'ceramic'], w: 1.6, d: 2.6, h: 2.7, variants: 1, task: [],
  build: function (F) {
    /* "gardens bright with sinuous rills": in a cusped niche of white marble a slab carved in chevrons is tilted from a gilt spout,
       the water rippling down it (the chadar) into a cusped basin, and from the basin a narrow rill runs out across the floor in a
       meander to a small round pool with a jet */
    const mar = F.col('marbleWhite'), water = F.col('water');
    F.box(0, 0, -1.2, 1.6, 2.7, 0.2, 0, mar, 'stone');
    F.box(0, 0.1, -1.1, 1.2, 2.2, 0.02, 0, F.col('turquoiseStone'), 'tile');
    F.box(0, 2.35, -1.08, 1.3, 0.12, 0.08, 0, F.col('gold'), 'gold');
    F.cone(0, 1.95, -1.0, 0.06, -0.14, 0, F.col('gold'), 'gold');
    F.beam(0, 1.75, -1.02, 0, 0.42, -0.62, 0.8, 0.08, mar, 'stone');
    for (let i = 0; i < 9; i++) { const t = (i + 0.5) / 9; F.beam(-0.38, 1.75 - 1.33 * t + 0.05, -1.0 + 0.38 * t, 0.38, 1.75 - 1.33 * t + 0.02, -1.0 + 0.38 * t, 0.06, 0.05, F.shade(water, 0.15 * (i % 2)), 'glass'); }
    F.box(0, 0, -0.45, 1.3, 0.38, 0.5, 0, mar, 'stone'); F.box(0, 0.34, -0.45, 1.1, 0.02, 0.36, 0, water, 'glass');
    F.box(0, 0, 0.3, 0.3, 0.1, 1.0, 0, mar, 'stone'); F.box(0, 0.09, 0.3, 0.18, 0.012, 0.98, 0, water, 'glass');
    F.cyl(0, 0, 0.98, 0.32, 0.12, 0, mar, 'stone'); F.cyl(0, 0.11, 0.98, 0.26, 0.01, 0, water, 'glass');
    F.cone(0, 0.11, 0.98, 0.03, 0.35, 0, F.col('ice'), 'glass');
  }
});
FURN({
  key: 'xanadu_court_fountain_basin', name: 'Octagonal fountain basin with a jet', culture: 'xanadu', tier: 'court', type: 'fountain', role: 'fountain_basin', setting: 'both',
  rooms: ['xc_feast', 'xc_court', 'xc_bath', 'xc_dayroom', 'xc_hall', 'xc_harem', 'xc_audience', 'xc_reception'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['stone', 'glass', 'gold'], w: 2.0, d: 2.0, h: 1.4, variants: 1, task: [],
  build: function (F) {
    /* an eight-lobed basin of white marble with a gold lip, a fluted pedestal bowl in it and a jet rising and falling back */
    const mar = F.col('marbleWhite');
    F.lathe(0, 0, 0, [[0.98, 0], [1.0, 0.36], [0.92, 0.42]], 0, mar, 'stone', { lobes: { n: 8, amp: 0.06 }, nu: 32 });
    F.cyl(0, 0.36, 0, 0.9, 0.02, 0, F.col('water'), 'glass');
    F.tube(Array.from({ length: 33 }, (_, k) => [Math.cos(k * F.TAU / 32) * 0.99, 0.42, Math.sin(k * F.TAU / 32) * 0.99]), 0.025, F.col('gold'), 'gold');
    F.lathe(0, 0.3, 0, [[0.12, 0], [0.08, 0.4], [0.35, 0.55], [0.38, 0.62]], 0, mar, 'stone', { flute: { n: 12, amp: 0.08 } });
    F.cyl(0, 0.88, 0, 0.32, 0.015, 0, F.col('water'), 'glass');
    F.cone(0, 0.9, 0, 0.03, 0.5, 0, F.col('ice'), 'glass');
  }
});
FURN({
  key: 'xanadu_court_hammam_slab', name: 'The hot stone (göbektaşı) of the hammam', culture: 'xanadu', tier: 'court', type: 'fountain', role: 'hammam_slab', setting: 'indoor',
  rooms: ['xc_bath'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 }, materials: ['stone', 'gold', 'cloth'],
  w: 3.4, d: 3.4, h: 0.6, variants: 1, task: ['resting'],
  build: function (F) {
    /* the octagonal platform of heated marble under the bath's dome, inlaid in a star of green and white stone, a folded peshtemal
       and a gilt bowl on it */
    F.cyl(0, 0, 0, 1.7, 0.5, Math.PI / 8, F.col('marbleWhite'), 'stone');
    F.cyl(0, 0.5, 0, 1.6, 0.012, Math.PI / 8, F.col('marbleVein'), 'stone');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.beam(0, 0.512, 0, Math.cos(a) * 1.3, 0.512, Math.sin(a) * 1.3, 0.16, 0.006, F.col(i % 2 ? 'peacockGreen' : 'pearl'), 'stone'); }
    F.box(-0.8, 0.51, 0.4, 0.5, 0.05, 0.3, 0.3, F.col('ruby'), 'cloth'); F.frustum(0.7, 0.51, -0.5, 0.08, 0.12, 0.08, 0, F.col('gold'), 'gold', 12);
  }
});
FURN({
  key: 'xanadu_court_kurna', name: 'Kurna: a marble wall basin with gilt taps', culture: 'xanadu', tier: 'court', type: 'fountain', role: 'kurna', setting: 'indoor',
  rooms: ['xc_bath'], anchor: 'wall', clearance: { front: 0.8 }, materials: ['stone', 'gold', 'glass', 'ceramic'],
  w: 1.0, d: 0.6, h: 1.5, variants: 1, task: [],
  build: function (F) {
    /* a carved marble basin at knee height on the wall, two gilt taps (hot and cold) in a cusped marble back-plate, a gilt bowl
       for pouring */
    const mar = F.col('marbleWhite');
    F.box(0, 0, -0.27, 1.0, 1.5, 0.06, 0, mar, 'stone'); F.box(0, 1.3, -0.24, 0.8, 0.18, 0.05, 0, F.col('turquoiseStone'), 'tile');
    F.lathe(0, 0.15, 0.0, [[0.1, 0], [0.25, 0.32], [0.26, 0.4]], 0, mar, 'stone', { flute: { n: 10, amp: 0.06 } });
    F.cyl(0, 0.5, 0.0, 0.22, 0.01, 0, F.col('water'), 'glass');
    for (const x of [-0.15, 0.15]) { F.rod(x, 0.85, -0.24, x, 0.85, -0.14, 0.02, F.col('gold'), 'gold'); F.cone(x, 0.78, -0.13, 0.025, 0.07, 0, F.col('gold'), 'gold'); }
    F.frustum(0.3, 0.55, 0.1, 0.06, 0.09, 0.06, 0, F.col('gold'), 'gold', 12);
  }
});
FURN({
  key: 'xanadu_court_towel_rack', name: 'Rack of peshtemals and pattens', culture: 'xanadu', tier: 'court', type: 'rack', role: 'towel_rack', setting: 'indoor',
  rooms: ['xc_bath', 'xc_wardrobe'], anchor: 'wall', clearance: { front: 0.6 }, materials: ['timber', 'cloth', 'nacre', 'gold', 'lacquer'],
  w: 1.4, d: 0.4, h: 1.8, variants: 1, task: ['storage'],
  build: function (F) {
    /* two rails on a lacquer frame hung with striped bath cloths (peshtemals) in red, white and blue, and below on a shelf the
       tall wooden bath pattens (nalin) inlaid with mother-of-pearl */
    const lac = F.col('lacquerRed');
    for (const x of [-0.65, 0.65]) F.box(x, 0, -0.1, 0.06, 1.8, 0.06, 0, lac, 'lacquer');
    F.box(0, 0.2, -0.18, 1.36, 1.6, 0.04, 0, F.shade(lac, -0.15), 'lacquer');
    for (const y of [1.2, 1.7]) F.rod(-0.65, y, -0.1, 0.65, y, -0.1, 0.02, F.col('gold'), 'gold');
    const C = ['ruby', 'pearl', 'lapis', 'silkCream'];
    for (let i = 0; i < 4; i++) { const x = -0.45 + i * 0.3, y = i % 2 ? 1.7 : 1.2; F.box(x, y - 0.55, -0.1, 0.26, 0.55, 0.03, 0, F.col(C[i]), 'cloth'); for (let k = 0; k < 3; k++) F.box(x, y - 0.5 + k * 0.15, -0.08, 0.27, 0.03, 0.01, 0, F.col('ruby'), 'cloth'); }
    F.box(0, 0.2, 0.0, 1.3, 0.04, 0.3, 0, lac, 'lacquer');
    for (const x of [-0.4, -0.25, 0.25, 0.4]) { F.box(x, 0.24, 0.02, 0.1, 0.18, 0.24, 0, F.col('timberRose'), 'wood'); F.box(x, 0.36, 0.02, 0.104, 0.02, 0.244, 0, F.col('pearl'), 'nacre'); }
  }
});
/* ---- the Vizier's study, the treasury, the wardrobe */
FURN({
  key: 'xanadu_court_rehal', name: 'Book stand (rehal) with an open book', culture: 'xanadu', tier: 'court', type: 'desk', role: 'rehal', setting: 'indoor',
  rooms: ['xc_study', 'xc_chancery', 'xc_cage', 'xc_dayroom', 'xc_divan'], anchor: 'floor', clearance: { front: 0.7 }, materials: ['timber', 'gold', 'cloth', 'bone', 'lacquer'],
  w: 0.8, d: 1.3, h: 0.7, variants: 1, task: ['reading'],
  build: function (F) {
    /* the folding X-stand of walnut inlaid with ivory on a low gilt tray-table, an illuminated book open on it, a reading cushion */
    const wood = F.col('timberRose');
    F.box(0, 0, -0.25, 0.7, 0.3, 0.55, 0, F.col('lacquerBlack'), 'lacquer'); F.box(0, 0.3, -0.25, 0.72, 0.03, 0.57, 0, F.col('gold'), 'gold');
        F.beam(0, 0.33, -0.36, 0, 0.6, -0.16, 0.4, 0.02, wood, 'wood'); F.beam(0, 0.33, -0.14, 0, 0.6, -0.34, 0.38, 0.02, F.shade(wood, 0.1), 'wood');
    for (const s of [-1, 1]) F.beam(s * 0.1, 0.55, -0.26, s * 0.17, 0.58, -0.2, 0.15, 0.02, F.col('paper'), 'cloth');
    F.box(0, 0.6, -0.25, 0.02, 0.02, 0.02, 0, F.col('gold'), 'gold');
    F.pillow(0, 0.1, 0.35, 0.65, 0.2, 0.6, 0, F.col('clothTurquoise'), 'cloth', { side: 0.4, puff: 0.6, round: 4 });
  }
});
FURN({
  key: 'xanadu_court_astrolabe', name: 'Astrolabe and celestial globe on a stand', culture: 'xanadu', tier: 'court', type: 'statue', role: 'astrolabe', setting: 'indoor',
  rooms: ['xc_study', 'xc_dayroom', 'xc_cage', 'xc_divan', 'xc_gifts'], anchor: 'floor', clearance: { front: 0.5 }, materials: ['bronze', 'gold', 'timber', 'lacquer'],
  w: 0.8, d: 0.8, h: 1.6, variants: 1, task: [],
  build: function (F) {
    /* a lacquer tripod table with a brass celestial globe in its gilt meridian ring, a great astrolabe hung on a bracket beside it */
    F.cyl(0, 0, 0, 0.3, 0.05, 0, F.col('lacquerBlack'), 'lacquer'); F.cyl(0, 0.05, 0, 0.04, 0.85, 0, F.col('lacquerRed'), 'lacquer');
    F.cyl(0, 0.9, 0, 0.32, 0.04, 0, F.col('gold'), 'gold');
    F.ball(0, 1.22, 0, 0.26, F.col('bronzeOld'), 'bronze');
    F.tube(Array.from({ length: 25 }, (_, k) => [0, 1.22 + Math.cos(k * F.TAU / 24) * 0.3, Math.sin(k * F.TAU / 24) * 0.3]), 0.012, F.col('gold'), 'gold');
    F.rod(0.24, 0.94, 0.0, 0.24, 1.5, 0.0, 0.015, F.col('gold'), 'gold'); F.cyl(0.24, 1.18, 0.02, 0.14, 0.015, 0, F.col('brass'), 'bronze');
  }
});
FURN({
  key: 'xanadu_court_ledger_chest', name: 'Ledger chest of brass-faced drawers', culture: 'xanadu', tier: 'court', type: 'storage', role: 'cabinet', setting: 'indoor',
  rooms: ['xc_study', 'xc_chancery', 'xc_treasury', 'xc_divan'], anchor: 'wall', clearance: { front: 0.8 }, materials: ['timber', 'metal', 'gold', 'cloth'],
  w: 1.5, d: 0.6, h: 1.3, variants: 1, task: ['storage'],
  build: function (F) {
    /* the Treasury's ledgers: a rosewood chest of drawers, four ranks of brass-faced drawers with gilt pulls, a sloping top for the open ledger */
    const wood = F.col('timberRoseDark');
    F.box(0, 0, 0, 1.5, 1.1, 0.6, 0, wood, 'wood');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { F.box(-0.48 + c * 0.48, 0.1 + r * 0.25, 0.3, 0.44, 0.21, 0.01, 0, F.col('brass'), 'metal'); F.ball(-0.48 + c * 0.48, 0.2 + r * 0.25, 0.32, 0.02, F.col('gold'), 'gold'); }
    F.beam(-0.7, 1.1, 0.25, 0.7, 1.1, 0.25, 0.04, 0.04, F.col('gold'), 'gold');
    F.beam(0, 1.12, 0.2, 0, 1.28, -0.2, 1.4, 0.04, wood, 'wood');
    F.box(0.1, 1.2, -0.02, 0.6, 0.03, 0.36, 0, F.col('paper'), 'cloth');
  }
});
FURN({
  key: 'xanadu_court_gift_display', name: 'Stepped stand of gifts', culture: 'xanadu', tier: 'court', type: 'stack', role: 'display', setting: 'indoor',
  rooms: ['xc_gifts', 'xc_treasury', 'xc_hall'], anchor: 'wall', clearance: { front: 0.8 }, materials: ['lacquer', 'gold', 'jade', 'ceramic', 'cloth'],
  w: 1.9, d: 0.8, h: 1.7, variants: 2, task: [],
  build: function (F) {
    /* the envoys' gifts shown on three stepped tiers under a saffron cloth: gold vessels, jade bowls, celadon and blue porcelain, a
       jewelled casket, a model ship of silver */
    const lac = F.col('lacquerRed'), gold = F.col('gold');
    for (let i = 0; i < 3; i++) { F.box(0, 0, 0.25 - i * 0.22, 1.9 - i * 0.04, 0.5 + i * 0.45, 0.3, 0, F.shade(lac, -i * 0.05), 'lacquer'); F.box(0, 0.5 + i * 0.45, 0.25 - i * 0.22, 1.88 - i * 0.04, 0.02, 0.3, 0, F.col('clothSaffron'), 'cloth'); }
    const items = F.variant ? ['jade', 'gold', 'clayCeladon', 'lapis', 'gold'] : ['gold', 'clayCeladon', 'jade', 'gold', 'pearl'];
    for (let i = 0; i < 3; i++) for (let k = 0; k < 4; k++) { const x = -0.7 + k * 0.47, y = 0.52 + i * 0.45, z = 0.25 - i * 0.22, c = F.col(items[(i + k) % items.length]);
      if ((i + k) % 3 === 0) F.lathe(x, y, z, [[0.06, 0], [0.12, 0.12], [0.05, 0.25], [0.07, 0.32]], 0, c, c === gold ? 'gold' : 'ceramic');
      else if ((i + k) % 3 === 1) F.frustum(x, y, z, 0.06, 0.13, 0.1, 0, c, 'jade', 12);
      else { F.box(x, y, z, 0.26, 0.14, 0.16, 0, F.col('lacquerBlack'), 'lacquer'); F.box(x, y + 0.14, z, 0.28, 0.04, 0.18, 0, gold, 'gold'); F.ball(x, y + 0.2, z, 0.025, F.col('ruby'), 'jade'); } }
  }
});
FURN({
  key: 'xanadu_court_dowry_chest', name: 'Gilt-banded chest of turquoise lacquer', culture: 'xanadu', tier: 'court', type: 'storage', role: 'chest', setting: 'indoor',
  rooms: ['xc_harem', 'xc_cage', 'xc_bedchamber', 'xc_guest', 'xc_dorm', 'xc_treasury', 'xc_wardrobe', 'xc_family'], anchor: 'floor', clearance: { front: 0.6 }, materials: ['lacquer', 'gold'],
  w: 1.2, d: 0.6, h: 0.75, variants: 2, task: ['storage'],
  build: function (F) {
    /* a domed chest of turquoise (or rose) lacquer painted with gold flowers, banded and cornered in gilt, a lock plate of gold */
    const c = F.col(F.variant ? 'silkRose' : 'clothTurquoise'), gold = F.col('gold');
    F.box(0, 0.05, 0, 1.2, 0.5, 0.6, 0, c, 'lacquer'); F.beam(-0.6, 0.6, 0, 0.6, 0.6, 0, 0.1, 0.56, F.shade(c, 0.05), 'lacquer');
    for (const s of [-1, 1]) F.box(s * 0.6, 0.54, 0, 0.03, 0.12, 0.58, 0, gold, 'gold');
    for (const x of [-0.56, -0.2, 0.2, 0.56]) F.box(x, 0.04, 0, 0.05, 0.53, 0.62, 0, gold, 'gold');
    F.box(0, 0.3, 0.305, 0.14, 0.16, 0.01, 0, gold, 'gold');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.ball(sx * 0.55, 0.05, sz * 0.25, 0.05, gold, 'gold');
    for (let i = 0; i < 6; i++) F.ball(-0.4 + (i % 3) * 0.4, 0.2 + (i > 2 ? 0.18 : 0), 0.305, 0.03, gold, 'gold');
  }
});
FURN({
  key: 'xanadu_court_birdcage', name: 'Gilt birdcage with a songbird', culture: 'xanadu', tier: 'court', type: 'statue', role: 'birdcage', setting: 'both',
  rooms: ['xc_dayroom', 'xc_harem', 'xc_cage', 'xc_court', 'xc_loggia', 'xc_family', 'xc_bedchamber'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['gold', 'lacquer', 'foliage', 'timber'], w: 0.6, d: 0.6, h: 2.0, variants: 1, task: [],
  build: function (F) {
    /* a lacquer stand with a hook, the domed cage of gilt wire hung from it, a nightingale on its perch */
    const gold = F.col('gold');
    F.cyl(0, 0, 0, 0.25, 0.04, 0, F.col('lacquerBlack'), 'lacquer'); F.cyl(-0.2, 0.04, 0, 0.025, 1.9, 0, F.col('lacquerRed'), 'lacquer');
    F.rod(-0.2, 1.92, 0, 0.05, 1.92, 0, 0.015, gold, 'gold'); F.rod(0.05, 1.92, 0, 0.05, 1.82, 0, 0.006, gold, 'gold');
    F.cyl(0.05, 1.1, 0, 0.18, 0.03, 0, gold, 'gold');
    for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.rod(0.05 + Math.cos(a) * 0.18, 1.13, Math.sin(a) * 0.18, 0.05 + Math.cos(a) * 0.14, 1.6, Math.sin(a) * 0.14, 0.004, gold, 'gold'); }
    F.dome(0.05, 1.6, 0, 0.14, 0.2, 0, gold, 'gold');
    F.rod(-0.08, 1.3, 0, 0.18, 1.3, 0, 0.006, F.col('timberRose'), 'wood'); F.ell(0.05, 1.36, 0, 0.035, 0.035, 0.06, 0, F.col('timberRoseLight'), 'plant');
  }
});
FURN({
  key: 'xanadu_court_palanquin', name: 'The Sultan\'s palanquin (four bearers)', culture: 'xanadu', tier: 'court', type: 'monument', role: 'palanquin', setting: 'indoor',
  rooms: ['xc_litter'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 }, materials: ['lacquer', 'gold', 'cloth', 'timber', 'stone'],
  w: 4.4, d: 1.7, h: 2.5, variants: 1, task: [],
  build: function (F) {
    /* the gilt litter set down on its trestles: a broad cushioned seat walled in gilt jali, a little dome over it, two great poles
       running fore and aft for the four bearers */
    const gold = F.col('gold');
    for (const x of [-1.3, 1.3]) { F.box(x, 0, 0, 0.12, 0.6, 1.5, 0, F.col('timberRoseDark'), 'wood'); }
    for (const z of [-0.65, 0.65]) F.rod(-2.2, 0.68, z, 2.2, 0.68, z, 0.07, F.col('lacquerRed'), 'lacquer');
    for (const z of [-0.65, 0.65]) for (const x of [-2.2, 2.2]) F.ball(x, 0.68, z, 0.1, gold, 'gold');
    F.box(0, 0.6, 0, 1.8, 0.2, 1.4, 0, gold, 'gold');
    F.pillow(0, 0.9, 0, 1.6, 0.2, 1.2, 0, F.col('clothSaffron'), 'cloth', { side: 0.5, puff: 0.4, round: 6 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.85, 0.8, sz * 0.65, 0.05, 1.3, 0, gold, 'gold');
    for (const sz of [-1, 1]) F.box(0, 1.0, sz * 0.67, 1.6, 0.9, 0.03, 0, F.col('goldDark'), 'gold');
    F.box(0, 2.1, 0, 1.9, 0.1, 1.5, 0, gold, 'gold'); F.dome(0, 2.2, 0, 0.6, 0.28, 0, F.col('pearl'), 'stone'); F.cone(0, 2.42, 0, 0.04, 0.08, 0, gold, 'gold');
    F.box(0, 1.85, 0.7, 1.9, 0.24, 0.02, 0, F.col('clothMaroon'), 'cloth'); F.box(0, 1.85, -0.7, 1.9, 0.24, 0.02, 0, F.col('clothMaroon'), 'cloth');
  }
});
/* the citadel's room kinds (xc_*) take only the pieces that list them: the court set and the older pieces join here, by kind.
   A wall hanging that a tall room drops toward the floor (the court tapestry, banner and scroll, the painted hanging on its
   poles) is left out on purpose; the frieze (high) and the wall rug (hem 1.1 m) are in */
(function () {
  const XC = {
    xanadu_court_divan: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_guest', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_divan', 'xc_court'],
    xanadu_court_low_table: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_divan', 'xc_loggia', 'xc_music', 'xc_bedchamber'],
    xanadu_court_table: ['xc_feast', 'xc_family', 'xc_wardrobe'],
    xanadu_court_throne: ['xc_divan', 'xc_study', 'xc_reception', 'xc_dayroom'],
    xanadu_court_desk: ['xc_study', 'xc_chancery', 'xc_divan', 'xc_cage'],
    xanadu_court_cabinet: ['xc_treasury', 'xc_wardrobe', 'xc_study', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_bedchamber', 'xc_gifts', 'xc_chancery', 'xc_family'],
    xanadu_court_bookcase: ['xc_study', 'xc_chancery', 'xc_cage', 'xc_dayroom', 'xc_divan'],
    xanadu_court_hearth: ['xc_bedchamber', 'xc_dayroom', 'xc_harem', 'xc_guest', 'xc_family', 'xc_study'],
    xanadu_court_fire: ['xc_audience', 'xc_feast', 'xc_hall', 'xc_court', 'xc_loggia', 'xc_gifts', 'xc_reception'],
    xanadu_court_lamp: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_dorm', 'xc_music', 'xc_study', 'xc_chancery', 'xc_divan', 'xc_treasury', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_wardrobe', 'xc_court', 'xc_litter'],
    xanadu_court_candelabra: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_study', 'xc_chancery', 'xc_divan', 'xc_music'],
    xanadu_court_hanging: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_dorm', 'xc_music', 'xc_study', 'xc_chancery', 'xc_divan', 'xc_treasury', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_wardrobe', 'xc_litter'],
    xanadu_court_carpet: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_dorm', 'xc_music', 'xc_study', 'xc_chancery', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_treasury'],
    xanadu_court_screen: ['xc_harem', 'xc_bedchamber', 'xc_guest', 'xc_bath', 'xc_dayroom', 'xc_cage', 'xc_dorm', 'xc_wardrobe', 'xc_family'],
    xanadu_court_frieze: ['xc_audience', 'xc_reception', 'xc_dining', 'xc_dayroom', 'xc_bedchamber', 'xc_divan', 'xc_gifts', 'xc_hall', 'xc_loggia', 'xc_bath', 'xc_music', 'xc_harem', 'xc_cage'],
    xanadu_court_wall_rug: ['xc_guest', 'xc_harem', 'xc_dorm', 'xc_study', 'xc_chancery', 'xc_family', 'xc_treasury', 'xc_cage', 'xc_music', 'xc_wardrobe'],
    xanadu_court_art: ['xc_audience', 'xc_reception', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_study', 'xc_chancery', 'xc_gifts', 'xc_hall', 'xc_treasury'],
    xanadu_court_statue: ['xc_audience', 'xc_hall', 'xc_gifts', 'xc_court', 'xc_loggia', 'xc_feast', 'xc_divan', 'xc_reception'],
    xanadu_court_jug: ['xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_guest', 'xc_bedchamber', 'xc_reception', 'xc_cage', 'xc_divan', 'xc_loggia', 'xc_music'],
    xanadu_court_bowl: ['xc_feast', 'xc_dayroom', 'xc_family', 'xc_harem', 'xc_reception', 'xc_cage', 'xc_loggia', 'xc_gifts'],
    xanadu_court_incense_burner: ['xc_audience', 'xc_reception', 'xc_feast', 'xc_dayroom', 'xc_family', 'xc_bedchamber', 'xc_harem', 'xc_cage', 'xc_guest', 'xc_study', 'xc_divan', 'xc_music', 'xc_bath'],
    xanadu_court_map_table: ['xc_divan', 'xc_study'],
    xanadu_court_card_cabinet: ['xc_chancery', 'xc_treasury', 'xc_study'],
    xanadu_court_strongbox: ['xc_treasury', 'xc_study', 'xc_bedchamber', 'xc_guest', 'xc_wardrobe', 'xc_chancery', 'xc_gifts'],
    xanadu_court_bath_pool: ['xc_bath'],
    xanadu_court_wall_fountain: ['xc_bath', 'xc_court', 'xc_dayroom', 'xc_harem', 'xc_dining', 'xc_family', 'xc_hall', 'xc_cage'],
    xanadu_common_planter: ['xc_court', 'xc_hall', 'xc_loggia', 'xc_dayroom', 'xc_gifts', 'xc_feast', 'xc_harem', 'xc_bath'],
    xanadu_common_bench: ['xc_court', 'xc_hall', 'xc_litter'],
    xanadu_common_store: ['xc_family'],
    xanadu_common_chest: ['xc_dorm', 'xc_wardrobe', 'xc_litter'],
    xanadu_common_rack: ['xc_wardrobe', 'xc_bath', 'xc_litter'],
    xanadu_common_books: ['xc_study', 'xc_chancery', 'xc_cage'],
    xanadu_common_scroll_rack: ['xc_chancery', 'xc_study'],
    xanadu_common_desk: ['xc_chancery'],
    xanadu_works_scribe_desk: ['xc_chancery'],
    xanadu_common_chair: ['xc_chancery', 'xc_divan', 'xc_study'],
    xanadu_trade_armour_stand: ['xc_gifts'],
    xanadu_trade_display: ['xc_gifts', 'xc_treasury'],
    /* the vestibules and stairs, the guard's mess, the court temple, its priests' cells and its drum circuit */
    xanadu_common_table: ['xc_mess'], xanadu_common_lamp: ['xc_mess', 'xc_cell', 'xc_lobby'], xanadu_common_hanging: ['xc_mess', 'xc_lobby', 'xc_kora'],
    xanadu_common_hearth: ['xc_mess'], xanadu_common_jug: ['xc_mess'], xanadu_common_bowl: ['xc_mess'], xanadu_trade_weapon_rack: ['xc_mess'],
    xanadu_common_bed: ['xc_cell'], xanadu_common_rug: ['xc_cell', 'xc_kora', 'xc_temple'], xanadu_common_candle: ['xc_cell', 'xc_temple'],
    xanadu_court_altar: ['xc_temple'], xanadu_common_meditation_cushion: ['xc_temple'], xanadu_common_skylight_column: ['xc_temple'], xanadu_common_butter_lamp_rack: ['xc_temple', 'xc_kora', 'xc_cell'],
    xanadu_common_prayer_wheels: ['xc_kora', 'xc_temple'], xanadu_court_chorten: ['xc_temple']
  };
  /* more of the older pieces for the rooms above (pushed after the table so the table reads by key) */
  const MORE = { xanadu_common_bench: ['xc_mess', 'xc_lobby', 'xc_kora'], xanadu_common_store: ['xc_mess'], xanadu_common_rack: ['xc_mess', 'xc_cell'],
    xanadu_common_chest: ['xc_cell'], xanadu_common_desk: ['xc_cell'], xanadu_common_chair: ['xc_cell'], xanadu_common_scroll_rack: ['xc_cell'], xanadu_common_books: ['xc_cell'],
    xanadu_court_divan: ['xc_lobby'], xanadu_court_lamp: ['xc_lobby', 'xc_temple', 'xc_kora'], xanadu_court_hanging: ['xc_lobby', 'xc_temple'], xanadu_court_frieze: ['xc_lobby', 'xc_temple', 'xc_kora'],
    xanadu_court_wall_rug: ['xc_lobby', 'xc_temple', 'xc_cell'], xanadu_court_statue: ['xc_lobby', 'xc_temple'], xanadu_common_planter: ['xc_lobby', 'xc_temple', 'xc_kora'],
    xanadu_court_kubla_hanging: ['xc_lobby'], xanadu_court_censer: ['xc_lobby', 'xc_temple', 'xc_kora'], xanadu_court_lamp_tree: ['xc_temple'], xanadu_court_great_chandelier: ['xc_temple'],
    xanadu_court_carpet: ['xc_temple'], xanadu_court_suzani: ['xc_cell'] };
  for (const k in MORE) XC[k] = (XC[k] || []).concat(MORE[k]);
  for (const k in XC) { const A = FURN_BY_KEY[k]; if (!A) { console.error('xanadu citadel rooms: no piece ' + k); continue; } for (const r of XC[k]) if (A.rooms.indexOf(r) < 0) A.rooms.push(r); }
})();
