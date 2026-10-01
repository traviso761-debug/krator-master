/* ======================================================================
   Painted Men (tribal highlander) furniture: common and court tiers.
   Influences: Tlingit. Red cedar on block feet, formline spirals painted in
   black, red and teal, hide seats and screens, bentwood boxes, copper and
   abalone shell, totem posts and Chilkat-style figure hangings.
   No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('painted', { name: 'Painted Men', pack: null, influences: 'Tlingit',
  materials: 'red cedar, painted hide, cedar-bark rope, copper, abalone shell, bone',
  palette: {
    timberCedarRed: 0x8a4a30, timberCedarDark: 0x5a3020, timberCedarPale: 0xb08060, timberGreyWeathered: 0x8a8878,
    paintBlack: 0x1e1e1e, paintRed: 0xa82a22, paintTeal: 0x2a7a7a, paintOchre: 0xc89a3a, clothWoolWhite: 0xe8e0cc, hideElk: 0x9a7a52,
    boneIvory: 0xe8e0cc, copper: 0xb5723a, shellAbalone: 0x8ab0a8, stoneGrey: 0x7a7670, clayBlack: 0x3a3632, ropeCedar: 0x9a7a4a,
    flame: 0xffb04a, ember: 0xd9762c
  } });
/* END PALETTE */
const PNT_COMMON = {
  wood: 'timberCedarRed', woodDark: 'timberCedarDark', woodLight: 'timberCedarPale', woodFam: 'wood',
  cloth: ['paintRed', 'paintBlack', 'paintTeal', 'clothWoolWhite'], clothFam: 'cloth',
  accent: 'copper', accentFam: 'bronze', metal: 'copper', metalFam: 'bronze',
  clay: 'clayBlack', clayFam: 'stone', stone: 'stoneGrey', stoneFam: 'stone', rope: 'ropeCedar',
  flame: 'flame', ember: 'ember',
  legs: 'block', motif: 'spiral', bedBase: 'plank', seat: 'hide', finial: 'none',
  hearth: 'stone', fire: 'pit', lamp: 'oil', rug: 'hide', screen: 'carved', store: 'crates',
  shelfFill: 'bundles', rack: 'spears', art: 'mask', art2: 'panel', statue: 'totem', tapestry: 'figure',
  canopy: false, board: 'bark'
};
const PNT_COURT = Object.assign({}, PNT_COMMON, {
  cloth: ['paintBlack', 'paintTeal', 'paintOchre', 'clothWoolWhite'],
  accent: 'shellAbalone', accentFam: 'nacre', motif: 'spiral', finial: 'disc', statue: 'totem', screen: 'carved', rug: 'woven', art: 'mask', art2: 'panel'
});
FK.set({ culture: 'painted', tier: 'common', S: PNT_COMMON, names: {
  bed: 'Cedar plank bed', bench: 'Cedar bench', chair: 'Hide-seat chair', stool: 'Cedar block stool', table: 'Cedar plank table',
  low_table: 'Low cedar table', desk: 'Carver\'s desk', chest: 'Bentwood box', bookcase: 'Bundle shelves', wall_shelves: 'Box shelves',
  store: 'Bentwood boxes', hearth: 'Stone hearth', fire: 'Fire pit', lamp: 'Oil lamp on a post', candle: 'Fat lamp',
  hanging: 'Hanging oil bowl', rug: 'Elk hide', screen: 'Painted screen', counter: 'Trade counter', workbench: 'Carver\'s bench',
  loom: 'Weaving frame', rack: 'Spear rack', ladder: 'Ladder', board: 'Bark board', art: 'Painted mask', bowl: 'Black clay bowl',
  jug: 'Black clay jug and cups', books: 'Tally sticks' } });
FK.set({ culture: 'painted', tier: 'court', S: PNT_COURT, names: {
  bed: 'Chief\'s painted dais', throne: 'Chief\'s painted seat', divan: 'House-front settle', table: 'Potlatch table', low_table: 'Abalone-inlaid low table',
  desk: 'Chief\'s desk', cabinet: 'Painted press', bookcase: 'Crest shelves', hearth: 'Great house hearth', fire: 'Copper fire-bowl',
  lamp: 'Abalone lamp post', candelabra: 'Copper oil lamps', hanging: 'Hanging copper bowl', carpet: 'Great woven blanket', screen: 'Painted house screen',
  tapestry: 'Crest blanket', art: 'Great mask', statue: 'House post', jug: 'Copper ewer', bowl: 'Copper bowl' } });

FURN({
  key: 'painted_court_copper_shield', name: 'Copper of the house', culture: 'painted', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['hall', 'court', 'shrine', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['bronze', 'timber', 'nacre'],
  w: 0.7, d: 0.14, h: 1.1, variants: 1,
  build: function (F) {
    const cu = F.col('copper');
    F.box(0, 0, -0.05, 0.1, 1.1, 0.04, 0, F.col('timberCedarDark'), 'wood');
    F.box(0, 0.5, 0.0, 0.66, 0.5, 0.03, 0, cu, 'bronze');                                /* the shield's upper field */
    F.box(0, 0.05, 0.0, 0.5, 0.46, 0.03, 0, F.shade(cu, -0.08), 'bronze');
    F.box(0, 0.5, 0.0, 0.7, 0.04, 0.035, 0, F.shade(cu, -0.25), 'bronze');
    F.box(0, 0.05, 0.016, 0.05, 0.95, 0.01, 0, F.shade(cu, -0.25), 'bronze');
    for (let i = 0; i < 6; i++) { const a = i * 1.05, rr = 0.04 + i * 0.03; F.ball(Math.cos(a) * rr, 0.78 + Math.sin(a) * rr, 0.02, 0.02, F.col('shellAbalone'), 'nacre'); }
    for (const s of [-1, 1]) F.ball(s * 0.18, 0.84, 0.02, 0.03, F.col('shellAbalone'), 'nacre');
  }
});
