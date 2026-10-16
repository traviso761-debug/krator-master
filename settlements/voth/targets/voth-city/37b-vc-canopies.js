/* ============================== 5f2. CANOPIES AND LANTERNS OVER THE STREETS ============================== */
/* [G data] The owner (2026-10-15, from the "canopy" reference): "add some hanging canopies and lanterns around the city":
   in the market quarter and the wealthy streets, cloth sheets strung on ropes between the buildings that face each
   other across a narrow street, paper lanterns hung along the ropes. A canopy is a record (VC.CANOPIES: its two
   anchors on the facing walls, its height, the cloth's width along the street, its colour, its lanterns' count); the
   host draws them (56f-vc-street-host.js). Every choice is a KRAND hash of the spot: no stream is drawn.
   - which streets: side streets and alleys (and main streets in the market quarter) within TUNE.canopy.marketReach of a
     market district, or where the street's wealth is at least TUNE.canopy.wealth; never the industry or the suburbs;
   - where: every `every` m along the street; the anchors are the first lot wall each side of the street within `reach`
     m of the kerb; a span wider than `maxSpan` has no canopy;
   - how high: a storey under the lower of the two buildings, within [`minY`, `maxY`] over the street. */
VC.CANOPIES = [];
VC.canopies = function () {
  var T = TUNE.canopy, R = SL.R, out = [], tried = 0, dropped = { wide: 0, nolot: 0, low: 0 };
  if (!T) return 'canopies: no TUNE.canopy';
  var lotAt = function (x, z) { var k = R.idx(x, z); if (k < 0) return null; if (R.occ[k] !== OCC.LOT) return null; var L = PLAN.lots[R.own[k]]; return L && L.died == null ? L : null; };
  var hOf = function (L) { var D = SL.dims(L.key, L.v) || {}; return baseH(L.x, L.z) + (D.h || 8); };
  PLAN.ways.forEach(function (w) {
    var E = T.every[w.cls]; if (!E || w.layby || w.F.len < E * 1.5) return;
    var n = Math.floor(w.F.len / E), s0 = (w.F.len - (n - 1) * E) / 2;
    for (var i = 0; i < n; i++) {
      var s = s0 + i * E, p = w.F.at(s), role = VC.roleAt(p);
      if (role === 'industry' || role === 'suburb') continue;
      var market = VC.marketDist(p) < T.marketReach, wealthy = SL.wealth(p) >= T.wealth;
      if (!market && !(wealthy && w.cls !== 'alley')) continue;
      if (w.cls === 'main' && !market) continue;
      var u = KRAND.unit(KRAND.hash(9301, Math.round(p[0] * 2), Math.round(p[1] * 2), 1)); if (u > (market ? T.shareMarket : T.shareWealthy)) continue;
      tried++;
      var nr = V.perp(w.F.tan(s, 3)), ends = [], hs = [];
      for (var sd = -1; sd <= 1; sd += 2) {
        var found = null;
        for (var d = w.w / 2 + 0.3; d <= w.w / 2 + T.reach && !found; d += 0.5) { var q = V.add(p, V.mul(nr, sd * d)), L = lotAt(q[0], q[1]); if (L) found = { p: V.add(p, V.mul(nr, sd * (d - 0.3))), L: L }; }
        if (!found) break;
        ends.push(found.p); hs.push(hOf(found.L));
      }
      if (ends.length < 2) { dropped.nolot++; continue; }
      var span = V.dist(ends[0], ends[1]); if (span > T.maxSpan) { dropped.wide++; continue; }
      var y = Math.min(hs[0], hs[1]) - T.under, floor = baseH(p[0], p[1]);
      if (y - floor < T.minY) { dropped.low++; continue; }
      y = Math.min(y, floor + T.maxY);
      var cu = KRAND.unit(KRAND.hash(9301, Math.round(p[0] * 2), Math.round(p[1] * 2), 2));
      out.push({ a: ends[0], b: ends[1], y: y, w: T.width[w.cls] || 4, col: T.colours[Math.floor(cu * T.colours.length) % T.colours.length], lanterns: Math.max(1, Math.round(span / T.lanternEvery)), market: market, step: w.born, way: w.id });
    }
  });
  if (out.length > T.max) out = out.filter(function (c, i) { return i % Math.ceil(out.length / T.max) === 0; });
  VC.CANOPIES = out;
  var msg = 'canopies: ' + out.length + ' over the streets (' + out.filter(function (c) { return c.market; }).length + ' in the market quarter), ' + out.reduce(function (s, c) { return s + c.lanterns; }, 0) + ' lanterns on them; ' + tried + ' spots tried, dropped: ' + dropped.wide + ' too wide, ' + dropped.nolot + ' no wall to tie to, ' + dropped.low + ' too low';
  SL.note(SL.LAST, msg);
  return msg;
};
