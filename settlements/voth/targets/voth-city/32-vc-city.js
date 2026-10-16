/* ============================== 5. THE CITY: WEALTH, LOT MIXES, STREETS ============================== */
/* [G data] The city builder (core/city: 20-city-plan, 31-city-steps-b, 32-city-steps-c) on the site, with the site's own rules:
   - wealth (owner, 2026-10-08): richest along the bay shore and round the parks, plaza and markets, poorer toward
     the wall, and low in the working districts (harbour, industry, warehouse, river port) and outside the wall;
   - lot mixes by district: harbour = warehouses with a little industry, industry = smithies and craft workshops,
     warehouse = warehouses among shops and houses, river port = warehouses by the barge docks;
   - outside the wall a sparse suburb (some frontage left open, poorer, more industry). */

/* ---------------------------------------------------------------- wealth, cached on a 20 m grid */
VC.wcache = null;
SL.wealth = function (p) {
  var c = 20, half = TUNE.rasterHalf, n = Math.ceil(2 * half / c), i = Math.floor((p[0] + half) / c), j = Math.floor((p[1] + half) / c);
  if (!VC.wcache) { VC.wcache = new Float32Array(n * n); VC.wcache.fill(NaN); }
  if (i < 0 || j < 0 || i >= n || j >= n) return 0.3;
  var k = j * n + i, v = VC.wcache[k];
  if (v === v) return v;
  var q = [-half + (i + 0.5) * c, -half + (j + 0.5) * c], L = Math.max(0, VOTH.landDist(q[0], q[1]));
  var W = 1 - 0.8 * smooth(40, 760, L);
  PLAN.site.forEach(function (d) {
    if (d.role !== 'park' && d.role !== 'plaza' && d.role !== 'market') return;
    var dd = inPoly(q, d.poly) ? 0 : polyEdgeDist(q, d.poly);
    W += (d.role === 'market' ? 0.18 : 0.32) * Math.exp(-dd / 150);
  });
  if (VC.wallLine) { var dw = Infinity; for (var s = 1; s < VC.wallLine.length; s++) dw = Math.min(dw, segDist(q, VC.wallLine[s - 1], VC.wallLine[s])); W -= 0.25 * Math.max(0, 1 - dw / 180); }
  var role = VC.roleAt(q);
  if (role === 'harbor' || role === 'industry' || role === 'warehouse' || role === 'riverport') W = Math.min(W, 0.4) * 0.75;
  if (role === 'suburb') W = Math.min(W, 0.3);
  W += 0.12 * slFbm(q[0] / 110 + 40, q[1] / 110 - 13, 2);
  return (VC.wcache[k] = clamp(W, 0, 1));
};
VC.marketDist = function (p) { var d = Infinity; PLAN.site.forEach(function (m) { if (m.role === 'market') d = Math.min(d, inPoly(p, m.poly) ? 0 : polyEdgeDist(p, m.poly)); }); return d; };

/* ---------------------------------------------------------------- what stands where */
VC.MIX = {
  harbor:    { warehouse: 0.50, craft: 0.12, shop: 0.08, tavern: 0.08, poor: 0.22 },
  industry:  { craft: 0.60, industrial: 0.14, shop: 0.08, poor: 0.18 },
  warehouse: { warehouse: 0.45, shop: 0.22, middle: 0.15, poor: 0.18 },
  riverport: { warehouse: 0.50, tavern: 0.10, shop: 0.12, poor: 0.28 },
  suburb:    { poor: 0.45, industrial: 0.15, craft: 0.12, middle: 0.18, shop: 0.06, tavern: 0.04 }
};
VC.chooser = function (street) {
  return function (p, rs) {
    var role = VC.roleAt(p);
    if (VC.MIX[role]) return SL.draw(rs, VC.MIX[role]);
    var W = SL.wealth(p), dm = VC.marketDist(p);
    if (street === 'avenue') {
      if (W > 0.72) return SL.draw(rs, { rich: 0.68, middle: 0.24, manor: W > 0.86 ? 0.05 : 0, shop: 0.03 });
      if (W > 0.45) return SL.draw(rs, { rich: 0.32, middle: 0.50, shop: 0.18 });
      return SL.draw(rs, { middle: 0.52, poor: 0.28, shop: 0.20 });
    }
    var shop = (street === 'alley' ? 0.04 : street === 'side' ? 0.05 : 0.08) + (street === 'alley' ? 0.06 : 0.35) * Math.exp(-dm / 260);
    var tav = street === 'main' ? 0.03 : 0.01, home = Math.max(0.05, 1 - shop - tav);
    var rich = smooth(0.55, 0.92, W) * (street === 'alley' ? 0.3 : 0.8), poor = smooth(0.52, 0.12, W) * 0.85 + (street === 'alley' ? 0.25 : 0), mid = Math.max(0.05, 1 - rich - poor);
    return SL.draw(rs, { shop: shop, tavern: tav, rich: home * rich, middle: home * mid, poor: home * poor });
  };
};
SL.choosers = { avenue: VC.chooser('avenue'), main: VC.chooser('main'), side: VC.chooser('side'), alley: VC.chooser('alley') };
SL.vacant = function (p, rs) { return VC.roleAt(p) === 'suburb' && rs.chance(TUNE.suburbVacancy); };

/* steps 6-8 and the last infill's reach are core/city's defaults (31-city-steps-b.js SL.pass6 with its `near` scorers,
   pass7, pass8; 32-city-steps-c.js SL.interiorOk), grown here and moved there on 2026-10-14. Voth gives them its rules
   (35-vc-steps.js: wealth, choosers, vacant, roleAt) and its data: TUNE.civic's `near` names ('res', 'garrison', 'gate',
   or a district role), the garrison landmark (step 1), the wall's gates (step 5, PLAN.wallRec). */
