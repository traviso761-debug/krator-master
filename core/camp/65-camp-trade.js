/* ==================== core/camp 65: caravans on land (C6; S6) [G data] ==================== */
/* core/camp/PLAN.md section 6.2; core/simulation/PROPOSAL-LONGSONG-PINNACLE.md phase S6 (the owner, 2026-11-11: the bands
   trade with the other Beast Rider cities, and long-distance with the coyotemen and the Dasri). A band's trading venture
   goes to a market by the links (60's KCAMP.travel: KTRAVEL's legs and inns, or a planned leg), trades there and comes back
   to its range. THE TRADE is a barter at the market's prices: what the band offers (above what it keeps of its own use)
   is sold at the market's `buys` prices, and with that value it buys what it wants at the market's `sells` prices,
   wanted goods first, as much as its beasts can carry (50's KCAMP.packCap) and the market holds. Both ends are booked:
   the band's world books (exported what it sold, imported what it bought) and the market's in the sim through the host
   (`trade(market, sold, bought)`: imported and exported there), so a load is in one set of books at a time.
     KCAMP.caravan(spec) -> a venture kind for KCAMP.world's `ventures`. spec {markets: {id: {buys: {good: price},
        sells: {good: price}, kind?: 'near' | 'far'}}, offer: [goods the bands sell], want(W, b) -> [{good, n}] (what a
        band means to bring home, in order), work (days at the market: 3), escort (the fee a warrior earns a visit, guarding the
        market's own caravans: the proposal's escort fees; spent first, so the goods it sells are what is left to pay)}
     KCAMP.barter(W, b, market, M, spec) -> {sold, bought, value}   the trade itself (the host books the market's side)
   Deterministic: no draws. */
KCAMP.barter = function (W, b, id, M, spec) {
  var sold = {}, bought = {}, value = 0, keep = W.rules.keepTrade || {};
  (spec.offer || []).forEach(function (g) { var p = M.buys[g]; if (!(p > 0)) return; var n = Math.floor((b.stock[g] || 0) - (keep[g] || 0)); if (n <= 0) return; sold[g] = n; value += n * p; });
  var fee = (spec.escort || 0) * (b.warriors || 0), room = KCAMP.packCap(W.beasts, b.beasts), left = value + fee;   /* escort fees: the band's riders hired to guard the market's own caravans for the days it is there */
  (spec.want(W, b) || []).forEach(function (w) {
    var p = M.sells[w.good]; if (!(p > 0) || left <= 0 || room <= 0) return;
    var have = W.host && W.host.stock ? W.host.stock(id, w.good) : Infinity, n = Math.floor(Math.min(w.n, left / p, room, have));
    if (n <= 0) return; bought[w.good] = (bought[w.good] || 0) + n; left -= n * p; room -= n; });
  /* unspent value is not sold: the band sells only as much as it spends (rounded down a unit of each offered good) */
  var spent = value + fee - left, k = value > 0 ? Math.max(0, spent - fee) / value : 0;
  Object.keys(sold).forEach(function (g) { sold[g] = Math.ceil(sold[g] * k - 1e-9); if (!sold[g]) delete sold[g]; });
  if (W.host && W.host.trade) W.host.trade(id, sold, bought);
  var out = KCAMP.bookOut(b, 'exported', sold); KCAMP.bookIn(b, 'imported', bought);
  return { sold: out, bought: bought, value: spent, fee: Math.min(fee, spent) };
};
KCAMP.caravan = function (spec) {
  var work = spec.work == null ? 3 : spec.work;
  return {
    plan: function (W, b, d, A) { if (!spec.markets[A.to]) return null; var F = KCAMP.fits(W, b, d, A.to, work); if (!F) return null;
      return { kind: 'caravan', to: A.to, busy: true, left: work, planned: F.there.planned || F.back.planned, days: F.days }; },
    arrive: function (W, b, d, to) { var M = spec.markets[to], cap = KCAMP.packCap(W.beasts, b.beasts), T = KCAMP.barter(W, b, to, M, spec);
      W.trades = W.trades || []; W.trades.push({ day: d, band: b.id, market: to, sold: T.sold, bought: T.bought, value: T.value, cap: cap });
      KCAMP.op(W, d, b.id, 'trade', { market: to, sold: T.sold, bought: T.bought }); },
    day: function (W, b, d) { var V = b.venture; if (b.state !== 'venture' || V.kind !== 'caravan') return;
      if (--V.left <= 0) KCAMP.march(W, b, KCAMP.returnTo(W, b), d, 'return'); }
  };
};
