/* ============================== 3. THE TOOLS ============================== */
/* [web] Draw districts, avenues and causeways, place lettered markers, shape the ground; save to the repo (serve.py)
   or export. Modes: select (1), park (2), market (3), funerary (4), plaza (5), misc (6), marker (7), avenue (8),
   causeway (9), raise (R), lower (L), smooth (M).
   Drawing: click the ground to add corners. A district closes on its first corner; any shape finishes on a
   double-click or Enter. Backspace drops the last corner; Esc cancels.
   Select: click a district, avenue, causeway or marker; drag its corners (or the marker); click a yellow mid-edge
   dot to add a corner; right-click a corner to remove it; Delete removes the selection.
   Brushes: hold the left button and move; [ and ] change the size. Every change undoes (Ctrl+Z, the undo button). */
var TOOL = { mode: 'select', draft: [], stops: [], sel: null, drag: null, objs: [], labels: {}, brush: { r: 60, s: 2 }, stroke: null };
var $ = function (id) { return document.getElementById(id); };
TOOL.MODES = ['select', 'park', 'market', 'funerary', 'plaza', 'misc', 'marker', 'avenue', 'causeway', 'raise', 'lower', 'smooth', 'ferry', 'strider', 'route'];
TOOL.KEYS = { '1': 'select', '2': 'park', '3': 'market', '4': 'funerary', '5': 'plaza', '6': 'misc', '7': 'marker', '8': 'avenue', '9': 'causeway', r: 'raise', l: 'lower', m: 'smooth', b: 'ferry', n: 'strider', k: 'route' };
TOOL.STC = { ferry: { colour: '#2e86c1', hex: 0x2e86c1 }, strider: { colour: '#9a6a32', hex: 0x9a6a32 } };
TOOL.isLine = function (m) { return m === 'avenue' || m === 'causeway'; };
TOOL.isBrush = function (m) { return m === 'raise' || m === 'lower' || m === 'smooth'; };

/* ---------------------------------------------------------------- the selection, whatever it is */
TOOL.item = function (s) {
  s = s || TOOL.sel; if (!s || !SITE.data) return null;
  return s.kind === 'district' ? SITE.district(s.id) : s.kind === 'marker' ? SITE.marker(s.id) : s.kind === 'station' ? SITE.station(s.id) : s.kind === 'route' ? SITE.route(s.id) : SITE.line(s.kind, s.id);
};
/* the corners an item is drawn and edited by */
TOOL.shape = function (s) { var it = TOOL.item(s); if (!it || s.kind === 'marker' || s.kind === 'station' || s.kind === 'route') return null; return s.kind === 'district' ? { pts: it.poly, closed: true, min: 3 } : { pts: it.pts, closed: false, min: 2 }; };

/* ---------------------------------------------------------------- screen helpers */
TOOL.ray = function (e) { var r = new THREE.Raycaster(); r.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera); return r.ray; };
TOOL.screen = function (x, y, z) { var v = new THREE.Vector3(x, y, z).project(camera); return v.z > 1 ? null : [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; };
TOOL.near = function (e, x, z, px) { var s = TOOL.screen(x, VIEW.surf(x, z), z); return s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < (px || 10); };
/* is the pointer within px of a polyline on screen? */
TOOL.nearLine = function (e, P, px) {
  for (var i = 1; i < P.length; i++) {
    var a = P[i - 1], b = P[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 10));
    for (var j = 0; j <= n; j++) { var x = a[0] + (b[0] - a[0]) * j / n, z = a[1] + (b[1] - a[1]) * j / n; if (TOOL.near(e, x, z, px)) return true; }
  }
  return false;
};

/* ---------------------------------------------------------------- painting districts and avenues on the ground */
TOOL.paint = function () {
  if (!SITE.data) return;
  var cv = VIEW.ovCanvas, S = cv.width, E = VIEW.ext, k = S / (2 * E), ctx = cv.getContext('2d');
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var path = function (P, closed) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); if (closed) ctx.closePath(); };
  ctx.clearRect(0, 0, S, S);
  var list = SITE.data.districts.slice().sort(function (a, b) { return SITE.area(b.poly) - SITE.area(a.poly); });   /* big first, small on top */
  list.forEach(function (d) {
    var sel = TOOL.sel && TOOL.sel.kind === 'district' && TOOL.sel.id === d.id;
    path(d.poly, true);
    ctx.globalAlpha = sel ? 0.62 : 0.46; ctx.fillStyle = SITE.TYPES[d.type].colour; ctx.fill();
    ctx.globalAlpha = 0.95; ctx.lineWidth = sel ? 7 : 4; ctx.strokeStyle = sel ? '#fff4c8' : SITE.TYPES[d.type].colour; ctx.stroke();
    ctx.globalAlpha = 1;
  });
  /* avenues: a paved band of their width with darker kerbs, over the districts */
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  SITE.data.avenues.forEach(function (a) {
    var sel = TOOL.sel && TOOL.sel.kind === 'avenue' && TOOL.sel.id === a.id;
    path(a.pts, false); ctx.lineWidth = (a.width + 2) * k; ctx.strokeStyle = sel ? '#fff4c8' : '#8f8268'; ctx.stroke();
    path(a.pts, false); ctx.lineWidth = a.width * k; ctx.strokeStyle = SITE.CLASSES.avenue.colour; ctx.stroke();
  });
  VIEW.ovTex.needsUpdate = true;
};

/* ---------------------------------------------------------------- 3D marks: markers, handles, the draft, labels, the brush */
TOOL.clear3D = function () { TOOL.objs.forEach(function (o) { scene.remove(o); if (o.geometry) o.geometry.dispose(); }); TOOL.objs = []; };
TOOL.line = function (pts, colour, closed, lift) {
  var V3 = [], P = closed ? pts.concat([pts[0]]) : pts, up = lift || 1.5;
  for (var i = 0; i < P.length; i++) {
    if (i) { var a = P[i - 1], b = P[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 15)); for (var j = 1; j < n; j++) { var x = a[0] + (b[0] - a[0]) * j / n, z = a[1] + (b[1] - a[1]) * j / n; V3.push(new THREE.Vector3(x, VIEW.surf(x, z) + up, z)); } }
    V3.push(new THREE.Vector3(P[i][0], VIEW.surf(P[i][0], P[i][1]) + up, P[i][1]));
  }
  var L = new THREE.Line(new THREE.BufferGeometry().setFromPoints(V3), new THREE.LineBasicMaterial({ color: colour, depthTest: false, transparent: true }));
  L.renderOrder = 30; scene.add(L); TOOL.objs.push(L); return L;
};
TOOL.dot = function (x, z, colour, size, lift) {
  var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TOOL.dotTex, color: colour, depthTest: false, transparent: true, sizeAttenuation: false }));
  s.scale.set(size || 0.016, size || 0.016, 1); s.position.set(x, VIEW.surf(x, z) + (lift || 1.5), z); s.renderOrder = 35;
  scene.add(s); TOOL.objs.push(s); return s;
};
TOOL.draw3D = function () {
  TOOL.clear3D();
  if (!SITE.data) return;
  SITE.data.markers.forEach(function (m) {
    var y = VIEW.surf(m.x, m.z), sel = TOOL.sel && TOOL.sel.kind === 'marker' && TOOL.sel.id === m.id;
    var pin = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(m.x, y, m.z), new THREE.Vector3(m.x, y + 45, m.z)]), new THREE.LineBasicMaterial({ color: sel ? 0xfff4c8 : 0xc0392b }));
    scene.add(pin); TOOL.objs.push(pin);
    var s = VIEW.sprite(m.id, { round: true, size: sel ? 0.05 : 0.04, bg: sel ? '#e67e22' : '#c0392b' });
    s.position.set(m.x, y + 45, m.z); scene.add(s); TOOL.objs.push(s);
  });
  /* routes (stop to stop: the city page routes them over water or land) and stations */
  SITE.data.routes.forEach(function (r) {
    var P = SITE.routePts(r, true), sel = TOOL.sel && TOOL.sel.kind === 'route' && TOOL.sel.id === r.id;
    if (P.length > 1) TOOL.line(P, sel ? 0xfff4c8 : TOOL.STC[r.kind].hex, false, 8);
  });
  if (TOOL.stops.length) { var DP = TOOL.stops.map(SITE.station).filter(Boolean).map(function (q) { return [q.x, q.z]; }); if (DP.length > 1) TOOL.line(DP, 0xffffff, false, 8); }
  SITE.stations().forEach(function (st) {
    var y = VIEW.surf(st.x, st.z), sel = TOOL.sel && TOOL.sel.kind === 'station' && TOOL.sel.id === st.id, inDraft = TOOL.stops.indexOf(st.id) >= 0;
    var pin = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(st.x, y, st.z), new THREE.Vector3(st.x, y + 24, st.z)]), new THREE.LineBasicMaterial({ color: TOOL.STC[st.kind].hex }));
    scene.add(pin); TOOL.objs.push(pin);
    var sp = VIEW.sprite(st.id, { round: true, size: sel || inDraft ? 0.042 : 0.032, bg: sel ? '#e67e22' : inDraft ? '#ffffff' : TOOL.STC[st.kind].colour });
    sp.position.set(st.x, y + 24, st.z); scene.add(sp); TOOL.objs.push(sp);
  });
  /* the selection's corners and mid-edge dots */
  var sh = TOOL.sel && TOOL.shape(TOOL.sel);
  if (sh) {
    var lift = TOOL.sel.kind === 'causeway' ? 20 : 1.5;
    TOOL.line(sh.pts, 0xfff4c8, sh.closed, lift);
    sh.pts.forEach(function (p, i) {
      TOOL.dot(p[0], p[1], 0xffffff, 0.018, lift);
      if (!sh.closed && i === sh.pts.length - 1) return;
      var q = sh.pts[(i + 1) % sh.pts.length];
      TOOL.dot((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 0xffd34d, 0.011, lift);
    });
  }
  /* the shape being drawn */
  if (TOOL.draft.length) {
    var C = SITE.TYPES[TOOL.mode] || SITE.CLASSES[TOOL.mode], col = new THREE.Color(C ? C.colour : '#ffffff').getHex();
    if (TOOL.draft.length > 1) TOOL.line(TOOL.draft, col, false);
    TOOL.draft.forEach(function (p, i) { TOOL.dot(p[0], p[1], i ? col : 0xffffff, i ? 0.014 : 0.02); });
  }
  Object.keys(TOOL.labels).forEach(function (id) { scene.remove(TOOL.labels[id]); });
  TOOL.labels = {};
  if (HOSTUI.labels) SITE.data.districts.forEach(function (d) {
    var c = SITE.centroid(d.poly), s = VIEW.sprite(d.name, { size: 0.028, bg: 'rgba(24,21,15,0.7)' });
    s.position.set(c[0], VIEW.surf(c[0], c[1]) + 25, c[1]); scene.add(s); TOOL.labels[d.id] = s;
  });
};
/* the brush: a ring on the ground under the pointer */
TOOL.ring = function (x, z) {
  if (TOOL.ringObj) { scene.remove(TOOL.ringObj); TOOL.ringObj.geometry.dispose(); TOOL.ringObj = null; }
  if (x == null) return;
  var V3 = [], r = TOOL.brush.r;
  for (var i = 0; i <= 48; i++) { var t = i / 48 * Math.PI * 2, px = x + Math.cos(t) * r, pz = z + Math.sin(t) * r; V3.push(new THREE.Vector3(px, VIEW.surf(px, pz) + 1.5, pz)); }
  TOOL.ringObj = new THREE.Line(new THREE.BufferGeometry().setFromPoints(V3), new THREE.LineBasicMaterial({ color: TOOL.mode === 'lower' ? 0x7fb2ff : TOOL.mode === 'smooth' ? 0xc8ffb0 : 0xffc070, depthTest: false, transparent: true }));
  TOOL.ringObj.renderOrder = 36; scene.add(TOOL.ringObj);
};

/* ---------------------------------------------------------------- the panel */
var HOSTUI = { labels: true };
TOOL.HINTS = {
  select: 'Click a district, avenue, causeway or marker to select it. Drag corners or markers; click a yellow mid-edge dot to add a corner; right-click a corner to remove it; Delete removes the selection.',
  marker: 'Click the ground (or the minimap) to place the next lettered marker.',
  avenue: 'Click the ground (or the minimap) to lay an avenue corner by corner; double-click or Enter to finish; Backspace drops a corner; Esc cancels. Its width is in the editor once it is selected.',
  causeway: 'Click to lay a causeway corner by corner (start on a canton to tie it in); double-click or Enter to finish. In the editor: mole (reclaimed land) or bridge (deck on piers), and its width.',
  raise: 'Hold the left button on the ground to raise it. [ and ] change the brush size; the slider sets how fast. Each stroke undoes on its own.',
  lower: 'Hold the left button on the ground to lower it; below the lake level it fills with water. [ and ] change the brush size.',
  smooth: 'Hold the left button and move to even the ground out under the brush. [ and ] change the brush size.',
  ferry: 'Click the water (or a quay) to place a ferry stop. Every canton dock already has one.',
  strider: 'Click the ground to place an elephant bug station.',
  route: 'Click stations in order to make a line (ferry stops or elephant bug stations, not both); Enter or double-click finishes; Backspace drops the last stop; Esc cancels.'
};
TOOL.setMode = function (m) {
  if (TOOL.draft.length && m !== TOOL.mode) TOOL.draft = [];
  if (m !== 'route') TOOL.stops = [];
  TOOL.mode = m;
  TOOL.MODES.forEach(function (k) { var b = $('m-' + k); if (b) b.classList.toggle('on', k === m); });
  $('hint').textContent = TOOL.HINTS[m] || ('Click the ground (or the minimap) to add corners of a ' + SITE.TYPES[m].label.toLowerCase() + ' district. Click the first corner, double-click or press Enter to close; Backspace drops a corner; Esc cancels.');
  $('brush').style.display = TOOL.isBrush(m) ? 'block' : 'none';
  if (!TOOL.isBrush(m)) TOOL.ring(null);
  TOOL.draw3D();
};
TOOL.select = function (sel, fly) {
  TOOL.sel = sel; TOOL.paint(); TOOL.draw3D(); TOOL.list(); TOOL.editor();
  if (fly && sel) {
    var it = TOOL.item(sel), p;
    if (sel.kind === 'marker' || sel.kind === 'station') p = [it.x, it.z, 300];
    else if (sel.kind === 'route') { var RP = SITE.routePts(it), cx = 0, cz = 0; RP.forEach(function (q) { cx += q[0]; cz += q[1]; }); p = [cx / RP.length, cz / RP.length, 1800]; }
    else if (sel.kind === 'district') { var c = SITE.centroid(it.poly); p = [c[0], c[1], Math.max(300, Math.sqrt(SITE.area(it.poly)) * 2.4)]; }
    else { var m = it.pts[Math.floor(it.pts.length / 2)], n = it.pts[Math.max(0, Math.floor(it.pts.length / 2) - 1)]; p = [(m[0] + n[0]) / 2, (m[1] + n[1]) / 2, Math.max(300, SITE.lineLen(it.pts) * 0.9)]; }
    if (ctl.walk) window._setWalk(false);
    ctl.target.set(p[0], VIEW.surf(p[0], p[1]), p[1]); ctl.dist = p[2]; updateCamera();
  }
};
TOOL.list = function () {
  var h = '', on = function (k, id) { return TOOL.sel && TOOL.sel.kind === k && TOOL.sel.id === id ? ' on' : ''; };
  SITE.data.districts.forEach(function (d) {
    h += '<div class="it' + on('district', d.id) + '" data-k="district" data-id="' + d.id + '"><i style="background:' + SITE.TYPES[d.type].colour + '"></i>' + esc(d.name) +
      ' <span class="k">' + SITE.TYPES[d.type].label.toLowerCase() + ' &middot; ' + (SITE.area(d.poly) / 10000).toFixed(2) + ' ha</span></div>';
  });
  SITE.data.avenues.forEach(function (a) {
    h += '<div class="it' + on('avenue', a.id) + '" data-k="avenue" data-id="' + a.id + '"><i style="background:' + SITE.CLASSES.avenue.colour + ';height:4px;vertical-align:2px"></i>' + esc(a.name) +
      ' <span class="k">avenue &middot; ' + Math.round(SITE.lineLen(a.pts)) + ' m &middot; ' + a.width + ' m wide</span></div>';
  });
  SITE.causeways().forEach(function (c) {
    h += '<div class="it' + on('causeway', c.id) + '" data-k="causeway" data-id="' + c.id + '"><i style="background:' + SITE.CLASSES.causeway.colour + ';height:6px;vertical-align:1px"></i>' + esc(c.name) +
      ' <span class="k">' + c.kind + ' &middot; ' + Math.round(SITE.lineLen(c.pts)) + ' m' + (c.origin === 'voth' ? ' &middot; Voth' : '') + '</span></div>';
  });
  SITE.stations().forEach(function (st) {
    h += '<div class="it' + on('station', st.id) + '" data-k="station" data-id="' + st.id + '"><b class="mk" style="background:' + TOOL.STC[st.kind].colour + '">' + st.id + '</b> ' + esc(st.name) + ' <span class="k">' + st.kind + (st.origin === 'voth' ? ' &middot; Voth' : '') + '</span></div>';
  });
  SITE.data.routes.forEach(function (r) {
    h += '<div class="it' + on('route', r.id) + '" data-k="route" data-id="' + r.id + '"><i style="background:' + TOOL.STC[r.kind].colour + ';height:3px;vertical-align:3px"></i>' + esc(r.name) + ' <span class="k">' + r.stops.join(' &rarr; ') + '</span></div>';
  });
  SITE.data.markers.forEach(function (m) {
    h += '<div class="it' + on('marker', m.id) + '" data-k="marker" data-id="' + m.id + '"><b class="mk">' + m.id + '</b> ' + esc(m.note || '(no note)') + ' <span class="k">' + Math.round(m.x) + ', ' + Math.round(m.z) + '</span></div>';
  });
  $('items').innerHTML = h || '<div class="k">Nothing drawn yet.</div>';
  Array.prototype.forEach.call($('items').querySelectorAll('.it'), function (el) { el.onclick = function () { TOOL.select({ kind: el.dataset.k, id: el.dataset.id }, true); }; });
  $('count').textContent = SITE.data.districts.length + ' districts, ' + SITE.data.avenues.length + ' avenues, ' + SITE.causeways().length + ' causeways, ' + SITE.data.markers.length + ' markers' +
    ', ' + SITE.stations().length + ' stations, ' + SITE.data.routes.length + ' routes' + (SITE.data.terrain.length ? ', ' + SITE.data.terrain.length + ' ground strokes' : '');
};
function compass(v) { return '<option value="">(within the map)</option>' + Object.keys(SITE.COMPASS).map(function (k) { return '<option' + (k === v ? ' selected' : '') + '>' + k + '</option>'; }).join(''); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
/* edit a field of the selected item: causeways are copied into the site on their first edit */
TOOL.set = function (field, v) {
  var s = TOOL.sel; if (!s) return;
  SITE.edit(function (S) { if (s.kind === 'causeway') SITE.ownCauseways(S); if (s.kind === 'station') SITE.ownStations(S); var it = TOOL.item(s); if (it) it[field] = v; });
};
TOOL.editor = function () {
  var ed = $('editor'), s = TOOL.sel, it = TOOL.item(s);
  if (!s || !it) { ed.style.display = 'none'; return; }
  ed.style.display = 'block';
  var del = '<button id="e-del">delete</button>';
  if (s.kind === 'district') {
    var opts = Object.keys(SITE.TYPES).map(function (k) { return '<option value="' + k + '"' + (k === it.type ? ' selected' : '') + '>' + SITE.TYPES[k].label + '</option>'; }).join('');
    ed.innerHTML = '<b>District</b> <span class="k">' + it.id + ' &middot; ' + it.poly.length + ' corners &middot; ' + Math.round(SITE.area(it.poly)) + ' m&sup2;</span>' +
      '<label>name <input id="e-name" value="' + esc(it.name) + '"></label><label>type <select id="e-type">' + opts + '</select></label>' +
      '<label>note <input id="e-note" value="' + esc(it.note || '') + '" placeholder="e.g. the kind of misc district"></label>' +
      '<button id="e-copy">copy as Voth DISTRICTS entry</button> ' + del;
    $('e-type').onchange = function () { TOOL.set('type', this.value); };
    $('e-copy').onclick = function () { TOOL.copy("  { type:'" + it.type + "', name:'" + it.name.replace(/'/g, "\\'") + "', poly:" + JSON.stringify(it.poly) + " },"); };
  } else if (s.kind === 'station') {
    ed.innerHTML = '<b>' + (it.kind === 'ferry' ? 'Ferry stop ' : 'Elephant bug station ') + it.id + '</b> <span class="k">' + it.x.toFixed(1) + ', ' + it.z.toFixed(1) + (it.origin === 'voth' ? ' &middot; ' + (it.canton || '') + ' canton dock' : '') + '</span>' +
      '<label>name <input id="e-name" value="' + esc(it.name) + '"></label>' +
      '<span class="k">Lines: ' + (SITE.data.routes.filter(function (r) { return r.stops.indexOf(it.id) >= 0; }).map(function (r) { return esc(r.name); }).join(', ') || 'none') + '</span><br>' + del;
  } else if (s.kind === 'route') {
    ed.innerHTML = '<b>' + (it.kind === 'ferry' ? 'Ferry line' : 'Elephant bug line') + '</b> <span class="k">' + it.id + ' &middot; ' + it.stops.length + ' stops</span>' +
      '<label>name <input id="e-name" value="' + esc(it.name) + '"></label><span class="k">' + it.stops.join(' &rarr; ') + '</span>' +
      '<label>enters from <select id="e-enter">' + compass(it.enter) + '</select></label><label>leaves by <select id="e-exit">' + compass(it.exit) + '</select></label>' +
      '<span class="k">(off the map, from that side of it)</span><br>' +
      '<button id="e-loop">' + (it.stops[0] === it.stops[it.stops.length - 1] ? 'open the loop' : 'close the loop') + '</button> ' + del;
    $('e-loop').onclick = function () { SITE.edit(function () { if (it.stops[0] === it.stops[it.stops.length - 1]) it.stops.pop(); else it.stops.push(it.stops[0]); }); };
    $('e-enter').onchange = function () { TOOL.set('enter', this.value || undefined); };
    $('e-exit').onchange = function () { TOOL.set('exit', this.value || undefined); };
  } else if (s.kind === 'marker') {
    ed.innerHTML = '<b>Marker ' + it.id + '</b> <span class="k">' + it.x.toFixed(1) + ', ' + it.z.toFixed(1) + ' &middot; ground ' + TERR.h(it.x, it.z).toFixed(1) + ' m</span>' +
      '<label>letter <input id="e-id" value="' + esc(it.id) + '"></label><label>note <input id="e-note" value="' + esc(it.note) + '" placeholder="e.g. governor\'s palace here"></label>' + del;
    $('e-id').onchange = function () {
      var v = this.value.trim().toUpperCase(); if (!v || SITE.marker(v)) { this.value = it.id; return; }
      TOOL.sel = { kind: 'marker', id: v };          /* follow the new letter before the change re-reads the selection */
      SITE.edit(function () { it.id = v; });
    };
  } else {
    var cw = s.kind === 'causeway';
    ed.innerHTML = '<b>' + (cw ? 'Causeway' : 'Avenue') + '</b> <span class="k">' + it.id + ' &middot; ' + it.pts.length + ' corners &middot; ' + Math.round(SITE.lineLen(it.pts)) + ' m' + (cw && it.origin === 'voth' ? ' &middot; Voth\'s own' : '') + '</span>' +
      '<label>name <input id="e-name" value="' + esc(it.name) + '"></label>' +
      (cw ? '<label>kind <select id="e-kind"><option value="mole"' + (it.kind === 'mole' ? ' selected' : '') + '>mole (reclaimed land)</option><option value="bridge"' + (it.kind === 'bridge' ? ' selected' : '') + '>bridge (deck on piers)</option></select></label>' : '') +
      '<label>width <input id="e-width" type="number" min="2" max="120" step="1" value="' + it.width + '"></label>' +
      '<label>note <input id="e-note" value="' + esc(it.note || '') + '"></label>' + del;
    if (cw) $('e-kind').onchange = function () { TOOL.set('kind', this.value); };
    $('e-width').onchange = function () { var v = Math.max(2, Math.min(120, +this.value || it.width)); TOOL.set('width', v); };
  }
  if ($('e-name')) $('e-name').onchange = function () { TOOL.set('name', this.value); };
  if ($('e-note')) $('e-note').onchange = function () { TOOL.set('note', this.value); };
  $('e-del').onclick = TOOL.deleteSel;
};
TOOL.deleteSel = function () {
  var s = TOOL.sel; if (!s) return;
  var keep = function (L) { return L.filter(function (o) { return o.id !== s.id; }); };
  SITE.edit(function (S) {
    if (s.kind === 'district') S.districts = keep(S.districts);
    else if (s.kind === 'marker') S.markers = keep(S.markers);
    else if (s.kind === 'avenue') S.avenues = keep(S.avenues);
    else if (s.kind === 'route') S.routes = keep(S.routes);
    else if (s.kind === 'station') {
      S.stations = keep(SITE.ownStations(S));
      S.routes.forEach(function (r) { r.stops = r.stops.filter(function (id) { return id !== s.id; }); });
      S.routes = S.routes.filter(function (r) { return r.stops.length >= 2; });
    }
    else S.causeways = keep(SITE.ownCauseways(S));
  });
  TOOL.select(null);
};
TOOL.copy = function (text) { try { navigator.clipboard.writeText(text); TOOL.flash('copied'); } catch (e) { window.prompt('Copy:', text); } };
TOOL.flash = function (msg) { var f = $('flash'); f.textContent = msg; f.style.opacity = 1; clearTimeout(TOOL._fl); TOOL._fl = setTimeout(function () { f.style.opacity = 0; }, 1600); };

/* ---------------------------------------------------------------- the minimap */
TOOL.minimap = function () {
  if (!SITE.data) return;
  var cv = $('mm'), ctx = cv.getContext('2d'), S = cv.width, E = VIEW.ext, k = S / (2 * E);
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var path = function (P) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); };
  ctx.drawImage(VIEW.mmBase, 0, 0, S, S);
  VIEW.cantonList.forEach(function (c) { ctx.fillStyle = 'rgba(140,133,121,0.95)'; var r = c.r * 1.07 * k; ctx.fillRect(X(c.x) - r, Z(c.z) - r, 2 * r, 2 * r); });
  SITE.data.districts.forEach(function (d) { path(d.poly); ctx.closePath(); ctx.globalAlpha = 0.75; ctx.fillStyle = SITE.TYPES[d.type].colour; ctx.fill(); ctx.globalAlpha = 1; });
  ctx.lineCap = 'round';
  SITE.causeways().forEach(function (c) { path(c.pts); ctx.lineWidth = Math.max(2, c.width * k); ctx.strokeStyle = '#8c8579'; ctx.stroke(); });
  SITE.data.avenues.forEach(function (a) { path(a.pts); ctx.lineWidth = Math.max(2, a.width * k * 1.5); ctx.strokeStyle = '#efe6cf'; ctx.stroke(); });
  if (TOOL.draft.length) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; path(TOOL.draft); ctx.stroke(); }
  SITE.data.routes.forEach(function (r) { path(SITE.routePts(r, true)); ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeStyle = TOOL.STC[r.kind].colour; ctx.stroke(); ctx.setLineDash([]); });
  SITE.stations().forEach(function (st) { ctx.fillStyle = TOOL.STC[st.kind].colour; ctx.beginPath(); ctx.arc(X(st.x), Z(st.z), 3.5, 0, 7); ctx.fill(); });
  SITE.data.markers.forEach(function (m) { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(X(m.x), Z(m.z), 6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m.id, X(m.x), Z(m.z) + 3); });
  ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 1.5; var r2 = Math.max(4, ctl.dist * 0.5 * k);
  ctx.strokeRect(X(ctl.target.x) - r2, Z(ctl.target.z) - r2, 2 * r2, 2 * r2);
};

/* ---------------------------------------------------------------- input */
TOOL.addAt = function (x, z, e) {
  if (TOOL.mode === 'marker') { var m = SITE.addMarker(x, z); TOOL.select({ kind: 'marker', id: m.id }); return; }
  if (TOOL.mode === 'ferry' || TOOL.mode === 'strider') { var st = SITE.addStation(TOOL.mode, x, z); TOOL.select({ kind: 'station', id: st.id }); return; }
  if (TOOL.mode === 'route') {
    var pick = TOOL.stationAt(e, x, z), first = TOOL.stops.length ? SITE.station(TOOL.stops[0]) : null;
    if (!pick) { TOOL.flash('click a station'); return; }
    if (first && pick.kind !== first.kind) { TOOL.flash('a line is all ferry stops or all elephant bug stations'); return; }
    if (TOOL.stops[TOOL.stops.length - 1] !== pick.id) TOOL.stops.push(pick.id);
    TOOL.draw3D(); return;
  }
  if (SITE.TYPES[TOOL.mode] || TOOL.isLine(TOOL.mode)) {
    if (SITE.TYPES[TOOL.mode] && TOOL.draft.length >= 3 && (e ? TOOL.near(e, TOOL.draft[0][0], TOOL.draft[0][1], 12) : Math.hypot(x - TOOL.draft[0][0], z - TOOL.draft[0][1]) < 25)) { TOOL.finish(); return; }
    TOOL.draft.push([x, z]); TOOL.draw3D(); TOOL.minimap();
    return;
  }
  if (TOOL.mode !== 'select') return;
  /* select: a marker near the pointer, then an avenue or causeway, else the district under it */
  if (e) {
    var mk = SITE.data.markers.filter(function (m) { var s = TOOL.screen(m.x, VIEW.surf(m.x, m.z) + 45, m.z); return s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < 18; })[0];
    if (mk) { TOOL.select({ kind: 'marker', id: mk.id }); return; }
    var stn = TOOL.stationAt(e, x, z);
    if (stn) { TOOL.select({ kind: 'station', id: stn.id }); return; }
    var rt = SITE.data.routes.filter(function (r) { return TOOL.nearLine(e, SITE.routePts(r), 8); })[0];
    var av = SITE.data.avenues.filter(function (a) { return TOOL.nearLine(e, a.pts, 9); })[0];
    if (av) { TOOL.select({ kind: 'avenue', id: av.id }); return; }
    var cw = SITE.causeways().filter(function (c) { return TOOL.nearLine(e, c.pts, 12) || VIEW.causewayHit(e, c); })[0];
    if (cw) { TOOL.select({ kind: 'causeway', id: cw.id }); return; }
    if (rt) { TOOL.select({ kind: 'route', id: rt.id }); return; }
  }
  var d = SITE.districtAt([x, z]);
  TOOL.select(d ? { kind: 'district', id: d.id } : null);
};
/* a causeway rides above the ground: test the pointer against its deck line too */
VIEW.causewayHit = function (e, c) {
  for (var i = 1; i < c.pts.length; i++) {
    var a = c.pts[i - 1], b = c.pts[i];
    for (var j = 0; j <= 20; j++) { var x = a[0] + (b[0] - a[0]) * j / 20, z = a[1] + (b[1] - a[1]) * j / 20, y = c.kind === 'mole' ? VOTH.RLAND + 1 : VOTH.CWAY;
      var s = TOOL.screen(x, Math.max(y, VIEW.surf(x, z)), z); if (s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < 12) return true; }
  }
  return false;
};
/* the station under the pointer (its disc or its foot), or within 40 m of a map click */
TOOL.stationAt = function (e, x, z) {
  return SITE.stations().filter(function (st) {
    if (!e) return Math.hypot(st.x - x, st.z - z) < 40;
    var y = VIEW.surf(st.x, st.z), a = TOOL.screen(st.x, y + 24, st.z), b = TOOL.screen(st.x, y, st.z);
    return (a && Math.hypot(a[0] - e.clientX, a[1] - e.clientY) < 14) || (b && Math.hypot(b[0] - e.clientX, b[1] - e.clientY) < 10);
  })[0] || null;
};
TOOL.finish = function () {
  var m = TOOL.mode;
  if (m === 'route') {
    if (TOOL.stops.length >= 2) { var r = SITE.addRoute(SITE.station(TOOL.stops[0]).kind, TOOL.stops); TOOL.stops = []; TOOL.select({ kind: 'route', id: r.id }); }
    else { TOOL.stops = []; TOOL.draw3D(); }
    return;
  }
  if (SITE.TYPES[m] && TOOL.draft.length >= 3) { var d = SITE.addDistrict(m, TOOL.draft); TOOL.draft = []; TOOL.select({ kind: 'district', id: d.id }); return; }
  if (TOOL.isLine(m) && TOOL.draft.length >= 2) { var l = SITE.addLine(m, TOOL.draft); TOOL.draft = []; TOOL.select({ kind: m, id: l.id }); return; }
  TOOL.draft = []; TOOL.draw3D();
};

/* ---------------------------------------------------------------- the brushes: one stroke = one undo */
TOOL.strokeStart = function (e) {
  var h = VIEW.pick(TOOL.ray(e)); if (!h) return false;
  TOOL.stroke = { m: TOOL.mode, r: TOOL.brush.r, s: TOOL.mode === 'smooth' ? +(TOOL.brush.s / 6).toFixed(2) : TOOL.brush.s, pts: [], last: null, t: 0, e: e, box: null };
  TOOL.strokeStep(true);
  return true;
};
TOOL.strokeStep = function (force) {
  var st = TOOL.stroke; if (!st) return;
  var h = VIEW.pick(TOOL.ray(st.e)); if (!h) return;
  var now = Date.now(), moved = !st.last || Math.hypot(h[0] - st.last[0], h[1] - st.last[1]) > st.r * 0.22;
  if (!force && !moved && (st.m === 'smooth' || now - st.t < 110)) return;
  var p = [+h[0].toFixed(1), +h[1].toFixed(1)];
  var b = TERR.dab(st.m, p[0], p[1], st.r, st.s); if (!b) return;
  st.pts.push(p); st.last = p; st.t = now;
  st.box = st.box ? [Math.min(st.box[0], b[0]), Math.min(st.box[1], b[1]), Math.max(st.box[2], b[2]), Math.max(st.box[3], b[3])] : b;
  VIEW.refreshTerrain(b, now - (st.nt || 0) > 140);
  if (now - (st.nt || 0) > 140) st.nt = now;
  TOOL.ring(p[0], p[1]);
};
TOOL.strokeEnd = function () {
  var st = TOOL.stroke; TOOL.stroke = null; if (!st || !st.pts.length) return;
  VIEW.refreshTerrain(st.box, true);
  TOOL.terrLive = true;
  SITE.edit(function (S) { S.terrain.push({ m: st.m, r: st.r, s: st.s, pts: st.pts }); });
};

TOOL.bind = function () {
  var cv = renderer.domElement, down = null;
  /* the engine's wheel stops at 2 km out: Voth's lake wants more */
  cv.addEventListener('wheel', function (e) { if (ctl.walk) return; ctl.dist = Math.max(3, Math.min(12000, ctl.dist * (1 + e.deltaY * 0.001))); updateCamera(); e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, passive: false });
  cv.addEventListener('mousedown', function (e) {
    down = [e.clientX, e.clientY];
    if (TOOL.isBrush(TOOL.mode) && e.button === 0) { if (TOOL.strokeStart(e)) { e.stopImmediatePropagation(); e.preventDefault(); } return; }
    if (TOOL.mode !== 'select' || !TOOL.sel) return;
    if (TOOL.sel.kind === 'station') {
      var sn = SITE.station(TOOL.sel.id);
      if (sn && e.button === 0 && TOOL.stationAt(e) === sn) {
        SITE.undo.push(JSON.stringify(SITE.data)); SITE.redo = []; SITE.ownStations(SITE.data); TOOL.drag = { marker: SITE.station(TOOL.sel.id) };
        e.stopImmediatePropagation(); e.preventDefault();
      }
      return;
    }
    if (TOOL.sel.kind === 'marker') {
      var m = SITE.marker(TOOL.sel.id), s = m && TOOL.screen(m.x, VIEW.surf(m.x, m.z) + 45, m.z), s0 = m && TOOL.screen(m.x, VIEW.surf(m.x, m.z), m.z);
      if (m && e.button === 0 && ((s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < 18) || (s0 && Math.hypot(s0[0] - e.clientX, s0[1] - e.clientY) < 12))) {
        SITE.undo.push(JSON.stringify(SITE.data)); TOOL.drag = { marker: m }; e.stopImmediatePropagation(); e.preventDefault();
      }
      return;
    }
    var sh = TOOL.shape(TOOL.sel); if (!sh) return;
    var lift = TOOL.sel.kind === 'causeway' ? 20 : 1.5, nearH = function (x, z, px) { var sc = TOOL.screen(x, VIEW.surf(x, z) + lift, z); return sc && Math.hypot(sc[0] - e.clientX, sc[1] - e.clientY) < px; };
    var own = function () { SITE.undo.push(JSON.stringify(SITE.data)); SITE.redo = []; if (TOOL.sel.kind === 'causeway') SITE.ownCauseways(SITE.data); return TOOL.shape(TOOL.sel).pts; };
    for (var i = 0; i < sh.pts.length; i++) {
      var p = sh.pts[i];
      if (nearH(p[0], p[1], 10)) {
        if (e.button === 2) { if (sh.pts.length > sh.min) { var ii = i; SITE.edit(function (S) { if (TOOL.sel.kind === 'causeway') SITE.ownCauseways(S); TOOL.shape(TOOL.sel).pts.splice(ii, 1); }); } e.stopImmediatePropagation(); return; }
        if (e.button === 0) { TOOL.drag = { pts: own(), i: i }; e.stopImmediatePropagation(); e.preventDefault(); return; }
      }
      if (!sh.closed && i === sh.pts.length - 1) continue;
      var q = sh.pts[(i + 1) % sh.pts.length], mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
      if (e.button === 0 && nearH(mx, mz, 9)) {
        var P = own(); P.splice(i + 1, 0, [mx, mz]); TOOL.drag = { pts: P, i: i + 1 };
        e.stopImmediatePropagation(); e.preventDefault(); return;
      }
    }
  }, { capture: true });
  var raf = 0;
  window.addEventListener('mousemove', function (e) {
    if (TOOL.stroke) { TOOL.stroke.e = e; return; }
    if (TOOL.drag) {
      var h = VIEW.pick(TOOL.ray(e)); if (!h) return;
      if (TOOL.drag.marker) { TOOL.drag.marker.x = +h[0].toFixed(1); TOOL.drag.marker.z = +h[1].toFixed(1); }
      else TOOL.drag.pts[TOOL.drag.i] = [+h[0].toFixed(1), +h[1].toFixed(1)];
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; TOOL.paint(); TOOL.draw3D(); TOOL.minimap(); if (TOOL.sel && TOOL.sel.kind === 'causeway') VIEW.causeways(); });
      return;
    }
    if (TOOL.isBrush(TOOL.mode) && e.target === cv) { var hb = VIEW.pick(TOOL.ray(e)); TOOL.ring(hb ? hb[0] : null, hb ? hb[1] : null); }
    TOOL.inspect(e);
  });
  window.addEventListener('mouseup', function (e) {
    if (TOOL.stroke) { TOOL.strokeEnd(); down = null; return; }
    if (TOOL.drag) { TOOL.drag = null; SITE.dirty = true; SITE.changed(); return; }
    if (!down || e.target !== cv || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4 || e.button !== 0) { down = null; return; }
    down = null;
    var h = VIEW.pick(TOOL.ray(e)); if (h) TOOL.addAt(h[0], h[1], e);
  });
  cv.addEventListener('dblclick', function () { if (SITE.TYPES[TOOL.mode] || TOOL.isLine(TOOL.mode)) { TOOL.draft.pop(); TOOL.finish(); } else if (TOOL.mode === 'route') TOOL.finish(); });
  $('mm').addEventListener('click', function (e) {
    var r = this.getBoundingClientRect(), E = VIEW.ext, x = -E + (e.clientX - r.left) / r.width * 2 * E, z = -E + (e.clientY - r.top) / r.height * 2 * E;
    if (TOOL.mode === 'select' || TOOL.isBrush(TOOL.mode)) { ctl.target.set(x, VIEW.surf(x, z), z); updateCamera(); TOOL.minimap(); }
    else TOOL.addAt(x, z, null);
  });
  window.addEventListener('keydown', function (e) {
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) SITE.doRedo(); else SITE.doUndo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); SITE.doRedo(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); TOOL.save(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (TOOL.KEYS[k]) { TOOL.setMode(TOOL.KEYS[k]); return; }
    if (k === '[' || k === ']') { TOOL.brush.r = Math.max(10, Math.min(400, Math.round(TOOL.brush.r * (k === ']' ? 1.25 : 0.8)))); $('br-r').value = TOOL.brush.r; $('br-rv').textContent = TOOL.brush.r + ' m'; return; }
    if (e.key === 'Enter') TOOL.finish();
    else if (e.key === 'Escape' && TOOL.stops.length) { TOOL.stops = []; TOOL.draw3D(); }
    else if (e.key === 'Backspace' && TOOL.stops.length) { TOOL.stops.pop(); TOOL.draw3D(); e.preventDefault(); }
    else if (e.key === 'Escape') { if (TOOL.draft.length) { TOOL.draft = []; TOOL.draw3D(); TOOL.minimap(); } else TOOL.select(null); }
    else if (e.key === 'Backspace') { if (TOOL.draft.length) { TOOL.draft.pop(); TOOL.draw3D(); TOOL.minimap(); e.preventDefault(); } }
    else if (e.key === 'Delete') TOOL.deleteSel();
  });
  (window._frameHooks = window._frameHooks || []).push(function () {
    if (TOOL.stroke) TOOL.strokeStep(false);
    var n = Date.now(); if (n - (TOOL._mmT || 0) > 250) { TOOL._mmT = n; TOOL.minimap(); }
  });
};

/* ---------------------------------------------------------------- inspector: what is under the pointer */
TOOL.inspect = function (e) {
  if (!SITE.data) return;
  var n = Date.now(); if (n - (TOOL._inT || 0) < 70) return; TOOL._inT = n;
  var tip = $('tip');
  if (e.target !== renderer.domElement) { tip.style.display = 'none'; return; }
  var h = VIEW.pick(TOOL.ray(e)); if (!h) { tip.style.display = 'none'; return; }
  var x = h[0], z = h[1], gh = TERR.h(x, z), dl = TERR.delta(x, z), L = VOTH.landDist(x, z), parts = [];
  VIEW.cantonList.forEach(function (c) { if (Math.abs(x - c.x) < c.r * 1.07 && Math.abs(z - c.z) < c.r * 1.07) parts.push('<b>' + c.n + ' canton</b>'); });
  var d = SITE.districtAt([x, z]); if (d) parts.push('<b>' + esc(d.name) + '</b> (' + d.type + ')');
  parts.push((gh < VOTH.SEA ? 'water, depth ' + (VOTH.SEA - gh).toFixed(1) : 'ground ' + gh.toFixed(1)) + ' m' + (Math.abs(dl) > 0.05 ? ' (edited ' + (dl > 0 ? '+' : '') + dl.toFixed(1) + ')' : '') +
    ' &middot; shore ' + (L > 0 ? L.toFixed(0) + ' m inland' : (-L).toFixed(0) + ' m out'));
  parts.push('<span class="k">' + x.toFixed(1) + ', ' + z.toFixed(1) + '</span>');
  tip.innerHTML = parts.join('<br>'); tip.style.display = 'block';
  tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
};

/* ---------------------------------------------------------------- saving: to the repo through serve.py, else a download */
TOOL.DRAFT = 'streetlab.voth-site.draft';
TOOL.status = function () {
  $('status').textContent = SITE.dirty ? 'unsaved changes' : (SITE.data.saved ? 'saved ' + SITE.data.saved.replace('T', ' ').slice(0, 16) : 'not saved yet');
  $('status').className = SITE.dirty ? 'dirty' : '';
  $('b-undo').disabled = !SITE.undo.length; $('b-redo').disabled = !SITE.redo.length;
};
TOOL.save = function () {
  var prev = SITE.data.saved;
  SITE.data.saved = new Date().toISOString();
  fetch('/save/voth-site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: SITE.json() })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function () { SITE.dirty = false; TOOL.status(); TOOL.flash('saved to site/voth-site.json'); try { localStorage.removeItem(TOOL.DRAFT); } catch (e) { } })
    .catch(function () { SITE.data.saved = prev; TOOL.download(); TOOL.flash('no save server: downloaded instead (put it in settlements/streetlab/site/)'); });
};
TOOL.download = function () {
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([SITE.json()], { type: 'application/json' })); a.download = 'voth-site.json'; a.click();
};
TOOL.autosave = function () {
  if (!SITE.dirty) return;
  try { localStorage.setItem(TOOL.DRAFT, JSON.stringify({ edited: new Date().toISOString(), data: SITE.data })); } catch (e) { }
};
/* replace everything the owner draws with another site's (import, draft restore, clear) */
TOOL.replaceAll = function (o) {
  SITE.edit(function (S) { var c = SITE.clean(o); ['districts', 'markers', 'avenues', 'causeways', 'terrain', 'stations', 'routes'].forEach(function (k) { S[k] = c[k]; }); });
  TOOL.select(null);
};
/* keep the ground, and what stands on it, in step with the site's terrain strokes */
TOOL.syncGround = function () {
  var t = SITE.data.terrain, sig = t.length + ':' + JSON.stringify(t).length;
  if (TOOL.terrLive) { TOOL.terrLive = false; TERR.n = t.length; TOOL.terrSig = sig; return; }
  if (sig === TOOL.terrSig) return;
  TOOL.terrSig = sig; TERR.sync(t); VIEW.refreshTerrain(null, true);
};
TOOL.start = function (data) {
  SITE.load(data);
  var draft = null; try { draft = JSON.parse(localStorage.getItem(TOOL.DRAFT) || 'null'); } catch (e) { }
  if (draft && draft.data && (!SITE.data.saved || draft.edited > SITE.data.saved) && JSON.stringify(SITE.clean(draft.data)) !== JSON.stringify(SITE.clean(SITE.data))) {
    $('restore').style.display = 'inline-block';
    $('restore').onclick = function () { TOOL.replaceAll(draft.data); this.style.display = 'none'; };
  }
};
TOOL.ui = function () {
  TOOL.MODES.forEach(function (k) {
    var b = $('m-' + k); if (!b) return;
    b.onclick = function () { TOOL.setMode(k); };
    var C = SITE.TYPES[k] || SITE.CLASSES[k]; if (C) b.style.borderBottom = '3px solid ' + C.colour;
  });
  $('br-r').oninput = function () { TOOL.brush.r = +this.value; $('br-rv').textContent = this.value + ' m'; };
  $('br-s').oninput = function () { TOOL.brush.s = +this.value; $('br-sv').textContent = this.value; };
  $('b-save').onclick = TOOL.save;
  $('b-export').onclick = TOOL.download;
  $('b-copy').onclick = function () { TOOL.copy(SITE.json()); };
  $('b-import').onclick = function () { $('file').click(); };
  $('file').onchange = function () {
    var f = this.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try { TOOL.replaceAll(JSON.parse(rd.result)); TOOL.flash('imported ' + f.name); } catch (e) { TOOL.flash('not a site file: ' + e.message); } };
    rd.readAsText(f); this.value = '';
  };
  $('b-voth').onclick = function () {
    SITE.edit(function (S) { SITE.fromVoth().forEach(function (d) { d.id = SITE.newId('d', S.districts); S.districts.push(d); }); });
    TOOL.flash("added Voth's " + VOTH.DISTRICTS.length + ' current districts');
  };
  $('b-clear').onclick = function () {
    if (confirm('Remove every district, avenue, marker and ground edit, and put Voth\'s causeways back? (Undo brings it all back.)')) TOOL.replaceAll(SITE.blank());
  };
  $('b-undo').onclick = SITE.doUndo; $('b-redo').onclick = SITE.doRedo;
  $('v-map').onclick = function () { ctl.target.set(300, 0, -300); ctl.dist = 7600; ctl.el = 1.45; ctl.az = 0; updateCamera(); };
  $('v-city').onclick = function () { ctl.target.set(600, 0, 300); ctl.dist = 3600; ctl.el = 0.75; ctl.az = 0.35; updateCamera(); };
  $('v-labels').onclick = function () { HOSTUI.labels = !HOSTUI.labels; this.classList.toggle('on', HOSTUI.labels); VIEW.labels.forEach(function (s) { s.visible = HOSTUI.labels; }); TOOL.draw3D(); };
  $('v-labels').classList.add('on');
  SITE.onChange(function () {
    if (TOOL.sel && !TOOL.item(TOOL.sel)) TOOL.sel = null;
    TOOL.syncGround(); VIEW.causeways();
    TOOL.paint(); TOOL.draw3D(); TOOL.list(); TOOL.editor(); TOOL.minimap(); TOOL.status(); TOOL.autosave();
  });
  window.addEventListener('beforeunload', function (e) { if (SITE.dirty) { TOOL.autosave(); e.preventDefault(); e.returnValue = ''; } });
};
