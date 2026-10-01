/* ======================================================================
   Reed Lake furniture: common and court tiers.
   A floating village: everything is bundled and woven reed (the reed
   family), driftwood where it can be had, rush cord, grey lake clay, fish
   silver; woven bands, wave hangings; the chief's house adds driftwood,
   bone and shell. No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('reedlake', { name: 'Reed Lake', pack: null, influences: 'floating reed village',
  materials: 'bundled reed, rush, driftwood, lake clay, fish silver, bone and shell',
  palette: {
    reedGold: 0xc8b060, reedPale: 0xd8c888, reedDark: 0x8a7a40, timberDrift: 0x9a8a70, timberDriftDark: 0x6a5a44, timberDriftLight: 0xb8a890,
    clothLakeBlue: 0x3a6a8a, clothRush: 0xb8a060, clothMadder: 0xa83a2a, clothWhite: 0xe8e4d4, clothTeal: 0x2a7a7a,
    clayGrey: 0x8a8070, stoneGrey: 0x6a6a62, fishSilver: 0xb0b8c0, ropeRush: 0xb8a868, boneIvory: 0xe8e0cc, shellWhite: 0xe8e4d8,
    flame: 0xffb04a, ember: 0xd9762c
  } });
/* END PALETTE */
const RL_COMMON = {
  wood: 'reedGold', woodDark: 'reedDark', woodLight: 'reedPale', woodFam: 'reed',
  cloth: ['clothLakeBlue', 'clothRush', 'clothMadder', 'clothWhite'], clothFam: 'cloth',
  accent: 'fishSilver', accentFam: 'metal', metal: 'fishSilver', metalFam: 'metal',
  clay: 'clayGrey', clayFam: 'stone', stone: 'stoneGrey', stoneFam: 'stone', rope: 'ropeRush',
  flame: 'flame', ember: 'ember',
  legs: 'post', motif: 'band', bedBase: 'woven', seat: 'woven', finial: 'none',
  hearth: 'mud', fire: 'pit', lamp: 'oil', rug: 'reed', screen: 'reed', store: 'baskets',
  shelfFill: 'bundles', rack: 'nets', art: 'plate', art2: 'mask', statue: 'urn', tapestry: 'waves',
  canopy: false, board: 'bark'
};
const RL_COURT = Object.assign({}, RL_COMMON, {
  wood: 'timberDrift', woodDark: 'timberDriftDark', woodLight: 'timberDriftLight', woodFam: 'wood',
  cloth: ['clothLakeBlue', 'clothWhite', 'clothTeal', 'clothMadder'],
  accent: 'shellWhite', accentFam: 'bone', motif: 'wave', finial: 'disc', statue: 'vase', screen: 'reed', rug: 'woven', art: 'mask', art2: 'plate'
});
FK.set({ culture: 'reedlake', tier: 'common', S: RL_COMMON, names: {
  bed: 'Reed sleeping frame', bench: 'Bundled-reed bench', chair: 'Woven reed chair', stool: 'Reed stool', table: 'Reed table',
  low_table: 'Low reed table', desk: 'Tally desk', chest: 'Reed chest', bookcase: 'Bundle shelves', wall_shelves: 'Basket shelves',
  store: 'Rush baskets', hearth: 'Clay hearth', fire: 'Fire pit', lamp: 'Fish-oil lamp on a post', candle: 'Fish-oil lamp',
  hanging: 'Hanging oil bowl', rug: 'Reed mat', screen: 'Reed screen', counter: 'Trade counter', workbench: 'Net-maker\'s bench',
  loom: 'Mat loom', rack: 'Net rack', ladder: 'Ladder', board: 'Bark tally board', art: 'Woven disc', bowl: 'Lake-clay bowl',
  jug: 'Lake-clay jug and cups', books: 'Tally sticks' } });
FK.set({ culture: 'reedlake', tier: 'court', S: RL_COURT, names: {
  bed: 'Headman\'s driftwood bed', throne: 'Headman\'s seat', divan: 'Headman\'s settle', table: 'Driftwood feast table', low_table: 'Shell-inlaid low table',
  desk: 'Headman\'s tally desk', cabinet: 'Driftwood press', bookcase: 'Headman\'s shelves', hearth: 'Great clay hearth', fire: 'Silver fire-bowl',
  lamp: 'Shell-inlaid lamp post', candelabra: 'Shell oil lamps', hanging: 'Hanging oil bowl', carpet: 'Great woven mat', screen: 'Fine reed screen',
  tapestry: 'Wave hanging', art: 'Great mask', statue: 'Great vase', jug: 'Shell-inlaid ewer', bowl: 'Shell-inlaid bowl' } });

FURN({
  key: 'reedlake_common_fish_frame', name: 'Fish-drying frame', culture: 'reedlake', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['kitchen', 'store', 'yard', 'dock'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['reed', 'rope', 'metal'],
  w: 1.4, d: 0.5, h: 1.7, variants: 1,
  build: function (F) {
    const reed = F.col('reedDark'), fish = F.col('fishSilver');
    for (const s of [-1, 1]) { F.beam(s * 0.65, 0, -0.22, s * 0.65, 1.7, 0, 0.06, 0.06, reed, 'reed'); F.beam(s * 0.65, 0, 0.22, s * 0.65, 1.7, 0, 0.06, 0.06, reed, 'reed'); }
    for (const y of [0.7, 1.2, 1.65]) F.rod(-0.68, y, 0, 0.68, y, 0, 0.02, F.shade(reed, 0.1), 'reed');
    for (const y of [0.7, 1.2, 1.65]) for (let i = 0; i < 6; i++) {
      const x = -0.5 + i * 0.2 + F.rr(-0.03, 0.03);
      F.rod(x, y, 0, x, y - 0.3, 0.02, 0.004, F.col('ropeRush'), 'rope');
      F.blob(x, y - 0.42, 0.02, 0.035, 0.26, F.rr(-0.3, 0.3), F.shade(fish, F.rr(-0.1, 0.1)), 'metal');
    }
  }
});
