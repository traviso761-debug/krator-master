/* ============================== HOOK SITE EDITOR: HOOK'S RECORDS AND TOOLS ([web]) ============================== */
/* A layer over Voth's model (93-site-model.js: SITE, TERR) and tools (95-site-tools.js: TOOL), never an edit of them:
   the district types are Hook's (zone, quarter, field); a quarter carries its lot mix (cultures), holder, mood,
   layer and ruin level and a field its kind and strength; the site also holds the named hosts ({id, key, name,
   x, z, ry, d, cut, note}: a ruin host of the Ancient town, 79-hook-ancient.js) and the grid block, both saved and
   loaded with it. SITE.clean keeps Voth's shape for districts, markers, avenues and terrain, so the file is what
   build.py inlines as HOOK_SITE. Voth's causeways, stations and routes are kept empty in memory (the tools read
   them) and left out of the saved file. The tools gain a host mode (7) and host selection, dragging and editing;
   the painting and the minimap are Hook's (a quarter in its layer's colour, the damage field hatched, the zone an
   outline); saving posts to serve.py's /save/hook-site. */
SITE.TYPES = {
  quarter: { label: 'Quarter', colour: '#c9a227' },
  field: { label: 'Field', colour: '#c0392b' },
  zone: { label: 'Zone', colour: '#e6dcc2' },
  misc: { label: 'Misc', colour: '#3f7fb0' }        /* Voth's fallback for an unknown type; no button */
};
SITE.LAYERS = { hukoa: '#2b7a3b', tethys: '#2a6f9e', iziz: '#c8601a', voth: '#5a3d8c', salvage: '#6b6b6b', ancient: '#3a3a3a' };   /* 90b-hook-city-draw.js COL */
SITE.MOODS = ['hopeful', 'guarded', 'busy', 'divided', 'military', 'working', 'tense', 'desperate'];
SITE.GRID = { z1: -150, block: 110, street: 20, p: .45, pEdge: .3, rows: [], weights: { anArcades: 1 } };
SITE.blank = function () {
  return { site: 'hook', version: 1, saved: null, note: '', districts: [], markers: [], avenues: [], causeways: [], terrain: [], stations: [], routes: [],
    hosts: [], grid: JSON.parse(JSON.stringify(SITE.GRID)) };
};
SITE.num = function (v, d, lo, hi) { v = +v; if (!isFinite(v)) return d; return Math.max(lo, Math.min(hi, v)); };
SITE.cleanCultures = function (c) {
  var out = {}; if (!c || typeof c !== 'object') return out;
  Object.keys(c).forEach(function (k) { var v = +c[k]; if (k && isFinite(v) && v > 0) out[k] = Math.round(v); });
  return out;
};
SITE.cleanGrid = function (g) {
  var G = JSON.parse(JSON.stringify(SITE.GRID)); if (!g || typeof g !== 'object') return G;
  if (g.note) G.note = String(g.note);
  G.z1 = SITE.num(g.z1, G.z1, -5000, 5000); G.block = SITE.num(g.block, G.block, 20, 400); G.street = SITE.num(g.street, G.street, 4, 60);
  G.p = SITE.num(g.p, G.p, 0, 1); G.pEdge = SITE.num(g.pEdge, G.pEdge, 0, 1);
  G.rows = (g.rows || []).filter(function (r) { return Array.isArray(r) && r.length >= 3 && isFinite(r[0]) && isFinite(r[1]) && isFinite(r[2]); })
    .map(function (r) { return [+r[0], +r[1], Math.max(0, Math.round(+r[2]))]; });
  if (g.weights && typeof g.weights === 'object') { G.weights = {}; Object.keys(g.weights).forEach(function (k) { var v = +g.weights[k]; if (isFinite(v) && v > 0) G.weights[k] = v; }); if (!Object.keys(G.weights).length) G.weights = { anArcades: 1 }; }
  return G;
};
SITE._cleanVoth = SITE.clean;
SITE.clean = function (o) {
  var out = SITE._cleanVoth(o); o = (o && typeof o === 'object') ? o : {};
  out.site = 'hook'; out.version = 1; out.note = String(o.note || ''); out.causeways = []; out.stations = []; out.routes = [];
  /* the quarters' and fields' own fields, matched back by id (Voth's clean kept the ids) */
  var by = {}; (o.districts || []).forEach(function (d) { if (d && d.id) by[d.id] = d; });
  out.districts.forEach(function (d) {
    var s = by[d.id] || {};
    if (d.type === 'quarter') {
      d.layer = SITE.LAYERS[s.layer] ? s.layer : null; d.ruin = s.ruin == null ? null : SITE.num(s.ruin, .5, 0, 1);
      d.cultures = SITE.cleanCultures(s.cultures); d.holder = String(s.holder || ''); d.mood = String(s.mood || '');
    } else if (d.type === 'field') { d.kind = String(s.kind || 'damage'); d.v = SITE.num(s.v, 1, 0, 1); }
  });
  out.hosts = (o.hosts || []).filter(function (h) { return h && h.key && isFinite(h.x) && isFinite(h.z); }).map(function (h, i) {
    return { id: String(h.id || ('h' + (i + 1))), key: String(h.key), name: String(h.name || h.key), x: +(+h.x).toFixed(1), z: +(+h.z).toFixed(1),
      ry: +(+h.ry || 0).toFixed(3), d: SITE.num(h.d, 1, 0, 3), cut: h.cut == null || h.cut === '' ? null : String(h.cut), note: String(h.note || '') };
  });
  out.grid = SITE.cleanGrid(o.grid);
  return out;
};
/* the saved file: Hook's keys in a fixed order, Voth's empty lists left out */
SITE.json = function () {
  var S = SITE.data, o = { site: 'hook', version: 1, saved: S.saved, note: S.note || '', districts: S.districts, markers: S.markers, avenues: S.avenues, hosts: S.hosts, grid: S.grid, terrain: S.terrain };
  return JSON.stringify(o, null, 1);
};
SITE.fromVoth = function () { return []; };
/* hosts */
SITE.host = function (id) { return (SITE.data.hosts || []).filter(function (h) { return h.id === id; })[0] || null; };
SITE.hostKeys = function () { return Object.keys(HOOK_HOSTS); };
SITE.hostCuts = function (key) { var S = HOOK_HOSTS[key] && HOOK_HOSTS[key].spec; return S && S.cuts ? Object.keys(S.cuts) : []; };
SITE.addHost = function (key, x, z) {
  return SITE.edit(function (S) {
    if (!S.hosts) S.hosts = [];
    var h = { id: SITE.newId('h', S.hosts), key: key, name: HOOK_HOSTS[key] ? HOOK_HOSTS[key].spec.name : key, x: +x.toFixed(1), z: +z.toFixed(1), ry: 0, d: 1, cut: SITE.hostCuts(key).indexOf('mid') >= 0 ? 'mid' : null, note: '' };
    S.hosts.push(h); return h;
  });
};
/* a host's footprint: a square of the pad's width centred on it, turned by ry (79-hook-ancient.js hostFoot) */
SITE.hostCorners = function (h) {
  var W = HOOK_HOSTS[h.key] ? HOOK_HOSTS[h.key].W : 90, w = W / 2, c = Math.cos(h.ry || 0), s = Math.sin(h.ry || 0);
  return [[-w, -w], [w, -w], [w, w], [-w, w]].map(function (p) { return [h.x + p[0] * c + p[1] * s, h.z - p[0] * s + p[1] * c]; });
};
SITE.hostAt = function (p) { return (SITE.data.hosts || []).filter(function (h) { return SITE.inside(p, SITE.hostCorners(h)); })[0] || null; };

/* ---------------------------------------------------------------- the tools: Hook's modes, the hosts, the panel */
TOOL.MODES = ['select', 'quarter', 'field', 'zone', 'marker', 'avenue', 'host', 'raise', 'lower', 'smooth'];
TOOL.KEYS = { '1': 'select', '2': 'quarter', '3': 'field', '4': 'zone', '5': 'marker', '6': 'avenue', '7': 'host', r: 'raise', l: 'lower', m: 'smooth' };
TOOL.hostKey = 'anArcades';
TOOL.HINTS.select = 'Click a quarter, avenue, marker or host to select it. Drag corners, markers or hosts; click a yellow mid-edge dot to add a corner; right-click a corner to remove it; Delete removes the selection.';
TOOL.HINTS.quarter = 'Click the ground (or the minimap) to add corners of a quarter. Click the first corner, double-click or press Enter to close; Backspace drops a corner; Esc cancels. Its cultures, holder, mood, layer and ruin are in the editor once it is selected.';
TOOL.HINTS.field = 'Click the ground to add corners of a painted field (damage: the reconquest\'s fresh damage, strength v). Double-click or Enter closes it.';
TOOL.HINTS.zone = 'Click the ground to add corners of the build zone (the one polygon core/city rasters the site onto). Double-click or Enter closes it.';
TOOL.HINTS.host = 'Click the ground to place a named Ancient host (its type is in the editor once it is selected; the pad is a square of its width). The grid\'s own hosts are drawn by build.py, not here.';
TOOL.HINTS.lower = 'Hold the left button on the ground to lower it; below the sea it floods. [ and ] change the brush size. (Strokes are saved; build.py does not apply them yet: KNOWN_ISSUES.md.)';
/* the panel: Hook's mode buttons in place of Voth's, no "add Voth's districts" */
(function () {
  var $$ = function (id) { return document.getElementById(id); };
  var row = $$('m-select').parentNode;
  row.innerHTML = '<button id="m-select">1 select</button><button id="m-quarter">2 quarter</button><button id="m-field">3 field</button><button id="m-zone">4 zone</button>' +
    '<button id="m-marker">5 marker</button><button id="m-avenue">6 avenue</button><button id="m-host">7 host</button>' +
    '<button id="m-raise">R raise</button><button id="m-lower">L lower</button><button id="m-smooth">M smooth</button>';
  $$('b-voth').style.display = 'none';   /* TOOL.ui still binds it: hidden, not removed */
  $$('bar').querySelector('h1').textContent = 'Hook site editor';
  $$('bar').querySelector('.k').textContent = "Hook's waterfront and ground (the Port kit), the quarters, markers, avenues and named hosts of site/hook-site.json. Drag to orbit, right-drag to pan, wheel to zoom, WASD to move; z shows the city plan's own drawing.";
  $$('side').querySelector('b').textContent = 'Quarters, avenues, hosts and markers';
  $$('loading').textContent = 'Opening the site...';
  /* the Port's panels out of the editor's corners: its style sits in the body, so this one goes after it */
  document.body.insertAdjacentHTML('beforeend', '<style>#cap,#insp{display:none!important}#ui{top:auto!important;bottom:10px!important;left:10px;max-width:40vw}' +
    '#hud{bottom:auto!important;top:14px!important;right:330px!important}#boundsLegend{bottom:44px!important}</style>');
  if (window.LOD_OPTIONS && typeof window.LOD_OPTIONS === 'object') window.LOD_OPTIONS.panelStyle = 'left:370px;right:auto;bottom:10px;';   /* core/lod\'s panel, off the minimap */
})();

/* the selection: a host is picked, dragged and edited like a marker, with a footprint */
TOOL._itemVoth = TOOL.item;
TOOL.item = function (s) { s = s || TOOL.sel; if (!s || !SITE.data) return null; return s.kind === 'host' ? SITE.host(s.id) : TOOL._itemVoth(s); };
TOOL._shapeVoth = TOOL.shape;
TOOL.shape = function (s) { return s && s.kind === 'host' ? null : TOOL._shapeVoth(s); };
TOOL._selectVoth = TOOL.select;
TOOL.select = function (sel, fly) {
  if (sel && sel.kind === 'host') {
    TOOL._selectVoth(sel, false);
    var h = SITE.host(sel.id);
    if (fly && h) { ctl.target.set(h.x, VIEW.surf(h.x, h.z), h.z); ctl.dist = 420; updateCamera(); }
    return;
  }
  TOOL._selectVoth(sel, fly);
};
/* the host under the pointer: its label, or its footprint under the picked ground point */
TOOL.hostAt = function (e, x, z) {
  var H = SITE.data.hosts || [];
  if (e) for (var i = 0; i < H.length; i++) { var h = H[i], s = TOOL.screen(h.x, VIEW.surf(h.x, h.z) + 30, h.z); if (s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < 18) return h; }
  return SITE.hostAt([x, z]);
};
TOOL._addAtVoth = TOOL.addAt;
TOOL.addAt = function (x, z, e) {
  if (TOOL.mode === 'host') { var h = SITE.addHost(TOOL.hostKey, x, z); TOOL.select({ kind: 'host', id: h.id }); return; }
  if (TOOL.mode === 'select' && e) {
    var mk = SITE.data.markers.filter(function (m) { var s = TOOL.screen(m.x, VIEW.surf(m.x, m.z) + 45, m.z); return s && Math.hypot(s[0] - e.clientX, s[1] - e.clientY) < 18; })[0];
    if (!mk) { var hh = TOOL.hostAt(e, x, z); if (hh) { TOOL.select({ kind: 'host', id: hh.id }); return; } }
  }
  TOOL._addAtVoth(x, z, e);
};
TOOL._deleteVoth = TOOL.deleteSel;
TOOL.deleteSel = function () {
  var s = TOOL.sel; if (!s) return;
  if (s.kind !== 'host') return TOOL._deleteVoth();
  SITE.edit(function (S) { S.hosts = (S.hosts || []).filter(function (h) { return h.id !== s.id; }); });
  TOOL.select(null);
};
/* dragging a host: before the tools' own mousedown (both capture the canvas; this one was bound first) */
renderer.domElement.addEventListener('mousedown', function (e) {
  if (TOOL.mode !== 'select' || !TOOL.sel || TOOL.sel.kind !== 'host' || e.button !== 0) return;
  var h = SITE.host(TOOL.sel.id); if (!h) return;
  var p = VIEW.pick(TOOL.ray(e)), hit = TOOL.hostAt(e, p ? p[0] : 1e9, p ? p[1] : 1e9);
  if (hit !== h) return;
  SITE.undo.push(JSON.stringify(SITE.data)); SITE.redo = []; TOOL.drag = { marker: h };
  e.stopImmediatePropagation(); e.preventDefault();
}, { capture: true });

/* the 3D marks: the hosts' footprints and labels after Voth's markers and the selection */
TOOL._draw3DVoth = TOOL.draw3D;
TOOL.draw3D = function () {
  TOOL._draw3DVoth();
  if (!SITE.data) return;
  (SITE.data.hosts || []).forEach(function (h) {
    var sel = TOOL.sel && TOOL.sel.kind === 'host' && TOOL.sel.id === h.id, y = VIEW.surf(h.x, h.z);
    TOOL.line(SITE.hostCorners(h), sel ? 0xfff4c8 : 0xd8d0b8, true, 2);
    var pin = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(h.x, y, h.z), new THREE.Vector3(h.x, y + 30, h.z)]), new THREE.LineBasicMaterial({ color: sel ? 0xfff4c8 : 0xd8d0b8, depthTest: false, transparent: true }));
    pin.renderOrder = 30; scene.add(pin); TOOL.objs.push(pin);
    var s = VIEW.sprite(h.name, { size: sel ? .03 : .024, bg: sel ? 'rgba(230,126,34,0.9)' : 'rgba(58,58,58,0.85)' });
    s.position.set(h.x, y + 30, h.z); s.visible = !!HOSTUI.labels || sel; scene.add(s); TOOL.objs.push(s);
  });
};
/* the painting: the zone an outline, a quarter filled in its layer's colour, a field hatched; avenues as Voth paints them */
TOOL.paint = function () {
  if (!SITE.data) return;
  var cv = VIEW.ovCanvas, S = cv.width, E = VIEW.ext, k = S / (2 * E), ctx = cv.getContext('2d');
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var path = function (P, closed) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); if (closed) ctx.closePath(); };
  var on = function (kind, id) { return TOOL.sel && TOOL.sel.kind === kind && TOOL.sel.id === id; };
  ctx.clearRect(0, 0, S, S); ctx.lineJoin = 'round';
  var list = SITE.data.districts.slice().sort(function (a, b) { return SITE.area(b.poly) - SITE.area(a.poly); });
  list.forEach(function (d) {
    var sel = on('district', d.id), col = d.type === 'quarter' ? (SITE.LAYERS[d.layer] || SITE.TYPES.quarter.colour) : SITE.TYPES[d.type].colour;
    path(d.poly, true);
    if (d.type === 'zone') { ctx.globalAlpha = sel ? 1 : .8; ctx.setLineDash([24, 14]); ctx.lineWidth = sel ? 8 : 5; ctx.strokeStyle = sel ? '#fff4c8' : col; ctx.stroke(); ctx.setLineDash([]); }
    else if (d.type === 'field') {
      ctx.save(); ctx.clip(); ctx.globalAlpha = .9; ctx.strokeStyle = col; ctx.lineWidth = 3;
      for (var u = -S; u < 2 * S; u += 26) { ctx.beginPath(); ctx.moveTo(u, 0); ctx.lineTo(u + S, S); ctx.stroke(); }
      ctx.restore(); path(d.poly, true); ctx.globalAlpha = 1; ctx.lineWidth = sel ? 8 : 4; ctx.strokeStyle = sel ? '#fff4c8' : col; ctx.stroke();
    } else {
      ctx.globalAlpha = sel ? .62 : .42; ctx.fillStyle = col; ctx.fill();
      ctx.globalAlpha = .95; ctx.lineWidth = sel ? 8 : 4; ctx.strokeStyle = sel ? '#fff4c8' : col; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  ctx.lineCap = 'round';
  SITE.data.avenues.forEach(function (a) {
    var sel = on('avenue', a.id);
    path(a.pts, false); ctx.lineWidth = (a.width + 2) * k; ctx.strokeStyle = sel ? '#fff4c8' : '#8f8268'; ctx.stroke();
    path(a.pts, false); ctx.lineWidth = a.width * k; ctx.strokeStyle = SITE.CLASSES.avenue.colour; ctx.stroke();
  });
  VIEW.ovTex.needsUpdate = true;
};
TOOL.minimap = function () {
  if (!SITE.data) return;
  var cv = $('mm'), ctx = cv.getContext('2d'), S = cv.width, E = VIEW.ext, k = S / (2 * E);
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var path = function (P) { ctx.beginPath(); P.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); };
  ctx.drawImage(VIEW.mmBase, 0, 0, S, S);
  SITE.data.districts.forEach(function (d) {
    path(d.poly); ctx.closePath();
    if (d.type === 'zone') { ctx.strokeStyle = SITE.TYPES.zone.colour; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]); return; }
    ctx.globalAlpha = d.type === 'field' ? .35 : .7; ctx.fillStyle = d.type === 'quarter' ? (SITE.LAYERS[d.layer] || SITE.TYPES.quarter.colour) : SITE.TYPES[d.type].colour; ctx.fill(); ctx.globalAlpha = 1;
  });
  ctx.lineCap = 'round';
  SITE.data.avenues.forEach(function (a) { path(a.pts); ctx.lineWidth = Math.max(2, a.width * k * 1.5); ctx.strokeStyle = '#efe6cf'; ctx.stroke(); });
  (SITE.data.hosts || []).forEach(function (h) { path(SITE.hostCorners(h)); ctx.closePath(); ctx.fillStyle = 'rgba(232,224,200,0.9)'; ctx.fill(); });
  if (TOOL.draft.length) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; path(TOOL.draft); ctx.stroke(); }
  SITE.data.markers.forEach(function (m) { ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(X(m.x), Z(m.z), 6, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(m.id, X(m.x), Z(m.z) + 3); });
  ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 1.5; var r2 = Math.max(4, ctl.dist * 0.5 * k);
  ctx.strokeRect(X(ctl.target.x) - r2, Z(ctl.target.z) - r2, 2 * r2, 2 * r2);
};
/* the list: the hosts after Voth's rows, and Hook's count */
TOOL._listVoth = TOOL.list;
TOOL.list = function () {
  TOOL._listVoth();
  var H = SITE.data.hosts || [], h = '';
  H.forEach(function (x) {
    var on = TOOL.sel && TOOL.sel.kind === 'host' && TOOL.sel.id === x.id ? ' on' : '';
    h += '<div class="it' + on + '" data-k="host" data-id="' + x.id + '"><i style="background:#d8d0b8;border-radius:0"></i>' + esc(x.name) +
      ' <span class="k">' + esc(x.key) + ' &middot; d' + x.d + (x.cut ? ' &middot; ' + esc(x.cut) : '') + ' &middot; ' + Math.round(x.x) + ', ' + Math.round(x.z) + '</span></div>';
  });
  if (H.length) {   /* rewriting the list drops Voth's click bindings: bind every row again */
    $('items').innerHTML = $('items').innerHTML.replace('<div class="k">Nothing drawn yet.</div>', '') + h;
    Array.prototype.forEach.call($('items').querySelectorAll('.it'), function (el) { el.onclick = function () { TOOL.select({ kind: el.dataset.k, id: el.dataset.id }, true); }; });
  }
  var q = SITE.data.districts.filter(function (d) { return d.type === 'quarter'; }).length;
  $('count').textContent = q + ' quarters (' + SITE.data.districts.length + ' districts), ' + SITE.data.avenues.length + ' avenues, ' + H.length + ' hosts, ' + SITE.data.markers.length + ' markers' +
    (SITE.data.terrain.length ? ', ' + SITE.data.terrain.length + ' ground strokes' : '');
};
/* the editor: a host's fields; a quarter's cultures, holder, mood, layer and ruin; a field's kind and strength */
TOOL.cultText = function (c) { c = c || {}; return Object.keys(c).map(function (k) { return k + ' ' + c[k]; }).join(', '); };
TOOL.cultParse = function (t) {
  var out = {};
  String(t || '').split(/[,;]+/).forEach(function (s) { var m = s.trim().match(/^([a-z][\w-]*)\s*:?\s*(\d+(?:\.\d+)?)?$/i); if (m) out[m[1].toLowerCase()] = m[2] == null ? 1 : +m[2]; });
  return SITE.cleanCultures(out);
};
TOOL._editorVoth = TOOL.editor;
TOOL.editor = function () {
  var ed = $('editor'), s = TOOL.sel, it = TOOL.item(s);
  if (!s || !it) { ed.style.display = 'none'; return; }
  var sel = function (id, opts, v) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
  if (s.kind === 'host') {
    ed.style.display = 'block';
    var keys = SITE.hostKeys().map(function (k) { return [k, HOOK_HOSTS[k].spec.name + ' (' + k + ')']; }), cuts = [['', 'none (the whole building)']].concat(SITE.hostCuts(it.key).map(function (c) { return [c, c]; }));
    ed.innerHTML = '<b>Ancient host</b> <span class="k">' + esc(it.id) + ' &middot; ' + it.x.toFixed(1) + ', ' + it.z.toFixed(1) + ' &middot; ground ' + TERR.h(it.x, it.z).toFixed(1) + ' m &middot; pad ' + (HOOK_HOSTS[it.key] ? HOOK_HOSTS[it.key].W : '?') + ' m</span>' +
      '<label>name <input id="e-name" value="' + esc(it.name) + '"></label><label>type ' + sel('e-key', keys, it.key) + '</label>' +
      '<label>decay ' + sel('e-d', [[0, '0 intact'], [1, '1 ruined'], [3, '3 repaired (reclaimed)']], it.d) + '</label>' +
      '<label>cut ' + sel('e-cut', cuts, it.cut || '') + '</label>' +
      '<label>turn <input id="e-ry" type="number" min="-180" max="180" step="5" value="' + Math.round((it.ry || 0) * 180 / Math.PI) + '"> &deg;</label>' +
      '<label>note <input id="e-note" value="' + esc(it.note || '') + '"></label><button id="e-del">delete</button>';
    $('e-name').onchange = function () { TOOL.set('name', this.value); };
    $('e-key').onchange = function () { var k = this.value; TOOL.hostKey = k; SITE.edit(function () { it.key = k; if (SITE.hostCuts(k).indexOf(it.cut) < 0) it.cut = null; }); };
    $('e-d').onchange = function () { TOOL.set('d', +this.value); };
    $('e-cut').onchange = function () { TOOL.set('cut', this.value || null); };
    $('e-ry').onchange = function () { TOOL.set('ry', +((+this.value || 0) * Math.PI / 180).toFixed(3)); };
    $('e-note').onchange = function () { TOOL.set('note', this.value); };
    $('e-del').onclick = TOOL.deleteSel;
    return;
  }
  TOOL._editorVoth();
  if (s.kind !== 'district') return;
  var cp = $('e-copy'); if (cp) cp.parentNode.removeChild(cp);
  var del = $('e-del'), h = '';
  if (it.type === 'quarter') {
    h = '<label>layer ' + sel('e-layer', [['', '(none)']].concat(Object.keys(SITE.LAYERS).map(function (k) { return [k, k]; })), it.layer || '') + '</label>' +
      '<label>ruin <input id="e-ruin" type="number" min="0" max="1" step="0.05" value="' + (it.ruin == null ? '' : it.ruin) + '" placeholder="0 whole .. 1 toppled"></label>' +
      '<label>cultures <input id="e-cult" value="' + esc(TOOL.cultText(it.cultures)) + '" placeholder="hukoa 70, salvage 30 (PLAN.md section 3)"></label>' +
      '<label>holder <input id="e-holder" value="' + esc(it.holder || '') + '" placeholder="who holds it at game start"></label>' +
      '<label>mood <input id="e-mood" list="moods" value="' + esc(it.mood || '') + '"><datalist id="moods">' + SITE.MOODS.map(function (m) { return '<option value="' + m + '">'; }).join('') + '</datalist></label>';
  } else if (it.type === 'field') {
    h = '<label>kind <input id="e-kind" value="' + esc(it.kind || 'damage') + '"></label><label>strength <input id="e-v" type="number" min="0" max="1" step="0.05" value="' + (it.v == null ? 1 : it.v) + '"></label>';
  }
  if (h) del.insertAdjacentHTML('beforebegin', h);
  if ($('e-layer')) $('e-layer').onchange = function () { TOOL.set('layer', this.value || null); };
  if ($('e-ruin')) $('e-ruin').onchange = function () { TOOL.set('ruin', this.value === '' ? null : SITE.num(this.value, .5, 0, 1)); };
  if ($('e-cult')) $('e-cult').onchange = function () { TOOL.set('cultures', TOOL.cultParse(this.value)); };
  if ($('e-holder')) $('e-holder').onchange = function () { TOOL.set('holder', this.value); };
  if ($('e-mood')) $('e-mood').onchange = function () { TOOL.set('mood', this.value); };
  if ($('e-kind')) $('e-kind').onchange = function () { TOOL.set('kind', this.value || 'damage'); };
  if ($('e-v')) $('e-v').onchange = function () { TOOL.set('v', SITE.num(this.value, 1, 0, 1)); };
};
/* import, draft restore and clear replace the hosts and the grid too */
TOOL.replaceAll = function (o) {
  SITE.edit(function (S) { var c = SITE.clean(o); ['districts', 'markers', 'avenues', 'causeways', 'terrain', 'stations', 'routes', 'hosts', 'grid', 'note'].forEach(function (k) { S[k] = c[k]; }); });
  TOOL.select(null);
};
/* saving: to the repo through serve.py (settlements/hook/serve.py, POST /save/hook-site), else a download */
TOOL.DRAFT = 'hook.hook-site.draft';
TOOL.save = function () {
  var prev = SITE.data.saved;
  SITE.data.saved = new Date().toISOString();
  fetch('/save/hook-site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: SITE.json() })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function () { SITE.dirty = false; TOOL.status(); TOOL.flash('saved to site/hook-site.json (rebuild to see it in dist/hook.html)'); try { localStorage.removeItem(TOOL.DRAFT); } catch (e) { } })
    .catch(function () { SITE.data.saved = prev; TOOL.download(); TOOL.flash('no save server: downloaded instead (put it in settlements/hook/site/)'); });
};
TOOL.download = function () {
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([SITE.json()], { type: 'application/json' })); a.download = 'hook-site.json'; a.click();
};
