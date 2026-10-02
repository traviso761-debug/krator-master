/* ======================================================================
   Republican furniture: common and court tiers.
   Influences: Russian, Saxon, Tlingit, Korean, high-value salvage. The
   middle class builds in bamboo (post legs, node rings) with brass and
   glazed celadon, tiled stoves and salvaged electric light; the court in
   birch and black timber with Ancients alloy, brass and the Republic's
   deep red (core/sockets/80-cultures.js: red #7a2028, ochre #c9963a,
   cream #f0e6cc, teal ink #2a8a86, the triskele).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('republican', { name: 'Republicans', pack: 'republic', influences: 'Russian; Saxon; Tlingit; Korean; high-value salvage',
  materials: 'bamboo, birch, black timber, brass, glazed celadon, salvaged alloy and electrics',
  palette: {
    bambooStraw: 0xc8b070, bambooDark: 0x8a7a40, bambooPale: 0xe0d090, timberBirch: 0xc8a878, timberBirchDark: 0x8a6a48, timberBlack: 0x2a2420,
    clothRepublicRed: 0x7a2028, clothOchreBand: 0xc9963a, clothCream: 0xf0e6cc, clothTealInk: 0x2a8a86, clothBlue: 0x2a4a7a, clothGreen: 0x3a5a3a,
    brass: 0xb08432, steelSalvage: 0x7a8088, alloyWhite: 0xe6e4dc, glassSky: 0x5a9ec9, clayGlazed: 0x6a9a7a, stoneGrey: 0x7a7670,
    ironBlack: 0x2a2a2a, flame: 0xffb04a, ember: 0xd9762c, electric: 0x6fd0ff,
    /* the Highlands kit's Republican branch (settlements/highlands HPAL, VPAL and the builders' literals) */
    timberPine: 0xc08850, timberPineDark: 0xa87040, timberAged: 0x8a7e70, timberAgedDark: 0x7a6e60, timberTar: 0x4a3426,
    timberRedwood: 0x5e2a1c, timberStump: 0x5a4632, timberOak: 0x6a4a30, timberRack: 0x5a4030, timberPell: 0x7a5a3e, sawdust: 0xd8c08a,
    stoneRubble: 0x9a948a, stoneAshlar: 0xd8d0bc, stoneSlate: 0x565c66, stoneGrind: 0xb0a898, stoneMill: 0xb0aaa0,
    rustSalvage: 0x8a5a3a, rustDark: 0x6e4a36, rustRed: 0x8a3a2a, steelCorrugate: 0x9a9488, steelOlive: 0x6a6a5a, ironSoot: 0x2e2a26,
    copper: 0xc07a48, copperSamovar: 0xc8883a, brassDull: 0x9a7a4a, bronzeDark: 0x7a5a2a, gilt: 0xd4a03a, drumYellow: 0xb89a30,
    paintTeal: 0x2e9488, paintRed: 0xb3322a, paintWhite: 0xefe7d6, paintBlack: 0x201a18, paintOchre: 0xd19a3a, paintBlue: 0x3a6aa8,
    paperCream: 0xe8d9a8, paperRed: 0xc0302a, paperVermilion: 0xd84a2a, paperAmber: 0xe0a030, slateBoard: 0x2a3430,
    clothSacking: 0xb8a080, clothSackingDark: 0xa89070, clothSackingPale: 0xc8b898, clothBurlap: 0xd8c8a0, leatherBrown: 0x6a4a30,
    awningRed: 0xc03a2a, awningTeal: 0x2e8a88, awningSaffron: 0xd8a030, awningGreen: 0x6a8a3a,
    thatchStraw: 0xb89a5a, thatchHay: 0xc8b070, mugBrown: 0x8a6a4a, clayRed: 0x9a5a38, clayTan: 0xb87a4a, clayDark: 0x7a4a30,
    clayCream: 0xc8a060, clayGreen: 0x5a7a5a, produceRed: 0xc0302a, produceOrange: 0xe08a2a, produceGreen: 0x6a9a3a,
    produceYellow: 0xd8c060, producePlum: 0x8a3a6a, glassGreen: 0x4a8a6a, glassOlive: 0x8a9a4a, glassBlue: 0x5a7a9a,
    waterDark: 0x2a3a44, waterPond: 0x4a6874, waterFountain: 0x5a7a88, emberHot: 0xff7a2a, glowForge: 0xd8380a, coal: 0x262422,
    scrapEarth: 0x5a4a3e
  } });
/* END PALETTE */
const REP_COMMON = {
  emblem: { field: 'clothRepublicRed', edge: 'timberBirchDark', band: 'clothOchreBand', disc: 'clothCream', ink: 'clothRepublicRed', ink2: 'clothTealInk' },
  wood: 'bambooStraw', woodDark: 'bambooDark', woodLight: 'bambooPale', woodFam: 'bamboo',
  cloth: ['clothRepublicRed', 'clothCream', 'clothBlue', 'clothGreen'], clothFam: 'cloth',
  accent: 'brass', accentFam: 'metal', metal: 'ironBlack', metalFam: 'metal',
  clay: 'clayGlazed', clayFam: 'ceramic', stone: 'stoneGrey', stoneFam: 'stone', rope: 'clothOchreBand', tile: 'clayGlazed',
  flame: 'flame', ember: 'ember', lampCol: 'electric',
  legs: 'post', motif: 'lozenge', bedBase: 'plank', seat: 'cushion', finial: 'knob',
  hearth: 'tile', fire: 'basket', lamp: 'glass', rug: 'woven', screen: 'panel', store: 'barrels',
  shelfFill: 'books', rack: 'cloaks', art: 'panel', art2: 'shield', statue: 'figure', tapestry: 'spiral',
  canopy: true, board: 'slate'
};
const REP_COURT = Object.assign({}, REP_COMMON, {
  wood: 'timberBirch', woodDark: 'timberBlack', woodLight: 'timberBirch', woodFam: 'wood',
  cloth: ['clothRepublicRed', 'clothOchreBand', 'clothCream', 'clothTealInk'],
  accent: 'alloyWhite', accentFam: 'metal', motif: 'spiral', finial: 'knob', statue: 'figure', screen: 'carved', rug: 'knotted', art: 'shield', art2: 'panel'
});
FK.set({ culture: 'republican', tier: 'common', S: REP_COMMON, names: {
  bed: 'Bamboo bed', bench: 'Bamboo bench', chair: 'Bamboo chair', stool: 'Bamboo stool', table: 'Bamboo table',
  low_table: 'Low bamboo table', desk: 'Clerk\'s bamboo desk', chest: 'Brass-banded chest', bookcase: 'Bamboo bookcase', wall_shelves: 'Celadon shelves',
  store: 'Barrels', hearth: 'Tiled stove', fire: 'Iron fire-basket', lamp: 'Salvaged electric lamp', candle: 'Candle dish',
  hanging: 'Salvaged pendant lamp', rug: 'Striped rug', screen: 'Panel screen', counter: 'Shop counter', workbench: 'Workbench',
  loom: 'Loom', rack: 'Cloak rack', ladder: 'Bamboo ladder', board: 'Slate board', art: 'Painted panel', bowl: 'Celadon bowl',
  jug: 'Celadon jug and cups', books: 'Bound books' } });
FK.set({ culture: 'republican', tier: 'court', S: REP_COURT, names: {
  bed: 'Canopied birch bed', throne: 'Consul\'s chair', divan: 'Reception divan', table: 'Council table', low_table: 'Alloy-trimmed low table',
  desk: 'Consul\'s desk', cabinet: 'Alloy-inlaid cabinet', bookcase: 'Archive bookcase', hearth: 'Great tiled stove', fire: 'Alloy fire-basket',
  lamp: 'Salvaged electric standard', candelabra: 'Brass candelabra', hanging: 'Salvaged chandelier', carpet: 'Great carpet', screen: 'Carved screen',
  tapestry: 'Triskele hanging', art: 'Republic shield', statue: 'Consul\'s statue', jug: 'Alloy ewer and cups', bowl: 'Alloy bowl' } });

FURN({
  key: 'republican_court_terminal', name: 'Salvaged archive terminal', culture: 'republican', tier: 'court', type: 'desk', setting: 'indoor',
  rooms: ['library', 'study', 'court', 'hall'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'glass', 'emissive', 'timber', 'cloth'],
  w: 1.6, d: 0.8, h: 1.9, variants: 1,
  build: function (F) {
    const alloy = F.col('alloyWhite'), birch = F.col('timberBirch');
    F.box(0, 0, -0.2, 1.6, 1.9, 0.4, 0, alloy, 'metal');                                   /* the cabinet, as found */
    F.box(0, 1.1, 0.0, 1.2, 0.5, 0.02, 0, F.col('glassSky'), 'glass');                      /* its dark pane */
    F.box(0, 1.2, 0.012, 1.0, 0.3, 0.005, 0, F.col('electric'), 'glow');
    for (let i = 0; i < 8; i++) F.box(-0.6 + i * 0.17, 0.3 + (i % 3) * 0.2, 0.0, 0.1, 0.1, 0.01, 0, i % 2 ? F.col('electric') : F.shade(alloy, -0.3), i % 2 ? 'glow' : 'metal');
    F.box(0, 0.74, 0.2, 1.4, 0.06, 0.4, 0, birch, 'wood');                                /* a birch desk built against it */
    for (const s of [-1, 1]) F.box(s * 0.65, 0, 0.3, 0.08, 0.74, 0.1, 0, F.shade(birch, -0.2), 'wood');
    F.box(0.2, 0.8, 0.2, 0.3, 0.012, 0.22, 0.1, F.col('clothCream'), 'cloth');
    F.lamp(0, 1.3, 0.3, 0.6, 5);
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed republican_trade_<role> */
FK.set({ culture: 'republican', tier: 'common', roles: 'trade', prefix: 'republican_trade_', S: REP_COMMON, names: {
  forge: 'Iron Republic forge', anvil: 'Guild anvil', trough: 'Quench trough', stall: 'Bamboo stall', hayrack: 'Bamboo hay rack', display: 'Shop display steps', armour_stand: 'Lamellar on a stand', weapon_rack: 'Musket and blade rack', vat: "Brewer's vat", still: "Alchemists' still", bin: 'Grain bins', larder: 'Celadon larder', bunk: 'Barracks bunk', locker: 'Brass-pinned locker', lathe: "Mechanics' treadle lathe", press: 'Mint and printing press', kiln: 'Glaze kiln', grindstone: 'Grindstone', barrel: 'Beer barrel cradle', altar: 'Altar of the Pantheon' } });

/* ======== Harvested from settlements/highlands (Republican branch: src/74-79f) (62 pieces) ======== */
/* The Iron Republic's working furniture, from the Highlands kit's builders: its kit helpers (hnRA*, hnRB*, hnRC*,
   hnStall, hnLantern) and the pieces its builders draw inline. The kit draws exteriors only (taverns, temple, school,
   hospital, barracks have no interiors), so this is yard, street, workshop and smithy furniture. Wood keys follow the
   kit's HPAL: pine (middle), aged (poor), tar (rich and civic), redwood. Flues that the kit runs up through a shed roof
   stop at about 3.5-4.5 m here. HLREP holds the kit's shared shapes, drawn only through F. */
const HLREP = {
  /* the vernacular standing barrel (vBarrel: radius r at the top, .9 r at the foot) and its two iron hoops */
  barrel: function (F, x, y, z, r, h, c, hoopC) {
    F.frustum(x, y, z, r * 0.9, r, h, 0, c, 'wood', 10);
    for (const t of [0.25, 0.78]) F.cyl(x, y + h * t - 0.025, z, r * (0.9 + 0.1 * t) + 0.012, 0.05, 0, hoopC, 'metal');
  },
  /* hnRABarrelLying: a barrel on its side, length L along x (alongX) or z, resting on y */
  barrelLying: function (F, x, y, z, r, L, alongX, c, hoopC) {
    const P = (u) => alongX ? [x + u, z] : [x, z + u];
    const a = P(-L / 2), b = P(L / 2);
    F.rod(a[0], y + r, a[1], b[0], y + r, b[1], r, c, 'wood');
    for (const t of [0.22, 0.78]) {
      const p = P(-L / 2 + L * t - 0.03), q = P(-L / 2 + L * t + 0.03);
      F.rod(p[0], y + r, p[1], q[0], y + r, q[1], r + 0.01, hoopC, 'metal');
    }
  },
  /* a spoked cartwheel (hnRAWheel / hnRCWheel): centre (x,y,z), axle along x (alongX) or z, an iron tyre of
     n segments, `spokes` wooden spokes and a hub; t = the tyre's width along the axle */
  wheel: function (F, x, y, z, r, alongX, t, c, rimC, spokes) {
    const N = 12, S = spokes == null ? 8 : spokes;
    const P = (a, k) => alongX ? [x, y + Math.cos(a) * k, z + Math.sin(a) * k] : [x + Math.sin(a) * k, y + Math.cos(a) * k, z];
    for (let i = 0; i < N; i++) {
      const p = P(i / N * F.TAU, r * 0.95), q = P((i + 1) / N * F.TAU, r * 0.95);
      F.beam(p[0], p[1], p[2], q[0], q[1], q[2], alongX ? t : r * 0.1, alongX ? r * 0.1 : t, rimC, 'metal');
    }
    for (let i = 0; i < S; i++) { const q = P(i / S * F.TAU + 0.2, r * 0.9); F.rod(x, y, z, q[0], q[1], q[2], Math.max(0.018, r * 0.04), c, 'wood'); }
    if (alongX) F.rod(x - t * 0.8, y, z, x + t * 0.8, y, z, r * 0.16, c, 'wood');
    else F.rod(x, y, z - t * 0.8, x, y, z + t * 0.8, r * 0.16, c, 'wood');
  },
  /* a ring of n rod segments: centre c, unit vectors u, v spanning its plane, radius r */
  ring: function (F, c, u, v, r, rr, col, fam, n) {
    n = n || 16;
    for (let i = 0; i < n; i++) {
      const a = i / n * F.TAU, b = (i + 1) / n * F.TAU;
      const p = [0, 1, 2].map((k) => c[k] + r * (Math.cos(a) * u[k] + Math.sin(a) * v[k]));
      const q = [0, 1, 2].map((k) => c[k] + r * (Math.cos(b) * u[k] + Math.sin(b) * v[k]));
      F.rod(p[0], p[1], p[2], q[0], q[1], q[2], rr, col, fam);
    }
  },
  /* a gable roof of two slabs, ridge along x at y + rise, eaves at y and z +- d/2 */
  gable: function (F, x, y, z, w, d, rise, c, fam) {
    for (const s of [-1, 1]) F.beam(x, y + rise, z, x, y, z + s * d / 2, w, 0.06, c, fam);
  },
  /* the vernacular sack (vSack: an ellipsoid .42 x .32 x .36) centred at y */
  sack: function (F, x, y, z, k, c) { F.blob(x, y, z, 0.39 * (k || 1), 0.64 * (k || 1), F.rr(0, F.TAU), c, 'cloth'); },
  /* hnRATable: a trestle table with two benches, length L along x, and a mug for every metre */
  trestle: function (F, L, c) {
    F.box(0, 0.7, 0, L, 0.07, 0.85, 0, c, 'wood');
    for (const s of [-1, 1]) {
      F.box(s * (L / 2 - 0.35), 0, 0, 0.1, 0.7, 0.7, 0, F.shade(c, -0.1), 'wood');
      F.box(0, 0.4, s * 0.75, L, 0.06, 0.3, 0, c, 'wood');
      for (const t of [-1, 1]) F.box(t * (L / 2 - 0.35), 0, s * 0.75, 0.08, 0.4, 0.26, 0, F.shade(c, -0.1), 'wood');
    }
    for (let k = 0; k < Math.round(L); k++) F.cyl(F.rr(-L / 2 + 0.3, L / 2 - 0.3), 0.77, F.rr(-0.25, 0.25), 0.05, 0.15, 0, F.pick(['mugBrown', 'clothSacking', 'timberOak']), 'wood');
  }
};

FURN({
  key: 'hl_rep_trestle_table', name: 'Trestle table with benches', culture: 'republican', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'hall', 'yard', 'garden', 'street'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['timber'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRATable', w: 4.2, d: 1.8, h: 0.92, variants: 3,
  variantNames: ['Short (2.4 m)', 'Beer garden (4.2 m)', 'Beer hall (5.2 m)'],
  variantDims: [{ w: 2.4, d: 1.8, h: 0.92 }, { w: 4.2, d: 1.8, h: 0.92 }, { w: 5.2, d: 1.8, h: 0.92 }],
  build: function (F) { HLREP.trestle(F, [2.4, 4.2, 5.2][F.variant] || 4.2, F.pick(['timberPine', 'timberPineDark'])); }
});
FURN({
  key: 'hl_rep_samovar_table', name: 'Traktir samovar table', culture: 'republican', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'hall', 'yard', 'garden'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['timber', 'bronze', 'gold'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepTavernC (samovar table)', w: 2.4, d: 1.8, h: 1.24, variants: 1,
  build: function (F) {
    HLREP.trestle(F, 2.4, F.col('timberPine'));
    F.cyl(0, 0.77, 0, 0.14, 0.36, 0, F.col('copperSamovar'), 'bronze');
    F.cyl(0, 1.13, 0, 0.06, 0.03, 0, F.shade('copperSamovar', -0.2), 'bronze');
    F.ball(0, 1.16, 0, 0.08, F.col('gilt'), 'gold');
  }
});
FURN({
  key: 'hl_rep_barrel_lying', name: 'Barrel on its side', culture: 'republican', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['tavern', 'store', 'kitchen', 'yard', 'shop'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRABarrelLying', w: 0.86, d: 0.76, h: 0.76, variants: 1,
  build: function (F) { HLREP.barrelLying(F, 0, 0.01, 0, 0.36, 0.86, true, F.pick(['timberPine', 'timberPineDark']), F.col('ironSoot')); }
});
FURN({
  key: 'hl_rep_barrel_stack', name: 'Barrel pyramid', culture: 'republican', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['tavern', 'store', 'yard', 'shop', 'kitchen'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRABarrelStack', w: 2.22, d: 0.87, h: 2.0, variants: 2,
  variantNames: ['Three barrels', 'Six barrels'],
  variantDims: [{ w: 1.48, d: 0.87, h: 1.37 }, { w: 2.22, d: 0.87, h: 2.0 }],
  build: function (F) {
    const n = F.variant === 0 ? 2 : 3, r = 0.36, c = F.pick(['timberPine', 'timberPineDark']), hoop = F.col('ironSoot');
    for (let k = 0; k < n; k++) for (let i = 0; i < n - k; i++) HLREP.barrelLying(F, (i - (n - k - 1) / 2) * r * 2.05, k * r * 1.75, 0, r, r * 2.4, false, F.shade(c, F.rr(-0.06, 0.06)), hoop);
  }
});
FURN({
  key: 'hl_rep_anvil', name: 'Smith\'s anvil', culture: 'republican', tier: 'common', type: 'workstation', role: 'anvil', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8, left: 0.5, right: 0.5 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRAAnvil; 77-rep-guild.js buildHlRepGuildSmith (iron block anvil)', w: 0.6, d: 1.0, h: 1.02, variants: 2,
  variantNames: ['Anvil on its stump', 'Iron block anvil'],
  variantDims: [{ w: 0.6, d: 1.0, h: 1.02 }, { w: 0.9, d: 0.45, h: 0.95 }],
  build: function (F) {
    const I = F.col('ironSoot');
    if (F.variant === 1) { F.box(0, 0, 0, 0.5, 0.7, 0.45, 0, I, 'metal'); F.box(0, 0.7, 0, 0.9, 0.25, 0.35, 0, F.shade(I, 0.08), 'metal'); return; }
    F.shift(0, -0.14);
    F.frustum(0, 0, 0, 0.3, 0.26, 0.6, 0, F.col('timberStump'), 'wood', 8);
    F.box(0, 0.6, 0, 0.28, 0.16, 0.5, 0, I, 'metal');
    F.box(0, 0.76, 0, 0.18, 0.12, 0.3, 0, I, 'metal');
    F.box(0, 0.88, 0, 0.3, 0.14, 0.72, 0, F.shade(I, 0.08), 'metal');
    F.rod(0, 0.95, 0.3, 0, 0.95, 0.5, 0.065, I, 'metal');                  /* the horn */
    F.rod(0, 0.95, 0.5, 0, 0.95, 0.63, 0.032, I, 'metal');
  }
});
FURN({
  key: 'hl_rep_quench_trough', name: 'Stone quench trough', culture: 'republican', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['smithy', 'stable', 'yard', 'workshop'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'glass'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRATrough', w: 1.4, d: 0.8, h: 0.71, variants: 2,
  variantNames: ['Smithy (1.4 m)', 'Inn yard (2.4 m)'],
  variantDims: [{ w: 1.4, d: 0.8, h: 0.71 }, { w: 2.4, d: 0.8, h: 0.71 }],
  build: function (F) {
    const L = F.variant === 1 ? 2.4 : 1.4;
    F.box(0, 0, 0, L, 0.7, 0.8, 0, F.col('stoneRubble'), 'stone');
    F.box(0, 0.64, 0, L - 0.2, 0.07, 0.6, 0, F.col('waterDark'), 'glass');
  }
});
FURN({
  key: 'hl_rep_forge_hearth', name: 'Scrap forge hearth', culture: 'republican', tier: 'common', type: 'stove', role: 'forge', setting: 'indoor',
  rooms: ['smithy', 'workshop'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['stone', 'rustSteel', 'emissive', 'timber', 'hide'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRAHearth', w: 2.7, d: 1.4, h: 3.5, variants: 2,
  variantNames: ['Small smithy (1.6 m)', 'Large smithy (2.0 m)'],
  variantDims: [{ w: 2.7, d: 1.4, h: 3.5 }, { w: 3.1, d: 1.4, h: 3.5 }],
  build: function (F) {
    const w = F.variant === 1 ? 2.0 : 1.6, rust = F.col('rustSalvage');
    F.shift(0.45, 0);
    F.box(0, 0, 0, w, 0.95, 1.3, 0, F.col('stoneRubble'), 'stone');
    F.box(0, 0.95, 0, w - 0.4, 0.08, 0.9, 0, F.col('coal'), 'stone');
    for (let k = 0; k < 5; k++) F.blob(F.rr(-w / 2 + 0.4, w / 2 - 0.4), 1.02, F.rr(-0.3, 0.3), F.rr(0.08, 0.16), 0.18, 0, F.col('emberHot'), 'glow');
    F.box(0, 1.9, 0, w - 0.2, 0.9, 1.1, 0, rust, 'rust');                     /* the hood */
    F.box(0, 1.78, 0, w + 0.2, 0.14, 1.4, 0, F.shade(rust, -0.1), 'rust');
    F.cyl(0, 2.8, 0, 0.3, 0.7, 0, F.shade(rust, -0.15), 'rust');              /* the reclaimed-pipe stack */
    const bx = -w / 2 - 0.55;                                                  /* the bellows */
    for (const s of [-1, 1]) F.box(bx + s * 0.36, 0, 0.1, 0.08, 0.45, 0.6, 0, F.col('timberStump'), 'wood');
    F.box(bx, 0.45, 0.1, 0.9, 0.25, 0.7, 0, F.col('timberStump'), 'wood');
    F.beam(bx - 0.44, 0.78, 0.1, bx + 0.44, 0.95, 0.1, 0.25, 0.7, F.col('leatherBrown'), 'hide');
    F.lamp(0, 1.25, 0.2, 0.9, 5);
  }
});
FURN({
  key: 'hl_rep_wall_forge', name: 'Forgehouse hearth', culture: 'republican', tier: 'court', type: 'stove', role: 'forge', setting: 'indoor',
  rooms: ['smithy', 'workshop'], anchor: 'wall', clearance: { front: 1.4 },
  materials: ['stone', 'emissive', 'rustSteel', 'metal'],
  source: 'settlements/highlands/src/78-rep-grand.js hnRCHearth', w: 2.4, d: 0.4, h: 4.2, variants: 2,
  variantNames: ['Hearth', 'Great hearth'],
  variantDims: [{ w: 2.4, d: 0.4, h: 4.2 }, { w: 3.2, d: 0.4, h: 4.2 }],
  build: function (F) {
    const w = F.variant === 1 ? 2.6 : 1.8;
    F.shift(0, -0.145);
    F.box(0, 0, 0.1, w + 0.6, 0.9, 0.3, 0, F.col('stoneRubble'), 'stone');
    F.box(0, 0.9, 0.02, w, 0.55, 0.12, 0, F.col('glowForge'), 'glow');
    for (let k = 0; k < 5; k++) F.ball(F.rr(-w / 2 + 0.2, w / 2 - 0.2), 0.95, 0.18, F.rr(0.08, 0.16), F.col('emberHot'), 'glow');
    F.box(0, 1.75, 0.12, w + 0.4, 0.9, 0.3, 0, F.col('rustSalvage'), 'rust');
    F.box(0, 2.6, 0.08, 0.5, 1.6, 0.16, 0, F.col('ironSoot'), 'metal');
    F.lamp(0, 1.2, 0.4, 1.0, 6);
  }
});
FURN({
  key: 'hl_rep_hooded_forge', name: 'Guild forge', culture: 'republican', tier: 'court', type: 'stove', role: 'forge', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 1.2, left: 0.6, right: 0.6 },
  materials: ['stone', 'emissive', 'metal', 'rustSteel'],
  source: 'settlements/highlands/src/77-rep-guild.js buildHlRepGuildSmith (forge shed); 78-rep-grand.js buildHlRepFortress (bailey smithy)', w: 1.6, d: 1.6, h: 4.5, variants: 2,
  variantNames: ['Hooded forge (Guild of Smiths)', 'Bailey forge (fortress)'],
  variantDims: [{ w: 1.6, d: 1.6, h: 4.5 }, { w: 1.8, d: 1.8, h: 4.1 }],
  build: function (F) {
    const I = F.col('ironSoot');
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.8, 1.0, 1.8, 0, F.col('stoneAshlar'), 'stone');
      for (let k = 0; k < 4; k++) F.ball(F.rr(-0.4, 0.4), 1.08, F.rr(-0.4, 0.4), F.rr(0.1, 0.18), F.col('emberHot'), 'glow');
      F.cyl(0.5, 1.0, -0.5, 0.25, 3.0, 0, F.col('rustSalvage'), 'rust');
      F.box(0.5, 4.0, -0.5, 0.75, 0.08, 0.75, 0, I, 'metal');
      F.lamp(0, 1.3, 0, 0.9, 5);
      return;
    }
    F.box(0, 0, 0, 1.6, 1.0, 1.6, 0, F.col('stoneRubble'), 'stone');
    F.blob(0, 1.02, 0, 0.5, 0.16, 0, F.col('emberHot'), 'glow');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.7, 1.0, sz * 0.7, sx * 0.62, 2.12, sz * 0.62, 0.02, I, 'metal');
    F.pyrRoof(0, 2.1, 0, 1.4, 0.9, 1.4, 0, F.col('stoneSlate'), 'stone');
    F.cyl(0, 2.9, 0, 0.18, 1.5, 0, I, 'metal');
    F.box(0, 4.42, 0, 0.54, 0.08, 0.54, 0, I, 'metal');
    F.lamp(0, 1.3, 0, 0.9, 5);
  }
});
FURN({
  key: 'hl_rep_salvage_forge', name: 'Shipbreakers\' forge fire', culture: 'republican', tier: 'poor', type: 'stove', role: 'forge', setting: 'outdoor',
  rooms: ['yard', 'smithy', 'workshop', 'dock'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'emissive', 'rustSteel', 'metal'],
  source: 'settlements/highlands/src/79f-rep-shipbreak.js hlShipBreak (the camp forge under its lean-to)', w: 3.2, d: 2.8, h: 4.6, variants: 1,
  build: function (F) {
    const rust = F.col('rustSalvage');
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.cyl(sx * 1.4, 0, sz * 1.2, 0.06, sz < 0 ? 2.78 : 2.42, 0, rust, 'rust');
    F.beam(0, 2.8, -1.36, 0, 2.42, 1.36, 3.2, 0.05, F.shade(rust, -0.1), 'rust');
    F.box(0, 0, 0, 1.4, 0.8, 1.2, 0, F.col('stoneRubble'), 'stone');
    F.blob(0, 0.85, 0, 0.35, 0.2, 0, F.col('emberHot'), 'glow');
    F.cyl(0.4, 0.8, -0.3, 0.12, 3.6, 0, rust, 'rust');
    F.box(0.4, 4.5, -0.3, 0.36, 0.08, 0.36, 0, F.col('ironSoot'), 'metal');
    F.lamp(0, 1.1, 0.2, 0.9, 5);
  }
});
FURN({
  key: 'hl_rep_wheel_stand', name: 'Wheelwright\'s wheel stand', culture: 'republican', tier: 'common', type: 'workstation', role: 'workbench', setting: 'both',
  rooms: ['workshop', 'yard', 'smithy'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopA (wheel on its stand, hnRAWheel)', w: 1.24, d: 0.4, h: 1.92, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged'), log = F.col('timberPine');
    F.box(0, 0, 0, 0.4, 0.8, 0.4, 0, aged, 'wood');
    F.cyl(0, 0.8, 0, 0.05, 0.5, 0, F.col('ironSoot'), 'metal');
    HLREP.wheel(F, 0, 1.3, 0, 0.62, false, 0.12, log, F.col('ironSoot'), 8);
  }
});
FURN({
  key: 'hl_rep_cartwheels', name: 'Spare cartwheels', culture: 'republican', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['workshop', 'yard', 'store', 'stable'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRAWheel (finished wheels); 79-rep-land.js hnRCWheel (spare wheel on its axle)', w: 1.0, d: 1.1, h: 1.15, variants: 2,
  variantNames: ['Three finished wheels', 'Spare wheel on its axle'],
  variantDims: [{ w: 1.0, d: 1.1, h: 1.15 }, { w: 1.14, d: 1.2, h: 1.2 }],
  build: function (F) {
    const log = F.col('timberPine'), iron = F.col('ironSoot');
    if (F.variant === 1) {
      for (const s of [-1, 1]) HLREP.wheel(F, s * 0.07, 0.6, 0, 0.6, true, 0.06, F.col('timberAged'), iron, 4);
      F.rod(-0.57, 0.6, 0, 0.57, 0.6, 0, 0.06, iron, 'metal');
      return;
    }
    for (const x of [-0.4, 0, 0.4]) HLREP.wheel(F, x, 0.6, 0, 0.55, true, 0.12, F.shade(log, F.rr(-0.08, 0.06)), iron, 8);
  }
});
FURN({
  key: 'hl_rep_wagon', name: 'Republican wagon', culture: 'republican', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['yard', 'market', 'stable', 'street', 'dock'], anchor: 'floor', clearance: { left: 0.6, right: 0.6, back: 0.6 },
  materials: ['timber', 'metal', 'thatch', 'cloth'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRAWagon', w: 2.0, d: 5.3, h: 1.9, variants: 4,
  variantNames: ['Hay', 'Barrels', 'Sacks', 'A wheel off'],
  variantDims: [{ w: 2.0, d: 5.3, h: 1.9 }, { w: 2.0, d: 5.3, h: 1.52 }, { w: 2.0, d: 5.3, h: 1.81 }, { w: 2.0, d: 5.3, h: 1.24 }],
  build: function (F) {
    const c = F.pick(['timberPine', 'timberPineDark']), iron = F.col('ironSoot'), load = F.variant;
    F.shift(0, -1.105);
    F.box(0, 0.72, 0, 1.4, 0.1, 3, 0, c, 'wood');
    for (const s of [-1, 1]) { F.box(s * 0.68, 0.82, 0, 0.08, 0.42, 3, 0, c, 'wood'); F.box(0, 0.82, s * 1.46, 1.36, 0.42, 0.08, 0, c, 'wood'); }
    for (const [o, r] of [[-0.95, 0.58], [0.95, 0.46]]) {
      F.box(0, r - 0.04, o, 1.9, 0.08, 0.08, 0, F.shade(c, -0.15), 'wood');
      for (const s of [-1, 1]) { if (load === 3 && o < 0 && s > 0) continue; HLREP.wheel(F, s * 0.86, r, o, r, true, 0.12, c, iron, 8); }
    }
    for (const s of [-1, 1]) F.beam(s * 0.32, 0.62, 1.4, s * 0.36, 0.45, 3.7, 0.07, 0.07, c, 'wood');
    if (load === 0) F.box(0, 0.8, 0, 1.5, 1.1, 3.1, 0, F.col('thatchHay'), 'thatch');
    else if (load === 1) { for (const o of [-0.8, 0.8]) for (const s of [-1, 1]) HLREP.barrel(F, s * 0.33, 0.77, o, 0.3, 0.75, F.shade(c, -0.1), iron); }
    else if (load === 2) { for (let i = 0; i < 5; i++) HLREP.sack(F, F.rr(-0.5, 0.5), 0.72 + 0.32 + (i > 2 ? 0.45 : 0), F.rr(-0.9, 0.9), 1, F.pick(['clothSacking', 'clothSackingDark', 'clothSackingPale'])); }
    else F.box(0.95, 0, -0.3, 0.25, 0.4, 0.25, 0, c, 'wood');                  /* the axle propped on a block */
  }
});
FURN({
  key: 'hl_rep_farm_cart', name: 'Farm cart', culture: 'republican', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['yard', 'market', 'stable', 'street', 'garden'], anchor: 'floor', clearance: { left: 0.5, right: 0.5, back: 0.5 },
  materials: ['timber', 'metal', 'cloth', 'thatch', 'stone'],
  source: 'settlements/highlands/src/79-rep-land.js hnRCCart', w: 2.9, d: 5.25, h: 2.1, variants: 5,
  variantNames: ['Sacks', 'Hay', 'A dressed stone', 'Logs', 'Empty'],
  variantDims: [{ w: 2.9, d: 5.25, h: 1.85 }, { w: 2.9, d: 5.25, h: 2.1 }, { w: 2.9, d: 5.25, h: 1.62 }, { w: 2.9, d: 5.25, h: 1.55 }, { w: 2.9, d: 5.25, h: 1.39 }],
  build: function (F) {
    const c = F.pick(['timberAged', 'timberAgedDark']), iron = F.col('ironSoot'), load = F.variant;
    F.shift(0, -1.025);
    F.box(0, 0.85, 0, 1.5, 0.14, 2.8, 0, c, 'wood');
    for (const s of [-1, 1]) F.box(s * 0.72, 0.99, 0, 0.08, 0.4, 2.8, 0, c, 'wood');
    for (const s of [-1, 1]) {
      for (const t of [-1, 1]) HLREP.wheel(F, s * 0.9 + t * 0.05, 0.6, -0.2, 0.6, true, 0.05, c, iron, 4);
      F.beam(s * 0.35, 0.6, -0.2, s * 1.45, 0.6, -0.2, 0.12, 0.12, iron, 'metal');
      F.beam(s * 0.4, 0.85, 1.4, s * 0.35, 0.08, 3.6, 0.1, 0.1, c, 'wood');
    }
    if (load === 0) for (let i = 0; i < 5; i++) HLREP.sack(F, F.rr(-0.4, 0.4), 1.2 + (i > 2 ? 0.35 : 0), F.rr(-0.9, 0.9), 0.95, F.pick(['clothSacking', 'clothSackingDark', 'clothSackingPale']));
    else if (load === 1) F.box(0, 0.9, 0, 1.8, 1.2, 2.6, 0, F.col('thatchHay'), 'thatch');
    else if (load === 2) F.box(0, 0.92, 0, 1.0, 0.7, 1.4, 0, F.col('stoneAshlar'), 'stone');
    else if (load === 3) for (let i = 0; i < 5; i++) { const x = -0.45 + (i % 3) * 0.45; F.rod(x, 1.1 + Math.floor(i / 3) * 0.3, -1.6, x, 1.1 + Math.floor(i / 3) * 0.3, 1.6, 0.15, F.pick(['timberPine', 'timberPineDark']), 'wood'); }
  }
});
FURN({
  key: 'hl_rep_hand_cart', name: 'Hand cart', culture: 'republican', tier: 'poor', type: 'stall', setting: 'outdoor',
  rooms: ['yard', 'street', 'market', 'garden'], anchor: 'floor', clearance: { back: 0.6 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/74-rep-dwell.js buildHlRepPoorC (the hand cart)', w: 1.3, d: 2.75, h: 0.85, variants: 1,
  build: function (F) {
    const log = F.col('timberAged');
    F.shift(0, 0.565);
    F.box(0, 0.55, 0, 1.0, 0.08, 1.6, 0, log, 'wood');
    for (const s of [-1, 1]) {
      HLREP.wheel(F, s * 0.58, 0.42, 0.2, 0.42, true, 0.08, log, F.col('ironSoot'), 4);
      F.beam(s * 0.3, 0.6, -0.8, s * 0.3, 0.15, -1.9, 0.05, 0.05, log, 'wood');
    }
    F.rod(-0.55, 0.42, 0.2, 0.55, 0.42, 0.2, 0.03, F.col('ironSoot'), 'metal');
  }
});
FURN({
  key: 'hl_rep_scrap_heap', name: 'Heap of Ancient salvage', culture: 'republican', tier: 'poor', type: 'debris', setting: 'outdoor',
  rooms: ['yard', 'smithy', 'workshop', 'dock'], anchor: 'floor', clearance: {},
  materials: ['rustSteel', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js hnRAScrap', w: 3.6, d: 4.6, h: 1.1, variants: 2,
  variantNames: ['Small heap', 'Smithy scrap yard'],
  variantDims: [{ w: 2.4, d: 2.4, h: 1.1 }, { w: 3.6, d: 4.6, h: 1.1 }],
  build: function (F) {
    const big = F.variant === 1, w = big ? 3.6 : 2.4, d = big ? 4.6 : 2.4, n = big ? 46 : 18, m = 0.75;
    const rust = F.col('rustSalvage'), sheet = F.col('steelCorrugate'), white = F.col('alloyWhite'), iron = F.col('ironSoot');
    for (let i = 0; i < n; i++) {
      const px = F.rr(-w / 2 + m, w / 2 - m), pz = F.rr(-d / 2 + m, d / 2 - m);
      const e = Math.max(0, 1 - Math.hypot(px / (w / 2), pz / (d / 2))), hg = e * F.rr(0.2, 0.8), r = F.rnd(), a = F.rr(0, F.TAU);
      const L = F.rr(0.5, 1.1), ca = Math.cos(a) * L / 2, sa = Math.sin(a) * L / 2, t = F.rr(0.15, 0.5) * L;
      if (r < 0.3) F.box(px, hg, pz, L, 0.05, F.rr(0.4, 0.9), a, F.shade(rust, F.rr(-0.1, 0.1)), 'rust');                     /* rusted plate */
      else if (r < 0.5) F.rod(px - ca, hg + 0.12, pz - sa, px + ca, hg + 0.12 + t * 0.3, pz + sa, F.rr(0.05, 0.12), F.shade(rust, -0.15), 'rust');   /* pipe offcut */
      else if (r < 0.72) F.beam(px, hg + 0.02, pz - L / 4, px, hg + 0.02 + t, pz + L / 4, F.rr(0.5, 1.0), 0.03, F.pick([sheet, rust, white, rust]), 'rust');   /* a sheet on edge */
      else if (r < 0.86) F.box(px, hg, pz, L, 0.06, F.rr(0.4, 0.9), a, white, 'metal');                                      /* white Ancient panel */
      else F.box(px, hg, pz, F.rr(0.2, 0.5), F.rr(0.15, 0.35), F.rr(0.2, 0.5), a, iron, 'metal');
    }
  }
});
FURN({
  key: 'hl_rep_hitching_rail', name: 'Hitching rail', culture: 'republican', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['street', 'yard', 'stable', 'market'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepTavernC (hitching rail)', w: 3.0, d: 0.16, h: 1.1, variants: 1,
  build: function (F) {
    const log = F.col('timberPine');
    for (const s of [-1, 1]) F.cyl(s * 1.4, 0, 0, 0.08, 1.1, 0, log, 'wood');
    F.box(0, 1.0, 0, 3.0, 0.1, 0.1, 0, F.shade(log, -0.08), 'wood');
  }
});
FURN({
  key: 'hl_rep_market_counter', name: 'Market counter', culture: 'republican', tier: 'common', type: 'counter', setting: 'both',
  rooms: ['market', 'shop', 'store'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'cloth', 'ceramic'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepMarketHall (stalls under the arches); 79c-rep-apoc.js buildHlRepLanternStall (counter)', w: 2.4, d: 0.7, h: 1.3, variants: 2,
  variantNames: ['Market hall stall', 'Lantern-stall counter'],
  variantDims: [{ w: 2.4, d: 0.7, h: 1.3 }, { w: 5.2, d: 0.6, h: 0.95 }],
  build: function (F) {
    if (F.variant === 1) { F.box(0, 0, 0, 5.2, 0.95, 0.6, 0, F.col('timberAged'), 'wood'); F.box(0, 0.88, 0, 5.24, 0.07, 0.64, 0, F.shade('timberAged', 0.08), 'wood'); return; }
    F.box(0, 0, 0, 2.4, 0.9, 0.7, 0, F.col('timberPine'), 'wood');
    for (let k = 0; k < 3; k++) {
      const x = -1.0 + k, r = F.rnd();
      if (r < 0.35) F.box(x, 0.9, 0, 0.38, 0.3, 0.34, F.rr(-0.3, 0.3), F.col('timberOak'), 'wood');
      else if (r < 0.65) HLREP.sack(F, x, 1.1, 0, 0.55, F.pick(['clothSacking', 'clothSackingDark']));
      else F.frustum(x, 0.9, 0, 0.14, 0.12, 0.36, 0, F.pick(['clayRed', 'clayTan']), 'ceramic', 10);
    }
  }
});
FURN({
  key: 'hl_rep_weighing_beam', name: 'Market weighing beam', culture: 'republican', tier: 'common', type: 'tool', setting: 'both',
  rooms: ['market', 'shop', 'store'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'bronze', 'rope'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepMarketHall (weighing beam)', w: 1.8, d: 0.4, h: 2.4, variants: 1,
  build: function (F) {
    const log = F.col('timberPine'), pan = F.col('brassDull');
    F.cyl(0, 0, 0, 0.08, 2.4, 0, log, 'wood');
    F.box(0, 2.3, 0, 1.6, 0.08, 0.08, 0, F.shade(log, -0.1), 'wood');
    for (const s of [-1, 1]) {
      F.box(s * 0.7, 1.6, 0, 0.4, 0.04, 0.4, 0, pan, 'bronze');
      for (const t of [-1, 1]) F.rod(s * 0.7 + t * 0.16, 1.64, 0, s * 0.7, 2.3, 0, 0.008, F.col('clothSacking'), 'rope');
    }
  }
});
FURN({
  key: 'hl_rep_workbench', name: 'Craftsman\'s bench', culture: 'republican', tier: 'common', type: 'workstation', role: 'workbench', setting: 'indoor',
  rooms: ['workshop', 'smithy'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopA, buildHlRepSmithySmall; 77-rep-guild.js buildHlRepGuildMech (bench with a gear)', w: 3.0, d: 0.8, h: 0.85, variants: 3,
  variantNames: ['Wheelwright\'s bench', 'Smith\'s bench with bar stock', 'Mechanic\'s bench with a gear wheel'],
  variantDims: [{ w: 3.0, d: 0.8, h: 0.85 }, { w: 1.2, d: 0.6, h: 1.35 }, { w: 2.2, d: 0.9, h: 2.24 }],
  build: function (F) {
    const aged = F.col('timberAged'), I = F.col('ironSoot');
    if (F.variant === 0) { F.box(0, 0, 0, 2.9, 0.75, 0.7, 0, aged, 'wood'); F.box(0, 0.75, 0, 3.0, 0.1, 0.8, 0, F.shade(aged, 0.08), 'wood'); return; }
    if (F.variant === 1) {
      F.box(0, 0, 0, 1.2, 0.85, 0.6, 0, aged, 'wood');
      for (let k = 0; k < 4; k++) F.box(-0.4 + k * 0.26, 0.85, 0, 0.04, 0.5, 0.04, 0, I, 'metal');
      return;
    }
    F.box(0, 0, 0, 2.2, 0.9, 0.9, 0, F.col('timberTar'), 'wood');
    F.box(0, 0.9, 0, 0.3, 0.1, 0.2, 0, I, 'metal');                                /* the gear's foot */
    F.rod(0, 1.6, -0.06, 0, 1.6, 0.06, 0.54, I, 'metal');                         /* the iron gear wheel, facing front */
    for (let k = 0; k < 18; k++) { const a = k / 18 * F.TAU; F.beam(Math.cos(a) * 0.5, 1.6 + Math.sin(a) * 0.5, 0, Math.cos(a) * 0.62, 1.6 + Math.sin(a) * 0.62, 0, 0.08, 0.12, I, 'metal'); }
    F.rod(0, 1.6, -0.08, 0, 1.6, 0.08, 0.1, F.shade(I, 0.2), 'metal');
  }
});
FURN({
  key: 'hl_rep_tool_rail', name: 'Tools on the wall', culture: 'republican', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['workshop', 'smithy', 'store'], anchor: 'wall', clearance: {},
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopA (tools on the wall)', w: 2.1, d: 0.1, h: 1.95, variants: 1,
  build: function (F) {
    const I = F.col('ironSoot');
    F.box(0, 1.5, -0.035, 2.1, 0.08, 0.03, 0, F.col('timberAged'), 'wood');
    for (let k = 0; k < 7; k++) {
      const x = -0.9 + k * 0.3;
      F.box(x, 1.3, 0, 0.05, 0.6, 0.04, 0, k % 2 ? I : F.col('timberOak'), k % 2 ? 'metal' : 'wood');
      if (k % 2 === 0) F.box(x, 1.3, 0, 0.16, 0.06, 0.05, 0, I, 'metal');      /* hammer and axe heads */
    }
  }
});
FURN({
  key: 'hl_rep_timber_stack', name: 'Seasoning timber', culture: 'republican', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['workshop', 'yard', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopA (timber stacks under the lean-to)', w: 7.6, d: 1.76, h: 1.33, variants: 2,
  variantNames: ['Logs, four courses', 'Sawn planks'],
  variantDims: [{ w: 7.6, d: 1.76, h: 1.33 }, { w: 3.65, d: 0.55, h: 1.0 }],
  build: function (F) {
    if (F.variant === 1) { const log = F.col('timberPine'); for (let k = 0; k < 8; k++) F.box(0, 0.05 + k * 0.12, 0, 3.6, 0.1, 0.4, F.rr(-0.04, 0.04), F.shade(log, F.rr(-0.1, 0.12)), 'wood'); return; }
    const aged = F.col('timberAged');
    for (let k = 0; k < 4; k++) for (let i = 0; i < 5; i++) F.rod(-3.8, 0.18 + k * 0.33, -0.72 + i * 0.36, 3.8, 0.18 + k * 0.33, -0.72 + i * 0.36, 0.16, F.shade(aged, F.rr(-0.1, 0.12)), 'wood');
  }
});
FURN({
  key: 'hl_rep_sawpit', name: 'Sawpit with a log on trestles', culture: 'republican', tier: 'common', type: 'workstation', role: 'workbench', setting: 'outdoor',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { left: 0.6, right: 0.6 },
  materials: ['timber', 'stone'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopA (sawpit)', w: 3.2, d: 4.4, h: 1.4, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    F.shift(-0.8, 0);
    F.box(0, 0, 0, 1.1, 0.04, 3.4, 0, F.col('coal'), 'stone');                     /* the pit */
    for (const s of [-1, 1]) F.box(s * 0.7, 0, 0, 0.2, 0.22, 3.8, 0, aged, 'wood');
    for (const s of [-1, 1]) for (const t of [-1, 1]) F.beam(s * 0.51, 0, t * 1.1, s * 0.19, 1.0, t * 1.1, 0.08, 0.08, aged, 'wood');
    F.rod(0, 1.1, -2.2, 0, 1.1, 2.2, 0.3, F.shade(aged, -0.1), 'wood');
    F.box(1.6, 0, 0, 1.6, 0.05, 1.4, 0, F.col('sawdust'), 'wood');
  }
});
FURN({
  key: 'hl_rep_brew_copper', name: 'Brewer\'s copper', culture: 'republican', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'kitchen', 'tavern', 'store'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'bronze', 'emissive'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopB (the copper)', w: 1.8, d: 2.04, h: 3.5, variants: 1,
  build: function (F) {
    const cu = F.col('copper');
    F.box(0, 0, 0, 1.8, 0.8, 1.8, 0, F.col('stoneRubble'), 'stone');
    F.box(0, 0.2, 0.91, 0.6, 0.4, 0.02, 0, F.col('coal'), 'stone');
    F.ball(0, 0.35, 0.9, 0.12, F.col('emberHot'), 'glow');
    F.cyl(0, 0.8, 0, 0.8, 1.1, 0, cu, 'bronze');
    F.dome(0, 1.9, 0, 0.8, 0.5, 0, F.shade(cu, 0.06), 'bronze');
    F.cyl(0, 2.3, 0, 0.12, 1.2, 0, F.shade(cu, -0.1), 'bronze');
    F.lamp(0, 0.4, 1.1, 0.6, 4);
  }
});
FURN({
  key: 'hl_rep_cooper_fire', name: 'Cooper raising a barrel', culture: 'republican', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6, left: 0.4, right: 0.4 },
  materials: ['timber', 'metal', 'emissive'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepWorkshopB (a barrel being raised round a fire basket)', w: 1.08, d: 1.08, h: 1.0, variants: 1,
  build: function (F) {
    const log = F.col('timberPine'), I = F.col('ironSoot');
    for (let k = 0; k < 16; k++) { const a = k / 16 * F.TAU, c = Math.cos(a), s = Math.sin(a); F.beam(c * 0.49, 0, s * 0.49, c * 0.39, 0.98, s * 0.39, 0.06, 0.12, F.shade(log, F.rr(-0.08, 0.06)), 'wood'); }
    HLREP.ring(F, [0, 0.9, 0], [1, 0, 0], [0, 0, 1], 0.41, 0.025, I, 'metal', 16);
    F.box(0, 0, 0, 0.5, 0.25, 0.5, 0, I, 'metal');
    F.ball(0, 0.3, 0, 0.16, F.col('emberHot'), 'glow');
    F.lamp(0, 0.5, 0, 0.6, 4);
  }
});
FURN({
  key: 'hl_rep_grindstone', name: 'Grindstone', culture: 'republican', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'stone', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepSmithySmall (grindstone)', w: 0.56, d: 0.72, h: 1.13, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    for (const s of [-1, 1]) F.box(0, 0, s * 0.3, 0.12, 0.9, 0.12, 0, aged, 'wood');
    F.rod(0, 0.85, -0.06, 0, 0.85, 0.06, 0.275, F.col('stoneGrind'), 'stone');
    F.rod(0, 0.85, -0.36, 0, 0.85, 0.36, 0.025, F.col('ironSoot'), 'metal');
    F.beam(0, 0.85, 0.36, 0.14, 0.85, 0.36, 0.03, 0.03, F.col('ironSoot'), 'metal');
  }
});
FURN({
  key: 'hl_rep_bar_rack', name: 'Rack of bar stock', culture: 'republican', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['smithy', 'store', 'workshop'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepSmithyLarge (racks of bar stock)', w: 4.08, d: 0.9, h: 2.13, variants: 1,
  build: function (F) {
    const log = F.col('timberPine'), I = F.col('ironSoot');
    for (const x of [-2.0, 0, 2.0]) F.box(x, 0, -0.4, 0.08, 2.08, 0.08, 0, F.shade(log, -0.12), 'wood');
    for (let k = 0; k < 3; k++) F.box(0, 0.6 + k * 0.7, 0, 4.0, 0.08, 0.9, 0, log, 'wood');
    for (let k = 0; k < 14; k++) F.box(F.rr(-0.1, 0.1), 0.68 + (k % 3) * 0.7, F.rr(-0.3, 0.3), 3.8, 0.05, 0.05, 0, F.shade(I, F.rr(0, 0.2)), 'metal');
  }
});
FURN({
  key: 'hl_rep_horse_stall', name: 'Caravanserai horse stall', culture: 'republican', tier: 'common', type: 'pen', role: 'stall', setting: 'both',
  rooms: ['stable', 'yard'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['timber', 'thatch'],
  source: 'settlements/highlands/src/75-rep-trade.js buildHlRepStables (stall ranges: partitions, mangers)', w: 2.8, d: 3.6, h: 2.5, variants: 1,
  build: function (F) {
    const log = F.col('timberPine'), aged = F.col('timberAged');
    F.shift(0, -0.05);
    for (const s of [-1, 1]) { F.box(s * 1.3, 0, 0, 0.08, 1.5, 3.5, 0, aged, 'wood'); F.cyl(s * 1.3, 0, 1.75, 0.1, 2.3, 0, log, 'wood'); }
    F.box(0, 2.3, 1.75, 2.8, 0.2, 0.2, 0, log, 'wood');
    F.box(0, 0.7, -1.15, 1.6, 0.4, 0.5, 0, aged, 'wood');                        /* the manger */
    F.box(0, 1.02, -1.15, 1.5, 0.12, 0.42, 0, F.col('thatchHay'), 'thatch');
    for (const s of [-1, 1]) F.box(s * 0.7, 0, -1.15, 0.08, 0.7, 0.08, 0, aged, 'wood');
  }
});
FURN({
  key: 'hl_rep_hay_rack', name: 'Byre hay rack', culture: 'republican', tier: 'poor', type: 'rack', setting: 'both',
  rooms: ['stable', 'yard', 'store'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['timber', 'thatch'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepPens (cattle shelter hay rack)', w: 8.0, d: 0.42, h: 1.9, variants: 2,
  variantNames: ['Long (8 m)', 'One bay (4 m)'],
  variantDims: [{ w: 8.0, d: 0.42, h: 1.9 }, { w: 4.0, d: 0.42, h: 1.9 }],
  build: function (F) {
    const W = F.variant === 1 ? 4 : 8, aged = F.col('timberAged');
    F.box(0, 1.1, -0.01, W - 0.2, 0.8, 0.4, 0, F.col('thatchStraw'), 'thatch');
    F.box(0, 1.0, 0.15, W, 0.12, 0.12, 0, aged, 'wood');
    for (let k = 0; k <= W; k++) F.box(-W / 2 + k, 1.0, -0.05, 0.05, 0.9, 0.05, 0, aged, 'wood');
    for (const s of [-1, 1]) F.box(s * (W / 2 - 0.04), 0, 0.1, 0.08, 1.9, 0.08, 0, aged, 'wood');
  }
});
FURN({
  key: 'hl_rep_haystack', name: 'Haystack', culture: 'republican', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'garden', 'stable'], anchor: 'floor', clearance: {},
  materials: ['thatch', 'timber'],
  source: 'settlements/highlands/src/79-rep-land.js hnRCHaystack; 77-rep-guild.js buildHlRepGuildFarm (hay rick)', w: 3.06, d: 3.06, h: 3.87, variants: 2,
  variantNames: ['Stooked stack', 'Hay rick'],
  variantDims: [{ w: 3.06, d: 3.06, h: 3.87 }, { w: 4.0, d: 4.0, h: 4.2 }],
  build: function (F) {
    const c = F.col('thatchStraw'), post = F.col('timberStump');
    if (F.variant === 1) { F.cone(0, 0, 0, 2, 3.6, 0, c, 'thatch'); F.cyl(0, 3.4, 0, 0.05, 0.8, 0, post, 'wood'); return; }
    F.blob(0, 1.152, 0, 1.5, 2.304, 0, c, 'thatch');
    F.cone(0, 1.15, 0, 1.53, 2.3, 0, F.shade(c, 0.05), 'thatch');
    F.cyl(0, 3.07, 0, 0.05, 0.8, 0, post, 'wood');
  }
});
FURN({
  key: 'hl_rep_roofed_well', name: 'Courtyard well', culture: 'republican', tier: 'common', type: 'well', setting: 'outdoor',
  rooms: ['yard', 'garden', 'court', 'plaza'], anchor: 'floor', clearance: { front: 0.8, left: 0.6, right: 0.6 },
  materials: ['stone', 'timber', 'glass'],
  source: 'settlements/highlands/src/74-rep-dwell.js buildHlRepRichC (the walled courtyard well)', w: 2.3, d: 1.86, h: 2.75, variants: 1,
  build: function (F) {
    const ash = F.col('stoneAshlar'), tar = F.col('timberTar');
    for (let k = 0; k < 10; k++) { const a = k / 10 * F.TAU; F.box(Math.cos(a) * 0.75, 0, Math.sin(a) * 0.75, 0.3, 0.8, 0.5, -a, F.shade(ash, F.rr(-0.06, 0.04)), 'stone'); }
    F.cyl(0, 0.6, 0, 0.62, 0.02, 0, F.col('waterDark'), 'glass');
    for (const s of [-1, 1]) F.cyl(s * 0.8, 0, 0, 0.07, 2.2, 0, tar, 'wood');
    F.box(0, 2.1, 0, 1.8, 0.1, 0.1, 0, tar, 'wood');
    HLREP.gable(F, 0, 2.2, 0, 2.3, 1.6, 0.5, F.col('timberAged'), 'wood');
  }
});
FURN({
  key: 'hl_rep_civic_well', name: 'Civic well', culture: 'republican', tier: 'court', type: 'well', setting: 'outdoor',
  rooms: ['yard', 'court', 'plaza', 'garden', 'barracks'], anchor: 'floor', clearance: { front: 0.8, left: 0.6, right: 0.6 },
  materials: ['stone', 'timber', 'glass', 'rope', 'metal'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepHospital, buildHlRepBarracks (octagonal well); 78-rep-grand.js buildHlRepFortress (windlass well)', w: 2.4, d: 2.0, h: 3.13, variants: 2,
  variantNames: ['Octagonal well under a gable', 'Windlass well'],
  variantDims: [{ w: 2.4, d: 2.0, h: 3.13 }, { w: 2.6, d: 2.2, h: 2.94 }],
  build: function (F) {
    const ash = F.col('stoneAshlar'), water = F.col('waterDark');
    if (F.variant === 1) {
      F.cyl(0, 0, 0, 1.1, 0.9, 0, ash, 'stone'); F.cyl(0, 0.9, 0, 0.95, 0.02, 0, water, 'glass');
      const red = F.col('timberRedwood');
      for (const s of [-1, 1]) F.cyl(s * 1.05, 0.9, 0, 0.08, 1.9, 0, red, 'wood');
      F.box(0, 2.8, 0, 2.6, 0.14, 0.14, 0, red, 'wood');
      F.rod(0, 2.8, 0, 0, 1.3, 0, 0.015, F.col('clothSacking'), 'rope');
      HLREP.barrel(F, 0, 1.0, 0, 0.18, 0.3, F.col('timberOak'), F.col('ironSoot'));
      return;
    }
    F.frustum(0, 0, 0, 1, 1, 0.8, 0, ash, 'stone', 8);
    F.cyl(0, 0.79, 0, 0.85, 0.02, 0, water, 'glass');
    const tar = F.col('timberTar');
    for (const s of [-1, 1]) F.cyl(s * 0.8, 0.8, 0, 0.07, 1.6, 0, tar, 'wood');
    HLREP.gable(F, 0, 2.4, 0, 2.4, 2.0, 0.7, F.col('stoneSlate'), 'stone');
  }
});
FURN({
  key: 'hl_rep_sweep_well', name: 'Crane well (zhuravl)', culture: 'republican', tier: 'common', type: 'well', setting: 'outdoor',
  rooms: ['yard', 'garden', 'street'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'timber', 'rope', 'metal'],
  source: 'settlements/highlands/src/79-rep-land.js hnRCSweepWell', w: 7.25, d: 1.6, h: 5.65, variants: 1,
  build: function (F) {
    const c = F.col('timberAged'), rub = F.col('stoneRubble');
    F.shift(-2.825, 0);
    F.frustum(0, 0, 0, 0.8, 0.8, 0.8, 0, rub, 'stone', 8);
    F.box(0, 0.8, 0, 1.0, 0.03, 1.0, 0, F.col('waterDark'), 'stone');
    F.frustum(2.4, 0, 0, 0.16, 0.136, 3.6, 0, c, 'wood', 8);
    F.beam(-0.2, 5.6, 0, 6.2, 1.6, 0, 0.1, 0.1, c, 'wood');
    F.box(6.2, 1.2, 0, 0.5, 0.5, 0.5, 0, rub, 'stone');
    F.rod(-0.2, 5.6, 0, 0, 1.4, 0, 0.015, F.col('clothSacking'), 'rope');
    HLREP.barrel(F, 0, 1.0, 0, 0.2, 0.4, c, F.col('ironSoot'));
  }
});
FURN({
  key: 'hl_rep_log_trough', name: 'Log watering trough', culture: 'republican', tier: 'poor', type: 'vessel', setting: 'outdoor',
  rooms: ['stable', 'yard', 'garden'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'glass', 'stone'],
  source: 'settlements/highlands/src/79-rep-land.js hnRCTrough', w: 3.0, d: 0.8, h: 0.62, variants: 2,
  variantNames: ['2.4 m', '3 m'],
  variantDims: [{ w: 2.4, d: 0.8, h: 0.62 }, { w: 3.0, d: 0.8, h: 0.62 }],
  build: function (F) {
    const L = F.variant === 1 ? 3 : 2.4;
    F.box(0, 0.18, 0, L, 0.42, 0.62, 0, F.col('timberAged'), 'wood');
    F.box(0, 0.5, 0, L - 0.2, 0.12, 0.42, 0, F.col('waterPond'), 'glass');
    for (const s of [-1, 1]) F.box(s * (L / 2 - 0.3), 0, 0, 0.3, 0.2, 0.8, 0, F.col('stoneRubble'), 'stone');
  }
});
FURN({
  key: 'hl_rep_weapon_rack', name: 'Spear and shield rack', culture: 'republican', tier: 'court', type: 'weapon', setting: 'both',
  rooms: ['barracks', 'court', 'yard', 'smithy', 'shop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/76-rep-civic.js hnRBRack', w: 2.52, d: 0.5, h: 2.7, variants: 2,
  variantNames: ['2.4 m', '3.4 m'],
  variantDims: [{ w: 2.52, d: 0.5, h: 2.7 }, { w: 3.52, d: 0.5, h: 2.7 }],
  build: function (F) {
    const L = F.variant === 1 ? 3.4 : 2.4, c = F.col('timberRack'), I = F.col('ironSoot');
    F.shift(0, -0.155);
    for (const s of [-1, 1]) F.cyl(s * L / 2, 0, 0, 0.06, 1.6, 0, c, 'wood');
    for (const y of [1.5, 0.3]) F.beam(-L / 2, y, 0, L / 2, y, 0, 0.08, 0.08, c, 'wood');
    for (let i = 0; i < Math.round(L / 0.3); i++) {
      const x = -L / 2 + 0.2 + i * 0.3;
      if (x > L / 2 - 0.1) break;
      F.rod(x, 0, 0.25, x, 2.44, -0.05, 0.02, c, 'wood');
      F.rod(x, 2.44, -0.05, x, 2.68, -0.08, 0.03, I, 'metal');
    }
    for (let i = 0; i < Math.floor(L / 1.2); i++) {
      const x = -L / 2 + 0.7 + i * 1.2;
      F.rod(x, 0.745, 0.2755, x, 0.755, 0.3245, 0.36, F.pick(['paintRed', 'paintTeal', 'paintBlack']), 'wood');
      F.rod(x, 0.75, 0.32, x, 0.752, 0.345, 0.07, I, 'metal');                 /* the boss */
    }
  }
});
FURN({
  key: 'hl_rep_training_butt', name: 'Training butt', culture: 'republican', tier: 'court', type: 'weapon', setting: 'outdoor',
  rooms: ['barracks', 'yard', 'court'], anchor: 'floor', clearance: { front: 2.0 },
  materials: ['thatch', 'timber'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepMustering (shooting butts, hnRBTarget); 77-rep-guild.js buildHlRepGuildMerc (pells)', w: 1.5, d: 0.7, h: 1.6, variants: 2,
  variantNames: ['Straw butt with a target', 'Sparring pell'],
  variantDims: [{ w: 1.5, d: 0.7, h: 1.6 }, { w: 0.4, d: 0.4, h: 1.9 }],
  build: function (F) {
    if (F.variant === 1) { F.frustum(0, 0, 0, 0.2, 0.17, 1.9, 0, F.col('timberPell'), 'wood', 8); return; }
    F.shift(0, -0.05);
    F.box(0, 0, 0, 1.5, 1.5, 0.6, 0, F.col('thatchHay'), 'thatch');
    ['paintWhite', 'paintRed', 'paintWhite', 'paintBlack'].forEach((k, i) => {
      const z = 0.3 + 0.02 + i * 0.02; F.rod(0, 1.05, z - 0.02, 0, 1.05, z + 0.02, 0.55 * (1 - i * 0.24), F.col(k), 'wood');
    });
  }
});
FURN({
  key: 'hl_rep_stocks', name: 'Stocks', culture: 'republican', tier: 'court', type: 'pen', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'court', 'street'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepWatch (the stocks)', w: 2.2, d: 0.2, h: 1.2, variants: 1,
  build: function (F) {
    const oak = F.col('timberOak');
    for (const s of [-1, 1]) F.cyl(s * 0.9, 0, 0, 0.09, 1.2, 0, oak, 'wood');
    F.box(0, 0.7, 0, 2.2, 0.35, 0.18, 0, F.shade(oak, 0.06), 'wood');
    F.box(0, 0.87, 0, 2.2, 0.01, 0.185, 0, F.shade(oak, -0.3), 'wood');
    for (const x of [-0.45, 0, 0.45]) F.box(x, 0.82, 0.092, x ? 0.1 : 0.16, 0.1, 0.006, 0, F.col('paintBlack'), 'wood');
  }
});
FURN({
  key: 'hl_rep_notice_board', name: 'Roofed notice board', culture: 'republican', tier: 'court', type: 'board', setting: 'both',
  rooms: ['street', 'plaza', 'yard', 'court', 'hall'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'stone', 'cloth'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepWatch (notice board)', w: 1.8, d: 0.7, h: 2.4, variants: 1,
  build: function (F) {
    const oak = F.col('timberOak');
    for (const s of [-1, 1]) F.cyl(s * 0.7, 0, 0, 0.07, 2.1, 0, oak, 'wood');
    F.box(0, 1.1, 0, 1.6, 1.0, 0.08, 0, F.shade(oak, 0.1), 'wood');
    F.hipRoof(0, 2.1, 0, 1.8, 0.3, 0.7, 0, F.col('stoneSlate'), 'stone');
    F.box(-0.2, 1.3, 0.045, 0.5, 0.6, 0.01, 0, F.col('paintWhite'), 'cloth');
    F.box(0.3, 1.25, 0.045, 0.4, 0.5, 0.01, 0.06, F.col('paperCream'), 'cloth');
  }
});
FURN({
  key: 'hl_rep_slate_board', name: 'Schoolyard slate board', culture: 'republican', tier: 'court', type: 'board', setting: 'both',
  rooms: ['school', 'yard', 'study'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['timber'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepSchool (slate board)', w: 1.26, d: 0.38, h: 1.66, variants: 1,
  build: function (F) {
    const oak = F.col('timberOak');
    for (const s of [-1, 1]) F.beam(s * 0.5, 0, 0.16, s * 0.5, 1.65, -0.16, 0.06, 0.06, oak, 'wood');
    F.beam(0, 0.8, 0.07, 0, 1.6, -0.08, 1.2, 0.04, F.col('slateBoard'), 'wood');
    F.box(0, 0.76, 0.08, 1.2, 0.04, 0.08, 0, oak, 'wood');
  }
});
FURN({
  key: 'hl_rep_swing', name: 'Schoolyard swing and seesaw', culture: 'republican', tier: 'court', type: 'seating', setting: 'outdoor',
  rooms: ['yard', 'garden', 'school'], anchor: 'floor', clearance: { front: 1.2, back: 1.2 },
  materials: ['timber', 'rope'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepSchool (swing, seesaw)', w: 2.75, d: 0.35, h: 2.47, variants: 2,
  variantNames: ['Swing', 'Seesaw'],
  variantDims: [{ w: 2.75, d: 0.35, h: 2.47 }, { w: 4.0, d: 0.35, h: 1.03 }],
  build: function (F) {
    const oak = F.col('timberOak');
    if (F.variant === 1) {
      F.cyl(0, 0, 0, 0.12, 0.5, 0, oak, 'wood');
      F.beam(-1.97, 0.26, 0, 1.97, 0.98, 0, 0.08, 0.35, F.shade(oak, 0.08), 'wood');
      return;
    }
    for (const s of [-1, 1]) F.beam(s * 1.32, 0, 0, s * 0.9, 2.36, 0, 0.1, 0.1, oak, 'wood');
    F.box(0, 2.35, 0, 2.6, 0.12, 0.12, 0, oak, 'wood');
    for (const s of [-1, 1]) F.rod(s * 0.25, 2.35, 0, s * 0.25, 0.55, 0, 0.02, F.col('clothSacking'), 'rope');
    F.box(0, 0.5, 0, 0.7, 0.06, 0.3, 0, F.shade(oak, 0.1), 'wood');
  }
});
FURN({
  key: 'hl_rep_door_bench', name: 'Plank bench by the door', culture: 'republican', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['street', 'yard', 'tavern', 'hall', 'school', 'garden'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  source: 'settlements/highlands/src/74-rep-dwell.js buildHlRepPoorC; 75-rep-trade.js buildHlRepInn; 76-rep-civic.js buildHlRepSchool, buildHlRepHospital (yard benches)', w: 1.8, d: 0.4, h: 0.45, variants: 3,
  variantNames: ['Cottage step (1.4 m)', 'Inn front (1.8 m)', 'Schoolyard (2.2 m)'],
  variantDims: [{ w: 1.4, d: 0.36, h: 0.42 }, { w: 1.8, d: 0.4, h: 0.45 }, { w: 2.2, d: 0.4, h: 0.45 }],
  build: function (F) {
    const dm = [[1.4, 0.42, 0.36, 'timberAged'], [1.8, 0.45, 0.4, 'timberPine'], [2.2, 0.45, 0.4, 'timberOak']][F.variant] || [1.8, 0.45, 0.4, 'timberPine'];
    const c = F.col(dm[3]);
    F.box(0, 0, 0, dm[0] - 0.06, dm[1] - 0.06, dm[2] - 0.06, 0, F.shade(c, -0.12), 'wood');
    F.box(0, dm[1] - 0.06, 0, dm[0], 0.06, dm[2], 0, c, 'wood');
  }
});
FURN({
  key: 'hl_rep_fountain', name: 'Town square fountain', culture: 'republican', tier: 'court', type: 'fountain', setting: 'outdoor',
  rooms: ['plaza', 'court', 'garden'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['stone', 'glass', 'gold'],
  source: 'settlements/highlands/src/76-rep-civic.js buildHlRepTownHall (the square fountain)', w: 4.0, d: 4.0, h: 2.4, variants: 1,
  build: function (F) {
    const ash = F.col('stoneAshlar');
    F.frustum(0, 0, 0, 2, 2, 0.7, 0, ash, 'stone', 8);
    F.cyl(0, 0.66, 0, 1.75, 0.06, 0, F.col('waterFountain'), 'glass');
    F.frustum(0, 0.7, 0, 0.35, 0.35, 1.2, 0, F.shade(ash, -0.05), 'stone', 8);
    F.ball(0, 2.1, 0, 0.3, F.col('gilt'), 'gold');
  }
});
FURN({
  key: 'hl_rep_lamp_standard', name: 'Republic lamp standard', culture: 'republican', tier: 'court', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'plaza', 'yard', 'court', 'garden'], anchor: 'floor', clearance: {},
  materials: ['metal', 'emissive'],
  source: 'settlements/highlands/src/76-rep-civic.js hnRBLamps (vnLampPost, electric: civic and rich only)', w: 0.5, d: 0.5, h: 3.48, variants: 2,
  variantNames: ['Square lamp (3.4 m)', 'Gate lamp (4.2 m)'],
  variantDims: [{ w: 0.5, d: 0.5, h: 3.48 }, { w: 0.5, d: 0.5, h: 4.28 }],
  build: function (F) {
    const h = F.variant === 1 ? 4.2 : 3.4, I = F.col('ironSoot');
    F.cyl(0, 0, 0, 0.07, h, 0, I, 'metal');
    F.cyl(0, 0, 0, 0.12, 0.25, 0, I, 'metal');
    F.box(0, h, 0, 0.5, 0.08, 0.5, 0, I, 'metal');
    F.ball(0, h - 0.16, 0, 0.13, F.col('electric'), 'glow');
    F.lamp(0, h - 0.2, 0, 1.0, 10);
  }
});
FURN({
  key: 'hl_rep_rocket_rack', name: 'Rocket rack', culture: 'republican', tier: 'court', type: 'weapon', setting: 'outdoor',
  rooms: ['yard', 'court', 'barracks', 'store'], anchor: 'floor', clearance: { front: 1.0, back: 1.0 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/76c-rep-capital.js buildHlRepArsenal (rocket racks on trestles)', w: 13.1, d: 1.4, h: 1.63, variants: 1,
  build: function (F) {
    F.shift(-0.25, 0);
    for (const s of [-1, 1]) F.box(s * 4, 0, 0, 0.3, 1.1, 1.4, 0, F.col('timberAged'), 'wood');
    for (let k = 0; k < 4; k++) {
      const x = -5 + k * 3.3;
      F.rod(x - 1.3, 1.35, 0, x + 1.3, 1.35, 0, 0.28, F.pick(['steelOlive', 'rustRed']), 'metal');
      F.rod(x + 1.3, 1.35, 0, x + 1.6, 1.35, 0, 0.2, F.col('paintRed'), 'metal');
      F.rod(x + 1.6, 1.35, 0, x + 1.88, 1.35, 0, 0.09, F.col('paintRed'), 'metal');
    }
  }
});
FURN({
  key: 'hl_rep_carboys', name: 'Carboys in crates', culture: 'republican', tier: 'court', type: 'vessel', setting: 'both',
  rooms: ['workshop', 'store', 'study'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'glass'],
  source: 'settlements/highlands/src/77-rep-guild.js buildHlRepGuildAlch (the acid shed carboys)', w: 1.3, d: 2.4, h: 1.06, variants: 2,
  variantNames: ['Six carboys', 'Two carboys'],
  variantDims: [{ w: 1.3, d: 2.4, h: 1.06 }, { w: 1.3, d: 0.6, h: 1.06 }],
  build: function (F) {
    const n = F.variant === 1 ? 2 : 6, tar = F.col('timberTar');
    for (let i = 0; i < n; i++) {
      const x = -0.35 + (i % 2) * 0.7, z = n === 2 ? 0 : -0.9 + Math.floor(i / 2) * 0.9, g = F.pick(['glassGreen', 'glassOlive', 'glassBlue']);
      F.box(x, 0, z, 0.6, 0.3, 0.6, 0, tar, 'wood');
      F.blob(x, 0.62, z, 0.28, 0.68, 0, g, 'glass');
      F.cyl(x, 0.94, z, 0.06, 0.12, 0, F.shade(g, -0.2), 'glass');
    }
  }
});
FURN({
  key: 'hl_rep_produce_counter', name: 'Farmers\' produce counter', culture: 'republican', tier: 'court', type: 'counter', setting: 'both',
  rooms: ['market', 'shop', 'store'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'foliage'],
  source: 'settlements/highlands/src/77-rep-guild.js buildHlRepGuildFarm (market porch counters)', w: 2.2, d: 0.9, h: 1.11, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 2.2, 0.85, 0.9, 0, F.col('timberTar'), 'wood');
    for (let k = 0; k < 9; k++) F.ball(F.rr(-0.9, 0.9), 0.95, F.rr(-0.3, 0.3), F.rr(0.1, 0.16), F.pick(['produceRed', 'produceOrange', 'produceGreen', 'produceYellow', 'producePlum']), 'plant');
  }
});
FURN({
  key: 'hl_rep_giant_anvil', name: 'Great anvil of the Smiths', culture: 'republican', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['plaza', 'court', 'yard'], anchor: 'floor', clearance: {},
  materials: ['stone', 'metal', 'gold', 'timber'],
  source: 'settlements/highlands/src/77-rep-guild.js buildHlRepGuildSmith (the giant anvil and hammer)', w: 7.5, d: 2.7, h: 4.47, variants: 1,
  build: function (F) {
    const iron = F.col('ironSoot'), gold = F.col('gilt'), K = 1.05, ax = 0.3;
    F.box(0, 0, 0, 7.4, 0.7, 2.6, 0, F.col('stoneRubble'), 'stone');
    F.box(0, 0.7, 0, 7.5, 0.1, 2.7, 0, F.col('stoneAshlar'), 'stone');
    const P = (x, y, w, h, d, g) => F.box(ax + x * K, 0.8 + y * K, 0, w * K, h * K, d * K, 0, g ? gold : iron, g ? 'gold' : 'metal');
    P(0, 0, 1.9, 0.6, 1.5); P(0, 0.6, 1, 0.9, 0.9); P(-0.15, 1.5, 3, 0.62, 1.3); P(-0.15, 2.12, 3, 0.06, 1.3, 1); P(-1.85, 1.65, 0.4, 0.47, 0.9);
    const hy = 0.8 + 1.82 * K;                                                    /* the horn */
    F.rod(ax + 1.35 * K, hy, 0, ax + 2.0 * K, hy, 0, 0.42 * K, iron, 'metal');
    F.rod(ax + 2.0 * K, hy, 0, ax + 2.6 * K, hy, 0, 0.18 * K, iron, 'metal');
    const hx = ax - 2.9;                                                          /* the hammer, head down */
    F.box(hx, 0.8, 0, 1.1, 0.8, 0.8, 0, iron, 'metal');
    F.box(hx, 1.6, 0, 1.14, 0.07, 0.84, 0, gold, 'gold');
    F.cyl(hx, 1.67, 0, 0.13, 2.6, 0, F.col('timberTar'), 'wood');
    F.ball(hx, 4.3, 0, 0.17, gold, 'gold');
  }
});
FURN({
  key: 'hl_rep_sundial', name: 'Astronomers\' court instrument', culture: 'republican', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['garden', 'court', 'plaza', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'bronze', 'gold'],
  source: 'settlements/highlands/src/77b-rep-guild2.js buildHlRepGuildAstro (sundial, armillary sphere)', w: 1.5, d: 1.5, h: 1.45, variants: 2,
  variantNames: ['Sundial', 'Armillary sphere'],
  variantDims: [{ w: 1.5, d: 1.5, h: 1.45 }, { w: 1.44, d: 1.44, h: 2.62 }],
  build: function (F) {
    const ash = F.col('stoneAshlar'), brass = F.col('brass');
    if (F.variant === 1) {
      F.frustum(0, 0, 0, 0.5, 0.5, 1.1, 0, ash, 'stone', 8);
      F.cyl(0, 1.1, 0, 0.03, 0.8, 0, F.col('bronzeDark'), 'bronze');
      F.ball(0, 1.9, 0, 0.1, F.col('gilt'), 'gold');
      const c = [0, 1.9, 0];
      for (const [u, v] of [[[1, 0, 0], [0, 1, 0]], [[1, 0, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0]], [[0.921, 0.358, 0.151], [-0.389, 0.848, 0.358]]]) HLREP.ring(F, c, u, v, 0.7, 0.018, brass, 'bronze', 20);
      return;
    }
    F.frustum(0, 0, 0, 0.7, 0.7, 0.9, 0, ash, 'stone', 8);
    F.cyl(0, 0.9, 0, 0.75, 0.06, 0, brass, 'bronze');
    F.rod(0, 0.95, 0.1, 0, 1.44, -0.4, 0.03, F.col('bronzeDark'), 'bronze');
  }
});
FURN({
  key: 'hl_rep_cistern', name: 'Salvaged water cistern', culture: 'republican', tier: 'poor', type: 'well', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden'], anchor: 'floor', clearance: {},
  materials: ['rustSteel', 'timber', 'metal'],
  source: 'settlements/highlands/src/79b-rep-salvage.js buildHlRepTankHouse (cistern on legs); 79c-rep-apoc.js buildHlRepGarage (water tank on its stand)', w: 1.8, d: 1.8, h: 5.04, variants: 2,
  variantNames: ['Cistern on pipe legs', 'Water tower'],
  variantDims: [{ w: 1.8, d: 1.8, h: 5.04 }, { w: 2.08, d: 2.08, h: 10.42 }],
  build: function (F) {
    const rust = F.col('rustSalvage'), I = F.col('ironSoot');
    if (F.variant === 1) {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.beam(sx * 1, 0, sz * 1, sx * 0.8, 8.2, sz * 0.8, 0.08, 0.08, I, 'metal');
      for (const y of [2.7, 5.4]) for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) { const k = 1 - 0.2 * y / 8.2; F.beam(a[0] * k, y, a[1] * k, b[0] * k, y, b[1] * k, 0.05, 0.05, I, 'metal'); }
      F.box(0, 8.2, 0, 2, 0.12, 2, 0, I, 'metal');
      F.cyl(0, 8.32, 0, 0.85, 1.8, 0, rust, 'rust');
      F.dome(0, 10.12, 0, 0.85, 0.3, 0, F.shade(rust, -0.1), 'rust');
      return;
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.7, 0, sz * 0.7, 0.06, 3.4, 0, rust, 'rust');
    F.box(0, 3.4, 0, 1.8, 0.14, 1.8, 0, F.col('timberAged'), 'wood');
    F.cyl(0, 3.54, 0, 0.8, 1.5, 0, rust, 'rust');
  }
});
FURN({
  key: 'hl_rep_tool_chest', name: 'Painted tool chest', culture: 'republican', tier: 'poor', type: 'storage', role: 'chest', setting: 'both',
  rooms: ['workshop', 'smithy', 'store', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/79c-rep-apoc.js buildHlRepGarage (the tool chest)', w: 0.62, d: 0.92, h: 1.0, variants: 1,
  build: function (F) {
    const red = F.col('paintRed'), I = F.col('ironSoot');
    F.box(0, 0, 0, 0.6, 1.0, 0.9, 0, red, 'wood');
    F.box(0, 0.88, 0, 0.62, 0.03, 0.92, 0, I, 'metal');
    F.box(0, 0.74, 0.455, 0.08, 0.14, 0.01, 0, I, 'metal');
    for (const s of [-1, 1]) F.box(s * 0.305, 0.5, 0, 0.01, 0.05, 0.3, 0, I, 'metal');
  }
});
FURN({
  key: 'hl_rep_pot_shelves', name: 'Lantern-stall pot shelves', culture: 'republican', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['shop', 'store', 'kitchen', 'market'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'ceramic'],
  source: 'settlements/highlands/src/79c-rep-apoc.js buildHlRepLanternStall (shelves of pots and jars)', w: 6.48, d: 0.5, h: 2.5, variants: 2,
  variantNames: ['Whole stall (6.4 m)', 'One bay (3.2 m)'],
  variantDims: [{ w: 6.48, d: 0.5, h: 2.5 }, { w: 3.28, d: 0.5, h: 2.5 }],
  build: function (F) {
    const W = F.variant === 1 ? 3.2 : 6.4, n = F.variant === 1 ? 4 : 9, log = F.col('timberAged');
    for (const s of [-1, 1]) F.box(s * W / 2, 0, 0, 0.08, 2.3, 0.5, 0, F.shade(log, -0.12), 'wood');
    for (let s = 0; s < 3; s++) {
      const y = 0.6 + s * 0.8;
      F.box(0, y, 0, W, 0.06, 0.5, 0, log, 'wood');
      for (let k = 0; k < n; k++) {
        const x = -W / 2 + 0.35 + k * (W - 0.7) / (n - 1), c = F.pick(['clayRed', 'clayCream', 'clayGreen', 'paintRed', 'paintWhite']), t = F.rnd();
        if (t < 0.4) F.frustum(x, y + 0.06, 0, 0.16, 0.13, 0.24, 0, c, 'ceramic', 10);
        else if (t < 0.75) F.blob(x, y + 0.18, 0, 0.16, 0.24, 0, c, 'ceramic');
        else F.frustum(x, y + 0.06, 0, 0.144, 0.16, 0.24, 0, c, 'ceramic', 10);
      }
    }
  }
});
FURN({
  key: 'hl_rep_paper_lantern', name: 'Paper lanterns', culture: 'republican', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['market', 'shop', 'tavern', 'street', 'yard', 'garden'], anchor: 'ceiling', clearance: {},
  materials: ['cloth', 'metal'],
  source: 'settlements/highlands/src/79c-rep-apoc.js hnLantern (the lantern stall, container shops, wreck market)', w: 0.4, d: 0.4, h: 0.75, variants: 2,
  variantNames: ['One lantern', 'A string of five'],
  variantDims: [{ w: 0.4, d: 0.4, h: 0.75 }, { w: 4.4, d: 0.4, h: 0.76 }],
  build: function (F) {
    const one = (x) => {
      F.cyl(x, 0.45, 0, 0.01, 0.3, 0, F.col('ironSoot'), 'metal');
      if (F.variant === 0) F.box(x, 0.73, 0, 0.12, 0.02, 0.12, 0, F.col('ironSoot'), 'metal');   /* the ceiling hook plate */
      F.blob(x, 0.27, 0, 0.2, 0.54, 0, F.pick(['paperRed', 'paperVermilion', 'paperAmber']), 'cloth');
      F.lamp(x, 0.27, 0, 0.4, 4);
    };
    if (F.variant === 1) { F.rod(-2.2, 0.745, 0, 2.2, 0.745, 0, 0.012, F.col('ironSoot'), 'metal'); for (let k = 0; k < 5; k++) one(-2 + k); return; }
    one(0);
  }
});
FURN({
  key: 'hl_rep_market_stall', name: 'Striped market stall', culture: 'republican', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth', 'ceramic'],
  source: 'settlements/highlands/src/79d-rep-scrap2.js hnStall', w: 2.7, d: 2.2, h: 2.66, variants: 1,
  build: function (F) {
    const post = F.col('timberStump'), w = 2.4, d = 1.8;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08), 0.05, 2.2 + (sz < 0 ? 0.33 : 0), 0, post, 'wood');
    F.beam(0, 2.625, -1.09, 0, 2.275, 1.09, w + 0.3, 0.04, F.pick(['awningRed', 'awningTeal', 'awningSaffron', 'paintBlue', 'awningGreen']), 'cloth');
    F.box(0, 0.75, 0.45, w - 0.3, 0.08, 0.7, 0, F.col('timberOak'), 'wood');
    for (const s of [-1, 1]) F.box(s * (w / 2 - 0.4), 0, 0.45, 0.08, 0.75, 0.6, 0, post, 'wood');
    for (let k = 0; k < 5; k++) {
      const x = F.rr(-w / 2 + 0.4, w / 2 - 0.4), z = 0.45 + F.rr(-0.2, 0.2), r = F.rr(0.12, 0.2), h = F.rr(0.16, 0.3), t = F.rnd();
      const c = F.pick(['clayRed', 'clayCream', 'clayGreen', 'paintRed', 'paintWhite', 'mugBrown']);
      if (t < 0.5) F.frustum(x, 0.83, z, r, r * 0.85, h, 0, c, 'ceramic', 10);
      else F.blob(x, 0.83 + h / 2, z, r, h, 0, c, 'ceramic');
    }
  }
});
FURN({
  key: 'hl_rep_scrap_bin', name: 'Scrap bin', culture: 'republican', tier: 'poor', type: 'debris', setting: 'outdoor',
  rooms: ['yard', 'workshop', 'smithy'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rustSteel'],
  source: 'settlements/highlands/src/79d-rep-scrap2.js buildHlRepSmelter (the scrap bins)', w: 2.0, d: 2.0, h: 1.6, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    F.box(0, 0, 0, 2, 1, 2, 0, aged, 'wood');
    for (const s of [-1, 1]) F.box(0, 0.45, s * 1.0, 2.02, 0.08, 0.02, 0, F.shade(aged, -0.15), 'wood');
    F.cone(0, 1, 0, 0.9, 0.6, 0, F.col('scrapEarth'), 'rust');
  }
});
FURN({
  key: 'hl_rep_plate_stack', name: 'Stack of salvaged plate', culture: 'republican', tier: 'poor', type: 'stack', setting: 'both',
  rooms: ['yard', 'store', 'workshop', 'dock'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['rustSteel', 'metal'],
  source: 'settlements/highlands/src/79d-rep-scrap2.js buildHlRepPressWorks (plate stacks); 77b-rep-guild2.js buildHlRepGuildScav (Ancient panels); 79f-rep-shipbreak.js (hull plates)', w: 3.6, d: 2.35, h: 0.4, variants: 3,
  variantNames: ['Rusted plate', 'White Ancient panels', 'Hull plates'],
  variantDims: [{ w: 3.6, d: 2.35, h: 0.4 }, { w: 2.65, d: 2.55, h: 0.86 }, { w: 4.85, d: 3.5, h: 1.99 }],
  build: function (F) {
    if (F.variant === 1) { for (let k = 0; k < 8; k++) F.box(-0.49 + k * 0.14, 0.04 + k * 0.1, 0, 1.4, 0.08, 2.4, F.rr(-0.1, 0.1), F.shade('alloyWhite', F.rr(-0.08, 0.02)), 'metal'); return; }
    if (F.variant === 2) { const n = 5 + Math.floor(F.rnd() * 3); for (let i = 0; i < n; i++) F.box(F.rr(-0.2, 0.2), 0.05 + i * 0.28, F.rr(-0.2, 0.2), 4.2, 0.26, 2.8, F.rr(-0.08, 0.08), F.shade('steelSalvage', F.rr(-0.25, -0.05)), 'metal'); return; }
    for (let j = 0; j < 5; j++) F.box(0, 0.08 + j * 0.06, 0, 3.4, 0.03, 2, F.rr(-0.1, 0.1), F.shade('rustSalvage', F.rr(-0.1, 0.08)), 'rust');
  }
});
FURN({
  key: 'hl_rep_winch', name: 'Hand winch', culture: 'republican', tier: 'poor', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'workshop', 'dock'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepQuarry (the derrick winch); 79f-rep-shipbreak.js (the tank-drum winch)', w: 1.6, d: 1.0, h: 1.4, variants: 2,
  variantNames: ['Quarry winch', 'Tank-drum winch'],
  variantDims: [{ w: 1.6, d: 1.0, h: 1.4 }, { w: 3.0, d: 2.0, h: 1.8 }],
  build: function (F) {
    const aged = F.col('timberAged'), I = F.col('ironSoot');
    if (F.variant === 1) { F.box(0, 0, 0, 3, 0.4, 2, 0, aged, 'wood'); F.rod(0, 1.1, -0.9, 0, 1.1, 0.9, 0.7, I, 'metal'); return; }
    F.box(0, 0, 0, 1.6, 1.0, 1.0, 0, aged, 'wood');
    F.rod(-0.6, 1.1, 0, 0.6, 1.1, 0, 0.3, I, 'metal');
    for (const s of [-1, 1]) F.box(s * 0.75, 0.9, 0.45, 0.06, 0.5, 0.06, 0, I, 'metal');
  }
});
FURN({
  key: 'hl_rep_rail_tub', name: 'Rail tub', culture: 'republican', tier: 'poor', type: 'debris', setting: 'outdoor',
  rooms: ['yard', 'workshop', 'smithy', 'store'], anchor: 'floor', clearance: {},
  materials: ['rustSteel', 'metal', 'stone', 'timber'],
  source: 'settlements/highlands/src/78-rep-grand.js hnRCTub (ore and coal tubs); 79b-rep-salvage.js buildHlRepPowderWorks (the powder cart)', w: 1.12, d: 1.5, h: 1.65, variants: 2,
  variantNames: ['Coal tub', 'Powder cart'],
  variantDims: [{ w: 1.12, d: 1.5, h: 1.65 }, { w: 1.8, d: 1.22, h: 1.65 }],
  build: function (F) {
    const I = F.col('ironSoot');
    if (F.variant === 1) {
      const log = F.col('timberPine');
      F.box(0, 0.45, 0, 1.8, 0.7, 1.2, 0, log, 'wood');
      for (const u of [-0.6, 0.6]) for (const s of [-1, 1]) HLREP.wheel(F, u, 0.35, s * 0.55, 0.28, false, 0.1, I, I, 4);
      for (let k = 0; k < 3; k++) HLREP.barrel(F, -0.5 + k * 0.5, 1.15, 0, 0.22, 0.5, F.col('scrapEarth'), I);
      return;
    }
    F.box(0, 0.45, 0, 1.0, 0.8, 1.5, 0, F.col('rustSalvage'), 'rust');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) HLREP.wheel(F, sx * 0.5, 0.3, sz * 0.45, 0.24, true, 0.1, I, I, 4);
    F.cone(0, 1.2, 0, 0.6, 0.45, 0, F.col('coal'), 'stone');
  }
});
FURN({
  key: 'hl_rep_scarecrow', name: 'Scarecrow', culture: 'republican', tier: 'poor', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'thatch'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepFarm (scarecrow)', w: 1.6, d: 0.72, h: 2.65, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    F.cyl(0, 0, 0, 0.06, 2.2, 0, aged, 'wood');
    F.box(0, 1.6, 0, 1.6, 0.08, 0.08, 0, aged, 'wood');
    F.box(0, 0.75, 0.05, 0.9, 0.9, 0.02, 0, F.col('paintRed'), 'cloth');
    F.ball(0, 2.25, 0, 0.18, F.col('clothBurlap'), 'cloth');
    F.cone(0, 2.35, 0, 0.36, 0.3, 0, F.col('thatchStraw'), 'thatch');
  }
});
FURN({
  key: 'hl_rep_plough', name: 'Plough', culture: 'republican', tier: 'poor', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'garden', 'store', 'workshop'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepFarm (the plough)', w: 1.1, d: 3.0, h: 1.03, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    F.shift(0, 0.54);
    F.beam(0, 0.8, 0.9, 0, 0.3, -0.6, 0.1, 0.1, aged, 'wood');
    F.box(0, 0, -0.9, 0.3, 0.3, 0.9, 0, F.col('ironSoot'), 'metal');
    for (const s of [-1, 1]) F.beam(0, 0.3, -0.6, s * 0.5, 1.0, -2.0, 0.06, 0.06, aged, 'wood');
  }
});
FURN({
  key: 'hl_rep_millstones', name: 'Spare millstones', culture: 'republican', tier: 'common', type: 'stack', setting: 'both',
  rooms: ['workshop', 'yard', 'store'], anchor: 'wall', clearance: {},
  materials: ['stone'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepWatermill (millstones against the wall)', w: 1.5, d: 0.82, h: 1.51, variants: 1,
  build: function (F) {
    const c = F.col('stoneMill'), ny = Math.sin(0.12) * 0.12, nz = Math.cos(0.12) * 0.12;
    for (const z of [-0.2, 0.2]) {
      F.rod(0, 0.75 - ny, z - nz, 0, 0.75 + ny, z + nz, 0.75, F.shade(c, F.rr(-0.06, 0.04)), 'stone');
      F.rod(0, 0.75 - ny * 1.1, z - nz * 1.1, 0, 0.75 + ny * 1.1, z + nz * 1.1, 0.1, F.shade(c, -0.4), 'stone');
    }
  }
});
FURN({
  key: 'hl_rep_stone_blocks', name: 'Cut stone blocks', culture: 'republican', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['stone', 'timber'],
  source: 'settlements/highlands/src/79-rep-land.js buildHlRepQuarry (stacked cut blocks, the stone sledge)', w: 5.0, d: 2.1, h: 2.42, variants: 2,
  variantNames: ['Stacked blocks', 'Block on a sledge'],
  variantDims: [{ w: 5.0, d: 2.1, h: 2.42 }, { w: 1.4, d: 2.6, h: 1.0 }],
  build: function (F) {
    const stone = F.col('stoneAshlar');
    if (F.variant === 1) { F.box(0, 0, 0, 1.4, 0.3, 2.6, 0, F.col('timberAged'), 'wood'); F.box(0, 0.3, 0, 1.1, 0.7, 1.5, 0, stone, 'stone'); return; }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) for (let k = 0; k < 2; k++) F.box(-1.7 + j * 1.7 + i * 0.85, i * 0.82, -0.55 + k * 1.1, 1.6, 0.8, 1.0, 0, F.shade(stone, F.rr(-0.05, 0.05)), 'stone');
  }
});
FURN({
  key: 'hl_rep_engine_bell', name: 'Salvaged engine bell', culture: 'republican', tier: 'poor', type: 'debris', setting: 'outdoor',
  rooms: ['yard', 'dock'], anchor: 'floor', clearance: {},
  materials: ['rustSteel', 'timber'],
  source: 'settlements/highlands/src/79b-rep-salvage.js buildHlRepHullYard (the engine bell)', w: 4.4, d: 3.8, h: 3.8, variants: 1,
  build: function (F) {
    const rust = F.col('rustSalvage'), seg = [[2.2, 1.9], [1.5, 1.55], [0.8, 1.2], [0.1, 0.9], [-0.6, 0.65], [-1.2, 0.5]];
    for (let i = 0; i < seg.length - 1; i++) F.rod(seg[i + 1][0], 1.9, 0, seg[i][0], 1.9, 0, seg[i][1], F.shade(rust, -i * 0.04), 'rust');
    F.rod(-2.2, 1.9, 0, -1.2, 1.9, 0, 0.6, F.shade(rust, -0.25), 'rust');
    for (const x of [-1.6, -0.2]) F.box(x, 0, 0, 0.5, 1.9 - [0.6, 0.9][x < -1 ? 0 : 1], 1.4, 0, F.col('timberAged'), 'wood');
  }
});
