/* ======================================================================
   Talia furniture (kits/talia, PLAN.md section 6): Iziz's vassal university
   and caravan city. White plaster and marble, Iziz orange, brass and gilt,
   walnut. What is Talia's own is what the owner's interior pictures show
   (kits/talia/refs taliaint*.jpg, talia-cloisters.jpg): tub armchairs and
   ottomans in orange, white sofas, low brass round tables, white planters
   with palms, built-in plaster benches and niches, kilims and meander-
   bordered rugs; the University's lecterns, map and specimen cases,
   bookcases, globes, slates; the academy's easels and modelling stands; a
   focal aedicule. Its interiors set chains talia -> iziz -> generic
   (kits/interiors/sets/talia.js), so every role a room needs that Talia
   does not draw comes from the Iziz sets. Court pieces carry gilt and
   brass; common and poor pieces never gilt (the owner, 2026-10-17).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('talia', { name: 'Talia', pack: 'iziz', influences: 'Greek and Byzantine; baroque, neoclassical and Indian dress; the Iziz Vernacular',
  materials: 'lime plaster, white marble, orange leather and wool, brass, gilt, walnut, terracotta',
  palette: {
    limeWhite: 0xf4f1ea, marble: 0xe8dcc6, orange: 0xe07a2a, burnt: 0xd2601e, orangeWool: 0xe8843a, terracotta: 0xc0583a,
    brass: 0xc89a48, gilt: 0xd9a040, walnut: 0x6e3a22, walnutDark: 0x4a2616, linen: 0xece6da, cobalt: 0x2f5fb8,
    kilimRed: 0xb0402a, kilimIndigo: 0x34406a, ink: 0x2a2624, slate: 0x3a3e42, paper: 0xe8dfc8, leafGreen: 0x4e7a3a,
    palmTrunk: 0x8a7a5a, soil: 0x4a3a2a, ember: 0xd9762c, glass: 0xcfe2e8
  } });
/* END PALETTE */

/* ---------------- SEATS AND TABLES (taliaint.jpg: the white rotunda's sitting room) */
FURN({
  key: 'talia_common_tub_armchair', name: 'Orange tub armchair', culture: 'talia', tier: 'common', type: 'chair', setting: 'indoor',
  rooms: ['living', 'hall', 'study', 'antechamber', 'library', 'bedroom'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['cloth', 'timber'],
  w: 0.8, d: 0.8, h: 0.8, variants: 1,
  build: function (F) {
    const o = F.col('orange');
    F.frustum(0, 0.08, 0, 0.38, 0.4, 0.34, 0, o, 'cloth', 14);                            /* the tub */
    F.frustum(0, 0.42, 0, 0.4, 0.38, 0.38, 0, F.shade(o, -0.06), 'cloth', 14);        /* the curved back */
    F.cyl(0, 0.42, 0.06, 0.32, 0.08, 0, F.col('linen'), 'cloth');                         /* the cushion */
    F.cyl(0, 0, 0, 0.2, 0.08, 0, F.col('walnut'), 'wood');                                /* the plinth */
  }
});

FURN({
  key: 'talia_common_ottoman', name: 'Orange ottoman', culture: 'talia', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'bedroom', 'library'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['cloth'],
  w: 0.6, d: 0.6, h: 0.42, variants: 1,
  build: function (F) {
    const o = F.col('orangeWool');
    F.cyl(0, 0, 0, 0.3, 0.38, 0, o, 'cloth');
    F.cyl(0, 0.38, 0, 0.27, 0.04, 0, F.shade(o, 0.08), 'cloth');
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; F.box(Math.sin(a) * 0.3, 0.16, Math.cos(a) * 0.3, 0.04, 0.04, 0.02, a, F.col('burnt'), 'cloth'); }
  }
});

FURN({
  key: 'talia_court_white_sofa', name: 'White sofa', culture: 'talia', tier: 'court', type: 'seating', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'library'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['cloth', 'gold'],
  w: 2.2, d: 0.9, h: 0.85, variants: 1,
  build: function (F) {
    const lin = F.col('linen');
    F.box(0, 0.12, 0, 2.2, 0.32, 0.9, 0, lin, 'cloth');                                  /* the seat */
    F.box(0, 0.44, -0.34, 2.2, 0.42, 0.22, 0, F.shade(lin, -0.05), 'cloth');               /* the back */
    for (const s of [-1, 1]) F.box(s * 1.0, 0.12, 0, 0.2, 0.55, 0.9, 0, F.shade(lin, -0.03), 'cloth'); /* the arms */
    for (const s of [-1, 1]) F.box(s * 0.4, 0.44, 0.1, 0.5, 0.36, 0.14, 0, F.col('orange'), 'cloth'); /* the cushions */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 1.0, 0, sz * 0.35, 0.03, 0.12, 0, F.col('gilt'), 'gold');
  }
});

FURN({
  key: 'talia_court_brass_table', name: 'Low brass round table', culture: 'talia', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'library', 'study'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['bronze'],
  w: 1.1, d: 1.1, h: 0.45, variants: 1,
  build: function (F) {
    const b = F.col('brass');
    F.cyl(0, 0.4, 0, 0.55, 0.05, 0, b, 'bronze');                                         /* the tray top */
    F.cyl(0, 0.43, 0, 0.5, 0.025, 0, F.shade(b, 0.12), 'bronze');                          /* the chased rim */
    F.frustum(0, 0, 0, 0.3, 0.12, 0.4, 0, F.shade(b, -0.15), 'bronze', 12);               /* the stand */
  }
});

FURN({
  key: 'talia_common_round_table', name: 'Round walnut table', culture: 'talia', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'kitchen', 'hall', 'tavern', 'study', 'library', 'lecture'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 },
  materials: ['timber', 'stone'],
  w: 1.2, d: 1.2, h: 0.76, variants: 1,
  build: function (F) {
    F.cyl(0, 0.7, 0, 0.6, 0.06, 0, F.col('marble'), 'stone');                            /* the marble top */
    F.cyl(0, 0.05, 0, 0.08, 0.65, 0, F.col('walnut'), 'wood');                            /* the column */
    F.cyl(0, 0, 0, 0.32, 0.06, 0, F.col('walnutDark'), 'wood');                           /* the foot */
  }
});

FURN({
  key: 'talia_common_plaster_bench', name: 'Built-in plaster bench', culture: 'talia', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['living', 'hall', 'antechamber', 'court', 'tavern', 'lecture', 'shrine'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['plaster', 'cloth'],
  w: 2.0, d: 0.55, h: 0.75, variants: 1,
  build: function (F) {
    const w = F.col('limeWhite');
    F.box(0, 0, 0, 2.0, 0.42, 0.55, 0, w, 'plaster');                                     /* the plinth */
    F.box(0, 0.42, -0.2, 2.0, 0.33, 0.15, 0, F.shade(w, -0.03), 'plaster');                /* the back */
    F.box(0, 0.42, 0.06, 1.9, 0.06, 0.42, 0, F.col('orangeWool'), 'cloth');             /* the cushion */
  }
});

/* ---------------- STORAGE, SHELVES, NICHES */
FURN({
  key: 'talia_common_wall_niche', name: 'Plaster wall niche', culture: 'talia', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['living', 'kitchen', 'hall', 'bedroom', 'antechamber', 'study', 'shrine'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['plaster', 'terracotta'],
  w: 1.0, d: 0.35, h: 2.0, variants: 1,
  build: function (F) {
    const w = F.col('limeWhite'), o = F.col('orange');
    F.box(0, 0, 0, 1.0, 2.0, 0.35, 0, w, 'plaster');                                      /* the pier */
    F.box(0, 0.5, 0.06, 0.7, 1.2, 0.2, 0, o, 'plaster');                                 /* the orange-lined niche */
    for (const [x, y] of [[-0.18, 0.5], [0.16, 0.5], [0, 1.1]]) F.frustum(x, y, 0.08, 0.08, 0.05, 0.22, 0, F.col('terracotta'), 'terracotta', 8); /* jars */
  }
});

FURN({
  key: 'talia_common_painted_chest', name: 'Orange painted chest', culture: 'talia', tier: 'common', type: 'storage', role: 'chest', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store', 'study', 'dormitory'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 1.0, d: 0.5, h: 0.55, variants: 1,
  build: function (F) {
    const o = F.col('orange');
    F.box(0, 0.06, 0, 1.0, 0.44, 0.5, 0, o, 'wood');
    F.box(0, 0.5, 0, 1.04, 0.06, 0.5, 0, F.col('walnut'), 'wood');                      /* the lid */
    F.box(0, 0.25, 0.26, 0.9, 0.06, 0.01, 0, F.col('limeWhite'), 'wood');                /* the white band */
    for (const s of [-1, 1]) F.box(s * 0.46, 0, 0, 0.06, 0.06, 0.5, 0, F.col('walnutDark'), 'wood');
  }
});

FURN({
  key: 'talia_common_jar_stand', name: 'Terracotta jar stand', culture: 'talia', tier: 'common', type: 'storage', role: 'store', setting: 'indoor',
  rooms: ['kitchen', 'living', 'store', 'cottage'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['terracotta', 'timber'],
  w: 1.1, d: 0.45, h: 0.95, variants: 1,
  build: function (F) {
    F.box(0, 0.3, 0, 1.1, 0.06, 0.45, 0, F.col('walnut'), 'wood');                     /* the shelf */
    for (const s of [-1, 1]) F.box(s * 0.5, 0, 0, 0.06, 0.36, 0.4, 0, F.col('walnutDark'), 'wood');
    for (let i = 0; i < 3; i++) { const x = -0.34 + i * 0.34; F.frustum(x, 0.36, 0, 0.12, 0.17, 0.4, 0, F.col('terracotta'), 'terracotta', 10); F.frustum(x, 0.76, 0, 0.17, 0.07, 0.16, 0, F.shade(F.col('terracotta'), -0.08), 'terracotta', 10); }
  }
});

FURN({
  key: 'talia_common_bookcase', name: 'Walnut bookcase', culture: 'talia', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['library', 'study', 'lecture', 'hall'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'cloth'],
  w: 1.4, d: 0.4, h: 2.2, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0, -0.17, 1.4, 2.2, 0.06, 0, F.shade(wal, -0.1), 'wood');                  /* the back */
    for (const s of [-1, 1]) F.box(s * 0.67, 0, 0, 0.06, 2.2, 0.4, 0, wal, 'wood');
    for (let k = 0; k < 5; k++) {
      const y = 0.08 + k * 0.5; F.box(0, y, 0, 1.3, 0.04, 0.38, 0, wal, 'wood');
      if (k < 4) for (let j = 0; j < 9; j++) { const bc = [F.col('kilimRed'), F.col('orange'), F.col('paper'), F.col('kilimIndigo'), F.col('walnutDark')][(j + k) % 5];
        F.box(-0.56 + j * 0.14, y + 0.04, 0.02, 0.1, 0.28 + ((j * 7 + k) % 3) * 0.03, 0.26, 0, bc, 'cloth'); }   /* under the spines a page lays on (95i) */
    }
    F.box(0, 2.16, 0.02, 1.46, 0.08, 0.44, 0, F.col('gilt'), 'wood');                  /* the gilt cornice */
  }
});

FURN({
  key: 'talia_court_map_case', name: 'Map case', culture: 'talia', tier: 'court', type: 'storage', role: 'cabinet', setting: 'indoor',
  rooms: ['library', 'study', 'lecture', 'hall'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'bronze', 'stone', 'cloth'],
  w: 1.6, d: 0.9, h: 0.95, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0.08, 0, 1.6, 0.82, 0.9, 0, wal, 'wood');
    for (let k = 0; k < 5; k++) { F.box(0, 0.16 + k * 0.15, 0.455, 1.5, 0.01, 0.01, 0, F.shade(wal, -0.2), 'wood'); F.box(0, 0.22 + k * 0.15, 0.46, 0.2, 0.025, 0.02, 0, F.col('brass'), 'bronze'); }
    F.box(0, 0.9, 0, 1.64, 0.05, 0.94, 0, F.col('marble'), 'stone');                   /* the marble top */
    F.box(0.1, 0.95, 0.02, 0.9, 0.005, 0.6, 0.1, F.col('paper'), 'cloth');              /* a chart on it */
  }
});

FURN({
  key: 'talia_court_specimen_case', name: 'Specimen case', culture: 'talia', tier: 'court', type: 'shelf', setting: 'indoor',
  rooms: ['library', 'study', 'lecture', 'hall', 'workshop'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'glass', 'stone'],
  w: 1.2, d: 0.5, h: 2.0, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0, 0, 1.2, 0.8, 0.5, 0, wal, 'wood');                                      /* the cabinet below */
    F.box(0, 0.8, 0, 1.16, 1.1, 0.46, 0, F.col('glass'), 'glass');                     /* the glazed case */
    F.box(0, 1.9, 0, 1.2, 0.1, 0.5, 0, F.col('gilt'), 'wood');
    for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) F.ball(-0.35 + j * 0.35, 1.0 + k * 0.45, 0, 0.08, [F.col('paper'), F.col('cobalt'), F.col('terracotta')][(j + k) % 3], 'stone');
  }
});

/* ---------------- SLEEP AND THE HEARTH (taliaint2.jpg: white plaster, an orange vault, orange treads) */
FURN({
  key: 'talia_common_platform_bed', name: 'Plaster platform bed', culture: 'talia', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'cottage', 'dormitory'], anchor: 'wall', clearance: { front: 0.8, left: 0.4 },
  materials: ['plaster', 'cloth'],
  w: 1.6, d: 2.2, h: 0.75, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.6, 0.36, 2.2, 0, F.col('limeWhite'), 'plaster');                    /* the built plinth */
    F.box(0, 0.36, 0.02, 1.5, 0.16, 2.1, 0, F.col('linen'), 'cloth');                   /* the mattress */
    F.box(0, 0.52, 0.45, 1.52, 0.04, 1.1, 0, F.col('orangeWool'), 'cloth');            /* the blanket */
    F.blob(0, 0.6, -0.8, 0.3, 0.12, 0, F.col('linen'), 'cloth');
  }
});

FURN({
  key: 'talia_court_canopy_bed', name: 'Gilt canopy bed', culture: 'talia', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.9, left: 0.5, right: 0.5 },
  materials: ['timber', 'cloth', 'gold'],
  w: 2.0, d: 2.3, h: 2.4, variants: 1,
  build: function (F) {
    const wal = F.col('walnut'), g = F.col('gilt');
    F.box(0, 0.12, 0, 1.9, 0.3, 2.2, 0, wal, 'wood');
    F.box(0, 0.42, 0.02, 1.8, 0.18, 2.1, 0, F.col('linen'), 'cloth');
    F.box(0, 0.6, 0.5, 1.82, 0.04, 1.1, 0, F.col('orange'), 'cloth');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.92, 0, sz * 1.07, 0.04, 2.3, 0, g, 'gold');
    F.box(0, 2.3, 0, 1.94, 0.1, 2.24, 0, g, 'gold');                                     /* the canopy frame */
    F.box(0, 2.22, -1.0, 1.9, 0.08, 0.3, 0, F.col('orange'), 'cloth');
    F.box(0, 0.42, -1.1, 1.9, 1.1, 0.08, 0, F.shade(wal, -0.1), 'wood');               /* the headboard */
  }
});

FURN({
  key: 'talia_common_hearth', name: 'Plaster hearth', culture: 'talia', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['living', 'kitchen', 'cottage', 'hall'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['plaster', 'terracotta', 'emissive'],
  w: 1.4, d: 0.7, h: 2.2, variants: 1,
  build: function (F) {
    const w = F.col('limeWhite');
    F.box(0, 0, 0, 1.4, 0.9, 0.7, 0, w, 'plaster');                                       /* the hearth block */
    F.box(0, 0.12, 0.27, 0.8, 0.55, 0.08, 0, F.col('ink'), 'plaster');                     /* the firebox */
    F.box(0, 0.14, 0.31, 0.6, 0.1, 0.03, 0, F.col('ember'), 'glow');
    F.box(0, 0.9, -0.05, 1.2, 0.5, 0.6, 0, F.col('terracotta'), 'terracotta');          /* the tiled hood */
    F.box(0, 1.4, -0.12, 0.5, 0.8, 0.46, 0, F.col('terracotta'), 'terracotta');         /* the flue */
    F.box(0, 0.86, 0.29, 1.4, 0.06, 0.12, 0, F.col('orange'), 'plaster');
  }
});

/* ---------------- THE UNIVERSITY: lectern, slate, globe, desk */
FURN({
  key: 'talia_common_lectern', name: 'Lectern', culture: 'talia', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['lecture', 'school', 'library', 'shrine', 'hall'], anchor: 'floor', clearance: { front: 0.8, back: 0.6 },
  materials: ['timber', 'cloth'],
  w: 0.7, d: 0.6, h: 1.25, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0, 0, 0.6, 0.08, 0.5, 0, F.col('walnutDark'), 'wood');
    F.box(0, 0.08, -0.05, 0.3, 0.95, 0.3, 0, wal, 'wood');                              /* the column */
    F.beam(-0.33, 1.15, -0.2, -0.33, 1.02, 0.22, 0.04, 0.04, wal, 'wood');
    F.box(0, 1.03, 0.01, 0.66, 0.04, 0.46, -0, wal, 'wood');                            /* the sloped desk (near level) */
    F.box(0, 1.08, 0.02, 0.44, 0.02, 0.3, 0, F.col('paper'), 'cloth');                 /* an open book */
  }
});

FURN({
  key: 'talia_common_scholar_desk', name: 'Scholar\'s desk', culture: 'talia', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['study', 'library', 'lecture', 'school', 'bedroom'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth', 'stone'],
  w: 1.2, d: 0.6, h: 0.86, variants: 1,
  build: function (F) {
    const wal = F.col('walnut');
    F.box(0, 0.72, 0, 1.2, 0.05, 0.6, 0, wal, 'wood');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.55, 0, sz * 0.25, 0.05, 0.72, 0.05, 0, F.shade(wal, -0.1), 'wood');
    F.box(-0.2, 0.77, 0, 0.42, 0.01, 0.3, 0.15, F.col('paper'), 'cloth');
    F.cyl(0.4, 0.77, -0.12, 0.04, 0.08, 0, F.col('ink'), 'stone');                      /* the inkwell */
  }
});

FURN({
  key: 'talia_common_slate', name: 'Slate board', culture: 'talia', tier: 'common', type: 'board', setting: 'indoor',
  rooms: ['lecture', 'school', 'study', 'workshop'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['stone', 'timber', 'cloth'],
  w: 2.4, d: 0.12, h: 2.0, variants: 1,
  build: function (F) {
    F.box(0, 0.8, 0, 2.4, 1.2, 0.06, 0, F.col('walnut'), 'wood');
    F.box(0, 0.86, 0.035, 2.28, 1.08, 0.02, 0, F.col('slate'), 'stone');
    F.box(0, 0.78, 0.03, 2.3, 0.04, 0.06, 0, F.col('walnut'), 'wood');                  /* the chalk ledge */
    F.box(-0.5, 1.3, 0.045, 0.8, 0.01, 0.005, 0, F.col('paper'), 'cloth');              /* a line of chalk */
    F.box(-0.3, 1.15, 0.045, 1.2, 0.01, 0.005, 0, F.col('paper'), 'cloth');
  }
});

FURN({
  key: 'talia_court_globe', name: 'Celestial globe', culture: 'talia', tier: 'court', type: 'statue', setting: 'indoor',
  rooms: ['library', 'study', 'lecture', 'hall'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['bronze', 'timber', 'stone'],
  w: 0.8, d: 0.8, h: 1.3, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.32, 0.08, 0.6, 0, F.col('walnut'), 'wood', 8);
    F.ball(0, 0.95, 0, 0.32, F.col('cobalt'), 'stone');                                  /* the sphere */
    F.cyl(0, 0.93, 0, 0.36, 0.04, 0, F.col('brass'), 'bronze');                          /* the horizon ring */
    F.rod(0, 0.58, 0, 0, 1.32, 0, 0.015, F.col('brass'), 'bronze');                       /* the axis */
  }
});

/* ---------------- THE ACADEMY: easel, modelling stand */
FURN({
  key: 'talia_common_easel', name: 'Easel with a canvas', culture: 'talia', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['studio', 'workshop'], anchor: 'floor', clearance: { front: 1.0, back: 0.5 },
  materials: ['timber', 'cloth'],
  w: 0.9, d: 0.8, h: 2.0, variants: 1,
  build: function (F) {
    const wd = F.col('walnut');
    F.rod(-0.35, 0, 0.2, -0.05, 1.95, 0, 0.025, wd, 'wood'); F.rod(0.35, 0, 0.2, 0.05, 1.95, 0, 0.025, wd, 'wood');
    F.rod(0, 0, -0.38, 0, 1.8, -0.02, 0.022, wd, 'wood');
    F.box(0, 0.75, 0.15, 0.8, 0.04, 0.08, 0, wd, 'wood');                               /* the ledge */
    F.box(0, 0.8, 0.12, 0.7, 0.9, 0.03, 0, F.col('linen'), 'cloth');                    /* the canvas */
    F.box(-0.1, 1.05, 0.14, 0.4, 0.3, 0.005, 0, F.col('orange'), 'cloth');             /* a study in orange */
    F.box(0.12, 0.95, 0.14, 0.25, 0.2, 0.005, 0, F.col('cobalt'), 'cloth');
  }
});

FURN({
  key: 'talia_common_modelling_stand', name: 'Sculptor\'s modelling stand', culture: 'talia', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['studio', 'workshop'], anchor: 'floor', clearance: { front: 0.9, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['timber', 'stone'],
  w: 0.7, d: 0.7, h: 1.6, variants: 1,
  build: function (F) {
    const wd = F.col('walnutDark');
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; F.rod(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3, 0, 0.8, 0, 0.025, wd, 'wood'); }
    F.cyl(0, 0.8, 0, 0.25, 0.05, 0, F.col('walnut'), 'wood');                          /* the turntable */
    F.frustum(0, 0.85, 0, 0.14, 0.1, 0.45, 0, F.col('marble'), 'stone', 8);             /* the bust in progress */
    F.ball(0, 1.42, 0.01, 0.12, F.col('marble'), 'stone');
  }
});

/* ---------------- RUGS, PLANTS, LIGHT, THE AEDICULE */
FURN({
  key: 'talia_common_kilim', name: 'Kilim', culture: 'talia', tier: 'common', type: 'rug', setting: 'indoor',
  rooms: ['living', 'hall', 'bedroom', 'antechamber', 'study', 'library', 'cottage'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 2.4, d: 1.6, h: 0.02, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 2.4, 0.012, 1.6, 0, F.col('kilimRed'), 'cloth');
    for (let k = 0; k < 4; k++) F.box(-0.9 + k * 0.6, 0.012, 0, 0.32, 0.004, 1.3, 0, k % 2 ? F.col('kilimIndigo') : F.col('orange'), 'cloth');
    F.box(0, 0.012, 0, 2.2, 0.004, 0.1, 0, F.col('limeWhite'), 'cloth');
  }
});

FURN({
  key: 'talia_court_meander_rug', name: 'Meander-bordered rug', culture: 'talia', tier: 'court', type: 'rug', setting: 'indoor',
  rooms: ['hall', 'living', 'antechamber', 'library', 'study', 'bedroom'], anchor: 'floor', clearance: {},
  materials: ['cloth'],
  w: 3.2, d: 2.2, h: 0.02, variants: 1,
  build: function (F) {
    const o = F.col('orange'), w = F.col('limeWhite');
    F.box(0, 0, 0, 3.2, 0.012, 2.2, 0, o, 'cloth');                                     /* the orange border */
    F.box(0, 0.012, 0, 2.7, 0.004, 1.7, 0, w, 'cloth');                                 /* the white field */
    F.cyl(0, 0.016, 0, 0.55, 0.004, 0, o, 'cloth'); F.cyl(0, 0.02, 0, 0.4, 0.004, 0, w, 'cloth'); F.cyl(0, 0.024, 0, 0.15, 0.004, 0, o, 'cloth'); /* the ring medallion */
    for (let k = 0; k < 10; k++) for (const s of [-1, 1]) F.box(-1.4 + k * 0.31, 0.014, s * 0.98, 0.12, 0.004, 0.12, 0, w, 'cloth'); /* the meander's keys */
  }
});

FURN({
  key: 'talia_common_palm_planter', name: 'White planter with a palm', culture: 'talia', tier: 'common', type: 'planter', setting: 'both',
  rooms: ['living', 'hall', 'antechamber', 'court', 'library', 'study'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['plaster', 'timber', 'foliage', 'stone'],
  w: 1.4, d: 1.4, h: 1.8, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.3, 0.38, 0.6, 0, F.col('limeWhite'), 'plaster', 12);
    F.cyl(0, 0.56, 0, 0.34, 0.04, 0, F.col('soil'), 'stone');
    F.rod(0, 0.6, 0, 0.05, 1.7, 0.02, 0.05, F.col('palmTrunk'), 'wood');
    for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7; F.rod(0.05, 1.7, 0.02, 0.05 + Math.sin(a) * 0.65, 1.45, 0.02 + Math.cos(a) * 0.65, 0.05, F.col('leafGreen'), 'plant'); }
  }
});

FURN({
  key: 'talia_court_brass_lantern', name: 'Pierced brass lantern', culture: 'talia', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'bedroom', 'library', 'shrine', 'study'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['bronze', 'emissive', 'gold'],
  w: 0.4, d: 0.4, h: 1.6, variants: 1,
  build: function (F) {
    const b = F.col('brass');
    F.cyl(0, 0, 0, 0.16, 0.05, 0, b, 'bronze');
    F.cyl(0, 0.05, 0, 0.025, 1.0, 0, b, 'bronze');                                       /* the standard */
    F.frustum(0, 1.05, 0, 0.12, 0.17, 0.3, 0, b, 'bronze', 8);                          /* the pierced body */
    F.cyl(0, 1.1, 0, 0.09, 0.2, 0, F.col('ember'), 'glow');                              /* its glow */
    F.frustum(0, 1.35, 0, 0.17, 0.02, 0.22, 0, F.col('gilt'), 'gold', 8);
    F.lamp(0, 1.2, 0, 0.5, 4);
  }
});

FURN({
  key: 'talia_court_aedicule', name: 'Focal aedicule', culture: 'talia', tier: 'court', type: 'shrine', setting: 'indoor',
  rooms: ['shrine', 'hall', 'antechamber'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['stone', 'gold', 'emissive'],
  w: 1.8, d: 0.7, h: 2.8, variants: 1,
  build: function (F) {
    const m = F.col('marble'), g = F.col('gilt');
    F.box(0, 0, 0, 1.8, 0.5, 0.7, 0, m, 'stone');                                       /* the pedestal */
    for (const s of [-1, 1]) { F.cyl(s * 0.7, 0.5, 0.18, 0.09, 1.6, 0, m, 'stone'); F.cyl(s * 0.7, 2.06, 0.18, 0.13, 0.12, 0, g, 'gold'); }
    F.box(0, 0.5, -0.2, 1.2, 1.7, 0.2, 0, F.col('orange'), 'stone');                    /* the orange niche */
    F.box(0, 2.18, 0.05, 1.8, 0.22, 0.6, 0, m, 'stone');                                /* the entablature */
    F.box(0, 2.27, 0.36, 1.6, 0.08, 0.02, 0, g, 'gold');                                /* its gilt frieze */
    F.ball(0, 1.35, -0.06, 0.22, g, 'gold');                                             /* the gilt sun (the old Talei sign) */
    F.cyl(0, 0.62, 0.1, 0.06, 0.18, 0, F.col('ember'), 'glow');                         /* an oil lamp before it */
    F.lamp(0, 0.85, 0.2, 0.4, 3);
  }
});
