/* ======================================================================
   Iziz mech: the Talpa (kits/mechs/krator-mechs-iziz-talpa.js)

   An Ancient tunnel borer: a long hull wrapped in corrugated coolant hoses under a
   pill-bug's segmented back, four beetle legs with three-taloned claws, two crescent
   radiator vanes standing at its tail, and in its faceted nose cowl the old cutter head,
   a drum of seven bore tubes. The Forgemasters made the tubes a polybolos: a rotary
   repeating bolt-thrower fed from the magazines strapped along its flanks. The drum
   spins up and looses a volley, each bolt from whichever barrel is on top. Its rider
   sits a saddle on its back, as a beast rider would.
   ====================================================================== */
/* the crescent vane's outline in its own (z, y) plane: an outer edge sweeping up and back to the tip, an inner edge back down */
function talpaVane() {
  const A = [0.75, 0], C1 = [0.8, 1.9], T = [-1.15, 2.45], C2 = [-0.55, 0.95], B = [-0.45, 0], n = 10, out = [];
  const bz = function (p, q, r, t) { const u = 1 - t; return [u * u * p[0] + 2 * u * t * q[0] + t * t * r[0], u * u * p[1] + 2 * u * t * q[1] + t * t * r[1]]; };
  for (let i = 0; i <= n; i++) out.push(bz(A, C1, T, i / n));
  for (let i = 1; i <= n; i++) out.push(bz(T, C2, B, i / n));
  return out;
}
MECH({
  key: 'iz_talpa', name: 'Talpa', culture: 'iziz',
  role: 'siege crawler: rotary polybolos', origin: 'Ancient tunnel borer',
  lore: 'It bored the Ancients\' tunnels. Its cutter head is a drum of seven tubes now, and the Forgemasters feed it bolts from the magazines along its flanks; it looses a volley a breath long. A rider sits its back like a beast.',
  tags: { class: 'mech', type: ['war machine', 'siege', 'heavy'], drive: 'quadruped', crew: 1, pilot: 'saddle', weapon: ['repeating ballista'],
    setting: 'outdoor', guild: 'Forgemasters' },
  variants: 1, variantNames: ['Borer'],
  w: 3.3, d: 5.7, h: 5.8,
  data: { height: 4.4, mass: 19, crew: 1, pilot: 'saddle', reach: 300, weapon: 'polybolos: a seven-tube rotary bolt-thrower fed from six flank magazines',
    engine: 'Ancient cell pack, coolant-cooled', armour: 'segmented bore shield' },
  gait: { period: 2.0, duty: 0.72, stride: 1.2, lift: 0.36, bob: 0.04, sway: 0.05, roll: 0.025, twist: 0.03, lean: 0,
    offsets: [0.25, 0.75, 0, 0.5] },
  idle: { breathe: 0.03, scan: 0, look: 0.3 },
  attack: (function () {
    const brace = { b: { head: [-0.07, 0, 0], body: [-0.04, 0, 0] }, s: { body: [0, -0.2, 0] } };
    const kick = { b: { head: [-0.1, 0, 0], body: [-0.05, 0, 0] }, s: { body: [0, -0.19, -0.06] } };
    const shots = [0.95, 1.1, 1.25, 1.4, 1.55, 1.7], keys = [[0, {}], [0.6, brace, 's']];
    for (const t of shots) keys.push([t, brace, 's'], [t + 0.04, kick, 'o']);
    keys.push([1.85, brace, 's'], [3.2, {}, 's']);
    return { kind: 'polybolos volley', dur: 3.2, keys: keys,
      events: shots.map(function (t, i) { return { t: t + 0.01, type: 'fire', kind: 'bolt', at: 'muzzle', dir: [0, 0, 1], speed: 55 }; }) };
  })(),

  build: function (F, R) {
    const c = F.col;
    const steel = c('steel'), dk = c('steelDk'), gun = c('gun'), iron = c('iron'), or = c('orange'), cr = c('cream'), br = c('bronze');
    const hose = c('rubber');

    /* ---- the hull: a rear bulb, a corrugated middle, the segmented back */
    R.bone('body', null, 0, 2.6, 0);
    R.on('body');
    F.sph(0, 0.1, -1.55, 0.92, 0.85, 1.15, steel, 'paint', 18, 12);
    F.cy(0, 0.05, -0.25, 0.82, 0.82, 1.9, gun, 'metal', 'z', 18);
    for (let k = 0; k < 15; k++) F.tor(0, 0.05, -1.15 + k * 0.13, 0.84, 0.05, hose, 'rubber', 'z', 18);
    /* the back: arched plates over the hoses, each overlapping the one behind, a cream edge on each */
    const W = Math.PI * 1.15;
    for (let k = 0; k < 4; k++) {
      const z = -1.0 + k * 0.42, r = 0.97 + k * 0.012;
      const g = new THREE.CylinderGeometry(r, r, 0.46, 18, 1, true, Math.PI - W / 2, W);
      g.rotateX(Math.PI / 2);
      _add(new THREE.Mesh(g, mat(k % 2 ? steel : c('steelLt'), 'paint'))).position.set(0, 0.05, z);
      F.tor(0, 0.05, z + 0.23, r + 0.004, 0.03, k % 2 ? or : cr, 'paint', 'z', 18, W, 0, 0, Math.PI / 2 - W / 2);
    }
    F.cb(0, -0.72, -0.3, 1.1, 0.24, 2.6, dk, 'metal');
    /* the magazines along the flanks: bolts stacked in canisters, cone-capped */
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = s * (0.92 + k * 0.04), y = 0.42 - k * 0.32, z = -0.2 + k * 0.12;
      F.cy(x, y, z, 0.16, 0.16, 1.0, steel, 'paint', 'z', 12);
      F.cy(x, y, z + 0.63, 0.15, 0.02, 0.24, iron, 'metal', 'z', 12);
      F.cy(x, y, z - 0.1, 0.178, 0.178, 0.16, or, 'paint', 'z', 12);
      F.cy(x, y, z - 0.53, 0.12, 0.15, 0.06, br, 'bronze', 'z', 12);
    }
    /* the saddle and its rider */
    F.cb(0, 1.02, 0.25, 0.6, 0.12, 0.7, c('leather'), 'leather');
    F.cb(0, 1.25, -0.08, 0.56, 0.42, 0.1, c('leather'), 'leather', -0.2, 0, 0);
    for (const s of [-1, 1]) {
      F.tube([[s * 0.32, 1.02, 0.5], [s * 0.36, 1.32, 0.62], [s * 0.2, 1.42, 0.72]], 0.025, br, 'bronze');
      F.cb(s * 0.34, 0.75, 0.42, 0.04, 0.5, 0.06, c('leather'), 'leather', 0, 0, s * 0.25);
    }
    F.sph(0, 1.08, 0.82, 0.42, 0.42, 0.2, c('glass'), 'glass', 12, 6, Math.PI * 0.15, Math.PI * 0.7, 0, Math.PI / 2);
    MP.pilot(F, R, 'body', 0, 1.08, 0.2, { tunic: c('tunic'), trousers: c('trousers'), skin: c('skin'), helm: br, harness: c('leather'),
      crest: c('crimson'), crestDir: 'along', lean: 0.18 });
    R.on('body');
    for (const s of [-1, 1]) { F.cb(s * 0.11, 0.86, 0.66, 0.16, 0.12, 0.3, c('leather'), 'leather'); }

    /* ---- the crescent vanes at the tail: radiators, the sun painted on each; stiff springs, so they quiver at each step */
    const V = talpaVane();
    for (const s of [-1, 1]) {
      const n = s > 0 ? 'vane_l' : 'vane_r';
      R.dangle(n, 'body', s * 0.32, 0.72, -1.55, { mode: 'whip', len: 2.2, k: 45, c: 4.5, wind: 0.008, max: 0.1, rz: -s * 0.32 });
      R.on(n);
      F.cy(0, 0.06, 0.15, 0.2, 0.26, 0.16, iron, 'metal', 'y', 10);
      F.prism(0, 0, 0, V, 0.04, steel, 'paint', 'x');
      for (let i = 0; i < V.length - 1; i++) {
        F.rod(0, V[i][1], V[i][0], 0, V[i + 1][1], V[i + 1][0], 0.045, or, 'paint');
      }
      for (const t of [0.25, 0.5, 0.75]) {
        const o = V[Math.round(t * 10)], q = V[20 - Math.round(t * 10)];
        F.rod(0, o[1], o[0], 0, q[1], q[0], 0.03, or, 'paint');
        F.rod(0.045, o[1], o[0], 0.045, q[1], q[0], 0.012, dk, 'metal');
      }
      IZ.sun(F, s * 0.045, 1.05, 0.0, s, 0, 0, 0.28, null, null);
      IZ.feathers(F, R, n + '_fth', n, 0, V[10][1] - 0.05, V[10][0] + 0.05, { n: 4, len: 0.5, cols: s > 0 ? ['fScarlet', 'fGold'] : ['fGreen', 'fTeal'] });
    }

    /* ---- the head: the faceted cowl, the bore drum spinning in it */
    R.bone('head', 'body', 0, 0.02, 0.65);
    R.on('head');
    F.cy(0, 0, 0.6, 0.86, 0.62, 1.2, steel, 'paint', 'z', 8);
    F.cy(0, 0, 0.6, 0.802, 0.702, 0.5, or, 'paint', 'z', 8);
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8 + TAU / 16;
      F.rod(Math.cos(a) * 0.87, Math.sin(a) * 0.87, 0.0, Math.cos(a) * 0.64, Math.sin(a) * 0.64, 1.2, 0.025, dk, 'metal');
    }
    F.tor(0, 0, 1.2, 0.62, 0.06, br, 'bronze', 'z', 16);
    F.cy(0, 0, 1.15, 0.6, 0.6, 0.06, gun, 'metal', 'z', 16, 0, 0, 0, true);
    for (const s of [-1, 1]) {
      MP.lamp(F, s * 0.5, 0.42, 1.0, s * 0.2, 0.1, 1, 0.07, 'amber', gun);
      IZ.phalerae(F, s * 0.8, 0.2, 0.45, s, 0, 0.35, 2, 0.24, 0.09);
    }
    R.spin('drum', 'head', 0, 0, 1.18, 'z', { idle: 0.3, walk: 0.3, attack: 14 });
    R.on('drum');
    F.cy(0, 0, 0.2, 0.2, 0.2, 0.5, iron, 'metal', 'z', 10);
    for (let k = 0; k < 7; k++) {
      const a = k * TAU / 7, x = Math.cos(a) * 0.36, y = Math.sin(a) * 0.36;
      F.cy(x, y, 0.42, 0.095, 0.095, 0.9, dk, 'metal', 'z', 8);
      F.cy(x, y, 0.88, 0.115, 0.115, 0.06, br, 'bronze', 'z', 8);
      F.cy(x, y, 0.92, 0.06, 0.06, 0.03, c('iron'), 'metal', 'z', 8);
    }
    F.cy(0, 0, 0.6, 0.47, 0.47, 0.05, steel, 'metal', 'z', 14);
    F.cy(0, 0, 0.1, 0.47, 0.47, 0.05, steel, 'metal', 'z', 14);
    R.point('muzzle', 'drum', 0, 0.36, 0.98);
    IZ.feathers(F, R, 'fth_cowl', 'head', 0.7, -0.45, 0.3, { n: 5, len: 0.5 });
    /* coolant hoses from the hull into the cowl */
    for (const s of [-1, 1]) MP.hose(F, R, 'body', [s * 0.55, 0.55, -0.4], 'head', [s * 0.45, 0.45, 0.15], 0.085, hose, 0.05, 6);

    /* ---- four beetle legs, knees up and back, three-taloned claws */
    const legs = [['leg_fl', 1, 1], ['leg_fr', -1, 1], ['leg_rl', 1, -1], ['leg_rr', -1, -1]];
    for (const L of legs) {
      const n = L[0], sx = L[1], sz = L[2], front = sz > 0, L2T = 1.45;
      R.leg(n, { parent: 'body', hip: [sx * 0.72, -0.45, front ? 0.55 : -1.35], L1: 1.3, L2: 1.45, knee: -1, ankleH: 0.42,
        rest: [sx * 1.25, front ? 1.2 : -1.85], toe: 0.2 });
      R.on(n + '_hip');
      MP.joint(F, 0, 0, 0, 0.26, 0.4, 'x', iron, br);
      F.chb(0, -0.42, 0, 0.42, 0.72, 0.5, 0.1, steel, 'paint', 'y');
      F.chb(0, -0.98, 0, 0.38, 0.5, 0.46, 0.1, or, 'paint', 'y');
      F.cb(sx * 0.2, -0.98, 0, 0.02, 0.4, 0.3, cr, 'paint');
      R.on(n + '_knee');
      MP.joint(F, 0, 0, 0, 0.21, 0.4, 'x', iron, br);
      F.chb(0, -0.38, 0, 0.36, 0.62, 0.42, 0.08, steel, 'paint', 'y');
      F.chb(0, -1.02, 0, 0.3, 0.76, 0.36, 0.08, dk, 'paint', 'y');
      MP.joint(F, 0, -L2T, 0, 0.15, 0.3, 'x', iron, null);
      F.chb(0, -0.5, -0.24, 0.26, 0.5, 0.06, 0.03, or, 'paint', 'x');
      MP.piston(F, R, n + '_hip', [0, -0.3, -0.3], n + '_knee', [0, -0.3, -0.24], 0.055, dk, c('chrome'));
      MP.hose(F, R, 'body', [sx * 0.6, -0.5, front ? 0.25 : -1.05], n + '_hip', [0, -0.55, 0.28], 0.075, hose, 0.15, 7);
      R.on(n + '_ankle');
      F.cy(0, -0.12, 0, 0.15, 0.19, 0.3, iron, 'metal', 'y', 10);
      F.chb(0, -0.25, 0.05, 0.42, 0.22, 0.42, 0.06, steel, 'paint', 'z');
      const tal = front ? 0.62 : 0.5;
      for (let k = 0; k < 3; k++) {
        const ang = (k - 1) * 0.45, dx = Math.sin(ang), dz = Math.cos(ang);
        F.rod(dx * 0.1, -0.28, dz * 0.12, dx * tal * 0.55, -0.3, dz * tal * 0.55, 0.06, gun, 'metal');
        F.rod(dx * tal * 0.55, -0.3, dz * tal * 0.55, dx * tal, -0.37, dz * tal, 0.045, gun, 'metal');
        F.cy(dx * (tal + 0.07), -0.36, dz * (tal + 0.07), 0.05, 0.004, 0.2, c('chrome'), 'chrome', 'y', 6, Math.PI / 2 + 0.35, Math.atan2(dx, dz), 0);
      }
      F.rod(0, -0.28, -0.08, 0, -0.36, -0.36, 0.05, gun, 'metal');
      F.cy(0, -0.37, -0.43, 0.04, 0.004, 0.16, c('chrome'), 'chrome', 'y', 6, -Math.PI / 2 - 0.35, 0, 0);
    }
  }
});
