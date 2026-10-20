/* ======================================================================
   Eternian furniture: the Eternal State's common tier (kits/eternian, P0, 2026-10-20), and the poor
   and court tiers (P3, 2026-10-20).
   The canal town's houses (kits/eternian/PLAN.md section 9): dark timber with
   stepped Deco legs, celadon glaze, lime white, a bronze fitting here and there;
   every house keeps its dead on a mask shelf, eyes closed (LORE.md 6.19). The
   poor: a reed mat, a cast-block bench, a clay hearth and a clay mask board.
   The court: the alabaster lamp, the bronze gallery bench, the ancestor niche,
   the canopy bed, the visor case (the petition stand comes with the talking
   head, P4). P4: the paper state's offices (the archive shelf, the examination desk, the
   tube clerk's rack, the mask maker's bench, the customs scale) and the petition stand.
   The goods come from the generic sets.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('eternian', { name: 'Eternians', pack: null, influences: 'Art Deco, Gothic, the Qing paper state; the Ancients copied by hand',
  materials: 'dark timber, celadon glaze, lime white, bronze, linen, paper',
  palette: {
    timber: 0x4a3426, timberLight: 0x6e5038, lime: 0xe8e2d4, celadon: 0x8fb8a0, celadonDark: 0x6a9a82, bronze: 0x9c7a3c,
    gold: 0xd8b24a, black: 0x141416, green: 0x3f8a5a, linen: 0xe6dfcf, paper: 0xf0e8d6, terracotta: 0xb06a44,
    lead: 0x6e7278, ember: 0xd9762c, flame: 0xffb04a, stone: 0xb8b0a0,
    reed: 0xb8a476, silt: 0x9a8a6e, block: 0xd4ccb8, alabaster: 0xefe7d6, alabasterLit: 0xffe6bc, onyx: 0x2c2a2e,
    gunmetal: 0x4a5058, silver: 0xc9ccd2
  } });
/* END PALETTE */

FURN({
  key: 'eternian_common_bed', name: 'Platform bed', culture: 'eternian', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.8, left: 0.4 },
  materials: ['timber', 'cloth', 'metal'],
  w: 1.6, d: 2.1, h: 0.95, variants: 1,
  build: function (F) {
    const tim = F.col('timber');
    F.box(0, 0, 0.05, 1.5, 0.32, 2.0, 0, tim, 'wood');                                   /* the platform */
    F.box(0, 0.32, 0.08, 1.42, 0.16, 1.9, 0, F.col('linen'), 'cloth');                   /* the mattress */
    F.box(0, 0.48, 0.4, 1.42, 0.04, 1.1, 0, F.col('celadon'), 'cloth');                  /* the celadon coverlet */
    F.box(0, 0, -1.01, 1.6, 0.95, 0.08, 0, F.shade(tim, -0.08), 'wood');                 /* the headboard */
    for (let i = 0; i < 3; i++) F.box(0, 0.6 + i * 0.1, -0.97, 1.3 - i * 0.3, 0.1, 0.03, 0, F.col('bronze'), 'metal');   /* stepped bronze bands */
    F.blob(0, 0.55, -0.68, 0.3, 0.1, 0, F.col('linen'), 'cloth');
  }
});

FURN({
  key: 'eternian_common_table', name: 'Stepped table', culture: 'eternian', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'kitchen', 'hall', 'office'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['timber'],
  w: 1.4, d: 0.8, h: 0.76, variants: 1,
  build: function (F) {
    const tim = F.col('timber');
    F.box(0, 0.7, 0, 1.4, 0.06, 0.8, 0, tim, 'wood');                                    /* the top */
    for (const sx of [-1, 1]) {                                                           /* the stepped Deco ends */
      F.box(sx * 0.6, 0, 0, 0.1, 0.7, 0.62, 0, F.shade(tim, -0.06), 'wood');
      F.box(sx * 0.6, 0, 0, 0.14, 0.12, 0.7, 0, F.shade(tim, -0.12), 'wood');
      F.box(sx * 0.6, 0.12, 0, 0.12, 0.08, 0.66, 0, F.shade(tim, -0.09), 'wood');
    }
    F.box(0, 0.12, 0, 1.1, 0.05, 0.08, 0, tim, 'wood');                                  /* the stretcher */
  }
});

FURN({
  key: 'eternian_common_bench', name: 'Timber bench', culture: 'eternian', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['living', 'hall', 'kitchen', 'office', 'court'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber'],
  w: 1.5, d: 0.42, h: 0.46, variants: 1,
  build: function (F) {
    const tim = F.col('timberLight');
    F.box(0, 0.4, 0, 1.5, 0.06, 0.42, 0, tim, 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.62, 0, 0, 0.12, 0.4, 0.36, 0, F.shade(tim, -0.1), 'wood');
  }
});

FURN({
  key: 'eternian_common_chest', name: 'Bronze-cornered chest', culture: 'eternian', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'],
  w: 1.0, d: 0.55, h: 0.6, variants: 1,
  build: function (F) {
    const tim = F.col('timber'), brz = F.col('bronze');
    F.box(0, 0.06, 0, 1.0, 0.52, 0.55, 0, tim, 'wood');
    F.box(0, 0, 0, 0.9, 0.06, 0.48, 0, F.shade(tim, -0.15), 'wood');                     /* the plinth */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.47, 0.06, sz * 0.25, 0.07, 0.52, 0.07, 0, brz, 'metal');
    F.box(0, 0.4, 0.28, 0.14, 0.12, 0.02, 0, brz, 'metal');                              /* the lock plate */
  }
});

FURN({
  key: 'eternian_common_stove', name: 'Celadon-tiled stove', culture: 'eternian', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['living', 'kitchen', 'bedroom'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['ceramic', 'emissive', 'metal', 'stone'],
  w: 0.9, d: 0.7, h: 1.7, variants: 1,
  build: function (F) {
    const cel = F.col('celadon');
    F.box(0, 0, 0, 0.9, 0.12, 0.7, 0, F.col('stone'), 'stone');                          /* the hearth stone */
    F.box(0, 0.12, -0.02, 0.8, 1.0, 0.6, 0, cel, 'ceramic');                              /* the tiled body */
    F.box(0, 1.12, -0.04, 0.68, 0.36, 0.5, 0, F.shade(cel, -0.08), 'ceramic');            /* the stepped crown */
    F.box(0, 1.48, -0.06, 0.5, 0.22, 0.4, 0, F.col('celadonDark'), 'ceramic');
    F.box(0, 0.24, 0.29, 0.34, 0.3, 0.04, 0, F.col('black'), 'metal');                   /* the firebox door */
    F.box(0, 0.3, 0.3, 0.24, 0.14, 0.02, 0, F.col('ember'), 'glow');
    for (let i = 0; i < 4; i++) F.box(0, 0.62 + i * 0.12, 0.29, 0.8, 0.012, 0.02, 0, F.shade(cel, -0.2), 'ceramic');   /* the tile joints */
  }
});

FURN({
  key: 'eternian_common_mask_shelf', name: 'Mask shelf of the household dead', culture: 'eternian', tier: 'common', type: 'shrine', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'ceramic', 'metal', 'emissive'],
  w: 1.1, d: 0.3, h: 1.6, variants: 1,
  build: function (F) {
    const tim = F.col('timber');
    F.box(0, 0.9, 0, 1.1, 0.06, 0.3, 0, tim, 'wood');                                    /* the shelf */
    F.box(0, 0.96, -0.13, 1.1, 0.64, 0.04, 0, F.shade(tim, -0.1), 'wood');               /* its back board */
    for (let i = 0; i < 3; i++) F.box(0, 1.6 - i * 0.04, -0.12, 1.1 - i * 0.2, 0.04, 0.06, 0, F.col('bronze'), 'metal');   /* the stepped head */
    for (const sx of [-0.34, 0, 0.34]) {                                                  /* the three masks: the eyes closed */
      const c = sx === 0 ? F.col('terracotta') : F.col('lead');
      F.blob(sx, 1.18, -0.04, 0.12, 0.05, 0, c, 'ceramic');
      for (const ex of [-0.04, 0.04]) F.box(sx + ex, 1.2, 0.02, 0.05, 0.008, 0.01, 0, F.shade(c, -0.4), 'ceramic');
    }
    F.box(0, 0.94, 0.08, 0.1, 0.05, 0.1, 0, F.col('bronze'), 'metal');                    /* the lamp dish */
    F.box(0, 0.99, 0.08, 0.03, 0.04, 0.03, 0, F.col('flame'), 'glow');
    F.box(0, 0, 0, 0.9, 0.9, 0.26, 0, F.shade(tim, -0.04), 'wood');                       /* the cupboard under it */
  }
});

FURN({
  key: 'eternian_common_register_desk', name: "Clerk's register desk", culture: 'eternian', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['office', 'living', 'study'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth', 'metal'],
  w: 1.3, d: 0.7, h: 1.4, variants: 1,
  build: function (F) {
    const tim = F.col('timber');
    F.box(0, 0.72, 0, 1.3, 0.05, 0.7, 0, tim, 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.55, 0, 0, 0.2, 0.72, 0.62, 0, F.shade(tim, -0.06), 'wood');   /* the drawer pedestals */
    F.box(0, 0.77, -0.28, 1.3, 0.6, 0.14, 0, F.shade(tim, -0.1), 'wood');                /* the pigeonholes of the register */
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) F.box(-0.5 + i * 0.25, 0.86 + j * 0.24, -0.2, 0.18, 0.16, 0.02, 0, F.col('paper'), 'cloth');
    F.box(0.2, 0.77, 0.08, 0.4, 0.02, 0.3, 0, F.col('paper'), 'cloth');                  /* the open book */
    F.box(-0.35, 0.77, 0.1, 0.05, 0.08, 0.05, 0, F.col('black'), 'metal');               /* the ink stone */
  }
});

/* ---------------------------------------------------------------- the poor: silt, reed and cast block */
FURN({
  key: 'eternian_poor_reed_mat', name: 'Reed sleeping mat', culture: 'eternian', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['thatch', 'cloth'],
  w: 1.0, d: 1.9, h: 0.22, variants: 1,
  build: function (F) {
    const r = F.col('reed');
    F.box(0, 0, 0, 1.0, 0.06, 1.9, 0, r, 'thatch');                                       /* the mat */
    for (let i = 0; i < 6; i++) F.box(0, 0.06, -0.8 + i * 0.32, 0.98, 0.008, 0.03, 0, F.shade(r, -0.18), 'thatch');   /* its binding */
    F.box(0, 0.06, 0.25, 0.9, 0.05, 1.1, 0, F.col('linen'), 'cloth');                     /* the blanket */
    F.box(0, 0.06, -0.72, 0.5, 0.14, 0.24, 0, F.shade(r, 0.06), 'thatch');                /* the reed bolster */
  }
});

FURN({
  key: 'eternian_poor_block_bench', name: 'Cast-block bench', culture: 'eternian', tier: 'poor', type: 'bench', setting: 'both',
  rooms: ['living', 'kitchen', 'court', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'timber'],
  w: 1.3, d: 0.4, h: 0.46, variants: 1,
  build: function (F) {
    const b = F.col('block');
    for (const sx of [-1, 1]) {                                                           /* two cast blocks, the stepped relief on their faces */
      F.box(sx * 0.48, 0, 0, 0.3, 0.4, 0.38, 0, b, 'stone');
      F.box(sx * 0.48, 0.1, 0.19, 0.16, 0.16, 0.02, 0, F.shade(b, -0.1), 'stone');
    }
    F.box(0, 0.4, 0, 1.3, 0.06, 0.4, 0, F.col('timberLight'), 'wood');                    /* the plank */
  }
});

FURN({
  key: 'eternian_poor_hearth', name: 'Clay hearth', culture: 'eternian', tier: 'poor', type: 'stove', setting: 'indoor',
  rooms: ['living', 'kitchen'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['ceramic', 'emissive', 'stone', 'plaster'],
  w: 0.8, d: 0.6, h: 0.7, variants: 1,
  build: function (F) {
    const s = F.col('silt');
    F.box(0, 0, 0, 0.8, 0.5, 0.6, 0, s, 'plaster');                                        /* the silt-brick body */
    F.box(0, 0.08, 0.29, 0.3, 0.24, 0.03, 0, F.col('black'), 'stone');                     /* the fire mouth */
    F.box(0, 0.12, 0.3, 0.2, 0.1, 0.02, 0, F.col('ember'), 'glow');
    F.cyl(0, 0.5, 0, 0.2, 0.18, 0, F.col('terracotta'), 'ceramic', 10);                    /* the pot */
    F.box(0, 0.5, -0.27, 0.8, 0.2, 0.06, 0, F.shade(s, -0.1), 'plaster');                 /* the smoke board */
  }
});

FURN({
  key: 'eternian_poor_mask_board', name: 'Clay mask board', culture: 'eternian', tier: 'poor', type: 'shrine', setting: 'indoor',
  rooms: ['living', 'hall'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'ceramic', 'emissive'],
  w: 0.7, d: 0.2, h: 1.5, variants: 1,
  build: function (F) {
    const tim = F.col('timberLight'), c = F.col('terracotta');
    F.box(0, 0.95, -0.07, 0.7, 0.5, 0.04, 0, tim, 'wood');                               /* the board on its peg */
    F.box(0, 0.95, 0, 0.7, 0.04, 0.2, 0, tim, 'wood');                                    /* the ledge */
    F.blob(0, 1.2, 0.03, 0.12, 0.05, 0, c, 'ceramic');                                    /* one clay mask: the eyes closed */
    for (const ex of [-0.04, 0.04]) F.box(ex, 1.22, 0.08, 0.05, 0.008, 0.01, 0, F.shade(c, -0.4), 'ceramic');
    F.box(0.22, 0.99, 0.03, 0.06, 0.03, 0.06, 0, F.col('terracotta'), 'ceramic');          /* the lamp dish */
    F.box(0.22, 1.02, 0.03, 0.02, 0.03, 0.02, 0, F.col('flame'), 'glow');
  }
});

/* ---------------------------------------------------------------- the court: alabaster, bronze, onyx, celadon */
FURN({
  key: 'eternian_court_alabaster_lamp', name: 'Alabaster standing lamp', culture: 'eternian', tier: 'court', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'hall', 'bedroom', 'gallery', 'study'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['bronze', 'emissive', 'stone'],
  w: 0.5, d: 0.5, h: 1.9, variants: 1,
  build: function (F) {
    const br = F.col('bronze');
    F.box(0, 0, 0, 0.44, 0.06, 0.44, 0, br, 'bronze');                                    /* the stepped foot */
    F.box(0, 0.06, 0, 0.3, 0.06, 0.3, 0, F.shade(br, -0.08), 'bronze');
    F.box(0, 0.12, 0, 0.06, 1.2, 0.06, 0, br, 'bronze');                                  /* the stem */
    F.box(0, 1.32, 0, 0.34, 0.5, 0.34, 0, F.col('alabasterLit'), 'glow');                /* the alabaster lantern, lit */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.17, 1.3, sz * 0.17, 0.03, 0.54, 0.03, 0, br, 'bronze');   /* its bronze corners */
    for (let i = 0; i < 3; i++) F.box(0, 1.82 + i * 0.03, 0, 0.38 - i * 0.1, 0.03, 0.38 - i * 0.1, 0, br, 'bronze');   /* the stepped cap */
    F.lamp(0, 1.55, 0, 0.8, 7);
  }
});

FURN({
  key: 'eternian_court_gallery_bench', name: 'Bronze gallery bench', culture: 'eternian', tier: 'court', type: 'bench', setting: 'both',
  rooms: ['gallery', 'hall', 'court', 'living'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['bronze', 'cloth'],
  w: 1.8, d: 0.5, h: 0.5, variants: 1,
  build: function (F) {
    const br = F.col('bronze');
    F.box(0, 0.4, 0, 1.8, 0.05, 0.5, 0, br, 'bronze');                                    /* the seat */
    F.box(0, 0.45, 0, 1.7, 0.05, 0.44, 0, F.col('celadon'), 'cloth');                     /* the celadon cushion */
    for (const sx of [-1, 1]) {                                                           /* the stepped ends */
      F.box(sx * 0.82, 0, 0, 0.1, 0.4, 0.46, 0, F.shade(br, -0.1), 'bronze');
      F.box(sx * 0.82, 0, 0, 0.16, 0.08, 0.5, 0, F.shade(br, -0.16), 'bronze');
    }
  }
});

FURN({
  key: 'eternian_court_ancestor_niche', name: 'Ancestor niche', culture: 'eternian', tier: 'court', type: 'shrine', setting: 'indoor',
  rooms: ['hall', 'gallery', 'living', 'antechamber'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['stone', 'bronze', 'gold', 'emissive'],
  w: 1.0, d: 0.5, h: 2.3, variants: 1,
  build: function (F) {
    const on = F.col('onyx'), br = F.col('bronze'), g = F.col('gold');
    F.box(0, 0, -0.05, 1.0, 0.9, 0.4, 0, on, 'stone');                                     /* the onyx plinth */
    F.box(0, 0.9, -0.2, 1.0, 1.2, 0.1, 0, on, 'stone');                                    /* the niche's back */
    for (const sx of [-1, 1]) F.box(sx * 0.45, 0.9, -0.05, 0.1, 1.2, 0.4, 0, on, 'stone');   /* its sides */
    for (let i = 0; i < 3; i++) F.box(0, 2.1 + i * 0.07, -0.05, 1.0 - i * 0.24, 0.07, 0.42 - i * 0.06, 0, br, 'bronze');   /* the stepped head */
    F.box(0, 0.9, -0.05, 0.12, 0.12, 0.12, 0, F.shade(g, -0.1), 'gold');                  /* the head on its neck: faceted planes, the eyes closed */
    F.box(0, 1.02, -0.05, 0.3, 0.42, 0.32, 0, g, 'gold');
    F.box(0, 1.16, 0.12, 0.06, 0.14, 0.04, 0, F.shade(g, 0.08), 'gold');                  /* the nose */
    for (const ex of [-0.07, 0.07]) F.box(ex, 1.3, 0.115, 0.08, 0.012, 0.01, 0, F.shade(g, -0.45), 'gold');   /* the closed lids */
    F.box(0, 1.44, -0.05, 0.34, 0.08, 0.34, 0, F.shade(g, -0.05), 'gold');                 /* the stepped headdress */
    F.box(0, 1.52, -0.07, 0.24, 0.08, 0.26, 0, F.shade(g, -0.1), 'gold');
    F.box(0, 0.9, 0.18, 0.12, 0.04, 0.12, 0, br, 'bronze');                                /* the lamp dish */
    F.box(0, 0.94, 0.18, 0.03, 0.04, 0.03, 0, F.col('flame'), 'glow');
  }
});

FURN({
  key: 'eternian_court_canopy_bed', name: 'Canopy bed', culture: 'eternian', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.9, left: 0.5, right: 0.5 },
  materials: ['lacquer', 'cloth', 'bronze'],
  w: 1.9, d: 2.3, h: 2.6, variants: 1,
  build: function (F) {
    const tim = F.col('timber'), br = F.col('bronze');
    F.box(0, 0, 0.05, 1.8, 0.4, 2.2, 0, tim, 'lacquer');                                 /* the platform */
    F.box(0, 0.4, 0.08, 1.7, 0.18, 2.1, 0, F.col('linen'), 'cloth');
    F.box(0, 0.58, 0.45, 1.7, 0.04, 1.3, 0, F.col('celadon'), 'cloth');                   /* the celadon coverlet */
    F.box(0, 0.58, -0.75, 1.2, 0.14, 0.34, 0, F.col('linen'), 'cloth');                   /* the bolster */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.88, 0, sz * 1.08 + 0.05, 0.08, 2.3, 0.08, 0, tim, 'lacquer');   /* the posts */
    F.box(0, 2.3, 0.05, 1.86, 0.1, 2.26, 0, tim, 'lacquer');                              /* the canopy frame */
    for (let i = 0; i < 3; i++) F.box(0, 2.4, -1.06, 1.6 - i * 0.4, 0.06 + i * 0.06, 0.04, 0, br, 'bronze');   /* the stepped bronze crest */
    F.box(0, 0.4, -1.1, 1.8, 1.7, 0.06, 0, F.shade(tim, -0.08), 'lacquer');              /* the headboard */
    F.box(0, 1.1, -1.06, 1.2, 0.5, 0.02, 0, F.col('green'), 'cloth');                     /* the State's green panel */
  }
});

FURN({
  key: 'eternian_court_visor_case', name: 'Visor case', culture: 'eternian', tier: 'court', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'antechamber', 'study'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['stone', 'bronze', 'glass', 'gold', 'metal'],
  w: 0.9, d: 0.45, h: 1.8, variants: 1,
  build: function (F) {
    const on = F.col('onyx'), br = F.col('bronze');
    F.box(0, 0, 0, 0.9, 0.8, 0.45, 0, on, 'stone');                                       /* the onyx cabinet */
    F.box(0, 0.8, -0.18, 0.9, 0.9, 0.08, 0, on, 'stone');                                 /* the back */
    F.box(0, 0.8, 0.02, 0.86, 0.9, 0.38, 0, F.col('alabaster'), 'glass');                 /* the glazed case */
    for (const sx of [-1, 1]) F.box(sx * 0.44, 0.8, 0.02, 0.03, 0.9, 0.4, 0, br, 'bronze');
    F.box(0, 1.7, 0.02, 0.9, 0.06, 0.42, 0, br, 'bronze');
    F.box(0, 1.1, 0.02, 0.34, 0.26, 0.2, 0, F.col('silver'), 'metal');                  /* the visor: a silver face shield, the eyes a slit */
    F.box(0, 1.24, 0.12, 0.3, 0.02, 0.01, 0, F.col('black'), 'metal');
    F.box(0, 1.36, 0.02, 0.28, 0.06, 0.18, 0, F.col('gold'), 'gold');                     /* its gold brow */
  }
});

/* ---------------------------------------------------------------- the State's offices (P4): the paper state's furniture */
FURN({
  key: 'eternian_common_archive_shelf', name: 'Register archive shelf', culture: 'eternian', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['archive', 'office', 'study', 'library'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'cloth', 'metal'],
  w: 1.6, d: 0.45, h: 2.4, variants: 1,
  build: function (F) {
    const tim = F.col('timber');
    for (const sx of [-1, 1]) F.box(sx * 0.77, 0, 0, 0.06, 2.4, 0.45, 0, F.shade(tim, -0.08), 'wood');   /* the uprights */
    F.box(0, 0, -0.2, 1.6, 2.4, 0.04, 0, F.shade(tim, -0.12), 'wood');                  /* the back */
    for (let i = 0; i < 6; i++) {
      F.box(0, 0.05 + i * 0.4, 0, 1.5, 0.04, 0.42, 0, tim, 'wood');                      /* the shelves */
      for (let k = 0; k < 7; k++) F.box(-0.6 + k * 0.2, 0.09 + i * 0.4, 0.02, 0.16, 0.26, 0.3, 0, F.col(k % 3 ? 'paper' : 'linen'), 'cloth');   /* the bound registers */
    }
    for (let i = 0; i < 6; i++) F.box(0, 0.33 + i * 0.4, 0.21, 0.12, 0.04, 0.01, 0, F.col('bronze'), 'metal');   /* the bronze labels */
  }
});

FURN({
  key: 'eternian_common_exam_desk', name: 'Examination cell desk', culture: 'eternian', tier: 'common', type: 'desk', setting: 'indoor',
  rooms: ['school', 'study', 'cell'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'cloth', 'metal'],
  w: 1.0, d: 0.6, h: 0.9, variants: 1,
  build: function (F) {
    const tim = F.col('timberLight');
    F.box(0, 0.68, 0, 1.0, 0.04, 0.6, 0, tim, 'wood');                                    /* the board */
    for (const sx of [-1, 1]) F.box(sx * 0.44, 0, 0, 0.08, 0.68, 0.56, 0, F.shade(tim, -0.1), 'wood');
    F.box(0, 0.72, -0.05, 0.42, 0.01, 0.3, 0, F.col('paper'), 'cloth');                  /* the paper */
    F.box(0.32, 0.72, 0.1, 0.06, 0.04, 0.06, 0, F.col('black'), 'metal');                 /* the ink stone */
  }
});

FURN({
  key: 'eternian_common_tube_rack', name: "Tube clerk's capsule rack", culture: 'eternian', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['office', 'hall'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'bronze', 'metal'],
  w: 1.4, d: 0.4, h: 1.8, variants: 1,
  build: function (F) {
    const tim = F.col('timber'), br = F.col('bronze');
    F.box(0, 0, 0, 1.4, 0.8, 0.4, 0, tim, 'wood');                                        /* the cabinet */
    F.box(0, 0.8, -0.15, 1.4, 1.0, 0.1, 0, F.shade(tim, -0.1), 'wood');                  /* the rack's back */
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++)                               /* the bronze capsules, lying in their cradles */
      F.cyl(-0.55 + k * 0.22, 0.9 + r * 0.22, -0.04, 0.05, 0.16, 0, F.shade(br, (k + r) % 2 ? -0.1 : 0.05), 'bronze', 8);
    F.box(0, 0.8, 0.05, 1.3, 0.03, 0.3, 0, br, 'bronze');
  }
});

FURN({
  key: 'eternian_common_mask_bench', name: "Mask maker's bench", culture: 'eternian', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['workshop'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'ceramic', 'metal'],
  w: 1.8, d: 0.7, h: 1.6, variants: 1,
  build: function (F) {
    const tim = F.col('timberLight'), tc = F.col('terracotta');
    F.box(0, 0.78, 0, 1.8, 0.06, 0.7, 0, tim, 'wood');                                    /* the bench */
    for (const sx of [-1, 1]) F.box(sx * 0.82, 0, 0, 0.1, 0.78, 0.62, 0, F.shade(tim, -0.1), 'wood');
    F.box(0, 0.84, -0.3, 1.8, 0.7, 0.04, 0, F.shade(tim, -0.08), 'wood');                /* the board of moulds */
    for (const sx of [-0.55, 0, 0.55]) {                                                  /* the moulds and a face being cast: the eyes closed */
      F.blob(sx, 1.18, -0.24, 0.13, 0.05, 0, F.shade(tc, sx ? -0.12 : 0), 'ceramic');
      F.box(sx, 1.21, -0.18, 0.12, 0.008, 0.01, 0, F.shade(tc, -0.45), 'ceramic');
    }
    F.blob(-0.35, 0.86, 0.1, 0.14, 0.06, 0, tc, 'ceramic');                               /* the clay on the bench */
    F.box(0.45, 0.84, 0.12, 0.2, 0.03, 0.08, 0, F.col('black'), 'metal');                 /* the tools */
  }
});

FURN({
  key: 'eternian_common_weighing_scale', name: 'Customs weighing scale', culture: 'eternian', tier: 'common', type: 'workstation', setting: 'indoor',
  rooms: ['store', 'hall', 'office'], anchor: 'floor', clearance: { front: 1.0, back: 0.6 },
  materials: ['timber', 'bronze', 'metal'],
  w: 1.9, d: 0.8, h: 2.0, variants: 1,
  build: function (F) {
    const br = F.col('bronze');
    F.box(0, 0, 0, 1.6, 0.12, 0.8, 0, F.col('timber'), 'wood');                          /* the base */
    F.box(0, 0.12, 0, 0.1, 1.7, 0.1, 0, br, 'bronze');                                   /* the post */
    F.box(0, 1.8, 0, 1.4, 0.06, 0.08, 0, br, 'bronze');                                  /* the beam */
    for (const sx of [-1, 1]) {                                                           /* the pans on their chains */
      F.box(sx * 0.66, 1.05, 0, 0.01, 0.75, 0.01, 0, F.col('black'), 'metal');
      F.cyl(sx * 0.66, 1.0, 0, 0.26, 0.05, 0, br, 'bronze', 12);
    }
    for (let i = 0; i < 3; i++) F.box(-0.66, 1.05 + i * 0.06, 0, 0.1 - i * 0.02, 0.06, 0.1 - i * 0.02, 0, F.col('gunmetal'), 'metal');   /* the weights */
  }
});

/* ---------------------------------------------------------------- the court's (P4): the petition stand before a talking head */
FURN({
  key: 'eternian_court_petition_stand', name: 'Petition stand', culture: 'eternian', tier: 'court', type: 'desk', setting: 'both',
  rooms: ['hall', 'court', 'antechamber'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['bronze', 'stone', 'cloth'],
  w: 0.9, d: 1.05, h: 1.25, variants: 1,
  build: function (F) {
    const br = F.col('bronze');
    F.box(0, 0, 0, 0.7, 0.08, 0.5, 0, F.col('onyx'), 'stone');                            /* the foot */
    for (let i = 0; i < 3; i++) F.box(0, 0.08 + i * 0.32, 0, 0.24 - i * 0.04, 0.32, 0.24 - i * 0.04, 0, br, 'bronze');   /* the stepped column */
    F.box(0, 1.04, 0, 0.9, 0.05, 0.56, 0, br, 'bronze');                                  /* the board */
    F.box(0, 1.09, 0.02, 0.5, 0.01, 0.34, 0, F.col('paper'), 'cloth');                /* the petition */
    F.box(0, 0.08, 0.36, 0.7, 0.12, 0.3, 0, F.col('onyx'), 'stone');                      /* the kneeling step */
  }
});
