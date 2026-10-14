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
  /* the exact-streets rule (TUNE.exact, opt-in): every standing building (not a civic one or a landmark: the routes keep
     off those) whose footprint the carriageway reaches is knocked out too, not only those whose lot cells it crossed */
  if (TUNE.exact && cls !== 'alley') SL.underWay(P, w).forEach(function (L) { if (knocked.indexOf(L) < 0) knocked.push(L); });
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
  if (TUNE.exact) SL.roads.addWay(way);
  return way;
};
/* the standing buildings (not civic, not landmarks) whose footprints a carriageway of width w along P reaches */
SL.underWay = function (P, w) {
  var out = [];
  for (var i = 1; i < P.length; i++) {
    var a = P[i - 1], b = P[i], m = V.lerp(a, b, 0.5), q = obb(m, V.norm(V.sub(b, a)), V.dist(a, b) / 2 + w / 2, w / 2);
    SL.index.all(q).forEach(function (L) { if (!L.civic && L.cls !== 'landmark' && out.indexOf(L) < 0 && polySegDist(obbCorners(L.bo), a, b) < w / 2 - 0.05) out.push(L); });
  }
  return out;
};
/* the exact-streets rule in tryLot: a building whose footprint reaches any way's carriageway */
SL.streetHit = function (bo) {
  var C = obbCorners(bo), r = Math.hypot(bo.hw, bo.hd), H = SL.roads.sp.query(bo.c[0], bo.c[1], r);
  for (var i = 0; i < H.length; i++) { var s = H[i]; if (s.way.dead) continue; if (polySegDist(C, s.a, s.b) < s.hw - 0.05) return s.way; }
  return null;
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
  /* opt-in (15-city-ground.js): the world's ground predicate, then the stance; a world that sets neither is unchanged */
  if (SL.groundOk && !SL.groundOk(bo, { way: way, side: side, s: s, item: item, cls: cls })) return { fail: { code: -2 } };
  if (TUNE.exact && SL.streetHit(bo)) return { fail: { code: OCC.STREET } };
  var st = TUNE.stance ? KCITY.lotStance(TUNE.stance, bo, item, way, side, s) : null;
  if (TUNE.stance && !st) return { fail: { code: -3 } };
  var L = {
    id: PLAN.lots.length, cls: cls, key: item.key, v: item.v, slot: extra && extra.slot || 0, wealth: extra && extra.wealth != null ? extra.wealth : 0.5,
    x: g.bc[0], z: g.bc[1], y: 0, ry: ryFacing(V.mul(g.n, -1)), w: item.w, d: item.d, h: item.h,
    lot: g.o, way: way.id, side: side, s: s, born: step, died: null, run: extra && extra.run, civic: cls === 'civic'
  };
  L.y = st ? st.y : (extra && extra.padded) ? CG.pad(bo, 12) : CG.foot(bo);
  if (st) L.drop = st.drop;
  L.bo = bo;
  PLAN.lots.push(L);
  R.stampPoly(obbCorners(g.o), cls === 'civic' ? OCC.HARD : OCC.LOT, L.id);
  SL.hashLot(L);
  SL.register(L);
  return L;
};
/* standing building footprints, for the exact overlap test: the bound instance's box index (12-city-index.js), on
   KSPACE. SL.HASH is the same index's old 40 m bucket Map ('x,z' -> lots), kept only for readers that still walk it
   (Voth's simulation fragments, 42-vc-sim-places.js) */
SL.index = KCITY.boxIndex({ legacy: true });
SL.HASH = SL.index.legacy;
SL.hkey = function (x, z) { return Math.floor(x / 40) + ',' + Math.floor(z / 40); };
SL.hashLot = function (L) { SL.index.add(L); };
/* core/tags (opt-in: KCITY.create({tags})): a placed lot becomes a building record before anything draws it; a lot
   knocked out is removed (its id is never reused). A world that pushes lots itself calls SL.register(L) too */
SL.tags = null;
SL.register = function (L) {
  if (!SL.tags || L.tag) return;
  var r = SL.tags.add({ 'class': L.civic || L.cls === 'landmark' ? 'landmark' : 'building', key: L.key, at: [L.x, L.y, L.z], ry: L.ry, size: [L.w, L.d, L.h || 0],
    note: L.cls, src: 'core/city' });
  if (r) L.tag = r.id;
};
SL.pen = function (A, B) {
  var m = Infinity, axes = [A.u, A.v, B.u, B.v];
  for (var i = 0; i < 4; i++) {
    var ax = axes[i], pr = function (F) { return Math.abs(F.u[0] * ax[0] + F.u[1] * ax[1]) * F.hw + Math.abs(F.v[0] * ax[0] + F.v[1] * ax[1]) * F.hd; };
    m = Math.min(m, pr(A) + pr(B) - Math.abs((B.c[0] - A.c[0]) * ax[0] + (B.c[1] - A.c[1]) * ax[1]));
  }
  return m;
};
/* the first standing building whose footprint overlaps bo by more than 0.1 m, of any size (the index files each
   footprint whole: the old 40 m probe missed big ones, Voth's VC.clashWide is folded in here); skip(L) passes over */
SL.clash = function (bo, skip) { return SL.index.hit(bo, skip); };
SL.killLot = function (L, step) {
  L.died = step;
  SL.R.clearOwner(obbCorners(L.lot), L.id, OCC.LOT);
  if (SL.tags && L.tag) SL.tags.remove(L.tag);
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
    if (best && bd > 2.2) G.art = { key: key, x: best[0], z: best[1], y: CG.h(best[0], best[1]), ry: Math.atan2(o.v[0], o.v[1]) };
  }
  PLAN.greens.push(G);
  return G;
};

/* ---------------------------------------------------------------- wealth and the choosers */
/* the defaults a world replaces with its own (rules.wealth, rules.choosers; Voth's are 32-vc-city.js): wealth falls from
   the plan's centre (TUNE.centre, else the build zone's middle) to the edge of the zone, with a little noise; the
   choosers draw by wealth only. The toy's (a triangle of landmarks, a walled radial city) are KCITY.radial.rules */
SL.wallR = function (p) {   /* how far the city reaches from its centre in p's direction: the toy's wall, else TUNE.reach (800) */
  var t = Math.atan2(p[1], p[0]), k = Math.round(((t + Math.PI) / (2 * Math.PI)) * 720) % 720;
  return PLAN.wall && PLAN.wall.rad ? PLAN.wall.rad[k] : (TUNE.reach == null ? 800 : TUNE.reach);
};
SL.centre = function () { return TUNE.centre || (PLAN.zone ? polyCentroid(PLAN.zone) : [0, 0]); };
SL.wealth = function (p) {
  var c = SL.centre(), r = V.dist(p, c);
  return clamp(0.8 - 0.6 * smooth(0, SL.wallR(V.sub(p, c)), r) + 0.13 * slFbm(p[0] / 110 + 40, p[1] / 110 - 13, 2), 0, 1);
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
  avenue: function (p, rs) {
    var W = SL.wealth(p);
    if (W > 0.72) return SL.draw(rs, { rich: 0.70, middle: 0.24, manor: W > 0.85 ? 0.06 : 0 });
    if (W > 0.45) return SL.draw(rs, { rich: 0.35, middle: 0.52, shop: 0.13 });
    return SL.draw(rs, { middle: 0.55, poor: 0.28, shop: 0.17 });
  },
  main: function (p, rs) {
    var W = SL.wealth(p), rich = smooth(0.55, 0.92, W) * 0.8, poor = smooth(0.52, 0.12, W) * 0.85, mid = Math.max(0.05, 1 - rich - poor), home = 0.84;
    return SL.draw(rs, { shop: 0.12, tavern: 0.04, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  side: function (p, rs) {
    var W = SL.wealth(p), rich = smooth(0.6, 0.95, W) * 0.7, poor = smooth(0.55, 0.15, W) * 0.9, mid = Math.max(0.05, 1 - rich - poor), home = 0.92;
    return SL.draw(rs, { shop: 0.08, rich: home * rich, middle: home * mid, poor: home * poor });
  },
  alley: function (p, rs) {
    var W = SL.wealth(p);
    return SL.draw(rs, { poor: 0.62 - 0.3 * W, middle: 0.18 + 0.3 * W, shop: 0.08, industrial: 0.12 });
  }
};

/* march along one side of a way putting lots on it. Where the bend makes a lot overlap the one before it on
   the same run, that frontage is knocked out (rule 9) and remembered for the side streets (rule 10). */
SL.lineLots = function (way, side, chooser, step, opt) {
  opt = opt || {};
  var F = way.F, rs = SL.stream(step * 100000 + way.id * 2 + (side > 0 ? 1 : 0)), Lt = TUNE.lot;
  var run = 'r' + step + '.' + way.id + '.' + side, s0 = opt.s0 != null ? opt.s0 : 0, s1 = opt.s1 != null ? opt.s1 : F.len, made = [], k0 = null;
  function closeKnock(sEnd) { if (k0 != null) { PLAN.knocks.push({ way: way.id, side: side, s0: k0, s1: sEnd, born: step, used: false }); k0 = null; } }
  /* the cursor (KCITY.prim.frontageRun, 33-city-strategies.js) */
  KCITY.prim.frontageRun({ t0: s0, t1: s1 - 4,
    /* a page may leave frontage open (a sparse suburb): SL.vacant(p, rs) skips ahead */
    skip: function (s) { if (SL.vacant && SL.vacant(F.at(s), rs)) { closeKnock(s); return 12; } return 0; },
    attempt: function (s) {
      var p = F.at(s), cls = chooser(p, rs), cands = SL.cands(rs, cls), W = SL.wealth(p), placed = null, curve = false;
      for (var i = 0; i < cands.length && !placed; i++) {
        var it = cands[i].it, wid = it.w + Lt.side;
        if (s + wid > s1) continue;
        if (opt.entrance && opt.entrance(rs, it)) { placed = SL.reserveEntrance(way, side, s, step); break; }
        var r = SL.tryLot(way, side, s + wid / 2, it, step, cands[i].cls, { wealth: W, slot: rs.ri(0, 1), run: run });
        if (!r.fail) { placed = r; made.push(r); }
        else if (r.fail.code === OCC.LOT && PLAN.lots[r.fail.own] && PLAN.lots[r.fail.own].run === run) curve = true;
      }
      if (placed) { closeKnock(s); return { adv: placed.entranceW || (placed.w + Lt.side), rec: placed }; }
      if (curve && k0 == null) k0 = s; if (!curve) closeKnock(s);
      return { adv: Lt.step };
    },
    end: closeKnock });
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
