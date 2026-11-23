// ================================================================= TORUS — 78: Stage 5 World Simulation ([G data])
// Wires core/simulation (77-sim-*.js) for Torus (Tors / Rinkvolk):
//   - 8,500 permanent residents: exact 2,550 top-heavy in Forest Ring (1,250 Wheel + 600 Crown + 150 Barrel + 550 Foot)
//     + 5,950 across the 10 Stepped Agricultural Terraces (T1 +44m -> T10 +1m) & SE Scrap Voth Extension
//   - Connected 3D pedestrian graph (10 terraces, radial stairs, Foot, 4 Atrium Hoists, 4 Wheel Bridges at WY=300m,
//     Wheel Town, 44 Tether-Winch stations, Cider Hall, Crown, Board Hall, Emissary, Ordinators, 8 Tenders' Domes, ports)
//   - SIM.economy + SIM.needs + SIM.items + SIM.crime: Hanging Fruitvine harvesting, Great Cider-Press brewing,
//     Tenders' Earthlike medicines / mist-tea / cacao / highland spice / audited Amber-Sap, terrace grain & orchards,
//     14 haul carts, Voth Food-Tithe caravans, Drum tool caravans, and Tors Rivrh barges
//   - Dawn-to-midday (06:00-13:00) tethered fruitvine harvester shifts on both Wheel rims, Elected Board Assize sessions,
//     free-roaming Sun-cult missionaries, and Ordinator surveillance at Sanctuary Dome III (Amber-Sap).
// Zero THREE, zero DOM. Avoids `|| <number>` per tools/check_source.py ORNUM rule.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});
  var DEG = Math.PI / 180;

  function findLm(plan, id) {
    for (var i = 0; i < plan.landmarks.length; i++) {
      if (plan.landmarks[i].id === id) return plan.landmarks[i];
    }
    return null;
  }

  function lmPt(lm, lx, lz, ly) {
    var c = Math.cos(lm.ry), s = Math.sin(lm.ry);
    return {
      x: +(lm.x + lx * c + lz * s).toFixed(2),
      y: +(lm.y + (ly == null ? 0 : ly)).toFixed(2),
      z: +(lm.z - lx * s + lz * c).toFixed(2)
    };
  }

  function buildNavLayers(plan) {
    var SIM = root.SIM;
    var nodes = [];
    var edges = [];
    var nodeIdx = {};

    function addNode(id, x, y, z, tag) {
      if (nodeIdx[id] != null) return id;
      nodeIdx[id] = nodes.length;
      nodes.push({ id: id, x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2), tag: tag == null ? 'street' : tag });
      return id;
    }

    function addEdge(a, b, kind, w) {
      if (nodeIdx[a] == null || nodeIdx[b] == null || a === b) return;
      var na = nodes[nodeIdx[a]], nb = nodes[nodeIdx[b]];
      var dx = nb.x - na.x, dy = nb.y - na.y, dz = nb.z - na.z;
      var len = Math.max(0.5, Math.hypot(dx, dy, dz));
      edges.push({
        id: 'e_' + edges.length,
        a: a,
        b: b,
        kind: kind == null ? 'street' : kind,
        len: +len.toFixed(2),
        w: w == null ? 8 : w
      });
    }

    // 1. 10 Stepped Terrace Rings (T1 +44m .. T10 +1m) + Outer Customs Ring (r=1122, y=0.5m) x 24 spokes (every 15 deg)
    var terraces = plan.agTerraces;
    var SPOKES = 24;
    for (var ti = 0; ti < terraces.length; ti++) {
      var tr = terraces[ti];
      var rm = 0.5 * (tr.rIn + tr.rOut);
      for (var si = 0; si < SPOKES; si++) {
        var deg = 7.5 + si * 15.0;
        var rad = deg * DEG;
        addNode('ter_' + ti + '_s' + si, rm * Math.cos(rad), tr.elev, rm * Math.sin(rad), 'street');
      }
      for (var si2 = 0; si2 < SPOKES; si2++) {
        addEdge('ter_' + ti + '_s' + si2, 'ter_' + ti + '_s' + ((si2 + 1) % SPOKES), 'street', 8.5);
      }
    }
    // Outer customs ring at r = 1122 m, y = 0.5 m
    for (var co = 0; co < SPOKES; co++) {
      var cdeg = 7.5 + co * 15.0;
      var crad = cdeg * DEG;
      addNode('ter_10_s' + co, 1122 * Math.cos(crad), 0.5, 1122 * Math.sin(crad), 'street');
    }
    for (var co2 = 0; co2 < SPOKES; co2++) {
      addEdge('ter_10_s' + co2, 'ter_10_s' + ((co2 + 1) % SPOKES), 'street', 8.0);
    }
    // Radial stepped avenues along the 12 main spokes (even indices si = 0, 2, ..., 22 -> 7.5 + 30*k deg)
    for (var ti2 = 0; ti2 < 10; ti2++) {
      for (var sk = 0; sk < SPOKES; sk += 2) {
        addEdge('ter_' + ti2 + '_s' + sk, 'ter_' + (ti2 + 1) + '_s' + sk, 'stair', 9.0);
      }
    }

    function nearestTerraceNode(x, z, maxTier) {
      var best = 'ter_0_s0', bd = 1e18;
      var limitTag = maxTier == null ? null : maxTier;
      for (var i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        if (nd.tag !== 'street') continue;
        if (limitTag != null && nd.id.indexOf(limitTag) !== 0) continue;
        var d = (nd.x - x) * (nd.x - x) + (nd.z - z) * (nd.z - z);
        if (d < bd) { bd = d; best = nd.id; }
      }
      return best;
    }

    // 2. Forest Ring Arcology 3D Interior Graph (Foot y=44 -> 4 Hoists -> Waystations -> 4 Bridges y=300 -> Wheel & Tethers -> Crown y=600..664)
    var arc = plan.arcology;
    // Foot Ring (8 sectors at y = 44m, skipping ruined s02)
    var footRingIds = [];
    var footTier = arc.tiers[0];
    for (var fs = 0; fs < footTier.sectors.length; fs++) {
      var fsec = footTier.sectors[fs];
      if (fsec.state === 'ruined') continue;
      var fa = fsec.deg * DEG;
      var fid = fsec.id;
      addNode(fid, 224 * Math.cos(fa), 44.0, 224 * Math.sin(fa), 'arcology_foot');
      footRingIds.push(fid);
    }
    for (var fi = 0; fi < footRingIds.length; fi++) {
      addEdge(footRingIds[fi], footRingIds[(fi + 1) % footRingIds.length], 'gallery', 7.0);
    }
    // Connect intact Foot Portals from T1 (ter_0) into Foot Ring
    for (var pi = 0; pi < arc.portals.length; pi++) {
      var prt = arc.portals[pi];
      if (prt.ruined) continue;
      var pa = prt.deg * DEG;
      var pid = prt.id;
      addNode(pid, 292 * Math.cos(pa), 44.0, 292 * Math.sin(pa), 'portal');
      addEdge(pid, nearestTerraceNode(310 * Math.cos(pa), 310 * Math.sin(pa), 'ter_0_'), 'avenue', 8.5);
      // Link to nearest footRing node
      var bestFoot = footRingIds[0], bfd = 1e18;
      for (var fk = 0; fk < footRingIds.length; fk++) {
        var fnd = nodes[nodeIdx[footRingIds[fk]]];
        var d2f = (fnd.x - 292 * Math.cos(pa)) * (fnd.x - 292 * Math.cos(pa)) + (fnd.z - 292 * Math.sin(pa)) * (fnd.z - 292 * Math.sin(pa));
        if (d2f < bfd) { bfd = d2f; bestFoot = footRingIds[fk]; }
      }
      addEdge(pid, bestFoot, 'gallery', 7.5);
    }

    // 4 Express Hoist/Stair Cores (45, 135, 225, 315 deg at r=78m) across stops y = 44, 111, 240, 300, 346.8, 459, 600, 664
    var H_STOPS = [44, 111, 240, 300, 347, 459, 600, 664];
    for (var hi = 0; hi < arc.hoists.length; hi++) {
      var hst = arc.hoists[hi];
      var ha = hst.deg * DEG;
      var hx = 78 * Math.cos(ha), hz = 78 * Math.sin(ha);
      for (var hs = 0; hs < H_STOPS.length; hs++) {
        var hy = H_STOPS[hs];
        var hid = hst.id + '_y' + hy;
        addNode(hid, hx, hy, hz, 'arcology_hoist');
        if (hs > 0) {
          addEdge(hst.id + '_y' + H_STOPS[hs - 1], hid, 'stair', 5.0);
        }
      }
      // Link y=44 hoist base to nearest Foot sector
      var nearF = footRingIds[0], nfd = 1e18;
      for (var fk2 = 0; fk2 < footRingIds.length; fk2++) {
        var fn2 = nodes[nodeIdx[footRingIds[fk2]]];
        var df2 = (fn2.x - hx) * (fn2.x - hx) + (fn2.z - hz) * (fn2.z - hz);
        if (df2 < nfd) { nfd = df2; nearF = footRingIds[fk2]; }
      }
      addEdge(hst.id + '_y44', nearF, 'gallery', 6.5);
    }
    // Ring catwalks at y=300 and y=600 between the 4 hoist shafts
    for (var hi2 = 0; hi2 < arc.hoists.length; hi2++) {
      var hNext = arc.hoists[(hi2 + 1) % arc.hoists.length];
      addEdge(arc.hoists[hi2].id + '_y300', hNext.id + '_y300', 'gallery', 6.5);
      addEdge(arc.hoists[hi2].id + '_y600', hNext.id + '_y600', 'gallery', 6.5);
      addEdge(arc.hoists[hi2].id + '_y664', hNext.id + '_y664', 'gallery', 5.5);
    }

    // 4 Intact Middle Barrel Waystations (111, 240, 347, 459 m)
    var midTier = arc.tiers[1];
    for (var mi = 0; mi < midTier.sectors.length; mi++) {
      var ms = midTier.sectors[mi];
      if (ms.state === 'ruined') continue;
      var myRound = Math.round(ms.y);
      addNode(ms.id, ms.at[0], ms.at[1], ms.at[2], 'arcology_mid');
      addEdge(arc.hoists[mi % arc.hoists.length].id + '_y' + myRound, ms.id, 'corridor', 5.5);
    }

    // Suspended Outer Wheel (21 intact sectors at WY = 300m) + 4 Radial Bridges + 44 Rim Tether-Winch Stations
    var wheelTier = arc.tiers[2];
    for (var wi = 0; wi < wheelTier.sectors.length; wi++) {
      var ws = wheelTier.sectors[wi];
      if (ws.state === 'ruined') continue;
      addNode(ws.id, ws.at[0], 300.0, ws.at[2], 'arcology_wheel');
    }
    for (var wi2 = 0; wi2 < wheelTier.sectors.length; wi2++) {
      var curW = wheelTier.sectors[wi2];
      var nxtW = wheelTier.sectors[(wi2 + 1) % 24];
      if (curW.state !== 'ruined' && nxtW.state !== 'ruined') {
        addEdge(curW.id, nxtW.id, 'avenue', 9.0);
      }
    }
    for (var bri = 0; bri < arc.wheelBridges.length; bri++) {
      var br = arc.wheelBridges[bri];
      addNode(br.id, br.at[0], 300.0, br.at[2], 'wheel_bridge');
      var secIdx = Math.round((br.deg - 7.5) / 15.0);
      var wSecId = 'arc_wheel_S' + (secIdx < 10 ? '0' + secIdx : secIdx);
      addEdge(arc.hoists[bri % arc.hoists.length].id + '_y300', br.id, 'avenue', 10.0);
      addEdge(br.id, wSecId, 'avenue', 10.0);
    }
    for (var tsi = 0; tsi < arc.tetherStations.length; tsi++) {
      var tst = arc.tetherStations[tsi];
      addNode(tst.id, tst.at[0], 300.0, tst.at[2], 'tether_station');
      var sCode = tst.id.slice(-3); // S00..S23
      var hostWheelId = 'arc_wheel_' + sCode;
      if (nodeIdx[hostWheelId] != null) addEdge(hostWheelId, tst.id, 'corridor', 5.0);
    }

    // Stepped Botanical Crown sectors (y = 600..672 m)
    var crownTier = arc.tiers[3];
    for (var ci = 0; ci < crownTier.sectors.length; ci++) {
      var cs = crownTier.sectors[ci];
      if (cs.state === 'ruined') continue;
      addNode(cs.id, cs.at[0], cs.at[1], cs.at[2], 'arcology_crown');
      var hStop = cs.y >= 655 ? '_y664' : '_y600';
      addEdge(arc.hoists[ci % arc.hoists.length].id + hStop, cs.id, 'corridor', 6.0);
    }

    // 3. Hero Floorplanned Landmarks & 8 Surviving Tenders' Ag-Domes
    var board = findLm(plan, 'lm_boardhall');
    if (board) {
      var bPort = lmPt(board, 0, 25, 0);
      var bRotunda = lmPt(board, 0, 2, 0);
      var bVault = lmPt(board, -12, -14, -4.2);
      var bGal = lmPt(board, -18, -12, 5.4);
      addNode('lm_board_port', bPort.x, bPort.y, bPort.z, 'landmark');
      addNode('lm_board_rotunda', bRotunda.x, bRotunda.y, bRotunda.z, 'landmark');
      addNode('lm_board_vault', bVault.x, bVault.y, bVault.z, 'landmark');
      addNode('lm_board_gallery', bGal.x, bGal.y, bGal.z, 'landmark');
      addEdge(nearestTerraceNode(bPort.x, bPort.z, 'ter_2_'), 'lm_board_port', 'avenue', 8.0);
      addEdge('lm_board_port', 'lm_board_rotunda', 'corridor', 6.5);
      addEdge('lm_board_rotunda', 'lm_board_vault', 'stair', 5.0);
      addEdge('lm_board_rotunda', 'lm_board_gallery', 'stair', 5.0);
    }

    var emis = findLm(plan, 'lm_emissary');
    if (emis) {
      var eGate = lmPt(emis, 0, 34, 0);
      var eCourt = lmPt(emis, 0, 12, 0);
      var eCloister = lmPt(emis, 28, 8, 0);
      var eVault = lmPt(emis, -12, -16, -4.2);
      var eHall = lmPt(emis, 0, -16, 5.4);
      addNode('lm_emis_gate', eGate.x, eGate.y, eGate.z, 'landmark');
      addNode('lm_emis_court', eCourt.x, eCourt.y, eCourt.z, 'landmark');
      addNode('lm_emis_cloister', eCloister.x, eCloister.y, eCloister.z, 'landmark');
      addNode('lm_emis_vault', eVault.x, eVault.y, eVault.z, 'landmark');
      addNode('lm_emis_hall', eHall.x, eHall.y, eHall.z, 'landmark');
      addEdge(nearestTerraceNode(eGate.x, eGate.z, 'ter_6_'), 'lm_emis_gate', 'avenue', 8.0);
      addEdge('lm_emis_gate', 'lm_emis_court', 'corridor', 7.0);
      addEdge('lm_emis_court', 'lm_emis_cloister', 'corridor', 5.5);
      addEdge('lm_emis_court', 'lm_emis_vault', 'stair', 5.0);
      addEdge('lm_emis_court', 'lm_emis_hall', 'stair', 5.5);
    }

    var ord = findLm(plan, 'lm_ordinators');
    if (ord) {
      var oGate = lmPt(ord, 0, 33, 0);
      var oHall = lmPt(ord, 4, -8, 0);
      var oCells = lmPt(ord, 12, 8, -4.2);
      var oReg = lmPt(ord, 4, -10, 5.6);
      addNode('lm_ord_gate', oGate.x, oGate.y, oGate.z, 'landmark');
      addNode('lm_ord_hall', oHall.x, oHall.y, oHall.z, 'landmark');
      addNode('lm_ord_cells', oCells.x, oCells.y, oCells.z, 'landmark');
      addNode('lm_ord_registry', oReg.x, oReg.y, oReg.z, 'landmark');
      addEdge(nearestTerraceNode(oGate.x, oGate.z, 'ter_6_'), 'lm_ord_gate', 'avenue', 8.0);
      addEdge('lm_ord_gate', 'lm_ord_hall', 'corridor', 6.5);
      addEdge('lm_ord_hall', 'lm_ord_cells', 'stair', 5.0);
      addEdge('lm_ord_hall', 'lm_ord_registry', 'stair', 5.0);
    }

    var cider = findLm(plan, 'lm_ciderhall');
    if (cider) {
      var cCrush = lmPt(cider, 0, 0, 0);
      var cVault = lmPt(cider, 0, 0, -5.2);
      var cLoft = lmPt(cider, 14, 0, 5.6);
      addNode('lm_cider_crush', cCrush.x, cCrush.y, cCrush.z, 'cider_hall');
      addNode('lm_cider_vault', cVault.x, cVault.y, cVault.z, 'cider_hall');
      addNode('lm_cider_loft', cLoft.x, cLoft.y, cLoft.z, 'cider_hall');
      addEdge('arc_wheel_S12', 'lm_cider_crush', 'avenue', 9.0);
      addEdge('arc_wheel_S13', 'lm_cider_crush', 'avenue', 9.0);
      addEdge('lm_cider_crush', 'lm_cider_vault', 'stair', 5.5);
      addEdge('lm_cider_crush', 'lm_cider_loft', 'stair', 5.0);
    }

    var gran = findLm(plan, 'lm_tithe_granary');
    if (gran) {
      addNode('lm_tithe_yard', gran.x, gran.y, gran.z, 'landmark');
      addEdge(nearestTerraceNode(gran.x, gran.z, 'ter_7_'), 'lm_tithe_yard', 'avenue', 8.0);
    }
    var term = findLm(plan, 'lm_transit_terminal');
    if (term) {
      addNode('lm_terminal_yard', term.x, term.y, term.z, 'landmark');
      addEdge(nearestTerraceNode(term.x, term.z, 'ter_8_'), 'lm_terminal_yard', 'avenue', 8.0);
    }
    var wharf = findLm(plan, 'lm_river_wharf');
    if (wharf) {
      addNode('lm_wharf_quay', wharf.x, wharf.y, wharf.z, 'wharf');
      addEdge(nearestTerraceNode(wharf.x, wharf.z, 'ter_9_'), 'lm_wharf_quay', 'avenue', 8.0);
    }

    // 8 Surviving Tenders' Ag-Domes (T1..T3) + Ordinator Surveillance Post at Sanctuary Dome III
    for (var dmi = 0; dmi < plan.specimenDomes.length; dmi++) {
      var dm = plan.specimenDomes[dmi];
      var tIdx = dm.terrace === 'T1' ? 'ter_0_' : (dm.terrace === 'T2' ? 'ter_1_' : 'ter_2_');
      var dIn = lmPt(dm, 0, 2, 0.4);
      addNode('node_' + dm.id, dIn.x, dIn.y, dIn.z, 'tender_dome');
      addEdge(nearestTerraceNode(dm.x, dm.z, tIdx), 'node_' + dm.id, 'corridor', 5.0);
      if (dm.id === 'dome_ancient_medical') {
        var oWatch = lmPt(dm, 7.2, 8.2, 0);
        addNode('node_ambersap_watch', oWatch.x, oWatch.y, oWatch.z, 'ordinator_watch');
        addEdge('node_' + dm.id, 'node_ambersap_watch', 'corridor', 4.5);
      }
    }

    // 4. Outside Caravan Road Ports (Voth Tithe Highway SE 142.5 deg, Drum Road SW 232.5 deg, North Ring-Sea Road 97.5 deg)
    var roadPorts = [
      { id: 'port_voth_se', deg: 142.5, r: 1460 },
      { id: 'port_drum_sw', deg: 232.5, r: 1460 },
      { id: 'port_north_sea', deg: 97.5, r: 1460 }
    ];
    for (var rpi = 0; rpi < roadPorts.length; rpi++) {
      var rp = roadPorts[rpi];
      var rpa = rp.deg * DEG;
      var px = rp.r * Math.cos(rpa), pz = rp.r * Math.sin(rpa);
      var py = TORUS.groundAt(px, pz);
      var pNode = 'node_' + rp.id;
      addNode(pNode, px, py, pz, 'port');
      var cRing = nearestTerraceNode(1122 * Math.cos(rpa), 1122 * Math.sin(rpa), 'ter_10_');
      addEdge(cRing, pNode, 'highway', 9.5);
      SIM.port({ id: rp.id, x: +px.toFixed(2), z: +pz.toFixed(2), y: +py.toFixed(2), node: pNode, layer: 'pedestrian', kind: 'road' });
    }

    SIM.nav.layer('pedestrian', {
      nodes: nodes,
      edges: edges,
      yWeight: 1.8,
      cost: { highway: 0.9, avenue: 0.95, street: 1.0, gallery: 1.0, corridor: 1.05, stair: 1.18 },
      speed: { highway: 1.1, avenue: 1.05, street: 1.0, gallery: 1.0, corridor: 0.95, stair: 0.85 }
    });

    // 5. Tors Rivrh Water Layer (bearing 318 deg, centerDist 1095 m)
    var rAng = plan.site.river.bearingDeg * DEG;
    var rDist = plan.site.river.centerDist;
    var rCx = rDist * Math.cos(rAng), rCz = rDist * Math.sin(rAng);
    var tx = -Math.sin(rAng), tz = Math.cos(rAng);
    var wNodes = [
      { id: 'wn_up', x: +(rCx - tx * 1350).toFixed(2), y: -1.2, z: +(rCz - tz * 1350).toFixed(2), tag: 'river' },
      { id: 'wn_mid_up', x: +(rCx - tx * 450).toFixed(2), y: -1.2, z: +(rCz - tz * 450).toFixed(2), tag: 'river' },
      { id: 'wn_wharf', x: +rCx.toFixed(2), y: -1.2, z: +rCz.toFixed(2), tag: 'wharf_water' },
      { id: 'wn_mid_down', x: +(rCx + tx * 450).toFixed(2), y: -1.2, z: +(rCz + tz * 450).toFixed(2), tag: 'river' },
      { id: 'wn_down', x: +(rCx + tx * 1350).toFixed(2), y: -1.2, z: +(rCz + tz * 1350).toFixed(2), tag: 'river' }
    ];
    var wEdges = [
      { id: 'we_0', a: 'wn_up', b: 'wn_mid_up', kind: 'channel', len: 900, w: 36 },
      { id: 'we_1', a: 'wn_mid_up', b: 'wn_wharf', kind: 'channel', len: 450, w: 36 },
      { id: 'we_2', a: 'wn_wharf', b: 'wn_mid_down', kind: 'channel', len: 450, w: 36 },
      { id: 'we_3', a: 'wn_mid_down', b: 'wn_down', kind: 'channel', len: 900, w: 36 }
    ];
    SIM.nav.layer('water', {
      nodes: wNodes,
      edges: wEdges,
      cost: { channel: 1.0 },
      speed: { channel: 1.0 }
    });
    SIM.port({ id: 'port_tors_up', x: wNodes[0].x, z: wNodes[0].z, y: -1.2, node: 'wn_up', layer: 'water', kind: 'river' });
    SIM.port({ id: 'port_tors_down', x: wNodes[4].x, z: wNodes[4].z, y: -1.2, node: 'wn_down', layer: 'water', kind: 'river' });

    return {
      pedestrianNodes: nodes,
      pedestrianEdges: edges,
      nearestTerraceNode: nearestTerraceNode
    };
  }

  function initSim(plan, stage4, clockObj) {
    var SIM = root.SIM;
    if (!SIM) throw new Error('TORUS.initSim: load core/simulation/77-sim-*.js first');

    var simErrors = [];
    SIM.init({
      seed: plan.seed,
      hour: clockObj ? function () { return clockObj.hour; } : function () { return 9.5; },
      day: clockObj ? function () { return clockObj.day == null ? 0 : clockObj.day; } : function () { return 0; },
      t: clockObj ? function () { return clockObj.t == null ? 0 : clockObj.t; } : function () { return 0; },
      err: function (msg) { simErrors.push(msg); }
    });

    // High-scale optimizations for 8,500 residents across 2.2 km terraces & 672 m vertical Forest Ring
    SIM.WAKE = true;
    SIM.LAG = 15;
    SIM.STEP_MAX = 600;
    SIM.REACH = 1450;
    SIM.lazy = { pedestrian: { detour: 1.35 } };

    // 1. Activities
    var ACTS = [
      { id: 'SLEEP', indoor: true },
      { id: 'REST', indoor: true },
      { id: 'IDLE', indoor: false, wander: 2.0 },
      { id: 'WORK', indoor: false, wander: 2.4 },
      { id: 'EAT', indoor: true },
      { id: 'DRINK', indoor: true },
      { id: 'BUY', indoor: false, wander: 1.8 },
      { id: 'TRADE', indoor: false, wander: 2.4 },
      { id: 'WORSHIP', indoor: true },
      { id: 'SOCIALIZE', indoor: false, wander: 2.4 },
      { id: 'PATROL', indoor: false, wander: 4.5 },
      { id: 'GUARD', indoor: false, wander: 1.8 },
      { id: 'WATER', indoor: false, wander: 1.6 },
      { id: 'JAIL', indoor: true },
      { id: 'HARVEST_VINE', indoor: false, wander: 2.0 },
      { id: 'BOARD_ASSIZE', indoor: false, wander: 2.2 },
      { id: 'PREACH_SUN', indoor: false, wander: 3.6 },
      { id: 'AUDIT_AMBERSAP', indoor: false, wander: 2.2 }
    ];
    for (var ai = 0; ai < ACTS.length; ai++) SIM.activity(ACTS[ai]);

    // 2. Factions, Orgs & Chartered Vassal Relations
    SIM.faction({ id: 'rinkvolk_board', name: 'Elected Chairman, Board & Rinkvolk Citizens', culture: 'rinkvolk' });
    SIM.faction({ id: 'tenders_guild', name: 'Senior Tenders of the Plant Lore', culture: 'rinkvolk' });
    SIM.faction({ id: 'voth_embassy', name: 'Imperial Vothic Emissary & Chichani Mission', culture: 'voth' });
    SIM.faction({ id: 'ordinators_torus', name: 'Ordinator Palace Scrutiny Chapter', culture: 'voth' });
    SIM.faction({ id: 'drum_merchants', name: 'Drum Salvage & Alloy Factors', culture: 'vinvolk' });

    SIM.org({ id: 'elected_board', faction: 'rinkvolk_board', kind: 'civic', name: 'Elected Chairman & Board of Torus' });
    SIM.org({ id: 'tenders_chapter', faction: 'tenders_guild', kind: 'guild', name: 'Senior Tenders of the Botanical Sanctuary' });
    SIM.org({ id: 'wheel_cider_guild', faction: 'rinkvolk_board', kind: 'craft', name: 'Outer-Wheel Vine Harvesters & Cider Pressers' });
    SIM.org({ id: 'terrace_growers', faction: 'rinkvolk_board', kind: 'farm', name: 'Ten-Terrace Growers, Orchardists & Artisans' });
    SIM.org({ id: 'rinkvolk_households', faction: 'rinkvolk_board', kind: 'household', name: 'Households of Forest Ring & the Terraces' });
    SIM.org({ id: 'voth_legation', faction: 'voth_embassy', kind: 'civic', name: 'Vothic Emissary Legation & Tithe Granary' });
    SIM.org({ id: 'sun_mission', faction: 'voth_embassy', kind: 'religious', name: 'Tzintzun Sun-Cult Missionary Chapter' });
    SIM.org({ id: 'ordinator_scrutiny', faction: 'ordinators_torus', kind: 'military', name: 'Ordinator Palace Heresy & Amber-Sap Watch' });
    SIM.org({ id: 'voth_tithe_trains', faction: 'voth_embassy', kind: 'merchant', name: 'Imperial Food-Tithe Caravans' });
    SIM.org({ id: 'drum_factors', faction: 'drum_merchants', kind: 'merchant', name: 'Drum Winch-Tool & Alloy Caravans' });
    SIM.org({ id: 'tors_bargemen', faction: 'rinkvolk_board', kind: 'merchant', name: 'Tors Rivrh Grain & Cider Bargemen' });

    SIM.relation({ a: 'rinkvolk_board', b: 'tenders_guild', stance: 'allied', trust: 0.92 });
    SIM.relation({ a: 'tenders_guild', b: 'rinkvolk_board', stance: 'allied', trust: 0.92 });
    SIM.relation({ a: 'rinkvolk_board', b: 'voth_embassy', stance: 'cordial', trust: 0.55 });
    SIM.relation({ a: 'voth_embassy', b: 'rinkvolk_board', stance: 'cordial', trust: 0.55 });
    SIM.relation({ a: 'tenders_guild', b: 'ordinators_torus', stance: 'wary', trust: 0.15 });
    SIM.relation({ a: 'ordinators_torus', b: 'tenders_guild', stance: 'wary', trust: 0.15 });
    SIM.relation({ a: 'voth_embassy', b: 'ordinators_torus', stance: 'allied', trust: 0.86 });
    SIM.relation({ a: 'rinkvolk_board', b: 'drum_merchants', stance: 'friendly', trust: 0.72 });

    // 3. Build 3D Pedestrian + Water Nav Graphs
    var navInfo = buildNavLayers(plan);

    // 4. Economy, Sites, Needs & Items
    SIM.economy({
      every: 30,
      window: 2,
      useShort: true,
      cart: { cap: 240, load: 12, unload: 12, minLoad: 14, near: 4, urgent: 2 },
      meal: { per: 1, foods: ['bread', 'orchard_fruit', 'meat', 'grain'] },
      imports: { days: 3, scan: 60 },
      exports: { minDays: 4, made: true, days: 2 },
      routes: {
        voth_road: { port: 'port_voth_se', minutes: 180 },
        drum_road: { port: 'port_drum_sw', minutes: 165 }
      },
      goods: {
        fruitvine_cluster: { minLoad: 14 },
        cider: { minLoad: 14, export: true },
        grain: { minLoad: 18, export: true },
        bread: { minLoad: 14 },
        orchard_fruit: { minLoad: 12, export: true },
        meat: { minLoad: 10 },
        earth_medicine: { minLoad: 6, export: true },
        mist_tea: { minLoad: 8, export: true },
        cacao: { minLoad: 8, export: true },
        highland_spice: { minLoad: 6, export: true },
        amber_sap: { minLoad: 4, export: true },
        cloth: { minLoad: 10, import: { route: 'voth_road', lot: 160 } },
        tools: { minLoad: 8, import: { route: 'drum_road', lot: 180 } }
      },
      inputs: {
        cider: { fruitvine_cluster: 1 },
        bread: { grain: 1 }
      }
    });

    SIM.site({ id: 'site_wheel_vines', kind: 'orchard', goods: ['fruitvine_cluster'], grade: 'rich', yield: 1.45 });
    SIM.site({ id: 'site_stepped_terraces', kind: 'farm', goods: ['grain', 'orchard_fruit', 'meat'], grade: 'rich', yield: 1.35 });
    SIM.site({ id: 'site_tenders_sanctuary', kind: 'botanical', goods: ['earth_medicine', 'mist_tea', 'cacao', 'highland_spice', 'amber_sap'], grade: 'rich', yield: 1.25 });

    SIM.needs({
      list: ['hunger', 'rest', 'social', 'faith', 'civic', 'material'],
      rate: { hunger: 4.0, rest: 3.5, social: 2.0, faith: 1.1, civic: 1.4, material: 0.8 },
      work: { hunger: 1.15, rest: 1.3 },
      weight: { hunger: 1.5, rest: 1.3, social: 0.9, faith: 0.8, civic: 1.0, material: 0.9 },
      vital: { hunger: 82, rest: 88 },
      fill: {
        SLEEP: { rest: 14.0 },
        REST: { rest: 8.0, social: 2.0 },
        EAT: { hunger: 26.0, social: 4.0 },
        DRINK: { social: 14.0, hunger: 6.0, civic: 3.0 },
        WORSHIP: { faith: 22.0, social: 3.0 },
        PREACH_SUN: { faith: 20.0, social: 8.0 },
        BOARD_ASSIZE: { civic: 24.0, social: 8.0 },
        SOCIALIZE: { social: 15.0, rest: 2.0 },
        BUY: { material: 16.0, social: 3.0 },
        TRADE: { material: 12.0, social: 4.0 }
      },
      free: ['BOARD_ASSIZE', 'PREACH_SUN', 'DRINK', 'SOCIALIZE', 'WORSHIP', 'REST'],
      bands: [
        { label: 'bountiful', min: 75, eff: 1.14 },
        { label: 'content', min: 50, eff: 1.0 },
        { label: 'strained', min: 28, eff: 0.88 },
        { label: 'weary', min: 0, eff: 0.74 }
      ]
    });

    SIM.items({
      kinds: {
        linen_tunic: { cat: 'clothes', slot: 'torso', life: 48, good: 'cloth', per: 1 },
        tether_boots: { cat: 'clothes', slot: 'feet', life: 42, good: 'cloth', per: 1 },
        pruning_hook: { cat: 'tool', slot: 'rhand', workLife: 65, good: 'tools', per: 1 },
        botanical_draught: { cat: 'med', good: 'earth_medicine', per: 1 },
        terrace_loaf: { cat: 'food', food: 'bread', quality: 1.05, good: 'bread', per: 1 },
        ring_fruit: { cat: 'food', food: 'orchard_fruit', quality: 1.1, good: 'orchard_fruit', per: 1 },
        kraal_roast: { cat: 'food', food: 'meat', quality: 1.1, good: 'meat', per: 1 },
        meal: { cat: 'meal' }
      },
      free: ['SOCIALIZE', 'REST', 'DRINK', 'BOARD_ASSIZE', 'PREACH_SUN'],
      eatOut: { base: 0.22, wealth: 0.24 },
      hurt: 0.006,
      heal: 3
    });

    // 5. Places: Forest Ring Arcology (Foot, Barrel, Wheel, 44 Tether Stations, Crown) + Landmarks + 8 Tenders' Domes + 1,803 Terrace Buildings
    var arc = plan.arcology;
    var arcHomePlaces = { wheel: [], crown: [], barrel: [], foot: [] };
    var tetherPlaces = [];
    var ciderPlaces = [];
    var grainPlaces = [];
    var domePlaces = [];
    var warehouses = [];
    var shopsFood = [];
    var shopsGeneral = [];
    var tavernPlaces = [];
    var shrinePlaces = [];
    var artisanPlaces = [];
    var terraceHomes = [];
    var vothHomes = [];

    // 5a. Forest Ring Foot Sectors (550 pop)
    for (var fsi = 0; fsi < arc.tiers[0].sectors.length; fsi++) {
      var fs = arc.tiers[0].sectors[fsi];
      if (fs.state === 'ruined') continue;
      var fPid = 'pl_' + fs.id;
      var isBond = fs.simRole === 'tithe_bond_store';
      var fCap = Math.max(120, fs.pop + 120);
      var fActs = { SLEEP: fCap, REST: fCap, EAT: fCap, WORK: 60, SOCIALIZE: 60 };
      if (isBond) { fActs.TRADE = 80; }
      var fPl = SIM.place({
        id: fPid,
        name: 'Foot Arcade ' + fs.simRole + ' (' + fs.id + ')',
        kind: isBond ? 'warehouse' : 'arcology_home',
        org: isBond ? 'elected_board' : 'rinkvolk_households',
        access: isBond ? 'public' : 'private',
        x: fs.at[0], y: 44.0, z: fs.at[2], r: 12,
        door: { x: fs.at[0], y: 44.0, z: fs.at[2] },
        indoor: true, wander: 2.2,
        activities: fActs
      });
      if (fs.pop > 0) {
        fPl.store = { bread: 600, orchard_fruit: 500, meat: 240 };
        arcHomePlaces.foot.push(fPid);
      }
      if (isBond) warehouses.push(fPid);
    }

    // 5b. Sparse Middle Barrel Waystations (150 pop)
    for (var msi = 0; msi < arc.tiers[1].sectors.length; msi++) {
      var ms = arc.tiers[1].sectors[msi];
      if (ms.state === 'ruined') continue;
      var mPid = 'pl_' + ms.id;
      var mCap = ms.pop + 20;
      var mPl = SIM.place({
        id: mPid,
        name: 'Barrel Waystation ' + ms.simRole + ' (y=' + ms.y + 'm)',
        kind: 'waystation',
        org: 'wheel_cider_guild',
        access: 'public',
        x: ms.at[0], y: ms.at[1], z: ms.at[2], r: 10,
        door: { x: ms.at[0], y: ms.at[1], z: ms.at[2] },
        indoor: true, mess: true, wander: 1.8,
        activities: { SLEEP: mCap, REST: mCap, EAT: mCap, WORK: mCap, SOCIALIZE: 24 }
      });
      mPl.store = { bread: ms.pop * 4, orchard_fruit: ms.pop * 4, meat: ms.pop * 2 };
      arcHomePlaces.barrel.push({ id: mPid, pop: ms.pop });
    }

    // 5c. Suspended Outer Wheel Sectors (1,250 pop at WY=300m) & 44 Rim Tether-Winch Stations
    for (var wsi = 0; wsi < arc.tiers[2].sectors.length; wsi++) {
      var ws = arc.tiers[2].sectors[wsi];
      if (ws.state === 'ruined') continue;
      var wPid = 'pl_' + ws.id;
      var isPress = ws.use === 'industry';
      var wCap = ws.pop + 36;
      var wActs = { SLEEP: wCap, REST: wCap, EAT: wCap, SOCIALIZE: 40 };
      if (isPress) {
        wActs.WORK = 85;
        wActs.DRINK = 60;
        wActs.BUY = 50;
      }
      var wPl = SIM.place({
        id: wPid,
        name: 'Outer Wheel S' + ws.sector + ' (' + ws.simRole + ')',
        kind: isPress ? 'cider_press' : 'arcology_home',
        org: isPress ? 'wheel_cider_guild' : 'rinkvolk_households',
        access: isPress ? 'public' : 'private',
        x: ws.at[0], y: 300.0, z: ws.at[2], r: 12,
        door: { x: ws.at[0], y: 300.0, z: ws.at[2] },
        indoor: !isPress, wander: 2.5,
        activities: wActs
      });
      wPl.store = { bread: ws.pop * 4 + 80, orchard_fruit: ws.pop * 4 + 80, meat: ws.pop * 2 + 40 };
      arcHomePlaces.wheel.push({ id: wPid, pop: ws.pop });
      if (isPress) {
        wPl.mess = true;
        ciderPlaces.push(wPid);
        shopsFood.push(wPid);
      }
    }

    for (var tsi = 0; tsi < arc.tetherStations.length; tsi++) {
      var tst = arc.tetherStations[tsi];
      var tpId = 'pl_' + tst.id;
      SIM.place({
        id: tpId,
        name: 'Wheel Rim Tether Station ' + tst.id + ' (' + tst.rim + ')',
        kind: 'vine_rig',
        org: 'wheel_cider_guild',
        access: 'public',
        x: tst.at[0], y: 300.0, z: tst.at[2], r: 8,
        door: { x: tst.at[0], y: 300.0, z: tst.at[2] },
        indoor: false, wander: 2.2,
        hours: { HARVEST_VINE: [5, 14] },
        activities: { HARVEST_VINE: 28, WORK: 24 }
      });
      tetherPlaces.push({ id: tpId, rim: tst.rim, r: tst.r, deg: tst.deg, station: tst });
    }

    // 5d. Stepped Botanical Crown Sectors (600 pop at y=600..672m)
    for (var csi = 0; csi < arc.tiers[3].sectors.length; csi++) {
      var cs = arc.tiers[3].sectors[csi];
      if (cs.state === 'ruined') continue;
      var cPid = 'pl_' + cs.id;
      var isCrownShrine = cs.use === 'religious';
      var isCrownHome = cs.pop > 0;
      var cKind = isCrownHome ? 'arcology_home' : (isCrownShrine ? 'shrine' : 'farm');
      var cCap = Math.max(60, cs.pop + 40);
      var cActs = {};
      if (isCrownHome) {
        cActs.SLEEP = cCap; cActs.REST = cCap; cActs.EAT = cCap; cActs.SOCIALIZE = 45;
      }
      if (isCrownShrine) {
        cActs.WORSHIP = 85; cActs.PREACH_SUN = 75; cActs.WORK = 24; cActs.SOCIALIZE = 40;
      } else {
        cActs.WORK = 90;
      }
      var cPl = SIM.place({
        id: cPid,
        name: 'Crown ' + cs.simRole + ' (y=' + cs.y + 'm)',
        kind: cKind,
        org: isCrownShrine ? 'sun_mission' : (isCrownHome ? 'rinkvolk_households' : 'terrace_growers'),
        access: isCrownHome ? 'private' : 'public',
        x: cs.at[0], y: cs.at[1], z: cs.at[2], r: 12,
        door: { x: cs.at[0], y: cs.at[1], z: cs.at[2] },
        indoor: isCrownHome || isCrownShrine, wander: 2.5,
        activities: cActs
      });
      if (isCrownHome) {
        cPl.store = { bread: cs.pop * 4, orchard_fruit: cs.pop * 4, meat: cs.pop * 2 };
        arcHomePlaces.crown.push({ id: cPid, pop: cs.pop });
      }
      if (cKind === 'farm') grainPlaces.push(cPid);
      if (isCrownShrine) shrinePlaces.push(cPid);
    }

    // 5e. Hero Landmarks, Jails & 8 Surviving Tenders' Ag-Domes
    var board = findLm(plan, 'lm_boardhall');
    var bVaultPt = lmPt(board, -12, -14, -4.2);
    var boardPl = SIM.place({
      id: 'lm_boardhall', name: board.name, kind: 'civic_hall', org: 'elected_board',
      x: board.x, y: board.y, z: board.z, r: 15, door: { x: board.x, y: board.y, z: board.z },
      indoor: false, mess: true, wander: 3.5,
      activities: { SLEEP: 48, REST: 48, EAT: 90, WORK: 120, BOARD_ASSIZE: 180, GUARD: 36, PATROL: 36, SOCIALIZE: 90 }
    });
    boardPl.store = { bread: 220, orchard_fruit: 220, meat: 120 };
    SIM.place({
      id: 'lm_board_jail', name: 'Board Hall Bailiff Holding Vault', kind: 'jail', org: 'elected_board',
      x: bVaultPt.x, y: bVaultPt.y, z: bVaultPt.z, r: 6, door: bVaultPt, indoor: true,
      activities: { JAIL: 50, GUARD: 18 }
    });

    var emis = findLm(plan, 'lm_emissary');
    var emisPl = SIM.place({
      id: 'lm_emissary', name: emis.name, kind: 'embassy', org: 'voth_legation',
      x: emis.x, y: emis.y, z: emis.z, r: 16, door: { x: emis.x, y: emis.y, z: emis.z },
      indoor: false, mess: true, wander: 4.0,
      activities: { SLEEP: 140, REST: 140, EAT: 140, WORK: 140, BOARD_ASSIZE: 80, TRADE: 120, BUY: 120, GUARD: 40, SOCIALIZE: 100 }
    });
    emisPl.store = { bread: 420, orchard_fruit: 360, meat: 240 };
    warehouses.push('lm_emissary');
    shopsGeneral.push('lm_emissary');

    var emisCloisterPt = lmPt(emis, 28, 8, 0);
    SIM.place({
      id: 'pl_emis_cloister', name: 'Sun-Missionary Cloister of Torus', kind: 'temple', org: 'sun_mission',
      x: emisCloisterPt.x, y: emisCloisterPt.y, z: emisCloisterPt.z, r: 9, door: emisCloisterPt,
      indoor: false, wander: 2.8,
      activities: { WORSHIP: 120, PREACH_SUN: 90, WORK: 36, SOCIALIZE: 50 }
    });
    shrinePlaces.push('pl_emis_cloister');

    var ord = findLm(plan, 'lm_ordinators');
    var oCellPt = lmPt(ord, 12, 8, -4.2);
    var ordPl = SIM.place({
      id: 'lm_ordinators', name: ord.name, kind: 'barracks', org: 'ordinator_scrutiny',
      x: ord.x, y: ord.y, z: ord.z, r: 15, door: { x: ord.x, y: ord.y, z: ord.z },
      indoor: false, mess: true, wander: 3.6,
      activities: { SLEEP: 140, REST: 140, EAT: 140, WORK: 90, PATROL: 90, GUARD: 90, WORSHIP: 110 }
    });
    ordPl.store = { bread: 380, orchard_fruit: 280, meat: 220 };
    SIM.place({
      id: 'lm_ord_jail', name: 'Ordinator Palace Inquisition Cells', kind: 'jail', org: 'ordinator_scrutiny',
      x: oCellPt.x, y: oCellPt.y, z: oCellPt.z, r: 7, door: oCellPt, indoor: true,
      activities: { JAIL: 60, GUARD: 24 }
    });

    var cider = findLm(plan, 'lm_ciderhall');
    var ciderPl = SIM.place({
      id: 'lm_ciderhall', name: cider.name, kind: 'market', org: 'wheel_cider_guild',
      x: cider.x, y: cider.y, z: cider.z, r: 15, door: { x: cider.x, y: cider.y, z: cider.z },
      indoor: false, mess: true, wander: 4.2,
      activities: { SLEEP: 40, REST: 60, EAT: 220, DRINK: 220, WORK: 260, TRADE: 180, BUY: 200, PREACH_SUN: 60, SOCIALIZE: 140 }
    });
    ciderPl.store = { bread: 480, orchard_fruit: 480, meat: 220 };
    warehouses.push('lm_ciderhall');
    ciderPlaces.push('lm_ciderhall');
    tavernPlaces.push('lm_ciderhall');
    shopsFood.push('lm_ciderhall');
    shopsGeneral.push('lm_ciderhall');

    var gran = findLm(plan, 'lm_tithe_granary');
    var granPl = SIM.place({
      id: 'lm_tithe_granary', name: gran.name, kind: 'warehouse', org: 'voth_legation',
      x: gran.x, y: gran.y, z: gran.z, r: 15, door: { x: gran.x, y: gran.y, z: gran.z },
      indoor: false, mess: true, wander: 3.8,
      activities: { SLEEP: 40, REST: 40, EAT: 60, WORK: 120, TRADE: 140, BUY: 120, GUARD: 60, PATROL: 60 }
    });
    granPl.store = { bread: 260, orchard_fruit: 220, meat: 120 };
    warehouses.push('lm_tithe_granary');
    shopsFood.push('lm_tithe_granary');

    var term = findLm(plan, 'lm_transit_terminal');
    var termPl = SIM.place({
      id: 'lm_transit_terminal', name: term.name, kind: 'smithy', org: 'terrace_growers',
      x: term.x, y: term.y, z: term.z, r: 12, door: { x: term.x, y: term.y, z: term.z },
      indoor: false, mess: true, wander: 3.0,
      activities: { SLEEP: 32, REST: 32, EAT: 40, WORK: 70, TRADE: 60, BUY: 60 }
    });
    termPl.store = { bread: 140, orchard_fruit: 120, meat: 60 };
    artisanPlaces.push('lm_transit_terminal');
    shopsGeneral.push('lm_transit_terminal');

    var wharf = findLm(plan, 'lm_river_wharf');
    var wharfPl = SIM.place({
      id: 'lm_river_wharf', name: wharf.name, kind: 'wharf', org: 'tors_bargemen',
      x: wharf.x, y: wharf.y, z: wharf.z, r: 14, door: { x: wharf.x, y: wharf.y, z: wharf.z },
      indoor: false, mess: true, wander: 3.5,
      activities: { SLEEP: 40, REST: 40, EAT: 60, WORK: 110, TRADE: 120, BUY: 100, WATER: 60, GUARD: 30 }
    });
    wharfPl.store = { bread: 220, orchard_fruit: 200, meat: 120 };
    warehouses.push('lm_river_wharf');
    shopsFood.push('lm_river_wharf');

    // 8 Surviving Tenders' Ag-Domes (Earthlike medicines, mist-tea, cacao, highland spice, audited Amber-Sap, fibre/orchard)
    for (var dmi = 0; dmi < plan.specimenDomes.length; dmi++) {
      var dm = plan.specimenDomes[dmi];
      var dmPl = SIM.place({
        id: dm.id, name: dm.name, kind: 'specimen_dome', org: 'tenders_chapter',
        x: dm.x, y: dm.y, z: dm.z, r: 10, door: { x: dm.x, y: dm.y, z: dm.z },
        indoor: false, mess: true, wander: 2.6,
        activities: { SLEEP: 24, REST: 24, EAT: 30, WORK: 48, BUY: 60, TRADE: 40, AUDIT_AMBERSAP: 24 }
      });
      dmPl.store = { bread: 120, orchard_fruit: 140, meat: 60 };
      domePlaces.push(dm.id);
      warehouses.push(dm.id);
      shopsGeneral.push(dm.id);
    }

    // Dedicated Ordinator Watch Post right outside Sanctuary Dome III (Amber-Sap)
    var amberLm = findLm(plan, 'dome_ancient_medical');
    var awPt = lmPt(amberLm, 7.2, 8.2, 0);
    SIM.place({
      id: 'pl_ambersap_watch', name: 'Ordinator Amber-Sap Audit Post', kind: 'amber_watch', org: 'ordinator_scrutiny',
      x: awPt.x, y: awPt.y, z: awPt.z, r: 7, door: awPt,
      indoor: false, wander: 2.2,
      activities: { AUDIT_AMBERSAP: 48, GUARD: 40, PATROL: 40, WORK: 24 }
    });

    // 5f. 1,803 Terrace & SE Scrap Voth Extension Buildings
    var bakeries = [];
    var weavers = [];
    var smithies = [];
    var butcheries = [];
    for (var bi = 0; bi < plan.buildings.length; bi++) {
      var b = plan.buildings[bi];
      var bCap = Math.max(6, b.pop + 6);
      var bActs = {};
      if (b.pop > 0) {
        bActs.SLEEP = bCap;
        bActs.REST = bCap;
        bActs.EAT = bCap;
        bActs.SOCIALIZE = Math.max(6, Math.round(b.pop * 0.5));
      }
      var isTavern = b.types.indexOf('tavern') >= 0 || b.types.indexOf('inn') >= 0;
      var isShop = b.types.indexOf('shop') >= 0 || b.types.indexOf('market') >= 0;
      var isFarm = b.types.indexOf('farm') >= 0;
      var isInd = b.types.indexOf('industry') >= 0;
      var isRel = b.types.indexOf('religious') >= 0 || b.types.indexOf('funerary') >= 0;
      var isMil = b.types.indexOf('military') >= 0;
      var isInfra = b.types.indexOf('infrastructure') >= 0;

      var bKind = 'house';
      var bOrg = b.zone === 'voth_extension' ? 'voth_legation' : 'rinkvolk_households';
      var bIndoor = true;

      if (isTavern) {
        bKind = 'tavern'; bOrg = 'terrace_growers';
        bActs.WORK = 18; bActs.DRINK = 75; bActs.EAT = 75; bActs.BUY = 50; bActs.SOCIALIZE = 65; bActs.PREACH_SUN = 24;
        tavernPlaces.push(b.id);
      } else if (isShop) {
        if (b.job === 'baking') {
          bKind = 'bakery'; bOrg = 'terrace_growers'; bActs.WORK = 16; bActs.BUY = 55;
          bakeries.push(b.id); artisanPlaces.push(b.id); shopsFood.push(b.id);
        } else if (b.job === 'butchery') {
          bKind = 'butcher'; bOrg = 'terrace_growers'; bActs.WORK = 14; bActs.BUY = 45;
          butcheries.push(b.id); artisanPlaces.push(b.id); shopsFood.push(b.id);
        } else if (b.job === 'alchemy' || b.job === 'healing') {
          bKind = 'specimen_dome'; bOrg = 'tenders_chapter'; bActs.WORK = 14; bActs.BUY = 45;
          domePlaces.push(b.id); shopsGeneral.push(b.id);
        } else {
          bKind = 'shop'; bOrg = 'terrace_growers'; bIndoor = false;
          bActs.WORK = 18; bActs.BUY = 65; bActs.TRADE = 45; bActs.PREACH_SUN = 24;
          artisanPlaces.push(b.id); shopsFood.push(b.id); shopsGeneral.push(b.id);
        }
      } else if (isInd) {
        if (b.job === 'warehousing' || b.job === 'milling') {
          bKind = 'warehouse'; bOrg = 'terrace_growers'; bActs.WORK = 22;
          if (warehouses.length < 24) warehouses.push(b.id);
          artisanPlaces.push(b.id);
        } else if (b.job === 'brewing') {
          bKind = 'cider_press'; bOrg = 'wheel_cider_guild'; bActs.WORK = 20;
          ciderPlaces.push(b.id);
        } else if (b.job === 'weaving') {
          bKind = 'weaver'; bOrg = 'terrace_growers'; bActs.WORK = 18; bActs.BUY = 35;
          weavers.push(b.id); artisanPlaces.push(b.id); shopsGeneral.push(b.id);
        } else {
          bKind = 'smithy'; bOrg = 'terrace_growers'; bActs.WORK = 18; bActs.BUY = 35;
          smithies.push(b.id); artisanPlaces.push(b.id); shopsGeneral.push(b.id);
        }
      } else if (isFarm) {
        bKind = 'farm'; bOrg = 'terrace_growers'; bIndoor = false;
        bActs.WORK = 28;
        grainPlaces.push(b.id);
      } else if (isRel) {
        bKind = 'shrine'; bOrg = b.zone === 'voth_extension' ? 'sun_mission' : 'elected_board';
        bActs.WORSHIP = 55; bActs.PREACH_SUN = 45; bActs.WORK = 12; bActs.SOCIALIZE = 30;
        shrinePlaces.push(b.id);
      } else if (isMil) {
        bKind = 'watch'; bOrg = b.zone === 'voth_extension' ? 'ordinator_scrutiny' : 'elected_board'; bIndoor = false;
        bActs.GUARD = 28; bActs.PATROL = 28; bActs.WORK = 18;
      } else if (isInfra) {
        bKind = 'well'; bOrg = 'elected_board'; bIndoor = false;
        bActs.WATER = 40; bActs.WORK = 10;
      } else if (!Object.keys(bActs).length) {
        bActs.WORK = 12; bActs.IDLE = 12;
      }

      var bPl = SIM.place({
        id: b.id,
        name: b.key + ' (' + b.terrace + ')',
        kind: bKind,
        org: bOrg,
        access: bKind === 'house' ? 'private' : 'public',
        x: b.x, y: b.y, z: b.z,
        r: Math.max(3, 0.35 * Math.min(b.w, b.d)),
        door: { x: b.x, y: b.y, z: b.z },
        indoor: bIndoor,
        wander: bIndoor ? 1.4 : 2.8,
        activities: bActs
      });

      if (b.pop > 0) {
        bPl.store = { bread: b.pop * 4, orchard_fruit: b.pop * 4, meat: b.pop * 2 };
        if (bKind === 'tavern' || bKind === 'watch') bPl.mess = true;
        if (b.zone === 'voth_extension') vothHomes.push({ id: b.id, pop: b.pop });
        else terraceHomes.push({ id: b.id, pop: b.pop });
      }
    }

    // 6. Wire Economy Warehouses, Producer Recipes & Shops
    for (var wi2 = 0; wi2 < warehouses.length; wi2++) {
      var wid = warehouses[wi2];
      var wStore = SIM.store(wid, { kind: 'warehouse', cap: 7500 });
      if (wStore && wi2 < 14) {
        wStore.stock.fruitvine_cluster = 260;
        wStore.stock.cider = 420;
        wStore.stock.grain = 520;
        wStore.stock.bread = 460;
        wStore.stock.orchard_fruit = 380;
        wStore.stock.meat = 260;
        wStore.stock.earth_medicine = 95;
        wStore.stock.mist_tea = 110;
        wStore.stock.cacao = 95;
        wStore.stock.highland_spice = 85;
        wStore.stock.amber_sap = 24;
        wStore.stock.cloth = 220;
        wStore.stock.tools = 190;
      }
    }

    // 44 Wheel-Rim Tether Stations harvest Hanging Fruitvines
    for (var tri = 0; tri < tetherPlaces.length; tri++) {
      SIM.recipe(tetherPlaces[tri].id, { out: ['fruitvine_cluster'], rate: 3.4, cap: 420, site: 'site_wheel_vines' });
    }
    // Great Cider-Press & Wheel/Terrace Cider Presses
    for (var cpi = 0; cpi < Math.min(24, ciderPlaces.length); cpi++) {
      SIM.recipe(ciderPlaces[cpi], { out: ['cider'], rate: cpi === 0 ? 5.2 : 3.2, cap: cpi === 0 ? 1200 : 480 });
    }
    // 8 Surviving Tenders' Ag-Domes (bespoke out-of-zone & medical crops)
    for (var dmi2 = 0; dmi2 < plan.specimenDomes.length; dmi2++) {
      var dm2 = plan.specimenDomes[dmi2];
      var dmOut = ['earth_medicine'];
      var dmRate = 1.8;
      if (dm2.id === 'dome_ancient_medical') { dmOut = ['amber_sap', 'earth_medicine']; dmRate = 1.1; }
      else if (dm2.category === 'tea') { dmOut = ['mist_tea']; dmRate = 2.0; }
      else if (dm2.category === 'cacao') { dmOut = ['cacao']; dmRate = 1.9; }
      else if (dm2.category === 'highland_spice') { dmOut = ['highland_spice']; dmRate = 1.8; }
      else if (dm2.id === 'dome_fibre_latex') { dmOut = ['cloth']; dmRate = 2.4; }
      else if (dm2.id === 'dome_dryland_orchard') { dmOut = ['orchard_fruit']; dmRate = 2.6; }
      SIM.recipe(dm2.id, { out: dmOut, rate: dmRate, cap: 450, site: 'site_tenders_sanctuary' });
    }
    // Terrace farms, bakeries, butcheries, weavers & smithies
    for (var gpi = 0; gpi < Math.min(48, grainPlaces.length); gpi++) {
      var gOut = gpi % 3 === 0 ? ['orchard_fruit', 'grain'] : (gpi % 5 === 0 ? ['meat', 'grain'] : ['grain']);
      SIM.recipe(grainPlaces[gpi], { out: gOut, rate: 3.2, cap: 460, site: 'site_stepped_terraces' });
    }
    for (var bki = 0; bki < Math.min(28, bakeries.length); bki++) SIM.recipe(bakeries[bki], { out: ['bread'], rate: 3.6, cap: 380 });
    for (var bui = 0; bui < Math.min(18, butcheries.length); bui++) SIM.recipe(butcheries[bui], { out: ['meat'], rate: 2.6, cap: 320, site: 'site_stepped_terraces' });
    for (var wvi = 0; wvi < Math.min(18, weavers.length); wvi++) SIM.recipe(weavers[wvi], { out: ['cloth'], rate: 2.5, cap: 320 });
    SIM.recipe('lm_transit_terminal', { out: ['tools'], rate: 2.8, cap: 420 });
    for (var smi = 0; smi < Math.min(18, smithies.length); smi++) SIM.recipe(smithies[smi], { out: ['tools'], rate: 2.3, cap: 320 });

    for (var sfi = 0; sfi < Math.min(60, shopsFood.length); sfi++) {
      SIM.shop(shopsFood[sfi], ['terrace_loaf', 'ring_fruit', 'kraal_roast']);
    }
    for (var sgi = 0; sgi < Math.min(60, shopsGeneral.length); sgi++) {
      SIM.shop(shopsGeneral[sgi], ['linen_tunic', 'tether_boots', 'pruning_hook', 'botanical_draught']);
    }
    for (var tvi = 0; tvi < Math.min(40, tavernPlaces.length); tvi++) {
      SIM.shop(tavernPlaces[tvi], ['meal', 'terrace_loaf', 'ring_fruit']);
    }

    // 7. Roles & Hourly Schedules
    var HOME_PREF = { SLEEP: { pin: 'home' }, REST: { pin: 'home' } };
    function rolePrefs(workKinds) {
      return {
        SLEEP: { pin: 'home' },
        REST: { pin: 'home' },
        WORK: { pin: 'work', kinds: workKinds },
        EAT: { pin: 'home' },
        DRINK: { kinds: ['tavern', 'market', 'cider_press'], spread: 4 },
        WORSHIP: { kinds: ['temple', 'shrine'], spread: 3 },
        BUY: { kinds: ['market', 'shop', 'bakery', 'butcher', 'smithy', 'specimen_dome'], spread: 4 },
        SOCIALIZE: { kinds: ['market', 'tavern', 'civic_hall', 'shrine'], spread: 4 }
      };
    }

    SIM.role({
      id: 'vine_harvester', org: 'wheel_cider_guild', name: 'Tethered Fruitvine Harvester',
      needs: { labour: 0.85 },
      sched: [[0, 'SLEEP'], [5, 'EAT'], [6, 'HARVEST_VINE'], [13, 'EAT'], [14, 'WORK'], [18, 'DRINK'], [20, 'REST'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        HARVEST_VINE: { pin: 'work', kinds: ['vine_rig'] },
        WORK: { ids: ['lm_ciderhall'], kinds: ['cider_press', 'vine_rig'], spread: 4 },
        DRINK: { kinds: ['market', 'tavern', 'cider_press'], spread: 4 }
      }
    });
    SIM.role({
      id: 'cider_brewer', org: 'wheel_cider_guild', name: 'Forest-Ring Cider Brewer',
      needs: { labour: 0.65 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [19, 'DRINK'], [21, 'SLEEP']],
      prefers: rolePrefs(['cider_press', 'market'])
    });
    SIM.role({
      id: 'tender_keeper', org: 'tenders_chapter', name: 'Senior Tender of the Plant Lore',
      needs: { labour: 0.45 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [11, 'BOARD_ASSIZE'], [14, 'WORK'], [18, 'EAT'], [20, 'REST'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        WORK: { pin: 'work', kinds: ['specimen_dome'] },
        BOARD_ASSIZE: { ids: ['lm_boardhall'] },
        BUY: { kinds: ['specimen_dome', 'market', 'shop'], spread: 4 }
      }
    });
    SIM.role({
      id: 'board_magistrate', org: 'elected_board', name: 'Elected Rinkvolk Board Magistrate',
      needs: { labour: 0.25 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'WORK'], [9, 'BOARD_ASSIZE'], [16, 'EAT'], [17, 'SOCIALIZE'], [20, 'REST'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        WORK: { ids: ['lm_boardhall'] },
        BOARD_ASSIZE: { ids: ['lm_boardhall'] },
        SOCIALIZE: { ids: ['lm_boardhall', 'lm_emissary'], kinds: ['tavern'], spread: 3 }
      }
    });
    SIM.role({
      id: 'voth_envoy', org: 'voth_legation', name: 'Vothic Emissary Legate & Chichani Factor',
      needs: { labour: 0.30 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'WORK'], [11, 'BOARD_ASSIZE'], [14, 'WORK'], [18, 'EAT'], [19, 'SOCIALIZE'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        WORK: { ids: ['lm_emissary', 'lm_tithe_granary'] },
        BOARD_ASSIZE: { ids: ['lm_boardhall', 'lm_emissary'] },
        SOCIALIZE: { ids: ['lm_emissary'], kinds: ['tavern'], spread: 3 }
      }
    });
    SIM.role({
      id: 'sun_missionary', org: 'sun_mission', name: 'Tzintzun Sun-Cult Missionary',
      needs: { labour: 0.30 },
      cycle: { PREACH_SUN: 45 },
      sched: [[0, 'SLEEP'], [6, 'WORSHIP'], [8, 'PREACH_SUN'], [13, 'EAT'], [14, 'PREACH_SUN'], [18, 'WORSHIP'], [20, 'REST'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        WORSHIP: { ids: ['pl_emis_cloister'], kinds: ['temple', 'shrine'], spread: 3 },
        PREACH_SUN: { kinds: ['shrine', 'temple', 'market', 'tavern', 'shop'], spread: 6, reach: 1450 }
      }
    });
    SIM.role({
      id: 'ordinator_inquisitor', org: 'ordinator_scrutiny', name: 'Ordinator Scrutiny & Amber-Sap Auditor',
      needs: { labour: 0.40 },
      cycle: { PATROL: 40 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'AUDIT_AMBERSAP'], [12, 'EAT'], [13, 'PATROL'], [18, 'WORSHIP'], [20, 'GUARD'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        AUDIT_AMBERSAP: { ids: ['pl_ambersap_watch', 'dome_ancient_medical'] },
        PATROL: { kinds: ['barracks', 'watch', 'amber_watch', 'specimen_dome', 'jail'], spread: 6 },
        GUARD: { kinds: ['barracks', 'amber_watch', 'jail'], spread: 4 },
        WORSHIP: { ids: ['lm_ordinators', 'pl_emis_cloister'], kinds: ['temple', 'shrine'], spread: 2 }
      }
    });
    SIM.role({
      id: 'rinkvolk_bailiff', org: 'elected_board', name: 'Rinkvolk Assize Bailiff & Gate Warden',
      needs: { labour: 0.50 },
      cycle: { PATROL: 40 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'PATROL'], [13, 'EAT'], [14, 'GUARD'], [19, 'DRINK'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        PATROL: { kinds: ['civic_hall', 'watch', 'warehouse', 'wharf', 'market'], spread: 6 },
        GUARD: { kinds: ['civic_hall', 'watch', 'warehouse', 'jail'], spread: 5 },
        DRINK: { kinds: ['tavern'], spread: 4 }
      }
    });
    SIM.role({
      id: 'hoist_rigger', org: 'wheel_cider_guild', name: 'Atrium Hoist & Barrel Rigger',
      needs: { labour: 0.70 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [13, 'EAT'], [14, 'WORK'], [19, 'REST'], [21, 'SLEEP']],
      prefers: rolePrefs(['waystation', 'cider_press'])
    });
    SIM.role({
      id: 'porter_cartman', org: 'terrace_growers', name: 'Tithe & Cider Haul-Cartman',
      needs: { labour: 0.80 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'DRINK'], [20, 'REST'], [22, 'SLEEP']],
      prefers: rolePrefs(['warehouse', 'wharf', 'market'])
    });
    SIM.role({
      id: 'terrace_farmer', org: 'terrace_growers', name: 'Stepped-Terrace Grower & Orchardist',
      needs: { labour: 0.70 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'SOCIALIZE'], [20, 'REST'], [21, 'SLEEP']],
      prefers: rolePrefs(['farm'])
    });
    SIM.role({
      id: 'terrace_artisan', org: 'terrace_growers', name: 'Terrace Baker, Cooper & Weaver',
      needs: { labour: 0.65 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'BUY'], [20, 'REST'], [21, 'SLEEP']],
      prefers: rolePrefs(['bakery', 'butcher', 'smithy', 'weaver', 'shop', 'warehouse'])
    });
    SIM.role({
      id: 'rinkvolk_citizen', org: 'rinkvolk_households', name: 'Rinkvolk Citizen & Household Kin',
      needs: { labour: 0.35 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'BUY'], [10, 'SOCIALIZE'], [13, 'EAT'], [15, 'SOCIALIZE'], [18, 'DRINK'], [20, 'REST'], [21, 'SLEEP']],
      prefers: rolePrefs(['market', 'shop', 'tavern'])
    });

    // Visitor roles for Caravans & Tors Rivrh Barges
    SIM.role({
      id: 'voth_tithe_guard', org: 'voth_tithe_trains', name: 'Imperial Food-Tithe Caravan Guard',
      mode: 'ride', speed: SIM.SPEED.ride,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });
    SIM.role({
      id: 'drum_tool_factor', org: 'drum_factors', name: 'Drum Alloy & Winch-Tool Factor',
      mode: 'walk', speed: SIM.SPEED.walk,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });
    SIM.role({
      id: 'tors_barge_crew', org: 'tors_bargemen', name: 'Tors Rivrh Grain & Cider Bargeman',
      layer: 'water', mode: 'boat', speed: SIM.SPEED.boat,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });

    // 8. Spawn Exact 8,500 Permanent Residents (2,550 in Forest Ring + 5,950 on Terraces & SE Extension)
    var arcologyCount = 0;
    var terraceCount = 0;
    var vineHarvesters = [];
    var vineHarvesterIds = [];
    var boardMembers = [];
    var sunMissionaries = [];
    var amberAuditors = [];
    var cartDrivers = [];

    function spawnResident(id, role, homeId, workId, faction, culture, wealth, zone, issued) {
      var a = SIM.actor({
        id: id,
        role: role,
        home: homeId,
        work: workId,
        culture: culture,
        wealth: wealth,
        issued: !!issued,
        zone: zone,
        resident: true
      });
      a.faction = faction;
      if (!issued) {
        a.wears = ['linen_tunic', 'tether_boots'];
        a.sets = 1;
      }
      return a;
    }

    // 8a. Forest Ring Arcology: 1,250 Wheel + 600 Crown + 150 Barrel + 550 Foot = 2,550 exact!
    var wCursor = 0;
    for (var wi3 = 0; wi3 < arcHomePlaces.wheel.length && wCursor < 1250; wi3++) {
      var wh = arcHomePlaces.wheel[wi3];
      for (var wp = 0; wp < wh.pop && wCursor < 1250; wp++) {
        var isVine = wCursor < 360;
        var aidW = isVine ? ('arc_vine_' + wCursor) : ('arc_w_' + wCursor);
        var wRole = 'rinkvolk_citizen';
        var wWork = null;
        if (isVine) {
          wRole = 'vine_harvester';
          wWork = tetherPlaces[wCursor % tetherPlaces.length].id;
        } else if (wCursor < 660) {
          wRole = 'cider_brewer';
          wWork = wCursor % 2 === 0 ? 'lm_ciderhall' : ciderPlaces[wCursor % ciderPlaces.length];
        }
        var awRec = spawnResident(aidW, wRole, wh.id, wWork, 'rinkvolk_board', 'rinkvolk', 0.56, 'arcology', false);
        if (isVine) {
          vineHarvesters.push(awRec);
          vineHarvesterIds.push(aidW);
        }
        wCursor++;
        arcologyCount++;
      }
    }

    var cCursor = 0;
    for (var ci2 = 0; ci2 < arcHomePlaces.crown.length && cCursor < 600; ci2++) {
      var ch = arcHomePlaces.crown[ci2];
      for (var cp = 0; cp < ch.pop && cCursor < 600; cp++) {
        var aidC = 'arc_c_' + cCursor;
        var cRole = cCursor < 90 ? 'tender_keeper' : (cCursor < 380 ? 'terrace_farmer' : 'rinkvolk_citizen');
        var cWork = cCursor < 90 ? plan.specimenDomes[cCursor % plan.specimenDomes.length].id : (cCursor < 380 ? 'pl_arc_crown_t1_orchard' : null);
        var cFac = cCursor < 90 ? 'tenders_guild' : 'rinkvolk_board';
        var acRec = spawnResident(aidC, cRole, ch.id, cWork, cFac, 'rinkvolk', 0.62, 'arcology', false);
        if (cCursor < 30) boardMembers.push(acRec);
        cCursor++;
        arcologyCount++;
      }
    }

    var bCursor = 0;
    for (var bi2 = 0; bi2 < arcHomePlaces.barrel.length && bCursor < 150; bi2++) {
      var bh = arcHomePlaces.barrel[bi2];
      for (var bp = 0; bp < bh.pop && bCursor < 150; bp++) {
        spawnResident('arc_b_' + bCursor, 'hoist_rigger', bh.id, bh.id, 'rinkvolk_board', 'rinkvolk', 0.48, 'arcology', false);
        bCursor++;
        arcologyCount++;
      }
    }

    for (var fi2 = 0; fi2 < 550; fi2++) {
      var fhId = arcHomePlaces.foot[fi2 % arcHomePlaces.foot.length];
      var fRole = fi2 < 120 ? 'porter_cartman' : (fi2 < 320 ? 'terrace_farmer' : 'rinkvolk_citizen');
      var fWork = fi2 < 120 ? warehouses[fi2 % warehouses.length] : (fi2 < 320 ? grainPlaces[fi2 % grainPlaces.length] : null);
      var afRec = spawnResident('arc_f_' + fi2, fRole, fhId, fWork, 'rinkvolk_board', 'rinkvolk', 0.46, 'arcology', false);
      if (fRole === 'porter_cartman' && cartDrivers.length < 10) cartDrivers.push(afRec);
      arcologyCount++;
    }

    // 8b. Terraces & SE Scrap Voth Extension: exact 5,950 residents!
    for (var bm = 0; bm < 28; bm++) {
      var bmRec = spawnResident('ter_board_' + bm, 'board_magistrate', 'lm_boardhall', 'lm_boardhall', 'rinkvolk_board', 'rinkvolk', 0.82, 'terraces', true);
      boardMembers.push(bmRec);
      terraceCount++;
    }
    for (var em = 0; em < 96; em++) {
      var isSun = em < 36;
      var emRole = isSun ? 'sun_missionary' : 'voth_envoy';
      var emWork = isSun ? shrinePlaces[em % shrinePlaces.length] : 'lm_emissary';
      var emRec = spawnResident('ter_emis_' + em, emRole, 'lm_emissary', emWork, 'voth_embassy', 'voth', 0.76, 'terraces', true);
      if (isSun) sunMissionaries.push(emRec);
      else if (em < 56) boardMembers.push(emRec);
      terraceCount++;
    }
    for (var or = 0; or < 88; or++) {
      var isAmberWatch = or < 32;
      var orWork = isAmberWatch ? 'pl_ambersap_watch' : 'lm_ordinators';
      var orRec = spawnResident('ter_ord_' + or, 'ordinator_inquisitor', 'lm_ordinators', orWork, 'ordinators_torus', 'voth', 0.74, 'terraces', true);
      if (isAmberWatch) amberAuditors.push(orRec);
      terraceCount++;
    }
    for (var td = 0; td < 32; td++) {
      var dmHome = plan.specimenDomes[td % plan.specimenDomes.length].id;
      var tdRec = spawnResident('ter_dome_' + td, 'tender_keeper', dmHome, dmHome, 'tenders_guild', 'rinkvolk', 0.72, 'terraces', true);
      boardMembers.push(tdRec);
      terraceCount++;
    }
    for (var gw = 0; gw < 50; gw++) {
      var gwHome = gw < 18 ? 'lm_tithe_granary' : (gw < 30 ? 'lm_transit_terminal' : 'lm_river_wharf');
      var gwRole = (gw >= 18 && gw < 30) ? 'terrace_artisan' : 'porter_cartman';
      var gwRec = spawnResident('ter_inf_' + gw, gwRole, gwHome, gwHome, 'rinkvolk_board', 'rinkvolk', 0.50, 'terraces', false);
      if (gwRole === 'porter_cartman' && cartDrivers.length < 16) cartDrivers.push(gwRec);
      terraceCount++;
    }

    var allOuterHomes = vothHomes.concat(terraceHomes);
    var ohIdx = 0;
    while (terraceCount < 5950) {
      var hSlot = allOuterHomes[ohIdx % allOuterHomes.length];
      var isVothHome = ohIdx < vothHomes.length * 2 && hSlot.id && SIM.R.place[hSlot.id] && SIM.R.place[hSlot.id].org === 'voth_legation';
      var tid = 'ter_cit_' + terraceCount;
      var tRole = 'rinkvolk_citizen';
      var tWork = null;
      var tFac = isVothHome ? 'voth_embassy' : 'rinkvolk_board';
      var tCul = isVothHome ? 'voth' : 'rinkvolk';

      var mod = terraceCount % 20;
      if (isVothHome) {
        if (mod === 0 || mod === 1) {
          tRole = 'sun_missionary';
          tWork = shrinePlaces[terraceCount % shrinePlaces.length];
        } else if (mod <= 4) {
          tRole = 'voth_envoy';
          tWork = 'lm_emissary';
        } else if (mod <= 7) {
          tRole = 'rinkvolk_bailiff';
          tWork = 'lm_tithe_granary';
        } else if (mod <= 14) {
          tRole = 'terrace_artisan';
          tWork = artisanPlaces[terraceCount % artisanPlaces.length];
        }
      } else {
        if (mod === 0) {
          tRole = 'tender_keeper';
          tWork = domePlaces[terraceCount % domePlaces.length];
          tFac = 'tenders_guild';
        } else if (mod === 1) {
          tRole = 'rinkvolk_bailiff';
          tWork = 'lm_boardhall';
        } else if (mod <= 4) {
          tRole = 'cider_brewer';
          tWork = ciderPlaces[terraceCount % ciderPlaces.length];
        } else if (mod <= 7) {
          tRole = 'terrace_artisan';
          tWork = artisanPlaces[terraceCount % artisanPlaces.length];
        } else if (mod === 8) {
          tRole = 'porter_cartman';
          tWork = warehouses[terraceCount % warehouses.length];
        } else if (mod <= 15) {
          tRole = 'terrace_farmer';
          tWork = grainPlaces[terraceCount % grainPlaces.length];
        }
      }

      var tcRec = spawnResident(tid, tRole, hSlot.id, tWork, tFac, tCul, isVothHome ? 0.64 : 0.48, 'terraces', false);
      if (tRole === 'sun_missionary') sunMissionaries.push(tcRec);
      else if (tRole === 'porter_cartman' && cartDrivers.length < 16) cartDrivers.push(tcRec);
      terraceCount++;
      ohIdx++;
    }

    // Bind 14 Economy Haul Carts
    for (var cdi = 0; cdi < Math.min(14, cartDrivers.length); cdi++) {
      SIM.cart(cartDrivers[cdi]);
    }

    // 9. Outside Trade Caravans & Tors Rivrh Barges
    SIM.event({
      id: 'ev_voth_tithe_caravan',
      kind: 'caravan',
      org: 'voth_tithe_trains',
      every: [2, 4],
      window: [6, 19],
      from: ['port_voth_se'],
      to: ['port_voth_se'],
      size: [2, 4],
      unit: [{ role: 'voth_tithe_guard', n: 3 }],
      layer: 'pedestrian',
      mode: 'ride',
      speed: SIM.SPEED.ride,
      beasts: 'pack_beetle',
      legs: [
        { activity: 'TRADE', mins: 35, kinds: ['warehouse', 'embassy'] },
        { activity: 'GUARD', mins: 20, kinds: ['embassy'] }
      ]
    });

    SIM.event({
      id: 'ev_drum_tool_caravan',
      kind: 'caravan',
      org: 'drum_factors',
      every: [3, 5],
      window: [7, 18],
      from: ['port_drum_sw', 'port_north_sea'],
      to: 'other',
      size: [2, 3],
      unit: [{ role: 'drum_tool_factor', n: 3 }],
      layer: 'pedestrian',
      mode: 'walk',
      speed: SIM.SPEED.walk,
      beasts: 'pack_beetle',
      legs: [
        { activity: 'WATER', mins: 15, kinds: ['wharf', 'well'] },
        { activity: 'TRADE', mins: 40, kinds: ['market', 'smithy'] }
      ]
    });

    SIM.event({
      id: 'ev_tors_river_barge',
      kind: 'barge',
      org: 'tors_bargemen',
      every: [2, 4],
      window: [6, 20],
      from: ['port_tors_up'],
      to: ['port_tors_down'],
      size: [1, 2],
      unit: [{ role: 'tors_barge_crew', n: 2 }],
      layer: 'water',
      mode: 'boat',
      speed: SIM.SPEED.boat,
      legs: [
        { activity: 'TRADE', mins: 30, kinds: ['wharf'] }
      ]
    });

    // 10. Crime & Dual Bailiff / Ordinator Surveillance
    SIM.crime({
      seed: plan.seed ^ 0x3b7d,
      share: 0.0012,
      guard: function (a) { return a.role === 'rinkvolk_bailiff' || a.role === 'ordinator_inquisitor'; },
      jails: ['jail'],
      guardActs: ['PATROL', 'GUARD', 'AUDIT_AMBERSAP'],
      crimes: {
        pickpocket: { acts: ['BUY', 'TRADE', 'SOCIALIZE', 'PREACH_SUN'], at: ['market', 'shop', 'tavern'], hours: [8, 20], chance: 0.16, loss: 10, gain: 14 },
        burglary: { hours: [23, 4], chance: 0.08, share: 0.12 },
        assault: { below: 28, acts: ['DRINK'], chance: 0.03 }
      },
      seen: { base: 0.32, perWitness: 0.05, guard: 0.48, night: 0.42, max: 0.94, nightHours: [21, 5] },
      arrest: { reach: 200, base: 0.84, ratio: 0.02, respond: 20 },
      jail: { act: 'JAIL', days: 2, resist: 0.18, resistDays: 5, lieLow: 2 },
      guild: { kinds: ['tavern'], hideReach: 240, hideMins: 60, abstractHide: 0.4, items: 1, fence: { acts: ['DRINK', 'SOCIALIZE'], mins: 20, perServing: 3, perItem: 10 } }
    });

    // 11. Live Step Hook: Dawn-to-Midday (06:00-13:00) Tethered Fruitvine Harvest, Board Assize, Sun Missionaries & Amber-Sap Audit
    var state = {
      arcologyResidents: arcologyCount,
      terraceResidents: terraceCount,
      totalResidents: arcologyCount + terraceCount,
      carts: SIM.ECON ? SIM.ECON.carts.length : 0,
      harvestActive: false,
      activeVineHarvesters: 0,
      activeCiderPressers: 0,
      activeBoardMembers: 0,
      activeSunMissionaries: 0,
      activeAmberAuditors: 0,
      tetherPlaces: tetherPlaces,
      vineHarvesterIds: vineHarvesterIds,
      errors: simErrors
    };

    function torusHarvestAndAssizeHook(minute) {
      var mDay = ((minute % 1440) + 1440) % 1440;
      var h = mDay / 60;

      // Dawn-to-midday (05:30-13:00): command tethered harvesters onto all 44 Wheel-rim winch rigs
      if (h >= 5.5 && h < 13.2 && mDay % 30 === 0) {
        var wave = Math.floor(minute / 30);
        var nCmd = Math.min(220, vineHarvesters.length);
        for (var vi = 0; vi < nCmd; vi++) {
          var vAct = vineHarvesters[(wave * 19 + vi) % vineHarvesters.length];
          SIM.command(vAct, { act: 'HARVEST_VINE', place: vAct.work, mins: 29, by: 'wheel_winch_bell' });
        }
      }

      // Elected Board & Chairman Assize (09:00-15:30)
      if (h >= 9.0 && h < 15.5 && mDay % 60 === 0) {
        var bWave = Math.floor(minute / 60);
        for (var bi3 = 0; bi3 < Math.min(48, boardMembers.length); bi3++) {
          var bAct = boardMembers[(bWave * 11 + bi3) % boardMembers.length];
          SIM.command(bAct, { act: 'BOARD_ASSIZE', place: 'lm_boardhall', mins: 58, by: 'board_gavel' });
        }
      }

      // Ordinator Amber-Sap Surveillance shift (06:30-18:30)
      if (h >= 6.5 && h < 18.5 && mDay % 60 === 0) {
        for (var ai2 = 0; ai2 < Math.min(20, amberAuditors.length); ai2++) {
          SIM.command(amberAuditors[ai2], { act: 'AUDIT_AMBERSAP', place: 'pl_ambersap_watch', mins: 58, by: 'scrutiny_seal' });
        }
      }
    }

    SIM.stepHooks = [torusHarvestAndAssizeHook];

    SIM.normalize();
    var problems = SIM.check();
    SIM.jump();
    torusHarvestAndAssizeHook(SIM.minute());
    if (SIM.R.event.ev_voth_tithe_caravan) SIM.fire(SIM.R.event.ev_voth_tithe_caravan, SIM.minute(), SIM.time());
    if (SIM.R.event.ev_tors_river_barge) SIM.fire(SIM.R.event.ev_tors_river_barge, SIM.minute(), SIM.time());
    SIM.step();

    function refreshActivityCounts() {
      var hr = SIM.hour();
      state.harvestActive = (hr >= 5.5 && hr < 13.2);
      var vh = 0, cp = 0, bm = 0, sm = 0, aa = 0;
      for (var ti = 0; ti < tetherPlaces.length; ti++) {
        var tp = SIM.R.place[tetherPlaces[ti].id];
        if (tp && tp.occ) vh += (tp.occ.HARVEST_VINE == null ? 0 : tp.occ.HARVEST_VINE) + (tp.occ.WORK == null ? 0 : tp.occ.WORK);
      }
      var cHall = SIM.R.place.lm_ciderhall;
      if (cHall && cHall.occ) cp = (cHall.occ.WORK == null ? 0 : cHall.occ.WORK);
      var bHall = SIM.R.place.lm_boardhall;
      if (bHall && bHall.occ) bm = (bHall.occ.BOARD_ASSIZE == null ? 0 : bHall.occ.BOARD_ASSIZE) + (bHall.occ.WORK == null ? 0 : bHall.occ.WORK);
      var awPl = SIM.R.place.pl_ambersap_watch;
      if (awPl && awPl.occ) aa = (awPl.occ.AUDIT_AMBERSAP == null ? 0 : awPl.occ.AUDIT_AMBERSAP) + (awPl.occ.GUARD == null ? 0 : awPl.occ.GUARD);
      for (var si2 = 0; si2 < sunMissionaries.length; si2++) {
        var sma = sunMissionaries[si2];
        if (sma.act === 'PREACH_SUN' || sma.act === 'WORSHIP') sm++;
      }
      state.activeVineHarvesters = vh;
      state.activeCiderPressers = cp;
      state.activeBoardMembers = bm;
      state.activeSunMissionaries = sm;
      state.activeAmberAuditors = aa;
      return state;
    }

    refreshActivityCounts();
    state.problems = problems;
    state.refreshActivityCounts = refreshActivityCounts;
    return state;
  }

  TORUS.initSim = initSim;
})(typeof window !== 'undefined' ? window : globalThis);
