/* ======================================================================
   Krator Mechs: the parts library (kits/mechs/mechs-parts.js)

   Culture-neutral parts every mech draws with: joints, pistons and hoses between
   two bones, tube cages and glass canopies, feet, a torsion ballista with its own
   bones, a seated pilot, ducted fans, tanks, wheels, a saw, an auger and cargo.
   Colours are passed in as numbers (the caller's F.col), so a culture file decides
   the livery. Every part draws into the current bone (R.on) in that bone's frame,
   except the R.link ones (piston, hose, cable), which take two bones.

   MP.basis(nx, ny, nz)      -> [u, v]: two unit vectors spanning the plane facing n
   MP.joint, MP.piston, MP.hose, MP.cable, MP.cage, MP.lamp, MP.tank, MP.wheel, MP.fan, MP.saw,
   MP.auger, MP.ballista, MP.pilot, MP.foot (stomp | claw | track | pad), MP.crate, MP.barrel, MP.bundle
   ====================================================================== */
const MP = {};

MP.basis = function (nx, ny, nz) {
  const n = new THREE.Vector3(nx, ny, nz).normalize();
  const t = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const u = new THREE.Vector3().crossVectors(t, n).normalize(), v = new THREE.Vector3().crossVectors(n, u);
  return [u, v, n];
};

/* a joint drum: a cylinder of radius r and width w along axis, with hub caps of colour cap */
MP.joint = function (F, x, y, z, r, w, axis, col, cap, fam) {
  /* the drum stands 16 mm proud each side, so its ends never share a plane with a limb drawn exactly w wide */
  const W = w + 0.032;
  F.cy(x, y, z, r, r, W, col, fam || 'metal', axis, 12);
  if (cap != null) {
    const o = W / 2 + 0.013, d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
    for (const s of [-1, 1]) {
      F.cy(x + d[0] * s * o, y + d[1] * s * o, z + d[2] * s * o, r * 0.62, r * 0.62, 0.024, cap, 'bronze', axis, 10);
      F.cy(x + d[0] * s * (o + 0.03), y + d[1] * s * (o + 0.03), z + d[2] * s * (o + 0.03), r * 0.22, r * 0.22, 0.04, cap, 'bronze', axis, 6);
    }
  }
};

/* a hydraulic ram between bone a (point pa) and bone b (point pb): a sleeve from a, a rod to b, eye ends.
   Weighted along its length, so it stays on the line between the two joints. */
MP.piston = function (F, R, a, pa, b, pb, r, sleeve, rod) {
  R.link(a, pa, b, pb, function (A, B) {
    const M = A.clone().lerp(B, 0.58), N = A.clone().lerp(B, 0.48);
    F.rod(A.x, A.y, A.z, M.x, M.y, M.z, r, sleeve, 'metal');
    F.rod(N.x, N.y, N.z, B.x, B.y, B.z, r * 0.55, rod, 'chrome');
    F.knob(A.x, A.y, A.z, r * 1.25, sleeve, 'metal');
    F.knob(B.x, B.y, B.z, r * 1.1, sleeve, 'metal');
    const C = A.clone().lerp(B, 0.57);
    F.rod(M.x, M.y, M.z, C.x, C.y, C.z, r * 1.25, sleeve, 'metal');
  });
};
/* a hose (or a bundle of cable) sagging a little between two bones: segments, so it bends with the joint */
MP.hose = function (F, R, a, pa, b, pb, r, col, sag, segs) {
  R.link(a, pa, b, pb, function (A, B) {
    const n = segs || 6, s = sag == null ? 0.12 : sag;
    let P = A.clone();
    for (let i = 1; i <= n; i++) {
      const t = i / n, Q = A.clone().lerp(B, t);
      Q.y -= s * Math.sin(Math.PI * t) * A.distanceTo(B);
      F.rod(P.x, P.y, P.z, Q.x, Q.y, Q.z, r, col, 'rubber');
      if (i < n) F.knob(Q.x, Q.y, Q.z, r * 1.02, col, 'rubber');
      P = Q;
    }
  });
};
/* a straight rope or string between two bones (a ballista string, a crane cable) */
MP.cable = function (F, R, a, pa, b, pb, r, col, fam) {
  R.link(a, pa, b, pb, function (A, B) { F.rod(A.x, A.y, A.z, B.x, B.y, B.z, r, col, fam || 'rope'); });
};

/* a cage of tube over part of an ellipsoid (radii a, b, c, centred at (x, y, z)): nu meridians across
   phi (round y; pi/2 looks along +z) and nv parallels across theta (down from the top) */
MP.cagePt = function (x, y, z, a, b, c, phi, th) {
  return [x - Math.cos(phi) * Math.sin(th) * a, y + Math.cos(th) * b, z + Math.sin(phi) * Math.sin(th) * c];
};
MP.cage = function (F, x, y, z, a, b, c, phi0, dphi, th0, dth, nu, nv, r, col, fam) {
  const P = function (i, j) { return MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * j / nv); };
  const sub = 3;
  for (let i = 0; i <= nu; i++) for (let j = 0; j < nv * sub; j++) {
    const p = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * j / (nv * sub)), q = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / nu, th0 + dth * (j + 1) / (nv * sub));
    F.rod(p[0], p[1], p[2], q[0], q[1], q[2], r, col, fam || 'metal');
  }
  for (let j = 0; j <= nv; j++) for (let i = 0; i < nu * sub; i++) {
    const p = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * i / (nu * sub), th0 + dth * j / nv), q = MP.cagePt(x, y, z, a, b, c, phi0 + dphi * (i + 1) / (nu * sub), th0 + dth * j / nv);
    F.rod(p[0], p[1], p[2], q[0], q[1], q[2], r, col, fam || 'metal');
  }
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = P(i, j); F.knob(p[0], p[1], p[2], r * 1.6, col, fam || 'metal'); }
};

/* a lamp with a housing: lens r facing (dx, dy, dz) */
MP.lamp = function (F, x, y, z, dx, dy, dz, r, kind, housing) { F.lamp(x, y, z, dx, dy, dz, r, kind || 'head', housing, housing); };

/* a tank: a cylinder with domed ends and bands */
MP.tank = function (F, x, y, z, r, len, axis, col, band, nb, fam) {
  F.cy(x, y, z, r, r, len, col, fam || 'bronze', axis, 14);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
  for (const s of [-1, 1]) {
    const cx = x + d[0] * s * len / 2, cy = y + d[1] * s * len / 2, cz = z + d[2] * s * len / 2;
    const rot = axis === 'x' ? [0, 0, -s * Math.PI / 2] : axis === 'z' ? [s * Math.PI / 2, 0, 0] : [s < 0 ? Math.PI : 0, 0, 0];
    F.sph(cx, cy, cz, r, r * 0.45, r, col, fam || 'bronze', 14, 5, 0, TAU, 0, Math.PI / 2, rot[0], rot[1], rot[2]);
  }
  for (let i = 0; i < (nb || 0); i++) {
    const t = (i + 0.5) / nb - 0.5;
    F.cy(x + d[0] * t * len * 0.9, y + d[1] * t * len * 0.9, z + d[2] * t * len * 0.9, r * 1.04, r * 1.04, 0.05, band, 'metal', axis, 14);
  }
};

/* a road wheel (tyre, rim, hub) of radius r and width w, axle along axis */
MP.wheel = function (F, x, y, z, r, w, axis, tyre, rim, hub) {
  F.cy(x, y, z, r, r, w, tyre, 'rubber', axis, 18);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'y' ? [0, 1, 0] : [0, 0, 1];
  for (const s of [-1, 1]) {
    const o = w / 2 + 0.016;
    F.cy(x + d[0] * s * o, y + d[1] * s * o, z + d[2] * s * o, r * 0.66, r * 0.66, 0.02, rim, 'metal', axis, 16);
    F.cy(x + d[0] * s * (o + 0.03), y + d[1] * s * (o + 0.03), z + d[2] * s * (o + 0.03), r * 0.2, r * 0.26, 0.06, hub, 'metal', axis, 8);
  }
};

/* a ducted fan facing +z on a spin bone `name` (built here, child of parent at x, y, z): duct, struts, blades, spinner */
MP.fan = function (F, R, name, parent, x, y, z, r, depth, duct, blade, spinner, rates, rx, ry, rz) {
  R.bone(name + '_duct', parent, x, y, z, rx, ry, rz);
  R.on(name + '_duct');
  F.cy(0, 0, 0, r, r, depth, duct, 'paint', 'z', 20, 0, 0, 0, true);
  F.cy(0, 0, 0, r * 0.98, r * 0.98, depth * 0.96, F.shade(duct, -0.5), 'metal', 'z', 20, 0, 0, 0, true);
  F.tor(0, 0, depth / 2, r, 0.05, duct, 'paint', 'z', 20);
  F.tor(0, 0, -depth / 2, r, 0.05, duct, 'paint', 'z', 20);
  for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + 0.4; F.rod(0, 0, -depth * 0.3, Math.cos(a) * r, Math.sin(a) * r, -depth * 0.3, 0.025, F.shade(duct, -0.4), 'metal'); }
  F.cy(0, 0, -depth * 0.2, r * 0.3, r * 0.22, depth * 0.6, F.shade(duct, -0.4), 'metal', 'z', 10);
  R.spin(name, name + '_duct', 0, 0, depth * 0.08, 'z', rates);
  R.on(name);
  for (let k = 0; k < 7; k++) {
    const a = k * TAU / 7;
    F.cb(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, 0, r * 0.62, r * 0.17, 0.02, blade, 'metal', 0.45, 0, a, 'ZXY');
  }
  F.sph(0, 0, 0.02, r * 0.24, r * 0.24, r * 0.42, spinner, 'paint', 10, 6, 0, TAU, 0, Math.PI / 2, Math.PI / 2, 0, 0);
};

/* a toothed saw disc of radius r facing x (a spin bone about x) */
MP.saw = function (F, r, t, disc, teeth, hub) {
  F.cy(0, 0, 0, r, r, t, disc, 'metal', 'x', 24);
  const n = 28;
  for (let k = 0; k < n; k++) {
    const a = k * TAU / n, a2 = a + TAU / n * 0.7, r2 = r * 1.1;
    for (const s of [-1, 1]) F.poly(s < 0
      ? [[s * t * 0.4, Math.sin(a) * r, Math.cos(a) * r], [s * t * 0.4, Math.sin(a) * r2, Math.cos(a) * r2], [s * t * 0.4, Math.sin(a2) * r, Math.cos(a2) * r]]
      : [[s * t * 0.4, Math.sin(a) * r, Math.cos(a) * r], [s * t * 0.4, Math.sin(a2) * r, Math.cos(a2) * r], [s * t * 0.4, Math.sin(a) * r2, Math.cos(a) * r2]], teeth, 'metal');
  }
  F.cy(0, 0, 0, r * 0.28, r * 0.28, t * 3, hub, 'bronze', 'x', 10);
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6; F.cy(t * 1.6, Math.sin(a) * r * 0.18, Math.cos(a) * r * 0.18, 0.025, 0.025, 0.04, hub, 'bronze', 'x', 6); }
};

/* an auger along +z: a cone of length len and radius r with a helical flight (the bone spins about z) */
MP.auger = function (F, len, r, turns, core, flight) {
  F.cy(0, 0, len * 0.45, r * 0.35, 0.04, len * 0.9, core, 'metal', 'z', 10);
  F.cy(0, 0, -len * 0.04, r * 0.4, r * 0.4, len * 0.12, core, 'metal', 'z', 10);
  const n = Math.round(turns * 14);
  for (let i = 0; i < n; i++) {
    const t = i / n, a = t * turns * TAU, z = len * t * 0.88, rr = r * (1 - t * 0.85) + 0.05;
    F.cb(Math.cos(a) * rr * 0.62, Math.sin(a) * rr * 0.62, z, rr * 0.75, 0.03, len / n * 1.6, flight, 'metal', 0.5, 0, a, 'ZXY');
  }
};

/* ---------------------------------------------------------------- the ballista
   A torsion bolt-thrower on its own bones, built cocked (string drawn, bolt in the trough). Bones, all made
   here: <name> (the stock, at (x, y, z) on parent, turned rx, ry, rz), <name>_bowL / <name>_bowR (the arms, at
   the skeins; ry turns them), <name>_nut (the claw that holds the string; it slides along z), <name>_bolt (the
   loaded bolt, child of the nut; scale 0 hides it once loosed). The strings are links from the arm tips to the
   nut, so they follow both. Point <name>_muzzle at the front of the trough. o: { len, span, h, wood, iron,
   bronze, rope, skein, bolt, flight }. Returns { draw: how far the nut travels when loosed }. */
MP.ballista = function (F, R, name, parent, x, y, z, o, rx, ry, rz) {
  const L = o.len || 1.6, S = o.span || 0.9, H = o.h || 0.16, zf = L * 0.3, zn = -L * 0.32, wS = S * 0.32;
  R.bone(name, parent, x, y, z, rx, ry, rz);
  R.on(name);
  /* the stock and the trough */
  F.cb(0, 0, -L * 0.08, H * 0.9, H, L, o.wood, 'wood');
  F.cb(0, H * 0.6, -L * 0.04, H * 0.5, 0.04, L * 0.95, F.shade(o.wood, -0.25), 'wood');
  for (const s of [-1, 1]) F.cb(s * H * 0.3, H * 0.6, -L * 0.04, 0.03, 0.06, L * 0.99, o.iron, 'metal');
  /* the capitulum: a frame holding the two skeins, bronze washers top and bottom */
  F.cb(0, H * 0.3, zf, wS * 2 + 0.22, 0.08, 0.2, o.wood, 'wood');
  F.cb(0, -H * 0.5, zf, wS * 2 + 0.22, 0.08, 0.2, o.wood, 'wood');
  for (const s of [-1, 1]) {
    F.cy(s * wS, -0.1 * H, zf, 0.075, 0.075, H * 2.2, o.skein, 'rope', 'y', 10);
    for (const t of [-1, 1]) F.cy(s * wS, -0.1 * H + t * H * 1.17, zf, 0.1, 0.1, 0.05, o.bronze, 'bronze', 'y', 10);
    F.cb(s * (wS + 0.13), -0.1 * H, zf, 0.05, H * 2.2, 0.16, o.wood, 'wood');
  }
  /* the winch at the back */
  F.cy(0, 0, -L * 0.56, 0.07, 0.07, H * 2.6, o.wood, 'wood', 'x', 8);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.3;
    F.rod(s * H * 1.3, 0, -L * 0.56, s * H * 1.3, Math.sin(a) * 0.2, -L * 0.56 + Math.cos(a) * 0.2, 0.018, o.iron, 'metal');
  }
  R.point(name + '_muzzle', name, 0, H * 0.75, L * 0.42);
  /* the arms: each from its skein outward and back (cocked) */
  const tip = [S, 0, -S * 0.42];
  for (const s of [-1, 1]) {
    const bn = name + (s > 0 ? '_bowL' : '_bowR');
    R.bone(bn, name, s * wS, -0.1 * H, zf);
    R.on(bn);
    F.rod(0, 0, 0, s * tip[0] * 0.97, tip[1], tip[2] * 0.97, 0.045, o.wood, 'wood');
    F.rod(s * tip[0] * 0.45, 0, tip[2] * 0.45, s * tip[0], 0, tip[2], 0.058, o.iron, 'metal');
    F.knob(s * tip[0], tip[1], tip[2], 0.06, o.bronze, 'bronze');
  }
  /* the nut (claw and trigger), the bolt on it */
  R.bone(name + '_nut', name, 0, H * 0.62, zn);
  R.on(name + '_nut');
  F.cb(0, 0.045, -0.06, H * 0.7, 0.1, 0.22, o.bronze, 'bronze');
  F.cb(0, 0.09, -0.12, 0.05, 0.08, 0.06, o.iron, 'metal');
  R.bone(name + '_bolt', name + '_nut', 0, 0.05, 0.02);
  R.on(name + '_bolt');
  const bl = L * 0.82;
  F.rod(0, 0, 0, 0, 0, bl, 0.028, o.bolt, 'wood');
  F.cy(0, 0, bl + 0.09, 0.05, 0.004, 0.2, o.iron, 'metal', 'z', 6);
  for (let k = 0; k < 3; k++) {
    const a = k * TAU / 3;
    F.tri([0, 0, 0.05], [Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.03], [0, 0, 0.26], o.flight, 'feather');
  }
  /* the strings: arm tips to the claw */
  for (const s of [-1, 1]) MP.cable(F, R, name + (s > 0 ? '_bowL' : '_bowR'), [s * tip[0], tip[1], tip[2]], name + '_nut', [0, 0.08, 0], 0.016, o.rope);
  return { draw: zf - zn - 0.12, len: L };
};

/* ---------------------------------------------------------------- the pilot
   A seated pilot of about 1.75 m, sat at (x, y, z) (the seat's top, under the hips) facing +z, in the current
   bone; a bone <bone>_pilotHead (made here) carries the head, so the idle layer can turn it. o: { tunic, skin,
   helm, crest, harness, crestDir ('across' | 'along'), lean } */
MP.pilot = function (F, R, bone, x, y, z, o) {
  R.on(bone);
  const lean = o.lean || 0.1;
  /* thighs and shins */
  for (const s of [-1, 1]) {
    F.cb(x + s * 0.11, y + 0.08, z + 0.22, 0.15, 0.15, 0.46, o.trousers || o.tunic, 'cloth');
    F.cb(x + s * 0.11, y - 0.14, z + 0.44, 0.13, 0.44, 0.13, o.trousers || o.tunic, 'cloth');
    F.cb(x + s * 0.11, y - 0.385, z + 0.49, 0.155, 0.1, 0.28, o.harness, 'leather');
  }
  /* torso, belt, harness straps, shoulders */
  F.cb(x, y + 0.42, z - 0.02, 0.4, 0.56, 0.24, o.tunic, 'cloth', -lean, 0, 0);
  F.cb(x, y + 0.2, z, 0.43, 0.08, 0.27, o.harness, 'leather', -lean, 0, 0);
  for (const s of [-1, 1]) F.cb(x + s * 0.09, y + 0.4, z + 0.125, 0.05, 0.44, 0.02, o.harness, 'leather', -lean, 0, s * 0.18);
  F.cb(x, y + 0.66, z - 0.03, 0.5, 0.12, 0.26, o.helm, 'bronze', -lean, 0, 0);
  /* arms to the levers */
  for (const s of [-1, 1]) {
    F.rod(x + s * 0.23, y + 0.62, z - 0.02, x + s * 0.25, y + 0.36, z + 0.14, 0.055, o.tunic, 'cloth');
    F.rod(x + s * 0.25, y + 0.36, z + 0.14, x + s * 0.2, y + 0.32, z + 0.42, 0.048, o.tunic, 'cloth');
    F.knob(x + s * 0.2, y + 0.32, z + 0.45, 0.05, o.skin, 'skin');
  }
  /* the head: its own bone */
  const hb = bone + '_pilotHead';
  R.bone(hb, bone, x, y + 0.76, z - 0.04 + 0.08 * lean);
  R.on(hb);
  F.cy(0, 0.03, 0, 0.05, 0.05, 0.08, o.skin, 'skin');
  F.sph(0, 0.15, 0.01, 0.1, 0.12, 0.11, o.skin, 'skin', 10, 7);
  /* a legionary helmet: bowl, neck guard, cheek pieces, crest */
  F.sph(0, 0.17, 0, 0.12, 0.11, 0.125, o.helm, 'bronze', 12, 6, 0, TAU, 0, Math.PI * 0.55);
  F.cb(0, 0.12, -0.11, 0.24, 0.04, 0.08, o.helm, 'bronze', -0.5, 0, 0);
  for (const s of [-1, 1]) F.cb(s * 0.11, 0.09, 0.05, 0.02, 0.11, 0.08, o.helm, 'bronze');
  F.cb(0, 0.285, 0, 0.055, 0.05, 0.055, o.helm, 'bronze');
  if (o.crest != null) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8, rr = 0.15 + (i % 2) * 0.012; pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.75]); }
    F.prism(0, 0.3, 0, pts, 0.035, o.crest, 'hair', o.crestDir === 'along' ? 'x' : 'z');
  }
};

/* ---------------------------------------------------------------- feet
   Drawn on the ankle bone: the sole's underside at y = -ankleH, toes toward +z. o: { kind, w, l, ankleH, plate,
   iron, trim, toes } */
MP.foot = function (F, o) {
  const a = o.ankleH, w = o.w, l = o.l, k = o.kind || 'stomp';
  if (k === 'stomp') {
    F.chb(0, -a + 0.09, l * 0.08, w, 0.18, l, 0.06, o.iron, 'metal', 'z');
    F.chb(0, -a + 0.25, l * 0.02, w * 0.86, 0.16, l * 0.78, 0.06, o.plate, 'paint', 'z');
    F.chb(0, -a + 0.17, l * 0.5, w * 0.92, 0.2, l * 0.22, 0.05, o.plate, 'paint', 'x', -0.35, 0, 0);
    F.cb(0, -a + 0.2, -l * 0.42, w * 0.6, 0.24, l * 0.16, o.iron, 'metal');
    for (let i = 0; i < (o.toes || 3); i++) {
      const tx = (i - ((o.toes || 3) - 1) / 2) * w * 0.32;
      F.chb(tx, -a + 0.07, l * 0.6, w * 0.24, 0.14, l * 0.2, 0.04, o.iron, 'metal', 'z');
    }
    F.cy(0, -a * 0.3, 0, 0.16, 0.2, a * 0.9, o.iron, 'metal', 'y', 10);
  } else if (k === 'claw') {
    F.chb(0, -a + 0.2, 0, w * 0.5, 0.3, l * 0.4, 0.06, o.plate, 'paint', 'z');
    const toes = o.toes || 3;
    for (let i = 0; i < toes; i++) {
      const ang = (i - (toes - 1) / 2) * 0.5;
      const dx = Math.sin(ang), dz = Math.cos(ang);
      F.rod(0, -a + 0.22, 0, dx * l * 0.38, -a + 0.14, dz * l * 0.38, 0.07, o.iron, 'metal');
      F.rod(dx * l * 0.38, -a + 0.14, dz * l * 0.38, dx * l * 0.55, -a + 0.03, dz * l * 0.55, 0.055, o.iron, 'metal');
      F.cy(dx * l * 0.6, -a + 0.09, dz * l * 0.6, 0.06, 0.005, 0.18, o.trim, 'bronze', 'y', 6, Math.PI / 2 + 0.5, Math.atan2(dx, dz), 0);
      F.cb(dx * l * 0.38, -a + 0.15, dz * l * 0.38, 0.13, 0.1, 0.13, o.plate, 'paint', 0, Math.atan2(dx, dz), 0);
    }
    F.rod(0, -a + 0.2, 0, 0, -a + 0.05, -l * 0.4, 0.06, o.iron, 'metal');
    F.cy(0, -a + 0.07, -l * 0.47, 0.06, 0.005, 0.14, o.trim, 'bronze', 'y', 6, -Math.PI / 2 - 0.4, 0, 0);
    F.cy(0, -a * 0.35, 0, 0.13, 0.17, a * 0.8, o.iron, 'metal', 'y', 10);
  } else if (k === 'track') {
    F.chb(0, -a + 0.22, 0, w, 0.44, l, 0.2, o.iron, 'rubber', 'x');
    for (let i = 0; i < 9; i++) {
      const t = (i / 8 - 0.5) * l * 0.82;
      F.cb(0, -a + 0.015, t, w * 1.02, 0.04, 0.07, o.iron, 'rubber');
    }
    for (const s of [-1, 1]) {
      F.cb(s * (w / 2 + 0.04), -a + 0.24, 0, 0.06, 0.3, l * 0.86, o.plate, 'paint');
      for (let i = 0; i < 3; i++) F.cy(s * (w / 2 + 0.08), -a + 0.24, (i - 1) * l * 0.3, 0.09, 0.09, 0.05, o.trim, 'bronze', 'x', 10);
    }
    F.cy(0, -a * 0.3, 0, 0.17, 0.22, a * 0.75, o.iron, 'metal', 'y', 10);
  } else {   /* pad: a round elephant foot */
    F.cy(0, -a + 0.14, 0, w / 2, w / 2 * 1.06, 0.28, o.iron, 'metal', 'y', 16);
    F.cy(0, -a + 0.34, 0, w / 2 * 0.86, w / 2 * 0.96, 0.14, o.plate, 'paint', 'y', 16);
    for (let i = 0; i < (o.toes || 4); i++) {
      const ang = (i - ((o.toes || 4) - 1) / 2) * 0.55;
      F.cb(Math.sin(ang) * w * 0.48, -a + 0.1, Math.cos(ang) * w * 0.48, 0.16, 0.18, 0.14, o.trim, 'bronze', 0, ang, 0);
    }
    F.cy(0, -a * 0.3, 0, 0.18, 0.24, a * 0.8, o.iron, 'metal', 'y', 10);
  }
};

/* ---------------------------------------------------------------- cargo */
MP.crate = function (F, x, y, z, w, h, d, wood, band, ry) {
  F.cb(x, y + h / 2, z, w, h, d, wood, 'wood', 0, ry || 0, 0);
  F.cb(x, y + h / 2, z, w + 0.02, 0.05, d + 0.02, band, 'metal', 0, ry || 0, 0);
};
MP.barrel = function (F, x, y, z, r, h, wood, band, axis) {
  F.cy(x, y, z, r * 0.92, r * 0.92, h, wood, 'wood', axis || 'y', 10);
  F.cy(x, y, z, r, r, h * 0.5, wood, 'wood', axis || 'y', 10);
  const d = axis === 'x' ? [1, 0, 0] : axis === 'z' ? [0, 0, 1] : [0, 1, 0];
  for (const t of [-0.36, 0.36]) F.cy(x + d[0] * t * h, y + d[1] * t * h, z + d[2] * t * h, r * 0.96, r * 0.96, 0.04, band, 'metal', axis || 'y', 10);
};
/* a rolled bundle (bedroll, tarp) tied with two cords */
MP.bundle = function (F, x, y, z, r, len, cloth, cord, axis) {
  F.cy(x, y, z, r, r, len, cloth, 'cloth', axis || 'x', 10);
  const d = axis === 'z' ? [0, 0, 1] : axis === 'y' ? [0, 1, 0] : [1, 0, 0];
  for (const t of [-0.3, 0.3]) F.cy(x + d[0] * t * len, y + d[1] * t * len, z + d[2] * t * len, r * 1.04, r * 1.04, 0.04, cord, 'rope', axis || 'x', 10);
};
