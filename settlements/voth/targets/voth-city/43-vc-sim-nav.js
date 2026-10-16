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

VC.r2 = function (v) { return Math.round(v * 100) / 100; };
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
    /* the steps to the head's landing, then across it (20-site-cantons.js CANT.flightSegs: a flight ends on a landing) */
    var foot = node(f.a[0], f.a[1], f.y0, 'stairs'), head = node(f.b[0], f.b[1], f.y1, 'stairs'), hl = f.landLen && f.len ? f.landLen / f.len : 0;
    if (hl > 0) { var hs = node(f.b[0] - (f.b[0] - f.a[0]) * hl, f.b[1] - (f.b[1] - f.a[1]) * hl, f.y1, 'stairs'); edge(foot, hs, 'stairs', f.w); edge(hs, head, 'landing', f.w); }
    else edge(foot, head, 'stairs', f.w);
    cant.flights++;
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
  var doorNode = {};
  (CANT.doors || []).forEach(function (d) { var n = doorNode[d.id] = node(d.x, d.z, d.y, 'door'), j = cantonAt(d.canton, d.x, d.z, d.y, 2.5); if (j >= 0) { edge(n, j, 'landing', d.w); levelNodes[d.canton].push(n); cant.doors++; } else cant.unjoined.push(d.id); });
  /* ---- the canton interiors (owner, 2026-10-15: "citizens travel thru what are supposed to be the solid canton walls"):
     their own graph, joined to the city at the canton doors and the suites' terrace exits, so a walk to a canton room goes
     in by the tunnel, along the halls and up the core's flights, not straight through the tier from the nearest terrace.
     Each floor rect (40-vc-interiors.js P.floors) a chain of nodes along its length (a grid in a wide one, every
     `TUNE.sim.nav.inside` m); two open floors (halls, tunnels, passages, the core, landings, galleries) joined where they
     meet on one level; a room's floor only by its door, a suite's great room only by the suite's doors; each flight's foot
     and head joined to the floor they stand on (the top flight to the deck); the tunnels' mouths to the canton doors. The
     links are found first: a floor no chain of them reaches from outside (a gallery strip cut off by a void) gets no nodes */
  var IN = { cantons: 0, nodes: 0, joins: 0, flights: 0, doors: 0, exits: 0, loose: 0, unreached: 0 }, n0in = nodes.length, stepIn = T.inside || 6;
  Object.keys((VC.INT && VC.INT.cantons) || {}).forEach(function (cn) {
    var P = VC.INT.cantons[cn]; if (!P || !P.floors || P.catacombs) return; IN.cantons++;
    var Fs = P.floors.filter(function (f) { return f.x1 - f.x0 > 0.3 && f.z1 - f.z0 > 0.3; }), suiteRect = {};
    (P.halls || []).forEach(function (o) { if (o.kind === 'suite') suiteRect[[o.x0, o.x1, o.z0, o.z1, o.storey].join(',')] = 1; });
    var walled = function (f) { return f.kind === 'room' || suiteRect[[f.x0, f.x1, f.z0, f.z1, f.storey].join(',')]; };
    var floorsAt = function (x, z, y, tol, pad) { var out = []; Fs.forEach(function (f, fi) { if (Math.abs(f.y - y) <= tol && x >= f.x0 - pad && x <= f.x1 + pad && z >= f.z0 - pad && z <= f.z1 + pad) out.push(fi); }); return out; };
    /* 1. the links: [floors joined at a point] and the ways out */
    var links = [], OUT = Fs.length, par = []; for (var u = 0; u <= OUT; u++) par[u] = u;
    var root = function (i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; }, unite = function (a, b) { par[root(a)] = root(b); };
    for (var a = 0; a < Fs.length; a++) for (var b = a + 1; b < Fs.length; b++) {
      var A = Fs[a], B = Fs[b]; if (walled(A) || walled(B) || Math.abs(A.y - B.y) > 0.4) continue;
      var ox0 = Math.max(A.x0, B.x0), ox1 = Math.min(A.x1, B.x1), oz0 = Math.max(A.z0, B.z0), oz1 = Math.min(A.z1, B.z1);
      if (ox1 < ox0 - 0.3 || oz1 < oz0 - 0.3 || (ox1 - ox0 < 1.0 && oz1 - oz0 < 1.0)) continue;
      links.push({ fs: [a, b], x: (ox0 + ox1) / 2, z: (oz0 + oz1) / 2, y: (A.y + B.y) / 2, w: Math.max(ox1 - ox0, oz1 - oz0) }); unite(a, b);
    }
    /* the doors of the rooms and of the suites' great rooms */
    P.rooms.filter(function (r) { return r.door; }).map(function (r) { return { x: r.door.x, z: r.door.z, w: r.door.w, y: r.y }; })
      .concat((P.suiteDoors || []).concat(P.bpDoors || []).map(function (d) { var S = P.storeys[d.storey]; return { x: d.x, z: d.z, w: d.w, y: S ? S.y : 0 }; }))
      .forEach(function (D) { var fs = floorsAt(D.x, D.z, D.y, 0.4, 0.6); if (!fs.length) { IN.loose++; return; } D.fs = fs; links.push(D); fs.forEach(function (fi) { unite(fs[0], fi); }); });
    /* the flights: a foot and a head, each on its floors or (the top flight's head) the deck */
    var flights = (P.flights || []).map(function (f) {
      var ends = [[f.a, f.y0], [f.b, f.y1]].map(function (E) {
        var fs = floorsAt(E[0][0], E[0][1], E[1], 0.5, 1.2); if (fs.length) return { fs: fs };
        var j = cantonAt(cn, E[0][0], E[0][1], E[1], 2.5); if (j >= 0) return { node: j };
        IN.loose++; return null;
      });
      var on = []; ends.forEach(function (E) { if (E && E.fs) E.fs.forEach(function (fi) { on.push(fi); }); else if (E) on.push(OUT); });
      on.forEach(function (fi) { unite(on[0], fi); });
      return { f: f, ends: ends };
    });
    /* the canton doors (CANT.doors, joined to the terraces above) and the suites' terrace exits */
    var outs = (P.doorsOut || []).map(function (d) { return { x: d.x, z: d.z, y: d.y, w: d.w, n: doorNode[d.id] }; })
      .concat(((P.suite && P.suite.exits) || []).map(function (d) { return { x: d.x, z: d.z, y: d.y, w: d.w, n: cantonAt(cn, d.x, d.z, d.y, 2.5), exit: true }; }))
      .filter(function (D) {
        if (D.n == null || D.n < 0) { IN.loose++; return false; }
        D.fs = floorsAt(D.x, D.z, D.y, 0.6, 2.0); if (!D.fs.length) { IN.loose++; return false; }
        D.fs.forEach(function (fi) { unite(fi, OUT); }); return true;
      });
    /* 2. the nodes, on the floors reached from outside */
    var keep = Fs.map(function (f, fi) { return root(fi) === root(OUT); });
    var fn = Fs.map(function (f, fi) {
      if (!keep[fi]) { IN.unreached++; return []; }
      var w = f.x1 - f.x0, d = f.z1 - f.z0, nx = Math.max(1, Math.round(w / stepIn)), nz = Math.max(1, Math.round(d / stepIn)), ids = [];
      for (var i = 0; i < nx; i++) for (var j = 0; j < nz; j++) {
        var k = node(f.x0 + w * (i + 0.5) / nx, f.z0 + d * (j + 0.5) / nz, f.y, 'inside'); ids.push(k);
        if (j) edge(k - 1, k, 'indoor', Math.min(w / nx, d / nz)); if (i) edge(k - nz, k, 'indoor', Math.min(w / nx, d / nz));
      }
      return ids;
    });
    var nearIn = function (fi, x, z) { var best = -1, bd = Infinity; fn[fi].forEach(function (k) { var dd = Math.hypot(nodes[k].x - x, nodes[k].z - z); if (dd < bd) { bd = dd; best = k; } }); return best; };
    /* 3. the links between kept floors */
    links.forEach(function (L) { var fs = L.fs.filter(function (fi) { return keep[fi]; }); if (fs.length < 2) return; var p = node(L.x, L.z, L.y, 'inside'); fs.forEach(function (fi) { edge(p, nearIn(fi, L.x, L.z), 'indoor', L.w); }); IN.joins++; });
    flights.forEach(function (F) {
      if (F.ends.some(function (E) { return !E || (E.fs && !E.fs.some(function (fi) { return keep[fi]; })); })) return;
      var f = F.f, foot = node(f.a[0], f.a[1], f.y0, 'stairs'), head = node(f.b[0], f.b[1], f.y1, 'stairs'); edge(foot, head, 'flight', f.w); IN.flights++;   /* 'flight': an indoor stair (cost.flight), apart from the outside stairs' checks */
      [[foot, f.a, F.ends[0]], [head, f.b, F.ends[1]]].forEach(function (E) {
        if (E[2].fs) E[2].fs.forEach(function (fi) { if (keep[fi]) edge(E[0], nearIn(fi, E[1][0], E[1][1]), 'indoor', f.w); });
        else edge(E[0], E[2].node, 'landing', f.w);
      });
    });
    outs.forEach(function (D) { D.fs.forEach(function (fi) { edge(D.n, nearIn(fi, D.x, D.z), 'landing', D.w); }); if (D.exit) IN.exits++; else IN.doors++; });
  });
  IN.nodes = nodes.length - n0in; cant.inside = IN;
  /* ---- the buildings' outside stairs and ladders (the walk records each model's registry makes as it builds: VC.IX.walks,
     56b's probe; owner, 2026-10-12: "make sure stairs on house exteriors are also navigable"): at every standing lot,
     each a stair (or ladder) edge from its foot to its head; a foot at the lot's ground joins the street nearest it, two
     ends at one height on one lot (a landing between flights, a terrace or roof both reach) join each other, and the
     head is where it leads (a roof terrace, an upper door). The first-person walker gets each as a core/walk strip with
     a landing at its head */
  var ST = { lots: 0, stairs: 0, ladders: 0, ground: 0, chained: 0, loose: 0, indoor: 0, models: Object.keys((VC.IX && VC.IX.walks) || {}).length, heads: [], kwalk: 0 };
  var lotStairs = [];
  hashAll();
  PLAN.lots.forEach(function (L) {
    if (L.died != null || !VC.IX || !VC.IX.walks) return;
    var recs = VC.IX.walks[VC.ixKey(L)]; if (!recs) return;
    var pose = { x: L.x, y: L.y || 0, z: L.z, ry: L.ry || 0 }, ends = [];
    recs.forEach(function (r, ri) {
      var A = VC.ixWorld(pose, { x: r.a[0], y: r.a[2], z: r.a[1] }), B = VC.ixWorld(pose, { x: r.b[0], y: r.b[2], z: r.b[1] });
      var lad = r.kind === 'ladder', fa = node(A.x, A.z, A.y, lad ? 'ladder' : 'stair'), hb = node(B.x, B.z, B.y, lad ? 'ladder' : 'stair');
      edge(fa, hb, lad ? 'ladder' : 'stairs', r.w);
      if (lad) ST.ladders++; else ST.stairs++;
      ends.push({ n: fa, foot: true, y: A.y, r: ri }, { n: hb, foot: false, y: B.y, r: ri });
      ST.heads.push(hb);
      if (typeof KWALK !== 'undefined' && !lad) {
        KWALK.strip({ a: [A.x, A.z, A.y], b: [B.x, B.z, B.y], w: r.w, name: L.key, tag: 'stair' });
        var h = Math.max(r.w, 1.2) / 2 + 0.3; KWALK.floor({ rect: [B.x - h, B.x + h, B.z - h, B.z + h], y: B.y, name: L.key, tag: 'stair landing' }); ST.kwalk++;
      }
    });
    ends.forEach(function (e) {
      var nd = nodes[e.n], mates = ends.filter(function (f) { return f.r !== e.r && Math.abs(f.y - e.y) < T.stairLevelDy && Math.hypot(nodes[f.n].x - nd.x, nodes[f.n].z - nd.z) < T.stairLevel; });
      mates.forEach(function (f) { if (f.n > e.n) { edge(e.n, f.n, 'landing', 1.2); ST.chained++; } });
      if (e.foot && e.y - pose.y < T.stairGround) {
        var j = nearestNode(nd.x, nd.z, T.stairSnap, isStreet); if (j < 0) j = nearestNode(nd.x, nd.z, T.stairFar, isStreet);   /* a farmhouse far off its lane */
        if (j >= 0) { edge(e.n, j, 'junction', 1.5); ST.ground++; e.ground = true; }
      } else if (e.foot && !mates.length) e.loose = true;
    });
    /* a foot up on a gallery or a roof that no other stair of the lot reaches: reached from inside the house (its own
       stairs are the interiors' graph, not joined yet): an `indoor` edge to the lot's ground stair foot, else its street */
    ends.forEach(function (e) {
      if (!e.loose) return; ST.loose++;
      var nd = nodes[e.n], g = ends.filter(function (f) { return f.ground; }).sort(function (p, q) { return Math.hypot(nodes[p.n].x - nd.x, nodes[p.n].z - nd.z) - Math.hypot(nodes[q.n].x - nd.x, nodes[q.n].z - nd.z); })[0];
      var j = g ? g.n : nearestNode(L.x, L.z, T.stairFar, isStreet);
      if (j >= 0) { edge(e.n, j, 'indoor', 1.2); ST.indoor++; }
    });
    ST.lots++;
  });
  /* a small piece still cut off from the main body (two interior alleys that only meet each other) joins it at its
     nearest node within `reach` m */
  var par = new Int32Array(nodes.length); for (var pi = 0; pi < par.length; pi++) par[pi] = pi;
  var fnd = function (i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
  edges.forEach(function (e) { var a = fnd(e.a), b = fnd(e.b); if (a !== b) par[a] = b; });
  var sz = {}; for (var si = 0; si < par.length; si++) { var rt = fnd(si); sz[rt] = (sz[rt] || 0) + 1; }
  var big = +Object.keys(sz).sort(function (a, b) { return sz[b] - sz[a]; })[0], islands = 0;
  hashAll();
  var members = {}; for (var mi = 0; mi < nodes.length; mi++) { var mr = fnd(mi); if (mr !== big && sz[mr] <= 200) (members[mr] || (members[mr] = [])).push(mi); }
  Object.keys(members).forEach(function (rt) {
    rt = +rt; var best = null;
    members[rt].forEach(function (i) { var j = nearestNode(nodes[i].x, nodes[i].z, T.reach, function (nd, m) { return fnd(m) === big && Math.abs(nd.y - nodes[i].y) < 4; }); if (j >= 0) { var d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].z - nodes[j].z); if (!best || d < best[2]) best = [i, j, d]; } });
    if (best) { edge(best[0], best[1], 'junction', 3); islands++; }
  });
  var live = edges;
  VC.PED = { nodes: nodes, edges: live, streetNodes: streetNodes, crossings: crossings, joins: joins, reached: reached, islands: islands, plazas: hubs, stairs: ST, walkJoins: walkJoins, cant: cant, log: [] };
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
     the canton rooms (their interiors' graph joined above: a room still far from it is counted apart), the chinampa huts (on the
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
  /* the stairs: their heads on the main body (reachable from the street), and a fixed sample of them routed from the
     city's middle by A* */
  if (P.stairs) {
    var S = P.stairs, onMain = S.heads.filter(function (h) { return find(h) === main; }).length, k = Math.max(1, Math.floor(S.heads.length / 60)), ok = 0, tried = 0, c0 = polyCentroid(PLAN.zone);
    var from = P.nodes[SIM.nav.nearest('pedestrian', c0[0], c0[1])];
    for (var hi = 0; hi < S.heads.length; hi += k) { var H = P.nodes[S.heads[hi]]; tried++; if (SIM.nav.route('pedestrian', { x: from.x, z: from.z, y: from.y }, { x: H.x, z: H.z, y: H.y, node: H.id })) ok++; }
    P.audit.stairs = { lots: S.lots, models: S.models, stairs: S.stairs, ladders: S.ladders, groundJoins: S.ground, chained: S.chained, loose: S.loose, indoor: S.indoor, headsOnMain: onMain, heads: S.heads.length, routed: ok, tried: tried, walker: S.kwalk };
  }
  return P.audit;
};
