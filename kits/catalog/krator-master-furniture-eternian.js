/* ======================================================================
   Eternian furniture: the Eternal State's common tier (kits/eternian, P0, 2026-10-20).
   The canal town's houses (kits/eternian/PLAN.md section 9): dark timber with
   stepped Deco legs, celadon glaze, lime white, a bronze fitting here and there;
   every house keeps its dead on a mask shelf, eyes closed (LORE.md 6.19). The
   court's pieces (the alabaster lamp, the bronze gallery bench, the ancestor
   niche, the petition stand, the visor case) come with the court tier.
   The poor and the goods come from the generic and scrap sets.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('eternian', { name: 'Eternians', pack: null, influences: 'Art Deco, Gothic, the Qing paper state; the Ancients copied by hand',
  materials: 'dark timber, celadon glaze, lime white, bronze, linen, paper',
  palette: {
    timber: 0x4a3426, timberLight: 0x6e5038, lime: 0xe8e2d4, celadon: 0x8fb8a0, celadonDark: 0x6a9a82, bronze: 0x9c7a3c,
    gold: 0xd8b24a, black: 0x141416, green: 0x3f8a5a, linen: 0xe6dfcf, paper: 0xf0e8d6, terracotta: 0xb06a44,
    lead: 0x6e7278, ember: 0xd9762c, flame: 0xffb04a, stone: 0xb8b0a0
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
