/* ======================================================================
   Ancient machine: the porter (kits/mechs/krator-mechs-ancient-porter.js)

   KEEPER, 5 m to the hull's top: a four-legged carrier of the Hoist's lineage (the
   Iziz dug its cousins out of their own ruins), a cargo hull on splayed, high-kneed
   legs with a wedge of sensors at its front. Three dresses: the CRANE (a slewing boom
   on its back that lowers its hook over the kerb, loads nothing, and lifts), the
   PALLET (a bare deck with its rails and chocks and nothing on it, kneeling to be
   loaded) and the FEIGNER (the crane again; its lamp goes red, the wedge turns to you,
   and the boom comes round with the hook swung as a flail).
   ====================================================================== */
MECH({
  key: 'an_porter', name: 'Porter', culture: 'ancient',
  role: 'keeper: a carrier at its round, loading nothing', origin: 'Ancient walking carrier (the Hoist\'s lineage)',
  lore: 'A four-legged carrier that still walks its delivery round. The crane lowers its hook over the kerb, loads nothing and lifts; the pallet kneels for a load that never comes. Some of them are not porters.',
  feign: [2],
  tags: { class: 'mech', type: ['transport', 'utility'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, {}, { role: 'feigner', weapon: ['grapple'] }],
  variants: 3, variantNames: ['Crane', 'Pallet', 'Feigner'],
  w: 5.0, d: 6.2, h: 6.4,
  data: { height: 5.0, mass: 14, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a crane that loads nothing', lift: 3000,
    engine: 'Ancient cell pack, hydraulic', armour: 'cargo hull in white render' },
  variantData: [{}, { weapon: 'none: a bare pallet', height: 4.2 }, { weapon: 'the crane\'s hook swung as a flail', reach: 5.5 }],
  gait: { period: 2.0, duty: 0.74, stride: 1.2, lift: 0.36, bob: 0.04, sway: 0.05, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell']);
      if (st.by.crane) { P.b.crane = [0, 0.1 * Math.sin(t * 0.17) * w, 0]; P.b.boom = [0.03 * Math.sin(t * 0.29) * w, 0, 0]; }
    }
  },
  /* the routine (crane): it slews over the kerb, lowers the hook, the tines close on nothing, lifts and comes back */
  attack: {
    kind: 'load nothing', dur: 4.6,
    keys: [
      [0, {}],
      [0.9, { b: { crane: [0, 1.25, 0], boom: [0.3, 0, 0], head: [0.1, 0.5, 0] }, s: { body: [0, -0.06, 0] } }, 's'],
      [1.9, { b: { crane: [0, 1.3, 0], boom: [1.05, 0, 0], head: [0.25, 0.6, 0], tine_a: [-0.5, 0, 0], tine_b: [-0.5, 0, 0] }, s: { body: [0, -0.1, 0] } }, 's'],
      [2.3, { b: { crane: [0, 1.3, 0], boom: [1.05, 0, 0], head: [0.25, 0.6, 0], tine_a: [0.25, 0, 0], tine_b: [0.25, 0, 0] }, s: { body: [0, -0.1, 0] } }, 'o'],
      [3.3, { b: { crane: [0, 1.0, 0], boom: [0.1, 0, 0], head: [0.05, 0.3, 0], tine_a: [0.25, 0, 0], tine_b: [0.25, 0, 0] }, s: { body: [0, -0.05, 0] } }, 's'],
      [4.6, {}, 's']
    ],
    events: [{ t: 1.95, type: 'impact', at: 'grab_pt', r: 0.7 }]
  },
  variantAttack: [null,
    /* the pallet: it kneels for a load, looks about, and stands */
    { kind: 'kneel', dur: 3.6,
      keys: [
        [0, {}],
        [0.9, { b: { head: [0.3, 0, 0], body: [0.03, 0, 0] }, s: { body: [0, -0.55, 0] } }, 's'],
        [1.6, { b: { head: [0.1, 0.5, 0], body: [0.03, 0, 0] }, s: { body: [0, -0.6, 0] } }, 's'],
        [2.3, { b: { head: [0.1, -0.5, 0], body: [0.03, 0, 0] }, s: { body: [0, -0.6, 0] } }, 's'],
        [3.6, {}, 's']
      ],
      events: [{ t: 0.95, type: 'call', kind: 'chime', at: 'head_pt', dir: [0, 0, 1] }] },
    /* the feigner: the wedge tracks, the lamp goes red, the boom comes round low with the hook swung, and back */
    ANC.feign({
      kind: 'hook flail', dur: 3.4,
      keys: [
        [0, {}],
        [0.4, { b: { head: [0, 0.5, 0] } }, 's'],
        [0.62, { b: { head: [0.05, -0.15, 0] } }, 's'],
        [0.7, { b: { head: [0.05, -0.1, 0] } }, 'l'],
        [1.1, { b: { crane: [0, -1.4, 0], boom: [0.9, 0, 0], head: [0.1, 0, 0], body: [0, 0.08, 0] }, s: { body: [0, -0.1, 0] } }, 's'],
        [1.55, { b: { crane: [0, 1.5, 0], boom: [1.0, 0, 0], head: [0.1, 0, 0], body: [0, -0.1, 0] }, s: { body: [0, -0.14, 0] } }, 'i'],
        [1.9, { b: { crane: [0, 1.7, 0], boom: [0.9, 0, 0], head: [0.1, 0, 0], body: [0, -0.08, 0] }, s: { body: [0, -0.12, 0] } }, 'o'],
        [2.4, { b: { crane: [0, -1.2, 0], boom: [0.95, 0, 0], head: [0.1, 0, 0], body: [0, 0.08, 0] }, s: { body: [0, -0.12, 0] } }, 'i'],
        [3.4, {}, 's']
      ],
      events: [{ t: 1.52, type: 'impact', at: 'grab_pt', r: 1.6 }, { t: 2.37, type: 'impact', at: 'grab_pt', r: 1.6 }]
    }, 0.7)],

  build: function (F, R) {
    const c = F.col, v = F.variant;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the hull and its underframe */
    R.bone('body', null, 0, 3.1, 0);
    R.on('body');
    F.chb(0, 0, -0.1, 2.4, 1.0, 3.4, 0.25, ANC.work(F, 0.25), 'paint', 'z');
    F.chb(0, -0.6, -0.1, 1.8, 0.3, 3.0, 0.1, frd, 'metal', 'z');
    for (const s of [-1, 1]) {
      F.chb(s * 1.21, -0.1, -0.1, 0.06, 0.6, 2.6, 0.02, ANC.work(F, 0.5), 'paint', 'x');
      ANC.hazard(F, s * 1.246, -0.1, 0.4, 1.4, 0.18, 'yb', 0, s * Math.PI / 2, 0);
      ANC.streak(F, s * 0.6, 0.5, 1.62, 0.6, 0.06);
      F.chb(s * 1.16, -0.2, -1.3, 0.2, 0.5, 0.5, 0.05, fr, 'metal', 'x');
    }
    ANC.ladder(F, 1.24, 0.0, -1.0, 1, 0.4, 0.9, 5);
    ANC.plate(F, 0.0, 0.2, -1.81, 0.6, 0.3, 0, Math.PI, 0);
    F.cb(0, -0.78, 0.6, 1.2, 0.08, 1.2, ANC.soot(F), 'metal');
    ANC.beacon(F, -0.9, 0.5, 1.4, 0.08);

    /* ---- the sensor wedge at the front: a visor, two amber lamps, the tell on top */
    R.bone('head', 'body', 0, 0.1, 1.6);
    R.on('head');
    F.cy(0, -0.05, -0.1, 0.35, 0.4, 0.3, jt, 'metal', 'z', 12);
    F.prism(0, 0, 0.45, [[-0.7, -0.35], [0.7, -0.35], [0.75, 0.25], [0.45, 0.42], [-0.45, 0.42], [-0.75, 0.25]], 0.9, ANC.work(F, 0.3), 'paint', 'z');
    ANC.visor(F, 0, 0.16, 0.908, 1.1, 0.26);
    for (const s of [-1, 1]) ANC.visor(F, s * 0.73, 0.1, 0.45, 0.5, 0.2, 0, s * Math.PI / 2, 0);
    ANC.twinLamps(F, 0, -0.15, 0.905, 0.09, 0.9, 'amber', 0);
    F.cb(0, -0.32, 0.905, 1.3, 0.05, 0.03, fr, 'metal');
    ANC.hazard(F, 0, -0.32, 0.924, 1.2, 0.04, 'rw');
    R.point('head_pt', 'head', 0, 0, 1.0);
    ANC.tell(F, R, 'head', 0, 0.43, 0.3, 0, 1, 0.35, 0.06);

    if (v === 1) {
      /* ---- the pallet: a bare deck, four posts and rails, chocks */
      R.on('body');
      F.chb(0, 0.56, -0.2, 2.2, 0.12, 2.9, 0.03, ANC.wearDk(F, 0.4), 'paint', 'z');
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.cb(sx * 1.0, 0.95, -0.2 + sz * 1.35, 0.1, 0.7, 0.1, fr, 'metal');
      for (const sx of [-1, 1]) F.cb(sx * 1.0, 1.25, -0.2, 0.06, 0.06, 2.7, st, 'metal');
      for (const sz of [-1, 1]) F.cb(0, 1.25, -0.2 + sz * 1.35, 2.0, 0.06, 0.06, st, 'metal');
      for (let i = 0; i < 4; i++) F.cb(-0.75 + i * 0.5, 0.66, -0.2, 0.12, 0.08, 2.6, frd, 'metal');
      for (const sz of [-1, 1]) F.chb(0.3 * sz, 0.68, -0.2 + sz * 0.9, 0.4, 0.14, 0.2, 0.04, ANC.soot(F), 'paint', 'x');
    } else {
      /* ---- the crane: a slewing ring, the boom, its cable and hook */
      /* the counterweight behind the slewing ring */
      F.chb(0, 0.68, -1.45, 1.6, 0.5, 0.8, 0.08, ANC.work(F, 0.4), 'paint', 'x');
      ANC.hazard(F, 0, 0.68, -1.856, 1.3, 0.2, 'rw', 0, Math.PI, 0);
      R.bone('crane', 'body', 0, 0.5, -0.5);
      R.on('crane');
      F.cy(0, 0.06, 0, 0.55, 0.6, 0.14, jt, 'metal', 'y', 18);
      F.chb(0, 0.34, 0, 0.8, 0.42, 1.0, 0.1, ANC.work(F, 0.4), 'paint', 'z');
      R.bone('boom', 'crane', 0, 0.45, 0.25, -0.6, 0, 0);
      R.on('boom');
      MP.joint(F, 0, 0, 0, 0.17, 0.62, 'x', fr, null);
      const BL = 3.6;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) F.cb(sx * 0.17, sy * 0.15, BL / 2, 0.06, 0.06, BL, ANC.work(F, 0.5), 'metal');
      for (const sx of [-1, 1]) ANC.hazard(F, sx * 0.206, 0.15, 3.0, 0.7, 0.06, 'rw', 0, sx * Math.PI / 2, 0);
      for (let i = 0; i < 8; i++) {
        const z0 = i * BL / 8, z1 = (i + 1) * BL / 8;
        for (const sx of [-1, 1]) F.rod(sx * 0.17, -0.15, z0, sx * 0.17, 0.15, z1, 0.016, frd, 'metal');
        for (const sy of [-1, 1]) F.rod(-0.17, sy * 0.15, z0, 0.17, sy * 0.15, z1, 0.016, frd, 'metal');
      }
      F.chb(0, 0, 0.5, 0.42, 0.38, 0.8, 0.08, frd, 'metal', 'z');
      F.cy(0, 0, BL, 0.17, 0.17, 0.28, jt, 'metal', 'x', 12);
      MP.piston(F, R, 'crane', [0, 0.2, 0.5], 'boom', [0, -0.18, 1.3], 0.075, frd, c('chrome'));
      R.dangle('hook', 'boom', 0, -0.05, BL, { mode: 'hang', len: 1.5, k: 5, c: 0.9, wind: 0.01, max: 1.5 });
      R.on('hook');
      ANC.chain(F, 0, 0, 0, 1.1, 0.03);
      R.bone('grab', 'hook', 0, -1.15, 0);
      R.on('grab');
      F.chb(0, 0, 0, 0.36, 0.26, 0.26, 0.06, frd, 'metal', 'y');
      F.cy(0, 0.18, 0, 0.07, 0.07, 0.12, fr, 'metal', 'y', 8);
      R.point('grab_pt', 'grab', 0, -0.6, 0);
      for (const t of [['tine_a', 1], ['tine_b', -1]]) {
        R.bone(t[0], 'grab', 0, -0.1, t[1] * 0.12, 0, t[1] > 0 ? 0 : Math.PI, 0);
        R.on(t[0]);
        F.rod(0, 0, 0, 0, -0.3, 0.1, 0.04, fr, 'metal');
        F.rod(0, -0.3, 0.1, 0, -0.55, -0.02, 0.035, fr, 'metal');
        F.cy(0, -0.6, -0.06, 0.035, 0.004, 0.12, st, 'metal', 'y', 5, Math.PI + 0.4, 0, 0);
        MP.joint(F, 0, 0, 0, 0.045, 0.1, 'x', jt, null);
      }
    }

    /* ---- four splayed legs, knees high, claw feet; pistons and conduits */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.95, -0.45, sz * 1.1 - 0.1], L1: 1.5, L2: 1.6, knee: 1, splay: true, ankleH: 0.3,
        rest: [sx * 1.9, sz * 1.75 - 0.1], toe: 0.1, footYaw: 0.6 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.28, 0.28, 0.24, jt, 'metal', 'y', 12);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.26, 0.42, 'x', fr, null);
      F.chb(0, -0.75, 0, 0.42, 1.2, 0.46, 0.1, ANC.work(F, 0.4), 'paint', 'y');
      ANC.streak(F, 0.08, -0.3, 0.236, 0.5, 0.05);
      ANC.hazard(F, 0, -1.15, 0.236, 0.3, 0.12, 'yb');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.22, 0.44, 'x', fr, null);
      F.cy(0, -0.8, 0, 0.17, 0.12, 1.4, ANC.soot(F), 'metal', 'y', 12);
      F.chb(0, -0.3, 0.05, 0.34, 0.5, 0.38, 0.06, ANC.wear(F, 0.5), 'paint', 'y');
      MP.piston(F, R, n + '_hip', [0, -0.4, 0.28], n + '_knee', [0, -0.3, 0.22], 0.055, frd, c('chrome'));
      ANC.conduit(F, R, 'body', [sx * 0.75, -0.3, sz * 0.9 - 0.1], n + '_hip', [0, -0.6, -0.26], 0.06, 0.18, 8);
      R.on(n + '_ankle');
      MP.foot(F, { kind: 'claw', w: 0.55, l: 0.8, ankleH: 0.3, plate: ANC.soot(F), iron: frd, trim: st, toes: 3 });
    }
  }
});
