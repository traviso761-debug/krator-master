/* ======================================================================
   Iziz mech: the Forfex (kits/mechs/krator-mechs-iziz-forfex.js)

   An Ancient scrap-shear walker from the breakers' yards: a hunched hull on two
   reverse-jointed legs, the operator in a glass nose, and under the chin a pair of
   hydraulic jaws made to cut hull plate. The legions run it in at a lope ahead of the
   line; it takes a gate, a palisade or a man in one bite. Antennas and two thin flags
   at its back, a crest along its spine, feathers hanging off the jaw housing.
   ====================================================================== */
MECH({
  key: 'iz_forfex', name: 'Forfex', culture: 'iziz',
  role: 'shock walker: shears', origin: 'Ancient scrap-shear walker',
  lore: 'Built to cut hull plate in the breakers\' yards. It lopes ahead of the line and bites through gates; the operator rides in the glass nose.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'digitigrade', crew: 1, pilot: 'head', weapon: ['shears'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Breaker'],
  w: 2.6, d: 5.8, h: 5.6,
  data: { height: 4.4, mass: 11, crew: 1, pilot: 'head', reach: 2.4, weapon: 'hydraulic scrap shears',
    engine: 'Ancient cell pack, hydraulic', armour: 'salvaged hull plate' },
  gait: { period: 1.55, duty: 0.58, stride: 1.35, lift: 0.42, bob: 0.06, sway: 0.07, roll: 0.03, twist: 0.05, lean: 0.02, offsets: [0, 0.5] },
  idle: { breathe: 0.035, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w) {
      const o = Math.max(0, Math.sin(t * 0.9) * Math.sin(t * 0.37)) * 0.14 * w;
      P.b.jaw_l = [0, o, 0]; P.b.jaw_r = [0, -o, 0];
      P.b.body = P.b.body || [0, 0, 0]; P.b.body[1] += 0.08 * Math.sin(t * 0.21) * w;
    }
  },
  attack: {
    kind: 'lunge and bite', dur: 2.2,
    keys: [
      [0, {}],
      [0.55, { b: { body: [-0.16, 0, 0], shear: [-0.35, 0, 0], jaw_l: [0, 0.5, 0], jaw_r: [0, -0.5, 0] }, s: { body: [0, 0.04, -0.28] } }, 's'],
      [0.85, { b: { body: [0.24, 0, 0], shear: [0.2, 0, 0], jaw_l: [0, 0.55, 0], jaw_r: [0, -0.55, 0] }, s: { body: [0, -0.3, 0.5] } }, 'i'],
      [0.98, { b: { body: [0.26, 0, 0], shear: [0.25, 0, 0], jaw_l: [0, -0.07, 0], jaw_r: [0, 0.07, 0] }, s: { body: [0, -0.32, 0.52] } }, 'i'],
      [1.35, { b: { body: [0.12, 0.12, 0], shear: [0.05, 0.1, 0], jaw_l: [0, -0.07, 0], jaw_r: [0, 0.07, 0] }, s: { body: [0, -0.18, 0.3] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 0.98, type: 'impact', at: 'jaw_tip', r: 1.0 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream');

    /* ---- the hull, its glass nose, the operator */
    R.bone('body', null, 0, 2.55, 0);
    R.on('body');
    F.chb(0, 0.25, 0.0, 1.6, 1.15, 2.3, 0.32, steel, 'paint', 'z');
    F.chb(0, 0.02, 1.2, 1.22, 0.78, 0.55, 0.22, dk, 'metal', 'z', 0.3, 0, 0);
    F.chb(0, -0.32, 0.1, 1.2, 0.3, 1.8, 0.1, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.chb(s * 0.82, 0.32, 0.05, 0.08, 0.78, 1.75, 0.04, or, 'paint', 'x');
      F.cb(s * 0.86, -0.1, 0.05, 0.03, 0.07, 1.72, cr, 'paint');
      F.cb(s * 0.86, -0.17, 0.05, 0.03, 0.04, 1.74, c('teal'), 'paint');
      IZ.sun(F, s * 0.88, 0.36, 0.25, s, 0, 0, 0.27);
      IZ.phalera(F, s * 0.87, 0.36, -0.55, s, 0, 0, 0.12);
      MP.lamp(F, s * 0.42, 0.18, 1.5, s * 0.25, 0, 1, 0.07, 'amber', gun);
    }
    MP.lamp(F, 0, 0.32, 1.45, 0, -0.1, 1, 0.13, 'head', gun);
    F.sph(0, 0.78, 0.5, 0.64, 0.86, 0.8, c('glass'), 'glass', 16, 10, 0, TAU, 0, Math.PI / 2);
    MP.cage(F, 0, 0.78, 0.5, 0.65, 0.87, 0.81, 0, TAU, 0, Math.PI / 2, 6, 2, 0.022, iron);
    F.tor(0, 0.79, 0.5, 0.66, 0.05, gun, 'metal', 'y', 18);
    F.cb(0, 0.66, 0.45, 0.6, 0.06, 0.6, gun, 'metal');
    for (const s of [-1, 1]) F.rod(s * 0.18, 0.7, 0.75, s * 0.18, 0.95, 0.9, 0.02, iron, 'metal');
    MP.pilot(F, R, 'body', 0, 0.48, 0.38, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: c('bronze'), harness: c('leather'),
      crest: c('crimson'), crestDir: 'along', lean: 0.15 });
    R.on('body');
    /* the back: cell housing, exhausts, crest along the spine */
    F.chb(0, 0.35, -1.25, 1.25, 0.95, 0.65, 0.22, gun, 'metal', 'z');
    for (let i = 0; i < 4; i++) F.cb(0, 0.1 + i * 0.16, -1.58, 0.9, 0.05, 0.04, iron, 'metal');
    for (const s of [-1, 1]) {
      F.rod(s * 0.42, 0.7, -1.3, s * 0.48, 1.15, -1.55, 0.08, c('copper'), 'copper');
      F.cy(s * 0.48, 1.18, -1.56, 0.1, 0.1, 0.08, iron, 'metal', 'y', 8);
    }
    IZ.crest(F, 0, 0.86, -0.45, 1.1, 0.38, 'along');
    /* ---- the jaws under the chin */
    R.bone('shear', 'body', 0, -0.38, 1.12, 0.15, 0, 0);
    R.on('shear');
    F.chb(0, 0, 0.0, 0.62, 0.46, 0.72, 0.12, gun, 'metal', 'z');
    F.chb(0, 0.12, 0.05, 0.66, 0.12, 0.6, 0.04, or, 'paint', 'z');
    MP.joint(F, 0, 0, 0.3, 0.12, 0.66, 'y', iron, c('bronze'));
    R.point('jaw_tip', 'shear', 0, -0.05, 1.7);
    for (const s of [-1, 1]) {
      const J = s > 0 ? 'jaw_l' : 'jaw_r';
      R.bone(J, 'shear', s * 0.15, 0, 0.3);
      R.on(J);
      const out = [[0.0, -0.12], [0.17, 0.2], [0.18, 0.85], [0.07, 1.32], [-0.1, 1.45], [-0.06, 1.12], [-0.03, 0.6], [-0.05, 0.12]];
      F.prism(0, 0, 0, out.map(function (p) { return [s * p[0], p[1]]; }), 0.14, steel, 'metal', 'y');
      F.prism(0, 0.085, 0, [[0.02, 0.1], [0.15, 0.25], [0.15, 0.8], [0.04, 0.9]].map(function (p) { return [s * p[0], p[1]]; }), 0.03, or, 'paint', 'y');
      for (let k = 0; k < 4; k++) F.cy(s * -0.09, 0, 0.35 + k * 0.22, s > 0 ? 0.003 : 0.035, s > 0 ? 0.035 : 0.003, 0.12, c('chrome'), 'chrome', 'x', 5);
      MP.piston(F, R, 'shear', [s * 0.25, 0.0, -0.25], J, [s * 0.16, 0, 0.35], 0.045, dk, c('chrome'));
    }
    for (const s of [-1, 1]) MP.piston(F, R, 'body', [s * 0.3, -0.3, 0.55], 'shear', [s * 0.22, 0.12, -0.12], 0.06, dk, c('chrome'));
    IZ.feathers(F, R, 'fth_l', 'shear', 0.33, -0.1, 0.2, { n: 4, len: 0.45, cols: ['fScarlet', 'fGold', 'fBlack'] });
    IZ.feathers(F, R, 'fth_r', 'shear', -0.33, -0.1, 0.2, { n: 4, len: 0.45, cols: ['fGreen', 'fTeal', 'fGold'] });

    /* ---- legs: reverse-jointed, claw feet */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.74, -0.22, -0.42], L1: 1.25, L2: 1.35, knee: -1, ankleH: 0.36, rest: [s * 0.84, -0.12], phase: s > 0 ? 0 : 0.5, toe: 0.35 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.32, 0.5, 'x', iron, c('bronze'));
      F.chb(0, -0.55, 0, 0.5, 1.0, 0.64, 0.12, steel, 'paint', 'y');
      F.chb(s * 0.27, -0.5, 0.02, 0.06, 0.8, 0.5, 0.03, or, 'paint', 'y');
      F.cb(s * 0.305, -0.5, 0.02, 0.02, 0.84, 0.06, cr, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.48, 'x', iron, c('bronze'));
      F.chb(0, -0.66, 0, 0.36, 1.2, 0.42, 0.09, dk, 'paint', 'y');
      F.chb(0, -0.45, 0.22, 0.3, 0.7, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.3, 0.32], Lg + '_knee', [0, -0.3, 0.26], 0.06, dk, c('chrome'));
      MP.piston(F, R, Lg + '_knee', [0, -0.15, -0.24], Lg + '_ankle', [0, 0.2, -0.2], 0.045, dk, c('chrome'));
      MP.hose(F, R, 'body', [s * 0.6, -0.2, -0.75], Lg + '_knee', [s * 0.18, -0.2, -0.2], 0.04, c('rubber'), 0.2);
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.7, l: 1.05, ankleH: 0.36, plate: dk, iron: gun, trim: c('bronze'), toes: 3 });
    }

    /* ---- antennas and flags at the back */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'body', s * 0.55, 0.82, -1.45, { mode: 'whip', len: 1.7, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.cy(0, 0.05, 0, 0.05, 0.05, 0.1, iron, 'metal', 'y', 8);
      F.rod(0, 0, 0, 0, 1.7, 0, 0.014, iron, 'metal');
      F.knob(0, 1.7, 0, 0.03, c('lensRed'), 'lampTail');
      if (s > 0) R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.55, z: 0, w: 0.7, h: 0.26, paint: IZ.paint(F, 'stripes') });
    }
    IZ.sashimono(F, R, 'sashi_l', 'body', 0.32, 0.86, -1.0, { h: 1.8, w: 0.38, bh: 1.05, side: 1, paint: IZ.paint(F, 'teal') });
    IZ.sashimono(F, R, 'sashi_r', 'body', -0.32, 0.86, -1.0, { h: 1.8, w: 0.38, bh: 1.05, side: -1, paint: IZ.paint(F, 'sun') });
  }
});
