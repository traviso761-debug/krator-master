/* ============================== 2. THE SCENE: VOTH'S GROUND, WATER AND CANTONS ============================== */
/* [draw] The engine page (kits/catalog/krator-asset-engine.js) made scene, camera, renderer and controls.
   The ground is Voth's own terrainH and groundTone (VOTH, built from settlements/voth/src by build.py), with
   no roads, buildings or ground canvas: only the land, the lake and river, the islets and the cantons. */
var VIEW = { ext: 3900 };          /* the editable square: Voth's CITY_EXT, the overlay and minimap cover it */

VIEW.stage = function () {
  ground.visible = false; grid.visible = false;
  scene.background = new THREE.Color(0xbfcfd8);
  scene.fog = new THREE.Fog(0xbfcfd8, 5000, 13000);
  camera.far = 16000; camera.updateProjectionMatrix();
  /* the sun casts over the bay: one 4096 map across the cantons, bridges and the near shore (~0.8 m a texel) */
  sun.position.set(-1500, 2300, 900); sun.intensity = 1.5;
  sun.target.position.set(0, 0, 250); scene.add(sun.target);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  var sc = sun.shadow.camera; sc.left = -1900; sc.right = 1900; sc.top = 1900; sc.bottom = -1900; sc.near = 100; sc.far = 7000; sc.updateProjectionMatrix();
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 1.5;
  (window._frameHooks = window._frameHooks || []).push(function () {
    var h = Math.max(2, camera.position.y - Math.max(0, VOTH.terrainH(camera.position.x, camera.position.z)));
    var nr = clamp(h * 0.03, 0.3, 40);
    if (Math.abs(nr - camera.near) > camera.near * 0.15) { camera.near = nr; camera.updateProjectionMatrix(); }
  });
};
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

/* Surfaces, in the fragment shader, by world position (no UVs needed, nothing stretches):
   - detail: library sets (materials.json -> tex/ -> SL_TEX) as grey detail under Voth's own colours, projected
     on three axes and blended by the face normal. 'terrain' takes ground, rock on slopes and sand at the shore;
     'stone' (cantons, bridges, causeways) takes the dressed ashlar Voth's palette marks as its stone.
   - overlay: the drawn districts, painted on one canvas and laid over the ground and the water, so a polygon
     hugs every bump of the ground (Voth's own ground canvas works the same way). */
VIEW.detailTex = {};
VIEW.dtex = function (fam) {
  if (VIEW.detailTex[fam] !== undefined) return VIEW.detailTex[fam];
  var T = (typeof SL_TEX !== 'undefined') && SL_TEX[fam], t = null;
  if (T && T.map) { t = new THREE.TextureLoader().load(T.map); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
  return (VIEW.detailTex[fam] = t ? { tex: t, scale: T.scale[0] } : null);
};
VIEW.hook = function (mat, kind, overlay) {
  var fams = kind === 'terrain' ? ['ground', 'rock', 'sand'] : kind === 'stone' ? ['stone'] : [];
  var D = fams.map(VIEW.dtex);
  if (D.some(function (d) { return !d; })) D = [];          /* no pack: plain colour, as before */
  mat.customProgramCacheKey = function () { return 'site-' + kind + (overlay ? '-ov' : '') + (D.length ? '-d' : ''); };
  mat.onBeforeCompile = function (sh) {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvec4 _wp = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n_wp = instanceMatrix * _wp;\n#endif\nvWP = (modelMatrix * _wp).xyz;');
    var head = 'varying vec3 vWP;\n', body = '';
    if (D.length) {
      D.forEach(function (d, i) { sh.uniforms['uD' + i] = { value: d.tex }; head += 'uniform sampler2D uD' + i + ';\n'; });
      head += 'float tri(sampler2D t, float s, vec3 w) { return texture2D(t, vWP.zy / s).r * w.x + texture2D(t, vWP.xz / s).r * w.y + texture2D(t, vWP.xy / s).r * w.z; }\n';
      body += 'vec3 _n = normalize(cross(dFdx(vWP), dFdy(vWP))); vec3 _w = pow(abs(_n), vec3(4.0)); _w /= (_w.x + _w.y + _w.z);\n';
      var f = function (v) { return v.toFixed(2); };
      if (kind === 'terrain') body +=
        'float _g = tri(uD0, ' + f(D[0].scale) + ', _w), _r = tri(uD1, ' + f(D[1].scale) + ', _w), _s = tri(uD2, ' + f(D[2].scale) + ', _w);\n' +
        'float _rk = smoothstep(0.22, 0.5, 1.0 - abs(_n.y)), _bc = 1.0 - smoothstep(1.4, 9.0, vWP.y);\n' +
        'float _d = mix(mix(_g, _s, _bc), _r, _rk);\n' +
        /* a second, slow sample: fine detail averages to grey a few hundred metres out, this keeps the ground varied */
        'float _mg = mix(tri(uD0, ' + f(D[0].scale * 13) + ', _w), tri(uD1, ' + f(D[1].scale * 9) + ', _w), _rk);\n' +
        '_d = mix(_d, _mg, 0.45);\n' +
        'diffuseColor.rgb *= clamp(mix(1.0, _d / 0.5, 0.8), 0.35, 1.7);\n';
      else body += 'float _d = mix(tri(uD0, ' + f(D[0].scale) + ', _w), tri(uD0, ' + f(D[0].scale * 11) + ', _w), 0.4);\n' +
        'diffuseColor.rgb *= clamp(mix(1.0, _d / 0.5, 0.9), 0.3, 1.8);\n';
    }
    if (overlay) {
      sh.uniforms.uOv = { value: VIEW.ovTex }; sh.uniforms.uOvExt = { value: VIEW.ext };
      head += 'uniform sampler2D uOv;\nuniform float uOvExt;\n';
      body += 'vec2 ouv = vec2(vWP.x / (2.0 * uOvExt) + 0.5, 0.5 - vWP.z / (2.0 * uOvExt));\n' +
        'if (ouv.x > 0.0 && ouv.x < 1.0 && ouv.y > 0.0 && ouv.y < 1.0) { vec4 ov = texture2D(uOv, ouv); diffuseColor.rgb = mix(diffuseColor.rgb, pow(ov.rgb, vec3(2.2)), ov.a); }\n';
    }
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + head).replace('#include <map_fragment>', '#include <map_fragment>\n' + body);
  };
  mat.needsUpdate = true;
};
VIEW.overlayHook = function (mat) { VIEW.hook(mat, 'water', true); };
/* every mesh under a group: cast and take shadows, and wear the stone detail */
VIEW.stoneUp = function (root) {
  var seen = new Set();
  root.traverse(function (o) {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    var m = o.material;
    if (m && !seen.has(m) && m.isMeshStandardMaterial && !m.transparent && !m.userData.siteHooked) { VIEW.hook(m, 'stone', false); m.userData.siteHooked = true; }
    seen.add(m);
  });
};

VIEW.terrain = function () {
  var S = 2 * VIEW.ext, n = 2048;
  VIEW.ovCanvas = document.createElement('canvas'); VIEW.ovCanvas.width = VIEW.ovCanvas.height = 4096;
  VIEW.ovTex = new THREE.CanvasTexture(VIEW.ovCanvas); VIEW.ovTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  /* Voth's warped grid: fine in the city, coarse at the horizon, one seamless mesh */
  var SEG = 360, HW = VOTH.HW, warp = function (u) { var a = 0.17; return HW * (a * u + (1 - a) * u * u * u); };
  var g = new THREE.PlaneGeometry(2, 2, SEG, SEG).rotateX(-Math.PI / 2), P = g.attributes.position, col = new Float32Array(P.count * 3);
  for (var i = 0; i < P.count; i++) {
    var x = warp(P.getX(i)) * 1.26, z = warp(P.getZ(i)) * 1.26;
    P.setXYZ(i, x, VOTH.terrainH(x, z), z);
    var c = VOTH.groundTone(x, z);
    col[i * 3] = Math.pow(c[0] / 255, 2.2); col[i * 3 + 1] = Math.pow(c[1] / 255, 2.2); col[i * 3 + 2] = Math.pow(c[2] / 255, 2.2);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  VIEW.gBaseY = Float32Array.from({ length: P.count }, function (_, i) { return P.getY(i); }); VIEW.gBaseC = col.slice();
  var m = new THREE.MeshLambertMaterial({ vertexColors: true });
  VIEW.hook(m, 'terrain', true);
  VIEW.ground = new THREE.Mesh(g, m); VIEW.ground.frustumCulled = false; VIEW.ground.receiveShadow = true;
  VIEW.ground.userData = { kind: 'terrain', name: "Voth's ground (terrainH, no roads)" };
  scene.add(VIEW.ground);
  /* the lake and the river: Voth's SEA level */
  var wm = new THREE.MeshLambertMaterial({ color: new THREE.Color(0x4f7378).convertSRGBToLinear(), transparent: true, opacity: 0.86 });
  VIEW.overlayHook(wm);
  VIEW.water = new THREE.Mesh(new THREE.PlaneGeometry(HW * 2.6, HW * 2.6, 8, 8).rotateX(-Math.PI / 2), wm);
  VIEW.water.position.y = VOTH.SEA; VIEW.water.renderOrder = 1; VIEW.water.receiveShadow = true;
  VIEW.water.userData = { kind: 'water', name: 'Lake (SEA level)' };
  scene.add(VIEW.water);
  /* a coarse, hidden copy for picking: one ray test against 32k triangles, then refined on terrainH */
  var pg = new THREE.PlaneGeometry(S * 1.1, S * 1.1, 180, 180).rotateX(-Math.PI / 2), PP = pg.attributes.position;
  for (var k = 0; k < PP.count; k++) PP.setY(k, Math.max(VOTH.SEA, VOTH.terrainH(PP.getX(k), PP.getZ(k))));
  pg.computeBoundingSphere(); VIEW.pBaseY = Float32Array.from({ length: PP.count }, function (_, i) { return PP.getY(i); });
  VIEW.pickMesh = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  VIEW.pickMesh.visible = false; VIEW.pickMesh.updateMatrixWorld();
};
/* the ground (or the water over it) under a screen ray: [x, z, y], or null */
VIEW.surf = function (x, z) { return Math.max(VOTH.SEA, TERR.h(x, z)); };
VIEW.pick = function (ray) {
  var rc = new THREE.Raycaster(ray.origin, ray.direction); rc.firstHitOnly = true;
  VIEW.pickMesh.visible = true; var hit = rc.intersectObject(VIEW.pickMesh)[0]; VIEW.pickMesh.visible = false;
  if (!hit) return null;
  var o = ray.origin, d = ray.direction, above = function (t) { var x = o.x + d.x * t, z = o.z + d.z * t; return o.y + d.y * t > VIEW.surf(x, z); };
  var t0 = Math.max(0, hit.distance - 80), t1 = hit.distance + 80;
  for (var t = t0; t < t1; t += 4) if (!above(t)) { t1 = t; break; } else t0 = t;
  for (var q = 0; q < 14; q++) { var tm = (t0 + t1) / 2; if (above(tm)) t0 = tm; else t1 = tm; }
  var x = o.x + d.x * t1, z = o.z + d.z * t1;
  return [x, z, VIEW.surf(x, z)];
};

/* ---------------------------------------------------------------- terrain edits on the meshes
   The ground mesh keeps Voth's heights and colours; a vertex the edits moved takes base + delta and a colour by
   its new height (groundTone's own rules: lake bed, beach, rock on steep or high ground, the dry plain), so ground
   raised out of the lake reads as land and ground cut below it reads as lake bed. box: [x0, z0, x1, z1] or all. */
VIEW.tone = function (x, z, h) {
  var sm = function (a, b, v) { var t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); }, mx = function (a, b, t) { return a + (b - a) * t; };
  if (h < 1.2) { var t = sm(-16, 1.2, h); return [mx(64, 166, t), mx(72, 154, t), mx(70, 126, t)]; }
  var st = 9, slope = Math.min(1, Math.hypot(TERR.h(x + st, z) - h, TERR.h(x, z + st) - h) / st * 2.6);
  var beach = 1 - sm(1.8, 15, h), rock = sm(0.30, 0.78, slope) * 0.85 + sm(190, 330, h) * 0.58, r = 150, g = 139, b = 118;
  r = mx(r, 116, rock); g = mx(g, 110, rock); b = mx(b, 106, rock); r = mx(r, 186, beach); g = mx(g, 174, beach); b = mx(b, 146, beach);
  return [r, g, b];
};
VIEW.refreshTerrain = function (box, normals) {
  var G = VIEW.ground.geometry, P = G.attributes.position, C = G.attributes.color;
  for (var i = 0; i < P.count; i++) {
    var x = P.getX(i), z = P.getZ(i);
    if (box && (x < box[0] - 8 || x > box[2] + 8 || z < box[1] - 8 || z > box[3] + 8)) continue;
    var d = TERR.delta(x, z), y = VIEW.gBaseY[i] + d;
    P.setY(i, y);
    if (Math.abs(d) > 0.05) { var c = VIEW.tone(x, z, y); C.setXYZ(i, Math.pow(c[0] / 255, 2.2), Math.pow(c[1] / 255, 2.2), Math.pow(c[2] / 255, 2.2)); }
    else C.setXYZ(i, VIEW.gBaseC[i * 3], VIEW.gBaseC[i * 3 + 1], VIEW.gBaseC[i * 3 + 2]);
  }
  P.needsUpdate = true; C.needsUpdate = true;
  if (normals !== false) G.computeVertexNormals();
  var PG = VIEW.pickMesh.geometry, PP = PG.attributes.position;
  for (var k = 0; k < PP.count; k++) { var px = PP.getX(k), pz = PP.getZ(k); if (box && (px < box[0] - 30 || px > box[2] + 30 || pz < box[1] - 30 || pz > box[3] + 30)) continue; PP.setY(k, Math.max(VOTH.SEA, VIEW.pBaseY[k] + TERR.delta(px, pz))); }
  PP.needsUpdate = true; PG.computeBoundingSphere(); PG.boundingBox = null;
};

/* ---------------------------------------------------------------- the cantons: the city's own captured models, in place */
VIEW.cantons = function () {
  KratorLOD.enabled = true;
  var E = (window.VOTH_CITY_CAPTURE || {}).entries || {}, made = [];
  VIEW.cantonList = [];
  VOTH.CANTONS.forEach(function (c) {
    var key = 'voth_city_canton_' + c.n.toLowerCase(), v = E[key] && E[key][0];
    var bed = Math.min(-6, VOTH.terrainH(c.x, c.z));                 /* Voth's bedAt(): cantons stand on the lake bed */
    var rec = { n: c.n, x: c.x, z: c.z, r: c.r, top: c.top, key: key, ok: false };
    if (v && v.r && ASSET_BY_KEY[key]) {
      /* the plinth and its cap (the largest footprints) are centred on the canton: that fixes x and z. The
         capture puts the model's lowest base at y = 0, and a canton's plinth stands on the lake bed */
      var pl = null;
      v.r.forEach(function (r) { if (r[0] !== 9 && (!pl || r[5] * r[7] > pl[5] * pl[7])) pl = r; });
      var g = buildAsset(key, c.x - pl[2], c.z - pl[4], 0, { variant: 0, seed: 7, wealth: 1, y: bed });
      if (g && !g.userData.error) { g.userData.kind = 'canton'; g.userData.canton = c.n; rec.ok = true; rec.group = g; made.push(c.n); VIEW.stoneUp(g); }
    }
    VIEW.cantonList.push(rec);
  });
  VIEW.cantonsMade = made;
};

/* ---------------------------------------------------------------- bridges and causeways
   Voth's own span() and reclaimedCauseway() (50f-spans-build.js) on its own SPANS, CAUSEWAYS and RBRIDGES, the
   loops as 50f and 60-land.js run them, with the same seeds. Left out: the stairs, landing doors and canton
   doors that tie each end into a canton's tiers (they read the canton builders' own measurements). The span
   pylons are simplified: they spring from the canton's top deck, or just under the span on a tall canton. */
VIEW.bridges = function () {
  var B = VOTH; B.PRIMS.length = 0;
  B.reseed(777);
  B.SPANS.forEach(function (p) {
    var A = B.CANTONS[p.a], C = B.CANTONS[p.b], dx = C.x - A.x, dz = C.z - A.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    var w = B.rr(12, 17), ax = A.x + ux * A.r * 0.94, az = A.z + uz * A.r * 0.94, bx = C.x - ux * C.r * 0.94, bz = C.z - uz * C.r * 0.94, ry = Math.atan2(dx, dz);
    [[A, ax, az], [C, bx, bz]].forEach(function (e) {
      var spring = Math.min(e[0].top, B.DECK - 6);
      B.FR8(e[1], spring - 3, e[2], w * 1.85, B.DECK - spring + 4, w * 2.3, ry, B.shade(e[0].tone, 0.02));
      B.BOX(e[1], B.DECK + 1.0, e[2], w * 2.05, 2.8, w * 2.6, ry, B.shade(e[0].tone, -0.18));
    });
    B.span(ax, az, B.DECK, bx, bz, B.DECK, w, B.TONES[0], Math.min(20, L * 0.055), true);
  });
  B.reseed(3131);
  B.RBRIDGES.forEach(function (b) {
    var ya = B.terrainH(b.ax, b.az) + 2.2, yb = B.terrainH(b.bx, b.bz) + 2.2, deck = Math.max(ya, yb, 11.5), ry = Math.atan2(b.bx - b.ax, b.bz - b.az);
    [[b.ax, b.az, ya], [b.bx, b.bz, yb]].forEach(function (e) {
      B.FR8(e[0], e[2] - 3, e[1], b.w * 1.9, deck - e[2] + 3.2, b.w * 1.6, ry, 0x9a8f76);
      B.FR3(e[0], deck + 0.2, e[1], 3.2, 7, 3.2, ry, 0xa89d84);
    });
    B.span(b.ax, b.az, deck, b.bx, b.bz, deck, b.w, 0xa89d84, 6, true);
  });
  VIEW.bridgeMeshes = VIEW.primMeshes(B.PRIMS.slice(), 'Bridges');
  VIEW.bridgeCount = { spans: B.SPANS.length, river: B.RBRIDGES.length, prims: B.PRIMS.length };
};
/* primitives to meshes: one InstancedMesh per shape, colour per instance (palette hexes are sRGB) */
VIEW.primMeshes = function (prims, name) {
  var B = VOTH;
  /* Voth's unit shapes (45-kit.js SHAPES), base at y = 0 */
  var GEO = VIEW.GEO || (VIEW.GEO = { box: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), fr8: B.rectFrus(0.86, 0.86), fr6: B.rectFrus(0.60, 0.60), fr3: B.rectFrus(0.26, 0.26),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 10).translate(0, 0.5, 0), stk: new THREE.CylinderGeometry(0.8, 1, 1, 6).translate(0, 0.5, 0), cone: new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0),
    dome: new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), blob: new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5) });
  /* masonry wears the stone detail; foliage, timber, cloth and metal keep plain colour */
  var PLAIN = { leaf: 1, trunk: 1, wood: 1, cloth: 1, metal: 1, fungus: 1 };
  var mats = VIEW.primMats || (VIEW.primMats = {
    stone: (function () { var m = new THREE.MeshStandardMaterial({ roughness: 0.88 }); VIEW.hook(m, 'stone', false); return m; })(),
    plain: new THREE.MeshStandardMaterial({ roughness: 0.9 }), metal: new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.6 })
  });
  var by = {}; prims.forEach(function (r) { var mk = r[9] === 'metal' ? 'metal' : PLAIN[r[9]] ? 'plain' : 'stone', k = r[0] + '|' + mk; (by[k] = by[k] || []).push(r); });
  var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), col = new THREE.Color(), out = [];
  Object.keys(by).forEach(function (key) {
    var k = key.split('|')[0], L = by[key];
    if (!GEO[k]) return;
    var M = new THREE.InstancedMesh(GEO[k], mats[key.split('|')[1]], L.length);
    L.forEach(function (r, i) {
      q.setFromAxisAngle(Y, r[7]); m4.compose(new THREE.Vector3(r[1], r[2], r[3]), q, new THREE.Vector3(Math.max(r[4], 0.01), Math.max(r[5], 0.01), Math.max(r[6], 0.01)));
      M.setMatrixAt(i, m4); M.setColorAt(i, col.setHex(r[8]).convertSRGBToLinear());
    });
    M.frustumCulled = false; M.castShadow = true; M.receiveShadow = true; M.userData = { kind: 'bridge', name: name };
    scene.add(M); out.push(M);
  });
  return out;
};

/* ---------------------------------------------------------------- causeways, from the site's own records
   Voth's nine stand as records (SITE.vothCauseways, 10-site-model.js) until the site takes them over; a drawn one
   is a polyline. Each segment is built as Voth builds its causeways: a mole (reclaimedCauseway, at RLAND) or a
   bridge causeway (span, at CWAY over water, easing to the ground ashore, a pier pad under each inner corner).
   An end inside a canton's square gets Voth's abutment up the canton's flank, in the canton's tone. */
VIEW.cantonAt = function (p) { return VOTH.CANTONS.filter(function (c) { return Math.abs(p[0] - c.x) < c.r * 1.08 && Math.abs(p[1] - c.z) < c.r * 1.08; })[0] || null; };
VIEW.causeways = function () {
  var B = VOTH; B.PRIMS.length = 0;
  (VIEW.causewayMeshes || []).forEach(function (M) { scene.remove(M); if (M.dispose) M.dispose(); });
  SITE.causeways().forEach(function (l) {
    var h = 0; for (var i = 0; i < l.id.length; i++) h = (h * 31 + l.id.charCodeAt(i)) >>> 0;
    B.reseed(2468 + h % 100000);
    var P = l.pts, w = l.width, ends = [VIEW.cantonAt(P[0]), VIEW.cantonAt(P[P.length - 1])], cn = ends[0] || ends[1];
    var tone = cn && !cn.fortress ? cn.tone : B.TONES[0];
    var deck = function (p) { var g = B.terrainH(p[0], p[1]); return VIEW.cantonAt(p) || g < B.SEA ? B.CWAY : Math.max(B.CWAY - 6, g + 2.5); };
    ends.forEach(function (c, e) {
      if (!c) return;
      var p = e ? P[P.length - 1] : P[0], q = e ? P[P.length - 2] : P[1], ry = Math.atan2(q[0] - p[0], q[1] - p[1]);
      if (l.kind === 'mole') B.FR8(p[0], B.RLAND - 3, p[1], w * 0.60, c.top - B.RLAND + 3, w * 0.84, ry, B.shade(c.tone, 0.02));
      else B.FR8(p[0], B.CWAY - 2, p[1], w * 1.7, c.top - B.CWAY + 3, w * 2.4, ry, B.shade(c.tone, 0.02));
    });
    for (var k = 1; k < P.length; k++) {
      var a = P[k - 1], b = P[k];
      if (l.kind === 'mole') { B.reclaimedCauseway(a[0], a[1], b[0], b[1], w, tone); continue; }
      B.span(a[0], a[1], deck(a), b[0], b[1], deck(b), w, B.TONES[0], P.length > 2 ? 4 : 5, true);
      if (k < P.length - 1 && B.terrainH(b[0], b[1]) < B.CWAY - 2) {          /* a pier pad under an inner corner */
        var iy = Math.min(B.terrainH(b[0], b[1]), -1), ry2 = Math.atan2(b[0] - a[0], b[1] - a[1]);
        B.BOX(b[0], iy - 1, b[1], w * 2.6, B.CWAY - iy + 1, w * 2.6, ry2, B.shade(tone, -0.12));
        B.BOX(b[0], B.CWAY - 0.3, b[1], w * 2.9, 1.6, w * 2.9, ry2, B.shade(tone, -0.26));
      }
    }
  });
  VIEW.causewayMeshes = VIEW.primMeshes(B.PRIMS.slice(), 'Causeways');
  VIEW.causewayCount = { causeways: SITE.causeways().length, prims: B.PRIMS.length };
};

/* ---------------------------------------------------------------- labels */
VIEW.sprite = function (text, opt) {
  opt = opt || {};
  var c = document.createElement('canvas'), x = c.getContext('2d'), W = opt.round ? 128 : 512, H = 128;
  c.width = W; c.height = H;
  if (opt.round) {
    x.fillStyle = opt.bg || '#c0392b'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill();
    x.lineWidth = 8; x.strokeStyle = '#fff'; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold ' + (text.length > 1 ? 50 : 66) + 'px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 64, 68);
  } else {
    x.font = 'bold 50px Georgia'; var w = Math.min(500, x.measureText(text).width + 34);
    x.fillStyle = opt.bg || 'rgba(24,21,15,0.82)'; x.fillRect((512 - w) / 2, 22, w, 78);
    x.fillStyle = '#f3ecd8'; x.textAlign = 'center'; x.fillText(text, 256, 78);
  }
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }));
  s.scale.set(opt.size * W / H, opt.size, 1); s.renderOrder = 40;
  return s;
};
VIEW.cantonLabels = function () {
  VIEW.labels = [];
  VIEW.cantonList.forEach(function (c) {
    var s = VIEW.sprite(c.n + ' canton', { size: 0.035 }); s.position.set(c.x, (c.top || 40) + 60, c.z); scene.add(s); VIEW.labels.push(s);
  });
};

/* ---------------------------------------------------------------- the minimap: Voth's ground from above, the drawing over it */
VIEW.minimap = function () {
  var S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  var cx = cv.getContext('2d'), img = cx.createImageData(S, S), E = VIEW.ext;
  for (var j = 0; j < S; j++) for (var i = 0; i < S; i++) {
    var x = -E + (i + 0.5) / S * 2 * E, z = -E + (j + 0.5) / S * 2 * E, h = TERR.h(x, z), o = (j * S + i) * 4, c;
    if (h < VOTH.SEA) { var t = clamp(-h / 40, 0, 1); c = [92 - 40 * t, 128 - 40 * t, 134 - 30 * t]; }
    else { var s = clamp(0.75 + h / 400, 0.75, 1.15); c = [158 * s, 148 * s, 120 * s]; }
    img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  VIEW.mmBase = cv;
};
