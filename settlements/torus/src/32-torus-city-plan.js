// ================================================================= TORUS — 32: 10-Level Stepped Terraces & Extension ([G data])
// Pure deterministic settlement layout for Torus (Scale Model 5.1 px=774, py=1007, elev=-842 m) around Forest Ring.
// Zero THREE, zero DOM. Uses KRAND + KSPACE + KTAGS + TORUS.buildHinterland (Soleri farms & decayed KTRANSIT network).
// 8,500 citizens: 30% (2,550) in Forest Ring Arcology + 70% (5,950) across 10 Stepped Ag-Terraces (+44m -> +1m) & SE Extension.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});
  var DEG = Math.PI / 180;

  function normDeg(d) {
    var x = d % 360;
    return x < 0 ? x + 360 : x;
  }

  function angDiff(a, b) {
    var d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  function inArc(deg, d0, d1) {
    var x = normDeg(deg), a = normDeg(d0), b = normDeg(d1);
    return a <= b ? (x >= a && x <= b) : (x >= a || x <= b);
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
    var ay = a.y == null ? 0 : a.y;
    var by = b.y == null ? 0 : b.y;
    if (Math.abs(ay - by) > 45.0) return false; // e.g. WY=300m Wheel Cider Hall vs y=+24m ground terraces
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

  // Tors Rivrh (52 m wide channel along the NNW flank at centerDist = 1,095 m, bearing 318 deg)
  function inRiverCorridor(x, z, pad) {
    var p = pad == null ? 0 : pad;
    var nx = Math.cos(318 * DEG), nz = Math.sin(318 * DEG);
    var tx = -nz, tz = nx;
    var dn = x * nx + z * nz;
    var dt = x * tx + z * tz;
    var riverCenter = 1095.0 + 26.0 * Math.sin(dt / 420.0);
    return Math.abs(dn - riverCenter) < (26.0 + p);
  }

  // ENE Fallen-Wheel Debris & Feral Botanical Ruin Zone beneath the WA=57.3 deg Wheel breach
  function inWheelRuinZone(r, deg) {
    return r >= 300 && r <= 768 && angDiff(deg, 57.3) <= 17.5;
  }

  // SE Scrap Voth Extension ("Canton-on-the-Rise": theta = 104..176 deg, r = 690..1,128 m across T6-T10)
  function inVothExtension(r, deg) {
    return r >= 690 && r <= 1128 && inArc(deg, 104, 176);
  }

  var TERRACE_DEFS = [
    { id: 'terrace_T1', code: 'T1', name: 'Terrace T1 (Earthlike Pharmacopoeia & Unique Ancient Medical Bench)', rIn: 296, rOut: 374, elev: 44.0 },
    { id: 'terrace_T2', code: 'T2', name: 'Terrace T2 (Mist-Tea, Cacao & Highland Spice Conservatory Bench)', rIn: 374, rOut: 452, elev: 39.0 },
    { id: 'terrace_T3', code: 'T3', name: 'Terrace T3 (Board Assize & Out-of-Zone Dryland/Fibre Dome Bench)', rIn: 452, rOut: 530, elev: 34.0 },
    { id: 'terrace_T4', code: 'T4', name: 'Terrace T4 (Inner Wheel-Drip Cider Bench)', rIn: 530, rOut: 608, elev: 29.0 },
    { id: 'terrace_T5', code: 'T5', name: 'Terrace T5 (Mid Wheel-Shade Berry & Press Bench)', rIn: 608, rOut: 686, elev: 24.0 },
    { id: 'terrace_T6', code: 'T6', name: 'Terrace T6 (Outer Wheel-Drip & Aqueduct Header Bench)', rIn: 686, rOut: 766, elev: 19.0 },
    { id: 'terrace_T7', code: 'T7', name: 'Terrace T7 (Upper Grain & Vothic Embassy Bench)', rIn: 766, rOut: 854, elev: 14.0 },
    { id: 'terrace_T8', code: 'T8', name: 'Terrace T8 (Mid Breadbasket & Tithe Granary Bench)', rIn: 854, rOut: 942, elev: 9.5 },
    { id: 'terrace_T9', code: 'T9', name: 'Terrace T9 (Heirloom Orchard & Transit Terminal Bench)', rIn: 942, rOut: 1030, elev: 5.0 },
    { id: 'terrace_T10', code: 'T10', name: 'Terrace T10 (Floodplain Chinampa, Kraal & Wharf Bench)', rIn: 1030, rOut: 1120, elev: 1.0 }
  ];

  function terraceElevAt(r) {
    for (var i = 0; i < TERRACE_DEFS.length; i++) {
      if (r < TERRACE_DEFS[i].rOut) return TERRACE_DEFS[i].elev;
    }
    return 0.0;
  }

  function groundAt(x, z) {
    var r = Math.hypot(x, z);
    if (r < 1120) return terraceElevAt(r);
    if (inRiverCorridor(x, z, 0)) return -1.8;
    // Gentle rolling Soleri hinterland plain rising mildly toward valley flanks
    return +(1.5 * Math.sin(x / 380.0) * Math.cos(z / 410.0) + Math.max(0, (r - 1800) * 0.004)).toFixed(2);
  }

  function buildCityPlan(seed) {
    var worldSeed = seed == null ? 20261118 : (seed >>> 0);
    var rng = KRAND.stream(KRAND.child(worldSeed, 'torus_city_plan'));
    var space = KSPACE.create({ cell: 40 });
    var arcology = TORUS.buildArcology();
    var KITS = TORUS.KITS;
    var CUSTOMS_WALL_R = 1140;

    var site = {
      name: 'Torus',
      vothicName: 'Tors',
      nativeName: 'Rinkvolk',
      izaniName: 'Torani',
      scaleModel51: { id: 'torus_ring', px: 774, py: 1007, elev: -842.0 },
      legacy4x: { px: 502, py: 677 },
      governance: {
        localRule: 'elected_chairman_and_board',
        localLaw: 'rinkvolk_assize',
        vothicAuthority: 'tzintzun_via_emissary',
        missionaryFreedom: true,
        rootsOutStateEnemies: ['history_monks']
      },
      river: { id: 'tors_rivrh', name: 'Tors Rivrh', width: 52.0, bearingDeg: 318.0, centerDist: 1095.0 },
      wheelRuin: { waDeg: 57.3, r0: 300.0, r1: 768.0, halfAngleDeg: 17.5 },
      vothExtension: { deg0: 104.0, deg1: 176.0, r0: 690.0, r1: 1128.0 },
      customsWallR: CUSTOMS_WALL_R,
      hinterlandRadiusM: 2950
    };

    var landmarks = [], specimenDomes = [], feralDomes = [], walls = [], gates = [];
    var roads = [], agTerraces = TERRACE_DEFS.slice(), agPlots = [], blocks = [], buildings = [];
    var links = arcology.links.slice();

    function tryInsertObb(rec, pad) {
      var boundR = 0.5 * Math.hypot(rec.w, rec.d);
      var p = pad == null ? 0.8 : pad;
      var hit = space.some(rec.x, rec.z, boundR + p + 1.0, function (other) {
        return obbOverlap(rec, other, p);
      });
      if (hit) return false;
      space.insert(rec, rec.x, rec.z, boundR);
      return true;
    }

    function placePolarLandmark(id, name, role, r, deg, y, w, d, h, pop, culture, style, types, wealth, state, extra) {
      var a = deg * DEG, x = +(r * Math.cos(a)).toFixed(2), z = +(r * Math.sin(a)).toFixed(2);
      var rec = {
        id: id, name: name, kind: 'landmark', role: role,
        x: x, y: y, z: z, r: r, deg: normDeg(deg), ry: +Math.atan2(-x, -z).toFixed(4),
        w: w, d: d, h: h, pop: pop, culture: culture, style: style, types: types, wealth: wealth, state: state || 'intact'
      };
      if (extra) { for (var ek in extra) rec[ek] = extra[ek]; }
      if (!tryInsertObb(rec, 3.2)) throw new Error('Landmark overlap in Torus: ' + id);
      landmarks.push(rec);
      return rec;
    }

    landmarks.push({
      id: 'forest_ring_arcology', name: 'Forest Ring Arcology (Wheel Fruitvines, Crown & Foot)',
      kind: 'landmark', role: 'arcology', x: 0, y: 0, z: 0, r: 0, deg: 0, ry: 0,
      w: 1440, d: 1440, h: 780, circR: arcology.RFOOT, wheelR0: arcology.WR0, wheelR1: arcology.WR1,
      pop: arcology.totalPop, culture: 'ancient', style: 'ancient', types: ['dwelling-multi', 'farm', 'industry'],
      wealth: 'middle', state: 'reclaimed'
    });

    var boardHall = placePolarLandmark('lm_boardhall', 'Board Hall & Tenders\' Archive', 'civic_board', 492, 215, 34.0, 78, 64, 16, 28, 'ancient', 'sw-arcology', ['civic'], 'rich', 'reclaimed');
    var emissary = placePolarLandmark('lm_emissary', 'Vothic Emissary\'s Residence & Chichani Compound', 'vothic_emissary', 810, 132, 14.0, 84, 72, 18, 96, 'voth', 'scrap-voth', ['civic', 'dwelling-multi'], 'rich', 'intact');
    var ordinators = placePolarLandmark('lm_ordinators', 'Ordinator Palace of Torus', 'ordinator_palace', 812, 158, 14.0, 80, 70, 19, 88, 'voth', 'scrap-voth', ['military', 'religious'], 'rich', 'intact');
    var ciderHall = placePolarLandmark('lm_ciderhall', 'Great Cider-Press & Fruitvine Winch Hall (WY=300m)', 'cider_hall', 636, 204, 300.0, 88, 56, 22, 0, 'post-apoc', 'sw-arcology', ['industry', 'farm'], 'middle', 'reclaimed');
    var titheGranary = placePolarLandmark('lm_tithe_granary', 'Imperial Tithe Granary & Sun-Missionary Cloister', 'tithe_granary', 898, 145, 9.5, 36, 24, 15, 18, 'voth', 'scrap-voth', ['industry', 'civic'], 'middle', 'intact');
    var transitTerminal = placePolarLandmark('lm_transit_terminal', 'Ruined Ancient Transit Terminal & Harvest Rail Headhouse', 'transit_terminal', 986, 248, 5.0, 48, 30, 14, 12, 'ancient', 'sw-arcology', ['infrastructure'], 'poor', 'reclaimed');
    var riverWharf = placePolarLandmark('lm_river_wharf', 'Tors Rivrh Grain & Cider Barge Wharf', 'river_wharf', 1038, 318, 1.0, 38, 22, 11, 20, 'post-apoc', 'sw-arcology', ['infrastructure', 'industry'], 'middle', 'intact');

    // Give all 8 Specimen Domes (especially Sanctuary Dome III Amber-Sap + Ordinator Watchhouse) and 4 Feral Domes
    // a full 32x30 m sanctuary precinct envelope + radial clearance check so zero buildings or structures clip into them!
    for (var sm = 0; sm < KITS.tenderDomes.length; sm++) {
      var sp = KITS.tenderDomes[sm];
      var isWatched = sp.ordinatorsWatch === 'strict_surveillance';
      specimenDomes.push(placePolarLandmark(sp.id, sp.name, 'tender_ag_dome',
        sp.r, sp.deg, terraceElevAt(sp.r), isWatched ? 34 : 30, 30, 12, 4, 'ancient', 'sw-arcology', ['farm', 'civic'], 'rich', 'reclaimed',
        { specimenCode: sp.code, category: sp.category, terrace: sp.terrace, cropIds: sp.cropIds, cultivars: sp.cultivars, ordinatorsWatch: sp.ordinatorsWatch, clearR: isWatched ? 22.5 : 19.5 }));
    }
    for (var fd = 0; fd < KITS.feralDomes.length; fd++) {
      var fSpec = KITS.feralDomes[fd];
      feralDomes.push(placePolarLandmark(fSpec.id, fSpec.name, 'feral_ag_dome', fSpec.r, fSpec.deg, terraceElevAt(fSpec.r), 30, 30, 11, 0,
        'ancient', 'sw-arcology', ['infrastructure'], null, 'ruined',
        { quarantined: true, specimen: fSpec.specimen, clearR: 19.5, hazard: { kind: fSpec.hazardKind, danger: fSpec.danger, shape: { type: 'cyl', kind: 'cyl', r: 16, h: 12 } } }));
    }

    var allDomes = specimenDomes.concat(feralDomes);
    function nearAnyDome(x, z, bHalfDiag) {
      for (var di = 0; di < allDomes.length; di++) {
        var dm = allDomes[di];
        var minD = (dm.clearR == null ? 19.5 : dm.clearR) + bHalfDiag;
        if (Math.hypot(x - dm.x, z - dm.z) < minD) return true;
      }
      return false;
    }

    walls.push({ id: 'terrace_retaining_cascade', name: 'Ten-Level Fieldstone & Loam Agricultural Terrace Cascade (+44m -> +1m)', r: 1120, levels: 10, topElev: 44.0, culture: 'ancient', style: 'ancient', state: 'rehab' });
    walls.push({ id: 'customs_wall_torus', name: 'Torus Light Customs & Granary Wall', r: CUSTOMS_WALL_R, thick: 4.5, h: 5.5, culture: 'voth', style: 'scrap-voth', state: 'intact', riverFlankDeg: [298, 338] });

    var CUSTOMS_GATES = [
      { id: 'cgate_east_fields', deg: 22.5, name: 'East Soleri Orchard & Rail Gate' },
      { id: 'cgate_north_sea', deg: 97.5, name: 'North Ring-Sea Road Customs Gate' },
      { id: 'cgate_voth_highway', deg: 142.5, name: 'Great Voth Tithe-Road Gate' },
      { id: 'cgate_west_cider', deg: 187.5, name: 'West Cider-Press & Nursery Gate' },
      { id: 'cgate_sw_transit', deg: 232.5, name: 'South-West Aqueduct & Harvest-Rail Gate' },
      { id: 'cgate_south_grain', deg: 277.5, name: 'South Soleri Pod & Granary Gate' }
    ];
    for (var cg = 0; cg < CUSTOMS_GATES.length; cg++) {
      var gd = CUSTOMS_GATES[cg], ga = gd.deg * DEG;
      var gateRec = {
        id: gd.id, wall: 'customs_wall_torus', name: gd.name, r: CUSTOMS_WALL_R, deg: gd.deg,
        x: +(CUSTOMS_WALL_R * Math.cos(ga)).toFixed(2), y: 0.5, z: +(CUSTOMS_WALL_R * Math.sin(ga)).toFixed(2),
        ry: +Math.atan2(-Math.cos(ga), -Math.sin(ga)).toFixed(4), w: 16, d: 11, h: 9.5,
        culture: 'voth', style: 'scrap-voth', state: 'intact'
      };
      tryInsertObb(gateRec, 0.8);
      gates.push(gateRec);
    }

    var RING_ROADS = [302, 374, 452, 530, 608, 686, 766, 854, 942, 1030, 1122];
    for (var rr = 0; rr < RING_ROADS.length; rr++) {
      roads.push({ id: 'ring_r' + RING_ROADS[rr], kind: 'terrace_ring', r: RING_ROADS[rr], width: RING_ROADS[rr] <= 686 ? 9.0 : 8.0 });
    }
    var SPOKE_DEGS = [];
    for (var sk = 0; sk < 12; sk++) {
      var sdeg = normDeg(7.5 + 30.0 * sk);
      SPOKE_DEGS.push(sdeg);
      var hitsRiv = inRiverCorridor(1080 * Math.cos(sdeg * DEG), 1080 * Math.sin(sdeg * DEG), 0);
      roads.push({ id: 'spoke_' + sdeg, kind: 'radial_avenue', deg: sdeg, r0: 302, r1: hitsRiv ? 1020 : CUSTOMS_WALL_R, width: 10.5 });
    }
    for (var sk2 = 0; sk2 < 12; sk2++) {
      var s2deg = normDeg(22.5 + 30.0 * sk2);
      roads.push({ id: 'spoke_sub_' + s2deg, kind: 'terrace_lane', deg: s2deg, r0: 530, r1: 1122, width: 7.5 });
    }

    for (var pi = 0; pi < arcology.portals.length; pi++) {
      if (!arcology.portals[pi].ruined) links.push([arcology.portals[pi].id, 'ring_r302', { kind: 'podium_terrace_step', gated: false }]);
    }
    for (var ri = 0; ri < RING_ROADS.length; ri++) {
      var rId = 'ring_r' + RING_ROADS[ri];
      for (var spk = 0; spk < SPOKE_DEGS.length; spk++) links.push([rId, 'spoke_' + SPOKE_DEGS[spk], { kind: 'junction', gated: false }]);
      if (RING_ROADS[ri] >= 530) {
        for (var spk2 = 0; spk2 < 12; spk2++) links.push([rId, 'spoke_sub_' + normDeg(22.5 + 30.0 * spk2), { kind: 'junction', gated: false }]);
      }
    }
    links.push(['ring_r452', boardHall.id, { kind: 'board_steps', gated: false }]);
    links.push(['ring_r766', emissary.id, { kind: 'treaty_avenue', gated: false }]);
    links.push(['ring_r766', ordinators.id, { kind: 'scrutinies_approach', gated: false }]);
    links.push(['ring_r854', titheGranary.id, { kind: 'granary_yard', gated: false }]);
    links.push(['ring_r942', transitTerminal.id, { kind: 'terminal_plaza', gated: false }]);
    links.push(['ring_r1030', riverWharf.id, { kind: 'wharf_quay', gated: false }]);
    for (var smi = 0; smi < specimenDomes.length; smi++) {
      var domeRing = specimenDomes[smi].terrace === 'T1' ? 'ring_r302' : (specimenDomes[smi].terrace === 'T2' ? 'ring_r374' : 'ring_r452');
      links.push([domeRing, specimenDomes[smi].id, { kind: 'dome_airlock', gated: false }]);
    }
    for (var gti = 0; gti < gates.length; gti++) {
      links.push(['ring_r1122', gates[gti].id, { kind: 'customs_approach', state: 'shut', gated: true }]);
      links.push([gates[gti].id, 'breadbasket_' + gates[gti].id, { kind: 'hinterland_road', state: 'shut', gated: true }]);
    }

    // 10 zero-dead-space double-lot concentric bands across T1-T10 (radialDepth === 2 * lotD + alley)
    // Note: outside the SE Scrap Voth Extension, terraces are primarily living contour terrace farms (`buildMod: 4..5`),
    // with compact built-over Rinkvolk hamlet clusters seated cleanly on masonry aprons!
    var BANDS = [
      { id: 'T1_M', terrace: 'T1', zone: 'podium_terrace', cls: 'M', rIn: 324.5, rOut: 351.5, lotD: 12, alley: 3, spokeStep: 30, buildMod: 3 },
      { id: 'T2_M', terrace: 'T2', zone: 'podium_terrace', cls: 'M', rIn: 399.5, rOut: 426.5, lotD: 12, alley: 3, spokeStep: 30, buildMod: 3 },
      { id: 'T3_M', terrace: 'T3', zone: 'podium_terrace', cls: 'M', rIn: 477.5, rOut: 504.5, lotD: 12, alley: 3, spokeStep: 30, buildMod: 3 },
      { id: 'T4_L', terrace: 'T4', zone: 'wheel_drip', cls: 'L', rIn: 549.0, rOut: 589.0, lotD: 18, alley: 4, spokeStep: 15, buildMod: 4 },
      { id: 'T5_M', terrace: 'T5', zone: 'wheel_drip', cls: 'M', rIn: 633.5, rOut: 660.5, lotD: 12, alley: 3, spokeStep: 15, buildMod: 4 },
      { id: 'T6_M', terrace: 'T6', zone: 'wheel_drip', cls: 'M', rIn: 712.5, rOut: 739.5, lotD: 12, alley: 3, spokeStep: 15, buildMod: 4 },
      { id: 'T7_L', terrace: 'T7', zone: 'lower_terrace', cls: 'L', rIn: 790.0, rOut: 830.0, lotD: 18, alley: 4, spokeStep: 15, buildMod: 4 },
      { id: 'T8_M', terrace: 'T8', zone: 'lower_terrace', cls: 'M', rIn: 884.5, rOut: 911.5, lotD: 12, alley: 3, spokeStep: 15, buildMod: 4 },
      { id: 'T9_S', terrace: 'T9', zone: 'outer_farm', cls: 'S', rIn: 974.75, rOut: 997.25, lotD: 10, alley: 2.5, spokeStep: 15, buildMod: 4 },
      { id: 'T10_S', terrace: 'T10', zone: 'outer_farm', cls: 'S', rIn: 1063.75, rOut: 1086.25, lotD: 10, alley: 2.5, spokeStep: 15, buildMod: 4 }
    ];

    var kitCounts = { 'sw-arcology': 0, 'voth-scrap': 0, 'post-apoc': 0 };
    function chooseKit(zone, rCenter, deg) {
      if (inVothExtension(rCenter, deg)) return 'voth-scrap';
      if (zone === 'podium_terrace') return rng.next() < 0.90 ? 'sw-arcology' : 'post-apoc';
      if (zone === 'wheel_drip' || zone === 'lower_terrace') return rng.next() < 0.78 ? 'sw-arcology' : 'post-apoc';
      return rng.next() < 0.76 ? 'post-apoc' : 'sw-arcology';
    }
    function poolFor(kit, cls, mode) {
      var src = kit === 'sw-arcology' ? KITS.swa : (kit === 'voth-scrap' ? KITS.vothScrap : KITS.postApoc);
      var out = [];
      for (var i = 0; i < src.length; i++) {
        var d = src[i];
        if (d.cls !== cls || d.key === 'swa-feral-dome') continue;
        if (mode === 'cider_terrace' && d.key !== 'swa-cider-press' && d.key !== 'swa-still-vat' && d.key !== 'swa-seed-silo' && d.types.indexOf('dwelling-multi') < 0) continue;
        out.push(d);
      }
      return out.length ? out : src.filter(function (x) { return x.cls === cls && x.key !== 'swa-feral-dome'; });
    }

    var mandatoryDefs = KITS.all.filter(function (d) { return d.trades.length > 0 && d.cls !== 'XL' && d.key !== 'swa-feral-dome'; });
    var mandatoryByKitCls = {};
    for (var mi = 0; mi < mandatoryDefs.length; mi++) {
      var md = mandatoryDefs[mi], mk = md.kit + ':' + md.cls;
      if (!mandatoryByKitCls[mk]) mandatoryByKitCls[mk] = [];
      mandatoryByKitCls[mk].push(md);
    }

    var CROP_KINDS = ['rare_culinary_herbs', 'saffron_and_spice_beds', 'alchemical_reagent_moss', 'wheel_drip_berry_orchard', 'irrigated_barley_terrace', 'terraced_paddy_strip'];
    var SURVEYED_PLOT_CROPS = {
      rare_culinary_herbs: ['herbs', 'fumewort', 'monks-sage', 'tobacco'],
      saffron_and_spice_beds: ['saffron', 'annatto', 'bench-garlic', 'rattlepod'],
      alchemical_reagent_moss: ['sky-poppy', 'ivanchai', 'woad', 'circlelichen'],
      wheel_drip_berry_orchard: ['sky-fruitvine', 'madrone', 'persimmon', 'fig', 'marula'],
      irrigated_barley_terrace: ['emmer', 'dustmillet', 'bambara', 'dust-lentil'],
      terraced_paddy_strip: ['murnong', 'maar-yam', 'bambara', 'cotton'],
      river_chinampa: ['murnong', 'lotus-root', 'fiddlehead', 'gatepod'],
      voth_clan_courtyard_garden: ['whorl-olive', 'pomegranate', 'herbs'],
      feral_ruin_flora: []
    };
    var builtSectors = [];

    for (var bi = 0; bi < BANDS.length; bi++) {
      var band = BANDS[bi], nSec = Math.round(360 / band.spokeStep);
      for (var si = 0; si < nSec; si++) {
        var d0 = normDeg(7.5 + si * band.spokeStep), dMid = normDeg(d0 + 0.5 * band.spokeStep);
        var rMid = 0.5 * (band.rIn + band.rOut), by = terraceElevAt(rMid);
        if (inWheelRuinZone(rMid, dMid)) {
          agPlots.push({ id: 'ruin_flora_' + band.id + '_' + si, kind: 'feral_ruin_flora', cropIds: [], terrace: band.terrace, rIn: band.rIn - 6, rOut: band.rOut + 6, deg0: d0, deg1: normDeg(d0 + band.spokeStep), elev: by });
          continue;
        }
        if (inRiverCorridor(rMid * Math.cos(dMid * DEG), rMid * Math.sin(dMid * DEG), 14)) {
          agPlots.push({ id: 'chinampa_' + band.id + '_' + si, kind: 'river_chinampa', cropIds: SURVEYED_PLOT_CROPS.river_chinampa, terrace: band.terrace, rIn: band.rIn, rOut: band.rOut, deg0: d0, deg1: normDeg(d0 + band.spokeStep), elev: 0.0 });
          continue;
        }
        // Keep sectors containing Ag-Domes as open botanical terrace gardens so domes never get hemmed in by tenements!
        var sectorHasDome = nearAnyDome(rMid * Math.cos(dMid * DEG), rMid * Math.sin(dMid * DEG), 16.0);
        var isVothExt = inVothExtension(rMid, dMid);
        var buildThisSector = !sectorHasDome && (isVothExt ? (si % 4 !== 0) : ((si + bi) % band.buildMod === 0));
        if (!buildThisSector) {
          var pKind = sectorHasDome ? 'rare_culinary_herbs' : (isVothExt ? 'voth_clan_courtyard_garden' : CROP_KINDS[(bi + si) % CROP_KINDS.length]);
          agPlots.push({
            id: 'agplot_' + band.id + '_' + si,
            kind: pKind,
            cropIds: SURVEYED_PLOT_CROPS[pKind] || ['emmer', 'bambara'],
            terrace: band.terrace, rIn: +(band.rIn - 6).toFixed(1), rOut: +(band.rOut + 6).toFixed(1),
            deg0: d0, deg1: normDeg(d0 + band.spokeStep), elev: by
          });
          continue;
        }

        var roadClearM = band.spokeStep === 30 ? 6.5 : 5.0;
        var blockFrontageCap = 0, blockFrontageUsed = 0;
        for (var face = 0; face < 2; face++) {
          var rCenter = face === 0 ? (band.rIn + 0.5 * band.lotD) : (band.rOut - 0.5 * band.lotD);
          var arcLen = rCenter * (band.spokeStep * DEG) - 2 * roadClearM;
          if (arcLen < 12) continue;
          var cursor = roadClearM, availEnd = rCenter * (band.spokeStep * DEG) - roadClearM;
          var faceCap = arcLen;
          while (cursor + 9.0 <= availEnd) {
            var rem = availEnd - cursor, kitChoice = chooseKit(band.zone, rCenter, dMid);
            var mKey = kitChoice + ':' + band.cls, defItem = null;
            var usedMandatory = false;
            if (mandatoryByKitCls[mKey] && mandatoryByKitCls[mKey].length > 0 && mandatoryByKitCls[mKey][0].w + 1.6 <= rem) {
              defItem = mandatoryByKitCls[mKey][0];
              usedMandatory = true;
            }
            if (!defItem) {
              var mode = (!isVothExt && band.zone === 'wheel_drip' && angDiff(dMid, 204) <= 36) ? 'cider_terrace' : 'normal';
              var pool = poolFor(kitChoice, band.cls, mode).filter(function (d) { return d.w + 1.6 <= rem; });
              if (!pool.length) pool = poolFor(kitChoice, band.cls, 'normal').filter(function (d) { return d.w + 1.6 <= rem; });
              if (!pool.length) break;
              defItem = pool[rng.int(0, pool.length - 1)];
            }
            var lotGap = 1.6, sMid = cursor + 0.5 * defItem.w, theta = (d0 * DEG) + (sMid / rCenter);
            var degActual = normDeg(theta / DEG);
            var bx = +(rCenter * Math.cos(theta)).toFixed(2), bz = +(rCenter * Math.sin(theta)).toFixed(2);
            var bHalfDiag = 0.5 * Math.hypot(defItem.w, defItem.d);
            if (inRiverCorridor(bx, bz, 8) || inWheelRuinZone(rCenter, degActual) || nearAnyDome(bx, bz, bHalfDiag)) {
              faceCap = Math.max(0, faceCap - (defItem.w + lotGap));
              cursor += defItem.w + lotGap;
              continue;
            }
            if (inVothExtension(rCenter, degActual) && defItem.kit !== 'voth-scrap') {
              var vPool = poolFor('voth-scrap', band.cls, 'normal').filter(function (d) { return d.w + 1.6 <= rem; });
              if (vPool.length) {
                defItem = vPool[rng.int(0, vPool.length - 1)];
                usedMandatory = false;
                bHalfDiag = 0.5 * Math.hypot(defItem.w, defItem.d);
              }
            }
            var faceAng = face === 0 ? (theta + Math.PI) : theta;
            var bRec = {
              id: 'tor_bld_' + buildings.length, band: band.id, terrace: band.terrace,
              zone: isVothExt ? 'voth_extension' : band.zone, face: face === 0 ? 'inner' : 'outer',
              kit: defItem.kit, key: defItem.key, cls: defItem.cls, x: bx, y: by, z: bz,
              r: +rCenter.toFixed(2), deg: +degActual.toFixed(2), ry: +Math.atan2(Math.cos(faceAng), Math.sin(faceAng)).toFixed(4),
              w: defItem.w, d: defItem.d, h: defItem.h, st: defItem.st, basePop: defItem.pop, pop: defItem.pop,
              culture: defItem.culture, style: defItem.style, types: defItem.types, wealth: defItem.wealth,
              job: defItem.job, trades: defItem.trades,
              district: isVothExt ? 'scrap_voth_extension' : (band.zone === 'podium_terrace' ? 'podium_ag_terraces' : band.zone),
              state: defItem.culture === 'ancient' ? 'reclaimed' : 'intact'
            };
            if (tryInsertObb(bRec, 0.75)) {
              if (usedMandatory) mandatoryByKitCls[mKey].shift();
              buildings.push(bRec);
              kitCounts[bRec.kit]++;
              blockFrontageUsed += defItem.w + lotGap;
            } else {
              faceCap = Math.max(0, faceCap - (defItem.w + lotGap));
            }
            cursor += defItem.w + lotGap;
          }
          blockFrontageCap += faceCap;
        }
        if (blockFrontageCap > 0 && blockFrontageUsed > 0) {
          builtSectors.push({
            terrace: band.terrace,
            deg0: d0,
            deg1: normDeg(d0 + band.spokeStep),
            rIn: band.rIn - 6.0,
            rOut: band.rOut + 6.0,
            elev: by,
            voth: isVothExt
          });
          blocks.push({
            id: band.id + '_S' + si, band: band.id, cls: band.cls, rIn: band.rIn, rOut: band.rOut,
            radialDepth: +(band.rOut - band.rIn).toFixed(2), expectedDepth: +(2 * band.lotD + band.alley).toFixed(2),
            frontageCap: +blockFrontageCap.toFixed(1), frontageUsed: +Math.min(blockFrontageCap, blockFrontageUsed).toFixed(1),
            utilization: +Math.min(1.0, blockFrontageUsed / blockFrontageCap).toFixed(3)
          });
        }
      }
    }

    // Build real Rinkvolk kit buildings (`skyBuildings`) on the Forest Ring Wheel Town (WY = 300 m) & Stepped Botanical Crown (+600..664 m)!
    var skyBuildings = [];
    var skySpace = KSPACE.create({ cell: 32 });
    skySpace.insert(ciderHall, ciderHall.x, ciderHall.z, 0.5 * Math.hypot(ciderHall.w, ciderHall.d) + 4.0);
    // Reserve the 12 Wheel Rim Pylons (rp = 586 m, every 30 deg at 15, 45, 75, ...) & 4 Bridge Gate Squares (7.5, 97.5, 187.5, 277.5 deg)
    for (var pyk = 0; pyk < 12; pyk++) {
      var pyDeg = 15.0 + 30.0 * pyk, pyA = pyDeg * DEG;
      var pyRec = { id: 'wheel_pylon_keepout_' + pyk, x: 586 * Math.cos(pyA), y: 300, z: 586 * Math.sin(pyA), ry: -pyA, w: 24, d: 24 };
      skySpace.insert(pyRec, pyRec.x, pyRec.z, 20.0);
    }
    for (var brk = 0; brk < arcology.wheelBridges.length; brk++) {
      var brDeg = arcology.wheelBridges[brk].deg, brA = brDeg * DEG;
      var sqRec = { id: 'wheel_bridge_sq_' + brk, x: 602 * Math.cos(brA), y: 300, z: 602 * Math.sin(brA), ry: -brA, w: 56, d: 58 };
      skySpace.insert(sqRec, sqRec.x, sqRec.z, 44.0);
    }

    var WHEEL_BLD_KEYS = [
      'swa-cider-press', 'swa-still-vat', 'swa-twindrum-house', 'swa-tank-duplex', 'swa-silo-stack',
      'swa-drum-tavern', 'swa-seed-silo', 'swa-tank-bakery', 'swa-apothecary-pod', 'swa-weaver-drums',
      'farmhouse', 'swa-hopper-stall', 'swa-silo-cot', 'dw-silo'
    ];
    var WHEEL_ROWS = [
      { r: 580.0, faceOut: true },
      { r: 622.0, faceOut: false }
    ];
    for (var wr = 0; wr < WHEEL_ROWS.length; wr++) {
      var wRow = WHEEL_ROWS[wr];
      var nSlots = 84;
      for (var ws = 0; ws < nSlots; ws++) {
        var wDeg = normDeg((360.0 * (ws + 0.5 * wr)) / nSlots);
        if (angDiff(wDeg, arcology.wheelBreachDeg) <= 21.5) continue;
        if (angDiff(wDeg, ciderHall.deg) <= 7.5) continue;
        var wKey = WHEEL_BLD_KEYS[(ws * 3 + wr * 5) % WHEEL_BLD_KEYS.length];
        var wDef = KITS.byKey[wKey];
        if (!wDef) continue;
        var wRad = wDeg * DEG;
        var wx = +(wRow.r * Math.cos(wRad)).toFixed(2), wz = +(wRow.r * Math.sin(wRad)).toFixed(2);
        var wFace = wRow.faceOut ? wRad : (wRad + Math.PI);
        var wb = {
          id: 'wheel_bld_' + skyBuildings.length,
          tier: 'outer_wheel',
          kit: wDef.kit,
          key: wDef.key,
          cls: wDef.cls,
          x: wx, y: 300.0, z: wz,
          r: wRow.r, deg: +wDeg.toFixed(2),
          ry: +Math.atan2(Math.cos(wFace), Math.sin(wFace)).toFixed(4),
          w: wDef.w, d: wDef.d, h: wDef.h, st: wDef.st,
          pop: 0,
          culture: 'post-apoc',
          style: wDef.style,
          types: wDef.types,
          wealth: wDef.wealth,
          job: wDef.job,
          district: 'outer_wheel',
          state: 'intact'
        };
        var wbR = 0.5 * Math.hypot(wb.w, wb.d);
        var skyHit = skySpace.some(wb.x, wb.z, wbR + 2.5, function (other) {
          return obbOverlap(wb, other, 1.4);
        });
        if (!skyHit) {
          skySpace.insert(wb, wb.x, wb.z, wbR);
          skyBuildings.push(wb);
        }
      }
    }

    // Curated Rinkvolk kit cottages, seed-silos, apothecary pods & shrines on the 3 Stepped Botanical Crown rings (+600, +632, +664 m)
    var CROWN_BLD_RINGS = [
      { y: 600.0, r: 344.0, n: 18, keys: ['swa-twindrum-house', 'swa-seed-silo', 'swa-apothecary-pod', 'swa-silo-cot', 'farmhouse'] },
      { y: 632.0, r: 222.0, n: 12, keys: ['swa-silo-cot', 'swa-apothecary-pod', 'swa-seed-silo', 'swa-pipe-shrine'] },
      { y: 664.0, r: 136.0, n: 8, keys: ['swa-pipe-shrine', 'swa-apothecary-pod', 'swa-silo-cot', 'voth_scrap_shrine'] }
    ];
    for (var cr = 0; cr < CROWN_BLD_RINGS.length; cr++) {
      var cSpec = CROWN_BLD_RINGS[cr];
      for (var ci = 0; ci < cSpec.n; ci++) {
        var cDeg = normDeg(22.5 + (360.0 * ci) / cSpec.n);
        if (angDiff(cDeg, arcology.crownFractureDeg) <= 24.0) continue;
        // Keep clear of the 8 radial stairs at multiples of 45 deg
        var nearCrownStair = false;
        for (var cst = 0; cst < 8; cst++) {
          if (angDiff(cDeg, cst * 45.0) < 7.5) nearCrownStair = true;
        }
        if (nearCrownStair) continue;
        var cKey = cSpec.keys[ci % cSpec.keys.length];
        var cDef = KITS.byKey[cKey];
        if (!cDef) continue;
        var cRad = cDeg * DEG;
        var cxB = +(cSpec.r * Math.cos(cRad)).toFixed(2), czB = +(cSpec.r * Math.sin(cRad)).toFixed(2);
        var cb = {
          id: 'crown_bld_' + skyBuildings.length,
          tier: 'stepped_crown',
          kit: cDef.kit,
          key: cDef.key,
          cls: cDef.cls,
          x: cxB, y: cSpec.y, z: czB,
          r: cSpec.r, deg: +cDeg.toFixed(2),
          ry: +Math.atan2(-Math.cos(cRad), -Math.sin(cRad)).toFixed(4),
          w: cDef.w, d: cDef.d, h: cDef.h, st: cDef.st,
          pop: 0,
          culture: cDef.culture,
          style: cDef.style,
          types: cDef.types,
          wealth: cDef.wealth,
          job: cDef.job,
          district: 'stepped_crown',
          state: 'intact'
        };
        skyBuildings.push(cb);
      }
    }

    // Build 6 km Soleri-Farm Hinterlands (2/3 Ruined, 1/3 Working Farms & Orchards) & Decayed Ancient Transit Network (32b-torus-hinterland.js)
    var hinterland = TORUS.buildHinterland({
      worldSeed: worldSeed,
      rng: KRAND.stream(KRAND.child(worldSeed, 'torus_soleri_hinterland')),
      KITS: KITS,
      groundAt: groundAt,
      inRiverCorridor: inRiverCorridor,
      tryInsertObb: tryInsertObb,
      isTransitBlocked: function (x, z, rad) {
        if (Math.hypot(x, z) < CUSTOMS_WALL_R + 6) return true;
        return space.some(x, z, rad + 4, function () { return true; });
      }
    });
    for (var hf = 0; hf < hinterland.hinterlandFields.length; hf++) agPlots.push(hinterland.hinterlandFields[hf]);

    // Calibrate exact 70% Terrace/Extension population: 5,950 citizens (2,550 Arcology + 5,950 Terraces = 8,500)
    var landmarkPop = 0;
    for (var li = 1; li < landmarks.length; li++) landmarkPop += landmarks[li].pop;
    var rawBldPop = 0;
    for (var pi2 = 0; pi2 < buildings.length; pi2++) rawBldPop += buildings[pi2].basePop;
    var targetBldPop = 5950 - landmarkPop;
    var scale = targetBldPop / (rawBldPop == null || rawBldPop === 0 ? 1 : rawBldPop);
    var assignedBldPop = 0;
    for (var bi2 = 0; bi2 < buildings.length; bi2++) {
      var scaled = Math.max(0, Math.round(buildings[bi2].basePop * scale));
      buildings[bi2].pop = scaled;
      assignedBldPop += scaled;
    }
    var diff = targetBldPop - assignedBldPop, stepP = diff > 0 ? 1 : -1, idx = 0;
    while (diff !== 0 && buildings.length > 0) {
      var candB = buildings[idx % buildings.length];
      if (candB.types.indexOf('dwelling-multi') >= 0 || candB.types.indexOf('dwelling-single') >= 0) {
        if (stepP > 0 || candB.pop > 2) { candB.pop += stepP; diff -= stepP; }
      }
      idx++;
      if (idx > buildings.length * 8) break;
    }
    var outerPop = landmarkPop;
    for (var bi3 = 0; bi3 < buildings.length; bi3++) outerPop += buildings[bi3].pop;

    return {
      version: 2, seed: worldSeed, site: site, arcology: arcology,
      landmarks: landmarks, specimenDomes: specimenDomes, feralDomes: feralDomes,
      walls: walls, gates: gates, roads: roads, agTerraces: agTerraces, agPlots: agPlots, builtSectors: builtSectors,
      blocks: blocks, buildings: buildings, skyBuildings: skyBuildings, hinterland: hinterland, links: links, kitCounts: kitCounts,
      pop: { arcology: arcology.totalPop, landmarks: landmarkPop, terraceBuildings: outerPop - landmarkPop, outerTotal: outerPop, total: arcology.totalPop + outerPop }
    };
  }

  function registerTags(plan, T) {
    var out = [];
    for (var i = 0; i < plan.landmarks.length; i++) {
      var lm = plan.landmarks[i];
      var ltags = { culture: lm.culture, style: lm.style, types: lm.types, state: lm.state, landmark: true, district: lm.role };
      if (lm.wealth) ltags.wealth = lm.wealth;
      if (lm.hazard) ltags.hazard = lm.hazard;
      var lRec = T.add({ class: 'landmark', key: lm.id, name: lm.name, at: [lm.x, lm.y, lm.z], ry: lm.ry, size: [lm.w, lm.d, lm.h], tags: ltags });
      lm.tagId = lRec.id;
      out.push(lRec);
    }
    for (var g = 0; g < plan.gates.length; g++) {
      var gt = plan.gates[g];
      var gRec = T.add({ class: 'infrastructure', key: gt.id, name: gt.name, at: [gt.x, gt.y, gt.z], ry: gt.ry, size: [gt.w, gt.d, gt.h],
        tags: { culture: gt.culture, style: gt.style, types: ['military', 'infrastructure'], state: gt.state, door: 'gate' } });
      gt.tagId = gRec.id;
      out.push(gRec);
    }
    for (var b = 0; b < plan.buildings.length; b++) {
      var bd = plan.buildings[b];
      var tg = { culture: bd.culture, style: bd.style, types: bd.types, state: bd.state, district: bd.district };
      if (bd.wealth) tg.wealth = bd.wealth;
      if (bd.job) tg.job = bd.job;
      var bRec = T.add({ class: 'building', key: bd.key, name: bd.key, at: [bd.x, bd.y, bd.z], ry: bd.ry, size: [bd.w, bd.d, bd.h], tags: tg });
      bd.tagId = bRec.id;
      out.push(bRec);
    }
    var skyBlds = plan.skyBuildings || [];
    for (var sb = 0; sb < skyBlds.length; sb++) {
      var sbd = skyBlds[sb];
      var stg = { culture: sbd.culture, style: sbd.style, types: sbd.types, state: sbd.state, district: sbd.district };
      if (sbd.wealth) stg.wealth = sbd.wealth;
      if (sbd.job) stg.job = sbd.job;
      var sbRec = T.add({ class: 'building', key: sbd.key, name: sbd.key, at: [sbd.x, sbd.y, sbd.z], ry: sbd.ry, size: [sbd.w, sbd.d, sbd.h], tags: stg });
      sbd.tagId = sbRec.id;
      out.push(sbRec);
    }
    var sol = plan.hinterland ? plan.hinterland.soleriStructures : [];
    for (var s = 0; s < sol.length; s++) {
      var sf = sol[s];
      var sRec = T.add({
        class: sf.family === 'aqueduct' || sf.family === 'watertower' || sf.family === 'pumphouse' ? 'infrastructure' : 'building',
        key: 'soleri_' + sf.family, name: sf.name, at: [sf.x, sf.y, sf.z], ry: sf.ry, size: [sf.w, sf.d, sf.h],
        tags: { culture: 'ancient', style: 'soleri-farm', types: sf.types, state: sf.state, district: 'soleri_hinterland' }
      });
      sf.tagId = sRec.id;
      out.push(sRec);
    }
    var farmOb = (plan.hinterland && plan.hinterland.farmOutbuildings) ? plan.hinterland.farmOutbuildings : [];
    for (var fo = 0; fo < farmOb.length; fo++) {
      var fb = farmOb[fo];
      var ftg = { culture: fb.culture, style: fb.style, types: fb.types, state: fb.state, district: fb.district };
      if (fb.wealth) ftg.wealth = fb.wealth;
      if (fb.job) ftg.job = fb.job;
      var fRec = T.add({ class: 'building', key: fb.key, name: fb.key, at: [fb.x, fb.y, fb.z], ry: fb.ry, size: [fb.w, fb.d, fb.h], tags: ftg });
      fb.tagId = fRec.id;
      out.push(fRec);
    }
    var tethers = (plan.arcology && plan.arcology.tetherStations) ? plan.arcology.tetherStations : [];
    for (var ts = 0; ts < tethers.length; ts++) {
      var st = tethers[ts];
      var tYaw = +(0.5 * Math.PI - st.deg * DEG).toFixed(4);
      var stRec = T.add({
        class: 'infrastructure', key: st.id, name: 'Wheel Rim Tether-Winch Station (' + st.rim + ')',
        at: [st.at[0], st.at[1], st.at[2]], ry: tYaw, size: [7.0, 5.0, 4.5],
        tags: {
          culture: 'post-apoc', style: 'sw-arcology', types: ['infrastructure', 'farm'], state: 'intact', district: 'outer_wheel',
          hazard: { kind: 'fall', danger: 0.90, shape: { type: 'box', w: 9.0, d: 6.0, h: 6.0, y0: -1.5 } }
        }
      });
      st.tagId = stRec.id;
      out.push(stRec);
    }
    return out;
  }

  TORUS.obbOverlap = obbOverlap;
  TORUS.inRiverCorridor = inRiverCorridor;
  TORUS.inWheelRuinZone = inWheelRuinZone;
  TORUS.inVothExtension = inVothExtension;
  TORUS.groundAt = groundAt;
  TORUS.buildCityPlan = buildCityPlan;
  TORUS.registerTags = registerTags;
})(typeof window !== 'undefined' ? window : globalThis);
