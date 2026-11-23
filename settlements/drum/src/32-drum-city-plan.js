// ================================================================= DRUM — 32: Radial City Layout ([G data])
// Pure deterministic settlement layout for Drum (Scale Model 5.1 px=673, py=932, elev=-792 m).
// Zero THREE, zero DOM. Uses KRAND + KSPACE + KTAGS.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});
  var DEG = Math.PI / 180;

  function normDeg(d) {
    var x = d % 360;
    return x < 0 ? x + 360 : x;
  }

  function angDiff(a, b) {
    var d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  function obbCorners(b) {
    var c = Math.cos(b.ry), s = Math.sin(b.ry);
    var hw = 0.5 * b.w, hd = 0.5 * b.d;
    return [
      [b.x - hw * c - hd * s, b.z + hw * s - hd * c],
      [b.x + hw * c - hd * s, b.z - hw * s - hd * c],
      [b.x + hw * c + hd * s, b.z - hw * s + hd * c],
      [b.x - hw * c + hd * s, b.z + hw * s + hd * c]
    ];
  }

  function obbOverlap(a, b, pad) {
    var p = pad == null ? 0 : pad;
    var ca = obbCorners(a), cb = obbCorners(b);
    var axes = [
      [Math.cos(a.ry), -Math.sin(a.ry)],
      [Math.sin(a.ry), Math.cos(a.ry)],
      [Math.cos(b.ry), -Math.sin(b.ry)],
      [Math.sin(b.ry), Math.cos(b.ry)]
    ];
    for (var k = 0; k < 4; k++) {
      var ax = axes[k][0], az = axes[k][1];
      var a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (var i = 0; i < 4; i++) {
        var pa = ca[i][0] * ax + ca[i][1] * az;
        var pb = cb[i][0] * ax + cb[i][1] * az;
        if (pa < a0) a0 = pa;
        if (pa > a1) a1 = pa;
        if (pb < b0) b0 = pb;
        if (pb > b1) b1 = pb;
      }
      if (a1 + p <= b0 + 1e-6 || b1 + p <= a0 + 1e-6) return false;
    }
    return true;
  }

  function inRiverCorridor(x, z, pad) {
    var p = pad == null ? 0 : pad;
    var nx = Math.cos(320 * DEG), nz = Math.sin(320 * DEG);
    var tx = -nz, tz = nx;
    var dn = x * nx + z * nz;
    var dt = x * tx + z * tz;
    var riverCenter = 615.0 + 18.0 * Math.sin(dt / 280.0);
    return (dn - riverCenter) > -(22.0 + p);
  }

  function inQuarryZone(r, deg) {
    return r >= 216 && r <= 518 && angDiff(deg, 20.0) <= 31.0;
  }

  function buildCityPlan(seed) {
    var worldSeed = seed == null ? 20261117 : (seed >>> 0);
    var rng = KRAND.stream(KRAND.child(worldSeed, 'drum_city_plan'));
    var space = KSPACE.create({ cell: 32 });
    var arcology = DRUM.buildArcology();
    var KITS = DRUM.KITS;

    var W1_R = 402;
    var W2_R = 636;

    var site = {
      name: 'Drum',
      vothicName: 'Drim',
      nativeName: 'Vinvolk',
      scaleModel51: { id: 'sirb5um6cr', px: 673, py: 932, elev: -792.0 },
      legacy4x: { px: 401, py: 602 },
      river: { id: 'r058', name: 'Drim Rivrh', width: 39.0, bearingDeg: 320.0, centerDist: 615.0 },
      quarry: { afDeg: 20.0, r0: 220.0, r1: 515.0, halfAngleDeg: 31.0 },
      innerWallR: W1_R,
      outerPalisadeR: W2_R
    };

    var landmarks = [];
    var walls = [];
    var gates = [];
    var roads = [];
    var blocks = [];
    var buildings = [];
    var palisadeVehicles = [];
    var links = arcology.links.slice();

    function tryInsertObb(rec, pad) {
      var boundR = 0.5 * Math.hypot(rec.w, rec.d);
      var hit = space.some(rec.x, rec.z, boundR + (pad == null ? 1.0 : pad), function (other) {
        return obbOverlap(rec, other, pad == null ? 0.8 : pad);
      });
      if (hit) return false;
      space.insert(rec, rec.x, rec.z, boundR);
      return true;
    }

    function placePolarLandmark(id, name, role, r, deg, w, d, h, pop, culture, style, types, wealth) {
      var a = deg * DEG;
      var x = +(r * Math.cos(a)).toFixed(2);
      var z = +(r * Math.sin(a)).toFixed(2);
      var ry = Math.atan2(-x, -z);
      var rec = {
        id: id, name: name, kind: 'landmark', role: role,
        x: x, y: 0, z: z, r: r, deg: normDeg(deg), ry: +ry.toFixed(4),
        w: w, d: d, h: h, pop: pop,
        culture: culture, style: style, types: types, wealth: wealth, state: 'intact'
      };
      if (!tryInsertObb(rec, 2.0)) throw new Error('Landmark overlap: ' + id);
      landmarks.push(rec);
      return rec;
    }

    landmarks.push({
      id: 'drum_arcology', name: 'The Ruined Drum Arcology (Levels 1-15 Inhabited)', kind: 'landmark', role: 'arcology',
      x: 0, y: 0, z: 0, r: 0, deg: 0, ry: 0, w: 428, d: 428, h: 550, circR: 214,
      pop: arcology.totalPop, culture: 'ancient', style: 'ancient', types: ['dwelling-multi', 'market', 'industry'],
      wealth: 'middle', state: 'reclaimed'
    });

    var fort = placePolarLandmark('garrison_fortress', 'Garrison Fortress (Praetorium of the Military Governor)', 'governor_seat', 334, 155, 88, 104, 21, 260, 'voth', 'scrap-voth', ['military', 'civic'], 'rich');
    var ord = placePolarLandmark('ordinator_fortress', 'Ordinator Fortress (Inquisition & Watch Bastion)', 'inquisition_bastion', 340, 200, 68, 76, 17, 72, 'voth', 'scrap-voth', ['military', 'religious'], 'rich');
    var arena = placePolarLandmark('gladiatorial_arena', 'The Cauldron (Post-Apoc Gladiatorial Arena)', 'arena', 474, 138, 92, 80, 18, 28, 'post-apoc', 'sw-arcology', ['civic'], 'middle');
    var bourse = placePolarLandmark('scrap_market_rotunda', 'Regional Scrap-Market Bourse & Assay Rotunda', 'scrap_market', 358, 72, 28, 24, 13, 12, 'post-apoc', 'sw-arcology', ['market', 'civic'], 'rich');
    var vmarket = placePolarLandmark('scrap_market_voth_hall', 'Vothic Regional Market & Customs Hall', 'scrap_market', 474, 72, 27, 24, 10, 10, 'voth', 'scrap-voth', ['market'], 'middle');
    var foundry = placePolarLandmark('quarry_salvage_foundry', 'Quarry-Mouth Rotary Salvage Foundry', 'salvage_foundry', 358, 98, 30, 22, 14, 14, 'post-apoc', 'sw-arcology', ['industry'], 'middle');
    var wharf = placePolarLandmark('drum_river_wharf', 'Drum River Fortified Wharf & Sluice House', 'river_wharf', 574, 320, 32, 20, 10, 14, 'post-apoc', 'sw-arcology', ['infrastructure', 'industry'], 'middle');

    var INNER_GATE_DEGS = [
      { id: 'igate_market', deg: 65, name: 'Inner Scrap-Market Gate' },
      { id: 'igate_voth', deg: 125, name: 'Inner Voth & Arena Gate' },
      { id: 'igate_governor', deg: 185, name: 'Inner Governor & Watch Gate' },
      { id: 'igate_steppe', deg: 245, name: 'Inner West Steppe Gate' },
      { id: 'igate_river_w', deg: 305, name: 'Inner Sluice & River Gate' },
      { id: 'igate_quarry', deg: 335, name: 'Inner North Wharf Gate' }
    ];
    walls.push({ id: 'inner_wall_ancient', name: 'Restored Ancient Inner Wall', r: W1_R, thick: 10, h: 11, culture: 'ancient', style: 'ancient', state: 'rehab', bastions: 24 });
    for (var ig = 0; ig < INNER_GATE_DEGS.length; ig++) {
      var gd = INNER_GATE_DEGS[ig], ga = gd.deg * DEG;
      var gateRec = {
        id: gd.id, wall: 'inner_wall_ancient', name: gd.name, r: W1_R, deg: gd.deg,
        x: +(W1_R * Math.cos(ga)).toFixed(2), z: +(W1_R * Math.sin(ga)).toFixed(2),
        ry: +Math.atan2(-Math.cos(ga), -Math.sin(ga)).toFixed(4), w: 18, d: 14, h: 14,
        culture: 'ancient', style: 'ancient', state: 'rehab'
      };
      tryInsertObb(gateRec, 0.5);
      gates.push(gateRec);
    }

    var OUTER_GATE_DEGS = [
      { id: 'ogate_east_salvage', deg: 65, name: 'East Caravan & Salvage Palisade Gate' },
      { id: 'ogate_voth_road', deg: 125, name: 'Great Voth Road Gate' },
      { id: 'ogate_south_kraal', deg: 185, name: 'South Kraal Palisade Gate' },
      { id: 'ogate_scyvoi_steppe', deg: 245, name: 'Scyvoi Frontier Barricade Gate' },
      { id: 'ogate_nw_ford', deg: 290, name: 'North-West River Bluff Gate' }
    ];
    walls.push({ id: 'outer_palisade_scrap', name: 'Outer Scrap & Ruined-Vehicle Palisade', r: W2_R, thick: 8, h: 7.5, culture: 'post-apoc', style: 'vehicle-palisade', state: 'salvage', riverFlankDeg: [296, 344] });
    for (var og = 0; og < OUTER_GATE_DEGS.length; og++) {
      var od = OUTER_GATE_DEGS[og], oa = od.deg * DEG;
      var ogRec = {
        id: od.id, wall: 'outer_palisade_scrap', name: od.name, r: W2_R, deg: od.deg,
        x: +(W2_R * Math.cos(oa)).toFixed(2), z: +(W2_R * Math.sin(oa)).toFixed(2),
        ry: +Math.atan2(-Math.cos(oa), -Math.sin(oa)).toFixed(4), w: 16, d: 12, h: 11,
        culture: 'voth', style: 'scrap-voth', state: 'intact'
      };
      tryInsertObb(ogRec, 0.5);
      gates.push(ogRec);
    }

    var vehTypes = KITS.palisadeVehicles;
    for (var vd = 0; vd < 360; vd += 2.4) {
      if (vd >= 296 && vd <= 344) continue;
      var nearGate = false;
      for (var gk = 0; gk < OUTER_GATE_DEGS.length; gk++) {
        if (angDiff(vd, OUTER_GATE_DEGS[gk].deg) < 2.6) nearGate = true;
      }
      if (nearGate) continue;
      var vt = vehTypes[rng.int(0, vehTypes.length - 1)];
      var vst = vt.states[rng.int(0, vt.states.length - 1)];
      var va = vd * DEG;
      palisadeVehicles.push({
        id: 'pal_veh_' + palisadeVehicles.length, vehicleKey: vt.key, state: vst,
        deg: +vd.toFixed(1), r: +(W2_R + rng.range(-1.4, 1.4)).toFixed(2),
        x: +(W2_R * Math.cos(va)).toFixed(2), z: +(W2_R * Math.sin(va)).toFixed(2),
        ry: +(va + 0.5 * Math.PI + rng.range(-0.14, 0.14)).toFixed(4), w: vt.len, d: vt.wid, h: vt.h
      });
    }

    var RING_STREETS = [224, 278, 332, 388, 416, 454, 492, 530, 562, 594, 624];
    for (var rs = 0; rs < RING_STREETS.length; rs++) {
      roads.push({ id: 'ring_r' + RING_STREETS[rs], kind: 'ring', r: RING_STREETS[rs], width: RING_STREETS[rs] < W1_R ? 11 : (RING_STREETS[rs] <= 530 ? 9 : 7.5) });
    }
    var SPOKES_12 = [];
    for (var sk = 0; sk < 12; sk++) {
      var sdeg = normDeg(5 + 30 * sk);
      SPOKES_12.push(sdeg);
      if (angDiff(sdeg, 20) > 20) {
        roads.push({ id: 'spoke_p_' + sdeg, kind: 'spoke_primary', deg: sdeg, r0: 224, r1: inRiverCorridor(580 * Math.cos(sdeg * DEG), 580 * Math.sin(sdeg * DEG), 0) ? 504 : W2_R, width: 12 });
      }
    }
    for (var sk2 = 0; sk2 < 12; sk2++) roads.push({ id: 'spoke_s_' + normDeg(20 + 30 * sk2), kind: 'spoke_secondary', deg: normDeg(20 + 30 * sk2), r0: 416, r1: 624, width: 8.5 });
    for (var sk3 = 0; sk3 < 12; sk3++) roads.push({ id: 'spoke_t_' + Math.round(normDeg(12.5 + 30 * sk3)), kind: 'spoke_tertiary', deg: normDeg(12.5 + 30 * sk3), r0: 530, r1: 624, width: 6.5 });

    for (var pi = 0; pi < arcology.portals.length; pi++) {
      var prt = arcology.portals[pi];
      links.push([prt.id, 'ring_r224', { kind: 'podium_ramp' }]);
      links.push(['ring_r224', 'spoke_p_' + prt.deg, { kind: 'junction' }]);
    }
    for (var ri = 0; ri < RING_STREETS.length; ri++) {
      var rId = 'ring_r' + RING_STREETS[ri];
      if (RING_STREETS[ri] <= 388) {
        for (var sp = 0; sp < SPOKES_12.length; sp++) {
          if (angDiff(SPOKES_12[sp], 20) > 20) {
            links.push([rId, 'spoke_p_' + SPOKES_12[sp], { kind: 'intersection' }]);
          }
        }
      } else {
        for (var s2j = 0; s2j < 12; s2j++) {
          links.push([rId, 'spoke_s_' + normDeg(20 + 30 * s2j), { kind: 'intersection' }]);
          if (RING_STREETS[ri] >= 530) {
            links.push([rId, 'spoke_t_' + Math.round(normDeg(12.5 + 30 * s2j)), { kind: 'intersection' }]);
          }
        }
      }
    }
    for (var gi = 0; gi < gates.length; gi++) {
      var gt = gates[gi];
      if (gt.wall === 'inner_wall_ancient') {
        links.push(['ring_r388', gt.id, { kind: 'gate_approach', state: 'shut', gated: true }]);
        links.push([gt.id, 'ring_r416', { kind: 'gate_passage', state: 'shut', gated: true }]);
      } else {
        links.push(['ring_r624', gt.id, { kind: 'gate_approach', state: 'shut', gated: true }]);
        links.push([gt.id, 'outside_road_' + gt.id, { kind: 'country_road', state: 'shut', gated: true }]);
      }
    }
    links.push(['ring_r278', fort.id, { kind: 'fortress_approach' }]);
    links.push(['ring_r278', ord.id, { kind: 'ordinator_approach' }]);
    links.push(['ring_r454', arena.id, { kind: 'arena_plaza' }]);
    links.push(['ring_r332', bourse.id, { kind: 'market_aisle' }]);
    links.push(['ring_r454', vmarket.id, { kind: 'market_aisle' }]);
    links.push(['ring_r332', foundry.id, { kind: 'haul_road' }]);
    links.push(['ring_r492', wharf.id, { kind: 'wharf_road' }]);

    // 9 zero-dead-space double-lot concentric bands: 3 Class L (inner), 3 Class M (mid), 3 Class S (outer)
    var BANDS = [
      { id: 'B1', zone: 'inner_high', cls: 'L', rIn: 231, rOut: 271, lotD: 18, alley: 4, spokeStep: 30 },
      { id: 'B2', zone: 'inner_citadel', cls: 'L', rIn: 285, rOut: 325, lotD: 18, alley: 4, spokeStep: 30 },
      { id: 'B3', zone: 'inner_citadel', cls: 'L', rIn: 339, rOut: 379, lotD: 18, alley: 4, spokeStep: 30 },
      { id: 'B4', zone: 'mid_tanktown', cls: 'M', rIn: 421.5, rOut: 448.5, lotD: 12, alley: 3, spokeStep: 15 },
      { id: 'B5', zone: 'mid_tanktown', cls: 'M', rIn: 459.5, rOut: 486.5, lotD: 12, alley: 3, spokeStep: 15 },
      { id: 'B6', zone: 'mid_tanktown', cls: 'M', rIn: 497.5, rOut: 524.5, lotD: 12, alley: 3, spokeStep: 15 },
      { id: 'B7', zone: 'outer_shanty', cls: 'S', rIn: 534.75, rOut: 557.25, lotD: 10, alley: 2.5, spokeStep: 10 },
      { id: 'B8', zone: 'outer_shanty', cls: 'S', rIn: 566.75, rOut: 589.25, lotD: 10, alley: 2.5, spokeStep: 10 },
      { id: 'B9', zone: 'outer_shanty', cls: 'S', rIn: 598.25, rOut: 620.75, lotD: 10, alley: 2.5, spokeStep: 10 }
    ];

    function poolFor(kit, cls, mode) {
      var src = kit === 'sw-arcology' ? KITS.swa : (kit === 'voth-scrap' ? KITS.vothScrap : KITS.postApoc);
      var out = [];
      for (var i = 0; i < src.length; i++) {
        if (src[i].cls !== cls) continue;
        if (mode === 'market' && src[i].types.indexOf('shop') < 0 && src[i].types.indexOf('market') < 0 && src[i].types.indexOf('industry') < 0 && src[i].types.indexOf('tavern') < 0) continue;
        if (mode === 'kraal' && src[i].types.indexOf('farm') < 0) continue;
        out.push(src[i]);
      }
      return out.length ? out : src.filter(function (d) { return d.cls === cls; });
    }

    var kitCounts = { 'sw-arcology': 0, 'voth-scrap': 0, 'post-apoc': 0 };

    function chooseKit(zone, deg) {
      var weights;
      if (zone === 'inner_high' || zone === 'inner_citadel') {
        var vothSector = angDiff(deg, 175) < 55;
        weights = vothSector
          ? { 'voth-scrap': 0.66, 'sw-arcology': 0.28, 'post-apoc': 0.06 }
          : { 'voth-scrap': 0.48, 'sw-arcology': 0.42, 'post-apoc': 0.10 };
      } else if (zone === 'mid_tanktown') {
        weights = { 'sw-arcology': 0.46, 'voth-scrap': 0.34, 'post-apoc': 0.20 };
      } else {
        weights = { 'post-apoc': 0.43, 'sw-arcology': 0.31, 'voth-scrap': 0.26 };
      }
      var tot = kitCounts['sw-arcology'] + kitCounts['voth-scrap'] + kitCounts['post-apoc'] + 3;
      var adj = {}, sum = 0, ks = ['sw-arcology', 'voth-scrap', 'post-apoc'];
      for (var i = 0; i < 3; i++) {
        var k = ks[i];
        var share = (kitCounts[k] + 1) / tot;
        var corr = Math.max(0.05, Math.min(8.0, (1 / 3) / share));
        adj[k] = weights[k] * corr * corr * corr * corr;
        sum += adj[k];
      }
      var roll = rng.next() * sum;
      if (roll < adj['sw-arcology']) return 'sw-arcology';
      if (roll < adj['sw-arcology'] + adj['voth-scrap']) return 'voth-scrap';
      return 'post-apoc';
    }

    var mandatoryDefs = KITS.all.filter(function (d) { return d.trades.length > 0 && d.cls !== 'XL'; });
    var mandatoryByCls = { S: [], M: [], L: [] };
    for (var mi = 0; mi < mandatoryDefs.length; mi++) mandatoryByCls[mandatoryDefs[mi].cls].push(mandatoryDefs[mi]);

    for (var bi = 0; bi < BANDS.length; bi++) {
      var band = BANDS[bi];
      var nSec = Math.round(360 / band.spokeStep);
      for (var si = 0; si < nSec; si++) {
        var d0 = normDeg(5 + si * band.spokeStep);
        var dMid = normDeg(d0 + 0.5 * band.spokeStep);
        var rMid = 0.5 * (band.rIn + band.rOut);
        if (inQuarryZone(rMid, dMid)) continue;
        if (inRiverCorridor(rMid * Math.cos(dMid * DEG), rMid * Math.sin(dMid * DEG), 16)) continue;

        var roadClearM = band.spokeStep === 30 ? 7.0 : (band.spokeStep === 15 ? 5.2 : 4.0);
        var blockFrontageCap = 0;
        var blockFrontageUsed = 0;

        for (var face = 0; face < 2; face++) {
          var rCenter = face === 0 ? (band.rIn + 0.5 * band.lotD) : (band.rOut - 0.5 * band.lotD);
          var arcLen = rCenter * (band.spokeStep * DEG) - 2 * roadClearM;
          if (arcLen < 12) continue;
          blockFrontageCap += arcLen;

          var cursor = roadClearM;
          var availEnd = rCenter * (band.spokeStep * DEG) - roadClearM;
          while (cursor + 9.0 <= availEnd) {
            var rem = availEnd - cursor;
            var kitChoice = chooseKit(band.zone, dMid);
            var isMarket = angDiff(dMid, 78) <= 24 && rCenter >= 330 && rCenter <= 515;
            var isKraal = band.cls === 'L' && angDiff(dMid, 105) <= 18 && rCenter >= 330;
            var defItem = null;

            if (mandatoryByCls[band.cls].length > 0 && mandatoryByCls[band.cls][0].w + 1.6 <= rem) {
              defItem = mandatoryByCls[band.cls].shift();
              kitChoice = defItem.kit;
            }
            if (!defItem) {
              var pool = poolFor(kitChoice, band.cls, isMarket ? 'market' : (isKraal ? 'kraal' : 'normal'))
                .filter(function (d) { return d.w + 1.6 <= rem; });
              if (!pool.length) pool = KITS.all.filter(function (d) { return d.cls === band.cls && d.w + 1.6 <= rem; });
              if (!pool.length) break;
              defItem = pool[rng.int(0, pool.length - 1)];
            }

            var lotGap = 1.6;
            var sMid = cursor + 0.5 * defItem.w;
            var theta = (d0 * DEG) + (sMid / rCenter);
            var bx = +(rCenter * Math.cos(theta)).toFixed(2);
            var bz = +(rCenter * Math.sin(theta)).toFixed(2);
            if (inRiverCorridor(bx, bz, 8) || inQuarryZone(rCenter, normDeg(theta / DEG))) {
              cursor += defItem.w + lotGap;
              continue;
            }

            var faceAng = face === 0 ? (theta + Math.PI) : theta;
            var ry = +Math.atan2(Math.cos(faceAng), Math.sin(faceAng)).toFixed(4);
            var bRec = {
              id: 'bld_' + buildings.length, band: band.id, zone: band.zone, face: face === 0 ? 'inner' : 'outer',
              kit: defItem.kit, key: defItem.key, cls: defItem.cls,
              x: bx, y: 0, z: bz, r: +rCenter.toFixed(2), deg: +normDeg(theta / DEG).toFixed(2), ry: ry,
              w: defItem.w, d: defItem.d, h: defItem.h, st: defItem.st, basePop: defItem.pop, pop: defItem.pop,
              culture: defItem.culture, style: defItem.style, types: defItem.types, wealth: defItem.wealth,
              job: defItem.job, trades: defItem.trades,
              district: isMarket ? 'scrap_market' : (angDiff(dMid, 175) < 42 && rCenter < W1_R ? 'vothic_sector' : band.zone),
              state: band.zone === 'outer_shanty' ? 'salvage' : 'intact'
            };

            if (tryInsertObb(bRec, 0.5)) {
              buildings.push(bRec);
              kitCounts[bRec.kit]++;
              blockFrontageUsed += defItem.w + lotGap;
            }
            cursor += defItem.w + lotGap;
          }
        }

        if (blockFrontageCap > 0 && blockFrontageUsed > 0) {
          blocks.push({
            id: band.id + '_S' + si, band: band.id, cls: band.cls, rIn: band.rIn, rOut: band.rOut,
            radialDepth: +(band.rOut - band.rIn).toFixed(2), expectedDepth: +(2 * band.lotD + band.alley).toFixed(2),
            frontageCap: +blockFrontageCap.toFixed(1), frontageUsed: +Math.min(blockFrontageCap, blockFrontageUsed).toFixed(1),
            utilization: +Math.min(1.0, blockFrontageUsed / blockFrontageCap).toFixed(3)
          });
        }
      }
    }

    var landmarkPop = 0;
    for (var li = 1; li < landmarks.length; li++) landmarkPop += landmarks[li].pop;
    var rawBldPop = 0;
    for (var pi2 = 0; pi2 < buildings.length; pi2++) rawBldPop += buildings[pi2].basePop;
    var targetBldPop = 8100 - landmarkPop;
    var scale = targetBldPop / Math.max(1, rawBldPop);
    var assignedBldPop = 0;
    for (var bi2 = 0; bi2 < buildings.length; bi2++) {
      var scaled = Math.max(0, Math.round(buildings[bi2].basePop * scale));
      buildings[bi2].pop = scaled;
      assignedBldPop += scaled;
    }
    var diff = targetBldPop - assignedBldPop;
    var step = diff > 0 ? 1 : -1;
    var idx = 0;
    while (diff !== 0 && buildings.length > 0) {
      var candB = buildings[idx % buildings.length];
      if (candB.types.indexOf('dwelling-multi') >= 0 || candB.types.indexOf('dwelling-single') >= 0) {
        if (step > 0 || candB.pop > 2) {
          candB.pop += step;
          diff -= step;
        }
      }
      idx++;
      if (idx > buildings.length * 8) break;
    }

    var outerPop = landmarkPop;
    for (var bi3 = 0; bi3 < buildings.length; bi3++) outerPop += buildings[bi3].pop;

    return {
      version: 1, seed: worldSeed, site: site, arcology: arcology, landmarks: landmarks,
      walls: walls, gates: gates, roads: roads, blocks: blocks, buildings: buildings,
      palisadeVehicles: palisadeVehicles, links: links, kitCounts: kitCounts,
      pop: { arcology: arcology.totalPop, landmarks: landmarkPop, ringBuildings: outerPop - landmarkPop, outerTotal: outerPop, total: arcology.totalPop + outerPop }
    };
  }

  function registerTags(plan, T) {
    var out = [];
    for (var i = 0; i < plan.landmarks.length; i++) {
      var lm = plan.landmarks[i];
      var lrec = T.add({
        class: 'landmark', key: lm.id, name: lm.name, at: [lm.x, lm.y, lm.z], ry: lm.ry, size: [lm.w, lm.d, lm.h],
        tags: { culture: lm.culture, style: lm.style, types: lm.types, wealth: lm.wealth, state: lm.state, landmark: true, district: lm.role }
      });
      lm.tagId = lrec.id;
      out.push(lrec);
    }
    for (var g = 0; g < plan.gates.length; g++) {
      var gt = plan.gates[g];
      var grec = T.add({
        class: 'infrastructure', key: gt.id, name: gt.name, at: [gt.x, 0, gt.z], ry: gt.ry, size: [gt.w, gt.d, gt.h],
        tags: { culture: gt.culture, style: gt.style, types: ['military', 'infrastructure'], state: gt.state, door: 'gate' }
      });
      gt.tagId = grec.id;
      out.push(grec);
    }
    for (var b = 0; b < plan.buildings.length; b++) {
      var bd = plan.buildings[b];
      var tg = { culture: bd.culture, style: bd.style, types: bd.types, state: bd.state, district: bd.district };
      if (bd.wealth) tg.wealth = bd.wealth;
      if (bd.job) tg.job = bd.job;
      if (bd.district === 'scrap_market') tg.market = true;
      var brec = T.add({
        class: 'building', key: bd.key, name: bd.key, at: [bd.x, bd.y, bd.z], ry: bd.ry, size: [bd.w, bd.d, bd.h], tags: tg
      });
      bd.tagId = brec.id;
      out.push(brec);
    }
    if (plan.palisadeVehicles.length > 0) {
      var pv = plan.palisadeVehicles;
      T.addSet({
        class: 'prop', key: 'outer_palisade_vehicle_wrecks', name: 'Outer Palisade Rusted Ancient Vehicles', size: [8.0, 2.5, 3.0],
        tags: { culture: 'ancient', style: 'vehicle-palisade', types: ['military', 'infrastructure'], state: 'salvage' }
      }, {
        n: pv.length,
        pos: function (k, o) { o[0] = pv[k].x; o[1] = 0; o[2] = pv[k].z; return o; },
        ry: function (k) { return pv[k].ry; }
      });
    }
    return out;
  }

  DRUM.obbOverlap = obbOverlap;
  DRUM.inRiverCorridor = inRiverCorridor;
  DRUM.inQuarryZone = inQuarryZone;
  DRUM.buildCityPlan = buildCityPlan;
  DRUM.registerTags = registerTags;
})(typeof window !== 'undefined' ? window : globalThis);
