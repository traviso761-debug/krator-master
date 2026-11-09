// ================================================================= ANCIENT TRANSIT — the road network: kinds, nodes, segments, junctions  [G data]
// The owner (2026-11-09): roads that cross each other at 2, 3, 4 or 6 corner intersections, and smaller paved roads for city streets. Built the way
// the city builders do it (Cities: Skylines' nodes and segments; the kerb-line junction mesh of the Unity and Houdini road tools): the roads are a
// graph of NODES (every road end and every meeting) and SEGMENTS (the stretch of a road between two nodes); a node of two arms or more is a
// JUNCTION, its geometry read off the arms' kerb lines: the corner between an arm and the next is where the first's right kerb meets the next's
// left kerb (offset-line intersection), the corner is filleted with an arc the pavement follows, and each arm is CUT at a line square to it just
// beyond its farthest corner (plus the fillet's tangent length), so the road's surface stops there and the junction's patch takes over: the two
// never overlap. Two arms that run straight on (within 10 degrees of opposite) have no corner: the kerb and pavement run across between their
// cuts. A junction has one level: the first road through it sets it at the meeting point, and every road is held flat at that level between its
// cuts (the alignment's pins), so the surfaces meet without a step.
// The kinds: 'avenue' (26 m, 3.5 m pavements), 'road' (11, 3.5), 'street' (7.5, 2.4, no centre line), 'lane' (5, 1.5, no lines), or a width and a
// pavement of the host's own.
//
//   KTRANSIT.ROAD_KINDS                      {avenue, road, street, lane}: width, pavement, lines
//   KTRANSIT.network(defs, o) -> N           defs: [{id, pts, kind | width, pavement, drift, maxGrade}]; o.ground (required), o.shift, o.carve (what the host carves: the surfaces dip by it)
//     N = {roads: [Rd...] (KTRANSIT.road records, in the defs' order, each with network and netIndex), nodes: [J...] (every node), junctions: [J...]
//          (the nodes of two arms or more), segments: [{id, road, s0, s1, from, to}] (from/to: node ids, null at a free end), ground, opts, defs}
//     J = {id, x, z, y, n (the arms), kind: 'end' | 'corner' | 'tee' | 'cross' | 'six' | 'multi', ramp (an arm is a ramp's road), r (the outline's radius about the centre),
//          arms: [{road (index), id, s, yaw (outward), dir (+1 along the road's s, -1 against), width, pavement, end, ramp, cut (the distance from
//          the centre to the arm's cut line)}] sorted by yaw, raw: [[road, s]...] (the meetings it was built from),
//          corners: [{between: [arm, arm], straight, sliver (arms under 30 degrees: the corner capped), apex: [x, z] | null (where the kerb lines meet), inner: [[x, z]...] (the kerb from the first
//          arm's cut round the fillet to the next arm's cut), outer: [[x, z]...] (the pavement's outer edge), x, z, yaw (where a signal stands,
//          facing the centre)}], patch: [[x, z]...] (the asphalt outline, star-shaped about the centre: cut lines and apexes),
//          outline: [[x, z]...] (the whole junction: the pavements' outer edges), levelAt(x, z) (the junction's surface: its level, dipping by o.carve there, as the roads' levelAt)}
//   KTRANSIT.junctionAt(N, x, z, pad)        the junction whose outline (grown by pad) holds (x, z), or null
//   KTRANSIT.nearJunction(N, road, s, pad)   the junction a road's s lies within (an arm's cut + pad), or null
//   KTRANSIT.join(N, d) -> index             a road added to a built network (d as a def, plus trim: stop at the first road crossed; pins): its nodes
//                                            built, the roads it meets regraded in place; the record carries network and netIndex
//   KTRANSIT.joinRamps(N, H) -> [index...]   a highway's ramps' landing roads joined (kind 'ramp', no pavement), each ramp's `road` replaced by the record
//   KTRANSIT.cutsOf(N, road)                 [[s0, s1]...] the stretches of a road the junctions take, sorted and merged: the road is drawn between them
//   KTRANSIT.resample(pts, m)                a polyline [[x, z]...] resampled to m points at equal fractions of its length
(function () {
  var T = KTRANSIT;
  function num(v, d) { return v == null ? d : v; }
  T.ROAD_KINDS = { avenue: { width: 26, pavement: 3.5, lines: 'both' }, road: { width: 11, pavement: 3.5, lines: 'both' }, street: { width: 7.5, pavement: 2.4, lines: 'edges' }, lane: { width: 5, pavement: 1.5, lines: 'none' } };
  var TAU = Math.PI * 2, norm = function (a) { a = a % TAU; if (a < 0) a += TAU; return a; }, FAR = 40;
  /* a point in a node's frame: `along` an arm's forward (sin yaw, cos yaw) and `right` of it (cos yaw, -sin yaw: the kit's side +1). The arm
     after it in yaw order lies to its right */
  function pt(J, yaw, along, right) { return [J.x + Math.sin(yaw) * along + Math.cos(yaw) * right, J.z + Math.cos(yaw) * along - Math.sin(yaw) * right]; }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function clampFar(v) { return Math.max(-FAR, Math.min(FAR, v)); }
  T.resample = function (pts, m) {
    var L = [0], i, k = 0, out = [];
    for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var tot = L[L.length - 1];
    for (i = 0; i < m; i++) { var s = tot * i / (m - 1); while (k < pts.length - 2 && L[k + 1] < s) k++; var d = L[k + 1] - L[k]; out.push(d > 1e-9 ? lerp(pts[k], pts[k + 1], (s - L[k]) / d) : pts[k].slice()); }
    return out;
  };
  /* the junction's geometry from its arms (sorted by yaw): the corners, the cuts, the fillets, the patch and the outline */
  function geometry(J, roads) {
    var n = J.n, arms = J.arms, i;
    arms.forEach(function (a) { a.cut = 1; a.w = a.width / 2; a.p = a.pavement == null ? 0 : a.pavement; });
    J.corners = []; J.patch = []; J.outline = [];
    if (n < 2) { J.r = arms[0].w + arms[0].p; arms[0].cut = 0; return; }
    var pairs = [];
    for (i = 0; i < n; i++) {
      var A = arms[i], B = arms[(i + 1) % n], th = norm(B.yaw - A.yaw), sn = Math.sin(th), cs = Math.cos(th), P = { a: i, b: (i + 1) % n, theta: th, straight: Math.abs(sn) < 0.17 && cs < 0 };
      if (!P.straight) {
        /* the kerb lines meet at tA along A (right of it by its half width) and uB along B (left of it): offset-line intersection. Two arms
           nearly together (a sliver) put the corner far out: clamped */
        var s2 = Math.abs(sn) < 0.17 ? (sn < 0 ? -0.17 : 0.17) : sn;
        P.tA = clampFar((A.w * cs + B.w) / s2); P.uB = clampFar((B.w * cs + A.w) / s2);
        P.tA2 = clampFar(((A.w + A.p) * cs + (B.w + B.p)) / s2); P.uB2 = clampFar(((B.w + B.p) * cs + (A.w + A.p)) / s2);
        /* the fillet: the angle between the two kerbs at the corner, a radius a quarter of the narrower road (4 m at most), the tangent length;
           the cut lies beyond the corner by the tangent length and a margin, so every fillet has its kerb to stand on */
        /* two arms under about 30 degrees apart would meet far out: the corner is capped at twice the widths plus 8 m and the kerbs end there on a
           slanted edge across a paved gore (the road tools widen such a junction; a host may rather turn one road) */
        var cap = 2 * (A.w + B.w) + 8; P.sliver = Math.abs(P.tA) > cap || Math.abs(P.uB) > cap;
        if (P.sliver) { var cl = function (v, c) { return Math.max(-c, Math.min(c, v)); }; P.tA = cl(P.tA, cap); P.uB = cl(P.uB, cap); P.tA2 = cl(P.tA2, cap + A.p + B.p); P.uB2 = cl(P.uB2, cap + A.p + B.p); P.dt = 0; A.cut = Math.max(A.cut, P.tA + 0.3); B.cut = Math.max(B.cut, P.uB + 0.3); }
        else { P.phi = Math.max(0.35, Math.acos(Math.max(-1, Math.min(1, cs)))); P.R = Math.min(4, 0.25 * Math.min(A.width, B.width)); P.dt = Math.min(12, P.R / Math.tan(P.phi / 2)); P.R = P.dt * Math.tan(P.phi / 2);
          A.cut = Math.max(A.cut, P.tA + P.dt + 0.3); B.cut = Math.max(B.cut, P.uB + P.dt + 0.3); }
      }
      pairs.push(P);
    }
    /* a cut never runs off the road */
    arms.forEach(function (a) { var R = roads[a.road], avail = a.dir > 0 ? R.L - a.s : a.s; a.cut = Math.max(0.5, Math.min(a.cut, avail - 0.5)); });
    pairs.forEach(function (P) {
      var A = arms[P.a], B = arms[P.b], inner, outer, apex = null, cA = pt(J, A.yaw, A.cut, A.w), cB = pt(J, B.yaw, B.cut, -B.w), oA = pt(J, A.yaw, A.cut, A.w + A.p), oB = pt(J, B.yaw, B.cut, -(B.w + B.p));
      if (P.straight) { inner = [cA, cB]; outer = [oA, oB]; }
      else if (P.sliver) { apex = pt(J, A.yaw, P.tA, A.w); inner = [cA, apex, cB]; outer = [oA, pt(J, A.yaw, P.tA2, A.w + A.p), oB]; }
      else {
        apex = pt(J, A.yaw, P.tA, A.w);
        var fA = [Math.sin(A.yaw), Math.cos(A.yaw)], fB = [Math.sin(B.yaw), Math.cos(B.yaw)], bis = [fA[0] + fB[0], fA[1] + fB[1]], bl = Math.hypot(bis[0], bis[1]) || 1, cd = P.R / Math.sin(P.phi / 2), C = [apex[0] + bis[0] / bl * cd, apex[1] + bis[1] / bl * cd];
        var TA = [apex[0] + fA[0] * P.dt, apex[1] + fA[1] * P.dt], TB = [apex[0] + fB[0] * P.dt, apex[1] + fB[1] * P.dt], a0 = Math.atan2(TA[0] - C[0], TA[1] - C[1]), a1 = Math.atan2(TB[0] - C[0], TB[1] - C[1]), da = a1 - a0;
        while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        var arc = []; for (var k = 0; k <= 6; k++) { var a = a0 + da * k / 6; arc.push([C[0] + Math.sin(a) * P.R, C[1] + Math.cos(a) * P.R]); }
        inner = [cA].concat(arc, [cB]); outer = [oA, pt(J, A.yaw, P.tA2, A.w + A.p), oB];
      }
      /* where a signal or a sign stands: between the kerb's middle and the outer edge's middle, facing the centre */
      var im = inner[Math.floor(inner.length / 2)], om = P.straight ? lerp(outer[0], outer[1], 0.5) : outer[1], sx = im[0] * 0.45 + om[0] * 0.55, sz = im[1] * 0.45 + om[1] * 0.55;
      J.corners.push({ between: [P.a, P.b], straight: P.straight, sliver: !!P.sliver, apex: apex, inner: inner, outer: outer, x: sx, z: sz, yaw: Math.atan2(J.x - sx, J.z - sz) });
      J.patch.push(pt(J, A.yaw, A.cut, -A.w), cA); if (apex) J.patch.push(apex);
      J.outline.push(pt(J, A.yaw, A.cut, -(A.w + A.p)), oA); if (apex) J.outline.push(outer[1]);
    });
    J.r = 0; J.outline.forEach(function (q) { J.r = Math.max(J.r, Math.hypot(q[0] - J.x, q[1] - J.z)); });
  }
  function inPoly(poly, x, z) { var c = false, n = poly.length; for (var i = 0, j = n - 1; i < n; j = i++) { var a = poly[i], b = poly[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function nearPoly(poly, x, z, pad) { var n = poly.length; for (var i = 0, j = n - 1; i < n; j = i++) { var a = poly[i], b = poly[j], dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = l2 > 1e-9 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0; if (Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) <= pad) return true; } return false; }
  /* the meetings of road i with the roads `others`: every crossing, and every end of one within 1.5 m of the other (a T, a corner) */
  function meetsOf(roads, i, others) {
    var meets = [], A = roads[i];
    others.forEach(function (j) { if (j === i) return; var B = roads[j];
      T.intersections(A.path, B.path).forEach(function (c) { meets.push({ x: c.x, z: c.z, arms: [[i, c.sP], [j, c.sQ]] }); });
      [[i, j], [j, i]].forEach(function (pr) { var P1 = roads[pr[0]], P2 = roads[pr[1]]; [0, P1.L].forEach(function (sEnd) { var e = P1.path.at(sEnd), q = P2.path.project(e.x, e.z); if (q.d <= 1.5 && !meets.some(function (m) { return Math.hypot(m.x - e.x, m.z - e.z) < 2 && m.arms.some(function (ar) { return ar[0] === pr[0] && Math.abs(ar[1] - sEnd) < 2; }); })) meets.push({ x: e.x, z: e.z, arms: [[pr[0], sEnd], [pr[1], q.s]] }); }); }); });
    return meets;
  }
  /* a meeting into the nodes: a node within 2 m takes its arms (three roads through one point: six arms), else a new node */
  function nodeOf(N, m) {
    var J = N.nodes.filter(function (q) { return Math.hypot(q.x - m.x, q.z - m.z) < 2; })[0];
    if (!J) { J = { id: 'j' + N.nodes.length, x: m.x, z: m.z, raw: [] }; N.nodes.push(J); }
    m.arms.forEach(function (a) { if (!J.raw.some(function (b) { return b[0] === a[0] && Math.abs(b[1] - a[1]) < 2; })) J.raw.push(a); });
    return J;
  }
  /* the free ends of the roads given: a node of one arm each */
  function endNodes(N, idx) { idx.forEach(function (k) { var R = N.roads[k]; [0, R.L].forEach(function (sEnd) { var e = R.path.at(sEnd); if (!N.nodes.some(function (J) { return J.raw.some(function (a) { return a[0] === k && Math.abs(a[1] - sEnd) < 2; }); })) N.nodes.push({ id: 'j' + N.nodes.length, x: e.x, z: e.z, raw: [[k, sEnd]] }); }); }); }
  /* a node from its raw arms: the arms (a road through it gives two, back and on; a road ending there one), sorted by yaw; the kind; the level
     (the first road's at the meeting); the geometry. Returns the pins that hold each road flat between its cuts there */
  function buildNode(N, J) {
    var roads = N.roads, o = N.opts; J.arms = [];
    J.raw.sort(function (a, b) { return a[0] - b[0]; });
    J.raw.forEach(function (a) { var R = roads[a[0]], s = a[1], atEnd = s < 1 || s > R.L - 1, ramp = R.roadKind === 'ramp';
      if (!atEnd) { [-1, 1].forEach(function (dir) { var p = R.path.at(s + dir * 3); J.arms.push({ road: a[0], id: R.id, s: s, dir: dir, yaw: Math.atan2(p.x - J.x, p.z - J.z), width: R.width, pavement: R.pavement, end: false, ramp: ramp }); }); }
      else { var dir2 = s < 1 ? 1 : -1, p2 = R.path.at(s + dir2 * 3); J.arms.push({ road: a[0], id: R.id, s: s, dir: dir2, yaw: Math.atan2(p2.x - J.x, p2.z - J.z), width: R.width, pavement: R.pavement, end: true, ramp: ramp }); } });
    J.arms.sort(function (a, b) { return norm(a.yaw) - norm(b.yaw); });
    J.n = J.arms.length; J.kind = J.n < 2 ? 'end' : J.n === 2 ? 'corner' : J.n === 3 ? 'tee' : J.n === 4 ? 'cross' : J.n === 6 ? 'six' : 'multi'; J.ramp = J.arms.some(function (a) { return a.ramp; });
    var first = J.raw[0]; J.level = { road: first[0], s: first[1] }; J.y = roads[first[0]].yAt(first[1]);
    geometry(J, roads);
    J.levelAt = function (x, z) { return o.carve ? J.y + Math.min(0, o.carve(x, z)) : J.y; };
    var pins = {};
    if (J.n >= 2) J.arms.forEach(function (a) { var R = roads[a.road], dq = R.path.L / Math.max(1, R.path.n - 1) * 0.5; for (var q = 0; q <= a.cut + 2 * dq; q += dq) (pins[a.road] || (pins[a.road] = [])).push({ s: Math.max(0, Math.min(R.L, a.s + a.dir * q)), y: J.y }); });
    return pins;
  }
  /* the drifts keep off the junctions: a drift over a cut is trimmed to it, or split round it, and dropped when under 8 m remains */
  function clipDrifts(N, k) {
    var R = N.roads[k], cuts = T.cutsOf(N, k); if (!cuts.length || !R.drifts.length) return; var kept = [];
    R.drifts.forEach(function (d) { var parts = [[d.s0, d.s1]]; cuts.forEach(function (c) { var next = []; parts.forEach(function (p) { if (p[1] <= c[0] - 2 || p[0] >= c[1] + 2) next.push(p); else { if (c[0] - 2 - p[0] > 8) next.push([p[0], c[0] - 2]); if (p[1] - (c[1] + 2) > 8) next.push([c[1] + 2, p[1]]); } }); parts = next; });
      parts.forEach(function (p, i) { var e = {}; for (var key in d) e[key] = d[key]; e.id = d.id.replace(/b\d+$/, '') + (i ? 'b' + i : ''); e.s0 = p[0]; e.s1 = p[1]; kept.push(e); }); });
    R.drifts = kept;
  }
  /* the segments: each road between its cuts, in order along it */
  function segmentsOf(N) {
    N.segments.length = 0;
    N.roads.forEach(function (R, k) {
      var cuts = T.cutsOf(N, k), s0 = 0, seg = 0, nodeAt = function (s) { var best = null; N.nodes.forEach(function (J) { J.arms.forEach(function (a) { if (a.road === k && Math.abs(a.s - s) < 2.5) best = J; }); }); return best; }, from = nodeAt(0);
      var push = function (a, b, to) { if (b - a > 0.5) N.segments.push({ id: R.id + '.g' + seg++, road: k, s0: a, s1: b, from: from ? from.id : null, to: to ? to.id : null }); };
      cuts.forEach(function (c) { var J = nodeAt(c[2]); push(s0, c[0], J); s0 = c[1]; from = J; });
      push(s0, R.L, nodeAt(R.L));
    });
  }
  /* the nodes given built (or rebuilt), the roads they pin regraded in place, the junction list, the drifts and the segments brought up to date */
  function finishNodes(N, which, touched) {
    var pinsAll = {};
    which.forEach(function (J) { var p = buildNode(N, J); for (var k in p) pinsAll[k] = (pinsAll[k] || []).concat(p[k]); });
    for (var k in pinsAll) N.roads[k].regrade(pinsAll[k]);
    N.junctions.length = 0; N.nodes.forEach(function (J) { J.y = N.roads[J.level.road].yAt(J.level.s); if (J.n >= 2) N.junctions.push(J); });
    touched.forEach(function (k) { clipDrifts(N, k); });
    segmentsOf(N);
  }
  T.network = function (defs, o) {
    o = o || {};
    if (typeof o.ground !== 'function') throw new Error('KTRANSIT.network: o.ground(x, z) is required');
    if (!Array.isArray(defs) || !defs.length) throw new Error('KTRANSIT.network: a list of road definitions, please');
    var roads = [], N = { roads: roads, nodes: [], junctions: [], segments: [], ground: o.ground, opts: o, defs: defs.slice() }, i;
    var make = function (d) { var K = T.ROAD_KINDS[d.kind == null ? 'road' : d.kind] || T.ROAD_KINDS.road; return T.road(d.pts, { id: d.id, ground: o.ground, carve: o.carve, shift: o.shift, width: num(d.width, K.width), pavement: num(d.pavement, K.pavement), lines: d.lines == null ? K.lines : d.lines, kind: d.kind == null ? 'road' : d.kind, drift: d.drift, maxGrade: d.maxGrade, radius: d.radius, pins: d.pins }); };
    defs.forEach(function (d) { var R = make(d); R.network = N; R.netIndex = roads.length; roads.push(R); });
    var all = roads.map(function (R, k) { return k; });
    for (i = 0; i < roads.length; i++) meetsOf(roads, i, all.filter(function (j) { return j > i; })).forEach(function (m) { nodeOf(N, m); });
    endNodes(N, all);
    finishNodes(N, N.nodes.slice(), all);
    return N;
  };
  /* JOIN: a road added to a built network (a highway ramp's landing road: KTRANSIT.joinRamps). d.trim stops it at the first road it crosses (a
     T, not a stub beyond); an end within a road's width and pavement plus 3 m is carried to that road's centre line (a T, not a road ending on a
     carriageway). The new road's meetings become nodes (or join nodes within 2 m); those nodes are built, the roads they pin regraded in place
     (every holder of a road's yAt or levelAt sees the new level), the segments redone. Returns the new road's index; the record carries
     `network` and `netIndex`, so KTRANSIT.draw.road cuts it at its junctions without being told */
  T.join = function (N, d) {
    if (!N || !N.roads || !N.opts) throw new Error('KTRANSIT.join: a KTRANSIT.network, please');
    if (!d || !Array.isArray(d.pts) || d.pts.length < 2) throw new Error('KTRANSIT.join: a road definition with pts, please');
    var o = N.opts, pts = d.pts.map(function (p) { return Array.isArray(p) ? [p[0], p[1]] : [p.x, p.z]; }), K = T.ROAD_KINDS[d.kind] || { width: 7.5, pavement: 0, lines: 'edges' };
    if (d.trim) { var P0 = T.path(pts, { ground: o.ground, radius: d.radius == null ? 20 : d.radius, step: 4 }), best = null;
      N.roads.forEach(function (R) { T.intersections(P0, R.path).forEach(function (c) { if (c.sP > 4 && (!best || c.sP < best.sP)) best = c; }); });
      if (best) { var kept = [pts[0]], acc = 0; for (var q = 1; q < pts.length; q++) { acc += Math.hypot(pts[q][0] - pts[q - 1][0], pts[q][1] - pts[q - 1][1]); if (acc < best.sP - 1) kept.push(pts[q]); else break; } kept.push([best.x, best.z]); pts = kept; } }
    /* (an end is not carried onto a road its other end already meets, nor when the carried road would be under 10 m) */
    [0, pts.length - 1].forEach(function (ei) { var e = pts[ei], far = pts[ei ? 0 : pts.length - 1], hit = null; N.roads.forEach(function (R) { var q = R.path.project(e[0], e[1]); if (q.d > 1.5 && q.d <= R.width / 2 + (R.pavement == null ? 0 : R.pavement) + 3 && q.s > 1 && q.s < R.L - 1 && R.path.project(far[0], far[1]).d > 1.5 && (!hit || q.d < hit.d)) hit = { d: q.d, s: q.s, R: R }; }); if (hit) { var c = hit.R.path.at(hit.s); if (Math.hypot(c.x - far[0], c.z - far[1]) >= 10) pts[ei] = [c.x, c.z]; } });
    var Rd = T.road(pts, { id: d.id, ground: o.ground, carve: o.carve, shift: o.shift, width: num(d.width, K.width), pavement: num(d.pavement, K.pavement), lines: d.lines == null ? K.lines : d.lines, kind: d.kind == null ? 'road' : d.kind, drift: d.drift, maxGrade: d.maxGrade, radius: d.radius, pins: d.pins }), k = N.roads.length;
    Rd.network = N; Rd.netIndex = k; N.roads.push(Rd); N.defs.push(d);
    var others = N.roads.map(function (R, j) { return j; }).filter(function (j) { return j !== k; });
    meetsOf(N.roads, k, others).forEach(function (m) { nodeOf(N, m); });
    endNodes(N, [k]);
    var which = N.nodes.filter(function (J) { return J.raw.some(function (a) { return a[0] === k; }); }), touched = {};
    which.forEach(function (J) { J.raw.forEach(function (a) { touched[a[0]] = true; }); });
    finishNodes(N, which, Object.keys(touched).map(Number));
    return k;
  };
  /* a highway's ramps joined to the network: each landing road becomes a road of kind 'ramp' (its width, no pavement, edge lines), pinned at
     its start to the ramp's deck end, trimmed to the first road it crosses or carried to the one it ends beside; the ramp's `road` is replaced
     by the record, so KTRANSIT.draw.highway draws it cut at its junction. Returns the indices */
  T.joinRamps = function (N, H) {
    if (!H || !H.ramps) throw new Error('KTRANSIT.joinRamps: a KTRANSIT.highway, please');
    return H.ramps.map(function (R) { var k = T.join(N, { id: R.road.id, pts: R.road.pts.map(function (p) { return [p.x, p.z]; }), width: R.road.width, pavement: 0, lines: 'edges', kind: 'ramp', trim: true, radius: 20, pins: [{ s: 0, y: R.deckAt(R.L) }] }); R.road = N.roads[k]; return k; });
  };
  T.cutsOf = function (N, road) {
    var out = [];
    N.junctions.forEach(function (J) { var back = 0, on = 0, hit = false; J.arms.forEach(function (a) { if (a.road !== road) return; hit = true; if (a.dir > 0) on = Math.max(on, a.cut); else back = Math.max(back, a.cut); }); if (hit) { var s = J.arms.filter(function (a) { return a.road === road; })[0].s; out.push([Math.max(0, s - back), Math.min(N.roads[road].L, s + on), s]); } });
    out.sort(function (a, b) { return a[0] - b[0]; });
    var merged = []; out.forEach(function (c) { var last = merged[merged.length - 1]; if (last && c[0] <= last[1]) last[1] = Math.max(last[1], c[1]); else merged.push(c.slice()); });
    return merged;
  };
  T.junctionAt = function (N, x, z, pad) { pad = pad == null ? 0 : pad; for (var i = 0; i < N.junctions.length; i++) { var J = N.junctions[i]; if (Math.hypot(x - J.x, z - J.z) > J.r + pad) continue; if (inPoly(J.outline, x, z) || (pad > 0 && nearPoly(J.outline, x, z, pad))) return J; } return null; };
  T.nearJunction = function (N, road, s, pad) { pad = pad == null ? 0 : pad; for (var i = 0; i < N.junctions.length; i++) { var J = N.junctions[i]; for (var k = 0; k < J.arms.length; k++) { var a = J.arms[k]; if (a.road !== road) continue; var d = (s - a.s) * a.dir; if (d >= -1e-6 ? d <= a.cut + pad : -d <= pad + 1e-6) return J; } } return null; };
})();
