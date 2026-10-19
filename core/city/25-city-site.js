/* ============================== 4. THE SITE LAYER (STEPS 0-5): ROLES, THE ZONE, AVENUES, HIGHWAYS, THE WALL, GROUND DELTAS ============================== */
/* [G data] The general half of a world's steps 0-5, fed by its data (grown in Voth's site, 30-vc-site.js, and moved here):
     KCITY.site.roles(table)            a district's role from its type and name: the world's role table
     KCITY.site.roleAt(p, districts, o) the role of the smallest district holding p (o.skip: roles that are not ground
                                        a lot belongs to; o.fallback(p) where none holds it)
     KCITY.site.zoneRaster(R, zone, o)  the build zone onto the raster: dry ground (over o.dry) not steeper than o.maxSlope
     KCITY.site.minSpacing()            the spacing rule's distance (the shallowest 'middle' lot, half a main and a side street)
     KCITY.site.nearestWay(p, cls, skip)  the nearest point on a way (of the classes in cls)
     KCITY.site.avenues(list, o)        the drawn avenues, each loose end joined to an avenue (o.snap) or a landing (o.landings)
     KCITY.site.routeAvenues(specs, step, o)  avenues routed over the ground (a world with none drawn): A* kept to the
                                        floor (not steeper than o.maxSlope, priced above both ends), merged where two
                                        would run within o.merge, bridged where o.cross allows
     KCITY.site.ring(pts, step, tag)    a ring avenue round a district, kept where it is dry and not on an avenue already
     KCITY.site.blockCorridor(pts, hw)  a corridor (a causeway, a bridge's line) no lot or street takes
     KCITY.site.clearUnder(pts, w, step, pad, skip)  what stands under a way laid over it comes down
     KCITY.site.highwayGrid(o), KCITY.site.highway(G, spec, o), KCITY.site.layHighway(pts, step, tag, o)
                                        highways: A* over a coarse grid of the ground, slope dear, water and what stands
                                        impassable, an optional pull toward a line (a river, a shore) and a `via` ring
                                        beside a station; laid as a way with a verge no lot takes
     KCITY.site.wall(chain, ways, o)    the wall as records: its line (towers every o.towerGap, pushed clear of the
                                        avenues), gates where avenues and highways cross it (named gates at the crossing
                                        nearest their markers), towers at its vertices; KCITY.site.wallSegs(nodes) its
                                        standing runs, KCITY.site.stampWall(W, o) onto the raster. Drawing stays the world's
     KCITY.ground.bank(G, pts, E), KCITY.ground.levelPad(G, spec)
                                        the ground-delta interface: an avenue drawn into shallow water banked up, a gate's
                                        level pad cut and filled, as edits to the world's delta grid G = {N, cell, ext,
                                        h(x, z), at(i, j, k), add(k, dv)}
   Every function reads the bound instance (PLAN, SL.R, TUNE, CG): the world calls them from its own steps. */
KCITY.site = {};
KCITY.ground = KCITY.ground || {};

/* ---------------------------------------------------------------- districts and their roles */
/* table: {types: [district types that are their own role], names: [[RegExp, role], ...] (first match), other: role} */
KCITY.site.roles = function (table) {
  return function (d) {
    if (table.types && table.types.indexOf(d.type) >= 0) return d.type;
    var n = (d.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
    for (var i = 0; i < table.names.length; i++) if (table.names[i][0].test(n)) return table.names[i][1];
    return table.other == null ? 'misc' : table.other;
  };
};
KCITY.site.roleAt = function (p, districts, o) {
  var best = null, ba = Infinity, skip = o && o.skip || [];
  districts.forEach(function (d) {
    if (skip.indexOf(d.role) >= 0) return;
    if (inPoly(p, d.poly)) { var a = Math.abs(polyArea(d.poly)); if (a < ba) { ba = a; best = d.role; } }
  });
  return best || (o && o.fallback ? o.fallback(p) : null);
};
KCITY.site.districts = function (role) { return (PLAN.site || []).filter(function (d) { return d.role === role; }); };

/* ---------------------------------------------------------------- the zone */
/* o: dry (0.6: ground at or under it is water or shore), maxSlope (TUNE.maxSlope), probe (5: the slope's half-span),
   h (CG.base). Every other cell stays as it was (a world fills OUT first). Returns the cells made FREE */
KCITY.site.zoneRaster = function (R, zone, o) {
  o = o || {};
  var dry = o.dry == null ? 0.6 : o.dry, ms = o.maxSlope == null ? TUNE.maxSlope : o.maxSlope, ms2 = ms * ms, e = o.probe == null ? 5 : o.probe, h = o.h || CG.base, land = 0;
  R.eachInPoly(zone, function (k, i, jj) {
    var x = R.cx(i), z = R.cx(jj), y = h(x, z); if (y <= dry) return;
    var gx = (h(x + e, z) - h(x - e, z)) / (2 * e), gz = (h(x, z + e) - h(x, z - e)) / (2 * e);
    if (gx * gx + gz * gz > ms2) return;
    R.occ[k] = OCC.FREE; land++;
  });
  return land;
};
KCITY.site.minSpacing = function () {
  var mid = SL.items('middle').map(function (it) { return it.d + TUNE.lot.setback + TUNE.lot.rear; });
  return Math.min.apply(null, mid) + TUNE.width.main / 2 + TUNE.width.side / 2;
};

/* ---------------------------------------------------------------- ways: nearest, avenues, rings, corridors */
KCITY.site.nearestWay = function (p, cls, skipId) {
  var best = null, bd = Infinity;
  PLAN.ways.forEach(function (w) {
    if (cls && cls.indexOf(w.cls) < 0) return; if (w.id === skipId) return;
    var q = w.F.nearest(p); if (q.d < bd) { bd = q.d; best = { way: w, s: q.s, p: w.F.at(q.s), d: q.d }; }
  });
  return best;
};
/* the drawn avenues ([{name, pts}]), each a way; then each loose end joined to another avenue within o.snap, else to
   the nearest of o.landings (points: a causeway's landing) within o.landingSnap. Returns {own, made, joins} */
KCITY.site.avenues = function (list, step, o) {
  o = o || {};
  var W = TUNE.width.avenue, own = [], joins = 0;
  list.forEach(function (a) {
    var P = a.pts.filter(function (p, i) { return !i || V.dist(p, a.pts[i - 1]) > 1; });
    if (P.length < 2) return;
    own.push(SL.addWay('avenue', P, step, { tag: a.name }));
  });
  own.forEach(function (w) {
    [w.pts[0], w.pts[w.pts.length - 1]].forEach(function (e) {
      var q = KCITY.site.nearestWay(e, ['avenue'], w.id);
      if (q && q.d < W * 0.8) return;                                   /* already meets one */
      if (q && q.d < o.snap) { SL.addWay('avenue', [e, q.p], step, { tag: 'join ' + w.tag }); joins++; return; }
      var bl = null, bd = o.landingSnap;
      (o.landings || []).forEach(function (l) { var d = V.dist(e, l); if (d < bd) { bd = d; bl = l; } });
      if (bl && bd > W) { SL.addWay('avenue', [e, bl], step, { tag: (o.landingTag || 'to causeway ') + w.tag }); joins++; }
    });
  });
  return { own: own, made: own.length, joins: joins };
};
/* a ring (a closed polyline, e.g. offsetConvex round a park) kept only where it is dry (o.dry, 0.8) and not already on
   an avenue: whole when nothing covers it, else its open runs, each tied to the avenue at its ends. Returns runs made */
KCITY.site.ring = function (ring, step, tag, o) {
  o = o || {};
  var R = SL.R, P = resample(ring, 2, true), W = TUNE.width.avenue, dry = o.dry == null ? 0.8 : o.dry;
  var cov = P.map(function (p) { var k = R.idx(p[0], p[1]); return k < 0 || R.sd[k] < W * 0.8 || CG.base(p[0], p[1]) < dry; });
  if (cov.every(function (c) { return !c; })) { SL.addWay('avenue', P, step, { closed: true, tag: tag }); return 1; }
  if (cov.every(Boolean)) return 0;
  var n = P.length, s0 = cov.indexOf(true), made = 0;
  for (var k = 1; k <= n; k++) {
    var i = (s0 + k) % n;
    if (cov[i]) continue;
    var run = [];
    var prev = P[(i - 1 + n) % n]; if (CG.base(prev[0], prev[1]) >= dry) { var sn = KCITY.site.nearestWay(prev, ['avenue']); if (sn && sn.d < W * 1.5) run.push(sn.p); }
    while (!cov[i]) { run.push(P[i]); k++; i = (s0 + k) % n; }
    if (CG.base(P[i][0], P[i][1]) >= dry) { var sn2 = KCITY.site.nearestWay(P[i], ['avenue']); if (sn2 && sn2.d < W * 1.5) run.push(sn2.p); }
    if (run.length > 4) { SL.addWay('avenue', run, step, { tag: tag }); made++; }
  }
  return made;
};
/* avenues ROUTED over the ground, for a world with none drawn (Verge). specs [{from, to, name}], laid in order: each an
   A* route over a coarse grid of the ground (o.c, 5 m) from `from` to within o.reach (14 m) of `to`. The ground decides
   the line:
     impassable  off the build zone (OUT on the raster) unless o.cross(x, z) says it may be bridged (a river), HARD and
                 GREEN ground, ground steeper than o.maxSlope (TUNE.maxSlope);
     the price   per metre 1 + o.slopeK * grade^2, plus o.riseK for each metre the ground stands more than o.rise above
                 the lower of the route's two ends (an avenue keeps to the valley floor, it does not climb the mountain to
                 save a bend), plus o.crossK on bridged ground; on an avenue already laid, o.reuse of that (routes
                 converge on a trunk).
   Merging: a route's points within o.merge of an avenue already laid are dropped, so two avenues that would run close
   become one. Each run left is tied at its nearest point to the avenue it leaves or meets; one shorter than o.minRun is
   dropped. Bridged ground is its own straight way (tag 'bridge', noFrontage); a span longer than o.maxSpan ends the
   route there. Returns {made, merged (metres of route left to the avenues already there), failed, ways, bridges} */
KCITY.site.routeAvenues = function (specs, step, o) {
  o = o || {};
  var R = SL.R, f = Math.max(1, Math.round((o.c == null ? 5 : o.c) / R.c)), n = Math.floor(R.n / f), c = R.c * f, half = R.half, h = o.h || CG.base;
  var W = TUNE.width.avenue, maxSlope = o.maxSlope == null ? TUNE.maxSlope : o.maxSlope, slopeK = o.slopeK == null ? 60 : o.slopeK;
  var rise = o.rise == null ? 6 : o.rise, riseK = o.riseK == null ? 0.6 : o.riseK, crossK = o.crossK == null ? 30 : o.crossK, reuse = o.reuse == null ? 0.35 : o.reuse;
  var merge = o.merge == null ? 30 : o.merge, minRun = o.minRun == null ? 40 : o.minRun, maxSpan = o.maxSpan == null ? 90 : o.maxSpan, reach = o.reach == null ? 14 : o.reach;
  var cx = function (i) { return -half + (i + 0.5) * c; }, G = { n: n, c: c }, H = new Float32Array(n * n), K = new Uint8Array(n * n);   /* K: 0 open, 1 bridged, 2 impassable */
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
    var x = cx(i), z = cx(j), occ = R.at(x, z), q = j * n + i;
    H[q] = h(x, z);
    K[q] = occ === OCC.OUT ? (o.cross && o.cross(x, z) ? 1 : 2) : (occ === OCC.HARD || occ === OCC.GREEN) ? 2 : 0;
  }
  var grade = function (i, j) {
    var gx = (H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)]) / (2 * c), gz = (H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i]) / (2 * c);
    return Math.sqrt(gx * gx + gz * gz);
  };
  var onAvenue = function (x, z) { var k = R.idx(x, z); return k >= 0 && R.sd[k] <= W / 2 && R.sdw[k] >= 0 && PLAN.ways[R.sdw[k]] && PLAN.ways[R.sdw[k]].cls === 'avenue'; };
  var cellOf = function (p) { return Math.floor((p[1] + half) / c) * n + Math.floor((p[0] + half) / c); };
  var out = { made: 0, merged: 0, failed: [], ways: [], bridges: [] };
  specs.forEach(function (sp) {
    var from = cellOf(sp.from), hRef = Math.min(h(sp.from[0], sp.from[1]), h(sp.to[0], sp.to[1])), goals = new Set();
    var gi = Math.floor((sp.to[0] + half) / c), gj = Math.floor((sp.to[1] + half) / c), gr = Math.ceil(reach / c);
    for (var b = -gr; b <= gr; b++) for (var a = -gr; a <= gr; a++) {
      var ii = gi + a, jj = gj + b; if (ii < 0 || jj < 0 || ii >= n || jj >= n || K[jj * n + ii] !== 0) continue;
      if (Math.hypot(cx(ii) - sp.to[0], cx(jj) - sp.to[1]) <= reach) goals.add(jj * n + ii);
    }
    if (from < 0 || from >= n * n || !goals.size) { out.failed.push(sp.name); return; }
    var cost = function (k, i, j) {
      if (K[k] === 2 && k !== from) return Infinity;
      var g = grade(i, j); if (K[k] === 0 && g > maxSlope) return Infinity;
      var p = 1 + slopeK * g * g + riseK * Math.max(0, H[k] - hRef - rise) + (K[k] === 1 ? crossK : 0);
      return onAvenue(cx(i), cx(j)) ? p * reuse : p;
    };
    var path = ASTAR(G, from, goals, cost, null, 1.0);
    if (!path) { out.failed.push(sp.name); return; }
    var P = path.map(function (k) { return { p: [cx(k % n), cx((k / n) | 0)], bridge: K[k] === 1 }; });
    P[0].p = sp.from.slice();
    P.forEach(function (e) { var q = KCITY.site.nearestWay(e.p, ['avenue']); e.near = !!q && q.d < merge; });
    /* runs of points away from the avenues laid already, each tied to the avenue at its ends */
    var runs = [], cur = null;
    P.forEach(function (e, i) {
      if (e.near) { if (cur) { cur.endNear = true; runs.push(cur); cur = null; } out.merged += c; return; }
      if (!cur) cur = { pts: [], startNear: i > 0 };
      cur.pts.push(e);
    });
    if (cur) runs.push(cur);
    for (var r = 0; r < runs.length; r++) {
      var run = runs[r], E = run.pts, stop = false;
      if (run.startNear) { var s0 = KCITY.site.nearestWay(E[0].p, ['avenue']); if (s0 && s0.d < merge * 1.5) E.unshift({ p: s0.p, bridge: false }); }
      if (run.endNear) { var s1 = KCITY.site.nearestWay(E[E.length - 1].p, ['avenue']); if (s1 && s1.d < merge * 1.5) E.push({ p: s1.p, bridge: false }); }
      /* land pieces and the bridges between them */
      var pieces = [], land = [];
      for (var t = 0; t < E.length && !stop; t++) {
        if (!E[t].bridge) { land.push(E[t].p); continue; }
        var t1 = t; while (t1 < E.length && E[t1].bridge) t1++;
        var A = land.length ? land[land.length - 1] : (t ? E[t - 1].p : null), B = t1 < E.length ? E[t1].p : null;
        if (!A || !B || V.dist(A, B) > maxSpan) { stop = true; break; }
        pieces.push({ pts: land, bridge: false }, { pts: [A, B], bridge: true }); land = [B]; t = t1;
      }
      pieces.push({ pts: land, bridge: false });
      pieces.forEach(function (pc) {
        if (pc.bridge) {
          var bw = SL.addWay('avenue', pc.pts, step, { tag: 'bridge ' + sp.name }); bw.noFrontage = true; bw.bridge = true;
          out.ways.push(bw); out.bridges.push({ a: pc.pts[0], b: pc.pts[1], way: bw }); return;
        }
        if (pc.pts.length < 2 || plLen(pc.pts) < minRun) return;
        var pts = pc.pts.length > 3 ? chaikin(rdp(pc.pts, o.rdp == null ? 4 : o.rdp), 2) : pc.pts;
        pts[0] = pc.pts[0]; pts[pts.length - 1] = pc.pts[pc.pts.length - 1];
        out.ways.push(SL.addWay('avenue', pts, step, { tag: sp.name })); out.made++;
      });
      if (stop) break;
    }
  });
  return out;
};
KCITY.site.blockCorridor = function (P, hw) {
  var R = SL.R;
  for (var i = 1; i < P.length; i++) R.eachNearSeg(P[i - 1], P[i], hw, function (k) { if (R.occ[k] === OCC.FREE || R.occ[k] === OCC.GREEN) { R.occ[k] = OCC.HARD; R.own[k] = -1; } });
};
/* a way laid over something placed before it (a highway, a causeway) takes it down: every standing building whose
   footprint its carriageway (plus pad) overlaps is knocked out at step; skip(L) keeps one (Voth's canton decks) */
KCITY.site.clearUnder = function (pts, width, step, pad, skip) {
  var n = 0;
  for (var i = 1; i < pts.length; i++) {
    var a = pts[i - 1], b = pts[i], L = V.dist(a, b); if (L < 0.5) continue;
    var o = obb(V.lerp(a, b, 0.5), V.norm(V.sub(b, a)), L / 2, width / 2 + (pad || 0));
    PLAN.lots.forEach(function (Lt) { if (Lt.died == null && Lt.bo && !(skip && skip(Lt)) && Math.abs(Lt.x - o.c[0]) < L / 2 + 80 && Math.abs(Lt.z - o.c[1]) < L / 2 + 80 && SL.pen(o, Lt.bo) > 0.2) { SL.killLot(Lt, step); n++; } });
  }
  return n;
};

/* ---------------------------------------------------------------- highways */
/* the ground on a coarse grid: o {half, c, h(x, z)} -> {n, c, half, H} */
KCITY.site.highwayGrid = function (o) {
  var c = o.c, half = o.half, n = Math.round(2 * half / c), H = new Float32Array(n * n);
  for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) H[j * n + i] = o.h(-half + (i + 0.5) * c, -half + (j + 0.5) * c);
  return { n: n, c: c, half: half, H: H };
};
/* a pull toward a line: k per metre beyond `free` metres from it (dist(x, z): the world's distance) */
KCITY.site.pullField = function (G, dist, k, free) {
  var n = G.n, c = G.c, half = G.half, F = new Float32Array(n * n);
  for (var q = 0; q < n * n; q++) { var px = -half + (q % n + 0.5) * c, pz = -half + (((q / n) | 0) + 0.5) * c; F[q] = k * Math.max(0, dist(px, pz) - free); }
  return F;
};
/* the distance to a polyline, as a function */
KCITY.site.lineDist = function (L) { return function (x, z) { var d = Infinity; for (var i = 1; i < L.length; i++) d = Math.min(d, segDist([x, z], L[i - 1], L[i])); return d; }; };
/* one highway: from `from` out along bearing dir to the ring of cells past spec.reach from spec.centre (within pi/7 of
   the bearing). Cells under spec.dry are water; ground a lot or a park holds (HARD, GREEN on the raster) is not run
   over except within spec.startFree of the start; spec.pull (pullField) is added to the price; spec.via {x, z} makes
   it come by that point first, at a distance between spec.viaNear[0] and [1]. Returns {pts (null: no route), viaFailed} */
KCITY.site.highway = function (G, spec) {
  var n = G.n, c = G.c, half = G.half, H = G.H, st = spec.from, zc = spec.centre, dir = spec.dir, reach = spec.reach, extra = spec.pull || null;
  var dry = spec.dry == null ? 0.8 : spec.dry, slopeK = spec.slopeK == null ? 70 : spec.slopeK, startFree = spec.startFree == null ? 60 : spec.startFree;
  var via = spec.via || null, vn = spec.viaNear || [36, 60];
  var cost = function (k, i, j) {
    var h = H[k]; if (h < dry) return Infinity;
    var px = -half + (i + 0.5) * c, pz = -half + (j + 0.5) * c, rk = SL.R.idx(px, pz);
    if (via && Math.hypot(px - via.x, pz - via.z) < vn[0] - 4) return Infinity;
    if (rk >= 0 && (SL.R.occ[rk] === OCC.HARD || SL.R.occ[rk] === OCC.GREEN) && Math.hypot(-half + (i + 0.5) * c - st[0], -half + (j + 0.5) * c - st[1]) > startFree) return Infinity;
    var gx = (H[j * n + Math.min(n - 1, i + 1)] - H[j * n + Math.max(0, i - 1)]) / (2 * c), gz = (H[Math.min(n - 1, j + 1) * n + i] - H[Math.max(0, j - 1) * n + i]) / (2 * c);
    return 1 + slopeK * (gx * gx + gz * gz) + (extra ? extra[k] : 0);
  };
  var goals = new Set();
  for (var j2 = 0; j2 < n; j2++) for (var i2 = 0; i2 < n; i2++) {
    var gp = [-half + (i2 + 0.5) * c, -half + (j2 + 0.5) * c], rel = V.sub(gp, zc), L = V.len(rel);
    if (L > reach && L < reach + 3 * c && V.dot(rel, dir) / L > Math.cos(Math.PI / 7)) goals.add(j2 * n + i2);
  }
  var si = Math.floor((st[0] + half) / c), sj = Math.floor((st[1] + half) / c), from = sj * n + si, path = [], viaFailed = false;
  if (via) {
    var ring = new Set();
    for (var j4 = 0; j4 < n; j4++) for (var i4 = 0; i4 < n; i4++) { var dv = Math.hypot(-half + (i4 + 0.5) * c - via.x, -half + (j4 + 0.5) * c - via.z); if (dv > vn[0] && dv < vn[1] && H[j4 * n + i4] >= dry) ring.add(j4 * n + i4); }
    var p1 = ASTAR(G, from, ring, cost, null, 1.0, function (i3, j3) { return Math.max(0, Math.hypot(-half + (i3 + 0.5) * c - via.x, -half + (j3 + 0.5) * c - via.z) - vn[1]) / c; });
    if (!p1) viaFailed = true;
    else { path = p1.slice(0, -1); from = p1[p1.length - 1]; }
  }
  var p2 = ASTAR(G, from, goals, cost, null, 1.0, function (i3, j3) { return Math.max(0, reach - V.dot(V.sub([-half + (i3 + 0.5) * c, -half + (j3 + 0.5) * c], zc), dir)) / c; });
  if (!p2) return { pts: null, viaFailed: viaFailed };
  path = path.concat(p2);
  var pts = [st].concat(path.slice(1).map(function (k) { return [-half + (k % n + 0.5) * c, -half + (((k / n) | 0) + 0.5) * c]; }));
  return { pts: chaikin(rdp(pts, spec.rdp == null ? 6 : spec.rdp), 3), viaFailed: viaFailed };
};
/* the point of pts furthest out from centre along dir (the first of equals) */
KCITY.site.farthest = function (pts, centre, dir) {
  return pts.reduce(function (m, p) { return V.dot(V.sub(p, centre), dir) > V.dot(V.sub(m, centre), dir) ? p : m; }, pts[0]);
};
/* a highway laid: the way (on the raster), what stood under it cleared, a verge either side (o.verge m) no lot stands on
   (streets may cross it) */
KCITY.site.layHighway = function (pts, step, tag, o) {
  o = o || {};
  var hwy = SL.addWay('highway', pts, step, { tag: tag, stamp: true });
  KCITY.site.clearUnder(hwy.pts, hwy.w, step, o.pad == null ? 2 : o.pad, o.skip);
  var R = SL.R, verge = o.verge == null ? TUNE.verge : o.verge;
  for (var vi = 1; vi < hwy.pts.length; vi++) R.eachNearSeg(hwy.pts[vi - 1], hwy.pts[vi], hwy.w / 2 + verge, function (k) { if (R.occ[k] === OCC.FREE) R.occ[k] = OCC.VERGE; });
  return hwy;
};

/* ---------------------------------------------------------------- the wall, as records */
/* chain: the wall's line (a polyline); ways: the avenues and highways it meets. o: towerGap, clear (an avenue running
   beside the wall is kept this far: a vertex moves off it, a run that bows toward it gets a vertex), gateFind (a named
   gate takes the crossing within this of its marker), named [{x, z, name, marker}], side (1: the outward side is
   (t.z, -t.x) of the line's direction; -1 the other), health (every node's, 2: whole).
   Returns {line, nodes, gates}: a node {kind: 'gate' | 'tower', x, z, s (along the line), ry, health, name, named,
   crossed, way, square} (gates square to the way through them). */
KCITY.site.wall = function (chain, ways, o) {
  var T = o, side = o.side == null ? 1 : o.side;
  var C = resample(chain, T.towerGap, false);
  var nrm = function (i) { var a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], t = V.norm(V.sub(b, a)); return [side * t[1], -side * t[0]]; };
  var cross = function (L) {
    var out = [];
    for (var i = 1; i < L.length; i++) ways.forEach(function (w) {
      for (var k = 1; k < w.pts.length; k++) {
        var p = L[i - 1], q = L[i], r = w.pts[k - 1], s = w.pts[k], d1 = V.sub(q, p), d2 = V.sub(s, r), den = d1[0] * d2[1] - d1[1] * d2[0];
        if (Math.abs(den) < 1e-9) continue;
        var t = ((r[0] - p[0]) * d2[1] - (r[1] - p[1]) * d2[0]) / den, u = ((r[0] - p[0]) * d1[1] - (r[1] - p[1]) * d1[0]) / den;
        /* a way running along the wall (crossing it at under 30 degrees) is no crossing: the wall moves off it */
        var sin = Math.abs(den) / (V.len(d1) * V.len(d2));
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1 && sin > 0.5) out.push({ seg: i - 1, t: t, p: V.add(p, V.mul(d1, t)), way: w });
      }
    });
    return out;
  };
  var X0 = cross(C);
  /* clearance: a vertex an avenue runs beside (not across) moves out until the avenue is T.clear away */
  for (var it = 0; it < 4; it++) for (var i = 0; i < C.length; i++) {
    var p = C[i], d = Infinity, from = null;
    if (X0.some(function (x) { return V.dist(x.p, p) < 70; })) continue;
    ways.forEach(function (w) { var nq = w.F.nearest(p); if (nq.d < d) { d = nq.d; from = w.F.at(nq.s); } });
    if (d < T.clear) C[i] = V.add(p, V.mul(d > 0.5 ? V.norm(V.sub(p, from)) : nrm(i), T.clear - d + 3));
  }
  /* ...and a run between two vertices that bows toward an avenue gets a vertex (a tower) there, pushed out */
  for (var round = 0; round < 8; round++) {
    var added = false;
    for (var i2 = 1; i2 < C.length; i2++) {
      var A = C[i2 - 1], Bv = C[i2], worst = null, wd = T.clear, wfrom = null;
      for (var tt = 0.1; tt < 0.95; tt += 0.1) {
        var q = V.lerp(A, Bv, tt); if (X0.some(function (x) { return V.dist(x.p, q) < 70; })) continue;
        ways.forEach(function (w) { var nq2 = w.F.nearest(q); if (nq2.d < wd) { wd = nq2.d; worst = q; wfrom = w.F.at(nq2.s); } });
      }
      if (worst) { var td = V.norm(V.sub(Bv, A)), away = wd > 0.5 ? V.norm(V.sub(worst, wfrom)) : [side * td[1], -side * td[0]]; C.splice(i2, 0, V.add(worst, V.mul(away, T.clear - wd + 3))); added = true; i2++; }
    }
    if (!added) break;
  }
  var X = cross(C), arc = plFrame(C), sOf = function (pt) { return arc.nearest(pt).s; };
  /* gates: the named first, at the crossing nearest each marker (or the wall point nearest it) */
  var gates = [];
  (T.named || []).forEach(function (g) {
    var best = null, bd = T.gateFind;
    X.forEach(function (x) { var dd = Math.hypot(x.p[0] - g.x, x.p[1] - g.z); if (dd < bd) { bd = dd; best = x.p; } });
    var at = best || arc.at(sOf([g.x, g.z]));
    var bx = best ? X.filter(function (x) { return x.p === best; })[0] : null;
    gates.push({ kind: 'gate', name: g.name, marker: g.marker, x: at[0], z: at[1], s: sOf(at), health: 2, named: true, crossed: !!best, way: bx ? bx.way : null });
  });
  X.forEach(function (x) {
    var s = sOf(x.p);
    if (gates.some(function (g) { return Math.abs(g.s - s) < (g.named ? 70 : 40); })) return;
    gates.push({ kind: 'gate', name: 'Gate', x: x.p[0], z: x.p[1], s: s, named: false, way: x.way });
  });
  /* towers at the vertices, clear of the gates */
  var nodes = gates.slice();
  C.forEach(function (pt) { var s = sOf(pt); if (!gates.some(function (g) { return Math.abs(g.s - s) < 30; })) nodes.push({ kind: 'tower', x: pt[0], z: pt[1], s: s }); });
  nodes.sort(function (a, b) { return a.s - b.s; });
  nodes.forEach(function (nd) { nd.health = T.health == null ? 2 : T.health; });
  nodes.forEach(function (nd, k) { var a = nodes[Math.max(0, k - 1)], b = nodes[Math.min(nodes.length - 1, k + 1)]; nd.ry = Math.atan2(b.x - a.x, b.z - a.z); });
  /* a gate is square to the way through it, not to the wall: its passage (the model's local x) runs along the way, so
     its towers stand either side of the road instead of on it */
  nodes.forEach(function (nd) {
    if (nd.kind !== 'gate' || !nd.way) return;
    var t = nd.way.F.tan(nd.way.F.nearest([nd.x, nd.z]).s, 8), ry = Math.atan2(-t[1], t[0]);
    if (Math.cos(ry - nd.ry) < 0) ry += Math.PI;     /* keep the wall's own sense, so a model's front faces out as before */
    nd.ry = ry; nd.square = true;
  });
  return { line: C, nodes: nodes, gates: gates };
};
/* the standing runs between the live nodes (at gx, gz: where the world sited them), each stopping short of a gate
   (o.gateInset, 18) or a tower (o.towerInset, 6); a run's health the lower of its ends' (floored mean) */
KCITY.site.wallSegs = function (live, o) {
  o = o || {};
  var gi = o.gateInset == null ? 18 : o.gateInset, ti = o.towerInset == null ? 6 : o.towerInset, segs = [];
  for (var i = 1; i < live.length; i++) {
    var A = live[i - 1], C = live[i], health = Math.floor((A.health + C.health) / 2);
    if (health <= 0) continue;
    var dx = C.gx - A.gx, dz = C.gz - A.gz, L = Math.hypot(dx, dz); if (L < 2) continue;
    var ux = dx / L, uz = dz / L, iA = A.kind === 'gate' ? gi : ti, iC = C.kind === 'gate' ? gi : ti;
    var ax = A.gx + ux * Math.min(iA, L * 0.4), az = A.gz + uz * Math.min(iA, L * 0.4), bx = C.gx - ux * Math.min(iC, L * 0.4), bz = C.gz - uz * Math.min(iC, L * 0.4);
    if (Math.hypot(bx - ax, bz - az) < 4) continue;
    segs.push({ ax: ax, az: az, bx: bx, bz: bz, health: health });
  }
  return segs;
};
/* the wall onto the raster: anything placed on its line comes down (clearUnder, o.thick + 3), it is no ground for lots
   or streets (OUT for thick/2 + 5), nor are its towers (12 m) nor a gate's towers; only a gate's passage stays open.
   o: thick, step, gateTower, skip (clearUnder's) */
KCITY.site.stampWall = function (W, o) {
  var R = SL.R;
  W.segs.forEach(function (sg) { KCITY.site.clearUnder([[sg.ax, sg.az], [sg.bx, sg.bz]], o.thick, o.step, 3, o.skip); });
  W.segs.forEach(function (sg) {
    R.eachNearSeg([sg.ax, sg.az], [sg.bx, sg.bz], o.thick / 2 + 5, function (k) { if (R.occ[k] === OCC.FREE) { R.occ[k] = OCC.OUT; R.own[k] = -1; } });
  });
  W.nodes.forEach(function (nd) { if (nd.kind === 'tower' && !nd.skip && nd.health > 0) R.eachNearSeg([nd.gx, nd.gz], [nd.gx, nd.gz], 12, function (k) { if (R.occ[k] === OCC.FREE) R.occ[k] = OCC.OUT; }); });
  W.nodes.forEach(function (nd) {
    if (nd.kind !== 'gate' || nd.deleted) return;
    var lz = [Math.sin(nd.ry), Math.cos(nd.ry)], off = nd.named ? 20 : nd.towerOff;
    [-1, 1].forEach(function (sd) { var tp = [nd.gx + lz[0] * off * sd, nd.gz + lz[1] * off * sd]; R.eachNearSeg(tp, tp, nd.named ? 9 : o.gateTower / 2 + 1, function (k) { if (R.occ[k] === OCC.FREE || R.occ[k] === OCC.LOT) R.occ[k] = OCC.OUT; }); });
  });
};

/* ---------------------------------------------------------------- the ground-delta interface */
/* an avenue drawn into shallow water gets a bank: along pts every 3 m where the ground is under E.top and over
   E.deepest, the ground within E.core is raised to E.top, falling at E.slope over E.feather beyond. Returns metres banked */
KCITY.ground.bank = function (G, pts, E) {
  var N = G.N, cs = G.cell, run = 0;
  resample(pts, 3, false).forEach(function (p) {
    var h = G.h(p[0], p[1]); if (h >= E.top || h < E.deepest) return;
    run += 3;
    var R = E.core + E.feather, i0 = Math.floor((p[0] - R + G.ext) / cs), i1 = Math.ceil((p[0] + R + G.ext) / cs), j0 = Math.floor((p[1] - R + G.ext) / cs), j1 = Math.ceil((p[1] + R + G.ext) / cs);
    for (var j = Math.max(0, j0); j <= Math.min(N - 1, j1); j++) for (var i = Math.max(0, i0); i <= Math.min(N - 1, i1); i++) {
      var x = -G.ext + i * cs, z = -G.ext + j * cs, d = Math.hypot(x - p[0], z - p[1]); if (d > R) continue;
      var want = E.top - Math.max(0, d - E.core) * E.slope, k = j * N + i, now = G.at(i, j, k);
      if (want > now) G.add(k, want - now);
    }
  });
  return run;
};
/* a level pad: spec {x, z, ry, hw, hd (half sizes: local x along cos ry, -sin ry), y (its height), spread (no pad when
   the footprint's relief is under it), slope (beyond the pad the cut or fill meets the ground at no more than this)}.
   Samples the ground at the corners and the middles of the two long sides; cuts and fills the delta grid round it.
   Returns {y, cut, fill, R (the reach of the edit)} or null (level enough already) */
KCITY.ground.levelPad = function (G, spec) {
  var hw = spec.hw, hd = spec.hd, cs = Math.cos(spec.ry), sn = Math.sin(spec.ry), y = spec.y, lo = Infinity, hi = -Infinity;
  [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]].forEach(function (s) {
    var h = G.h(spec.x + s[0] * hw * cs + s[1] * hd * sn, spec.z - s[0] * hw * sn + s[1] * hd * cs); lo = Math.min(lo, h); hi = Math.max(hi, h);
  });
  if (hi - lo < spec.spread) return null;
  var N = G.N, c = G.cell, E = G.ext, R = Math.hypot(hw, hd) + (hi - lo) / spec.slope + c;
  var i0 = Math.max(0, Math.floor((spec.x - R + E) / c)), i1 = Math.min(N - 1, Math.ceil((spec.x + R + E) / c));
  var j0 = Math.max(0, Math.floor((spec.z - R + E) / c)), j1 = Math.min(N - 1, Math.ceil((spec.z + R + E) / c));
  for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
    var dx = -E + i * c - spec.x, dz = -E + j * c - spec.z, lx = dx * cs - dz * sn, lz = dx * sn + dz * cs;
    var d = Math.hypot(Math.max(0, Math.abs(lx) - hw), Math.max(0, Math.abs(lz) - hd)), k = j * N + i;
    var now = G.at(i, j, k), want = clamp(now, y - d * spec.slope, y + d * spec.slope);
    G.add(k, want - now);
  }
  return { y: y, cut: hi - y, fill: y - lo, R: R };
};
