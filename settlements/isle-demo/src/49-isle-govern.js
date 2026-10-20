/* ============================== 7j. THE PRODUCTION GOVERNOR AND SPOILAGE (2026-10-19) ============================== */
/* [G data] Two feedbacks on each town's economy, as the economy-balancing research recommends (a forked session's survey,
   the owner's go-ahead, 2026-10-19), so the towns hold their stocks without hand-tuned factors:
     ISLE.simGovern(minute)     every `govern.every` minutes, an order-up-to rule with its supply line (POUT, the inventory
                                research's pick, 2026-10-19) sets each producer's rate: what is wanted of a good a day is
                                its demand (ISLE.simDemand: its use and unmet draws, its exports or the other town's want
                                where the canoe line carries it, what the ships are set to buy, what the goods made from it
                                need) plus `alpha` of the gap between `cover` days of that demand and its supply line
                                (ISLE.simPosition: warehouses, sites, carts, at sea toward it), closed over `ti` days. The
                                producer's multiplier is that over what the town makes at the full rate (learnt as it runs),
                                clamped to [min, max]; on the first day (no history yet) everything runs at its full rate. A
                                recipe of several goods runs at the rate its scarcest good asks for.
     ISLE.simSpoil(minute)      at midnight, `spoil[good]` of each perishable's stock in the warehouses and at the sites
                                rots, booked as used (consumed: the books balance) and tallied apart (ISLE.SIM.spoiled).
                                The households' own stores do not spoil (two to four days of meals).
   Both are the page's hooks (SIM.stepHooks) for now: a governor and spoilage belong in core/simulation's economy as
   opt-in features once proved here (KNOWN_ISSUES.md). */
ISLE.simGovernInit = function () {
  var S = ISLE.SIM, T = ISLE.TUNE.sim.economy, B = ISLE.TUNE.sim.trade && ISLE.TUNE.sim.trade.buyers;
  /* what the ships are set to buy a day, by town and good */
  var ships = {};
  if (B) B.ships.forEach(function (sh) { sh.calls.forEach(function (s) { Object.keys(sh.buys).forEach(function (g) { var o = ships[s] || (ships[s] = {}); o[g] = (o[g] || 0) + sh.buys[g] / sh.every; }); }); });
  S.govern = { ships: ships, rates: {}, last: {}, est: {}, view: {} };
  S.spoiled = {};
  S.order.forEach(function (s) { var E = SIM.econ(s); Object.keys(E.recipes).forEach(function (id) { S.govern.rates[id] = E.recipes[id].rate; }); });
  if (T.govern) SIM.stepHooks.push(ISLE.simGovern);
  if (T.spoil) SIM.stepHooks.push(ISLE.simSpoil);
};
/* a good's demand a day in a town: its use and its unmet draws over the last `govern.window` whole days (today so far on
   the first day): the households restock on a three-day round, so a shorter window swings with it; its exports,
   or the other town's want of it where the canoe line carries it from here (that town's use and unmet draws, the unmet
   at most once more its use: a shortfall's repeated attempts count each time), whichever is more; what the ships are set
   to buy a day, whichever is more than its exports (the ships' buys are booked as exported); and what the goods made from
   it here want of it (sugar's cane, cloth's cotton, garments' cloth, bread's flour crop, sandals' and armour's leather),
   in place of what their recipes drew. Cached for one pass (`memo`) */
ISLE.simRate = function (E, g, minute, kinds) {
  var G = ISLE.TUNE.sim.economy.govern, w = G && G.window != null ? G.window : E.window;
  var d = Math.floor(minute / 1440), m = minute % 1440, tot = {}, days = 0;
  var add = function (D) { kinds.forEach(function (k) { tot[k] = (tot[k] || 0) + ((D[k] || {})[g] || 0); }); };
  for (var k = Math.max(0, d - w); k < d; k++) if (E.day[k]) { add(E.day[k]); days++; }
  if (!days && E.day[d] && m > 60) { add(E.day[d]); days += m / 1440; }
  var out = {}; kinds.forEach(function (k) { out[k] = days > 0 ? (tot[k] || 0) / days : 0; }); return out;
};
ISLE.simDemand = function (E, g, minute, memo) {
  memo = memo || {}; var key = E.settlement + ':' + g; if (memo[key] != null) return memo[key]; memo[key] = 0;
  var s = E.settlement, r = ISLE.simRate(E, g, minute, ['used', 'short', 'exported']), want = 0;
  var T = ISLE.TUNE.sim.trade;
  if (T) T.lines.forEach(function (L) { if (!(L.goods[s] || []).some(function (x) { return x === g; })) return;
    Object.keys(L.goods).forEach(function (o) { if (o === s || !SIM.econ(o)) return; var q = ISLE.simRate(SIM.econ(o), g, minute, ['used', 'short']);
      want += q.used + (q.used > 0 ? Math.min(q.short, q.used) : q.short); }); });
  var dem = r.used + r.short + Math.max(r.exported, want + (((ISLE.SIM.govern.ships || {})[s] || {})[g] || 0));
  /* the goods made from it here: their wanted making in place of what their recipes drew (booked as used) */
  var made = {}; Object.keys(E.recipes).forEach(function (id) { E.recipes[id].out.forEach(function (o) { made[o] = 1; }); });
  Object.keys(E.inputs || {}).forEach(function (o) { var q = E.inputs[o]; if (!q || !q[g] || !made[o]) return;
    dem += (ISLE.simDemand(E, o, minute, memo) - ISLE.simRate(E, o, minute, ['made']).made) * q[g]; });
  if (dem < 0) dem = 0;
  memo[key] = dem; return dem;
};
/* a good's supply line in a town: in its warehouses, at its sites, on its carts and at sea toward it */
ISLE.simPosition = function (E, g) {
  var have = 0; E.warehouses.forEach(function (W) { have += W.stock[g] || 0; }); E.sites.forEach(function (P) { have += P.stock[g] || 0; });
  E.carts.forEach(function (a) { var L = a.cart.load; if (L && L.good === g) have += L.n; });
  if (SIM.tradeInbound) have += SIM.tradeInbound(g, E.settlement);
  return have;
};
/* the order-up-to rule: a good's wanted output a day is its demand plus `alpha` of the gap between its target (`cover`
   days of demand) and its supply line, closed over `ti` days; over what the town makes of it at the full rate (made a
   day over the multiplier it was made at, both smoothed over `smooth` days), clamped to [min, max] */
ISLE.simGovern = function (minute) {
  var G = ISLE.TUNE.sim.economy.govern, S = ISLE.SIM, M = S.govern; if (minute % G.every) return;
  var a = G.every / (1440 * (G.smooth == null ? 2 : G.smooth)), first = minute < 1440;
  S.order.forEach(function (s) {
    var E = SIM.econ(s), memo = {}, want = {}, made = {};
    Object.keys(E.recipes).forEach(function (id) { E.recipes[id].out.forEach(function (g) { (made[g] || (made[g] = [])).push(id); }); });
    Object.keys(made).forEach(function (g) {
      var key = s + ':' + g, st = M.est[key] || (M.est[key] = { made: 0, k: 0, last: E.made[g] || 0 });
      var k0 = 0; made[g].forEach(function (id) { k0 += M.last[id] == null ? 1 : M.last[id]; }); k0 /= made[g].length;
      var dm = ((E.made[g] || 0) - st.last) * 1440 / G.every; st.last = E.made[g] || 0;
      st.made += a * (dm - st.made); st.k += a * (k0 - st.k);
      var use = ISLE.simDemand(E, g, minute, memo), pos = ISLE.simPosition(E, g), cap = st.k > 0 ? st.made / st.k : 0;
      var out = use + G.alpha * (G.cover * use - pos) / G.ti;
      var m = cap > 0 ? out / cap : G.max; want[g] = Math.max(G.min, Math.min(G.max, m));
      M.view[key] = { use: use, pos: pos, cap: cap, mult: want[g] };
    });
    Object.keys(E.recipes).forEach(function (id) {
      var R = E.recipes[id], base = M.rates[id]; if (base == null) return;
      var k = 1; if (!first) { k = 0; R.out.forEach(function (g) { if (want[g] > k) k = want[g]; }); }
      R.rate = base * k; M.last[id] = k;
    });
  });
};
ISLE.simSpoil = function (minute) {
  var P0 = ISLE.TUNE.sim.economy.spoil, S = ISLE.SIM; if (minute % 1440) return;
  S.order.forEach(function (s) {
    SIM.withEcon(s, function () { var E = SIM.ECON, o = S.spoiled[s] || (S.spoiled[s] = {});
      Object.keys(P0).forEach(function (g) { if (!E.goods[g] || !(P0[g] > 0)) return; var n = 0;
        E.warehouses.concat(E.sites).forEach(function (P) { var k = Math.floor((P.stock[g] || 0) * P0[g]); if (k > 0) { P.stock[g] -= k; n += k; } });
        if (n > 0) { SIM.economyBook('used', g, n); o[g] = (o[g] || 0) + n; } }); });
  });
};
