/* ======================================================================
   Talovolci furniture: the tall folk of the southern highlands (LORE.md 6.21; kits/yeti/PLAN.md section 11,
   2026-10-26). Gaulish. Two-armed giants of 2.3 to 2.6 m, so every piece here is drawn at their size, about 1.4 times
   a human's: a seat at 0.62 m, a bed 2.9 m long, a loom 2.6 m tall. Roundhouse furniture: benches curved round the
   hearth, the bronze cauldron on its chain and the ram-headed firedogs, wickerwork (baskets, wattle stalls), oak chests
   bound in iron, checked and striped wool in weld-yellow, woad-blue and madder-red, fleeces; the feasting board with the
   champion's portion and the bronze flagon; the -rix's seat, an oak figure wearing its gold torc, the learned order's
   bronze calendar, the champions' shields. The spiral is on everything, and every spiral turns the same way, as the
   forest's plants do (LORE.md 6.21): TALOVOLCI_FX.spiral draws them all one way, outward clockwise as seen from in front
   (or from above). The poor tier is a hamlet's roundhouse, the common a farmstead's, the court a chief's hall.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('talovolci', { name: 'Talovolci', pack: null, influences: 'Gaulish and the ancient Celts (La Tene); Izani loans from the Legion; giant scale',
  materials: 'oak and ash, wicker, wattle and daub, checked wool, fleece and hide, bronze, iron, gold torcs, fired clay, straw',
  palette: {
    oak: 0x8a6a46, oakDark: 0x5a4430, oakPale: 0xb09a74, wicker: 0xa88a5a, wickerDark: 0x7a6040, straw: 0xc8b070,
    weld: 0xd8b838, woad: 0x34508a, madder: 0xa83a2a, woolUndyed: 0xd8ccb0, woolBrown: 0x6a5440, fleece: 0xe0d6c0,
    hide: 0xb89870, bronze: 0xa87a3a, bronzeDark: 0x6e5228, gold: 0xd8a838, iron: 0x3e3a36,
    stone: 0x8a8478, clayDaub: 0xa86a48, clayPot: 0x9a5a3a, ashCold: 0x8a8680, flame: 0xffa040, ember: 0xd9762c,
    bread: 0xc89858, meat: 0x8a3a30, mead: 0xc89a30, flour: 0xe8e0cc
  } });
/* END PALETTE */
/* the spiral, the one way (outward clockwise, seen from in front for axis 'z', from above for axis 'y'); a tube of radius
   r through a flat spiral of `turns` turns out to radius R, on the plane z = c (axis 'z', centre (a, b)) or y = b (axis 'y',
   centre (a, c)). And the triskele: three spirals round a point. */
const TALOVOLCI_FX = {
  spiral: function (F, a, b, c, R, turns, r, col, fam, axis) {
    const n = Math.max(12, Math.round(turns * 18)), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, rad = R * (0.1 + 0.9 * t), an = t * turns * F.TAU;
      pts.push(axis === 'y' ? [a + Math.cos(an) * rad, b, c + Math.sin(an) * rad] : [a + Math.cos(-an) * rad, b + Math.sin(-an) * rad, c]); }
    F.tube(pts, r, col, fam, { seg: 6 });
  },
  triskele: function (F, a, b, c, R, r, col, fam) {
    for (let k = 0; k < 3; k++) { const an = k * F.TAU / 3 + F.TAU / 4; TALOVOLCI_FX.spiral(F, a + Math.cos(an) * R * 0.5, b + Math.sin(an) * R * 0.5, c, R * 0.5, 1.4, r, col, fam, 'z'); }
  },
  check: function (g, W, H, ground, a, b, n) {   /* a woven check: a ground, bands of a across, bands of b down, their crossings darker */
    g.fillStyle = ground; g.fillRect(0, 0, W, H);
    g.globalAlpha = 0.85; g.fillStyle = a;
    for (let i = 0; i < n; i++) g.fillRect(0, (i + 0.25) * H / n, W, H / n * 0.3);
    g.fillStyle = b; for (let i = 0; i < n; i++) g.fillRect((i + 0.6) * W / n, 0, W / n * 0.18, H);
    g.globalAlpha = 1;
  }
};

/* ---------------------------------------------------------------- poor: a hamlet's roundhouse */
FURN({
  key: 'talovolci_poor_bed', name: 'Straw bed in log sides', culture: 'talovolci', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living', 'cottage'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'thatch', 'hide', 'cloth'], w: 1.4, d: 2.9, h: 0.62, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.rod(sx * 0.58, 0.12, -1.38, sx * 0.58, 0.12, 1.38, 0.12, F.col('oakDark'), 'wood');   /* split logs for sides */
    for (const sz of [-1, 1]) F.rod(-0.58, 0.1, sz * 1.36, 0.58, 0.1, sz * 1.36, 0.1, F.col('oakDark'), 'wood');
    F.box(0, 0.05, 0, 1.06, 0.26, 2.6, 0, F.col('straw'), 'thatch');
    F.box(0, 0.31, 0.2, 1.1, 0.07, 2.0, 0, F.col('fleece'), 'fur');
    F.box(0, 0.38, 0.45, 1.14, 0.05, 1.5, 0, F.pick(['weld', 'madder', 'woolBrown']), 'cloth');
    for (let i = 0; i < 5; i++) F.box(0, 0.43, -0.2 + i * 0.3, 1.14, 0.006, 0.08, 0, F.col(i % 2 ? 'woad' : 'woolUndyed'), 'cloth');   /* the stripes across */
    F.bolster(0, 0.47, -1.08, 0.9, 0.13, 0, F.col('woolUndyed'), 'cloth');
  }
});
FURN({
  key: 'talovolci_poor_stool', name: 'Three-legged stool', culture: 'talovolci', tier: 'poor', type: 'chair', setting: 'both',
  rooms: ['living', 'cottage', 'kitchen', 'workshop', 'yard', 'hall'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber', 'wicker'], w: 0.6, d: 0.6, h: 0.64, variants: 2, variantNames: ['oak, a spiral on its top', 'wicker'],
  build: function (F) {
    if ((F.variant | 0) === 0) {
      for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5; F.rod(Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25, Math.cos(a) * 0.15, 0.56, Math.sin(a) * 0.15, 0.035, F.col('oak'), 'wood'); }
      F.cyl(0, 0.56, 0, 0.26, 0.06, 0, F.col('oak'), 'wood');
      TALOVOLCI_FX.spiral(F, 0, 0.625, 0, 0.17, 2.2, 0.008, F.col('oakDark'), 'wood', 'y');
    } else {
      F.frustum(0, 0, 0, 0.27, 0.23, 0.58, 0, F.col('wicker'), 'wicker', 12);
      for (const y of [0.04, 0.3, 0.54]) F.cyl(0, y, 0, 0.27 - y * 0.065, 0.04, 0, F.col('wickerDark'), 'wicker');
      F.cyl(0, 0.58, 0, 0.24, 0.05, 0, F.col('fleece'), 'wicker');
    }
  }
});
FURN({
  key: 'talovolci_poor_hearth_bench', name: 'Bench round the hearth', culture: 'talovolci', tier: 'poor', type: 'bench', setting: 'indoor',
  rooms: ['living', 'hall', 'cottage'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['timber', 'hide'], w: 3.0, d: 0.9, h: 0.64, variants: 1,
  build: function (F) {
    F.shift(0, -0.147);                                                                                  /* a segment of a ring 3.2 m round the hearth, which is in front (+z) */
    const R = 3.2;
    for (let i = 0; i < 5; i++) { const a = (i - 2) * 0.18, x = R * Math.sin(a), z = R - R * Math.cos(a);
      F.box(x, 0.56, z, 0.6, 0.07, 0.55, -a, F.col(i % 2 ? 'oak' : 'oakPale'), 'wood');
      for (const rr of [-0.2, 0.2]) F.box(x - Math.sin(a) * rr, 0, z + Math.cos(a) * rr, 0.14, 0.56, 0.14, -a, F.col('oakDark'), 'wood'); }
    for (const a of [-0.27, 0.09]) F.box(R * Math.sin(a), 0.63, R - R * Math.cos(a), 0.5, 0.012, 0.5, -a, F.col('fleece'), 'fur');   /* fleeces thrown on it */
  }
});
FURN({
  key: 'talovolci_poor_hearth', name: 'Clay-kerbed hearth', culture: 'talovolci', tier: 'poor', type: 'stove', setting: 'indoor',
  rooms: ['living', 'cottage', 'kitchen', 'hall'], anchor: 'floor', clearance: { front: 0.9, back: 0.9, left: 0.9, right: 0.9 },
  materials: ['stone', 'timber', 'emissive', 'terracotta', 'food'], w: 1.6, d: 1.6, h: 0.62, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.78, 0.12, 0, F.col('clayDaub'), 'stone');
    F.cyl(0, 0.12, 0, 0.64, 0.012, 0, F.col('ashCold'), 'stone');
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; F.rod(Math.cos(a) * 0.36, 0.14, Math.sin(a) * 0.36, -Math.cos(a) * 0.08, 0.24, -Math.sin(a) * 0.08, 0.05, F.col('oakDark'), 'wood'); }
    F.cyl(0, 0.13, 0, 0.26, 0.02, 0, F.col('ember'), 'glow'); F.cone(0, 0.14, 0, 0.2, 0.32, 0, F.col('flame'), 'glow');
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.blob(0.42 + Math.cos(a) * 0.14, 0.18, Math.sin(a) * 0.14, 0.07, 0.12, a, F.col('stone'), 'stone'); }
    F.frustum(0.42, 0.22, 0, 0.16, 0.2, 0.26, 0, F.col('clayPot'), 'terracotta', 12);                   /* the pot on its three stones */
    F.cyl(0.42, 0.47, 0, 0.17, 0.015, 0, F.col('meat'), 'food');
  }
});
FURN({
  key: 'talovolci_poor_baskets', name: 'Wicker baskets', culture: 'talovolci', tier: 'poor', type: 'storage', setting: 'both',
  rooms: ['store', 'living', 'cottage', 'kitchen', 'yard'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['wicker', 'timber', 'food'], w: 0.7, d: 0.7, h: 0.9, variants: 2, variantNames: ['a tall lidded basket', 'a log basket'],
  variantDims: [{ w: 0.7, d: 0.7, h: 0.9 }, { w: 1.0, d: 1.0, h: 0.62 }],
  build: function (F) {
    if ((F.variant | 0) === 0) {
      F.frustum(0, 0, 0, 0.28, 0.33, 0.8, 0, F.col('wicker'), 'wicker', 12);
      for (let i = 0; i < 4; i++) F.cyl(0, 0.08 + i * 0.22, 0, 0.29 + i * 0.012, 0.03, 0, F.col('wickerDark'), 'wicker');
      F.dome(0, 0.8, 0, 0.34, 0.08, 0, F.col('wickerDark'), 'wicker');
      F.ball(0, 0.88, 0, 0.03, F.col('oakDark'), 'wood');
    } else {
      F.frustum(0, 0, 0, 0.4, 0.46, 0.45, 0, F.col('wicker'), 'wicker', 12);
      F.cyl(0, 0.42, 0, 0.47, 0.04, 0, F.col('wickerDark'), 'wicker');
      for (let i = 0; i < 6; i++) { const z = -0.3 + i * 0.12, a = F.rr(-0.2, 0.2);
        F.rod(-0.42 * Math.cos(a), 0.47 + (i % 2) * 0.06, z - 0.42 * Math.sin(a), 0.42 * Math.cos(a), 0.47 + (i % 2) * 0.06, z + 0.42 * Math.sin(a), 0.055, F.col(i % 2 ? 'oakDark' : 'oak'), 'wood'); }
      F.blob(0, 0.04, 0, 0.3, 0.06, 0, F.col('straw'), 'food');
    }
  }
});
FURN({
  key: 'talovolci_poor_quern', name: 'Rotary quern on its block', culture: 'talovolci', tier: 'poor', type: 'workstation', setting: 'both', job: 'milling',
  rooms: ['kitchen', 'yard', 'cottage', 'workshop'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['timber', 'stone', 'food', 'hide'], w: 1.2, d: 0.8, h: 0.82, variants: 1,
  build: function (F) {
    F.box(-0.1, 0, 0, 0.8, 0.35, 0.78, 0, F.col('oakDark'), 'wood');
    F.blob(-0.1, 0.36, 0, 0.36, 0.03, 0, F.col('flour'), 'food');                                        /* the flour round its foot */
    F.cyl(-0.1, 0.35, 0, 0.33, 0.12, 0, F.col('stone'), 'stone');
    F.cyl(-0.1, 0.47, 0, 0.31, 0.12, 0, F.shade('stone', 0.06), 'stone');
    F.cyl(-0.1, 0.59, 0, 0.07, 0.01, 0, F.col('ashCold'), 'stone');                                      /* the feed hole */
    F.rod(0.12, 0.55, 0, 0.12, 0.82, 0, 0.03, F.col('oak'), 'wood');                                    /* the handle */
    F.ell(0.45, 0.2, 0.15, 0.14, 0.2, 0.13, 0.3, F.col('hide'), 'leather');                              /* a sack of grain */
  }
});
FURN({
  key: 'talovolci_poor_loom', name: 'Warp-weighted loom', culture: 'talovolci', tier: 'poor', type: 'loom', setting: 'indoor', job: 'weaving',
  rooms: ['living', 'workshop', 'cottage'], anchor: 'wall', clearance: { front: 1.2 },
  materials: ['timber', 'cloth', 'terracotta'], w: 2.0, d: 0.9, h: 2.6, variants: 1,
  build: function (F) {
    const zAt = y => 0.35 - 0.294 * y;                                                                   /* the uprights lean on the wall */
    for (const sx of [-1, 1]) F.rod(sx * 0.9, 0, zAt(0), sx * 0.9, 2.55, zAt(2.55), 0.045, F.col('oak'), 'wood');
    F.rod(-0.97, 2.48, zAt(2.48), 0.97, 2.48, zAt(2.48), 0.05, F.col('oakDark'), 'wood');                /* the cloth beam */
    F.beam(0, 2.44, zAt(2.44), 0, 1.25, zAt(1.25), 1.6, 0.012, F.col('weld'), 'cloth');                   /* the checked web, woven down from the top */
    for (let i = 0; i < 6; i++) { const y = 2.35 - i * 0.18; F.beam(0, y, zAt(y) + 0.008, 0, y - 0.06, zAt(y - 0.06) + 0.008, 1.6, 0.006, F.col(i % 2 ? 'madder' : 'woad'), 'cloth'); }
    for (const x of [-0.4, 0.15, 0.6]) F.beam(x, 2.44, zAt(2.44) + 0.012, x, 1.26, zAt(1.26) + 0.012, 0.07, 0.004, F.col('woad'), 'cloth');
    F.rod(-0.92, 1.15, zAt(1.15) + 0.04, 0.92, 1.15, zAt(1.15) + 0.04, 0.025, F.col('oakPale'), 'wood');    /* the heddle rod */
    for (let i = 0; i < 14; i++) { const x = -0.72 + i * 0.11;
      F.rod(x, 1.24, zAt(1.24), x, 0.42, zAt(1.24) + 0.02, 0.004, F.col('woolUndyed'), 'cloth');            /* the warp, hanging */
      F.blob(x, 0.36, zAt(1.24) + 0.02, 0.045, 0.12, 0, F.col('clayPot'), 'terracotta'); }                  /* and its loom weights */
  }
});

/* ---------------------------------------------------------------- common: a farmstead's roundhouse */
FURN({
  key: 'talovolci_common_cauldron', name: 'Bronze cauldron on its chain', culture: 'talovolci', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['living', 'hall', 'kitchen'], anchor: 'floor', clearance: { front: 1.0, back: 1.0, left: 1.0, right: 1.0 },
  materials: ['metal', 'bronze', 'timber', 'emissive', 'food'], w: 1.6, d: 1.6, h: 2.0, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.3; F.rod(Math.cos(a) * 0.74, 0, Math.sin(a) * 0.74, Math.cos(a) * 0.04, 1.96, Math.sin(a) * 0.04, 0.04, F.col('iron'), 'metal'); }
    F.rod(0, 1.94, 0, 0, 1.12, 0, 0.012, F.col('iron'), 'metal');                                       /* the chain */
    for (let k = 0; k < 7; k++) F.box(0, 1.15 + k * 0.11, 0, 0.035, 0.07, 0.012, k % 2 ? F.TAU / 4 : 0, F.col('iron'), 'metal');
    F.lathe(0, 0.42, 0, [[0.16, 0], [0.36, 0.1], [0.45, 0.32], [0.42, 0.56], [0.45, 0.62]], 0, F.col('bronze'), 'bronze', { nu: 24 });
    const rim = []; for (let i = 0; i <= 24; i++) { const a = i * F.TAU / 24; rim.push([Math.cos(a) * 0.45, 1.04, Math.sin(a) * 0.45]); }
    F.tube(rim, 0.02, F.col('bronzeDark'), 'bronze');
    const bail = []; for (let i = 0; i <= 12; i++) { const a = i * Math.PI / 12; bail.push([Math.cos(a) * 0.45, 1.04 + Math.sin(a) * 0.12, 0]); }
    F.tube(bail, 0.012, F.col('iron'), 'metal');
    F.cyl(0, 1.0, 0, 0.42, 0.012, 0, F.col('meat'), 'food');                                             /* the stew */
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.2; F.rod(Math.cos(a) * 0.4, 0.02, Math.sin(a) * 0.4, -Math.cos(a) * 0.06, 0.14, -Math.sin(a) * 0.06, 0.05, F.col('oakDark'), 'wood'); }
    F.cyl(0, 0, 0, 0.3, 0.03, 0, F.col('ember'), 'glow'); F.cone(0, 0.03, 0, 0.22, 0.36, 0, F.col('flame'), 'glow');
  }
});
FURN({
  key: 'talovolci_common_firedogs', name: 'Hearth with ram-headed firedogs', culture: 'talovolci', tier: 'common', type: 'stove', setting: 'indoor',
  rooms: ['hall', 'living', 'kitchen'], anchor: 'floor', clearance: { front: 1.0, back: 0.8, left: 0.8, right: 0.8 },
  materials: ['stone', 'metal', 'timber', 'emissive'], w: 1.8, d: 1.4, h: 0.96, variants: 1,
  build: function (F) {
    for (const sz of [-1, 1]) F.box(0, 0, sz * 0.62, 1.8, 0.14, 0.16, 0, F.col('stone'), 'stone');   /* the kerb */
    for (const sx of [-1, 1]) F.box(sx * 0.82, 0, 0, 0.16, 0.14, 1.08, 0, F.col('stone'), 'stone');
    F.box(0, 0, 0, 1.48, 0.03, 1.08, 0, F.col('ashCold'), 'stone');
    for (const sx of [-1, 1]) { const x = sx * 0.45;
      F.rod(x, 0.16, -0.46, x, 0.16, 0.46, 0.022, F.col('iron'), 'metal');                               /* the firedog's bar */
      for (const z of [-0.46, 0.46]) for (const s2 of [-1, 1]) F.rod(x, 0.16, z, x + s2 * 0.08, 0, z, 0.016, F.col('iron'), 'metal');
      F.rod(x, 0.16, 0.46, x, 0.76, 0.46, 0.025, F.col('iron'), 'metal');                                /* the upright */
      F.ell(x, 0.8, 0.5, 0.05, 0.06, 0.09, 0, F.col('iron'), 'metal');                                    /* the ram's head */
      for (const s2 of [-1, 1]) { F.rod(x + s2 * 0.03, 0.84, 0.47, x + s2 * 0.11, 0.92, 0.42, 0.016, F.col('iron'), 'metal');
        F.rod(x + s2 * 0.11, 0.92, 0.42, x + s2 * 0.13, 0.84, 0.5, 0.014, F.col('iron'), 'metal'); } }
    F.rod(-0.6, 0.62, 0.44, 0.6, 0.62, 0.44, 0.012, F.col('iron'), 'metal');                              /* a spit on the uprights' hooks */
    for (let i = 0; i < 3; i++) F.rod(-0.6, 0.22 + (i % 2) * 0.08, -0.25 + i * 0.25, 0.6, 0.22 + (i % 2) * 0.08, -0.2 + i * 0.25, 0.055, F.col(i % 2 ? 'oakDark' : 'oak'), 'wood');
    F.box(0, 0.03, 0, 0.9, 0.03, 0.7, 0, F.col('ember'), 'glow'); F.cone(0, 0.3, 0, 0.3, 0.4, 0, F.col('flame'), 'glow');
  }
});
FURN({
  key: 'talovolci_common_low_table', name: 'Low oak table', culture: 'talovolci', tier: 'common', type: 'table', setting: 'indoor',
  rooms: ['living', 'hall', 'tavern', 'kitchen'], anchor: 'floor', clearance: { front: 0.9, back: 0.9 },
  materials: ['timber', 'food', 'terracotta'], w: 1.6, d: 0.9, h: 0.62, variants: 1,
  build: function (F) {
    F.box(0, 0.42, 0, 1.6, 0.08, 0.9, 0, F.col('oak'), 'wood');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.box(sx * 0.66, 0, sz * 0.34, 0.14, 0.42, 0.14, 0, F.col('oakDark'), 'wood');
    TALOVOLCI_FX.spiral(F, -0.55, 0.501, 0.25, 0.12, 2, 0.007, F.col('oakDark'), 'wood', 'y');
    TALOVOLCI_FX.spiral(F, 0.55, 0.501, -0.25, 0.12, 2, 0.007, F.col('oakDark'), 'wood', 'y');
    F.frustum(-0.2, 0.5, 0.05, 0.1, 0.17, 0.1, 0, F.col('oakPale'), 'wood', 12);                        /* a turned bowl */
    F.blob(0.25, 0.55, -0.05, 0.14, 0.1, 0, F.col('bread'), 'food');                                    /* a round loaf */
    F.frustum(0.3, 0.5, 0.25, 0.06, 0.05, 0.12, 0, F.col('clayPot'), 'terracotta', 10);
  }
});
FURN({
  key: 'talovolci_common_chest', name: 'Iron-bound oak chest', culture: 'talovolci', tier: 'common', type: 'storage', setting: 'indoor',
  rooms: ['bedroom', 'living', 'hall', 'store'], anchor: 'wall', clearance: { front: 0.8 },
  materials: ['timber', 'metal'], w: 1.5, d: 0.75, h: 0.86, variants: 1,
  build: function (F) {
    F.box(0, 0.08, 0, 1.46, 0.66, 0.73, 0, F.col('oak'), 'wood');
    F.box(0, 0.74, 0, 1.5, 0.1, 0.75, 0, F.col('oakDark'), 'wood');
    for (const sx of [-1, 1]) F.box(sx * 0.62, 0, 0, 0.16, 0.08, 0.7, 0, F.col('oakDark'), 'wood');
    for (const x of [-0.55, 0.55]) F.box(x, 0.08, 0.37, 0.06, 0.76, 0.012, 0, F.col('iron'), 'metal');   /* the iron straps */
    for (const x of [-0.55, 0.55]) F.box(x, 0.84, 0, 0.06, 0.012, 0.76, 0, F.col('iron'), 'metal');
    TALOVOLCI_FX.spiral(F, -0.22, 0.42, 0.372, 0.16, 2.2, 0.01, F.col('oakDark'), 'wood', 'z');
    TALOVOLCI_FX.spiral(F, 0.22, 0.42, 0.372, 0.16, 2.2, 0.01, F.col('oakDark'), 'wood', 'z');
    F.box(0, 0.62, 0.38, 0.1, 0.14, 0.02, 0, F.col('iron'), 'metal');                                    /* the hasp */
  }
});
FURN({
  key: 'talovolci_common_wattle_screen', name: 'Wattle stall screen', culture: 'talovolci', tier: 'common', type: 'screen', setting: 'indoor',
  rooms: ['living', 'bedroom', 'cottage', 'hall'], anchor: 'floor', clearance: { front: 0.3, back: 0.3 },
  materials: ['wicker', 'timber'], w: 2.2, d: 0.14, h: 1.9, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 1.05, 0, 0, 0.1, 1.9, 0.12, 0, F.col('oakDark'), 'wood');
    F.box(0, 1.8, 0, 2.2, 0.08, 0.12, 0, F.col('oakDark'), 'wood');
    for (let i = 0; i < 9; i++) F.rod(-0.88 + i * 0.22, 0, 0, -0.88 + i * 0.22, 1.8, 0, 0.022, F.col('wickerDark'), 'wicker');   /* the sails */
    for (let k = 0; k < 16; k++) F.box(0, 0.08 + k * 0.106, (k % 2 ? 0.02 : -0.02), 2.0, 0.07, 0.025, 0, F.col(k % 3 ? 'wicker' : 'wickerDark'), 'wicker');   /* the rods woven through */
  }
});
FURN({
  key: 'talovolci_common_bed', name: 'Box bed with a carved headboard', culture: 'talovolci', tier: 'common', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'living'], anchor: 'wall', clearance: { front: 0.9, left: 0.6 },
  materials: ['timber', 'thatch', 'hide', 'cloth', 'bronze'], w: 1.6, d: 2.95, h: 1.36, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.75, 0, 0, 0.1, 0.5, 2.9, 0, F.col('oak'), 'wood');
    F.box(0, 0, -1.43, 1.6, 1.3, 0.08, 0, F.col('oakDark'), 'wood');                                   /* the headboard */
    TALOVOLCI_FX.triskele(F, 0, 0.98, -1.385, 0.36, 0.014, F.col('oakPale'), 'wood');
    for (const sx of [-1, 1]) F.ball(sx * 0.72, 1.3, -1.43, 0.06, F.col('bronze'), 'bronze');
    F.box(0, 0, 1.42, 1.6, 0.62, 0.08, 0, F.col('oakDark'), 'wood');
    F.box(0, 0.1, 0, 1.4, 0.28, 2.78, 0, F.col('straw'), 'thatch');
    F.box(0, 0.38, 0.05, 1.42, 0.08, 2.7, 0, F.col('fleece'), 'fur');
    F.box(0, 0.46, 0.4, 1.46, 0.05, 1.9, 0, F.pick(['madder', 'woad', 'weld']), 'cloth');
    for (let i = 0; i < 6; i++) F.box(0, 0.51, -0.4 + i * 0.32, 1.46, 0.006, 0.09, 0, F.col(i % 2 ? 'weld' : 'woolBrown'), 'cloth');
    for (let i = 0; i < 4; i++) F.box(-0.54 + i * 0.36, 0.512, 0.4, 0.07, 0.006, 1.9, 0, F.col('woolUndyed'), 'cloth');   /* and down: the check */
    F.bolster(0, 0.58, -1.18, 1.1, 0.13, 0, F.col('woolUndyed'), 'cloth');
  }
});
FURN({
  key: 'talovolci_common_light_stand', name: 'Iron light stand', culture: 'talovolci', tier: 'common', type: 'lamp', setting: 'indoor',
  rooms: ['hall', 'living', 'bedroom', 'shrine'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['metal', 'terracotta', 'emissive', 'food'], w: 0.6, d: 0.6, h: 1.9, variants: 1,
  build: function (F) {
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3; F.rod(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26, 0, 0.3, 0, 0.016, F.col('iron'), 'metal');
      F.ball(Math.cos(a) * 0.26, 0.02, Math.sin(a) * 0.26, 0.025, F.col('iron'), 'metal'); }
    F.rod(0, 0.3, 0, 0, 1.62, 0, 0.018, F.col('iron'), 'metal');
    const tw = []; for (let i = 0; i <= 30; i++) { const t = i / 30, a = t * 6 * F.TAU; tw.push([Math.cos(a) * 0.022, 0.6 + t * 0.7, Math.sin(a) * 0.022]); }
    F.tube(tw, 0.006, F.col('iron'), 'metal');                                                           /* the twist */
    F.cyl(0, 1.62, 0, 0.16, 0.02, 0, F.col('iron'), 'metal');                                            /* the dish */
    for (let i = 0; i < 3; i++) { const a = i * F.TAU / 3 + 0.5, x = Math.cos(a) * 0.1, z = Math.sin(a) * 0.1;
      F.frustum(x, 1.64, z, 0.04, 0.05, 0.05, 0, F.col('clayPot'), 'terracotta', 8);                    /* three clay lamps of tallow */
      F.cyl(x, 1.685, z, 0.04, 0.008, 0, F.col('straw'), 'food'); F.cone(x, 1.69, z, 0.018, 0.08, 0, F.col('flame'), 'glow'); }
    TALOVOLCI_FX.spiral(F, 0, 1.85, 0, 0.05, 1.5, 0.008, F.col('iron'), 'metal', 'z');
    F.rod(0, 1.64, 0, 0, 1.8, 0, 0.012, F.col('iron'), 'metal');
  }
});
FURN({
  key: 'talovolci_common_shelf', name: 'Oak wall shelf with crocks', culture: 'talovolci', tier: 'common', type: 'shelf', setting: 'indoor',
  rooms: ['kitchen', 'living', 'store', 'cottage'], anchor: 'wall', clearance: { front: 0.6 },
  materials: ['timber', 'terracotta', 'food', 'wicker'], w: 1.8, d: 0.45, h: 2.0, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.box(sx * 0.84, 0, -0.04, 0.12, 2.0, 0.36, 0, F.col('oakDark'), 'wood');
    F.box(0, 0.4, -0.2, 1.6, 1.5, 0.03, 0, F.col('oakPale'), 'wood');                                    /* the boards behind */
    for (const y of [0.4, 1.0, 1.55]) F.box(0, y, -0.03, 1.7, 0.05, 0.38, 0, F.col('oak'), 'wood');
    for (let i = 0; i < 4; i++) { const x = -0.6 + i * 0.4, s = 0.09 + (i % 2) * 0.03;
      F.frustum(x, 0.45, -0.02, s, s * 0.8, s * 2.2, 0, F.col('clayPot'), 'terracotta', 10); }            /* crocks */
    F.ell(-0.4, 1.12, 0.0, 0.14, 0.07, 0.14, 0, F.col('flour'), 'food');                                  /* cheeses */
    F.ell(-0.05, 1.12, 0.0, 0.12, 0.07, 0.12, 0, F.col('bread'), 'food');
    F.frustum(0.45, 1.05, -0.02, 0.15, 0.18, 0.2, 0, F.col('wicker'), 'wicker', 12);
    for (let i = 0; i < 3; i++) F.frustum(-0.45 + i * 0.4, 1.6, 0.0, 0.08, 0.12, 0.08, 0, F.col('oakPale'), 'wood', 12);   /* the turned bowls */
    F.box(0, 0, -0.03, 1.6, 0.06, 0.38, 0, F.col('oakDark'), 'wood');
    F.frustum(0.3, 0.06, -0.02, 0.14, 0.12, 0.3, 0, F.col('clayPot'), 'terracotta', 10);
  }
});
FURN({
  key: 'talovolci_common_ale_vat', name: 'Ale vat with its ladle', culture: 'talovolci', tier: 'common', type: 'vessel', setting: 'indoor', job: 'brewing',
  rooms: ['kitchen', 'store', 'tavern', 'hall'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber', 'metal', 'food', 'bone'], w: 1.1, d: 1.1, h: 1.15, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.5, 0.95, 0, F.col('oak'), 'wood');
    for (let i = 0; i < 16; i++) { const a = i * F.TAU / 16; F.box(Math.cos(a) * 0.5, 0.02, Math.sin(a) * 0.5, 0.012, 0.92, 0.01, -a, F.col('oakDark'), 'wood'); }   /* the stave joints */
    for (const y of [0.12, 0.5, 0.86]) F.cyl(0, y, 0, 0.51, 0.04, 0, F.col('iron'), 'metal');
    F.cyl(0, 0.9, 0, 0.47, 0.012, 0, F.col('mead'), 'food');                                              /* the ale */
    F.rod(-0.3, 0.92, -0.1, 0.38, 1.12, 0.25, 0.018, F.col('oakPale'), 'wood');                          /* the ladle */
    F.frustum(-0.3, 0.88, -0.1, 0.05, 0.08, 0.06, 0, F.col('oakPale'), 'wood', 10);
    F.rod(0.2, 0.95, -0.42, 0.28, 1.12, -0.48, 0.03, F.col('woolUndyed'), 'bone');                       /* a drinking horn hung on the rim */
  }
});

/* ---------------------------------------------------------------- court: a chief's hall */
FURN({
  key: 'talovolci_court_rix_seat', name: "The rix's seat", culture: 'talovolci', tier: 'court', type: 'chair', setting: 'indoor',
  rooms: ['hall', 'court'], anchor: 'floor', clearance: { front: 1.4 },
  materials: ['timber', 'bronze', 'gold', 'hide', 'cloth'], w: 1.3, d: 1.1, h: 1.95, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.3, 0.14, 1.1, 0, F.col('oakDark'), 'wood');                                        /* the step */
    F.box(0, 0.14, 0.02, 1.1, 0.5, 0.9, 0, F.col('oak'), 'wood');
    F.box(0, 0.64, 0.05, 1.04, 0.1, 0.84, 0, F.col('fleece'), 'fur');
    F.box(0, 0.24, 0.47, 1.0, 0.4, 0.02, 0, F.col('madder'), 'cloth');                                  /* a checked cloth over the front */
    for (let i = 0; i < 4; i++) F.box(-0.36 + i * 0.24, 0.24, 0.482, 0.06, 0.4, 0.006, 0, F.col('weld'), 'cloth');
    F.box(0, 0.64, -0.42, 1.1, 1.15, 0.12, 0, F.col('oak'), 'wood');                                   /* the back */
    TALOVOLCI_FX.triskele(F, 0, 1.3, -0.355, 0.36, 0.016, F.col('gold'), 'gold');
    for (const sx of [-1, 1]) { F.box(sx * 0.55, 0.14, -0.42, 0.14, 1.72, 0.14, 0, F.col('oakDark'), 'wood');   /* the posts */
      F.ball(sx * 0.55, 1.88, -0.42, 0.07, F.col('bronze'), 'bronze');
      F.box(sx * 0.55, 0.64, 0.0, 0.12, 0.34, 0.8, 0, F.col('oakDark'), 'wood');
      TALOVOLCI_FX.spiral(F, sx * 0.55, 0.85, 0.401, 0.1, 1.8, 0.008, F.col('bronze'), 'bronze', 'z');
      F.box(sx * 0.55, 0.98, 0.0, 0.14, 0.04, 0.82, 0, F.col('hide'), 'hide'); }
  }
});
FURN({
  key: 'talovolci_court_feasting_board', name: 'The feasting board', culture: 'talovolci', tier: 'court', type: 'table', setting: 'indoor',
  rooms: ['hall', 'court', 'tavern'], anchor: 'floor', clearance: { front: 1.0, back: 1.0 },
  materials: ['timber', 'food', 'bronze', 'bone', 'terracotta'], w: 3.6, d: 1.1, h: 0.95, variants: 1,
  build: function (F) {
    F.box(0, 0.44, 0, 3.6, 0.1, 1.1, 0, F.col('oak'), 'wood');
    for (const x of [-1.5, 0, 1.5]) F.box(x, 0, 0, 0.3, 0.44, 0.9, 0, F.col('oakDark'), 'wood');
    for (const x of [-1.5, 1.5]) TALOVOLCI_FX.spiral(F, x, 0.24, 0.451, 0.12, 2, 0.01, F.col('oakPale'), 'wood', 'z');
    F.ell(-0.2, 0.66, 0.0, 0.42, 0.13, 0.24, 0.15, F.col('meat'), 'food');                                /* the champion's portion */
    F.rod(-0.68, 0.66, 0.04, -0.82, 0.68, 0.06, 0.04, F.col('fleece'), 'bone');
    F.box(-0.2, 0.54, 0, 1.1, 0.02, 0.6, 0, F.col('oakPale'), 'wood');                                    /* its board */
    F.lathe(0.75, 0.54, -0.2, [[0.09, 0], [0.13, 0.08], [0.12, 0.2], [0.05, 0.3], [0.04, 0.36], [0.06, 0.38]], 0, F.col('bronze'), 'bronze', { nu: 16 });   /* the flagon */
    F.rod(0.75, 0.88, -0.2, 0.84, 0.92, -0.2, 0.015, F.col('bronzeDark'), 'bronze');
    for (const [x, z, a] of [[1.3, 0.2, 0.4], [0.3, 0.35, -0.3], [-1.2, 0.3, 0.6], [-1.4, -0.3, -0.5]]) {   /* drinking horns, bronze-tipped */
      F.rod(x, 0.56, z, x + Math.cos(a) * 0.32, 0.6, z + Math.sin(a) * 0.12, 0.035, F.col('woolUndyed'), 'bone');
      F.ball(x + Math.cos(a) * 0.32, 0.6, z + Math.sin(a) * 0.12, 0.03, F.col('bronze'), 'bronze'); }
    for (const x of [0.4, 1.1, -0.9]) F.blob(x, 0.6, 0.05, 0.13, 0.1, 0, F.col('bread'), 'food');
    F.frustum(1.6, 0.54, -0.25, 0.08, 0.12, 0.14, 0, F.col('clayPot'), 'terracotta', 12);
  }
});
FURN({
  key: 'talovolci_court_figure', name: 'Oak figure with its torc', culture: 'talovolci', tier: 'court', type: 'statue', setting: 'both',
  rooms: ['hall', 'shrine', 'court', 'temple', 'garden'], anchor: 'floor', clearance: { front: 0.9 },
  materials: ['stone', 'timber', 'gold', 'bronze'], w: 0.8, d: 0.7, h: 2.6, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 0.8, 0.3, 0.7, 0, F.col('stone'), 'stone');
    F.cyl(0, 0.3, 0, 0.24, 1.6, 0, F.col('oak'), 'wood');                                                 /* the trunk, cut to a body */
    for (const sx of [-1, 1]) F.box(sx * 0.15, 1.2, 0.17, 0.08, 0.6, 0.1, 0.0, F.col('oakDark'), 'wood');  /* arms carved flat to the body */
    TALOVOLCI_FX.spiral(F, 0, 1.2, 0.243, 0.12, 2.2, 0.012, F.col('oakDark'), 'wood', 'z');
    F.ell(0, 2.15, 0, 0.21, 0.26, 0.2, 0, F.col('oak'), 'wood');                                         /* the head */
    for (const sx of [-1, 1]) F.ball(sx * 0.07, 2.2, 0.18, 0.035, F.col('oakDark'), 'wood');             /* the great eyes */
    F.box(0, 2.0, 0.19, 0.12, 0.02, 0.02, 0, F.col('oakDark'), 'wood');
    F.ell(0, 2.42, -0.02, 0.18, 0.08, 0.17, 0, F.col('oakDark'), 'wood');                                /* the hair, swept back */
    const torc = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * 0.62 + i * (F.TAU - Math.PI * 0.24) / 20; torc.push([Math.cos(a) * 0.2, 1.9, Math.sin(a) * 0.2]); }
    F.tube(torc, 0.03, F.col('gold'), 'gold');                                                            /* the gold torc, open at the front */
    for (const sx of [-1, 1]) F.ball(sx * 0.06, 1.9, 0.2, 0.05, F.col('gold'), 'gold');
    F.ball(0.12, 1.52, 0.235, 0.04, F.col('bronze'), 'bronze');                                          /* a brooch */
  }
});
FURN({
  key: 'talovolci_court_calendar', name: "The learned order's calendar", culture: 'talovolci', tier: 'court', type: 'board', setting: 'indoor',
  rooms: ['hall', 'shrine', 'library', 'school', 'temple'], anchor: 'floor', clearance: { front: 1.0 },
  materials: ['timber', 'bronze'], w: 1.7, d: 0.5, h: 2.1, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) { F.box(sx * 0.78, 0, 0, 0.14, 1.95, 0.14, 0, F.col('oakDark'), 'wood');
      F.box(sx * 0.78, 0, 0, 0.14, 0.06, 0.5, 0, F.col('oakDark'), 'wood');
      TALOVOLCI_FX.spiral(F, sx * 0.78, 2.0, 0.0, 0.07, 1.6, 0.012, F.col('oak'), 'wood', 'z'); }
    F.box(0, 1.85, 0, 1.7, 0.1, 0.16, 0, F.col('oak'), 'wood');
    F.box(0, 0.5, 0, 1.42, 1.2, 0.06, 0, F.col('oak'), 'wood');
    F.box(0, 0.56, 0.035, 1.3, 1.08, 0.012, 0, F.col('bronze'), 'bronze');                               /* the bronze plate of months */
    const ink = F.css(F.col('bronzeDark')), plate = F.css(F.col('bronze'));
    F.decal(0, 0.58, 0.05, 1.26, 1.04, 0, 'talovolci-calendar', function (g, W, H) {
      g.fillStyle = plate; g.fillRect(0, 0, W, H);
      g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 2;
      for (let c = 0; c < 4; c++) for (let m = 0; m < 4; m++) { const x = W * (0.03 + c * 0.24), y = H * (0.03 + m * 0.24), w = W * 0.22, h = H * 0.22;
        g.strokeRect(x, y, w, h);
        for (let d = 0; d < 15; d++) { const cx = x + w * (0.12 + (d % 5) * 0.19), cy = y + h * (0.25 + Math.floor(d / 5) * 0.27);
          g.beginPath(); g.arc(cx, cy, W * 0.006, 0, Math.PI * 2); g.fill(); g.fillRect(cx + W * 0.01, cy - 1, W * 0.02, 2); } }   /* a peg hole and its mark for each day */
    }, 'bronze');
    F.rod(-0.2, 1.0, 0.045, -0.2, 1.0, 0.09, 0.012, F.col('bronzeDark'), 'bronze');                     /* today's peg */
  }
});
FURN({
  key: 'talovolci_court_hanging', name: 'Checked wool hanging', culture: 'talovolci', tier: 'court', type: 'banner', setting: 'indoor',
  rooms: ['hall', 'court', 'bedroom', 'living'], anchor: 'wall', clearance: { front: 0.3 },
  materials: ['cloth', 'timber', 'bronze'], w: 1.8, d: 0.08, h: 2.2, variants: 2, variantNames: ['weld-yellow, checked woad and madder', 'woad-blue, checked weld'],
  build: function (F) {
    const v = F.variant | 0;
    F.rod(-0.86, 2.15, 0, 0.86, 2.15, 0, 0.03, F.col('oakDark'), 'wood');
    for (const sx of [-1, 1]) TALOVOLCI_FX.spiral(F, sx * 0.86, 2.15, 0.02, 0.04, 1.5, 0.008, F.col('bronze'), 'bronze', 'z');
    F.box(0, 0.22, -0.012, 1.66, 1.9, 0.012, 0, F.col(v ? 'woad' : 'weld'), 'cloth');
    const c = F.css;
    F.decal(0, 0.24, 0.001, 1.62, 1.86, 0, 'talovolci-check-' + v, function (g, W, H) {
      if (v) TALOVOLCI_FX.check(g, W, H, c(F.col('woad')), c(F.col('weld')), c(F.col('woolUndyed')), 7);
      else TALOVOLCI_FX.check(g, W, H, c(F.col('weld')), c(F.col('madder')), c(F.col('woad')), 8);
    }, 'cloth');
    for (let i = 0; i < 16; i++) F.box(-0.75 + i * 0.1, 0.1, -0.012, 0.03, 0.13, 0.008, 0, F.col(v ? 'weld' : 'madder'), 'cloth');   /* the tassels */
  }
});
FURN({
  key: 'talovolci_court_shields', name: "The champions' shields", culture: 'talovolci', tier: 'court', type: 'art', setting: 'indoor',
  rooms: ['hall', 'court', 'barracks'], anchor: 'wall', clearance: { front: 0.5 },
  materials: ['timber', 'bronze', 'metal', 'hide'], w: 1.5, d: 0.2, h: 1.6, variants: 1,
  build: function (F) {
    for (const sx of [-1, 1]) F.rod(sx * 0.7, 0.05, -0.085, -sx * 0.62, 1.55, -0.085, 0.014, F.col('oakPale'), 'wood');   /* two spears behind */
    for (const sx of [-1, 1]) F.cone(-sx * 0.62, 1.48, -0.085, 0.03, 0.1, 0, F.col('iron'), 'metal');
    for (const sx of [-1, 1]) { const x = sx * 0.36;
      F.ell(x, 0.8, -0.06, 0.33, 0.76, 0.03, 0, F.col(sx < 0 ? 'hide' : 'madder'), sx < 0 ? 'hide' : 'wood');   /* the long oval shield */
      F.rod(x, 0.12, -0.025, x, 1.48, -0.025, 0.018, F.col('oakDark'), 'wood');                         /* its spine */
      F.ell(x, 0.8, -0.02, 0.09, 0.14, 0.05, 0, F.col('bronze'), 'bronze');                             /* its boss */
      for (const dy of [-0.42, 0.42]) TALOVOLCI_FX.spiral(F, x, 0.8 + dy, -0.025, 0.12, 1.8, 0.01, F.col('bronze'), 'bronze', 'z'); }
  }
});
