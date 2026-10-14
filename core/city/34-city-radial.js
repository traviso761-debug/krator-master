/* ============================== 5b. THE RADIAL STRATEGY: A WALLED RADIAL CITY (THE TOY'S) ============================== */
/* [G data] Optional. Streetlab's retired toy laid a walled radial city: a triangle of landmarks (palace, temple,
   garrison), a noisy wall (PLAN.wall: {poly, rad[720]: its distance from the centre by bearing}), cardinal avenues
   (PLAN.radials [{dir, ang, way}]) and a core ring (PLAN.coreR, PLAN.tri, PLAN.triWide). On such a site:
     KCITY.radial.civic   step 6: civic buildings by `near` ('core', 'mid', 'garrison' = PLAN.landmarks[2], else a gate)
     KCITY.radial.mains   step 8: rings of main streets between neighbouring cardinal avenues, one every mainSpacing out
                          from the core, following the wall's shape (mainRingK, mainJitter, outerRing), and spokesPerSector
                          spokes through each sector's middle; then the void infill (SL.infillMains: voidMax, voidIters)
     KCITY.radial.rules   {wealth, choosers}: rich inside the triangle and by the civic buildings, poorer toward the wall
   A walled radial city (Iziz's Ancient quarter keeps its own; Dalab) takes it by naming them in its steps and rules:
     KCITY.create({ steps: [... {name: 'civic buildings', run: KCITY.radial.civic}, ..., {name: 'main streets', run:
     KCITY.radial.mains} ...], rules: KCITY.radial.rules }) */
KCITY.radial = { rules: {} };
KCITY.radial.wallR = function (p) {   /* the wall's distance from the centre in p's direction */
  var t = Math.atan2(p[1], p[0]), k = Math.round(((t + Math.PI) / (2 * Math.PI)) * 720) % 720;
  return PLAN.wall ? PLAN.wall.rad[k] : 800;
};
KCITY.radial.rules.wealth = function (p) {
  var r = V.len(p), Rw = KCITY.radial.wallR(p), W;
  if (inPoly(p, PLAN.triWide)) W = 1;
  else W = 1 - smooth(PLAN.coreR, Rw * 0.98, r) * 0.95;
  PLAN.civics.forEach(function (L) { if (L.died == null) { var d = Math.hypot(L.x - p[0], L.z - p[1]); W += 0.3 * Math.exp(-d / 70); } });
  W += 0.13 * slFbm(p[0] / 110 + 40, p[1] / 110 - 13, 2);
  return clamp(W, 0, 1);
};
KCITY.radial.rules.choosers = {
  /* 7: the avenues: predominantly, not uniformly, wealthy near the civic buildings and inside the triangle */
  avenue: function (p, rs) {
    var W = SL.wealth(p);
    if (W > 0.72) return SL.draw(rs, { rich: 0.70, middle: 0.24, manor: W > 0.85 ? 0.06 : 0 });
    if (W > 0.45) return SL.draw(rs, { rich: 0.35, middle: 0.52, shop: 0.13 });
    return SL.draw(rs, { middle: 0.55, poor: 0.28, shop: 0.17 });
  },
  /* 9: main streets: wealth falls from the centre, shops prefer it, industry keeps to the edges */
  main: function (p, rs) {
    var W = SL.wealth(p), r = V.len(p), rel = r / KCITY.radial.wallR(p);
    var shop = 0.07 + 0.40 * Math.exp(-r / 280), ind = 0.42 * smooth(0.70, 0.95, rel), tav = 0.035;
    var home = Math.max(0.05, 1 - shop - ind - tav);
    var rich = smooth(0.55, 0.92, W) * 0.8, poor = smooth(0.52, 0.12, W) * 0.85, mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, industrial: ind, tavern: tav, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  /* 11: side streets: quieter, fewer shops */
  side: function (p, rs) {
    var W = SL.wealth(p), r = V.len(p), rel = r / KCITY.radial.wallR(p);
    var shop = 0.04 + 0.18 * Math.exp(-r / 280), ind = 0.30 * smooth(0.72, 0.95, rel);
    var home = Math.max(0.05, 1 - shop - ind);
    var rich = smooth(0.6, 0.95, W) * 0.7, poor = smooth(0.55, 0.15, W) * 0.9, mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, industrial: ind, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  /* 12: alleys: back-lane cottages and workshops */
  alley: function (p, rs) {
    var W = SL.wealth(p), rel = V.len(p) / KCITY.radial.wallR(p);
    return SL.draw(rs, { poor: 0.62 - 0.3 * W, middle: 0.18 + 0.3 * W, shop: 0.08, industrial: 0.12 * smooth(0.65, 0.9, rel) });
  }
};

/* step 6: civic buildings on the avenues, each where its `near` rule wants it, kept apart from one another */
KCITY.radial.civic = function () {
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

/* step 8: main streets grow out of the avenues. Between each pair of neighbouring cardinal avenues, rings of
   main streets connect avenue to avenue, one every mainSpacing out from the core; a spoke runs from the core
   avenues out through each sector's middle to its outermost ring. Routes avoid parks, landmarks and civic
   buildings outright, lots by price (smaller lots cheaper), and keep the minimum spacing from other streets. */
KCITY.radial.mains = function () {
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

