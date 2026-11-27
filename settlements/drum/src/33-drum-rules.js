// ================================================================= DRUM — 33: Layout Verification Rules ([G data])
// Pure geometry, sociology, connectivity, and census invariants for Drum. Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});

  function bfs(links, startNode, allowEdge) {
    var adj = {};
    for (var i = 0; i < links.length; i++) {
      var e = links[i];
      var u = e[0], v = e[1], meta = e[2] || {};
      if (allowEdge && !allowEdge(meta, u, v)) continue;
      if (!adj[u]) adj[u] = [];
      if (!adj[v]) adj[v] = [];
      adj[u].push(v);
      adj[v].push(u);
    }
    var seen = {};
    if (!adj[startNode]) return seen;
    var q = [startNode];
    seen[startNode] = true;
    for (var qi = 0; qi < q.length; qi++) {
      var cur = q[qi];
      var nb = adj[cur] || [];
      for (var ni = 0; ni < nb.length; ni++) {
        if (!seen[nb[ni]]) {
          seen[nb[ni]] = true;
          q.push(nb[ni]);
        }
      }
    }
    return seen;
  }

  function uniqueIds(plan) {
    var seen = {};
    function checkList(arr, label) {
      for (var i = 0; i < arr.length; i++) {
        var id = arr[i] && arr[i].id;
        if (!id || seen[id]) return { pass: false, detail: 'duplicate or missing id in ' + label + ': ' + id };
        seen[id] = true;
      }
      return null;
    }
    var err = checkList(plan.landmarks, 'landmarks')
      || checkList(plan.gates, 'gates')
      || checkList(plan.roads, 'roads')
      || checkList(plan.buildings, 'buildings')
      || checkList(plan.arcology.portals, 'portals')
      || checkList(plan.arcology.levels, 'arcology.levels');
    if (err) return err;
    for (var lv = 0; lv < plan.arcology.levels.length; lv++) {
      var e2 = checkList(plan.arcology.levels[lv].sectors, 'arcology.sectors');
      if (e2) return e2;
    }
    return { pass: true, detail: Object.keys(seen).length + ' unique IDs' };
  }

  function noObbOverlaps(plan) {
    var items = [];
    for (var i = 0; i < plan.landmarks.length; i++) {
      if (plan.landmarks[i].r > 0) items.push(plan.landmarks[i]);
    }
    for (var g = 0; g < plan.gates.length; g++) items.push(plan.gates[g]);
    for (var b = 0; b < plan.buildings.length; b++) items.push(plan.buildings[b]);

    var w1R = plan.site.innerWallR == null ? 402 : plan.site.innerWallR;
    var w2R = plan.site.outerPalisadeR == null ? 636 : plan.site.outerPalisadeR;
    for (var k = 0; k < plan.buildings.length; k++) {
      var bd = plan.buildings[k];
      var rad = Math.hypot(bd.x, bd.z);
      var halfDiag = 0.5 * Math.hypot(bd.w, bd.d);
      if (rad - halfDiag < plan.arcology.RPOD - 0.5) {
        return { pass: false, detail: bd.id + ' intrudes into arcology podium (r=' + rad.toFixed(1) + ')' };
      }
      if (DRUM.inQuarryZone(rad, bd.deg)) {
        return { pass: false, detail: bd.id + ' sits inside ENE collapse quarry' };
      }
      if (DRUM.inRiverCorridor(bd.x, bd.z, 2)) {
        return { pass: false, detail: bd.id + ' intrudes into Drum River channel' };
      }
      if (Math.abs(rad - w1R) < 6.0 || Math.abs(rad - w2R) < 5.0) {
        return { pass: false, detail: bd.id + ' collides with wall curtain at r=' + rad.toFixed(1) };
      }
    }

    for (var a = 0; a < items.length; a++) {
      for (var c = a + 1; c < items.length; c++) {
        var ia = items[a], ic = items[c];
        var maxR = 0.5 * (Math.hypot(ia.w, ia.d) + Math.hypot(ic.w, ic.d));
        if (Math.abs(ia.x - ic.x) > maxR || Math.abs(ia.z - ic.z) > maxR) continue;
        if (DRUM.obbOverlap(ia, ic, 0.15)) {
          return { pass: false, detail: 'OBB overlap between ' + ia.id + ' and ' + ic.id };
        }
      }
    }
    return { pass: true, detail: '0 OBB overlaps across ' + items.length + ' structures' };
  }

  function arcologyProgramme(plan) {
    var arc = plan.arcology;
    if (!arc || arc.levelCount !== 15 || Math.abs(arc.YBASE - 66.0) > 1e-6) {
      return { pass: false, detail: 'expected 15 levels to YBASE=66m' };
    }
    if (arc.totalPop !== 5400) {
      return { pass: false, detail: 'expected arcology pop 5400, got ' + arc.totalPop };
    }
    for (var i = 0; i < arc.levels.length; i++) {
      if (arc.levels[i].ruinedBays < 2) {
        return { pass: false, detail: 'level ' + arc.levels[i].level + ' missing ruined ENE bays' };
      }
    }
    var hasMarket = false, hasWarehouse = false, hasMushroom = false;
    for (var s = 0; s < arc.simNodes.length; s++) {
      var role = arc.simNodes[s].role;
      if (role === 'salvage_bourse' || role === 'ancient_parts_exchange') hasMarket = true;
      if (role === 'bonded_warehouse' || role === 'bonded_alloy_vault') hasWarehouse = true;
      if (role === 'mushroom_vat_vault') hasMushroom = true;
    }
    if (arc.simNodes.length < 20 || !hasMarket || !hasWarehouse || !hasMushroom) {
      return { pass: false, detail: 'missing SIM trade/storage/fungiculture nodes in arcology' };
    }
    return { pass: true, detail: '15 levels (66m), 5400 pop, ' + arc.simNodes.length + ' SIM nodes' };
  }

  function populationSplit(plan) {
    var p = plan.pop;
    if (!p || p.arcology !== 5400 || p.outerTotal !== 8100 || p.total !== 13500) {
      return { pass: false, detail: 'expected 5400 + 8100 = 13500, got ' + JSON.stringify(p) };
    }
    var sumOuter = 0;
    for (var i = 0; i < plan.landmarks.length; i++) {
      if (plan.landmarks[i].id !== 'drum_arcology') sumOuter += plan.landmarks[i].pop;
    }
    for (var b = 0; b < plan.buildings.length; b++) sumOuter += plan.buildings[b].pop;
    if (sumOuter !== 8100) {
      return { pass: false, detail: 'outer building+landmark pop sum ' + sumOuter + ' !== 8100' };
    }
    return { pass: true, detail: '5400 (40% arcology) + 8100 (60% outer) = 13500' };
  }

  function architecturalMix(plan) {
    var w1R = plan.site.innerWallR == null ? 402 : plan.site.innerWallR;
    var counts = { 'sw-arcology': 0, 'voth-scrap': 0, 'post-apoc': 0 };
    var innerVoth = 0, innerPa = 0, outerVoth = 0, outerPa = 0;
    for (var i = 0; i < plan.buildings.length; i++) {
      var b = plan.buildings[i];
      counts[b.kit] = (counts[b.kit] == null ? 0 : counts[b.kit]) + 1;
      if (b.r < w1R) {
        if (b.kit === 'voth-scrap') innerVoth++;
        if (b.kit === 'post-apoc') innerPa++;
      }
      if (b.zone === 'outer_shanty') {
        if (b.kit === 'voth-scrap') outerVoth++;
        if (b.kit === 'post-apoc') outerPa++;
      }
    }
    var n = plan.buildings.length ? plan.buildings.length : 1;
    var ks = ['sw-arcology', 'voth-scrap', 'post-apoc'];
    for (var k = 0; k < ks.length; k++) {
      var share = counts[ks[k]] / n;
      if (share < 0.30 || share > 0.365) {
        return { pass: false, detail: ks[k] + ' share out of 1/3 band: ' + (share * 100).toFixed(1) + '%' };
      }
    }
    if (innerVoth <= innerPa) {
      return { pass: false, detail: 'inner ring must favour Scrap Voth over Post-Apoc' };
    }
    if (outerPa <= outerVoth) {
      return { pass: false, detail: 'outer shanty ring must favour Post-Apoc over Scrap Voth' };
    }
    return {
      pass: true,
      detail: 'SWA ' + counts['sw-arcology'] + ', ScrapVoth ' + counts['voth-scrap'] + ', PostApoc ' + counts['post-apoc']
    };
  }

  function twoWallsAndVehicles(plan) {
    var w1R = plan.site.innerWallR == null ? 402 : plan.site.innerWallR;
    var w2R = plan.site.outerPalisadeR == null ? 636 : plan.site.outerPalisadeR;
    if (!plan.walls || plan.walls.length !== 2) return { pass: false, detail: 'expected 2 walls' };
    var w1 = plan.walls[0], w2 = plan.walls[1];
    var g1 = 0, g2 = 0;
    for (var i = 0; i < plan.gates.length; i++) {
      if (plan.gates[i].wall === 'inner_wall_ancient') g1++;
      if (plan.gates[i].wall === 'outer_palisade_scrap') g2++;
    }
    if (w1.id !== 'inner_wall_ancient' || w1.r !== w1R || g1 !== 6) {
      return { pass: false, detail: 'invalid Ancient inner wall or gate count (' + g1 + ')' };
    }
    if (w2.id !== 'outer_palisade_scrap' || w2.r !== w2R || g2 !== 5) {
      return { pass: false, detail: 'invalid outer scrap palisade or gate count (' + g2 + ')' };
    }
    var pv = plan.palisadeVehicles || [];
    if (pv.length < 100) return { pass: false, detail: 'expected >= 100 ruined palisade vehicles, got ' + pv.length };
    for (var v = 0; v < pv.length; v++) {
      if (pv[v].deg >= 296 && pv[v].deg <= 344) {
        return { pass: false, detail: 'palisade vehicle placed across river flank at ' + pv[v].deg + ' deg' };
      }
      if (pv[v].state !== 'wreck' && pv[v].state !== 'burnt' && pv[v].state !== 'weathered') {
        return { pass: false, detail: 'pristine vehicle state in palisade: ' + pv[v].state };
      }
    }
    return { pass: true, detail: 'W1 r=' + w1R + ' (6 gates), W2 r=' + w2R + ' (5 gates, ' + pv.length + ' ruined vehicles)' };
  }

  function zeroDeadSpaceBlocks(plan) {
    if (!plan.blocks || plan.blocks.length < 60) {
      return { pass: false, detail: 'expected >= 60 radial blocks, got ' + (plan.blocks ? plan.blocks.length : 0) };
    }
    var utilSum = 0;
    for (var i = 0; i < plan.blocks.length; i++) {
      var bl = plan.blocks[i];
      if (Math.abs(bl.radialDepth - bl.expectedDepth) > 0.05) {
        return { pass: false, detail: 'block ' + bl.id + ' depth ' + bl.radialDepth + ' !== ' + bl.expectedDepth };
      }
      utilSum += bl.utilization;
    }
    var meanUtil = utilSum / plan.blocks.length;
    if (meanUtil < 0.80) {
      return { pass: false, detail: 'mean block frontage utilization too low: ' + (meanUtil * 100).toFixed(1) + '%' };
    }
    return { pass: true, detail: plan.blocks.length + ' double-lot blocks, mean frontage fill ' + (meanUtil * 100).toFixed(1) + '%' };
  }

  function walkReachabilityOpen(plan) {
    var seen = bfs(plan.links, 'arc_central_hoist_L01', function () { return true; });
    for (var lv = 1; lv <= 15; lv++) {
      var rId = 'arc_ring_L' + (lv < 10 ? '0' + lv : lv);
      if (!seen[rId]) return { pass: false, detail: 'unreachable arcology ring ' + rId };
    }
    for (var p = 0; p < plan.arcology.portals.length; p++) {
      if (!seen[plan.arcology.portals[p].id]) return { pass: false, detail: 'unreachable portal ' + plan.arcology.portals[p].id };
    }
    for (var l = 1; l < plan.landmarks.length; l++) {
      if (!seen[plan.landmarks[l].id]) return { pass: false, detail: 'unreachable landmark ' + plan.landmarks[l].id };
    }
    for (var r = 0; r < plan.roads.length; r++) {
      if (plan.roads[r].kind === 'ring' && !seen[plan.roads[r].id]) {
        return { pass: false, detail: 'unreachable ring street ' + plan.roads[r].id };
      }
    }
    for (var g = 0; g < plan.gates.length; g++) {
      if (plan.gates[g].wall === 'outer_palisade_scrap' && !seen['outside_road_' + plan.gates[g].id]) {
        return { pass: false, detail: 'unreachable country road outside_road_' + plan.gates[g].id };
      }
    }
    return { pass: true, detail: Object.keys(seen).length + ' walk-graph nodes connected from L01 hoist to country roads' };
  }

  function gateSealingShut(plan) {
    var allowShut = function (meta) { return !(meta && meta.gated && meta.state === 'shut'); };
    var fromCore = bfs(plan.links, 'arc_central_hoist_L01', allowShut);
    if (fromCore.ring_r416) {
      return { pass: false, detail: 'inner wall W1 failed to seal ring_r416 when gates are shut' };
    }
    var fromMid = bfs(plan.links, 'ring_r454', allowShut);
    if (fromMid.ring_r388) {
      return { pass: false, detail: 'mid-ring crossed shut W1 inward to ring_r388' };
    }
    for (var g = 0; g < plan.gates.length; g++) {
      if (plan.gates[g].wall === 'outer_palisade_scrap' && fromMid['outside_road_' + plan.gates[g].id]) {
        return { pass: false, detail: 'outer palisade W2 failed to seal outside_road_' + plan.gates[g].id };
      }
    }
    return { pass: true, detail: 'shut W1 seals inner city; shut W2 seals outer palisade' };
  }

  function censusTradesCovered(plan) {
    var covered = {};
    for (var i = 0; i < plan.buildings.length; i++) {
      var tr = plan.buildings[i].trades || [];
      for (var t = 0; t < tr.length; t++) covered[tr[t]] = true;
    }
    for (var s = 0; s < plan.arcology.simNodes.length; s++) {
      if (plan.arcology.simNodes[s].role === 'mushroom_vat_vault') covered['mushroom growers'] = true;
    }
    var req = DRUM.KITS.vothCensusTrades;
    var missing = [];
    for (var k = 0; k < req.length; k++) {
      if (!covered[req[k]]) missing.push(req[k]);
    }
    if (missing.length > 0) {
      return { pass: false, detail: 'missing census trades: ' + missing.join(', ') };
    }
    return { pass: true, detail: 'all ' + req.length + ' Voth census trades covered' };
  }

  var RULES = {
    uniqueIds: uniqueIds,
    noObbOverlaps: noObbOverlaps,
    arcologyProgramme: arcologyProgramme,
    populationSplit: populationSplit,
    architecturalMix: architecturalMix,
    twoWallsAndVehicles: twoWallsAndVehicles,
    zeroDeadSpaceBlocks: zeroDeadSpaceBlocks,
    walkReachabilityOpen: walkReachabilityOpen,
    gateSealingShut: gateSealingShut,
    censusTradesCovered: censusTradesCovered
  };

  function checks(plan) {
    var order = [
      ['uniqueIds', 'All landmarks, gates, roads, buildings, and arcology sectors have unique IDs'],
      ['noObbOverlaps', 'Zero 2D OBB overlaps and zero podium, quarry, river, or wall intrusions'],
      ['arcologyProgramme', 'Arcology inhabits 15 levels (66 m) with ENE ruin bays and SIM trade/storage halls'],
      ['populationSplit', 'Population totals 13,500 split 2/5 (5,400) arcology and 3/5 (8,100) concentric rings'],
      ['architecturalMix', 'Outer city splits 1/3 SW Arcology, 1/3 Scrap Voth, 1/3 Post-Apoc with ring gradient'],
      ['twoWallsAndVehicles', 'Ancient inner wall (r=534m) + outer vehicle-scrap palisade (r=930m) intact'],
      ['zeroDeadSpaceBlocks', 'Double-lot concentric bands match exact class depths with >=80% frontage fill'],
      ['walkReachabilityOpen', 'Walk graph reaches all 15 arcology levels, landmarks, rings, and exits when open'],
      ['gateSealingShut', 'Shutting W1 and W2 gates seals the inner citadel and outer palisade'],
      ['censusTradesCovered', 'Every Voth census trade is covered across outer rings and arcology vaults']
    ];
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var key = order[i][0], res = RULES[key](plan);
      out.push({ id: key, name: order[i][1], pass: !!res.pass, detail: res.detail });
    }
    return out;
  }

  DRUM.RULES = RULES;
  DRUM.checks = checks;
})(typeof window !== 'undefined' ? window : globalThis);
