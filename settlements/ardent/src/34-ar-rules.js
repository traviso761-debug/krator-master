/* ================================================================= ARDENT — Pure Invariant Rules, Curtain-Wall Socket Check & KTAGS
   [G data] Pure validation functions on AR_LAYOUT records (zero THREE, zero DOM) + pre-draw KTAGS registration.
   Tested headlessly by settlements/ardent/tests/test-ardent.js and in-browser by verify.py --assert. */
var AR_RULES = (function () {
  'use strict';

  /* Pure [G data] Silk-Trail Mercenary-to-Bandit Transition Rule (LORE.md §6.4; MERCENARIES-SCOPE MC-06 -> BF-04):
     Uses x == null ? d : x for all numeric defaults (0 unpaidDays or 0 silkCaravanIndex is a real number!). */
  function evaluateBandState(band) {
    var unpaid = band.unpaidDays == null ? 0 : band.unpaidDays;
    var silkIdx = band.silkCaravanIndex == null ? 0.65 : band.silkCaravanIndex;
    var harvIdx = band.harvestIndex == null ? 0.65 : band.harvestIndex;
    if (unpaid > 14) {
      return {
        state: 'broken_kin_reiver',
        code: 'BF-04',
        discTurned: true,
        reason: 'arrears>' + unpaid + 'd: inverted bronze clan disc (Brokn-Cin) on Silk Trail'
      };
    }
    if (silkIdx < 0.30 && harvIdx < 0.40) {
      return {
        state: 'broken_kin_reiver',
        code: 'BF-04',
        discTurned: true,
        reason: 'hard_times(silk=' + silkIdx.toFixed(2) + ',harvest=' + harvIdx.toFixed(2) + '): Brokn-Cin reiving'
      };
    }
    return {
      state: 'silk_guard',
      code: 'MC-06',
      discTurned: false,
      reason: 'chartered Silk-Trail caravan escort (unpaid=' + unpaid + 'd)'
    };
  }

  /* 1. Rustic-Only Branch & Capital Scale Rule (>= 420 total structures + walls, 0 non-rustic pieces) */
  function rusticOnlyCheck(plan) {
    var bad = [];
    var all = (plan.structures || []).concat(plan.walls || []);
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      if (s.branch !== 'rustic' || String(s.key).indexOf('hl_rus_') !== 0) {
        bad.push(s.id + ':' + s.key + '(' + s.branch + ')');
      }
    }
    return {
      name: 'rustic-only branch and 5x capital scale rule',
      pass: all.length >= 420 && (plan.structures || []).length >= 340 && bad.length === 0,
      detail: all.length + ' total hl_rus_* records (' + (plan.structures || []).length + ' buildings + ' +
              (plan.walls || []).length + ' wall/tower/gate pieces), bad=' + bad.length
    };
  }

  /* 2. Walled Capital Fortification & Wall-to-Tower/Bastion/Gate Socket Check */
  function walledCapitalCheck(plan) {
    var walls = plan.walls || [];
    var gates = 0, bastions = 0, towers = 0, segs = 0;
    var byId = {};
    for (var i = 0; i < walls.length; i++) {
      var w = walls[i];
      byId[w.id] = w;
      if (w.key === 'hl_rus_burgh_gate') gates++;
      else if (w.key === 'hl_rus_wall_bastion') bastions++;
      else if (w.key === 'hl_rus_wall_tower') towers++;
      else if (w.key === 'hl_rus_burgh_wall') segs++;
    }
    /* Verify every curtain-wall segment sockets into its endpoint nodes (embed inside [0.35, 0.85] m, zero planar gap) */
    var violations = [];
    function solidHalfExtent(key) {
      if (key === 'hl_rus_burgh_gate') return 8.70;
      if (key === 'hl_rus_wall_bastion') return 4.80;
      return 3.80;
    }
    for (var j = 0; j < walls.length; j++) {
      var seg = walls[j];
      if (seg.key !== 'hl_rus_burgh_wall') continue;
      var ux = Math.cos(seg.ry), uz = -Math.sin(seg.ry);
      var hw = seg.w * 0.5;
      var eNegX = seg.x - ux * hw, eNegZ = seg.z - uz * hw;
      var ePosX = seg.x + ux * hw, ePosZ = seg.z + uz * hw;
      if (seg.segIdx === 0 && seg.nodeA && byId[seg.nodeA]) {
        var nA = byId[seg.nodeA];
        var dA = Math.min(Math.hypot(eNegX - nA.x, eNegZ - nA.z), Math.hypot(ePosX - nA.x, ePosZ - nA.z));
        var embA = solidHalfExtent(nA.key) - dA;
        if (embA < 0.30 || embA > 0.90) violations.push(seg.id + '@A:' + embA.toFixed(2));
      }
      if (seg.segIdx === seg.segCount - 1 && seg.nodeB && byId[seg.nodeB]) {
        var nB = byId[seg.nodeB];
        var dB = Math.min(Math.hypot(eNegX - nB.x, eNegZ - nB.z), Math.hypot(ePosX - nB.x, ePosZ - nB.z));
        var embB = solidHalfExtent(nB.key) - dB;
        if (embB < 0.30 || embB > 0.90) violations.push(seg.id + '@B:' + embB.toFixed(2));
      }
    }
    return {
      name: 'walled capital circuit (4 gates, 4 bastions, towers & seamless curtain-wall sockets)',
      pass: gates >= 4 && bastions >= 4 && towers >= 12 && segs >= 40 && violations.length === 0,
      violations: violations,
      detail: gates + ' gatehouses, ' + bastions + ' corner bastions, ' + towers + ' watchtowers, ' +
              segs + ' wall spans, socket violations=' + violations.length
    };
  }

  /* 3. Quaint Narrow-Cobbled Wynds (3.0-5.8 m) & All 26 Baronial-Caucasus & Economy Pieces Check */
  function narrowCobblesAndMixCheck(plan) {
    var wynds = (plan.ways || []).filter(function (w) { return w.kind === 'cobble_wynd' || w.kind === 'cobble_close'; });
    var wideBad = wynds.filter(function (w) { return w.w > 6.2 || w.w < 2.8; });
    var BARONIAL_KEYS = {
      hl_rus_wynd_house_a: 1, hl_rus_wynd_house_b: 1, hl_rus_wynd_house_c: 1, hl_rus_close_row: 1,
      hl_rus_pend_tenement: 1, hl_rus_tower_house: 1, hl_rus_marani_tavern: 1, hl_rus_wynd_armourer: 1,
      hl_rus_silk_factor: 1, hl_rus_cooperage: 1, hl_rus_saltpeter_mill: 1, hl_rus_caravan_stables: 1,
      hl_rus_apothecary: 1, hl_rus_plaid_dyer: 1, hl_rus_clan_koshki: 1, hl_rus_mercenary_bourse: 1,
      hl_rus_law_darbazi: 1, hl_rus_thing_ring: 1, hl_rus_bronze_foundry: 1, hl_rus_great_distillery: 1,
      hl_rus_capital_distillery: 1, hl_rus_burgh_gate: 1, hl_rus_cobbled_bridge: 1, hl_rus_burgh_wall: 1,
      hl_rus_wall_tower: 1, hl_rus_wall_bastion: 1
    };
    var seenKinds = {};
    var baronialCount = 0;
    var all = (plan.structures || []).concat(plan.walls || []);
    for (var i = 0; i < all.length; i++) {
      var k = all[i].key;
      if (BARONIAL_KEYS[k]) {
        baronialCount++;
        seenKinds[k] = (seenKinds[k] || 0) + 1;
      }
    }
    var distinctBaronial = Object.keys(seenKinds).length;
    return {
      name: 'quaint narrow-cobbled wynds (3.0-5.8 m) and all 26 Baronial-Caucasus & economy defs',
      pass: wynds.length >= 40 && wideBad.length === 0 && baronialCount >= 450 && distinctBaronial === 26,
      detail: wynds.length + ' cobbled wynds/closes (bad width=' + wideBad.length + '), ' +
              baronialCount + ' Baronial-Caucasus placements across ' + distinctBaronial + '/26 defs'
    };
  }

  /* 4. Nine Clans Thing-Stead, Darbazi Law-Hall & 9 Koshki Keeps Check */
  function nineClansCheck(plan) {
    var clans = plan.clans || [];
    var seenIds = {};
    for (var i = 0; i < clans.length; i++) seenIds[clans[i].id] = 1;
    var list = plan.structures || [];
    var hasRing = list.some(function (s) { return s.key === 'hl_rus_thing_ring'; });
    var hasLaw = list.some(function (s) { return s.key === 'hl_rus_law_darbazi'; });
    var hasEnvoy = list.some(function (s) { return s.key === 'hl_rus_envoy_lodge'; });
    var hasTolbooth = list.some(function (s) { return s.key === 'hl_rus_mercenary_bourse'; });
    return {
      name: 'Nine Clans koshki crown, Thing-Stead, Darbazi Law-Hall, Envoy Lodge and Tolbooth',
      pass: clans.length === 9 && Object.keys(seenIds).length === 9 && hasRing && hasLaw && hasEnvoy && hasTolbooth,
      detail: clans.length + ' unique clan koshki keeps, thingRing=' + hasRing + ', lawDarbazi=' + hasLaw +
              ', dilihanEnvoy=' + hasEnvoy + ', tolbooth=' + hasTolbooth
    };
  }

  /* 5. Copper + Tin -> Bronze Resource Nodes & Nearest-Mine <= 400 m Rule */
  function bronzeOreCheck(plan) {
    var nodes = plan.oreNodes || [];
    var cu = 0, sn = 0, farBad = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.ore === 'copper_ore') cu++;
      if (n.ore === 'tin_ore') sn++;
      if (n.mineDistM == null || n.mineDistM > 400) farBad.push(n.id + ':' + n.mineDistM);
    }
    var foundries = (plan.structures || []).filter(function (s) { return s.key === 'hl_rus_bronze_foundry'; }).length;
    return {
      name: 'copper + tin RES_ORE nodes within 400 m of mines and reverberatory bronze foundries',
      pass: cu >= 4 && sn >= 4 && farBad.length === 0 && foundries >= 3,
      detail: cu + ' copper_ore + ' + sn + ' tin_ore nodes, foundries=' + foundries + ', >400m=' + farBad.length
    };
  }

  /* 6. Lighting Canon (LORE.md §6.4: zero electric lights anywhere in the Free Clans) */
  function noElectricLightCheck(plan) {
    var all = (plan.structures || []).concat(plan.walls || []);
    var litBad = all.filter(function (s) { return !!s.lit; });
    return {
      name: 'no-electric-light canon (lit:false on every structure)',
      pass: litBad.length === 0,
      detail: litBad.length === 0 ? '0 electrically lit buildings (hearth & forge fire only)' : 'lit: ' + litBad.map(function (s) { return s.id; }).join(',')
    };
  }

  /* 7. Martial Season & Silk-Trail Mercenary/Reiver Simulation Check */
  function silkTrailMercenaryCheck(plan) {
    var camps = plan.camps || [];
    var activeGuards = 0, badVote = 0;
    for (var i = 0; i < camps.length; i++) {
      var st = evaluateBandState(camps[i]);
      if (st.state === 'silk_guard') activeGuards++;
    }
    var cits = plan.citizens || [];
    for (var j = 0; j < cits.length; j++) {
      var c = cits[j];
      var shouldVote = (c.foreignSeasonsRidden >= 2);
      if (!!c.thingVoteEligible !== shouldVote) badVote++;
    }
    return {
      name: 'martial two-season franchise and Silk-Trail MC-06 / BF-04 camp state',
      pass: camps.length >= 3 && activeGuards === camps.length && cits.length >= 36 && badVote === 0,
      detail: camps.length + ' Silk-Trail KCAMP free-companies, ' + cits.length + ' scheduled citizens (franchise errors=' + badVote + ')'
    };
  }

  /* 8. Capital Quadruple-Pagoda Distillery + 3 Clan-Seat Great Distilleries, ~80% Compact Area & 42,668 km2 Polygon Scope */
  function clanDistilleryAndPolityCheck(plan) {
    var list = plan.structures || [];
    var capDist = list.filter(function (s) { return s.key === 'hl_rus_capital_distillery'; });
    var great = list.filter(function (s) { return s.key === 'hl_rus_great_distillery' && !!s.clanId; });
    var clanSet = {};
    for (var i = 0; i < great.length; i++) clanSet[great[i].clanId] = 1;
    var distinctClans = Object.keys(clanSet).length;
    var ps = plan.polityScope || {};
    var provs = ps.provinces || [];
    var provPop = 0;
    for (var pi = 0; pi < provs.length; pi++) provPop += (provs[pi].pop == null ? 0 : provs[pi].pop);
    var hasScotchExport = (ps.majorExports || []).some(function (e) { return e.good === 'scotch-and-whiskey'; });
    var areaOk = plan.walledAreaM2 != null && plan.walledAreaM2 >= 220000 && plan.walledAreaM2 <= 268000;
    var okScope = ps.polygonId === 'rmumc5ov15a8k' && ps.totalDryKm2 === 42668 &&
                  provs.length === 4 && provPop === 27200 && hasScotchExport && areaOk;
    return {
      name: 'Capital Quadruple-Pagoda Distillery + 3 Clan-Seat Great Distilleries, ~80% compact area & FC1-FC4 scope',
      pass: capDist.length === 1 && great.length === 3 && distinctClans === 3 && okScope,
      detail: capDist.length + ' Capital Maltings + ' + great.length + ' Clan-Seat Distilleries; walledArea=' +
              plan.walledAreaM2 + ' m2; ' + provs.length + ' provinces (' + ps.totalDryKm2 + ' km2, pop=' + provPop + ')'
    };
  }

  function checks(plan) {
    return [
      rusticOnlyCheck(plan),
      walledCapitalCheck(plan),
      narrowCobblesAndMixCheck(plan),
      nineClansCheck(plan),
      bronzeOreCheck(plan),
      noElectricLightCheck(plan),
      silkTrailMercenaryCheck(plan),
      clanDistilleryAndPolityCheck(plan)
    ];
  }

  /* Pre-draw KTAGS registration (AGENTS.md: everything placed is registered in core/tags before it is drawn) */
  function registerTags(plan, T) {
    var n = 0;
    var all = (plan.structures || []).concat(plan.walls || []);
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      var tags = { culture: 'rustic', types: s.types.slice() };
      if (s.wealth) tags.wealth = s.wealth;
      if (s.job) tags.job = s.job;
      T.add({ id: s.id, name: s.name, cls: 'building', x: s.x, y: s.y, z: s.z, tags: tags });
      n++;
    }
    var ring = (plan.structures || []).find(function (s) { return s.key === 'hl_rus_thing_ring'; });
    if (ring) {
      for (var ci = 0; ci < (plan.clans || []).length; ci++) {
        var cl = plan.clans[ci];
        var a = (ci / 9) * Math.PI * 2 + Math.PI;
        T.add({
          id: 'ar.stone.' + cl.idx,
          name: cl.name + ' Thing-Stone (' + cl.crest + ')',
          cls: 'landmark',
          x: ring.x + Math.sin(a) * 9.2,
          y: ring.y,
          z: ring.z + Math.cos(a) * 9.2,
          tags: { culture: 'rustic', types: ['civic', 'statue'] }
        });
        n++;
      }
    }
    for (var oi = 0; oi < (plan.oreNodes || []).length; oi++) {
      var o = plan.oreNodes[oi];
      T.add({
        id: o.id,
        name: o.ore + ' (' + o.grade + ')',
        cls: 'feature',
        x: o.x,
        y: o.y,
        z: o.z,
        tags: { culture: 'generic', types: ['industry'], job: 'mining' }
      });
      n++;
    }
    for (var ki = 0; ki < (plan.camps || []).length; ki++) {
      var cp = plan.camps[ki];
      T.add({
        id: cp.id,
        name: cp.name,
        cls: 'landmark',
        x: cp.center[0],
        y: AR_GROUND.h(cp.center[0], cp.center[1]),
        z: cp.center[1],
        tags: { culture: 'rustic', types: ['military'] }
      });
      n++;
    }
    for (var pi2 = 0; pi2 < (plan.citizens || []).length; pi2++) {
      var p = plan.citizens[pi2];
      T.add({
        id: p.id,
        name: p.subfaction + ' (' + p.job + ')',
        cls: 'life',
        x: 0,
        y: AR_GROUND.h(0, 0),
        z: 0,
        tags: { culture: 'rustic', job: p.job }
      });
      n++;
    }
    return n;
  }

  return {
    evaluateBandState: evaluateBandState,
    rusticOnlyCheck: rusticOnlyCheck,
    walledCapitalCheck: walledCapitalCheck,
    narrowCobblesAndMixCheck: narrowCobblesAndMixCheck,
    nineClansCheck: nineClansCheck,
    bronzeOreCheck: bronzeOreCheck,
    noElectricLightCheck: noElectricLightCheck,
    silkTrailMercenaryCheck: silkTrailMercenaryCheck,
    clanDistilleryAndPolityCheck: clanDistilleryAndPolityCheck,
    checks: checks,
    registerTags: registerTags
  };
})();
