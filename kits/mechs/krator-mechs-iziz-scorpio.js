/* ======================================================================
   Iziz mech: the Scorpio (kits/mechs/krator-mechs-iziz-scorpio.js)

   An Ancient survey crawler: a low saucer hull on four splayed spider legs, the
   operator under a glass dome, two sensor pods on its flanks. The Forgemasters took
   the sensors off the pods and bolted a torsion ballista on each, so it is a walking
   battery: it settles, aims both, and looses one bolt and then the other, then winds
   them back. Orange plates on the steel shell, a crest on its rear hump, pennants on
   its aerials, feathers at the pods.
   ====================================================================== */
MECH({
  key: 'iz_scorpio', name: 'Scorpio', culture: 'iziz',
  role: 'artillery: twin ballistae', origin: 'Ancient survey crawler',
  lore: 'A survey crawler whose sensor pods each carry a torsion ballista now. It settles, aims both, and looses one and then the other.',
  tags: { class: 'mech', type: ['war machine', 'siege'], drive: 'quadruped', crew: 1, pilot: 'head', weapon: ['twin ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Battery'],
  w: 5.4, d: 4.1, h: 4.3,
  data: { height: 3.3, mass: 13, crew: 1, pilot: 'head', reach: 320, weapon: 'two torsion ballistae (1.2 m bolts)',
    engine: 'Ancient cell pack, hydraulic', armour: 'survey shell' },
  gait: { period: 1.5, duty: 0.7, stride: 0.9, lift: 0.36, bob: 0.03, sway: 0.04, roll: 0.02, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0 },
  anim: {
    idle: function (P, t, w) {
      P.b.pod_l = [0.04 * Math.sin(t * 0.4) * w, 0.12 * Math.sin(t * 0.23) * w, 0];
      P.b.pod_r = [0.04 * Math.sin(t * 0.4 + 2) * w, 0.12 * Math.sin(t * 0.23 + 1.5) * w, 0];
      const m = Math.max(0, Math.sin(t * 1.3)) * 0.25 * w;
      P.b.mand_l = [0, m, 0]; P.b.mand_r = [0, -m, 0];
    }
  },
  attack: (function () {
    const D = 0.62 * 1.5 - 0.12;     /* MP.ballista: how far the nut runs when loosed (len 1.5) */
    const aim = { b: { pod_l: [-0.1, -0.1, 0], pod_r: [-0.1, 0.1, 0], body: [-0.05, 0, 0] }, s: { body: [0, -0.18, 0] } };
    const loose = function (L, R) {
      const b = { pod_l: [-0.1, -0.1, 0], pod_r: [-0.1, 0.1, 0], body: [-0.05, 0, 0] }, s = { body: [0, -0.18, 0] }, sc = {};
      for (const p of [[L, 'bal_l', 'pod_l'], [R, 'bal_r', 'pod_r']]) if (p[0]) {
        b[p[1] + '_bowL'] = [0, -0.4, 0]; b[p[1] + '_bowR'] = [0, 0.4, 0]; s[p[1] + '_nut'] = [0, 0, D]; sc[p[1] + '_bolt'] = 0.0001;
      }
      return { b: b, s: s, sc: sc };
    };
    const kickL = loose(1, 0); kickL.b.pod_l = [-0.18, -0.1, 0];
    return { kind: 'twin volley', dur: 3.2, keys: [
      [0, {}], [0.5, aim, 's'], [0.74, aim, 's'], [0.8, kickL, 'i'], [0.95, loose(1, 0), 'o'],
      [1.14, loose(1, 0), 's'], [1.2, (function () { const k = loose(1, 1); k.b.pod_r = [-0.18, 0.1, 0]; return k; })(), 'i'], [1.35, loose(1, 1), 'o'],
      [1.6, loose(1, 1), 's'],
      [2.4, (function () { const k = loose(0, 0); k.sc = { bal_l_bolt: 0.0001, bal_r_bolt: 0.0001 }; return k; })(), 's'],
      [2.42, aim, 'l'], [3.2, {}, 's']],
      events: [{ t: 0.78, type: 'fire', kind: 'bolt', at: 'bal_l_muzzle', dir: [0, 0, 1], speed: 48 },
        { t: 1.18, type: 'fire', kind: 'bolt', at: 'bal_r_muzzle', dir: [0, 0, 1], speed: 48 }] };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');

    /* ---- the saucer hull, its dome, the operator */
    R.bone('body', null, 0, 1.95, 0);
    R.on('body');
    F.sph(0, 0.08, 0, 1.45, 0.52, 1.35, steel, 'paint', 20, 10, 0, TAU, 0, Math.PI / 2);
    F.sph(0, 0.08, 0, 1.45, 0.36, 1.35, dk, 'metal', 20, 6, 0, TAU, Math.PI / 2, Math.PI / 2);
    F.tor(0, 0.08, 0, 1.4, 0.07, gun, 'metal', 'y', 28);
    F.tor(0, 0.17, 0, 1.38, 0.025, cr, 'paint', 'y', 28);
    /* orange plates over the shell, like a beetle's markings */
    for (let k = 0; k < 6; k++) {
      const p0 = k * TAU / 6 + 0.25;
      F.sph(0, 0.08, 0, 1.475, 0.535, 1.375, or, 'paint', 4, 3, p0, 0.55, 0.62, 0.62);
    }
    F.sph(0, 0.4, 0.28, 0.66, 0.8, 0.7, c('glass'), 'glass', 16, 10, 0, TAU, 0, Math.PI / 2);
    MP.cage(F, 0, 0.4, 0.28, 0.67, 0.81, 0.71, 0, TAU, 0, Math.PI / 2, 6, 2, 0.022, iron);
    F.tor(0, 0.41, 0.28, 0.68, 0.05, gun, 'metal', 'y', 18);
    MP.pilot(F, R, 'body', 0, 0.06, 0.2, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'), crest: c('crimson'), crestDir: 'along' });
    R.on('body');
    /* the rear hump: cells, a crest, aerials with pennants */
    F.chb(0, 0.5, -0.75, 1.0, 0.45, 0.8, 0.14, gun, 'metal', 'z');
    IZ.crest(F, 0, 0.73, -0.75, 0.9, 0.32, 'along');
    for (const s of [-1, 1]) {
      const A = s > 0 ? 'ant_l' : 'ant_r';
      R.dangle(A, 'body', s * 0.45, 0.68, -1.0, { mode: 'whip', len: 1.6, k: 30, c: 2.2, wind: 0.02, max: 0.45 });
      R.on(A);
      F.cy(0, 0.05, 0, 0.05, 0.05, 0.1, iron, 'metal', 'y', 8);
      F.rod(0, 0, 0, 0, 1.6, 0, 0.013, iron, 'metal');
      R.banner({ bone: A, kind: 'pennant', x: 0, y: 1.5, z: 0, w: 0.75, h: 0.24, paint: s > 0 ? IZ.paint(F, 'stripes') : IZ.paint(F, 'teal') });
    }
    R.on('body');
    /* the face: sun, eyes, mandibles */
    IZ.sun(F, 0, 0.1, 1.38, 0, 0.1, 1, 0.26);
    for (const s of [-1, 1]) MP.lamp(F, s * 0.5, 0.12, 1.28, s * 0.3, 0, 1, 0.08, 'amber', gun);
    for (const s of [-1, 1]) {
      const M = s > 0 ? 'mand_l' : 'mand_r';
      R.bone(M, 'body', s * 0.32, -0.15, 1.22);
      R.on(M);
      MP.joint(F, 0, 0, 0, 0.08, 0.16, 'y', iron, null);
      F.prism(0, 0, 0, [[0, 0], [s * 0.1, 0.05], [s * 0.05, 0.45], [-s * 0.08, 0.55], [-s * 0.02, 0.3]], 0.1, or, 'paint', 'y');
    }
    /* ---- the pods, a ballista on each */
    for (const s of [-1, 1]) {
      const P = s > 0 ? 'pod_l' : 'pod_r', B = s > 0 ? 'bal_l' : 'bal_r';
      R.bone(P, 'body', s * 1.32, 0.2, 0.25);
      R.on(P);
      MP.joint(F, -s * 0.05, 0, 0, 0.22, 0.4, 'x', iron, br);
      F.chb(s * 0.18, 0.1, 0.0, 0.5, 0.42, 0.9, 0.12, steel, 'paint', 'z');
      F.cb(s * 0.18, 0.32, 0.0, 0.52, 0.04, 0.92, or, 'paint');
      IZ.phalera(F, s * 0.44, 0.1, 0.1, s, 0, 0, 0.1);
      MP.ballista(F, R, B, P, s * 0.18, 0.45, 0.05, { len: 1.5, span: 0.85, h: 0.15, wood: c('wood'), iron: iron, bronze: br, rope: c('rope'),
        skein: c('skein'), bolt: c('woodDk'), flight: c('fScarlet') });
      IZ.feathers(F, R, s > 0 ? 'fth_l' : 'fth_r', P, s * 0.44, -0.05, -0.3, { n: 4, len: 0.42, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fTeal'] });
    }
    /* ---- four spider legs */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2];
      R.leg(n, { parent: 'body', hip: [sx * 0.95, -0.12, sz * 0.62], L1: 1.25, L2: 1.6, knee: 1, splay: true, ankleH: 0.18,
        rest: [sx * 2.05, sz * 1.6], toe: 0, footYaw: 0.7 });
      R.on(n + '_yaw');
      F.cy(0, 0, 0, 0.2, 0.2, 0.22, iron, 'metal', 'y', 10);
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.2, 0.36, 'x', iron, br);
      F.chb(0, -0.6, 0, 0.32, 1.05, 0.38, 0.08, steel, 'paint', 'y');
      F.chb(0, -0.6, 0.2, 0.26, 0.9, 0.05, 0.03, or, 'paint', 'x');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.17, 0.32, 'x', iron, br);
      F.cy(0, -0.7, 0, 0.15, 0.09, 1.3, dk, 'metal', 'y', 10);
      F.chb(0, -0.29, 0.05, 0.26, 0.46, 0.3, 0.06, steel, 'paint', 'y');
      MP.piston(F, R, n + '_hip', [0, -0.35, 0.22], n + '_knee', [0, -0.25, 0.16], 0.045, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.75, -0.2, sz * 0.4], n + '_hip', [0, -0.3, -0.2], 0.05, c('rubber'), 0.15);
      R.on(n + '_ankle');
      F.cy(0, -0.06, 0, 0.1, 0.05, 0.24, iron, 'metal', 'y', 8);
      for (let k = 0; k < 3; k++) {
        const a = (k - 1) * 0.7;
        F.rod(0, -0.12, 0, Math.sin(a) * 0.32, -0.16, Math.cos(a) * 0.32, 0.035, gun, 'metal');
        F.cy(Math.sin(a) * 0.36, -0.15, Math.cos(a) * 0.36, 0.035, 0.004, 0.1, br, 'bronze', 'y', 5, Math.PI / 2 + 0.6, a, 0);
      }
    }
  }
});
