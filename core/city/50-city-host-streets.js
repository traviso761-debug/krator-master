/* ============================== 7. HOST: GROUND, OVERLAY, STREETS, WALL ============================== */
/* [draw] The engine page (kits/catalog/krator-asset-engine.js) made scene, camera, renderer and controls.
   This draws the plan on it. Every object carries userData.step: the step that made it. HOST.setupStage and
   HOST.buildGround draw a plain world of their own; a world with its own ground and sky (Voth) skips them and takes
   the streets, the overlay and the labels. */
var HOST = { step: 12, layers: { buildings: true, lots: false, wealth: false, knocks: false, labels: true } };

HOST.setupStage = function () {
  ground.visible = false; grid.visible = false;
  scene.background = new THREE.Color(0xbdd0e2);
  scene.fog = new THREE.Fog(0xbdd0e2, 2200, 7000);
  camera.far = 9000; camera.updateProjectionMatrix();
  sun.position.set(-420, 620, 260); sun.intensity = 1.45;
  /* the depth range follows the camera: a fixed near plane of 0.1 m cannot tell a street from the ground 1 km away */
  (window._frameHooks = window._frameHooks || []).push(function () {
    var h = Math.max(2, camera.position.y - terrainH(camera.position.x, camera.position.z));
    var nr = clamp(h * 0.04, 0.15, 25);
    if (Math.abs(nr - camera.near) > camera.near * 0.15) { camera.near = nr; camera.updateProjectionMatrix(); }
  });
};

/* the grass set from the material library (materials.json -> tex/, inlined by build.py as SL_TEX) */
HOST.texture = function (url, rep, srgb) {
  var t = new THREE.TextureLoader().load(url);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (srgb) t.encoding = THREE.sRGBEncoding;
  return t;
};
HOST.drape = function (size, segs, lift, cx, cz) {
  var g = new THREE.PlaneGeometry(size, size, segs, segs);
  g.rotateX(-Math.PI / 2);
  var P = g.attributes.position;
  for (var i = 0; i < P.count; i++) { var x = P.getX(i) + (cx || 0), z = P.getZ(i) + (cz || 0); P.setXYZ(i, x, terrainH(x, z) + lift, z); }
  g.computeVertexNormals();
  return g;
};
HOST.buildGround = function () {
  var S = 2 * TUNE.mapHalf, g = HOST.drape(S, 260, 0), P = g.attributes.position, col = new Float32Array(P.count * 3);
  /* a slow tone wash so the tile does not repeat visibly across the plain */
  for (var i = 0; i < P.count; i++) { var x = P.getX(i), z = P.getZ(i), v = 0.9 + 0.12 * slFbm(x / 160 + 5, z / 160 - 9, 3), w = 0.03 * slFbm(x / 60, z / 60, 2); col[i * 3] = v + w; col[i * 3 + 1] = v; col[i * 3 + 2] = v - w; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var T = (typeof SL_TEX !== 'undefined' && SL_TEX.grass) || null, rep = S / ((T && T.scale && T.scale[0]) || 6), m;
  if (T) m = new THREE.MeshStandardMaterial({ map: HOST.texture(T.map, rep, true), normalMap: T.normalMap ? HOST.texture(T.normalMap, rep) : null,
    roughnessMap: T.roughnessMap ? HOST.texture(T.roughnessMap, rep) : null, roughness: 1, metalness: 0, vertexColors: true });
  else m = new THREE.MeshStandardMaterial({ color: 0x6f8a45, roughness: 1, vertexColors: true });
  HOST.ground = new THREE.Mesh(g, m);
  HOST.ground.name = 'ground';
  HOST.ground.userData = { kind: 'terrain', name: 'The ground', tags: ['terrain'] };
  scene.add(HOST.ground);
};

/* ---------------------------------------------------------------- the overlay: districts, greens, lots, painted on the ground */
HOST.COL = {
  lot: { rich: '#d4a929', manor: '#a8740c', middle: '#6f9fc0', poor: '#a8704f', shop: '#c9467b', tavern: '#8b55d6', industrial: '#5e5e5e', civic: '#2f63d6', landmark: '#d1452a' },
  way: { avenue: 0xd8cdb4, main: 0xbfae8e, side: 0xa59579, alley: 0x8a7b69, highway: 0x9d8663 },
  park: '#3d7031', plaza: '#cbbd9c', market: '#d9c18e'
};
HOST.buildOverlay = function () {
  var H = TUNE.rasterHalf, S = 4096;
  HOST.ovCanvas = document.createElement('canvas'); HOST.ovCanvas.width = HOST.ovCanvas.height = S;
  HOST.ovTex = new THREE.CanvasTexture(HOST.ovCanvas);
  HOST.ovTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); HOST.ovTex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: HOST.ovTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
  HOST.overlay = new THREE.Mesh(HOST.drape(2 * H, 400, 0.05), m);
  HOST.overlay.renderOrder = 1;
  HOST.overlay.userData = { kind: 'overlay', probeSkip: true };
  scene.add(HOST.overlay);
};
HOST.paintOverlay = function () {
  var st = HOST.step, H = TUNE.rasterHalf, S = HOST.ovCanvas.width, k = S / (2 * H), ctx = HOST.ovCanvas.getContext('2d');
  var X = function (x) { return (x + H) * k; }, Z = function (z) { return (z + H) * k; };
  var poly = function (P) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); ctx.closePath(); };
  ctx.clearRect(0, 0, S, S);
  if (HOST.layers.wealth && st >= 7) {
    var c = 8; for (var x = -H; x < H; x += c) for (var z = -H; z < H; z += c) {
      if (SL.R.at(x, z) === OCC.OUT) continue;
      var w = SL.wealth([x + c / 2, z + c / 2]);
      ctx.fillStyle = 'rgba(' + Math.round(70 + 185 * w) + ',' + Math.round(90 + 60 * w) + ',' + Math.round(200 - 170 * w) + ',0.32)';
      ctx.fillRect(X(x), Z(z), c * k + 1, c * k + 1);
    }
  }
  PLAN.districts.slice().sort(function (a, b) { return (a.kind === 'square' ? 0 : 1) - (b.kind === 'square' ? 0 : 1); }).forEach(function (D) {
    if (D.born > st) return; poly(D.poly); ctx.fillStyle = D.kind === 'park' ? HOST.COL.park : D.kind === 'square' ? HOST.COL.plaza : HOST.COL.market; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,30,20,0.5)'; ctx.stroke();
  });
  PLAN.greens.forEach(function (G) {
    if (G.born > st) return;
    poly(G.poly); ctx.fillStyle = G.kind === 'park' ? HOST.COL.park : HOST.COL.plaza; ctx.fill();
    if (G.kind === 'plaza') { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(90,70,50,0.6)'; ctx.stroke(); }
  });
  var showLots = HOST.layers.lots || !HOST.layers.buildings;
  PLAN.lots.forEach(function (L) {
    if (L.born > st || (L.died != null && L.died <= st)) return;
    if (!showLots && L.cls !== 'landmark') return;
    if (L.cls === 'landmark' && HOST.layers.buildings && !HOST.layers.lots) return;
    poly(obbCorners(L.lot));
    ctx.globalAlpha = 0.55; ctx.fillStyle = HOST.COL.lot[L.cls] || '#888'; ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(25,20,15,0.7)'; ctx.stroke();
  });
  if (HOST.layers.knocks) {
    PLAN.lots.forEach(function (L) { if (L.died == null || L.died > st) return; poly(obbCorners(L.lot)); ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeStyle = '#e02020'; ctx.stroke(); ctx.setLineDash([]); });
    PLAN.knocks.forEach(function (K) {
      if (K.born > st) return; var w = PLAN.ways[K.way];
      ctx.lineWidth = 10 * k; ctx.strokeStyle = 'rgba(230,40,30,0.85)'; ctx.beginPath();
      for (var s = K.s0; s <= K.s1; s += 2) { var p = V.add(w.F.at(s), V.mul(V.perp(w.F.tan(s, 3)), K.side * (w.w / 2 + 5))); if (s === K.s0) ctx.moveTo(X(p[0]), Z(p[1])); else ctx.lineTo(X(p[0]), Z(p[1])); }
      ctx.stroke();
    });
  }
  PLAN.entrances.forEach(function (E) { if (E.born > st || st < 11) return; ctx.fillStyle = E.blind ? '#ff8c1a' : '#ffd21a'; ctx.beginPath(); ctx.arc(X(E.inner[0]), Z(E.inner[1]), 2.5 * k, 0, 7); ctx.fill(); });
  HOST.ovTex.needsUpdate = true;
};

/* ---------------------------------------------------------------- streets: ribbons draped on the ground, one mesh per class */
HOST.LIFT = { highway: 0.16, alley: 0.17, side: 0.19, main: 0.21, avenue: 0.23 };
HOST.ORDER = { highway: 2, alley: 3, side: 4, main: 5, avenue: 6 };
HOST.buildStreets = function () {
  HOST.streets = {};
  ['lane', 'highway', 'alley', 'side', 'main', 'avenue'].filter(function (cls) { return HOST.COL.way[cls] != null; }).forEach(function (cls) {   /* a page may add classes (the Voth city's country lanes) */
    /* a page may give a class a surface from the material library (HOST.ROADTEX[cls] = {fam, fit}): UVs in metres along
       and across the street, or across it fitted to the width (a cart road's ruts) */
    var RT = HOST.ROADTEX && HOST.ROADTEX[cls], T = RT && typeof SL_TEX !== 'undefined' && SL_TEX[RT.fam] || null, sc = T && T.scale ? T.scale[0] : 3;
    var pos = [], col = [], uv = [], idx = [], base = HOST.COL.way[cls], c = T ? new THREE.Color(RT.tint || 0xffffff) : new THREE.Color(base), born = 99;
    PLAN.ways.forEach(function (w) {
      if (w.cls !== cls) return; born = Math.min(born, w.born);
      var P = w.pts, v0 = pos.length / 3, hw = w.w / 2, sAlong = 0;
      for (var i = 0; i < P.length; i++) {
        if (i) sAlong += V.dist(P[i - 1], P[i]);
        var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], t = V.norm(V.sub(b, a)), n = V.perp(t);
        [-1, -0.62, 0.62, 1].forEach(function (f) {
          var x = P[i][0] + n[0] * hw * f, z = P[i][1] + n[1] * hw * f;
          pos.push(x, terrainH(x, z) + HOST.LIFT[cls], z);
          var e = Math.abs(f) === 1 ? 0.78 : 1;                     /* darker kerbs */
          col.push(c.r * e, c.g * e, c.b * e);
          if (RT && RT.fit) uv.push((f + 1) / 2, sAlong / (w.w * RT.fit)); else uv.push(f * hw / sc, sAlong / sc);
        });
        if (i) for (var q = 0; q < 3; q++) { var A = v0 + (i - 1) * 4 + q, B = A + 4; idx.push(A, A + 1, B, A + 1, B + 1, B); }
      }
    });
    if (!pos.length) return;
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    var mo = { vertexColors: true, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 - HOST.ORDER[cls], polygonOffsetUnits: -4 - 2 * HOST.ORDER[cls] };
    if (T) { mo.map = HOST.texture(T.map, 1, true); if (T.normalMap) mo.normalMap = HOST.texture(T.normalMap, 1); if (T.roughnessMap) { mo.roughnessMap = HOST.texture(T.roughnessMap, 1); mo.roughness = 1; } }
    var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial(mo));
    m.renderOrder = 2 + HOST.ORDER[cls];
    m.userData = { kind: 'street', cls: cls, step: born };
    scene.add(m);
    HOST.streets[cls] = m;
  });
};

/* ---------------------------------------------------------------- the wall: basalt curtain, drum towers, gatehouses */
HOST.buildWall = function () {
  var P = PLAN.wall.poly, n = P.length, T = TUNE, box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), cyl = new THREE.CylinderGeometry(1, 1.08, 1, 14).translate(0, 0.5, 0);
  var stone = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x6b6156).convertSRGBToLinear(), roughness: 0.9 });
  var dark = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x544c43).convertSRGBToLinear(), roughness: 0.9 });
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0);
  var gap = function (p) { return PLAN.gates.some(function (g) { return V.dist(p, g.p) < T.gateW / 2 + 4; }); };
  function wallMesh(withGates) {
    var segs = [];
    for (var i = 0; i < n; i++) {
      var a = P[i], b = P[(i + 1) % n], L = V.dist(a, b), k = Math.max(1, Math.ceil(L / 12));
      for (var j = 0; j < k; j++) {
        var p0 = V.lerp(a, b, j / k), p1 = V.lerp(a, b, (j + 1) / k), mid = V.lerp(p0, p1, 0.5);
        if (withGates && gap(mid)) continue;
        segs.push([p0, p1]);
      }
    }
    var M = new THREE.InstancedMesh(box, stone, segs.length);
    segs.forEach(function (s, i) {
      var h0 = terrainH(s[0][0], s[0][1]), h1 = terrainH(s[1][0], s[1][1]), lo = Math.min(h0, h1) - 2, top = Math.max(h0, h1) + T.wallH;
      var mid = V.lerp(s[0], s[1], 0.5), d = V.sub(s[1], s[0]);
      q.setFromAxisAngle(Y, Math.atan2(d[0], d[1]));
      m4.compose(new THREE.Vector3(mid[0], lo, mid[1]), q, new THREE.Vector3(T.wallT, top - lo, V.len(d) + 0.6));
      M.setMatrixAt(i, m4);
    });
    M.userData = { kind: 'wall', name: withGates ? 'Curtain wall (with gates)' : 'Curtain wall', tags: ['voth', 'infrastructure', 'military'] };
    return M;
  }
  HOST.wallFull = wallMesh(false); HOST.wallFull.userData.step = 2; HOST.wallFull.userData.until = 4;
  HOST.wallGated = wallMesh(true); HOST.wallGated.userData.step = 4;
  /* drum towers on every towerEvery-th vertex, square gate towers and a lintel at each gate */
  var tw = [];
  for (var i = 0; i < n; i += T.towerEvery) if (!gap(P[i])) tw.push(P[i]);
  var towers = new THREE.InstancedMesh(cyl, dark, tw.length);
  tw.forEach(function (p, i) { var h = terrainH(p[0], p[1]); m4.compose(new THREE.Vector3(p[0], h - 2, p[1]), q.identity(), new THREE.Vector3(4.4, T.wallH + 6, 4.4)); towers.setMatrixAt(i, m4); });
  towers.userData = { kind: 'wall', name: 'Wall tower', tags: ['voth', 'military'], step: 2 };
  var gparts = [];
  PLAN.gates.forEach(function (g) {
    var t = V.perp(g.d), h = terrainH(g.p[0], g.p[1]), ry = Math.atan2(g.d[0], g.d[1]);
    [-1, 1].forEach(function (s) { var c = V.add(g.p, V.mul(t, s * (T.gateW / 2 + 4))); gparts.push([c, h - 2, 9, T.wallH + 10, 11, ry]); });
    gparts.push([g.p, h + T.wallH - 1.5, T.gateW + 2, 5, T.wallT + 3, ry + Math.PI / 2]);
  });
  var gates = new THREE.InstancedMesh(box, dark, gparts.length);
  gparts.forEach(function (G, i) { q.setFromAxisAngle(Y, G[5]); m4.compose(new THREE.Vector3(G[0][0], G[1], G[0][1]), q, new THREE.Vector3(G[2], G[3], G[4])); gates.setMatrixAt(i, m4); });
  gates.userData = { kind: 'wall', name: 'Gatehouse', tags: ['voth', 'military', 'infrastructure'], step: 4 };
  [HOST.wallFull, HOST.wallGated, towers, gates].forEach(function (M) { M.frustumCulled = false; scene.add(M); });
  HOST.wallParts = [HOST.wallFull, HOST.wallGated, towers, gates];
};

/* ---------------------------------------------------------------- labels: names over the landmarks, districts and gates */
HOST.label = function (text, x, y, z, size, step) {
  var c = document.createElement('canvas'), ctx = c.getContext('2d'); c.width = 512; c.height = 112;
  ctx.font = 'bold 54px Georgia, serif'; var w = Math.min(500, ctx.measureText(text).width + 36);
  ctx.fillStyle = 'rgba(24,21,15,0.82)'; ctx.fillRect((512 - w) / 2, 14, w, 84);
  ctx.fillStyle = '#f3ecd8'; ctx.textAlign = 'center'; ctx.fillText(text, 256, 75);
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(size, size * 112 / 512, 1); s.position.set(x, y, z); s.renderOrder = 20;
  s.userData = { kind: 'label', step: step, probeSkip: true };
  scene.add(s);
  return s;
};
HOST.buildLabels = function () {
  HOST.labels = [];
  var names = { palace: "Governor's Palace", temple: 'Temple', garrison: 'Garrison', muster: 'Mustering ground' };
  PLAN.landmarks.forEach(function (L) { HOST.labels.push(HOST.label(names[L.role], L.x, L.y + L.h + 14, L.z, 64, 1)); });
  PLAN.districts.forEach(function (D) { if (D.kind === 'square') return; var c = polyCentroid(D.poly); HOST.labels.push(HOST.label(D.kind === 'park' ? 'Park' : 'Market', c[0], terrainH(c[0], c[1]) + 12, c[1], 40, 3)); });
  PLAN.gates.forEach(function (g) { HOST.labels.push(HOST.label(g.dir + ' gate', g.p[0], terrainH(g.p[0], g.p[1]) + 30, g.p[1], 70, 4)); });
};

/* show the city as it stood after step st */
HOST.applyStep = function () {
  var st = HOST.step;
  Object.keys(HOST.streets).forEach(function (k) { var m = HOST.streets[k]; m.visible = m.userData.step <= st; });
  HOST.wallParts.forEach(function (M) { M.visible = M.userData.step <= st && !(M.userData.until && st >= M.userData.until); });
  HOST.labels.forEach(function (s) { s.visible = HOST.layers.labels && s.userData.step <= st; });
  HOST.paintOverlay();
  if (HOST.updateBuildings) HOST.updateBuildings(true);
};
