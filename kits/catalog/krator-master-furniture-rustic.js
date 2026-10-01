/* ======================================================================
   Rustic Highlander (Clansman) furniture: common and court tiers.
   Influences: Alpine, Tlingit. Carved larch on splayed legs with chevron
   bands, loden and red-check wool, horn and pewter, fieldstone hearths,
   iron fire-baskets, antler trophies; the clan hall in dark larch with
   pewter, spiral (formline) carving and totem posts. No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('rustic', { name: 'Rustic Highlanders', pack: null, influences: 'Alpine; Tlingit',
  materials: 'larch, wool, horn, pewter, iron, fieldstone; court: dark larch, pewter, antler',
  palette: {
    timberLarch: 0xa07850, timberLarchDark: 0x6a4a30, timberLarchLight: 0xc09a6a, timberLarchBlack: 0x3a2a1c,
    clothLoden: 0x4a5a3a, clothRedCheck: 0x8a2a2a, clothWool: 0xd8d0b8, clothGreyWool: 0x8a8878, clothBlue: 0x3a4a6a,
    hideBrown: 0x6a4a30, hornGrey: 0x9a9280, boneIvory: 0xe8e0cc, pewter: 0x8a8f92, iron: 0x3a3630,
    clayBrown: 0x8a5a3a, stoneGranite: 0x7a7466, flame: 0xffb04a, ember: 0xd9762c,
    /* harvested from settlements/highlands (HPAL and the Rustic builders' literals) */
    timberPine: 0xc08850, timberAged: 0x8a7e70, timberTar: 0x4a3426, timberPost: 0x5a4636, timberTrestle: 0x7a6248,
    timberBellows: 0x5a4030, timberShaft: 0x8a6a48, paintFalu: 0x8a2e22, shingleSilver: 0x9a8a78,
    stoneRubble: 0x9a948a, stoneAshlar: 0xd8d0bc, stoneMill: 0xa8a296,
    paintRed: 0xb3322a, paintTeal: 0x2e9488, paintWhite: 0xefe7d6, paintBlack: 0x201a18, paintOchre: 0xd19a3a, paintBlue: 0x3a6aa8,
    gold: 0xd4a03a, goldDeep: 0xc89030, strawHay: 0xc8b070, water: 0x2a6a8a, hornBone: 0xd8c8a0, hornPale: 0xe8dcc0,
    clayRed: 0xb86a3a, clayDeep: 0xa85a30, clayTan: 0xc88a5a, cheeseYellow: 0xe0c060, cheeseGold: 0xd0a848,
    fishSilver: 0x9aa0a8, fishGrey: 0x8a9098, ironBlack: 0x2e2a26, steelGrey: 0x9a9aa0, clothRust: 0xa04a2a,
    sackBurlap: 0xc8b080, sackPale: 0xb8a080, awningRed: 0xc03a2a, awningTeal: 0x2e8a88, awningSaffron: 0xd8a030,
    awningGreen: 0x6a8a3a, goodsSage: 0x5a7a5a, goodsBrown: 0x8a6a3a, goodsRust: 0x9a5a3a, goodsTan: 0xc8a060,
    cordDark: 0x3a2a20, hollowDark: 0x14110f
  } });
/* END PALETTE */
const RUS_COMMON = {
  wood: 'timberLarch', woodDark: 'timberLarchDark', woodLight: 'timberLarchLight', woodFam: 'wood',
  cloth: ['clothLoden', 'clothRedCheck', 'clothWool', 'clothGreyWool'], clothFam: 'cloth',
  accent: 'hornGrey', accentFam: 'bone', metal: 'iron', metalFam: 'metal',
  clay: 'clayBrown', clayFam: 'stone', stone: 'stoneGranite', stoneFam: 'stone', rope: 'hideBrown',
  flame: 'flame', ember: 'ember',
  legs: 'splayed', motif: 'chevron', bedBase: 'plank', seat: 'plank', finial: 'knob',
  hearth: 'stone', fire: 'basket', lamp: 'candle', rug: 'hide', screen: 'panel', store: 'barrels',
  shelfFill: 'jars', rack: 'tools', art: 'antler', art2: 'shield', statue: 'totem', tapestry: 'chevrons',
  canopy: false, board: 'slate'
};
const RUS_COURT = Object.assign({}, RUS_COMMON, {
  wood: 'timberLarchDark', woodDark: 'timberLarchBlack', woodLight: 'timberLarch',
  cloth: ['clothRedCheck', 'clothLoden', 'clothWool', 'clothBlue'],
  accent: 'pewter', accentFam: 'metal', motif: 'spiral', finial: 'knob', seat: 'cushion', statue: 'totem', screen: 'carved', rug: 'woven', tapestry: 'figure', art: 'antler', art2: 'shield'
});
FK.set({ culture: 'rustic', tier: 'common', S: RUS_COMMON, names: {
  bed: 'Larch box bed', bench: 'Larch bench', chair: 'Carved larch chair', stool: 'Splayed stool', table: 'Larch table',
  low_table: 'Low larch table', desk: 'Reckoning desk', chest: 'Iron-banded chest', bookcase: 'Larch shelves', wall_shelves: 'Crock shelves',
  store: 'Barrels', hearth: 'Fieldstone hearth', fire: 'Iron fire-basket', lamp: 'Candle stand', candle: 'Tallow candle',
  hanging: 'Candle wheel', rug: 'Sheepskin', screen: 'Panel screen', counter: 'Inn counter', workbench: 'Workbench',
  loom: 'Wool loom', rack: 'Tool rack', ladder: 'Ladder', board: 'Slate board', art: 'Antler trophy', bowl: 'Brown-ware bowl',
  jug: 'Brown-ware jug and cups', books: 'Reckoning books' } });
FK.set({ culture: 'rustic', tier: 'court', S: RUS_COURT, names: {
  bed: 'Chieftain\'s box bed', throne: 'Chieftain\'s chair', divan: 'Hall settle', table: 'Clan hall table', low_table: 'Pewter-trimmed low table',
  desk: 'Chieftain\'s desk', cabinet: 'Carved press', bookcase: 'Clan shelves', hearth: 'Great fieldstone hearth', fire: 'Great fire-basket',
  lamp: 'Pewter candle stand', candelabra: 'Pewter candelabra', hanging: 'Great candle wheel', carpet: 'Hall carpet', screen: 'Carved screen',
  tapestry: 'Clan crest hanging', art: 'Great antlers', statue: 'Clan totem', jug: 'Pewter ewer and cups', bowl: 'Pewter bowl' } });

FURN({
  key: 'rustic_common_churn_rack', name: 'Churn and crock rack', culture: 'rustic', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['kitchen', 'store', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal', 'stone'],
  w: 1.1, d: 0.5, h: 1.4, variants: 1,
  build: function (F) {
    const wood = F.col('timberLarchDark'), crock = F.col('clayBrown');
    F.box(0, 0, -0.22, 1.1, 1.4, 0.06, 0, wood, 'wood');
    F.box(0, 0.7, 0, 1.1, 0.04, 0.5, 0, F.col('timberLarch'), 'wood');
    for (const s of [-1, 1]) F.beam(s * 0.5, 0.7, -0.2, s * 0.5, 0.55, -0.2, 0.04, 0.04, wood, 'wood');
    F.frustum(-0.3, 0, 0.02, 0.14, 0.12, 0.6, 0, F.col('timberLarch'), 'wood', 12);         /* the churn */
    for (const y of [0.1, 0.5]) F.cyl(-0.3, y, 0.02, 0.145, 0.025, 0, F.col('iron'), 'metal');
    F.cyl(-0.3, 0.6, 0.02, 0.015, 0.4, 0, wood, 'wood');
    F.ball(-0.3, 1.0, 0.02, 0.03, F.col('timberLarch'), 'wood');
    for (let i = 0; i < 3; i++) F.frustum(-0.3 + i * 0.32, 0.74, 0.0, 0.08, 0.11, 0.32 - i * 0.06, 0, F.shade(crock, F.rr(-0.1, 0.1)), 'stone', 10);
    F.frustum(0.3, 0, 0.05, 0.1, 0.13, 0.4, 0, crock, 'stone', 10);
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed rustic_trade_<role> */
FK.set({ culture: 'rustic', tier: 'common', roles: 'trade', prefix: 'rustic_trade_', S: RUS_COMMON, names: {
  forge: 'Village forge', anvil: 'Anvil on a larch stump', trough: 'Larch trough', stall: 'Byre stall', hayrack: 'Hay heck', display: 'Market steps', armour_stand: 'Mail on a stand', weapon_rack: 'Axe and spear rack', vat: 'Cheese vat', still: 'Schnapps still', bin: 'Meal bins', larder: 'Pantry cupboard', bunk: "Herder's bunk", locker: 'Larch press', lathe: 'Pole lathe', press: 'Cider press', kiln: 'Lime kiln', grindstone: 'Grindstone', barrel: 'Cellar barrels', altar: 'Stave-church altar' } });

/* ======== Harvested from settlements/highlands (rustic branch) (25 pieces) ======== */
/* The Rustic Highlanders' yard, market, smithy, farm and hall pieces as the Highlands kit draws them
   (src/73-hl-carve.js, 79d-rep-scrap2.js, 80-rus-dwell.js, 81-rus-village.js; 81b reuses the same helpers).
   Kit families: vWood/vPost/hLogX -> wood, vShingleB -> plank, hRubB/vStone -> stone, vIron -> metal,
   hPaint -> wood (painted timber), vThatchB/vConeT -> thatch, hRUWater -> glass, vEmber -> glow, hGold -> gold. */
FURN({
  key: 'hl_rus_woodpile', name: 'Roofed woodpile', culture: 'rustic', tier: 'common', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden', 'store'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/73-hl-carve.js hnWoodpile',
  w: 6.6, d: 1.6, h: 2.25, variants: 3, variantNames: ['woodshed stack', 'under the eave', 'the winter\'s wood'],
  variantDims: [{ w: 2.2, d: 1.6, h: 1.75 }, { w: 4.0, d: 1.6, h: 1.95 }, { w: 6.6, d: 1.6, h: 2.25 }],
  build: function (F) {
    const W = [1.6, 3.4, 6][F.variant] || 1.6, H = [1.3, 1.5, 1.8][F.variant] || 1.3;
    const pine = F.col('timberPine'), n = Math.round(H / 0.2), m = Math.round(W / 0.2);
    /* split logs end-on, rows 0.19 m apart, each log 0.9 m deep */
    for (let k = 0; k < n; k++) for (let i = 0; i < m; i++) {
      const x = -W / 2 + 0.1 + i * 0.2 + F.rr(-0.01, 0.01), y = 0.1 + k * 0.19;
      F.rod(x, y, -0.45 + F.rr(0, 0.03), x, y, 0.45 - F.rr(0, 0.03), 0.09, F.shade(pine, F.rr(-0.14, 0.06)), 'wood');
    }
    /* the shingle shed roof laid on the stack, falling to the front */
    F.beam(0, H + 0.1 + 0.25 + 0.04, -0.75, 0, H + 0.1 + 0.04, 0.75, W + 0.6, 0.08, F.col('shingleSilver'), 'plank');
  }
});

FURN({
  key: 'hl_rus_shield', name: 'Painted round shield', culture: 'rustic', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'barracks', 'antechamber', 'court', 'tavern'], anchor: 'wall', clearance: {},
  materials: ['timber', 'gold'], source: 'settlements/highlands/src/80-rus-dwell.js hnRUShield',
  w: 0.86, d: 0.2, h: 0.86, variants: 1,
  build: function (F) {
    const r = 0.42, zb = -0.1, y = 0.43;
    const field = F.pick(['paintRed', 'paintTeal', 'paintWhite', 'paintOchre']), ring = F.pick(['paintBlack', 'paintWhite']);
    F.rod(0, y, zb, 0, y, zb + 0.05, r, field, 'wood');                                 /* the board */
    F.rod(0, y, zb + 0.05, 0, y, zb + 0.08, r * 0.55, ring, 'wood');                    /* the painted ring */
    F.ball(0, y, zb + 0.11, r * 0.18, F.col('goldDeep'), 'gold');                       /* the boss */
  }
});

FURN({
  key: 'hl_rus_stall', name: 'Shingle-roofed market stall', culture: 'rustic', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'street', 'plaza'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'stone', 'cloth', 'skin'], source: 'settlements/highlands/src/81-rus-village.js hnRUStall',
  w: 3.4, d: 2.5, h: 3.2, variants: 4, variantNames: ['pots', 'cloth', 'cheese', 'fish'],
  build: function (F) {
    const w = 2.8, d = 1.9, c = F.col('timberAged'), rc = F.col('shingleSilver'), kind = F.variant;
    for (const su of [-1, 1]) for (const sv of [-1, 1]) F.cyl(su * (w / 2 - 0.1), 0, sv * (d / 2 - 0.1), 0.07, 2.25, 0, c, 'wood');
    /* a little shingle gable on the posts, boarded gable ends */
    const y0 = 2.25, rise = 0.7 * d / 2, over = 0.3, ext = d / 2 + over, drop = rise * over / (d / 2), tk = 0.12;
    for (let i = 0; i < 4; i++) F.box(0, y0 + i * rise / 4, 0, w, rise / 4, d * (1 - (i + 0.5) / 4), 0, c, 'wood');
    for (const s of [-1, 1]) F.beam(0, y0 + rise + tk / 2, -s * 0.06, 0, y0 - drop + tk / 2, s * ext, w + 2 * over, tk, rc, 'plank');
    /* the counter: a plank top on a front board, toward the front */
    const tz = d / 2 - 0.4;
    F.box(0, 0.85, tz, w - 0.2, 0.08, 0.7, 0, c, 'wood');
    F.box(0, 0, tz, w - 0.3, 0.85, 0.08, 0, F.shade(c, -0.2), 'wood');
    for (let i = 0; i < Math.round(w / 0.55); i++) {
      const u = -w / 2 + 0.4 + i * 0.55, v = tz + F.rr(-0.15, 0.15);
      if (kind === 0) { const r = F.rr(0.1, 0.16); F.frustum(u, 0.93, v, r, r * 0.85, F.rr(0.2, 0.35), 0, F.pick(['clayRed', 'clayDeep', 'clayTan']), 'stone', 10); }
      else if (kind === 2) F.cyl(u, 0.93, v, 0.16, 0.12, 0, F.pick(['cheeseYellow', 'cheeseGold']), 'cloth');
      else if (kind === 3) F.box(u, 1.5, d / 2 - 0.15, 0.08, 0.4, 0.14, 0, F.pick(['fishSilver', 'fishGrey']), 'skin');
      else F.box(u, 0.93, v, 0.36, F.rr(0.08, 0.3), 0.3, F.rr(-0.2, 0.2), F.pick(['paintBlue', 'paintRed', 'paintWhite', 'paintTeal', 'paintOchre']), 'cloth');
    }
    if (kind === 3) F.rod(-w / 2 + 0.1, 1.92, d / 2 - 0.15, w / 2 - 0.1, 1.92, d / 2 - 0.15, 0.015, F.col('cordDark'), 'wood');   /* the fish line */
    F.box(0, 0, -d / 2 + 0.35, 0.7, 0.56, 0.63, 0, F.col('timberLarch'), 'wood');        /* a crate behind */
  }
});

FURN({
  key: 'hl_rus_trough', name: 'Plank water trough', culture: 'rustic', tier: 'common', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'stable', 'street'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'glass'], source: 'settlements/highlands/src/81-rus-village.js hnRUTrough',
  w: 2.4, d: 0.6, h: 0.57, variants: 2, variantNames: ['short', 'long'],
  variantDims: [{ w: 1.6, d: 0.6, h: 0.57 }, { w: 2.4, d: 0.6, h: 0.57 }],
  build: function (F) {
    const L = F.variant === 1 ? 2.4 : 1.6, c = F.col('timberAged');
    F.box(0, 0, 0, L, 0.55, 0.6, 0, c, 'wood');
    for (const s of [-1, 1]) F.box(0, 0.5, s * 0.27, L, 0.05, 0.06, 0, F.shade(c, 0.08), 'wood');   /* the rim boards */
    F.box(0, 0.47, 0, L - 0.12, 0.1, 0.48, 0, F.col('water'), 'glass');
  }
});

FURN({
  key: 'hl_rus_log_bench', name: 'Split-log bench', culture: 'rustic', tier: 'court', type: 'bench', setting: 'both',
  rooms: ['yard', 'plaza', 'street', 'hall', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js hnRUBench',
  w: 3.0, d: 0.34, h: 0.53, variants: 2, variantNames: ['two-seat', 'long'],
  variantDims: [{ w: 2.0, d: 0.34, h: 0.53 }, { w: 3.0, d: 0.34, h: 0.53 }],
  build: function (F) {
    const L = F.variant === 1 ? 3 : 2, c = F.shade('timberPine', -0.25);
    for (const s of [-1, 1]) F.frustum(s * (L / 2 - 0.3), 0, 0, 0.14, 0.12, 0.3, 0, F.shade(c, -0.1), 'wood', 8);   /* the stumps */
    F.rod(-L / 2, 0.38, 0, L / 2, 0.38, 0, 0.15, c, 'wood');                              /* the log */
    F.box(0, 0.49, 0, L - 0.06, 0.04, 0.24, 0, F.shade(c, 0.12), 'wood');                 /* the split face */
  }
});

FURN({
  key: 'hl_rus_cart', name: 'Farm cart', culture: 'rustic', tier: 'common', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'street', 'market', 'stable'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth'], source: 'settlements/highlands/src/81-rus-village.js hnRUCart',
  w: 1.64, d: 3.74, h: 1.45, variants: 2, variantNames: ['empty', 'with sacks'],
  variantDims: [{ w: 1.64, d: 3.74, h: 1.1 }, { w: 1.64, d: 3.74, h: 1.45 }],
  build: function (F) {
    F.shift(0, -0.77);
    const c = F.col('timberAged'), dk = F.shade(c, -0.3);
    F.box(0, 0.7, 0, 1.3, 0.35, 2.2, 0, c, 'wood');                                       /* the box bed */
    for (const s of [-1, 1]) {
      F.rod(s * 0.74, 0.55, -0.2, s * 0.82, 0.55, -0.2, 0.55, dk, 'wood');                /* disc wheels */
      F.rod(s * 0.7, 0.55, -0.2, s * 0.86, 0.55, -0.2, 0.09, F.shade(dk, -0.2), 'wood');  /* hubs */
      F.beam(s * 0.45, 0.8, 1.1, s * 0.45, 0.3, 2.6, 0.08, 0.08, c, 'wood');              /* the shafts */
    }
    F.rod(-0.7, 0.55, -0.2, 0.7, 0.55, -0.2, 0.05, dk, 'wood');                           /* the axle */
    if (F.variant === 1) for (let i = 0; i < 4; i++)
      F.blob((i % 2 ? 0.3 : -0.3) + F.rr(-0.04, 0.04), 1.05 + 0.2, -0.6 + Math.floor(i / 2) * 0.9 + F.rr(-0.05, 0.05), 0.27, 0.4, F.rr(0, 3), F.pick(['sackBurlap', 'sackPale']), 'cloth');
  }
});

FURN({
  key: 'hl_rus_shutter_counter', name: 'Shutter counter', culture: 'rustic', tier: 'common', type: 'counter', setting: 'both',
  rooms: ['shop', 'market', 'street'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['timber', 'stone'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusShops (shutter counter)',
  w: 3.12, d: 1.06, h: 2.82, variants: 1,
  build: function (F) {
    F.shift(0, -0.53);                                     /* authored from the wall plane at z = 0 */
    const trim = F.pick(['paintTeal', 'paintRed', 'paintBlue']), dk = F.col('timberTar'), log = F.shade('timberPine', -0.12);
    F.box(0, 0, 0.05, 2.8, 0.9, 0.1, 0, log, 'wood');                                     /* the wall below the hatch */
    F.box(0, 0.9, 0.05, 2.8, 1.2, 0.1, 0, F.col('hollowDark'), 'wood');                   /* the open hatch */
    for (const s of [-1, 1]) F.box(s * 1.48, 0.8, 0.08, 0.16, 1.45, 0.14, 0, trim, 'wood');   /* painted jambs */
    F.beam(0, 1.823, 0.276, 0, 2.777, 0.824, 2.9, 0.06, trim, 'wood');                    /* top leaf, propped up as an awning */
    for (const s of [-1, 1]) F.beam(s * 1.3, 1.3, 0.1, s * 1.3, 2.24, 1.0, 0.04, 0.04, dk, 'wood');
    F.box(0, 0.82, 0.5, 2.9, 0.08, 0.9, 0, trim, 'wood');                                 /* bottom leaf let down as the counter */
    for (const s of [-1, 1]) F.beam(s * 1.2, 0.3, 0.05, s * 1.2, 0.8, 0.85, 0.05, 0.05, dk, 'wood');
    for (let k = 0; k < 6; k++) F.frustum(-1.1 + k * 0.45, 0.9, 0.5, 0.12, 0.1, F.rr(0.18, 0.3), 0, F.pick(['clayRed', 'clayDeep', 'clayTan', 'cheeseYellow']), 'stone', 10);
  }
});

FURN({
  key: 'hl_rus_porch_set', name: 'Inn porch table and benches', culture: 'rustic', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'yard', 'street', 'hall'], anchor: 'floor', clearance: { left: 0.4, right: 0.4 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusTavern (porch benches and tables)',
  w: 1.84, d: 2.66, h: 0.77, variants: 1,
  build: function (F) {
    F.shift(0, 0.3375);
    const dk = F.shade('timberTar', 0.08);
    /* solid plank blocks, as the inn sets them out under its balcony: wall bench, table, front bench */
    F.box(0, 0, -1.45, 1.8, 0.45, 0.4, 0, dk, 'wood');
    F.box(0, 0, 0, 1.8, 0.75, 0.8, 0, dk, 'wood');
    F.box(0, 0.73, 0, 1.84, 0.04, 0.84, 0, F.shade(dk, 0.1), 'wood');
    F.box(0, 0, 0.8, 1.8, 0.45, 0.35, 0, dk, 'wood');
    for (const z of [-1.45, 0.8]) F.box(0, 0.43, z, 1.82, 0.03, z < 0 ? 0.42 : 0.37, 0, F.shade(dk, 0.1), 'wood');
  }
});

FURN({
  key: 'hl_rus_forge', name: 'Fieldstone forge with hood', culture: 'rustic', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 1.0, left: 0.4 },
  materials: ['stone', 'timber', 'emissive'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (hearth, hood, chimney, bellows)',
  w: 2.5, d: 1.5, h: 3.38, variants: 1,
  build: function (F) {
    F.shift(0.3, 0.1);
    const rub = F.col('stoneRubble'), bel = F.col('timberBellows');
    F.box(0, 0, 0, 1.8, 0.9, 1.3, 0, rub, 'stone');                                       /* the hearth */
    F.blob(0, 0.95, 0, 0.3, 0.24, 0, F.col('ember'), 'glow');
    F.cone(0, 0.92, 0, 0.12, 0.3, 0, F.col('flame'), 'glow');
    F.lamp(0, 1.2, 0, 0.8, 6);
    F.pyrRoof(0, 1.6, -0.1, 1.9, 1.0, 1.5, 0, F.shade(rub, -0.06), 'stone');             /* the hood */
    F.box(0, 2.3, -0.2, 0.62, 0.9, 0.62, 0, rub, 'stone');                                /* chimney stack */
    F.box(0, 3.2, -0.2, 0.78, 0.14, 0.78, 0, F.col('stoneAshlar'), 'stone');
    F.box(0, 3.34, -0.2, 0.31, 0.04, 0.31, 0, F.col('hollowDark'), 'stone');
    /* the bellows on a pair of stakes */
    for (const s of [-1, 1]) F.box(-1.3, 0, 0.2 + s * 0.3, 0.08, 0.5, 0.08, 0, F.shade(bel, -0.2), 'wood');
    F.box(-1.3, 0.5, 0.2, 0.5, 0.3, 0.9, 0, bel, 'wood');
    F.hipRoof(-1.3, 0.8, 0.2, 0.5, 0.2, 0.9, 0, bel, 'wood');
  }
});

FURN({
  key: 'hl_rus_anvil', name: 'Anvil on a stump', culture: 'rustic', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (anvil on a stump)',
  w: 0.56, d: 1.25, h: 0.93, variants: 1,
  build: function (F) {
    F.shift(0, -0.2);
    const iron = F.col('ironBlack');
    F.frustum(0, 0, 0, 0.28, 0.24, 0.55, 0, F.col('timberAged'), 'wood', 8);
    F.box(0, 0.55, 0, 0.26, 0.26, 0.6, 0, iron, 'metal');
    F.box(0, 0.81, 0, 0.34, 0.12, 0.85, 0, iron, 'metal');                                /* the face */
    F.rod(0, 0.87, 0.4, 0, 0.87, 0.62, 0.055, iron, 'metal');                             /* the horn, tapering */
    F.rod(0, 0.87, 0.62, 0, 0.87, 0.8, 0.03, iron, 'metal');
  }
});

FURN({
  key: 'hl_rus_quench_barrel', name: 'Quench barrel', culture: 'rustic', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'metal', 'glass'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (quench barrel)',
  w: 0.76, d: 0.76, h: 0.8, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.324, 0.36, 0.8, 0, F.col('timberAged'), 'wood', 12);
    for (const y of [0.18, 0.6]) F.cyl(0, y, 0, 0.372, 0.04, 0, F.col('ironBlack'), 'metal');
    F.cyl(0, 0.74, 0, 0.32, 0.04, 0, F.col('water'), 'glass');
  }
});

FURN({
  key: 'hl_rus_grindstone', name: 'Grindstone on a block', culture: 'rustic', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (grindstone)',
  w: 0.5, d: 0.92, h: 1.16, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.5, 0.5, 0.2, 0, F.col('timberAged'), 'wood');
    F.rod(-0.06, 0.7, 0, 0.06, 0.7, 0, 0.45, F.col('stoneRubble'), 'stone');
    F.rod(-0.2, 0.7, 0, 0.2, 0.7, 0, 0.03, F.col('ironBlack'), 'metal');
  }
});

FURN({
  key: 'hl_rus_tool_board', name: 'Smith\'s tool board', culture: 'rustic', tier: 'poor', type: 'rack', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusSmithy (back boards and tool rack)',
  w: 2.2, d: 0.2, h: 1.82, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged'), iron = F.col('ironBlack');
    F.box(0, 0, -0.05, 2.2, 1.5, 0.1, 0, wd, 'wood');                                     /* the half-height back boards */
    for (let i = 1; i < 4; i++) F.box(-1.1 + i * 0.55, 0, 0.01, 0.06, 1.5, 0.03, 0, F.shade(wd, -0.2), 'wood');
    for (let k = 0; k < 6; k++) {
      const x = -0.88 + k * 0.35, h = F.rr(0.5, 0.8);
      F.box(x, 1.0, 0.04, 0.05, h, 0.04, 0, iron, 'metal');                                /* handles, hung on the boards */
      if (k % 2 === 0) F.box(x, 1.0 + h - 0.04, 0.04, 0.16, 0.06, 0.06, 0, iron, 'metal'); /* a hammer head, a pair of jaws */
    }
  }
});

FURN({
  key: 'hl_rus_spear_rack', name: 'Spear and shield rack', culture: 'rustic', tier: 'court', type: 'weapon', setting: 'both',
  rooms: ['barracks', 'yard', 'court', 'hall'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'gold'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (weapon racks)',
  w: 3.0, d: 0.84, h: 2.86, variants: 1,
  build: function (F) {
    F.shift(0, 0.04);
    const dk = F.col('timberTar');
    for (const s of [-1, 1]) F.beam(s * 1.4, 0, -0.4, s * 1.4, 1.7, 0, 0.1, 0.1, dk, 'wood');   /* A-frame ends */
    F.box(0, 1.55, 0, 3, 0.12, 0.12, 0, dk, 'wood');
    F.box(0, 0.5, 0.1, 3, 0.1, 0.1, 0, dk, 'wood');
    for (let k = 0; k < 8; k++) {
      const x = -1.2 + k * 0.34;
      F.beam(x, 0.02, 0.35, x, 2.6, -0.08, 0.04, 0.04, F.col('timberShaft'), 'wood');
      F.cone(x, 2.58, -0.09, 0.035, 0.25, 0, F.col('steelGrey'), 'metal');
    }
    /* shields hung on the back of the rack */
    for (let k = 0; k < 3; k++) {
      const x = -1 + k, y = 1.0, r = 0.4;
      F.rod(x, y, -0.13, x, y, -0.18, r, F.pick(['paintRed', 'paintTeal', 'paintWhite', 'paintOchre']), 'wood');
      F.rod(x, y, -0.18, x, y, -0.21, r * 0.55, F.col('paintBlack'), 'wood');
      F.ball(x, y, -0.23, r * 0.18, F.col('goldDeep'), 'gold');
    }
  }
});

FURN({
  key: 'hl_rus_pell', name: 'Training pell', culture: 'rustic', tier: 'court', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'barracks', 'court'], anchor: 'floor', clearance: { front: 1.2, left: 0.6, right: 0.6 },
  materials: ['timber', 'thatch'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (pells)',
  w: 0.9, d: 0.3, h: 1.8, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged');
    F.frustum(0, 0, 0, 0.13, 0.11, 1.8, 0, wd, 'wood', 8);
    F.box(0, 1.25, 0, 0.9, 0.1, 0.1, 0, wd, 'wood');                                      /* the arms */
    F.box(0, 1.4, 0, 0.3, 0.35, 0.3, 0, F.col('strawHay'), 'thatch');                     /* the straw head */
  }
});

FURN({
  key: 'hl_rus_target_butt', name: 'Archery butt', culture: 'rustic', tier: 'court', type: 'tool', setting: 'outdoor',
  rooms: ['yard', 'barracks', 'court'], anchor: 'floor', clearance: { front: 3.0 },
  materials: ['thatch', 'timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (target butts)',
  w: 1.6, d: 0.98, h: 1.6, variants: 1,
  build: function (F) {
    F.shift(0, -0.035);
    const straw = F.col('strawHay');
    F.box(0, 0, 0, 1.6, 0.8, 0.9, 0, straw, 'thatch');
    F.box(0, 0.8, 0, 1.6, 0.8, 0.9, 0, F.shade(straw, -0.08), 'thatch');
    F.rod(0, 1.05, 0.44, 0, 1.05, 0.47, 0.55, F.col('paintWhite'), 'wood');               /* the painted face */
    F.rod(0, 1.05, 0.47, 0, 1.05, 0.495, 0.38, F.col('paintRed'), 'wood');
    F.rod(0, 1.05, 0.495, 0, 1.05, 0.52, 0.2, F.col('paintBlack'), 'wood');
  }
});

FURN({
  key: 'hl_rus_horn_post', name: 'Horn post', culture: 'rustic', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'court', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'bone', 'rope'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMuster (horn post, hnRUHornTop)',
  w: 1.48, d: 0.76, h: 4.32, variants: 1,
  build: function (F) {
    F.shift(0.275, -0.21);
    const dk = F.col('timberTar'), bone = F.col('hornBone'), s = 0.7;
    F.frustum(0, 0, 0, 0.16, 0.14, 3.2, 0, dk, 'wood', 8);
    /* crossed horns on the post top: two curled boards each side */
    for (const sd of [-1, 1]) {
      const P = [[0, 3.1], [sd * 0.45 * s, 3.1 + 0.6 * s], [sd * 0.5 * s, 3.1 + 1.3 * s], [sd * 0.25 * s, 3.1 + 1.7 * s]], W = [0.22, 0.18, 0.13];
      for (let i = 0; i < 3; i++) F.beam(P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0, W[i] * s, 0.1, F.shade(bone, -0.05 * i), 'bone');
    }
    /* the signal horn on its peg and cord */
    F.box(0, 2.4, 0.25, 0.08, 0.08, 0.4, 0, dk, 'wood');
    F.rod(0, 2.12, 0.45, -0.35, 2.03, 0.45, 0.12, F.col('hornPale'), 'bone');
    F.rod(-0.35, 2.03, 0.45, -0.7, 1.94, 0.45, 0.08, F.shade('hornPale', -0.05), 'bone');
    F.rod(-0.7, 1.94, 0.45, -0.97, 1.87, 0.45, 0.04, F.shade('hornPale', -0.1), 'bone');
    F.rod(0, 2.44, 0.45, 0.45, 2.2, 0.45, 0.012, F.col('cordDark'), 'rope');
  }
});

FURN({
  key: 'hl_rus_carved_pillar', name: 'Carved hall pillar', culture: 'rustic', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['plaza', 'court', 'temple', 'street'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'stone', 'gold', 'metal', 'bone'], source: 'settlements/highlands/src/73-hl-carve.js hnPillar (the Rustic totem: hnTotem outside the tribes) + 81 hnRUHornTop',
  w: 1.35, d: 1.27, h: 9.2, variants: 2, variantNames: ['with the roundel', 'horned corner pole'],
  variantDims: [{ w: 1.27, d: 1.27, h: 8.52 }, { w: 1.35, d: 1.03, h: 9.2 }],
  build: function (F) {
    const v = F.variant, r = v ? 0.33 : 0.396, h = v ? 7.4 : 6.8, s = r * 2;
    const stone = F.col('stoneAshlar'), wood = F.shade('timberTar', 0.06);
    const bh = Math.min(0.42, h * 0.1), ch = Math.min(0.55, h * 0.13), sh = h - bh - 0.1 - ch;
    F.box(0, 0, 0, s * 1.55, bh, s * 1.55, 0, stone, 'stone');                           /* plinth and step */
    F.box(0, bh, 0, s * 1.25, 0.1, s * 1.25, 0, F.shade(stone, -0.05), 'stone');
    F.box(0, bh + 0.1, 0, s, sh, s, 0, wood, 'wood');                                     /* the square shaft */
    /* the stacked motif column, as painted bands with a carved boss on each face */
    const n = Math.max(3, Math.round(sh / 0.95)), ph = sh / n;
    for (let i = 0; i < n; i++) {
      const y = bh + 0.1 + i * ph + 0.08, c = F.pick(['paintRed', 'paintTeal', 'paintOchre']);
      F.box(0, y, 0, s + 0.02, ph - 0.16, s + 0.02, 0, c, 'wood');
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; F.ball(Math.sin(a) * (s / 2 + 0.01), y + (ph - 0.16) / 2, Math.cos(a) * (s / 2 + 0.01), s * 0.16, F.col('paintBlack'), 'wood'); }
    }
    const cy = h - ch;                                                                    /* the painted capital */
    F.box(0, cy, 0, s * 1.08, ch * 0.28, s * 1.08, 0, F.col('paintBlack'), 'wood');
    F.box(0, cy + ch * 0.28, 0, s * 1.3, ch * 0.34, s * 1.3, 0, F.pick(['paintRed', 'paintTeal']), 'wood');
    F.box(0, cy + ch * 0.62, 0, s * 1.6, ch * 0.38, s * 1.6, 0, wood, 'wood');
    if (v === 0) {                                                                        /* the free pillar's roundel */
      const R = Math.max(0.7, s * 1.6), yc = h + R * 0.35 + R / 2;
      F.box(0, h, 0, 0.04, R * 0.35, 0.04, 0, F.col('ironBlack'), 'metal');
      F.box(0, h + R * 0.35 - 0.04, 0, R * 0.36, 0.08, 0.12, 0, F.col('gold'), 'gold');
      F.rod(0, yc, -0.02, 0, yc, 0.02, R / 2, F.col('paintBlack'), 'wood');
      F.rod(0, yc, -0.03, 0, yc, 0.03, R / 2 - 0.06, F.pick(['paintRed', 'paintTeal', 'paintWhite']), 'wood');
      F.rod(0, yc, -0.04, 0, yc, 0.04, R * 0.24, F.col('paintOchre'), 'wood');
      F.rod(0, yc, -0.05, 0, yc, 0.05, R * 0.1, F.col('paintBlack'), 'wood');
    } else {                                                                              /* crossed horns on the post top */
      const sc = 1.1, y0 = h - 0.1, bone = F.col('hornBone');
      for (const sd of [-1, 1]) {
        const P = [[0, y0], [sd * 0.45 * sc, y0 + 0.6 * sc], [sd * 0.5 * sc, y0 + 1.3 * sc], [sd * 0.25 * sc, y0 + 1.7 * sc]], W = [0.22, 0.18, 0.13];
        for (let i = 0; i < 3; i++) F.beam(P[i][0], P[i][1], 0, P[i + 1][0], P[i + 1][1], 0, W[i] * sc, 0.1, F.shade(bone, -0.05 * i), 'bone');
      }
    }
  }
});

FURN({
  key: 'hl_rus_grave_board', name: 'Carved grave board', culture: 'rustic', tier: 'court', type: 'tomb', setting: 'outdoor',
  rooms: ['graveyard', 'temple'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusTemple (churchyard boards, hnForm hFormV)',
  w: 0.38, d: 0.08, h: 0.95, variants: 1,
  build: function (F) {
    const ground = F.pick(['timberLarchLight', 'paintWhite']);
    F.box(0, 0, 0, 0.36, 0.92, 0.04, 0, F.col('paintBlack'), 'wood');                     /* the board and its black line */
    F.box(0, 0.03, 0.005, 0.3, 0.86, 0.04, 0, ground, 'wood');
    F.rod(0, 0.72, 0.02, 0, 0.72, 0.035, 0.1, F.col('paintBlack'), 'wood');               /* an ovoid head */
    F.rod(0, 0.72, 0.035, 0, 0.72, 0.04, 0.045, F.col('paintTeal'), 'wood');
    for (let k = 0; k < 3; k++) {                                                         /* stacked U-forms */
      const y = 0.18 + k * 0.15, c = k % 2 ? F.col('paintBlack') : F.col('paintRed');
      F.box(0, y, 0.025, 0.18, 0.025, 0.02, 0, c, 'wood');
      for (const s of [-1, 1]) F.box(s * 0.08, y, 0.025, 0.025, 0.1, 0.02, 0, c, 'wood');
    }
    F.box(0, 0.92, 0, 0.38, 0.03, 0.06, 0, F.col('paintBlack'), 'wood');
  }
});

FURN({
  key: 'hl_rus_fountain_trough', name: 'Farmyard fountain trough', culture: 'rustic', tier: 'common', type: 'fountain', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden', 'plaza'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal', 'glass'], source: 'settlements/highlands/src/80-rus-dwell.js buildHlRusRichA (fountain trough)',
  w: 3.1, d: 0.7, h: 1.3, variants: 1,
  build: function (F) {
    F.shift(0.15, 0);
    const log = F.shade('timberTar', 0.25);
    F.box(0, 0, 0, 2.8, 0.7, 0.7, 0, log, 'wood');                                        /* the hollowed log */
    F.box(0, 0.6, 0, 2.6, 0.12, 0.5, 0, F.col('water'), 'glass');
    F.cyl(-1.6, 0, 0, 0.1, 1.3, 0, log, 'wood');                                          /* the spout post */
    F.beam(-1.55, 1.1, 0, -0.9, 1.02, 0, 0.05, 0.05, F.col('iron'), 'metal');
    F.rod(-0.9, 1.0, 0, -0.86, 0.7, 0, 0.015, F.col('water'), 'glass');                   /* the running water */
  }
});

FURN({
  key: 'hl_rus_hay_rack', name: 'Hay-drying rack', culture: 'rustic', tier: 'common', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'garden'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'thatch'], source: 'settlements/highlands/src/80-rus-dwell.js hnRUHesje',
  w: 7.6, d: 0.36, h: 2.21, variants: 2, variantNames: ['short', 'field length'],
  variantDims: [{ w: 5.1, d: 0.36, h: 2.21 }, { w: 7.6, d: 0.36, h: 2.21 }],
  build: function (F) {
    const L = F.variant === 1 ? 7.5 : 5, h = 1.9, n = Math.max(2, Math.round(L / 2.2));
    const c = F.col('timberAged'), hay = F.pick(['strawHay', 'cheeseGold', 'goodsTan']);
    for (let i = 0; i <= n; i++) F.cyl(-L / 2 + L * i / n, 0, 0, 0.05, h + 0.2, 0, c, 'wood');
    for (let k = 0; k < 3; k++) F.box(0, 0.45 + k * 0.52, 0, L - 0.2, 0.44, 0.34, 0, F.shade(hay, -0.05 * k), 'thatch');
    F.box(0, 0.45 + 1.56, 0, L - 0.5, 0.2, 0.24, 0, hay, 'thatch');
  }
});

FURN({
  key: 'hl_rus_scarecrow', name: 'Scarecrow', culture: 'rustic', tier: 'common', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'cloth', 'thatch'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusFarm (scarecrow)',
  w: 1.3, d: 0.6, h: 2.35, variants: 1,
  build: function (F) {
    const wd = F.col('timberAged');
    F.cyl(0, 0, 0, 0.06, 2.1, 0, wd, 'wood');
    F.box(0, 1.6, 0, 1.3, 0.08, 0.08, 0, wd, 'wood');
    F.box(0, 1.1, 0, 0.5, 0.6, 0.3, 0, F.col('clothRust'), 'cloth');                      /* the coat */
    F.ball(0, 1.95, 0, 0.18, F.col('sackBurlap'), 'cloth');                               /* a sack head */
    F.cone(0, 2.05, 0, 0.3, 0.3, 0, F.col('strawHay'), 'thatch');                         /* straw hat */
  }
});

FURN({
  key: 'hl_rus_millstones', name: 'Spare millstones', culture: 'rustic', tier: 'common', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'workshop', 'store'], anchor: 'floor', clearance: {},
  materials: ['stone'], source: 'settlements/highlands/src/81-rus-village.js buildHlRusMill (millstones at the door)',
  w: 0.95, d: 1.35, h: 1.1, variants: 1,
  build: function (F) {
    const st = F.col('stoneMill');
    /* two stones on edge, leaning a little, one behind the other */
    const ax = [-0.969, -0.149, 0.197];
    for (const s of [0, 1]) {
      const cx = -0.15 + s * 0.3, cz = -0.12 + s * 0.25, cy = 0.55, t = 0.125;
      F.rod(cx - ax[0] * t, cy - ax[1] * t, cz - ax[2] * t, cx + ax[0] * t, cy + ax[1] * t, cz + ax[2] * t, 0.55, F.shade(st, -0.05 * s), 'stone');
      F.rod(cx - ax[0] * (t + 0.01), cy - ax[1] * (t + 0.01), cz - ax[2] * (t + 0.01), cx + ax[0] * (t + 0.01), cy + ax[1] * (t + 0.01), cz + ax[2] * (t + 0.01), 0.08, F.col('hollowDark'), 'stone');
    }
  }
});

FURN({
  key: 'hl_rus_cloth_stall', name: 'Cloth-roofed trestle stall', culture: 'rustic', tier: 'common', type: 'stall', setting: 'outdoor',
  rooms: ['market', 'plaza', 'street'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth', 'stone', 'wicker'], source: 'settlements/highlands/src/79d-rep-scrap2.js hnStall (the Highland towns\' plaza stall)',
  w: 2.7, d: 2.2, h: 2.66, variants: 1,
  build: function (F) {
    const w = 2.4, d = 1.8, post = F.col('timberPost');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08), 0.05, 2.2 + (sz < 0 ? 0.3 : 0), 0, post, 'wood');
    F.beam(0, 2.275, -1.086, 0, 2.625, 1.086, w + 0.3, 0.04, F.pick(['awningRed', 'awningTeal', 'awningSaffron', 'paintBlue', 'awningGreen']), 'cloth');
    const tz = d / 2 - 0.45;
    F.box(0, 0.75, tz, w - 0.3, 0.08, 0.7, 0, F.col('timberTrestle'), 'wood');             /* the trestle table */
    for (const s of [-1, 1]) F.box(s * (w / 2 - 0.4), 0, tz, 0.08, 0.75, 0.6, 0, post, 'wood');
    for (let k = 0; k < 5; k++) {
      const x = F.rr(-w / 2 + 0.4, w / 2 - 0.4), z = tz + F.rr(-0.2, 0.2), r = F.rr(0.12, 0.2), h = F.rr(0.16, 0.3);
      const c = F.pick(['goodsRust', 'goodsTan', 'goodsSage', 'paintRed', 'paintWhite', 'goodsBrown']), kind = Math.floor(F.rnd() * 4);
      if (kind === 0) F.frustum(x, 0.83, z, r * 0.7, r * 0.6, h, 0, c, 'stone', 10);       /* a pot */
      else if (kind === 1) F.ball(x, 0.83 + r * 0.7, z, r * 0.7, c, 'wicker');              /* a gourd */
      else if (kind === 2) F.blob(x, 0.83 + h / 2, z, r * 0.8, h, 0, c, 'cloth');          /* a sack */
      else F.frustum(x, 0.83, z, r * 0.6, r * 0.66, h, 0, c, 'wood', 10);                   /* a keg */
    }
  }
});

FURN({
  key: 'hl_rus_porch_bench', name: 'Plank porch bench', culture: 'rustic', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['yard', 'street', 'tavern', 'cottage'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/80-rus-dwell.js buildHlRusPoorA / MidA / RichA (porch benches)',
  w: 2.2, d: 0.4, h: 0.45, variants: 2, variantNames: ['cabin', 'farmhouse'],
  variantDims: [{ w: 1.4, d: 0.36, h: 0.42 }, { w: 2.2, d: 0.4, h: 0.45 }],
  build: function (F) {
    const L = F.variant === 1 ? 2.2 : 1.4, D = F.variant === 1 ? 0.4 : 0.36, H = F.variant === 1 ? 0.45 : 0.42;
    const c = F.variant === 1 ? F.col('timberTar') : F.col('timberAged');
    F.box(0, H - 0.06, 0, L, 0.06, D, 0, F.shade(c, 0.08), 'wood');                       /* the seat plank */
    for (const s of [-1, 1]) F.box(s * (L / 2 - 0.08), 0, 0, 0.1, H - 0.06, D - 0.04, 0, c, 'wood');   /* slab ends */
    F.box(0, H - 0.2, D / 2 - 0.04, L - 0.2, 0.14, 0.04, 0, F.shade(c, -0.1), 'wood');    /* the apron */
  }
});
