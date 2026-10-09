/* ============================== 5b. THE MONASTERY, THE CLAN COMPOUNDS, THE COUNTRY ============================== */
/* [G data] Owner, 2026-10-09:
   - the monastery is walled round the owner's own polygon (not Voth's 145 x 120 rectangle, which ran into Park 3),
     with more farms, coops and dormitories, laid out by Voth's own monastery builders (61-monastery.js);
   - at least 7 clan compounds between the two 'clan compounds' districts;
   - after the city: sparse suburbs toward the S, SE and NE fading into farmland; farmland to the NW and SW; a small
     farming village by S10 and by S11; orchards on the slopes of the west hill. Nothing is strung along the highways
     themselves: suburbs and farms sit on lanes and tracks off them. */

/* ---------------------------------------------------------------- shared: an oriented footprint and its tests */
VC.obbAt = function (c, ry, hw, hd) { return obb(c, [Math.cos(ry), -Math.sin(ry)], hw, hd); };   /* local x of Voth's loc(): (cos ry, -sin ry) */
VC.grow = function (o, m) { return obb(o.c, o.u, o.hw + m, o.hd + m); };
VC.samples = function (o) { var C = obbCorners(o), out = C.concat([o.c]); for (var i = 0; i < 4; i++) out.push(V.lerp(C[i], C[(i + 1) % 4], 0.5)); return out; };
VC.relief = function (o) { var lo = Infinity, hi = -Infinity; VC.samples(o).forEach(function (p) { var h = baseH(p[0], p[1]); lo = Math.min(lo, h); hi = Math.max(hi, h); }); return { lo: lo, hi: hi }; };
VC.anyHit = function (o, list, m) { var g = m ? VC.grow(o, m) : o; for (var i = 0; i < list.length; i++) if (SL.pen(g, list[i]) > 0) return true; return false; };

/* ---------------------------------------------------------------- step 2: the monastery round its polygon */
VC.buildMonastery = function (d) {
  var B = VOTH, P = d.poly, M = TUNE.monastery, MO = B.MONASTERY, n = P.length;
  var keepOut = PLAN.site.filter(function (q) { return q !== d && (q.role === 'park' || q.role === 'plaza' || q.role === 'market' || q.role === 'funerary'); });
  B.reseed(61061);
  var cen = polyCentroid(P), T = B.CIDX.Temple, toT = V.norm([T.x - cen[0], T.z - cen[1]]);
  var ccw = polyArea(P) > 0;                      /* outward normal of edge a->b: (dz, -dx) when the polygon runs one way */
  var edges = [];
  for (var i = 0; i < n; i++) {
    var a = P[i], b = P[(i + 1) % n], e = V.sub(b, a), L = V.len(e), t = V.mul(e, 1 / (L || 1)), out = ccw ? [t[1], -t[0]] : [-t[1], t[0]];
    if (inPoly(V.add(V.lerp(a, b, 0.5), V.mul(out, 3)), P)) out = V.mul(out, -1);
    edges.push({ a: a, b: b, L: L, t: t, out: out, gate: 0 });
  }
  /* the frame the buildings and fields square to: the longest edge */
  var long = edges.reduce(function (m, e) { return e.L > m.L ? e : m; }, edges[0]), ryF = Math.atan2(-long.t[1], long.t[0]);
  /* the main gate on the edge that faces the Temple canton (Voth: "both its gate and the chapel face the temple"),
     small side gates on the two edges nearest an avenue */
  var gateE = edges.filter(function (e) { return e.L > M.gateW + 30; }).reduce(function (m, e) { return !m || V.dot(e.out, toT) > V.dot(m.out, toT) ? e : m; }, null);
  if (gateE) gateE.gate = 2;
  edges.filter(function (e) { return e.gate === 0 && e.L > 50; }).map(function (e) { var m = V.lerp(e.a, e.b, 0.5); return { e: e, d: V.dist(m, VC.towardAvenue(m)) }; })
    .sort(function (p, q) { return p.d - q.d; }).slice(0, M.sideGates).forEach(function (x) { if (x.d < 160) x.e.gate = 1; });
  var placed = [], counts = { dorm: 0, coop: 0, field: 0, pen: 0, store: 0 };
  VC.capture('monastery', 2, function () {
    var col = B.pick(B.BASALTC), wh = B.rr(MO.wallH[0], MO.wallH[1]), wt = MO.wallT, cap = B.shade(col, -0.24);
    /* ---- the curtain wall on the polygon, in runs that follow the ground, towers at the corners */
    edges.forEach(function (e) {
      var gw = e.gate === 2 ? M.gateW : e.gate === 1 ? M.sideGateW : 0, runs = gw ? [[0, e.L / 2 - gw / 2], [e.L / 2 + gw / 2, e.L]] : [[0, e.L]];
      runs.forEach(function (r) {
        var k = Math.max(1, Math.ceil((r[1] - r[0]) / 18));
        for (var j = 0; j < k; j++) {
          var s0 = r[0] + (r[1] - r[0]) * j / k, s1 = r[0] + (r[1] - r[0]) * (j + 1) / k, len = s1 - s0, m = V.add(e.a, V.mul(e.t, (s0 + s1) / 2)), ry = Math.atan2(e.t[0], e.t[1]);
          var f = B.footing(m[0], m[1], wt / 2, len / 2, ry);
          B.BOX(m[0], f.lo - 0.5, m[1], wt, f.hi - f.lo + wh + 0.5, len * 1.02, ry, col);
          B.BOX(m[0], f.hi + wh, m[1], wt * 1.3, 1.2, len * 1.02, ry, cap);
          placed.push(VC.obbAt(m, ry, wt / 2 + 1, len / 2));
        }
      });
      var ft = B.footing(e.a[0], e.a[1], 3.5, 3.5, 0);
      B.FR8(e.a[0], ft.lo - 0.5, e.a[1], 7.0, ft.hi - ft.lo + wh * 1.35 + 0.5, 7.0, Math.atan2(e.t[0], e.t[1]), B.shade(col, -0.05));
      B.BOX(e.a[0], ft.hi + wh * 1.35, e.a[1], 8.2, 1.4, 8.2, Math.atan2(e.t[0], e.t[1]), B.shade(col, -0.2));
      if (!gw) return;
      /* the gate: Voth's own vocabulary (twin piers, lintel, a small dome over it; jambs and an arch for a side gate) */
      var gm = V.lerp(e.a, e.b, 0.5), gry = Math.atan2(e.t[0], e.t[1]), fg = B.footing(gm[0], gm[1], 4, gw / 2 + 4, gry), y = fg.lo;
      if (e.gate === 2) {
        var pierW = wt * 2.2, pierH = wh * 1.55;
        [-1, 1].forEach(function (s) { var pp = V.add(gm, V.mul(e.t, s * (gw / 2 + pierW / 2)));
          B.FR8(pp[0], y, pp[1], pierW * 1.3, pierH + (fg.hi - fg.lo), pierW, gry, B.shade(col, 0.05));
          B.BOX(pp[0], y + pierH + (fg.hi - fg.lo), pp[1], pierW * 1.6, 1.4, pierW * 1.3, gry, B.shade(col, -0.2));
          B.CONE(pp[0], y + pierH + (fg.hi - fg.lo) + 1.4, pp[1], pierW * 0.55, pierW * 0.95, gry, B.shade(col, -0.1)); });
        B.BOX(gm[0], fg.hi + wh * 0.95, gm[1], wt * 1.4, wh * 0.16, gw * 1.03, gry, B.shade(col, -0.05));
        B.DOME(gm[0], fg.hi + wh * 1.11, gm[1], pierW * 0.9, pierW * 0.5, gry, B.shade(col, -0.02));
      } else {
        [-1, 1].forEach(function (s) { var jp = V.add(gm, V.mul(e.t, s * (gw / 2 + 0.8))); B.BOX(jp[0], y, jp[1], wt * 1.15, wh * 0.78 + (fg.hi - fg.lo), 1.6, gry, B.shade(col, -0.06)); });
        B.BOX(gm[0], fg.hi + wh * 0.78, gm[1], wt * 1.15, wh * 0.10, gw * 1.02, gry, B.shade(col, -0.16));
        B.DOME(gm[0], fg.hi + wh * 0.88, gm[1], gw * 0.42, gw * 0.22, gry, B.shade(col, -0.1));
      }
      /* the passage in stays clear */
      placed.push(VC.obbAt(V.sub(gm, V.mul(e.out, 14)), gry, 14, gw / 2 + 3));
      e.gatePt = gm;
    });
    /* ---- inside: what stands where. Each piece takes the best free spot for its kind on an 8 m grid inside the wall,
       clear of the wall, the gates, the parks and markets, water and steep ground, and of everything placed before */
    var xs = P.map(function (p) { return p[0]; }), zs = P.map(function (p) { return p[1]; }), cand = [];
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += M.grid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += M.grid) {
      var q = [x, z]; if (!inPoly(q, P)) continue;
      var de = polyEdgeDist(q, P); if (de < M.edge) continue;
      cand.push({ p: q, de: de, dc: V.dist(q, cen) });
    }
    var maxDe = cand.reduce(function (m, c) { return Math.max(m, c.de); }, 1);
    var gateP = gateE ? gateE.gatePt : cen;
    var ok = function (o, relief) {
      var S = VC.samples(o);
      for (var i = 0; i < S.length; i++) { var p = S[i]; if (!inPoly(p, P) || polyEdgeDist(p, P) < M.edge - 2 || baseH(p[0], p[1]) < 0.8) return false;
        for (var k = 0; k < keepOut.length; k++) if (inPoly(p, keepOut[k].poly) || polyEdgeDist(p, keepOut[k].poly) < 6) return false; }
      var r = VC.relief(o); return r.hi - r.lo <= relief;
    };
    /* put one piece: kind, half extents (its booked footprint), how to score a spot (low is best), how to build it */
    var put = function (kind, hw, hd, score, build, opt) {
      opt = opt || {};
      var order = cand.map(function (c) { return { c: c, s: score(c) }; }).sort(function (p, q) { return p.s - q.s; });
      for (var i = 0; i < order.length; i++) {
        var c = order[i].c.p, ry = opt.ry != null ? (typeof opt.ry === 'function' ? opt.ry(c) : opt.ry) : ryF + B.rr(-0.08, 0.08);
        var ctr = opt.offset ? V.add(c, V.add(V.mul([Math.cos(ry), -Math.sin(ry)], opt.offset), [0, 0])) : c;
        var o = VC.obbAt(ctr, ry, hw, hd);
        if (VC.anyHit(o, placed, opt.gap == null ? M.gap : opt.gap) || !ok(o, opt.relief || M.relief)) continue;
        var f = B.footing(ctr[0], ctr[1], hw, hd, ry);
        build(c, (f.hi + f.lo) / 2 + 0.2, ry);
        placed.push(o); if (counts[kind] != null) counts[kind]++;
        return o;
      }
      return null;
    };
    var fx = 145, fz = 120;                                   /* Voth's compound: the builders' sizes are fractions of it */
    /* the chapel at the middle, its door toward the Temple canton */
    var cw = fx * 0.26 * 1.5, cd = fz * 0.22 * 1.5;
    put('chapel', cw * 0.77, cd * 0.5 + cw * 0.27, function (c) { return V.dist(c.p, cen); },
      function (c, y, ry) { B.monasteryChapel(c[0], y, c[1], cw, cd, B.rr(24, 30) * 1.5, ry, col); },
      { ry: function (c) { return B.faceToward(c[0], c[1], T.x, T.z); }, relief: M.relief + 2 });
    /* the assembly hall and its courtyard by the main gate, facing it */
    var hw = fx * 0.16, hd = fz * 0.20, span = hd * 1.35;
    put('hall', (hw * 1.05 + span + 1.2) / 2 + 2, Math.max(hd, span) * 0.55 + 2, function (c) { return V.dist(c.p, gateP) + (c.de < 30 ? 400 : 0); },
      function (c, y, ry) { B.monasteryAssemblyHall(c[0], c[1], y, hw, hd, B.rr(30, 34), ry, col, {}); },
      { ry: function (c) { return B.faceToward(c[0], c[1], gateP[0], gateP[1]); }, offset: -((hw * 0.5 + span + 1.2) - hw * 0.55) / 2 });
    /* dormitories round the chapel (owner: more of them) */
    var dw = fx * 0.20 * 1.5, dd = fz * 0.17 * 2.0, roof = B.shade(B.GREYC[1], -0.05);
    for (var k = 0; k < M.dorms; k++) put('dorm', dw / 2 + 2, dd / 2 + 2, function (c) { return V.dist(c.p, cen) + B.rr(0, 30); },
      function (c, y, ry) { B.monasteryDorm(c[0], y, c[1], dw, dd, B.rr(20, 25), ry, col, { roof: roof }); });
    /* stores (Voth's warehouse: a shed with a door) near the hall */
    for (var w2 = 0; w2 < M.stores; w2++) put('store', fx * 0.11 + 2, fz * 0.075 + 2, function (c) { return V.dist(c.p, gateP) * 0.6 + V.dist(c.p, cen) * 0.4 + B.rr(0, 40); },
      function (c, y, ry) { B.shed(c[0], y, c[1], fx * 0.22, fz * 0.15, B.rr(9, 12), ry, col); });
    /* the well at the heart of the cluster */
    put('well', MO.wellR * 2.2, MO.wellR * 2.2, function (c) { return V.dist(c.p, cen); }, function (c, y, ry) { B.monasteryWell(c[0], y, c[1], MO.wellR, ry); }, { gap: 3 });
    /* pens and coops between the buildings and the fields */
    var ring = function (f) { return function (c) { return Math.abs(c.de / maxDe - f) * 300 + B.rr(0, 60); }; };
    for (var p2 = 0; p2 < M.pens; p2++) put('pen', MO.penW / 2 + 3, MO.penD / 2 + 3, ring(0.45), function (c, y, ry) { B.monasteryPen(c[0], y, c[1], MO.penW / 2, MO.penD / 2, ry); });
    for (var c2 = 0; c2 < M.coops; c2++) put('coop', MO.coopW / 2 + 2, MO.coopD / 2 + 2, ring(0.5), function (c, y, ry) { B.monasteryCoop(c[0], y, c[1], MO.coopW / 2, MO.coopD / 2, ry); }, { gap: 3 });
    /* fields fill the rest, the outer ground first (Voth: "farms around the edges") */
    for (var f2 = 0; f2 < M.fields; f2++) {
      var fw = B.rr(M.field[0], M.field[1]), fh = B.rr(M.field[0], M.field[1]) * 0.75;
      if (!put('field', fw / 2 + 2, fh / 2 + 2, function (c) { return c.de + B.rr(0, 20); }, function (c, y, ry) { B.monasteryField(c[0], y, c[1], fw, fh, ry); }, { gap: 2, relief: M.relief + 3 })) {
        fw *= 0.6; fh *= 0.6;
        if (!put('field', fw / 2 + 2, fh / 2 + 2, function (c) { return c.de + B.rr(0, 20); }, function (c, y, ry) { B.monasteryField(c[0], y, c[1], fw, fh, ry); }, { gap: 2, relief: M.relief + 3 })) break;
      }
    }
  });
  VC.monastery = { poly: P, counts: counts, gates: edges.filter(function (e) { return e.gate; }).length };
  return 'monastery walled round its district (' + edges.length + ' sides, ' + VC.monastery.gates + ' gates): chapel, hall, ' + counts.dorm + ' dormitories, ' + counts.store + ' stores, ' +
    counts.pen + ' pens, ' + counts.coop + ' coops, ' + counts.field + ' fields';
};

/* ---------------------------------------------------------------- step 2: clan compounds */
/* Voth's clan compound (the captured kit piece voth_clan_compound_b), packed into the owner's 'clan compounds'
   districts: fronting the nearest drawn avenue, clear of the avenues to come, the wall line and the parks and markets
   (whose ring avenues come next), at least TUNE.clan.min across the districts, shared by area. */
VC.clanCompounds = function (step) {
  /* after the avenues (owner, 2026-10-09: "we still don't seem to have a lot of clan compounds. may need to place at
     post-avenue stage"): the avenues and the rings are on the raster now, so compounds front the real streets and
     never sit on one. Frontage first (a compound is a big house on a good street), then the district's inside, as
     many as the district holds at TUNE.clan.per square metres each */
  var D = VC.districts('clan'), C = TUNE.clan, R = SL.R, made = [];
  if (!D.length) return 'no clan compound districts';
  var items = [];
  C.keys.forEach(function (key) { [0, 1, 2, 3].forEach(function (v) { var it = null; try { it = SL.dims(key, v); } catch (e) { } if (it && !items.some(function (q) { return q.key === it.key && q.w === it.w && q.d === it.d; })) items.push(it); }); });
  if (!items.length) return 'no clan compound in the kit';
  var rs = SL.stream(2002);
  D.forEach(function (d) {
    var want = Math.max(C.perMin, Math.min(C.max, Math.floor(Math.abs(polyArea(d.poly)) / C.per))), got = 0;
    var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; }), cand = [];
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += C.grid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += C.grid) {
      var q = [x + rs.rr(-2, 2), z + rs.rr(-2, 2)]; if (!inPoly(q, d.poly) || baseH(q[0], q[1]) < 1) continue;
      var w = VC.nearestWayPt(q, ['avenue']); if (!w) continue;
      cand.push({ p: q, w: w, a: w.d - w.way.w / 2 });
    }
    /* frontage first, then inward */
    cand.sort(function (p, q) { return (p.a < C.front * 2.2 ? p.a : 1000 + p.a) - (q.a < C.front * 2.2 ? q.a : 1000 + q.a); });
    for (var i = 0; i < cand.length && got < want; i++) {
      var c = cand[i].p, it = items[(made.length * 7 + i) % items.length], f = V.norm(V.sub(cand[i].w.p, c));
      if (!f[0] && !f[1]) continue;
      /* squared to its avenue: the front faces the nearest point of the street */
      var o = obb(c, [f[1], -f[0]], it.w / 2, it.d / 2), S = VC.samples(VC.grow(o, 2)), bad = false;
      for (var k = 0; k < S.length && !bad; k++) {
        var p = S[k];
        if (!inPoly(p, d.poly) && polyEdgeDist(p, d.poly) > C.spill) bad = true;
        else if (baseH(p[0], p[1]) < 0.8) bad = true;
        else if (VC.wallChain && VC.wallChain.some(function (w2, j2) { return j2 && segDist(p, VC.wallChain[j2 - 1], w2) < TUNE.wall.clear + 12; })) bad = true;
      }
      if (bad || R.blockedRect(VC.grow(o, C.setback), 0.3) || VC.relief(o).hi - VC.relief(o).lo > C.relief) continue;
      if (made.some(function (L) { return SL.pen(VC.grow(o, C.gap / 2), VC.grow(L.bo, C.gap / 2)) > 0; })) continue;
      var L = VC.fixed('clan', { key: it.key, v: it.v }, c, f, step); if (!L) continue;
      L.cls = 'clan'; L.district = d.name; made.push(L); got++;
    }
  });
  VC.clans = made;
  return made.length + ' clan compounds (' + D.map(function (d) { return d.name + ' ' + made.filter(function (L) { return L.district === d.name; }).length; }).join(', ') + ')';
};

/* ---------------------------------------------------------------- windmills (owner, 2026-10-09: "add some windmills to the
   granary canton and the agricultural areas of the map"): Voth's own windmill() (65k-granary-mills-ranch.js, built there
   but never placed), its sails a rotating cluster in Voth's MILL_CLUSTERS that the host turns. Each cluster is marked
   with the step that built it, so the slider shows it from then on. */
VC.windmills = [];
VC.windmill = function (c, y, faceTo, step) {
  var B = VOTH, n0 = B.MILL_CLUSTERS.length, ry = Math.atan2(-(faceTo[1] - c[1]), faceTo[0] - c[0]);
  var r = B.windmill(c[0], y, c[1], ry, null, {});
  for (var i = n0; i < B.MILL_CLUSTERS.length; i++) B.MILL_CLUSTERS[i].step = step;
  VC.windmills.push({ x: c[0], z: c[1], step: step });
  return r;
};

/* ---------------------------------------------------------------- step 2: the canton decks
   The four plain rim cantons (Voth's platCanton: Arsenal, Foreign, Granary, Market) carry a lattice of generic
   buildings on their top deck. The owner (2026-10-09): "ditch the poor quality canton buildings and just put regular
   city buildings there", granaries on Granary, an arsenal on Arsenal, a market square on Market, embassies on Foreign.
   The host strips the generic buildings from the captured cantons (55-vc-host.js VC.stripCantons); here each deck
   is laid out again. The deck: Voth's own tier arithmetic (platCanton: tiers of rem*W[i] + 0.12 from the plinth, the
   top tier's half-width r * 0.97 * 0.86^tiers), the paving slab 0.9 m above it, the usable square inside the
   parapets, the obelisk at the middle kept. */
VC.DECKS = ['Arsenal', 'Foreign', 'Granary', 'Market'];
/* a deck's height is read off the captured canton itself (the top of its highest broad paving): the captured models
   stand on the lake bed as this page measures it, not Voth's own, and the Port canton has a paved deck above its top
   tier. Voth's tier sum is the fallback. `shift` is how far the drawn canton stands above Voth's numbers. */
VC.deckOf = function (n) {
  var c = VOTH.CIDX[n], hw = c.r * 0.97 * Math.pow(0.86, c.tiers), yTop = c.top + 0.12 * c.tiers, y = yTop + 0.9;
  var D = typeof VOTH_CITY_CAPTURE !== 'undefined' ? VOTH_CITY_CAPTURE : null, v = D && D.entries['voth_city_canton_' + n.toLowerCase()];
  if (v && v[0]) { var bed = Math.min(-6, VOTH.terrainH(c.x, c.z)), top = -Infinity; v[0].r.forEach(function (q) { if (q[0] !== 9 && q[5] * q[7] > 2000) top = Math.max(top, bed + q[3] + q[6]); }); if (top > 0) y = top; }
  return { n: n, c: [c.x, c.z], y: y, shift: y - 0.9 - yTop, hw: hw, use: hw * TUNE.decks.use, placed: CANT.deckKeep(n).concat(VC.intKeep(n)) };   /* the bridges' and the stairs' arrivals, the stair house */
};
/* the first free spot for a footprint on a deck, scored by `score` (low is best); faces the deck's middle, squared to
   the deck's axes. Returns {c, f, o} or null. */
VC.deckSpot = function (dk, hw, hd, score, gap) {
  var best = null, bs = Infinity, G = TUNE.decks.grid;
  for (var x = -dk.use; x <= dk.use; x += G) for (var z = -dk.use; z <= dk.use; z += G) {
    var c = [dk.c[0] + x, dk.c[1] + z], toC = [-x, -z], f = Math.abs(toC[0]) > Math.abs(toC[1]) ? [Math.sign(toC[0]) || 1, 0] : [0, Math.sign(toC[1]) || 1];
    var o = obb(c, [f[1], -f[0]], hw, hd), C = obbCorners(o), ok = true;
    for (var i = 0; i < 4 && ok; i++) { var lx = C[i][0] - dk.c[0], lz = C[i][1] - dk.c[1]; if (Math.max(Math.abs(lx), Math.abs(lz)) > dk.use || Math.hypot(lx, lz) < TUNE.decks.obelisk) ok = false; }
    if (!ok || Math.hypot(x, z) < TUNE.decks.obelisk + Math.min(hw, hd)) continue;
    if (VC.anyHit(o, dk.placed, gap == null ? TUNE.decks.gap : gap) || SL.clash(o)) continue;
    var sc = score(x, z); if (sc < bs) { bs = sc; best = { c: c, f: f, o: o }; }
  }
  return best;
};
VC.deckLot = function (dk, cls, it, sp) {
  var L = { id: PLAN.lots.length, cls: cls, key: it.key, v: it.v, slot: 0, wealth: 0.7, x: sp.c[0], z: sp.c[1], y: dk.y, ry: ryFacing(sp.f), w: it.w, d: it.d, h: it.h,
            lot: VC.grow(sp.o, 1.5), bo: sp.o, way: -1, side: 0, s: 0, born: 2, died: null, deck: dk.n };
  PLAN.lots.push(L); SL.hashLot(L); dk.placed.push(sp.o);
  return L;
};
/* pack kit buildings of the given classes round a deck's edge, biggest first, until nothing more fits */
VC.deckFill = function (dk, mix, rs, n) {
  var made = 0, ring = function (x, z) { return dk.use - Math.max(Math.abs(x), Math.abs(z)) + rs.rr(0, 6); };
  for (var t = 0; t < n * 3 && made < n; t++) {
    var cls = SL.draw(rs, mix), it = rs.pick(SL.items(cls)); if (!it || Math.max(it.w, it.d) > dk.use) continue;
    var sp = VC.deckSpot(dk, it.w / 2, it.d / 2, ring); if (!sp) continue;
    VC.deckLot(dk, cls, it, sp); made++;
  }
  return made;
};
VC.cantonDecks = function () {
  var B = VOTH, rs = SL.stream(2003), K = TUNE.decks, log = [];
  VC.decks = {};
  VC.DECKS.forEach(function (n) { if (B.CIDX[n]) VC.decks[n] = VC.deckOf(n); });
  VC.capture('decks', 2, function () {
    /* Granary: Voth's own granary() (65k-granary-mills-ranch.js, built there but never placed), a yard of them */
    var g = VC.decks.Granary;
    if (g) {
      var gn = 0;
      for (var t = 0; t < 40 && gn < K.granaries; t++) {
        var w = rs.rr(12, 15), d = w * rs.rr(0.75, 0.85), sp = VC.deckSpot(g, w / 2 + 3, d / 2 + 4, function (x, z) { return Math.abs(Math.max(Math.abs(x), Math.abs(z)) - g.use * 0.6) + rs.rr(0, 8); });
        if (!sp) break;
        B.granary(sp.c[0], g.y, sp.c[1], Math.atan2(-sp.f[1], sp.f[0]), null, { w: w, d: d }); g.placed.push(sp.o); gn++;
      }
      VC.granaryCount = gn;
      /* windmills toward the deck's windy edge */
      for (var wm = 0; wm < K.granaryMills; wm++) {
        var ws = VC.deckSpot(g, K.mill, K.mill, function (x, z) { return g.use - Math.max(Math.abs(x), Math.abs(z)) + rs.rr(0, 10); }, 6);
        if (!ws) break; VC.windmill(ws.c, g.y, g.c, 2); g.placed.push(ws.o);
      }
      var gf = VC.deckFill(g, { warehouse: 0.5, middle: 0.5 }, rs, K.fill.Granary);
      log.push('Granary: ' + gn + ' granaries, ' + gf + ' warehouses and keepers\u2019 houses');
    }
    /* Arsenal: a drill yard at the middle, barracks and armouries (kit warehouses) round it */
    var a = VC.decks.Arsenal;
    if (a) {
      var yard = a.hw * K.yard;
      B.BOX(a.c[0], a.y - 0.2, a.c[1], yard * 2, 0.35, yard * 2, 0, 0x8e8574);
      a.placed.push(obb(a.c, [1, 0], yard, yard));
      var ab = 0, aw = 0;
      [['voth_barracks', 0], ['voth_barracks', 1]].forEach(function (kv) { var it = SL.dims(kv[0], kv[1]); if (!it) return; var sp = VC.deckSpot(a, it.w / 2, it.d / 2, function (x, z) { return a.use - Math.max(Math.abs(x), Math.abs(z)); }); if (sp) { VC.deckLot(a, 'civic', it, sp).role = 'arsenal'; ab++; } });
      aw = VC.deckFill(a, { warehouse: 1 }, rs, K.fill.Arsenal);
      PLAN.lots.forEach(function (L) { if (L.deck === 'Arsenal' && L.cls === 'warehouse') L.role = 'armoury'; });
      log.push('Arsenal: ' + ab + ' barracks, ' + aw + ' armouries round a drill yard');
    }
    /* Market: a paved square with stall rows and a fountain-side obelisk, shops and a tavern round it */
    var m = VC.decks.Market;
    if (m) {
      var sq = m.hw * K.square, st = 0, STALLS = ['voth_city_stall_fruit', 'voth_city_stall_cheese', 'voth_city_stall_exotic', 'voth_city_stall_bread'], D = { kind: 'market square', name: 'Market canton square', poly: obbCorners(obb(m.c, [1, 0], sq, sq)), born: 2, art: [] };
      B.BOX(m.c[0], m.y - 0.25, m.c[1], sq * 2, 0.4, sq * 2, 0, 0xb2a68c);
      for (var x = -sq + 7; x <= sq - 7; x += 9) for (var z = -sq + 7; z <= sq - 7; z += 9) {
        if (Math.hypot(x, z) < K.obelisk + 6 || !rs.chance(0.7)) continue;
        if (VC.intKeep('Market').some(function (o) { return SL.pen(obb([m.c[0] + x, m.c[1] + z], [1, 0], 4.5, 4.5), o) > 0; })) continue;   /* the stair house (a stall and its stock) */
        var gk = rs.pick(STALLS), jx = rs.rr(-1, 1), jz = rs.rr(-1, 1); VC.marketPitch(D, m.c[0] + x + jx, m.y, m.c[1] + z + jz, Math.atan2(-x, -z), gk); st++;
      }
      PLAN.districts.push(D);
      m.placed.push(obb(m.c, [1, 0], sq + 2, sq + 2));
      var ms = VC.deckFill(m, { shop: 0.75, tavern: 0.1, middle: 0.15 }, rs, K.fill.Market);
      log.push('Market: a square of ' + st + ' stalls, ' + ms + ' shops and houses round it');
    }
    /* Port (Voth's portDeckV2): its plain shed() warehouses, on the deck round the lighthouse and on the quays, give
       way to kit warehouses (owner, 2026-10-09: "replace the low quality warehouses on the harbor canton"); the
       lighthouse and the Navigator's Guild hall keep their ground */
    var pc = B.CIDX.Port;
    if (pc) {
      var po = VC.deckOf('Port'); VC.decks.Port = po; po.use = po.hw - K.port.cart;
      var lp = B.shoreIn(pc.s, 26), sd = V.norm([lp[0] - pc.x, lp[1] - pc.z]), navH = [pc.x + sd[0] * po.hw * 0.33, pc.z + sd[1] * po.hw * 0.33];
      po.placed.push(obb(po.c, [1, 0], po.hw * 0.15 * 1.35, po.hw * 0.15 * 1.35), obb(navH, [1, 0], po.hw * 0.11 + 5, po.hw * 0.11 + 5));
      var pw = VC.deckFill(po, { warehouse: 1 }, rs, K.port.deck);
      /* the quays: Voth's three sheds on each side away from the shore, facing the water */
      var qhw = (pc.r * 2.06 + 70) / 2, qy = 6.5 + 0.8 + po.shift, qn = 0, qitems = SL.items('warehouse').filter(function (it) { return it.d <= K.port.quayDepth; });
      for (var f0 = 0; f0 < 4; f0++) {
        var e = [Math.cos(f0 * Math.PI / 2), Math.sin(f0 * Math.PI / 2)]; if (V.dot(e, sd) > 0.5) continue;
        for (var qq = -1; qq <= 1; qq++) {
          var it = qitems[(qn + qq + 3) % qitems.length]; if (!it) continue;
          var cq = V.add(V.add(po.c, V.mul(e, qhw - 8 - it.d / 2)), V.mul([-e[1], e[0]], qq * qhw * 0.55)), oq = obb(cq, [e[1], -e[0]], it.w / 2, it.d / 2);
          if (SL.clash(oq)) continue;
          var Lq = VC.deckLot({ n: 'Port', y: qy, placed: [] }, 'warehouse', it, { c: cq, f: e, o: oq }); Lq.quay = true; qn++;
        }
      }
      log.push('Port: ' + pw + ' kit warehouses on the deck, ' + qn + ' on the quays');
    }
    /* Foreign: the embassies' plots (one per side, facing the middle), regular houses between */
    var fo = VC.decks.Foreign;
    if (fo) {
      VC.embassyPlots = [];
      /* one plot per embassy, spread evenly round the deck, each facing the middle */
      K.embassies.map(function (e, i) { var a = i / K.embassies.length * Math.PI * 2 - Math.PI / 2; return [Math.cos(a), Math.sin(a)]; }).forEach(function (dir, i) {
        var E = K.embassySize[K.embassies[i]] || K.embassy, sp = VC.deckSpot(fo, E[0] / 2, E[1] / 2, function (x, z) { return -(x * dir[0] + z * dir[1]) + Math.abs(x * dir[1] - z * dir[0]) * 0.5; }, 5);
        if (sp) { fo.placed.push(sp.o); VC.embassyPlots.push({ c: sp.c, f: sp.f, o: sp.o, y: fo.y, culture: K.embassies[i] }); }
      });
      var ff = VC.deckFill(fo, { rich: 0.5, middle: 0.35, shop: 0.15 }, rs, K.fill.Foreign);
      log.push('Foreign: ' + VC.embassyPlots.length + ' embassy plots (' + VC.embassyPlots.map(function (e) { return e.culture; }).join(', ') + '), ' + ff + ' houses');
    }
  });
  return log.join('; ');
};

/* ---------------------------------------------------------------- step 13: the country */
/* Out here there is no street raster: footprints are tested exactly against each other, against the roads (a 40 m
   bucket hash of road segments) and against the ground. */
VC.RH = null;
VC.roadHash = function () {
  VC.RH = new Map();
  PLAN.ways.forEach(function (w) { VC.hashWay(w); });
};
VC.hashWay = function (w) {
  for (var i = 1; i < w.pts.length; i++) {
    var a = w.pts[i - 1], b = w.pts[i], seg = [a, b, w.w / 2, w];
    var x0 = Math.floor(Math.min(a[0], b[0]) / 40), x1 = Math.floor(Math.max(a[0], b[0]) / 40), z0 = Math.floor(Math.min(a[1], b[1]) / 40), z1 = Math.floor(Math.max(a[1], b[1]) / 40);
    for (var x = x0; x <= x1; x++) for (var z = z0; z <= z1; z++) { var k = x + ',' + z; (VC.RH.get(k) || VC.RH.set(k, []).get(k)).push(seg); }
  }
};
/* the nearest road edge within r of p: {d (from the road's edge), way} or null */
VC.roadNear = function (p, r, skip) {
  var best = null, gx = Math.floor(p[0] / 40), gz = Math.floor(p[1] / 40), reach = Math.ceil((r + 8) / 40);
  for (var x = gx - reach; x <= gx + reach; x++) for (var z = gz - reach; z <= gz + reach; z++) {
    var L = VC.RH.get(x + ',' + z); if (!L) continue;
    for (var i = 0; i < L.length; i++) { var s = L[i]; if (s[3].id === skip || s[3].dead) continue; var d = segDist(p, s[0], s[1]) - s[2]; if (d < r && (!best || d < best.d)) best = { d: d, way: s[3] }; }
  }
  return best;
};
VC.COUNTRY_ROLES = ['zone', 'wall', 'nochin', 'mines', 'quarry', 'farms', 'mushfarm'];   /* polygons that are not the city's own ground */
VC.inCity = function (p, pad) {
  if (inPoly(p, PLAN.zone) || polyEdgeDist(p, PLAN.zone) < (pad || 0)) return true;
  return PLAN.site.some(function (d) { return VC.COUNTRY_ROLES.indexOf(d.role) < 0 && inPoly(p, d.poly); });
};
/* a country footprint: dry, not too steep, out of the city, off the roads and the stations, clear of what stands */
VC.countryOk = function (o, opt) {
  opt = opt || {};
  var S = VC.samples(o), lo = Infinity, hi = -Infinity;
  for (var i = 0; i < S.length; i++) {
    var p = S[i], h = baseH(p[0], p[1]); if (h < 0.9) return false; lo = Math.min(lo, h); hi = Math.max(hi, h);
    if (VC.inCity(p, opt.cityPad == null ? 25 : opt.cityPad)) return false;
    if (VC.roadNear(p, opt.road == null ? 3 : opt.road, opt.skipWay)) return false;
  }
  if (hi - lo > (opt.relief || TUNE.country.relief) * Math.max(1, Math.max(o.hw, o.hd) / 25)) return false;
  if (VC.stationPts.some(function (s) { return V.dist(s, o.c) < TUNE.country.stationClear + Math.max(o.hw, o.hd); })) return false;
  if ((Math.max(o.hw, o.hd) > 25 ? VC.clashWide(o) : SL.clash(o)) || VC.fieldHit(o) || VC.anyHit(o, VC.big, 2) || VC.anyHit(o, VC.platforms || [], 6)) return false;
  return true;
};
/* SL.clash looks one 40 m cell round the centre: enough for a house, not for a 177 m farmstead. This looks under the
   whole footprint */
VC.clashWide = function (o) {
  var C = obbCorners(o), x0 = Math.floor(Math.min.apply(null, C.map(function (p) { return p[0]; })) / 40) - 1, x1 = Math.floor(Math.max.apply(null, C.map(function (p) { return p[0]; })) / 40) + 1;
  var z0 = Math.floor(Math.min.apply(null, C.map(function (p) { return p[1]; })) / 40) - 1, z1 = Math.floor(Math.max.apply(null, C.map(function (p) { return p[1]; })) / 40) + 1;
  for (var x = x0; x <= x1; x++) for (var z = z0; z <= z1; z++) { var L = SL.HASH.get(x + ',' + z); if (!L) continue; for (var i = 0; i < L.length; i++) if (L[i].died == null && L[i].bo && SL.pen(o, L[i].bo) > 0.1) return L[i]; }
  return null;
};
VC.FH = null;
VC.fieldHit = function (o) {
  if (!VC.FH) return false;                     /* before the country (step 4's roads): no fields yet */
  var gx = Math.floor(o.c[0] / 80), gz = Math.floor(o.c[1] / 80);
  for (var x = gx - 2; x <= gx + 2; x++) for (var z = gz - 2; z <= gz + 2; z++) { var L = VC.FH.get(x + ',' + z); if (!L) continue; for (var i = 0; i < L.length; i++) if (SL.pen(o, L[i].bo) > 0) return true; }
  return false;
};
VC.addField = function (o, tone, kind) {
  var F = { bo: o, poly: obbCorners(o), tone: tone, kind: kind || 'field', born: 13 };
  PLAN.fields.push(F); var k = Math.floor(o.c[0] / 80) + ',' + Math.floor(o.c[1] / 80); (VC.FH.get(k) || VC.FH.set(k, []).get(k)).push(F);
  return F;
};
/* a building out here, facing f (its front), as a lot record like any other */
VC.countryLot = function (cls, it, c, f, opt) {
  var o = obb(c, [f[1], -f[0]], it.w / 2, it.d / 2);
  if (!VC.countryOk(VC.grow(o, 1.5), opt)) return null;
  var L = { id: PLAN.lots.length, cls: cls, key: it.key, v: it.v, slot: 0, wealth: 0.25, x: c[0], z: c[1], y: baseY(o), ry: ryFacing(f), w: it.w, d: it.d, h: it.h,
            lot: VC.grow(o, 2), bo: o, way: opt && opt.way != null ? opt.way : -1, side: 0, s: 0, born: 13, died: null, country: opt && opt.tag || 'country' };
  PLAN.lots.push(L); SL.hashLot(L);
  if (Math.max(it.w, it.d) > 30) VC.big.push(o);
  return L;
};
/* a lane: from a point on a road, out along a heading that bends a little, as far as the ground allows */
VC.lane = function (root, dir, len, rs, skipWay, tag) {
  var pts = [root], p = root, d = dir, step = 10;
  for (var s = 0; s < len; s += step) {
    d = V.rot(d, rs.rr(-0.06, 0.06));
    var q = V.add(p, V.mul(d, step)), h = baseH(q[0], q[1]);
    if (h < 1.2 || VC.inCity(q, 30) || (s > 20 && VC.roadNear(q, 26, skipWay))) break;
    var g = Math.abs(h - baseH(p[0], p[1])) / step; if (g > TUNE.country.laneSlope) break;
    pts.push(q); p = q;
  }
  if (pts.length < 4) return null;
  var w = SL.addWay('lane', pts, 13, { tag: tag || 'lane' }); VC.hashWay(w);
  return w;
};
/* houses along a lane, both sides, with some frontage left open */
VC.laneHouses = function (w, rs, mix, gap, vacancy, tag, garden) {
  var made = 0;
  [-1, 1].forEach(function (side) {
    for (var s = 10; s < w.F.len - 6;) {
      if (rs.chance(vacancy)) { s += rs.rr(gap[0], gap[1]) + 8; continue; }
      var cls = SL.draw(rs, mix), it = rs.pick(SL.items(cls)); if (!it) { s += 8; continue; }
      var p = w.F.at(s + it.w / 2), t = w.F.tan(s + it.w / 2, 4), n = V.mul(V.perp(t), side), c = V.add(p, V.mul(n, w.w / 2 + 3 + it.d / 2));
      var L = VC.countryLot(cls, it, c, V.mul(n, -1), { road: 1, tag: tag, way: w.id });
      if (L) {
        made++; s += it.w + rs.rr(gap[0], gap[1]);
        /* a kitchen garden behind the house */
        if (garden && rs.chance(garden)) { var gw = rs.rr(12, 22), gd = rs.rr(10, 18), go = obb(V.add(c, V.mul(n, it.d / 2 + 3 + gd / 2)), t, gw / 2, gd / 2);
          if (VC.countryOk(go, { road: 1, relief: 4 })) VC.addField(go, VOTH.pick(VOTH.FIELDC), 'garden'); }
      } else s += 6;
    }
  });
  return made;
};
/* a farmstead at the end of a track, its fields round it, squared to the track */
VC.farmstead = function (end, dir, rs, opt) {
  /* Voth's walled farmstead where the ground is wide and flat enough for it, else a farmhouse */
  var items = SL.items('farm').slice().sort(function (a, b) { return b.w * b.d - a.w * a.d; }), L = null, it = null, c = null, f = V.mul(dir, -1);
  for (var i = 0; i < items.length && !L; i++) {
    if (i === 0 && !rs.chance(TUNE.country.bigFarm)) continue;
    it = items[i]; c = V.add(end, V.mul(dir, it.d / 2 + 5));
    L = VC.countryLot('farm', it, c, f, { tag: 'farm', road: 1, relief: i === 0 ? TUNE.country.relief + 4 : TUNE.country.relief });
  }
  if (!L) return 0;
  var u = [f[1], -f[0]], made = 1, B = VOTH;
  var n = rs.ri(opt.fields[0], opt.fields[1]), tried = 0;
  for (; tried < n * 4 && made - 1 < n; tried++) {
    var fw = rs.rr(TUNE.country.field[0], TUNE.country.field[1]), fd = rs.rr(TUNE.country.field[0], TUNE.country.field[1]) * rs.rr(0.5, 0.9);
    var a = rs.rr(0, Math.PI * 2), r = Math.max(it.w, it.d) / 2 + 8 + Math.max(fw, fd) / 2 + rs.rr(0, 60);
    var fc = V.add(c, [Math.cos(a) * r, Math.sin(a) * r]), o = obb(fc, rs.chance(0.5) ? u : f, fw / 2, fd / 2);
    if (!VC.countryOk(o, { road: 2, relief: TUNE.country.fieldRelief, cityPad: 40 })) continue;
    VC.addField(o, B.pick(B.FIELDC)); made++;
  }
  return made;
};
VC.FARMSEEN = 0;

/* the sector weight: 1 toward any of the given bearings (degrees anticlockwise from east), fading over `spread` */
VC.sector = function (p, dirs, spread) {
  var zc = polyCentroid(PLAN.zone), b = Math.atan2(-(p[1] - zc[1]), p[0] - zc[0]) * 180 / Math.PI, w = 0;
  dirs.forEach(function (d) { var dd = Math.abs(((b - d) % 360 + 540) % 360 - 180); w = Math.max(w, 1 - smooth(spread * 0.5, spread, dd)); });
  return w;
};
VC.zoneDist = function (p) { return inPoly(p, PLAN.zone) ? 0 : polyEdgeDist(p, PLAN.zone); };

/* a farming village by an elephant bug station: a green with a well, lanes out from it, cottages along them, fields round */
VC.village = function (spec, rs) {
  var K = {}, k0; for (k0 in TUNE.country.village) K[k0] = TUNE.country.village[k0]; for (k0 in spec) K[k0] = spec[k0];
  var id = K.id, st = SITE.station(id); if (!st) return id + ': no such station';
  var S = [st.x, st.z], hw = VC.nearestWayPt(S, ['highway']);
  var away = hw ? V.norm(V.sub(S, hw.p)) : [1, 0]; if (!away[0] && !away[1]) away = [1, 0];
  var g = null;
  /* the green: beside the station on the side away from the highway first, then further round and further out */
  [K.greenFrom, K.greenFrom + 40, K.greenFrom + 90, K.greenFrom + 150].forEach(function (rad, ri) {
    for (var tries = 0; tries < 26 && !g; tries++) {
      var c = V.add(S, V.mul(V.rot(away, (tries % 2 ? 1 : -1) * Math.floor(tries / 2) * 0.25), rad));
      if (VC.countryOk(obb(c, [1, 0], K.green, K.green), { road: 4, relief: 5 + ri * 2 })) g = c;
    }
  });
  if (!g) return id + ': no ground for a village green';
  var green = obb(g, V.perp(away), K.green, K.green);
  PLAN.greens.push({ kind: 'plaza', poly: obbCorners(green), born: 13 }); VC.big.push(green);
  PLAN.districts.push({ kind: 'village', name: id + ' village', poly: obbCorners(green), born: 13, art: [{ key: 'voth_city_monastery_well', x: g[0], z: g[1], y: baseH(g[0], g[1]), ry: 0 }] });
  /* the lane in, past the station to the highway, and lanes out */
  var lanes = [], houses = 0, fields = 0;
  /* the lane in runs to the highway beside the station, not through it */
  if (hw) { var sj = hw.s + (hw.s + K.laneOff < hw.way.F.len ? K.laneOff : -K.laneOff), a0 = V.add(g, V.mul(V.norm(V.sub(hw.way.F.at(sj), g)), K.green + 1));
    var w0 = SL.addWay('lane', [a0, hw.way.F.at(sj)], 13, { tag: id + ' village lane' }); VC.hashWay(w0); lanes.push(w0); }
  for (var k = 0; k < K.lanes; k++) {
    var a = (k + 0.5) / K.lanes * Math.PI * 2 + rs.rr(-0.25, 0.25), d = [Math.cos(a), Math.sin(a)];
    if (V.dot(d, V.mul(away, -1)) > 0.8) continue;                /* not back across the highway */
    var w = VC.lane(V.add(g, V.mul(d, K.green + 2)), d, rs.rr(K.laneLen[0], K.laneLen[1]), rs, lanes.length ? lanes[0].id : -1, id + ' village lane');
    if (w) lanes.push(w);
  }
  lanes.forEach(function (w) { houses += VC.laneHouses(w, rs, K.mix, K.gap, K.vacancy, id + ' village'); });
  /* a fishing village: docks on the nearest shore, a lane down to them, fishers' cottages along it */
  var docks = 0;
  if (K.fish) { var fd = VC.fishDocks(g, rs, K.fish, id); docks = fd.docks; houses += fd.houses; lanes.push.apply(lanes, fd.lanes); }
  /* fields round it, and a couple of farmsteads at its edge */
  for (var f = 0; f < K.fields * 4 && fields < K.fields; f++) {
    var a2 = rs.rr(0, Math.PI * 2), r2 = rs.rr(K.fieldRing[0], K.fieldRing[1]), c2 = V.add(g, [Math.cos(a2) * r2, Math.sin(a2) * r2]);
    var fw = rs.rr(TUNE.country.field[0], TUNE.country.field[1]), o2 = obb(c2, rs.chance(0.5) ? away : V.perp(away), fw / 2, fw * rs.rr(0.3, 0.45));
    if (VC.countryOk(o2, { road: 2, relief: TUNE.country.fieldRelief, cityPad: 40 })) { VC.addField(o2, VOTH.pick(VOTH.FIELDC)); fields++; }
  }
  VC.villages.push({ id: id, x: g[0], z: g[1], houses: houses, lanes: lanes.length, fields: fields, docks: docks });
  return id + ' village: ' + houses + ' houses on ' + lanes.length + ' lanes, ' + fields + ' fields' + (docks ? ', ' + docks + ' fishing docks' : '');
};

/* fishing docks for a village (Voth's 65e buildFishDockPier, 9.5 m decks): the shore nearest its green, docks out
   from it square to the shore, dhows moored alongside, a lane down from the green with cottages along it */
VC.fishDocks = function (g, rs, n, id) {
  var B = VOTH, out = { docks: 0, houses: 0, lanes: [] }, shore = [];
  for (var a = 0; a < 72; a++) {
    var d = [Math.cos(a / 72 * 6.283), Math.sin(a / 72 * 6.283)];
    for (var t = 20; t < TUNE.country.fishReach; t += 6) { var q = V.add(g, V.mul(d, t)); if (baseH(q[0], q[1]) < -0.3) { shore.push({ p: q, t: t }); break; } }
  }
  if (!shore.length) return out;
  shore.sort(function (p, q) { return p.t - q.t; });
  var c0 = shore[0].p, roots = [];
  VC.capture('fishdocks:' + id, 13, function () {
    shore.forEach(function (sp) {
      if (roots.length >= n || V.dist(sp.p, c0) > 160 || roots.some(function (r) { return V.dist(r, sp.p) < 34; })) return;
      var p = sp.p, gx = baseH(p[0] + 10, p[1]) - baseH(p[0] - 10, p[1]), gz = baseH(p[0], p[1] + 10) - baseH(p[0], p[1] - 10), dir = V.norm([-gx, -gz]), L = 0;
      for (var s = 4; s <= B.LIFE_FISHDOCK_LEN; s += 4) { var q = V.add(p, V.mul(dir, s)); if (baseH(q[0], q[1]) > -0.3 || VC.inCanton(q, 10) || (VC.chin && VC.chin.chinHit(q[0], q[1], 6))) break; L = s; }
      if (L < 20) return;
      var root = V.sub(p, V.mul(dir, 4)), fd = B.buildFishDockPier(root[0], root[1], dir[0], dir[1], L + 4); if (!fd) return;
      B.PIERS.push({ x0: root[0], z0: root[1], x1: fd.tipX, z1: fd.tipZ, w: B.LIFE_FISHDOCK_W, fish: true, village: id });
      roots.push(p); out.docks++;
      var side = [dir[1], -dir[0]], fry = Math.atan2(dir[0], dir[1]);
      [-1, 1].forEach(function (sd) {
        if (!rs.chance(0.75)) return;
        var hc = V.add(V.add(root, V.mul(dir, (L + 4) * rs.rr(0.45, 0.8))), V.mul(side, sd * (B.LIFE_FISHDOCK_W / 2 + 3.4)));
        VC.moor('vothDhow', hc[0], hc[1], fry, rs.rr(12, 15)); rs.rr(8, 11);   /* a Ring Sea dhow (31-vc-voth.js VC.moor); the old mast's draw kept */
      });
    });
  });
  if (!roots.length) return out;
  /* the lane from the green down to the waterfront, and one along it */
  var mid = roots.reduce(function (m, r) { return [m[0] + r[0] / roots.length, m[1] + r[1] / roots.length]; }, [0, 0]);
  var inl = V.norm(V.sub(g, mid)), end = V.add(mid, V.mul(inl, 10));
  var w1 = SL.addWay('lane', [V.add(g, V.mul(V.norm(V.sub(end, g)), TUNE.country.village.green + 1)), end], 13, { tag: id + ' lane to the docks' }); VC.hashWay(w1); out.lanes.push(w1);
  if (roots.length > 1) { var al = [V.add(roots[0], V.mul(inl, 12)), V.add(roots[roots.length - 1], V.mul(inl, 12))]; var w2 = SL.addWay('lane', al, 13, { tag: id + ' waterfront' }); VC.hashWay(w2); out.lanes.push(w2); }
  out.lanes.forEach(function (w) { out.houses += VC.laneHouses(w, rs, { poor: 0.7, craft: 0.15, tavern: 0.05, middle: 0.1 }, [2, 6], 0.1, id + ' village'); });
  return out;
};

/* ---------------------------------------------------------------- a track or road to the nearest road
   A* on a local 20 m grid round p (slope dear, water and the city's districts closed), to any cell beside a road
   already there. Returns the points, or null. */
VC.routeToRoad = function (p, reach, opt) {
  opt = opt || {};
  var c = 20, n = Math.ceil(2 * reach / c), x0 = p[0] - reach, z0 = p[1] - reach, H = new Float32Array(n * n), goals = new Set(), G = { n: n, c: c };
  var at = function (k) { return [x0 + (k % n + 0.5) * c, z0 + (((k / n) | 0) + 0.5) * c]; };
  for (var k = 0; k < n * n; k++) { var q = at(k); H[k] = baseH(q[0], q[1]); if (H[k] > 0.8 && V.dist(q, p) > (opt.minGoal || 0) && VC.roadNear(q, 10)) goals.add(k); }
  if (!goals.size) return null;
  var cost = function (k, i, j) {
    var h = H[k]; if (h < 0.9) return Infinity;
    var q = at(k); if (!opt.city && VC.inCity(q, 10)) return Infinity;
    if (!opt.overFields && VC.fieldHit(obb(q, [1, 0], c / 2, c / 2))) return Infinity;   /* round the fields, never through them (owner, 2026-10-09) */
    var gx = (H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)]) / (2 * c), gz = (H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i]) / (2 * c);
    return 1 + 60 * (gx * gx + gz * gz);
  };
  var si = Math.floor((p[0] - x0) / c), sj = Math.floor((p[1] - z0) / c), path = ASTAR(G, sj * n + si, goals, cost, null, 1.0);
  if (!path && !opt.overFields) return VC.routeToRoad(p, reach, Object.assign({}, opt, { overFields: true }));   /* hemmed in: the fields it crosses go (VC.fieldsOffWays) */
  if (!path) return null;
  var pts = [p].concat(path.slice(1).map(at)), last = pts[pts.length - 1], rn = VC.roadNear(last, 12);
  if (rn) { var ww = rn.way, nq = ww.F.nearest(last); pts.push(ww.F.at(nq.s)); }
  return chaikin(rdp(pts, 5), 2);
};
VC.track = function (p, reach, tag, cls) {
  var pts = VC.routeToRoad(p, reach); if (!pts || pts.length < 2) return null;
  var w = SL.addWay(cls || 'lane', pts, 13, { tag: tag, stamp: true }); VC.hashWay(w); return w;
};

/* ---------------------------------------------------------------- mines and quarries (Voth's 71-industry.js) */
/* mines: Voth's mine entrance cut into a hillside, on the steep slopes of the owner's 'mines' polygon, apart from
   each other, each with a track down to the roads and a few miners' houses by its cart stop */
VC.mines = function (rs) {
  var B = VOTH, K = TUNE.country.mines, D = VC.districts('mines'), made = [], houses = 0;
  D.forEach(function (d) {
    var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; }), cand = [];
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += K.grid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += K.grid) {
      var p = [x + rs.rr(-8, 8), z + rs.rr(-8, 8)]; if (!inPoly(p, d.poly) || polyEdgeDist(p, d.poly) < 30) continue;
      var h = baseH(p[0], p[1]), gx = (baseH(p[0] + 9, p[1]) - h) / 9, gz = (baseH(p[0], p[1] + 9) - h) / 9, g = Math.hypot(gx, gz);
      if (h < K.minH || g < K.slope[0] || g > K.slope[1]) continue;
      cand.push({ p: p, r: rs.rnd() });
    }
    cand.sort(function (a, b) { return a.r - b.r; });
    for (var i = 0; i < cand.length && made.length < K.n; i++) {
      var p2 = cand[i].p;
      if (made.some(function (m) { return V.dist(m.p, p2) < K.apart; }) || VC.roadNear(p2, 30) || SL.clash(obb(p2, [1, 0], 25, 25))) continue;
      var stop = null;
      VC.capture('mine' + made.length, 13, function () { if (B.mineEntrance(p2[0], p2[1], {})) stop = B.MINE_CART_STOPS[B.MINE_CART_STOPS.length - 1]; });
      if (!stop) continue;
      var m = { p: p2, stop: [stop.x, stop.z] }; made.push(m); VC.big.push(obb(p2, [1, 0], 22, 22));
      m.track = !!VC.track(m.stop, K.trackReach, 'mine track');
      houses += VC.workersHouses(m.stop, rs, K.houses, 'miners');
    }
  });
  VC.industry.mines = made;
  return made.length + ' mines (' + made.filter(function (m) { return m.track; }).length + ' with a track to the roads), ' + houses + ' miners houses';
};
/* quarries: Voth's stepped quarry pit, on the gentler slopes of the 'quarries' polygon, well apart, its haul ramp
   aimed at the nearest road, a track from the ramp's toe, laborers' houses (Voth: four a pit) */
VC.quarries = function (rs) {
  var B = VOTH, K = TUNE.country.quarries, D = VC.districts('quarry'), made = [], houses = 0;
  D.forEach(function (d) {
    var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; }), cand = [];
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += K.grid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += K.grid) {
      var p = [x + rs.rr(-6, 6), z + rs.rr(-6, 6)]; if (!inPoly(p, d.poly) || polyEdgeDist(p, d.poly) < K.rim * 0.6) continue;
      var h = baseH(p[0], p[1]), gx = (baseH(p[0] + 9, p[1]) - h) / 9, gz = (baseH(p[0], p[1] + 9) - h) / 9, g = Math.hypot(gx, gz);
      if (h < 3 || g < K.slope[0] || g > K.slope[1]) continue;
      cand.push({ p: p, r: rs.rnd() });
    }
    cand.sort(function (a, b) { return a.r - b.r; });
    for (var i = 0; i < cand.length && made.length < K.n; i++) {
      var p2 = cand[i].p, o = obb(p2, [1, 0], K.rim + 12, K.rim + 12);
      if (made.some(function (m) { return V.dist(m.p, p2) < K.apart; }) || VC.roadNear(p2, K.rim + 20) || SL.clash(o) || VC.fieldHit(o)) continue;
      var dry = true; for (var a = 0; a < 16 && dry; a++) { var q = V.add(p2, [Math.cos(a / 16 * 6.283) * (K.rim + 10), Math.sin(a / 16 * 6.283) * (K.rim + 10)]); if (baseH(q[0], q[1]) < 1) dry = false; }
      if (!dry) continue;
      var near = VC.roadNear(p2, 900), toward = near ? near.way.F.at(near.way.F.nearest(p2).s) : V.add(p2, [1, 0]), stop = null;
      VC.capture('quarry' + made.length, 13, function () { if (B.quarryPit(p2[0], p2[1], { rim: K.rim, toeA: Math.atan2(toward[1] - p2[1], toward[0] - p2[0]) })) stop = B.QUARRY_CART_STOPS[B.QUARRY_CART_STOPS.length - 1]; });
      if (!stop) continue;
      var m = { p: p2, stop: [stop.x, stop.z] }; made.push(m); VC.big.push(o);
      m.track = !!VC.track(m.stop, K.trackReach, 'quarry track');
      houses += VC.workersHouses(m.stop, rs, K.houses, 'quarrymen');
    }
  });
  VC.industry.quarries = made;
  return made.length + ' quarries (' + made.filter(function (m) { return m.track; }).length + ' with a track to the roads), ' + houses + ' laborers houses';
};
/* mushroom farms (owner, 2026-10-09: "add mushroom farms to 'mush farm' region"): Voth's own mushroomFarm() (71-industry:
   a fenced plot of cultivated fungus in rows, damp gentle ground), on the gentle ground of the owner's polygon, apart from
   each other, each with a track to the roads and its grower's house */
VC.mushFarms = function (rs, role, KK) {
  var B = VOTH, K = Object.assign({}, TUNE.country.mush, KK || {}), made = [], houses = 0, tag = role || 'mushfarm', n0 = (VC.industry.mush || []).length;
  VC.districts(tag).forEach(function (d) {
    var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; }), cand = [];
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += K.grid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += K.grid) {
      var p = [x + rs.rr(-8, 8), z + rs.rr(-8, 8)]; if (!inPoly(p, d.poly) || polyEdgeDist(p, d.poly) < K.edge) continue;
      var h = baseH(p[0], p[1]), g = Math.hypot(baseH(p[0] + 9, p[1]) - h, baseH(p[0], p[1] + 9) - h) / 9;
      if (h < 1.5 || g > K.slope) continue;
      cand.push({ p: p, r: rs.rnd() });
    }
    cand.sort(function (a, b) { return a.r - b.r; });
    for (var i = 0; i < cand.length && made.length < K.n; i++) {
      var c = cand[i].p, o = obb(c, [1, 0], K.half, K.half);
      if (made.some(function (m) { return V.dist(m.p, c) < K.apart; }) || !VC.countryOk(o, { road: 4, relief: K.relief })) continue;
      var near = VC.roadNear(c, 600), to = near ? near.way.F.at(near.way.F.nearest(c).s) : V.add(c, [1, 0]), ry = Math.atan2(-(to[1] - c[1]), to[0] - c[0]), ok = false;
      VC.capture('mush' + (n0 + made.length), 13, function () { ok = !!B.mushroomFarm(c[0], c[1], ry, {}); });
      if (!ok) continue;
      var m = { p: c }; made.push(m); VC.big.push(o);
      m.track = !!VC.track(V.add(c, V.mul(V.norm(V.sub(to, c)), K.half + 2)), K.trackReach, 'mushroom farm track');
      houses += VC.workersHouses(c, rs, 1, 'mushroom growers');
    }
  });
  VC.industry.mush = (VC.industry.mush || []).concat(made);
  return made.length + ' mushroom farms' + (role ? ' in ' + role : '') + ' (' + made.filter(function (m) { return m.track; }).length + ' with a track to the roads), ' + houses + ' growers\u2019 houses';
};
VC.workersHouses = function (c, rs, n, tag) {
  var got = 0;
  for (var t = 0; t < n * 10 && got < n; t++) {
    var it = rs.pick(SL.items('poor')), a = rs.rr(0, 6.283), r = rs.rr(30, 90), p = V.add(c, [Math.cos(a) * r, Math.sin(a) * r]), f = V.norm(V.sub(c, p));
    if (VC.countryLot('poor', it, p, f, { road: 3, tag: tag, relief: 7 })) got++;
  }
  return got;
};

/* ---------------------------------------------------------------- more farms: the owner's 'more farms' polygon, filled
   farmsteads on a jittered grid, each on a track to the nearest road; then fields wherever the ground allows */
VC.moreFarms = function (rs) {
  var K = TUNE.country.moreFarms, D = VC.districts('farms'), farms = 0, fields = 0;
  /* mushroom farms on its gentle ground first (owner, 2026-10-09: "add some mushroom farms in there"), on their tracks */
  var mush = D.length ? VC.mushFarms(rs, 'farms', K.mush) : '';
  D.forEach(function (d) {
    var xs = d.poly.map(function (p) { return p[0]; }), zs = d.poly.map(function (p) { return p[1]; });
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += K.farmGrid) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += K.farmGrid) {
      var p = [x + rs.rr(-K.farmGrid / 3, K.farmGrid / 3), z + rs.rr(-K.farmGrid / 3, K.farmGrid / 3)];
      if (!inPoly(p, d.poly) || VC.inCity(p, 30) || baseH(p[0], p[1]) < 1.5 || VC.roadNear(p, 30) || VC.fieldHit(obb(p, [1, 0], 20, 20))) continue;
      var pts = VC.routeToRoad(p, K.trackReach); if (!pts) continue;
      var w = SL.addWay('lane', pts.slice().reverse(), 13, { tag: 'farm track' }); VC.hashWay(w);
      var made = VC.farmstead(w.F.at(w.F.len), w.F.tan(w.F.len, 6), rs, { fields: K.fieldsPerFarm });
      if (made) { farms++; fields += made - 1; } else { w.dead = true; PLAN.ways.pop(); }
    }
    for (var x2 = Math.min.apply(null, xs); x2 <= Math.max.apply(null, xs); x2 += K.fieldGrid) for (var z2 = Math.min.apply(null, zs); z2 <= Math.max.apply(null, zs); z2 += K.fieldGrid) {
      var c = [x2 + rs.rr(-12, 12), z2 + rs.rr(-12, 12)]; if (!inPoly(c, d.poly)) continue;
      /* square to the nearest road (owner, 2026-10-09: "align the farms within 'more farms' to the streets"): its long
         side along the road's run there, so the fields stand in rows along the tracks and lanes, not across them */
      var fw = rs.rr(TUNE.country.field[0], TUNE.country.field[1]), fd = fw * rs.rr(0.45, 0.85), jr = rs.rr(-0.3, 0.3), rn = VC.roadNear(c, K.alignReach);
      var ax = rn ? rn.way.F.tan(rn.way.F.nearest(c).s, 8) : V.rot([1, 0], jr), o = obb(c, ax, fw / 2, fd / 2);
      if (VC.countryOk(o, { road: 2, relief: TUNE.country.fieldRelief, cityPad: 40 })) { VC.addField(o, VOTH.pick(VOTH.FIELDC)); fields++; }
    }
  });
  return D.length ? farms + ' farmsteads and ' + fields + ' fields in ' + D.map(function (d) { return d.name; }).join(', ') + '; ' + mush : '';
};

/* a station's own road to the city (S12): from beside the station to the nearest road */
VC.roadToCity = function (id, step) {
  var st = SITE.station(id); if (!st) return id + ': no such station';
  var pts = VC.routeToRoad([st.x, st.z], TUNE.country.roadReach, { city: true }); if (!pts) return id + ': no road could be found to the city';
  /* the road starts beside the station, not under it */
  while (pts.length > 2 && V.dist(pts[0], [st.x, st.z]) < TUNE.viaNear[0]) pts.shift();
  var w = SL.addWay('highway', pts.reverse(), step || 13, { tag: id + ' road', stamp: true }); VC.hashWay(w);
  return 'a road from ' + id + ' to the city, ' + (w.F.len / 1000).toFixed(1) + ' km';
};

/* windmills in the farmland: beside about one farmstead in three, on its own ground off the track, and one at the
   edge of each farming village; each needs a clear circle for its sails */
VC.farmMills = function (rs) {
  var K = TUNE.country.mills, made = 0, farms = PLAN.lots.filter(function (L) { return L.died == null && L.cls === 'farm'; });
  var put = function (c, face) {
    var o = obb(c, [1, 0], K.clear, K.clear);
    if (!VC.countryOk(o, { road: 4, relief: 4 })) return false;
    VC.capture('mill' + VC.windmills.length, 13, function () { VC.windmill(c, baseH(c[0], c[1]), face, 13); });
    VC.big.push(o); made++; return true;
  };
  farms.forEach(function (L) {
    if (!rs.chance(K.perFarm)) return;
    for (var t = 0; t < 10; t++) { var a = rs.rr(0, 6.283), r = Math.max(L.w, L.d) / 2 + rs.rr(K.near[0], K.near[1]), c = [L.x + Math.cos(a) * r, L.z + Math.sin(a) * r]; if (put(c, [L.x, L.z])) break; }
  });
  (VC.villages || []).forEach(function (v) {
    for (var t = 0; t < 24; t++) { var a = rs.rr(0, 6.283), r = rs.rr(K.village[0], K.village[1]), c = [v.x + Math.cos(a) * r, v.z + Math.sin(a) * r]; if (put(c, [v.x, v.z])) break; }
  });
  return made + ' windmills in the farmland';
};

/* watermills on the river beyond the city (Voth's watermill(), 65k, built but never placed): on the bank, the wheel on
   the mill's +z flank turned to the water, its paddles a rotating cluster like a windmill's; a track to the
   roads. Workplaces for the census (owner, 2026-10-09: more work in the country) */
VC.waterMills = function (rs) {
  var B = VOTH, K = TUNE.country.watermills, made = [];
  for (var u = K.start; u < 9000 && made.length < K.n; u += K.every) {
    var p = B.riverAt(u); if (!p) break;
    var hb = B.riverHalf(p.x, p.z);
    [1, -1].some(function (side) {
      var n = [p.nx * side, p.nz * side], bank = [p.x + n[0] * hb, p.z + n[1] * hb];
      if (VC.inCity(bank, 60) || made.some(function (m) { return V.dist(m, bank) < K.every * 0.6; })) return false;
      var c = V.add(bank, V.mul(n, K.back)), o = obb(c, [n[1], -n[0]], 9, 9);
      if (baseH(c[0], c[1]) < 1 || !VC.countryOk(o, { road: 4, relief: 4 })) return false;
      var n0 = B.MILL_CLUSTERS.length, ry = Math.atan2(-n[0], -n[1]);            /* the wheel's flank (local +z) to the water */
      VC.capture('watermill' + made.length, 13, function () { B.watermill(c[0], baseH(c[0], c[1]), c[1], ry, null, {}); });
      for (var i = n0; i < B.MILL_CLUSTERS.length; i++) B.MILL_CLUSTERS[i].step = 13;
      VC.big.push(o); made.push(c); VC.track(V.add(c, V.mul(n, 12)), K.trackReach, 'mill track');
      return true;
    });
  }
  VC.industry.watermills = made;
  return made.length + ' watermills on the river';
};
/* beetle ranches (Voth's beetleRanch(), 65k, built but never placed): a fenced pen beside about one farmstead in five */
VC.ranches = function (rs) {
  var B = VOTH, K = TUNE.country.ranches, made = 0;
  PLAN.lots.filter(function (L) { return L.died == null && L.cls === 'farm'; }).forEach(function (L) {
    if (!rs.chance(K.perFarm)) return;
    for (var t = 0; t < 12; t++) {
      var a = rs.rr(0, 6.283), r = Math.max(L.w, L.d) / 2 + rs.rr(K.near[0], K.near[1]), c = [L.x + Math.cos(a) * r, L.z + Math.sin(a) * r], ry = Math.atan2(-(L.z - c[1]), L.x - c[0]);
      var o = obb(c, [Math.cos(ry), -Math.sin(ry)], 15, 12);
      if (!VC.countryOk(o, { road: 3, relief: 4 })) continue;
      VC.capture('ranch' + made, 13, function () { B.beetleRanch(c[0], baseH(c[0], c[1]), c[1], ry, null, {}); });
      VC.big.push(o); made++; break;
    }
  });
  VC.industry.ranches = made;
  return made + ' beetle ranches';
};

/* orchards on the slopes of the west hill (owner, 2026-10-09), Voth's terraced orchards (70-veg.js): rows of fruit
   trees along the contours, one terrace per 7.5 m of rise, a low retaining wall on each terrace edge */
VC.orchards = function (rs) {
  var O = TUNE.country.orchard, B = VOTH, trees = 0, walls = 0, seen = new Set();
  var hill = O.poly;
  VC.capture('orchards', 13, function () {
    var xs = hill.map(function (p) { return p[0]; }), zs = hill.map(function (p) { return p[1]; });
    for (var x = Math.min.apply(null, xs); x <= Math.max.apply(null, xs); x += O.step) for (var z = Math.min.apply(null, zs); z <= Math.max.apply(null, zs); z += O.step) {
      var p = [x + rs.rr(-1, 1), z + rs.rr(-1, 1)]; if (!inPoly(p, hill)) continue;
      var h = baseH(p[0], p[1]); if (h < O.minH || h > O.maxH || trees >= O.maxTrees) continue;
      var gx = (baseH(p[0] + 4, p[1]) - baseH(p[0] - 4, p[1])) / 8, gz = (baseH(p[0], p[1] + 4) - baseH(p[0], p[1] - 4)) / 8, g = Math.hypot(gx, gz);
      if (g < O.slope[0] || g > O.slope[1]) continue;
      /* not in the city's built ground: a raster cell that is street, lot or kept is the city's; steep ground it left open is not */
      var rk = SL.R.idx(p[0], p[1]); if (rk >= 0 && SL.R.occ[rk] !== OCC.OUT && SL.R.occ[rk] !== OCC.FREE) continue;
      if (rk >= 0 && SL.R.occ[rk] === OCC.FREE) continue;
      if (VC.inCity(p, 0) || VC.roadNear(p, 6) || SL.clash(obb(p, [1, 0], 4, 4)) || VC.fieldHit(obb(p, [1, 0], 4, 4))) continue;
      var band = h / O.terrace, fr = band - Math.floor(band), key = Math.floor(p[0] / O.space) + ',' + Math.floor(p[1] / O.space);
      var ry = Math.atan2(-gz, gx) + Math.PI / 2;
      if (fr < 0.14) { if (rs.chance(0.5)) { B.BOX(p[0], h - 1.2, p[1], 11, 1.6 + rs.rr(0, 0.8), 1.3, ry, 0x8a7d63, 'plaster'); walls++; } continue; }
      if (Math.abs(fr - 0.55) > 0.18 || seen.has(key) || !rs.chance(0.86)) continue;
      seen.add(key);
      var th = rs.rr(2.4, 4.2), cr = rs.rr(2.2, 3.6);
      B.STK(p[0], h, p[1], rs.rr(0.35, 0.55), th, 0, 0x5a4b3a, 'trunk');
      B.BLOB(p[0], h + th * 0.7, p[1], cr, cr * rs.rr(0.8, 1.1), rs.rr(0, 3), rs.pick(B.FRUITC), 'leaf');
      trees++;
    }
  });
  VC.orchardTrees = trees;
  return trees + ' orchard trees and ' + walls + ' terrace walls on the west hill';
};

/* no field under a road (owner, 2026-10-09: farms "cut thru" by the streets): once the country is laid, a field any
   way runs across (a lane, a track, a highway laid after it) is taken up, sampled every 8 m over its footprint */
VC.fieldsOffWays = function () {
  VC.roadHash(); var gone = 0;
  PLAN.fields = PLAN.fields.filter(function (F) {
    var o = F.bo, hit = false;
    for (var a = -o.hw; a <= o.hw + 0.1 && !hit; a += Math.min(8, o.hw)) for (var b = -o.hd; b <= o.hd + 0.1 && !hit; b += Math.min(8, o.hd)) {
      var p = V.add(o.c, V.add(V.mul(o.u, a), V.mul(o.v, b))), r = VC.roadNear(p, 0.5); if (r) hit = true;
    }
    if (hit) gone++; return !hit;
  });
  VC.FH = new Map(); PLAN.fields.forEach(function (F) { var k = Math.floor(F.bo.c[0] / 80) + ',' + Math.floor(F.bo.c[1] / 80); (VC.FH.get(k) || VC.FH.set(k, []).get(k)).push(F); });
  return gone;
};

SL.pass13 = function () {
  var rs = SL.stream(13), K = TUNE.country, n0 = PLAN.lots.length;
  PLAN.fields = []; VC.FH = new Map(); VC.big = (VC.clans || []).map(function (L) { return L.bo; }); VC.villages = [];
  VC.roadHash();
  VC.stationPts = SITE.stations().filter(function (s) { return s.kind === 'strider'; }).map(function (s) { return [s.x, s.z]; });
  var log = []; VC.industry = {};
  /* 1. the farming villages first: they hold the ground by their stations */
  K.village.at.forEach(function (sp) { log.push(VC.village(typeof sp === 'string' ? { id: sp } : sp, rs)); });
  /* 2. mines and quarries in the owner's polygons, then the 'more farms' polygon filled */
  log.push(VC.mines(rs)); log.push(VC.quarries(rs)); log.push(VC.mushFarms(rs));
  var mf = VC.moreFarms(rs); if (mf) log.push(mf);
  /* 2. along each highway beyond the city: lanes off it; near the city and toward the S, SE and NE they carry a
     sparse suburb, which thins with distance into farmsteads on tracks among their fields */
  var lanesN = 0, sub = 0, farms = 0, fieldsN = 0;
  PLAN.ways.filter(function (w) { return w.cls === 'highway'; }).forEach(function (w) {
    var F = w.F, s = 0;
    while (s < F.len && VC.inCity(F.at(s), 40)) s += 10;
    var sOut = s;
    for (s += rs.rr(20, 60); s < F.len - 40; ) {
      var p = F.at(s), dz = VC.zoneDist(p), sec = VC.sector(p, K.suburbDirs, K.suburbSpread), dens = sec * Math.exp(-(s - sOut) / K.fade);
      var t = F.tan(s, 8), side = rs.chance(0.5) ? 1 : -1, n = V.mul(V.perp(t), side);
      /* the suburb thins into the farmland: each stop is a suburban lane with the chance `dens`, else a farm */
      if (dens > K.suburbMin && rs.chance(Math.min(1, dens * K.suburbBoost))) {
        /* suburban lanes, houses along them, on one side or both */
        [n, V.mul(n, -1)].forEach(function (nd, si) {
          if (si && !rs.chance(dens)) return;
          var root = V.add(F.at(s + si * 20), V.mul(nd, w.w / 2 + 1)), lw = VC.lane(root, nd, rs.rr(K.laneLen[0], K.laneLen[1]) * (0.5 + dens * 0.7), rs, w.id, 'suburb lane');
          if (lw) { lanesN++; sub += VC.laneHouses(lw, rs, K.suburbMix, [K.houseGap[0], K.houseGap[1] + (1 - dens) * 24], K.vacancy + (1 - dens) * 0.45, 'suburb', K.garden); }
        });
        s += rs.rr(K.laneEvery[0], K.laneEvery[1]) * (1.6 - dens * 0.6);
      } else {
        /* a farm track and its farmstead */
        [n, V.mul(n, -1)].forEach(function (nd, si) {
          if (si && !rs.chance(0.6)) return;
          var tl = rs.rr(K.track[0], K.track[1]), tw = VC.lane(V.add(F.at(s + si * 30), V.mul(nd, w.w / 2 + 1)), nd, tl, rs, w.id, 'farm track');
          if (!tw) return;
          var made = VC.farmstead(tw.F.at(tw.F.len), tw.F.tan(tw.F.len, 6), rs, { fields: K.fieldsPerFarm });
          if (made) { farms++; fieldsN += made - 1; lanesN++; } else { tw.dead = true; PLAN.ways.pop(); }
        });
        s += rs.rr(K.farmEvery[0], K.farmEvery[1]);
      }
    }
  });
  /* 3. fields in the open country between the farms, beside the tracks */
  var extra = 0;
  PLAN.ways.filter(function (w) { return w.cls === 'lane' && /farm/.test(w.tag); }).forEach(function (w) {
    for (var k = 0; k < K.trackFields; k++) {
      var s2 = rs.rr(0, w.F.len), side = rs.chance(0.5) ? 1 : -1, t = w.F.tan(s2, 6), nn = V.mul(V.perp(t), side);
      var fw = rs.rr(K.field[0], K.field[1]), fd = fw * rs.rr(0.45, 0.8), c = V.add(w.F.at(s2), V.mul(nn, w.w / 2 + 4 + fd / 2));
      var o = obb(c, t, fw / 2, fd / 2);
      if (VC.countryOk(o, { road: 2, relief: K.fieldRelief, cityPad: 40 })) { VC.addField(o, VOTH.pick(VOTH.FIELDC)); extra++; }
    }
  });
  log.push(lanesN + ' lanes and tracks; ' + sub + ' suburban houses (S, SE, NE); ' + farms + ' farmsteads with ' + (fieldsN + extra) + ' fields');
  log.push(VC.orchards(rs));
  log.push(VC.farmMills(rs));
  log.push(VC.waterMills(rs)); log.push(VC.ranches(rs));
  log.push(VC.fieldsOffWays() + ' fields taken up from under a road');
  PLAN.country = { lots: PLAN.lots.length - n0, fields: PLAN.fields.length, villages: VC.villages };
  SL.note(13, log.join('; '));
};
