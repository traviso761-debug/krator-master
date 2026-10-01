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
    gourdOchre: 0xb89040,
    /* the harvested br_h_* pieces: Mav's Refuge and Girder's own palette (05-palette.js) and the
       Beast Rider building file's literals, where no key above already matches */
    plankHoney: 0x9a7a52, plankTan: 0x8a6c48, plankSand: 0xa8865c, plankDark: 0x7c6040,
    timberBistre: 0x5e4630, timberCocoa: 0x6a5038, timberSmoke: 0x4e3a28, timberTawny: 0x745a3e,
    timberBark: 0x6a5238, timberLeather: 0x7a6248, timberDoor: 0x40331f, leatherBrown: 0x5a4630,
    wallWicker: 0xb89a6c, wallReed: 0xa88a5e, wallFlax: 0xc4a878, wallKhaki: 0x9a7e56, wallCream: 0xd0b88a,
    wallTar: 0x6e5238, wallTarRed: 0x7a5c40,
    thatchStraw: 0xb09a5a, thatchHay: 0xa08a4e, thatchPale: 0xc0aa68, thatchOld: 0x8e7a44, thatchDun: 0x9a8a52,
    shingleBrown: 0x6a5a44, shingleDark: 0x5a4c3a,
    lacquerRed: 0x8a2f2a, gilt: 0xb08432, verdigris: 0x2f6a5a, lacquerDeep: 0x7a2028,
    ropeHemp: 0xa8966a, ropeJute: 0x98865c, ropeTwine: 0x9a8a62,
    clothRust: 0x8a5a2a, clothForest: 0x2f5a3a, clothMustard: 0xc2a24e, clothPlum: 0x4a3a6a, clothTerracotta: 0xb8683e,
    clothSage: 0x8a9a5a, clothMauve: 0x7a4a6a, clothBrick: 0xa85040, clothWheat: 0xb0894a,
    silkWhite: 0xe8ecec, silkGrey: 0xd8dede,
    cropGreen: 0x5c8a3a, cropLeaf: 0x7a9a3e, cropPale: 0x9aa848, cropDeep: 0x4e7a32,
    fernGreen: 0x2e5a2a, fernMoss: 0x3a6a30, saplingGreen: 0x3a6a34, leafJade: 0x3a7a4c,
    fruitOrange: 0xe0862a, fruitAmber: 0xd06a20, fruitGold: 0xf0a040, flowerViolet: 0x9a6ad8,
    gourdGreen: 0x8a9a4a, gourdRust: 0xb07a3a, gourdPale: 0xc2a05a,
    crateTan: 0x877558, crateDark: 0x6d5e45,
    stoneSlate: 0x6d665c, stoneDusk: 0x5c574f, stoneAsh: 0x7b7468, stoneCoal: 0x4f4a44, stonePlinth: 0x9a9484,
    ironDark: 0x2a2620, ironGrey: 0x6a655a, ironPot: 0x4a4038,
    waterGreen: 0x6f8f6a, glowWarm: 0xffb347, glowCool: 0x7fd8ff
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

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed br_trade_<role> */
FK.set({ culture: 'beast-rider', tier: 'common', roles: 'trade', prefix: 'br_trade_', S: BR_COMMON, names: {
  forge: 'Clay-hood forge', anvil: 'Anvil on a root stump', trough: 'Dugout trough', stall: 'Beast stall', hayrack: 'Fodder rack', display: 'Lashed display steps', armour_stand: 'Hide-and-bone armour on a post', weapon_rack: 'Lance rack', vat: 'Dye vat', still: 'Gourd still', bin: 'Woven grain bins', larder: 'Hanging larder', bunk: 'Lashed bunk', locker: 'Hide locker', lathe: 'Bow lathe', press: 'Fruit press', kiln: 'Clay kiln', grindstone: 'Grindstone', barrel: 'Gourd and cask cradle', altar: 'Beast-spirit altar' } });
