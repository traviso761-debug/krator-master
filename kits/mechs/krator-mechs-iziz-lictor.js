/* ======================================================================
   Iziz mech: the Lictor (kits/mechs/krator-mechs-iziz-lictor.js)

   An Ancient pile breaker: a tall, lean walker on long legs, its operator in an egg of a
   head pod above a cream collar, one arm a great ram ending in a fist of iron (it broke
   foundation piles and old concrete), the other a thin arm with a pincer for clearing the
   rubble. The legions walk it at the head of a column as a lictor walks before a
   magistrate, and strap the fasces to its back: a bundle of rods round an axe. It
   raises the fist over its head and brings it down.
   ====================================================================== */
MECH({
  key: 'iz_lictor', name: 'Lictor', culture: 'iziz',
  role: 'breaker: the great fist', origin: 'Ancient pile breaker',
  lore: 'A pile breaker, tall as a gatehouse, with one arm a ram and a fist of iron. It walks before the column as a lictor walks before a magistrate, the fasces on its back.',
  tags: { class: 'mech', type: ['war machine', 'heavy'], drive: 'biped', crew: 1, pilot: 'head', weapon: ['fist', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Column Head'],
  w: 3.8, d: 3.0, h: 7.2,
  data: { height: 6.9, mass: 15, crew: 1, pilot: 'head', reach: 3.6, weapon: 'a ram arm with an iron fist, a pincer arm',
    engine: 'Ancient cell pack, hydraulic', armour: 'ram housing and a head pod' },
  gait: { period: 2.1, duty: 0.62, stride: 1.4, lift: 0.4, bob: 0.08, sway: 0.1, roll: 0.035, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_r_sh: [0.1, 0, 0], arm_l_sh: [0.2, 0, 0] } },
  idle: { breathe: 0.025, scan: 0.1, look: 0.45 },
  anim: {
    idle: function (P, t, w) {
      const k = (0.5 + 0.5 * Math.sin(t * 0.9)) * 0.35 * w;
      P.b.pin_a = [0, 0, k]; P.b.pin_b = [0, 0, -k];
    }
  },
  attack: {
    kind: 'overhead smash', dur: 2.9,
    keys: [
      [0, {}],
      [0.9, { b: { torso: [-0.12, 0.3, 0], arm_r_sh: [-2.75, 0, -0.2], arm_r_el: [-1.1, 0, 0], arm_l_sh: [-0.3, 0, 0.2], head: [-0.15, 0.2, 0],
        body: [-0.08, 0.1, 0] }, s: { body: [0, -0.1, -0.15] } }, 's'],
      [1.2, { b: { torso: [0.3, -0.12, 0], arm_r_sh: [-1.15, 0, -0.1], arm_r_el: [-0.15, 0, 0], arm_l_sh: [0.3, 0, 0.3], head: [0.1, 0, 0],
        body: [0.2, -0.05, 0] }, s: { body: [0, -0.42, 0.35] } }, 'i'],
      [1.5, { b: { torso: [0.28, -0.12, 0], arm_r_sh: [-1.1, 0, -0.1], arm_r_el: [-0.18, 0, 0], arm_l_sh: [0.3, 0, 0.3], head: [0.1, 0, 0],
        body: [0.18, -0.05, 0] }, s: { body: [0, -0.4, 0.33] } }, 'o'],
      [2.9, {}, 's']
    ],
    events: [{ t: 1.21, type: 'impact', at: 'fist_pt', r: 1.8 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- the pelvis: a narrow box, a hanging apron */
    R.bone('body', null, 0, 3.5, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.95, 0.45, 0.7, 0.12, gun, 'metal', 'z');
    for (let i = 0; i < 3; i++) F.cb((i - 1) * 0.26, -0.38, 0.37, 0.22, 0.42, 0.04, i % 2 ? c('leather') : steel, i % 2 ? 'leather' : 'paint', 0.12, 0, 0);

    /* ---- the torso: a waist drum, a narrow chest, the collar */
    R.bone('torso', 'body', 0, 0.28, 0);
    R.on('torso');
    F.cy(0, 0.12, 0, 0.3, 0.34, 0.34, iron, 'metal', 'y', 12);
    F.chb(0, 0.78, -0.05, 1.25, 1.0, 0.9, 0.16, steel, 'paint', 'z');
    F.chb(0, 0.82, 0.41, 0.9, 0.72, 0.06, 0.08, or, 'paint', 'z');
    F.cb(0, 0.42, 0.42, 0.86, 0.05, 0.05, cr, 'paint');
    IZ.sun(F, 0, 0.85, 0.45, 0, 0, 1, 0.24);
    F.chb(0, 0.7, -0.62, 0.9, 0.8, 0.36, 0.1, gun, 'metal', 'z');
    for (let i = 0; i < 4; i++) F.cb(0, 0.45 + i * 0.16, -0.815, 0.7, 0.05, 0.04, iron, 'metal');
    F.cy(0, 1.38, 0, 0.6, 0.66, 0.3, cr, 'paint', 'y', 24);
    F.tor(0, 1.53, 0, 0.6, 0.035, br, 'bronze', 'y', 24);
    for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + TAU / 16; F.cb(Math.sin(a) * 0.645, 1.38, Math.cos(a) * 0.645, 0.08, 0.2, 0.03, iron, 'metal', 0, a, 0); }

    /* ---- the head pod: an egg, a visor, a crest along it */
    R.bone('head', 'torso', 0, 1.55, 0.04);
    R.on('head');
    F.cy(0, 0.04, 0, 0.26, 0.3, 0.14, iron, 'metal', 'y', 12);
    F.sph(0, 0.5, 0, 0.58, 0.7, 0.58, or, 'paint', 22, 14);
    F.tor(0, 0.26, 0, 0.55, 0.045, steel, 'metal', 'y', 22);
    F.chb(0, 0.58, 0.47, 0.48, 0.18, 0.24, 0.05, gun, 'metal', 'x');
    F.cb(0, 0.58, 0.595, 0.38, 0.055, 0.02, c('eye'), 'glow');
    F.cb(0, 0.7, 0.58, 0.5, 0.04, 0.04, br, 'bronze');
    for (const s of [-1, 1]) {
      IZ.phalera(F, s * 0.575, 0.5, 0.0, s, 0, 0, 0.13);
      F.cy(s * 0.32, 0.28, -0.42, 0.04, 0.04, 0.3, c('copper'), 'copper', 'y', 8, 0, 0, s * 0.3);
    }
    IZ.crest(F, 0, 1.17, -0.02, 1.0, 0.42, 'along');

    /* ---- the ram arm (right): a hooked pauldron, a thick upper arm, the ram housing, the fist */
    R.bone('arm_r_sh', 'torso', -0.92, 1.0, 0, 0, 0, -0.14);
    R.on('arm_r_sh');
    MP.joint(F, 0.05, 0, 0, 0.3, 0.4, 'x', iron, br);
    F.prism(-0.08, 0.1, 0, [[0.2, -0.3], [-0.45, -0.35], [-0.72, -0.05], [-0.7, 0.42], [-0.45, 0.8], [-0.38, 0.62], [-0.5, 0.35], [-0.48, 0.05], [-0.25, -0.05], [0.2, -0.05]], 0.9, or, 'paint', 'z');
    F.prism(-0.08, 0.1, 0, [[-0.47, 0.83], [-0.75, 0.43], [-0.77, -0.06], [-0.72, -0.08], [-0.71, 0.42], [-0.44, 0.8]], 0.94, cr, 'paint', 'z');
    F.chb(0, -0.65, 0, 0.62, 1.05, 0.66, 0.12, steel, 'paint', 'y');
    F.cb(-0.32, -0.65, 0, 0.04, 0.7, 0.36, dk, 'metal');
    R.bone('arm_r_el', 'arm_r_sh', 0, -1.3, 0, -0.45, 0, 0);
    R.on('arm_r_el');
    MP.joint(F, 0, 0, 0, 0.28, 0.66, 'x', iron, br);
    F.cy(0, -0.65, 0, 0.42, 0.36, 1.1, steel, 'paint', 'y', 14);
    F.cy(0, -0.4, 0, 0.43, 0.425, 0.3, or, 'paint', 'y', 14);
    F.cy(0, -0.22, 0, 0.432, 0.432, 0.05, cr, 'paint', 'y', 14);
    for (const s of [-1, 1]) F.cb(s * 0.4, -0.75, 0.0, 0.08, 0.8, 0.14, dk, 'metal');
    F.cy(0, -1.28, 0, 0.24, 0.24, 0.24, c('chrome'), 'chrome', 'y', 12);
    /* the fist: a block of iron with four knuckles and a thumb */
    F.chb(0, -1.72, 0.05, 0.86, 0.72, 0.82, 0.14, gun, 'metal', 'y');
    for (let k = 0; k < 4; k++) F.cy(-0.3 + k * 0.2, -2.08, 0.18, 0.1, 0.1, 0.24, iron, 'metal', 'z', 8);
    F.chb(-0.45, -1.62, 0.25, 0.18, 0.42, 0.28, 0.05, gun, 'metal', 'y', 0, 0, 0.25);
    F.cb(0, -1.33, 0.05, 0.88, 0.08, 0.84, br, 'bronze');
    R.point('fist_pt', 'arm_r_el', 0, -2.15, 0.1);
    MP.hose(F, R, 'torso', [-0.55, 1.0, -0.62], 'arm_r_sh', [0.1, -0.3, -0.3], 0.06, c('rubber'), 0.15);
    MP.piston(F, R, 'arm_r_sh', [0, -0.4, 0.34], 'arm_r_el', [0, -0.35, 0.42], 0.07, dk, c('chrome'));

    /* ---- the pincer arm (left): thin, two joints, a pincer */
    R.bone('arm_l_sh', 'torso', 0.78, 1.05, 0.05, 0, 0, 0.2);
    R.on('arm_l_sh');
    MP.joint(F, -0.03, 0, 0, 0.17, 0.3, 'x', iron, br);
    F.chb(0.02, 0.14, 0, 0.32, 0.22, 0.42, 0.06, or, 'paint', 'z');
    F.rod(0, -0.1, 0.04, 0, -0.95, 0.04, 0.07, steel, 'paint');
    F.rod(0, -0.1, -0.08, 0, -0.95, -0.08, 0.04, dk, 'metal');
    R.bone('arm_l_el', 'arm_l_sh', 0, -1.05, 0, -0.5, 0, 0);
    R.on('arm_l_el');
    MP.joint(F, 0, 0, 0, 0.12, 0.26, 'x', iron, null);
    F.rod(0, -0.06, 0, 0, -1.05, 0, 0.065, steel, 'paint');
    F.cy(0, -0.6, 0, 0.09, 0.09, 0.14, cr, 'paint', 'y', 10);
    F.cy(0, -1.1, 0, 0.11, 0.09, 0.14, gun, 'metal', 'y', 10);
    for (const k of [['pin_a', 1], ['pin_b', -1]]) {
      R.bone(k[0], 'arm_l_el', k[1] * 0.06, -1.16, 0);
      R.on(k[0]);
      F.rod(0, 0, 0, k[1] * 0.12, -0.22, 0, 0.035, gun, 'metal');
      F.rod(k[1] * 0.12, -0.22, 0, k[1] * 0.02, -0.46, 0, 0.03, gun, 'metal');
    }

    /* ---- the fasces on its back: rods bound round an axe, crimson cords */
    R.on('torso');
    F.cb(0.25, 0.8, -0.86, 0.3, 0.2, 0.12, iron, 'metal');
    const fz = -1.0, fx = 0.25, fy = 1.0, fl = 2.4;
    for (let k = 0; k < 9; k++) {
      const a = k * TAU / 9;
      F.cy(fx + Math.cos(a) * 0.12, fy, fz + Math.sin(a) * 0.12, 0.035, 0.035, fl, k % 2 ? c('wood') : c('woodDk'), 'wood', 'y', 6);
    }
    for (const t of [-0.8, -0.2, 0.4, 0.95]) F.tor(fx, fy + t, fz, 0.165, 0.025, c('crimson'), 'cloth', 'y', 12);
    F.cy(fx, fy + fl / 2 + 0.12, fz, 0.04, 0.04, 0.4, c('woodDk'), 'wood', 'y', 6);
    F.prism(fx, fy + fl / 2 + 0.2, fz, [[0.02, 0.12], [0.42, 0.28], [0.5, 0.0], [0.42, -0.28], [0.02, -0.12]], 0.05, c('chrome'), 'chrome', 'z');
    F.knob(fx, fy + fl / 2 + 0.34, fz, 0.06, c('gold'), 'gold');

    /* ---- legs: long, thin, a strut behind each thigh */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.52, -0.12, 0], L1: 1.65, L2: 1.6, knee: 1, ankleH: 0.44, rest: [s * 0.6, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.22, 0.4, 'x', iron, br);
      F.chb(0, -0.75, 0.02, 0.38, 1.3, 0.44, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.6, 0.26, 0.28, 0.8, 0.06, 0.04, or, 'paint', 'x');
      F.rod(0, -0.2, -0.3, 0, -1.4, -0.24, 0.05, dk, 'metal');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.2, 0.44, 'x', iron, br);
      F.chb(0, -0.72, 0, 0.34, 1.25, 0.4, 0.08, steel, 'paint', 'y');
      F.chb(0, -0.4, 0.23, 0.26, 0.5, 0.06, 0.03, or, 'paint', 'x');
      F.cb(0, -0.12, 0.27, 0.3, 0.05, 0.06, cr, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.35, -0.3], Lg + '_knee', [0, -0.5, -0.26], 0.05, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.62, l: 0.98, ankleH: 0.44, plate: steel, iron: gun, trim: br, toes: 3 });
    }

    /* ---- feathers at the collar and the pauldron */
    IZ.feathers(F, R, 'fth_c', 'torso', 0.5, 1.25, 0.42, { n: 5, len: 0.5 });
    IZ.feathers(F, R, 'fth_p', 'arm_r_sh', -0.55, -0.25, 0.42, { n: 4, len: 0.5, cols: ['fGold', 'fScarlet', 'fBlack'] });
  }
});
