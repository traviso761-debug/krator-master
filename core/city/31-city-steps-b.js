/* ============================== 5. STEPS 6-9: CIVIC, AVENUE LOTS, MAIN STREETS, MAIN-STREET LOTS ============================== */
/* [G data] The builder's defaults, grown in Voth (its pass6, pass7 and pass8 are these): a world gives its rules and data. */

/* step 6: civic buildings on the avenues, each where its `near` rule wants it, kept civicSpacing apart. Candidates every
   civicStep (8 m) along both sides of every avenue; each civic piece (TUNE.civic: {key, v, near}) scores them with the
   scorer its `near` names (the world's table rules.near, over KCITY.NEAR; any other name is a district role) plus a
   jitter (civicJitter, 40) and takes the best of the first civicTries (600) that fits. */
KCITY.NEAR = {
  /* the residential ground (SL.roleAt's fallback role), its wealthiest first */
  res: function (c) { return c.role === 'res' ? (1 - c.W) * 300 : 1e4; },
  /* by the garrison landmark (PLAN.landmarks, role 'garrison') */
  garrison: function (c) { var I = KCITY.landmark('garrison'); return I ? Math.hypot(c.p[0] - I.x, c.p[1] - I.z) : 1e4; },
  /* civicGateDist (120 m) from a gate of the wall's records (PLAN.wallRec), not beyond the wall (TUNE.civicOutside roles) */
  gate: function (c) {
    var W = PLAN.wallRec, gd = TUNE.civicGateDist == null ? 120 : TUNE.civicGateDist, out = TUNE.civicOutside || ['suburb'];
    return W ? Math.min.apply(null, W.gates.map(function (g) { return Math.abs(Math.hypot(c.p[0] - g.x, c.p[1] - g.z) - gd); })) + (out.indexOf(c.role) >= 0 ? 1e4 : 0) : 1e4;
  },
  /* a district role: inside one 0, else 400 plus the distance to the nearest */
  role: function (c, near) { return c.role === near ? 0 : 400 + KCITY.site.districts(near).reduce(function (m, d) { return Math.min(m, polyEdgeDist(c.p, d.poly)); }, 1e4); }
};
KCITY.landmark = function (role) { for (var i = 0; i < PLAN.landmarks.length; i++) if (PLAN.landmarks[i] && PLAN.landmarks[i].role === role) return PLAN.landmarks[i]; return null; };
SL.pass6 = function () {
  var rs = SL.stream(6), cands = [], T = TUNE, step = T.civicStep == null ? 8 : T.civicStep, jit = T.civicJitter == null ? 40 : T.civicJitter, tries = T.civicTries == null ? 600 : T.civicTries;
  var near = function (C, c) { var f = (SL.near && SL.near[C.near]) || KCITY.NEAR[C.near]; return f ? f(c, C.near) : KCITY.NEAR.role(c, C.near); };
  PLAN.ways.forEach(function (w) {
    if (w.cls !== 'avenue') return;
    for (var s = 12; s < w.F.len - 12; s += step) [-1, 1].forEach(function (side) { cands.push({ w: w, s: s, side: side, p: w.F.at(s) }); });
  });
  cands.forEach(function (c) { c.role = SL.roleAt(c.p); c.W = SL.wealth(c.p); });
  TUNE.civic.forEach(function (C) {
    var it = SL.dims(C.key, C.v); if (!it) return;
    cands.forEach(function (c) {
      var sc = near(C, c);
      PLAN.civics.forEach(function (L) { if (Math.hypot(L.x - c.p[0], L.z - c.p[1]) < TUNE.civicSpacing) sc += 1e4; });
      c.sc = sc + rs.rr(0, jit);
    });
    var order = cands.slice().sort(function (a, b) { return a.sc - b.sc; });
    for (var i = 0; i < Math.min(tries, order.length); i++) {
      var c = order[i], L = SL.tryLot(c.w, c.side, c.s, it, 6, 'civic', { wealth: 1, padded: true });
      if (!L.fail) { L.role = C.key; PLAN.civics.push(L); break; }
    }
  });
  SL.note(6, PLAN.civics.length + ' of ' + TUNE.civic.length + ' civic buildings on the avenues');
};

/* step 7: lots along the avenues, front doors to the avenue, graded by wealth. A way flagged noFrontage (or a layby:
   Voth's station laybys) takes none, and the highways none (owner, 2026-10-09: "don't automatically put buildings along
   the highways like that"): the blocks behind them are reached from the streets the later steps lay */
SL.pass7 = function () {
  var n0 = PLAN.lots.length;
  PLAN.ways.forEach(function (w) { if (w.cls === 'avenue' && !w.layby && !w.noFrontage) [-1, 1].forEach(function (side) { SL.lineLots(w, side, SL.choosers.avenue, 7); }); });
  SL.note(7, (PLAN.lots.length - n0) + ' lots on the avenues (none on the highways)');
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
    var gx = (CG.base(x + c, z) - CG.base(x - c, z)) / (2 * c), gz = (CG.base(x, z + c) - CG.base(x, z - c)) / (2 * c);
    slope[k] = gx * gx + gz * gz;
    wob[k] = 0.5 + 0.5 * slFbm(x / 70 + 91, z / 70 - 37, 2);
  }
  /* the exact-streets rule (TUNE.exact): how far each cell lies from ground no street may take (HARD: a civic building,
     a landmark), so a street's carriageway, not only its centreline, keeps off it */
  var hd = null;
  if (TUNE.exact) {
    hd = new Float32Array(n * n);
    for (var q = 0; q < n * n; q++) hd[q] = R.occ[q] === OCC.HARD ? 0 : 1e9;
    var rl = function (k2, m, w) { if (hd[m] + w < hd[k2]) hd[k2] = hd[m] + w; }, d1 = c, d2 = c * Math.SQRT2;
    for (var j1 = 1; j1 < n - 1; j1++) for (var i1 = 1; i1 < n - 1; i1++) { var a = j1 * n + i1; rl(a, a - 1, d1); rl(a, a - n, d1); rl(a, a - n - 1, d2); rl(a, a - n + 1, d2); }
    for (var j3 = n - 2; j3 > 0; j3--) for (var i3 = n - 2; i3 > 0; i3--) { var b = j3 * n + i3; rl(b, b + 1, d1); rl(b, b + n, d1); rl(b, b + n + 1, d2); rl(b, b + n - 1, d2); }
  }
  return (SL.F = { slope: slope, wob: wob, hard: hd });
};
/* the price of a cell for a street of class cls between ways `from` and `to` */
SL.streetCost = function (from, to, opt) {
  var R = SL.R, F = SL.fields(), sp = SL.minSpacing, lotK = opt.lotK, spK = opt.spK, wobK = opt.wobK;
  return function (k) {
    var c = R.occ[k], base = 1 + 60 * F.slope[k] + wobK * F.wob[k];
    if (c === OCC.OUT || c === OCC.HARD || c === OCC.GREEN) return Infinity;
    if (F.hard && F.hard[k] < (TUNE.width[opt.cls || 'main'] || 8) / 2 + R.c) return Infinity;   /* exact streets: the carriageway keeps off HARD ground */
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

/* step 8: main streets across the open ground (grown in Voth). The open ground is ranked on a coarse grid (mainCoarse:
   4 raster cells; its distance from any street, a chamfer transform), and each round (voidIters) crosses up to
   voidBatch well-separated voids deeper than voidMax: from the nearest street toward the void and on to a street
   beyond it (the ray turned by mainTurns when straight on finds none); failing that, where the void backs onto the edge
   of the build zone, a dead-end street runs into it. A route that would mostly run on streets already there is no new
   street (it went round the void). The toy's rings and spokes for a walled radial city: KCITY.radial (34-city-radial.js). */
SL.pass8 = function () {
  var R = SL.R, T = TUNE, f = T.mainCoarse == null ? 4 : T.mainCoarse, cn = Math.floor(R.n / f), CN = cn * cn, cc = R.c * f;
  var cls = new Uint8Array(CN), D = new Float32Array(CN), O = new Int32Array(CN), skip = new Uint8Array(CN);
  var opt = T.mainRoute || { lotK: 9, spK: 16, wobK: 0.9, cross: 3, hw: 1.25, margin: 200 }, fills = 0, dead = 0, rounds = 0;
  var turns = T.mainTurns || [0, 0.45, -0.45, 0.9, -0.9], ray = T.mainRay == null ? 640 : T.mainRay;
  var cx = function (ci) { return -TUNE.rasterHalf + (ci + 0.5) * cc; };
  var rayHit = function (c, d, from) {
    for (var t = 2; t < ray; t += 2) {
      var q = V.add(c, V.mul(d, t)), k = R.idx(q[0], q[1]), o = k < 0 ? OCC.OUT : R.occ[k];
      if (o === OCC.OUT || o === OCC.HARD || o === OCC.GREEN) return { free: t };
      if (o === OCC.STREET && R.own[k] !== from) return { w: PLAN.ways[R.own[k]], q: q };
    }
    return { free: ray };
  };
  var mostlyOld = function (pf) {
    var n = 0, on = 0, L = plLen(pf), F = plFrame(pf);
    for (var s = 15; s < L - 15; s += 4) { var p = F.at(s), k = R.idx(p[0], p[1]); n++; if (k >= 0 && R.occ[k] === OCC.STREET) on++; }
    return n > 0 && on / n > 0.35;
  };
  for (; rounds < T.voidIters; rounds++) {
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
    for (var k3 = 0; k3 < CN; k3++) if (cls[k3] === 0 && !skip[k3] && D[k3] > T.voidMax && O[k3] >= 0) cand.push(k3);
    if (!cand.length) break;
    cand.sort(function (p, q) { return D[q] - D[p]; });
    var picks = [];
    for (var c3 = 0; c3 < cand.length && picks.length < T.voidBatch; c3++) {
      var kk = cand[c3], x = cx(kk % cn), z = cx((kk / cn) | 0);
      if (picks.every(function (q) { return Math.hypot(q[0] - x, q[1] - z) > 3 * T.voidMax; })) picks.push([x, z, kk]);
    }
    var got = 0;
    picks.forEach(function (P) {
      var c = [P[0], P[1]], WA = PLAN.ways[O[P[2]]]; if (!WA) return;
      var na = WA.F.nearest(c), a = WA.F.at(na.s), d0 = V.norm(V.sub(c, a)), hit = null, d = d0;
      turns.some(function (rot) { d = V.rot(d0, rot); var h = rayHit(c, d, WA.id); if (h.w) { hit = h; return true; } return false; });
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
