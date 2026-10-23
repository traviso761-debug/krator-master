/* ======================================================================
   Stalker: the blade (kits/mechs/krator-mechs-stalker-blade.js)

   About the height of a man: a hunched walker, its great white shoulders rising over an
   open machine core, two long arms that hang nearly to the sand and end in hooked blades,
   two small arms folded at the chest, squat bowed legs on splayed feet (the owner's
   reference: the four-armed heavy, as the Baiulus, made sleek and armed with blades).
   It closes while the harpooner hangs back, and cuts twice: one arm over and down, then
   the other.
   ====================================================================== */
MECH({
  key: 'st_blade', name: 'Blade Stalker', culture: 'stalker',
  role: 'killer: two hooked blade-arms', origin: 'Ancient make, gone feral',
  lore: 'A hunched white walker whose long arms end in hooked blades. It closes while the harpooner hangs back and cuts twice, one arm over and down, then the other.',
  tags: { class: 'mech', type: ['war machine'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['blade'],
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Blade'],
  w: 1.3, d: 1.0, h: 2.0,
  data: { height: 1.9, mass: 0.4, crew: 0, pilot: 'none', reach: 1.4, weapon: 'two hooked blade-arms, two small grippers',
    engine: 'Ancient cell', armour: 'white composite shell' },
  gait: { period: 0.8, duty: 0.6, stride: 0.48, lift: 0.12, bob: 0.03, sway: 0.05, roll: 0.03, twist: 0.06, lean: 0.04,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.15, 0, 0], arm_r_sh: [0.15, 0, 0] } },
  idle: { breathe: 0.015, scan: 0.3, look: 0.4 },
  anim: {
    idle: function (P, t, w) {
      const a = Math.sin(t * 0.7) * 0.18 * w, b = Math.sin(t * 0.7 + 1.6) * 0.18 * w;
      P.b.belly_l = [a, 0, 0]; P.b.belly_r = [b, 0, 0];
      P.b.arm_l_wr = [0.08 * Math.sin(t * 0.45) * w, 0, 0]; P.b.arm_r_wr = [0.08 * Math.sin(t * 0.45 + 2) * w, 0, 0];
    }
  },
  attack: {
    kind: 'cut', dur: 1.7,
    keys: [
      [0, {}],
      [0.35, { b: { arm_r_sh: [-2.3, 0, 0.35], arm_r_el: [-0.6, 0, 0], arm_l_sh: [-0.6, 0, 0.2], torso: [-0.15, 0.25, 0] },
        s: { body: [0, 0.02, -0.08] } }, 's'],
      [0.55, { b: { arm_r_sh: [-0.5, 0, -0.25], arm_r_el: [-0.2, 0, 0], arm_l_sh: [-1.9, 0, -0.3], arm_l_el: [-0.6, 0, 0], torso: [0.3, -0.2, 0] },
        s: { body: [0, -0.08, 0.3] } }, 'i'],
      [0.95, { b: { arm_r_sh: [-0.4, 0, -0.2], arm_l_sh: [-0.5, 0, 0.25], arm_l_el: [-0.2, 0, 0], torso: [0.32, 0.2, 0] },
        s: { body: [0, -0.1, 0.36] } }, 'i'],
      [1.7, {}, 's']
    ],
    events: [
      { t: 0.56, type: 'impact', at: 'blade_r_pt', r: 0.8 },
      { t: 0.96, type: 'impact', at: 'blade_l_pt', r: 0.8 }
    ]
  },

  build: function (F, R) {
    const c = F.col;
    const sh = c('shell'), shd = c('shellDk'), fr = c('frame'), frd = c('frameDk'), jt = c('joint'), rd = c('red'), bl = c('blade');

    /* ---- the hips */
    R.bone('body', null, 0, 0.83, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.32, 0.14, 0.26, 0.05, fr, 'metal', 'z');

    /* ---- the torso, hunched: the open core, its eye and hoses, the yoke, a white pack behind */
    R.bone('torso', 'body', 0, 0.08, 0, 0.28, 0, 0);
    R.on('torso');
    F.sph(0, 0.12, 0.04, 0.15, 0.1, 0.13, jt, 'metal', 18, 10);
    F.chb(0, 0.34, 0, 0.34, 0.4, 0.26, 0.04, fr, 'metal', 'y');
    F.chb(0, 0.36, 0.142, 0.2, 0.18, 0.02, 0.01, jt, 'metal', 'z');
    F.sph(0, 0.4, 0.16, 0.035, 0.035, 0.025, c('eye'), 'glow', 12, 8);
    MP.hose(F, R, 'torso', [-0.1, 0.5, 0.12], 'torso', [0.06, 0.22, 0.14], 0.012, c('teal'), 0.05);
    MP.hose(F, R, 'torso', [0.1, 0.48, 0.12], 'torso', [-0.04, 0.2, 0.14], 0.011, rd, 0.05);
    F.sph(0, 0.4, -0.17, 0.2, 0.24, 0.12, sh, 'paint', 22, 14);
    F.chb(0, 0.6, -0.02, 0.64, 0.12, 0.24, 0.04, frd, 'metal', 'x');

    /* ---- the great arms: a swelling white shoulder, upper arm and forearm with a red ring, a hooked blade */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 0.4, 0.62, -0.02, -0.15, 0, s * 0.04);
      R.on(A + '_sh');
      F.sph(s * 0.05, 0.1, 0, 0.17, 0.25, 0.19, sh, 'paint', 24, 16);
      ST.hatch(F, s * 0.215, 0.12, 0, s, 3, 0.07);
      F.cy(0, -0.3, 0, 0.1, 0.12, 0.44, sh, 'paint', 'y', 18);
      F.cy(0, -0.42, 0, 0.114, 0.114, 0.03, rd, 'paint', 'y', 18);
      R.bone(A + '_el', A + '_sh', 0, -0.56, 0, -0.45, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.065, 0.13, 'x', jt, null);
      F.cy(0, -0.24, 0, 0.08, 0.095, 0.4, sh, 'paint', 'y', 16);
      F.cy(0, -0.34, 0, 0.093, 0.093, 0.025, rd, 'paint', 'y', 16);
      R.bone(A + '_wr', A + '_el', 0, -0.46, 0, 0.15, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.03, 0, 0.07, 0.075, 0.07, frd, 'metal', 'y', 14);
      F.cb(0, -0.2, 0, 0.016, 0.28, 0.08, bl, 'metal');
      F.cb(0, -0.2, -0.044, 0.02, 0.26, 0.012, jt, 'metal');
      F.cb(0, -0.39, 0.065, 0.016, 0.15, 0.06, bl, 'metal', -0.85, 0, 0);
      F.cb(0, -0.42, 0.14, 0.016, 0.09, 0.045, bl, 'metal', -2.3, 0, 0);
      R.point(s > 0 ? 'blade_l_pt' : 'blade_r_pt', A + '_wr', 0, -0.4, 0.12);
    }

    /* ---- the small arms at the chest: two segments, two fingers */
    for (const s of [-1, 1]) {
      const B = s > 0 ? 'belly_l' : 'belly_r';
      R.bone(B, 'torso', s * 0.08, 0.2, 0.15, -0.5, 0, s * 0.15);
      R.on(B);
      MP.joint(F, 0, 0, 0, 0.025, 0.05, 'x', jt, null);
      F.rod(0, -0.01, 0, 0, -0.18, 0, 0.02, sh, 'paint');
      R.bone(B + '_el', B, 0, -0.2, 0, 1.0, 0, 0);
      R.on(B + '_el');
      MP.joint(F, 0, 0, 0, 0.018, 0.04, 'x', jt, null);
      F.rod(0, -0.01, 0, 0, -0.16, 0, 0.015, sh, 'paint');
      for (const t of [-1, 1]) F.rod(t * 0.01, -0.16, 0, t * 0.025, -0.22, 0.01, 0.006, jt, 'metal');
    }

    /* ---- legs: squat and bowed, padded white thighs and shins, splayed three-toed feet */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.2, -0.04, 0], L1: 0.4, L2: 0.4, knee: 1, ankleH: 0.1, rest: [s * 0.27, 0.02], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.075, 0.12, 'x', jt, null);
      F.sph(0, -0.2, 0.01, 0.115, 0.21, 0.125, sh, 'paint', 20, 14);
      F.cy(s * 0.11, -0.2, 0.01, 0.05, 0.05, 0.02, shd, 'paint', 'x', 16);
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.06, 0.1, 'x', jt, null);
      F.sph(0, 0, 0.07, 0.065, 0.07, 0.045, shd, 'paint', 14, 10);
      F.sph(0, -0.19, 0, 0.095, 0.2, 0.105, sh, 'paint', 20, 14);
      R.on(Lg + '_ankle');
      F.cy(0, -0.02, 0, 0.05, 0.055, 0.06, jt, 'metal', 'y', 12);
      F.chb(0, -0.08, 0.04, 0.18, 0.04, 0.26, 0.015, shd, 'paint', 'z');
      for (let i = -1; i <= 1; i++) F.chb(i * 0.07, -0.079, 0.215, 0.05, 0.03, 0.08, 0.01, sh, 'paint', 'z', 0, i * 0.3, 0);
      F.cb(0, -0.08, -0.13, 0.07, 0.034, 0.05, jt, 'metal');
    }
  }
});
