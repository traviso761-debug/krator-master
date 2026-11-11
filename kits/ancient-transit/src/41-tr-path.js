// ================================================================= ANCIENT TRANSIT — the path and the profile  [G data]
// A line follows a polyline of waypoints across the world. The path fillets the corners, samples itself every few metres with the
// ground under each sample, and answers at(s); the profile is the deck's (or the rail head's) height along it, from the ground and a
// clearance, its grade limited both ways by raising only. Plain maths on arrays; no THREE, no DOM.
//
//   KTRANSIT.path(pts, o)         pts: [[x, z], ...] (2 or more); o.ground(x, z) -> y (required), o.radius (corner fillet, m; 0 none),
//                                  o.step (sample spacing, default 4)
//      -> P {pts (filleted), seg: [{x0, z0, x1, z1, s0, s1, len, yaw}], L, step, n, S, X, Z, YG, YAW (arrays, one a sample),
//            at(s) -> {s, x, z, yaw, yG}, lateral(s, off) -> [x, z] (off along side +1), project(x, z) -> {s, off, d}}
//   KTRANSIT.profile(P, o)        o.mode 'deck' (the highest ground within o.window of each sample, plus o.clearance) or 'grade' (the
//                                  ground plus o.above); o.maxGrade (rise over run); o.lift(s) -> a floor the deck must clear (a crossing)
//      -> Y {Y (array), at(s)}
//   KTRANSIT.intersections(P, Q)  where P crosses Q (a path, or a polyline [[x, z], ...]): [{sP, sQ, x, z, yawP, yawQ}]
(function () {
  var T = KTRANSIT;
  function num(v) { return typeof v === 'number' && isFinite(v); }
  function fillet(pts, r) {
    if (!(r > 0) || pts.length < 3) return pts.map(function (p) { return [p[0], p[1]]; });
    var out = [[pts[0][0], pts[0][1]]];
    for (var i = 1; i + 1 < pts.length; i++) {
      var P0 = pts[i - 1], V = pts[i], P2 = pts[i + 1];
      var ax = V[0] - P0[0], az = V[1] - P0[1], la = Math.hypot(ax, az), bx = P2[0] - V[0], bz = P2[1] - V[1], lb = Math.hypot(bx, bz);
      if (la < 1e-6 || lb < 1e-6) continue;
      ax /= la; az /= la; bx /= lb; bz /= lb;
      var cosT = Math.max(-1, Math.min(1, ax * bx + az * bz)), th = Math.acos(cosT);
      if (th < 0.02) { out.push([V[0], V[1]]); continue; }
      var t = Math.min(r * Math.tan(th / 2), 0.45 * Math.min(la, lb));
      if (t < 0.5) { out.push([V[0], V[1]]); continue; }
      var A = [V[0] - ax * t, V[1] - az * t], B = [V[0] + bx * t, V[1] + bz * t], n = Math.max(2, Math.ceil(th * t / 4));
      for (var k = 0; k <= n; k++) { var q = k / n, w0 = (1 - q) * (1 - q), w1 = 2 * q * (1 - q), w2 = q * q; out.push([w0 * A[0] + w1 * V[0] + w2 * B[0], w0 * A[1] + w1 * V[1] + w2 * B[1]]); }
    }
    out.push([pts[pts.length - 1][0], pts[pts.length - 1][1]]);
    return out;
  }
  T.path = function (pts, o) {
    o = o || {};
    if (!Array.isArray(pts) || pts.length < 2) throw new Error('KTRANSIT.path: two or more waypoints, please');
    pts.forEach(function (p, i) { if (!Array.isArray(p) || !num(p[0]) || !num(p[1])) throw new Error('KTRANSIT.path: waypoint ' + i + ' is not [x, z]'); });
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.path: o.ground(x, z) is required');
    var step = o.step == null ? 4 : o.step, P = fillet(pts, o.radius == null ? 0 : o.radius), seg = [], s = 0;
    /* a shift (an earthquake's slip and twist, KTRANSIT.quakeShift): the line's points carried as the land was; the straight runs are first cut
       every 8 m, so the line bends through the fault's zone instead of jumping at a corner */
    if (typeof o.shift === 'function') { var D = []; for (var di = 0; di + 1 < P.length; di++) { var A = P[di], Bp = P[di + 1], dl = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), dn = Math.max(1, Math.ceil(dl / 8)); for (var dk = 0; dk < dn; dk++) D.push([A[0] + (Bp[0] - A[0]) * dk / dn, A[1] + (Bp[1] - A[1]) * dk / dn]); } D.push(P[P.length - 1]);
      P = D.map(function (q) { var sh = o.shift(q[0], q[1]); return [q[0] + sh[0], q[1] + sh[1]]; }); }
    for (var i = 0; i + 1 < P.length; i++) {
      var a = P[i], b = P[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1e-6) continue;
      seg.push({ x0: a[0], z0: a[1], x1: b[0], z1: b[1], s0: s, s1: s + len, len: len, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) });
      s += len;
    }
    if (!seg.length) throw new Error('KTRANSIT.path: the waypoints have no length');
    var L = s, n = Math.max(2, Math.floor(L / step) + 1), S = [], X = [], Z = [], YG = [], YAW = [];
    function at(q) {
      q = Math.max(0, Math.min(L, q));
      var lo = 0, hi = seg.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (seg[mid].s1 < q) lo = mid + 1; else hi = mid; }
      var g = seg[lo], t = (q - g.s0) / g.len, x = g.x0 + (g.x1 - g.x0) * t, z = g.z0 + (g.z1 - g.z0) * t;
      return { s: q, x: x, z: z, yaw: g.yaw, yG: o.ground(x, z), seg: lo };
    }
    for (var k = 0; k < n; k++) { var p = at(k * L / (n - 1)); S.push(p.s); X.push(p.x); Z.push(p.z); YG.push(p.yG); YAW.push(p.yaw); }
    function lateral(q, off) { var p = at(q); return [p.x + Math.cos(p.yaw) * off, p.z - Math.sin(p.yaw) * off]; }
    /* the nearest point of the line: the segments are filed in 50 m cells once; a query reads the cells within one cell of the point and takes
       the nearest; an answer farther than a cell's width could be beaten by a segment outside them, so then every segment is read (a shifted
       line is hundreds of 8 m segments, and a host's ground asks for thousands of points) */
    var CELL = 50, cells = new Map(), ck = function (i, j) { return i * 1048576 + j; };
    seg.forEach(function (g, gi) { var i0 = Math.floor(Math.min(g.x0, g.x1) / CELL), i1 = Math.floor(Math.max(g.x0, g.x1) / CELL), j0 = Math.floor(Math.min(g.z0, g.z1) / CELL), j1 = Math.floor(Math.max(g.z0, g.z1) / CELL);
      for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) { var k = ck(i, j), b = cells.get(k); if (!b) cells.set(k, b = []); b.push(gi); } });
    function nearest(list, x, z) {
      var best = null;
      for (var q = 0; q < list.length; q++) { var g = seg[list[q]], dx = g.x1 - g.x0, dz = g.z1 - g.z0, t = ((x - g.x0) * dx + (z - g.z0) * dz) / (g.len * g.len); t = Math.max(0, Math.min(1, t));
        var px = g.x0 + dx * t, pz = g.z0 + dz * t, d = Math.hypot(x - px, z - pz);
        if (!best || d < best.d) { var c = Math.cos(g.yaw), sn = Math.sin(g.yaw); best = { s: g.s0 + g.len * t, d: d, off: (x - px) * c - (z - pz) * sn }; } }
      return best;
    }
    var all = seg.map(function (g, gi) { return gi; });
    function project(x, z) {
      if (!isFinite(x) || !isFinite(z)) return nearest(all, x, z);
      var ci = Math.floor(x / CELL), cj = Math.floor(z / CELL), list = [];
      for (var i = ci - 1; i <= ci + 1; i++) for (var j = cj - 1; j <= cj + 1; j++) { var b = cells.get(ck(i, j)); if (b) for (var q = 0; q < b.length; q++) if (list.indexOf(b[q]) < 0) list.push(b[q]); }
      var best = list.length ? nearest(list, x, z) : null;
      return best && best.d <= CELL ? best : nearest(all, x, z);
    }
    var bb = [Infinity, Infinity, -Infinity, -Infinity]; P.forEach(function (q) { bb[0] = Math.min(bb[0], q[0]); bb[1] = Math.min(bb[1], q[1]); bb[2] = Math.max(bb[2], q[0]); bb[3] = Math.max(bb[3], q[1]); });
    /* near(x, z, pad): false when the point is further than pad from the line's bounding box (a cheap first test before project) */
    var near = function (x, z, pad) { return x >= bb[0] - pad && x <= bb[2] + pad && z >= bb[1] - pad && z <= bb[3] + pad; };
    return { pts: P, seg: seg, L: L, step: step, n: n, S: S, X: X, Z: Z, YG: YG, YAW: YAW, at: at, lateral: lateral, project: project, near: near, bbox: bb, ground: o.ground };
  };
  /* the profile: a floor (the ground in a window, plus a clearance; or the ground plus a little), the lifts, then the grade limit, which only
     raises: a pass forward (y[i] >= y[i-1] - g ds) and one back. Both ways, so a deck never descends faster than the grade into a dip, and
     never has to climb faster than it out of one */
  T.profile = function (P, o) {
    o = o || {};
    var mode = o.mode == null ? 'deck' : o.mode, g = o.maxGrade == null ? 0.05 : o.maxGrade, n = P.n, Y = new Array(n), i, j;
    if (mode === 'deck') {
      var w = o.window == null ? 16 : o.window, c = o.clearance == null ? 9 : o.clearance, k = Math.max(1, Math.round(w / P.step));
      for (i = 0; i < n; i++) { var m = -1e9; for (j = Math.max(0, i - k); j <= Math.min(n - 1, i + k); j++) m = Math.max(m, P.YG[j]); Y[i] = m + c; }
    } else if (mode === 'cutfill') {
      /* a graded alignment at grade: the ground smoothed over o.window, then held within the grade both ways (down as well as up), so it cuts
         into a hill and fills a dip; o.above over the result. The host carves the cuttings (KTRANSIT.lineH), the kit draws the fills */
      var cw = Math.max(1, Math.round((o.window == null ? 24 : o.window) / P.step)), ab2 = o.above == null ? 0.45 : o.above;
      for (i = 0; i < n; i++) { var acc = 0, cnt = 0; for (j = Math.max(0, i - cw); j <= Math.min(n - 1, i + cw); j++) { acc += P.YG[j]; cnt++; } Y[i] = acc / cnt + ab2; }
      /* pins: heights the alignment must take (a junction's level, set by the first road through it); held through the passes */
      var pins = (o.pins || []).map(function (pn) { return [Math.max(0, Math.min(n - 1, Math.round(pn.s / P.L * (n - 1)))), pn.y]; }), setPins = function () { pins.forEach(function (pn) { Y[pn[0]] = pn[1]; }); };
      setPins();
      for (var pass = 0; pass < 4; pass++) {
        for (i = 1; i < n; i++) { var d1 = P.S[i] - P.S[i - 1]; Y[i] = Math.max(Y[i - 1] - g * d1, Math.min(Y[i - 1] + g * d1, Y[i])); } setPins();
        for (i = n - 2; i >= 0; i--) { var d2b = P.S[i + 1] - P.S[i]; Y[i] = Math.max(Y[i + 1] - g * d2b, Math.min(Y[i + 1] + g * d2b, Y[i])); } setPins(); }
      return { Y: Y, at: function (s) { s = Math.max(0, Math.min(P.L, s)); var f = s / P.L * (n - 1), a = Math.floor(f), t = f - a; return a >= n - 1 ? Y[n - 1] : Y[a] + (Y[a + 1] - Y[a]) * t; }, mode: mode };
    } else { var ab = o.above == null ? 0.45 : o.above; for (i = 0; i < n; i++) Y[i] = P.YG[i] + ab; }
    if (o.lift) for (i = 0; i < n; i++) { var lv = o.lift(P.S[i]); if (lv != null && lv > Y[i]) Y[i] = lv; }
    for (i = 1; i < n; i++) { var ds = P.S[i] - P.S[i - 1]; if (Y[i] < Y[i - 1] - g * ds) Y[i] = Y[i - 1] - g * ds; }
    for (i = n - 2; i >= 0; i--) { var ds2 = P.S[i + 1] - P.S[i]; if (Y[i] < Y[i + 1] - g * ds2) Y[i] = Y[i + 1] - g * ds2; }
    function at(s) {
      s = Math.max(0, Math.min(P.L, s));
      var f = s / P.L * (n - 1), a = Math.floor(f), t = f - a;
      if (a >= n - 1) return Y[n - 1];
      return Y[a] + (Y[a + 1] - Y[a]) * t;
    }
    return { Y: Y, at: at, mode: mode };
  };
  /* segment intersections between a path and another path or polyline (proper crossings only; touching ends count once) */
  /* a road at grade as a record: its graded alignment (KTRANSIT.profile 'cutfill': o.maxGrade 0.08), its level at any point, its cuts and fills.
       o: id, ground (required), width (11), pavement (3.5), maxGrade, shift, radius (fillet, 40), above (0.06)
       o.drift (0..1 or a function of s: the road under sand, Rd.drifts), o.kind (a name: KTRANSIT.ROAD_KINDS), o.lines ('both' | 'edges' | 'none'),
       o.pins [{s, y}] (heights the alignment takes: a junction's level, KTRANSIT.network)
       -> Rd {id, kind: 'road', path, width, pavement, yAt(s), levelAt(x, z) (the alignment, dipping by o.carve there), regrade(pins) (more pins, in place), form (the depth of the formation under the surface, 0.45),
             segs: [{s0, s1, x0, z0, y0, x1, z1, y1, fill (the surface over the ground at the middle: + a fill, - a cut)}],
             drifts: [{id, s0, s1, side, reach, depth}], L} */
  T.road = function (pts, o) {
    o = o || {};
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.road: o.ground(x, z) is required');
    var P = T.path(pts, { ground: o.ground, radius: o.radius == null ? 40 : o.radius, step: 4, shift: o.shift }), Y = T.profile(P, { mode: 'cutfill', above: o.above == null ? 0.06 : o.above, maxGrade: o.maxGrade == null ? 0.08 : o.maxGrade, window: 30, pins: o.pins });
    var Rd = { id: o.id == null ? 'road' : String(o.id), kind: 'road', roadKind: o.kind == null ? 'road' : o.kind, lines: o.lines == null ? 'both' : o.lines, path: P, L: P.L, width: o.width == null ? 11 : o.width, pavement: o.pavement == null ? 3.5 : o.pavement, form: 0.45, segs: [], pins: (o.pins || []).slice(), opts: o, Y: Y };
    /* the heights read the LIVE profile (Rd.Y), so a road regraded in place (Rd.regrade: a junction joined later pins it) changes under every
       holder of its yAt / levelAt (a street's ground, a war built on it) */
    Rd.yAt = function (s) { return Rd.Y.at(s); }; Rd.deckAt = Rd.yAt;
    /* the surface anywhere: the alignment, taken down by what the host carved there (o.carve(x, z) <= 0: a crater, a sinkhole), so a road
       over a crater dips into it; it does NOT follow the ground into the dips it fills (the embankment is drawn under it) */
    Rd.levelAt = function (x, z) { var pr = P.project(x, z), y = Rd.Y.at(pr.s); return o.carve ? y + Math.min(0, o.carve(x, z)) : y; };
    var grade = function () { Rd.segs = []; var n = Math.max(1, Math.round(P.L / 12));
      for (var i = 0; i < n; i++) { var s0 = i * P.L / n, s1 = (i + 1) * P.L / n, a = P.at(s0), b = P.at(s1), m = P.at((s0 + s1) / 2); Rd.segs.push({ s0: s0, s1: s1, x0: a.x, z0: a.z, y0: Rd.Y.at(s0), x1: b.x, z1: b.z, y1: Rd.Y.at(s1), fill: Rd.Y.at(m.s) - m.yG }); } };
    grade();
    /* regrade(pins): more heights the alignment must take (a junction's level), held with the ones it has; the profile is rebuilt in place */
    Rd.regrade = function (pins) { Rd.pins = Rd.pins.concat(pins || []); Rd.Y = T.profile(P, { mode: 'cutfill', above: o.above == null ? 0.06 : o.above, maxGrade: o.maxGrade == null ? 0.08 : o.maxGrade, window: 30, pins: Rd.pins }); grade(); return Rd; };
    /* the drifts (the owner, 2026-11-09: a road covered in soil or sand): o.drift 0..1 or a function of s, the share of the road under sand; each
       drift a wedge from one kerb across `reach` of the carriageway, `depth` deep at the kerb, a run of 20 to 60 m; at 1 the drifts meet and cover it */
    var dr = typeof o.drift === 'function' ? o.drift : function () { return o.drift == null ? 0 : +o.drift; }, seed = KRAND.child(T.SEED, Rd.id + '.drift') >>> 0;
    Rd.drifts = [];
    for (var ds = 10, k = 0; ds < P.L - 10; k++) { var d = Math.max(0, Math.min(1, dr(ds))), run = 20 + 40 * T.u(seed, k, 1, 0);
      if (d > 0 && T.u(seed, k, 1, 1) < d * 1.1) { var side = T.u(seed, k, 1, 2) < 0.5 ? -1 : 1, W = Rd.width; Rd.drifts.push({ id: Rd.id + '.d' + Rd.drifts.length, s0: ds, s1: Math.min(P.L - 2, ds + run), side: side, reach: Math.min(W + 1, W * (0.25 + 0.95 * d) * (0.7 + 0.6 * T.u(seed, k, 1, 3))), depth: 0.25 + 1.1 * d * (0.6 + 0.8 * T.u(seed, k, 1, 4)) }); }
      ds += run * (0.6 + 0.6 * T.u(seed, k, 1, 5)); }
    return Rd;
  };
  /* the cutting a host carves into its ground for a graded line (a road, a rail at grade): 0 where the line is on or over the ground; below it, the
     ground is taken down to o.form under the line's level (0.1: just under a road's surface; a rail passes 0.45, its ballast's depth) across the
     line's half width (+ the pavement, + 0.5), the sides sloping up at 1 : slope (2). Fills are drawn, not carved */
  T.lineH = function (L, x, z, o) {
    o = o || {}; var half = (o.half == null ? L.width / 2 + (L.pavement == null ? 0 : L.pavement) + 0.5 : o.half), slope = o.slope == null ? 2 : o.slope, form = o.form == null ? 0.1 : o.form;
    if (!L.path.near(x, z, half + 40 * slope)) return 0;
    var pr = L.path.project(x, z);
    var y = L.deckAt(pr.s) - form, g = L.path.ground(x, z), target = pr.d <= half ? y : y + (pr.d - half) / slope;
    return Math.min(0, target - g);
  };
  T.intersections = function (P, Q) {
    var qs = Q && Q.seg ? Q.seg : null;
    if (!qs) {
      if (!Array.isArray(Q) || Q.length < 2) return [];
      qs = []; var acc = 0;
      for (var i = 0; i + 1 < Q.length; i++) { var a = Q[i], b = Q[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]); if (len < 1e-6) continue; qs.push({ x0: a[0], z0: a[1], x1: b[0], z1: b[1], s0: acc, s1: acc + len, len: len, yaw: Math.atan2(b[0] - a[0], b[1] - a[1]) }); acc += len; }
    }
    var out = [];
    P.seg.forEach(function (g) {
      qs.forEach(function (h) {
        var r = [g.x1 - g.x0, g.z1 - g.z0], s = [h.x1 - h.x0, h.z1 - h.z0], den = r[0] * s[1] - r[1] * s[0];
        if (Math.abs(den) < 1e-9) return;
        var qp = [h.x0 - g.x0, h.z0 - g.z0], t = (qp[0] * s[1] - qp[1] * s[0]) / den, u = (qp[0] * r[1] - qp[1] * r[0]) / den;
        if (t < 0 || t > 1 || u < 0 || u > 1) return;
        if ((t === 1 && g.s1 < P.L) || (u === 1 && h.s1 < (qs[qs.length - 1].s1))) return;
        out.push({ sP: g.s0 + g.len * t, sQ: h.s0 + h.len * u, x: g.x0 + r[0] * t, z: g.z0 + r[1] * t, yawP: g.yaw, yawQ: h.yaw });
      });
    });
    out.sort(function (a, b) { return a.sP - b.sP; });
    return out;
  };
})();
