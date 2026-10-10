/* ======================================================================
   Reed Lake furniture: common and court tiers.
   A floating village: everything is bundled and woven reed (the reed
   family), driftwood where it can be had, rush cord, grey lake clay, fish
   silver; woven bands, wave hangings; the chief's house adds driftwood,
   bone and shell. No pack yet.
   ====================================================================== */
/* PALETTE */
FURN_CULTURE('reedlake', { name: 'Reed Lake', pack: null, influences: 'floating reed village',
  materials: 'bundled reed, rush, driftwood, lake clay, fish silver, bone and shell',
  palette: {
    reedGold: 0xc8b060, reedPale: 0xd8c888, reedDark: 0x8a7a40, timberDrift: 0x9a8a70, timberDriftDark: 0x6a5a44, timberDriftLight: 0xb8a890,
    clothLakeBlue: 0x3a6a8a, clothRush: 0xb8a060, clothMadder: 0xa83a2a, clothWhite: 0xe8e4d4, clothTeal: 0x2a7a7a,
    clayGrey: 0x8a8070, stoneGrey: 0x6a6a62, fishSilver: 0xb0b8c0, ropeRush: 0xb8a868, boneIvory: 0xe8e0cc, shellWhite: 0xe8e4d8,
    clayRed: 0x9a5a38, gourdOchre: 0xb08a4a, gourdOlive: 0x9a8a3a,
    flame: 0xffb04a, ember: 0xd9762c
  } });
/* END PALETTE */
const RL_COMMON = {
  emblem: { field: 'clothLakeBlue', edge: 'reedDark', band: 'clothRush', ink: 'clothWhite', ink2: 'reedGold' },
  wood: 'reedGold', woodDark: 'reedDark', woodLight: 'reedPale', woodFam: 'reed',
  cloth: ['clothLakeBlue', 'clothRush', 'clothMadder', 'clothWhite'], clothFam: 'cloth',
  accent: 'fishSilver', accentFam: 'metal', metal: 'fishSilver', metalFam: 'metal',
  clay: 'clayGrey', clayFam: 'stone', stone: 'stoneGrey', stoneFam: 'stone', rope: 'ropeRush',
  flame: 'flame', ember: 'ember',
  legs: 'post', motif: 'band', bedBase: 'woven', seat: 'woven', finial: 'none',
  hearth: 'mud', fire: 'pit', lamp: 'oil', rug: 'reed', screen: 'reed', store: 'baskets',
  shelfFill: 'bundles', rack: 'nets', art: 'plate', art2: 'mask', statue: 'urn', tapestry: 'waves',
  canopy: false, board: 'bark'
};
const RL_COURT = Object.assign({}, RL_COMMON, {
  wood: 'timberDrift', woodDark: 'timberDriftDark', woodLight: 'timberDriftLight', woodFam: 'wood',
  cloth: ['clothLakeBlue', 'clothWhite', 'clothTeal', 'clothMadder'],
  accent: 'shellWhite', accentFam: 'bone', motif: 'wave', finial: 'disc', statue: 'vase', screen: 'reed', rug: 'woven', art: 'mask', art2: 'plate'
});
FK.set({ culture: 'reedlake', tier: 'common', S: RL_COMMON, names: {
  bed: 'Reed sleeping frame', bench: 'Bundled-reed bench', chair: 'Woven reed chair', stool: 'Reed stool', table: 'Reed table',
  low_table: 'Low reed table', desk: 'Tally desk', chest: 'Reed chest', bookcase: 'Bundle shelves', wall_shelves: 'Basket shelves',
  store: 'Rush baskets', hearth: 'Clay hearth', fire: 'Fire pit', lamp: 'Fish-oil lamp on a post', candle: 'Fish-oil lamp',
  hanging: 'Hanging oil bowl', rug: 'Reed mat', screen: 'Reed screen', counter: 'Trade counter', workbench: 'Net-maker\'s bench',
  loom: 'Mat loom', rack: 'Net rack', ladder: 'Ladder', board: 'Bark tally board', art: 'Woven disc', bowl: 'Lake-clay bowl',
  jug: 'Lake-clay jug and cups', books: 'Tally sticks' } });
FK.set({ culture: 'reedlake', tier: 'court', S: RL_COURT, names: {
  bed: 'Headman\'s driftwood bed', throne: 'Headman\'s seat', divan: 'Headman\'s settle', table: 'Driftwood feast table', low_table: 'Shell-inlaid low table',
  desk: 'Headman\'s tally desk', cabinet: 'Driftwood press', bookcase: 'Headman\'s shelves', hearth: 'Great clay hearth', fire: 'Silver fire-bowl',
  lamp: 'Shell-inlaid lamp post', candelabra: 'Shell oil lamps', hanging: 'Hanging oil bowl', carpet: 'Great woven mat', screen: 'Fine reed screen',
  tapestry: 'Wave hanging', art: 'Great mask', statue: 'Great vase', jug: 'Shell-inlaid ewer', bowl: 'Shell-inlaid bowl' } });

FURN({
  key: 'reedlake_common_fish_frame', name: 'Fish-drying frame', culture: 'reedlake', tier: 'common', type: 'rack', setting: 'both',
  rooms: ['kitchen', 'store', 'yard', 'dock'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['reed', 'rope', 'metal'],
  w: 1.4, d: 0.5, h: 1.7, variants: 1,
  build: function (F) {
    const reed = F.col('reedDark'), fish = F.col('fishSilver');
    for (const s of [-1, 1]) { F.beam(s * 0.65, 0, -0.22, s * 0.65, 1.7, 0, 0.06, 0.06, reed, 'reed'); F.beam(s * 0.65, 0, 0.22, s * 0.65, 1.7, 0, 0.06, 0.06, reed, 'reed'); }
    for (const y of [0.7, 1.2, 1.65]) F.rod(-0.68, y, 0, 0.68, y, 0, 0.02, F.shade(reed, 0.1), 'reed');
    for (const y of [0.7, 1.2, 1.65]) for (let i = 0; i < 6; i++) {
      const x = -0.5 + i * 0.2 + F.rr(-0.03, 0.03);
      F.rod(x, y, 0, x, y - 0.3, 0.02, 0.004, F.col('ropeRush'), 'rope');
      F.blob(x, y - 0.42, 0.02, 0.035, 0.26, F.rr(-0.3, 0.3), F.shade(fish, F.rr(-0.1, 0.1)), 'metal');
    }
  }
});

/* ======== Hospitality and households (2026-10: the Reed Lake interiors set, kits/interiors/sets/reedlake.js) ========
   Reed's Local (settlements/reedlake rl_tavern) wanted a bar, a rack for the beer jars, long benches and long tables
   for a full hall; the island huts wanted the lake's own bed: a sleeping mat on a low platform of bundles. */
FURN({
  key: 'reedlake_common_bar', name: 'Reed bar', culture: 'reedlake', tier: 'common', type: 'counter', setting: 'indoor',
  rooms: ['tavern', 'hall', 'market', 'shop'], anchor: 'floor', clearance: { front: 1.0, back: 0.8 },
  materials: ['reed', 'timber', 'rope', 'cloth'],
  w: 3.2, d: 0.8, h: 1.05, variants: 2, variantNames: ['plain', 'woven front'],
  build: function (F) {
    const W = 3.2, D = 0.8, n = 17, reed = F.col('reedGold'), dark = F.col('reedDark'), rope = F.col('ropeRush');
    F.box(0, 0, -0.06, W - 0.2, 0.9, D - 0.3, 0, F.shade('reedPale', -0.1), 'reed');                     /* the mat-walled body */
    for (let i = 0; i < n; i++) {                                                                          /* the front: standing bundles */
      const x = -W / 2 + 0.1 + (W - 0.2) * i / (n - 1);
      F.cyl(x, 0, D / 2 - 0.1, 0.085, 0.92, 0, F.shade(reed, F.rr(-0.06, 0.06)), 'reed');
    }
    for (const s of [-1, 1]) F.cyl(s * (W / 2 - 0.1), 0, -D / 2 + 0.1, 0.09, 0.92, 0, dark, 'reed');     /* the back corner bundles */
    for (const y of [0.16, 0.7]) F.box(0, y, D / 2 - 0.1, W - 0.1, 0.05, 0.19, 0, rope, 'rope');          /* lashings round the front */
    F.box(0, 0.92, 0, W, 0.13, D, 0, F.col('timberDrift'), 'wood');                                       /* the driftwood top */
    F.box(0, 0.86, 0, W - 0.1, 0.06, D - 0.1, 0, F.col('timberDriftDark'), 'wood');
    if (F.variant) {                                                                                       /* a woven band across the front */
      F.box(0, 0.32, D / 2 - 0.012, W - 0.3, 0.28, 0.02, 0, F.col('clothMadder'), 'cloth');
      for (let k = 0; k < 13; k++) {
        const x = -W / 2 + 0.35 + (W - 0.7) * k / 12;
        F.box(x, 0.4, D / 2 - 0.006, 0.11, 0.11, 0.01, 0, F.col(k % 2 ? 'clothWhite' : 'clothRush'), 'cloth');
      }
    }
  }
});
FURN({
  key: 'reedlake_common_jar_rack', name: 'Beer jar rack', culture: 'reedlake', tier: 'common', type: 'storage', role: 'store', setting: 'indoor',
  rooms: ['tavern', 'kitchen', 'store', 'shop'], anchor: 'wall', clearance: { front: 0.7 },
  materials: ['reed', 'stone', 'cloth', 'rope', 'foliage'],
  w: 1.8, d: 0.6, h: 1.5, variants: 2, variantNames: ['beer jars', 'jars and gourds'],
  build: function (F) {
    const W = 1.8, D = 0.6, H = 1.5, reed = F.col('reedDark'), mat = F.col('reedPale'), rope = F.col('ropeRush');
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cyl(sx * (W / 2 - 0.06), 0, sz * (D / 2 - 0.06), 0.06, H - 0.08, 0, reed, 'reed');
    for (const y of [0.08, 0.78]) F.box(0, y, 0, W - 0.04, 0.06, D - 0.04, 0, mat, 'reed');               /* two mat decks */
    for (const z of [-D / 2 + 0.06, D / 2 - 0.06]) F.rod(-W / 2 + 0.04, H - 0.06, z, W / 2 - 0.04, H - 0.06, z, 0.05, reed, 'reed');
    for (const s of [-1, 1]) F.rod(s * (W / 2 - 0.06), H - 0.06, -D / 2 + 0.04, s * (W / 2 - 0.06), H - 0.06, D / 2 - 0.04, 0.05, reed, 'reed');
    for (const s of [-1, 1]) for (const y of [0.1, 0.8]) F.cyl(s * (W / 2 - 0.06), y - 0.02, D / 2 - 0.06, 0.07, 0.1, 0, rope, 'rope');
    const jar = function (x, y, r, h) {                                                                    /* a beer jar with a cloth stopper */
      const c = F.shade(F.pick(['clayGrey', 'clayRed']), F.rr(-0.06, 0.05));
      F.blob(x, y + h / 2, 0, r, h, 0, c, 'stone');
      F.cyl(x, y + h - 0.04, 0, r * 0.38, 0.08, 0, c, 'stone');
      F.cyl(x, y + h + 0.03, 0, r * 0.42, 0.03, 0, F.pick(['clothMadder', 'clothLakeBlue', 'clothRush']), 'cloth');
    };
    for (let i = 0; i < 3; i++) jar(-0.55 + i * 0.55, 0.14, 0.24, 0.52);                                   /* the big jars below */
    if (!F.variant) for (let i = 0; i < 4; i++) jar(-0.6 + i * 0.4, 0.84, 0.16, 0.42);                     /* four smaller jars above */
    else {
      for (let i = 0; i < 2; i++) jar(-0.5 + i * 0.4, 0.84, 0.16, 0.42);
      for (let k = 0; k < 4; k++) F.ball(0.32 + (k % 2) * 0.26, 0.97 + (k > 1 ? 0.16 : 0), (k % 2 ? 0.08 : -0.08), 0.13, F.pick(['gourdOchre', 'gourdOlive']), 'plant');
    }
  }
});
FURN({
  key: 'reedlake_common_long_bench', name: 'Long bundle bench', culture: 'reedlake', tier: 'common', type: 'bench', setting: 'both',
  rooms: ['tavern', 'hall', 'kitchen', 'court', 'yard'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['reed', 'rope'],
  w: 3.0, d: 0.45, h: 0.46, variants: 1,
  build: function (F) {
    const reed = F.col('reedGold'), dark = F.col('reedDark'), rope = F.col('ropeRush');
    for (const x of [-1.2, 0, 1.2]) for (const k of [-1, 1]) F.rod(x + k * 0.09, 0.13, -0.2, x + k * 0.09, 0.13, 0.2, 0.12, dark, 'reed');   /* trestles of short bundles */
    for (const z of [-0.105, 0.105]) F.rod(-1.5, 0.36, z, 1.5, 0.36, z, 0.1, F.shade(reed, F.rr(-0.05, 0.05)), 'reed');                      /* the seat: two long bundles */
    for (const x of [-1.38, -0.6, 0.6, 1.38]) F.box(x, 0.26, 0, 0.05, 0.2, 0.42, 0, rope, 'rope');                                            /* lashings */
  }
});
FURN({
  key: 'reedlake_common_long_table', name: 'Long reed table', culture: 'reedlake', tier: 'common', type: 'table', setting: 'both',
  rooms: ['tavern', 'hall', 'kitchen'], anchor: 'floor', clearance: { front: 0.6, back: 0.6, left: 0.6, right: 0.6 },
  materials: ['reed', 'timber', 'rope', 'cloth'],
  w: 3.0, d: 0.9, h: 0.74, variants: 2, variantNames: ['bare', 'with a woven runner'],
  build: function (F) {
    const reed = F.col('reedDark'), rope = F.col('ropeRush');
    for (const x of [-1.15, 1.15]) {                                                                       /* bundle trestles at each end */
      for (const z of [-0.3, 0.3]) F.cyl(x, 0, z, 0.075, 0.66, 0, reed, 'reed');
      F.rod(x, 0.16, -0.36, x, 0.16, 0.36, 0.06, reed, 'reed');
      F.rod(x, 0.6, -0.42, x, 0.6, 0.42, 0.06, reed, 'reed');
      for (const z of [-0.3, 0.3]) F.box(x, 0.55, z, 0.17, 0.08, 0.17, 0, rope, 'rope');
    }
    F.rod(-1.15, 0.16, 0, 1.15, 0.16, 0, 0.05, reed, 'reed');                                                /* the stretcher */
    for (const z of [-0.3, 0, 0.3]) F.box(0, 0.66, z, 3.0, 0.07, 0.29, 0, F.shade('timberDrift', F.rr(-0.06, 0.06)), 'wood');   /* driftwood boards */
    if (F.variant) F.box(0, 0.73, 0, 2.4, 0.008, 0.34, 0, F.col('clothMadder'), 'cloth');
  }
});
FURN({
  key: 'reedlake_poor_sleeping_mat', name: 'Sleeping mat on a bundle platform', culture: 'reedlake', tier: 'poor', type: 'bed', setting: 'indoor',
  rooms: ['bedroom', 'barracks', 'dormitory'], anchor: 'floor', clearance: { front: 0.5 },
  materials: ['reed', 'cloth'],
  w: 1.0, d: 2.0, h: 0.4, variants: 2, variantNames: ['blanket', 'blanket and a rolled spare'],
  build: function (F) {
    const reed = F.col('reedGold');
    for (let i = 0; i < 5; i++) { const x = -0.4 + i * 0.2; F.rod(x, 0.09, -1.0, x, 0.09, 1.0, 0.09, F.shade(reed, F.rr(-0.06, 0.04)), 'reed'); }   /* the platform */
    F.box(0, 0.17, 0, 0.98, 0.04, 1.96, 0, F.col('reedPale'), 'reed');                                    /* the sleeping mat */
    F.box(0, 0.21, 0.22, 0.9, 0.05, 1.3, 0, F.pick(['clothLakeBlue', 'clothMadder', 'clothTeal']), 'cloth');   /* the blanket, a woven stripe */
    F.box(0, 0.26, 0.22, 0.9, 0.006, 0.12, 0, F.col('clothWhite'), 'cloth');
    F.rod(-0.4, 0.3, -0.78, 0.4, 0.3, -0.78, 0.08, F.col('clothWhite'), 'cloth');                         /* the bolster */
    if (F.variant) F.rod(-0.42, 0.3, 0.86, 0.42, 0.3, 0.86, 0.08, F.col('clothRush'), 'cloth');            /* a rolled spare blanket at the foot */
  }
});

/* training furniture (FK.ROLES.training, 2026-10): a melee and a ranged practice piece in this culture's style sheet, keyed reedlake_training_<role> */
FK.set({ culture: 'reedlake', tier: 'common', roles: 'training', prefix: 'reedlake_training_', S: RL_COMMON, names: {
  training_dummy: 'Reed practice dummy', archery_butt: 'Reed-bale archery butt' } });
