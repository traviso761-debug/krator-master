/* ======================================================================
   Rustic Highlander (Clansman) furniture: common and court tiers.
   Influences: Alpine, Tlingit. Carved larch on splayed legs with chevron
   bands, loden and red-check wool, horn and pewter, fieldstone hearths,
   iron fire-baskets, antler trophies; the clan hall in dark larch with
   pewter, spiral (formline) carving and totem posts. No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('rustic', { name: 'Rustic Highlanders', pack: null, influences: 'Alpine; Tlingit',
  materials: 'larch, wool, horn, pewter, iron, fieldstone; court: dark larch, pewter, antler',
  palette: {
    timberLarch: 0xa07850, timberLarchDark: 0x6a4a30, timberLarchLight: 0xc09a6a, timberLarchBlack: 0x3a2a1c,
    clothLoden: 0x4a5a3a, clothRedCheck: 0x8a2a2a, clothWool: 0xd8d0b8, clothGreyWool: 0x8a8878, clothBlue: 0x3a4a6a,
    hideBrown: 0x6a4a30, hornGrey: 0x9a9280, boneIvory: 0xe8e0cc, pewter: 0x8a8f92, iron: 0x3a3630,
    clayBrown: 0x8a5a3a, stoneGranite: 0x7a7466, flame: 0xffb04a, ember: 0xd9762c
  } });
/* END PALETTE */
const RUS_COMMON = {
  wood: 'timberLarch', woodDark: 'timberLarchDark', woodLight: 'timberLarchLight', woodFam: 'wood',
  cloth: ['clothLoden', 'clothRedCheck', 'clothWool', 'clothGreyWool'], clothFam: 'cloth',
  accent: 'hornGrey', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'clayBrown', clayFam: 'stone', stone: 'stoneGranite', stoneFam: 'stone', rope: 'hideBrown',
  flame: 'flame', ember: 'ember',
  legs: 'splayed', motif: 'chevron', bedBase: 'plank', seat: 'plank', finial: 'knob',
  hearth: 'stone', fire: 'basket', lamp: 'candle', rug: 'hide', screen: 'panel', store: 'barrels',
  shelfFill: 'jars', rack: 'tools', art: 'antler', art2: 'shield', statue: 'totem', tapestry: 'chevrons',
  canopy: false, board: 'slate'
};
const RUS_COURT = Object.assign({}, RUS_COMMON, {
  wood: 'timberLarchDark', woodDark: 'timberLarchBlack', woodLight: 'timberLarch',
  cloth: ['clothRedCheck', 'clothLoden', 'clothWool', 'clothBlue'],
  accent: 'pewter', accentFam: 'metal', motif: 'spiral', finial: 'knob', seat: 'cushion', statue: 'totem', screen: 'carved', rug: 'woven', tapestry: 'figure', art: 'antler', art2: 'shield'
});
FK.set({ culture: 'rustic', tier: 'common', S: RUS_COMMON, names: {
  bed: 'Larch box bed', bench: 'Larch bench', chair: 'Carved larch chair', stool: 'Splayed stool', table: 'Larch table',
  low_table: 'Low larch table', desk: 'Reckoning desk', chest: 'Iron-banded chest', bookcase: 'Larch shelves', wall_shelves: 'Crock shelves',
  store: 'Barrels', hearth: 'Fieldstone hearth', fire: 'Iron fire-basket', lamp: 'Candle stand', candle: 'Tallow candle',
  hanging: 'Candle wheel', rug: 'Sheepskin', screen: 'Panel screen', counter: 'Inn counter', workbench: 'Workbench',
  loom: 'Wool loom', rack: 'Tool rack', ladder: 'Ladder', board: 'Slate board', art: 'Antler trophy', bowl: 'Brown-ware bowl',
  jug: 'Brown-ware jug and cups', books: 'Reckoning books' } });
FK.set({ culture: 'rustic', tier: 'court', S: RUS_COURT, names: {
  bed: 'Chieftain\'s box bed', throne: 'Chieftain\'s chair', divan: 'Hall settle', table: 'Clan hall table', low_table: 'Pewter-trimmed low table',
  desk: 'Chieftain\'s desk', cabinet: 'Carved press', bookcase: 'Clan shelves', hearth: 'Great fieldstone hearth', fire: 'Great fire-basket',
  lamp: 'Pewter candle stand', candelabra: 'Pewter candelabra', hanging: 'Great candle wheel', carpet: 'Hall carpet', screen: 'Carved screen',
  tapestry: 'Clan crest hanging', art: 'Great antlers', statue: 'Clan totem', jug: 'Pewter ewer and cups', bowl: 'Pewter bowl' } });

FURN({
  key: 'rustic_common_churn_rack', name: 'Churn and crock rack', culture: 'rustic', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'stone'],
  w: 1.1, d: 0.5, h: 1.4, variants: 1,
  build: function (F) {
    const wood = F.col('timberLarchDark'), crock = F.col('clayBrown');
    F.box(0, 0, -0.22, 1.1, 1.4, 0.06, 0, wood, 'wood');
    F.box(0, 0.7, 0, 1.1, 0.04, 0.5, 0, F.col('timberLarch'), 'wood');
    for (const s of [-1, 1]) F.beam(s * 0.5, 0.7, -0.2, s * 0.5, 0.55, -0.2, 0.04, 0.04, wood, 'wood');
    F.frustum(-0.3, 0, 0.02, 0.14, 0.12, 0.6, 0, F.col('timberLarch'), 'wood', 12);         /* the churn */
    for (const y of [0.1, 0.5]) F.cyl(-0.3, y, 0.02, 0.145, 0.025, 0, F.col('iron'), 'metal');
    F.cyl(-0.3, 0.6, 0.02, 0.015, 0.4, 0, wood, 'wood');
    F.ball(-0.3, 1.0, 0.02, 0.03, F.col('timberLarch'), 'wood');
    for (let i = 0; i < 3; i++) F.frustum(-0.3 + i * 0.32, 0.74, 0.0, 0.08, 0.11, 0.32 - i * 0.06, 0, F.shade(crock, F.rr(-0.1, 0.1)), 'stone', 10);
    F.frustum(0.3, 0, 0.05, 0.1, 0.13, 0.4, 0, crock, 'stone', 10);
  }
});
