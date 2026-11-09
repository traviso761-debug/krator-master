/* ======================================================================
   Ancient machine: the shrouded walker (kits/mechs/krator-mechs-ancient-shroud.js)

   HUNTER, 7 m: a hunched biped whose body is lost in a coat of hanging conduits (the
   owner's reference: the figure in a cloak of tubes, each ending in a hand), a wide
   yoke of shoulders over a barrel chest, a hood over the front, under the hood a head
   that is a dome of eyes, and under that a stubby cannon that lives among the tubes.
   It comes on slowly with the coat swinging; the hood lifts, the cannon runs out, and
   it fires twice.
   ====================================================================== */
MECH({
  key: 'an_shroud', name: 'Shrouded Walker', culture: 'ancient',
  role: 'hunter: a cannon under the hood', origin: 'Ancient heavy security walker',
  lore: 'A hunched walker lost in a coat of hanging conduits, a dome of eyes under its hood. The hood lifts, the cannon runs out from among the tubes, and it fires twice.',
  tags: { class: 'mech', type: ['war machine', 'heavy'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['cannon'], role: 'hunter',
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Shroud'],
  w: 3.8, d: 5.2, h: 7.0,
  data: { height: 6.8, mass: 16, crew: 0, pilot: 'none', reach: 60, weapon: 'a cannon under the hood',
    engine: 'Ancient cell pack', armour: 'white composite shell under a coat of conduits' },
  gait: { period: 1.9, duty: 0.62, stride: 1.6, lift: 0.4, bob: 0.08, sway: 0.06, roll: 0.03, twist: 0.05, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.14, 0, 0], arm_r_sh: [0.14, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.2, look: 0.5 },
  anim: {
    idle: function (P, t, w) {
      P.b.hood = [0.03 * Math.sin(t * 0.5) * w, 0, 0];
      P.b.arm_l_el = [0.06 * Math.sin(t * 0.45) * w, 0, 0]; P.b.arm_r_el = [0.06 * Math.sin(t * 0.45 + 2) * w, 0, 0];
    }
  },
  attack: {
    kind: 'cannon', dur: 3.2,
    keys: [
      [0, {}],
      [0.5, { b: { head: [0.05, 0.35, 0] } }, 's'],
      [1.0, { b: { head: [0.1, 0, 0], hood: [-0.55, 0, 0], torso: [-0.18, 0, 0], arm_l_sh: [-0.3, 0, 0.3], arm_r_sh: [-0.3, 0, -0.3] }, s: { cannon: [0, 0, 0.55], body: [0, -0.06, 0] } }, 's'],
      [1.3, { b: { head: [0.1, 0, 0], hood: [-0.55, 0, 0], torso: [-0.18, 0, 0], arm_l_sh: [-0.3, 0, 0.3], arm_r_sh: [-0.3, 0, -0.3] }, s: { cannon: [0, 0, 0.55], body: [0, -0.06, 0] } }, 'l'],
      [1.38, { b: { head: [0.1, 0, 0], hood: [-0.5, 0, 0], torso: [-0.3, 0, 0], arm_l_sh: [-0.3, 0, 0.3], arm_r_sh: [-0.3, 0, -0.3] }, s: { cannon: [0, 0, 0.3], body: [0, -0.08, -0.14] } }, 'i'],
      [1.9, { b: { head: [0.1, 0, 0], hood: [-0.55, 0, 0], torso: [-0.18, 0, 0], arm_l_sh: [-0.3, 0, 0.3], arm_r_sh: [-0.3, 0, -0.3] }, s: { cannon: [0, 0, 0.55], body: [0, -0.06, 0] } }, 's'],
      [1.98, { b: { head: [0.1, 0, 0], hood: [-0.5, 0, 0], torso: [-0.3, 0, 0], arm_l_sh: [-0.3, 0, 0.3], arm_r_sh: [-0.3, 0, -0.3] }, s: { cannon: [0, 0, 0.3], body: [0, -0.08, -0.14] } }, 'i'],
      [2.5, { b: { head: [0.05, 0, 0], hood: [-0.3, 0, 0], torso: [-0.1, 0, 0] }, s: { cannon: [0, 0, 0.3], body: [0, -0.04, 0] } }, 's'],
      [3.2, {}, 's']
    ],
    events: [
      { t: 1.32, type: 'fire', kind: 'shell', at: 'cannon_muzzle', dir: [0, 0, 1], speed: 70 },
      { t: 1.92, type: 'fire', kind: 'shell', at: 'cannon_muzzle', dir: [0, 0, 1], speed: 70 }
    ]
  },

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the hips, set back under the hunch */
    R.bone('body', null, 0, 3.1, -0.6);
    R.on('body');
    F.chb(0, 0, 0, 1.3, 0.55, 0.9, 0.14, fr, 'metal', 'x');
    F.chb(0, -0.05, 0.5, 0.9, 0.4, 0.1, 0.04, ANC.wear(F, 0.4), 'paint', 'z');

    /* ---- the torso, hunched: a barrel chest, the wide yoke, a pack behind */
    R.bone('torso', 'body', 0, 0.3, -0.05, 0.42, 0, 0);
    R.on('torso');
    F.cy(0, 0.1, 0, 0.3, 0.38, 0.3, jt, 'metal', 'y', 14);
    F.sph(0, 1.15, 0.1, 1.0, 1.05, 0.92, ANC.wear(F, 0.25), 'paint', 22, 14);
    F.chb(0, 2.05, 0, 2.7, 0.5, 1.05, 0.15, ANC.wearDk(F, 0.3), 'paint', 'x');
    F.chb(0, 2.32, -0.1, 1.2, 0.2, 0.7, 0.06, frd, 'metal', 'x');
    F.chb(0, 1.4, -0.95, 1.4, 1.2, 0.5, 0.12, ANC.wear(F, 0.5), 'paint', 'y');
    for (const s of [-1, 1]) {
      F.cy(s * 0.45, 1.75, -1.1, 0.12, 0.1, 0.9, fr, 'metal', 'y', 8);
      ANC.streak(F, s * 0.4, 1.9, 1.0, 0.7, 0.07);
      F.cy(s * 1.36, 2.05, 0, 0.3, 0.3, 0.06, frd, 'metal', 'x', 14);
    }
    ANC.plate(F, 0, 0.75, 1.0, 0.5, 0.25);
    F.chb(0, 0.5, 0.75, 1.1, 0.3, 0.3, 0.06, frd, 'metal', 'x');

    /* ---- the hood over the front: a cowl that lifts for the cannon */
    R.bone('hood', 'torso', 0, 2.3, 0.3, 0.15, 0, 0);
    R.on('hood');
    F.sph(0, 0.0, 0.45, 1.1, 0.85, 1.35, ANC.wear(F, 0.3), 'paint', 22, 10, 0, TAU, 0, 0.55 * Math.PI);
    F.sph(0, -0.02, 0.45, 1.0, 0.75, 1.25, frd, 'metal', 18, 8, 0, TAU, 0.1, 0.5 * Math.PI);
    F.chb(0, 0.76, 0.3, 0.4, 0.14, 1.4, 0.04, ANC.wearDk(F, 0.5), 'paint', 'z');
    ANC.streak(F, 0.6, 0.55, 1.78, 0.5, 0.07);

    /* ---- the head under the hood: a dome of eyes on a thick neck */
    R.bone('head', 'torso', 0, 1.85, 0.75, 0.1, 0, 0);
    R.on('head');
    F.cy(0, 0.02, -0.1, 0.22, 0.26, 0.4, jt, 'metal', 'z', 12);
    F.sph(0, 0.05, 0.35, 0.42, 0.4, 0.42, ANC.wearDk(F, 0.25), 'paint', 18, 12);
    ANC.eyes(F, 0, 0.05, 0.35, 0.42, 8, 0.05, 'amber', 0.045, 0.2);
    ANC.eyes(F, 0, 0.05, 0.35, 0.42, 5, 0.6, 'cyan', 0.035, 0.6);
    ANC.lens(F, 0, 0.3, 0.6, 0, 0.5, 1, 0.07, 'cyan', null);
    R.point('head_pt', 'head', 0, 0.05, 0.8);

    /* ---- the cannon under the head, among the tubes: a breech, a stubby barrel; it runs out on the clip */
    R.bone('cannon', 'torso', 0, 1.3, 0.55, 0.25, 0, 0);
    R.on('cannon');
    F.chb(0, 0, -0.2, 0.6, 0.5, 0.9, 0.1, frd, 'metal', 'z');
    F.cy(0, 0, 0.7, 0.2, 0.22, 1.2, ANC.soot(F), 'metal', 'z', 14);
    F.cy(0, 0, 1.33, 0.26, 0.24, 0.12, jt, 'metal', 'z', 14);
    F.cy(0, 0, 1.0, 0.23, 0.23, 0.08, fr, 'metal', 'z', 14);
    R.point('cannon_muzzle', 'cannon', 0, 0, 1.45);
    for (const s of [-1, 1]) ANC.conduit(F, R, 'torso', [s * 0.5, 1.6, 0.6], 'cannon', [s * 0.25, 0.1, -0.5], 0.05, 0.08, 5);

    /* ---- the coat: fourteen conduits hung from the yoke, each ending in a hand of three claws */
    const HANG = [];
    for (let i = 0; i < 8; i++) HANG.push([-1.2 + i * 0.343, -0.4, 2.3 + (i % 3) * 0.3]);
    for (const s of [-1, 1]) { HANG.push([s * 1.3, 0.0, 2.6]); HANG.push([s * 1.28, 0.4, 2.9]); HANG.push([s * 1.15, 0.78, 2.5]); }
    HANG.forEach(function (p, i) {
      const n = 'coat' + i, L = p[2], r = 0.1 + 0.025 * (i % 3);
      R.dangle(n, 'torso', p[0], 1.85, p[1], { mode: 'hang', len: L, k: 12 + (i % 4), c: 2.2, wind: 0.035, max: 0.5 });
      R.on(n);
      F.cy(0, -L / 2 + 0.05, 0, r * 0.9, r, L - 0.1, c(i % 2 ? 'hose' : 'hoseDk'), 'rubber', 'y', 8);
      for (let k = 1; k <= 2; k++) F.cy(0, -L * k / 3, 0, r * 1.12, r * 1.12, 0.07, i % 5 === 0 ? c('rust') : fr, 'metal', 'y', 8);
      F.cy(0, -L + 0.02, 0, r * 0.7, r * 0.5, 0.08, jt, 'metal', 'y', 8);
      for (let k = 0; k < 3; k++) {
        const a = k * TAU / 3 + i;
        F.rod(0, -L + 0.0, 0, Math.sin(a) * r * 0.8, -L - 0.14, Math.cos(a) * r * 0.8, 0.014, jt, 'metal');
      }
    });

    /* ---- the arms, outside the coat: thick, two segments, a three-fingered hand */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.42, 2.05, 0.1, -0.2, 0, s * 0.1);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.17, 0.26, 'x', jt, null);
      F.cy(0, -0.55, 0, 0.15, 0.17, 0.95, ANC.wear(F, 0.35), 'paint', 'y', 12);
      R.bone(A + '_el', A + '_sh', 0, -1.05, 0, -0.5, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.13, 0.22, 'x', jt, null);
      F.cy(0, -0.5, 0, 0.12, 0.15, 0.9, ANC.wear(F, 0.4), 'paint', 'y', 12);
      R.bone(A + '_wr', A + '_el', 0, -1.0, 0, 0.2, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.05, 0, 0.14, 0.11, 0.14, frd, 'metal', 'y', 10);
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.6;
        F.rod(0, -0.1, 0, Math.sin(a) * 0.18, -0.4, Math.cos(a) * 0.1, 0.035, jt, 'metal');
        F.rod(Math.sin(a) * 0.18, -0.4, Math.cos(a) * 0.1, Math.sin(a) * 0.14, -0.6, Math.cos(a) * 0.22, 0.028, jt, 'metal');
      }
    }

    /* ---- legs: thick, human-jointed, in dark sleeves, broad stomping feet */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.55, -0.12, 0], L1: 1.7, L2: 1.6, knee: 1, ankleH: 0.3, rest: [s * 0.62, -0.55], phase: s > 0 ? 0 : 0.5, toe: 0.3 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.3, 0.46, 'x', jt, null);
      F.cy(0, -0.62, 0, 0.29, 0.26, 1.24, ANC.wear(F, 0.35), 'paint', 'y', 14);
      ANC.sleeve(F, -1.66, -1.24, 0.31, c('rubber'), 3);
      F.chb(0, -0.6, 0.26, 0.4, 0.8, 0.1, 0.04, ANC.wearDk(F, 0.5), 'paint', 'x');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.26, 0.44, 'x', jt, null);
      F.cy(0, -0.85, 0, 0.24, 0.2, 1.45, ANC.soot(F), 'metal', 'y', 14);
      F.chb(0, -0.6, 0.2, 0.36, 1.0, 0.12, 0.04, ANC.wear(F, 0.5), 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.4, -0.3], Lg + '_knee', [0, -0.4, -0.22], 0.06, frd, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.75, l: 1.05, ankleH: 0.3, plate: ANC.soot(F), iron: frd, trim: st, toes: 3 });
    }
  }
});
