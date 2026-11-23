/* ======================================================================
   Ancient machine: the stilt tripod (kits/mechs/krator-mechs-ancient-tripod.js)

   HUNTER, 8.5 m to the hull: three stilt legs, short at the thigh and very long at the
   shin, so the knees stand level with the hull and the feet far out (the owner's
   reference: the tripod with the hooded head and the trailing feelers); a lozenge of
   a hull under a dorsal spine, a hooded sensor head at the prow, three feelers that
   trail under the belly, and a beam lance slung under the hull. It stalks the
   avenues with its head down; when it sees you it sounds, levels the lance, charges
   and fires.
   ====================================================================== */
MECH({
  key: 'an_tripod', name: 'Stilt Tripod', culture: 'ancient',
  role: 'hunter: a beam lance from three stilts', origin: 'Ancient security walker',
  lore: 'Three stilts under a hooded lozenge of a hull, feelers trailing from its belly and a lance slung under it. It sounds once, levels the lance, and fires.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'tripod', crew: 0, pilot: 'none', weapon: ['beam'], role: 'hunter',
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Stilt'],
  w: 7.6, d: 9.2, h: 8.7,
  data: { height: 8.5, mass: 9, crew: 0, pilot: 'none', reach: 120, weapon: 'a beam lance under the hull',
    engine: 'Ancient cell', armour: 'white composite over a dark frame' },
  gait: { period: 2.8, duty: 0.72, stride: 2.4, lift: 0.9, bob: 0.06, sway: 0.1, roll: 0.02, twist: 0.02, lean: 0.01,
    offsets: [0, 1 / 3, 2 / 3] },
  idle: { breathe: 0.04, scan: 0, look: 0.45 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['charge']);
      P.b.lance = [0.03 * Math.sin(t * 0.4) * w, 0.04 * Math.sin(t * 0.27) * w, 0];
    }
  },
  /* the attack: the head finds you, the horn, the lance levels and charges, the beam, the recoil */
  attack: ANC.reveal({
    kind: 'beam', dur: 3.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0.1, 0.35, 0] } }, 's'],
      [0.7, { b: { head: [0.15, -0.05, 0], body: [0.04, 0, 0] } }, 's'],
      [1.3, { b: { head: [0.2, 0, 0], body: [0.06, 0, 0], lance: [-0.3, 0, 0] }, s: { body: [0, -0.15, 0] } }, 's'],
      [1.88, { b: { head: [0.2, 0, 0], body: [0.07, 0, 0], lance: [-0.32, 0, 0] }, s: { body: [0, -0.18, 0] } }, 'l'],
      [1.95, { b: { head: [0.2, 0, 0], body: [-0.02, 0, 0], lance: [-0.4, 0, 0] }, s: { body: [0, -0.1, -0.25] } }, 'i'],
      [2.4, { b: { head: [0.1, 0, 0], lance: [-0.2, 0, 0] }, s: { body: [0, -0.06, -0.1] } }, 'o'],
      [3.2, {}, 's']
    ],
    events: [
      { t: 0.5, type: 'call', kind: 'horn', at: 'head_pt', dir: [0, 0, 1] },
      { t: 1.9, type: 'fire', kind: 'beam', at: 'lance_muzzle', dir: [0, 0, 1], speed: 160 }
    ]
  }, 'charge', 1.3, 2.1),

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the hull: a lozenge, a dorsal spine, the dark belly */
    R.bone('body', null, 0, 7.3, 0);
    R.on('body');
    F.sph(0, 0.1, 0.1, 1.15, 0.72, 1.95, ANC.wear(F, 0.2), 'paint', 22, 14);
    F.sph(0, -0.42, 0.0, 0.85, 0.5, 1.4, frd, 'metal', 18, 10);
    F.chb(0, 0.76, -0.3, 0.3, 0.3, 1.9, 0.06, ANC.wearDk(F, 0.4), 'paint', 'z');
    for (const s of [-1, 1]) {
      F.chb(s * 0.95, 0.25, -0.2, 0.5, 0.25, 1.6, 0.06, ANC.wearDk(F, 0.5), 'paint', 'z', 0, 0, s * 0.3);
      ANC.plate(F, s * 1.1, -0.05, 0.6, 0.4, 0.2, 0, s * 1.2, 0);
      ANC.streak(F, s * 0.5, 0.75, -1.4, 0.5, 0.06, 0);
    }
    for (let i = 0; i < 5; i++) F.cb(0, 0.86, -1.1 + i * 0.4, 0.5, 0.06, 0.1, fr, 'metal');
    F.cy(0, -0.1, -2.0, 0.35, 0.2, 0.5, frd, 'metal', 'z', 12);
    for (let i = 0; i < 3; i++) F.cy(0, -0.1, -2.1 - i * 0.12, 0.4 - i * 0.05, 0.4 - i * 0.05, 0.05, fr, 'metal', 'z', 12);

    /* ---- the head at the prow: a cowl over a sensor cluster, a dark throat */
    R.bone('head', 'body', 0, -0.05, 1.95, 0.25, 0, 0);
    R.on('head');
    F.cy(0, 0.1, -0.1, 0.4, 0.45, 0.3, jt, 'metal', 'z', 14);
    F.sph(0, 0.2, 0.35, 0.62, 0.5, 0.8, ANC.wear(F, 0.3), 'paint', 18, 8, 0, TAU, 0, 0.62 * Math.PI);
    F.sph(0, 0.05, 0.35, 0.45, 0.36, 0.6, frd, 'metal', 16, 10);
    ANC.lens(F, 0, 0.0, 0.92, 0, -0.1, 1, 0.11, 'cyan', jt);
    for (const s of [-1, 1]) ANC.lens(F, s * 0.3, -0.04, 0.8, s * 0.45, -0.1, 1, 0.07, 'amber', jt);
    ANC.eyes(F, 0, 0.05, 0.35, 0.47, 6, -0.35, 'cyan', 0.028, 0.5);
    R.point('head_pt', 'head', 0, 0, 1.0);

    /* ---- the feelers: three trailing under the belly, segmented, a hooked tip */
    const FE = [[0.45, -0.3], [-0.45, -0.3], [0, -0.95]];
    FE.forEach(function (p, i) {
      const n = 'feel' + i;
      R.dangle(n, 'body', p[0], -0.8, p[1], { mode: 'hang', len: 2.4 + i * 0.3, k: 7, c: 1.4, wind: 0.05, max: 0.9 });
      R.on(n);
      const L = 2.4 + i * 0.3;
      F.cy(0, -L / 2, 0, 0.045, 0.075, L, c('hoseDk'), 'rubber', 'y', 8);
      for (let k = 1; k < 6; k++) F.cy(0, -L * k / 6, 0, 0.08 - k * 0.006, 0.08 - k * 0.006, 0.06, fr, 'metal', 'y', 8);
      F.rod(0, -L, 0, 0, -L - 0.2, 0.12, 0.03, st, 'metal');
      F.knob(0, -L - 0.21, 0.13, 0.035, st, 'metal');
    });

    /* ---- the lance under the hull: a long barrel on a pitching mount, an emitter at its tip, the charge glow */
    R.bone('lance', 'body', 0, -0.62, 0.6, 0.3, 0, 0);
    R.on('lance');
    MP.joint(F, 0, 0, 0, 0.16, 0.5, 'x', fr, null);
    F.cy(0, 0, 1.5, 0.14, 0.1, 3.0, ANC.wear(F, 0.4), 'paint', 'z', 12);
    F.cy(0, 0, -0.5, 0.17, 0.14, 0.8, frd, 'metal', 'z', 12);
    for (let i = 0; i < 4; i++) F.cy(0, 0, 0.4 + i * 0.7, 0.16, 0.16, 0.08, fr, 'metal', 'z', 12);
    F.cy(0, 0, 3.1, 0.12, 0.2, 0.3, jt, 'metal', 'z', 12);
    F.cy(0, 0, 3.3, 0.2, 0.06, 0.16, frd, 'metal', 'z', 12);
    for (const s of [-1, 1]) F.cb(s * 0.12, 0.05, 2.2, 0.04, 0.12, 1.4, frd, 'metal');
    ANC.conduit(F, R, 'body', [0.3, -0.5, 0.2], 'lance', [0.1, 0.1, -0.7], 0.04, 0.1, 5);
    R.point('lance_muzzle', 'lance', 0, 0, 3.45);
    R.bone('charge', 'lance', 0, 0, 3.3);
    R.on('charge');
    F.knob(0, 0, 0.02, 0.14, c('cyan'), 'glow');

    /* ---- three stilts: a short thigh out and up, a long shin down, a splayed claw foot */
    const ANG = [0.95, -0.95, Math.PI], NM = ['leg_fl', 'leg_fr', 'leg_r'];
    for (let i = 0; i < 3; i++) {
      const a = ANG[i], n = NM[i], sx = Math.sin(a), sz = Math.cos(a);
      R.leg(n, { parent: 'body', hip: [sx * 0.85, -0.3, sz * 0.85], L1: 2.2, L2: 7.0, knee: 1, splay: true, ankleH: 0.35,
        rest: [sx * 3.4, sz * 3.4], toe: 0.06, footYaw: 0.7 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.36, 0.3, 0.4, jt, 'metal', 'y', 12);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.3, 0.5, 'x', fr, null);
      F.cy(0, -1.1, 0, 0.26, 0.3, 2.1, ANC.wear(F, 0.3), 'paint', 'y', 12);
      for (let k = 0; k < 3; k++) F.cy(0, -0.5 - k * 0.6, 0, 0.32, 0.32, 0.1, fr, 'metal', 'y', 12);
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.34, 0.56, 'x', fr, null);
      F.cy(0, -3.5, 0, 0.1, 0.23, 6.9, ANC.wear(F, 0.35), 'paint', 'y', 12);
      ANC.streak(F, 0.0, -0.7, 0.25, 1.1, 0.07);
      F.cy(0, -1.2, 0, 0.3, 0.27, 1.6, ANC.soot(F), 'metal', 'y', 12);
      const rs = function (y) { return 0.1 + 0.13 * (1 - (-y - 0.05) / 6.9); };
      for (let k = 0; k < 4; k++) { const y = -2.6 - k * 1.0; F.cy(0, y, 0, rs(y) + 0.035, rs(y) + 0.035, 0.12, frd, 'metal', 'y', 10); }
      MP.piston(F, R, n + '_hip', [0, -0.6, 0.3], n + '_knee', [0, -1.0, 0.28], 0.07, frd, c('chrome'));
      ANC.conduit(F, R, n + '_yaw', [0, -0.1, -0.3], n + '_knee', [0, -0.4, -0.3], 0.05, 0.15, 7);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.8, l: 1.3, ankleH: 0.35, plate: ANC.soot(F), iron: frd, trim: st, toes: 3 });
    }
  }
});
