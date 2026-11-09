/* ======================================================================
   Ancient machine: the gardener (kits/mechs/krator-mechs-ancient-gardener.js)

   KEEPER, 2.4 m: a spidery pruner, a small pod on four high-kneed splayed legs with a
   sensor dome at its front, a pair of arms under the dome, the right ending in shears
   and the left in a three-fingered hand that holds the branch. It picks its way along
   the planters and the feral forest's edge and snips at what has long outgrown it.
   The FEIGNER: the dome's lamp goes red, the dome turns, it drops and lunges, and the
   shears close on you.
   ====================================================================== */
MECH({
  key: 'an_gardener', name: 'Gardener', culture: 'ancient',
  role: 'keeper: prunes a forest that has outgrown it', origin: 'Ancient park-service pruner',
  lore: 'A spidery pruner on four high knees, shears on one arm and a hand on the other, snipping along planters that are a forest now. Some of them are not gardeners.',
  feign: [1],
  tags: { class: 'mech', type: ['utility'], drive: 'quadruped', crew: 0, pilot: 'none', weapon: ['shears'], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['shears'] }],
  variants: 2, variantNames: ['Gardener', 'Feigner'],
  w: 2.5, d: 3.0, h: 2.4,
  data: { height: 1.95, mass: 0.6, crew: 0, pilot: 'none', reach: 1.1, weapon: 'pruning shears and a three-fingered hand',
    engine: 'Ancient cell', armour: 'white render pod' },
  variantData: [{}, { weapon: 'the pruning shears, closed on whatever it lunges at', reach: 1.6 }],
  gait: { period: 1.1, duty: 0.7, stride: 0.55, lift: 0.26, bob: 0.02, sway: 0.02, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0, 0.5, 0.5, 0] },
  idle: { breathe: 0.012, scan: 0, look: 0.4 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell']);
      P.b.arm_r_el = [0.1 * Math.sin(t * 0.6) * w, 0, 0]; P.b.arm_l_el = [0.1 * Math.sin(t * 0.6 + 2) * w, 0, 0];
      P.b.sh_a = [0, 0.04 * (1 + Math.sin(t * 0.9)) * w, 0]; P.b.sh_b = [0, -0.04 * (1 + Math.sin(t * 0.9)) * w, 0];
      P.b.rig_l_el = [0.08 * Math.sin(t * 0.4) * w, 0, 0]; P.b.rig_r_el = [0.08 * Math.sin(t * 0.4 + 1.7) * w, 0, 0];
    }
  },
  /* the routine: the hand reaches for the branch, the shears open and snap twice */
  attack: {
    kind: 'prune', dur: 2.6,
    keys: [
      [0, {}],
      [0.5, { b: { body: [-0.08, 0, 0], head: [-0.15, 0, 0], arm_l_sh: [-0.9, 0, 0.2], arm_l_el: [-0.5, 0, 0], arm_r_sh: [-0.8, 0, -0.1], arm_r_el: [-0.6, 0, 0], sh_a: [0, 0.5, 0], sh_b: [0, -0.5, 0], rig_l: [-0.5, 0, 0], rig_l_el: [0.6, 0, 0] }, s: { body: [0, 0.04, 0.05] } }, 's'],
      [0.8, { b: { body: [-0.08, 0, 0], head: [-0.15, 0, 0], arm_l_sh: [-0.9, 0, 0.2], arm_l_el: [-0.5, 0, 0], arm_r_sh: [-1.0, 0, -0.1], arm_r_el: [-0.4, 0, 0], sh_a: [0, -0.05, 0], sh_b: [0, 0.05, 0] }, s: { body: [0, 0.04, 0.05] } }, 'i'],
      [1.2, { b: { body: [-0.08, 0, 0], head: [-0.2, 0.15, 0], arm_l_sh: [-0.9, 0, 0.2], arm_l_el: [-0.5, 0, 0], arm_r_sh: [-1.1, 0.2, -0.1], arm_r_el: [-0.5, 0, 0], sh_a: [0, 0.5, 0], sh_b: [0, -0.5, 0] }, s: { body: [0, 0.04, 0.05] } }, 's'],
      [1.45, { b: { body: [-0.08, 0, 0], head: [-0.2, 0.15, 0], arm_l_sh: [-0.9, 0, 0.2], arm_l_el: [-0.5, 0, 0], arm_r_sh: [-1.2, 0.2, -0.1], arm_r_el: [-0.3, 0, 0], sh_a: [0, -0.05, 0], sh_b: [0, 0.05, 0] }, s: { body: [0, 0.04, 0.05] } }, 'i'],
      [2.0, { b: { arm_l_sh: [-0.3, 0, 0.1], arm_r_sh: [-0.3, 0, 0], sh_a: [0, 0.15, 0], sh_b: [0, -0.15, 0] } }, 's'],
      [2.6, {}, 's']
    ],
    events: [{ t: 0.81, type: 'impact', at: 'shear_pt', r: 0.3 }, { t: 1.46, type: 'impact', at: 'shear_pt', r: 0.3 }]
  },
  /* the feigner: the dome tracks, the lamp goes red, it drops and lunges, the shears close */
  variantAttack: [null, ANC.feign({
    kind: 'lunge', dur: 2.2,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.5, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.15, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.0, { b: { body: [-0.15, 0, 0], head: [0.2, 0, 0], arm_l_sh: [-0.5, 0, 0.3], arm_r_sh: [-0.4, 0, -0.3], sh_a: [0, 0.7, 0], sh_b: [0, -0.7, 0] }, s: { body: [0, -0.35, -0.1] } }, 's'],
      [1.22, { b: { body: [0.1, 0, 0], head: [0.1, 0, 0], arm_l_sh: [-1.5, 0, 0.3], arm_l_el: [-0.2, 0, 0], arm_r_sh: [-1.6, 0, -0.2], arm_r_el: [-0.1, 0, 0], sh_a: [0, 0.0, 0], sh_b: [0, 0.0, 0] }, s: { body: [0, -0.3, 0.55] } }, 'i'],
      [1.5, { b: { body: [0.05, 0, 0], arm_l_sh: [-1.3, 0, 0.3], arm_r_sh: [-1.4, 0, -0.2], sh_a: [0, 0.0, 0], sh_b: [0, 0.0, 0] }, s: { body: [0, -0.25, 0.5] } }, 'o'],
      [2.2, {}, 's']
    ],
    events: [{ t: 1.23, type: 'impact', at: 'shear_pt', r: 0.8 }]
  }, 0.7)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the pod */
    R.bone('body', null, 0, 1.45, 0);
    R.on('body');
    F.sph(0, 0, 0, 0.46, 0.3, 0.52, ANC.work(F, 0.25), 'paint', 18, 12);
    F.chb(0, -0.22, 0, 0.6, 0.16, 0.7, 0.05, frd, 'metal', 'z');
    F.cy(0, 0.3, -0.1, 0.1, 0.12, 0.12, fr, 'metal', 'y', 8);
    F.knob(0, 0.4, -0.1, 0.035, c('lensDead'), 'metal');
    ANC.streak(F, -0.15, 0.1, 0.47, 0.2, 0.04);
    for (const s of [-1, 1]) {
      F.chb(s * 0.42, -0.02, 0.0, 0.08, 0.2, 0.5, 0.02, ANC.work(F, 0.4), 'paint', 'x');
      ANC.hazard(F, s * 0.466, -0.02, 0.0, 0.4, 0.1, 'yb', 0, s * Math.PI / 2, 0);
    }
    /* the rigger's arms: two long arms folded up over the back, each ending in a hook, for the branches it once hauled */
    for (const s of [-1, 1]) {
      const G = s > 0 ? 'rig_l' : 'rig_r';
      R.bone(G, 'body', s * 0.2, 0.18, -0.15, 2.2, 0, s * 0.25);
      R.on(G);
      MP.joint(F, 0, 0, 0, 0.05, 0.1, 'x', jt, null);
      F.cy(0, -0.46, 0, 0.035, 0.04, 0.86, ANC.work(F, 0.4), 'paint', 'y', 8);
      R.bone(G + '_el', G, 0, -0.92, 0, -2.4, 0, 0);
      R.on(G + '_el');
      MP.joint(F, 0, 0, 0, 0.04, 0.09, 'x', jt, null);
      F.cy(0, -0.42, 0, 0.028, 0.034, 0.8, fr, 'metal', 'y', 8);
      F.rod(0, -0.82, 0, 0, -0.95, 0.07, 0.014, st, 'metal');
      F.rod(0, -0.95, 0.07, 0, -0.9, 0.14, 0.012, st, 'metal');
    }
    R.on('body');

    /* ---- the sensor dome at the front: three lenses, the tell on top */
    R.bone('head', 'body', 0, 0.06, 0.5);
    R.on('head');
    F.cy(0, -0.02, -0.04, 0.12, 0.14, 0.14, jt, 'metal', 'z', 10);
    F.sph(0, 0, 0.1, 0.2, 0.18, 0.2, ANC.wearDk(F, 0.3), 'paint', 16, 10);
    ANC.lens(F, 0, 0.0, 0.29, 0, 0, 1, 0.04, 'cyan', frd);
    for (const s of [-1, 1]) ANC.lens(F, s * 0.13, -0.03, 0.24, s * 0.6, -0.1, 1, 0.025, 'cyan', null);
    R.point('head_pt', 'head', 0, 0, 0.32);
    ANC.tell(F, R, 'head', 0, 0.17, 0.1, 0, 1, 0.3, 0.03);

    /* ---- the arms under the dome: the right the shears, the left a three-fingered hand */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'body', s * 0.27, -0.12, 0.38, -0.6, 0, s * 0.25);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.05, 0.1, 'x', jt, null);
      F.cy(0, -0.26, 0, 0.035, 0.04, 0.46, ANC.wear(F, 0.4), 'paint', 'y', 8);
      R.bone(A + '_el', A + '_sh', 0, -0.5, 0, -0.7, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.04, 0.09, 'x', jt, null);
      F.cy(0, -0.26, 0, 0.03, 0.035, 0.46, fr, 'metal', 'y', 8);
      R.bone(A + '_wr', A + '_el', 0, -0.5, 0, 0.2, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.02, 0, 0.04, 0.035, 0.06, frd, 'metal', 'y', 8);
      if (s > 0) {
        for (let k = 0; k < 3; k++) {
          const a = (k - 1) * 0.5;
          F.rod(0, -0.04, 0, Math.sin(a) * 0.08, -0.16, Math.cos(a) * 0.04, 0.012, jt, 'metal');
          F.rod(Math.sin(a) * 0.08, -0.16, Math.cos(a) * 0.04, Math.sin(a) * 0.06, -0.25, Math.cos(a) * 0.1, 0.01, jt, 'metal');
        }
      } else {
        /* the shears: a pivot, two blades on their own bones (they yaw apart and shut) */
        F.cy(0, -0.08, 0, 0.03, 0.03, 0.05, st, 'metal', 'y', 8);
        R.point('shear_pt', A + '_wr', 0, -0.12, 0.3);
        for (const b of [['sh_a', 1], ['sh_b', -1]]) {
          R.bone(b[0], A + '_wr', b[1] * 0.012, -0.08, 0.02);
          R.on(b[0]);
          F.prism(0, 0, 0.17, [[0, -0.02], [b[1] * 0.045, -0.015], [b[1] * 0.05, 0.1], [b[1] * 0.02, 0.33], [0, 0.34]], 0.012, st, 'metal', 'y');
          F.cb(b[1] * 0.02, -0.01, 0.06, 0.03, 0.014, 0.1, frd, 'metal');
        }
      }
    }

    /* ---- four splayed legs, knees high: a joint drum at the hip, a white thigh, a dark shin, a small pad */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.4, -0.1, sz * 0.3], L1: 0.95, L2: 1.1, knee: 1, splay: true, ankleH: 0.08,
        rest: [sx * 1.0, sz * 0.85], toe: 0.05, footYaw: 0.6 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.09, 0.09, 0.1, jt, 'metal', 'y', 10);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.075, 0.13, 'x', fr, null);
      F.cy(0, -0.48, 0, 0.065, 0.05, 0.9, ANC.wear(F, 0.4), 'paint', 'y', 10);
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.06, 0.11, 'x', fr, null);
      F.cy(0, -0.56, 0, 0.04, 0.028, 1.05, ANC.soot(F), 'metal', 'y', 8);
      MP.piston(F, R, n + '_hip', [0, -0.3, 0.07], n + '_knee', [0, -0.3, 0.05], 0.018, frd, c('chrome'));
      R.on(n + '_ankle');
      F.cy(0, -0.045, 0, 0.035, 0.05, 0.07, c('rubber'), 'rubber', 'y', 8);
    }
  }
});
