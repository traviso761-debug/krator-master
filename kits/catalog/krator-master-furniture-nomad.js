/* ======================================================================
   Eastern Nomad furniture: common and court tiers (the three harvested
   Yuni nomad pieces, yuni_nomad_*, stay in krator-master-furniture.js).
   Influences: pueblo, Arab. Portable folding frames on x-legs, adobe
   hearths and ovens, striped kilims, cloth screens, copper and bone;
   the khan's tent in lozenge-banded rugs and copper. No socket pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('nomad', { name: 'Eastern Nomads', pack: null, influences: 'pueblo; Arab',
  materials: 'poplar, hide, felt, adobe, red clay, copper, bone; court: kilim silk, copper, bone inlay',
  palette: {
    plasterAdobe: 0xc08a5a, plasterAdobeDark: 0x9a6a40, clayRed: 0xa0503a, copper: 0xb5723a, boneIvory: 0xe8e0cc,
    clothCream: 0xe8dcc0, clothRust: 0x9a4a2a, clothTurquoise: 0x2c8aa0, flame: 0xffb04a, timberPoplar: 0xb09a6a
  } });
/* END PALETTE */
const NOMAD_COMMON = {
  wood: 'timberUmber', woodDark: 'timberSepia', woodLight: 'timberPoplar', woodFam: 'wood',
  cloth: ['clothMadder', 'clothIndigo', 'clothSaffron', 'clothMud'], clothFam: 'cloth',
  accent: 'copper', accentFam: 'bronze', metal: 'blackIron', metalFam: 'metal',
  clay: 'clayRed', clayFam: 'stone', stone: 'plasterAdobe', stoneFam: 'plaster', rope: 'ropeMustard',
  flame: 'flame', ember: 'ember',
  legs: 'x', motif: 'chevron', bedBase: 'woven', seat: 'cushion', finial: 'none',
  hearth: 'mud', fire: 'ring', lamp: 'oil', rug: 'woven', screen: 'cloth', store: 'sacks',
  shelfFill: 'bundles', rack: 'cloaks', art: 'shield', art2: 'plate', statue: 'urn', tapestry: 'stripes',
  canopy: false, board: 'hide'
};
const NOMAD_COURT = Object.assign({}, NOMAD_COMMON, {
  cloth: ['clothMadder', 'clothSaffron', 'clothTurquoise', 'clothCream'],
  accent: 'copper', accentFam: 'bronze', motif: 'lozenge', finial: 'ball', rug: 'knotted', statue: 'vase', tapestry: 'chevrons', screen: 'cloth'
});
FK.set({ culture: 'nomad', tier: 'common', S: NOMAD_COMMON, names: {
  bed: 'Folding bed frame', bench: 'Folding bench', chair: 'Folding chair', stool: 'Folding stool', table: 'Trestle table',
  low_table: 'Low folding table', desk: 'Scribe\'s desk', chest: 'Copper-cornered chest', bookcase: 'Bundle shelves', wall_shelves: 'Pot shelves',
  store: 'Saddle sacks', hearth: 'Adobe hearth', fire: 'Fire ring and tripod', lamp: 'Oil lamp on a stand', candle: 'Clay oil lamp',
  hanging: 'Hanging oil lamp', rug: 'Kilim', screen: 'Cloth screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Ground loom', rack: 'Cloak pegs', ladder: 'Ladder', board: 'Hide board', art: 'Hide shield', bowl: 'Red clay bowl',
  jug: 'Red clay jug and cups', books: 'Bundled scrolls' } });
FK.set({ culture: 'nomad', tier: 'court', S: NOMAD_COURT, names: {
  bed: 'Khan\'s dais bed', throne: 'Khan\'s seat', divan: 'Khan\'s divan', table: 'Feast table', low_table: 'Copper tray table',
  desk: 'Khan\'s writing desk', cabinet: 'Copper-bound cabinet', bookcase: 'Khan\'s shelves', hearth: 'Great adobe hearth', fire: 'Copper fire-bowl',
  lamp: 'Copper lamp stand', candelabra: 'Copper candelabra', hanging: 'Hanging copper lamp', carpet: 'Great kilim', screen: 'Silk screen',
  tapestry: 'Chevron hanging', art: 'Copper shield', statue: 'Great vase', jug: 'Copper ewer and cups', bowl: 'Copper bowl' } });

FURN({
  key: 'nomad_common_saddle_rack', name: 'Saddle rack', culture: 'nomad', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'store', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide', 'cloth', 'bronze'],
  w: 0.8, d: 1.3, h: 1.1, variants: 1,
  build: function (F) {
    const wood = F.col('timberUmber'), hide = F.col('hideChestnut');
    for (const s of [-1, 1]) { F.beam(s * 0.34, 0, -0.5, 0, 0.8, -0.5, 0.06, 0.06, wood, 'wood'); F.beam(s * 0.34, 0, 0.5, 0, 0.8, 0.5, 0.06, 0.06, wood, 'wood'); }
    F.box(0, 0.76, 0, 0.14, 0.1, 1.3, 0, wood, 'wood');
    F.box(0, 0.86, 0, 0.5, 0.1, 0.9, 0, hide, 'hide');
    F.box(0, 0.96, -0.32, 0.4, 0.14, 0.1, 0, F.shade(hide, -0.1), 'hide');
    F.box(0, 0.96, 0.3, 0.3, 0.1, 0.1, 0, F.shade(hide, -0.1), 'hide');
    F.box(0, 0.9, 0, 0.56, 0.02, 0.5, 0, F.col('clothMadder'), 'cloth');            /* saddle cloth */
    for (const s of [-1, 1]) F.box(s * 0.3, 0.3, 0.05, 0.05, 0.56, 0.3, 0, F.shade(hide, 0.1), 'hide');
    F.ball(0, 1.06, 0.3, 0.035, F.col('copper'), 'bronze');
  }
});
FURN({
  key: 'nomad_court_tent_pole', name: 'Tent pole with hangings', culture: 'nomad', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'bedroom'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'bronze', 'bone'],
  w: 0.9, d: 0.9, h: 2.8, variants: 1,
  build: function (F) {
    const wood = F.col('timberSepia');
    F.cyl(0, 0, 0, 0.1, 0.08, 0, F.col('copper'), 'bronze');
    F.cyl(0, 0.08, 0, 0.06, 2.6, 0, wood, 'wood');
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.4; F.box(Math.cos(a) * 0.25, 1.2, Math.sin(a) * 0.25, 0.32, 1.4, 0.02, -a + Math.PI / 2, F.pick(['clothMadder', 'clothSaffron', 'clothTurquoise', 'clothCream']), 'cloth'); }
    F.cyl(0, 2.55, 0, 0.3, 0.05, 0, F.col('copper'), 'bronze');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.rod(Math.cos(a) * 0.3, 2.56, Math.sin(a) * 0.3, Math.cos(a) * 0.4, 2.2, Math.sin(a) * 0.4, 0.012, F.col('boneIvory'), 'bone'); }
    F.ball(0, 2.74, 0, 0.06, F.col('copper'), 'bronze');
  }
});
