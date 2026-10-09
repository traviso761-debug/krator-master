/* ============================== 5d. THE STEPS AND THE RUNNER ============================== */
/* [G data] Steps 0-12 are the street method on the site (30-32), 13 the country round it (33), 14 the ferry and
   elephant bug lines (34). */
SL.STEPS = ['the site and its ground', 'landmarks', 'districts, monastery, chinampas, harbour, river port', 'avenues', 'highways', 'the wall and its gates',
  'civic buildings', 'avenue lots', 'main streets', 'main-street lots', 'side streets', 'side-street lots, alley entrances', 'alleys and alley lots',
  'suburbs, farmland, villages, orchards', 'ferry and elephant bug lines'];
SL.LAST = 14;
SL.TRANSIT = 14;
SL.layout = function () {
  SL.newPlan(); SL.F = null; SL._items = {}; SL.HASH = new Map(); PLAN.stats.ms = [];
  for (var k = 0; k <= SL.LAST; k++) { var t = Date.now(); SL['pass' + k](); if (k === 3) VC.applyEdits(3); PLAN.stats.ms[k] = Date.now() - t; }
  VC.applyDeletes();               /* the owner's deletions, once everything they could name exists */
  VC.census();                     /* 36-vc-census.js: people and workplaces */
  VC.lighting();                   /* 37-vc-light.js: power houses' reach, street lamps */
  VC.parkFurniture();              /* 39-vc-furnish.js: benches, statues, shrines in the parks and plazas */
  VC.flora();                      /* 38-vc-flora.js: where the swbay biome may root, and its climate */
  SL.count();
  return PLAN;
};
SL.count = function () {
  var S = PLAN.stats; S.byStep = [];
  for (var st = 0; st <= SL.LAST; st++) {
    var o = { lots: {}, ways: {}, greens: {} };
    PLAN.lots.forEach(function (L) { if (L.born <= st && (L.died == null || L.died > st)) o.lots[L.cls] = (o.lots[L.cls] || 0) + 1; });
    PLAN.ways.forEach(function (w) { if (w.born <= st) { var e = o.ways[w.cls] || (o.ways[w.cls] = { n: 0, m: 0 }); e.n++; e.m += w.F.len; } });
    PLAN.greens.forEach(function (g) { if (g.born <= st) o.greens[g.kind] = (o.greens[g.kind] || 0) + 1; });
    S.byStep.push(o);
  }
};

/* ---------------------------------------------------------------- the owner's edits (site/voth-city-edits.json) */
/* The city plan's editor (58-vc-tools.js) saves {buildings: [{key, v, x, z, ry}], streets: [{cls, pts}], del: [{x, z}]}.
   Painted streets and placed kit buildings join the plan right after the avenues (step 3), so every later street and
   lot works round them: a placed building takes out any lot it overlaps and stands on HARD ground; a painted street is
   an ordinary way of its class. A deletion takes out the standing building under its point once the whole plan is
   laid, from the step it was born (so it never shows). VC.EDITS is what the page read from the file; EDITS_INIT is
   what build.py inlined. */
VC.edits = function () { return VC.EDITS || (typeof EDITS_INIT !== 'undefined' ? EDITS_INIT : null); };
VC.kitClass = function (key) { for (var c in TUNE.classes) if (TUNE.classes[c].some(function (kv) { return kv[0] === key; })) return c; return 'placed'; };
VC.placedLot = function (b, step) {
  var D = SL.dims(b.key, b.v || 0); if (!D) return null;
  var ry = b.ry || 0, f = [Math.sin(ry), Math.cos(ry)], bo = obb([b.x, b.z], V.perp(f), D.w / 2, D.d / 2), lot = VC.grow(bo, 1.5);
  PLAN.lots.forEach(function (L) { if (L.died == null && L.bo && Math.abs(L.x - b.x) < 120 && Math.abs(L.z - b.z) < 120 && SL.pen(lot, L.bo) > 0.1) SL.killLot(L, step); });
  var L = { id: PLAN.lots.length, cls: VC.kitClass(b.key), key: b.key, v: b.v || 0, slot: 0, wealth: 0.6, x: b.x, z: b.z, y: baseY(bo), ry: ry, w: D.w, d: D.d, h: D.h,
            lot: lot, bo: bo, way: -1, side: 0, s: 0, born: step, died: null, placed: true };
  PLAN.lots.push(L); SL.hashLot(L); SL.R.stampPoly(obbCorners(lot), OCC.HARD, L.id);
  return L;
};
VC.applyEdits = function (step) {
  var E = VC.edits(), nW = 0, nB = 0; if (!E) return;
  (E.streets || []).forEach(function (s) { if (s.pts && s.pts.length > 1 && TUNE.width[s.cls] != null) { SL.addWay(s.cls, s.pts, step, { tag: 'painted street' }); nW++; } });
  (E.buildings || []).forEach(function (b) { if (VC.placedLot(b, step)) nB++; });
  if (nW || nB) SL.note(step, 'the owner’s edits: ' + nW + ' painted streets, ' + nB + ' placed kit buildings');
};
VC.lotAt = function (x, z, pad) {
  var best = null, bd = Infinity;
  PLAN.lots.forEach(function (L) {
    if (L.died != null || !L.bo || Math.abs(L.x - x) > 80 || Math.abs(L.z - z) > 80) return;
    var o = L.bo, dx = x - o.c[0], dz = z - o.c[1], u = Math.abs(dx * o.u[0] + dz * o.u[1]) - o.hw, v = Math.abs(dx * o.v[0] + dz * o.v[1]) - o.hd, d = Math.max(u, v, 0);
    if (d <= (pad || 0) && d < bd) { bd = d; best = L; }
  });
  return best;
};
VC.applyDeletes = function () {
  var E = VC.edits(), n = 0; if (!E) return;
  (E.del || []).forEach(function (q) { var L = VC.lotAt(q.x, q.z, 1.5); if (L) { SL.killLot(L, L.born); L.deleted = true; n++; } });
  if (n) SL.note(SL.LAST, 'the owner’s edits: ' + n + ' buildings deleted');
};
