/* ======================================================================
 Petty Gorge-Kingdoms of Dzagh-Vardzi Furniture Registry (culture: 'dzagh-vardzi')
 Bundled inside KratorFurniture by kits/dzagh-vardzi/build.py alongside kits/catalog
 sets. Every piece uses canonical CATALOG_MATERIALS families (textured via
 materials.json f_* triplanar detail maps in 91f-furnish.js) and >= 5 mm
 joinery offsets so zero coplanar same-normal faces exist.
 ====================================================================== */
FURN_CULTURE('dzagh-vardzi', {
 name: 'Petty Gorge-Kingdoms of Dzagh-Vardzi',
 pack: null,
 influences: 'Armenian Akhtamar & Georgian Vardzia polychrome tuff/jade + Dagestani/Svan koshki gorge chivalry',
 materials: 'red-cypress timber, apricot-rose tuff, charcoal basalt, sawn emerald nephrite jade, golden skarn, tin-bronze & magnetite scale-mail, verdigris copper, qvevri terracotta, sheepskin fleece, kilim wool',
 palette: {
  cypress: 0x6e3a28, cypressDark: 0x462218, cypressLight: 0x94583c, plank: 0x866246,
  tuff: 0xd28466, tuffDark: 0xb6684c, basalt: 0x383a3e, skarn: 0xd4a456, quartz: 0xf0eee8,
  jade: 0x288458, jadeBright: 0x36a26c, bronze: 0xb88a44, verdigris: 0x4e9280,
  magnetite: 0x2e3034, silver: 0xcfd4da, gold: 0xdca83a,
  terracotta: 0xb85c3c, wax: 0xd8b458, fleece: 0xebe3d0,
  crimson: 0x9e2c28, saffron: 0xc88c30, indigo: 0x2a4668, woolCream: 0xe2d8c4,
  apricot: 0xe6842c, bread: 0xc68e46, bamboo: 0xb68c48, rope: 0x9c8054, flame: 0xffb24a, ember: 0xe86020
 }
});

/* ---- 1. Chivalric Court, Duelling & Weregild Pieces ---- */
FURN({
 key: 'dv_throne_mepe', name: 'Dzagh-Mepe jade-inlaid apricot-tuff throne', culture: 'dzagh-vardzi', tier: 'court', type: 'seating', setting: 'indoor',
 rooms: ['throne', 'court', 'hall'], anchor: 'wall', clearance: { front: 1.0 },
 materials: ['stone', 'jade', 'bronze', 'cloth', 'metal'],
 w: 1.65, d: 1.25, h: 2.35, variants: 1,
 build: function (F) {
  const tf = F.col('tuff'), bs = F.col('basalt'), jd = F.col('jade'), sk = F.col('skarn'), bz = F.col('bronze');
  F.box(0,0,0,1.6,0.16,1.2,0,bs,'stone');
  F.box(0,0.166,-0.04,1.38,0.15,1.04,0,tf,'stone');
  F.box(0,0.322,-0.04,0.96,0.42,0.78,0,bs,'stone');
  F.box(0,0.748,0.02,0.76,0.085,0.62,0,F.col('crimson'),'cloth');
  for (const s of [-0.46, 0.46]) {
   F.box(s,0.748,0.03,0.14,0.32,0.64,0,sk,'stone');
   F.ball(s,1.09,0.3,0.065,jd,'jade');
  }
  F.box(0,0.748,-0.39,0.98,1.26,0.14,0,tf,'stone');
  F.cone(0,2.014,-0.39,0.52,0.32,0,sk,'stone');
    /* sawn emerald nephrite cross-medallion proud of backrest */
  F.box(0,1.36,-0.305,0.12,0.42,0.024,0,jd,'jade');
  F.box(0,1.54,-0.295,0.34,0.11,0.022,0,F.col('jadeBright'),'jade');
  F.ball(0,1.595,-0.278,0.045,bz,'bronze');
    /* crossed silver-chased broadswords behind crest */
  F.rod(-0.56,0.92,-0.49,0.52,2.18,-0.48,0.022,F.col('silver'),'metal');
  F.rod(0.56,0.92,-0.53,-0.52,2.18,-0.52,0.022,F.col('silver'),'metal');
 }
});

FURN({
 key: 'dv_armour_stand_scale', name: 'Heirloom tin-bronze & magnetite scale-hauberk stand', culture: 'dzagh-vardzi', tier: 'court', type: 'rack', setting: 'indoor',
 rooms: ['armoury', 'hall', 'barracks', 'bedroom'], anchor: 'floor', clearance: { front: 0.55 },
 materials: ['timber', 'bronze', 'metal', 'jade'],
 w: 0.86, d: 0.68, h: 1.88, variants: 1,
 build: function (F) {
  const cy = F.col('cypressDark'), bz = F.col('bronze'), mg = F.col('magnetite');
  F.box(0,0,0,0.68,0.1,0.58,0,cy,'wood');
  F.cyl(0,0.106,0,0.048,1.48,0,cy,'wood');
  F.box(0,1.36,0,0.72,0.08,0.1,0,cy,'wood');
    /* alternating tin-bronze & magnetite scale-mail hauberk tiers */
  F.frustum(0,0.68,0,0.28,0.23,0.32,0,mg,'metal',12);
  F.frustum(0,1.006,0,0.25,0.29,0.36,0,bz,'bronze',12);
  for (const s of [-0.32, 0.32]) F.frustum(s, 1.14, 0, 0.11, 0.09, 0.26, 0, bz, 'bronze', 10);
    /* conical nasal helm with nephrite brow boss */
  F.cyl(0,1.59,0,0.13,0.1,0,mg,'metal');
  F.cone(0,1.695,0,0.135,0.18,0,bz,'bronze');
  F.ball(0,1.66,0.138,0.032,F.col('jadeBright'),'jade');
 }
});

FURN({
 key: 'dv_rack_buckler_sword', name: 'Nephrite-bossed buckler & silver broadsword rack', culture: 'dzagh-vardzi', tier: 'common', type: 'rack', setting: 'both',
 rooms: ['hall', 'barracks', 'armoury', 'living'], anchor: 'wall', clearance: { front: 0.48 },
 materials: ['timber', 'bronze', 'jade', 'metal'],
 w: 1.28, d: 0.42, h: 1.72, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), bz = F.col('bronze'), jd = F.col('jadeBright'), sv = F.col('silver');
  F.box(0,0,0,1.22,0.1,0.36,0,F.col('cypressDark'),'wood');
  for (const s of [-0.52, 0.52]) F.box(s, 0.106, -0.08, 0.08, 1.48, 0.09, 0, cy, 'wood');
  F.box(0,1.28,-0.08,0.94,0.08,0.11,0,cy,'wood');
  F.box(0,0.56,-0.08,0.94,0.08,0.11,0,cy,'wood');
    /* three upright silver-chased broadswords */
  for (const sx of [-0.32, 0, 0.32]) {
   F.box(sx,0.112,0.02,0.046,1.18,0.018,0,sv,'metal');
   F.box(sx,1.298,0.02,0.22,0.032,0.036,0,bz,'bronze');
   F.cyl(sx,1.335,0.02,0.022,0.16,0,cy,'wood');
   F.ball(sx,1.51,0.02,0.034,jd,'jade');
  }
    /* two nephrite-bossed bronze bucklers hung in front */
  for (const sx of [-0.26, 0.26]) {
   F.cyl(sx,0.84,0.09,0.22,0.036,Math.PI / 2,bz,'bronze');
   F.ball(sx,0.84,0.135,0.062,jd,'jade');
  }
 }
});

FURN({
 key: 'dv_scale_weregild', name: 'Nephrite-slab weregild court balance-scale', culture: 'dzagh-vardzi', tier: 'court', type: 'tool', setting: 'both',
 rooms: ['court', 'hall', 'market', 'shop'], anchor: 'floor', clearance: { front: 0.65 },
 materials: ['stone', 'bronze', 'jade'],
 w: 1.36, d: 0.62, h: 1.76, variants: 1,
 build: function (F) {
  const bs = F.col('basalt'), sk = F.col('skarn'), bz = F.col('bronze'), jd = F.col('jade');
  F.box(0,0,0,0.72,0.16,0.54,0,bs,'stone');
  F.frustum(0,0.166,0,0.18,0.12,0.38,0,sk,'stone',10);
  F.cyl(0,0.552,0,0.045,1.08,0,bz,'bronze');
  F.box(0,1.638,0,1.22,0.055,0.055,0,bz,'bronze');
  F.cone(0,1.698,0,0.06,0.06,0,jd,'jade');
  for (const s of [-0.52, 0.52]) {
   F.cyl(s,0.82,0,0.014,0.81,0,bz,'bronze');
   F.cyl(s,0.76,0,0.22,0.05,0,F.col('verdigris'),'bronze');
  }
    /* sawn nephrite weregild slab on left pan, bronze standard weights on right pan */
  F.box(-0.52,0.816,0,0.26,0.075,0.18,0,F.col('jadeBright'),'jade');
  F.cyl(0.47,0.816,0,0.055,0.09,0,bz,'bronze');
  F.cyl(0.58,0.816,0,0.042,0.07,0,F.col('gold'),'gold');
 }
});

/* ---- 2. Gorge Domestic Hearths, Qvevri Brandy & Rooftop Apricot Drying ---- */
FURN({
 key: 'dv_dedabodzi_hearth', name: 'Dedabodzi carved hearth-pillar & ochakhi cauldron', culture: 'dzagh-vardzi', tier: 'common', type: 'hearth', setting: 'indoor',
 rooms: ['living', 'hall', 'kitchen', 'tavern'], anchor: 'floor', clearance: { front: 0.7, back: 0.5, left: 0.5, right: 0.5 },
 materials: ['stone', 'timber', 'bronze', 'metal', 'emissive'],
 w: 1.55, d: 1.55, h: 2.38, variants: 1,
 build: function (F) {
  const bs = F.col('basalt'), cy = F.col('cypress'), bz = F.col('bronze'), mg = F.col('magnetite');
    /* carved red-cypress Dedabodzi mother-pillar at rear (-z) */
  F.box(0,0,-0.48,0.42,0.18,0.42,0,bs,'stone');
  F.box(0,0.186,-0.48,0.3,1.82,0.3,0,cy,'wood');
  F.box(0,2.012,-0.22,0.88,0.16,0.86,0,F.col('cypressLight'),'wood');
  F.box(0,2.178,-0.1,0.22,0.18,1.05,0,F.col('cypressDark'),'wood');
    /* basalt hearth curb + glowing coals + iron chain & bronze cauldron */
  F.cyl(0,0.006,0.24,0.52,0.15,0,bs,'stone');
  F.cyl(0,0.162,0.24,0.38,0.05,0,F.col('ember'),'glow');
  F.cyl(0,0.68,0.24,0.018,1.48,0,mg,'metal');
  F.frustum(0,0.38,0.24,0.22,0.28,0.28,0,bz,'bronze',12);
  F.lamp(0,0.34,0.24,0.95,7);
 }
});

FURN({
 key: 'dv_qvevri_rack', name: 'Qvevri apricot-brandy clay amphora rack', culture: 'dzagh-vardzi', tier: 'common', type: 'storage', setting: 'both',
 rooms: ['tavern', 'kitchen', 'store', 'winery', 'living'], anchor: 'wall', clearance: { front: 0.5 },
 materials: ['timber', 'terracotta', 'wax', 'bronze'],
 w: 1.52, d: 0.66, h: 1.12, variants: 1,
 build: function (F) {
  const cy = F.col('cypressDark'), tc = F.col('terracotta');
  for (const s of [-0.66, 0.66]) F.box(s, 0, 0, 0.1, 0.58, 0.56, 0, cy, 'wood');
  F.box(0,0.38,0,1.46,0.09,0.5,0,F.col('cypress'),'wood');
  for (const sx of [-0.44, 0, 0.44]) {
   F.frustum(sx,0.08,0,0.09,0.2,0.44,0,tc,'terracotta',12);
   F.frustum(sx,0.526,0,0.2,0.11,0.36,0,tc,'terracotta',12);
   F.cyl(sx,0.892,0,0.125,0.06,0,tc,'terracotta');
   F.cyl(sx,0.958,0,0.11,0.035,0,F.col('wax'),'wax');
  }
  F.rod(0.62,0.5,0.26,0.54,1.08,0.22,0.016,F.col('bronze'),'bronze');
 }
});

FURN({
 key: 'dv_qvevri_floor_pit', name: 'Buried marani qvevri amphora mouths & slate lids', culture: 'dzagh-vardzi', tier: 'common', type: 'storage', setting: 'indoor',
 rooms: ['winery', 'tavern', 'store'], anchor: 'floor', clearance: { front: 0.45 },
 materials: ['stone', 'terracotta', 'wax'],
 w: 1.68, d: 0.78, h: 0.26, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.62,0.08,0.72,0,F.col('tuff'),'stone');
  for (const sx of [-0.5, 0, 0.5]) {
   F.cyl(sx,0.086,0,0.21,0.08,0,F.col('terracotta'),'terracotta');
   F.cyl(sx,0.172,0,0.19,0.045,0,F.col('basalt'),'stone');
   F.cone(sx,0.222,0,0.06,0.04,0,F.col('wax'),'wax');
  }
 }
});

FURN({
 key: 'dv_apricot_drying_tray', name: 'Sunny roof-terrace apricot-drying wicker rack', culture: 'dzagh-vardzi', tier: 'common', type: 'workstation', setting: 'both',
 rooms: ['yard', 'kitchen', 'barn', 'living'], anchor: 'floor', clearance: { front: 0.5 },
 materials: ['timber', 'wicker', 'food'],
 w: 1.56, d: 0.92, h: 0.84, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), ap = F.col('apricot');
  for (const sx of [-0.68, 0.68]) {
   F.box(sx,0,-0.36,0.07,0.76,0.07,0,cy,'wood');
   F.box(sx,0,0.36,0.07,0.54,0.07,0,cy,'wood');
  }
  F.box(0,0.56,0,1.48,0.06,0.84,0,F.col('plank'),'wicker');
    /* rows of golden-orange drying Vardzieti apricots */
  for (const sx of [-0.48, -0.16, 0.16, 0.48]) for (const sz of [-0.24, 0, 0.24]) {
   F.ball(sx,0.655,sz,0.055,ap,'food');
  }
 }
});

FURN({
 key: 'dv_pulley_basket', name: 'Aerial ropeway gorge supply basket & winch', culture: 'dzagh-vardzi', tier: 'common', type: 'storage', setting: 'both',
 rooms: ['yard', 'store', 'hall'], anchor: 'floor', clearance: { front: 0.5 },
 materials: ['wicker', 'timber', 'metal', 'rope', 'bronze'],
 w: 0.96, d: 0.96, h: 1.18, variants: 1,
 build: function (F) {
  F.box(0,0,0,0.88,0.09,0.88,0,F.col('cypressDark'),'wood');
  F.frustum(0,0.096,0,0.36,0.44,0.62,0,F.col('plank'),'wicker',10);
  F.cyl(0,0.722,0,0.45,0.045,0,F.col('magnetite'),'metal');
  for (const s of [-0.34, 0.34]) F.rod(s, 0.76, 0, 0, 1.08, 0, 0.02, F.col('rope'), 'rope');
  F.cyl(0,1.08,0,0.09,0.06,Math.PI / 2,F.col('bronze'),'bronze');
 }
});

/* ---- 3. Flume-Forge, Golden-Fleece & Nephrite Wire-Saw Workstations ---- */
FURN({
 key: 'dv_sluice_fleece_trough', name: 'Sheepskin Golden-Fleece placer-gold sluice trough', culture: 'dzagh-vardzi', tier: 'common', type: 'workstation', setting: 'both',
 rooms: ['workshop', 'yard', 'mine'], anchor: 'floor', clearance: { front: 0.6 },
 materials: ['timber', 'fur', 'gold', 'stone'],
 w: 1.88, d: 0.78, h: 0.92, variants: 1,
 build: function (F) {
  const wd = F.col('cypressDark'), fl = F.col('fleece'), gd = F.col('gold');
  F.box(-0.72,0,0,0.14,0.78,0.68,0,wd,'wood');
  F.box(0.72,0,0,0.14,0.52,0.68,0,wd,'wood');
  F.box(0,0.58,0,1.78,0.12,0.66,0,F.col('plank'),'wood');
  for (const s of [-0.29, 0.29]) F.box(0, 0.706, s, 1.76, 0.14, 0.06, 0, F.col('cypress'), 'wood');
    /* cream woollen sheepskin fleece lining flecked with trapped placer gold! */
  F.box(0,0.706,0,1.62,0.055,0.44,0,fl,'fur');
  for (const sx of [-0.52, -0.18, 0.16, 0.48]) {
   F.box(sx,0.768,0,0.05,0.035,0.42,0,wd,'wood');
   F.ball(sx - 0.09,0.782,0.06,0.028,gd,'gold');
   F.ball(sx + 0.07,0.782,-0.07,0.024,gd,'gold');
  }
 }
});

FURN({
 key: 'dv_anvil_triphammer', name: 'Waterwheel trip-hammer magnetite anvil & helve', culture: 'dzagh-vardzi', tier: 'common', type: 'workstation', setting: 'both',
 rooms: ['smithy', 'workshop', 'foundry'], anchor: 'floor', clearance: { front: 0.7 },
 materials: ['stone', 'metal', 'timber', 'bronze', 'emissive'],
 w: 1.76, d: 0.86, h: 1.38, variants: 1,
 build: function (F) {
  const bs = F.col('basalt'), mg = F.col('magnetite'), cy = F.col('cypressDark');
  F.box(-0.46,0,0,0.64,0.54,0.64,0,bs,'stone');
  F.box(-0.46,0.546,0,0.46,0.24,0.34,0,mg,'metal');
  F.box(-0.46,0.792,0,0.26,0.055,0.14,0,F.col('ember'),'glow');
    /* pivoted heavy timber trip-hammer frame & iron tup */
  for (const sz of [-0.28, 0.28]) F.box(0.54, 0, sz, 0.16, 1.18, 0.16, 0, cy, 'wood');
  F.cyl(0.54,0.96,0,0.07,0.74,Math.PI / 2,F.col('bronze'),'bronze');
  F.box(0.06,0.98,0,1.24,0.14,0.16,0,F.col('cypress'),'wood');
  F.box(-0.46,0.86,0,0.22,0.24,0.22,0,mg,'metal');
 }
});

FURN({
 key: 'dv_wiresaw_frame', name: 'Nephrite pendulum abrasive wire-saw bench', culture: 'dzagh-vardzi', tier: 'common', type: 'workstation', setting: 'both',
 rooms: ['workshop', 'mill', 'yard'], anchor: 'floor', clearance: { front: 0.65 },
 materials: ['stone', 'jade', 'timber', 'metal', 'terracotta'],
 w: 1.72, d: 0.88, h: 1.56, variants: 1,
 build: function (F) {
  const bs = F.col('basalt'), jd = F.col('jade'), cy = F.col('cypress'), mg = F.col('magnetite');
  F.box(0,0,0,1.56,0.48,0.78,0,bs,'stone');
    /* half-sawn emerald nephrite boulder on cutting bed */
  F.box(-0.18,0.486,0,0.52,0.42,0.48,0,jd,'jade');
  F.box(0.22,0.486,0,0.16,0.42,0.48,0,F.col('jadeBright'),'jade');
    /* overhead iron & cypress pendulum bow-frame + quartz-sand slurry hopper */
  for (const sx of [-0.68, 0.68]) F.box(sx, 0.486, 0, 0.1, 0.96, 0.1, 0, cy, 'wood');
  F.box(0,1.452,0,1.52,0.09,0.12,0,cy,'wood');
  F.box(0,0.78,0,1.26,0.024,0.024,0,mg,'metal');
  F.frustum(0.02,1.12,0,0.06,0.18,0.28,0,F.col('terracotta'),'terracotta',10);
 }
});

/* ---- 4. Household Beds, Feast Tables, Seating & Storage ---- */
FURN({
 key: 'dv_poor_pallet', name: 'Gorge-shepherd sheepskin & felt sleeping platform', culture: 'dzagh-vardzi', tier: 'poor', type: 'bed', setting: 'indoor',
 rooms: ['bedroom', 'living', 'barracks'], anchor: 'wall', clearance: { front: 0.5 },
 materials: ['timber', 'fur', 'cloth'],
 w: 1.08, d: 1.9, h: 0.38, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.04,0.14,1.86,0,F.col('cypressDark'),'wood');
  F.box(0,0.146,0.02,0.96,0.1,1.76,0,F.col('fleece'),'fur');
  F.box(0,0.252,0.28,0.92,0.045,1.02,0,F.col('crimson'),'cloth');
  F.bolster(0,0.31,-0.64,0.78,0.08,0,F.col('saffron'),'cloth');
 }
});

FURN({
 key: 'dv_common_alcove_bed', name: 'Carved red-cypress & kilim box-bed', culture: 'dzagh-vardzi', tier: 'common', type: 'bed', setting: 'indoor',
 rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.6 },
 materials: ['timber', 'cloth', 'jade'],
 w: 1.48, d: 1.96, h: 1.16, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), cyd = F.col('cypressDark');
  F.box(0,0,0,1.44,0.24,1.92,0,cyd,'wood');
  F.box(0,0.246,-0.89,1.46,0.86,0.1,0,cy,'wood');
  F.ball(0,0.78,-0.825,0.055,F.col('jadeBright'),'jade');
  F.box(0,0.246,0.05,1.34,0.15,1.72,0,F.col('woolCream'),'cloth');
  F.box(0,0.402,0.28,1.3,0.048,1.08,0,F.col('crimson'),'cloth');
  F.bolster(0,0.46,-0.62,1.12,0.095,0,F.col('indigo'),'cloth');
 }
});

FURN({
 key: 'dv_court_mepe_bed', name: 'Royal cousin canopied nephrite-finial bed', culture: 'dzagh-vardzi', tier: 'court', type: 'bed', setting: 'indoor',
 rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.7 },
 materials: ['stone', 'timber', 'bronze', 'jade', 'cloth'],
 w: 2.05, d: 2.1, h: 2.18, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), bz = F.col('bronze'), jd = F.col('jadeBright');
  F.box(0,0,0,2.0,0.14,2.04,0,F.col('tuff'),'stone');
  F.box(0,0.146,0,1.88,0.18,1.92,0,F.col('cypressDark'),'wood');
  F.box(0,0.332,-0.86,1.56,0.98,0.08,0,cy,'wood');
  for (const sx of [-0.86, 0.86]) for (const sz of [-0.88, 0.88]) {
   F.cyl(sx,0.332,sz,0.052,1.56,0,cy,'wood');
   F.ball(sx,1.94,sz,0.06,jd,'jade');
  }
  F.box(0,1.898,0,1.92,0.09,1.94,0,cy,'wood');
  F.cone(0,1.994,0,0.82,0.18,0,F.col('verdigris'),'bronze');
  F.box(0,0.338,0.06,1.62,0.155,1.68,0,F.col('woolCream'),'cloth');
  F.box(0,0.5,0.28,1.58,0.05,1.1,0,F.col('crimson'),'cloth');
  F.bolster(0,0.56,-0.58,1.4,0.1,0,F.col('saffron'),'cloth');
 }
});

FURN({
 key: 'dv_feast_table_brandy', name: 'Chivalric apricot-brandy & ibex-horn feast table', culture: 'dzagh-vardzi', tier: 'court', type: 'table', setting: 'indoor',
 rooms: ['hall', 'tavern', 'dining'], anchor: 'floor', clearance: { front: 0.75, back: 0.75 },
 materials: ['timber', 'bronze', 'bone', 'terracotta', 'food', 'cloth'],
 w: 2.55, d: 1.06, h: 0.98, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), bz = F.col('bronze');
  for (const sx of [-0.96, 0.96]) {
   F.box(sx,0,0,0.16,0.12,0.88,0,F.col('cypressDark'),'wood');
   F.box(sx,0.126,0,0.14,0.58,0.56,0,cy,'wood');
  }
  F.box(0,0.712,0,2.5,0.075,1.02,0,F.col('cypressLight'),'wood');
  F.box(0,0.793,0,2.1,0.025,0.38,0,F.col('crimson'),'cloth');
    /* copper brandy ewer, terracotta platters & curved ibex drinking horns */
  F.frustum(-0.55,0.824,0,0.09,0.055,0.22,0,bz,'bronze',10);
  F.cyl(0.1,0.824,0.04,0.19,0.045,0,F.col('terracotta'),'terracotta');
  F.ball(0.1,0.895,0.04,0.085,F.col('bread'),'food');
  F.cone(0.68,0.824,-0.1,0.055,0.22,0.4,F.col('fleece'),'bone');
  F.cone(-0.18,0.824,-0.18,0.05,0.2,-0.4,F.col('fleece'),'bone');
 }
});

FURN({
 key: 'dv_common_table', name: 'Gorge-household red-cypress trestle table', culture: 'dzagh-vardzi', tier: 'common', type: 'table', setting: 'both',
 rooms: ['living', 'kitchen', 'tavern', 'dining'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
 materials: ['timber', 'terracotta', 'food'],
 w: 1.56, d: 0.86, h: 0.88, variants: 1,
 build: function (F) {
  for (const sx of [-0.58, 0.58]) for (const sz of [-0.32, 0.32]) F.box(sx, 0, sz, 0.09, 0.7, 0.09, 0, F.col('cypressDark'), 'wood');
  F.box(0,0.706,0,1.52,0.065,0.82,0,F.col('cypress'),'wood');
  F.cyl(-0.26,0.777,0,0.11,0.14,0,F.col('terracotta'),'terracotta');
  F.cyl(0.28,0.777,0.06,0.14,0.05,0,F.col('bread'),'food');
 }
});

FURN({
 key: 'dv_carved_chair', name: 'Chip-carved Vardzieti stuli armchair', culture: 'dzagh-vardzi', tier: 'common', type: 'seating', setting: 'indoor',
 rooms: ['hall', 'living', 'study', 'court'], anchor: 'floor', clearance: { front: 0.45 },
 materials: ['timber', 'cloth'],
 w: 0.64, d: 0.6, h: 1.06, variants: 1,
 build: function (F) {
  const cy = F.col('cypress');
  for (const sx of [-0.25, 0.25]) for (const sz of [-0.23, 0.23]) F.box(sx, 0, sz, 0.07, 0.44, 0.07, 0, F.col('cypressDark'), 'wood');
  F.box(0,0.446,0,0.58,0.055,0.54,0,cy,'wood');
  F.box(0,0.514,0.035,0.46,0.05,0.41,0,F.col('crimson'),'cloth');
  F.box(0,0.507,-0.23,0.56,0.54,0.065,0,cy,'wood');
 }
});

FURN({
 key: 'dv_common_stool', name: 'Three-legged cypress hearth stool', culture: 'dzagh-vardzi', tier: 'common', type: 'seating', setting: 'both',
 rooms: ['living', 'kitchen', 'tavern', 'workshop'], anchor: 'floor', clearance: { front: 0.35 },
 materials: ['timber', 'fur'],
 w: 0.46, d: 0.46, h: 0.48, variants: 1,
 build: function (F) {
  for (let i = 0; i < 3; i++) {
   const ang = i * Math.PI * 2 / 3;
   F.cyl(Math.cos(ang) * 0.14,0,Math.sin(ang) * 0.14,0.032,0.4,0,F.col('cypressDark'),'wood');
  }
  F.cyl(0,0.406,0,0.21,0.048,0,F.col('cypress'),'wood');
  F.cyl(0,0.46,0,0.18,0.025,0,F.col('fleece'),'fur');
 }
});

FURN({
 key: 'dv_chest_jade_inlay', name: 'Iron-strapped heirloom chest with nephrite boss', culture: 'dzagh-vardzi', tier: 'common', type: 'storage', setting: 'indoor',
 rooms: ['bedroom', 'living', 'hall', 'store'], anchor: 'wall', clearance: { front: 0.5 },
 materials: ['timber', 'metal', 'jade'],
 w: 1.18, d: 0.58, h: 0.64, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.14,0.5,0.54,0,F.col('cypress'),'wood');
  F.box(0,0.506,0,1.18,0.11,0.58,0,F.col('cypressDark'),'wood');
  for (const sx of [-0.42, 0.42]) F.box(sx, 0.01, 0, 0.055, 0.615, 0.6, 0, F.col('magnetite'), 'metal');
  F.box(0,0.32,0.285,0.14,0.14,0.024,0,F.col('jadeBright'),'jade');
 }
});

FURN({
 key: 'dv_shelves_provisions', name: 'Gorge larder shelves with dried apricots & brandy jugs', culture: 'dzagh-vardzi', tier: 'common', type: 'storage', setting: 'indoor',
 rooms: ['kitchen', 'store', 'living', 'shop'], anchor: 'wall', clearance: { front: 0.45 },
 materials: ['timber', 'terracotta', 'food', 'wicker'],
 w: 1.36, d: 0.46, h: 1.76, variants: 1,
 build: function (F) {
  const cy = F.col('cypressDark'), pl = F.col('cypress');
  for (const sx of [-0.6, 0.6]) F.box(sx, 0, 0, 0.08, 1.74, 0.42, 0, cy, 'wood');
  for (const sy of [0.16, 0.72, 1.28]) F.box(0, sy, 0, 1.1, 0.05, 0.38, 0, pl, 'wood');
  F.frustum(-0.32,0.216,0,0.1,0.13,0.34,0,F.col('terracotta'),'terracotta',10);
  F.box(0.26,0.216,0,0.38,0.26,0.3,0,F.col('plank'),'wicker');
  F.cyl(-0.28,0.776,0,0.14,0.12,0,F.col('woolCream'),'food');
  F.box(0.24,0.776,0,0.4,0.08,0.28,0,F.col('apricot'),'food');
  F.frustum(0,1.336,0,0.11,0.08,0.32,0,F.col('terracotta'),'terracotta',10);
 }
});

/* ---- 5. Kilim Carpets, Sacred Sanctuary, Scriptorium, Lamps & Market ---- */
FURN({
 key: 'dv_rug_kilim', name: 'Woven Vardzieti crimson & emerald kilim rug', culture: 'dzagh-vardzi', tier: 'common', type: 'rug', setting: 'indoor',
 rooms: ['living', 'bedroom', 'hall', 'study'], anchor: 'floor', clearance: {},
 materials: ['cloth'],
 w: 2.1, d: 1.5, h: 0.048, variants: 1,
 build: function (F) {
  F.box(0,0.008,0,2.08,0.022,1.48,0,F.col('crimson'),'cloth');
  F.box(0,0.033,0,1.62,0.015,1.06,0,F.col('indigo'),'cloth');
 }
});

FURN({
 key: 'dv_court_carpet', name: 'Royal Gorge-Court medallion carpet', culture: 'dzagh-vardzi', tier: 'court', type: 'rug', setting: 'indoor',
 rooms: ['hall', 'throne', 'court', 'temple'], anchor: 'floor', clearance: {},
 materials: ['cloth'],
 w: 2.9, d: 2.2, h: 0.052, variants: 1,
 build: function (F) {
  F.box(0,0.008,0,2.86,0.024,2.16,0,F.col('crimson'),'cloth');
  F.box(0,0.035,0,2.28,0.017,1.62,0,F.col('saffron'),'cloth');
 }
});

FURN({
 key: 'dv_sanctuary_altar', name: 'Gumbat sanctuary nephrite cross-altar & censers', culture: 'dzagh-vardzi', tier: 'court', type: 'shrine', setting: 'both',
 rooms: ['temple', 'shrine', 'hall'], anchor: 'floor', clearance: { front: 0.8 },
 materials: ['stone', 'jade', 'bronze', 'emissive'],
 w: 1.66, d: 0.92, h: 1.92, variants: 1,
 build: function (F) {
  const tf = F.col('tuff'), bs = F.col('basalt'), jd = F.col('jadeBright'), bz = F.col('bronze');
  F.box(0,0,0,1.62,0.16,0.88,0,bs,'stone');
  F.box(0,0.166,0,1.38,0.72,0.68,0,tf,'stone');
  F.box(0,0.892,0,1.48,0.09,0.76,0,F.col('skarn'),'stone');
    /* upright carved emerald nephrite khachkar cross */
  F.box(0,0.988,-0.06,0.16,0.88,0.1,0,jd,'jade');
  F.box(0,1.54,-0.04,0.56,0.14,0.11,0,F.col('jade'),'jade');
  F.ball(0,1.61,0.03,0.05,bz,'bronze');
  for (const sx of [-0.52, 0.52]) {
   F.cyl(sx,0.988,0.08,0.075,0.24,0,bz,'bronze');
   F.ball(sx,1.26,0.08,0.042,F.col('flame'),'glow');
  }
  F.lamp(0,1.35,0.15,0.95,8);
 }
});

FURN({
 key: 'dv_scriptorium_lectern', name: 'Chivalric lineage & gorge-chronicle lectern desk', culture: 'dzagh-vardzi', tier: 'common', type: 'desk', setting: 'indoor',
 rooms: ['study', 'school', 'hall', 'court'], anchor: 'wall', clearance: { front: 0.65 },
 materials: ['timber', 'paper', 'bronze', 'jade'],
 w: 1.24, d: 0.68, h: 1.08, variants: 1,
 build: function (F) {
  const cy = F.col('cypress');
  for (const sx of [-0.52, 0.52]) for (const sz of [-0.24, 0.24]) F.box(sx, 0, sz, 0.08, 0.74, 0.08, 0, F.col('cypressDark'), 'wood');
  F.box(0,0.746,0,1.2,0.06,0.64,0,cy,'wood');
  F.box(-0.22,0.812,-0.04,0.52,0.09,0.38,0,F.col('woolCream'),'paper');
  F.cyl(0.34,0.812,0.08,0.05,0.12,0,F.col('bronze'),'bronze');
  F.box(0.32,0.812,-0.16,0.32,0.22,0.2,0,F.col('jade'),'jade');
 }
});

FURN({
 key: 'dv_brazier_copper', name: 'Verdigris-copper & apricot-tuff coal brazier', culture: 'dzagh-vardzi', tier: 'common', type: 'brazier', setting: 'both',
 rooms: ['hall', 'living', 'tavern', 'court', 'barracks'], anchor: 'floor', clearance: { front: 0.5, back: 0.5 },
 materials: ['stone', 'bronze', 'emissive'],
 w: 0.84, d: 0.84, h: 0.74, variants: 1,
 build: function (F) {
  F.cyl(0,0,0,0.36,0.14,0,F.col('tuff'),'stone');
  F.frustum(0,0.146,0,0.24,0.38,0.38,0,F.col('verdigris'),'bronze',12);
  F.cyl(0,0.532,0,0.4,0.06,0,F.col('bronze'),'bronze');
  F.cyl(0,0.598,0,0.3,0.05,0,F.col('ember'),'glow');
  F.lamp(0,0.68,0,0.85,6.5);
 }
});

FURN({
 key: 'dv_chandelier_bronze', name: 'Hanging 8-spout tin-bronze & nephrite polycandelon', culture: 'dzagh-vardzi', tier: 'court', type: 'lamp', setting: 'indoor',
 rooms: ['hall', 'temple', 'court', 'tavern'], anchor: 'ceiling', clearance: {},
 materials: ['bronze', 'jade', 'emissive'],
 w: 1.16, d: 1.16, h: 0.92, variants: 1,
 build: function (F) {
  const bz = F.col('bronze');
  F.cyl(0,0.28,0,0.022,0.62,0,bz,'bronze');
  F.cyl(0,0.16,0,0.52,0.055,0,bz,'bronze');
  F.ball(0,0.08,0,0.065,F.col('jadeBright'),'jade');
  for (let i = 0; i < 6; i++) {
   const ang = i * Math.PI / 3, rx = Math.cos(ang) * 0.48, rz = Math.sin(ang) * 0.48;
   F.ball(rx,0.25,rz,0.038,F.col('flame'),'glow');
  }
  F.lamp(0,0.14,0,1.0,8.5);
 }
});

FURN({
 key: 'dv_market_stall_jade', name: 'Flumi-Bridzi merchant counter with nephrite & tin wares', culture: 'dzagh-vardzi', tier: 'common', type: 'stall', setting: 'both',
 rooms: ['market', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.7, back: 0.55 },
 materials: ['timber', 'cloth', 'jade', 'bronze', 'terracotta'],
 w: 1.78, d: 0.84, h: 1.02, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.7,0.76,0.76,0,F.col('cypress'),'wood');
  F.box(0,0.766,0,1.76,0.05,0.82,0,F.col('crimson'),'cloth');
  F.box(-0.48,0.822,0,0.34,0.1,0.26,0,F.col('jadeBright'),'jade');
  F.box(0.02,0.822,-0.04,0.32,0.085,0.22,0,F.col('bronze'),'bronze');
  F.frustum(0.5,0.822,0.04,0.09,0.12,0.18,0,F.col('terracotta'),'terracotta',10);
 }
});

/* ---- 6. Hooks 2-4 Wonder Pieces (Hero-Troubadour Panduri Rack, Century Mepe-Qvevri Seal, Chasm-Organ Console) ---- */
FURN({
 key: 'dv_panduri_lute_rack', name: 'Ashugh-Gmiri silver-strung panduri lute & ballad rack', culture: 'dzagh-vardzi', tier: 'court', type: 'rack', setting: 'both',
 rooms: ['hall', 'tavern', 'court', 'study'], anchor: 'floor', clearance: { front: 0.55 },
 materials: ['timber', 'cloth', 'metal', 'bronze', 'jade', 'paper', 'wax'],
 w: 1.34, d: 0.52, h: 1.58, variants: 1,
 build: function (F) {
  const cy = F.col('cypress'), cyd = F.col('cypressDark'), cyl0 = F.col('cypressLight');
  F.box(0,0,0,1.28,0.09,0.46,0,cyd,'wood');
  F.box(0,0.096,0.02,0.98,0.02,0.34,0,F.col('crimson'),'cloth');
  for (const sx of [-0.56, 0.56]) F.box(sx, 0.096, -0.11, 0.075, 1.38, 0.085, 0, cy, 'wood');
  F.box(0,1.22,-0.11,1.02,0.07,0.1,0,cy,'wood');
  F.box(0,0.42,-0.11,1.02,0.055,0.18,0,cyd,'wood');
  F.box(-0.32,0.482,-0.12,0.28,0.045,0.11,0,F.col('woolCream'),'paper');
  F.cyl(-0.32,0.534,-0.12,0.028,0.02,0,F.col('crimson'),'wax');
  for (const sx of [-0.33, 0, 0.33]) {
   F.frustum(sx,0.124,0.04,0.07,0.125,0.26,0,cyl0,'wood',10);
   F.frustum(sx,0.39,0.04,0.125,0.048,0.22,0,cy,'wood',10);
   F.box(sx,0.616,0.04,0.052,0.68,0.038,0,cyd,'wood');
   F.box(sx,0.32,0.178,0.036,0.94,0.014,0,F.col('silver'),'metal');
   F.box(sx,1.304,0.04,0.14,0.032,0.036,0,F.col('bronze'),'bronze');
   F.ball(sx,1.396,0.04,0.042,F.col('jadeBright'),'jade');
  }
 }
});

FURN({
 key: 'dv_mepe_qvevri_seal', name: 'Century-buried Mepe-Qvevri gold-sealed elixir vault & jade plaque', culture: 'dzagh-vardzi', tier: 'court', type: 'storage', setting: 'indoor',
 rooms: ['winery', 'store', 'tavern', 'hall'], anchor: 'floor', clearance: { front: 0.5 },
 materials: ['stone', 'terracotta', 'wax', 'gold', 'jade', 'bronze'],
 w: 1.76, d: 0.92, h: 0.62, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.72,0.085,0.86,0,F.col('skarn'),'stone');
  for (const sx of [-0.52, 0, 0.52]) {
   F.cyl(sx,0.092,0.06,0.21,0.085,0,F.col('terracotta'),'terracotta');
   F.cyl(sx,0.184,0.06,0.185,0.045,0,F.col('basalt'),'stone');
   F.frustum(sx,0.236,0.06,0.16,0.085,0.052,0,F.col('wax'),'wax',10);
   F.cyl(sx,0.295,0.06,0.068,0.024,0,F.col('gold'),'gold');
  }
  F.box(0,0.092,-0.31,0.46,0.44,0.065,0,F.col('jade'),'jade');
  F.box(0,0.34,-0.26,0.24,0.11,0.016,0,F.col('gold'),'gold');
  F.frustum(0.68,0.092,-0.29,0.045,0.068,0.14,0,F.col('bronze'),'bronze',10);
 }
});

FURN({
 key: 'dv_chasm_organ_console', name: 'Chasm-wind pipe-organ raid-stop console & pilot flue rank', culture: 'dzagh-vardzi', tier: 'common', type: 'workstation', setting: 'both',
 rooms: ['hall', 'barracks', 'workshop', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
 materials: ['stone', 'timber', 'bronze', 'metal', 'jade', 'bamboo'],
 w: 1.64, d: 0.82, h: 1.88, variants: 1,
 build: function (F) {
  F.box(0,0,0,1.58,0.14,0.76,0,F.col('basalt'),'stone');
  F.box(0,0.147,-0.04,1.46,0.68,0.62,0,F.col('cypressDark'),'wood');
  F.box(0,0.834,-0.14,1.38,0.09,0.24,0,F.col('bronze'),'bronze');
  F.box(0,0.834,0.15,1.32,0.08,0.22,0,F.col('cypress'),'wood');
  const hs = [0.66, 0.8, 0.92, 0.8, 0.66], xs = [-0.48, -0.24, 0, 0.24, 0.48];
  for (let i = 0; i < 5; i++) {
   const sx = xs[i], bm = i % 2 === 1;
   F.cyl(sx,0.92,0.15,0.018,0.16,0,F.col('magnetite'),'metal');
   F.ball(sx,1.125,0.15,0.034,F.col('jadeBright'),'jade');
   F.cyl(sx,0.931,-0.14,bm ? 0.056 : 0.062,hs[i],0,F.col(bm ? 'bamboo' : 'verdigris'),bm ? 'bamboo' : 'bronze');
  }
 }
});
