/* ============================== 5c. FERRY AND ELEPHANT BUG LINES, AS core/simulation TRANSPORT ROUTES ============================== */
/* [G data] The owner's stations and lines (site/voth-site.json) become core/simulation records (owner, 2026-10-09:
   "reconcile them with core/simulation"): every ferry stop and elephant bug station is a SIM place (a ferry stop's pier is
   where it boards), a line that comes in from off the map or leaves by an edge is a SIM port there, and each line is a
   SIM transport route (core/simulation/77-sim-5r-routes.js) on the 'water' or the 'strider' navigation layer. The two
   layers are this page's own grids, registered with SIM.nav.layer({route}): a ferry keeps to open water (not through
   cantons, chinampas, piers or span piers); an elephant bug walks land and wades up to Voth's wading depth (66-striders.js:
   STRIDER_WADE_DEPTH 5 + STRIDER_FOOT_DROP 4 = 9 m), cheaper on the streets. SIM bakes each route's legs and
   timetable; the host draws each vehicle where SIM.vehiclePose puts it, a pure function of time. */

/* ---------------------------------------------------------------- step 2: the ferry piers, set out early
   Ferry stops at canton docks get Voth's own pier (65e: 40 m from the canton edge toward the bay's centre, Port 85),
   except the four whose canton already carries one (CPIERS); a drawn stop on the water gets a pier from the nearest
   shore. They are booked in Voth's PIERS now, so the harbour's piers and fishing docks and the chinampas keep clear. */
VC.ferryPiers = function () {
  var B = VOTH, C = B.CIDX, out = {};
  var bc = [(C.Palace.x + C.Temple.x + C.Ancestry.x) / 3, (C.Palace.z + C.Temple.z + C.Ancestry.z) / 3];
  SITE.stations().forEach(function (s) {
    if (s.kind !== 'ferry') return;
    var rec = null, cp = s.canton && B.CPIERS.filter(function (q) { return q.canton === s.canton; })[0];
    if (s.origin === 'voth' && cp) {
      /* the four cantons Voth gave a ferry pier of their own (CPIERS): the canton models drawn here leave it out, so it
         is built from its record, from the canton's edge */
      var cl = Math.hypot(cp.x1 - cp.x0, cp.z1 - cp.z0);
      rec = { root: [cp.x0, cp.z0], dir: [(cp.x1 - cp.x0) / cl, (cp.z1 - cp.z0) / cl], len: cl, canton: true, to: s.canton + ' canton (Voth pier)', cpier: true };
    } else if (s.origin === 'voth' && s.canton) {
      var c = C[s.canton], d = V.norm(V.sub(bc, [c.x, c.z])), e = B.lifeCantonEdge(c, d[0], d[1]), L = s.canton === 'Port' ? 85 : 40;
      rec = { root: [e[0], e[1]], dir: d, len: L, canton: true, to: s.canton + ' canton' };
    } else if (s.origin !== 'voth' && baseH(s.x, s.z) < 0) {
      /* a stop drawn on the water: a pier from its nearest anchor, the shore or a canton's edge, out to it (a canton
         pier reaches at least 40 m out, as Voth's do, so its tip is clear of the canton) */
      var S = [s.x, s.z], anchors = [];
      var best = null, bd = TUNE.ferryPierMax;
      for (var a = 0; a < 72; a++) { var dir = [Math.cos(a / 72 * 6.283), Math.sin(a / 72 * 6.283)]; for (var t = 4; t < bd; t += 4) { var p = V.add(S, V.mul(dir, t)); if (baseH(p[0], p[1]) > 0.6 && !VC.inCanton(p, 4)) { bd = t; best = { p: p, dir: dir }; break; } } }
      if (best) anchors.push({ root: best.p, dir: V.mul(best.dir, -1), len: Math.max(TUNE.ferryPierMin, bd), to: 'the shore' });
      B.CANTONS.forEach(function (cc) {
        var dd = V.norm(V.sub(S, [cc.x, cc.z])), ee = B.lifeCantonEdge(cc, dd[0], dd[1]), LL = V.dist([ee[0], ee[1]], S);
        if (LL < TUNE.ferryPierMax) anchors.push({ root: [ee[0], ee[1]], dir: dd, len: Math.max(40, LL), canton: true, to: cc.n + ' canton' });
      });
      /* the shortest that crosses no other canton and no land on the way */
      anchors.sort(function (p, q) { return p.len - q.len; });
      rec = anchors.filter(function (A) {
        for (var u = 12; u < A.len; u += 6) { var q = V.add(A.root, V.mul(A.dir, u)); if (baseH(q[0], q[1]) > 0.6 || (u > 20 && VC.cantonBlocked(q[0], q[1]) && !(A.canton && u < 45))) return false; }
        return true;
      })[0] || null;
    } else if (s.origin !== 'voth') {
      /* a stop drawn on the quay or the shore: a pier from the waterline nearest it, out toward the open water */
      var shore = null, sd = 90;
      for (var a2 = 0; a2 < 48; a2++) { var d2 = [Math.cos(a2 / 48 * 6.283), Math.sin(a2 / 48 * 6.283)]; for (var t2 = 2; t2 < sd; t2 += 2) { var q = V.add([s.x, s.z], V.mul(d2, t2)); if (baseH(q[0], q[1]) < -0.3) { sd = t2; shore = q; break; } } }
      if (shore) {
        /* straight out from the shore: down the slope of the bed, swung a little if a canton or the far shore is in the way */
        var gx = baseH(shore[0] + 12, shore[1]) - baseH(shore[0] - 12, shore[1]), gz = baseH(shore[0], shore[1] + 12) - baseH(shore[0], shore[1] - 12), down = V.norm([-gx, -gz]), bestD = null, run = 0;
        for (var a3 = 0; a3 < 9; a3++) { var d3 = V.rot(down, (a3 % 2 ? 1 : -1) * Math.ceil(a3 / 2) * 0.12), r3 = 0; for (var t3 = 4; t3 <= 80; t3 += 4) { var q3 = V.add(shore, V.mul(d3, t3)); if (baseH(q3[0], q3[1]) > -0.3 || VC.inCanton(q3, 10)) break; r3 = t3; } if (r3 > run + 8) { run = r3; bestD = d3; } }
        if (bestD && run >= 24) rec = { root: V.sub(shore, V.mul(bestD, 4)), dir: bestD, len: Math.min(TUNE.ferryPierMin + 10, run), to: 'the quay' };
      }
    }
    if (!rec) { out[s.id] = { none: true }; return; }
    rec.tip = V.add(rec.root, V.mul(rec.dir, rec.len));
    /* a canton's plinth leans in under its ledge (at the waterline it stands at about 0.9 of the radius, the ledge
       above at 1.07): a pier from the ledge's edge leaves water showing under it, so it runs in to meet the stone */
    if (rec.canton) { var cc0 = C[(rec.to || '').split(' ')[0]] || null, inset = TUNE.cantonPierInset;
      if (cc0) { var dEdge = V.dist(rec.root, [cc0.x, cc0.z]); inset = Math.max(inset, dEdge - cc0.r * 0.86); }
      rec.root = V.sub(rec.root, V.mul(rec.dir, inset)); rec.len += inset; }
    if (!rec.cpier) B.PIERS.push({ x0: rec.root[0], z0: rec.root[1], x1: rec.tip[0], z1: rec.tip[1], w: 5.5 + 2 * TUNE.ferryBerth, ferry: s.id });
    out[s.id] = rec;
  });
  VC.FP = out;
};

/* ---------------------------------------------------------------- step 4: the elephant bug stations, before the streets
   (owner, 2026-10-09: "place elephant bug stations before street level pass so streets can go beside them, not through
   them; check and make sure their staging area makes sense"). Each station stands off its road (the nearest avenue,
   highway or main street) with a staging lay-by between: a loop that leaves the road, runs alongside the platform's
   long side and rejoins the road, wide enough for an elephant bug (feet 9.9 m either side of its body). An elephant bug pulls
   in, stops beside the platform, and pulls out ahead; it never turns or backs. Passengers come up Voth's ramp at the
   platform's end. The platform and the lay-by's verge are kept from the later streets and lots. */
VC.placeStations = function (step) {
  var R = SL.R, B = VOTH, K = TUNE.station, made = [], log = [];
  VC.SST = {}; VC.platforms = [];
  SITE.stations().forEach(function (s) {
    if (s.kind !== 'strider') return;
    var w = VC.nearestWayPt([s.x, s.z], ['avenue', 'highway', 'main']);
    if (!w || w.d > K.roadReach) { log.push(s.id + ': no road within ' + K.roadReach + ' m'); VC.SST[s.id] = { x: s.x, z: s.z, ry: 0, berth: [s.x + 30, s.z], heading: 0, layby: null }; return; }
    var F = w.way.F, sw = w.s, t = F.tan(sw, 12), n = V.perp(t);
    if (V.dot(V.sub([s.x, s.z], w.p), n) < 0) n = V.mul(n, -1);            /* the station's side of the road */
    var hw = w.way.w / 2, lane = hw + K.gap + K.laneHalf, plat = lane + K.laneHalf + K.platGap + 9;
    var p0 = F.at(sw), berth = V.add(p0, V.mul(n, lane)), pc = V.add(p0, V.mul(n, plat));
    var ry = Math.atan2(-t[1], t[0]);                                         /* the platform's long side (Voth's local x) along the road */
    var foot = obb(pc, t, 18 + 2, 9 + 2);
    /* the lay-by: off the road ahead and behind, the straight past the platform */
    var a = Math.max(0, sw - K.layLen / 2 - K.taper), b = Math.min(F.len, sw + K.layLen / 2 + K.taper);
    var pts = [F.at(a), V.add(F.at(sw - K.layLen / 2), V.mul(n, lane)), V.add(F.at(sw + K.layLen / 2), V.mul(n, lane)), F.at(b)];
    var lb = SL.addWay('avenue', chaikin(pts, 3), step, { tag: 'elephant bug lay-by ' + s.id });
    lb.layby = s.id;
    /* the station block (the road's edge to the platform's back, the lay-by's length, the forecourt at the ramp
       end) is no ground for streets or lots: they go round it */
    var depth = plat + 9 + 3 - hw;
    R.stampPoly(obbCorners(obb(V.add(p0, V.mul(n, hw + depth / 2)), t, K.layLen / 2 + K.taper * 0.6, depth / 2)), OCC.HARD, -1);
    R.stampPoly(obbCorners(obb(pc, t, 18 + K.forecourt, 9 + 3)), OCC.HARD, -1);
    PLAN.lots.forEach(function (L) { if (L.died == null && L.bo && SL.pen(VC.grow(foot, 3), L.bo) > 0) SL.killLot(L, step); });
    VC.platforms.push(foot);
    VC.SST[s.id] = { x: pc[0], z: pc[1], ry: ry, berth: berth, heading: Math.atan2(t[0], t[1]), layby: lb.id, road: w.way.id, moved: Math.round(V.dist(pc, [s.x, s.z])) };
    made.push(s.id);
  });
  VC.capture('stations', step, function () {
    Object.keys(VC.SST).forEach(function (id) { var q = VC.SST[id], s = SITE.station(id); B.striderStationBuild({ x: q.x, z: q.z, ry: q.ry, label: s.name }); });
  });
  return made.length + ' elephant bug stations off their roads, each with a lay-by' + (log.length ? ' (' + log.join('; ') + ')' : '');
};

/* ---------------------------------------------------------------- the boat rule: Voth's lifeNavBlocked (78b-life-nav.js)
   for every boat (owner: "import the collision logic for ferries and all future boats, they phase thru cantons"):
   water deeper than 1.5 m; not a canton (Voth's lifeNavCantonBlocked: the canton's rounded square, r * 1.07 + 10);
   not a chinampa bed (7 m); 6 m clear of every pier deck (harbour, fishing, river, canton and ferry piers); clear of
   the spans' piers. */
VC.cantonBlocked = function (x, z) {
  for (var i = 0; i < VOTH.CANTONS.length; i++) {
    var c = VOTH.CANTONS[i], dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz) || 1, ang = Math.atan2(dz, dx);
    if (d < c.r * 1.07 / Math.max(Math.abs(Math.cos(ang)), Math.abs(Math.sin(ang))) + 10) return true;
  }
  return false;
};

/* ---------------------------------------------------------------- the two navigation grids
   One TUNE.navCell grid over the map, read two ways.
   water (ferries): open water deep enough, not a canton, a chinampa bed, a pier or a span's pier.
   elephant bug: Voth's wading rule (the body sinks to 5 m, a foot reaches 4 m more: 9 m of water), and it does not walk
   through what stands (owner, 2026-10-09: "striders need to respect collision when it comes to buildings"): a cell
   is shut when the city's raster has a lot or a footprint at its middle or at two of four points 3.5 m out, when a
   country building, a canton, a station platform or the wall covers it. Roads are open whatever stands beside them
   (the avenues, highways, main streets and lanes, the river bridges' decks) and cheap, so an elephant bug keeps to them. */
VC.navGrid = function () {
  var B = VOTH, R = SL.R, cg = TUNE.navCell, half = TUNE.navHalf, n = Math.round(2 * half / cg), N = n * n;
  var H = new Float32Array(N), wet = new Uint8Array(N), road = new Uint8Array(N), block = new Uint8Array(N), under = new Uint8Array(N);
  var cell = function (x, z) { return Math.max(0, Math.min(n - 1, Math.floor((z + half) / cg))) * n + Math.max(0, Math.min(n - 1, Math.floor((x + half) / cg))); };
  var at = function (k) { return [-half + (k % n + 0.5) * cg, -half + (((k / n) | 0) + 0.5) * cg]; };
  /* every cell whose middle lies within r of segment ab */
  var stamp = function (a, b, r, fn) {
    var i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - r + half) / cg)), i1 = Math.min(n - 1, Math.floor((Math.max(a[0], b[0]) + r + half) / cg));
    var j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - r + half) / cg)), j1 = Math.min(n - 1, Math.floor((Math.max(a[1], b[1]) + r + half) / cg));
    for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) { var k = j * n + i; if (segDist(at(k), a, b) <= r) fn(k); }
  };
  var solid = function (x, z) { var c = R.at(x, z); return c === OCC.LOT || c === OCC.HARD; };
  for (var k = 0; k < N; k++) {
    var q = at(k), x = q[0], z = q[1], inR = Math.abs(x) < TUNE.rasterHalf && Math.abs(z) < TUNE.rasterHalf;
    H[k] = inR ? baseH(x, z) : B.terrainHe(x, z);
    if (H[k] < -1.5 && !VC.cantonBlocked(x, z) && !(VC.chin && VC.chin.chinHit(x, z, 7))) wet[k] = 1;
    if (VC.inCanton(q, 4)) block[k] = 1;
    else if (inR && (solid(x, z) || (solid(x + 3.5, z) + solid(x - 3.5, z) + solid(x, z + 3.5) + solid(x, z - 3.5)) >= 2)) block[k] = 1;
  }
  /* every pier deck, its own stop's too: a ferry berths at the tip, beside the deck, never across it */
  B.PIERS.forEach(function (P) { stamp([P.x0, P.z0], [P.x1, P.z1], (P.ferry ? 5.5 : P.w) / 2 + 6, function (k) { wet[k] = 0; }); });
  B.CPIERS.forEach(function (P) { stamp([P.x0, P.z0], [P.x1, P.z1], P.w / 2 + 6, function (k) { wet[k] = 0; }); });
  B.SPANS.forEach(function (p) {
    var A = B.CANTONS[p.a], Cc = B.CANTONS[p.b], L = Math.hypot(Cc.x - A.x, Cc.z - A.z), np = Math.max(1, Math.round((L - A.r * 0.94 - Cc.r * 0.94) / 135));
    for (var m = 1; m <= np; m++) { var t = m / (np + 1), ax = A.x + (Cc.x - A.x) / L * A.r * 0.94, az = A.z + (Cc.z - A.z) / L * A.r * 0.94, bx = Cc.x - (Cc.x - A.x) / L * Cc.r * 0.94, bz = Cc.z - (Cc.z - A.z) / L * Cc.r * 0.94, sp = [ax + (bx - ax) * t, az + (bz - az) * t]; stamp(sp, sp, 22, function (k) { wet[k] = 0; }); }
  });
  /* what stands out of the raster: country buildings; the station platforms; the wall (its gates are open) */
  PLAN.lots.forEach(function (L) { if (L.died == null && L.bo && L.country) { var rr = Math.max(L.bo.hw, L.bo.hd) + 3; stamp(L.bo.c, L.bo.c, rr, function (k) { block[k] = 1; }); } });
  (VC.platforms || []).forEach(function (o) { var C = obbCorners(o); for (var e = 0; e < 4; e++) stamp(C[e], C[(e + 1) % 4], 4, function (k) { block[k] = 1; }); stamp(o.c, o.c, Math.min(o.hw, o.hd), function (k) { block[k] = 1; }); });
  if (VC.wall) VC.wall.segs.forEach(function (sg) { stamp([sg.ax, sg.az], [sg.bx, sg.bz], TUNE.wall.thick / 2 + 3, function (k) { block[k] = 1; }); });
  /* the roads, and the river bridges' decks */
  PLAN.ways.forEach(function (w) {
    if (w.dead || ['avenue', 'highway', 'main', 'lane'].indexOf(w.cls) < 0) return;
    var r = Math.max(w.w / 2, cg * 0.5);
    for (var e = 1; e < w.pts.length; e += 2) stamp(w.pts[e - 1], w.pts[Math.min(w.pts.length - 1, e + 1)], r, function (k) { road[k] = 1; });
  });
  B.RBRIDGES.forEach(function (b) { stamp([b.ax, b.az], [b.bx, b.bz], Math.max(b.w / 2, cg * 0.5), function (k) { road[k] = 2; }); });
  /* an elephant bug never wades under or across a bridge (owner, 2026-10-09: elephant bugs clipped the bridges): the water either
     side of a river bridge's deck, and under every canton span, is closed to it. A river bridge is walked from its
     ends, along its deck (the host draws it at the deck's height, Voth's lifeBridgeY) */
  B.RBRIDGES.forEach(function (b) { stamp([b.ax, b.az], [b.bx, b.bz], b.w / 2 + TUNE.bridgeBand, function (k) { if (road[k] !== 2 && H[k] < 0.5) under[k] = 1; }); });
  B.SPANS.forEach(function (p) {
    var A = B.CANTONS[p.a], Cc = B.CANTONS[p.b], L = Math.hypot(Cc.x - A.x, Cc.z - A.z), ux = (Cc.x - A.x) / L, uz = (Cc.z - A.z) / L;
    stamp([A.x + ux * A.r * 0.94, A.z + uz * A.r * 0.94], [Cc.x - ux * Cc.r * 0.94, Cc.z - uz * Cc.r * 0.94], TUNE.bridgeBand, function (k) { if (H[k] < 0.5) under[k] = 1; });
  });
  /* a stop's own berth: the few cells round a pier tip a boat must reach, never inside a canton or on land */
  var route = function (ferry) {
    return function (ax, az, bx, bz) {
      var ka = cell(ax, az), kb = cell(bx, bz), free = ferry ? TUNE.navFree : TUNE.navFreeBug;
      var near = function (k) { var p = at(k); return (Math.hypot(p[0] - ax, p[1] - az) < free || Math.hypot(p[0] - bx, p[1] - bz) < free) && (!ferry || (H[k] < -0.5 && !VC.cantonBlocked(p[0], p[1]))); };
      var ok = function (p) { var k = cell(p[0], p[1]); return ferry ? (wet[k] || near(k)) : ((road[k] || (!block[k] && H[k] >= -TUNE.bugWade) || near(k)) && !under[k]); };
      var cost = ferry ? function (k) { return wet[k] || near(k) ? 1 : Infinity; }
                       : function (k) {
                           if (road[k] === 2) return 0.35;                      /* a bridge deck */
                           if (under[k]) return Infinity;                       /* beside a deck, or under a span */
                           var h = H[k]; if (h < -TUNE.bugWade && !near(k)) return Infinity;
                           if (road[k]) return 0.35;
                           if (block[k] && !near(k)) return Infinity;
                           return h < 0 ? 2.5 : 1.2;
                         };
      var path = ASTAR({ n: n, c: cg }, ka, [kb], cost, null, 0.35);
      if (!path) return null;
      var raw = path.map(at); raw[0] = [ax, az]; raw[raw.length - 1] = [bx, bz];
      /* smoothing may cut a corner: keep the smoothest version every 3 m of which the grid allows */
      var clear = function (P) { for (var i = 1; i < P.length; i++) { var L = V.dist(P[i - 1], P[i]); for (var u = 0; u < L; u += 3) if (!ok(V.lerp(P[i - 1], P[i], u / L))) return false; } return true; };
      var tries = ferry ? [chaikin(rdp(raw, 8), 2), chaikin(rdp(raw, 4), 1), rdp(raw, 2)] : [chaikin(rdp(raw, 2.5), 1), rdp(raw, 1.5)], seg = raw;
      for (var ti = 0; ti < tries.length; ti++) if (clear(tries[ti])) { seg = tries[ti]; break; }
      return { pts: seg.map(function (p) { var dk = ferry ? null : B.lifeBridgeY(p[0], p[1]); return [p[0], ferry ? 0 : dk != null ? dk : Math.max(-TUNE.bugSink, baseH(p[0], p[1])), p[1]]; }) };
    };
  };
  VC.NAV = { n: n, c: cg, half: half, H: H, wet: wet, road: road, block: block, under: under, cell: cell, at: at };
  SIM.nav.layer('water', { route: route(true) });
  SIM.nav.layer('strider', { route: route(false) });
};

/* a fresh SIM for each layout (the registries and the layers are SIM's own singletons) */
VC.simReset = function () {
  Object.keys(SIM.R).forEach(function (k) { SIM.R[k] = {}; SIM.order[k] = []; });
  Object.keys(SIM.nav.layers).forEach(function (k) { delete SIM.nav.layers[k]; });
  SIM.problems.length = 0; SIM.LOG.length = 0; SIM.routeFail.length = 0;
  SIM.init({ seed: 1414, t: function () { return VC.motionT || 0; }, hour: function () { return VC.clock ? VC.clock.hour : TUNE.clock.hour; }, day: function () { return VC.clock ? VC.clock.day : 0; }, err: function (m) { PLAN.log.push('[14] SIM: ' + m); } });
};

/* a line that comes in from off the map (or leaves by an edge): a port where a ray from its end station toward the
   compass side reaches the map's edge, swung a little either way until the layer can take it there */
VC.edgePort = function (id, st, side, layer) {
  var c = SITE.COMPASS[side], E = TUNE.portEdge, N = VC.NAV, best = null;
  /* an elephant bug leaves by the road that leaves the map on that side (owner: "elephant bugs leaving NE should take the
     highway"): the point where a highway crosses the map's edge nearest the compass bearing, within 40 degrees */
  if (layer === 'strider') {
    var zc = polyCentroid(PLAN.zone), bestA = 0.766;
    PLAN.ways.forEach(function (w) {
      if (w.cls !== 'highway') return;
      for (var i = 1; i < w.pts.length; i++) {
        var a = w.pts[i - 1], b = w.pts[i]; if (Math.max(Math.abs(a[0]), Math.abs(a[1])) >= E || Math.max(Math.abs(b[0]), Math.abs(b[1])) < E) continue;
        var u = V.norm(V.sub(b, zc)), ca = V.dot(u, c); if (ca > bestA) { bestA = ca; best = b; }
        break;
      }
    });
    if (best) best = [Math.max(-E, Math.min(E, best[0])), Math.max(-E, Math.min(E, best[1]))];
  }
  for (var k = 0; k < 17 && !best; k++) {   /* else a ray toward that side, swung a little until the layer can take it */
    var a = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.087, d = V.rot(c, a), t = Infinity;
    if (d[0]) t = Math.min(t, ((d[0] > 0 ? E : -E) - st.x) / d[0]);
    if (d[1]) t = Math.min(t, ((d[1] > 0 ? E : -E) - st.z) / d[1]);
    if (!(t > 0)) continue;
    var p = [st.x + d[0] * t, st.z + d[1] * t], h = N.H[N.cell(p[0], p[1])];
    if (layer === 'water' ? N.wet[N.cell(p[0], p[1])] : h > -TUNE.bugWade && !N.block[N.cell(p[0], p[1])]) best = p;
  }
  if (!best) return null;
  return SIM.port({ id: id, x: best[0], z: best[1], layer: layer, kind: layer === 'water' ? 'water' : 'country', side: side });
};

/* ---------------------------------------------------------------- step 14: the stations, then the lines */
VC.buildTransit = function (step) {
  var B = VOTH, st = SITE.stations(), out = { stations: [], lines: [], sim: true }, landings = 0;
  VC.simReset();
  ['BOARD_FERRY', 'BOARD_STRIDER'].forEach(function (a) { SIM.activity({ id: a }); });
  SIM.faction({ id: 'voth' });
  SIM.org({ id: 'ferrymen', faction: 'voth' }); SIM.org({ id: 'strider-guild', faction: 'voth' });
  VC.capture('transit', step, function () {
    st.forEach(function (s) {
      var rec = { id: s.id, kind: s.kind, name: s.name, x: s.x, z: s.z };
      if (s.kind === 'ferry') {
        var P = VC.FP[s.id];
        if (P && !P.none) {
          var tip = B.lifeBuildFerryPier(P.root[0], P.root[1], P.dir[0], P.dir[1], P.len); rec.x = tip.x; rec.z = tip.z;
          /* a shore pier is no use without a way to it: a paved landing at its root and a short street from the landing
             to the nearest street (owner: "make sure ... the ferry dock is well integrated") */
          if (!P.canton) {
            var land = V.sub(P.root, V.mul(P.dir, 9)), lry = Math.atan2(P.dir[0], P.dir[1]), lo = VC.obbAt(land, lry + Math.PI / 2, 10, 9);
            B.BOX(land[0], baseH(land[0], land[1]) - 0.6, land[1], 20, 1.2, 18, lry, 0x9c917a);
            PLAN.lots.forEach(function (L) { if (L.died == null && L.bo && SL.pen(VC.grow(lo, 2), L.bo) > 0) SL.killLot(L, step); });
            var w = VC.nearestWayPt(land, ['avenue', 'main', 'side', 'highway', 'lane']);
            if (w && w.d > 12 && w.d < TUNE.landingReach) { SL.addWay('side', [V.sub(land, V.mul(P.dir, 8)), w.p], step, { tag: 'ferry landing ' + s.id }); landings++; }
            rec.landing = land;
          }
        }
        SIM.place({ id: s.id, kind: 'ferry-stop', name: s.name, x: s.x, z: s.z, pier: { x: rec.x, z: rec.z, y: 0, dx: P && !P.none ? P.dir[0] : undefined, dz: P && !P.none ? P.dir[1] : undefined }, door: rec.landing ? { x: rec.landing[0], z: rec.landing[1] } : null, activities: { BOARD_FERRY: 40 }, org: 'ferrymen' });
      } else {
        var q = VC.SST[s.id]; rec.x = q.x; rec.z = q.z; rec.ry = q.ry; rec.berth = q.berth; rec.heading = q.heading;
      }
      out.stations.push(rec);
    });
  });
  /* the grids, then each elephant bug station's berth: beside its platform on the side away from the road, on open
     ground an elephant bug can stand on, far enough out that its feet (9.9 m either side) clear the platform. That is
     where an elephant bug stops and where it boards (owner: "they should come to a stop next to the strider station") */
  VC.navGrid();
  var N = VC.NAV;
  out.stations.forEach(function (r) {
    if (r.kind !== 'ferry') return;
    var k0 = N.cell(r.x, r.z); if (N.wet[k0]) return;
    var best = null, bd = Infinity;
    for (var a = 0; a < 48; a++) for (var t = N.c; t <= TUNE.ferrySnap; t += N.c / 2) {
      var q = [r.x + Math.cos(a / 48 * 6.283) * t, r.z + Math.sin(a / 48 * 6.283) * t];
      if (N.wet[N.cell(q[0], q[1])]) { if (t < bd) { bd = t; best = q; } break; }
    }
    if (best) { r.x = best[0]; r.z = best[1]; r.snapped = Math.round(bd); var P = SIM.R.place[r.id]; if (P) P.pier = { x: best[0], z: best[1], y: 0 }; }
  });
  out.stations.forEach(function (r) {
    if (r.kind !== 'strider') return;
    SIM.place({ id: r.id, kind: 'strider-station', name: r.name, x: r.x, z: r.z, y: Math.max(0, baseH(r.x, r.z)), door: { x: r.berth[0], z: r.berth[1], y: Math.max(0, baseH(r.berth[0], r.berth[1])) },
                activities: { BOARD_STRIDER: 60 }, org: 'strider-guild', ry: r.ry, berthHeading: r.heading });
  });
  /* the lines as SIM transport routes */
  SITE.data.routes.forEach(function (rt) {
    var layer = rt.kind === 'ferry' ? 'water' : 'strider', stops = rt.stops.slice(), why = [];
    if (rt.enter) { var a = SITE.station(stops[0]), pa = a && VC.edgePort(rt.id + ':in', a, rt.enter, layer); if (pa) stops.unshift('port:' + pa.id); else why.push('no edge to come in by from ' + rt.enter); }
    if (rt.exit) { var b = SITE.station(stops[stops.length - 1]), pb = b && VC.edgePort(rt.id + ':out', b, rt.exit, layer); if (pb) stops.push('port:' + pb.id); else why.push('no edge to leave by to ' + rt.exit); }
    /* one elephant bug at a time at a station's lay-by, a ferry each side of a pier; the rest line up and wait (owner,
       2026-10-09); elephant bugs half as many as one per 4 minutes of the round */
    var Kt = TUNE.transit[rt.kind];
    SIM.transport({ id: rt.id, name: rt.name, layer: layer, vehicleKind: rt.kind, stops: stops, faction: 'voth', org: rt.kind === 'ferry' ? 'ferrymen' : 'strider-guild',
                    exclusive: true, berths: Kt.berths, berthSide: Kt.berthSide, queueGap: Kt.queueGap, headway: Kt.headway,
                    vehicle: rt.kind === 'ferry' ? 'voth_city_ship_ferry' : 'voth_strider', capacity: rt.kind === 'ferry' ? 40 : 24 });
  });
  SIM.check();
  SIM.all('transport').forEach(function (R) { SIM.transportBake(R.id); });
  SIM.transportQueue();               /* lines that share a station share its berth */
  SIM.all('transport').forEach(function (R) {
    var pts = [], failed = [];
    R.legs.forEach(function (L) {
      if (L.back) return;
      if (L.failed) failed.push(L.from.replace(/^port:.*:in$/, 'off the map') + '>' + L.to.replace(/^port:.*:out$/, 'off the map'));
      var P = L.path.pts.map(function (q) { return [q[0], q[2]]; }); pts = pts.concat(pts.length ? P.slice(1) : P);
    });
    var rt = SITE.route(R.id);
    out.lines.push({ id: R.id, kind: rt.kind, name: rt.name, pts: pts, ok: !failed.length, failed: failed, loop: R.loop, period: R.period, vehicles: R.vehicles, stops: R.stops });
  });
  out.landings = landings;
  /* the ferry audit (owner: "make sure dock is visible and actually connects to shore or other structure"): every stop
     has a pier that was built, it starts on the shore, a quay or a canton's edge, and a boat can reach its tip */
  out.ferryAudit = out.stations.filter(function (r) { return r.kind === 'ferry'; }).map(function (r) {
    var P = VC.FP[r.id] || { none: true }, a = { id: r.id, dock: !P.none, to: P.to || null, len: P.len ? Math.round(P.len) : 0 };
    if (P.none) return a;
    var rootLand = baseH(P.root[0], P.root[1]) > -0.5 || VC.inCanton(P.root, 6);
    var reach = false; for (var t = 0; t <= 18 && !reach; t += 3) for (var k = 0; k < 8 && !reach; k++) { var q = [P.tip[0] + Math.cos(k * 0.785) * t, P.tip[1] + Math.sin(k * 0.785) * t]; if (N.wet[N.cell(q[0], q[1])]) reach = true; }
    a.anchored = rootLand; a.reachable = reach; return a;
  });
  out.problems = SIM.problems.slice();
  PLAN.transit = out;
  return out;
};

SL.pass14 = function () {
  var t = VC.buildTransit(14);
  var bad = t.lines.filter(function (l) { return !l.ok; });
  SL.note(14, t.stations.length + ' stations (' + t.stations.filter(function (s) { return s.kind === 'ferry'; }).length + ' ferry, ' +
    t.stations.filter(function (s) { return s.kind === 'strider'; }).length + ' elephant bug), ' + t.lines.length + ' lines as core/simulation transport routes (' +
    t.lines.map(function (l) { return l.name + (l.loop ? ' (loop)' : '') + ': ' + l.vehicles + ' ' + (l.kind === 'ferry' ? 'ferries' : 'elephant bugs') + ', ' + Math.round(l.period / 60) + ' min round'; }).join('; ') + ')' +
    (t.landings ? '; ' + t.landings + ' ferry landings joined to the streets' : '') +
    (bad.length ? '; legs no ' + (bad[0].kind === 'ferry' ? 'boat' : 'elephant bug') + ' can make, drawn straight: ' + bad.map(function (l) { return l.name + ' ' + l.failed.join(', '); }).join('; ') : '') +
    (t.problems.length ? '; SIM: ' + t.problems.join('; ') : ''));
};
