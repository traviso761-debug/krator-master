// ================================================================= CORE — simulation 6: outlaws, pirates & bounties  [G data]
// core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md (Rulings #90-94, 2026-11-22) & openworld/catch-bowl/PLAN-RAIDS.md R1 /
// PLAN-SIM.md section 4e (2026-11-25). Opt-in: completely inert unless a world or region calls SIM.outlaws(...) or
// SIM.bounty(...), and draws zero numbers from SIM.rng (every roll is a pure 32-bit FNV-1a / Murmur-style hash of seed,
// week, zone and faction id), so existing worlds keep identical traces and Voth's stocks proof is untouched.
//
// 1. PERSISTENT OUTLAW & PIRATE TEMPLATES (`SIM.OUTLAW_TEMPLATES`):
//    `BF-01`..`BF-10` (frontier bandit brotherhoods) & `PF-01`..`PF-06` (maritime pirate flotillas), with full cultural
//    ethos, appetite (`wants`), diplomacy (`toll`, `bluffGear`, `allyPolities`), fence goods, and named boss titles —
//    specifically detailing `BF-05` Salt-Thirsters (Imperial Bowl), `BF-06` Glass-Eaters (Mid Basin / Stalker Gate), and
//    `BF-07` Tin-Skulls (Catch Rim / Godsgate Stalker-mimics).
//
// 2. PROCEDURAL 5-STAGE LIFECYCLE, `orderliness` & POST-CONQUEST SURGE (`SIM.outlaws(cfg)`):
//    - Zones track `orderliness` (`0.00..1.00`) weekly:
//        `>= 0.80` -> 0 HQs (`dormant`), stray sub-camps swept;
//        `0.50..0.80` -> at most 1 remote foothold / 1 sub-camp, 180-day succession cooldown;
//        `0.25..0.50` -> full HQ + up to 2..3 sub-camps, 90-day succession cooldown;
//        `< 0.25` -> breakdown / conquest surge: up to 4 sub-camps + temporary Deserter / Splinter Bands!
//    - Lifecycle: `dormant` -> `foothold` (when orderliness < 0.55) -> `active` (buds 1..4 sub-camps when `cacheTotal >= budCap`
//      or weeks active) -> `pruned` (sub-camp cleared: safe `30-60` days before re-pitching at `visit++` if HQ stands) ->
//      `shattered` (Named Boss captured/killed at Main HQ via Tier 3 bounty or sweep) -> `dormant` (if orderliness >= 0.60)
//      or vengeful Lieutenant Successor (`successionCount++`, `grudge`) after `90-180` days.
//    - `SIM.onCityConquered({zone, city, fromPolity, toPolity})`: Ruling #94 immediate `-0.45..-0.60` shock (floored at `0.10`),
//      spawning armed Deserter Bands; gradual foreign pacification (`+0.02..+0.04`/wk) requires garrison + repairs + bounties +
//      low unrest (stalls `< 0.35` if starved/unrepaired!).
//    - Stance spectrum (`hostile` -> `wary` -> `pass_holder` -> `associate` -> `sworn_ally`), 75% black-market fence
//      (`SIM.outlawFence`), and Letters of Marque (`SIM.issueMarque`: 80% privateer / 20% Crown fifth).
//
// 3. CONTINENTAL BOUNTY LEDGER (`SIM.bounty(cfg)`):
//    - Warrant Tiers 1..4 (`tier`: 1 Town Fugitive, 2 Lieutenant, 3 Named Boss / Captain, 4 Political/Ideological with
//      per-polity relativity & `sanctuaries`).
//    - `SIM.bountyClaim`: Live delivery (`1.0x` payout, jailed `30-90` days, triggers `1` deterministic road rescue ambush
//      check if surviving sub-camps exist!) vs Proof-of-Death (`0.55x` human outlaw, `1.0x` feral/monster/`stalker`!).
//    - Strictly conserved payouts: coin via `SIM.pay(issuerAcct, claimantAcct, payout, ...)` (when `SIM.MONEY` is active)
//      and/or physical goods via `SIM.economyTake` + `SIM.economyLand` (conserved across settlement warehouses!).
//    - Tier 3 Boss capture/kill automatically decapitates (`shatter`) the linked `SIM.OUTLAWS` faction; prison breaks
//      (`SIM.bountyPrisonBreak`) free jailed bosses when garrison standing drops; roaming `manhunters` posses patrol roads.
(function(root){
  'use strict';
  var SIM = root.SIM;
  if (!SIM) return;

  function D(v, d) { return v == null ? d : v; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fnv(s) {
    var str = String(s), h = 2166136261;
    for (var i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
    return h >>> 0;
  }
  function hUnit(seed, a, b, c) {
    var h = fnv(String(seed) + '|' + String(a) + '|' + String(D(b, 0)) + '|' + String(D(c, 0)));
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  var STANCES = ['hostile', 'wary', 'pass_holder', 'associate', 'sworn_ally'];

  SIM.OUTLAW_TEMPLATES = {
    'BF-01': { id: 'BF-01', kind: 'bandit', name: 'The Hull-Breakers of Boatmurder', bossTitle: 'Lord-Admiral of the Dry Fleet', zone: 'dam-basins', hqPx: [766, 404], wants: ['spirits', 'grain', 'tools', 'water'], fenceSell: ['alloy', 'spirits'], tollGood: 'coin', ethos: 'dry-fleet naval brigands' },
    'BF-02': { id: 'BF-02', kind: 'bandit', name: 'The Broken-Count', bossTitle: 'The Uncounted', zone: 'cut-jimjam', hqPx: [785, 512], wants: ['grain', 'cloth', 'tools'], fenceSell: ['tools', 'cloth'], ethos: 'calendar-heretic anti-tax rebels' },
    'BF-03': { id: 'BF-03', kind: 'bandit', name: 'The Chain-Snappers', bossTitle: 'Iron-Collar', zone: 'korona-shell', hqPx: [912, 532], wants: ['arms', 'tools', 'grain', 'medicine'], fenceSell: ['tools'], allyPolities: ['republic', 'vrivolci'], rivalPolities: ['shell'], ethos: 'runaway debt-peon maroons' },
    'BF-04': { id: 'BF-04', kind: 'bandit', name: 'The Red-Chalk Reivers', bossTitle: 'The Skein-Cutter', zone: 'korona-east', hqPx: [1035, 390], wants: ['cloth', 'tools', 'salt'], fenceSell: ['spider-silk', 'lodestone'], tollShare: 0.10, ethos: 'highland poachers taking one skein and one blade' },
    'BF-05': { id: 'BF-05', kind: 'bandit', name: 'The Salt-Thirsters', bossTitle: 'Dry-Tongue', zone: 'bowl', hqPx: [1113, 1164], wants: ['water', 'grain', 'salt', 'dates'], fenceSell: ['salt', 'hides'], bribeGoods: ['water', 'grain'], tollShare: 0.12, maulShare: 0.32, strength: 5, ethos: 'sun-crazed Bowl caravaneers and salt-pan debtors who demand water and grain before silver' },
    'BF-06': { id: 'BF-06', kind: 'bandit', name: 'The Glass-Eaters', bossTitle: 'The Cracked Retort', zone: 'mid-basin', hqPx: [1385, 1110], wants: ['oil', 'kerosene', 'sulfur', 'fireclay', 'water', 'grain'], fenceSell: ['fireclay', 'naphtha', 'sulfur'], tollShare: 0.15, maulShare: 0.35, strength: 7, ethos: 'rogue Yuni alchemist-apprentices fighting with naphtha fire-pots and hijacking Geomancer trains' },
    'BF-07': { id: 'BF-07', kind: 'bandit', name: 'The Tin-Skulls', bossTitle: 'Unit Zero-Nine', zone: 'catch-rim', hqPx: [1106, 1442], wants: ['alloy', 'cells', 'tools', 'explosives', 'water', 'grain'], fenceSell: ['alloy', 'cells'], bluffGear: ['ancient', 'cybernetic'], dialogue: 'DECLARE CARGO SERIAL NUMBER', tollShare: 0.14, maulShare: 0.35, strength: 6, ethos: 'delusional high-altitude scavengers in riveted Stalker scrap-helmets who toll caravans (and whom real Stalkers still kill)' },
    'BF-08': { id: 'BF-08', kind: 'bandit', name: 'Wildcat\'s Pack', bossTitle: 'The Wildcat', zone: 'west-rift-rim', hqPx: [441, 1400], wants: ['salt', 'grain', 'spirits', 'cloth'], fenceSell: ['furs', 'spirits'], passToken: 'Wildcat\'s Feather', ethos: 'fellgang highwaymen who never cut a gorge-rope' },
    'BF-09': { id: 'BF-09', kind: 'bandit', name: 'The Scalded Brotherhood', bossTitle: 'Half-Lung', zone: 'west-rift-floor', hqPx: [526, 1503], wants: ['medicine', 'water', 'salt'], fenceSell: ['rare-earth', 'alloy'], ethos: 'respirator-masked deep-Rift penal fugitives' },
    'BF-10': { id: 'BF-10', kind: 'bandit', name: 'The Inverted', bossTitle: 'The Unsacrificed', zone: 'sw-basin', hqPx: [582, 1079], wants: ['arms', 'grain', 'medicine', 'cloth'], fenceSell: ['relics', 'cloth'], allyPolities: ['longsong', 'history-monks'], rivalPolities: ['voth'], ethos: 'escaped Vothic captives in inverted purple masks' },
    'PF-01': { id: 'PF-01', kind: 'pirate', name: 'Hooked-Sun Legitimists', bossTitle: 'Tax-Admiral Vasko Marxal', hulls: ['xebec', 'dhoni', 'dhoni'], zone: 'ring-sea-west', wants: ['cloth', 'grain', 'tools', 'spice'], tollShare: 0.20, ethos: 'issues stamped Imperial Tax Receipts' },
    'PF-02': { id: 'PF-02', kind: 'pirate', name: 'Kautoan Sea-Rovers', bossTitle: 'Kapitan Manu\'a', hulls: ['lanong', 'karakoa'], zone: 'ring-sea-isles', wants: ['spice', 'cloth', 'tools'], ethos: 'outrigger rovers sparing poor canoes' },
    'PF-03': { id: 'PF-03', kind: 'pirate', name: 'Gill-Born Night-Boarders', bossTitle: 'Trierarch Nerissa', hulls: ['penteconter'], zone: 'trigon-coast', wants: ['medicine', 'cloth', 'grain'], ethos: 'rib-gill swimmers fouling rudders by night' },
    'PF-04': { id: 'PF-04', kind: 'pirate', name: 'Boiling-Bay Fumarole Wreckers', bossTitle: 'Brimstone Goro', hulls: ['lighter', 'dhoni'], zone: 'boiling-bay', wants: ['timber', 'oil', 'tools'], ethos: 'false-lantern sulfur-fog wreckers' },
    'PF-05': { id: 'PF-05', kind: 'pirate', name: 'Chain-Breaker Privateers', bossTitle: 'Captain Sava', hulls: ['brigantine'], zone: 'zeijani-coast', wants: ['arms', 'grain', 'cloth'], allyPolities: ['ys', 'republic'], rivalPolities: ['voth', 'zeijani', 'shell'], ethos: 'abolitionist privateers' },
    'PF-06': { id: 'PF-06', kind: 'pirate', name: 'Tsunami-Coast Reavers', bossTitle: 'The Salt-Wolf', hulls: ['knarr'], zone: 'north-coast', wants: ['grain', 'timber', 'tools', 'furs'], ethos: 'heavy northern coast reavers' }
  };

  var BOSS_EPITHETS = ['the Scarred', 'Twice-Hanged', 'Ash-Hand', 'the Younger', 'Red-Eye', 'Three-Fingers', 'the Unpaid'];

  function maxSubsForOrder(ord) {
    if (ord >= 0.80) return 0;
    if (ord >= 0.50) return 1;
    if (ord >= 0.25) return 3;
    return 4;
  }

  function cooldownDaysForOrder(ord) {
    return ord >= 0.50 ? 180 : 90;
  }

  /* ================================================================= 1. SIM.outlaws */
  SIM.OUTLAWS = null;

  SIM.outlaws = function (cfg) {
    cfg = cfg || {};
    var O = {
      seed: D(cfg.seed, 20261122),
      zones: {},
      factions: {},
      order: [],
      splinters: [],
      marques: {},
      events: [],
      nextWeekMin: D(cfg.firstMinute, 7 * 1440)
    };
    (cfg.zones || []).forEach(function (z) {
      var ord = clamp(D(z.orderliness, 0.45), 0, 1);
      O.zones[z.id] = {
        id: z.id, name: z.name || z.id, polity: z.polity || null,
        orderliness: ord, targetOrder: D(z.targetOrder, ord),
        garrison: D(z.garrison, ord >= 0.6 ? 1 : 0.4),
        wallsRepaired: z.wallsRepaired !== false,
        bountiesFunded: z.bountiesFunded !== false,
        unrest: D(z.unrest, 0.1), starving: !!z.starving,
        conquered: false, legs: (z.legs || []).slice()
      };
    });
    (cfg.factions || []).forEach(function (f) {
      var tpl = SIM.OUTLAW_TEMPLATES[f.template || f.id] || {};
      var id = f.id || tpl.id;
      if (!id) throw new Error('SIM.outlaws: faction needs an id or template');
      var zId = f.zone || tpl.zone || Object.keys(O.zones)[0] || 'frontier';
      if (!O.zones[zId]) O.zones[zId] = { id: zId, name: zId, polity: null, orderliness: 0.40, targetOrder: 0.40, garrison: 0.4, wallsRepaired: true, bountiesFunded: false, unrest: 0.1, starving: false, conquered: false, legs: [] };
      var ord = O.zones[zId].orderliness;
      var stage = f.stage || (ord >= 0.80 ? 'dormant' : ord >= 0.50 ? 'foothold' : 'active');
      var F = {
        id: id,
        template: tpl.id || id,
        kind: f.kind || tpl.kind || 'bandit',
        name: f.name || tpl.name || id,
        zone: zId,
        stage: stage,
        boss: {
          id: id + '.boss.0',
          name: f.bossName || tpl.bossTitle || ('Chief of ' + id),
          title: tpl.bossTitle || 'Boss',
          alive: stage !== 'shattered' && stage !== 'dormant',
          captured: false,
          generation: 0,
          grudge: null
        },
        hq: {
          px: (f.hqPx || tpl.hqPx || [1000, 1000]).slice(),
          pop: stage === 'dormant' || stage === 'shattered' ? 0 : (stage === 'foothold' ? 35 : D(f.hqPop, 90)),
          settlement: f.cache || null,
          store: f.store || null
        },
        wants: (f.wants || tpl.wants || ['grain', 'water', 'tools']).slice(),
        fenceSell: (f.fenceSell || tpl.fenceSell || ['tools']).slice(),
        bribeGoods: (f.bribeGoods || tpl.bribeGoods || []).slice(),
        bluffGear: (f.bluffGear || tpl.bluffGear || []).slice(),
        allyPolities: (f.allyPolities || tpl.allyPolities || []).slice(),
        rivalPolities: (f.rivalPolities || tpl.rivalPolities || []).slice(),
        tollShare: D(f.tollShare, D(tpl.tollShare, 0.12)),
        maulShare: D(f.maulShare, D(tpl.maulShare, 0.35)),
        baseStrength: D(f.strength, D(tpl.strength, 6)),
        budCap: D(f.budCap, 120),
        cache: Object.assign({}, f.initialCache || {}),
        subCamps: [],
        legs: (f.legs || O.zones[zId].legs || []).slice(),
        stances: Object.assign({ player: 'hostile' }, f.stances || {}),
        prunedUntil: {},
        shatteredUntil: null,
        visit: 0,
        successionCount: 0
      };
      var wantSubs = stage === 'active' ? Math.min(D(f.initialSubs, 2), maxSubsForOrder(ord)) : (stage === 'foothold' ? Math.min(1, maxSubsForOrder(ord)) : 0);
      for (var s = 0; s < wantSubs; s++) spawnSubCamp(O, F, 0);
      O.factions[id] = F;
      O.order.push(id);
    });
    SIM.OUTLAWS = O;
    return O;
  };

  function cacheTotal(F) {
    var sum = 0, ks = Object.keys(F.cache);
    for (var i = 0; i < ks.length; i++) sum += Math.max(0, F.cache[ks[i]] || 0);
    return sum;
  }

  function spawnSubCamp(O, F, minute) {
    var ord = O.zones[F.zone] ? O.zones[F.zone].orderliness : 0.4;
    var cap = maxSubsForOrder(ord);
    var live = F.subCamps.filter(function (c) { return c.active; });
    if (live.length >= cap) return null;
    F.visit++;
    var legPool = F.legs.length ? F.legs : ['road.0'];
    var avail = legPool.filter(function (lg) {
      var pu = F.prunedUntil[lg];
      return (pu == null || minute >= pu) && !live.some(function (c) { return c.leg === lg; });
    });
    if (!avail.length) {
      if (live.length > 0 && legPool.every(function (lg) { return F.prunedUntil[lg] != null && minute < F.prunedUntil[lg]; })) return null;
      avail = legPool;
    }
    var pickIdx = Math.floor(hUnit(O.seed, F.id, F.visit, 17) * avail.length) % avail.length;
    var leg = avail[pickIdx];
    var sub = {
      id: F.id + '/sub/' + F.visit,
      faction: F.id,
      visit: F.visit,
      leg: leg,
      raiders: 12 + Math.floor(hUnit(O.seed, F.id, F.visit, 23) * 19),
      lookouts: 2 + (hUnit(O.seed, F.id, F.visit, 29) > 0.5 ? 1 : 0),
      active: true,
      pitchedAt: minute
    };
    F.subCamps.push(sub);
    O.events.push({ m: minute, kind: 'outlaw_bud', faction: F.id, subCamp: sub.id, leg: leg, visit: F.visit });
    return sub;
  }

  SIM.outlawDeposit = function (factionId, goods, minute) {
    var O = SIM.OUTLAWS; if (!O || !O.factions[factionId]) return 0;
    var F = O.factions[factionId], added = 0;
    Object.keys(goods || {}).forEach(function (g) {
      var n = Math.max(0, goods[g] || 0);
      if (n > 0) { F.cache[g] = (F.cache[g] || 0) + n; added += n; }
    });
    var Z = O.zones[F.zone], ord = Z ? Z.orderliness : 0.4;
    if ((F.stage === 'foothold' || F.stage === 'active') && cacheTotal(F) >= F.budCap && ord < 0.80) {
      if (F.stage === 'foothold' && ord < 0.50) { F.stage = 'active'; F.hq.pop = Math.max(F.hq.pop, 75); }
      var budded = spawnSubCamp(O, F, D(minute, SIM.minute ? SIM.minute() : 0));
      if (budded) {
        /* spend budCap from cache to outfit the new lieutenant's sub-camp */
        var rem = F.budCap;
        Object.keys(F.cache).sort().forEach(function (g) {
          if (rem <= 0) return;
          var take = Math.min(rem, F.cache[g] || 0);
          F.cache[g] -= take; rem -= take;
        });
      }
    }
    return added;
  };

  /* Pruning a sub-camp makes its leg safe for 30-60 days; if HQ stands and orderliness stays low, a new sub-camp buds later */
  SIM.outlawPruneSub = function (factionId, subId, minute) {
    var O = SIM.OUTLAWS; if (!O || !O.factions[factionId]) return null;
    var F = O.factions[factionId], m = D(minute, SIM.minute ? SIM.minute() : 0);
    var sub = F.subCamps.find(function (c) { return c.id === subId && c.active; });
    if (!sub) return null;
    sub.active = false;
    var safeDays = 30 + Math.floor(hUnit(O.seed, F.id, sub.visit, 41) * 31);
    F.prunedUntil[sub.leg] = m + safeDays * 1440;
    O.events.push({ m: m, kind: 'outlaw_pruned', faction: F.id, subCamp: sub.id, leg: sub.leg, safeDays: safeDays });
    return { subCamp: sub.id, leg: sub.leg, safeDays: safeDays, until: F.prunedUntil[sub.leg] };
  };

  /* Decapitating the Named Boss at Main HQ shatters the faction and scatters its sub-camps */
  SIM.outlawShatter = function (factionId, byWho, captured, minute) {
    var O = SIM.OUTLAWS; if (!O || !O.factions[factionId]) return null;
    var F = O.factions[factionId], m = D(minute, SIM.minute ? SIM.minute() : 0);
    var Z = O.zones[F.zone], ord = Z ? Z.orderliness : 0.4;
    var cdDays = cooldownDaysForOrder(ord);
    F.stage = 'shattered';
    F.boss.alive = !!captured;
    F.boss.captured = !!captured;
    F.boss.felledBy = byWho || 'patrol';
    F.hq.pop = 0;
    var scattered = 0;
    F.subCamps.forEach(function (c) { if (c.active) { c.active = false; scattered++; } });
    F.shatteredUntil = m + cdDays * 1440;
    O.events.push({ m: m, kind: 'outlaw_shattered', faction: F.id, boss: F.boss.name, by: F.boss.felledBy, captured: !!captured, scattered: scattered, cooldownDays: cdDays });
    return { faction: F.id, stage: F.stage, scattered: scattered, cooldownDays: cdDays, until: F.shatteredUntil };
  };

  /* Ruling #94: City Fall / Foreign Conquest Shock (`-0.45..-0.60` plunge, floored at 0.10, + Deserter Splinter Bands) */
  SIM.onCityConquered = function (ev) {
    var O = SIM.OUTLAWS; if (!O || !ev) return null;
    var Z = O.zones[ev.zone]; if (!Z) return null;
    var m = D(ev.minute, SIM.minute ? SIM.minute() : 0);
    var drop = 0.45 + 0.15 * hUnit(O.seed, ev.city || ev.zone, m, 71);
    var before = Z.orderliness;
    Z.orderliness = Math.max(0.10, Math.round((Z.orderliness - drop) * 1000) / 1000);
    Z.polity = ev.toPolity || Z.polity;
    Z.conquered = true;
    Z.garrison = D(ev.garrison, 0.15);
    Z.wallsRepaired = false;
    Z.bountiesFunded = false;
    Z.unrest = Math.max(Z.unrest, D(ev.unrest, 0.65));
    Z.starving = !!ev.starving;
    var nBands = 2 + (hUnit(O.seed, ev.city || ev.zone, m, 73) > 0.5 ? 1 : 0), spawned = [];
    for (var i = 0; i < nBands; i++) {
      var b = {
        id: 'deserter.' + (ev.city || ev.zone) + '.' + (O.splinters.length + 1),
        zone: Z.id, fromPolity: ev.fromPolity || 'fallen',
        name: (ev.fromPolity ? ev.fromPolity + ' ' : '') + 'Holdout Deserters #' + (i + 1),
        strength: 6 + i, active: true, spawnedAt: m
      };
      O.splinters.push(b); spawned.push(b.id);
    }
    /* wake any dormant/foothold faction in the conquered zone immediately */
    O.order.forEach(function (fid) {
      var F = O.factions[fid];
      if (F.zone === Z.id && F.stage === 'dormant') { F.stage = 'foothold'; F.hq.pop = 45; F.boss.alive = true; spawnSubCamp(O, F, m); }
    });
    O.events.push({ m: m, kind: 'conquest_surge', zone: Z.id, city: ev.city || null, before: before, after: Z.orderliness, deserters: spawned });
    return { zone: Z.id, before: before, orderliness: Z.orderliness, drop: Math.round((before - Z.orderliness) * 1000) / 1000, deserters: spawned };
  };

  /* Weekly step: orderliness waxing/waning, post-conquest pacification gates, emergence, budding, sweeping & succession */
  SIM.outlawsStep = function (minute) {
    var O = SIM.OUTLAWS; if (!O) return;
    while (minute >= O.nextWeekMin) {
      var wkMin = O.nextWeekMin, wk = Math.floor(wkMin / (7 * 1440));
      O.nextWeekMin += 7 * 1440;
      Object.keys(O.zones).sort().forEach(function (zid) {
        var Z = O.zones[zid];
        if (Z.conquered) {
          /* Foreign pacification (+0.02..+0.04/wk) ONLY when garrisoned, walls repaired, bounties funded, and not starving/unruly;
             if starving or high unrest without repairs, orderliness stalls <= 0.34 (Ruling #94) */
          if (Z.starving || Z.unrest > 0.55 || Z.garrison < 0.4) {
            Z.orderliness = Math.min(0.34, Math.max(0.10, Z.orderliness + (Z.starving ? -0.01 : 0.005)));
          } else {
            var step = 0.02 + (Z.wallsRepaired ? 0.01 : 0) + (Z.bountiesFunded ? 0.01 : 0);
            var cap = (Z.wallsRepaired && Z.bountiesFunded) ? Math.max(0.75, Z.targetOrder) : 0.48;
            Z.orderliness = Math.min(cap, Math.round((Z.orderliness + step) * 1000) / 1000);
            if (Z.orderliness >= 0.65 && Z.wallsRepaired && Z.bountiesFunded) Z.conquered = false;
          }
        } else {
          var delta = (Z.targetOrder - Z.orderliness) * 0.2;
          if (Math.abs(delta) > 1e-4) Z.orderliness = clamp(Math.round((Z.orderliness + delta) * 1000) / 1000, 0, 1);
        }
        /* Sweep conquest splinter bands once orderliness rises >= 0.45 */
        if (Z.orderliness >= 0.45) {
          O.splinters.forEach(function (sp) { if (sp.zone === zid && sp.active) sp.active = false; });
        }
      });

      O.order.forEach(function (fid) {
        var F = O.factions[fid], Z = O.zones[F.zone], ord = Z ? Z.orderliness : 0.4;
        /* Pacified heartland (>= 0.80): sweep sub-camps and force dormant */
        if (ord >= 0.80) {
          F.subCamps.forEach(function (c) { c.active = false; });
          if (F.stage !== 'dormant') { F.stage = 'dormant'; F.hq.pop = 0; O.events.push({ m: wkMin, kind: 'outlaw_pacified', faction: F.id }); }
          return;
        }
        /* Stage 1: Emergence (dormant -> foothold when orderliness < 0.55) */
        if (F.stage === 'dormant' && ord < 0.55) {
          if (hUnit(O.seed, F.id, wk, 11) < (0.55 - ord) * 1.8) {
            F.stage = 'foothold'; F.hq.pop = 40; F.boss.alive = true; F.boss.captured = false;
            spawnSubCamp(O, F, wkMin);
            O.events.push({ m: wkMin, kind: 'outlaw_emerged', faction: F.id, zone: F.zone });
          }
          return;
        }
        /* Stage 5: Succession / Migration after shattered cooldown */
        if (F.stage === 'shattered' && F.shatteredUntil != null && wkMin >= F.shatteredUntil) {
          if (ord >= 0.60) {
            F.stage = 'dormant'; F.shatteredUntil = null;
          } else {
            F.successionCount++;
            var ep = BOSS_EPITHETS[(F.successionCount - 1) % BOSS_EPITHETS.length];
            F.boss = {
              id: F.id + '.boss.' + F.successionCount,
              name: F.boss.title + ' (' + ep + ')',
              title: F.boss.title,
              alive: true, captured: false,
              generation: F.successionCount,
              grudge: F.boss.felledBy || null
            };
            F.stage = ord < 0.50 ? 'active' : 'foothold';
            F.hq.pop = F.stage === 'active' ? 70 : 38;
            F.shatteredUntil = null;
            spawnSubCamp(O, F, wkMin);
            O.events.push({ m: wkMin, kind: 'outlaw_succession', faction: F.id, boss: F.boss.name, grudge: F.boss.grudge });
          }
          return;
        }
        /* Stage 2 & 3: Active / Foothold budding & replacing pruned sub-camps after safe window expires */
        if (F.stage === 'foothold' && ord < 0.50) { F.stage = 'active'; F.hq.pop = Math.max(F.hq.pop, 75); }
        if (F.stage === 'active' || F.stage === 'foothold') {
          var liveSubs = F.subCamps.filter(function (c) { return c.active; });
          var maxSubs = maxSubsForOrder(ord);
          while (liveSubs.length > maxSubs) { liveSubs.pop().active = false; }
          if (liveSubs.length < maxSubs && (cacheTotal(F) >= F.budCap || hUnit(O.seed, F.id, wk, 31) < (1 - ord) * 0.45)) {
            spawnSubCamp(O, F, wkMin);
          }
        }
      });
    }
  };

  /* Player / Actor Stance, Safe-Conduct Passes, 75% Black-Market Fence & Letters of Marque (Rulings #91 & #93) */
  SIM.outlawStance = function (factionId, who, nextStance) {
    var O = SIM.OUTLAWS; if (!O || !O.factions[factionId]) return 'hostile';
    var F = O.factions[factionId], k = who || 'player';
    if (nextStance != null) {
      if (STANCES.indexOf(nextStance) < 0) throw new Error('SIM.outlawStance: unknown stance ' + nextStance);
      F.stances[k] = nextStance;
      /* Ideological alliance (`sworn_ally`) with an outlaw gang automatically posts a Tier 3 warrant from rival polities! */
      if (nextStance === 'sworn_ally' && SIM.BOUNTY && F.rivalPolities.length) {
        F.rivalPolities.forEach(function (pol) {
          SIM.bountyPost({
            id: 'warrant.ally.' + F.id + '.' + pol + '.' + k,
            target: k, polity: pol, tier: 3, amount: 800,
            sanctuaries: F.allyPolities.slice(),
            reason: 'sworn alliance with ' + F.name
          });
        });
      }
    }
    return F.stances[k] || 'hostile';
  };

  SIM.outlawExempt = function (factionId, who) {
    var st = SIM.outlawStance(factionId, who || 'player');
    return st === 'pass_holder' || st === 'associate' || st === 'sworn_ally';
  };

  /* Black-market fence at 75% valuation (requires at least `associate` or `pass_holder` when `strict` is set) */
  SIM.outlawFence = function (o) {
    var O = SIM.OUTLAWS; if (!O || !o || !O.factions[o.faction]) return null;
    var F = O.factions[o.faction], st = SIM.outlawStance(F.id, o.seller || 'player');
    if (STANCES.indexOf(st) < STANCES.indexOf('associate')) return { ok: false, why: 'requires associate stance with ' + F.name };
    var rate = D(o.rate, 0.75), gross = Math.max(0, Math.floor(D(o.baseValue, 100) * rate)), paid = 0;
    if (SIM.MONEY && o.fenceAcct && o.sellerAcct && gross > 0) {
      paid = SIM.pay(o.fenceAcct, o.sellerAcct, gross, 'outlaw fence ' + F.id, false);
    } else {
      paid = gross;
    }
    SIM.outlawDeposit(F.id, o.goods || {}, SIM.minute ? SIM.minute() : 0);
    return { ok: true, faction: F.id, rate: rate, value: gross, paid: paid };
  };

  /* Letter of Marque (`80%` privateer share, `20%` Crown fifth; doubles enemy pirate bounty) */
  SIM.issueMarque = function (o) {
    var O = SIM.OUTLAWS; if (!O || !o || !o.holder || !o.issuerPolity || !o.targetPolity) throw new Error('SIM.issueMarque: holder, issuerPolity and targetPolity required');
    var id = o.id || ('marque.' + o.issuerPolity + '.' + o.holder + '.' + o.targetPolity);
    var M = { id: id, holder: o.holder, issuerPolity: o.issuerPolity, targetPolity: o.targetPolity, holderShare: 0.80, crownShare: 0.20, prizes: 0, crownPaid: 0 };
    O.marques[id] = M;
    if (SIM.BOUNTY) {
      var existing = SIM.BOUNTY.order.map(function (wid) { return SIM.BOUNTY.warrants[wid]; }).find(function (w) { return w.target === o.holder && w.polity === o.targetPolity && w.status === 'open'; });
      if (existing) existing.amount *= 2;
      else SIM.bountyPost({ id: 'warrant.marque.' + o.targetPolity + '.' + o.holder, target: o.holder, polity: o.targetPolity, tier: 3, amount: D(o.enemyBounty, 1000), sanctuaries: [o.issuerPolity], reason: 'privateering under ' + o.issuerPolity + ' letter of marque' });
    }
    return M;
  };

  SIM.adjudicatePrize = function (marqueId, grossValue, crownAcct, holderAcct) {
    var O = SIM.OUTLAWS, M = O && O.marques[marqueId]; if (!M) return null;
    var crown = Math.floor(grossValue * M.crownShare), keep = grossValue - crown;
    if (SIM.MONEY && crownAcct && holderAcct && crown > 0) SIM.pay(holderAcct, crownAcct, crown, 'crown fifth ' + marqueId, false);
    M.prizes++; M.crownPaid += crown;
    return { holderGets: keep, crownFifth: crown };
  };

  SIM.outlawsReport = function () {
    var O = SIM.OUTLAWS; if (!O) return null;
    var zones = {}, facs = {};
    Object.keys(O.zones).sort().forEach(function (k) {
      var z = O.zones[k];
      zones[k] = { orderliness: z.orderliness, conquered: z.conquered, splinters: O.splinters.filter(function (s) { return s.zone === k && s.active; }).length };
    });
    O.order.forEach(function (k) {
      var f = O.factions[k];
      facs[k] = {
        name: f.name, kind: f.kind, zone: f.zone, stage: f.stage,
        boss: f.boss.name, bossAlive: f.boss.alive, captured: f.boss.captured,
        subCamps: f.subCamps.filter(function (c) { return c.active; }).length,
        cache: Object.assign({}, f.cache), successionCount: f.successionCount
      };
    });
    return { zones: zones, factions: facs, activeSplinters: O.splinters.filter(function (s) { return s.active; }).length, marques: Object.keys(O.marques).length };
  };

  /* ================================================================= 2. SIM.bounty */
  SIM.BOUNTY = null;

  SIM.bounty = function (cfg) {
    cfg = cfg || {};
    var B = {
      seed: D(cfg.seed, 20261123),
      deadShare: D(cfg.deadShare, 0.55),
      feralDeadShare: D(cfg.feralDeadShare, 1.0),
      warrants: {},
      order: [],
      jailedBosses: {},
      manhunters: (cfg.manhunters || []).map(function (m, i) {
        return { id: m.id || ('manhunter.' + (i + 1)), name: m.name || ('Thief-Taker Posse #' + (i + 1)), zone: m.zone || null, polity: m.polity || null, strength: D(m.strength, 8), captures: 0 };
      }),
      events: []
    };
    (cfg.warrants || []).forEach(function (w) { SIM.bountyPost(w, B); });
    SIM.BOUNTY = B;
    return B;
  };

  SIM.bountyPost = function (w, B0) {
    var B = B0 || SIM.BOUNTY; if (!B) throw new Error('SIM.bountyPost: call SIM.bounty first');
    if (!w || !w.id || !w.target) throw new Error('SIM.bountyPost: id and target required');
    var tier = clamp(D(w.tier, 1), 1, 4);
    var W = {
      id: w.id,
      target: w.target,
      targetKind: w.targetKind || 'outlaw', /* 'outlaw' | 'stalker' | 'feral' | 'political' */
      outlawFaction: w.outlawFaction || null,
      polity: w.polity || 'frontier',
      issuerSettlement: w.issuerSettlement || null,
      issuerAcct: w.issuerAcct || (w.issuerSettlement ? 'treasury:' + w.issuerSettlement : null),
      tier: tier,
      amount: Math.max(0, Math.floor(D(w.amount, tier === 1 ? 40 : tier === 2 ? 200 : tier === 3 ? 1000 : 2000))),
      trophyGood: w.trophyGood || null, /* physical proof/salvage item exchanged at a high standing price (e.g. stalker_guns, stalker_blades) */
      goodsReward: w.goodsReward ? Object.assign({}, w.goodsReward) : null, /* conserved physical exchange payout from garrison stores */
      standing: !!w.standing, /* true for standing bounties / exchange prices */
      sanctuaries: (w.sanctuaries || []).slice(),
      reason: w.reason || 'highway robbery',
      status: 'open',
      claims: 0,
      trophiesReceived: 0,
      paidCoin: 0,
      paidGoods: {}
    };
    B.warrants[W.id] = W;
    if (B.order.indexOf(W.id) < 0) B.order.push(W.id);
    return W;
  };

  /* Jurisdictional check: hunted in `polity` vs welcomed in `sanctuaries` (Tier 4 relativity) */
  SIM.bountyWantedAt = function (target, polity) {
    var B = SIM.BOUNTY; if (!B) return { wanted: false, sanctuary: false, warrants: [] };
    var hits = [], sanc = false;
    B.order.forEach(function (id) {
      var W = B.warrants[id];
      if (W.status !== 'open' || W.target !== target) return;
      if (W.sanctuaries.indexOf(polity) >= 0) sanc = true;
      if (W.polity === polity) hits.push(W);
    });
    return { wanted: hits.length > 0, sanctuary: sanc && hits.length === 0, warrants: hits };
  };

  /* Turn in a warrant:
     - `mode`: 'live' (1.0x, jails boss 30-90 days, runs 1 deterministic road-rescue ambush if surviving sub-camps exist!)
               or 'dead' (0.55x for human outlaws, 1.0x for 'stalker'/'feral'!).
     - If `W.trophyGood` is set (e.g. Ranger HQ's high exchange price for `stalker_guns` and `stalker_blades`), the claimant
       must physically turn in `W.trophyGood`, which moves into `issuerSettlement`'s stores before the exchange price is paid.
     - Strictly conserves coin (`SIM.pay` from issuerAcct -> claimantAcct) and physical goods (`SIM.economyTake` -> `SIM.economyLand`). */
  SIM.bountyClaim = function (o) {
    var B = SIM.BOUNTY; if (!B || !o || !B.warrants[o.id]) return { ok: false, why: 'unknown warrant' };
    var W = B.warrants[o.id], m = D(o.minute, SIM.minute ? SIM.minute() : 0);
    if (W.status !== 'open') return { ok: false, why: 'warrant is ' + W.status };
    var live = o.mode === 'live';
    var isFeral = W.targetKind === 'stalker' || W.targetKind === 'feral';
    var mult = live ? 1.0 : (isFeral ? B.feralDeadShare : B.deadShare);
    var count = Math.max(1, Math.floor(D(o.count, 1)));

    /* Live Boss escort: surviving sub-camps attempt 1 deterministic road rescue ambush! */
    var rescue = { attempted: false, freed: false };
    if (live && W.outlawFaction && SIM.OUTLAWS && SIM.OUTLAWS.factions[W.outlawFaction]) {
      var OF = SIM.OUTLAWS.factions[W.outlawFaction];
      var subs = OF.subCamps.filter(function (c) { return c.active; });
      if (subs.length > 0) {
        rescue.attempted = true;
        var guardStr = D(o.escortStrength, 10), raidStr = subs.length * 3;
        var roll = hUnit(B.seed, W.id, m, subs.length);
        if (raidStr * (0.75 + 0.5 * roll) > guardStr * 1.35) {
          rescue.freed = true;
          B.events.push({ m: m, kind: 'bounty_rescue_freed', warrant: W.id, faction: OF.id, subs: subs.length });
          return { ok: false, why: 'target freed on the road by sub-camp rescue ambush', rescue: rescue };
        }
      }
    }

    /* Physical trophy / salvaged weapon exchange (`W.trophyGood`: e.g. Stalker pneumatic guns & Ancient-alloy blades) */
    var trophiesExchanged = 0;
    if (W.trophyGood) {
      if (o.trophiesDelivered === 0) {
        return { ok: false, why: 'no ' + W.trophyGood + ' delivered for exchange' };
      }
      if (SIM.withEcon && W.issuerSettlement && o.claimantSettlement && o.claimantSettlement !== W.issuerSettlement) {
        var gotT = 0;
        SIM.withEcon(o.claimantSettlement, function () {
          gotT = SIM.economyTake(W.trophyGood, count);
          if (gotT > 0) SIM.economyBook('exported', W.trophyGood, gotT);
        });
        if (gotT <= 0) return { ok: false, why: 'no ' + W.trophyGood + ' in stock to exchange' };
        SIM.withEcon(W.issuerSettlement, function () {
          if (SIM.economyLand(W.trophyGood, gotT, null) != null) SIM.economyBook('imported', W.trophyGood, gotT);
        });
        count = gotT;
        trophiesExchanged = gotT;
      } else if (SIM.withEcon && W.issuerSettlement && o.fromField) {
        SIM.withEcon(W.issuerSettlement, function () {
          if (SIM.economyLand(W.trophyGood, count, null) != null) SIM.economyBook('imported', W.trophyGood, count);
        });
        trophiesExchanged = count;
      } else {
        trophiesExchanged = Math.max(0, Math.floor(D(o.trophiesDelivered, count)));
        if (trophiesExchanged <= 0) return { ok: false, why: 'no ' + W.trophyGood + ' delivered for exchange' };
        count = trophiesExchanged;
      }
    }

    /* Conserved coin payout */
    var wantCoin = Math.floor(W.amount * count * mult), paidCoin = 0;
    if (wantCoin > 0 && SIM.MONEY && W.issuerAcct && o.claimantAcct && SIM.acct(W.issuerAcct) && SIM.acct(o.claimantAcct)) {
      paidCoin = SIM.pay(W.issuerAcct, o.claimantAcct, wantCoin, 'bounty ' + W.id, false);
    } else if (!SIM.MONEY) {
      paidCoin = wantCoin;
    }

    /* Conserved physical goods payout (e.g. Ranger HQ paying supplies/grain/arms from its garrison stores) */
    var paidGoods = {};
    if (W.goodsReward && W.issuerSettlement && o.claimantSettlement && SIM.withEcon) {
      SIM.withEcon(W.issuerSettlement, function () {
        Object.keys(W.goodsReward).sort().forEach(function (g) {
          var wantG = Math.floor(W.goodsReward[g] * count * mult);
          if (wantG <= 0) return;
          var gotG = SIM.economyTake(g, wantG);
          if (gotG > 0) { SIM.economyBook('exported', g, gotG); paidGoods[g] = gotG; }
        });
      });
      SIM.withEcon(o.claimantSettlement, function () {
        Object.keys(paidGoods).sort().forEach(function (g) {
          if (SIM.economyLand(g, paidGoods[g], null) != null) SIM.economyBook('imported', g, paidGoods[g]);
        });
      });
    }

    W.claims += count;
    W.trophiesReceived += trophiesExchanged;
    W.paidCoin += paidCoin;
    Object.keys(paidGoods).forEach(function (g) { W.paidGoods[g] = (W.paidGoods[g] || 0) + paidGoods[g]; });
    if (!W.standing) W.status = live ? 'captured' : 'killed';

    /* Tier 3 Named Boss warrant decapitates the linked outlaw faction; live delivery jails the Boss for 30-90 days */
    var jailRec = null;
    if (W.outlawFaction && SIM.OUTLAWS && SIM.OUTLAWS.factions[W.outlawFaction] && W.tier >= 3) {
      SIM.outlawShatter(W.outlawFaction, o.claimant || 'bounty-hunter', live, m);
      if (live) {
        var jDays = 30 + Math.floor(hUnit(B.seed, W.id, m, 89) * 61);
        jailRec = { target: W.target, faction: W.outlawFaction, settlement: W.issuerSettlement || W.polity, since: m, until: m + jDays * 1440, days: jDays };
        B.jailedBosses[W.target] = jailRec;
      }
    }

    B.events.push({ m: m, kind: 'bounty_claimed', warrant: W.id, mode: live ? 'live' : 'dead', mult: mult, trophiesExchanged: trophiesExchanged, paidCoin: paidCoin, paidGoods: paidGoods, rescue: rescue });
    return { ok: true, warrant: W.id, mode: live ? 'live' : 'dead', mult: mult, trophyGood: W.trophyGood, trophiesExchanged: trophiesExchanged, wantCoin: wantCoin, paidCoin: paidCoin, paidGoods: paidGoods, rescue: rescue, jailed: jailRec };
  };

  /* Prison Break: frees a captured Boss if player stages a break or garrison standing drops below 0.35 */
  SIM.bountyPrisonBreak = function (o) {
    var B = SIM.BOUNTY; if (!B || !o || !B.jailedBosses[o.target]) return { ok: false, why: 'target not in jail' };
    var J = B.jailedBosses[o.target], m = D(o.minute, SIM.minute ? SIM.minute() : 0);
    var standing = D(o.garrisonStanding, 0.25);
    if (!o.byPlayer && standing >= 0.35) return { ok: false, why: 'garrison standing held the jail' };
    delete B.jailedBosses[o.target];
    if (J.faction && SIM.OUTLAWS && SIM.OUTLAWS.factions[J.faction]) {
      var F = SIM.OUTLAWS.factions[J.faction];
      F.stage = 'foothold'; F.boss.alive = true; F.boss.captured = false; F.hq.pop = 35; F.shatteredUntil = null;
      spawnSubCamp(SIM.OUTLAWS, F, m);
    }
    B.events.push({ m: m, kind: 'prison_break', target: o.target, faction: J.faction, by: o.byPlayer ? 'player' : 'gang' });
    return { ok: true, target: o.target, faction: J.faction };
  };

  /* Roaming Manhunter encounter check along a road/zone */
  SIM.bountyManhunterCheck = function (actorOrPlayer, polity, minute) {
    var B = SIM.BOUNTY; if (!B) return { challenged: false };
    var w = SIM.bountyWantedAt(actorOrPlayer, polity);
    if (!w.wanted) return { challenged: false, sanctuary: w.sanctuary };
    var posse = B.manhunters.find(function (mh) { return !mh.polity || mh.polity === polity; });
    if (!posse) return { challenged: false, wanted: true };
    var totalBounty = w.warrants.reduce(function (s, x) { return s + x.amount; }, 0);
    return { challenged: true, posse: posse.id, posseName: posse.name, strength: posse.strength, totalBounty: totalBounty, warrants: w.warrants.map(function (x) { return x.id; }) };
  };

  /* Player-readable bounty board report (never exposes hidden non-settlement sources) */
  SIM.bountyReport = function (polity) {
    var B = SIM.BOUNTY; if (!B) return null;
    var list = [];
    B.order.forEach(function (id) {
      var W = B.warrants[id];
      if (polity != null && W.polity !== polity) return;
      list.push({
        id: W.id, target: W.target, targetKind: W.targetKind, polity: W.polity,
        tier: W.tier, amount: W.amount, trophyGood: W.trophyGood, trophiesReceived: W.trophiesReceived,
        standing: W.standing, status: W.status,
        claims: W.claims, paidCoin: W.paidCoin, paidGoods: Object.assign({}, W.paidGoods),
        sanctuaries: W.sanctuaries.slice(), reason: W.reason
      });
    });
    return { warrants: list, jailedBosses: Object.keys(B.jailedBosses), manhunters: B.manhunters.length };
  };

  SIM.stepHooks = SIM.stepHooks || [];
  SIM.stepHooks.push(function (minute) { if (SIM.OUTLAWS) SIM.outlawsStep(minute); });
})(typeof window !== 'undefined' ? window : globalThis);
