/* ======================================================================
   Fellgang furniture: the Tungangs' highland branch on the rim's fells (biomes/riftrim/PLAN.md section 6; LORE.md 6.1
   and 6.20; kits/yeti/PLAN.md section 11, 2026-10-26). A more primitive, militaristic, "punk" Tungang: the union lapsed
   into wildcat bands under a big man (bigun), herding, hunting and raiding Dalab's supply trains. The same salvage of the
   Line gone raw: plate and pipe hammered into shape, bolts left proud, spikes on every edge, hide and fell-beast fur over
   scrap, bone and horn, war trophies (skulls, a Labber's helmet, a Lizard's scale), and slogans painted on plate, half
   remembered. They live in the light, so fire and tallow, not glow-cap. The poor tier is a band's camp under the cave
   mouths, the common a hold, the court the bigun's hall with its seat, trophy wall, feasting board, war standard and the
   band's own rulebook kept by rite.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('fellgang', { name: 'Fellgangs', pack: null, influences: 'the Tungangs gone wild; punk and warband; the fells\' herders and raiders',
  materials: 'raw scrap plate and pipe, proud bolts and spikes, hide and fell-beast fur, bone and horn, war trophies, tallow, fell stone',
  palette: {
    scrap: 0x6e6a62, scrapDark: 0x46443e, rust: 0x8a4a2a, rustBlack: 0x3a2a20, bolt: 0x9a9890, spike: 0xb4b0a6,
    hide: 0xb89a72, hideDark: 0x7a5a3a, fur: 0x5a4a3a, furPale: 0xc8b89a, furBlack: 0x2a2420, woolDun: 0xa8946e,
    bone: 0xe0d4b8, boneOld: 0xc4b48e, horn: 0x4a3e30, timberGrey: 0x7e7466, timberBlack: 0x3e362e,
    paintWhite: 0xd8d0bc, bloodRed: 0x7a1e18, ochre: 0xb07a3a, soot: 0x1e1c1a, stone: 0x7a7670, stoneDark: 0x58544e,
    flame: 0xffa040, ember: 0xd9762c, waxBone: 0xe8dcb4, meat: 0x8a3a30, labberGreen: 0x5a7a4a, lizardScale: 0x4a5a3a
  } });
/* END PALETTE */

/* ---------------------------------------------------------------- poor: a band's camp under the cave mouth */
FURN({
  key: 'fellgang_poor_fur_bed', name: 'Fur heap on a plate pallet', culture: 'fellgang', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'living', 'dormitory'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'hide'], w: 2.0, d: 1.1, h: 0.42, variants: 2, variantNames: ['one sleeper', 'two, head to foot'],
  variantDims: [{ w: 2.0, d: 1.1, h: 0.42 }, { w: 2.0, d: 1.7, h: 0.42 }],
  build: function (F) {
    const D = (F.variant | 0) === 1 ? 1.7 : 1.1;
    F.box(0, 0, 0, 1.9, 0.12, D - 0.1, 0, F.col('scrapDark'), 'metal');                              /* a door of plate off its hinges */
    F.box(0, 0.12, 0, 1.86, 0.08, D - 0.14, 0, F.col('hideDark'), 'leather');
    F.box(0.1, 0.2, 0.02, 1.7, 0.08, D - 0.2, 0, F.pick(['fur', 'furBlack', 'woolDun']), 'fur');
    F.bolster(-0.7, 0.32, 0, D * 0.7, 0.09, F.TAU / 4, F.col('furPale'), 'fur');                    /* the rolled pelt for a pillow */
    F.blob(0.5, 0.3, D * 0.2, 0.3, 0.12, 0.5, F.col('fur'), 'fur');                                  /* a thrown-back pelt */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.ball(sx * 0.9, 0.12, sz * (D / 2 - 0.08), 0.02, F.col('bolt'), 'metal');
  }
});
FURN({
  key: 'fellgang_poor_stool', name: 'Hub stool', culture: 'fellgang', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'barracks', 'yard', 'workshop', 'kitchen'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['metal', 'rustSteel', 'hide', 'bone'], w: 0.5, d: 0.5, h: 0.5, variants: 2, variantNames: ['three pipe legs', 'three bone legs'],
  build: function (F) {
    const bone = (F.variant | 0) === 1;
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.3;
      F.rod(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2, Math.cos(a) * 0.12, 0.4, Math.sin(a) * 0.12, bone ? 0.025 : 0.02, F.col(bone ? 'boneOld' : 'scrap'), bone ? 'bone' : 'metal');
      if (bone) F.ball(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2, 0.035, F.col('boneOld'), 'bone'); }      /* the knuckle ends */
    F.cyl(0, 0.4, 0, 0.2, 0.05, 0, F.col('rust'), 'rust');                                            /* a wheel hub off the Line */
    F.cyl(0, 0.45, 0, 0.17, 0.04, 0, F.col('hide'), 'hide');
    for (let i = 0; i < 6; i++) { const a = i * F.TAU / 6; F.ball(Math.cos(a) * 0.185, 0.45, Math.sin(a) * 0.185, 0.016, F.col('bolt'), 'metal'); }
  }
});
FURN({
  key: 'fellgang_poor_fire_ring', name: 'Fire ring with its spit', culture: 'fellgang', tier: 'poor', type: 'stove', setting: 'both',
  rooms: ['yard', 'living', 'kitchen', 'barracks'], anchor: 'floor', clearance: { front: 0.8, back: 0.8, left: 0.6, right: 0.6 },
  materials: ['stone', 'metal', 'emissive', 'food', 'timber'], w: 1.4, d: 1.1, h: 0.9, variants: 1,
  build: function (F) {
    for (let i = 0; i < 10; i++) { const a = i * F.TAU / 10, s = F.rr(0.09, 0.13);
      F.blob(Math.cos(a) * 0.42, s * 0.4, Math.sin(a) * 0.36, s, s * 0.8, a, F.col(i % 3 ? 'stone' : 'stoneDark'), 'stone'); }
    F.cyl(0, 0, 0, 0.3, 0.03, 0, F.col('soot'), 'stone');
    for (let i = 0; i < 4; i++) { const a = i * 1.7; F.rod(Math.cos(a) * 0.2, 0.03, Math.sin(a) * 0.2, -Math.cos(a) * 0.05, 0.12, -Math.sin(a) * 0.05, 0.03, F.col('timberBlack'), 'wood'); }
    F.cone(0, 0.04, 0, 0.16, 0.24, 0, F.col('flame'), 'glow'); F.cyl(0, 0.03, 0, 0.2, 0.03, 0, F.col('ember'), 'glow');
    for (const sx of [-1, 1]) { F.rod(sx * 0.6, 0, -0.06, sx * 0.6, 0.72, 0, 0.022, F.col('scrap'), 'metal'); F.rod(sx * 0.6, 0, 0.06, sx * 0.6, 0.72, 0, 0.022, F.col('scrap'), 'metal'); }
    F.rod(-0.66, 0.7, 0, 0.66, 0.7, 0, 0.018, F.col('bolt'), 'metal');                                /* the spit, a length of rail rod */
    F.ell(0, 0.62, 0, 0.22, 0.1, 0.11, 0, F.col('meat'), 'food');                                      /* a haunch turning */
    F.box(-0.66, 0.7, 0, 0.02, 0.16, 0.14, 0, F.col('scrapDark'), 'metal');                           /* the crank */
  }
});
FURN({
  key: 'fellgang_poor_meat_rack', name: 'Drying rack of meat and hides', culture: 'fellgang', tier: 'poor', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'kitchen', 'store'], anchor: 'floor', clearance: { front: 0.6, back: 0.6 },
  materials: ['timber', 'metal', 'food', 'hide'], w: 1.8, d: 0.6, h: 1.8, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.rod(sx * 0.85, 0, -0.26, sx * 0.85, 1.75, 0, 0.025, F.col('timberGrey'), 'wood');
      F.rod(sx * 0.85, 0, 0.26, sx * 0.85, 1.75, 0, 0.025, F.col('timberGrey'), 'wood'); }
    F.rod(-0.88, 1.7, 0, 0.88, 1.7, 0, 0.022, F.col('scrap'), 'metal');                               /* a pipe for the ridge */
    F.rod(-0.82, 1.3, 0, 0.82, 1.3, 0, 0.018, F.col('timberGrey'), 'wood');
    for (let i = 0; i < 7; i++) { const x = -0.66 + i * 0.22, L = F.rr(0.25, 0.45);
      F.box(x, 1.7 - L, 0, 0.06, L, 0.012, 0, F.col(i % 2 ? 'meat' : 'bloodRed'), 'food'); }        /* strips of meat */
    F.box(-0.3, 0.5, 0.02, 0.8, 0.8, 0.012, 0.05, F.col('hide'), 'hide');                            /* a hide drying */
    F.box(0.45, 0.6, 0.02, 0.5, 0.7, 0.012, -0.08, F.col('hideDark'), 'hide');
  }
});
FURN({
  key: 'fellgang_poor_hide_sacks', name: 'Hide sacks', culture: 'fellgang', tier: 'poor', type: 'storage', setting: 'both',
  rooms: ['store', 'living', 'yard', 'barracks'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['hide', 'rope'], w: 0.9, d: 0.6, h: 0.7, variants: 1,
  build: function (F) {
    F.ell(-0.2, 0.3, 0, 0.24, 0.3, 0.22, 0, F.col('hide'), 'leather');
    F.cyl(-0.2, 0.55, 0, 0.1, 0.12, 0, F.col('hideDark'), 'leather'); F.cyl(-0.2, 0.6, 0, 0.11, 0.025, 0, F.col('timberBlack'), 'rope');
    F.ell(0.25, 0.22, 0.04, 0.2, 0.22, 0.2, 0.4, F.col('hideDark'), 'leather');
    F.cyl(0.25, 0.4, 0.04, 0.08, 0.1, 0, F.col('hide'), 'leather'); F.cyl(0.25, 0.44, 0.04, 0.09, 0.025, 0, F.col('timberBlack'), 'rope');
    F.box(-0.2, 0.25, 0.215, 0.14, 0.14, 0.01, 0, F.col('paintWhite'), 'leather');                   /* the band's mark, daubed */
  }
});
FURN({
  key: 'fellgang_poor_tallow_lamp', name: 'Tallow lamp in a helmet shell', culture: 'fellgang', tier: 'poor', type: 'lamp', setting: 'indoor',
  rooms: ['living', 'bedroom', 'barracks', 'hall', 'shrine'], anchor: 'surface', clearance: {},
  materials: ['metal', 'food', 'emissive'], w: 0.3, d: 0.3, h: 0.24, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.08, 0.03, 0, F.col('scrapDark'), 'metal');                                        /* the foot, a pipe collar */
    F.frustum(0, 0.03, 0, 0.09, 0.14, 0.08, 0, F.col('rust'), 'metal', 12);                            /* the upturned helmet */
    F.cyl(0, 0.1, 0, 0.13, 0.012, 0, F.col('waxBone'), 'food');                                         /* the tallow */
    F.rod(0.02, 0.1, 0, 0.03, 0.15, 0, 0.005, F.col('soot'), 'metal');
    F.cone(0.03, 0.15, 0, 0.022, 0.08, 0, F.col('flame'), 'glow');
  }
});
FURN({
  key: 'fellgang_poor_windbreak', name: 'Hide windbreak on a scrap frame', culture: 'fellgang', tier: 'poor', type: 'screen', setting: 'both',
  rooms: ['yard', 'living', 'barracks', 'bedroom'], anchor: 'floor', clearance: { front: 0.3, back: 0.3 },
  materials: ['metal', 'hide', 'rope'], w: 2.0, d: 0.3, h: 1.6, variants: 1,
  build: function (F) {
    for (let p = 0; p < 2; p++) { const x = -0.5 + p * 1.0, ry = (p ? -1 : 1) * 0.2;
      for (const sx of [-1, 1]) F.rod(x + sx * 0.46 * Math.cos(ry), 0, -sx * 0.46 * Math.sin(ry), x + sx * 0.46 * Math.cos(ry), 1.55, -sx * 0.46 * Math.sin(ry), 0.02, F.col('scrap'), 'metal');
      F.box(x, 0.15, 0, 0.88, 1.35, 0.012, ry, F.col(p ? 'hideDark' : 'hide'), 'hide');
      for (let k = 0; k < 4; k++) F.box(x, 0.3 + k * 0.38, 0.0, 0.94, 0.012, 0.03, ry, F.col('timberBlack'), 'rope'); }   /* the lacing */
  }
});

/* ---------------------------------------------------------------- common: a band's hold */
FURN({
  key: 'fellgang_common_plate_table', name: 'Plate table on bolted legs', culture: 'fellgang', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['hall', 'living', 'kitchen', 'barracks', 'tavern'], anchor: 'floor', clearance: { front: 0.7, back: 0.7 },
  materials: ['metal', 'rustSteel', 'bone', 'food'], w: 1.6, d: 0.8, h: 0.9, variants: 1,
  build: function (F) {
    F.box(0, 0.68, 0, 1.6, 0.05, 0.8, 0, F.col('rust'), 'rust');
    F.box(-0.3, 0.73, -0.1, 0.7, 0.008, 0.5, 0.05, F.col('scrap'), 'metal');                          /* a patch plate, bolted over a hole */
    for (let i = 0; i < 6; i++) F.ball(-0.62 + i * 0.25, 0.7, 0.4, 0.016, F.col('bolt'), 'metal');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { F.rod(sx * 0.68, 0, sz * 0.32, sx * 0.7, 0.68, sz * 0.34, 0.03, F.col('scrapDark'), 'metal');
      F.cone(sx * 0.7, 0.73, sz * 0.34, 0.025, 0.14, 0, F.col('spike'), 'metal'); }                 /* a spike on every corner */
    F.ell(0.2, 0.76, 0.05, 0.15, 0.04, 0.1, 0.3, F.col('meat'), 'food');
    F.rod(0.45, 0.74, -0.1, 0.62, 0.74, 0.1, 0.02, F.col('bone'), 'bone');                            /* a gnawed bone */
    F.frustum(-0.5, 0.73, 0.15, 0.04, 0.06, 0.14, 0, F.col('horn'), 'bone', 8);                         /* a drinking horn's cup */
  }
});
FURN({
  key: 'fellgang_common_bench', name: 'Spiked bench', culture: 'fellgang', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['hall', 'barracks', 'yard', 'living', 'tavern'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'hide'], w: 1.8, d: 0.45, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0.38, 0, 1.8, 0.05, 0.42, 0, F.col('scrap'), 'metal');
    F.box(0, 0.43, 0, 1.6, 0.04, 0.38, 0, F.col('hide'), 'hide');
    for (const sx of [-1, 1]) { F.box(sx * 0.75, 0, 0, 0.08, 0.38, 0.38, 0, F.col('scrapDark'), 'metal');
      F.cone(sx * 0.86, 0.38, 0, 0.03, 0.24, 0, F.col('spike'), 'metal');
      for (const y of [0.1, 0.28]) F.ball(sx * 0.795, y, 0.12, 0.016, F.col('bolt'), 'metal'); }
  }
});
FURN({
  key: 'fellgang_common_trophy_pole', name: 'Trophy pole', culture: 'fellgang', tier: 'common', type: 'monument', setting: 'both',
  rooms: ['yard', 'hall', 'street', 'plaza', 'barracks'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.4, right: 0.4 },
  materials: ['metal', 'bone', 'stone', 'hide'], w: 0.9, d: 0.7, h: 2.6, variants: 2, variantNames: ['beast skulls', "a Labber's helmet and a Lizard's scale"],
  build: function (F) {
    const v = F.variant | 0;
    for (let i = 0; i < 5; i++) { const a = i * F.TAU / 5; F.blob(Math.cos(a) * 0.2, 0.07, Math.sin(a) * 0.18, 0.1, 0.14, a, F.col('stone'), 'stone'); }   /* the cairn it stands in */
    F.rod(0, 0, 0, 0, 2.3, 0, 0.04, F.col('scrap'), 'metal');
    F.rod(-0.35, 1.9, 0, 0.35, 1.9, 0, 0.025, F.col('scrap'), 'metal');                                /* the crossbar */
    F.cone(0, 2.3, 0, 0.035, 0.28, 0, F.col('spike'), 'metal');
    F.ball(0, 2.15, 0.02, 0.1, F.col('bone'), 'bone'); F.ell(0, 2.12, 0.1, 0.05, 0.05, 0.08, 0, F.col('boneOld'), 'bone');   /* the topmost skull */
    for (const sx of [-1, 1]) F.box(sx * 0.035, 2.17, 0.1, 0.03, 0.03, 0.01, 0, F.col('soot'), 'bone');
    if (v === 0) {
      for (const sx of [-1, 1]) { F.ell(sx * 0.3, 1.74, 0.04, 0.07, 0.1, 0.1, 0, F.col('bone'), 'bone');      /* beasts' skulls hung from the bar */
        F.rod(sx * 0.3, 1.82, 0, sx * 0.42, 1.98, -0.02, 0.022, F.col('horn'), 'bone'); F.rod(sx * 0.3, 1.82, 0, sx * 0.18, 1.98, -0.02, 0.022, F.col('horn'), 'bone'); }
      F.ell(0, 1.3, 0.05, 0.08, 0.11, 0.12, 0, F.col('boneOld'), 'bone');
    } else {
      F.dome(-0.3, 1.66, 0.0, 0.13, 0.12, 0, F.col('labberGreen'), 'metal');                         /* a Labber's helmet */
      F.box(-0.3, 1.64, 0.0, 0.27, 0.03, 0.27, 0, F.col('scrapDark'), 'metal');
      for (let k = 0; k < 3; k++) F.box(0.3, 1.5 + k * 0.1, 0.01, 0.2 - k * 0.04, 0.09, 0.02, 0, F.shade('lizardScale', k * 0.08), 'hide');   /* a Lizard's scale plates */
      F.box(0, 1.1, 0.05, 0.3, 0.4, 0.012, 0, F.col('hide'), 'hide');
    }
    F.box(0, 0.7, 0.045, 0.2, 0.3, 0.01, 0, F.col('bloodRed'), 'metal');                             /* the band's mark */
  }
});
FURN({
  key: 'fellgang_common_slogan_plate', name: 'Slogan plate', culture: 'fellgang', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'barracks', 'yard', 'street', 'living'], anchor: 'wall', clearance: { front: 0.4 },
  materials: ['rustSteel', 'metal'], w: 1.3, d: 0.06, h: 0.7, variants: 2, variantNames: ['NO SKABS', 'T FELL IZ US'],
  build: function (F) {
    const v = F.variant | 0;
    F.box(0, 0, -0.025, 1.3, 0.7, 0.02, 0, F.col('rust'), 'rust');
    for (const [x, y] of [[-0.6, 0.62], [0.6, 0.62], [-0.6, 0.08], [0.6, 0.08], [0, 0.65]]) F.ball(x, y, -0.01, 0.02, F.col('bolt'), 'metal');
    const white = F.css(F.col('paintWhite')), red = F.css(F.col('bloodRed')), soot = F.css(F.col('soot')), rust = F.css(F.col('rust'));
    F.decal(0, 0.04, -0.012, 1.2, 0.62, 0, 'fellgang-slogan-' + v, function (g, W, H) {
      const r = FK.paintRng(29 + v);
      g.fillStyle = rust; g.fillRect(0, 0, W, H);
      g.fillStyle = soot; for (let i = 0; i < 10; i++) g.fillRect(r() * W, r() * H, W * (0.04 + r() * 0.1), H * (0.02 + r() * 0.08));
      g.fillStyle = v ? white : red; g.font = 'bold ' + Math.round(H * 0.32) + 'px sans-serif'; g.textAlign = 'center';
      g.save(); g.translate(W / 2, H * 0.62); g.rotate(-0.06); g.fillText(v ? 'T FELL IZ US' : 'NO SKABS', 0, 0); g.restore();
      g.fillStyle = white; g.font = 'bold ' + Math.round(H * 0.12) + 'px sans-serif'; g.fillText(v ? 'NOBGA BIGUN SEZ' : 'STRAK! STRAK!', W / 2, H * 0.9);
      g.fillStyle = rust; for (let i = 0; i < 24; i++) g.fillRect(r() * W, r() * H, W * (0.005 + r() * 0.03), H * (0.01 + r() * 0.04));   /* half of it rusted through */
    }, 'rust');
  }
});
FURN({
  key: 'fellgang_common_chest', name: 'Spiked scrap chest', culture: 'fellgang', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['living', 'bedroom', 'store', 'hall', 'barracks'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['metal', 'rustSteel', 'hide', 'bone'], w: 1.0, d: 0.55, h: 0.72, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.0, 0.5, 0.55, 0, F.col('scrapDark'), 'metal');
    F.box(0, 0.5, 0, 1.0, 0.06, 0.55, 0, F.col('rust'), 'rust');
    F.box(0, 0.56, 0.02, 0.9, 0.04, 0.5, 0, F.col('furBlack'), 'fur');                                /* a pelt thrown over the lid */
    for (const sx of [-1, 1]) F.cone(sx * 0.46, 0.56, 0.22, 0.025, 0.16, 0, F.col('spike'), 'metal');
    for (let i = 0; i < 5; i++) for (const y of [0.06, 0.44]) F.ball(-0.4 + i * 0.2, y, 0.275, 0.018, F.col('bolt'), 'metal');
    F.ell(0, 0.28, 0.28, 0.06, 0.07, 0.03, 0, F.col('bone'), 'bone');                                  /* a jawbone for the hasp */
    F.box(0.28, 0.2, 0.276, 0.26, 0.14, 0.006, 0, F.col('paintWhite'), 'metal');
  }
});
FURN({
  key: 'fellgang_common_war_drum', name: 'War drum', culture: 'fellgang', tier: 'common', type: 'art', setting: 'both',
  rooms: ['hall', 'yard', 'barracks', 'plaza'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['rustSteel', 'hide', 'bone', 'metal'], w: 0.8, d: 0.8, h: 1.1, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.3, 0.86, 0, F.col('rust'), 'rust');                                              /* an oil drum, the hide stretched over it */
    for (const y of [0.15, 0.7]) F.cyl(0, y, 0, 0.306, 0.025, 0, F.col('rustBlack'), 'rust');
    F.cyl(0, 0.86, 0, 0.31, 0.03, 0, F.col('hide'), 'hide');
    for (let i = 0; i < 10; i++) { const a = i * F.TAU / 10; F.rod(Math.cos(a) * 0.31, 0.88, Math.sin(a) * 0.31, Math.cos(a) * 0.305, 0.55, Math.sin(a) * 0.305, 0.006, F.col('hideDark'), 'hide'); }   /* the lacing */
    F.box(0, 0.35, 0.3, 0.26, 0.2, 0.01, 0, F.col('paintWhite'), 'metal');                           /* a skull daubed in white */
    for (const sx of [-1, 1]) F.rod(sx * 0.12, 0.89, 0.12, sx * 0.3, 1.08, 0.3, 0.02, F.col('bone'), 'bone');   /* thighbone beaters */
  }
});
FURN({
  key: 'fellgang_common_tanning_frame', name: 'Tanning frame', culture: 'fellgang', tier: 'common', type: 'workstation', setting: 'outdoor', job: 'tanning',
  rooms: ['yard', 'workshop'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'metal', 'hide', 'rope', 'bone'], w: 1.8, d: 0.7, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.rod(sx * 0.8, 0, -0.1, sx * 0.8, 1.85, -0.2, 0.03, F.col('timberGrey'), 'wood');
      F.rod(sx * 0.8, 0, 0.3, sx * 0.8, 1.2, -0.12, 0.025, F.col('timberGrey'), 'wood'); }            /* the props */
    F.rod(-0.86, 1.8, -0.19, 0.86, 1.8, -0.19, 0.025, F.col('scrap'), 'metal');
    F.rod(-0.8, 0.2, -0.11, 0.8, 0.2, -0.11, 0.025, F.col('timberGrey'), 'wood');
    F.beam(0, 0.3, -0.12, 0, 1.7, -0.18, 1.3, 0.012, F.col('hide'), 'hide');                         /* the hide, laced out */
    for (let i = 0; i < 8; i++) { const y = 0.3 + i * 0.2; F.rod(-0.78, y, -0.12, -0.65, y, -0.13, 0.005, F.col('hideDark'), 'rope'); F.rod(0.65, y, -0.13, 0.78, y, -0.12, 0.005, F.col('hideDark'), 'rope'); }
    F.box(0, 0, 0.18, 0.5, 0.24, 0.3, 0, F.col('rust'), 'metal');                                     /* the bark-and-urine tub, a cut drum */
    F.rod(0.4, 0.02, 0.2, 0.55, 0.3, 0.25, 0.015, F.col('bone'), 'bone');                              /* a bone scraper */
  }
});
FURN({
  key: 'fellgang_common_brazier', name: 'Spiked drum brazier', culture: 'fellgang', tier: 'common', type: 'brazier', setting: 'both',
  rooms: ['hall', 'yard', 'barracks', 'street', 'plaza'], anchor: 'floor', clearance: { front: 0.7, back: 0.7, left: 0.7, right: 0.7 },
  materials: ['rustSteel', 'metal', 'emissive'], w: 0.7, d: 0.7, h: 1.25, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3, Math.cos(a) * 0.2, 0.4, Math.sin(a) * 0.2, 0.025, F.col('scrapDark'), 'metal'); }
    F.cyl(0, 0.4, 0, 0.26, 0.5, 0, F.col('rust'), 'rust');
    for (let i = 0; i < 8; i++) { const a = i * F.TAU / 8; F.box(Math.cos(a) * 0.255, 0.5 + (i % 2) * 0.16, Math.sin(a) * 0.255, 0.05, 0.1, 0.02, -a + F.TAU / 4, F.col('ember'), 'glow');   /* the punched holes */
      F.cone(Math.cos(a) * 0.24, 0.9, Math.sin(a) * 0.24, 0.025, 0.2, 0, F.col('spike'), 'metal'); }   /* spikes round the rim */
    F.cyl(0, 0.86, 0, 0.23, 0.04, 0, F.col('ember'), 'glow');
    F.cone(0, 0.88, 0, 0.18, 0.36, 0, F.col('flame'), 'glow');
  }
});
FURN({
  key: 'fellgang_common_bed', name: 'Raised bed with a bone headboard', culture: 'fellgang', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['metal', 'rustSteel', 'hide', 'bone', 'cloth'], w: 1.4, d: 2.1, h: 1.2, variants: 1,
  build: function (F) {
    F.box(0, 0, 0.02, 1.36, 0.35, 2.0, 0, F.col('scrap'), 'metal');
    F.box(0, 0.35, 0.03, 1.3, 0.1, 1.96, 0, F.col('woolDun'), 'cloth');                               /* the wool-stuffed pallet */
    F.box(0, 0.45, 0.25, 1.32, 0.07, 1.4, 0, F.pick(['fur', 'furBlack']), 'fur');
    F.box(0, 0.45, -0.78, 1.0, 0.12, 0.34, 0, F.col('furPale'), 'fur');
    F.box(0, 0, -1.03, 1.4, 1.0, 0.04, 0, F.col('rust'), 'rust');                                     /* the headboard plate */
    for (let i = 0; i < 7; i++) { const x = -0.6 + i * 0.2;                                           /* ribs and long bones lashed upright */
      F.rod(x, 0.6, -0.99, x + (i % 2 ? 0.02 : -0.02), 1.18, -0.99, 0.02, F.col(i % 2 ? 'bone' : 'boneOld'), 'bone'); }
    F.rod(-0.68, 0.98, -0.97, 0.68, 0.98, -0.97, 0.015, F.col('hideDark'), 'hide');
    for (const sx of [-1, 1]) F.cone(sx * 0.68, 1.0, -1.02, 0.02, 0.2, 0, F.col('spike'), 'metal');
  }
});

/* ---------------------------------------------------------------- court: the bigun's hall */
FURN({
  key: 'fellgang_court_bigun_seat', name: "The bigun's seat", culture: 'fellgang', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'wall', clearance: { front: 1.3 },
  materials: ['metal', 'rustSteel', 'hide', 'bone'], w: 1.4, d: 1.0, h: 2.1, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.2, 0.42, 0.9, 0, F.col('scrapDark'), 'metal');
    for (let i = 0; i < 6; i++) F.ball(-0.5 + i * 0.2, 0.36, 0.45, 0.02, F.col('bolt'), 'metal');
    F.box(0, 0.42, 0.05, 1.04, 0.1, 0.8, 0, F.col('fur'), 'fur');
    F.box(0, 0.1, 0.45, 0.9, 0.36, 0.03, 0, F.col('fur'), 'fur');                                    /* the pelt hanging down the front */
    F.box(0, 0.42, -0.45, 1.2, 1.3, 0.1, 0, F.col('rust'), 'rust');                                  /* the back: plates welded on plates */
    F.box(-0.25, 0.7, -0.39, 0.5, 0.5, 0.02, 0.04, F.col('scrap'), 'metal');
    F.box(0.22, 1.05, -0.39, 0.6, 0.42, 0.02, -0.03, F.col('scrapDark'), 'metal');
    for (let i = 0; i < 7; i++) F.cone(-0.54 + i * 0.18, 1.72, -0.45, 0.035, 0.2, 0, F.col('spike'), 'metal');
    F.ball(0, 1.8, -0.38, 0.11, F.col('bone'), 'bone'); F.ell(0, 1.76, -0.28, 0.06, 0.06, 0.08, 0, F.col('boneOld'), 'bone');   /* the horned skull */
    for (const sx of [-1, 1]) { F.box(sx * 0.04, 1.82, -0.28, 0.035, 0.035, 0.01, 0, F.col('soot'), 'bone');
      F.rod(sx * 0.08, 1.86, -0.4, sx * 0.4, 2.06, -0.38, 0.03, F.col('horn'), 'bone');
      F.box(sx * 0.6, 0.42, 0, 0.14, 0.32, 0.8, 0, F.col('scrapDark'), 'metal');                    /* the arms */
      F.box(sx * 0.6, 0.74, 0, 0.16, 0.04, 0.82, 0, F.col('hideDark'), 'hide');
      F.rod(sx * 0.6, 0.66, 0.4, sx * 0.6, 0.66, 0.5, 0.02, F.col('spike'), 'metal'); }
  }
});
FURN({
  key: 'fellgang_court_trophy_wall', name: 'Trophy wall', culture: 'fellgang', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['hall', 'court', 'barracks'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['rustSteel', 'metal', 'bone', 'hide'], w: 1.6, d: 0.3, h: 1.0, variants: 1,
  build: function (F) {
    F.box(0, 0, -0.135, 1.6, 1.0, 0.03, 0, F.col('rust'), 'rust');
    for (const [x, y] of [[-0.74, 0.92], [0.74, 0.92], [-0.74, 0.08], [0.74, 0.08]]) F.ball(x, y, -0.115, 0.02, F.col('bolt'), 'metal');
    for (const sx of [-1, 1]) F.rod(sx * 0.7, 0.1, -0.1, -sx * 0.7, 0.9, -0.1, 0.018, F.col('scrap'), 'metal');   /* two spears crossed behind */
    F.ell(0, 0.6, -0.04, 0.1, 0.1, 0.1, 0, F.col('bone'), 'bone'); F.ell(0, 0.55, 0.06, 0.05, 0.05, 0.06, 0, F.col('boneOld'), 'bone');   /* a fell beast's skull */
    for (const sx of [-1, 1]) F.rod(sx * 0.07, 0.66, -0.06, sx * 0.34, 0.86, -0.08, 0.025, F.col('horn'), 'bone');
    F.dome(-0.5, 0.36, -0.04, 0.13, 0.12, 0, F.col('labberGreen'), 'metal');                          /* a Labber's helmet */
    F.box(-0.5, 0.33, -0.04, 0.27, 0.03, 0.2, 0, F.col('scrapDark'), 'metal');
    for (let k = 0; k < 4; k++) F.box(0.5, 0.25 + k * 0.1, -0.1, 0.24 - k * 0.04, 0.09, 0.02, 0, F.shade('lizardScale', k * 0.06), 'hide');   /* a Lizard's scales */
    F.box(0.5, 0.65, -0.11, 0.34, 0.2, 0.01, 0, F.col('bloodRed'), 'metal');
    F.box(-0.5, 0.65, -0.11, 0.3, 0.24, 0.012, 0, F.col('hide'), 'hide');                             /* a scalp of fur */
  }
});
FURN({
  key: 'fellgang_court_feast_board', name: 'Feasting board', culture: 'fellgang', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'tavern'], anchor: 'floor', clearance: { front: 0.8, back: 0.8 },
  materials: ['metal', 'rustSteel', 'food', 'bone', 'hide'], w: 3.0, d: 1.0, h: 0.95, variants: 1,
  build: function (F) {
    for (const x of [-1.15, 0, 1.15]) { F.cyl(x, 0, 0, 0.28, 0.68, 0, F.col('rust'), 'rust');          /* drums for trestles */
      F.cyl(x, 0.3, 0, 0.286, 0.025, 0, F.col('rustBlack'), 'rust'); }
    F.box(0, 0.68, 0, 3.0, 0.05, 1.0, 0, F.col('scrap'), 'metal');
    F.box(0, 0.73, 0, 2.6, 0.01, 0.4, 0, F.col('hide'), 'hide');                                       /* a hide runner */
    F.ell(-0.6, 0.83, 0, 0.3, 0.1, 0.16, 0.2, F.col('meat'), 'food');                                    /* the champion's haunch */
    F.rod(-0.92, 0.84, 0, -0.98, 0.84, 0.02, 0.025, F.col('bone'), 'bone');
    F.cyl(0.4, 0.74, 0.1, 0.2, 0.03, 0, F.col('scrapDark'), 'metal');
    for (const [x, z] of [[0.36, 0.08], [0.46, 0.13]]) F.ell(x, 0.8, z, 0.06, 0.04, 0.05, 0, F.col('bloodRed'), 'food');
    for (const [x, z] of [[1.1, -0.25], [-1.2, 0.3], [0.9, 0.3], [-0.1, -0.3]]) F.frustum(x, 0.73, z, 0.035, 0.055, 0.16, 0, F.col('horn'), 'bone', 8);   /* horn cups */
    for (let i = 0; i < 4; i++) F.cone(-1.35 + i * 0.9, 0.73, -0.47, 0.02, 0.2, 0, F.col('spike'), 'metal');
  }
});
FURN({
  key: 'fellgang_court_war_standard', name: 'War standard', culture: 'fellgang', tier: 'court', type: 'banner', setting: 'both',
  rooms: ['hall', 'court', 'yard', 'plaza', 'barracks'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['metal', 'hide', 'bone', 'stone'], w: 1.2, d: 0.6, h: 3.0, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.26, 0.24, 0, F.col('stoneDark'), 'stone');                                       /* the socket stone */
    F.rod(0, 0.2, 0, 0, 2.75, 0, 0.035, F.col('scrap'), 'metal');
    F.rod(-0.52, 2.55, 0, 0.52, 2.55, 0, 0.025, F.col('scrap'), 'metal');
    F.box(0, 1.25, 0.03, 0.98, 1.28, 0.012, 0, F.col('hide'), 'hide');                                /* the hide, hung from the bar */
    const white = F.css(F.col('paintWhite')), red = F.css(F.col('bloodRed')), hide = F.css(F.col('hide')), soot = F.css(F.col('soot'));
    F.decal(0, 1.3, 0.046, 0.9, 1.18, 0, 'fellgang-standard', function (g, W, H) {
      g.fillStyle = hide; g.fillRect(0, 0, W, H);
      g.fillStyle = red; g.beginPath(); g.arc(W / 2, H * 0.42, W * 0.32, 0, Math.PI * 2); g.fill();     /* a red sun, and a broken wheel on it */
      g.strokeStyle = soot; g.lineWidth = W * 0.04; g.beginPath(); g.arc(W / 2, H * 0.42, W * 0.22, 0.6, Math.PI * 2 - 0.3); g.stroke();
      for (let i = 0; i < 5; i++) { const a = i * 1.1 + 0.3; g.beginPath(); g.moveTo(W / 2, H * 0.42); g.lineTo(W / 2 + Math.cos(a) * W * 0.22, H * 0.42 + Math.sin(a) * W * 0.22); g.stroke(); }
      g.fillStyle = white; g.font = 'bold ' + Math.round(H * 0.1) + 'px sans-serif'; g.textAlign = 'center'; g.fillText('WILDKAT', W / 2, H * 0.86);
    }, 'hide');
    F.ball(0, 2.85, 0, 0.11, F.col('bone'), 'bone');                                                    /* a skull on the spike */
    F.cone(0, 2.75, 0, 0.03, 0.25, 0, F.col('spike'), 'metal');
    for (const sx of [-1, 1]) { F.rod(sx * 0.08, 2.9, 0, sx * 0.3, 2.98, 0.02, 0.025, F.col('horn'), 'bone');
      for (let k = 0; k < 3; k++) F.rod(sx * 0.52, 2.55, 0, sx * (0.5 - k * 0.03), 2.2 - k * 0.1, 0.02, 0.006, F.col('hideDark'), 'hide'); }   /* tails and thongs */
  }
});
FURN({
  key: 'fellgang_court_rulebook', name: "The band's own rulebook", culture: 'fellgang', tier: 'court', type: 'shrine', setting: 'indoor',
  rooms: ['hall', 'shrine', 'court'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['metal', 'rustSteel', 'hide', 'bone', 'food', 'emissive'], w: 1.1, d: 0.3, h: 1.9, variants: 1,
  build: function (F) {
    F.shift(0, 0.05);
    F.box(0, 0, -0.18, 1.1, 1.9, 0.04, 0, F.col('rust'), 'rust');                                   /* a plate door from the Line */
    F.box(0, 0.8, -0.155, 0.8, 0.8, 0.01, 0, F.col('scrap'), 'metal');
    for (let i = 0; i < 6; i++) { const x = -0.28 + (i % 3) * 0.28, y = 0.86 + Math.floor(i / 3) * 0.36;   /* the rules: hide leaves nailed on */
      F.box(x, y, -0.145, 0.22, 0.3, 0.008, F.rr(-0.06, 0.06), F.col(i % 2 ? 'hide' : 'hideDark'), 'hide');
      F.ball(x, y + 0.27, -0.138, 0.012, F.col('bolt'), 'metal'); }
    F.ball(0, 1.72, -0.08, 0.1, F.col('bone'), 'bone');                                               /* a skull over them */
    for (const sx of [-1, 1]) F.box(sx * 0.035, 1.74, 0.01, 0.03, 0.03, 0.01, 0, F.col('soot'), 'bone');
    F.box(0, 0.45, -0.06, 0.9, 0.04, 0.24, 0, F.col('scrapDark'), 'metal');                             /* the ledge */
    for (const sx of [-1, 1]) { F.frustum(sx * 0.3, 0.49, -0.06, 0.05, 0.07, 0.05, 0, F.col('rust'), 'metal', 10);
      F.cyl(sx * 0.3, 0.54, -0.06, 0.065, 0.01, 0, F.col('waxBone'), 'food'); F.cone(sx * 0.3, 0.55, -0.06, 0.015, 0.06, 0, F.col('flame'), 'glow'); }
    F.rod(-0.4, 0.2, -0.155, 0.4, 0.2, -0.155, 0.02, F.col('scrap'), 'metal');
  }
});
