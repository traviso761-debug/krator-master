/* ============================== 2. THE INDEX: FOOTPRINTS, ROAD SEGMENTS AND FIELDS ON KSPACE ============================== */
/* [G data] One spatial index (core/space, KSPACE: exact, insertion-order answers) under the three questions a city
   asks of what it has placed:
     KCITY.boxIndex(opt)   footprints (an OBB `bo` on each record): hit(o) -> the first record whose footprint
                           overlaps o by more than opt.eps (SL.pen). Lots (SL.clash) and Voth's fields use it.
     KCITY.segIndex(opt)   road segments: near(p, r, skip) -> {d (from the road's edge), way} of the nearest way
                           within r (VC.roadNear).
   Both answer exactly: every record is filed under a square that holds it whole (KSPACE.insert with its own radius),
   so a footprint of any size is found (the 40 m hash SL.clash read looked one cell round the centre and missed big
   footprints; Voth wrote VC.clashWide for its farmsteads). Which of several hits comes first is the index's `order`:
     'insertion' (the default)  the first placed;
     'buckets'                  the order the old bucket probe read them in (40 m cells, the 3 x 3 round the centre
                                for footprints, row by row; the scan window for segments), so a world built on the
                                old hash (Voth: its curve test reads which lot a new one ran into) keeps its layout.
                                A hit the old probe could not see comes after every one it could (the wide fix).
   opt.window (buckets only) drops what the old probe could not see as well: Voth's fields keep their old 160 m reach.
   Counts of hits only the exact answer found are in index.stats.wide. */

KCITY.boxIndex = function (opt) {
  opt = opt || {};
  var B = opt.bucket || 40, reach = opt.reach == null ? 1 : opt.reach, eps = opt.eps == null ? 0.1 : opt.eps;
  var sp = KSPACE.create({ cell: opt.cell || B }), seq = 0, tmp = [], win = [], out = [];
  var I = { order: opt.order || 'insertion', legacy: opt.legacy ? new Map() : null, stats: { wide: 0, queries: 0 }, sp: sp };
  /* file a record by its footprint L.bo (centred at L.x, L.z, as every lot is); legacy keeps the old bucket Map too
     (Voth's simulation fragments read SL.HASH) */
  I.add = function (L) {
    var o = L.bo, x = L.x != null ? L.x : o.c[0], z = L.z != null ? L.z : o.c[1];
    var r = o ? Math.hypot(o.hw, o.hd) + Math.hypot(o.c[0] - x, o.c[1] - z) : Infinity;
    sp.insert({ L: L, x: x, z: z, n: seq++ }, x, z, r);
    if (I.legacy) { var k = Math.floor(x / B) + ',' + Math.floor(z / B); (I.legacy.get(k) || I.legacy.set(k, []).get(k)).push(L); }
  };
  I.clear = function () { sp.clear(); seq = 0; if (I.legacy) I.legacy.clear(); I.stats = { wide: 0, queries: 0 }; };
  I.size = function () { return sp.size(); };
  /* the first record (opt.live: standing, died == null) whose footprint overlaps o by more than eps; skip(L) passes over */
  I.hit = function (o, skip) {
    I.stats.queries++;
    var H = sp.query(o.c[0], o.c[1], Math.hypot(o.hw, o.hd), tmp), live = opt.live !== false;
    var ok = function (L) { return !(live && L.died != null) && L.bo && !(skip && skip(L)) && SL.pen(o, L.bo) > eps; };
    if (I.order !== 'buckets') { for (var i = 0; i < H.length; i++) if (ok(H[i].L)) return H[i].L; return null; }
    var gx = Math.floor(o.c[0] / B), gz = Math.floor(o.c[1] / B), w = 2 * reach + 1;
    win.length = 0; out.length = 0;
    for (var k = 0; k < H.length; k++) {
      var e = H[k], dx = Math.floor(e.x / B) - gx, dz = Math.floor(e.z / B) - gz;
      if (Math.abs(dx) <= reach && Math.abs(dz) <= reach) { e.key = ((dx + reach) * w + dz + reach) * 1e9 + e.n; win.push(e); } else out.push(e);
    }
    win.sort(function (a, b) { return a.key - b.key; });
    for (var m = 0; m < win.length; m++) if (ok(win[m].L)) return win[m].L;
    if (opt.window) return null;
    for (var q = 0; q < out.length; q++) if (ok(out[q].L)) { I.stats.wide++; return out[q].L; }
    return null;
  };
  /* every record whose footprint overlaps o by more than eps, in insertion order */
  I.all = function (o, skip) {
    var H = sp.query(o.c[0], o.c[1], Math.hypot(o.hw, o.hd)), res = [], live = opt.live !== false;
    H.forEach(function (e) { var L = e.L; if (!(live && L.died != null) && L.bo && !(skip && skip(L)) && SL.pen(o, L.bo) > eps && res.indexOf(L) < 0) res.push(L); });
    return res;
  };
  return I;
};

/* road segments: each way's segments, filed under the square of their bounding box grown by the half width */
KCITY.segIndex = function (opt) {
  opt = opt || {};
  var B = opt.bucket || 40, sp = KSPACE.create({ cell: opt.cell || B }), seq = 0, tmp = [];
  var I = { order: opt.order || 'insertion', stats: { wide: 0, queries: 0 }, sp: sp };
  I.addWay = function (w) {
    for (var i = 1; i < w.pts.length; i++) {
      var a = w.pts[i - 1], b = w.pts[i], hw = w.w / 2;
      var x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
      var e = { a: a, b: b, hw: hw, way: w, n: seq++, bx0: Math.floor(x0 / B), bx1: Math.floor(x1 / B), bz0: Math.floor(z0 / B), bz1: Math.floor(z1 / B) };
      sp.insert(e, (x0 + x1) / 2, (z0 + z1) / 2, Math.max(x1 - x0, z1 - z0) / 2 + hw);
    }
  };
  I.clear = function () { sp.clear(); seq = 0; I.stats = { wide: 0, queries: 0 }; };
  /* the nearest way within r of p, measured from the road's edge: {d, way} or null. A way with .dead, or the id skip,
     is passed over. Ties (two ways' edges equally near) go to the first in the index's order */
  I.near = function (p, r, skip) {
    I.stats.queries++;
    var H = sp.query(p[0], p[1], r, tmp), best = null, bk = Infinity, bucket = I.order === 'buckets';
    var gx = Math.floor(p[0] / B), gz = Math.floor(p[1] / B), reach = Math.ceil((r + 8) / B);
    for (var i = 0; i < H.length; i++) {
      var s = H[i]; if (s.way.id === skip || s.way.dead) continue;
      var d = segDist(p, s.a, s.b) - s.hw; if (!(d < r)) continue;
      var key = s.n;
      if (bucket) {   /* the old scan: the first cell of its window (x, then z) the segment was filed in, then filing order */
        var fx = Math.max(s.bx0, gx - reach), fz = Math.max(s.bz0, gz - reach);
        if (fx > Math.min(s.bx1, gx + reach) || fz > Math.min(s.bz1, gz + reach)) { if (opt.window) continue; I.stats.wide++; key = 1e15 + s.n; }
        else key = ((fx - gx + reach) * (2 * reach + 1) + (fz - gz + reach)) * 1e9 + s.n;
      }
      if (!best || d < best.d || (d === best.d && key < bk)) { best = { d: d, way: s.way }; bk = key; }
    }
    return best;
  };
  return I;
};
