/* ======================================================================
   Iziz mech: the Forge-Warden (kits/mechs/krator-mechs-iziz-fabrica.js)

   An Ancient riveting walker from a shipyard: a round-chested biped with copper
   boilers across its shoulders, the operator sat in the chest behind a cage of bronze
   bars, a pneumatic riveting gun for a left arm and a hammer fist for a right. The
   Forgemasters keep these for themselves: it heats rivets in the gun's coil and drives
   them, glowing, into whatever stands in front of it. Cream pads painted with the sun,
   orange bands, a whip aerial, feathers at the boilers.
   ====================================================================== */
MECH({
  key: 'iz_fabrica', name: 'Forge-Warden', culture: 'iziz',
  role: 'Forgemasters\' walker: rivet gun and hammer', origin: 'Ancient shipyard riveting walker',
  lore: 'The Forgemasters keep these for their own halls. It heats rivets in the gun\'s coil and drives them glowing into a shield wall; the operator sits behind bronze bars.',
  tags: { class: 'mech', type: ['war machine', 'industrial'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['rivet gun', 'fist'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Hall Warden'],
  w: 3.7, d: 2.8, h: 6.4,
  data: { height: 5.2, mass: 16, crew: 1, pilot: 'chest', reach: 30, weapon: 'pneumatic rivet gun (heated slugs) and hammer fist',
    engine: 'twin boilers and Ancient cell', armour: 'riveted ship plate' },
  gait: { period: 1.8, duty: 0.62, stride: 1.15, lift: 0.3, bob: 0.065, sway: 0.09, roll: 0.04, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.08, 0, 0], arm_r_sh: [0.2, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.14, look: 0.3 },
  attack: (function () {
    const aim = { b: { arm_l_sh: [-0.62, 0, 0.1], arm_l_el: [-0.4, 0, 0], torso: [0, -0.25, 0], arm_r_sh: [-0.3, 0, -0.1], arm_r_el: [-0.6, 0, 0], body: [0.04, 0, 0] },
      s: { body: [0, -0.16, 0] } };
    const kick = { b: { arm_l_sh: [-0.66, 0, 0.1], arm_l_el: [-0.6, 0, 0], torso: [-0.03, -0.2, 0], arm_r_sh: [-0.3, 0, -0.1], arm_r_el: [-0.6, 0, 0], body: [0.0, 0, 0] },
      s: { body: [0, -0.14, -0.08] } };
    const keys = [[0, {}], [0.55, aim, 's']];
    for (const t of [0.85, 1.15, 1.45]) keys.push([t - 0.01, aim, 's'], [t + 0.04, kick, 'o'], [t + 0.18, aim, 's']);
    keys.push([2.6, {}, 's']);
    return { kind: 'rivet volley', dur: 2.6, keys: keys,
      events: [0.85, 1.15, 1.45].map(function (t) { return { t: t, type: 'fire', kind: 'rivet', at: 'muzzle', dir: [0, -1, 0], speed: 42 }; }) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), cu = c('copper');

    /* ---- hips */
    R.bone('body', null, 0, 2.05, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.3, 0.52, 0.95, 0.14, gun, 'metal', 'z');
    F.chb(0, 0.02, 0.48, 0.8, 0.34, 0.08, 0.05, or, 'paint', 'x');
    IZ.phalera(F, 0, 0.02, 0.53, 0, 0, 1, 0.11);
    for (const s of [-1, 1]) MP.joint(F, s * 0.56, -0.1, 0, 0.31, 0.16, 'x', iron, null);

    /* ---- the round chest with its caged window */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.4, 0.4, 0.3, iron, 'metal', 'y', 12);
    const W0 = Math.PI / 2 - 0.72, WD = 1.44, T0 = 0.62, TD = 1.1, cy = 1.05;
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 18, 12, W0 + WD, TAU - WD, 0, Math.PI);
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 6, 3, W0, WD, 0, T0);
    F.sph(0, cy, 0, 1.0, 0.95, 0.85, steel, 'paint', 6, 4, W0, WD, T0 + TD, Math.PI - T0 - TD);
    F.sphIn(0, cy, 0, 0.97, 0.92, 0.82, gun, 'metal', 10, 8, W0 - 0.3, WD + 0.6, T0 - 0.2, TD + 0.4);
    MP.cage(F, 0, cy, 0, 1.02, 0.97, 0.87, W0, WD, T0, TD, 4, 3, 0.032, br, 'bronze');
    /* livery: an orange bib under the window, cream bands round the chest */
    F.sph(0, cy, 0, 1.015, 0.965, 0.865, or, 'paint', 8, 3, W0 - 0.15, WD + 0.3, T0 + TD + 0.06, 0.42);
    F.tor(0, cy - 0.62, 0, 0.78, 0.04, cr, 'paint', 'y', 20);
    F.cy(0, 0.3, 0.05, 0.72, 0.62, 0.3, dk, 'metal', 'y', 14);
    MP.pilot(F, R, 'torso', 0, 0.62, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    F.cb(0, 0.57, 0.02, 0.55, 0.1, 0.5, c('leather'), 'leather');
    for (const s of [-1, 1]) { F.rod(s * 0.2, 0.7, 0.42, s * 0.2, 0.95, 0.5, 0.02, iron, 'metal'); }
    /* the boilers on the shoulders, pipes into the chest, a whip aerial */
    for (const s of [-1, 1]) {
      MP.tank(F, s * 0.98, 1.78, -0.3, 0.32, 1.0, 'x', cu, iron, 3, 'copper');
      F.cy(s * 1.52, 1.78, -0.3, 0.1, 0.1, 0.1, br, 'bronze', 'x', 10);
      F.tube([[s * 0.7, 1.5, -0.3], [s * 0.55, 1.35, -0.05], [s * 0.42, 1.55, 0.25]], 0.045, cu, 'copper');
      F.cb(s * 0.98, 1.43, -0.3, 0.7, 0.1, 0.3, iron, 'metal');
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', 'torso', s * 1.55, 1.62, -0.3, { n: 5, len: 0.5, cols: s > 0 ? ['fScarlet', 'fGold', 'fBlack'] : ['fTeal', 'fGreen', 'fWhite'] });
      R.on('torso');
    }
    R.dangle('aerial', 'torso', -0.5, 1.9, -0.62, { mode: 'whip', len: 2.0, k: 26, c: 2, wind: 0.02, max: 0.45 });
    R.on('aerial');
    F.cy(0, 0.1, 0, 0.06, 0.06, 0.2, iron, 'metal', 'y', 8);
    for (let k = 0; k < 6; k++) F.tor(0, 0.24 + k * 0.035, 0, 0.045, 0.01, br, 'bronze', 'y', 8);
    F.rod(0, 0.2, 0, 0, 2.0, 0, 0.013, iron, 'metal');
    F.knob(0, 2.0, 0, 0.035, c('lensRed'), 'lampTail');
    R.banner({ bone: 'aerial', kind: 'pennant', x: 0, y: 1.9, z: 0, w: 0.8, h: 0.24, paint: IZ.paint(F, 'stripes') });
    /* the head: a small turret over the cage, an amber eye, a crest */
    R.bone('head', 'torso', 0, 1.95, 0.12);
    R.on('head');
    F.cy(0, 0.0, 0, 0.22, 0.26, 0.14, iron, 'metal', 'y', 10);
    F.chb(0, 0.17, 0, 0.56, 0.26, 0.5, 0.1, steel, 'paint', 'x');
    F.cb(0, 0.3, 0, 0.58, 0.04, 0.52, or, 'paint');
    MP.lamp(F, 0, 0.17, 0.27, 0, 0, 1, 0.07, 'amber', gun);
    IZ.crest(F, 0, 0.33, -0.02, 0.8, 0.3, 'across');

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.12, 1.2, 0.05, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.08, 0, 0, 0.27, 0.42, 'x', iron, br);
      F.chb(s * 0.06, 0.05, 0, 0.66, 0.5, 0.86, 0.2, cr, 'paint', 'z');
      F.cb(s * 0.06, -0.22, 0, 0.68, 0.06, 0.88, or, 'paint');
      IZ.sun(F, s * 0.4, 0.06, 0, s, 0, 0, 0.18, c('red'), c('red'));
      F.chb(0, -0.5, 0, 0.42, 0.75, 0.46, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.92, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.25], A + '_el', [0, -0.3, 0.3], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.75, 1.5, -0.5], A + '_sh', [0, -0.3, -0.24], 0.045, c('rubber'), 0.18);
    }
    /* the rivet gun (left): body, copper bands, the heating coil, feed drum, a crowned muzzle */
    R.on('arm_l_el');
    F.cy(0, -0.45, 0.08, 0.36, 0.36, 0.9, gun, 'metal', 'y', 14);
    for (const y of [-0.15, -0.55]) F.cy(0, y, 0.08, 0.385, 0.385, 0.08, cu, 'copper', 'y', 14);
    F.cy(0, -0.36, 0.08, 0.38, 0.38, 0.16, or, 'paint', 'y', 14);
    F.cy(0, -1.02, 0.08, 0.17, 0.17, 0.42, iron, 'metal', 'y', 12);
    for (let k = 0; k < 5; k++) F.tor(0, -0.88 - k * 0.06, 0.08, 0.2, 0.025, c('lensAmber'), 'lampAmber', 'y', 12);
    F.cy(0, -1.26, 0.08, 0.24, 0.24, 0.1, br, 'bronze', 'y', 12);
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6;
      F.cy(Math.cos(a) * 0.22, -1.34, 0.08 + Math.sin(a) * 0.22, 0.045, 0.004, 0.22, br, 'bronze', 'y', 5, Math.sin(a) * -0.6, 0, Math.cos(a) * 0.6);
    }
    F.cy(0.0, -0.4, 0.52, 0.2, 0.2, 0.36, dk, 'metal', 'x', 12);
    F.cy(0.0, -0.4, 0.52, 0.21, 0.21, 0.06, cu, 'copper', 'x', 12);
    R.point('muzzle', 'arm_l_el', 0, -1.42, 0.08);
    /* the hammer fist (right) */
    R.on('arm_r_el');
    F.chb(0, -0.45, 0.02, 0.5, 0.82, 0.52, 0.1, steel, 'paint', 'y');
    F.cb(0, -0.3, 0.02, 0.53, 0.2, 0.55, or, 'paint');
    R.bone('arm_r_wr', 'arm_r_el', 0, -0.92, 0.02, 0.45, 0, 0);
    R.on('arm_r_wr');
    F.chb(0, -0.28, 0.06, 0.6, 0.52, 0.62, 0.12, dk, 'metal', 'x');
    for (let k = 0; k < 4; k++) F.cy(-0.21 + k * 0.14, -0.5, 0.3, 0.075, 0.075, 0.12, br, 'bronze', 'x', 8);
    F.chb(0.33, -0.25, 0.18, 0.12, 0.3, 0.2, 0.04, gun, 'metal', 'y');

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.62, -0.12, 0], L1: 0.95, L2: 0.92, knee: 1, ankleH: 0.42, rest: [s * 0.72, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.24, 0.44, 'x', iron, br);
      F.chb(0, -0.47, 0, 0.5, 0.84, 0.56, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.27, -0.45, 0, 0.05, 0.55, 0.36, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, 0.02, 0.28, 0.5, 0.42, 0.16, 0.08, cr, 'paint', 'x');
      F.chb(0, -0.48, 0, 0.56, 0.86, 0.6, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.45, 0.3, 0.42, 0.62, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.33], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.7, l: 1.0, ankleH: 0.42, plate: steel, iron: gun, trim: br, toes: 3 });
    }
  }
});
