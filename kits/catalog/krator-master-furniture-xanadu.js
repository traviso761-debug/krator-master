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
    water: 0x3a6672, brick: 0x8a4a36, soot: 0x2a2624, wax: 0x9a1a1a
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
