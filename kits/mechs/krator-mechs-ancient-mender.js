/* ======================================================================
   Ancient machine: the mender (kits/mechs/krator-mechs-ancient-mender.js)

   KEEPER, 0.8 m: a six-legged maintenance bot, a domed yellow pod on splayed legs
   with a cluster of three lenses at its front and a welding arm folded over its
   back. It picks along the kerbs and the pipe runs, stops at a crack, brings the
   torch down and strikes an arc on nothing. The FEIGNER: the lamp on its dome goes
   red, the lenses find you, and the torch comes at your face.
   ====================================================================== */
MECH({
  key: 'an_mender', name: 'Mender', culture: 'ancient',
  role: 'keeper: welds cracks that will never close', origin: 'Ancient maintenance bot',
  lore: 'A six-legged yellow pod with a torch arm over its back, stopping at every crack to strike an arc on nothing. Some of them are not menders.',
  feign: [1],
  tags: { class: 'mech', type: ['utility', 'industrial'], drive: 'hexapod', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['lance'] }],
  variants: 2, variantNames: ['Mender', 'Feigner'],
  w: 1.4, d: 1.4, h: 1.0,
  data: { height: 0.8, mass: 0.05, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a welding torch',
    engine: 'Ancient cell', armour: 'work-yellow render pod' },
  variantData: [{}, { weapon: 'the welding torch, to the face', reach: 0.9 }],
  gait: { period: 0.8, duty: 0.55, stride: 0.3, lift: 0.1, bob: 0.01, sway: 0.01, roll: 0.01, twist: 0.02, lean: 0,
    offsets: [0, 0.5, 0.5, 0, 0, 0.5] },
  idle: { breathe: 0.008, scan: 0, look: 0.4 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell', 'arc']);
      P.b.arm_el = [0.1 * Math.sin(t * 0.5) * w, 0, 0];
    }
  },
  /* the routine: it stops, the torch comes down before it, the arc strikes and holds, the arm folds back */
  attack: ANC.reveal({
    kind: 'weld', dur: 2.8,
    keys: [
      [0, {}],
      [0.6, { b: { arm: [-1.6, 0, 0], arm_el: [-0.9, 0, 0], head: [0.2, 0, 0] }, s: { body: [0, -0.04, 0.02] } }, 's'],
      [1.0, { b: { arm: [-1.9, 0, 0], arm_el: [-0.6, 0, 0], head: [0.3, 0, 0] }, s: { body: [0, -0.05, 0.02] } }, 's'],
      [1.7, { b: { arm: [-1.9, 0.15, 0], arm_el: [-0.6, 0, 0], head: [0.3, 0.1, 0] }, s: { body: [0, -0.05, 0.02] } }, 'l'],
      [2.3, { b: { arm: [-0.6, 0, 0], arm_el: [-0.3, 0, 0] } }, 's'],
      [2.8, {}, 's']
    ],
    events: [{ t: 1.0, type: 'call', kind: 'arc', at: 'torch_pt', dir: [0, 0, 1] }]
  }, 'arc', 1.0, 1.7),
  /* the feigner: the lenses find you, the lamp goes red, it lunges with the torch lit */
  variantAttack: [null, ANC.reveal(ANC.feign({
    kind: 'torch', dur: 2.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.5, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.15, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.0, { b: { body: [-0.2, 0, 0], head: [0.2, 0, 0], arm: [-1.4, 0, 0], arm_el: [-1.2, 0, 0] }, s: { body: [0, 0.05, -0.08] } }, 's'],
      [1.25, { b: { body: [0.1, 0, 0], head: [0.1, 0, 0], arm: [-2.2, 0, 0], arm_el: [-0.3, 0, 0] }, s: { body: [0, -0.02, 0.45] } }, 'i'],
      [1.5, { b: { body: [0.05, 0, 0], arm: [-2.0, 0, 0], arm_el: [-0.4, 0, 0] }, s: { body: [0, -0.02, 0.4] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 1.26, type: 'impact', at: 'torch_pt', r: 0.4 }]
  }, 0.7), 'arc', 1.0)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the pod: a yellow dome, a dark underframe, hazard bands, a beacon */
    R.bone('body', null, 0, 0.42, 0);
    R.on('body');
    F.sph(0, 0.0, 0, 0.26, 0.17, 0.3, ANC.work(F, 0.25), 'paint', 16, 10, 0, TAU, 0, Math.PI / 2);
    F.cy(0, -0.05, 0, 0.26, 0.24, 0.1, frd, 'metal', 'y', 16);
    F.chb(0, -0.12, 0, 0.34, 0.06, 0.4, 0.02, fr, 'metal', 'z');
    ANC.hazard(F, 0, -0.04, 0.0, 0.3, 0.06, 'yb', 0, 0, 0, 0);
    ANC.plate(F, 0.26, -0.03, -0.06, 0.1, 0.05, 0, Math.PI / 2, 0);
    F.cy(0.12, 0.16, -0.12, 0.03, 0.025, 0.06, frd, 'metal', 'y', 8);
    ANC.tell(F, R, 'body', 0, 0.17, 0, 0, 1, 0, 0.025);
    /* ---- the lens cluster at the front */
    R.bone('head', 'body', 0, 0.02, 0.28);
    R.on('head');
    F.cy(0, 0, 0.0, 0.07, 0.08, 0.1, frd, 'metal', 'z', 10);
    ANC.lens(F, 0, 0.02, 0.056, 0, 0, 1, 0.025, 'cyan', null);
    for (const s of [-1, 1]) ANC.lens(F, s * 0.04, -0.025, 0.056, s * 0.2, 0, 1, 0.018, 'cyan', null);
    R.point('head_pt', 'head', 0, 0, 0.1);
    /* ---- the torch arm folded over the back: two segments, a nozzle, the arc glow (hidden) */
    R.bone('arm', 'body', 0, 0.1, -0.1, 2.3, 0, 0);
    R.on('arm');
    MP.joint(F, 0, 0, 0, 0.03, 0.06, 'x', jt, null);
    F.cy(0, -0.17, 0, 0.022, 0.026, 0.3, ANC.work(F, 0.4), 'paint', 'y', 8);
    R.bone('arm_el', 'arm', 0, -0.34, 0, -2.6, 0, 0);
    R.on('arm_el');
    MP.joint(F, 0, 0, 0, 0.025, 0.05, 'x', jt, null);
    F.cy(0, -0.16, 0, 0.018, 0.02, 0.28, fr, 'metal', 'y', 8);
    F.cy(0, -0.33, 0, 0.012, 0.022, 0.07, frd, 'metal', 'y', 8);
    ANC.conduit(F, R, 'body', [0.05, 0.08, -0.2], 'arm_el', [0.02, -0.1, 0.02], 0.007, 0.12, 5);
    R.point('torch_pt', 'arm_el', 0, -0.4, 0);
    R.bone('arc', 'arm_el', 0, -0.38, 0);
    R.on('arc');
    F.knob(0, 0, 0, 0.03, c('lensWarm'), 'glow');

    /* ---- six splayed legs: a knob at the hip, a short thigh, a thin shin, a pad */
    const ANG = [0.7, -0.7, 1.57, -1.57, 2.45, -2.45], NM = ['leg_fl', 'leg_fr', 'leg_ml', 'leg_mr', 'leg_rl', 'leg_rr'];
    for (let i = 0; i < 6; i++) {
      const a = ANG[i], n = NM[i], sx = Math.sin(a), sz = Math.cos(a);
      R.leg(n, { parent: 'body', hip: [sx * 0.24, -0.06, sz * 0.24], L1: 0.3, L2: 0.36, knee: 1, splay: true, ankleH: 0.04,
        rest: [sx * 0.56, sz * 0.56], toe: 0.03, footYaw: 0.7 });
      R.on(n + '_yaw');
      F.knob(0, 0, 0, 0.035, jt, 'metal');
      R.on(n + '_hip');
      F.cy(0, -0.15, 0, 0.02, 0.025, 0.28, ANC.work(F, 0.4), 'paint', 'y', 8);
      R.on(n + '_knee');
      F.knob(0, 0, 0, 0.028, fr, 'metal');
      F.rod(0, 0, 0, 0, -0.35, 0, 0.012, ANC.soot(F), 'metal');
      R.on(n + '_ankle');
      F.cy(0, -0.025, 0, 0.018, 0.025, 0.03, c('rubber'), 'rubber', 'y', 6);
    }
  }
});
