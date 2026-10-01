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
    ember: 0xd9762c, flame: 0xff8a3c, bulb: 0xfff2c9,
    /* harvested from kits/post-apoc (its PAL and builders' colours), the pa_* pieces at the end of this file */
    tyreBlack: 0x232120, tyreGrey: 0x3a3634, sackPad: 0x4a4034,
    cordOchre: 0xa8892a, cordOlive: 0x6a7a3a, cordOrange: 0x9a5a2a, cordWhite: 0xb8b0a0,
    woodOxblood: 0x5a2a24, woodPine: 0xa88a5e, woodTeak: 0x7a5236,
    plankWeathered: 0x9a7a52, plankBrown: 0x8a6a44, plankDark: 0x7a5c3c, plankPale: 0xb09468, plankTan: 0xa08258, plankGrey: 0x6a5a44,
    postBrown: 0x5c4630, timberDark: 0x6a5238, timberUmber: 0x4a3a2c, stumpBrown: 0x6a4a30, timberBlack: 0x3a2a1c,
    ironDark: 0x3a3430, ironBrown: 0x4a4038, ironUmber: 0x5a4a3c, ironTaupe: 0x6a5a4c, ironBlack: 0x2a2826,
    steelLight: 0x8a8a86, steelMid: 0x6a6a66, steelBlock: 0x4a4a46, steelBlade: 0xb8b8b0, galv: 0xb4b8b8, galvDull: 0xa8a49a,
    rustOrange: 0x8a4a2a, rustPipe: 0x8a5a3a, rustRebar: 0x6a3a26, rustPlate: 0x7a4a3a,
    drumRed: 0x8a3a2c, drumGrey: 0x5a5a56, paintBlue: 0x2f5f8f, paintOlive: 0x4d6f3c, paintOchre: 0x8a6a3a, paintGrey: 0x9a9a92,
    paintMustard: 0xc99a2e, paintTeal: 0x3b7f6e, paintRed: 0x7a2e28, paintOrange: 0xc45a30, paintCyan: 0x2f7f8e,
    paintCream: 0xe8dcc0, paintPlum: 0x8a3a6a, paintBrick: 0x9a3a2c, paintSea: 0x3b6f7e, flagRed: 0xc9442a, flagGold: 0xd8a020,
    tarpGreen: 0x5a7a4a, tarpOchre: 0xb09a4a, buttBlue: 0x3a6a8a, buttGrey: 0x6a7a78,
    sackcloth: 0xb8a888, sackclothTan: 0xa89a7c, sackclothDark: 0x8a7a62, sackclothPale: 0xc6b898, charcoal: 0x2a2624,
    earthBrick: 0x8a4a3a, earthRammed: 0xb0a088, earthAsh: 0xa08a70, earthDark: 0x8a7a64,
    soilBrown: 0x4a3220, soilDark: 0x3e2a1c, soilFurrow: 0x4a301c,
    stoneField: 0x8a8478, stonePale: 0x9a9488, stoneLight: 0xb0a898,
    glowFire: 0xff9a3a, glowFlame: 0xffe28a, glowBulb: 0xffd890, glowCoal: 0xff7a2a, glowHot: 0xffb040, glowStrip: 0xf2c26a,
    waterSteel: 0x2a5a6a, waterTeal: 0x3a6a70, waterDark: 0x1a2a30, waterDeep: 0x1a3a4a, shaftBlack: 0x14100c,
    produceRed: 0xc23a2a, produceYellow: 0xd8a02a, produceGreen: 0x5a9a3a, produceOrange: 0xe07a2a, producePlum: 0x8a3a5a,
    produceLime: 0x7ab04a, produceTan: 0xe0b060, produceAmber: 0xc88a3a, breadCrust: 0xc8843a,
    fishSilver: 0xc8ccc8, fishGrey: 0xb8bcb4, fishTan: 0xd8b98a, fishTail: 0xc9843a, fishDry: 0xc8a878, fishPink: 0xd88a5a,
    fishDark: 0x8a8a7a, meatRed: 0x8a2f24, meatDark: 0x6a2a20,
    hubcap: 0xdcd8cc, brass: 0xb8902a, padlockBrass: 0xb8983a, capSilver: 0xc8ccd0, capGrey: 0xa8acb0, capBrass: 0xc9a03a,
    helmetCopper: 0xb87a4a, helmetTeal: 0x7a8a8a,
    straw: 0xb89a48, strawDark: 0xa8883e, hayGold: 0xd8b840, strawTarget: 0xc8a860,
    boneWhite: 0xe0d6c0, dollPale: 0xe8d8c0, dollTan: 0xd8c0a8, dollDark: 0xc8b090, eyeBlack: 0x1a1614,
    ropeTan: 0x8a7a5a, ropeDark: 0x6a5a44, netBrown: 0x7a6a4a, clothRust: 0xa04a2a, clothBurlap: 0xd8c090, clothDenim: 0x4a5a6a,
    targetWhite: 0xd8d0c0, targetBlue: 0x2a5a8a, targetGold: 0xe0b830,
    bottleGreen: 0x3f9a52, bottleAmber: 0xc98a2a, bottleBlue: 0x2f62b8, bottleClear: 0xd5ecea,
    wireBrass: 0xc98a3a, wireBlue: 0x3a5a8a, potCopper: 0xb8683a, potBlue: 0x4a6a8a,
    lidGrey: 0x5a6a68, lidOchre: 0x9a8a4a, rockerBrown: 0x8a5a30, rockerBlue: 0x3f7fc0
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
