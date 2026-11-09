/* ======================================================================
   Ancient machine: the wasp (kits/mechs/krator-mechs-ancient-wasp.js)

   HUNTER, hovering: a security drone, a sleek white fuselage with a red eye at its
   nose, two ducted fans on short wings, a gun pod under each wing and a stinger of
   aerials at its tail. It patrols fast at second-storey height and comes down the
   street at you in a shallow dive, firing a burst from both pods.
   ====================================================================== */
MECH({
  key: 'an_wasp', name: 'Wasp', culture: 'ancient',
  role: 'hunter: a strafing drone', origin: 'Ancient security drone',
  lore: 'A sleek white drone on two fans with a red eye and a gun pod under each wing. It comes down the street at you in a shallow dive, firing.',
  tags: { class: 'mech', type: ['war machine', 'scout'], drive: 'hover', crew: 0, pilot: 'none', weapon: ['gun'], role: 'hunter',
    setting: 'outdoor', guild: 'none' },
  variants: 1, variantNames: ['Wasp'],
  w: 2.5, d: 2.1, h: 3.3,
  data: { height: 3.0, mass: 0.14, crew: 0, pilot: 'none', reach: 60, weapon: 'two gun pods under the wings',
    engine: 'Ancient cell, two ducted fans', armour: 'white composite fuselage' },
  hover: { bob: 0.03, lean: 0.1, roll: 0.14 },
  gait: { period: 1, duty: 1, stride: 4.0 },
  idle: { breathe: 0.0, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w) { P.b.body = [0.03 * Math.sin(t * 0.8) * w, 0.08 * Math.sin(t * 0.3) * w, 0.04 * Math.sin(t * 0.5) * w]; }
  },
  attack: {
    kind: 'strafe', dur: 2.6,
    keys: [
      [0, {}],
      [0.5, { b: { body: [-0.15, 0, 0] }, s: { body: [0, 0.4, -0.5] } }, 's'],
      [0.9, { b: { body: [0.35, 0, 0] }, s: { body: [0, -0.3, 1.0] } }, 'i'],
      [1.5, { b: { body: [0.3, 0, 0] }, s: { body: [0, -0.9, 2.6] } }, 'l'],
      [1.9, { b: { body: [-0.1, 0, 0.3] }, s: { body: [0, 0.2, 3.0] } }, 'o'],
      [2.6, {}, 's']
    ],
    events: [
      { t: 0.95, type: 'fire', kind: 'slug', at: 'muzzle_l', dir: [0, 0, 1], speed: 90 },
      { t: 1.1, type: 'fire', kind: 'slug', at: 'muzzle_r', dir: [0, 0, 1], speed: 90 },
      { t: 1.25, type: 'fire', kind: 'slug', at: 'muzzle_l', dir: [0, 0, 1], speed: 90 },
      { t: 1.4, type: 'fire', kind: 'slug', at: 'muzzle_r', dir: [0, 0, 1], speed: 90 }
    ]
  },

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the fuselage: a white teardrop, a dark belly, the eye, a red unit band, the tail aerials */
    R.bone('body', null, 0, 2.7, 0);
    R.on('body');
    F.sph(0, 0, 0, 0.26, 0.22, 0.7, ANC.wear(F, 0.15), 'paint', 20, 12);
    F.sph(0, -0.1, -0.05, 0.2, 0.14, 0.55, frd, 'metal', 16, 10);
    F.cy(0, 0, 0.3, 0.16, 0.16, 0.04, c('hazardRed'), 'paint', 'z', 16);
    F.cy(0, 0, 0.55, 0.1, 0.12, 0.12, jt, 'metal', 'z', 14);
    ANC.lens(F, 0, 0, 0.62, 0, 0, 1, 0.06, 'red', null);
    ANC.eyes(F, 0, 0, 0.1, 0.25, 4, 0.2, 'cyan', 0.018, Math.PI / 4);
    R.point('eye_pt', 'body', 0, 0, 0.7);
    for (const s of [-1, 1]) ANC.aerial(F, R, s > 0 ? 'ant_l' : 'ant_r', 'body', s * 0.06, 0.08, -0.62, 0.5, -2.4);
    /* ---- the wings, their fans and the gun pods */
    for (const s of [-1, 1]) {
      R.on('body');
      F.chb(s * 0.42, 0.02, -0.05, 0.54, 0.08, 0.36, 0.03, ANC.wear(F, 0.3), 'paint', 'x');
      MP.fan(F, R, s > 0 ? 'fan_l' : 'fan_r', 'body', s * 0.82, 0.04, -0.05, 0.3, 0.16, ANC.wear(F, 0.3), st, frd, { idle: 34, walk: 46, attack: 50 }, -Math.PI / 2, 0, 0);
      R.on('body');
      const G = s > 0 ? 'gun_l' : 'gun_r';
      R.bone(G, 'body', s * 0.42, -0.1, 0.0);
      R.on(G);
      F.cy(0, 0, 0, 0.05, 0.05, 0.5, frd, 'metal', 'z', 10);
      F.cy(0, 0, 0.3, 0.022, 0.022, 0.2, jt, 'metal', 'z', 8);
      F.cb(0, 0.05, -0.05, 0.03, 0.06, 0.2, fr, 'metal');
      R.point(s > 0 ? 'muzzle_l' : 'muzzle_r', G, 0, 0, 0.42);
    }
  }
});
