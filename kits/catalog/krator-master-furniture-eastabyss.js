/* ======================================================================
   East Abyss furniture: common and court tiers.
   Influences: Maghrebi, Arab. Cedar on turned legs, reed mats and woven
   bed-bases (the lake and abyss cultures use reeds), lime plaster and
   zellige tile, brass lanterns, lattice (mashrabiya) screens, lozenge
   bands; court in gilt with indigo and saffron silks. No socket pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('eastabyss', { name: 'East Abyss', pack: null, influences: 'Maghrebi; Arab',
  materials: 'cedar, reed, lime plaster, zellige tile, brass, terracotta; court: gilt, indigo and saffron silk',
  palette: {
    timberCedar: 0x8a5a38, timberCedarDark: 0x5a3a24, timberCedarLight: 0xa87a50,
    clothIndigo: 0x2a4a8a, clothSaffron: 0xd8a030, clothMadder: 0xa83a2a, clothWhite: 0xece6d6, clothTurquoise: 0x2c8aa0, clothOlive: 0x6a7a3a,
    reedPale: 0xc8b888, plasterLime: 0xe8e0cc, tileZellige: 0x1f6a8a, tileWhite: 0xe8e4d8, tileGreen: 0x2a7a5a,
    brass: 0xb08432, gilt: 0xd9b23c, copper: 0xb5723a, clayTerra: 0xb06a44, stoneSand: 0xc8b088, iron: 0x3a3630,
    flame: 0xffc861, ember: 0xd9762c, glassAmber: 0xe0a040,
    /* the Locus Eastern Abyssal kit (settlements/locus/src/05-palette.js: TIMBERC PLANKC RUSTC STEELDC PIPEC METALC
       TARNC ADOBEC ADOBEREDC CANVASC REEDMATC THATCHC CLOTHC BRASSC and the ab* block), for the harvested abyss_* pieces */
    timberWalnut: 0x6a4e34, timberSmoke: 0x5c432c, timberChestnut: 0x7a5a3c, timberUmber: 0x4e3a28,
    plankOak: 0x9a7a52, plankTan: 0x8a6c48, plankHoney: 0xa8865c, plankDusk: 0x7c6040,
    rustSheet: 0x8a4a2b, rustOrange: 0xa5602f, rustDeep: 0x7a3b22, rustRed: 0x8a4526, rustDark: 0x6a311e, rustBrown: 0x94522c, rustBlack: 0x5a2a1a,
    steelDark: 0x4a4642, steelSoot: 0x3e3a36, steelGrey: 0x565250, steelBlack: 0x2e2b28, pipeGrey: 0x6c6660, pipePale: 0x7a746c, pipeDark: 0x5c5650,
    alloyWhite: 0xe6e4dc, alloyPale: 0xdad8ce, alloyBright: 0xeeece6, alloyGrey: 0xcfccc0, alloyTarnish: 0xb4b0a2, alloyTarnishDark: 0xa6a294,
    tinMirror: 0xc9cdd2, giltDeep: 0xd4a537, lacquerRed: 0x9a2c26, crystalBlue: 0x5bc8e6,
    sailOrange: 0xe07b39, sailRed: 0xb8402e, paintYellow: 0xf2c230, paintTeal: 0x2fa59a, paintPink: 0xe26d8e, tarpBlue: 0x2e6fb7,
    saltWhite: 0xe9e4d6, saltGrey: 0xdcd4c4, stoneRubble: 0x9c8e7c, waterBrackish: 0x9fb9b0, waterSalt: 0xb3c8bf,
    wireBlack: 0x1e1a18, ropePale: 0xd8d0c0, ropeCoir: 0xa89060, brassBright: 0xc29a44, brassDark: 0x9a7228,
    clayOchre: 0xc89a62, clayMud: 0xbc8e58, clayStraw: 0xd4a66e, clayBrown: 0xb08250,
    clayLaterite: 0xb4683e, clayRust: 0xa85c36, clayRed: 0xc07448, clayDarkRed: 0x9c5230,
    canvasRaw: 0xe6dbc2, canvasFaded: 0xdccfb0, canvasPale: 0xeee5d0, canvasTan: 0xd0c4a4,
    reedMat: 0xcdb98a, reedMatDark: 0xc0ac7e, reedMatLight: 0xd8c69a, reedMatOld: 0xb49f72,
    thatchStraw: 0xb8a262, thatchOld: 0xa89256, thatchGold: 0xc8b272, fodderStraw: 0xc8b070,
    clothBlue: 0x2e5a8a, clothRed: 0xb83a2e, clothCream: 0xf0ece0, clothGreen: 0x2f8a6a, clothPurple: 0x6a3a7a, clothOrange: 0xc8642a,
    sackTan: 0xc8b080, netBrown: 0x8a7a5a, fishDried: 0xb8a070, fishSmoked: 0x9a8058, fishPale: 0xc0a888, fishSilver: 0x9aa8b0, riceGreen: 0xb0c46c,
    glassGreen: 0x6aa84a, glassMagenta: 0xc84a8a, bindingBrown: 0x6a4a2a, bindingSlate: 0x3a4a6a, soilDark: 0x3a2a1a,
    voidBlack: 0x14161a, ashCold: 0x2a2622, coalBed: 0x3a1a0a, coalDeep: 0x2a1810, forgeGlow: 0xff7a30, flameFlare: 0xffb040, glowWarm: 0xffb755,
    lanternDark: 0x6a5a3a, bulbDark: 0x8a7a52
  } });
/* END PALETTE */
const EA_COMMON = {
  emblem: { field: 'clothIndigo', edge: 'clothMadder', band: 'clothSaffron', ink: 'clothWhite', ink2: 'clothSaffron' },
  wood: 'timberCedar', woodDark: 'timberCedarDark', woodLight: 'timberCedarLight', woodFam: 'wood',
  cloth: ['clothIndigo', 'clothSaffron', 'clothMadder', 'clothWhite'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'iron', metalFam: 'metal',
  clay: 'clayTerra', clayFam: 'ceramic', stone: 'stoneSand', stoneFam: 'stone', rope: 'reedPale', tile: 'tileZellige',
  flame: 'flame', ember: 'ember', lampCol: 'glassAmber',
  legs: 'turned', motif: 'lozenge', bedBase: 'woven', seat: 'cushion', finial: 'knob',
  hearth: 'tile', fire: 'bowl', lamp: 'lantern', rug: 'reed', screen: 'lattice', store: 'jars',
  shelfFill: 'scrolls', rack: 'cloaks', art: 'plate', art2: 'mosaic', statue: 'urn', tapestry: 'grid',
  canopy: true, board: 'panel'
};
const EA_COURT = Object.assign({}, EA_COMMON, {
  cloth: ['clothIndigo', 'clothSaffron', 'clothWhite', 'clothTurquoise'],
  accent: 'gilt', accentFam: 'gold', stone: 'plasterLime', stoneFam: 'plaster', tile: 'tileGreen',
  rug: 'knotted', screen: 'lattice', statue: 'vase', art: 'mosaic', art2: 'plate', motif: 'lozenge', finial: 'knob'
});
FK.set({ culture: 'eastabyss', tier: 'common', S: EA_COMMON, names: {
  bed: 'Cedar bed with a reed base', bench: 'Cedar bench', chair: 'Turned cedar chair', stool: 'Turned stool', table: 'Cedar table',
  low_table: 'Low tray table', desk: 'Scribe\'s desk', chest: 'Brass-studded chest', bookcase: 'Scroll case', wall_shelves: 'Kitchen shelves',
  store: 'Terracotta jars', hearth: 'Zellige-tiled hearth', fire: 'Brass fire-bowl', lamp: 'Brass lantern on a stand', candle: 'Oil lamp',
  hanging: 'Hanging brass lantern', rug: 'Reed mat', screen: 'Lattice screen', counter: 'Souk counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Cloak pegs', ladder: 'Ladder', board: 'Lesson board', art: 'Painted plate', bowl: 'Terracotta bowl',
  jug: 'Terracotta jug and cups', books: 'Scroll cases' } });
FK.set({ culture: 'eastabyss', tier: 'court', S: EA_COURT, names: {
  bed: 'Canopied cedar bed', throne: 'Emir\'s chair', divan: 'Reception divan', table: 'Great cedar table', low_table: 'Gilt tray table',
  desk: 'Vizier\'s desk', cabinet: 'Gilt-inlaid cabinet', bookcase: 'Library case', hearth: 'Green-tiled hearth', fire: 'Gilt fire-bowl',
  lamp: 'Gilt lantern on a stand', candelabra: 'Gilt candelabra', hanging: 'Hanging gilt lantern', carpet: 'Great knotted carpet', screen: 'Gilt lattice screen',
  tapestry: 'Geometric hanging', art: 'Mosaic panel', statue: 'Great vase', jug: 'Gilt ewer and cups', bowl: 'Gilt bowl' } });

FURN({
  key: 'eastabyss_common_hookah', name: 'Water pipe and tray', culture: 'eastabyss', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['hall', 'tavern', 'court', 'antechamber'], anchor: 'surface', clearance: {},
  materials: ['glass', 'metal', 'cloth', 'emissive'],
  w: 0.4, d: 0.4, h: 0.6, variants: 1,
  build: function (F) {
    const brass = F.col('brass'), glass = F.col('clothTurquoise');
    F.cyl(0, 0, 0, 0.2, 0.012, 0, brass, 'metal');
    F.ball(-0.05, 0.11, 0, 0.1, glass, 'glass');
    F.cyl(-0.05, 0.2, 0, 0.018, 0.3, 0, brass, 'metal');
    F.frustum(-0.05, 0.5, 0, 0.03, 0.05, 0.05, 0, brass, 'metal', 10);
    F.cyl(-0.05, 0.55, 0, 0.035, 0.03, 0, F.col('ember'), 'glow');
    F.rod(-0.05, 0.32, 0, 0.12, 0.2, 0.1, 0.01, F.col('clothMadder'), 'cloth');
    F.rod(0.12, 0.2, 0.1, 0.16, 0.02, 0.05, 0.01, F.col('clothMadder'), 'cloth');
  }
});
FURN({
  key: 'eastabyss_court_mashrabiya', name: 'Mashrabiya window screen', culture: 'eastabyss', tier: 'court', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom', 'antechamber'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['timber', 'gold'],
  w: 1.6, d: 0.14, h: 2.2, variants: 1,
  build: function (F) {
    const wood = F.col('timberCedarDark');
    F.box(0, 0, -0.04, 1.6, 2.2, 0.06, 0, wood, 'wood');
    F.box(0, 0.1, -0.03, 1.4, 1.95, 0.02, 0, F.shade(wood, -0.5), 'wood');
    for (let r = 0; r < 12; r++) for (let c = 0; c < 9; c++) {
      const x = -0.6 + c * 0.15, y = 0.2 + r * 0.16;
      F.box(x, y, 0.0, 0.06, 0.06, 0.08, Math.PI / 4, F.shade(wood, (r + c) % 2 ? 0.1 : 0.02), 'wood');
    }
    F.box(0, 2.0, 0.0, 1.5, 0.1, 0.1, 0, F.col('gilt'), 'gold');
    F.box(0, 0.08, 0.0, 1.5, 0.08, 0.1, 0, F.col('gilt'), 'gold');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed eastabyss_trade_<role> */
FK.set({ culture: 'eastabyss', tier: 'common', roles: 'trade', prefix: 'eastabyss_trade_', S: EA_COMMON, names: {
  forge: 'Tiled forge', anvil: "Brass-smith's anvil", trough: 'Zellige trough', stall: 'Cedar stall', hayrack: 'Reed fodder rack', display: 'Souk display steps', armour_stand: 'Lamellar on a stand', weapon_rack: 'Spear and blade rack', vat: "Dyer's vat", still: 'Rosewater alembic', bin: 'Salt and grain bins', larder: 'Screened larder', bunk: 'Caravan bunk', locker: 'Cedar locker', lathe: 'Bow lathe', press: 'Olive and date press', kiln: "Potter's kiln", grindstone: 'Grindstone', barrel: 'Jar and cask rack', altar: 'Altar niche' } });

/* ======== Harvested from settlements/locus/src/65-abyss-*.js (35 pieces) ======== */
/* The Eastern Abyssal kit of the Locus build: the 27 FURN pieces of 65-abyss-10-furniture.js (culture
   'abyssal-desert' there; that fragment was removed in 2026-10, once the kit placed these pieces from here) and 8 pieces its buildings draw inline (65-abyss-00-core.js ABYSS.lantern / ABYSS.mast,
   65-abyss-40-shops.js, 65-abyss-70-palace.js, 65-abyss-90-farm.js). Salvage and sail-cloth on the salt marsh:
   rusted drums and sheet, Ancient white plate, timber and reed, lacquer and gilt for the sacred and the Headman's.
   The kit's helpers (LOCUS.drum/pole/flame/canopy, ABYSS.rust/lantern, F.lathe/edome/disc/sector) are drawn here
   through F: a lathe as stacked F.frustum rings, an ellipsoid as F.dome, a sagging canopy as two sloped slabs.
   Lights: variant 0 of every light is unlit oil, variant 1 lit (F.lamp), as in the kit. */
const EAB = {
  wood: ['timberWalnut', 'timberSmoke', 'timberChestnut', 'timberUmber'],
  plank: ['plankOak', 'plankTan', 'plankHoney', 'plankDusk'],
  rust: ['rustSheet', 'rustOrange', 'rustDeep', 'rustBrown'],
  drum: ['rustDeep', 'rustRed', 'rustDark', 'rustBrown', 'rustBlack'],
  alloy: ['alloyWhite', 'alloyPale', 'alloyBright', 'alloyGrey'],
  clay: ['clayOchre', 'clayMud', 'clayStraw', 'clayBrown'],
  clayRed: ['clayLaterite', 'clayRust', 'clayRed', 'clayDarkRed'],
  reed: ['reedMat', 'reedMatDark', 'reedMatLight', 'reedMatOld'],
  canvas: ['canvasRaw', 'canvasFaded', 'canvasPale', 'canvasTan'],
  cloth: ['clothBlue', 'clothRed', 'clothSaffron', 'clothCream', 'clothGreen', 'clothPurple', 'clothOrange'],
  src: 'settlements/locus/src/65-abyss-10-furniture.js (removed; see git history) '
};

/* ---------- seating and tables ---------- */
FURN({
  key: 'abyss_bench', name: 'Plank bench on trestles', culture: 'eastabyss', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['court', 'tavern', 'hall', 'school', 'plaza', 'street', 'yard', 'temple'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: EAB.src + 'abyss_bench',
  w: 2.1, d: 0.45, h: 0.5, variants: 2, variantNames: ['plain', 'with a back rail'],
  variantDims: [{ w: 2.1, d: 0.45, h: 0.5 }, { w: 2.1, d: 0.52, h: 0.9 }],
  build: function (F) {
    const pk = F.pick(EAB.plank), tc = F.pick(EAB.wood);
    F.box(0, 0.42, 0, 2.1, 0.07, 0.42, 0, pk, 'plank');
    [-0.8, 0.8].forEach(function (x) { F.box(x, 0, 0, 0.08, 0.42, 0.36, 0, tc, 'wood'); });
    if (F.variant) {
      [-0.8, 0.8].forEach(function (x) { F.box(x, 0.42, -0.22, 0.07, 0.45, 0.06, 0, tc, 'wood'); });
      F.box(0, 0.78, -0.22, 2.1, 0.10, 0.05, 0, pk, 'plank');
    }
  }
});
FURN({
  key: 'abyss_table_stools', name: 'Drum table and stools', culture: 'eastabyss', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'hall', 'kitchen', 'yard', 'market', 'street', 'court'], anchor: 'floor', clearance: { front: 0.4, back: 0.4, left: 0.4, right: 0.4 },
  materials: ['timber', 'rustSteel'], source: EAB.src + 'abyss_table_stools',
  w: 1.9, d: 1.9, h: 0.95, variants: 2, variantNames: ['drum table', 'cable-reel table'],
  variantDims: [{ w: 1.9, d: 1.9, h: 0.95 }, { w: 1.9, d: 1.9, h: 0.8 }],
  build: function (F) {
    if (F.variant === 0) {
      const c = F.pick(EAB.rust);
      F.cyl(0, 0, 0, 0.30, 0.88, 0, c, 'rust');
      F.cyl(0, 0.28, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust'); F.cyl(0, 0.56, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust');
      F.cyl(0, 0.88, 0, 0.55, 0.06, 0, F.pick(EAB.plank), 'plank');
    } else {
      F.cyl(0, 0, 0, 0.62, 0.08, 0, F.pick(EAB.wood), 'plank');
      F.cyl(0, 0.08, 0, 0.22, 0.62, 0, F.pick(EAB.wood), 'wood');
      F.cyl(0, 0.70, 0, 0.62, 0.08, 0, F.pick(EAB.wood), 'plank');
    }
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * F.TAU + 0.3;
      F.cyl(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8, 0.18, 0.45, 0, i % 2 ? F.pick(EAB.rust) : F.pick(EAB.plank), i % 2 ? 'rust' : 'plank');
    }
  }
});

/* ---------- light and fire ---------- */
FURN({
  key: 'abyss_lantern_post', name: 'Lantern post', culture: 'eastabyss', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza', 'court', 'yard', 'dock', 'temple', 'market'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'emissive'], source: EAB.src + 'abyss_lantern_post (ABYSS.lantern)',
  w: 1.0, d: 0.5, h: 3.1, variants: 2, variantNames: ['oil, unlit', 'lit'],
  build: function (F) {
    F.shift(-0.4, 0);
    const tc = F.pick(EAB.wood), lit = F.variant === 1, x = 0.65, y = 2.6;
    F.cyl(0, 0, 0, 0.09, 3.0, 0, tc, 'wood');
    F.rod(0, 2.9, 0, 0.7, 2.9, 0, 0.04, tc, 'wood');
    F.box(x, y - 0.28, 0, 0.34, 0.50, 0.34, 0, F.col('timberUmber'), 'wood');
    if (lit) { F.box(x, y - 0.20, 0, 0.26, 0.34, 0.26, 0.78, F.col('glowWarm'), 'glow'); F.lamp(x, y, 0, 0.7, 11); }
    else F.box(x, y - 0.20, 0, 0.27, 0.34, 0.27, 0.78, F.col('lanternDark'), 'metal');
    F.pyrRoof(x, y + 0.22, 0, 0.50, 0.26, 0.50, 0, F.col('brassDark'), 'metal');
  }
});
FURN({
  key: 'abyss_brazier', name: 'Drum brazier', culture: 'eastabyss', tier: 'common', type: 'brazier', setting: 'outdoor',
  rooms: ['court', 'plaza', 'temple', 'street', 'yard', 'shrine'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['rustSteel', 'plaster', 'emissive'], source: EAB.src + 'abyss_brazier (LOCUS.flame)',
  w: 0.8, d: 0.8, h: 1.0, variants: 2, variantNames: ['cold', 'burning'],
  variantDims: [{ w: 0.8, d: 0.8, h: 1.0 }, { w: 0.8, d: 0.8, h: 1.45 }],
  build: function (F) {
    const c = F.pick(EAB.rust), leg = F.col('steelDark');
    [0, 1, 2].forEach(function (i) { const a = i / 3 * F.TAU; F.rod(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32, Math.cos(a) * 0.2, 0.5, Math.sin(a) * 0.2, 0.03, leg, 'rust'); });
    const prof = [[0.22, 0.45], [0.34, 0.7], [0.38, 0.95]];
    for (let i = 0; i + 1 < prof.length; i++) F.frustum(0, prof[i][1], 0, prof[i][0], prof[i + 1][0], prof[i + 1][1] - prof[i][1], 0, c, 'rust', 10);
    F.cyl(0, 0.93, 0, 0.37, 0.04, 0, F.col(F.variant ? 'coalBed' : 'ashCold'), 'plaster');       /* the coals, at the rim (a frustum is capped) */
    if (F.variant) {
      const s = 0.25;
      F.cone(0, 0.9, 0, s * 0.5, s * 2.2, 0, F.col('flameFlare'), 'glow');
      F.ball(0, 0.9 + s * 0.4, 0, s * 0.55, F.col('glowWarm'), 'glow');
      F.lamp(0, 0.9 + s, 0, 0.9, 40);
    }
  }
});
FURN({
  key: 'abyss_fire_bowl', name: 'Altar fire bowl', culture: 'eastabyss', tier: 'court', type: 'brazier', setting: 'outdoor',
  rooms: ['temple', 'shrine', 'court', 'plaza'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['plaster', 'gold', 'emissive'], source: EAB.src + 'abyss_fire_bowl (LOCUS.flame)',
  w: 2.3, d: 2.3, h: 1.5, variants: 2, variantNames: ['cold', 'burning'],
  variantDims: [{ w: 2.3, d: 2.3, h: 1.5 }, { w: 2.3, d: 2.3, h: 2.65 }],
  build: function (F) {
    F.cyl(0, 0, 0, 0.9, 0.25, 0, F.col('lacquerRed'), 'plaster');
    const prof = [[0.35, 0.25], [0.25, 0.9], [0.5, 1.1], [1.05, 1.35], [1.15, 1.5]], gild = F.col('giltDeep');
    for (let i = 0; i + 1 < prof.length; i++) F.frustum(0, prof[i][1], 0, prof[i][0], prof[i + 1][0], prof[i + 1][1] - prof[i][1], 0, gild, 'gold', 18);
    F.cyl(0, 1.47, 0, 1.13, 0.04, 0, F.col('coalDeep'), 'plaster');                                  /* the coal bed, at the rim */
    if (F.variant) {
      const s = 0.55;
      F.cone(0, 1.4, 0, s * 0.5, s * 2.2, 0, F.col('flameFlare'), 'glow');
      F.ball(0, 1.4 + s * 0.4, 0, s * 0.55, F.col('glowWarm'), 'glow');
      F.lamp(0, 1.4 + s, 0, 2.4, 40);
    }
  }
});
FURN({
  key: 'abyss_crystal_ring', name: 'Ring of blue crystals', culture: 'eastabyss', tier: 'court', type: 'shrine', setting: 'outdoor',
  rooms: ['temple', 'shrine', 'court'], anchor: 'floor', clearance: {},
  materials: ['gold', 'glass', 'emissive'], source: EAB.src + 'abyss_crystal_ring',
  w: 5.4, d: 5.4, h: 1.65, variants: 2, variantNames: ['dark', 'glowing'],
  build: function (F) {
    const lit = F.variant === 1, cc = lit ? F.col('crystalBlue') : F.shade('crystalBlue', -0.45), fam = lit ? 'glow' : 'glass', n = 8, R = 2.4;
    for (let i = 0; i < n; i++) {
      const a = i / n * F.TAU, x = Math.cos(a) * R, z = Math.sin(a) * R, h = F.rr(0.9, 1.5);
      F.cyl(x, 0, z, 0.28, 0.16, 0, F.col('giltDeep'), 'gold');
      F.cone(x, 0.12, z, 0.17, h, 0, cc, fam);
      F.cone(x + 0.12, 0.12, z - 0.08, 0.10, h * 0.6, 0, cc, fam);
    }
    if (lit) F.lamp(0, 0.8, 0, 0.9, 10);
  }
});

/* ---------- canopies over streets ---------- */
FURN({
  key: 'abyss_lantern_string', name: 'String of lanterns on two masts', culture: 'eastabyss', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza', 'market', 'court', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'rustSteel', 'cloth', 'emissive'], source: EAB.src + 'abyss_lantern_string (LOCUS.pole)',
  w: 11.8, d: 0.45, h: 5.45, variants: 2, variantNames: ['oil, unlit', 'lit'],
  build: function (F) {
    const tc = F.pick(EAB.wood), lit = F.variant === 1, wire = F.col('wireBlack');
    [-5.8, 5.8].forEach(function (x) { F.cyl(x, 0, 0, 0.1, 5.2, 0, tc, 'wood'); F.ball(x, 5.32, 0, 0.11, F.col('brassBright'), 'metal'); });
    const n = 7; let prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = -5.8 + 11.6 * t, y = 5.0 - 1.2 * 4 * t * (1 - t);
      if (prev) F.rod(prev[0], prev[1], 0, x, y, 0, 0.015, wire, 'rust');
      prev = [x, y];
      if (i > 0 && i < n) {
        const c = F.pick(['sailRed', 'sailOrange', 'paintYellow']);
        F.box(x, y - 0.75, 0, 0.04, 0.4, 0.04, 0, wire, 'wood');
        F.ball(x, y - 0.95, 0, 0.2, lit ? F.shade(c, 0.35) : c, lit ? 'glow' : 'cloth');
        if (lit && i % 2) F.lamp(x, y - 0.95, 0, 0.35, 7);
      }
    }
  }
});
FURN({
  key: 'abyss_umbrella_canopy', name: 'Umbrella canopy on wires', culture: 'eastabyss', tier: 'common', type: 'shelter', setting: 'outdoor',
  rooms: ['street', 'market', 'plaza'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'rustSteel', 'cloth', 'emissive'], source: EAB.src + 'abyss_umbrella_canopy (LOCUS.pole)',
  w: 10.0, d: 9.8, h: 6.25, variants: 2, variantNames: ['umbrellas', 'umbrellas and lit lanterns'],
  build: function (F) {
    const tc = F.pick(EAB.wood), H = 6.0, S = 4.8, wire = F.col('wireBlack'), mix = function (a, b, t) { return a + (b - a) * t; };
    [[-S, -S], [S, -S], [S, S], [-S, S]].forEach(function (c) { F.cyl(c[0], 0, c[1], 0.1, H, 0, tc, 'wood'); F.ball(c[0], H + 0.12, c[1], 0.11, F.col('brassBright'), 'metal'); });
    const wires = [];
    for (let i = 0; i < 4; i++) { const z = mix(-S, S, (i + 0.5) / 4); wires.push(z); F.rod(-S, H - 0.3, z, S, H - 0.3, z, 0.012, wire, 'rust'); }
    F.rod(-S, H - 0.3, -S, -S, H - 0.3, S, 0.012, wire, 'rust'); F.rod(S, H - 0.3, -S, S, H - 0.3, S, 0.012, wire, 'rust');
    const cols = ['paintYellow', 'paintTeal', 'paintPink', 'sailOrange', 'tarpBlue', 'sailRed'];
    wires.forEach(function (z, wi) {
      for (let k = 0; k < 5; k++) {
        const x = mix(-S, S, (k + 0.5) / 5) + F.rr(-0.3, 0.3), y = H - 0.85 + F.rr(-0.25, 0.25), c = F.pick(cols), r = F.rr(0.7, 0.85);
        F.dome(x, y, z, r, r * 0.42, F.rr(0, F.TAU), c, 'cloth');                        /* the open umbrella */
        F.cyl(x, y - 0.02, z, r * 0.96, 0.02, 0, F.shade(c, -0.3), 'cloth');                /* its underside, seen from the street */
        F.rod(x, y - 0.75, z, x, y + r * 0.42 + 0.12, z, 0.015, wire, 'rust');
        F.rod(x, y + r * 0.42, z, x, H - 0.3, z, 0.01, wire, 'rust');
        if (F.variant === 1 && (k + wi) % 2 === 0) {
          F.ball(x + 0.6, y - 0.4, z, 0.16, F.col('glowWarm'), 'glow');
          if ((k + wi) % 4 === 0) F.lamp(x + 0.6, y - 0.4, z, 0.4, 8);
        }
      }
    });
  }
});

/* ---------- shop and work furniture ---------- */
FURN({
  key: 'abyss_counter', name: 'Shop counter', culture: 'eastabyss', tier: 'common', type: 'counter', setting: 'both',
  rooms: ['shop', 'tavern', 'market', 'kitchen', 'store'], anchor: 'floor', clearance: { front: 0.8, back: 0.7 },
  materials: ['timber', 'rustSteel', 'gold'], source: EAB.src + 'abyss_counter (LOCUS.drum, F.sector)',
  w: 3.0, d: 0.9, h: 1.0, variants: 2, variantNames: ['planks on drums', 'bar in a cut tank'],
  variantDims: [{ w: 3.0, d: 0.9, h: 1.0 }, { w: 3.0, d: 1.2, h: 1.1 }],
  build: function (F) {
    if (F.variant === 0) {
      [-1.0, 0, 1.0].forEach(function (x) {
        const c = F.pick(EAB.rust);
        F.cyl(x, 0, 0, 0.30, 0.88, 0, c, 'rust');
        F.cyl(x, 0.28, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust'); F.cyl(x, 0.56, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust');
      });
      F.box(0, 0.9, 0, 3.0, 0.08, 0.9, 0, F.pick(EAB.plank), 'plank');
    } else {
      F.shift(0, -0.185);
      /* a curved cut of a tank wall: the arc of radius 1.55..1.68 round (0, 1.6), from 1.18 PI to 1.82 PI, in panels */
      const c = F.pick(EAB.rust), a0 = Math.PI * 1.18, a1 = Math.PI * 1.82, n = 9, rm = 1.615, da = (a1 - a0) / n;
      for (let i = 0; i < n; i++) {
        const am = a0 + (i + 0.5) * da;
        F.box(Math.cos(am) * rm, 0, 1.6 + Math.sin(am) * rm, 2 * rm * Math.sin(da / 2) + 0.02, 1.05, 0.13, -am - Math.PI / 2, c, 'rust');
      }
      F.box(0, 1.0, -0.05, 2.9, 0.08, 0.7, 0, F.pick(EAB.plank), 'plank');
      F.box(0, 0.55, -0.33, 2.6, 0.06, 0.04, 0, F.col('giltDeep'), 'gold');
    }
  }
});
FURN({
  key: 'abyss_rack_spears', name: 'Rack of spears and harpoons', culture: 'eastabyss', tier: 'common', type: 'weapon', setting: 'both',
  rooms: ['shop', 'smithy', 'barracks', 'dock', 'market'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'metal'], source: EAB.src + 'abyss_rack_spears',
  w: 2.3, d: 0.55, h: 2.7, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood), tin = F.col('tinMirror');
    [-1.1, 1.1].forEach(function (x) { F.box(x, 0, 0, 0.1, 2.0, 0.5, 0, tc, 'wood'); });
    [0.6, 1.6].forEach(function (y) { F.box(0, y, 0.15, 2.3, 0.08, 0.08, 0, tc, 'wood'); });
    for (let i = 0; i < 8; i++) {
      const x = -0.95 + i * 0.27, harp = i % 3 === 0;
      F.rod(x, 0.05, 0.05, x + 0.05, 2.4, 0.2, 0.025, tc, 'wood');
      F.cone(x + 0.05, 2.38, 0.2, harp ? 0.06 : 0.045, harp ? 0.32 : 0.26, 0, tin, 'metal');
      if (harp) F.box(x + 0.05, 2.4, 0.2, 0.16, 0.05, 0.03, 0.4, tin, 'metal');
    }
  }
});
FURN({
  key: 'abyss_forge', name: 'Drum forge and anvil', culture: 'eastabyss', tier: 'common', type: 'stove', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.9, left: 0.5, right: 0.5 },
  materials: ['rustSteel', 'plaster', 'timber', 'emissive'], source: EAB.src + 'abyss_forge',
  w: 2.5, d: 1.1, h: 2.4, variants: 1,
  build: function (F) {
    F.shift(-0.175, 0);
    const c = F.pick(EAB.rust), iron = F.col('steelBlack');
    F.cyl(-0.5, 0, 0, 0.55, 0.85, 0, c, 'rust');
    F.cyl(-0.5, 0.85, 0, 0.5, 0.04, 0, F.col('coalBed'), 'plaster');
    F.ball(-0.5, 0.92, 0, 0.25, F.col('forgeGlow'), 'glow');
    F.lamp(-0.5, 1.0, 0, 1.2, 12);
    F.cyl(-0.5, 0.9, 0, 0.12, 1.5, 0, F.col('steelDark'), 'rust');
    F.box(0.7, 0, 0, 0.4, 0.6, 0.4, 0, F.pick(EAB.wood), 'wood');
    F.box(0.7, 0.6, 0, 0.7, 0.22, 0.26, 0, iron, 'rust');
    F.rod(1.05, 0.71, 0, 1.22, 0.71, 0, 0.08, iron, 'rust');                     /* the horn, tapering */
    F.rod(1.22, 0.71, 0, 1.40, 0.71, 0, 0.04, iron, 'rust');
  }
});
FURN({
  key: 'abyss_armor_stand', name: 'Armour stand (Ancient plate)', culture: 'eastabyss', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['shop', 'smithy', 'barracks', 'hall'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], source: EAB.src + 'abyss_armor_stand',
  w: 0.9, d: 0.45, h: 1.5, variants: 2, variantNames: ['breastplate', 'plate and helm'],
  variantDims: [{ w: 0.9, d: 0.45, h: 1.5 }, { w: 0.9, d: 0.45, h: 1.8 }],
  build: function (F) {
    const tc = F.pick(EAB.wood);
    F.box(0, 0, 0, 0.5, 0.06, 0.4, 0, tc, 'wood');
    F.cyl(0, 0, 0, 0.04, 1.5, 0, tc, 'wood');
    F.rod(-0.4, 1.35, 0, 0.4, 1.35, 0, 0.03, tc, 'wood');
    F.box(0, 0.85, 0.02, 0.5, 0.6, 0.22, 0, F.pick(EAB.alloy), 'metal');
    F.box(0, 1.25, 0.02, 0.62, 0.14, 0.24, 0, F.col('alloyTarnish'), 'metal');
    if (F.variant) F.dome(0, 1.52, 0, 0.2, 0.24, 0, F.pick(EAB.alloy), 'metal');
  }
});
FURN({
  key: 'abyss_shield_wall', name: 'Shield wall (hung shields)', culture: 'eastabyss', tier: 'common', type: 'weapon', setting: 'both',
  rooms: ['shop', 'smithy', 'barracks', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], source: EAB.src + 'abyss_shield_wall (F.disc)',
  w: 3.2, d: 0.2, h: 2.5, variants: 1,
  build: function (F) {
    F.shift(0, -0.05);
    F.box(0, 0, 0, 3.2, 2.5, 0.1, 0, F.pick(EAB.wood), 'plank');
    for (let i = 0; i < 6; i++) {
      const x = -1.1 + (i % 3) * 1.1, y = 0.75 + Math.floor(i / 3) * 1.05, c = F.pick(['sailRed', 'paintTeal', 'alloyPale', 'giltDeep']);
      F.rod(x, y, 0.06, x, y, 0.12, 0.42, c, 'metal');
      F.rod(x, y, 0.1, x, y, 0.15, 0.12, F.col('alloyTarnishDark'), 'metal');
    }
  }
});
FURN({
  key: 'abyss_shelf_jars', name: 'Shelves of jars', culture: 'eastabyss', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['shop', 'store', 'kitchen', 'study', 'workshop'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'ceramic', 'glass'], source: EAB.src + 'abyss_shelf_jars',
  w: 1.96, d: 0.42, h: 2.1, variants: 2, variantNames: ['clay jars', 'glass jars (alchemist)'],
  build: function (F) {
    const tc = F.pick(EAB.wood);
    [-0.95, 0.95].forEach(function (x) { F.box(x, 0, 0, 0.06, 2.1, 0.42, 0, tc, 'wood'); });
    [0.1, 0.7, 1.3, 1.9].forEach(function (y) {
      F.box(0, y, 0, 1.9, 0.04, 0.42, 0, tc, 'plank');
      if (y < 1.8) for (let i = 0; i < 5; i++) {
        const x = -0.75 + i * 0.37, s = F.rr(0.7, 1.1);
        if (F.variant) F.cyl(x, y + 0.04, 0, 0.09 * s, 0.28 * s, 0, F.pick(['crystalBlue', 'glassGreen', 'glassMagenta', 'paintYellow']), 'glass');
        else {
          const c = F.pick(EAB.clayRed);
          F.frustum(x, y + 0.04, 0, 0.07 * s, 0.12 * s, 0.16 * s - 0.04, 0, c, 'ceramic', 7);
          F.frustum(x, y + 0.16 * s, 0, 0.12 * s, 0.06 * s, 0.18 * s, 0, c, 'ceramic', 7);
        }
      }
    });
  }
});
FURN({
  key: 'abyss_crates', name: 'Crates, sacks and barrels', culture: 'eastabyss', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['store', 'yard', 'dock', 'market', 'shop', 'kitchen'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'cloth', 'rustSteel'], source: EAB.src + 'abyss_crates (LOCUS.drum)',
  w: 2.2, d: 1.1, h: 1.4, variants: 3, variantNames: ['crates', 'sacks', 'barrels and a crate'],
  variantDims: [{ w: 2.2, d: 1.1, h: 1.4 }, { w: 2.4, d: 1.15, h: 0.85 }, { w: 2.3, d: 1.6, h: 0.9 }],
  build: function (F) {
    const v = F.variant;
    if (v === 0) {
      F.box(-0.6, 0, 0, 0.9, 0.8, 0.9, 0.1, F.pick(EAB.plank), 'plank');
      F.box(0.5, 0, 0.1, 0.8, 0.7, 0.8, -0.2, F.pick(EAB.plank), 'plank');
      F.box(-0.5, 0.8, 0, 0.7, 0.6, 0.7, 0.3, F.pick(EAB.plank), 'plank');
    } else if (v === 1) {
      for (let i = 0; i < 5; i++) {
        const x = -0.8 + (i % 3) * 0.8, y = Math.floor(i / 3) * 0.4;
        F.dome(x + (y ? 0.4 : 0), y, F.rr(-0.2, 0.2), 0.36, 0.42, F.rr(0, Math.PI), F.col('sackTan'), 'cloth');
      }
    } else {
      F.shift(-0.1, -0.245);
      const drum = function (x, z, c) {
        F.cyl(x, 0, z, 0.30, 0.88, 0, c, 'rust');
        F.cyl(x, 0.28, z, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust'); F.cyl(x, 0.56, z, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust');
      };
      drum(-0.7, -0.2, F.pick(EAB.drum)); drum(0, 0.3, F.pick(EAB.drum));
      const s = Math.sin(0.3), c0 = Math.cos(0.3);                                  /* a drum lying on its side */
      F.rod(0.8 - s * 0.44, 0.3, 0.5 - c0 * 0.44, 0.8 + s * 0.44, 0.3, 0.5 + c0 * 0.44, 0.30, F.pick(EAB.drum), 'rust');
      F.box(-0.6, 0, 0.6, 0.6, 0.5, 0.6, 0, F.pick(EAB.plank), 'plank');
    }
  }
});
FURN({
  key: 'abyss_hanging_goods', name: 'Hanging goods on a rail', culture: 'eastabyss', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['shop', 'market', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'rope', 'cloth', 'ceramic'], source: EAB.src + 'abyss_hanging_goods',
  w: 2.5, d: 0.25, h: 2.3, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood);
    [-1.2, 1.2].forEach(function (x) { F.cyl(x, 0, 0, 0.05, 2.3, 0, tc, 'wood'); });
    F.rod(-1.25, 2.2, 0, 1.25, 2.2, 0, 0.04, tc, 'wood');
    for (let i = 0; i < 7; i++) {
      const x = -1.0 + i * 0.33, k = i % 3;
      F.rod(x, 2.2, 0, x, 1.9, 0, 0.01, F.col('wireBlack'), 'rope');
      if (k === 0) F.box(x, 1.25, 0, 0.26, 0.65, 0.05, 0, F.pick(EAB.cloth), 'cloth');
      else if (k === 1) {
        const c = F.pick(EAB.clayRed);
        F.frustum(x, 1.55, 0, 0.06, 0.14, 0.15, 0, c, 'ceramic', 7); F.frustum(x, 1.7, 0, 0.14, 0.06, 0.18, 0, c, 'ceramic', 7);
      } else F.box(x, 1.5, 0, 0.3, 0.4, 0.2, 0, F.col('sackTan'), 'cloth');
    }
  }
});
FURN({
  key: 'abyss_clay_oven', name: 'Clay bread-and-fish oven', culture: 'eastabyss', tier: 'common', type: 'stove', setting: 'outdoor',
  rooms: ['kitchen', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'plaster'], source: EAB.src + 'abyss_clay_oven',
  w: 1.7, d: 1.7, h: 1.7, variants: 1,
  build: function (F) {
    const c = F.pick(EAB.clay);
    F.cyl(0, 0, 0, 0.85, 0.5, 0, F.col('stoneRubble'), 'stone');
    F.dome(0, 0.5, 0, 0.8, 0.85, 0, c, 'plaster');
    F.box(0, 0.6, 0.62, 0.45, 0.4, 0.3, 0, F.col('voidBlack'), 'stone');
    F.cyl(0.2, 1.2, -0.2, 0.1, 0.5, 0, F.shade(c, -0.2), 'plaster');
  }
});
FURN({
  key: 'abyss_smoking_rack', name: 'Fish smoking and drying rack', culture: 'eastabyss', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'dock', 'market'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'cloth'], source: EAB.src + 'abyss_smoking_rack',
  w: 2.7, d: 1.1, h: 1.95, variants: 2, variantNames: ['fish', 'nets and fish'],
  build: function (F) {
    const tc = F.pick(EAB.wood);
    [-1.3, 1.3].forEach(function (x) { [-0.5, 0.5].forEach(function (z) { F.cyl(x, 0, z, 0.05, 1.95, 0, tc, 'wood'); }); });
    [1.0, 1.5].forEach(function (y) {
      F.rod(-1.35, y, 0, 1.35, y, 0, 0.03, tc, 'wood');
      for (let i = 0; i < 7; i++) F.box(-1.1 + i * 0.36, y - 0.38, 0, 0.1, 0.36, 0.03, 0, F.pick(['fishDried', 'fishSmoked', 'fishPale']), 'cloth');
    });
    if (F.variant) F.box(0, 1.88, 0, 2.6, 0.04, 1.1, 0, F.col('netBrown'), 'cloth');
  }
});
FURN({
  key: 'abyss_baskets', name: 'Baskets of fish and salt-rice', culture: 'eastabyss', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['shop', 'market', 'kitchen', 'store', 'dock'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['wicker', 'metal', 'foliage'], source: EAB.src + 'abyss_baskets',
  w: 2.2, d: 0.9, h: 0.5, variants: 1,
  build: function (F) {
    for (let i = 0; i < 4; i++) {
      const x = -0.8 + i * 0.55, z = (i % 2) * 0.3 - 0.15, fish = i % 2 === 0, c = F.pick(EAB.reed);
      F.frustum(x, 0, z, 0.18, 0.26, 0.3, 0, c, 'wicker', 9); F.frustum(x, 0.3, z, 0.26, 0.27, 0.1, 0, c, 'wicker', 9);
      if (fish) { for (let k = 0; k < 3; k++) F.box(x + F.rr(-0.1, 0.1), 0.38, z + F.rr(-0.1, 0.1), 0.3, 0.06, 0.08, F.rr(0, Math.PI), F.col('fishSilver'), 'metal'); }
      else F.dome(x, 0.36, z, 0.24, 0.1, 0, F.col('riceGreen'), 'plant');
    }
  }
});
FURN({
  key: 'abyss_salt_cone', name: 'Salt cone', culture: 'eastabyss', tier: 'common', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'market', 'store', 'dock'], anchor: 'floor', clearance: {},
  materials: ['plaster'], source: EAB.src + 'abyss_salt_cone',
  w: 2.1, d: 2.1, h: 1.6, variants: 2, variantNames: ['white', 'grey, raked'],
  build: function (F) {
    const c = F.col(F.variant ? 'saltGrey' : 'saltWhite');
    F.cone(0, 0, 0, 1.0, 1.6, 0, c, 'plaster');
    F.cyl(0, 0, 0, 1.05, 0.06, 0, F.shade(c, -0.1), 'plaster');
  }
});
FURN({
  key: 'abyss_canvas_bolts', name: 'Bolts of canvas and coils of rope', culture: 'eastabyss', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['shop', 'market', 'workshop', 'store', 'dock'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['cloth', 'rope'], source: EAB.src + 'abyss_canvas_bolts',
  w: 2.1, d: 1.6, h: 0.9, variants: 1,
  build: function (F) {
    F.shift(0, -0.175);
    const cs = ['sailOrange', 'sailRed', 'canvasRaw', 'paintTeal'];
    for (let i = 0; i < 4; i++) { const x = -0.8 + i * 0.55; F.rod(x, 0.22, -0.4, x, 0.22, 0.4, 0.2, F.col(cs[i]), 'cloth'); }
    const coil = F.col('ropeCoir');
    for (let k = 0; k < 3; k++) {
      const x = -0.6 + k * 0.6;
      F.frustum(x, 0, 0.6, 0.15, 0.35, 0.02, 0, coil, 'rope', 10);
      F.frustum(x, 0.02, 0.6, 0.35, 0.36, 0.2, 0, coil, 'rope', 10);
      F.frustum(x, 0.22, 0.6, 0.36, 0.15, 0.02, 0, coil, 'rope', 10);
    }
    F.rod(-0.9, 0.66, -0.4, 0.9, 0.66, -0.4, 0.21, F.col('canvasFaded'), 'cloth');
  }
});

/* ---------- library ---------- */
FURN({
  key: 'abyss_bookshelf', name: 'Bookshelf of codices and scroll tins', culture: 'eastabyss', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['library', 'study', 'school', 'hall'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'cloth', 'metal'], source: EAB.src + 'abyss_bookshelf',
  w: 2.4, d: 0.45, h: 2.4, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood);
    [-1.15, 1.15].forEach(function (x) { F.box(x, 0, 0, 0.08, 2.35, 0.45, 0, tc, 'wood'); });
    [0.05, 0.62, 1.19, 1.76, 2.33].forEach(function (y) {
      F.box(0, y, 0, 2.3, 0.04, 0.45, 0, tc, 'plank');
      if (y < 2.2) {
        let x = -1.0;
        while (x < 1.0) {
          const w = F.rr(0.06, 0.14), h = F.rr(0.32, 0.5);
          if (F.chance(0.25)) F.rod(x, y + 0.1, -0.1, x, y + 0.1, 0.15, 0.06, F.col('tinMirror'), 'metal');
          else F.box(x, y + 0.04, 0, w, h, 0.32, F.rr(-0.06, 0.06), F.pick(['sailRed', 'paintTeal', 'bindingBrown', 'giltDeep', 'bindingSlate']), 'cloth');
          x += w + 0.02;
        }
      }
    });
  }
});
FURN({
  key: 'abyss_reading_table', name: 'Reading table with stools', culture: 'eastabyss', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['library', 'study', 'school', 'hall'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['timber', 'cloth'], source: EAB.src + 'abyss_reading_table',
  w: 2.0, d: 1.8, h: 0.85, variants: 1,
  build: function (F) {
    const pk = F.pick(EAB.plank);
    F.box(0, 0.72, 0, 2.0, 0.07, 0.8, 0, pk, 'plank');
    [[-0.9, -0.3], [0.9, -0.3], [-0.9, 0.3], [0.9, 0.3]].forEach(function (p) { F.box(p[0], 0, p[1], 0.07, 0.72, 0.07, 0, pk, 'wood'); });
    [-0.6, 0.6].forEach(function (x) { [-0.7, 0.7].forEach(function (z) { F.cyl(x, 0, z, 0.18, 0.45, 0, F.pick(EAB.plank), 'plank'); }); });
    F.box(0.3, 0.79, 0, 0.4, 0.05, 0.3, 0.2, F.col('sailRed'), 'cloth');
  }
});

/* ---------- yard and water ---------- */
FURN({
  key: 'abyss_water_butt', name: 'Water butt', culture: 'eastabyss', tier: 'common', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'kitchen', 'smithy', 'stable', 'street'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['rustSteel', 'timber', 'metal'], source: EAB.src + 'abyss_water_butt',
  w: 1.25, d: 1.0, h: 1.2, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.45, 1.15, 0, F.pick(EAB.rust), 'rust');
    F.cyl(0, 1.15, 0, 0.48, 0.05, 0, F.pick(EAB.plank), 'plank');
    F.rod(0.45, 0.3, 0, 0.6, 0.3, 0, 0.03, F.col('brassBright'), 'metal');
  }
});
FURN({
  key: 'abyss_well', name: 'Salt-marsh well with a sweep', culture: 'eastabyss', tier: 'common', type: 'well', setting: 'outdoor',
  rooms: ['court', 'yard', 'garden', 'plaza', 'street'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['stone', 'plaster', 'timber', 'rope', 'rustSteel'], source: EAB.src + 'abyss_well (LOCUS.drum)',
  w: 4.4, d: 2.0, h: 4.0, variants: 1,
  build: function (F) {
    F.shift(-0.365, 0);
    const tc = F.pick(EAB.wood), rub = F.col('stoneRubble');
    F.cyl(0, 0, 0, 1.0, 0.8, 0, rub, 'stone');
    F.cyl(0, 0.78, 0, 0.8, 0.04, 0, F.col('waterSalt'), 'plaster');
    F.cyl(1.6, 0, 0, 0.12, 2.6, 0, tc, 'wood');
    F.rod(-1.6, 3.9, 0, 2.4, 1.8, 0, 0.08, tc, 'wood');                           /* the sweep */
    F.box(2.3, 1.2, 0, 0.5, 0.5, 0.5, 0, rub, 'stone');                            /* its counterweight */
    F.rod(-1.5, 3.85, 0, -1.5, 1.2, 0, 0.015, F.col('ropePale'), 'rope');
    const c = F.pick(EAB.rust);                                                      /* a drum for a bucket */
    F.cyl(-1.5, 0.55, 0, 0.30, 0.88, 0, c, 'rust');
    F.cyl(-1.5, 0.83, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust'); F.cyl(-1.5, 1.11, 0, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust');
  }
});
FURN({
  key: 'abyss_planter', name: 'Planter (a cut can or jar)', culture: 'eastabyss', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['garden', 'yard', 'court', 'street'], anchor: 'floor', clearance: {},
  materials: ['metal', 'ceramic', 'plaster'], source: EAB.src + 'abyss_planter',
  w: 0.6, d: 0.6, h: 0.55, variants: 2, variantNames: ['cut tin', 'clay jar'],
  build: function (F) {
    if (F.variant) {
      const c = F.pick(EAB.clayRed);
      F.frustum(0, 0, 0, 0.2, 0.3, 0.3, 0, c, 'ceramic', 9); F.frustum(0, 0.3, 0, 0.3, 0.26, 0.22, 0, c, 'ceramic', 9);
    } else F.cyl(0, 0, 0, 0.28, 0.5, 0, F.pick(['paintTeal', 'sailRed', 'paintYellow', 'tinMirror']), 'metal');
    F.cyl(0, 0.46, 0, 0.24, 0.04, 0, F.col('soilDark'), 'plaster');
  }
});
FURN({
  key: 'abyss_beast_shade', name: 'Beast yard sunshade and trough', culture: 'eastabyss', tier: 'common', type: 'shelter', setting: 'outdoor',
  rooms: ['yard', 'stable', 'roost'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'rustSteel', 'plaster', 'thatch'], source: EAB.src + 'abyss_beast_shade (LOCUS.pole, LOCUS.canopy)',
  w: 5.8, d: 3.8, h: 3.05, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood), cv = F.pick(EAB.canvas), c = F.pick(EAB.rust);
    [[-2.8, -1.8], [2.8, -1.8], [2.8, 1.8], [-2.8, 1.8]].forEach(function (p) { F.cyl(p[0], 0, p[1], 0.1, 3.0, 0, tc, 'wood'); });
    /* the canvas, sagging 0.4 m to its middle: two sloped slabs, a darker underside below each */
    F.beam(0, 3.0, -1.8, 0, 2.6, 0, 5.6, 0.03, cv, 'cloth'); F.beam(0, 2.6, 0, 0, 3.0, 1.8, 5.6, 0.03, cv, 'cloth');
    F.beam(0, 2.97, -1.8, 0, 2.57, 0, 5.6, 0.02, F.shade(cv, -0.18), 'cloth'); F.beam(0, 2.57, 0, 0, 2.97, 1.8, 5.6, 0.02, F.shade(cv, -0.18), 'cloth');
    /* the trough, a salvaged tank cut open, brackish water in it */
    F.box(0, 0, 1.2, 4.0, 0.1, 0.7, 0, c, 'rust');
    F.box(0, 0, 0.9, 4.0, 0.6, 0.1, 0, c, 'rust'); F.box(0, 0, 1.5, 4.0, 0.6, 0.1, 0, c, 'rust');
    F.box(-1.95, 0, 1.2, 0.1, 0.6, 0.7, 0, c, 'rust'); F.box(1.95, 0, 1.2, 0.1, 0.6, 0.7, 0, c, 'rust');
    F.box(0, 0.42, 1.2, 3.8, 0.06, 0.5, 0, F.col('waterBrackish'), 'plaster');
    F.dome(-1.5, 0, -0.6, 0.7, 0.35, 0, F.col('fodderStraw'), 'thatch'); F.dome(-0.9, 0, -0.6, 0.7, 0.35, 0, F.col('fodderStraw'), 'thatch');
  }
});

/* ---------- drawn inline by the abyss buildings ---------- */
FURN({
  key: 'abyss_hanging_lantern', name: 'Hanging oil lantern', culture: 'eastabyss', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'tavern', 'shop', 'court', 'temple', 'shrine', 'street', 'dock'], anchor: 'ceiling', clearance: {},
  materials: ['timber', 'metal', 'emissive'], source: 'settlements/locus/src/65-abyss-00-core.js ABYSS.lantern (72-lights.js LANTERN)',
  w: 0.5, d: 0.5, h: 1.0, variants: 2, variantNames: ['oil, unlit', 'lit'],
  build: function (F) {
    const y = 0.28, body = F.col('timberUmber');
    F.box(0, y - 0.28, 0, 0.34, 0.50, 0.34, 0, body, 'wood');
    if (F.variant) { F.box(0, y - 0.20, 0, 0.26, 0.34, 0.26, 0.78, F.col('glowWarm'), 'glow'); F.lamp(0, y, 0, 0.7, 11); }
    else F.box(0, y - 0.20, 0, 0.27, 0.34, 0.27, 0.78, F.col('lanternDark'), 'metal');
    F.pyrRoof(0, y + 0.22, 0, 0.50, 0.26, 0.50, 0, F.col('brassDark'), 'metal');
    F.box(0, y + 0.4, 0, 0.04, 1.0 - y - 0.4, 0.04, 0, body, 'wood');                /* the hanger */
    F.cyl(0, 0.97, 0, 0.07, 0.03, 0, F.col('brassDark'), 'metal');                     /* its ceiling hook plate */
  }
});
FURN({
  key: 'abyss_propeller_mast', name: 'Propeller-lantern mast', culture: 'eastabyss', tier: 'common', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza', 'dock', 'court', 'market'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'emissive'], source: 'settlements/locus/src/65-abyss-00-core.js ABYSS.mast { prop }',
  w: 1.1, d: 1.0, h: 6.7, variants: 2, variantNames: ['dark', 'lit'],
  build: function (F) {
    const h = 6.0, py = h + 0.25, lit = F.variant === 1;
    F.cyl(0, 0, 0, 0.12, h, 0, F.pick(EAB.wood), 'wood');
    F.cyl(0, h, 0, 0.05, 0.45, 0, F.col('steelDark'), 'metal');
    F.ball(0, py + 0.2, 0, 0.16, F.col(lit ? 'glowWarm' : 'bulbDark'), lit ? 'glow' : 'metal');
    for (let b = 0; b < 3; b++) {                                                     /* a three-bladed vane over the bulb */
      const a = b / 3 * F.TAU;
      F.box(Math.cos(a) * 0.275, py + 0.38, Math.sin(a) * 0.275, 0.55, 0.03, 0.16, -a, F.col('sailRed'), 'metal');
    }
    if (lit) F.lamp(0, py + 0.2, 0, 0.5, 9);
  }
});
FURN({
  key: 'abyss_scrap_stock', name: 'Sorted salvage: sheet, pipe, drums, cans', culture: 'eastabyss', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'store', 'workshop', 'market', 'dock'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['rustSteel', 'metal'], source: 'settlements/locus/src/65-abyss-40-shops.js abyss_shop_salvage (sorted scrap)',
  w: 3.3, d: 1.8, h: 0.7, variants: 4, variantNames: ['corrugated sheet stack', 'pipe bundle', 'drums, standing and stacked', 'heap of tin cans'],
  variantDims: [{ w: 3.3, d: 1.8, h: 0.7 }, { w: 5.4, d: 1.1, h: 0.8 }, { w: 3.9, d: 1.7, h: 1.8 }, { w: 3.2, d: 3.2, h: 1.1 }],
  build: function (F) {
    const v = F.variant;
    if (v === 0) {
      for (let s = 0; s < 6; s++) F.box(0, s * 0.12, 0, 3.2, 0.1, 1.6, F.rr(-0.06, 0.06), F.pick(EAB.rust), 'rust');
    } else if (v === 1) {
      for (let p = 0; p < 7; p++) {
        const z = -0.4 + (p % 3) * 0.3, y = 0.13 + Math.floor(p / 3) * 0.26;
        F.rod(-2.7, y, z, 2.7, y, z + 0.2, 0.13, F.pick(['pipeGrey', 'pipePale', 'pipeDark']), 'rust');
      }
    } else if (v === 2) {
      for (let i = 0; i < 4; i++) {
        const x = -1.6 + i * 0.75, c = F.pick(EAB.drum);
        F.cyl(x, 0, -0.5, 0.30, 0.88, 0, c, 'rust');
        F.cyl(x, 0.28, -0.5, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust'); F.cyl(x, 0.56, -0.5, 0.32, 0.06, 0, F.shade(c, -0.25), 'rust');
      }
      for (let k = 0; k < 3; k++) F.rod(1.06, 0.6 * k + 0.3, 0.1 + 0.1 * k, 1.94, 0.6 * k + 0.3, 0.1 + 0.1 * k, 0.30, F.pick(EAB.drum), 'rust');
    } else F.dome(0, 0, 0, 1.6, 1.1, 0, F.col('tinMirror'), 'metal');
  }
});
FURN({
  key: 'abyss_sail_frame', name: 'Sail stretched on a stitching frame', culture: 'eastabyss', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard', 'shop', 'dock'], anchor: 'floor', clearance: { front: 0.8, back: 0.5 },
  materials: ['timber', 'cloth'], source: 'settlements/locus/src/65-abyss-40-shops.js abyss_shop_sailmaker (the stitching frame)',
  w: 3.1, d: 0.1, h: 2.6, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood), sail = F.col('sailOrange');
    [-1.5, 1.5].forEach(function (x) { F.box(x, 0, 0, 0.1, 2.6, 0.1, 0, tc, 'wood'); });
    /* a right-angled triangle of sail (the kit's F.tri) in eight strips, its long edge hemmed */
    const n = 8, H = 1.9;
    for (let j = 0; j < n; j++) {
      const wj = 2.8 * (1 - (j + 0.5) / n);
      F.box(-1.4 + wj / 2, 0.6 + j * H / n, 0, wj, H / n, 0.02, 0, j % 2 ? sail : F.shade(sail, -0.04), 'cloth');
    }
    F.rod(1.4, 0.6, 0, -1.4, 2.5, 0, 0.015, F.shade(sail, -0.2), 'cloth');
  }
});
FURN({
  key: 'abyss_counter_crystal', name: 'Blue crystal on the counter', culture: 'eastabyss', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['shop', 'study', 'shrine'], anchor: 'surface', clearance: {},
  materials: ['glass'], source: 'settlements/locus/src/65-abyss-40-shops.js abyss_shop_alchemy (the small crystal on the counter)',
  w: 0.24, d: 0.24, h: 0.4, variants: 1,
  build: function (F) {
    F.cone(0, 0, 0, 0.12, 0.4, 0, F.col('crystalBlue'), 'glass');
  }
});
FURN({
  key: 'abyss_lacquer_standard', name: 'Lacquered standard with a gilded disc', culture: 'eastabyss', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['plaza', 'court', 'temple'], anchor: 'floor', clearance: {},
  materials: ['plaster', 'gold'], source: "settlements/locus/src/65-abyss-70-palace.js abyss_palace_plaza (the two standards)",
  w: 1.8, d: 0.7, h: 8.9, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.35, 8.5, 0, F.col('lacquerRed'), 'plaster');
    F.rod(0, 8.0, 0, 0, 8.0, 0.12, 0.9, F.col('giltDeep'), 'gold');
  }
});
FURN({
  key: 'abyss_granary_basket', name: 'Reed granary basket on legs', culture: 'eastabyss', tier: 'poor', type: 'storage', role: 'store', setting: 'outdoor',
  rooms: ['yard', 'store', 'garden'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'wicker', 'thatch'], source: 'settlements/locus/src/65-abyss-90-farm.js abyss_farmhouse (a reed granary basket on legs)',
  w: 3.4, d: 3.4, h: 5.0, variants: 1,
  build: function (F) {
    const tc = F.pick(EAB.wood), reed = F.pick(EAB.reed);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { F.cyl(p[0], 0, p[1], 0.1, 1.4, 0, tc, 'wood'); });
    F.frustum(0, 1.4, 0, 1.0, 1.4, 1.0, 0, reed, 'wicker', 12);
    F.frustum(0, 2.4, 0, 1.4, 1.3, 1.0, 0, reed, 'wicker', 12);
    F.cone(0, 3.4, 0, 1.7, 1.6, 0, F.pick(['thatchStraw', 'thatchOld', 'thatchGold']), 'thatch');
  }
});
FURN({
  key: 'abyss_trough', name: 'Cut-tank water trough', culture: 'eastabyss', tier: 'common', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'stable', 'smithy', 'roost'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['rustSteel', 'plaster'], source: 'settlements/locus/src/65-abyss-90-farm.js abyss_granary (the trough)',
  w: 3.4, d: 1.4, h: 0.55, variants: 1,
  build: function (F) {
    const c = F.pick(EAB.rust);
    F.box(0, 0, 0, 3.4, 0.1, 1.4, 0, c, 'rust');
    F.box(0, 0, -0.65, 3.4, 0.55, 0.1, 0, c, 'rust'); F.box(0, 0, 0.65, 3.4, 0.55, 0.1, 0, c, 'rust');
    F.box(-1.65, 0, 0, 0.1, 0.55, 1.4, 0, c, 'rust'); F.box(1.65, 0, 0, 0.1, 0.55, 1.4, 0, c, 'rust');
    F.box(0, 0.38, 0, 3.2, 0.08, 1.2, 0, F.col('waterSalt'), 'plaster');
  }
});
