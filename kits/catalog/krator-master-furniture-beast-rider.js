/* ======================================================================
   Beast Rider furniture: common and court tiers (the harvested Mav's Refuge
   and Girder pieces stay in krator-master-furniture.js, keys br_*).
   Influences: Amerindian, Javan; simple but not primitive. Lashed hardwood,
   woven and hide seats, bone and horn, big animal skulls; court pieces in
   hyper-mahogany with bone inlay and skull crests. Greens and claw-pale
   cloth from the Beast Rider pack (core/sockets/80-cultures.js).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('beast-rider', { name: 'Beast Riders', pack: 'beast-rider', influences: 'Amerindian; Javan; big animal skulls',
  materials: 'lashed hardwood, hide, woven fibre, bone and horn; court: hyper-mahogany, bone inlay, skulls',
  palette: {
    boneIvory: 0xe8e0cc, boneDark: 0xc8b898, mahoganyRed: 0x6a2a1e, mahoganyDark: 0x44190f, mahoganyLight: 0x8a4030,
    clothClawGreen: 0x3f7a3a, clothClawPale: 0xe6dcc2, clothMossDark: 0x2e5a2c, flame: 0xff8a3c, ember: 0xd9762c,
    gourdOchre: 0xb89040
  } });
/* END PALETTE */
const BR_COMMON = {
  wood: 'timberMud', woodDark: 'timberSepia', woodLight: 'timberStraw', woodFam: 'wood',
  cloth: ['clothVermilion', 'clothSaffron', 'clothTeal', 'hideOak'], clothFam: 'hide',
  accent: 'boneIvory', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'gourdOchre', clayFam: 'stone', stone: 'stoneTaupe', stoneFam: 'stone', rope: 'timberStraw',
  flame: 'flame', ember: 'ember',
  legs: 'lashed', motif: 'lash', bedBase: 'woven', seat: 'hide', finial: 'none',
  hearth: 'stone', fire: 'pit', lamp: 'torch', rug: 'hide', screen: 'hide', store: 'gourds',
  shelfFill: 'bundles', rack: 'spears', art: 'skull', art2: 'antler', statue: 'totem', tapestry: 'claw',
  canopy: false, board: 'hide'
};
const BR_COURT = Object.assign({}, BR_COMMON, {
  wood: 'mahoganyRed', woodDark: 'mahoganyDark', woodLight: 'mahoganyLight', woodFam: 'mahogany',
  cloth: ['clothClawGreen', 'clothClawPale', 'clothVermilion', 'clothMossDark'], clothFam: 'cloth',
  legs: 'block', motif: 'skull', finial: 'skull', statue: 'skullpole', art: 'skull', art2: 'antler', rug: 'hide', screen: 'carved'
});
FK.set({ culture: 'beast-rider', tier: 'common', prefix: 'br_common_', S: BR_COMMON, names: {
  bed: 'Lashed bed with a hide', bench: 'Lashed bench', chair: 'Hide-seat chair', stool: 'Lashed stool', table: 'Lashed table',
  low_table: 'Low lashed table', desk: 'Tally desk', chest: 'Hide-bound chest', bookcase: 'Bundle shelves', wall_shelves: 'Gourd shelves',
  store: 'Gourds', hearth: 'Stone hearth', fire: 'Fire pit', lamp: 'Torch stand', candle: 'Tallow dish',
  hanging: 'Hanging torch cage', rug: 'Beast hide', screen: 'Hide screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Spear rack', ladder: 'Ladder', board: 'Hide tally board', art: 'Mounted skull', bowl: 'Gourd bowl',
  jug: 'Gourd and cups', books: 'Tally sticks' } });
FK.set({ culture: 'beast-rider', tier: 'court', prefix: 'br_court_', S: BR_COURT, names: {
  bed: 'Chief\'s dais bed', throne: 'Skull throne', divan: 'Chief\'s divan', table: 'Mahogany feast table', low_table: 'Low mahogany table',
  desk: 'Chief\'s tally desk', cabinet: 'Bone-inlaid cabinet', bookcase: 'Trophy shelves', hearth: 'Great hearth', fire: 'Iron fire-bowl',
  lamp: 'Bone lamp stand', candelabra: 'Horn candelabra', hanging: 'Hanging torch cage', carpet: 'Great hide', screen: 'Carved screen',
  tapestry: 'Claw hanging', art: 'Great skull', statue: 'Skull pole', jug: 'Bone-inlaid ewer', bowl: 'Bone-inlaid bowl' },
  override: {
    throne: { name: 'Skull throne', w: 1.1, d: 0.9, h: 2.0, build: function (F, S, o) {
      FK.build.throne(F, S, Object.assign({}, o, { h: 1.3 }));
      const bone = F.col('boneIvory');
      F.blob(0, 1.6, -0.18, 0.25, 0.6, 0, bone, 'bone');                          /* the great skull crest */
      F.box(0, 1.22, -0.2, 0.4, 0.2, 0.3, 0, F.shade(bone, -0.08), 'bone');
      for (const s of [-1, 1]) { F.ball(s * 0.13, 1.68, -0.08, 0.07, F.col('mahoganyDark'), 'mahogany'); F.rod(s * 0.3, 1.8, -0.3, s * 0.52, 1.96, -0.38, 0.03, F.shade(bone, -0.12), 'bone'); }
    } }
  } });

FURN({
  key: 'br_court_saddle_stand', name: 'Beast saddle on its stand', culture: 'beast-rider', tier: 'court', type: 'rack', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['hyperMahogany', 'hide', 'bone', 'metal'],
  w: 1.0, d: 1.6, h: 1.3, variants: 1,
  build: function (F) {
    const wood = F.col('mahoganyRed'), hide = F.col('hideOak'), bone = F.col('boneIvory');
    for (const s of [-1, 1]) { F.beam(s * 0.4, 0, -0.6, 0, 0.9, -0.6, 0.08, 0.08, wood, 'mahogany'); F.beam(s * 0.4, 0, 0.6, 0, 0.9, 0.6, 0.08, 0.08, wood, 'mahogany'); }
    F.box(0, 0.86, 0, 0.24, 0.12, 1.5, 0, wood, 'mahogany');
    F.box(0, 0.98, 0, 0.6, 0.12, 1.1, 0, hide, 'hide');                          /* the saddle */
    F.box(0, 1.1, -0.42, 0.5, 0.2, 0.14, 0, F.shade(hide, -0.1), 'hide');          /* cantle */
    F.frustum(0, 1.1, 0.4, 0.06, 0.03, 0.2, 0, bone, 'bone', 8);                 /* horn */
    for (const s of [-1, 1]) { F.box(s * 0.32, 0.5, 0.1, 0.06, 0.5, 0.4, 0, F.shade(hide, 0.08), 'hide'); F.box(s * 0.35, 0.44, 0.1, 0.12, 0.08, 0.18, 0, F.col('iron'), 'metal'); }
    for (let i = 0; i < 5; i++) F.ball(-0.2 + i * 0.1, 1.11, -0.5, 0.02, bone, 'bone');
  }
});
