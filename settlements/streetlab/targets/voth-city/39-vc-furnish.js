/* ============================== 5h. PARK AND PLAZA FURNITURE ============================== */
/* [G data] Voth's outdoor pieces from the furniture catalog (kits/catalog/krator-master-furniture.js, its Voth section,
   lifted by build.py): benches, the abstract robed statue, the wayside shrine, the obelisk, the street brazier
   (owner, 2026-10-09: "shrines, statuary, benches and the like").
   - the site's parks: benches along the edges facing in, statues at the middle and the corners, a wayside shrine on an
     edge facing in, an obelisk at the middle of the largest;
   - the site's plaza: benches in a ring round its fountain, statues at its corners, braziers;
   - the pocket parks and small plazas the street method left: a bench facing in, sometimes a statue.
   Every piece is a record (PLAN.districts kind 'furniture', art {key, v, x, y, z, ry}) clear of streets, lots, lamps,
   art and each other, inside its green; the flora's mask (38) leaves its footprint bare. The host draws the records. */

VC.furnDims = function (key, v) {
  var A = typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[key]; if (!A) return null;
  var d = (A.variantDims && A.variantDims[v]) || A;
  return { w: d.w, d: d.d, h: d.h };
};
/* a piece's footprint: local +z is its front, so ry = atan2(f) faces it along f */
VC.furnOBB = function (c, ry, D, m) { return obb(c, [Math.cos(ry), -Math.sin(ry)], D.w / 2 + (m || 0), D.d / 2 + (m || 0)); };
VC.parkFurniture = function () {
  var T = TUNE.parkFurn, rs = SL.stream(9101), R = SL.R, placed = [], made = {}, lampHit = [];
  if (typeof FURN_BY_KEY === 'undefined' || !FURN_BY_KEY.voth_bench) { SL.note(SL.LAST, 'park furniture: no Voth furniture in the page'); return; }
  (PLAN.lamps || []).forEach(function (l) { lampHit.push(obb([l.x, l.z], [1, 0], 0.8, 0.8)); });
  var free = function (o, poly) {
    var C = obbCorners(o).concat([o.c]);
    for (var i = 0; i < C.length; i++) {
      var p = C[i]; if (poly && !inPoly(p, poly)) return false;
      if (baseH(p[0], p[1]) < 0.6) return false;
      var c = R.at(p[0], p[1]); if (c === OCC.STREET || c === OCC.ALLEY || c === OCC.LOT || c === OCC.HARD) return false;
    }
    return !SL.clash(o) && !VC.anyHit(o, placed, T.gap) && !VC.anyHit(o, lampHit, 0);
  };
  var put = function (D, key, v, c, ry, poly) {
    var dm = VC.furnDims(key, v); if (!dm) return false;
    var o = VC.furnOBB(c, ry, dm); if (!free(o, poly)) return false;
    D.art.push({ key: key, v: v, x: c[0], y: baseH(c[0], c[1]), z: c[1], ry: ry, furn: true });
    placed.push(o); made[key] = (made[key] || 0) + 1;
    return true;
  };
  var face = function (from, to) { return Math.atan2(to[0] - from[0], to[1] - from[1]); };
  var inward = function (poly, a, b) {
    var t = V.norm(V.sub(b, a)), n = V.perp(t), m = V.mul(V.add(a, b), 0.5);
    return inPoly(V.add(m, V.mul(n, 1)), poly) ? n : V.mul(n, -1);
  };
  /* benches every `every` metres along each edge, `inset` inside it, facing in */
  var edgeBenches = function (D, poly, every, inset) {
    var n = 0;
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length], L = V.dist(a, b); if (L < 6) continue;
      var nr = inward(poly, a, b), t = V.norm(V.sub(b, a)), k = Math.max(1, Math.floor(L / every));
      for (var j = 0; j < k; j++) {
        var c = V.add(V.add(a, V.mul(t, (j + 0.5) * L / k)), V.mul(nr, inset));
        if (put(D, 'voth_bench', rs.chance(0.6) ? 1 : 0, c, Math.atan2(nr[0], nr[1]), poly)) n++;
      }
    }
    return n;
  };
  var record = function (name, born) { var D = { kind: 'furniture', name: name, art: [], born: born }; PLAN.districts.push(D); return D; };

  /* the site's parks */
  var parks = VC.districts('park').map(function (d) { return { d: d, a: Math.abs(polyArea(d.poly)) }; }).sort(function (x, y) { return y.a - x.a; });
  parks.forEach(function (P, pi) {
    var poly = P.d.poly, D = record(P.d.name + ' furniture', 2), mid = polyCentroid(poly);
    if (pi === 0 && P.a >= T.obeliskArea) put(D, 'voth_obelisk', 0, mid, 0, poly);
    else put(D, 'voth_statue', 0, mid, rs.rr(0, 6.28), poly);
    /* a wayside shrine on the longest edges first, facing in */
    if (P.a >= T.shrineArea) {
      var edges = poly.map(function (a, i) { return [a, poly[(i + 1) % poly.length]]; }).sort(function (x, y) { return V.dist(y[0], y[1]) - V.dist(x[0], x[1]); });
      for (var e = 0, done = false; e < edges.length && !done; e++) for (var f = 0.5; f < 1 && !done; f += 0.15) {
        var nr = inward(poly, edges[e][0], edges[e][1]), c = V.add(V.lerp(edges[e][0], edges[e][1], f), V.mul(nr, T.shrineInset));
        done = put(D, 'voth_wayside_shrine', 0, c, Math.atan2(nr[0], nr[1]), poly);
      }
    }
    /* statues at the corners, turned to the middle */
    if (P.a >= T.statueArea) {
      var st = 0;
      poly.forEach(function (p) { if (st >= T.statues) return; var c = V.add(p, V.mul(V.norm(V.sub(mid, p)), T.cornerInset)); if (put(D, 'voth_statue', rs.chance(0.5) ? 0 : 1, c, face(c, mid), poly)) st++; });
    }
    edgeBenches(D, poly, T.benchEvery, T.benchInset);
  });
  /* the site's plazas: a ring of benches round the fountain, statues and braziers at the corners */
  VC.districts('plaza').forEach(function (d) {
    var poly = d.poly, D = record(d.name + ' furniture', 2), mid = polyCentroid(poly);
    placed.push(obb(mid, [1, 0], T.fountain, T.fountain));
    for (var i = 0; i < T.plazaBenches; i++) { var th = i / T.plazaBenches * Math.PI * 2, c = [mid[0] + Math.cos(th) * T.plazaR, mid[1] + Math.sin(th) * T.plazaR]; put(D, 'voth_bench', 1, c, face(c, mid), poly); }
    poly.forEach(function (p, k) {
      var c = V.add(p, V.mul(V.norm(V.sub(mid, p)), T.cornerInset));
      if (k % 2 === 0) put(D, 'voth_statue', 1, c, face(c, mid), poly); else put(D, 'voth_street_brazier', 0, c, 0, poly);
    });
  });
  /* the pocket parks and the small plazas the street method left */
  var pockets = record('pocket greens furniture', 12), np = 0;
  PLAN.greens.forEach(function (G) {
    if (G.kind !== 'park' && G.kind !== 'plaza') return;
    var poly = G.poly, mid = G.art ? [G.art.x, G.art.z] : polyCentroid(poly);
    if (G.art) placed.push(obb(mid, [1, 0], T.pocketFountain, T.pocketFountain));
    var want = G.kind === 'park' ? T.pocketBench : T.plazaBench;
    if (rs.chance(want)) {
      /* the longest edge, its middle, inset, facing in (or facing the fountain) */
      var best = 0; for (var i = 1; i < poly.length; i++) if (V.dist(poly[i], poly[(i + 1) % poly.length]) > V.dist(poly[best], poly[(best + 1) % poly.length])) best = i;
      var a = poly[best], b = poly[(best + 1) % poly.length], nr = inward(poly, a, b), c = V.add(V.lerp(a, b, 0.5), V.mul(nr, T.pocketInset));
      if (put(pockets, 'voth_bench', rs.chance(0.5) ? 1 : 0, c, G.art ? face(c, mid) : Math.atan2(nr[0], nr[1]), poly)) np++;
    }
    if (G.kind === 'park' && !G.art && rs.chance(T.pocketStatue)) put(pockets, 'voth_statue', 1, mid, rs.rr(0, 6.28), poly);
  });
  VC.furnPlaced = placed;
  SL.note(SL.LAST, 'park and plaza furniture: ' + Object.keys(made).map(function (k) { return made[k] + ' ' + k.replace('voth_', '').replace(/_/g, ' '); }).join(', ') +
    ' (' + np + ' benches in the pocket greens)');
};
