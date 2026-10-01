/* ======================================================================
   Iziz furniture: common and court tiers (the harvested Iziz street set
   stays in krator-master-furniture.js).
   Influences: science fantasy, Roman, Art Deco. Hyper-mahogany with bronze,
   chevron and stepped inlay, turned legs, glass lamps lit by salvaged
   electrics, mosaic and sun-plates. Colours follow the Iziz pack
   (core/sockets/80-cultures.js: orange #e07a2a, teal #2f8f8a, cream #f3e2c0).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('iziz', { name: 'Iziz', pack: 'iziz', influences: 'science fantasy; Roman; Art Deco',
  materials: 'hyper-mahogany, bronze, glazed ceramic, salvaged glass and electrics; court: gilt, marble',
  palette: {
    clothCream: 0xf3e2c0, mahoganyRed: 0x6a2a1e, mahoganyDark: 0x44190f, mahoganyLight: 0x8a4030,
    ceramicTeal: 0x2f8f8a, ceramicCream: 0xe8dcc4, marbleWhite: 0xe8e4dc, marbleVein: 0xc8c0b0
  } });
/* END PALETTE */
const IZIZ_COMMON = {
  emblem: { field: 'clothOrange', edge: 'clothTeal', band: 'clothCream', ink: 'clothCream', ink2: 'clothOrange' },
  wood: 'mahoganyRed', woodDark: 'mahoganyDark', woodLight: 'mahoganyLight', woodFam: 'mahogany',
  cloth: ['clothOrange', 'clothTeal', 'clothCream', 'clothCobalt'], clothFam: 'cloth',
  accent: 'bronze', accentFam: 'bronze', metal: 'bronzeDark', metalFam: 'bronze',
  clay: 'ceramicCream', clayFam: 'ceramic', stone: 'stoneGranite', stoneFam: 'stone', rope: 'timberFlax', tile: 'ceramicTeal',
  flame: 'flame', ember: 'amber', lampCol: 'electric',
  legs: 'turned', motif: 'chevron', bedBase: 'plank', seat: 'cushion', finial: 'disc',
  hearth: 'tile', fire: 'bowl', lamp: 'glass', rug: 'knotted', screen: 'lattice', store: 'jars',
  shelfFill: 'scrolls', rack: 'cloaks', art: 'sunplate', art2: 'mosaic', statue: 'figure', tapestry: 'sun',
  canopy: true, board: 'panel'
};
const IZIZ_COURT = Object.assign({}, IZIZ_COMMON, {
  cloth: ['clothGold', 'clothCrimson', 'clothTeal', 'clothCream'],
  accent: 'gilt', accentFam: 'gold', stone: 'marbleWhite', stoneFam: 'stone',
  motif: 'step', finial: 'disc', statue: 'figure', art: 'mosaic', art2: 'sunplate', lamp: 'glass'
});
FK.set({ culture: 'iziz', tier: 'common', S: IZIZ_COMMON, names: {
  bed: 'Mahogany bed', bench: 'Deco bench', chair: 'Turned chair', stool: 'Turned stool', table: 'Mahogany table',
  low_table: 'Low mahogany table', desk: 'Clerk\'s desk', chest: 'Bronze-banded chest', bookcase: 'Scroll case', wall_shelves: 'Kitchen shelves',
  store: 'Cream-glaze jars', hearth: 'Teal-tiled range', fire: 'Bronze fire-bowl', lamp: 'Electric standard lamp', candle: 'Candle dish',
  hanging: 'Electric pendant', rug: 'Sun-medallion rug', screen: 'Lattice screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Cloak rack', ladder: 'Ladder', board: 'Notice board', art: 'Sun plate', bowl: 'Cream bowl',
  jug: 'Cream jug and cups', books: 'Scroll cases' } });
FK.set({ culture: 'iziz', tier: 'court', S: IZIZ_COURT, names: {
  bed: 'Canopied mahogany bed', throne: 'Magistrate\'s chair', divan: 'Reception divan', table: 'Council table', low_table: 'Gilt tray table',
  desk: 'Magistrate\'s desk', cabinet: 'Gilt-inlaid cabinet', bookcase: 'Archive case', hearth: 'Marble hearth', fire: 'Gilt fire-bowl',
  lamp: 'Gilt electric lamp', candelabra: 'Gilt candelabra', hanging: 'Deco chandelier', carpet: 'Great sun carpet', screen: 'Gilt lattice screen',
  tapestry: 'Sun hanging', art: 'Mosaic panel', statue: 'Marble figure', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'iziz_common_console', name: 'Salvaged console desk', culture: 'iziz', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['study', 'library', 'workshop', 'hall'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['hyperMahogany', 'metal', 'glass', 'emissive', 'bronze'],
  w: 1.4, d: 0.7, h: 1.1, variants: 1,
  build: function (F) {
    const wood = F.col('mahoganyRed'), alloy = F.col('stoneLinen');
    for (const s of [-1, 1]) F.box(s * 0.62, 0, 0, 0.1, 0.72, 0.6, 0, wood, 'mahogany');
    F.box(0, 0.72, 0, 1.4, 0.06, 0.7, 0, F.shade(wood, 0.08), 'mahogany');
    F.box(0, 0.78, -0.2, 1.2, 0.08, 0.26, 0, alloy, 'metal');                     /* the ancient slab */
    F.box(0, 0.86, -0.22, 1.1, 0.24, 0.04, 0, F.shade(alloy, -0.2), 'metal');
    F.box(0, 0.88, -0.195, 1.0, 0.2, 0.01, 0, F.col('electric'), 'glow');          /* its live face */
    F.box(0, 0.78, 0.12, 0.6, 0.02, 0.2, 0, F.shade(alloy, -0.1), 'metal');          /* key plate */
    for (let i = 0; i < 6; i++) F.box(-0.25 + i * 0.1, 0.8, 0.12, 0.06, 0.012, 0.06, 0, i % 2 ? F.col('bronze') : F.col('electricDark'), i % 2 ? 'bronze' : 'glow');
    F.cyl(0.5, 0.78, 0.1, 0.04, 0.06, 0, F.col('bronze'), 'bronze');
    F.lamp(0, 1.0, 0, 0.5, 4);
  }
});
FURN({
  key: 'iziz_court_wall_fountain', name: 'Deco wall fountain', culture: 'iziz', tier: 'court', type: 'fountain', setting: 'both',
  rooms: ['hall', 'court', 'antechamber', 'yard'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['stone', 'gold', 'glass', 'bronze'],
  w: 1.4, d: 0.9, h: 2.0, variants: 1,
  build: function (F) {
    const marble = F.col('marbleWhite'), gilt = F.col('gilt'), water = F.col('iceDark');
    F.box(0, 0, -0.4, 1.4, 2.0, 0.1, 0, marble, 'stone');
    for (let i = 0; i < 5; i++) F.box(-0.5 + i * 0.25, 1.1, -0.34, 0.12, 0.8 - Math.abs(i - 2) * 0.2, 0.02, 0, gilt, 'gold');   /* stepped sunburst */
    FK.disc(F, 0, 1.3, -0.33, -0.3, 0.12, gilt, 'gold');
    F.frustum(0, 0, 0.1, 0.28, 0.34, 0.3, 0, marble, 'stone', 12);                    /* the basin */
    F.cyl(0, 0.3, 0.1, 0.31, 0.02, 0, water, 'glass');
    F.frustum(0, 0.32, -0.05, 0.08, 0.2, 0.4, 0, F.shade(marble, -0.08), 'stone', 8);
    F.cyl(0, 0.72, -0.05, 0.22, 0.02, 0, water, 'glass');
    F.rod(0, 1.1, -0.3, 0, 0.74, -0.05, 0.015, F.shade(water, 0.3), 'glass');          /* the spout stream */
    F.box(0, 0.8, -0.32, 0.2, 0.3, 0.06, 0, F.col('bronze'), 'bronze');
  }
});
