/* ======================================================================
   Ancient machine: the courier (kits/mechs/krator-mechs-ancient-courier.js)

   KEEPER, 1.3 m: a small service bot on two bird legs (the owner's reference: the
   little droid with the big-lensed box head and the two aerials): a box of a head
   with one large lens and one small, two whip aerials, a narrow pelvis, a satchel on
   its back whose lid still opens, wires down its legs. It trots its delivery round,
   stops at a door, cocks its head, chirps, opens the satchel on nothing and goes on.
   The FEIGNER: the lamp on its head goes red, the lens finds you, and it comes at you
   with the cutter it kept in the satchel.
   ====================================================================== */
MECH({
  key: 'an_courier', name: 'Courier', culture: 'ancient',
  role: 'keeper: a delivery bot at its round', origin: 'Ancient courier bot',
  lore: 'A small bot on two bird legs with a box head, a big lens and two aerials, trotting its delivery round and opening its satchel on nothing at every door. Some of them are not couriers.',
  feign: [1],
  tags: { class: 'mech', type: ['utility', 'scout'], drive: 'digitigrade', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['blade'] }],
  variants: 2, variantNames: ['Courier', 'Feigner'],
  w: 0.7, d: 0.75, h: 1.7,
  data: { height: 1.3, mass: 0.06, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a satchel',
    engine: 'Ancient cell', armour: 'none: a thin shell' },
  variantData: [{}, { weapon: 'a cutter from the satchel', reach: 0.8 }],
  gait: { period: 0.6, duty: 0.6, stride: 0.34, lift: 0.1, bob: 0.02, sway: 0.02, roll: 0.03, twist: 0.05, lean: 0.03,
    offsets: [0, 0.5] },
  idle: { breathe: 0.01, scan: 0, look: 0.6 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell', 'cutter']);
      P.b.head = [0.06 * Math.sin(t * 0.9) * w, 0, 0.12 * Math.sin(t * 0.37) * w];
    }
  },
  /* the routine: it stops at a door, cocks its head, chirps, the satchel opens on nothing */
  attack: ANC.reveal({
    kind: 'deliver', dur: 2.8,
    keys: [
      [0, {}],
      [0.5, { b: { head: [-0.1, 0.3, 0.35] }, s: { body: [0, -0.03, 0] } }, 's'],
      [1.0, { b: { head: [-0.1, -0.2, -0.3], lid: [-1.4, 0, 0] }, s: { body: [0, -0.05, 0] } }, 's'],
      [1.8, { b: { head: [-0.1, 0.1, 0.1], lid: [-1.4, 0, 0] }, s: { body: [0, -0.05, 0] } }, 's'],
      [2.3, { b: { lid: [-0.3, 0, 0] } }, 's'],
      [2.8, {}, 's']
    ],
    events: [{ t: 0.55, type: 'call', kind: 'chirp', at: 'lens_pt', dir: [0, 0, 1] }]
  }, 'cutter', 99),
  /* the feigner: the lens finds you, the lamp goes red, the satchel opens and the cutter comes out, it darts */
  variantAttack: [null, ANC.reveal(ANC.feign({
    kind: 'cutter', dur: 2.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.5, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.15, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.0, { b: { head: [0.2, 0, 0], body: [-0.1, 0, 0], lid: [-1.6, 0, 0], arm: [-2.4, 0, 0] }, s: { body: [0, 0.03, -0.1] } }, 's'],
      [1.25, { b: { head: [0.1, 0, 0], body: [0.15, 0, 0], lid: [-1.6, 0, 0], arm: [-2.9, 0, 0] }, s: { body: [0, -0.08, 0.5] } }, 'i'],
      [1.5, { b: { body: [0.05, 0, 0], lid: [-1.2, 0, 0], arm: [-2.6, 0, 0] }, s: { body: [0, -0.06, 0.45] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 1.26, type: 'impact', at: 'cutter_pt', r: 0.5 }]
  }, 0.7), 'cutter', 0.95)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the pelvis and the satchel on its back */
    R.bone('body', null, 0, 0.68, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.3, 0.16, 0.24, 0.04, fr, 'metal', 'x');
    F.cy(0, 0.1, 0.0, 0.04, 0.05, 0.08, jt, 'metal', 'y', 8);
    F.chb(0, 0.02, -0.2, 0.26, 0.2, 0.14, 0.03, ANC.work(F, 0.5), 'paint', 'x');
    ANC.hazard(F, 0, -0.02, -0.276, 0.2, 0.05, 'yb', 0, Math.PI, 0);
    R.bone('lid', 'body', 0, 0.12, -0.13);
    R.on('lid');
    F.chb(0, 0.012, -0.08, 0.27, 0.024, 0.16, 0.01, ANC.work(F, 0.5), 'paint', 'x');
    /* the cutter arm folded in the satchel (hidden; the feigner's) */
    R.bone('arm', 'body', 0, 0.06, -0.2, 2.6, 0, 0);
    R.on('arm');
    R.bone('cutter', 'arm', 0, 0, 0);
    R.on('cutter');
    F.rod(0, 0, 0, 0, -0.3, 0, 0.012, fr, 'metal');
    F.cb(0, -0.38, 0, 0.012, 0.16, 0.05, st, 'metal');
    R.point('cutter_pt', 'cutter', 0, -0.42, 0);

    /* ---- the head: a box with a big lens and a small one, a dark band, two aerials, the tell on top */
    R.bone('head', 'body', 0, 0.16, 0.04);
    R.on('head');
    F.cy(0, 0.02, 0, 0.035, 0.045, 0.06, jt, 'metal', 'y', 8);
    F.chb(0, 0.17, 0.0, 0.5, 0.24, 0.34, 0.04, ANC.wear(F, 0.2), 'paint', 'x');
    F.cb(0, 0.12, 0.172, 0.46, 0.05, 0.012, frd, 'metal');
    F.cb(-0.1, 0.21, 0.172, 0.14, 0.06, 0.012, c('hazardRed'), 'paint');
    F.cy(0.12, 0.18, 0.1, 0.1, 0.11, 0.18, frd, 'metal', 'z', 14);
    ANC.lens(F, 0.12, 0.18, 0.196, 0, 0, 1, 0.08, 'cyan', null);
    ANC.lens(F, -0.14, 0.14, 0.19, 0, 0, 1, 0.035, 'amber', frd);
    F.cb(0.12, 0.3, 0.0, 0.2, 0.012, 0.3, ANC.wearDk(F, 0.4), 'paint');
    ANC.plate(F, 0.18, 0.1, -0.176, 0.14, 0.1, 0, Math.PI, 0);
    for (const s of [-1, 1]) ANC.aerial(F, R, s > 0 ? 'ant_l' : 'ant_r', 'head', s * 0.17, 0.29, -0.1, 0.45, -0.15);
    R.point('lens_pt', 'head', 0.12, 0.18, 0.24);
    ANC.tell(F, R, 'head', -0.1, 0.3, 0.05, 0, 1, 0, 0.025);

    /* ---- the legs: bird-jointed, thin, wires down them */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.16, -0.04, 0], L1: 0.36, L2: 0.36, knee: -1, ankleH: 0.07, rest: [s * 0.18, 0.0], phase: s > 0 ? 0 : 0.5, toe: 0.2 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.045, 0.08, 'x', jt, null);
      F.chb(0, -0.18, 0, 0.07, 0.32, 0.1, 0.02, ANC.wear(F, 0.35), 'paint', 'y');
      F.cb(s * 0.04, -0.14, 0.0, 0.012, 0.16, 0.04, c('hazardRed'), 'paint');
      R.on(Lg + '_knee');
      F.knob(0, 0, 0, 0.035, fr, 'metal');
      F.rod(0, 0, 0, 0, -0.34, 0, 0.02, ANC.soot(F), 'metal');
      ANC.conduit(F, R, Lg + '_hip', [s * 0.02, -0.25, -0.05], Lg + '_knee', [s * 0.02, -0.2, -0.04], 0.008, 0.15, 4);
      R.on(Lg + '_ankle');
      F.cy(0, -0.02, 0, 0.03, 0.035, 0.05, jt, 'metal', 'y', 8);
      F.chb(0, -0.055, 0.05, 0.09, 0.03, 0.22, 0.01, frd, 'metal', 'z');
      F.chb(0, -0.055, -0.08, 0.04, 0.026, 0.06, 0.008, frd, 'metal', 'z');
    }
  }
});
