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
    seatBlue: 0x3a4a6a, seatWhite: 0xc8c8c0
  } });
/* END PALETTE */

/* ---------------------------------------------------------------- poor: the galleries */
FURN({
  key: 'tungang_poor_gallery_bunk', name: 'Gallery bunks', culture: 'tungang', tier: 'poor', type: 'bed', setting: 'indoor',
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
  rooms: ['dormitory', 'kitchen', 'living', 'workshop', 'barracks'], anchor: 'floor', clearance: { front: 0.5 },
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
  key: 'tungang_common_fungus_trays', name: 'Glow-cap trays', culture: 'tungang', tier: 'common', type: 'rack', setting: 'indoor', job: 'fungiculture',
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
  rooms: ['hall', 'court'], anchor: 'floor', clearance: { front: 1.2 },
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
  key: 'tungang_court_lift_gear', name: 'The lift gear, kept by rite', culture: 'tungang', tier: 'court', type: 'shrine', setting: 'indoor',
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
