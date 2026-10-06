/* ======================================================================
   Iziz mech: the Rota (kits/mechs/krator-mechs-iziz-rota.js)

   An Ancient vehicle-recovery frame: a tall, heavy biped built around the shell of a
   car (its cab is the head, glass dome and headlamps and all), with road wheels for
   shoulders and knees, the operator sat in the open cradle of its chest. It was made
   to cut wrecks apart, and it still carries the salvage saw on its right arm; on the
   left it holds a wheel as a round shield. It sweeps the saw through a line of men
   at waist height. Two flags at its back, a crest along the cab roof.
   ====================================================================== */
MECH({
  key: 'iz_rota', name: 'Rota', culture: 'iziz',
  role: 'heavy walker: salvage saw and wheel shield', origin: 'Ancient vehicle-recovery frame',
  lore: 'It was built round the shell of an Ancient car to cut wrecks apart. Its head is the car\'s cab, its joints are road wheels, and it still carries the salvage saw.',
  tags: { class: 'mech', type: ['war machine', 'heavy', 'line'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['saw', 'shield'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Wrecker'],
  w: 4.9, d: 2.9, h: 7.4,
  data: { height: 6.0, mass: 17, crew: 1, pilot: 'chest', reach: 3.2, weapon: 'salvage saw (1.5 m disc) and wheel shield',
    engine: 'Ancient cell pack, electric', armour: 'car shell and recovery plate' },
  gait: { period: 1.85, duty: 0.62, stride: 1.35, lift: 0.33, bob: 0.07, sway: 0.085, roll: 0.035, twist: 0.07, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.16, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.12, look: 0.45 },
  attack: {
    kind: 'saw sweep', dur: 2.8,
    keys: [
      [0, {}],
      [0.65, { b: { torso: [0, -0.6, 0], arm_r_sh: [-0.9, -0.3, -0.5], arm_r_el: [0.4, 0, 0], arm_l_sh: [-0.55, 0, 0.15], body: [-0.03, -0.1, 0] },
        s: { body: [0, -0.1, -0.1] } }, 's'],
      [1.05, { b: { torso: [0.05, 0.55, 0], arm_r_sh: [-0.95, 0.2, -0.1], arm_r_el: [0.4, 0, 0], arm_l_sh: [-0.5, 0, 0.25], body: [0.1, 0.12, 0] },
        s: { body: [0, -0.28, 0.25] } }, 'i'],
      [1.35, { b: { torso: [0.05, 0.7, 0], arm_r_sh: [-0.9, 0.3, 0.0], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.5, 0, 0.25], body: [0.08, 0.15, 0] },
        s: { body: [0, -0.24, 0.22] } }, 'o'],
      [2.8, {}, 's']
    ],
    events: [{ t: 0.95, type: 'impact', at: 'saw_edge', r: 1.3 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const tyre = c('rubber');

    R.bone('body', null, 0, 2.62, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.35, 0.55, 1.0, 0.16, gun, 'metal', 'z');
    F.chb(0, 0.0, 0.5, 1.0, 0.38, 0.08, 0.06, lt, 'paint', 'x');
    F.cb(0, -0.12, 0.55, 0.96, 0.05, 0.04, or, 'paint');
    for (const s of [-1, 1]) MP.joint(F, s * 0.66, -0.1, 0, 0.26, 0.32, 'x', iron, br);

    /* ---- the chest: an open cradle with the operator in it */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.32, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.5, 1.9, 1.6, 0.6, 0.18, lt, 'paint', 'z');
    F.chb(0, 0.3, 0.05, 1.55, 0.3, 1.2, 0.12, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.85, 1.0, 0.1, 0.24, 1.5, 1.15, 0.1, lt, 'paint', 'x');
      F.cb(s * 0.975, 0.95, 0.1, 0.02, 1.2, 0.08, or, 'paint');
      F.cb(s * 0.975, 0.95, 0.24, 0.02, 1.2, 0.03, c('red'), 'paint');
      F.rod(s * 0.55, 0.5, 0.7, s * 0.55, 1.62, 0.66, 0.045, iron, 'metal');
      IZ.phalerae(F, s * 0.85, 1.5, 0.69, 0, 0, 1, 3, 0.22, 0.08);
      for (let k = 0; k < 3; k++) F.rod(s * (0.4 + k * 0.08), 0.5, -0.18, s * (0.42 + k * 0.08), 1.6, -0.18, 0.025, [c('crimson'), c('fGold'), tyre][k], 'rubber');
    }
    F.cb(0, 1.0, -0.17, 1.4, 1.4, 0.04, gun, 'metal');
    F.cb(0, 0.48, 0.02, 0.62, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.9, -0.12, 0.6, 0.8, 0.1, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.53, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    for (const s of [-1, 1]) { F.rod(s * 0.22, 0.62, 0.45, s * 0.22, 0.9, 0.55, 0.02, iron, 'metal'); }
    F.chb(0, 0.52, 0.66, 1.4, 0.3, 0.12, 0.05, lt, 'paint', 'x');
    F.cb(0, 0.52, 0.73, 1.2, 0.08, 0.02, or, 'paint');
    F.chb(0, 1.0, -0.98, 1.4, 1.2, 0.4, 0.12, gun, 'metal', 'z');
    IZ.sashimono(F, R, 'sashi_l', 'torso', 0.55, 1.62, -1.2, { h: 2.5, w: 0.5, bh: 1.5, side: 1, paint: IZ.paint(F, 'sun') });
    IZ.sashimono(F, R, 'sashi_r', 'torso', -0.55, 1.62, -1.2, { h: 2.5, w: 0.5, bh: 1.5, side: -1, paint: IZ.paint(F, 'teal') });
    R.on('torso');
    for (const s of [-1, 1]) F.cb(s * 0.55, 1.6, -1.19, 0.15, 0.25, 0.15, iron, 'metal');

    /* ---- the head: a car's cab, glass dome, headlamps, grille */
    R.bone('head', 'torso', 0, 1.85, 0.0);
    R.on('head');
    F.cy(0, -0.02, 0, 0.3, 0.34, 0.14, iron, 'metal', 'y', 12);
    F.chb(0, 0.28, 0.05, 1.55, 0.5, 1.75, 0.22, lt, 'paint', 'z');
    F.chb(0, 0.2, 0.92, 1.45, 0.34, 0.1, 0.08, gun, 'metal', 'x');
    for (let k = 0; k < 7; k++) F.cb(-0.45 + k * 0.15, 0.2, 0.975, 0.04, 0.22, 0.02, iron, 'metal');
    for (const s of [-1, 1]) {
      F.cb(s * 0.56, 0.38, 0.95, 0.36, 0.06, 0.03, c('lensWarm'), 'lamp');
      F.cb(s * 0.56, 0.38, 0.94, 0.4, 0.1, 0.03, gun, 'metal');
      F.cb(s * 0.79, 0.28, 0.05, 0.03, 0.06, 1.7, or, 'paint');
      F.cy(s * 0.62, 0.05, 0.62, 0.22, 0.22, 0.1, tyre, 'rubber', 'x', 14);
      F.cy(s * 0.62, 0.05, -0.62, 0.22, 0.22, 0.1, tyre, 'rubber', 'x', 14);
    }
    F.sph(0, 0.52, 0.12, 0.66, 0.42, 0.78, c('glass'), 'glass', 16, 8, 0, TAU, 0, Math.PI / 2);
    F.tor(0, 0.53, 0.12, 0.67, 0.035, gun, 'metal', 'y', 18);
    IZ.crest(F, 0, 0.92, 0.0, 1.0, 0.3, 'along');
    IZ.sun(F, 0, 0.45, 0.9, 0, 0.3, 1, 0.12);

    /* ---- arms: wheels for shoulders */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.2, 1.35, -0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.wheel(F, s * 0.08, 0.02, 0, 0.5, 0.38, 'x', tyre, or, br);
      F.chb(s * 0.05, 0.42, 0, 0.6, 0.18, 0.95, 0.06, lt, 'paint', 'z');
      F.cb(s * 0.05, 0.52, 0, 0.55, 0.03, 0.8, or, 'paint');
      F.chb(0, -0.6, 0, 0.42, 0.8, 0.46, 0.08, steel, 'paint', 'y');
      F.cb(s * 0.235, -0.6, 0, 0.04, 0.55, 0.3, lt, 'paint');
      R.bone(A + '_el', A + '_sh', 0, -1.05, 0, -0.5, 0, 0);
      R.on(A + '_el');
      MP.wheel(F, 0, 0, 0, 0.24, 0.46, 'x', tyre, or, br);
      MP.piston(F, R, A + '_sh', [0, -0.35, 0.25], A + '_el', [0, -0.3, 0.28], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.75, 1.55, -0.7], A + '_sh', [0, -0.3, -0.25], 0.045, tyre, 0.15);
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', A + '_sh', s * 0.3, -0.45, 0.25, { n: 4, len: 0.45, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fBlack'] });
    }
    /* the saw arm (right): a long forearm, the guard, the spinning disc */
    R.on('arm_r_el');
    F.chb(0, -0.6, 0.02, 0.42, 1.1, 0.46, 0.08, lt, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.44, 0.1, 0.48, or, 'paint');
    /* the disc lies in the forearm's plane, under it on an arbour, so a sweep leads with the teeth */
    F.cy(0, -1.25, 0.02, 0.2, 0.2, 0.36, gun, 'metal', 'y', 12);
    F.cy(0, -1.55, -0.14, 0.09, 0.09, 0.36, iron, 'metal', 'z', 10);
    F.cy(0, -2.0, -0.14, 0.07, 0.07, 0.36, iron, 'metal', 'z', 10);
    F.cb(0, -1.78, 0.0, 0.16, 0.6, 0.1, gun, 'metal');
    F.tor(0, -2.0, -0.33, 0.83, 0.05, or, 'paint', 'z', 16, Math.PI);
    F.cb(0, -1.6, -0.33, 1.66, 0.06, 0.06, or, 'paint');
    R.spin('saw', 'arm_r_el', 0, -2.0, -0.33, 'x', { idle: 1.2, walk: 1.2, attack: 28 }, 0, Math.PI / 2, 0);
    R.on('saw');
    MP.saw(F, 0.75, 0.04, c('steelLt'), c('chrome'), br);
    R.point('saw_edge', 'arm_r_el', 0, -2.75, -0.33);
    /* the shield arm (left): a hand round a wheel */
    R.on('arm_l_el');
    F.chb(0, -0.5, 0.02, 0.48, 0.9, 0.5, 0.08, lt, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.5, 0.1, 0.52, or, 'paint');
    R.bone('arm_l_wr', 'arm_l_el', 0, -1.0, 0.02, 0.5, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.15, 0.0, 0.42, 0.36, 0.45, 0.08, dk, 'metal', 'x');
    MP.wheel(F, 0.32, 0.05, 0.25, 0.82, 0.24, 'x', tyre, or, br);
    F.cy(0.53, 0.05, 0.25, 0.4, 0.4, 0.03, or, 'paint', 'x', 16);
    IZ.sun(F, 0.555, 0.05, 0.25, 1, 0, 0, 0.32);

    /* ---- legs: wheels for knees */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.68, -0.12, 0], L1: 1.2, L2: 1.12, knee: 1, ankleH: 0.46, rest: [s * 0.78, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      F.chb(0, -0.6, 0, 0.5, 1.05, 0.56, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.5, 0.29, 0.42, 0.75, 0.06, 0.03, lt, 'paint', 'x');
      F.cb(0, -0.5, 0.325, 0.08, 0.7, 0.02, or, 'paint');
      R.on(Lg + '_knee');
      MP.wheel(F, 0, 0, 0.0, 0.4, 0.54, 'x', tyre, or, br);
      F.chb(0, -0.6, 0, 0.56, 1.0, 0.6, 0.12, lt, 'paint', 'y');
      F.chb(0, -0.6, 0.31, 0.44, 0.8, 0.05, 0.03, dk, 'metal', 'x');
      F.cb(s * 0.29, -0.66, 0, 0.03, 0.62, 0.35, or, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, -0.3], Lg + '_knee', [0, -0.4, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.8, l: 1.15, ankleH: 0.46, plate: lt, iron: gun, trim: br, toes: 3 });
    }
  }
});
