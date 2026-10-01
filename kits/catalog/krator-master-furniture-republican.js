/* ======================================================================
   Republican furniture: common and court tiers.
   Influences: Russian, Saxon, Tlingit, Korean, high-value salvage. The
   middle class builds in bamboo (post legs, node rings) with brass and
   glazed celadon, tiled stoves and salvaged electric light; the court in
   birch and black timber with Ancients alloy, brass and the Republic's
   deep red (core/sockets/80-cultures.js: red #7a2028, ochre #c9963a,
   cream #f0e6cc, teal ink #2a8a86, the triskele).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('republican', { name: 'Republicans', pack: 'republic', influences: 'Russian; Saxon; Tlingit; Korean; high-value salvage',
  materials: 'bamboo, birch, black timber, brass, glazed celadon, salvaged alloy and electrics',
  palette: {
    bambooStraw: 0xc8b070, bambooDark: 0x8a7a40, bambooPale: 0xe0d090, timberBirch: 0xc8a878, timberBirchDark: 0x8a6a48, timberBlack: 0x2a2420,
    clothRepublicRed: 0x7a2028, clothOchreBand: 0xc9963a, clothCream: 0xf0e6cc, clothTealInk: 0x2a8a86, clothBlue: 0x2a4a7a, clothGreen: 0x3a5a3a,
    brass: 0xb08432, steelSalvage: 0x7a8088, alloyWhite: 0xe6e4dc, glassSky: 0x5a9ec9, clayGlazed: 0x6a9a7a, stoneGrey: 0x7a7670,
    ironBlack: 0x2a2a2a, flame: 0xffb04a, ember: 0xd9762c, electric: 0x6fd0ff
  } });
/* END PALETTE */
const REP_COMMON = {
  emblem: { field: 'clothRepublicRed', edge: 'timberBirchDark', band: 'clothOchreBand', disc: 'clothCream', ink: 'clothRepublicRed', ink2: 'clothTealInk' },
  wood: 'bambooStraw', woodDark: 'bambooDark', woodLight: 'bambooPale', woodFam: 'bamboo',
  cloth: ['clothRepublicRed', 'clothCream', 'clothBlue', 'clothGreen'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'ironBlack', metalFam: 'metal',
  clay: 'clayGlazed', clayFam: 'ceramic', stone: 'stoneGrey', stoneFam: 'stone', rope: 'clothOchreBand', tile: 'clayGlazed',
  flame: 'flame', ember: 'ember', lampCol: 'electric',
  legs: 'post', motif: 'lozenge', bedBase: 'plank', seat: 'cushion', finial: 'knob',
  hearth: 'tile', fire: 'basket', lamp: 'glass', rug: 'woven', screen: 'panel', store: 'barrels',
  shelfFill: 'books', rack: 'cloaks', art: 'panel', art2: 'shield', statue: 'figure', tapestry: 'spiral',
  canopy: true, board: 'slate'
};
const REP_COURT = Object.assign({}, REP_COMMON, {
  wood: 'timberBirch', woodDark: 'timberBlack', woodLight: 'timberBirch', woodFam: 'wood',
  cloth: ['clothRepublicRed', 'clothOchreBand', 'clothCream', 'clothTealInk'],
  accent: 'alloyWhite', accentFam: 'metal', motif: 'spiral', finial: 'knob', statue: 'figure', screen: 'carved', rug: 'knotted', art: 'shield', art2: 'panel'
});
FK.set({ culture: 'republican', tier: 'common', S: REP_COMMON, names: {
  bed: 'Bamboo bed', bench: 'Bamboo bench', chair: 'Bamboo chair', stool: 'Bamboo stool', table: 'Bamboo table',
  low_table: 'Low bamboo table', desk: 'Clerk\'s bamboo desk', chest: 'Brass-banded chest', bookcase: 'Bamboo bookcase', wall_shelves: 'Celadon shelves',
  store: 'Barrels', hearth: 'Tiled stove', fire: 'Iron fire-basket', lamp: 'Salvaged electric lamp', candle: 'Candle dish',
  hanging: 'Salvaged pendant lamp', rug: 'Striped rug', screen: 'Panel screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Cloak rack', ladder: 'Bamboo ladder', board: 'Slate board', art: 'Painted panel', bowl: 'Celadon bowl',
  jug: 'Celadon jug and cups', books: 'Bound books' } });
FK.set({ culture: 'republican', tier: 'court', S: REP_COURT, names: {
  bed: 'Canopied birch bed', throne: 'Consul\'s chair', divan: 'Reception divan', table: 'Council table', low_table: 'Alloy-trimmed low table',
  desk: 'Consul\'s desk', cabinet: 'Alloy-inlaid cabinet', bookcase: 'Archive bookcase', hearth: 'Great tiled stove', fire: 'Alloy fire-basket',
  lamp: 'Salvaged electric standard', candelabra: 'Brass candelabra', hanging: 'Salvaged chandelier', carpet: 'Great carpet', screen: 'Carved screen',
  tapestry: 'Triskele hanging', art: 'Republic shield', statue: 'Consul\'s statue', jug: 'Alloy ewer and cups', bowl: 'Alloy bowl' } });

FURN({
  key: 'republican_court_terminal', name: 'Salvaged archive terminal', culture: 'republican', tier: 'court', type: 'desk', setting: 'indoor',
  rooms: ['library', 'study', 'court', 'hall'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'glass', 'emissive', 'timber', 'cloth'],
  w: 1.6, d: 0.8, h: 1.9, variants: 1,
  build: function (F) {
    const alloy = F.col('alloyWhite'), birch = F.col('timberBirch');
    F.box(0, 0, -0.2, 1.6, 1.9, 0.4, 0, alloy, 'metal');                                   /* the cabinet, as found */
    F.box(0, 1.1, 0.0, 1.2, 0.5, 0.02, 0, F.col('glassSky'), 'glass');                      /* its dark pane */
    F.box(0, 1.2, 0.012, 1.0, 0.3, 0.005, 0, F.col('electric'), 'glow');
    for (let i = 0; i < 8; i++) F.box(-0.6 + i * 0.17, 0.3 + (i % 3) * 0.2, 0.0, 0.1, 0.1, 0.01, 0, i % 2 ? F.col('electric') : F.shade(alloy, -0.3), i % 2 ? 'glow' : 'metal');
    F.box(0, 0.74, 0.2, 1.4, 0.06, 0.4, 0, birch, 'wood');                                /* a birch desk built against it */
    for (const s of [-1, 1]) F.box(s * 0.65, 0, 0.3, 0.08, 0.74, 0.1, 0, F.shade(birch, -0.2), 'wood');
    F.box(0.2, 0.8, 0.2, 0.3, 0.012, 0.22, 0.1, F.col('clothCream'), 'cloth');
    F.lamp(0, 1.3, 0.3, 0.6, 5);
  }
});
