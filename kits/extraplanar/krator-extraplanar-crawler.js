/* ======================================================================
   Extraplanar hunter: the Crawler (kits/extraplanar/krator-extraplanar-crawler.js)

   Two and a half metres at the shoulder, five long: a sleek dark thing crouched on four long limbs in the fauna
   kit's `centaur` stance (the front pair arms, the hind pair legs, all four down as at a run), a blank lozenge
   for a head, two short clawed hands folded under the chest, and a ring floating over its back (the reference:
   a chrome thing on four long limbs with a ring over it). At a distance it is a mutant on grafted legs or a robot
   quadruped (the `crawler` silhouette). Its attack: the ring brightens, the body drops, and the hands rake out one
   after the other.
   ====================================================================== */
MECH({
  key: 'xp_crawler', name: 'the Crawler', culture: 'extraplanar',
  role: 'hunter: the rake', origin: 'through a portal',
  lore: 'A dark sleek body slung between four long limbs, no face, a ring hanging in the air over its back. It moves like something that learned to walk from watching, and the hands under its chest are for something else.',
  tags: { class: 'mech', type: ['hunter', 'scout'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: ['rake', 'claw'], setting: 'outdoor', guild: 'none' },
  silhouette: { set: 'crawler', h: 2.9 },
  variants: 1, variantNames: ['Crawler'],
  w: 1.8, d: 4.1, h: 3.0,
  data: { height: 2.6, mass: 0.7, crew: 0, pilot: 'none', reach: 1.6, weapon: 'two clawed hands under the chest: the rake', engine: 'none known', armour: 'a chrome hide' },
  gait: { period: 1.05, duty: 0.62, stride: 1.0, lift: 0.22, bob: 0.025, sway: 0.02, roll: 0.03, twist: 0.05, lean: 0.0,
    offsets: [0, 0.5, 0.5, 0] },
  idle: { breathe: 0.015, scan: 0.06, look: 0.5 },
  anim: {
    idle: function (P, t, w, st) {
      if (!(st.atk >= 0 && st.atkW > 0.98)) P.sc.ring_glow = 1e-4;
      P.s.ring = [0, 0.07 * Math.sin(t * 0.8) * w, 0.03 * Math.sin(t * 0.5 + 1) * w];
      P.b.hand_l = [0.1 * Math.sin(t * 1.1) * w, 0, 0]; P.b.hand_r = [0.1 * Math.sin(t * 1.1 + 1.7) * w, 0, 0];
    }
  },
  attack: {
    kind: 'rake', dur: 2.4,
    keys: [
      [0, { sc: { ring_glow: 0.001 } }],
      [0.4, { b: { head: [0.25, 0, 0] }, s: { body: [0, -0.15, 0.05] }, sc: { ring_glow: 0.001 } }, 's'],
      [0.52, { b: { head: [0.25, 0, 0] }, s: { body: [0, -0.15, 0.05] }, sc: { ring_glow: 1 } }, 'l'],
      [0.85, { b: { head: [0.3, 0, 0], hand_l: [0.3, 0, 0], hand_r: [0, 0, 0] }, s: { body: [0, -0.35, 0.15] }, sc: { ring_glow: 1 } }, 's'],
      [1.1, { b: { head: [0.3, 0.2, 0], hand_l: [-2.2, 0, 0.1], hand_r: [0, 0, 0] }, s: { body: [0, -0.4, 0.22] }, sc: { ring_glow: 1 } }, 'i'],
      [1.3, { b: { head: [0.3, -0.1, 0], hand_l: [-1.6, 0, 0.1], hand_r: [0.3, 0, 0] }, s: { body: [0, -0.4, 0.2] }, sc: { ring_glow: 1 } }, 's'],
      [1.5, { b: { head: [0.3, -0.2, 0], hand_l: [-1.0, 0, 0.1], hand_r: [-2.2, 0, -0.1] }, s: { body: [0, -0.4, 0.22] }, sc: { ring_glow: 1 } }, 'i'],
      [1.9, { b: { head: [0.1, 0, 0], hand_l: [-0.2, 0, 0], hand_r: [-0.9, 0, 0] }, s: { body: [0, -0.2, 0.1] }, sc: { ring_glow: 0.5 } }, 's'],
      [2.4, { sc: { ring_glow: 0.001 } }, 's']
    ],
    events: [
      { t: 0.54, type: 'call', kind: 'tell', at: 'ring_pt', dir: [0, 1, 0] },
      { t: 1.12, type: 'impact', at: 'claw_l_pt', r: 0.9 },
      { t: 1.52, type: 'impact', at: 'claw_r_pt', r: 0.9 }
    ]
  },

  build: function (F, R) {
    const c = F.col, hide = c('chrome'), hlt = c('chromeLt'), hdk = c('chromeDk'), tar = c('tar');
    /* ---- the body: a lozenge slung low; a ridge of plates down the spine, some gone (the seed) */
    R.bone('body', null, 0, 1.75, 0);
    R.on('body');
    F.sph(0, 0, 0, 0.42, 0.36, 1.15, hide, 'paint', 18, 10);
    F.sph(0, -0.1, -0.2, 0.36, 0.3, 0.9, hdk, 'paint', 14, 8);
    for (let i = 0; i < 7; i++) {
      if (XPM.u(F, 1, i) < 0.22) continue;
      F.chb(0, 0.3 - Math.abs(i - 3) * 0.02, -0.9 + i * 0.3, 0.2, 0.08, 0.26, 0.03, hlt, 'paint', 'z');
    }
    /* ---- the head: a blank lozenge on a short neck; no face, a seam of glow where one would be */
    R.bone('head', 'body', 0, 0.2, 1.1, -0.15, 0, 0);
    R.on('head');
    F.cy(0, 0.02, 0.1, 0.14, 0.17, 0.26, hdk, 'metal', 'z', 10);
    F.sph(0, 0.05, 0.5, 0.2, 0.17, 0.42, hide, 'paint', 14, 10);
    F.tor(0, 0.05, 0.55, 0.14, 0.008, c('seam'), 'glow', 'z', 16, Math.PI * 1.2, 0, 0, Math.PI * 0.9);
    /* ---- the ring over the back: a chrome torus tilted a little, and a glow ring inside it that comes with the tell */
    R.bone('ring', 'body', 0, 1.0, -0.15, 0.3, 0, 0);
    R.on('ring');
    F.tor(0, 0, 0, 0.5, 0.04, hlt, 'metal', 'y', 32);
    R.point('ring_pt', 'ring', 0, 0, 0);
    R.bone('ring_glow', 'ring', 0, 0, 0);
    R.on('ring_glow');
    F.tor(0, 0, 0, 0.44, 0.012, c('ringGlow'), 'glow', 'y', 32);
    F.tor(0, 0, 0, 0.5, 0.06, c('ringGlow'), 'glow', 'y', 32);
    /* ---- the hands: short arms under the chest, folded back; three claws each */
    for (const s of [-1, 1]) {
      const H = s > 0 ? 'hand_l' : 'hand_r', sd = s > 0 ? 'l' : 'r';
      R.bone(H, 'body', s * 0.26, -0.3, 0.6, 1.25, 0, s * 0.15);
      R.on(H);
      F.sph(0, 0, 0, 0.09, 0.08, 0.09, hdk, 'metal', 8, 6);
      F.cy(0, -0.25, 0, 0.05, 0.07, 0.48, hide, 'paint', 'y', 8);
      for (let k = 0; k < 3; k++) {
        const nm = 'claw_' + sd + '_' + k;
        R.bone(nm, H, (k - 1) * 0.05 * s, -0.5, 0, 0.25, 0, (k - 1) * 0.25 * s);
        R.on(nm);
        XPM.finger(F, 0.32, 0.016, hdk);
      }
      R.point('claw_' + sd + '_pt', H, 0, -0.85, 0.15);
    }
    /* ---- the limbs: the fore pair arms (the elbow back), the hind pair legs (the knee forward), all four down */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2], fore = sz > 0;
      R.leg(n, { parent: 'body', hip: [sx * 0.42, fore ? 0.05 : -0.08, sz * 0.9], L1: 1.15, L2: 1.15, knee: fore ? -1 : 1, ankleH: 0.12,
        rest: [sx * 0.62, sz * 1.1 + (fore ? 0.1 : 0)], toe: fore ? 0.05 : 0.15 });
      R.on(n + '_hip');
      F.sph(0, 0, 0, 0.14, 0.13, 0.14, hdk, 'metal', 10, 6);
      F.cy(0, -0.57, 0, 0.065, 0.1, 1.13, hide, 'paint', 'y', 10);
      R.on(n + '_knee');
      F.sph(0, 0, 0, 0.09, 0.1, 0.09, hdk, 'metal', 8, 6);
      F.cy(0, -0.57, 0, 0.045, 0.065, 1.11, hide, 'paint', 'y', 10);
      R.on(n + '_ankle');
      F.sph(0, -0.02, 0, 0.06, 0.05, 0.07, hdk, 'metal', 8, 6);
      if (fore) {
        /* a hand for a foot: four long fingers splayed forward */
        for (let k = 0; k < 4; k++) { const a = (k - 1.5) * 0.4; F.rod(0, -0.05, 0, Math.sin(a) * 0.3, -0.11, Math.cos(a) * 0.3, 0.018, hide, 'paint'); }
        F.rod(0, -0.05, 0, 0, -0.1, -0.16, 0.016, hide, 'paint');
      } else {
        F.chb(0, -0.08, 0.1, 0.14, 0.07, 0.4, 0.02, hide, 'paint', 'z');
        for (let k = 0; k < 3; k++) F.rod((k - 1) * 0.05, -0.1, 0.28, (k - 1) * 0.07, -0.115, 0.42, 0.014, tar, 'metal');
      }
    }
  }
});
