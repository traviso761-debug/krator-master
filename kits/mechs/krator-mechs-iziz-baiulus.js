/* ======================================================================
   Iziz mech: the Baiulus (kits/mechs/krator-mechs-iziz-baiulus.js)

   An Ancient heavy porter: a hunched, thick-legged walker that carried girders and
   reactor casks, with two great arms hung from round shoulder drums on a yoke, two small
   arms under its chest for fine work, and its operator in the open, in a framed seat in
   the chest. The legions call it the porter and fight it close: it walks into a wall of
   shields, raises both arms wide and claps them together on whatever is between.
   ====================================================================== */
MECH({
  key: 'iz_baiulus', name: 'Baiulus', culture: 'iziz',
  role: 'heavy porter: crushing arms', origin: 'Ancient heavy porter',
  lore: 'A porter of girders and casks with arms like a gorilla\'s and an operator sitting in the open in its chest. It walks into a shield wall and claps its arms together.',
  tags: { class: 'mech', type: ['war machine', 'heavy', 'industrial'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['fist', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Porter'],
  w: 4.8, d: 2.8, h: 7.3,
  data: { height: 5.0, mass: 18, crew: 1, pilot: 'chest', reach: 2.8, cargo: 4000, weapon: 'two crushing arms, two small grippers',
    engine: 'Ancient cell pack, hydraulic', armour: 'shoulder drums and a roll cage' },
  gait: { period: 2.2, duty: 0.64, stride: 1.15, lift: 0.3, bob: 0.08, sway: 0.11, roll: 0.04, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.16, 0, 0], arm_r_sh: [0.16, 0, 0] } },
  idle: { breathe: 0.035, scan: 0.08, look: 0.5 },
  anim: {
    idle: function (P, t, w) {
      const a = Math.sin(t * 0.8) * 0.25 * w, b = Math.sin(t * 0.8 + 1.7) * 0.25 * w;
      P.b.belly_l = [a, 0, 0]; P.b.belly_r = [b, 0, 0];
      P.b.belly_l_el = [-a, 0, 0]; P.b.belly_r_el = [-b, 0, 0];
    }
  },
  attack: {
    kind: 'clap', dur: 2.8,
    keys: [
      [0, {}],
      [0.85, { b: { arm_l_sh: [-1.35, 0.55, 0], arm_r_sh: [-1.35, -0.55, 0], arm_l_el: [0.2, 0, 0], arm_r_el: [0.2, 0, 0], torso: [-0.1, 0, 0], body: [-0.05, 0, 0] },
        s: { body: [0, 0.05, -0.15] } }, 's'],
      [1.15, { b: { arm_l_sh: [-1.4, -0.62, 0], arm_r_sh: [-1.4, 0.62, 0], arm_l_el: [0.15, 0, 0], arm_r_el: [0.15, 0, 0], torso: [0.12, 0, 0], body: [0.08, 0, 0] },
        s: { body: [0, -0.18, 0.3] } }, 'i'],
      [1.45, { b: { arm_l_sh: [-1.38, -0.6, 0], arm_r_sh: [-1.38, 0.6, 0], arm_l_el: [0.15, 0, 0], arm_r_el: [0.15, 0, 0], torso: [0.12, 0, 0], body: [0.08, 0, 0] },
        s: { body: [0, -0.18, 0.3] } }, 'o'],
      [2.8, {}, 's']
    ],
    events: [{ t: 1.16, type: 'impact', at: 'clap_pt', r: 1.5 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), tl = c('teal');

    /* ---- the pelvis */
    R.bone('body', null, 0, 2.2, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.5, 0.55, 1.0, 0.16, gun, 'metal', 'z');
    F.chb(0, 0.02, 0.51, 1.1, 0.34, 0.06, 0.08, or, 'paint', 'z');
    IZ.phalera(F, 0, 0.02, 0.56, 0, 0, 1, 0.12);

    /* ---- the torso, hunched forward: the open seat, the yoke, the pack */
    R.bone('torso', 'body', 0, 0.3, 0, 0.14, 0, 0);
    R.on('torso');
    F.cy(0, 0.1, 0, 0.45, 0.5, 0.3, iron, 'metal', 'y', 14);
    F.cb(0, 0.95, -0.38, 1.2, 1.3, 0.1, gun, 'metal');
    F.cb(0, 0.3, 0.12, 1.24, 0.12, 1.0, dk, 'metal');
    F.chb(0, 1.7, 0.08, 1.9, 0.2, 1.3, 0.08, lt, 'paint', 'x');
    F.cb(0, 1.62, 0.745, 1.5, 0.08, 0.04, or, 'paint');
    IZ.numeral(F, 0, 1.7, 0.785, 'VII', 0.11);
    for (const s of [-1, 1]) {
      F.chb(s * 0.72, 0.95, 0.08, 0.22, 1.4, 1.2, 0.08, steel, 'paint', 'x');
      F.cb(s * 0.835, 0.95, 0.1, 0.02, 1.0, 0.7, or, 'paint');
      F.cb(s * 0.845, 0.95, 0.47, 0.02, 1.04, 0.05, cr, 'paint');
    }
    /* the teal frame round the open front, a bar across */
    F.tube([[-0.62, 0.38, 0.72], [-0.62, 1.58, 0.72], [0.62, 1.58, 0.72], [0.62, 0.38, 0.72]], 0.05, tl, 'paint');
    F.rod(-0.62, 0.38, 0.72, 0.62, 0.38, 0.72, 0.05, tl, 'paint');
    F.rod(-0.62, 0.9, 0.74, 0.62, 0.9, 0.74, 0.035, iron, 'metal');
    /* the seat, the levers, the operator */
    F.cb(0, 0.42, -0.02, 0.56, 0.12, 0.5, c('leather'), 'leather');
    F.cb(0, 0.85, -0.33, 0.54, 0.7, 0.06, c('leather'), 'leather', -0.12, 0, 0);
    for (const s of [-1, 1]) F.rod(s * 0.22, 0.48, 0.42, s * 0.22, 0.76, 0.46, 0.022, iron, 'metal');
    MP.pilot(F, R, 'torso', 0, 0.48, 0.0, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson'), lean: 0.12 });
    R.on('torso');
    /* the pack behind: cell housing, vents, two stacks */
    F.chb(0, 0.95, -0.85, 1.55, 1.35, 0.8, 0.18, gun, 'metal', 'z');
    for (let i = 0; i < 5; i++) F.cb(0, 0.6 + i * 0.17, -1.265, 1.05, 0.05, 0.04, iron, 'metal');
    for (const s of [-1, 1]) {
      F.cy(s * 0.5, 1.95, -0.95, 0.12, 0.1, 0.75, c('copper'), 'copper', 'y', 10);
      F.cy(s * 0.5, 2.35, -0.95, 0.14, 0.14, 0.06, iron, 'metal', 'y', 10);
    }
    /* the yoke the shoulder drums hang from */
    F.chb(0, 1.95, -0.25, 2.5, 0.34, 0.62, 0.1, gun, 'metal', 'z');
    F.cb(0, 2.13, -0.25, 1.4, 0.04, 0.4, br, 'bronze');

    /* ---- the great arms: a round shoulder drum, a thick upper arm, a forearm, a three-fingered hand */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.55, 1.85, -0.25, 0, 0, s * 0.06);
      R.on(A + '_sh');
      F.cy(s * 0.05, 0.05, 0, 0.62, 0.62, 0.62, lt, 'paint', 'x', 22);
      F.sph(s * 0.36, 0.05, 0, 0.18, 0.62, 0.62, lt, 'paint', 22, 12);
      F.cy(s * 0.05, 0.05, 0, 0.635, 0.635, 0.2, or, 'paint', 'x', 22);
      F.cy(s * -0.26, 0.05, 0, 0.5, 0.5, 0.06, iron, 'metal', 'x', 18);
      IZ.sun(F, s * 0.545, 0.05, 0, s, 0, 0, 0.26);
      F.cy(0, -0.85, 0, 0.3, 0.36, 1.0, steel, 'paint', 'y', 14);
      F.cy(0, -0.68, 0, 0.365, 0.355, 0.2, cr, 'paint', 'y', 14);
      R.bone(A + '_el', A + '_sh', 0, -1.4, 0, -0.35, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.26, 0.6, 'x', iron, br);
      F.chb(0, -0.55, 0.02, 0.66, 0.95, 0.66, 0.14, lt, 'paint', 'y');
      F.chb(0, -0.45, 0.36, 0.5, 0.6, 0.06, 0.05, or, 'paint', 'x');
      F.cb(0, -1.0, 0.02, 0.56, 0.1, 0.56, dk, 'metal');
      R.bone(A + '_wr', A + '_el', 0, -1.08, 0.02, 0.3, 0, 0);
      R.on(A + '_wr');
      F.chb(0, -0.18, 0, 0.54, 0.36, 0.5, 0.08, gun, 'metal', 'x');
      for (let k = 0; k < 3; k++) {
        const x = -0.18 + k * 0.18;
        F.rod(x, -0.34, 0.12, x, -0.62, 0.22, 0.065, gun, 'metal');
        F.rod(x, -0.62, 0.22, x, -0.8, 0.12, 0.055, iron, 'metal');
      }
      F.rod(-s * 0.3, -0.25, 0.05, -s * 0.38, -0.55, 0.22, 0.065, gun, 'metal');
      MP.hose(F, R, 'torso', [s * 0.9, 1.7, -0.55], A + '_sh', [0, -0.6, -0.34], 0.055, c('rubber'), 0.15);
      MP.piston(F, R, A + '_sh', [0, -0.55, 0.36], A + '_el', [0, -0.35, 0.36], 0.065, dk, c('chrome'));
    }
    R.point('clap_pt', 'arm_l_wr', -0.2, -0.6, 0.2);

    /* ---- the small arms under the chest: two segments, a gripper */
    for (const s of [-1, 1]) {
      const B = s > 0 ? 'belly_l' : 'belly_r';
      R.bone(B, 'torso', s * 0.42, 0.18, 0.62, -0.7, 0, 0);
      R.on(B);
      MP.joint(F, 0, 0, 0, 0.1, 0.18, 'x', iron, null);
      F.rod(0, 0, 0, 0, -0.45, 0, 0.055, steel, 'paint');
      R.bone(B + '_el', B, 0, -0.48, 0, 0.9, 0, 0);
      R.on(B + '_el');
      MP.joint(F, 0, 0, 0, 0.08, 0.15, 'x', iron, null);
      F.rod(0, 0, 0, 0, -0.4, 0, 0.045, or, 'paint');
      for (const t of [-1, 1]) F.rod(t * 0.04, -0.4, 0, t * 0.09, -0.56, 0.03, 0.02, gun, 'metal');
    }

    /* ---- legs: thick and short, knees forward */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.72, -0.15, 0], L1: 1.0, L2: 1.0, knee: 1, ankleH: 0.46, rest: [s * 0.84, 0.0], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.3, 0.5, 'x', iron, br);
      F.chb(0, -0.48, 0.02, 0.7, 0.85, 0.78, 0.18, lt, 'paint', 'y');
      F.chb(0, -0.45, 0.43, 0.5, 0.55, 0.06, 0.05, or, 'paint', 'x');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.27, 0.66, 'x', iron, br);
      F.chb(0, -0.48, 0, 0.66, 0.8, 0.72, 0.14, steel, 'paint', 'y');
      F.chb(0, 0.02, 0.32, 0.5, 0.36, 0.14, 0.06, br, 'bronze', 'x');
      F.cb(s * 0.345, -0.45, 0.0, 0.02, 0.5, 0.4, tl, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, -0.42], Lg + '_knee', [0, -0.35, -0.38], 0.07, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.9, l: 1.22, ankleH: 0.46, plate: steel, iron: gun, trim: br, toes: 3 });
    }

    /* ---- dressing: a vexillum at the back, feathers from the yoke */
    IZ.vexillum(F, R, 'vex', 'torso', 0.45, 1.65, -1.3, { h: 2.4, w: 0.72, bh: 0.95, paint: IZ.paint(F, 'legion', { numeral: 'VII' }), finial: 'hand' });
    IZ.feathers(F, R, 'fth_l', 'torso', 0.95, 1.78, 0.06, { n: 4, len: 0.45 });
    IZ.feathers(F, R, 'fth_r', 'torso', -0.95, 1.78, 0.06, { n: 4, len: 0.45, cols: ['fGold', 'fScarlet', 'fBlack', 'fWhite'] });
  }
});
