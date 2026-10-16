/* ======================================================================
   Iziz mech: the Testudo (kits/mechs/krator-mechs-iziz-testudo.js)

   An Ancient foundation pile driver: a squat armoured box on short thick legs, no
   head at all, the operator sealed in the chest behind a plate like a sarcophagus lid
   with a vision slit. The right arm is the driver itself, a hammer on a ram that
   punches out of its housing; the left a three-fingered grab. The legions use it to
   break walls and stand in a gap. It carries a magazine of bolts it cannot fire (the
   Forgemasters took the launcher), the legion's open hand on its standard, and a
   bronze plaque with its cohort.
   ====================================================================== */
MECH({
  key: 'iz_testudo', name: 'Testudo', culture: 'iziz',
  role: 'breaker: pile-driver fist', origin: 'Ancient foundation pile driver',
  lore: 'It drove piles for towers no one remembers. Now it breaks gates. The operator is sealed behind the plate and sees through a slit; the cohort\'s name is on the bronze.',
  tags: { class: 'mech', type: ['war machine', 'heavy', 'siege'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['pile driver', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['IX Cohort'],
  w: 5.0, d: 2.6, h: 7.3,
  data: { height: 4.7, mass: 22, crew: 1, pilot: 'chest', reach: 2.6, weapon: 'pneumatic pile driver and grab',
    engine: 'Ancient cell pack, pneumatic', armour: 'foundation-plate' },
  gait: { period: 2.1, duty: 0.66, stride: 0.95, lift: 0.24, bob: 0.055, sway: 0.11, roll: 0.05, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.1, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.025, scan: 0.1, look: 0 },
  anim: {
    idle: function (P, t, w) {
      const k = Math.max(0, Math.sin(t * 0.5 + 1)) * 0.25 * w;
      P.b.claw_f0 = [k, 0, 0]; P.b.claw_f1 = [k, 0, 0]; P.b.claw_th = [-k, 0, 0];
    }
  },
  attack: {
    kind: 'pile-driver punch', dur: 2.5,
    keys: [
      [0, {}],
      [0.6, { b: { torso: [0, -0.45, 0], arm_r_sh: [-0.25, 0, -0.1], arm_r_el: [-1.25, 0, 0], arm_l_sh: [-0.7, 0, 0.1], arm_l_el: [-0.4, 0, 0], body: [-0.06, 0, 0] },
        s: { body: [0, -0.1, -0.1] } }, 's'],
      [0.86, { b: { torso: [0.08, 0.38, 0], arm_r_sh: [-1.5, 0, 0.05], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.32] } }, 'i'],
      [0.94, { b: { torso: [0.08, 0.38, 0], arm_r_sh: [-1.5, 0, 0.05], arm_r_el: [0.35, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.32], ram: [0, -0.85, 0] } }, 'i'],
      [1.3, { b: { torso: [0.06, 0.34, 0], arm_r_sh: [-1.45, 0, 0.05], arm_r_el: [0.3, 0, 0], arm_l_sh: [-0.3, 0, 0.2], body: [0.13, 0, 0] },
        s: { body: [0, -0.18, 0.28], ram: [0, -0.8, 0] } }, 'o'],
      [1.7, { b: { torso: [0.04, 0.2, 0], arm_r_sh: [-1.2, 0, 0], arm_r_el: [0.1, 0, 0], body: [0.06, 0, 0] }, s: { body: [0, -0.1, 0.15] } }, 's'],
      [2.5, {}, 's']
    ],
    events: [{ t: 0.95, type: 'impact', at: 'ram_tip', r: 1.6 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- hips */
    R.bone('body', null, 0, 1.68, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.7, 0.62, 1.25, 0.18, gun, 'metal', 'z');
    F.chb(0, -0.1, 0.62, 1.1, 0.42, 0.1, 0.06, steel, 'paint', 'x');
    for (const s of [-1, 1]) MP.joint(F, s * 0.82, -0.08, 0, 0.34, 0.36, 'x', iron, br);

    /* ---- the sarcophagus */
    R.bone('torso', 'body', 0, 0.32, 0);
    R.on('torso');
    F.cy(0, 0.0, 0, 0.55, 0.55, 0.3, iron, 'metal', 'y', 14);
    F.chb(0, 1.12, -0.12, 2.55, 2.0, 2.05, 0.42, steel, 'paint', 'z');
    F.chb(0, 2.18, -0.12, 2.2, 0.24, 1.8, 0.2, dk, 'metal', 'x');
    F.chb(0, 0.22, 0.3, 1.9, 0.35, 1.2, 0.12, dk, 'metal', 'x');
    /* the plate over the operator: orange, a bronze frame, the sun, the slit, the cohort's plaque */
    F.chb(0, 1.12, 0.95, 1.05, 1.6, 0.2, 0.14, or, 'paint', 'x');
    for (const s of [-1, 1]) {
      F.cb(s * 0.55, 1.12, 1.0, 0.1, 1.66, 0.14, br, 'bronze');
      F.cb(0, 1.12 + s * 0.83, 1.0, 1.2, 0.1, 0.14, br, 'bronze');
    }
    F.cb(0, 1.72, 1.07, 0.66, 0.07, 0.04, c('eye'), 'glow');
    F.cb(0, 1.81, 1.07, 0.8, 0.08, 0.08, iron, 'metal');
    IZ.sun(F, 0, 1.28, 1.08, 0, 0, 1, 0.34);
    F.cb(0, 0.66, 1.08, 0.8, 0.34, 0.05, br, 'bronze');
    IZ.numeral(F, 0, 0.66, 1.12, 'IX', 0.2, c('iron'));
    /* the cables either side of the plate */
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = s * (0.7 + k * 0.08), col = [c('crimson'), c('fGold'), c('rubber')][k];
      F.rod(x, 0.55, 1.0, x, 1.75, 0.98, 0.04, col, 'rubber');
    }
    for (const s of [-1, 1]) {
      F.chb(s * 1.08, 1.0, 0.9, 0.35, 1.3, 0.25, 0.08, dk, 'metal', 'x');
      for (let k = 0; k < 2; k++) F.cy(s * 1.1, 0.75 + k * 0.32, 1.03, 0.09, 0.09, 0.06, iron, 'metal', 'z', 10);
      IZ.phalerae(F, s * 1.1, 1.55, 1.04, 0, 0, 1, 2, 0.24, 0.1);
    }
    /* top: exhaust stacks, the bolt magazine, vents */
    for (const s of [-1, 1]) {
      F.cy(s * 0.6, 2.55, -0.85, 0.13, 0.12, 0.8, c('copper'), 'copper', 'y', 10);
      F.cy(s * 0.6, 2.96, -0.85, 0.16, 0.16, 0.08, iron, 'metal', 'y', 10);
    }
    F.cy(0, 2.52, -0.15, 0.36, 0.36, 0.9, dk, 'metal', 'z', 12);
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6;
      F.cy(Math.cos(a) * 0.2, 2.52 + Math.sin(a) * 0.2, 0.32, 0.075, 0.075, 0.08, br, 'bronze', 'z', 8);
      F.cy(Math.cos(a) * 0.2, 2.52 + Math.sin(a) * 0.2, 0.37, 0.04, 0.004, 0.12, iron, 'metal', 'z', 6, Math.PI / 2, 0, 0);
    }
    F.cb(0, 2.3, -0.15, 0.3, 0.2, 0.5, iron, 'metal');
    for (let i = 0; i < 5; i++) F.cb(0, 0.65 + i * 0.2, -1.17, 1.5, 0.06, 0.05, iron, 'metal');

    /* ---- arms: the driver (right), the grab (left) */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.48, 1.62, -0.05, 0, 0, s * 0.16);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.15, 0, 0, 0.36, 0.5, 'x', iron, br);
      F.chb(s * 0.12, 0.18, 0, 1.05, 0.82, 1.2, 0.32, or, 'paint', 'z');
      F.cb(s * 0.12, -0.22, 0, 1.08, 0.07, 1.22, cr, 'paint');
      F.cb(s * 0.12, 0.6, 0, 0.8, 0.06, 0.9, br, 'bronze');
      if (s > 0) IZ.sun(F, s * 0.66, 0.2, 0, 1, 0, 0, 0.28);
      else IZ.phalera(F, s * 0.66, 0.2, 0, -1, 0, 0, 0.2);
      F.chb(0, -0.5, 0, 0.6, 0.8, 0.62, 0.12, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.4, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.27, 0.72, 'x', iron, br);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.33], A + '_el', [0, -0.35, 0.36], 0.06, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 1.2, 1.9, -0.7], A + '_sh', [s * 0.1, -0.3, -0.34], 0.05, c('rubber'), 0.18);
    }
    /* the driver: housing, bands, the ram */
    R.on('arm_r_el');
    F.cy(0, -0.62, 0.04, 0.44, 0.44, 1.2, gun, 'metal', 'y', 16);
    for (const y of [-0.2, -0.62, -1.05]) F.cy(0, y, 0.04, 0.47, 0.47, 0.1, or, 'paint', 'y', 16);
    F.cy(0, -0.62, 0.04, 0.48, 0.48, 0.04, cr, 'paint', 'y', 16);
    F.cy(0, -1.24, 0.04, 0.36, 0.42, 0.1, iron, 'metal', 'y', 14);
    R.bone('ram', 'arm_r_el', 0, -1.3, 0.04);
    R.on('ram');
    F.cy(0, 0.35, 0, 0.17, 0.17, 0.9, c('chrome'), 'chrome', 'y', 12);
    F.chb(0, -0.2, 0, 0.78, 0.44, 0.78, 0.14, dk, 'metal', 'y');
    F.cy(0, -0.45, 0, 0.3, 0.36, 0.08, iron, 'metal', 'y', 12);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; F.cy(Math.cos(a) * 0.3, -0.05, Math.sin(a) * 0.3, 0.05, 0.05, 0.06, br, 'bronze', 'y', 6); }
    R.point('ram_tip', 'ram', 0, -0.5, 0);
    /* the grab */
    R.on('arm_l_el');
    F.chb(0, -0.5, 0.02, 0.64, 0.95, 0.66, 0.12, steel, 'paint', 'y');
    F.chb(0.34, -0.45, 0.02, 0.06, 0.6, 0.5, 0.03, or, 'paint', 'y');
    R.bone('arm_l_wr', 'arm_l_el', 0, -1.0, 0.02, 0.4, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.15, 0, 0.62, 0.36, 0.6, 0.1, dk, 'metal', 'x');
    const fingers = [['claw_f0', 0.2, 0.18], ['claw_f1', -0.2, 0.18], ['claw_th', 0, -0.24]];
    for (const fd of fingers) {
      R.bone(fd[0], 'arm_l_wr', fd[1], -0.3, fd[2], fd[2] < 0 ? -0.35 : 0.35, 0, 0);
      R.on(fd[0]);
      const sg = fd[2] < 0 ? -1 : 1;
      F.chb(0, -0.22, 0, 0.16, 0.46, 0.18, 0.04, gun, 'metal', 'y');
      F.chb(0, -0.5, sg * 0.1, 0.14, 0.3, 0.14, 0.04, gun, 'metal', 'y', sg * 0.6, 0, 0);
      F.cy(0, -0.66, sg * 0.22, 0.06, 0.005, 0.16, br, 'bronze', 'y', 6, Math.PI - sg * 0.9, 0, 0);
      MP.joint(F, 0, 0, 0, 0.08, 0.2, 'x', iron, null);
    }

    /* ---- legs: short, thick, wide */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.86, -0.1, 0], L1: 0.76, L2: 0.72, knee: 1, ankleH: 0.46, rest: [s * 0.98, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.2 });
      R.on(Lg + '_hip');
      F.chb(0, -0.38, 0, 0.66, 0.7, 0.76, 0.14, steel, 'paint', 'y');
      F.chb(s * 0.355, -0.36, 0, 0.06, 0.56, 0.6, 0.03, or, 'paint', 'y');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.27, 0.66, 'x', iron, br);
      F.chb(0, 0.0, 0.33, 0.52, 0.4, 0.18, 0.08, or, 'paint', 'x');
      F.chb(0, -0.38, 0.0, 0.7, 0.72, 0.78, 0.16, dk, 'paint', 'y');
      F.chb(0, -0.35, 0.4, 0.5, 0.56, 0.06, 0.03, steel, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.15, -0.38], Lg + '_knee', [0, -0.3, -0.4], 0.07, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.92, l: 1.15, ankleH: 0.46, plate: steel, iron: gun, trim: br, toes: 3 });
    }

    /* ---- dressing: the standard with the open hand, feathers at the pauldrons */
    IZ.vexillum(F, R, 'vex', 'torso', -0.75, 2.25, -1.05, { h: 2.6, w: 0.75, bh: 0.85, finial: 'hand', paint: IZ.paint(F, 'legion', { numeral: 'IX' }), discs: 3 });
    IZ.feathers(F, R, 'fth_l', 'arm_l_sh', 0.62, -0.2, 0.55, { n: 6, len: 0.6 });
    IZ.feathers(F, R, 'fth_r', 'arm_r_sh', -0.62, -0.2, 0.55, { n: 6, len: 0.6, cols: ['fBlack', 'fWhite', 'fScarlet'] });
  }
});
