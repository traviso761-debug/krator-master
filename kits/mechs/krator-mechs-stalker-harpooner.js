/* ======================================================================
   Stalker: the harpooner (kits/mechs/krator-mechs-stalker-harpooner.js)

   About the height of a man: a smooth white hull leaning forward on two legs in flexible
   grey sleeves, a round sensor head at the front, two thin manipulator arms hung under the
   chin, and a pneumatic harpoon gun on each side of the hull (the owner's reference: the
   canvas-legged walker, as the Speculator, made sleek). It stays back and shows nothing
   while the blades close, and takes a straggler or a beast out of the line from range:
   a hiss, no flash, and the line drags its quarry in.
   ====================================================================== */
MECH({
  key: 'st_harpooner', name: 'Harpooner Stalker', culture: 'stalker',
  role: 'hunter: two pneumatic harpoon guns', origin: 'Ancient make, gone feral',
  lore: 'A quiet white hull on two sleeved legs with a harpoon gun on each side. It hangs back while the blades close and pins a straggler from range.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['harpoon'],
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Harpooner'],
  w: 1.1, d: 1.7, h: 2.2,
  data: { height: 1.9, mass: 0.35, crew: 0, pilot: 'none', reach: 30, weapon: 'two pneumatic harpoon guns on lines',
    engine: 'Ancient cell', armour: 'white composite shell' },
  gait: { period: 0.85, duty: 0.6, stride: 0.52, lift: 0.14, bob: 0.03, sway: 0.03, roll: 0.02, twist: 0.04, lean: 0.05,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.12, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.012, scan: 0.5, look: 0.6 },
  anim: {
    idle: function (P, t, w) {
      const a = Math.sin(t * 0.9) * 0.1 * w, b = Math.sin(t * 0.9 + 1.9) * 0.1 * w;
      P.b.arm_l_el = [a, 0, 0]; P.b.arm_r_el = [b, 0, 0];
      P.b.gun_l = [0.04 * Math.sin(t * 0.5) * w, 0.05 * Math.sin(t * 0.37) * w, 0];
      P.b.gun_r = [0.04 * Math.sin(t * 0.5 + 1) * w, -0.05 * Math.sin(t * 0.41) * w, 0];
    }
  },
  attack: {
    kind: 'harpoon', dur: 2.4,
    keys: [
      [0, {}],
      [0.5, { b: { torso: [0.06, 0, 0], head: [0.06, 0, 0], gun_l: [0.04, 0.04, 0], gun_r: [0.04, -0.04, 0] }, s: { body: [0, -0.07, 0] } }, 's'],
      [0.7, { b: { torso: [0.06, 0, 0], head: [0.06, 0, 0], gun_l: [0.04, 0.04, 0], gun_r: [0.04, -0.04, 0] }, s: { body: [0, -0.07, 0] } }, 'l'],
      [0.76, { b: { torso: [0.02, 0.05, 0], head: [0.06, 0, 0], gun_l: [-0.08, 0.04, 0], gun_r: [0.04, -0.04, 0] },
        s: { body: [0, -0.07, -0.03], gun_l: [0, 0, -0.07] } }, 'i'],
      [1.2, { b: { torso: [0.06, -0.02, 0], head: [0.06, 0, 0], gun_l: [0.02, 0.04, 0], gun_r: [0.04, -0.04, 0] },
        s: { body: [0, -0.07, 0], gun_l: [0, 0, -0.03] } }, 's'],
      [1.26, { b: { torso: [0.02, -0.06, 0], head: [0.06, 0, 0], gun_l: [0.02, 0.04, 0], gun_r: [-0.08, -0.04, 0] },
        s: { body: [0, -0.07, -0.03], gun_l: [0, 0, -0.03], gun_r: [0, 0, -0.07] } }, 'i'],
      [1.8, { b: { torso: [-0.04, 0, 0], arm_l_sh: [-0.5, 0, 0], arm_r_sh: [-0.5, 0, 0] }, s: { body: [0, -0.04, -0.06], gun_l: [0, 0, -0.02], gun_r: [0, 0, -0.02] } }, 's'],
      [2.4, {}, 's']
    ],
    events: [
      { t: 0.72, type: 'fire', kind: 'barb', at: 'muzzle_l', dir: [0, 0, 1], speed: 45 },
      { t: 1.22, type: 'fire', kind: 'barb', at: 'muzzle_r', dir: [0, 0, 1], speed: 45 }
    ]
  },

  build: function (F, R) {
    const c = F.col;
    const sh = c('shell'), shd = c('shellDk'), fr = c('frame'), frd = c('frameDk'), jt = c('joint'), sl = c('sleeve'), rd = c('red');

    /* ---- the hips */
    R.bone('body', null, 0, 0.9, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.34, 0.14, 0.28, 0.05, fr, 'metal', 'z');
    for (const s of [-1, 1]) F.cy(s * 0.17, -0.03, 0, 0.065, 0.065, 0.06, jt, 'metal', 'x', 14);

    /* ---- the hull, leaning forward: one smooth shell, a hump behind, a chin under the head */
    R.bone('torso', 'body', 0, 0.08, -0.02, 0.3, 0, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.11, 0.13, 0.1, jt, 'metal', 'y', 16);
    F.sph(0, 0.4, 0.02, 0.32, 0.3, 0.46, sh, 'paint', 28, 18);
    F.sph(0, 0.62, -0.14, 0.24, 0.18, 0.26, sh, 'paint', 24, 14);
    F.sph(0, 0.2, 0.3, 0.2, 0.14, 0.17, shd, 'paint', 22, 12);
    for (const s of [-1, 1]) {
      ST.hatch(F, s * 0.315, 0.47, -0.02, s, 4, 0.08);
      ST.lights(F, s * 0.292, 0.38, 0.2, s);
    }
    /* two whip aerials off the hump */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'torso', s * 0.07, 0.77, -0.2, { mode: 'whip', len: 0.3, k: 40, c: 4, wind: 0.02, max: 0.25 });
      R.on(A);
      F.rod(0, 0, 0, 0, 0.3, -0.03, 0.007, frd, 'metal');
      F.knob(0, 0.3, -0.03, 0.012, frd, 'metal');
    }

    /* ---- the head: a round sensor, a dark ring, a red lens */
    R.bone('head', 'torso', 0, 0.38, 0.46, -0.3, 0, 0);
    R.on('head');
    F.cy(0, 0, 0.04, 0.085, 0.09, 0.14, sh, 'paint', 'z', 20);
    F.cy(0, 0, 0.125, 0.07, 0.07, 0.04, jt, 'metal', 'z', 20);
    F.cy(0, 0, 0.15, 0.042, 0.042, 0.012, c('eye'), 'glow', 'z', 16);
    F.cy(0, 0.075, 0.0, 0.03, 0.03, 0.05, shd, 'paint', 'y', 10);

    /* ---- the harpoon guns, one on each side: a pneumatic body, a barrel, a loaded barb, a tank under */
    for (const s of [-1, 1]) {
      const G = s > 0 ? 'gun_l' : 'gun_r';
      R.bone(G, 'torso', s * 0.39, 0.36, 0.06, -0.3, 0, 0);
      R.on(G);
      F.cb(-s * 0.06, 0, 0, 0.07, 0.05, 0.12, frd, 'metal');
      F.cy(0, 0, 0.02, 0.05, 0.05, 0.46, fr, 'metal', 'z', 16);
      F.cy(0, 0, 0.05, 0.056, 0.056, 0.03, rd, 'paint', 'z', 16);
      F.cy(0, 0, 0.36, 0.026, 0.026, 0.24, jt, 'metal', 'z', 12);
      F.cy(0, 0, 0.495, 0.036, 0.036, 0.03, jt, 'metal', 'z', 12);
      F.cy(0, 0, 0.56, 0.018, 0.002, 0.09, c('tip'), 'metal', 'z', 6);
      F.cy(0, -0.075, -0.04, 0.036, 0.036, 0.26, sh, 'paint', 'z', 14);
      F.sph(0, -0.075, 0.09, 0.036, 0.036, 0.03, sh, 'paint', 14, 8);
      F.sph(0, -0.075, -0.17, 0.036, 0.036, 0.03, sh, 'paint', 14, 8);
      F.cy(0, 0, -0.235, 0.036, 0.03, 0.04, jt, 'metal', 'z', 12);
      R.point(s > 0 ? 'muzzle_l' : 'muzzle_r', G, 0, 0, 0.62);
      MP.hose(F, R, 'torso', [s * 0.24, 0.3, -0.2], G, [0, -0.04, -0.18], 0.012, c('rubber'), 0.04);
    }

    /* ---- the arms: thin, two segments, hung under the chin, a hooked gripper */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 0.12, 0.12, 0.3, -0.25, 0, s * 0.06);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.03, 0.06, 'x', jt, null);
      F.rod(0, -0.02, 0, 0, -0.34, 0, 0.016, c('teal'), 'paint');
      R.bone(A + '_el', A + '_sh', 0, -0.36, 0, -0.3, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.022, 0.05, 'x', jt, null);
      F.rod(0, -0.01, 0, 0, -0.32, 0, 0.013, fr, 'metal');
      R.bone(A + '_wr', A + '_el', 0, -0.34, 0, 0.2, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.01, 0, 0.022, 0.018, 0.04, jt, 'metal', 'y', 8);
      for (const k of [['_a', 1], ['_b', -1]]) {
        const P = 'pin_' + (s > 0 ? 'l' : 'r') + k[0];
        R.bone(P, A + '_wr', k[1] * 0.012, -0.03, 0);
        R.on(P);
        F.rod(0, 0, 0, k[1] * 0.03, -0.05, 0, 0.007, jt, 'metal');
        F.rod(k[1] * 0.03, -0.05, 0, k[1] * 0.004, -0.1, 0.01, 0.006, jt, 'metal');
      }
    }

    /* ---- legs: a joint drum, a flexible grey sleeve over each segment, a white knee cap, a broad three-toed foot */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.21, -0.04, 0], L1: 0.44, L2: 0.44, knee: 1, ankleH: 0.1, rest: [s * 0.23, 0.02], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.07, 0.11, 'x', jt, null);
      F.cy(0, -0.22, 0, 0.088, 0.1, 0.36, sl, 'cloth', 'y', 16);
      for (const y of [-0.12, -0.3]) F.cy(0, y, 0, 0.106, 0.106, 0.016, frd, 'metal', 'y', 16);
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.06, 0.1, 'x', jt, null);
      F.sph(0, 0.0, 0.065, 0.07, 0.085, 0.05, sh, 'paint', 16, 10);
      F.cy(0, -0.22, 0, 0.07, 0.085, 0.36, sl, 'cloth', 'y', 16);
      for (const y of [-0.1, -0.28]) F.cy(0, y, 0, 0.092, 0.092, 0.016, frd, 'metal', 'y', 16);
      R.on(Lg + '_ankle');
      F.cy(0, -0.02, 0, 0.05, 0.055, 0.07, jt, 'metal', 'y', 12);
      F.chb(0, -0.075, 0.03, 0.17, 0.05, 0.22, 0.02, frd, 'metal', 'z');
      for (let i = 0; i < 3; i++) F.chb((i - 1) * 0.058, -0.078, 0.18, 0.048, 0.036, 0.07, 0.012, jt, 'metal', 'z');
      F.chb(0, -0.077, -0.11, 0.07, 0.038, 0.05, 0.012, jt, 'metal', 'z');
    }
  }
});
