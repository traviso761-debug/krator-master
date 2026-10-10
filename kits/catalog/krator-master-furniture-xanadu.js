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
    clayCeladon: 0x9ab8a0, stoneSlate: 0x5a5e62, iron: 0x3a3630, flame: 0xffc861, ember: 0xd9762c, glassSaffron: 0xf0b050
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
