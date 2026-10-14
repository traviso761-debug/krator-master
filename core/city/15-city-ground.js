/* ============================== 2b. THE GROUND: HEIGHT, A LOT'S GROUND TEST, ITS STANCE ============================== */
/* [G data] What the builder asks of the ground, through the bound instance's ground (KCITY.create({ground})):
     CG.base(x, z)   the ground the passes read (Voth: the site's edited ground, sampled once)
     CG.h(x, z)      the ground a thing stands on (the same, or finer)
     CG.pad(o)       a levelled pad's height under footprint o (a civic building's)
     CG.foot(o)      a building's foot: its lowest corner, a little under
   A world gives {h} and may give the rest (KCITY.groundOf fills them from h); Voth gives its own four functions.

   Per lot, both opt-in (a world that sets neither places exactly as before):
     rules.groundOk(bo, lot)  the world's ground predicate: false refuses the lot (slope, water, karst...).
                              KCITY.reliefOk({maxRelief, dry}) makes the common one.
     tune.stance              Erewhon's stance (settlements/xanadu/targets/erewhon/88-er-place.js), ported as plain
                              functions on footprint records:
       'high'  KCITY.stance: the base at the highest corner, the footing dropping to the lowest; refused when the
               drop is past maxDrop;
       'door'  KCITY.stanceAtDoor: a street house's floor at the street's level at its door, its back cut into the
               rising ground behind by at most `cut`; the footing fills down to the lowest corner.
     The lot then stands at the stance's y and carries `drop` (the footing's depth below it). */
var CG = null;
KCITY.groundOf = function (g) {
  g = g || {};
  var h = g.h || g.base || function () { return 0; }, base = g.base || h;
  var G = { h: h, base: base };
  G.pad = g.pad || function (o) { var C = obbCorners(o), y = base(o.c[0], o.c[1]); C.forEach(function (p) { y += base(p[0], p[1]); }); return y / 5; };
  G.foot = g.foot || function (o) { var C = obbCorners(o), y = h(o.c[0], o.c[1]); C.forEach(function (p) { y = Math.min(y, h(p[0], p[1])); }); return y - 0.15; };
  G.grid = g.grid || null;   /* the ground-delta interface (pads and banks, 25-city-site.js), when the world has one */
  return G;
};

/* the lowest and highest ground under a footprint: its corners pulled in by `inset` and its middle (Erewhon's samples) */
KCITY.groundSpan = function (o, h, inset) {
  var q = obb(o.c, o.u, Math.max(0, o.hw - inset), Math.max(0, o.hd - inset)), lo = Infinity, hi = -Infinity;
  obbCorners(q).concat([o.c]).forEach(function (p) { var y = h(p[0], p[1]); if (y < lo) lo = y; if (y > hi) hi = y; });
  return { lo: lo, hi: hi };
};
/* the stance: the base at the highest corner, the footing dropping to the lowest; null when the drop is past maxDrop.
   opt: maxDrop (14), inset (0.5), lift (0.05: the floor over the high corner), footing (0.6: the footing's extra depth) */
KCITY.stance = function (o, h, opt) {
  opt = opt || {};
  var maxDrop = opt.maxDrop == null ? 14 : opt.maxDrop, S = KCITY.groundSpan(o, h, opt.inset == null ? 0.5 : opt.inset), drop = S.hi - S.lo;
  if (drop > maxDrop) return null;
  return { y: S.hi + (opt.lift == null ? 0.05 : opt.lift), drop: drop + (opt.footing == null ? 0.6 : opt.footing) };
};
/* a street house's stance: the floor at the street's level at its door (yDoor), the back sunk into the rising ground
   behind by at most opt.cut (6), the footing filling down to the lowest corner (at most opt.maxDrop, 14). null past either */
KCITY.stanceAtDoor = function (o, yDoor, h, opt) {
  opt = opt || {};
  var maxDrop = opt.maxDrop == null ? 14 : opt.maxDrop, cut = opt.cut == null ? 6 : opt.cut;
  var S = KCITY.groundSpan(o, h, opt.inset == null ? 0.5 : opt.inset), y = yDoor + (opt.lift == null ? 0.05 : opt.lift);
  if (S.hi - y > cut || y - S.lo > maxDrop) return null;
  return { y: y, drop: Math.max(0, y - S.lo) + (opt.footing == null ? 0.6 : opt.footing) };
};
/* the stance a lot on a way takes under tune.stance ('high' or 'door'; tune.stanceOpt: maxDrop, cut, cutK). The door
   is on the street's kerb at the lot's middle; `cut` defaults to cutK (0.6) of the building's height, at most 6 m */
KCITY.lotStance = function (mode, bo, item, way, side, s) {
  var T = TUNE.stanceOpt || {}, h = CG.h;
  if (mode === 'high') return KCITY.stance(bo, h, T);
  var p = way.F.at(s), n = V.mul(V.perp(way.F.tan(s, 4)), side), kerb = V.add(p, V.mul(n, way.w / 2));
  var cut = T.cut != null ? T.cut : Math.min(6, (item.h || 8) * (T.cutK == null ? 0.6 : T.cutK));
  return KCITY.stanceAtDoor(bo, h(kerb[0], kerb[1]), h, { maxDrop: T.maxDrop == null ? 12 : T.maxDrop, cut: cut, inset: T.inset, lift: T.lift, footing: T.footing });
};
/* a ground predicate for rules.groundOk: dry (every sample above `dry`) and level enough (relief within maxRelief),
   over the corners, the middle and the edges' middles */
KCITY.reliefOk = function (opt) {
  opt = opt || {};
  var dry = opt.dry == null ? 0.5 : opt.dry, maxRelief = opt.maxRelief == null ? 2.5 : opt.maxRelief;
  return function (o) {
    var C = obbCorners(o), pts = C.concat([o.c]), lo = Infinity, hi = -Infinity;
    for (var i = 0; i < 4; i++) pts.push(V.lerp(C[i], C[(i + 1) % 4], 0.5));
    for (var k = 0; k < pts.length; k++) { var y = CG.h(pts[k][0], pts[k][1]); if (y < dry) return false; if (y < lo) lo = y; if (y > hi) hi = y; }
    return hi - lo <= maxRelief;
  };
};
