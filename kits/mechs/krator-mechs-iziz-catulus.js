/* ======================================================================
   Iziz mech: the Catulus (kits/mechs/krator-mechs-iziz-catulus.js)

   An Ancient survey drone, about the size of a hound: a capsule body on four thin
   legs, a lens at its nose and an aerial at its tail, a pack of instruments on its back.
   Nobody rides it; it follows the Speculator, or a scout, on the end of its own wits.
   The scouts paint a numeral on its pack and tie a feather to its aerial. When it finds
   something it stops, sounds its siren and darts at it.
   ====================================================================== */
MECH({
  key: 'iz_catulus', name: 'Catulus', culture: 'iziz',
  role: 'scout drone: the hound', origin: 'Ancient survey drone',
  lore: 'A survey drone the size of a hound that follows the scouts on its own wits, a numeral on its pack and a feather on its aerial. When it finds something it sounds its siren and darts at it.',
  tags: { class: 'mech', type: ['scout', 'utility'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: ['none'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Hound III'],
  w: 0.6, d: 1.2, h: 1.5,
  data: { height: 1.0, mass: 0.2, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a siren and a lens',
    engine: 'Ancient cell', armour: 'none' },
  gait: { period: 0.8, duty: 0.6, stride: 0.42, lift: 0.1, bob: 0.015, sway: 0.01, roll: 0.02, twist: 0.03, lean: 0.02,
    offsets: [0, 0.5, 0.5, 0] },
  idle: { breathe: 0.01, scan: 0.5, look: 0 },
  attack: {
    kind: 'siren and dart', dur: 1.8,
    keys: [
      [0, {}],
      [0.35, { b: { body: [-0.12, 0, 0], head: [-0.25, 0, 0] }, s: { body: [0, -0.06, -0.05] } }, 's'],
      [0.8, { b: { body: [-0.12, 0, 0], head: [-0.3, 0.15, 0] }, s: { body: [0, -0.1, -0.08] } }, 's'],
      [1.0, { b: { body: [0.15, 0, 0], head: [0.1, 0, 0] }, s: { body: [0, -0.05, 0.2] } }, 'i'],
      [1.15, { b: { body: [0.1, 0, 0], head: [0.05, 0, 0] }, s: { body: [0, -0.06, 0.18] } }, 'o'],
      [1.8, {}, 's']
    ],
    events: [{ t: 0.4, type: 'call', at: 'lens_pt', dir: [0, 0, 1] }, { t: 1.01, type: 'impact', at: 'lens_pt', r: 0.4 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- the capsule, the pack */
    R.bone('body', null, 0, 0.62, 0);
    R.on('body');
    F.cy(0, 0.05, -0.05, 0.17, 0.17, 0.5, lt, 'paint', 'z', 16);
    F.sph(0, 0.05, -0.3, 0.17, 0.17, 0.12, lt, 'paint', 16, 8);
    F.cy(0, 0.05, 0.05, 0.176, 0.176, 0.1, or, 'paint', 'z', 16);
    F.cy(0, 0.05, -0.2, 0.181, 0.181, 0.03, cr, 'paint', 'z', 16);
    F.chb(0, 0.27, -0.12, 0.22, 0.14, 0.3, 0.03, gun, 'metal', 'z');
    F.cb(0, 0.27, -0.12, 0.234, 0.08, 0.2, or, 'paint');
    IZ.numeral(F, 0, 0.27, 0.05, 'III', 0.05);
    F.cb(0, -0.13, -0.05, 0.22, 0.06, 0.4, dk, 'metal');
    /* the aerial at the tail, a feather on it */
    R.dangle('ant', 'body', 0.06, 0.2, -0.32, { mode: 'whip', len: 0.6, k: 26, c: 2.6, wind: 0.02, max: 0.35, rx: -0.35 });
    R.on('ant');
    F.rod(0, 0, 0, 0, 0.6, 0, 0.008, iron, 'metal');
    F.knob(0, 0.6, 0, 0.018, c('lensRed'), 'glow');
    IZ.feathers(F, R, 'fth', 'ant', 0.03, 0.45, 0, { n: 3, len: 0.18, cord: 0.05, cols: ['fScarlet', 'fGold'] });

    /* ---- the head: a short neck, a lens */
    R.bone('head', 'body', 0, 0.06, 0.2);
    R.on('head');
    F.cy(0, 0.0, 0.04, 0.09, 0.11, 0.1, iron, 'metal', 'z', 10);
    F.chb(0, 0.02, 0.17, 0.22, 0.17, 0.18, 0.04, steel, 'paint', 'x');
    F.cb(0, 0.115, 0.17, 0.2, 0.02, 0.16, or, 'paint');
    MP.lamp(F, 0, 0.02, 0.27, 0, 0, 1, 0.045, 'amber', gun);
    for (const s of [-1, 1]) F.cy(s * 0.08, 0.06, 0.262, 0.015, 0.015, 0.02, c('eye'), 'glow', 'z', 6);
    R.point('lens_pt', 'head', 0, 0.02, 0.34);

    /* ---- four thin legs: the fore knees bend back, the hind forward; little pads */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.15, -0.06, sz * 0.2], L1: 0.32, L2: 0.32, knee: sz > 0 ? -1 : 1, ankleH: 0.08,
        rest: [sx * 0.2, sz * 0.24], toe: 0.06 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.06, 0.1, 'x', iron, null);
      F.chb(0, -0.15, 0, 0.07, 0.26, 0.09, 0.02, steel, 'paint', 'y');
      F.cb(sx * 0.037, -0.13, 0, 0.01, 0.14, 0.05, or, 'paint');
      R.on(n + '_knee');
      F.knob(0, 0, 0, 0.035, gun, 'metal');
      F.rod(0, 0, 0, 0, -0.32, 0, 0.022, dk, 'metal');
      R.on(n + '_ankle');
      F.cy(0, -0.045, 0.01, 0.04, 0.05, 0.07, gun, 'rubber', 'y', 8);
    }
  }
});
