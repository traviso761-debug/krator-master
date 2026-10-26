/* ======================================================================
   Khaayken furniture: the High Country's (the lowlanders' "Yeti"), for kits/yeti (PLAN.md sections 5 and 11, 2026-10-26).
   The people stand 1.15 times a human, and these pieces are drawn at their size. Inside a dome everything is low and
   round the platform: robes of musk ox and caribou, the soapstone lamp (the qulliq) with its drying rack over it, larch
   chests, hide bags and buckets. The common add the loom and the qiviut comb, the frame drum, the low tea board; the
   court the high seat, the clans' bench, carved figures of soapstone and antler, the mask board, beadwork, hangings.
   Nothing is metal but a fitting; nothing is painted but the felt and the beads (larch red-brown, silverthorn yellow,
   lichen green, birch-tar black, a traded blue). The goods come from the generic sets.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('khaayken', { name: 'Khaayken', pack: null, influences: 'Inuit, Sakha, Evenki, Chukchi, Nanai; the igloo grown up',
  materials: 'larch, soapstone, musk-ox and caribou fur, smoked hide, antler, felt, fat',
  palette: {
    larch: 0xa07a50, larchOld: 0xa8a49c, larchDark: 0x6e5038, soap: 0x6e7a6a, soapDark: 0x55604f,
    hide: 0xd8c4a0, hideDark: 0xa88a62, muskox: 0x3a2a20, caribou: 0x8a7660, caribouLight: 0xd8cdb8, qiviut: 0xa08a70,
    antler: 0xe0d4bc, bone: 0xd8ccb2, fat: 0xe8dcb8, flame: 0xffb04a, iron: 0x3a3632, slab: 0x8a8c8a,
    feltRed: 0x7a2e22, feltYellow: 0xc8a030, feltGreen: 0x7a8a5a, feltBlack: 0x1e1c1a, beadBlue: 0x2e5a9a, ice: 0xdfe8ec
  } });
/* END PALETTE */

/* ---------------------------------------------------------------- poor */
FURN({
  key: 'khaayken_poor_robes', name: 'Sleeping robes', culture: 'khaayken', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living', 'cottage'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['hide'], w: 2.0, d: 2.2, h: 0.32, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.9, 0.08, 2.1, 0, F.col('caribou'), 'fur');                               /* the caribou under-robe */
    F.box(0.05, 0.08, 0.1, 1.7, 0.1, 1.8, 0.04, F.col('muskox'), 'fur');                       /* the musk-ox top robe */
    F.bolster(0, 0.22, -0.8, 1.4, 0.11, 0, F.col('caribouLight'), 'fur');                       /* the rolled robe for a pillow */
    F.blob(0.55, 0.2, 0.55, 0.32, 0.12, 0.6, F.col('qiviut'), 'fur');                           /* a thrown-back qiviut blanket */
  }
});
FURN({
  key: 'khaayken_poor_lamp', name: 'Soapstone lamp on its stand', culture: 'khaayken', tier: 'poor', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'bedroom', 'cottage', 'hall', 'shrine'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['stone', 'timber', 'emissive', 'food'], w: 0.62, d: 0.4, h: 0.36, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.58, 0.12, 0.36, 0, F.col('larch'), 'wood');                               /* the low larch stand */
    F.ell(0, 0.17, 0, 0.29, 0.06, 0.17, 0, F.col('soap'), 'stone');                            /* the half-moon soapstone dish */
    F.ell(0, 0.2, -0.01, 0.25, 0.015, 0.14, 0, F.col('fat'), 'food');                          /* the fat in it */
    F.box(0, 0.21, 0.11, 0.38, 0.04, 0.02, 0, F.col('flame'), 'glow');                         /* the wick's line of flame */
  }
});
FURN({
  key: 'khaayken_poor_drying_rack', name: 'Drying rack over the lamp', culture: 'khaayken', tier: 'poor', type: 'rack', setting: 'indoor',
  rooms: ['living', 'cottage', 'kitchen'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'hide'], w: 1.2, d: 0.6, h: 1.55, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.rod(sx * 0.55, 0, -0.25, sx * 0.5, 1.5, 0, 0.025, F.col('larch'), 'wood'); F.rod(sx * 0.55, 0, 0.25, sx * 0.5, 1.5, 0, 0.025, F.col('larch'), 'wood'); }
    F.rod(-0.55, 1.45, 0, 0.55, 1.45, 0, 0.022, F.col('larchDark'), 'wood');                  /* the top pole */
    F.rod(-0.5, 1.15, 0, 0.5, 1.15, 0, 0.02, F.col('larchDark'), 'wood');                     /* the net bar */
    F.box(-0.25, 0.85, 0, 0.3, 0.55, 0.015, 0, F.col('hide'), 'leather');                       /* boots and mitts hung to dry */
    F.box(0.2, 0.95, 0, 0.22, 0.45, 0.015, 0.1, F.col('caribou'), 'fur');
    F.box(0.42, 1.05, 0, 0.12, 0.35, 0.015, -0.1, F.col('hideDark'), 'leather');
  }
});
FURN({
  key: 'khaayken_poor_hide_bucket', name: 'Hide bucket', culture: 'khaayken', tier: 'poor', type: 'vessel', setting: 'indoor',
  rooms: ['kitchen', 'living', 'cottage', 'store'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['hide', 'bone', 'glass', 'timber'], w: 0.42, d: 0.42, h: 0.4, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.17, 0.2, 0.36, 0, F.col('hideDark'), 'leather', 12);                 /* the sewn hide pail */
    F.cyl(0, 0.34, 0, 0.205, 0.03, 0, F.col('larchDark'), 'wood');                             /* its willow hoop */
    F.rod(-0.18, 0.37, 0, 0.18, 0.37, 0, 0.012, F.col('antler'), 'antler');                   /* the antler handle */
    F.cyl(0, 0.3, 0, 0.18, 0.02, 0, F.col('ice'), 'glass');                                    /* snow-water in it */
  }
});
FURN({
  key: 'khaayken_poor_stone_bench', name: 'Slab bench with a robe', culture: 'khaayken', tier: 'poor', type: 'bench', setting: 'both',
  rooms: ['living', 'hall', 'cottage', 'yard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['stone', 'hide'], w: 1.5, d: 0.5, h: 0.48, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.55, 0, 0, 0.24, 0.38, 0.42, 0, F.col('slab'), 'stone');
    F.box(0, 0.38, 0, 1.5, 0.07, 0.5, 0, F.shade('slab', -0.05), 'stone');
    F.box(0, 0.45, 0, 1.36, 0.04, 0.46, 0, F.col('muskox'), 'fur');
    F.box(0, 0.08, 0.24, 1.36, 0.36, 0.02, 0, F.col('muskox'), 'fur');                         /* the robe falling down its front */
  }
});
FURN({
  key: 'khaayken_poor_hide_bag', name: 'Hide storage bag', culture: 'khaayken', tier: 'poor', type: 'storage', setting: 'indoor',
  rooms: ['store', 'living', 'cottage'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['hide', 'rope', 'cloth'], w: 0.6, d: 0.5, h: 0.62, variants: 1,
  build: function (F) {
    F.ell(0, 0.28, 0, 0.27, 0.28, 0.22, 0, F.col('hide'), 'leather');                         /* the stuffed bag */
    F.cyl(0, 0.5, 0, 0.12, 0.1, 0, F.col('hideDark'), 'leather');                              /* its gathered neck */
    F.cyl(0, 0.54, 0, 0.13, 0.025, 0, F.col('larchDark'), 'rope');                             /* the sinew tie */
    F.box(0, 0.25, 0.215, 0.3, 0.12, 0.01, 0, F.col('feltRed'), 'cloth');                      /* a band of red felt appliqué */
  }
});

/* ---------------------------------------------------------------- common */
FURN({
  key: 'khaayken_common_chest', name: 'Larch chest with antler fittings', culture: 'khaayken', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store', 'hall'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'bone'], w: 1.1, d: 0.55, h: 0.6, variants: 1,
  build: function (F) {
    F.box(0, 0.06, 0, 1.1, 0.48, 0.55, 0, F.col('larch'), 'wood');
    F.box(0, 0.54, 0, 1.14, 0.06, 0.58, 0, F.col('larchDark'), 'wood');                       /* the lid */
    for (const sx of [-1, 1]) F.box(sx * 0.48, 0, 0, 0.1, 0.06, 0.5, 0, F.col('larchDark'), 'wood');   /* the runners */
    for (const sx of [-0.32, 0, 0.32]) F.box(sx, 0.18, 0.28, 0.04, 0.3, 0.01, 0, F.col('antler'), 'antler');   /* the antler straps */
    F.box(0, 0.42, 0.285, 0.16, 0.08, 0.02, 0, F.col('antler'), 'antler');                    /* the carved hasp */
  }
});
FURN({
  key: 'khaayken_common_loom', name: 'Upright qiviut loom', culture: 'khaayken', tier: 'common', type: 'loom', setting: 'indoor', job: 'weaving',
  rooms: ['workshop', 'living'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth'], w: 1.6, d: 0.5, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.75, 0, -0.2, 0.08, 1.9, 0.1, 0, F.col('larch'), 'wood');
    F.box(0, 1.8, -0.2, 1.6, 0.08, 0.1, 0, F.col('larch'), 'wood');
    F.box(0, 0.35, -0.15, 1.6, 0.08, 0.1, 0, F.col('larchDark'), 'wood');                      /* the cloth beam */
    F.box(0, 0.45, -0.18, 1.36, 1.0, 0.02, 0, F.col('qiviut'), 'cloth');                        /* the qiviut length on it */
    F.box(0, 0.75, -0.165, 1.36, 0.12, 0.01, 0, F.col('feltRed'), 'cloth');                     /* the woven band */
    F.box(0, 1.0, -0.165, 1.36, 0.06, 0.01, 0, F.col('feltYellow'), 'cloth');
    for (let i = 0; i < 12; i++) F.rod(-0.6 + i * 0.11, 1.45, -0.17, -0.6 + i * 0.11, 1.78, -0.17, 0.004, F.col('caribouLight'), 'cloth');   /* the warp */
    for (const sx of [-1, 1]) F.box(sx * 0.6, 0, 0, 0.12, 0.06, 0.5, 0, F.col('larchDark'), 'wood');   /* the feet */
  }
});
FURN({
  key: 'khaayken_common_comb_stand', name: 'Qiviut combing stand', culture: 'khaayken', tier: 'common', type: 'workstation', setting: 'indoor', job: 'weaving',
  rooms: ['workshop', 'living'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'bone', 'hide'], w: 1.1, d: 0.6, h: 0.75, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.0, 0.42, 0.5, 0, F.col('larch'), 'wood');                                /* the seat-bench */
    F.box(0.3, 0.42, 0, 0.12, 0.33, 0.12, 0, F.col('larchDark'), 'wood');                    /* the comb post */
    F.box(0.3, 0.72, 0, 0.3, 0.05, 0.06, 0, F.col('antler'), 'antler');                       /* the antler comb */
    for (let i = 0; i < 9; i++) F.box(0.17 + i * 0.033, 0.66, 0.03, 0.008, 0.06, 0.008, 0, F.col('antler'), 'antler');
    F.blob(-0.25, 0.52, 0, 0.26, 0.12, 0, F.col('qiviut'), 'fur');                            /* the combed-out underwool */
    F.blob(-0.25, 0.1, 0.12, 0.17, 0.1, 0.4, F.col('muskox'), 'fur');                            /* the shed coat on the floor */
  }
});
FURN({
  key: 'khaayken_common_drum', name: 'Frame drum on its stand', culture: 'khaayken', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['hall', 'shrine', 'living'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'skin', 'bone'], w: 1.1, d: 0.5, h: 1.72, variants: 1,
  build: function (F) {
    F.rod(0, 0, 0, 0, 1.0, 0, 0.03, F.col('larch'), 'wood');
    F.rod(-0.25, 0, 0.15, 0, 0.62, 0, 0.022, F.col('larch'), 'wood'); F.rod(0.25, 0, 0.15, 0, 0.62, 0, 0.022, F.col('larch'), 'wood');
    F.ell(0, 1.25, -0.02, 0.44, 0.44, 0.03, 0, F.col('larchDark'), 'wood');                   /* the bentwood hoop behind the head */
    F.ell(0, 1.25, 0.0, 0.41, 0.41, 0.012, 0, F.col('hide'), 'skin');                          /* the gut-skin head */
    F.rod(0.3, 1.0, 0.1, 0.55, 0.72, 0.15, 0.012, F.col('antler'), 'antler');                 /* the beater */
  }
});
FURN({
  key: 'khaayken_common_tea_board', name: 'Low tea board', culture: 'khaayken', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'hall', 'tavern'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'stone', 'bone', 'food'], w: 0.9, d: 0.6, h: 0.42, variants: 1,
  build: function (F) {
    F.box(0, 0.24, 0, 0.9, 0.05, 0.6, 0, F.col('larch'), 'wood');
    for (const [x, z] of [[-0.38, -0.24], [0.38, -0.24], [-0.38, 0.24], [0.38, 0.24]]) F.box(x, 0, z, 0.07, 0.24, 0.07, 0, F.col('larchDark'), 'wood');
    F.frustum(-0.15, 0.29, 0, 0.1, 0.07, 0.12, 0, F.col('soap'), 'stone', 10);                /* the soapstone tea pot */
    for (const x of [0.12, 0.28]) F.frustum(x, 0.29, 0.08, 0.04, 0.05, 0.06, 0, F.col('antler'), 'antler', 8);   /* horn cups */
    F.box(0.2, 0.29, -0.15, 0.2, 0.03, 0.12, 0, F.col('feltRed'), 'food');                     /* a brick of fireweed tea */
  }
});
FURN({
  key: 'khaayken_common_pot', name: 'Soapstone cooking pot on its frame', culture: 'khaayken', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['kitchen', 'living'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'timber', 'emissive', 'rope'], w: 0.8, d: 0.6, h: 0.95, variants: 1,
  build: function (F) {
    F.ell(0, 0.08, 0.1, 0.3, 0.05, 0.16, 0, F.col('soap'), 'stone');                          /* the lamp under it */
    F.box(0, 0.12, 0.2, 0.36, 0.03, 0.02, 0, F.col('flame'), 'glow');
    for (const sx of [-1, 1]) F.rod(sx * 0.35, 0, 0, sx * 0.3, 0.92, 0, 0.022, F.col('larchDark'), 'wood');
    F.rod(-0.33, 0.9, 0, 0.33, 0.9, 0, 0.02, F.col('larchDark'), 'wood');
    F.frustum(0, 0.32, 0, 0.18, 0.24, 0.22, 0, F.col('soapDark'), 'stone', 4);                 /* the square soapstone pot, slung */
    F.rod(0, 0.9, 0, 0, 0.56, 0, 0.008, F.col('hideDark'), 'rope');
  }
});
FURN({
  key: 'khaayken_common_lamp_shelf', name: 'Lamp shelf', culture: 'khaayken', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['living', 'hall', 'bedroom'], anchor: 'wall', clearance: { front: 0.4 },
  materials: ['timber', 'stone', 'emissive', 'hide'], w: 1.0, d: 0.3, h: 1.1, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.45, 0, -0.1, 0.08, 1.1, 0.08, 0, F.col('larch'), 'wood');
    for (const y of [0.45, 0.85]) F.box(0, y, 0, 1.0, 0.04, 0.3, 0, F.col('larch'), 'wood');
    F.ell(0, 0.92, 0, 0.18, 0.04, 0.1, 0, F.col('soap'), 'stone'); F.box(0, 0.95, 0.07, 0.24, 0.03, 0.015, 0, F.col('flame'), 'glow');
    F.ball(-0.32, 0.55, 0, 0.07, F.col('soap'), 'stone'); F.box(0.3, 0.49, 0, 0.18, 0.12, 0.14, 0, F.col('hideDark'), 'leather');
  }
});

/* ---------------------------------------------------------------- court */
FURN({
  key: 'khaayken_court_high_seat', name: 'The high seat', culture: 'khaayken', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['timber', 'hide', 'bone', 'cloth'], w: 1.8, d: 1.06, h: 2.05, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.5, 0.5, 1.0, 0, F.col('larchDark'), 'wood');                             /* the dais block */
    F.box(0, 0.5, 0.05, 1.3, 0.1, 0.8, 0, F.col('muskox'), 'fur');                             /* the robe seat */
    F.box(0, 0.5, -0.44, 1.4, 1.5, 0.12, 0, F.col('larch'), 'wood');                          /* the carved back */
    F.box(0, 1.2, -0.38, 1.2, 0.5, 0.02, 0, F.col('beadBlue'), 'cloth');                       /* the beadwork panel */
    F.box(0, 1.25, -0.37, 1.0, 0.1, 0.02, 0, F.col('feltYellow'), 'cloth');
    for (const sx of [-1, 1]) { F.box(sx * 0.66, 0.5, 0, 0.12, 0.5, 0.9, 0, F.col('larch'), 'wood');   /* the arms */
      F.ball(sx * 0.66, 1.05, 0.38, 0.09, F.col('antler'), 'antler');
      F.rod(sx * 0.6, 2.0, -0.45, sx * 0.85, 1.75, -0.46, 0.03, F.col('antler'), 'antler'); }   /* antler tines over the back */
  }
});
FURN({
  key: 'khaayken_court_clan_bench', name: "The clans' bench", culture: 'khaayken', tier: 'court', type: 'bench', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['stone', 'timber', 'hide', 'cloth'], w: 2.4, d: 0.6, h: 1.05, variants: 1,
  build: function (F) {
    for (const sx of [-1, 0, 1]) F.box(sx * 1.0, 0, 0, 0.26, 0.38, 0.5, 0, F.col('slab'), 'stone');
    F.box(0, 0.38, 0, 2.4, 0.08, 0.58, 0, F.shade('slab', -0.05), 'stone');
    F.box(0, 0.46, -0.27, 2.4, 0.6, 0.06, 0, F.col('larchOld'), 'wood');                      /* the backrest */
    F.box(0, 0.46, 0.02, 2.2, 0.05, 0.52, 0, F.col('muskox'), 'fur');
    F.box(0, 0.1, 0.29, 2.2, 0.36, 0.02, 0, F.col('muskox'), 'fur');
    for (const x of [-0.9, -0.3, 0.3, 0.9]) F.box(x, 0.85, -0.235, 0.36, 0.14, 0.01, 0, F.col(x < 0 ? 'feltRed' : 'feltGreen'), 'cloth');   /* clan signs on the back */
  }
});
FURN({
  key: 'khaayken_court_figure', name: 'Soapstone figure on a plinth', culture: 'khaayken', tier: 'court', type: 'statue', setting: 'indoor',
  rooms: ['hall', 'court', 'shrine'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['stone', 'timber'], w: 0.5, d: 0.5, h: 1.25, variants: 3,
  build: function (F) {
    const v = F.variant;
    F.box(0, 0, 0, 0.46, 0.7, 0.46, 0, F.col('larchOld'), 'wood');
    const s = F.col('soap');
    if ((v | 0) === 0) {                                                                        /* the dancing bear */
      F.ell(0, 0.92, 0, 0.12, 0.17, 0.1, 0, s, 'stone'); F.ball(0, 1.13, 0.02, 0.08, s, 'stone');
      F.rod(-0.09, 1.0, 0, -0.2, 1.15, 0.02, 0.035, s, 'stone'); F.rod(0.09, 1.0, 0, 0.18, 0.9, 0.04, 0.035, s, 'stone');
      F.rod(-0.05, 0.78, 0, -0.1, 0.71, 0.05, 0.04, s, 'stone'); F.rod(0.05, 0.78, 0, 0.08, 0.71, 0, 0.04, s, 'stone');
    } else if ((v | 0) === 1) {                                                                 /* mother and child */
      F.ell(0, 0.92, 0, 0.13, 0.21, 0.11, 0, s, 'stone'); F.ball(0, 1.16, 0, 0.075, s, 'stone');
      F.ball(0, 1.08, -0.08, 0.05, F.col('soapDark'), 'stone');                                /* the child in the hood */
    } else {                                                                                    /* the transformation: a person turning owl */
      F.ell(0, 0.95, 0, 0.12, 0.24, 0.1, 0, s, 'stone'); F.ball(0, 1.17, 0, 0.08, s, 'stone');
      for (const sx of [-1, 1]) F.ell(sx * 0.12, 0.98, -0.02, 0.06, 0.16, 0.03, sx * 0.3, F.col('soapDark'), 'stone');   /* the wings opening */
    }
  }
});
FURN({
  key: 'khaayken_court_mask_board', name: 'Mask board', culture: 'khaayken', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['shrine', 'hall'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'bone', 'hide'], w: 1.4, d: 0.12, h: 1.0, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.04, 1.4, 1.0, 0.04, 0, F.col('larchOld'), 'wood');
    for (let i = 0; i < 3; i++) { const x = -0.45 + i * 0.45;
      F.ell(x, 0.55, 0.0, 0.16, 0.22, 0.05, 0, F.col(i === 1 ? 'antler' : 'larch'), i === 1 ? 'antler' : 'wood');
      for (const sx of [-1, 1]) F.box(x + sx * 0.06, 0.6, 0.04, 0.05, 0.02, 0.02, 0, F.col('feltBlack'), 'wood');
      F.box(x, 0.44, 0.04, 0.08, 0.02, 0.02, 0, F.col('feltBlack'), 'wood');
      for (const sx of [-1, 1]) F.rod(x + sx * 0.12, 0.7, 0.02, x + sx * 0.22, 0.85, 0.02, 0.008, F.col('caribouLight'), 'fur'); }   /* fur tufts */
  }
});
FURN({
  key: 'khaayken_court_hanging', name: 'Appliqué hanging', culture: 'khaayken', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'living'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['cloth', 'timber'], w: 1.8, d: 0.06, h: 1.6, variants: 1,
  build: function (F) {
    F.rod(-0.95, 1.6, 0, 0.95, 1.6, 0, 0.025, F.col('larchDark'), 'wood');
    F.box(0, 0.1, -0.01, 1.7, 1.48, 0.015, 0, F.col('feltBlack'), 'cloth');                   /* the dark wool ground */
    F.box(-0.45, 0.6, 0.0, 0.5, 0.35, 0.01, 0, F.col('caribouLight'), 'cloth');               /* a caribou */
    F.box(0.2, 0.62, 0.0, 0.45, 0.3, 0.01, 0, F.col('feltRed'), 'cloth');                      /* a rider */
    F.box(0.62, 0.75, 0.0, 0.18, 0.4, 0.01, 0, F.col('feltGreen'), 'cloth');                   /* a spirit figure */
    for (let i = 0; i < 6; i++) F.box(-0.7 + i * 0.28, 0.2, 0.0, 0.2, 0.18, 0.01, 0, F.col(i % 2 ? 'feltYellow' : 'feltRed'), 'cloth');   /* the mountain band */
    for (let i = 0; i < 5; i++) F.box(-0.6 + i * 0.3, 1.25, 0.0, 0.12, 0.06, 0.01, 0, F.col(i % 2 ? 'beadBlue' : 'feltYellow'), 'cloth');   /* birds */
  }
});
FURN({
  key: 'khaayken_court_bead_chest', name: 'Beaded chest', culture: 'khaayken', tier: 'court', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'hall', 'court'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'hide', 'cloth', 'bone'], w: 1.2, d: 0.6, h: 0.7, variants: 1,
  build: function (F) {
    F.box(0, 0.08, 0, 1.2, 0.54, 0.6, 0, F.col('larchDark'), 'wood');
    F.box(0, 0.62, 0, 1.24, 0.08, 0.64, 0, F.col('larch'), 'wood');
    F.box(0, 0.16, 0.305, 1.0, 0.38, 0.01, 0, F.col('hideDark'), 'leather');                  /* the hide front */
    for (let i = 0; i < 5; i++) F.box(-0.4 + i * 0.2, 0.28, 0.315, 0.12, 0.14, 0.01, 0, F.col(['beadBlue', 'feltYellow', 'feltRed', 'feltGreen', 'beadBlue'][i]), 'cloth');   /* the beadwork lozenges */
    for (const sx of [-1, 1]) F.box(sx * 0.5, 0, 0, 0.12, 0.08, 0.56, 0, F.col('larchDark'), 'wood');
    F.box(0, 0.48, 0.32, 0.14, 0.1, 0.02, 0, F.col('antler'), 'antler');
  }
});
FURN({
  key: 'khaayken_court_antler_screen', name: 'Engraved antler screen', culture: 'khaayken', tier: 'court', type: 'screen', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom'], anchor: 'floor', clearance: { front: 0.4, back: 0.4 },
  materials: ['timber', 'bone'], w: 1.6, d: 0.3, h: 1.5, variants: 1,
  build: function (F) {
    for (let p = 0; p < 3; p++) { const x = -0.53 + p * 0.53, ry = (p - 1) * 0.25;
      F.box(x, 0.05, 0, 0.5, 1.4, 0.04, ry, F.col('larch'), 'wood');
      F.box(x, 0.3, 0.025, 0.4, 1.0, 0.01, ry, F.col('antler'), 'antler');                    /* the engraved antler plaques */
      for (let k = 0; k < 4; k++) F.box(x, 0.4 + k * 0.24, 0.032, 0.34, 0.012, 0.004, ry, F.col('feltBlack'), 'antler'); }   /* the incised friezes */
  }
});
