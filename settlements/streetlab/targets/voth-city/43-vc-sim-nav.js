/* ============================== 5k. THE PEDESTRIAN LAYER (phase C) ============================== */
/* [G data] The city as a graph a citizen walks (SIM-ROADMAP.md 2.4 item 1): core/simulation's NAV contract
   ({nodes:[{id,x,y,z,tag}], edges:[{id,a,b,kind,len,w}]}), registered as SIM's `pedestrian` layer.
   - THE STREETS: every way of the plan (avenues, highways, main and side streets, alleys, the country lanes), a node
     every TUNE.sim.nav.step m along it. A street that stops at another (a side street at its main street) joins it
     where it stops; two streets that cross share a node there. A node's height is the ground's, or a bridge deck's.
   - THE PARKS' WALKS (39-vc-furnish.js VC.parkWalks), their loose ends joined to the nearest street.
   - THE CANTONS (CANT, targets/voth-site/20-site-cantons.js): each terrace a ring of nodes round its band, each top
     deck a grid; the Ancestry ramp face by face; the flights (ferry piers, moles, terrace to terrace) as stairs, the
     bridges between cantons over their arch, the causeways from their canton end to the street at their land end,
     the canton doors.
   The layer is `yWeight`ed: a room on a terrace finds its node on that terrace, not on the street under it. A place is
   walked to from the node nearest its door (SIM.nav.route). VC.pedAudit names what the network leaves out: nodes cut
   off from the city's main body, places whose door is far from any node, by kind. Records only: nothing is drawn. */
VC.PED = { log: [] };

VC.walkY = function (x, z) { var b = VOTH.lifeBridgeY ? VOTH.lifeBridgeY(x, z) : null; return b != null ? b : Math.max(VOTH.SEA, baseH(x, z)); };

VC.pedNav = function () {
  var T = TUNE.sim.nav, nodes = [], edges = [], R2 = function (v) { return Math.round(v * 100) / 100; };
  var node = function (x, z, y, tag, way) { var i = nodes.length, o = { id: i, x: R2(x), y: R2(y == null ? VC.walkY(x, z) : y), z: R2(z), tag: tag }; if (way != null) o.way = way; nodes.push(o); return i; };
  var edge = function (a, b, kind, w) {
    if (a === b) return; var A = nodes[a], B = nodes[b];
    edges.push({ id: edges.length, a: a, b: b, kind: kind, len: R2(Math.hypot(A.x - B.x, A.z - B.z, A.y - B.y)), w: w });
  };
  /* ---- the streets: resampled, then split where another street stops on them or crosses them */
  var W = PLAN.ways.filter(function (w) { return w.died == null && w.pts && w.pts.length > 1; });
  var samp = W.map(function (w) {
    var P = w.pts, out = [[P[0][0], P[0][1]]], acc = 0;
    for (var i = 1; i < P.length; i++) { acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (acc >= T.step || i === P.length - 1) { out.push([P[i][0], P[i][1]]); acc = 0; } }
    return out;
  });
  var CELL = 40, segs = {}, key = function (i, j) { return i + ',' + j; };
  samp.forEach(function (S, wi) {
    for (var i = 1; i < S.length; i++) {
      var a = S[i - 1], b = S[i], i0 = Math.floor(Math.min(a[0], b[0]) / CELL), i1 = Math.floor(Math.max(a[0], b[0]) / CELL), j0 = Math.floor(Math.min(a[1], b[1]) / CELL), j1 = Math.floor(Math.max(a[1], b[1]) / CELL);
      for (var p = i0; p <= i1; p++) for (var q = j0; q <= j1; q++) (segs[key(p, q)] || (segs[key(p, q)] = [])).push([wi, i]);
    }
  });
  var splits = samp.map(function () { return []; });   /* per way: {i: segment, t, n: node} */
  var addSplit = function (wi, i, t, n) { splits[wi].push({ i: i, t: t, n: n }); };
  /* crossings: two segments of different ways (or of one way far apart along it) that cross share a node */
  var seen = {}, crossings = 0, joins = 0;
  Object.keys(segs).forEach(function (k) {
    var L = segs[k];
    for (var x = 0; x < L.length; x++) for (var y = x + 1; y < L.length; y++) {
      var A = L[x], B = L[y]; if (A[0] === B[0] && Math.abs(A[1] - B[1]) < 2) continue;
      var id = A[0] < B[0] || (A[0] === B[0] && A[1] < B[1]) ? A.join('.') + '|' + B.join('.') : B.join('.') + '|' + A.join('.'); if (seen[id]) continue; seen[id] = 1;
      var p = samp[A[0]][A[1] - 1], p2 = samp[A[0]][A[1]], q = samp[B[0]][B[1] - 1], q2 = samp[B[0]][B[1]];
      var r = [p2[0] - p[0], p2[1] - p[1]], s = [q2[0] - q[0], q2[1] - q[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) continue;
      var t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den, u = ((q[0] - p[0]) * r[1] - (q[1] - p[1]) * r[0]) / den;
      if (t <= 0.001 || t >= 0.999 || u <= 0.001 || u >= 0.999) continue;
      var n = node(p[0] + r[0] * t, p[1] + r[1] * t, null, 'crossing'); addSplit(A[0], A[1], t, n); addSplit(B[0], B[1], u, n); crossings++;
    }
  });
  /* a street's end that stops at another street joins it there: the nearest point on another way's segments within
     that way's half-width + snap becomes a node on that way (a split, as a crossing is) */
  var pend = [], cutAt = {};
  samp.forEach(function (S, wi) {
    [0, S.length - 1].forEach(function (ei) {
      var e = S[ei], ci = Math.floor(e[0] / CELL), cj = Math.floor(e[1] / CELL), best = null;
      for (var p = ci - 1; p <= ci + 1; p++) for (var q = cj - 1; q <= cj + 1; q++) (segs[key(p, q)] || []).forEach(function (sg) {
        if (sg[0] === wi) return;
        var a = samp[sg[0]][sg[1] - 1], b = samp[sg[0]][sg[1]], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
        var t = Math.max(0, Math.min(1, ((e[0] - a[0]) * dx + (e[1] - a[1]) * dz) / L2)), d = Math.hypot(a[0] + dx * t - e[0], a[1] + dz * t - e[1]);
        if (d <= W[sg[0]].w / 2 + T.snap && (!best || d < best.d)) best = { sg: sg, t: t, d: d };
      });
      if (!best) return;
      var ck = best.sg.join('.') + '@' + Math.round(best.t * 40), n = cutAt[ck];
      if (n == null) { var a = samp[best.sg[0]][best.sg[1] - 1], b = samp[best.sg[0]][best.sg[1]]; n = cutAt[ck] = node(a[0] + (b[0] - a[0]) * best.t, a[1] + (b[1] - a[1]) * best.t, null, 'junction'); addSplit(best.sg[0], best.sg[1], best.t, n); }
      pend.push({ wi: wi, end: ei, n: n, w: W[best.sg[0]].w }); joins++;
    });
  });
  /* the street nodes, in order along each way, with the splits between its samples */
  var endNode = {};
  samp.forEach(function (S, wi) {
    var w = W[wi], sp = splits[wi].sort(function (a, b) { return a.i - b.i || a.t - b.t; }), k = 0, prev = -1;
    for (var i = 0; i < S.length; i++) {
      for (; k < sp.length && sp[k].i === i; k++) { edge(prev, sp[k].n, w.cls, w.w); prev = sp[k].n; }
      var n = node(S[i][0], S[i][1], null, w.cls, w.id); if (prev >= 0) edge(prev, n, w.cls, w.w); prev = n;
      if (i === 0 || i === S.length - 1) endNode[wi + '.' + i] = n;
    }
  });
  pend.forEach(function (j) { edge(endNode[j.wi + '.' + j.end], j.n, 'junction', j.w); });
  var streetNodes = nodes.length;
  /* a node finder over what is built so far (for joins): the nearest node passing a test */
  var NC = 24, nh = {}, hashAll = function () { nh = {}; nodes.forEach(function (nd, i) { var k = Math.floor(nd.x / NC) + ',' + Math.floor(nd.z / NC); (nh[k] || (nh[k] = [])).push(i); }); };
  var nearestNode = function (x, z, r, test) {
    var best = -1, bd = r, ci = Math.floor(x / NC), cj = Math.floor(z / NC), m = Math.ceil(r / NC);
    for (var p = ci - m; p <= ci + m; p++) for (var q = cj - m; q <= cj + m; q++) (nh[p + ',' + q] || []).forEach(function (i) { var nd = nodes[i]; if (test && !test(nd, i)) return; var d = Math.hypot(nd.x - x, nd.z - z); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  hashAll();
  var isStreet = function (nd, i) { return i < streetNodes; };
  var degOf = function () { var d = new Int32Array(nodes.length); edges.forEach(function (e) { d[e.a]++; d[e.b]++; }); return d; };
  /* an alley's or a lane's end still dead (an interior alley stops at its entrance lot's back, a waterfront lane short of
     the highway): joined to the nearest node of another street within `reach` m */
  var dg = degOf(), reached = 0;
  for (var di = 0; di < streetNodes; di++) {
    var nd0 = nodes[di]; if (dg[di] !== 1 || (nd0.tag !== 'alley' && nd0.tag !== 'lane')) continue;
    var jn = nearestNode(nd0.x, nd0.z, T.reach, function (nd, i) { return i < streetNodes && nd.way !== nd0.way && nd.way != null; });
    if (jn >= 0) { edge(di, jn, 'junction', 3); reached++; }
  }
  /* the squares: a hub at each plaza's middle joined to every street node round it (a village's lanes start at its green) */
  var hubs = 0;
  PLAN.greens.forEach(function (G) {
    if (G.kind !== 'plaza' || !G.poly) return;
    var c = polyCentroid(G.poly), r = 0; G.poly.forEach(function (p) { r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1])); });
    var near = []; for (var p = Math.floor((c[0] - r - T.snap) / NC); p <= Math.floor((c[0] + r + T.snap) / NC); p++) for (var q = Math.floor((c[1] - r - T.snap) / NC); q <= Math.floor((c[1] + r + T.snap) / NC); q++) (nh[p + ',' + q] || []).forEach(function (i) { if (i < streetNodes && Math.hypot(nodes[i].x - c[0], nodes[i].z - c[1]) <= r + T.snap) near.push(i); });
    if (near.length < 2) return;
    var h = node(c[0], c[1], null, 'plaza'); near.forEach(function (i) { edge(h, i, 'plaza', 8); }); hubs++;
  });
  /* ---- the parks' walks: their ends merged where they meet, loose ends joined to the nearest street */
  var wn = {}, walkNode = function (p) { var k = Math.round(p[0] * 2) + ',' + Math.round(p[1] * 2); if (wn[k] == null) wn[k] = node(p[0], p[1], null, 'walk'); return wn[k]; }, deg = {};
  (VC.parkWalks || []).forEach(function (s) { var a = walkNode(s.a), b = walkNode(s.b); edge(a, b, 'walk', s.w); deg[a] = (deg[a] || 0) + 1; deg[b] = (deg[b] || 0) + 1; });
  /* a walk's loose end joins the nearest street within walkSnap; a walk that passes within `walkTouch` m of a street joins it
     there too (a loop round a park has no loose end) */
  var walkJoins = 0;
  var walkIds = {}; Object.keys(wn).forEach(function (k) { walkIds[wn[k]] = 1; });
  Object.keys(wn).forEach(function (k) { var i = wn[k], j = nearestNode(nodes[i].x, nodes[i].z, deg[i] > 1 ? T.walkTouch : T.walkSnap, isStreet); if (j >= 0) { edge(i, j, 'junction', 3); walkJoins++; } });
  /* a loop that touches no street but runs beside another walk (a park's inner ring): joined to that walk where they pass */
  hashAll();
  Object.keys(wn).forEach(function (k) { var i = wn[k], j = nearestNode(nodes[i].x, nodes[i].z, T.walkTouch, function (nd, m) { return walkIds[m] && m !== i && !edges.some(function (e) { return (e.a === i && e.b === m) || (e.b === i && e.a === m); }); }); if (j >= 0) { edge(i, j, 'walk', 3); walkJoins++; } });
  /* ---- the cantons */
  var cant = { rings: 0, decks: 0, flights: 0, spans: 0, causeways: 0, doors: 0, unjoined: [] };
  var levelNodes = {};   /* canton -> [node] with their level's y */
  (CANT.list || []).forEach(function (M) {
    var L = levelNodes[M.n] = [];
    (M.levels || []).forEach(function (lv) {
      if (lv.ri > 0 && !lv.top) {
        var h = (lv.ro + lv.ri) / 2, side = 2 * h, per = Math.max(2, Math.round(side / T.ring)), ring = [];
        for (var sd = 0; sd < 4; sd++) for (var k = 0; k < per; k++) {
          var t = -h + side * k / per, c = sd === 0 ? [t, -h] : sd === 1 ? [h, t] : sd === 2 ? [-t, h] : [-h, -t];
          var n = node(M.x + c[0], M.z + c[1], lv.y, 'terrace'); ring.push(n); L.push(n);
        }
        for (var r = 0; r < ring.length; r++) edge(ring[r], ring[(r + 1) % ring.length], 'terrace', lv.ro - lv.ri);
        cant.rings++;
      } else {
        var e = lv.ro * 0.92, m = Math.max(1, Math.round(2 * e / T.deck)), grid = [];
        for (var a = 0; a <= m; a++) for (var b = 0; b <= m; b++) { var g = node(M.x - e + 2 * e * a / m, M.z - e + 2 * e * b / m, lv.y, 'deck'); grid.push(g); L.push(g); if (b) edge(g - 1, g, 'deck', T.deck); if (a) edge(g - (m + 1), g, 'deck', T.deck); }
        cant.decks++;
      }
    });
    /* the Ancestry spiral: its ramp face by face */
    if (M.faces && M.faces.length) {
      var prev = -1;
      M.faces.forEach(function (F) { var a = node(F.p0[0], F.p0[1], F.y0, 'ramp'), b = node(F.p1[0], F.p1[1], F.y1, 'ramp'); if (prev >= 0) edge(prev, a, 'ramp', M.walkW || 12); edge(a, b, 'ramp', M.walkW || 12); L.push(a, b); prev = b; });
    }
  });
  /* the nearest canton node at a height: on that canton, its y within `dy` */
  var cantonAt = function (cn, x, z, y, dy) {
    var pick = function (tol) { var best = -1, bd = Infinity; (levelNodes[cn] || []).forEach(function (i) { var nd = nodes[i]; if (Math.abs(nd.y - y) > tol) return; var d = Math.hypot(nd.x - x, nd.z - z); if (d < bd) { bd = d; best = i; } }); return best; };
    var b = pick(dy || 1.5); return b >= 0 ? b : pick(3 * (dy || 1.5));   /* the Ancestry ramp: a bridge lands between its nodes */
  };
  var flightFoot = {};
  (CANT.flights || []).forEach(function (f) {
    var foot = node(f.a[0], f.a[1], f.y0, 'stairs'), head = node(f.b[0], f.b[1], f.y1, 'stairs'); edge(foot, head, 'stairs', f.w); cant.flights++;
    var top = cantonAt(f.canton, f.b[0], f.b[1], f.y1); if (top >= 0) edge(head, top, 'landing', f.w); else cant.unjoined.push(f.id + ' head');
    if (f.kind === 'terrace') { var bot = cantonAt(f.canton, f.a[0], f.a[1], f.y0); if (bot >= 0) edge(foot, bot, 'landing', f.w); else cant.unjoined.push(f.id + ' foot'); }
    flightFoot[f.id] = foot; levelNodes[f.canton].push(foot, head);
  });
  (CANT.spans || []).forEach(function (S) {
    if (!S.ok) return;
    var n = Math.max(2, Math.round(S.L / T.step)), prev = -1, first = -1, last = -1;
    for (var k = 0; k <= n; k++) { var t = k / n, x = S.la[0] + (S.lb[0] - S.la[0]) * t, z = S.la[1] + (S.lb[1] - S.la[1]) * t, nd = node(x, z, CANT.deckY(S, t), 'bridge'); if (prev >= 0) edge(prev, nd, 'bridge', S.w); else first = nd; prev = last = nd; }
    var A = cantonAt(S.a, S.la[0], S.la[1], S.ya, 2.5), B = cantonAt(S.b, S.lb[0], S.lb[1], S.yb, 2.5);
    if (A >= 0) edge(first, A, 'landing', S.w); else cant.unjoined.push(S.id + ' at ' + S.a);
    if (B >= 0) edge(last, B, 'landing', S.w); else cant.unjoined.push(S.id + ' at ' + S.b);
    cant.spans++;
  });
  hashAll();
  (CANT.causewayList || []).forEach(function (c) {
    if (!c.pts || c.pts.length < 2) return;
    var E = c.ends || [], yA = E[0] ? (E[0].flight ? E[0].flight.y0 : E[0].y) : null, yB = E[1] ? (E[1].flight ? E[1].flight.y0 : E[1].y) : null, ids = [];
    var P = [], len = 0; c.pts.forEach(function (p, i) { if (i) len += Math.hypot(p[0] - c.pts[i - 1][0], p[1] - c.pts[i - 1][1]); P.push([p[0], p[1], len]); });
    /* resampled along its line, its deck from canton end to land end */
    var pts = []; P.forEach(function (p, i) { if (!i) { pts.push(p); return; } var q = P[i - 1], m = Math.max(1, Math.round((p[2] - q[2]) / T.step)); for (var k = 1; k <= m; k++) { var t = k / m; pts.push([q[0] + (p[0] - q[0]) * t, q[1] + (p[1] - q[1]) * t, q[2] + (p[2] - q[2]) * t]); } });
    pts.forEach(function (p) { var t = len ? p[2] / len : 0, ya = yA != null ? yA : VC.walkY(c.pts[0][0], c.pts[0][1]), yb = yB != null ? yB : VC.walkY(p[0], p[1]); ids.push(node(p[0], p[1], ya + (yb - ya) * t, 'causeway')); });
    for (var i = 1; i < ids.length; i++) edge(ids[i - 1], ids[i], 'causeway', c.width);
    [0, 1].forEach(function (s) {
      var end = E[s], at = s ? ids[ids.length - 1] : ids[0];
      if (end && end.canton) {
        var to = end.flight && flightFoot[end.flight.id] != null ? flightFoot[end.flight.id] : cantonAt(end.canton, end.x, end.z, end.y, 3);
        if (to >= 0) edge(at, to, 'landing', c.width); else cant.unjoined.push(c.id + ' at ' + end.canton);
      } else {
        var nd = nodes[at], j = nearestNode(nd.x, nd.z, T.landSnap, isStreet); if (j >= 0) edge(at, j, 'junction', c.width); else cant.unjoined.push(c.id + ' land end');
      }
    });
    cant.causeways++;
  });
  (CANT.doors || []).forEach(function (d) { var n = node(d.x, d.z, d.y, 'door'), j = cantonAt(d.canton, d.x, d.z, d.y, 2.5); if (j >= 0) { edge(n, j, 'landing', d.w); levelNodes[d.canton].push(n); cant.doors++; } else cant.unjoined.push(d.id); });
  /* a small piece still cut off from the main body (two interior alleys that only meet each other) joins it at its
     nearest node within `reach` m */
  var par = new Int32Array(nodes.length); for (var pi = 0; pi < par.length; pi++) par[pi] = pi;
  var fnd = function (i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  edges.forEach(function (e) { var a = fnd(e.a), b = fnd(e.b); if (a !== b) par[a] = b; });
  var sz = {}; for (var si = 0; si < par.length; si++) { var rt = fnd(si); sz[rt] = (sz[rt] || 0) + 1; }
  var big = +Object.keys(sz).sort(function (a, b) { return sz[b] - sz[a]; })[0], islands = 0;
  hashAll();
  Object.keys(sz).forEach(function (rt) {
    rt = +rt; if (rt === big || sz[rt] > 200) return;
    var best = null;
    for (var i = 0; i < nodes.length; i++) { if (fnd(i) !== rt) continue; var j = nearestNode(nodes[i].x, nodes[i].z, T.reach, function (nd, m) { return fnd(m) === big && Math.abs(nd.y - nodes[i].y) < 4; }); if (j >= 0) { var d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z); if (!best || d < best[2]) best = [i, j, d]; } }
    if (best) { edge(best[0], best[1], 'junction', 3); islands++; }
  });
  var live = edges;
  VC.PED = { nodes: nodes, edges: live, streetNodes: streetNodes, crossings: crossings, joins: joins, reached: reached, islands: islands, plazas: hubs, walkJoins: walkJoins, cant: cant, log: [] };
  SIM.nav.layer('pedestrian', { nodes: nodes, edges: live, yWeight: T.yWeight, cost: T.cost });
  return VC.PED;
};

/* what the network leaves out: its connected bodies (the city's main one and the islands cut off from it, by what their
   nodes are), and the places whose door is far from their node or whose node is not on the main body */
VC.pedAudit = function () {
  var P = VC.PED; if (!P.nodes) return null;
  var n = P.nodes.length, par = new Int32Array(n); for (var i = 0; i < n; i++) par[i] = i;
  var find = function (i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  P.edges.forEach(function (e) { var a = find(e.a), b = find(e.b); if (a !== b) par[a] = b; });
  var size = {}; for (var j = 0; j < n; j++) { var r = find(j); size[r] = (size[r] || 0) + 1; }
  var main = Object.keys(size).sort(function (a, b) { return size[b] - size[a]; })[0] | 0;
  var off = {}, bodies = Object.keys(size).length; for (var k = 0; k < n; k++) if (find(k) !== main) off[P.nodes[k].tag] = (off[P.nodes[k].tag] || 0) + 1;
  P.comp = function (i) { return find(i); }; P.main = main;
  /* a place's node (SIM.nav.nearest from its door, its height counted) and the step from its door to it (navOff). Far
     from the network: a door more than `far` m past an open place's reach from its node. Not the network's fault yet:
     the canton rooms (inside the tiers: the canton interiors' own graph is not joined), the chinampa huts (on the
     beds, reached by kayak: the water layer's) */
  var T = TUNE.sim.nav, far = {}, cut = {}, farList = [], placed = 0, inside = 0, beds = 0;
  SIM.all('place').forEach(function (Q) {
    if (Q.layer !== 'pedestrian') return; placed++;
    var d = Q.door || Q, k = SIM.nav.nearest('pedestrian', d.x, d.z, { y: d.y }); if (k < 0) return;
    var nd = P.nodes[k], dist = Math.hypot(nd.x - d.x, nd.z - d.z);
    Q.navNode = k; Q.navOff = Math.round(Math.hypot(dist, (nd.y || 0) - (d.y || 0)) * 10) / 10;
    if (find(k) !== main) { cut[Q.kind] = (cut[Q.kind] || 0) + 1; return; }
    if (dist - (Q.r || 0) <= T.far) return;
    if (/^canton-/.test(Q.kind)) { inside++; return; }
    if (Q.kind === 'chinampa hut') { beds++; return; }
    far[Q.kind] = (far[Q.kind] || 0) + 1; if (farList.length < 40) farList.push([Q.id, Q.kind, Math.round(dist - (Q.r || 0))]);
  });
  P.audit = { nodes: n, edges: P.edges.length, bodies: bodies, mainNodes: size[main], offMain: off, places: placed, cutOff: cut, far: far, farList: farList, cantonRooms: inside, chinampaHuts: beds };
  return P.audit;
};
