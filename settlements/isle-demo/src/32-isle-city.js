/* ============================== 3. THE CITY PLAN: ONE KCITY INSTANCE A TOWN ============================== */
/* [G data] ISLE.city(town, o) lays a town out on core/city (core/city/README.md, "Porting a settlement"): its own instance
   (KCITY.create, rand 'krand', index 'insertion', the exact-streets rule), its steps 0-5 on the site layer from the owner's
   site file (site/isle-site.json) and the programme (30-isle-programme.js), steps 6-12 core/city's builder with this
   page's rules (wealth, the district draws, the vacant frontage), then the harbours, the vessels, the wall's pieces and
   the world records beyond the square. Plain records only: no THREE, no DOM.

     o = {site (the town's entry of the site file), ground (ISLE.townGround), dims(key, v) -> {w, d, h, kit} | null,
          vdims(key) -> {L, B, H} | null (the vessels), tags (a core/tags registry), seed}
     returns {town, K (the instance), plan, lots (standing, every kit piece), wall (pieces), vessels, landings, world
              (records to place later), districts, log, missing, failed}

   Every landmark, lot, wall piece and vessel is registered in core/tags before anything draws it; a lot by core/city
   (KCITY.create({tags})), the rest here. Each landmark draws its own KRAND stream (the town's seed, its name), so an
   edit to one moves no other. */
ISLE.city = function (town, o) {
  var S = o.site, PR = ISLE.scaledProg(ISLE.PROG[town], S.scaled), G = o.ground, KL = KCITY.lib, SL = KL.SL, OCC = KL.OCC, V = KL.V;
  var obb = KL.obb, obbCorners = KL.obbCorners, inPoly = KL.inPoly, segDist = KL.segDist, ryFacing = KL.ryFacing;
  var seed = KRAND.child(o.seed == null ? 20261018 : o.seed, 'isle-city:' + town) >>> 0;
  var rsOf = function (name) { var s = KRAND.stream(KRAND.child(seed, name)); return { rnd: s.next, rr: s.range, pick: s.pick }; };
  var h = G.h, W = 12, LOG = {}, OUT = { missing: {}, failed: [], wall: [], vessels: [], landings: [], world: [] };
  var tags = o.tags;
  var dims = function (key, v) { var D = o.dims(key, v); if (!D) { OUT.missing[key] = (OUT.missing[key] || 0) + 1; return null; } return { key: key, v: v || 0, w: D.w, d: D.d, h: D.h }; };
  /* the districts with their roles (the site file's and the brief's), the markers */
  var DIST = S.districts.concat(PR.addDistricts || []).map(function (d) { return { id: d.id, name: d.name, type: d.type, role: ISLE.ROLES(d), poly: d.poly }; });
  /* names as the owner typed them: matched without case or stray spaces ("harbor ", "Market 1") */
  var same = function (a, b) { return String(a).trim().toLowerCase() === String(b).trim().toLowerCase(); };
  var dist = function (name) { for (var i = 0; i < DIST.length; i++) if (same(DIST[i].name, name)) return DIST[i]; return null; };
  var marker = function (id) { for (var i = 0; i < S.markers.length; i++) if (same(S.markers[i].id, id)) return S.markers[i]; return null; };
  /* a town whose parks are beaches (the owner's Valapo: "the parks will be white sand beaches") */
  if (PR.parksAre) DIST.forEach(function (d) { if (d.role === 'park') d.role = PR.parksAre; });
  var ZONE = DIST.filter(function (d) { return d.role === 'zone'; })[0];
  /* no build area drawn (zoneFrom 'drawing'): the outline of everything drawn (districts, avenues, markers), grown by zonePad */
  if (!ZONE && PR.zoneFrom === 'drawing') {
    var all = [];
    S.districts.forEach(function (d) { all = all.concat(d.poly); }); S.avenues.forEach(function (a) { all = all.concat(a.pts); }); S.markers.forEach(function (m) { all.push([m.x, m.z]); });
    var hl = (function (pts) {
      var Pp = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), cr = function (O, A, B) { return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); }, lo = [], up = [], i2;
      for (i2 = 0; i2 < Pp.length; i2++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], Pp[i2]) <= 0) lo.pop(); lo.push(Pp[i2]); }
      for (i2 = Pp.length - 1; i2 >= 0; i2--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], Pp[i2]) <= 0) up.pop(); up.push(Pp[i2]); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    })(all);
    ZONE = { id: 'zone', name: 'the drawing, grown ' + PR.zonePad + ' m', type: 'misc', role: 'zone', poly: KL.offsetConvex(hl, PR.zonePad, 6).map(function (p) { return [+p[0].toFixed(1), +p[1].toFixed(1)]; }) };
    DIST.push(ZONE);
  }
  if (!PR.centre && PR.centreMarker) { var cm = marker(PR.centreMarker); if (cm) PR.centre = [cm.x, cm.z]; }
  /* a programme without its own centre takes the ceremonial park's middle (else the build area's), its reach the build
     area's farthest corner from it */
  if (!PR.centre) { var pkc = PR.ring ? dist(PR.ring.district) : null; PR.centre = pkc ? KL.polyCentroid(pkc.poly) : KL.polyCentroid(ZONE.poly); }
  if (!PR.reach) PR.reach = Math.max.apply(null, ZONE.poly.map(function (p) { return V.dist(p, PR.centre); }));
  var avenue = function (name) { for (var i = 0; i < S.avenues.length; i++) if (S.avenues[i].name === name) return S.avenues[i]; return null; };
  var centroid = function (P) { return KL.polyCentroid(P); };
  /* what a landmark must keep clear of before the streets exist: the drawn avenues and the rings to come (polylines) */
  var AVOID = S.avenues.map(function (a) { return { name: a.name, pts: a.pts }; });
  /* skip: the avenues this landmark may stand over (the ceremonial square where Avenues 1 and 3 meet it: PLAN 8a) */
  var avoidD = function (C, skip) { var d = Infinity; AVOID.forEach(function (A) { if (skip && skip.indexOf(A.name) >= 0) return; var L = A.pts; for (var i = 1; i < L.length; i++) d = Math.min(d, KL.polySegDist(C, L[i - 1], L[i])); }); return d; };
  var hull = function (pts) {
    var P = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }), cr = function (O, A, B) { return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]); };
    var lo = [], up = [], i;
    for (i = 0; i < P.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], P[i]) <= 0) lo.pop(); lo.push(P[i]); }
    for (i = P.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], P[i]) <= 0) up.pop(); up.push(P[i]); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  var ringOf = function (P, gap) { return KL.offsetConvex(hull(P), gap + W / 2, 6); };
  var uOf = function (ry) { return [Math.cos(ry), -Math.sin(ry)]; };

  /* ---------------------------------------------------------------- landmarks: one footprint, checked, registered */
  /* o2: {role, name, shore (a harbour piece: its back on land, its piers over the sea, y the land's 0.9 m over the sea),
          clear (metres from the avoid lines), relief, y} */
  var put = function (key, x, z, ry, o2) {
    o2 = o2 || {};
    var it = dims(key, 0); if (!it) return null;
    var bo = obb([x, z], uOf(ry), it.w / 2, it.d / 2), C = obbCorners(bo);
    if (SL.R.idx(x, z) < 0 || C.some(function (p) { return SL.R.idx(p[0], p[1]) < 0; })) return null;
    if (SL.clash(bo)) return null;
    if (avoidD(C, o2.over) < W / 2 + (o2.clear == null ? 3 : o2.clear)) return null;
    var hs = C.concat([bo.c]).map(function (p) { return h(p[0], p[1]); }), lo = Math.min.apply(null, hs), hi = Math.max.apply(null, hs), y, terrace = null;
    if (o2.shore) {
      var back = [V.add(bo.c, V.mul([Math.sin(ry), Math.cos(ry)], it.d / 2 - 1))];
      if (h(x, z) < 0.3 || h(x, z) > 1.6 || h(back[0][0], back[0][1]) < 0.4) return null;
      y = 0.9;
    } else {
      if (lo < 0.8) return null;
      var big = Math.max(it.w, it.d);
      if (hi - lo > (o2.relief == null ? Math.max(4, 0.2 * big) : o2.relief)) return null;
      y = lo - 0.15;
      /* on a slope a landmark stands on a terrace cut and filled into the town's ground (its mean level, a 1:1.4 batter) */
      if (hi - lo > 1.2 && G.grid) {
        var mean = hs.reduce(function (a, b) { return a + b; }, 0) / hs.length;
        var pad = KCITY.ground.levelPad(G.grid, { x: x, z: z, ry: ry, hw: it.w / 2 + 3, hd: it.d / 2 + 3, y: mean, spread: 1.2, slope: 0.7 });
        if (pad) { y = mean; terrace = { y: +mean.toFixed(2), cut: +pad.cut.toFixed(2), fill: +pad.fill.toFixed(2) }; }
      }
    }
    var P = KL.plan(), L = { id: P.lots.length, cls: 'landmark', role: o2.role || key, name: o2.name || null, key: key, v: 0, slot: 0, wealth: 1, x: x, z: z, y: o2.y == null ? y : o2.y, ry: ry,
      w: it.w, d: it.d, h: it.h, lot: bo, bo: bo, way: -1, side: 0, s: 0, born: 1, died: null, civic: true, shore: !!o2.shore, terrace: terrace };
    P.lots.push(L); P.landmarks.push(L); SL.hashLot(L); SL.register(L);
    SL.R.stampPoly(obbCorners(obb(bo.c, bo.u, bo.hw + 3, bo.hd + 3)), OCC.HARD, L.id);
    return L;
  };
  /* the first fit in rings out from (x, z): along the given axis first when there is one */
  var hunt = function (key, x, z, rys, o2) {
    var R0 = !o2 || o2.radius == null ? 120 : o2.radius, st = !o2 || o2.step == null ? 6 : o2.step;
    for (var r = 0; r <= R0; r += st) {
      var n = r === 0 ? 1 : Math.max(6, Math.round(2 * Math.PI * r / st));
      for (var k = 0; k < n; k++) {
        var a = k / n * Math.PI * 2 + r * 0.37, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        for (var j = 0; j < rys.length; j++) { var L = put(key, px, pz, rys[j], o2); if (L) return L; }
      }
    }
    OUT.failed.push({ key: key, role: o2 && o2.role, at: [x, z] }); return null;
  };
  /* a building turned to face the ring round a district: its front parallel to the nearest side of the ring, slid out
     along the side's normal until it is clear of the ring avenue, then along the side */
  var aligned = function (A, park, gap) {
    var m = marker(A.marker); if (!m) { OUT.failed.push({ key: A.key, role: A.role, why: 'no marker ' + A.marker }); return null; }
    /* over 'auto': the avenues that end at the marker (the square where the processional avenues meet it) */
    var over = A.over !== 'auto' ? A.over : S.avenues.filter(function (av) { var e0 = av.pts[0], e1 = av.pts[av.pts.length - 1]; return Math.min(Math.hypot(e0[0] - m.x, e0[1] - m.z), Math.hypot(e1[0] - m.x, e1[1] - m.z)) < 90; }).map(function (av) { return av.name; });
    var L = alignedAt(A, [m.x, m.z], park, gap, 160, over);
    if (L) L.marker = A.marker;
    return L;
  };
  /* the envoy houses and the civic buildings round the ring (the owner's note on the park): slots along each side of the
     park, the sides' middles first, each a building facing the park wherever it fits near its slot */
  var ringAround = function (list, park, gap) {
    var slots = [], n = 0;
    [0.5, 0.25, 0.75, 0.12, 0.88, 0.38, 0.62].forEach(function (f) { for (var i = 0; i < park.length; i++) slots.push(V.lerp(park[i], park[(i + 1) % park.length], f)); });
    var used = slots.map(function () { return false; });
    list.forEach(function (A) {
      for (var c = 0; c < A.count; c++) {
        var L = null;
        for (var k = 0; k < slots.length && !L; k++) { if (used[k]) continue; L = alignedAt(A, slots[k], park, gap, 40, null, true); if (L) used[k] = true; }
        if (L) n++; else OUT.failed.push({ key: A.key, role: A.role, why: 'no room round the ring' });
      }
    });
    return n;
  };
  var alignedAt = function (A, p, park, gap, along, over, quiet) {
    var it = dims(A.key, 0); if (!it) return null;
    var c = centroid(park), best = null, bd = Infinity;
    for (var i = 0; i < park.length; i++) { var a = park[i], b = park[(i + 1) % park.length], d = segDist(p, a, b); if (d < bd) { bd = d; best = [a, b]; } }
    var t = V.norm(V.sub(best[1], best[0])), n = V.perp(t); if (V.dot(n, V.sub(c, best[0])) < 0) n = V.mul(n, -1);
    var ry = ryFacing(n), out = V.mul(n, -1), dl = V.dot(V.sub(p, best[0]), out);
    var need = gap + W + 4 + it.d / 2, base = V.add(p, V.mul(out, Math.max(0, need - dl)));
    /* slid out from the ring (at most `along` / 2 + 20 m beyond the first clear line) and along its side (`along` m either way) */
    for (var q = 0; q <= Math.min(120, along / 2 + 20); q += 10) for (var r = 0; r <= along; r += 6) for (var sg = -1; sg <= 1; sg += 2) {
      var pt = V.add(V.add(base, V.mul(t, sg * r)), V.mul(out, q));
      var L = put(A.key, pt[0], pt[1], ry, { role: A.role, name: A.name, over: over });
      if (L) { L.moved = +V.dist(pt, p).toFixed(1); L.facesRing = true; return L; }
    }
    if (!quiet) OUT.failed.push({ key: A.key, role: A.role, at: p });
    return null;
  };
  /* a market's stalls and halls: rows along the market's longest side, alternate rows facing each other */
  var market = function (D, M) {
    var P = D.poly, best = 0, u = [1, 0];
    for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length], l = V.dist(a, b); if (l > best) { best = l; u = V.norm(V.sub(b, a)); } }
    var v = V.perp(u), c = centroid(P), ext = 0;
    P.forEach(function (q) { ext = Math.max(ext, V.dist(q, c)); });
    var its = M.keys.map(function (k) { return dims(k, 0); }).filter(Boolean); if (!its.length) return 0;
    var sx = Math.max.apply(null, its.map(function (it) { return it.w; })) + M.gap, sz = Math.max.apply(null, its.map(function (it) { return it.d; })) + M.gap, n = 0;
    for (var j = -Math.ceil(ext / sz); j <= Math.ceil(ext / sz); j++) for (var i2 = -Math.ceil(ext / sx); i2 <= Math.ceil(ext / sx); i2++) {
      var p = V.add(c, V.add(V.mul(u, i2 * sx), V.mul(v, j * sz))), key = M.keys[KRAND.hash(seed, 77, i2, j) % M.keys.length];
      var it = dims(key, 0), ry = ryFacing(V.mul(v, j % 2 ? 1 : -1)), bo = obb(p, uOf(ry), it.w / 2 + 3, it.d / 2 + 3);
      if (!obbCorners(bo).every(function (q) { return inPoly(q, P); })) continue;
      if (put(key, p[0], p[1], ry, { role: 'market', name: D.name, clear: 4 })) n++;
    }
    return n;
  };
  /* buildings round the inside of a square, facing in; towers at its corners */
  var squareRing = function (D, Q) {
    var P = D.poly, c = centroid(P), n = 0;
    P.forEach(function (corner) { var dir = V.norm(V.sub(c, corner)), pt = V.add(corner, V.mul(dir, Q.inset + 8)); if (hunt(Q.corners, pt[0], pt[1], [ryFacing(dir)], { role: 'watch tower', name: D.name, radius: 18, step: 3 })) n++; });
    var k = 0;
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], t = V.norm(V.sub(b, a)), nn = V.perp(t); if (V.dot(nn, V.sub(c, a)) < 0) nn = V.mul(nn, -1);
      var len = V.dist(a, b), s = 16;
      while (s < len - 16) {
        /* each slot takes the next kind that fits there (Avenue 7 crosses the square: PLAN 8a's drawing) */
        var done = null;
        for (var tr = 0; tr < Q.sides.length && !done; tr++) {
          var key = Q.sides[(k + tr) % Q.sides.length], it = dims(key, 0); if (!it) continue;
          var pt = V.add(V.add(a, V.mul(t, s + it.w / 2)), V.mul(nn, Q.inset + it.d / 2));
          if (put(key, pt[0], pt[1], ryFacing(nn), { role: key === 'ie-barracks' ? 'barracks' : "war-canoe captains' hall", name: D.name })) done = it;
        }
        if (done) { n++; k++; s += done.w + 4; } else s += 6;
      }
    }
    return n;
  };
  /* the shore of a harbour district: points where the ground meets the sea, each with its seaward direction, ordered
     along the district's long axis */
  var shoreOf = function (D) {
    var P = D.poly, pts = [], c = centroid(P), u = [1, 0], best = 0, xs = P.map(function (q) { return q[0]; }), zs = P.map(function (q) { return q[1]; });
    for (var i = 0; i < P.length; i++) { var l = V.dist(P[i], P[(i + 1) % P.length]); if (l > best) { best = l; u = V.norm(V.sub(P[(i + 1) % P.length], P[i])); } }
    if (u[0] < 0) u = V.mul(u, -1);     /* the axis runs west to east */
    var x0 = Math.min.apply(null, xs) - 60, x1 = Math.max.apply(null, xs) + 60, z0 = Math.min.apply(null, zs) - 60, z1 = Math.max.apply(null, zs) + 60;
    for (var z = z0; z <= z1; z += 4) for (var x = x0; x <= x1; x += 4) {
      var y = h(x, z); if (y < 0.5 || y > 1.3) continue;
      var near = false; for (var k = 0; k < P.length && !near; k++) near = segDist([x, z], P[k], P[(k + 1) % P.length]) < 60;
      if (!inPoly([x, z], P) && !near) continue;
      var g = [h(x + 4, z) - h(x - 4, z), h(x, z + 4) - h(x, z - 4)], gl = Math.hypot(g[0], g[1]); if (gl < 1e-3) continue;
      var s = [-g[0] / gl, -g[1] / gl];
      if (h(x + s[0] * 14, z + s[1] * 14) > -0.5 || h(x - s[0] * 14, z - s[1] * 14) < 1.2) continue;
      pts.push({ p: [x, z], s: s, a: V.dot(V.sub([x, z], c), u) });
    }
    pts.sort(function (A, B) { return A.a - B.a; });
    return pts;
  };
  var harbour = function (H) {
    var D = dist(H.district); if (!D) { OUT.failed.push({ role: 'harbour', why: 'no district ' + H.district }); return; }
    var pts = shoreOf(D), placed = [], ki = 0, a = -Infinity;
    /* a part of the district's shore (the owner's Kautoa: "military east, trade middle, fishing west"): its share of the
       shore points along the axis, west to east */
    if (H.part && pts.length) { var a0 = pts[0].a, a1 = pts[pts.length - 1].a; pts = pts.filter(function (q) { var f = (q.a - a0) / Math.max(1e-6, a1 - a0); return f >= H.part[0] && f <= H.part[1]; }); }
    for (var i = 0; i < pts.length && ki < H.shore.length; i++) {
      var key = H.shore[ki], it = dims(key, 0); if (!it) { ki++; continue; }
      if (pts[i].a < a) continue;
      var q = pts[i], ry = ryFacing(V.mul(q.s, -1)), L = null;
      for (var off = 0; off <= 12 && !L; off += 4) { var pp = V.add(q.p, V.mul(q.s, off)); L = put(key, pp[0], pp[1], ry, { role: key.replace(/^ie-/, ''), name: D.name, shore: true, clear: 2 }); }
      if (L) { L.harbour = H.use; placed.push(L); a = q.a + it.w + 14; ki++; }
    }
    if (ki < H.shore.length) OUT.failed.push({ role: 'harbour', name: D.name, why: (H.shore.length - ki) + ' shore pieces found no shore', shore: pts.length });
    LOG['shore ' + D.name.trim() + (H.part ? ' (' + H.use + ')' : '')] = placed.length + ' of ' + H.shore.length + ' pieces on ' + pts.length + ' shore points';
    /* inland of the shore: the works the harbour carries (Valapo's smelter) */
    var land = placed.length ? placed[0] : null;
    (H.inland || []).forEach(function (kr) {
      var at = land ? V.add([land.x, land.z], V.mul([Math.sin(land.ry), Math.cos(land.ry)], 70)) : centroid(D.poly);
      var L2 = hunt(kr[0], at[0], at[1], [land ? land.ry : 0, (land ? land.ry : 0) + Math.PI / 2], { role: kr[1], name: D.name, radius: 260, step: 8 });
      if (L2) L2.harbour = H.use;
    });
    if (H.landing) {
      var Q = placed.filter(function (L) { return L.key === 'ie-quay'; })[0] || placed[0];
      if (Q) OUT.landings.push({ id: town + '.landing', town: town, kind: 'trade landing', quay: Q.id, x: +(Q.x - Math.sin(Q.ry) * Q.d * 0.45).toFixed(2), z: +(Q.z - Math.cos(Q.ry) * Q.d * 0.45).toFixed(2), note: 'the canoe route between Kautoa and Valapo lands here (PLAN.md section 5)' });
    }
    H._placed = placed; H._dist = D;
  };
  /* vessels moored off a harbour: deep enough, clear of the land and each other, nearest the harbour's pieces first; each
     heading along the shore */
  var moor = function (H) {
    var D = H._dist; if (!D) return;
    var near = (H._placed || []).map(function (L) { return [L.x, L.z]; }); if (!near.length) near = [centroid(D.poly)];
    var cand = [], P = D.poly, xs = P.map(function (q) { return q[0]; }), zs = P.map(function (q) { return q[1]; });
    for (var z = Math.min.apply(null, zs) - 500; z <= Math.max.apply(null, zs) + 500; z += 8) for (var x = Math.min.apply(null, xs) - 500; x <= Math.max.apply(null, xs) + 500; x += 8) {
      if (SL.R.idx(x, z) < 0 || h(x, z) > -3) continue;
      var dn = Infinity; near.forEach(function (q) { dn = Math.min(dn, Math.hypot(q[0] - x, q[1] - z)); }); if (dn > 520) continue;
      cand.push({ p: [x, z], d: dn + 12 * KRAND.unit(KRAND.hash(seed, 91, Math.round(x), Math.round(z))) });
    }
    cand.sort(function (A, B) { return A.d - B.d; });
    var list = []; H.vessels.forEach(function (kv) { for (var i = 0; i < kv[1]; i++) list.push(kv[0]); });
    list.sort(function (A, B) { var a = o.vdims(A), b = o.vdims(B); return (b ? b.L : 0) - (a ? a.L : 0); });
    var n = 0;
    list.forEach(function (key, k) {
      var Dm = o.vdims(key); if (!Dm) { OUT.missing[key] = (OUT.missing[key] || 0) + 1; return; }
      var r = Dm.L / 2 + 6, deep = Dm.L > 30 ? -4.5 : -2.5;
      for (var i = 0; i < cand.length; i++) {
        var p = cand[i].p; if (h(p[0], p[1]) > deep) continue;
        var ok = true;
        for (var a = 0; a < 8 && ok; a++) { var an = a / 8 * Math.PI * 2; ok = h(p[0] + Math.cos(an) * r, p[1] + Math.sin(an) * r) < -1; }
        if (!ok) continue;
        if (OUT.vessels.some(function (Q) { return Math.hypot(Q.x - p[0], Q.z - p[1]) < (Q.L + Dm.L) / 2 + 10; })) continue;
        /* the heading (along (sin, cos), ringsea's convention) follows the shore: the ground's contour, square to its gradient */
        var g = [h(p[0] + 8, p[1]) - h(p[0] - 8, p[1]), h(p[0], p[1] + 8) - h(p[0], p[1] - 8)], hd = Math.atan2(-g[1], g[0]);
        var jit = (KRAND.unit(KRAND.hash(seed, 92, k)) - 0.5) * 0.5, heading = hd + jit;
        var Vr = { id: town + '.v' + OUT.vessels.length, town: town, key: key, x: +p[0].toFixed(2), z: +p[1].toFixed(2), heading: +heading.toFixed(4), L: Dm.L, B: Dm.B, H: Dm.H, use: H.use, harbour: D.name, tag: null };
        if (tags) { var T = tags.add({ 'class': 'prop', kind: 'vessel', key: key, at: [Vr.x, 0, Vr.z], ry: heading - Math.PI / 2, size: [Dm.L, Dm.B, Dm.H], note: H.use + ' harbour', src: 'isle-demo' }); if (T) Vr.tag = T.id; }
        OUT.vessels.push(Vr); n++; cand.splice(i, 1); return;
      }
      OUT.failed.push({ key: key, role: 'vessel', why: 'no mooring found', harbour: D.name });
    });
    LOG['vessels ' + D.name.trim() + (H.part ? ' (' + H.use + ')' : '')] = n + ' of ' + list.length;
  };

  /* ---------------------------------------------------------------- the rules */
  var roleAt = function (p) {
    var r = KCITY.site.roleAt(p, DIST, { skip: ['zone', 'misc', 'beach', 'ceremonial', 'park', 'market', 'warriors', 'plaza', 'funerary'] });
    if (r) return r;
    if (PR.fringe && ZONE && !inPoly(p, ZONE.poly)) return 'fringe';
    return 'res';
  };
  var C0 = PR.centre;
  var wealth = function (p) { return KL.SL ? Math.max(0, Math.min(1, 0.85 - Math.hypot(p[0] - C0[0], p[1] - C0[1]) / PR.reach * 0.75 + 0.18 * (KRAND.vnoise(p[0] / 240, 0, p[1] / 240, seed) - 0.5))) : 0.5; };
  /* the hug (owner, 2026-10-18: "about half the buildings farms and orchards, the buildings hugging the coast, the
     landmarks and the major avenues"): the distance from the nearest shore, landmark or avenue (the drawn ones, the rings
     and the routed loop), on a coarse grid made at the first lot; the frontage of the roles PR.hug names thins with it
     from r0 to r1, down to `floor`. What is left open is farmland (the fields, after the plan) */
  var HUG = null;
  /* fromSite: before the plan has ways or landmarks (step 0), from the drawing itself: its avenues and markers */
  var hugGrid = function (fromSite) {
    var Hc = 20, hf = PR.half, n = Math.round(2 * hf / Hc) + 1, D = new Float32Array(n * n).fill(1e9), P = KL.plan(), i, j, k;
    var seedAt = function (x, z) { var a = Math.round((x + hf) / Hc), b = Math.round((z + hf) / Hc); if (a >= 0 && b >= 0 && a < n && b < n) D[b * n + a] = 0; };
    if (fromSite) {
      S.avenues.forEach(function (av) { KL.resample(av.pts, 10, false).forEach(function (q) { seedAt(q[0], q[1]); }); });
      S.markers.forEach(function (m) { seedAt(m.x, m.z); });
    } else {
      P.ways.forEach(function (w) { if (w.cls === 'avenue' || w.cls === 'highway') KL.resample(w.pts, 10, false).forEach(function (q) { seedAt(q[0], q[1]); }); });
      P.landmarks.forEach(function (L) { obbCorners(L.bo).concat([L.bo.c]).forEach(function (q) { seedAt(q[0], q[1]); }); });
    }
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
      var x = -hf + i * Hc, z = -hf + j * Hc;
      if (h(x, z) > 0.5 && (h(x + Hc, z) <= 0.5 || h(x - Hc, z) <= 0.5 || h(x, z + Hc) <= 0.5 || h(x, z - Hc) <= 0.5)) D[j * n + i] = 0;
    }
    var rel = function (a, b, c) { if (D[b] + c < D[a]) D[a] = D[b] + c; }, S2 = Hc * Math.SQRT2;
    for (j = 0; j < n; j++) for (i = 0; i < n; i++) { k = j * n + i; if (i) rel(k, k - 1, Hc); if (j) { rel(k, k - n, Hc); if (i) rel(k, k - n - 1, S2); if (i < n - 1) rel(k, k - n + 1, S2); } }
    for (j = n - 1; j >= 0; j--) for (i = n - 1; i >= 0; i--) { k = j * n + i; if (i < n - 1) rel(k, k + 1, Hc); if (j < n - 1) { rel(k, k + n, Hc); if (i < n - 1) rel(k, k + n + 1, S2); if (i) rel(k, k + n - 1, S2); } }
    return { at: function (x, z) { var a = Math.max(0, Math.min(n - 1, Math.round((x + hf) / Hc))), b = Math.max(0, Math.min(n - 1, Math.round((z + hf) / Hc))); return D[b * n + a]; } };
  };
  var hugAt = function (p) {
    if (!PR.hug) return 1;
    if (!HUG) HUG = hugGrid();
    var d = HUG.at(p[0], p[1]), Hg = PR.hug;
    return d <= Hg.r0 ? 1 : d >= Hg.r1 ? Hg.floor : 1 - (d - Hg.r0) / (Hg.r1 - Hg.r0) * (1 - Hg.floor);
  };
  var densAt = function (p) {
    var role = roleAt(p), D = PR.dens[role] != null ? PR.dens[role] : PR.dens.res, base;
    if (typeof D === 'number') base = D;
    else {
      var t = role === 'fringe' ? Math.min(1, polyOut(p) / PR.fringe) : Math.min(1, Math.hypot(p[0] - C0[0], p[1] - C0[1]) / PR.reach);
      base = D[0] + (D[1] - D[0]) * t;
    }
    return PR.hug && PR.hug.roles.indexOf(role) >= 0 ? base * hugAt(p) : base;
  };
  var polyOut = function (p) { var d = Infinity, P = ZONE.poly; for (var i = 0; i < P.length; i++) d = Math.min(d, segDist(p, P[i], P[(i + 1) % P.length])); return d; };
  var vacant = function (p, rs) { return rs.rnd() > densAt(p); };
  var chooser = function (cls) { return function (p, rs) { var D = ISLE.DRAWS[roleAt(p)]; return D ? SL.draw(rs, D[cls]) : KCITY.defaults.choosers[cls](p, rs); }; };

  /* ---------------------------------------------------------------- the world's steps 0-5 */
  var tune = {
    cell: PR.cell, rasterHalf: PR.half, mapHalf: PR.half, maxSlope: PR.maxSlope, exact: true,
    width: { avenue: W, main: 8, side: 5.5, alley: 3.2, highway: 10, lane: 4.5 },
    lot: PR.lot || { side: 2.2, setback: 2, rear: 4, inset: 1.0, step: 3 },
    classes: (function () { var C = {}; for (var k in ISLE.CLASSES) C[k] = ISLE.CLASSES[k]; for (var j in (PR.classes || {})) C[j] = PR.classes[j]; return C; })(), fallback: ISLE.FALLBACK,
    civic: PR.civic.map(function (c) { return { key: c.key, v: 0, near: c.near }; }), civicSpacing: 260,
    voidMax: 60, voidIters: 18, voidBatch: 14, sideSpacing: 70, sideMax: 240, alleyFrac: 0.2, blindMax: 90, interiorDepth: 12, interiorRounds: 2,
    avenueSnap: 80, ringGap: 8, verge: 6, centre: C0, reach: PR.reach,
    /* the hillside: a house's floor at its highest corner, its footing (piles, a stone plinth) down to the lowest */
    stance: 'high', stanceOpt: { maxDrop: PR.maxDrop == null ? 6 : PR.maxDrop },
    wall: { towerGap: 200, clear: 22, gateFind: 260, thick: 7, gateTower: 10, gatePass: 4 },
    plazaArt: { rich: ['none'], middle: ['none'], poor: ['none'], commerce: ['none'] }
  };
  for (var tk in (PR.tune || {})) tune[tk] = PR.tune[tk];   /* a town's own numbers (Valapo's open village: fewer, longer streets) */
  var world = [
    { name: 'the site and its ground', run: function () {
      var R = SL.R = new KL.Raster(tune.rasterHalf, tune.cell); R.occ.fill(OCC.OUT);
      var P = KL.plan(); P.site = DIST.map(function (d, i) { return { id: i, name: d.name, type: d.type, role: d.role, poly: d.poly }; });
      var zone = PR.fringe ? KL.offsetConvex(hull(ZONE.poly), PR.fringe, 6) : ZONE.poly;
      P.zone = zone;
      LOG.land = KCITY.site.zoneRaster(R, zone, { dry: 0.8, maxSlope: tune.maxSlope, h: h });
      /* a village that grows from its centre (PR.grow, the owner's Valapo: "close to shoreline and avenues and infill as
         needed ... going from the center out"): only ground within R of the centre, or within `hug` of the shore, an avenue
         or a marker, is built on; R is the dial that sets the size */
      if (PR.grow) {
        var HG = hugGrid(true), c0 = PR.centre, cut = 0;
        for (var jg = 0; jg < R.n; jg++) for (var ig = 0; ig < R.n; ig++) {
          var kg = jg * R.n + ig; if (R.occ[kg] !== OCC.FREE) continue;
          var xg = R.cx(ig), zg = R.cx(jg);
          if (Math.hypot(xg - c0[0], zg - c0[1]) > PR.grow.R && HG.at(xg, zg) > PR.grow.hug) { R.occ[kg] = OCC.OUT; cut++; }
        }
        LOG.land -= cut; LOG.grow = 'within ' + PR.grow.R + ' m of the centre or ' + PR.grow.hug + ' m of the shore, an avenue or a marker';
      }
      SL.minSpacing = KCITY.site.minSpacing();
    } },
    { name: 'landmarks', run: function () {
      var pk = PR.ring ? dist(PR.ring.district) : null, n = 0;
      if (pk) AVOID.push({ name: 'ring ' + pk.name, pts: ringOf(pk.poly, PR.ring.gap).concat([ringOf(pk.poly, PR.ring.gap)[0]]) });
      (PR.rings || []).forEach(function (nm) { var D = dist(nm); if (D) { var r = ringOf(D.poly, tune.ringGap); AVOID.push({ name: 'ring ' + nm, pts: r.concat([r[0]]) }); } });
      if (pk) PR.aligned.forEach(function (A) { var L = aligned(A, pk.poly, PR.ring.gap); if (L) { n++; if (A.ringed) LOG.squareLot = L.id; } });
      if (pk && PR.ringAround) { var nr = ringAround(PR.ringAround, pk.poly, PR.ring.gap); LOG.ringAround = nr; n += nr; }
      (PR.fixed || []).forEach(function (F) {
        var at = F.marker ? marker(F.marker) : null, D = F.district ? dist(F.district) : null;
        var p = F.at ? F.at : at ? [at.x, at.z] : D ? centroid(D.poly) : null; if (!p) { OUT.failed.push({ role: F.role, why: 'no ' + (F.marker || F.district) }); return; }
        var rs = rsOf('fixed:' + F.role);
        F.keys.forEach(function (key, i) {
          var a = rs.rr(0, Math.PI * 2), r = i ? (F.spread == null ? 40 : F.spread) * (0.6 + 0.4 * rs.rnd()) : 0, ry = rs.rr(0, Math.PI * 2);
          if (hunt(key, p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r, [ry, ry + Math.PI / 2, ry + Math.PI], { role: F.role, name: F.name || F.marker || F.district, radius: 200, step: 7 })) n++;
        });
      });
      if (PR.squareRing) { var Dq = dist(PR.squareRing.district); if (Dq) n += squareRing(Dq, PR.squareRing); }
      for (var nm in (PR.markets || {})) { var Dm = dist(nm); if (Dm) { var c = market(Dm, PR.markets[nm]); LOG['market ' + nm] = c; n += c; } }
      (PR.harbours || []).forEach(harbour);
      LOG.landmarks = n;
    } },
    { name: 'districts', run: function () {
      var P = KL.plan();
      DIST.forEach(function (d) {
        if (d.role === 'ceremonial' || d.role === 'park' || d.role === 'beach' || d.role === 'funerary') SL.R.eachInPoly(d.poly, function (k) { if (SL.R.occ[k] === OCC.FREE) SL.R.occ[k] = OCC.GREEN; });
        else if (d.role === 'market' || d.role === 'warriors' || d.role === 'plaza') SL.R.eachInPoly(d.poly, function (k) { if (SL.R.occ[k] === OCC.FREE) SL.R.occ[k] = OCC.HARD; });
        if (d.role !== 'zone') P.districts.push({ kind: d.role, name: d.name, poly: d.poly, born: 2, art: [] });
      });
    } },
    { name: 'avenues', run: function () {
      var av = KCITY.site.avenues(S.avenues, 3, { snap: tune.avenueSnap }), rings = 0;
      var pk = PR.ring ? dist(PR.ring.district) : null;
      if (pk) rings += KCITY.site.ring(ringOf(pk.poly, PR.ring.gap), 3, 'ring ' + pk.name, { dry: 0.8 });
      if (LOG.squareLot != null) { var Q = KL.plan().lots[LOG.squareLot]; rings += KCITY.site.ring(ringOf(obbCorners(Q.bo), 6), 3, 'ring the ceremonial square', { dry: 0.8 }); }
      (PR.rings || []).forEach(function (nm) { var D = dist(nm); if (D) rings += KCITY.site.ring(ringOf(D.poly, tune.ringGap), 3, 'ring ' + nm, { dry: 0.8 }); });
      /* the western loop (to draw): from ring to ring, routed over the ground */
      var specs = (PR.routes || []).map(function (r) {
        var A = dist(r.from), B = dist(r.to); if (!A || !B) return null;
        var ca = centroid(A.poly), cb = centroid(B.poly), ra = ringOf(A.poly, tune.ringGap), rb = ringOf(B.poly, tune.ringGap);
        var near = function (Rg, q) { var b = null, bd = Infinity; Rg.forEach(function (p) { var d = V.dist(p, q); if (d < bd) { bd = d; b = p; } }); return b; };
        return { name: r.name, from: near(ra, cb), to: near(rb, ca) };
      }).filter(Boolean);
      var rt = specs.length ? KCITY.site.routeAvenues(specs, 3, { h: h, maxSlope: tune.maxSlope, merge: 40, minRun: 60, maxSpan: 40, reach: 20 }) : { made: 0, failed: [] };
      if (rt.failed && rt.failed.length) LOG.routesFailed = rt.failed;
      LOG.avenues = av.made + ' drawn, ' + av.joins + ' joins, ' + rings + ' ring runs, ' + rt.made + ' routed' + (rt.failed && rt.failed.length ? ' (' + rt.failed.length + ' failed)' : '');
    } },
    { name: 'highways', run: function () {
      /* the start of each highway beyond the wall (PLAN 8a): a spur from its avenue's end out through the wall */
      LOG.spurs = 0;
      /* gates 'auto': every avenue end within 150 m of the build area's edge, heading out, gets a gate, named by the side of
         the town it opens on (North Gate, West Gate...; a second on one side is "2") */
      if (PR.gates === 'auto') {
        var zc = KL.polyCentroid(ZONE.poly), Zp = ZONE.poly, edgeD = function (q) { var d = Infinity; for (var i = 0; i < Zp.length; i++) d = Math.min(d, segDist(q, Zp[i], Zp[(i + 1) % Zp.length])); return d; };
        var found = [], seen = {};
        S.avenues.forEach(function (A) {
          var P = A.pts.filter(function (p, i) { return !i || V.dist(p, A.pts[i - 1]) > 1; }); if (P.length < 2) return;
          [[P[P.length - 1], P[P.length - 2]], [P[0], P[1]]].forEach(function (ep) {
            var e = ep[0], d = V.norm(V.sub(e, ep[1])); if (edgeD(e) > 150 || V.dot(d, V.sub(e, zc)) <= 0 || h(e[0], e[1]) < 2) return;
            var b = Math.atan2(e[0] - zc[0], -(e[1] - zc[1])) * 180 / Math.PI, side = b < -135 || b >= 135 ? 'South' : b < -45 ? 'West' : b < 45 ? 'North' : 'East';
            seen[side] = (seen[side] || 0) + 1;
            found.push({ name: side + ' Gate' + (seen[side] > 1 ? ' ' + seen[side] : ''), avenue: A.name, end: e, dir: d });
          });
        });
        PR.gates = found;
      }
      (PR.gates || []).forEach(function (Gt) {
        var A = avenue(Gt.avenue); if (!A) return;
        var P = A.pts.filter(function (p, i) { return !i || V.dist(p, A.pts[i - 1]) > 1; }), e = Gt.end || P[P.length - 1], d = Gt.dir || V.norm(V.sub(e, P[P.length - 2])), pts = [e];
        for (var s = 20; s <= 260; s += 20) { var q = V.add(e, V.mul(d, s)); if (SL.R.idx(q[0], q[1]) < 0 || h(q[0], q[1]) < 1) break; pts.push(q); }
        if (pts.length > 3) { var w = SL.addWay('highway', pts, 4, { tag: Gt.name, stamp: true }); w.gate = Gt.name; Gt._way = w; Gt._end = pts[pts.length - 1]; LOG.spurs++; }
      });
    } },
    { name: 'the wall and its gates', run: function () {
      if (!PR.wall) return;
      var T = tune.wall, P = KL.plan(), ways = P.ways.filter(function (w) { return w.cls === 'avenue' || w.cls === 'highway'; });
      var chain = ZONE.poly.concat([ZONE.poly[0]]);
      var named = (PR.gates || []).map(function (Gt) { var A = avenue(Gt.avenue), e = Gt.end || A.pts[A.pts.length - 1]; return { x: e[0], z: e[1], marker: Gt.avenue, name: Gt.name }; });
      var Wr = P.wallRec = KCITY.site.wall(chain, ways, { towerGap: T.towerGap, clear: T.clear, gateFind: T.gateFind, named: named });
      Wr.nodes.forEach(function (n) { n.gx = n.x; n.gz = n.z; if (n.kind === 'gate' && n.way) n.towerOff = ((tune.width[n.way.cls] == null ? 10 : tune.width[n.way.cls]) + T.gatePass) / 2 + T.gateTower / 2; });
      /* the sea is the harbour's wall: no run, tower or gate stands where the ground is under it */
      Wr.nodes.forEach(function (n) { if (h(n.gx, n.gz) < 1.5) { n.health = 0; n.skip = true; } });
      Wr.segs = KCITY.site.wallSegs(Wr.nodes.filter(function (n) { return !n.skip; }));
      Wr.segs = Wr.segs.filter(function (sg) { for (var t = 0; t <= 1; t += 0.1) if (h(sg.ax + (sg.bx - sg.ax) * t, sg.az + (sg.bz - sg.az) * t) < 1) return false; return true; });
      KCITY.site.stampWall(Wr, { thick: T.thick, step: 5, gateTower: T.gateTower });
      P.gates = Wr.gates.map(function (g) { return { p: [g.x, g.z], dir: g.name }; });
      LOG.wall = Wr.gates.length + ' gates (' + Wr.gates.filter(function (g) { return g.named; }).length + ' named), ' + Wr.nodes.filter(function (n) { return n.kind === 'tower' && !n.skip; }).length + ' towers, ' + Wr.segs.length + ' runs';
    } }
  ];
  /* the farmland: the zone's open ground left after the plan, in parcels of PR.farm.cell metres (every sample of a parcel
     free ground, clear of the streets, dry), each a paddy, an orchard or a field of the crop its block (three parcels a
     side) draws from the town's list for its ground (PLAN 8c) */
  OUT.fields = [];
  var fields = function () {
    var Fm = PR.farm; if (!Fm) return;
    var R = SL.R, c = Fm.cell, hf = PR.half;
    for (var z = -hf + c / 2; z < hf; z += c) for (var x = -hf + c / 2; x < hf; x += c) {
      var ok = true;
      for (var a = -1; a <= 1 && ok; a++) for (var b = -1; b <= 1 && ok; b++) {
        var px = x + a * c * 0.4, pz = z + b * c * 0.4, k = R.idx(px, pz);
        ok = k >= 0 && R.occ[k] === OCC.FREE && R.sd[k] > 5 && h(px, pz) > 1;
      }
      if (!ok) continue;
      var y = h(x, z), sl = G.slope(x, z), bi = Math.floor((x + hf) / (3 * c)), bj = Math.floor((z + hf) / (3 * c));
      var opts = Fm.crops.filter(function (C) { return (C.maxSlope == null || sl <= C.maxSlope) && (C.minH == null || y >= C.minH) && (C.maxH == null || y <= C.maxH); });
      if (!opts.length) continue;
      var tot = opts.reduce(function (s2, C) { return s2 + C.w; }, 0), r = KRAND.unit(KRAND.hash(seed, 31, bi, bj)) * tot, pick = opts[opts.length - 1];
      for (var q = 0; q < opts.length; q++) { r -= opts[q].w; if (r <= 0) { pick = opts[q]; break; } }
      var Fr = { id: town + '.f' + OUT.fields.length, town: town, kind: pick.kind, crop: pick.crop, x: +x.toFixed(1), z: +z.toFixed(1), y: +y.toFixed(2), size: c, tag: null };
      if (tags) { var T = tags.add({ 'class': 'feature', kind: 'field', key: 'field:' + pick.crop, at: [x, y, z], ry: 0, size: [c, c, 0], note: pick.kind + ' of ' + pick.crop, src: 'isle-demo' }); if (T) Fr.tag = T.id; }
      /* an orchard's trees are records too, each drawn from its own cell's stream (the field's grid cell and the tree's
         index: never the order the fields were listed in), registered under the field before the page draws them */
      if (pick.kind === 'orchard') {
        Fr.trees = [];
        var ci = Math.round((x + hf) / c), cj = Math.round((z + hf) / c);
        for (var t2 = 0; t2 < 5; t2++) {
          var u = KRAND.unit(KRAND.hash(seed, 37, ci, cj, t2 * 4)) - 0.5, v = KRAND.unit(KRAND.hash(seed, 37, ci, cj, t2 * 4 + 1)) - 0.5;
          var s = 3 + 3 * KRAND.unit(KRAND.hash(seed, 37, ci, cj, t2 * 4 + 2)), tx = x + u * c * 0.85, tz = z + v * c * 0.85, ty = h(tx, tz);
          var Tr = { x: +tx.toFixed(2), y: +ty.toFixed(2), z: +tz.toFixed(2), s: +s.toFixed(3), hgt: +(s * (pick.crop === 'coconut' ? 3.2 : 1.6)).toFixed(3) };
          if (tags && Fr.tag) tags.child(Fr.tag, { 'class': 'flora', kind: 'orchard tree', key: 'tree:' + pick.crop, at: [Tr.x, Tr.y, Tr.z], ry: 0, r: s, h: Tr.hgt, src: 'isle-demo' });
          Fr.trees.push(Tr);
        }
      }
      OUT.fields.push(Fr);
    }
    LOG.fields = OUT.fields.length + ' parcels, ' + Math.round(OUT.fields.length * c * c / 1e4) + ' ha';
  };
  var K = KCITY.create({
    name: town, tune: tune, site: S, seed: seed, rand: 'krand', index: { order: 'insertion' }, tags: tags,
    ground: { h: h, grid: G.grid }, kit: { dims: dims },
    rules: { wealth: wealth, roleAt: roleAt, vacant: vacant, choosers: { avenue: chooser('avenue'), main: chooser('main'), side: chooser('side'), alley: chooser('alley') },
      groundOk: KCITY.reliefOk({ dry: 0.8, maxRelief: PR.maxDrop == null ? 6 : PR.maxDrop }) },
    /* a village takes no alleys and no infill of its blocks (steps 6-11: PR.village) */
    steps: world.concat(KCITY.defaultSteps().slice(6, PR.village ? 12 : 13)),
    finish: [function () { (PR.harbours || []).forEach(moor); }, function () { fields(); }]
  });
  var t0 = Date.now(), P = K.run(); LOG.ms = Date.now() - t0; LOG.stepMs = P.stats.ms;
  /* how built the build area is (owner, 2026-10-18: at least two thirds buildings and streets, not farms, orchards or empty
     ground), on the plan's own raster: every cell of the build area on land (over 0.8 m, however steep), counted as built
     (a lot: the house and its compound yard; a landmark, market, plaza or the wall's band; a street or alley; an alley
     entrance) or open (free ground, which the farmland takes; parks; ground too steep to build). `roofs` is the share the
     buildings' own footprints cover. */
  var cover = (function () {
    var R = SL.R, c = { land: 0, built: 0, streets: 0, verges: 0, lots: 0, hard: 0, green: 0, free: 0, out: 0 }, Zp = ZONE.poly;
    R.eachInPoly(Zp, function (k, i, j) {
      if (h(R.cx(i), R.cx(j)) <= 0.8) return;
      c.land++; var v = R.occ[k];
      if (v === OCC.STREET || v === OCC.ALLEY) { c.built++; c.streets++; }
      else if (v === OCC.LOT || v === OCC.RESERVE) { c.built++; c.lots++; }
      else if (v === OCC.HARD) { c.built++; c.hard++; }
      else if (v === OCC.GREEN) c.green++;
      /* a street's verge: open ground within 2.5 m of its carriageway's edge (the kerb, the gaps between frontages) */
      else if (v === OCC.FREE && R.sdw[k] >= 0 && P.ways[R.sdw[k]] && R.sd[k] <= P.ways[R.sdw[k]].w / 2 + 2.5) { c.built++; c.verges++; }
      else if (v === OCC.FREE) c.free++; else c.out++;
    });
    var a = R.c * R.c, roofs = 0;
    P.lots.forEach(function (L) { if (L.died == null && L.bo && inPoly([L.x, L.z], Zp)) roofs += L.w * L.d; });
    var r = function (n) { return +(n * a / 1e6).toFixed(3); };
    return { landKm2: r(c.land), share: +(c.built / Math.max(1, c.land)).toFixed(3), streets: +(c.streets / c.land).toFixed(3), verges: +(c.verges / c.land).toFixed(3), lots: +(c.lots / c.land).toFixed(3),
      landmarksAndMarkets: +(c.hard / c.land).toFixed(3), parks: +(c.green / c.land).toFixed(3), open: +(c.free / c.land).toFixed(3), steepOrOut: +(c.out / c.land).toFixed(3),
      roofs: +(roofs / (c.land * a)).toFixed(3) };
  })();
  LOG.cover = cover;

  /* ---------------------------------------------------------------- the records */
  var kitOf = function (key) { var D = o.dims(key, 0); return D ? D.kit : null; };
  var lots = P.lots.filter(function (L) { return L.died == null && L.bo; }).map(function (L) {
    return { id: town + '.' + L.id, lot: L.id, marker: L.marker || null, moved: L.moved == null ? null : L.moved, town: town, kit: kitOf(L.key), key: L.key, v: L.v || 0, cls: L.cls, role: L.role || null, name: L.name || null,
      district: L.cls === 'landmark' ? (L.name || L.role) : roleAt([L.x, L.z]), x: +L.x.toFixed(2), z: +L.z.toFixed(2), y: +L.y.toFixed(2), ry: +L.ry.toFixed(4),
      w: L.w, d: L.d, h: L.h, yard: L.cls !== 'landmark' && L.lot ? { c: L.lot.c, u: L.lot.u, v: L.lot.v, hw: L.lot.hw, hd: L.lot.hd } : null, drop: L.drop == null ? null : +L.drop.toFixed(2), terrace: L.terrace || null, shore: !!L.shore, harbour: L.harbour || null, tag: L.tag || null, wealth: +(L.wealth || 0).toFixed(2), bo: L.bo };
  });
  /* the wall as pieces: runs of the kit's wall, towers and gates (its records, KCITY.site.wall) */
  var Wr = P.wallRec;
  if (Wr) {
    var wd = dims('ie-wall', 0), gd = dims('ie-gate', 0), td = dims('ie-watchtower', 0);
    var piece = function (key, x, z, ry, it, role) {
      var C = obbCorners(obb([x, z], uOf(ry), it.w / 2, it.d / 2)), y = Math.min.apply(null, C.concat([[x, z]]).map(function (p) { return h(p[0], p[1]); })) - 0.3;
      var R = { id: town + '.w' + OUT.wall.length, town: town, kit: kitOf(key), key: key, v: 0, cls: 'wall', role: role, x: +x.toFixed(2), z: +z.toFixed(2), y: +y.toFixed(2), ry: +ry.toFixed(4), w: it.w, d: it.d, h: it.h, tag: null };
      if (tags) { var T = tags.add({ 'class': 'infrastructure', key: key, at: [x, y, z], ry: ry, size: [it.w, it.d, it.h], note: role, src: 'isle-demo' }); if (T) R.tag = T.id; }
      OUT.wall.push(R);
    };
    if (wd) Wr.segs.forEach(function (sg) {
      var L = Math.hypot(sg.bx - sg.ax, sg.bz - sg.az), n = Math.max(1, Math.round(L / (wd.w - 0.4))), ry = Math.atan2(-(sg.bz - sg.az), sg.bx - sg.ax);
      for (var i = 0; i < n; i++) { var t = (i + 0.5) / n; piece('ie-wall', sg.ax + (sg.bx - sg.ax) * t, sg.az + (sg.bz - sg.az) * t, ry, { w: L / n + 0.4, d: wd.d, h: wd.h }, 'wall'); }
    });
    Wr.nodes.forEach(function (n) {
      if (n.skip) return;
      if (n.kind === 'tower' && td) piece('ie-watchtower', n.gx, n.gz, n.ry, td, 'wall tower');
      if (n.kind === 'gate' && gd) piece('ie-gate', n.gx, n.gz, n.ry + Math.PI / 2, gd, n.name || 'gate');
    });
  }
  /* beyond the square: world records, placed later by the open world */
  (PR.beyond || []).forEach(function (B, i) {
    var R = { id: town + '.world' + i, town: town, kind: B.kind, note: B.note, placed: false };
    if (B.from === 'the gates') R.from = (PR.gates || []).filter(function (Gt) { return Gt._end; }).map(function (Gt) { return { gate: Gt.name, at: [+Gt._end[0].toFixed(1), +Gt._end[1].toFixed(1)] }; });
    else if (B.from) { var g = (PR.gates || []).filter(function (Gt) { return Gt.name === B.from; })[0]; if (g && g._end) R.from = [+g._end[0].toFixed(1), +g._end[1].toFixed(1)]; else R.from = B.from; }
    if (B.to) R.to = B.to;
    if (B.ring) {
      var rs = rsOf('beyond:' + B.kind), pts = [], c = centroid(ZONE.poly), F = G.frame, guard = 0;
      while (pts.length < B.count && guard++ < B.count * 40) {
        var a = rs.rr(0, Math.PI * 2), rr = rs.rr(B.ring[0], B.ring[1]), e = 0, P2 = ZONE.poly;
        P2.forEach(function (q) { e = Math.max(e, V.dist(q, c)); });
        var x = c[0] + Math.cos(a) * (e + rr), z = c[1] + Math.sin(a) * (e + rr), y = WORLD.H(F.x + x, F.z + z) - F.sea;
        if (y > 2 && y < 900) pts.push([+x.toFixed(1), +z.toFixed(1), +y.toFixed(1)]);
      }
      R.sites = pts;
    }
    if (B.box) {
      var F2 = G.frame, bb = null, by = -Infinity;
      for (var zz = B.box[0][1]; zz <= B.box[1][1]; zz += 250) for (var xx = B.box[0][0]; xx <= B.box[1][0]; xx += 250) {
        var yy = WORLD.H(F2.x + xx, F2.z + zz) - F2.sea, sl = Math.hypot(WORLD.H(F2.x + xx + 30, F2.z + zz) - WORLD.H(F2.x + xx - 30, F2.z + zz), WORLD.H(F2.x + xx, F2.z + zz + 30) - WORLD.H(F2.x + xx, F2.z + zz - 30)) / 60;
        var sc = yy >= B.minH && yy <= B.minH + 400 ? -sl - Math.hypot(xx + 9000, zz - 13000) / 1e5 : -Infinity;
        if (sc > by) { by = sc; bb = [xx, zz, yy]; }
      }
      if (bb) { R.at = [bb[0], bb[1], +bb[2].toFixed(1)]; R.node = B.node; R.grade = 'x1'; }
    }
    if (B.count && !B.ring) R.count = B.count;
    OUT.world.push(R);
  });
  return { town: town, K: K, plan: P, lots: lots, wall: OUT.wall, vessels: OUT.vessels, landings: OUT.landings, world: OUT.world, districts: DIST, fields: OUT.fields, cover: cover, prog: PR,
    hug: function (x, z) { return HUG ? HUG.at(x, z) : null; },
    log: LOG, missing: OUT.missing, failed: OUT.failed, seed: seed, tune: tune };
};
