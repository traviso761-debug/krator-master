/* ======================================================================
   Ancient machine: the lamplighter (kits/mechs/krator-mechs-ancient-lamplighter.js)

   KEEPER, 7 m to the lantern: a tall thin walker on long human-jointed legs, a spine
   of a torso under a narrow chest, a blank white mask for a face (two dead eyes), long
   thin arms, one of them carrying a lighting pole upright, and a mast from its
   shoulders with a dead lantern in a cage at the top. It walks its street at dusk and
   reaches up to light a lamp that has not lit in a thousand years; now and then the
   lantern flickers. The FEIGNER: a third eye opens red in the mask, the face turns to
   you, and the pole comes down.
   ====================================================================== */
MECH({
  key: 'an_lamplighter', name: 'Lamplighter', culture: 'ancient',
  role: 'keeper: lights the street lamps that no longer light', origin: 'Ancient street-service walker',
  lore: 'A tall thin walker with a blank white mask and a dead lantern on a mast, reaching up with its pole to light lamps that have not lit in a thousand years. Some of them are not lamplighters.',
  feign: [1],
  tags: { class: 'mech', type: ['utility'], drive: 'biped', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['lance'] }],
  variants: 2, variantNames: ['Lamplighter', 'Feigner'],
  w: 2.2, d: 1.7, h: 8.0,
  data: { height: 7.2, mass: 2.4, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a lighting pole and a dead lantern',
    engine: 'Ancient cell', armour: 'none: a thin frame in white render' },
  variantData: [{}, { weapon: 'the lighting pole, a shock lance', reach: 4.5 }],
  gait: { period: 1.5, duty: 0.6, stride: 1.3, lift: 0.3, bob: 0.05, sway: 0.05, roll: 0.03, twist: 0.06, lean: 0.03,
    offsets: [0, 0.5], arms: { arm_l_sh: [0.25, 0, 0], arm_r_sh: [0.12, 0, 0] } },
  idle: { breathe: 0.02, scan: 0.25, look: 0.5 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell', 'flick']);
      P.b.mast = [0.015 * Math.sin(t * 0.7) * w, 0, 0.012 * Math.sin(t * 0.53 + 1) * w];
      P.b.arm_l_el = [0.08 * Math.sin(t * 0.5) * w, 0, 0];
    }
  },
  /* the routine: it stops, looks up, raises the pole to the lantern; the lantern flickers once; it lowers the pole */
  attack: ANC.reveal({
    kind: 'light the lamp', dur: 3.6,
    keys: [
      [0, {}],
      [0.8, { b: { torso: [-0.12, 0, 0], head: [-0.6, 0, 0], arm_r_sh: [-2.5, 0, 0.35], arm_r_el: [-0.3, 0, 0], arm_r_wr: [0.2, 0, 0] }, s: { body: [0, -0.03, 0] } }, 's'],
      [1.5, { b: { torso: [-0.15, 0, 0], head: [-0.7, 0.1, 0], arm_r_sh: [-2.7, 0, 0.4], arm_r_el: [-0.1, 0, 0], arm_r_wr: [0.3, 0, 0] }, s: { body: [0, -0.03, 0] } }, 's'],
      [1.62, { b: { torso: [-0.15, 0, 0], head: [-0.7, 0.1, 0], arm_r_sh: [-2.7, 0, 0.4], arm_r_el: [-0.1, 0, 0], arm_r_wr: [0.3, 0, 0] }, s: { body: [0, -0.03, 0] } }, 'l'],
      [1.9, { b: { torso: [-0.15, 0, 0], head: [-0.7, -0.1, 0], arm_r_sh: [-2.7, 0, 0.4], arm_r_el: [-0.1, 0, 0], arm_r_wr: [0.3, 0, 0] }, s: { body: [0, -0.03, 0] } }, 'l'],
      [2.6, { b: { torso: [-0.05, 0, 0], head: [-0.3, 0, 0], arm_r_sh: [-1.2, 0, 0.2], arm_r_el: [-0.3, 0, 0] } }, 's'],
      [3.6, {}, 's']
    ],
    events: [{ t: 1.63, type: 'call', kind: 'click', at: 'lantern_pt', dir: [0, 1, 0] }]
  }, 'flick', 1.62, 1.9),
  /* the feigner: the mask tracks, the third eye opens red, the pole goes back over the shoulder and comes down */
  variantAttack: [null, ANC.reveal(ANC.feign({
    kind: 'pole strike', dur: 2.6,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.55, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.15, 0], torso: [0, 0.05, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0], torso: [0, 0.05, 0] } }, 'l'],
      [1.3, { b: { torso: [-0.25, 0.1, 0], head: [-0.2, 0, 0], arm_r_sh: [-2.9, 0, 0.3], arm_r_el: [-0.4, 0, 0], arm_r_wr: [1.2, 0, 0], arm_l_sh: [-0.6, 0, 0.3] }, s: { body: [0, 0.02, -0.1] } }, 's'],
      [1.55, { b: { torso: [0.45, -0.05, 0], head: [0.3, 0, 0], arm_r_sh: [-0.9, 0, 0.1], arm_r_el: [-0.1, 0, 0], arm_r_wr: [2.3, 0, 0], arm_l_sh: [-1.0, 0, 0.4] }, s: { body: [0, -0.12, 0.3] } }, 'i'],
      [1.9, { b: { torso: [0.4, -0.05, 0], head: [0.25, 0, 0], arm_r_sh: [-0.8, 0, 0.1], arm_r_wr: [2.2, 0, 0], arm_l_sh: [-0.9, 0, 0.4] }, s: { body: [0, -0.1, 0.3] } }, 'o'],
      [2.6, {}, 's']
    ],
    events: [{ t: 1.56, type: 'impact', at: 'pole_pt', r: 1.3 }]
  }, 0.7), 'flick', 99)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel'), wh = c('white'), whd = c('whiteDk');

    /* ---- the pelvis: narrow */
    R.bone('body', null, 0, 2.85, 0);
    R.on('body');
    F.chb(0, 0, 0, 0.7, 0.34, 0.44, 0.08, fr, 'metal', 'x');
    F.chb(0, 0.02, 0.24, 0.5, 0.26, 0.04, 0.02, ANC.wear(F, 0.4), 'paint', 'z');

    /* ---- the torso: a ribbed spine, a narrow chest shell, the shoulder yoke */
    R.bone('torso', 'body', 0, 0.2, 0, 0.04, 0, 0);
    R.on('torso');
    F.cy(0, 0.75, 0, 0.13, 0.16, 1.5, frd, 'metal', 'y', 10);
    for (let i = 0; i < 6; i++) F.cy(0, 0.15 + i * 0.24, 0, 0.19, 0.19, 0.08, fr, 'metal', 'y', 10);
    F.chb(0, 1.78, 0.04, 0.9, 0.62, 0.52, 0.12, ANC.work(F, 0.25), 'paint', 'x');
    for (const s of [-1, 1]) ANC.aerial(F, R, s > 0 ? 'ant_l' : 'ant_r', 'torso', s * 0.42, 2.2, -0.08, 0.7, -0.12);
    R.on('torso');
    F.chb(0, 1.5, 0.05, 0.6, 0.12, 0.4, 0.03, whd, 'paint', 'x');
    ANC.visor(F, 0, 1.85, 0.308, 0.4, 0.12);
    ANC.plate(F, -0.25, 1.68, 0.308, 0.18, 0.1);
    ANC.streak(F, 0.3, 1.95, 0.308, 0.4, 0.05);
    F.chb(0, 2.1, -0.02, 1.3, 0.2, 0.36, 0.06, frd, 'metal', 'x');
    for (const s of [-1, 1]) F.cy(s * 0.6, 2.1, 0, 0.14, 0.14, 0.26, jt, 'metal', 'x', 12);
    F.chb(0, 1.7, -0.36, 0.5, 0.6, 0.2, 0.05, ANC.wearDk(F, 0.4), 'paint', 'y');

    /* ---- the head: a blank white mask on a thin neck, two dead eyes, the third eye (the tell) hidden in the brow */
    R.bone('head', 'torso', 0, 2.22, 0.08);
    R.on('head');
    F.cy(0, 0.04, 0, 0.05, 0.06, 0.1, jt, 'metal', 'y', 8);
    F.sph(0, 0.26, 0.0, 0.15, 0.21, 0.14, ANC.wearDk(F, 0.15), 'paint', 14, 10);
    F.sph(0, 0.27, 0.05, 0.145, 0.2, 0.12, c('whiteLt'), 'paint', 14, 10, 0, Math.PI, 0.25, 2.7, 0, 0, 0);
    for (const s of [-1, 1]) F.knob(s * 0.055, 0.3, 0.16, 0.022, c('glassDk'), 'metal');
    R.point('head_pt', 'head', 0, 0.27, 0.2);
    ANC.tell(F, R, 'head', 0, 0.4, 0.145, 0, 0.2, 1, 0.028);

    /* ---- the mast and the lantern: a pole from the yoke, a cage round a dead lamp, a cap */
    R.bone('mast', 'torso', 0.0, 2.15, -0.14);
    R.on('mast');
    F.cy(0, 0.9, 0, 0.045, 0.04, 1.8, fr, 'metal', 'y', 8);
    F.cy(0, 0.1, 0, 0.08, 0.08, 0.16, jt, 'metal', 'y', 8);
    F.cy(0, 1.84, 0, 0.09, 0.12, 0.1, frd, 'metal', 'y', 8);
    const LY = 2.2;
    F.cy(0, LY - 0.3, 0, 0.26, 0.2, 0.06, frd, 'metal', 'y', 8);
    F.knob(0, LY, 0, 0.2, c('lensDead'), 'metal');
    MP.cage(F, 0, LY, 0, 0.3, 0.32, 0.3, 0, TAU, 0.2, 2.6, 6, 3, 0.012, fr);
    F.cy(0, LY + 0.36, 0, 0.3, 0.05, 0.14, ANC.wear(F, 0.5), 'paint', 'y', 8);
    F.cy(0, LY + 0.46, 0, 0.06, 0.03, 0.1, frd, 'metal', 'y', 6);
    R.point('lantern_pt', 'mast', 0, LY, 0.3);
    /* the flicker: a glow inside the dead lamp, hidden except for a moment of the routine */
    R.bone('flick', 'mast', 0, LY, 0);
    R.on('flick');
    F.knob(0, 0, 0, 0.22, c('lensWarm'), 'glow');

    /* ---- the arms: long and thin; the left a three-fingered hand, the right carries the pole upright */
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'arm_l' : 'arm_r';
      R.bone(A + '_sh', 'torso', s * 0.72, 2.1, 0, -0.1, 0, s * 0.08);
      R.on(A + '_sh');
      MP.joint(F, 0, 0, 0, 0.1, 0.18, 'x', jt, null);
      F.cy(0, -0.5, 0, 0.07, 0.085, 0.9, ANC.wear(F, 0.35), 'paint', 'y', 10);
      R.bone(A + '_el', A + '_sh', 0, -0.98, 0, -0.35, 0, 0);
      R.on(A + '_el');
      MP.joint(F, 0, 0, 0, 0.07, 0.15, 'x', jt, null);
      F.cy(0, -0.48, 0, 0.055, 0.07, 0.9, ANC.wear(F, 0.35), 'paint', 'y', 10);
      R.bone(A + '_wr', A + '_el', 0, -0.97, 0, 0.3, 0, 0);
      R.on(A + '_wr');
      F.cy(0, -0.02, 0, 0.06, 0.05, 0.08, frd, 'metal', 'y', 8);
      if (s > 0) {
        for (let k = 0; k < 3; k++) {
          const a = (k - 1) * 0.45;
          F.rod(0, -0.06, 0, Math.sin(a) * 0.12, -0.24, Math.cos(a) * 0.05, 0.016, jt, 'metal');
          F.rod(Math.sin(a) * 0.12, -0.24, Math.cos(a) * 0.05, Math.sin(a) * 0.1, -0.36, Math.cos(a) * 0.12, 0.013, jt, 'metal');
        }
      } else {
        /* the pole: gripped at the hand, rising 2 m up the arm and 0.35 m below it; a hooked igniter at the top */
        F.cb(0, -0.1, 0.06, 0.08, 0.14, 0.06, jt, 'metal');
        F.cy(0, 0.835, 0.11, 0.03, 0.025, 2.37, ANC.wear(F, 0.5), 'metal', 'y', 8);
        F.cy(0, 1.95, 0.11, 0.045, 0.04, 0.2, frd, 'metal', 'y', 8);
        F.rod(0, 2.05, 0.11, 0, 2.2, 0.24, 0.015, st, 'metal');
        F.knob(0, 2.21, 0.25, 0.028, c('lensDead'), 'metal');
        R.point('pole_pt', A + '_wr', 0, 2.15, 0.2);
      }
    }

    /* ---- legs: long and thin, human-jointed, a narrow foot */
    for (const s of [-1, 1]) {
      const Lg = s > 0 ? 'leg_l' : 'leg_r';
      R.leg(Lg, { parent: 'body', hip: [s * 0.26, -0.05, 0], L1: 1.5, L2: 1.5, knee: 1, ankleH: 0.12, rest: [s * 0.3, 0.02], phase: s > 0 ? 0 : 0.5, toe: 0.3 });
      R.on(Lg + '_hip');
      MP.joint(F, 0, 0, 0, 0.13, 0.2, 'x', jt, null);
      F.chb(0, -0.75, 0, 0.26, 1.3, 0.3, 0.06, ANC.work(F, 0.35), 'paint', 'y');
      ANC.streak(F, 0.05, -0.4, 0.156, 0.4, 0.04);
      ANC.hazard(F, 0, -1.2, 0.156, 0.2, 0.08, 'yb');
      R.on(Lg + '_knee');
      MP.joint(F, 0, 0, 0, 0.11, 0.18, 'x', jt, null);
      F.cy(0, -0.8, 0, 0.09, 0.07, 1.4, ANC.soot(F), 'metal', 'y', 10);
      F.chb(0, -0.4, 0.06, 0.2, 0.7, 0.16, 0.04, ANC.wear(F, 0.5), 'paint', 'y');
      MP.piston(F, R, Lg + '_hip', [0, -0.5, -0.17], Lg + '_knee', [0, -0.35, -0.12], 0.035, frd, c('chrome'));
      R.on(Lg + '_ankle');
      F.cy(0, -0.02, 0, 0.07, 0.08, 0.1, jt, 'metal', 'y', 10);
      F.chb(0, -0.09, 0.08, 0.22, 0.06, 0.5, 0.02, ANC.soot(F), 'metal', 'z');
      F.chb(0, -0.095, 0.36, 0.2, 0.045, 0.12, 0.015, frd, 'metal', 'z', -0.3, 0, 0);
    }
  }
});
