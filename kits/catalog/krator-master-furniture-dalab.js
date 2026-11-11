/* ======================================================================
   Dalab furniture: the mound-builders round the Ancient laboratory (settlements/dalab/DESIGN.md; LORE.md 6.1;
   kits/yeti/PLAN.md section 11, 2026-10-26). Cahokian monumentality in rammed earth, wood, stone and scrap, by caste
   (DESIGN.md "Castes"): the peasants' round houses of rammed earth and wattle under thatch, scrap where it serves, lit by
   the hearth only (the poor tier: the earth sleeping bench, the metate, the ollas, the household board of The God's
   eye); the traders' and craftsmen's timber (the common tier: oak frames, a counter, the mural band in red ochre,
   turquoise, gold and black on cream); the nobles' and priests' grey megalithic stone carved with the stepped fret,
   battered and stepped like the Gate of the Sun, and The God's cold teal-white light (the court tier: the stone seat,
   the stele, the light pillar, the genepriest's couch in the Halls of Reformation, the cabinet bank that is The God's
   seat, the temple banner). The red marks what is holy. The palette is Dalab's own (DPAL in its 69d-dalab-mat.js).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('dalab', { name: 'Dalab', pack: null, influences: 'Cahokia and the Mississippian mounds; Tiwanaku and Mesoamerican stone; Amerindian Art Deco',
  materials: 'rammed earth, wattle and thatch, reed, oak, grey andesite with relief, red ochre, turquoise, gold, scrap plate, The God\'s light',
  palette: {
    earth: 0xb5824f, earthDark: 0x8a5e34, clayOchre: 0xc4915c, stone: 0x8a8478, stoneLight: 0xa29c92, stoneDark: 0x6c665c,
    stoneWarm: 0xa89a80, oak: 0x8a6a44, oakDark: 0x6a4e30, woodGrey: 0x9a8c78, thatch: 0xb0985a, reed: 0xc0a868,
    redOchre: 0xa8382a, sacred: 0x9c4e3c, cream: 0xe8dcc0, trim: 0xdcbc8e, turquoise: 0x2f9a8a, gold: 0xd8a838, black: 0x2a2826,
    robeWhite: 0xf0e8d8, plate: 0x8a8e8c, rust: 0x7a4a32, god: 0x9af0e0, godDim: 0x3f9a88, glassDark: 0x1e3a34,
    flame: 0xffa040, ember: 0xd9762c, maize: 0xe0c050, bean: 0x6a3a2a, gourd: 0xc8a050, clayPot: 0xa8643a
  } });
/* END PALETTE */
/* the stepped fret cut into a stone face (DESIGN.md "relief"): a band of meander steps along x from x0 to x0 + len at
   height y (its foot) and depth z (the face), h tall, raised d off the face. And the avatar of The God: the rayed head
   with one great eye, painted on a canvas. */
const DALAB_FX = {
  fret: function (F, x0, y, z, len, h, d, col, fam) {
    const u = h * 1.6, n = Math.max(1, Math.floor(len / u)), t = h * 0.22;
    F.box(x0 + len / 2, y, z, len, t, d, 0, col, fam);
    F.box(x0 + len / 2, y + h - t, z, len, t, d, 0, col, fam);
    for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * len / n;
      F.box(x - u * 0.3, y + t, z, t, h * 0.56, d, 0, col, fam);                       /* the riser */
      F.box(x - u * 0.12, y + h * 0.56, z, u * 0.36, t, d, 0, col, fam);               /* the tread */
      F.box(x + u * 0.08, y + t * 2, z, t, h * 0.36, d, 0, col, fam); }               /* the hook down */
  },
  eye: function (g, W, H, ground, rays, face, eye, pupil) {
    g.fillStyle = ground; g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.42;
    g.fillStyle = rays;
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.beginPath(); g.moveTo(cx + Math.cos(a - 0.12) * R * 0.55, cy + Math.sin(a - 0.12) * R * 0.55);
      g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a + 0.12) * R * 0.55, cy + Math.sin(a + 0.12) * R * 0.55); g.fill(); }
    g.fillStyle = face; g.fillRect(cx - R * 0.45, cy - R * 0.45, R * 0.9, R * 0.9);                       /* the square head, deco-straight */
    g.fillStyle = eye; g.beginPath(); g.ellipse(cx, cy - R * 0.05, R * 0.34, R * 0.2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = pupil; g.beginPath(); g.arc(cx, cy - R * 0.05, R * 0.13, 0, Math.PI * 2); g.fill();
    g.fillRect(cx - R * 0.2, cy + R * 0.25, R * 0.4, R * 0.06);
  }
};

/* ---------------------------------------------------------------- poor: the peasants' round houses */
FURN({
  key: 'dalab_poor_earth_bench', name: 'Earth sleeping bench', culture: 'dalab', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living', 'cottage'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['stone', 'reed', 'cloth'], w: 2.0, d: 0.95, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.02, 2.0, 0.42, 0.9, 0, F.col('clayOchre'), 'stone');                                /* a bench of rammed earth along the wall */
    for (let k = 0; k < 2; k++) F.box(0, 0.12 + k * 0.15, 0.432, 2.0, 0.008, 0.01, 0, F.col('earthDark'), 'stone');   /* its lift lines */
    F.box(0, 0.42, -0.02, 1.9, 0.03, 0.84, 0, F.col('reed'), 'reed');                                  /* the reed mat */
    F.box(0.25, 0.45, 0.0, 1.3, 0.05, 0.8, 0, F.pick(['redOchre', 'turquoise', 'cream']), 'cloth');
    for (let i = 0; i < 4; i++) F.box(0.25, 0.5, -0.3 + i * 0.2, 1.3, 0.004, 0.05, 0, F.col(i % 2 ? 'black' : 'cream'), 'cloth');
    F.box(-0.72, 0.45, -0.1, 0.4, 0.14, 0.5, 0, F.col('cream'), 'cloth');                              /* a rolled blanket for a pillow */
  }
});
FURN({
  key: 'dalab_poor_stool', name: 'Peasant stool', culture: 'dalab', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'kitchen', 'yard', 'cottage', 'workshop'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['timber', 'metal', 'rustSteel', 'reed'], w: 0.46, d: 0.46, h: 0.44, variants: 2, variantNames: ['a log', 'a drum of Ancient plate'],
  build: function (F) {
    if ((F.variant | 0) === 0) {
      F.cyl(0, 0, 0, 0.19, 0.4, 0, F.col('oak'), 'wood');
      F.cyl(0, 0.4, 0, 0.18, 0.012, 0, F.col('woodGrey'), 'wood');
      F.box(0, 0.412, 0, 0.3, 0.02, 0.3, 0.3, F.col('reed'), 'reed');                                   /* a reed pad */
    } else {
      F.cyl(0, 0, 0, 0.21, 0.4, 0, F.col('plate'), 'metal');
      for (const y of [0.1, 0.28]) F.cyl(0, y, 0, 0.216, 0.03, 0, F.col('rust'), 'rust');
      F.cyl(0, 0.4, 0, 0.2, 0.03, 0, F.col('reed'), 'reed');
    }
  }
});
FURN({
  key: 'dalab_poor_hearth', name: 'Round-house hearth', culture: 'dalab', tier: 'poor', type: 'stove', setting: 'indoor',
  rooms: ['living', 'kitchen', 'cottage'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['stone', 'timber', 'emissive', 'terracotta', 'food'], w: 1.3, d: 1.3, h: 0.6, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.62, 0.1, 0, F.col('earthDark'), 'stone');                                           /* the clay rim */
    F.cyl(0, 0.1, 0, 0.5, 0.012, 0, F.col('black'), 'stone');
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.3; F.rod(Math.cos(a) * 0.36, 0.11, Math.sin(a) * 0.36, 0, 0.2, 0, 0.04, F.col('oakDark'), 'wood'); }
    F.cyl(0, 0.11, 0, 0.22, 0.02, 0, F.col('ember'), 'glow'); F.cone(0, 0.12, 0, 0.16, 0.3, 0, F.col('flame'), 'glow');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.4; F.blob(-0.3 + Math.cos(a) * 0.14, 0.15, Math.sin(a) * 0.14, 0.06, 0.12, a, F.col('stone'), 'stone'); }
    F.cyl(-0.3, 0.21, 0, 0.2, 0.02, 0, F.col('clayPot'), 'terracotta');                                  /* the comal on its three stones */
    for (let i = 0; i < 3; i++) F.cyl(-0.36 + i * 0.07, 0.23, 0.02, 0.05, 0.008, 0, F.col('maize'), 'food');   /* flatbread */
    F.frustum(0.32, 0.1, 0.1, 0.14, 0.17, 0.22, 0, F.col('clayPot'), 'terracotta', 12);                 /* the bean pot */
    F.cyl(0.32, 0.32, 0.1, 0.16, 0.012, 0, F.col('bean'), 'food');
  }
});
FURN({
  key: 'dalab_poor_ollas', name: 'Storage jars', culture: 'dalab', tier: 'poor', type: 'vessel', setting: 'both',
  rooms: ['store', 'kitchen', 'living', 'cottage', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['terracotta', 'food'], w: 0.9, d: 0.6, h: 0.8, variants: 1,
  build: function (F) {
    F.lathe(-0.2, 0, 0, [[0.1, 0], [0.24, 0.14], [0.26, 0.36], [0.16, 0.6], [0.11, 0.7], [0.13, 0.76]], 0, F.col('clayPot'), 'terracotta', { nu: 16 });
    F.cyl(-0.2, 0.74, 0, 0.14, 0.04, 0, F.col('earthDark'), 'terracotta');                              /* a clay lid */
    for (let i = 0; i < 4; i++) F.box(-0.2 + (i - 1.5) * 0.08, 0.36, 0.255, 0.05, 0.05, 0.01, 0, F.col(i % 2 ? 'redOchre' : 'black'), 'terracotta');   /* the painted steps */
    F.lathe(0.26, 0, 0.05, [[0.08, 0], [0.18, 0.1], [0.19, 0.26], [0.1, 0.42], [0.09, 0.48]], 0, F.col('earth'), 'terracotta', { nu: 16 });
    F.cyl(0.26, 0.47, 0.05, 0.08, 0.012, 0, F.col('maize'), 'food');                                     /* full of maize */
  }
});
FURN({
  key: 'dalab_poor_granary_basket', name: 'Granary basket on its stand', culture: 'dalab', tier: 'poor', type: 'storage', setting: 'both',
  rooms: ['store', 'yard', 'cottage'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['wicker', 'timber', 'thatch'], w: 1.0, d: 1.0, h: 1.6, variants: 1,
  build: function (F) {
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4 + F.TAU / 8; F.cyl(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32, 0.05, 0.4, 0, F.col('oakDark'), 'wood'); }
    F.cyl(0, 0.4, 0, 0.42, 0.05, 0, F.col('oak'), 'wood');
    F.frustum(0, 0.45, 0, 0.38, 0.44, 0.75, 0, F.col('reed'), 'wicker', 14);
    for (let k = 0; k < 4; k++) F.cyl(0, 0.5 + k * 0.18, 0, 0.4 + k * 0.016, 0.03, 0, F.col('earthDark'), 'wicker');
    F.cone(0, 1.2, 0, 0.5, 0.4, 0, F.col('thatch'), 'thatch');                                           /* its thatch cap */
  }
});
FURN({
  key: 'dalab_poor_metate', name: 'Metate and mano', culture: 'dalab', tier: 'poor', type: 'workstation', setting: 'both', job: 'milling',
  rooms: ['kitchen', 'yard', 'cottage'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'food', 'reed', 'terracotta'], w: 0.9, d: 0.7, h: 0.32, variants: 1,
  build: function (F) {
    F.box(0, 0, 0.0, 0.9, 0.012, 0.7, 0, F.col('reed'), 'reed');                                        /* the mat she kneels on */
    for (const [x, z] of [[-0.18, -0.14], [-0.18, 0.14], [0.2, 0]]) F.box(x, 0.012, z, 0.09, 0.1, 0.09, 0, F.col('stoneDark'), 'stone');   /* three legs */
    F.beam(-0.28, 0.17, 0, 0.3, 0.12, 0, 0.06, 0.42, F.col('stone'), 'stone');                           /* the sloped quern stone */
    F.rod(-0.08, 0.21, -0.17, -0.08, 0.21, 0.17, 0.035, F.col('stoneLight'), 'stone');                  /* the mano */
    F.blob(0.32, 0.12, 0.0, 0.08, 0.04, 0, F.col('maize'), 'food');                                     /* the meal at its foot */
    F.frustum(0.32, 0.012, 0.22, 0.09, 0.12, 0.1, 0, F.col('clayPot'), 'terracotta', 12);
    F.cyl(0.32, 0.1, 0.22, 0.11, 0.01, 0, F.col('maize'), 'food');
  }
});
FURN({
  key: 'dalab_poor_eye_board', name: "Household board of The God's eye", culture: 'dalab', tier: 'poor', type: 'shrine', setting: 'indoor',
  rooms: ['living', 'shrine', 'cottage', 'bedroom'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'cloth', 'food', 'terracotta', 'emissive'], w: 0.8, d: 0.35, h: 1.4, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.36, 0, -0.15, 0.06, 1.4, 0.05, 0, F.col('oakDark'), 'wood');
    F.box(0, 0.7, -0.155, 0.66, 0.66, 0.03, 0, F.col('oak'), 'wood');
    const c = F.css;
    F.decal(0, 0.72, -0.138, 0.62, 0.62, 0, 'dalab-eye-board', function (g, W, H) { DALAB_FX.eye(g, W, H, c(F.col('cream')), c(F.col('redOchre')), c(F.col('turquoise')), c(F.col('cream')), c(F.col('black'))); }, 'wood');
    F.box(0, 0.5, -0.06, 0.72, 0.04, 0.24, 0, F.col('oakDark'), 'wood');                               /* the offering shelf */
    F.box(0, 0.54, -0.06, 0.6, 0.01, 0.2, 0, F.col('redOchre'), 'cloth');                                /* the red that marks it holy */
    F.box(0, 0.3, -0.12, 0.6, 0.2, 0.01, 0, F.col('redOchre'), 'cloth');
    for (let i = 0; i < 3; i++) F.blob(-0.2 + i * 0.2, 0.58, -0.04, 0.05, 0.05, 0, F.col(['maize', 'bean', 'gourd'][i]), 'food');
    F.ell(0.25, 0.56, 0.02, 0.04, 0.02, 0.03, 0, F.col('clayPot'), 'terracotta'); F.cone(0.25, 0.575, 0.02, 0.012, 0.05, 0, F.col('flame'), 'glow');
  }
});

/* ---------------------------------------------------------------- common: the traders' and craftsmen's timber */
FURN({
  key: 'dalab_common_table', name: 'Oak trestle table', culture: 'dalab', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'kitchen', 'hall', 'tavern', 'shop'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['timber', 'terracotta', 'food'], w: 1.8, d: 0.8, h: 0.86, variants: 1,
  build: function (F) {
    F.box(0, 0.7, 0, 1.8, 0.06, 0.8, 0, F.col('oak'), 'wood');
    for (const sx of [-1, 1]) { F.box(sx * 0.68, 0, 0, 0.08, 0.7, 0.12, 0, F.col('oakDark'), 'wood'); F.box(sx * 0.68, 0, 0, 0.12, 0.06, 0.66, 0, F.col('oakDark'), 'wood');
      F.box(sx * 0.68, 0.62, 0, 0.1, 0.08, 0.7, 0, F.col('oakDark'), 'wood'); }
    F.box(0, 0.3, 0, 1.36, 0.08, 0.06, 0, F.col('oakDark'), 'wood');                                    /* the stretcher */
    F.frustum(-0.4, 0.76, 0.1, 0.12, 0.08, 0.1, 0, F.col('clayPot'), 'terracotta', 12);
    for (let i = 0; i < 3; i++) F.box(-0.4 + (i - 1) * 0.06, 0.86, 0.1, 0.02, 0.003, 0.2, 0, F.col(i % 2 ? 'redOchre' : 'black'), 'terracotta');
    F.ell(0.3, 0.8, -0.1, 0.14, 0.06, 0.1, 0.4, F.col('gourd'), 'food');                                 /* a gourd */
    F.frustum(0.5, 0.76, 0.18, 0.05, 0.04, 0.08, 0, F.col('clayPot'), 'terracotta', 10);
  }
});
FURN({
  key: 'dalab_common_bench', name: 'Fret-carved bench', culture: 'dalab', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['living', 'hall', 'tavern', 'shop', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'], w: 1.7, d: 0.42, h: 0.46, variants: 1,
  build: function (F) {
    F.box(0, 0.38, 0, 1.7, 0.08, 0.42, 0, F.col('oak'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.7, 0, 0, 0.14, 0.38, 0.38, 0, F.col('oakDark'), 'wood');
    DALAB_FX.fret(F, -0.62, 0.15, 0.192, 1.24, 0.18, 0.012, F.col('oakDark'), 'wood');                   /* the stepped fret along its apron */
    F.box(0, 0.12, 0.17, 1.26, 0.26, 0.02, 0, F.col('oak'), 'wood');
  }
});
FURN({
  key: 'dalab_common_bed', name: 'Post bed with a striped blanket', culture: 'dalab', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'reed', 'cloth', 'hide'], w: 1.4, d: 2.05, h: 1.1, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.box(sx * 0.65, 0, -0.97, 0.1, 1.1, 0.1, 0, F.col('oakDark'), 'wood'); F.box(sx * 0.65, 0, 0.97, 0.1, 0.6, 0.1, 0, F.col('oakDark'), 'wood');
      F.box(sx * 0.65, 0.3, 0, 0.06, 0.12, 1.84, 0, F.col('oak'), 'wood'); }
    F.box(0, 0.6, -0.99, 1.2, 0.42, 0.04, 0, F.col('oak'), 'wood');                                     /* the headboard */
    F.box(0, 0.86, -0.965, 1.2, 0.1, 0.01, 0, F.col('turquoise'), 'wood');
    for (let i = 0; i < 6; i++) F.box(-0.5 + i * 0.2, 0.68, -0.965, 0.08, 0.12, 0.01, 0, F.col(i % 2 ? 'redOchre' : 'cream'), 'wood');
    F.box(0, 0.36, 0, 1.24, 0.03, 1.86, 0, F.col('reed'), 'reed');                                      /* the reed lattice */
    F.box(0, 0.39, 0, 1.2, 0.12, 1.8, 0, F.col('cream'), 'cloth');
    F.box(0.04, 0.51, 0.3, 1.24, 0.04, 1.2, 0, F.col('redOchre'), 'cloth');
    for (let i = 0; i < 5; i++) F.box(0.04, 0.551, -0.15 + i * 0.22, 1.24, 0.004, 0.06, 0, F.col(['black', 'turquoise', 'gold', 'turquoise', 'black'][i]), 'cloth');
    F.box(0, 0.51, -0.7, 0.8, 0.12, 0.34, 0, F.col('earth'), 'hide');                                   /* a deerskin pillow */
  }
});
FURN({
  key: 'dalab_common_chest', name: 'Oak chest with the red band', culture: 'dalab', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'store', 'shop'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], w: 1.1, d: 0.55, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0.06, 0, 1.06, 0.48, 0.55, 0, F.col('oak'), 'wood');
    F.box(0, 0.54, 0, 1.1, 0.08, 0.55, 0, F.col('oakDark'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.46, 0, 0, 0.12, 0.06, 0.5, 0, F.col('oakDark'), 'wood');
    F.box(0, 0.32, 0.276, 0.96, 0.12, 0.004, 0, F.col('redOchre'), 'wood');
    DALAB_FX.fret(F, -0.44, 0.12, 0.278, 0.88, 0.14, 0.008, F.col('oakDark'), 'wood');
    F.box(0, 0.44, 0.285, 0.1, 0.1, 0.02, 0, F.col('plate'), 'metal');                                    /* a hasp cut from Ancient plate */
  }
});
FURN({
  key: 'dalab_common_counter', name: "Trader's counter and scales", culture: 'dalab', tier: 'common', type: 'counter', setting: 'both', job: 'trading',
  rooms: ['shop', 'market', 'store'], anchor: 'floor', clearance: { front: 1.0, back: 0.7 },
  materials: ['timber', 'bronze', 'food', 'wicker', 'rope'], w: 2.0, d: 0.7, h: 1.4, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 2.0, 0.92, 0.66, 0, F.col('oak'), 'wood');
    F.box(0, 0.92, 0, 2.0, 0.05, 0.7, 0, F.col('oakDark'), 'wood');
    for (let i = 0; i < 4; i++) F.box(-0.75 + i * 0.5, 0.06, 0.333, 0.4, 0.8, 0.01, 0, F.col('woodGrey'), 'wood');
    F.box(0, 0.55, 0.34, 1.9, 0.08, 0.01, 0, F.col('turquoise'), 'wood');
    F.rod(0.5, 0.97, 0, 0.5, 1.38, 0, 0.015, F.col('oakDark'), 'wood');                                   /* the scales */
    F.rod(0.28, 1.36, 0, 0.72, 1.36, 0, 0.008, F.col('gold'), 'bronze');
    for (const sx of [-1, 1]) { F.rod(0.5 + sx * 0.22, 1.36, 0, 0.5 + sx * 0.22, 1.12, 0, 0.003, F.col('reed'), 'rope');
      F.cyl(0.5 + sx * 0.22, 1.1, 0, 0.08, 0.015, 0, F.col('gold'), 'bronze'); }
    F.frustum(-0.5, 0.97, 0.05, 0.18, 0.22, 0.14, 0, F.col('reed'), 'wicker', 12);                        /* a basket of beans */
    F.cyl(-0.5, 1.1, 0.05, 0.2, 0.012, 0, F.col('bean'), 'food');
    F.ell(-0.05, 1.03, -0.12, 0.12, 0.06, 0.09, 0.3, F.col('gourd'), 'food');
  }
});
FURN({
  key: 'dalab_common_lamp', name: 'Clay lamp on an oak post', culture: 'dalab', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'shop', 'tavern', 'bedroom', 'workshop'], anchor: 'floor', clearance: { front: 0.3 },
  materials: ['timber', 'terracotta', 'emissive', 'food', 'stone'], w: 0.4, d: 0.4, h: 1.35, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.38, 0.1, 0.38, 0, F.col('stone'), 'stone');
    F.box(0, 0.1, 0, 0.1, 1.1, 0.1, 0, F.col('oak'), 'wood');
    F.box(0, 0.7, 0.052, 0.08, 0.3, 0.004, 0, F.col('redOchre'), 'wood');
    F.box(0, 1.2, 0, 0.26, 0.04, 0.26, 0, F.col('oakDark'), 'wood');
    F.lathe(0, 1.24, 0, [[0.05, 0], [0.11, 0.04], [0.1, 0.07], [0.06, 0.08]], 0, F.col('clayPot'), 'terracotta', { nu: 12 });
    F.cyl(0, 1.3, 0, 0.06, 0.008, 0, F.col('maize'), 'food'); F.cone(0.06, 1.3, 0, 0.015, 0.05, 0, F.col('flame'), 'glow');
  }
});
FURN({
  key: 'dalab_common_mural_board', name: 'Mural panel of a hero of Dalab', culture: 'dalab', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['living', 'hall', 'shop', 'tavern', 'antechamber'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'plaster'], w: 1.6, d: 0.06, h: 0.9, variants: 2, variantNames: ['a hero with The God behind', 'the harvest under His eye'],
  build: function (F) {
    const v = F.variant | 0;
    F.box(0, 0, -0.026, 1.6, 0.9, 0.024, 0, F.col('oakDark'), 'wood');
    const cream = F.css(F.col('cream')), red = F.css(F.col('redOchre')), tq = F.css(F.col('turquoise')), gold = F.css(F.col('gold')), blk = F.css(F.col('black')), skin = F.css(F.col('godDim'));
    F.decal(0, 0.05, 0.0, 1.5, 0.8, 0, 'dalab-mural-' + v, function (g, W, H) {
      g.fillStyle = cream; g.fillRect(0, 0, W, H);
      for (const y of [0, H * 0.88]) { g.fillStyle = red; g.fillRect(0, y, W, H * 0.12);                     /* the fret borders */
        g.fillStyle = cream; for (let x = 0; x < W; x += H * 0.12) { g.fillRect(x, y + H * 0.03, H * 0.03, H * 0.06); g.fillRect(x, y + H * 0.03, H * 0.08, H * 0.025); } }
      const sun = (cx, cy, R) => { g.fillStyle = gold; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillRect(cx + Math.cos(a) * R - 3, cy + Math.sin(a) * R - 3, 6, 6); }
        g.fillStyle = tq; g.fillRect(cx - R * 0.6, cy - R * 0.6, R * 1.2, R * 1.2); g.fillStyle = cream; g.beginPath(); g.ellipse(cx, cy, R * 0.4, R * 0.22, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = blk; g.beginPath(); g.arc(cx, cy, R * 0.14, 0, Math.PI * 2); g.fill(); };
      if (v === 0) { sun(W * 0.72, H * 0.42, H * 0.24);
        g.fillStyle = skin; g.fillRect(W * 0.25, H * 0.3, W * 0.08, H * 0.38); g.fillRect(W * 0.26, H * 0.18, W * 0.06, H * 0.1);   /* the green-skinned hero, straight-drawn */
        g.fillStyle = red; g.fillRect(W * 0.24, H * 0.42, W * 0.1, H * 0.16); g.fillStyle = gold; g.fillRect(W * 0.24, H * 0.14, W * 0.1, H * 0.04);
        g.fillStyle = blk; g.fillRect(W * 0.34, H * 0.2, W * 0.012, H * 0.6);
      } else { sun(W * 0.5, H * 0.32, H * 0.18);
        for (let i = 0; i < 9; i++) { const x = W * (0.1 + i * 0.1); g.fillStyle = tq; g.fillRect(x, H * 0.55, W * 0.01, H * 0.3); g.fillStyle = gold; g.fillRect(x - W * 0.012, H * 0.5, W * 0.035, H * 0.1); } }   /* maize */
    }, 'plaster');
  }
});
FURN({
  key: 'dalab_common_shelf', name: 'Shelves of gourds and pots', culture: 'dalab', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'store', 'shop', 'living'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'terracotta', 'food', 'wicker'], w: 1.4, d: 0.4, h: 1.7, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.65, 0, -0.03, 0.08, 1.7, 0.34, 0, F.col('oakDark'), 'wood');
    F.box(0, 0.05, -0.185, 1.22, 1.6, 0.03, 0, F.col('woodGrey'), 'wood');
    for (const y of [0.05, 0.6, 1.15]) F.box(0, y, -0.03, 1.3, 0.04, 0.34, 0, F.col('oak'), 'wood');
    for (let i = 0; i < 4; i++) F.frustum(-0.45 + i * 0.3, 0.09, -0.03, 0.1, 0.07, 0.22, 0, F.col(i % 2 ? 'clayPot' : 'earth'), 'terracotta', 12);
    for (let i = 0; i < 3; i++) F.ell(-0.35 + i * 0.35, 0.74, -0.03, 0.12, 0.1, 0.1, i, F.col('gourd'), 'food');
    F.frustum(0.0, 1.19, -0.03, 0.14, 0.17, 0.16, 0, F.col('reed'), 'wicker', 12);
    for (let i = 0; i < 2; i++) F.blob(-0.45 + i * 0.9, 1.25, -0.03, 0.1, 0.14, 0, F.col('maize'), 'food');
  }
});

/* ---------------------------------------------------------------- court: the nobles' and priests' stone, The God's light */
FURN({
  key: 'dalab_court_stone_seat', name: 'Megalithic seat with the fret', culture: 'dalab', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court', 'temple'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['stone', 'cloth', 'gold'], w: 1.5, d: 1.0, h: 1.7, variants: 1,
  build: function (F) {
    F.box(0, 0, 0.0, 1.5, 0.12, 1.0, 0, F.col('stoneDark'), 'stone');                                   /* the plinth */
    F.box(0, 0.12, 0.02, 1.2, 0.36, 0.84, 0, F.col('stone'), 'stone');                                  /* the block */
    F.box(0, 0.12, 0.44, 1.1, 0.06, 0.04, 0, F.col('stoneDark'), 'stone');
    F.box(0, 0.48, -0.36, 1.36, 1.0, 0.28, 0, F.col('stone'), 'stone');                                  /* the back, stepped at its top */
    F.box(0, 1.48, -0.38, 1.0, 0.12, 0.24, 0, F.col('stoneLight'), 'stone');
    F.box(0, 1.6, -0.4, 0.6, 0.1, 0.2, 0, F.col('stoneLight'), 'stone');
    DALAB_FX.fret(F, -0.6, 1.1, -0.215, 1.2, 0.22, 0.02, F.col('stoneLight'), 'stone');
    F.box(0, 0.6, -0.218, 0.4, 0.4, 0.01, 0, F.col('turquoise'), 'stone');                              /* a turquoise inlay with the avatar */
    F.box(0, 0.78, -0.21, 0.16, 0.06, 0.012, 0, F.col('cream'), 'stone');
    F.box(0, 0.48, 0.05, 1.1, 0.1, 0.84, 0, F.col('redOchre'), 'cloth');                                 /* the red cushion: the seat is holy */
    for (const sx of [-1, 1]) { F.box(sx * 0.66, 0.12, 0, 0.18, 0.62, 0.86, 0, F.col('stone'), 'stone');
      F.box(sx * 0.66, 0.74, 0, 0.2, 0.06, 0.9, 0, F.col('stoneLight'), 'stone');
      F.ball(sx * 0.66, 0.84, 0.38, 0.05, F.col('gold'), 'gold'); }
  }
});
FURN({
  key: 'dalab_court_stone_table', name: 'Stone table on two blocks', culture: 'dalab', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'temple', 'study'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['stone', 'gold', 'terracotta', 'food'], w: 2.0, d: 0.9, h: 0.95, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.frustum(sx * 0.7, 0, 0, 0.26, 0.2, 0.72, 0, F.col('stone'), 'stone', 4);
      DALAB_FX.fret(F, sx * 0.7 - 0.18, 0.28, 0.23, 0.36, 0.14, 0.012, F.col('stoneLight'), 'stone'); }
    F.box(0, 0.72, 0, 2.0, 0.12, 0.9, 0, F.col('stoneLight'), 'stone');
    F.box(0, 0.74, 0.452, 1.9, 0.06, 0.006, 0, F.col('redOchre'), 'stone');
    F.lathe(-0.4, 0.84, 0, [[0.07, 0], [0.13, 0.04], [0.12, 0.08]], 0, F.col('gold'), 'gold', { nu: 14 });
    F.cyl(-0.4, 0.9, 0, 0.11, 0.008, 0, F.col('maize'), 'food');
    F.lathe(0.35, 0.84, 0.1, [[0.05, 0], [0.09, 0.05], [0.08, 0.1], [0.04, 0.11]], 0, F.col('clayPot'), 'terracotta', { nu: 12 });
    for (let i = 0; i < 3; i++) F.box(0.35, 0.87 + i * 0.025, 0.191, 0.08, 0.008, 0.006, 0, F.col(i % 2 ? 'black' : 'redOchre'), 'terracotta');
  }
});
FURN({
  key: 'dalab_court_god_light', name: "Pillar of The God's light", culture: 'dalab', tier: 'court', type: 'lamp', setting: 'both',
  rooms: ['hall', 'temple', 'court', 'shrine', 'antechamber'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['stone', 'emissive', 'glass', 'gold'], w: 0.6, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.56, 0.16, 0.56, 0, F.col('stoneDark'), 'stone');
    F.frustum(0, 0.16, 0, 0.22, 0.18, 1.3, 0, F.col('stone'), 'stone', 4);
    for (let k = 0; k < 3; k++) F.box(0, 0.5 + k * 0.32, 0, 0.42 - k * 0.03, 0.04, 0.42 - k * 0.03, 0, F.col('stoneLight'), 'stone');
    F.box(0, 1.46, 0, 0.5, 0.06, 0.5, 0, F.col('stoneLight'), 'stone');
    F.box(0, 1.52, 0, 0.32, 0.3, 0.32, 0, F.col('glassDark'), 'glass');                                  /* the lit pane, Ancient: cold teal-white */
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4; F.box(Math.sin(a) * 0.162, 1.55, Math.cos(a) * 0.162, 0.24, 0.24, 0.006, a, F.col('god'), 'glow'); }
    F.box(0, 1.82, 0, 0.42, 0.04, 0.42, 0, F.col('stoneLight'), 'stone');
    F.frustum(0, 1.86, 0, 0.12, 0.04, 0.04, 0, F.col('gold'), 'gold', 4);
  }
});
FURN({
  key: 'dalab_court_stele', name: 'Stele of the avatar', culture: 'dalab', tier: 'court', type: 'monument', setting: 'both',
  rooms: ['temple', 'court', 'plaza', 'hall', 'garden'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['stone', 'plaster'], w: 0.9, d: 0.5, h: 2.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.9, 0.2, 0.5, 0, F.col('stoneDark'), 'stone');
    F.box(0, 0.2, 0, 0.7, 2.3, 0.3, 0, F.col('stoneWarm'), 'stone');
    F.box(0, 2.5, 0, 0.6, 0.1, 0.26, 0, F.col('stoneWarm'), 'stone');
    const c = F.css;
    F.decal(0, 1.45, 0.152, 0.6, 0.6, 0, 'dalab-stele-eye', function (g, W, H) { DALAB_FX.eye(g, W, H, c(F.col('stoneWarm')), c(F.col('redOchre')), c(F.col('stone')), c(F.col('cream')), c(F.col('black'))); }, 'stone');
    for (let k = 0; k < 4; k++) DALAB_FX.fret(F, -0.3, 0.32 + k * 0.26, 0.155, 0.6, 0.18, 0.012, F.col('stone'), 'stone');   /* the relief bands of the deeds */
    DALAB_FX.fret(F, -0.3, 2.18, 0.155, 0.6, 0.16, 0.012, F.col('stone'), 'stone');
  }
});
FURN({
  key: 'dalab_court_reformation_couch', name: "Genepriest's couch of Reformation", culture: 'dalab', tier: 'court', type: 'workstation', setting: 'indoor', job: 'healing',
  rooms: ['temple', 'lab', 'workshop', 'cell'], anchor: 'floor', clearance: { front: 1.0, left: 0.8, right: 0.8 },
  materials: ['stone', 'metal', 'cloth', 'emissive', 'glass', 'gold'], w: 2.4, d: 1.0, h: 1.75, variants: 1,
  build: function (F) {
    F.box(-0.2, 0, 0, 1.9, 0.6, 0.8, 0, F.col('stone'), 'stone');                                       /* the couch of grey stone */
    DALAB_FX.fret(F, -1.05, 0.2, 0.41, 1.7, 0.2, 0.014, F.col('stoneLight'), 'stone');
    F.box(-0.2, 0.6, 0, 1.84, 0.08, 0.74, 0, F.col('robeWhite'), 'cloth');
    F.box(-1.0, 0.68, 0, 0.32, 0.1, 0.5, 0, F.col('robeWhite'), 'cloth');
    F.box(1.0, 0, -0.1, 0.36, 1.2, 0.5, 0, F.col('plate'), 'metal');                                     /* an Ancient cabinet beside it */
    for (let i = 0; i < 4; i++) F.box(1.0, 0.3 + i * 0.2, 0.152, 0.08, 0.04, 0.006, 0, F.col(i % 2 ? 'god' : 'godDim'), 'glow');
    F.box(1.0, 0.9, 0.152, 0.26, 0.18, 0.006, 0, F.col('glassDark'), 'glass');
    F.rod(1.0, 1.2, -0.1, 0.6, 1.7, 0.0, 0.025, F.col('plate'), 'metal');                                /* the arm and the lamp over the couch */
    F.box(0.3, 1.62, 0, 0.6, 0.06, 0.3, 0, F.col('plate'), 'metal');
    F.box(0.3, 1.6, 0, 0.5, 0.02, 0.22, 0, F.col('god'), 'glow');
    F.box(1.0, 0.0, 0.3, 0.36, 0.7, 0.3, 0, F.col('stoneDark'), 'stone');                               /* the tray of instruments */
    for (let i = 0; i < 5; i++) F.rod(0.86 + i * 0.06, 0.71, 0.22, 0.86 + i * 0.06, 0.71, 0.4, 0.006, F.col(i === 2 ? 'gold' : 'plate'), i === 2 ? 'gold' : 'metal');
    F.box(-0.2, 0.62, 0.38, 1.7, 0.02, 0.02, 0, F.col('redOchre'), 'cloth');                             /* the red, for the holy work */
  }
});
FURN({
  key: 'dalab_court_cabinet_bank', name: "The God's cabinet bank", culture: 'dalab', tier: 'court', type: 'shrine', setting: 'indoor',
  rooms: ['temple', 'shrine', 'lab'], anchor: 'wall', clearance: { front: 1.5 },
  materials: ['metal', 'emissive', 'glass', 'cloth', 'gold', 'stone', 'food', 'terracotta'], w: 2.4, d: 0.8, h: 2.3, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.12, 2.4, 0.08, 0.56, 0, F.col('stoneDark'), 'stone');
    for (let i = 0; i < 4; i++) { const x = -0.9 + i * 0.6;                                               /* four cabinets of the Ancients, a plant room to a stranger */
      F.box(x, 0.08, -0.12, 0.56, 2.1, 0.54, 0, F.col('plate'), 'metal');
      F.box(x, 1.4, 0.152, 0.44, 0.5, 0.006, 0, F.col('glassDark'), 'glass');
      for (let k = 0; k < 6; k++) F.box(x - 0.15 + (k % 3) * 0.15, 1.5 + Math.floor(k / 3) * 0.2, 0.158, 0.06, 0.03, 0.004, 0, F.col((k + i) % 3 ? 'godDim' : 'god'), 'glow');
      for (let k = 0; k < 5; k++) F.box(x, 0.3 + k * 0.18, 0.152, 0.44, 0.02, 0.006, 0, F.col('black'), 'metal'); }   /* the vents */
    F.box(0, 2.18, -0.12, 2.4, 0.12, 0.56, 0, F.col('plate'), 'metal');
    F.box(0, 2.0, 0.17, 2.3, 0.3, 0.012, 0, F.col('redOchre'), 'cloth');                                 /* the red swag: it is holy */
    for (let i = 0; i < 6; i++) F.box(-1.0 + i * 0.4, 1.88, 0.18, 0.08, 0.14, 0.012, 0, F.col('gold'), 'gold');
    F.box(0, 0, 0.32, 1.8, 0.3, 0.16, 0, F.col('stone'), 'stone');                                       /* the offering step before it */
    for (let i = 0; i < 4; i++) F.blob(-0.6 + i * 0.4, 0.34, 0.32, 0.06, 0.08, 0, F.col(i % 2 ? 'maize' : 'gourd'), 'food');
    for (const sx of [-1, 1]) F.frustum(sx * 0.82, 0.3, 0.32, 0.06, 0.08, 0.1, 0, F.col('clayPot'), 'terracotta', 10);
  }
});
FURN({
  key: 'dalab_court_stone_bed', name: "Noble's stone bed", culture: 'dalab', tier: 'court', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'court'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['stone', 'cloth', 'gold', 'hide'], w: 1.7, d: 2.2, h: 1.4, variants: 1,
  build: function (F) {
    F.box(0, 0, 0.05, 1.7, 0.4, 2.1, 0, F.col('stone'), 'stone');
    DALAB_FX.fret(F, -0.7, 0.1, 1.105, 1.4, 0.2, 0.014, F.col('stoneLight'), 'stone');
    F.box(0, 0, -1.04, 1.7, 1.4, 0.12, 0, F.col('stone'), 'stone');                                     /* the stepped headstone */
    F.box(0, 1.25, -1.0, 1.2, 0.15, 0.08, 0, F.col('stoneLight'), 'stone');
    F.box(0, 0.7, -0.976, 1.2, 0.36, 0.01, 0, F.col('turquoise'), 'stone');
    for (let i = 0; i < 5; i++) F.box(-0.48 + i * 0.24, 0.8, -0.968, 0.12, 0.16, 0.008, 0, F.col('cream'), 'stone');
    F.box(0, 0.4, 0.05, 1.56, 0.14, 2.0, 0, F.col('robeWhite'), 'cloth');
    F.box(0.04, 0.54, 0.35, 1.6, 0.05, 1.4, 0, F.col('turquoise'), 'cloth');                             /* the coverlet, turquoise and gold */
    for (let i = 0; i < 4; i++) F.box(0.04, 0.591, -0.1 + i * 0.32, 1.6, 0.004, 0.06, 0, F.col('gold'), 'cloth');
    F.box(0, 0.54, -0.72, 1.1, 0.14, 0.36, 0, F.col('cream'), 'hide');
    for (const sx of [-1, 1]) F.ball(sx * 0.78, 1.36, -1.04, 0.05, F.col('gold'), 'gold');
  }
});
FURN({
  key: 'dalab_court_banner', name: 'Temple banner of the eye', culture: 'dalab', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['temple', 'hall', 'court', 'shrine'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['cloth', 'timber', 'gold'], w: 1.1, d: 0.08, h: 2.3, variants: 1,
  build: function (F) {
    F.rod(-0.52, 2.24, 0, 0.52, 2.24, 0, 0.025, F.col('oakDark'), 'wood');
    for (const sx of [-1, 1]) F.frustum(sx * 0.53, 2.21, 0, 0.03, 0.01, 0.06, 0, F.col('gold'), 'gold', 4);
    F.box(0, 0.25, -0.012, 0.96, 1.96, 0.012, 0, F.col('sacred'), 'cloth');
    const c = F.css;
    F.decal(0, 0.3, 0.001, 0.9, 1.86, 0, 'dalab-banner', function (g, W, H) {
      g.fillStyle = c(F.col('sacred')); g.fillRect(0, 0, W, H);
      g.fillStyle = c(F.col('cream')); g.fillRect(W * 0.05, H * 0.03, W * 0.9, H * 0.015); g.fillRect(W * 0.05, H * 0.95, W * 0.9, H * 0.015);
      for (let k = 0; k < 2; k++) { const y = k ? H * 0.82 : H * 0.07;                                      /* cream fret on turquoise */
        g.fillStyle = c(F.col('turquoise')); g.fillRect(W * 0.05, y, W * 0.9, H * 0.08); g.fillStyle = c(F.col('cream'));
        for (let x = W * 0.07; x < W * 0.92; x += W * 0.12) { g.fillRect(x, y + H * 0.015, W * 0.025, H * 0.05); g.fillRect(x, y + H * 0.015, W * 0.07, H * 0.015); g.fillRect(x + W * 0.05, y + H * 0.03, W * 0.02, H * 0.035); } }
      g.save(); g.translate(0, H * 0.27); DALAB_FX.eye(g, W, W, c(F.col('sacred')), c(F.col('gold')), c(F.col('turquoise')), c(F.col('cream')), c(F.col('black'))); g.restore();
    }, 'cloth');
    for (let i = 0; i < 6; i++) F.box(-0.4 + i * 0.16, 0.12, -0.012, 0.05, 0.14, 0.008, 0, F.col('gold'), 'cloth');
  }
});
