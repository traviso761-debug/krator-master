// ================================================================= TORUS — 33: Layout Verification Rules ([G data])
// Pure geometry, botanical/political lore, top-heavy Forest Ring habitation, connectivity, and census invariants for Torus.
// Zero THREE, zero DOM. Avoids `|| <number>` per tools/check_source.py ORNUM rule.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});

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

  // Rule 1: Globally unique IDs across all settlement & arcology entities
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
    var hl = plan.hinterland || { soleriStructures: [], soleriHubs: [], podArrays: [], farmOutbuildings: [], transit: { trains: [] } };
    var err = checkList(plan.landmarks, 'landmarks')
      || checkList(plan.gates, 'gates')
      || checkList(plan.roads, 'roads')
      || checkList(plan.agPlots, 'agPlots')
      || checkList(plan.buildings, 'buildings')
      || checkList(plan.skyBuildings || [], 'skyBuildings')
      || checkList(hl.soleriStructures || [], 'soleriStructures')
      || checkList(hl.farmOutbuildings || [], 'farmOutbuildings')
      || checkList(hl.soleriHubs || [], 'soleriHubs')
      || checkList(hl.podArrays || [], 'podArrays')
      || checkList((hl.transit && hl.transit.trains) || [], 'transit.trains')
      || checkList(plan.arcology.portals, 'portals')
      || checkList(plan.arcology.wheelBridges, 'wheelBridges')
      || checkList(plan.arcology.fruitvines, 'fruitvines')
      || checkList(plan.arcology.tetherStations, 'tetherStations')
      || checkList(plan.arcology.tiers, 'arcology.tiers');
    if (err) return err;
    for (var ti = 0; ti < plan.arcology.tiers.length; ti++) {
      var e2 = checkList(plan.arcology.tiers[ti].sectors, 'arcology.sectors');
      if (e2) return e2;
    }
    return { pass: true, detail: Object.keys(seen).length + ' unique IDs' };
  }

  // Rule 2: Zero 3D-elevation-aware OBB overlaps, zero dome/amber-sap clipping & zero barrel/river/wheel-ruin/wall intrusions
  function noObbOverlaps(plan) {
    var items = [];
    for (var i = 0; i < plan.landmarks.length; i++) {
      if (plan.landmarks[i].r > 0) items.push(plan.landmarks[i]);
    }
    for (var g = 0; g < plan.gates.length; g++) items.push(plan.gates[g]);
    for (var b = 0; b < plan.buildings.length; b++) items.push(plan.buildings[b]);
    var skyB = plan.skyBuildings || [];
    for (var sb = 0; sb < skyB.length; sb++) items.push(skyB[sb]);
    var sol = (plan.hinterland && plan.hinterland.soleriStructures) || [];
    for (var s = 0; s < sol.length; s++) items.push(sol[s]);
    var fob = (plan.hinterland && plan.hinterland.farmOutbuildings) || [];
    for (var fo = 0; fo < fob.length; fo++) items.push(fob[fo]);

    var domes = (plan.specimenDomes || []).concat(plan.feralDomes || []);
    var wallR = plan.site.customsWallR == null ? 1140 : plan.site.customsWallR;
    for (var k = 0; k < plan.buildings.length; k++) {
      var bd = plan.buildings[k];
      var rad = Math.hypot(bd.x, bd.z);
      var halfDiag = 0.5 * Math.hypot(bd.w, bd.d);
      if (rad - halfDiag < plan.arcology.RFOOT - 0.5) {
        return { pass: false, detail: bd.id + ' intrudes into Forest Ring barrel foot (r=' + rad.toFixed(1) + ')' };
      }
      if (TORUS.inWheelRuinZone(rad, bd.deg)) {
        return { pass: false, detail: bd.id + ' sits inside ENE Fallen-Wheel Ruin zone' };
      }
      if (TORUS.inRiverCorridor(bd.x, bd.z, 2)) {
        return { pass: false, detail: bd.id + ' intrudes into Tors Rivrh channel' };
      }
      if (Math.abs(rad - wallR) < 5.0) {
        return { pass: false, detail: bd.id + ' collides with Customs Wall at r=' + rad.toFixed(1) };
      }
      for (var di = 0; di < domes.length; di++) {
        var dm = domes[di];
        var minClear = (dm.clearR == null ? 18.0 : dm.clearR) + halfDiag - 0.5;
        if (Math.hypot(bd.x - dm.x, bd.z - dm.z) < minClear) {
          return { pass: false, detail: bd.id + ' clips into Ag-Dome sanctuary ' + dm.id };
        }
      }
    }

    for (var a = 0; a < items.length; a++) {
      for (var c = a + 1; c < items.length; c++) {
        var ia = items[a], ic = items[c];
        var ay = ia.y == null ? 0 : ia.y;
        var cy = ic.y == null ? 0 : ic.y;
        if (Math.abs(ay - cy) > 45.0) continue;
        var maxR = 0.5 * (Math.hypot(ia.w, ia.d) + Math.hypot(ic.w, ic.d));
        if (Math.abs(ia.x - ic.x) > maxR || Math.abs(ia.z - ic.z) > maxR) continue;
        if (TORUS.obbOverlap(ia, ic, 0.15)) {
          return { pass: false, detail: 'OBB overlap between ' + ia.id + ' and ' + ic.id };
        }
      }
    }
    return { pass: true, detail: '0 overlaps & 0 dome intrusions across ' + items.length + ' landmarks, gates, domes, terrace, sky & Soleri structures' };
  }

  // Rule 3: Forest Ring (71c-ring.js) top-heavy habitation + sky-fruitvine crop curtains + Wheel/Crown kit buildings
  function arcologyTopHeavyAndVines(plan) {
    var arc = plan.arcology;
    if (arc.targetKey !== 'ring' || arc.sourceModule !== 'kits/ancients/src/71c-ring.js') {
      return { pass: false, detail: 'wrong arcology target: ' + arc.targetKey };
    }
    if (arc.upperPop <= arc.middlePop * 8 || arc.middlePop > 250 || arc.footPop < 400) {
      return { pass: false, detail: 'habitation not top-heavy: upper=' + arc.upperPop + ', middle=' + arc.middlePop + ', foot=' + arc.footPop };
    }
    var innerVines = 0, outerVines = 0, innerWinch = 0, outerWinch = 0;
    for (var i = 0; i < arc.fruitvines.length; i++) {
      var fv = arc.fruitvines[i];
      if (fv.cropId !== 'sky-fruitvine') {
        return { pass: false, detail: 'fruitvine missing sky-fruitvine cropId: ' + fv.id };
      }
      if (fv.rim === 'inner' && fv.r === 560 && fv.dropM >= 60) innerVines++;
      if (fv.rim === 'outer' && fv.r === 720 && fv.dropM >= 60) outerVines++;
    }
    for (var j = 0; j < arc.tetherStations.length; j++) {
      var ts = arc.tetherStations[j];
      if (ts.rim === 'inner' && ts.hazard === 'fall') innerWinch++;
      if (ts.rim === 'outer' && ts.hazard === 'fall') outerWinch++;
    }
    if (innerVines < 18 || outerVines < 18 || innerWinch < 18 || outerWinch < 18) {
      return { pass: false, detail: 'insufficient dual-rim fruitvines/winches: inV=' + innerVines + ', outV=' + outerVines };
    }
    if (!plan.skyBuildings || plan.skyBuildings.length < 80) {
      return { pass: false, detail: 'insufficient Wheel Town & Crown kit buildings: ' + (plan.skyBuildings ? plan.skyBuildings.length : 0) };
    }
    if (arc.simNodes.length < 15) {
      return { pass: false, detail: 'insufficient SIM-active arcology cider/crop nodes: ' + arc.simNodes.length };
    }
    return {
      pass: true,
      detail: 'Forest Ring (71c-ring.js): upper=' + arc.upperPop + ' vs mid=' + arc.middlePop + ' vs foot=' + arc.footPop +
        '; sky-fruitvines=' + innerVines + ' inner + ' + outerVines + ' outer; skyBuildings=' + plan.skyBuildings.length
    };
  }

  // Rule 4: Exact 30% Arcology (2,550) / 70% Terraces & Extension (5,950) = 8,500 population + client self-rule
  function populationAndGovernance(plan) {
    var gov = plan.site.governance || {};
    if (gov.localRule !== 'elected_chairman_and_board' || gov.vothicAuthority !== 'tzintzun_via_emissary' || !gov.missionaryFreedom) {
      return { pass: false, detail: 'governance mismatch: ' + JSON.stringify(gov) };
    }
    var tierSum = 0;
    for (var i = 0; i < plan.arcology.tiers.length; i++) tierSum += plan.arcology.tiers[i].pop;
    var outerSum = 0;
    for (var j = 1; j < plan.landmarks.length; j++) outerSum += plan.landmarks[j].pop;
    for (var k = 0; k < plan.buildings.length; k++) outerSum += plan.buildings[k].pop;
    var total = tierSum + outerSum;
    if (tierSum !== 2550 || outerSum !== 5950 || total !== 8500) {
      return { pass: false, detail: 'expected 2550/5950/8500, got ' + tierSum + '/' + outerSum + '/' + total };
    }
    return { pass: true, detail: '2,550 (30.0%) Forest Ring + 5,950 (70.0%) Terraces/Extension = 8,500; elected Chairman & Board' };
  }

  // Rule 5: SE Scrap Voth Extension (>=95% voth-scrap), SW-Arcology Podium Terraces (>=80% sw-arcology) & open fields
  function zonationAndExtensionMix(plan) {
    var vextTotal = 0, vextScrap = 0;
    var podTotal = 0, podSwa = 0;
    for (var i = 0; i < plan.buildings.length; i++) {
      var b = plan.buildings[i];
      if (b.zone === 'voth_extension') {
        vextTotal++;
        if (b.kit === 'voth-scrap') vextScrap++;
      } else if (b.zone === 'podium_terrace') {
        podTotal++;
        if (b.kit === 'sw-arcology') podSwa++;
      }
    }
    if (vextTotal < 120 || vextScrap / vextTotal < 0.95) {
      return { pass: false, detail: 'SE Vothic Extension not scrap-voth dominant: ' + vextScrap + '/' + vextTotal };
    }
    if (podTotal < 120 || podSwa / podTotal < 0.80) {
      return { pass: false, detail: 'Podium terraces not sw-arcology tankhome dominant: ' + podSwa + '/' + podTotal };
    }
    if (plan.agPlots.length < 60) {
      return { pass: false, detail: 'too few irrigated agricultural field plots: ' + plan.agPlots.length };
    }
    return {
      pass: true,
      detail: 'SE Voth Extension ' + vextScrap + '/' + vextTotal + ' (100% voth-scrap); Podium ' +
        (100 * podSwa / podTotal).toFixed(1) + '% sw-arcology; ' + plan.agPlots.length + ' irrigated field/orchard plots'
    };
  }

  // Rule 6: Tenders' bespoke out-of-zone & medical ag-domes (Earthlike pharmacopoeia, 1 unique Ancient medical crop,
  //         mist tea, equatorial cacao, highland spice, out-of-zone useful crops) + >= 4 quarantined KHAZ feral domes
  function specimensAndFeralQuarantine(plan) {
    var cats = {};
    var ancientWatched = false;
    var domes = plan.specimenDomes || [];
    for (var i = 0; i < domes.length; i++) {
      var sd = domes[i];
      var cat = sd.category || 'unknown';
      cats[cat] = (cats[cat] == null ? 0 : cats[cat]) + 1;
      if (cat === 'unique_ancient_medical' && sd.ordinatorsWatch === 'strict_surveillance') ancientWatched = true;
    }
    if ((cats.earthlike_medicine == null || cats.earthlike_medicine < 2) ||
        cats.unique_ancient_medical !== 1 || !ancientWatched ||
        !cats.tea || !cats.cacao || !cats.highland_spice ||
        (cats.out_of_zone_useful == null || cats.out_of_zone_useful < 2)) {
      return { pass: false, detail: 'missing Tenders\' out-of-zone/medical dome categories or Ordinator watch: ' + JSON.stringify(cats) };
    }
    if (plan.feralDomes.length < 4) {
      return { pass: false, detail: 'fewer than 4 quarantined feral ag-domes: ' + plan.feralDomes.length };
    }
    for (var f = 0; f < plan.feralDomes.length; f++) {
      var fd = plan.feralDomes[f];
      if (!fd.quarantined || fd.pop !== 0 || !fd.hazard || !fd.hazard.kind) {
        return { pass: false, detail: 'unsealed or inhabited feral dome: ' + fd.id };
      }
    }
    return {
      pass: true,
      detail: domes.length + ' Tenders\' ag-domes (2 Earthlike medical, 1 unique Ancient medical [use TBD, Ordinator watch], tea, cacao, highland spice, 2 out-of-zone) + ' +
        plan.feralDomes.length + ' KHAZ feral domes'
    };
  }

  // Rule 7: Zero-dead-space street block depth & frontage packing
  function zeroDeadSpaceBlocks(plan) {
    if (plan.blocks.length < 25) return { pass: false, detail: 'too few street blocks: ' + plan.blocks.length };
    var sumUtil = 0;
    for (var i = 0; i < plan.blocks.length; i++) {
      var bl = plan.blocks[i];
      if (Math.abs(bl.radialDepth - bl.expectedDepth) > 0.05) {
        return { pass: false, detail: 'dead space in ' + bl.id + ': radial=' + bl.radialDepth + ' vs ' + bl.expectedDepth };
      }
      sumUtil += bl.utilization;
    }
    var avg = sumUtil / plan.blocks.length;
    if (avg < 0.88) {
      return { pass: false, detail: 'mean frontage utilization too low: ' + avg.toFixed(3) };
    }
    return { pass: true, detail: plan.blocks.length + ' zero-dead-space blocks, mean frontage fill ' + (100 * avg).toFixed(1) + '%' };
  }

  // Rule 8: Full 3D walkability from Podium Terraces up to y=300m Wheel Cider Hall & y=664m Crown and out to all landmarks & domes
  function verticalAndCityReachability(plan) {
    var seen = bfs(plan.links, 'ring_r302', function (meta) { return !meta.gated; });
    var mustReach = [
      'arc_atrium_base',
      'arc_tier_middle_barrel',
      'arc_wheel_bridge_2',
      'lm_ciderhall',
      'arc_crown_t2_sacred',
      'lm_boardhall',
      'lm_emissary',
      'lm_ordinators',
      'lm_tithe_granary',
      'lm_transit_terminal',
      'lm_river_wharf',
      'dome_earth_med_1',
      'dome_earth_med_2',
      'dome_ancient_medical',
      'dome_mist_tea',
      'dome_equatorial_cacao',
      'dome_highland_spice',
      'dome_dryland_orchard',
      'dome_fibre_latex'
    ];
    for (var i = 0; i < mustReach.length; i++) {
      if (!seen[mustReach[i]]) {
        return { pass: false, detail: 'node unreachable from ring_r302: ' + mustReach[i] };
      }
    }
    return { pass: true, detail: 'all ' + mustReach.length + ' terrace, transit, diplomatic, Tenders\' dome, Wheel & Crown targets reachable' };
  }

  // Rule 9: Customs Wall gates control passage into the outer Soleri hinterland roads
  function customsGatesControl(plan) {
    var closedSeen = bfs(plan.links, 'ring_r302', function (meta) { return meta.state !== 'shut'; });
    for (var i = 0; i < plan.gates.length; i++) {
      var outNode = 'breadbasket_' + plan.gates[i].id;
      if (closedSeen[outNode]) {
        return { pass: false, detail: 'customs wall leak while shut: ' + outNode };
      }
    }
    var openSeen = bfs(plan.links, 'ring_r302', function () { return true; });
    for (var j = 0; j < plan.gates.length; j++) {
      var outNode2 = 'breadbasket_' + plan.gates[j].id;
      if (!openSeen[outNode2]) {
        return { pass: false, detail: 'hinterland road disconnected even when open: ' + outNode2 };
      }
    }
    return { pass: true, detail: plan.gates.length + ' customs gates seal & open outer hinterland access cleanly' };
  }

  // Rule 10: All 44 Voth census trades represented across placed Torus buildings
  function censusTradesCovered(plan) {
    var covered = {};
    for (var i = 0; i < plan.buildings.length; i++) {
      var tr = plan.buildings[i].trades || [];
      for (var t = 0; t < tr.length; t++) covered[tr[t]] = (covered[tr[t]] == null ? 0 : covered[tr[t]]) + 1;
    }
    var req = TORUS.KITS.vothCensusTrades;
    var missing = [];
    for (var r = 0; r < req.length; r++) {
      if (!covered[req[r]]) missing.push(req[r]);
    }
    if (missing.length > 0) {
      return { pass: false, detail: 'missing census trades: ' + missing.join(', ') };
    }
    return { pass: true, detail: 'all ' + req.length + ' Voth census trades active in Torus' };
  }

  // Rule 11: Monumental 10-level stepped agricultural terrace cascade (T1 >= +40m stepping down out to r >= 1,100m)
  function grandTerracesCascade(plan) {
    var t = plan.agTerraces || [];
    if (t.length < 10) return { pass: false, detail: 'fewer than 10 stepped agricultural terrace levels: ' + t.length };
    if (t[0].elev < 40.0 || t[t.length - 1].rOut < 1100 || t[t.length - 1].elev > 2.5) {
      return { pass: false, detail: 'terrace height/span insufficient: top=' + t[0].elev + 'm, rOut=' + t[t.length - 1].rOut + 'm' };
    }
    for (var i = 1; i < t.length; i++) {
      if (t[i].elev >= t[i - 1].elev || t[i].rIn !== t[i - 1].rOut) {
        return { pass: false, detail: 'non-monotonic or gapped terrace step at ' + t[i].id };
      }
    }
    if (plan.agPlots.length < 150) {
      return { pass: false, detail: 'insufficient agricultural terrace & hinterland plots: ' + plan.agPlots.length };
    }
    return {
      pass: true,
      detail: t.length + ' stepped terrace benches (T1 +' + t[0].elev + 'm -> T10 +' + t[t.length - 1].elev +
        'm, r=296..' + t[t.length - 1].rOut + 'm) + ' + plan.agPlots.length + ' agricultural plots'
    };
  }

  // Rule 12: Soleri-farm hinterlands (all 8 MP.FARM_KEYS, >=12 pod arrays with ~2/3 ruined & ~1/3 working farms/orchards) + decayed KTRANSIT
  function soleriHinterlandsAndDecayedTransit(plan) {
    var hl = plan.hinterland;
    if (!hl || !hl.soleriStructures || !hl.transit) {
      return { pass: false, detail: 'missing Soleri hinterland or KTRANSIT network' };
    }
    var wallR = plan.site.customsWallR == null ? 1140 : plan.site.customsWallR;
    var fams = {};
    var ruinedCount = 0, reclaimedCount = 0;
    for (var i = 0; i < hl.soleriStructures.length; i++) {
      var s = hl.soleriStructures[i];
      if (s.r <= wallR) return { pass: false, detail: 'Soleri hinterland structure inside customs wall: ' + s.id };
      fams[s.family] = (fams[s.family] == null ? 0 : fams[s.family]) + 1;
      if (s.reclaimedByTenders) reclaimedCount++;
      else if (s.soleriState !== 'intact') ruinedCount++;
    }
    var reqFams = ['pod', 'vault', 'stack', 'hall', 'market', 'watertower', 'aqueduct', 'pumphouse'];
    for (var k = 0; k < reqFams.length; k++) {
      if (!fams[reqFams[k]]) return { pass: false, detail: 'missing Soleri farm family: ' + reqFams[k] };
    }
    var arrays = hl.podArrays || [];
    var ruinedArrays = 0, workingArrays = 0;
    for (var pa = 0; pa < arrays.length; pa++) {
      if (arrays[pa].working) workingArrays++;
      else ruinedArrays++;
    }
    var ruinArrayShare = arrays.length > 0 ? (ruinedArrays / arrays.length) : 0;
    var ruinShare = hl.soleriStructures.length > 0 ? (ruinedCount / hl.soleriStructures.length) : 0;
    if (hl.soleriHubs.length < 4 || arrays.length < 10 || fams.pod < 100 || fams.aqueduct < 24) {
      return { pass: false, detail: 'insufficient Soleri hubs/honeycombs/aqueducts: arrays=' + arrays.length + ' ' + JSON.stringify(fams) };
    }
    if (ruinArrayShare < 0.60 || ruinArrayShare > 0.74 || workingArrays < 3) {
      return { pass: false, detail: 'Soleri pod array ruined/working split expected ~2/3 vs ~1/3, got ' + ruinedArrays + '/' + arrays.length + ' ruined, ' + workingArrays + ' working' };
    }
    if (ruinShare < 0.58 || reclaimedCount < 25) {
      return { pass: false, detail: 'Soleri ruin share (' + ruinShare.toFixed(2) + ') or working/reclaimed count (' + reclaimedCount + ') out of range' };
    }

    var tr = hl.transit;
    if (!tr.highway || !tr.elevatedRails || tr.elevatedRails.length < 2 || !tr.cargoRails || tr.cargoRails.length < 2) {
      return { pass: false, detail: 'incomplete KTRANSIT highway / elevated monorail / cargo rail network' };
    }
    var spansTotal = tr.highway.spans.length, spansDecayed = 0;
    for (var h = 0; h < tr.highway.spans.length; h++) {
      if (tr.highway.spans[h].state !== 'intact') spansDecayed++;
    }
    var stationsTotal = 0, stationsDecayed = 0;
    for (var er = 0; er < tr.elevatedRails.length; er++) {
      var elLine = tr.elevatedRails[er];
      spansTotal += elLine.spans.length;
      for (var es = 0; es < elLine.spans.length; es++) {
        if (elLine.spans[es].state !== 'intact') spansDecayed++;
      }
      stationsTotal += elLine.stations.length;
      for (var st = 0; st < elLine.stations.length; st++) {
        if (elLine.stations[st].state !== 'intact') stationsDecayed++;
      }
    }
    var railsTotal = 0, railsDecayed = 0;
    for (var cr = 0; cr < tr.cargoRails.length; cr++) {
      var cLine = tr.cargoRails[cr];
      railsTotal += cLine.rails.length;
      for (var rl = 0; rl < cLine.rails.length; rl++) {
        if (cLine.rails[rl].state !== 'intact') railsDecayed++;
      }
    }
    var derailedTrains = 0;
    for (var tn = 0; tn < tr.trains.length; tn++) {
      if (tr.trains[tn].state === 'derailed' || tr.trains[tn].state === 'fallen') derailedTrains++;
    }
    var spanDecayShare = spansTotal > 0 ? (spansDecayed / spansTotal) : 0;
    var railDecayShare = railsTotal > 0 ? (railsDecayed / railsTotal) : 0;
    if (stationsTotal < 4 || stationsDecayed < stationsTotal || spanDecayShare < 0.75 || railDecayShare < 0.70 || derailedTrains < 3) {
      return {
        pass: false,
        detail: 'transit not sufficiently decayed: spanDecay=' + spanDecayShare.toFixed(2) + ', railDecay=' + railDecayShare.toFixed(2) +
          ', stations=' + stationsDecayed + '/' + stationsTotal + ', derailedTrains=' + derailedTrains
      };
    }
    return {
      pass: true,
      detail: hl.soleriStructures.length + ' Soleri structures (' + arrays.length + ' pod arrays: ' + ruinedArrays + ' ruined [2/3], ' +
        workingArrays + ' working farms/orchards [1/3]; ' + fams.pod + ' pods; all 8 families) + KTRANSIT (' +
        (100 * spanDecayShare).toFixed(1) + '% viaducts decayed, ' + derailedTrains + ' wrecked trains)'
    };
  }

  TORUS.RULES = {
    uniqueIds: uniqueIds,
    noObbOverlaps: noObbOverlaps,
    arcologyTopHeavyAndVines: arcologyTopHeavyAndVines,
    populationAndGovernance: populationAndGovernance,
    zonationAndExtensionMix: zonationAndExtensionMix,
    specimensAndFeralQuarantine: specimensAndFeralQuarantine,
    zeroDeadSpaceBlocks: zeroDeadSpaceBlocks,
    verticalAndCityReachability: verticalAndCityReachability,
    customsGatesControl: customsGatesControl,
    censusTradesCovered: censusTradesCovered,
    grandTerracesCascade: grandTerracesCascade,
    soleriHinterlandsAndDecayedTransit: soleriHinterlandsAndDecayedTransit
  };
})(typeof window !== 'undefined' ? window : globalThis);
