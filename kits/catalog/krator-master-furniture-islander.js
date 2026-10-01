/* ======================================================================
   Ring Sea Islander furniture: common and court tiers.
   Influences: Polynesian, Ashlander. Lashed koa on post legs, pandanus
   mats and woven seats, tapa cloth in bark and sand, gourds, shell and
   coral, wave bands, tiki idols; the chief's set in shell-pearl inlay.
   Colours follow the Islander pack (core/sockets/80-cultures.js: bark
   #8a5a32, sand #c49a5a, white #f0e8d4, sea #2a7a7a).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('islander', { name: 'Ring Sea Islanders', pack: 'ringsea-islander', influences: 'Polynesian; Ashlander',
  materials: 'koa, pandanus, tapa cloth, coir, gourd, shell, lava stone; court: shell-pearl inlay, red earth cloth',
  palette: {
    timberKoa: 0x7a4a2a, timberKoaDark: 0x4a2a14, timberKoaLight: 0x9a6a3a,
    tapaBark: 0x8a5a32, tapaSand: 0xc49a5a, tapaWhite: 0xf0e8d4, clothSea: 0x2a7a7a, clothRedEarth: 0x9a3a2a,
    pandanus: 0xb09050, pandanusPale: 0xc8b070, shellWhite: 0xe8e4d8, shellPearl: 0xdcdde6, coralPink: 0xd88a7a,
    stoneLava: 0x3a3634, clayBrown: 0x8a5a3a, ropeCoir: 0xa08050, iron: 0x3a3630, flame: 0xffb04a, ember: 0xd9762c, gourdGreen: 0x8a9a50
  } });
/* END PALETTE */
const ISL_COMMON = {
  emblem: { field: 'tapaBark', edge: 'timberKoaDark', band: 'tapaSand', ink: 'tapaWhite' },
  wood: 'timberKoa', woodDark: 'timberKoaDark', woodLight: 'timberKoaLight', woodFam: 'wood',
  cloth: ['tapaBark', 'tapaSand', 'tapaWhite', 'clothSea'], clothFam: 'cloth',
  accent: 'shellWhite', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'gourdGreen', clayFam: 'stone', stone: 'stoneLava', stoneFam: 'stone', rope: 'ropeCoir',
  flame: 'flame', ember: 'ember',
  legs: 'lashed', motif: 'wave', bedBase: 'woven', seat: 'woven', finial: 'none',
  hearth: 'stone', fire: 'pit', lamp: 'oil', rug: 'reed', screen: 'reed', store: 'gourds',
  shelfFill: 'bundles', rack: 'nets', art: 'mask', art2: 'panel', statue: 'idol', tapestry: 'moon',
  canopy: false, board: 'bark'
};
const ISL_COURT = Object.assign({}, ISL_COMMON, {
  cloth: ['tapaWhite', 'clothRedEarth', 'clothSea', 'tapaSand'],
  accent: 'shellPearl', accentFam: 'nacre', motif: 'wave', finial: 'disc', statue: 'idol', screen: 'carved', rug: 'woven', art: 'mask', art2: 'shield'
});
FK.set({ culture: 'islander', tier: 'common', S: ISL_COMMON, names: {
  bed: 'Lashed sleeping frame', bench: 'Lashed koa bench', chair: 'Woven-seat chair', stool: 'Lashed stool', table: 'Koa table',
  low_table: 'Low koa table', desk: 'Tally desk', chest: 'Koa chest', bookcase: 'Bundle shelves', wall_shelves: 'Gourd shelves',
  store: 'Gourds', hearth: 'Lava-stone hearth', fire: 'Fire pit', lamp: 'Coconut-oil lamp on a post', candle: 'Shell oil lamp',
  hanging: 'Hanging oil bowl', rug: 'Pandanus mat', screen: 'Pandanus screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Tapa beating frame', rack: 'Net rack', ladder: 'Ladder', board: 'Bark tally board', art: 'Carved mask', bowl: 'Gourd bowl',
  jug: 'Gourd and cups', books: 'Tally sticks' } });
FK.set({ culture: 'islander', tier: 'court', S: ISL_COURT, names: {
  bed: 'Chief\'s dais bed', throne: 'Chief\'s seat', divan: 'Chief\'s divan', table: 'Chief\'s feast table', low_table: 'Shell-inlaid low table',
  desk: 'Chief\'s tally desk', cabinet: 'Shell-inlaid cabinet', bookcase: 'Chief\'s shelves', hearth: 'Great lava hearth', fire: 'Iron fire-bowl',
  lamp: 'Shell-inlaid lamp post', candelabra: 'Shell oil lamps', hanging: 'Hanging oil bowl', carpet: 'Great woven mat', screen: 'Carved screen',
  tapestry: 'Moon tapa hanging', art: 'Great mask', statue: 'Tiki', jug: 'Shell-inlaid gourd', bowl: 'Shell-inlaid bowl' } });

FURN({
  key: 'islander_common_kava_bowl', name: 'Kava bowl', culture: 'islander', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['hall', 'court', 'tavern', 'yard'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['timber', 'rope', 'bone'],
  w: 0.7, d: 0.7, h: 0.32, variants: 1,
  build: function (F) {
    const wood = F.col('timberKoaDark');
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + 0.4; F.cyl(Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24, 0.03, 0.14, 0, wood, 'wood'); }
    F.frustum(0, 0.12, 0, 0.22, 0.34, 0.16, 0, wood, 'wood', 16);
    F.cyl(0, 0.28, 0, 0.3, 0.01, 0, F.shade('timberKoa', 0.25), 'wood');
    F.rod(0.3, 0.2, 0, 0.34, 0.08, 0.1, 0.012, F.col('ropeCoir'), 'rope');
    F.ball(0.34, 0.07, 0.1, 0.03, F.col('shellWhite'), 'bone');
  }
});
