/* ============================== 3. THE PLAN: WAYS, LOTS, GREENS ============================== */
/* [G data] The plan is plain records. Each carries `born` (the step that made it) and lots carry `died`
   (the step that knocked them out), so the host can show the city as it stood after any step.

   way   {id, cls: avenue|main|side|alley|highway, w, pts, closed, born, F (arc-length frame)}
   lot   {id, cls, key, v, slot, wealth, x, z, y, ry, w, d, h, lot (OBB), way, side, s, born, died, civic}
   green {id, kind: park|plaza|market|muster, poly, district, art: {key, x, z, ry}, born}
   knock {way, side, s0, s1, born, used}: frontage lost to street curvature, kept for side streets (10)
   gate  {p, dir, born} */
var PLAN = null;
SL.newPlan = function () {
  PLAN = { civics: [], landmarks: [], districts: [], wall: null, gates: [], ways: [], lots: [], greens: [], knocks: [], entrances: [], stats: {}, log: [] };
  return PLAN;
};
SL.note = function (step, msg) { PLAN.log.push('[' + step + '] ' + msg); };

/* ---------------------------------------------------------------- ways */
SL.addWay = function (cls, pts, step, opt) {
  opt = opt || {};
  var R = SL.R, w = TUNE.width[cls];
  var P = resample(pts, 2, !!opt.closed);
  if (opt.closed) P = P.concat([P[0]]);
  var way = { id: PLAN.ways.length, cls: cls, w: w, pts: P, closed: !!opt.closed, born: step, F: plFrame(P), tag: opt.tag || '' };
  PLAN.ways.push(way);
  if (cls === 'highway' && !opt.stamp) return way;        /* outside the walls: not on the raster (unless asked) */
  /* 1. lots the street runs through are knocked out (rule 8) */
  var hit = {};
  if (cls !== 'alley') for (var i = 1; i < P.length; i++) R.eachNearSeg(P[i - 1], P[i], w / 2 + 0.6, function (k) { if (R.occ[k] === OCC.LOT) hit[R.own[k]] = 1; });
  var knocked = Object.keys(hit).map(Number).map(function (id) { return PLAN.lots[id]; }).filter(function (L) { return L && L.died == null; });
  knocked.forEach(function (L) { SL.killLot(L, step); });
  /* 2. stamp the street, and its distance field for the spacing rule */
  var code = cls === 'alley' ? OCC.ALLEY : OCC.STREET, band = w / 2 + SL.minSpacing + 2;
  for (var j = 1; j < P.length; j++) {
    R.eachNearSeg(P[j - 1], P[j], band, function (k, d) {
      if (d <= w / 2) {
        var c = R.occ[k];
        /* a street takes any cell; an alley only open ground (it was routed round the lots) */
        if (code === OCC.STREET ? c !== OCC.HARD : (c === OCC.FREE || c === OCC.RESERVE || c === OCC.GREEN)) { R.occ[k] = code; R.own[k] = way.id; }
      }
      if (cls !== 'alley' && d < R.sd[k]) { R.sd[k] = d; R.sdw[k] = way.id; }
    });
  }
  /* 3. what can be saved of each knocked lot: a smaller lot, else park and plaza */
  knocked.forEach(function (L) { SL.salvage(L, way, step); });
  way.knocked = knocked.length;
  return way;
};

/* ---------------------------------------------------------------- lots */
SL.lotOBB = function (way, side, s, item) {
  var F = way.F, Lt = TUNE.lot, W = item.w + Lt.side, D = item.d + Lt.setback + Lt.rear;
  var p = F.at(s), t = F.tan(s, Math.max(2, W / 2)), n = V.mul(V.perp(t), side);
  var c = V.add(p, V.mul(n, way.w / 2 + D / 2));
  var bc = V.add(p, V.mul(n, way.w / 2 + Lt.setback + item.d / 2));
  return { o: obb(c, t, W / 2, D / 2), bc: bc, n: n, W: W, D: D };
};
/* try to put `item` on `way` at arc length s (the lot's middle). Returns the lot, or {fail: blocking cell} */
SL.tryLot = function (way, side, s, item, step, cls, extra) {
  var g = SL.lotOBB(way, side, s, item), R = SL.R;
  if (s - g.W / 2 < 0 || s + g.W / 2 > way.F.len) return { fail: { code: -1 } };
  var hit = R.blockedRect(g.o, TUNE.lot.inset);
  if (hit) return { fail: hit };
  var bo = obb(g.bc, g.o.u, item.w / 2, item.d / 2);
  /* exact: the raster samples cell centres, so on a bend a corner wedge can slip between them */
  var clash = SL.clash(bo);
  if (clash) return { fail: { code: OCC.LOT, own: clash.id } };
  var L = {
    id: PLAN.lots.length, cls: cls, key: item.key, v: item.v, slot: extra && extra.slot || 0, wealth: extra && extra.wealth != null ? extra.wealth : 0.5,
    x: g.bc[0], z: g.bc[1], y: 0, ry: ryFacing(V.mul(g.n, -1)), w: item.w, d: item.d, h: item.h,
    lot: g.o, way: way.id, side: side, s: s, born: step, died: null, run: extra && extra.run, civic: cls === 'civic'
  };
  L.y = (extra && extra.padded) ? addPad(bo, 12) : baseY(bo);
  L.bo = bo;
  PLAN.lots.push(L);
  R.stampPoly(obbCorners(g.o), cls === 'civic' ? OCC.HARD : OCC.LOT, L.id);
  SL.hashLot(L);
  return L;
};
/* a 40 m spatial hash of standing building footprints, for the exact overlap test */
SL.HASH = new Map();
SL.hkey = function (x, z) { return Math.floor(x / 40) + ',' + Math.floor(z / 40); };
SL.hashLot = function (L) { var k = SL.hkey(L.x, L.z); (SL.HASH.get(k) || SL.HASH.set(k, []).get(k)).push(L); };
SL.pen = function (A, B) {
  var m = Infinity, axes = [A.u, A.v, B.u, B.v];
  for (var i = 0; i < 4; i++) {
    var ax = axes[i], pr = function (F) { return Math.abs(F.u[0] * ax[0] + F.u[1] * ax[1]) * F.hw + Math.abs(F.v[0] * ax[0] + F.v[1] * ax[1]) * F.hd; };
    m = Math.min(m, pr(A) + pr(B) - Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]));
  }
  return m;
};
SL.clash = function (bo) {
  var gx = Math.floor(bo.c[0] / 40), gz = Math.floor(bo.c[1] / 40), hit = null;
  for (var dx = -1; dx <= 1 && !hit; dx++) for (var dz = -1; dz <= 1 && !hit; dz++) {
    var list = SL.HASH.get((gx + dx) + ',' + (gz + dz)); if (!list) continue;
    for (var i = 0; i < list.length; i++) { var L = list[i]; if (L.died == null && L.bo && SL.pen(bo, L.bo) > 0.1) { hit = L; break; } }
  }
  return hit;
};
SL.killLot = function (L, step) {
  L.died = step;
  SL.R.clearOwner(obbCorners(L.lot), L.id, OCC.LOT);
};

/* rule 8: a lot a street ran through is split by the street. Each remnant takes the largest building of its
   class (or the class below) that fits; a remnant that takes none becomes green: the larger remnant a park,
   the smaller a plaza with a fountain or a piece of public art. */
SL.salvage = function (L, way, step) {
  var o = L.lot, R = SL.R, P = way.pts, a = Infinity, b = -Infinity, hw = way.w / 2 + 0.4;
  for (var i = 0; i < P.length; i++) {
    var dx = P[i][0] - o.c[0], dz = P[i][1] - o.c[1], u = dx * o.u[0] + dz * o.u[1], v = dx * o.v[0] + dz * o.v[1];
    if (Math.abs(v) <= o.hd + hw && Math.abs(u) <= o.hw + hw) { a = Math.min(a, u - hw); b = Math.max(b, u + hw); }
  }
  if (!(a < b)) { a = b = 0; }
  var pieces = [[-o.hw, Math.max(-o.hw, a)], [Math.min(o.hw, b), o.hw]].map(function (r) { return { u0: r[0], u1: r[1], wid: r[1] - r[0] }; })
    .filter(function (p) { return p.wid > 2.5; });
  var parent = PLAN.ways[L.way], unfit = [];
  pieces.forEach(function (p) {
    var placed = null, cls = L.cls === 'civic' ? 'rich' : L.cls;
    for (var guard = 0; cls && !placed && guard < 4; guard++) {
      var items = SL.items(cls).filter(function (it) { return it.w + TUNE.lot.side <= p.wid && it.d <= L.d + 4; })
        .sort(function (m, n) { return n.w - m.w; });
      for (var k = 0; k < items.length && !placed; k++) {
        var it = items[k], sc = L.s + (p.u0 + p.u1) / 2;
        /* hug the remnant's outer edge, so the new lot keeps clear of the street */
        sc = (p.u0 < 0) ? L.s + p.u0 + (it.w + TUNE.lot.side) / 2 : L.s + p.u1 - (it.w + TUNE.lot.side) / 2;
        var r = SL.tryLot(parent, L.side, sc, it, step, cls, { wealth: L.wealth, slot: L.slot });
        if (!r.fail) { placed = r; r.replaces = L.id; }
      }
      cls = TUNE.fallback[cls];
    }
    if (!placed) unfit.push(p);
  });
  if (!unfit.length) return;
  var all = pieces.length ? pieces : [{ u0: -o.hw, u1: o.hw, wid: 2 * o.hw }];
  var big = all.reduce(function (m, p) { return p.wid > m.wid ? p : m; }, all[0]);
  unfit.forEach(function (p) {
    var kind = (p === big && all.length > 1) || (all.length === 1 && p.wid > 9) ? 'park' : 'plaza';
    var c = V.add(o.c, V.mul(o.u, (p.u0 + p.u1) / 2));
    var g = obb(c, o.u, p.wid / 2, o.hd);
    SL.addGreen(kind, obbCorners(g), step, L.wealth, L.cls, g);
  });
};

SL.district = function (wealth, cls) { return cls === 'shop' || cls === 'tavern' ? 'commerce' : wealth > 0.66 ? 'rich' : wealth > 0.33 ? 'middle' : 'poor'; };
SL.addGreen = function (kind, poly, step, wealth, cls, o) {
  var R = SL.R, G = { id: PLAN.greens.length, kind: kind, poly: poly, born: step, district: SL.district(wealth == null ? 0.5 : wealth, cls), art: null };
  /* a green lies under any street already there: stamp only the open ground */
  R.eachInPoly(poly, function (k) { var c = R.occ[k]; if (c === OCC.FREE || c === OCC.RESERVE) { R.occ[k] = OCC.GREEN; R.own[k] = -2 - G.id; } });
  if (kind === 'plaza' && o) {
    var rs = SL.stream(9000 + G.id), key = rs.pick(TUNE.plazaArt[G.district]);
    /* the art stands in the plaza's open middle, clear of the street that made it */
    var best = null, bd = -1;
    for (var a = -0.6; a <= 0.6; a += 0.2) for (var b2 = -0.6; b2 <= 0.6; b2 += 0.2) {
      var p = V.add(V.add(o.c, V.mul(o.u, a * o.hw)), V.mul(o.v, b2 * o.hd));
      var d = R.sd[R.idx(p[0], p[1])] - TUNE.width.main / 2;
      if (R.at(p[0], p[1]) === OCC.GREEN && d > bd) { bd = d; best = p; }
    }
    if (best && bd > 2.2) G.art = { key: key, x: best[0], z: best[1], y: terrainH(best[0], best[1]), ry: Math.atan2(o.v[0], o.v[1]) };
  }
  PLAN.greens.push(G);
  return G;
};

/* ---------------------------------------------------------------- wealth and the choosers */
SL.wallR = function (p) {   /* the wall's distance from the centre in p's direction */
  var t = Math.atan2(p[1], p[0]), k = Math.round(((t + Math.PI) / (2 * Math.PI)) * 720) % 720;
  return PLAN.wall ? PLAN.wall.rad[k] : 800;
};
SL.wealth = function (p) {
  var r = V.len(p), Rw = SL.wallR(p), W;
  if (inPoly(p, PLAN.triWide)) W = 1;
  else W = 1 - smooth(PLAN.coreR, Rw * 0.98, r) * 0.95;
  PLAN.civics.forEach(function (L) { if (L.died == null) { var d = Math.hypot(L.x - p[0], L.z - p[1]); W += 0.3 * Math.exp(-d / 70); } });
  W += 0.13 * slFbm(p[0] / 110 + 40, p[1] / 110 - 13, 2);
  return clamp(W, 0, 1);
};
SL._items = {};
SL.items = function (cls) {
  if (SL._items[cls]) return SL._items[cls];
  return (SL._items[cls] = (TUNE.classes[cls] || []).map(function (kv) { return SL.dims(kv[0], kv[1]); }).filter(Boolean));
};
/* weighted draw from {cls: weight} */
SL.draw = function (rs, W) { var t = 0, k; for (k in W) t += W[k]; var x = rs.rnd() * t; for (k in W) { x -= W[k]; if (x <= 0) return k; } return k; };
/* the candidates for one lot, best first: a drawn class, then smaller pieces of it, then the class below */
SL.cands = function (rs, cls) {
  var out = [], first = rs.pick(SL.items(cls)); out.push({ cls: cls, it: first });
  for (var c = cls, g = 0; c && g < 4; g++) {
    SL.items(c).slice().sort(function (a, b) { return a.w - b.w; }).forEach(function (it) { if (it !== first && it.w < first.w) out.push({ cls: c, it: it }); });
    c = TUNE.fallback[c];
  }
  return out.slice(0, 6);
};
SL.choosers = {
  /* 7: the avenues: predominantly, not uniformly, wealthy near the civic buildings and inside the triangle */
  avenue: function (p, rs) {
    var W = SL.wealth(p);
    if (W > 0.72) return SL.draw(rs, { rich: 0.70, middle: 0.24, manor: W > 0.85 ? 0.06 : 0 });
    if (W > 0.45) return SL.draw(rs, { rich: 0.35, middle: 0.52, shop: 0.13 });
    return SL.draw(rs, { middle: 0.55, poor: 0.28, shop: 0.17 });
  },
  /* 9: main streets: wealth falls from the centre, shops prefer it, industry keeps to the edges */
  main: function (p, rs) {
    var W = SL.wealth(p), r = V.len(p), rel = r / SL.wallR(p);
    var shop = 0.07 + 0.40 * Math.exp(-r / 280), ind = 0.42 * smooth(0.70, 0.95, rel), tav = 0.035;
    var home = Math.max(0.05, 1 - shop - ind - tav);
    var rich = smooth(0.55, 0.92, W) * 0.8, poor = smooth(0.52, 0.12, W) * 0.85, mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, industrial: ind, tavern: tav, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  /* 11: side streets: quieter, fewer shops */
  side: function (p, rs) {
    var W = SL.wealth(p), r = V.len(p), rel = r / SL.wallR(p);
    var shop = 0.04 + 0.18 * Math.exp(-r / 280), ind = 0.30 * smooth(0.72, 0.95, rel);
    var home = Math.max(0.05, 1 - shop - ind);
    var rich = smooth(0.6, 0.95, W) * 0.7, poor = smooth(0.55, 0.15, W) * 0.9, mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, industrial: ind, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  /* 12: alleys: back-lane cottages and workshops */
  alley: function (p, rs) {
    var W = SL.wealth(p), rel = V.len(p) / SL.wallR(p);
    return SL.draw(rs, { poor: 0.62 - 0.3 * W, middle: 0.18 + 0.3 * W, shop: 0.08, industrial: 0.12 * smooth(0.65, 0.9, rel) });
  }
};

/* march along one side of a way putting lots on it. Where the bend makes a lot overlap the one before it on
   the same run, that frontage is knocked out (rule 9) and remembered for the side streets (rule 10). */
SL.lineLots = function (way, side, chooser, step, opt) {
  opt = opt || {};
  var F = way.F, rs = SL.stream(step * 100000 + way.id * 2 + (side > 0 ? 1 : 0)), Lt = TUNE.lot;
  var run = 'r' + step + '.' + way.id + '.' + side, s = opt.s0 != null ? opt.s0 : 0, s1 = opt.s1 != null ? opt.s1 : F.len, made = [], k0 = null;
  function closeKnock(sEnd) { if (k0 != null) { PLAN.knocks.push({ way: way.id, side: side, s0: k0, s1: sEnd, born: step, used: false }); k0 = null; } }
  while (s < s1 - 4) {
    var p0 = F.at(s);
    /* a page may leave frontage open (a sparse suburb): SL.vacant(p, rs) skips ahead */
    if (SL.vacant && SL.vacant(p0, rs)) { closeKnock(s); s += 12; continue; }
    var p = p0, cls = chooser(p, rs), cands = SL.cands(rs, cls), W = SL.wealth(p), placed = null, curve = false;
    for (var i = 0; i < cands.length && !placed; i++) {
      var it = cands[i].it, wid = it.w + Lt.side;
      if (s + wid > s1) continue;
      if (opt.entrance && opt.entrance(rs, it)) { placed = SL.reserveEntrance(way, side, s, step); break; }
      var r = SL.tryLot(way, side, s + wid / 2, it, step, cands[i].cls, { wealth: W, slot: rs.ri(0, 1), run: run });
      if (!r.fail) { placed = r; made.push(r); }
      else if (r.fail.code === OCC.LOT && PLAN.lots[r.fail.own] && PLAN.lots[r.fail.own].run === run) curve = true;
    }
    if (placed) { closeKnock(s); s += placed.entranceW || (placed.w + Lt.side); }
    else { if (curve && k0 == null) k0 = s; if (!curve) closeKnock(s); s += Lt.step; }
  }
  closeKnock(s);
  return made;
};

/* rule 11: an alley entrance is a lot left open through the frontage, reserved for the alley network */
SL.reserveEntrance = function (way, side, s, step) {
  var Wd = TUNE.width.alley + 2, D = 22, F = way.F;
  var p = F.at(s + Wd / 2), t = F.tan(s + Wd / 2, 3), n = V.mul(V.perp(t), side);
  var c = V.add(p, V.mul(n, way.w / 2 + D / 2)), o = obb(c, t, Wd / 2, D / 2);
  if (SL.R.blockedRect(o, 0.4)) return null;
  SL.R.stampPoly(obbCorners(o), OCC.RESERVE, -1);
  var E = { id: PLAN.entrances.length, way: way.id, side: side, s: s + Wd / 2, street: p, inner: V.add(p, V.mul(n, way.w / 2 + D - 2)), n: n, born: step, used: false };
  PLAN.entrances.push(E);
  return { entranceW: Wd + 1 };
};
