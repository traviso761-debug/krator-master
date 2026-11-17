// ================================================================= CORE/CITY — the irregular square (KCITY.grid)
// [G data] A site generator for a walled town laid out as Chiang Mai's old city is (the owner, 2026-11-17, for Kirstabal:
// "make the layout more square, with a wall ... mostly square, but somewhat irregular, also like chiang mai"): a near-square
// wall with a bastion at each corner, a street just inside it all the way round, two avenues crossing in the middle that
// leave by four gates, and a grid of main streets between that is never quite regular. Its lines wander off the true grid,
// its crossings are nudged, some of its runs are missing (a street ends in a T against the next one, two blocks become one)
// and a few bend. core/city's own steps then fill the blocks (civic pieces, lots, side streets, alleys).
//
// Plain records (no instance, no THREE, no DOM), seeded from core/rand by position (KRAND), so the same spec gives the same
// plan in node, the page and Godot. Every id begins with spec.id.
//
//   KCITY.grid.plan(spec) -> G
//     spec  {id, seed, c: [x, z] (the square's centre), u: [x, z] (its first axis; v is u turned a quarter, or spec.v),
//            half: m or [hu, hv] (the inner street's half-size along u and v), cells: n or [nu, nv] (grid cells a side),
//            jitter (0.14: how far a grid line and a crossing wander, as a fraction of a cell), corner (0.035: each corner's
//            wander, as a fraction of the half-size), bow (0.02: each side's bow), drop (0.22: the chance an inner run is
//            missing), bend (0.35: the chance an inner run bends, 0.06 of its length), avenues: {u: j, v: i} (the grid line
//            each avenue runs on: the middle by default), wallGap (16: from the inner street's centre to the wall's line),
//            out (60: how far the avenues run on past the wall), zoneIn (6: the build zone's edge, this far inside the wall)}
//     G     {id, frame: {c, u, v}, nodes: [[{id, i, j, x, z}]] (nodes[i][j], i along u), ring: [[x, z]] (the inner street,
//            closed, counter-clockwise), wall: [[x, z]] (closed: the last point is the first), corners: [{id, x, z, at}] (the
//            wall's four corners: the bastions; `at` its index in wall), zone: [[x, z]] (the build zone: the wall drawn in
//            by zoneIn), ways: [{id, kind: 'avenue' | 'main', role: 'avenue' | 'ring' | 'grid', line: 'u' | 'v', index, pts}],
//            gates: [{id, way, side: 'u-' | 'u+' | 'v-' | 'v+', x, z}] (where each avenue meets the wall), cells:
//            [{id, i, j, poly, c: [x, z], merged: [cell ids]}] (a missing run joins two cells: both list each other),
//            edges: {kept, dropped}}
//   KCITY.grid.wall(G, ways, o)  core/city's wall records (KCITY.site.wall) on the square, side by side, so its corners stay
//                                nodes (kind 'corner', the bastions); {line, nodes, gates} as KCITY.site.wall's
//   KCITY.grid.inside(G, x, z)   inside the wall
//   KCITY.grid.side(G, way)      the gate a way leaves by, or null
// The world lays G.ways through its own steps (SL.addWay(kind, pts, ...): the avenues in step 3, the rest with them), the
// wall in step 5 (KCITY.grid.wall(G, avenues, o), the gates falling where the avenues cross it), and its zone in step 0
// (KCITY.site.zoneRaster(R, G.zone, ...)). The drawing is the world's. node core/city/test-grid.js checks it.
KCITY.grid = (function () {
  'use strict';
  var r2 = function (v) { return Math.round(v * 100) / 100; };
  var U = function (seed, a, b, c) { return KRAND.unit(KRAND.hash(seed, a, b == null ? 0 : b, c == null ? 0 : c)); };   /* 0..1 */
  var S = function (seed, a, b, c) { return U(seed, a, b, c) * 2 - 1; };                                                   /* -1..1 */
  function frame(o) {
    var u = o.u || [1, 0], L = Math.hypot(u[0], u[1]) || 1; u = [u[0] / L, u[1] / L];
    var v = o.v ? (function () { var M = Math.hypot(o.v[0], o.v[1]) || 1; return [o.v[0] / M, o.v[1] / M]; })() : [-u[1], u[0]];
    return { c: o.c || [0, 0], u: u, v: v };
  }
  var W = function (F, a, b) { return [F.c[0] + F.u[0] * a + F.v[0] * b, F.c[1] + F.u[1] * a + F.v[1] * b]; };
  var area = function (P) { var A = 0; for (var i = 0; i < P.length; i++) { var p = P[i], q = P[(i + 1) % P.length]; A += p[0] * q[1] - q[0] * p[1]; } return A / 2; };
  /* a closed polygon (no repeated last point) moved out by d along its edges' normals (mitred, the mitre held to 2.5 d) */
  function offset(P, d) {
    var s = area(P) > 0 ? 1 : -1, n = P.length, out = [];
    var nrm = function (a, b) { var dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1; return [s * dz / L, -s * dx / L]; };
    for (var i = 0; i < n; i++) {
      var p = P[i], a = nrm(P[(i - 1 + n) % n], p), b = nrm(p, P[(i + 1) % n]), m = [a[0] + b[0], a[1] + b[1]], ml = Math.hypot(m[0], m[1]) || 1;
      m = [m[0] / ml, m[1] / ml]; var k = d / Math.max(0.4, m[0] * b[0] + m[1] * b[1]);
      out.push([p[0] + m[0] * k, p[1] + m[1] * k]);
    }
    return out;
  }
  function inPoly(P, x, z) { var c = false; for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var a = P[i], b = P[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
  function plan(spec) {
    var id = spec.id || 'grid', seed = spec.seed == null ? 1 : spec.seed, F = frame(spec);
    var half = Array.isArray(spec.half) ? spec.half : [spec.half == null ? 300 : spec.half, spec.half == null ? 300 : spec.half];
    var cells = Array.isArray(spec.cells) ? spec.cells : [spec.cells == null ? 5 : spec.cells, spec.cells == null ? 5 : spec.cells];
    var nu = Math.max(2, cells[0] | 0), nv = Math.max(2, cells[1] | 0), hu = half[0], hv = half[1], cu = 2 * hu / nu, cv = 2 * hv / nv;
    var jit = spec.jitter == null ? 0.14 : spec.jitter, cor = (spec.corner == null ? 0.035 : spec.corner) * Math.min(hu, hv), bow = (spec.bow == null ? 0.02 : spec.bow) * Math.min(hu, hv);
    var pDrop = spec.drop == null ? 0.22 : spec.drop, pBend = spec.bend == null ? 0.35 : spec.bend, gap = spec.wallGap == null ? 16 : spec.wallGap;
    var out = spec.out == null ? 60 : spec.out, zin = spec.zoneIn == null ? 6 : spec.zoneIn;
    var AV = spec.avenues || {}, ja = AV.u == null ? Math.round(nv / 2) : AV.u, ia = AV.v == null ? Math.round(nu / 2) : AV.v;
    /* the grid's lines (an inner line wanders off its place), the four corners and the four sides' bows */
    var au = [], bv = [];
    for (var i = 0; i <= nu; i++) au.push(-hu + cu * i + (i > 0 && i < nu ? S(seed, 11, i) * jit * cu : 0));
    for (var j = 0; j <= nv; j++) bv.push(-hv + cv * j + (j > 0 && j < nv ? S(seed, 12, j) * jit * cv : 0));
    var K = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (q) { return [S(seed, 21, q[0], q[1]) * cor, S(seed, 22, q[0], q[1]) * cor]; });
    var Kc = function (ci, cj) { return K[ci * 2 + cj]; };
    var bowS = { u0: S(seed, 31, 0) * bow, u1: S(seed, 31, 1) * bow, v0: S(seed, 32, 0) * bow, v1: S(seed, 32, 1) * bow };
    /* the crossings: an inner one nudged; one on the inner street keeps to its side (the corners' wander along it, the side's bow) */
    var N = [];
    for (i = 0; i <= nu; i++) {
      N.push([]);
      for (j = 0; j <= nv; j++) {
        var a = au[i], b = bv[j], tu = i / nu, tv = j / nv;
        if (i > 0 && i < nu && j > 0 && j < nv) { a += S(seed, 13, i, j) * jit * cu * 0.45; b += S(seed, 14, i, j) * jit * cv * 0.45; }
        if (i === 0 || i === nu) { var ci = i === 0 ? 0 : 1; a += Kc(ci, 0)[0] * (1 - tv) + Kc(ci, 1)[0] * tv + (i === 0 ? -bowS.u0 : bowS.u1) * Math.sin(Math.PI * tv); }
        if (j === 0 || j === nv) { var cj = j === 0 ? 0 : 1; b += Kc(0, cj)[1] * (1 - tu) + Kc(1, cj)[1] * tu + (j === 0 ? -bowS.v0 : bowS.v1) * Math.sin(Math.PI * tu); }
        var p = W(F, a, b);
        N[i].push({ id: id + '.node.' + i + '.' + j, i: i, j: j, x: r2(p[0]), z: r2(p[1]) });
      }
    }
    var P = function (nd) { return [nd.x, nd.z]; };
    /* the inner street round the square, counter-clockwise in (u, v) */
    var ring = [];
    for (i = 0; i < nu; i++) ring.push(P(N[i][0]));
    for (j = 0; j < nv; j++) ring.push(P(N[nu][j]));
    for (i = nu; i > 0; i--) ring.push(P(N[i][nv]));
    for (j = nv; j > 0; j--) ring.push(P(N[0][j]));
    var wall0 = offset(ring, gap).map(function (p) { return [r2(p[0]), r2(p[1])]; }), cornerAt = [0, nu, nu + nv, 2 * nu + nv];
    var corners = cornerAt.map(function (k, n) { return { id: id + '.corner.' + n, x: wall0[k][0], z: wall0[k][1], at: k }; });
    var zone = offset(ring, gap - zin).map(function (p) { return [r2(p[0]), r2(p[1])]; });
    /* the inner runs (an edge between two neighbouring crossings off the inner street), dropped by their hash, never on an
       avenue's line, never leaving a crossing with fewer than two runs, never cutting the grid in two */
    var E = [];
    for (j = 1; j < nv; j++) for (i = 0; i < nu; i++) E.push({ line: 'u', index: j, a: [i, j], b: [i + 1, j], k: 'u.' + i + '.' + j });
    for (i = 1; i < nu; i++) for (j = 0; j < nv; j++) E.push({ line: 'v', index: i, a: [i, j], b: [i, j + 1], k: 'v.' + i + '.' + j });
    var key = function (q) { return q[0] + ',' + q[1]; }, deg = {};
    var ringEdges = [];
    for (i = 0; i < nu; i++) { ringEdges.push([[i, 0], [i + 1, 0]]); ringEdges.push([[i, nv], [i + 1, nv]]); }
    for (j = 0; j < nv; j++) { ringEdges.push([[0, j], [0, j + 1]]); ringEdges.push([[nu, j], [nu, j + 1]]); }
    var live = function () { return E.filter(function (e) { return !e.dropped; }).map(function (e) { return [e.a, e.b]; }).concat(ringEdges); };
    var count = function () { deg = {}; live().forEach(function (e) { deg[key(e[0])] = (deg[key(e[0])] || 0) + 1; deg[key(e[1])] = (deg[key(e[1])] || 0) + 1; }); };
    var connected = function () {
      var adj = {}; live().forEach(function (e) { (adj[key(e[0])] = adj[key(e[0])] || []).push(key(e[1])); (adj[key(e[1])] = adj[key(e[1])] || []).push(key(e[0])); });
      var seen = {}, st = ['0,0']; seen['0,0'] = 1; while (st.length) { var k = st.pop(); (adj[k] || []).forEach(function (m) { if (!seen[m]) { seen[m] = 1; st.push(m); } }); }
      return Object.keys(adj).every(function (k) { return seen[k]; });
    };
    E.forEach(function (e, n) {
      if ((e.line === 'u' && e.index === ja) || (e.line === 'v' && e.index === ia)) return;
      if (U(seed, 41, n) >= pDrop) return;
      count(); if ((deg[key(e.a)] || 0) <= 2 || (deg[key(e.b)] || 0) <= 2) return;
      e.dropped = true; if (!connected()) e.dropped = false;
    });
    /* a run's points: straight, or bent at its middle by its hash */
    var runPts = function (e, n) {
      var A = P(N[e.a[0]][e.a[1]]), B = P(N[e.b[0]][e.b[1]]);
      if (U(seed, 51, n) >= pBend) return [A, B];
      var dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz) || 1, k = S(seed, 52, n) * 0.06 * L;
      return [A, [r2((A[0] + B[0]) / 2 - dz / L * k), r2((A[1] + B[1]) / 2 + dx / L * k)], B];
    };
    /* the ways: each grid line's kept runs joined into streets; the avenues carried on through the wall; the inner street's
       four sides */
    var ways = [], wn = 0, add = function (kind, role, line, index, pts) { ways.push({ id: id + '.way.' + (wn++), kind: kind, role: role, line: line, index: index, pts: pts }); };
    var lines = {};
    E.forEach(function (e, n) { (lines[e.line + '.' + e.index] = lines[e.line + '.' + e.index] || []).push({ e: e, n: n }); });
    Object.keys(lines).sort().forEach(function (lk) {
      var L = lines[lk], cur = null, flush = function () { if (cur && cur.length > 1) add(L[0].e.line === 'u' && L[0].e.index === ja || L[0].e.line === 'v' && L[0].e.index === ia ? 'avenue' : 'main', L[0].e.line === 'u' && L[0].e.index === ja || L[0].e.line === 'v' && L[0].e.index === ia ? 'avenue' : 'grid', L[0].e.line, L[0].e.index, cur); cur = null; };
      L.forEach(function (it) { if (it.e.dropped) { flush(); return; } var q = runPts(it.e, it.n); if (!cur) cur = q.slice(); else cur = cur.concat(q.slice(1)); });
      flush();
    });
    /* the avenues run on through the wall: past each end of the line, along its last run, by wallGap + out */
    var gates = [];
    ways.forEach(function (w) {
      if (w.role !== 'avenue') return;
      var p = w.pts, ext = function (A, B) { var dx = A[0] - B[0], dz = A[1] - B[1], L = Math.hypot(dx, dz) || 1; return { d: [dx / L, dz / L], at: function (s) { return [r2(A[0] + dx / L * s), r2(A[1] + dz / L * s)]; } }; };
      var e0 = ext(p[0], p[1]), e1 = ext(p[p.length - 1], p[p.length - 2]);
      w.pts = [e0.at(gap + out)].concat(p, [e1.at(gap + out)]);
      var sides = w.line === 'u' ? ['u-', 'u+'] : ['v-', 'v+'];
      [[e0, p[0], 0], [e1, p[p.length - 1], 1]].forEach(function (q) { var g = q[0].at(gap); gates.push({ id: id + '.gate.' + sides[q[2]], way: w.id, side: sides[q[2]], x: g[0], z: g[1] }); });
    });
    /* the inner street's sides: the avenues' crossings split none of them */
    var side = function (pts, sd) { add('main', 'ring', sd, -1, pts); };
    side(N.map(function (c) { return P(c[0]); }), 'v-');
    side(N.map(function (c) { return P(c[nv]); }), 'v+');
    side(N[0].map(P), 'u-');
    side(N[nu].map(P), 'u+');
    /* the cells, and the cells a missing run joined */
    var cellsOut = [];
    for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
      var poly = [P(N[i][j]), P(N[i + 1][j]), P(N[i + 1][j + 1]), P(N[i][j + 1])];
      cellsOut.push({ id: id + '.cell.' + i + '.' + j, i: i, j: j, poly: poly, c: [r2((poly[0][0] + poly[1][0] + poly[2][0] + poly[3][0]) / 4), r2((poly[0][1] + poly[1][1] + poly[2][1] + poly[3][1]) / 4)], merged: [] });
    }
    var cellAt = function (ci, cj) { return cellsOut.filter(function (c) { return c.i === ci && c.j === cj; })[0]; };
    E.forEach(function (e) {
      if (!e.dropped) return;
      var A = e.line === 'u' ? cellAt(e.a[0], e.index - 1) : cellAt(e.index - 1, e.a[1]), B = e.line === 'u' ? cellAt(e.a[0], e.index) : cellAt(e.index, e.a[1]);
      if (A && B) { A.merged.push(B.id); B.merged.push(A.id); }
    });
    return { id: id, frame: F, nodes: N, ring: ring, wall: wall0.concat([wall0[0]]), corners: corners, zone: zone, ways: ways, gates: gates, cells: cellsOut,
      edges: { kept: E.filter(function (e) { return !e.dropped; }).length, dropped: E.filter(function (e) { return e.dropped; }).length },
      spec: { half: [hu, hv], cells: [nu, nv], wallGap: gap, out: out, avenues: { u: ja, v: ia } } };
  }
  /* the wall's records on the square: core/city's own (KCITY.site.wall, 25-city-site.js) laid side by side, corner to corner,
     because laid round the whole line at once its towerGap steps across the corners and cuts them off. Each side keeps its
     corners as nodes (kind 'corner': the bastions), its named gates (o.named, each given to the side it lies nearest) and its
     towers; the four are joined into one {line, nodes, gates} in order round the square, the first corner closing it again.
     ways: the ways that cross the wall (core/city's, with their frames: the avenues); o: KCITY.site.wall's */
  function wall(G, ways, o) {
    var L = G.wall, at = G.corners.map(function (c) { return c.at; }).concat([L.length - 1]), named = o.named || [];
    var segD = function (p, a, b) { var dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2)); return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t); };
    var sideOf = function (g) { var best = 0, bd = Infinity; for (var k = 0; k < 4; k++) for (var i = at[k]; i < at[k + 1]; i++) { var d = segD([g.x, g.z], L[i], L[i + 1]); if (d < bd) { bd = d; best = k; } } return best; };
    var line = [], nodes = [], gates = [], s0 = 0;
    for (var k = 0; k < 4; k++) {
      var chain = L.slice(at[k], at[k + 1] + 1);
      var W = KCITY.site.wall(chain, ways, Object.assign({}, o, { named: named.filter(function (g) { return sideOf(g) === k; }) }));
      var len = 0; for (var i = 1; i < W.line.length; i++) len += Math.hypot(W.line[i][0] - W.line[i - 1][0], W.line[i][1] - W.line[i - 1][1]);
      W.nodes.forEach(function (n) {
        var end = Math.hypot(n.x - chain[0][0], n.z - chain[0][1]) < 0.5 ? 0 : Math.hypot(n.x - chain[chain.length - 1][0], n.z - chain[chain.length - 1][1]) < 0.5 ? 1 : -1;
        if (end === 0 && k > 0) return;   /* the corner the last side ended on */
        if (end >= 0 && n.kind === 'tower') { n.kind = 'corner'; n.corner = G.corners[(k + end) % 4].id; if (k === 3 && end === 1) n.closing = true; }
        n.s += s0; nodes.push(n);
      });
      W.gates.forEach(function (g) { gates.push(g); });   /* the same objects as their nodes: moved along with them */
      line = line.concat(k ? W.line.slice(1) : W.line); s0 += len;
    }
    return { line: line, nodes: nodes, gates: gates };
  }
  return {
    plan: plan, offset: offset, wall: wall,
    inside: function (G, x, z) { return inPoly(G.wall.slice(0, -1), x, z); },
    side: function (G, w) { var g = G.gates.filter(function (q) { return q.way === (w.id || w); }); return g.length ? g : null; }
  };
})();
