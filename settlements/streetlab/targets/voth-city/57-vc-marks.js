/* ============================== 6b. HOST: MARKS (the polygon tool, p) ============================== */
/* [web] The owner marks things on the city plan (owner, 2026-10-09: "add polygon tool to city plan so i can mark
   things there"): areas, lines and points, each with a name and a note, drawn on the ground with a label. Clicks on
   the ground add points; Backspace takes the last one off; Enter or a double-click finishes; Esc stops.
   The marks save to site/voth-city-marks.json through serve.py (POST /save/voth-city-marks), so Claude can read
   them; opened any other way they keep in this browser. "copy JSON" puts them on the clipboard. */
VC.MK = { list: [], cur: null, sel: null, on: false, objs: [], saved: 'none', COLS: ['#ff3df0', '#ffb21e', '#36d1ff', '#7dff5a', '#ff5a3d', '#b38bff'] };
VC.marksStore = function () {
  var M = VC.MK, body = JSON.stringify({ site: 'voth', kind: 'city-marks', saved: new Date().toISOString(),
    marks: M.list.map(function (m) { var q = VC.marksMeasure(m), o = {}; for (var k in m) o[k] = m[k]; o.length_m = Math.round(q.len); o.area_m2 = Math.round(q.area); return o; }) });
  try { localStorage.setItem('voth-city-marks', body); } catch (e) { }
  if (location.protocol.indexOf('http') !== 0) { M.saved = 'browser'; VC.marksStatus(); return; }
  fetch('/save/voth-city-marks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
    .then(function (r) { M.saved = r.ok ? 'file' : 'browser'; VC.marksStatus(); })
    .catch(function () { M.saved = 'browser'; VC.marksStatus(); });
};
VC.marksStatus = function () {
  var M = VC.MK, s = $('mk-status'); if (!s) return;
  s.textContent = M.saved === 'file' ? 'saved to site/voth-city-marks.json' : M.saved === 'browser' ? 'kept in this browser (serve.py not running)' : '';
};
VC.marksLoad = function (done) {
  var fromBrowser = function () { try { var t = localStorage.getItem('voth-city-marks'); if (t) VC.MK.list = JSON.parse(t).marks || []; } catch (e) { } done(); };
  if (location.protocol.indexOf('http') !== 0) return fromBrowser();
  fetch('../site/voth-city-marks.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) { VC.MK.list = j.marks || []; VC.MK.saved = 'file'; done(); }).catch(fromBrowser);
};

/* ---------------------------------------------------------------- measures: a line's length, an area's size and perimeter */
VC.marksMeasure = function (m) {
  var P = m.pts, L = 0;
  for (var i = 1; i < P.length; i++) L += V.dist(P[i - 1], P[i]);
  var out = { len: 0, area: 0 };
  if (m.kind === 'area' && P.length > 2) { out.len = L + V.dist(P[P.length - 1], P[0]); out.area = Math.abs(polyArea(P)); }
  else if (m.kind === 'line') out.len = L;
  return out;
};
VC.fmtLen = function (m) { return m < 1000 ? Math.round(m) + ' m' : (m / 1000).toFixed(2) + ' km'; };
VC.fmtArea = function (a) { return a < 1e4 ? Math.round(a) + ' m&sup2;' : a < 1e6 ? (a / 1e4).toFixed(1) + ' ha' : (a / 1e6).toFixed(2) + ' km&sup2;'; };
VC.marksSpec = function (m) {
  var q = VC.marksMeasure(m);
  return m.kind === 'area' ? (m.pts.length > 2 ? VC.fmtArea(q.area) + ' &middot; perimeter ' + VC.fmtLen(q.len) : '') : m.kind === 'line' ? (m.pts.length > 1 ? VC.fmtLen(q.len) : '') : (m.pts[0] ? m.pts[0][0].toFixed(0) + ', ' + m.pts[0][1].toFixed(0) : '');
};

/* ---------------------------------------------------------------- drawing */
VC.marksDraw = function () {
  var M = VC.MK;
  M.objs.forEach(function (o) { scene.remove(o); if (o.geometry) o.geometry.dispose(); });
  M.objs = [];
  var y = function (x, z) { return VIEW.surf(x, z) + 1.5; };
  M.list.forEach(function (m) {
    var col = new THREE.Color(m.color), live = m === M.cur, sel = m === M.sel || live, P = m.pts;
    if (!P.length) return;
    var V3 = [], path = m.kind === 'area' && P.length > 2 ? P.concat([P[0]]) : P;
    for (var i = 0; i < path.length; i++) {
      if (i) { var a = path[i - 1], b = path[i], n = Math.max(1, Math.ceil(V.dist(a, b) / 8)); for (var j = 1; j < n; j++) { var q = V.lerp(a, b, j / n); V3.push(new THREE.Vector3(q[0], y(q[0], q[1]), q[1])); } }
      V3.push(new THREE.Vector3(path[i][0], y(path[i][0], path[i][1]), path[i][1]));
    }
    if (V3.length > 1) {
      var L = new THREE.Line(new THREE.BufferGeometry().setFromPoints(V3), new THREE.LineBasicMaterial({ color: col, depthTest: false, transparent: true, opacity: sel ? 1 : 0.85, linewidth: 2 }));
      L.renderOrder = 40; scene.add(L); M.objs.push(L);
    }
    /* the points themselves, and a pin for a point mark */
    var pts = new THREE.Points(new THREE.BufferGeometry().setFromPoints(P.map(function (p) { return new THREE.Vector3(p[0], y(p[0], p[1]), p[1]); })),
      new THREE.PointsMaterial({ color: col, size: sel ? 9 : 6, sizeAttenuation: false, depthTest: false }));
    pts.renderOrder = 41; scene.add(pts); M.objs.push(pts);
    var c = m.kind === 'area' && P.length > 2 ? polyCentroid(P) : P[Math.floor((P.length - 1) / 2)];
    if (m.kind === 'point') {
      var pin = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(c[0], y(c[0], c[1]), c[1]), new THREE.Vector3(c[0], y(c[0], c[1]) + 30, c[1])]), new THREE.LineBasicMaterial({ color: col, depthTest: false }));
      pin.renderOrder = 40; scene.add(pin); M.objs.push(pin);
    }
    var s = VIEW.sprite(m.name, { size: 0.024 }); s.position.set(c[0], y(c[0], c[1]) + (m.kind === 'point' ? 38 : 22), c[1]); s.renderOrder = 42; scene.add(s); M.objs.push(s);
  });
};

/* ---------------------------------------------------------------- the panel */
VC.marksList = function () {
  var M = VC.MK, el = $('mk-list'), esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  el.innerHTML = M.list.map(function (m, i) {
    return '<div class="mk' + (m === M.sel || m === M.cur ? ' sel' : '') + '" data-i="' + i + '"><i style="background:' + m.color + '"></i>' +
      '<input class="mk-name" value="' + esc(m.name) + '"> <span class="k">' + m.kind + ', ' + m.pts.length + ' pt' + (m.pts.length === 1 ? '' : 's') + '</span>' +
      '<div class="mk-q">' + VC.marksSpec(m) + '</div>' +
      '<button class="mk-go" title="fly to it">go</button><button class="mk-edit" title="add points to it">' + (m === M.cur ? 'done' : 'edit') + '</button><button class="mk-del" title="delete it">&times;</button>' +
      '<textarea class="mk-note" rows="2" placeholder="a note: what should change here">' + esc(m.note || '') + '</textarea></div>';
  }).join('') || '<div class="k">No marks yet.</div>';
  $('mk-out').value = JSON.stringify(M.list.map(function (m) { var q = VC.marksMeasure(m); return { id: m.id, name: m.name, kind: m.kind, note: m.note, step: m.step, length_m: Math.round(q.len), area_m2: Math.round(q.area), pts: m.pts }; }));
  Array.prototype.forEach.call(el.querySelectorAll('.mk'), function (row) {
    var m = M.list[+row.dataset.i];
    row.querySelector('.mk-name').onchange = function () { m.name = this.value.trim() || m.name; VC.marksDraw(); VC.marksStore(); VC.marksList(); };
    row.querySelector('.mk-note').onchange = function () { m.note = this.value; VC.marksStore(); VC.marksList(); };
    row.querySelector('.mk-go').onclick = function () { var c = m.kind === 'area' && m.pts.length > 2 ? polyCentroid(m.pts) : m.pts[0]; if (!c) return; if (ctl.walk) window._setWalk(false); ctl.target.set(c[0], 0, c[1]); ctl.dist = Math.min(ctl.dist, 900); updateCamera(); M.sel = m; VC.marksDraw(); VC.marksList(); };
    row.querySelector('.mk-edit').onclick = function () { if (M.cur === m) VC.marksFinish(); else { M.cur = m; M.sel = m; VC.marksTool(true); VC.marksDraw(); VC.marksList(); } };
    row.querySelector('.mk-del').onclick = function () { if (!confirm('Delete the mark "' + m.name + '"?')) return; M.list.splice(M.list.indexOf(m), 1); if (M.cur === m) M.cur = null; if (M.sel === m) M.sel = null; VC.marksDraw(); VC.marksStore(); VC.marksList(); };
  });
};
VC.marksNew = function (kind) {
  var M = VC.MK, n = 1; while (M.list.some(function (m) { return m.id === 'm' + n; })) n++;
  var m = { id: 'm' + n, name: (kind === 'area' ? 'Area ' : kind === 'line' ? 'Line ' : 'Point ') + n, kind: kind, note: '', step: HOST.step, color: M.COLS[(n - 1) % M.COLS.length], pts: [] };
  M.list.push(m); M.cur = m; M.sel = m; VC.marksTool(true); VC.marksList();
};
VC.marksFinish = function () {
  var M = VC.MK, m = M.cur; if (!m) return;
  M.cur = null;
  if (!m.pts.length || (m.kind === 'area' && m.pts.length < 3) || (m.kind === 'line' && m.pts.length < 2)) M.list.splice(M.list.indexOf(m), 1);
  VC.marksDraw(); VC.marksStore(); VC.marksList();
};
VC.marksTool = function (on) { var M = VC.MK; M.on = on == null ? !M.on : on; $('ly-marks').classList.toggle('on', M.on); $('marks').style.display = M.on ? 'block' : 'none'; if (!M.on) VC.marksFinish(); else if (VC.ED && VC.ED.on) VC.edTool(false); };

VC.marks = function () {
  var M = VC.MK, down = null;
  $('ly-marks').onclick = function () { VC.marksTool(); };
  $('mk-area').onclick = function () { VC.marksFinish(); VC.marksNew('area'); };
  $('mk-line').onclick = function () { VC.marksFinish(); VC.marksNew('line'); };
  $('mk-point').onclick = function () { VC.marksFinish(); VC.marksNew('point'); };
  $('mk-copy').onclick = function () { var t = $('mk-out'); t.select(); try { navigator.clipboard.writeText(t.value); } catch (e) { } };
  window.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'p') VC.marksTool();
    if (!M.on || !M.cur) return;
    if (e.key === 'Backspace') { M.cur.pts.pop(); VC.marksDraw(); VC.marksList(); e.preventDefault(); }
    if (e.key === 'Enter' || e.key === 'Escape') VC.marksFinish();
  });
  var ground = function (e) { var r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera); return VIEW.pick(r.ray); };
  renderer.domElement.addEventListener('mousedown', function (e) { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('mouseup', function (e) {
    if (!M.on || !M.cur || e.button !== 0 || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    var h = ground(e); if (!h) return;
    M.cur.pts.push([+h[0].toFixed(1), +h[1].toFixed(1)]);
    if (M.cur.kind === 'point') { VC.marksFinish(); return; }
    VC.marksDraw(); VC.marksList();
  });
  renderer.domElement.addEventListener('dblclick', function () { if (M.on && M.cur) { if (M.cur.pts.length > 1) M.cur.pts.pop(); VC.marksFinish(); } });   /* a double-click's second click added a point twice */
  VC.marksLoad(function () { VC.marksDraw(); VC.marksList(); VC.marksStatus(); });
};
