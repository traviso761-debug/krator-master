/* ============================== 5d. THE STEPS AND THE RUNNER ============================== */
/* [G data] Steps 0-12 are the street method on the site (30-32), 13 the country round it (33), 14 the ferry and
   elephant bug lines (34). */
SL.STEPS = ['the site and its ground', 'landmarks', 'districts, monastery, chinampas, harbour, river port', 'avenues', 'highways', 'the wall and its gates',
  'civic buildings', 'avenue lots', 'main streets', 'main-street lots', 'side streets', 'side-street lots, alley entrances', 'alleys and alley lots',
  'suburbs, farmland, villages, orchards', 'ferry and elephant bug lines'];
SL.LAST = 14;
SL.TRANSIT = 14;
/* Voth's city is a core/city instance (KCITY.create, core/city/40-city-kcity.js): its steps as data, a step's hooks
   after it, then the finish. The owner's edits and the caravanserai by the River Gate come after the avenues; the
   temples after the highways and the wall, still before the streets (42-vc-sim-places.js). The index keeps the old
   40 m probe's order ('buckets': the curve test reads the same lots) and the fields their old 160 m reach. */
VC.city = KCITY.create({
  tune: TUNE, seed: SL.seed,
  ground: { base: baseH, h: terrainH, pad: addPad, foot: baseY },
  kit: { dims: SL.dims },
  rules: { wealth: SL.wealth, choosers: SL.choosers, vacant: SL.vacant, roleAt: VC.roleAt },   /* steps 6-8's near scorers and the infill's reach: core's defaults */
  index: { order: 'buckets', fieldWindow: true, roadWindow: true },
  /* each step names its pass, read when it runs: a fragment loaded after this one wraps a pass (37-vc-light.js puts the
     power houses in at step 9) */
  steps: SL.STEPS.map(function (name, k) { return { name: name, run: function () { SL['pass' + k](); } }; }),
  finish: [
    function () { VC.applyDeletes(); },               /* the owner's deletions, once everything they could name exists */
    function () { VC.simBuildings(); },               /* 42-vc-sim-places.js: the citizens' buildings (trades, watchhouses, caravanserai, berth) */
    function () { VC.simSquares(12); VC.simVillageShrines(13); VC.simShipwrights(13); },   /* 42: benched squares by the cantons, the village shrines (phase C's overflow), the shipwright's docks */
    function () { VC.census(); },                     /* 36-vc-census.js: people and workplaces */
    function () { VC.lighting(); },                   /* 37-vc-light.js: power houses' reach, street lamps */
    function () { VC.canopies(); },                   /* 37b-vc-canopies.js: canopies and lanterns over the market and wealthy streets */
    function () { VC.parkFurniture(); },              /* 39-vc-furnish.js: benches, statues, shrines in the parks and plazas */
    function () { VC.wells(); VC.parkShrines(); },    /* 42-vc-sim-places.js: the wells (plazas, market squares, streets, yards) */
    function () { VC.flora(); }                       /* 38-vc-flora.js: where the swbay biome may root, and its climate */
  ]
});
VC.city.steps[3].after = [function () { VC.applyEdits(3); }, function () { VC.simCaravanserai(3); }];
VC.city.steps[5].after = [function () { VC.simTemples(5); }];
SL.layout = function () { return VC.city.run(); };
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

/* ---------------------------------------------------------------- the owner's edits (settlements/voth/edits.json) */
/* The editor is core/host's (98-host-edit.js, ROADMAP.md section 10 step 6b): every edit a core/edits op in one log,
   saved to settlements/voth/edits.json and inlined by build.py as KHOST_EDITS (core/host/host.py edits_js; a newer draft
   in the browser wins). The layout reads it as {buildings: [{key, v, x, z, ry}], streets: [{cls, pts}], del: [{x, z}],
   flora: {del: [{kind, key, x, z}], add: [{kind, key, x, y, z, H}]}} (VC.editsFromLog). Painted streets and placed kit
   buildings join the plan right after the avenues (step 3), so every later street and lot works round them: a placed
   building takes out any lot it overlaps and stands on HARD ground; a painted street is an ordinary way of its class. A
   deletion takes out the standing building under its point once the whole plan is laid, from the step it was born (so
   it never shows). The flora's go to the swbay kit's veto and VC.flAddSaved (59-vc-flora-edit.js). */
VC.edits = function () {
  if (VC.EDITS === undefined) VC.EDITS = typeof KHOST_EDITS !== 'undefined' && KHOST_EDITS ? VC.editsFromLog(KHOST_EDITS) : null;
  return VC.EDITS;
};
/* the log in the layout's shape, in log order: an ADD of a building, a way or a plant places it; a REMOVE of one placed
   earlier in the log takes it back, of anything else is a deletion (a building by its point, a plant by its kind, key and
   point); a MOVE of one placed earlier moves it, of a building of the plan deletes it there and places it where it went
   (its variant is on the op as `v`, 97-vc-host-take.js); SET changes nothing the layout reads. A flora record without a
   kind (an import) is a tree when the swbay kit has the species */
VC.editsFromLog = function (L) {
  var E = { buildings: [], streets: [], del: [], flora: { del: [], add: [] } }, r2 = function (v) { return +(+v).toFixed(2); };
  var find = function (list, t, xz) { for (var i = list.length - 1; i >= 0; i--) { var p = xz(list[i]); if ((list[i].key === t.key || list[i].cls === t.key) && Math.hypot(p[0] - t.at[0], p[1] - t.at[2]) <= 1.5) return i; } return -1; };
  var bXZ = function (b) { return [b.x, b.z]; }, sXZ = function (s) { return s.pts[0]; };
  var kindOf = function (r) { return r.kind || (typeof SWBAY !== 'undefined' && (SWBAY.SPECIES || []).some(function (S) { return S.key === r.key; }) ? 'tree' : 'plant'); };
  ((L && L.ops) || []).forEach(function (o) {
    var t = o.target || {}, c = t['class'], R = o.rec || {}, i;
    if (o.op === 'ADD') {
      if (c === 'building') E.buildings.push({ key: R.key, v: R.variant || 0, x: r2(R.at[0]), z: r2(R.at[2]), ry: R.ry || 0 });
      else if (c === 'infrastructure' && R.kind === 'way' && R.pts && R.pts.length > 1) E.streets.push({ cls: R.key, pts: R.pts.map(function (p) { return [p[0], p[1]]; }) });
      else if (c === 'flora') { var a = { kind: kindOf(R), key: R.key, x: r2(R.at[0]), z: r2(R.at[2]), y: r2(R.at[1]) }; if (R.H != null) a.H = R.H; E.flora.add.push(a); }
    } else if (o.op === 'REMOVE') {
      /* a REMOVE without a key (Streetlab's del, imported) is a deletion by point, as the old file was laid */
      if (c === 'building') { if (t.key != null && (i = find(E.buildings, t, bXZ)) >= 0) E.buildings.splice(i, 1); else E.del.push({ x: r2(t.at[0]), z: r2(t.at[2]) }); }
      else if (c === 'infrastructure') { if ((i = find(E.streets, t, sXZ)) >= 0) E.streets.splice(i, 1); }
      else if (c === 'flora') { if ((i = find(E.flora.add, t, bXZ)) >= 0) E.flora.add.splice(i, 1); else E.flora.del.push({ kind: kindOf(R.key ? R : t), key: t.key, x: r2(t.at[0]), z: r2(t.at[2]) }); }
    } else if (o.op === 'MOVE') {
      var b, ry = o.ry != null ? o.ry : null;
      if (c === 'building') {
        if ((i = find(E.buildings, t, bXZ)) >= 0) { b = E.buildings[i]; b.x = r2(o.at[0]); b.z = r2(o.at[2]); if (ry != null) b.ry = ry; }
        else { E.del.push({ x: r2(t.at[0]), z: r2(t.at[2]) }); E.buildings.push({ key: t.key, v: o.v || 0, x: r2(o.at[0]), z: r2(o.at[2]), ry: ry != null ? ry : (o.from && o.from.ry) || 0 }); }
      } else if (c === 'flora') {
        if ((i = find(E.flora.add, t, bXZ)) >= 0) { b = E.flora.add[i]; b.x = r2(o.at[0]); b.z = r2(o.at[2]); b.y = r2(o.at[1]); }
        else { E.flora.del.push({ kind: o.kind || kindOf(t), key: t.key, x: r2(t.at[0]), z: r2(t.at[2]) }); E.flora.add.push({ kind: o.kind || kindOf(t), key: t.key, x: r2(o.at[0]), z: r2(o.at[2]), y: r2(o.at[1]) }); }
      } else if (c === 'infrastructure' && (i = find(E.streets, t, sXZ)) >= 0) {
        var s = E.streets[i], dx = o.at[0] - s.pts[0][0], dz = o.at[2] - s.pts[0][1]; s.pts = s.pts.map(function (p) { return [r2(p[0] + dx), r2(p[1] + dz)]; });
      }
    }
  });
  return E;
};
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
