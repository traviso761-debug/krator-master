/* ======================================================================
   Yonni Spear-Queens Furniture Registry (culture: 'yonni')
   Bundled inside KratorFurniture by kits/yonni/build.py alongside kits/catalog
   sets. Every piece uses canonical CATALOG_MATERIALS families (textured via
   materials.json f_* triplanar detail maps in 91f-furnish.js) and clean
   non-overlapping joinery (zero coplanar same-normal faces).
   ====================================================================== */
FURN_CULTURE('yonni', {
  name: 'Yonni Spear-Queens',
  pack: null,
  influences: 'Kushitic + Sarmatian wet-coastal round-tower matriarchy; Twin-Born Spear-Queens',
  materials: 'dark oiled coastal ironwood, tin-bronze, verdigris copper, sea-lime stone, carnelian & indigo wool, terracotta, amber',
  palette: {
    ironwood: 0x422e22, ironwoodDark: 0x2e2017, ironwoodLight: 0x684b36, cedar: 0x8c6848,
    sealime: 0xded4c0, granite: 0x7c7e80, cobble: 0x68645c, soot: 0x282422,
    bronze: 0xb88e48, verdigris: 0x568e80, iron: 0x383634, amber: 0xd8922e,
    carnelian: 0xa83828, indigo: 0x2c4a6c, woolCream: 0xe2d8c4, woolOchre: 0xc4943c,
    terracotta: 0xb46040, glazeTeal: 0x3c7878, hide: 0x6e4c34, rope: 0x9e8254,
    flame: 0xffb44c, ember: 0xe86424, bread: 0xc89248, herb: 0x547438
  }
});

/* ---- 1. Twin-Born Beds & Alcoves (90% identical-twin households) ---- */
FURN({
  key: 'yonni_poor_twin_pallet', name: 'Paired wool twin-pallet', culture: 'yonni', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'living'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'cloth', 'rope'],
  w: 1.75, d: 1.9, h: 0.36, variants: 1,
  build: function (F) {
    const wd = F.col('ironwoodDark'), wl = F.col('woolCream'), cn = F.col('carnelian');
    for (const s of [-0.44, 0.44]) {
      F.box(s, 0, 0, 0.78, 0.12, 1.86, 0, wd, 'wood');
      F.box(s, 0.12, 0.04, 0.72, 0.11, 1.74, 0, wl, 'cloth');
      F.box(s, 0.23, 0.32, 0.7, 0.04, 0.96, 0, cn, 'cloth');
      F.bolster(s, 0.28, -0.64, 0.62, 0.08, 0, F.col('woolOchre'), 'cloth');
    }
    F.box(0, 0.03, -0.88, 0.1, 0.26, 0.1, 0, F.col('ironwood'), 'wood');
  }
});

FURN({
  key: 'yonni_common_twin_alcove', name: 'Twin-Sister ironwood alcove bed', culture: 'yonni', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'bronze', 'cloth'],
  w: 2.05, d: 1.95, h: 1.15, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), iwd = F.col('ironwoodDark'), bz = F.col('bronze');
    F.box(0, 0, 0, 2.0, 0.22, 1.9, 0, iwd, 'wood');
    F.box(0, 0.225, -0.89, 2.02, 0.875, 0.09, 0, iw, 'wood');
    F.box(0, 1.105, -0.89, 2.06, 0.045, 0.13, 0, bz, 'bronze');
    /* central low divider between the identical twins' berths */
    F.box(0, 0.225, 0.05, 0.08, 0.255, 1.68, 0, iw, 'wood');
    for (const s of [-0.51, 0.51]) {
      F.box(s, 0.225, 0.05, 0.86, 0.14, 1.7, 0, F.col('woolCream'), 'cloth');
      F.box(s, 0.37, 0.3, 0.84, 0.04, 1.04, 0, s < 0 ? F.col('carnelian') : F.col('indigo'), 'cloth');
      F.bolster(s, 0.43, -0.62, 0.72, 0.09, 0, F.col('woolOchre'), 'cloth');
      F.cyl(s, 0.72, -0.82, 0.06, 0.04, Math.PI / 2, bz, 'bronze');
    }
  }
});

FURN({
  key: 'yonni_court_twin_bed', name: 'Twin-Kande canopied dais bed', culture: 'yonni', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.7, left: 0.4, right: 0.4 },
  materials: ['stone', 'timber', 'bronze', 'cloth'],
  w: 2.4, d: 2.15, h: 2.15, variants: 1,
  build: function (F) {
    const sl = F.col('sealime'), iw = F.col('ironwood'), bz = F.col('bronze'), vd = F.col('verdigris');
    F.box(0, 0, 0, 2.36, 0.14, 2.1, 0, sl, 'stone');
    F.box(0, 0.145, 0, 2.2, 0.175, 1.96, 0, iw, 'wood');
    /* headboard inset cleanly between rear canopy posts at sx = +-1.02 */
    F.box(0, 0.326, -0.9, 1.84, 1.04, 0.09, 0, F.col('ironwoodDark'), 'wood');
    for (const sx of [-1.02, 1.02]) for (const sz of [-0.9, 0.9]) {
      F.cyl(sx, 0.325, sz, 0.055, 1.55, 0, iw, 'wood');
      F.cyl(sx, 1.88, sz, 0.07, 0.055, 0, bz, 'bronze');
    }
    /* circular bronze & verdigris rain-canopy tester crown */
    F.cyl(0, 1.94, 0, 1.18, 0.055, 0, bz, 'bronze');
    F.cone(0, 2.0, 0, 1.14, 0.15, 0, vd, 'bronze');
    for (const s of [-0.50, 0.50]) {
      F.box(s, 0.326, 0.05, 0.86, 0.16, 1.7, 0, F.col('woolCream'), 'cloth');
      F.box(s, 0.49, 0.28, 0.84, 0.04, 1.08, 0, F.col('carnelian'), 'cloth');
      F.bolster(s, 0.56, -0.62, 0.76, 0.1, 0, F.col('amber'), 'cloth');
    }
  }
});

/* ---- 2. Civic & Sacred Signature Pieces (Dual-Throne, Seer Basin, Dual-Spear Rack) ---- */
FURN({
  key: 'yonni_court_twin_throne', name: 'Dual-Throne of the Twin Spear-Queens', culture: 'yonni', tier: 'court', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'court', 'throne'], anchor: 'wall', clearance: { front: 1.1 },
  materials: ['stone', 'timber', 'bronze', 'cloth'],
  w: 2.6, d: 1.35, h: 2.25, variants: 1,
  build: function (F) {
    const gr = F.col('granite'), sl = F.col('sealime'), iw = F.col('ironwoodDark'), bz = F.col('bronze'), cn = F.col('carnelian');
    F.box(0, 0, 0, 2.56, 0.16, 1.3, 0, gr, 'stone');
    F.box(0, 0.165, -0.06, 2.32, 0.135, 1.12, 0, sl, 'stone');
    for (const s of [-0.62, 0.62]) {
      F.box(s, 0.305, -0.04, 0.86, 0.415, 0.76, 0, iw, 'wood');
      F.box(s, 0.726, 0.03, 0.64, 0.08, 0.56, 0, cn, 'cloth');
      F.box(s, 0.726, -0.36, 0.84, 1.05, 0.09, 0, iw, 'wood');
      F.box(s - 0.38, 0.726, 0.02, 0.09, 0.28, 0.64, 0, bz, 'bronze');
      F.box(s + 0.38, 0.726, 0.02, 0.09, 0.28, 0.64, 0, bz, 'bronze');
      F.cone(s - 0.34, 1.78, -0.36, 0.055, 0.28, 0, bz, 'bronze');
      F.cone(s + 0.34, 1.78, -0.36, 0.055, 0.28, 0, bz, 'bronze');
    }
    /* crossed twin ceremonial spears behind the Dual-Throne */
    F.rod(-0.85, 0.35, -0.5, 0.75, 2.12, -0.46, 0.022, F.col('cedar'), 'wood');
    F.rod(0.85, 0.35, -0.54, -0.75, 2.12, -0.58, 0.022, F.col('cedar'), 'wood');
    F.cone(0.79, 2.12, -0.46, 0.045, 0.18, 0, bz, 'bronze');
    F.cone(-0.79, 2.12, -0.58, 0.045, 0.18, 0, bz, 'bronze');
  }
});

FURN({
  key: 'yonni_common_seer_basin', name: 'Lone-Born Seer amber scrying basin', culture: 'yonni', tier: 'court', type: 'shrine', setting: 'both',
  rooms: ['temple', 'shrine', 'hall'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 },
  materials: ['stone', 'bronze', 'emissive'],
  w: 1.25, d: 1.25, h: 1.12, variants: 1,
  build: function (F) {
    const sl = F.col('sealime'), bz = F.col('bronze'), vd = F.col('verdigris');
    F.cyl(0, 0, 0, 0.56, 0.14, 0, F.col('granite'), 'stone');
    F.frustum(0, 0.14, 0, 0.34, 0.24, 0.56, 0, sl, 'stone', 12);
    F.cyl(0, 0.7, 0, 0.52, 0.14, 0, vd, 'bronze');
    F.cyl(0, 0.84, 0, 0.44, 0.05, 0, F.col('glazeTeal'), 'ceramic');
    F.ball(0, 0.96, 0, 0.09, F.col('amber'), 'glow');
    for (const s of [-0.46, 0.46]) {
      F.cyl(s, 0.84, 0, 0.05, 0.16, 0, bz, 'bronze');
      F.ball(s, 1.03, 0, 0.035, F.col('flame'), 'glow');
    }
    F.lamp(0, 1.08, 0, 0.9, 7);
  }
});

FURN({
  key: 'yonni_common_dual_spear_rack', name: 'Dual-spear and coastal shield rack', culture: 'yonni', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['hall', 'barracks', 'living', 'armoury'], anchor: 'wall', clearance: { front: 0.45 },
  materials: ['timber', 'bronze', 'metal'],
  w: 1.15, d: 0.38, h: 1.95, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), bz = F.col('bronze'), vd = F.col('verdigris');
    F.box(0, 0, 0, 1.1, 0.1, 0.34, 0, iw, 'wood');
    for (const s of [-0.46, 0.46]) F.box(s, 0.1, -0.06, 0.08, 1.35, 0.08, 0, iw, 'wood');
    F.box(0, 1.18, -0.06, 0.84, 0.08, 0.1, 0, iw, 'wood');
    /* twin matched spears of a Yonni sister-pair */
    for (const s of [-0.24, 0.24]) {
      F.cyl(s, 0.1, 0.02, 0.02, 1.62, 0, F.col('cedar'), 'wood');
      F.cone(s, 1.72, 0.02, 0.042, 0.22, 0, bz, 'bronze');
    }
    /* bossed round coastal shield hung at mid-height */
    F.cyl(0, 0.72, 0.09, 0.28, 0.04, Math.PI / 2, vd, 'bronze');
    F.ball(0, 0.72, 0.13, 0.065, bz, 'bronze');
  }
});

/* ---- 3. Hearths, Braziers & Storm-Lamps ---- */
FURN({
  key: 'yonni_common_brazier', name: 'Coastal stone & tin-bronze hearth-brazier', culture: 'yonni', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'living', 'tavern', 'court'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['stone', 'bronze', 'emissive'],
  w: 0.95, d: 0.95, h: 0.68, variants: 1,
  build: function (F) {
    const gr = F.col('cobble'), bz = F.col('bronze');
    F.cyl(0, 0, 0, 0.45, 0.12, 0, gr, 'stone');
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.cyl(Math.cos(a) * 0.26, 0.12, Math.sin(a) * 0.26, 0.035, 0.26, 0, bz, 'bronze');
    }
    F.frustum(0, 0.38, 0, 0.24, 0.38, 0.18, 0, bz, 'bronze', 12);
    F.cyl(0, 0.56, 0, 0.31, 0.04, 0, F.col('ember'), 'glow');
    F.cone(0, 0.6, 0, 0.14, 0.12, 0, F.col('flame'), 'glow');
    F.lamp(0, 0.72, 0, 1.15, 9);
  }
});

FURN({
  key: 'yonni_common_storm_lamp', name: 'Hanging verdigris storm-lantern', culture: 'yonni', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'living', 'tavern', 'workshop'], anchor: 'ceiling', clearance: {},
  materials: ['bronze', 'glass', 'emissive'],
  w: 0.38, d: 0.38, h: 0.72, variants: 1,
  build: function (F) {
    const bz = F.col('bronze'), vd = F.col('verdigris');
    F.cyl(0, 0, 0, 0.14, 0.06, 0, bz, 'bronze');
    F.cyl(0, 0.06, 0, 0.12, 0.22, 0, 0xd8e8ec, 'glass');
    F.ball(0, 0.16, 0, 0.055, F.col('flame'), 'glow');
    F.cone(0, 0.28, 0, 0.19, 0.12, 0, vd, 'bronze');
    F.cyl(0, 0.4, 0, 0.018, 0.32, 0, bz, 'bronze');
    F.lamp(0, 0.16, 0, 0.9, 8);
  }
});

FURN({
  key: 'yonni_common_post_lamp', name: 'Standing bronze storm-lamp standard', culture: 'yonni', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'living', 'court', 'yard'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['stone', 'timber', 'bronze', 'emissive'],
  w: 0.42, d: 0.42, h: 1.58, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.19, 0.1, 0, F.col('granite'), 'stone');
    F.cyl(0, 0.1, 0, 0.04, 1.12, 0, F.col('ironwood'), 'wood');
    F.cyl(0, 1.22, 0, 0.12, 0.05, 0, F.col('bronze'), 'bronze');
    F.cyl(0, 1.27, 0, 0.09, 0.18, 0, F.col('flame'), 'glow');
    F.cone(0, 1.45, 0, 0.16, 0.12, 0, F.col('verdigris'), 'bronze');
    F.lamp(0, 1.35, 0, 0.95, 8);
  }
});

/* ---- 4. Household Tables, Seating, Storage, Rugs & Hangings ---- */
FURN({
  key: 'yonni_common_round_table', name: 'Round ironwood household table', culture: 'yonni', tier: 'common', type: 'table', setting: 'both',
  rooms: ['living', 'hall', 'tavern', 'kitchen'], anchor: 'floor', clearance: { front: 0.55, back: 0.55, left: 0.55, right: 0.55 },
  materials: ['timber', 'bronze', 'ceramic'],
  w: 1.18, d: 1.18, h: 0.78, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), bz = F.col('bronze');
    for (let i = 0; i < 4; i++) {
      const a = i * F.TAU / 4 + 0.4;
      F.cyl(Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38, 0.042, 0.68, 0, F.col('ironwoodDark'), 'wood');
    }
    F.cyl(0, 0.68, 0, 0.56, 0.06, 0, iw, 'wood');
    F.cyl(0, 0.74, 0, 0.18, 0.05, 0, F.col('terracotta'), 'terracotta');
    F.cyl(0.22, 0.74, 0.1, 0.065, 0.12, 0, bz, 'bronze');
  }
});

FURN({
  key: 'yonni_court_feast_table', name: 'Great bronze-rimmed ring-feast table', culture: 'yonni', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'tavern'], anchor: 'floor', clearance: { front: 0.65, back: 0.65, left: 0.65, right: 0.65 },
  materials: ['timber', 'bronze', 'ceramic'],
  w: 1.75, d: 1.75, h: 0.82, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), bz = F.col('bronze');
    for (let i = 0; i < 6; i++) {
      const a = i * F.TAU / 6;
      F.cyl(Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, 0.05, 0.7, 0, F.col('ironwoodDark'), 'wood');
    }
    F.cyl(0, 0.7, 0, 0.85, 0.05, 0, bz, 'bronze');
    F.cyl(0, 0.75, 0, 0.81, 0.03, 0, iw, 'wood');
    F.frustum(0, 0.78, 0, 0.14, 0.22, 0.1, 0, F.col('glazeTeal'), 'ceramic', 12);
    for (const s of [-0.36, 0.36]) F.cyl(s, 0.78, 0.18, 0.06, 0.11, 0, bz, 'bronze');
  }
});

FURN({
  key: 'yonni_common_stool', name: 'Three-legged ironwood & wool stool', culture: 'yonni', tier: 'common', type: 'chair', setting: 'both',
  rooms: ['living', 'hall', 'tavern', 'workshop'], anchor: 'floor', clearance: { front: 0.35 },
  materials: ['timber', 'cloth'],
  w: 0.44, d: 0.44, h: 0.48, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) {
      const a = i * F.TAU / 3;
      F.cyl(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14, 0.028, 0.39, 0, F.col('ironwoodDark'), 'wood');
    }
    F.cyl(0, 0.39, 0, 0.19, 0.045, 0, F.col('ironwood'), 'wood');
    F.cyl(0, 0.435, 0, 0.17, 0.04, 0, F.col('carnelian'), 'cloth');
  }
});

FURN({
  key: 'yonni_common_chair', name: 'Spear-back carved ironwood chair', culture: 'yonni', tier: 'common', type: 'chair', setting: 'indoor',
  rooms: ['living', 'hall', 'study'], anchor: 'floor', clearance: { front: 0.45 },
  materials: ['timber', 'bronze', 'cloth'],
  w: 0.56, d: 0.56, h: 0.98, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), iwd = F.col('ironwoodDark'), bz = F.col('bronze');
    for (const sx of [-0.21, 0.21]) for (const sz of [-0.21, 0.21]) {
      F.box(sx, 0, sz, 0.06, sz < 0 ? 0.88 : 0.44, 0.06, 0, iwd, 'wood');
    }
    F.box(0, 0.44, 0.02, 0.5, 0.05, 0.46, 0, iw, 'wood');
    F.box(0, 0.49, 0.03, 0.44, 0.045, 0.4, 0, F.col('indigo'), 'cloth');
    F.box(0, 0.68, -0.21, 0.36, 0.16, 0.04, 0, iw, 'wood');
    for (const sx of [-0.21, 0.21]) F.cone(sx, 0.88, -0.21, 0.035, 0.1, 0, bz, 'bronze');
  }
});

FURN({
  key: 'yonni_common_bench', name: 'Oiled ironwood & bolster wall-bench', culture: 'yonni', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['hall', 'living', 'tavern', 'yard'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'cloth'],
  w: 1.55, d: 0.52, h: 0.54, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), iwd = F.col('ironwoodDark');
    for (const sx of [-0.62, 0.62]) F.box(sx, 0, 0, 0.1, 0.4, 0.44, 0, iwd, 'wood');
    F.box(0, 0.4, 0, 1.52, 0.06, 0.48, 0, iw, 'wood');
    F.box(0, 0.46, 0, 1.44, 0.05, 0.42, 0, F.col('carnelian'), 'cloth');
  }
});

FURN({
  key: 'yonni_common_chest', name: 'Tin-bronze bound coastal sea-chest', culture: 'yonni', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['bedroom', 'living', 'store', 'hall'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'bronze'],
  w: 1.08, d: 0.56, h: 0.58, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood'), bz = F.col('bronze');
    F.box(0, 0, 0, 1.02, 0.44, 0.5, 0, iw, 'wood');
    F.box(0, 0.44, 0, 1.06, 0.1, 0.54, 0, F.col('ironwoodDark'), 'wood');
    for (const sx of [-0.36, 0.36]) F.box(sx, 0.54, 0, 0.06, 0.03, 0.55, 0, bz, 'bronze');
    F.box(0, 0.34, 0.27, 0.12, 0.14, 0.03, 0, bz, 'bronze');
  }
});

FURN({
  key: 'yonni_common_shelves', name: 'Coastal amphora & provision shelves', culture: 'yonni', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'store', 'shop', 'workshop'], anchor: 'wall', clearance: { front: 0.45 },
  materials: ['timber', 'terracotta', 'ceramic'],
  w: 1.32, d: 0.44, h: 1.68, variants: 1,
  build: function (F) {
    const iw = F.col('ironwoodDark'), wd = F.col('cedar'), tc = F.col('terracotta');
    for (const sx of [-0.58, 0.58]) F.box(sx, 0, 0, 0.07, 1.66, 0.38, 0, iw, 'wood');
    for (const y of [0.16, 0.68, 1.2]) F.box(0, y, 0, 1.08, 0.045, 0.36, 0, wd, 'wood');
    for (const sx of [-0.32, 0, 0.32]) {
      F.frustum(sx, 0.205, 0, 0.08, 0.11, 0.26, 0, tc, 'terracotta', 10);
      F.cyl(sx, 0.725, 0, 0.085, 0.22, 0, F.col('glazeTeal'), 'ceramic');
    }
    F.box(-0.22, 1.245, 0, 0.34, 0.18, 0.26, 0, wd, 'wood');
    F.cyl(0.26, 1.245, 0, 0.09, 0.24, 0, tc, 'terracotta');
  }
});

FURN({
  key: 'yonni_common_rug_round', name: 'Carnelian & indigo circular wool rug', culture: 'yonni', tier: 'common', type: 'rug', setting: 'indoor',
  rooms: ['living', 'bedroom', 'hall'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 1.9, d: 1.9, h: 0.045, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.92, 0.025, 0, F.col('indigo'), 'cloth');
    F.cyl(0, 0.025, 0, 0.68, 0.02, 0, F.col('carnelian'), 'cloth');
  }
});

FURN({
  key: 'yonni_court_carpet', name: 'Great Twin-Star wool medallion carpet', culture: 'yonni', tier: 'court', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'court', 'throne'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.8, d: 2.8, h: 0.05, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 1.36, 0.025, 0, F.col('carnelian'), 'cloth');
    F.cyl(0, 0.025, 0, 0.96, 0.025, 0, F.col('woolOchre'), 'cloth');
  }
});

FURN({
  key: 'yonni_common_banner', name: 'Twin-Spear carnelian wall hanging', culture: 'yonni', tier: 'common', type: 'banner', setting: 'both',
  rooms: ['hall', 'living', 'barracks', 'temple'], anchor: 'wall', role: 'banner', clearance: {},
  materials: ['bronze', 'cloth'],
  w: 0.92, d: 0.14, h: 1.65, variants: 1,
  build: function (F) {
    const bz = F.col('bronze');
    F.cyl(0, 1.56, 0, 0.025, 0.9, Math.PI / 2, bz, 'bronze');
    F.box(0, 0.18, 0, 0.76, 1.36, 0.03, 0, F.col('carnelian'), 'cloth');
    F.box(0, 0.42, 0.032, 0.42, 0.88, 0.025, 0, F.col('woolOchre'), 'cloth');
  }
});

/* ---- 5. Trade, Craft & Works Pieces (Every Voth Census Trade) ---- */
FURN({
  key: 'yonni_trade_forge', name: 'Coastal cobble & bronze-hooded forge', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'smithy', 'yard'], anchor: 'wall', role: 'forge', clearance: { front: 0.9 },
  materials: ['stone', 'bronze', 'timber', 'emissive'],
  w: 1.65, d: 1.15, h: 1.85, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.58, 0.76, 1.06, 0, F.col('cobble'), 'stone');
    F.box(-0.18, 0.76, 0.04, 0.82, 0.08, 0.68, 0, F.col('soot'), 'stone');
    F.box(-0.18, 0.84, 0.04, 0.56, 0.06, 0.46, 0, F.col('ember'), 'glow');
    /* leather & wood bellows on +x */
    F.box(0.48, 0.76, 0, 0.42, 0.22, 0.56, 0, F.col('hide'), 'hide');
    /* bronze smoke hood overhead */
    F.frustum(-0.18, 1.28, -0.04, 0.52, 0.22, 0.56, 0, F.col('verdigris'), 'bronze', 8);
    F.lamp(-0.18, 0.95, 0.04, 1.3, 9);
  }
});

FURN({
  key: 'yonni_trade_anvil', name: 'Horned iron & bronze-mounted anvil', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'smithy', 'yard'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'metal', 'bronze'],
  w: 0.68, d: 0.52, h: 0.82, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.24, 0.52, 0, F.col('ironwoodDark'), 'wood');
    F.cyl(0, 0.52, 0, 0.25, 0.04, 0, F.col('bronze'), 'bronze');
    F.box(0, 0.56, 0, 0.44, 0.24, 0.2, 0, F.col('iron'), 'metal');
    F.cone(0.3, 0.66, 0, 0.08, 0.16, 0, F.col('iron'), 'metal');
  }
});

FURN({
  key: 'yonni_trade_trough', name: 'Dressed granite quench & stock trough', culture: 'yonni', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['workshop', 'yard', 'stable'], anchor: 'floor', role: 'trough', clearance: { front: 0.5 },
  materials: ['stone', 'ceramic'],
  w: 1.35, d: 0.58, h: 0.52, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.32, 0.36, 0.54, 0, F.col('granite'), 'stone');
    for (const s of [-0.6, 0.6]) F.box(s, 0.36, 0, 0.1, 0.14, 0.54, 0, F.col('granite'), 'stone');
    for (const sz of [-0.22, 0.22]) F.box(0, 0.36, sz, 1.08, 0.14, 0.09, 0, F.col('granite'), 'stone');
    F.box(0, 0.36, 0, 1.06, 0.08, 0.32, 0, F.col('glazeTeal'), 'ceramic');
  }
});

FURN({
  key: 'yonni_trade_bunk', name: 'Garrison twin-lance stacked bunk', culture: 'yonni', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['barracks', 'bedroom'], anchor: 'wall', role: 'bunk', clearance: { front: 0.55 },
  materials: ['timber', 'cloth'],
  w: 1.05, d: 1.95, h: 1.65, variants: 1,
  build: function (F) {
    const iw = F.col('ironwoodDark');
    for (const sx of [-0.46, 0.46]) for (const sz of [-0.9, 0.9]) F.box(sx, 0, sz, 0.08, 1.62, 0.08, 0, iw, 'wood');
    for (const y of [0.22, 1.02]) {
      F.box(0, y, 0, 0.82, 0.08, 1.84, 0, F.col('ironwood'), 'wood');
      F.box(0, y + 0.08, 0.04, 0.8, 0.1, 1.72, 0, F.col('woolCream'), 'cloth');
      F.box(0, y + 0.18, 0.3, 0.78, 0.035, 1.0, 0, F.col('carnelian'), 'cloth');
    }
  }
});

FURN({
  key: 'yonni_trade_armour_stand', name: 'Verdigris scale-cuirass & spear-helm stand', culture: 'yonni', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['barracks', 'armoury', 'hall'], anchor: 'floor', role: 'armour_stand', clearance: { front: 0.45 },
  materials: ['timber', 'bronze'],
  w: 0.62, d: 0.52, h: 1.76, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.24, 0.08, 0, F.col('ironwoodDark'), 'wood');
    F.cyl(0, 0.08, 0, 0.04, 1.38, 0, F.col('ironwood'), 'wood');
    F.frustum(0, 0.78, 0, 0.18, 0.23, 0.48, 0, F.col('verdigris'), 'bronze', 10);
    F.dome(0, 1.46, 0, 0.13, 0.16, 0, F.col('bronze'), 'bronze');
    F.cone(0, 1.62, 0, 0.035, 0.14, 0, F.col('bronze'), 'bronze');
  }
});

FURN({
  key: 'yonni_works_bread_oven', name: 'Sea-lime beehive bread oven', culture: 'yonni', tier: 'common', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'bakery', 'yard'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['stone', 'plaster', 'emissive'],
  w: 1.45, d: 1.35, h: 1.55, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.4, 0.68, 1.3, 0, F.col('cobble'), 'stone');
    F.dome(0, 0.68, -0.05, 0.62, 0.72, 0, F.col('sealime'), 'plaster');
    F.cyl(0, 1.36, -0.15, 0.12, 0.2, 0, F.col('terracotta'), 'terracotta');
    F.box(0, 0.68, 0.52, 0.38, 0.28, 0.14, 0, F.col('ember'), 'glow');
    F.lamp(0, 0.82, 0.62, 1.0, 7);
  }
});

FURN({
  key: 'yonni_works_butcher_block', name: 'Heavy ironwood end-grain butcher block', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['kitchen', 'workshop', 'shop'], anchor: 'floor', clearance: { front: 0.55 },
  materials: ['timber', 'metal', 'food'],
  w: 0.88, d: 0.72, h: 0.86, variants: 1,
  build: function (F) {
    for (const sx of [-0.32, 0.32]) for (const sz of [-0.24, 0.24]) F.box(sx, 0, sz, 0.1, 0.58, 0.1, 0, F.col('ironwoodDark'), 'wood');
    F.box(0, 0.58, 0, 0.84, 0.22, 0.68, 0, F.col('cedar'), 'wood');
    F.box(-0.16, 0.8, 0, 0.3, 0.06, 0.22, 0, F.col('carnelian'), 'food');
    F.box(0.22, 0.8, 0.05, 0.18, 0.03, 0.08, 0.3, F.col('iron'), 'metal');
  }
});

FURN({
  key: 'yonni_works_smoke_rack', name: 'Coastal fish & mutton smoking rack', culture: 'yonni', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['workshop', 'kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'food'],
  w: 1.45, d: 0.56, h: 1.72, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood');
    for (const sx of [-0.64, 0.64]) {
      F.box(sx, 0, 0, 0.08, 0.08, 0.5, 0, iw, 'wood');
      F.box(sx, 0.08, 0, 0.08, 1.58, 0.08, 0, iw, 'wood');
    }
    F.box(0, 1.56, 0, 1.18, 0.06, 0.07, 0, iw, 'wood');
    for (let i = -2; i <= 2; i++) {
      F.frustum(i * 0.24, 1.02, 0, 0.045, 0.075, 0.52, 0, F.col('bread'), 'food', 8);
    }
  }
});

FURN({
  key: 'yonni_trade_loom', name: 'Warp-weighted carnelian wool loom', culture: 'yonni', tier: 'common', type: 'loom', setting: 'indoor',
  rooms: ['workshop', 'living'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['timber', 'cloth', 'stone'],
  w: 1.38, d: 0.62, h: 1.84, variants: 1,
  build: function (F) {
    const iw = F.col('ironwood');
    for (const sx of [-0.6, 0.6]) {
      F.box(sx, 0, 0, 0.09, 0.08, 0.54, 0, iw, 'wood');
      F.beam(sx, 0.08, 0.16, sx, 1.8, -0.18, 0.08, 0.08, iw, 'wood');
    }
    F.box(0, 1.72, -0.17, 1.1, 0.07, 0.07, 0, iw, 'wood');
    F.box(0, 0.52, -0.02, 0.98, 1.16, 0.035, 0, F.col('carnelian'), 'cloth');
    for (let i = -2; i <= 2; i++) F.cyl(i * 0.2, 0.22, 0.04, 0.04, 0.09, 0, F.col('granite'), 'stone');
  }
});

FURN({
  key: 'yonni_trade_vat', name: 'Bronze-hooped dye & tanning vat', culture: 'yonni', tier: 'common', type: 'vessel', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'floor', role: 'vat', clearance: { front: 0.45 },
  materials: ['timber', 'bronze', 'cloth'],
  w: 0.96, d: 0.96, h: 0.78, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.42, 0.46, 0.72, 0, F.col('ironwood'), 'wood', 14);
    F.cyl(0, 0.72, 0, 0.47, 0.04, 0, F.col('bronze'), 'bronze');
    F.cyl(0, 0.76, 0, 0.4, 0.025, 0, F.col('carnelian'), 'cloth');
  }
});

FURN({
  key: 'yonni_trade_potter_wheel', name: 'Potter kick-wheel & throwing bench', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop'], anchor: 'floor', clearance: { front: 0.55 },
  materials: ['timber', 'stone', 'terracotta'],
  w: 1.05, d: 0.78, h: 0.92, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.0, 0.1, 0.72, 0, F.col('ironwoodDark'), 'wood');
    F.cyl(-0.2, 0.1, 0, 0.3, 0.08, 0, F.col('granite'), 'stone');
    F.cyl(-0.2, 0.18, 0, 0.045, 0.48, 0, F.col('ironwood'), 'wood');
    F.cyl(-0.2, 0.66, 0, 0.22, 0.05, 0, F.col('cedar'), 'wood');
    F.frustum(-0.2, 0.71, 0, 0.08, 0.12, 0.2, 0, F.col('terracotta'), 'terracotta', 12);
    F.box(0.28, 0.1, 0, 0.34, 0.38, 0.34, 0, F.col('ironwood'), 'wood');
  }
});

FURN({
  key: 'yonni_trade_workbench', name: 'Ironwood joiner & cooper workbench', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['workshop', 'yard'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['timber', 'bronze', 'metal'],
  w: 1.62, d: 0.68, h: 0.88, variants: 1,
  build: function (F) {
    for (const sx of [-0.68, 0.68]) for (const sz of [-0.24, 0.24]) F.box(sx, 0, sz, 0.09, 0.74, 0.09, 0, F.col('ironwoodDark'), 'wood');
    F.box(0, 0.74, 0, 1.58, 0.08, 0.64, 0, F.col('cedar'), 'wood');
    F.box(-0.42, 0.82, 0.16, 0.24, 0.06, 0.14, 0, F.col('iron'), 'metal');
    F.box(0.36, 0.82, -0.08, 0.38, 0.05, 0.18, 0.2, F.col('bronze'), 'bronze');
  }
});

FURN({
  key: 'yonni_works_alembic', name: 'Saltpeter & herb copper alembic bench', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['workshop', 'study', 'clinic'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'bronze', 'glass', 'foliage'],
  w: 1.48, d: 0.64, h: 1.24, variants: 1,
  build: function (F) {
    for (const sx of [-0.62, 0.62]) for (const sz of [-0.22, 0.22]) F.box(sx, 0, sz, 0.08, 0.74, 0.08, 0, F.col('ironwoodDark'), 'wood');
    F.box(0, 0.74, 0, 1.44, 0.06, 0.6, 0, F.col('ironwood'), 'wood');
    F.frustum(-0.34, 0.8, 0, 0.13, 0.08, 0.24, 0, F.col('bronze'), 'bronze', 12);
    F.dome(-0.34, 1.04, 0, 0.1, 0.12, 0, F.col('verdigris'), 'bronze');
    F.rod(-0.28, 1.1, 0, 0.06, 0.96, 0, 0.02, F.col('bronze'), 'bronze');
    F.cyl(0.08, 0.8, 0, 0.1, 0.22, 0, 0xd8ecef, 'glass');
    F.blob(0.44, 0.88, 0, 0.14, 0.14, 0, F.col('herb'), 'plant');
  }
});

FURN({
  key: 'yonni_works_sickbed', name: 'Healer raised coastal-linen cot', culture: 'yonni', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['clinic', 'bedroom'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['timber', 'cloth'],
  w: 0.98, d: 1.92, h: 0.68, variants: 1,
  build: function (F) {
    for (const sx of [-0.42, 0.42]) for (const sz of [-0.86, 0.86]) F.box(sx, 0, sz, 0.07, 0.42, 0.07, 0, F.col('ironwoodDark'), 'wood');
    F.box(0, 0.42, 0, 0.94, 0.06, 1.88, 0, F.col('cedar'), 'wood');
    F.box(0, 0.48, 0.04, 0.88, 0.11, 1.76, 0, F.col('woolCream'), 'cloth');
    F.bolster(0, 0.63, -0.66, 0.74, 0.08, 0, F.col('woolCream'), 'cloth');
  }
});

FURN({
  key: 'yonni_trade_barrels', name: 'Bronze-hooped mead & salt-fish casks', culture: 'yonni', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['tavern', 'store', 'kitchen', 'yard'], anchor: 'wall', clearance: { front: 0.45 },
  materials: ['timber', 'bronze'],
  w: 1.32, d: 0.68, h: 0.88, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.28, 0.14, 0.58, 0, F.col('ironwoodDark'), 'wood');
    for (const sx of [-0.34, 0.34]) {
      F.cyl(sx, 0.14, 0, 0.26, 0.68, 0, F.col('cedar'), 'wood');
      F.cyl(sx, 0.82, 0, 0.24, 0.035, 0, F.col('bronze'), 'bronze');
    }
  }
});

FURN({
  key: 'yonni_trade_stall', name: 'Market counter with amber & tin wares', culture: 'yonni', tier: 'common', type: 'stall', setting: 'both',
  rooms: ['market', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.7, back: 0.6 },
  materials: ['timber', 'cloth', 'bronze', 'terracotta'],
  w: 1.75, d: 0.82, h: 0.96, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.68, 0.76, 0.74, 0, F.col('ironwood'), 'wood');
    F.box(0, 0.76, 0, 1.74, 0.05, 0.8, 0, F.col('carnelian'), 'cloth');
    F.box(-0.46, 0.81, 0, 0.36, 0.09, 0.28, 0, F.col('bronze'), 'bronze');
    F.cyl(0.05, 0.81, 0.06, 0.12, 0.14, 0, F.col('terracotta'), 'terracotta');
    F.box(0.48, 0.81, -0.04, 0.34, 0.11, 0.26, 0, F.col('amber'), 'stone');
  }
});

FURN({
  key: 'yonni_works_weigh_scale', name: 'Tin-bronze harbour & market balance beam', culture: 'yonni', tier: 'common', type: 'tool', setting: 'both',
  rooms: ['market', 'shop', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'bronze'],
  w: 0.96, d: 0.48, h: 1.48, variants: 1,
  build: function (F) {
    const bz = F.col('bronze');
    F.cyl(0, 0, 0, 0.22, 0.12, 0, F.col('granite'), 'stone');
    F.cyl(0, 0.12, 0, 0.038, 1.28, 0, bz, 'bronze');
    F.box(0, 1.4, 0, 0.86, 0.045, 0.045, 0, bz, 'bronze');
    for (const sx of [-0.38, 0.38]) {
      F.cyl(sx, 0.68, 0, 0.012, 0.72, 0, bz, 'bronze');
      F.cyl(sx, 0.63, 0, 0.15, 0.05, 0, F.col('verdigris'), 'bronze');
    }
  }
});

FURN({
  key: 'yonni_works_scribe_desk', name: 'Seer-scribe sloped tally desk & scrolls', culture: 'yonni', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['study', 'hall', 'school'], anchor: 'wall', clearance: { front: 0.65 },
  materials: ['timber', 'bronze', 'cloth'],
  w: 1.22, d: 0.68, h: 1.04, variants: 1,
  build: function (F) {
    for (const sx of [-0.52, 0.52]) for (const sz of [-0.24, 0.24]) F.box(sx, 0, sz, 0.08, 0.72, 0.08, 0, F.col('ironwoodDark'), 'wood');
    F.box(0, 0.72, 0, 1.18, 0.06, 0.64, 0, F.col('ironwood'), 'wood');
    F.box(-0.24, 0.78, -0.08, 0.48, 0.08, 0.34, 0, F.col('woolCream'), 'cloth');
    F.box(0.32, 0.78, -0.14, 0.38, 0.24, 0.24, 0, F.col('cedar'), 'wood');
    F.cyl(0.12, 0.78, 0.12, 0.045, 0.1, 0, F.col('bronze'), 'bronze');
  }
});

FURN({
  key: 'yonni_trade_bin', name: 'Sealed sea-lime & cedar grain bin', culture: 'yonni', tier: 'common', type: 'storage', setting: 'both',
  rooms: ['store', 'barn', 'kitchen'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['stone', 'timber', 'food'],
  w: 1.42, d: 0.74, h: 0.92, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.38, 0.68, 0.7, 0, F.col('sealime'), 'stone');
    F.box(0, 0.68, 0, 1.3, 0.09, 0.62, 0, F.col('bread'), 'food');
    F.box(0, 0.77, -0.16, 1.4, 0.06, 0.36, 0, F.col('ironwood'), 'wood');
  }
});

FURN({
  key: 'yonni_works_churn', name: 'Coastal sheep-milk churn & cheese press', culture: 'yonni', tier: 'common', type: 'workstation', setting: 'both',
  rooms: ['kitchen', 'workshop', 'barn'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'bronze', 'food'],
  w: 0.96, d: 0.58, h: 1.05, variants: 1,
  build: function (F) {
    F.frustum(-0.24, 0, 0, 0.2, 0.15, 0.66, 0, F.col('cedar'), 'wood', 12);
    F.cyl(-0.24, 0.66, 0, 0.025, 0.38, 0, F.col('ironwood'), 'wood');
    F.box(0.24, 0, 0, 0.42, 0.46, 0.42, 0, F.col('ironwoodDark'), 'wood');
    F.cyl(0.24, 0.46, 0, 0.16, 0.14, 0, F.col('woolCream'), 'food');
    F.cyl(0.24, 0.6, 0, 0.18, 0.05, 0, F.col('bronze'), 'bronze');
  }
});
