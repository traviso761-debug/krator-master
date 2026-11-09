/* ======================================================================
   Ancient machine: the sweeper (kits/mechs/krator-mechs-ancient-sweeper.js)

   KEEPER. A low street-cleaning drone (the owner's reference, 2026-11-09: the street
   cleaner with its brush discs on arms, a beacon and an aerial): a boxy hull in faded
   work yellow with hazard stripes down its flanks, two headlamps and a sensor bar at
   the nose, a hatch on its back, three brush discs held out on jointed arms (two ahead,
   one at the right flank), on four stubby legs. It trots its block, stops, swings the
   discs out and spins them up over a drift it will never shift, and goes on. The
   FEIGNER wears the same shell: its lamp goes red, its bar turns to you, and it rams
   with the discs spun up to flails.
   ====================================================================== */
MECH({
  key: 'an_sweeper', name: 'Sweeper', culture: 'ancient',
  role: 'keeper: a street sweeper at its block', origin: 'Ancient street-cleaning drone',
  lore: 'A low yellow drone that trots its block with three brush discs held out on arms and a beacon on its back, stopping to sweep a drift it will never shift. Some of them are not sweepers.',
  feign: [1],
  tags: { class: 'mech', type: ['utility'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['blade'] }],
  variants: 2, variantNames: ['Sweeper', 'Feigner'],
  w: 3.2, d: 3.1, h: 1.9,
  data: { height: 1.2, mass: 0.9, crew: 0, pilot: 'none', reach: 0, weapon: 'none: three brush discs on arms, a hopper',
    engine: 'Ancient cell', armour: 'work-yellow render shell' },
  variantData: [{}, { weapon: 'the brush discs spun up, their wire flails as blades', reach: 1.5 }],
  gait: { period: 0.7, duty: 0.6, stride: 0.36, lift: 0.08, bob: 0.012, sway: 0.01, roll: 0.02, twist: 0.03, lean: 0.02,
    offsets: [0, 0.5, 0.5, 0] },
  idle: { breathe: 0.01, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell']);
      P.b.lid = [-0.03 - 0.03 * Math.sin(t * 1.7) * w, 0, 0];
      P.b.arm_fl = [0, 0.05 * Math.sin(t * 0.6) * w, 0]; P.b.arm_fr = [0, -0.05 * Math.sin(t * 0.6 + 1) * w, 0];
    }
  },
  /* the routine: it stops, the arms swing the discs out, the bar dips, the discs spin up, the hatch flaps, dust */
  attack: {
    kind: 'sweep', dur: 2.8,
    keys: [
      [0, {}],
      [0.5, { b: { head: [0.35, 0, 0], lid: [-0.8, 0, 0], arm_fl: [0, 0.45, 0], arm_fr: [0, -0.45, 0], arm_r: [0, -0.3, 0] }, s: { body: [0, -0.04, 0.03] } }, 's'],
      [1.1, { b: { head: [0.35, 0.25, 0], lid: [-1.0, 0, 0], arm_fl: [0, 0.6, 0], arm_fr: [0, -0.2, 0], arm_r: [0, -0.4, 0] }, s: { body: [0, -0.05, 0.08] } }, 's'],
      [1.7, { b: { head: [0.35, -0.25, 0], lid: [-0.8, 0, 0], arm_fl: [0, 0.2, 0], arm_fr: [0, -0.6, 0], arm_r: [0, -0.3, 0] }, s: { body: [0, -0.05, 0.14] } }, 's'],
      [2.3, { b: { head: [0.1, 0, 0], lid: [-0.3, 0, 0], arm_fl: [0, 0.1, 0], arm_fr: [0, -0.1, 0] }, s: { body: [0, -0.02, 0.08] } }, 's'],
      [2.8, {}, 's']
    ],
    events: [{ t: 1.0, type: 'impact', at: 'brush_pt', r: 1.2 }, { t: 1.8, type: 'impact', at: 'brush_pt', r: 1.2 }]
  },
  /* the feigner: the bar tracks, the lamp goes red, the discs come in ahead of it, it rears and rams */
  variantAttack: [null, ANC.feign({
    kind: 'ram', dur: 2.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.45, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.2, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.05, { b: { body: [-0.15, 0, 0], head: [0.3, 0, 0], arm_fl: [0, -0.4, 0], arm_fr: [0, 0.4, 0], arm_r: [0, 0.9, 0] }, s: { body: [0, 0.05, -0.14] } }, 's'],
      [1.28, { b: { body: [0.1, 0, 0], head: [0.1, 0, 0], arm_fl: [0, -0.4, 0], arm_fr: [0, 0.4, 0], arm_r: [0, 0.9, 0] }, s: { body: [0, -0.03, 0.55] } }, 'i'],
      [1.5, { b: { body: [0.05, 0, 0], arm_fl: [0, -0.3, 0], arm_fr: [0, 0.3, 0], arm_r: [0, 0.7, 0] }, s: { body: [0, -0.03, 0.5] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 1.29, type: 'impact', at: 'brush_pt', r: 1.0 }]
  }, 0.7)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the hull: a yellow box, a stepped deck, hazard stripes down the flanks, a nose, a beacon and an aerial */
    R.bone('body', null, 0, 0.62, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.5, 0.5, 1.7, 0.1, ANC.work(F, 0.25), 'paint', 'x');
    F.chb(0, 0.3, -0.22, 1.2, 0.2, 1.0, 0.06, ANC.work(F, 0.4), 'paint', 'x');
    F.chb(0, -0.28, 0, 1.3, 0.1, 1.5, 0.03, frd, 'metal', 'x');
    F.chb(0, -0.1, 0.95, 1.3, 0.3, 0.25, 0.08, ANC.work(F, 0.4), 'paint', 'x');
    for (const s of [-1, 1]) {
      ANC.hazard(F, s * 0.756, 0.0, 0.15, 0.9, 0.16, 'yb', 0, s * Math.PI / 2, 0);
      ANC.lens(F, s * 0.5, 0.14, 0.9, 0, 0, 1, 0.045, 'white', frd);
      F.cb(s * 0.45, -0.12, 1.08, 0.3, 0.08, 0.03, frd, 'metal');
    }
    for (let i = 0; i < 4; i++) F.cb(0.3, 0.2 - i * 0.07, 0.86, 0.25, 0.025, 0.02, frd, 'metal');
    ANC.plate(F, -0.2, 0.06, 0.856, 0.22, 0.1);
    ANC.streak(F, 0.1, 0.3, -0.856, 0.3, 0.06, Math.PI);
    ANC.beacon(F, 0.35, 0.4, -0.1, 0.06);
    ANC.aerial(F, R, 'ant', 'body', -0.5, 0.4, -0.6, 0.8, -0.2);
    F.cy(-0.42, 0.45, -0.3, 0.05, 0.04, 0.12, ANC.soot(F), 'metal', 'y', 8);
    /* the hatch: hinged at the back of the deck */
    R.bone('lid', 'body', 0, 0.41, -0.72);
    R.on('lid');
    F.chb(0, 0.02, 0.27, 1.0, 0.05, 0.52, 0.02, ANC.work(F, 0.5), 'paint', 'x');
    F.cb(0, 0.055, 0.4, 0.4, 0.03, 0.08, fr, 'metal');

    /* ---- the sensor bar at the nose: three lenses, the tell lamp on top */
    R.bone('head', 'body', 0, 0.1, 1.08);
    R.on('head');
    F.chb(0, 0, 0.06, 0.9, 0.14, 0.14, 0.03, fr, 'metal', 'x');
    ANC.lens(F, 0, 0, 0.135, 0, 0, 1, 0.04, 'amber', null);
    for (const s of [-1, 1]) ANC.lens(F, s * 0.3, 0, 0.135, s * 0.25, 0, 1, 0.025, 'cyan', null);
    R.point('head_pt', 'head', 0, 0, 0.2);
    ANC.tell(F, R, 'head', 0, 0.085, 0.0, 0, 1, 0.1, 0.032);
    R.point('brush_pt', 'body', 0, -0.5, 1.3);

    /* ---- the brush discs on jointed arms: two ahead, one at the right flank; each disc spins on its post */
    const ARMS = [['arm_fl', 0.6, 0.78, 0.5, 1], ['arm_fr', -0.6, 0.78, -0.5, -1], ['arm_r', -0.78, -0.1, -1.4, -1]];
    for (const A of ARMS) {
      const n = A[0];
      R.bone(n, 'body', A[1], -0.12, A[2], 0, A[3], 0);
      R.on(n);
      F.cy(0, 0, 0, 0.07, 0.07, 0.1, jt, 'metal', 'y', 10);
      F.cy(0, 0, 0.24, 0.035, 0.035, 0.42, fr, 'metal', 'z', 8);
      F.knob(0, 0, 0.45, 0.05, jt, 'metal');
      F.cy(0, -0.17, 0.45, 0.03, 0.03, 0.3, fr, 'metal', 'y', 8);
      ANC.conduit(F, R, 'body', [A[1] * 0.8, 0.05, A[2] * 0.8], n, [0, 0.02, 0.3], 0.014, 0.1, 4);
      const D = 'disc' + n.slice(3);
      R.spin(D, n, 0, -0.33, 0.45, 'y', { idle: A[4] * 0.3, walk: A[4] * 5, attack: A[4] * 14 });
      R.on(D);
      F.cy(0, 0, 0, 0.28, 0.3, 0.05, ANC.work(F, 0.5), 'paint', 'y', 14);
      F.cy(0, -0.075, 0, 0.32, 0.27, 0.1, c('bristle'), 'cloth', 'y', 14);
      F.cy(0, 0.04, 0, 0.08, 0.07, 0.04, frd, 'metal', 'y', 8);
      R.on('body');
    }

    /* ---- four stubby legs under the hull: the fore knees bend back, the hind forward; rubber pads */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.55, -0.2, sz * 0.5], L1: 0.3, L2: 0.3, knee: sz > 0 ? -1 : 1, ankleH: 0.07,
        rest: [sx * 0.68, sz * 0.55], toe: 0.05 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.065, 0.11, 'x', jt, null);
      F.chb(0, -0.15, 0, 0.1, 0.26, 0.12, 0.03, ANC.work(F, 0.45), 'paint', 'y');
      R.on(n + '_knee');
      F.knob(0, 0, 0, 0.045, fr, 'metal');
      F.rod(0, 0, 0, 0, -0.29, 0, 0.03, ANC.soot(F), 'metal');
      R.on(n + '_ankle');
      F.cy(0, -0.04, 0.01, 0.045, 0.06, 0.06, c('rubber'), 'rubber', 'y', 8);
    }
  }
});
