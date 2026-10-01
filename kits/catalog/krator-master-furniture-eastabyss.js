/* ======================================================================
   East Abyss furniture: common and court tiers.
   Influences: Maghrebi, Arab. Cedar on turned legs, reed mats and woven
   bed-bases (the lake and abyss cultures use reeds), lime plaster and
   zellige tile, brass lanterns, lattice (mashrabiya) screens, lozenge
   bands; court in gilt with indigo and saffron silks. No socket pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('eastabyss', { name: 'East Abyss', pack: null, influences: 'Maghrebi; Arab',
  materials: 'cedar, reed, lime plaster, zellige tile, brass, terracotta; court: gilt, indigo and saffron silk',
  palette: {
    timberCedar: 0x8a5a38, timberCedarDark: 0x5a3a24, timberCedarLight: 0xa87a50,
    clothIndigo: 0x2a4a8a, clothSaffron: 0xd8a030, clothMadder: 0xa83a2a, clothWhite: 0xece6d6, clothTurquoise: 0x2c8aa0, clothOlive: 0x6a7a3a,
    reedPale: 0xc8b888, plasterLime: 0xe8e0cc, tileZellige: 0x1f6a8a, tileWhite: 0xe8e4d8, tileGreen: 0x2a7a5a,
    brass: 0xb08432, gilt: 0xd9b23c, copper: 0xb5723a, clayTerra: 0xb06a44, stoneSand: 0xc8b088, iron: 0x3a3630,
    flame: 0xffc861, ember: 0xd9762c, glassAmber: 0xe0a040
  } });
/* END PALETTE */
const EA_COMMON = {
  wood: 'timberCedar', woodDark: 'timberCedarDark', woodLight: 'timberCedarLight', woodFam: 'wood',
  cloth: ['clothIndigo', 'clothSaffron', 'clothMadder', 'clothWhite'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'clayTerra', clayFam: 'ceramic', stone: 'stoneSand', stoneFam: 'stone', rope: 'reedPale', tile: 'tileZellige',
  flame: 'flame', ember: 'ember', lampCol: 'glassAmber',
  legs: 'turned', motif: 'lozenge', bedBase: 'woven', seat: 'cushion', finial: 'knob',
  hearth: 'tile', fire: 'bowl', lamp: 'lantern', rug: 'reed', screen: 'lattice', store: 'jars',
  shelfFill: 'scrolls', rack: 'cloaks', art: 'plate', art2: 'mosaic', statue: 'urn', tapestry: 'grid',
  canopy: true, board: 'panel'
};
const EA_COURT = Object.assign({}, EA_COMMON, {
  cloth: ['clothIndigo', 'clothSaffron', 'clothWhite', 'clothTurquoise'],
  accent: 'gilt', accentFam: 'gold', stone: 'plasterLime', stoneFam: 'plaster', tile: 'tileGreen',
  rug: 'knotted', screen: 'lattice', statue: 'vase', art: 'mosaic', art2: 'plate', motif: 'lozenge', finial: 'knob'
});
FK.set({ culture: 'eastabyss', tier: 'common', S: EA_COMMON, names: {
  bed: 'Cedar bed with a reed base', bench: 'Cedar bench', chair: 'Turned cedar chair', stool: 'Turned stool', table: 'Cedar table',
  low_table: 'Low tray table', desk: 'Scribe\'s desk', chest: 'Brass-studded chest', bookcase: 'Scroll case', wall_shelves: 'Kitchen shelves',
  store: 'Terracotta jars', hearth: 'Zellige-tiled hearth', fire: 'Brass fire-bowl', lamp: 'Brass lantern on a stand', candle: 'Oil lamp',
  hanging: 'Hanging brass lantern', rug: 'Reed mat', screen: 'Lattice screen', counter: 'Souk counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Cloak pegs', ladder: 'Ladder', board: 'Lesson board', art: 'Painted plate', bowl: 'Terracotta bowl',
  jug: 'Terracotta jug and cups', books: 'Scroll cases' } });
FK.set({ culture: 'eastabyss', tier: 'court', S: EA_COURT, names: {
  bed: 'Canopied cedar bed', throne: 'Emir\'s chair', divan: 'Reception divan', table: 'Great cedar table', low_table: 'Gilt tray table',
  desk: 'Vizier\'s desk', cabinet: 'Gilt-inlaid cabinet', bookcase: 'Library case', hearth: 'Green-tiled hearth', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern on a stand', candelabra: 'Gilt candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great knotted carpet', screen: 'Gilt lattice screen',
  tapestry: 'Geometric hanging', art: 'Mosaic panel', statue: 'Great vase', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'eastabyss_common_hookah', name: 'Water pipe and tray', culture: 'eastabyss', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'tavern', 'court', 'antechamber'], anchor: 'surface', clearance: {},
  materials: ['glass', 'metal', 'cloth', 'emissive'],
  w: 0.4, d: 0.4, h: 0.6, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), glass = F.col('clothTurquoise');
    F.cyl(0, 0, 0, 0.2, 0.012, 0, brass, 'metal');
    F.ball(-0.05, 0.11, 0, 0.1, glass, 'glass');
    F.cyl(-0.05, 0.2, 0, 0.018, 0.3, 0, brass, 'metal');
    F.frustum(-0.05, 0.5, 0, 0.03, 0.05, 0.05, 0, brass, 'metal', 10);
    F.cyl(-0.05, 0.55, 0, 0.035, 0.03, 0, F.col('ember'), 'glow');
    F.rod(-0.05, 0.32, 0, 0.12, 0.2, 0.1, 0.01, F.col('clothMadder'), 'cloth');
    F.rod(0.12, 0.2, 0.1, 0.16, 0.02, 0.05, 0.01, F.col('clothMadder'), 'cloth');
  }
});
FURN({
  key: 'eastabyss_court_mashrabiya', name: 'Mashrabiya window screen', culture: 'eastabyss', tier: 'court', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom', 'antechamber'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['timber', 'gold'],
  w: 1.6, d: 0.14, h: 2.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberCedarDark');
    F.box(0, 0, -0.04, 1.6, 2.2, 0.06, 0, wood, 'wood');
    F.box(0, 0.1, -0.03, 1.4, 1.95, 0.02, 0, F.shade(wood, -0.5), 'wood');
    for (let r = 0; r < 12; r++) for (let c = 0; c < 9; c++) {
      const x = -0.6 + c * 0.15, y = 0.2 + r * 0.16;
      F.box(x, y, 0.0, 0.06, 0.06, 0.08, Math.PI / 4, F.shade(wood, (r + c) % 2 ? 0.1 : 0.02), 'wood');
    }
    F.box(0, 2.0, 0.0, 1.5, 0.1, 0.1, 0, F.col('gilt'), 'gold');
    F.box(0, 0.08, 0.0, 1.5, 0.08, 0.1, 0, F.col('gilt'), 'gold');
  }
});
