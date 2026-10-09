/* ============================== 6c. HOST: THE DEV TOOLS (paths, the pin, the editor) ============================== */
/* [web] Three tools the owner asked for on the city plan (2026-10-09):
   - "Paths": Voth's path visualizer (settlements/voth/src/87-pathviz.js, lifted by build.py) with the city's own
     populations registered: the streets by class, the elephant bug and ferry lines with their stations and where each
     vehicle is right now, and the owner's painted streets.
   - the pin (Dhelv's, kits/zeijani/src/92-camera.js): a double-click on the ground drops it; G flies the camera to it,
     F walks from it. Walking follows the ground.
   - the editor (b; the Ys city editor's pattern, settlements/ys/targets/city/94-city-editor.js): place a Voth kit
     building (aligned to the nearest street, Q/E turn the last one, R aligns it), paint a street of any class, delete a
     building or a painted street; select, delete and plant flora (59-vc-flora-edit.js). Saved to site/voth-city-edits.json through serve.py; the layout applies the file
     (VC.applyEdits, 35-vc-steps.js) when the page next loads. */

VC.ground = function (e) {
  var r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  return { ray: r.ray, at: VIEW.pick(r.ray) };
};
VC.typing = function (e) { var t = e.target; return t && (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable); };

/* ---------------------------------------------------------------- Paths: the city's populations */
VC.PATHCOL = { highway: 0xffb21e, avenue: 0xff3df0, main: 0x36d1ff, side: 0x7dff5a, alley: 0xb38bff, lane: 0xc8a060, strider: 0xd9792b, ferry: 0x3a9ad9, painted: 0xffffff };
VC.pathviz = function () {
  if (typeof pathvizRegister === 'undefined') return;
  var y = function (x, z) { return VIEW.surf(x, z) + 0.6; };
  var polyline = function (arr, P, every) {
    for (var i = every; i < P.length + every - 1; i += every) {
      var a = P[i - every], b = P[Math.min(i, P.length - 1)];
      pathvizPushSeg(arr, a[0], y(a[0], a[1]), a[1], b[0], y(b[0], b[1]), b[1]);
    }
  };
  ['highway', 'avenue', 'main', 'side', 'alley', 'lane'].forEach(function (cls) {
    if (!PLAN.ways.some(function (w) { return w.cls === cls; })) return;
    pathvizRegister({ key: 'street-' + cls, label: 'Streets: ' + cls + (cls === 'lane' ? ' (country lanes)' : ''), color: VC.PATHCOL[cls],
      lines: function (arr) { PLAN.ways.forEach(function (w) { if (w.cls === cls && w.born <= HOST.step && w.tag !== 'painted street') polyline(arr, w.pts, 3); }); } });
  });
  ['strider', 'ferry'].forEach(function (kind) {
    var lines = function () { return PLAN.transit ? PLAN.transit.lines.filter(function (l) { return l.kind === kind; }) : []; };
    if (!lines().length) return;
    pathvizRegister({ key: kind + '-lines', label: (kind === 'ferry' ? 'Ferry' : 'Elephant bug') + ' lines, stations, vehicles now', color: VC.PATHCOL[kind], postR: 10,
      lines: function (arr) {
        if (HOST.step < SL.TRANSIT) return;
        lines().forEach(function (l) {
          polyline(arr, l.pts, 1);
          for (var k = 0; k < (l.vehicles || 0); k++) {
            var p = SIM.vehiclePose(l.id, k, VC.motionT || 0);
            if (p && !p.offMap) pathvizGlow(arr, p.x, y(p.x, p.z) + 4, p.z, kind === 'ferry' ? 14 : 10);
          }
        });
      },
      posts: function () { return HOST.step < SL.TRANSIT || !PLAN.transit ? [] : PLAN.transit.stations.filter(function (s) { return s.kind === kind; }).map(function (s) { return { x: s.x, z: s.z, y: y(s.x, s.z) }; }); } });
  });
  pathvizRegister({ key: 'painted', label: 'Streets: painted by the owner', color: VC.PATHCOL.painted,
    lines: function (arr) { (VC.ED.data.streets || []).forEach(function (s) { polyline(arr, s.pts, 1); }); } });
  /* the picture follows the step slider */
  var apply = HOST.applyStep;
  HOST.applyStep = function () { apply(); if (typeof PATHVIZ_ON !== 'undefined' && PATHVIZ_ON) pathvizShow($('pathvizSel').value); };
};

/* ---------------------------------------------------------------- the pin, G and F (Dhelv's markAt / markGo) */
VC.PIN = { at: null, objs: [] };
/* where a person stands: the highest walkable floor (core/walk KWALK: a canton's levels, its bridges and stairs, the
   causeways) at or under `below`, or the ground */
VC.standY = function (x, z, below) {
  var g = VIEW.surf(x, z); if (typeof KWALK === 'undefined') return g;
  var fs = KWALK.floorsAt(x, z);
  for (var i = 0; i < fs.length; i++) if (below == null || fs[i][0] <= below) return Math.max(g, fs[i][0]);
  return g;
};
/* the first floor (or the ground) a screen ray meets: [x, z, y] */
VC.standPick = function (ray) {
  var g = VIEW.pick(ray), gd = g ? Math.hypot(g[0] - ray.origin.x, g[1] - ray.origin.z) : Infinity;
  if (typeof KWALK === 'undefined') return g;
  var o = ray.origin, d = ray.direction, hz = Math.hypot(d.x, d.z) || 1e-6, prev = o.y;
  for (var t = 1; t < 9000; t += 1.5) {
    var x = o.x + d.x * t, z = o.z + d.z * t, y = o.y + d.y * t;
    if (Math.hypot(x - o.x, z - o.z) > gd) break;
    var fs = KWALK.floorsAt(x, z);
    for (var i = 0; i < fs.length; i++) if (prev > fs[i][0] && y <= fs[i][0] + 0.05) return [x, z, fs[i][0]];
    prev = y;
  }
  return g ? [g[0], g[1], VIEW.surf(g[0], g[1])] : null;
};
VC.pinDraw = function () {
  var P = VC.PIN; P.objs.forEach(function (o) { scene.remove(o); if (o.geometry) o.geometry.dispose(); }); P.objs = [];
  if (!P.at) return;
  var x = P.at[0], z = P.at[1], g = P.at[2] != null ? P.at[2] : VIEW.surf(x, z), col = 0xffe14a;
  var stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, g, z), new THREE.Vector3(x, g + 26, z)]), new THREE.LineBasicMaterial({ color: col, depthTest: false }));
  var ring = [], n = 24; for (var i = 0; i <= n; i++) ring.push(new THREE.Vector3(x + Math.cos(i / n * Math.PI * 2) * 5, g + 0.8, z + Math.sin(i / n * Math.PI * 2) * 5));
  var rim = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineBasicMaterial({ color: col, depthTest: false }));
  var s = VIEW.sprite('pin', { size: 0.02 }); s.position.set(x, g + 31, z);
  [stem, rim, s].forEach(function (o) { o.renderOrder = 45; scene.add(o); P.objs.push(o); });
};
VC.pinGo = function () {
  var P = VC.PIN; if (!P.at) return;
  if (ctl.walk) window._setWalk(false);
  ctl.target.set(P.at[0], P.at[2] != null ? P.at[2] : VIEW.surf(P.at[0], P.at[1]), P.at[1]); ctl.dist = Math.max(30, Math.min(ctl.dist, 150)); updateCamera();
};
VC.pinWalk = function () {
  var P = VC.PIN, x = P.at[0], z = P.at[1];
  VC.walkAt = [x, z, P.at[2] != null ? P.at[2] : VIEW.surf(x, z)];
  ctl.target.set(x, VC.walkAt[2] + ctl.eyeHeight, z); ctl.walk = true; ctl.el = -0.05; updateCamera();
  if (window._onWalkChange) window._onWalkChange(true);
};
VC.pin = function () {
  renderer.domElement.addEventListener('dblclick', function (e) {
    if ((VC.MK && VC.MK.on) || VC.ED.on) return;               /* the marks tool and the editor own the double-click */
    var r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
    var h = VC.standPick(r.ray); if (!h) return;
    VC.PIN.at = [+h[0].toFixed(1), +h[1].toFixed(1), +h[2].toFixed(2)]; VC.pinDraw();
  });
  /* capture: ahead of the engine's own F (krator-asset-engine.js toggles walk where the camera stands) */
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || e.ctrlKey || e.metaKey) return;
    var k = e.key.toLowerCase();
    if (k === 'g' && VC.PIN.at) { VC.pinGo(); e.preventDefault(); }
    if (k === 'f' && VC.PIN.at && !ctl.walk) { VC.pinWalk(); e.preventDefault(); e.stopImmediatePropagation(); }
    if (k === 'escape' && VC.PIN.at && !VC.ED.on && !(VC.MK && VC.MK.on)) { VC.PIN.at = null; VC.pinDraw(); }
  }, true);
  /* walking (the engine moves the eye at a fixed height over flat ground): the feet stand on the highest KWALK floor a
     step can reach (a canton's levels, its bridges and stairs, the causeways), else on the ground; a walker never steps
     off a ledge higher than TUNE.walk.drop, and slides along what blocks it (a tier's wall) */
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (!ctl.walk) { VC.walkAt = null; return; }
    var x = ctl.target.x, z = ctl.target.z, A = VC.walkAt || [x, z, ctl.target.y - ctl.eyeHeight], W = typeof KWALK !== 'undefined' ? KWALK : null;
    var stand = function (px, pz) { var g = VIEW.surf(px, pz), f = W && W.floorBelow(px, pz, A[2], TUNE.walk.step); return f && f[0] >= g - 0.3 ? f[0] : g; };
    var y = stand(x, z);
    if (W && A[2] - y > TUNE.walk.drop && W.floorBelow(A[0], A[1], A[2], TUNE.walk.step)) {
      /* the edge of a deck, a terrace or a bridge: stay on it (try sliding along it first) */
      var yx = stand(x, A[1]), yz = stand(A[0], z);
      if (A[2] - yx <= TUNE.walk.drop) { z = A[1]; y = yx; } else if (A[2] - yz <= TUNE.walk.drop) { x = A[0]; y = yz; } else { x = A[0]; z = A[1]; y = A[2]; }
    }
    if (W && W.blocked(x, y, z, TUNE.walk.r, TUNE.walk.h)) { var q = W.push(x, y, z, TUNE.walk.r, TUNE.walk.h); x = q[0]; z = q[1]; y = stand(x, z); }
    VC.walkAt = [x, z, y];
    if (Math.abs(ctl.target.y - y - ctl.eyeHeight) > 0.01 || x !== ctl.target.x || z !== ctl.target.z) { ctl.target.set(x, y + ctl.eyeHeight, z); updateCamera(); }
  });
};

/* ---------------------------------------------------------------- the editor */
VC.ED = { on: false, mode: 'place', data: { buildings: [], streets: [], del: [] }, live: [], last: null, cur: null, curObj: null, objs: [], undo: [], saved: 'none', ry: 0 };
VC.edKits = function () {
  return ASSETS.filter(function (A) { return A.culture === 'voth' && A.build && A.w && A.d; })
    .sort(function (a, b) { return (a.family || '').localeCompare(b.family || '') || (a.name || a.key).localeCompare(b.name || b.key); });
};
/* where a building faces the nearest street, and stands back off it if it was dropped on the carriageway */
VC.edAlign = function (b) {
  var q = VC.nearestWayPt([b.x, b.z]); if (!q) return b;
  /* dropped on a street's centre line: face it from its left side */
  var D = SL.dims(b.key, b.v) || { d: 10 }, f = q.d < 0.5 ? V.mul(V.perp(q.way.F.tan(q.s, 4)), -1) : V.norm(V.sub(q.p, [b.x, b.z])), need = q.way.w / 2 + TUNE.lot.setback + D.d / 2;
  b.ry = +Math.atan2(f[0], f[1]).toFixed(4);
  if (q.d < need) { b.x = +(q.p[0] - f[0] * need).toFixed(1); b.z = +(q.p[1] - f[1] * need).toFixed(1); }
  /* stepping back can bring another street (a corner's) too close: step off that one too, keeping the facing */
  for (var it = 0; it < 4; it++) {
    var r = VC.nearestWayPt([b.x, b.z]), nd = r && r.way.w / 2 + TUNE.lot.setback + D.d / 2;
    if (!r || r.d >= nd - 0.05 || r.d < 0.01) break;
    var a = V.norm(V.sub([b.x, b.z], r.p));
    b.x = +(r.p[0] + a[0] * nd).toFixed(1); b.z = +(r.p[1] + a[1] * nd).toFixed(1);
  }
  return b;
};
VC.edBuild = function (b) {
  var D = SL.dims(b.key, b.v) || { w: 10, d: 10 }, f = [Math.sin(b.ry), Math.cos(b.ry)], bo = obb([b.x, b.z], V.perp(f), D.w / 2, D.d / 2);
  var g = buildAsset(b.key, b.x, b.z, b.ry, { variant: b.v, seed: 7 + b.v * 13, wealth: 0.6, y: baseY(bo) });
  if (g) g.userData.edit = b;
  return g;
};
VC.edDrop = function (g) { if (!g) return; scene.remove(g); var i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1); };
VC.edRebuild = function (b) {
  var E = VC.ED, i = E.live.findIndex(function (g) { return g.userData.edit === b; });
  if (i < 0) return; VC.edDrop(E.live[i]); E.live[i] = VC.edBuild(b);
};
VC.edDraw = function () {
  var E = VC.ED; E.objs.forEach(function (o) { scene.remove(o); if (o.geometry) o.geometry.dispose(); }); E.objs = [];
  E.data.streets.forEach(function (s) { E.objs.push(VC.drapeLine(s.pts, VC.PATHCOL[s.cls] || 0xffffff, 2.2)); });
  if (E.cur && E.cur.pts.length) {
    var o = VC.drapeLine(E.cur.pts.length > 1 ? E.cur.pts : [E.cur.pts[0], [E.cur.pts[0][0] + 0.5, E.cur.pts[0][1]]], 0xffffff, 2.6); E.objs.push(o);
    var pts = new THREE.Points(new THREE.BufferGeometry().setFromPoints(E.cur.pts.map(function (p) { return new THREE.Vector3(p[0], VIEW.surf(p[0], p[1]) + 2.6, p[1]); })),
      new THREE.PointsMaterial({ color: 0xffffff, size: 7, sizeAttenuation: false, depthTest: false }));
    pts.renderOrder = 41; scene.add(pts); E.objs.push(pts);
  }
  E.data.del.forEach(function (q) {
    var g = VIEW.surf(q.x, q.z), X = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(q.x - 4, g + 1, q.z - 4), new THREE.Vector3(q.x + 4, g + 1, q.z + 4), new THREE.Vector3(q.x - 4, g + 1, q.z + 4), new THREE.Vector3(q.x + 4, g + 1, q.z - 4)]),
      new THREE.LineBasicMaterial({ color: 0xff4a3a, depthTest: false }));
    X.renderOrder = 41; scene.add(X); E.objs.push(X);
  });
  VC.edPanel();
};
VC.edPanel = function () {
  var E = VC.ED, D = E.data;
  $('ed-count').textContent = D.buildings.length + ' placed buildings, ' + D.streets.length + ' painted streets, ' + D.del.length + ' deletions, ' +
    VC.FL.add.length + ' plants added, ' + VC.FL.del.length + ' removed' + (E.cur ? ' · painting a ' + E.cur.cls + ' street (' + E.cur.pts.length + ' points)' : '');
  $('ed-out').value = JSON.stringify(D);
  $('ed-status').textContent = E.saved === 'file' ? 'saved to site/voth-city-edits.json' : E.saved === 'browser' ? 'kept in this browser (serve.py not running)' : E.saved === 'dirty' ? 'not saved' : '';
};
VC.edStore = function () {
  var E = VC.ED, body = JSON.stringify({ site: 'voth', kind: 'city-edits', saved: new Date().toISOString(), buildings: E.data.buildings, streets: E.data.streets, del: E.data.del,
    flora: { del: VC.FL.del.map(function (d) { return { kind: d.kind, key: d.key, x: d.x, z: d.z }; }), add: VC.FL.add } });
  try { localStorage.setItem('voth-city-edits', body); } catch (e) { }
  if (location.protocol.indexOf('http') !== 0) { E.saved = 'browser'; VC.edPanel(); return; }
  fetch('/save/voth-city-edits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
    .then(function (r) { E.saved = r.ok ? 'file' : 'browser'; VC.edPanel(); }).catch(function () { E.saved = 'browser'; VC.edPanel(); });
};
VC.edDirty = function () { VC.ED.saved = 'dirty'; VC.edDraw(); };
VC.edMode = function (m) {
  var E = VC.ED; if (E.cur) VC.edFinish();
  E.mode = m;
  if (m !== 'flora' && VC.FL.sel) { VC.FL.sel = null; VC.flMark(); }
  ['place', 'street', 'del', 'flora'].forEach(function (k) { $('ed-m-' + k).classList.toggle('on', k === m); $('ed-' + k).style.display = k === m ? 'block' : 'none'; });
};
/* the placer's menu: a grid of every Voth kit building with its picture, searchable by name or family. Each picture is
   the piece built once off screen and drawn into a small render target on the page's own renderer, read back into a
   canvas and kept (VC.THUMBS); they are drawn a few a frame once the editor first opens, so the page never stalls */
VC.THUMBS = { done: {}, queue: [], scene: null, on: false };
VC.edGrid = function (kits, pick) {
  var G = $('ed-grid'), find = $('ed-find');
  G.innerHTML = kits.map(function (A) {
    return '<div class="t" data-k="' + A.key + '" title="' + (A.name || A.key) + ' (' + A.key + ')"><span class="ph"></span>' + (A.name || A.key) +
      (A.family ? '<div class="f">' + A.family + '</div>' : '') + '</div>';
  }).join('');
  var mark = function (key) { [].forEach.call(G.children, function (t) { t.classList.toggle('on', t.dataset.k === key); }); };
  G.onclick = function (e) { var t = e.target.closest('.t'); if (!t) return; pick(t.dataset.k); mark(t.dataset.k); };
  find.oninput = function () {
    var q = find.value.trim().toLowerCase(), shown = [];
    [].forEach.call(G.children, function (t) { var on = !q || t.textContent.toLowerCase().indexOf(q) >= 0 || t.dataset.k.indexOf(q) >= 0; t.style.display = on ? '' : 'none'; if (on) shown.push(t.dataset.k); });
    /* the pictures the search shows are drawn first */
    var Q = VC.THUMBS.queue; VC.THUMBS.queue = shown.filter(function (k) { return Q.indexOf(k) >= 0; }).concat(Q.filter(function (k) { return shown.indexOf(k) < 0; }));
  };
  mark($('ed-kit').value);
  VC.THUMBS.queue = kits.map(function (A) { return A.key; });
};
VC.thumbsStart = function () {
  var S = VC.THUMBS; $('edit').classList.add('placing');
  if (S.on) return; S.on = true;
  var size = 176, rt = new THREE.WebGLRenderTarget(size, size), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, 0.1, 2000);
  sc.background = new THREE.Color(0x9fb0bc);
  sc.add(new THREE.HemisphereLight(0xf4efe2, 0x8a7d63, 0.85)); var dl = new THREE.DirectionalLight(0xfff2dc, 1.05); dl.position.set(-40, 70, 50); sc.add(dl);
  var px = new Uint8Array(size * size * 4), cv = document.createElement('canvas'); cv.width = cv.height = size; var cx = cv.getContext('2d'), img = cx.createImageData(size, size);
  var one = function (key) {
    var g = buildAsset(key, 0, 0, 0, { variant: 0, seed: 7, wealth: 0.6 });
    if (!g) return null;
    scene.remove(g); var ix = INSTANCES.indexOf(g); if (ix >= 0) INSTANCES.splice(ix, 1);
    var lod = g.userData.lod; if (lod && lod.levels) lod.levels.forEach(function (L, i) { L.object.visible = i === 0; });
    sc.add(g); g.updateMatrixWorld(true);
    var bb = new THREE.Box3().setFromObject(g), c = bb.getCenter(new THREE.Vector3()), r = Math.max(1, bb.getSize(new THREE.Vector3()).length() / 2);
    var d = r / Math.sin(cam.fov * Math.PI / 360) * 1.02, az = 0.75, el = 0.42;
    cam.position.set(c.x + d * Math.cos(el) * Math.sin(az), c.y + d * Math.sin(el), c.z + d * Math.cos(el) * Math.cos(az)); cam.lookAt(c); cam.near = d / 50; cam.far = d * 4; cam.updateProjectionMatrix();
    var prev = renderer.getRenderTarget(), sh = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false;
    renderer.setRenderTarget(rt); renderer.render(sc, cam); renderer.readRenderTargetPixels(rt, 0, 0, size, size, px); renderer.setRenderTarget(prev); renderer.shadowMap.enabled = sh;
    sc.remove(g); g.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
    /* the target is bottom-up and linear: flip it, and take it to sRGB for the page */
    for (var y = 0; y < size; y++) for (var x = 0; x < size * 4; x++) { var v = px[(size - 1 - y) * size * 4 + x]; img.data[y * size * 4 + x] = (x & 3) === 3 ? 255 : Math.round(255 * Math.pow(v / 255, 1 / 2.2)); }
    cx.putImageData(img, 0, 0);
    return cv.toDataURL('image/png');
  };
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (!VC.ED.on) return;
    for (var n = 0; n < 2 && S.queue.length; n++) {
      var key = S.queue.shift(); if (S.done[key]) continue;
      var url = null; try { url = one(key); } catch (e) { console.warn('thumb ' + key + ': ' + e.message); }
      S.done[key] = url || 'none';
      var t = $('ed-grid').querySelector('[data-k="' + key + '"] .ph');
      if (t && url) { var im = new Image(); im.src = url; im.alt = key; t.replaceWith(im); }
    }
  });
};
VC.edTool = function (on) {
  var E = VC.ED; E.on = on == null ? !E.on : on;
  $('ly-edit').classList.toggle('on', E.on); $('edit').style.display = E.on ? 'block' : 'none';
  if (E.on) VC.thumbsStart();
  if (E.on && VC.MK && VC.MK.on) VC.marksTool(false);
  if (!E.on && E.cur) VC.edFinish();
};

/* the actions, each with its undo */
VC.edPlace = function (x, z) {
  var E = VC.ED, key = $('ed-kit').value, b = { key: key, v: +$('ed-var').value || 0, x: +x.toFixed(1), z: +z.toFixed(1), ry: E.ry };
  if ($('ed-align').checked) VC.edAlign(b);
  E.data.buildings.push(b); var g = VC.edBuild(b); E.live.push(g); E.last = b; E.ry = b.ry;
  E.undo.push(function () { E.data.buildings.splice(E.data.buildings.indexOf(b), 1); var i = E.live.indexOf(g); if (i >= 0) E.live.splice(i, 1); VC.edDrop(g); if (E.last === b) E.last = null; });
  VC.edDirty();
};
VC.edTurn = function (d) {
  var E = VC.ED, b = E.last; if (!b) return;
  var was = b.ry; b.ry = +(b.ry + d).toFixed(4); E.ry = b.ry; VC.edRebuild(b);
  E.undo.push(function () { b.ry = was; VC.edRebuild(b); }); VC.edDirty();
};
VC.edRealign = function () {
  var E = VC.ED, b = E.last; if (!b) return;
  var was = { x: b.x, z: b.z, ry: b.ry }; VC.edAlign(b); E.ry = b.ry; VC.edRebuild(b);
  E.undo.push(function () { b.x = was.x; b.z = was.z; b.ry = was.ry; VC.edRebuild(b); }); VC.edDirty();
};
VC.edFinish = function () {
  var E = VC.ED, s = E.cur; if (!s) return;
  E.cur = null;
  if (s.pts.length > 1) { E.data.streets.push(s); E.undo.push(function () { E.data.streets.splice(E.data.streets.indexOf(s), 1); }); VC.edDirty(); }
  else VC.edDraw();
};
VC.edDelete = function (ray, at) {
  var E = VC.ED, D = E.data;
  /* 1. a building placed this session (a live group, not yet in the plan) */
  var hit = null;
  if (at) E.live.forEach(function (g) {
    var b = g.userData.edit, S = SL.dims(b.key, b.v) || { w: 10, d: 10 }, f = [Math.sin(b.ry), Math.cos(b.ry)], dx = at[0] - b.x, dz = at[1] - b.z;
    if (Math.abs(dx * f[1] - dz * f[0]) <= S.w / 2 + 1 && Math.abs(dx * f[0] + dz * f[1]) <= S.d / 2 + 1) hit = g;
  });
  if (hit) {
    var b = hit.userData.edit; D.buildings.splice(D.buildings.indexOf(b), 1); E.live.splice(E.live.indexOf(hit), 1); VC.edDrop(hit);
    E.undo.push(function () { D.buildings.push(b); E.live.push(VC.edBuild(b)); }); return VC.edDirty();
  }
  /* 2. a building of the plan: a placed one leaves the file, a generated one is marked deleted */
  var L = VC.pickLot(ray);
  if (L) {
    var was = L.died, pb = L.placed && D.buildings.find(function (q) { return q.key === L.key && Math.abs(q.x - L.x) < 0.2 && Math.abs(q.z - L.z) < 0.2; });
    var dq = pb ? null : { x: +L.x.toFixed(1), z: +L.z.toFixed(1) };
    if (pb) D.buildings.splice(D.buildings.indexOf(pb), 1); else D.del.push(dq);
    L.died = L.born; HOST.updateBuildings(true);
    E.undo.push(function () { L.died = was; HOST.updateBuildings(true); if (pb) D.buildings.push(pb); else D.del.splice(D.del.indexOf(dq), 1); });
    return VC.edDirty();
  }
  /* 3. a painted street (the plan's copy of a saved one goes on the next load) */
  if (!at) return;
  var best = null, bd = Infinity;
  D.streets.forEach(function (s) { for (var i = 1; i < s.pts.length; i++) { var d = segDist(at, s.pts[i - 1], s.pts[i]); if (d < bd) { bd = d; best = s; } } });
  if (best && bd < (TUNE.width[best.cls] || 6) / 2 + 3) {
    D.streets.splice(D.streets.indexOf(best), 1);
    E.undo.push(function () { D.streets.push(best); }); VC.edDirty();
  }
};

VC.editor = function () {
  var E = VC.ED, src = VC.edits(), down = null;
  if (src) E.data = JSON.parse(JSON.stringify({ buildings: src.buildings || [], streets: src.streets || [], del: src.del || [] }));
  E.saved = src && (src.buildings || []).length + (src.streets || []).length + (src.del || []).length ? 'file' : 'none';
  var kits = VC.edKits(), sel = $('ed-kit');
  sel.innerHTML = kits.map(function (A) { return '<option value="' + A.key + '">' + (A.family ? A.family + ': ' : '') + (A.name || A.key) + '</option>'; }).join('');
  if (ASSET_BY_KEY.voth_house_middle) sel.value = 'voth_house_middle';
  var vars = function () { var A = ASSET_BY_KEY[sel.value] || {}, n = A.variants || 1; $('ed-var').innerHTML = Array.from({ length: n }, function (_, i) { return '<option value="' + i + '">' + ((A.variantNames && A.variantNames[i]) || 'variant ' + i) + '</option>'; }).join(''); };
  sel.onchange = vars; vars();
  VC.edGrid(kits, function (key) { sel.value = key; vars(); });
  $('ly-edit').onclick = function () { VC.edTool(); };
  $('ed-m-place').onclick = function () { VC.edMode('place'); };
  $('ed-m-street').onclick = function () { VC.edMode('street'); };
  $('ed-m-del').onclick = function () { VC.edMode('del'); };
  $('ed-m-flora').onclick = function () { VC.edMode('flora'); };
  VC.flUI();                                   /* 59-vc-flora-edit.js */
  $('ed-undo').onclick = function () { var u = E.undo.pop(); if (u) { u(); VC.edDirty(); } };
  $('ed-save').onclick = function () { if (E.cur) VC.edFinish(); VC.edStore(); };
  $('ed-copy').onclick = function () { var t = $('ed-out'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { } };
  /* capture: Q and E are the engine's up and down, R and the rest are free; they only turn while placing */
  window.addEventListener('keydown', function (e) {
    if (VC.typing(e) || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'z' && e.ctrlKey && E.on) { $('ed-undo').onclick(); e.preventDefault(); return; }
    if (e.ctrlKey) return;
    if (k === 'b') { VC.edTool(); return; }
    if (!E.on) return;
    if (E.mode === 'place' && E.last && (k === 'q' || k === 'e')) { VC.edTurn((k === 'q' ? 1 : -1) * Math.PI / 12); e.preventDefault(); e.stopImmediatePropagation(); }
    if (E.mode === 'place' && E.last && k === 'r') VC.edRealign();
    if (E.mode === 'street' && E.cur) {
      if (k === 'backspace') { E.cur.pts.pop(); VC.edDraw(); e.preventDefault(); }
      if (k === 'enter') VC.edFinish();
      if (k === 'escape') { E.cur = null; VC.edDraw(); }
    }
  }, true);
  renderer.domElement.addEventListener('mousedown', function (e) { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('mouseup', function (e) {
    if (!E.on || e.button !== 0 || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    var g = VC.ground(e);
    if (E.mode === 'del') return VC.edDelete(g.ray, g.at);
    if (E.mode === 'flora') return VC.flClick(g.ray);
    if (!g.at) return;
    if (E.mode === 'place') return VC.edPlace(g.at[0], g.at[1]);
    if (!E.cur) E.cur = { cls: $('ed-cls').value, pts: [] };
    E.cur.pts.push([+g.at[0].toFixed(1), +g.at[1].toFixed(1)]); VC.edDraw();
  });
  renderer.domElement.addEventListener('dblclick', function () { if (E.on && E.mode === 'street' && E.cur) { if (E.cur.pts.length > 2) E.cur.pts.pop(); VC.edFinish(); } });   /* the double-click's second click added a point twice */
  /* a lot the file deletes is already out of the plan; one it places is already in it (VC.applyEdits) */
  VC.edDraw();
};

VC.tools = function () { VC.editor(); VC.pin(); VC.pathviz(); };
