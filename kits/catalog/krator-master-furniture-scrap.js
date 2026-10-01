/* ======================================================================
   Generic scrap set: the POOR tier of the post-apocalyptic world. Rusted
   angle iron, cut drums and pipe, tarpaulin, rag and salvaged plastic,
   concrete block. The poor counterpart of 'post-apoc' (the high-value
   salvaged-Ancients set) and the fallback for Screamers, Republicans and
   anyone living in a kits/post-apoc building.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('scrap', { name: 'Scrap', pack: 'generic', influences: 'post-apocalyptic salvage, any culture',
  materials: 'rusted steel, pipe, drum, tarpaulin, rag, plastic, concrete block',
  palette: {
    rustRed: 0x7a3b22, rustBrown: 0x5e3a28, rustDark: 0x3e2a20, steelGrey: 0x6e7376, steelDull: 0x55595c,
    tarpBlue: 0x3a6a9a, tarpOrange: 0xc8642a, ragGrey: 0x8a8478, ragOlive: 0x6a6a4a, ragBlack: 0x2a2a2a,
    plasticBlue: 0x2f6fb0, plasticOrange: 0xe08a2a, plasticWhite: 0xd8d4c8, plasticGreen: 0x4a8a4a,
    concrete: 0x9a9890, concreteDark: 0x6a6860, wireCopper: 0xb5723a, timberGrey: 0x8a8070,
    ember: 0xd9762c, flame: 0xff8a3c, bulb: 0xfff2c9
  } });
/* END PALETTE */
const SCRAP_STYLE = {
  wood: 'steelDull', woodDark: 'rustBrown', woodLight: 'steelGrey', woodFam: 'rust',
  cloth: ['tarpBlue', 'ragGrey', 'ragOlive', 'tarpOrange'], clothFam: 'cloth',
  accent: 'plasticOrange', accentFam: 'plastic', metal: 'rustRed', metalFam: 'rust',
  clay: 'plasticWhite', clayFam: 'plastic', stone: 'concrete', stoneFam: 'concrete', rope: 'wireCopper',
  flame: 'flame', ember: 'ember',
  legs: 'strut', motif: 'rivet', bedBase: 'plank', seat: 'cushion', finial: 'none',
  hearth: 'drum', fire: 'drum', lamp: 'bulb', lampCol: 'bulb', rug: 'rag', store: 'crates', rack: 'tools', board: 'plastic'
};
FK.set({ culture: 'scrap', tier: 'poor', S: SCRAP_STYLE, names: {
  bed: 'Strut-frame bunk', bench: 'Angle-iron bench', stool: 'Welded stool', table: 'Strut table', chest: 'Footlocker',
  wall_shelves: 'Rack shelving', store: 'Salvage crates', hearth: 'Drum stove', fire: 'Cut-drum fire',
  lamp: 'Salvaged bulb on a stand', mat: 'Rag mat', counter: 'Sheet-metal counter', workbench: 'Scrap workbench',
  rack: 'Tool rack', ladder: 'Pipe ladder', board: 'Scratched plastic board', bowl: 'Plastic bowl', jug: 'Jerrycan and cups' },
  override: {
    jug: { name: 'Jerrycan and cups', w: 0.42, d: 0.26, h: 0.34, materials: ['plastic', 'rustSteel'], build: function (F, S, o) {
      F.box(-0.08, 0, 0, 0.18, 0.28, 0.14, 0, F.col('plasticGreen'), 'plastic');
      F.box(-0.08, 0.28, 0.02, 0.06, 0.05, 0.06, 0, F.col('plasticOrange'), 'plastic');
      F.box(-0.08, 0.26, -0.05, 0.14, 0.03, 0.02, 0, F.shade('plasticGreen', -0.2), 'plastic');
      for (const [x, z] of [[0.1, 0.05], [0.16, -0.07]]) F.frustum(x, 0, z, 0.03, 0.038, 0.08, 0, F.col('steelGrey'), 'rust', 10);
    } }
  } });

FURN({
  key: 'scrap_poor_car_seat', name: 'Salvaged vehicle seat', culture: 'scrap', tier: 'poor', type: 'seating', setting: 'both',
  rooms: ['hall', 'tavern', 'bedroom', 'yard', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth', 'rustSteel', 'plastic'],
  w: 0.62, d: 0.62, h: 0.95, variants: 2, variantNames: ['single', 'bench seat'],
  variantDims: [{ w: 0.62, d: 0.62, h: 0.95 }, { w: 1.3, d: 0.62, h: 0.95 }],
  build: function (F) {
    const W = F.variant ? 1.3 : 0.62, c = F.pick(['tarpBlue', 'ragGrey', 'ragOlive', 'ragBlack']);
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.08), 0, 0, 0.1, 0.12, 0.5, 0, F.col('rustBrown'), 'rust');
    F.box(0, 0.12, 0.04, W - 0.04, 0.16, 0.54, 0, c, 'cloth');
    F.box(0, 0.28, 0.04, W - 0.04, 0.08, 0.54, 0, F.shade(c, 0.08), 'cloth');
    F.box(0, 0.12, -0.26, W - 0.04, 0.7, 0.1, 0, F.shade(c, -0.08), 'cloth');
    F.box(0, 0.82, -0.26, W - 0.04, 0.1, 0.1, 0, F.shade(c, -0.15), 'cloth');
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.02), 0.3, -0.1, 0.03, 0.4, 0.4, 0, F.col('plasticWhite'), 'plastic');
    F.box(0, 0.86, -0.27, Math.min(0.26, W * 0.4), 0.09, 0.08, 0, F.shade(c, -0.25), 'cloth');
  }
});
FURN({
  key: 'scrap_poor_tyre_table', name: 'Tyre and cable-drum table', culture: 'scrap', tier: 'poor', type: 'table', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'kitchen'], anchor: 'floor', clearance: { front: 0.5, back: 0.5, left: 0.5, right: 0.5 },
  materials: ['rustSteel', 'plastic', 'timber'],
  w: 0.9, d: 0.9, h: 0.72, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.3, 0.2, 0, F.col('ragBlack'), 'plastic');
    F.cyl(0, 0.2, 0, 0.3, 0.2, 0, F.shade('ragBlack', -0.1), 'plastic');
    F.cyl(0, 0.4, 0, 0.13, 0.26, 0, F.col('timberGrey'), 'wood');
    F.cyl(0, 0.66, 0, 0.45, 0.06, 0, F.col('timberGrey'), 'wood');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.box(Math.cos(a) * 0.3, 0.72, Math.sin(a) * 0.3, 0.04, 0.004, 0.14, -a, F.shade('timberGrey', -0.3), 'wood'); }
    F.cyl(0, 0.72, 0, 0.1, 0.004, 0, F.col('rustRed'), 'rust');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed scrap_trade_<role> */
FK.set({ culture: 'scrap', tier: 'poor', roles: 'trade', prefix: 'scrap_trade_', S: SCRAP_STYLE, names: {
  forge: 'Drum-and-brick forge', anvil: 'Rail-iron anvil', trough: 'Cut-tank trough', stall: 'Pallet stall', hayrack: 'Mesh hay rack', display: 'Crate display', armour_stand: 'Scrap-plate armour on a pipe', weapon_rack: 'Pipe weapon rack', vat: 'Drum vat', still: 'Jerrycan still', bin: 'Drum bins', larder: 'Fridge-shell larder', bunk: 'Strut bunk', locker: 'Steel locker', lathe: 'Salvaged lathe', press: 'Jack press', kiln: 'Brick-and-drum kiln', grindstone: 'Pedal grinder', barrel: 'Drum rack', altar: 'Scrap shrine' } });
