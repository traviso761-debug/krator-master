/* ======================================================================
   Iziz mech: the Fossor (kits/mechs/krator-mechs-iziz-fossor.js)

   An Ancient excavating walker: a broad biped on tracked shoes, the operator in an
   amber-glazed cab in the chest, floodlamps and a beacon on its head, an auger for a
   right arm and a digging grab for a left. The legions use it to mine walls and to
   dig the camp's ditch at night; in a fight it bores through a shield wall and grabs
   what is left. Hazard bands in orange and black, a legion flag at its back.
   ====================================================================== */
MECH({
  key: 'iz_fossor', name: 'Fossor', culture: 'iziz',
  role: 'sapper: auger and grab', origin: 'Ancient excavating walker',
  lore: 'It dug foundations for the Ancients. The legions use it to mine walls and dig the camp ditch by floodlight; in the line it bores into the shields and grabs.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'industrial'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['auger', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Sapper'],
  w: 3.6, d: 2.7, h: 6.8,
  data: { height: 5.3, mass: 18, crew: 1, pilot: 'chest', reach: 3.0, weapon: 'rock auger and digging grab',
    engine: 'Ancient cell pack, hydraulic', armour: 'excavator plate' },
  gait: { period: 2.0, duty: 0.64, stride: 1.1, lift: 0.26, bob: 0.06, sway: 0.1, roll: 0.04, twist: 0.05, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.12, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.1, look: 0.45 },
  anim: {
    idle: function (P, t, w) {
      const o = (0.5 + 0.5 * Math.sin(t * 0.6)) * 0.2 * w;
      P.b.claw_a = [-o, 0, 0]; P.b.claw_b = [o, 0, 0];
    }
  },
  attack: {
    kind: 'auger thrust', dur: 2.9,
    keys: [
      [0, {}],
      [0.6, { b: { torso: [-0.04, -0.32, 0], arm_r_sh: [-0.75, 0, -0.05], arm_r_el: [-0.75, 0, 0], arm_l_sh: [-0.6, 0, 0.15], claw_a: [-0.55, 0, 0], claw_b: [0.55, 0, 0], body: [-0.05, 0, 0] },
        s: { body: [0, -0.06, -0.15] } }, 's'],
      [1.0, { b: { torso: [0.08, 0.25, 0], arm_r_sh: [-1.12, 0, 0.05], arm_r_el: [0.02, 0, 0], arm_l_sh: [-0.85, 0, 0.1], claw_a: [-0.55, 0, 0], claw_b: [0.55, 0, 0], body: [0.15, 0, 0] },
        s: { body: [0, -0.18, 0.38] } }, 'i'],
      [1.2, { b: { torso: [0.08, 0.28, 0], arm_r_sh: [-1.1, 0, 0.05], arm_r_el: [0.0, 0, 0], arm_l_sh: [-0.85, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.16, 0, 0] },
        s: { body: [0, -0.2, 0.42] } }, 'o'],
      [1.4, { b: { torso: [0.1, 0.22, 0], arm_r_sh: [-1.16, 0, 0.05], arm_r_el: [0.06, 0, 0], arm_l_sh: [-0.8, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.17, 0, 0] },
        s: { body: [0, -0.2, 0.46] } }, 's'],
      [1.75, { b: { torso: [0.08, 0.25, 0], arm_r_sh: [-1.1, 0, 0.05], arm_r_el: [0.0, 0, 0], arm_l_sh: [-0.8, 0, 0.1], claw_a: [0.2, 0, 0], claw_b: [-0.2, 0, 0], body: [0.15, 0, 0] },
        s: { body: [0, -0.18, 0.4] } }, 's'],
      [2.9, {}, 's']
    ],
    events: [{ t: 1.02, type: 'impact', at: 'drill_tip', r: 0.9 }, { t: 1.42, type: 'impact', at: 'drill_tip', r: 1.2 }]
  },

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), hz = c('hazard');

    R.bone('body', null, 0, 2.2, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.4, 0.55, 1.0, 0.14, gun, 'metal', 'z');
    F.cb(0, 0, 0.51, 1.2, 0.3, 0.04, dk, 'metal');
    F.bands(0, 0, 0.535, 1.18, 0.28, Math.PI / 4, 0.13, [or, hz], 'paint');
    for (const s of [-1, 1]) MP.joint(F, s * 0.57, -0.1, 0, 0.32, 0.16, 'x', iron, null);

    /* ---- the chest: an amber-glazed cab in a steel frame */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.42, 0.42, 0.3, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.42, 2.0, 1.55, 0.7, 0.16, steel, 'paint', 'z');
    F.chb(0, 0.32, 0.12, 1.75, 0.28, 1.25, 0.1, dk, 'metal', 'x');
    F.chb(0, 1.72, 0.1, 1.95, 0.18, 1.35, 0.08, or, 'paint', 'x');
    F.cb(0, 1.62, 0.79, 1.9, 0.05, 0.04, hz, 'paint');
    for (const s of [-1, 1]) {
      F.chb(s * 0.9, 1.0, 0.18, 0.2, 1.42, 1.15, 0.06, steel, 'paint', 'x');
      F.cb(s * 1.0, 1.0, 0.18, 0.02, 1.25, 0.9, dk, 'metal');
      F.bands(s * 1.019, 0.55, 0.18, 0.88, 0.3, Math.PI / 4, 0.12, [or, hz], 'paint', 0, s * Math.PI / 2, 0);
      F.cb(s * 0.62, 1.04, 0.73, 0.08, 1.1, 0.08, iron, 'metal', -0.12, 0, 0);
    }
    /* glazing: front tilted back, the sides */
    F.cb(0, 1.04, 0.72, 1.18, 1.08, 0.03, c('glassAmber'), 'glass', -0.12, 0, 0);
    for (const s of [-1, 1]) F.cb(s * 0.78, 1.15, 0.45, 0.03, 0.7, 0.55, c('glassAmber'), 'glass');
    F.cb(0, 1.02, -0.06, 1.5, 1.2, 0.04, gun, 'metal');
    F.cb(0, 0.46, 0.05, 0.6, 0.1, 0.55, c('leather'), 'leather');
    F.cb(0, 0.82, -0.2, 0.58, 0.7, 0.1, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.5, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    for (const s of [-1, 1]) { F.rod(s * 0.22, 0.6, 0.45, s * 0.22, 0.86, 0.55, 0.02, iron, 'metal'); }
    F.cb(0, 0.42, 0.66, 1.5, 0.36, 0.06, dk, 'metal');
    F.bands(0, 0.42, 0.695, 1.48, 0.34, -Math.PI / 4, 0.15, [or, hz], 'paint');
    /* the pack: radiator, an exhaust, the legion flag */
    F.chb(0, 1.0, -0.95, 1.45, 1.2, 0.45, 0.12, gun, 'metal', 'z');
    for (let i = 0; i < 8; i++) F.cb(-0.6 + i * 0.17, 1.0, -1.19, 0.05, 1.0, 0.04, iron, 'metal');
    F.cy(-0.55, 1.95, -0.95, 0.11, 0.1, 0.9, c('copper'), 'copper', 'y', 10);
    F.cy(-0.55, 2.42, -0.95, 0.14, 0.14, 0.06, iron, 'metal', 'y', 10);
    IZ.sashimono(F, R, 'sashi', 'torso', 0.55, 1.62, -1.2, { h: 2.4, w: 0.55, bh: 1.5, side: -1, paint: IZ.paint(F, 'legion', { numeral: 'XII' }) });
    R.on('torso');
    F.cb(0.55, 1.6, -1.19, 0.15, 0.25, 0.15, iron, 'metal');

    /* ---- the head: floodlamps on arms, a beacon */
    R.bone('head', 'torso', 0, 1.82, 0.15);
    R.on('head');
    F.cy(0, 0.02, 0, 0.26, 0.3, 0.12, iron, 'metal', 'y', 10);
    F.chb(0, 0.2, 0, 0.82, 0.3, 0.7, 0.1, steel, 'paint', 'x');
    for (const s of [-1, 1]) {
      F.cb(s * 0.17, 0.2, 0.36, 0.22, 0.18, 0.02, c('glass'), 'glass');
      F.cb(s * 0.17, 0.2, 0.355, 0.24, 0.2, 0.01, iron, 'metal');
      F.rod(s * 0.38, 0.28, 0.0, s * 0.62, 0.48, 0.05, 0.04, iron, 'metal');
      F.chb(s * 0.62, 0.52, 0.05, 0.3, 0.2, 0.22, 0.04, gun, 'metal', 'z');
      MP.lamp(F, s * 0.62, 0.52, 0.17, 0, -0.08, 1, 0.07, 'head', null);
      MP.lamp(F, s * 0.62 - 0.08, 0.52, 0.17, 0, -0.08, 1, 0.06, 'head', null);
    }
    F.prism(0, 0.45, 0, [[-0.3, 0], [0.3, 0], [0.12, 0.3], [-0.12, 0.3]], 0.4, or, 'paint', 'z');
    for (const s of [-1, 1]) F.knob(s * 0.1, 0.52, 0.2, 0.05, c('lensAmber'), 'lampAmber');
    F.knob(0, 0.6, 0.18, 0.05, c('lensAmber'), 'lampAmber');
    F.cy(0, 0.8, 0, 0.06, 0.08, 0.12, c('lensRed'), 'lampTail', 'y', 8);

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.18, 1.3, -0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.06, 0, 0, 0.28, 0.5, 'x', iron, br);
      F.chb(s * 0.05, 0.1, 0, 0.72, 0.5, 0.95, 0.18, or, 'paint', 'z');
      F.cb(s * 0.05, -0.17, 0, 0.74, 0.06, 0.97, hz, 'paint');
      F.cb(s * 0.05, 0.37, 0, 0.55, 0.05, 0.75, steel, 'paint');
      F.chb(0, -0.5, 0, 0.44, 0.8, 0.48, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, -0.42, 0.02, 0.52, 0.78, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(0, -0.42, 0.29, 0.4, 0.6, 0.03, dk, 'metal');
      F.bands(0, -0.42, 0.31, 0.38, 0.58, Math.PI / 4, 0.1, [or, hz], 'paint');
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.26], A + '_el', [0, -0.3, 0.3], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.7, 1.5, -0.7], A + '_sh', [0, -0.3, -0.25], 0.05, c('rubber'), 0.15);
    }
    /* the auger (right): motor, then the spinning bit along the forearm */
    R.on('arm_r_el');
    F.cy(0, -0.88, 0.02, 0.32, 0.32, 0.3, gun, 'metal', 'y', 14);
    F.cy(0, -0.88, 0.02, 0.34, 0.34, 0.06, or, 'paint', 'y', 14);
    R.spin('auger', 'arm_r_el', 0, -1.02, 0.02, 'z', { idle: 0, walk: 0, attack: 22 }, Math.PI / 2, 0, 0);
    R.on('auger');
    MP.auger(F, 1.5, 0.36, 3.2, iron, c('steelLt'));
    R.point('drill_tip', 'auger', 0, 0, 1.45);
    /* the grab (left): two jaws on a wrist */
    R.on('arm_l_el');
    R.bone('arm_l_wr', 'arm_l_el', 0, -0.86, 0.02, 0.2, 0, 0);
    R.on('arm_l_wr');
    F.chb(0, -0.1, 0, 0.5, 0.3, 0.55, 0.08, dk, 'metal', 'x');
    MP.joint(F, 0, -0.2, 0, 0.1, 0.56, 'x', iron, null);
    for (const k of [['claw_a', 1], ['claw_b', -1]]) {
      R.bone(k[0], 'arm_l_wr', 0, -0.2, k[1] * 0.12);
      R.on(k[0]);
      const sg = k[1];
      F.prism(0, 0, 0, [[0, 0.05], [sg * 0.12, 0.02], [sg * 0.22, -0.35], [sg * 0.12, -0.75], [0, -0.85], [sg * 0.04, -0.4]], 0.4, or, 'paint', 'x');
      for (let t = 0; t < 3; t++) F.cy((t - 1) * 0.13, -0.86, sg * 0.0, 0.04, 0.004, 0.14, c('chrome'), 'chrome', 'y', 5, Math.PI, 0, 0);
    }

    /* ---- legs on tracked shoes */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.66, -0.12, 0], L1: 0.98, L2: 0.95, knee: 1, ankleH: 0.5, rest: [s * 0.76, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.12 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.44, 'x', iron, br);
      F.chb(0, -0.48, 0, 0.5, 0.86, 0.56, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.27, -0.48, 0, 0.05, 0.6, 0.38, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.23, 0.64, 'x', iron, br);
      F.chb(0, -0.46, 0, 0.58, 0.88, 0.62, 0.12, dk, 'paint', 'y');
      F.cb(0, -0.46, 0.315, 0.5, 0.74, 0.02, gun, 'metal');
      F.bands(0, -0.46, 0.33, 0.48, 0.72, Math.PI / 4, 0.12, [or, hz], 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'track', w: 0.62, l: 1.3, ankleH: 0.5, plate: or, iron: c('rubber'), trim: br });
    }
  }
});
