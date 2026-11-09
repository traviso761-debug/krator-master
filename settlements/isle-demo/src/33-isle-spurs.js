/* ============================== 3a. THE STREETS OUTSIDE THE GATES (2026-11-04) ============================== */
/* [G data] The owner (2026-11-04): "we could experiment with placing short streets outside the city gates in response to
   demand and filling in lots according to demand. Keep it limited, hamlet-size, until we see how this works." Laid out
   with the plan (32 calls it, deterministic), CLOSED: a town's sim opens the next when its empty lots run out (47b,
   core/simulation 77-sim-6-build.js onFull), and only then is it drawn and built on.
     ISLE.spurs(c) -> [{id, root, lane: [[x, z], [x, z]], lots: [lot records]}]   c: {town, seed, h, half, lots, ways, wall,
                   tags, dims}: at most `spurs.max` a town, each a lane `lane` metres long and 4 wide branching square off
                   a gate's road `from` metres past the gate (a town with no gates: carrying one of its outermost dead-end
                   streets straight on past its end), with up to `lots` house lots along it, both sides, `key` houses facing the lane;
                   a lot is kept only on dry ground (1.5 m over the sea at every corner), no steeper than `drop` metres
                   across it, clear of every lot, way and wall piece of the plan, and inside the town's square; the lane
                   clear of the lots too. A side keeps a lane only with `least` lots. Each lot is registered in core/tags
                   (a building, kind 'lot'), its record vacant and `closed` until its street opens */
ISLE.spurs = function (c) {
  var B = ISLE.TUNE.sim && ISLE.TUNE.sim.build, Z = B && B.spurs; if (!Z || !(Z.max > 0)) return [];
  var D = c.dims(Z.key, 0); if (!D) return [];
  var h = c.h, half = c.half, out = [], pts = [], occ = [], why = {}; ISLE.spursWhy = why;
  c.ways.forEach(function (w) { w.pts.forEach(function (p) { pts.push([p[0], p[1], w.w / 2]); }); });
  c.lots.forEach(function (L) { occ.push([L.x, L.z, Math.hypot(L.w, L.d) / 2]); });
  (c.wall || []).forEach(function (Wp) { occ.push([Wp.x, Wp.z, Math.hypot(Wp.w, Wp.d) / 2]); });
  (c.fields || []).forEach(function (Fr) { occ.push([Fr.x, Fr.z, Fr.size * 0.7]); });   /* the farmland's parcels */
  var clear = function (x, z, r) {
    for (var i = 0; i < occ.length; i++) { var o = occ[i]; if (Math.hypot(o[0] - x, o[1] - z) < o[2] + r) return false; }
    for (var j = 0; j < pts.length; j++) { var p = pts[j]; if (Math.hypot(p[0] - x, p[1] - z) < p[2] + r) return false; }
    return true; };
  /* the roots: a gate's road (its first point the gate), else an avenue's outer end */
  var roots = [], cx = 0, cz = 0; c.lots.forEach(function (L) { cx += L.x; cz += L.z; }); cx /= Math.max(1, c.lots.length); cz /= Math.max(1, c.lots.length);
  c.ways.forEach(function (w, i) { var P = w.pts; if (P.length < 3) return;
    if (w.gate) roots.push({ id: w.gate, way: w, P: P });
    else { var a = P[0], b = P[P.length - 1], fa = Math.hypot(a[0] - cx, a[1] - cz), fb = Math.hypot(b[0] - cx, b[1] - cz), e = fb >= fa ? b : a;
      /* a dead end: no other way within 12 m of the street's outer end */
      var dead = !c.ways.some(function (w2) { return w2 !== w && w2.pts.some(function (q) { return Math.hypot(q[0] - e[0], q[1] - e[1]) < 12; }); });
      if (dead) roots.push({ id: w.cls + ' ' + (w.id == null ? i : w.id), way: w, P: fb >= fa ? P.slice().reverse() : P.slice(), outer: Math.max(fa, fb) }); } });
  if (roots.some(function (r) { return r.way.gate; })) roots = roots.filter(function (r) { return r.way.gate; });
  else roots = roots.sort(function (a, b) { return b.outer - a.outer; }).slice(0, 12);   /* the twelve dead-end streets reaching farthest out, each from its outer end */
  roots.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
  var at = function (P, s) { var acc = 0; for (var i = 1; i < P.length; i++) { var a = P[i - 1], b = P[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc + l >= s) { var t = (s - acc) / l; return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], d: [(b[0] - a[0]) / l, (b[1] - a[1]) / l] }; } acc += l; } return null; };
  var cands = [];
  roots.forEach(function (R0) {
    /* off a gate's road: square to it, `from` m out; past an avenue's end: straight on, the avenue carried out a short way */
    var gate = !!R0.way.gate, A = gate ? at(R0.P, Z.from) : at(R0.P, 1); if (!A) return; var tx = A.d[0], tz = A.d[1];
    (gate ? [1, -1] : [0]).forEach(function (side) {
      var nx = gate ? -tz * side : -A.d[0], nz = gate ? tx * side : -A.d[1];
      if (!gate) { tx = -nz; tz = nx; }
      var s0 = gate ? [A.p[0] + nx * (R0.way.w / 2 + 1), A.p[1] + nz * (R0.way.w / 2 + 1)] : [R0.P[0][0] + nx * 2, R0.P[0][1] + nz * 2], lots = [], laneOk = true;
      for (var q = 6; q <= Z.lane; q += 4) { var lx = s0[0] + nx * q, lz = s0[1] + nz * q; var lb = h(lx, lz) < 1.5 ? 'lane in the sea' : Math.abs(lx) > half - 30 || Math.abs(lz) > half - 30 ? 'lane off the square' : !clear(lx, lz, 2) ? 'lane over the plan' : null; if (lb) { laneOk = false; why[lb] = (why[lb] || 0) + 1; break; } }   /* past the road's verge */
      if (!laneOk) return;
      for (var k = 0, s = 6 + D.d / 2; s + D.w / 2 <= Z.lane && lots.length < Z.lots; s += D.w + 3) [1, -1].forEach(function (u) {
        if (lots.length >= Z.lots) return;
        var off = 2 + D.d / 2 + 1, x = s0[0] + nx * s + tx * u * off, z = s0[1] + nz * s + tz * u * off, ys = [], r = Math.hypot(D.w, D.d) / 2;
        var fx = -tx * u, fz = -tz * u, ry = Math.atan2(fx, fz), ux = Math.cos(ry), uz = -Math.sin(ry);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (cr) { ys.push(h(x + ux * cr[0] * D.w / 2 + fx * cr[1] * D.d / 2, z + uz * cr[0] * D.w / 2 + fz * cr[1] * D.d / 2)); });
        var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var bad = y0 < 1.5 ? 'sea' : y1 - y0 > Z.drop ? 'steep' : Math.abs(x) > half - 30 || Math.abs(z) > half - 30 ? 'edge' : !clear(x, z, r) ? 'taken' : null; if (bad) { why[bad] = (why[bad] || 0) + 1; return; }
        if (lots.some(function (o) { return Math.hypot(o.x - x, o.z - z) < r * 2; })) return;
        lots.push({ x: x, z: z, y: y1, ry: ry, drop: y1 - y0 });
      });
      if (lots.length >= Z.least) cands.push({ root: R0.id, side: side, lane: [s0, [s0[0] + nx * Z.lane, s0[1] + nz * Z.lane]], lots: lots });
    });
  });
  /* a lane per root at most (the side with more lots), the roots in order, at most `max` streets, none over another's lots */
  var byRoot = {}; cands.forEach(function (C) { var b = byRoot[C.root]; if (!b || C.lots.length > b.lots.length) byRoot[C.root] = C; });
  Object.keys(byRoot).sort().forEach(function (rid) {
    var C = byRoot[rid]; if (out.length >= Z.max) return;
    if (out.some(function (S0) { return S0.lots.some(function (L) { return C.lots.some(function (q) { return Math.hypot(L.x - q.x, L.z - q.z) < Math.hypot(D.w, D.d); }); }); })) return;
    var i = out.length, id = c.town + '.spur' + i;
    var lots = C.lots.map(function (q, k) {
      var L = { id: id + '.' + k, lot: 'spur' + i + '.' + k, marker: null, moved: null, town: c.town, kit: D.kit || 'isk', key: Z.key, v: 0, cls: 'poor', role: null, name: null,
        district: 'outside the gate', x: +q.x.toFixed(2), z: +q.z.toFixed(2), y: +q.y.toFixed(2), ry: +q.ry.toFixed(4), w: D.w, d: D.d, h: D.h, yard: null, drop: +q.drop.toFixed(2),
        terrace: null, shore: false, harbour: null, tag: null, wealth: 0, vacant: true, spur: id, closed: true };
      if (c.tags) { var T = c.tags.add({ 'class': 'building', kind: 'lot', key: Z.key, at: [L.x, L.y, L.z], ry: L.ry, size: [D.w, D.d, D.h], note: 'an empty lot on the street outside ' + C.root + ' (closed until the town needs it)', src: 'isle-demo' }); if (T) L.tag = T.id; }
      return L; });
    out.push({ id: id, root: C.root, lane: [[+C.lane[0][0].toFixed(2), +C.lane[0][1].toFixed(2)], [+C.lane[1][0].toFixed(2), +C.lane[1][1].toFixed(2)]], lots: lots, open: false });
  });
  return out;
};
/* THE REFUGEE CAMP'S GROUND (2026-11-04, 47r): a square of `refugees.camp.size` metres outside the town where the ships'
   people pitch until they are housed: the first spot, ring by ring out from the town's edge and round by `step` degrees
   (east first), dry (1.5 m over the sea at its corners and middle), no steeper than `drop` m across, clear of every lot,
   way, wall piece and field of the plan and of its streets outside the gates; registered in core/tags (a feature, kind
   'camp'). -> {x, z, y, size, tag} or null */
ISLE.campSite = function (c) {
  var Rf = ISLE.TUNE.sim && ISLE.TUNE.sim.refugees, K = Rf && Rf.camp; if (!K) return null;
  var h = c.h, half = c.half, sz = K.size, r = sz * 0.75, occ = [], pts = [];
  c.ways.forEach(function (w) { w.pts.forEach(function (p) { pts.push([p[0], p[1], w.w / 2]); }); });
  c.lots.forEach(function (L) { occ.push([L.x, L.z, Math.hypot(L.w, L.d) / 2]); });
  (c.wall || []).forEach(function (Wp) { occ.push([Wp.x, Wp.z, Math.hypot(Wp.w, Wp.d) / 2]); });
  (c.fields || []).forEach(function (Fr) { occ.push([Fr.x, Fr.z, Fr.size * 0.7]); });
  (c.spurs || []).forEach(function (Sp) { Sp.lots.forEach(function (L) { occ.push([L.x, L.z, Math.hypot(L.w, L.d) / 2]); });
    for (var q = 0; q <= 1; q += 0.1) occ.push([Sp.lane[0][0] + (Sp.lane[1][0] - Sp.lane[0][0]) * q, Sp.lane[0][1] + (Sp.lane[1][1] - Sp.lane[0][1]) * q, 3]); });
  var clear = function (x, z) { var i; for (i = 0; i < occ.length; i++) if (Math.hypot(occ[i][0] - x, occ[i][1] - z) < occ[i][2] + r) return false;
    for (i = 0; i < pts.length; i++) if (Math.hypot(pts[i][0] - x, pts[i][1] - z) < pts[i][2] + r) return false; return true; };
  var cx = 0, cz = 0; c.lots.forEach(function (L) { cx += L.x; cz += L.z; }); cx /= Math.max(1, c.lots.length); cz /= Math.max(1, c.lots.length);
  var ext = 0; c.lots.forEach(function (L) { ext = Math.max(ext, Math.hypot(L.x - cx, L.z - cz)); });
  for (var d = ext + 40; d < ext + K.reach; d += 40) for (var a = 0; a < 360; a += K.step) {
    var x = cx + Math.cos(a * Math.PI / 180) * d, z = cz + Math.sin(a * Math.PI / 180) * d; if (Math.abs(x) > half - sz || Math.abs(z) > half - sz) continue;
    var ys = [[0, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (o) { return h(x + o[0] * sz / 2, z + o[1] * sz / 2); }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y0 < 1.5 || y1 - y0 > K.drop || !clear(x, z)) continue;
    var S = { x: +x.toFixed(2), z: +z.toFixed(2), y: +ys[0].toFixed(2), size: sz, tag: null };
    if (c.tags) { var T = c.tags.add({ 'class': 'feature', kind: 'camp', key: 'refugee camp', at: [S.x, S.y, S.z], ry: 0, size: [sz, sz, 0], note: 'the refugee camp\'s ground (empty until a ship comes)', src: 'isle-demo' }); if (T) S.tag = T.id; }
    return S;
  }
  return null;
};

