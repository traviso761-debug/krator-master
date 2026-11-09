/* ======================================================================
   Ancient machine: the sweeper (kits/mechs/krator-mechs-ancient-sweeper.js)

   KEEPER. A low wide street drone on four short legs: a brush drum under its nose, a
   broom disc at each flank, a hopper on its back whose lid still flaps, a sensor bar
   of three lenses across the front. It trots its block, stops, spins its brushes up
   over a drift it will never shift, and goes on. The FEIGNER wears the same shell: its
   lamp goes red, its bar turns to you, and it rams with the drum spun up to a flail.
   ====================================================================== */
MECH({
  key: 'an_sweeper', name: 'Sweeper', culture: 'ancient',
  role: 'keeper: a street sweeper at its block', origin: 'Ancient street-cleaning drone',
  lore: 'A low wide drone that trots its block with a brush drum under its nose and a hopper on its back, stopping to sweep a drift it will never shift. Some of them are not sweepers.',
  feign: [1],
  tags: { class: 'mech', type: ['utility'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['blade'] }],
  variants: 2, variantNames: ['Sweeper', 'Feigner'],
  w: 2.6, d: 1.9, h: 1.4,
  data: { height: 1.3, mass: 0.9, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a brush drum, two broom discs and a hopper',
    engine: 'Ancient cell', armour: 'white render shell' },
  variantData: [{}, { weapon: 'the brush drum spun up, its wire flails as blades', reach: 1.2 }],
  gait: { period: 0.72, duty: 0.6, stride: 0.44, lift: 0.1, bob: 0.015, sway: 0.01, roll: 0.02, twist: 0.03, lean: 0.02,
    offsets: [0, 0.5, 0.5, 0] },
  idle: { breathe: 0.01, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell']);
      P.b.lid = [-0.04 - 0.04 * Math.sin(t * 1.7) * w, 0, 0];
    }
  },
  /* the routine: it stops, the bar dips to the ground, the brushes spin up, the lid flaps, dust */
  attack: {
    kind: 'sweep', dur: 2.6,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0.35, 0, 0], lid: [-0.9, 0, 0] }, s: { body: [0, -0.05, 0.04] } }, 's'],
      [1.0, { b: { head: [0.35, 0.25, 0], lid: [-1.1, 0, 0] }, s: { body: [0, -0.06, 0.1] } }, 's'],
      [1.6, { b: { head: [0.35, -0.25, 0], lid: [-0.9, 0, 0] }, s: { body: [0, -0.06, 0.16] } }, 's'],
      [2.1, { b: { head: [0.1, 0, 0], lid: [-0.3, 0, 0] }, s: { body: [0, -0.02, 0.1] } }, 's'],
      [2.6, {}, 's']
    ],
    events: [{ t: 0.9, type: 'impact', at: 'brush_pt', r: 1.0 }, { t: 1.7, type: 'impact', at: 'brush_pt', r: 1.0 }]
  },
  /* the feigner: the bar tracks, the lamp goes red, it rears and rams */
  variantAttack: [null, ANC.feign({
    kind: 'ram', dur: 2.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.45, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.2, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.05, { b: { body: [-0.18, 0, 0], head: [0.3, 0, 0], lid: [-0.5, 0, 0] }, s: { body: [0, 0.06, -0.14] } }, 's'],
      [1.28, { b: { body: [0.12, 0, 0], head: [0.1, 0, 0] }, s: { body: [0, -0.04, 0.55] } }, 'i'],
      [1.5, { b: { body: [0.06, 0, 0] }, s: { body: [0, -0.03, 0.5] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 1.29, type: 'impact', at: 'brush_pt', r: 0.9 }]
  }, 0.7)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), wh = c('white'), whd = c('whiteDk');

    /* ---- the hull: a rounded slab, a dark underframe, the hopper behind */
    R.bone('body', null, 0, 0.62, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.9, 0.44, 1.5, 0.12, ANC.wear(F, 0.25), 'paint', 'x');
    F.chb(0, -0.26, 0, 1.6, 0.12, 1.3, 0.04, frd, 'metal', 'x');
    F.chb(0, 0.37, -0.42, 1.5, 0.42, 0.62, 0.1, ANC.wearDk(F, 0.4), 'paint', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.78, 0.26, -0.42, 0.08, 0.3, 0.5, 0.02, fr, 'metal', 'x');
      ANC.streak(F, s * 0.5, 0.2, 0.76, 0.3, 0.05);
      F.cb(s * 0.98, -0.02, 0.1, 0.03, 0.3, 1.1, ANC.soot(F), 'paint');
    }
    ANC.plate(F, 0.3, 0.42, 0.76, 0.3, 0.14);
    for (let i = 0; i < 3; i++) F.cb(-0.55 + i * 0.18, 0.21, 0.35, 0.1, 0.03, 0.5, frd, 'metal');
    /* the lid: hinged at the hopper's back edge */
    R.bone('lid', 'body', 0, 0.6, -0.72);
    R.on('lid');
    F.chb(0, 0.02, 0.32, 1.42, 0.05, 0.62, 0.02, ANC.wear(F, 0.5), 'paint', 'x');
    F.cb(0, 0.055, 0.46, 0.5, 0.03, 0.08, fr, 'metal');

    /* ---- the sensor bar across the front: three lenses, the tell lamp on top */
    R.bone('head', 'body', 0, 0.05, 0.76);
    R.on('head');
    F.chb(0, 0, 0.06, 1.3, 0.16, 0.14, 0.03, fr, 'metal', 'x');
    ANC.lens(F, 0, 0, 0.135, 0, 0, 1, 0.045, 'amber', null);
    for (const s of [-1, 1]) ANC.lens(F, s * 0.42, 0, 0.135, s * 0.25, 0, 1, 0.03, 'cyan', null);
    for (const s of [-1, 1]) F.cb(s * 0.2, 0.0, 0.14, 0.12, 0.08, 0.012, c('glassDk'), 'metal');
    R.point('head_pt', 'head', 0, 0, 0.2);
    ANC.tell(F, R, 'head', 0, 0.095, 0.0, 0, 1, 0.1, 0.035);

    /* ---- the brush drum under the nose, two broom discs at the flanks */
    R.spin('brush', 'body', 0, -0.33, 0.5, 'x', { idle: 0.4, walk: 7, attack: 18 });
    R.on('brush');
    F.cy(0, 0, 0, 0.17, 0.17, 1.5, c('bristleDk'), 'cloth', 'x', 10);
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8;
      F.cb(0, Math.sin(a) * 0.2, Math.cos(a) * 0.2, 1.46, 0.055, 0.09, c('bristle'), 'cloth', a, 0, 0);
    }
    for (const s of [-1, 1]) F.cy(s * 0.74, 0, 0, 0.09, 0.09, 0.05, jt, 'metal', 'x', 12);
    R.point('brush_pt', 'brush', 0, -0.2, 0.2);
    R.on('body');
    for (const s of [-1, 1]) {
      F.cb(s * 0.88, -0.27, 0.5, 0.1, 0.12, 0.1, fr, 'metal');
      const D = s > 0 ? 'disc_l' : 'disc_r';
      R.spin(D, 'body', s * 0.98, -0.4, 0.42, 'y', { idle: s * 0.3, walk: s * 5, attack: s * 12 });
      R.on(D);
      F.cy(0, 0, 0, 0.26, 0.28, 0.05, frd, 'metal', 'y', 14);
      F.cy(0, -0.07, 0, 0.3, 0.26, 0.1, c('bristle'), 'cloth', 'y', 14);
      R.on('body');
    }
    for (const s of [-1, 1]) ANC.conduit(F, R, 'body', [s * 0.6, -0.1, 0.72], 'head', [s * 0.3, -0.07, -0.02], 0.02, 0.1, 4);

    /* ---- four short legs: the fore knees bend back, the hind forward; rubber pads */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.8, -0.12, sz * 0.5], L1: 0.36, L2: 0.36, knee: sz > 0 ? -1 : 1, ankleH: 0.07,
        rest: [sx * 0.95, sz * 0.6], toe: 0.05 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.07, 0.12, 'x', jt, null);
      F.chb(0, -0.18, 0, 0.1, 0.32, 0.12, 0.03, ANC.wear(F, 0.4), 'paint', 'y');
      R.on(n + '_knee');
      F.knob(0, 0, 0, 0.045, fr, 'metal');
      F.rod(0, 0, 0, 0, -0.35, 0, 0.03, ANC.soot(F), 'metal');
      R.on(n + '_ankle');
      F.cy(0, -0.04, 0.01, 0.045, 0.06, 0.06, c('rubber'), 'rubber', 'y', 8);
    }
  }
});
