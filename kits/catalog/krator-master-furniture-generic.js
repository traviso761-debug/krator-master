/* ======================================================================
   Generic wood set: the POOR tier any culture's poor buildings pull from.
   Plain joinery in local softwood, undyed cloth, hemp rope, terracotta, a
   fieldstone hearth. No motif, no accent beyond iron. kits/interiors falls
   back to it from every culture (IX.CULTURE_FAMILY).
   Built by FK.set() from the style sheet below; two bespoke pieces follow.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('generic', { name: 'Generic', pack: 'generic', influences: 'plain country joinery, any culture',
  materials: 'softwood, undyed linen, hemp, terracotta, fieldstone',
  palette: {
    timberPine: 0xa8865c, timberPineDark: 0x7a6040, timberPineLight: 0xc0a070, timberGrey: 0x8a8070,
    clothLinen: 0xd0c4a4, clothUndyed: 0xb8aa88, clothBrown: 0x7a5a3c, clothGreyBlue: 0x6a7684,
    ropeHemp: 0xa89868, clayTerracotta: 0xa8603c, stoneField: 0x7e7a70, stoneSoot: 0x2a2622,
    iron: 0x3e3a34, ember: 0xd9762c, flame: 0xffb04a
  } });
/* END PALETTE */
const GENERIC_STYLE = {
  wood: 'timberPine', woodDark: 'timberPineDark', woodLight: 'timberPineLight', woodFam: 'wood',
  cloth: ['clothLinen', 'clothUndyed', 'clothBrown', 'clothGreyBlue'], clothFam: 'cloth',
  accent: 'iron', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'clayTerracotta', clayFam: 'stone', stone: 'stoneField', stoneFam: 'stone', rope: 'ropeHemp',
  flame: 'flame', ember: 'ember',
  legs: 'straight', motif: 'none', bedBase: 'rope', seat: 'plank', finial: 'none',
  hearth: 'stone', fire: 'ring', lamp: 'candle', rug: 'rag', store: 'sacks', rack: 'tools', board: 'slate'
};
FK.set({ culture: 'generic', tier: 'poor', S: GENERIC_STYLE, names: {
  bed: 'Rope-strung cot', bench: 'Plank bench', stool: 'Three-plank stool', table: 'Plank table', chest: 'Pine chest',
  wall_shelves: 'Bracket shelves', store: 'Grain sacks', hearth: 'Fieldstone hearth', fire: 'Fire ring and tripod',
  lamp: 'Candle on a stand', mat: 'Rag rug', counter: 'Plank counter', workbench: 'Workbench', rack: 'Tool rack',
  ladder: 'Ladder', board: 'Slate board', bowl: 'Wooden bowl', jug: 'Jug and cups' } });

FURN({
  key: 'generic_poor_straw_bed', name: 'Straw pallet', culture: 'generic', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'thatch', 'cloth'],
  w: 1.0, d: 1.9, h: 0.3, variants: 1,
  build: function (F) {
    const wood = F.col('timberPineDark');
    F.box(0, 0, 0, 1.0, 0.12, 0.08, 0, wood, 'wood'); F.box(0, 0, 0.91, 1.0, 0.12, 0.08, 0, wood, 'wood'); F.box(0, 0, -0.91, 1.0, 0.12, 0.08, 0, wood, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.47, 0, 0, 0.06, 0.12, 1.9, 0, wood, 'wood');
    for (let i = 0; i < 9; i++) F.box(F.rr(-0.05, 0.05), 0.1, -0.8 + i * 0.2, 0.88, 0.06, 0.2, F.rr(-0.06, 0.06), F.shade('ropeHemp', F.rr(-0.1, 0.1)), 'thatch');
    F.box(0, 0.16, 0.1, 0.86, 0.04, 1.3, 0, F.col('clothUndyed'), 'cloth');
    F.blob(0, 0.22, -0.65, 0.26, 0.1, 0, F.col('clothLinen'), 'cloth');
  }
});
FURN({
  key: 'generic_poor_log_seat', name: 'Log round seat', culture: 'generic', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['hall', 'kitchen', 'yard', 'workshop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'bark'],
  w: 0.4, d: 0.4, h: 0.42, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.19, 0.42, 0, F.col('timberGrey'), 'bark');
    F.cyl(0, 0.42, 0, 0.17, 0.004, 0, F.col('timberPineLight'), 'wood');
    F.cyl(0, 0.42, 0, 0.09, 0.005, 0, F.col('timberPine'), 'wood');
  }
});
