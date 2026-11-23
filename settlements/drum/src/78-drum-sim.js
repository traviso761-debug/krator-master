// ================================================================= DRUM — 78: Stage 5 World Simulation ([G data])
// Wires core/simulation (77-sim-*.js) for Drum (Drim / Vinvolk):
//   - 13,500 permanent residents: exact 5,400 in Drum Arcology Levels 1-15 + 8,100 in outer concentric rings & fortresses
//   - Connected 3D pedestrian graph (radial spokes, concentric rings, 15 arcology levels via 4 Fin stairs, landmarks, ports)
//   - SIM.economy + SIM.needs + SIM.items + SIM.crime: Ruin Quarry & Under-Drum Salvage Bourse alloy/copper/parts extraction,
//     Mushroom Vat Vaults, Regional Scrap-Market trade, Voth/Torus caravans, Drim Rivrh barges, and Voth alloy tribute
//   - Noon-to-sundown (12:00-18:00) Gladiatorial Arena bouts in The Cauldron + Garrison Levy & Assimilation Hall oaths.
// Zero THREE, zero DOM.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});
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

    // 1. Concentric ring & radial spoke network (24 spokes every 15 deg x 7 rings)
    var RINGS = [216, 286, 354, 412, 482, 560, 646];
    var SPOKES = 24;
    for (var ri = 0; ri < RINGS.length; ri++) {
      var rr = RINGS[ri];
      for (var si = 0; si < SPOKES; si++) {
        var deg = 5 + si * 15;
        var rad = deg * DEG;
        var nid = 'ring_' + ri + '_s' + si;
        addNode(nid, rr * Math.cos(rad), 0, rr * Math.sin(rad), 'street');
      }
      for (var si2 = 0; si2 < SPOKES; si2++) {
        var nextS = (si2 + 1) % SPOKES;
        addEdge('ring_' + ri + '_s' + si2, 'ring_' + ri + '_s' + nextS, 'street', 8.5);
      }
    }
    for (var ri2 = 0; ri2 < RINGS.length - 1; ri2++) {
      for (var si3 = 0; si3 < SPOKES; si3++) {
        addEdge('ring_' + ri2 + '_s' + si3, 'ring_' + (ri2 + 1) + '_s' + si3, 'avenue', 9.0);
      }
    }

    function nearestRingNode(x, z) {
      var best = 'ring_0_s0', bd = 1e18;
      for (var i = 0; i < nodes.length; i++) {
        var nd = nodes[i];
        if (nd.tag !== 'street') continue;
        var d = (nd.x - x) * (nd.x - x) + (nd.z - z) * (nd.z - z);
        if (d < bd) { bd = d; best = nd.id; }
      }
      return best;
    }

    // 2. 15-Level Ruined Drum Arcology interior graph (L1 Bourse + 4 Fin Staircases + L1..L15 + Sky-Terrace)
    var arc = plan.arcology;
    var PORTAL_BAYS = [65, 95, 125, 155, 185, 215, 245, 275, 305, 335];
    for (var lv = 1; lv <= arc.levels.length; lv++) {
      var lvObj = arc.levels[lv - 1];
      var y0 = lvObj.y0;
      var lvCode = lv < 10 ? '0' + lv : '' + lv;
      // 12 gallery nodes around r = 64m (10 intact + 2 quarry edge landings on L1)
      var ringIds = [];
      for (var bi = 0; bi < lvObj.sectors.length; bi++) {
        var sec = lvObj.sectors[bi];
        if (sec.state === 'ruined' && lv > 1) continue;
        var sa = sec.deg * DEG;
        var gid = 'arc_gal_L' + lvCode + '_B' + sec.bay;
        addNode(gid, 66 * Math.cos(sa), y0, 66 * Math.sin(sa), 'arcology_gallery');
        ringIds.push(gid);
      }
      for (var gi = 0; gi < ringIds.length - 1; gi++) {
        addEdge(ringIds[gi], ringIds[gi + 1], 'gallery', 6.5);
      }
      if (ringIds.length > 2) {
        addEdge(ringIds[ringIds.length - 1], ringIds[0], 'gallery', 6.5);
      }

      // 4 Fin Staircase landings at r = 34m on this level, wired to adjacent gallery nodes & level below
      for (var st = 0; st < arc.stairs.length; st++) {
        var stDef = arc.stairs[st];
        var sta = stDef.deg * DEG;
        var stId = stDef.id + '_L' + lvCode;
        addNode(stId, 36 * Math.cos(sta), y0, 36 * Math.sin(sta), 'arcology_stair');
        // Connect stair landing to nearest gallery node on this level
        var bestGal = ringIds[0], bestGd = 1e18;
        var sx = 36 * Math.cos(sta), sz = 36 * Math.sin(sta);
        for (var gk = 0; gk < ringIds.length; gk++) {
          var gnd = nodes[nodeIdx[ringIds[gk]]];
          var gd2 = (gnd.x - sx) * (gnd.x - sx) + (gnd.z - sz) * (gnd.z - sz);
          if (gd2 < bestGd) { bestGd = gd2; bestGal = ringIds[gk]; }
        }
        if (bestGal) addEdge(stId, bestGal, 'corridor', 5.5);
        if (lv > 1) {
          var prevCode = (lv - 1) < 10 ? '0' + (lv - 1) : '' + (lv - 1);
          addEdge(stDef.id + '_L' + prevCode, stId, 'stair', 5.2);
        }
      }
    }
    // Central L1 Salvage Hoist Pit + 10 ground portals connecting L1 to Ring 0 (r = 216m)
    addNode('arc_hoist_pit_L01', 0, 0, 0, 'arcology_bourse');
    addEdge('arc_hoist_pit_L01', 'arc_gal_L01_B1', 'gallery', 8.0);
    addEdge('arc_hoist_pit_L01', 'arc_gal_L01_B4', 'gallery', 8.0);
    addEdge('arc_hoist_pit_L01', 'arc_gal_L01_B7', 'gallery', 8.0);
    addEdge('arc_hoist_pit_L01', 'arc_gal_L01_B10', 'gallery', 8.0);
    for (var pi = 0; pi < PORTAL_BAYS.length; pi++) {
      var pdeg = PORTAL_BAYS[pi];
      var prad = pdeg * DEG;
      var pid = 'arc_portal_' + pdeg;
      addNode(pid, 198 * Math.cos(prad), 0, 198 * Math.sin(prad), 'portal');
      var r0Node = nearestRingNode(216 * Math.cos(prad), 216 * Math.sin(prad));
      addEdge(pid, r0Node, 'avenue', 8.5);
      var bayIdx = Math.round((pdeg - 35) / 30);
      var galId = 'arc_gal_L01_B' + ((bayIdx + 12) % 12);
      if (nodeIdx[galId] != null) addEdge(pid, galId, 'avenue', 8.0);
    }

    // 3. Landmarks (Garrison Fortress, Ordinator Fortress, The Cauldron Arena, Scrap-Market, Quarry, Wharf)
    var fort = findLm(plan, 'garrison_fortress');
    if (fort) {
      var fGate = lmPt(fort, 0, 54, 0);
      var fYard = lmPt(fort, 0, 14, 0);
      var fLevy = lmPt(fort, -22, 8, 0.2);
      var fVault = lmPt(fort, 0, -14, -4.0);
      addNode('lm_fort_gate', fGate.x, 0, fGate.z, 'landmark');
      addNode('lm_fort_yard', fYard.x, 0, fYard.z, 'landmark');
      addNode('lm_fort_levy', fLevy.x, fLevy.y, fLevy.z, 'landmark');
      addNode('lm_fort_vault', fVault.x, fVault.y, fVault.z, 'landmark');
      addEdge(nearestRingNode(fGate.x, fGate.z), 'lm_fort_gate', 'avenue', 8.0);
      addEdge('lm_fort_gate', 'lm_fort_yard', 'corridor', 7.0);
      addEdge('lm_fort_yard', 'lm_fort_levy', 'corridor', 5.5);
      addEdge('lm_fort_yard', 'lm_fort_vault', 'stair', 5.0);
    }

    var ord = findLm(plan, 'ordinator_fortress');
    if (ord) {
      var oGate = lmPt(ord, 0, 40, 0);
      var oCloister = lmPt(ord, 0, 8, 0.2);
      var oVault = lmPt(ord, 0, -12, -4.0);
      addNode('lm_ord_gate', oGate.x, 0, oGate.z, 'landmark');
      addNode('lm_ord_cloister', oCloister.x, oCloister.y, oCloister.z, 'landmark');
      addNode('lm_ord_vault', oVault.x, oVault.y, oVault.z, 'landmark');
      addEdge(nearestRingNode(oGate.x, oGate.z), 'lm_ord_gate', 'avenue', 7.5);
      addEdge('lm_ord_gate', 'lm_ord_cloister', 'corridor', 6.0);
      addEdge('lm_ord_cloister', 'lm_ord_vault', 'stair', 5.0);
    }

    var arena = findLm(plan, 'gladiatorial_arena');
    if (arena) {
      var aGate = lmPt(arena, 0, 44, 0);
      var aSand = lmPt(arena, 0, 0, 0.15);
      var aHypo = lmPt(arena, 0, -10, -4.2);
      var aBlN = lmPt(arena, 0, -25, 5.2);
      var aBlS = lmPt(arena, 0, 25, 5.2);
      var aBlE = lmPt(arena, 30, 0, 5.2);
      var aBox = lmPt(arena, -30, 0, 5.6);
      addNode('lm_arena_gate', aGate.x, 0, aGate.z, 'landmark');
      addNode('lm_arena_sand', aSand.x, aSand.y, aSand.z, 'arena');
      addNode('lm_arena_hypo', aHypo.x, aHypo.y, aHypo.z, 'arena');
      addNode('lm_arena_bl_n', aBlN.x, aBlN.y, aBlN.z, 'arena');
      addNode('lm_arena_bl_s', aBlS.x, aBlS.y, aBlS.z, 'arena');
      addNode('lm_arena_bl_e', aBlE.x, aBlE.y, aBlE.z, 'arena');
      addNode('lm_arena_box', aBox.x, aBox.y, aBox.z, 'arena');
      addEdge(nearestRingNode(aGate.x, aGate.z), 'lm_arena_gate', 'avenue', 8.5);
      addEdge('lm_arena_gate', 'lm_arena_sand', 'corridor', 7.0);
      addEdge('lm_arena_sand', 'lm_arena_hypo', 'stair', 5.5);
      addEdge('lm_arena_gate', 'lm_arena_bl_s', 'stair', 6.0);
      addEdge('lm_arena_bl_s', 'lm_arena_bl_e', 'corridor', 5.5);
      addEdge('lm_arena_bl_e', 'lm_arena_bl_n', 'corridor', 5.5);
      addEdge('lm_arena_bl_s', 'lm_arena_box', 'corridor', 5.5);
    }

    var bourse = findLm(plan, 'scrap_market_rotunda');
    if (bourse) {
      addNode('lm_bourse_plaza', bourse.x, 0, bourse.z, 'market');
      addEdge(nearestRingNode(bourse.x, bourse.z), 'lm_bourse_plaza', 'avenue', 9.0);
    }
    var foundry = findLm(plan, 'quarry_salvage_foundry');
    if (foundry) {
      addNode('lm_quarry_foundry', foundry.x, 0, foundry.z, 'quarry');
      addNode('lm_quarry_pit', 320 * Math.cos(20 * DEG), 0, 320 * Math.sin(20 * DEG), 'quarry');
      addEdge(nearestRingNode(foundry.x, foundry.z), 'lm_quarry_foundry', 'avenue', 8.0);
      addEdge('lm_quarry_foundry', 'lm_quarry_pit', 'avenue', 8.0);
    }
    var wharf = findLm(plan, 'drum_river_wharf');
    if (wharf) {
      addNode('lm_wharf_quay', wharf.x, 0, wharf.z, 'wharf');
      addEdge(nearestRingNode(wharf.x, wharf.z), 'lm_wharf_quay', 'avenue', 8.0);
    }

    // 4. Map-edge Caravan Road Ports (Voth SE, Torus NW, Shim/Steppe SW)
    var roadPorts = [
      { id: 'port_voth_se', deg: 125, r: 980 },
      { id: 'port_torus_nw', deg: 275, r: 980 },
      { id: 'port_steppe_sw', deg: 215, r: 980 }
    ];
    for (var rpi = 0; rpi < roadPorts.length; rpi++) {
      var rp = roadPorts[rpi];
      var rpa = rp.deg * DEG;
      var px = rp.r * Math.cos(rpa), pz = rp.r * Math.sin(rpa);
      var pNode = 'node_' + rp.id;
      addNode(pNode, px, 0, pz, 'port');
      var gateRingNode = nearestRingNode(646 * Math.cos(rpa), 646 * Math.sin(rpa));
      addEdge(gateRingNode, pNode, 'highway', 9.5);
      SIM.port({ id: rp.id, x: +px.toFixed(2), z: +pz.toFixed(2), y: 0, node: pNode, layer: 'pedestrian', kind: 'road' });
    }

    SIM.nav.layer('pedestrian', {
      nodes: nodes,
      edges: edges,
      yWeight: 2.2,
      cost: { highway: 0.9, avenue: 0.95, street: 1.0, gallery: 1.0, corridor: 1.05, stair: 1.25 },
      speed: { highway: 1.1, avenue: 1.05, street: 1.0, gallery: 1.0, corridor: 0.95, stair: 0.8 }
    });

    // 5. Drim Rivrh Water Layer (upriver NW -> Wharf -> downriver NE)
    var rAng = plan.site.river.bearingDeg * DEG;
    var rDist = plan.site.river.centerDist;
    var rCx = rDist * Math.cos(rAng), rCz = rDist * Math.sin(rAng);
    var tx = -Math.sin(rAng), tz = Math.cos(rAng);
    var wNodes = [
      { id: 'wn_up', x: +(rCx - tx * 920).toFixed(2), y: -1.4, z: +(rCz - tz * 920).toFixed(2), tag: 'river' },
      { id: 'wn_mid_up', x: +(rCx - tx * 320).toFixed(2), y: -1.4, z: +(rCz - tz * 320).toFixed(2), tag: 'river' },
      { id: 'wn_wharf', x: +(rCx).toFixed(2), y: -1.4, z: +(rCz).toFixed(2), tag: 'wharf' },
      { id: 'wn_mid_dn', x: +(rCx + tx * 320).toFixed(2), y: -1.4, z: +(rCz + tz * 320).toFixed(2), tag: 'river' },
      { id: 'wn_dn', x: +(rCx + tx * 920).toFixed(2), y: -1.4, z: +(rCz + tz * 920).toFixed(2), tag: 'river' }
    ];
    var wEdges = [];
    for (var wi = 0; wi < wNodes.length - 1; wi++) {
      var wa = wNodes[wi], wb = wNodes[wi + 1];
      wEdges.push({
        id: 'we_' + wi, a: wa.id, b: wb.id, kind: 'river',
        len: +Math.hypot(wb.x - wa.x, wb.z - wa.z).toFixed(2), w: 18.0
      });
    }
    SIM.nav.layer('water', { nodes: wNodes, edges: wEdges });
    SIM.port({ id: 'port_drim_upriver', x: wNodes[0].x, z: wNodes[0].z, y: -1.4, node: 'wn_up', layer: 'water', kind: 'river' });
    SIM.port({ id: 'port_drim_downriver', x: wNodes[4].x, z: wNodes[4].z, y: -1.4, node: 'wn_dn', layer: 'water', kind: 'river' });

    return { pedNodes: nodes.length, pedEdges: edges.length, waterNodes: wNodes.length };
  }

  function initSim(plan, stage4, clockObj) {
    var SIM = root.SIM;
    if (!SIM) throw new Error('DRUM.initSim: load core/simulation/77-sim-*.js first');

    var simErrors = [];
    SIM.init({
      seed: plan.seed,
      hour: clockObj ? function () { return clockObj.hour; } : function () { return 12.5; },
      day: clockObj ? function () { return clockObj.day; } : function () { return 0; },
      t: clockObj ? function () { return clockObj.t; } : function () { return 0; },
      err: function (msg) { simErrors.push(msg); }
    });

    // High-scale optimizations for 13,500 residents
    SIM.WAKE = true;
    SIM.LAG = 15;
    SIM.STEP_MAX = 600;
    SIM.REACH = 580;
    SIM.lazy = { pedestrian: { detour: 1.32 } };

    // 1. Activities
    var ACTS = [
      { id: 'SLEEP', indoor: true },
      { id: 'REST', indoor: true },
      { id: 'IDLE', indoor: false, wander: 2.0 },
      { id: 'WORK', indoor: false, wander: 2.2 },
      { id: 'EAT', indoor: true },
      { id: 'DRINK', indoor: true },
      { id: 'BUY', indoor: false, wander: 1.8 },
      { id: 'TRADE', indoor: false, wander: 2.4 },
      { id: 'WORSHIP', indoor: true },
      { id: 'SOCIALIZE', indoor: false, wander: 2.4 },
      { id: 'PATROL', indoor: false, wander: 4.5 },
      { id: 'GUARD', indoor: false, wander: 1.8 },
      { id: 'DRILL', indoor: false, wander: 3.5 },
      { id: 'LEVY_OATH', indoor: true },
      { id: 'WATCH_BOUT', indoor: false, wander: 2.2 },
      { id: 'FIGHT_BOUT', indoor: false, wander: 7.5 },
      { id: 'WATER', indoor: false, wander: 1.6 },
      { id: 'JAIL', indoor: true }
    ];
    for (var ai = 0; ai < ACTS.length; ai++) SIM.activity(ACTS[ai]);

    // 2. Factions, Orgs & Relations
    SIM.faction({ id: 'voth', name: 'Vothic Imperium of Tzintzun', culture: 'voth' });
    SIM.faction({ id: 'vinvolk', name: 'Vinvolk (Fin-Folk of Drum)', culture: 'vinvolk' });
    SIM.faction({ id: 'torus_ring', name: 'Elected Board of Torus', culture: 'rinkvolk' });
    SIM.faction({ id: 'scyvoi_captives', name: 'Captured Scyvoi Steppe Raiders', culture: 'scyvoi' });

    SIM.org({ id: 'garrison_legion', faction: 'voth', kind: 'military', name: 'Vothic Garrison of the Military Governor' });
    SIM.org({ id: 'ordinator_inquisition', faction: 'voth', kind: 'religious', name: 'Ordinator Bastion of the Parabolic Sun' });
    SIM.org({ id: 'imperial_customs', faction: 'voth', kind: 'civic', name: 'Imperial Alloy-Tithe & Customs Assay' });
    SIM.org({ id: 'under_drum_guild', faction: 'vinvolk', kind: 'guild', name: 'Under-Drum Salvage & Hoist Guild' });
    SIM.org({ id: 'fin_artisans', faction: 'vinvolk', kind: 'craft', name: 'Fin-Wedge Smiths, Brewers & Bakers' });
    SIM.org({ id: 'mushroom_vat_keepers', faction: 'vinvolk', kind: 'farm', name: 'Dark-Vault Mycelium & Kraal Keepers' });
    SIM.org({ id: 'cauldron_ludus', faction: 'vinvolk', kind: 'arena', name: 'The Cauldron Gladiatorial Ludus' });
    SIM.org({ id: 'vinvolk_households', faction: 'vinvolk', kind: 'household', name: 'Households of Drum & the Concentric Rings' });
    SIM.org({ id: 'voth_caravans', faction: 'voth', kind: 'merchant', name: 'Vothic Tribute & Provision Caravans' });
    SIM.org({ id: 'torus_trains', faction: 'torus_ring', kind: 'merchant', name: 'Torus Cider & Grain Factors' });
    SIM.org({ id: 'drim_bargemen', faction: 'vinvolk', kind: 'merchant', name: 'Drim Rivrh Flatboat Guild' });

    SIM.relation({ a: 'voth', b: 'vinvolk', stance: 'wary', trust: -0.25 });
    SIM.relation({ a: 'vinvolk', b: 'voth', stance: 'wary', trust: -0.25 });
    SIM.relation({ a: 'vinvolk', b: 'torus_ring', stance: 'friendly', trust: 0.45 });
    SIM.relation({ a: 'torus_ring', b: 'vinvolk', stance: 'friendly', trust: 0.45 });
    SIM.relation({ a: 'voth', b: 'torus_ring', stance: 'cordial', trust: 0.25 });
    SIM.relation({ a: 'voth', b: 'scyvoi_captives', stance: 'hostile', trust: -0.90 });
    SIM.relation({ a: 'vinvolk', b: 'scyvoi_captives', stance: 'wary', trust: -0.40 });

    // 3. Build 3D Pedestrian + Water Nav Graphs
    var navStats = buildNavLayers(plan);

    // 4. Economy, Needs & Items Configuration
    SIM.economy({
      every: 30,
      window: 2,
      useShort: true,
      cart: { cap: 240, load: 12, unload: 12, minLoad: 16, near: 4, urgent: 2 },
      meal: { per: 1, foods: ['bread', 'mushrooms', 'meat', 'grain'] },
      imports: { days: 3, scan: 60 },
      exports: { minDays: 4, made: true, days: 2 },
      routes: {
        voth_road: { port: 'port_voth_se', minutes: 180 },
        torus_road: { port: 'port_torus_nw', minutes: 150 }
      },
      goods: {
        salvage_alloy: { minLoad: 12, export: true },
        copper_wire: { minLoad: 10, export: true },
        machine_parts: { minLoad: 8, export: true },
        steel_ingot: { minLoad: 10, export: true },
        tools: { minLoad: 8 },
        cloth: { minLoad: 10, import: { route: 'voth_road', lot: 180 } },
        mushrooms: { minLoad: 16 },
        grain: { minLoad: 20, import: { route: 'torus_road', lot: 320 } },
        bread: { minLoad: 16 },
        meat: { minLoad: 12 },
        beer: { minLoad: 16 },
        cider: { minLoad: 14, import: { route: 'torus_road', lot: 200 } },
        medicine: { minLoad: 6, import: { route: 'torus_road', lot: 90 } }
      },
      inputs: {
        steel_ingot: { salvage_alloy: 1 },
        tools: { steel_ingot: 1 },
        bread: { grain: 1 },
        beer: { mushrooms: 1 }
      }
    });

    SIM.site({ id: 'site_ruin_quarry', kind: 'quarry', goods: ['salvage_alloy', 'copper_wire'], grade: 'rich', yield: 1.35 });
    SIM.site({ id: 'site_upper_drum_core', kind: 'salvage', goods: ['machine_parts', 'copper_wire'], grade: 'standard', yield: 1.15 });
    SIM.site({ id: 'site_drim_weirs', kind: 'fishery', goods: ['meat'], grade: 'standard', yield: 1.0 });

    SIM.needs({
      list: ['hunger', 'rest', 'social', 'faith', 'spectacle', 'material'],
      rate: { hunger: 4.2, rest: 3.6, social: 2.0, faith: 1.1, spectacle: 1.8, material: 0.8 },
      work: { hunger: 1.2, rest: 1.4 },
      weight: { hunger: 1.5, rest: 1.3, social: 0.9, faith: 0.8, spectacle: 1.1, material: 0.9 },
      vital: { hunger: 82, rest: 88 },
      fill: {
        SLEEP: { rest: 14.0 },
        REST: { rest: 8.0, social: 2.0 },
        EAT: { hunger: 26.0, social: 4.0 },
        DRINK: { social: 14.0, hunger: 6.0, spectacle: 3.0 },
        WORSHIP: { faith: 22.0, social: 3.0 },
        WATCH_BOUT: { spectacle: 28.0, social: 10.0 },
        SOCIALIZE: { social: 15.0, rest: 2.0 },
        BUY: { material: 16.0, social: 3.0 },
        TRADE: { material: 12.0, social: 4.0 }
      },
      free: ['WATCH_BOUT', 'DRINK', 'SOCIALIZE', 'WORSHIP', 'REST'],
      bands: [
        { label: 'thriving', min: 75, eff: 1.12 },
        { label: 'content', min: 50, eff: 1.0 },
        { label: 'chafing', min: 28, eff: 0.86 },
        { label: 'bitter', min: 0, eff: 0.72 }
      ]
    });

    SIM.items({
      kinds: {
        salvage_coat: { cat: 'clothes', slot: 'torso', life: 45, good: 'cloth', per: 1 },
        work_boots: { cat: 'clothes', slot: 'feet', life: 40, good: 'cloth', per: 1 },
        cutter_bar: { cat: 'tool', slot: 'rhand', workLife: 60, good: 'tools', per: 1 },
        poultice: { cat: 'med', good: 'medicine', per: 1 },
        bread_loaf: { cat: 'food', food: 'bread', quality: 1.0, good: 'bread', per: 1 },
        vat_mushroom: { cat: 'food', food: 'mushrooms', quality: 0.95, good: 'mushrooms', per: 1 },
        roast_beetle: { cat: 'food', food: 'meat', quality: 1.1, good: 'meat', per: 1 },
        meal: { cat: 'meal' }
      },
      free: ['SOCIALIZE', 'REST', 'DRINK', 'WATCH_BOUT'],
      eatOut: { base: 0.18, wealth: 0.22 },
      hurt: 0.008,
      heal: 3
    });

    // 5. Register Places (Arcology Levels 1-15, Hero Landmarks, and 568 Concentric Ring Buildings)
    var arcologyHomes = [];
    var arcologyWorkplaces = { salvage: [], trade: [], warehouse: [], mushroom: [], smith: [], mess: [], guard: [] };
    var warehouses = [];
    var shopsFood = [];
    var shopsGeneral = [];
    var taverns = [];

    for (var lv = 1; lv <= plan.arcology.levels.length; lv++) {
      var lvData = plan.arcology.levels[lv - 1];
      for (var si = 0; si < lvData.sectors.length; si++) {
        var sec = lvData.sectors[si];
        if (sec.state === 'ruined' && lv > 1) continue;
        var sx = sec.at[0], sy = sec.at[1], sz = sec.at[2];
        var acts = {};
        var pKind = sec.use;
        var pOrg = 'vinvolk_households';
        var indoor = true;

        if (sec.pop > 0) {
          acts.SLEEP = sec.pop + 8;
          acts.REST = sec.pop + 8;
          acts.EAT = sec.pop + 8;
          acts.SOCIALIZE = Math.max(12, Math.round(sec.pop * 0.4));
        }
        if (sec.simRole === 'salvage_bourse' || sec.simRole === 'ancient_parts_exchange') {
          pKind = 'market';
          pOrg = 'under_drum_guild';
          indoor = false;
          acts.WORK = 90;
          acts.TRADE = 160;
          acts.BUY = 180;
          acts.SOCIALIZE = 80;
        } else if (sec.simRole === 'tribute_assay') {
          pKind = 'customs';
          pOrg = 'imperial_customs';
          acts.WORK = 50;
          acts.GUARD = 20;
        } else if (sec.simRole === 'bonded_alloy_vault' || sec.simRole === 'bonded_warehouse') {
          pKind = 'warehouse';
          pOrg = 'under_drum_guild';
          acts.WORK = 55;
        } else if (sec.simRole === 'mushroom_vat_vault') {
          pKind = 'mushroom_farm';
          pOrg = 'mushroom_vat_keepers';
          acts.WORK = 75;
        } else if (sec.simRole === 'fin_workshop' || sec.simRole === 'sky_terrace_crane' || sec.simRole === 'quarry_rubble_throat') {
          pKind = 'workshop';
          pOrg = 'fin_artisans';
          acts.WORK = 70;
        } else if (sec.simRole === 'communal_mess_bakehouse') {
          pKind = 'tavern';
          pOrg = 'fin_artisans';
          acts.WORK = 35;
          acts.EAT = 240;
          acts.DRINK = 220;
          acts.BUY = 120;
          acts.SOCIALIZE = 120;
        } else if (sec.simRole === 'arcology_infirmary') {
          pKind = 'healer';
          pOrg = 'fin_artisans';
          acts.WORK = 25;
          acts.BUY = 60;
          acts.REST = 40;
        } else if (sec.simRole === 'high_watch_post') {
          pKind = 'watch';
          pOrg = 'garrison_legion';
          indoor = false;
          acts.GUARD = 28;
          acts.PATROL = 28;
          acts.WORK = 20;
        } else if (!Object.keys(acts).length) {
          acts.WORK = 24;
          acts.IDLE = 20;
        }

        var pl = SIM.place({
          id: sec.id,
          name: 'Drum L' + lv + ' ' + (sec.simRole == null ? 'Fin Tenement' : sec.simRole),
          kind: pKind,
          org: pOrg,
          access: pKind === 'dwelling-multi' ? 'private' : 'public',
          x: sx,
          y: sy,
          z: sz,
          r: 12,
          door: { x: sx, y: sy, z: sz },
          indoor: indoor,
          wander: indoor ? 1.5 : 3.2,
          activities: acts
        });

        if (sec.pop > 0) {
          pl.store = { bread: sec.pop * 4, mushrooms: sec.pop * 4, meat: sec.pop * 2 };
          arcologyHomes.push({ id: sec.id, pop: sec.pop, level: lv });
        }
        if (sec.simRole === 'salvage_bourse' || sec.simRole === 'ancient_parts_exchange') {
          arcologyWorkplaces.trade.push(sec.id);
          shopsGeneral.push(sec.id);
          shopsFood.push(sec.id);
        } else if (sec.simRole === 'bonded_alloy_vault' || sec.simRole === 'bonded_warehouse') {
          arcologyWorkplaces.warehouse.push(sec.id);
          warehouses.push(sec.id);
        } else if (sec.simRole === 'mushroom_vat_vault') {
          arcologyWorkplaces.mushroom.push(sec.id);
        } else if (sec.simRole === 'fin_workshop' || sec.simRole === 'sky_terrace_crane' || sec.simRole === 'quarry_rubble_throat') {
          arcologyWorkplaces.smith.push(sec.id);
        } else if (sec.simRole === 'communal_mess_bakehouse') {
          pl.mess = true;
          arcologyWorkplaces.mess.push(sec.id);
          taverns.push(sec.id);
        } else if (sec.simRole === 'high_watch_post' || sec.simRole === 'tribute_assay') {
          arcologyWorkplaces.guard.push(sec.id);
        }
      }
    }

    // Landmark Places
    var fort = findLm(plan, 'garrison_fortress');
    var fYard = lmPt(fort, 0, 14, 0.2);
    var fLevy = lmPt(fort, -22, 8, 0.2);
    var fVault = lmPt(fort, 0, -14, -4.0);
    SIM.place({
      id: 'fort_barracks', name: 'Garrison Fortress Praetorium & Barracks', kind: 'barracks', org: 'garrison_legion',
      x: fYard.x, y: fYard.y, z: fYard.z, r: 16, door: fYard, indoor: false, wander: 4.5, mess: true,
      activities: { SLEEP: 300, REST: 300, EAT: 280, DRILL: 180, GUARD: 120, PATROL: 120, WORK: 120, SOCIALIZE: 100 }
    });
    SIM.place({
      id: 'fort_levy_hall', name: 'Garrison Levy & Assimilation Oath Hall', kind: 'levy_hall', org: 'garrison_legion',
      x: fLevy.x, y: fLevy.y, z: fLevy.z, r: 9, door: fLevy, indoor: false, wander: 2.8,
      activities: { LEVY_OATH: 90, DRILL: 80, WORK: 40 }
    });
    SIM.place({
      id: 'fort_vault_jail', name: 'Garrison Fortress Subterranean Brig', kind: 'jail', org: 'garrison_legion',
      x: fVault.x, y: fVault.y, z: fVault.z, r: 8, door: fVault, indoor: true,
      activities: { JAIL: 80, GUARD: 24 }
    });

    var ord = findLm(plan, 'ordinator_fortress');
    var oCloister = lmPt(ord, 0, 8, 0.2);
    var oVault = lmPt(ord, 0, -12, -4.0);
    SIM.place({
      id: 'ord_sun_chapel', name: 'Ordinator Cloister of Ash & Parabolic Sun Dish', kind: 'temple', org: 'ordinator_inquisition',
      x: oCloister.x, y: oCloister.y, z: oCloister.z, r: 14, door: oCloister, indoor: false, wander: 3.5, mess: true,
      activities: { SLEEP: 90, REST: 90, EAT: 90, WORSHIP: 260, PATROL: 60, GUARD: 50, WORK: 60 }
    });
    SIM.place({
      id: 'ord_quiet_vault', name: 'Ordinator Quiet Vaults (Inquisition Cells)', kind: 'jail', org: 'ordinator_inquisition',
      x: oVault.x, y: oVault.y, z: oVault.z, r: 7, door: oVault, indoor: true,
      activities: { JAIL: 60, GUARD: 20 }
    });

    var arena = findLm(plan, 'gladiatorial_arena');
    var aSand = lmPt(arena, 0, 0, 0.15);
    var aHypo = lmPt(arena, 0, -10, -4.2);
    var aBlN = lmPt(arena, 0, -25, 5.2);
    var aBlS = lmPt(arena, 0, 25, 5.2);
    var aBlE = lmPt(arena, 30, 0, 5.2);
    var aBox = lmPt(arena, -30, 0, 5.6);

    var sandSpots = [];
    for (var ksi = 0; ksi < 16; ksi++) {
      var sang = (ksi / 16) * Math.PI * 2;
      var sr = ksi % 2 === 0 ? 9.5 : 4.8;
      var spPt = lmPt(arena, Math.cos(sang) * sr * 1.25, Math.sin(sang) * sr * 0.9, 0.15);
      sandSpots.push([spPt.x, spPt.z, spPt.y]);
    }
    SIM.place({
      id: 'arena_sand_pit', name: 'The Cauldron Blood-Sand Floor', kind: 'arena_sand', org: 'cauldron_ludus',
      x: aSand.x, y: aSand.y, z: aSand.z, r: 15, door: aSand, spots: sandSpots, indoor: false, wander: 6.5,
      hours: { FIGHT_BOUT: [12, 18], DRILL: [7, 12] },
      activities: { FIGHT_BOUT: 28, DRILL: 28, WORK: 16 }
    });
    SIM.place({
      id: 'arena_hypogeum_cells', name: 'The Cauldron Hypogeum Beast & Gladiator Cells', kind: 'ludus', org: 'cauldron_ludus',
      x: aHypo.x, y: aHypo.y, z: aHypo.z, r: 10, door: aHypo, indoor: true, mess: true,
      activities: { SLEEP: 64, REST: 64, EAT: 64, WORK: 24 }
    });
    var bleacherDefs = [
      { id: 'arena_bleachers_n', name: 'The Cauldron North Split-Tank Bleachers', pt: aBlN, cap: 420 },
      { id: 'arena_bleachers_s', name: 'The Cauldron South Split-Tank Bleachers', pt: aBlS, cap: 420 },
      { id: 'arena_bleachers_e', name: 'The Cauldron East Tiers', pt: aBlE, cap: 340 },
      { id: 'arena_governor_box', name: 'Tank-Head Governor & Chichani Box', pt: aBox, cap: 120 }
    ];
    for (var bli = 0; bli < bleacherDefs.length; bli++) {
      var bl = bleacherDefs[bli];
      SIM.place({
        id: bl.id, name: bl.name, kind: 'arena_bleachers', org: 'cauldron_ludus',
        x: bl.pt.x, y: bl.pt.y, z: bl.pt.z, r: 12, door: bl.pt, indoor: false, wander: 3.2,
        hours: { WATCH_BOUT: [12, 18] },
        activities: { WATCH_BOUT: bl.cap, SOCIALIZE: 90 }
      });
    }

    var bourse = findLm(plan, 'scrap_market_rotunda');
    var vmarket = findLm(plan, 'scrap_market_voth_hall');
    var foundry = findLm(plan, 'quarry_salvage_foundry');
    var wharf = findLm(plan, 'drum_river_wharf');

    SIM.place({
      id: 'scrap_market_rotunda', name: bourse.name, kind: 'market', org: 'under_drum_guild',
      x: bourse.x, y: 0, z: bourse.z, r: 16, door: { x: bourse.x, y: 0, z: bourse.z }, indoor: false, wander: 4.5,
      activities: { WORK: 80, TRADE: 260, BUY: 280, SOCIALIZE: 120, SLEEP: 20, REST: 20, EAT: 30 }
    });
    shopsGeneral.push('scrap_market_rotunda');
    shopsFood.push('scrap_market_rotunda');

    SIM.place({
      id: 'scrap_market_voth_hall', name: vmarket.name, kind: 'market', org: 'imperial_customs',
      x: vmarket.x, y: 0, z: vmarket.z, r: 14, door: { x: vmarket.x, y: 0, z: vmarket.z }, indoor: false, wander: 3.8,
      activities: { WORK: 60, TRADE: 180, BUY: 200, GUARD: 24, SLEEP: 16, REST: 16, EAT: 24 }
    });
    shopsGeneral.push('scrap_market_voth_hall');
    warehouses.push('scrap_market_voth_hall');

    SIM.place({
      id: 'quarry_salvage_foundry', name: foundry.name, kind: 'quarry', org: 'under_drum_guild',
      x: foundry.x, y: 0, z: foundry.z, r: 18, door: { x: foundry.x, y: 0, z: foundry.z }, indoor: false, wander: 5.5,
      activities: { WORK: 180, SLEEP: 20, REST: 20, EAT: 24 }
    });

    SIM.place({
      id: 'drum_river_wharf', name: wharf.name, kind: 'wharf', org: 'drim_bargemen',
      x: wharf.x, y: 0, z: wharf.z, r: 14, door: { x: wharf.x, y: 0, z: wharf.z }, indoor: false, wander: 3.5,
      activities: { WORK: 90, TRADE: 90, WATER: 60, GUARD: 20, SLEEP: 20, REST: 20, EAT: 24 }
    });
    warehouses.push('drum_river_wharf');

    // Outer Concentric Ring Buildings (568 buildings)
    var outerHomes = [];
    var ringWorkByKind = {
      bakery: [], butcher: [], brewer: [], smith: [], weaver: [], warehouse: [],
      market: [], tavern: [], shrine: [], healer: [], guard: [], farm: [], quarry: []
    };

    for (var bi2 = 0; bi2 < plan.buildings.length; bi2++) {
      var b = plan.buildings[bi2];
      var bActs = {};
      var bCap = Math.max(4, b.pop + 4);
      if (b.pop > 0) {
        bActs.SLEEP = bCap;
        bActs.REST = bCap;
        bActs.EAT = bCap;
        bActs.SOCIALIZE = Math.max(6, Math.round(b.pop * 0.5));
      }
      var bKind = 'house';
      var bOrg = b.culture === 'voth' ? 'imperial_customs' : 'vinvolk_households';
      var bIndoor = true;

      if (b.types.indexOf('tavern') >= 0 || b.types.indexOf('inn') >= 0) {
        bKind = 'tavern'; bOrg = 'fin_artisans';
        bActs.WORK = 14; bActs.DRINK = 65; bActs.EAT = 65; bActs.BUY = 45; bActs.SOCIALIZE = 55;
        ringWorkByKind.tavern.push(b.id);
        taverns.push(b.id);
      } else if (b.types.indexOf('market') >= 0 || b.types.indexOf('shop') >= 0) {
        if (b.job === 'baking') { bKind = 'bakery'; bOrg = 'fin_artisans'; bActs.WORK = 12; bActs.BUY = 50; ringWorkByKind.bakery.push(b.id); shopsFood.push(b.id); }
        else if (b.job === 'butchery') { bKind = 'butcher'; bOrg = 'fin_artisans'; bActs.WORK = 10; bActs.BUY = 45; ringWorkByKind.butcher.push(b.id); shopsFood.push(b.id); }
        else if (b.job === 'smithing' || b.job === 'pottery' || b.job === 'carpentry') { bKind = 'smithy'; bOrg = 'fin_artisans'; bActs.WORK = 14; bActs.BUY = 35; ringWorkByKind.smith.push(b.id); shopsGeneral.push(b.id); }
        else if (b.job === 'weaving') { bKind = 'weaver'; bOrg = 'fin_artisans'; bActs.WORK = 14; bActs.BUY = 35; ringWorkByKind.weaver.push(b.id); shopsGeneral.push(b.id); }
        else if (b.job === 'healing') { bKind = 'healer'; bOrg = 'fin_artisans'; bActs.WORK = 12; bActs.BUY = 40; ringWorkByKind.healer.push(b.id); shopsGeneral.push(b.id); }
        else { bKind = 'shop'; bOrg = 'under_drum_guild'; bIndoor = false; bActs.WORK = 14; bActs.BUY = 60; bActs.TRADE = 40; ringWorkByKind.market.push(b.id); shopsGeneral.push(b.id); shopsFood.push(b.id); }
      } else if (b.types.indexOf('industry') >= 0) {
        if (b.job === 'warehousing' || b.job === 'milling') { bKind = 'warehouse'; bOrg = 'under_drum_guild'; bActs.WORK = 18; ringWorkByKind.warehouse.push(b.id); warehouses.push(b.id); }
        else if (b.job === 'brewing') { bKind = 'brewery'; bOrg = 'fin_artisans'; bActs.WORK = 14; ringWorkByKind.brewer.push(b.id); }
        else if (b.job === 'quarrying') { bKind = 'quarry'; bOrg = 'under_drum_guild'; bIndoor = false; bActs.WORK = 22; ringWorkByKind.quarry.push(b.id); }
        else { bKind = 'smithy'; bOrg = 'fin_artisans'; bActs.WORK = 18; ringWorkByKind.smith.push(b.id); }
      } else if (b.types.indexOf('military') >= 0) {
        bKind = 'watch'; bOrg = 'garrison_legion'; bIndoor = false;
        bActs.GUARD = 24; bActs.PATROL = 24; bActs.DRILL = 20; bActs.WORK = 16;
        ringWorkByKind.guard.push(b.id);
      } else if (b.types.indexOf('religious') >= 0 || b.types.indexOf('funerary') >= 0) {
        bKind = 'shrine'; bOrg = b.culture === 'voth' ? 'ordinator_inquisition' : 'vinvolk_households';
        bActs.WORSHIP = 45; bActs.WORK = 8;
        ringWorkByKind.shrine.push(b.id);
      } else if (b.types.indexOf('farm') >= 0) {
        bKind = 'farm'; bOrg = 'mushroom_vat_keepers'; bIndoor = false;
        bActs.WORK = 20;
        ringWorkByKind.farm.push(b.id);
      } else if (b.types.indexOf('civic') >= 0) {
        bKind = 'healer'; bOrg = 'fin_artisans';
        bActs.WORK = 14; bActs.REST = Math.max(bCap, 24); bActs.SOCIALIZE = 30;
        ringWorkByKind.healer.push(b.id);
      } else if (b.types.indexOf('infrastructure') >= 0) {
        bKind = 'well'; bOrg = 'vinvolk_households'; bIndoor = false;
        bActs.WATER = 35; bActs.WORK = 8;
      }

      var bPlace = SIM.place({
        id: b.id,
        name: b.key + ' (' + b.district + ')',
        kind: bKind,
        org: bOrg,
        access: bKind === 'house' ? 'private' : 'public',
        x: b.x,
        y: b.y,
        z: b.z,
        r: Math.max(3, 0.35 * Math.min(b.w, b.d)),
        door: { x: b.x, y: b.y, z: b.z },
        indoor: bIndoor,
        wander: bIndoor ? 1.4 : 2.8,
        activities: bActs
      });
      if (b.pop > 0) {
        bPlace.store = { bread: b.pop * 4, mushrooms: b.pop * 3, meat: b.pop * 2 };
        if (bKind === 'tavern' || bKind === 'watch') bPlace.mess = true;
        outerHomes.push({ id: b.id, pop: b.pop, culture: b.culture, district: b.district, kind: bKind });
      }
    }

    // 6. Wire Economy Warehouses, Producer Recipes & Shops
    for (var wi2 = 0; wi2 < warehouses.length; wi2++) {
      var wid = warehouses[wi2];
      var wpl = SIM.store(wid, { kind: 'warehouse', cap: 6000 });
      if (wpl && wi2 < 12) {
        wpl.stock.salvage_alloy = 280;
        wpl.stock.copper_wire = 190;
        wpl.stock.machine_parts = 130;
        wpl.stock.steel_ingot = 180;
        wpl.stock.tools = 160;
        wpl.stock.cloth = 220;
        wpl.stock.grain = 480;
        wpl.stock.mushrooms = 460;
        wpl.stock.bread = 520;
        wpl.stock.meat = 320;
        wpl.stock.beer = 380;
        wpl.stock.cider = 220;
        wpl.stock.medicine = 120;
      }
    }

    SIM.recipe('quarry_salvage_foundry', { out: ['salvage_alloy', 'copper_wire'], rate: 2.8, cap: 900, site: 'site_ruin_quarry' });
    for (var qk = 0; qk < ringWorkByKind.quarry.length; qk++) {
      SIM.recipe(ringWorkByKind.quarry[qk], { out: ['salvage_alloy', 'copper_wire'], rate: 2.2, cap: 450, site: 'site_ruin_quarry' });
    }
    for (var mvi = 0; mvi < arcologyWorkplaces.mushroom.length; mvi++) {
      SIM.recipe(arcologyWorkplaces.mushroom[mvi], { out: ['mushrooms'], rate: 3.4, cap: 600 });
    }
    for (var asi = 0; asi < arcologyWorkplaces.smith.length; asi++) {
      var sOut = asi % 2 === 0 ? ['machine_parts', 'copper_wire'] : ['steel_ingot', 'tools'];
      var sOpt = { out: sOut, rate: 2.1, cap: 420 };
      if (asi % 2 === 0) sOpt.site = 'site_upper_drum_core';
      SIM.recipe(arcologyWorkplaces.smith[asi], sOpt);
    }
    for (var rbi = 0; rbi < ringWorkByKind.bakery.length; rbi++) SIM.recipe(ringWorkByKind.bakery[rbi], { out: ['bread'], rate: 3.6, cap: 360 });
    for (var rbu = 0; rbu < ringWorkByKind.butcher.length; rbu++) SIM.recipe(ringWorkByKind.butcher[rbu], { out: ['meat'], rate: 2.6, cap: 300, site: 'site_drim_weirs' });
    for (var rbr = 0; rbr < ringWorkByKind.brewer.length; rbr++) SIM.recipe(ringWorkByKind.brewer[rbr], { out: ['beer'], rate: 3.0, cap: 340 });
    for (var rsm = 0; rsm < ringWorkByKind.smith.length; rsm++) SIM.recipe(ringWorkByKind.smith[rsm], { out: ['steel_ingot', 'tools'], rate: 2.2, cap: 320 });
    for (var rwe = 0; rwe < ringWorkByKind.weaver.length; rwe++) SIM.recipe(ringWorkByKind.weaver[rwe], { out: ['cloth'], rate: 2.4, cap: 280 });
    for (var rfa = 0; rfa < ringWorkByKind.farm.length; rfa++) SIM.recipe(ringWorkByKind.farm[rfa], { out: ['grain', 'meat'], rate: 2.8, cap: 360 });

    for (var sfi = 0; sfi < shopsFood.length; sfi++) {
      SIM.shop(shopsFood[sfi], ['bread_loaf', 'vat_mushroom', 'roast_beetle']);
    }
    SIM.shop('scrap_market_rotunda', ['meal']);
    for (var sgi = 0; sgi < shopsGeneral.length; sgi++) {
      SIM.shop(shopsGeneral[sgi], ['salvage_coat', 'work_boots', 'cutter_bar', 'poultice']);
    }
    for (var tvi = 0; tvi < taverns.length; tvi++) {
      SIM.shop(taverns[tvi], ['meal', 'bread_loaf', 'vat_mushroom']);
    }

    // 7. Roles & Hourly Schedules
    var HOME_PREF = { SLEEP: { pin: 'home' }, REST: { pin: 'home' } };
    function rolePrefs(workKinds, watchArena) {
      var p = {
        SLEEP: { pin: 'home' },
        REST: { pin: 'home' },
        WORK: { pin: 'work', kinds: workKinds },
        EAT: { pin: 'home' },
        DRINK: { kinds: ['tavern'], spread: 4 },
        WORSHIP: { kinds: ['temple', 'shrine'], spread: 3 },
        BUY: { kinds: ['market', 'shop', 'bakery', 'butcher', 'smithy', 'healer'], spread: 4 },
        SOCIALIZE: { kinds: ['market', 'tavern', 'arena_bleachers'], spread: 4 }
      };
      if (watchArena) p.WATCH_BOUT = { kinds: ['arena_bleachers'], spread: 4, reach: 900 };
      return p;
    }

    SIM.role({
      id: 'salvage_rigger', org: 'under_drum_guild', name: 'Under-Drum Salvage Rigger & Quarry Cutter',
      needs: { labour: 0.85 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [16, 'WATCH_BOUT'], [18, 'DRINK'], [20, 'REST'], [22, 'SLEEP']],
      prefers: rolePrefs(['quarry', 'workshop', 'market'], true)
    });
    SIM.role({
      id: 'fin_artisan', org: 'fin_artisans', name: 'Fin-Wedge Smith, Baker & Brewer',
      needs: { labour: 0.65 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [17, 'WATCH_BOUT'], [19, 'DRINK'], [21, 'SLEEP']],
      prefers: rolePrefs(['smithy', 'bakery', 'butcher', 'brewery', 'weaver', 'workshop'], true)
    });
    SIM.role({
      id: 'mushroom_tender', org: 'mushroom_vat_keepers', name: 'Dark-Vault Mushroom & Kraal Keeper',
      needs: { labour: 0.60 },
      sched: [[0, 'SLEEP'], [5, 'EAT'], [6, 'WORK'], [12, 'EAT'], [13, 'WORK'], [16, 'SOCIALIZE'], [18, 'EAT'], [20, 'REST'], [21, 'SLEEP']],
      prefers: rolePrefs(['mushroom_farm', 'farm'], true)
    });
    SIM.role({
      id: 'bourse_trader', org: 'under_drum_guild', name: 'Regional Scrap-Market & Bourse Factor',
      needs: { labour: 0.30 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'WORK'], [13, 'WATCH_BOUT'], [15, 'WORK'], [18, 'DRINK'], [20, 'REST'], [22, 'SLEEP']],
      prefers: rolePrefs(['market', 'shop', 'customs', 'warehouse'], true)
    });
    SIM.role({
      id: 'porter_cartman', org: 'under_drum_guild', name: 'Hoist Porter & Salvage Cartman',
      needs: { labour: 0.80 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'WORK'], [12, 'EAT'], [13, 'WORK'], [18, 'DRINK'], [20, 'REST'], [22, 'SLEEP']],
      prefers: rolePrefs(['warehouse', 'wharf'], false)
    });
    SIM.role({
      id: 'garrison_soldier', org: 'garrison_legion', name: 'Vothic Garrison Legionary',
      needs: { labour: 0.55 },
      cycle: { PATROL: 35 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'DRILL'], [9, 'PATROL'], [13, 'WATCH_BOUT'], [15, 'GUARD'], [19, 'EAT'], [20, 'DRINK'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        DRILL: { kinds: ['barracks', 'levy_hall'] },
        PATROL: { kinds: ['watch', 'market', 'barracks'], spread: 6 },
        GUARD: { kinds: ['barracks', 'watch', 'customs', 'jail'], spread: 5 },
        WATCH_BOUT: { kinds: ['arena_bleachers'], spread: 4, reach: 900 },
        DRINK: { kinds: ['tavern'], spread: 4 }
      }
    });
    SIM.role({
      id: 'levy_recruit', org: 'garrison_legion', name: 'Assimilated Vinvolk Levy Recruit',
      needs: { labour: 0.65 },
      sched: [[0, 'SLEEP'], [6, 'EAT'], [7, 'DRILL'], [9, 'LEVY_OATH'], [11, 'DRILL'], [13, 'EAT'], [14, 'PATROL'], [16, 'WATCH_BOUT'], [18, 'EAT'], [20, 'REST'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        LEVY_OATH: { ids: ['fort_levy_hall'] },
        DRILL: { kinds: ['barracks', 'levy_hall'] },
        PATROL: { kinds: ['watch', 'barracks'], spread: 5 },
        WATCH_BOUT: { kinds: ['arena_bleachers'], spread: 4, reach: 900 }
      }
    });
    SIM.role({
      id: 'ordinator_inquisitor', org: 'ordinator_inquisition', name: 'Ordinator Inquisitor & Sun Chaplain',
      needs: { labour: 0.35 },
      cycle: { PATROL: 40 },
      sched: [[0, 'SLEEP'], [5, 'WORSHIP'], [7, 'EAT'], [8, 'PATROL'], [12, 'WORSHIP'], [14, 'WORK'], [17, 'PATROL'], [19, 'EAT'], [20, 'WORSHIP'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        WORSHIP: { kinds: ['temple', 'shrine'], spread: 2 },
        WORK: { ids: ['ord_sun_chapel', 'scrap_market_voth_hall'] },
        PATROL: { kinds: ['market', 'watch', 'temple', 'jail'], spread: 6 }
      }
    });
    SIM.role({
      id: 'gladiator', org: 'cauldron_ludus', name: 'Cauldron Gladiator & Pit Fighter',
      needs: { labour: 0.90 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'DRILL'], [11, 'EAT'], [12, 'FIGHT_BOUT'], [18, 'EAT'], [19, 'DRINK'], [21, 'REST'], [22, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' }, EAT: { pin: 'home' },
        DRILL: { ids: ['arena_sand_pit'] },
        FIGHT_BOUT: { ids: ['arena_sand_pit'] },
        DRINK: { kinds: ['tavern'], spread: 3 }
      }
    });
    SIM.role({
      id: 'arena_beast', org: 'cauldron_ludus', name: 'Cauldron Armored Pit-Beetle & Stalker',
      needs: { free: ['REST', 'IDLE'] },
      sched: [[0, 'SLEEP'], [8, 'DRILL'], [11, 'REST'], [12, 'FIGHT_BOUT'], [18, 'REST'], [21, 'SLEEP']],
      prefers: {
        SLEEP: { pin: 'home' }, REST: { pin: 'home' },
        DRILL: { ids: ['arena_sand_pit'] },
        FIGHT_BOUT: { ids: ['arena_sand_pit'] }
      }
    });
    SIM.role({
      id: 'drum_citizen', org: 'vinvolk_households', name: 'Vinvolk Resident & Household Kin',
      needs: { labour: 0.35 },
      sched: [[0, 'SLEEP'], [7, 'EAT'], [8, 'BUY'], [10, 'SOCIALIZE'], [12, 'WATCH_BOUT'], [15, 'REST'], [17, 'WATCH_BOUT'], [18, 'EAT'], [19, 'DRINK'], [21, 'SLEEP']],
      prefers: rolePrefs(['market', 'shop'], true)
    });

    // Visitor roles for Caravans & River Barges
    SIM.role({
      id: 'voth_caravan_guard', org: 'voth_caravans', name: 'Vothic Tribute Caravan Drover',
      mode: 'ride', speed: SIM.SPEED.ride,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });
    SIM.role({
      id: 'torus_factor', org: 'torus_trains', name: 'Torus Cider & Grain Factor',
      mode: 'walk', speed: SIM.SPEED.walk,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });
    SIM.role({
      id: 'drim_barge_crew', org: 'drim_bargemen', name: 'Drim Rivrh Salvage Bargeman',
      layer: 'water', mode: 'boat', speed: SIM.SPEED.boat,
      sched: [[0, 'WORK']], prefers: HOME_PREF
    });

    // 8. Spawn Exact 13,500 Permanent Residents (5,400 Arcology + 8,100 Outer Rings & Landmarks)
    var arcologyActors = 0;
    var outerActors = 0;
    var gladiators = [];
    var arenaBeasts = [];
    var levyRecruits = [];
    var spectatorsPool = [];
    var cartDrivers = [];

    var allSalvageWork = ['quarry_salvage_foundry'].concat(ringWorkByKind.quarry, arcologyWorkplaces.smith);
    var allCraftWork = ringWorkByKind.bakery.concat(ringWorkByKind.butcher, ringWorkByKind.brewer, ringWorkByKind.smith, ringWorkByKind.weaver, arcologyWorkplaces.mess);
    var allTradeWork = ['scrap_market_rotunda', 'scrap_market_voth_hall'].concat(arcologyWorkplaces.trade, ringWorkByKind.market);
    var allPorterWork = warehouses.slice();
    var allMushroomWork = arcologyWorkplaces.mushroom.concat(ringWorkByKind.farm);

    function pickList(arr, idx, fallback) {
      return arr.length ? arr[idx % arr.length] : fallback;
    }

    // 8a. Exact 5,400 Arcology Residents across Levels 5-15
    for (var ahi = 0; ahi < arcologyHomes.length; ahi++) {
      var ah = arcologyHomes[ahi];
      for (var k = 0; k < ah.pop; k++) {
        var idxA = arcologyActors;
        var aRole = 'salvage_rigger';
        var aWork = pickList(allSalvageWork, idxA, 'quarry_salvage_foundry');
        var modA = idxA % 10;
        if (modA === 0 || modA === 1) { aRole = 'fin_artisan'; aWork = pickList(allCraftWork, idxA, 'scrap_market_rotunda'); }
        else if (modA === 2) { aRole = 'mushroom_tender'; aWork = pickList(allMushroomWork, idxA, 'scrap_market_rotunda'); }
        else if (modA === 3) { aRole = 'bourse_trader'; aWork = pickList(allTradeWork, idxA, 'scrap_market_rotunda'); }
        else if (modA === 4) { aRole = 'porter_cartman'; aWork = pickList(allPorterWork, idxA, 'scrap_market_voth_hall'); }
        else if (modA >= 7) { aRole = 'drum_citizen'; aWork = null; }

        var actRec = SIM.actor({
          id: 'arc_res_' + idxA,
          role: aRole,
          home: ah.id,
          work: aWork,
          culture: 'vinvolk',
          wealth: ah.level <= 8 ? 0.55 : 0.32,
          zone: 'arcology',
          resident: true
        });
        actRec.wears = ['salvage_coat', 'work_boots'];
        actRec.sets = 1;
        if (idxA % 6 === 0) spectatorsPool.push(actRec);
        arcologyActors++;
      }
    }

    // 8b. Landmark Residents + Concentric Ring Residents = Exact 8,100
    var targetOuter = plan.pop.outerTotal; // 8,100
    // Garrison Fortress (260 pop: 170 Vothic legionaries + 90 Vinvolk levy recruits)
    var fortPop = fort ? fort.pop : 260;
    for (var fg = 0; fg < fortPop; fg++) {
      var isLevy = fg >= 170;
      var ga = SIM.actor({
        id: 'fort_res_' + fg,
        role: isLevy ? 'levy_recruit' : 'garrison_soldier',
        home: 'fort_barracks',
        work: isLevy ? 'fort_levy_hall' : 'fort_barracks',
        culture: isLevy ? 'vinvolk' : 'voth',
        wealth: isLevy ? 0.42 : 0.72,
        issued: true,
        zone: 'outer',
        resident: true
      });
      if (isLevy) levyRecruits.push(ga);
      else if (fg % 4 === 0) spectatorsPool.push(ga);
      outerActors++;
    }

    // Ordinator Fortress (72 pop)
    var ordPop = ord ? ord.pop : 72;
    for (var og = 0; og < ordPop; og++) {
      SIM.actor({
        id: 'ord_res_' + og,
        role: 'ordinator_inquisitor',
        home: 'ord_sun_chapel',
        work: 'ord_sun_chapel',
        culture: 'voth',
        wealth: 0.78,
        issued: true,
        zone: 'outer',
        resident: true
      });
      outerActors++;
    }

    // The Cauldron Arena (28 pop: 20 gladiators + 8 armored pit-beasts)
    var arenaPop = arena ? arena.pop : 28;
    for (var ag = 0; ag < arenaPop; ag++) {
      var isBeast = ag >= 20;
      var gl = SIM.actor({
        id: 'arena_res_' + ag,
        role: isBeast ? 'arena_beast' : 'gladiator',
        home: 'arena_hypogeum_cells',
        work: 'arena_sand_pit',
        culture: isBeast ? 'scyvoi' : (ag % 3 === 0 ? 'scyvoi' : 'vinvolk'),
        wealth: 0.45,
        issued: true,
        zone: 'outer',
        resident: true
      });
      if (isBeast) arenaBeasts.push(gl);
      else gladiators.push(gl);
      outerActors++;
    }

    // Remaining minor landmarks (Scrap-Market Rotunda, Voth Hall, Quarry Foundry, River Wharf)
    var minorLms = [
      { lm: bourse, place: 'scrap_market_rotunda', role: 'bourse_trader', culture: 'vinvolk' },
      { lm: vmarket, place: 'scrap_market_voth_hall', role: 'bourse_trader', culture: 'voth' },
      { lm: foundry, place: 'quarry_salvage_foundry', role: 'salvage_rigger', culture: 'vinvolk' },
      { lm: wharf, place: 'drum_river_wharf', role: 'porter_cartman', culture: 'vinvolk' }
    ];
    for (var mli = 0; mli < minorLms.length; mli++) {
      var ml = minorLms[mli];
      var mPop = ml.lm ? ml.lm.pop : 0;
      for (var mk = 0; mk < mPop; mk++) {
        var ma = SIM.actor({
          id: ml.place + '_res_' + mk,
          role: ml.role,
          home: ml.place,
          work: ml.place,
          culture: ml.culture,
          wealth: 0.55,
          zone: 'outer',
          resident: true
        });
        if (ml.role === 'porter_cartman' && cartDrivers.length < 18) cartDrivers.push(ma);
        outerActors++;
      }
    }

    // Concentric Ring Buildings (fill exact remaining outerActors -> 8,100)
    for (var ohi = 0; ohi < outerHomes.length && outerActors < targetOuter; ohi++) {
      var oh = outerHomes[ohi];
      for (var ok = 0; ok < oh.pop && outerActors < targetOuter; ok++) {
        var idxO = outerActors;
        var oRole = 'drum_citizen';
        var oWork = null;
        if (oh.kind === 'watch') {
          oRole = idxO % 3 === 0 ? 'levy_recruit' : 'garrison_soldier';
          oWork = oh.id;
        } else if (oh.kind === 'shrine' && oh.culture === 'voth') {
          oRole = 'ordinator_inquisitor';
          oWork = oh.id;
        } else {
          var modO = idxO % 12;
          if (modO <= 2) { oRole = 'salvage_rigger'; oWork = pickList(allSalvageWork, idxO, 'quarry_salvage_foundry'); }
          else if (modO <= 5) { oRole = 'fin_artisan'; oWork = pickList(allCraftWork, idxO, 'scrap_market_rotunda'); }
          else if (modO === 6) { oRole = 'bourse_trader'; oWork = pickList(allTradeWork, idxO, 'scrap_market_rotunda'); }
          else if (modO === 7) { oRole = 'porter_cartman'; oWork = pickList(allPorterWork, idxO, 'scrap_market_voth_hall'); }
          else if (modO === 8) { oRole = 'mushroom_tender'; oWork = pickList(allMushroomWork, idxO, 'scrap_market_rotunda'); }
        }

        var oa = SIM.actor({
          id: 'ring_res_' + idxO,
          role: oRole,
          home: oh.id,
          work: oWork,
          culture: oh.culture === 'voth' ? 'voth' : 'vinvolk',
          wealth: oh.district === 'outer_shanty' ? 0.22 : (oh.culture === 'voth' ? 0.68 : 0.46),
          zone: 'outer',
          resident: true
        });
        oa.wears = ['salvage_coat', 'work_boots'];
        oa.sets = 1;
        if (oRole === 'levy_recruit') levyRecruits.push(oa);
        else if (oRole === 'porter_cartman' && cartDrivers.length < 18) cartDrivers.push(oa);
        else if (idxO % 7 === 0) spectatorsPool.push(oa);
        outerActors++;
      }
    }

    // Bind 16 Porter Cartmen as live Economy Haul Carts
    for (var cdi = 0; cdi < Math.min(16, cartDrivers.length); cdi++) {
      SIM.cart(cartDrivers[cdi]);
    }

    // 9. Caravan & River Barge Events
    SIM.event({
      id: 'ev_voth_tribute_caravan',
      kind: 'caravan',
      org: 'voth_caravans',
      every: [2, 4],
      window: [6, 19],
      from: ['port_voth_se'],
      to: ['port_voth_se'],
      size: [2, 4],
      unit: [{ role: 'voth_caravan_guard', n: 3 }],
      layer: 'pedestrian',
      mode: 'ride',
      speed: SIM.SPEED.ride,
      beasts: 'pack_beetle',
      legs: [
        { activity: 'TRADE', mins: 35, kinds: ['market'] },
        { activity: 'GUARD', mins: 20, kinds: ['barracks'] }
      ]
    });

    SIM.event({
      id: 'ev_torus_cider_train',
      kind: 'caravan',
      org: 'torus_trains',
      every: [3, 5],
      window: [7, 18],
      from: ['port_torus_nw', 'port_steppe_sw'],
      to: 'other',
      size: [2, 3],
      unit: [{ role: 'torus_factor', n: 3 }],
      layer: 'pedestrian',
      mode: 'walk',
      speed: SIM.SPEED.walk,
      beasts: 'pack_beetle',
      legs: [
        { activity: 'WATER', mins: 15, kinds: ['wharf', 'well'] },
        { activity: 'TRADE', mins: 40, kinds: ['market'] }
      ]
    });

    SIM.event({
      id: 'ev_drim_salvage_barge',
      kind: 'barge',
      org: 'drim_bargemen',
      every: [2, 4],
      window: [6, 20],
      from: ['port_drim_upriver'],
      to: ['port_drim_downriver'],
      size: [1, 2],
      unit: [{ role: 'drim_barge_crew', n: 2 }],
      layer: 'water',
      mode: 'boat',
      speed: SIM.SPEED.boat,
      legs: [
        { activity: 'TRADE', mins: 30, kinds: ['wharf'] }
      ]
    });

    // 10. Crime & Inquisition Surveillance (Ordinators & Garrison Watch + Quiet Vaults + Outer Shanty Guild)
    SIM.crime({
      seed: plan.seed ^ 0x51a7,
      share: 0.002,
      guard: function (a) { return a.role === 'garrison_soldier' || a.role === 'ordinator_inquisitor'; },
      jails: ['jail'],
      guardActs: ['PATROL', 'GUARD'],
      crimes: {
        pickpocket: { acts: ['BUY', 'TRADE', 'WATCH_BOUT', 'SOCIALIZE'], at: ['market', 'arena_bleachers'], hours: [8, 20], chance: 0.22, loss: 12, gain: 16 },
        burglary: { hours: [23, 4], chance: 0.12, share: 0.15 },
        assault: { below: 32, acts: ['DRINK', 'WATCH_BOUT'], chance: 0.04 }
      },
      seen: { base: 0.28, perWitness: 0.05, guard: 0.45, night: 0.45, max: 0.94, nightHours: [21, 5] },
      arrest: { reach: 180, base: 0.80, ratio: 0.02, respond: 20 },
      jail: { act: 'JAIL', days: 3, resist: 0.25, resistDays: 7, lieLow: 2 },
      guild: { kinds: ['tavern'], hideReach: 220, hideMins: 60, abstractHide: 0.4, items: 1, fence: { acts: ['DRINK', 'SOCIALIZE'], mins: 20, perServing: 3, perItem: 10 } }
    });

    // 11. Bespoke Drum Step Hooks:
    //     (A) The Cauldron Gladiatorial Schedule (08:00-11:30 beast-baiting, 12:00-18:00 main bouts + bleacher crowds, 18:00-22:00 tavern surge)
    //     (B) Garrison Levy & Assimilation Oath Routine (09:00-11:00 & 15:00-17:00)
    var arenaState = { boutCount: 0, activeFighters: 0, activeSpectators: 0, levySworn: 0, phase: 'idle' };
    var bleacherIds = ['arena_bleachers_n', 'arena_bleachers_s', 'arena_bleachers_e', 'arena_governor_box'];

    function drumArenaAndLevyHook(minute) {
      var mDay = ((minute % 1440) + 1440) % 1440;
      var h = mDay / 60;

      if (h >= 8 && h < 11.5) {
        arenaState.phase = 'morning_beast_baiting';
        if (mDay % 30 === 0) {
          var bIdx = Math.floor(minute / 30);
          for (var bi3 = 0; bi3 < Math.min(4, arenaBeasts.length); bi3++) {
            var beast = arenaBeasts[(bIdx + bi3) % arenaBeasts.length];
            var spB = sandSpots[(bi3 * 3) % sandSpots.length];
            SIM.command(beast, { act: 'DRILL', place: 'arena_sand_pit', spot: { x: spB[0], z: spB[1], y: spB[2] }, mins: 28, by: 'ludus_lanista' });
          }
          for (var gi2 = 0; gi2 < Math.min(6, gladiators.length); gi2++) {
            var gDr = gladiators[(bIdx + gi2) % gladiators.length];
            var spG = sandSpots[(gi2 * 2 + 1) % sandSpots.length];
            SIM.command(gDr, { act: 'DRILL', place: 'arena_sand_pit', spot: { x: spG[0], z: spG[1], y: spG[2] }, mins: 28, by: 'ludus_lanista' });
          }
        }
      } else if (h >= 12 && h < 18) {
        arenaState.phase = 'gladiatorial_bouts';
        if (mDay % 30 === 0) {
          arenaState.boutCount++;
          var wave = Math.floor(minute / 30);
          var fightersNow = 0;
          for (var gf = 0; gf < Math.min(12, gladiators.length); gf++) {
            var glF = gladiators[(wave * 3 + gf) % gladiators.length];
            var spF = sandSpots[gf % sandSpots.length];
            SIM.command(glF, { act: 'FIGHT_BOUT', place: 'arena_sand_pit', spot: { x: spF[0], z: spF[1], y: spF[2] }, mins: 29, by: 'cauldron_horn' });
            fightersNow++;
          }
          for (var bf = 0; bf < Math.min(4, arenaBeasts.length); bf++) {
            var bsF = arenaBeasts[(wave + bf) % arenaBeasts.length];
            var spBs = sandSpots[(12 + bf) % sandSpots.length];
            SIM.command(bsF, { act: 'FIGHT_BOUT', place: 'arena_sand_pit', spot: { x: spBs[0], z: spBs[1], y: spBs[2] }, mins: 29, by: 'cauldron_horn' });
            fightersNow++;
          }
          arenaState.activeFighters = fightersNow;

          // Pull a lively rotating wave of spectators onto all 4 bleacher sections & Governor's Box
          var specWave = Math.min(160, spectatorsPool.length);
          for (var sw = 0; sw < specWave; sw++) {
            var spActor = spectatorsPool[(wave * 53 + sw) % spectatorsPool.length];
            var targetBl = spActor.culture === 'voth' && sw % 3 === 0 ? 'arena_governor_box' : bleacherIds[sw % 3];
            SIM.command(spActor, { act: 'WATCH_BOUT', place: targetBl, mins: 58, by: 'arena_crowd' });
          }
        }
      } else if (h >= 18 && h < 22) {
        arenaState.phase = 'post_bout_tavern_surge';
        arenaState.activeFighters = 0;
      } else {
        arenaState.phase = 'curfew_rest';
        arenaState.activeFighters = 0;
      }

      // Garrison Levy & Assimilation Oath cohorts (09:00-11:00 and 15:00-17:00)
      if (((h >= 9 && h < 11) || (h >= 15 && h < 17)) && mDay % 60 === 0 && levyRecruits.length > 0) {
        var cohort = Math.floor(minute / 60);
        for (var lr = 0; lr < Math.min(28, levyRecruits.length); lr++) {
          var rec = levyRecruits[(cohort * 17 + lr) % levyRecruits.length];
          SIM.command(rec, { act: 'LEVY_OATH', place: 'fort_levy_hall', mins: 55, by: 'military_governor' });
        }
        arenaState.levySworn += Math.min(28, levyRecruits.length);
      }
    }

    SIM.stepHooks = [drumArenaAndLevyHook];

    // Place all 13,500 residents cleanly at initial clock time & trigger initial arena/caravan state
    SIM.normalize();
    var problems = SIM.check();
    SIM.jump();
    drumArenaAndLevyHook(SIM.minute());
    // Fire one Voth caravan & one Drim Rivrh barge right away so trade roads and river are immediately alive
    if (SIM.R.event.ev_voth_tribute_caravan) SIM.fire(SIM.R.event.ev_voth_tribute_caravan, SIM.minute(), SIM.time());
    if (SIM.R.event.ev_drim_salvage_barge) SIM.fire(SIM.R.event.ev_drim_salvage_barge, SIM.minute(), SIM.time());
    SIM.step();

    // Count live arena fighters & spectators
    function refreshArenaCounts() {
      var fCnt = 0, sCnt = 0;
      var sandP = SIM.R.place.arena_sand_pit;
      if (sandP && sandP.occ) fCnt = (sandP.occ.FIGHT_BOUT == null ? 0 : sandP.occ.FIGHT_BOUT) + (sandP.occ.DRILL == null ? 0 : sandP.occ.DRILL);
      for (var bi4 = 0; bi4 < bleacherIds.length; bi4++) {
        var bp = SIM.R.place[bleacherIds[bi4]];
        if (bp && bp.occ) sCnt += (bp.occ.WATCH_BOUT == null ? 0 : bp.occ.WATCH_BOUT);
      }
      arenaState.activeFighters = fCnt;
      arenaState.activeSpectators = sCnt;
      return arenaState;
    }
    refreshArenaCounts();

    return {
      residents: arcologyActors + outerActors,
      arcologyResidents: arcologyActors,
      outerResidents: outerActors,
      carts: SIM.ECON ? SIM.ECON.carts.length : 0,
      nav: navStats,
      problems: problems,
      errors: simErrors,
      arenaState: arenaState,
      refreshArenaCounts: refreshArenaCounts
    };
  }

  DRUM.initSim = initSim;
})(typeof window !== 'undefined' ? window : globalThis);
