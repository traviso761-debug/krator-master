/* ======================================================================
   Ancient machine: the hunched trooper (kits/mechs/krator-mechs-ancient-trooper.js)

   HUNTER, 3 m: a bipedal soldier frame, hunched, with heavy forearms that it raises
   as shields, a low visored helm, a cell pack on its back and a gun on its right
   shoulder with its drum magazine (the owner's references: the rusted heavy with the
   red lamps, the grey soldier with the shoulder gun). The war's infantry, still at
   its post. It levels the gun and fires a burst of three behind its raised forearm.
   ====================================================================== */
MECH({
  key: 'an_trooper', name: 'Hunched Trooper', culture: 'ancient',
  role: 'hunter: a shoulder gun, a burst of three', origin: 'Ancient infantry frame',
  lore: 'A hunched soldier frame with heavy forearms and a gun on its shoulder, still at its post. It raises a forearm and fires a burst of three over it.',
  tags: { class: 'mech', type: ['war machine', 'line'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['gun'], role: 'hunter',
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Trooper'],
  w: 2.0, d: 2.6, h: 3.05,
  data: { height: 2.9, mass: 1.6, crew: 0, pilot: 'none', reach: 80, weapon: 'a shoulder gun with a drum magazine; heavy forearms',
    engine: 'Ancient cell', armour: 'white composite plate, heavy on the forearms' },
  gait: { period: 1.0, duty: 0.6, stride: 0.85, lift: 0.2, bob: 0.04, sway: 0.04, roll: 0.03, twist: 0.08, lean: 0.04,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.3, 0, 0], arm_r_sh: [0.3, 0, 0] } },
  idle: { breathe: 0.02, scan: 0.25, look: 0.5 },
  anim: {
    idle: function (P, t, w) {
      P.b.gun = [0.03 * Math.sin(t * 0.6) * w, 0.03 * Math.sin(t * 0.43) * w, 0];
      P.b.arm_l_el = [0.06 * Math.sin(t * 0.5) * w, 0, 0]; P.b.arm_r_el = [0.06 * Math.sin(t * 0.5 + 1.5) * w, 0, 0];
    }
  },
  attack: {
    kind: 'burst', dur: 2.4,
    keys: [
      [0, {}],
      [0.45, { b: { torso: [-0.12, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.22, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, 0] } }, 's'],
      [0.68, { b: { torso: [-0.12, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.22, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, 0] } }, 'l'],
      [0.74, { b: { torso: [-0.16, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.3, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, -0.04], gun: [0, 0, -0.05] } }, 'i'],
      [0.86, { b: { torso: [-0.12, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.22, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, 0] } }, 'o'],
      [0.92, { b: { torso: [-0.16, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.3, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, -0.04], gun: [0, 0, -0.05] } }, 'i'],
      [1.04, { b: { torso: [-0.12, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.22, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, 0] } }, 'o'],
      [1.1, { b: { torso: [-0.16, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.3, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, -0.04], gun: [0, 0, -0.05] } }, 'i'],
      [1.3, { b: { torso: [-0.12, 0.08, 0], head: [-0.1, 0, 0], gun: [-0.22, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-1.1, 0, 0], arm_r_sh: [-0.3, 0, -0.2] }, s: { body: [0, -0.05, 0] } }, 'o'],
      [1.8, { b: { torso: [-0.05, 0.04, 0], gun: [-0.1, 0, 0], arm_l_sh: [-0.6, 0, 0.2], arm_l_el: [-0.5, 0, 0] } }, 's'],
      [2.4, {}, 's']
    ],
    events: [
      { t: 0.72, type: 'fire', kind: 'slug', at: 'gun_muzzle', dir: [0, 0, 1], speed: 90 },
      { t: 0.9, type: 'fire', kind: 'slug', at: 'gun_muzzle', dir: [0, 0, 1], speed: 90 },
      { t: 1.08, type: 'fire', kind: 'slug', at: 'gun_muzzle', dir: [0, 0, 1], speed: 90 }
    ]
  },

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the pelvis */
    R.bone('body', null, 0, 1.4, -0.35);
    R.on('body');
    F.chb(0, 0, 0, 0.72, 0.34, 0.5, 0.08, fr, 'metal', 'x');
    F.chb(0, -0.02, 0.27, 0.5, 0.26, 0.05, 0.02, ANC.wear(F, 0.4), 'paint', 'z');
    for (const s of [-1, 1]) F.chb(s * 0.38, -0.06, -0.05, 0.08, 0.3, 0.36, 0.02, ANC.wearDk(F, 0.5), 'paint', 'x');

    /* ---- the torso, hunched: a chest shell, the cell pack, the pauldron, the gun mount */
    R.bone('torso', 'body', 0, 0.16, 0, 0.3, 0, 0);
    R.on('torso');
    F.cy(0, 0.08, 0, 0.17, 0.2, 0.2, jt, 'metal', 'y', 12);
    F.chb(0, 0.58, 0.05, 1.0, 0.72, 0.64, 0.14, ANC.wear(F, 0.25), 'paint', 'x');
    F.chb(0, 0.45, 0.38, 0.62, 0.3, 0.04, 0.02, ANC.wearDk(F, 0.4), 'paint', 'z');
    ANC.visor(F, 0, 0.7, 0.378, 0.5, 0.1);
    ANC.plate(F, -0.3, 0.5, 0.378, 0.16, 0.1);
    ANC.streak(F, 0.3, 0.9, 0.378, 0.35, 0.05);
    F.chb(0, 0.55, -0.45, 0.8, 0.62, 0.3, 0.06, frd, 'metal', 'y');
    for (const s of [-1, 1]) F.cy(s * 0.22, 0.95, -0.5, 0.07, 0.06, 0.3, fr, 'metal', 'y', 8);
    F.chb(0.62, 1.0, 0.02, 0.5, 0.2, 0.5, 0.06, ANC.wear(F, 0.35), 'paint', 'x', 0, 0, -0.2);
    F.chb(-0.55, 1.02, -0.02, 0.3, 0.14, 0.4, 0.04, frd, 'metal', 'x');

    /* ---- the head: a low helm, a visor slit */
    R.bone('head', 'torso', 0, 1.0, 0.12);
    R.on('head');
    F.cy(0, 0.04, 0, 0.08, 0.1, 0.1, jt, 'metal', 'y', 8);
    F.sph(0, 0.22, 0.02, 0.21, 0.18, 0.24, ANC.wearDk(F, 0.2), 'paint', 14, 10);
    F.chb(0, 0.14, 0.14, 0.34, 0.1, 0.16, 0.03, frd, 'metal', 'x');
    F.cb(0, 0.14, 0.226, 0.26, 0.03, 0.012, c('cyan'), 'glow');
    F.cb(0, 0.3, -0.18, 0.12, 0.08, 0.1, fr, 'metal');
    R.point('head_pt', 'head', 0, 0.2, 0.28);

    /* ---- the shoulder gun (right): a receiver on a pivot, a barrel, the drum magazine */
    R.bone('gun', 'torso', -0.55, 1.18, -0.05, -0.05, 0, 0);
    R.on('gun');
    MP.joint(F, 0, -0.08, 0, 0.06, 0.12, 'x', jt, null);
    F.chb(0, 0.05, 0.05, 0.22, 0.22, 0.9, 0.04, frd, 'metal', 'z');
    F.cy(0, 0.05, 0.85, 0.05, 0.045, 0.8, ANC.soot(F), 'metal', 'z', 10);
    F.cy(0, 0.05, 1.22, 0.06, 0.06, 0.1, jt, 'metal', 'z', 10);
    F.cy(-0.17, 0.0, -0.1, 0.16, 0.16, 0.12, ANC.wear(F, 0.5), 'paint', 'x', 14);
    F.cb(0, 0.19, -0.1, 0.06, 0.08, 0.3, fr, 'metal');
    F.cb(0, 0.05, 0.56, 0.04, 0.08, 0.1, fr, 'metal');
    R.point('gun_muzzle', 'gun', 0, 0.05, 1.3);
    ANC.conduit(F, R, 'torso', [-0.35, 0.8, -0.3], 'gun', [-0.05, 0.0, -0.3], 0.025, 0.1, 4);

    /* ---- the arms: an upper arm, then the heavy forearm, a fist */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 0.6, 0.85, 0.04, -0.15, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.11, 0.2, 'x', jt, null);
      F.cy(0, -0.3, 0, 0.09, 0.1, 0.5, ANC.wear(F, 0.35), 'paint', 'y', 10);
      R.bone(A + '_el', A + '_sh', 0, -0.56, 0, -0.5, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.09, 0.18, 'x', jt, null);
      F.chb(0, -0.34, 0.02, 0.36, 0.6, 0.4, 0.09, ANC.wear(F, 0.3), 'paint', 'y');
      F.chb(0, -0.3, -0.22, 0.26, 0.4, 0.06, 0.02, ANC.wearDk(F, 0.5), 'paint', 'z');
      ANC.streak(F, s * 0.08, -0.15, 0.226, 0.25, 0.04);
      F.chb(0, -0.7, 0.0, 0.3, 0.16, 0.32, 0.05, frd, 'metal', 'y');
      for (let k = 0; k < 3; k++) F.cb((k - 1) * 0.09, -0.82, 0.06, 0.07, 0.1, 0.16, jt, 'metal');
    }

    /* ---- legs: human-jointed, armoured thighs, sleeved shins, stomping feet */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.27, -0.06, 0], L1: 0.72, L2: 0.7, knee: 1, ankleH: 0.14, rest: [s * 0.32, -0.33], phase: s > 0 ? 0 : 0.5, toe: 0.3 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.13, 0.2, 'x', jt, null);
      F.chb(0, -0.36, 0, 0.26, 0.6, 0.3, 0.06, ANC.wear(F, 0.35), 'paint', 'y');
      F.chb(0, -0.3, 0.16, 0.22, 0.4, 0.04, 0.02, ANC.wearDk(F, 0.5), 'paint', 'z');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.1, 0.18, 'x', jt, null);
      F.cy(0, -0.15, 0, 0.09, 0.08, 0.3, ANC.soot(F), 'metal', 'y', 10);
      ANC.sleeve(F, -0.64, -0.3, 0.1, c('rubber'), 3);
      F.cy(0, -0.67, 0, 0.07, 0.075, 0.1, frd, 'metal', 'y', 10);
      F.chb(0, -0.25, 0.09, 0.2, 0.34, 0.05, 0.02, ANC.wear(F, 0.5), 'paint', 'z');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, -0.15], Lg + '_knee', [0, -0.25, -0.1], 0.03, frd, c('chrome'));
      R.on(Lg + '_ankle');
      F.cy(0, -0.02, 0, 0.07, 0.08, 0.1, jt, 'metal', 'y', 10);
      F.chb(0, -0.1, 0.06, 0.28, 0.08, 0.46, 0.025, ANC.soot(F), 'metal', 'z');
      F.chb(0, -0.105, 0.32, 0.26, 0.06, 0.1, 0.02, frd, 'metal', 'z', -0.3, 0, 0);
      F.chb(0, -0.06, -0.14, 0.2, 0.08, 0.12, 0.02, frd, 'metal', 'x');
    }
  }
});
