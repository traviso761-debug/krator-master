/* ============================== HOOK SITE EDITOR: THE ADAPTER ([web]) ============================== */
/* Voth's site editor (settlements/voth/targets/voth-site: 10-site-model.js as 93, 55-site-tools.js as 95, the DOM of
   00-head.html as 93a, all read in place) is written against Voth's scene. This fragment gives the tools what they
   read from it, on the Port kit's page (KNOWN_ISSUES.md, "The site editor"):
     VIEW.ext            the editable square: the layout's extent (the site's zone), the overlay and the minimap cover it
     VIEW.surf/pick      the ground (or the sea over it) at a point, and under a screen ray: the Port's terrainH
                         (plus the editor's delta) through a hidden pick mesh refined by marching on surf
     VIEW.ovCanvas/ovTex the overlay the districts and avenues are painted on: a draped mesh over the square (Voth
                         projects it inside its ground shader; the Port's terrain shader is the kit's, left alone)
     VIEW.refreshTerrain the brushes' edits onto the Port's terrain chunks, the overlay and the pick mesh
     VIEW.sprite/mmBase  a label sprite; the minimap's base (the ground from above)
     VIEW.labels/cantonList/causeways/causewayHit   Voth's cantons and causeways: none here
     TERR                the model's delta grid, re-sized to the square (TERR.h = terrainH + delta)
     VOTH                SEA (0: the Port's sea level), terrainH, landDist (the shore along z), RLAND/CWAY (unused:
                         no causeways), DISTRICTS/CANTONS (none)
     ctl.dist/el/az/walk, updateCamera, window._setWalk, window._frameHooks   the catalog engine's camera, bridged
                         to the Port's ctl (theta, phi, radius) and applyCam; the frame hooks run from PORT_FRAME
   and keeps the Port's own pointer handling out of the tools' way (the orbit while a corner is dragged, the
   inspector on a click, WASD while typing in a field). Loads after the Port's camera (92) and the model (93). */
var VIEW = { ext: 1400 };
var VOTH = { SEA: 0, RLAND: 0, CWAY: 0, DISTRICTS: [], CANTONS: [], CAUSEWAYS: [], CIDX: {}, CPIERS: [],
  terrainH: function (x, z) { return terrainH(x, z); }, reseed: function () { }, rr: function (a) { return a; },
  shoreIn: function () { return [0, 0]; } };
/* the editable square: the site's zone (or the layout's footprints) with a margin, to the hundred */
VIEW.extent = function () {
  var e = 0, Z = (HOOK_SITE.districts || []).filter(function (d) { return d.type === 'zone'; })[0];
  if (Z) Z.poly.forEach(function (p) { e = Math.max(e, Math.abs(p[0]), Math.abs(p[1])); });
  else PORT_LAYOUT.items.forEach(function (it) { var f = portFoot(it); if (f) e = Math.max(e, Math.abs(f.x0), Math.abs(f.x1), Math.abs(f.z0), Math.abs(f.z1)); });
  return Math.ceil((e + 80) / 100) * 100 || 1400;
};
VIEW.ext = VIEW.extent();
/* the model's delta grid over the square (10-site-model.js sizes it for Voth's 3.9 km); nothing has been allocated yet */
TERR.ext = VIEW.ext; TERR.cell = 4; TERR.N = Math.ceil(2 * TERR.ext / TERR.cell) + 1; TERR.D = null; TERR.base = null; TERR.n = 0;

/* signed distance to the shore along z at this x: positive inland (the land is -z, the sea +z), negative out at sea;
   marched 5 m a step, at most 3 km. Enough for the inspector's "shore ... m inland". */
VOTH.landDist = function (x, z) {
  var land = TERR.h(x, z) >= 0, d = 0, s = land ? 5 : -5;
  for (var i = 0; i < 600; i++) { d += s; if ((TERR.h(x, z + d) >= 0) !== land) return land ? d - s / 2 : d - s / 2; }
  return land ? 3000 : -3000;
};
VIEW.surf = function (x, z) { return Math.max(VOTH.SEA, TERR.h(x, z)); };
VIEW.labels = []; VIEW.cantonList = [];
VIEW.causeways = function () { };
VIEW.causewayHit = function () { return false; };

/* ---------------------------------------------------------------- the camera: the engine's names on the Port's ctl */
Object.defineProperties(ctl, {
  dist: { get: function () { return ctl.radius; }, set: function (v) { ctl.radius = v; } },
  el: { get: function () { return Math.PI / 2 - ctl.phi; }, set: function (v) { ctl.phi = clamp(Math.PI / 2 - v, .05, Math.PI - .05); } },
  az: { get: function () { return ctl.theta; }, set: function (v) { ctl.theta = v; } },
  walk: { value: false, writable: true }
});
function updateCamera() { applyCam(); }
window._setWalk = function () { };
PORT_FRAME.push(function () { var H = window._frameHooks; if (H) for (var i = 0; i < H.length; i++) H[i](); });

/* ---------------------------------------------------------------- the Port's pointer handling, kept out of the tools' way */
(function () {
  var cv = renderer.domElement;
  /* a corner, marker or host being dragged, or a brush stroke: the Port's orbit (its pointermove) stays still */
  cv.addEventListener('pointermove', function (e) { if (typeof TOOL !== 'undefined' && (TOOL.drag || TOOL.stroke)) e.stopImmediatePropagation(); }, { capture: true });
  /* a click is the tools' (select, add a corner), not the Port's inspector: the Port's drag ends here */
  cv.addEventListener('pointerup', function (e) { drag = null; e.stopImmediatePropagation(); }, { capture: true });
  /* typing in a panel field is not WASD */
  window.addEventListener('keydown', function (e) { var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT') && !(e.ctrlKey || e.metaKey)) e.stopImmediatePropagation(); }, { capture: true });
  window.addEventListener('keyup', function (e) { var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) e.stopImmediatePropagation(); }, { capture: true });
})();

/* ---------------------------------------------------------------- the overlay, the pick mesh and the terrain edits */
/* the square as a draped grid (a vertex every `step` m) on the ground or the sea: the overlay rides on it */
VIEW.drape = function (step, lift, E) {
  var n = Math.ceil(2 * E / step) + 1, P = new Float32Array(n * n * 3), U = new Float32Array(n * n * 2), I = new Uint32Array((n - 1) * (n - 1) * 6), q = 0;
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
    var k = j * n + i, x = -E + i * step, z = -E + j * step;
    P[k * 3] = x; P[k * 3 + 1] = VIEW.surf(x, z) + lift; P[k * 3 + 2] = z; U[k * 2] = (x + E) / (2 * E); U[k * 2 + 1] = 1 - (z + E) / (2 * E);
  }
  for (var j2 = 0; j2 < n - 1; j2++) for (var i2 = 0; i2 < n - 1; i2++) { var a = j2 * n + i2, b = a + 1, c = a + n, d = c + 1; I[q++] = a; I[q++] = c; I[q++] = b; I[q++] = b; I[q++] = c; I[q++] = d; }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.BufferAttribute(U, 2)); g.setIndex(new THREE.BufferAttribute(I, 1));
  g.computeBoundingSphere(); g.userData = { step: step, lift: lift, E: E, n: n };
  return g;
};
VIEW.redrape = function (g, box) {
  var P = g.attributes.position, u = g.userData, pad = u.step + 8;
  for (var k = 0; k < P.count; k++) { var x = P.getX(k), z = P.getZ(k); if (box && (x < box[0] - pad || x > box[2] + pad || z < box[1] - pad || z > box[3] + pad)) continue; P.setY(k, VIEW.surf(x, z) + u.lift); }
  P.needsUpdate = true; g.computeBoundingSphere(); g.boundingBox = null;
};
VIEW.setup = function () {
  var E = VIEW.ext;
  VIEW.ovCanvas = document.createElement('canvas'); VIEW.ovCanvas.width = VIEW.ovCanvas.height = 2048;
  VIEW.ovTex = new THREE.CanvasTexture(VIEW.ovCanvas); VIEW.ovTex.anisotropy = renderer.capabilities.getMaxAnisotropy(); VIEW.ovTex.encoding = THREE.sRGBEncoding;
  var om = new THREE.MeshBasicMaterial({ map: VIEW.ovTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  VIEW.overlay = new THREE.Mesh(VIEW.drape(8, .6, E), om); VIEW.overlay.name = 'hook-site-overlay'; VIEW.overlay.renderOrder = 6; VIEW.overlay.frustumCulled = false;
  VIEW.overlay.userData.probeSkip = true; scene.add(VIEW.overlay);
  /* a coarse, hidden copy for picking: one ray test, then refined on surf */
  VIEW.pickMesh = new THREE.Mesh(VIEW.drape(16, 0, E * 1.15), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  VIEW.pickMesh.visible = false; VIEW.pickMesh.userData.probeSkip = true; VIEW.pickMesh.updateMatrixWorld();
  /* the Port's terrain chunks keep their built heights: an edit moves a vertex by the delta there */
  VIEW.chunks = (PORT_TERRAIN && PORT_TERRAIN.chunks || []).map(function (m) { return { m: m, base: m.geometry.attributes.position.array.slice() }; });
  VIEW.minimap();
  /* the city plan's own drawing (90b-hook-city-draw.js: outlines, labels, the streets) is the editor's to show: hidden until `z` */
  var g = scene.getObjectByName('hook-site'); if (g) g.visible = false;
};
VIEW.pick = function (ray) {
  var rc = new THREE.Raycaster(ray.origin, ray.direction); rc.firstHitOnly = true;
  VIEW.pickMesh.visible = true; var hit = rc.intersectObject(VIEW.pickMesh)[0]; VIEW.pickMesh.visible = false;
  if (!hit) return null;
  var o = ray.origin, d = ray.direction, above = function (t) { return o.y + d.y * t > VIEW.surf(o.x + d.x * t, o.z + d.z * t); };
  var t0 = Math.max(0, hit.distance - 60), t1 = hit.distance + 60;
  for (var t = t0; t < t1; t += 3) { if (above(t)) t0 = t; else { t1 = t; break; } }
  for (var q = 0; q < 14; q++) { var tm = (t0 + t1) / 2; if (above(tm)) t0 = tm; else t1 = tm; }
  var x = o.x + d.x * t1, z = o.z + d.z * t1;
  return [x, z, VIEW.surf(x, z)];
};
VIEW.refreshTerrain = function (box, normals) {
  VIEW.chunks.forEach(function (c) {
    var P = c.m.geometry.attributes.position, B = c.base, touched = false;
    for (var k = 0; k < P.count; k++) {
      var x = B[k * 3], z = B[k * 3 + 2];
      if (box && (x < box[0] - 8 || x > box[2] + 8 || z < box[1] - 8 || z > box[3] + 8)) continue;
      var dl = TERR.delta(x, z); if (!dl && P.getY(k) === B[k * 3 + 1]) continue;
      P.setY(k, B[k * 3 + 1] + dl); touched = true;
    }
    if (!touched) return;
    P.needsUpdate = true; if (normals !== false) c.m.geometry.computeVertexNormals(); c.m.geometry.computeBoundingSphere();
  });
  VIEW.redrape(VIEW.overlay.geometry, box); VIEW.redrape(VIEW.pickMesh.geometry, box);
};
/* a label: a lettered disc (round) or a text plate, screen-sized (sizeAttenuation off) */
VIEW.sprite = function (text, opt) {
  opt = opt || {};
  var c = document.createElement('canvas'), x = c.getContext('2d'), W = opt.round ? 128 : 512, H = 128;
  c.width = W; c.height = H;
  if (opt.round) {
    x.fillStyle = opt.bg || '#c0392b'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill();
    x.lineWidth = 8; x.strokeStyle = '#fff'; x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold ' + (text.length > 1 ? 50 : 66) + 'px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 64, 68);
  } else {
    x.font = 'bold 44px Georgia'; var w = Math.min(500, x.measureText(text).width + 34);
    x.fillStyle = opt.bg || 'rgba(24,21,15,0.82)'; x.fillRect((512 - w) / 2, 24, w, 76);
    x.fillStyle = opt.fg || '#f3ecd8'; x.textAlign = 'center'; x.fillText(text, 256, 78);
  }
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false, fog: false }));
  s.scale.set(opt.size * W / H, opt.size, 1); s.renderOrder = 40; s.userData.probeSkip = true;
  return s;
};
/* the minimap's base: the ground from above (the sea by depth, the land by height over the quays) */
VIEW.minimap = function () {
  var S = 256, cv = document.createElement('canvas'); cv.width = cv.height = S;
  var cx = cv.getContext('2d'), img = cx.createImageData(S, S), E = VIEW.ext, D = PORT.DECK;
  for (var j = 0; j < S; j++) for (var i = 0; i < S; i++) {
    var x = -E + (i + 0.5) / S * 2 * E, z = -E + (j + 0.5) / S * 2 * E, h = TERR.h(x, z), o = (j * S + i) * 4, c;
    if (h < VOTH.SEA) { var t = clamp(-h / 30, 0, 1); c = [86 - 36 * t, 124 - 40 * t, 138 - 30 * t]; }
    else { var s = clamp(0.72 + (h - D) / 160, 0.72, 1.2); c = [160 * s, 148 * s, 118 * s]; }
    img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  VIEW.mmBase = cv;
};
