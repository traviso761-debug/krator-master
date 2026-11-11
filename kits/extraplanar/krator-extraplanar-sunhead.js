/* ======================================================================
   Extraplanar hunter: the Sun-headed (kits/extraplanar/krator-extraplanar-sunhead.js)

   Nine metres: a bald, long-limbed giant, hunched, arms to the knees, tatters at the waist, and for a head a
   sun: a warm glowing sphere ringed with rays, pocked with dark craters (the reference: the giant bending over a
   shed, its head a pocked sun). At a distance it is a Giant or a giant mutant (the `giant` silhouette). Its attack:
   the sun flares, it bends, and sweeps an arm across the ground.
   ====================================================================== */
MECH({
  key: 'xp_sunhead', name: 'the Sun-headed', culture: 'extraplanar',
  role: 'hunter: the sweep', origin: 'through a portal',
  lore: 'A bald giant with a sun for a head, pocked like the moon, walking bent with its hands by its knees. The glare is the tell: it flares, and the arm comes round.',
  tags: { class: 'mech', type: ['hunter', 'heavy'], drive: 'biped', crew: 0, pilot: 'none', weapon: ['sun', 'fist'], setting: 'outdoor', guild: 'none' },
  silhouette: { set: 'giant', h: 9.6 },
  variants: 1, variantNames: ['Sun-headed'],
  w: 4.7, d: 4.0, h: 9.9,
  data: { height: 9.6, mass: 6.5, crew: 0, pilot: 'none', reach: 4.5, weapon: 'the arm: a sweep across the ground; the glare', engine: 'none known', armour: 'hide' },
  gait: { period: 2.5, duty: 0.64, stride: 1.8, lift: 0.42, bob: 0.09, sway: 0.13, roll: 0.03, twist: 0.05, lean: 0.04,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.22, 0, 0], arm_r_sh: [0.22, 0, 0] } },
  idle: { breathe: 0.04, scan: 0.1, look: 0.3 },
  anim: {
    idle: function (P, t, w, st) {
      if (!(st.atk >= 0 && st.atkW > 0.98)) P.sc.flare = 1e-4;
      P.b.head = [0.05 * Math.sin(t * 0.3) * w, 0, 0.04 * Math.sin(t * 0.21 + 1) * w];
      P.b.arm_l_el = [-0.08 * Math.sin(t * 0.5) * w, 0, 0]; P.b.arm_r_el = [-0.08 * Math.sin(t * 0.5 + 2) * w, 0, 0];
    }
  },
  attack: {
    kind: 'sweep', dur: 3.2,
    keys: [
      [0, { sc: { flare: 0.001 } }],
      [0.55, { b: { torso: [0.12, 0, 0], arm_r_sh: [0.5, 0, -0.5] }, sc: { flare: 0.001 } }, 's'],
      [0.68, { b: { torso: [0.12, 0, 0], arm_r_sh: [0.5, 0, -0.5] }, sc: { flare: 1 } }, 'l'],
      [1.1, { b: { torso: [0.55, 0.25, 0], arm_r_sh: [-0.9, 0, -0.9], arm_r_el: [-0.3, 0, 0], arm_l_sh: [0.3, 0, 0.3] }, s: { body: [0, -0.5, 0.3] }, sc: { flare: 1 } }, 's'],
      [1.6, { b: { torso: [0.6, -0.5, 0], arm_r_sh: [-1.05, 0, 0.9], arm_r_el: [-0.2, 0, 0], arm_l_sh: [0.5, 0, 0.3] }, s: { body: [0, -0.7, 0.35] }, sc: { flare: 1 } }, 'i'],
      [2.0, { b: { torso: [0.5, -0.7, 0], arm_r_sh: [-0.9, 0, 1.3], arm_r_el: [-0.1, 0, 0], arm_l_sh: [0.4, 0, 0.3] }, s: { body: [0, -0.6, 0.3] }, sc: { flare: 0.6 } }, 'o'],
      [2.7, { b: { torso: [0.1, -0.1, 0], arm_r_sh: [-0.2, 0, 0.3] }, s: { body: [0, -0.1, 0.05] }, sc: { flare: 0.001 } }, 's'],
      [3.2, { sc: { flare: 0.001 } }, 's']
    ],
    events: [
      { t: 0.7, type: 'call', kind: 'tell', at: 'sun_pt', dir: [0, 0, 1] },
      { t: 1.62, type: 'impact', at: 'hand_r_pt', r: 3 }
    ]
  },

  build: function (F, R) {
    const c = F.col, tone = XPM.u(F, 1);
    const skin = F.shade(c('skin'), (tone - 0.5) * 0.25), sdk = F.shade(c('skinDk'), (tone - 0.5) * 0.25), slt = F.shade(c('skinLt'), (tone - 0.5) * 0.2);
    /* ---- the pelvis, the tatters hanging from it */
    R.bone('body', null, 0, 4.95, 0);
    R.on('body');
    F.sph(0, 0.05, 0, 0.95, 0.6, 0.72, skin, 'skin', 16, 10);
    const nT = 6 + Math.floor(XPM.u(F, 2) * 5) % 5;
    for (let i = 0; i < nT; i++) {
      const a = i / nT * Math.PI * 2 + XPM.u(F, 3, i) * 0.5, l = 1.0 + 1.4 * XPM.u(F, 4, i), T = 'tat_' + i;
      R.dangle(T, 'body', Math.sin(a) * 0.92, -0.15, Math.cos(a) * 0.7, { mode: 'hang', len: l, k: 10, c: 2.2, wind: 0.05, max: 0.7 });
      R.on(T);
      F.cb(0, -l / 2, 0, 0.3 - 0.1 * XPM.u(F, 5, i), l, 0.03, i % 2 ? c('boneDk') : c('robeHem'), 'cloth', 0, a, 0);
    }
    /* ---- the trunk: a long chest tapering up from the belly, hunched forward; shoulders wide */
    R.bone('torso', 'body', 0, 0.35, 0.05, 0.3, 0, 0);
    R.on('torso');
    F.cy(0, 1.1, 0, 0.95, 1.05, 2.3, skin, 'skin', 'y', 18);
    F.sph(0, 2.25, 0, 1.25, 0.55, 0.85, skin, 'skin', 16, 8);
    F.sph(0, 0.3, 0.15, 0.95, 0.75, 0.8, slt, 'skin', 16, 8);                        /* the belly */
    for (let i = 0; i < 5; i++) F.tor(0, 0.9 + i * 0.28, 0.12, 0.86 - i * 0.03, 0.035, sdk, 'skin', 'y', 20, Math.PI * 0.8, 0, -Math.PI * 0.4, 0);   /* ribs showing */
    F.cy(0, 2.65, 0.1, 0.32, 0.38, 0.5, sdk, 'skin', 'y', 12);                         /* the neck */
    /* ---- the head: the sun. A glowing sphere, pocked; rays round it; the flare that comes with the tell */
    R.bone('head', 'torso', 0, 2.6, 0.25, -0.2, 0, 0);
    R.on('head');
    F.sph(0, 0.6, 0, 0.8, 0.8, 0.8, c('sun'), 'glow', 20, 14);
    F.sph(0, 0.6, 0.25, 0.55, 0.55, 0.58, c('sunHot'), 'glow', 14, 10);
    XPM.pocks(F, 0, 0.6, 0, 0.8, 7 + Math.floor(XPM.u(F, 6) * 6) % 6, 7, c('crater'));
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2, L = 0.35 + 0.25 * XPM.u(F, 8, i);
      F.taper(Math.cos(a) * 0.78, 0.6 + Math.sin(a) * 0.78, 0, Math.cos(a), Math.sin(a), 0, 0.06, 0.005, L, c('sunDk'), 'glow', 5);
    }
    R.point('sun_pt', 'head', 0, 0.6, 0.85);
    R.bone('flare', 'head', 0, 0.6, 0);
    R.on('flare');
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2 + 0.3;
      F.taper(Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0, Math.cos(a), Math.sin(a), 0, 0.09, 0.005, 1.0, c('sunHot'), 'glow', 5);
    }
    F.sph(0, 0, 0, 0.9, 0.9, 0.9, c('sunHot'), 'glow', 14, 10);
    /* ---- the arms: long, to the knees, hanging with a little bend; hands of four long fingers */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r', sd = s > 0 ? 'l' : 'r';
      R.bone(A + '_sh', 'torso', s * 1.2, 2.2, 0.05, 0.1, 0, s * 0.18);
      R.on(A + '_sh');
      F.sph(0, 0, 0, 0.42, 0.4, 0.42, skin, 'skin', 12, 8);
      F.cy(0, -1.0, 0, 0.26, 0.34, 1.95, skin, 'skin', 'y', 12);
      R.bone(A + '_el', A + '_sh', 0, -1.95, 0, -0.3, 0, 0);
      R.on(A + '_el');
      F.sph(0, 0, 0, 0.28, 0.3, 0.28, sdk, 'skin', 10, 7);
      F.cy(0, -0.95, 0, 0.19, 0.26, 1.85, skin, 'skin', 'y', 12);
      R.bone(A + '_wr', A + '_el', 0, -1.9, 0, 0.15, 0, 0);
      R.on(A + '_wr');
      F.sph(0, -0.1, 0, 0.2, 0.24, 0.13, slt, 'skin', 10, 7);
      R.point('hand_' + sd + '_pt', A + '_wr', 0, -0.55, 0.15);
      for (let k = 0; k < 4; k++) {
        const nm = 'fin_' + sd + '_' + k;
        R.bone(nm, A + '_wr', (k - 1.5) * 0.09 * s, -0.25, 0.04, 0.25, 0, (k - 1.5) * 0.1 * s);
        R.on(nm);
        XPM.finger(F, 0.55 + 0.06 * (k === 1 || k === 2 ? 1 : 0), 0.045, skin, c('boneDk'));
      }
    }
    /* ---- the legs: long, a knee forward, a flat long foot */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.55, -0.25, 0], L1: 2.4, L2: 2.3, knee: 1, ankleH: 0.3, rest: [s * 0.62, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.22 });
      R.on(Lg + '_hip');
      F.sph(0, 0, 0, 0.4, 0.36, 0.4, skin, 'skin', 12, 8);
      F.cy(0, -1.2, 0, 0.27, 0.36, 2.35, skin, 'skin', 'y', 12);
      R.on(Lg + '_knee');
      F.sph(0, 0, 0.05, 0.3, 0.32, 0.3, sdk, 'skin', 10, 7);
      F.cy(0, -1.15, 0, 0.2, 0.26, 2.25, skin, 'skin', 'y', 12);
      R.on(Lg + '_ankle');
      F.sph(0, -0.05, 0, 0.22, 0.18, 0.22, sdk, 'skin', 10, 6);
      F.chb(0, -0.2, 0.25, 0.44, 0.2, 0.95, 0.06, slt, 'skin', 'z');
      for (let k = 0; k < 4; k++) F.sph((k - 1.5) * 0.11, -0.22, 0.75, 0.06, 0.07, 0.11, sdk, 'skin', 6, 5);
    }
  }
});
