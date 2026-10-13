/* ======================================================================
   Krator Fauna: the Ring Sea (kits/fauna/krator-fauna-ringsea.js)
   The creatures of the Ring Sea coast and its isles, drawn in the kit's procedural style. First: the giant sea lion
   (2026-10-12), a rookery animal that hauls out on the shingle and the geyser isles and hunts the shoals.
   Uses the faHj* tube helpers of krator-fauna-hyperjungle.js, so a bundle that takes `ringsea` must also take `hyperjungle`.
   ====================================================================== */
const FA_RS_SEALION = [{ coat: 0x8a5a2a, belly: 0xb88a52, mane: 0x6a3e1c }, { coat: 0xa88454, belly: 0xd0b078, mane: 0xa88454 }, { coat: 0x3a2a20, belly: 0x5a4434, mane: 0x2a1c14 }];
ANIMAL({
  key: 'giant-sea-lion', name: 'Giant sea lion', group: 'ringsea',
  tags: { biomes: ['ringsea'], koppen: ['Af', 'Am', 'Aw'], aridity: ['humid', 'subhumid'], climate: ['tropic', 'hypertropic'], riparian: 'riparian', abyssal: false,
    domestic: false, herdedBy: [], diet: 'carnivore', feeding: 'predator', activity: 'diurnal', temperament: 'defensive',
    habitat: ['water', 'shallows', 'rock'], locomotion: ['swims', 'walks'] },
  size: { length: 4.2, height: 1.85 },
  source: [{ build: 'kits/fauna', file: 'krator-fauna-ringsea.js', lines: '-', note: 'first drawn here (2026-10-12): the Ring Sea\'s eared seal, a bull the size of a boat; harems haul out on the shingle and the geyser isles, and the bulls roar and fight at the water\'s edge' }],
  traits: { edible: true, milkable: false, tameable: false, rideable: false, draught: false, eggs: false },
  yields: { meat: { amount: 600, note: 'dark and oily: eaten fresh by the islanders, the rest rendered' }, hide: { amount: 1, hideM2: 7, note: 'thick, supple: boats\' skins, boots, drum heads' },
    ivory: { amount: 0.4, note: 'the bull\'s canines' } },
  life: { maturity: 6, lifespan: 28, litter: 1, gestation: 350, note: 'one pup a year, born on the rookery; a bull holds a beach of twenty cows' },
  variants: 3, variantNames: ['bull, golden-brown, maned', 'cow, tan', 'old bull, dark'],
  w: 1.95, d: 4.2, h: 1.85,
  data: { mass: 1200, legs: 4, speed: { walk: 0.9, run: 3.5 }, gait: { type: 'quadruped', freq: 0.9, stride: 0.5 }, swim: { freq: 0.6, amp: 0.18, axis: 'x' }, grazePitch: 0.2,
    herd: 'a rookery: one bull and twenty cows on a beach, the young bulls in a bachelor raft off it', fleeDistance: 6, aggression: 0.5,
    idle: { headYaw: 0.35, headPitch: 0.1, tailYaw: 0.05 },
    schedule: ['REST', 'REST', 'REST', 'REST', 'REST', 'SWIM', 'HUNT', 'HUNT', 'HUNT', 'SWIM', 'SWIM', 'REST', 'REST', 'REST', 'REST', 'SWIM', 'HUNT', 'HUNT', 'SWIM', 'REST', 'REST', 'REST', 'REST', 'REST'], scheduleNote: 'HUNT: the shoals off the coast; REST: hauled out in the sun' },
  build: function (A) {
    const C = FA_RS_SEALION[A.variant] || FA_RS_SEALION[0], S = A.S, bull = A.variant !== 1, mix = faHiMix, R = rows => rows.map(r => r.map(x => x * S));
    const sleek = (t, a) => mix(C.coat, C.belly, faHjSm(0.1, -0.7, Math.cos(a)) * 0.9);
    /* the body: a thick torpedo, deepest at the shoulders, tapering to the hips; the neck a heavy column */
    faHjRows(A, 'sleek', R([[0, .46, -1.55, .05, .06], [0, .5, -1.2, .26, .3], [0, .62, -.5, .46, .44], [0, .72, .3, .54, .5], [0, .86, .85, .44, .48], [0, 1.12, 1.2, .32, .36], [0, 1.44, 1.42, .25, .28]]), 18, 20, null, { round: [0.05, 0], colf: sleek });
    if (bull) faHjRows(A, 'shag', R([[0, 1.0, 1.0, .38, .42], [0, 1.22, 1.22, .38, .42], [0, 1.42, 1.38, .32, .36]]), 8, 18, mix(C.mane, C.coat, 0.2), { shag: [0.18, 6], round: [0.15, 0.2] });   /* the bull's mane */
    A.part('head', [0, 1.45 * S, 1.4 * S], () => {
      faHjRows(A, 'sleek', R([[0, 1.5, 1.34, .24, .26], [0, 1.54, 1.62, .2, .2], [0, 1.48, 1.86, .13, .12], [0, 1.45, 2.0, .085, .08]]), 12, 16, null, { round: [0, 0.12], colf: sleek });
      A.ellip('skin', 0, 1.47 * S, 2.03 * S, .06 * S, .045 * S, .04 * S, 0x1a1210, { seg: 8 });                      /* the nose */
      for (const s of [-1, 1]) {
        A.ellip('eye', s * .16 * S, 1.62 * S, 1.72 * S, .028 * S, .03 * S, .028 * S, 0x0a0806, { seg: 8 });
        A.ellip('skin', s * .18 * S, 1.74 * S, 1.45 * S, .035 * S, .06 * S, .035 * S, mix(C.coat, 0x1a1210, .3), { seg: 6, rz: s * 0.3 });   /* the small rolled ears */
        for (let k = 0; k < 6; k++) { const z = 1.82 + k * 0.025, y = 1.44 - (k % 3) * 0.015; A.cone('hair', [s * .05 * S, y * S, z * S], [s * .3 * S, (y - 0.04 - k * 0.012) * S, (z + .08) * S], .004 * S, .001 * S, 0xe8e0c8, 3); }   /* the whiskers */
        A.cone('horn', [s * .05 * S, 1.41 * S, 1.9 * S], [s * .055 * S, 1.34 * S, 1.93 * S], .012 * S, .003 * S, 0xe8e0c0, 4);                   /* a canine */
      }
    });
    A.part('tail', [0, .5 * S, -1.5 * S], () => A.cone('sleek', [0, .5 * S, -1.5 * S], [0, .46 * S, -1.7 * S], .05 * S, .02 * S, C.coat, 5));
    /* the fore-flippers: long paddles that prop the body ashore; the hind-flippers trail back, folded together */
    for (let i = 0; i < 4; i++) {
      const s = (i & 1) ? -1 : 1, hind = i >> 1;
      const rows = hind ? [[s * .14, .36, -1.25, .13, .13], [s * .24, .22, -1.7, .11, .06], [s * .34, .03, -2.1, .2, .03]] : [[s * .46, .62, .95, .12, .14], [s * .68, .34, .9, .08, .16], [s * .8, .03, .78, .05, .2]];
      A.part('leg' + i, [rows[0][0] * S, rows[0][1] * S, rows[0][2] * S], () => {
        faHjRows(A, 'sleek', R(rows), 8, 10, null, { round: [0, 0.1], colf: (t, a) => mix(C.coat, 0x1a1210, 0.25 * t) });
        if (!hind) for (let k = -1; k <= 1; k++) A.cone('horn', [s * .8 * S, .03 * S, (.78 + k * .09) * S], [s * .84 * S, .015 * S, (.8 + k * .11) * S], .014 * S, .004 * S, 0x2a2018, 4);
      });
    }
    A.anchor('lead', [0, 1.47 * S, 2.0 * S]); A.anchor('headRoot', [0, 1.45 * S, 1.4 * S]); A.anchor('tailRoot', [0, .5 * S, -1.5 * S]);
  }
});
