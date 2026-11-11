/* ======================================================================
   Tungang furniture: the Rift line's union crews a thousand years on, in their holds under the rim (biomes/riftrim/
   PLAN.md section 6; LORE.md 6.1; kits/yeti/PLAN.md section 11, 2026-10-26). Post-apocalyptic Soviet: every hold is a
   loj under an elected steward, bound by the Book. What they sit on, sleep in and keep is salvage of the Line: Ancient
   plate and pipe, riveted; enamel in cream and red, chipped black; timber only where it was carried down; canvas and
   grey blanket; lamps of glow-cap in jars. The poor sleep in bunks racked along the galleries and eat at trestles; a
   household keeps lockers, a box bed behind a curtain, a water butt, the glow-cap trays; the loj hall holds the Book on
   its lectern, the steward's desk, the meeting's benches, the Tpresden's chair (a carriage seat from the Line), the
   union banner, the minute chest, the timetable read aloud as rite, and a gear of the old lifts kept polished without
   memory of its use. Red paint is worn to rust-pink. Enamel draws on the ceramic family (glossy).
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('tungang', { name: 'Tungangs', pack: null, influences: 'post-apocalyptic Soviet; a union lodge kept by rite; the Line\'s salvage',
  materials: 'Ancient plate and pipe, rivets, enamel, salvaged timber, canvas, grey blanket, glow-cap, brass',
  palette: {
    plate: 0x8a8e8c, plateDark: 0x5a5e5e, pipe: 0x6e7274, pipeBright: 0xa8aca8, rivet: 0x3e403e, concrete: 0x9a968c,
    rust: 0x7a4a32, rustDeep: 0x553222, enamelCream: 0xe2d8bc, enamelRed: 0xa8382c, enamelChip: 0x2a2826,
    paintRed: 0xb04030, paintRose: 0xc88478, paintCream: 0xd8ccae, timberOld: 0x7a6248, timberDark: 0x4e3e2e,
    canvasRaw: 0x8a8264, blanketGrey: 0x6a6a64, blanketRed: 0x8a3028, blanketBrown: 0x5e4a3a, bannerRed: 0x9a2a22,
    glowcap: 0x9fe8c0, glowcapBlue: 0x8ad0e8, fungusPale: 0xd8d0b4, fungusCap: 0xb09a78, fungusMat: 0x6a5a48,
    paperBook: 0xd8cca8, ink: 0x2a2622, leather: 0x5a3a26, brass: 0xb08a48, glass: 0xbfd4cc, flame: 0xffa040,
    seatBlue: 0x3a4a6a, seatWhite: 0xc8c8c0,
    lampRed: 0xd8462e, lampGreen: 0x46c27a, lampAmber: 0xf0a63a, lampWhite: 0xf6f3ea, hood: 0x2e3030,
    enamelGreen: 0x2e6a4a, enamelBlue: 0x2a4a7a, plasterWhite: 0xe6e2d6, plasterRule: 0xa8a294, wax: 0xe8dcb0, waxDark: 0xc8b47c,
    oreCopper: 0x4e8a6a, oreRust: 0x8a5a3a, oreGrey: 0x5e5a56, ice: 0xcfe4ec, crystal: 0xdce8ee, felt: 0x6e6252,
    mosaicOchre: 0xc89a48, mosaicBlue: 0x3a5a8a, mosaicGold: 0xd8b058, cellCase: 0x3a4044, cellGlow: 0x8ae0f0, stoke: 0x8a3a5a
  } });
/* END PALETTE */

/* ---------------------------------------------------------------- poor: the galleries */
FURN({
  key: 'tungang_poor_gallery_bunk', name: 'Gallery bunks', culture: 'tungang', tier: 'poor', type: 'bed', setting: 'indoor', role: 'bunk',
  rooms: ['dormitory', 'barracks', 'bedroom', 'cell'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'cloth'], w: 2.1, d: 0.95, h: 1.75, variants: 2, variantNames: ['two high', 'three high'],
  variantDims: [{ w: 2.1, d: 0.95, h: 1.75 }, { w: 2.1, d: 0.95, h: 2.45 }],
  build: function (F) {
    const three = (F.variant | 0) === 1, H = three ? 2.45 : 1.75, levels = three ? [0.3, 1.08, 1.86] : [0.3, 1.12];
    F.box(0, 0.25, -0.45, 2.0, H - 0.35, 0.03, 0, F.col('plateDark'), 'metal');                     /* the plate bolted to the gallery wall */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 1.0, 0, sz * 0.4, sx * 1.0, H, sz * 0.4, 0.03, F.col('pipe'), 'metal');
    for (const y of levels) {
      F.box(0, y, 0, 2.0, 0.05, 0.82, 0, F.col('plate'), 'metal');                                  /* the plate deck */
      F.box(0, y + 0.05, -0.01, 1.9, 0.1, 0.74, 0, F.col('canvasRaw'), 'cloth');                     /* the canvas pallet */
      F.box(0.25, y + 0.15, 0.02, 1.3, 0.03, 0.76, 0, F.pick(['blanketGrey', 'blanketRed', 'blanketBrown']), 'cloth');
      F.box(-0.72, y + 0.15, -0.05, 0.36, 0.08, 0.5, 0, F.col('seatWhite'), 'cloth');               /* a rolled shirt for a pillow */
      for (const sz of [-1, 1]) F.rod(-1.0, y + 0.28, sz * 0.4, 1.0, y + 0.28, sz * 0.4, 0.018, F.col('pipe'), 'metal');   /* the rails */
    }
    for (let y = 0.2; y < H - 0.1; y += 0.3) F.rod(0.72, y, 0.42, 0.95, y, 0.42, 0.015, F.col('pipeBright'), 'metal');  /* the ladder's rungs */
    F.rod(0.72, 0, 0.42, 0.72, H - 0.1, 0.42, 0.02, F.col('pipe'), 'metal');
    F.box(-1.0, 1.0, 0.43, 0.12, 0.16, 0.01, 0, F.col('paintRose'), 'metal');                       /* the berth number, painted on the post */
  }
});
FURN({
  key: 'tungang_poor_drum_seat', name: 'Drum seat', culture: 'tungang', tier: 'poor', type: 'chair', setting: 'indoor',
  rooms: ['dormitory', 'kitchen', 'living', 'workshop', 'barracks', 'study', 'tg_signal', 'tg_guard', 'tg_fixers', 'tg_vein', 'tg_stoke'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['rustSteel', 'cloth', 'timber', 'metal'], w: 0.5, d: 0.5, h: 0.5, variants: 2, variantNames: ['a cut-down drum', 'a crate'],
  build: function (F) {
    if ((F.variant | 0) === 0) {
      F.cyl(0, 0, 0, 0.22, 0.44, 0, F.col('rust'), 'rust');
      for (const y of [0.08, 0.3]) F.cyl(0, y, 0, 0.226, 0.025, 0, F.col('rustDeep'), 'rust');        /* the rolled hoops */
      F.cyl(0, 0.44, 0, 0.2, 0.05, 0, F.col('blanketGrey'), 'cloth');                                /* a folded blanket for a seat */
      F.box(0, 0.16, 0.215, 0.14, 0.1, 0.012, 0, F.col('paintRose'), 'metal');                       /* the worn red stencil */
    } else {
      F.box(0, 0, 0, 0.46, 0.4, 0.42, 0, F.col('timberOld'), 'wood');
      for (const y of [0.1, 0.24]) F.box(0, y, 0, 0.47, 0.03, 0.43, 0, F.col('timberDark'), 'wood');  /* the slats' shadows */
      F.box(0, 0.4, 0, 0.4, 0.06, 0.36, 0, F.col('blanketBrown'), 'cloth');
      for (const sx of [-1, 1]) F.box(sx * 0.2, 0, 0.2, 0.04, 0.4, 0.02, 0, F.col('plate'), 'metal');   /* the corner plates */
    }
  }
});
FURN({
  key: 'tungang_poor_trestle', name: 'Mess trestle', culture: 'tungang', tier: 'poor', type: 'table', setting: 'indoor',
  rooms: ['kitchen', 'dormitory', 'barracks', 'hall', 'tavern'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['timber', 'metal', 'ceramic', 'food'], w: 1.8, d: 0.75, h: 0.86, variants: 1,
  build: function (F) {
    F.box(0, 0.71, 0, 1.8, 0.05, 0.75, 0, F.col('timberOld'), 'wood');                              /* planks carried down from Ledge */
    for (const z of [-0.18, 0.18]) F.box(0, 0.755, z, 1.8, 0.004, 0.01, 0, F.col('timberDark'), 'wood');   /* the plank joints */
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) F.rod(sx * 0.7, 0, sz * 0.3, sx * 0.7, 0.71, sz * 0.2, 0.025, F.col('pipe'), 'metal');
      F.rod(sx * 0.7, 0.16, -0.28, sx * 0.7, 0.16, 0.28, 0.02, F.col('pipe'), 'metal');
    }
    F.rod(-0.7, 0.16, 0, 0.7, 0.16, 0, 0.02, F.col('pipe'), 'metal');
    for (const [x, z] of [[-0.55, 0.15], [-0.3, -0.2], [0.45, 0.18]]) {
      F.cyl(x, 0.76, z, 0.04, 0.09, 0, F.col('enamelCream'), 'ceramic');                              /* enamel mugs */
      F.cyl(x, 0.84, z, 0.042, 0.012, 0, F.col('enamelChip'), 'ceramic');                             /* their black rims */
    }
    F.cyl(0.1, 0.76, -0.05, 0.13, 0.018, 0, F.col('plate'), 'metal');                                /* a tin plate */
    F.blob(0.06, 0.8, -0.05, 0.05, 0.04, 0, F.col('fungusPale'), 'food'); F.blob(0.15, 0.8, -0.02, 0.04, 0.035, 0, F.col('fungusCap'), 'food');
  }
});
FURN({
  key: 'tungang_poor_footlocker', name: 'Riveted foot locker', culture: 'tungang', tier: 'poor', type: 'storage', setting: 'indoor',
  rooms: ['dormitory', 'barracks', 'bedroom', 'cell', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal'], w: 0.9, d: 0.5, h: 0.5, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.88, 0.44, 0.48, 0, F.col('plate'), 'metal');
    F.box(0, 0.44, 0, 0.9, 0.05, 0.5, 0, F.col('plateDark'), 'metal');                              /* the lid */
    for (let i = 0; i < 7; i++) for (const y of [0.04, 0.4]) F.ball(-0.39 + i * 0.13, y, 0.24, 0.012, F.col('rivet'), 'metal');
    F.box(0, 0.14, 0.241, 0.3, 0.14, 0.004, 0, F.col('paintCream'), 'metal');                       /* the stencilled berth number */
    F.box(0, 0.34, 0.245, 0.08, 0.08, 0.012, 0, F.col('rivet'), 'metal');                           /* the hasp */
    for (const sx of [-1, 1]) F.rod(sx * 0.448, 0.3, -0.08, sx * 0.448, 0.3, 0.08, 0.012, F.col('pipe'), 'metal');   /* the carrying handles */
  }
});
FURN({
  key: 'tungang_poor_glowcap_jar', name: 'Glow-cap jar', culture: 'tungang', tier: 'poor', type: 'lamp', setting: 'indoor',
  rooms: ['dormitory', 'bedroom', 'kitchen', 'living', 'hall', 'workshop', 'cell'], anchor: 'surface', clearance: {},
  materials: ['glass', 'emissive', 'food', 'metal'], w: 0.22, d: 0.22, h: 0.34, variants: 1,
  build: function (F) {
    F.blob(0, 0.035, 0, 0.075, 0.06, 0, F.col('fungusMat'), 'food');                                 /* the mat the caps grow from */
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + F.rr(0, 0.4), r = 0.035 + (i % 2) * 0.02, y = 0.08 + (i % 3) * 0.04;
      F.rod(Math.cos(a) * r * 0.5, 0.05, Math.sin(a) * r * 0.5, Math.cos(a) * r, y, Math.sin(a) * r, 0.006, F.col('glowcap'), 'glow');
      F.ball(Math.cos(a) * r, y, Math.sin(a) * r, 0.022, F.col(i % 2 ? 'glowcapBlue' : 'glowcap'), 'glow'); }
    F.cyl(0, 0, 0, 0.09, 0.26, 0, F.col('glass'), 'glass');                                          /* the jar */
    F.cyl(0, 0.26, 0, 0.095, 0.03, 0, F.col('plateDark'), 'metal');                                  /* its pierced lid */
    F.rod(-0.075, 0.29, 0, 0, 0.335, 0, 0.005, F.col('pipe'), 'metal'); F.rod(0, 0.335, 0, 0.075, 0.29, 0, 0.005, F.col('pipe'), 'metal');
  }
});
FURN({
  key: 'tungang_poor_drum_stove', name: 'Drum stove', culture: 'tungang', tier: 'poor', type: 'stove', setting: 'indoor',
  rooms: ['kitchen', 'dormitory', 'living', 'workshop', 'barracks'], anchor: 'floor', clearance: { front: 0.8, left: 0.3, right: 0.3 },
  materials: ['rustSteel', 'emissive', 'ceramic', 'metal'], w: 0.7, d: 0.7, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.18, 0, sz * 0.18, sx * 0.18, 0.13, sz * 0.18, 0.02, F.col('pipe'), 'metal');
    F.cyl(0, 0.12, 0, 0.29, 0.62, 0, F.col('rust'), 'rust');                                          /* an oil drum on its legs */
    for (const y of [0.24, 0.56]) F.cyl(0, y, 0, 0.296, 0.025, 0, F.col('rustDeep'), 'rust');
    F.box(0, 0.24, 0.28, 0.26, 0.22, 0.03, 0, F.col('rustDeep'), 'rust');                            /* the cut door */
    for (let i = 0; i < 3; i++) F.box(0, 0.28 + i * 0.05, 0.297, 0.18, 0.018, 0.006, 0, F.col('flame'), 'glow');   /* fire through the slots */
    F.cyl(0, 0.74, 0, 0.27, 0.02, 0, F.col('plateDark'), 'metal');                                   /* the hotplate */
    F.frustum(0.1, 0.76, 0.06, 0.1, 0.07, 0.14, 0, F.col('enamelCream'), 'ceramic', 12);              /* the enamel kettle */
    F.rod(0.17, 0.82, 0.08, 0.24, 0.88, 0.1, 0.012, F.col('enamelCream'), 'ceramic');
    F.rod(-0.12, 0.74, -0.12, -0.12, 1.9, -0.12, 0.06, F.col('plateDark'), 'metal');                 /* the flue */
    F.cyl(-0.12, 1.3, -0.12, 0.07, 0.04, 0, F.col('rivet'), 'metal');                                /* its damper collar */
  }
});
FURN({
  key: 'tungang_poor_peg_wall', name: 'Peg wall with kit', culture: 'tungang', tier: 'poor', type: 'rack', setting: 'indoor',
  rooms: ['dormitory', 'barracks', 'living', 'antechamber'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'metal', 'cloth', 'hide', 'emissive', 'glass'], w: 1.2, d: 0.3, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.52, 0, -0.13, 0.08, 1.8, 0.04, 0, F.col('timberDark'), 'wood');   /* the battens */
    F.box(0, 1.5, -0.12, 1.2, 0.1, 0.05, 0, F.col('timberOld'), 'wood');                               /* the peg rail */
    for (let i = 0; i < 4; i++) F.rod(-0.42 + i * 0.28, 1.53, -0.1, -0.42 + i * 0.28, 1.56, 0.0, 0.012, F.col('pipe'), 'metal');
    F.box(-0.42, 0.75, -0.06, 0.4, 0.76, 0.1, 0, F.col('canvasRaw'), 'cloth');                         /* the work coat */
    F.box(-0.42, 1.38, -0.06, 0.16, 0.14, 0.1, 0, F.col('canvasRaw'), 'cloth');
    F.dome(-0.14, 1.36, -0.02, 0.13, 0.12, 0, F.col('enamelRed'), 'metal');                           /* the helmet with its lamp */
    F.cyl(-0.14, 1.42, 0.11, 0.035, 0.05, 0, F.col('glowcap'), 'glow');
    for (const sx of [-1, 1]) F.cyl(0.14 + sx * 0.05, 1.32, 0.0, 0.03, 0.03, 0, F.col('glass'), 'glass');   /* the day goggles, dark-lensed */
    F.box(0.14, 1.34, -0.01, 0.16, 0.012, 0.012, 0, F.col('leather'), 'leather');
    F.box(0.42, 1.0, -0.06, 0.16, 0.5, 0.06, 0, F.col('leather'), 'leather');                         /* a satchel on its strap */
    F.box(0, 0.1, -0.02, 1.0, 0.03, 0.22, 0, F.col('timberOld'), 'wood');                              /* the boot shelf */
    for (const x of [-0.3, -0.16, 0.2, 0.34]) F.box(x, 0.13, 0.0, 0.11, 0.24, 0.18, 0, F.col('leather'), 'leather');
  }
});

/* ---------------------------------------------------------------- common: a household and its loj */
FURN({
  key: 'tungang_common_bench', name: 'Painted bench', culture: 'tungang', tier: 'common', type: 'bench', setting: 'indoor',
  rooms: ['hall', 'kitchen', 'living', 'tavern', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], w: 1.8, d: 0.42, h: 0.46, variants: 1,
  build: function (F) {
    F.box(0, 0.4, 0, 1.8, 0.06, 0.42, 0, F.col('paintRed'), 'wood');
    F.box(0, 0.4, 0.205, 1.8, 0.06, 0.012, 0, F.col('paintRose'), 'wood');                            /* the edge, worn pink */
    for (const sx of [-1, 1]) { for (const sz of [-1, 1]) F.rod(sx * 0.72, 0, sz * 0.16, sx * 0.72, 0.4, sz * 0.12, 0.022, F.col('pipe'), 'metal');
      F.rod(sx * 0.72, 0.12, -0.15, sx * 0.72, 0.12, 0.15, 0.018, F.col('pipe'), 'metal'); }
    F.rod(-0.72, 0.12, 0, 0.72, 0.12, 0, 0.018, F.col('pipe'), 'metal');
  }
});
FURN({
  key: 'tungang_common_lockers', name: 'Enamel lockers', culture: 'tungang', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['dormitory', 'barracks', 'antechamber', 'workshop', 'store', 'living'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['ceramic', 'metal'], w: 1.2, d: 0.5, h: 1.9, variants: 2, variantNames: ['three doors', 'two doors'],
  variantDims: [{ w: 1.2, d: 0.5, h: 1.9 }, { w: 0.8, d: 0.5, h: 1.9 }],
  build: function (F) {
    const n = (F.variant | 0) === 1 ? 2 : 3, W = n * 0.4;
    F.box(0, 0, 0, W, 0.08, 0.46, 0, F.col('plateDark'), 'metal');                                   /* the plinth */
    F.box(0, 0.08, -0.01, W, 1.8, 0.48, 0, F.col('enamelCream'), 'ceramic');
    F.box(0, 1.84, -0.01, W, 0.06, 0.48, 0, F.col('plateDark'), 'metal');
    for (let i = 0; i < n; i++) { const x = -W / 2 + 0.2 + i * 0.4;
      F.box(x, 0.12, 0.236, 0.36, 1.68, 0.01, 0, F.col(i % 2 ? 'enamelCream' : 'enamelRed'), 'ceramic');
      for (let k = 0; k < 4; k++) F.box(x, 1.55 + k * 0.04, 0.243, 0.2, 0.012, 0.004, 0, F.col('enamelChip'), 'ceramic');   /* the vents */
      F.box(x, 1.36, 0.243, 0.1, 0.07, 0.004, 0, F.col('paintCream'), 'ceramic');                    /* the number plate */
      F.ball(x + 0.13, 0.95, 0.25, 0.018, F.col('pipeBright'), 'metal');                             /* the latch */
      for (let k = 0; k < 3; k++) F.box(x + F.rr(-0.14, 0.14), F.rr(0.2, 1.7), 0.242, F.rr(0.015, 0.035), F.rr(0.012, 0.03), 0.004, 0, F.col('enamelChip'), 'ceramic'); }   /* chips */
  }
});
FURN({
  key: 'tungang_common_fungus_trays', name: 'Glow-cap trays', culture: 'tungang', tier: 'common', type: 'rack', setting: 'indoor', job: 'fungiculture', role: 'spawn_rack',
  rooms: ['workshop', 'store', 'kitchen', 'farm'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['metal', 'food', 'emissive'], w: 1.4, d: 0.6, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.66, 0, sz * 0.26, sx * 0.66, 1.8, sz * 0.26, 0.022, F.col('pipe'), 'metal');
    const trays = [0.2, 0.6, 1.0, 1.4];
    for (let t = 0; t < trays.length; t++) { const y = trays[t];
      F.box(0, y, 0, 1.34, 0.04, 0.56, 0, F.col('plate'), 'metal');
      F.box(0, y + 0.04, 0, 1.24, 0.06, 0.48, 0, F.col('fungusMat'), 'food');                         /* the bedding of the mat */
      const glow = t === trays.length - 1;
      for (let i = 0; i < 9; i++) { const x = -0.54 + i * 0.135 + F.rr(-0.03, 0.03), z = F.rr(-0.16, 0.16), s = F.rr(0.035, 0.06);
        F.rod(x, y + 0.1, z, x, y + 0.14, z, 0.01, F.col('fungusPale'), glow ? 'glow' : 'food');
        F.dome(x, y + 0.14, z, s, s * 0.6, 0, F.col(glow ? 'glowcap' : (i % 2 ? 'fungusCap' : 'fungusPale')), glow ? 'glow' : 'food'); }
    }
    F.box(0, 1.76, 0, 1.36, 0.04, 0.56, 0, F.col('plateDark'), 'metal');                              /* the drip plate over it */
  }
});
FURN({
  key: 'tungang_common_tool_wall', name: "The Fixers' tool wall", culture: 'tungang', tier: 'common', type: 'rack', setting: 'indoor',
  rooms: ['workshop', 'store', 'antechamber'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'timber', 'rope', 'emissive', 'glass'], w: 1.4, d: 0.4, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.rod(sx * 0.62, 0, -0.17, sx * 0.62, 1.88, -0.17, 0.025, F.col('pipe'), 'metal');
    F.box(0, 0.7, -0.18, 1.4, 1.15, 0.03, 0, F.col('plate'), 'metal');                                /* the plate the tools hang on */
    for (let i = 0; i < 5; i++) F.box(0, 0.75 + i * 0.25, -0.16, 1.36, 0.012, 0.006, 0, F.col('rivet'), 'metal');
    for (let i = 0; i < 4; i++) { const x = -0.52 + i * 0.12;                                            /* spanners, longest first */
      F.box(x, 1.2 - i * 0.05, -0.155, 0.03, 0.42 - i * 0.05, 0.012, 0, F.col('pipeBright'), 'metal');
      F.box(x, 1.6 - i * 0.1, -0.155, 0.07, 0.04, 0.014, 0, F.col('pipeBright'), 'metal'); }
    F.rod(0.0, 1.0, -0.15, 0.0, 1.38, -0.15, 0.015, F.col('timberOld'), 'wood'); F.box(0.0, 1.38, -0.14, 0.14, 0.06, 0.05, 0, F.col('plateDark'), 'metal');   /* the hammer */
    const coil = []; for (let i = 0; i <= 16; i++) { const a = i * F.TAU / 16; coil.push([0.32 + Math.cos(a) * 0.13, 1.1 + Math.sin(a) * 0.13, -0.13]); }
    F.tube(coil, 0.025, F.col('rustDeep'), 'rope');                                                       /* a coil of old cable on its hook */
    F.box(0.32, 1.25, -0.12, 0.04, 0.06, 0.06, 0, F.col('pipe'), 'metal');
    F.box(0.5, 1.52, -0.12, 0.12, 0.16, 0.08, 0, F.col('plateDark'), 'metal'); F.box(0.5, 1.56, -0.075, 0.08, 0.08, 0.01, 0, F.col('glowcap'), 'glow');   /* the hand lamp */
    F.box(0.5, 1.52, -0.07, 0.1, 0.12, 0.004, 0, F.col('glass'), 'glass');
    F.box(0, 0.8, -0.04, 1.3, 0.04, 0.32, 0, F.col('timberOld'), 'wood');                              /* the shelf */
    F.box(-0.35, 0.84, -0.04, 0.4, 0.16, 0.22, 0, F.col('enamelRed'), 'metal');                       /* a toolbox */
    F.box(0.1, 0, -0.04, 0.5, 0.3, 0.3, 0, F.col('plateDark'), 'metal');                               /* the spares bin */
    F.box(0.1, 0.3, -0.04, 0.44, 0.04, 0.26, 0, F.col('rust'), 'metal');
  }
});
FURN({
  key: 'tungang_common_timetable', name: 'The timetable board', culture: 'tungang', tier: 'common', type: 'art', setting: 'indoor',
  rooms: ['hall', 'antechamber', 'shrine', 'living'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'metal'], w: 1.2, d: 0.06, h: 0.9, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.025, 1.2, 0.9, 0.025, 0, F.col('timberDark'), 'wood');
    const cream = F.css(F.col('paintCream')), red = F.css(F.col('paintRed')), rose = F.css(F.col('paintRose')), ink = F.css(F.col('ink'));
    F.decal(0, 0.05, 0.001, 1.1, 0.8, 0, 'tungang-timetable', function (g, W, H) {
      const r = FK.paintRng(41);
      g.fillStyle = cream; g.fillRect(0, 0, W, H);
      g.fillStyle = red; g.fillRect(0, 0, W, H * 0.16);
      g.fillStyle = cream; g.font = 'bold ' + Math.round(H * 0.11) + 'px monospace'; g.textAlign = 'center'; g.fillText('TLAIN  TAIMS', W / 2, H * 0.12);
      g.fillStyle = ink; g.font = Math.round(H * 0.06) + 'px monospace'; g.textAlign = 'left';
      for (let i = 0; i < 9; i++) { const y = H * (0.25 + i * 0.08);
        g.fillText(('0' + (4 + i * 2)).slice(-2) + ':' + ['00', '15', '30', '45'][i % 4], W * 0.06, y);
        g.fillText('LOJ ' + ['WUN', 'TOO', 'FOWER', 'FAIV', 'SIKS', 'AIT', 'NAIN', 'TEN', 'LEVN'][i], W * 0.4, y); }
      g.fillStyle = rose; for (let i = 0; i < 14; i++) g.fillRect(r() * W, r() * H, W * (0.02 + r() * 0.06), H * (0.01 + r() * 0.03));   /* the paint worn off */
    }, 'wood');
    for (const [x, y] of [[-0.56, 0.84], [0.56, 0.84], [-0.56, 0.05], [0.56, 0.05]]) F.ball(x, y, 0.0, 0.015, F.col('rivet'), 'metal');
  }
});
FURN({
  key: 'tungang_common_signal_post', name: 'Signal post: bell and lamp', culture: 'tungang', tier: 'common', type: 'lamp', setting: 'both',
  rooms: ['hall', 'antechamber', 'street', 'dock', 'plaza'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'bronze', 'emissive', 'rope', 'glass'], w: 0.75, d: 0.5, h: 2.1, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.22, 0.05, 0, F.col('plateDark'), 'metal');
    F.rod(0, 0.05, 0, 0, 2.05, 0, 0.04, F.col('pipe'), 'metal');
    for (let i = 0; i < 4; i++) F.cyl(0, 0.3 + i * 0.36, 0, 0.044, 0.18, 0, F.col(i % 2 ? 'paintCream' : 'paintRed'), 'metal');   /* the banded mast */
    F.rod(0, 1.85, 0, 0.25, 1.85, 0, 0.018, F.col('pipe'), 'metal');
    F.rod(0.25, 1.85, 0, 0.25, 1.73, 0, 0.008, F.col('pipe'), 'metal');
    F.frustum(0.25, 1.55, 0, 0.1, 0.05, 0.18, 0, F.col('brass'), 'bronze', 12);                     /* the bell */
    F.ball(0.25, 1.53, 0, 0.02, F.col('brass'), 'bronze');
    F.rod(0.25, 1.53, 0, 0.27, 1.0, 0.02, 0.006, F.col('canvasRaw'), 'rope');                        /* the pull */
    F.rod(0, 1.7, 0, -0.18, 1.7, 0, 0.018, F.col('pipe'), 'metal');
    F.box(-0.2, 1.52, 0, 0.14, 0.24, 0.14, 0, F.col('plateDark'), 'metal');                          /* the lamp box */
    F.box(-0.2, 1.62, 0.071, 0.09, 0.09, 0.006, 0, F.col('flame'), 'glow');                           /* the red-shuttered lamp and the green */
    F.box(-0.2, 1.54, 0.071, 0.09, 0.06, 0.006, 0, F.col('glowcap'), 'glow');
    F.box(-0.2, 1.58, 0.075, 0.11, 0.18, 0.004, 0, F.col('glass'), 'glass');
    F.box(-0.2, 1.76, 0, 0.16, 0.02, 0.16, 0, F.col('rivet'), 'metal');
  }
});
FURN({
  key: 'tungang_common_lantern_stand', name: 'Glow-cap lantern on a pipe stand', culture: 'tungang', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'living', 'workshop', 'kitchen', 'bedroom', 'library'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['metal', 'glass', 'emissive', 'food'], w: 0.5, d: 0.5, h: 1.7, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.22, 0, Math.sin(a) * 0.22, Math.cos(a) * 0.03, 1.0, Math.sin(a) * 0.03, 0.016, F.col('pipe'), 'metal'); }
    F.rod(0, 0.95, 0, 0, 1.66, 0, 0.02, F.col('pipe'), 'metal');
    F.rod(0, 1.64, 0, 0.15, 1.64, 0, 0.014, F.col('pipe'), 'metal');
    F.rod(0.15, 1.64, 0, 0.15, 1.45, 0, 0.006, F.col('pipe'), 'metal');
    F.blob(0.15, 1.24, 0, 0.06, 0.05, 0, F.col('fungusMat'), 'food');
    for (let i = 0; i < 4; i++) { const a = i * 1.6; F.ball(0.15 + Math.cos(a) * 0.035, 1.28 + (i % 2) * 0.05, Math.sin(a) * 0.035, 0.022, F.col(i % 2 ? 'glowcapBlue' : 'glowcap'), 'glow'); }
    F.cyl(0.15, 1.2, 0, 0.08, 0.22, 0, F.col('glass'), 'glass');
    F.cyl(0.15, 1.42, 0, 0.085, 0.03, 0, F.col('plateDark'), 'metal');
  }
});
FURN({
  key: 'tungang_common_box_bed', name: 'Box bed behind its curtain', culture: 'tungang', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'cloth'], w: 2.1, d: 1.1, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.53, 2.1, 1.6, 0.04, 0, F.col('plateDark'), 'metal');                                /* the back plate */
    for (const sx of [-1, 1]) F.box(sx * 1.03, 0, -0.03, 0.04, 1.6, 1.0, 0, F.col('plate'), 'metal');   /* the end plates */
    F.box(0, 1.55, -0.03, 2.1, 0.05, 1.0, 0, F.col('plate'), 'metal');                                 /* the roof plate */
    F.box(0, 0, -0.02, 2.0, 0.35, 1.0, 0, F.col('plate'), 'metal');
    for (let i = 0; i < 9; i++) F.ball(-0.9 + i * 0.225, 0.3, 0.48, 0.012, F.col('rivet'), 'metal');
    F.box(0, 0.35, -0.03, 1.94, 0.14, 0.92, 0, F.col('canvasRaw'), 'cloth');
    F.box(0.25, 0.49, -0.02, 1.36, 0.05, 0.94, 0, F.pick(['blanketRed', 'blanketGrey']), 'cloth');
    F.box(-0.72, 0.49, -0.12, 0.44, 0.12, 0.66, 0, F.col('seatWhite'), 'cloth');
    F.rod(-1.0, 1.5, 0.49, 1.0, 1.5, 0.49, 0.015, F.col('pipe'), 'metal');                             /* the curtain rod */
    F.box(-0.74, 0.4, 0.48, 0.5, 1.08, 0.03, 0, F.col('blanketBrown'), 'cloth');                       /* the curtain, drawn back */
    F.box(0.86, 0.4, 0.48, 0.26, 1.08, 0.03, 0, F.col('blanketBrown'), 'cloth');
  }
});
FURN({
  key: 'tungang_common_water_butt', name: 'Water butt with its tap', culture: 'tungang', tier: 'common', type: 'vessel', setting: 'indoor',
  rooms: ['kitchen', 'living', 'dormitory', 'store'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'bronze', 'ceramic'], w: 0.72, d: 0.72, h: 1.1, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.box(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, 0.12, 0.1, 0.12, a, F.col('plateDark'), 'metal'); }
    F.cyl(0, 0.1, 0, 0.3, 0.85, 0, F.col('plate'), 'metal');
    for (const y of [0.2, 0.5, 0.8]) F.cyl(0, y, 0, 0.306, 0.02, 0, F.col('rivet'), 'metal');
    F.cyl(0, 0.95, 0, 0.312, 0.03, 0, F.col('plateDark'), 'metal');                                    /* the lid */
    F.rod(0, 0.25, 0.29, 0, 0.25, 0.345, 0.015, F.col('brass'), 'bronze');                              /* the tap */
    F.rod(0, 0.25, 0.345, 0, 0.21, 0.345, 0.012, F.col('brass'), 'bronze');
    F.box(0, 0.28, 0.33, 0.06, 0.015, 0.015, 0, F.col('brass'), 'bronze');
    F.cyl(0.14, 0.98, 0.1, 0.045, 0.09, 0, F.col('enamelCream'), 'ceramic');                            /* the loj's mug */
    F.rod(-0.1, 0.98, -0.12, -0.1, 1.1, -0.12, 0.03, F.col('pipe'), 'metal');                          /* the feed from the drip line */
  }
});

/* ---------------------------------------------------------------- court: the loj hall */
FURN({
  key: 'tungang_court_book_lectern', name: "The Book's lectern", culture: 'tungang', tier: 'court', type: 'book', setting: 'indoor',
  rooms: ['hall', 'shrine', 'library', 'court'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['metal', 'cloth', 'hide', 'glass', 'emissive', 'food'], w: 0.8, d: 0.7, h: 1.5, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.6, 0.12, 0.5, 0, F.col('plateDark'), 'metal');
    F.cyl(0, 0.12, 0, 0.07, 0.92, 0, F.col('pipe'), 'metal');
    F.box(0, 0.25, 0.073, 0.2, 0.62, 0.01, 0, F.col('bannerRed'), 'cloth');                           /* the loj's red cloth on the column */
    F.beam(0, 1.02, 0.22, 0, 1.22, -0.18, 0.7, 0.04, F.col('plate'), 'metal');                        /* the sloped desk */
    F.beam(0, 1.045, 0.205, 0, 1.245, -0.195, 0.62, 0.02, F.col('leather'), 'leather');                /* the Book's boards */
    for (const sx of [-1, 1]) F.beam(sx * 0.15, 1.06, 0.19, sx * 0.15, 1.26, -0.2, 0.28, 0.03, F.col('paperBook'), 'cloth');   /* its open pages */
    F.box(0, 1.06, 0.2, 0.62, 0.03, 0.03, 0, F.col('plateDark'), 'metal');                             /* the ledge */
    F.rod(0.3, 1.08, 0.18, 0.07, 0.7, 0.0, 0.008, F.col('pipeBright'), 'metal');                       /* the chain */
    F.rod(0, 0.95, 0, -0.3, 1.25, 0, 0.012, F.col('pipe'), 'metal');                                  /* the reading lamp's arm */
    F.blob(-0.3, 1.28, 0, 0.05, 0.04, 0, F.col('fungusMat'), 'food');
    for (let i = 0; i < 3; i++) F.ball(-0.3 + (i - 1) * 0.03, 1.33 + (i % 2) * 0.04, 0.01, 0.02, F.col('glowcap'), 'glow');
    F.cyl(-0.3, 1.25, 0, 0.07, 0.2, 0, F.col('glass'), 'glass');
    F.cyl(-0.3, 1.45, 0, 0.075, 0.03, 0, F.col('plateDark'), 'metal');
  }
});
FURN({
  key: 'tungang_court_steward_desk', name: "The steward's desk", culture: 'tungang', tier: 'court', type: 'desk', setting: 'indoor',
  rooms: ['hall', 'study', 'court', 'antechamber'], anchor: 'floor', clearance: { front: 0.9, back: 0.8 },
  materials: ['metal', 'timber', 'hide', 'cloth', 'bronze', 'glass', 'emissive'], w: 1.6, d: 0.8, h: 1.0, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.box(sx * 0.58, 0, 0, 0.42, 0.74, 0.76, 0, F.col('plate'), 'metal');
      for (let k = 0; k < 3; k++) { F.box(sx * 0.58, 0.06 + k * 0.23, 0.381, 0.36, 0.2, 0.01, 0, F.col('plateDark'), 'metal');
        F.box(sx * 0.58, 0.17 + k * 0.23, 0.39, 0.1, 0.02, 0.012, 0, F.col('pipeBright'), 'metal'); } }
    F.box(0, 0.2, -0.36, 0.76, 0.54, 0.03, 0, F.col('plateDark'), 'metal');                           /* the modesty plate */
    F.box(0, 0.74, 0, 1.6, 0.05, 0.8, 0, F.col('timberDark'), 'wood');                                /* a top of carried timber */
    F.box(-0.45, 0.79, -0.05, 0.3, 0.1, 0.22, 0, F.col('leather'), 'leather');                         /* the minute books */
    F.box(-0.43, 0.89, -0.05, 0.28, 0.04, 0.2, 0, F.col('blanketBrown'), 'leather');
    F.box(-0.05, 0.79, 0.1, 0.44, 0.012, 0.3, 0, F.col('paperBook'), 'cloth');                        /* the day's minutes, open */
    F.rod(0.12, 0.8, 0.12, 0.2, 0.8, 0.2, 0.005, F.col('ink'), 'metal');                               /* a stylus */
    F.frustum(0.42, 0.79, 0.12, 0.06, 0.03, 0.09, 0, F.col('brass'), 'bronze', 12);                   /* the meeting's hand bell */
    F.rod(0.42, 0.88, 0.12, 0.42, 0.96, 0.12, 0.012, F.col('timberOld'), 'wood');
    F.box(0, 0.79, 0.34, 0.32, 0.06, 0.03, 0, F.col('brass'), 'bronze');                               /* STOORD, on a brass plate */
    F.cyl(0.62, 0.79, -0.25, 0.05, 0.14, 0, F.col('glass'), 'glass');
    F.ball(0.62, 0.84, -0.25, 0.03, F.col('glowcap'), 'glow');
    F.cyl(0.62, 0.93, -0.25, 0.055, 0.02, 0, F.col('plateDark'), 'metal');
  }
});
FURN({
  key: 'tungang_court_meeting_bench', name: "The meeting's bench", culture: 'tungang', tier: 'court', type: 'bench', setting: 'indoor',
  rooms: ['hall', 'court', 'lecture'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'metal'], w: 2.6, d: 0.6, h: 0.95, variants: 1,
  build: function (F) {
    F.box(0, 0.42, 0.03, 2.6, 0.06, 0.5, 0, F.col('paintRed'), 'wood');
    F.box(0, 0.58, -0.25, 2.6, 0.36, 0.04, 0, F.col('paintRed'), 'wood');
    for (let i = 0; i < 5; i++) F.box(-1.0 + i * 0.5, 0.66, -0.228, 0.16, 0.2, 0.004, 0, F.col('paintCream'), 'wood');   /* each seat's number */
    for (const x of [-1.15, 0, 1.15]) {
      F.rod(x, 0, 0.22, x, 0.42, 0.2, 0.022, F.col('pipe'), 'metal');
      F.rod(x, 0, -0.22, x, 0.95, -0.27, 0.022, F.col('pipe'), 'metal');
      F.rod(x, 0.14, -0.21, x, 0.14, 0.21, 0.018, F.col('pipe'), 'metal'); }
    F.rod(-1.15, 0.14, 0, 1.15, 0.14, 0, 0.018, F.col('pipe'), 'metal');
  }
});
FURN({
  key: 'tungang_court_president_chair', name: "The Tpresden's chair", culture: 'tungang', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['tg_loj', 'court'], anchor: 'floor', clearance: { front: 1.2 },
  materials: ['metal', 'cloth', 'bronze'], w: 1.3, d: 1.1, h: 1.55, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.3, 0.2, 1.1, 0, F.col('plateDark'), 'metal');                                    /* the dais of tread plate */
    for (let i = 0; i < 6; i++) F.box(-0.5 + i * 0.2, 0.2, 0.2, 0.12, 0.006, 0.5, 0.6, F.col('plate'), 'metal');
    F.box(0, 0.2, -0.02, 0.9, 0.25, 0.72, 0, F.col('plate'), 'metal');                                 /* a carriage seat from the Line */
    F.box(0, 0.45, 0.03, 0.82, 0.12, 0.66, 0, F.col('seatBlue'), 'cloth');
    F.beam(0, 0.5, -0.3, 0, 1.42, -0.4, 0.82, 0.14, F.col('seatBlue'), 'cloth');
    F.beam(0, 1.18, -0.335, 0, 1.4, -0.358, 0.6, 0.155, F.col('seatWhite'), 'cloth');                  /* the antimacassar */
    F.beam(0, 0.62, -0.215, 0, 1.18, -0.27, 0.36, 0.02, F.col('bannerRed'), 'cloth');                  /* the red runner down its back */
    for (const sx of [-1, 1]) { F.box(sx * 0.47, 0.45, 0, 0.08, 0.25, 0.6, 0, F.col('plate'), 'metal');
      F.box(sx * 0.47, 0.7, 0, 0.1, 0.04, 0.62, 0, F.col('rivet'), 'metal'); }
    F.box(0, 0.05, 0.551, 0.36, 0.1, 0.01, 0, F.col('brass'), 'bronze');                               /* TPRESDEN, on brass */
  }
});
FURN({
  key: 'tungang_court_banner', name: 'The loj banner', culture: 'tungang', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'shrine'], anchor: 'wall', clearance: { front: 0.4 },
  materials: ['cloth', 'timber', 'bronze', 'gold'], w: 1.4, d: 0.08, h: 2.0, variants: 2, variantNames: ['the wheel and lamp', 'the show of hands'],
  build: function (F) {
    const v = F.variant | 0;
    F.rod(-0.66, 1.95, 0, 0.66, 1.95, 0, 0.025, F.col('timberDark'), 'wood');
    for (const sx of [-1, 1]) F.ball(sx * 0.68, 1.95, 0, 0.03, F.col('brass'), 'bronze');
    F.box(0, 0.25, -0.012, 1.3, 1.68, 0.012, 0, F.col('bannerRed'), 'cloth');
    for (let i = 0; i < 13; i++) F.box(-0.6 + i * 0.1, 0.17, -0.012, 0.05, 0.09, 0.008, 0, F.col('brass'), 'gold');   /* the fringe */
    const red = F.css(F.col('bannerRed')), cream = F.css(F.col('paintCream')), rose = F.css(F.col('paintRose')), gold = F.css(F.col('brass'));
    F.decal(0, 0.4, 0.001, 1.14, 1.4, 0, 'tungang-banner-' + v, function (g, W, H) {
      const r = FK.paintRng(13 + v);
      g.fillStyle = red; g.fillRect(0, 0, W, H);
      g.strokeStyle = gold; g.lineWidth = W * 0.025; g.strokeRect(W * 0.04, H * 0.03, W * 0.92, H * 0.94);
      g.fillStyle = cream; g.font = 'bold ' + Math.round(H * 0.08) + 'px monospace'; g.textAlign = 'center';
      g.strokeStyle = cream; g.lineWidth = W * 0.03; g.lineCap = 'round';
      if (v === 0) {
        g.fillText('LOJ FOWER', W / 2, H * 0.16);
        const cx = W / 2, cy = H * 0.5, R = W * 0.3;                                 /* the wheel of the Line, its lamp in the hub */
        g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke(); }
        g.fillStyle = gold; g.beginPath(); g.arc(cx, cy, R * 0.28, 0, Math.PI * 2); g.fill();
        g.fillStyle = cream; g.fillText('T BUK', W / 2, H * 0.9);
      } else {
        g.fillText('T GREAT STRAK', W / 2, H * 0.16);
        for (let k = 0; k < 3; k++) { const cx = W * (0.28 + k * 0.22), base = H * (0.78 - (k === 1 ? 0.06 : 0));   /* hands raised at the meeting */
          g.fillRect(cx - W * 0.06, base - H * 0.2, W * 0.12, H * 0.2);
          for (let f = 0; f < 4; f++) g.fillRect(cx - W * 0.055 + f * W * 0.03, base - H * 0.33, W * 0.022, H * 0.14);
          g.fillRect(cx + W * 0.06, base - H * 0.2, W * 0.022, H * 0.08); }
        g.font = 'bold ' + Math.round(H * 0.045) + 'px monospace'; g.fillText('USL NOBGA TWAK WILSTOOD SEZ', W / 2, H * 0.9);
      }
      g.fillStyle = rose; for (let i = 0; i < 18; i++) g.fillRect(r() * W, r() * H, W * (0.01 + r() * 0.05), H * (0.005 + r() * 0.02));   /* worn to rust-pink */
    }, 'cloth');
  }
});
FURN({
  key: 'tungang_court_minute_chest', name: "The sekketri's minute chest", culture: 'tungang', tier: 'court', type: 'storage', setting: 'indoor',
  rooms: ['hall', 'study', 'library', 'store'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['metal', 'bronze'], w: 1.0, d: 0.55, h: 0.64, variants: 1,
  build: function (F) {
    F.box(0, 0.06, 0, 0.98, 0.48, 0.55, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.54, 0, 1.0, 0.08, 0.55, 0, F.col('plate'), 'metal');
    for (const x of [-0.36, 0, 0.36]) F.box(x, 0.06, 0.0, 0.06, 0.56, 0.56, 0, F.col('brass'), 'bronze');   /* the brass bands */
    for (const sx of [-1, 1]) F.box(sx * 0.42, 0, 0, 0.1, 0.06, 0.5, 0, F.col('rivet'), 'metal');
    F.box(0, 0.36, 0.285, 0.1, 0.12, 0.02, 0, F.col('brass'), 'bronze');                               /* the hasp and its lock */
    F.box(0, 0.26, 0.29, 0.08, 0.1, 0.03, 0, F.col('rivet'), 'metal');
    F.box(-0.18, 0.2, 0.278, 0.24, 0.1, 0.004, 0, F.col('paintCream'), 'metal');                      /* MINITS, stencilled */
  }
});
FURN({
  key: 'tungang_court_lift_gear', name: 'The lift gear, kept by rite', culture: 'tungang', tier: 'court', type: 'shrine', setting: 'indoor', role: 'lift_gear',
  rooms: ['shrine', 'hall', 'court'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['concrete', 'metal', 'cloth', 'glass', 'emissive', 'food'], w: 1.3, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.1, 0.3, 0.5, 0, F.col('concrete'), 'concrete');
    F.box(0, 0.3, -0.2, 0.14, 0.95, 0.1, 0, F.col('plateDark'), 'metal');                              /* the post the gear turns on */
    F.rod(0, 1.25, -0.2, 0, 1.25, 0.12, 0.06, F.col('pipeBright'), 'metal');                           /* the axle */
    const cy = 1.25, R = 0.5, ring = [];
    for (let i = 0; i <= 24; i++) { const a = i * F.TAU / 24; ring.push([Math.cos(a) * R, cy + Math.sin(a) * R, 0]); }
    F.tube(ring, 0.05, F.col('pipeBright'), 'metal');                                                    /* the rim, polished */
    for (let i = 0; i < 16; i++) { const a = i * F.TAU / 16, c = Math.cos(a), s = Math.sin(a);
      F.beam(c * 0.5, cy + s * 0.5, 0, c * 0.6, cy + s * 0.6, 0, 0.08, 0.09, F.col('pipeBright'), 'metal'); }   /* the teeth */
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6 + 0.3; F.rod(0, cy, 0, Math.cos(a) * 0.48, cy + Math.sin(a) * 0.48, 0, 0.03, F.col('pipe'), 'metal');
      F.box(Math.cos(a) * 0.3, cy + Math.sin(a) * 0.3 - 0.06, 0.035, 0.03, 0.12, 0.01, 0, F.col('bannerRed'), 'cloth'); }   /* the ribbons tied on */
    F.rod(0, cy, -0.04, 0, cy, 0.09, 0.11, F.col('plateDark'), 'metal');                                   /* the hub */
    for (const sx of [-1, 1]) { F.cyl(sx * 0.42, 0.3, 0.1, 0.06, 0.16, 0, F.col('glass'), 'glass');
      F.ball(sx * 0.42, 0.36, 0.1, 0.035, F.col('glowcap'), 'glow'); F.cyl(sx * 0.42, 0.46, 0.1, 0.065, 0.02, 0, F.col('plateDark'), 'metal'); }
    F.cyl(0, 0.3, 0.12, 0.12, 0.02, 0, F.col('plate'), 'metal');                                         /* an offering of caps */
    for (let i = 0; i < 4; i++) F.blob(-0.05 + i * 0.035, 0.34, 0.12 + (i % 2) * 0.03, 0.03, 0.03, 0, F.col('fungusPale'), 'food');
  }
});

/* ======================================================================
   The holds' furniture and fixtures (kits/tungang/PLAN.md sections 1.2, 3.2, 4; 2026-11-11). Every room of a hold,
   poor to court: the berth galleries and cuts, the households' sets, the carriage houses, the foreman's set, the
   platform's stalls, the loj hall and its count wall, the signal box, the doors, the lift head, the dark beds, the
   Fixers' shop, the wax house, the kiln, the bait and brew rooms, the cistern, the fan house, the bath, the leaper pens,
   the stoke room, the last stop, the crystal cleft, the vein working, the ore store, the refinery, the power hall, the
   shaft foot and head. The rule of salvage (PLAN.md 2.1): the Tungangs FIT salvage, bolted, pressed and riveted, the
   joints neat and painted, the part's old use still legible. Nothing carved; enamel cream and red chipped to black, red
   paint worn to rust-pink. Drawn at a human's measure: a hold draws them at 0.94 (core/furnish/scale/54-core-furnish-scale.js).
   THE LAMP CODE (PLAN.md 1.2): the coloured lamps mark the ways and the doors, the rooms are lit by wax light, so only
   the wax lamps here carry a light (F.lamp); the code's lamps are emissive glass, and their light is a record the set
   writes (kits/interiors/sets/tungang.js, `TGDRESS`).
   FIXTURES are pieces here as well (the door lamp, the berth plate, the enamel sign, the click-ribs, the count wall and
   its lamp row, the seal plate): the set places them at its doors and walls as data; their rooms list `doorway`, a kind
   no programme furnishes, where the placer must not put them.
   ====================================================================== */
const TGFURN_CODE = ['lampRed', 'lampGreen', 'lampAmber', 'glowcap', 'lampWhite'];
function TGFURN_rivets(F, x0, x1, y, z, n) {
  for (let i = 0; i < n; i++) F.ball(x0 + (x1 - x0) * i / Math.max(1, n - 1), y, z, 0.01, F.col('rivet'), 'metal');
}
function TGFURN_wax(F, x, y, z, s) {
  F.cyl(x, y, z, 0.035 * s, 0.03 * s, 0, F.col('plate'), 'metal');
  F.cyl(x, y + 0.03 * s, z, 0.03 * s, 0.035 * s, 0, F.col('wax'), 'food');
  F.ball(x, y + 0.075 * s, z, 0.012 * s, F.col('flame'), 'glow');
}

/* ---------------------------------------------------------------- fixtures: the ways and the doors */
FURN({
  key: 'tungang_common_door_lamp', name: 'Door lamp in the lamp code', culture: 'tungang', tier: 'common', type: 'lamp', setting: 'both', role: 'door_lamp',
  rooms: ['doorway'], anchor: 'wall', clearance: {}, surface: false,
  materials: ['metal', 'emissive'], w: 0.26, d: 0.24, h: 0.42, variants: 5,
  variantNames: ['red: a home', 'green: the Line', 'amber: work', 'glow-cap: a passage', 'white: danger, hooded'],
  build: function (F) {
    const v = F.variant | 0, lens = F.col(TGFURN_CODE[v] || 'lampRed');
    F.box(0, 0.2, -0.11, 0.12, 0.22, 0.02, 0, F.col('plateDark'), 'metal');                          /* the wall plate */
    TGFURN_rivets(F, -0.04, 0.04, 0.39, -0.098, 2);
    F.rod(0, 0.36, -0.1, 0, 0.36, -0.02, 0.012, F.col('pipe'), 'metal');                              /* the arm */
    F.box(0, 0.04, -0.02, 0.18, 0.26, 0.16, 0, F.col('hood'), 'metal');                             /* a dead Ancient fitting for a box */
    F.box(0, 0.3, -0.02, 0.22, 0.03, 0.2, 0, F.col('plateDark'), 'metal');                          /* its drip cap */
    F.box(0, 0.07, 0.061, 0.13, 0.17, 0.006, 0, lens, 'glow');                                       /* the lens: a signal glass */
    for (const sx of [-1, 1]) F.box(sx * 0.091, 0.07, -0.02, 0.006, 0.17, 0.1, 0, lens, 'glow');
    F.box(0, 0, -0.02, 0.1, 0.04, 0.1, 0, F.col('rivet'), 'metal');
    if (v === 4) F.box(0, 0.13, 0.072, 0.16, 0.12, 0.012, 0, F.col('hood'), 'metal');                /* the hood, dropped at once */
  }
});
FURN({
  key: 'tungang_poor_berth_plate', name: 'Berth number plate', culture: 'tungang', tier: 'poor', type: 'art', setting: 'both', role: 'berth_plate',
  rooms: ['doorway'], anchor: 'wall', clearance: {},
  materials: ['ceramic', 'metal'], w: 0.3, d: 0.03, h: 0.22, variants: 3, variantNames: ['cream on red', 'red on cream', 'cream on green'],
  build: function (F) {
    const v = F.variant | 0, n = ((F.seed - 1) % 99 + 99) % 99 + 1;                                 /* the seed is the berth's number */
    const bg = F.css(F.col(['enamelRed', 'enamelCream', 'enamelGreen'][v])), fg = F.css(F.col(v === 1 ? 'enamelRed' : 'enamelCream')), chip = F.css(F.col('enamelChip'));
    F.box(0, 0, -0.008, 0.3, 0.22, 0.014, 0, F.col('enamelChip'), 'ceramic');
    F.decal(0, 0.01, 0.005, 0.28, 0.2, 0, 'tungang-berth-' + v + '-' + n, function (g, W, H) {
      const r = FK.paintRng(n * 7 + v);
      g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.strokeStyle = fg; g.lineWidth = W * 0.03; g.strokeRect(W * 0.05, H * 0.07, W * 0.9, H * 0.86);
      g.fillStyle = fg; g.font = 'bold ' + Math.round(H * 0.62) + 'px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), W / 2, H * 0.54);
      g.fillStyle = chip; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(r() * W, r() < 0.5 ? r() * H * 0.2 : H - r() * H * 0.2, W * (0.01 + r() * 0.03), 0, Math.PI * 2); g.fill(); }
    }, 'ceramic');
    for (const sx of [-1, 1]) F.ball(sx * 0.125, 0.11, 0.004, 0.009, F.col('rivet'), 'metal');
  }
});
FURN({
  key: 'tungang_common_enamel_sign', name: 'Enamel sign', culture: 'tungang', tier: 'common', type: 'art', setting: 'both', role: 'sign',
  rooms: ['doorway', 'hall', 'antechamber', 'tg_platform', 'tg_loj', 'tg_guard'], anchor: 'wall', clearance: {},
  materials: ['ceramic', 'metal'], w: 0.9, d: 0.03, h: 0.45, variants: 4,
  variantNames: ['the way: a number and an arrow', 'the lamp code', 'STOP: the white lamp', 'NO SKABS'],
  build: function (F) {
    const v = F.variant | 0;
    const C = function (k) { return F.css(F.col(k)); };
    F.box(0, 0, -0.008, 0.9, 0.45, 0.014, 0, F.col('enamelChip'), 'ceramic');
    F.decal(0, 0.012, 0.005, 0.87, 0.425, 0, 'tungang-sign-' + v, function (g, W, H) {
      const r = FK.paintRng(61 + v);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (v === 0) {
        g.fillStyle = C('enamelGreen'); g.fillRect(0, 0, W, H);
        g.fillStyle = C('enamelCream'); g.font = 'bold ' + Math.round(H * 0.42) + 'px monospace'; g.fillText('LOJ 20', W * 0.38, H * 0.52);
        g.beginPath(); g.moveTo(W * 0.72, H * 0.3); g.lineTo(W * 0.92, H * 0.5); g.lineTo(W * 0.72, H * 0.7); g.closePath(); g.fill(); g.fillRect(W * 0.66, H * 0.43, W * 0.08, H * 0.14);
      } else if (v === 1) {
        g.fillStyle = C('enamelCream'); g.fillRect(0, 0, W, H);
        const ks = ['lampRed', 'lampGreen', 'lampAmber', 'glowcap', 'lampWhite'], ws = ['HOEM', 'LAIN', 'WURK', 'PASIJ', 'STOP'];
        g.font = 'bold ' + Math.round(H * 0.13) + 'px monospace';
        for (let i = 0; i < 5; i++) { const x = W * (0.1 + i * 0.2);
          g.fillStyle = C('enamelChip'); g.beginPath(); g.arc(x, H * 0.4, H * 0.17, 0, Math.PI * 2); g.fill();
          g.fillStyle = C(ks[i]); g.beginPath(); g.arc(x, H * 0.4, H * 0.13, 0, Math.PI * 2); g.fill();
          g.fillStyle = C('enamelChip'); g.fillText(ws[i], x, H * 0.78); }
      } else {
        g.fillStyle = C('enamelCream'); g.fillRect(0, 0, W, H);
        g.fillStyle = C('enamelRed'); g.fillRect(W * 0.04, H * 0.08, W * 0.92, H * 0.84);
        g.fillStyle = C('enamelCream'); g.font = 'bold ' + Math.round(H * (v === 2 ? 0.5 : 0.36)) + 'px monospace'; g.fillText(v === 2 ? 'STOP' : 'NO SKABS', W / 2, H * 0.53);
      }
      g.fillStyle = C('enamelChip'); for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(r() * W, r() * H, W * (0.006 + r() * 0.02), 0, Math.PI * 2); g.fill(); }
    }, 'ceramic');
    for (const sx of [-1, 1]) F.ball(sx * 0.41, 0.225, 0.004, 0.012, F.col('rivet'), 'metal');
  }
});
FURN({
  key: 'tungang_common_click_ribs', name: 'Click-ribs: a door\'s sound mark', culture: 'tungang', tier: 'common', type: 'art', setting: 'both', role: 'click_ribs',
  rooms: ['doorway', 'antechamber', 'tg_platform', 'tg_guard'], anchor: 'wall', clearance: {},
  materials: ['metal', 'bronze'], w: 1.2, d: 0.1, h: 2.2, variants: 2, variantNames: ['hanging plates', 'a grooved panel'],
  build: function (F) {
    if ((F.variant | 0) === 0) {
      for (const sx of [-1, 1]) F.box(sx * 0.56, 0, -0.045, 0.06, 2.2, 0.01, 0, F.col('plateDark'), 'metal');   /* the wall strips */
      F.rod(-0.56, 2.08, -0.03, 0.56, 2.08, -0.03, 0.02, F.col('pipe'), 'metal');                           /* the rail */
      for (let i = 0; i < 9; i++) { const x = -0.44 + i * 0.11, L = 0.6 + ((i * 5) % 7) * 0.13;        /* plates of different lengths: each rings its own note */
        F.rod(x, 2.08, -0.02, x, 2.0, -0.02, 0.004, F.col('pipeBright'), 'metal');
        F.box(x, 2.0 - L, -0.02, 0.08, L, 0.008, 0, F.col(i % 3 === 1 ? 'brass' : 'plate'), i % 3 === 1 ? 'bronze' : 'metal'); }
    } else {
      F.box(0, 0.1, -0.035, 1.2, 2.0, 0.03, 0, F.col('plate'), 'metal');
      for (let i = 0; i < 16; i++) { const y = 0.2 + i * 0.12, deep = i % 4 === 3;                      /* ribs, every fourth one deeper: the door's own pattern */
        F.box(0, y, deep ? 0.0 : -0.01, 1.14, 0.035, deep ? 0.07 : 0.04, 0, F.col(deep ? 'plateDark' : 'pipeBright'), 'metal'); }
      TGFURN_rivets(F, -0.55, 0.55, 2.06, -0.018, 8); TGFURN_rivets(F, -0.55, 0.55, 0.14, -0.018, 8);
    }
  }
});
FURN({
  key: 'tungang_court_count_wall', name: 'The count wall', culture: 'tungang', tier: 'court', type: 'art', setting: 'indoor', role: 'count_wall',
  rooms: ['doorway', 'tg_loj'], anchor: 'wall', clearance: {},
  materials: ['plaster', 'metal'], w: 5.0, d: 0.1, h: 3.0, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.04, 5.0, 3.0, 0.02, 0, F.col('plateDark'), 'metal');                                  /* the plate it is skimmed on */
    F.box(0, 0.05, -0.02, 4.9, 2.9, 0.03, 0, F.col('plasterWhite'), 'plaster');                         /* the white plaster, renewed every year */
    const rule = F.css(F.col('plasterRule')), ink = F.css(F.col('ink'));
    F.decal(0, 0.08, 0.011, 4.84, 2.84, 0, 'tungang-count-wall', function (g, W, H) {
      g.fillStyle = F.css(F.col('plasterWhite')); g.fillRect(0, 0, W, H);
      g.strokeStyle = rule; g.lineWidth = Math.max(1, W * 0.002);
      const nx = 20, ny = 12;
      for (let i = 0; i <= nx; i++) { g.beginPath(); g.moveTo(W * i / nx, H * 0.08); g.lineTo(W * i / nx, H); g.stroke(); }
      for (let j = 0; j <= ny; j++) { const y = H * 0.08 + (H * 0.92) * j / ny; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = ink; g.font = Math.round(H * 0.045) + 'px monospace'; g.textAlign = 'center';
      for (let i = 0; i < nx; i++) g.fillText(String(i + 1), W * (i + 0.5) / nx, H * 0.06);                 /* the columns the sekketri counts by */
    }, 'plaster');
    F.box(0, 2.94, -0.02, 5.0, 0.06, 0.07, 0, F.col('plate'), 'metal');                                  /* the plate frame */
    for (const sx of [-1, 1]) F.box(sx * 2.48, 0, -0.02, 0.04, 3.0, 0.07, 0, F.col('plate'), 'metal');
  }
});
FURN({
  key: 'tungang_common_count_lamps', name: 'The count lamps: the low row behind the benches', culture: 'tungang', tier: 'common', type: 'lamp', setting: 'indoor', role: 'count_lamps',
  rooms: ['doorway', 'tg_loj'], anchor: 'floor', clearance: {}, surface: false,
  materials: ['metal', 'food', 'emissive'], w: 4.0, d: 0.3, h: 0.4, variants: 1,
  build: function (F) {
    for (const x of [-1.8, -0.6, 0.6, 1.8]) F.box(x, 0, 0, 0.06, 0.12, 0.24, 0, F.col('plateDark'), 'metal');   /* the feet */
    F.box(0, 0.12, 0, 4.0, 0.04, 0.28, 0, F.col('plateDark'), 'metal');                                  /* a trough of Ancient cable tray */
    F.box(0, 0.16, -0.12, 4.0, 0.2, 0.03, 0, F.col('plate'), 'metal');                                   /* the back plate */
    for (let i = 0; i < 9; i++) { const x = -1.76 + i * 0.44;
      TGFURN_wax(F, x, 0.16, 0.02, 1.4);
      F.beam(x, 0.36, -0.1, x, 0.34, 0.06, 0.2, 0.012, F.col('hood'), 'metal'); }                        /* the hoods throw it forward, onto the wall */
    F.lamp(-1.0, 0.28, 0.2, 0.7, 8); F.lamp(1.0, 0.28, 0.2, 0.7, 8);
  }
});
FURN({
  key: 'tungang_court_enamel_minutes', name: 'A wall of enamel minutes', culture: 'tungang', tier: 'court', type: 'art', setting: 'indoor', role: 'minutes',
  rooms: ['tg_loj', 'hall', 'study', 'library', 'tg_signal'], anchor: 'wall', clearance: {},
  materials: ['ceramic', 'metal'], w: 2.4, d: 0.05, h: 1.8, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.02, 2.4, 1.8, 0.01, 0, F.col('plateDark'), 'metal');
    const C = function (k) { return F.css(F.col(k)); };
    F.decal(0, 0.04, -0.006, 2.34, 1.72, 0, 'tungang-enamel-minutes', function (g, W, H) {          /* each plate a meeting, scratched when paper ran short */
      const r = FK.paintRng(83), pw = W / 7, ph = H / 5;
      g.fillStyle = C('plateDark'); g.fillRect(0, 0, W, H); g.lineWidth = Math.max(1, W * 0.0015);
      for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) {
        const x0 = i * pw + pw * 0.05, y0 = j * ph + ph * 0.06, old = j > 2;
        g.fillStyle = C(old ? 'paintCream' : 'enamelCream'); g.fillRect(x0, y0, pw * 0.9, ph * 0.88);
        g.fillStyle = C('enamelRed'); g.fillRect(x0 + pw * 0.08, y0 + ph * 0.06, pw * 0.74, ph * 0.07);
        g.strokeStyle = C('enamelChip');
        for (let l = 0; l < 7; l++) { const y = y0 + ph * (0.24 + l * 0.09), x1 = x0 + pw * (0.4 + r() * 0.42);
          g.beginPath(); g.moveTo(x0 + pw * 0.08, y); for (let x = x0 + pw * 0.08; x < x1; x += pw * 0.04) g.lineTo(x, y + (r() - 0.5) * ph * 0.03); g.stroke(); }
        g.fillStyle = C('enamelChip'); for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(x0 + r() * pw * 0.9, y0 + (r() < 0.5 ? 0.02 : 0.86) * ph, pw * (0.02 + r() * 0.04), 0, Math.PI * 2); g.fill(); } }
    }, 'ceramic');
  }
});
FURN({
  key: 'tungang_poor_seal_plate', name: 'A seal at the last stop', culture: 'tungang', tier: 'poor', type: 'art', setting: 'indoor', role: 'seal',
  rooms: ['doorway', 'tg_last'], anchor: 'wall', clearance: {},
  materials: ['emissive', 'metal', 'rustSteel', 'food'], w: 1.0, d: 0.12, h: 1.3, variants: 2, variantNames: ['newly sealed', 'old'],
  build: function (F) {
    const old = (F.variant | 0) === 1, n = ((F.seed - 1) % 99 + 99) % 99 + 1;
    F.box(0, 0, -0.05, 1.0, 1.1, 0.02, 0, F.col(old ? 'rust' : 'plate'), old ? 'rust' : 'metal');        /* the plate bolted over the niche */
    for (let i = 0; i < 6; i++) for (const y of [0.05, 1.05]) F.ball(-0.42 + i * 0.168, y, -0.035, 0.014, F.col('rivet'), 'metal');
    const fg = F.css(F.col(old ? 'paintRose' : 'paintCream')), bg = F.css(F.col(old ? 'rust' : 'plate'));
    F.decal(0, 0.3, -0.033, 0.6, 0.5, 0, 'tungang-seal-' + (old ? 1 : 0) + '-' + n, function (g, W, H) {
      g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = 'bold ' + Math.round(H * 0.55) + 'px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(n), W / 2, H * 0.5);
    }, 'metal');
    F.box(0, 1.1, -0.02, 0.6, 0.03, 0.08, 0, F.col('plateDark'), 'metal');                               /* the lamp ledge over it */
    F.box(0, 1.13, 0.0, 0.5, 0.012, 0.05, 0, F.col('waxDark'), 'food');                                  /* wax run from lamps burned down */
    if (!old) TGFURN_wax(F, 0.1, 1.13, 0.0, 1.2);
  }
});

/* ---------------------------------------------------------------- the galleries, the cuts and the sets */
FURN({
  key: 'tungang_poor_bait_locker', name: 'Bait locker: the gallery\'s mesh cupboard', culture: 'tungang', tier: 'poor', type: 'storage', setting: 'indoor', role: 'larder',
  rooms: ['dormitory', 'barracks', 'kitchen', 'living', 'store', 'tg_berth', 'tg_cut', 'tg_guard'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['metal', 'food'], w: 0.9, d: 0.35, h: 1.3, variants: 1,
  build: function (F) {
    F.box(0, 0.25, -0.16, 0.9, 1.05, 0.02, 0, F.col('plateDark'), 'metal');
    for (const sx of [-1, 1]) F.box(sx * 0.44, 0.25, -0.01, 0.02, 1.05, 0.32, 0, F.col('plate'), 'metal');
    F.box(0, 1.28, -0.01, 0.9, 0.02, 0.32, 0, F.col('plate'), 'metal');
    for (const sx of [-1, 1]) F.rod(sx * 0.42, 0, 0.13, sx * 0.42, 0.26, 0.13, 0.016, F.col('pipe'), 'metal');   /* legs: the fin-mice cannot climb plate */
    for (let s = 0; s < 3; s++) { const y = 0.26 + s * 0.34;
      F.box(0, y, -0.01, 0.86, 0.02, 0.3, 0, F.col('plate'), 'metal');
      for (let i = 0; i < 5; i++) { const x = -0.33 + i * 0.165;                                          /* the bait tins, each with its berth number */
        F.box(x, y + 0.02, -0.02, 0.15, 0.09, 0.22, 0, F.col(i % 2 ? 'plate' : 'enamelRed'), 'metal');
        F.box(x, y + 0.04, 0.091, 0.06, 0.04, 0.003, 0, F.col('paintCream'), 'metal'); } }
    for (let i = 0; i < 7; i++) F.box(0, 0.3 + i * 0.15, 0.15, 0.86, 0.006, 0.006, 0, F.col('pipeBright'), 'metal');   /* the mesh door */
    for (let i = 0; i < 6; i++) F.box(-0.36 + i * 0.144, 0.27, 0.15, 0.006, 1.0, 0.006, 0, F.col('pipeBright'), 'metal');
  }
});
FURN({
  key: 'tungang_common_mash_bin', name: 'Mash bin', culture: 'tungang', tier: 'common', type: 'storage', setting: 'indoor', role: 'bin',
  rooms: ['kitchen', 'living', 'store', 'tg_cut', 'tg_berth', 'tg_carriage', 'tg_bait'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'food'], w: 0.9, d: 0.6, h: 0.82, variants: 1,
  build: function (F) {
    F.box(0, 0.06, 0, 0.86, 0.6, 0.56, 0, F.col('plate'), 'metal');
    F.box(0, 0, 0, 0.8, 0.06, 0.5, 0, F.col('plateDark'), 'metal');
    F.beam(0, 0.66, 0.28, 0, 0.78, -0.28, 0.9, 0.03, F.col('enamelRed'), 'metal');                     /* the sloped lid, red, worn */
    F.beam(0, 0.67, 0.29, 0, 0.7, 0.18, 0.9, 0.032, F.col('paintRose'), 'metal');
    TGFURN_rivets(F, -0.4, 0.4, 0.1, 0.285, 6); TGFURN_rivets(F, -0.4, 0.4, 0.6, 0.285, 6);
    F.box(0, 0.3, 0.282, 0.26, 0.12, 0.004, 0, F.col('paintCream'), 'metal');                           /* MASH, stencilled */
    F.rod(0.3, 0.68, 0.32, 0.38, 0.6, 0.29, 0.012, F.col('pipe'), 'metal');                              /* the scoop on its hook */
  }
});
FURN({
  key: 'tungang_common_plate_shelves', name: 'Plate shelves', culture: 'tungang', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'living', 'store', 'workshop', 'study', 'library', 'tg_bait', 'tg_brew', 'tg_signal', 'tg_wax', 'tg_refinery', 'tg_ore'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['metal', 'ceramic', 'food', 'rope'], w: 1.2, d: 0.4, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.57, 0, sz * 0.18, sx * 0.57, 1.8, sz * 0.18, 0.018, F.col('pipe'), 'metal');
    for (let s = 0; s < 4; s++) { const y = 0.12 + s * 0.48;
      F.box(0, y, 0, 1.18, 0.03, 0.38, 0, F.col('plate'), 'metal');                                       /* trough covers from the Line */
      for (let i = 0; i < 5; i++) { const x = -0.45 + i * 0.22 + F.rr(-0.03, 0.03), k = (i + s) % 4;
        if (k === 0) { F.cyl(x, y + 0.03, 0, 0.06, 0.16, 0, F.col('plate'), 'metal'); F.cyl(x, y + 0.19, 0, 0.062, 0.015, 0, F.col('plateDark'), 'metal'); }
        else if (k === 1) F.box(x, y + 0.03, 0, 0.16, 0.1, 0.24, 0, F.col('enamelRed'), 'metal');
        else if (k === 2) { F.cyl(x, y + 0.03, 0, 0.045, 0.1, 0, F.col('enamelCream'), 'ceramic'); F.cyl(x, y + 0.125, 0, 0.047, 0.01, 0, F.col('enamelChip'), 'ceramic'); }
        else F.blob(x, y + 0.03, 0, 0.07, 0.06, 0, F.col('fungusPale'), 'food'); } }
    const coil = []; for (let i = 0; i <= 14; i++) { const a = i * F.TAU / 14; coil.push([0.36 + Math.cos(a) * 0.12, 1.62, Math.sin(a) * 0.12]); }
    F.tube(coil, 0.02, F.col('rustDeep'), 'rope');
  }
});
FURN({
  key: 'tungang_common_carriage_seats', name: 'Carriage seat, kept', culture: 'tungang', tier: 'common', type: 'seating', setting: 'indoor',
  rooms: ['living', 'hall', 'tg_carriage', 'tg_platform', 'tg_brew', 'antechamber'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'cloth'], w: 1.3, d: 0.7, h: 1.15, variants: 2, variantNames: ['blue', 'blue, patched in blanket'],
  build: function (F) {
    const patched = (F.variant | 0) === 1;
    F.box(0, 0, -0.02, 1.2, 0.36, 0.56, 0, F.col('plate'), 'metal');                                     /* the plate box the Line built it on */
    F.box(0, 0.36, 0.03, 1.22, 0.12, 0.6, 0, F.col('seatBlue'), 'cloth');
    F.beam(0, 0.46, -0.27, 0, 1.12, -0.33, 1.22, 0.12, F.col('seatBlue'), 'cloth');
    F.beam(0, 0.9, -0.31, 0, 1.12, -0.333, 1.0, 0.125, F.col('seatWhite'), 'cloth');                    /* the antimacassars */
    for (const sx of [-1, 1]) F.box(sx * 0.62, 0.36, 0, 0.06, 0.24, 0.56, 0, F.col('plateDark'), 'metal');
    F.rod(-0.6, 1.12, -0.33, 0.6, 1.12, -0.33, 0.02, F.col('pipeBright'), 'metal');                      /* the grab rail */
    if (patched) F.box(0.25, 0.48, 0.0, 0.42, 0.012, 0.36, 0, F.col('blanketRed'), 'cloth');
    F.box(0, 0.1, 0.264, 0.2, 0.08, 0.004, 0, F.col('paintCream'), 'metal');                             /* the seat's number, from the carriage */
  }
});
FURN({
  key: 'tungang_common_carriage_galley', name: 'Carriage galley', culture: 'tungang', tier: 'common', type: 'stove', setting: 'indoor', role: 'hearth',
  rooms: ['tg_carriage'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'rustSteel', 'cloth', 'emissive', 'ceramic', 'timber'], w: 1.4, d: 0.7, h: 1.0, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) {                                                                          /* the bay's two seat ends, kept */
      F.box(sx * 0.6, 0, -0.04, 0.2, 0.5, 0.6, 0, F.col('plate'), 'metal');
      F.box(sx * 0.6, 0.5, -0.04, 0.2, 0.46, 0.6, 0, F.col('seatBlue'), 'cloth'); }
    F.box(0, 0, -0.06, 0.96, 0.72, 0.56, 0, F.col('rust'), 'rust');                                      /* a box stove of plate between them */
    F.box(0, 0.72, -0.06, 1.0, 0.03, 0.6, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.18, 0.226, 0.34, 0.26, 0.01, 0, F.col('rustDeep'), 'rust');
    for (let i = 0; i < 3; i++) F.box(0, 0.22 + i * 0.06, 0.233, 0.22, 0.02, 0.006, 0, F.col('flame'), 'glow');
    F.frustum(-0.22, 0.75, -0.05, 0.11, 0.09, 0.14, 0, F.col('enamelCream'), 'ceramic', 12);           /* the pot */
    F.cyl(0.24, 0.75, -0.02, 0.12, 0.02, 0, F.col('plate'), 'metal');
    F.rod(0.3, 0.6, -0.27, 0.3, 0.92, -0.27, 0.05, F.col('plateDark'), 'metal');                         /* the flue, out through a plated window */
    F.rod(0.3, 0.92, -0.27, 0.3, 0.92, -0.3, 0.05, F.col('plateDark'), 'metal');
    F.box(0, 0.73, 0.2, 0.7, 0.02, 0.1, 0, F.col('timberOld'), 'wood');                                  /* the rail the cloths dry on */
    F.box(-0.1, 0.55, 0.255, 0.18, 0.18, 0.006, 0, F.col('blanketGrey'), 'cloth');
  }
});
FURN({
  key: 'tungang_court_lamp_shrine', name: 'The turn lamps: a lamp for every one on shift', culture: 'tungang', tier: 'court', type: 'shrine', setting: 'indoor', role: 'lamp_shrine',
  rooms: ['shrine', 'living', 'hall', 'tg_loj', 'tg_last'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'cloth', 'food', 'emissive', 'ceramic'], w: 1.2, d: 0.42, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.2, 1.2, 1.6, 0.02, 0, F.col('plateDark'), 'metal');
    for (let s = 0; s < 3; s++) { const y = 0.5 + s * 0.34, dz = 0.18 - s * 0.06;                       /* stepped shelves */
      F.box(0, y, -0.2 + dz / 2 + 0.01, 1.16, 0.03, dz + 0.02, 0, F.col('plate'), 'metal');
      F.box(0, y - 0.04, -0.2 + dz + 0.02, 1.16, 0.04, 0.008, 0, F.col('bannerRed'), 'cloth');
      const n = 7 - s; for (let i = 0; i < n; i++) { const x = -0.48 + i * (0.96 / (n - 1)), lit = (i * 3 + s) % 5 !== 0;
        if (lit) TGFURN_wax(F, x, y + 0.03, -0.2 + dz / 2 + 0.01, 1);
        else F.cyl(x, y + 0.03, -0.2 + dz / 2 + 0.01, 0.035, 0.03, 0, F.col('plate'), 'metal');           /* put out: home, or gone off shift */
        F.box(x, y - 0.03, -0.2 + dz + 0.03, 0.05, 0.03, 0.004, 0, F.col('paintCream'), 'ceramic'); } }
    F.box(0, 0, -0.12, 1.1, 0.48, 0.16, 0, F.col('plate'), 'metal');                                      /* the box of spare wax */
    F.box(0, 0.2, -0.039, 0.3, 0.12, 0.004, 0, F.col('enamelRed'), 'ceramic');
    F.lamp(0, 1.0, 0.1, 0.5, 6);
  }
});
FURN({
  key: 'tungang_court_sign_floor', name: 'A floor of enamel signs', culture: 'tungang', tier: 'court', type: 'rug', setting: 'indoor',
  rooms: ['living', 'hall', 'antechamber', 'study', 'tg_loj', 'tg_signal'], anchor: 'floor', clearance: {},
  materials: ['ceramic'], w: 2.4, d: 1.6, h: 0.02, variants: 1,
  build: function (F) {
    const ks = ['enamelCream', 'enamelRed', 'enamelGreen', 'enamelCream', 'enamelBlue', 'paintCream'];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {                                            /* signs laid face up, a foreman's pride */
      const x = -1.0 + i * 0.4, z = -0.6 + j * 0.4, k = ks[(i * 5 + j * 3) % ks.length];
      F.box(x, 0, z, 0.38, 0.012, 0.38, 0, F.col(k), 'ceramic');
      F.box(x + F.rr(-0.1, 0.1), 0.012, z + F.rr(-0.1, 0.1), F.rr(0.03, 0.08), 0.004, F.rr(0.02, 0.06), 0, F.col('enamelChip'), 'ceramic');
      if ((i + j) % 3 === 0) F.box(x, 0.012, z, 0.22, 0.004, 0.05, 0, F.col(k === 'enamelCream' ? 'enamelRed' : 'enamelCream'), 'ceramic'); }
  }
});

/* ---------------------------------------------------------------- the loj: the meeting, the bell, the band, the platform */
FURN({
  key: 'tungang_court_turn_bell', name: 'The turn bell', culture: 'tungang', tier: 'court', type: 'art', setting: 'indoor', role: 'turn_bell',
  rooms: ['hall', 'tg_loj', 'tg_platform', 'tg_signal', 'tg_guard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['ceramic', 'metal', 'bronze', 'rope', 'cloth'], w: 0.8, d: 0.8, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.78, 0.12, 0.78, 0, F.col('plateDark'), 'metal');                                    /* the plinth of tread plate */
    for (let i = 0; i < 3; i++) F.box(0, 0.12, -0.26 + i * 0.26, 0.7, 0.006, 0.2, 0, F.col(['enamelRed', 'enamelGreen', 'lampAmber'][i]), 'ceramic');   /* the three turns, painted */
    for (const sx of [-1, 1]) { F.rod(sx * 0.34, 0.12, -0.3, sx * 0.08, 1.56, 0, 0.03, F.col('pipe'), 'metal');
      F.rod(sx * 0.34, 0.12, 0.3, sx * 0.08, 1.56, 0, 0.03, F.col('pipe'), 'metal'); }
    F.rod(-0.12, 1.56, 0, 0.12, 1.56, 0, 0.035, F.col('pipeBright'), 'metal');
    F.frustum(0, 1.02, 0, 0.26, 0.14, 0.46, 0, F.col('brass'), 'bronze', 16);                           /* an Ancient signal bell, polished */
    F.cyl(0, 1.48, 0, 0.06, 0.06, 0, F.col('brass'), 'bronze');
    F.rod(0, 1.48, 0, 0.0, 1.06, 0, 0.012, F.col('rivet'), 'metal'); F.ball(0, 1.06, 0, 0.04, F.col('rivet'), 'metal');
    F.rod(0.0, 1.06, 0, 0.3, 0.5, 0.25, 0.008, F.col('canvasRaw'), 'rope');                              /* the pull */
    F.box(0.29, 0.38, 0.24, 0.04, 0.12, 0.04, 0, F.col('bannerRed'), 'cloth');
  }
});
FURN({
  key: 'tungang_common_pipe_band', name: 'The pipe band\'s pipes on their stand', culture: 'tungang', tier: 'common', type: 'art', setting: 'indoor', role: 'band',
  rooms: ['hall', 'tg_loj', 'tg_platform', 'tg_brew', 'living'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'cloth', 'bronze', 'timber'], w: 1.0, d: 0.4, h: 1.2, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.rod(sx * 0.46, 0, -0.16, sx * 0.46, 1.0, -0.16, 0.016, F.col('pipe'), 'metal');
      F.rod(sx * 0.46, 0, 0.16, sx * 0.46, 0.5, 0.16, 0.016, F.col('pipe'), 'metal'); }
    F.rod(-0.46, 0.95, -0.16, 0.46, 0.95, -0.16, 0.016, F.col('pipe'), 'metal');
    F.box(0, 0.45, 0.0, 0.96, 0.04, 0.36, 0, F.col('plate'), 'metal');                                   /* the rest the pipes' feet stand in */
    for (let i = 0; i < 6; i++) { const x = -0.38 + i * 0.15, L = 0.4 + (i % 3) * 0.15, stalk = i % 2 === 0;   /* pipes cut from dead stalks and salvaged tube */
      F.rod(x, 0.49, 0.02, x, 0.49 + L, -0.14, stalk ? 0.022 : 0.018, F.col(stalk ? 'fungusPale' : 'pipeBright'), stalk ? 'wood' : 'metal');
      F.cyl(x, 0.49, 0.02, stalk ? 0.03 : 0.025, 0.05, 0, F.col('brass'), 'bronze'); }
    F.cyl(0, 0, 0.0, 0.18, 0.3, 0, F.col('enamelRed'), 'metal');                                         /* the band's drum, an Ancient canister */
    F.cyl(0, 0.3, 0.0, 0.185, 0.015, 0, F.col('canvasRaw'), 'cloth');
    F.box(0.3, 0.98, -0.16, 0.24, 0.12, 0.01, 0, F.col('bannerRed'), 'cloth');                          /* the band's pennant */
  }
});
FURN({
  key: 'tungang_common_platform_stall', name: 'Platform stall', culture: 'tungang', tier: 'common', type: 'stall', setting: 'both', role: 'kiosk',
  rooms: ['market', 'shop', 'tg_platform'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['bronze', 'metal', 'cloth', 'ceramic', 'food', 'timber', 'emissive', 'glass'], w: 2.0, d: 1.3, h: 2.3, variants: 2, variantNames: ['bait and wax', 'brew and mugs'],
  build: function (F) {
    const v = F.variant | 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.95, 0, sz * 0.6, sx * 0.95, 2.1, sz * 0.6, 0.025, F.col('pipe'), 'metal');
    F.box(0, 0, 0.5, 1.9, 0.95, 0.06, 0, F.col('plate'), 'metal');                                       /* the counter front, an Ancient panel */
    F.box(0, 0.25, 0.54, 1.5, 0.18, 0.004, 0, F.col('paintRed'), 'metal');                               /* the siding's livery band, cream over red */
    F.box(0, 0.43, 0.54, 1.5, 0.12, 0.004, 0, F.col('paintCream'), 'metal');
    F.box(0, 0.95, 0.42, 2.0, 0.04, 0.4, 0, F.col('timberOld'), 'wood');                                 /* the counter top */
    F.beam(0, 2.25, -0.65, 0, 2.05, 0.65, 2.0, 0.02, F.col('canvasRaw'), 'cloth');                       /* the canvas over it: drips from the vault */
    for (let i = 0; i < 4; i++) F.box(-0.75 + i * 0.5, 1.95, 0.62, 0.24, 0.12, 0.01, 0, F.col(i % 2 ? 'paintCream' : 'paintRed'), 'cloth');
    F.box(0, 0, -0.55, 1.8, 0.04, 0.12, 0, F.col('plateDark'), 'metal');
    F.box(0, 1.2, -0.58, 1.8, 0.03, 0.14, 0, F.col('plate'), 'metal');                                   /* the back shelf */
    if (v === 0) {
      for (let i = 0; i < 6; i++) F.box(-0.75 + i * 0.3, 0.99, 0.42, 0.22, 0.08, 0.13, 0, F.col(i % 2 ? 'plate' : 'enamelRed'), 'metal');   /* bait tins */
      for (let i = 0; i < 8; i++) TGFURN_wax(F, -0.7 + i * 0.2, 1.23, -0.58, 1.1);
    } else {
      F.cyl(-0.6, 0.99, 0.35, 0.16, 0.4, 0, F.col('plate'), 'metal'); F.rod(-0.6, 1.1, 0.51, -0.6, 1.1, 0.56, 0.015, F.col('brass'), 'bronze');
      for (let i = 0; i < 6; i++) { F.cyl(-0.2 + i * 0.14, 0.99, 0.45, 0.04, 0.09, 0, F.col('enamelCream'), 'ceramic'); F.cyl(-0.2 + i * 0.14, 1.08, 0.45, 0.042, 0.01, 0, F.col('enamelChip'), 'ceramic'); }
      for (let i = 0; i < 5; i++) F.cyl(-0.6 + i * 0.3, 1.23, -0.58, 0.05, 0.14, 0, F.col('glass'), 'glass');
    }
    F.box(0, 1.6, 0.58, 0.5, 0.2, 0.06, 0, F.col('hood'), 'metal'); F.box(0, 1.63, 0.612, 0.38, 0.14, 0.006, 0, F.col('lampGreen'), 'glow');   /* green: the Line's trade */
  }
});
FURN({
  key: 'tungang_court_crew_mosaic', name: 'The crew mosaic', culture: 'tungang', tier: 'court', type: 'art', setting: 'indoor', role: 'mosaic',
  rooms: ['hall', 'tg_platform', 'tg_loj', 'tg_power'], anchor: 'wall', clearance: {},
  materials: ['concrete', 'ceramic', 'metal'], w: 3.0, d: 0.05, h: 2.0, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.02, 3.0, 2.0, 0.01, 0, F.col('concrete'), 'concrete');
    const C = function (k) { return F.css(F.col(k)); };
    F.decal(0, 0.04, -0.006, 2.92, 1.92, 0, 'tungang-crew-mosaic', function (g, W, H) {
      /* stand-in for the owed pattern patterns/tungang/crew-mosaic (core/materials/PROMPTS-NEEDED.md section 43): workers with lamps
         and spanners, a train, rays, a thousand years worn, tiles missing */
      const r = FK.paintRng(97), t = W / 60;
      g.fillStyle = C('mosaicBlue'); g.fillRect(0, 0, W, H);
      g.fillStyle = C('mosaicGold'); for (let i = 0; i < 12; i++) { const a = -Math.PI + i * Math.PI / 11; g.beginPath(); g.moveTo(W / 2, H * 0.62); g.lineTo(W / 2 + Math.cos(a) * W, H * 0.62 + Math.sin(a) * W); g.lineTo(W / 2 + Math.cos(a + 0.08) * W, H * 0.62 + Math.sin(a + 0.08) * W); g.closePath(); g.fill(); }
      g.fillStyle = C('enamelRed'); g.fillRect(W * 0.08, H * 0.7, W * 0.84, H * 0.16);                    /* the train */
      g.fillStyle = C('paintCream'); for (let i = 0; i < 7; i++) g.fillRect(W * (0.12 + i * 0.11), H * 0.73, W * 0.07, H * 0.06);
      g.fillStyle = C('enamelChip'); for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(W * (0.13 + i * 0.095), H * 0.87, H * 0.025, 0, Math.PI * 2); g.fill(); }
      for (let k = 0; k < 3; k++) { const cx = W * (0.25 + k * 0.25), base = H * 0.68;                   /* three crew, lamp, spanner, the show of hands */
        g.fillStyle = C('mosaicOchre'); g.fillRect(cx - W * 0.035, base - H * 0.32, W * 0.07, H * 0.32);
        g.beginPath(); g.arc(cx, base - H * 0.38, W * 0.03, 0, Math.PI * 2); g.fill();
        g.fillRect(cx + W * 0.03, base - H * (k === 1 ? 0.55 : 0.3), W * 0.018, H * (k === 1 ? 0.24 : 0.12));
        g.fillStyle = C(k === 0 ? 'lampAmber' : k === 2 ? 'pipeBright' : 'paintCream'); g.fillRect(cx - W * 0.075, base - H * 0.24, W * 0.03, H * 0.08); }
      g.strokeStyle = C('concrete'); g.lineWidth = 1;                                                       /* the tile grid, and the tiles gone */
      for (let x = 0; x < W; x += t) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += t) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = C('concrete'); for (let i = 0; i < 160; i++) g.fillRect(Math.floor(r() * 60) * t, Math.floor(r() * H / t) * t, t, t);
    }, 'ceramic');
  }
});

/* ---------------------------------------------------------------- the signal box, the doors, the lift head, the watch */
FURN({
  key: 'tungang_common_lever_frame', name: 'The lever frame, kept polished', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'indoor', role: 'levers',
  rooms: ['study', 'tg_signal', 'tg_power', 'tg_lift'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'bronze', 'ceramic', 'timber'], w: 2.0, d: 0.7, h: 1.3, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.1, 1.96, 0.3, 0.46, 0, F.col('plateDark'), 'metal');                                  /* the frame's bed */
    F.box(0, 0.88, -0.3, 1.96, 0.05, 0.1, 0, F.col('timberDark'), 'wood');                              /* the shelf of block instruments */
    for (const sx of [-1, 1]) F.box(sx * 0.95, 0, -0.33, 0.06, 0.93, 0.04, 0, F.col('plate'), 'metal');
    for (let i = 0; i < 4; i++) { const x = -0.7 + i * 0.47;
      F.box(x, 0.93, -0.3, 0.24, 0.3, 0.12, 0, F.col('timberOld'), 'wood');
      F.cyl(x, 1.05, -0.24, 0.07, 0.01, 0, F.col('enamelCream'), 'ceramic');
      F.box(x, 0.95, -0.235, 0.16, 0.05, 0.004, 0, F.col('brass'), 'bronze'); }
    for (let i = 0; i < 10; i++) { const x = -0.81 + i * 0.18, back = i % 3 === 1;                       /* the levers: red, blue, black, in their old order */
      F.rod(x, 0.3, 0.02, x, 1.0, back ? -0.08 : 0.16, 0.018, F.col(['enamelRed', 'enamelBlue', 'hood'][i % 3]), 'metal');
      F.rod(x, 0.85, back ? -0.06 : 0.12, x, 1.0, back ? -0.08 : 0.16, 0.022, F.col('pipeBright'), 'metal');
      F.box(x, 0.24, 0.135, 0.1, 0.05, 0.004, 0, F.col('brass'), 'bronze'); }
    F.frustum(0.85, 1.13, -0.3, 0.06, 0.03, 0.08, 0, F.col('brass'), 'bronze', 12);
  }
});
FURN({
  key: 'tungang_court_door_winch', name: 'The door\'s winding gear', culture: 'tungang', tier: 'court', type: 'workstation', setting: 'indoor', role: 'winch',
  rooms: ['tg_guard', 'tg_lift', 'tg_power', 'tg_shaft'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'rustSteel', 'cloth', 'bronze'], w: 1.4, d: 0.8, h: 1.8, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.1, 1.0, 0.25, 0.56, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.25, -0.3, 0.3, 1.2, 0.2, 0, F.col('plate'), 'metal');                                     /* the pedestal */
    F.rod(0, 1.2, -0.3, 0, 1.2, 0.12, 0.05, F.col('pipeBright'), 'metal');
    const ring = []; for (let i = 0; i <= 28; i++) { const a = i * F.TAU / 28; ring.push([Math.sin(a) * 0.55, 1.2 + Math.cos(a) * 0.55, 0.14]); }
    F.tube(ring, 0.035, F.col('enamelRed'), 'metal');                                                     /* the hand wheel, red, worn rose at the grips */
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.rod(0, 1.2, 0.14, Math.sin(a) * 0.53, 1.2 + Math.cos(a) * 0.53, 0.14, 0.018, F.col('pipe'), 'metal');
      F.ball(Math.sin(a) * 0.55, 1.2 + Math.cos(a) * 0.55, 0.14, 0.045, F.col('paintRose'), 'metal'); }
    F.rod(0, 1.2, 0.1, 0, 1.2, 0.2, 0.09, F.col('plateDark'), 'metal');
    F.cyl(0.45, 0.25, -0.12, 0.22, 0.12, 0, F.col('rust'), 'rust');                                       /* the reduction gear */
    for (let i = 0; i < 12; i++) { const a = i * F.TAU / 12; F.box(0.45 + Math.cos(a) * 0.23, 0.25, -0.12 + Math.sin(a) * 0.23, 0.04, 0.12, 0.04, a, F.col('rustDeep'), 'rust'); }
    F.rod(0.45, 0.37, -0.12, 0.45, 1.7, -0.36, 0.03, F.col('rivet'), 'metal');                           /* the chain to the door */
    F.box(-0.36, 0.25, 0.05, 0.12, 0.6, 0.06, 0, F.col('bannerRed'), 'cloth');                           /* the rota's ribbon on its post */
  }
});
FURN({
  key: 'tungang_common_hook_rack', name: 'Rack of pick-and-hooks and spring bows', culture: 'tungang', tier: 'common', type: 'rack', setting: 'indoor', role: 'weapon_rack',
  rooms: ['barracks', 'antechamber', 'tg_guard'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'timber', 'rope', 'emissive', 'glass'], w: 1.4, d: 0.35, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.66, 0, -0.16, 0.06, 1.9, 0.03, 0, F.col('plateDark'), 'metal');
    for (const y of [0.25, 1.5]) F.rod(-0.66, y, -0.1, 0.66, y, -0.1, 0.018, F.col('pipe'), 'metal');
    for (let i = 0; i < 4; i++) { const x = -0.5 + i * 0.22;                                              /* the pick-and-hooks: track tools for war */
      F.rod(x, 0.08, -0.08, x, 1.7, -0.1, 0.017, F.col('timberOld'), 'wood');
      F.box(x, 1.66, -0.1, 0.22, 0.04, 0.03, 0, F.col('pipeBright'), 'metal');
      F.rod(x + 0.11, 1.68, -0.1, x + 0.13, 1.56, -0.1, 0.012, F.col('pipeBright'), 'metal'); }
    for (let k = 0; k < 2; k++) { const y = 0.6 + k * 0.42;                                               /* crossbows of spring steel */
      F.rod(0.22, y, -0.06, 0.6, y, -0.06, 0.02, F.col('timberDark'), 'wood');
      F.beam(0.56, y - 0.18, -0.06, 0.56, y + 0.18, -0.06, 0.02, 0.02, F.col('pipeBright'), 'metal');
      F.rod(0.56, y - 0.18, -0.05, 0.3, y, -0.05, 0.003, F.col('canvasRaw'), 'rope'); F.rod(0.56, y + 0.18, -0.05, 0.3, y, -0.05, 0.003, F.col('canvasRaw'), 'rope'); }
    F.rod(0.66, 0.05, -0.08, 0.66, 1.85, -0.08, 0.012, F.col('pipe'), 'metal');                           /* the lamp pole */
    F.box(0.6, 1.72, -0.08, 0.1, 0.1, 0.08, 0, F.col('hood'), 'metal'); F.box(0.6, 1.74, -0.038, 0.06, 0.06, 0.004, 0, F.col('glowcap'), 'glow');
  }
});

/* ---------------------------------------------------------------- the works: the dark beds, the Fixers, wax, plaster */
FURN({
  key: 'tungang_common_tending_lamp', name: 'Amber tending lamp', culture: 'tungang', tier: 'common', type: 'lamp', setting: 'indoor', role: 'tending_lamp',
  rooms: ['workshop', 'farm', 'store', 'tg_beds', 'tg_wax', 'tg_kiln', 'tg_vein', 'tg_ore', 'tg_refinery', 'tg_shaft', 'tg_pens', 'tg_fan'], anchor: 'floor', clearance: {}, surface: false,
  materials: ['metal', 'emissive'], w: 0.45, d: 0.45, h: 1.6, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, 0, 0.3, 0, 0.014, F.col('pipe'), 'metal'); }
    F.rod(0, 0.3, 0, 0, 1.5, 0, 0.018, F.col('pipe'), 'metal');
    F.rod(0, 1.5, 0, 0.12, 1.5, 0.12, 0.014, F.col('pipe'), 'metal');
    F.frustum(0.12, 1.36, 0.12, 0.1, 0.05, 0.14, 0, F.col('hood'), 'metal', 10);                          /* hooded down onto the beds */
    F.cyl(0.12, 1.32, 0.12, 0.07, 0.05, 0, F.col('lampAmber'), 'glow');
  }
});
FURN({
  key: 'tungang_common_mat_bed', name: 'The mat in its sealed bed', culture: 'tungang', tier: 'common', type: 'vessel', setting: 'indoor', role: 'mat_bed', job: 'fungiculture',
  rooms: ['farm', 'store', 'workshop', 'tg_beds'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['ceramic', 'metal', 'food', 'cloth'], w: 1.8, d: 0.8, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0.1, 0, 1.76, 0.36, 0.76, 0, F.col('plate'), 'metal');                                       /* a trough of lining plate */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.8, 0, sz * 0.3, 0.08, 0.1, 0.08, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.46, 0.1, 1.68, 0.02, 0.5, 0, F.col('fungusMat'), 'food');                                  /* the mat, felt-thick */
    F.box(-0.4, 0.48, 0.12, 0.6, 0.008, 0.44, 0, F.col('felt'), 'cloth');                               /* a sheet lifted to press */
    F.beam(0, 0.46, -0.36, 0, 0.6, -0.3, 1.74, 0.025, F.col('plateDark'), 'metal');                       /* the lid propped open */
    TGFURN_rivets(F, -0.8, 0.8, 0.2, 0.385, 8);
    F.box(0, 0.22, 0.383, 0.24, 0.1, 0.004, 0, F.col('lampAmber'), 'ceramic');
  }
});
FURN({
  key: 'tungang_common_fixers_bench', name: 'The Fixers\' bench', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'indoor', role: 'workbench',
  rooms: ['workshop', 'smithy', 'tg_fixers', 'tg_power', 'tg_refinery'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'timber', 'glass', 'emissive', 'rope', 'bronze'], w: 1.8, d: 0.75, h: 1.15, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.82, 0, sz * 0.3, sx * 0.82, 0.86, sz * 0.3, 0.025, F.col('pipe'), 'metal');
    F.box(0, 0.86, 0, 1.8, 0.06, 0.74, 0, F.col('plate'), 'metal');                                       /* deck plate, scarred */
    F.box(0, 0.92, -0.365, 1.8, 0.08, 0.02, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.25, -0.02, 1.7, 0.03, 0.66, 0, F.col('plateDark'), 'metal');
    F.box(-0.7, 0.92, 0.22, 0.2, 0.08, 0.14, 0, F.col('enamelBlue'), 'metal');                           /* the vice */
    F.rod(-0.7, 0.98, 0.3, -0.7, 0.98, 0.38, 0.012, F.col('pipeBright'), 'metal');
    F.box(-0.2, 0.92, 0.05, 0.22, 0.2, 0.16, 0, F.col('hood'), 'metal');                                 /* a lamp box in pieces */
    F.box(-0.08, 0.92, 0.15, 0.12, 0.012, 0.12, 0.4, F.col('lampGreen'), 'glow');
    for (let i = 0; i < 3; i++) F.cyl(0.25 + i * 0.12, 0.92, -0.18, 0.05, 0.012, 0, F.col('brass'), 'bronze');   /* gauges */
    F.box(0.6, 0.92, 0.0, 0.4, 0.04, 0.3, 0, F.col('rust'), 'metal');                                     /* the parts tray */
    for (let i = 0; i < 8; i++) F.ball(0.45 + (i % 4) * 0.1, 0.97, -0.08 + Math.floor(i / 4) * 0.12, 0.018, F.col('pipeBright'), 'metal');
    const coil = []; for (let i = 0; i <= 12; i++) { const a = i * F.TAU / 12; coil.push([0.2 + Math.cos(a) * 0.1, 0.27, 0.1 + Math.sin(a) * 0.1]); }
    F.tube(coil, 0.02, F.col('oreCopper'), 'rope');                                                      /* copper winding wire, new */
  }
});
FURN({
  key: 'tungang_common_screw_press', name: 'Screw press', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'indoor', role: 'press',
  rooms: ['workshop', 'tg_fixers', 'tg_wax', 'tg_refinery'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['metal', 'rustSteel'], w: 0.8, d: 0.7, h: 1.9, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.7, 0.2, 0.6, 0, F.col('plateDark'), 'metal');
    for (const sx of [-1, 1]) F.box(sx * 0.3, 0.2, 0, 0.08, 1.4, 0.16, 0, F.col('rust'), 'rust');
    F.box(0, 1.6, 0, 0.76, 0.14, 0.2, 0, F.col('rust'), 'rust');                                           /* the crown */
    F.rod(0, 0.6, 0, 0, 1.86, 0, 0.04, F.col('pipeBright'), 'metal');                                     /* the screw */
    F.rod(-0.38, 1.82, 0, 0.38, 1.82, 0, 0.02, F.col('pipe'), 'metal');
    for (const sx of [-1, 1]) F.ball(sx * 0.38, 1.82, 0, 0.045, F.col('enamelRed'), 'metal');
    F.box(0, 0.5, 0, 0.5, 0.08, 0.36, 0, F.col('plate'), 'metal');                                        /* the platen */
    F.box(0, 0.2, 0, 0.5, 0.12, 0.4, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.32, 0.0, 0.3, 0.04, 0.3, 0, F.col('pipeBright'), 'metal');                                 /* a plate being flattened */
  }
});
FURN({
  key: 'tungang_common_salvage_bins', name: 'Salvage sorted in bins', culture: 'tungang', tier: 'common', type: 'stack', setting: 'indoor', role: 'parts_bins',
  rooms: ['workshop', 'tg_fixers', 'tg_ore'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['metal', 'rustSteel', 'glass', 'ceramic'], w: 1.6, d: 0.6, h: 1.1, variants: 1,
  build: function (F) {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {                                              /* stepped bins, each numbered */
      const x = -0.6 + i * 0.4, y = r * 0.5, z = r ? -0.16 : 0.06, d = r ? 0.26 : 0.46;
      F.box(x, y, z, 0.38, 0.4, d, 0, F.col(r ? 'plateDark' : 'plate'), 'metal');
      F.box(x, y + 0.24, z + d / 2 + 0.002, 0.12, 0.08, 0.004, 0, F.col('enamelCream'), 'ceramic');
      const k = (i + r * 2) % 4;
      for (let j = 0; j < 5; j++) { const px = x + F.rr(-0.12, 0.12), pz = z + F.rr(-d / 3, d / 3);
        if (k === 0) F.ball(px, y + 0.4, pz, 0.03, F.col('pipeBright'), 'metal');
        else if (k === 1) F.rod(px - 0.08, y + 0.41, pz, px + 0.08, y + 0.42, pz, 0.02, F.col('rust'), 'rust');
        else if (k === 2) F.box(px, y + 0.4, pz, 0.06, 0.03, 0.05, F.rr(0, 1), F.col('glass'), 'glass');
        else F.box(px, y + 0.4, pz, 0.07, 0.02, 0.07, F.rr(0, 1), F.col('enamelRed'), 'ceramic'); } }
    F.box(0, 0, -0.29, 1.6, 1.1, 0.02, 0, F.col('plateDark'), 'metal');
  }
});
FURN({
  key: 'tungang_common_wax_moulds', name: 'Wax moulds and the melting tray', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'indoor', role: 'moulds', job: 'lampmaking',
  rooms: ['workshop', 'kitchen', 'tg_wax'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['rustSteel', 'metal', 'food', 'emissive', 'timber'], w: 1.6, d: 0.7, h: 0.92, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.74, 0, sz * 0.28, sx * 0.74, 0.8, sz * 0.28, 0.022, F.col('pipe'), 'metal');
    F.box(0, 0.8, 0, 1.6, 0.04, 0.7, 0, F.col('plate'), 'metal');
    F.box(0, 0.84, -0.34, 1.6, 0.08, 0.02, 0, F.col('plateDark'), 'metal');                                 /* the back rail */
    F.box(-0.45, 0.84, 0, 0.6, 0.06, 0.5, 0, F.col('plateDark'), 'metal');                                /* the melting tray, on the vent's heat */
    F.box(-0.45, 0.86, 0, 0.54, 0.02, 0.44, 0, F.col('wax'), 'food');
    F.rod(-0.45, 0.25, -0.3, -0.45, 0.84, -0.3, 0.04, F.col('rust'), 'rust');                             /* the warm pipe up from the vent */
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { const x = 0.12 + i * 0.16, z = -0.12 + j * 0.24;   /* tin moulds: cakes, lamps, door seals */
      F.box(x, 0.84, z, 0.13, 0.05, 0.18, 0, F.col('pipeBright'), 'metal');
      if ((i + j) % 2) F.box(x, 0.86, z, 0.11, 0.035, 0.16, 0, F.col('waxDark'), 'food'); }
    F.box(0, 0.25, 0, 1.5, 0.03, 0.6, 0, F.col('timberOld'), 'wood');
    for (let i = 0; i < 9; i++) F.box(-0.6 + i * 0.15, 0.28, 0.05, 0.12, 0.05, 0.16, 0, F.col('wax'), 'food');   /* the cakes, wrapped for the bait tins */
  }
});
FURN({
  key: 'tungang_common_wax_vat', name: 'Wax vat on the vent pipe', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'indoor', role: 'vat', job: 'lampmaking',
  rooms: ['workshop', 'tg_wax'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['metal', 'rustSteel', 'food', 'emissive'], w: 1.0, d: 1.0, h: 1.1, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.46, 0.2, 0, F.col('rustDeep'), 'rust');                                                /* the firebox of the vent */
    F.box(0, 0.04, 0.42, 0.24, 0.12, 0.06, 0, F.col('flame'), 'glow');
    F.cyl(0, 0.2, 0, 0.44, 0.7, 0, F.col('rust'), 'rust');
    for (const y of [0.35, 0.75]) F.cyl(0, y, 0, 0.448, 0.03, 0, F.col('rustDeep'), 'rust');
    F.cyl(0, 0.86, 0, 0.4, 0.02, 0, F.col('wax'), 'food');                                                  /* molten, warm-white */
    F.cyl(0, 0.9, 0, 0.45, 0.04, 0, F.col('plateDark'), 'metal');
    F.rod(0.2, 0.9, 0.1, 0.45, 1.08, 0.3, 0.014, F.col('pipe'), 'metal'); F.cyl(0.2, 0.84, 0.1, 0.06, 0.06, 0, F.col('pipe'), 'metal');   /* the ladle */
    F.rod(-0.3, 0.2, -0.3, -0.3, 0.0, -0.3, 0.06, F.col('pipe'), 'metal');
  }
});
FURN({
  key: 'tungang_common_gypsum_kiln', name: 'Gypsum kiln on the vent', culture: 'tungang', tier: 'common', type: 'stove', setting: 'indoor', role: 'kiln', job: 'masonry',
  rooms: ['workshop', 'tg_kiln'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'rustSteel', 'stone', 'emissive', 'plaster'], w: 1.8, d: 1.4, h: 2.2, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.1, 1.7, 1.6, 1.2, 0, F.col('rust'), 'rust');                                            /* plate-cased, riveted */
    for (let i = 0; i < 4; i++) F.box(0, 0.2 + i * 0.4, 0.502, 1.72, 0.04, 0.02, 0, F.col('rustDeep'), 'rust');
    F.box(0, 0.25, 0.505, 0.6, 0.6, 0.03, 0, F.col('plateDark'), 'metal');                                 /* the door */
    F.box(0, 0.25, 0.52, 0.56, 0.03, 0.01, 0, F.col('flame'), 'glow');                                     /* the heat at its sill */
    F.beam(0, 1.6, 0.5, 0, 2.0, -0.2, 1.4, 0.03, F.col('rust'), 'rust');                                   /* the hood */
    F.rod(0.5, 1.6, -0.5, 0.5, 2.2, -0.5, 0.12, F.col('rustDeep'), 'rust');                               /* the draught up to the vent's flue */
    F.box(0, 0, 0.62, 1.2, 0.08, 0.14, 0, F.col('plasterWhite'), 'plaster');                              /* burned gypsum swept at its foot */
    for (let i = 0; i < 5; i++) F.blob(-0.5 + i * 0.25, 0.08, 0.62, 0.07, 0.05, 0, F.col('plasterWhite'), 'stone');
  }
});
FURN({
  key: 'tungang_common_plaster_sacks', name: 'Plaster sacks on a plate pallet', culture: 'tungang', tier: 'common', type: 'stack', setting: 'indoor', role: 'plaster',
  rooms: ['tg_kiln'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'cloth', 'plaster'], w: 1.2, d: 0.7, h: 0.75, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.2, 0.08, 0.7, 0, F.col('plateDark'), 'metal');
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3 - j; i++) {
      const x = -0.36 + i * 0.36 + j * 0.18;
      F.pillow(x, 0.23 + j * 0.28, 0, 0.34, 0.3, 0.6, F.rr(-0.1, 0.1), F.col('canvasRaw'), 'cloth'); }
    F.box(0.1, 0.08, 0.36, 0.8, 0.01, 0.02, 0, F.col('plasterWhite'), 'plaster');                           /* the dust */
  }
});

/* ---------------------------------------------------------------- the kitchens: the bait room and the brew room */
FURN({
  key: 'tungang_common_bait_range', name: 'The bait room\'s range', culture: 'tungang', tier: 'common', type: 'stove', setting: 'indoor', role: 'hearth',
  rooms: ['tg_bait', 'tg_brew'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'rustSteel', 'ceramic', 'emissive'], w: 1.8, d: 0.8, h: 2.1, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.04, 1.7, 0.8, 0.7, 0, F.col('plateDark'), 'metal');                                     /* two fireboxes in one plate case */
    for (const sx of [-1, 1]) { F.box(sx * 0.42, 0.16, 0.315, 0.4, 0.34, 0.02, 0, F.col('rust'), 'rust');
      for (let i = 0; i < 3; i++) F.box(sx * 0.42, 0.22 + i * 0.08, 0.327, 0.28, 0.025, 0.006, 0, F.col('flame'), 'glow'); }
    F.box(0, 0.8, -0.04, 1.76, 0.04, 0.74, 0, F.col('pipe'), 'metal');                                    /* the hotplate */
    F.cyl(-0.45, 0.84, -0.05, 0.22, 0.3, 0, F.col('plate'), 'metal');                                     /* the mash pot */
    F.frustum(0.35, 0.84, 0.0, 0.12, 0.09, 0.18, 0, F.col('enamelCream'), 'ceramic', 12);
    F.beam(0, 1.7, 0.36, 0, 1.95, -0.36, 1.8, 0.03, F.col('plate'), 'metal');                              /* the hood */
    F.rod(0, 1.95, -0.3, 0, 2.1, -0.3, 0.1, F.col('plateDark'), 'metal');
    F.rod(-0.8, 1.6, 0.25, 0.8, 1.6, 0.25, 0.015, F.col('pipe'), 'metal');                                 /* the rail the pans hang from */
    for (let i = 0; i < 4; i++) { const x = -0.6 + i * 0.4; F.rod(x, 1.6, 0.25, x, 1.4, 0.25, 0.005, F.col('pipe'), 'metal');
      F.cyl(x, 1.26, 0.25, 0.1, 0.03, 0, F.col(i % 2 ? 'plate' : 'enamelCream'), i % 2 ? 'metal' : 'ceramic'); }
  }
});
FURN({
  key: 'tungang_poor_bait_tin', name: 'Bait tin', culture: 'tungang', tier: 'poor', type: 'vessel', setting: 'indoor', role: 'bait_tin',
  rooms: ['kitchen', 'living', 'dormitory', 'workshop', 'store', 'tg_berth', 'tg_cut', 'tg_bait', 'tg_guard', 'tg_vein', 'tg_signal'], anchor: 'surface', clearance: {},
  materials: ['metal', 'food'], w: 0.25, d: 0.15, h: 0.1, variants: 2, variantNames: ['shut', 'open: mash cakes in wax'],
  build: function (F) {
    const open = (F.variant | 0) === 1;
    F.box(0, 0, 0, 0.24, 0.06, 0.14, 0, F.col(F.seed % 2 ? 'plate' : 'enamelRed'), 'metal');
    TGFURN_rivets(F, -0.1, 0.1, 0.03, 0.071, 4);
    if (open) { F.beam(0, 0.06, -0.07, 0, 0.098, -0.066, 0.24, 0.005, F.col('plate'), 'metal');
      for (let i = 0; i < 3; i++) F.box(-0.07 + i * 0.07, 0.06, 0.0, 0.06, 0.025, 0.1, 0, F.col(i === 1 ? 'fungusPale' : 'wax'), 'food'); }
    else { F.box(0, 0.06, 0, 0.245, 0.015, 0.145, 0, F.col('plateDark'), 'metal'); F.box(0, 0.075, 0.0, 0.08, 0.006, 0.05, 0, F.col('waxDark'), 'food'); }
  }
});
FURN({
  key: 'tungang_common_brew_urn', name: 'The brew urn', culture: 'tungang', tier: 'common', type: 'vessel', setting: 'indoor', role: 'urn',
  rooms: ['kitchen', 'hall', 'tavern', 'tg_brew', 'tg_bait', 'tg_loj', 'tg_platform', 'tg_guard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['rustSteel', 'metal', 'bronze', 'ceramic', 'emissive'], w: 0.5, d: 0.5, h: 0.92, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, Math.cos(a) * 0.15, 0.22, Math.sin(a) * 0.15, 0.015, F.col('pipe'), 'metal'); }
    F.cyl(0, 0.04, 0, 0.1, 0.06, 0, F.col('rustDeep'), 'rust'); F.ball(0, 0.1, 0, 0.03, F.col('flame'), 'glow');   /* a wax lamp under it */
    F.cyl(0, 0.22, 0, 0.2, 0.52, 0, F.col('enamelCream'), 'ceramic');                                      /* an Ancient tank, enamelled */
    for (const y of [0.3, 0.66]) F.cyl(0, y, 0, 0.205, 0.03, 0, F.col('enamelRed'), 'ceramic');
    F.frustum(0, 0.74, 0, 0.2, 0.1, 0.1, 0, F.col('enamelCream'), 'ceramic', 16);
    F.cyl(0, 0.84, 0, 0.09, 0.03, 0, F.col('plateDark'), 'metal'); F.ball(0, 0.89, 0, 0.03, F.col('brass'), 'bronze');
    F.rod(0, 0.34, 0.19, 0, 0.34, 0.24, 0.016, F.col('brass'), 'bronze'); F.rod(0, 0.34, 0.24, 0, 0.3, 0.245, 0.012, F.col('brass'), 'bronze');
    for (let i = 0; i < 3; i++) { const a = -0.9 + i * 0.9; F.rod(Math.sin(a) * 0.2, 0.6, Math.cos(a) * 0.2, Math.sin(a) * 0.235, 0.6, Math.cos(a) * 0.235, 0.006, F.col('pipe'), 'metal');
      F.cyl(Math.sin(a) * 0.235, 0.5, Math.cos(a) * 0.235, 0.03, 0.08, 0, F.col('enamelCream'), 'ceramic'); }   /* the mugs on their hooks */
  }
});

/* ---------------------------------------------------------------- water and air: the cistern, the fan, the bath */
FURN({
  key: 'tungang_common_cistern_tap', name: 'Cistern hatch and hand pump', culture: 'tungang', tier: 'common', type: 'well', setting: 'indoor', role: 'well',
  rooms: ['yard', 'store', 'tg_cistern', 'tg_bath'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['concrete', 'metal', 'rustSteel', 'bronze', 'ceramic'], w: 1.2, d: 1.0, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.2, 0.18, 1.0, 0, F.col('concrete'), 'concrete');                                       /* the Ancient cistern's kerb */
    F.box(-0.2, 0.18, 0.05, 0.6, 0.03, 0.6, 0, F.col('plateDark'), 'metal');                               /* the hatch */
    F.rod(-0.2, 0.22, 0.32, 0.0, 0.22, 0.32, 0.012, F.col('pipeBright'), 'metal');
    F.cyl(0.35, 0.18, -0.2, 0.08, 1.0, 0, F.col('rust'), 'rust');                                          /* the pump */
    F.rod(0.35, 1.18, -0.2, 0.35, 1.18, 0.2, 0.03, F.col('rust'), 'rust');
    F.rod(0.35, 1.2, -0.25, 0.35, 1.55, 0.25, 0.02, F.col('enamelRed'), 'metal');                          /* the handle */
    F.rod(0.35, 0.9, -0.12, 0.35, 0.82, 0.08, 0.025, F.col('rust'), 'rust');
    F.frustum(0.35, 0.18, 0.15, 0.12, 0.15, 0.24, 0, F.col('plate'), 'metal', 12);                         /* the bucket */
    F.rod(0.23, 0.42, 0.15, 0.47, 0.42, 0.15, 0.004, F.col('pipe'), 'metal');
    F.box(0.35, 0.95, -0.115, 0.14, 0.08, 0.004, 0, F.col('enamelBlue'), 'ceramic');
  }
});
FURN({
  key: 'tungang_court_fan_frame', name: 'An Ancient fan, kept turning', culture: 'tungang', tier: 'court', type: 'workstation', setting: 'indoor', role: 'fan',
  rooms: ['tg_fan', 'tg_shaft', 'tg_power'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['food', 'metal', 'rustSteel', 'cloth', 'concrete'], w: 2.2, d: 1.0, h: 2.4, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.1, 2.0, 0.3, 0.7, 0, F.col('concrete'), 'concrete');
    const cy = 1.32, R = 0.95, ring = [];
    for (let i = 0; i <= 32; i++) { const a = i * F.TAU / 32; ring.push([Math.cos(a) * R, cy + Math.sin(a) * R, -0.2]); }
    F.tube(ring, 0.07, F.col('plate'), 'metal');                                                            /* the shroud */
    for (const sx of [-1, 1]) F.box(sx * 0.9, 0.3, -0.3, 0.12, 1.0, 0.18, 0, F.col('plateDark'), 'metal');
    F.rod(0, cy, -0.48, 0, cy, -0.05, 0.12, F.col('plateDark'), 'metal');                                   /* the hub and its motor, dead; the draught turns it */
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6 + 0.25, c = Math.cos(a), s = Math.sin(a);
      F.beam(c * 0.12, cy + s * 0.12, -0.2, c * 0.86, cy + s * 0.86, -0.2, 0.26, 0.02, F.col(i % 2 ? 'pipeBright' : 'plate'), 'metal'); }
    for (let i = 0; i < 4; i++) { const a = i * F.TAU / 4; F.box(Math.cos(a) * 0.96, cy + Math.sin(a) * 0.96 - 0.15, -0.12, 0.05, 0.22, 0.01, 0, F.col('bannerRed'), 'cloth'); }   /* ribbons: the draught shown */
    F.cyl(0.7, 0.3, 0.12, 0.1, 0.14, 0, F.col('plate'), 'metal'); F.cyl(0.7, 0.44, 0.12, 0.08, 0.01, 0, F.col('waxDark'), 'food');   /* the grease pot: hearth wax */
  }
});
FURN({
  key: 'tungang_common_wash_trough', name: 'Wash trough with brass taps', culture: 'tungang', tier: 'common', type: 'vessel', setting: 'indoor', role: 'washbasin',
  rooms: ['bath', 'kitchen', 'tg_bath', 'tg_berth', 'tg_stoke'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['glass', 'metal', 'bronze', 'ceramic'], w: 1.6, d: 0.5, h: 1.05, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.rod(sx * 0.72, 0, 0.0, sx * 0.72, 0.7, 0.0, 0.022, F.col('pipe'), 'metal');
    F.box(0, 0.6, 0.02, 1.56, 0.22, 0.44, 0, F.col('enamelCream'), 'ceramic');                              /* an Ancient trough, re-enamelled */
    F.box(0, 0.79, 0.02, 1.46, 0.02, 0.36, 0, F.col('glass'), 'glass');
    F.box(0, 0.62, 0.242, 1.5, 0.04, 0.004, 0, F.col('enamelRed'), 'ceramic');
    F.rod(-0.76, 0.98, -0.22, 0.76, 0.98, -0.22, 0.025, F.col('pipe'), 'metal');                            /* the warm line from the vent */
    for (let i = 0; i < 3; i++) { const x = -0.5 + i * 0.5;
      F.rod(x, 0.98, -0.22, x, 0.98, -0.08, 0.014, F.col('brass'), 'bronze'); F.rod(x, 0.98, -0.08, x, 0.9, -0.06, 0.012, F.col('brass'), 'bronze');
      F.box(x, 1.0, -0.15, 0.06, 0.02, 0.02, 0, F.col('brass'), 'bronze'); }
    F.box(0, 0.6, -0.24, 1.6, 0.45, 0.02, 0, F.col('plateDark'), 'metal');
  }
});

/* ---------------------------------------------------------------- the pens, the stoke room, the last stop, the cleft */
FURN({
  key: 'tungang_common_leaper_pen', name: 'Leaper pen', culture: 'tungang', tier: 'common', type: 'pen', setting: 'indoor', role: 'stall',
  rooms: ['stable', 'yard', 'tg_pens'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'food', 'rustSteel'], w: 2.2, d: 2.0, h: 1.3, variants: 1,
  build: function (F) {
    for (const [x, z] of [[-1.05, -0.95], [1.05, -0.95], [-1.05, 0.95], [1.05, 0.95], [0, -0.95]]) F.rod(x, 0, z, x, 1.3, z, 0.03, F.col('pipe'), 'metal');
    for (const y of [0.4, 0.8, 1.22]) {                                                                      /* pipe rails: leapers jump */
      F.rod(-1.05, y, -0.95, 1.05, y, -0.95, 0.02, F.col('pipe'), 'metal');
      for (const sx of [-1, 1]) F.rod(sx * 1.05, y, -0.95, sx * 1.05, y, 0.95, 0.02, F.col('pipe'), 'metal');
      F.rod(-1.05, y, 0.95, -0.2, y, 0.95, 0.02, F.col('pipe'), 'metal'); }
    for (const y of [0.4, 0.8]) F.rod(-0.18, y, 0.95, 1.05, y, 0.95, 0.018, F.col('enamelRed'), 'metal');   /* the gate */
    F.box(0, 0, 0, 2.0, 0.06, 1.8, 0, F.col('fungusMat'), 'food');                                           /* coal moss bedding */
    F.box(-0.6, 0, -0.7, 0.7, 0.3, 0.3, 0, F.col('rust'), 'rust');                                           /* the trough */
    F.box(-0.6, 0.28, -0.7, 0.62, 0.03, 0.22, 0, F.col('fungusPale'), 'food');
  }
});
FURN({
  key: 'tungang_common_ward_cot', name: 'Stoke-room cot', culture: 'tungang', tier: 'common', type: 'bed', setting: 'indoor', role: 'cot',
  rooms: ['bedroom', 'dormitory', 'tg_stoke', 'tg_cut', 'tg_berth'], anchor: 'wall', clearance: { front: 0.9 },
  materials: ['metal', 'cloth'], w: 2.0, d: 0.9, h: 1.7, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.95, 0, sz * 0.38, sx * 0.95, 0.55, sz * 0.38, 0.02, F.col('pipe'), 'metal');
    F.rod(-0.95, 0.4, -0.38, -0.95, 0.85, -0.38, 0.02, F.col('pipe'), 'metal'); F.rod(-0.95, 0.85, -0.38, -0.95, 0.85, 0.38, 0.02, F.col('pipe'), 'metal');
    F.rod(-0.95, 0.4, 0.38, -0.95, 0.85, 0.38, 0.02, F.col('pipe'), 'metal');
    F.box(0, 0.4, 0, 1.9, 0.04, 0.78, 0, F.col('canvasRaw'), 'cloth');
    F.box(0, 0.44, 0, 1.84, 0.1, 0.72, 0, F.col('seatWhite'), 'cloth');
    F.box(0.2, 0.54, 0.0, 1.3, 0.04, 0.76, 0, F.col('blanketGrey'), 'cloth');
    F.box(-0.7, 0.54, 0, 0.36, 0.1, 0.5, 0, F.col('seatWhite'), 'cloth');
    F.rod(-0.95, 1.65, 0.42, 0.95, 1.65, 0.42, 0.012, F.col('pipe'), 'metal');                               /* the curtain rail, curtain drawn back */
    for (const sx of [-1, 1]) F.rod(sx * 0.95, 0.55, -0.43, sx * 0.95, 1.65, 0.42, 0.012, F.col('pipe'), 'metal');
    F.box(0.82, 0.62, 0.42, 0.24, 1.0, 0.02, 0, F.col('blanketBrown'), 'cloth');
  }
});
FURN({
  key: 'tungang_court_stoke_cabinet', name: 'The steward\'s stoke cabinet', culture: 'tungang', tier: 'court', type: 'storage', setting: 'indoor', role: 'stoke',
  rooms: ['tg_stoke', 'tg_signal'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['ceramic', 'metal', 'bronze', 'glass'], w: 0.8, d: 0.4, h: 1.6, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.01, 0.78, 1.56, 0.38, 0, F.col('enamelCream'), 'ceramic');
    F.box(0, 1.56, -0.01, 0.8, 0.04, 0.4, 0, F.col('plateDark'), 'metal');
    for (const y of [0.1, 0.8, 1.45]) F.box(0, y, -0.01, 0.8, 0.04, 0.4, 0, F.col('brass'), 'bronze');      /* the brass bands */
    F.box(0, 0.86, 0.181, 0.6, 0.56, 0.012, 0, F.col('glass'), 'glass');                                    /* the glass door: the stoke, counted */
    for (let i = 0; i < 5; i++) F.cyl(-0.22 + i * 0.11, 0.9 + (i % 2) * 0.24, 0.08, 0.035, 0.16, 0, F.col('stoke'), 'glass');
    F.box(0.24, 0.6, 0.19, 0.08, 0.1, 0.03, 0, F.col('brass'), 'bronze'); F.box(0.24, 0.53, 0.2, 0.05, 0.06, 0.03, 0, F.col('rivet'), 'metal');   /* the lock: the steward keeps the stoke */
    F.box(0, 0.2, 0.181, 0.5, 0.5, 0.01, 0, F.col('enamelRed'), 'ceramic');
  }
});
FURN({
  key: 'tungang_poor_last_lamp', name: 'The last lamp', culture: 'tungang', tier: 'poor', type: 'lamp', setting: 'indoor', role: 'last_lamp',
  rooms: ['tg_last', 'tg_cleft'], anchor: 'floor', clearance: {}, surface: false,
  materials: ['metal', 'food', 'glass', 'emissive', 'ceramic'], w: 0.2, d: 0.2, h: 0.3, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.08, 0.04, 0, F.col('plate'), 'metal');
    F.cyl(0, 0.04, 0, 0.06, 0.07, 0, F.col('wax'), 'food');                                                 /* lit at the seal, let burn till its wax is gone */
    F.ball(0, 0.13, 0, 0.016, F.col('flame'), 'glow');
    F.frustum(0, 0.04, 0, 0.075, 0.05, 0.22, 0, F.col('glass'), 'glass', 12);
    F.box(0.07, 0.0, 0.06, 0.06, 0.03, 0.004, 0.6, F.col('paintCream'), 'ceramic');                          /* the berth tag */
    F.lamp(0, 0.15, 0, 0.25, 3);
  }
});
FURN({
  key: 'tungang_common_cleft_rail', name: 'The rail across a crystal cleft', culture: 'tungang', tier: 'common', type: 'shrine', setting: 'indoor', role: 'cleft_rail',
  rooms: ['shrine', 'tg_cleft'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'cloth', 'ceramic', 'glass'], w: 2.4, d: 0.3, h: 1.1, variants: 1,
  build: function (F) {
    for (const x of [-1.15, 0, 1.15]) { F.cyl(x, 0, -0.08, 0.06, 0.04, 0, F.col('plateDark'), 'metal'); F.rod(x, 0, -0.08, x, 1.0, -0.08, 0.025, F.col('pipe'), 'metal'); }
    for (const y of [0.55, 1.0]) F.rod(-1.15, y, -0.08, 1.15, y, -0.08, 0.02, F.col('pipeBright'), 'metal');
    for (let i = 0; i < 9; i++) { const x = -1.0 + i * 0.25;                                                 /* ribbons, one for every visit; nothing taken */
      F.box(x, 0.72, -0.07, 0.035, 0.26 + (i % 3) * 0.04, 0.006, 0, F.col(['bannerRed', 'blanketGrey', 'enamelCream'][i % 3]), 'cloth'); }
    F.box(0, 0.78, -0.12, 0.42, 0.18, 0.012, 0, F.col('enamelCream'), 'ceramic');                           /* NUTHN TEKN */
    F.box(0, 0.8, -0.113, 0.36, 0.03, 0.004, 0, F.col('enamelRed'), 'ceramic');
    F.box(0, 0.86, -0.113, 0.36, 0.03, 0.004, 0, F.col('enamelRed'), 'ceramic');
    for (let i = 0; i < 4; i++) F.cone(-0.9 + i * 0.6, 0, -0.09, 0.04, 0.16 + (i % 2) * 0.1, 0, F.col('crystal'), 'glass');   /* the cleft's foot, left as it grew */
  }
});

/* ---------------------------------------------------------------- the mines: the vein working, the ore store, the refinery */
FURN({
  key: 'tungang_common_ore_tub', name: 'Ore tub on its rail stub', culture: 'tungang', tier: 'common', type: 'stack', setting: 'indoor', role: 'ore',
  rooms: ['tg_vein', 'tg_ore'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'rustSteel', 'stone'], w: 1.2, d: 0.9, h: 1.05, variants: 2, variantNames: ['copper ore', 'tin and iron'],
  build: function (F) {
    const tin = (F.variant | 0) === 1;
    for (const sz of [-1, 1]) F.box(0, 0, sz * 0.3, 1.2, 0.06, 0.06, 0, F.col('rust'), 'rust');              /* a stub of narrow rail */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * 0.32, 0.06, sz * 0.36, 0.1, 0.05, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.2, 0, 0.9, 0.5, 0.66, 0, F.col('rust'), 'rust');                                              /* the tub, riveted plate */
    F.box(0, 0.68, 0, 0.94, 0.04, 0.7, 0, F.col('rustDeep'), 'rust');
    for (let i = 0; i < 9; i++) F.blob(F.rr(-0.3, 0.3), 0.72 + F.rr(0, 0.12), F.rr(-0.25, 0.25), F.rr(0.07, 0.12), F.rr(0.06, 0.1), F.rr(0, 3),
      F.col(tin ? (i % 2 ? 'oreGrey' : 'oreRust') : (i % 2 ? 'oreCopper' : 'oreGrey')), 'stone');
    F.box(0, 0.4, 0.37, 0.18, 0.1, 0.004, 0, F.col('paintCream'), 'metal');
  }
});
FURN({
  key: 'tungang_common_pick_rack', name: 'Rack of picks, drills and lamp poles', culture: 'tungang', tier: 'common', type: 'rack', setting: 'indoor', role: 'tool_rack',
  rooms: ['tg_vein', 'tg_ore', 'tg_shaft'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['metal', 'timber', 'emissive', 'rustSteel'], w: 1.2, d: 0.35, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.56, 0, -0.16, 0.06, 1.9, 0.03, 0, F.col('plateDark'), 'metal');
    for (const y of [0.3, 1.45]) F.rod(-0.56, y, -0.12, 0.56, y, -0.12, 0.016, F.col('pipe'), 'metal');
    for (let i = 0; i < 3; i++) { const x = -0.42 + i * 0.2;
      F.rod(x, 0.1, -0.08, x, 1.4, -0.1, 0.018, F.col('timberOld'), 'wood');
      F.beam(x - 0.2, 1.44, -0.1, x + 0.2, 1.38, -0.1, 0.04, 0.03, F.col('rust'), 'rust'); }                 /* picks */
    F.rod(0.22, 0.15, -0.08, 0.22, 1.25, -0.1, 0.022, F.col('pipeBright'), 'metal');                         /* the hand drill */
    F.rod(0.14, 1.25, -0.1, 0.3, 1.25, -0.1, 0.015, F.col('pipe'), 'metal');
    for (const x of [0.4, 0.5]) { F.rod(x, 0.05, -0.08, x, 1.8, -0.1, 0.01, F.col('pipe'), 'metal');
      F.box(x, 1.7, -0.08, 0.07, 0.08, 0.07, 0, F.col('hood'), 'metal'); F.box(x, 1.72, -0.044, 0.04, 0.04, 0.004, 0, F.col('lampAmber'), 'glow'); }
    F.dome(-0.1, 1.6, -0.04, 0.13, 0.12, 0, F.col('enamelRed'), 'metal');
  }
});
FURN({
  key: 'tungang_common_ore_bins', name: 'Ore bins, sorted', culture: 'tungang', tier: 'common', type: 'storage', setting: 'indoor', role: 'ore_bins',
  rooms: ['tg_ore', 'tg_refinery'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'stone', 'ceramic'], w: 1.8, d: 0.8, h: 0.9, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.39, 1.8, 0.9, 0.02, 0, F.col('plateDark'), 'metal');
    const ores = [['oreCopper', 'oreGrey'], ['oreGrey', 'pipeBright'], ['oreRust', 'rustDeep']];
    for (let i = 0; i < 3; i++) { const x = -0.6 + i * 0.6;
      for (const sx of [-1, 1]) F.box(x + sx * 0.29, 0, 0, 0.02, 0.8, 0.76, 0, F.col('plate'), 'metal');
      F.box(x, 0, 0.37, 0.58, 0.5, 0.02, 0, F.col('plate'), 'metal');
      F.box(x, 0.3, 0.385, 0.2, 0.1, 0.004, 0, F.col('enamelCream'), 'ceramic');
      for (let j = 0; j < 7; j++) F.blob(x + F.rr(-0.2, 0.2), 0.36 + F.rr(0, 0.12), F.rr(-0.25, 0.2), F.rr(0.06, 0.11), F.rr(0.05, 0.09), F.rr(0, 3), F.col(ores[i][j % 2]), 'stone'); }
  }
});
FURN({
  key: 'tungang_court_batch_still', name: 'The rare-earth batch bench', culture: 'tungang', tier: 'court', type: 'workstation', setting: 'indoor', role: 'retort', job: 'alchemy',
  rooms: ['workshop', 'tg_refinery'], anchor: 'wall', clearance: { front: 1.0 },
  materials: ['metal', 'glass', 'rustSteel', 'emissive', 'bronze'], w: 1.6, d: 0.7, h: 1.6, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.74, 0, sz * 0.28, sx * 0.74, 0.8, sz * 0.28, 0.022, F.col('pipe'), 'metal');
    F.box(0, 0.8, 0, 1.6, 0.04, 0.7, 0, F.col('plate'), 'metal');
    F.box(0, 0.84, -0.34, 1.6, 0.76, 0.02, 0, F.col('plateDark'), 'metal');                                /* the splash plate */
    F.box(-0.55, 0.84, -0.05, 0.36, 0.36, 0.36, 0, F.col('rustDeep'), 'rust');                              /* the little furnace */
    F.box(-0.55, 0.9, 0.131, 0.16, 0.08, 0.004, 0, F.col('flame'), 'glow');
    for (let i = 0; i < 3; i++) { const x = -0.1 + i * 0.26;                                                 /* leach jars of salvaged glass */
      F.cyl(x, 0.84, -0.12, 0.09, 0.3, 0, F.col('glass'), 'glass');
      F.cyl(x, 0.86, -0.12, 0.08, 0.14 + i * 0.04, 0, F.col(['oreCopper', 'lampAmber', 'cellGlow'][i]), 'glass'); }
    F.rod(-0.55, 1.2, -0.05, -0.1, 1.5, -0.2, 0.02, F.col('pipeBright'), 'metal');                           /* the condenser */
    F.rod(-0.1, 1.5, -0.2, 0.52, 1.18, -0.12, 0.02, F.col('pipeBright'), 'metal');
    F.box(0.55, 0.84, 0.18, 0.3, 0.02, 0.18, 0, F.col('brass'), 'bronze');                                    /* the balance */
    F.rod(0.55, 0.86, 0.18, 0.55, 1.02, 0.18, 0.008, F.col('brass'), 'bronze'); F.rod(0.43, 1.02, 0.18, 0.67, 1.02, 0.18, 0.006, F.col('brass'), 'bronze');
  }
});

/* ---------------------------------------------------------------- the power hall and the shafts */
FURN({
  key: 'tungang_court_cell_rack', name: 'Rack of recharged power cells', culture: 'tungang', tier: 'court', type: 'storage', setting: 'indoor', role: 'cells',
  rooms: ['tg_power', 'tg_refinery'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'emissive', 'ceramic', 'rope'], w: 1.4, d: 0.5, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.rod(sx * 0.66, 0, sz * 0.22, sx * 0.66, 1.8, sz * 0.22, 0.022, F.col('pipe'), 'metal');
    F.box(0, 0, -0.24, 1.36, 1.8, 0.02, 0, F.col('plateDark'), 'metal');
    for (let s = 0; s < 4; s++) { const y = 0.1 + s * 0.42;
      F.box(0, y, 0, 1.32, 0.03, 0.44, 0, F.col('plate'), 'metal');
      for (let i = 0; i < 4; i++) { const x = -0.48 + i * 0.32, full = (i + s) % 3 !== 0;                     /* the Ancients' cells: the rarest thing the Tungangs sell */
        F.box(x, y + 0.03, 0, 0.24, 0.26, 0.34, 0, F.col('cellCase'), 'metal');
        F.box(x, y + 0.08, 0.171, 0.04, 0.16, 0.004, 0, F.col(full ? 'cellGlow' : 'hood'), full ? 'glow' : 'metal');
        F.box(x + 0.06, y + 0.2, 0.171, 0.08, 0.05, 0.004, 0, F.col('enamelCream'), 'ceramic'); } }
    F.rod(0.66, 1.7, 0.2, 0.66, 0.3, 0.22, 0.012, F.col('enamelRed'), 'rope');                                /* the charging lead */
  }
});
FURN({
  key: 'tungang_common_rota_board', name: 'The turn rota', culture: 'tungang', tier: 'common', type: 'board', setting: 'indoor', role: 'rota',
  rooms: ['school', 'study', 'hall', 'tg_power', 'tg_signal', 'tg_guard', 'tg_fixers', 'tg_loj'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['ceramic', 'metal'], w: 1.4, d: 0.06, h: 1.0, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.02, 1.4, 1.0, 0.02, 0, F.col('plateDark'), 'metal');
    const C = function (k) { return F.css(F.col(k)); };
    F.decal(0, 0.03, -0.003, 1.34, 0.94, 0, 'tungang-rota', function (g, W, H) {
      const r = FK.paintRng(29);
      g.fillStyle = C('enamelGreen'); g.fillRect(0, 0, W, H);
      const cols = [['enamelRed', 'FURST'], ['lampAmber', 'SECUND'], ['enamelBlue', 'NAIT']];
      g.textAlign = 'center'; g.font = 'bold ' + Math.round(H * 0.08) + 'px monospace';
      for (let i = 0; i < 3; i++) { g.fillStyle = C(cols[i][0]); g.fillRect(W * (0.03 + i * 0.325), H * 0.04, W * 0.3, H * 0.12);
        g.fillStyle = C('enamelCream'); g.fillText(cols[i][1], W * (0.18 + i * 0.325), H * 0.13);
        g.font = Math.round(H * 0.055) + 'px monospace';
        for (let l = 0; l < 9; l++) g.fillText(String(10 + Math.floor(r() * 80)) + '  ' + ['A', 'J', 'M', 'R', 'T', 'W'][Math.floor(r() * 6)] + '.', W * (0.18 + i * 0.325), H * (0.26 + l * 0.08));
        g.font = 'bold ' + Math.round(H * 0.08) + 'px monospace'; }
    }, 'ceramic');
    F.box(0, 0, 0.0, 1.3, 0.04, 0.06, 0, F.col('plate'), 'metal');                                            /* the chalk ledge */
  }
});
FURN({
  key: 'tungang_common_ice_hoist', name: 'The ice hoist over the shaft hatch', culture: 'tungang', tier: 'common', type: 'workstation', setting: 'both', role: 'winch',
  rooms: ['store', 'tg_shaft'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['glass', 'metal', 'rustSteel', 'rope', 'food'], w: 1.6, d: 1.3, h: 2.4, variants: 1,
  build: function (F) {
    F.box(0, 0, 0.05, 1.2, 0.04, 1.0, 0, F.col('plateDark'), 'metal');                                       /* the hatch */
    for (const sx of [-1, 1]) { F.rod(sx * 0.75, 0, -0.55, sx * 0.2, 2.3, 0.05, 0.035, F.col('pipe'), 'metal');
      F.rod(sx * 0.75, 0, 0.62, sx * 0.2, 2.3, 0.05, 0.035, F.col('pipe'), 'metal'); }
    F.rod(-0.3, 2.3, 0.05, 0.3, 2.3, 0.05, 0.04, F.col('pipeBright'), 'metal');
    F.cyl(0, 2.25, 0.05, 0.08, 0.1, 0, F.col('rust'), 'rust');                                               /* the sheave */
    F.rod(0, 2.25, 0.05, 0, 0.75, 0.05, 0.01, F.col('canvasRaw'), 'rope');
    F.frustum(0, 0.3, 0.05, 0.22, 0.28, 0.45, 0, F.col('rust'), 'rust', 10);                                 /* the ice basket, just up */
    for (let i = 0; i < 3; i++) F.box(-0.08 + i * 0.08, 0.75, 0.05, 0.12, 0.12, 0.14, i, F.col('ice'), 'glass');
    F.cyl(-0.55, 0.6, -0.5, 0.14, 0.4, 0, F.col('plate'), 'metal');                                          /* the winch drum */
    F.rod(-0.55, 0.8, -0.5, -0.55, 0.8, -0.2, 0.025, F.col('pipe'), 'metal'); F.rod(-0.55, 0.8, -0.2, -0.55, 1.1, -0.2, 0.02, F.col('enamelRed'), 'metal');
  }
});
FURN({
  key: 'tungang_common_ice_blocks', name: 'Ice blocks in coal moss', culture: 'tungang', tier: 'common', type: 'stack', setting: 'both', role: 'cold',
  rooms: ['tg_shaft', 'tg_bait'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'glass', 'food'], w: 1.2, d: 0.8, h: 0.8, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.2, 0.08, 0.8, 0, F.col('plateDark'), 'metal');
    F.box(0, 0.08, 0, 1.14, 0.1, 0.74, 0, F.col('fungusMat'), 'food');
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3 - j; i++) for (let k = 0; k < 2; k++)
      F.box(-0.36 + i * 0.36 + j * 0.18, 0.18 + j * 0.3, -0.17 + k * 0.34, 0.32, 0.28, 0.3, F.rr(-0.05, 0.05), F.col('ice'), 'glass');
    F.box(0.1, 0.76, 0, 0.6, 0.04, 0.5, 0, F.col('fungusMat'), 'food');                                      /* moss over the top */
  }
});
