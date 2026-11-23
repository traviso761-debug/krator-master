/* ============================== 6e. THE HILLSIDE STRATEGY: A VILLAGE CLIMBING A SLOPE BY STEPPED ALLEYS ============================== */
/* [G data] The owner, 2026-11-17 (settlements/pher/PLAN.md, the fifth round): "something more like santa cruz la laguna,
   but with dense alleys"; "do it procedurally so we can generalize it to other villages". A lake village on a steep
   slope, as Santa Cruz la Laguna and the Atitlán towns are: no street grid, a stepped path climbing the spur from the
   landing to the plaza, narrow alleys running off it along the contours, short stairs down the fall line joining them,
   and small houses packed along both sides of every alley, each stepping down the slope on its footing.

     KCITY.strategies.hillside.run(scopes, ctx) -> {ways, lots, alleys}

   scope: {id, i, j (its cell: the KRAND stream), poly (where it may build), foot [x, z] (where the spine starts: the
   landing, the bottom of the town), head [x, z] (where it ends: the plaza, the road's arrival), or paths [{foot, head}]
   (several paths up the slope, each a spine), kind (the pool: 'poor', 'middle', ...), wealth (0-1)}. ctx (every number
   optional):
     h            the ground (default the instance's CG.h)
     seed         (SL.seed); pools {kind: [[key, weight], ...]}; gaps {kind: [a, b]} (1, 3); margin (0.6: plots this far
                  apart); setback (0.8); step (12: the born step)
     spine        {cls ('lane'), step (8), grade (0.32: the steepest a leg climbs; steeper ground turns it across the
                  slope, so the path zigzags), wander (0.35), tries (240)}
     contour      {cls ('alley'), every (24: metres of path between branches), p (0.8: a branch's chance each side),
                  len [40, 170], grade (0.07), step (5), gap (14: no other way within it of its start)}
     stair        {cls ('alley'), every (55: metres of a contour alley between stairs), p (0.6), len [16, 46], step (4)}
     depth        (3: path, contour alleys, stairs, contour alleys off the stairs ...)
     maxSlope     (1.0: no way crosses ground steeper than this: a gully's wall, a cliff)
     ok(p)        (optional) the world's say on a point (outside its gorge, off its road ...)
     infill       {step (9), reach (16)}: lattice houses between the alleys, each facing the nearest way within reach
     basement     {storey (2.9), fit (0.6), max (2)} or false: each house's carved basement and its door from the podium
                  where the slope fits (KCITY.hillside.basement, below); the lot carries it as L.basement

   Every way is an SL way (SL.addWay: stamped on the raster, alleys only on open ground), every house a lot through
   KCITY.courts.place (the plot's clearance, the stance on the slope), so the result is records like any strategy's and a
   world draws them as it draws the others. Each scope draws from its own KRAND cell stream: one scope's edit moves
   nothing in another. Plain functions on records and the ground: no DOM, no THREE. */
KCITY.hillside = {};
(function (H) {
  var opt = function (o, k, d) { return o && o[k] != null ? o[k] : d; };
  H.grad = function (h, p, e) { e = e || 2; return [(h(p[0] + e, p[1]) - h(p[0] - e, p[1])) / (2 * e), (h(p[0], p[1] + e) - h(p[0], p[1] - e)) / (2 * e)]; };
  H.stream = function (ctx, name, s) {
    var seed = ctx.seed == null ? SL.seed : ctx.seed;
    return KRAND.stream(KRAND.cell(KRAND.child(seed, 'hillside:' + name), s.i == null ? 0 : s.i, s.j == null ? 0 : s.j));
  };
  /* may a way pass p: inside the scope, on ground no steeper than maxSlope, on the raster's open ground (or a way), the world's say */
  H.passable = function (p, s, ctx, h) {
    if (!inPoly(p, s.poly)) return false;
    var g = H.grad(h, p), sl = Math.hypot(g[0], g[1]);
    if (sl > opt(ctx, 'maxSlope', 1.0)) return false;
    if (SL.R) { var o = SL.R.at(p[0], p[1]); if (o === OCC.OUT || o === OCC.HARD || o === OCC.LOT) return false; }
    if (ctx.ok && !ctx.ok(p)) return false;
    return true;
  };
  /* no street or alley cell within r of p but those of way `skip` (and of nothing at all) */
  H.roomy = function (p, r, skip) {
    if (!SL.R || !r) return true; var R = SL.R, hit = false;
    R.eachNearSeg(p, p, r, function (k) { var o = R.occ[k]; if ((o === OCC.STREET || o === OCC.ALLEY) && R.own[k] !== skip) hit = true; });
    return !hit;
  };
  var onWay = function (p) { if (!SL.R) return false; var o = SL.R.at(p[0], p[1]); return o === OCC.STREET || o === OCC.ALLEY; };
  var rot = function (d, a) { var c = Math.cos(a), n = Math.sin(a); return [d[0] * c - d[1] * n, d[0] * n + d[1] * c]; };

  /* the spine: from foot toward head, each leg toward the head and uphill, turned across the slope when it would climb
     more than `grade`, a little wander; around what it may not pass by trying turns either side */
  H.spine = function (s, ctx, h, st) {
    var o = ctx.spine || {}, step = opt(o, 'step', 8), grade = opt(o, 'grade', 0.32), wander = opt(o, 'wander', 0.35), tries = opt(o, 'tries', 240);
    var p = s.foot.slice(), pts = [p.slice()], side = st.next() < 0.5 ? 1 : -1, legs = 0;
    for (var it = 0; it < tries && V.dist(p, s.head) > step * 1.5; it++) {
      var to = V.norm(V.sub(s.head, p)), d = V.norm(V.add(to, [(st.next() * 2 - 1) * wander, (st.next() * 2 - 1) * wander])), got = null;
      var turns = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4], y = h(p[0], p[1]);
      var okRise = function (q) { return Math.abs(h(q[0], q[1]) - y) / step <= grade; };
      for (var k = 0; k < turns.length && !got; k++) {
        var q = V.add(p, V.mul(rot(d, turns[k] * side), step));
        if (okRise(q) && H.passable(q, s, ctx, h)) got = q;
      }
      if (!got) {   /* too steep straight up: a leg across the slope (the zigzag), on the side it is on, else the other */
        var g = V.norm(H.grad(h, p)), lifts = [0.5, 0.35, 0.2, 0.1, 0];
        if (++legs % 9 === 0) side = -side;   /* a turn of the zigzag every nine legs */
        for (var sd = 0; sd < 2 && !got; sd++) {
          var sgn = sd ? -side : side, c = [g[1] * sgn, -g[0] * sgn];
          for (var li = 0; li < lifts.length && !got; li++) {
            var q2 = V.add(p, V.mul(V.norm(V.add(c, V.mul(g, lifts[li]))), step));
            if (okRise(q2) && H.passable(q2, s, ctx, h) && V.dist(q2, s.head) < V.dist(p, s.head) + step * 0.9) { got = q2; if (sd) side = -side; }
          }
        }
      }
      if (!got) break;
      p = got; pts.push(p.slice());
    }
    var dh = V.dist(p, s.head);
    if (dh <= step * 1.5 && dh > 0.5 && Math.abs(h(s.head[0], s.head[1]) - h(p[0], p[1])) / dh <= grade) pts.push(s.head.slice());   /* the last step onto the head, within the grade */
    return pts.length >= 3 ? pts : null;
  };
  /* a contour alley from p0, to one side: along the contour, climbing at most `grade`, pulled back to its line each step;
     it ends at a way it meets (joined), at ground it may not pass, or at its length */
  H.contour = function (p0, side, s, ctx, h, st, o) {
    var step = opt(o, 'step', 5), len = opt(o, 'len', [40, 170]), L = len[0] + st.next() * (len[1] - len[0]), grade = (st.next() * 2 - 1) * opt(o, 'grade', 0.07);
    var y0 = h(p0[0], p0[1]), p = p0.slice(), pts = [p.slice()], gone = 0, joined = false, prev = null;
    while (gone < L) {
      var g = H.grad(h, p), gl = Math.hypot(g[0], g[1]); if (gl < 1e-4) break;
      var t = [-g[1] / gl * side, g[0] / gl * side]; if (prev && V.dot(t, prev) < 0) t = [-t[0], -t[1]];
      var q = V.add(p, V.mul(t, step)), want = y0 + grade * (gone + step);
      var gq = H.grad(h, q), g2 = gq[0] * gq[0] + gq[1] * gq[1];
      if (g2 > 1e-6) { var f = Math.max(-3, Math.min(3, (h(q[0], q[1]) - want) / g2)); q = [q[0] - gq[0] * f, q[1] - gq[1] * f]; }
      if (gone > 6 && onWay(q)) { pts.push(q); joined = true; break; }
      if (!H.passable(q, s, ctx, h)) break;
      prev = V.norm(V.sub(q, p)); p = q; pts.push(p.slice()); gone += step;
    }
    return pts.length >= 5 ? { pts: pts, joined: joined } : null;
  };
  /* a stair from p0 down (dir -1) or up (+1) the fall line, ending on the next way it meets or its length */
  H.stair = function (p0, dir, s, ctx, h, st, o) {
    var step = opt(o, 'step', 4), len = opt(o, 'len', [16, 46]), L = len[0] + st.next() * (len[1] - len[0]);
    var p = p0.slice(), pts = [p.slice()], gone = 0, joined = false;
    while (gone < L) {
      var g = H.grad(h, p), gl = Math.hypot(g[0], g[1]); if (gl < 1e-4) break;
      var q = V.add(p, V.mul([g[0] / gl * dir, g[1] / gl * dir], step));
      if (gone > 5 && onWay(q)) { pts.push(q); joined = true; break; }
      if (!H.passable(q, s, ctx, h)) break;
      p = q; pts.push(p.slice()); gone += step;
    }
    return pts.length >= 4 ? { pts: pts, joined: joined } : null;
  };
  /* houses packed along both sides of a way, fronts onto it (the dense frontage of an alley) */
  H.frontage = function (way, s, ctx, st, pool) {
    var F = way.F, out = [], gaps = (ctx.gaps || {})[s.kind] || [1, 3], set = opt(ctx, 'setback', 0.8);
    [1, -1].forEach(function (sd) {
      KCITY.prim.frontageRun({ t0: 2, t1: F.len - 2,
        attempt: function (t) {
          var key = KCITY.courts.pick(st, pool), D = SL.dims(key, 0); if (!D) return { stop: true };
          if (t + D.w > F.len - 2) return { stop: true };
          var m = t + D.w / 2, a = F.at(m), tan = F.tan(m, 3), n = V.mul(V.perp(tan), sd);
          var c = V.add(a, V.mul(n, way.w / 2 + set + D.d / 2)), f = V.mul(n, -1);
          var rec = KCITY.courts.place(key, c, f, s, ctx, 'alley frontage', { way: way.id });
          if (!rec) return { adv: 2 };
          out.push(rec);
          return { adv: D.w + gaps[0] + st.next() * (gaps[1] - gaps[0]), rec: rec };
        } });
    });
    return out;
  };
  /* the lattice between the alleys: each house faces the nearest way within reach (it has a door on an alley), else none */
  H.infill = function (s, ctx, st, pool, h) {
    var I = ctx.infill || {}, step = opt(I, 'step', 9), reach = opt(I, 'reach', 16), out = [];
    var g = V.norm(H.grad(h, polyCentroid(s.poly))), U = [g[1], -g[0]];
    var cands = KCITY.prim.packPolygon(s.poly, { frame: { o: polyCentroid(s.poly), u: U, v: g }, step: step, st: st });
    var DIRS = []; for (var a = 0; a < 8; a++) DIRS.push([Math.cos(a * Math.PI / 4), Math.sin(a * Math.PI / 4)]);
    cands.forEach(function (cd) {
      var p = [cd[0], cd[1]]; if (!SL.R || SL.R.at(p[0], p[1]) !== OCC.FREE) return;
      var best = null; DIRS.forEach(function (d) { for (var t = 3; t <= reach; t += 1.5) { if (onWay(V.add(p, V.mul(d, t)))) { if (!best || t < best[1]) best = [d, t]; break; } } });
      if (!best) return;
      var key = KCITY.courts.pick(st, pool), D = SL.dims(key, 0); if (!D) return;
      var c = V.add(p, V.mul(best[0], Math.max(0, best[1] - D.d / 2 - 2.2)));
      var rec = KCITY.courts.place(key, c, best[0], s, ctx, 'infill', {}); if (rec) out.push(rec);
    });
    return out;
  };
  /* a basement door's clearance: the door and the 2.4 m before it (3.2 m wide) may meet no other house's podium (its box
     grown by its footing's batter), nothing in the raster but open ground or a contour alley (no stair, no path: the
     owner, "basement doors shouldn't cut off stairs"); its reason, or null */
  H.doorClear = function (L, D, ways) {
    var out = [Math.sin(D.ry), Math.cos(D.ry)], c = [D.x + out[0] * 1.5, D.z + out[1] * 1.5], zone = obb(c, [out[1], -out[0]], 1.6, 1.4);
    var hit = null;
    if (SL.index) SL.index.all(zone).forEach(function (M) {
      if (M === L || M.died != null || !M.bo) return;
      var g = (M.drop || 0) * 0.15 + 0.3, grown = obb(M.bo.c, M.bo.u, M.bo.hw + g, M.bo.hd + g);
      if (SL.pen(zone, grown) > 0) hit = hit || 'another house';
    });
    if (hit) return hit;
    if (SL.R) {
      var R = SL.R, byId = {}; (ways || []).forEach(function (w) { byId[w.id] = w; });
      R.eachInPoly(obbCorners(zone), function (k) {
        var o = R.occ[k]; if (o === OCC.FREE || o === OCC.GREEN || o === OCC.LOT && R.own[k] === L.id) return;
        if (o === OCC.STREET || o === OCC.ALLEY) { var w = byId[R.own[k]] || (PLAN.ways || [])[R.own[k]]; if (w && /contour/.test(w.tag || '')) return; hit = hit || 'a stair or path'; return; }
        hit = hit || 'architecture';
      });
    }
    return hit;
  };
  /* one scope: the spine, the contour alleys and stairs off it (to `depth`), the frontage of every way, the infill */
  H.scope = function (s, ctx) {
    var h = ctx.h || (CG && CG.h), stepN = opt(ctx, 'step', 12), out = { ways: [], lots: [], alleys: [] };
    var pool = (ctx.pools || {})[s.kind] || (ctx.pools || {}).middle;
    var so = ctx.spine || {}, co = ctx.contour || {}, sto = ctx.stair || {}, depth = opt(ctx, 'depth', 3);
    /* the paths up the slope: the scope's foot to its head, or each of its paths ({foot, head}), each a spine */
    var paths = s.paths || [{ foot: s.foot, head: s.head }], ss = H.stream(ctx, 'spine', s), queue = [];
    paths.forEach(function (pa, k) {
      var sp = H.spine({ id: s.id, poly: s.poly, foot: pa.foot, head: pa.head }, ctx, h, ss); if (!sp) return;
      var spine = SL.addWay(opt(so, 'cls', 'lane'), sp, stepN, { tag: 'path ' + (k + 1) + ' of ' + s.id });
      out.ways.push(spine); if (!out.spine) out.spine = spine; queue.push({ way: spine, gen: 0, kind: 'spine' });
    });
    if (!queue.length) return out;
    var sb = H.stream(ctx, 'branches', s);
    while (queue.length) {
      var q = queue.shift(); if (q.gen >= depth) continue;
      var F = q.way.F, contourNext = q.kind !== 'contour', every = contourNext ? opt(co, 'every', 24) : opt(sto, 'every', 55);
      for (var t = every * (0.5 + 0.5 * sb.next()); t < F.len - 4; t += every * (0.75 + 0.5 * sb.next())) {
        var at = F.at(t);
        [1, -1].forEach(function (sd) {
          if (sb.next() > (contourNext ? opt(co, 'p', 0.8) : opt(sto, 'p', 0.6))) return;
          var tan = F.tan(t, 3), off = V.add(at, V.mul(V.perp(tan), sd * (q.way.w / 2 + 1.6)));
          /* a contour alley starts only with room: no other way within `gap` of its start (its parent aside), so two
             rows of houses fit back to back between it and the next one up or down */
          if (contourNext && !H.roomy(off, opt(co, 'gap', 14), q.way.id)) return;
          var r = contourNext ? H.contour(off, sd, s, ctx, h, sb, co) : H.stair(off, sd, s, ctx, h, sb, sto);
          if (!r) return;
          r.pts.unshift(at);
          var w = SL.addWay(contourNext ? opt(co, 'cls', 'alley') : opt(sto, 'cls', 'alley'), r.pts, stepN, { tag: (contourNext ? 'contour alley' : 'stair') + ' of ' + s.id });
          w.joined = r.joined; out.ways.push(w); out.alleys.push(w);
          queue.push({ way: w, gen: q.gen + 1, kind: contourNext ? 'contour' : 'stair' });
        });
      }
    }
    var sf = H.stream(ctx, 'frontage', s);
    out.ways.forEach(function (w) { out.lots = out.lots.concat(H.frontage(w, s, ctx, sf, pool)); });
    out.lots = out.lots.concat(H.infill(s, ctx, H.stream(ctx, 'infill', s), pool, h));
    /* each house's basement and its door from the podium, where the slope gives one (ctx.basement: its options, or false) */
    if (ctx.basement !== false) out.lots.forEach(function (L) {
      if (!L.bo || L.y == null) return;
      /* the building's own footprint, where the kit gives one (fw x fd: the house and its podium; w x d is its plot with
         its yard): the basement is under it and its door in the podium's face, not at the plot's edge */
      var it = SL.dims(L.key, L.v || 0), fb = it && it.fw ? obb(L.bo.c, L.bo.u, it.fw / 2, it.fd / 2) : L.bo;
      var B = KCITY.hillside.basement(fb, h, L.y, Object.assign({}, ctx.basement || {}, { front: [Math.sin(L.ry), Math.cos(L.ry)] }));
      if (B) B.foot = { hw: fb.hw, hd: fb.hd };
      if (!B) return;
      if (B.door) { var why = H.doorClear(L, B.door, out.ways); if (why) { B.why = why; B.door = null; } }
      L.basement = B;
    });
    return out;
  };
})(KCITY.hillside);

/* the basement (the owner, 2026-11-17: "maybe even carve basements, and where the slope precisely fits, auxiliary
   entrances from the podium"; "basement doors shouldn't cut off stairs. if there is any question of an individual
   basement slipping into architecture or not aligning to the ground properly, chuck it from its podium"): a house set on
   its footing on a slope (its floor y at its plot's high corner, the footing down to the low one) is carved a basement of
   `storeys` (the footing's depth over opt.storey, 2.9 m, rounded down) when that is at least one; and where one of its
   faces has the ground along it lying a whole number of storeys under the floor (every sample along the face within
   opt.fit, 0.45 m, of y - n x storey; n from 1 to opt.max, 2), and the ground before the door fits it (the step's within
   opt.level, 0.35 m, of the sill; the 2 m beyond falling away no more than 1.2 m and never rising 0.2 m over the sill),
   the basement opens on that face: a door at
   its middle, facing out. Never on the house's front (opt.front, its outward direction: the house's own door and its
   steps are there). Doubt drops the door, not the basement: the podium stays whole.
     KCITY.hillside.basement(bo, h, y, opt) -> null | {storeys, depth, door: null | {x, z, y, ry, face, n}, why?} */
KCITY.hillside.basement = function (bo, h, y, opt) {
  opt = opt || {};
  var storey = opt.storey == null ? 2.9 : opt.storey, fit = opt.fit == null ? 0.45 : opt.fit, max = opt.max == null ? 2 : opt.max, N = opt.samples == null ? 5 : opt.samples;
  var level = opt.level == null ? 0.35 : opt.level, front = opt.front || null;
  var C = obbCorners(bo), lo = Infinity;
  C.concat([bo.c]).forEach(function (p) { lo = Math.min(lo, h(p[0], p[1])); });
  var depth = y - lo, storeys = Math.floor((depth + fit) / storey);
  if (storeys < 1) return null;
  var best = null;
  for (var f = 0; f < 4; f++) {
    var a = C[f], b = C[(f + 1) % 4], gs = [];
    for (var k = 0; k < N; k++) { var t = (k + 0.5) / N; gs.push(h(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)); }
    for (var n = 1; n <= Math.min(max, storeys); n++) {
      var want = y - n * storey, off = 0; gs.forEach(function (g) { off = Math.max(off, Math.abs(g - want)); });
      if (off <= fit && (!best || off < best.off)) {
        var m = V.lerp(a, b, 0.5), out = V.norm(V.sub(m, bo.c)), along = V.norm(V.sub(b, a)), sill = gs.reduce(function (s, g) { return s + g; }, 0) / N;
        if (front && V.dot(out, front) > 0.5) continue;   /* the house's front: its own door and steps */
        var flat = true;
        [[0.6, 0], [0.6, -0.9], [0.6, 0.9], [1.4, 0], [2.4, 0], [2.4, -0.9], [2.4, 0.9]].forEach(function (q) {
          var pt = V.add(V.add(m, V.mul(out, q[0])), V.mul(along, q[1])), g = h(pt[0], pt[1]) - sill;
          if (q[0] < 1 ? Math.abs(g) > level : (g > 0.2 || g < -1.2)) flat = false;   /* the step level; beyond it the ground falls away gently, never rising to the sill */
        });
        if (!flat) continue;
        best = { off: off, door: { x: m[0], z: m[1], y: sill, ry: ryFacing(out), face: f, n: n } };
      }
    }
  }
  return { storeys: storeys, depth: +depth.toFixed(2), door: best ? best.door : null };
};

KCITY.strategies.hillside = {
  steps: [],
  run: function (scopes, ctx) {
    ctx = ctx || {};
    var made = { ways: [], lots: [], alleys: [] };
    scopes.forEach(function (s) { var r = KCITY.hillside.scope(s, ctx); made.ways = made.ways.concat(r.ways); made.lots = made.lots.concat(r.lots); made.alleys = made.alleys.concat(r.alleys); });
    return made;
  }
};
