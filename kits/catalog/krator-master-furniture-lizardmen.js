/* ======================================================================
   Lizardmen furniture: common and court tiers.
   Influences: Amerindian; reptilian motifs; simple but not primitive.
   Driftwood and swamp timber on post legs, woven reed seats, scale bands in
   jade and turquoise, basalt and olive clay, basking slabs instead of beds,
   coiled-serpent spirals on hangings. No socket pack yet (pack: null).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('lizardmen', { name: 'Lizardmen', pack: null, influences: 'reptilian motifs; Amerindian; simple but not primitive',
  materials: 'driftwood, swamp timber, woven reed, basalt, olive clay, jade and turquoise scale inlay, bone',
  palette: {
    timberSwamp: 0x4e5436, timberSwampDark: 0x34381f, timberDrift: 0x8a8468, timberDriftDark: 0x5e5a44, timberDriftLight: 0xa8a288,
    clothMoss: 0x4a6a3a, clothRust: 0x8a4a2a, clothOchre: 0xb8903a, clothBlack: 0x2a2a22, clothSand: 0xc8b48a,
    scaleJade: 0x3a7a5a, scaleTurquoise: 0x2c8a8a, scaleJadeDark: 0x245a40, boneIvory: 0xe6dec6,
    stoneBasalt: 0x3c3c38, stoneMud: 0x6a5a44, clayOlive: 0x7a7044, copper: 0xb5723a, reedPale: 0xb8a870,
    flame: 0xffb04a, ember: 0xd9762c, eggCream: 0xe8dcc0, sandWarm: 0xc8a870
  } });
/* END PALETTE */
const LIZ_COMMON = {
  emblem: { field: 'clothMoss', edge: 'timberSwampDark', band: 'clothOchre', ink: 'scaleTurquoise', ink2: 'clothBlack' },
  wood: 'timberDrift', woodDark: 'timberDriftDark', woodLight: 'timberDriftLight', woodFam: 'wood',
  cloth: ['clothMoss', 'clothOchre', 'clothRust', 'clothSand'], clothFam: 'cloth',
  accent: 'scaleJade', accentFam: 'jade', metal: 'copper', metalFam: 'bronze',
  clay: 'clayOlive', clayFam: 'stone', stone: 'stoneBasalt', stoneFam: 'stone', rope: 'reedPale',
  flame: 'flame', ember: 'ember',
  legs: 'post', motif: 'scale', bedBase: 'woven', seat: 'woven', finial: 'point',
  hearth: 'stone', fire: 'pit', lamp: 'oil', rug: 'reed', screen: 'reed', store: 'baskets',
  shelfFill: 'jars', rack: 'spears', art: 'relief', art2: 'skull', statue: 'guardian', tapestry: 'spiral',
  canopy: false, board: 'bark'
};
const LIZ_COURT = Object.assign({}, LIZ_COMMON, {
  wood: 'timberSwamp', woodDark: 'timberSwampDark', woodLight: 'timberDrift',
  cloth: ['clothBlack', 'clothOchre', 'clothMoss', 'clothRust'],
  accent: 'scaleTurquoise', accentFam: 'jade', motif: 'scale', finial: 'point', statue: 'guardian', screen: 'carved', rug: 'woven'
});
FK.set({ culture: 'lizardmen', tier: 'common', S: LIZ_COMMON, names: {
  bed: 'Woven sleeping frame', bench: 'Driftwood bench', chair: 'Woven-seat chair', stool: 'Post stool', table: 'Driftwood table',
  low_table: 'Low driftwood table', desk: 'Carving desk', chest: 'Scale-banded chest', bookcase: 'Jar shelves', wall_shelves: 'Basket shelves',
  store: 'Reed baskets', hearth: 'Basalt hearth', fire: 'Fire pit', lamp: 'Fat lamp on a post', candle: 'Fat lamp',
  hanging: 'Hanging oil bowl', rug: 'Reed mat', screen: 'Reed screen', counter: 'Trade counter', workbench: 'Workbench',
  loom: 'Reed loom', rack: 'Spear rack', ladder: 'Ladder', board: 'Bark tally board', art: 'Serpent relief', bowl: 'Olive clay bowl',
  jug: 'Olive clay jug and cups', books: 'Tally sticks' },
  override: {
    bed: { name: 'Basking slab', w: 1.3, d: 2.0, h: 0.5, variants: 2, variantNames: ['bare', 'with a nest'], materials: ['stone', 'reed', 'cloth', 'emissive'], build: function (F, S, o) {
      const st = F.col('stoneBasalt');
      F.box(0, 0, 0, 1.3, 0.3, 2.0, 0, st, 'stone');
      F.box(0, 0.3, 0, 1.22, 0.06, 1.92, 0, F.shade(st, 0.12), 'stone');
      for (let i = 0; i < 3; i++) F.box(-0.35 + i * 0.35, 0.1, 0.99, 0.2, 0.1, 0.02, 0, F.col('ember'), 'glow');   /* the warm coals under it */
      if (F.variant === 1) {
        for (let i = 0; i < 12; i++) F.box(F.rr(-0.4, 0.4), 0.36, F.rr(-0.6, 0.6), F.rr(0.3, 0.6), 0.03, 0.08, F.rr(-1.2, 1.2), F.shade('reedPale', F.rr(-0.15, 0.1)), 'reed');
        F.blob(0, 0.44, 0, 0.5, 0.1, 0, F.col('clothMoss'), 'cloth');
      }
      F.lamp(0, 0.2, 1.0, 0.4, 3);
    } }
  } });
FK.set({ culture: 'lizardmen', tier: 'court', S: LIZ_COURT, names: {
  bed: 'Great basking dais', throne: 'Serpent throne', divan: 'Elder\'s divan', table: 'Swamp-oak table', low_table: 'Low swamp-oak table',
  desk: 'Elder\'s desk', cabinet: 'Turquoise-inlaid cabinet', bookcase: 'Elder\'s shelves', hearth: 'Great basalt hearth', fire: 'Copper fire-bowl',
  lamp: 'Turquoise lamp stand', candelabra: 'Copper candelabra', hanging: 'Hanging copper bowl', carpet: 'Scale-woven carpet', screen: 'Carved scale screen',
  tapestry: 'Coiled serpent hanging', art: 'Serpent relief', statue: 'Guardian idol', jug: 'Turquoise-inlaid ewer', bowl: 'Turquoise-inlaid bowl' } });

FURN({
  key: 'lizardmen_court_egg_cradle', name: 'Clutch cradle', culture: 'lizardmen', tier: 'court', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'bedroom', 'court', 'hall'], anchor: 'floor', clearance: { front: 0.6, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['stone', 'bone', 'jade', 'emissive'],
  w: 1.1, d: 1.1, h: 0.7, variants: 1,
  build: function (F) {
    const st = F.col('stoneBasalt'), sand = F.col('sandWarm'), egg = F.col('eggCream');
    F.frustum(0, 0, 0, 0.45, 0.55, 0.42, 0, st, 'stone', 12);
    F.cyl(0, 0.42, 0, 0.5, 0.03, 0, sand, 'stone');
    for (let i = 0; i < 7; i++) { const a = i * F.TAU / 7 + 0.3, r = i ? 0.22 : 0; F.blob(Math.cos(a) * r, 0.52, Math.sin(a) * r, 0.1, 0.2, F.rr(-0.5, 0.5), F.shade(egg, F.rr(-0.06, 0.04)), 'bone'); }
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4; FK.motifAt(F, FK.pal(F, LIZ_COURT), LIZ_COURT, Math.cos(a) * 0.5, 0.25, Math.sin(a) * 0.5, 0.14, -a + Math.PI / 2, 'scale'); }
    F.blob(0, 0.12, 0, 0.42, 0.04, 0, F.col('ember'), 'glow');                      /* embers under the sand */
    F.lamp(0, 0.5, 0, 0.3, 3);
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed lizardmen_training_<role> */
FK.set({ culture: 'lizardmen', tier: 'common', roles: 'training', prefix: 'lizardmen_training_', S: LIZ_COMMON, names: {
  training_dummy: 'Basalt practice post', archery_butt: 'Scale-hide target' } });
