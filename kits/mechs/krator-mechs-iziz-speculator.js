/* ======================================================================
   Iziz mech: the Speculator (kits/mechs/krator-mechs-iziz-speculator.js)

   An Ancient prospector: a hunched biped that walked the dunes listening to the ground,
   its operator in a pod in the chest, a sensor head on a neck in front of it, two long
   thin arms for taking samples. The Forgemasters' scouts wrap its legs in canvas against
   the sand, tie their kit to its sides and send it ahead of a column with a little
   four-legged drone (the Catulus) running at its heels. It snatches with its long arms.
   ====================================================================== */
MECH({
  key: 'iz_speculator', name: 'Speculator', culture: 'iziz',
  role: 'scout: long arms and a sensor head', origin: 'Ancient prospector',
  lore: 'A prospector of the dunes, its legs wrapped in canvas against the sand. The scouts send it ahead of the column with a little drone at its heels; it listens with its head low and snatches with its long arms.',
  tags: { class: 'mech', type: ['scout', 'utility'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Outrider'],
  w: 2.8, d: 3.6, h: 6.0,
  data: { height: 4.4, mass: 8, crew: 1, pilot: 'chest', reach: 3.2, weapon: 'two long sampling arms with pincers',
    engine: 'Ancient cell pack, hydraulic', armour: 'canvas over light plate' },
  gait: { period: 1.6, duty: 0.6, stride: 1.3, lift: 0.34, bob: 0.07, sway: 0.07, roll: 0.03, twist: 0.05, lean: 0.06,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.22, 0, 0], arm_r_sh: [0.22, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.4, look: 0.5 },
  anim: {
    idle: function (P, t, w) {
      const a = Math.sin(t * 0.6) * 0.12 * w, b = Math.sin(t * 0.6 + 2.1) * 0.12 * w;
      P.b.arm_l_el = [a, 0, 0]; P.b.arm_r_el = [b, 0, 0];
      P.b.ant = [0.08 * Math.sin(t * 1.3) * w, 0, 0];
    }
  },
  attack: {
    kind: 'snatch', dur: 2.2,
    keys: [
      [0, {}],
      [0.6, { b: { torso: [-0.15, 0.2, 0], head: [-0.2, 0, 0], arm_r_sh: [-0.4, 0, -0.5], arm_r_el: [-0.9, 0, 0], arm_l_sh: [-0.2, 0, 0.3] },
        s: { body: [0, -0.15, -0.1] } }, 's'],
      [0.85, { b: { torso: [0.25, -0.1, 0], head: [0.15, 0, 0], arm_r_sh: [-1.5, 0, -0.05], arm_r_el: [0.0, 0, 0], arm_r_wr: [0.2, 0, 0],
        arm_l_sh: [-0.6, 0, 0.1], pin_r_a: [0, 0, 0.4], pin_r_b: [0, 0, -0.4] }, s: { body: [0, -0.22, 0.35] } }, 'i'],
      [1.05, { b: { torso: [0.2, -0.1, 0], head: [0.1, 0, 0], arm_r_sh: [-1.4, 0, -0.05], arm_r_el: [-0.2, 0, 0], arm_r_wr: [0.2, 0, 0],
        arm_l_sh: [-0.6, 0, 0.1], pin_r_a: [0, 0, -0.1], pin_r_b: [0, 0, 0.1] }, s: { body: [0, -0.2, 0.3] } }, 'o'],
      [1.4, { b: { torso: [-0.05, 0.1, 0], arm_r_sh: [-0.6, 0, -0.2], arm_r_el: [-1.4, 0, 0], pin_r_a: [0, 0, -0.1], pin_r_b: [0, 0, 0.1] },
        s: { body: [0, -0.08, 0] } }, 's'],
      [2.2, {}, 's']
    ],
    events: [{ t: 0.86, type: 'impact', at: 'snatch_pt', r: 1.0 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const canvas = c('canvas'), cord = c('rope');

    /* ---- the hips */
    R.bone('body', null, 0, 2.55, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.95, 0.45, 0.75, 0.12, gun, 'metal', 'z');
    for (const s of [-1, 1]) F.cb(s * 0.52, -0.05, 0, 0.05, 0.35, 0.5, dk, 'metal');

    /* ---- the torso, hunched: the pod, the pack, the kit tied on */
    R.bone('torso', 'body', 0, 0.3, -0.05, 0.42, 0, 0);
    R.on('torso');
    F.cy(0, 0.08, 0, 0.3, 0.34, 0.24, iron, 'metal', 'y', 12);
    F.sph(0, 0.75, 0.05, 0.7, 0.62, 0.68, steel, 'paint', 20, 12);
    F.sph(0, 0.75, 0.05, 0.716, 0.2, 0.696, or, 'paint', 20, 6, 0, TAU, Math.PI * 0.3, Math.PI * 0.4);
    F.cb(0, 0.9, 0.66, 0.5, 0.26, 0.12, gun, 'metal');
    F.cb(0, 0.9, 0.725, 0.4, 0.16, 0.02, c('glass'), 'glass');
    F.chb(0, 0.55, 0.62, 0.42, 0.24, 0.1, 0.04, cr, 'paint', 'x');
    IZ.numeral(F, 0, 0.55, 0.675, 'III', 0.13);
    /* the pack behind, a bedroll and a waterskin tied on */
    F.chb(0, 0.75, -0.72, 0.9, 0.85, 0.42, 0.1, gun, 'metal', 'z');
    for (let i = 0; i < 3; i++) F.cb(0, 0.5 + i * 0.2, -0.94, 0.6, 0.05, 0.04, iron, 'metal');
    MP.bundle(F, 0, 1.28, -0.7, 0.16, 1.05, canvas, cord, 'x');
    F.sph(-0.68, 0.55, -0.35, 0.16, 0.24, 0.13, c('leather'), 'leather', 10, 8);
    F.cb(0.75, 0.6, -0.25, 0.22, 0.42, 0.42, canvas, 'cloth');
    F.cb(0.865, 0.6, -0.25, 0.02, 0.44, 0.06, cord, 'rope');

    /* ---- the head on its neck: a sensor block, two eyes, an aerial */
    R.bone('head', 'torso', 0, 1.15, 0.45, -0.3, 0, 0);
    R.on('head');
    F.rod(0, 0, 0, 0, 0.12, 0.42, 0.09, iron, 'metal');
    F.chb(0, 0.15, 0.62, 0.5, 0.3, 0.44, 0.08, lt, 'paint', 'x');
    F.cb(0, 0.31, 0.62, 0.52, 0.04, 0.4, or, 'paint');
    for (const s of [-1, 1]) MP.lamp(F, s * 0.13, 0.15, 0.85, 0, 0, 1, 0.06, 'amber', gun);
    F.cy(0, 0.0, 0.85, 0.05, 0.05, 0.06, c('eye'), 'glow', 'z', 8);
    R.dangle('ant', 'head', 0.18, 0.32, 0.5, { mode: 'whip', len: 0.9, k: 30, c: 3, wind: 0.02, max: 0.3 });
    R.on('ant');
    F.rod(0, 0, 0, 0, 0.9, -0.15, 0.012, iron, 'metal');
    F.knob(0, 0.9, -0.15, 0.03, c('lensRed'), 'glow');
    R.on('head');
    F.rod(-0.18, 0.3, 0.5, -0.22, 0.55, 0.42, 0.015, iron, 'metal');
    F.disc(-0.22, 0.58, 0.42, 0, 0.3, 1, 0.09, 0.02, br, 'bronze', 12);

    /* ---- arms: long and thin, three segments, pincers */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 0.72, 0.85, 0.2, -0.3, 0, s * 0.1);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.15, 0.24, 'x', iron, br);
      F.rod(0, -0.08, 0, 0, -1.05, 0, 0.06, steel, 'paint');
      F.cy(0, -0.3, 0, 0.085, 0.085, 0.16, or, 'paint', 'y', 10);
      R.bone(A + '_el', A + '_sh', 0, -1.12, 0, -0.35, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.09, 0.18, 'x', iron, null);
      F.rod(0, -0.05, 0, 0, -1.0, 0, 0.048, c('fBlue'), 'paint');
      R.bone(A + '_wr', A + '_el', 0, -1.05, 0, 0.2, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.05, 0, 0.07, 0.06, 0.12, gun, 'metal', 'y', 8);
      for (const k of [['_a', 1], ['_b', -1]]) {
        const P = 'pin_' + (s > 0 ? 'l' : 'r') + k[0];
        R.bone(P, A + '_wr', k[1] * 0.04, -0.1, 0);
        R.on(P);
        F.rod(0, 0, 0, k[1] * 0.08, -0.16, 0, 0.022, gun, 'metal');
        F.rod(k[1] * 0.08, -0.16, 0, k[1] * 0.01, -0.32, 0, 0.018, gun, 'metal');
      }
      MP.hose(F, R, 'torso', [s * 0.55, 0.6, -0.45], A + '_sh', [0, -0.25, -0.08], 0.035, c('rubber'), 0.12);
    }
    R.point('snatch_pt', 'arm_r_wr', 0, -0.35, 0);

    /* ---- legs: plated, wrapped in canvas tied with cord, heavy boots */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.5, -0.12, 0], L1: 1.2, L2: 1.2, knee: 1, ankleH: 0.42, rest: [s * 0.58, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.2, 0.38, 'x', iron, br);
      F.cy(0, -0.6, 0.02, 0.3, 0.27, 1.0, canvas, 'cloth', 'y', 9);
      for (const y of [-0.25, -0.62, -0.95]) { const r = 0.27 + (-0.1 - y) * 0.03 + 0.015; F.cy(0, y, 0.02, r, r, 0.04, cord, 'rope', 'y', 9); }
      F.cb(s * 0.27, -0.5, 0.05, 0.04, 0.42, 0.24, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.19, 0.42, 'x', iron, br);
      F.chb(0, 0.0, 0.2, 0.36, 0.3, 0.12, 0.05, lt, 'paint', 'x');
      F.cy(0, -0.6, 0, 0.27, 0.23, 1.0, canvas, 'cloth', 'y', 9);
      for (const y of [-0.3, -0.65, -0.98]) { const r = 0.23 + (-0.1 - y) * 0.04 + 0.015; F.cy(0, y, 0, r, r, 0.04, cord, 'rope', 'y', 9); }
      F.cb(0, -0.5, -0.27, 0.12, 0.6, 0.04, c('leather'), 'leather');
      R.on(Lg + '_ankle');
      F.cy(0, -0.06, 0, 0.2, 0.24, 0.2, c('leather'), 'leather', 'y', 10);
      F.chb(0, -0.29, 0.12, 0.48, 0.2, 0.8, 0.06, c('leather'), 'leather', 'z');
      F.chb(0, -0.38, 0.12, 0.52, 0.08, 0.86, 0.03, iron, 'metal', 'z');
      F.cb(0, -0.24, 0.5, 0.42, 0.12, 0.1, steel, 'paint');
    }

    /* ---- feathers at the head, a little flag at the pack */
    IZ.feathers(F, R, 'fth', 'head', 0.25, 0.1, 0.5, { n: 4, len: 0.4, cols: ['fBlue', 'fGold', 'fScarlet'] });
    IZ.sashimono(F, R, 'sashi', 'torso', -0.35, 1.12, -0.85, { h: 1.6, w: 0.42, bh: 1.0, paint: IZ.paint(F, 'teal'), side: -1 });
  }
});
