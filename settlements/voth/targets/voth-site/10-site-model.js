/* ============================== 1. THE SITE: DISTRICTS AND MARKERS ============================== */
/* [G data] What the owner draws on Voth's ground, as plain records: the same shape as Voth's own DISTRICTS
   ({type, name, poly}) so a polygon can be pasted straight into 30a-layout-districts.js, and lettered markers
   for landmark placement. No THREE, no DOM: the editor (55-site-tools.js) calls these and draws the result.

   site     {site: 'voth', version, saved, districts: [district], markers: [marker]}
   district {id, type: park|market|funerary|plaza|misc, name, poly: [[x, z], ...], note}
   marker   {id: 'A', x, z, note}                         x east, z south, metres (Voth's own frame) */
var SITE = {
  TYPES: {
    park:     { label: 'Park',     colour: '#3f8a35' },
    market:   { label: 'Market',   colour: '#d6a640' },
    funerary: { label: 'Funerary', colour: '#6d5a8a' },
    plaza:    { label: 'Plaza',    colour: '#cdbf9c' },
    misc:     { label: 'Misc',     colour: '#3f7fb0' }
  },
  data: null, undo: [], redo: [], dirty: false, listeners: []
};

/* avenue    {id, name, width, note, pts: [[x, z], ...]}                     a polyline, painted on the ground
   causeway  {id, name, kind: mole|bridge, width, note, origin: voth|drawn, pts: [[x, z], ...]}
             mole: reclaimed land at the waterline; bridge: a deck on piers. Built by Voth's own builders.
             causeways null (a site saved before they were editable) means Voth's own nine, as Voth builds them. */
SITE.CLASSES = {
  avenue:   { label: 'Avenue',   colour: '#e6dcc2', width: 12 },
  causeway: { label: 'Causeway', colour: '#b3a68a', width: 46 }
};
SITE.blank = function () { return { site: 'voth', version: 2, saved: null, districts: [], markers: [], avenues: [], causeways: null, terrain: [], stations: null, routes: [] }; };
/* accept a saved site, or anything with districts/markers in the right shape; unknown types become misc */
SITE.clean = function (o) {
  var out = SITE.blank();
  if (!o || typeof o !== 'object') return out;
  out.saved = o.saved || null;
  (o.districts || []).forEach(function (d, i) {
    if (!d || !Array.isArray(d.poly) || d.poly.length < 3) return;
    var type = SITE.TYPES[d.type] ? d.type : 'misc';
    out.districts.push({ id: d.id || ('d' + (i + 1)), type: type, name: String(d.name || SITE.TYPES[type].label), note: String(d.note || (SITE.TYPES[d.type] ? '' : (d.type || ''))),
      poly: d.poly.map(function (p) { return [+(+p[0]).toFixed(1), +(+p[1]).toFixed(1)]; }) });
  });
  (o.markers || []).forEach(function (m) { if (m && isFinite(m.x) && isFinite(m.z)) out.markers.push({ id: String(m.id || SITE.nextLetter(out)), x: +(+m.x).toFixed(1), z: +(+m.z).toFixed(1), note: String(m.note || '') }); });
  var line = function (l, i, prefix, cls) {
    if (!l || !Array.isArray(l.pts) || l.pts.length < 2) return null;
    return { id: l.id || (prefix + (i + 1)), name: String(l.name || SITE.CLASSES[cls].label + ' ' + (i + 1)), width: +l.width || SITE.CLASSES[cls].width, note: String(l.note || ''),
      pts: l.pts.map(function (p) { return [+(+p[0]).toFixed(1), +(+p[1]).toFixed(1)]; }) };
  };
  (o.avenues || []).forEach(function (l, i) { var a = line(l, i, 'a', 'avenue'); if (a) out.avenues.push(a); });
  if (Array.isArray(o.stations)) out.stations = o.stations.filter(function (st) { return st && isFinite(st.x) && isFinite(st.z); }).map(function (st) {
    return { id: String(st.id), kind: st.kind === 'strider' ? 'strider' : 'ferry', name: String(st.name || st.id), x: +(+st.x).toFixed(1), z: +(+st.z).toFixed(1), origin: st.origin === 'voth' ? 'voth' : 'drawn', canton: st.canton || null };
  });
  out.routes = (o.routes || []).filter(function (r) { return r && Array.isArray(r.stops) && r.stops.length >= 2; })
    .map(function (r, i) {
      var q = { id: r.id || ('r' + (i + 1)), kind: r.kind === 'strider' ? 'strider' : 'ferry', name: String(r.name || 'Route ' + (i + 1)), stops: r.stops.map(String) };
      if (SITE.COMPASS[r.enter]) q.enter = r.enter;          /* the line comes in from off the map, from this side */
      if (SITE.COMPASS[r.exit]) q.exit = r.exit;             /* ...and leaves off the map by this side */
      return q;
    });
  out.terrain = (o.terrain || []).filter(function (t) { return t && Array.isArray(t.pts) && t.pts.length && /^(raise|lower|smooth)$/.test(t.m); })
    .map(function (t) { return { m: t.m, r: +t.r || 40, s: +t.s || 1, pts: t.pts.map(function (p) { return [+(+p[0]).toFixed(1), +(+p[1]).toFixed(1)]; }) }; });
  if (Array.isArray(o.causeways)) {
    out.causeways = [];
    o.causeways.forEach(function (l, i) {
      var c = line(l, i, 'c', 'causeway'); if (!c) return;
      c.kind = l.kind === 'bridge' ? 'bridge' : 'mole'; c.origin = l.origin === 'voth' ? 'voth' : 'drawn';
      out.causeways.push(c);
    });
  }
  return out;
};
/* the causeways as they stand: the site's own list, or Voth's nine when the site has not taken them over yet */
SITE.causeways = function () { return SITE.data.causeways || SITE.vothCauseways(); };
/* the first edit to any causeway copies Voth's nine into the site, so a deletion or a move is saved */
SITE.ownCauseways = function (S) { if (!S.causeways) S.causeways = JSON.parse(JSON.stringify(SITE.vothCauseways())); return S.causeways; };
SITE.addLine = function (cls, pts) {
  return SITE.edit(function (S) {
    var list = cls === 'avenue' ? S.avenues : SITE.ownCauseways(S), prefix = cls === 'avenue' ? 'a' : 'c';
    var l = { id: SITE.newId(prefix, list), name: SITE.CLASSES[cls].label + ' ' + (list.length + 1), width: SITE.CLASSES[cls].width, note: '',
      pts: pts.map(function (p) { return [+p[0].toFixed(1), +p[1].toFixed(1)]; }) };
    if (cls === 'causeway') { l.kind = 'mole'; l.origin = 'drawn'; }
    list.push(l);
    return l;
  });
};
SITE.line = function (cls, id) { var L = cls === 'avenue' ? SITE.data.avenues : SITE.causeways(); return L.filter(function (l) { return l.id === id; })[0] || null; };
SITE.lineLen = function (P) { var s = 0; for (var i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; };
SITE.load = function (o) { SITE.data = SITE.clean(o); SITE.undo = []; SITE.redo = []; SITE.dirty = false; SITE.changed(); };
SITE.json = function () { return JSON.stringify(SITE.data, null, 1); };
SITE.onChange = function (fn) { SITE.listeners.push(fn); };
SITE.changed = function () { SITE.listeners.forEach(function (fn) { fn(); }); };

/* every edit goes through here: snapshot for undo, apply, notify */
SITE.edit = function (fn) {
  SITE.undo.push(JSON.stringify(SITE.data)); if (SITE.undo.length > 200) SITE.undo.shift();
  SITE.redo = [];
  var r = fn(SITE.data);
  SITE.dirty = true; SITE.changed();
  return r;
};
SITE.doUndo = function () { if (!SITE.undo.length) return; SITE.redo.push(JSON.stringify(SITE.data)); SITE.data = JSON.parse(SITE.undo.pop()); SITE.dirty = true; SITE.changed(); };
SITE.doRedo = function () { if (!SITE.redo.length) return; SITE.undo.push(JSON.stringify(SITE.data)); SITE.data = JSON.parse(SITE.redo.pop()); SITE.dirty = true; SITE.changed(); };

/* ---------------------------------------------------------------- districts */
SITE.newId = function (prefix, list) { var n = 1; while (list.some(function (o) { return o.id === prefix + n; })) n++; return prefix + n; };
SITE.addDistrict = function (type, poly) {
  return SITE.edit(function (S) {
    var same = S.districts.filter(function (d) { return d.type === type; }).length;
    var d = { id: SITE.newId('d', S.districts), type: type, name: SITE.TYPES[type].label + ' ' + (same + 1), poly: poly.map(function (p) { return [+p[0].toFixed(1), +p[1].toFixed(1)]; }), note: '' };
    S.districts.push(d);
    return d;
  });
};
SITE.district = function (id) { return SITE.data.districts.filter(function (d) { return d.id === id; })[0] || null; };
SITE.marker = function (id) { return SITE.data.markers.filter(function (m) { return m.id === id; })[0] || null; };
SITE.area = function (P) { var s = 0; for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s / 2); };
SITE.centroid = function (P) { var x = 0, z = 0; P.forEach(function (p) { x += p[0]; z += p[1]; }); return [x / P.length, z / P.length]; };
SITE.inside = function (p, P) {
  var c = false;
  for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
  return c;
};
/* the district under a point: the smallest that contains it, so a plaza drawn inside a park can be picked */
SITE.districtAt = function (p) {
  var best = null, ba = Infinity;
  SITE.data.districts.forEach(function (d) { if (SITE.inside(p, d.poly)) { var a = SITE.area(d.poly); if (a < ba) { ba = a; best = d; } } });
  return best;
};

/* ---------------------------------------------------------------- markers: A, B ... Z, AA, AB ... */
SITE.letter = function (n) { var s = ''; n++; while (n > 0) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; };
SITE.nextLetter = function (S) { S = S || SITE.data; for (var n = 0; ; n++) { var L = SITE.letter(n); if (!S.markers.some(function (m) { return m.id === L; })) return L; } };
SITE.addMarker = function (x, z) {
  return SITE.edit(function (S) { var m = { id: SITE.nextLetter(S), x: +x.toFixed(1), z: +z.toFixed(1), note: '' }; S.markers.push(m); return m; });
};

/* Voth's nine causeways as records, resolved the way 50f-spans-build.js resolves them (same seed, same draws):
   rim to shore, through the stepping-stone islet where the bridge causeway has one */
SITE._vcw = null;
SITE.vothCauseways = function () {
  if (SITE._vcw) return SITE._vcw;
  var B = VOTH, out = [];
  B.reseed(2468);
  B.CAUSEWAYS.forEach(function (cw) {
    var c = cw.c, land = B.shoreIn(cw.s, 26), dx = land[0] - c.x, dz = land[1] - c.z, L = Math.hypot(dx, dz);
    if (L < c.r + 40) return;
    var rw = cw.solid ? (c.port ? 60 : B.rr(40, 52)) : 0, w = cw.solid ? 0 : (c.port ? 22 : B.rr(13, 18));
    var pts = [[c.x + dx / L * c.r * 0.96, c.z + dz / L * c.r * 0.96]];
    if (cw.isle) pts.push([cw.isle[0], cw.isle[1]]);
    pts.push(land);
    out.push({ id: 'cw-' + c.n.toLowerCase(), name: c.n + ' causeway', kind: cw.solid ? 'mole' : 'bridge', width: +(cw.solid ? rw : w).toFixed(1),
      note: '', origin: 'voth', pts: pts.map(function (p) { return [+p[0].toFixed(1), +p[1].toFixed(1)]; }) });
  });
  return (SITE._vcw = out);
};

/* ============================== STATIONS AND ROUTES ==============================
   station {id: F1.. | S1.., kind: ferry|strider, name, x, z, origin: voth|drawn, canton}
   route   {id, kind: ferry|strider, name, stops: [station ids]}   ferry legs go by water, elephant bug legs by land
   stations null (a site from before) means Voth's own ferry stops at the canton docks, placed the way
   65e-docks-ferry-fishing.js places them: the four canton piers (CPIERS: Palace, Temple, Ancestry, Arena) at
   their tips, every other canton a pier 40 m out toward the bay's centre (Port 85 m: its quay ring). */
SITE._vst = null;
SITE.vothStations = function () {
  if (SITE._vst) return SITE._vst;
  var B = VOTH, out = [], C = B.CIDX;
  var bc = { x: (C.Palace.x + C.Temple.x + C.Ancestry.x) / 3, z: (C.Palace.z + C.Temple.z + C.Ancestry.z) / 3 };
  B.CANTONS.forEach(function (c) {
    var p = B.CPIERS.filter(function (q) { return q.canton === c.n; })[0], x, z;
    if (p) { x = p.x1; z = p.z1; }
    else {
      var dx = bc.x - c.x, dz = bc.z - c.z, d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
      var cap = c.r * 1.07, a = Math.atan2(dz, dx), clear = cap / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a))), len = c.n === 'Port' ? 85 : 40;
      x = c.x + dx * (clear + len); z = c.z + dz * (clear + len);
    }
    out.push({ id: 'F' + (out.length + 1), kind: 'ferry', name: c.n + ' dock', x: +x.toFixed(1), z: +z.toFixed(1), origin: 'voth', canton: c.n });
  });
  return (SITE._vst = out);
};
/* compass bearings a line can enter or leave the map by, as [x, z] directions (north is -z) */
SITE.COMPASS = { N: [0, -1], NE: [0.7071, -0.7071], E: [1, 0], SE: [0.7071, 0.7071], S: [0, 1], SW: [-0.7071, 0.7071], W: [-1, 0], NW: [-0.7071, -0.7071] };
SITE.stations = function () { return SITE.data.stations || SITE.vothStations(); };
SITE.ownStations = function (S) { if (!S.stations) S.stations = JSON.parse(JSON.stringify(SITE.vothStations())); return S.stations; };
SITE.station = function (id) { return SITE.stations().filter(function (s) { return s.id === id; })[0] || null; };
SITE.route = function (id) { return SITE.data.routes.filter(function (r) { return r.id === id; })[0] || null; };
SITE.addStation = function (kind, x, z) {
  return SITE.edit(function (S) {
    var L = SITE.ownStations(S), pre = kind === 'ferry' ? 'F' : 'S', n = 1;
    while (L.some(function (s) { return s.id === pre + n; })) n++;
    var st = { id: pre + n, kind: kind, name: (kind === 'ferry' ? 'Ferry stop ' : 'Elephant bug station ') + n, x: +x.toFixed(1), z: +z.toFixed(1), origin: 'drawn' };
    L.push(st); return st;
  });
};
SITE.addRoute = function (kind, stops) {
  return SITE.edit(function (S) {
    var r = { id: SITE.newId('r', S.routes), kind: kind, name: (kind === 'ferry' ? 'Ferry line ' : 'Elephant bug line ') + (S.routes.filter(function (q) { return q.kind === kind; }).length + 1), stops: stops.slice() };
    S.routes.push(r); return r;
  });
};
SITE.routePts = function (r, stubs) {
  var P = r.stops.map(SITE.station).filter(Boolean).map(function (s) { return [s.x, s.z]; });
  /* with stubs: the off-map ends drawn as 600 m leads toward their side of the map */
  if (stubs && P.length) {
    if (r.enter) { var a = SITE.COMPASS[r.enter]; P.unshift([P[0][0] + a[0] * 600, P[0][1] + a[1] * 600]); }
    if (r.exit) { var b = SITE.COMPASS[r.exit], L = P[P.length - 1]; P.push([L[0] + b[0] * 600, L[1] + b[1] * 600]); }
  }
  return P;
};

/* ============================== TERRAIN EDITS ==============================
   Raise, lower and smooth, kept as brush strokes ({m: raise|lower|smooth, r, s, pts}) in site.terrain and replayed
   in order onto a height-delta grid over the editable square. The ground anywhere is Voth's terrainH plus the
   delta there, so anything that reads the site (the street placement) gets the edited ground by replaying. */
var TERR = { cell: 6, ext: 3900, D: null, base: null, n: 0 };
TERR.N = Math.ceil(2 * TERR.ext / TERR.cell) + 1;
TERR.reset = function () { var N = TERR.N * TERR.N; TERR.D = new Float32Array(N); if (!TERR.base) { TERR.base = new Float32Array(N); TERR.base.fill(NaN); } TERR.n = 0; };
TERR.baseAt = function (i, j) {
  var k = j * TERR.N + i, v = TERR.base[k];
  if (v !== v) v = TERR.base[k] = VOTH.terrainH(-TERR.ext + i * TERR.cell, -TERR.ext + j * TERR.cell);
  return v;
};
/* the delta at a point, bilinear; 0 outside the square */
TERR.delta = function (x, z) {
  if (!TERR.D) return 0;
  var fx = (x + TERR.ext) / TERR.cell, fz = (z + TERR.ext) / TERR.cell, i = Math.floor(fx), j = Math.floor(fz), N = TERR.N;
  if (i < 0 || j < 0 || i >= N - 1 || j >= N - 1) return 0;
  var u = fx - i, v = fz - j, D = TERR.D, k = j * N + i;
  return (D[k] * (1 - u) + D[k + 1] * u) * (1 - v) + (D[k + N] * (1 - u) + D[k + N + 1] * u) * v;
};
TERR.h = function (x, z) { return VOTH.terrainH(x, z) + TERR.delta(x, z); };
/* one dab of a brush: a smooth falloff to the radius r; raise/lower move by s metres at the centre, smooth pulls
   each cell a fraction s toward the mean of the ground around it. Returns the touched box [x0, z0, x1, z1]. */
TERR.dab = function (m, x, z, r, s) {
  var c = TERR.cell, N = TERR.N, D = TERR.D, E = TERR.ext;
  var i0 = Math.max(1, Math.floor((x - r + E) / c)), i1 = Math.min(N - 2, Math.ceil((x + r + E) / c));
  var j0 = Math.max(1, Math.floor((z - r + E) / c)), j1 = Math.min(N - 2, Math.ceil((z + r + E) / c));
  if (i0 > i1 || j0 > j1) return null;
  var w = function (i, j) { var d = Math.hypot(-E + i * c - x, -E + j * c - z) / r; return d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * d); };
  if (m === 'smooth') {
    /* each cell pulls toward the mean of the (2k+1)^2 cells round it (indices clamped at the grid's edge). The means
       come from a summed-area table over the brush box, so a 400 m brush costs what a small one does */
    var H = function (i, j) { return TERR.baseAt(i, j) + D[j * N + i]; }, upd = [];
    var k2 = Math.max(1, Math.round(r / c / 3)), a0 = i0 - k2, b0 = j0 - k2, W2 = i1 - i0 + 2 * k2 + 1, H2 = j1 - j0 + 2 * k2 + 1;
    var S = new Float64Array((W2 + 1) * (H2 + 1));
    for (var jj = 0; jj < H2; jj++) {
      var row = 0, gj = Math.min(N - 1, Math.max(0, b0 + jj));
      for (var ii = 0; ii < W2; ii++) { row += H(Math.min(N - 1, Math.max(0, a0 + ii)), gj); S[(jj + 1) * (W2 + 1) + ii + 1] = S[jj * (W2 + 1) + ii + 1] + row; }
    }
    var cnt = (2 * k2 + 1) * (2 * k2 + 1);
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
      var wt = w(i, j); if (!wt) continue;
      var x0 = i - k2 - a0, y0 = j - k2 - b0, x1 = x0 + 2 * k2 + 1, y1 = y0 + 2 * k2 + 1;
      var sum = S[y1 * (W2 + 1) + x1] - S[y0 * (W2 + 1) + x1] - S[y1 * (W2 + 1) + x0] + S[y0 * (W2 + 1) + x0];
      upd.push(j * N + i, (sum / cnt - H(i, j)) * Math.min(1, s) * wt);
    }
    for (var q = 0; q < upd.length; q += 2) D[upd[q]] += upd[q + 1];
  } else {
    var sg = m === 'lower' ? -1 : 1;
    for (var j3 = j0; j3 <= j1; j3++) for (var i3 = i0; i3 <= i1; i3++) { var wt3 = w(i3, j3); if (wt3) D[j3 * N + i3] += sg * s * wt3; }
  }
  return [-E + i0 * c, -E + j0 * c, -E + i1 * c, -E + j1 * c];
};
TERR.stroke = function (st) { st.pts.forEach(function (p) { TERR.dab(st.m, p[0], p[1], st.r, st.s); }); };
/* bring the grid in line with the site: replay every stroke when the list changed under it (undo, import) */
TERR.sync = function (strokes, liveCount) {
  strokes = strokes || [];
  if (liveCount != null && liveCount === strokes.length) { TERR.n = strokes.length; return false; }
  TERR.reset(); strokes.forEach(TERR.stroke); TERR.n = strokes.length;
  return true;
};

/* Voth's own districts as they stand in 30a-layout-districts.js, for a starting point */
SITE.fromVoth = function () {
  return VOTH.DISTRICTS.map(function (d) { return { type: SITE.TYPES[d.type] ? d.type : 'misc', name: d.name, note: SITE.TYPES[d.type] ? '' : d.type, poly: d.poly }; });
};
