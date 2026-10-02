/* ======================================================================
   Voth furniture: common and court tiers (the harvested Voth street and
   tavern pieces stay in krator-master-furniture.js).
   Influences: Morrowind Dunmer, Aztec, Ottoman. Dark timber and ash-glazed
   stone, stepped-fret bands, pointed finials, lanterns of slate glass, low
   divans; court pieces in gilt on black with the deep purple of the Voth pack
   (core/sockets/80-cultures.js: field #4b2a6e, band #6a4a8f, ink #d8cdb4).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('voth', { name: 'Voth', pack: 'voth', influences: 'Morrowind Dunmer; Aztec; Ottoman',
  materials: 'dark walnut, ash-glazed stone, slate glass, brass; court: gilt, obsidian, plum silk',
  palette: {
    clothVothPurple: 0x4b2a6e, clothVothMauve: 0x6a4a8f, clothAsh: 0xd8cdb4,
    obsidian: 0x1a1a1e, obsidianLight: 0x2c2c34, lacquerBlack: 0x1e1a1a, ceramicAsh: 0x8a8a7a
  } });
/* END PALETTE */
const VOTH_COMMON = {
  emblem: { field: 'clothVothPurple', edge: 'clothVothMauve', band: 'clothVothMauve', ink: 'clothAsh' },
  wood: 'timberWalnut', woodDark: 'stoneEbony', woodLight: 'timberTeak', woodFam: 'wood',
  cloth: ['clothPlum', 'clothIndigo', 'clothTeal', 'clothMud'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'stoneUmber', clayFam: 'ceramic', stone: 'stoneGraphite', stoneFam: 'stone', rope: 'clothKhaki',
  flame: 'flame', ember: 'ember', lampCol: 'glassSlate',
  legs: 'block', motif: 'step', bedBase: 'plank', seat: 'cushion', finial: 'point',
  hearth: 'stone', fire: 'bowl', lamp: 'lantern', rug: 'knotted', screen: 'carved', store: 'jars',
  shelfFill: 'scrolls', rack: 'weapons', art: 'mask', art2: 'relief', statue: 'idol', tapestry: 'diamond',
  canopy: false, board: 'slate'
};
const VOTH_COURT = Object.assign({}, VOTH_COMMON, {
  wood: 'lacquerBlack', woodDark: 'obsidian', woodLight: 'stoneGraphite', woodFam: 'lacquer',
  cloth: ['clothVothPurple', 'clothPlum', 'clothGold', 'clothAsh'],
  accent: 'gilt', accentFam: 'gold', stone: 'obsidianLight', stoneFam: 'obsidian',
  motif: 'step', finial: 'point', statue: 'idol', art: 'relief', art2: 'mask', screen: 'carved', rug: 'knotted'
});
FK.set({ culture: 'voth', tier: 'common', S: VOTH_COMMON, names: {
  bed: 'Walnut bed with a stepped head', bench: 'Canton bench', chair: 'Fretted chair', stool: 'Block stool', table: 'Walnut table',
  low_table: 'Low walnut table', desk: 'Scribe desk', chest: 'Brass-banded chest', bookcase: 'Scroll case', wall_shelves: 'Ash-glaze shelves',
  store: 'Ash-glazed jars', hearth: 'Ashlar hearth', fire: 'Brass fire-bowl', lamp: 'Slate-glass lantern', candle: 'Candle dish',
  hanging: 'Hanging lantern', rug: 'Knotted rug', screen: 'Fretted screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Weaver\'s loom', rack: 'Guard rack', ladder: 'Ladder', board: 'Slate board', art: 'Ancestor mask', bowl: 'Ash-glaze bowl',
  jug: 'Ash-glaze jug and cups', books: 'Scroll cases' } });
FK.set({ culture: 'voth', tier: 'court', S: VOTH_COURT, names: {
  bed: 'Dais bed with a gilt head', throne: 'Councillor\'s seat', divan: 'Great divan', table: 'Council table', low_table: 'Gilt tray table',
  desk: 'Magistrate\'s desk', cabinet: 'Lacquer cabinet', bookcase: 'Great scroll case', hearth: 'Obsidian hearth', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern', candelabra: 'Gilt candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great carpet', screen: 'Gilt fretted screen',
  tapestry: 'Diamond hanging', art: 'Stepped relief', statue: 'Ancestor idol', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'voth_common_ash_niche', name: 'Ancestor niche', culture: 'voth', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['hall', 'bedroom', 'shrine', 'antechamber'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'ceramic', 'metal', 'emissive', 'plaster'],
  w: 0.8, d: 0.4, h: 1.6, variants: 1,
  build: function (F) {
    const st = F.col('stoneGraphite'), ash = F.col('ceramicAsh');
    F.box(0, 0, -0.1, 0.8, 1.6, 0.2, 0, st, 'stone');
    F.box(0, 0.6, -0.04, 0.5, 0.7, 0.28, 0, F.shade(st, -0.45), 'stone');        /* the recess */
    for (let i = 0; i < 3; i++) F.box(-0.25 + i * 0.25, 1.36, 0.02, 0.14, 0.1, 0.03, 0, F.shade(st, 0.15), 'stone');
    F.box(0, 0.55, 0, 0.8, 0.05, 0.4, 0, F.shade(st, 0.1), 'stone');              /* the ledge */
    F.frustum(0, 0.6, 0.02, 0.08, 0.13, 0.22, 0, ash, 'ceramic', 10);                 /* the urn */
    F.frustum(0, 0.82, 0.02, 0.13, 0.07, 0.1, 0, F.shade(ash, 0.08), 'ceramic', 10);
    F.cyl(0, 0.92, 0.02, 0.08, 0.04, 0, F.col('brass'), 'metal');
    for (const s of [-1, 1]) { F.cyl(s * 0.22, 0.6, 0.1, 0.02, 0.12, 0, F.col('clothBone'), 'plaster'); F.cone(s * 0.22, 0.72, 0.1, 0.01, 0.04, 0, F.col('flame'), 'glow'); }
    F.lamp(0, 0.9, 0.15, 0.3, 3);
  }
});
FURN({
  key: 'voth_court_armour_stand', name: 'Ordinator armour stand', culture: 'voth', tier: 'court', type: 'rack', setting: 'indoor',
  rooms: ['hall', 'court', 'antechamber', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'gold', 'cloth', 'metal'],
  w: 0.7, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    const gilt = F.col('gilt'), wood = F.col('lacquerBlack');
    F.cyl(0, 0, 0, 0.3, 0.06, 0, wood, 'wood');
    F.cyl(0, 0.06, 0, 0.04, 1.4, 0, wood, 'wood');
    F.box(0, 1.0, 0, 0.62, 0.5, 0.3, 0, gilt, 'gold');                               /* cuirass */
    F.box(0, 1.5, 0, 0.5, 0.08, 0.3, 0, F.shade(gilt, -0.1), 'gold');
    for (const s of [-1, 1]) F.frustum(s * 0.28, 1.42, 0, 0.1, 0.06, 0.16, 0, F.shade(gilt, -0.15), 'gold', 8);   /* pauldrons */
    F.ball(0, 1.72, 0, 0.14, gilt, 'gold');                                           /* the mask helm */
    F.box(0, 1.6, 0.1, 0.18, 0.2, 0.06, 0, F.shade(gilt, 0.15), 'gold');
    F.cone(0, 1.86, 0, 0.03, 0.04, 0, F.col('clothVothPurple'), 'cloth');
    F.box(0, 0.4, -0.08, 0.5, 0.62, 0.04, 0, F.col('clothVothPurple'), 'cloth');       /* the skirt of the robe */
  }
});
