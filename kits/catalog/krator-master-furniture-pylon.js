/* ======================================================================
   Pylon furniture: the signature pieces only.
   Pylon (kits/pylon), Iziz's vassal arcology city, furnishes from the Iziz
   sets outright (the owner, 2026-10-18): its interiors set chains pylon ->
   iziz -> post-apoc -> scrap -> generic (kits/interiors/sets/pylon.js), so
   every role a room needs comes from those. What is Pylon's own is what the
   owner's interior pictures show (kits/pylon/refs/pylon int*.jpg): built-in
   orange leather banquettes on concrete plinths, an orange hearth block,
   a walnut platform bed against a walnut wall, planters in orange-lined
   niches. Board-formed concrete, walnut, Iziz orange.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('pylon', { name: 'Pylon', pack: 'iziz', influences: 'neo-Ancient modernism; the Iziz Vernacular',
  materials: 'board-formed concrete, walnut, orange leather, white linen, gunmetal',
  palette: {
    concrete: 0x8e8b86, concreteLight: 0xb8b2a6, renderWhite: 0xeeebe5, orangeLeather: 0xd8702a, orangeRender: 0xe07a2a,
    walnut: 0x6e3a22, walnutDark: 0x4a2616, linenWhite: 0xece6da, gunmetal: 0x4a5058, ember: 0xd9762c, flame: 0xffb04a,
    leafGreen: 0x5a7a3a, soil: 0x4a3a2a
  } });
/* END PALETTE */

FURN({
  key: 'pylon_common_banquette', name: 'Leather banquette', culture: 'pylon', tier: 'common', type: 'bench', setting: 'indoor',
  rooms: ['living', 'hall', 'tavern', 'antechamber'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['stone', 'cloth'],
  w: 2.4, d: 0.75, h: 0.85, variants: 1,
  build: function (F) {
    const conc = F.col('concrete'), lea = F.col('orangeLeather');
    F.box(0, 0, 0, 2.4, 0.3, 0.75, 0, conc, 'stone');                                   /* the concrete plinth */
    F.box(0, 0.3, 0.04, 2.36, 0.14, 0.62, 0, lea, 'cloth');                             /* the seat cushion */
    F.box(0, 0.3, -0.3, 2.36, 0.55, 0.15, 0, F.shade(lea, -0.08), 'cloth');             /* the back, against the wall */
    for (const s of [-1, 1]) F.box(s * 1.15, 0.3, 0, 0.1, 0.28, 0.72, 0, conc, 'stone'); /* the plinth's cheeks */
  }
});

FURN({
  key: 'pylon_common_hearth_block', name: 'Orange hearth block', culture: 'pylon', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['living', 'hall', 'kitchen'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['stone', 'emissive'],
  w: 1.8, d: 0.92, h: 1.5, variants: 1,
  build: function (F) {
    const ren = F.col('orangeRender'), dark = F.col('walnutDark');
    F.box(0, 0, -0.11, 1.6, 1.5, 0.7, 0, ren, 'stone');                                     /* the rendered block */
    F.box(0, 0.25, 0.19, 0.9, 0.6, 0.12, 0, F.shade(dark, -0.4), 'stone');               /* the firebox mouth */
    F.box(0, 0.25, 0.25, 0.7, 0.12, 0.05, 0, F.col('ember'), 'glow');                   /* the embers */
    F.box(0, 0, 0.31, 1.8, 0.12, 0.3, 0, F.col('concrete'), 'stone');                   /* the hearth slab */
  }
});

FURN({
  key: 'pylon_court_platform_bed', name: 'Walnut platform bed', culture: 'pylon', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.9, left: 0.5, right: 0.5 },
  materials: ['timber', 'stone', 'cloth'],
  w: 2.0, d: 2.3, h: 1.2, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0, 0.05, 1.8, 0.18, 2.1, 0, F.col('concrete'), 'stone');                   /* the concrete plinth */
    F.box(0, 0.18, 0.05, 2.0, 0.12, 2.2, 0, wal, 'wood');                               /* the walnut platform */
    F.box(0, 0.3, 0.1, 1.8, 0.2, 2.0, 0, F.col('linenWhite'), 'cloth');                  /* the mattress */
    F.box(0, 0.5, 0.55, 1.8, 0.04, 0.9, 0, F.col('orangeLeather'), 'cloth');            /* the throw */
    F.box(0, 0, -1.1, 2.0, 1.2, 0.08, 0, F.shade(wal, -0.1), 'wood');                   /* the walnut headboard wall */
    for (const s of [-1, 1]) F.blob(s * 0.45, 0.6, -0.8, 0.28, 0.1, 0, F.col('linenWhite'), 'cloth');
  }
});

FURN({
  key: 'pylon_common_niche_planter', name: 'Niche planter', culture: 'pylon', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'court'], anchor: 'wall', clearance: { front: 0.4 },
  materials: ['stone', 'foliage'],
  w: 0.7, d: 0.45, h: 1.8, variants: 1,
  build: function (F) {
    const conc = F.col('concrete'), ren = F.col('orangeRender');
    F.box(0, 0, 0, 0.7, 1.8, 0.45, 0, conc, 'stone');                                   /* the concrete pier */
    F.box(0, 0.25, 0.12, 0.5, 1.3, 0.24, 0, ren, 'stone');                              /* the orange-lined niche */
    F.box(0, 0.25, 0.12, 0.44, 0.3, 0.2, 0, F.col('soil'), 'stone');                    /* the soil */
    for (let i = 0; i < 3; i++) F.blob(-0.1 + i * 0.1, 0.65 + i * 0.12, 0.14, 0.14, 0.12, 0, F.col('leafGreen'), 'plant');
  }
});
