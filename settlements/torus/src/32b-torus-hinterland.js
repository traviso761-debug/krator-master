// ================================================================= TORUS — 32b: Soleri-Farm Hinterlands (2/3 Ruined, 1/3 Working) & Decayed Transit ([G data])
// Builds the 6 km outer agricultural hinterland around Torus (r = 1,180..2,940 m) using all 8 Soleri farm families
// (kits/metropolis/src/46f-mp-farm.js: pod, vault, stack, hall, market, watertower, aqueduct, pumphouse):
//   - 12 Hexagonal Soleri Growing-Pod Honeycomb Arrays (~140 pods): 8 arrays (2/3) in Cataclysm ruins + 4 arrays (1/3)
//     rehabilitated as active Rinkvolk farms & heirloom/sky-fruitvine orchards with farmstead outbuildings & lanes.
//   - 4 Satellite Soleri Farm Hubs, 12 Contour Vault Houses, 10 Slope-Stepped Growing Stacks, and 3 Arched Aqueduct Lines.
//   - Mostly decayed Ancient transit network (kits/ancient-transit KTRANSIT: highway, elevated monorails, cargo rails & trains).
// Zero THREE, zero DOM. Avoids `|| <number>` per tools/check_source.py ORNUM rule.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});
  var DEG = Math.PI / 180;

  function pickSoleriState(rng, cuts) {
    var u = rng.next();
    var states = TORUS.KITS.soleriStates;
    for (var i = 0; i < cuts.length; i++) {
      if (u < cuts[i]) return states[i];
    }
    return 'broken';
  }

  function mapSoleriToTagState(soleriState, reclaimed) {
    if (reclaimed) return 'reclaimed';
    if (soleriState === 'intact') return 'intact';
    if (soleriState === 'fallen') return 'toppled';
    return 'ruined';
  }

  function buildHinterland(ctx) {
    var rng = ctx.rng;
    var KITS = ctx.KITS;
    var byKey = KITS.soleriByKey;
    var tryInsertObb = ctx.tryInsertObb;
    var inRiverCorridor = ctx.inRiverCorridor;
    var groundAt = ctx.groundAt;

    var soleriStructures = [];
    var soleriHubs = [];
    var podArrays = [];
    var aqueductLines = [];
    var hinterlandFields = [];
    var farmOutbuildings = [];
    var farmLanes = [];

    function placeSoleri(id, famKey, x, z, ry, soleriState, reclaimed, groupId, extra) {
      if (inRiverCorridor(x, z, 24)) return null;
      var fam = byKey[famKey];
      var y = groundAt(x, z);
      var rec = {
        id: id,
        group: groupId,
        kit: 'metropolis-farm',
        family: famKey,
        name: fam.name,
        x: +x.toFixed(2),
        y: +y.toFixed(2),
        z: +z.toFixed(2),
        r: +Math.hypot(x, z).toFixed(2),
        deg: +(((Math.atan2(z, x) / DEG) % 360 + 360) % 360).toFixed(2),
        ry: +ry.toFixed(4),
        w: fam.w,
        d: fam.d,
        h: fam.h,
        pop: 0,
        culture: 'ancient',
        types: fam.types,
        soleriState: soleriState,
        reclaimedByTenders: !!reclaimed,
        state: mapSoleriToTagState(soleriState, reclaimed),
        overgrowth: reclaimed ? 0.08 : +(0.48 + 0.48 * rng.next()).toFixed(2)
      };
      if (extra) {
        for (var ek in extra) rec[ek] = extra[ek];
      }
      if (!tryInsertObb(rec, 1.2)) return null;
      soleriStructures.push(rec);
      return rec;
    }

    function placeFarmOutbuilding(id, defKey, x, z, ry, groupId, roleLabel) {
      if (inRiverCorridor(x, z, 16)) return null;
      var defItem = KITS.byKey[defKey];
      if (!defItem) return null;
      var y = groundAt(x, z);
      var rec = {
        id: id,
        group: groupId,
        kit: defItem.kit,
        key: defItem.key,
        cls: defItem.cls,
        roleLabel: roleLabel,
        x: +x.toFixed(2),
        y: +y.toFixed(2),
        z: +z.toFixed(2),
        r: +Math.hypot(x, z).toFixed(2),
        deg: +(((Math.atan2(z, x) / DEG) % 360 + 360) % 360).toFixed(2),
        ry: +ry.toFixed(4),
        w: defItem.w,
        d: defItem.d,
        h: defItem.h,
        st: defItem.st,
        pop: 0,
        culture: 'post-apoc',
        style: defItem.style,
        types: defItem.types,
        wealth: defItem.wealth,
        job: defItem.job,
        district: 'soleri_working_farm',
        state: 'intact'
      };
      if (!tryInsertObb(rec, 1.5)) return null;
      farmOutbuildings.push(rec);
      return rec;
    }

    // 1. Four Satellite Soleri Farm Hubs (hall + market + watertower) at outer commuter monorail nodes
    var HUB_DEFS = [
      { id: 'soleri_hub_east', name: 'East Orchard Soleri Hub', r: 2020, deg: 32 },
      { id: 'soleri_hub_se', name: 'South-East Valley Soleri Hub', r: 2220, deg: 112 },
      { id: 'soleri_hub_sw', name: 'South-West Canal Soleri Hub', r: 2280, deg: 210 },
      { id: 'soleri_hub_west', name: 'West Cider-Plain Soleri Hub', r: 1980, deg: 256 }
    ];
    for (var hi = 0; hi < HUB_DEFS.length; hi++) {
      var hd = HUB_DEFS[hi], ha = hd.deg * DEG;
      var hx = hd.r * Math.cos(ha), hz = hd.r * Math.sin(ha);
      var hry = -ha;
      var tx = -Math.sin(ha), tz = Math.cos(ha);
      var hallRec = placeSoleri(hd.id + '_hall', 'hall', hx, hz, hry, pickSoleriState(rng, KITS.soleriFarmCuts), false, hd.id);
      var mktRec = placeSoleri(hd.id + '_market', 'market', hx + tx * 98, hz + tz * 98, hry, pickSoleriState(rng, KITS.soleriFarmCuts), false, hd.id);
      var wtRec = placeSoleri(hd.id + '_watertower', 'watertower', hx - tx * 82, hz - tz * 82, hry, pickSoleriState(rng, KITS.soleriFarmCuts), false, hd.id);
      soleriHubs.push({
        id: hd.id, name: hd.name, x: +hx.toFixed(1), z: +hz.toFixed(1), r: hd.r, deg: hd.deg,
        members: [hallRec && hallRec.id, mktRec && mktRec.id, wtRec && wtRec.id].filter(Boolean)
      });
    }

    // 2. Twelve Hexagonal Soleri Growing-Pod Honeycomb Arrays:
    //    Exactly 4 Working Arrays (1/3 = 33.3%: 2 working farms + 2 working orchards near Customs Gates & patched aqueducts)
    //    and 8 Ruined Arrays (2/3 = 66.7%: outer & mid-valley Cataclysm ruins overgrown by SWBay flora).
    var POD_ARRAY_DEFS = [
      // --- 4 Working Rinkvolk Farm & Orchard Pod Arrays (1/3: surveyed swlowlands & swbay crops) ---
      { id: 'pod_work_east_orchard', name: 'East Gate Rehabilitated Persimmon, Madrone & Marula Orchard Pods', r: 1450, deg: 20, rings: 1, mode: 'working_orchard', gateDeg: 22.5, cropId: 'persimmon', intercropIds: ['persimmon', 'madrone', 'marula', 'gatepod'] },
      { id: 'pod_work_west_vineyard', name: 'West Cider-Road Working Sky-Fruitvine, Fig & Rattle-Coffee Pods', r: 1430, deg: 192, rings: 1, mode: 'working_orchard', gateDeg: 187.5, cropId: 'sky-fruitvine', intercropIds: ['sky-fruitvine', 'fig', 'rattlepod', 'madrone'] },
      { id: 'pod_work_sw_aqueduct', name: 'South-West Aqueduct Irrigated Bambara, Murnong & Cotton Pods', r: 1490, deg: 230, rings: 1, mode: 'working_farm', gateDeg: 232.5, cropId: 'bambara', intercropIds: ['bambara', 'murnong', 'dust-lentil', 'cotton'] },
      { id: 'pod_work_south_grain', name: 'South Granary-Road Working Plain Emmer, Dustmillet & Maar-Yam Pods', r: 1470, deg: 280, rings: 1, mode: 'working_farm', gateDeg: 277.5, cropId: 'emmer', intercropIds: ['emmer', 'dustmillet', 'maar-yam', 'bambara'] },

      // --- 8 Ruined Cataclysm-Abandoned Soleri Pod Arrays (2/3) ---
      { id: 'pod_ruin_nne', name: 'Collapsed NNE Valley Honeycomb Pods', r: 1820, deg: 356, rings: 2, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_ene', name: 'Shattered ENE Outer Honeycomb Pods', r: 2420, deg: 46, rings: 2, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_east_far', name: 'Overgrown East-Flank Soleri Pods', r: 2660, deg: 74, rings: 1, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_ese', name: 'Broken ESE Canal Honeycomb Pods', r: 1860, deg: 122, rings: 1, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_sse', name: 'Ruined SSE Breadbasket Honeycomb Pods', r: 1840, deg: 160, rings: 2, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_ssw_far', name: 'Fallen SSW Outer Honeycomb Pods', r: 2580, deg: 198, rings: 2, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_wsw', name: 'Gutted WSW Rail-Loop Honeycomb Pods', r: 1920, deg: 242, rings: 2, mode: 'ruined', cropId: null },
      { id: 'pod_ruin_wnw', name: 'Stump-Ruined WNW River-Bench Pods', r: 2360, deg: 288, rings: 1, mode: 'ruined', cropId: null }
    ];

    var step = 61.0, rt32 = Math.sqrt(3) * 0.5;
    var WORK_OUTBLD_FARM = ['farmhouse', 'swa-seed-silo', 'granary', 'swa-valve-well'];
    var WORK_OUTBLD_ORCHARD = ['farmhouse', 'swa-cider-press', 'swa-still-vat', 'shop-food'];

    for (var pa = 0; pa < POD_ARRAY_DEFS.length; pa++) {
      var pd = POD_ARRAY_DEFS[pa], pang = pd.deg * DEG;
      var isWorking = pd.mode !== 'ruined';
      var cx = pd.r * Math.cos(pang), cz = pd.r * Math.sin(pang);
      var ca = Math.cos(pang), sa = Math.sin(pang);
      var placedPods = [];
      var placedOutblds = [];
      var cellIdx = 0;

      for (var q = -pd.rings; q <= pd.rings; q++) {
        for (var rk = -pd.rings; rk <= pd.rings; rk++) {
          if (Math.abs(q + rk) > pd.rings) continue;
          var lx = step * (q + 0.5 * rk), lz = step * rt32 * rk;
          var px = cx + lx * ca - lz * sa;
          var pz = cz + lx * sa + lz * ca;
          var st;
          if (isWorking) {
            // Working farm/orchard pods: central & majority pods keep intact glazed domes; 2 edge pods operate as open-air sun-court beds
            st = (cellIdx % 4 === 3) ? 'gutted' : 'intact';
          } else {
            st = pickSoleriState(rng, KITS.soleriFarmCuts);
            if (st === 'intact') st = (cellIdx % 2 === 0) ? 'broken' : 'skeleton';
          }
          var pRec = placeSoleri(pd.id + '_' + placedPods.length, 'pod', px, pz, -pang, st, isWorking, pd.id, {
            arrayMode: pd.mode,
            cropId: pd.cropId
          });
          if (pRec) placedPods.push(pRec.id);
          cellIdx++;
        }
      }

      if (isWorking) {
        // Place Rinkvolk farmstead outbuildings around the working pod array's service apron
        var obKeys = pd.mode === 'working_orchard' ? WORK_OUTBLD_ORCHARD : WORK_OUTBLD_FARM;
        var apronR = (pd.rings + 1) * step + 28.0;
        for (var ob = 0; ob < obKeys.length; ob++) {
          var obAng = pang + (-0.55 + 0.36 * ob);
          var ox = cx - Math.cos(obAng) * apronR + (-Math.sin(pang)) * ((ob - 1.5) * 26.0);
          var oz = cz - Math.sin(obAng) * apronR + (Math.cos(pang)) * ((ob - 1.5) * 26.0);
          var obRec = placeFarmOutbuilding(pd.id + '_outbld_' + ob, obKeys[ob], ox, oz, -pang + Math.PI * 0.5, pd.id, pd.mode);
          if (obRec) placedOutblds.push(obRec.id);
        }

        // Add cultivated working orchard & crop fields flanking the rehabilitated pod array
        for (var side = -1; side <= 1; side += 2) {
          var fDeg0 = pd.deg + (side < 0 ? -7.2 : 2.6);
          var fDeg1 = pd.deg + (side < 0 ? -2.6 : 7.2);
          var fMid = 0.5 * (fDeg0 + fDeg1);
          var fxW = pd.r * Math.cos(fMid * DEG), fzW = pd.r * Math.sin(fMid * DEG);
          if (!inRiverCorridor(fxW, fzW, 28)) {
            hinterlandFields.push({
              id: pd.id + '_field_' + (side < 0 ? 'a' : 'b'),
              kind: pd.mode === 'working_orchard' ? 'working_pod_orchard' : 'working_pod_farm',
              cropId: pd.cropId,
              arrayId: pd.id,
              ruined: false,
              rIn: pd.r - 92,
              rOut: pd.r + 96,
              deg0: (fDeg0 + 360) % 360,
              deg1: (fDeg1 + 360) % 360,
              elev: +groundAt(fxW, fzW).toFixed(2)
            });
          }
        }

        // Dirt/cobble farm service lane connecting the Customs Gate to this working pod array
        var gAng = pd.gateDeg * DEG;
        farmLanes.push({
          id: 'farm_lane_' + pd.id,
          from: [+(1146 * Math.cos(gAng)).toFixed(1), +(1146 * Math.sin(gAng)).toFixed(1)],
          to: [+(cx - 64 * Math.cos(pang)).toFixed(1), +(cz - 64 * Math.sin(pang)).toFixed(1)],
          width: 7.0,
          mode: pd.mode
        });
      }

      podArrays.push({
        id: pd.id,
        name: pd.name,
        mode: pd.mode,
        working: isWorking,
        cropId: pd.cropId,
        x: +cx.toFixed(1),
        z: +cz.toFixed(1),
        r: pd.r,
        deg: pd.deg,
        rings: pd.rings,
        podIds: placedPods,
        outbuildingIds: placedOutblds
      });
    }

    // 3. Twelve Contour Soleri Vault Houses (100x40m: 3 reclaimed greenhouse nurseries + 9 ruined)
    var VAULT_SPOTS = [
      [1310, 28, true], [1325, 224, true], [1335, 272, true],
      [1640, 82, false], [1580, 136, false], [2080, 150, false],
      [1660, 206, false], [2160, 254, false], [2420, 208, false],
      [2520, 184, false], [2560, 92, false], [2180, 14, false]
    ];
    for (var vi = 0; vi < VAULT_SPOTS.length; vi++) {
      var vr = VAULT_SPOTS[vi][0], vd = VAULT_SPOTS[vi][1], vRec = VAULT_SPOTS[vi][2], va = vd * DEG;
      var vst = vRec ? 'intact' : pickSoleriState(rng, KITS.soleriFarmCuts);
      if (!vRec && vst === 'intact') vst = 'crown';
      placeSoleri('soleri_vault_' + vi, 'vault', vr * Math.cos(va), vr * Math.sin(va), va + Math.PI * 0.5, vst, vRec, 'contour_vaults');
    }

    // 4. Ten Slope-Stepped Soleri Growing Stacks (64x72m: 2 terraced-farm reclaimed + 8 ruined)
    var STACK_SPOTS = [
      [1620, 184, true], [1650, 18, true],
      [2480, 12, false], [2540, 64, false], [2480, 132, false], [2600, 168, false],
      [2640, 228, false], [2460, 256, false], [2300, 276, false], [2120, 348, false]
    ];
    for (var si = 0; si < STACK_SPOTS.length; si++) {
      var sr = STACK_SPOTS[si][0], sd = STACK_SPOTS[si][1], sRec = STACK_SPOTS[si][2], sa2 = sd * DEG;
      var sry = Math.atan2(-Math.cos(sa2), -Math.sin(sa2));
      var sst = sRec ? 'intact' : pickSoleriState(rng, KITS.soleriFarmCuts);
      if (!sRec && sst === 'intact') sst = 'broken';
      placeSoleri('soleri_stack_' + si, 'stack', sr * Math.cos(sa2), sr * Math.sin(sa2), sry, sst, sRec, 'slope_stacks');
    }

    // 5. Three Arched Soleri Aqueduct Lines (66 m modules end-to-end) + Intake Pump Houses
    var AQ_DEFS = [
      { id: 'soleri_aq_sw', deg: 222, rPump: 2680, rEnd: 1170, patchInnerCount: 5 },
      { id: 'soleri_aq_west', deg: 178, rPump: 2560, rEnd: 1190, patchInnerCount: 3 },
      { id: 'soleri_aq_east', deg: 10, rPump: 2520, rEnd: 1190, patchInnerCount: 3 }
    ];
    for (var ai = 0; ai < AQ_DEFS.length; ai++) {
      var aq = AQ_DEFS[ai], aa = aq.deg * DEG;
      var ux = Math.cos(aa), uz = Math.sin(aa);
      var aqRy = Math.atan2(-uz, ux);
      var pump = placeSoleri(aq.id + '_pumphouse', 'pumphouse', aq.rPump * ux, aq.rPump * uz, aqRy, pickSoleriState(rng, KITS.soleriFarmCuts), aq.patchInnerCount >= 5, aq.id);
      var modIds = [];
      var curR = aq.rPump - 74;
      var mIdx = 0;
      while (curR >= aq.rEnd) {
        var remainingSteps = Math.floor((curR - aq.rEnd) / 69.5);
        var patched = remainingSteps < aq.patchInnerCount;
        var aqState = patched ? 'intact' : pickSoleriState(rng, KITS.soleriAqCuts);
        if (!patched && aqState === 'intact') aqState = 'crown';
        var mRec = placeSoleri(aq.id + '_m' + mIdx, 'aqueduct', curR * ux, curR * uz, aqRy, aqState, patched, aq.id);
        if (mRec) modIds.push(mRec.id);
        curR -= 69.5;
        mIdx++;
      }
      aqueductLines.push({ id: aq.id, deg: aq.deg, pumphouseId: pump && pump.id, moduleIds: modIds });
    }

    // 6. Outer Hinterland Contour Fields (2/3 overgrown ancient paddies/thickets, 1/3 day-worked grain & heirloom orchards)
    var FIELD_KINDS_RUINED = ['overgrown_soleri_paddy', 'feral_rootstock_thicket', 'silted_ancient_canal_bed'];
    var FIELD_KINDS_ACTIVE = ['dayworked_breadbasket_grain', 'reclaimed_heirloom_orchard'];
    for (var fi = 0; fi < 36; fi++) {
      var fd0 = fi * 10.0, fdMid = fd0 + 5.0;
      var rInF = 1620 + (fi % 2) * 580, rOutF = rInF + 520;
      var fx = 0.5 * (rInF + rOutF) * Math.cos(fdMid * DEG);
      var fz = 0.5 * (rInF + rOutF) * Math.sin(fdMid * DEG);
      var ruinedField = (fi % 3 !== 0);
      hinterlandFields.push({
        id: 'hinterland_field_' + fi,
        kind: inRiverCorridor(fx, fz, 45) ? 'river_wild_reedbed' : (ruinedField ? FIELD_KINDS_RUINED[fi % 3] : FIELD_KINDS_ACTIVE[(fi / 3) % 2]),
        ruined: ruinedField,
        rIn: rInF,
        rOut: rOutF,
        deg0: fd0,
        deg1: fd0 + 10.0,
        elev: +groundAt(fx, fz).toFixed(2)
      });
    }

    // 7. Mostly Decayed Ancient Transit Network (kits/ancient-transit KTRANSIT)
    var KT = root.KTRANSIT;
    if (!KT) throw new Error('TORUS.buildHinterland requires kits/ancient-transit (KTRANSIT) loaded');

    var DECAY_SPAN = { intact: 0.16, cracked: 0.28, collapsed: 0.34, gone: 0.22 };
    var DECAY_RAIL = { intact: 0.20, bent: 0.44, gone: 0.36 };
    var DECAY_STATION = { intact: 0.0, ruined: 0.65, collapsed: 0.35 };

    function polarPt(r, deg) {
      return [+(r * Math.cos(deg * DEG)).toFixed(1), +(r * Math.sin(deg * DEG)).toFixed(1)];
    }

    var hwPts = [[-2760, -820], [-1820, -1380], [-420, -1720], [1180, -1580], [2680, -920]];
    var highway = KT.highway(hwPts, {
      id: 'tr_hw_valley',
      seed: (ctx.worldSeed ^ 0x51a7) >>> 0,
      ground: groundAt,
      ruin: DECAY_SPAN,
      overgrowth: 2,
      ramps: [{ s: 1150, side: 1, dir: 'off' }, { s: 3650, side: -1, dir: 'on' }],
      blockades: [900, 2600, 4200]
    });
    KT.cull(highway, ctx.isTransitBlocked);

    var monoSouthPts = [polarPt(1158, 248), polarPt(1620, 236), polarPt(2280, 206), polarPt(2260, 152), polarPt(2220, 108)];
    var pMonoS = KT.path(monoSouthPts, { ground: groundAt, radius: 160 });
    var stSwS = Math.max(120, Math.min(pMonoS.L - 120, Math.round(pMonoS.project(2280 * Math.cos(210 * DEG), 2280 * Math.sin(210 * DEG)).s)));
    var stSeS = Math.max(120, Math.min(pMonoS.L - 120, Math.round(pMonoS.L - 180)));
    var monoSouth = KT.rail(monoSouthPts, {
      id: 'tr_mono_south_hubs',
      seed: (ctx.worldSeed ^ 0x62b1) >>> 0,
      ground: groundAt,
      elevated: true,
      ruin: DECAY_SPAN,
      railRuin: DECAY_RAIL,
      stations: [stSwS, stSeS],
      stationRuin: DECAY_STATION,
      overgrowth: 2
    });
    KT.cull(monoSouth, ctx.isTransitBlocked);

    var monoNorthPts = [polarPt(1168, 254), polarPt(1940, 268), polarPt(1880, 344), polarPt(2020, 26)];
    var pMonoN = KT.path(monoNorthPts, { ground: groundAt, radius: 160 });
    var stWestS = Math.max(120, Math.min(pMonoN.L - 120, Math.round(pMonoN.project(1980 * Math.cos(266 * DEG), 1980 * Math.sin(266 * DEG)).s)));
    var stEastS = Math.max(120, Math.min(pMonoN.L - 120, Math.round(pMonoN.L - 160)));
    var monoNorth = KT.rail(monoNorthPts, {
      id: 'tr_mono_west_east_hubs',
      seed: (ctx.worldSeed ^ 0x73c2) >>> 0,
      ground: groundAt,
      elevated: true,
      ruin: DECAY_SPAN,
      railRuin: DECAY_RAIL,
      stations: [stWestS, stEastS],
      stationRuin: DECAY_STATION,
      overgrowth: 2
    });
    KT.cull(monoNorth, ctx.isTransitBlocked);

    var farmStreets = [
      { id: 'voth_tithe_road', pts: [polarPt(1145, 142.5), polarPt(2850, 142.5)], width: 11 },
      { id: 'west_cider_road', pts: [polarPt(1145, 187.5), polarPt(2850, 187.5)], width: 11 },
      { id: 'south_grain_road', pts: [polarPt(1145, 277.5), polarPt(2850, 277.5)], width: 11 },
      { id: 'east_orchard_road', pts: [polarPt(1145, 22.5), polarPt(2850, 22.5)], width: 11 }
    ];
    var cargoWestPts = [polarPt(1162, 234), polarPt(1780, 240), polarPt(1740, 286), polarPt(1420, 204), polarPt(1760, 168)];
    var cargoWest = KT.rail(cargoWestPts, {
      id: 'tr_cargo_west_pods',
      seed: (ctx.worldSeed ^ 0x84d3) >>> 0,
      ground: groundAt,
      elevated: false,
      catenary: true,
      railRuin: DECAY_RAIL,
      streets: farmStreets
    });
    var cargoEastPts = [polarPt(1168, 26), polarPt(1680, 356), polarPt(2320, 40), polarPt(1940, 86)];
    var cargoEast = KT.rail(cargoEastPts, {
      id: 'tr_cargo_east_pods',
      seed: (ctx.worldSeed ^ 0x95e4) >>> 0,
      ground: groundAt,
      elevated: false,
      catenary: true,
      railRuin: DECAY_RAIL,
      streets: farmStreets
    });

    var trains = [
      KT.train(cargoWest, {
        id: 'tr_train_harvest_derailed_w',
        s: Math.round(cargoWest.L * 0.58),
        kind: 'freight',
        state: 'derailed',
        from: 2,
        cars: ['loco', 'box', 'tank', 'flat', 'box', 'tank', 'flat', 'box', 'tank'],
        burnt: 0.45
      }),
      KT.train(cargoEast, {
        id: 'tr_train_harvest_derailed_e',
        s: Math.round(cargoEast.L * 0.66),
        kind: 'freight',
        state: 'derailed',
        from: 1,
        cars: ['loco', 'box', 'box', 'flat', 'tank', 'box', 'flat', 'box'],
        burnt: 0.65
      }),
      KT.train(monoSouth, {
        id: 'tr_train_commuter_fallen',
        s: Math.round(monoSouth.L * 0.48),
        kind: 'passenger',
        state: 'fallen',
        cars: 4
      }),
      KT.train(cargoWest, {
        id: 'tr_train_beetle_flatcars',
        s: 165,
        kind: 'freight',
        state: 'standing',
        cars: ['flat', 'flat', 'flat'],
        burnt: 0
      })
    ];

    return {
      soleriStructures: soleriStructures,
      soleriHubs: soleriHubs,
      podArrays: podArrays,
      aqueductLines: aqueductLines,
      hinterlandFields: hinterlandFields,
      farmOutbuildings: farmOutbuildings,
      farmLanes: farmLanes,
      transit: {
        highway: highway,
        elevatedRails: [monoSouth, monoNorth],
        cargoRails: [cargoWest, cargoEast],
        trains: trains
      }
    };
  }

  TORUS.buildHinterland = buildHinterland;
})(typeof window !== 'undefined' ? window : globalThis);
