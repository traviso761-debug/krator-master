/* ============================== 7h5. BUILDING AND UPKEEP (PLAN-POLITICS.md section 4, 2026-11-03) ============================== */
/* [G data] core/simulation's building (77-sim-6-build.js) on the isles, tuned by ISLE.TUNE.sim.build (15). The plan leaves
   `vacant` of each town's dwellings as empty lots (32), each a place of kind `lot` with its builders' posts (40); the
   builders (a trade: 42's jobs) are sent to the town's projects, `pace` at a time. A house is built of its kind's bill
   (timber, stone, mats) out of the warehouses as the work goes; done, the lot becomes a home with its beds (empty, for
   the town's growth: PLAN-POLITICS.md section 4) and the plan's record is marked built, so the drawing shows the house.
   Every standing home wears its kind's bill over its life (upkeep), drawn hourly, owed when the warehouses are out.
     ISLE.simBuild()            after the towns' people and economies (40)
     ISLE.buildKind(P)          the kind a home is built and kept as: one household a `house`, three a `longhouse`
     ISLE.lotStage(L)           a plan record's stage for the drawing: null (a building as any), 'cleared', 'piles',
                                'frame', 'roof' (by its project's share done), 'built'
     ISLE.buildBooks()          a snapshot: the building report, the ledger
     ISLE.buildChecks(a, b)     over two snapshots: every empty lot of the plan is a lot place or a built home; no project
                                ahead of the bill delivered; every built lot a home with its beds and no builders' posts,
                                its record marked built; the upkeep drawn as the homes wear (the towns' upkeep a day,
                                times the days, less what is owed); the books hold; the projects and the upkeep reported */
ISLE.buildKind = function (P) {
  if (!P || P.kind !== 'home' || !P.tags || !P.tags.key) return null;
  var hh = ISLE.households(P.tags.key); return hh >= 3 ? 'longhouse' : hh ? 'house' : null;
};
ISLE.simBuild = function () {
  var T = ISLE.TUNE.sim, B = T.build; if (!B || !SIM.build || !SIM.ECONS) return null;
  SIM.build({ kinds: B.kinds, pace: B.pace, grace: B.grace, of: ISLE.buildKind,
    onBuilt: function (Lt, Pj) {
      var P = SIM.R.place[Lt.id], K = T.kinds[P.tags.key], hh = P.tags.hh || ISLE.households(P.tags.key), beds = hh * T.home.per;
      P.kind = K ? K[0] : 'home'; P.name = (ISLE_DIMS[P.tags.key] && ISLE_DIMS[P.tags.key].role) || P.tags.key; delete P.activities.WORK;
      T.home.acts.forEach(function (a) { P.activities[a] = beds; }); P.indoor = true; P.tags.vacant = false; P.tags.built = Pj.m1;
      if (SIM.placesChanged) SIM.placesChanged(); SIM.buildChanged(P.settlement);
      var L = ISLE.SIM.lotRecs && ISLE.SIM.lotRecs[Lt.id]; if (L) L.built = true;
    } });
  var n = 0;
  SIM.all('place').forEach(function (P) { if (P.kind === 'lot' && P.tags && P.tags.vacant) { SIM.buildLot({ id: P.id, kind: ISLE.households(P.tags.key) >= 3 ? 'longhouse' : 'house' }); n++; } });
  return { lots: n, pace: B.pace };
};
ISLE.lotStage = function (L) {
  if (!L || !L.vacant) return null; if (L.built) return 'built';
  var B = SIM.BUILD; if (!B) return 'cleared';
  var id = null; for (var k in (ISLE.SIM.lotRecs || {})) if (ISLE.SIM.lotRecs[k] === L) { id = k; break; }
  var Lt = id && B.lots[id], P = Lt && Lt.project ? B.projects[Lt.project] : null; if (!P) return 'cleared';
  var f = P.done / P.hours; return f >= 1 ? 'built' : f >= 0.7 ? 'roof' : f >= 0.35 ? 'frame' : f > 0 ? 'piles' : 'cleared';
};
ISLE.buildBooks = function () {
  return { minute: SIM.minute(), report: JSON.parse(JSON.stringify(SIM.buildReport() || { towns: {}, events: [] })), ledger: SIM.ledgerSnap(),
    lots: Object.keys(ISLE.SIM.lotRecs || {}).map(function (id) { var P = SIM.R.place[id], L = ISLE.SIM.lotRecs[id];
      return { id: id, kind: P && P.kind, beds: P && P.activities.SLEEP || 0, work: P && P.activities.WORK || 0, built: !!L.built, stage: ISLE.lotStage(L) }; }) };
};
ISLE.buildChecks = function (a, b) {
  var out = [], ok = function (name, pass, detail) { out.push({ name: name, ok: !!pass, detail: detail || '' }); };
  var R = b.report, towns = ISLE.SIM.order, B = SIM.BUILD;
  var bad = b.lots.filter(function (x) { return !(x.kind === 'lot' && x.work > 0 && !x.built) && !(x.kind === 'home' && x.beds > 0 && !x.work && x.built); });
  ok('every empty lot of the plan is a lot with its builders\' posts, or a built home with its beds', b.lots.length > 0 && !bad.length,
    b.lots.length + ' lots' + (bad.length ? '; WRONG: ' + bad.slice(0, 4).map(function (x) { return x.id + ' ' + x.kind; }).join(', ') : ''));
  var ahead = [];
  Object.keys(R.towns).forEach(function (s) { R.towns[s].projects.forEach(function (P) { var f = 1; Object.keys(P.bill).forEach(function (g) { if (P.bill[g] > 0) f = Math.min(f, P.got[g] / P.bill[g]); });
    if (P.done / P.hours > f + 1e-9) ahead.push(P.id + ' ' + Math.round(100 * P.done / P.hours) + '% on ' + Math.round(100 * f) + '% of its bill'); }); });
  ok('no project ahead of the bill delivered', !ahead.length, ahead.slice(0, 3).join('; '));
  var mism = b.lots.filter(function (x) { var Lt = B.lots[x.id]; return Lt && (Lt.state === 'built') !== x.built; });
  ok('every lot built in the sim is marked built in the plan (the drawing shows its house)', !mism.length, mism.slice(0, 4).map(function (x) { return x.id; }).join(', '));
  var days = (b.minute - a.minute) / 1440, up = [];
  towns.forEach(function (s) { var A = a.report.towns[s], Bt = R.towns[s]; if (!Bt) return; Object.keys(Bt.upkeep.day).forEach(function (g) {
    if (!SIM.econ(s).goods[g]) return; var want = Bt.upkeep.day[g] * days, took = (Bt.upkeep.taken[g] || 0) - (A && A.upkeep.taken[g] || 0), owed = (Bt.upkeep.owed[g] || 0) - (A && A.upkeep.owed[g] || 0);
    if (Math.abs(took + owed - want) > 2 + 0.02 * want) up.push(s + ' ' + g + ' ' + took + ' + ' + owed + ' owed for ' + want.toFixed(1)); }); });
  ok('the upkeep drawn as the homes wear (each town\'s upkeep a day, over the days, drawn or owed)', !up.length && days > 0, up.slice(0, 3).join('; '));
  var Lg = SIM.ledger(a.ledger, b.ledger);
  ok('the books hold with the building and the upkeep (booked used)', Lg.ok, Lg.ok ? '' : Lg.problems.slice(0, 2).join('; '));
  ok('the projects and the upkeep (reported)', true, towns.map(function (s) { var T = R.towns[s]; if (!T) return s + ' -';
    var up2 = Object.keys(T.upkeep.day).map(function (g) { return g + ' ' + T.upkeep.day[g].toFixed(1); }).join(', ');
    return s + ': ' + T.lots + ' lots, ' + T.built + ' built, ' + T.building + ' building (' + T.projects.filter(function (P) { return P.state === 'building'; }).map(function (P) { return Math.round(100 * P.share) + '%'; }).join(', ') +
      '); ' + T.buildings + ' homes kept, a day ' + up2 + '; owed ' + JSON.stringify(T.upkeep.owed) + ', neglect ' + T.upkeep.neglect.toFixed(2); }).join(' | '));
  return out;
};
