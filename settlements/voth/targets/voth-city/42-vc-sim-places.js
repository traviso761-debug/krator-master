/* ============================== 5j. THE SIMULATION'S PLACES (phase B) ============================== */
/* [G data] Phase B of SIM-ROADMAP.md (2.3; the owner's brief of 2026-10-12, 1.2 and 1.4): the buildings the citizens
   need, the wells, and every building and open place as a core/simulation place, so phase C's citizens have somewhere
   to work, eat, drink, pray and rest, and the deficits can be read before anyone walks.

   1. THE BUILDINGS (VC.simBuildings, run after the street method and the owner's edits, before the census): the new
      kit models (kits/catalog/krator-master-buildings-voth.js, phase A) go onto the plan, as TUNE.sim.place says:
      - the trades (bakeries, butchers, weavers, breweries, tanneries) take existing lots whose plot holds their model,
        the front kept on the street, spread over the city: each next lot is the one farthest from those its trade has
        taken. A converted lot keeps its plot; its census entry becomes the new building's (TUNE.census.byKey);
      - the east, west and south watchhouses take a house in those parts of the city; the central watchhouse is the
        Fortress's armoury (its interior, 40-vc-interiors.js);
      - the caravanserai stands by the River Gate, placed at step 3 (VC.simCaravanserai), so the streets work round it;
      - the coast-guard berth stands on the water off the Fortress's apron, clear of every bridge, causeway and pier, on
        a stone footing (a prim group the host draws).
   2. THE WELLS (VC.wells, after the park furniture): voth_well on every plaza and market square, along the residential
      streets every TUNE.sim.wells.street m, in every manor's and clan compound's yard; none nearer another than `gap`.
      They are the district art of a 'Wells' district (drawn and inspected as the other furniture).
   3. THE PLACES (VC.simPlaces, after the interiors): every building with an interior (VC.IX units), every canton
      room, every well, park, market and burial ground, and the outdoor work (fields, piers, mines...) becomes a
      SIM.place with its activities (its furniture read through TUNE.sim.furnAct over core/simulation's SIM.FURN_ACT),
      its opening hours, its pull for free time (TUNE.sim.pull), and its work posts with their kind of work. Session 2:
      a piece's capacity by its size (a long counter takes two), seats round a table, the place's `spots` (where people
      stand: before its work pieces, seats, tables and beds), an open place's reach `r` and `wander`, its `workplaces`
      (the census's, for the density overlay's third mode).
   4. THE 90% RULE (VC.simWorkAudit): for every kind of work the census counts, the posts against 90% of its workplaces,
      a short kind named with the buildings that have the most floor to spare for more posts; and the job table.
   Every choice here is ordered by the plan's records; nothing draws a random number. */
VC.SIMB = { log: [], wells: [], placed: {}, places: 0 };

/* ---------------------------------------------------------------- geometry */
VC.simInObb = function (p, o, tol) {
  var dx = p[0] - o.c[0], dz = p[1] - o.c[1];
  return Math.abs(dx * o.u[0] + dz * o.u[1]) <= o.hw + (tol || 0) && Math.abs(dx * o.v[0] + dz * o.v[1]) <= o.hd + (tol || 0);
};
VC.simSegD = function (p, a, b) {
  var vx = b[0] - a[0], vz = b[1] - a[1], L = vx * vx + vz * vz, t = L > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / L)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
};
/* what a person can stand on at (x, z), and its height; null over open water (owner, 2026-10-14: "people stand around
   on the water and walk aimlessly"): a chinampa bed (31b-vc-chinampa.js VC.CHIN.beds: its crowned top), a pier's deck
   (VOTH.PIERS with the `top` its builder records: the harbour's, the fishing docks', the river quays', the ferry
   piers'), a canton's solid stack, a bridge's deck, else the ground where it stands TUNE.sim.stand.dry above the lake */
VC.simStandY = function (x, z) {
  var I = VC.simStandIdx || (VC.simStandIdx = VC.simStandIndex());
  var cell = I.beds[Math.floor(x / I.c) + ',' + Math.floor(z / I.c)];
  if (cell) for (var i = 0; i < cell.length; i++) {
    var b = cell[i], dx = x - b.x, dz = z - b.z, c = Math.cos(b.ry), s = Math.sin(b.ry);
    if (Math.abs(dx * c - dz * s) <= b.bw / 2 && Math.abs(dx * s + dz * c) <= b.bl / 2) return b.top;
  }
  var pc = I.piers[Math.floor(x / I.c) + ',' + Math.floor(z / I.c)];
  if (pc) for (var j = 0; j < pc.length; j++) { var P = pc[j]; if (VC.simSegD([x, z], [P.x0, P.z0], [P.x1, P.z1]) <= P.half) return P.top; }
  if (typeof CANT !== 'undefined' && CANT.list && CANT.list.length) { var M = CANT.at(x, z, 0); if (M) { var st = CANT.stackTop(M, x, z); if (st != null) return st; } }
  var by = VOTH.lifeBridgeY ? VOTH.lifeBridgeY(x, z) : null; if (by != null) return by;
  var h = baseH(x, z); return h >= VOTH.SEA + TUNE.sim.stand.dry ? h : null;
};
VC.simStandIndex = function () {
  var c = 40, beds = {};
  ((VC.CHIN && VC.CHIN.beds) || []).forEach(function (b) {
    var r = Math.hypot(b.bw, b.bl) / 2;
    for (var i = Math.floor((b.x - r) / c); i <= Math.floor((b.x + r) / c); i++) for (var j = Math.floor((b.z - r) / c); j <= Math.floor((b.z + r) / c); j++) (beds[i + ',' + j] = beds[i + ',' + j] || []).push(b);
  });
  var piers = {};
  (VOTH.PIERS || []).forEach(function (P) {
    if (P.top == null) return; var h = (P.deck || P.w) / 2, e = { x0: P.x0, z0: P.z0, x1: P.x1, z1: P.z1, half: h, top: P.top };
    for (var i = Math.floor((Math.min(P.x0, P.x1) - h) / c); i <= Math.floor((Math.max(P.x0, P.x1) + h) / c); i++)
      for (var j = Math.floor((Math.min(P.z0, P.z1) - h) / c); j <= Math.floor((Math.max(P.z0, P.z1) + h) / c); j++) (piers[i + ',' + j] = piers[i + ',' + j] || []).push(e);
  });
  return { c: c, beds: beds, piers: piers };
};
/* where the workers of an open site stand: up to `n` spots on a sunflower spiral of radius R round (x, z) (no random
   draw), each standable with the same surface `W` metres round it on every side, so the wander (core/simulation's
   T.wander: up to W either way in x and z) stays on it; W is halved until spots are found. A site with no standable
   ground within R looks further out (to TUNE.sim.stand.search m) and stands on the nearest. -> { spots, wander, moved } */
VC.simStandSpots = function (x, z, R, W, n) {
  var S = TUNE.sim.stand, same = function (y, q) { var y2 = VC.simStandY(q[0], q[1]); return y2 != null && Math.abs(y2 - y) <= S.step; };
  var ring = function (cx, cz, rad, w) {
    var out = [], N = Math.max(n * 3, 24);
    for (var i = 0; i < N && out.length < n; i++) {
      var r = rad * Math.sqrt((i + 0.5) / N), a = i * 2.399963, px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r, y = VC.simStandY(px, pz);
      if (y == null) continue;
      if (w > 0 && ![[w, 0], [-w, 0], [0, w], [0, -w], [w, w], [-w, -w], [w, -w], [-w, w]].every(function (o) { return same(y, [px + o[0], pz + o[1]]); })) continue;
      out.push([VC.r2(px), VC.r2(pz), VC.r2(y)]);
    }
    return out;
  };
  for (var w = W; ; w = w > 1 ? w / 2 : 0) {
    var sp = ring(x, z, Math.max(R, 1), w);
    if (sp.length >= Math.min(n, S.min) || (w === 0 && sp.length)) return { spots: sp, wander: VC.r2(w), moved: 0 };
    if (w === 0) break;
  }
  /* nothing to stand on within R: the nearest standable point further out (rings every 4 m) */
  for (var d = Math.max(R, 4); d <= S.search; d += 4) {
    var k = Math.max(8, Math.round(2 * Math.PI * d / 4));
    for (var m = 0; m < k; m++) { var px = x + Math.cos(m * 2 * Math.PI / k) * d, pz = z + Math.sin(m * 2 * Math.PI / k) * d, y = VC.simStandY(px, pz);
      if (y != null) { var sp2 = ring(px, pz, Math.min(R, S.near), 0); return { spots: sp2.length ? sp2 : [[VC.r2(px), VC.r2(pz), VC.r2(y)]], wander: 0, moved: Math.round(d) }; } }
  }
  return { spots: [], wander: 0, moved: -1 };
};
/* a lot's plot holding another kit model, its front kept where the old building's was (else centred in the plot) */
VC.simFit = function (L, key) {
  var D = SL.dims(key, 0); if (!D || !L.lot || L.died != null) return null;
  var f = [Math.sin(L.ry), Math.cos(L.ry)], tries = [V.add([L.x, L.z], V.mul(f, (L.d - D.d) / 2)), L.lot.c];
  for (var i = 0; i < tries.length; i++) {
    var bo = obb(tries[i], V.perp(f), D.w / 2, D.d / 2);
    if (obbCorners(bo).every(function (p) { return VC.simInObb(p, L.lot, 0.3); }) && !VC.simHitOther(bo, L)) return { D: D, bo: bo };
  }
  return null;
};
/* a footprint against every other standing building (a plot is not exclusive: a neighbour's building may reach into it) */
VC.simHitOther = function (bo, L) {
  var gx = Math.floor(bo.c[0] / 40), gz = Math.floor(bo.c[1] / 40);
  for (var dx = -2; dx <= 2; dx++) for (var dz = -2; dz <= 2; dz++) {
    var list = SL.HASH.get((gx + dx) + ',' + (gz + dz)); if (!list) continue;
    for (var i = 0; i < list.length; i++) { var Q = list[i]; if (Q !== L && Q.died == null && Q.bo && SL.pen(bo, Q.bo) > 0.1) return Q; }
  }
  return null;
};
VC.simConvert = function (L, key, cls, role) {
  var F = VC.simFit(L, key); if (!F) return false;
  L.was = L.key + ' v' + L.v; L.key = key; L.v = 0; L.slot = 0; L.w = F.D.w; L.d = F.D.d; L.h = F.D.h; L.bo = F.bo; L.x = F.bo.c[0]; L.z = F.bo.c[1];
  L.cls = cls; L.role = role; SL.hashLot(L);
  return true;
};
/* the lots of the city proper (not the country, not a canton deck) and their middle */
VC.simCity = function () {
  var Z = PLAN.lots.filter(function (L) { return L.died == null && !L.country && !L.deck; }), c = [0, 0];
  Z.forEach(function (L) { c[0] += L.x; c[1] += L.z; }); c = [c[0] / Math.max(1, Z.length), c[1] / Math.max(1, Z.length)];
  return { lots: Z, c: c };
};

/* ---------------------------------------------------------------- 1. the buildings */
VC.simBuildings = function () {
  var P = TUNE.sim.place, C = VC.simCity(), log = [], taken = {};
  VC.SIMB.placed = { trades: {}, watch: [], caravanserai: null, berth: null };
  /* the trades, spread: each next lot the farthest from those this trade holds (the first, the nearest the middle) */
  P.trades.forEach(function (tr) {
    var cand = PLAN.lots.filter(function (L) { return L.died == null && !L.deck && !L.power && !L.role && tr.from.indexOf(L.cls) >= 0 && !taken[L.id] && (!L.country || /village|suburb/.test(L.country)) && VC.simFit(L, tr.key); });   /* never a power house, the garrison's, an armoury */
    var got = [];
    for (var k = 0; k < tr.n && cand.length; k++) {
      var best = null, bs = -Infinity;
      cand.forEach(function (L) {
        if (taken[L.id]) return;
        var s = got.length ? Math.min.apply(null, got.map(function (g) { return Math.hypot(g.x - L.x, g.z - L.z); })) : -Math.hypot(L.x - C.c[0], L.z - C.c[1]);
        if (s > bs || (s === bs && best && L.id < best.id)) { bs = s; best = L; }
      });
      if (!best || !VC.simConvert(best, tr.key, tr.cls, 'trade')) break;
      taken[best.id] = 1; got.push(best);
    }
    VC.SIMB.placed.trades[tr.key] = got.map(function (L) { return L.id; });
    log.push(got.length + (got.length < tr.n ? ' of ' + tr.n : '') + ' ' + (tr.plural || ((ASSET_BY_KEY[tr.key] || {}).name || tr.key).toLowerCase()));
  });
  /* the watchhouses: a house near the east, west and south of the city */
  var W = P.watch;
  Object.keys(W.dirs).forEach(function (name) {
    var d = W.dirs[name], ext = C.lots.map(function (L) { return (L.x - C.c[0]) * d[0] + (L.z - C.c[1]) * d[1]; }).sort(function (a, b) { return a - b; });
    var reach = ext[Math.floor(ext.length * 0.97)] || 0, t = [C.c[0] + d[0] * reach * W.at, C.c[1] + d[1] * reach * W.at];
    var best = null, bd = Infinity;
    C.lots.forEach(function (L) { if (taken[L.id] || L.role || L.power || W.from.indexOf(L.cls) < 0) return; var dd = Math.hypot(L.x - t[0], L.z - t[1]); if (dd < bd && VC.simFit(L, W.key)) { bd = dd; best = L; } });
    if (best && VC.simConvert(best, W.key, 'civic', 'watchhouse')) { taken[best.id] = 1; best.watch = name; VC.SIMB.placed.watch.push({ name: name, lot: best.id }); }
  });
  log.push(VC.SIMB.placed.watch.length + ' watchhouses (' + VC.SIMB.placed.watch.map(function (w) { return w.name; }).join(', ') + '; the central one is the Fortress’s armoury)');
  /* a chapel in each village (owner, 2026-10-12: "a house size chapel that can go in the villages"): the house nearest its green */
  var CH = P.chapel; VC.SIMB.placed.chapels = [];
  PLAN.districts.forEach(function (D) {
    if (D.kind !== 'village' || !D.poly) return;
    var g = polyCentroid(D.poly), best = null, bd = Infinity;
    PLAN.lots.forEach(function (L) { if (L.died != null || taken[L.id] || L.role || !/village/.test(L.country || '')) return; var dd = Math.hypot(L.x - g[0], L.z - g[1]); if (dd < bd && VC.simFit(L, CH.key)) { bd = dd; best = L; } });
    if (best && VC.simConvert(best, CH.key, 'civic', 'chapel')) { taken[best.id] = 1; VC.SIMB.placed.chapels.push({ village: D.name, lot: best.id, d: Math.round(bd) }); }
  });
  log.push(VC.SIMB.placed.chapels.length + ' village chapels (' + VC.SIMB.placed.chapels.map(function (c) { return c.village; }).join(', ') + ')');
  (VC.SIMB.temples || []).forEach(function (t) { log.push(t.lot != null ? ((ASSET_BY_KEY[t.key] || {}).name + ' on the ' + t.side + ' side') : ('no ' + t.key + ': ' + t.why)); });
  /* the caravanserai stood at step 3 (VC.simCaravanserai) */
  if (VC.SIMB.cv) { VC.SIMB.placed.caravanserai = VC.SIMB.cv.lot; log.push(VC.SIMB.cv.log); } else log.push('no caravanserai (' + (VC.SIMB.cvWhy || 'not placed') + ')');
  /* the coast-guard berth: on the water off the Fortress's apron, the side nearest the city first */
  var BT = P.berth, M = CANT.by[BT.canton], DB = SL.dims(BT.key, 0);
  if (M && DB) {
    var R0 = (M.apron ? M.apron.ro : M.r) + BT.off + DB.d / 2, toC = Math.atan2(C.c[1] - M.z, C.c[0] - M.x), segs = [];
    CANT.spans.forEach(function (s) { if (s.ok !== false) segs.push([[s.ax, s.az], [s.bx, s.bz], s.w / 2]); });
    (CANT.causewayList || []).forEach(function (cw) { for (var k = 1; k < cw.pts.length; k++) segs.push([cw.pts[k - 1], cw.pts[k], cw.width / 2]); });
    (VOTH.PIERS || []).forEach(function (q) { segs.push([[q.x0, q.z0], [q.x1, q.z1], (q.w || 6) / 2]); });
    Object.keys(VC.FP || {}).forEach(function (id) { var F = VC.FP[id]; if (F.root && F.tip) segs.push([F.root, F.tip, 3]); });
    var angs = []; for (var s2 = 0; s2 < 48; s2++) angs.push(toC + (s2 % 2 ? 1 : -1) * Math.ceil(s2 / 2) * Math.PI / 24);
    var spot = null;
    angs.some(function (an) {
      var out = [Math.cos(an), Math.sin(an)], c = [M.x + out[0] * R0, M.z + out[1] * R0], o = obb(c, V.perp(out), DB.w / 2, DB.d / 2), pts = obbCorners(o).concat([c]);
      if (pts.some(function (q) { return VOTH.terrainHe(q[0], q[1]) > VOTH.SEA - BT.depth; })) return false;
      if (CANT.list.some(function (N) { return N !== M && Math.hypot(N.x - c[0], N.z - c[1]) < (N.apron ? N.apron.ro : N.r) + Math.max(DB.w, DB.d); })) return false;
      if (segs.some(function (sg) { return pts.some(function (q) { return VC.simSegD(q, sg[0], sg[1]) < sg[2] + 10; }) || VC.simSegD(c, sg[0], sg[1]) < sg[2] + Math.max(DB.w, DB.d) / 2 + 6; })) return false;
      spot = { c: c, out: out, o: o }; return true;
    });
    if (spot) {
      var y = VOTH.SEA + BT.deckY, ry = Math.atan2(spot.out[0], spot.out[1]);   /* its front (the slip's mouth) out to the water */
      var Lb = { id: PLAN.lots.length, cls: 'civic', role: 'berth', key: BT.key, v: 0, slot: 0, wealth: 0.6, x: spot.c[0], z: spot.c[1], y: y, ry: ry, w: DB.w, d: DB.d, h: DB.h,
                 lot: VC.grow(spot.o, 1.5), bo: spot.o, way: -1, side: 0, s: 0, born: 13, died: null, berth: BT.canton };
      PLAN.lots.push(Lb); SL.hashLot(Lb);
      VC.capture('coastguard-footing', 13, function () {
        var bed = Math.min(VOTH.SEA - BT.depth, Math.min.apply(null, obbCorners(spot.o).map(function (q) { return VOTH.terrainHe(q[0], q[1]); })));
        VOTH.BOX(spot.c[0], bed, spot.c[1], DB.w, y - bed, DB.d, ry, 0x4a4844);
      });
      VC.SIMB.placed.berth = Lb.id; log.push('the coast-guard berth off the ' + BT.canton);
    } else log.push('no water clear for the coast-guard berth off the ' + BT.canton);
  }
  VC.SIMB.log = log;
  SL.note(13, 'the citizens’ buildings: ' + log.join('; '));
  return log;
};

/* the caravanserai (owner, 2026-10-12: "closer to the river gate, at post-avenue stage"): at step 3, once the avenues are
   down and before any street or lot, as the House of Healing is (30-vc-site.js VC.placeHealing): the free spot nearest
   the River Gate's marker where its whole footprint, a margin round it, is open dry ground (no avenue, causeway, landmark
   or canton), rising no more than `slope` across it, `wallClear` m inside the wall's line (built at step 5), fronting an
   avenue within `front` m of its wall; its gate turned to that avenue. It joins the plan as an owner's placed building
   does (VC.placedLot: HARD ground), so the streets and lots of steps 6-12 work round it. */
VC.simChainD = function (p, C) { var d = Infinity; for (var i = 1; i < C.length; i++) d = Math.min(d, segDist(p, C[i - 1], C[i])); return d; };   /* an open polyline */
/* a building placed before the streets (step 3): out from `centre` in rings to `S.reach` m, the first spot whose
   footprint (S.pad m round the model) is free dry ground, within the raster, off the cantons, `S.wallClear` m from the
   wall and no steeper than `S.slope` m across, fronting an avenue within `S.front` m (its front to the avenue).
   -> {L, r, q} or {why} */
VC.simPrePlace = function (S, centre, step) {
  var D = SL.dims(S.key, 0), R = SL.R; if (!D) return { why: 'no kit model' };
  var hw = D.w / 2 + S.pad, hd = D.d / 2 + S.pad, best = null;
  var footOk = function (c, f) {
    var u = V.perp(f), lo = Infinity, hi = -Infinity;
    for (var a = -hw; a <= hw + 0.01; a += hw / 4) for (var b = -hd; b <= hd + 0.01; b += hd / 4) {
      var p = V.add(c, V.add(V.mul(u, a), V.mul(f, b))), g = baseH(p[0], p[1]); if (g < 1) return false;
      lo = Math.min(lo, g); hi = Math.max(hi, g);
      if (R.idx(p[0], p[1]) < 0) return false;
      var o = R.at(p[0], p[1]); if (o !== OCC.FREE && o !== OCC.RESERVE) return false;
      if (VC.inCanton(p, 4)) return false;
      if (VC.wallChain && VC.simChainD(p, VC.wallChain) < S.wallClear) return false;
    }
    return hi - lo <= S.slope;
  };
  for (var r = 0; r <= S.reach && !best; r += 8) {
    var n = r ? Math.max(8, Math.round(2 * Math.PI * r / 10)) : 1;
    for (var i = 0; i < n && !best; i++) {
      var th = i / n * 2 * Math.PI, c = [centre[0] + Math.cos(th) * r, centre[1] + Math.sin(th) * r], q = VC.nearestWayPt(c, ['avenue']);
      if (!q || q.d > hd + S.front + q.way.w / 2) continue;
      var f = V.norm(V.sub(q.p, c));
      if (footOk(c, f)) best = { c: c, f: f, q: q, r: r };
    }
  }
  if (!best) return { why: 'no free ground within ' + S.reach + ' m' };
  var L = VC.placedLot({ key: S.key, v: 0, x: best.c[0], z: best.c[1], ry: Math.atan2(best.f[0], best.f[1]) }, step);
  if (!L) return { why: 'the kit model would not place' };
  L.placed = false;
  return { L: L, r: best.r, q: best.q };
};
VC.simCaravanserai = function (step) {
  var CV = TUNE.sim.place.caravanserai, M = VC.marker(new RegExp('^' + CV.marker + '$', 'i'));
  VC.SIMB.cv = null; VC.SIMB.cvWhy = null;
  if (!M) { VC.SIMB.cvWhy = 'no ' + CV.marker + ' marker'; return null; }
  var got = VC.simPrePlace(CV, [M.x, M.z], step);
  if (!got.L) { VC.SIMB.cvWhy = got.why + (got.why === 'no free ground within ' + CV.reach + ' m' ? ' of the ' + CV.gate + '\u2019s marker' : ''); return null; }
  var L = got.L; L.cls = 'tavern'; L.role = 'caravanserai';
  VC.SIMB.cv = { lot: L.id, log: 'the caravanserai ' + Math.round(got.r) + ' m from the ' + CV.gate + '\u2019s marker (placed at step ' + step + ', off ' + (got.q.way.tag || 'an avenue') + ')' };
  SL.note(step, VC.SIMB.cv.log);
  return L;
};
/* the rest day's two great temples (owner, 2026-10-12: "place one on the west side and one on the southeast side at the
   pre-street phase"): each searched for out from the point `at` of the way from the city's middle to its edge toward
   its compass `side` (TUNE.sim.place.temples) */
VC.simTemples = function (step) {
  var Z = PLAN.zone, c0 = polyCentroid(Z); VC.SIMB.temples = [];
  TUNE.sim.place.temples.forEach(function (S) {
    var d = SITE.COMPASS[S.side], e = 0; while (e < 6000 && inPoly([c0[0] + d[0] * (e + 20), c0[1] + d[1] * (e + 20)], Z)) e += 20;
    var at = [c0[0] + d[0] * e * S.at, c0[1] + d[1] * e * S.at], got = VC.simPrePlace(S, at, step), name = (ASSET_BY_KEY[S.key] || {}).name || S.key;
    if (!got.L) { VC.SIMB.temples.push({ key: S.key, side: S.side, why: got.why }); SL.note(step, name + ': ' + got.why + ' (' + S.side + ')'); return; }
    var L = got.L; L.cls = 'civic'; L.role = 'temple'; L.side = S.side;
    VC.SIMB.temples.push({ key: S.key, side: S.side, lot: L.id, r: Math.round(got.r) });
    SL.note(step, name + ' on the ' + S.side + ' side, ' + Math.round(got.r) + ' m from its mark (placed at step ' + step + ', off ' + (got.q.way.tag || 'an avenue') + ')');
  });
  return VC.SIMB.temples;
};

/* ---------------------------------------------------------------- 2. the wells */
/* a footprint cleared of houses (phase C, owner 2026-10-12: "village size shrines and benched squares for that
   overflow"): ground no street, alley, landmark, canton, field, farmstead or station is on, dry and no steeper than
   `S.slope` m across, where every lot it overlaps (its plot grown 1.5 m) is a plain house or shop of `S.from` (no role,
   no power house, not on a deck): -> those lots, or null */
VC.simClearable = function (o, S) {
  var R = SL.R, lo = Infinity, hi = -Infinity, pts = [], U = o.u, Vv = [-o.u[1], o.u[0]];
  for (var a = -1; a <= 1.001; a += 0.25) for (var b = -1; b <= 1.001; b += 0.25) pts.push([o.c[0] + U[0] * a * o.hw + Vv[0] * b * o.hd, o.c[1] + U[1] * a * o.hw + Vv[1] * b * o.hd]);
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i], g = baseH(p[0], p[1]); if (g < 1) return null; lo = Math.min(lo, g); hi = Math.max(hi, g);
    if (VC.inCanton(p, 6)) return null;
    if (VC.inCity(p, 0)) { var oc = R.at(p[0], p[1]); if (oc !== OCC.FREE && oc !== OCC.LOT && oc !== OCC.GREEN) return null; }
    else if (VC.roadNear(p, 1.5)) return null;
  }
  if (hi - lo > S.slope) return null;
  if (VC.fieldHit(o) || VC.anyHit(o, VC.big || [], 1) || VC.anyHit(o, VC.platforms || [], 4)) return null;
  if ((VC.stationPts || []).some(function (q) { return V.dist(q, o.c) < Math.max(o.hw, o.hd) + 20; })) return null;
  var g2 = VC.grow(o, 1.5), take = [], bad = false, x0 = Math.floor(o.c[0] / 40), z0 = Math.floor(o.c[1] / 40), rr = Math.ceil(Math.max(o.hw, o.hd) / 40) + 1;
  for (var dx = -rr; dx <= rr && !bad; dx++) for (var dz = -rr; dz <= rr && !bad; dz++) {
    var list = SL.HASH.get((x0 + dx) + ',' + (z0 + dz)); if (!list) continue;
    list.forEach(function (L) {
      if (bad || L.died != null || !L.bo || SL.pen(g2, L.bo) <= 0.1 || take.indexOf(L) >= 0) return;
      if (L.role || L.power || L.deck || L.berth || L.placed || S.from.indexOf(L.cls) < 0) bad = true; else take.push(L);
    });
  }
  return bad ? null : take;
};
/* out from `centre` in rings to `S.reach` m (from `S.r0`): the first footprint W x D whose front faces the nearest way of
   `S.ways` within `S.front` m and that VC.simClearable passes, at least `S.gap` m from those in `away` -> {o, f, take, r} */
VC.simClearSpot = function (centre, W, D, S, away) {
  for (var r = S.r0 || 0; r <= S.reach; r += S.ring || 10) {
    var n = r ? Math.max(8, Math.round(2 * Math.PI * r / (S.ring || 10))) : 1;
    for (var i = 0; i < n; i++) {
      var th = i / n * 2 * Math.PI, c = [centre[0] + Math.cos(th) * r, centre[1] + Math.sin(th) * r];
      if ((away || []).some(function (q) { return V.dist(q, c) < S.gap; })) continue;
      var q = VC.nearestWayPt(c, S.ways); if (!q || q.d < D / 2 + q.way.w / 2 + 1 || q.d > D / 2 + q.way.w / 2 + S.front) continue;
      var f = V.norm(V.sub(q.p, c)), o = obb(c, V.perp(f), W / 2, D / 2), take = VC.simClearable(o, S);
      if (take) return { o: o, f: f, take: take, r: r, q: q };
    }
  }
  return null;
};
/* the benched squares (owner, 2026-10-12): the cantons' people found nowhere to sit with company on a working afternoon
   (the census by home, phase C: Market, Granary, Fortress, Guild, Arsenal, Foreign). At each canton's foot, out from its
   apron, `n` squares of `w` x `d` m on cleared house lots fronting a street: a ring of benches round the well VC.wells
   sets at its middle, benches along its three inner sides, braziers at its corners. Each is a plaza green (its standing
   room by its area, TUNE.sim.greens) and its benches seats (VC.simPlaces) */
VC.simSquares = function (step) {
  var S = TUNE.sim.place.squares, made = [], art = [], log = [];
  VC.SIMB.squares = {};
  S.cantons.forEach(function (cn) {
    var M = CANT.by[cn[0]]; if (!M) { log.push('no canton ' + cn[0]); return; }
    var got = 0, away = made.map(function (m) { return m.c; }), ro = M.apron ? M.apron.ro : M.r;
    /* out from its apron, then from the land end of each causeway it has (a canton out on the water: the Fortress) */
    var from = [{ c: [M.x, M.z], r0: ro + S.d / 2 + 4, reach: ro + S.reach }];
    (CANT.causewayList || []).forEach(function (cw) { var E = cw.ends || []; [0, 1].forEach(function (e) { if (E[e] && E[e].canton === cn[0] && !(E[1 - e] && E[1 - e].canton) && cw.pts && cw.pts.length > 1) from.push({ c: e ? cw.pts[0] : cw.pts[cw.pts.length - 1], r0: 0, reach: S.reach }); }); });
    for (var k = 0; k < cn[1]; k++) {
      var sp = null;
      for (var fi = 0; fi < from.length && !sp; fi++) sp = VC.simClearSpot(from[fi].c, S.w, S.d, { r0: from[fi].r0, reach: from[fi].reach, ring: S.ring, ways: S.ways, front: S.front, gap: S.gap, slope: S.slope, from: S.from }, away);
      if (!sp) break;
      sp.take.forEach(function (L) { SL.killLot(L, step); });
      var o = sp.o, poly = obbCorners(o), G = SL.addGreen('plaza', poly, step, 0.5, 'poor', null);
      G.square = cn[0]; G.art = null;
      var mid = o.c, f = sp.f, u = o.u, benches = 0, put = function (key, v, p, ry) { art.push({ key: key, v: v, x: p[0], y: baseH(p[0], p[1]) - 0.05, z: p[1], ry: ry, furn: true, square: G.id }); };
      var face = function (p) { return Math.atan2(mid[0] - p[0], mid[1] - p[1]); };
      /* the ring round the middle */
      var rr = Math.min(o.hw, o.hd) - S.edge - 3, nr = Math.max(6, Math.floor(2 * Math.PI * rr / S.ringEvery));
      for (var i = 0; i < nr; i++) { var th = (i + 0.5) / nr * 2 * Math.PI, p = [mid[0] + Math.cos(th) * rr, mid[1] + Math.sin(th) * rr]; put('voth_bench', 1, p, face(p)); benches++; }
      /* the sides but the street's: inset `edge` m, facing in */
      [[-1, 0], [1, 0], [0, -1]].forEach(function (sd) {
        var along = sd[0] ? f : u, half = sd[0] ? o.hd : o.hw, at = V.add(mid, sd[0] ? V.mul(u, sd[0] * (o.hw - S.edge)) : V.mul(f, -(o.hd - S.edge)));
        var inw = sd[0] ? V.mul(u, -sd[0]) : f, ry = Math.atan2(inw[0], inw[1]);
        for (var t = -half + S.edge + 2; t <= half - S.edge - 2 + 0.01; t += S.sideEvery) { put('voth_bench', 0, V.add(at, V.mul(along, t)), ry); benches++; }
      });
      poly.forEach(function (c) { var p = V.add(c, V.mul(V.norm(V.sub(mid, c)), 2.2)); put('voth_street_brazier', 0, p, 0); });
      VC.SIMB.squares[G.id] = { canton: cn[0], benches: benches, area: Math.round(4 * o.hw * o.hd), took: sp.take.length };
      made.push({ c: mid, canton: cn[0], green: G.id }); away.push(mid); got++;
    }
    log.push(cn[0] + ' ' + got + (got < cn[1] ? ' of ' + cn[1] : ''));
  });
  if (art.length) PLAN.districts.push({ kind: 'furniture', name: 'Benched squares', art: art, born: step });
  var took = Object.keys(VC.SIMB.squares).reduce(function (n, k) { return n + VC.SIMB.squares[k].took; }, 0);
  SL.note(step, 'benched squares by the cantons: ' + made.length + ' (' + log.join(', ') + '), ' + art.filter(function (a) { return a.key === 'voth_bench'; }).length + ' benches, on ' + took + ' cleared house lots');
  return made;
};
/* the village shrines (owner, 2026-10-12): the rest day's worship that found no room was spread over the suburbs, the
   farms, the mines and the clan compounds. As the citizens choose (the nearest place with room), every household's
   worshippers at the busiest service (`attend` of its people, `homes` by class) are given to the nearest place of worship
   within `walk` m that still has room (a temple or chapel its nave's floor by TUNE.sim.worship.m2, a canton, Voth's
   landmark shrines, the funerary temple, the monastery's chapel or a pocket park's small one `holds`; the clan compounds worship at their own yard shrine and are not counted);
   each shrine goes where the most are left over within `r` m (a `cell` m grid), the next one counting it; a spot with
   no ground counts as served and the next best is tried, up to `retries` times */
VC.simVillageShrines = function (step) {
  var S = TUNE.sim.place.villageShrine, D = SL.dims(S.key, 0), sites = [], out = [], m2 = TUNE.sim.worship.m2;
  if (!D) return out;
  var nave = function (key) { var A = ASSET_BY_KEY[key], b = A && A.ix && A.ix.block; return b ? Math.floor(b[2] * b[3] / m2) : 0; };
  PLAN.lots.forEach(function (L) {
    if (L.died != null) return;
    var c = L.role === 'temple' || L.role === 'chapel' || L.role === 'shrine' ? nave(L.key) : 0;
    if (c) sites.push([L.x, L.z, c]);
  });
  (CANT.list || []).forEach(function (M) { sites.push([M.x, M.z, S.holds.canton]); });
  (PLAN.voth || []).forEach(function (q) { if (q.role === 'shrine') sites.push([q.x, q.z, S.holds.shrine]); else if (q.role === 'funeraryTemple') sites.push([q.x, q.z, S.holds.funerary]); });   /* Voth's landmarks */
  PLAN.districts.forEach(function (D) { if (D.kind === 'monastery' && D.poly) { var c = polyCentroid(D.poly); sites.push([c[0], c[1], S.holds.monastery]); } });   /* its chapel */
  var SH = TUNE.sim.place.shrines;   /* the pocket parks' small shrines to come (VC.parkShrines) */
  PLAN.greens.forEach(function (G) { if (G.kind === 'park' && G.poly && Math.abs(polyArea(G.poly)) >= SH.minArea) { var c = polyCentroid(G.poly); sites.push([c[0], c[1], S.holds.small]); } });
  var homes = PLAN.lots.filter(function (L) { return L.died == null && !L.role && !L.deck && S.homes[L.cls]; })
    .map(function (L) { return [L.x, L.z, S.homes[L.cls] * S.attend]; });
  var left = function () {
    var room = sites.map(function (q) { return q[2]; }), want = homes.map(function (h) { return h[2]; }), pairs = [];
    homes.forEach(function (h, hi) { sites.forEach(function (q, si) { var d = Math.hypot(q[0] - h[0], q[1] - h[1]); if (d < S.walk) pairs.push([d, hi, si]); }); });
    pairs.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]; });
    pairs.forEach(function (p) { var t = Math.min(want[p[1]], room[p[2]]); if (t > 0) { want[p[1]] -= t; room[p[2]] -= t; } });
    return want;
  };
  var short0 = 0, placed = 0;
  for (var k = 0; k < S.n + S.retries && placed < S.n; k++) {
    var want = left(), score = new Map(), rc = Math.ceil(S.r / S.cell);
    if (!k) short0 = Math.round(want.reduce(function (a, b) { return a + b; }, 0));
    homes.forEach(function (h, hi) {
      if (want[hi] < 0.01) return;
      var gx = Math.round(h[0] / S.cell), gz = Math.round(h[1] / S.cell);
      for (var x = gx - rc; x <= gx + rc; x++) for (var z = gz - rc; z <= gz + rc; z++) if (Math.hypot(x * S.cell - h[0], z * S.cell - h[1]) < S.r) { var kk = x + ',' + z; score.set(kk, (score.get(kk) || 0) + want[hi]); }
    });
    var best = null, bs = 0; score.forEach(function (v, kk) { if (v > bs + 1e-9 || (Math.abs(v - bs) <= 1e-9 && best && kk < best)) { bs = v; best = kk; } });
    if (!best) break;
    var gc = best.split(',').map(function (t) { return +t * S.cell; });
    var sp = VC.simClearSpot(gc, D.w + 2 * S.pad, D.d + 2 * S.pad, S, out.filter(function (q) { return q.lot != null; }).map(function (q) { return [q.x, q.z]; }));
    if (!sp) { out.push({ why: 'no ground near ' + gc.map(Math.round).join(', '), x: gc[0], z: gc[1] }); sites.push([gc[0], gc[1], 1e9]); continue; }   /* that spot counted as served, so the next looks elsewhere */
    var L = VC.placedLot({ key: S.key, v: 0, x: sp.o.c[0], z: sp.o.c[1], ry: Math.atan2(sp.f[0], sp.f[1]) }, step);
    if (!L) break;
    L.placed = false; L.cls = 'civic'; L.role = 'shrine';
    sites.push([L.x, L.z, nave(S.key)]);
    out.push({ lot: L.id, x: Math.round(L.x), z: Math.round(L.z), left: Math.round(bs), took: sp.take.length, where: (VC.roleAt ? VC.roleAt([L.x, L.z]) : '') || 'country' }); placed++;
  }
  var short1 = Math.round(left().reduce(function (a, b) { return a + b; }, 0));
  VC.SIMB.villageShrines = out; VC.SIMB.worshipShort = [short0, short1];
  SL.note(step, 'village shrines: ' + out.map(function (q) { return q.lot != null ? 'at ' + q.x + ', ' + q.z + ' (' + q.where + ', ' + q.left + ' worshippers without room within ' + S.r + ' m, ' + q.took + ' house lots cleared)' : q.why; }).join('; ') +
    '; the busiest service’s estimate without room: ' + short0 + ' before, ' + short1 + ' after');
  return out;
};

/* the shipwright's docks (owner, 2026-10-13: "a shipwright's dock that constructs ships and also sells oars, kayaks"):
   one by each district of `roles` (the sea harbour, the river port): out from its middle in rings to `reach` m, the first
   shore where the model's landward part (its back, local z < `landTo`) stands on dry ground no steeper than `slope` m
   across and its slipway (local z > `waterFrom`) in the water, its last `endLen` m `depth` m deep (the ground as drawn: a
   harbour's bed shelves gently), turned to the water (the lowest of 16
   directions `look` m out), clear by `clear` m of the piers, the causeways and the cantons and by `markClear` m of
   Voth's landmarks, over nothing but house and warehouse lots of `from` (cleared), off the streets and the hard ground
   (the harbour's quay deck is drawn over it: a `quay` role would allow it), off the roads beyond the city's raster and
   off the greens and benched squares; the water left open: `channel` m of it beyond the slip's end, no ferry's way within
   `laneClear` m of the slip, and the slip taken off the boats' grid once it stands. Its land height is its back's */
VC.simShipwrights = function (step) {
  var S = TUNE.sim.place.shipwright, D = SL.dims(S.key, 0), out = [], R = SL.R; VC.SIMB.shipwrights = out;
  if (!D) return out;
  var segs = [];
  (VOTH.PIERS || []).forEach(function (q) { segs.push([[q.x0, q.z0], [q.x1, q.z1], (q.w || 6) / 2]); });
  (CANT.causewayList || []).forEach(function (cw) { for (var k = 1; k < cw.pts.length; k++) segs.push([cw.pts[k - 1], cw.pts[k], cw.width / 2]); });
  CANT.spans.forEach(function (sp) { segs.push([[sp.ax, sp.az], [sp.bx, sp.bz], sp.w / 2]); });
  var at = function (c, f, x, z) { var u = V.perp(f); return [c[0] + u[0] * x + f[0] * z, c[1] + u[1] * x + f[1] * z]; };
  /* the boats' ways: every leg of the water lines (ferries) as a polyline */
  var lanes = []; SIM.all('transport').forEach(function (T) { if (T.layer !== 'water') return; (T.legs || []).forEach(function (L) { if (L.path && L.path.pts) lanes.push(L.path.pts); }); });
  var gcen = {}, why = {}, no = function (k) { why[k] = (why[k] || 0) + 1; return null; };
  var tryAt = function (c) {
    if (baseH(c[0], c[1]) < S.land) return no('wet middle');
    var f = null, lo = Infinity;
    for (var i = 0; i < 16; i++) { var th = i / 16 * 2 * Math.PI, d = [Math.cos(th), Math.sin(th)], q = [c[0] + d[0] * S.look, c[1] + d[1] * S.look], h = baseH(q[0], q[1]); if (h < lo) { lo = h; f = d; } }
    if (lo > VOTH.SEA - S.depth) return no('no water near');
    var hw = D.w / 2, hd = D.d / 2, hmin = Infinity, hmax = -Infinity;
    for (var x = -hw + 1; x <= hw - 1 + 0.01; x += (D.w - 2) / 4) for (var z = -hd + 1; z <= S.landTo; z += (S.landTo + hd - 1) / 3) {
      var p = at(c, f, x, z), g = baseH(p[0], p[1]); if (g < S.land) return no('yard wet'); hmin = Math.min(hmin, g); hmax = Math.max(hmax, g);
      if (VC.inCanton(p, S.clear)) return no('canton');
      var oc = R.at(p[0], p[1]);
      if (oc === OCC.OUT) { if (VC.roadNear(p, 2)) return no('a road'); }   /* beyond the walled city's raster: the roads */
      else if (oc === OCC.STREET || oc === OCC.ALLEY || (oc === OCC.HARD && !hardOk)) return no('street or hard ground');
    }
    if (hmax - hmin > S.slope) return no('steep');
    if (marks.some(function (m) { return Math.hypot(m[0] - c[0], m[1] - c[1]) < S.markClear; })) return no('a landmark');
    for (var x2 = -3; x2 <= 3; x2 += 3) for (var z2 = S.waterFrom; z2 <= hd - 0.5; z2 += 2) { var w = at(c, f, x2, z2), hw2 = baseH(w[0], w[1]); if (hw2 > VOTH.SEA - (z2 >= hd - S.endLen ? S.depth : 0)) return no('slip dry'); }
    /* the river (or the bay) stays open: water `channel` m beyond the slip's end (or as far as `channelLook`: open water),
       no boat's way within `laneClear` m of the slip */
    var E = at(c, f, 0, hd), open = 0; while (open < S.channelLook) { var e2 = V.add(E, V.mul(f, open + 5)); if (baseH(e2[0], e2[1]) > VOTH.SEA - 0.3) break; open += 5; }
    if (open < S.channel) return no('the channel too narrow');
    var slip = obb(at(c, f, 0, (S.waterFrom + hd) / 2), V.perp(f), 4.5, (hd - S.waterFrom) / 2 + 1);
    if (lanes.some(function (P) { for (var i = 1; i < P.length; i++) { var a = [P[i - 1][0], P[i - 1][2]], b = [P[i][0], P[i][2]], L = V.dist(a, b); for (var u = 0; u <= L; u += 4) if (VC.simInObb(V.lerp(a, b, L ? u / L : 0), slip, S.laneClear)) return true; } return false; })) return no('a boat\u2019s way');
    var o = obb(c, V.perp(f), hw, hd), C = obbCorners(o).concat([c]);
    if (PLAN.greens.some(function (G, gi) { if (!G.poly) return false; var gc = gcen[gi] || (gcen[gi] = polyCentroid(G.poly)); if (Math.abs(gc[0] - c[0]) > 150 || Math.abs(gc[1] - c[1]) > 150) return false;
      return C.some(function (q) { return inPoly(q, G.poly); }) || G.poly.concat([gc]).some(function (q) { return VC.simInObb(q, o, 1); }); })) return no('a green or square');
    if (segs.some(function (sg) { return C.some(function (q) { return VC.simSegD(q, sg[0], sg[1]) < sg[2] + S.clear; }) || VC.simSegD(c, sg[0], sg[1]) < sg[2] + Math.max(hw, hd); })) return no('pier or causeway');
    var g2 = VC.grow(o, 1.5), bad = false;
    PLAN.lots.forEach(function (L) { if (bad || L.died != null || !L.bo || Math.abs(L.x - c[0]) > 80 || Math.abs(L.z - c[1]) > 80 || SL.pen(g2, L.bo) <= 0.1) return; if (L.role || L.power || L.deck || L.berth || L.placed || S.from.indexOf(L.cls) < 0) bad = true; });
    if (bad) return no('a lot not to clear'); if (VC.anyHit(o, VC.big || [], 1)) return no('a big plot');
    return { c: c, f: f, back: hmin, slip: slip, open: open };
  };
  var hardOk = false, marks = (PLAN.voth || []).map(function (q) { return [q.x, q.z]; }).concat((PLAN.landmarks || []).map(function (q) { return [q.x, q.z]; }));
  S.roles.forEach(function (role) {
    hardOk = S.quay.indexOf(role) >= 0;   /* a harbour's shore is its paved quay */
    var Ds = VC.districts(role); if (!Ds.length) { out.push({ role: role, why: 'no ' + role + ' district' }); return; }
    var c0 = polyCentroid(Ds[0].poly), got = null;
    for (var r = 0; r <= S.reach && !got; r += S.ring) { var n = r ? Math.max(8, Math.round(2 * Math.PI * r / S.ring)) : 1;
      for (var i = 0; i < n && !got; i++) { var th = i / n * 2 * Math.PI; got = tryAt([c0[0] + Math.cos(th) * r, c0[1] + Math.sin(th) * r]); if (got) got.r = r; } }
    if (!got) { out.push({ role: role, why: 'no shore within ' + S.reach + ' m (' + Object.keys(why).map(function (k) { return k + ' ' + why[k]; }).join(', ') + ')' }); return; }
    var L = VC.placedLot({ key: S.key, v: 0, x: got.c[0], z: got.c[1], ry: Math.atan2(got.f[0], got.f[1]) }, step);
    if (!L) { out.push({ role: role, why: 'the model would not place' }); return; }
    L.placed = false; L.cls = 'craft'; L.role = 'shipwright'; L.y = Math.max(VOTH.SEA + 0.3, got.back);
    /* the slip comes off the boats' water (VC.navGrid): a route found later goes round it */
    var NV = VC.NAV; if (NV) for (var k = 0; k < NV.wet.length; k++) if (NV.wet[k] && VC.simInObb(NV.at(k), got.slip, NV.c)) NV.wet[k] = 0;
    out.push({ role: role, lot: L.id, x: Math.round(L.x), z: Math.round(L.z), r: got.r, open: got.open, slip: { c: got.slip.c.slice(), u: got.slip.u, v: got.slip.v, hw: got.slip.hw, hd: got.slip.hd } });
  });
  SL.note(step, 'shipwright’s docks: ' + out.map(function (q) { return q.lot != null ? q.role + ' (' + q.r + ' m from its middle)' : q.why; }).join('; '));
  return out;
};

VC.wells = function () {
  var T = TUNE.sim.wells, art = [], H = new Map(), cs = T.gap;
  var near = function (p) { var gx = Math.floor(p[0] / cs), gz = Math.floor(p[1] / cs);
    for (var dx = -1; dx <= 1; dx++) for (var dz = -1; dz <= 1; dz++) { var L = H.get((gx + dx) + ',' + (gz + dz)); if (L && L.some(function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1]) < T.gap; })) return true; } return false; };
  var put = function (p, ry, where, force) {
    if (!force && near(p)) return false;
    var k = Math.floor(p[0] / cs) + ',' + Math.floor(p[1] / cs); (H.get(k) || H.set(k, []).get(k)).push(p);
    art.push({ key: T.key, v: 0, x: p[0], y: baseH(p[0], p[1]) - 0.05, z: p[1], ry: ry || 0, furn: true, where: where });
    return true;
  };
  /* the wells already standing (the parks', the monastery's) count against the gap */
  PLAN.districts.forEach(function (D) { (D.art || []).forEach(function (a) { if (/well/.test(a.key)) { var k = Math.floor(a.x / cs) + ',' + Math.floor(a.z / cs); (H.get(k) || H.set(k, []).get(k)).push([a.x, a.z]); } }); });
  var clearOfArt = function (p, D, r) { return !(D && D.art || []).some(function (a) { return Math.hypot(a.x - p[0], a.z - p[1]) < r; }); };
  var n = { plaza: 0, market: 0, street: 0, yard: 0 };
  /* the market squares: the open middle, clear of the stalls */
  PLAN.districts.forEach(function (D) {
    if (D.kind !== 'market' && D.kind !== 'market square') return;
    var site = (PLAN.site || []).filter(function (s) { return s.name === D.name; })[0], poly = site ? site.poly : null, c = poly ? polyCentroid(poly) : null; if (!c) return;
    for (var r = 0; r < 160; r += 4) for (var a = 0; a < 16; a++) {
      var p = [c[0] + Math.cos(a * Math.PI / 8) * r, c[1] + Math.sin(a * Math.PI / 8) * r], oc = SL.R.at(p[0], p[1]);
      if ((!poly || inPoly(p, poly)) && clearOfArt(p, D, 3.5) && oc !== OCC.HARD && oc !== OCC.LOT && oc !== OCC.STREET && put(p, 0, D.name)) { n.market++; r = 999; a = 99; }
    }
  });
  /* the plazas, the largest first: beside its art */
  PLAN.greens.filter(function (G) { return G.kind === 'plaza'; }).map(function (G) { return { G: G, a: Math.abs(polyArea(G.poly)) }; }).sort(function (p, q) { return q.a - p.a || p.G.id - q.G.id; })
    .forEach(function (e) {
      if (e.a < 60) return;
      var c = polyCentroid(e.G.poly), art = e.G.art;
      if (art && Math.hypot(art.x - c[0], art.z - c[1]) < 5) { var far = e.G.poly.reduce(function (b, q) { return Math.hypot(q[0] - c[0], q[1] - c[1]) > Math.hypot(b[0] - c[0], b[1] - c[1]) ? q : b; }); var u = V.norm(V.sub(far, c)); c = V.add(c, V.mul(u, 5)); }
      if (inPoly(c, e.G.poly) && put(c, 0, 'plaza')) n.plaza++;
    });
  /* the residential streets: every `street` m, on the side whose ground is open */
  PLAN.ways.forEach(function (w) {
    if (T.classes.indexOf(w.cls) < 0 || !w.F) return;
    for (var s = T.street / 2; s < w.F.len; s += T.street) {
      var p = w.F.at(s), t = w.F.tan(s, 4), nn = V.perp(t);
      [1, -1].some(function (sd) {
        var q = V.add(p, V.mul(nn, sd * (w.w / 2 + T.side)));
        var role = VC.roleAt(q); if (role === 'industry' || role === 'warehouse' || role === 'harbor' || role === 'riverport') return false;
        if (SL.R.at(q[0], q[1]) !== OCC.FREE || baseH(q[0], q[1]) < 1) return false;
        if (put(q, Math.atan2(nn[0] * sd, nn[1] * sd), 'street')) { n.street++; return true; }
        return false;
      });
    }
  });
  /* the manors' and clan compounds' own wells are in their courtyards, inside the kit model: a private DRINK on the home
     (VC.simPlaces), not a piece placed here */
  PLAN.lots.forEach(function (L) { if (L.died == null && T.yard.indexOf(L.cls) >= 0) { L.well = true; n.yard++; } });
  if (art.length) PLAN.districts.push({ kind: 'furniture', name: 'Wells', art: art, born: 14 });
  VC.SIMB.wells = art; VC.SIMB.wellCount = n;
  SL.note(14, 'wells: ' + art.length + ' placed (' + n.market + ' in the market squares, ' + n.plaza + ' on plazas, ' + n.street + ' along the streets), and ' + n.yard + ' private ones in the manor and clan courtyards');
  return art.length;
};

/* the small shrines (owner, 2026-10-12: "3 small tomb size shrines as furniture to distribute around parks"): along the
   big parks' walks every TUNE.sim.place.shrines.walkEvery m, set beside the walk inside the park and clear of its other
   pieces and plants; one in each pocket park of at least `minArea` m2, at its middle. The big parks' go in their own
   park's pieces (its SIM place counts them); the pocket parks' in a 'Shrines' set, counted by their green
   (VC.SIMB.greenShrines). The three kinds dealt in turn by a hash of the spot */
VC.parkShrines = function () {
  var S = TUNE.sim.place.shrines, G = 6, H = new Map(), n = { park: 0, pocket: 0 }, art = [];
  var key = function (x, z) { return Math.floor(x / G) + ',' + Math.floor(z / G); };
  var mark = function (x, z) { var k = key(x, z); (H.get(k) || H.set(k, []).get(k)).push([x, z]); };
  var clear = function (x, z, r) { for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) { var L = H.get((Math.floor(x / G) + i) + ',' + (Math.floor(z / G) + j)); if (L && L.some(function (q) { return Math.hypot(q[0] - x, q[1] - z) < r; })) return false; } return true; };
  PLAN.districts.forEach(function (D) { (D.art || []).forEach(function (a) { mark(a.x, a.z); }); });
  (VC.parkFlora || []).forEach(function (f) { if (f && f.x != null) mark(f.x, f.z); });
  var pick = function (x, z) { return S.keys[KRAND.hash(1717, Math.floor(x), Math.floor(z), 3) % S.keys.length]; };
  var piece = function (x, z, ry) { var k = pick(x, z); mark(x, z); return { key: k, v: 0, x: x, y: baseH(x, z) - 0.05, z: z, ry: ry, furn: true }; };
  /* the big parks: along their walks */
  var byPark = {}; (VC.parkWalks || []).forEach(function (w) { (byPark[w.park] || (byPark[w.park] = [])).push(w); });
  PLAN.districts.forEach(function (D) {
    var W = byPark[D.name]; if (!W || !D.poly) return;
    var acc = S.walkEvery / 2;
    W.forEach(function (w) {
      var L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]); acc += L; if (acc < S.walkEvery || L < 1) return;
      var m = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2], t = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L], nn = [t[1], -t[0]];
      [1, -1].some(function (sd) {
        var p = [m[0] + nn[0] * sd * (w.w / 2 + S.off), m[1] + nn[1] * sd * (w.w / 2 + S.off)];
        if (!inPoly(p, D.poly) || !clear(p[0], p[1], S.clear + 1)) return false;
        (D.art || (D.art = [])).push(piece(p[0], p[1], Math.atan2(-nn[0] * sd, -nn[1] * sd))); n.park++; acc = 0; return true;
      });
    });
  });
  /* the pocket parks: one at the middle of each large enough */
  VC.SIMB.greenShrines = {};
  PLAN.greens.forEach(function (Gr, gi) {
    if (Gr.kind !== 'park' || !Gr.poly || Math.abs(polyArea(Gr.poly)) < S.minArea) return;
    var c = polyCentroid(Gr.poly); if (!inPoly(c, Gr.poly) || !clear(c[0], c[1], S.clear)) return;
    var a = piece(c[0], c[1], 0); art.push(a); n.pocket++;
    VC.SIMB.greenShrines[gi] = ((typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[a.key]) || {}).holds || 3;
  });
  if (art.length) PLAN.districts.push({ kind: 'furniture', name: 'Shrines', art: art, born: 14 });
  VC.SIMB.shrines = n;
  SL.note(14, 'small shrines: ' + n.park + ' along the big parks\' walks, ' + n.pocket + ' in the pocket parks');
  return n;
};

/* ---------------------------------------------------------------- 3. the places */
VC.SIM_KIND = { poor: 'home', middle: 'home', rich: 'home', manor: 'home', clan: 'home', farm: 'home', monastery: 'home', 'chinampa hut': 'home', keeper: 'home',
                shop: 'shop', craft: 'craft', tavern: 'tavern', warehouse: 'warehouse', industrial: 'industrial', civic: 'civic', landmark: 'civic',
                shrine: 'shrine', chapel: 'chapel', funerary: 'funerary', healing: 'healing', lighthouse: 'lighthouse', hall: 'civic' };
VC.simPosts = function (pieces) {
  var T = TUNE.ix, PC = TUNE.sim.posts, n = 0, by = {};
  pieces.forEach(function (p) {
    if (T.work.indexOf(p.kind) < 0 || p.anchor === 'surface') return;
    if (T.posts.indexOf(p.type) < 0 && (T.postsIn[p.kind] || []).indexOf(p.type) < 0) return;
    var PK = TUNE.sim.postsIn[p.kind], c = PK && PK[p.type] != null ? PK[p.type] : PC[p.type] == null ? 1 : PC[p.type];
    c *= VC.simSize(p, TUNE.sim.postWidth[p.type]); n += c; by[p.type] = (by[p.type] || 0) + c;
  });
  return { n: n, by: by };
};
/* session 2: a piece's capacity by its size (TUNE.sim.postWidth, seatWidth: the metres of its width one person takes): a
   long counter or workbench takes more than one; 1 when the kind has no width rule */
VC.simDims = function (p) { var A = typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key]; return A ? entryDims(A, p.v | 0) : { w: 1, d: 1, h: 1 }; };
VC.simSize = function (p, per) { if (!per || !p.key) return 1; return Math.max(1, Math.floor(VC.simDims(p).w / per + 0.25)); };
/* where people stand at a piece (in the building's frame): before its front (+z of its own frame), half its depth and a
   step out; at a table or a bed, along its side */
VC.simStand = function (p) {
  var D = VC.simDims(p), out = D.d / 2 + TUNE.sim.spotStep, c = Math.cos(p.ry || 0), s = Math.sin(p.ry || 0);
  return { x: p.x + s * out, y: p.y, z: p.z + c * out };
};
VC.simActs = function () {
  var add = function (a) { if (!SIM.R.activity || !SIM.R.activity[a]) SIM.activity({ id: a, indoor: ['SLEEP', 'EAT', 'STUDY', 'COOK', 'WEAVE', 'STORE', 'STORE_FOOD', 'HEAL', 'VISIT'].indexOf(a) >= 0 }); };
  ['SLEEP', 'EAT', 'DRINK', 'SOCIALIZE', 'RELAX', 'CONTEMPLATE', 'WORSHIP', 'HONOUR', 'BUY', 'SELL', 'KEEP_SHOP', 'COOK', 'STUDY', 'CRAFT', 'WEAVE', 'STORE', 'STORE_FOOD',
   'DRAW_TOOLS', 'TRAIN', 'HEAL', 'WORK', 'REST', 'IDLE', 'VISIT'].forEach(add);
  Object.keys(TUNE.sim.furnAct).forEach(function (k) { if (TUNE.sim.furnAct[k]) add(TUNE.sim.furnAct[k]); });
  Object.keys(SIM.FURN_ACT).forEach(function (k) { add(SIM.FURN_ACT[k]); });
};
VC.simPlaces = function () {
  if (typeof SIM === 'undefined' || !SIM.place) return 0;
  VC.simActs();
  var T = TUNE.sim, n = 0, K = TUNE.census, posts = {}, wps = {}, list = VC.SIMB.list = [];
  VC.simStandIdx = null;   /* the beds and piers as they stand now (VC.simStandY) */
  var hrs = function (kind) { var h = T.hours[kind]; return h ? h.slice() : null; };
  var pullOf = function (kind) { return T.pull[kind] ? Object.assign({}, T.pull[kind]) : null; };
  var reg = function (o) {
    if (o.job && o.posts) posts[o.job] = (posts[o.job] || 0) + o.posts;
    if (o.job && (o.posts || o.workplaces)) o.activities.WORK = Math.max(1, Math.round(o.posts || o.workplaces));   /* a place with workplaces and no post still takes its workers (phase C) */
    if (o.job && o.workplaces) wps[o.job] = (wps[o.job] || 0) + o.workplaces;
    try { SIM.place(o); list.push(o); n++; } catch (e) { VC.SIMB.err = String(e); }
  };
  /* the buildings with an interior */
  VC.IX.units.forEach(function (u) {
    var ty = VC.IX.types[u.type]; if (!ty) return;
    var kind = u.residents && !u.job ? 'home' : (VC.SIM_KIND[u.site || u.cls] || u.cls);
    var Lu = u.lot >= 0 ? PLAN.lots[u.lot] : null; if (Lu && (Lu.role === 'temple' || Lu.role === 'chapel' || Lu.role === 'shrine')) kind = Lu.role;   /* and the village shrines */   /* the rest day's temples and the village chapels */
    var SW = T.seatWidth, pcs = (ty.pieces || []).map(function (p) {
      var D = VC.simDims(p), FB = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key]) || {}, seats = FB.holds ? FB.holds : SW[p.type] ? (p.type === 'table' ? Math.max(2, Math.floor(2 * (D.w + D.d) / SW.table)) : VC.simSize(p, SW[p.type])) : 1;
      return { type: p.type, role: p.catRole, job: (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key] || {}).job || null, kind: p.kind, anchor: p.anchor, seats: seats }; });
    var acts = SIM.slotsFromFurniture(pcs.filter(function (p) { return p.anchor !== 'surface'; }), T.furnAct);
    pcs.forEach(function (p) { if (p.anchor === 'surface') return; (T.alsoAct[p.type] || []).forEach(function (a) { acts[a] = (acts[a] || 0) + (p.seats || 1); }); });   /* seats to idle on, beds to rest on */
    if (kind !== 'home') delete acts.VISIT;                                                                             /* visiting is at a house */
    if (T.worship.kinds.indexOf(kind) >= 0 && ty.floorArea) { var wa = Math.floor(ty.floorArea / Math.max(1, ty.storeys || 1) / T.worship.m2); acts.WORSHIP = Math.max(acts.WORSHIP || 0, wa); acts.CONTEMPLATE = Math.max(acts.CONTEMPLATE || 0, wa); }
    if (u.beds) acts.SLEEP = u.beds * TUNE.ix.per;
    if (u.residents > (acts.SLEEP || 0)) { u.floor = u.residents - (acts.SLEEP || 0); acts.SLEEP = u.residents; }   /* phase C: a home's people sleep in it, on the floor where its beds fall short (the shortfall is phase A's report) */
    if (kind === 'shop' || kind === 'craft') acts.BUY = Math.max(2, (acts.KEEP_SHOP || 1) * 3);
    if (kind === 'tavern') { acts.DRINK = (acts.DRINK || 0) + (acts.EAT || 0); acts.SOCIALIZE = (acts.SOCIALIZE || 0) + (acts.EAT || 0); }
    if (kind === 'healing') acts.HEAL = u.beds;
    if (u.lot >= 0 && PLAN.lots[u.lot] && PLAN.lots[u.lot].well) acts.DRINK = (acts.DRINK || 0) + 4;   /* the courtyard's own well */
    var P = u.job ? VC.simPosts(ty.pieces || []) : { n: 0 };
    var door = ty.B && ty.B.doors[0] ? VC.ixWorldXZ(u, ty.B.doors[0].at) : [u.x, u.z];
    /* the spots: where people stand, at the work pieces first, then the seats, tables and beds (TUNE.sim.spotsMax) */
    var spots = [], R2 = function (v) { return Math.round(v * 100) / 100; }, SP = T.spotTypes;
    (ty.pieces || []).filter(function (p) { return p.anchor !== 'surface' && SP.indexOf(p.type) >= 0; })
      .sort(function (a, b) { return SP.indexOf(a.type) - SP.indexOf(b.type); }).slice(0, T.spotsMax)
      .forEach(function (p) { var w = VC.ixWorld(u, VC.simStand(p)); spots.push([R2(w.x), R2(w.z), R2(w.y)]); });
    reg({ id: 'ix.' + u.i, kind: kind, name: (ASSET_BY_KEY[u.key] || {}).name || u.site || u.key, x: u.x, z: u.z, y: u.y, ry: u.ry, door: { x: door[0], z: door[1], y: u.y },
          activities: acts, open: hrs(kind), pull: pullOf(kind === 'home' ? 'home' : kind), job: u.job, posts: P.n, workplaces: u.jobs || 0, spots: spots, tags: [u.cls, u.district], unit: u.i, indoor: true,
          access: kind === 'home' ? 'private' : undefined, guests: kind === 'home' && acts.VISIT ? { VISIT: T.visitR } : undefined });   /* a house: its own people only, and the neighbours visiting (phase C) */
  });
  /* the canton rooms: their workplaces and residents as the census counts them (TUNE.census.rooms) */
  Object.keys((VC.INT && VC.INT.cantons) || {}).forEach(function (cn) {
    (VC.INT.cantons[cn].rooms || []).forEach(function (r) {
      var e = K.rooms[r.kind]; if (!e) return;
      var label = (K.rooms.byCanton[cn] && K.rooms.byCanton[cn][r.kind]) || e[2], acts = {};
      if (e[1]) acts.SLEEP = e[1];
      if (T.worship.kinds.indexOf('canton-' + r.kind) >= 0) acts.WORSHIP = acts.CONTEMPLATE = Math.max(1, Math.floor((r.x1 - r.x0) * (r.z1 - r.z0) / T.worship.m2));   /* a canton shrine room's congregation */
      reg({ id: 'room.' + r.id, kind: 'canton-' + r.kind, name: cn + ' canton, ' + r.kind, x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2, y: r.y, activities: acts,
            open: e[0] ? [6, 20] : null, job: e[0] ? label : null, posts: e[0] || 0, workplaces: e[0] || 0, r: Math.min(r.x1 - r.x0, r.z1 - r.z0) / 2, tags: ['canton', cn], indoor: true,
            access: TUNE.sim.privateRooms.indexOf(r.kind) >= 0 ? 'private' : undefined });
    });
  });
  /* the Fortress's armoury: the central watchhouse (gear drawn at the shift's start) */
  var FR = (VC.INT && VC.INT.cantons && VC.INT.cantons.Fortress || { rooms: [] }).rooms.filter(function (r) { return r.kind === 'armoury'; })[0];
  if (FR) { var Pw = SIM.R.place['room.' + FR.id]; if (Pw) { Pw.activities.DRAW_TOOLS = 12; Pw.kind = 'watch'; Pw.tags.push('watchhouse central'); } }
  /* the wells */
  VC.SIMB.wells.concat([]).forEach(function (a, i) {
    reg({ id: 'well.' + i, kind: 'well', name: 'Well (' + a.where + ')', x: a.x, z: a.z, y: a.y, activities: { DRINK: 4, SOCIALIZE: 2 }, open: null, pull: pullOf('well'), tags: [a.where] });
  });
  /* the open places with furniture: the parks (benches, shrines, the parks' own wells), the markets (stalls), the burial
     ground (tombs), the canton square, the villages' greens: one place per district, at its furniture's middle */
  PLAN.districts.forEach(function (D, di) {
    if (!D.art || !D.art.length || D.name === 'Wells' || D.name === 'Shrines' || D.name === 'Benched squares' || D.name === 'House of Healing furnishings' || D.kind === 'chinampa huts') return;
    var kind = /market/.test(D.kind) ? 'market' : D.kind === 'funerary' ? 'funerary' : D.kind === 'village' ? 'plaza' : 'park';
    var cnt = {}, cx = 0, cz = 0, cy = 0, holds = 0;
    D.art.forEach(function (a) { if (/shrine|altar/.test(a.key)) holds += ((typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[a.key]) || {}).holds || T.worship.holds; var F = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[a.key]) || {}; var t = /stall/.test(a.key) ? 'stall' : /well/.test(a.key) ? 'well' : /tomb|sarcoph|ossuar|grave/.test(a.key) ? 'tomb' : /shrine|altar/.test(a.key) ? 'shrine' : /bench/.test(a.key) ? 'bench' : F.type || 'other';
      cnt[t] = (cnt[t] || 0) + 1; cx += a.x; cz += a.z; cy += a.y || 0; });
    var m = D.art.length, acts = {};
    if (cnt.bench) { acts.RELAX = cnt.bench * 3; acts.SOCIALIZE = cnt.bench * 2; acts.IDLE = cnt.bench * 3; }
    if (cnt.shrine) { acts.WORSHIP = holds; acts.CONTEMPLATE = holds; }   /* each shrine as many as it holds (a wayside shrine TUNE.sim.worship.holds) */
    if (cnt.well) acts.DRINK = cnt.well * 4;
    if (cnt.tomb) { acts.HONOUR = Math.max(10, Math.round(cnt.tomb / 4)); acts.CONTEMPLATE = (acts.CONTEMPLATE || 0) + acts.HONOUR; }
    if (cnt.stall) { acts.SELL = cnt.stall; acts.BUY = cnt.stall * 4; }
    if (!Object.keys(acts).length) acts.RELAX = Math.max(4, m);
    /* its spots: before its benches, stalls, shrines and tombs (its art pieces), and its reach: the furniture's spread */
    var spots = [], rr = 0;
    D.art.forEach(function (a) { rr = Math.max(rr, Math.hypot(a.x - cx / m, a.z - cz / m)); });
    D.art.filter(function (a) { return /stall|bench|shrine|altar|well|tomb|sarcoph/.test(a.key); }).slice(0, T.spotsMax).forEach(function (a) {
      var st = VC.simStand({ key: a.key, v: a.v, x: a.x, y: a.y || 0, z: a.z, ry: a.ry || 0 }); spots.push([Math.round(st.x * 100) / 100, Math.round(st.z * 100) / 100, Math.round(st.y * 100) / 100]); });
    reg({ id: 'open.' + di, kind: kind, name: D.name || kind, x: cx / m, z: cz / m, y: cy / m, activities: acts, open: hrs(kind), pull: pullOf(kind), spots: spots, r: Math.round(rr), wander: Math.min(30, Math.round(rr / 3)),
          job: cnt.stall ? 'market traders' : null, posts: cnt.stall ? cnt.stall * K.jobs.stall : 0, workplaces: cnt.stall ? cnt.stall * K.jobs.stall : 0, tags: [D.kind] });
  });
  /* every plaza and pocket park of the plan (phase C: more places to socialize): its room by its area (TUNE.sim.greens),
     its reach the green's, a little wander; the big parks are their districts' places (above) */
  var GR = T.greens;
  PLAN.greens.forEach(function (G, gi) {
    var gk = G.kind === 'plaza' ? 'plaza' : G.kind === 'park' ? 'park' : null; if (!gk || !G.poly) return;
    var area = Math.abs(polyArea(G.poly)), c = polyCentroid(G.poly), g = GR[gk], acts = {};
    ['SOCIALIZE', 'RELAX', 'IDLE'].forEach(function (a) { if (g[a]) { var n = Math.floor(area / g.m2 * g[a]); if (n >= GR.min) acts[a] = n; } });
    var gs = VC.SIMB.greenShrines && VC.SIMB.greenShrines[gi]; if (gs) { acts.WORSHIP = gs; acts.CONTEMPLATE = gs; }   /* its small shrine */
    /* a benched square by a canton (VC.simSquares): its benches seats besides its standing room, its spots before them */
    var SQ = G.square && VC.SIMB.squares && VC.SIMB.squares[G.id], spots = null;
    if (SQ) {
      acts.SOCIALIZE = (acts.SOCIALIZE || 0) + SQ.benches * 2; acts.RELAX = (acts.RELAX || 0) + SQ.benches * 3; acts.IDLE = (acts.IDLE || 0) + SQ.benches * 2;
      spots = [];
      PLAN.districts.forEach(function (D) { if (D.name === 'Benched squares') D.art.forEach(function (a) { if (a.square === G.id && /bench/.test(a.key) && spots.length < T.spotsMax) { var st = VC.simStand({ key: a.key, v: a.v, x: a.x, y: a.y || 0, z: a.z, ry: a.ry || 0 }); spots.push([Math.round(st.x * 100) / 100, Math.round(st.z * 100) / 100, Math.round(st.y * 100) / 100]); } }); });
    }
    if (!Object.keys(acts).length) return;
    var rr = Math.sqrt(area) / 2;
    reg({ id: 'green.' + gi, kind: gk === 'plaza' ? 'square' : 'green', name: SQ ? 'Benched square (' + G.square + ')' : gk === 'plaza' ? 'Square' : 'Pocket park', x: c[0], z: c[1], y: VC.walkY(c[0], c[1]), activities: acts, open: null,
          pull: pullOf(gk), r: Math.round(rr * 10) / 10, wander: Math.round(rr * GR.wander * 10) / 10, spots: spots || undefined, tags: SQ ? [G.square + ' canton', 'benched square'] : [G.district || gk] });
  });
  /* the outdoor work the census counts without furniture: its posts are the census's workplaces there (each its own
     place where the plan has one: a field, a pier, a mine; else one place at the work's middle) */
  var BR = TUNE.sim.needs && TUNE.sim.needs.barrel;   /* the country's outdoor work keeps a water barrel (phase C session 3) */
  var outdoor = function (job, recs, perRec, kind) { recs.forEach(function (q, i) { var n = perRec(q, i), acts = {}; if (BR && BR.kinds.indexOf(kind) >= 0 && n > 0) acts.DRINK = Math.max(1, Math.ceil(n / BR.per));
    /* its workers stand on what is there (VC.simStandSpots): a pier's deck, a chinampa bed, the shore; never the water round it */
    var R = q[2] != null ? Math.sqrt(q[2] * 1e4) / 2 : T.outdoorR[kind] || 12, st = standOn(q[0], q[1], R, T.outdoorR[kind] || 12, n);
    reg({ id: 'work.' + kind + '.' + i, kind: kind, name: job, x: q[0], z: q[1], y: st.y, activities: acts, open: [6, 19], job: job, posts: n, workplaces: n,
    r: R, spots: st.spots, wander: st.wander, tags: ['outdoor'] }); }); };
  var standOn = function (x, z, R, W, n) {
    var st = VC.simStandSpots(x, z, R, W, Math.min(T.spotsMax, Math.max(T.stand.spots, Math.ceil(n || 0)))), S = VC.SIMB.stand;
    S.sites++; if (st.wander < W) S.wanderCut++; if (st.moved > 0) S.moved++; if (!st.spots.length) S.none++;
    var y0 = VC.simStandY(x, z);
    return { spots: st.spots.length ? st.spots : undefined, wander: st.wander, y: y0 != null ? y0 : st.spots.length ? st.spots[0][2] : Math.max(VOTH.SEA, baseH(x, z)) };
  };
  VC.SIMB.stand = { sites: 0, wanderCut: 0, moved: 0, none: 0 };
  var fields = (PLAN.fields || []).filter(function (F) { return F.kind !== 'garden'; });
  outdoor('farmhands and ploughmen', fields.map(function (F) { return [F.bo.c[0], F.bo.c[1], 4 * F.bo.hw * F.bo.hd / 1e4]; }), function (q) { return q[2] * K.jobs.perHectare; }, 'field');
  var P0 = VOTH.PIERS || [], mid = function (q) { return [(q.x0 + q.x1) / 2, (q.z0 + q.z1) / 2]; };
  outdoor('fishers', P0.filter(function (q) { return q.fish; }).map(mid), function () { return K.jobs.fishDock; }, 'fishdock');
  outdoor('river bargemen and quay hands', P0.filter(function (q) { return q.river; }).map(mid), function () { return K.jobs.riverQuay; }, 'quay');
  outdoor('dockers and stevedores', P0.filter(function (q) { return !q.fish && !q.river && !q.ferry; }).map(mid), function () { return K.jobs.pier; }, 'pier');
  var IND = VC.industry || {}, at = function (q) { return q.x != null ? [q.x, q.z] : q.c ? [q.c[0], q.c[1]] : q.p ? [q.p[0], q.p[1]] : [q[0], q[1]]; };
  outdoor('miners', (IND.mines || []).map(at), function () { return K.jobs.mine; }, 'mine');
  outdoor('quarrymen and masons', (IND.quarries || []).map(at), function () { return K.jobs.quarry; }, 'quarry');
  outdoor('mushroom growers', (IND.mush || []).map(at), function () { return K.jobs.mushFarm; }, 'mushfarm');
  outdoor('granary keepers and millers', (IND.watermills || []).map(at).concat((VC.windmills || []).map(at)), function (q, i) { return i < (IND.watermills || []).length ? K.jobs.watermill : K.jobs.mill; }, 'mill');
  outdoor('granary keepers and millers', (VC.granarySites || []).map(at), function () { return K.jobs.granary; }, 'granary');   /* the Granary deck's granaries (33-vc-country.js) */
  /* the rest of the census's outdoor kinds of work: one place each, at the work's middle (the chinampas, the orchards, the
     ranches, the transit, the walls) */
  var C = PLAN.census && PLAN.census.byJob || {}, cc = VC.simCity().c;
  /* the walls: the soldiers' posts at the standing towers and the gates (their patrols are phase F's) */
  var WN = (VC.wall && VC.wall.nodes || []).filter(function (nd) { return nd.kind === 'tower' && !nd.skip && nd.health > 0; });
  outdoor('soldiers', WN.map(function (nd) { return [nd.x, nd.z]; }), function () { return T.wallPost.tower; }, 'tower');
  outdoor('soldiers', (VC.wall && VC.wall.gates || []).map(function (g) { return [g.x, g.z]; }), function () { return T.wallPost.gate; }, 'gate');
  /* the mustering ground: the soldiers' drill yard, a post every TUNE.sim.musterPerPost m2 of its footprint */
  PLAN.lots.forEach(function (L) { if (L.died == null && L.role === 'muster') reg({ id: 'work.muster.' + L.id, kind: 'drill', name: 'Mustering ground', x: L.x, z: L.z, y: L.y, activities: { TRAIN: Math.round(L.w * L.d / T.musterPerPost) }, open: [5, 20], job: 'soldiers', posts: Math.round(L.w * L.d / T.musterPerPost), tags: ['outdoor', 'drill'] }); });
  /* the Palace and the Temple wait for their interiors (the owner's references): their staffs at the canton, as the census counts them */
  Object.keys(K.cantons).forEach(function (cn) {
    if (VC.INT && VC.INT.cantons && VC.INT.cantons[cn]) return;
    var M = CANT.by[cn]; if (!M) return;
    reg({ id: 'work.canton.' + cn, kind: 'canton', name: cn + ' canton (no interior yet)', x: M.x, z: M.z, y: M.top ? M.top.y : 0, activities: {}, open: [6, 20], job: K.cantons[cn][1], posts: K.cantons[cn][0], workplaces: K.cantons[cn][0], r: M.r, tags: ['canton', cn, 'no interior'] });
  });
  /* the outdoor trades at their own sites (phase C: a citizen walks to them): the ferrymen at the ferry stops, the bug
     handlers at the strider stations, the chinampa growers at the stilt huts, the herders at the beetle ranches, the
     orchardmen on the orchard hill; each site an equal share of the census's workplaces */
  var share = function (job, recs, kind) { var want = C[job] ? C[job].n : 0; if (want && recs.length) outdoor(job, recs, function () { return want / recs.length; }, kind); };
  var stops = function (k) { return SIM.all('place').filter(function (Q) { return Q.kind === k; }).map(function (Q) { return [Q.door.x, Q.door.z]; }); };
  share('ferrymen', stops('ferry-stop'), 'ferry');
  share('elephant bug handlers and station hands', stops('strider-station'), 'station');
  share('chinampa growers', ((VC.chin && VC.chin.hutList) || []).filter(function (q) { return q[3]; }).map(function (q) { return [q[0], q[1]]; }), 'chinampa');
  share('beetle herders', IND.ranchAt || [], 'ranch');
  share('dairymen', IND.cowAt || [], 'dairy'); share('swineherds', IND.pigAt || [], 'sty'); share('duck keepers', IND.duckAt || [], 'coop');   /* the livestock (47-vc-sim-animals.js keeps their animals) */
  var OP = TUNE.country.orchard.poly; if (VC.orchardTrees) share('orchardmen', [polyCentroid(OP).concat([Math.abs(polyArea(OP)) / 1e4])], 'orchard');
  /* what is left of a kind of work with no site of its own: one place at the city's middle, for the workplaces (and the
     posts) the sites above and the buildings do not already hold */
  ['envoys and embassy staff', 'healers and nurses', 'monks and lay brothers (chapel, fields, coops)', 'chinampa growers', 'orchardmen', 'beetle herders', 'ferrymen',
   'elephant bug handlers and station hands'].forEach(function (job) {
    var want = C[job] ? C[job].n : 0, have = posts[job] || 0, haveW = wps[job] || 0; if (want <= have && want <= haveW) return;
    var sa = standOn(cc[0], cc[1], T.stand.near, 0, want - have);   /* the city's middle may be the bay: they stand on the nearest ground */
    reg({ id: 'work.' + job.replace(/\W+/g, '-'), kind: 'outdoor', name: job, x: cc[0], z: cc[1], y: sa.y, spots: sa.spots, activities: {}, open: [6, 19], job: job, posts: Math.max(0, want - have), workplaces: Math.max(0, want - haveW), tags: ['outdoor', 'aggregate'] });
  });
  VC.SIMB.places = n; VC.SIMB.posts = posts;
  return n;
};

/* ---------------------------------------------------------------- 4. the 90% rule and the job table */
VC.simWorkAudit = function () {
  var C = PLAN.census && PLAN.census.byJob || {}, T = TUNE.sim.target, rows = [], list = VC.SIMB.list || [];
  var byJob = {}; list.forEach(function (o) { if (!o.job) return; var e = byJob[o.job] || (byJob[o.job] = { posts: 0, places: 0, building: 0, canton: 0, outdoor: 0, open: 0, kinds: {} }); e.posts += o.posts; e.places++;
    var src = /^ix\./.test(o.id) ? 'building' : /^room\./.test(o.id) ? 'canton' : /^open\./.test(o.id) ? 'open' : 'outdoor'; e[src] += o.posts;
    if (o.unit != null) { var ty = VC.IX.types[VC.IX.units[o.unit].type], P = VC.simPosts(ty.pieces || []); Object.keys(P.by).forEach(function (k) { e.kinds[k] = (e.kinds[k] || 0) + P.by[k]; }); }
    else e.kinds[src === 'canton' ? 'canton rooms' : src === 'open' ? 'stalls' : 'outdoor'] = (e.kinds[src === 'canton' ? 'canton rooms' : src === 'open' ? 'stalls' : 'outdoor'] || 0) + o.posts; });
  var jobs = {}; Object.keys(C).forEach(function (k) { jobs[k] = 1; }); Object.keys(byJob).forEach(function (k) { jobs[k] = 1; });
  Object.keys(jobs).forEach(function (k) {
    var want = C[k] ? C[k].n : 0, e = byJob[k] || { posts: 0, places: 0, building: 0, canton: 0, outdoor: 0, open: 0, kinds: {} }, target = Math.ceil(want * T), r = { job: k, workplaces: want, target: target, posts: Math.round(e.posts),
      places: e.places, building: Math.round(e.building), canton: Math.round(e.canton), outdoor: Math.round(e.outdoor + e.open), kinds: e.kinds, short: Math.max(0, target - Math.round(e.posts)) };
    /* a short kind: its buildings with the most floor to spare for more posts (floor area per post) */
    if (r.short) r.room = list.filter(function (o) { return o.job === k && o.unit != null; }).map(function (o) { var u = VC.IX.units[o.unit], ty = VC.IX.types[u.type]; return { id: o.id, name: o.name, district: u.district, perPost: (ty.floorArea || 0) / Math.max(1, o.posts), floor: Math.round(ty.floorArea || 0), posts: o.posts }; })
      .sort(function (a, b) { return b.perPost - a.perPost || (a.id < b.id ? -1 : 1); }).slice(0, 5);
    rows.push(r);
  });
  rows.sort(function (a, b) { return b.short - a.short || b.workplaces - a.workplaces; });
  var tot = rows.reduce(function (s, r) { s.workplaces += r.workplaces; s.target += r.target; s.posts += Math.min(r.posts, r.target); return s; }, { workplaces: 0, target: 0, posts: 0 });
  VC.SIMB.audit = { rows: rows, total: tot, short: rows.filter(function (r) { return r.short; }).length };
  return VC.SIMB.audit;
};
