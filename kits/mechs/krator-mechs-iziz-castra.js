/* ======================================================================
   Iziz mech: the Castra (kits/mechs/krator-mechs-iziz-castra.js)

   An Ancient cargo strider: a boxy hull high on four long legs (the fore knees bend
   back, the hind knees forward, so it folds like an elephant), the operator in a
   windowed cab at its front that turns like a head. The legions use it as a walking
   camp on the desert roads: a deck at the back under a striped Iziz awning, crates
   and water jars, a rope ladder, aerials with pennants, and a ballista on a turntable
   on the roof that shoots over the cab. It settles on its legs to shoot.
   Variant 1, the Supply Train, carries the legion's stores instead of a ballista: crates,
   sacks and amphorae under a net, panniers, javelins and waterskins; a legionary stands
   on the roof with a shofar, a ram's horn, and sounds it between the strider's steps.
   ====================================================================== */
/* the horn's centre line: from the mouthpiece (the origin) forward, sweeping up to the bell, twisting a little */
function castraHornPt(t) { const a = 1.7 * t; return [0.05 * Math.sin(Math.PI * t), 0.34 * (1 - Math.cos(a)), 0.34 * Math.sin(a) + 0.04 * t]; }
MECH({
  key: 'iz_castra', name: 'Castra', culture: 'iziz',
  role: 'walking camp: deck ballista', origin: 'Ancient cargo strider',
  lore: 'A cargo strider of the desert roads, now a camp on legs: a striped awning over the deck, water and stores, and a ballista on a turntable that shoots over the cab.',
  tags: { class: 'mech', type: ['war machine', 'transport', 'siege'], drive: 'quadruped', crew: 3, pilot: 'cab', weapon: ['ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 2, variantNames: ['Road Camp', 'Supply Train'],
  w: 3.6, d: 5.8, h: 7.8,
  data: { height: 6.2, mass: 26, crew: 3, pilot: 'cab', reach: 360, weapon: 'deck ballista on a turntable (1.4 m bolts)', cargo: 3000,
    engine: 'Ancient cell pack, hydraulic', armour: 'cargo hull' },
  variantData: [{}, { mass: 24, cargo: 6000, reach: 0, weapon: 'none: a shofar (signal horn) sounded from the roof', stores: 'grain, oil, water, javelins' }],
  gait: { period: 2.6, duty: 0.75, stride: 1.6, lift: 0.38, bob: 0.05, sway: 0.06, roll: 0.02, twist: 0.02, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.4 },
  anim: {
    idle: function (P, t, w, st) {
      if (st.variant !== 1) { P.b.turret = [0, 0.35 * Math.sin(t * 0.17) * w, 0]; return; }
      /* the hornblower sounds a call every nine seconds: raises the shofar, leans back, holds it, lowers it */
      const u = (t % 9) / 9, up = Math.min(1, Math.max(0, (u - 0.55) / 0.06)) * Math.min(1, Math.max(0, (0.9 - u) / 0.06));
      const e = up * up * (3 - 2 * up);
      P.b.blower_horn = [-1.15 * e * w, 0, 0]; P.b.blower_up = [-0.16 * e * w, 0.1 * Math.sin(t * 0.4) * (1 - e) * w, 0];
      P.b.blower_up_head = [(-0.25 * e + 0.08 * (1 - e)) * w, 0.4 * Math.sin(t * 0.31) * (1 - e) * w, 0];
    }
  },
  variantAttack: [null, {
    kind: 'horn call and stamp', dur: 3.2,
    keys: [
      [0, {}],
      [0.55, { b: { blower_horn: [-1.15, 0, 0], blower_up: [-0.12, 0, 0], blower_up_head: [-0.2, 0, 0] } }, 's'],
      [1.5, { b: { blower_horn: [-1.15, 0, 0], blower_up: [-0.2, 0, 0], blower_up_head: [-0.3, 0, 0], body: [-0.07, 0, 0] }, s: { body: [0, 0.14, -0.05] } }, 's'],
      [1.95, { b: { blower_horn: [-1.0, 0, 0], blower_up: [-0.1, 0, 0], body: [0.05, 0, 0] }, s: { body: [0, -0.24, 0.12] } }, 'i'],
      [2.3, { b: { blower_horn: [-0.5, 0, 0], body: [0.02, 0, 0] }, s: { body: [0, -0.12, 0.06] } }, 'o'],
      [3.2, {}, 's']
    ],
    events: [{ t: 0.6, type: 'call', at: 'horn_bell', dir: [0, 1, 0] }, { t: 1.97, type: 'impact', at: 'stamp', r: 2.5 }]
  }],
  attack: (function () {
    const D = 0.62 * 1.7 - 0.12;
    const aim = { b: { turret: [0, 0, 0], bal: [-0.07, 0, 0], body: [-0.03, 0, 0] }, s: { body: [0, -0.22, 0] } };
    const shot = JSON.parse(JSON.stringify(aim));
    shot.b.bal_bowL = [0, -0.4, 0]; shot.b.bal_bowR = [0, 0.4, 0]; shot.s.bal_nut = [0, 0, D]; shot.sc = { bal_bolt: 0.0001 };
    const kick = JSON.parse(JSON.stringify(shot)); kick.b.bal = [-0.12, 0, 0]; kick.s.body = [0, -0.2, -0.1];
    const wound = JSON.parse(JSON.stringify(aim)); wound.sc = { bal_bolt: 0.0001 };
    return { kind: 'deck ballista', dur: 3.4, keys: [[0, {}], [0.7, aim, 's'], [0.98, aim, 's'], [1.03, kick, 'i'], [1.3, shot, 'o'],
      [2.6, wound, 's'], [2.62, aim, 'l'], [3.4, {}, 's']],
      events: [{ t: 1.0, type: 'fire', kind: 'bolt', at: 'bal_muzzle', dir: [0, 0, 1], speed: 60 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const wood = c('wood'), woodDk = c('woodDk');

    /* ---- the hull */
    R.bone('body', null, 0, 3.55, 0);
    R.on('body');
    F.chb(0, 0.32, 0.15, 2.4, 1.35, 3.0, 0.22, steel, 'paint', 'z');
    F.chb(0, -0.48, 0.0, 1.9, 0.42, 3.2, 0.14, gun, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.cb(s * 1.21, 0.62, 0.3, 0.03, 0.42, 2.5, or, 'paint');
      F.cb(s * 1.225, 0.38, 0.3, 0.02, 0.06, 2.5, cr, 'paint');
      F.cb(s * 1.225, 0.31, 0.3, 0.02, 0.04, 2.5, c('teal'), 'paint');
      IZ.sun(F, s * 1.24, 0.62, 0.9, s, 0, 0, 0.26);
      for (let k = 0; k < 3; k++) IZ.phalera(F, s * 1.23, 0.62, -0.2 - k * 0.32, s, 0, 0, 0.09);
      F.chb(s * 1.21, 0.05, -0.75, 0.06, 0.5, 0.55, 0.04, dk, 'metal', 'x');
      for (let k = 0; k < 4; k++) F.cb(s * 1.25, -0.05 + k * 0.08, -0.75, 0.02, 0.03, 0.4, iron, 'metal');
      MP.barrel(F, s * 1.3, -0.15, 0.55, 0.2, 0.5, wood, iron, 'y');
    }
    /* the deck at the back: planks, rails, the awning on four poles (it stops short of the roof, where the
       turntable or the hornblower stands, so nothing on the roof reaches under it) */
    F.cb(0, 1.06, -0.9, 2.6, 0.1, 2.2, wood, 'wood');
    for (let k = 0; k < 9; k++) F.cb(0, 1.115, -1.9 + k * 0.25, 2.54, 0.015, 0.02, woodDk, 'wood');
    for (const s of [-1, 1]) {
      F.cb(s * 1.28, 1.45, -0.9, 0.05, 0.05, 2.2, woodDk, 'wood');
      for (let k = 0; k < 5; k++) F.cb(s * 1.28, 1.29, -1.95 + k * 0.52, 0.065, 0.36, 0.065, woodDk, 'wood');
    }
    for (const sx of [-1, 1]) for (const z of [-1.95, -0.25]) F.cb(sx * 1.22, 1.75, z, 0.06, 1.3, 0.06, woodDk, 'wood');
    const NS = 8;
    for (let k = 0; k < NS; k++) {
      const x = -1.3 + (k + 0.5) * 2.6 / NS;
      F.cb(x, 2.42, -1.1, 2.6 / NS, 0.03, 1.9, k % 2 ? cr : or, 'cloth', -0.1, 0, 0);
      F.cb(x, 2.27, -0.17, 2.6 / NS, 0.25, 0.02, k % 2 ? or : cr, 'cloth', 0.05, 0, 0);
    }
    const v = F.variant;
    if (v === 0) {
      MP.crate(F, 0.85, 1.125, -1.55, 0.6, 0.45, 0.5, wood, iron, 0.2);
      MP.crate(F, 0.85, 1.56, -1.55, 0.45, 0.35, 0.4, wood, iron, -0.1);
      MP.barrel(F, -0.85, 1.42, -1.6, 0.22, 0.6, wood, iron, 'y');
      MP.barrel(F, -0.4, 1.42, -1.7, 0.2, 0.55, woodDk, iron, 'y');
      MP.bundle(F, 0.0, 1.27, -1.8, 0.15, 1.2, c('canvas'), c('rope'), 'x');
      for (let k = 0; k < 3; k++) { F.sph(0.95 - k * 0.3, 1.27, -0.45, 0.13, 0.17, 0.13, c('canvas'), 'cloth', 8, 6); F.cy(0.95 - k * 0.3, 1.45, -0.45, 0.05, 0.06, 0.08, c('canvas'), 'cloth', 'y', 6); }
      /* the turntable on the roof, its ballista shooting over the cab */
      R.bone('turret', 'body', 0, 0.99, 0.85);
      R.on('turret');
      F.cy(0, 0.06, 0, 0.42, 0.45, 0.12, iron, 'metal', 'y', 16);
      F.cy(0, 0.5, 0, 0.14, 0.18, 0.8, gun, 'metal', 'y', 10);
      F.cb(0, 0.85, -0.1, 0.5, 0.08, 0.5, iron, 'metal');
      MP.ballista(F, R, 'bal', 'turret', 0, 1.05, 0.1, { len: 1.7, span: 0.95, h: 0.17, wood: woodDk, iron: iron, bronze: br, rope: c('rope'),
        skein: c('skein'), bolt: wood, flight: c('fScarlet') });
    } else {
      castraStores(F, R, v);
      castraHornblower(F, R);
    }
    /* ---- the cab: the head */
    R.bone('head', 'body', 0, 0.45, 1.75);
    R.on('head');
    F.cy(0, -0.2, -0.2, 0.35, 0.4, 0.2, iron, 'metal', 'y', 12);
    F.chb(0, 0.3, 0.25, 1.65, 1.5, 1.15, 0.22, steel, 'paint', 'z');
    F.chb(0, 1.1, 0.22, 1.7, 0.12, 1.2, 0.06, or, 'paint', 'x');
    F.cb(0, 0.62, 0.84, 1.3, 0.62, 0.03, c('glass'), 'glass', -0.12, 0, 0);
    for (const x of [-0.45, 0, 0.45]) F.cb(x, 0.62, 0.86, 0.05, 0.64, 0.05, iron, 'metal', -0.12, 0, 0);
    for (const s of [-1, 1]) F.cb(s * 0.83, 0.62, 0.35, 0.03, 0.5, 0.6, c('glass'), 'glass');
    F.cb(0, 0.98, 0.9, 1.6, 0.08, 0.2, dk, 'metal', 0.25, 0, 0);
    F.cb(0, -0.25, 0.85, 1.4, 0.2, 0.06, dk, 'metal');
    for (const s of [-1, 1]) MP.lamp(F, s * 0.55, -0.25, 0.9, 0, -0.05, 1, 0.09, 'head', gun);
    F.cb(0, -0.4, 0.36, 1.4, 0.06, 0.8, gun, 'metal');
    MP.pilot(F, R, 'head', 0, 0.0, 0.3, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: null });
    R.on('head');
    IZ.crest(F, 0, 1.16, -0.1, 1.0, 0.28, 'along');
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'head', s * 0.7, 1.16, -0.1, { mode: 'whip', len: 1.8, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.rod(0, 0, 0, 0, 1.8, 0, 0.013, iron, 'metal');
      F.knob(0, 1.8, 0, 0.03, c('lensRed'), 'lampTail');
      R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.7, z: 0, w: 0.9, h: 0.26, paint: s > 0 ? IZ.paint(F, 'stripes') : IZ.paint(F, 'teal') });
    }
    /* ---- the rope ladder, the standard */
    R.dangle('ladder', 'body', 1.33, 1.05, -0.45, { mode: 'hang', len: 2.3, k: 7, c: 1.2, wind: 0.02, max: 0.7 });
    R.on('ladder');
    for (const z of [-0.22, 0.22]) F.rod(0, 0, z, 0, -2.3, z, 0.015, c('rope'), 'rope');
    for (let k = 1; k <= 7; k++) F.cy(0, -k * 0.31, 0, 0.022, 0.022, 0.46, woodDk, 'wood', 'z', 5);
    IZ.vexillum(F, R, 'vex', 'body', -1.15, 1.12, -1.95, { h: 2.6, w: 0.75, bh: 0.85, finial: 'orb', paint: IZ.paint(F, 'legion', { numeral: 'VI' }), discs: 2 });
    IZ.feathers(F, R, 'fth_c', 'head', 0.85, 0.95, 0.75, { n: 5, len: 0.5 });

    /* ---- four long legs: the fore knees bend back, the hind forward */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 1.1, -0.5, sz * 1.25], L1: 1.65, L2: 1.6, knee: sz > 0 ? -1 : 1, ankleH: 0.45,
        rest: [sx * 1.2, sz * 1.35], toe: 0.15 });
      R.on(n + '_hip');
      MP.joint(F, sx * 0.05, 0, 0, 0.42, 0.42, 'x', gun, br);
      F.cy(sx * 0.3, 0, 0, 0.3, 0.3, 0.06, or, 'paint', 'x', 16);
      F.chb(0, -0.82, 0, 0.5, 1.35, 0.58, 0.12, steel, 'paint', 'y');
      F.chb(sx * 0.27, -0.75, 0, 0.05, 1.0, 0.4, 0.03, or, 'paint', 'y');
      F.cb(sx * 0.3, -0.75, 0, 0.02, 1.04, 0.06, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.32, 0.5, 'x', gun, br);
      F.cy(0, -0.78, 0, 0.17, 0.13, 1.35, dk, 'metal', 'y', 12);
      F.chb(0, -0.35, 0, 0.42, 0.55, 0.46, 0.08, steel, 'paint', 'y');
      for (const s2 of [-1, 1]) MP.piston(F, R, n + '_knee', [s2 * 0.2, -0.3, 0], n + '_ankle', [s2 * 0.18, 0.35, 0], 0.045, dk, c('chrome'));
      MP.piston(F, R, n + '_hip', [0, -0.4, -sz * 0.32], n + '_knee', [0, -0.45, -sz * 0.24], 0.07, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.9, -0.55, sz * 0.8], n + '_hip', [0, -0.5, -0.25], 0.055, c('rubber'), 0.15);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'pad', w: 0.85, l: 0.85, ankleH: 0.45, plate: steel, iron: gun, trim: br, toes: 4 });
    }
  }
});

/* ---- the Supply Train's stores: crates under a net, sacks, amphorae, javelins, panniers, waterskins */
function castraStores(F, R, v) {
  const c = F.col, wood = c('wood'), woodDk = c('woodDk'), iron = c('iron'), rope = c('rope'), canvas = c('canvas');
  const terra = 0xa85a32, wicker = 0x9a7a4a, y0 = 1.125;   /* on the plank lines, not flush with the deck */
  /* crates two high on the left, a net over them */
  MP.crate(F, -0.75, y0, -1.6, 0.6, 0.45, 0.5, wood, iron, 0.05);
  MP.crate(F, -0.75, y0, -1.0, 0.55, 0.5, 0.5, woodDk, iron, -0.06);
  MP.crate(F, -0.15, y0, -1.65, 0.5, 0.4, 0.45, wood, iron, 0.12);
  MP.crate(F, -0.75, y0 + 0.47, -1.55, 0.5, 0.38, 0.45, woodDk, iron, -0.1);
  MP.crate(F, -0.7, y0 + 0.52, -1.0, 0.45, 0.35, 0.42, wood, iron, 0.08);
  for (let k = 0; k < 5; k++) {
    const z = -1.85 + k * 0.25;
    F.rod(-1.1, y0 + 0.05, z, -0.4, y0 + 0.95, z + 0.45, 0.012, rope, 'rope');
    F.rod(-0.4, y0 + 0.05, z, -1.1, y0 + 0.95, z + 0.45, 0.012, rope, 'rope');
  }
  /* sacks on the right, two layers, each tied at the neck */
  for (let i = 0; i < 7; i++) {
    const row = i < 4, x = row ? 0.5 + (i % 2) * 0.42 : 0.7 + (i % 2) * 0.3, z = row ? -1.75 + Math.floor(i / 2) * 0.5 : -1.55 + (i - 4) * 0.35;
    const y = row ? y0 + 0.16 : y0 + 0.44, tilt = (F.rnd() - 0.5) * 0.4;
    F.sph(x, y, z, 0.2, 0.16, 0.26, [canvas, 0xa08a62, 0xc2ad84][i % 3], 'cloth', 10, 6, 0, TAU, 0, Math.PI, 0, tilt, 0);
    F.cy(x + Math.sin(tilt) * 0.27, y + 0.02, z + Math.cos(tilt) * 0.27, 0.04, 0.06, 0.1, canvas, 'cloth', 'z', 6, 0, tilt, 0);
  }
  /* amphorae in a rack at the front of the deck */
  F.cb(0.0, y0 + 0.3, -0.42, 2.0, 0.06, 0.06, woodDk, 'wood');
  for (let k = 0; k < 5; k++) {
    const x = -0.8 + k * 0.4;
    F.sph(x, y0 + 0.3, -0.42, 0.13, 0.26, 0.13, terra, 'cloth', 10, 7);
    F.cy(x, y0 + 0.6, -0.42, 0.055, 0.045, 0.14, terra, 'cloth', 'y', 8);
    F.cy(x, y0 + 0.69, -0.42, 0.065, 0.065, 0.04, F.shade(terra, -0.2), 'cloth', 'y', 8);
    for (const s of [-1, 1]) F.tor(x + s * 0.07, y0 + 0.56, -0.42, 0.05, 0.012, terra, 'cloth', 'z', 6, Math.PI);
    F.cy(x, y0 + 0.04, -0.42, 0.04, 0.012, 0.1, terra, 'cloth', 'y', 6);
  }
  /* a bundle of javelins along the right rail */
  for (let k = 0; k < 10; k++) {
    const dx = (k % 4) * 0.035, dy = Math.floor(k / 4) * 0.035;
    F.rod(1.12 + dx, y0 + 0.1 + dy, -1.95, 1.12 + dx, y0 + 0.16 + dy, -0.2, 0.012, wood, 'wood');
    F.cy(1.12 + dx, y0 + 0.16 + dy, -0.12, 0.016, 0.003, 0.16, iron, 'metal', 'z', 4);
  }
  for (const z of [-1.5, -0.7]) F.cy(1.17, y0 + 0.15, z, 0.1, 0.1, 0.04, rope, 'rope', 'z', 8);
  /* panniers down the hull sides, slung from the rail */
  for (const s of [-1, 1]) for (const z of [-1.35, -0.55]) {
    F.cy(s * 1.38, 0.55, z, 0.24, 0.2, 0.62, wicker, 'wood', 'y', 10);
    F.cy(s * 1.38, 0.87, z, 0.25, 0.25, 0.04, F.shade(wicker, -0.3), 'wood', 'y', 10);
    F.sph(s * 1.38, 0.88, z, 0.22, 0.1, 0.22, canvas, 'cloth', 8, 4, 0, TAU, 0, Math.PI / 2);
    for (const dz of [-0.12, 0.12]) F.rod(s * 1.36, 0.85, z + dz, s * 1.29, 1.45, z + dz, 0.012, rope, 'rope');
  }
  /* waterskins swinging from the back poles */
  for (const s of [-1, 1]) {
    const n = s > 0 ? 'skin_l' : 'skin_r';
    R.dangle(n, 'body', s * 1.28, 2.05, -1.95, { mode: 'hang', len: 0.55, k: 9, c: 1.4, wind: 0.02, max: 0.9 });
    R.on(n);
    F.rod(0, 0, 0, 0, -0.2, 0, 0.01, rope, 'rope');
    F.sph(0, -0.42, 0, 0.13, 0.22, 0.1, c('leather'), 'leather', 10, 7);
    F.cy(0, -0.2, 0, 0.03, 0.04, 0.06, c('leather'), 'leather', 'y', 6);
    R.on('body');
  }
}

/* ---- the hornblower on the roof: a legionary in a crimson cape with a shofar. Bones: blower (his feet), blower_up
   (from the waist), blower_up_head, blower_horn (shoulders, arms and horn: built raised to the lips, rested lowered) */
function castraHornblower(F, R) {
  const c = F.col, br = c('bronze'), tunic = c('tunic'), skin = c('skin'), leather = c('leather');
  R.bone('blower', 'body', 0, 0.99, 0.75);
  R.on('blower');
  F.cy(0, 0.04, 0, 0.42, 0.45, 0.08, c('iron'), 'metal', 'y', 14);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; F.rod(Math.cos(a) * 0.5, 0.08, Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.95, Math.sin(a) * 0.5, 0.02, br, 'bronze'); }
  F.tor(0, 0.95, 0, 0.5, 0.025, br, 'bronze', 'y', 16);
  for (const s of [-1, 1]) {
    F.cb(s * 0.1, 0.47, 0, 0.14, 0.76, 0.15, c('trousers'), 'cloth');
    F.cb(s * 0.1, 0.07, 0.04, 0.16, 0.13, 0.27, leather, 'leather');
  }
  F.cy(0, 0.82, 0, 0.27, 0.21, 0.3, tunic, 'cloth', 'y', 10);
  R.bone('blower_up', 'blower', 0, 0.95, 0);
  R.on('blower_up');
  F.cb(0, 0.26, 0, 0.4, 0.5, 0.24, tunic, 'cloth');
  for (let k = 0; k < 4; k++) F.cb(0, 0.12 + k * 0.1, 0.0, 0.43, 0.075, 0.27, k % 2 ? c('steel') : c('steelLt'), 'metal');
  F.cb(0, 0.03, 0, 0.44, 0.06, 0.28, leather, 'leather');
  F.cb(0, 0.5, 0, 0.52, 0.1, 0.27, c('steel'), 'metal');
  R.banner({ bone: 'blower_up', kind: 'hang', x: 0, y: 0.5, z: -0.15, w: 0.5, h: 0.82, paint: { field: c('crimson') }, flutter: 0.05 });
  R.bone('blower_up_head', 'blower_up', 0, 0.56, 0.0);
  R.on('blower_up_head');
  F.cy(0, 0.04, 0, 0.05, 0.05, 0.08, skin, 'skin', 'y', 8);
  F.sph(0, 0.16, 0.01, 0.1, 0.12, 0.11, skin, 'skin', 10, 7);
  F.sph(0, 0.18, 0, 0.12, 0.11, 0.125, br, 'bronze', 12, 6, 0, TAU, 0, Math.PI * 0.55);
  F.cb(0, 0.13, -0.11, 0.24, 0.04, 0.08, br, 'bronze', -0.5, 0, 0);
  for (const s of [-1, 1]) F.cb(s * 0.11, 0.1, 0.05, 0.02, 0.11, 0.08, br, 'bronze');
  IZ.crest(F, 0, 0.3, 0, 0.34, 0.13, 'across');
  /* the horn and the arms that hold it, drawn at the lips */
  R.bone('blower_horn', 'blower_up', 0, 0.45, 0.0, 1.15, 0, 0);
  R.on('blower_horn');
  const M = [0, 0.27, 0.12], N = 12, P = [];
  for (let i = 0; i <= N; i++) { const p = castraHornPt(i / N); P.push([M[0] + p[0], M[1] + p[1], M[2] + p[2]]); }
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N, r = 0.016 + 0.05 * Math.pow(t, 1.7), col = t < 0.22 ? 0x5a4630 : t < 0.3 ? 0x9a8462 : 0xd8c49a;
    F.rod(P[i][0], P[i][1], P[i][2], P[i + 1][0], P[i + 1][1], P[i + 1][2], r, col, 'bone');
    if (i) F.knob(P[i][0], P[i][1], P[i][2], r * 1.01, col, 'bone');
  }
  const e = P[N], d = [e[0] - P[N - 1][0], e[1] - P[N - 1][1], e[2] - P[N - 1][2]];
  F.taper(e[0], e[1], e[2], d[0], d[1], d[2], 0.066, 0.1, 0.07, 0xcbb489, 'bone', 12);
  R.point('horn_bell', 'blower_horn', e[0] + d[0], e[1] + d[1], e[2] + d[2]);
  const hands = [[0.07, 0.25, 0.22], [-0.02, P[5][1] - 0.04, P[5][2]]];
  for (const s of [-1, 1]) {
    const h = hands[s > 0 ? 0 : 1], sh = [s * 0.21, 0, 0], el = [s * 0.27, -0.06, 0.16];
    F.rod(sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.055, tunic, 'cloth');
    F.rod(el[0], el[1], el[2], h[0], h[1], h[2], 0.048, skin, 'skin');
    F.knob(h[0], h[1], h[2], 0.05, skin, 'skin');
  }
  R.point('stamp', 'body', 0, -3.55, 1.8);
}
