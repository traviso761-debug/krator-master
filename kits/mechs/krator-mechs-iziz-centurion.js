/* ======================================================================
   Iziz mech: the Centurion (kits/mechs/krator-mechs-iziz-centurion.js)

   An Ancient cargo loader, the commonest walker in the ruins: a stocky biped with the
   operator in the chest behind a barred glass front, big hands for lifting containers.
   The legions give it what a legionary carries: a scutum cut from a hatch door on the
   left forearm and a "cleaver", a length of girder ground to an edge, in the right hand.
   It fights in the line, shield up, and chops. A horsehair crest across its head housing,
   a legion's flag on a springy pole at its back, phalerae on its chest straps.
   ====================================================================== */
MECH({
  key: 'iz_centurion', name: 'Centurion', culture: 'iziz',
  role: 'line walker: shield and cleaver', origin: 'Ancient cargo loader',
  lore: 'The legions\' backbone. Its scutum was a cargo hatch, its cleaver a girder; the operator sits in the chest and sees the fight through bars.',
  tags: { class: 'mech', type: ['war machine', 'line'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['cleaver', 'shield'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['III Legion'],
  w: 4.4, d: 5.9, h: 7.1,
  data: { height: 5.5, mass: 14, crew: 1, pilot: 'chest', reach: 3.4, weapon: 'girder cleaver and hatch scutum',
    engine: 'Ancient cell pack, hydraulic', armour: 'salvaged hatch plate' },
  gait: { period: 1.9, duty: 0.62, stride: 1.25, lift: 0.32, bob: 0.07, sway: 0.09, roll: 0.035, twist: 0.07, lean: 0.04,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.18, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.12, look: 0.4 },
  attack: {
    kind: 'overhead chop', dur: 2.6,
    keys: [
      [0, {}],
      [0.75, { b: { torso: [-0.05, -0.35, 0], arm_r_sh: [-2.5, 0, -0.35], arm_r_el: [-0.6, 0, 0], arm_r_wr: [-0.5, 0, 0],
        arm_l_sh: [-0.7, 0.2, 0.1], arm_l_el: [-0.3, 0, 0], body: [-0.08, -0.12, 0] }, s: { body: [0, -0.12, -0.12] } }, 's'],
      [1.05, { b: { torso: [0.12, 0.3, 0], arm_r_sh: [-0.95, 0, -0.1], arm_r_el: [-0.15, 0, 0], arm_r_wr: [1.4, 0, 0],
        arm_l_sh: [-0.5, 0.3, 0.15], body: [0.2, 0.05, 0] }, s: { body: [0, -0.28, 0.3] } }, 'i'],
      [1.3, { b: { torso: [0.1, 0.26, 0], arm_r_sh: [-0.9, 0, -0.1], arm_r_el: [-0.18, 0, 0], arm_r_wr: [1.35, 0, 0],
        arm_l_sh: [-0.5, 0.3, 0.15], body: [0.18, 0.05, 0] }, s: { body: [0, -0.26, 0.28] } }, 'o'],
      [2.6, {}, 's']
    ],
    events: [{ t: 1.06, type: 'impact', at: 'blade_tip', r: 1.4 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream');

    /* ---- pelvis */
    R.bone('body', null, 0, 2.3, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.35, 0.55, 1.0, 0.14, dk, 'metal', 'z');
    F.chb(0, 0.04, 0.5, 0.9, 0.36, 0.08, 0.06, or, 'paint', 'z');
    IZ.phalera(F, 0, 0.04, 0.56, 0, 0, 1, 0.12);
    for (const s of [-1, 1]) MP.joint(F, s * 0.56, -0.12, 0, 0.31, 0.16, 'x', iron, null);
    /* pteruges: hanging plates round the front and sides */
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.24;
      F.cb(x, -0.42, 0.56, 0.21, 0.5, 0.04, i % 2 ? c('leather') : steel, i % 2 ? 'leather' : 'paint', 0.1, 0, 0);
      F.cb(x, -0.65, 0.58, 0.21, 0.05, 0.05, c('bronze'), 'bronze', 0.1, 0, 0);
    }
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) F.cb(s * 0.72, -0.4, -0.15 + i * 0.3, 0.04, 0.48, 0.26, i ? steel : c('leather'), i ? 'paint' : 'leather', 0, 0, s * 0.12);

    /* ---- torso: the cab in the chest */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.32, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.45, 1.9, 1.45, 0.6, 0.18, steel, 'paint', 'z');
    F.chb(0, 1.7, 0.02, 1.95, 0.22, 1.45, 0.1, gun, 'paint', 'x');
    F.cb(0, 1.6, 0.74, 1.6, 0.06, 0.04, cr, 'paint');
    F.chb(0, 0.32, 0.1, 1.6, 0.26, 1.2, 0.1, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.88, 1.0, 0.12, 0.3, 1.42, 1.25, 0.12, steel, 'paint', 'x');
      F.cb(s * 1.035, 1.0, 0.0, 0.02, 1.2, 0.62, or, 'paint');
      F.cb(s * 1.045, 1.0, 0.33, 0.02, 1.24, 0.06, cr, 'paint');
      F.cb(s * 1.045, 1.0, -0.33, 0.02, 1.24, 0.04, c('teal'), 'paint');
      IZ.phalerae(F, s * 0.88, 1.42, 0.76, 0, 0, 1, 3, 0.25, 0.09);
      F.cb(s * 0.88, 1.05, 0.745, 0.12, 0.95, 0.02, c('leather'), 'leather');
    }
    /* the cab: dark well, seat, levers, the pilot, glass and bars */
    F.cb(0, 1.0, -0.12, 1.5, 1.25, 0.04, gun, 'metal');
    F.cb(0, 0.42, 0.0, 0.6, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.82, -0.26, 0.58, 0.75, 0.1, c('leather'), 'leather');
    for (const s of [-1, 1]) {
      F.rod(s * 0.2, 0.55, 0.42, s * 0.2, 0.8, 0.52, 0.02, iron, 'metal');
     
    }
    MP.pilot(F, R, 'torso', 0, 0.47, 0.0, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: c('bronze'), harness: c('leather'), crest: null });
    R.on('torso');
    F.cb(0, 1.06, 0.7, 1.46, 1.06, 0.03, c('glass'), 'glass', -0.1, 0, 0);
    for (const x of [-0.37, 0, 0.37]) F.cb(x, 1.06, 0.73, 0.05, 1.08, 0.06, iron, 'metal', -0.1, 0, 0);
    F.cb(0, 1.08, 0.735, 1.46, 0.05, 0.06, iron, 'metal', -0.1, 0, 0);
    F.chb(0, 0.52, 0.68, 1.44, 0.32, 0.14, 0.05, or, 'paint', 'x');
    IZ.numeral(F, 0, 0.52, 0.76, 'III', 0.17);
    /* the pack at the back: cell housing, vents, two exhaust stacks */
    F.chb(0, 1.0, -0.92, 1.4, 1.2, 0.5, 0.15, gun, 'metal', 'z');
    for (let i = 0; i < 5; i++) F.cb(0, 0.65 + i * 0.17, -1.18, 1.0, 0.05, 0.04, iron, 'metal');
    for (const s of [-1, 1]) {
      F.cy(s * 0.5, 1.9, -1.0, 0.11, 0.1, 0.9, c('copper'), 'copper', 'y', 10);
      F.cy(s * 0.5, 2.36, -1.0, 0.13, 0.13, 0.06, iron, 'metal', 'y', 10);
    }

    /* ---- the head housing: visor slit, a crest across */
    R.bone('head', 'torso', 0, 1.82, 0.12);
    R.on('head');
    F.chb(0, 0.17, 0, 0.78, 0.36, 0.72, 0.14, steel, 'paint', 'x');
    F.cb(0, 0.34, 0.0, 0.8, 0.04, 0.74, or, 'paint');
    F.cb(0, 0.2, 0.37, 0.52, 0.06, 0.02, c('eye'), 'glow');
    F.cb(0, 0.28, 0.36, 0.7, 0.06, 0.06, c('bronze'), 'bronze');
    F.cy(0, 0.0, 0, 0.2, 0.25, 0.12, iron, 'metal', 'y', 10);
    IZ.crest(F, 0, 0.37, 0.0, 1.2, 0.46, 'across');

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.2, 1.3, -0.02, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.05, 0, 0, 0.27, 0.5, 'x', iron, c('bronze'));
      F.chb(s * 0.04, 0.12, 0, 0.78, 0.56, 0.98, 0.2, or, 'paint', 'z');
      F.cb(s * 0.04, -0.17, 0, 0.8, 0.06, 1.0, cr, 'paint');
      F.cb(s * 0.04, 0.42, 0, 0.6, 0.06, 0.8, c('bronze'), 'bronze');
      if (s > 0) IZ.sun(F, s * 0.44, 0.12, 0, 1, 0, 0, 0.24);
      else IZ.phalera(F, s * 0.44, 0.12, 0, -1, 0, 0, 0.16);
      F.chb(0, -0.52, 0, 0.42, 0.82, 0.46, 0.08, steel, 'paint', 'y');
      F.cb(s * 0.235, -0.48, 0, 0.05, 0.56, 0.34, or, 'paint');
      R.bone(A + '_el', A + '_sh', 0, -0.98, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.21, 0.6, 'x', iron, c('bronze'));
      F.chb(0, -0.46, 0.02, 0.52, 0.86, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(0, -0.28, 0.02, 0.55, 0.22, 0.57, or, 'paint');
      F.cb(0, -0.15, 0.02, 0.56, 0.05, 0.58, cr, 'paint');
      F.cb(0, -0.82, 0.02, 0.46, 0.12, 0.48, dk, 'metal');
      R.bone(A + '_wr', A + '_el', 0, -0.95, 0, 0.55, 0, 0);
      R.on(A + '_wr');
      F.chb(0, -0.12, 0.02, 0.38, 0.32, 0.42, 0.06, dk, 'metal', 'x');
      for (let k = 0; k < 3; k++) F.cb(-0.12 + k * 0.12, -0.3, 0.14, 0.1, 0.16, 0.12, gun, 'metal', 0.4, 0, 0);
      F.cb(s * 0.17, -0.26, 0.06, 0.08, 0.16, 0.12, gun, 'metal', 0, 0, s * 0.4);
      MP.hose(F, R, 'torso', [s * 0.72, 1.45, -0.65], A + '_sh', [0, -0.25, -0.24], 0.045, c('rubber'), 0.15);
      MP.piston(F, R, A + '_sh', [0, -0.35, 0.24], A + '_el', [0, -0.3, 0.28], 0.05, dk, c('chrome'));
    }
    /* the cleaver in the right hand: a girder ground to an edge */
    R.on('arm_r_wr');
    F.cy(0, -0.2, 0.0, 0.065, 0.065, 0.62, c('leather'), 'leather', 'z', 8);
    F.knob(0, -0.2, -0.33, 0.09, c('bronze'), 'bronze');
    F.cb(0, -0.2, 0.32, 0.12, 0.42, 0.08, c('bronze'), 'bronze');
    const bl = [[0.36, 0.1], [2.15, 0.1], [2.42, -0.2], [2.28, -0.62], [0.36, -0.52]];
    F.prism(0, -0.2, 0, bl, 0.09, steel, 'metal', 'x', 0.18, 0, 0);
    F.prism(0, -0.2, 0, [[0.34, 0.125], [2.17, 0.125], [2.2, 0.03], [0.34, 0.03]], 0.14, c('bronze'), 'bronze', 'x', 0.18, 0, 0);
    F.prism(0, -0.2, 0, [[0.36, -0.46], [2.3, -0.56], [2.28, -0.63], [0.36, -0.53]], 0.05, c('chrome'), 'chrome', 'x', 0.18, 0, 0);
    for (let i = 0; i < 4; i++) {
      const zz = 0.75 + i * 0.4;
      F.disc(0, -0.2 + Math.cos(0.18) * -0.2 - Math.sin(0.18) * zz, Math.cos(0.18) * zz + Math.sin(0.18) * -0.2, 1, 0, 0, 0.09, 0.1, iron, 'metal', 10);
    }
    R.point('blade_tip', 'arm_r_wr', 0, -0.2 - Math.sin(0.18) * 2.4 - 0.3, Math.cos(0.18) * 2.4);
    /* the scutum on the left forearm */
    R.on('arm_l_wr');
    F.cb(0.0, 0.25, 0.25, 0.12, 0.5, 0.3, dk, 'metal');
    IZ.scutum(F, 0.05, 0.32, 0.48, 1.08, 1.6, 1.4);

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.62, -0.14, 0], L1: 1.05, L2: 1.0, knee: 1, ankleH: 0.44, rest: [s * 0.74, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.44, 'x', iron, c('bronze'));
      F.chb(0, -0.52, 0, 0.5, 0.9, 0.56, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.42, 0.3, 0.46, 0.62, 0.08, 0.04, or, 'paint', 'x');
      F.cb(s * 0.27, -0.5, 0, 0.05, 0.6, 0.4, c('teal'), 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.23, 0.64, 'x', iron, c('bronze'));
      F.chb(0, 0.04, 0.27, 0.42, 0.36, 0.14, 0.06, c('bronze'), 'bronze', 'x');
      F.chb(0, -0.5, 0.0, 0.58, 0.96, 0.62, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.42, 0.29, 0.46, 0.78, 0.1, 0.05, or, 'paint', 'x');
      F.cb(0, -0.42, 0.345, 0.1, 0.74, 0.03, cr, 'paint');
      F.cb(0, -0.92, 0, 0.5, 0.14, 0.52, dk, 'metal');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.4, -0.33], 0.06, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.72, l: 1.08, ankleH: 0.44, plate: steel, iron: gun, trim: c('bronze'), toes: 3 });
    }

    /* ---- dressing: the legion's flag at the back, feathers at the pauldrons */
    IZ.sashimono(F, R, 'sashi', 'torso', 0.62, 1.45, -1.22, { h: 2.7, w: 0.62, bh: 1.75, paint: IZ.paint(F, 'legion', { numeral: 'III' }), side: -1 });
    R.on('torso');
    F.cb(0.6, 1.4, -1.2, 0.16, 0.3, 0.16, iron, 'metal');
    IZ.feathers(F, R, 'fth_l', 'arm_l_sh', 0.42, -0.18, 0.42, { n: 5, len: 0.55 });
    IZ.feathers(F, R, 'fth_r', 'arm_r_sh', -0.42, -0.18, 0.42, { n: 5, len: 0.55, cols: ['fGold', 'fScarlet', 'fBlack', 'fWhite'] });
  }
});
