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
  riceSheaf: 0x9cbc5e, netGreen: 0x6a7a6c, saltBright: 0xf2ede2
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
