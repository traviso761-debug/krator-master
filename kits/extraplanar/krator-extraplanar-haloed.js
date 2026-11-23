/* ======================================================================
   Extraplanar hunter: the Haloed (kits/extraplanar/krator-extraplanar-haloed.js)

   Nearly four metres: a tall hooded robe to a hand's breadth off the ground, two long thin legs and clawed feet
   under it, long arms with long fingers, the face a black void with one eye in it, and behind the head a halo ring
   carrying seven to thirteen eyes (the seed) that blink (the reference: hooded figures whose halo is a ring of
   teeth, of heads, of eyes). At a distance it is a shrouded robot or a robed mutant (the `tallwalker` silhouette).
   Its attack is the gaze: the halo's eyes all open and the ring spins up, the arms rise, the void's eye opens
   and a beam comes out of where a face should be.
   ====================================================================== */
MECH({
  key: 'xp_haloed', name: 'the Haloed', culture: 'extraplanar',
  role: 'hunter: the gaze', origin: 'through a portal',
  lore: 'A hooded robe on two long legs, the face a void with one eye in it, a halo of eyes behind the head. It glides; the eyes blink out of time with one another. When they all open at once, look away.',
  tags: { class: 'mech', type: ['hunter'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['gaze'], setting: 'outdoor', guild: 'none' },
  silhouette: { set: 'tallwalker', h: 3.85 },
  variants: 1, variantNames: ['Haloed'],
  w: 2.0, d: 1.8, h: 4.0,
  data: { height: 3.85, mass: 0.3, crew: 0, pilot: 'none', reach: 40, weapon: 'the gaze: a beam from the void where its face should be', engine: 'none known', armour: 'cloth over nothing' },
  gait: { period: 1.7, duty: 0.68, stride: 1.15, lift: 0.12, bob: 0.008, sway: 0.02, roll: 0.01, twist: 0.03, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.08, 0, 0], arm_r_sh: [0.08, 0, 0] } },
  idle: { breathe: 0.01, scan: 0.1, look: 0.4 },
  anim: {
    idle: function (P, t, w, st) {
      const mid = st.atk >= 0 && st.atkW > 0.98;
      if (!mid) P.sc.face_eye = 1e-4;
      /* the halo's eyes blink, each on its own time; all open through the attack's middle */
      for (let i = 0; st.by['eye_' + i]; i++) {
        const bl = Math.sin(t * (0.9 + 0.13 * i) + i * 2.1);
        P.sc['eye_' + i] = mid ? 1 : (bl > 0.93 ? 1e-4 : 1);
      }
      P.b.halo = [0.03 * Math.sin(t * 0.41) * w, 0.05 * Math.sin(t * 0.29 + 2) * w, 0];
      for (const s of ['l', 'r']) P.b['fin_' + s + '_0'] = [0.06 * Math.sin(t * 0.7 + (s === 'l' ? 0 : 1.3)) * w, 0, 0];
    }
  },
  attack: {
    kind: 'gaze', dur: 2.8,
    keys: [
      [0, { sc: { face_eye: 0.001 } }],
      [0.45, { b: { arm_l_sh: [-0.9, 0, 0.25], arm_r_sh: [-0.9, 0, -0.25], arm_l_el: [-0.4, 0, 0], arm_r_el: [-0.4, 0, 0], torso: [-0.06, 0, 0] }, sc: { face_eye: 0.001 } }, 's'],
      [0.72, { b: { arm_l_sh: [-1.3, 0, 0.35], arm_r_sh: [-1.3, 0, -0.35], arm_l_el: [-0.5, 0, 0], arm_r_el: [-0.5, 0, 0], torso: [-0.1, 0, 0], head: [-0.12, 0, 0] }, sc: { face_eye: 0.001 } }, 's'],
      [1.1, { b: { arm_l_sh: [-1.4, 0, 0.4], arm_r_sh: [-1.4, 0, -0.4], arm_l_el: [-0.5, 0, 0], arm_r_el: [-0.5, 0, 0], torso: [-0.1, 0, 0], head: [-0.12, 0, 0] }, sc: { face_eye: 0.3 } }, 's'],
      [1.45, { b: { arm_l_sh: [-1.4, 0, 0.4], arm_r_sh: [-1.4, 0, -0.4], arm_l_el: [-0.5, 0, 0], arm_r_el: [-0.5, 0, 0], torso: [-0.1, 0, 0], head: [-0.06, 0, 0] }, sc: { face_eye: 1 } }, 'o'],
      [1.55, { b: { arm_l_sh: [-1.4, 0, 0.4], arm_r_sh: [-1.4, 0, -0.4], arm_l_el: [-0.5, 0, 0], arm_r_el: [-0.5, 0, 0], torso: [0.02, 0, 0], head: [0.04, 0, 0] }, s: { body: [0, 0, -0.06] }, sc: { face_eye: 1 } }, 'i'],
      [2.1, { b: { arm_l_sh: [-0.8, 0, 0.2], arm_r_sh: [-0.8, 0, -0.2], arm_l_el: [-0.3, 0, 0], arm_r_el: [-0.3, 0, 0] }, sc: { face_eye: 0.6 } }, 's'],
      [2.8, { sc: { face_eye: 0.001 } }, 's']
    ],
    events: [
      { t: 0.74, type: 'call', kind: 'tell', at: 'face_pt', dir: [0, 0, 1] },
      { t: 1.5, type: 'fire', kind: 'gaze', at: 'face_pt', dir: [0, 0, 1], speed: 120 }
    ]
  },

  build: function (F, R) {
    const c = F.col, robe = c('robe'), rlt = c('robeLt'), hem = c('robeHem'), tar = c('tar'), chrome = c('chrome'), ckd = c('chromeDk');
    const nEyes = 7 + Math.floor(XPM.u(F, 1) * 7) % 7;                               /* 7 to 13 */
    /* ---- the hips, under the robe */
    R.bone('body', null, 0, 1.68, 0);
    R.on('body');
    F.sph(0, 0, 0, 0.3, 0.16, 0.22, tar, 'paint', 10, 6);
    /* the robe: a tall skirt from the waist to a hand off the ground, its hem uneven (the seed), a lighter facing */
    F.cy(0, -0.65, 0, 0.78, 0.34, 1.5, robe, 'cloth', 'y', 20, 0, 0, 0, true);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + XPM.u(F, 2, i) * 0.6, l = 0.25 + 0.3 * XPM.u(F, 3, i);
      F.cb(Math.sin(a) * 0.74, -1.4 + l / 2, Math.cos(a) * 0.74, 0.22, l, 0.03, hem, 'cloth', 0, a, 0);
    }
    /* ---- the torso: the hood, a tall taper to a peak; the chest a darker void where the robe opens */
    R.bone('torso', 'body', 0, 0.2, 0);
    R.on('torso');
    F.cy(0, 0.5, 0, 0.36, 0.42, 1.0, robe, 'cloth', 'y', 16);
    F.cy(0, 1.35, 0.0, 0.1, 0.38, 0.75, rlt, 'cloth', 'y', 16);
    F.cy(0, 1.78, 0.0, 0.015, 0.1, 0.12, rlt, 'cloth', 'y', 10);
    F.cb(0, 0.45, 0.33, 0.2, 0.9, 0.05, tar, 'paint');                              /* the robe's opening: black */
    /* ---- the head: a cowl round a void, the halo behind it */
    R.bone('head', 'torso', 0, 1.0, 0.08);
    R.on('head');
    F.sph(0, 0.1, -0.05, 0.3, 0.36, 0.28, robe, 'cloth', 14, 10, Math.PI * 0.75, Math.PI * 1.5);   /* the cowl, open at the front */
    F.sph(0, 0.1, 0.0, 0.22, 0.27, 0.2, c('void'), 'glow', 12, 8);                   /* the void where a face should be: black, unlit */
    R.bone('face_eye', 'head', 0, 0.12, 0.2);
    R.on('face_eye');
    XPM.eye(F, 0, 0, 0, 0.09, c('eyeGold'));
    R.point('face_pt', 'face_eye', 0, 0, 0.06);
    /* the halo: spins slowly, fast in the gaze */
    R.spin('halo', 'head', 0, 0.3, -0.36, 'z', { idle: 0.12, walk: 0.2, attack: 3.2 });
    XPM.haloOfEyes(F, R, 'halo', 0.62, nEyes, { tube: 0.03, eye: 0.075 });
    /* ---- the arms: long, thin, two joints, a hand of four fingers; the sleeves are the robe's */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r', sd = s > 0 ? 'l' : 'r';
      R.bone(A + '_sh', 'torso', s * 0.42, 0.78, 0.05, 0.15, 0, s * 0.12);
      R.on(A + '_sh');
      F.sph(0, 0, 0, 0.12, 0.1, 0.12, robe, 'cloth', 10, 6);
      F.cy(0, -0.38, 0, 0.1, 0.13, 0.74, robe, 'cloth', 'y', 12);
      R.bone(A + '_el', A + '_sh', 0, -0.76, 0, -0.25, 0, 0);
      R.on(A + '_el');
      F.cy(0, -0.34, 0, 0.07, 0.1, 0.7, robe, 'cloth', 'y', 12);
      F.cy(0, -0.5, 0, 0.14, 0.09, 0.3, rlt, 'cloth', 'y', 12);                     /* the sleeve's cuff */
      R.bone(A + '_wr', A + '_el', 0, -0.72, 0, 0.1, 0, 0);
      R.on(A + '_wr');
      F.sph(0, -0.03, 0, 0.05, 0.06, 0.04, c('boneDk'), 'paint', 8, 6);
      for (let k = 0; k < 4; k++) {
        const nm = 'fin_' + sd + '_' + k;
        R.bone(nm, A + '_wr', (k - 1.5) * 0.028 * s, -0.06, 0.01, 0.2 + 0.05 * k, 0, (k - 1.5) * 0.08 * s);
        R.on(nm);
        XPM.finger(F, 0.3 + 0.03 * (k === 1 || k === 2 ? 1 : 0), 0.011, c('boneDk'));
      }
    }
    /* ---- the legs: long, thin, under the robe; clawed feet that show below the hem */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.2, -0.05, 0], L1: 0.95, L2: 0.86, knee: 1, ankleH: 0.1, rest: [s * 0.22, 0.02], phase: s > 0 ? 0 : 0.5, toe: 0.2 });
      R.on(Lg + '_hip');
      F.cy(0, -0.47, 0, 0.055, 0.075, 0.92, tar, 'paint', 'y', 10);
      R.on(Lg + '_knee');
      F.sph(0, 0, 0, 0.07, 0.08, 0.07, ckd, 'metal', 8, 6);
      F.cy(0, -0.43, 0, 0.04, 0.055, 0.84, tar, 'paint', 'y', 10);
      R.on(Lg + '_ankle');
      F.sph(0, -0.02, 0, 0.055, 0.05, 0.06, ckd, 'metal', 8, 6);
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.45;
        F.rod(0, -0.04, 0, Math.sin(a) * 0.22, -0.09, Math.cos(a) * 0.22, 0.016, chrome, 'metal');
        F.cy(Math.sin(a) * 0.26, -0.095, Math.cos(a) * 0.26, 0.004, 0.016, 0.09, c('claw'), 'metal', 'y', 6, Math.PI / 2 - 0.3, a, 0);
      }
      F.rod(0, -0.04, 0, 0, -0.085, -0.14, 0.014, chrome, 'metal');
    }
  }
});
