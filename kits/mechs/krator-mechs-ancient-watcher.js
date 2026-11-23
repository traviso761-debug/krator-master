/* ======================================================================
   Ancient machine: the watcher (kits/mechs/krator-mechs-ancient-watcher.js)

   KEEPER, hovering: a monitor drone the size of a hound's head, a white ball with one
   big lens at its front and a ring of small ones, four ducted fans on short arms, two
   whip aerials, a hooked manipulator folded under it. It drifts its beat at head
   height, stops, turns its lens along the street and chirps to a network that is
   not there. The FEIGNER: the lamp on its crown goes red, the lens finds you, and it
   drops on you with the hook.
   ====================================================================== */
MECH({
  key: 'an_watcher', name: 'Watcher', culture: 'ancient',
  role: 'keeper: a monitor drone on its beat', origin: 'Ancient civic monitor drone',
  lore: 'A white ball on four small fans that drifts its beat at head height, turning its lens along the street and chirping to a network that is not there. Some of them are not watchers.',
  feign: [1],
  tags: { class: 'mech', type: ['scout', 'utility'], drive: 'hover', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['claw'] }],
  variants: 2, variantNames: ['Watcher', 'Feigner'],
  w: 1.5, d: 1.5, h: 3.1,
  data: { height: 2.5, mass: 0.08, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a lens, a hook',
    engine: 'Ancient cell, four ducted fans', armour: 'white render shell' },
  variantData: [{}, { weapon: 'the hook, dropped on from above', reach: 2.5 }],
  hover: { bob: 0.04, lean: 0.14, roll: 0.12 },
  gait: { period: 1, duty: 1, stride: 1.8 },
  idle: { breathe: 0.0, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w, st) {
      ANC.hiddenIdle(P, st, ['tell']);
      P.b.eye = [0.1 * Math.sin(t * 0.5) * w, 0.5 * Math.sin(t * 0.23) * w, 0];
      P.b.claw = [0.1 * Math.sin(t * 0.7) * w, 0, 0];
    }
  },
  /* the routine: it stops, the lens sweeps the street, a chirp */
  attack: {
    kind: 'scan', dur: 2.6,
    keys: [
      [0, {}],
      [0.6, { b: { eye: [0.25, 0.9, 0], body: [0, 0.2, 0] } }, 's'],
      [1.4, { b: { eye: [0.25, -0.9, 0], body: [0, -0.2, 0] } }, 's'],
      [2.0, { b: { eye: [0.1, 0, 0] } }, 's'],
      [2.6, {}, 's']
    ],
    events: [{ t: 0.7, type: 'call', kind: 'chirp', at: 'lens_pt', dir: [0, 0, 1] }, { t: 1.5, type: 'call', kind: 'chirp', at: 'lens_pt', dir: [0, 0, 1] }]
  },
  /* the feigner: the lens finds you, the crown goes red, it rises and drops with the hook */
  variantAttack: [null, ANC.feign({
    kind: 'drop', dur: 2.4,
    keys: [
      [0, {}],
      [0.4, { b: { eye: [0, 0.6, 0] } }, 's'],
      [0.62, { b: { eye: [0.3, -0.1, 0] } }, 's'],
      [0.7, { b: { eye: [0.3, -0.05, 0] } }, 'l'],
      [1.1, { b: { eye: [0.5, 0, 0], body: [-0.1, 0, 0], claw: [-1.2, 0, 0] }, s: { body: [0, 0.5, -0.2] } }, 's'],
      [1.4, { b: { eye: [0.3, 0, 0], body: [0.35, 0, 0], claw: [-0.4, 0, 0] }, s: { body: [0, -1.3, 0.9] } }, 'i'],
      [1.7, { b: { body: [0.1, 0, 0], claw: [-0.2, 0, 0] }, s: { body: [0, -0.9, 0.8] } }, 'o'],
      [2.4, {}, 's']
    ],
    events: [{ t: 1.41, type: 'impact', at: 'claw_pt', r: 0.6 }]
  }, 0.7)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the ball, its band, the crown with the tell */
    R.bone('body', null, 0, 2.3, 0);
    R.on('body');
    F.sph(0, 0, 0, 0.3, 0.28, 0.3, ANC.wear(F, 0.2), 'paint', 20, 14);
    F.cy(0, -0.02, 0, 0.31, 0.31, 0.08, frd, 'metal', 'y', 20);
    ANC.eyes(F, 0, 0, 0, 0.3, 6, -0.3, 'cyan', 0.02, 0.5);
    F.cy(0, 0.27, 0, 0.1, 0.07, 0.06, fr, 'metal', 'y', 10);
    ANC.tell(F, R, 'body', 0, 0.35, 0, 0, 1, 0, 0.03);
    for (const s of [-1, 1]) ANC.aerial(F, R, s > 0 ? 'ant_l' : 'ant_r', 'body', s * 0.12, 0.26, -0.15, 0.45, -0.25);
    /* ---- the lens on a short turret at the front */
    R.bone('eye', 'body', 0, 0.02, 0.22);
    R.on('eye');
    F.cy(0, 0, 0.02, 0.12, 0.13, 0.14, frd, 'metal', 'z', 14);
    ANC.lens(F, 0, 0, 0.096, 0, 0, 1, 0.085, 'cyan', null);
    R.point('lens_pt', 'eye', 0, 0, 0.14);
    /* ---- four ducted fans on short arms, thrust down */
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 + Math.PI / 4, x = Math.sin(a) * 0.52, z = Math.cos(a) * 0.52;
      R.on('body');
      F.rod(Math.sin(a) * 0.26, -0.04, Math.cos(a) * 0.26, x, -0.06, z, 0.03, fr, 'metal');
      MP.fan(F, R, 'fan' + k, 'body', x, -0.06, z, 0.17, 0.1, ANC.wear(F, 0.4), st, frd, { idle: 30, walk: 40, attack: 44 }, -Math.PI / 2, 0, 0);
    }
    /* ---- the hook folded under */
    R.bone('claw', 'body', 0, -0.26, 0.05, -2.4, 0, 0);
    R.on('claw');
    F.cy(0, 0, 0, 0.035, 0.035, 0.07, jt, 'metal', 'x', 8);
    F.rod(0, 0, 0, 0, -0.3, 0, 0.016, fr, 'metal');
    F.rod(0, -0.3, 0, 0, -0.38, 0.08, 0.014, st, 'metal');
    F.rod(0, -0.38, 0.08, 0, -0.3, 0.13, 0.012, st, 'metal');
    R.point('claw_pt', 'claw', 0, -0.38, 0.08);
  }
});
