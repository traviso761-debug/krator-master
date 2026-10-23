/* ======================================================================
   Iziz mech: the Turris (kits/mechs/krator-mechs-iziz-turris.js)

   An Ancient walking works: a building of three storeys on four long legs, which once
   walked between the Ancients' quarries with its workshop, its crew's quarters and its
   cranes. Galleries run round each storey, hoist cables hang from its belly, a bridge
   sits on its roof. The legions made it a siege tower that walks: three ballistae on the
   balcony at its prow loose in turn, legionaries stand on the galleries, banners hang
   down its sides. It is the size of a house, so the walkers round it look like dogs.
   ====================================================================== */
/* a legionary standing on bone `name` (made here, a child of parent at (x, y, z), facing ry): a figure for scale */
function turrisMan(F, R, name, parent, x, y, z, ry, shield) {
  const c = F.col;
  R.bone(name, parent, x, y, z, 0, ry || 0, 0);
  R.on(name);
  for (const s of [-1, 1]) {
    F.cb(s * 0.1, 0.42, 0, 0.14, 0.76, 0.15, c('trousers'), 'cloth');
    F.cb(s * 0.1, 0.06, 0.04, 0.16, 0.12, 0.27, c('leather'), 'leather');
  }
  F.cy(0, 0.8, 0, 0.27, 0.21, 0.3, c('tunic'), 'cloth', 'y', 10);
  F.cb(0, 1.18, 0, 0.42, 0.5, 0.25, c('steel'), 'metal');
  for (const s of [-1, 1]) F.rod(s * 0.24, 1.4, 0, s * 0.27, 0.95, 0.06, 0.05, c('tunic'), 'cloth');
  F.cy(0, 1.48, 0, 0.05, 0.05, 0.08, c('skin'), 'skin', 'y', 8);
  F.sph(0, 1.6, 0.01, 0.1, 0.12, 0.11, c('skin'), 'skin', 10, 7);
  F.sph(0, 1.62, 0, 0.12, 0.11, 0.125, c('bronze'), 'bronze', 12, 6, 0, TAU, 0, Math.PI * 0.55);
  F.cb(0, 1.78, 0, 0.04, 0.1, 0.24, c('crimson'), 'hair');
  if (shield) F.cb(0.3, 0.95, 0.1, 0.06, 0.95, 0.62, c('crimson'), 'paint');
  else F.rod(0.3, 0.1, 0.1, 0.3, 2.2, 0.1, 0.022, c('woodDk'), 'wood');
}
MECH({
  key: 'iz_turris', name: 'Turris', culture: 'iziz',
  role: 'walking siege tower: three ballistae', origin: 'Ancient walking works',
  lore: 'A works of three storeys on four legs, that walked between the Ancients\' quarries. The legions walk it to a wall as a siege tower: three ballistae at its prow, legionaries on its galleries, banners down its sides.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'transport', 'heavy'], drive: 'quadruped', crew: 12, pilot: 'cab', weapon: ['ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Siege Works'],
  w: 8.6, d: 10.2, h: 16.8,
  data: { height: 13.2, mass: 160, crew: 12, pilot: 'cab', reach: 360, cargo: 20000, weapon: 'three ballistae on the prow balcony (1.6 m bolts)',
    engine: 'Ancient cell stack, hydraulic', armour: 'works hull' },
  gait: { period: 3.6, duty: 0.78, stride: 2.4, lift: 0.7, bob: 0.06, sway: 0.08, roll: 0.012, twist: 0.012, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.02, scan: 0, look: 0 },
  attack: (function () {
    const D = 0.62 * 1.6 - 0.12, T = [1.1, 1.5, 1.9];
    const st = function (n, kick, wound) {
      const k = { b: { body: [-0.02, 0, 0] }, s: { body: [0, -0.32, 0] }, sc: {} };
      for (let i = 0; i < 3; i++) k.b['bal' + i] = [-0.06, 0, 0];
      for (let i = 0; i < n; i++) {
        const B = 'bal' + i;
        k.b[B + '_bowL'] = [0, -0.4, 0]; k.b[B + '_bowR'] = [0, 0.4, 0]; k.s[B + '_nut'] = [0, 0, D]; k.sc[B + '_bolt'] = 0.0001;
      }
      if (wound) for (let i = 0; i < 3; i++) k.sc['bal' + i + '_bolt'] = 0.0001;
      if (kick != null) { k.b['bal' + kick] = [-0.13, 0, 0]; k.s.body = [0, -0.3, -0.08]; }
      return k;
    };
    const keys = [[0, {}], [0.8, st(0), 's']];
    T.forEach(function (t, i) { keys.push([t, st(i), 's'], [t + 0.04, st(i + 1, i), 'i'], [t + 0.24, st(i + 1), 'o']); });
    keys.push([3.2, st(3), 's'], [3.6, st(0, null, true), 's'], [3.62, st(0), 'l'], [4.4, {}, 's']);
    return { kind: 'prow ballistae', dur: 4.4, keys: keys,
      events: T.map(function (t, i) { return { t: t + 0.01, type: 'fire', kind: 'bolt', at: 'bal' + i + '_muzzle', dir: [0, 0, 1], speed: 60 }; }) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), lt = c('steelLt'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const amber = c('glassAmber'), woodDk = c('woodDk');
    const rail = function (pts, h) {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 1.1));
        F.rod(a[0], a[1] + h, a[2], b[0], b[1] + h, b[2], 0.035, iron, 'metal');
        F.rod(a[0], a[1] + h * 0.5, a[2], b[0], b[1] + h * 0.5, b[2], 0.022, iron, 'metal');
        for (let k = 0; k <= n; k++) {
          if (k === n && i < pts.length - 2) continue;
          const t = k / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t;
          F.rod(x, a[1], z, x, a[1] + h, z, 0.03, iron, 'metal');
        }
      }
    };

    /* ---- the lower storey: the hull, the belly, windows, livery */
    R.bone('body', null, 0, 8.4, 0);
    R.on('body');
    F.chb(0, 0, 0, 5.6, 2.2, 7.0, 0.3, steel, 'paint', 'z');
    F.chb(0, -1.35, 0, 4.4, 0.5, 5.6, 0.15, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.cb(s * 2.815, 0.6, 0, 0.03, 0.42, 6.1, or, 'paint');
      F.cb(s * 2.825, 0.33, 0, 0.03, 0.07, 6.1, cr, 'paint');
      for (let k = 0; k < 6; k++) F.cb(s * 2.815, -0.35, -2.6 + k * 1.04, 0.03, 0.36, 0.5, amber, 'glow');
      for (let k = 0; k < 3; k++) IZ.phalera(F, s * 2.84, 0.6, -2.2 + k * 2.2, s, 0, 0, 0.16);
    }
    F.chb(0, -0.2, 3.52, 2.0, 1.3, 0.06, 0.05, gun, 'metal', 'x');
    F.cb(0, -0.2, 3.56, 1.8, 0.05, 0.02, cr, 'paint');
    IZ.sun(F, 0, 0.62, 3.6, 0, 0, 1, 0.42);
    /* the prow balcony and its low parapet */
    F.cb(0, 1.0, 4.15, 5.2, 0.16, 1.3, gun, 'metal');
    for (const s of [-1, 1]) F.rod(s * 2.2, 0.92, 4.7, s * 1.4, -1.0, 3.48, 0.08, iron, 'metal');
    rail([[-2.6, 1.08, 3.5], [-2.6, 1.08, 4.78], [2.6, 1.08, 4.78], [2.6, 1.08, 3.5]], 0.5);
    /* the three ballistae on posts */
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 1.8;
      F.cy(x, 1.3, 3.95, 0.12, 0.16, 0.44, iron, 'metal', 'y', 10);
      MP.ballista(F, R, 'bal' + i, 'body', x, 1.66, 3.95, { len: 1.6, span: 0.75, h: 0.16, wood: woodDk, iron: iron, bronze: br, rope: c('rope'),
        skein: c('skein'), bolt: c('wood'), flight: c(i === 1 ? 'fGold' : 'fScarlet') });
      R.on('body');
    }
    /* the gallery round the second storey */
    rail([[-2.72, 1.1, 3.4], [-2.72, 1.1, -3.4], [2.72, 1.1, -3.4], [2.72, 1.1, 3.4]], 1.0);

    /* ---- the second storey */
    F.chb(0, 2.0, -0.3, 4.4, 1.8, 5.4, 0.2, lt, 'paint', 'z');
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) F.cb(s * 2.215, 2.05, -2.2 + k * 1.3, 0.03, 0.5, 0.7, amber, 'glow');
      F.cb(s * 2.215, 2.72, -0.3, 0.03, 0.18, 5.0, or, 'paint');
    }
    F.cb(0, 2.0, 2.415, 3.6, 0.6, 0.03, c('glass'), 'glass');
    for (const x of [-1.2, 0, 1.2]) F.cb(x, 2.0, 2.44, 0.06, 0.64, 0.05, iron, 'metal');
    F.chb(0, 2.92, -0.3, 4.6, 0.16, 5.6, 0.05, or, 'paint', 'z');
    rail([[-2.15, 3.0, 2.4], [-2.15, 3.0, -3.0], [2.15, 3.0, -3.0], [2.15, 3.0, 2.4], [-2.15, 3.0, 2.4]], 0.85);
    IZ.numeral(F, -1.5, 2.6, 2.42, 'X', 0.3);

    /* ---- the bridge on the roof, the stacks behind */
    F.chb(0, 3.7, 0.7, 2.8, 1.4, 2.4, 0.15, steel, 'paint', 'z');
    F.cb(0, 3.85, 1.905, 2.3, 0.45, 0.03, c('glass'), 'glass');
    for (const s of [-1, 1]) F.cb(s * 1.405, 3.85, 0.7, 0.03, 0.4, 1.6, c('glass'), 'glass');
    F.chb(0, 4.48, 0.7, 3.2, 0.16, 2.8, 0.06, or, 'paint', 'z');
    F.cb(0, 4.6, 0.7, 2.0, 0.08, 1.6, cr, 'paint');
    for (const s of [-1, 1]) {
      F.cy(s * 1.3, 3.9, -2.3, 0.22, 0.2, 1.8, c('copper'), 'copper', 'y', 12);
      F.cy(s * 1.3, 4.84, -2.3, 0.26, 0.26, 0.1, iron, 'metal', 'y', 12);
      MP.lamp(F, s * 1.0, 3.55, 1.93, 0, -0.1, 1, 0.12, 'head', gun);
    }

    /* ---- banners: a vexillum on the bridge, a long cloth down each side */
    IZ.vexillum(F, R, 'vex', 'body', 0, 4.56, -0.2, { h: 3.0, w: 1.1, bh: 1.3, paint: IZ.paint(F, 'legion', { numeral: 'X' }), finial: 'orb', discs: 2 });
    for (const s of [-1, 1]) {
      const n = s > 0 ? 'ban_l' : 'ban_r';
      R.on('body');
      F.cb(s * 2.86, 2.05, -1.2, 0.3, 0.08, 0.08, iron, 'metal');
      F.cy(s * 3.0, 2.0, -1.2, 0.03, 0.03, 1.5, c('wood'), 'wood', 'z', 6);
      R.dangle(n, 'body', s * 3.0, 1.98, -1.2, { mode: 'hang', len: 2.8, k: 30, c: 4, wind: 0.01, max: 0.08 });
      R.banner({ bone: n, kind: 'hang', x: 0, y: -0.02, z: 0, ry: s * Math.PI / 2, w: 1.35, h: 2.8, paint: IZ.paint(F, s > 0 ? 'sun' : 'stripes'), flutter: 0.02 });
    }

    /* ---- hoist cables hanging from the belly, hooks on the ends */
    const hangs = [[1.5, 2.2, 2.6], [-1.5, 2.2, 2.2], [1.4, -2.3, 2.9], [-1.4, -2.3, 2.4], [0.5, 0.2, 3.1], [-0.6, -0.6, 2.0]];
    hangs.forEach(function (h, i) {
      const n = 'hang' + i;
      R.dangle(n, 'body', h[0], -1.6, h[1], { mode: 'hang', len: h[2], k: 5, c: 1.1, wind: 0.02, max: 0.35 });
      R.on(n);
      F.rod(0, 0, 0, 0, -h[2], 0, i % 2 ? 0.035 : 0.025, i % 2 ? c('rubber') : iron, i % 2 ? 'rubber' : 'metal');
      F.cy(0, -h[2] - 0.08, 0, 0.07, 0.07, 0.16, iron, 'metal', 'y', 8);
      F.tor(0, -h[2] - 0.28, 0, 0.12, 0.03, gun, 'metal', 'z', 10, Math.PI * 1.4, 0, 0, Math.PI * 0.8);
    });
    R.on('body');
    for (let k = 0; k < 3; k++) F.cy(-1.2 + k * 1.2, -1.64, -0.4, 0.14, 0.14, 0.1, iron, 'metal', 'y', 10);

    /* ---- the crew on the galleries */
    [[2.4, 1.1, 0.8, Math.PI / 2, true], [-2.4, 1.1, -1.9, -Math.PI / 2, false], [2.3, 1.08, 4.2, 0.2, false], [0.1, 3.0, -1.7, -0.6, true],
      [-2.3, 1.08, 4.3, -0.3, true]].forEach(function (m, i) { turrisMan(F, R, 'man' + i, 'body', m[0], m[1], m[2], m[3], m[4]); });

    /* ---- four long legs: thick thighs, truss shins, three-taloned feet */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 2.55, -1.25, sz * 2.9], L1: 4.0, L2: 4.2, knee: sz > 0 ? -1 : 1, ankleH: 0.7,
        rest: [sx * 3.4, sz * 3.6], toe: 0.4 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.6, 0.9, 'x', iron, br);
      F.chb(0, -2.0, 0, 0.82, 3.3, 1.0, 0.2, steel, 'paint', 'y');
      F.cb(sx * 0.42, -1.9, 0, 0.03, 2.4, 0.5, or, 'paint');
      F.cb(sx * 0.43, -0.6, 0, 0.03, 0.1, 0.62, cr, 'paint');
      F.cb(-sx * 0.42, -2.0, 0, 0.03, 2.6, 0.3, dk, 'metal');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.5, 1.0, 'x', iron, br);
      F.chb(0, -0.9, 0, 0.7, 1.2, 0.8, 0.14, gun, 'metal', 'y');
      F.chb(0, -0.85, -sz * 0.43, 0.56, 0.9, 0.06, 0.04, or, 'paint', 'x');
      for (const s of [-1, 1]) F.rod(0, -1.4, s * 0.3, 0, -3.95, s * 0.16, 0.08, steel, 'paint');
      for (let k = 0; k < 4; k++) {
        const y0 = -1.5 - k * 0.62, y1 = y0 - 0.62, z0 = (k % 2 ? -1 : 1) * (0.29 - k * 0.032), z1 = -(k % 2 ? -1 : 1) * (0.29 - (k + 1) * 0.032);
        F.rod(0, y0, z0, 0, y1, z1, 0.04, dk, 'metal');
      }
      MP.joint(F, 0, -4.2, 0, 0.26, 0.5, 'x', iron, null);
      MP.piston(F, R, n + '_hip', [0, -0.8, sz * 0.55], n + '_knee', [0, -0.8, sz * 0.45], 0.1, dk, c('chrome'));
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'claw', w: 1.3, l: 2.0, ankleH: 0.7, plate: steel, iron: gun, trim: br, toes: 3 });
    }
  }
});
