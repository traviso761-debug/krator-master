/* ============================== 6b. STREET AND INFILL STRATEGIES, AND THEIR SHARED PRIMITIVES ============================== */
/* [G data] PLAN.md item 5. A strategy lays the streets and lots of some blocks or ways, behind one interface:

     KCITY.strategies[name] = { steps: [{name, n, run}], run(scope, ctx) -> {ways, lots} }

   `steps` are the builder steps it stands for (a world lists them in its own steps); `run` lays them on a scope (the
   blocks or ways it is given) and returns what it made. A world chooses one per district or block.
     alleys            steps 10-12 (side streets from the main streets, side-street lots with alley entrances held
                       open, the alleys joining them and the infill of the blocks): the whole plan's ways (Voth's)
     frontage-courts   Ys's infill (settlements/ys/targets/city/88-city-place.js), on given polygon blocks: a cursor
                       along each side facing its street, lanes quartering a block with no host (each quarter's lane
                       sides fronted too), edge runs round a host, and a lattice infill of what is left, each house
                       facing the nearest street or else a yard (a court); every block from its own KRAND cell stream
   The shared primitives (KCITY.prim), plain functions any strategy (and Ys itself) uses:
     frontageRun(o)              the cursor: from o.t0 while t < o.t1 (and fewer than o.max placed): o.skip(t) -> metres
                                 left open (0: none), else o.attempt(t) -> {stop} | {adv, rec}; o.end(t) at the end
     faceNearestStreet(p, dirs, along, jitter)  the directions by their street distance along(p, d) (plus jitter()), nearest first
     huntNear(c, o, fn)          rings out from c (o.step, o.reach, o.minN, o.arc): the first fn(q, r) that answers
     gridCands(u0, v0, h, step, at)  (u0, v0) first, then a grid over [-h, h]^2 nearest it first, through at(u, v)
     packPolygon(poly, o)        lattice points (o.frame {o, u, v}, o.step) inside poly (o.inside), each with a draw of o.st,
                                 in the draws' order
     clearSpot(o, opt)           why footprint o cannot stand (the index, the raster, the ground), or null */

/* the primitives stand alone (Ys takes this one fragment, settlements/ys/build.py TARGET_CORE_FILES): KCITY may not exist yet */
if (typeof KCITY === 'undefined') var KCITY = { version: 1 };
KCITY.prim = {};
KCITY.prim.frontageRun = function (o) {
  var t = o.t0, n = 0, max = o.max == null ? Infinity : o.max;
  while (t < o.t1 && n < max) {
    var sk = o.skip ? o.skip(t) : 0;
    if (sk) { t += sk; continue; }
    var a = o.attempt(t);
    if (a.stop) break;
    if (a.rec) n++;
    t += a.adv;
  }
  if (o.end) o.end(t);
  return { n: n, t: t };
};
KCITY.prim.faceNearestStreet = function (p, dirs, along, jitter) {
  return dirs.map(function (d) { return [d, along(p, d) + (jitter ? jitter() : 0)]; }).sort(function (a, b) { return a[1] - b[1]; });
};
KCITY.prim.huntNear = function (c, o, fn) {
  var step = o.step == null ? 8 : o.step, minN = o.minN == null ? 8 : o.minN, arc = o.arc == null ? 10 : o.arc;
  for (var r = o.r0 == null ? 0 : o.r0; r <= o.reach; r += step) {
    var n = r ? Math.max(minN, Math.round(2 * Math.PI * r / arc)) : 1;
    for (var i = 0; i < n; i++) {
      var th = i / n * 2 * Math.PI, res = fn([c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r], r, th);
      if (res) return res;
    }
  }
  return null;
};
KCITY.prim.gridCands = function (u0, v0, h, step, at) {
  var out = [at(u0, v0)], g = [];
  for (var u = -h; u <= h; u += step) for (var v = -h; v <= h; v += step) g.push([u, v, Math.hypot(u - u0, v - v0)]);
  g.sort(function (p, q) { return p[2] - q[2]; });
  for (var i = 0; i < g.length; i++) out.push(at(g[i][0], g[i][1]));
  return out;
};
KCITY.prim.packPolygon = function (P, o) {
  var F = o.frame, H = F.o, U = F.u, W = F.v, inside = o.inside || function (Q, x, z) { return inPoly([x, z], Q); };
  var uv = function (p) { return [(p[0] - H[0]) * U[0] + (p[1] - H[1]) * U[1], (p[0] - H[0]) * W[0] + (p[1] - H[1]) * W[1]]; };
  var us = P.map(uv), u0 = Math.min.apply(null, us.map(function (q) { return q[0]; })), u1 = Math.max.apply(null, us.map(function (q) { return q[0]; }));
  var v0 = Math.min.apply(null, us.map(function (q) { return q[1]; })), v1 = Math.max.apply(null, us.map(function (q) { return q[1]; }));
  var out = [];
  for (var u = u0; u <= u1; u += o.step) for (var v = v0; v <= v1; v += o.step) {
    var x = H[0] + U[0] * u + W[0] * v, z = H[1] + U[1] * u + W[1] * v;
    if (inside(P, x, z)) out.push([x, z, o.st.next()]);
  }
  out.sort(function (p, q) { return p[2] - q[2]; });
  return out;
};
/* why footprint o cannot stand, or null: opt.lot (the grown plot) on the raster (any cell but FREE blocks; opt.inset
   shrinks the test), a standing footprint in the index (opt.eps), the world's ground predicate (SL.groundOk) */
KCITY.prim.clearSpot = function (o, opt) {
  opt = opt || {};
  var lot = opt.lot || o;
  if (SL.R) { var hit = SL.R.blockedRect(lot, opt.inset == null ? 0.2 : opt.inset); if (hit) return 'raster:' + hit.code; }
  var L = SL.index.hit(lot, null);
  if (L) return 'occupied';
  if (TUNE.exact && SL.streetHit(o)) return 'street';
  if (SL.groundOk && !SL.groundOk(o, opt.ctx || {})) return 'ground';
  return null;
};

/* ---------------------------------------------------------------- the registry */
KCITY.strategies = {};
/* alleys: steps 10-12 on the whole plan (32-city-steps-c.js) */
KCITY.strategies.alleys = {
  steps: [{ name: 'side streets', n: 10, run: function () { SL.pass10(); } }, { name: 'side-street lots, alley entrances', n: 11, run: function () { SL.pass11(); } },
    { name: 'alleys and alley lots', n: 12, run: function () { SL.pass12(); } }],
  run: function () {
    var w0 = PLAN.ways.length, l0 = PLAN.lots.length;
    SL.pass10(); SL.pass11(); SL.pass12();
    return { ways: PLAN.ways.slice(w0), lots: PLAN.lots.slice(l0).filter(function (L) { return L.died == null; }) };
  }
};

/* ---------------------------------------------------------------- frontage-courts (Ys's infill, on polygon blocks) */
/* blocks: [{id, i, j (its cell: the KRAND stream), poly (the built area: the street's kerb already inset), kind (the pool
   and gaps it takes: 'poor' | 'middle' | 'rich' | ...), host: {c, u, hw, hd} (a footprint standing in it, the world's), lanes:
   true (quarter it)}]. ctx (every number optional, Ys's values by default):
     step (12: the born step), seed (SL.seed), pools {kind: [[key, weight], ...]}, small {kind: pool} (the lanes' and
     rings' houses), gaps {kind: [a, b]} (6, 12), garden {kind: p} (0.1), focus [x, z] (the sides nearest it first),
     sides (4), setback (2), margin (1: a box grown by it may not touch another), lane {w (7), min (120: the block's
     smaller extent that takes lanes)}, ring {gap (16), max (10)}, infill {step (8), jitter (2), yard (0.3), yardR (8),
     reach (24), yardReach (30), dooryard (2.5), probe (60)} */
KCITY.strategies['frontage-courts'] = {
  steps: [],
  run: function (blocks, ctx) {
    ctx = ctx || {};
    var made = { ways: [], lots: [] }, C = KCITY.courts;
    blocks.forEach(function (b) { var r = C.block(b, ctx); made.ways = made.ways.concat(r.ways); made.lots = made.lots.concat(r.lots); });
    return made;
  }
};
KCITY.courts = {};
KCITY.courts.opt = function (ctx, k, d) { return ctx[k] == null ? d : ctx[k]; };
/* each block's own stream for each part, from its cell (KRAND.cell): one block's edit moves nothing in another.
   ctx.shared (a test's negative) draws every block from one stream instead */
KCITY.courts.stream = function (ctx, name, b) {
  var seed = ctx.seed == null ? SL.seed : ctx.seed;
  if (ctx.shared) return ctx._one || (ctx._one = KRAND.stream(KRAND.child(seed, 'courts')));
  return KRAND.stream(KRAND.cell(KRAND.child(seed, 'courts:' + name), b.i, b.j));
};
/* a weighted pick from a pool [[key, weight], ...] */
KCITY.courts.pick = function (st, pool) {
  var tot = 0, i; for (i = 0; i < pool.length; i++) tot += pool[i][1];
  var r = st.next() * tot; for (i = 0; i < pool.length; i++) { r -= pool[i][1]; if (r <= 0) return pool[i][0]; }
  return pool[pool.length - 1][0];
};
/* a building at c facing f (its front), from the kit; refused (null) when it cannot stand. The plot is the box grown by
   margin (no two plots touch); its record is a lot like any other (way: the street it faces, or -1) */
KCITY.courts.place = function (key, c, f, b, ctx, why, extra) {
  var it = SL.dims(key, 0); if (!it) return null;
  var m = KCITY.courts.opt(ctx, 'margin', 1), u = [f[1], -f[0]], bo = obb(c, u, it.w / 2, it.d / 2), dy = extra && extra.dooryard || 0;
  var lot = obb(V.add(c, V.mul(f, dy / 2)), u, it.w / 2 + m, it.d / 2 + m + dy / 2);   /* the plot: the box grown by margin, a dooryard in front */
  if (KCITY.prim.clearSpot(bo, { lot: lot, ctx: { block: b, key: key } })) return null;
  var st = TUNE.stance ? (TUNE.stance === 'high' ? KCITY.stance(bo, CG.h, TUNE.stanceOpt) : null) : null;
  if (TUNE.stance === 'high' && !st) return null;
  var L = { id: PLAN.lots.length, cls: b.kind || 'middle', key: key, v: 0, slot: 0, wealth: b.wealth == null ? 0.5 : b.wealth, x: c[0], z: c[1], y: st ? st.y : CG.foot(bo),
    ry: ryFacing(f), w: it.w, d: it.d, h: it.h, lot: lot, bo: bo, way: extra && extra.way != null ? extra.way : -1, side: 0, s: 0,
    born: KCITY.courts.opt(ctx, 'step', 12), died: null, court: b.id, why: why };
  if (st) L.drop = st.drop;
  PLAN.lots.push(L);
  if (SL.R) SL.R.stampPoly(obbCorners(lot), OCC.LOT, L.id);
  SL.hashLot(L); SL.register(L);
  return L;
};
/* a run of houses along edge a -> b of a polygon, inside it, fronts out across the edge (n: the outward normal): the
   cursor drops a pick from the pool set back from the edge, a gap after it, now and then a garden left open; a refusal
   moves on 6 m. Ys's frontage walker and edge run, on any edge */
KCITY.courts.edgeRun = function (a, q, n, b, st, pool, ctx, why, max, inset) {
  var dx = q[0] - a[0], dz = q[1] - a[1], L = Math.hypot(dx, dz) || 1, t = [dx / L, dz / L], set = inset == null ? KCITY.courts.opt(ctx, 'setback', 2) : inset;
  var gaps = (ctx.gaps || {})[b.kind] || [6, 12], garden = (ctx.garden || {})[b.kind]; if (garden == null) garden = 0.1;
  var out = [];
  KCITY.prim.frontageRun({ t0: 3, t1: L - 3, max: max,
    skip: function () { return st.next() < garden ? 8 + st.next() * 8 : 0; },
    attempt: function (s) {
      var key = KCITY.courts.pick(st, pool), D = SL.dims(key, 0); if (!D) return { stop: true };
      if (s + D.w > L - 3) return { stop: true };
      var m = s + D.w / 2, c = [a[0] + t[0] * m - n[0] * (D.d / 2 + set), a[1] + t[1] * m - n[1] * (D.d / 2 + set)];
      var rec = KCITY.courts.place(key, c, n, b, ctx, why);
      if (!rec) return { adv: 6 };
      out.push(rec);
      return { adv: D.w + gaps[0] + st.next() * (gaps[1] - gaps[0]), rec: rec };
    } });
  return out;
};
/* the edges of a polygon with their outward normals, the nearest the focus first */
KCITY.courts.sides = function (P, focus) {
  var c = polyCentroid(P), S = [];
  for (var i = 0; i < P.length; i++) {
    var a = P[i], q = P[(i + 1) % P.length], d = V.norm(V.sub(q, a)), n = [d[1], -d[0]], mid = V.lerp(a, q, 0.5);
    if (V.dot(V.sub(mid, c), n) < 0) n = [-n[0], -n[1]];
    S.push({ a: a, b: q, n: n, mid: mid, len: V.dist(a, q) });
  }
  if (focus) S.sort(function (p, q) { return V.dist(p.mid, focus) - V.dist(q.mid, focus); });
  return S;
};
/* clip polygon P to the half-plane dot(x - p0, n) <= off */
KCITY.courts.clip = function (P, p0, n, off) {
  var out = [], f = function (p) { return V.dot(V.sub(p, p0), n) - off; };
  for (var i = 0; i < P.length; i++) {
    var a = P[i], b = P[(i + 1) % P.length], fa = f(a), fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) out.push(V.lerp(a, b, fa / (fa - fb)));
  }
  return out;
};
/* the line through c along d, cut to polygon P: its two crossings of P's edges, furthest apart */
KCITY.courts.chord = function (P, c, d) {
  var lo = Infinity, hi = -Infinity;
  for (var i = 0; i < P.length; i++) {
    var a = P[i], b = P[(i + 1) % P.length], e = V.sub(b, a), den = d[0] * e[1] - d[1] * e[0]; if (Math.abs(den) < 1e-12) continue;
    var w = V.sub(a, c), t = (w[0] * e[1] - w[1] * e[0]) / den, u = (w[0] * d[1] - w[1] * d[0]) / den;
    if (u >= 0 && u <= 1) { lo = Math.min(lo, t); hi = Math.max(hi, t); }
  }
  return lo < hi ? [V.add(c, V.mul(d, lo)), V.add(c, V.mul(d, hi))] : null;
};
/* one block: host ring, lanes, frontage, quarters' lane frontage, lattice infill */
KCITY.courts.block = function (b, ctx) {
  var C = KCITY.courts, P = b.poly, pools = ctx.pools || {}, pool = pools[b.kind] || pools.middle, small = (ctx.small || {})[b.kind] || pool;
  var out = { ways: [], lots: [] }, step = C.opt(ctx, 'step', 12), cen = polyCentroid(P);
  var S = C.sides(P, ctx.focus), longest = S.reduce(function (m, s) { return s.len > m.len ? s : m; }, S[0]), U = V.norm(V.sub(longest.b, longest.a)), W = V.perp(U);
  /* the block's extent along its axes */
  var ext = function (d) { var a = Infinity, z = -Infinity; P.forEach(function (p) { var v = V.dot(V.sub(p, cen), d); a = Math.min(a, v); z = Math.max(z, v); }); return z - a; };
  /* 1. a host's ring: houses round it, fronts out */
  if (b.host) {
    var Rg = C.opt(ctx.ring || {}, 'gap', 16), ho = b.host, ring = obbCorners(obb(ho.c, ho.u, ho.hw + Rg, ho.hd + Rg)), st0 = C.stream(ctx, 'ring', b), n0 = 0, maxR = C.opt(ctx.ring || {}, 'max', 10);
    C.sides(ring, null).forEach(function (s) { if (n0 >= maxR) return; var r = C.edgeRun(s.a, s.b, s.n, b, st0, small, ctx, 'host ring', maxR - n0, 1); n0 += r.length; out.lots = out.lots.concat(r); });
  }
  /* 2. the lanes (a block without a host, wide enough): reserved before the frontage, so no house straddles a lane's end */
  var lw = C.opt(ctx.lane || {}, 'w', 7), lanes = [];
  if (b.lanes && !b.host && Math.min(ext(U), ext(W)) >= C.opt(ctx.lane || {}, 'min', 120)) {
    [U, W].forEach(function (d) { var ch = C.chord(P, cen, d); if (ch) { var w = SL.addWay('lane', ch, step, { tag: 'lane ' + b.id }); lanes.push({ d: d, way: w }); out.ways.push(w); } });
  }
  /* 3. the frontage: each side's street, the nearest the focus first */
  var st = C.stream(ctx, 'front', b), nf = 0, maxF = C.opt(ctx, 'max', 99);
  S.slice(0, C.opt(ctx, 'sides', 4)).forEach(function (s) { if (nf >= maxF) return; var r = C.edgeRun(s.a, s.b, s.n, b, st, pool, ctx, 'frontage', maxF - nf); nf += r.length; out.lots = out.lots.concat(r); });
  /* 4. each quarter's two lane sides */
  if (lanes.length === 2) {
    var sq = C.stream(ctx, 'lanes', b);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) {
      var Q = C.clip(C.clip(P, cen, V.mul(U, -q[0]), -lw / 2), cen, V.mul(W, -q[1]), -lw / 2);
      if (Q.length < 3) return;
      C.sides(Q, null).forEach(function (s) {
        var onLane = lanes.some(function (l) { return Math.abs(V.dot(V.sub(s.mid, cen), V.perp(l.d))) < lw / 2 + 0.5 && Math.abs(V.dot(s.n, V.perp(l.d))) > 0.9; });
        if (onLane && s.len > 12) out.lots = out.lots.concat(C.edgeRun(s.a, s.b, s.n, b, sq, small, ctx, 'lane frontage', 99, 1.5));
      });
    });
  }
  /* 5. the lattice infill: what is left, each house facing the nearest street (a way within reach), else the nearest yard */
  var I = ctx.infill || {}, si = C.stream(ctx, 'infill', b), yards = [];
  var cands = KCITY.prim.packPolygon(P, { frame: { o: cen, u: U, v: W }, step: C.opt(I, 'step', 8), st: si });
  var reach = C.opt(I, 'reach', 24), probe = C.opt(I, 'probe', 60), jit = C.opt(I, 'jitter', 2), yardP = C.opt(I, 'yard', 0.3), yardR = C.opt(I, 'yardR', 8), dooryard = C.opt(I, 'dooryard', 2.5);
  var DIRS = [U, V.mul(U, -1), W, V.mul(W, -1)];
  var along = function (p, d) { for (var t = 6; t <= probe; t += 6) { var q = V.add(p, V.mul(d, t)), o = SL.R ? SL.R.at(q[0], q[1]) : OCC.FREE; if (o === OCC.STREET || o === OCC.ALLEY) return t; } return 1e9; };
  cands.forEach(function (cd) {
    var p = [cd[0] + (si.next() * 2 - 1) * jit, cd[1] + (si.next() * 2 - 1) * jit], pr = obb(p, U, 2.5, 2.5);
    if (KCITY.prim.clearSpot(pr, { lot: pr }) || yards.some(function (Y) { return SL.pen(pr, Y) > 0; })) return;
    if (si.next() < yardP) { yards.push(obb(p, U, yardR, yardR)); return; }
    var key = C.pick(si, small), D = SL.dims(key, 0); if (!D) return;
    var order = KCITY.prim.faceNearestStreet(p, DIRS, along, function () { return si.next(); }), toYard = false;
    if (order[0][1] > reach + 1) {   /* no street within reach: front the nearest yard (a court) */
      var Y = null, yd = C.opt(I, 'yardReach', 30); yards.forEach(function (Q) { var dd = V.dist(Q.c, p); if (dd < yd) { yd = dd; Y = Q; } });
      if (!Y) return;
      order = DIRS.map(function (d) { return [d, -V.dot(d, V.sub(Y.c, p))]; }).sort(function (a, z) { return a[1] - z[1]; }); toYard = true;
    }
    for (var k = 0; k < order.length; k++) {
      if (!toYard && order[k][1] > reach + 1) break;   /* only a direction with its street within reach (Ys turned to any) */
      var d = order[k][0], c = V.add(p, V.mul(d, 1.5));
      if (yards.some(function (Q) { return SL.pen(obb(c, [d[1], -d[0]], D.w / 2 + 1, D.d / 2 + 1 + dooryard), Q) > 0; })) continue;
      var rec = C.place(key, c, d, b, ctx, toYard ? 'court' : 'infill', { dooryard: dooryard });
      if (rec) { rec.yard = toYard; out.lots.push(rec); }
      break;
    }
  });
  b.yards = yards;
  return out;
};
