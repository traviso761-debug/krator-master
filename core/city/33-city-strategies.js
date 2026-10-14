/* ============================== 6b. STREET AND INFILL STRATEGIES, AND THEIR SHARED PRIMITIVES ============================== */
/* [G data] PLAN.md item 5. A strategy lays the streets and lots of some blocks or ways, behind one interface:

     KCITY.strategies[name] = { steps: [{name, n, run}], run(scope, ctx) -> {ways, lots} }

   `steps` are the builder steps it stands for (a world lists them in its own steps); `run` lays them on a scope (the
   blocks or ways it is given) and returns what it made. A world chooses one per district or block.
     alleys            steps 10-12 (side streets from the main streets, side-street lots with alley entrances held
                       open, the alleys joining them and the infill of the blocks): the whole plan's ways (Voth's)
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
