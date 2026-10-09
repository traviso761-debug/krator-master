/* ============================== 3. THE SITE: GROUND, LANDMARKS, DISTRICTS, AVENUES, HIGHWAYS, WALL ============================== */
/* [G data] The owner's layout (site/voth-site.json, drawn in the site editor) read into the plan. Markers name
   the landmarks: A-E shrines, F G H the harbour, spirit and river gates, LH the small lighthouse, I the garrison
   castle and mustering ground, HOH the house of healing, FUNERARY TEMPLE the funerary temple. District names give
   roles: build zone, wall, harbor, industry, warehouse, river port, monastery. */
var VC = { prims: {}, gates: [], wall: null };

VC.role = function (d) {
  if (d.type === 'park' || d.type === 'market' || d.type === 'plaza' || d.type === 'funerary') return d.type;
  var n = (d.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (/build ?zone/.test(n)) return 'zone';
  if (n === 'wall') return 'wall';
  if (/harbou?r/.test(n)) return 'harbor';
  if (/industr/.test(n)) return 'industry';
  if (/warehouse/.test(n)) return 'warehouse';
  if (/river ?port/.test(n)) return 'riverport';
  if (/monaster|abbey/.test(n)) return 'monastery';
  if (/clan/.test(n)) return 'clan';
  if (/chinampa.*(exclu|no)/.test(n)) return 'nochin';
  if (/^mines?\b/.test(n)) return 'mines';
  if (/quarr/.test(n)) return 'quarry';
  if (/mush/.test(n)) return 'mushfarm';
  if (/farm/.test(n)) return 'farms';
  return 'misc';
};
VC.marker = function (re) { return SITE.data.markers.filter(function (m) { return re.test(m.id); })[0] || null; };
VC.districts = function (role) { return PLAN.site.filter(function (d) { return d.role === role; }); };
VC.roleAt = function (p) {
  var best = null, ba = Infinity;
  PLAN.site.forEach(function (d) {
    if (d.role === 'zone' || d.role === 'wall' || d.role === 'misc' || d.role === 'nochin' || d.role === 'mines' || d.role === 'quarry' || d.role === 'farms' || d.role === 'mushfarm') return;
    if (inPoly(p, d.poly)) { var a = Math.abs(polyArea(d.poly)); if (a < ba) { ba = a; best = d.role; } }
  });
  return best || (VC.outside(p) ? 'suburb' : 'res');
};
/* the user's avenues (and the rings), nearest point */
VC.nearestWayPt = function (p, cls, skipId) {
  var best = null, bd = Infinity;
  PLAN.ways.forEach(function (w) {
    if (cls && cls.indexOf(w.cls) < 0) return; if (w.id === skipId) return;
    var q = w.F.nearest(p); if (q.d < bd) { bd = q.d; best = { way: w, s: q.s, p: w.F.at(q.s), d: q.d }; }
  });
  return best;
};
/* Voth's faceToward: the heading Voth's own builders take to face a point */
VC.face = function (x, z, tx, tz) { return Math.atan2(-(tz - z), tx - x); };

/* ---------------------------------------------------------------- step 0: the ground, the raster, the build zone */
SL.pass0 = function () {
  SITE.load(SITE_INIT);
  TERR.sync(SITE.data.terrain);
  VOTH.setGroundEdit(TERR.delta);
  var emb = VC.embank();
  var c = TUNE.groundCell, half = TUNE.rasterHalf, n = Math.ceil(2 * half / c) + 1, H = new Float32Array(n * n);
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) H[j * n + i] = TERR.h(-half + i * c, -half + j * c);
  SL.ground = { c: c, half: half, n: n, h: H };
  PLAN.site = SITE.data.districts.map(function (d) { return { id: d.id, name: d.name, type: d.type, role: VC.role(d), poly: d.poly, note: d.note }; });
  var zone = VC.districts('zone')[0];
  PLAN.zone = zone ? zone.poly : [[-half, -half], [half, -half], [half, half], [-half, half]];
  var wallD = VC.districts('wall')[0];
  VC.wallPoly = wallD ? wallD.poly : null;
  VC.wallChain = VC.wallPoly ? VC.westChain(VC.wallPoly) : null;
  SL.R = new Raster(half, TUNE.cell);
  var R = SL.R, land = 0;
  R.occ.fill(OCC.OUT);
  /* dry ground in the zone, unless too steep to build on (over TUNE.maxSlope: hillsides stay open) */
  var ms2 = TUNE.maxSlope * TUNE.maxSlope;
  R.eachInPoly(PLAN.zone, function (k, i, jj) {
    var x = R.cx(i), z = R.cx(jj), h = baseH(x, z); if (h <= 0.6) return;
    var gx = (baseH(x + 5, z) - baseH(x - 5, z)) / 10, gz = (baseH(x, z + 5) - baseH(x, z - 5)) / 10;
    if (gx * gx + gz * gz > ms2) return;
    R.occ[k] = OCC.FREE; land++;
  });
  var mid = SL.items('middle').map(function (it) { return it.d + TUNE.lot.setback + TUNE.lot.rear; });
  SL.minSpacing = Math.min.apply(null, mid) + TUNE.width.main / 2 + TUNE.width.side / 2;
  PLAN.zoneLand = land * R.c * R.c;
  SL.note(0, 'site: ' + PLAN.site.length + ' districts, ' + SITE.data.markers.length + ' markers, ' + SITE.data.avenues.length + ' avenues, ' +
    SITE.data.terrain.length + ' ground strokes' + (emb ? ', ' + emb + ' m of avenue edge banked up out of the water' : '') + '; build zone ' + (Math.abs(polyArea(PLAN.zone)) / 1e6).toFixed(2) + ' km2, ' + (PLAN.zoneLand / 1e6).toFixed(2) + ' km2 of it dry land');
};

/* an avenue drawn a little into the water (the owner's avenue along the river) gets a bank under it: the ground is
   raised just enough that the avenue runs on the water's edge, with a short slope down to the water. Deep water
   (a bridge or a causeway's line) is left alone. Edits TERR's delta grid, so the ground, the street passes and
   Voth's own builders all see the same bank. */
VC.embank = function () {
  var E = TUNE.embank, N = TERR.N, cs = TERR.cell, run = 0;
  SITE.data.avenues.forEach(function (a) {
    resample(a.pts, 3, false).forEach(function (p) {
      var h = TERR.h(p[0], p[1]); if (h >= E.top || h < E.deepest) return;
      run += 3;
      var R = E.core + E.feather, i0 = Math.floor((p[0] - R + TERR.ext) / cs), i1 = Math.ceil((p[0] + R + TERR.ext) / cs), j0 = Math.floor((p[1] - R + TERR.ext) / cs), j1 = Math.ceil((p[1] + R + TERR.ext) / cs);
      for (var j = Math.max(0, j0); j <= Math.min(N - 1, j1); j++) for (var i = Math.max(0, i0); i <= Math.min(N - 1, i1); i++) {
        var x = -TERR.ext + i * cs, z = -TERR.ext + j * cs, d = Math.hypot(x - p[0], z - p[1]); if (d > R) continue;
        var want = E.top - Math.max(0, d - E.core) * E.slope, k = j * N + i, now = TERR.baseAt(i, j) + TERR.D[k];
        if (want > now) TERR.D[k] += want - now;
      }
    });
  });
  return run;
};

/* a gate on a slope gets a level pad: the ground under its footprint (the model's own half-sizes, local x along the
   passage, local z across it, plus a margin) is cut and filled to the road's height at its centre, and beyond the
   pad it meets the natural ground at no more than TUNE.wall.padSlope (a cutting uphill, a bank downhill). Without it
   a gate built at its lowest corner is buried on the uphill side (the River Gate, 8 m deep). Edits TERR's delta and
   SL.ground over the touched box, so the ground mesh and every later pass see the pad. Returns the pad's height, or
   null when the footprint is level enough already. */
VC.GATE_SIZE = { RiverGate: [3.9, 16.8], HarborGate: [4.2, 18.1], SpiritGate: [3.6, 15.8] };
VC.levelGate = function (n) {
  var T = TUNE.wall, sz = VC.GATE_SIZE[n.name] || [T.gateTower * 0.56, (n.towerOff || 15) + T.gateTower * 0.56];
  var hw = sz[0] + T.padMargin, hd = sz[1] + T.padMargin, cs = Math.cos(n.ry), sn = Math.sin(n.ry);
  var y = Math.max(0.6, TERR.h(n.gx, n.gz)), lo = Infinity, hi = -Infinity;
  [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]].forEach(function (s) {
    var h = TERR.h(n.gx + s[0] * hw * cs + s[1] * hd * sn, n.gz - s[0] * hw * sn + s[1] * hd * cs); lo = Math.min(lo, h); hi = Math.max(hi, h);
  });
  if (hi - lo < T.padSpread) return null;
  var N = TERR.N, c = TERR.cell, E = TERR.ext, R = Math.hypot(hw, hd) + (hi - lo) / T.padSlope + c;
  var i0 = Math.max(0, Math.floor((n.gx - R + E) / c)), i1 = Math.min(N - 1, Math.ceil((n.gx + R + E) / c));
  var j0 = Math.max(0, Math.floor((n.gz - R + E) / c)), j1 = Math.min(N - 1, Math.ceil((n.gz + R + E) / c));
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
    var dx = -E + i * c - n.gx, dz = -E + j * c - n.gz, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
    var d = Math.hypot(Math.max(0, Math.abs(lx) - hw), Math.max(0, Math.abs(lz) - hd)), k = j * N + i;
    var now = TERR.baseAt(i, j) + TERR.D[k], want = clamp(now, y - d * T.padSlope, y + d * T.padSlope);
    TERR.D[k] += want - now;
  }
  var G = SL.ground, gi0 = Math.max(0, Math.floor((n.gx - R + G.half) / G.c)), gi1 = Math.min(G.n - 1, Math.ceil((n.gx + R + G.half) / G.c));
  var gj0 = Math.max(0, Math.floor((n.gz - R + G.half) / G.c)), gj1 = Math.min(G.n - 1, Math.ceil((n.gz + R + G.half) / G.c));
  for (var gj = gj0; gj <= gj1; gj++) for (var gi = gi0; gi <= gi1; gi++) G.h[gj * G.n + gi] = TERR.h(-G.half + gi * G.c, -G.half + gj * G.c);
  n.pad = { y: y, cut: hi - y, fill: y - lo };
  return y;
};

/* the wall line: the western edge of the 'wall' polygon, from its northernmost corner to its southernmost */
VC.westChain = function (P) {
  var n = P.length, iN = 0, iS = 0;
  for (var i = 1; i < n; i++) { if (P[i][1] < P[iN][1]) iN = i; if (P[i][1] > P[iS][1]) iS = i; }
  var a = [], b = [];
  for (var k = iN; ; k = (k + 1) % n) { a.push(P[k]); if (k === iS) break; }
  for (var k2 = iN; ; k2 = (k2 - 1 + n) % n) { b.push(P[k2]); if (k2 === iS) break; }
  var mx = function (L) { return L.reduce(function (s, p) { return s + p[0]; }, 0) / L.length; };
  return (mx(a) < mx(b) ? a : b).map(function (p) { return [p[0], p[1]]; });
};
/* outside the wall: east of the wall line (the line runs north to south; its outward normal points east) */
VC.outside = function (p) {
  var C = VC.wallLine || VC.wallChain; if (!C) return false;
  if (p[1] < C[0][1] - 60 || p[1] > C[C.length - 1][1] + 60) return VC.wallPoly ? inPoly(p, VC.wallPoly) : false;
  var bd = Infinity, side = 0;
  for (var i = 1; i < C.length; i++) {
    var a = C[i - 1], b = C[i], d = segDist(p, a, b);
    if (d < bd) { bd = d; side = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]); }
  }
  return side < 0;
};

/* ---------------------------------------------------------------- step 1: landmarks from the markers */
VC.fixed = function (role, spec, c, f, step) {
  var D = SL.dims(spec.key, spec.v); if (!D) return null;
  var o = obb(c, [f[1], -f[0]], D.w / 2, D.d / 2);
  var L = { id: PLAN.lots.length, cls: 'landmark', role: role, key: spec.key, v: spec.v, slot: 0, wealth: 1, x: c[0], z: c[1], y: addPad(o) - 0.1,
            ry: ryFacing(f), w: D.w, d: D.d, h: D.h, lot: o, bo: o, way: -1, side: 0, s: 0, born: step, died: null, civic: true };
  PLAN.lots.push(L); SL.hashLot(L);
  SL.R.stampPoly(obbCorners(obb(c, o.u, o.hw + 3, o.hd + 3)), OCC.HARD, L.id);
  return L;
};
VC.hardSquare = function (x, z, half, ry) { SL.R.stampPoly(obbCorners(obb([x, z], [Math.cos(ry || 0), -Math.sin(ry || 0)], half, half)), OCC.HARD, -1); };
VC.towardAvenue = function (p) {
  var best = null, bd = Infinity;
  SITE.data.avenues.forEach(function (a) { for (var i = 1; i < a.pts.length; i++) { var q = a.pts[i - 1], r = a.pts[i], d = segDist(p, q, r); if (d < bd) { bd = d; var e = V.sub(r, q), t = clamp(V.dot(V.sub(p, q), e) / (V.dot(e, e) || 1), 0, 1); best = V.add(q, V.mul(e, t)); } } });
  return best || [0, 0];
};
SL.pass1 = function () {
  PLAN.landmarks = [];
  var I = VC.marker(/^I$/i);
  if (I) {
    var a = VC.towardAvenue([I.x, I.z]), f = V.norm(V.sub(a, [I.x, I.z]));
    var gar = VC.fixed('garrison', { key: 'voth_garrison', v: 0 }, [I.x, I.z], f, 1);
    var MD = SL.dims('voth_mustering_grounds', 0);
    var mc = V.add([I.x, I.z], V.mul(f, gar.d / 2 + 6 + MD.d / 2));
    var mus = VC.fixed('muster', { key: 'voth_mustering_grounds', v: 0 }, mc, V.mul(f, -1), 1);
    PLAN.landmarks.push(gar, mus);
  }
  /* the Voth-built landmarks: positions here, built by 31-vc-voth.js */
  var isle = function (m, kind) { return VOTH.ISLES.filter(function (q) { return q[4] === kind && Math.hypot(q[0] - m.x, q[1] - m.z) < q[3] * 1.3; })[0]; };
  PLAN.voth = [];
  ['A', 'B', 'C', 'D', 'E'].forEach(function (id) {
    var m = VC.marker(new RegExp('^' + id + '$', 'i')); if (!m) return;
    if (isle(m, 'shrine')) { PLAN.voth.push({ role: 'shrine', id: id, x: m.x, z: m.z, islet: true }); return; }
    var a = VC.towardAvenue([m.x, m.z]);
    PLAN.voth.push({ role: 'shrine', id: id, x: m.x, z: m.z, ry: VC.face(m.x, m.z, a[0], a[1]), rad: 37.8 });
    VC.hardSquare(m.x, m.z, 22);
  });
  var LH = VC.marker(/^LH$/i);
  if (LH) PLAN.voth.push({ role: 'lighthouse', id: 'LH', x: LH.x, z: LH.z, islet: !!isle(LH, 'light') });
  var H = VC.marker(/^HOH$/i);
  if (H) { var ah = VC.towardAvenue([H.x, H.z]); PLAN.voth.push({ role: 'healing', id: 'HOH', x: H.x, z: H.z, ry: VC.face(H.x, H.z, ah[0], ah[1]) }); VC.hardSquare(H.x, H.z, 62); }
  var FT = VC.marker(/FUNER/i);
  if (FT) { var T = VOTH.CIDX.Temple; PLAN.voth.push({ role: 'funeraryTemple', id: FT.id, x: FT.x, z: FT.z, ry: VC.face(FT.x, FT.z, T.x, T.z) }); VC.hardSquare(FT.x, FT.z, 40); }
  SL.note(1, (I ? 'garrison castle and mustering ground at I; ' : '') + PLAN.voth.map(function (q) { return q.id + ' ' + q.role + (q.islet ? ' (islet)' : ''); }).join(', '));
};

/* ---------------------------------------------------------------- step 2: districts */
SL.pass2 = function () {
  var R = SL.R, rs = SL.stream(2);
  PLAN.districts = [];
  PLAN.site.forEach(function (d) {
    var D = { kind: d.role, name: d.name, poly: d.poly, born: 2, art: [] };
    if (d.role === 'park' || d.role === 'plaza') R.stampPoly(d.poly, OCC.GREEN, -1);
    else if (d.role === 'market' || d.role === 'monastery' || d.role === 'funerary') R.stampPoly(d.poly, OCC.HARD, -1);
    if (d.role === 'market') {
      /* stalls on a jittered grid, clear of the edge, facing the middle */
      var c = polyCentroid(d.poly), STALLS = ['voth_city_stall_fruit', 'voth_city_stall_cheese', 'voth_city_stall_exotic', 'voth_city_stall_bread'];
      var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; });
      for (var x = Math.min.apply(null, xs); x < Math.max.apply(null, xs); x += 9) for (var z = Math.min.apply(null, zs); z < Math.max.apply(null, zs); z += 9) {
        var p = [x + rs.rr(-1.5, 1.5), z + rs.rr(-1.5, 1.5)];
        if (!inPoly(p, d.poly) || polyEdgeDist(p, d.poly) < 6 || !rs.chance(0.6)) continue;
        D.art.push({ key: rs.pick(STALLS), x: p[0], z: p[1], y: baseH(p[0], p[1]), ry: Math.atan2(c[0] - p[0], c[1] - p[1]) });
      }
    }
    if (d.role === 'plaza') { var pc = polyCentroid(d.poly); D.art.push({ key: 'sl_fountain', x: pc[0], z: pc[1], y: baseH(pc[0], pc[1]), ry: 0 }); }
    if (d.role === 'funerary') {
      /* rows of family tombs, stepped tombs and graves, clear of the temple */
      var FT = PLAN.voth.filter(function (q) { return q.role === 'funeraryTemple'; })[0];
      var xs2 = d.poly.map(function (p) { return p[0]; }), zs2 = d.poly.map(function (p) { return p[1]; });
      for (var x2 = Math.min.apply(null, xs2); x2 < Math.max.apply(null, xs2); x2 += 13) for (var z2 = Math.min.apply(null, zs2); z2 < Math.max.apply(null, zs2); z2 += 11) {
        var q = [x2 + rs.rr(-1, 1), z2 + rs.rr(-1, 1)];
        if (!inPoly(q, d.poly) || polyEdgeDist(q, d.poly) < 8 || (FT && Math.hypot(q[0] - FT.x, q[1] - FT.z) < 62) || baseH(q[0], q[1]) < 1) continue;
        var r = rs.rnd();
        D.art.push({ key: r < 0.18 ? 'voth_city_family_tomb' : r < 0.32 ? 'voth_city_stepped_tomb' : 'voth_city_grave', x: q[0], z: q[1], y: baseH(q[0], q[1]), ry: 0 });
      }
    }
    PLAN.districts.push(D);
  });
  VC.buildDistricts();             /* 31-vc-voth.js: monastery, chinampas, harbour quays and piers, river docks, islets, landmarks */
  SL.note(2, PLAN.site.filter(function (d) { return d.role !== 'zone' && d.role !== 'wall'; }).map(function (d) { return d.name; }).join(', ') + '; ' + VC.log2);
};

/* a way laid over something placed before it (a highway, a causeway) takes it down: every standing building whose
   footprint its carriageway (plus `pad`) overlaps is knocked out at `step` */
VC.clearUnder = function (pts, width, step, pad) {
  var n = 0;
  for (var i = 1; i < pts.length; i++) {
    var a = pts[i - 1], b = pts[i], L = V.dist(a, b); if (L < 0.5) continue;
    var o = obb(V.lerp(a, b, 0.5), V.norm(V.sub(b, a)), L / 2, width / 2 + (pad || 0));
    PLAN.lots.forEach(function (Lt) { if (Lt.died == null && Lt.bo && !Lt.deck && Math.abs(Lt.x - o.c[0]) < L / 2 + 80 && Math.abs(Lt.z - o.c[1]) < L / 2 + 80 && SL.pen(o, Lt.bo) > 0.2) { SL.killLot(Lt, step); n++; } });
  }
  return n;
};

/* ---------------------------------------------------------------- step 3: avenues */
/* a ring round a district, kept only where it is dry and not already on an avenue */
VC.addRing = function (ring, step, tag) {
  var R = SL.R, P = resample(ring, 2, true), W = TUNE.width.avenue;
  var cov = P.map(function (p) { var k = R.idx(p[0], p[1]); return k < 0 || R.sd[k] < W * 0.8 || baseH(p[0], p[1]) < 0.8; });
  if (cov.every(function (c) { return !c; })) { SL.addWay('avenue', P, step, { closed: true, tag: tag }); return 1; }
  if (cov.every(Boolean)) return 0;
  var n = P.length, s0 = cov.indexOf(true), made = 0;
  for (var k = 1; k <= n; k++) {
    var i = (s0 + k) % n;
    if (cov[i]) continue;
    var run = [];
    var prev = P[(i - 1 + n) % n]; if (baseH(prev[0], prev[1]) >= 0.8) { var sn = VC.nearestWayPt(prev, ['avenue']); if (sn && sn.d < W * 1.5) run.push(sn.p); }
    while (!cov[i]) { run.push(P[i]); k++; i = (s0 + k) % n; }
    if (baseH(P[i][0], P[i][1]) >= 0.8) { var sn2 = VC.nearestWayPt(P[i], ['avenue']); if (sn2 && sn2.d < W * 1.5) run.push(sn2.p); }
    if (run.length > 4) { SL.addWay('avenue', run, step, { tag: tag }); made++; }
  }
  return made;
};
SL.pass3 = function () {
  var W = TUNE.width.avenue, made = 0, joins = 0, rings = 0;
  var own = [];
  SITE.data.avenues.forEach(function (a) {
    var P = a.pts.filter(function (p, i) { return !i || V.dist(p, a.pts[i - 1]) > 1; });
    if (P.length < 2) return;
    own.push(SL.addWay('avenue', P, 3, { tag: a.name })); made++;
  });
  /* join each avenue's loose ends: to another avenue close by, else to a causeway's landing close by */
  var lands = SITE.causeways().map(function (c) {
    var a = c.pts[0], b = c.pts[c.pts.length - 1];
    return baseH(a[0], a[1]) > baseH(b[0], b[1]) ? a : b;
  });
  own.forEach(function (w) {
    [w.pts[0], w.pts[w.pts.length - 1]].forEach(function (e) {
      var q = VC.nearestWayPt(e, ['avenue'], w.id);
      if (q && q.d < W * 0.8) return;                                   /* already meets one */
      if (q && q.d < TUNE.avenueSnap) { SL.addWay('avenue', [e, q.p], 3, { tag: 'join ' + w.tag }); joins++; return; }
      var bl = null, bd = TUNE.causewaySnap;
      lands.forEach(function (l) { var d = V.dist(e, l); if (d < bd) { bd = d; bl = l; } });
      if (bl && bd > W) { SL.addWay('avenue', [e, bl], 3, { tag: 'to causeway ' + w.tag }); joins++; }
    });
  });
  /* the causeways (the site's, drawn or Voth's): their whole length is theirs, no building on a causeway's deck or its
     landing (owner, 2026-10-09: "a building clipping a causeway") */
  var cw = 0;
  SITE.causeways().forEach(function (c) {
    var P = c.pts, wd = (c.width || 46) / 2 + 4;
    for (var i = 1; i < P.length; i++) SL.R.eachNearSeg(P[i - 1], P[i], wd, function (k) { if (SL.R.occ[k] === OCC.FREE || SL.R.occ[k] === OCC.GREEN) { SL.R.occ[k] = OCC.HARD; SL.R.own[k] = -1; } });
    cw += VC.clearUnder(P, c.width || 46, 3, 3);
  });
  /* Voth's river bridges: the abutment is no ground for a building, and each end runs on to the nearest avenue
     (owner: "make sure they connect to avenues with an additional short avenue connector") */
  var bridges = 0;
  VOTH.RBRIDGES.forEach(function (b) {
    var d = V.norm([b.bx - b.ax, b.bz - b.az]);
    [[[b.ax, b.az], V.mul(d, -1)], [[b.bx, b.bz], d]].forEach(function (e) {
      var end = e[0], out = e[1], ry = Math.atan2(d[0], d[1]);
      SL.R.stampPoly(obbCorners(obb(end, [Math.cos(ry), -Math.sin(ry)], b.w * 1.1 + 3, b.w * 1.1 + 3)), OCC.HARD, -1);   /* + 3: a lot may touch reserved ground by its inset, and the raster samples cell middles */
      var ap = V.add(end, V.mul(out, b.w * 1.1 + TUNE.bridgeApproach)), q = VC.nearestWayPt(ap, ['avenue']);
      var pts = [V.add(end, V.mul(out, b.w * 0.6)), ap];
      if (q && q.d > W * 0.6 && q.d < TUNE.bridgeSnap) pts.push(q.p);
      SL.addWay('avenue', pts, 3, { tag: 'bridge approach' }); bridges++;
    });
  });
  /* rings round every park and market district (not joined to anything, per the owner) */
  PLAN.site.forEach(function (d) {
    if (d.role !== 'park' && d.role !== 'market') return;
    rings += VC.addRing(offsetConvex(d.poly, TUNE.ringGap + W / 2, 6), 3, 'ring ' + d.name);
  });
  /* the clan compounds, now the avenues are down (33-vc-country.js) */
  var clans = VC.clanCompounds(3);
  SL.note(3, made + ' avenues as drawn, ' + joins + ' joins to avenues and causeways, ' + bridges + ' bridge approaches, ' + rings + ' ring runs round the parks and markets; ' + clans);
};

/* ---------------------------------------------------------------- step 4: highways */
/* A* over a 20 m grid of the edited ground (Voth's own beyond the edits): slope dear, water impassable; the river
   highway keeps near the river, the bay highway near the shore. Each starts at the avenue point furthest out in its
   direction and ends at the reach. */
SL.pass4 = function () {
  var c = 20, half = TUNE.highwayReach + 400, n = Math.round(2 * half / c), G = { n: n, c: c }, H = new Float32Array(n * n);
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) { var x = -half + (i + 0.5) * c, z = -half + (j + 0.5) * c; H[j * n + i] = Math.abs(x) < TUNE.rasterHalf && Math.abs(z) < TUNE.rasterHalf ? baseH(x, z) : VOTH.terrainHe(x, z); }
  var zc = polyCentroid(PLAN.zone), made = 0, avPts = [];
  SITE.data.avenues.forEach(function (a) { avPts = avPts.concat(a.pts); });
  TUNE.highways.forEach(function (hw) {
    var t = hw.deg * Math.PI / 180, dir = [Math.cos(t), -Math.sin(t)];
    var st = avPts.reduce(function (m, p) { return V.dot(V.sub(p, zc), dir) > V.dot(V.sub(m, zc), dir) ? p : m; }, avPts[0]);
    var extra = null;
    if (hw.river) { extra = new Float32Array(n * n); for (var k = 0; k < n * n; k++) { var px = -half + (k % n + 0.5) * c, pz = -half + (((k / n) | 0) + 0.5) * c; var dr = Infinity; for (var rv = 1; rv < VOTH.RIVER.length; rv++) dr = Math.min(dr, segDist([px, pz], VOTH.RIVER[rv - 1], VOTH.RIVER[rv])); extra[k] = 0.006 * Math.max(0, dr - 150); } }
    if (hw.shore) { extra = new Float32Array(n * n); for (var k2 = 0; k2 < n * n; k2++) { var qx = -half + (k2 % n + 0.5) * c, qz = -half + (((k2 / n) | 0) + 0.5) * c; extra[k2] = 0.005 * Math.max(0, VOTH.landDist(qx, qz) - 160); } }
    var cost = function (k, i, j) {
      var h = H[k]; if (h < 0.8) return Infinity;
      /* nothing already standing is run over: landmarks, the markets, monastery and cemetery, the parks */
      var px = -half + (i + 0.5) * c, pz = -half + (j + 0.5) * c, rk = SL.R.idx(px, pz);
      /* a station the highway comes by stands beside it, not on it */
      if (via && Math.hypot(px - via.x, pz - via.z) < TUNE.viaNear[0] - 4) return Infinity;
      if (rk >= 0 && (SL.R.occ[rk] === OCC.HARD || SL.R.occ[rk] === OCC.GREEN) && Math.hypot(-half + (i + 0.5) * c - st[0], -half + (j + 0.5) * c - st[1]) > 60) return Infinity;
      var gx = (H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)]) / (2 * c), gz = (H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i]) / (2 * c);
      return 1 + 70 * (gx * gx + gz * gz) + (extra ? extra[k] : 0);
    };
    var goals = new Set(), reach = TUNE.highwayReach;
    for (var j2 = 0; j2 < n; j2++) for (var i2 = 0; i2 < n; i2++) {
      var gp = [-half + (i2 + 0.5) * c, -half + (j2 + 0.5) * c], rel = V.sub(gp, zc), L = V.len(rel);
      if (L > reach && L < reach + 3 * c && V.dot(rel, dir) / L > Math.cos(Math.PI / 7)) goals.add(j2 * n + i2);
    }
    var si = Math.floor((st[0] + half) / c), sj = Math.floor((st[1] + half) / c), from = sj * n + si, path = [], via = null;
    /* a highway that must come by an elephant bug station (owner: "make sure the highway comes by S11 and S10") runs to
       the ring of ground just beside it first, so the station stands at the roadside, not on the road */
    via = hw.via ? SITE.station(hw.via) : null;
    if (via) {
      var ring = new Set();
      for (var j4 = 0; j4 < n; j4++) for (var i4 = 0; i4 < n; i4++) { var dv = Math.hypot(-half + (i4 + 0.5) * c - via.x, -half + (j4 + 0.5) * c - via.z); if (dv > TUNE.viaNear[0] && dv < TUNE.viaNear[1] && H[j4 * n + i4] >= 0.8) ring.add(j4 * n + i4); }
      var p1 = ASTAR(G, from, ring, cost, null, 1.0, function (i3, j3) { return Math.max(0, Math.hypot(-half + (i3 + 0.5) * c - via.x, -half + (j3 + 0.5) * c - via.z) - TUNE.viaNear[1]) / c; });
      if (!p1) { SL.note(4, 'the ' + hw.name + ' highway cannot reach ' + hw.via); }
      else { path = p1.slice(0, -1); from = p1[p1.length - 1]; }
    }
    var p2 = ASTAR(G, from, goals, cost, null, 1.0, function (i3, j3) { return Math.max(0, reach - V.dot(V.sub([-half + (i3 + 0.5) * c, -half + (j3 + 0.5) * c], zc), dir)) / c; });
    if (!p2) { SL.note(4, 'no route for the ' + hw.name + ' highway'); return; }
    path = path.concat(p2);
    var pts = [st].concat(path.slice(1).map(function (k) { return [-half + (k % n + 0.5) * c, -half + (((k / n) | 0) + 0.5) * c]; }));
    pts = chaikin(rdp(pts, 6), 3);
    var hwy = SL.addWay('highway', pts, 4, { tag: hw.name, stamp: true }); made++;
    VC.clearUnder(hwy.pts, hwy.w, 4, 2);
    /* a verge either side: no building along a highway (owner, 2026-10-09); streets may still cross it */
    for (var vi = 1; vi < hwy.pts.length; vi++) SL.R.eachNearSeg(hwy.pts[vi - 1], hwy.pts[vi], hwy.w / 2 + TUNE.verge, function (k) { if (SL.R.occ[k] === OCC.FREE) SL.R.occ[k] = OCC.VERGE; });
    if (via) { var nv = hwy.F.nearest([via.x, via.z]); hwy.via = { id: hw.via, d: Math.round(nv.d) }; }
  });
  /* a station off every highway gets its own road to the city here (S12), so it stands off it like the rest */
  VC.roadHash(); var sr = [];
  TUNE.country.roadsFor.forEach(function (id) { var r = VC.roadToCity(id, 4); if (r) sr.push(r); });
  SL.note(4, made + ' highways: ' + TUNE.highways.map(function (h) { return h.name + (h.via ? ' (by ' + h.via + ')' : ''); }).join(', ') + (sr.length ? '; ' + sr.join('; ') : '') + '; ' + VC.placeStations(4));
};

/* ---------------------------------------------------------------- step 5: the wall
   Voth's rule (30d-wall-stations.js, 60-land.js 18. CURTAIN WALL): towers stand at the wall's vertices; gates
   where a major way crosses it, the three named gates (harbour, spirit, river) at the crossing nearest their quad
   (here: the owner's markers F, G, H), other crossings get generic gates unless near another; health is drawn
   (towers and generic gates intact, ruined or destroyed; named gates always intact); each node takes a site near
   its ideal spot (facadeFindGateSite); segments between neighbours take the lower of their ends' health. Here the
   line is the western edge of the 'wall' polygon, pushed clear of any avenue running beside it. */
SL.pass5 = function () {
  if (!VC.wallChain) { SL.note(5, 'no wall polygon'); return; }
  var T = TUNE.wall, ways = PLAN.ways.filter(function (w) { return w.cls === 'avenue' || w.cls === 'highway'; });
  /* the line, every towerGap, with an outward (east) normal per vertex */
  var C = resample(VC.wallChain, T.towerGap, false);
  var nrm = function (i) { var a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], t = V.norm(V.sub(b, a)); return [t[1], -t[0]]; };   /* running south, east is (t.z, -t.x) */
  /* crossings of the original line by avenues and highways */
  var cross = function (L) {
    var out = [];
    for (var i = 1; i < L.length; i++) ways.forEach(function (w) {
      for (var k = 1; k < w.pts.length; k++) {
        var p = L[i - 1], q = L[i], r = w.pts[k - 1], s = w.pts[k], d1 = V.sub(q, p), d2 = V.sub(s, r), den = d1[0] * d2[1] - d1[1] * d2[0];
        if (Math.abs(den) < 1e-9) continue;
        var t = ((r[0] - p[0]) * d2[1] - (r[1] - p[1]) * d2[0]) / den, u = ((r[0] - p[0]) * d1[1] - (r[1] - p[1]) * d1[0]) / den;
        /* a way running along the wall (crossing it at under 30 degrees) is no crossing: the wall moves off it */
        var sin = Math.abs(den) / (V.len(d1) * V.len(d2));
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && sin > 0.5) out.push({ seg: i - 1, t: t, p: V.add(p, V.mul(d1, t)), way: w });
      }
    });
    return out;
  };
  var X0 = cross(C);
  /* clearance: a vertex an avenue runs beside (not across) moves out until the avenue is T.clear away */
  for (var it = 0; it < 4; it++) for (var i = 0; i < C.length; i++) {
    var p = C[i], d = Infinity, from = null;
    if (X0.some(function (x) { return V.dist(x.p, p) < 70; })) continue;
    ways.forEach(function (w) { var nq = w.F.nearest(p); if (nq.d < d) { d = nq.d; from = w.F.at(nq.s); } });
    /* away from the avenue it is too close to (on whichever side the wall already lies) */
    if (d < T.clear) C[i] = V.add(p, V.mul(d > 0.5 ? V.norm(V.sub(p, from)) : nrm(i), T.clear - d + 3));
  }
  /* ...and a run between two vertices that bows toward an avenue gets a vertex (a tower) there, pushed out */
  for (var round = 0; round < 8; round++) {
    var added = false;
    for (var i2 = 1; i2 < C.length; i2++) {
      var A = C[i2 - 1], Bv = C[i2], worst = null, wd = T.clear, wfrom = null;
      for (var tt = 0.1; tt < 0.95; tt += 0.1) {
        var q = V.lerp(A, Bv, tt); if (X0.some(function (x) { return V.dist(x.p, q) < 70; })) continue;
        ways.forEach(function (w) { var nq2 = w.F.nearest(q); if (nq2.d < wd) { wd = nq2.d; worst = q; wfrom = w.F.at(nq2.s); } });
      }
      if (worst) { var td = V.norm(V.sub(Bv, A)), away = wd > 0.5 ? V.norm(V.sub(worst, wfrom)) : [td[1], -td[0]]; C.splice(i2, 0, V.add(worst, V.mul(away, T.clear - wd + 3))); added = true; i2++; }
    }
    if (!added) break;
  }
  VC.wallLine = C;
  var X = cross(C), arc = plFrame(C), sOf = function (p) { return arc.nearest(p).s; };
  /* gates: the named three first, at the crossing nearest each marker (or the wall point nearest it) */
  var gates = [];
  [['F', 'HarborGate'], ['G', 'SpiritGate'], ['H', 'RiverGate']].forEach(function (g) {
    var m = VC.marker(new RegExp('^' + g[0] + '$', 'i')); if (!m) return;
    var best = null, bd = T.gateFind;
    X.forEach(function (x) { var dd = Math.hypot(x.p[0] - m.x, x.p[1] - m.z); if (dd < bd) { bd = dd; best = x.p; } });
    var at = best || arc.at(sOf([m.x, m.z]));
    var bx = best ? X.filter(function (x) { return x.p === best; })[0] : null;
    gates.push({ kind: 'gate', name: g[1], marker: g[0], x: at[0], z: at[1], s: sOf(at), health: 2, named: true, crossed: !!best, way: bx ? bx.way : null });
  });
  X.forEach(function (x) {
    var s = sOf(x.p);
    if (gates.some(function (g) { return Math.abs(g.s - s) < (g.named ? 70 : 40); })) return;
    gates.push({ kind: 'gate', name: 'Gate', x: x.p[0], z: x.p[1], s: s, named: false, way: x.way });
  });
  /* towers at the vertices, clear of the gates */
  var nodes = gates.slice();
  C.forEach(function (p) { var s = sOf(p); if (!gates.some(function (g) { return Math.abs(g.s - s) < 30; })) nodes.push({ kind: 'tower', x: p[0], z: p[1], s: s }); });
  nodes.sort(function (a, b) { return a.s - b.s; });
  /* the wall stands whole (owner, 2026-10-09: "make the wall un-ruined"): every tower, gate and run intact */
  nodes.forEach(function (nd) { nd.health = 2; });
  nodes.forEach(function (nd, i) { var a = nodes[Math.max(0, i - 1)], b = nodes[Math.min(nodes.length - 1, i + 1)]; nd.ry = Math.atan2(b.x - a.x, b.z - a.z); });
  /* a gate is square to the way through it, not to the wall: its passage (the model's local x) runs along the way,
     so its towers stand either side of the road instead of on it */
  nodes.forEach(function (nd) {
    if (nd.kind !== 'gate' || !nd.way) return;
    var t = nd.way.F.tan(nd.way.F.nearest([nd.x, nd.z]).s, 8), ry = Math.atan2(-t[1], t[0]);
    if (Math.cos(ry - nd.ry) < 0) ry += Math.PI;     /* keep the wall's own sense, so a model's front faces out as before */
    nd.ry = ry; nd.square = true;
  });
  VC.wall = { line: C, nodes: nodes, gates: gates };
  VC.buildWall();                 /* 31-vc-voth.js: sites, towers, gates and segments, as Voth builds them */
  /* the raster: the wall is no ground for lots or streets, except through its gates; anything placed before it on its
     line (a quay warehouse) comes down */
  var R = SL.R;
  VC.wall.segs.forEach(function (sg) { VC.clearUnder([[sg.ax, sg.az], [sg.bx, sg.bz]], T.thick, 5, 3); });
  VC.wall.segs.forEach(function (sg) {
    R.eachNearSeg([sg.ax, sg.az], [sg.bx, sg.bz], T.thick / 2 + 5, function (k) { if (R.occ[k] === OCC.FREE) { R.occ[k] = OCC.OUT; R.own[k] = -1; } });
  });
  VC.wall.nodes.forEach(function (nd) { if (nd.kind === 'tower' && !nd.skip && nd.health > 0) R.eachNearSeg([nd.gx, nd.gz], [nd.gx, nd.gz], 12, function (k) { if (R.occ[k] === OCC.FREE) R.occ[k] = OCC.OUT; }); });
  /* a gate's towers are no ground for a street either: only its passage is open */
  VC.wall.nodes.forEach(function (nd) {
    if (nd.kind !== 'gate' || nd.deleted) return;
    var lz = [Math.sin(nd.ry), Math.cos(nd.ry)], off = nd.named ? 20 : nd.towerOff;
    [-1, 1].forEach(function (sd) { var tp = [nd.gx + lz[0] * off * sd, nd.gz + lz[1] * off * sd]; R.eachNearSeg(tp, tp, nd.named ? 9 : TUNE.wall.gateTower / 2 + 1, function (k) { if (R.occ[k] === OCC.FREE || R.occ[k] === OCC.LOT) R.occ[k] = OCC.OUT; }); });
  });
  var live = nodes.filter(function (n) { return !n.skip && !n.deleted; });
  SL.note(5, 'wall ' + Math.round(plLen(C)) + ' m on the west edge of the wall polygon; gates: ' + gates.map(function (g) { return g.name === 'Gate' ? 'gate' : g.name + (g.crossed ? '' : ' (no way crosses there)'); }).join(', ') +
    '; ' + live.filter(function (n) { return n.kind === 'tower'; }).length + ' towers, ' + VC.wall.segs.length + ' standing segments' +
    VC.wall.nodes.filter(function (n) { return n.pad; }).map(function (n, i) { return (i ? ', ' : '; level pads: ') + (n.name === 'Gate' ? 'gate' : n.name) + ' at ' + n.pad.y.toFixed(1) + ' m (cut ' + n.pad.cut.toFixed(1) + ', fill ' + n.pad.fill.toFixed(1) + ')'; }).join(''));
};
