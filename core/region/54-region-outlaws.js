// ================================================================= CORE — region 54: outlaws, bounties, expeditions & hidden source loop  [G data]
// openworld/catch-bowl/PLAN-RAIDS.md R1/R2 & PLAN-SIM.md section 4b-4e (2026-11-25). Opt-in sibling of 53-region-ambush.js:
// completely inert unless `V` carries `outlaws`, `bounties`, `expeditions`, or `stalkerSource`, so every existing valley
// tune (`test-ambush.js`, `test-five-tunes.js`, etc.) runs identically.
//
// Couples four region-level mechanics on top of `core/simulation/77-sim-6-outlaws.js`:
//   1. `V.outlaws`: initializes `SIM.outlaws`, gates `53-region-ambush.js` outlaw ambushes on live HQ / sub-camp state and
//      safe-conduct passes (`SIM.outlawExempt`), feeds raided cargo into the faction's `ol_cache` (`SIM.outlawDeposit`,
//      triggering new sub-camps!), and auto-posts Tier 2 Lieutenant warrants after `>= 2` raids on a route.
//   2. `V.bounties`: initializes `SIM.bounty` (standing Stalker hull bounties at Ranger HQ, Tier 3 Boss warrants, etc.).
//   3. `V.expeditions`: scheduled salvage expeditions staged out of a garrison/fort (e.g. Ranger HQ `sz85a8i5js` into the
//      Stalker Range — completely independent of passing road traffic!). Each expedition spends provisions/explosives from
//      the staging fort, brings back salvage (`alloy`, `cells`) booked via `SIM.economyLand` + `imported`, pays the fort's
//      quartermaster its `cut` (`15%` of expedition profits, owner ruling 2026-11-24), and claims standing Stalker bounties
//      when triads are felled!
//   4. `V.stalkerSource`: hidden source state (`state: 'active' | 'mastered' | 'dead'`, internal scalar `_p` 0..1) kept
//      strictly private inside a closure / non-enumerable state so NEITHER the word `"pressure"` NOR Hub 01's id
//      (`sodpa02bfv`) ever appears in `valleyBooks()`, `tradeReport()`, `transfersReport()`, `bountyReport()`, or
//      `outlawsReport()`! Clearing triads temporarily lowers `_p`, which recovers toward `1.0` ("attrition-proof", owner
//      ruling) UNLESS ended by a true expedition (`H.resolveHub01(S, {mode: 'call' | 'force', ...})`), which sets state to
//      `'mastered'` or `'dead'` and permanently ends Stalker ambushes region-wide!
KREGION.part('54-region-outlaws', function (H) {
  'use strict';
  var sim0 = H.simValley;
  var prevFilter = H.ambushFilter;
  var prevAfter = H.ambushAfter;

  function D(v, d) { return v == null ? d : v; }
  function fnv(s) {
    var str = String(s), h = 2166136261;
    for (var i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    return h >>> 0;
  }
  function unit(s) { return fnv(s) / 4294967296; }

  /* Hidden source table keyed by valley state S in a WeakMap so JSON.stringify(S) or any report never leaks Hub 01 */
  var HIDDEN_SRC = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var FALLBACK_SRC = null;
  function getSrc(S) { return HIDDEN_SRC ? HIDDEN_SRC.get(S) : FALLBACK_SRC; }
  function setSrc(S, v) { if (HIDDEN_SRC) HIDDEN_SRC.set(S, v); else FALLBACK_SRC = v; }

  H.simValley = function (V) {
    var S = sim0.call(H, V);
    if (!V) return S;
    if (V.bounties && SIM.bounty) SIM.bounty(V.bounties);
    if (V.outlaws && SIM.outlaws) SIM.outlaws(V.outlaws);
    if (V.stalkerSource) initSource(V, S);
    if (V.stalkerWeapons) initStalkerWeapons(V, S);
    if (V.expeditions && V.expeditions.length) initExpeditions(V, S);
    return S;
  };

  function initSource(V, S) {
    var cfg = V.stalkerSource;
    var st = {
      level: D(cfg.initial, 1.0),
      floor: D(cfg.attritionFloor, 0.25), /* attrition alone never kills Hub 01 (owner 2026-11-24) */
      regenPerWeek: D(cfg.regenPerWeek, 0.06),
      dropPerKill: D(cfg.dropPerKill, 0.08),
      status: cfg.status || 'active', /* 'active' | 'mastered' | 'dead' */
      nextWeek: 7 * 1440,
      felledTriads: 0
    };
    setSrc(S, st);
    SIM.stepHooks.push(function (minute) {
      while (minute >= st.nextWeek) {
        st.nextWeek += 7 * 1440;
        if (st.status === 'active' && st.level < 1.0) {
          st.level = Math.min(1.0, Math.round((st.level + st.regenPerWeek) * 1000) / 1000);
        }
      }
    });
  }

  /* End or master the hidden source via an Heir/Yusar call or a heavily equipped expedition (`relics + army + explosives`) */
  H.resolveHub01 = function (S, opts) {
    var st = getSrc(S);
    if (!st) return { ok: false, why: 'no hidden source in valley' };
    opts = opts || {};
    if (opts.mode === 'call') {
      if (!(opts.who === 'heir' || opts.who === 'yusar')) return { ok: false, why: 'only an Heir or a Yusar holds command authority' };
      st.status = 'mastered';
      st.level = 0;
      return { ok: true, status: 'mastered' };
    }
    if (opts.mode === 'force') {
      var relics = D(opts.relics, 0), army = D(opts.army, 0), exp = D(opts.explosives, 0);
      if (relics < 3 || army < 80 || exp < 200) {
        return { ok: false, why: 'insufficient relics, army or explosives to breach the mountain defences' };
      }
      st.status = 'dead';
      st.level = 0;
      return { ok: true, status: 'dead' };
    }
    return { ok: false, why: 'unknown resolution mode' };
  };

  /* Diagnostic accessor for tests ONLY — never attached to S or any settlement/trade/bounty report */
  H._stalkerActivity = function (S) {
    var st = getSrc(S);
    return st ? { status: st.status, activity: st.status === 'active' ? st.level : 0, felledTriads: st.felledTriads } : null;
  };

  /* Downstream allocation of Stalker weapons bought at Ranger HQ's standing exchange board (owner ruling 2026-11-25):
     1. Salvaged Ancient-alloy blades (`stalker_blades`) equip Ranger HQ's elite Ranger unit (`rangers.blade_watch`).
     2. Salvaged Stalker pneumatic harpoon guns (`stalker_guns`) mount on Ranger HQ's gate and ship down the West Trunk
        to `crown.yuni` to be mounted as gate guns at important places throughout the Yuni lands. */
  function initStalkerWeapons(V, S) {
    var spec = {};
    (V.settlements || []).forEach(function (Sd) { spec[Sd.id] = Sd; });
    var cfg = V.stalkerWeapons || {};
    var eu = cfg.eliteUnit || null;
    var gg = cfg.gateGuns || null;
    var state = { eliteUnit: null, gateGuns: null };
    S.stalkerWeapons = state;

    if (eu && spec[eu.settlement]) {
      var mh = (SIM.BOUNTY && SIM.BOUNTY.manhunters || []).find(function (m) { return m.id === eu.manhunterId; });
      var mhBase = mh ? mh.strength : 10;
      var euState = {
        id: eu.id,
        name: eu.name,
        settlement: eu.settlement,
        good: eu.good || 'stalker_blades',
        bladesPerTrooper: D(eu.bladesPerTrooper, 2),
        maxTroopers: D(eu.maxTroopers, 60),
        bladesIssued: 0,
        troopersEquipped: 0,
        bonusStrength: 0,
        nextIssueMin: 7 * 1440 + 10 * 60
      };
      state.eliteUnit = euState;
      SIM.stepHooks.push(function (minute) {
        while (minute >= euState.nextIssueMin) {
          euState.nextIssueMin += 7 * 1440;
          var capBlades = euState.maxTroopers * euState.bladesPerTrooper;
          var need = capBlades - euState.bladesIssued;
          if (need <= 0) continue;
          SIM.withEcon(euState.settlement, function () {
            var avail = SIM.stockOf ? Math.floor(SIM.stockOf(euState.good)) : 0;
            var takeWant = Math.min(need, avail);
            if (takeWant <= 0) return;
            var got = SIM.economyTake(euState.good, takeWant);
            if (got > 0) {
              SIM.economyBook('used', euState.good, got);
              euState.bladesIssued += got;
              euState.troopersEquipped = Math.floor(euState.bladesIssued / euState.bladesPerTrooper);
              euState.bonusStrength = Math.floor(euState.troopersEquipped / 4);
              if (mh) mh.strength = mhBase + euState.bonusStrength;
            }
          });
        }
      });
    }

    if (gg && spec[gg.hub]) {
      var everyDays = D(gg.dispatchEveryDays, 30);
      var ggState = {
        hub: gg.hub,
        yuniPool: gg.yuniPool || 'crown.yuni',
        good: gg.good || 'stalker_guns',
        shippedToYuni: 0,
        totalMounted: 0,
        nextDispatchMin: everyDays * 1440 + 9 * 60,
        everyMin: everyDays * 1440,
        sites: (gg.sites || []).map(function (st) {
          return { id: st.id, name: st.name, settlement: st.settlement, quota: D(st.quota, 2), mounted: 0 };
        })
      };
      state.gateGuns = ggState;
      SIM.stepHooks.push(function (minute) {
        while (minute >= ggState.nextDispatchMin) {
          ggState.nextDispatchMin += ggState.everyMin;
          /* 1. Mount any unmounted gate-gun quota at Ranger HQ itself (e.g. Lake Vapora West Gate) */
          SIM.withEcon(ggState.hub, function () {
            ggState.sites.forEach(function (site) {
              if (site.settlement !== ggState.hub || site.mounted >= site.quota) return;
              var avail = SIM.stockOf ? Math.floor(SIM.stockOf(ggState.good)) : 0;
              var want = Math.min(site.quota - site.mounted, avail);
              if (want <= 0) return;
              var got = SIM.economyTake(ggState.good, want);
              if (got > 0) {
                SIM.economyBook('used', ggState.good, got);
                site.mounted += got;
                ggState.totalMounted += got;
              }
            });
          });
          /* 2. Dispatch remaining bought-in pneumatic guns down the West Trunk to the Yuni lands and mount on gates */
          if (spec[ggState.yuniPool]) {
            var shipped = 0;
            SIM.withEcon(ggState.hub, function () {
              var avail = SIM.stockOf ? Math.floor(SIM.stockOf(ggState.good)) : 0;
              if (avail <= 0) return;
              var got = SIM.economyTake(ggState.good, avail);
              if (got > 0) {
                SIM.economyBook('exported', ggState.good, got);
                shipped = got;
              }
            });
            if (shipped > 0) {
              ggState.shippedToYuni += shipped;
              SIM.withEcon(ggState.yuniPool, function () {
                if (SIM.economyLand(ggState.good, shipped, null) != null) {
                  SIM.economyBook('imported', ggState.good, shipped);
                }
                ggState.sites.forEach(function (site) {
                  if (site.settlement !== ggState.yuniPool || site.mounted >= site.quota) return;
                  var availY = SIM.stockOf ? Math.floor(SIM.stockOf(ggState.good)) : 0;
                  var wantY = Math.min(site.quota - site.mounted, availY);
                  if (wantY <= 0) return;
                  var gotY = SIM.economyTake(ggState.good, wantY);
                  if (gotY > 0) {
                    SIM.economyBook('used', ggState.good, gotY);
                    site.mounted += gotY;
                    ggState.totalMounted += gotY;
                  }
                });
              });
            }
          }
        }
      });
    }
  }

  function initExpeditions(V, S) {
    var seed = String(D(V.seed, 20261125));
    var spec = {};
    (V.settlements || []).forEach(function (Sd) { spec[Sd.id] = Sd; });
    S.expeditions = { runs: 0, felledTriads: 0, grossSalvage: {}, rangerCut: {}, netParty: {}, bountyClaims: 0, trophiesExchanged: {}, log: [] };

    var list = V.expeditions.map(function (E, idx) {
      var every = D(E.everyDays, 45);
      return {
        id: E.id || ('exp.' + (idx + 1)),
        base: E.base || 'sz85a8i5js',
        partyPool: E.partyPool || null, /* optional off-map / adventurer pool receiving the 85% party share; if null, stays at base */
        everyMin: every * 1440,
        nextMin: D(E.firstDay, 20 + idx * 15) * 1440 + 8 * 60,
        cut: D(E.cut, 0.15), /* Ranger HQ's small cut of expedition profits (owner ruling 2026-11-24) */
        supplies: Object.assign({ grain: 180, water: 400, explosives: 18, tools: 4 }, E.supplies || {}),
        yieldBase: Object.assign({ alloy: 320, cells: 14 }, E.yield || {}),
        bountyWarrant: E.bountyWarrant || null,
        trophyWarrants: E.trophyWarrants ? Object.assign({}, E.trophyWarrants) : null,
        runs: 0
      };
    });

    SIM.stepHooks.push(function (minute) {
      list.forEach(function (Ex) {
        while (minute >= Ex.nextMin) {
          var runMin = Ex.nextMin;
          Ex.nextMin += Ex.everyMin;
          if (!spec[Ex.base]) continue;
          /* 1. Stage out of base: draw expedition provisions from base warehouse (booked as exported to the Range) */
          var staged = true;
          SIM.withEcon(Ex.base, function () {
            var g0 = SIM.stockOf ? SIM.stockOf('grain') : 1000;
            if (g0 < (Ex.supplies.grain || 0)) { staged = false; return; }
            Object.keys(Ex.supplies).sort().forEach(function (g) {
              var want = Ex.supplies[g] || 0;
              if (want <= 0) return;
              var got = SIM.economyTake(g, want);
              if (got > 0) SIM.economyBook('exported', g, got);
            });
          });
          if (!staged) continue;

          Ex.runs++;
          S.expeditions.runs++;
          var roll = 0.75 + 0.5 * unit(seed + '|exp|' + Ex.id + '|' + Ex.runs);
          var gross = {}, cutGoods = {}, partyGoods = {};
          Object.keys(Ex.yieldBase).sort().forEach(function (g) {
            var tot = Math.max(1, Math.round(Ex.yieldBase[g] * roll));
            var cShare = Math.max(1, Math.round(tot * Ex.cut));
            var pShare = Math.max(0, tot - cShare);
            gross[g] = tot;
            cutGoods[g] = cShare;
            partyGoods[g] = pShare;
            S.expeditions.grossSalvage[g] = (S.expeditions.grossSalvage[g] || 0) + tot;
            S.expeditions.rangerCut[g] = (S.expeditions.rangerCut[g] || 0) + cShare;
            S.expeditions.netParty[g] = (S.expeditions.netParty[g] || 0) + pShare;
          });

          /* 2. Land Ranger HQ's `cut` directly into Ranger HQ's salvage/market warehouse (`imported`), and land the
             expedition party's net share into `partyPool` (if an off-map/adventurer settlement exists) or Ranger HQ */
          SIM.withEcon(Ex.base, function () {
            Object.keys(cutGoods).sort().forEach(function (g) {
              if (SIM.economyLand(g, cutGoods[g], null) != null) SIM.economyBook('imported', g, cutGoods[g]);
            });
          });
          var dest = (Ex.partyPool && spec[Ex.partyPool]) ? Ex.partyPool : Ex.base;
          SIM.withEcon(dest, function () {
            Object.keys(partyGoods).sort().forEach(function (g) {
              if (partyGoods[g] <= 0) return;
              if (SIM.economyLand(g, partyGoods[g], null) != null) SIM.economyBook('imported', g, partyGoods[g]);
            });
          });

          /* 3. Stalker encounter in the Range: fells 1..2 Stalker triads (Harpooners + Blade Stalkers), temporarily
             dipping hidden source activity, and exchanges salvaged pneumatic guns & Ancient-alloy blades at Ranger HQ! */
          var st = getSrc(S);
          var felled = (!st || st.status === 'active') ? (roll > 0.95 ? 2 : 1) : 0;
          if (felled > 0) {
            S.expeditions.felledTriads += felled;
            if (st && st.status === 'active') {
              st.felledTriads += felled;
              st.level = Math.max(st.floor, Math.round((st.level - felled * st.dropPerKill) * 1000) / 1000);
            }
            if (Ex.trophyWarrants && SIM.BOUNTY && SIM.bountyClaim) {
              var drops = {
                stalker_guns: felled * (roll > 0.85 ? 2 : 1),
                stalker_blades: felled * 2
              };
              Object.keys(Ex.trophyWarrants).sort().forEach(function (tg) {
                var wid = Ex.trophyWarrants[tg], qty = drops[tg] || felled;
                if (!wid || qty <= 0) return;
                if (dest !== Ex.base) {
                  SIM.withEcon(dest, function () {
                    if (SIM.economyLand(tg, qty, null) != null) SIM.economyBook('imported', tg, qty);
                  });
                }
                var clT = SIM.bountyClaim({
                  id: wid,
                  mode: 'dead',
                  count: qty,
                  fromField: dest === Ex.base,
                  claimant: Ex.id,
                  claimantSettlement: dest,
                  minute: runMin
                });
                if (clT && clT.ok) {
                  S.expeditions.bountyClaims += clT.trophiesExchanged || qty;
                  S.expeditions.trophiesExchanged[tg] = (S.expeditions.trophiesExchanged[tg] || 0) + (clT.trophiesExchanged || qty);
                }
              });
            } else if (Ex.bountyWarrant && SIM.BOUNTY && SIM.bountyClaim) {
              var cl = SIM.bountyClaim({
                id: Ex.bountyWarrant,
                mode: 'dead',
                count: felled,
                claimant: Ex.id,
                claimantSettlement: dest !== Ex.base ? dest : Ex.base,
                minute: runMin
              });
              if (cl && cl.ok) S.expeditions.bountyClaims += felled;
            }
          }

          S.expeditions.log.push({ minute: runMin, id: Ex.id, run: Ex.runs, gross: gross, rangerCut: cutGoods, felled: felled });
        }
      });
    });
  }

  /* Hook into `53-region-ambush.js`:
     - Outlaws: skip if faction is `dormant`/`shattered`, if leg is pruned, or if round owner holds safe-conduct pass;
       scale strength by active sub-camps + conquest splinters!
     - Stalkers: skip completely if hidden source is `'mastered'` or `'dead'`, or deterministically skip when cleared
       triads have lowered activity! */
  H.ambushFilter = function (Pt, Rd, Cr, minute, V, S) {
    if (prevFilter) {
      var r0 = prevFilter(Pt, Rd, Cr, minute, V, S);
      if (r0 && r0.skip) return r0;
    }
    if (Pt.kind === 'stalker') {
      var st = getSrc(S);
      if (st) {
        if (st.status !== 'active' || st.level <= 0) return { skip: true };
        if (st.level < 1.0) {
          var u = unit(String(D(V.seed, 0)) + '|stact|' + Pt.id + '|' + Rd.id + '|' + Cr.k + '|' + minute);
          if (u > st.level) return { skip: true };
        }
      }
      return null;
    }
    var fid = Pt.outlawFaction || Pt.template || Pt.id;
    if (SIM.OUTLAWS && SIM.OUTLAWS.factions[fid]) {
      var F = SIM.OUTLAWS.factions[fid];
      if (F.stage === 'dormant' || F.stage === 'shattered') return { skip: true };
      if (Rd.owner && SIM.outlawExempt && SIM.outlawExempt(fid, Rd.owner)) return { skip: true };
      var legKey = Rd.id + ':' + Cr.from;
      var pu = F.prunedUntil[legKey] || F.prunedUntil[Rd.id];
      if (pu != null && minute < pu) return { skip: true };
      var subs = F.subCamps.filter(function (c) { return c.active; }).length;
      if (subs === 0 && F.stage !== 'foothold') return { skip: true };
      var splinters = SIM.OUTLAWS.splinters.filter(function (sp) { return sp.zone === F.zone && sp.active; }).length;
      var eff = D(Pt.strength, F.baseStrength) * (0.75 + 0.25 * Math.min(4, subs)) + splinters * 1.5;
      return { strength: eff };
    }
    return null;
  };

  /* Post-ambush hook: deposit stolen outlaw loot into `SIM.OUTLAWS` cache (triggering sub-camp budding!) and auto-post
     Tier 2 route warrants after >= 2 successful raids */
  H.ambushAfter = function (Pt, Rd, Cr, out, got, beasts, people, minute, V, S) {
    if (prevAfter) prevAfter(Pt, Rd, Cr, out, got, beasts, people, minute, V, S);
    if (Pt.kind !== 'outlaw') return;
    var fid = Pt.outlawFaction || Pt.template || Pt.id;
    if (SIM.OUTLAWS && SIM.OUTLAWS.factions[fid] && (out === 'tolled' || out === 'mauled' || out === 'broken')) {
      SIM.outlawDeposit(fid, got, minute);
      var A = S.ambushes && S.ambushes[Pt.id];
      var raids = A ? (A.tolled + A.mauled + A.broken) : 0;
      if (raids === 2 && SIM.BOUNTY && SIM.bountyPost) {
        var wid = 'warrant.lt.' + fid + '.' + Rd.id;
        if (!SIM.BOUNTY.warrants[wid]) {
          SIM.bountyPost({
            id: wid, target: fid + '.lieutenant.' + Rd.id, outlawFaction: fid,
            polity: Rd.polity || 'frontier', tier: 2, amount: 220,
            reason: 'repeated caravan raids on ' + Rd.id
          });
        }
      }
    }
  };
});
