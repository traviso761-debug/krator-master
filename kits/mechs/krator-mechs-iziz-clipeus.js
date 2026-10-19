/* ======================================================================
   Iziz mech: the Clipeus (kits/mechs/krator-mechs-iziz-clipeus.js)

   An Ancient survey walker: its instruments and its operator in a broad disc carried on
   two legs, a sensor block with two lamps at the disc's front, a long tubular arm with a
   three-fingered grab on one side and a short arm with a clamp on the other. The
   Forgemasters filled the two instrument boxes on its shoulders with bolt tubes: it
   stands sentry on the walls, turns the whole disc to look, and looses a bolt from
   each box in turn. The legions call it the shield, for the disc.
   ====================================================================== */
MECH({
  key: 'iz_clipeus', name: 'Clipeus', culture: 'iziz',
  role: 'sentry: shoulder bolt boxes and grab', origin: 'Ancient survey walker',
  lore: 'A survey walker that carries its instruments in a disc. The instrument boxes on its shoulders hold bolt tubes now; it stands on the walls and turns the whole disc to look.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'biped', crew: 1, pilot: 'head', weapon: ['repeating ballista', 'claw'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Wall Sentry'],
  w: 4.4, d: 3.4, h: 5.4,
  data: { height: 4.9, mass: 12, crew: 1, pilot: 'head', reach: 260, weapon: 'two shoulder boxes of three bolt tubes each, a three-fingered grab, a clamp',
    engine: 'Ancient cell pack, hydraulic', armour: 'instrument disc' },
  gait: { period: 1.8, duty: 0.62, stride: 1.25, lift: 0.34, bob: 0.06, sway: 0.08, roll: 0.03, twist: 0.05, lean: 0.02,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.12, 0, 0], arm_r_sh: [0.14, 0, 0] } },
  idle: { breathe: 0.03, scan: 0.35, look: 0 },
  anim: {
    idle: function (P, t, w) {
      const k = (0.5 + 0.5 * Math.sin(t * 0.7)) * 0.3 * w;
      P.b.grab_f0 = [k, 0, 0]; P.b.grab_f1 = [k, 0, 0]; P.b.grab_th = [-k, 0, 0];
    }
  },
  attack: (function () {
    const aim = { b: { torso: [0, 0, 0], box_l: [-0.22, 0, 0], box_r: [-0.22, 0, 0], body: [-0.03, 0, 0] }, s: { body: [0, -0.12, 0] } };
    const kick = function (side) { const k = JSON.parse(JSON.stringify(aim)); k.b[side] = [-0.32, 0, 0]; k.s.body = [0, -0.11, -0.06]; return k; };
    const shots = [[0.8, 'box_l', 'box_l_m0'], [1.05, 'box_r', 'box_r_m0'], [1.3, 'box_l', 'box_l_m1']];
    const keys = [[0, {}], [0.5, aim, 's']];
    for (const s of shots) keys.push([s[0], aim, 's'], [s[0] + 0.05, kick(s[1]), 'o']);
    keys.push([1.55, aim, 's'], [1.85, { b: { arm_r_sh: [-1.2, 0, -0.1], arm_r_el: [0.2, 0, 0], clamp_a: [-0.4, 0, 0], clamp_b: [0.4, 0, 0] }, s: { body: [0, -0.08, 0.15] } }, 'i'],
      [2.0, { b: { arm_r_sh: [-1.2, 0, -0.1], arm_r_el: [0.2, 0, 0], clamp_a: [0.1, 0, 0], clamp_b: [-0.1, 0, 0] }, s: { body: [0, -0.08, 0.15] } }, 'i'],
      [2.9, {}, 's']);
    return { kind: 'bolt boxes and clamp', dur: 2.9, keys: keys,
      events: shots.map(function (s) { return { t: s[0] + 0.01, type: 'fire', kind: 'bolt', at: s[2], dir: [0, 0, 1], speed: 50 }; })
        .concat([{ t: 2.0, type: 'impact', at: 'clamp_pt', r: 0.9 }]) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- hips */
    R.bone('body', null, 0, 2.62, 0);
    R.on('body');
    F.chb(0, 0, 0, 1.05, 0.48, 0.8, 0.12, gun, 'metal', 'z');
    F.cy(0, 0.42, 0, 0.34, 0.42, 0.42, iron, 'metal', 'y', 12);
    for (const s of [-1, 1]) F.cb(s * 0.3, 0.02, 0.41, 0.3, 0.3, 0.04, dk, 'metal');

    /* ---- the disc: instruments, the operator's well, a slit of lamps round the front */
    R.bone('torso', 'body', 0, 0.5, 0);
    R.on('torso');
    F.cy(0, 0.55, 0, 1.55, 1.55, 0.46, steel, 'paint', 'y', 32);
    F.sph(0, 0.78, 0, 1.53, 0.2, 1.53, lt, 'paint', 32, 6, 0, TAU, 0, Math.PI / 2);
    F.sph(0, 0.32, 0, 1.53, 0.22, 1.53, dk, 'metal', 32, 5, 0, TAU, Math.PI / 2, Math.PI / 2);
    F.cy(0, 0.6, 0, 1.567, 1.567, 0.14, or, 'paint', 'y', 32);
    F.tor(0, 0.96, 0, 0.88, 0.03, cr, 'paint', 'y', 28);
    F.cy(0, 0.98, 0, 0.55, 0.55, 0.06, steel, 'paint', 'y', 20);
    F.cy(0, 1.0, 0, 0.3, 0.3, 0.06, dk, 'metal', 'y', 16);
    for (let k = -3; k <= 3; k++) {
      const a = k * 0.14;
      F.cb(Math.sin(a) * 1.565, 0.45, Math.cos(a) * 1.565, 0.18, 0.07, 0.03, c('eye'), 'glow', 0, a, 0);
    }
    IZ.numeral(F, -0.6, 0.72, 1.465, 'IV', 0.1);
    /* the sensor block at the front, two lamps, a handle */
    F.cy(1.2, 0.5, 1.0, 0.28, 0.28, 0.55, gun, 'metal', 'z', 14);
    F.cy(1.2, 0.5, 1.29, 0.3, 0.3, 0.05, steel, 'metal', 'z', 14);
    for (const y of [0.6, 0.4]) MP.lamp(F, 1.28, y, 1.32, 0, 0, 1, 0.07, 'amber', null);
    F.tube([[1.0, 0.25, 1.15], [1.0, 0.1, 1.3], [1.42, 0.1, 1.3], [1.42, 0.25, 1.15]], 0.025, iron, 'metal');
    F.cy(-1.2, 0.95, -0.35, 0.16, 0.16, 0.22, steel, 'paint', 'y', 12);
    /* the shoulder boxes: instrument cases with three bolt tubes each, on pivots so they aim */
    for (const s of [-1, 1]) {
      const B = s > 0 ? 'box_l' : 'box_r';
      R.bone(B, 'torso', s * 1.05, 1.05, -0.45);
      R.on(B);
      MP.joint(F, 0, 0, 0, 0.18, 0.36, 'x', iron, br);
      F.chb(s * 0.05, 0.38, 0.0, 0.5, 0.95, 1.25, 0.08, steel, 'paint', 'x');
      F.cb(s * 0.31, 0.38, 0.0, 0.02, 0.7, 1.0, or, 'paint');
      F.cb(s * 0.335, 0.38, 0.0, 0.02, 0.7, 0.06, cr, 'paint');
      for (let k = 0; k < 3; k++) {
        const y = 0.12 + k * 0.26;
        F.cy(s * 0.05, y, 0.6, 0.08, 0.08, 0.06, iron, 'metal', 'z', 10);
        F.cy(s * 0.05, y, 0.585, 0.055, 0.055, 0.04, c('woodDk'), 'wood', 'z', 8);
        R.point(B + '_m' + k, B, s * 0.05, y, 0.7);
      }
      F.cb(s * 0.05, 0.89, -0.2, 0.32, 0.06, 0.5, iron, 'metal');
    }
    IZ.feathers(F, R, 'fth', 'torso', -1.2, 0.3, 1.0, { n: 5, len: 0.5 });

    /* ---- arms: the long grab (left), the short clamp (right) */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 1.58, 0.4, 0.05, 0, 0, s * 0.1);
      R.on(A + '_sh');
      MP.joint(F, -s * 0.06, 0, 0, 0.24, 0.34, 'x', iron, br);
      F.cy(0, -0.5, 0, 0.2, 0.2, 0.9, steel, 'paint', 'y', 12);
      F.cy(0, -0.3, 0, 0.215, 0.215, 0.16, or, 'paint', 'y', 12);
      R.bone(A + '_el', A + '_sh', 0, -1.0, 0, -0.5, 0, 0);
      MP.hose(F, R, 'torso', [s * 1.35, 0.35, -0.45], A + '_sh', [0, -0.3, -0.2], 0.04, c('rubber'), 0.15);
    }
    R.on('arm_l_el');
    MP.joint(F, 0, 0, 0, 0.2, 0.42, 'x', iron, br);
    F.cy(0, -0.7, 0, 0.24, 0.24, 1.3, steel, 'paint', 'y', 14);
    F.cy(0, -0.25, 0, 0.255, 0.255, 0.12, or, 'paint', 'y', 14);
    F.cy(0, -1.15, 0, 0.255, 0.255, 0.1, cr, 'paint', 'y', 14);
    F.cb(0.25, -0.75, 0.0, 0.06, 0.5, 0.18, dk, 'metal');
    R.bone('arm_l_wr', 'arm_l_el', 0, -1.4, 0, 0.5, 0, 0);
    R.on('arm_l_wr');
    F.cy(0, -0.08, 0, 0.17, 0.2, 0.18, gun, 'metal', 'y', 12);
    for (const fd of [['grab_f0', 0.1, 0.1], ['grab_f1', -0.1, 0.1], ['grab_th', 0, -0.12]]) {
      const sg = fd[2] < 0 ? -1 : 1;
      R.bone(fd[0], 'arm_l_wr', fd[1], -0.18, fd[2], sg * 0.3, 0, 0);
      R.on(fd[0]);
      F.rod(0, 0, 0, 0, -0.28, sg * 0.04, 0.035, gun, 'metal');
      F.rod(0, -0.28, sg * 0.04, 0, -0.45, -sg * 0.06, 0.03, gun, 'metal');
      F.cy(0, -0.5, -sg * 0.08, 0.03, 0.004, 0.1, br, 'bronze', 'y', 5, Math.PI, 0, 0);
    }
    R.on('arm_r_el');
    MP.joint(F, 0, 0, 0, 0.2, 0.42, 'x', iron, br);
    F.chb(0, -0.38, 0.02, 0.4, 0.66, 0.42, 0.08, steel, 'paint', 'y');
    F.cb(0, -0.2, 0.02, 0.42, 0.1, 0.44, or, 'paint');
    F.cy(0, -0.78, 0.02, 0.15, 0.15, 0.2, iron, 'metal', 'y', 10);
    for (const k of [['clamp_a', 1], ['clamp_b', -1]]) {
      R.bone(k[0], 'arm_r_el', 0, -0.88, 0.02 + k[1] * 0.08);
      R.on(k[0]);
      F.prism(0, 0, 0, [[0, 0.03], [k[1] * 0.14, 0.03], [k[1] * 0.14, -0.42], [k[1] * 0.02, -0.46], [0, -0.38], [k[1] * 0.08, -0.36], [k[1] * 0.08, -0.04], [0, -0.03]].map(function (p) { return [p[0], p[1]]; }), 0.12, gun, 'metal', 'x');
    }
    R.point('clamp_pt', 'arm_r_el', 0, -1.25, 0.02);

    /* ---- legs: plated thighs, a knee shield, two long toes */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.58, -0.14, 0], L1: 1.15, L2: 1.15, knee: 1, ankleH: 0.42, rest: [s * 0.66, 0.05], phase: s > 0 ? 0 : 0.5, toe: 0.3 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.24, 0.44, 'x', iron, br);
      F.chb(0, -0.55, 0, 0.5, 0.95, 0.58, 0.12, steel, 'paint', 'y');
      F.cb(s * 0.27, -0.55, 0.05, 0.04, 0.55, 0.22, dk, 'metal');
      F.chb(0, -0.45, 0.3, 0.4, 0.6, 0.06, 0.03, or, 'paint', 'x');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.48, 'x', iron, br);
      F.prism(0, -0.2, 0.18, [[-0.15, 0.3], [0.2, 0.25], [0.28, -0.15], [0.05, -0.55], [-0.2, -0.3]], 0.62, lt, 'paint', 'x');
      F.chb(0, -0.62, 0, 0.42, 0.85, 0.5, 0.1, steel, 'paint', 'y');
      F.cy(s * 0.23, -0.15, 0.16, 0.1, 0.1, 0.04, c('teal'), 'paint', 'x', 10);
      MP.piston(F, R, Lg + '_hip', [0, -0.3, -0.3], Lg + '_knee', [0, -0.35, -0.28], 0.05, dk, c('chrome'));
      R.on(Lg + '_ankle');
      F.cy(0, -0.12, 0, 0.15, 0.2, 0.3, iron, 'metal', 'y', 10);
      for (const tx of [-0.12, 0.12]) F.prism(tx, -0.42 + 0.11, 0.25, [[-0.35, -0.11], [0.62, -0.11], [0.62, -0.06], [-0.2, 0.12], [-0.35, 0.12]], 0.16, lt, 'paint', 'x');
      F.prism(0, -0.42 + 0.1, -0.32, [[-0.3, -0.1], [0.15, -0.1], [0.15, 0.1], [-0.1, 0.1]], 0.2, dk, 'metal', 'x');
    }
  }
});
