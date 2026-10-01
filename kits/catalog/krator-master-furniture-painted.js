/* ======================================================================
   Painted Men (tribal highlander) furniture: common and court tiers.
   Influences: Tlingit. Red cedar on block feet, formline spirals painted in
   black, red and teal, hide seats and screens, bentwood boxes, copper and
   abalone shell, totem posts and Chilkat-style figure hangings.
   No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('painted', { name: 'Painted Men', pack: null, influences: 'Tlingit',
  materials: 'red cedar, painted hide, cedar-bark rope, copper, abalone shell, bone',
  palette: {
    timberCedarRed: 0x8a4a30, timberCedarDark: 0x5a3020, timberCedarPale: 0xb08060, timberGreyWeathered: 0x8a8878,
    paintBlack: 0x1e1e1e, paintRed: 0xa82a22, paintTeal: 0x2a7a7a, paintOchre: 0xc89a3a, clothWoolWhite: 0xe8e0cc, hideElk: 0x9a7a52,
    boneIvory: 0xe8e0cc, copper: 0xb5723a, shellAbalone: 0x8ab0a8, stoneGrey: 0x7a7670, clayBlack: 0x3a3632, ropeCedar: 0x9a7a4a,
    flame: 0xffb04a, ember: 0xd9762c,
    /* harvested from settlements/highlands (the formline colours HFORM, HPAL and the Tribal builders' literals) */
    formCedar: 0xb27a4c, formCedarDark: 0x8a5634, formGround: 0xd8cdb4, formWhite: 0xefe7d6, formBlack: 0x171311,
    formRed: 0xb3322a, formTeal: 0x2e9488, formOchre: 0xd19a3a, formFrog: 0x3f8f5a, formMuzzle: 0xd9b48a,
    timberAged: 0x8a7e70, timberTar: 0x4a3426, timberHatch: 0x5a4a3a, timberBench: 0x7a6a50, bamboo: 0xc8b870,
    thatch: 0xb89a5a, thatchPale: 0xc4a66a, hay: 0xc4a86a, stoneRubble: 0x9a948a, stoneAshlar: 0xd8d0bc,
    ironBrazier: 0x3a3430, ironBlack: 0x2e2a26, ironSpear: 0x5a5650, rust: 0x8a5a3a, rustDark: 0x7a4e34,
    boneHorn: 0xe6dcc4, antler: 0xd8ccb0, gourd: 0xb08a4a, gourdOlive: 0x9a8a3a, gourdPale: 0xc0a060, gourdDark: 0xa08040,
    herbGreen: 0x6a7a3a, herbOlive: 0x8a7a44, herbDark: 0x5a6a34, herbStraw: 0x9a8050, ropeFibre: 0x9a8a6a,
    shieldPeach: 0xe8c0a0, shieldMint: 0xa0d0c8, shieldButter: 0xf0d890, shieldRose: 0xe0a098, sackBurlap: 0xb8a080,
    hollowDark: 0x14110f
  } });
/* END PALETTE */
const PNT_COMMON = {
  emblem: { field: 'clothWoolWhite', edge: 'paintBlack', band: 'paintRed', ink: 'paintBlack', ink2: 'paintTeal' },
  wood: 'timberCedarRed', woodDark: 'timberCedarDark', woodLight: 'timberCedarPale', woodFam: 'wood',
  cloth: ['paintRed', 'paintBlack', 'paintTeal', 'clothWoolWhite'], clothFam: 'cloth',
  accent: 'copper', accentFam: 'bronze', metal: 'copper', metalFam: 'bronze',
  clay: 'clayBlack', clayFam: 'stone', stone: 'stoneGrey', stoneFam: 'stone', rope: 'ropeCedar',
  flame: 'flame', ember: 'ember',
  legs: 'block', motif: 'spiral', bedBase: 'plank', seat: 'hide', finial: 'none',
  hearth: 'stone', fire: 'pit', lamp: 'oil', rug: 'hide', screen: 'carved', store: 'crates',
  shelfFill: 'bundles', rack: 'spears', art: 'mask', art2: 'panel', statue: 'totem', tapestry: 'figure',
  canopy: false, board: 'bark'
};
const PNT_COURT = Object.assign({}, PNT_COMMON, {
  cloth: ['paintBlack', 'paintTeal', 'paintOchre', 'clothWoolWhite'],
  accent: 'shellAbalone', accentFam: 'nacre', motif: 'spiral', finial: 'disc', statue: 'totem', screen: 'carved', rug: 'woven', art: 'mask', art2: 'panel'
});
FK.set({ culture: 'painted', tier: 'common', S: PNT_COMMON, names: {
  bed: 'Cedar plank bed', bench: 'Cedar bench', chair: 'Hide-seat chair', stool: 'Cedar block stool', table: 'Cedar plank table',
  low_table: 'Low cedar table', desk: 'Carver\'s desk', chest: 'Bentwood box', bookcase: 'Bundle shelves', wall_shelves: 'Box shelves',
  store: 'Bentwood boxes', hearth: 'Stone hearth', fire: 'Fire pit', lamp: 'Oil lamp on a post', candle: 'Fat lamp',
  hanging: 'Hanging oil bowl', rug: 'Elk hide', screen: 'Painted screen', counter: 'Trade counter', workbench: 'Carver\'s bench',
  loom: 'Weaving frame', rack: 'Spear rack', ladder: 'Ladder', board: 'Bark board', art: 'Painted mask', bowl: 'Black clay bowl',
  jug: 'Black clay jug and cups', books: 'Tally sticks' } });
FK.set({ culture: 'painted', tier: 'court', S: PNT_COURT, names: {
  bed: 'Chief\'s painted dais', throne: 'Chief\'s painted seat', divan: 'House-front settle', table: 'Potlatch table', low_table: 'Abalone-inlaid low table',
  desk: 'Chief\'s desk', cabinet: 'Painted press', bookcase: 'Crest shelves', hearth: 'Great house hearth', fire: 'Copper fire-bowl',
  lamp: 'Abalone lamp post', candelabra: 'Copper oil lamps', hanging: 'Hanging copper bowl', carpet: 'Great woven blanket', screen: 'Painted house screen',
  tapestry: 'Crest blanket', art: 'Great mask', statue: 'House post', jug: 'Copper ewer', bowl: 'Copper bowl' } });

FURN({
  key: 'painted_court_copper_shield', name: 'Copper of the house', culture: 'painted', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['hall', 'court', 'shrine', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['bronze', 'timber', 'nacre'],
  w: 0.7, d: 0.14, h: 1.1, variants: 1,
  build: function (F) {
    const cu = F.col('copper');
    F.box(0, 0, -0.05, 0.1, 1.1, 0.04, 0, F.col('timberCedarDark'), 'wood');
    F.box(0, 0.5, 0.0, 0.66, 0.5, 0.03, 0, cu, 'bronze');                                /* the shield's upper field */
    F.box(0, 0.05, 0.0, 0.5, 0.46, 0.03, 0, F.shade(cu, -0.08), 'bronze');
    F.box(0, 0.5, 0.0, 0.7, 0.04, 0.035, 0, F.shade(cu, -0.25), 'bronze');
    F.box(0, 0.05, 0.016, 0.05, 0.95, 0.01, 0, F.shade(cu, -0.25), 'bronze');
    for (let i = 0; i < 6; i++) { const a = i * 1.05, rr = 0.04 + i * 0.03; F.ball(Math.cos(a) * rr, 0.78 + Math.sin(a) * rr, 0.02, 0.02, F.col('shellAbalone'), 'nacre'); }
    for (const s of [-1, 1]) F.ball(s * 0.18, 0.84, 0.02, 0.03, F.col('shellAbalone'), 'nacre');
  }
});

/* trades and households (FK.ROLES.trade, the 2026-10 interiors-sets pass): forge, anvil, stall, vat, still,
   bins, larder, bunk, locker ... in this culture's style sheet, keyed painted_trade_<role> */
FK.set({ culture: 'painted', tier: 'common', roles: 'trade', prefix: 'painted_trade_', S: PNT_COMMON, names: {
  forge: "Copper-smith's hearth", anvil: 'Stone anvil', trough: 'Cedar trough', stall: 'Cedar stall', hayrack: 'Fodder rack', display: 'Trade steps', armour_stand: 'Slat armour on a post', weapon_rack: 'War-club rack', vat: 'Steaming box', still: 'Smoke-pot still', bin: 'Bent-box bins', larder: 'Cedar store box', bunk: 'Plank-house bunk', locker: 'Bent-wood chest-press', lathe: 'Bow lathe', press: 'Fish-oil press', kiln: 'Pit kiln', grindstone: 'Whetstone frame', barrel: 'Oil-box rack', altar: 'Crest altar' } });

/* ======== Harvested from settlements/highlands (tribal branch) (26 pieces) ======== */
/* The Painted Men's poles, fires, racks, sacred stones and farm pieces as the Highlands kit draws them
   (src/73-hl-carve.js, 84-tri-dwell.js, 85-tri-village.js, 85b-tri-salvage.js). The kit paints its totems and
   boards with canvas maps (70-hl-tex.js: eagle, bear and frog stacked on cedar; the thunderbird wing; the salmon
   shield); here the same formline colours are carved as relief and colour bands, so they need no texture.
   Kit families: vWood/vPost/hLogX -> wood, hPaint -> wood (painted), hRubB/vRock/vStone -> stone, vIron/hTRBowl ->
   metal, vRustB/vPipeR -> rust, hBamboo -> bamboo, vThatchB/vConeT -> thatch, vLeaf -> plant, vEmber/hTRFlame -> glow. */
FURN({
  key: 'hl_tri_totem', name: 'Totem pole', culture: 'painted', tier: 'common', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'street', 'plaza', 'temple', 'garden'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'cloth', 'bone'], source: 'settlements/highlands/src/73-hl-carve.js hnTotem (+ 85 the shaman\'s spirit poles, hnTRAntlers)',
  w: 3.6, d: 1.18, h: 7.26, variants: 4, variantNames: ['winged, cedar', 'winged, painted ground', 'potlatch rings', 'spirit pole'],
  variantDims: [{ w: 3.46, d: 0.98, h: 5.2 }, { w: 3.62, d: 0.92, h: 5.6 }, { w: 0.84, d: 1.18, h: 7.26 }, { w: 0.96, d: 0.78, h: 5.02 }],
  build: function (F) {
    const v = F.variant, P = [[0.3, 5.2, 1.4, 0], [0.28, 5.6, 1.5, 1], [0.36, 6.8, 0, 0], [0.2, 4, 0, 1]][v] || [0.3, 5.2, 1.4, 0];
    const r = P[0], h = P[1], W = P[2], ground = P[3] ? F.col('formGround') : F.col('formCedar');
    const back = v === 3 ? -0.3 : -r;
    F.shift(0, -(2.2 * r + back) / 2);
    const blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite'), teal = F.col('formTeal');
    /* the carved column: eagle over bear over frog, a black line between them */
    F.cyl(0, 0, 0, r, h, 0, ground, 'wood');
    const H = h / 3;
    for (const y of [H, 2 * H]) F.cyl(0, y - 0.02, 0, r * 1.03, 0.04, 0, blk, 'wood');
    const eye = (x, y, er, ringC) => { if (ringC) F.ball(x, y, 0.93 * r, er * 1.25, ringC, 'wood'); F.ball(x, y, 0.97 * r, er, wht, 'wood'); F.ball(x, y, 1.08 * r, er * 0.5, blk, 'wood'); };
    let yc = 2.5 * H;                                                                     /* EAGLE */
    F.blob(0, yc + 0.2 * H, 0.45 * r, 0.6 * r, 0.4 * H, 0, blk, 'wood');
    for (const s of [-1, 1]) { eye(s * 0.3 * r, yc + 0.24 * H, 0.14 * r); F.blob(s * 0.62 * r, yc - 0.12 * H, 0.3 * r, 0.42 * r, 0.5 * H, 0, blk, 'wood'); }
    F.beam(0, yc + 0.12 * H, 0.95 * r, 0, yc - 0.26 * H, 1.12 * r, 0.26 * r, 0.2 * r, F.col('formOchre'), 'wood');
    F.blob(0, yc - 0.36 * H, 0.7 * r, 0.3 * r, 0.16 * H, 0, red, 'wood');
    F.rod(0, h * 0.86, 0.9 * r, 0, h * 0.86, 1.6 * r, 0.3 * r, blk, 'wood');            /* the carved beak */
    F.rod(0, h * 0.86, 1.6 * r, 0, h * 0.86 - 0.1 * r, 2.2 * r, 0.14 * r, blk, 'wood');
    yc = 1.5 * H;                                                                         /* BEAR */
    F.blob(0, yc + 0.08 * H, 0.45 * r, 0.66 * r, 0.52 * H, 0, blk, 'wood');
    for (const s of [-1, 1]) {
      F.ball(s * 0.55 * r, yc + 0.34 * H, 0.45 * r, 0.2 * r, blk, 'wood'); F.ball(s * 0.55 * r, yc + 0.34 * H, 0.62 * r, 0.1 * r, red, 'wood');
      eye(s * 0.3 * r, yc + 0.17 * H, 0.13 * r, red);
      F.blob(s * 0.45 * r, yc - 0.34 * H, 0.75 * r, 0.28 * r, 0.18 * H, 0, blk, 'wood');   /* forepaws and claws */
      for (let k = 0; k < 4; k++) F.box(s * (0.3 + k * 0.1) * r, yc - 0.47 * H, 0.98 * r, 0.05 * r, 0.08 * H, 0.05 * r, 0, wht, 'wood');
    }
    F.blob(0, yc - 0.02 * H, 0.9 * r, 0.3 * r, 0.22 * H, 0, F.col('formMuzzle'), 'wood');
    F.ball(0, yc + 0.05 * H, 1.15 * r, 0.1 * r, blk, 'wood');
    F.blob(0, yc - 0.32 * H, 0.8 * r, 0.22 * r, 0.18 * H, 0, red, 'wood');
    yc = 0.5 * H;                                                                         /* FROG */
    F.blob(0, yc - 0.04 * H, 0.45 * r, 0.66 * r, 0.62 * H, 0, F.col('formFrog'), 'wood');
    for (const s of [-1, 1]) {
      F.ball(s * 0.33 * r, yc + 0.24 * H, 0.9 * r, 0.18 * r, wht, 'wood'); F.ball(s * 0.33 * r, yc + 0.24 * H, 1.05 * r, 0.09 * r, blk, 'wood');
      F.beam(s * 0.5 * r, yc + 0.04 * H, 1.0 * r, 0, yc - 0.04 * H, 1.1 * r, 0.04 * H, 0.05 * r, blk, 'wood');   /* the wide smile */
      F.blob(s * 0.7 * r, 0.22 * H, 0.25 * r, 0.3 * r, 0.3 * H, 0, blk, 'wood');          /* splayed legs */
    }
    F.ball(0, yc - 0.24 * H, 1.0 * r, 0.1 * r, red, 'wood');
    if (W) {                                                                              /* the thunderbird crossarm */
      const wy = h * 0.8;
      for (const s of [-1, 1]) {
        const x0 = s * r * 0.9, x1 = s * (r + W);
        F.beam(x0, wy + W * 0.08, 0, x1, wy + W * 0.16, 0, W * 0.24, 0.05, wht, 'wood');
        F.beam(x0, wy + W * 0.2, 0.02, x1, wy + W * 0.28, 0.02, W * 0.06, 0.06, blk, 'wood');
        for (let i = 0; i < 6; i++) { const fh = W * (0.3 - i * 0.02); F.box(s * (r + (i + 0.5) * W / 6), wy + W * 0.1 - fh + i * W * 0.013, 0, W / 6 * 0.8, fh, 0.05, 0, i % 2 ? red : blk, 'wood'); }
        F.ball(s * (r + W * 0.18), wy + W * 0.12, 0.04, W * 0.05, teal, 'wood');
      }
    }
    if (v === 2) for (let k = 0; k < 3; k++) F.cyl(0, h + k * 0.16, 0, r * (0.9 - 0.12 * k), 0.14, 0, k % 2 ? red : blk, 'wood');   /* potlatch rings */
    if (v === 3) {                                                                        /* antlers, hanging feathers, a ribbon */
      const c = F.col('antler'), y0 = h + 0.05, s = 0.7;
      for (const sd of [-1, 1]) {
        let p = [0, y0, 0];
        for (let k = 0; k < 4; k++) {
          const d = [sd * (0.5 - k * 0.08), 0.55 + k * 0.1, -0.25], L = Math.hypot(d[0], d[1], d[2]);
          const q = [p[0] + d[0] / L * 0.32 * s, p[1] + d[1] / L * 0.32 * s, p[2] + d[2] / L * 0.32 * s];
          F.beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.06 * s * (1 - k * 0.15), 0.06 * s * (1 - k * 0.15), c, 'bone');
          if (k > 0) F.beam(q[0], q[1], q[2], q[0] + sd * 0.111 * 0.28 * s, q[1] + 0.889 * 0.28 * s, q[2] + 0.444 * 0.28 * s, 0.04 * s, 0.04 * s, c, 'bone');
          p = q;
        }
      }
      for (let f = 0; f < 3; f++) { const t = (f - 1) * 0.35, y = h * 0.62 - f * 0.05; F.beam(0, y, 0.22, Math.sin(t) * 0.55, y - Math.cos(t) * 0.55, 0.24, 0.2, 0.02, f === 1 ? blk : wht, 'wood'); }
      F.box(0.3, h - 1.3, 0, 0.18, 1.2, 0.02, 0, F.pick(['formRed', 'formTeal', 'formWhite', 'formOchre']), 'cloth');
    }
  }
});

FURN({
  key: 'hl_tri_great_totem', name: 'Great winged totem', culture: 'painted', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['plaza', 'court', 'temple', 'street'], anchor: 'floor', clearance: { front: 1.5 },
  materials: ['timber'], source: 'settlements/highlands/src/73-hl-carve.js hnTotem (the longhouse stair, the warrior hall\'s gate and corners)',
  w: 5.82, d: 1.46, h: 9.0, variants: 2, variantNames: ['painted, at the great stair', 'cedar war totem'],
  variantDims: [{ w: 5.82, d: 1.46, h: 9.0 }, { w: 3.98, d: 1.11, h: 6.5 }],
  build: function (F) {
    const v = F.variant, r = v ? 0.34 : 0.45, h = v ? 6.5 : 9, W = v ? 1.6 : 2.4, ground = v ? F.col('formCedar') : F.col('formGround');
    F.shift(0, -(2.2 * r - r) / 2);
    const blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite'), teal = F.col('formTeal');
    F.cyl(0, 0, 0, r, h, 0, ground, 'wood');
    const H = h / 3;
    for (const y of [H, 2 * H]) F.cyl(0, y - 0.02, 0, r * 1.03, 0.04, 0, blk, 'wood');
    const eye = (x, y, er, ringC) => { if (ringC) F.ball(x, y, 0.93 * r, er * 1.25, ringC, 'wood'); F.ball(x, y, 0.97 * r, er, wht, 'wood'); F.ball(x, y, 1.08 * r, er * 0.5, blk, 'wood'); };
    let yc = 2.5 * H;                                                                     /* EAGLE */
    F.blob(0, yc + 0.2 * H, 0.45 * r, 0.6 * r, 0.4 * H, 0, blk, 'wood');
    for (const s of [-1, 1]) { eye(s * 0.3 * r, yc + 0.24 * H, 0.14 * r); F.blob(s * 0.62 * r, yc - 0.12 * H, 0.3 * r, 0.42 * r, 0.5 * H, 0, blk, 'wood'); }
    F.beam(0, yc + 0.12 * H, 0.95 * r, 0, yc - 0.26 * H, 1.12 * r, 0.26 * r, 0.2 * r, F.col('formOchre'), 'wood');
    F.blob(0, yc - 0.36 * H, 0.7 * r, 0.3 * r, 0.16 * H, 0, red, 'wood');
    F.rod(0, h * 0.86, 0.9 * r, 0, h * 0.86, 1.6 * r, 0.3 * r, blk, 'wood');
    F.rod(0, h * 0.86, 1.6 * r, 0, h * 0.86 - 0.1 * r, 2.2 * r, 0.14 * r, blk, 'wood');
    yc = 1.5 * H;                                                                         /* BEAR */
    F.blob(0, yc + 0.08 * H, 0.45 * r, 0.66 * r, 0.52 * H, 0, blk, 'wood');
    for (const s of [-1, 1]) {
      F.ball(s * 0.55 * r, yc + 0.34 * H, 0.45 * r, 0.2 * r, blk, 'wood'); F.ball(s * 0.55 * r, yc + 0.34 * H, 0.62 * r, 0.1 * r, red, 'wood');
      eye(s * 0.3 * r, yc + 0.17 * H, 0.13 * r, red);
      F.blob(s * 0.45 * r, yc - 0.34 * H, 0.75 * r, 0.28 * r, 0.18 * H, 0, blk, 'wood');
      for (let k = 0; k < 4; k++) F.box(s * (0.3 + k * 0.1) * r, yc - 0.47 * H, 0.98 * r, 0.05 * r, 0.08 * H, 0.05 * r, 0, wht, 'wood');
    }
    F.blob(0, yc - 0.02 * H, 0.9 * r, 0.3 * r, 0.22 * H, 0, F.col('formMuzzle'), 'wood');
    F.ball(0, yc + 0.05 * H, 1.15 * r, 0.1 * r, blk, 'wood');
    F.blob(0, yc - 0.32 * H, 0.8 * r, 0.22 * r, 0.18 * H, 0, red, 'wood');
    yc = 0.5 * H;                                                                         /* FROG */
    F.blob(0, yc - 0.04 * H, 0.45 * r, 0.66 * r, 0.62 * H, 0, F.col('formFrog'), 'wood');
    for (const s of [-1, 1]) {
      F.ball(s * 0.33 * r, yc + 0.24 * H, 0.9 * r, 0.18 * r, wht, 'wood'); F.ball(s * 0.33 * r, yc + 0.24 * H, 1.05 * r, 0.09 * r, blk, 'wood');
      F.beam(s * 0.5 * r, yc + 0.04 * H, 1.0 * r, 0, yc - 0.04 * H, 1.1 * r, 0.04 * H, 0.05 * r, blk, 'wood');
      F.blob(s * 0.7 * r, 0.22 * H, 0.25 * r, 0.3 * r, 0.3 * H, 0, blk, 'wood');
    }
    F.ball(0, yc - 0.24 * H, 1.0 * r, 0.1 * r, red, 'wood');
    const wy = h * (v ? 0.8 : 0.84);                                                      /* the thunderbird crossarm */
    for (const s of [-1, 1]) {
      const x0 = s * r * 0.9, x1 = s * (r + W);
      F.beam(x0, wy + W * 0.08, 0, x1, wy + W * 0.16, 0, W * 0.24, 0.05, wht, 'wood');
      F.beam(x0, wy + W * 0.2, 0.02, x1, wy + W * 0.28, 0.02, W * 0.06, 0.06, blk, 'wood');
      for (let i = 0; i < 6; i++) { const fh = W * (0.3 - i * 0.02); F.box(s * (r + (i + 0.5) * W / 6), wy + W * 0.1 - fh + i * W * 0.013, 0, W / 6 * 0.8, fh, 0.05, 0, i % 2 ? red : blk, 'wood'); }
      F.ball(s * (r + W * 0.18), wy + W * 0.12, 0.04, W * 0.05, teal, 'wood');
    }
  }
});

FURN({
  key: 'hl_tri_totem_post', name: 'Carved totem post', culture: 'painted', tier: 'common', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'street', 'garden', 'temple'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'stone'], source: 'settlements/highlands/src/73-hl-carve.js hnTotemPost',
  w: 0.94, d: 0.94, h: 5.38, variants: 3, variantNames: ['cedar', 'painted ground', 'great door post'],
  variantDims: [{ w: 0.42, d: 0.42, h: 2.98 }, { w: 0.42, d: 0.42, h: 2.98 }, { w: 0.94, d: 0.94, h: 5.38 }],
  build: function (F) {
    const v = F.variant, r = v === 2 ? 0.36 : 0.16, h = v === 2 ? 5.2 : 2.8, ground = v ? F.col('formGround') : F.col('formCedar');
    const blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite');
    F.box(0, 0, 0, r * 2.4, 0.12, r * 2.4, 0, F.col('stoneRubble'), 'stone');             /* the footing stone */
    F.cyl(0, 0, 0, r, h, 0, ground, 'wood');
    const H = h / 3;
    for (const y of [H, 2 * H]) F.cyl(0, y - 0.02, 0, r * 1.03, 0.04, 0, blk, 'wood');
    /* the three figures, carved small: eagle, bear, frog */
    let yc = 2.5 * H;
    F.blob(0, yc + 0.15 * H, 0.45 * r, 0.6 * r, 0.45 * H, 0, blk, 'wood');
    F.beam(0, yc + 0.08 * H, 0.95 * r, 0, yc - 0.3 * H, 1.12 * r, 0.26 * r, 0.2 * r, F.col('formOchre'), 'wood');
    yc = 1.5 * H;
    F.blob(0, yc + 0.08 * H, 0.45 * r, 0.66 * r, 0.52 * H, 0, blk, 'wood');
    F.blob(0, yc - 0.02 * H, 0.9 * r, 0.3 * r, 0.22 * H, 0, F.col('formMuzzle'), 'wood');
    F.blob(0, yc - 0.32 * H, 0.8 * r, 0.22 * r, 0.18 * H, 0, red, 'wood');
    yc = 0.5 * H;
    F.blob(0, yc - 0.04 * H, 0.45 * r, 0.66 * r, 0.62 * H, 0, F.col('formFrog'), 'wood');
    for (const s of [-1, 1]) for (const [y, er] of [[2.74 * H, 0.14], [1.67 * H, 0.13], [0.74 * H, 0.17]]) {
      F.ball(s * 0.3 * r, y, 0.97 * r, er * r, wht, 'wood'); F.ball(s * 0.3 * r, y, 1.08 * r, er * 0.5 * r, blk, 'wood');
    }
    F.box(0, h - 0.02, 0, r * 2.6, 0.2, r * 2.6, 0, blk, 'wood');                          /* the painted cap */
  }
});

FURN({
  key: 'hl_tri_menhir', name: 'Standing stone', culture: 'painted', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['temple', 'graveyard', 'plaza', 'garden'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'timber'], source: 'settlements/highlands/src/73-hl-carve.js hnMenhir (the stone circle)',
  w: 1.54, d: 1.1, h: 3.2, variants: 3, variantNames: ['plain', 'carved', 'avenue stone'],
  variantDims: [{ w: 1.44, d: 1.02, h: 3.0 }, { w: 1.54, d: 1.1, h: 3.2 }, { w: 0.58, d: 0.41, h: 1.2 }],
  build: function (F) {
    const v = F.variant, H = [3.0, 3.2, 1.2][v] || 3, c = F.shade('stoneRubble', F.rr(-0.25, 0));
    /* a slab-like standing stone: two tapering masses side by side, rounded off at the top */
    for (const sx of [-1, 1]) {
      F.frustum(sx * 0.07 * H, 0, 0, 0.17 * H, 0.14 * H, 0.72 * H, F.rr(-0.3, 0.3), F.shade(c, F.rr(-0.05, 0.05)), 'stone', 7);
      F.blob(sx * 0.06 * H, 0.72 * H, 0, 0.14 * H, 0.56 * H, F.rr(0, 3), F.shade(c, F.rr(-0.05, 0.05)), 'stone');
    }
    if (v === 1) {                                                                        /* the carved face: a painted formline board */
      const z = 0.155 * H, bw = 0.26 * H, bh = 0.6 * H, y0 = 0.25 * H;
      F.box(0, y0, z, bw, bh, 0.02, 0, F.col('formBlack'), 'wood');
      F.box(0, y0 + 0.03, z + 0.01, bw - 0.06, bh - 0.06, 0.02, 0, F.col('formCedar'), 'wood');
      F.rod(0, y0 + bh * 0.72, z + 0.02, 0, y0 + bh * 0.72, z + 0.03, bw * 0.3, F.col('formBlack'), 'wood');
      F.rod(0, y0 + bh * 0.72, z + 0.03, 0, y0 + bh * 0.72, z + 0.04, bw * 0.15, F.col('formTeal'), 'wood');
      for (let k = 0; k < 2; k++) {
        const y = y0 + bh * (0.2 + k * 0.22), cc = k ? F.col('formBlack') : F.col('formRed');
        F.box(0, y, z + 0.025, bw * 0.6, 0.04, 0.02, 0, cc, 'wood');
        for (const s of [-1, 1]) F.box(s * bw * 0.27, y, z + 0.025, 0.04, bh * 0.14, 0.02, 0, cc, 'wood');
      }
    }
  }
});

FURN({
  key: 'hl_tri_firepit', name: 'Ring-stone fire pit', culture: 'painted', tier: 'poor', type: 'stove', setting: 'outdoor',
  rooms: ['yard', 'plaza', 'garden', 'temple'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['stone', 'timber', 'emissive', 'metal'], source: 'settlements/highlands/src/73-hl-carve.js hnFirepit (+ 85 the shaman\'s tripod pot)',
  w: 2.1, d: 2.1, h: 1.52, variants: 3, variantNames: ['hut fire', 'hall fire', 'with tripod and pot'],
  variantDims: [{ w: 1.5, d: 1.5, h: 0.37 }, { w: 2.1, d: 2.1, h: 0.37 }, { w: 1.6, d: 1.6, h: 1.52 }],
  build: function (F) {
    const v = F.variant, r = [0.5, 0.8, 0.55][v] || 0.5;
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * F.TAU;
      F.blob(Math.cos(a) * r, 0.18, Math.sin(a) * r, 0.24, 0.36, a, F.shade('stoneRubble', F.rr(-0.15, 0.05)), 'stone');
    }
    for (let k = 0; k < 4; k++) {                                                         /* the logs, laid in a star */
      const a = k * 0.8, L = r * 0.7;
      F.rod(-Math.cos(a) * L, 0.12, Math.sin(a) * L, Math.cos(a) * L, 0.12, -Math.sin(a) * L, 0.07, F.shade('timberTar', -0.2), 'wood');
    }
    F.blob(0, 0.14, 0, r * 0.3, 0.24, 0, F.col('ember'), 'glow');
    F.cone(0, 0.12, 0, r * 0.18, 0.16, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.4, 0, 0.7, 6);
    if (v === 2) {
      for (let k = 0; k < 3; k++) { const a = k / 3 * F.TAU; F.rod(Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7, 0, 1.5, 0, 0.02, F.col('ironBlack'), 'metal'); }
      F.rod(0, 1.5, 0, 0, 0.98, 0, 0.01, F.col('ironBlack'), 'metal');
      F.blob(0, 0.75, 0, 0.28, 0.48, 0, F.col('ironBlack'), 'metal');                     /* the pot */
    }
  }
});

FURN({
  key: 'hl_tri_brazier', name: 'Tripod brazier', culture: 'painted', tier: 'court', type: 'brazier', setting: 'both',
  rooms: ['hall', 'court', 'temple', 'plaza', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'emissive'], source: 'settlements/highlands/src/84-tri-dwell.js hnTRBrazier',
  w: 1.0, d: 1.0, h: 2.09, variants: 2, variantNames: ['by the door', 'at the great stair'],
  variantDims: [{ w: 0.76, d: 0.76, h: 1.52 }, { w: 1.0, d: 1.0, h: 2.09 }],
  build: function (F) {
    const s = F.variant === 1 ? 1.1 : 0.8, ic = F.col('ironBrazier');
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * F.TAU;
      F.beam(Math.cos(a) * 0.42 * s, 0, Math.sin(a) * 0.42 * s, Math.cos(a) * 0.12 * s, 0.95 * s, Math.sin(a) * 0.12 * s, 0.05 * s, 0.05 * s, ic, 'metal');
    }
    F.frustum(0, 0.89 * s, 0, 0.15 * s, 0.36 * s, 0.18 * s, 0, ic, 'metal', 12);          /* the bowl */
    F.frustum(0, 1.07 * s, 0, 0.36 * s, 0.42 * s, 0.18 * s, 0, ic, 'metal', 12);
    F.blob(0, 1.2 * s, 0, 0.34 * s, 0.2 * s, 0, F.col('ember'), 'glow');
    for (let k = 0; k < 3; k++) F.cone(F.rr(-0.12, 0.12) * s, 1.2 * s, F.rr(-0.12, 0.12) * s, 0.13 * s, F.rr(0.4, 0.7) * s, 0, F.col('flame'), 'glow');
    F.lamp(0, 1.5 * s, 0, 0.9, 7);
  }
});

FURN({
  key: 'hl_tri_trophy_horns', name: 'Trophy horns', culture: 'painted', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'barracks', 'antechamber', 'court', 'shrine'], anchor: 'wall', clearance: {},
  materials: ['bone', 'timber'], source: 'settlements/highlands/src/84-tri-dwell.js hnTRHorns',
  w: 2.0, d: 0.34, h: 2.3, variants: 2, variantNames: ['gate post', 'gable apex'],
  variantDims: [{ w: 1.1, d: 0.19, h: 1.24 }, { w: 2.0, d: 0.34, h: 2.3 }],
  build: function (F) {
    const s = F.variant === 1 ? 1.3 : 0.7, y = 0.25 * s, z = 0;
    const bone = F.col('boneHorn');
    for (const sd of [-1, 1]) {
      let px = 0, py = 0, dx = sd * 0.9, dy = 0.25, w = 0.2 * s;
      for (let k = 0; k < 5; k++) {
        dx *= 0.82; dy += 0.35;
        const L = Math.hypot(dx, dy), qx = px + dx / L * 0.34 * s, qy = py + dy / L * 0.34 * s;
        F.beam(px, y + py, z, qx, y + qy, z, w, w, F.shade(bone, -0.06 * k), 'bone');
        px = qx; py = qy; w *= 0.78;
      }
    }
    F.box(0, y - 0.25 * s, z, 0.3 * s, 0.3 * s, 0.22 * s, 0, F.col('formRed'), 'wood');   /* the painted boss */
    F.box(0, y - 0.19 * s, z, 0.18 * s, 0.18 * s, 0.26 * s, 0, F.col('formBlack'), 'wood');
  }
});

FURN({
  key: 'hl_tri_antler_pole', name: 'Antler pole', culture: 'painted', tier: 'common', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'temple', 'street', 'plaza'], anchor: 'floor', clearance: {},
  materials: ['timber', 'bone'], source: 'settlements/highlands/src/85b-tri-salvage.js buildHlTriHullHall (antler poles, hnTRAntlers)',
  w: 1.42, d: 0.52, h: 5.66, variants: 1,
  build: function (F) {
    F.shift(0, 0.18);
    F.cyl(0, 0, 0, 0.08, 4.2, 0, F.col('timberAged'), 'wood');
    const c = F.col('antler'), y0 = 4.2, s = 1.1;
    for (const sd of [-1, 1]) {
      let p = [0, y0, 0];
      for (let k = 0; k < 4; k++) {
        const d = [sd * (0.5 - k * 0.08), 0.55 + k * 0.1, -0.25], L = Math.hypot(d[0], d[1], d[2]);
        const q = [p[0] + d[0] / L * 0.32 * s, p[1] + d[1] / L * 0.32 * s, p[2] + d[2] / L * 0.32 * s];
        F.beam(p[0], p[1], p[2], q[0], q[1], q[2], 0.06 * s * (1 - k * 0.15), 0.06 * s * (1 - k * 0.15), c, 'bone');
        if (k > 0) F.beam(q[0], q[1], q[2], q[0] + sd * 0.111 * 0.28 * s, q[1] + 0.889 * 0.28 * s, q[2] + 0.444 * 0.28 * s, 0.04 * s, 0.04 * s, c, 'bone');
        p = q;
      }
    }
  }
});

FURN({
  key: 'hl_tri_gourd', name: 'Hanging gourd', culture: 'painted', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['hall', 'kitchen', 'store', 'cottage', 'yard'], anchor: 'ceiling', clearance: {},
  materials: ['wicker', 'rope', 'timber'], source: 'settlements/highlands/src/84-tri-dwell.js hnTRGourd',
  w: 0.3, d: 0.3, h: 0.7, variants: 1,
  build: function (F) {
    F.cyl(0, 0.35, 0, 0.01, 0.33, 0, F.col('ropeFibre'), 'rope');
    F.box(0, 0.67, 0, 0.08, 0.03, 0.08, 0, F.col('timberAged'), 'wood');                  /* the peg it hangs from */
    F.blob(0, 0.2, 0, 0.15, 0.4, 0, F.pick(['gourd', 'gourdOlive', 'gourdPale']), 'wicker');
    F.ball(0, 0.4, 0, 0.04, F.shade('gourd', -0.3), 'wicker');
  }
});

FURN({
  key: 'hl_tri_fire_cage', name: 'Hanging fire cage', culture: 'painted', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'yard', 'street', 'shrine', 'cottage'], anchor: 'ceiling', clearance: {},
  materials: ['bamboo', 'timber', 'rope', 'emissive'], source: 'settlements/highlands/src/84-tri-dwell.js hnTRCage',
  w: 0.3, d: 0.3, h: 0.8, variants: 1,
  build: function (F) {
    const blk = F.col('formBlack'), bm = F.col('bamboo');
    F.cyl(0, 0.5, 0, 0.01, 0.28, 0, F.col('ropeFibre'), 'rope');
    F.box(0, 0.77, 0, 0.08, 0.03, 0.08, 0, F.col('timberAged'), 'wood');                  /* the peg it hangs from */
    F.box(0, 0.46, 0, 0.3, 0.05, 0.3, 0, blk, 'wood');
    F.box(0, 0, 0, 0.3, 0.05, 0.3, 0, blk, 'wood');
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) F.cyl(a * 0.13, 0.02, b * 0.13, 0.016, 0.44, 0, bm, 'bamboo');
    F.blob(0, 0.18, 0, 0.08, 0.2, 0, F.col('ember'), 'glow');
    F.lamp(0, 0.2, 0, 0.5, 4);
  }
});

FURN({
  key: 'hl_tri_shield_rail', name: 'War-shield rail', culture: 'painted', tier: 'court', type: 'rack', setting: 'both',
  rooms: ['hall', 'barracks', 'court', 'antechamber'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriWarriorHall (shields racked along the front)',
  w: 5.8, d: 0.2, h: 1.94, variants: 2, variantNames: ['three shields', 'five shields'],
  variantDims: [{ w: 3.5, d: 0.2, h: 1.94 }, { w: 5.8, d: 0.2, h: 1.94 }],
  build: function (F) {
    const n = F.variant === 1 ? 5 : 3, L = n * 1.15, aged = F.col('timberAged'), zb = -0.1;
    for (const s of [-1, 1]) F.box(s * (L / 2 - 0.08), 0, zb + 0.04, 0.08, 1.92, 0.08, 0, F.shade(aged, -0.15), 'wood');   /* the end posts */
    F.rod(-L / 2, 1.85, zb + 0.07, L / 2, 1.85, zb + 0.07, 0.07, aged, 'wood');            /* the rail */
    const blk = F.col('formBlack'), red = F.col('formRed');
    for (let k = 0; k < n; k++) {
      const x = -L / 2 + 0.575 + k * 1.15, y = 1.45, r = 0.47, z0 = zb + 0.12;
      const field = F.pick(['formWhite', 'shieldPeach', 'shieldMint', 'shieldButter', 'shieldRose']);
      F.rod(x, y, z0, x, y, z0 + 0.02, r, blk, 'wood');                                   /* black rim */
      F.rod(x, y, z0 + 0.02, x, y, z0 + 0.03, r * 0.88, field, 'wood');
      F.rod(x, y, z0 + 0.03, x, y, z0 + 0.035, r * 0.81, red, 'wood');                   /* red ring */
      F.rod(x, y, z0 + 0.035, x, y, z0 + 0.04, r * 0.75, field, 'wood');
      F.beam(x + 0.32 * r, y + 0.44 * r, z0 + 0.045, x - 0.4 * r, y - 0.48 * r, z0 + 0.045, 0.24 * r, 0.01, blk, 'wood');   /* the coiled salmon */
      F.ball(x + 0.26 * r, y + 0.34 * r, z0 + 0.05, 0.06 * r, F.col('formWhite'), 'wood');
      F.ball(x - 0.4 * r, y + 0.48 * r, z0 + 0.045, 0.1 * r, F.col('formTeal'), 'wood');
    }
  }
});

FURN({
  key: 'hl_tri_spear_rack', name: 'Spear rack', culture: 'painted', tier: 'court', type: 'weapon', setting: 'both',
  rooms: ['barracks', 'yard', 'court', 'hall'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'metal'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriWarriorHall (spear racks by the sparring ring)',
  w: 2.98, d: 0.46, h: 2.96, variants: 1,
  build: function (F) {
    F.shift(0, -0.11);
    const aged = F.col('timberAged');
    for (const s of [-1, 1]) F.cyl(s * 1.4, 0, 0, 0.08, 1.8, 0, aged, 'wood');
    F.rod(-1.5, 1.7, 0, 1.5, 1.7, 0, 0.06, aged, 'wood');
    for (let k = 0; k < 6; k++) {
      const x = -1.2 + k * 0.48;
      F.rod(x, 0, 0.33, x, 2.68, -0.05, 0.025, aged, 'wood');
      F.cone(x, 2.66, -0.06, 0.05, 0.26, 0, F.col('ironSpear'), 'metal');
    }
  }
});

FURN({
  key: 'hl_tri_trophy_pole', name: 'Trophy pole', culture: 'painted', tier: 'court', type: 'monument', setting: 'outdoor',
  rooms: ['yard', 'court', 'plaza'], anchor: 'floor', clearance: {},
  materials: ['timber', 'bone'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriWarriorHall (trophy pole)',
  w: 1.2, d: 1.2, h: 7.0, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.14, 6.5, 0, F.col('timberAged'), 'wood');
    const bone = F.col('boneHorn'), s = 0.7;
    for (let j = 0; j < 4; j++) {                                                         /* four pairs, turned round the pole */
      const y = 2.6 + j * 1.1, ry = j * 0.9, c = Math.cos(ry), sn = Math.sin(ry), ox = 0.1 * sn, oz = 0.1 * c;
      const P = (u) => [ox + u * c, oz - u * sn];
      for (const sd of [-1, 1]) {
        let px = 0, py = 0, dx = sd * 0.9, dy = 0.25, w = 0.2 * s;
        for (let k = 0; k < 5; k++) {
          dx *= 0.82; dy += 0.35;
          const L = Math.hypot(dx, dy), qx = px + dx / L * 0.34 * s, qy = py + dy / L * 0.34 * s, a = P(px), b = P(qx);
          F.beam(a[0], y + py, a[1], b[0], y + qy, b[1], w, w, F.shade(bone, -0.06 * k), 'bone');
          px = qx; py = qy; w *= 0.78;
        }
      }
      F.box(ox, y - 0.25 * s, oz, 0.3 * s, 0.3 * s, 0.22 * s, ry, F.col('formRed'), 'wood');
      F.box(ox, y - 0.19 * s, oz, 0.18 * s, 0.18 * s, 0.26 * s, ry, F.col('formBlack'), 'wood');
    }
  }
});

FURN({
  key: 'hl_tri_herb_rack', name: 'Herb-drying rack', culture: 'painted', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['yard', 'garden', 'kitchen', 'store', 'shrine'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'rope', 'foliage'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriShaman (herbs drying)',
  w: 3.68, d: 0.26, h: 2.2, variants: 1,
  build: function (F) {
    const aged = F.col('timberAged');
    for (const s of [-1, 1]) F.cyl(s * 1.6, 0, 0, 0.07, 2.2, 0, aged, 'wood');
    F.beam(-1.8, 2.1, 0, 1.8, 2.1, 0, 0.07, 0.07, aged, 'wood');
    for (let k = 0; k < 9; k++) {
      const x = -1.4 + k * 0.35;
      F.cyl(x, 1.75, 0, 0.01, 0.35, 0, F.col('ropeFibre'), 'rope');
      F.blob(x, 1.55, 0, 0.12, 0.6, F.rr(0, 3), F.pick(['herbGreen', 'herbOlive', 'herbDark', 'herbStraw']), 'plant');
    }
  }
});

FURN({
  key: 'hl_tri_stone_altar', name: 'Stone table altar', culture: 'painted', tier: 'court', type: 'altar', setting: 'outdoor',
  rooms: ['temple', 'shrine', 'graveyard'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['stone', 'timber', 'bone', 'wicker'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriStoneCircle (table altar)',
  w: 2.6, d: 1.32, h: 2.44, variants: 1,
  build: function (F) {
    const rub = F.col('stoneRubble');
    for (const s of [-1, 1]) F.box(s * 0.85, 0, 0, 0.55, 0.85, 0.9, 0, F.shade(rub, F.rr(-0.1, 0)), 'stone');
    F.box(0, 0.85, 0, 2.6, 0.28, 1.3, 0, F.shade(rub, -0.05), 'stone');                    /* the table slab */
    /* the crest board between the legs: a pair of salmon on cedar */
    F.box(0, 0.02, 0.5, 1.4, 0.7, 0.03, 0, F.col('formCedar'), 'wood');
    for (const s of [-1, 1]) {
      F.beam(s * 0.08, 0.55, 0.52, s * 0.55, 0.12, 0.52, 0.12, 0.02, F.col('formRed'), 'wood');
      F.ball(s * 0.12, 0.55, 0.53, 0.04, F.col('formBlack'), 'wood');
      F.ball(s * 0.6, 0.6, 0.52, 0.04, F.col('formTeal'), 'wood');
    }
    F.box(0, 0.02, 0.52, 1.4, 0.04, 0.02, 0, F.col('formBlack'), 'wood');
    /* trophy horns on the slab, gourds of offerings */
    const s = 0.7, y = 1.35, z = -0.3, bone = F.col('boneHorn');
    for (const sd of [-1, 1]) {
      let px = 0, py = 0, dx = sd * 0.9, dy = 0.25, w = 0.2 * s;
      for (let k = 0; k < 5; k++) {
        dx *= 0.82; dy += 0.35;
        const L = Math.hypot(dx, dy), qx = px + dx / L * 0.34 * s, qy = py + dy / L * 0.34 * s;
        F.beam(px, y + py, z, qx, y + qy, z, w, w, F.shade(bone, -0.06 * k), 'bone');
        px = qx; py = qy; w *= 0.78;
      }
    }
    F.box(0, y - 0.25 * s, z, 0.3 * s, 0.3 * s, 0.22 * s, 0, F.col('formRed'), 'wood');
    F.box(0, y - 0.19 * s, z, 0.18 * s, 0.18 * s, 0.26 * s, 0, F.col('formBlack'), 'wood');
    for (let j = 0; j < 3; j++) F.blob(-0.8 + j * 0.4, 1.25, 0.2, 0.12, 0.24, 0, F.col('gourdDark'), 'wicker');
  }
});

FURN({
  key: 'hl_tri_scarecrow', name: 'Painted scarecrow totem', culture: 'painted', tier: 'poor', type: 'statue', setting: 'outdoor',
  rooms: ['garden', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'stone', 'cloth', 'bone'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriFarm (scarecrow totem)',
  w: 3.22, d: 0.46, h: 3.52, variants: 1,
  build: function (F) {
    const r = 0.16, h = 2.6, blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite');
    F.box(0, 0, 0, r * 2.4, 0.12, r * 2.4, 0, F.col('stoneRubble'), 'stone');
    F.cyl(0, 0, 0, r, h, 0, F.col('formGround'), 'wood');                                /* a painted post: bands and eyes */
    for (let k = 1; k < 3; k++) F.cyl(0, k * h / 3 - 0.02, 0, r * 1.03, 0.04, 0, blk, 'wood');
    for (let k = 0; k < 3; k++) {
      F.cyl(0, (k + 0.15) * h / 3, 0, r * 1.02, h / 3 * 0.25, 0, k === 1 ? F.col('formFrog') : red, 'wood');
      for (const s of [-1, 1]) F.ball(s * 0.3 * r, (k + 0.7) * h / 3, 0.93 * r, 0.18 * r, wht, 'wood');
    }
    F.box(0, h - 0.02, 0, r * 2.6, 0.2, r * 2.6, 0, blk, 'wood');
    F.rod(-1.1, 2.1, 0, 1.1, 2.1, 0, 0.06, F.col('timberHatch'), 'wood');                 /* the arms, spread as wings */
    for (const s of [-1, 1]) {
      F.beam(s * 0.2, 2.1, 0.05, s * 1.6, 2.2, 0.05, 0.22, 0.04, wht, 'wood');
      for (let i = 0; i < 5; i++) F.box(s * (0.35 + i * 0.27), 1.78 + i * 0.02, 0.05, 0.2, 0.3, 0.03, 0, i % 2 ? red : blk, 'wood');
    }
    F.box(0, 0.8, 0.2, 0.8, 1.0, 0.02, 0, F.col('formRed'), 'cloth');                      /* the red cloth */
    const s = 0.5, y = 2.75, z = 0.1, bone = F.col('boneHorn');
    for (const sd of [-1, 1]) {
      let px = 0, py = 0, dx = sd * 0.9, dy = 0.25, w = 0.2 * s;
      for (let k = 0; k < 5; k++) {
        dx *= 0.82; dy += 0.35;
        const L = Math.hypot(dx, dy), qx = px + dx / L * 0.34 * s, qy = py + dy / L * 0.34 * s;
        F.beam(px, y + py, z, qx, y + qy, z, w, w, F.shade(bone, -0.06 * k), 'bone');
        px = qx; py = qy; w *= 0.78;
      }
    }
    F.box(0, y - 0.25 * s, z, 0.3 * s, 0.3 * s, 0.22 * s, 0, red, 'wood');
  }
});

FURN({
  key: 'hl_tri_field_shelter', name: 'Thatched field shelter', culture: 'painted', tier: 'poor', type: 'shelter', setting: 'outdoor',
  rooms: ['garden', 'yard', 'market'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['bamboo', 'thatch', 'cloth', 'timber'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriFarm (field shelter)',
  w: 3.4, d: 3.0, h: 3.7, variants: 1,
  build: function (F) {
    const bam = F.col('bamboo'), th = F.col('thatch');
    for (const s of [-1, 1]) for (const t of [-1, 1]) F.cyl(s * 1.3, 0, t * 1.1, 0.08, 2.2, 0, bam, 'bamboo');
    /* the thatch gable, ridge along x, open ends */
    const y0 = 2.2, rise = 1.2, d = 2.4, over = 0.3, ext = d / 2 + over, drop = rise * over / (d / 2), tk = 0.24;
    for (const s of [-1, 1]) F.beam(0, y0 + rise + tk / 2, -s * 0.08, 0, y0 - drop + tk / 2, s * ext, 2.8 + 2 * over, tk, th, 'thatch');
    for (const s of [-1, 1]) F.rod(-1.4, y0, s * 1.1, 1.4, y0, s * 1.1, 0.05, bam, 'bamboo');
    for (let i = 0; i < 3; i++) F.blob(F.rr(-0.5, 0.5), 0.32, F.rr(-0.4, 0.5), 0.34, 0.64, F.rr(0, 3), F.col('sackBurlap'), 'cloth');
    F.box(-0.5, 0, -0.4, 1.2, 0.45, 0.45, 0, F.col('timberBench'), 'wood');
  }
});

FURN({
  key: 'hl_tri_log_trough', name: 'Hollow-log trough', culture: 'painted', tier: 'poor', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'stable'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriPen (hollow-log trough)',
  w: 3.0, d: 0.5, h: 0.52, variants: 1,
  build: function (F) {
    F.rod(-1.5, 0.25, 0, 1.5, 0.25, 0, 0.25, F.col('timberAged'), 'wood');
    F.box(0, 0.36, 0, 2.7, 0.16, 0.3, 0, F.col('hollowDark'), 'wood');                    /* the hollow */
  }
});

FURN({
  key: 'hl_tri_haycock', name: 'Haycock', culture: 'painted', tier: 'poor', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'stable', 'garden'], anchor: 'floor', clearance: {},
  materials: ['thatch'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriFarmhouse / buildHlTriPen (hay)',
  w: 2.4, d: 2.4, h: 1.4, variants: 2, variantNames: ['byre', 'pen'],
  variantDims: [{ w: 1.8, d: 1.8, h: 1.1 }, { w: 2.4, d: 2.4, h: 1.4 }],
  build: function (F) {
    const big = F.variant === 1;
    F.cone(0, 0, 0, big ? 1.2 : 0.9, big ? 1.4 : 1.1, F.rr(0, 3), F.shade('hay', F.rr(-0.08, 0.04)), 'thatch');
  }
});

FURN({
  key: 'hl_tri_grain_mortar', name: 'Grain mortar and pestle', culture: 'painted', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['yard', 'kitchen', 'store'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriGranary (mortar by the threshing floor)',
  w: 0.6, d: 0.72, h: 1.8, variants: 1,
  build: function (F) {
    F.shift(0, -0.05);
    const log = F.col('timberAged');
    F.cyl(0, 0, 0, 0.3, 0.6, 0, log, 'wood');
    F.cyl(0, 0.59, 0, 0.22, 0.02, 0, F.col('hollowDark'), 'wood');
    F.rod(0, 0.45, -0.05, 0, 1.746, 0.355, 0.05, F.shade(log, 0.1), 'wood');              /* the pestle, leaning in */
  }
});

FURN({
  key: 'hl_tri_forge', name: 'Scrap-iron forge', culture: 'painted', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['smithy', 'workshop'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'rustSteel', 'bamboo', 'timber', 'emissive'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriSmithy (hearth, hood, flue, piston bellows) + 85b buildHlTriScrapForge',
  w: 3.1, d: 1.7, h: 3.2, variants: 2, variantNames: ['hearth with piston bellows', 'stacked-plate forge'],
  variantDims: [{ w: 3.02, d: 1.5, h: 3.2 }, { w: 3.1, d: 1.7, h: 3.2 }],
  build: function (F) {
    const rub = F.col('stoneRubble'), rust = F.col('rust');
    if (F.variant === 0) {
      F.shift(-0.505, 0);
      F.box(0, 0, 0, 2, 0.95, 1.5, 0, rub, 'stone');                                       /* the hearth */
      F.box(0, 0.95, 0, 1.4, 0.04, 1, 0, F.col('hollowDark'), 'stone');
      for (let k = 0; k < 6; k++) F.blob(F.rr(-0.5, 0.5), 0.98, F.rr(-0.35, 0.35), F.rr(0.1, 0.18), 0.12, 0, F.col('ember'), 'glow');
      F.cone(0, 0.95, 0, 0.2, 0.5, 0, F.col('flame'), 'glow');
      F.lamp(0, 1.3, 0, 0.8, 6);
      F.box(0, 1.7, -0.1, 1.7, 0.7, 1.2, 0, rust, 'rust');                                 /* hood of rusted plate */
      F.cyl(0, 2.4, -0.2, 0.2, 0.8, 0, F.col('rustDark'), 'rust');                          /* salvage-pipe flue */
      const bam = F.col('bamboo'), log = F.col('timberAged');
      for (const s of [-0.25, 0.25]) { F.cyl(1.6 + s, 0, 0.1, 0.16, 1.3, 0, bam, 'bamboo'); F.cyl(1.6 + s, 1.3, 0.1, 0.03, 0.5, 0, log, 'wood'); }
      F.rod(1.25, 1.82, 0.1, 1.95, 1.82, 0.1, 0.04, log, 'wood');                           /* piston bellows */
      F.beam(1.6, 0.25, 0.1, 0.9, 0.5, 0, 0.08, 0.08, F.col('rustDark'), 'rust');
    } else {
      F.shift(0.6, 0);
      F.box(0, 0, 0, 1.8, 0.9, 1.6, 0, rub, 'stone');
      for (let k = 0; k < 4; k++) F.box(0, 0.9 + k * 0.08, 0, 1.9 - k * 0.15, 0.08, 1.7 - k * 0.15, F.rr(-0.1, 0.1), F.shade(rust, F.rr(-0.1, 0.05)), 'rust');
      F.blob(0, 1.3, 0, 0.4, 0.24, 0, F.col('ember'), 'glow');
      F.lamp(0, 1.5, 0, 0.8, 6);
      F.cyl(0, 1.3, -0.5, 0.18, 1.9, 0, F.col('rustDark'), 'rust');                         /* the stovepipe */
      F.box(-1.7, 0, 0, 0.9, 0.5, 1.2, 0, F.col('timberHatch'), 'wood');                    /* the bellows box */
    }
  }
});

FURN({
  key: 'hl_tri_scrap_anvil', name: 'Scrap anvil', culture: 'painted', tier: 'poor', type: 'workstation', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'rustSteel', 'metal'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriSmithy (anvil of scrap iron on a stump) + 85b buildHlTriScrapForge',
  w: 0.8, d: 0.6, h: 1.08, variants: 2, variantNames: ['on a stump', 'iron post'],
  variantDims: [{ w: 0.8, d: 0.6, h: 0.97 }, { w: 0.7, d: 0.3, h: 1.08 }],
  build: function (F) {
    if (F.variant === 0) {
      F.frustum(0, 0, 0, 0.3, 0.26, 0.55, 0, F.col('timberAged'), 'wood', 8);
      F.box(0, 0.55, 0, 0.6, 0.3, 0.3, 0, F.col('rust'), 'rust');
      F.box(0, 0.85, 0, 0.8, 0.12, 0.34, 0, F.col('rustDark'), 'rust');
    } else {
      const iron = F.col('ironBrazier');
      F.box(0, 0, 0, 0.3, 0.9, 0.3, 0, iron, 'metal');
      F.box(0, 0.9, 0, 0.7, 0.18, 0.28, 0, iron, 'metal');
    }
  }
});

FURN({
  key: 'hl_tri_quench_tub', name: 'Quench tub', culture: 'painted', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['smithy', 'workshop', 'yard'], anchor: 'floor', clearance: {},
  materials: ['timber', 'rustSteel'], source: 'settlements/highlands/src/85-tri-village.js buildHlTriSmithy (quench) + 85b buildHlTriScrapForge (quench trough)',
  w: 1.8, d: 0.9, h: 0.68, variants: 2, variantNames: ['stave tub', 'plank trough'],
  variantDims: [{ w: 0.9, d: 0.9, h: 0.52 }, { w: 1.8, d: 0.6, h: 0.68 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.45, 0.5, 0, F.col('timberAged'), 'wood');
      F.cyl(0, 0.44, 0, 0.4, 0.08, 0, F.col('hollowDark'), 'wood');                       /* dark water */
    } else {
      F.box(0, 0, 0, 1.8, 0.5, 0.6, 0, F.col('timberAged'), 'wood');
      F.box(0, 0.5, 0, 1.6, 0.08, 0.45, 0, F.col('rust'), 'rust');                          /* a plate laid over it */
    }
  }
});

FURN({
  key: 'hl_tri_hearth_bench', name: 'Hearth bench', culture: 'painted', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['hall', 'tavern', 'yard', 'cottage'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], source: 'settlements/highlands/src/85b-tri-salvage.js buildHlTriHullHall (benches round the hearth)',
  w: 3.0, d: 0.4, h: 0.45, variants: 1,
  build: function (F) {
    const c = F.col('timberAged');
    F.box(0, 0.37, 0, 3.0, 0.08, 0.4, 0, F.shade(c, 0.08), 'wood');                       /* the split plank */
    for (const x of [-1.3, 0, 1.3]) F.box(x, 0, 0, 0.16, 0.37, 0.36, 0, F.shade(c, -0.12), 'wood');
  }
});

FURN({
  key: 'hl_tri_spirit_house', name: 'Spirit house shrine', culture: 'painted', tier: 'poor', type: 'shrine', setting: 'outdoor',
  rooms: ['shrine', 'temple', 'graveyard', 'garden'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'thatch', 'wicker', 'bamboo', 'rope', 'emissive'], source: 'settlements/highlands/src/84-tri-dwell.js buildHlTriCliffVillage (the cliff-hung shrine)',
  w: 3.6, d: 3.7, h: 3.8, variants: 1,
  build: function (F) {
    F.shift(0, 0.15);
    const blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite'), Y = 0.2;
    F.box(0, 0, 0, 3.6, 0.2, 3.4, 0, F.col('timberAged'), 'wood');                         /* the platform */
    F.box(0, Y, -0.5, 2.4, 2, 2, 0, F.shade('timberTar', 0.3), 'wood');                    /* the spirit house */
    /* crest board over the door: two salmon on cedar */
    F.box(0, Y + 0.2, 0.52, 2.2, 1.1, 0.03, 0, F.col('formCedar'), 'wood');
    for (const s of [-1, 1]) { F.beam(s * 0.1, Y + 1.05, 0.55, s * 0.95, Y + 0.35, 0.55, 0.18, 0.02, red, 'wood'); F.ball(s * 0.18, Y + 1.0, 0.56, 0.06, blk, 'wood'); }
    for (const s of [-1, 1]) {                                                            /* tall painted boards beside it */
      F.box(s * 0.8, Y + 0.3, 0.53, 0.45, 1.5, 0.03, 0, wht, 'wood');
      F.rod(s * 0.8, Y + 1.5, 0.55, s * 0.8, Y + 1.5, 0.57, 0.16, blk, 'wood');
      F.box(s * 0.8, Y + 0.6, 0.55, 0.3, 0.08, 0.02, 0, red, 'wood');
    }
    /* thatch gable, the gable ends painted red, black barge boards */
    const y0 = Y + 2, rise = 1.3, d = 2, over = 0.5, ext = d / 2 + over, drop = rise * over / (d / 2), tk = 0.24, zc = -0.5;
    for (let i = 0; i < 4; i++) F.box(0, y0 + i * rise / 4, zc, 2.4, rise / 4, d * (1 - (i + 0.5) / 4), 0, red, 'wood');
    for (const s of [-1, 1]) F.beam(0, y0 + rise + tk / 2, zc - s * 0.06, 0, y0 - drop + tk / 2, zc + s * ext, 2.4 + 2 * over, tk, F.col('thatch'), 'thatch');
    for (const ex of [-1.45, 1.45]) for (const s of [-1, 1]) F.beam(ex, y0 + rise + 0.3, zc, ex, y0 - drop + 0.3, zc + s * ext, 0.06, 0.12, blk, 'wood');
    /* two painted posts at the front, gourds of offerings, a fire cage under the eave */
    for (const s of [-1, 1]) {
      const x = s * 1.5, z = 1.2, r = 0.13, h = 2.2;
      F.cyl(x, Y, z, r, h, 0, F.col('formGround'), 'wood');
      for (let k = 0; k < 3; k++) { F.cyl(x, Y + (k + 0.15) * h / 3, z, r * 1.03, h / 12, 0, k === 1 ? F.col('formTeal') : red, 'wood'); F.ball(x, Y + (k + 0.7) * h / 3, z + 0.12, 0.03, wht, 'wood'); }
      F.box(x, Y + h - 0.02, z, r * 2.6, 0.2, r * 2.6, 0, blk, 'wood');
    }
    for (let k = 0; k < 3; k++) F.blob(-0.6 + k * 0.6, Y + 0.12, 1.1, 0.12, 0.24, 0, F.col('gourdDark'), 'wicker');
    F.cyl(0, Y + 1.9, 0.95, 0.01, 0.3, 0, F.col('ropeFibre'), 'rope');
    F.box(0, Y + 1.86, 0.95, 0.3, 0.05, 0.3, 0, blk, 'wood');
    F.box(0, Y + 1.4, 0.95, 0.3, 0.05, 0.3, 0, blk, 'wood');
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) F.cyl(a * 0.13, Y + 1.42, 0.95 + b * 0.13, 0.016, 0.44, 0, F.col('bamboo'), 'bamboo');
    F.blob(0, Y + 1.58, 0.95, 0.08, 0.2, 0, F.col('ember'), 'glow');
    F.lamp(0, Y + 1.6, 0.95, 0.5, 4);
  }
});

FURN({
  key: 'hl_tri_formline_board', name: 'Formline board', culture: 'painted', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'shrine', 'court', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['timber'], source: 'settlements/highlands/src/73-hl-carve.js hnForm (hFormV tall board, hFormA crest board; the shaman\'s and longhouse boards)',
  w: 2.4, d: 0.1, h: 1.9, variants: 2, variantNames: ['tall board', 'crest board'],
  variantDims: [{ w: 0.62, d: 0.1, h: 1.9 }, { w: 2.4, d: 0.1, h: 1.2 }],
  build: function (F) {
    const blk = F.col('formBlack'), red = F.col('formRed'), wht = F.col('formWhite'), teal = F.col('formTeal'), zb = -0.05;
    if (F.variant === 0) {
      const W = 0.62, H = 1.9;
      F.box(0, 0, zb + 0.02, W, H, 0.04, 0, blk, 'wood');
      F.box(0, 0.03, zb + 0.03, W - 0.06, H - 0.06, 0.04, 0, F.pick(['formWhite', 'formCedar']), 'wood');
      const ov = (y, r, c1, c2) => { F.rod(0, y, zb + 0.07, 0, y, zb + 0.08, r, c1, 'wood'); F.rod(0, y, zb + 0.08, 0, y, zb + 0.09, r * 0.55, c2, 'wood'); F.rod(0, y, zb + 0.09, 0, y, zb + 0.1, r * 0.25, blk, 'wood'); };
      ov(H * 0.8, 0.22, blk, wht);                                                        /* ovoid head, eye */
      ov(H * 0.48, 0.18, red, teal);
      for (let k = 0; k < 2; k++) {                                                       /* U-forms below */
        const y = H * (0.12 + k * 0.14), c = k ? blk : red;
        F.box(0, y, zb + 0.08, 0.36, 0.04, 0.02, 0, c, 'wood');
        for (const s of [-1, 1]) F.box(s * 0.16, y, zb + 0.08, 0.04, 0.18, 0.02, 0, c, 'wood');
      }
    } else {
      const W = 2.4, H = 1.2;
      F.box(0, 0, zb + 0.02, W, H, 0.04, 0, F.col('formCedar'), 'wood');
      F.box(0, 0, zb + 0.045, W, 0.06, 0.02, 0, blk, 'wood');
      for (const s of [-1, 1]) {                                                          /* a pair of leaping salmon, heads meeting */
        F.beam(s * 0.15, H * 0.72, zb + 0.06, s * 0.9, H * 0.15, zb + 0.06, 0.26, 0.02, red, 'wood');
        F.rod(s * 0.22, H * 0.7, zb + 0.07, s * 0.22, H * 0.7, zb + 0.08, 0.08, blk, 'wood');
        F.rod(s * 0.22, H * 0.7, zb + 0.08, s * 0.22, H * 0.7, zb + 0.09, 0.04, wht, 'wood');
        F.ball(s * 1.05, H * 0.8, zb + 0.06, 0.07, teal, 'wood');
        F.box(s * 0.62, H * 0.38, zb + 0.07, 0.18, 0.04, 0.02, 0, blk, 'wood');
      }
      F.rod(0, H * 0.86, zb + 0.06, 0, H * 0.86, zb + 0.08, 0.14, blk, 'wood');
      F.rod(0, H * 0.86, zb + 0.08, 0, H * 0.86, zb + 0.09, 0.07, teal, 'wood');
    }
  }
});
