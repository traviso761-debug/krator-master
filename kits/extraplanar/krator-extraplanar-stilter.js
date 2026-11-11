/* ======================================================================
   Extraplanar hunter: the Stilter (kits/extraplanar/krator-extraplanar-stilter.js)

   Eleven metres: a small ribbed thorax high on three stilt legs, no head but a crescent blade curving up from
   the nape, one dark lens in the ribs, red veins hanging from the hips (the reference: a bone-grey walker on three
   stilts under an eclipsed sun; a red-veined pylon). At a distance it is the robots' tripod (PLAN.md section 1:
   the `tripod` silhouette). The difference comes late: the lens lights, the thorax dips, and a jointed sting
   folded under the ribs unfolds and stabs the ground.
   ====================================================================== */
MECH({
  key: 'xp_stilter', name: 'the Stilter', culture: 'extraplanar',
  role: 'hunter: a sting under the ribs', origin: 'through a portal',
  lore: 'A ribbed thorax eleven metres up on three stilts, a crescent for a head and red veins trailing from its hips. It stands still for hours; then the lens lights, it stoops, and the sting comes down.',
  tags: { class: 'mech', type: ['hunter'], drive: 'tripod', crew: 0, pilot: 'none', weapon: ['sting'], setting: 'outdoor', guild: 'none' },
  silhouette: { set: 'tripod', h: 11.5 },
  variants: 1, variantNames: ['Stilter'],
  w: 7.2, d: 8.0, h: 11.9,
  data: { height: 11.5, mass: 1.6, crew: 0, pilot: 'none', reach: 6, weapon: 'a jointed sting, 5.4 m, under the thorax', engine: 'none known', armour: 'bone' },
  gait: { period: 2.7, duty: 0.7, stride: 2.1, lift: 0.55, bob: 0.06, sway: 0.05, roll: 0.012, twist: 0.02, lean: 0.02,
    offsets: [0, 1 / 3, 2 / 3] },
  idle: { breathe: 0.03, scan: 0.08, look: 0 },
  anim: {
    idle: function (P, t, w, st) {
      /* the lens is dark until the tell: scaled to nothing outside the clip's middle */
      if (!(st.atk >= 0 && st.atkW > 0.98)) P.sc.lens = 1e-4;
      P.b.crescent = [0.04 * Math.sin(t * 0.37) * w, 0, 0.03 * Math.sin(t * 0.23 + 1) * w];
    }
  },
  attack: {
    kind: 'sting', dur: 3.0,
    keys: [
      [0, { sc: { lens: 0.001 } }],
      [0.5, { b: { torso: [0.1, 0, 0] }, s: { body: [0, -0.2, 0] }, sc: { lens: 0.001 } }, 's'],
      [0.62, { b: { torso: [0.1, 0, 0] }, s: { body: [0, -0.2, 0] }, sc: { lens: 1 } }, 'l'],
      [1.1, { b: { torso: [0.35, 0, 0], sting_a: [-1.5, 0, 0], sting_b: [1.6, 0, 0] }, s: { body: [0, -1.0, 0.2] }, sc: { lens: 1 } }, 's'],
      [1.6, { b: { torso: [0.45, 0, 0], sting_a: [-2.3, 0, 0], sting_b: [2.6, 0, 0] }, s: { body: [0, -1.9, 0.3] }, sc: { lens: 1 } }, 'i'],
      [2.0, { b: { torso: [0.4, 0, 0], sting_a: [-2.2, 0, 0], sting_b: [2.5, 0, 0] }, s: { body: [0, -1.6, 0.25] }, sc: { lens: 1 } }, 's'],
      [2.7, { b: { torso: [0.05, 0, 0], sting_a: [-0.2, 0, 0], sting_b: [0.3, 0, 0] }, s: { body: [0, -0.1, 0] }, sc: { lens: 0.001 } }, 's'],
      [3.0, { sc: { lens: 0.001 } }, 's']
    ],
    events: [
      { t: 0.64, type: 'call', kind: 'tell', at: 'lens_pt', dir: [0, 0, 1] },
      { t: 1.62, type: 'impact', at: 'sting_pt', r: 1.2 }
    ]
  },

  build: function (F, R) {
    const c = F.col, bone = c('bone'), bdk = c('boneDk'), blt = c('boneLt'), tar = c('tar'), vein = c('vein');
    /* ---- the pelvis: a bone ring the three legs hang from */
    R.bone('body', null, 0, 8.0, 0);
    R.on('body');
    F.tor(0, -0.25, 0, 0.62, 0.11, bdk, 'paint', 'y', 18);
    F.sph(0, -0.2, 0, 0.5, 0.3, 0.5, tar, 'paint', 14, 8);
    /* ---- the thorax: a ribcage of bone round a dark core, hunched forward */
    R.bone('torso', 'body', 0, 0.1, 0.1, 0.32, 0, 0);
    R.on('torso');
    F.sph(0, 0.95, 0.05, 0.5, 1.0, 0.44, tar, 'paint', 16, 12);
    XPM.ribs(F, 0, 0.15, 1.85, 0.5, 0.44, 7, 11);
    F.sph(0, 1.95, -0.1, 0.42, 0.3, 0.4, bone, 'paint', 14, 8);                    /* the nape, a knuckle of bone */
    for (const s of [-1, 1]) F.sph(s * 0.55, 1.75, -0.05, 0.22, 0.14, 0.26, bdk, 'paint', 10, 6);   /* shoulders that carry nothing */
    /* the lens: dark red, in the ribs, where a face is not; hidden until the tell */
    R.bone('lens', 'torso', 0, 1.15, 0.47);
    R.on('lens');
    F.cy(0, 0, 0, 0.16, 0.16, 0.05, c('eyeRed'), 'glow', 'z', 16);
    F.cy(0, 0, 0.03, 0.06, 0.06, 0.03, c('pupil'), 'glow', 'z', 10);
    R.point('lens_pt', 'lens', 0, 0, 0.05);
    R.on('torso');
    F.tor(0, 1.15, 0.44, 0.19, 0.03, bdk, 'paint', 'z', 16);                       /* the socket's rim stays */
    /* ---- the crescent: a thin blade of bone from the nape, curving up and back; it sways */
    R.bone('crescent', 'torso', 0, 2.1, -0.15, -0.25, 0, 0);
    R.on('crescent');
    /* an arc of 2.0 rad in the y-z plane from the root up and back over the body (a torus about x, turned rx so its arc starts at the root) */
    F.tor(0, 0.45, -1.0, 1.1, 0.09, bone, 'paint', 'x', 28, 2.0, 1.37, 0, 0);
    F.tor(0, 0.45, -1.0, 1.1, 0.09, blt, 'paint', 'x', 28, 0.5, 2.9, 0, 0);
    F.cy(0, 0.1, 0, 0.14, 0.1, 0.3, bdk, 'paint', 'y', 10);
    /* ---- the sting: two bone segments folded up under the thorax; the clip unfolds them downward */
    R.bone('sting_a', 'body', 0, -0.45, 0.35, 2.0, 0, 0);
    R.on('sting_a');
    F.cy(0, -1.3, 0, 0.1, 0.16, 2.6, bdk, 'paint', 'y', 10);
    for (let i = 0; i < 4; i++) F.tor(0, -0.5 - i * 0.55, 0, 0.17 - i * 0.012, 0.025, bone, 'paint', 'y', 12);
    MP.joint(F, 0, -2.6, 0, 0.14, 0.22, 'x', tar, null);
    R.bone('sting_b', 'sting_a', 0, -2.6, 0, -2.6, 0, 0);
    R.on('sting_b');
    F.cy(0, -1.25, 0, 0.05, 0.11, 2.5, bone, 'paint', 'y', 10);
    F.cy(0, -2.65, 0, 0.004, 0.05, 0.4, c('claw'), 'metal', 'y', 8);
    R.point('sting_pt', 'sting_b', 0, -2.85, 0);
    /* ---- three stilts: a thin bone shaft, a knuckle at the knee, a hoof of a foot; splayed, so each swings toward its own foot */
    const legs = [['leg_f', 0.0, 0.55, 0.3, 3.3], ['leg_l', 0.5, -0.32, 2.95, -1.85], ['leg_r', -0.5, -0.32, -2.95, -1.85]];
    legs.forEach(function (L, i) {
      const n = L[0];
      R.leg(n, { parent: 'body', hip: [L[1], -0.3, L[2]], L1: 4.4, L2: 4.4, knee: 1, splay: true, ankleH: 0.25, rest: [L[3], L[4]], phase: i / 3, toe: 0, footYaw: 0.8 });
      R.on(n + '_yaw');
      F.sph(0, 0, 0, 0.24, 0.2, 0.24, bdk, 'paint', 10, 6);
      R.on(n + '_hip');
      F.cy(0, -2.2, 0, 0.1, 0.17, 4.3, bone, 'paint', 'y', 10);
      for (let k = 0; k < 3; k++) F.tor(0, -0.9 - k * 1.2, 0, 0.19 - k * 0.02, 0.03, bdk, 'paint', 'y', 10);
      R.on(n + '_knee');
      F.sph(0, 0, 0, 0.21, 0.26, 0.21, blt, 'paint', 10, 7);
      F.cy(0, -2.2, 0, 0.07, 0.12, 4.3, bone, 'paint', 'y', 10);
      R.on(n + '_ankle');
      F.cy(0, -0.1, 0, 0.12, 0.09, 0.3, bdk, 'paint', 'y', 8);
      F.cy(0, -0.25, 0, 0.05, 0.14, 0.02, tar, 'metal', 'y', 8);
      /* a vein hangs from each hip: a red thread that glows, swinging */
      const V = 'vein_' + i;
      R.dangle(V, 'body', L[1] * 1.1, -0.35, L[2] * 1.1, { mode: 'hang', len: 2.6, k: 9, c: 1.8, wind: 0.06, max: 0.8 });
      R.on(V);
      F.rod(0, 0, 0, 0.1, -1.4, 0.05, 0.02, vein, 'glow');
      F.rod(0.1, -1.4, 0.05, -0.05, -2.6, 0.1, 0.014, vein, 'glow');
      if (XPM.u(F, 21, i) > 0.4) F.rod(0.1, -1.4, 0.05, 0.4, -2.1, -0.1, 0.012, vein, 'glow');
    });
  }
});
