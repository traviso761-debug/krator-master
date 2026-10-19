/* ============================== 5c. A FEW CITIZENS DRAWN NEAR THE CAMERA (P7b) ============================== */
/* [web] The drawn town's people where core/simulation says they are (SIM.pose: a pure function of the motion time),
   within `radius` metres of the camera's target, the nearest `cap` of them; nobody indoors (a pose's `hidden`), no carts.
   Every `every` ms the town's people are posed cheaply (a lazy leg read as its straight line) and the nearest chosen;
   between choices the chosen are posed in full each frame the clock has moved. The figures are STAND-INS (core/charactermodels
   has no light path into a settlement yet: its README, "Replace the citizen stand-ins", asks for a crowd cost plan
   first): one instanced body and one instanced head, a figure 1.7 m tall facing its heading, coloured by what it does
   (`colours`: workers by their kind of work, the kin by their house's class). Poses are in world metres; the page's
   frame is the town's (the frame subtracted, the sea at 0).
     ISLE.citizens.tick(now)        from the page's frame loop
     ISLE.citizens.update()         choose and pose now (verify.py's)
     ISLE.citizens.check(o)         {name, ok, detail}: some drawn, no more than the cap, each within the radius of the
                                    target, each where its actor's pose is (0.5 m), none of them hidden. o.shift moves one
                                    drawn figure 50 m (the negative) */
ISLE.citizens = { cap: 120, radius: 260, every: 500, at: -1e9, t: null, sel: [], mesh: null, head: null, stats: { chosen: 0, near: 0, hidden: 0 },
  colours: { farmhand: 0x7a9a3a, fisher: 0x3a7a9a, docker: 0x8a6a4a, trader: 0xc89a3a, baker: 0xd8c8a0, keeper: 0xa04a3a, craftsman: 0x6a5a8a,
    labourer: 0x8a8a7a, groom: 0x5a7a5a, soldier: 0x9a2a2a, official: 0xe8e0c8, poor: 0xb8a890, middle: 0xc8b898, rich: 0xd8c8f0, cart: 0x6a4a2a } };
ISLE.citizens.build = function () {
  var C = ISLE.citizens; if (C.mesh) return;
  var body = new THREE.CylinderGeometry(0.2, 0.26, 1.35, 7); body.translate(0, 0.675, 0);
  var head = new THREE.SphereGeometry(0.17, 8, 6); head.translate(0, 1.52, 0);
  var mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  C.mesh = new THREE.InstancedMesh(body, mat, C.cap); C.head = new THREE.InstancedMesh(head, new THREE.MeshLambertMaterial({ color: 0x8a5a3a }), C.cap);
  /* the colours' buffer at the cap, before the first draw (three r128 sizes it from the count, which is 0 below) */
  C.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(C.cap * 3).fill(1), 3);
  [C.mesh, C.head].forEach(function (m) { m.count = 0; m.frustumCulled = false; m.name = 'citizens'; scene.add(m); });
};
ISLE.citizens.colourOf = function (a) {
  var C = ISLE.citizens, R = SIM.R.role[a.role], k = a.driven ? 'cart' : R && R.work ? R.name : a.cls || 'middle';
  return C.colours[k] == null ? 0xcccccc : C.colours[k];
};
/* choose: the drawn town's people within the radius of the target, nearest first, the cap of them */
ISLE.citizens.update = function () {
  var C = ISLE.citizens, S = ISLE.SIM; if (!S || typeof CAM === 'undefined') return 0;
  C.build();
  var town = ISLE.cur.town, s = ISLE.TUNE.sim.towns[town].id, F = ISLE.cur.G.frame, t = SIM.time(), tx = CAM.t[0] + F.x, tz = CAM.t[2] + F.z, cand = [];
  C.stats = { chosen: 0, near: 0, hidden: 0 };
  SIM.all('actor').forEach(function (a) {
    if (a.driven || SIM.settlementOf(a) !== s) return;
    var p = SIM.pose(a, t, { cheap: true }), d = Math.hypot(p.x - tx, p.z - tz); if (d > C.radius) return;
    C.stats.near++; if (p.hidden) { C.stats.hidden++; return; }
    cand.push({ a: a, d: d });
  });
  cand.sort(function (p, q) { return p.d - q.d || (p.a.id < q.a.id ? -1 : 1); });
  C.sel = cand.slice(0, C.cap).map(function (c) { return c.a; }); C.stats.chosen = C.sel.length;
  var col = new THREE.Color();
  C.sel.forEach(function (a, i) { col.setHex(C.colourOf(a)); C.mesh.setColorAt(i, col); });
  if (C.mesh.instanceColor) C.mesh.instanceColor.needsUpdate = true;
  C.t = null; C.pose(); return C.sel.length;
};
/* pose the chosen (in full), in the page's frame; one that went indoors is laid out of sight */
ISLE.citizens.pose = function () {
  var C = ISLE.citizens, F = ISLE.cur.G.frame, t = SIM.time(); if (C.t === t) return; C.t = t;
  var M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), P = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zero = new THREE.Vector3(0, 0, 0);
  C.drawn = [];
  C.sel.forEach(function (a, i) {
    var p = SIM.pose(a, t); P.set(p.x - F.x, p.y - F.sea, p.z - F.z); Q.setFromAxisAngle(Y, p.h || 0);
    M.compose(P, Q, p.hidden ? zero : one); C.mesh.setMatrixAt(i, M); C.head.setMatrixAt(i, M);
    C.drawn.push({ id: a.id, x: P.x, y: P.y, z: P.z, hidden: !!p.hidden });
  });
  C.mesh.count = C.head.count = C.sel.length;
  C.mesh.instanceMatrix.needsUpdate = true; C.head.instanceMatrix.needsUpdate = true;
};
ISLE.citizens.tick = function (now) {
  var C = ISLE.citizens; if (!ISLE.SIM) return;
  if (now - C.at > C.every) { C.at = now; C.update(); } else if (C.sel.length) C.pose();
};
ISLE.citizens.check = function (o) {
  o = o || {}; var C = ISLE.citizens, F = ISLE.cur.G.frame, t = SIM.time(), M = new THREE.Matrix4(), P = new THREE.Vector3(), Q = new THREE.Quaternion(), Sc = new THREE.Vector3();
  if (o.shift && C.sel.length) { C.mesh.getMatrixAt(0, M); M.decompose(P, Q, Sc); P.x += 50; M.compose(P, Q, Sc); C.mesh.setMatrixAt(0, M); }
  var bad = [], far = 0, hid = 0, n = C.mesh ? C.mesh.count : 0;
  for (var i = 0; i < n; i++) {
    var a = C.sel[i], p = SIM.pose(a, t); C.mesh.getMatrixAt(i, M); M.decompose(P, Q, Sc);
    var ex = p.x - F.x, ey = p.y - F.sea, ez = p.z - F.z;
    if (Math.hypot(P.x - ex, P.y - ey, P.z - ez) > 0.5) bad.push(a.id);
    if (p.hidden || Sc.x === 0) hid++;
    if (Math.hypot(P.x - CAM.t[0], P.z - CAM.t[2]) > C.radius + 1) far++;
  }
  if (o.shift && C.sel.length) C.t = null, C.pose();
  return { name: ISLE.cur.town + ': citizens drawn near the camera where the simulation puts them', ok: n > 0 && n <= C.cap && !bad.length && !far && !hid,
    detail: n + ' drawn (cap ' + C.cap + ', ' + C.stats.near + ' within ' + C.radius + ' m, ' + C.stats.hidden + ' of them indoors)' + (bad.length ? '; NOT AT THEIR POSE: ' + bad.slice(0, 3).join(', ') : '') +
      (far ? '; ' + far + ' beyond the radius' : '') + (hid ? '; ' + hid + ' hidden ones drawn' : '') };
};
