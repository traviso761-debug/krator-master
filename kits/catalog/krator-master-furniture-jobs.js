/* ======================================================================
   krator-master-furniture-jobs.js — WORK ITEMS, by trade (the Jobs category, 2026-10)
   Not a culture file. Like -generic-goods.js its name is a category: each entry keeps its real `culture`
   (the culture of the building that draws it) and carries `job`, the trade or occupation it serves, from
   FURN_JOBS (krator-furniture-core.js: farming fishing salt oil smithing milling warehousing ...). The
   catalog sheet's Jobs page lays these out a row per job (`Jobs · fishing`), with the cultures' FK trade
   pieces (forge, anvil, vat ...) after them, a row per culture (`Jobs · trade · <culture>`).
   The file adds the colours its pieces need to each culture's palette through its own PALETTE block (as
   defaults: the culture's own file wins for a key both define), so it needs no culture file beside it: furniture_bundle.bundle([..., 'jobs']) picks it up by its suffix.
   Pieces draw only through F (no culture file's helpers), so a bundle may carry it alone.
   ====================================================================== */
/* PALETTE */
/* every key a piece here names, as a DEFAULT: the culture's own palette wins for a key both define (whichever file
   loads first), so this file only fills gaps and never recolours a culture */
FURN_CULTURE('eastabyss', { palette: Object.assign({
  /* the eastabyss file's names for the Locus kit's RUSTC TIMBERC PLANKC THATCHC SALTCRUSTC BRASSC and fish */
  rustDeep: 0x7a3b22, rustRed: 0x8a4526, rustDark: 0x6a311e, rustBrown: 0x94522c, rustBlack: 0x5a2a1a,
  timberWalnut: 0x6a4e34, timberSmoke: 0x5c432c, plankOak: 0x9a7a52, plankTan: 0x8a6c48, plankHoney: 0xa8865c, plankDusk: 0x7c6040,
  thatchGold: 0xc8b272, saltWhite: 0xe9e4d6, brass: 0xb08432, riceGreen: 0xb0c46c, fishSilver: 0x9aa8b0, fishPale: 0xc0a888,
  /* new: the Locus kit's PADDYC[1] (the greener sheaf), the dock's hung net, SALTCRUSTC[1] (the salt in a tub) */
  riceSheaf: 0x9cbc5e, netGreen: 0x6a7a6c, saltBright: 0xf2ede2,
  /* new (2026-10, the builders' yard): the eastern-abyss biome's timber (biomes/eastabyss/src/50-biome-eastabyss-species.js:
     the seal-tree's and the scale-tree's bark), the pale sawn wood, sawdust and a salvaged saw blade */
  sealBark: 0x4e5646, sealBarkDark: 0x444c3c, sealBarkPale: 0x5e6654, scaleBark: 0x505c48, scaleBarkDark: 0x46523e, scaleBarkPale: 0x5a6652,
  sawnPale: 0xd6bf94, sawnFresh: 0xc9a974, sawnOld: 0xa89068, sawdust: 0xdcc8a0, sawBlade: 0x8c9094
}, FPAL['eastabyss'] || {}) });
FURN_CULTURE('yuni-common', { palette: Object.assign({
  /* new: the Locus kit's THATCHC (the warehouse's thatch bales); ropeMustard is the core's */
  thatchStraw: 0xb8a262, thatchOld: 0xa89256, thatchGold: 0xc8b272, thatchDark: 0x94824a, ropeMustard: 0x85743e
}, FPAL['yuni-common'] || {}) });
/* END PALETTE */

const JOB_SRC = {
  petroleum: 'settlements/locus/src/64-locus-petroleum.js ', power: 'settlements/locus/src/64-locus-power.js ',
  farm: 'settlements/locus/src/64-locus-farm.js farm_saltrice ', infra: 'settlements/locus/src/64-locus-infra.js ',
  abyssFarm: 'settlements/locus/src/65-abyss-90-farm.js '
};
/* the Locus kit's RUSTC, by its eastabyss names */
const JOB_DRUM = ['rustDeep', 'rustRed', 'rustDark', 'rustBrown', 'rustBlack'];
/* LOCUS.drum(..., lying): an Ancient steel drum on its side, its axis along local z, centred on (x, z), its
   bottom at y; the two rolling hoops the standing drum carries */
function JOB_lyingDrum(F, x, y, z, c) {
  F.rod(x, y + 0.32, z - 0.44, x, y + 0.32, z + 0.44, 0.30, c, 'rust');
  for (const s of [-1, 1]) F.rod(x, y + 0.32, z + s * 0.14 - 0.03, x, y + 0.32, z + s * 0.14 + 0.03, 0.32, F.shade(c, -0.25), 'rust');
}

/* ======== Harvested from settlements/locus (10 pieces): the leftovers of the kit-to-catalog conversion ======== */

/* ---------- oil ---------- */
FURN({
  key: 'job_oil_drum_lying', name: 'Oil drum, lying', culture: 'eastabyss', tier: 'common', job: 'oil', type: 'storage', role: 'barrel', setting: 'both',
  rooms: ['yard', 'store', 'workshop', 'dock'], anchor: 'floor', clearance: {},
  materials: ['rustSteel'], source: JOB_SRC.petroleum + 'locus_refinery (the fitters\' yard) and ' + JOB_SRC.abyssFarm + 'abyss_warehouse (the yard): LOCUS.drum(..., lying)',
  w: 0.65, d: 0.9, h: 0.65, variants: 1,
  build: function (F) {
    JOB_lyingDrum(F, 0, 0, 0, F.pick(JOB_DRUM));
  }
});
FURN({
  key: 'job_oil_drum_rack', name: 'Lying oil drums', culture: 'eastabyss', tier: 'common', job: 'oil', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'store', 'dock'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['rustSteel', 'timber', 'metal'], source: JOB_SRC.petroleum + 'locus_refinery (the loading bay\'s row of four) and ' + JOB_SRC.power + 'the fuel station (the lamp-oil cradle)',
  w: 2.75, d: 0.9, h: 0.65, variants: 2, variantNames: ['row of four on the ground', 'cradle of three with brass taps'],
  variantDims: [{ w: 2.75, d: 0.9, h: 0.65 }, { w: 3.4, d: 1.1, h: 1.07 }],
  build: function (F) {
    if (F.variant === 0) {
      for (let l = 0; l < 4; l++) JOB_lyingDrum(F, -1.05 + l * 0.7, 0, 0, F.col(JOB_DRUM[l]));
      return;
    }
    /* two timber bearers under the drums (the kit set the back one 0.6 m behind the drums' ends: here under them), the
       drums' taps to the front */
    for (const z of [-0.4, 0.2]) F.box(0, 0, z, 3.4, 0.45, 0.25, 0, F.col('timberWalnut'), 'wood');
    for (let k = 0; k < 3; k++) {
      JOB_lyingDrum(F, -1 + k, 0.42, -0.1, F.col(JOB_DRUM[(k + 2) % 5]));
      F.box(-1 + k, 0.6, 0.44, 0.12, 0.14, 0.2, 0, F.col('brass'), 'metal');
    }
  }
});

/* ---------- farming ---------- */
FURN({
  key: 'job_sheaf_rack', name: 'Sheaf-drying rack', culture: 'eastabyss', tier: 'common', job: 'farming', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'garden', 'store'], anchor: 'floor', clearance: { front: 0.5, back: 0.5 },
  materials: ['timber', 'foliage'], source: JOB_SRC.farm + '(the two drying racks, sheaves hung)',
  w: 3.5, d: 0.3, h: 1.9, variants: 1,
  build: function (F) {
    const tc = F.col('timberSmoke');
    for (const x of [-1.6, 1.6]) F.cyl(x, 0, 0, 0.06, 1.9, 0, tc, 'wood');
    F.rod(-1.7, 1.75, 0, 1.7, 1.75, 0, 0.04, tc, 'wood');
    for (let k = 0; k < 6; k++) F.box(-1.4 + k * 0.56, 1.05, 0, 0.34, 0.75, 0.25, 0, F.col(k % 2 ? 'riceGreen' : 'riceSheaf'), 'leafy');
  }
});
FURN({
  key: 'job_winnowing_tub', name: 'Winnowing tub', culture: 'eastabyss', tier: 'common', job: 'farming', type: 'vessel', setting: 'both',
  rooms: ['yard', 'store', 'kitchen'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber'], source: JOB_SRC.farm + '(the threshing floor\'s winnowing basket)',
  w: 0.7, d: 0.7, h: 0.5, variants: 1,
  build: function (F) {
    F.cyl(0, 0, 0, 0.34, 0.5, 0, F.col('plankDusk'), 'plank');
  }
});
FURN({
  key: 'job_winnowing_mat', name: 'Winnowing mat', culture: 'eastabyss', tier: 'common', job: 'farming', type: 'tool', setting: 'both',
  rooms: ['yard', 'store'], anchor: 'floor', clearance: {},
  materials: ['thatch'], source: JOB_SRC.farm + '(the threshing floor\'s reed mat)',
  w: 1.6, d: 0.8, h: 0.06, variants: 1,
  build: function (F) {
    F.box(0, 0, 0, 1.6, 0.06, 0.8, 0, F.col('thatchGold'), 'thatch');
  }
});

/* ---------- salt ---------- */
FURN({
  key: 'job_salt_heap', name: 'Salt heap', culture: 'eastabyss', tier: 'common', job: 'salt', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'store', 'market', 'dock'], anchor: 'floor', clearance: {},
  materials: ['plaster'], source: JOB_SRC.farm + '(the salt heap: a 3.2 m mound, 1.0 high)',
  w: 3.2, d: 3.2, h: 1.0, variants: 1,
  build: function (F) {
    F.dome(0, 0, 0, 1.6, 0.95, 0, F.col('saltWhite'), 'plaster');
  }
});
FURN({
  key: 'job_salt_tub', name: 'Salt tub', culture: 'eastabyss', tier: 'common', job: 'salt', type: 'vessel', setting: 'both',
  rooms: ['yard', 'store', 'market', 'kitchen'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'plaster'], source: JOB_SRC.farm + '(the salt heap\'s two wooden tubs)',
  w: 0.8, d: 0.8, h: 0.67, variants: 2, variantNames: ['heaped with salt', 'empty'],
  variantDims: [{ w: 0.8, d: 0.8, h: 0.67 }, { w: 0.72, d: 0.72, h: 0.5 }],
  build: function (F) {
    if (F.variant === 0) {
      F.cyl(0, 0, 0, 0.4, 0.55, 0, F.col('plankDusk'), 'plank');
      F.cyl(0, 0.55, 0, 0.36, 0.12, 0, F.col('saltBright'), 'plaster');
    } else F.cyl(0, 0, 0, 0.36, 0.5, 0, F.col('plankHoney'), 'plank');
  }
});

/* ---------- warehousing ---------- */
FURN({
  key: 'job_bales', name: 'Thatch bales', culture: 'yuni-common', tier: 'common', job: 'warehousing', type: 'stack', setting: 'both',
  rooms: ['store', 'yard', 'market', 'dock', 'stable'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['thatch', 'rope'], source: JOB_SRC.infra + 'locus_warehouse (the three bales on the loading plinth)',
  w: 1.0, d: 0.92, h: 0.82, variants: 2, variantNames: ['one bale', 'row of three'],
  variantDims: [{ w: 1.0, d: 0.92, h: 0.82 }, { w: 3.4, d: 0.92, h: 0.82 }],
  build: function (F) {
    const cord = F.col('ropeMustard');
    const bale = function (x, c) {
      F.box(x, 0, 0, 1.0, 0.8, 0.9, 0, c, 'thatch');
      for (const s of [-0.25, 0.25]) F.box(x + s, 0, 0, 0.03, 0.81, 0.91, 0, cord, 'rope');   /* the two cords round it */
    };
    if (F.variant === 0) bale(0, F.pick(['thatchStraw', 'thatchOld', 'thatchGold', 'thatchDark']));
    else ['thatchStraw', 'thatchOld', 'thatchGold'].forEach(function (k, i) { bale(-1.2 + i * 1.2, F.col(k)); });
  }
});

/* ---------- fishing ---------- */
FURN({
  key: 'job_net_frame', name: 'Net-drying frame', culture: 'eastabyss', tier: 'common', job: 'fishing', type: 'rack', setting: 'outdoor',
  rooms: ['dock', 'yard'], anchor: 'floor', clearance: { front: 0.5, back: 0.5 },
  materials: ['timber', 'cloth'], source: JOB_SRC.infra + 'infra_fishing_dock (the net shed\'s two drying frames, a net hung on each)',
  w: 2.6, d: 0.12, h: 1.9, variants: 1,
  build: function (F) {
    const tc = F.col('timberSmoke');
    for (const x of [-1.2, 1.2]) F.cyl(x, 0, 0, 0.05, 1.9, 0, tc, 'wood');
    F.rod(-1.25, 1.8, 0, 1.25, 1.8, 0, 0.03, tc, 'wood');
    F.box(0, 0.7, 0, 2.3, 1.1, 0.04, 0, F.col('netGreen'), 'cloth');
  }
});
FURN({
  key: 'job_fish_tray', name: 'Fish tray', culture: 'eastabyss', tier: 'common', job: 'fishing', type: 'vessel', setting: 'both',
  rooms: ['dock', 'market', 'kitchen', 'store'], anchor: 'floor', clearance: { front: 0.4 },
  materials: ['timber', 'food'], source: JOB_SRC.infra + 'infra_fishing_dock (the plank fish tray at the root of the jetty)',
  w: 1.2, d: 0.7, h: 0.18, variants: 2, variantNames: ['empty', 'with the catch'],
  build: function (F) {
    const pk = F.pick(['plankOak', 'plankTan', 'plankHoney', 'plankDusk']);
    F.box(0, 0, 0, 1.2, 0.05, 0.7, 0, pk, 'plank');
    for (const s of [-1, 1]) {
      F.box(0, 0, s * 0.335, 1.2, 0.18, 0.03, 0, F.shade(pk, -0.08), 'plank');
      F.box(s * 0.585, 0, 0, 0.03, 0.18, 0.64, 0, F.shade(pk, -0.08), 'plank');
    }
    if (F.variant === 1) for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) {
      const x = -0.36 + i * 0.36, z = (r ? 0.15 : -0.15), s = (i + r) % 2 ? 1 : -1, c = F.pick(['fishSilver', 'fishPale']);
      F.rod(x - s * 0.13, 0.095, z, x + s * 0.1, 0.095, z, 0.045, c, 'food');              /* the body, head to s */
      F.box(x - s * 0.16, 0.07, z, 0.06, 0.02, 0.09, 0, F.shade(c, -0.15), 'food');        /* the tail */
    }
  }
});

/* ======== The builders' yard (2026-10): timber for the Eastern Abyssal kit's abyss_shop_builder ========
   (settlements/locus/src/65-abyss-40-shops.js, Mungo's timber yard). The eastern-abyss biome's two timber trees:
   the seal-tree's fluted grey-green pole and the scale-tree's green-grey bark; sawn, both are pale. Outdoor only: the
   interiors never pick them for a room. */
const JOB_BARK = ['sealBark', 'sealBarkDark', 'sealBarkPale', 'scaleBark', 'scaleBarkDark', 'scaleBarkPale'];
const JOB_SAWN = ['sawnPale', 'sawnFresh', 'sawnOld'];
/* a pole or log from a to b ([x, y, z], its axis), radius r, in bark colour c, with a pale sawn disc on each end */
function JOB_pole(F, a, b, r, c) {
  F.rod(a[0], a[1], a[2], b[0], b[1], b[2], r, c, 'bark');
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L], cut = F.col('sawnFresh');
  for (const e of [[a, -1], [b, 1]]) {
    const p = e[0], s = e[1];
    F.rod(p[0] - s * u[0] * 0.006, p[1] - s * u[1] * 0.006, p[2] - s * u[2] * 0.006, p[0] + s * u[0] * 0.012, p[1] + s * u[1] * 0.012, p[2] + s * u[2] * 0.012, r * 0.9, cut, 'wood');
  }
}
/* a spoked wheel standing in the local x-y plane (its axle along z) at (x, y, z), radius R: an octagonal rim of beams
   (a rod's round section drops to four sides at the runtime's detail, a beam's square does not) */
function JOB_wheel(F, x, y, z, R, c) {
  for (let k = 0; k < 8; k++) {
    const a0 = k * Math.PI / 4 + Math.PI / 8, a1 = a0 + Math.PI / 4;
    F.beam(x + Math.cos(a0) * R, y + Math.sin(a0) * R, z, x + Math.cos(a1) * R, y + Math.sin(a1) * R, z, 0.07, 0.07, c, 'rust');
  }
  for (let k = 0; k < 2; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4;
    F.beam(x - Math.cos(a) * R, y - Math.sin(a) * R, z, x + Math.cos(a) * R, y + Math.sin(a) * R, z, 0.04, 0.04, c, 'rust');
  }
}

/* ---------- carpentry ---------- */
FURN({
  key: 'job_pole_rack', name: 'Timber poles', culture: 'eastabyss', tier: 'common', job: 'carpentry', type: 'rack', setting: 'outdoor',
  rooms: ['yard', 'dock'], anchor: 'floor', clearance: { front: 0.8 },
  materials: ['bark', 'timber'],
  w: 6.4, d: 1.6, h: 1.4, variants: 3, variantNames: ['seal-tree and scale-tree poles on trestles', 'felled logs on skids', 'poles leaning on a rail'],
  variantDims: [{ w: 6.4, d: 1.6, h: 1.4 }, { w: 6.2, d: 2.2, h: 1.25 }, { w: 4.4, d: 2.1, h: 4.6 }],
  build: function (F) {
    const v = F.variant, tc = F.col('timberSmoke');
    if (v === 0) {
      /* three trestles (two legs, two bearers), six poles on the low bearers and four on the high */
      for (const x of [-2.6, 0, 2.6]) {
        for (const z of [-0.7, 0.7]) F.box(x, 0, z, 0.12, 1.3, 0.12, 0, tc, 'wood');
        F.box(x, 0.36, 0, 0.14, 0.12, 1.56, 0, tc, 'wood');
        F.box(x, 0.86, 0, 0.14, 0.12, 1.56, 0, tc, 'wood');
      }
      for (let i = 0; i < 6; i++) {
        const r = F.rr(0.07, 0.1), z = -0.6 + i * 0.24;
        JOB_pole(F, [-3.1 + F.rr(0, 0.2), 0.48 + r, z], [3.1 - F.rr(0, 0.2), 0.48 + r, z], r, F.pick(JOB_BARK));
      }
      for (let i = 0; i < 4; i++) {
        const r = F.rr(0.06, 0.09), z = -0.45 + i * 0.3;
        JOB_pole(F, [-3.0 + F.rr(0, 0.3), 0.98 + r, z], [3.0 - F.rr(0, 0.3), 0.98 + r, z], r, F.pick(JOB_BARK));
      }
    } else if (v === 1) {
      /* the felled logs as the lumberjacks deliver them: three on skids, two in the grooves on top, bark on */
      for (const x of [-2.0, 0.2, 2.2]) F.box(x, 0, 0, 0.22, 0.16, 2.1, 0, tc, 'wood');
      const R = [0.3, 0.27, 0.32];
      [-0.68, 0, 0.68].forEach(function (z, i) {
        JOB_pole(F, [-3.05 + F.rr(0, 0.15), 0.16 + R[i], z], [3.05 - F.rr(0, 0.15), 0.16 + R[i], z], R[i], F.pick(JOB_BARK));
      });
      [-0.34, 0.34].forEach(function (z) {
        const r = F.rr(0.22, 0.26);
        JOB_pole(F, [-2.8 + F.rr(0, 0.3), 0.92, z], [2.8 - F.rr(0, 0.3), 0.92, z], r, F.pick(JOB_BARK));
      });
    } else {
      /* poles stood on end, leaning back on a rail between two posts: the seal-tree's long unbranched shafts */
      for (const x of [-2.0, 2.0]) F.box(x, 0, -0.6, 0.14, 3.4, 0.14, 0, tc, 'wood');
      F.box(0, 3.1, -0.6, 4.3, 0.12, 0.14, 0, tc, 'wood');
      for (let i = 0; i < 11; i++) {
        const x = -1.8 + i * 0.36 + F.rr(-0.05, 0.05), r = F.rr(0.06, 0.09), top = F.rr(4.0, 4.45);
        const fz = 0.72, rz = -0.53 + r, t = top / 3.16;           /* foot at z 0.72, touching the rail's front face at y 3.16 */
        F.rod(x, 0.03, fz, x, top, fz + (rz - fz) * t, r, F.pick(JOB_BARK), 'bark');
      }
    }
  }
});
FURN({
  key: 'job_plank_stack', name: 'Sawn planks', culture: 'eastabyss', tier: 'common', job: 'carpentry', type: 'stack', setting: 'outdoor',
  rooms: ['yard', 'dock'], anchor: 'floor', clearance: { front: 0.6 },
  materials: ['timber'],
  w: 4.2, d: 1.3, h: 1.1, variants: 2, variantNames: ['stickered stack, drying', 'boards on squared beams'],
  variantDims: [{ w: 4.2, d: 1.3, h: 1.1 }, { w: 3.8, d: 1.2, h: 0.62 }],
  build: function (F) {
    const tc = F.col('timberSmoke');
    if (F.variant === 0) {
      /* three sleepers, seven layers of four boards, the layers held apart by thin stickers so the air dries them */
      for (const x of [-1.7, 0, 1.7]) F.box(x, 0, 0, 0.16, 0.14, 1.3, 0, tc, 'wood');
      for (let l = 0; l < 7; l++) {
        const y = 0.14 + l * 0.13;
        for (let b = 0; b < 4; b++) F.box(F.rr(-0.06, 0.06), y, -0.465 + b * 0.31, F.rr(3.9, 4.0), 0.08, 0.27, 0, F.shade(F.pick(JOB_SAWN), F.rr(-0.05, 0.05)), 'plank');
        if (l < 6) for (const x of [-1.7, 0, 1.7]) F.box(x, y + 0.08, 0, 0.05, 0.05, 1.24, 0, F.col('sawnOld'), 'wood');
      }
    } else {
      /* three squared beams on two sleepers, a layer of boards across them, a beam on top */
      for (const x of [-1.4, 1.4]) F.box(x, 0, 0, 0.16, 0.12, 1.2, 0, tc, 'wood');
      for (const z of [-0.4, 0, 0.4]) F.box(F.rr(-0.05, 0.05), 0.12, z, 3.6, 0.2, 0.2, 0, F.pick(JOB_SAWN), 'plank');
      for (let b = 0; b < 4; b++) F.box(F.rr(-0.08, 0.08), 0.32, -0.42 + b * 0.28, 3.5, 0.06, 0.24, 0, F.shade(F.pick(JOB_SAWN), F.rr(-0.05, 0.05)), 'plank');
      F.box(0, 0.38, 0.05, 3.4, 0.2, 0.2, 0.03, F.pick(JOB_SAWN), 'plank');
    }
  }
});
FURN({
  key: 'job_saw_bench', name: 'Saw bench', culture: 'eastabyss', tier: 'common', job: 'carpentry', type: 'workstation', setting: 'outdoor',
  rooms: ['yard'], anchor: 'floor', clearance: { front: 0.9, back: 0.6 },
  materials: ['timber', 'bark', 'metal', 'rustSteel'],
  w: 3.0, d: 1.6, h: 1.9, variants: 2, variantNames: ['hand-cranked saw bench', 'saw-pit trestles with a pit saw'],
  variantDims: [{ w: 3.0, d: 1.6, h: 1.9 }, { w: 4.6, d: 1.6, h: 2.6 }],
  build: function (F) {
    const tc = F.col('timberSmoke'), blade = F.col('sawBlade'), dust = F.col('sawdust');
    if (F.variant === 0) {
      /* a plank bench with a slot at x 0.4; a pole on it, a frame saw rising and falling in the slot between two posts,
         worked by a crank wheel (a salvaged cart wheel) on the front through a connecting rod */
      for (const x of [-1.2, 1.2]) for (const z of [-0.28, 0.28]) F.box(x, 0, z, 0.1, 0.8, 0.1, 0, tc, 'wood');
      F.box(-0.475, 0.8, 0, 1.65, 0.08, 0.7, 0, F.col('sawnOld'), 'plank');
      F.box(0.875, 0.8, 0, 0.85, 0.08, 0.7, 0, F.col('sawnOld'), 'plank');
      JOB_pole(F, [-1.4, 1.0, 0], [1.25, 1.0, 0], 0.12, F.pick(JOB_BARK));
      for (const z of [-0.42, 0.42]) F.box(0.4, 0, z, 0.1, 1.8, 0.1, 0, tc, 'wood');
      F.box(0.4, 1.72, 0, 0.12, 0.08, 0.96, 0, tc, 'wood');
      F.box(0.4, 0.45, 0, 0.02, 1.25, 0.28, 0, blade, 'metal');                     /* the blade, through the pole */
      F.box(0.4, 1.66, 0, 0.08, 0.06, 0.4, 0, tc, 'wood');                          /* its upper yoke */
      JOB_wheel(F, 1.0, 0.55, 0.62, 0.45, F.col('rustDeep'));
      F.rod(1.0, 0.55, 0.5, 1.0, 0.55, 0.72, 0.05, tc, 'wood');                      /* the axle */
      F.rod(1.0, 0.55, 0.7, 1.25, 0.8, 0.7, 0.03, F.col('rustDeep'), 'rust');        /* the crank and its handle */
      F.rod(1.25, 0.8, 0.7, 1.25, 0.8, 0.78, 0.03, tc, 'wood');
      F.rod(1.0, 0.95, 0.58, 0.42, 0.5, 0.12, 0.025, F.col('rustDeep'), 'rust');     /* the connecting rod to the blade's foot */
      F.dome(0.4, 0, 0, 0.38, 0.12, 0, dust, 'wood');
    } else {
      /* two tall A-trestles, a log on them, a two-man pit saw through it (the top sawyer's tiller, the pitman's box) */
      for (const x of [-1.3, 1.3]) {
        for (const s of [-1, 1]) F.beam(x, 0, s * 0.7, x, 1.52, s * 0.1, 0.12, 0.12, tc, 'wood');
        F.box(x, 1.44, 0, 0.16, 0.14, 0.5, 0, tc, 'wood');
      }
      JOB_pole(F, [-2.25, 1.86, 0], [2.25, 1.86, 0], 0.28, F.pick(JOB_BARK));
      F.box(0.6, 0.9, 0, 0.03, 1.6, 0.2, 0, blade, 'metal');
      F.box(0.6, 2.5, 0, 0.06, 0.06, 0.6, 0, tc, 'wood');
      F.box(0.6, 0.84, 0, 0.08, 0.1, 0.36, 0, tc, 'wood');
      F.dome(0.6, 0, 0, 0.5, 0.15, 0, dust, 'wood');
    }
  }
});
