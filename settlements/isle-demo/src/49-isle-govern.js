/* ============================== 7j. THE PRODUCTION GOVERNOR AND SPOILAGE (2026-10-19; on core 2026-10-26) ============================== */
/* [G data] Two feedbacks on each town's economy, as the economy-balancing research recommends (a forked session's survey,
   the owner's go-ahead, 2026-10-19), so the towns hold their stocks without hand-tuned factors: an order-up-to rule with
   its supply line that sets each producer's rate, and the perishables' midnight loss, salt keeping the fish and the meat
   and seasoning the meals. Proved here, now core/simulation's (77-sim-6-govern.js: SIM.economy's `govern`, `spoil`, `keep`
   and `season`); this fragment only turns ISLE.TUNE.sim.economy into each town's rules:
     ISLE.simRules(s)   the rules for town s's SIM.economy config (44): the governor with what the ships from beyond the
                        isles are set to buy there a day (`buys`: each ship's buys over its days between calls), spoilage,
                        salt as the keeper of `salt.keeps` and the seasoning
     ISLE.simGoverned(s)  the governor's last look in town s ({good: {use, pos, cap, mult}}: 48's supply-line check)
     ISLE.simSpoiled(s) / ISLE.simSalted(s)   what rotted / what salt kept ({good: n}; salted also {salt: drawn}) */
ISLE.simRules = function (s) {
  var T = ISLE.TUNE.sim.economy, B = ISLE.TUNE.sim.trade && ISLE.TUNE.sim.trade.buyers, out = {};
  if (T.govern) {
    var buys = {};
    if (B) B.ships.forEach(function (sh) { if (sh.calls.indexOf(s) < 0) return; Object.keys(sh.buys).forEach(function (g) { buys[g] = (buys[g] || 0) + sh.buys[g] / sh.every; }); });
    out.govern = Object.assign({}, T.govern, { buys: buys });
  }
  if (T.spoil) out.spoil = T.spoil;
  var SA = T.salt;
  if (SA) { out.keep = { by: 'salt', goods: SA.keeps, share: SA.keep, per: SA.per }; if (SA.season) out.season = { by: 'salt', mult: SA.season }; }
  return out;
};
ISLE.simGoverned = function (s) { return SIM.economyGoverned(s) || {}; };
ISLE.simSpoiled = function (s) { var E = SIM.econ(s); return (E && E.spoiled) || {}; };
ISLE.simSalted = function (s) { var E = SIM.econ(s); return (E && E.kept) || {}; };
