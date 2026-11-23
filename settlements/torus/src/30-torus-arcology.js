// ================================================================= TORUS — 30: Forest Ring Arcology Layout ([G data])
// Pure data & geometry for the semi-ruined Forest Ring arcology (kits/ancients/src/71c-ring.js, target: ring).
// Zero THREE, zero DOM. Exact shell constants: Barrel RFOOT = 292 m, waist RW = 404 m (YW = 240 m), shoulder RSH = 336 m
// (HB = 600 m), central atrium RAT = 34 m, Suspended Outer Wheel WR0 = 560 m .. WR1 = 720 m at WY = 300 m (80 m soffit),
// 4 radial bridges (BRTH = 7.5, 97.5, 187.5, 277.5 deg), wheel breach WA = 57.3 deg, crown fracture FRA = 131.8 deg.
// Top-heavy arcology habitation: 2,550 total = 1,250 Wheel + 600 Crown + 150 Middle Barrel Transit + 550 Foot Vaults.
(function (root) {
  'use strict';

  var TORUS = root.TORUS || (root.TORUS = {});

  var DEG = Math.PI / 180;
  var RFOOT = 292.0;
  var RW = 404.0;
  var YW = 240.0;
  var RSH = 336.0;
  var HB = 600.0;
  var RAT = 34.0;
  var WY = 300.0;
  var WR0 = 560.0;
  var WR1 = 720.0;
  var WDK = 80.0;
  var FRA_DEG = +(2.30 * 180 / Math.PI).toFixed(2); // 131.78 deg
  var WA_DEG = +(1.00 * 180 / Math.PI).toFixed(2);  // 57.30 deg

  var HOOPY = [111.0, 240.0, 346.8, 459.0, 538.2];
  var BRIDGE_DEGS = [7.5, 97.5, 187.5, 277.5];

  function rBarrelAt(y) {
    if (y < YW) {
      var t0 = y / YW;
      return RFOOT + (RW - RFOOT) * Math.sin(t0 * Math.PI * 0.5);
    }
    var t1 = (y - YW) / (HB - YW);
    return RSH + (RW - RSH) * 0.5 * (1.0 + Math.cos(t1 * Math.PI));
  }

  function normDeg(d) {
    var x = d % 360;
    return x < 0 ? x + 360 : x;
  }

  function angDiff(a, b) {
    var d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  function polarAt(r, deg, y) {
    var a = deg * DEG;
    return [+(r * Math.cos(a)).toFixed(2), +(y == null ? 0 : y).toFixed(2), +(r * Math.sin(a)).toFixed(2)];
  }

  var FOOT_PORTALS = [
    { id: 'portal_foot_e', deg: 7.5, name: 'East Irrigation & Bridge-Hoist Portal', role: 'irrigation' },
    { id: 'portal_foot_ene_ruin', deg: 55.0, ruined: true, name: 'Cracked ENE Wheel-Fall Arcade', role: 'ruin' },
    { id: 'portal_foot_n', deg: 97.5, name: 'North Terrace & Orchard Portal', role: 'terrace' },
    { id: 'portal_foot_se_voth', deg: 142.0, name: 'South-East Vothic Extension Portal', role: 'diplomatic' },
    { id: 'portal_foot_w_cider', deg: 187.5, name: 'West Cider-Drop & Specimen Portal', role: 'cider' },
    { id: 'portal_foot_sw_board', deg: 215.0, name: 'Board Hall & Tenders Processional Portal', role: 'civic' },
    { id: 'portal_foot_s', deg: 277.5, name: 'South Breadbasket & Tithe Portal', role: 'tithe' },
    { id: 'portal_foot_nnw_river', deg: 320.0, name: 'Tors Rivrh Barge & Bond-Store Portal', role: 'wharf' }
  ];

  var HOISTS = [
    { id: 'arc_hoist_ne', deg: 45.0, r: 74.0, name: 'NE Atrium Express Hoist' },
    { id: 'arc_hoist_nw', deg: 135.0, r: 74.0, name: 'NW Atrium Express Hoist' },
    { id: 'arc_hoist_sw', deg: 225.0, r: 74.0, name: 'SW Atrium Express Hoist' },
    { id: 'arc_hoist_se', deg: 315.0, r: 74.0, name: 'SE Atrium Express Hoist' }
  ];

  function buildArcology() {
    var tiers = [];
    var fruitvines = [];
    var tetherStations = [];
    var wheelBridges = [];
    var simNodes = [];
    var links = [];

    // 1. Arcaded Foot & Terrace Vaults (y = 0..58 m, 550 pop)
    var footSectors = [
      { id: 'arc_foot_s01', deg: 0, state: 'reclaimed', use: 'infrastructure', job: null, simRole: 'header_cistern', pop: 0, usableM2: 6800, at: polarAt(228, 0, 4) },
      { id: 'arc_foot_s02', deg: 55, state: 'ruined', use: 'industry', job: 'quarrying', simRole: 'ene_foot_ruin', pop: 0, usableM2: 0, at: polarAt(228, 55, 4) },
      { id: 'arc_foot_s03', deg: 90, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'foot_arcade_flats', pop: 140, usableM2: 9200, at: polarAt(228, 90, 8) },
      { id: 'arc_foot_s04', deg: 135, state: 'reclaimed', use: 'industry', job: 'farming', simRole: 'tenders_loam_vault', pop: 0, usableM2: 7400, at: polarAt(228, 135, 4) },
      { id: 'arc_foot_s05', deg: 180, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'foot_arcade_flats', pop: 140, usableM2: 9200, at: polarAt(228, 180, 8) },
      { id: 'arc_foot_s06', deg: 225, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'foot_arcade_flats', pop: 140, usableM2: 9400, at: polarAt(228, 225, 8) },
      { id: 'arc_foot_s07', deg: 270, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'foot_arcade_flats', pop: 130, usableM2: 8800, at: polarAt(228, 270, 8) },
      { id: 'arc_foot_s08', deg: 315, state: 'reclaimed', use: 'industry', job: 'warehousing', simRole: 'tithe_bond_store', pop: 0, usableM2: 17600, at: polarAt(228, 315, 4) }
    ];
    tiers.push({
      id: 'arc_tier_foot',
      band: 'foot_vaults',
      y0: 0,
      y1: 58,
      pop: 550,
      usableM2: 68400,
      sectors: footSectors
    });

    // 2. Sparse Middle Barrel Transit Waystations (y = 60..580 m, 150 pop — keeps vertical transit open)
    var midSectors = [
      { id: 'arc_mid_w01', deg: 52, y: 111.0, state: 'reclaimed', use: 'dwelling-multi', job: 'ropemaking', simRole: 'hoist_rigger_waystation', pop: 40, usableM2: 6200, at: polarAt(318, 52, 111) },
      { id: 'arc_mid_w02', deg: 225, y: 240.0, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'pump_relay_waystation', pop: 40, usableM2: 6400, at: polarAt(318, 225, 240) },
      { id: 'arc_mid_w03', deg: 318, y: 346.8, state: 'reclaimed', use: 'dwelling-multi', job: 'warehousing', simRole: 'cask_lower_waystation', pop: 40, usableM2: 6200, at: polarAt(318, 318, 347) },
      { id: 'arc_mid_w04', deg: 162, y: 459.0, state: 'reclaimed', use: 'dwelling-multi', job: null, simRole: 'climber_hostel_waystation', pop: 30, usableM2: 5400, at: polarAt(318, 162, 459) },
      { id: 'arc_mid_ruin', deg: 132, y: 538.2, state: 'ruined', use: 'infrastructure', job: null, simRole: 'shoulder_fracture_shaft', pop: 0, usableM2: 0, at: polarAt(318, 132, 538) }
    ];
    tiers.push({
      id: 'arc_tier_middle_barrel',
      band: 'middle_transit',
      y0: 60,
      y1: 580,
      pop: 150,
      usableM2: 24200,
      sectors: midSectors
    });

    // 4 Radial Wheel Bridges at WY = 300 m
    for (var bi = 0; bi < BRIDGE_DEGS.length; bi++) {
      var bdeg = BRIDGE_DEGS[bi];
      var brId = 'arc_wheel_bridge_' + bi;
      wheelBridges.push({
        id: brId,
        index: bi,
        deg: bdeg,
        y: WY,
        r0: +rBarrelAt(WY).toFixed(1),
        r1: WR0,
        at: polarAt(0.5 * (rBarrelAt(WY) + WR0), bdeg, WY)
      });
    }

    // 3. Suspended Outer Wheel & Cider Tube (WY = 300 m, y = 220..300 m, 1,250 pop)
    // 24 sectors of 15 deg around the Wheel; sectors in [40..75 deg] are collapsed (WA = 57.3 deg).
    var wheelSectors = [];
    var intactWheelIndices = [];
    for (var ws = 0; ws < 24; ws++) {
      var wdeg = 7.5 + 15.0 * ws;
      var collapsed = angDiff(wdeg, WA_DEG) <= 18.0;
      if (!collapsed) intactWheelIndices.push(ws);
    }
    // Distribute exact 1,250 residents across the 21 intact Wheel sectors: 5 * 60 + 19 * 50 = 1,250? Wait: 21 sectors:
    // 11 * 60 + 10 * 59 = 660 + 590 = 1,250! Exact integer sum === 1,250.
    var intactRank = 0;
    for (var wk = 0; wk < 24; wk++) {
      var degW = 7.5 + 15.0 * wk;
      var isBreach = angDiff(degW, WA_DEG) <= 18.0;
      var wPop = 0;
      var wUse = 'industry';
      var wJob = 'brewing';
      var wRole = 'cider_tube_vault';
      if (isBreach) {
        wUse = 'infrastructure';
        wJob = null;
        wRole = 'wheel_collapse_breach';
      } else {
        wPop = intactRank < 11 ? 60 : 59;
        intactRank++;
        if (wk % 3 === 0) {
          wUse = 'industry';
          wJob = 'brewing';
          wRole = degW === 187.5 || degW === 202.5 ? 'great_cider_press_hall' : 'wheel_cider_press';
        } else {
          wUse = 'dwelling-multi';
          wJob = 'orchardry';
          wRole = 'wheel_town_tenements';
        }
      }
      var wsId = 'arc_wheel_S' + (wk < 10 ? '0' + wk : wk);
      var wM2 = isBreach ? 0 : 8760;
      var wSec = {
        id: wsId,
        sector: wk,
        deg: degW,
        state: isBreach ? 'ruined' : 'reclaimed',
        use: wUse,
        job: wJob,
        simRole: wRole,
        pop: wPop,
        usableM2: wM2,
        at: polarAt(616, degW, WY)
      };
      wheelSectors.push(wSec);

      // Immense hanging fruitvines on BOTH Inner (WR0 = 560 m) and Outer (WR1 = 720 m) rims for every intact sector!
      if (!isBreach) {
        var innerLen = +(82 + 44 * (0.5 + 0.5 * Math.sin(degW * DEG * 2.0))).toFixed(1);
        var outerLen = +(94 + 46 * (0.5 + 0.5 * Math.cos(degW * DEG * 1.5))).toFixed(1);
        fruitvines.push({
          id: 'vine_inner_S' + (wk < 10 ? '0' + wk : wk),
          rim: 'inner',
          r: WR0,
          deg: degW,
          yTop: WY,
          dropM: innerLen,
          cropId: 'sky-fruitvine',
          cultivar: 'ruby_tart_vine',
          at: polarAt(WR0, degW, WY - 0.5 * innerLen)
        });
        fruitvines.push({
          id: 'vine_outer_S' + (wk < 10 ? '0' + wk : wk),
          rim: 'outer',
          r: WR1,
          deg: degW,
          yTop: WY,
          dropM: outerLen,
          cropId: 'sky-fruitvine',
          cultivar: 'golden_sun_vine',
          at: polarAt(WR1, degW, WY - 0.5 * outerLen)
        });
        tetherStations.push({
          id: 'tether_in_S' + (wk < 10 ? '0' + wk : wk),
          rim: 'inner',
          r: WR0 + 4.0,
          deg: degW,
          y: WY,
          winches: 2,
          hazard: 'fall',
          at: polarAt(WR0 + 4.0, degW, WY)
        });
        tetherStations.push({
          id: 'tether_out_S' + (wk < 10 ? '0' + wk : wk),
          rim: 'outer',
          r: WR1 - 4.0,
          deg: degW,
          y: WY,
          winches: 2,
          hazard: 'fall',
          at: polarAt(WR1 - 4.0, degW, WY)
        });
      }
    }
    tiers.push({
      id: 'arc_tier_outer_wheel',
      band: 'outer_wheel',
      y0: WY - WDK,
      y1: WY + 22,
      pop: 1250,
      usableM2: 21 * 8760,
      sectors: wheelSectors
    });

    // 4. Stepped Crown Toruses & Living Bands (y = 600..780 m, 600 pop)
    var crownSectors = [
      { id: 'arc_crown_b0_n', deg: 45, y: 608, r: 270, state: 'reclaimed', use: 'dwelling-multi', job: 'farming', simRole: 'crown_band0_flats', pop: 130, usableM2: 16400, at: polarAt(270, 45, 608) },
      { id: 'arc_crown_b0_s', deg: 270, y: 608, r: 270, state: 'reclaimed', use: 'dwelling-multi', job: 'farming', simRole: 'crown_band0_flats', pop: 130, usableM2: 16400, at: polarAt(270, 270, 608) },
      { id: 'arc_crown_t0_crops', deg: 195, y: 600, r: 314, state: 'reclaimed', use: 'farm', job: 'farming', simRole: 'crown_sky_crops', pop: 0, usableM2: 18200, at: polarAt(314, 195, 600) },
      { id: 'arc_crown_notch', deg: FRA_DEG, y: 616, r: 272, state: 'ruined', use: 'infrastructure', job: null, simRole: 'crown_fracture_notch', pop: 0, usableM2: 0, at: polarAt(272, FRA_DEG, 616) },
      { id: 'arc_crown_b1_e', deg: 315, y: 640, r: 182, state: 'reclaimed', use: 'dwelling-multi', job: 'farming', simRole: 'crown_band1_flats', pop: 110, usableM2: 12200, at: polarAt(182, 315, 640) },
      { id: 'arc_crown_b1_w', deg: 180, y: 640, r: 182, state: 'reclaimed', use: 'dwelling-multi', job: 'farming', simRole: 'crown_band1_flats', pop: 110, usableM2: 12200, at: polarAt(182, 180, 640) },
      { id: 'arc_crown_t1_orchard', deg: 90, y: 632, r: 226, state: 'reclaimed', use: 'farm', job: 'farming', simRole: 'crown_mother_orchard', pop: 0, usableM2: 14600, at: polarAt(226, 90, 632) },
      { id: 'arc_crown_b2_top', deg: 45, y: 672, r: 94, state: 'reclaimed', use: 'dwelling-multi', job: 'worship', simRole: 'crown_band2_keepers', pop: 120, usableM2: 8600, at: polarAt(94, 45, 672) },
      { id: 'arc_crown_t2_sacred', deg: 270, y: 664, r: 138, state: 'reclaimed', use: 'religious', job: 'worship', simRole: 'sacred_wild_ring_shrine', pop: 0, usableM2: 11200, at: polarAt(138, 270, 664) },
      { id: 'arc_crown_sun_oratory', deg: 0, y: 664, r: 138, state: 'reclaimed', use: 'religious', job: 'worship', simRole: 'sun_missionary_oratory', pop: 0, usableM2: 2800, at: polarAt(138, 0, 664) }
    ];
    tiers.push({
      id: 'arc_tier_crown',
      band: 'stepped_crown',
      y0: 600,
      y1: 780,
      pop: 600,
      usableM2: 92600,
      sectors: crownSectors
    });

    // Collect SIM-participating workplaces/farms/cellars across the arcology
    for (var ti = 0; ti < tiers.length; ti++) {
      var tr = tiers[ti];
      for (var si = 0; si < tr.sectors.length; si++) {
        var sc = tr.sectors[si];
        if (sc.state !== 'ruined' && (sc.job || sc.simRole === 'tithe_bond_store' || sc.simRole === 'header_cistern')) {
          simNodes.push({
            id: sc.id,
            band: tr.band,
            role: sc.simRole,
            use: sc.use,
            job: sc.job,
            areaM2: sc.usableM2,
            at: sc.at
          });
        }
      }
    }

    // Walk-graph connectivity: Foot Portals -> Atrium Base -> 4 Express Hoists -> Mid-Barrel -> 4 Bridges -> Wheel Ring & Cider Hall -> Crown
    links.push(['arc_atrium_base', 'arc_tier_foot', { kind: 'arcade', gated: false }]);
    for (var pi = 0; pi < FOOT_PORTALS.length; pi++) {
      if (!FOOT_PORTALS[pi].ruined) {
        links.push([FOOT_PORTALS[pi].id, 'arc_atrium_base', { kind: 'portal', gated: false }]);
      }
    }
    for (var hi = 0; hi < HOISTS.length; hi++) {
      var hid = HOISTS[hi].id;
      links.push(['arc_atrium_base', hid + '_foot', { kind: 'corridor', gated: false }]);
      links.push([hid + '_foot', hid + '_mid', { kind: 'hoist', gated: false }]);
      links.push([hid + '_mid', 'arc_tier_middle_barrel', { kind: 'waystation', gated: false }]);
      links.push([hid + '_mid', hid + '_y300', { kind: 'hoist', gated: false }]);
      links.push([hid + '_y300', hid + '_crown', { kind: 'hoist', gated: false }]);
      links.push([hid + '_crown', 'arc_tier_crown', { kind: 'crown_stair', gated: false }]);
    }
    for (var bri = 0; bri < wheelBridges.length; bri++) {
      var br = wheelBridges[bri];
      var nearHoist = HOISTS[bri % HOISTS.length].id + '_y300';
      var secIdx = Math.round((br.deg - 7.5) / 15.0);
      var wSecId = 'arc_wheel_S' + (secIdx < 10 ? '0' + secIdx : secIdx);
      links.push([nearHoist, br.id, { kind: 'gallery', gated: false }]);
      links.push([br.id, wSecId, { kind: 'wheel_bridge', gated: false }]);
    }
    for (var wi = 0; wi < 24; wi++) {
      var curW = wheelSectors[wi];
      var nxtW = wheelSectors[(wi + 1) % 24];
      if (curW.state !== 'ruined' && nxtW.state !== 'ruined') {
        links.push([curW.id, nxtW.id, { kind: 'wheel_avenue', gated: false }]);
      }
      if (curW.state !== 'ruined') {
        var tIn = 'tether_in_S' + (wi < 10 ? '0' + wi : wi);
        var tOut = 'tether_out_S' + (wi < 10 ? '0' + wi : wi);
        links.push([curW.id, tIn, { kind: 'tether_alley', gated: false }]);
        links.push([curW.id, tOut, { kind: 'tether_alley', gated: false }]);
      }
    }
    // Link West Wheel sector (187.5 / 202.5 deg) directly to the floorplanned Great Cider-Press & Winch Hall
    links.push(['arc_wheel_S12', 'lm_ciderhall', { kind: 'wheel_plaza', gated: false }]);
    links.push(['arc_wheel_S13', 'lm_ciderhall', { kind: 'wheel_plaza', gated: false }]);
    links.push(['arc_tier_crown', 'arc_crown_t2_sacred', { kind: 'crown_stair', gated: false }]);

    var totalPop = 550 + 150 + 1250 + 600; // 2,550 === 30.0% of 8,500
    return {
      targetKey: 'ring',
      sourceModule: 'kits/ancients/src/71c-ring.js',
      RFOOT: RFOOT,
      RW: RW,
      YW: YW,
      RSH: RSH,
      HB: HB,
      RAT: RAT,
      WY: WY,
      WR0: WR0,
      WR1: WR1,
      WDK: WDK,
      hoopHeights: HOOPY.slice(),
      crownFractureDeg: FRA_DEG,
      wheelBreachDeg: WA_DEG,
      totalPop: totalPop,
      upperPop: 1250 + 600,
      middlePop: 150,
      footPop: 550,
      portals: FOOT_PORTALS,
      hoists: HOISTS,
      wheelBridges: wheelBridges,
      tiers: tiers,
      fruitvines: fruitvines,
      tetherStations: tetherStations,
      simNodes: simNodes,
      links: links
    };
  }

  TORUS.rBarrelAt = rBarrelAt;
  TORUS.buildArcology = buildArcology;
})(typeof window !== 'undefined' ? window : globalThis);
