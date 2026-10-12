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
var _ixV = new THREE.Vector3();

/* ---------------------------------------------------------------- the shells: each model's boxes */
VC.ixProbe = function () {
  var t0 = performance.now(), seen = {}, lodOn = KratorLOD.enabled, n = 0, bb = new THREE.Box3();
  KratorLOD.enabled = false;
  VC.IX.walks = {};
  PLAN.lots.forEach(function (L) {
    if (L.died != null) return;
    var k = VC.ixKey(L); if (seen[k]) return; seen[k] = 1;
    var A = ASSET_BY_KEY[L.key]; if (!A) return;
    /* the model's stairs and ladders as it builds them (its registry's walkRec: the walk records, phase C), for every
       standing lot; its shell only where it has a programme and no override */
    window.KWALK_REC = [];
    var g = buildAsset(L.key, 0, 0, 0, { variant: L.v, seed: 7 + L.v * 13 + L.slot * 101, wealth: HOST.WEALTH[L.cls] == null ? 0.5 : HOST.WEALTH[L.cls] });
    if (window.KWALK_REC.length) VC.IX.walks[k] = window.KWALK_REC.map(function (r) { return { kind: r.kind, a: r.a.map(VC.r2), b: r.b.map(VC.r2), w: r.w }; });
    window.KWALK_REC = null;
    if (!g) return;
    if (!VC.ixProgram(L) || TUNE.ix.shells[k]) { scene.remove(g); var i0 = INSTANCES.indexOf(g); if (i0 >= 0) INSTANCES.splice(i0, 1); g.traverse(function (m) { if (m.geometry) m.geometry.dispose(); }); return; }
    var boxes = []; g.updateMatrixWorld(true);
    g.traverse(function (m) {
      if (!m.isMesh || !m.geometry) return;
      /* the exact box of its vertices (Box3.setFromObject in r128 turns the geometry's box, so a Voth tapered block, a
         4-sided cylinder turned 45 degrees, read 1.4 times its size) */
      var pa = m.geometry.attributes && m.geometry.attributes.position; if (!pa) return;
      bb.makeEmpty(); for (var j = 0; j < pa.count; j++) { _ixV.fromBufferAttribute(pa, j).applyMatrix4(m.matrixWorld); bb.expandByPoint(_ixV); }
      var w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y;
      if (w * d < 4 && h > 1.5) return;
      var t = m.geometry.type, gp = m.geometry.parameters || {}, round = /Lathe|Circle|Sphere/.test(t) || (/Cylinder/.test(t) && (gp.radialSegments || 8) > 6);
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
  if (mode === 3) return VC.simPaintWork(ctx, X, Z, k);
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
      var ty = VC.IX.types[u.type], C = u.lot >= 0 ? obbCorners(PLAN.lots[u.lot].lot) : ty.shell && ty.shell.poly ? ty.shell.poly.map(function (q) { return VC.ixWorldXZ(u, q); }) : null;
      if (!C) return; ctx.beginPath(); C.forEach(function (p, j) { if (j) ctx.lineTo(X(p[0]), Z(p[1])); else ctx.moveTo(X(p[0]), Z(p[1])); }); ctx.closePath();
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
    lg.innerHTML = '<b>' + (mode === 1 ? 'Residents' : 'Workplaces') + ' per hectare</b> <span class="k">(' + D.c + ' m cells, every building with an interior)</span>' +
      '<div class="ramp" style="background:linear-gradient(90deg,' + VC.ixRamp(-1, 1) + ',' + VC.ixRamp(0, 1) + ',' + VC.ixRamp(1, 1) + ')"></div>' +
      '<div class="k" style="display:flex;justify-content:space-between"><span>0</span><span>mean ' + Math.round(D.mean) + '</span><span>' + Math.round(D.hi) + '+</span></div>' +
      '<div>' + tot.toLocaleString() + ' ' + what + ' in ' + VC.IX.units.length.toLocaleString() + ' buildings, ' + D.cells + ' cells</div>' +
      (mode === 1 ? '<div><i style="background:' + TUNE.ix.density.hatch + '"></i>hatched: homes short of beds (' + R.short.bedUnits + ' homes, ' + R.short.residents.toLocaleString() + ' residents without a bed)</div>' : '') +
      '<div class="k">n: next mode</div>';
  }
};
/* the third mode (phase B): work posts against the rule's 90% of the workplaces, per cell, over every place with work
   (42-vc-sim-places.js): warm where the posts fall short, cool where there is room to spare */
VC.simPaintWork = function (ctx, X, Z, k) {
  var c = TUNE.ix.density.cell, G = {}, tgt = TUNE.sim.target, P = 0, W = 0, n = 0;
  (VC.SIMB.list || []).forEach(function (o) {
    if (!o.job || (!o.posts && !o.workplaces)) return;
    var key = Math.floor(o.x / c) + ',' + Math.floor(o.z / c), e = G[key] || (G[key] = { p: 0, w: 0 }); e.p += o.posts || 0; e.w += (o.workplaces || 0) * tgt; P += o.posts || 0; W += (o.workplaces || 0) * tgt;
  });
  Object.keys(G).forEach(function (key) {
    var e = G[key], ij = key.split(','), t = !e.w ? -1 : e.p >= e.w ? -Math.min(1, (e.p / e.w - 1)) : Math.min(1, 1 - e.p / e.w);
    if (e.p < e.w) n++;
    ctx.fillStyle = VC.ixRamp(t, 0.82); ctx.fillRect(X(+ij[0] * c), Z(+ij[1] * c), c * k + 0.5, c * k + 0.5);
  });
  VIEW.ovTex.needsUpdate = true;
  var lg = $('ixlegend'), A = VC.SIMB.audit || { short: 0 };
  if (lg) lg.innerHTML = '<b>Work posts against ' + Math.round(tgt * 100) + '% of the workplaces</b> <span class="k">(' + c + ' m cells, every place with work)</span>' +
    '<div class="ramp" style="background:linear-gradient(90deg,' + VC.ixRamp(-1, 1) + ',' + VC.ixRamp(0, 1) + ',' + VC.ixRamp(1, 1) + ')"></div>' +
    '<div class="k" style="display:flex;justify-content:space-between"><span>twice the posts</span><span>even</span><span>no posts</span></div>' +
    '<div>' + Math.round(P).toLocaleString() + ' posts for ' + Math.round(W).toLocaleString() + ' (the rule\'s share of ' + Math.round(W / tgt).toLocaleString() + ' workplaces); ' + n + ' cells short; ' + A.short + ' kinds of work short (the report lists them)</div>' +
    '<div class="k">n: next mode</div>';
};
VC.ixDensityToggle = function () {
  VC.IXD.density = (VC.IXD.density + 1) % 4;
  var b = $('ly-density'); if (b) { b.classList.toggle('on', !!VC.IXD.density); b.textContent = ['density (n)', 'density: residents', 'density: workplaces', 'density: work posts'][VC.IXD.density]; }
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
  h += tbl(R.byClass, 'By class') + tbl(R.byDistrict, 'By district');
  /* the buildings off the lots, and the beds where the census houses nobody */
  h += '<h2>The buildings off the lots</h2><div class="k">Voth\'s own builders the city calls (the monastery, the funerary temple), the city\'s shrine and lighthouse models, the chinampas\' stilt huts; the House of Healing as the city furnished its wards.</div>';
  h += '<table><tr><th></th><th>buildings</th><th>rooms</th><th>pieces</th><th>beds</th><th>residents</th><th>workplaces</th><th>posts</th></tr>';
  Object.keys(R.sites).sort().forEach(function (k) { var e = R.sites[k]; h += '<tr><td>' + k + '</td><td class="n">' + f(e.units) + '</td><td class="n">' + f(e.rooms) + '</td><td class="n">' + f(e.pieces) + '</td><td class="n">' + f(e.beds) + '</td><td class="n">' + f(e.residents) + '</td><td class="n">' + f(e.jobs) + '</td><td class="n">' + f(e.posts) + '</td></tr>'; });
  h += '</table>';
  var sp = Object.keys(R.spare);
  if (sp.length) h += '<div>Beds where the census houses nobody (room to spare): ' + sp.map(function (k) { return k + ' ' + f(R.spare[k].beds) + ' in ' + f(R.spare[k].units); }).join('; ') + '. The census counts the chinampa growers\' work but not their homes.</div>';
  /* the new kit models, not placed yet (phase B) */
  if (R.kit && R.kit.length) {
    h += '<h2>The new kit models (placed in phase B)</h2><div class="k">The watchhouse, caravanserai, coast-guard berth and the chains\' trades (kits/catalog/krator-master-buildings-voth.js), each with its own shell, planned as a lot of the class named in TUNE.ix.kitCheck.</div>';
    h += '<table><tr><th>model</th><th>class</th><th>storeys</th><th>rooms</th><th>pieces</th><th>beds</th><th>posts</th><th>work furniture</th></tr>';
    R.kit.forEach(function (k) { h += '<tr><td>' + (k.name || k.key) + ' <span class="k">' + k.key + '</span></td><td>' + (k.cls || '') + '</td><td class="n">' + (k.storeys || '') + '</td><td>' + (k.rooms || '<span class="bad">' + k.fail + '</span>') + '</td><td class="n">' + (k.pieces || 0) + '</td><td class="n">' + (k.beds || 0) + '</td><td class="n">' + (k.posts || 0) + '</td><td class="k">' + Object.keys(k.work || {}).map(function (w) { return w + ' ' + k.work[w]; }).join(', ') + '</td></tr>'; });
    h += '</table>';
  }
  /* the job table */
  var kinds = {}; Object.keys(R.jobs).forEach(function (j) { Object.keys(R.jobs[j].kinds).forEach(function (k) { kinds[k] = (kinds[k] || 0) + R.jobs[j].kinds[k].n; }); });
  var cols = Object.keys(kinds).sort(function (a, b) { return kinds[b] - kinds[a]; });
  h += '<h2>The job table (the brief, 1.2)</h2><div class="k">A row per kind of work in the lot buildings, a column per furniture kind in their work rooms (' + TUNE.ix.work.join(', ') + '): the posts they give (TUNE.sim.posts by kind and size, as the 90% table above counts them). Workplaces are the census\'s. The buildings only: the canton rooms and the outdoor work are in the 90% table. Hover a cell for the rooms.</div>';
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
/* phase B (42-vc-sim-places.js): the buildings placed, the wells, the places by kind, the 90% rule */
VC.simReportHTML = function () {
  var S = VC.SIMB || {}, A = S.audit; if (!A) return S.error ? '<span class="bad">' + S.error + '</span>' : '';
  var f = function (n) { return Math.round(n).toLocaleString(); };
  var h = '<h2>Phase B: the citizens\' buildings, the wells, the places</h2><div>' + (S.log || []).join('; ') + '.</div>';
  var w = S.wellCount || {};
  h += '<div>' + f((S.wells || []).length) + ' wells placed (' + (w.market || 0) + ' in market squares, ' + (w.plaza || 0) + ' on plazas, ' + (w.street || 0) + ' along the streets), ' + (w.yard || 0) + ' private ones in manor and clan courtyards.</div>';
  var g = {}; (S.list || []).forEach(function (o) { var k = /^ix\./.test(o.id) ? (o.kind === 'home' ? 'homes' : 'buildings at work') : /^room\./.test(o.id) ? 'canton rooms' : /^well\./.test(o.id) ? 'wells' : /^open\./.test(o.id) ? 'parks, markets, burial grounds' : 'outdoor work'; g[k] = (g[k] || 0) + 1; });
  h += '<div>' + f(S.places || 0) + ' simulation places: ' + Object.keys(g).map(function (k) { return f(g[k]) + ' ' + k; }).join(', ') + ' (core/simulation SIM.place: activities from the furniture, opening hours, pull, work posts).</div>';
  h += '<h2>Work posts against the 90% rule</h2><div class="k">The brief (1.2): work furniture for at least ' + Math.round(TUNE.sim.target * 100) + '% of the workplaces at once. Posts: a building\'s work pieces at TUNE.sim.posts each; a canton room\'s and the outdoor work\'s (fields, docks, mines, the wall) are the census\'s own numbers. ' +
    f(A.total.posts) + ' of the ' + f(A.total.target) + ' posts the rule asks for stand; ' + A.short + ' kinds of work fall short.</div>';
  h += '<table><tr><th>kind of work</th><th>workplaces</th><th>90%</th><th>posts</th><th>in buildings</th><th>canton rooms</th><th>outdoor</th><th>short</th><th>buildings with the most floor per post</th></tr>';
  A.rows.forEach(function (r) {
    h += '<tr><td>' + r.job + '</td><td class="n">' + f(r.workplaces) + '</td><td class="n">' + f(r.target) + '</td><td class="n ' + (r.short ? 'bad' : 'ok') + '">' + f(r.posts) + '</td><td class="n">' + f(r.building) + '</td><td class="n">' + f(r.canton) + '</td><td class="n">' + f(r.outdoor) + '</td><td class="n ' + (r.short ? 'bad' : '') + '">' + (r.short ? f(r.short) : '') + '</td><td class="k">' +
      (r.room || []).slice(0, 3).map(function (x) { return x.name + ' (' + x.district + ', ' + x.floor + ' m\u00b2 for ' + Math.round(x.posts) + ')'; }).join('; ') + '</td></tr>';
  });
  return h + '</table>';
};
/* phase C: the citizens and the pedestrian layer (43-vc-sim-nav.js, 44-vc-sim-people.js) */
VC.peopleReportHTML = function () {
  var R = VC.PEOPLE, P = VC.PED || {}, A = P.audit; if (!R) return P.error ? '<span class="bad">' + P.error + '</span>' : '';
  var f = function (n) { return Math.round(n || 0).toLocaleString(); }, cm = function (c) { return c ? f(c.p50) + ' / ' + f(c.p90) : ''; };
  var h = '<h2>Phase C: the citizens</h2><div>' + f(R.citizens) + ' citizens as simulation actors (the census: ' + f(R.census) + ') in ' + f(R.homes) + ' homes: ' + f(R.workers) + ' of working age, ' + f(R.dependants) + ' dependants; and ' +
    f(R.slaves) + ' slaves on the farms, mines and quarries (' + Math.round(TUNE.sim.people.slaveShare * 100) + '% of their labour), outside the census, housed at ' + f(R.quarters) + ' sites whose quarters are not built.</div>';
  h += '<div>Employed ' + f(R.employed) + ' (' + Object.keys(R.how).map(function (k) { return f(R.how[k]) + ' ' + k; }).join(', ') + '); <span class="' + (R.unemployed ? 'bad' : 'ok') + '">' + f(R.unemployed) + ' out of work</span> (no free post within ' + f(R.walkMax) + ' m walked); ' +
    f(R.gentry) + ' of the gentry live on their means; ' + f(R.unfilled) + ' posts unfilled. ' + f(R.floorSleepers) + ' residents sleep on the floor (their homes\' beds fall short: phase A). The deal took ' + R.rounds + ' searches of the pedestrian layer and ' + f(R.ms) + ' ms.</div>';
  h += '<div class="k">Commutes are metres walked on the pedestrian layer (stairs count ' + TUNE.sim.nav.cost.stairs + ' times), live-in work none: all ' + cm(R.commute) + ' m (median / 90th percentile).</div>';
  if (R.unemployedBy && R.unemployedBy.length) h += '<div>Out of work, by district (worst first): ' + R.unemployedBy.map(function (x) { return x[0] + ' ' + f(x[1]); }).join(', ') + '.</div>';
  h += '<table><tr><th>class</th><th>people</th><th>of working age</th><th>employed</th><th>on their means</th><th>commute m</th></tr>';
  Object.keys(R.byClass).sort(function (a, b) { return R.byClass[b].people - R.byClass[a].people; }).forEach(function (k) { var C = R.byClass[k];
    h += '<tr><td>' + k + '</td><td class="n">' + f(C.people) + '</td><td class="n">' + f(C.workers) + '</td><td class="n">' + f(C.employed) + '</td><td class="n">' + f(C.gentry) + '</td><td class="n">' + cm(C.commute) + '</td></tr>'; });
  h += '</table><table><tr><th>kind of work</th><th>posts</th><th>filled</th><th>how</th><th>unfilled</th><th>commute m</th></tr>';
  Object.keys(R.byJob).sort(function (a, b) { return R.byJob[b].posts - R.byJob[a].posts; }).forEach(function (k) { var J = R.byJob[k], U = R.unfilledByJob[k];
    h += '<tr><td>' + k + '</td><td class="n">' + f(J.posts) + '</td><td class="n">' + f(J.filled) + '</td><td>' + Object.keys(J.how).map(function (x) { return f(J.how[x]) + ' ' + x; }).join(', ') + '</td><td class="n ' + (U ? 'bad' : 'ok') + '">' + (U ? f(U.posts) + ' at ' + U.places : '') + '</td><td class="n">' + cm(J.commute) + '</td></tr>'; });
  h += '</table>';
  /* the run (56c): the week, now, and the day's samples */
  if (VC.SIMRUN && VC.SIMRUN.steps != null && typeof SIM !== 'undefined') {
    var S = VC.SIMRUN, W = TUNE.sim.week, now = VC.simCensusNow(), ms = S.ms.slice().sort(function (a, b) { return a - b; }), roles = SIM.all('role');
    var u = function (o) { return Object.keys(o || {}).sort(function (a, b) { return o[b] - o[a]; }).map(function (k) { return k + ' ' + f(o[k]); }).join(', ') || 'none'; };
    h += '<h2>The week, running</h2><div>Every citizen is stepped once a simulated minute (at most ' + f(TUNE.sim.run.stepMax) + ' decisions a minute; a walk is decided from the straight line and its path found when it is drawn). ' +
      'Day ' + (W.rest + 1) + ' is the rest day for all but ' + W.essential.length + ' essential kinds of work; every worker has a rota day off among the other six. ' + roles.length + ' roles on ' +
      roles.filter(function (r) { return r.shift; }).length + ' shifts. Steps so far ' + f(S.steps) + ', median ' + (ms.length ? ms[ms.length >> 1].toFixed(1) : '-') + ' ms; the last jump ' + f(S.jumpMs) + ' ms.</div>';
    h += '<div>Now (day ' + (SIM.weekday() + 1) + ' of 7): ' + u(now.by) + '; walking ' + f(now.moving) + '; decisions waiting ' + f(now.pending) + '. <span class="bad">Wanted and not had: ' + u(now.unmet) + '</span> (the free-time places are full or farther than ' + f(TUNE.sim.run.reach) + ' m).</div>';
    var Wn = VC.simWorshipNeed ? VC.simWorshipNeed() : null;
    if (Wn) h += '<div>Worship on the rest day at ' + Wn.hour + ':00: ' + f(Wn.want) + ' want it, <span class="bad">room for ' + f(Wn.room) + ' at once</span> (a shrine holds ' + f(Wn.shrineRoom) + ', the largest place ' + f(Wn.largestRoom) + '; the Temple canton is not counted yet). To hold the rest: ' +
      Wn.options.map(function (o) { return o.services + ' service' + (o.services > 1 ? 's' : '') + ', ' + Math.round(o.attend * 100) + '% attending: ' + f(o.shrines) + ' more shrines (or ' + f(o.largest) + ' of the largest)'; }).join('; ') + '.</div>';
    h += '<div>Company at home now: ' + f(now.visiting) + ' visiting housemates or neighbours (no room out).</div>';
    var days = Object.keys(S.days); if (days.length) {
      h += '<table><tr><th>day</th><th>hour</th><th>doing</th><th>wanted, not had</th></tr>';
      days.slice(-7).forEach(function (d) { Object.keys(S.days[d]).forEach(function (hh) { var c = S.days[d][hh]; h += '<tr><td>' + (+d + 1) + '</td><td>' + hh + ':00</td><td>' + u(c.by) + '</td><td>' + u(c.unmet) + '</td></tr>'; }); });
      h += '</table>';
    }
  }
  if (A) {
    var C = P.cant || {};
    h += '<h2>The pedestrian layer</h2><div>' + f(A.nodes) + ' nodes, ' + f(A.edges) + ' edges in ' + A.bodies + ' connected bod' + (A.bodies === 1 ? 'y' : 'ies') + ': the streets (' + f(P.crossings) + ' crossings, ' + f(P.joins) + ' street ends joined where they meet, ' +
      f(P.reached) + ' alley and lane ends reached over, ' + f(P.plazas) + ' plazas as hubs), the park walks, the cantons (' + C.rings + ' terraces, ' + C.decks + ' top decks, ' + C.flights + ' flights, ' + C.spans + ' bridges, ' + C.causeways + ' causeways, ' + C.doors + ' doors). Built in ' + f(P.ms) + ' ms.</div>';
    var far = Object.keys(A.far || {}).map(function (k) { return k + ' ' + A.far[k]; });
    h += '<div>Off the network (a door more than ' + TUNE.sim.nav.far + ' m past the place\'s reach from its node): ' + (far.length ? far.join(', ') : 'none') + '. Not joined yet: ' + f(A.cantonRooms) + ' canton rooms (inside the tiers: the canton interiors\' own graph), ' +
      f(A.chinampaHuts) + ' chinampa huts (on the beds: by kayak, the water layer). ' + (C.unjoined && C.unjoined.length ? 'Canton links not joined: ' + C.unjoined.join(', ') + '.' : '') + '</div>';
    var ws = VC.simWalkSample(200);
    h += '<div class="k">A* check: ' + ws.ok + ' of ' + ws.routes + ' sampled commutes routed (median ' + f(ws.p50) + ' m, 90th percentile ' + f(ws.p90) + ' m, ' + ws.ms + ' ms).</div>';
  }
  return h;
};
VC.ixUI = function () {
  VC.ixCutWrap(); VC.ixPickWrap();
  var paint = VC.paint; VC.paint = function () { paint(); VC.ixPaint(); };
  var b = $('ly-density'); if (b) b.onclick = VC.ixDensityToggle;
  var r = $('ly-ixrep'), P = $('ix');
  if (r && P) r.onclick = function () { var on = P.style.display !== 'block'; P.style.display = on ? 'block' : 'none'; r.classList.toggle('on', on); if (on) $('ix-body').innerHTML = VC.peopleReportHTML() + VC.simReportHTML() + VC.ixReportHTML(); };
  var c = $('ix-close'); if (c) c.onclick = function () { P.style.display = 'none'; if (r) r.classList.remove('on'); };
  window.addEventListener('keydown', function (e) { if (VC.typing(e) || e.ctrlKey || e.metaKey) return; if (e.key === 'n' || e.key === 'N') { VC.ixDensityToggle(); e.preventDefault(); } });
  /* the stats panel's last step: a line on the interiors */
  var stats = VC.stats;
  VC.stats = function () {
    stats();
    var R = VC.IX.report; if (!R || HOST.step !== SL.LAST) return;
    var el = $('stats-body'), d = document.createElement('div'); d.className = 'lg';
    d.innerHTML = '<b>interiors</b> ' + R.units.toLocaleString() + ' buildings, ' + R.pieces.toLocaleString() + ' pieces; beds for ' + Math.round(100 * R.have.beds / Math.max(1, R.need.beds)) + '% of the residents\' need, ' +
      R.short.units.toLocaleString() + ' homes short' + (VC.PEOPLE ? '; <b>citizens</b> ' + VC.PEOPLE.citizens.toLocaleString() + ', ' + VC.PEOPLE.employed.toLocaleString() + ' at work, ' + VC.PEOPLE.unemployed.toLocaleString() + ' out of work' : '') + ' (<a href="#" id="ix-open" style="color:#e0c98a">report</a>)';
    el.appendChild(d);
    var a = $('ix-open'); if (a) a.onclick = function (e) { e.preventDefault(); if (r) r.onclick(); };
  };
  VC.stats();
};
