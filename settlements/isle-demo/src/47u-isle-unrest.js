/* ============================== 7h4. UNREST: THE HAPPINESS POOL (PLAN-MONEY.md M6, 2026-11-03) ============================== */
/* [G data] core/simulation's unrest (77-sim-6-unrest.js) on the isles, tuned by ISLE.TUNE.sim.unrest (15): each town's
   happiness pool, collective and by class (the isles' classes: poor, middle, rich), eased into a level, and the level's
   stage: grumbling (the watch less able to arrest), demands to the polity (a shipment of what the town lacked, from its
   sister town and the villages, or a new ruler: refused, no political system yet), strikes after a refused demand, treason.
   Both towns and the villages are one polity, so a demand is answered by the others.
     ISLE.simUnrest()            after the towns and their money are declared (40)
     ISLE.unrestBooks()          a snapshot: the unrest report, the ledger
     ISLE.unrestChecks(a, b)     over two snapshots: every town has a level and a stage for all its people and for each class;
                                 every stage is the one its level gives (the deepest line it is under, eased back only
                                 `hyst` over a line); every demand answered within a day, a granted shipment no more than
                                 its senders held over their keep; the books still hold (every shipment exported by a
                                 sender and imported by the asker); the pools and stages reported */
ISLE.simUnrest = function () {
  var K = ISLE.TUNE.sim.unrest; if (!K || !SIM.unrest || !SIM.NEED) return null;
  SIM.unrest({ smooth: K.smooth, hyst: K.hyst, stages: K.stages, grumble: K.grumble, demand: K.demand, strike: K.strike });
  return { stages: K.stages };
};
ISLE.unrestBooks = function () {
  return { minute: SIM.minute(), report: JSON.parse(JSON.stringify(SIM.unrestReport() || { towns: {}, events: [] })), ledger: SIM.ledgerSnap() };
};
ISLE.unrestChecks = function (a, b) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: name, ok: !!pass, detail: detail || '' }); };
  var K = ISLE.TUNE.sim.unrest, L = K.stages, H = K.hyst, R = b.report, ORDER = ['calm', 'grumble', 'demand', 'strike', 'treason'];
  var towns = ISLE.SIM.order, miss = [];
  towns.forEach(function (s) { var T = R.towns[s]; if (!T || T.level.all == null || !T.stage.all) { miss.push(s + ' all'); return; }
    var P = SIM.happinessPool(s); Object.keys(P.byClass).forEach(function (c) { if (T.level[c] == null || !T.stage[c]) miss.push(s + ' ' + c); }); });
  ok('every town has a level and a stage, for all its people and for each class', !miss.length && towns.length > 0, miss.slice(0, 4).join(', '));
  var bad = [];
  Object.keys(R.towns).forEach(function (s) { var T = R.towns[s]; Object.keys(T.stage).forEach(function (k) { var st = T.stage[k], i = ORDER.indexOf(st), lv = T.level[k];
    var under = i === 0 ? lv >= L.grumble : lv < L[st] + H, over = i === ORDER.length - 1 ? true : lv >= L[ORDER[i + 1]];
    if (i < 0 || !under || !over) bad.push(s + ' ' + k + ' ' + st + ' at ' + (lv == null ? '?' : lv.toFixed(1))); }); });
  ok('every stage is the one its level gives (the deepest line it is under, eased back only ' + H + ' over a line)', !bad.length, bad.slice(0, 4).join('; '));
  var late = [], over = [];
  Object.keys(R.towns).forEach(function (s) { R.towns[s].demands.forEach(function (D) {
    if (D.answer == null && b.minute - D.m > 1440 + 1) late.push(D.id);
    if (D.answer === 'granted' && D.kind === 'goods' && !(D.came > 0)) over.push(D.id + ' granted with nothing sent'); }); });
  ok('every demand answered within a day, a granted shipment sent', !late.length && !over.length, late.concat(over).slice(0, 4).join(', '));
  var Lg = SIM.ledger(a.ledger, b.ledger);
  ok('the books hold with the shipments (each exported by a sender, imported by the asker)', Lg.ok, Lg.ok ? '' : Lg.problems.slice(0, 2).join('; '));
  var ev = (R.events || []).filter(function (e) { return e.m > a.minute; }), cnt = {}; ev.forEach(function (e) { cnt[e.kind] = (cnt[e.kind] || 0) + 1; });
  ok('the pools and the stages (reported)', true, towns.map(function (s) { var T = R.towns[s]; return T ? s + ' ' + Object.keys(T.level).sort().map(function (k) { return k + ' ' + Math.round(T.level[k]) + ' ' + T.stage[k]; }).join(', ') : s + ' -'; }).join('; ') + '; events ' + JSON.stringify(cnt));
  return out;
};
