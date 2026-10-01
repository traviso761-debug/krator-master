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
    ceramicTeal: 0x2f8f8a, ceramicCream: 0xe8dcc4, marbleWhite: 0xe8e4dc, marbleVein: 0xc8c0b0,
    /* the Iziz vernacular yard items (settlements/iziz/src/69c-vern-helpers.js, VPAL) */
    timberSawn: 0x9a6a42, timberSawnDark: 0x7a4e30, timberSawnLight: 0xa87a4e, timberGreyPost: 0x8a7a66, ironSoot: 0x2e2a26,
    steelCorrugate: 0x9a9488, sackingTan: 0xb8a080, sackingDark: 0xa89070, sackingPale: 0xc8b898, ropeFlax: 0xb8a888,
    leafVine: 0x3f7a34, leafBright: 0x4f9a3a, leafMoss: 0x2f6a2a, leafSpring: 0x6aa04a,
    clothApricot: 0xf2a24a, clothAmber: 0xd8893c, clothVermilion: 0xc9442a, clothSaffron: 0xe0a030, clothRust: 0xb8552a
  } });
/* END PALETTE */
const IZIZ_COMMON = {
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

/* ======== Harvested from settlements/iziz/src/69c-vern-helpers.js (the vernacular yard items, as vendored into settlements/highlands) (8 pieces) ======== */
/* The Iziz Vernacular's yard kit: the barrels, water butts, crates, sacks, planters, drying lines and electric lamps
   every vernacular builder (Iziz, the Highlands) scatters round its houses. Electric lamps are rich and civic only. */
FURN({
  key: 'iziz_vern_barrel', name: 'Hooped barrel', culture: 'iziz', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['yard', 'store', 'kitchen', 'tavern', 'shop', 'street'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'metal'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnBarrel', w: 0.73, d: 0.73, h: 0.9, variants: 2,
  variantNames: ['Barrel', 'Large barrel'],
  variantDims: [{ w: 0.73, d: 0.73, h: 0.9 }, { w: 0.83, d: 0.83, h: 1.0 }],
  build: function (F) {
    const r = F.variant === 1 ? 0.4 : 0.35, h = F.variant === 1 ? 1.0 : 0.9, c = F.pick(['timberSawn', 'timberSawnDark', 'timberSawnLight']);
    F.frustum(0, 0, 0, r * 0.9, r, h, 0, c, 'wood', 10);
    for (const t of [0.25, 0.78]) F.cyl(0, h * t - 0.025, 0, r * (0.9 + 0.1 * t) + 0.012, 0.05, 0, F.col('ironSoot'), 'metal');
    F.cyl(0, h - 0.01, 0, r * 0.94, 0.01, 0, F.shade(c, -0.15), 'wood');
  }
});
FURN({
  key: 'iziz_vern_water_butt', name: 'Corrugated water butt', culture: 'iziz', tier: 'poor', type: 'vessel', setting: 'outdoor',
  rooms: ['yard', 'garden', 'street', 'kitchen'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['metal'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnWaterButt', w: 0.78, d: 0.78, h: 1.03, variants: 2,
  variantNames: ['Water butt', 'Large water butt'],
  variantDims: [{ w: 0.78, d: 0.78, h: 1.03 }, { w: 0.92, d: 0.92, h: 1.08 }],
  build: function (F) {
    const r = F.variant === 1 ? 0.45 : 0.38, h = F.variant === 1 ? 1.0 : 0.95;
    F.cyl(0, 0, 0, r, h, 0, F.col('steelCorrugate'), 'metal');
    for (const t of [0.3, 0.65]) F.cyl(0, h * t, 0, r + 0.01, 0.03, 0, F.shade('steelCorrugate', -0.15), 'metal');
    F.box(0, h, 0, r * 1.9, 0.08, r * 1.9, 0, F.col('ironSoot'), 'metal');
  }
});
FURN({
  key: 'iziz_vern_crate', name: 'Plank crate', culture: 'iziz', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['yard', 'store', 'shop', 'market', 'dock', 'kitchen'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnCrate', w: 0.8, d: 0.72, h: 0.64, variants: 3,
  variantNames: ['Small', 'Crate', 'Large'],
  variantDims: [{ w: 0.5, d: 0.45, h: 0.4 }, { w: 0.8, d: 0.72, h: 0.64 }, { w: 1.0, d: 0.9, h: 0.8 }],
  build: function (F) {
    const s = [0.5, 0.8, 1.0][F.variant] || 0.8, c = F.pick(['timberSawn', 'timberSawnDark', 'timberSawnLight', 'mahoganyLight']);
    F.box(0, 0, 0, s, s * 0.8, s * 0.9, 0, c, 'wood');
    for (const y of [0.04, s * 0.8 - 0.1]) F.box(0, y, 0, s + 0.01, 0.06, s * 0.9 + 0.01, 0, F.shade(c, -0.18), 'wood');
  }
});
FURN({
  key: 'iziz_vern_sacks', name: 'Heap of sacks', culture: 'iziz', tier: 'common', type: 'storage', role: 'store', setting: 'both',
  rooms: ['store', 'kitchen', 'yard', 'market', 'shop', 'dock'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnSacks', w: 2.04, d: 1.72, h: 1.09, variants: 2,
  variantNames: ['Three sacks', 'Five sacks'],
  variantDims: [{ w: 2.04, d: 1.72, h: 0.64 }, { w: 2.04, d: 1.72, h: 1.09 }],
  build: function (F) {
    const n = F.variant === 1 ? 5 : 3;
    for (let i = 0; i < n; i++) F.blob(F.rr(-0.6, 0.6), 0.32 + (i > 2 ? 0.45 : 0), F.rr(-0.5, 0.5), 0.39, 0.64, F.rr(0, F.TAU), F.pick(['sackingTan', 'sackingDark', 'sackingPale']), 'cloth');
  }
});
FURN({
  key: 'iziz_vern_planter', name: 'Plank planter box', culture: 'iziz', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['garden', 'yard', 'court', 'street', 'plaza'], anchor: 'floor', clearance: {},
  materials: ['timber', 'foliage'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnPlanter', w: 4.0, d: 2.4, h: 1.04, variants: 2,
  variantNames: ['Court bed (4 x 2.4 m)', 'Window box (1.6 x 0.8 m)'],
  variantDims: [{ w: 4.0, d: 2.4, h: 1.04 }, { w: 1.6, d: 0.8, h: 1.04 }],
  build: function (F) {
    const w = F.variant === 1 ? 1.6 : 4.0, d = F.variant === 1 ? 0.8 : 2.4, c = F.pick(['timberSawn', 'timberSawnDark']);
    F.box(0, 0, 0, w, 0.55, d, 0, c, 'wood');
    F.box(0, 0.5, 0, w + 0.04, 0.06, d + 0.04, 0, F.shade(c, -0.12), 'wood');
    const rx = Math.min(0.5, w * 0.15), rz = Math.min(0.5, d * 0.2);
    for (let k = 0; k < Math.max(1, Math.round(w * d / 1.2)); k++) {
      const r = Math.min(F.rr(0.28, 0.5), rx, rz);
      F.blob(F.rr(-w * 0.35, w * 0.35), 0.62, F.rr(-d * 0.3, d * 0.3), r, Math.min(F.rr(0.44, 0.84), 0.84), F.rr(0, F.TAU), F.pick(['leafVine', 'leafBright', 'leafMoss', 'leafSpring']), 'plant');
    }
  }
});
FURN({
  key: 'iziz_vern_drying_rack', name: 'Drying line', culture: 'iziz', tier: 'poor', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'garden', 'street', 'roost'], anchor: 'floor', clearance: { front: 0.5, back: 0.5 },
  materials: ['timber', 'rope', 'cloth'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnDryingRack', w: 4.12, d: 0.12, h: 2.2, variants: 2,
  variantNames: ['2.6 m', '4 m'],
  variantDims: [{ w: 2.72, d: 0.12, h: 2.2 }, { w: 4.12, d: 0.12, h: 2.2 }],
  build: function (F) {
    const L = F.variant === 1 ? 4 : 2.6;
    for (const s of [-1, 1]) F.cyl(s * L / 2, 0, 0, 0.06, 2.2, 0, F.col('timberGreyPost'), 'wood');
    F.rod(-L / 2, 2.1, 0, L / 2, 2.1, 0, 0.015, F.col('ropeFlax'), 'rope');
    for (let k = 0; k < Math.round(L / 0.9); k++) {
      const x = -L / 2 + 0.5 + k * 0.9;
      if (x + 0.3 > L / 2) break;
      F.box(x, 1.03, 0, 0.6, 1.05, 0.02, 0, F.pick(['clothOrange', 'clothOrange', 'clothApricot', 'clothAmber', 'clothVermilion', 'clothSaffron', 'clothTeal', 'clothRust']), 'cloth');
    }
  }
});
FURN({
  key: 'iziz_vern_wall_lamp', name: 'Electric wall lamp', culture: 'iziz', tier: 'court', type: 'lamp', setting: 'both',
  rooms: ['street', 'yard', 'court', 'plaza', 'hall', 'antechamber'], anchor: 'wall', clearance: {},
  materials: ['metal', 'emissive'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnLamp', w: 0.32, d: 0.72, h: 0.36, variants: 1,
  build: function (F) {
    const I = F.col('ironSoot');
    F.shift(0, -0.36);
    F.box(0, 0.18, 0.01, 0.12, 0.17, 0.02, 0, I, 'metal');                         /* the wall plate */
    F.beam(0, 0.3, 0.02, 0, 0.32, 0.55, 0.05, 0.05, I, 'metal');
    F.box(0, 0.28, 0.55, 0.32, 0.06, 0.32, 0, I, 'metal');
    F.ball(0, 0.14, 0.55, 0.11, F.col('electric'), 'glow');
    F.lamp(0, 0.1, 0.6, 0.8, 8);
  }
});
FURN({
  key: 'iziz_vern_lamp_post', name: 'Electric lamp post', culture: 'iziz', tier: 'court', type: 'lamp', setting: 'outdoor',
  rooms: ['street', 'yard', 'plaza', 'court', 'garden'], anchor: 'floor', clearance: {},
  materials: ['metal', 'emissive'],
  source: 'settlements/iziz/src/69c-vern-helpers.js vnLampPost', w: 0.5, d: 0.5, h: 3.28, variants: 2,
  variantNames: ['Yard post (3.2 m)', 'Drill-ground post (3.8 m)'],
  variantDims: [{ w: 0.5, d: 0.5, h: 3.28 }, { w: 0.5, d: 0.5, h: 3.88 }],
  build: function (F) {
    const h = F.variant === 1 ? 3.8 : 3.2, I = F.col('ironSoot');
    F.cyl(0, 0, 0, 0.07, h, 0, I, 'metal');
    F.box(0, h, 0, 0.5, 0.08, 0.5, 0, I, 'metal');
    F.ball(0, h - 0.16, 0, 0.13, F.col('electric'), 'glow');
    F.lamp(0, h - 0.2, 0, 1.0, 10);
  }
});
