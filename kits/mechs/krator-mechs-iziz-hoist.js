/* ======================================================================
   Iziz mech: the Hoist (kits/mechs/krator-mechs-iziz-hoist.js)

   An Ancient walking crane from the railway cuttings: a cargo hull on four splayed,
   high-kneed legs, the operator in a cab wrapped in a cage of tube at its front, two
   round lamps for eyes, a slewing crane on its back with a four-tined grapple on a
   cable. A rigger rides on top among the packs. In a fight it swings the grapple up
   and brings it down on a wall or a knot of men, and the tines close on what is left.
   ====================================================================== */
MECH({
  key: 'iz_hoist', name: 'Hoist', culture: 'iziz',
  role: 'siege crane: grapple', origin: 'Ancient walking crane',
  lore: 'It laid rails in the cuttings. Now it brings its grapple down on walls and shields; a rigger rides on top among the packs and calls the swing.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'utility'], drive: 'quadruped', crew: 2, pilot: 'cab', weapon: ['grapple'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Rail Crane'],
  w: 5.2, d: 7.2, h: 7.0,
  data: { height: 4.6, mass: 21, crew: 2, pilot: 'cab', reach: 5.5, weapon: 'slewing crane with a four-tined grapple', lift: 4000,
    engine: 'Ancient cell pack, hydraulic', armour: 'cargo hull and tube cage' },
  gait: { period: 2.3, duty: 0.74, stride: 1.3, lift: 0.42, bob: 0.04, sway: 0.05, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w) { P.b.crane = [0, 0.18 * Math.sin(t * 0.15) * w, 0]; P.b.boom = [0.04 * Math.sin(t * 0.33) * w, 0, 0]; }
  },
  attack: (function () {
    const open = { tine0: [-0.65, 0, 0], tine1: [-0.65, 0, 0], tine2: [-0.65, 0, 0], tine3: [-0.65, 0, 0] };
    const shut = { tine0: [0.3, 0, 0], tine1: [0.3, 0, 0], tine2: [0.3, 0, 0], tine3: [0.3, 0, 0] };
    const k = function (boom, tines, extra) { return { b: Object.assign({ boom: [boom, 0, 0], crane: [0, 0, 0] }, tines, extra || {}), s: { body: [0, -0.08, 0] } }; };
    return { kind: 'grapple smash', dur: 3.4, keys: [[0, {}], [0.85, k(-0.4, open, { body: [-0.04, 0, 0] }), 's'], [1.3, k(0.95, open, { body: [0.06, 0, 0] }), 'i'],
      [1.5, k(0.9, shut, { body: [0.05, 0, 0] }), 'o'], [2.3, k(0.0, shut), 's'], [3.4, {}, 's']],
      events: [{ t: 1.48, type: 'impact', at: 'grab_pt', r: 1.8 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze'), tl = c('teal');

    /* ---- the hull and its packs */
    R.bone('body', null, 0, 2.85, 0);
    R.on('body');
    F.chb(0, 0.2, -0.35, 2.2, 1.3, 2.9, 0.3, steel, 'paint', 'z');
    F.chb(0, -0.5, -0.25, 1.7, 0.35, 2.6, 0.12, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.cb(s * 1.11, 0.42, -0.4, 0.03, 0.5, 2.3, or, 'paint');
      F.cb(s * 1.125, 0.14, -0.4, 0.02, 0.06, 2.3, cr, 'paint');
      IZ.sun(F, s * 1.14, 0.42, -0.95, s, 0, 0, 0.25);
      F.chb(s * 1.12, -0.05, 0.4, 0.06, 0.45, 0.5, 0.04, dk, 'metal', 'x');
    }
    MP.bundle(F, 0.55, 0.98, -1.4, 0.2, 0.9, c('canvas'), c('rope'), 'z');
    MP.bundle(F, -0.6, 0.95, -1.5, 0.17, 0.7, c('leather'), c('rope'), 'z');
    MP.barrel(F, 0.75, 1.05, -0.4, 0.2, 0.5, c('wood'), iron, 'y');
    MP.barrel(F, -0.75, 1.05, -0.6, 0.2, 0.5, c('woodDk'), iron, 'y');
    MP.crate(F, -0.55, 0.85, -1.05, 0.55, 0.35, 0.45, c('wood'), iron, 0.15);
    F.cy(0, 0.96, -1.85, 0.22, 0.22, 1.6, c('canvas'), 'cloth', 'x', 10);
    /* the rigger on top */
    F.cb(0, 0.9, -0.95, 0.5, 0.1, 0.45, c('leather'), 'leather');
    MP.pilot(F, R, 'body', 0, 0.95, -0.95, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson'), lean: 0.05 });
    R.on('body');
    /* ---- the cab: a cage of tube round it, lamp eyes, the operator */
    R.bone('head', 'body', 0, 0.12, 1.2);
    R.on('head');
    F.cy(0, -0.05, -0.26, 0.4, 0.45, 0.24, iron, 'metal', 'z', 12);
    F.chb(0, 0.05, 0.35, 1.7, 1.45, 1.1, 0.3, steel, 'paint', 'z');
    F.cb(0, 0.38, 0.91, 1.15, 0.42, 0.03, c('glass'), 'glass');
    for (const s of [-1, 1]) F.cb(s * 0.86, 0.35, 0.35, 0.03, 0.4, 0.62, c('glass'), 'glass');
    F.cb(0, 0.6, 0.93, 1.3, 0.06, 0.06, gun, 'metal');
    F.cb(0, 0.1, 0.93, 1.3, 0.06, 0.06, gun, 'metal');
    for (const s of [-1, 1]) {
      MP.lamp(F, s * 0.5, -0.25, 0.92, 0, 0, 1, 0.15, 'amber', gun);
      MP.lamp(F, s * 0.72, 0.0, 0.9, s * 0.2, 0, 1, 0.06, 'head', gun);
    }
    IZ.sun(F, 0, -0.32, 0.94, 0, 0, 1, 0.2);
    F.cb(0, -0.54, 0.6, 1.4, 0.12, 0.6, dk, 'metal');
    F.cb(0, -0.6, 0.35, 1.2, 0.04, 0.6, gun, 'metal');
    MP.pilot(F, R, 'head', 0, -0.52, 0.32, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: null });
    R.on('head');
    MP.cage(F, 0, 0.05, 0.25, 1.08, 0.95, 0.95, Math.PI / 2 - 1.25, 2.5, 0.35, 2.2, 5, 4, 0.035, tl, 'paint');
    IZ.phalerae(F, -0.72, 0.62, 0.92, 0, 0, 1, 2, 0.2, 0.07);
    IZ.feathers(F, R, 'fth_cab', 'head', 0.95, 0.55, 0.6, { n: 5, len: 0.55 });
    /* ---- the crane: slewing base, boom, cable, grapple */
    R.bone('crane', 'body', 0, 0.85, -0.45);
    R.on('crane');
    F.cy(0, 0.05, 0, 0.62, 0.66, 0.14, iron, 'metal', 'y', 18);
    F.chb(0, 0.32, 0, 0.9, 0.42, 1.1, 0.12, dk, 'metal', 'z');
    F.cb(0, 0.32, 0, 0.92, 0.1, 1.12, or, 'paint');
    R.bone('boom', 'crane', 0, 0.45, 0.2, -0.62, 0, 0);
    R.on('boom');
    MP.joint(F, 0, 0, 0, 0.18, 0.7, 'x', iron, br);
    const BL = 4.3;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) F.cb(sx * 0.2, sy * 0.17, BL / 2, 0.07, 0.07, BL, steel, 'metal');
    for (let i = 0; i < 9; i++) {
      const z0 = i * BL / 9, z1 = (i + 1) * BL / 9;
      for (const sx of [-1, 1]) F.rod(sx * 0.2, -0.17, z0, sx * 0.2, 0.17, z1, 0.018, dk, 'metal');
      for (const sy of [-1, 1]) F.rod(-0.2, sy * 0.17, z0, 0.2, sy * 0.17, z1, 0.018, dk, 'metal');
    }
    F.cb(0, 0.0, 0.5, 0.46, 0.4, 0.9, or, 'paint');
    F.cb(0, 0.0, 2.7, 0.44, 0.1, 0.6, or, 'paint');
    F.cy(0, 0.0, BL, 0.2, 0.2, 0.3, iron, 'metal', 'x', 14);
    F.cy(0, 0.0, BL, 0.21, 0.21, 0.1, br, 'bronze', 'x', 14);
    MP.piston(F, R, 'crane', [0, 0.25, 0.48], 'boom', [0, -0.2, 1.4], 0.085, dk, c('chrome'));
    IZ.feathers(F, R, 'fth_boom', 'boom', 0.25, -0.2, BL - 0.25, { n: 6, len: 0.6, cols: ['fScarlet', 'fGold', 'fTeal', 'fBlack'] });
    R.dangle('hook', 'boom', 0, -0.05, BL, { mode: 'hang', len: 1.9, k: 5, c: 0.9, wind: 0.01, max: 1.5 });
    R.on('hook');
    F.rod(0, 0, 0, 0, -1.45, 0, 0.022, c('rope'), 'rope');
    R.bone('grab', 'hook', 0, -1.5, 0);
    R.on('grab');
    F.chb(0, 0, 0, 0.42, 0.3, 0.42, 0.08, gun, 'metal', 'y');
    F.cy(0, 0.2, 0, 0.08, 0.08, 0.14, br, 'bronze', 'y', 8);
    F.cb(0, 0, 0, 0.44, 0.08, 0.44, or, 'paint');
    R.point('grab_pt', 'grab', 0, -0.7, 0);
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4, T = 'tine' + k;
      R.bone(T, 'grab', Math.sin(a) * 0.18, -0.12, Math.cos(a) * 0.18, 0, a, 0);
      R.on(T);
      F.rod(0, 0, 0, 0, -0.35, 0.12, 0.045, iron, 'metal');
      F.rod(0, -0.35, 0.12, 0, -0.68, -0.05, 0.04, iron, 'metal');
      F.cy(0, -0.74, -0.1, 0.04, 0.004, 0.14, br, 'bronze', 'y', 5, Math.PI + 0.5, 0, 0);
      MP.joint(F, 0, 0, 0, 0.05, 0.12, 'x', iron, null);
    }

    /* ---- four splayed legs, knees high */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 1.0, -0.42, sz * 1.15 - 0.2], L1: 1.4, L2: 1.65, knee: 1, splay: true, ankleH: 0.32,
        rest: [sx * 2.0, sz * 1.95 - 0.2], toe: 0.1, footYaw: 0.6 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.3, 0.3, 0.26, iron, 'metal', 'y', 12);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.28, 0.44, 'x', gun, br);
      F.chb(0, -0.68, 0, 0.44, 1.15, 0.5, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.68, 0.26, 0.36, 0.95, 0.05, 0.03, or, 'paint', 'x');
      F.cb(0, -0.68, 0.29, 0.06, 0.95, 0.02, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.24, 0.46, 'x', gun, br);
      F.cy(0, -0.8, 0, 0.18, 0.13, 1.45, dk, 'metal', 'y', 12);
      F.chb(0, -0.3, 0.05, 0.36, 0.5, 0.4, 0.06, steel, 'paint', 'y');
      MP.piston(F, R, n + '_hip', [0, -0.4, 0.3], n + '_knee', [0, -0.3, 0.22], 0.06, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.8, -0.3, sz * 0.9 - 0.2], n + '_hip', [0, -0.55, -0.28], 0.08, c('rubber'), 0.18, 8);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.6, l: 0.85, ankleH: 0.32, plate: dk, iron: gun, trim: br, toes: 3 });
    }
    IZ.vexillum(F, R, 'vex', 'body', -0.85, 0.85, -1.75, { h: 2.4, w: 0.7, bh: 0.8, finial: 'sun', paint: IZ.paint(F, 'legion', { numeral: 'IV' }), discs: 2 });
  }
});
