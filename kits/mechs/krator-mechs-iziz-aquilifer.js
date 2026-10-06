/* ======================================================================
   Iziz mech: the Aquilifer (kits/mechs/krator-mechs-iziz-aquilifer.js)

   An Ancient mine-ventilation walker: a biped carrying two great ducted fans on its
   back, long cooling vanes hanging from its shoulders, the operator in a barred cab
   in the chest. The legion made it the standard-bearer: the sun of Iziz rides on a
   pole between the fans, and on its right forearm it carries a carroballista that
   throws a barbed harpoon on a line (for whales, once, off Hook). It raises the
   weapon to its shoulder, looses, and winds the line back in.
   ====================================================================== */
MECH({
  key: 'iz_aquilifer', name: 'Aquilifer', culture: 'iziz',
  role: 'standard-bearer: harpoon ballista', origin: 'Ancient mine-ventilation walker',
  lore: 'Its fans once aired the deep mines. Now it carries the legion\'s sun between them and a harpoon ballista that was meant for whales.',
  tags: { class: 'mech', type: ['war machine', 'standard-bearer'], drive: 'biped', crew: 1, pilot: 'chest', weapon: ['harpoon', 'fist'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Standard'],
  w: 5.6, d: 4.5, h: 8.3,
  data: { height: 5.4, mass: 15, crew: 1, pilot: 'chest', reach: 260, weapon: 'carroballista throwing a 2.6 m harpoon on a line',
    engine: 'Ancient cell pack, twin ducted fans', armour: 'vent housing plate' },
  gait: { period: 1.75, duty: 0.6, stride: 1.25, lift: 0.32, bob: 0.065, sway: 0.08, roll: 0.035, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.2, 0, 0], arm_r_sh: [0.08, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.1, look: 0.35 },
  attack: (function () {
    const D = 0.62 * 2.2 - 0.12;
    const aim = { b: { arm_r_sh: [-1.42, 0.12, 0.05], arm_r_el: [0.55, 0, 0], arm_r_wr: [0.87, 0, 0], torso: [0, -0.18, 0], arm_l_sh: [-0.4, 0, 0.1], body: [0.03, 0, 0] },
      s: { body: [0, -0.12, 0] } };
    const shot = JSON.parse(JSON.stringify(aim));
    shot.b.harp_bowL = [0, -0.45, 0]; shot.b.harp_bowR = [0, 0.45, 0]; shot.s.harp_nut = [0, 0, D]; shot.sc = { harp_bolt: 0.0001 };
    const kick = JSON.parse(JSON.stringify(shot));
    kick.b.arm_r_sh = [-1.25, 0.12, 0.05]; kick.b.arm_r_wr = [0.75, 0, 0]; kick.s.body = [0, -0.1, -0.15];
    const wound = JSON.parse(JSON.stringify(aim)); wound.sc = { harp_bolt: 0.0001 };
    return { kind: 'harpoon shot', dur: 3.2, keys: [[0, {}], [0.75, aim, 's'], [1.05, aim, 's'], [1.1, kick, 'i'], [1.35, shot, 'o'],
      [2.4, wound, 's'], [2.42, aim, 'l'], [3.2, {}, 's']],
      events: [{ t: 1.08, type: 'fire', kind: 'harpoon', at: 'harp_muzzle', dir: [0, 0, 1], speed: 52 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), hz = c('hazard');

    R.bone('body', null, 0, 2.25, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.3, 0.5, 0.95, 0.14, gun, 'metal', 'z');
    F.chb(0, -0.02, 0.48, 0.9, 0.32, 0.06, 0.05, steel, 'paint', 'x');
    for (const s of [-1, 1]) MP.joint(F, s * 0.58, -0.1, 0, 0.31, 0.16, 'x', iron, null);

    /* ---- the chest: a barred cab */
    R.bone('torso', 'body', 0, 0.3, 0);
    R.on('torso');
    F.cy(0, 0.05, 0, 0.4, 0.4, 0.3, iron, 'metal', 'y', 12);
    F.chb(0, 1.0, -0.4, 1.8, 1.45, 0.8, 0.16, steel, 'paint', 'z');
    F.chb(0, 1.7, 0.08, 1.85, 0.16, 1.2, 0.07, dk, 'metal', 'x');
    F.chb(0, 0.33, 0.12, 1.55, 0.26, 1.15, 0.1, dk, 'metal', 'x');
    for (const s of [-1, 1]) {
      F.chb(s * 0.8, 1.0, 0.18, 0.2, 1.4, 1.1, 0.06, steel, 'paint', 'x');
      F.cb(s * 0.9, 1.0, 0.18, 0.02, 1.2, 0.85, or, 'paint');
      F.cb(s * 0.915, 1.0, 0.18, 0.02, 1.24, 0.08, cr, 'paint');
    }
    F.cb(0, 1.03, 0.025, 1.4, 1.2, 0.04, gun, 'metal');
    F.cb(0, 0.45, 0.02, 0.58, 0.1, 0.5, c('leather'), 'leather');
    MP.pilot(F, R, 'torso', 0, 0.5, 0.05, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson') });
    R.on('torso');
    F.cb(0, 1.05, 0.66, 1.36, 1.0, 0.03, c('glass'), 'glass');
    for (let i = 0; i < 6; i++) F.cb(-0.6 + i * 0.24, 1.05, 0.7, 0.04, 1.02, 0.05, iron, 'metal');
    F.cb(0, 1.57, 0.68, 1.45, 0.08, 0.1, gun, 'metal');
    F.cb(0, 0.52, 0.66, 1.45, 0.3, 0.08, dk, 'metal');
    F.bands(0, 0.52, 0.705, 1.42, 0.28, Math.PI / 4, 0.13, [or, hz], 'paint');
    IZ.phalerae(F, 0.55, 1.45, 0.73, 0, 0, 1, 1, 0.2, 0.08);
    /* the fans, their bracket, the long vanes from the shoulders */
    F.chb(0, 1.55, -0.9, 1.7, 0.5, 0.35, 0.1, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      MP.fan(F, R, s > 0 ? 'fan_l' : 'fan_r', 'torso', s * 0.56, 1.72, -1.05, 0.44, 0.42, steel, c('steelLt'), or, { idle: 4, walk: 8, attack: 16 }, 0, Math.PI, 0);
      R.on('torso');
      F.chb(s * 1.0, 0.75, -0.75, 0.12, 1.5, 0.5, 0.05, dk, 'metal', 'y', 0, 0, s * 0.12);
      F.cb(s * 1.05, 0.75, -0.5, 0.02, 1.3, 0.08, or, 'paint', 0, 0, s * 0.12);
      for (let k = 0; k < 3; k++) F.cy(s * 1.08, 0.2 + k * 0.5, -0.82, 0.05, 0.004, 0.2, iron, 'metal', 'y', 6, Math.PI, 0, 0);
    }
    /* the head: a flat visor with two grilles */
    R.bone('head', 'torso', 0, 1.8, 0.12);
    R.on('head');
    F.cy(0, 0.0, 0, 0.22, 0.26, 0.12, iron, 'metal', 'y', 10);
    F.chb(0, 0.15, 0, 0.7, 0.24, 0.62, 0.08, steel, 'paint', 'x');
    F.cb(0, 0.16, 0.32, 0.42, 0.05, 0.02, c('eye'), 'glow');
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) F.cb(s * 0.17, 0.29, -0.1 + k * 0.07, 0.24, 0.03, 0.03, iron, 'metal');
    F.cb(0, 0.28, 0, 0.72, 0.03, 0.64, or, 'paint');
    /* the standard: the legion's sun between the fans */
    IZ.vexillum(F, R, 'vex', 'torso', 0, 1.85, -1.25, { h: 3.4, w: 0.95, bh: 1.05, finial: 'sun', paint: IZ.paint(F, 'orb'), discs: 4 });

    /* ---- arms */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.12, 1.32, -0.02, 0, 0, s * 0.12);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.06, 0, 0, 0.27, 0.56, 'x', iron, br);
      F.chb(s * 0.05, 0.08, 0, 0.7, 0.5, 0.92, 0.18, steel, 'paint', 'z');
      F.cb(s * 0.05, 0.08, 0, 0.72, 0.18, 0.94, or, 'paint');
      F.cb(s * 0.05, -0.04, 0, 0.73, 0.04, 0.95, hz, 'paint');
      F.chb(0, -0.5, 0, 0.42, 0.8, 0.46, 0.08, steel, 'paint', 'y');
      R.bone(A + '_el', A + '_sh', 0, -0.95, 0, -0.55, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.21, 0.48, 'x', iron, br);
      F.chb(0, -0.44, 0.02, 0.5, 0.82, 0.52, 0.1, dk, 'paint', 'y');
      F.cb(0, -0.25, 0.02, 0.53, 0.14, 0.55, or, 'paint');
      R.bone(A + '_wr', A + '_el', 0, -0.92, 0.02, 0.55, 0, 0);
      MP.piston(F, R, A + '_sh', [0, -0.3, 0.25], A + '_el', [0, -0.3, 0.29], 0.05, dk, c('chrome'));
      MP.hose(F, R, 'torso', [s * 0.7, 1.45, -0.62], A + '_sh', [0, -0.3, -0.25], 0.045, c('rubber'), 0.16);
    }
    /* the carroballista on the right forearm, a coil of line under it */
    R.on('arm_r_wr');
    F.chb(0, -0.12, 0.05, 0.36, 0.3, 0.42, 0.06, gun, 'metal', 'x');
    MP.ballista(F, R, 'harp', 'arm_r_wr', 0, 0.08, 0.35, { len: 2.2, span: 1.1, h: 0.2, wood: c('woodDk'), iron: iron, bronze: br, rope: c('rope'),
      skein: c('skein'), bolt: c('wood'), flight: c('fWhite') });
    R.on('harp');
    F.cy(0, -0.3, -0.5, 0.16, 0.16, 0.24, c('rope'), 'rope', 'x', 12);
    F.cy(0, -0.3, -0.5, 0.06, 0.06, 0.3, iron, 'metal', 'x', 8);
    R.on('harp_bolt');
    for (const s of [-1, 1]) F.rod(0, 0, 1.75, s * 0.14, 0, 1.55, 0.022, iron, 'metal');
    /* the gauntlet and a quiver of spare harpoons on the left */
    R.on('arm_l_wr');
    F.chb(0, -0.2, 0.04, 0.5, 0.42, 0.55, 0.1, dk, 'metal', 'x');
    for (let k = 0; k < 4; k++) F.cb(-0.18 + k * 0.12, -0.42, 0.22, 0.1, 0.12, 0.12, gun, 'metal', 0.3, 0, 0);
    R.on('arm_l_el');
    F.cy(0.3, -0.45, -0.1, 0.13, 0.13, 0.74, c('leather'), 'leather', 'y', 8);
    for (let k = 0; k < 3; k++) F.rod(0.27 + k * 0.03, 0.0, -0.1 + (k - 1) * 0.05, 0.27 + k * 0.03, -1.0, -0.1 + (k - 1) * 0.05, 0.02, c('wood'), 'wood');

    /* ---- legs */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.64, -0.12, 0], L1: 1.0, L2: 1.0, knee: 1, ankleH: 0.44, rest: [s * 0.74, 0.05], phase: s > 0 ? 0 : 0.5 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.25, 0.56, 'x', iron, br);
      F.chb(0, -0.5, 0, 0.48, 0.88, 0.54, 0.1, steel, 'paint', 'y');
      F.cb(s * 0.26, -0.5, 0, 0.05, 0.6, 0.36, or, 'paint');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.5, 'x', iron, br);
      F.chb(0, -0.5, 0, 0.54, 0.92, 0.58, 0.12, dk, 'paint', 'y');
      F.chb(0, -0.4, 0.3, 0.42, 0.62, 0.06, 0.03, steel, 'paint', 'x');
      F.cb(0, -0.4, 0.335, 0.08, 0.6, 0.02, or, 'paint');
      MP.piston(F, R, Lg + '_hip', [0, -0.25, -0.3], Lg + '_knee', [0, -0.35, -0.32], 0.055, dk, c('chrome'));
      R.on(Lg + '_ankle');
      MP.foot(F, { kind: 'stomp', w: 0.7, l: 1.05, ankleH: 0.44, plate: steel, iron: gun, trim: br, toes: 3 });
      F.cb(0, -0.44 + 0.27, 0.52, 0.62, 0.1, 0.02, gun, 'metal', -0.35, 0, 0);
      F.bands(0, -0.44 + 0.275, 0.535, 0.6, 0.09, Math.PI / 4, 0.07, [or, hz], 'paint', -0.35, 0, 0);
    }
  }
});
