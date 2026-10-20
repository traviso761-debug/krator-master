/* ============================== 5. DRAWING A TOWN: GROUND, SEA, STREETS, THE KITS' PIECES, VESSELS ============================== */
/* [web] Draws the records ISLE.city made; it decides nothing about where anything goes (CLAUDE.md: a builder draws a record).
   - the ground: the town's grid (the plan's, terraces and all) as one mesh every DRAW.groundStep metres, coloured by the
     open world's own ground colour (WORLD.ground), the beaches in white sand, the markets and squares paved;
   - the sea at 0;
   - the streets as ribbons draped on the ground, by class;
   - every kit piece built ONCE (ISK.proto, IZV.proto, CAT.proto) at the origin, flattened into one geometry per material,
     and drawn as InstancedMeshes: within DRAW.nearR of the camera's target in full (at most DRAW.nearMax pieces), beyond
     it as massing (a body and a roof per footprint, one InstancedMesh each). The near set is rebuilt when the target moves;
     a piece's prototype is built the first time one of it comes near;
   - a footing under every lot that stands on the slope (its drop: piles and a stone plinth), as one InstancedMesh;
   - the vessels (RINGSEA.make: each a clone of one build) at their moorings.
   window._city.draw holds the counts the verify reads. */
var DRAW = { groundStep: 12, nearR: 520, nearMax: 2600, moveFor: 60, protos: {}, inst: [], built: 0, failed: {}, stats: {} };
var renderer, scene, camera;
DRAW.stage = function () {
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene(); scene.background = new THREE.Color(0xa9c8d8); scene.fog = new THREE.Fog(0xa9c8d8, 2500, 9000);
  camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 30000);
  scene.add(new THREE.HemisphereLight(0xdfeaf2, 0x6a6048, 0.85));
  var sun = new THREE.DirectionalLight(0xfff1dc, 1.05); sun.position.set(-0.55, 0.75, 0.35); scene.add(sun);
  addEventListener('resize', function () { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
};
/* ---------------------------------------------------------------- the ground and the sea */
DRAW.ground = function (G, R) {
  var st = DRAW.groundStep, n = Math.floor(2 * G.half / st) + 1, pos = new Float32Array(n * n * 3), col = new Float32Array(n * n * 3), F = G.frame, A = [0, 0, 0, 0];
  var paved = R.districts.filter(function (d) { return d.role === 'market' || d.role === 'warriors'; }), beach = R.districts.filter(function (d) { return d.role === 'beach'; });
  var lawn = R.districts.filter(function (d) { return d.role === 'ceremonial' || d.role === 'park'; });
  var inAny = function (L, p) { for (var i = 0; i < L.length; i++) if (KCITY.lib.inPoly(p, L[i].poly)) return true; return false; };
  /* the farmland's parcels by their cell, each crop its ground tone (linear RGB) */
  var FC = DRAW.CROP, fmap = {}, fc = R.fields.length ? R.fields[0].size : 40;
  R.fields.forEach(function (Fr) { fmap[Math.floor((Fr.x + G.half) / fc) + ',' + Math.floor((Fr.z + G.half) / fc)] = FC[Fr.crop] || FC._; });
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
    var x = -G.half + i * st, z = -G.half + j * st, y = G.h(x, z), k = (j * n + i) * 3;
    pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    WORLD.ground(F.x + x, F.z + z, WORLD.at(F.x + x, F.z + z), A);
    var c = [A[0], A[1], A[2]];
    if (y < 1.5 && y > -2 || inAny(beach, [x, z])) { var t = inAny(beach, [x, z]) ? 0.7 : 0.5; c = [c[0] + (0.66 - c[0]) * t, c[1] + (0.62 - c[1]) * t, c[2] + (0.52 - c[2]) * t]; }
    else if (inAny(paved, [x, z])) c = [0.24, 0.2, 0.15];
    else if (inAny(lawn, [x, z])) c = [c[0] * 0.3 + 0.07, c[1] * 0.3 + 0.16, c[2] * 0.3 + 0.05];
    else { var fk = fmap[Math.floor((x + G.half) / fc) + ',' + Math.floor((z + G.half) / fc)]; if (fk) c = [c[0] * 0.35 + fk[0] * 0.65, c[1] * 0.35 + fk[1] * 0.65, c[2] * 0.35 + fk[2] * 0.65]; }
    col[k] = c[0]; col[k + 1] = c[1]; col[k + 2] = c[2];
  }
  var idx = []; for (var jj = 0; jj < n - 1; jj++) for (var ii = 0; ii < n - 1; ii++) { var a = jj * n + ii; idx.push(a, a + n, a + 1, a + 1, a + n, a + n + 1); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setIndex(n * n > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); g.computeVertexNormals();
  var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })); m.name = 'ground'; scene.add(m);
  var sea = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.MeshLambertMaterial({ color: 0x3f87a8, transparent: true, opacity: 0.86 }));
  sea.rotation.x = -Math.PI / 2; sea.position.y = 0; sea.name = 'sea'; sea.renderOrder = 1; scene.add(sea);
};
/* the crops' ground tones (linear RGB) and the orchard trees' crowns (sRGB): placeholders until the crops kit's stands
   (kits/crops, the ringisles biome's crop-* stands) are drawn on this page */
DRAW.CROP = { rice: [0.16, 0.3, 0.12], taro: [0.14, 0.24, 0.1], cloves: [0.09, 0.17, 0.06], cacao: [0.08, 0.14, 0.05], coconut: [0.18, 0.24, 0.1],
  banana: [0.15, 0.27, 0.08], 'sugar cane': [0.26, 0.34, 0.12], cotton: [0.42, 0.4, 0.3], coffee: [0.1, 0.17, 0.07], 'sweet potato': [0.2, 0.26, 0.1], _: [0.2, 0.25, 0.1] };
DRAW.TREE = { cloves: 0x2f5a26, cacao: 0x3a5a22, coconut: 0x5f7a32, banana: 0x6a8e34, coffee: 0x2e5226 };
DRAW.orchards = function (R, G) {
  var list = []; R.fields.forEach(function (Fr) { if (Fr.kind === 'orchard') list.push(Fr); });
  var per = 5, n = list.length * per, crown = new THREE.IcosahedronGeometry(1, 0), trunk = new THREE.CylinderGeometry(0.12, 0.16, 1, 5);
  crown.translate(0, 1, 0); trunk.translate(0, 0.5, 0);
  var mc = new THREE.InstancedMesh(crown, new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, n)), mt = new THREE.InstancedMesh(trunk, new THREE.MeshLambertMaterial({ color: 0x5a4632 }), Math.max(1, n));
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color(), k = 0;
  list.forEach(function (Fr) {
    (Fr.trees || []).forEach(function (Tr) {     /* the trees are the plan's records (32-isle-city.js fields): drawn, not placed, here */
      var x = Tr.x, z = Tr.z, y = Tr.y, s = Tr.s, hgt = Tr.hgt;
      m4.compose(new THREE.Vector3(x, y + hgt * 0.55, z), q, new THREE.Vector3(s, s * 0.8, s)); mc.setMatrixAt(k, m4); mc.setColorAt(k, col.setHex(DRAW.TREE[Fr.crop] || 0x3a5a26));
      m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s * 0.6, hgt * 0.6, s * 0.6)); mt.setMatrixAt(k, m4); k++;
    });
  });
  mc.count = mt.count = k; mc.name = 'orchard crowns'; mt.name = 'orchard trunks'; scene.add(mc); scene.add(mt);
  DRAW.stats.orchardTrees = k; DRAW.stats.fields = R.fields.length;
};
/* ---------------------------------------------------------------- the streets */
DRAW.streets = function (R, G) {
  var CL = { avenue: 0x8a7a62, highway: 0x7e705a, main: 0x95856a, side: 0x9c8c70, alley: 0xa29276 }, pos = [], col = [], c3 = new THREE.Color();
  R.plan.ways.forEach(function (w) {
    var P = KCITY.lib.resample(w.pts, 6, false), hw = w.w / 2; c3.setHex(CL[w.cls] || 0x998866);
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], d = KCITY.lib.V.norm(KCITY.lib.V.sub(b, a)), nx = -d[1] * hw, nz = d[0] * hw;
      var q = [[a[0] + nx, a[1] + nz], [a[0] - nx, a[1] - nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz]].map(function (p) { return [p[0], Math.max(0.2, G.h(p[0], p[1])) + 0.25, p[1]]; });
      [0, 1, 2, 2, 1, 3].forEach(function (k) { pos.push(q[k][0], q[k][1], q[k][2]); col.push(c3.r, c3.g, c3.b); });
    }
  });
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide })); m.name = 'streets'; scene.add(m);
  DRAW.stats.streetTris = pos.length / 9;
};
/* ---------------------------------------------------------------- a prototype: one build, one geometry per material */
/* a normalized integer attribute's scale to its float value (the ports' furniture colours are Uint8 0..255, normalized):
   the flattened geometry's attributes are plain floats */
/* the kit pieces built once and flattened (58-isle-protos.js, shared with the open world's hamlets) */
DRAW.denorm = isleDenorm; DRAW.flatten = isleFlatten; DRAW.portMats = islePortMats;
DRAW.proto = function (kit, key, v) { return isleProto(kit, key, v, DRAW); };
/* ---------------------------------------------------------------- the pieces: near in full, far as massing */
DRAW.records = function (R) {
  var all = R.lots.concat(R.wall);
  DRAW.recs = all; DRAW.R = R;
  /* massing: a body and a roof per footprint (a hall-roof gold for the Islanders, render white for the Vernacular, timber for the Riders') */
  var body = new THREE.BoxGeometry(1, 1, 1); body.translate(0, 0.5, 0);
  var roof = new THREE.ConeGeometry(0.72, 1, 4, 1); roof.rotateY(Math.PI / 4); roof.translate(0, 0.5, 0);
  var mb = new THREE.MeshLambertMaterial({ color: 0xffffff }), mr = new THREE.MeshLambertMaterial({ color: 0xffffff });
  DRAW.massB = new THREE.InstancedMesh(body, mb, all.length); DRAW.massR = new THREE.InstancedMesh(roof, mr, all.length);
  DRAW.massB.name = 'massing bodies'; DRAW.massR.name = 'massing roofs';
  var KC = { isk: [0xb39a74, 0xc9ac6e], izv: [0xe4dccb, 0xc0703c], cat: [0x7a5e40, 0x5f6e3a] }, c = new THREE.Color();
  all.forEach(function (L, i) { var k = KC[L.kit] || KC.isk; DRAW.massB.setColorAt(i, c.setHex(L.cls === 'wall' ? 0xb8ab90 : k[0])); DRAW.massR.setColorAt(i, c.setHex(L.cls === 'wall' ? 0xb8ab90 : k[1])); });
  scene.add(DRAW.massB); scene.add(DRAW.massR);
  /* footings on the slope */
  var fl = R.lots.filter(function (L) { return L.drop > 0.35; }), fg = new THREE.BoxGeometry(1, 1, 1); fg.translate(0, -0.5, 0);
  var foot = new THREE.InstancedMesh(fg, new THREE.MeshLambertMaterial({ color: 0x7b7366 }), Math.max(1, fl.length)), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  fl.forEach(function (L, i) { q.setFromEuler(e.set(0, L.ry, 0)); m4.compose(new THREE.Vector3(L.x, L.y + 0.05, L.z), q, new THREE.Vector3(L.w * 0.92, L.drop + 0.6, L.d * 0.92)); foot.setMatrixAt(i, m4); });
  foot.count = fl.length; foot.name = 'footings'; scene.add(foot); DRAW.stats.footings = fl.length;
  /* the compound walls: a low stone wall round each house's lot (its yard), a gate's gap in the side toward the street */
  var yl = R.lots.filter(function (L) { return L.yard && L.yard.hw > L.w / 2 + 1.5 && /^(poor|middle|rich|manor|vpoor|vmiddle|vrich)$/.test(L.cls); });
  var wg = new THREE.BoxGeometry(1, 1, 1); wg.translate(0, 0.5, 0);
  var walls = new THREE.InstancedMesh(wg, new THREE.MeshLambertMaterial({ color: 0x8c8170 }), Math.max(1, yl.length * 5)), nw = 0, G = ISLE.cur.G;
  var seg = function (a, b) {
    var dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); if (len < 0.5) return;
    var mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, y = Math.min(G.h(a[0], a[1]), G.h(b[0], b[1]), G.h(mx, mz)) - 0.3;
    q.setFromEuler(e.set(0, Math.atan2(-dz, dx), 0)); m4.compose(new THREE.Vector3(mx, y, mz), q, new THREE.Vector3(len, 1.4 + Math.abs(G.h(a[0], a[1]) - G.h(b[0], b[1])) / 2, 0.45));
    walls.setMatrixAt(nw++, m4);
  };
  yl.forEach(function (L) {
    var Y = L.yard, f = [Math.sin(L.ry), Math.cos(L.ry)], C = [];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s2) { C.push([Y.c[0] + Y.u[0] * Y.hw * s2[0] + Y.v[0] * Y.hd * s2[1], Y.c[1] + Y.u[1] * Y.hw * s2[0] + Y.v[1] * Y.hd * s2[1]]); });
    for (var i = 0; i < 4; i++) {
      var a = C[i], b = C[(i + 1) % 4], mid = [(a[0] + b[0]) / 2 - Y.c[0], (a[1] + b[1]) / 2 - Y.c[1]];
      if (mid[0] * f[0] + mid[1] * f[1] > 0.5) {        /* the street side: two runs with a 3 m gate between */
        var t = 1.5 / Math.hypot(b[0] - a[0], b[1] - a[1]); seg(a, [a[0] + (b[0] - a[0]) * (0.5 - t), a[1] + (b[1] - a[1]) * (0.5 - t)]); seg([a[0] + (b[0] - a[0]) * (0.5 + t), a[1] + (b[1] - a[1]) * (0.5 + t)], b);
      } else seg(a, b);
    }
  });
  walls.count = nw; walls.name = 'compound walls'; scene.add(walls); DRAW.stats.compoundWalls = yl.length;
  DRAW.near(null, true);
};
DRAW.matOf = function (L, s) {
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, L.ry, 0));
  return m4.compose(new THREE.Vector3(L.x, L.y, L.z), q, new THREE.Vector3(s[0], s[1], s[2]));
};
/* the near set round a point: full pieces there, massing everywhere else */
DRAW.near = function (at, force) {
  at = at || [0, 0];
  if (!force && DRAW.at && Math.hypot(at[0] - DRAW.at[0], at[1] - DRAW.at[1]) < DRAW.moveFor) return;
  DRAW.at = at.slice();
  DRAW.inst.forEach(function (m) { scene.remove(m); m.dispose(); }); DRAW.inst = [];
  var all = DRAW.recs, near = [];
  all.forEach(function (L, i) { var d = Math.hypot(L.x - at[0], L.z - at[1]); if (d < DRAW.nearR) near.push([d, i]); });
  near.sort(function (a, b) { return a[0] - b[0]; }); near = near.slice(0, DRAW.nearMax);
  var full = {}, by = {}, t0 = performance.now();
  near.forEach(function (ni) { var L = all[ni[1]], P = DRAW.proto(L.kit, L.key, L.v); if (!P) return; full[ni[1]] = 1; (by[P.id] || (by[P.id] = { P: P, L: [] })).L.push(L); });
  var tris = 0;
  for (var id in by) {
    var B = by[id], P = B.P;
    P.parts.forEach(function (pt, k) {
      var im = new THREE.InstancedMesh(pt.geo, pt.mat, B.L.length);
      im.userData.isleProto = id; im.userData.part = k; im.userData.lots = B.L.map(function (L) { return L.tag; });   /* the export's owners (62) */
      B.L.forEach(function (L, i) { var sx = L.cls === 'wall' && P.w ? L.w / P.w : 1; im.setMatrixAt(i, DRAW.matOf(L, [sx, 1, 1])); });
      im.instanceMatrix.needsUpdate = true; im.name = id; scene.add(im); DRAW.inst.push(im); tris += pt.tris * B.L.length;
    });
  }
  var nb = 0, z0 = new THREE.Matrix4().makeScale(0, 0, 0);
  all.forEach(function (L, i) {
    if (full[i]) { DRAW.massB.setMatrixAt(i, z0); DRAW.massR.setMatrixAt(i, z0); return; }
    var wh = L.cls === 'wall' ? L.h : Math.max(2.5, L.h * 0.45), rh = L.cls === 'wall' ? 0.01 : Math.max(1.5, L.h - wh);
    DRAW.massB.setMatrixAt(i, DRAW.matOf(L, [L.w * 0.9, wh, L.d * 0.9]));
    var r = DRAW.matOf(L, [L.w * 1.02, rh, L.d * 1.02]); r.elements[13] += wh; DRAW.massR.setMatrixAt(i, r); nb++;
  });
  DRAW.massB.instanceMatrix.needsUpdate = true; DRAW.massR.instanceMatrix.needsUpdate = true;
  if (DRAW.massB.instanceColor) DRAW.massB.instanceColor.needsUpdate = true; if (DRAW.massR.instanceColor) DRAW.massR.instanceColor.needsUpdate = true;
  DRAW.stats.near = Object.keys(full).length; DRAW.stats.massing = nb; DRAW.stats.nearTris = Math.round(tris); DRAW.stats.protos = DRAW.built;
  DRAW.stats.nearMs = Math.round(performance.now() - t0);
};
/* ---------------------------------------------------------------- the vessels */
DRAW.vessels = function (R) {
  var n = 0;
  R.vessels.forEach(function (Vr) {
    var r = (typeof RINGSEA !== 'undefined') ? RINGSEA.make(Vr.key) : null; if (!r) { DRAW.failed['vessel:' + Vr.key] = 'no build'; return; }
    r.group.position.set(Vr.x, 0, Vr.z); r.group.rotation.y = Vr.heading - Math.PI / 2; r.group.name = Vr.id; scene.add(r.group); n++;
  });
  DRAW.stats.vessels = n;
};
