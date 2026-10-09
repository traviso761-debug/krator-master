/* ============================== 5. STEPS 6-9: CIVIC, AVENUE LOTS, MAIN STREETS, MAIN-STREET LOTS ============================== */
/* [G data] */

/* step 6: civic buildings on the avenues, each where its `near` rule wants it, kept apart from one another */
SL.pass6 = function () {
  var rs = SL.stream(6), cands = [], gar = PLAN.landmarks[2];
  PLAN.ways.forEach(function (w) {
    if (w.cls !== 'avenue') return;
    for (var s = 12; s < w.F.len - 12; s += 6) [-1, 1].forEach(function (side) { cands.push({ w: w, s: s, side: side, p: w.F.at(s) }); });
  });
  TUNE.civic.forEach(function (C) {
    var it = SL.dims(C.key, C.v); if (!it) { SL.note(6, 'no kit piece ' + C.key); return; }
    cands.forEach(function (c) {
      var r = V.len(c.p), sc;
      if (C.near === 'core') sc = Math.abs(r - (PLAN.coreR + 70));
      else if (C.near === 'mid') sc = Math.abs(r - 360);
      else if (C.near === 'garrison') sc = V.dist(c.p, [gar.x, gar.z]);
      else sc = Math.abs(Math.min.apply(null, PLAN.gates.map(function (g) { return V.dist(c.p, g.p); })) - 80);
      PLAN.civics.forEach(function (L) { if (Math.hypot(L.x - c.p[0], L.z - c.p[1]) < TUNE.civicSpacing) sc += 1e4; });
      c.sc = sc + rs.rr(0, 30);
    });
    var order = cands.slice().sort(function (a, b) { return a.sc - b.sc; });
    for (var i = 0; i < Math.min(500, order.length); i++) {
      var c = order[i], L = SL.tryLot(c.w, c.side, c.s, it, 6, 'civic', { wealth: 1, padded: true });
      if (!L.fail) { L.role = C.key; PLAN.civics.push(L); break; }
    }
  });
  SL.note(6, PLAN.civics.length + ' of ' + TUNE.civic.length + ' civic buildings placed on the avenues');
};

/* step 7: lots along the avenues, front doors to the avenue, graded by wealth */
SL.pass7 = function () {
  var n0 = PLAN.lots.length;
  PLAN.ways.forEach(function (w) { if (w.cls === 'avenue') [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.avenue, 7); }); });
  SL.note(7, (PLAN.lots.length - n0) + ' avenue lots');
};

/* ---------------------------------------------------------------- the street router
   Fields every route reads, computed once the ground is final (after the civic pads): slope and an organic
   wobble, so streets bend round the ground and each other rather than ruling straight lines. */
SL.fields = function () {
  if (SL.F) return SL.F;
  var R = SL.R, n = R.n, slope = new Float32Array(n * n), wob = new Float32Array(n * n), c = R.c;
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
    var k = j * n + i; if (R.occ[k] === OCC.OUT) continue;
    var x = R.cx(i), z = R.cx(j);
    var gx = (baseH(x + c, z) - baseH(x - c, z)) / (2 * c), gz = (baseH(x, z + c) - baseH(x, z - c)) / (2 * c);
    slope[k] = gx * gx + gz * gz;
    wob[k] = 0.5 + 0.5 * slFbm(x / 70 + 91, z / 70 - 37, 2);
  }
  return (SL.F = { slope: slope, wob: wob });
};
/* the price of a cell for a street of class cls between ways `from` and `to` */
SL.streetCost = function (from, to, opt) {
  var R = SL.R, F = SL.fields(), sp = SL.minSpacing, lotK = opt.lotK, spK = opt.spK, wobK = opt.wobK;
  return function (k) {
    var c = R.occ[k], base = 1 + 60 * F.slope[k] + wobK * F.wob[k];
    if (c === OCC.OUT || c === OCC.HARD || c === OCC.GREEN) return Infinity;
    if (c === OCC.STREET || c === OCC.ALLEY) { var o = R.own[k]; if (o === from || o === to) return 1; base += opt.cross; }
    else if (c === OCC.LOT) { var L = PLAN.lots[R.own[k]]; base += lotK * (0.45 + (L ? L.lot.hw * L.lot.hd * 4 : 300) / 420); }
    else if (c === OCC.RESERVE) base += 2;
    var w = R.sdw[k];
    if (R.sd[k] < sp && w !== from && w !== to && w >= 0) base += spK * (1 - R.sd[k] / sp);
    if (opt.ring) {   /* a ring street keeps near its own radius, which follows the wall's shape */
      var x = R.cx(k % R.n), z = R.cx((k / R.n) | 0), dev = (Math.hypot(x, z) - opt.ring(x, z)) / TUNE.mainRingK;
      base += Math.min(8, dev * dev);
    }
    return base;
  };
};
/* route a street from way `from` at point a to way `to` at point b; returns smoothed points or null */
SL.route = function (a, b, from, to, opt) {
  var R = SL.R, n = R.n, ka = R.idx(a[0], a[1]), kb = R.idx(b[0], b[1]);
  if (ka < 0 || kb < 0) return null;
  var goals = [], bi = kb % n, bj = (kb / n) | 0;
  for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) goals.push((bj + dj) * n + bi + di);
  var win = null;
  if (opt.margin) {
    var m = opt.margin / R.c, ai = ka % n, aj = (ka / n) | 0;
    win = [Math.max(0, Math.min(ai, bi) - m) | 0, Math.max(0, Math.min(aj, bj) - m) | 0, Math.min(n - 1, Math.max(ai, bi) + m) | 0, Math.min(n - 1, Math.max(aj, bj) + m) | 0];
  }
  var path = ASTAR(R, ka, goals, SL.streetCost(from, to, opt), win, opt.hw || 1.2);
  if (!path) return null;
  if (opt.maxCost && path.cost > opt.maxCost) return null;
  var pts = path.map(function (k) { return [R.cx(k % n), R.cx((k / n) | 0)]; });
  pts[0] = a; pts[pts.length - 1] = b;
  pts = chaikin(rdp(pts, opt.rdp || 2.5), 2);
  pts.cost = path.cost;
  return pts;
};
/* where a street leaves a way: near s, at the smallest lot on that side (rule 8: medium-strong preference
   for running through smaller lots where it meets the avenue) */
SL.smallLotAt = function (way, side, s, win) {
  var best = null;
  PLAN.lots.forEach(function (L) {
    if (L.died != null || L.way !== way.id || L.side !== side || L.cls === 'civic' || Math.abs(L.s - s) > win) return;
    if (!best || L.w < best.w - 0.5 || (Math.abs(L.w - best.w) <= 0.5 && Math.abs(L.s - s) < Math.abs(best.s - s))) best = L;
  });
  return best ? best.s : s;
};
SL.sAtRadius = function (way, r) { var F = way.F, best = 0, bd = Infinity; for (var s = 0; s <= F.len; s += 2) { var d = Math.abs(V.len(F.at(s)) - r); if (d < bd) { bd = d; best = s; } } return best; };
SL.sideToward = function (way, s, dir) { return V.dot(V.perp(way.F.tan(s, 4)), dir) > 0 ? 1 : -1; };

/* step 8: main streets grow out of the avenues. Between each pair of neighbouring cardinal avenues, rings of
   main streets connect avenue to avenue, one every mainSpacing out from the core; a spoke runs from the core
   avenues out through each sector's middle to its outermost ring. Routes avoid parks, landmarks and civic
   buildings outright, lots by price (smaller lots cheaper), and keep the minimum spacing from other streets. */
SL.pass8 = function () {
  var rs = SL.stream(8), rad = PLAN.radials.slice().sort(function (a, b) { return a.ang - b.ang; }), made = 0, failed = 0;
  var opt = { lotK: 9, spK: 16, wobK: 0.9, cross: 3, hw: 1.25 };
  PLAN.sectors = [];
  var ends = {};
  for (var q = 0; q < rad.length; q++) {
    var A = rad[q], B = rad[(q + 1) % rad.length], wa = PLAN.ways[A.way], wb = PLAN.ways[B.way];
    var dA = [Math.cos(A.ang), Math.sin(A.ang)], dB = [Math.cos(B.ang), Math.sin(B.ang)];
    var sec = { a: A.dir, b: B.dir, arcs: [], bis: V.norm(V.add(dA, dB)) };
    PLAN.sectors.push(sec);
    /* ring i of nr sits at fraction f between the core and the outer ring, measured along each bearing, so the
       rings follow the wall's own shape and the outermost runs outerRing inside it */
    var r0 = Math.max(V.len(wa.pts[0]), V.len(wb.pts[0])) + TUNE.mainSpacing * 0.7;
    var meanW = 0; for (var a = 0; a < 16; a++) meanW += SL.wallR(V.add(V.mul(dA, 1 - a / 15), V.mul(dB, a / 15))) / 16;
    var nr = Math.max(1, Math.round((meanW - TUNE.outerRing - r0) / TUNE.mainSpacing) + 1);
    for (var ri = 0; ri < nr; ri++) {
      var f = nr === 1 ? 1 : ri / (nr - 1);
      var ring = (function (f, jit) { return function (x, z) { return r0 + jit + f * (SL.wallR([x, z]) - TUNE.outerRing - r0 - jit); }; })(f, ri === nr - 1 ? 0 : rs.rr(-1, 1) * TUNE.mainJitter);
      var pa = wa.F.at(SL.sAtRadius(wa, ring(dA[0] * 300, dA[1] * 300))), pb = wb.F.at(SL.sAtRadius(wb, ring(dB[0] * 300, dB[1] * 300)));
      var sa = SL.sAtRadius(wa, ring(pa[0], pa[1])), sb = SL.sAtRadius(wb, ring(pb[0], pb[1]));
      var sideA = SL.sideToward(wa, sa, dB), sideB = SL.sideToward(wb, sb, dA), kk = nr - 1 - ri;
      /* ring kk (counted from the wall) crosses each cardinal avenue at one point: where the neighbouring
         sector's ring kk already meets it, else at the smallest lot near its radius */
      var EA = ends[A.dir] || (ends[A.dir] = {}), EB = ends[B.dir] || (ends[B.dir] = {});
      sa = EA[kk] != null ? EA[kk] : SL.smallLotAt(wa, sideA, sa, 22);
      sb = EB[kk] != null ? EB[kk] : SL.smallLotAt(wb, sideB, sb, 22);
      var pts = SL.route(wa.F.at(sa), wb.F.at(sb), wa.id, wb.id, Object.assign({ ring: ring }, opt));
      EA[kk] = sa; EB[kk] = sb;
      if (!pts) { failed++; continue; }
      var w = SL.addWay('main', pts, 8, { tag: 'ring ' + A.dir + B.dir + ' #' + (ri + 1) + '/' + nr });
      sec.arcs.push(w.id); made++;
    }
    /* spokes: from the core avenues out along the sector's middle to the outermost ring */
    if (!sec.arcs.length) continue;
    var outer = PLAN.ways[sec.arcs[sec.arcs.length - 1]];
    for (var sp = 0; sp < TUNE.spokesPerSector; sp++) {
      var dir = V.rot(sec.bis, (sp - (TUNE.spokesPerSector - 1) / 2) * 0.35 + rs.rr(-0.12, 0.12));
      var src = null, best = -Infinity;
      PLAN.ways.forEach(function (w) {
        if (w.cls !== 'avenue' || /^cardinal/.test(w.tag)) return;
        w.pts.forEach(function (p, i) { var v = V.dot(p, dir) - 0.6 * Math.abs(V.dot(p, V.perp(dir))); if (v > best) { best = v; src = { w: w, s: w.F.cum[i] }; } });
      });
      var tq = null, tb = -Infinity;
      outer.pts.forEach(function (p, i) { var v = V.dot(V.norm(p), dir); if (v > tb) { tb = v; tq = outer.F.cum[i]; } });
      if (!src || tq == null) continue;
      var side = SL.sideToward(src.w, src.s, dir);
      var ss = SL.smallLotAt(src.w, side, src.s, 20);
      var pts2 = SL.route(src.w.F.at(ss), outer.F.at(tq), src.w.id, outer.id, opt);
      if (!pts2) { failed++; continue; }
      SL.addWay('main', pts2, 8, { tag: 'spoke ' + A.dir + B.dir }); made++;
    }
  }
  var fills = SL.infillMains(8, opt, { voidMax: TUNE.voidMax, iters: TUNE.voidIters });
  SL.note(8, made + ' ring and spoke main streets (' + failed + ' routes failed), ' + fills + ' infill main streets across open ground');
};

/* infill: where open ground still lies further than o.voidMax from any street, a main street crosses the void from
   its nearest street to the street opposite. Repeat on the next biggest void until none is left (or o.iters).
   o.open(k) narrows which open cells count (a site's build zone); o.reach caps the crossing. Returns the count. */
SL.infillMains = function (step, opt, o) {
  var R = SL.R, N = R.n * R.n, skip = new Uint8Array(N), fills = 0, DT = new Float32Array(N), DO = new Int32Array(N);
  for (var it = 0; it < o.iters; it++) {
    SL.streetDT(DT, DO);
    var bk = -1, bd = o.voidMax;
    for (var k = 0; k < N; k++) if (R.occ[k] === OCC.FREE && !skip[k] && DT[k] > bd && (!o.open || o.open(k))) { bd = DT[k]; bk = k; }
    if (bk < 0 || DO[bk] < 0) break;
    var c = [R.cx(bk % R.n), R.cx((bk / R.n) | 0)], WA = PLAN.ways[DO[bk]], hitB = null;
    var na = WA.F.nearest(c), a = WA.F.at(na.s), d = V.norm(V.sub(c, a));
    for (var t = 2; t < (o.reach || 700); t += 2) {
      var qq = V.add(c, V.mul(d, t)), kq = R.idx(qq[0], qq[1]), cq = kq < 0 ? OCC.OUT : R.occ[kq];
      if (cq === OCC.OUT || cq === OCC.HARD || cq === OCC.GREEN) break;
      if (cq === OCC.STREET && R.own[kq] !== WA.id) { hitB = { w: PLAN.ways[R.own[kq]], q: qq }; break; }
    }
    var ok = false;
    if (hitB) {
      var sA = SL.smallLotAt(WA, SL.sideToward(WA, na.s, d), na.s, 20), WB = hitB.w, nb = WB.F.nearest(hitB.q);
      var sB = SL.smallLotAt(WB, SL.sideToward(WB, nb.s, V.mul(d, -1)), nb.s, 20);
      var pf = SL.route(WA.F.at(sA), WB.F.at(sB), WA.id, WB.id, opt);
      if (pf) { SL.addWay('main', pf, step, { tag: 'infill' }); fills++; ok = true; }
    }
    if (!ok) R.eachNearSeg(c, c, 30, function (k2) { skip[k2] = 1; });
  }
  return fills;
};

/* distance (metres) from every cell to the nearest street cell, and which way that is: a two-pass chamfer
   transform over the raster (3-4 weights), so open ground of any size can be ranked */
SL.streetDT = function (D, O) {
  var R = SL.R, n = R.n, c = R.c, a = c, b = c * Math.SQRT2;
  for (var k = 0; k < n * n; k++) { var st = R.occ[k] === OCC.STREET; D[k] = st ? 0 : 1e9; O[k] = st ? R.own[k] : -1; }
  var relax = function (k, m, w) { if (D[m] + w < D[k]) { D[k] = D[m] + w; O[k] = O[m]; } };
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
    var k2 = j * n + i;
    if (i > 0) relax(k2, k2 - 1, a);
    if (j > 0) { relax(k2, k2 - n, a); if (i > 0) relax(k2, k2 - n - 1, b); if (i < n - 1) relax(k2, k2 - n + 1, b); }
  }
  for (var j2 = n - 1; j2 >= 0; j2--) for (var i2 = n - 1; i2 >= 0; i2--) {
    var k3 = j2 * n + i2;
    if (i2 < n - 1) relax(k3, k3 + 1, a);
    if (j2 < n - 1) { relax(k3, k3 + n, a); if (i2 < n - 1) relax(k3, k3 + n + 1, b); if (i2 > 0) relax(k3, k3 + n - 1, b); }
  }
};

/* step 9: lots along the main streets: wealth falls from the centre, shops prefer it, industry the edges.
   Frontage a bend makes unbuildable is knocked out and kept for step 10. */
SL.pass9 = function () {
  var n0 = PLAN.lots.length, k0 = PLAN.knocks.length;
  PLAN.ways.forEach(function (w) { if (w.cls === 'main') [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.main, 9); }); });
  SL.note(9, (PLAN.lots.length - n0) + ' main-street lots, ' + (PLAN.knocks.length - k0) + ' stretches knocked out by curvature');
};
