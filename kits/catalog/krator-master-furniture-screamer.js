/* ======================================================================
   Screamer furniture: common and court tiers (the chief's).
   Influences: primitive, Amazonian, heavy scrap use. Lashed bark timber,
   hide and feather cloth, bone, salvaged rust and plastic worn as treasure,
   painted dots, skull crests; the chief's set is the same with more skulls
   and the brightest scrap. Pack: the generic one (no Screamer pack yet).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('screamer', { name: 'Screamers', pack: 'generic', influences: 'primitive; Amazonian; heavy scrap use',
  materials: 'bark timber, vine, hide, feathers, bone, rusted and plastic scrap',
  palette: {
    timberGreen: 0x5a6a3a, timberBark: 0x6a5238, timberBarkDark: 0x463424, timberPale: 0xa09060,
    featherRed: 0xc8342a, featherYellow: 0xe0b030, featherBlue: 0x2a6aa0, clothRag: 0x7a7060, clothBlack: 0x2a2622, hideTan: 0x9a7a52,
    rustRed: 0x7a3b22, rustDark: 0x3e2a20, steelDull: 0x55595c, plasticOrange: 0xe08a2a, plasticBlue: 0x2f6fb0,
    boneIvory: 0xe6dcc6, boneDark: 0xc8b898, clayBlack: 0x3a3632, stoneMoss: 0x4a5a3a, ropeVine: 0x7a8a4a,
    flame: 0xff8a3c, ember: 0xd9762c
  } });
/* END PALETTE */
const SCR_COMMON = {
  wood: 'timberBark', woodDark: 'timberBarkDark', woodLight: 'timberPale', woodFam: 'bark',
  cloth: ['featherRed', 'featherYellow', 'featherBlue', 'hideTan'], clothFam: 'hide',
  accent: 'boneIvory', accentFam: 'bone', metal: 'rustRed', metalFam: 'rust',
  clay: 'clayBlack', clayFam: 'stone', stone: 'stoneMoss', stoneFam: 'stone', rope: 'ropeVine',
  flame: 'flame', ember: 'ember',
  legs: 'lashed', motif: 'dots', bedBase: 'woven', seat: 'hide', finial: 'skull',
  hearth: 'drum', fire: 'pit', lamp: 'torch', rug: 'hide', screen: 'hide', store: 'baskets',
  shelfFill: 'parts', rack: 'spears', art: 'skull', art2: 'mask', statue: 'skullpole', tapestry: 'figure',
  canopy: false, board: 'plastic'
};
const SCR_COURT = Object.assign({}, SCR_COMMON, {
  cloth: ['featherRed', 'featherBlue', 'featherYellow', 'clothBlack'],
  accent: 'plasticOrange', accentFam: 'plastic', metal: 'steelDull', metalFam: 'rust',
  motif: 'skull', finial: 'skull', statue: 'skullpole', art: 'skull', art2: 'mask', screen: 'hide', rug: 'hide', hearth: 'drum', fire: 'drum'
});
FK.set({ culture: 'screamer', tier: 'common', S: SCR_COMMON, names: {
  bed: 'Vine-lashed sleeping frame', bench: 'Lashed bench', chair: 'Hide-seat chair', stool: 'Lashed stool', table: 'Lashed table',
  low_table: 'Low lashed table', desk: 'Tally desk', chest: 'Hide-bound box', bookcase: 'Scrap shelves', wall_shelves: 'Basket shelves',
  store: 'Vine baskets', hearth: 'Drum stove', fire: 'Fire pit', lamp: 'Torch stand', candle: 'Fat lamp',
  hanging: 'Hanging torch cage', rug: 'Beast hide', screen: 'Hide screen', counter: 'Trade counter', workbench: 'Scrap workbench',
  loom: 'Loom', rack: 'Spear rack', ladder: 'Ladder', board: 'Scratched plastic board', art: 'Mounted skull', bowl: 'Black clay bowl',
  jug: 'Black clay jug and cups', books: 'Tally sticks' } });
FK.set({ culture: 'screamer', tier: 'court', S: SCR_COURT, names: {
  bed: 'Chief\'s dais', throne: 'Chief\'s skull seat', divan: 'Chief\'s divan', table: 'Chief\'s feast table', low_table: 'Low chief\'s table',
  desk: 'Chief\'s tally desk', cabinet: 'Treasure cabinet', bookcase: 'Treasure shelves', hearth: 'Great drum stove', fire: 'Cut-drum fire',
  lamp: 'Torch stand', candelabra: 'Bone candelabra', hanging: 'Hanging torch cage', carpet: 'Great hide', screen: 'Painted hide screen',
  tapestry: 'Painted hide hanging', art: 'Great skull', statue: 'Skull pole', jug: 'Scrap-trimmed jug', bowl: 'Scrap-trimmed bowl' } });

FURN({
  key: 'screamer_court_scrap_altar', name: 'Scrap altar', culture: 'screamer', tier: 'court', type: 'altar', setting: 'both',
  rooms: ['shrine', 'hall', 'court', 'yard'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['rustSteel', 'plastic', 'bone', 'cloth', 'emissive', 'bark', 'hide'],
  w: 1.6, d: 0.9, h: 2.2, variants: 1,
  build: function (F) {
    const rust = F.col('rustRed'), bone = F.col('boneIvory');
    F.box(0, 0, 0, 1.6, 0.5, 0.9, 0, F.col('rustDark'), 'rust');
    F.box(0, 0.5, 0, 1.5, 0.06, 0.8, 0, rust, 'rust');
    F.box(0, 0, -0.42, 1.4, 2.2, 0.06, 0, F.col('steelDull'), 'rust');                  /* a bulkhead panel */
    for (let i = 0; i < 4; i++) F.box(-0.55 + i * 0.37, 1.0 + F.rr(-0.1, 0.1), -0.36, 0.2, 0.2, 0.06, F.rr(-0.2, 0.2), F.pick(['plasticOrange', 'plasticBlue', 'featherYellow']), 'plastic');
    F.ball(0, 1.75, -0.22, 0.2, bone, 'bone');                                           /* the great skull */
    F.box(0, 1.5, -0.22, 0.26, 0.16, 0.2, 0, F.shade(bone, -0.1), 'bone');
    for (const s of [-1, 1]) F.rod(s * 0.2, 1.85, -0.22, s * 0.6, 2.15, -0.3, 0.03, F.shade(bone, -0.15), 'bone');
    for (let i = 0; i < 5; i++) F.ball(-0.5 + i * 0.25, 0.63, 0.1, 0.07, F.shade(bone, F.rr(-0.1, 0.05)), 'bone');
    for (let i = 0; i < 3; i++) F.cone(-0.3 + i * 0.3, 0.56, 0.3, 0.015, 0.1, 0, F.col('flame'), 'glow');
    F.box(0, 0.56, -0.1, 1.2, 0.02, 0.3, 0, F.col('featherRed'), 'hide');
    for (let i = 0; i < 6; i++) F.cone(-0.6 + i * 0.24, 0.8, -0.38, 0.03, 0.3, 0, F.pick(['featherRed', 'featherYellow', 'featherBlue']), 'hide');
    F.lamp(0, 0.9, 0.2, 0.5, 5);
  }
});
