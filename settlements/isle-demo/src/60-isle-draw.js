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
/* ---------------------------------------------------------------- the thieves' guild (47c ISLE.tagGuilds; owner, 2026-11-02) */
/* A guild's mark, in the town's frame: a post by the tavern's door with a plum board painted with a dagger (the den's
   sign), and a map pin above the roof, "Thieves' guild", the same size on screen at any distance (DRAW.guildPins(false)
   hides the pins). It decides nothing: the guild is the sim's (core/simulation 77-sim-6-crime.js) */
DRAW.guildTex = function (w, h, paint) { var c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h);
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; };
DRAW.dagger = function (g, x, y, s, col) {   /* a dagger, point down, its hilt at (x, y), s its length */
  g.fillStyle = col; g.beginPath(); g.moveTo(x - s * 0.07, y + s * 0.22); g.lineTo(x + s * 0.07, y + s * 0.22); g.lineTo(x, y + s); g.closePath(); g.fill();
  g.fillRect(x - s * 0.22, y + s * 0.16, s * 0.44, s * 0.07); g.fillRect(x - s * 0.04, y, s * 0.08, s * 0.17); g.beginPath(); g.arc(x, y - s * 0.02, s * 0.06, 0, Math.PI * 2); g.fill(); };
DRAW.guildPins = function (on) { (DRAW.guildMarks || []).forEach(function (G) { if (G.pin) G.pin.visible = on !== false; }); };
DRAW.guild = function (m) {
  if (!m || !m.at) return null;
  var g = new THREE.Group(), sz = m.size || [8, 8, 6], s = Math.sin(m.ry || 0), c = Math.cos(m.ry || 0), fr = sz[1] / 2 + 1.4, side = Math.min(sz[0] / 2, 3);
  var x = m.at[0] + s * fr + c * side, z = m.at[2] + c * fr - s * side, y = m.at[1];
  var wood = new THREE.MeshLambertMaterial({ color: 0x3a2a1e }), post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.4, 6).translate(0, 2.2, 0), wood);
  var arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.12).translate(0.75, 4.1, 0), wood);
  var face = DRAW.guildTex(128, 96, function (q, w, h) { q.fillStyle = '#4a1e3a'; q.fillRect(0, 0, w, h); q.strokeStyle = '#c9a24a'; q.lineWidth = 6; q.strokeRect(5, 5, w - 10, h - 10);
    DRAW.dagger(q, w / 2, 14, 70, '#d8c27a'); });
  var board = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.06).translate(1.1, 3.55, 0), [wood, wood, wood, wood, new THREE.MeshLambertMaterial({ map: face }), new THREE.MeshLambertMaterial({ map: face })]);
  [post, arm, board].forEach(function (k) { g.add(k); }); g.position.set(x, y, z); g.rotation.y = m.ry || 0; g.name = "thieves' guild sign";
  g.userData.inspectLabel = "Thieves' guild"; scene.add(g);
  var pinT = DRAW.guildTex(512, 128, function (q, w, h) { q.fillStyle = 'rgba(40,14,32,0.86)'; q.fillRect(0, 8, w, h - 16); q.strokeStyle = '#c9a24a'; q.lineWidth = 5; q.strokeRect(4, 10, w - 8, h - 20);
    DRAW.dagger(q, 62, 22, 84, '#e6cf86'); q.fillStyle = '#f2e2b0'; q.font = 'bold 54px Georgia, serif'; q.textBaseline = 'middle'; q.fillText("Thieves' guild", 112, h / 2 + 2); });
  var pin = new THREE.Sprite(new THREE.SpriteMaterial({ map: pinT, sizeAttenuation: false, depthTest: false, transparent: true }));
  pin.scale.set(0.16, 0.04, 1); pin.position.set(m.at[0], y + sz[2] + 5, m.at[2]); pin.renderOrder = 20; pin.name = "thieves' guild pin"; scene.add(pin);
  var G = { mark: m, sign: g, pin: pin }; (DRAW.guildMarks || (DRAW.guildMarks = [])).push(G); DRAW.stats.guilds = DRAW.guildMarks.length; return G;
};
/* ---------------------------------------------------------------- the ground and the sea */
/* the library's layers over the vertex colours (materials.json, pack 'isle'): the town ground's aL weights (tilled, damp sand,
   sand with rocks, shingle) and the streets' aK (0 gravel, 1 dry grass path), read at world xz; a layer without its set is skipped */
DRAW.libLayers = function (names) {
  var o = {}; if (typeof KMAT === 'undefined' || KMAT.mode !== 'lib' || !KMAT.packed) return o;
  names.forEach(function (k) { var P = KMAT.packed('isle', k); if (P) o[k] = { map: KMAT.textures(P, { aniso: 8 }).map, k: 1 / P.scale[0] }; });
  return o;
};
DRAW.layMat = function (mat, names, attr, weights) {
  var LY = DRAW.libLayers(names), keys = names.filter(function (k) { return LY[k]; });
  if (!keys.length) return mat;
  var u = function (k) { return 'uL_' + k.replace(/\W/g, '_'); }, rd = function (k) { return 'pow(mix(texture2D(' + u(k) + ',vLP*' + LY[k].k.toFixed(4) + ').rgb,texture2D(' + u(k) + ',vec2(vLP.y,-vLP.x)*' + (LY[k].k * 0.37).toFixed(4) + '+0.31).rgb,0.4),vec3(2.2))'; };
  mat.onBeforeCompile = function (sh) {
    keys.forEach(function (k) { sh.uniforms[u(k)] = { value: LY[k].map }; });
    var NL = String.fromCharCode(10);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>' + NL + 'attribute vec4 ' + attr + ';varying vec4 vLW;varying vec2 vLP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>' + NL + 'vLW=' + attr + ';vLP=(modelMatrix*vec4(transformed,1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>' + NL + 'varying vec4 vLW;varying vec2 vLP;uniform sampler2D ' + keys.map(u).join(',') + ';')
      .replace('#include <color_fragment>', '#include <color_fragment>' + NL + '{vec3 lc=diffuseColor.rgb;float lm=max(dot(lc,vec3(0.333)),0.02);' + weights(keys, rd) + 'diffuseColor.rgb=lc;}');
  };
  mat.customProgramCacheKey = function () { return 'isleLay|' + attr + '|' + keys.join(','); };
  return mat;
};
DRAW.groundMat = function () {
  return DRAW.layMat(new THREE.MeshLambertMaterial({ vertexColors: true }), ['ground.tilled', 'ground.damp', 'ground.sandrock', 'ground.shingle'], 'aL', function (keys, rd) {
    var has = function (k) { return keys.indexOf(k) >= 0; }, o = '';
    if (has('ground.tilled')) o += 'lc=mix(lc,' + rd('ground.tilled') + '*mix(vec3(1.0),lc/lm,0.45),clamp(vLW.x,0.0,1.0)*0.85);';
    if (has('ground.sandrock')) o += 'lc=mix(lc,' + rd('ground.sandrock') + ',clamp(vLW.z,0.0,1.0)*(0.55+0.45*sin(vLP.x*0.021)*sin(vLP.y*0.017)));';
    if (has('ground.damp')) o += 'lc=mix(lc,' + rd('ground.damp') + ',clamp(vLW.y,0.0,1.0)*0.9);';
    if (has('ground.shingle')) o += 'lc=mix(lc,' + rd('ground.shingle') + ',clamp(vLW.w,0.0,1.0)*0.85);';
    return o;
  });
};
DRAW.ground = function (G, R) {
  var st = DRAW.groundStep, n = Math.floor(2 * G.half / st) + 1, pos = new Float32Array(n * n * 3), col = new Float32Array(n * n * 3), lay = new Float32Array(n * n * 4), F = G.frame, A = [0, 0, 0, 0];
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
    var c = [A[0], A[1], A[2]], L4 = k / 3 * 4, sl = Math.hypot(G.h(x + st, z) - G.h(x - st, z), G.h(x, z + st) - G.h(x, z - st)) / (2 * st), nearSea = y > -3 ? 1 : 0;
    lay[L4 + 3] = nearSea * Math.min(1, Math.max(0, (sl - 0.35) / 0.35)) * (1 - Math.min(1, Math.max(0, (y - 3) / 5)));   /* shingle: the steep shore */
    if (y < 1.5 && y > -2 || inAny(beach, [x, z])) { var t = inAny(beach, [x, z]) ? 0.7 : 0.5; c = [c[0] + (0.66 - c[0]) * t, c[1] + (0.62 - c[1]) * t, c[2] + (0.52 - c[2]) * t];
      lay[L4 + 1] = Math.min(1, Math.max(0, 1 - (y - 0.2) / 0.8)); lay[L4 + 2] = Math.min(1, Math.max(0, (y - 0.5) / 0.8)); lay[L4 + 3] *= 0.4; }   /* damp sand below the tide line, mossy rocks on the upper beach */
    else if (inAny(paved, [x, z])) c = [0.24, 0.2, 0.15];
    else if (inAny(lawn, [x, z])) c = [c[0] * 0.3 + 0.07, c[1] * 0.3 + 0.16, c[2] * 0.3 + 0.05];
    else { var fk = fmap[Math.floor((x + G.half) / fc) + ',' + Math.floor((z + G.half) / fc)]; if (fk) { c = [c[0] * 0.35 + fk[0] * 0.65, c[1] * 0.35 + fk[1] * 0.65, c[2] * 0.35 + fk[2] * 0.65]; lay[L4] = 1; } }   /* tilled ground under the crop's tone */
    col[k] = c[0]; col[k + 1] = c[1]; col[k + 2] = c[2];
  }
  var idx = []; for (var jj = 0; jj < n - 1; jj++) for (var ii = 0; ii < n - 1; ii++) { var a = jj * n + ii; idx.push(a, a + n, a + 1, a + 1, a + n, a + n + 1); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('aL', new THREE.BufferAttribute(lay, 4));
  g.setIndex(n * n > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1)); g.computeVertexNormals();
  var m = new THREE.Mesh(g, DRAW.groundMat()); m.name = 'ground'; scene.add(m);
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
  var CL = { avenue: 0x8a7a62, highway: 0x7e705a, main: 0x95856a, side: 0x9c8c70, alley: 0xa29276 }, pos = [], col = [], kind = [], c3 = new THREE.Color();
  R.plan.ways.forEach(function (w) {
    var P = KCITY.lib.resample(w.pts, 6, false), hw = w.w / 2; c3.setHex(CL[w.cls] || 0x998866);
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], d = KCITY.lib.V.norm(KCITY.lib.V.sub(b, a)), nx = -d[1] * hw, nz = d[0] * hw;
      var q = [[a[0] + nx, a[1] + nz], [a[0] - nx, a[1] - nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz]].map(function (p) { return [p[0], Math.max(0.2, G.h(p[0], p[1])) + 0.25, p[1]]; });
      [0, 1, 2, 2, 1, 3].forEach(function (k) { pos.push(q[k][0], q[k][1], q[k][2]); col.push(c3.r, c3.g, c3.b); kind.push(w.cls === 'side' || w.cls === 'alley' ? 1 : 0, 0, 0, 0); });
    }
  });
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aK', new THREE.Float32BufferAttribute(kind, 4)); g.computeVertexNormals();
  var m = new THREE.Mesh(g, DRAW.layMat(new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, side: THREE.DoubleSide }), ['path.gravel', 'path.grass'], 'aK', function (keys, rd) {
    var o = '';
    if (keys.indexOf('path.gravel') >= 0) o += 'lc=mix(lc,' + rd('path.gravel') + '*0.9,(1.0-vLW.x)*0.9);';
    if (keys.indexOf('path.grass') >= 0) o += 'lc=mix(lc,' + rd('path.grass') + '*mix(vec3(1.0),lc/lm,0.3),vLW.x*0.9);';
    return o;
  })); m.name = 'streets'; scene.add(m);
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
  all.forEach(function (L, i) { if (L.vacant) return; var d = Math.hypot(L.x - at[0], L.z - at[1]); if (d < DRAW.nearR) near.push([d, i]); });   /* an empty lot: its works and its house going up (DRAW.lots) */
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
    if (full[i] || L.vacant) { DRAW.massB.setMatrixAt(i, z0); DRAW.massR.setMatrixAt(i, z0); return; }
    var wh = L.cls === 'wall' ? L.h : Math.max(2.5, L.h * 0.45), rh = L.cls === 'wall' ? 0.01 : Math.max(1.5, L.h - wh);
    DRAW.massB.setMatrixAt(i, DRAW.matOf(L, [L.w * 0.9, wh, L.d * 0.9]));
    var r = DRAW.matOf(L, [L.w * 1.02, rh, L.d * 1.02]); r.elements[13] += wh; DRAW.massR.setMatrixAt(i, r); nb++;
  });
  DRAW.massB.instanceMatrix.needsUpdate = true; DRAW.massR.instanceMatrix.needsUpdate = true;
  if (DRAW.massB.instanceColor) DRAW.massB.instanceColor.needsUpdate = true; if (DRAW.massR.instanceColor) DRAW.massR.instanceColor.needsUpdate = true;
  DRAW.stats.near = Object.keys(full).length; DRAW.stats.massing = nb; DRAW.stats.nearTris = Math.round(tris); DRAW.stats.protos = DRAW.built;
  DRAW.stats.nearMs = Math.round(performance.now() - t0);
};
/* ---------------------------------------------------------------- the empty lots and their houses going up (47b) */
/* Each empty lot of the plan (32: L.vacant; and each lot of a street outside the gate once the sim opens it: 33, 47b) drawn
   as its works, by its project's progress (ISLE.lotProgress, from the sim): the Construction kit's site (kits/construction,
   KCONS.site: the cleared plot, the stakes, the bill's materials piled by what is still on site, the scaffold while the
   work is under way) round the lot's own house, its kit piece revealed in build order by core/city (KCITY.constructMesh:
   footing, frame before infill, the roof last). Built, the site goes and the piece stays whole: a lot is always drawn here,
   never by the near set or the massing. An opened street's lane is drawn as a dirt track. It decides nothing: the
   progress is the sim's record */
DRAW.lotWork = function (L) {
  if (typeof KCONS === 'undefined' || !KCITY.constructMesh) { DRAW.failed['lot works'] = 'no Construction kit or core/city construct'; return null; }
  var B = ISLE.TUNE.sim.build, kind = ISLE.households(L.key) >= 3 ? 'longhouse' : 'house', bill = B && B.kinds[kind] ? B.kinds[kind].bill : null;
  var P = DRAW.proto(L.kit, L.key, L.v), C = P ? KCITY.constructMesh(P.parts) : null, g = new THREE.Group();
  var bb = P ? DRAW.protoBox(P) : null;   /* the piece's own extent (its geometry, not its declared box) */
  var S = KCONS.site({ w: bb ? bb.w : L.w * 0.7, d: bb ? bb.d : L.d * 0.7, h: bb ? bb.h : L.h, eaves: bb ? bb.h * 0.5 : null, plot: [L.w, L.d], bill: bill });   /* the scaffold round the piece, the plot the lot */
  g.add(S.group); if (C) g.add(C.group);
  g.position.set(L.x, L.y, L.z); g.rotation.y = L.ry || 0; g.name = 'empty lot ' + L.id; g.userData.inspectLabel = 'An empty lot: a house to be built'; g.userData.lots = [L.tag]; scene.add(g);
  var W = { L: L, g: g, S: S, C: C, f: -1 }; (DRAW.lotWorks || (DRAW.lotWorks = [])).push(W); return W;
};
DRAW.protoBox = function (P) {
  if (P._box) return P._box; var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  P.parts.forEach(function (pt) { var A = pt.geo.attributes.position.array; for (var i = 0; i < A.length; i += 3) {
    if (A[i] < x0) x0 = A[i]; if (A[i] > x1) x1 = A[i]; if (A[i + 1] < y0) y0 = A[i + 1]; if (A[i + 1] > y1) y1 = A[i + 1]; if (A[i + 2] < z0) z0 = A[i + 2]; if (A[i + 2] > z1) z1 = A[i + 2]; } });
  return (P._box = { w: 2 * Math.max(Math.abs(x0), Math.abs(x1)), d: 2 * Math.max(Math.abs(z0), Math.abs(z1)), h: y1 - Math.min(0, y0) });
};
DRAW.lots = function (R) {
  DRAW.lotWorks = DRAW.lotWorks || []; DRAW.lanes = DRAW.lanes || {}; DRAW.lotsR = R;
  R.lots.forEach(function (L) { if (L.vacant) DRAW.lotWork(L); });
  DRAW.camp(R);
  DRAW.lotsTick(); DRAW.stats.lots = DRAW.lotWorks.length;
};
/* an opened street's lane: a dirt track down its middle, draped on the ground */
DRAW.lane = function (Sp) {
  var G = ISLE.cur && ISLE.cur.G, a = Sp.lane[0], b = Sp.lane[1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(len / 4)), pos = [], idx = [];
  var tx = (b[0] - a[0]) / len, tz = (b[1] - a[1]) / len, nx = -tz * 2, nz = tx * 2;
  for (var i = 0; i <= n; i++) { var x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n, y = (G ? G.h(x, z) : 0) + 0.08;
    pos.push(x + nx, y, z + nz, x - nx, y, z - nz); if (i) { var k = i * 2; idx.push(k - 2, k - 1, k, k, k - 1, k + 1); } }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  var m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x8e7a5a })); m.name = 'lane ' + Sp.id; scene.add(m); return m;
};
/* THE REFUGEE CAMP (47r, 2026-11-04): on the camp's ground of the plan (33), a tent for every `tent` people the sim's camp
   holds, in rows across the square (a ridge tent of canvas over two poles: a stand-in until a camp kit's tents are drawn
   here), and a cook shelter for the ration line once anyone is there. It decides nothing: the count is the sim's */
DRAW.camp = function (R) {
  var C = R.camp; if (!C) return null; var K = ISLE.TUNE.sim.refugees, sp = 6, n = Math.floor(C.size / sp), G = ISLE.cur && ISLE.cur.G;
  var tent = new THREE.CylinderGeometry(1, 1, 4, 3, 1); tent.rotateZ(Math.PI / 2); tent.scale(1, 1.3, 1); tent.translate(0, 0.9, 0);
  var im = new THREE.InstancedMesh(tent, new THREE.MeshLambertMaterial({ color: 0xd8ccb0 }), n * n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), k = 0;
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) { var x = C.x - C.size / 2 + sp / 2 + i * sp, z = C.z - C.size / 2 + sp / 2 + j * sp, y = G ? G.h(x, z) : C.y;
    im.setMatrixAt(k++, m4.compose(new THREE.Vector3(x, y, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (i + j) % 2 ? 0 : 0.08), new THREE.Vector3(1, 1, 1))); }
  im.count = 0; im.name = 'refugee camp tents'; im.userData.lots = C.tag != null ? [C.tag] : []; scene.add(im);
  var cook = new THREE.Group(), wood = new THREE.MeshLambertMaterial({ color: 0x7a5a3a }), y0 = G ? G.h(C.x + C.size / 2 + 4, C.z) : C.y;
  [[-2, -1.5], [2, -1.5], [2, 1.5], [-2, 1.5]].forEach(function (p) { var k2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 6), wood); k2.position.set(p[0], 1.3, p[1]); cook.add(k2); });
  var roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 4), new THREE.MeshLambertMaterial({ color: 0xc2a868 })); roof.position.y = 2.6; cook.add(roof);
  cook.position.set(C.x + C.size / 2 + 4, y0, C.z); cook.visible = false; cook.name = 'the camp\'s ration line'; scene.add(cook);
  DRAW.campDraw = { C: C, im: im, cook: cook, max: n * n, tent: K ? K.camp.tent : 5, s: ISLE.TUNE.sim.towns[R.town] ? ISLE.TUNE.sim.towns[R.town].id : null };
  return DRAW.campDraw;
};
DRAW.lotsTick = function () {
  var by = {}, R = DRAW.lotsR, CD = DRAW.campDraw;
  if (CD && CD.s && typeof SIM !== 'undefined' && SIM.R && SIM.R.place) { var CP = SIM.R.place[CD.s + '.camp'], np = CP ? CP.people || 0 : 0, nt = Math.min(CD.max, Math.ceil(np / CD.tent));
    if (CD.im.count !== nt) { CD.im.count = nt; CD.im.instanceMatrix.needsUpdate = true; } CD.cook.visible = np > 0; DRAW.stats.camp = { people: np, tents: nt }; }
  if (R && R.spurs) R.spurs.forEach(function (Sp) { if (!Sp.open || DRAW.lanes[Sp.id]) return; DRAW.lanes[Sp.id] = DRAW.lane(Sp); Sp.lots.forEach(function (L) { DRAW.lotWork(L); }); });   /* a street opened */
  (DRAW.lotWorks || []).forEach(function (W) {
    var p = typeof ISLE !== 'undefined' && ISLE.lotProgress ? ISLE.lotProgress(W.L) : { f: 0, onSite: null }, st = p.f >= 1 ? 'built' : p.f > 0 ? 'building' : 'cleared';
    by[st] = (by[st] || 0) + 1; if (p.f === W.f && !p.onSite) return; W.f = p.f;
    W.S.set(p.f, p.onSite); if (W.C) W.C.set(p.f);
  });
  DRAW.stats.lotStages = by; DRAW.stats.lots = (DRAW.lotWorks || []).length;
  return false;
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
