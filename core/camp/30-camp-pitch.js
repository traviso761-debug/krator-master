/* ==================== core/camp 30: pitching a camp (plain data, [G data]) ==================== */
/* core/camp/PLAN.md section 4. KCAMP.pitch lays a band's program out at a site as records; it draws nothing. The
   formation (the culture row's, or o.formation):
     ring       the tents' doors round a common (the hearth and the council ground) in the middle: the chief's pavilion
                opposite the way in, the council and the shrine beside it, the dwellings on round, the trades and the
                trader's tent nearest the way in, where visitors come
     horseshoe  the same, open over a quarter of the ring toward the way in
   The pens stand outside the ring downwind (the culture row's wind), largest first, each the first fit on arcs out from
   the ring; beyond them the pasture (program.pasture.ha), a rectangle across the wind; the band's thorn hedge (program
   .hedge) runs round all of it with a gate on the way in and one beyond the pasture, the pasture's rails (its fence)
   with a gate toward the tents. Every box keeps `gap` metres from every other (an exact oriented-box test; the boxes
   are filed in core/space) and stands wholly on ground.ok (its corners, its edges' middles and its centre).
   Nothing is chosen by draw order: a tent's place is a function of the program, the dims, the ground and the band's
   seed, which only breaks ties between equal candidates.
     KCAMP.pitch({id, world, culture, program, site: {x, z}, dims(key, v) -> {w, d, h}, ground: {ok(x, z)},
                  way: [x, z] (toward the way in: a road, the coast, the town), wind?, formation?, gap? (2),
                  common? (the open ground's radius, 14 m)}) ->
       {id, site, formation, R (the ring's radius), hearth: {x, z}, gate: {x, z}, way, wind,
        records: [{id, key, v, kind, x, z, ry, w, d, h}], pasture: {pts, ha} | null,
        hedge: {key, v, gateV, pts, gates} | null, fence: {key, v, gateV, pts, gates} | null, short: [ids not pitched]}
       A record's ry turns its +z (its door) to face the hearth; pts are closed loops (the last point is not repeated),
       gates distances along them, for the kit to cut into pieces (BR_RUN).
     KCAMP.box(r, pad) -> its four corners     KCAMP.overlaps(a, b, gap) -> true when the boxes come within gap
     KCAMP.check(camp, ground) -> {overlaps, offGround, outside}: the counts a test or a page's verify reads */
(function () {
  'use strict';
  var box = function (r, pad) {
    var p = pad || 0, c = Math.cos(r.ry), s = Math.sin(r.ry), hw = r.w / 2 + p, hd = r.d / 2 + p;
    /* local +x is (cos ry, -sin ry), local +z (the door) is (sin ry, cos ry) */
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [r.x + c * hw * q[0] + s * hd * q[1], r.z - s * hw * q[0] + c * hd * q[1]]; });
  };
  var sep = function (A, B) {
    for (var Q = 0; Q < 2; Q++) {
      var P = Q ? B : A;
      for (var j = 0; j < 4; j++) {
        var a = P[j], b = P[(j + 1) % 4], nx = -(b[1] - a[1]), nz = b[0] - a[0], amin = 1e18, amax = -1e18, bmin = 1e18, bmax = -1e18;
        for (var k = 0; k < 4; k++) {
          var pa = A[k][0] * nx + A[k][1] * nz, pb = B[k][0] * nx + B[k][1] * nz;
          if (pa < amin) amin = pa; if (pa > amax) amax = pa; if (pb < bmin) bmin = pb; if (pb > bmax) bmax = pb;
        }
        if (amax <= bmin + 1e-6 || bmax <= amin + 1e-6) return true;
      }
    }
    return false;
  };
  var overlaps = function (a, b, gap) { return !sep(box(a, (gap || 0) / 2), box(b, (gap || 0) / 2)); };
  var onGround = function (r, ok) {
    var B = box(r, 0), pts = B.concat([[r.x, r.z]]);
    for (var i = 0; i < 4; i++) pts.push([(B[i][0] + B[(i + 1) % 4][0]) / 2, (B[i][1] + B[(i + 1) % 4][1]) / 2]);
    for (var j = 0; j < pts.length; j++) if (!ok(pts[j][0], pts[j][1])) return false;
    return true;
  };
  var unit = function (v) { var L = Math.hypot(v[0], v[1]) || 1; return [v[0] / L, v[1] / L]; };
  var ang = function (v) { return Math.atan2(v[1], v[0]); };
  var hull = function (P) {
    P = P.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (P.length < 3) return P;
    var cr = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], up = [];
    P.forEach(function (p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  /* the distance along a closed loop to where a ray from c in direction u leaves it (the gate's place) */
  var rayHit = function (pts, c, u) {
    var best = null, d0 = 0;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length], ex = b[0] - a[0], ez = b[1] - a[1], L = Math.hypot(ex, ez);
      var den = u[0] * ez - u[1] * ex;
      if (Math.abs(den) > 1e-9) {
        var t = ((a[0] - c[0]) * ez - (a[1] - c[1]) * ex) / den, s = ((a[0] - c[0]) * u[1] - (a[1] - c[1]) * u[0]) / den;
        if (t > 0 && s >= 0 && s <= 1 && (!best || t < best.t)) best = {t: t, d: d0 + s * L};
      }
      d0 += L;
    }
    return best ? best.d : 0;
  };
  var inPoly = function (pts, x, z) {
    var c = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      if ((pts[i][1] > z) !== (pts[j][1] > z) && x < (pts[j][0] - pts[i][0]) * (z - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c;
    }
    return c;
  };

  KCAMP.box = box;
  KCAMP.overlaps = overlaps;
  KCAMP.inPoly = inPoly;
  KCAMP.pitch = function (o) {
    var C = KCAMP.CULTURES[o.culture];
    if (!C) return {error: 'no culture row ' + o.culture, records: [], short: []};
    var seed = KCAMP.seedOf(o.world, o.id), GAP = o.gap == null ? 2 : o.gap, COMMON = o.common == null ? 14 : o.common;
    var ok = (o.ground && o.ground.ok) || function () { return true; }, site = {x: o.site.x, z: o.site.z};
    var way = unit(o.way || [0, 1]), wind = unit(o.wind || C.wind || [0.7071, 0.7071]), form = o.formation || C.formation || 'ring';
    var T = KCAMP.tentIds(o.id, o.program).map(function (t) {
      var D = o.dims(t.key, t.v) || {w: 6, d: 6, h: 4};
      return {id: t.id, key: t.key, v: t.v, kind: C.kind(t.key) || (t.pen ? 'pen' : 'dwelling'), w: D.w, d: D.d, h: D.h, pen: t.pen};
    });
    var tents = T.filter(function (t) { return !t.pen; }), pens = T.filter(function (t) { return t.pen; });
    var placed = [], space = KSPACE.create({cell: 16}), short = [];
    var fits = function (r) {
      if (!onGround(r, ok)) return false;
      var R0 = Math.hypot(r.w, r.d) / 2 + GAP;
      return !space.some(r.x, r.z, R0 + 12, function (q) { return overlaps(r, q, GAP); });
    };
    var put = function (r) { placed.push(r); space.insert(r, r.x, r.z, Math.hypot(r.w, r.d) / 2); };
    var face = function (r) { r.ry = Math.atan2(site.x - r.x, site.z - r.z); return r; };

    /* ---- the ring: the order round it, from the chief's pavilion (opposite the way in) both ways to the way in */
    var rank = {chief: 0, council: 1, shrine: 2, dwelling: 3, sleep: 4, trade: 5};
    var order = tents.slice().sort(function (a, b) { return (rank[a.kind] - rank[b.kind]) || (b.w - a.w) || (a.id < b.id ? -1 : 1); });
    var arc = function (t) { return t.w + GAP + 1.5; };
    var open = form === 'horseshoe' ? Math.PI / 2 : 0.55;   /* the way in: a quarter of the ring, or a lane's width */
    var sum = order.reduce(function (s, t) { return s + arc(t); }, 0), maxD = order.reduce(function (m, t) { return Math.max(m, t.d); }, 0);
    var R = Math.max(COMMON + maxD / 2, sum / (2 * Math.PI - open));
    var a0 = ang([-way[0], -way[1]]), left = [], right = [];
    /* the chief at the head; then each tent to the side with less ring used so far (ties to the left) */
    order.forEach(function (t, i) { if (i === 0) return; var L = left.reduce(function (s, q) { return s + arc(q); }, 0), Rr = right.reduce(function (s, q) { return s + arc(q); }, 0); (L <= Rr ? left : right).push(t); });
    var slots = [{t: order[0], a: a0}];
    [[left, 1], [right, -1]].forEach(function (S) {
      var a = arc(order[0]) / 2 / R;
      S[0].forEach(function (t) { var da = arc(t) / R; slots.push({t: t, a: a0 + S[1] * (a + da / 2)}); a += da; });
    });
    /* each tent the first fit near its slot: out from the ring, then along it, then in (never into the common) */
    var tries = [[0, 0], [2, 0], [0, 0.03], [0, -0.03], [4, 0], [2, 0.05], [2, -0.05], [6, 0], [-2, 0], [4, 0.08], [4, -0.08], [9, 0], [12, 0], [9, 0.1], [9, -0.1], [16, 0], [20, 0]];
    slots.forEach(function (S) {
      var t = S.t, done = false;
      for (var k = 0; k < tries.length && !done; k++) {
        var r0 = R + t.d / 2 + tries[k][0], a = S.a + tries[k][1];
        if (r0 - t.d / 2 < COMMON) continue;
        var r = face({id: t.id, key: t.key, v: t.v, kind: t.kind, x: site.x + Math.cos(a) * r0, z: site.z + Math.sin(a) * r0, w: t.w, d: t.d, h: t.h});
        if (fits(r)) { put(r); done = true; }
      }
      if (!done) short.push(t.id);
    });

    /* ---- the pens: outside the ring, downwind, largest first, each the first fit on arcs out from the ring */
    var aw = ang(wind), aout = R + maxD + 6;
    pens.slice().sort(function (a, b) { return (b.w * b.d - a.w * a.d) || (a.id < b.id ? -1 : 1); }).forEach(function (t) {
      var done = false;
      for (var ring = 0; ring < 8 && !done; ring++) {
        var r0 = aout + ring * 7 + Math.max(t.w, t.d) / 2, n = Math.max(3, Math.floor(r0 * 2.2 / 6));
        for (var j = 0; j <= n && !done; j++) {
          var s = j === 0 ? 0 : (j % 2 ? 1 : -1) * Math.ceil(j / 2), a = aw + s * 6 / r0;
          if (Math.abs(s * 6 / r0) > 1.4) continue;
          var r = face({id: t.id, key: t.key, v: t.v, kind: 'pen', x: site.x + Math.cos(a) * r0, z: site.z + Math.sin(a) * r0, w: t.w, d: t.d, h: t.h});
          if (fits(r)) { put(r); done = true; }
        }
      }
      if (!done) short.push(t.id);
    });

    /* ---- the pasture: a rectangle across the wind, beyond the pens; turned toward the best ground if need be */
    var pasture = null, P = o.program.pasture;
    if (P && P.ha > 0) {
      var far = placed.reduce(function (m, r) { return Math.max(m, (r.x - site.x) * wind[0] + (r.z - site.z) * wind[1] + Math.hypot(r.w, r.d) / 2); }, R);
      var A = P.ha * 1e4, L = Math.sqrt(A * 1.6), W = A / L, best = null;
      [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05].forEach(function (da) {
        var a = aw + da, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]], c0 = [site.x + u[0] * (far + 10 + W / 2), site.z + u[1] * (far + 10 + W / 2)];
        var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return [c0[0] + v[0] * L / 2 * q[0] + u[0] * W / 2 * q[1], c0[1] + v[1] * L / 2 * q[0] + u[1] * W / 2 * q[1]]; });
        var good = 0, n = 0;
        for (var i = 0; i <= 6; i++) for (var j = 0; j <= 4; j++) {
          var x = c0[0] + v[0] * L * (i / 6 - 0.5) + u[0] * W * (j / 4 - 0.5), z = c0[1] + v[1] * L * (i / 6 - 0.5) + u[1] * W * (j / 4 - 0.5);
          n++; if (ok(x, z) && !placed.some(function (r) { return inPoly(box(r, GAP), x, z); })) good++;
        }
        var sc = good / n - Math.abs(da) * 0.02;
        if (!best || sc > best.sc) best = {sc: sc, pts: pts, good: good / n, u: u};
      });
      if (best && best.good >= 0.8) pasture = {pts: best.pts, ha: P.ha, ground: best.good, dir: best.u};
      else short.push(o.id + ':pasture');
    }

    /* ---- the hedge round it all, and the pasture's rails */
    var hedge = null, fence = null, gateAt = null;
    var corners = [];
    placed.forEach(function (r) { box(r, 6).forEach(function (q) { corners.push(q); }); });
    if (pasture) pasture.pts.forEach(function (q) { var dx = q[0] - site.x, dz = q[1] - site.z, L = Math.hypot(dx, dz) || 1; corners.push([q[0] + dx / L * 5, q[1] + dz / L * 5]); });
    if (o.program.hedge && corners.length) {
      var Hp = hull(corners), gates = [rayHit(Hp, [site.x, site.z], way)];
      if (pasture) gates.push(rayHit(Hp, [site.x, site.z], pasture.dir));
      hedge = {key: o.program.hedge.key, v: o.program.hedge.v == null ? 0 : o.program.hedge.v, gateV: o.program.hedge.gate ? o.program.hedge.gate.v : 1, pts: Hp, gates: gates};
      var d = gates[0], acc = 0;
      for (var i = 0; i < Hp.length; i++) {
        var a = Hp[i], b = Hp[(i + 1) % Hp.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (d <= acc + L) { var s = (d - acc) / L; gateAt = {x: a[0] + (b[0] - a[0]) * s, z: a[1] + (b[1] - a[1]) * s}; break; }
        acc += L;
      }
    }
    if (pasture && o.program.pasture.fence) {
      var F = o.program.pasture.fence;
      /* the fence's gate faces the tents: where the ray from the pasture's middle back toward the hearth leaves it */
      var mid = pasture.pts.reduce(function (m, q) { return [m[0] + q[0] / 4, m[1] + q[1] / 4]; }, [0, 0]);
      fence = {key: F.key, v: F.v == null ? 0 : F.v, gateV: F.gate ? F.gate.v : 1, pts: pasture.pts, gates: [rayHit(pasture.pts, mid, [-pasture.dir[0], -pasture.dir[1]])]};
    }
    return {id: o.id, site: site, formation: form, R: R, hearth: {x: site.x, z: site.z}, gate: gateAt || {x: site.x + way[0] * (R + maxD + 8), z: site.z + way[1] * (R + maxD + 8)},
      way: way, wind: wind, records: placed, pasture: pasture, hedge: hedge, fence: fence, short: short};
  };
  KCAMP.check = function (camp, ground, gap) {
    var ok = (ground && ground.ok) || function () { return true; }, R = camp.records, g = gap == null ? 2 : gap, n = 0, off = 0, out = 0;
    for (var i = 0; i < R.length; i++) {
      for (var j = i + 1; j < R.length; j++) if (overlaps(R[i], R[j], g - 0.01)) n++;
      if (!onGround(R[i], ok)) off++;
      if (camp.hedge && !box(R[i], 0).every(function (q) { return inPoly(camp.hedge.pts, q[0], q[1]); })) out++;
    }
    return {overlaps: n, offGround: off, outside: out};
  };
})();
