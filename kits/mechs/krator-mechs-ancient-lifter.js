/* ======================================================================
   Ancient machine: the lifter (kits/mechs/krator-mechs-ancient-lifter.js)

   KEEPER, hovering: a cargo drone of the work fleet, a flat yellow hull on four big
   ducted fans at the ends of its outriggers, hazard stripes along its bumpers, a
   beacon, a sensor strip at its front and a winch under its belly with a chain and
   a hook. It rides its delivery route at roof-gutter height, comes down over the kerb
   with the hook, loads nothing and lifts away. The FEIGNER: the lamp on its nose goes
   red, the strip turns to you, and it drops onto you, fans screaming.
   ====================================================================== */
MECH({
  key: 'an_lifter', name: 'Lifter', culture: 'ancient',
  role: 'keeper: a cargo drone on its route, loading nothing', origin: 'Ancient cargo drone',
  lore: 'A flat yellow hull on four ducted fans with a chain and hook under its belly, riding its route at gutter height and coming down over the kerb to load nothing. Some of them are not lifters.',
  feign: [1],
  tags: { class: 'mech', type: ['transport', 'utility'], drive: 'hover', crew: 0, pilot: 'none', weapon: [], role: 'keeper',
    setting: 'outdoor', guild: 'none' },
  variantTags: [{}, { role: 'feigner', weapon: ['grapple'] }],
  variants: 2, variantNames: ['Lifter', 'Feigner'],
  w: 4.6, d: 3.8, h: 5.8,
  data: { height: 5.0, mass: 1.6, crew: 0, pilot: 'none', reach: 0, weapon: 'none: a winch, a chain and a hook', lift: 800,
    engine: 'Ancient cell pack, four ducted fans', armour: 'work-yellow render hull' },
  variantData: [{}, { weapon: 'its own weight, dropped from gutter height; the hook', reach: 4.5 }],
  hover: { bob: 0.07, lean: 0.1, roll: 0.08 },
  gait: { period: 1, duty: 1, stride: 1.4 },
  idle: { breathe: 0.0, scan: 0, look: 0.3 },
  anim: {
    idle: function (P, t, w, st) { ANC.hiddenIdle(P, st, ['tell']); P.b.winch = [0, 0.3 * Math.sin(t * 0.21) * w, 0]; }
  },
  /* the routine: it comes down over the kerb, the hook touches, loads nothing, it lifts away */
  attack: {
    kind: 'load nothing', dur: 4.4,
    keys: [
      [0, {}],
      [1.2, { b: { head: [0.3, 0.3, 0], body: [0.04, 0, 0] }, s: { body: [0, -1.6, 0.3] } }, 's'],
      [2.0, { b: { head: [0.35, -0.2, 0], body: [0.02, 0, 0] }, s: { body: [0, -1.75, 0.4] } }, 's'],
      [2.6, { b: { head: [0.3, 0, 0] }, s: { body: [0, -1.6, 0.4] } }, 's'],
      [4.4, {}, 's']
    ],
    events: [{ t: 2.0, type: 'impact', at: 'grab_pt', r: 0.6 }]
  },
  /* the feigner: the strip tracks, the lamp goes red, it rises, then drops onto you */
  variantAttack: [null, ANC.feign({
    kind: 'drop', dur: 3.0,
    keys: [
      [0, {}],
      [0.4, { b: { head: [0, 0.5, 0] } }, 's'],
      [0.62, { b: { head: [0.1, -0.15, 0] } }, 's'],
      [0.7, { b: { head: [0.1, -0.1, 0] } }, 'l'],
      [1.2, { b: { head: [0.4, 0, 0], body: [-0.1, 0, 0] }, s: { body: [0, 0.6, -0.4] } }, 's'],
      [1.6, { b: { head: [0.2, 0, 0], body: [0.3, 0, 0] }, s: { body: [0, -2.6, 1.2] } }, 'i'],
      [2.0, { b: { body: [0.05, 0, 0] }, s: { body: [0, -2.0, 1.1] } }, 'o'],
      [3.0, {}, 's']
    ],
    events: [{ t: 1.61, type: 'impact', at: 'grab_pt', r: 2.0 }]
  }, 0.7)],

  build: function (F, R) {
    const c = F.col;
    const fr = c('frame'), frd = c('frameDk'), jt = c('joint'), st = c('steel');

    /* ---- the hull: a flat yellow slab, bumpers with hazard stripes, a beacon, vents */
    R.bone('body', null, 0, 4.5, 0);
    R.on('body');
    F.chb(0, 0, 0, 2.2, 0.55, 1.5, 0.12, ANC.work(F, 0.25), 'paint', 'x');
    F.chb(0, -0.33, 0, 1.8, 0.14, 1.2, 0.04, frd, 'metal', 'x');
    F.chb(0, 0.3, -0.2, 1.4, 0.12, 0.9, 0.04, ANC.work(F, 0.45), 'paint', 'x');
    for (const s of [-1, 1]) {
      F.chb(0, -0.05, s * 0.78, 2.0, 0.22, 0.08, 0.02, frd, 'metal', 'x');
      ANC.hazard(F, 0, -0.05, s * 0.826, 1.6, 0.16, 'rw', 0, s > 0 ? 0 : Math.PI, 0);
      ANC.streak(F, s * 0.6, 0.2, 0.756, 0.35, 0.06);
    }
    for (let i = 0; i < 5; i++) F.cb(-0.7 + i * 0.35, 0.282, 0.4, 0.25, 0.02, 0.5, frd, 'metal');
    ANC.beacon(F, 0.8, 0.28, -0.5, 0.08);
    ANC.plate(F, -0.8, 0.0, 0.756, 0.3, 0.16);
    ANC.aerial(F, R, 'ant', 'body', -0.9, 0.28, -0.4, 0.9, -0.2);
    /* ---- the sensor strip at the front: a visor and twin lamps, the tell above */
    R.bone('head', 'body', 0, -0.05, 0.76);
    R.on('head');
    F.chb(0, 0, 0.1, 1.0, 0.3, 0.2, 0.04, fr, 'metal', 'x');
    ANC.visor(F, 0, 0.05, 0.208, 0.8, 0.1);
    ANC.twinLamps(F, 0, -0.08, 0.2, 0.045, 0.6, 'amber', 0);
    R.point('head_pt', 'head', 0, 0, 0.3);
    ANC.tell(F, R, 'head', 0, 0.16, 0.05, 0, 1, 0.4, 0.045);
    /* ---- four big ducted fans on outriggers, thrust down */
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = sx * 1.55, z = sz * 1.0;
      R.on('body');
      F.cb(sx * 0.9, 0.05, z * 0.75, 1.3, 0.14, 0.2, ANC.work(F, 0.4), 'paint', 0, 0, 0);
      F.cb(sx * 1.28, 0.05, z * 0.95, 0.5, 0.1, 0.4, frd, 'metal');
      MP.fan(F, R, 'fan_' + (sx > 0 ? 'l' : 'r') + (sz > 0 ? 'f' : 'b'), 'body', x, 0.0, z, 0.55, 0.3, ANC.work(F, 0.35), st, frd, { idle: 22, walk: 32, attack: 40 }, -Math.PI / 2, 0, 0);
    }
    /* ---- the winch under the belly: a drum that slews, the chain, the hook */
    R.bone('winch', 'body', 0, -0.42, 0.1);
    R.on('winch');
    F.cy(0, 0, 0, 0.3, 0.3, 0.14, jt, 'metal', 'y', 14);
    F.cy(0, -0.14, 0, 0.14, 0.14, 0.2, fr, 'metal', 'x', 10);
    R.dangle('hook', 'winch', 0, -0.2, 0, { mode: 'hang', len: 1.6, k: 5, c: 0.9, wind: 0.02, max: 1.4 });
    R.on('hook');
    ANC.chain(F, 0, 0, 0, 1.25, 0.03);
    R.bone('grab', 'hook', 0, -1.3, 0);
    R.on('grab');
    F.cy(0, -0.02, 0, 0.07, 0.09, 0.1, frd, 'metal', 'y', 8);
    F.rod(0, -0.07, 0, 0, -0.32, 0.1, 0.03, st, 'metal');
    F.rod(0, -0.32, 0.1, 0, -0.24, 0.2, 0.026, st, 'metal');
    R.point('grab_pt', 'grab', 0, -0.32, 0.1);
  }
});
