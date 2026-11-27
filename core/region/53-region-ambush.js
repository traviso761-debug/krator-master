/* ==================== core/region 53: ambushes on a carrier (R2) [G data] ==================== */
/* openworld/catch-bowl/PLAN-RAIDS.md R2 (the owner's item 5 of 2026-11-24: "implement bandits and Stalkers attacking
   caravans"). A sibling of 52-region-raid.js, and OPT-IN the same way: inert unless the valley spec has `ambushes`, so
   every other tune runs exactly as before.
   52 raids SETTLEMENTS; this raids CARRIERS -- a SIM.trade carrier on a named leg, which is what CATCH_TUNE's five
   caravan rounds already are. The leg losses of C5 (50-region-valley.js's `losses`) stay what they are: weather and
   beasts dying. An ambush is somebody doing it on purpose, with a strength, an appetite and a cache.

     V.ambushes = {
       parties: [{id, name, kind: 'outlaw' | 'stalker', legs: {roadId: [leg index, ...]},
         every (passages of its legs between attempts: 3), spare (of those, how many pass untouched: 0),
         strength, window? (a season it keeps to), hiddenIn? (a season that hides it: its roll improves),
         wants?: [goods] (an outlaw's appetite, in order), toll? (.12: the share it takes and lets the train go),
         maul? (.35: the share it takes when it takes properly), beasts? (.25: the share of the beasts it takes),
         people? (2: the crew it takes -- STALKERS ONLY, and the thing no tune has booked before),
         cache? (a settlement its take lands in), store? (the work there), ransom? (a good it will take instead)}],
       kit?: {good: strength it adds to a round's guard} (explosives: 6),
       floorDays? (14: the days of its own use a carrier's cargo keeps back from a toll)}

   A ROUND may carry `guard` (its own strength) and `kit` ([goods]) -- which is how the Geomancers' explosives stop
   being a hard-coded exception in CATCH_TUNE (C5 wrote `if(!g.explosives)`) and become a thing any group can buy.

   DETERMINISTIC. No draws: the roll is a hash of (seed, party, road, carrier, its count of passages of that party's
   legs), exactly as 50's loss rule counts passages, so two runs of a year give the same ambushes.
   THE TWO DANGERS MUST NOT BLUR (PLAN-RAIDS.md section 4). An `outlaw` party tolls, takes cargo and leaves witnesses;
   a `stalker` party never tolls and never takes cargo -- it takes PEOPLE AND BEASTS and leaves nothing. The outcome
   ladder is therefore different for the two kinds, not a shared ladder with different numbers.
     H.ambushOutcome({kind, strength, guard, hidden}) -> 'passed' | 'tolled' | 'mauled' | 'broken'
     S.ambushes = {party: {tries, passed, tolled, mauled, broken, took: {good: n}, beasts, people}}
     S.ambushLog = [{minute, party, road, carrier, leg, outcome, took, beasts, people}] */
KREGION.part('53-region-ambush', function (H) {
  var sim0 = H.simValley;
  H.simValley = function (V) { var S = sim0.call(H, V); if (V && V.ambushes) H.ambushInit(V, S); return S; };
  var hash = function (s) { var h = 2166136261, i; for (i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h; };
  var unit = function (s) { return hash(s) / 4294967296; };
  var D = function (x, d) { return x == null ? d : x; };

  /* the ladder, pure and testable on its own. `adv` is the party's strength over what the train can answer with; the
     roll shifts it by a quarter either way, and a season that hides the party (a black storm, a whiteout) shifts it up.
     An outlaw has a rung the Stalkers do not: `tolled`, where it takes a share and lets the train go -- which the scope
     makes an explicit player move (barrels of water buy off BF-05). A Stalker never tolls. */
  H.ambushOutcome = function (o) {
    var adv = D(o.strength, 1) / Math.max(1, D(o.guard, 0) + 1);
    var score = adv * (0.75 + 0.5 * D(o.roll, 0.5)) * (o.hidden ? 1.25 : 1);
    if (o.kind === 'stalker') return score < 0.9 ? 'passed' : score < 2.2 ? 'mauled' : 'broken';
    return score < 0.6 ? 'passed' : score < 1.3 ? 'tolled' : score < 2.4 ? 'mauled' : 'broken';
  };
  /* what a round can answer with: its own guard plus whatever of the spec's `kit` it carries */
  H.ambushGuard = function (Rd, kit) { var g = D(Rd.guard, 0);
    (Rd.kit || []).forEach(function (k) { g += D((kit || {})[k], 0); }); return g; };

  H.ambushInit = function (V, S) {
    var AV = V.ambushes, kit = AV.kit || {}, seed = String(V.seed == null ? 0 : V.seed);
    var spec = {}; V.settlements.forEach(function (Sd) { spec[Sd.id] = Sd; });
    var roads = {}; (V.roads || []).forEach(function (Rd) { roads[Rd.id] = Rd; });
    var P = (AV.parties || []).filter(function (Pt) { return Pt.legs && Object.keys(Pt.legs).some(function (r) {
      return SIM.TRADE && SIM.TRADE.routes[r] && SIM.TRADE.routes[r].provision; }); });
    S.ambushes = {}; S.ambushLog = [];
    P.forEach(function (Pt) { S.ambushes[Pt.id] = { kind: Pt.kind, tries: 0, passed: 0, tolled: 0, mauled: 0, broken: 0,
      took: {}, beasts: 0, people: 0 }; });
    if (!P.length) { S.ambushNone = 'no party of V.ambushes has a leg on a provisioned round'; return; }
    /* the take: an outlaw works down its `wants`, never below the carrier's own floor of its staples; a Stalker takes
       no cargo at all, so `wants` is not read for it */
    var takeCargo = function (Cr, Pt, share, A, rid) {
      var got = {}; if (Pt.kind === 'stalker') return got;
      /* BOOK IT, ROW BY ROW. Reaching into a hold mid-leg takes the load out of the at-sea pool, and a leg's
         identity is `at sea + shipped - landed = at sea`: without this the ambush year's ledger failed with `0 at
         sea + 90 shipped - 24 landed`. It is a loss, not a landing -- the leg's receiver never sees it -- so it
         goes on the route's `lost` tally, and `land()` below books the cache's side as an import from abroad.
         PER ROW, because on a road with halts one carrier holds loads for several stops and each row is on its own
         leg: booking the carrier's own from/to for all of them balanced nothing. */
      (Pt.wants || []).forEach(function (g) {
        (Cr.cargo || []).forEach(function (row) { if (row.good !== g || row.n <= 0) return;
          var n = Math.floor(row.n * share); if (n <= 0) return; row.n -= n; got[g] = (got[g] || 0) + n;
          if (SIM.tradeLose) SIM.tradeLose(rid, Cr, row, n); }); });
      Object.keys(got).forEach(function (g) { A.took[g] = (A.took[g] || 0) + got[g]; });
      return got;
    };
    /* Where the take goes. economyLand puts it in the warehouse; economyBook('imported') is what tells the books it
       came from outside, and without it the cache held goods out of nowhere -- the ambush year closed every leg and
       then failed on `svhmyhf33w iron: 0 + 0 made + 0 in ... is not the 1975 held`. The route booked the loss as
       off the map, so this is the other end of it: an import from abroad, which the ledger's abroadIn allows. */
    var land = function (Pt, got) { if (!Pt.cache || !spec[Pt.cache]) return;
      Object.keys(got).forEach(function (g) { if (got[g] <= 0) return;
        SIM.withEcon(Pt.cache, function () { var w = Pt.store && spec[Pt.cache].works.some(function (x) { return x.id === Pt.store; })
          ? Pt.store : spec[Pt.cache].works[0].id; SIM.economyLand(g, got[g], w); SIM.economyBook('imported', g, got[g]); }); }); };
    SIM.stepHooks.push(function (minute) {
      P.forEach(function (Pt) {
        var A = S.ambushes[Pt.id];
        if (Pt.window && !(SIM.inSeason && SIM.inSeason(Pt.window, minute))) return;
        Object.keys(Pt.legs).sort().forEach(function (rid) {
          var TR = SIM.TRADE && SIM.TRADE.routes[rid], Rd = roads[rid]; if (!TR || !Rd) return;
          TR.carriers.forEach(function (Cr) {
            if (Cr.phase !== 'sail' || Cr.from == null) return;
            if (Pt.legs[rid].indexOf(Cr.from) < 0) return;
            var mark = Pt.id + '|' + Cr.from + '@' + Cr.eta;
            if (Cr._ambSeen === mark) return; Cr._ambSeen = mark;
            var cnt = Cr._ambN || (Cr._ambN = {}), n = cnt[Pt.id] = (cnt[Pt.id] || 0) + 1;
            var every = D(Pt.every, 3) > 0 ? D(Pt.every, 3) : 1, spare = D(Pt.spare, 0);
            if ((n - 1) % every < spare) return;   /* this passage is one of the ones that goes by untouched */
            var mod = H.ambushFilter ? H.ambushFilter(Pt, Rd, Cr, minute, V, S) : null;
            if (mod && mod.skip) return;
            A.tries++;
            var hidden = !!(Pt.hiddenIn && SIM.inSeason && SIM.inSeason(Pt.hiddenIn, minute));
            var roll = unit(seed + '|' + Pt.id + '|' + rid + '|' + Cr.k + '|' + n);
            var effStr = mod && mod.strength != null ? mod.strength : Pt.strength;
            var out = H.ambushOutcome({ kind: Pt.kind, strength: effStr, guard: H.ambushGuard(Rd, kit), hidden: hidden, roll: roll });
            A[out]++;
            var got = {}, beasts = 0, people = 0;
            if (out === 'tolled') got = takeCargo(Cr, Pt, D(Pt.toll, 0.12), A, rid);
            else if (out === 'mauled' || out === 'broken') {
              got = takeCargo(Cr, Pt, D(Pt.maul, 0.35), A, rid);
              if (Cr.beasts > 0) { beasts = Math.max(1, Math.round(Cr.beasts * D(Pt.beasts, 0.25))); Cr.beasts -= beasts; TR.died += beasts; A.beasts += beasts; }
              /* THE PEOPLE: Stalkers take the crew, which is what makes them read differently from bandits. Booked as
                 its own number and in the log, never as theft of a good (PLAN-SIM.md 4c). */
              if (Pt.kind === 'stalker') { people = D(Pt.people, 2); A.people += people; }
              if (out === 'broken') { Cr.to = typeof Cr.to === 'number' ? Cr.from : Rd.stops[Cr.from]; Cr.eta = minute + 1; }   /* the train turns back */
            }
            land(Pt, got);
            if (H.ambushAfter) H.ambushAfter(Pt, Rd, Cr, out, got, beasts, people, minute, V, S);
            S.ambushLog.push({ minute: minute, party: Pt.id, road: rid, carrier: Cr.k, leg: Cr.from, outcome: out,
              took: got, beasts: beasts, people: people });
            SIM.logEvent('ambush ' + out, { party: Pt.id, road: rid, carrier: Cr.k, leg: Cr.from, beasts: beasts, people: people });
          });
        });
      });
    });
  };
});
