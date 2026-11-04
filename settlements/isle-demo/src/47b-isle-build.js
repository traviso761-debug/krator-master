/* ============================== 7h5. BUILDING AND UPKEEP (PLAN-POLITICS.md section 4, 2026-11-03) ============================== */
/* [G data] core/simulation's building (77-sim-6-build.js) on the isles, tuned by ISLE.TUNE.sim.build (15). The plan leaves
   `vacant` of each town's dwellings as empty lots (32), each a place of kind `lot` with a builder's post (40; its posts
   then follow its project's hands, core's rebalance, so every post is filled); the
   builders (a trade: 42's jobs) are sent to the town's projects, `pace` at a time. A house is built of its kind's bill
   (timber, stone, mats) out of the warehouses as the work goes; done, the lot becomes a home with its beds (empty, for
   the town's growth: PLAN-POLITICS.md section 4) and the plan's record is marked built, so the drawing shows the house.
   Every standing home wears its kind's bill over its life (upkeep), drawn hourly, owed when the warehouses are out.
     ISLE.simBuild()            after the towns' people and economies (40)
     ISLE.buildKind(P)          the kind a building is kept as: a home of one household a `house`, of three a `longhouse`;
                                any other roofed place of the plan (a workplace, a hall, a temple, a barracks) `works`
     ISLE.lotStage(L)           a plan record's stage for the drawing: null (a building as any), 'cleared', 'piles',
                                'frame', 'roof' (by its project's share done), 'built'
     ISLE.buildBooks()          a snapshot: the building report, the ledger
     ISLE.buildChecks(a, b)     over two snapshots: every empty lot of the plan is a lot place or a built home; no project
                                ahead of the bill delivered; every built lot a home with its beds and no builders' posts,
                                its record marked built; the upkeep drawn as the homes wear (the towns' upkeep a day,
                                times the days, less what is owed); the books hold; the projects and the upkeep reported */
ISLE.buildKind = function (P) {
  if (!P || !P.tags || !P.tags.key || P.kind === 'lot') return null;
  if (P.kind === 'home') { var hh = ISLE.households(P.tags.key); return hh >= 3 ? 'longhouse' : hh ? 'house' : null; }
  return P.indoor === true && P.settlement != null ? 'works' : null;   /* a workplace, a hall, a temple, a barracks: a roof over it (2026-11-04) */
};
ISLE.simBuild = function () {
  var T = ISLE.TUNE.sim, B = T.build; if (!B || !SIM.build || !SIM.ECONS) return null;
  var Gr = B.growth;
  SIM.build({ kinds: B.kinds, pace: B.pace, crewPer: B.crewPer || null, grace: B.grace, of: ISLE.buildKind,
    growth: Gr ? { rate: Gr.rate, per: Gr.per, ahead: Gr.ahead,
      settle: function (Lt, s) { if (ISLE.refugeeSettle && ISLE.refugeeSettle(Lt.id, s)) return 'moved'; ISLE.settleHousehold(Lt.id, s); },   /* the camp's households first (47r) */
      waiting: function (s) { return ISLE.refugeeWaiting ? ISLE.refugeeWaiting(s) : 0; } } : null,
    onFull: ISLE.openSpur || null,
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
/* A NEW HOUSEHOLD (growth, 2026-11-04): `per` a household (two grown-ups at home, the rest children) in a finished house,
   set up as the census's people are (42: age, trait, meters; 43: dressed; the home's class and its wealth's spread), its
   store empty (it buys its food as any household does), its purse opened empty (47m: no endowment minted) */
ISLE.settleHousehold = function (id, s) {
  var T = ISLE.TUNE.sim, P = SIM.R.place[id], NE = T.needs, A = T.ages, per = T.build.growth.per, n = (P.tags.hh || 1) * per, made = [];
  var TS = null; Object.keys(T.towns).forEach(function (k) { if (T.towns[k].id === s) TS = T.towns[k]; });
  var kin = SIM.R.role[s + '.kin'] ? s + '.kin' : null, child = SIM.R.role[s + '.child'] ? s + '.child' : kin; if (!kin) return made;
  var S = ISLE.SIM; S.grown = S.grown || 0;
  for (var i = 0; i < n; i++) {
    var grown = i % per < 2, a = SIM.actor({ id: TS.prefix + 'g' + (S.grown++), role: grown ? kin : child, home: id });
    var band = grown ? 'adult' : 'child', B0 = A.bands[band]; a.age = (grown ? 18 : B0[0]) + Math.floor(KRAND.unit(KRAND.hash(T.seed, 61, a.k)) * ((grown ? 30 : B0[1]) - (grown ? 18 : B0[0]) + 1));
    a.ageBand = band; a.status = grown ? 'home' : 'housework'; a.cls = P.cls || 'poor'; a.job = null;
    var WS = T.items.wealthSpread && T.items.wealthSpread[a.cls]; a.wealth = WS ? WS[0] : 0;
    if (NE && SIM.NEED) { var TR = Object.keys(NE.traits); a.trait = TR[KRAND.hash(T.seed, 67, a.k) % TR.length];
      a.nd = NE.list.map(function (nm, j) { var r = NE.init[nm]; return NE.rate[nm] && r ? r[0] + (r[1] - r[0]) * KRAND.unit(KRAND.hash(T.seed, 68, a.k, j)) : 0; }); }
    if (SIM.ITEMS && T.items.worn) ISLE.dressPerson(a, s);
    made.push(a);
  }
  P.people = n; P.store = P.store || {};
  if (SIM.MONEY && !SIM.acct('hh:' + id)) SIM.account({ id: 'hh:' + id, owner: id, kind: 'household', currency: ISLE.currencyOf(s), settlement: s });
  if (SIM.placesChanged) SIM.placesChanged();
  return made;
};
/* A STREET OUTSIDE THE GATE OPENED (core's onFull: the town's empty lots are out; 33 laid them out, closed): its lots
   become empty lots of the town, as the plan's are (40), drawn and built on from now; one street a call. -> true when
   one opened */
ISLE.openSpur = function (s) {
  var S = ISLE.SIM, Pn = S.plans && S.plans[s], T = ISLE.TUNE.sim; if (!Pn || !Pn.R.spurs) return false;
  var Sp = Pn.R.spurs.filter(function (x) { return !x.open; })[0]; if (!Sp) return false;
  var F = Pn.G.frame, h = Pn.G.h; Sp.open = SIM.minute();
  Sp.lots.forEach(function (L) {
    var id = s + '.' + L.lot, w = { x: +(L.x + F.x).toFixed(2), y: +(h(L.x, L.z) + F.sea).toFixed(2), z: +(L.z + F.z).toFixed(2) };
    var m0 = Sp.lane[0], door = L.door || { x: +(m0[0] + F.x).toFixed(2), y: +(h(m0[0], m0[1]) + F.sea).toFixed(2), z: +(m0[1] + F.z).toFixed(2) }, hh = ISLE.households(L.key);   /* its door on the walking graph, made when the town was declared (40) */
    var P = SIM.place({ id: id, name: 'an empty lot outside the gate', kind: 'lot', x: w.x, y: w.y, z: w.z, ry: L.ry, door: door, activities: {}, indoor: {}, wander: 4, settlement: s,
      tags: { key: L.key, lot: L.id, tag: L.tag, trade: null, cls: L.cls, district: L.district, role: null, vacant: true, hh: hh, spur: Sp.id } });
    P.cls = L.cls; L.closed = false; (S.lotRecs || (S.lotRecs = {}))[id] = L;
    SIM.buildLot({ id: id, kind: hh >= 3 ? 'longhouse' : 'house' });
  });
  if (SIM.placesChanged) SIM.placesChanged();
  SIM.logEvent('street opened', { settlement: s, spur: Sp.id, lots: Sp.lots.length, root: Sp.root });
  return true;
};
/* a plan record's progress for the drawing: f (0 empty .. 1 built) and the bill's goods still on site, each a share of
   the bill (delivered less built in); null before its project, when nothing is on site yet but a token pile */
ISLE.lotProgress = function (L) {
  if (!L || !L.vacant) return { f: 1, onSite: null }; if (L.built) return { f: 1, onSite: null };
  var B = SIM.BUILD, id = null; if (B) for (var k in (ISLE.SIM.lotRecs || {})) if (ISLE.SIM.lotRecs[k] === L) { id = k; break; }
  var Lt = id && B.lots[id], P = Lt && Lt.project ? B.projects[Lt.project] : null; if (!P) return { f: 0, onSite: null };
  var f = Math.min(1, P.done / P.hours), on = {}; Object.keys(P.bill).forEach(function (g) { on[g] = P.bill[g] > 0 ? Math.max(0, P.got[g] / P.bill[g] - f) : 0; });
  return { f: f, onSite: on };
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
  var hands = {}; SIM.all('actor').forEach(function (q) { if (q.work != null) hands[q.work] = (hands[q.work] || 0) + 1; });
  var bad = b.lots.filter(function (x) { return !(x.kind === 'lot' && !x.built && x.work === (hands[x.id] || 0)) && !(x.kind === 'home' && x.beds > 0 && !x.work && x.built); });
  ok('every empty lot of the plan is a lot with its posts for its builders (none waiting its turn), or a built home with its beds', b.lots.length > 0 && !bad.length,
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
      '); ' + T.buildings + ' buildings kept, a day ' + up2 + '; owed ' + JSON.stringify(T.upkeep.owed) + ', neglect ' + T.upkeep.neglect.toFixed(2); }).join(' | '));
  return out;
};
