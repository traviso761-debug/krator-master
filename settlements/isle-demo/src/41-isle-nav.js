/* ============================== 7b. THE PEDESTRIAN NAV FROM THE PLAN'S WAYS (P7b) ============================== */
/* [G data] ISLE.navOf(R, G, pre) makes a town's walking graph (core/simulation's NAV contract: {nodes:[{id,x,y,z,tag}],
   edges:[{id,a,b,kind,len,w}]}) from its core/city plan alone: R.plan.ways, the avenues, main and side streets and
   alleys as polylines. It reads only {cls, w, pts} of each way, so it fits any core/city plan (a candidate for core/city's
   data side, asked of the city-layout work: KNOWN_ISSUES.md).
     1. each way's points, thinned to one node every `step` metres (its ends kept)
     2. a way's end joins the nearest other way within reach (the street it starts from or runs into), splitting it there
     3. two ways that cross (the avenues) are split at the crossing and share a node
     4. a piece the joins missed is joined to the largest by its nearest node within `bridge` metres
   Then G.door(x, z) splits the nearest way at the point nearest (x, z) and returns that node: a place's door is on its
   street (a place far from every way, a track to it). The graph is in WORLD metres (the town's frame added, the height over the world's datum), so two towns'
   graphs stand apart in one layer and a sea line can join them (P7c). The index is core/space's (KSPACE). */
ISLE.NAV = { step: 12, reach: 6, bridge: 160 };
ISLE.navOf = function (R, G, pre) {
  var F = G.frame, T = ISLE.NAV, N = [], E = [], S = KSPACE.create({ cell: 30 });
  var node = function (x, z, tag) { N.push({ id: pre + N.length, x: x, z: z, tag: tag || '' }); return N.length - 1; };
  var edge = function (a, b, kind, w) { if (a === b) return -1; var A = N[a], B = N[b], i = E.length; E.push({ a: a, b: b, kind: kind, w: w, dead: false });
    S.insert(i, (A.x + B.x) / 2, (A.z + B.z) / 2, Math.hypot(B.x - A.x, B.z - A.z) / 2 + 0.01); return i; };
  /* the nearest live edge to (x, z) within d (skip(e) leaves one out): {e, t, x, z, d} */
  var nearest = function (x, z, d, skip) {
    var best = null;
    S.query(x, z, d).forEach(function (i) {
      var e = E[i]; if (e.dead || (skip && skip(e))) return;
      var A = N[e.a], B = N[e.b], ex = B.x - A.x, ez = B.z - A.z, l2 = ex * ex + ez * ez, t = l2 > 0 ? Math.max(0, Math.min(1, ((x - A.x) * ex + (z - A.z) * ez) / l2)) : 0;
      var px = A.x + ex * t, pz = A.z + ez * t, dd = Math.hypot(x - px, z - pz);
      if (dd <= d && (!best || dd < best.d - 1e-9)) best = { e: i, t: t, x: px, z: pz, d: dd };
    });
    return best;
  };
  /* split an edge at a hit: the node there (an end node when the hit is within 0.5 m of it) */
  var split = function (h, tag) {
    var e = E[h.e], A = N[e.a], B = N[e.b];
    if (Math.hypot(h.x - A.x, h.z - A.z) < 0.5) return e.a;
    if (Math.hypot(h.x - B.x, h.z - B.z) < 0.5) return e.b;
    var n = node(h.x, h.z, tag); e.dead = true; edge(e.a, n, e.kind, e.w); edge(n, e.b, e.kind, e.w); return n;
  };
  /* 1. the ways */
  var lines = [];
  R.plan.ways.forEach(function (w, wi) {
    if (!w.pts || w.pts.length < 2) return;
    var P = w.pts, keep = [0], run = 0;
    for (var i = 1; i < P.length; i++) { run += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (run >= T.step || i === P.length - 1) { keep.push(i); run = 0; } }
    var ids = keep.map(function (k) { return node(P[k][0], P[k][1], w.cls); }), es = [];
    for (var j = 1; j < ids.length; j++) { var k = edge(ids[j - 1], ids[j], w.cls, w.w); if (k >= 0) { E[k].line = wi; es.push(k); } }
    lines.push({ w: w, wi: wi, ids: ids, es: es });
  });
  /* 2. the ends: each joins the nearest other way within reach of the two half widths */
  var joins = 0;
  lines.forEach(function (L) {
    [L.ids[0], L.ids[L.ids.length - 1]].forEach(function (end) {
      var Q = N[end], h = nearest(Q.x, Q.z, L.w.w / 2 + 8 + T.reach, function (e) { return e.line === L.wi || e.kind === 'join'; });
      if (!h) return; var j = split(h, 'junction'); if (j !== end) { edge(end, j, 'join', Math.min(L.w.w, E[h.e].w)); joins++; }
    });
  });
  /* 3. the crossings: segments of two different ways that cross */
  var cross = 0, inter = function (A, B, C, D) {
    var r1 = B.x - A.x, r2 = B.z - A.z, s1 = D.x - C.x, s2 = D.z - C.z, den = r1 * s2 - r2 * s1; if (Math.abs(den) < 1e-9) return null;
    var t = ((C.x - A.x) * s2 - (C.z - A.z) * s1) / den, u = ((C.x - A.x) * r2 - (C.z - A.z) * r1) / den;
    return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98 ? { x: A.x + r1 * t, z: A.z + r2 * t } : null;
  };
  for (var i = 0; i < E.length; i++) {
    var e = E[i]; if (e.dead || e.kind === 'join' || e.line == null) continue;
    var A = N[e.a], B = N[e.b], hit = null;
    S.query((A.x + B.x) / 2, (A.z + B.z) / 2, Math.hypot(B.x - A.x, B.z - A.z) / 2).some(function (k) {
      var f = E[k]; if (k === i || f.dead || f.line == null || f.line === e.line) return false;
      var X = inter(A, B, N[f.a], N[f.b]); if (X) { hit = { k: k, X: X }; return true; } return false;
    });
    if (!hit) continue;
    var f = E[hit.k], C = N[f.a], D = N[f.b], n = node(hit.X.x, hit.X.z, 'crossing');
    e.dead = true; f.dead = true; cross++;
    [[e.a, n, e], [n, e.b, e], [f.a, n, f], [n, f.b, f]].forEach(function (q) { var k2 = edge(q[0], q[1], q[2].kind, q[2].w); if (k2 >= 0) E[k2].line = q[2].line; });
  }
  /* 4. one network: the pieces joined to the largest */
  var bodies = function () {
    var adj = N.map(function () { return []; }); E.forEach(function (e) { if (!e.dead) { adj[e.a].push(e.b); adj[e.b].push(e.a); } });
    var comp = new Int32Array(N.length).fill(-1), size = [];
    for (var s = 0; s < N.length; s++) { if (comp[s] >= 0) continue; var st = [s], n0 = 0, c = size.length; comp[s] = c;
      while (st.length) { var u = st.pop(); n0++; adj[u].forEach(function (v) { if (comp[v] < 0) { comp[v] = c; st.push(v); } }); } size.push(n0); }
    var main = 0; for (var c2 = 1; c2 < size.length; c2++) if (size[c2] > size[main]) main = c2;
    return { comp: comp, size: size, main: main };
  };
  var B0 = bodies(), bridged = 0, idx = KSPACE.create({ cell: 40 });
  N.forEach(function (q, k) { if (B0.comp[k] === B0.main) idx.insert(k, q.x, q.z, 0); });
  var members = {}; N.forEach(function (q, k) { if (B0.comp[k] !== B0.main) (members[B0.comp[k]] || (members[B0.comp[k]] = [])).push(k); });
  Object.keys(members).forEach(function (c) {
    var best = null;
    members[c].forEach(function (k) { var q = N[k]; idx.query(q.x, q.z, T.bridge).forEach(function (j) { var d = Math.hypot(q.x - N[j].x, q.z - N[j].z); if (d <= T.bridge && (!best || d < best.d)) best = { d: d, k: k, j: j }; }); });
    if (best) { edge(best.k, best.j, 'join', 3); bridged++; }
  });
  var out = { pre: pre, town: R.town, frame: F, N: N, E: E, stats: { ways: lines.length, joins: joins, crossings: cross, bridged: bridged, bodies: B0.size.length } };
  /* a door on the street nearest (x, z), town metres, within `far`: the index of its node (a split of the way), or -1.
     o.track: a place farther than that from every way (a farm parcel, a holding beyond the wall) gets a track, a node at
     (x, z) joined to the split; o.prefer: a way class tried first (the highways out of the gates, for the farm ring) */
  out.door = function (x, z, far, o) {
    o = o || {}; far = far == null ? 800 : far;
    var h = (o.prefer && nearest(x, z, far, function (e) { return e.kind !== o.prefer; })) || nearest(x, z, far); if (!h) return -1;
    var j = split(h, 'door'); if (o.track == null || h.d <= o.track) return j;
    var n = node(x, z, 'track'); edge(j, n, 'track', 3); out.stats.tracks = (out.stats.tracks || 0) + 1; return n;
  };
  /* a node as a world point {x, y, z, node} (its id) */
  out.at = function (k) { var q = N[k]; return { x: +(q.x + F.x).toFixed(2), y: +(G.h(q.x, q.z) + F.sea).toFixed(2), z: +(q.z + F.z).toFixed(2), node: q.id }; };
  /* the layer's records, in world metres (the frame added; the height over the world's datum) */
  out.world = function () {
    var nodes = N.map(function (q) { return { id: q.id, x: +(q.x + F.x).toFixed(2), y: +(G.h(q.x, q.z) + F.sea).toFixed(2), z: +(q.z + F.z).toFixed(2), tag: q.tag }; });
    var edges = [];
    E.forEach(function (e) { if (e.dead) return; var a = nodes[e.a], b = nodes[e.b];
      edges.push({ id: pre + 'e' + edges.length, a: a.id, b: b.id, kind: e.kind, len: +Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z).toFixed(2), w: e.w }); });
    return { nodes: nodes, edges: edges };
  };
  out.bodies = function () { var b = bodies(); return { count: b.size.length, main: b.size[b.main], nodes: N.length }; };
  return out;
};
