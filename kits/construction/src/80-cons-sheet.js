/* ============================== kits/construction: THE KIT SHEET (2026-11-09) ============================== */
/* [web] The kit's own page: three cultures' houses going up, a row each, at six stages left to right (cleared, footing,
   frame, infill, roof, built), each a Construction kit site (KCONS.site, with the library's maps: KCONS.libMats) round the
   culture kit's own piece revealed by core/city (KCITY.constructMesh). The pieces come from the kits sealed for another
   world's page and read in place: the Islanders (ISK) and the Iziz Vernacular (IZV) as the isle demo seals them
   (settlements/isle-demo/bundles.py), Xanadu as its kit seals itself (XAK, kits/xanadu/kit_bundle.py); each flattened by
   the isle demo's isleFlatten (58-isle-protos.js, read in place), as the isle demo's lots and Longsong's villages do.
   A stage's f is read off the piece's own build order (KCITY.constructKeys: the footing's share, then halfway through the
   walls (the frame), the walls done (the infill), halfway through the roof), so each column shows what its name says
   whatever the kit. Everything is registered in core/tags before it is drawn (a site a building, its piles props, its
   scaffold a part). The page is core/host's (camera, panel, inspector, polygon tool, probe), under the placeholder sky
   (KratorSky, core/atmos/placeholder). It decides nothing a settlement would: the bills and stages are the sheet's
   examples. window._api (verify.py --assert): cells(), floats(), zfight(), determinism(), tags(), lib(). */
var CONS_SHEET = (function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false; document.body.appendChild(renderer.domElement);
  var ANISO = Math.max(1, Math.min(8, renderer.capabilities.getMaxAnisotropy() || 1));
  var scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0xc8c0b0, 0.0016);
  var camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.15, 9000);
  /* ---------------------------------------------------------------- the placeholder sky and its light */
  var skyScene = new THREE.Scene(), skyCam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 1, 9000); KratorSky.attach(skyScene, 4200);
  var SKY = { hour: Q.get('hour') ? +Q.get('hour') : 10.5, day: 200, dens: 1.6 };
  var hemi = new THREE.HemisphereLight(0xffe6c8, 0x7a6a50, 0.75); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xfff0dc, 1.7); scene.add(sun); scene.add(sun.target); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  (function () { var c = sun.shadow.camera; c.left = -90; c.right = 90; c.top = 90; c.bottom = -90; c.near = 10; c.far = 800; })(); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.3;
  var LIGHTDIR = new THREE.Vector3(0.4, 0.7, 0.3).normalize();
  function skyApply() { KratorSky.update(new THREE.Vector3(), SKY.hour, SKY.day, SKY.dens); var L = KratorSky.lighting();
    LIGHTDIR.copy(L.sunDir.y > 0.02 ? L.sunDir : new THREE.Vector3(0.3, 0.6, -0.4).normalize()); sun.color.copy(L.sunColor || new THREE.Color(1, 0.95, 0.86));
    sun.intensity = L.sunDir.y > 0.02 ? L.sunIntensity * 1.05 : 0.05; hemi.intensity = 0.3 + L.ambient * 0.75; scene.fog.color.copy(L.fog); }
  skyApply();
  /* ---------------------------------------------------------------- the ground: the kit's own backdrop set (materials.json 'ground', own) */
  var GROUND = 700, groundMat = new THREE.MeshStandardMaterial({ color: 0x8a8a5a, roughness: 1 });
  if (KMAT.bindMat('construction', { ground: groundMat }, { tile: { ground: GROUND }, aniso: ANISO }).ground) groundMat.color.setHex(0xffffff);
  var groundM = new THREE.Mesh(new THREE.PlaneGeometry(GROUND, GROUND), groundMat); groundM.rotation.x = -Math.PI / 2; groundM.receiveShadow = true; groundM.name = 'ground'; groundM.userData.isGround = true; scene.add(groundM);
  /* ---------------------------------------------------------------- the rows (a culture's house and an example bill) and the stages */
  var ROWS = [
    { id: 'islander', culture: 'islander', kit: 'isk', key: 'iw-house-rumah', name: 'Rumah (West), the Ring Sea Islanders', bill: { timber: 40, stone: 2, mats: 30 } },
    { id: 'iziz', culture: 'iziz', kit: 'izv', key: 'vern_house_mid_a', name: 'Plaster townhouse, the Iziz Vernacular', bill: { stone: 20, timber: 12, planks: 10, sand: 8 } },
    { id: 'xanadu', culture: 'xanadu', kit: 'xak', key: 'xa_house_turk_b', name: 'Timber corner house, Xanadu', bill: { brick: 30, timber: 24, sand: 10, rope: 3, cloth: 4 } }];
  var STAGES = ['cleared', 'footing', 'frame', 'infill', 'roof', 'built'];
  function stageF(parts) {   /* the stages' f off the piece's own order: phase 0 the footing, 1 the walls (frame then infill by band), 2 the roof */
    var A = KCITY.constructKeys(parts).all, n = A.length, upto = function (k) { var c = 0; while (c < n && A[c] < k) c++; return c / n; };
    var f1 = Math.max(0.02, upto(1)), f2 = Math.max(f1 + 0.04, upto(2));
    return { cleared: 0, footing: f1, frame: f1 + (f2 - f1) * 0.5, infill: f2, roof: f2 + (1 - f2) * 0.5, built: 1 };
  }
  /* ---------------------------------------------------------------- the pieces, built once at the origin and flattened */
  var CACHE = { protos: {}, failed: {}, built: 0 }, ERRORS = [], XAKBOUND = null;
  function protoBox(parts) { var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    parts.forEach(function (pt) { var A = pt.geo.attributes.position.array; for (var i = 0; i < A.length; i += 3) {
      x0 = Math.min(x0, A[i]); x1 = Math.max(x1, A[i]); y0 = Math.min(y0, A[i + 1]); y1 = Math.max(y1, A[i + 1]); z0 = Math.min(z0, A[i + 2]); z1 = Math.max(z1, A[i + 2]); } });
    return { w: 2 * Math.max(Math.abs(x0), Math.abs(x1)), d: 2 * Math.max(Math.abs(z0), Math.abs(z1)), h: y1 - Math.min(0, y0), y0: y0 }; }
  function proto(R) {
    try {
      if (R.kit === 'xak') {
        if (typeof XAK === 'undefined') throw new Error('no XAK on the page');
        if (XAKBOUND === null) XAKBOUND = XAK.bind(KMAT) || {};
        var G = XAK.proto(R.key, 0); if (!G) throw new Error('XAK could not build ' + R.key);
        return { parts: isleFlatten(G) };
      }
      var P = isleProto(R.kit, R.key, 0, CACHE); if (!P) throw new Error(CACHE.failed[R.kit + ':' + R.key + '#0'] || 'no piece');
      return P;
    } catch (e) { ERRORS.push(R.id + ': ' + (e && e.message || e)); return null; }
  }
  /* ---------------------------------------------------------------- the sheet: registered first, then drawn */
  var LIB = KCONS.libMats('construction'), T = KTAGS.page = KTAGS.create({ build: 'construction' }), REG = [], CELLS = [], LABELS = [];
  var shadow = function (g) { g.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
  ROWS.forEach(function (R) { var P = proto(R); R.parts = P ? P.parts : null; R.box = R.parts ? protoBox(R.parts) : { w: 10, d: 8, h: 7, y0: 0 }; R.F = R.parts ? stageF(R.parts) : null; });
  var CW = Math.max.apply(null, ROWS.map(function (R) { return R.box.w; })) + 20, zrow = 0;
  ROWS.forEach(function (R, ri) {
    var b = R.box; zrow -= ri ? b.d / 2 + 14 : 0; R.z = zrow;
    STAGES.forEach(function (st, si) {
      var x = (si - (STAGES.length - 1) / 2) * CW, z = R.z, f = R.F ? R.F[st] : 0;
      var S = KCONS.site({ w: b.w, d: b.d, h: b.h, eaves: b.h * 0.55, bill: R.bill, mats: LIB }); S.set(f);
      var C = R.parts ? KCITY.constructMesh(R.parts) : null; if (C) C.set(f);
      var g = new THREE.Group(); g.name = 'site ' + R.id + ' ' + st; g.position.set(x, 0, z); g.add(S.group); if (C) g.add(C.group); g.updateMatrixWorld(true);
      /* the records, before the group goes into the scene: the site, its piles still on site, its scaffold while up */
      var pw = b.w + 2, pd = b.d + 2;
      var rec = T.add({ 'class': 'building', kind: 'site', key: R.key, name: 'Building site: ' + R.name + ' (' + st + ')', at: [x, 0, z], size: [pw, pd, b.h],
        tags: { culture: R.culture, family: 'construction', variant: st, role: 'building site' }, note: 'f ' + f.toFixed(3), frag: '80-cons-sheet.js' });
      Object.keys(S.parts.piles).forEach(function (gd) { var Pl = S.parts.piles[gd]; if (!Pl.visible) return; var bb = new THREE.Box3().setFromObject(Pl), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
        T.child(rec.id, { 'class': 'prop', kind: 'pile', key: 'pile-' + gd, name: gd + ' (' + Pl.userData.kind + ')', at: [c.x, 0, c.z], size: [sz.x, sz.z, sz.y], tags: { culture: 'generic', family: 'construction' } }); });
      if (S.parts.scaffold.visible) T.child(rec.id, { 'class': 'part', kind: 'scaffold', key: 'scaffold', name: 'Scaffold', at: [x, 0, z], size: [b.w + 2.2, b.d + 2.2, S.eaves + 2.3], tags: { culture: 'generic', family: 'construction' } });
      REG.push({ name: g.name, x: x, y: 0, z: z, r: Math.max(pw, pd) / 2, h: b.h, type: 'site' });
      if (typeof KWALK !== 'undefined' && f > 0) KWALK.block([x - b.w / 2, x + b.w / 2, z - b.d / 2, z + b.d / 2, 0, b.h], rec.id);
      scene.add(shadow(g));
      CELLS.push({ row: R.id, stage: st, f: f, x: x, z: z, S: S, C: C, g: g, rec: rec });
    });
    zrow -= b.d / 2 + 6;
  });
  /* ---------------------------------------------------------------- labels: the stages over the first row, each row's name at its left */
  function label(text, x, y, z, size) { var cv = document.createElement('canvas'), ctx = cv.getContext('2d'); cv.width = 512; cv.height = 96;
    ctx.fillStyle = 'rgba(20,18,14,0.62)'; ctx.fillRect(0, 0, 512, 96); ctx.fillStyle = '#f4ead4'; var px = 44; ctx.font = '600 44px system-ui,sans-serif'; while (px > 16 && ctx.measureText(text).width > 488) { px -= 2; ctx.font = '600 ' + px + 'px system-ui,sans-serif'; } ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 50);
    var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, fog: false }));
    sp.scale.set(size, size * 96 / 512, 1); sp.position.set(x, y, z); sp.name = 'label ' + text; sp.userData.label = true; scene.add(sp); LABELS.push(sp); return sp; }
  var top = ROWS[0], hmax = Math.max.apply(null, ROWS.map(function (R) { return R.box.h; }));
  STAGES.forEach(function (st, si) { label(st, (si - (STAGES.length - 1) / 2) * CW, hmax + 5, top.z + top.box.d / 2 + 4, 15); });
  ROWS.forEach(function (R) { label(R.name, -((STAGES.length - 1) / 2) * CW, 2.5, R.z + R.box.d / 2 + 3, 24); });
  /* ---------------------------------------------------------------- the checks verify.py runs (window._api) */
  var hashAdd = function (h, v) { return KRAND.hash(h, Math.round(v * 1000)); };
  function sigObject(o) { var h = 7; o.updateMatrixWorld(true); o.traverse(function (m) { if (!m.isMesh || !m.visible) return; var e = m.matrixWorld.elements; for (var i = 0; i < 16; i++) h = hashAdd(h, e[i]);
    var A = m.geometry.attributes.position.array; h = hashAdd(h, A.length); for (var j = 0; j < A.length; j += 7) h = hashAdd(h, A[j]); }); return h; }
  function visibleIn(m, root) { for (var o = m; o && o !== root.parent; o = o.parent) if (!o.visible) return false; return true; }
  function consMeshes(c) { var out = []; c.S.group.traverse(function (m) { if (m.isMesh && m.userData.cons && visibleIn(m, c.S.group)) out.push(m); }); return out; }
  var API = {
    rows: function () { return ROWS.map(function (R) { return { id: R.id, kit: R.kit, key: R.key, parts: R.parts ? R.parts.length : 0, box: R.box, F: R.F }; }); },
    errors: function () { return ERRORS.slice(); },
    /* every cell: its f, the share of the piece drawn, what of the site shows */
    cells: function () { return CELLS.map(function (c) { var drawn = 0, all = 0;
      if (c.C) c.C.group.children.forEach(function (m) { all += m.geometry.index.count / 3; if (m.visible) drawn += m.geometry.drawRange.count / 3; });
      var piles = {}; Object.keys(c.S.parts.piles).forEach(function (gd) { piles[gd] = c.S.parts.piles[gd].visible; });
      return { row: c.row, stage: c.stage, f: c.f, drawn: drawn, all: all, plot: c.S.parts.plot.visible, scaffold: c.S.parts.scaffold.visible, piles: piles, meshes: consMeshes(c).length }; }); },
    /* nothing floats: every visible site mesh rests on the ground (or the plot) or on another visible site mesh under it whose
       box meets its own in plan; the piece's own lowest point at the ground */
    floats: function (tol) { tol = tol == null ? 0.03 : tol; var bad = [], n = 0;
      CELLS.forEach(function (c) { var M = consMeshes(c), B = M.map(function (m) { return new THREE.Box3().setFromObject(m); });
        M.forEach(function (m, i) { n++; var b = B[i]; if (b.min.y <= tol) return;
          var ok = B.some(function (o, j) { return j !== i && o.min.y < b.min.y - 1e-4 && o.max.y >= b.min.y - tol && o.min.x <= b.max.x + tol && o.max.x >= b.min.x - tol && o.min.z <= b.max.z + tol && o.max.z >= b.min.z - tol; });
          if (!ok) bad.push(c.row + '/' + c.stage + ' ' + m.name + ' at y ' + b.min.y.toFixed(3)); });
        if (c.C && c.f > 0) { var pb = new THREE.Box3(); c.C.group.children.forEach(function (m) { if (m.visible) pb.union(new THREE.Box3().setFromObject(m)); });
          if (!pb.isEmpty() && pb.min.y > tol + 0.12) bad.push(c.row + '/' + c.stage + ' the piece starts at y ' + pb.min.y.toFixed(3)); } });
      return { n: n, bad: bad }; },
    /* z-fighting among the site's own boxes: two axis-aligned boxes of one site with a face on the same plane, facing the same
       way, overlapping in area (the ladder, turned, is left out; soles on the ground are not seen) */
    zfight: function () { var bad = [], n = 0, ax = ['x', 'y', 'z'];
      CELLS.forEach(function (c) { var M = consMeshes(c).filter(function (m) { if (m.geometry.type !== 'BoxGeometry') return false; for (var o = m; o; o = o.parent) if (o.rotation.x || o.rotation.y || o.rotation.z) return false; return true; }),
          B = M.map(function (m) { return new THREE.Box3().setFromObject(m); }); n += M.length;
        for (var i = 0; i < M.length; i++) for (var j = i + 1; j < M.length; j++) for (var a = 0; a < 3; a++) ['min', 'max'].forEach(function (side) {
          if (Math.abs(B[i][side][ax[a]] - B[j][side][ax[a]]) > 1e-4) return;
          if (a === 1 && side === 'min' && B[i].min.y < 1e-3) return;   /* two feet on the ground: their soles are never seen */
          var ov = 1; for (var q = 0; q < 3; q++) if (q !== a) ov *= Math.max(0, Math.min(B[i].max[ax[q]], B[j].max[ax[q]]) - Math.max(B[i].min[ax[q]], B[j].min[ax[q]]));
          if (ov > 1e-4) bad.push(c.row + '/' + c.stage + ' ' + M[i].name + ' and ' + M[j].name + ' share their ' + side + ' ' + ax[a] + ' face (' + ov.toFixed(4) + ' m2)'); }); });
      return { n: n, bad: bad }; },
    /* the same record twice gives the same site and the same order: a fresh site and a fresh piece against the sheet's */
    determinism: function () { var out = [];
      ROWS.forEach(function (R) { var c = CELLS.filter(function (q) { return q.row === R.id && q.stage === 'frame'; })[0]; if (!c || !R.parts) { out.push({ row: R.id, ok: false, why: 'no piece' }); return; }
        var S2 = KCONS.site({ w: R.box.w, d: R.box.d, h: R.box.h, eaves: R.box.h * 0.55, bill: R.bill, mats: LIB }).set(c.f), g2 = new THREE.Group(); g2.position.copy(c.g.position); g2.add(S2.group);
        var siteSame = sigObject(g2) === sigObject(c.S.group);
        var P2 = R.kit === 'xak' ? { parts: isleFlatten(XAK.proto(R.key, 0)) } : { parts: isleFlatten(R.kit === 'isk' ? ISK.proto(R.key, 0) : IZV.proto(R.key, 0, 1)) };
        var h = function (parts) { var x = 11; parts.forEach(function (pt) { var A = pt.geo.attributes.position.array; x = hashAdd(x, A.length); for (var i = 0; i < A.length; i += 5) x = hashAdd(x, A[i]); }); return x; };
        var pieceSame = h(P2.parts) === h(R.parts), O1 = KCITY.constructKeys(R.parts).all, O2 = KCITY.constructKeys(P2.parts).all;
        var orderSame = O1.length === O2.length && O1.every(function (k, i) { return k === O2[i]; });
        out.push({ row: R.id, ok: siteSame && pieceSame && orderSame, site: siteSame, piece: pieceSame, order: orderSame }); });
      return out; },
    tags: function () { return { audit: T.audit(), records: T.records.length }; },
    lib: function () { return { bound: LIB._bound, xak: XAKBOUND }; },
    labels: function () { return LABELS.length; },
    scene: scene, camera: camera
  };
  window.renderer = renderer;   /* the harness's draw-call sample reads it */
  /* ---------------------------------------------------------------- the page, handed to core/host */
  var W = STAGES.length * CW, zmid = (ROWS[0].z + ROWS[ROWS.length - 1].z) / 2;
  var VIEWS = { 'The sheet': [0, W * 0.5, zmid + W * 0.72, 0, 0, zmid - 4] };
  ROWS.forEach(function (R) { VIEWS[R.id] = [0, R.box.h * 2.2 + 24, R.z + R.box.d / 2 + W * 0.42, 0, R.box.h * 0.35, R.z]; });
  (function () { var c = CELLS.filter(function (q) { return q.row === 'xanadu' && q.stage === 'frame'; })[0]; if (c) VIEWS['Close up, the frame'] = [c.x + 14, 9, c.z + 20, c.x, 3, c.z]; })();
  KHOST.on(function consFrame() { var C = KHOST.cam, tg = C.ctl.walk ? camera.position : C.ctl.target;
    sun.target.position.set(tg.x, 0, tg.z); sun.position.set(tg.x + LIGHTDIR.x * 300, LIGHTDIR.y * 300, tg.z + LIGHTDIR.z * 300); sun.target.updateMatrixWorld();
    skyCam.quaternion.copy(camera.quaternion); skyCam.fov = camera.fov; skyCam.aspect = camera.aspect; skyCam.updateProjectionMatrix(); }, 'view');
  KHOST.take({ build: 'construction', title: 'Construction Kit',
    hint: 'Three cultures\' houses going up: cleared, footing, frame, infill, roof, built. The site is the Construction kit\'s (KCONS), the house its own kit\'s piece revealed by core/city',
    scene: scene, camera: camera, renderer: renderer, ground: function () { return 0; }, walk: typeof KWALK !== 'undefined' ? KWALK : null, clear: 0.4, minR: 1, maxR: 1500,
    views: VIEWS, start: 'The sheet', registry: REG,
    legend: [['#8c6c48', 'scaffold: poles, ledgers, board walk, ladder'], ['#6e5a40', 'the cleared plot, stakes and string'], ['#c2a868', 'the bill\'s materials, shrinking as they are built in']],
    inspect: function (hit, hits, rec) { if (!rec) return null; var site = rec.parent ? T.get(rec.parent) : rec;
      return KTAGS.label(rec) + (site && site !== rec ? '\non ' + site.name : '') + (site && site.note ? '\n' + site.note : ''); },
    stats: function () { return 'sites ' + CELLS.length + '  records ' + T.records.length + (ERRORS.length ? '\nerrors ' + ERRORS.length : ''); },
    draw: function (sc, cam) { renderer.clear(); renderer.render(skyScene, skyCam); renderer.render(sc, cam); },
    exporters: { tags: function () { return T.export(); } },
    api: API });
  addEventListener('resize', function () { skyCam.aspect = innerWidth / innerHeight; skyCam.updateProjectionMatrix(); });
  if (ERRORS.length) (window.ERR || console.error)('construction sheet: ' + ERRORS.join('; '));
  return { ROWS: ROWS, CELLS: CELLS, STAGES: STAGES, LIB: LIB, API: API };
})();
function setView() { return KHOST.setView.apply(KHOST, arguments); }
