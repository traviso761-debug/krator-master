/* ======================================================================
   Jimjam furniture: the kiln city by the lake north of the Cut (settlements/jimjam/DESIGN.md; LORE.md 6.14;
   kits/yeti/PLAN.md section 11, 2026-10-26). The city is brick, marble and gold: red flood-silt brick and yellow marl
   brick, white marble a rich man's trim, gold on the domes, turquoise on the awnings, the jharokha's carved timber. Its
   rooms are South Asian (the charpoy, the mora, the takht with its bolsters, the almirah, the jhula, the brass lamp of
   many wicks) with the city's own things: the palm-leaf almanacs, the day-keepers' count wheels, the household's fire
   niche (every hearth is relit from the temple at the New Fire), the Tudor chimney breast of banded brick, and the
   emblem of three interlocking wheels in gold on red. Tiers as the city's (DESIGN.md "Wealth tiers"): poor in ochre
   plaster and terracotta, no gold and little marble; common (middle) in brick, teak and marble trim; court (rich) in
   gold, marble and inlay, the sunray in red and yellow. The palette is the city's own (JPAL in its 60-jj-mat.js).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('jimjam', { name: 'Jimjam', pack: null, influences: 'Indo-Saracenic and Tudor brick; Dravidian and Maya by way of the calendar',
  materials: 'red and yellow brick, white marble, gold, teak and rosewood, terracotta, ochre plaster, brass, cotton and silk, cane, jute rope, palm leaf',
  palette: {
    brickRed: 0xa8322a, brickDeep: 0x7e2220, brickDark: 0x3e2a26, brickYellow: 0xd9a33a, ochre: 0xe4b54a, ochreWash: 0xd8b070,
    marble: 0xf1ece2, marbleVein: 0xd8d0c4, gold: 0xd9a520, terracotta: 0xc4602f, terracottaDark: 0x9a4a28,
    canvasCream: 0xe8d7b1, canvasRed: 0xa83a30, turquoise: 0x3aa6a0, ink: 0x282321, slate: 0x2f3440,
    teak: 0x5a3a24, teakLight: 0x8a5a34, rosewood: 0x4a2418, cane: 0xc8a868, ropeJute: 0xb8a070, brass: 0xc89a3a,
    cotton: 0xf0e8d8, silkSaffron: 0xe0902a, silkIndigo: 0x2a3a6a, silkRose: 0xc04a5a, paperPalm: 0xd8c48a, pearl: 0xe8e4dc,
    flame: 0xffb04a, ember: 0xff641c, ghee: 0xf0d890, water: 0x378d94, rice: 0xf0ead8
  } });
/* END PALETTE */
/* the city's emblem, three interlocking wheels (the sun's, the Week's and the Thirteen's), painted on a canvas */
const JIMJAM_FX = {
  wheels: function (g, W, H, cx, cy, R, col, lw) {
    g.strokeStyle = col; g.lineWidth = lw;
    for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * Math.PI * 2 / 3, x = cx + Math.cos(a) * R * 0.55, y = cy + Math.sin(a) * R * 0.55;
      g.beginPath(); g.arc(x, y, R * 0.62, 0, Math.PI * 2); g.stroke();
      for (let s = 0; s < [8, 7, 13][k]; s++) { const b = s * Math.PI * 2 / [8, 7, 13][k]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(b) * R * 0.62, y + Math.sin(b) * R * 0.62); g.stroke(); } }
  }
};

/* ---------------------------------------------------------------- poor: ochre plaster and terracotta */
FURN({
  key: 'jimjam_poor_charpoy', name: 'Charpoy', culture: 'jimjam', tier: 'poor', type: 'bed', setting: 'both',
  rooms: ['bedroom', 'living', 'yard', 'rooftop', 'cottage'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'rope', 'cloth'], w: 1.0, d: 2.0, h: 0.52, variants: 2, variantNames: ['made up', 'bare, stood out in the yard'],
  variantDims: [{ w: 1.0, d: 2.0, h: 0.52 }, { w: 1.0, d: 2.0, h: 0.47 }],
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * 0.45, z = sz * 0.95;
      F.cyl(x, 0, z, 0.04, 0.42, 0, F.col('teakLight'), 'wood'); F.ball(x, 0.2, z, 0.055, F.col('teakLight'), 'wood'); F.cyl(x, 0.42, z, 0.045, 0.05, 0, F.col('teak'), 'wood'); }
    for (const sx of [-1, 1]) F.box(sx * 0.45, 0.36, 0, 0.06, 0.06, 1.84, 0, F.col('teak'), 'wood');   /* the side rails */
    for (const sz of [-1, 1]) F.box(0, 0.36, sz * 0.95, 0.84, 0.06, 0.06, 0, F.col('teak'), 'wood');
    for (let i = 0; i < 11; i++) { const t = -0.85 + i * 0.17;                                            /* the jute, woven on the diagonal */
      F.rod(-0.42, 0.4, t - 0.1, 0.42, 0.4, t + 0.1, 0.007, F.col('ropeJute'), 'rope'); F.rod(-0.42, 0.405, t + 0.1, 0.42, 0.405, t - 0.1, 0.007, F.col('ropeJute'), 'rope'); }
    if ((F.variant | 0) === 1) { F.box(0, 0.41, -0.2, 0.7, 0.012, 1.2, 0, F.col('canvasCream'), 'cloth'); return; }   /* a dhurrie and nothing else */
    F.box(0.05, 0.42, 0.45, 0.8, 0.04, 0.6, 0.06, F.pick(['canvasRed', 'silkIndigo', 'canvasCream']), 'cloth');   /* a folded razai */
    F.bolster(0, 0.47, -0.75, 0.6, 0.06, 0, F.col('cotton'), 'cloth');
  }
});
FURN({
  key: 'jimjam_poor_mora', name: 'Cane mora', culture: 'jimjam', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'yard', 'kitchen', 'shop', 'rooftop', 'cottage'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['wicker', 'rope', 'hide'], w: 0.46, d: 0.46, h: 0.46, variants: 1,
  build: function (F) {
    F.frustum(0, 0, 0, 0.22, 0.13, 0.22, 0, F.col('cane'), 'wicker', 12);                                /* the waisted reed drum */
    F.frustum(0, 0.22, 0, 0.13, 0.21, 0.2, 0, F.col('cane'), 'wicker', 12);
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.rod(Math.cos(a) * 0.21, 0.02, Math.sin(a) * 0.21, Math.cos(-a - 0.9) * 0.21, 0.42, Math.sin(-a - 0.9) * 0.21, 0.006, F.col('ropeJute'), 'rope'); }   /* the crossed binding */
    F.cyl(0, 0.42, 0, 0.21, 0.04, 0, F.col('terracottaDark'), 'leather');                                  /* the goatskin seat */
  }
});
FURN({
  key: 'jimjam_poor_chulha', name: 'Clay chulha', culture: 'jimjam', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['kitchen', 'yard', 'cottage', 'rooftop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['terracotta', 'emissive', 'metal', 'food', 'timber'], w: 0.8, d: 0.6, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.8, 0.06, 0.6, 0, F.col('ochreWash'), 'terracotta');
    for (const sx of [-1, 1]) F.box(sx * 0.27, 0.06, -0.02, 0.18, 0.26, 0.48, 0, F.col('terracotta'), 'terracotta');   /* the two horseshoe cheeks */
    F.box(0, 0.06, -0.2, 0.36, 0.26, 0.1, 0, F.col('terracotta'), 'terracotta');
    F.box(0, 0.06, 0.08, 0.34, 0.06, 0.3, 0, F.col('ember'), 'glow'); F.cone(0, 0.08, 0.04, 0.1, 0.18, 0, F.col('flame'), 'glow');
    F.rod(-0.1, 0.07, 0.3, 0.05, 0.1, 0.1, 0.025, F.col('teakLight'), 'wood');                              /* a stick fed in */
    F.frustum(0, 0.32, -0.02, 0.15, 0.2, 0.18, 0, F.col('slate'), 'metal', 12);                            /* the pot */
    F.cyl(0, 0.5, -0.02, 0.19, 0.012, 0, F.col('rice'), 'food');
    F.cyl(0.32, 0.06, 0.18, 0.06, 0.03, 0, F.col('terracottaDark'), 'terracotta');                         /* a clay tawa stand */
  }
});
FURN({
  key: 'jimjam_poor_water_jars', name: 'Water jars on a stand', culture: 'jimjam', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['kitchen', 'yard', 'living', 'cottage', 'shop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['terracotta', 'timber', 'glass', 'cloth'], w: 1.0, d: 0.5, h: 0.95, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.44, 0, sz * 0.19, 0.06, 0.32, 0.06, 0, F.col('teak'), 'wood');
    F.box(0, 0.32, 0, 1.0, 0.04, 0.46, 0, F.col('teak'), 'wood');
    for (const x of [-0.25, 0.25]) {
      F.lathe(x, 0.36, 0, [[0.08, 0], [0.19, 0.12], [0.2, 0.26], [0.12, 0.42], [0.07, 0.48], [0.085, 0.52]], 0, F.col('terracotta'), 'terracotta', { nu: 16 });   /* a matka */
      F.cyl(x, 0.86, 0, 0.08, 0.012, 0, F.col('water'), 'glass'); }
    F.cyl(0.25, 0.88, 0, 0.1, 0.02, 0, F.col('terracottaDark'), 'terracotta');                             /* its clay lid */
    F.box(-0.25, 0.6, 0.0, 0.42, 0.18, 0.012, 0, F.col('canvasRed'), 'cloth');                            /* a wet cloth round the first */
  }
});
FURN({
  key: 'jimjam_poor_kist', name: 'Painted box', culture: 'jimjam', tier: 'poor', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store', 'cottage'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'metal'], w: 0.9, d: 0.5, h: 0.55, variants: 1,
  build: function (F) {
    F.box(0, 0.05, 0, 0.9, 0.42, 0.5, 0, F.col('turquoise'), 'wood');                                      /* a pine box painted turquoise */
    F.box(0, 0.47, 0, 0.92, 0.07, 0.5, 0, F.col('teak'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.38, 0, 0, 0.1, 0.05, 0.46, 0, F.col('teak'), 'wood');
    F.box(0, 0.16, 0.252, 0.6, 0.2, 0.004, 0, F.col('ochre'), 'wood');                                     /* a painted band of flowers */
    for (let i = 0; i < 5; i++) F.ball(-0.24 + i * 0.12, 0.26, 0.256, 0.022, F.col(i % 2 ? 'canvasRed' : 'canvasCream'), 'wood');
    F.box(0, 0.38, 0.256, 0.08, 0.08, 0.012, 0, F.col('slate'), 'metal');
  }
});
FURN({
  key: 'jimjam_poor_diya_stand', name: 'Clay lamp on its stand', culture: 'jimjam', tier: 'poor', type: 'lamp', setting: 'both',
  rooms: ['living', 'bedroom', 'shrine', 'yard', 'shop', 'cottage'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['terracotta', 'emissive', 'food'], w: 0.36, d: 0.36, h: 0.78, variants: 1,
  build: function (F) {
    F.lathe(0, 0, 0, [[0.17, 0], [0.16, 0.05], [0.06, 0.1], [0.045, 0.55], [0.08, 0.62], [0.14, 0.66]], 0, F.col('terracotta'), 'terracotta', { nu: 14 });
    F.cyl(0, 0.66, 0, 0.14, 0.02, 0, F.col('terracottaDark'), 'terracotta');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3, x = Math.cos(a) * 0.08, z = Math.sin(a) * 0.08;
      F.ell(x, 0.7, z, 0.04, 0.02, 0.03, a, F.col('terracotta'), 'terracotta');                            /* the diyas */
      F.cyl(x, 0.705, z, 0.025, 0.012, 0, F.col('ghee'), 'food'); F.cone(x + Math.cos(a) * 0.02, 0.715, z + Math.sin(a) * 0.02, 0.012, 0.06, 0, F.col('flame'), 'glow'); }
  }
});
FURN({
  key: 'jimjam_poor_fire_niche', name: 'Fire niche of the house', culture: 'jimjam', tier: 'poor', type: 'shrine', setting: 'indoor',
  rooms: ['living', 'kitchen', 'shrine', 'cottage'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['plaster', 'terracotta', 'emissive', 'food', 'foliage'], w: 0.8, d: 0.3, h: 1.5, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.1, 0.8, 1.5, 0.1, 0, F.col('ochreWash'), 'plaster');                                    /* the plastered surround */
    F.box(0, 0.7, -0.05, 0.46, 0.56, 0.01, 0, F.col('brickDark'), 'plaster');                              /* the niche's sooted back */
    F.box(0, 0.65, -0.05, 0.56, 0.05, 0.2, 0, F.col('ochre'), 'plaster');                                  /* its sill */
    F.box(0, 1.26, -0.05, 0.56, 0.06, 0.12, 0, F.col('ochre'), 'plaster');
    for (let i = 0; i < 5; i++) F.box(-0.2 + i * 0.1, 1.32 + (i % 2) * 0.03, -0.03, 0.06, 0.08, 0.02, 0, F.col(i % 2 ? 'canvasRed' : 'brickYellow'), 'plaster');   /* the stepped crest */
    F.ell(0, 0.72, 0.0, 0.07, 0.03, 0.05, 0, F.col('terracotta'), 'terracotta');
    F.cyl(0, 0.73, 0.0, 0.04, 0.012, 0, F.col('ghee'), 'food'); F.cone(0.03, 0.74, 0.0, 0.016, 0.08, 0, F.col('flame'), 'glow');   /* the house fire, from the New Fire */
    for (let i = 0; i < 9; i++) F.ball(-0.2 + i * 0.05, 0.7, 0.07 + Math.sin(i) * 0.01, 0.018, F.col(i % 2 ? 'silkSaffron' : 'ochre'), 'leafy');   /* marigolds */
    F.box(0, 0.3, -0.045, 0.3, 0.24, 0.006, 0, F.col('canvasCream'), 'plaster');                           /* the birth-day's glyph, chalked */
  }
});

/* ---------------------------------------------------------------- common: brick, teak and marble trim */
FURN({
  key: 'jimjam_common_takht', name: 'Takht with bolsters', culture: 'jimjam', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'shop', 'study'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'cloth'], w: 1.9, d: 1.1, h: 0.75, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.cyl(sx * 0.86, 0, sz * 0.48, 0.05, 0.3, 0, F.col('teak'), 'wood'); F.ball(sx * 0.86, 0.12, sz * 0.48, 0.065, F.col('teakLight'), 'wood'); }
    F.box(0, 0.3, 0, 1.9, 0.08, 1.1, 0, F.col('teak'), 'wood');
    F.box(0, 0.38, 0, 1.84, 0.08, 1.04, 0, F.col('cotton'), 'cloth');                                       /* the white gadda */
    F.box(0, 0.46, 0, 1.84, 0.006, 1.04, 0, F.col('canvasCream'), 'cloth');
    F.bolster(0, 0.58, -0.4, 1.7, 0.13, 0, F.col('silkIndigo'), 'cloth');                                  /* the long bolster against the wall */
    for (const sx of [-1, 1]) F.bolster(sx * 0.8, 0.54, 0.05, 0.6, 0.09, F.TAU / 4, F.col('silkSaffron'), 'cloth');
    F.box(0, 0.3, 0.552, 1.9, 0.08, 0.004, 0, F.col('brass'), 'wood');
  }
});
FURN({
  key: 'jimjam_common_chimney_hearth', name: 'Banded-brick hearth and chimney breast', culture: 'jimjam', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['living', 'hall', 'kitchen', 'study'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['stone', 'emissive', 'timber', 'metal'], w: 1.6, d: 0.6, h: 2.4, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.58, 0, -0.06, 0.44, 0.95, 0.48, 0, F.col('brickRed'), 'stone');   /* the jambs */
    F.box(0, 0, -0.27, 0.72, 0.95, 0.06, 0, F.col('brickDark'), 'stone');                                  /* the sooted back */
    F.box(0, 0, -0.06, 0.72, 0.04, 0.48, 0, F.col('brickDark'), 'stone');
    F.box(0, 0.95, -0.06, 1.6, 0.12, 0.5, 0, F.col('marble'), 'stone');                                    /* the marble lintel */
    F.box(0, 1.07, -0.02, 1.53, 0.06, 0.56, 0, F.col('marbleVein'), 'stone');                          /* the mantel shelf */
    F.box(0, 1.13, -0.12, 1.3, 1.27, 0.36, 0, F.col('brickRed'), 'stone');                                 /* the breast, narrowing to the stack */
    for (let k = 0; k < 5; k++) F.box(0, 1.25 + k * 0.24, -0.12, 1.31, 0.05, 0.37, 0, F.col('brickYellow'), 'stone');   /* the yellow header courses */
    for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) F.box(sx * 0.58, 0.12 + k * 0.22, 0.18, 0.45, 0.04, 0.01, 0, F.col('brickYellow'), 'stone');
    F.box(0, 1.8, 0.065, 0.36, 0.36, 0.01, 0, F.col('marble'), 'stone');                                    /* a marble lozenge with the wheels */
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * F.TAU / 3; F.cyl(Math.cos(a) * 0.06, 1.98 + Math.sin(a) * 0.06, 0.075, 0.07, 0.008, 0, F.col('gold'), 'stone'); }
    for (let i = 0; i < 3; i++) F.rod(-0.25, 0.08 + i * 0.03, -0.1 + i * 0.08, 0.25, 0.08 + i * 0.03, -0.05 + i * 0.08, 0.04, F.col('teakLight'), 'wood');
    F.box(0, 0.04, -0.06, 0.6, 0.04, 0.36, 0, F.col('ember'), 'glow'); F.cone(0, 0.08, -0.06, 0.2, 0.34, 0, F.col('flame'), 'glow');
    F.frustum(0.5, 1.13, 0.05, 0.06, 0.08, 0.16, 0, F.col('brass'), 'metal', 12);                          /* a brass lota on the mantel */
  }
});
FURN({
  key: 'jimjam_common_almanac_shelf', name: 'Shelf of palm-leaf almanacs', culture: 'jimjam', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['study', 'library', 'shop', 'school', 'living'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['timber', 'cloth', 'rope'], w: 1.4, d: 0.4, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.66, 0, -0.01, 0.08, 1.8, 0.38, 0, F.col('teak'), 'wood');
    F.box(0, 0.05, -0.185, 1.24, 1.7, 0.03, 0, F.col('teakLight'), 'wood');
    F.box(0, 1.74, -0.01, 1.4, 0.06, 0.4, 0, F.col('teak'), 'wood');
    for (const y of [0.05, 0.45, 0.85, 1.25]) {
      F.box(0, y, -0.01, 1.24, 0.04, 0.36, 0, F.col('teak'), 'wood');
      for (let i = 0; i < 7; i++) { const x = -0.5 + i * 0.165, n = 2 + ((i + Math.round(y * 10)) % 2);
        for (let k = 0; k < n; k++) { const yy = y + 0.04 + k * 0.07;                                         /* a bundle: the leaves between two boards, tied */
          F.box(x, yy, 0, 0.14, 0.05, 0.3, 0, F.col('paperPalm'), 'cloth');
          F.box(x, yy + 0.05, 0, 0.145, 0.012, 0.31, 0, F.col(k % 2 ? 'teakLight' : 'rosewood'), 'wood');
          F.box(x, yy, 0.02, 0.15, 0.064, 0.01, 0, F.col('canvasRed'), 'rope'); } }
    }
  }
});
FURN({
  key: 'jimjam_common_count_wheels', name: "The day-keeper's count wheels", culture: 'jimjam', tier: 'common', type: 'board', setting: 'indoor',
  rooms: ['study', 'shop', 'temple', 'library', 'school'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'bronze', 'cloth'], w: 1.2, d: 0.5, h: 1.45, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.1, 0.12, 0.5, 0, F.col('teak'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.5, 0.12, -0.05, 0.08, 1.1, 0.08, 0, F.col('teak'), 'wood');
    F.box(0, 1.2, -0.05, 1.1, 0.06, 0.1, 0, F.col('teak'), 'wood');
    const centres = [[0, 0.95, 0.24, 7], [-0.22, 0.6, 0.24, 13], [0.22, 0.6, 0.24, 8]];                     /* the Week, the Thirteen, the sun */
    for (let k = 0; k < 3; k++) { const [cx, cy, R, n] = centres[k], ring = [], z = -0.04 + k * 0.03;
      for (let i = 0; i <= 26; i++) { const a = i * F.TAU / 26; ring.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R, z]); }
      F.tube(ring, 0.014, F.col('brass'), 'bronze');
      for (let s = 0; s < n; s++) { const a = s * F.TAU / n; F.rod(cx, cy, z, cx + Math.cos(a) * R, cy + Math.sin(a) * R, z, 0.005, F.col('brass'), 'bronze');
        F.box(cx + Math.cos(a) * (R + 0.03), cy + Math.sin(a) * (R + 0.03) - 0.012, z, 0.02, 0.024, 0.006, 0, F.col(s === 0 ? 'canvasRed' : 'ink'), 'cloth'); }   /* each day's tick */
      F.rod(cx, cy, z - 0.03, cx, cy, z + 0.03, 0.025, F.col('gold'), 'bronze'); }
    F.rod(-0.5, 1.2, -0.05, -0.36, 0.95, -0.04, 0.012, F.col('teakLight'), 'wood'); F.rod(0.5, 1.2, -0.05, 0.38, 0.62, -0.02, 0.012, F.col('teakLight'), 'wood');   /* the stays */
    F.box(0, 0.12, 0.12, 0.7, 0.03, 0.24, 0, F.col('paperPalm'), 'cloth');                                  /* this year's almanac, open on the foot */
  }
});
FURN({
  key: 'jimjam_common_brass_lamp', name: 'Brass lamp of five wicks', culture: 'jimjam', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'hall', 'shrine', 'temple', 'study'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['bronze', 'emissive', 'food'], w: 0.5, d: 0.5, h: 1.4, variants: 1,
  build: function (F) {
    F.lathe(0, 0, 0, [[0.22, 0], [0.22, 0.04], [0.12, 0.1], [0.04, 0.16], [0.035, 0.6], [0.06, 0.64], [0.03, 0.7], [0.03, 1.05], [0.06, 1.1], [0.16, 1.12], [0.17, 1.17]], 0, F.col('brass'), 'bronze', { nu: 16 });
    F.cyl(0, 1.12, 0, 0.15, 0.02, 0, F.col('ghee'), 'food');
    for (let i = 0; i < 5; i++) { const a = i * F.TAU / 5; F.cone(Math.cos(a) * 0.17, 1.15, Math.sin(a) * 0.17, 0.014, 0.08, 0, F.col('flame'), 'glow'); }
    F.rod(0, 1.17, 0, 0, 1.3, 0, 0.012, F.col('brass'), 'bronze');
    F.ell(0, 1.34, 0, 0.04, 0.05, 0.02, 0, F.col('brass'), 'bronze');                                    /* the peacock crest, a flat leaf of brass */
  }
});
FURN({
  key: 'jimjam_common_almirah', name: 'Teak almirah', culture: 'jimjam', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store', 'study'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['timber', 'bronze', 'stone'], w: 1.2, d: 0.55, h: 2.0, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.2, 0.12, 0.55, 0, F.col('rosewood'), 'wood');
    F.box(0, 0.12, -0.01, 1.14, 1.72, 0.52, 0, F.col('teak'), 'wood');
    F.box(0, 1.84, 0, 1.22, 0.06, 0.55, 0, F.col('marble'), 'stone');                                       /* a marble top */
    F.box(0, 1.9, -0.02, 1.0, 0.1, 0.4, 0, F.col('rosewood'), 'wood');                                      /* the cresting */
    for (const sx of [-1, 1]) { F.box(sx * 0.28, 0.2, 0.256, 0.5, 1.56, 0.02, 0, F.col('teakLight'), 'wood');   /* the doors */
      F.box(sx * 0.28, 1.1, 0.268, 0.36, 0.56, 0.006, 0, F.col('teak'), 'wood');
      F.box(sx * 0.28, 0.4, 0.268, 0.36, 0.56, 0.006, 0, F.col('teak'), 'wood');
      for (const y of [0.32, 1.6]) F.box(sx * 0.53, y, 0.268, 0.04, 0.1, 0.008, 0, F.col('brass'), 'bronze');   /* the hinges */
      F.ball(sx * 0.06, 1.0, 0.27, 0.02, F.col('brass'), 'bronze'); }
    F.box(0, 0.95, 0.27, 0.08, 0.12, 0.006, 0, F.col('brass'), 'bronze');
  }
});
FURN({
  key: 'jimjam_common_bed', name: 'Teak bed with a turquoise canopy', culture: 'jimjam', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom'], anchor: 'wall', clearance: { front: 0.8, left: 0.5, right: 0.5 },
  materials: ['timber', 'cloth', 'rope'], w: 1.5, d: 2.1, h: 2.2, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * 0.7, z = sz * 0.99;
      F.cyl(x, 0, z, 0.045, 2.15, 0, F.col('teak'), 'wood');
      for (const y of [0.3, 1.0, 1.7]) F.ball(x, y, z, 0.06, F.col('teakLight'), 'wood'); }
    for (const sx of [-1, 1]) F.box(sx * 0.7, 0.3, 0, 0.06, 0.12, 1.9, 0, F.col('teak'), 'wood');
    F.box(0, 0.3, -1.0, 1.36, 0.6, 0.05, 0, F.col('teakLight'), 'wood');                                   /* the headboard */
    F.box(0, 0.42, 0, 1.36, 0.16, 1.9, 0, F.col('cotton'), 'cloth');
    F.box(0.05, 0.58, 0.3, 1.36, 0.05, 1.2, 0, F.pick(['silkRose', 'silkSaffron', 'canvasRed']), 'cloth');
    F.bolster(0, 0.66, -0.75, 1.1, 0.09, 0, F.col('cotton'), 'cloth');
    F.box(0, 2.1, 0, 1.46, 0.05, 2.04, 0, F.col('teak'), 'wood');                                           /* the canopy frame */
    F.box(0, 2.06, 0, 1.38, 0.02, 1.96, 0, F.col('turquoise'), 'cloth');
    for (const sx of [-1, 1]) F.box(sx * 0.67, 1.4, 0.0, 0.02, 0.66, 1.9, 0, F.col('turquoise'), 'cloth');  /* the curtains, looped up */
    for (const sx of [-1, 1]) F.rod(sx * 0.66, 1.42, -0.98, sx * 0.66, 1.42, 0.98, 0.012, F.col('ropeJute'), 'rope');
  }
});
FURN({
  key: 'jimjam_common_brick_mould', name: 'Brick-moulding table', culture: 'jimjam', tier: 'common', type: 'workstation', setting: 'outdoor', job: 'pottery',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'stone', 'terracotta', 'food'], w: 1.8, d: 0.8, h: 0.98, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.6, 0, sz * 0.32, 0.08, 0.72, 0.08, 0, F.col('teakLight'), 'wood');
    F.box(-0.25, 0.72, 0, 1.3, 0.05, 0.8, 0, F.col('teakLight'), 'wood');
    F.blob(-0.45, 0.85, 0.0, 0.26, 0.2, 0.3, F.col('brickDeep'), 'stone');                                  /* the flood silt, wedged */
    F.box(0.05, 0.77, 0.05, 0.3, 0.1, 0.4, 0, F.col('teak'), 'wood');                                       /* the two-brick mould */
    F.box(0.05, 0.78, 0.05, 0.26, 0.09, 0.17, 0, F.col('brickDeep'), 'stone');
    F.box(-0.4, 0.77, -0.3, 0.3, 0.012, 0.14, 0, F.col('rice'), 'food');                                    /* the sand for the mould */
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) F.box(0.68 + (r % 2) * 0.02, r * 0.09, -0.3 + i * 0.2, 0.24, 0.08, 0.12, 0, F.col(r === 2 && i % 2 ? 'brickYellow' : 'terracotta'), 'terracotta');   /* green bricks, drying */
  }
});
FURN({
  key: 'jimjam_common_carved_screen', name: 'Carved timber screen', culture: 'jimjam', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['living', 'hall', 'bedroom', 'antechamber', 'court'], anchor: 'floor', clearance: { front: 0.3, back: 0.3 },
  materials: ['timber'], w: 1.8, d: 0.2, h: 1.9, variants: 1,
  build: function (F) {
    for (let p = 0; p < 3; p++) { const x = -0.6 + p * 0.6, ry = (p - 1) * 0.22;
      F.box(x, 0.02, 0, 0.56, 1.86, 0.04, ry, F.col('teak'), 'wood');
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) F.box(x + (c - 1) * 0.15 * Math.cos(ry), 0.5 + r * 0.2, (c - 1) * -0.15 * Math.sin(ry) + 0.022, 0.1, 0.13, 0.006, ry, F.col('rosewood'), 'wood');   /* the jali's pierced lozenges */
      F.box(x, 1.72, 0.022, 0.46, 0.12, 0.006, ry, F.col('teakLight'), 'wood');                            /* the cusped arch over */
      F.box(x, 0.12, 0.022, 0.46, 0.3, 0.006, ry, F.col('teakLight'), 'wood'); }
  }
});

/* ---------------------------------------------------------------- court: gold, marble and inlay */
FURN({
  key: 'jimjam_court_jharokha_seat', name: 'Jharokha window seat', culture: 'jimjam', tier: 'court', type: 'seating', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom', 'living'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['stone', 'timber', 'cloth', 'gold'], w: 1.6, d: 0.9, h: 2.45, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.43, 1.6, 2.0, 0.04, 0, F.col('marble'), 'stone');                                       /* the window's marble frame */
    F.box(0, 0.62, -0.4, 1.2, 1.2, 0.01, 0, F.col('slate'), 'stone');                                       /* the opening, shuttered dark */
    for (let k = 0; k < 3; k++) F.box(0, 0.12 + k * 0.12, -0.25 + k * 0.08, 1.4 - k * 0.1, 0.12, 0.3 + k * 0.16, 0, F.col(k % 2 ? 'teakLight' : 'teak'), 'wood');   /* the stepped brackets */
    F.box(0, 0.48, 0, 1.6, 0.08, 0.9, 0, F.col('teak'), 'wood');
    F.box(0, 0.56, -0.02, 1.44, 0.1, 0.76, 0, F.col('silkSaffron'), 'cloth');
    F.bolster(0, 0.74, -0.32, 1.3, 0.1, 0, F.col('canvasRed'), 'cloth');
    F.box(0, 0.56, 0.41, 1.5, 0.3, 0.05, 0, F.col('teak'), 'wood');                                         /* the balustrade */
    for (let i = 0; i < 7; i++) F.box(-0.6 + i * 0.2, 0.62, 0.44, 0.1, 0.18, 0.006, 0, F.col('rosewood'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.76, 0.56, 0, 0.05, 0.3, 0.86, 0, F.col('teak'), 'wood');
    for (const sx of [-1, 1]) for (const sz of [-0.38, 0.38]) { F.cyl(sx * 0.72, 0.56, sz, 0.035, 1.42, 0, F.col('teakLight'), 'wood');   /* the slender posts */
      F.ball(sx * 0.72, 1.98, sz, 0.05, F.col('gold'), 'gold'); }
    F.box(0, 1.98, 0, 1.6, 0.06, 0.9, 0, F.col('teak'), 'wood');
    for (let i = 0; i < 9; i++) F.box(-0.64 + i * 0.16, 1.9, 0.43, 0.06, 0.08, 0.02, 0, F.col('teakLight'), 'wood');   /* the cusped valance */
    F.hipRoof(0, 2.04, 0, 1.6, 0.3, 0.9, 0, F.col('gold'), 'gold');                                       /* the curved bangla roof, gilt */
    F.ball(0, 2.36, 0, 0.05, F.col('gold'), 'gold'); F.rod(0, 2.36, 0, 0, 2.45, 0, 0.01, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'jimjam_court_gaddi', name: 'Gilded gaddi with its bolsters', culture: 'jimjam', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'wall', clearance: { front: 1.4 },
  materials: ['stone', 'gold', 'cloth', 'nacre', 'timber'], w: 2.0, d: 1.4, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 2.0, 0.24, 1.4, 0, F.col('marble'), 'stone');                                            /* the marble dais */
    for (let i = 0; i < 9; i++) F.box(-0.8 + i * 0.2, 0.06, 0.701, 0.1, 0.1, 0.006, 0, F.col(i % 2 ? 'brickRed' : 'brickYellow'), 'stone');   /* the inlaid riser */
    F.box(0, 0.24, -0.05, 1.7, 0.2, 1.1, 0, F.col('rosewood'), 'wood');
    for (let i = 0; i < 6; i++) F.box(-0.7 + i * 0.28, 0.3, 0.502, 0.12, 0.08, 0.006, 0, F.col('pearl'), 'nacre');   /* pearl inlay */
    F.box(0, 0.44, -0.05, 1.64, 0.14, 1.04, 0, F.col('silkRose'), 'cloth');
    F.box(0, 0.24, -0.62, 1.8, 1.25, 0.1, 0, F.col('gold'), 'gold');                                        /* the gilt back */
    F.box(0, 0.72, -0.565, 1.4, 0.7, 0.01, 0, F.col('canvasRed'), 'cloth');
    const red = F.css(F.col('canvasRed')), gold = F.css(F.col('gold'));
    F.decal(0, 0.78, -0.548, 0.56, 0.56, 0, 'jimjam-gaddi-wheels', function (g, W, H) { g.fillStyle = red; g.fillRect(0, 0, W, H); JIMJAM_FX.wheels(g, W, H, W / 2, H / 2, W * 0.44, gold, W * 0.03); }, 'cloth');
    for (let i = 0; i < 5; i++) { const a = Math.PI * (0.15 + i * 0.175); F.ball(Math.cos(a) * 0.7, 1.3 + Math.sin(a) * 0.22, -0.62, 0.06, F.col('gold'), 'gold'); }   /* the scalloped crest */
    F.bolster(0, 0.66, -0.45, 1.5, 0.14, 0, F.col('silkSaffron'), 'cloth');
    for (const sx of [-1, 1]) F.bolster(sx * 0.72, 0.62, 0.05, 0.75, 0.11, F.TAU / 4, F.col('silkIndigo'), 'cloth');
  }
});
FURN({
  key: 'jimjam_court_sunray_table', name: 'Marble table with the sunray', culture: 'jimjam', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'living', 'study'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 },
  materials: ['stone', 'gold', 'timber'], w: 1.2, d: 1.2, h: 0.78, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.32, 0.06, 0, F.col('rosewood'), 'wood');
    F.lathe(0, 0.06, 0, [[0.14, 0], [0.08, 0.12], [0.06, 0.4], [0.11, 0.5], [0.07, 0.62], [0.2, 0.68]], 0, F.col('gold'), 'gold', { nu: 14 });
    F.cyl(0, 0.72, 0, 0.6, 0.05, 0, F.col('marble'), 'stone');
    F.cyl(0, 0.77, 0, 0.09, 0.008, 0, F.col('gold'), 'stone');                                               /* the sun at the hub */
    for (let i = 0; i < 24; i++) { const a = i * F.TAU / 24, r = 0.3;
      F.box(Math.cos(a) * r, 0.77, Math.sin(a) * r, 0.4, 0.006, 0.035, -a, F.col(i % 2 ? 'brickRed' : 'brickYellow'), 'stone'); }   /* the sunray inlay */
    const rim = []; for (let i = 0; i <= 32; i++) { const a = i * F.TAU / 32; rim.push([Math.cos(a) * 0.56, 0.772, Math.sin(a) * 0.56]); }
    F.tube(rim, 0.012, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'jimjam_court_jhula', name: 'Gilt jhula swing', culture: 'jimjam', tier: 'court', type: 'seating', setting: 'both',
  rooms: ['hall', 'court', 'garden', 'rooftop', 'living'], anchor: 'floor', clearance: { front: 1.2, back: 1.0 },
  materials: ['timber', 'gold', 'metal', 'cloth', 'stone'], w: 2.0, d: 1.0, h: 2.4, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.box(sx * 0.92, 0, 0, 0.16, 0.12, 0.9, 0, F.col('marble'), 'stone');
      F.cyl(sx * 0.92, 0.12, 0, 0.05, 2.16, 0, F.col('rosewood'), 'wood');
      for (const y of [0.6, 1.4]) F.ball(sx * 0.92, y, 0, 0.07, F.col('gold'), 'gold');
      F.ball(sx * 0.92, 2.32, 0, 0.07, F.col('gold'), 'gold');
      F.rod(sx * 0.92, 0.12, 0.4, sx * 0.92, 1.2, 0.02, 0.025, F.col('rosewood'), 'wood'); F.rod(sx * 0.92, 0.12, -0.4, sx * 0.92, 1.2, -0.02, 0.025, F.col('rosewood'), 'wood'); }
    F.box(0, 2.2, 0, 2.0, 0.1, 0.14, 0, F.col('gold'), 'gold');                                               /* the beam */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.6, 2.2, sz * 0.05, sx * 0.62, 0.62, sz * 0.24, 0.01, F.col('brass'), 'metal');   /* the chains */
    F.box(0, 0.5, 0, 1.4, 0.08, 0.6, 0, F.col('teak'), 'wood');                                              /* the swinging seat */
    F.box(0, 0.58, 0, 1.34, 0.08, 0.56, 0, F.col('silkSaffron'), 'cloth');
    F.box(0, 0.58, -0.28, 1.4, 0.36, 0.04, 0, F.col('teakLight'), 'wood');
    F.bolster(0, 0.74, -0.2, 1.2, 0.08, 0, F.col('silkIndigo'), 'cloth');
    for (let i = 0; i < 7; i++) F.box(-0.6 + i * 0.2, 0.5, 0.302, 0.08, 0.06, 0.006, 0, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'jimjam_court_new_fire_bowl', name: 'Bowl of the New Fire', culture: 'jimjam', tier: 'court', type: 'brazier', setting: 'both',
  rooms: ['temple', 'hall', 'court', 'shrine', 'plaza'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['stone', 'bronze', 'emissive', 'gold'], w: 0.9, d: 0.9, h: 1.5, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.8, 0.1, 0.8, 0, F.col('marble'), 'stone');
    F.lathe(0, 0.1, 0, [[0.3, 0], [0.26, 0.08], [0.14, 0.14], [0.12, 0.6], [0.18, 0.7], [0.22, 0.74]], 0, F.col('marbleVein'), 'stone', { nu: 16 });
    for (let i = 0; i < 3; i++) F.cyl(0, 0.28 + i * 0.16, 0, 0.13, 0.03, 0, F.col(i % 2 ? 'brickYellow' : 'brickRed'), 'stone');   /* banded like the city's brick */
    F.lathe(0, 0.84, 0, [[0.12, 0], [0.32, 0.08], [0.42, 0.22], [0.44, 0.26]], 0, F.col('brass'), 'bronze', { nu: 20 });
    const rim = []; for (let i = 0; i <= 24; i++) { const a = i * F.TAU / 24; rim.push([Math.cos(a) * 0.44, 1.1, Math.sin(a) * 0.44]); }
    F.tube(rim, 0.016, F.col('gold'), 'gold');
    F.cyl(0, 1.05, 0, 0.38, 0.03, 0, F.col('ember'), 'glow');
    F.cone(0, 1.06, 0, 0.26, 0.42, 0, F.col('flame'), 'glow'); F.cone(0.12, 1.06, 0.05, 0.1, 0.26, 0, F.col('ember'), 'glow');
  }
});
FURN({
  key: 'jimjam_court_banner', name: 'Banner of the three wheels', culture: 'jimjam', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'temple'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['cloth', 'gold', 'timber'], w: 1.2, d: 0.08, h: 2.2, variants: 1,
  build: function (F) {
    F.rod(-0.56, 2.14, 0, 0.56, 2.14, 0, 0.025, F.col('rosewood'), 'wood');
    for (const sx of [-1, 1]) F.ball(sx * 0.57, 2.14, 0, 0.03, F.col('gold'), 'gold');
    F.box(0, 0.3, -0.012, 1.0, 1.82, 0.012, 0, F.col('canvasRed'), 'cloth');
    for (let i = 0; i < 5; i++) { const x = -0.4 + i * 0.2; F.box(x, 0.12, -0.012, 0.12, 0.18, 0.01, 0, F.col('canvasRed'), 'cloth'); F.ball(x, 0.1, -0.012, 0.02, F.col('gold'), 'gold'); }   /* the dagged foot */
    const red = F.css(F.col('canvasRed')), gold = F.css(F.col('gold')), turq = F.css(F.col('turquoise'));
    F.decal(0, 0.36, 0.001, 0.94, 1.7, 0, 'jimjam-banner', function (g, W, H) {
      g.fillStyle = red; g.fillRect(0, 0, W, H);
      g.fillStyle = turq; g.fillRect(0, H * 0.04, W, H * 0.025); g.fillRect(0, H * 0.93, W, H * 0.025);
      JIMJAM_FX.wheels(g, W, H, W / 2, H * 0.45, W * 0.42, gold, W * 0.022);
      g.fillStyle = gold; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(W * (0.38 + i * 0.12), H * 0.82, W * 0.03, 0, Math.PI * 2); g.fill(); }   /* the three small wheels that end a sentence */
    }, 'cloth');
  }
});
