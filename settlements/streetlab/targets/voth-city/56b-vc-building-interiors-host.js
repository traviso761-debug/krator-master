/* ============================== 6c. HOST: EVERY BUILDING'S INTERIOR, THE DENSITY OVERLAY, THE REPORT ============================== */
/* [draw] The browser side of 41-vc-building-interiors.js (VC.IX):
   - VC.ixProbe: each kit model a lot draws is built once at the origin (its LOD off) and its meshes' boxes handed to the
     data side, which reads its shell off them (VC.ixShellFrom). Then VC.ixPlanAll plans and furnishes every type.
   - VC.ixDraw: a unit's interior, drawn the first time it is cut away: its floors, its walls with their door and window
     gaps, its stairs, its furniture (one InstancedMesh per piece and part, per storey), in a group posed as the lot.
   - The cutaway (x) opens the building nearest the middle of the view when it is nearer than any canton: the same
     clipping planes, the box the building's footprint; the storey keys and buttons step it.
   - The density overlay (n): residents per hectare on a TUNE.ix.density.cell grid, a diverging ramp round the city's
     mean, the homes short of beds hatched; again for workplaces per hectare; again for off.
   - The report (the "interiors report" button): totals, the shortfall by class and district, the job table, the types. */
VC.IXD = { groups: {}, protos: {}, density: 0, cut: null };

/* ---------------------------------------------------------------- the shells: each model's boxes */
VC.ixProbe = function () {
  var t0 = performance.now(), seen = {}, lodOn = KratorLOD.enabled, n = 0, bb = new THREE.Box3();
  KratorLOD.enabled = false;
  PLAN.lots.forEach(function (L) {
    if (L.died != null || !VC.ixProgram(L)) return;
    var k = VC.ixKey(L); if (seen[k] || TUNE.ix.shells[k]) return; seen[k] = 1;
    var A = ASSET_BY_KEY[L.key]; if (!A) return;
    var g = buildAsset(L.key, 0, 0, 0, { variant: L.v, seed: 7 + L.v * 13 + L.slot * 101, wealth: HOST.WEALTH[L.cls] == null ? 0.5 : HOST.WEALTH[L.cls] });
    if (!g) return;
    var boxes = []; g.updateMatrixWorld(true);
    g.traverse(function (m) {
      if (!m.isMesh || !m.geometry) return;
      bb.setFromObject(m); var w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y;
      if (w * d < 4 && h > 1.5) return;
      var t = m.geometry.type, round = /Cylinder|Lathe|Circle|Sphere/.test(t);
      boxes.push({ x: (bb.max.x + bb.min.x) / 2, z: (bb.max.z + bb.min.z) / 2, w: w, d: d, y0: bb.min.y, h: h, round: round });
    });
    scene.remove(g); var i = INSTANCES.indexOf(g); if (i >= 0) INSTANCES.splice(i, 1);
    g.traverse(function (m) { if (m.geometry) m.geometry.dispose(); });
    VC.IX.boxes[k] = { boxes: boxes, dims: entryDims(A, L.v | 0) }; n++;
  });
  KratorLOD.enabled = lodOn;
  VC.IXD.probeMs = Math.round(performance.now() - t0); VC.IXD.probed = n;
  return n;
};
VC.ixStart = function () {
  try {
    VC.ixProbe();
    var t0 = performance.now(); VC.ixPlanAll(); VC.IXD.planMs = Math.round(performance.now() - t0);
    VC.ixReport();
  } catch (e) { console.error('interiors: ' + (e.stack || e)); VC.IX.error = String(e.stack || e); }
};

/* ---------------------------------------------------------------- drawing one unit's interior (in the lot's frame) */
VC.ixFurnProto = function (key, v, wealth) {
  var pk = key + '|' + v, Pr = VC.IXD.protos[pk];
  if (Pr) return Pr;
  var fg = buildFurn(key, 0, 0, 0, { variant: v, seed: 11, y: 0, wealth: wealth });
  if (!fg || fg.userData.error) { if (fg) { scene.remove(fg); var i0 = INSTANCES.indexOf(fg); if (i0 >= 0) INSTANCES.splice(i0, 1); } return (VC.IXD.protos[pk] = { bad: true }); }
  var parts = [], lights = []; fg.updateMatrixWorld(true);
  fg.traverse(function (o) { if (o.isPointLight) lights.push(o); }); lights.forEach(function (l) { if (l.parent) l.parent.remove(l); });
  fg.traverse(function (o) { if (o.isMesh) parts.push({ geo: o.geometry.clone().applyMatrix4(o.matrixWorld), mat: o.material }); });
  scene.remove(fg); var i1 = INSTANCES.indexOf(fg); if (i1 >= 0) INSTANCES.splice(i1, 1);
  return (VC.IXD.protos[pk] = { parts: parts });
};
VC.ixDraw = function (i) {
  if (VC.IXD.groups[i]) return VC.IXD.groups[i];
  var u = VC.IX.units[i], ty = u && VC.IX.types[u.type]; if (!ty || !ty.B) return null;
  var B = ty.B, g = new THREE.Group(); g.userData = { kind: 'interior', unit: i, storeys: {} };
  g.position.set(u.x, u.y + TUNE.interiors.lift, u.z); g.rotation.y = u.ry; g.visible = false; scene.add(g);
  var mat = VC.intMat(), wallC = new THREE.Color(0xd8c9a6), floorC = new THREE.Color(0x8a6a4c), stepC = new THREE.Color(0xa79b82);
  var boxes = {}, add = function (lv, b, col) { (boxes[lv] = boxes[lv] || []).push([b, col]); };
  /* walls: a box per stretch between openings (a door's gap to its head, a window's below its sill and above its head) */
  B.walls.forEach(function (W) {
    var ax = W.a[0], az = W.a[1], L = Math.hypot(W.b[0] - ax, W.b[1] - az); if (L < 0.05) return;
    var ux = (W.b[0] - ax) / L, uz = (W.b[1] - az) / L, cuts = (W.openings || []).map(function (o) { return [o.u - o.w / 2, o.u + o.w / 2, o]; }).sort(function (a, b) { return a[0] - b[0]; });
    var piece = function (s0, s1, y0, y1) { if (s1 - s0 < 0.02 || y1 - y0 < 0.02) return; add(W.level, { s0: s0, s1: s1, ax: ax, az: az, ux: ux, uz: uz, t: W.thick, y0: y0, y1: y1 }, wallC); };
    var s = 0, top = W.y + W.h;
    cuts.forEach(function (c) {
      piece(s, Math.max(s, c[0]), W.y, top);
      var o = c[2], oy0 = W.y + (o.y0 == null ? 0 : o.y0), oy1 = W.y + (o.y1 == null ? 2.1 : o.y1);
      piece(c[0], c[1], W.y, Math.max(W.y, oy0)); piece(c[0], c[1], Math.min(top, oy1), top);
      s = Math.max(s, c[1]);
    });
    piece(s, L, W.y, top);
  });
  /* stairs: treads along the flight */
  (B.stairs || []).forEach(function (S) {
    var foot = S.foot, top = S.top; if (!foot || !top) return;
    var n = Math.max(2, S.risers || Math.round((S.y1 - S.y0) / 0.19)), fx = foot[0], fz = foot[1], L = Math.hypot(top[0] - fx, top[1] - fz) || S.run || 3, ux = (top[0] - fx) / L, uz = (top[1] - fz) / L;
    for (var k = 0; k < n; k++) { var t = (k + 0.5) / n; add(S.from | 0, { s0: L * k / n, s1: L * (k + 1) / n, ax: fx, az: fz, ux: ux, uz: uz, t: S.w || 1, y0: S.y0, y1: S.y0 + (S.y1 - S.y0) * (k + 1) / n }, stepC); }
  });
  var geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  Object.keys(boxes).forEach(function (lv) {
    var Ls = boxes[lv], IM = new THREE.InstancedMesh(geo, mat, Ls.length);
    Ls.forEach(function (e, j) {
      var b = e[0], len = b.s1 - b.s0, m = (b.s0 + b.s1) / 2;
      q.setFromAxisAngle(Y, Math.atan2(-b.uz, b.ux)); pos.set(b.ax + b.ux * m, b.y0, b.az + b.uz * m); sc.set(len, b.y1 - b.y0, b.t);
      m4.compose(pos, q, sc); IM.setMatrixAt(j, m4); IM.setColorAt(j, e[1]);
    });
    IM.userData = { kind: 'interior', unit: i, storey: +lv, probeSkip: true }; g.add(IM); (g.userData.storeys[lv] = g.userData.storeys[lv] || []).push(IM);
  });
  /* floors: each storey's outline as a thin slab (the stair's well left open) */
  (B.floors || []).forEach(function (F) {
    var sh = new THREE.Shape(F.poly.map(function (p) { return new THREE.Vector2(p[0], -p[1]); }));
    (F.holes || []).forEach(function (h) { sh.holes.push(new THREE.Path(h.map(function (p) { return new THREE.Vector2(p[0], -p[1]); }))); });
    var fg = new THREE.ShapeGeometry(sh); fg.rotateX(-Math.PI / 2); fg.translate(0, F.y + 0.01, 0);
    var fm = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: floorC, roughness: 0.95, side: THREE.DoubleSide }));
    fm.userData = { kind: 'interior', unit: i, storey: F.level, probeSkip: true }; g.add(fm); (g.userData.storeys[F.level] = g.userData.storeys[F.level] || []).push(fm);
  });
  /* the furniture */
  var by = {}, wealth = TUNE.ix.wealth[ty.cls] == null ? 0.5 : TUNE.ix.wealth[ty.cls];
  ty.pieces.forEach(function (p, n) { var k = p.key + '|' + p.v + '|' + p.level; (by[k] = by[k] || []).push(Object.assign({ n: n }, p)); });
  var nF = 0, one = new THREE.Vector3(1, 1, 1);
  Object.keys(by).forEach(function (k) {
    var items = by[k], Pr = VC.ixFurnProto(items[0].key, items[0].v, wealth); if (Pr.bad) return;
    Pr.parts.forEach(function (part) {
      var IM = new THREE.InstancedMesh(part.geo, part.mat, items.length);
      items.forEach(function (p, j) { q.setFromAxisAngle(Y, p.ry || 0); pos.set(p.x, p.y, p.z); m4.compose(pos, q, one); IM.setMatrixAt(j, m4); });
      IM.userData = { kind: 'furniture', unit: i, storey: items[0].level, probeSkip: true, items: items };
      g.add(IM); (g.userData.storeys[items[0].level] = g.userData.storeys[items[0].level] || []).push(IM);
    });
    nF += items.length;
  });
  g.userData.stats = { rooms: B.rooms.length, furniture: nF, storeys: B.levels.length };
  if (VC.INTD.planes) g.traverse(function (o) { var ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(function (m) { if (m.clippingPlanes !== VC.INTD.planes) { m.clippingPlanes = VC.INTD.planes; m.clipIntersection = true; m.clipShadows = true; m.needsUpdate = true; } }); });
  VC.IXD.groups[i] = g;
  return g;
};
VC.ixShow = function (i, on, upTo) {
  var g = on ? VC.ixDraw(i) : VC.IXD.groups[i]; if (!g) return;
  g.visible = !!on;
  if (on) Object.keys(g.userData.storeys).forEach(function (s) { g.userData.storeys[s].forEach(function (m) { m.visible = upTo == null || +s <= upTo; }); });
};

/* ---------------------------------------------------------------- the cutaway on any building (56-vc-interiors-host.js) */
VC.ixUnitBox = function (u) {
  var ty = VC.IX.types[u.type], P = ty.shell.poly.map(function (p) { return VC.ixWorldXZ(u, p); });
  return P.reduce(function (b, p) { return [Math.min(b[0], p[0]), Math.max(b[1], p[0]), Math.min(b[2], p[1]), Math.max(b[3], p[1])]; }, [1e9, -1e9, 1e9, -1e9]);
};
VC.cutUnit = function (i, storey) {
  var C = VC.INTD.cut, u = VC.IX.units[i], ty = u && VC.IX.types[u.type]; if (!ty || !ty.B) return;
  if (C.canton) { VC.showInterior(C.canton, false); C.canton = null; }
  if (C.unit != null && C.unit !== i) VC.ixShow(C.unit, false);
  var Lv = ty.B.levels, s = Math.max(0, Math.min(Lv.length - 1, storey | 0));
  C.unit = i; C.storey = s; C.on = true;
  VC.cutPlanes(); VC.ixDraw(i);
  var b = VC.ixUnitBox(u), m = 0.6, fy = u.y + Lv[s].y;
  VC.cutBox([b[0] - m, b[1] + m, b[2] - m, b[3] + m, fy + Math.min(TUNE.interiors.cutAt, Lv[s].h - 0.3)]);
  VC.ixShow(i, true, s);
  VC.cutBar();
};
VC.ixCutWrap = function () {
  var cutTo = VC.cutTo, cutOff = VC.cutOff, cutBar = VC.cutBar, cutPick = VC.cutPick;
  VC.cutTo = function (cn, storey) {
    var C = VC.INTD.cut;
    if (typeof cn === 'number') return VC.cutUnit(cn, storey);
    if (cn == null && C.unit != null) return VC.cutUnit(C.unit, storey);
    if (C.unit != null) { VC.ixShow(C.unit, false); C.unit = null; }
    return cutTo(cn, storey);
  };
  VC.cutOff = function () { var C = VC.INTD.cut; if (C.unit != null) { VC.ixShow(C.unit, false); C.unit = null; } return cutOff(); };
  VC.cutBar = function () {
    var C = VC.INTD.cut; if (C.unit == null || !C.on) return cutBar();
    var bar = $('cutbar'); if (!bar) return; bar.style.display = 'block';
    var u = VC.IX.units[C.unit], ty = VC.IX.types[u.type], Lv = ty.B.levels, A = ASSET_BY_KEY[u.key] || {}, n = Lv.length;
    var rk = ty.B.rooms.filter(function (R) { return R.level === C.storey; }).map(function (R) { return R.kind; }).join(', ');
    $('cut-storey').innerHTML = ' <b>' + (A.name || u.key) + '</b> (' + u.cls + ', ' + u.district + ') storey <b>' + (C.storey + 1) + '</b> of ' + n + ' <span class="k" style="display:inline">' + rk +
      (u.residents ? ' &middot; ' + u.residents + ' residents, ' + u.beds + ' beds of ' + u.need + (u.short ? ' <b style="color:#ff9a7a">short</b>' : '') : '') + '</span> ';
    $('cut-down').disabled = C.storey <= 0; $('cut-up').disabled = C.storey >= n - 1;
    $('cut-down').style.opacity = C.storey <= 0 ? 0.35 : 1; $('cut-up').style.opacity = C.storey >= n - 1 ? 0.35 : 1;
    $('cut-canton').value = '';
    var e = $('cut-status'); if (e) e.textContent = (A.name || u.key) + ', storey ' + (C.storey + 1) + ' of ' + n;
  };
  /* the building whose footprint holds the view's middle (or the nearest within 12 m) when no canton's is nearer */
  VC.cutPick = function () {
    var t = ctl.target, cn = cutPick(), best = null, bd = 12;
    if (cn) { var M = VC.INT.cantons[cn].M; if (Math.hypot(M.x - t.x, M.z - t.z) < (M.apron ? M.apron.ro : M.r)) return cn; }
    VC.IX.units.forEach(function (u) { if (Math.abs(u.x - t.x) > 40 || Math.abs(u.z - t.z) > 40) return; var d = Math.hypot(u.x - t.x, u.z - t.z); if (d < bd && VC.IX.types[u.type].B) { bd = d; best = u.i; } });
    return best != null ? best : cn;
  };
  var sel = $('cut-canton');
  if (sel && !sel.querySelector('option[value=""]')) { var o = document.createElement('option'); o.value = ''; o.textContent = 'a building'; o.disabled = true; sel.insertBefore(o, sel.firstChild); }
};
/* the inspector: a shown building's furniture too (55-vc-host.js VC.pickFurn) */
VC.ixPickWrap = function () {
  var pick = VC.pickFurn;
  VC.pickFurn = function (r) {
    var best = pick(r), rc = new THREE.Raycaster(); rc.ray.copy(r);
    Object.keys(VC.IXD.groups).forEach(function (i) {
      var g = VC.IXD.groups[i]; if (!g.visible) return;
      g.children.forEach(function (m) {
        if (!m.visible || !m.userData.items) return;
        var hit = rc.intersectObject(m, false)[0]; if (!hit || (best && hit.distance >= best.d)) return;
        var p = m.userData.items[hit.instanceId]; if (!p) return;
        var u = VC.IX.units[i], A = ASSET_BY_KEY[u.key] || {};
        best = { d: hit.distance, key: p.key, v: p.v || 0, where: (A.name || u.key) + ', ' + p.kind + ', storey ' + (p.level + 1) };
      });
    });
    return best;
  };
};

/* ---------------------------------------------------------------- the density overlay (n) */
VC.ixDensityGrid = function (mode) {
  var c = TUNE.ix.density.cell, G = {}, ha = c * c / 1e4;
  VC.IX.units.forEach(function (u) {
    var v = mode === 1 ? u.residents : u.jobs; if (!v) return;
    var k = Math.floor(u.x / c) + ',' + Math.floor(u.z / c); G[k] = (G[k] || 0) + v / ha;
  });
  var vals = Object.keys(G).map(function (k) { return G[k]; }), mean = vals.reduce(function (a, b) { return a + b; }, 0) / Math.max(1, vals.length);
  var sorted = vals.slice().sort(function (a, b) { return a - b; }), hi = sorted[Math.floor(sorted.length * 0.97)] || 1;
  return { G: G, c: c, mean: mean, hi: Math.max(hi, mean * 1.5), cells: vals.length };
};
/* the diverging ramp (blue under the mean, orange over it), t in -1..1 */
VC.ixRamp = function (t, a) {
  var lo = [43, 108, 176], mid = [238, 232, 216], hiC = [214, 96, 34], s = Math.max(-1, Math.min(1, t)), e = s < 0 ? lo : hiC, k = Math.abs(s);
  return 'rgba(' + Math.round(mid[0] + (e[0] - mid[0]) * k) + ',' + Math.round(mid[1] + (e[1] - mid[1]) * k) + ',' + Math.round(mid[2] + (e[2] - mid[2]) * k) + ',' + a + ')';
};
VC.ixPaint = function () {
  var mode = VC.IXD.density; if (!mode || !VC.IX.done) return;
  var cv = VIEW.ovCanvas, S = cv.width, E = VIEW.ext, k = S / (2 * E), ctx = cv.getContext('2d');
  var X = function (x) { return (x + E) * k; }, Z = function (z) { return (z + E) * k; };
  var D = VC.ixDensityGrid(mode);
  Object.keys(D.G).forEach(function (key) {
    var ij = key.split(','), v = D.G[key], t = v >= D.mean ? (v - D.mean) / (D.hi - D.mean) : -(D.mean - v) / D.mean;
    ctx.fillStyle = VC.ixRamp(t, 0.82); ctx.fillRect(X(+ij[0] * D.c), Z(+ij[1] * D.c), D.c * k + 0.5, D.c * k + 0.5);
  });
  /* the homes short of beds: their lots, hatched */
  if (mode === 1) {
    ctx.strokeStyle = TUNE.ix.density.hatch; ctx.lineWidth = Math.max(1, k * 0.8);
    VC.IX.units.forEach(function (u) {
      if (!u.short || !u.short.beds) return;
      var L = PLAN.lots[u.lot], C = obbCorners(L.lot); ctx.beginPath(); C.forEach(function (p, j) { if (j) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); ctx.closePath();
      ctx.save(); ctx.clip(); ctx.beginPath();
      var x0 = Math.min.apply(null, C.map(function (p) { return X(p[0]); })), x1 = Math.max.apply(null, C.map(function (p) { return X(p[0]); }));
      var z0 = Math.min.apply(null, C.map(function (p) { return Z(p[1]); })), z1 = Math.max.apply(null, C.map(function (p) { return Z(p[1]); })), st = Math.max(2, k * 3);
      for (var x = x0 - (z1 - z0); x < x1; x += st) { ctx.moveTo(x, z1); ctx.lineTo(x + (z1 - z0), z0); }
      ctx.stroke(); ctx.restore();
    });
  }
  VIEW.ovTex.needsUpdate = true;
  var R = VC.IX.report, lg = $('ixlegend');
  if (lg) {
    var what = mode === 1 ? 'residents' : 'workplaces', tot = mode === 1 ? R.residents : VC.IX.units.reduce(function (a, u) { return a + u.jobs; }, 0);
    lg.innerHTML = '<b>' + (mode === 1 ? 'Residents' : 'Workplaces') + ' per hectare</b> <span class="k">(' + D.c + ' m cells, lot buildings only)</span>' +
      '<div class="ramp" style="background:linear-gradient(90deg,' + VC.ixRamp(-1, 1) + ',' + VC.ixRamp(0, 1) + ',' + VC.ixRamp(1, 1) + ')"></div>' +
      '<div class="k" style="display:flex;justify-content:space-between"><span>0</span><span>mean ' + Math.round(D.mean) + '</span><span>' + Math.round(D.hi) + '+</span></div>' +
      '<div>' + tot.toLocaleString() + ' ' + what + ' in ' + VC.IX.units.length.toLocaleString() + ' buildings, ' + D.cells + ' cells</div>' +
      (mode === 1 ? '<div><i style="background:' + TUNE.ix.density.hatch + '"></i>hatched: homes short of beds (' + R.short.bedUnits + ' homes, ' + R.short.residents.toLocaleString() + ' residents without a bed)</div>' : '') +
      '<div class="k">n: next mode</div>';
  }
};
VC.ixDensityToggle = function () {
  VC.IXD.density = (VC.IXD.density + 1) % 3;
  var b = $('ly-density'); if (b) { b.classList.toggle('on', !!VC.IXD.density); b.textContent = ['density (n)', 'density: residents', 'density: workplaces'][VC.IXD.density]; }
  var lg = $('ixlegend'); if (lg) lg.style.display = VC.IXD.density ? 'block' : 'none';
  VC.paint();
};

/* ---------------------------------------------------------------- the report panel */
VC.ixReportHTML = function () {
  var R = VC.IX.report; if (!R) return VC.IX.error ? '<span class="bad">' + VC.IX.error + '</span>' : 'not computed';
  var f = function (n) { return Math.round(n).toLocaleString(); }, pc = function (a, b) { return b ? Math.round(100 * a / b) + '%' : '-'; };
  var h = '<div class="k">' + f(R.units) + ' buildings of ' + R.types + ' types (a type: one kit model and programme, planned and furnished once) &middot; ' + f(R.rooms) + ' rooms &middot; ' + f(R.pieces) + ' pieces &middot; probe ' + VC.IXD.probeMs + ' ms, plan and furnish ' + VC.IXD.planMs + ' ms</div>';
  h += '<h2>Homes against the residence rule</h2><div class="k">per ' + TUNE.ix.per + ' residents a bed, an item store and a food store; a dining or entertaining room where the plan allows. Residents are the census\'s (TUNE.census.live); the shortfall is reported, not forced.</div>';
  h += '<table><tr><th></th><th>needed</th><th>held</th><th>met</th></tr>';
  ['beds', 'items', 'food'].forEach(function (k) { h += '<tr><td>' + { beds: 'beds', items: 'item stores', food: 'food stores' }[k] + '</td><td class="n">' + f(R.need[k]) + '</td><td class="n">' + f(R.have[k]) + '</td><td class="n ' + (R.have[k] < R.need[k] ? 'bad' : 'ok') + '">' + pc(R.have[k], R.need[k]) + '</td></tr>'; });
  h += '<tr><td>homes with a dining room</td><td class="n">' + f(R.homes) + '</td><td class="n">' + f(R.homes - R.short.dining) + '</td><td class="n">' + pc(R.homes - R.short.dining, R.homes) + '</td></tr></table>';
  h += '<div>' + f(R.short.units) + ' of ' + f(R.homes) + ' homes fall short; about <b>' + f(R.short.residents) + '</b> of ' + f(R.residents) + ' residents have no bed.</div>';
  var tbl = function (o, title) {
    var keys = Object.keys(o).sort(function (a, b) { return o[b].missingBeds - o[a].missingBeds || o[b].residents - o[a].residents; });
    var t = '<h2>' + title + '</h2><table><tr><th></th><th>buildings</th><th>homes</th><th>residents</th><th>beds needed</th><th>beds held</th><th>homes short</th><th>residents without a bed</th></tr>';
    keys.forEach(function (k) { var e = o[k]; t += '<tr><td>' + k + '</td><td class="n">' + f(e.units) + '</td><td class="n">' + f(e.homes) + '</td><td class="n">' + f(e.residents) + '</td><td class="n">' + f(e.need) + '</td><td class="n">' + f(e.beds) + '</td><td class="n ' + (e.short ? 'bad' : '') + '">' + f(e.short) + '</td><td class="n ' + (e.shortResidents ? 'bad' : '') + '">' + f(e.shortResidents) + '</td></tr>'; });
    return t + '</table>';
  };
  h += tbl(R.byClass, 'By lot class') + tbl(R.byDistrict, 'By district');
  /* the job table */
  var kinds = {}; Object.keys(R.jobs).forEach(function (j) { Object.keys(R.jobs[j].kinds).forEach(function (k) { kinds[k] = (kinds[k] || 0) + R.jobs[j].kinds[k].n; }); });
  var cols = Object.keys(kinds).sort(function (a, b) { return kinds[b] - kinds[a]; });
  h += '<h2>The job table (the brief, 1.2)</h2><div class="k">A row per kind of work in the lot buildings, a column per furniture kind in their work rooms (' + TUNE.ix.work.join(', ') + '): pieces placed. Workplaces are the census\'s; the 90% target is phase B\'s rule; a piece is counted as one post for now (phase B gives each its capacity). Hover a cell for the rooms.</div>';
  h += '<table><tr><th>kind of work</th><th>buildings</th><th>workplaces</th><th>90%</th><th>posts</th>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '<th>where (buildings)</th></tr>';
  Object.keys(R.jobs).sort(function (a, b) { return R.jobs[b].jobs - R.jobs[a].jobs; }).forEach(function (j) {
    var J = R.jobs[j], wh = Object.keys(J.where).sort(function (a, b) { return J.where[b] - J.where[a]; }).slice(0, 4).map(function (w) { return w + ' ' + J.where[w]; }).join(', ');
    h += '<tr><td>' + j + '</td><td class="n">' + f(J.units) + '</td><td class="n">' + f(J.jobs) + '</td><td class="n">' + f(J.target) + '</td><td class="n ' + (J.gap < 0 ? 'bad' : 'ok') + '">' + f(J.posts) + '</td>' +
      cols.map(function (c) { var e = J.kinds[c]; return '<td class="n" title="' + (e ? Object.keys(e.rooms).join(', ') : '') + '">' + (e ? f(e.n) : '') + '</td>'; }).join('') + '<td class="k">' + wh + '</td></tr>';
  });
  h += '</table>';
  /* the types: what each shell was read as, so the overrides can be named */
  h += '<h2>The types</h2><div class="k">shell: block (the model\'s main box), round (its main drum), fallback (' + Math.round(TUNE.ix.fallback * 100) + '% of the model\'s footprint: name an override in TUNE.ix.shells), override. ' +
    Object.keys(R.shells).map(function (k) { return k + ' ' + R.shells[k]; }).join(', ') + (R.failed.length ? ' &middot; <span class="bad">failed: ' + R.failed.join('; ') + '</span>' : '') + '</div>';
  h += '<table><tr><th>type</th><th>buildings</th><th>shell</th><th>storeys</th><th>rooms</th><th>beds</th><th>items</th><th>food</th><th>posts</th><th>dropped</th></tr>';
  R.typeList.forEach(function (t) { h += '<tr><td>' + t.type + '</td><td class="n">' + t.units + '</td><td class="' + (t.shell === 'fallback' ? 'bad' : '') + '">' + t.shell + '</td><td class="n">' + t.storeys + '</td><td>' + t.rooms + '</td><td class="n">' + t.beds + '</td><td class="n">' + t.items + '</td><td class="n">' + t.food + '</td><td class="n">' + t.posts + '</td><td class="n">' + (t.dropped || '') + '</td></tr>'; });
  return h + '</table>';
};
VC.ixUI = function () {
  VC.ixCutWrap(); VC.ixPickWrap();
  var paint = VC.paint; VC.paint = function () { paint(); VC.ixPaint(); };
  var b = $('ly-density'); if (b) b.onclick = VC.ixDensityToggle;
  var r = $('ly-ixrep'), P = $('ix');
  if (r && P) r.onclick = function () { var on = P.style.display !== 'block'; P.style.display = on ? 'block' : 'none'; r.classList.toggle('on', on); if (on) $('ix-body').innerHTML = VC.ixReportHTML(); };
  var c = $('ix-close'); if (c) c.onclick = function () { P.style.display = 'none'; if (r) r.classList.remove('on'); };
  window.addEventListener('keydown', function (e) { if (VC.typing(e) || e.ctrlKey || e.metaKey) return; if (e.key === 'n' || e.key === 'N') { VC.ixDensityToggle(); e.preventDefault(); } });
  /* the stats panel's last step: a line on the interiors */
  var stats = VC.stats;
  VC.stats = function () {
    stats();
    var R = VC.IX.report; if (!R || HOST.step !== SL.LAST) return;
    var el = $('stats-body'), d = document.createElement('div'); d.className = 'lg';
    d.innerHTML = '<b>interiors</b> ' + R.units.toLocaleString() + ' buildings, ' + R.pieces.toLocaleString() + ' pieces; beds for ' + Math.round(100 * R.have.beds / Math.max(1, R.need.beds)) + '% of the residents\' need, ' +
      R.short.units.toLocaleString() + ' homes short (<a href="#" id="ix-open" style="color:#e0c98a">report</a>)';
    el.appendChild(d);
    var a = $('ix-open'); if (a) a.onclick = function (e) { e.preventDefault(); if (r) r.onclick(); };
  };
  VC.stats();
};
