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
  var T = TUNE.parkFurn, rs = SL.stream(9101), R = SL.R, placed = [], made = {}, lampHit = [], walkO = [];
  if (typeof FURN_BY_KEY === 'undefined' || !FURN_BY_KEY.voth_bench) { SL.note(SL.LAST, 'park furniture: no Voth furniture in the page'); return; }
  (PLAN.lamps || []).forEach(function (l) { lampHit.push(obb([l.x, l.z], [1, 0], 0.8, 0.8)); });
  var free = function (o, poly) {
    var C = obbCorners(o).concat([o.c]);
    for (var i = 0; i < C.length; i++) {
      var p = C[i]; if (poly && !inPoly(p, poly)) return false;
      if (baseH(p[0], p[1]) < 0.6) return false;
      var c = R.at(p[0], p[1]); if (c === OCC.STREET || c === OCC.ALLEY || c === OCC.LOT || c === OCC.HARD) return false;
    }
    return !SL.clash(o) && !VC.anyHit(o, placed, T.gap) && !VC.anyHit(o, lampHit, 0) && !VC.anyHit(o, walkO, T.walkGap);
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
  /* the big parks (owner, 2026-10-09: "flesh out the parks a bit more, many of them are sparse in terms of flora and
     public furniture, esp the big park districts"): gravel walks from a ring round the middle out to the middles of
     its longest edges (a street's side), lanterns and benches along them, an avenue of cherry and dragon trees, then
     a lattice of groves, flower gardens, braziers with benches round them, wells and shrines between the walks. The
     walks and the plants are records (VC.parkWalks, VC.parkFlora): the overlay paints the walks (55 VC.paint), the
     flora mask keeps them and the planted trees bare (38), the host plants the flora with the biome's own builders
     (55 VC.floraPlace). Every choice is a KRAND hash of the park and the spot (never the draws before it). */
  var U = function (name, a, b, s) { return KRAND.unit(KRAND.hash(9201, name.length * 131 + name.charCodeAt(name.length - 1), Math.round(a * 2), Math.round(b * 2), s)); };
  var walkFree = function (p, r) { for (var i = 0; i < VC.parkWalks.length; i++) { var w = VC.parkWalks[i]; if (segDist(p, w.a, w.b) < w.w / 2 + r) return false; } return true; };
  var treeFree = function (p, r) { for (var i = 0; i < VC.parkFlora.length; i++) { var f = VC.parkFlora[i]; if (f.tree && V.dist(p, [f.x, f.z]) < r) return false; } return true; };
  var spotFree = function (p, r, poly) { return inPoly(p, poly) && polyEdgeDist(p, poly) > r && baseH(p[0], p[1]) >= 0.6 && free(obb(p, [1, 0], r * 0.5, r * 0.5), poly); };
  var tree = function (p, name, s, poly) {
    if (!spotFree(p, 2, poly) || !walkFree(p, 2.2) || !treeFree(p, T.treeGap)) return false;
    var kind = U(name, p[0], p[1], s) < T.cherry ? 'cherry' : 'dragon';
    VC.parkFlora.push({ tree: kind, x: p[0], z: p[1], u: U(name, p[0], p[1], s + 1) }); return true;
  };
  var plants = function (c, name, s, n, rad, poly) {
    var K = TUNE.flora.placed.garden, keys = Object.keys(K);
    for (var i = 0; i < n; i++) {
      var th = U(name, c[0], c[1], s + i * 3) * 6.283, r = rad * Math.sqrt(U(name, c[0], c[1], s + i * 3 + 1)), p = [c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r];
      if (!inPoly(p, poly) || !walkFree(p, 0.6) || VC.anyHit(obb(p, [1, 0], 0.4, 0.4), placed, 0.2)) continue;
      var v = U(name, c[0], c[1], s + i * 3 + 2), acc = 0, kind = keys[0];
      for (var k = 0; k < keys.length; k++) { acc += K[keys[k]]; if (v < acc) { kind = keys[k]; break; } }
      VC.parkFlora.push({ plant: kind, x: p[0], z: p[1] });
    }
  };
  var parkWalks = function (D, poly, mid, name) {
    var w = T.walkW, ring = [], edges = poly.map(function (a, i) { return [a, poly[(i + 1) % poly.length]]; })
      .filter(function (e) { return V.dist(e[0], e[1]) >= T.walkEdge; })
      .sort(function (x, y) { return V.dist(y[0], y[1]) - V.dist(x[0], x[1]); }).slice(0, T.walks);
    for (var i = 0; i < T.ringN; i++) {
      var a0 = i / T.ringN * 6.283, a1 = (i + 1) / T.ringN * 6.283;
      ring.push({ a: [mid[0] + Math.cos(a0) * T.ringR, mid[1] + Math.sin(a0) * T.ringR], b: [mid[0] + Math.cos(a1) * T.ringR, mid[1] + Math.sin(a1) * T.ringR], w: w, park: name });
    }
    var spokes = [];
    edges.forEach(function (e) {
      var m = V.lerp(e[0], e[1], 0.5), dir = V.norm(V.sub(m, mid)), a = V.add(mid, V.mul(dir, T.ringR));
      for (var f = 0.1; f < 1; f += 0.1) if (!inPoly(V.lerp(a, m, f), poly)) return;
      spokes.push({ a: a, b: m, w: w, park: name, spoke: true });
    });
    ring.concat(spokes).forEach(function (s) {
      VC.parkWalks.push(s);
      var L = V.dist(s.a, s.b), d = V.norm(V.sub(s.b, s.a)); walkO.push(obb(V.lerp(s.a, s.b, 0.5), d, L / 2, w / 2));
    });
    /* benches round the ring, facing the middle */
    for (var k = 0; k < T.ringBenches; k++) { var th = (k + 0.5) / T.ringBenches * 6.283, c = [mid[0] + Math.cos(th) * (T.ringR + w / 2 + 1.4), mid[1] + Math.sin(th) * (T.ringR + w / 2 + 1.4)]; put(D, 'voth_bench', 1, c, face(c, mid), poly); }
    /* along each spoke: lanterns on alternate sides, benches facing the walk, an avenue of trees behind them */
    spokes.forEach(function (s, si) {
      var L = V.dist(s.a, s.b), d = V.norm(V.sub(s.b, s.a)), n = V.perp(d);
      for (var x = T.lampEvery / 2; x < L - 6; x += T.lampEvery) {
        var sd = Math.floor(x / T.lampEvery) % 2 ? 1 : -1, c = V.add(V.add(s.a, V.mul(d, x)), V.mul(n, sd * (w / 2 + 1.3)));
        put(D, 'voth_lantern_fixture', 0, c, 0, poly);
      }
      for (var x2 = T.walkBench; x2 < L - 8; x2 += T.walkBench) [-1, 1].forEach(function (sd) {
        var c = V.add(V.add(s.a, V.mul(d, x2)), V.mul(n, sd * (w / 2 + 1.5))), f = V.mul(n, -sd);
        put(D, 'voth_bench', U(name, c[0], c[1], 3) < 0.5 ? 1 : 0, c, Math.atan2(f[0], f[1]), poly);
      });
      for (var x3 = T.treeEvery / 2; x3 < L - 4; x3 += T.treeEvery) [-1, 1].forEach(function (sd) {
        tree(V.add(V.add(s.a, V.mul(d, x3)), V.mul(n, sd * (w / 2 + T.treeOff))), name, 10 + si, poly);
      });
    });
  };
  var parkGroves = function (D, poly, mid, name) {
    var xs = poly.map(function (p) { return p[0]; }), zs = poly.map(function (p) { return p[1]; }), G = T.groveEvery, made2 = {};
    for (var x = Math.min.apply(null, xs) + G / 2; x < Math.max.apply(null, xs); x += G) for (var z = Math.min.apply(null, zs) + G / 2; z < Math.max.apply(null, zs); z += G) {
      var c = [x + (U(name, x, z, 1) - 0.5) * G * 0.4, z + (U(name, x, z, 2) - 0.5) * G * 0.4];
      if (!inPoly(c, poly) || polyEdgeDist(c, poly) < T.groveInset || V.dist(c, mid) < T.ringR + 10 || !walkFree(c, 5)) continue;
      var r = U(name, x, z, 3), kind;
      if (r < T.grove.grove) {
        kind = 'grove'; var nt = 3 + Math.floor(U(name, x, z, 4) * 3);
        for (var i = 0; i < nt; i++) { var th = U(name, x, z, 20 + i) * 6.283, rr = 3 + U(name, x, z, 30 + i) * 6; tree([c[0] + Math.cos(th) * rr, c[1] + Math.sin(th) * rr], name, 40 + i, poly); }
        plants(c, name, 60, 8, 8, poly);
      } else if (r < T.grove.grove + T.grove.garden) {
        kind = 'garden'; plants(c, name, 80, 16, 5, poly);
      } else if (r < T.grove.grove + T.grove.garden + T.grove.hearth) {
        kind = 'hearth';
        if (put(D, 'voth_street_brazier', 0, c, 0, poly)) for (var b = 0; b < 3; b++) { var tb = (b / 3 + U(name, x, z, 5)) * 6.283, cb = [c[0] + Math.cos(tb) * 3.4, c[1] + Math.sin(tb) * 3.4]; put(D, 'voth_bench', 0, cb, face(cb, c), poly); }
        plants(c, name, 100, 6, 7, poly);
      } else if (r < T.grove.grove + T.grove.garden + T.grove.hearth + T.grove.well) {
        kind = 'well'; put(D, 'voth_well', 0, c, U(name, x, z, 6) * 6.283, poly); plants(c, name, 120, 6, 6, poly);
      } else {
        kind = 'shrine'; var tw = face(c, mid); put(D, 'voth_wayside_shrine', 0, c, tw, poly); plants(c, name, 140, 5, 4, poly);
      }
      made2[kind] = (made2[kind] || 0) + 1;
    }
    VC.parkGroveLog.push(name + ': ' + Object.keys(made2).map(function (k) { return made2[k] + ' ' + k; }).join(', '));
  };
  VC.parkWalks = []; VC.parkFlora = []; VC.parkGroveLog = [];
  var record = function (name, born) { var D = { kind: 'furniture', name: name, art: [], born: born }; PLAN.districts.push(D); return D; };

  /* the site's parks */
  var parks = VC.districts('park').map(function (d) { return { d: d, a: Math.abs(polyArea(d.poly)) }; }).sort(function (x, y) { return y.a - x.a; });
  parks.forEach(function (P, pi) {
    var poly = P.d.poly, D = record(P.d.name + ' furniture', 2), mid = polyCentroid(poly);
    if (pi === 0 && P.a >= T.obeliskArea) put(D, 'voth_obelisk', 0, mid, 0, poly);
    else put(D, 'voth_statue', 0, mid, rs.rr(0, 6.28), poly);
    if (P.a >= T.walkArea) parkWalks(D, poly, mid, P.d.name);
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
    if (P.a >= T.walkArea) parkGroves(D, poly, mid, P.d.name);
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
  SL.note(SL.LAST, 'park walks and groves: ' + VC.parkWalks.length + ' walk segments, ' + VC.parkFlora.filter(function (f) { return f.tree; }).length + ' trees and ' +
    VC.parkFlora.filter(function (f) { return f.plant; }).length + ' plants placed; ' + VC.parkGroveLog.join('; '));
  SL.note(SL.LAST, 'park and plaza furniture: ' + Object.keys(made).map(function (k) { return made[k] + ' ' + k.replace('voth_', '').replace(/_/g, ' '); }).join(', ') +
    ' (' + np + ' benches in the pocket greens)');
};
