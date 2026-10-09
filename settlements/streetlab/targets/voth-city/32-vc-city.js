/* ============================== 5. THE CITY: WEALTH, LOT MIXES, STREETS ============================== */
/* [G data] The city builder (core/city: 20-city-plan, 31-city-steps-b, 32-city-steps-c) on the site, with the site's own rules:
   - wealth (owner, 2026-10-08): richest along the bay shore and round the parks, plaza and markets, poorer toward
     the wall, and low in the working districts (harbour, industry, warehouse, river port) and outside the wall;
   - lot mixes by district: harbour = warehouses with a little industry, industry = smithies and craft workshops,
     warehouse = warehouses among shops and houses, river port = warehouses by the barge docks;
   - outside the wall a sparse suburb (some frontage left open, poorer, more industry). */

/* ---------------------------------------------------------------- wealth, cached on a 20 m grid */
VC.wcache = null;
SL.wealth = function (p) {
  var c = 20, half = TUNE.rasterHalf, n = Math.ceil(2 * half / c), i = Math.floor((p[0] + half) / c), j = Math.floor((p[1] + half) / c);
  if (!VC.wcache) { VC.wcache = new Float32Array(n * n); VC.wcache.fill(NaN); }
  if (i < 0 || j < 0 || i >= n || j >= n) return 0.3;
  var k = j * n + i, v = VC.wcache[k];
  if (v === v) return v;
  var q = [-half + (i + 0.5) * c, -half + (j + 0.5) * c], L = Math.max(0, VOTH.landDist(q[0], q[1]));
  var W = 1 - 0.8 * smooth(40, 760, L);
  PLAN.site.forEach(function (d) {
    if (d.role !== 'park' && d.role !== 'plaza' && d.role !== 'market') return;
    var dd = inPoly(q, d.poly) ? 0 : polyEdgeDist(q, d.poly);
    W += (d.role === 'market' ? 0.18 : 0.32) * Math.exp(-dd / 150);
  });
  if (VC.wallLine) { var dw = Infinity; for (var s = 1; s < VC.wallLine.length; s++) dw = Math.min(dw, segDist(q, VC.wallLine[s - 1], VC.wallLine[s])); W -= 0.25 * Math.max(0, 1 - dw / 180); }
  var role = VC.roleAt(q);
  if (role === 'harbor' || role === 'industry' || role === 'warehouse' || role === 'riverport') W = Math.min(W, 0.4) * 0.75;
  if (role === 'suburb') W = Math.min(W, 0.3);
  W += 0.12 * slFbm(q[0] / 110 + 40, q[1] / 110 - 13, 2);
  return (VC.wcache[k] = clamp(W, 0, 1));
};
VC.marketDist = function (p) { var d = Infinity; PLAN.site.forEach(function (m) { if (m.role === 'market') d = Math.min(d, inPoly(p, m.poly) ? 0 : polyEdgeDist(p, m.poly)); }); return d; };

/* ---------------------------------------------------------------- what stands where */
VC.MIX = {
  harbor:    { warehouse: 0.50, craft: 0.12, shop: 0.08, tavern: 0.08, poor: 0.22 },
  industry:  { craft: 0.60, industrial: 0.14, shop: 0.08, poor: 0.18 },
  warehouse: { warehouse: 0.45, shop: 0.22, middle: 0.15, poor: 0.18 },
  riverport: { warehouse: 0.50, tavern: 0.10, shop: 0.12, poor: 0.28 },
  suburb:    { poor: 0.45, industrial: 0.15, craft: 0.12, middle: 0.18, shop: 0.06, tavern: 0.04 }
};
VC.chooser = function (street) {
  return function (p, rs) {
    var role = VC.roleAt(p);
    if (VC.MIX[role]) return SL.draw(rs, VC.MIX[role]);
    var W = SL.wealth(p), dm = VC.marketDist(p);
    if (street === 'avenue') {
      if (W > 0.72) return SL.draw(rs, { rich: 0.68, middle: 0.24, manor: W > 0.86 ? 0.05 : 0, shop: 0.03 });
      if (W > 0.45) return SL.draw(rs, { rich: 0.32, middle: 0.50, shop: 0.18 });
      return SL.draw(rs, { middle: 0.52, poor: 0.28, shop: 0.20 });
    }
    var shop = (street === 'alley' ? 0.04 : street === 'side' ? 0.05 : 0.08) + (street === 'alley' ? 0.06 : 0.35) * Math.exp(-dm / 260);
    var tav = street === 'main' ? 0.03 : 0.01, home = Math.max(0.05, 1 - shop - tav);
    var rich = smooth(0.55, 0.92, W) * (street === 'alley' ? 0.3 : 0.8), poor = smooth(0.52, 0.12, W) * 0.85 + (street === 'alley' ? 0.25 : 0), mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, tavern: tav, rich: home * rich, middle: home * mid, poor: home * poor });
  };
};
SL.choosers = { avenue: VC.chooser('avenue'), main: VC.chooser('main'), side: VC.chooser('side'), alley: VC.chooser('alley') };
SL.vacant = function (p, rs) { return VC.roleAt(p) === 'suburb' && rs.chance(TUNE.suburbVacancy); };

/* ---------------------------------------------------------------- step 6: civic buildings on the avenues */
SL.pass6 = function () {
  var rs = SL.stream(6), cands = [], I = VC.marker(/^I$/i);
  PLAN.ways.forEach(function (w) {
    if (w.cls !== 'avenue') return;
    for (var s = 12; s < w.F.len - 12; s += 8) [-1, 1].forEach(function (side) { cands.push({ w: w, s: s, side: side, p: w.F.at(s) }); });
  });
  cands.forEach(function (c) { c.role = VC.roleAt(c.p); c.W = SL.wealth(c.p); });
  TUNE.civic.forEach(function (C) {
    var it = SL.dims(C.key, C.v); if (!it) return;
    cands.forEach(function (c) {
      var sc;
      if (C.near === 'res') sc = c.role === 'res' ? (1 - c.W) * 300 : 1e4;
      else if (C.near === 'garrison') sc = I ? Math.hypot(c.p[0] - I.x, c.p[1] - I.z) : 1e4;
      else if (C.near === 'gate') sc = VC.wall ? Math.min.apply(null, VC.wall.gates.map(function (g) { return Math.abs(Math.hypot(c.p[0] - g.x, c.p[1] - g.z) - 120); })) + (c.role === 'suburb' ? 1e4 : 0) : 1e4;
      else sc = c.role === C.near ? 0 : 400 + VC.districts(C.near).reduce(function (m, d) { return Math.min(m, polyEdgeDist(c.p, d.poly)); }, 1e4);
      PLAN.civics.forEach(function (L) { if (Math.hypot(L.x - c.p[0], L.z - c.p[1]) < TUNE.civicSpacing) sc += 1e4; });
      c.sc = sc + rs.rr(0, 40);
    });
    var order = cands.slice().sort(function (a, b) { return a.sc - b.sc; });
    for (var i = 0; i < Math.min(600, order.length); i++) {
      var c = order[i], L = SL.tryLot(c.w, c.side, c.s, it, 6, 'civic', { wealth: 1, padded: true });
      if (!L.fail) { L.role = C.key; PLAN.civics.push(L); break; }
    }
  });
  SL.note(6, PLAN.civics.length + ' of ' + TUNE.civic.length + ' civic buildings on the avenues');
};

/* ---------------------------------------------------------------- step 7: lots along the avenues
   Not along the highways (owner, 2026-10-09: "don't automatically put buildings along the highways like that"): a
   highway through the city keeps open frontage; the blocks behind it are reached from the streets the later steps lay. */
SL.pass7 = function () {
  var n0 = PLAN.lots.length;
  PLAN.ways.forEach(function (w) { if (w.cls === 'avenue' && !w.layby) [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.avenue, 7); }); });
  SL.note(7, (PLAN.lots.length - n0) + ' lots on the avenues (none on the highways)');
};

/* ---------------------------------------------------------------- step 8: main streets across the open ground
   The builder's infill (core/city/31-city-steps-b.js SL.infillMains) for a site this size: the open ground is ranked on a 10 m grid
   (its distance from any street, a chamfer transform), and each round crosses several well-separated voids: from the
   nearest street toward the void and on to a street beyond it; failing that, to another street in a nearby direction;
   where the void backs onto the edge of the build zone, a dead-end street runs into it. */
SL.pass8 = function () {
  var R = SL.R, f = 4, cn = Math.floor(R.n / f), CN = cn * cn, cc = R.c * f;
  var cls = new Uint8Array(CN), D = new Float32Array(CN), O = new Int32Array(CN), skip = new Uint8Array(CN);
  var opt = { lotK: 9, spK: 16, wobK: 0.9, cross: 3, hw: 1.25, margin: 200 }, fills = 0, dead = 0, rounds = 0;
  var cx = function (ci) { return -TUNE.rasterHalf + (ci + 0.5) * cc; };
  var rayHit = function (c, d, from) {
    for (var t = 2; t < 640; t += 2) {
      var q = V.add(c, V.mul(d, t)), k = R.idx(q[0], q[1]), o = k < 0 ? OCC.OUT : R.occ[k];
      if (o === OCC.OUT || o === OCC.HARD || o === OCC.GREEN) return { free: t };
      if (o === OCC.STREET && R.own[k] !== from) return { w: PLAN.ways[R.own[k]], q: q };
    }
    return { free: 640 };
  };
  /* a route that would mostly run on streets already there is no new street (it went round the void) */
  var mostlyOld = function (pf) {
    var n = 0, on = 0, L = plLen(pf), F = plFrame(pf);
    for (var s = 15; s < L - 15; s += 4) { var p = F.at(s), k = R.idx(p[0], p[1]); n++; if (k >= 0 && R.occ[k] === OCC.STREET) on++; }
    return n > 0 && on / n > 0.35;
  };
  for (; rounds < TUNE.voidIters; rounds++) {
    /* the coarse grid: a street where any of its cells is one, open where its middle is */
    for (var cj = 0; cj < cn; cj++) for (var ci = 0; ci < cn; ci++) {
      var kc = cj * cn + ci, st = -1;
      for (var b = 0; b < f && st < 0; b++) for (var a = 0; a < f; a++) { var k = (cj * f + b) * R.n + ci * f + a; if (R.occ[k] === OCC.STREET) { st = R.own[k]; break; } }
      var mid = (cj * f + 2) * R.n + ci * f + 2;
      cls[kc] = st >= 0 ? 1 : R.occ[mid] === OCC.FREE ? 0 : 2;
      D[kc] = st >= 0 ? 0 : 1e9; O[kc] = st;
    }
    var relax = function (k, m, w) { if (D[m] + w < D[k]) { D[k] = D[m] + w; O[k] = O[m]; } }, w1 = cc, w2 = cc * Math.SQRT2;
    for (var j = 0; j < cn; j++) for (var i = 0; i < cn; i++) { var q1 = j * cn + i; if (i) relax(q1, q1 - 1, w1); if (j) { relax(q1, q1 - cn, w1); if (i) relax(q1, q1 - cn - 1, w2); if (i < cn - 1) relax(q1, q1 - cn + 1, w2); } }
    for (var j2 = cn - 1; j2 >= 0; j2--) for (var i2 = cn - 1; i2 >= 0; i2--) { var q2 = j2 * cn + i2; if (i2 < cn - 1) relax(q2, q2 + 1, w1); if (j2 < cn - 1) { relax(q2, q2 + cn, w1); if (i2 < cn - 1) relax(q2, q2 + cn + 1, w2); if (i2) relax(q2, q2 + cn - 1, w2); } }
    var cand = [];
    for (var k3 = 0; k3 < CN; k3++) if (cls[k3] === 0 && !skip[k3] && D[k3] > TUNE.voidMax && O[k3] >= 0) cand.push(k3);
    if (!cand.length) break;
    cand.sort(function (p, q) { return D[q] - D[p]; });
    var picks = [];
    for (var c3 = 0; c3 < cand.length && picks.length < TUNE.voidBatch; c3++) {
      var kk = cand[c3], x = cx(kk % cn), z = cx((kk / cn) | 0);
      if (picks.every(function (q) { return Math.hypot(q[0] - x, q[1] - z) > 3 * TUNE.voidMax; })) picks.push([x, z, kk]);
    }
    var got = 0;
    picks.forEach(function (P) {
      var c = [P[0], P[1]], WA = PLAN.ways[O[P[2]]]; if (!WA) return;
      var na = WA.F.nearest(c), a = WA.F.at(na.s), d0 = V.norm(V.sub(c, a)), hit = null, d = d0;
      [0, 0.45, -0.45, 0.9, -0.9].some(function (rot) { d = V.rot(d0, rot); var h = rayHit(c, d, WA.id); if (h.w) { hit = h; return true; } return false; });
      var sA = SL.smallLotAt(WA, SL.sideToward(WA, na.s, d0), na.s, 20), pf = null;
      if (hit) {
        var nb = hit.w.F.nearest(hit.q), sB = SL.smallLotAt(hit.w, SL.sideToward(hit.w, nb.s, V.mul(d, -1)), nb.s, 20);
        pf = SL.route(WA.F.at(sA), hit.w.F.at(sB), WA.id, hit.w.id, opt);
        if (pf && mostlyOld(pf)) pf = null;
        if (pf) { SL.addWay('main', pf, 8, { tag: 'main' }); fills++; got++; }
      }
      if (!pf) {
        var fr = rayHit(c, d0, WA.id).free || 0, end = V.add(c, V.mul(d0, Math.max(0, Math.min(fr - 16, 360))));
        if (V.dist(a, end) > 70) { pf = SL.route(WA.F.at(sA), end, WA.id, -1, opt); if (pf && mostlyOld(pf)) pf = null; if (pf) { SL.addWay('main', pf, 8, { tag: 'main (dead end)' }); dead++; got++; } }
      }
      if (!pf) for (var b2 = -2; b2 <= 2; b2++) for (var a2 = -2; a2 <= 2; a2++) { var ks = P[2] + b2 * cn + a2; if (ks >= 0 && ks < CN) skip[ks] = 1; }
    });
    if (!got && !picks.length) break;
  }
  SL.note(8, fills + ' main streets across the open ground and ' + dead + ' dead-end ones into it, in ' + rounds + ' rounds');
};
/* the last infill (core/city/32-city-steps-c.js interior alleys) tries only open ground a street can reach within blindMax */
SL.interiorOk = function (k) {
  if (!VC._sdt || VC._sdtN !== PLAN.ways.length) { VC._sdt = new Float32Array(SL.R.n * SL.R.n); VC._sdo = new Int32Array(SL.R.n * SL.R.n); SL.streetDT(VC._sdt, VC._sdo); VC._sdtN = PLAN.ways.length; }
  return VC._sdt[k] < TUNE.blindMax * 0.85;
};
