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
      - the caravanserai stands on free, level, dry ground by the land gate (VC.placedLot, as an owner's placed building);
      - the coast-guard berth stands on the water off the Fortress's apron, clear of every bridge, causeway and pier, on
        a stone footing (a prim group the host draws).
   2. THE WELLS (VC.wells, after the park furniture): voth_well on every plaza and market square, along the residential
      streets every TUNE.sim.wells.street m, in every manor's and clan compound's yard; none nearer another than `gap`.
      They are the district art of a 'Wells' district (drawn and inspected as the other furniture).
   3. THE PLACES (VC.simPlaces, after the interiors): every building with an interior (VC.IX units), every canton
      room, every well, park, market and burial ground, and the outdoor work (fields, piers, mines...) becomes a
      SIM.place with its activities (its furniture read through TUNE.sim.furnAct over core/simulation's SIM.FURN_ACT),
      its opening hours, its pull for free time (TUNE.sim.pull), and its work posts with their kind of work.
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
    var cand = PLAN.lots.filter(function (L) { return L.died == null && !L.deck && tr.from.indexOf(L.cls) >= 0 && !taken[L.id] && (!L.country || /village|suburb/.test(L.country)) && VC.simFit(L, tr.key); });
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
    C.lots.forEach(function (L) { if (taken[L.id] || W.from.indexOf(L.cls) < 0) return; var dd = Math.hypot(L.x - t[0], L.z - t[1]); if (dd < bd && VC.simFit(L, W.key)) { bd = dd; best = L; } });
    if (best && VC.simConvert(best, W.key, 'civic', 'watchhouse')) { taken[best.id] = 1; best.watch = name; VC.SIMB.placed.watch.push({ name: name, lot: best.id }); }
  });
  log.push(VC.SIMB.placed.watch.length + ' watchhouses (' + VC.SIMB.placed.watch.map(function (w) { return w.name; }).join(', ') + '; the central one is the Fortress’s armoury)');
  /* the caravanserai: the nearest free, level, dry ground to the land gate */
  var CV = P.caravanserai, G = (VC.wall && VC.wall.gates || []).filter(function (g) { return g.name === CV.gate; })[0], D = SL.dims(CV.key, 0);
  if (G && D) {
    /* outside the gate on dry, level ground off the roads and fields near the gate's own height (33-vc-country.js's
       test); else just inside it, on level ground the street method built on: it takes the place of the houses it
       overlaps (as an owner's placed building does) and may close an alley, but never a street, a park, a plaza or a
       market. The nearest wins. (2026-10-12: no gate has level ground outside within 700 m; the wall runs on the hills) */
    var found = null, gy = baseH(G.x, G.z), cells = [OCC.FREE, OCC.LOT, OCC.ALLEY];   /* a block's alleys may close at its walls; a street never */
    for (var r = 30; r <= CV.reach && !found; r += 10) for (var a = 0; a < 48 && !found; a++) {
      var ang = a / 48 * Math.PI * 2, p = [G.x + Math.cos(ang) * r, G.z + Math.sin(ang) * r], f = V.norm([G.x - p[0], G.z - p[1]]);
      var o = obb(p, V.perp(f), D.w / 2 + CV.pad, D.d / 2 + CV.pad), rel = VC.relief(o);
      if (rel.hi - rel.lo > CV.slope || rel.lo < 1 || Math.abs((rel.lo + rel.hi) / 2 - gy) > CV.climb) continue;
      var ok = VC.countryOk(o, { cityPad: 0, road: 4 }), inside = false;
      if (!ok) {
        ok = true; inside = true;
        for (var i = -3; i <= 3 && ok; i++) for (var j = -3; j <= 3 && ok; j++) {
          var q = V.add(o.c, V.add(V.mul(o.u, o.hw * i / 3), V.mul(o.v, o.hd * j / 3)));
          if (cells.indexOf(SL.R.at(q[0], q[1])) < 0 || VC.roleAt(q) === 'park' || VC.roleAt(q) === 'plaza' || VC.roleAt(q) === 'market') ok = false;
        }
        if (ok && PLAN.lots.some(function (L) { return taken[L.id] && L.died == null && SL.pen(o, L.bo) > 0; })) ok = false;   /* never a trade or watchhouse just placed */
      }
      if (ok) found = { p: p, ry: Math.atan2(f[0], f[1]), inside: inside, r: r };
    }
    if (found) {
      var before = PLAN.lots.filter(function (L) { return L.died == null; }).length;
      var Lc = VC.placedLot({ key: CV.key, v: 0, x: found.p[0], z: found.p[1], ry: found.ry }, 13);
      if (Lc) { Lc.cls = 'tavern'; Lc.role = 'caravanserai'; Lc.placed = false; VC.SIMB.placed.caravanserai = Lc.id;
        var gone = before + 1 - PLAN.lots.filter(function (L) { return L.died == null; }).length;
        log.push('the caravanserai ' + Math.round(found.r) + ' m from the ' + CV.gate + (found.inside ? ', inside the wall' + (gone ? ', in place of ' + gone + ' houses' : '') : ', outside the wall')); }
    } else log.push('no ground for the caravanserai by the ' + CV.gate);
  }
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

/* ---------------------------------------------------------------- 2. the wells */
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

/* ---------------------------------------------------------------- 3. the places */
VC.SIM_KIND = { poor: 'home', middle: 'home', rich: 'home', manor: 'home', clan: 'home', farm: 'home', monastery: 'home', 'chinampa hut': 'home', keeper: 'home',
                shop: 'shop', craft: 'craft', tavern: 'tavern', warehouse: 'warehouse', industrial: 'industrial', civic: 'civic', landmark: 'civic',
                shrine: 'shrine', chapel: 'chapel', funerary: 'funerary', healing: 'healing', lighthouse: 'lighthouse', hall: 'civic' };
VC.simPosts = function (pieces) {
  var T = TUNE.ix, PC = TUNE.sim.posts, n = 0, by = {};
  pieces.forEach(function (p) {
    if (T.work.indexOf(p.kind) < 0 || p.anchor === 'surface') return;
    if (T.posts.indexOf(p.type) < 0 && (T.postsIn[p.kind] || []).indexOf(p.type) < 0) return;
    var c = PC[p.type] == null ? 1 : PC[p.type]; n += c; by[p.type] = (by[p.type] || 0) + c;
  });
  return { n: n, by: by };
};
VC.simActs = function () {
  var add = function (a) { if (!SIM.R.activity || !SIM.R.activity[a]) SIM.activity({ id: a, indoor: ['SLEEP', 'EAT', 'STUDY', 'COOK', 'WEAVE', 'STORE', 'STORE_FOOD', 'HEAL'].indexOf(a) >= 0 }); };
  ['SLEEP', 'EAT', 'DRINK', 'SOCIALIZE', 'RELAX', 'CONTEMPLATE', 'WORSHIP', 'HONOUR', 'BUY', 'SELL', 'KEEP_SHOP', 'COOK', 'STUDY', 'CRAFT', 'WEAVE', 'STORE', 'STORE_FOOD',
   'DRAW_TOOLS', 'TRAIN', 'HEAL', 'WORK', 'REST', 'IDLE'].forEach(add);
  Object.keys(TUNE.sim.furnAct).forEach(function (k) { if (TUNE.sim.furnAct[k]) add(TUNE.sim.furnAct[k]); });
  Object.keys(SIM.FURN_ACT).forEach(function (k) { add(SIM.FURN_ACT[k]); });
};
VC.simPlaces = function () {
  if (typeof SIM === 'undefined' || !SIM.place) return 0;
  VC.simActs();
  var T = TUNE.sim, n = 0, K = TUNE.census, posts = {}, list = VC.SIMB.list = [];
  var hrs = function (kind) { var h = T.hours[kind]; return h ? h.slice() : null; };
  var pullOf = function (kind) { return T.pull[kind] ? Object.assign({}, T.pull[kind]) : null; };
  var reg = function (o) {
    if (o.job && o.posts) { o.activities.WORK = Math.max(1, Math.round(o.posts)); posts[o.job] = (posts[o.job] || 0) + o.posts; }
    try { SIM.place(o); list.push(o); n++; } catch (e) { VC.SIMB.err = String(e); }
  };
  /* the buildings with an interior */
  VC.IX.units.forEach(function (u) {
    var ty = VC.IX.types[u.type]; if (!ty) return;
    var kind = u.residents && !u.job ? 'home' : (VC.SIM_KIND[u.site || u.cls] || u.cls);
    var pcs = (ty.pieces || []).map(function (p) { return { type: p.type, role: p.catRole, job: (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[p.key] || {}).job || null, kind: p.kind, anchor: p.anchor }; });
    var acts = SIM.slotsFromFurniture(pcs.filter(function (p) { return p.anchor !== 'surface'; }), T.furnAct);
    if (u.beds) acts.SLEEP = u.beds * TUNE.ix.per;
    if (kind === 'shop' || kind === 'craft') acts.BUY = Math.max(2, (acts.KEEP_SHOP || 1) * 3);
    if (kind === 'tavern') { acts.DRINK = (acts.DRINK || 0) + (acts.EAT || 0); acts.SOCIALIZE = (acts.SOCIALIZE || 0) + (acts.EAT || 0); }
    if (kind === 'healing') acts.HEAL = u.beds;
    if (u.lot >= 0 && PLAN.lots[u.lot] && PLAN.lots[u.lot].well) acts.DRINK = (acts.DRINK || 0) + 4;   /* the courtyard's own well */
    var P = u.job ? VC.simPosts(ty.pieces || []) : { n: 0 };
    var door = ty.B && ty.B.doors[0] ? VC.ixWorldXZ(u, ty.B.doors[0].at) : [u.x, u.z];
    reg({ id: 'ix.' + u.i, kind: kind, name: (ASSET_BY_KEY[u.key] || {}).name || u.site || u.key, x: u.x, z: u.z, y: u.y, ry: u.ry, door: { x: door[0], z: door[1], y: u.y },
          activities: acts, open: hrs(kind), pull: pullOf(kind === 'home' ? 'home' : kind), job: u.job, posts: P.n, tags: [u.cls, u.district], unit: u.i });
  });
  /* the canton rooms: their workplaces and residents as the census counts them (TUNE.census.rooms) */
  Object.keys((VC.INT && VC.INT.cantons) || {}).forEach(function (cn) {
    (VC.INT.cantons[cn].rooms || []).forEach(function (r) {
      var e = K.rooms[r.kind]; if (!e) return;
      var label = (K.rooms.byCanton[cn] && K.rooms.byCanton[cn][r.kind]) || e[2], acts = {};
      if (e[1]) acts.SLEEP = e[1];
      reg({ id: 'room.' + r.id, kind: 'canton-' + r.kind, name: cn + ' canton, ' + r.kind, x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2, y: r.y, activities: acts,
            open: e[0] ? [6, 20] : null, job: e[0] ? label : null, posts: e[0] || 0, tags: ['canton', cn] });
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
    if (!D.art || !D.art.length || D.name === 'Wells' || D.name === 'House of Healing furnishings' || D.kind === 'chinampa huts') return;
    var kind = /market/.test(D.kind) ? 'market' : D.kind === 'funerary' ? 'funerary' : D.kind === 'village' ? 'plaza' : 'park';
    var cnt = {}, cx = 0, cz = 0, cy = 0;
    D.art.forEach(function (a) { var F = (typeof FURN_BY_KEY !== 'undefined' && FURN_BY_KEY[a.key]) || {}; var t = /stall/.test(a.key) ? 'stall' : /well/.test(a.key) ? 'well' : /tomb|sarcoph|ossuar|grave/.test(a.key) ? 'tomb' : /shrine|altar/.test(a.key) ? 'shrine' : /bench/.test(a.key) ? 'bench' : F.type || 'other';
      cnt[t] = (cnt[t] || 0) + 1; cx += a.x; cz += a.z; cy += a.y || 0; });
    var m = D.art.length, acts = {};
    if (cnt.bench) { acts.RELAX = cnt.bench * 3; acts.SOCIALIZE = cnt.bench * 2; }
    if (cnt.shrine) { acts.WORSHIP = cnt.shrine * 4; acts.CONTEMPLATE = cnt.shrine * 4; }
    if (cnt.well) acts.DRINK = cnt.well * 4;
    if (cnt.tomb) { acts.HONOUR = Math.max(10, Math.round(cnt.tomb / 4)); acts.CONTEMPLATE = (acts.CONTEMPLATE || 0) + acts.HONOUR; }
    if (cnt.stall) { acts.SELL = cnt.stall; acts.BUY = cnt.stall * 4; }
    if (!Object.keys(acts).length) acts.RELAX = Math.max(4, m);
    reg({ id: 'open.' + di, kind: kind, name: D.name || kind, x: cx / m, z: cz / m, y: cy / m, activities: acts, open: hrs(kind), pull: pullOf(kind),
          job: cnt.stall ? 'market traders' : null, posts: cnt.stall ? cnt.stall * K.jobs.stall : 0, tags: [D.kind] });
  });
  /* the outdoor work the census counts without furniture: its posts are the census's workplaces there (each its own
     place where the plan has one: a field, a pier, a mine; else one place at the work's middle) */
  var outdoor = function (job, recs, perRec, kind) { recs.forEach(function (q, i) { reg({ id: 'work.' + kind + '.' + i, kind: kind, name: job, x: q[0], z: q[1], y: Math.max(VOTH.SEA, baseH(q[0], q[1])), activities: {}, open: [6, 19], job: job, posts: perRec(q, i), tags: ['outdoor'] }); }); };
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
  /* the rest of the census's outdoor kinds of work: one place each, at the work's middle (the chinampas, the orchards, the
     ranches, the transit, the walls) */
  var C = PLAN.census && PLAN.census.byJob || {}, cc = VC.simCity().c;
  /* the walls: the soldiers' posts at the standing towers and the gates (their patrols are phase F's) */
  var WN = (VC.wall && VC.wall.nodes || []).filter(function (nd) { return nd.kind === 'tower' && !nd.skip && nd.health > 0; });
  outdoor('soldiers', WN.map(function (nd) { return [nd.x, nd.z]; }), function () { return T.wallPost.tower; }, 'tower');
  outdoor('soldiers', (VC.wall && VC.wall.gates || []).map(function (g) { return [g.x, g.z]; }), function () { return T.wallPost.gate; }, 'gate');
  /* the Palace and the Temple wait for their interiors (the owner's references): their staffs at the canton, as the census counts them */
  Object.keys(K.cantons).forEach(function (cn) {
    if (VC.INT && VC.INT.cantons && VC.INT.cantons[cn]) return;
    var M = CANT.by[cn]; if (!M) return;
    reg({ id: 'work.canton.' + cn, kind: 'canton', name: cn + ' canton (no interior yet)', x: M.x, z: M.z, y: M.top ? M.top.y : 0, activities: {}, open: [6, 20], job: K.cantons[cn][1], posts: K.cantons[cn][0], tags: ['canton', cn, 'no interior'] });
  });
  ['chinampa growers', 'orchardmen', 'beetle herders', 'ferrymen', 'elephant bug handlers and station hands', 'envoys and embassy staff', 'healers and nurses',
   'monks and lay brothers (chapel, fields, coops)'].forEach(function (job) {
    var have = posts[job] || 0, want = C[job] ? C[job].n : 0; if (want <= have) return;
    reg({ id: 'work.' + job.replace(/\W+/g, '-'), kind: 'outdoor', name: job, x: cc[0], z: cc[1], y: 0, activities: {}, open: [6, 19], job: job, posts: want - have, tags: ['outdoor', 'aggregate'] });
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
