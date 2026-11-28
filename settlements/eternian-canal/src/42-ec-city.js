// prefix: ec
// ================================================================= SHUANG-ZHA — 6-ward canal burgh on core/city, core/hamlet & kits/transit ([G data])
// Pure [G data]:
//   - Zero street-over-canal intrusions: all streets split/clipped behind canal towpath curbs via KCANAL.clipStreetWays
//     and masked to 0 across all canal troughs/locks/basins in KMASK via KCANAL.buildRoadMask.
//   - Full 6-ward building population: fixed KCITY kit.dims({key,v}), complete waterfront quay rows on every trunk &
//     lateral arm/leg/spur, KCITY groundOk + alley infill, and deterministic street-frontage completion across all 6 wards.
var EC_CITY = (function () {
  'use strict';
  var G = EC_GROUND, H = EC_HYD, K = KCANAL;

  var DEFAULT_DIMS = {
    et_reed_house: { w: 8.6, d: 6.4, h: 4.8 },
    et_block_hut: { w: 7.2, d: 5.4, h: 4.0 },
    et_canal_row: { w: 13.0, d: 9.0, h: 8.0 },
    et_canal_house: { w: 10.4, d: 11.0, h: 12.0 },
    et_court_house: { w: 14.4, d: 14.4, h: 7.0 },
    et_corner_turret: { w: 11.0, d: 11.0, h: 16.5 },
    et_merchant_house: { w: 12.4, d: 11.4, h: 18.4 },
    et_official_villa: { w: 24.6, d: 20.6, h: 11.6 },
    et_hex_hut: { w: 8.0, d: 8.0, h: 6.0 },
    et_hex_house: { w: 11.0, d: 11.0, h: 11.0 },
    et_hex_villa: { w: 24.0, d: 24.0, h: 15.0 },
    et_ministry: { w: 27.0, d: 22.0, h: 46.0 },
    et_registry: { w: 30.0, d: 18.0, h: 17.0 },
    et_examination_hall: { w: 26.0, d: 26.0, h: 30.0 },
    et_customs_house: { w: 21.0, d: 13.0, h: 15.0 },
    et_barracks: { w: 25.0, d: 21.0, h: 12.0 },
    et_clock: { w: 24.0, d: 8.0, h: 26.0 },
    et_tube_station: { w: 10.0, d: 10.0, h: 9.0 },
    et_tube_pipe: { w: 10.4, d: 1.0, h: 3.4 },
    et_relic_hall: { w: 22.0, d: 27.0, h: 18.0 },
    et_ancestor_gallery: { w: 13.0, d: 30.0, h: 23.4 },
    et_mask_house: { w: 15.0, d: 11.0, h: 8.0 },
    et_historians_house: { w: 18.0, d: 13.0, h: 22.0 },
    et_kiln: { w: 26.0, d: 26.0, h: 14.0 },
    et_tile_works: { w: 24.0, d: 28.0, h: 14.0 },
    et_porcelain: { w: 16.0, d: 10.0, h: 12.0 },
    et_paper_mill: { w: 16.0, d: 13.0, h: 12.0 },
    et_printer: { w: 11.0, d: 11.0, h: 10.0 },
    et_bakehouse: { w: 11.0, d: 11.0, h: 10.0 },
    et_butcher: { w: 10.0, d: 9.0, h: 8.0 },
    et_weaver: { w: 12.0, d: 12.0, h: 10.0 },
    et_brewhouse: { w: 12.0, d: 11.0, h: 11.0 },
    et_tannery: { w: 14.0, d: 12.0, h: 6.0 },
    et_smithy: { w: 11.0, d: 10.0, h: 10.0 },
    et_shophouse: { w: 10.0, d: 10.0, h: 10.0 },
    et_tea_house: { w: 14.0, d: 14.0, h: 9.0 },
    et_inn: { w: 22.0, d: 20.0, h: 15.0 },
    et_healer: { w: 14.0, d: 14.0, h: 10.0 },
    et_market_hall: { w: 26.0, d: 26.0, h: 22.0 },
    et_granary: { w: 15.0, d: 15.0, h: 14.0 },
    et_warehouse: { w: 20.0, d: 22.0, h: 18.0 },
    et_mushroom_cellar: { w: 11.0, d: 9.0, h: 5.0 },
    et_farmstead: { w: 30.0, d: 28.0, h: 9.0 },
    et_paddy: { w: 28.0, d: 24.0, h: 5.0 },
    et_tea_garden: { w: 26.0, d: 22.0, h: 8.0 },
    et_mine: { w: 22.0, d: 18.0, h: 16.0 },
    et_quarry: { w: 24.0, d: 18.0, h: 12.0 },
    et_bridge: { w: 4.0, d: 13.0, h: 4.4 },
    et_reservoir_wall: { w: 30.0, d: 18.0, h: 9.0 },
    et_spillway: { w: 24.0, d: 20.0, h: 22.0 },
    et_canal_landing: { w: 12.0, d: 12.0, h: 5.0 },
    et_ferry_landing: { w: 12.0, d: 16.0, h: 5.0 },
    et_fish_landing: { w: 14.0, d: 16.0, h: 4.0 },
    et_quay: { w: 32.0, d: 14.0, h: 12.0 },
    et_dock: { w: 30.0, d: 26.0, h: 12.0 },
    et_lighthouse: { w: 14.0, d: 14.0, h: 34.0 },
    tr_canal_quay: { w: 24.0, d: 3.2, h: 3.8 },
    tr_miter_lock: { w: 20.0, d: 28.0, h: 6.8 },
    tr_cart_bridge: { w: 7.4, d: 28.0, h: 5.8 },
    tr_intake_weir: { w: 46.0, d: 14.0, h: 6.4 },
    tr_sluice_gate: { w: 14.0, d: 10.0, h: 9.2 },
    tr_culvert_aqueduct: { w: 15.0, d: 48.0, h: 11.8 },
    tr_cargo_crane: { w: 4.8, d: 4.8, h: 8.4 }
  };

  /* Household headcounts tuned for full 6-ward urban buildout (~650-800 structures -> ~6,800-8,800 souls) */
  var PEOPLE = {
    et_reed_house: 6, et_block_hut: 5, et_canal_row: 14, et_canal_house: 10,
    et_court_house: 13, et_corner_turret: 11, et_merchant_house: 14, et_official_villa: 18,
    et_hex_hut: 5, et_hex_house: 9, et_hex_villa: 15,
    et_shophouse: 8, et_bakehouse: 6, et_butcher: 5, et_weaver: 8, et_brewhouse: 7,
    et_tannery: 6, et_smithy: 5, et_tea_house: 7, et_inn: 18, et_healer: 7,
    et_market_hall: 12, et_granary: 4, et_warehouse: 5, et_mushroom_cellar: 4,
    et_kiln: 14, et_tile_works: 12, et_porcelain: 9, et_paper_mill: 9, et_printer: 6,
    et_ministry: 26, et_registry: 16, et_examination_hall: 14, et_customs_house: 10,
    et_barracks: 36, et_clock: 6, et_tube_station: 6, et_relic_hall: 12,
    et_ancestor_gallery: 6, et_mask_house: 6, et_historians_house: 8,
    et_farmstead: 12, et_dock: 10, et_quay: 4, et_lighthouse: 3,
    et_ferry_landing: 4, et_fish_landing: 5
  };

  var CANAL_SPECS = K.SPECS;

  var CANAL_WAYS = [
    { id: 'cway.p0.approach', kind: 'canal_trunk', pound: 'P0', wlev: 45.87, quayY: 47.50, u0: 0, s0: -430, u1: 0, s1: -396, waterW: 17.0, rowW: 25.0 },
    { id: 'cway.p1.trunk.s', kind: 'canal_trunk', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: 0, s0: -340, u1: 0, s1: -24, waterW: 11.0, rowW: 20.0 },
    { id: 'cway.p1.trunk.n', kind: 'canal_trunk', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: 0, s0: 24, u1: 0, s1: 380, waterW: 11.0, rowW: 20.0 },
    { id: 'cway.p1.east.arm', kind: 'canal_ward', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: 5.5, s0: 110, u1: 345, s1: 110, waterW: 7.6, rowW: 14.0 },
    { id: 'cway.p1.east.leg', kind: 'canal_ward', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: 240, s0: -90, u1: 240, s1: 250, waterW: 7.6, rowW: 14.0 },
    { id: 'cway.p1.west.arm', kind: 'canal_ward', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: -5.5, s0: -110, u1: -345, s1: -110, waterW: 7.6, rowW: 14.0 },
    { id: 'cway.p1.west.leg', kind: 'canal_ward', pound: 'P1', wlev: 52.47, quayY: 53.95, u0: -220, s0: -260, u1: -220, s1: 40, waterW: 7.6, rowW: 14.0 },
    { id: 'cway.p2.feeder', kind: 'canal_feeder', pound: 'P2', wlev: 58.87, quayY: 60.35, u0: 0, s0: 436, u1: 0, s1: 720, waterW: 9.3, rowW: 14.5 },
    { id: 'cway.p2.headrace', kind: 'canal_feeder', pound: 'P2', wlev: 58.87, quayY: 60.35, u0: 72.5, s0: 810, u1: 72.5, s1: 868, waterW: 6.9, rowW: 11.4 }
  ];

  var BRIDGES = H.BRIDGES;
  var makeObb = K.makeObb;
  var obbOverlap = K.obbOverlap;

  function eternianHamletRow() {
    return {
      kit: 'eternian', household: 5.2, workShare: 0.48, slopeMax: 0.22,
      religious: 'et_mask_house', civic: 'et_historians_house', general: 'et_shophouse',
      food: 'et_tea_house', warehouse: 'et_granary',
      services: { religious: 2, civic: 3, general: 3, food: 4, warehouse: 3 },
      houses: {
        poor: [['et_reed_house', 2, 3], ['et_block_hut', 2, 2], ['et_hex_hut', 2, 1]],
        middling: [['et_canal_house', 3, 2], ['et_court_house', 4, 1], ['et_hex_house', 3, 1]],
        head: [['et_merchant_house', 1, 1]],
        middlingShare: 0.36
      },
      works: {
        farming: [{ key: 'et_farmstead', jobs: 12, share: 0.72 }, { key: 'et_granary', jobs: 5, share: 0.28 }],
        clay: [{ key: 'et_quarry', jobs: 10, share: 0.45 }, { key: 'et_mine', jobs: 10, share: 0.30 }, { key: 'et_kiln', jobs: 8, share: 0.25 }]
      },
      focusJobs: { farming: 115, clay: 78 },
      reach: { farming: 260, clay: 220 },
      pending: {}
    };
  }

  /* Continuous Towpath & Bridge Walk Graph (updated to match aligned bridge coordinates w2 s=-185, e3 s=215) */
  function buildTowpathGraph() {
    var nodes = {}, edges = [];
    function n(id, u, s, y) {
      var p = G.at(u, s);
      nodes[id] = { id: id, u: u, s: s, x: p[0], z: p[1], y: y };
    }
    function e(a, b, w, kind) {
      var na = nodes[a], nb = nodes[b];
      var horiz = Math.hypot(nb.x - na.x, nb.z - na.z);
      var slope = horiz > 1e-4 ? Math.abs(nb.y - na.y) / horiz : 0;
      edges.push({ a: a, b: b, w: w, kind: kind, slope: +slope.toFixed(4), dist: +horiz.toFixed(2) });
    }
    n('harb.w', -180, -433, 47.50);
    n('harb.lw', -10.2, -433, 47.50);
    n('harb.le', 10.2, -433, 47.50);
    n('harb.e', 180, -433, 47.50);
    n('p0.app.w', -10.2, -396, 47.50);
    n('p0.app.e', 10.2, -396, 47.50);
    n('l1.top.w', -10.2, -340, 53.95);
    n('l1.top.e', 10.2, -340, 53.95);

    n('tr.br1.sw', -8.8, -200, 53.95); n('tr.br1.se', 8.8, -200, 53.95);
    n('tr.br1.cw', -5.7, -185, 55.82); n('tr.br1.ce', 5.7, -185, 55.82);
    n('tr.br1.nw', -8.8, -170, 53.95); n('tr.br1.ne', 8.8, -170, 53.95);
    n('tr.west.j', -8.8, -110, 53.95);
    n('tr.tb.sw', -8.8, -26, 53.95); n('tr.tb.se', 8.8, -26, 53.95);
    n('tb.w', -30.5, 0, 53.95); n('tb.e', 30.5, 0, 53.95);
    n('tr.tb.nw', -8.8, 26, 53.95); n('tr.tb.ne', 8.8, 26, 53.95);
    n('tr.east.j', 8.8, 110, 53.95);
    n('tr.br2.sw', -8.8, 200, 53.95); n('tr.br2.se', 8.8, 200, 53.95);
    n('tr.br2.cw', -5.7, 215, 55.82); n('tr.br2.ce', 5.7, 215, 55.82);
    n('tr.br2.nw', -8.8, 230, 53.95); n('tr.br2.ne', 8.8, 230, 53.95);
    n('l2.bot.w', -10.2, 380, 53.95); n('l2.bot.e', 10.2, 380, 53.95);

    /* W4 East Kiln Lateral & 3 Footbridges (b1 at 120,110; b2 at 240,15; b3 at 240,215) */
    n('w4.arm.b1s', 120, 99.0, 53.95); n('w4.arm.b1c', 120, 110, 55.85); n('w4.arm.b1n', 120, 121.0, 53.95);
    n('w4.j.sw', 234.5, 104.5, 53.95); n('w4.j.se', 245.5, 104.5, 53.95);
    n('w4.j.nw', 234.5, 115.5, 53.95); n('w4.j.ne', 245.5, 115.5, 53.95);
    n('w4.end', 342, 115.5, 53.95);
    n('w4.leg.s', 234.5, -86, 53.95);
    n('w4.b2.w', 229.0, 15, 53.95); n('w4.b2.c', 240, 15, 55.85); n('w4.b2.e', 251.0, 15, 53.95);
    n('w4.b3.w', 229.0, 215, 53.95); n('w4.b3.c', 240, 215, 55.85); n('w4.b3.e', 251.0, 215, 53.95);
    n('w4.leg.n', 234.5, 246, 53.95);

    /* W5 West Market Lateral & 3 Footbridges (b1 at -120,-110; b2 at -220,-185; b3 at -220,-25) */
    n('w5.arm.b1n', -120, -99.0, 53.95); n('w5.arm.b1c', -120, -110, 55.85); n('w5.arm.b1s', -120, -121.0, 53.95);
    n('w5.j.ne', -214.5, -104.5, 53.95); n('w5.j.nw', -225.5, -104.5, 53.95);
    n('w5.j.se', -214.5, -115.5, 53.95); n('w5.j.sw', -225.5, -115.5, 53.95);
    n('w5.end', -342, -115.5, 53.95);
    n('w5.leg.s', -214.5, -256, 53.95);
    n('w5.b2.e', -209.0, -185, 53.95); n('w5.b2.c', -220, -185, 55.85); n('w5.b2.w', -231.0, -185, 53.95);
    n('w5.b3.e', -209.0, -25, 53.95); n('w5.b3.c', -220, -25, 55.85); n('w5.b3.w', -231.0, -25, 53.95);
    n('w5.leg.n', -214.5, 36, 53.95);

    n('l2.top.w', -9.8, 436, 60.35); n('l2.top.e', 9.8, 436, 60.35);
    n('aq.s.w', -5.8, 656, 60.35); n('aq.s.e', 5.8, 656, 60.35);
    n('aq.n.w', -5.8, 704, 60.35); n('aq.n.e', 5.8, 704, 60.35);
    n('sb.sw', -24.5, 720, 60.35); n('sb.se', 24.5, 720, 60.35);
    n('sb.nw', -24.5, 810, 60.35); n('sb.ne', 24.5, 810, 60.35);
    n('hr.bend', 66.5, 812, 60.35);
    n('sluice.s', 66.5, 850, 60.35);
    n('sluice.n', 66.5, 876, 63.55);
    n('weir.head', 142.0, 888, 63.55);

    e('harb.w', 'harb.lw', 4.5, 'quay'); e('harb.e', 'harb.le', 4.5, 'quay');
    e('harb.lw', 'p0.app.w', 4.0, 'towpath'); e('harb.le', 'p0.app.e', 4.0, 'towpath');
    e('p0.app.w', 'l1.top.w', 3.6, 'lock_ramp'); e('p0.app.e', 'l1.top.e', 3.6, 'lock_ramp');
    e('l1.top.w', 'tr.br1.sw', 4.2, 'towpath'); e('l1.top.e', 'tr.br1.se', 4.2, 'towpath');
    e('tr.br1.sw', 'tr.br1.nw', 3.2, 'towpath'); e('tr.br1.se', 'tr.br1.ne', 3.2, 'towpath');
    e('tr.br1.sw', 'tr.br1.cw', 5.6, 'bridge_ramp'); e('tr.br1.nw', 'tr.br1.cw', 5.6, 'bridge_ramp');
    e('tr.br1.cw', 'tr.br1.ce', 6.4, 'bridge_deck');
    e('tr.br1.ce', 'tr.br1.se', 5.6, 'bridge_ramp'); e('tr.br1.ce', 'tr.br1.ne', 5.6, 'bridge_ramp');
    e('tr.br1.nw', 'tr.west.j', 4.2, 'towpath'); e('tr.west.j', 'tr.tb.sw', 4.2, 'towpath');
    e('tr.br1.ne', 'tr.tb.se', 4.2, 'towpath');
    e('tr.tb.sw', 'tb.w', 4.5, 'quay'); e('tb.w', 'tr.tb.nw', 4.5, 'quay');
    e('tr.tb.se', 'tb.e', 4.5, 'quay'); e('tb.e', 'tr.tb.ne', 4.5, 'quay');
    e('tr.tb.nw', 'tr.br2.sw', 4.2, 'towpath');
    e('tr.tb.ne', 'tr.east.j', 4.2, 'towpath'); e('tr.east.j', 'tr.br2.se', 4.2, 'towpath');
    e('tr.br2.sw', 'tr.br2.nw', 3.2, 'towpath'); e('tr.br2.se', 'tr.br2.ne', 3.2, 'towpath');
    e('tr.br2.sw', 'tr.br2.cw', 5.6, 'bridge_ramp'); e('tr.br2.nw', 'tr.br2.cw', 5.6, 'bridge_ramp');
    e('tr.br2.cw', 'tr.br2.ce', 6.4, 'bridge_deck');
    e('tr.br2.ce', 'tr.br2.se', 5.6, 'bridge_ramp'); e('tr.br2.ce', 'tr.br2.ne', 5.6, 'bridge_ramp');
    e('tr.br2.nw', 'l2.bot.w', 4.2, 'towpath'); e('tr.br2.ne', 'l2.bot.e', 4.2, 'towpath');

    e('tr.east.j', 'w4.arm.b1s', 3.0, 'towpath'); e('tr.east.j', 'w4.arm.b1n', 3.0, 'towpath');
    e('w4.arm.b1s', 'w4.arm.b1c', 3.2, 'bridge_ramp'); e('w4.arm.b1c', 'w4.arm.b1n', 3.2, 'bridge_ramp');
    e('w4.arm.b1s', 'w4.j.sw', 3.0, 'towpath'); e('w4.arm.b1n', 'w4.j.nw', 3.0, 'towpath');
    e('w4.j.ne', 'w4.end', 3.0, 'towpath');
    e('w4.leg.s', 'w4.b2.w', 3.0, 'towpath'); e('w4.b2.w', 'w4.j.sw', 3.0, 'towpath');
    e('w4.j.nw', 'w4.b3.w', 3.0, 'towpath'); e('w4.b3.w', 'w4.leg.n', 3.0, 'towpath');
    e('w4.b2.w', 'w4.b2.c', 3.2, 'bridge_ramp'); e('w4.b2.c', 'w4.b2.e', 3.2, 'bridge_ramp');
    e('w4.b2.e', 'w4.j.se', 3.0, 'towpath'); e('w4.j.se', 'w4.j.ne', 3.0, 'towpath');
    e('w4.j.ne', 'w4.b3.e', 3.0, 'towpath'); e('w4.b3.e', 'w4.b3.c', 3.2, 'bridge_ramp'); e('w4.b3.c', 'w4.b3.w', 3.2, 'bridge_ramp');

    e('tr.west.j', 'w5.arm.b1n', 3.0, 'towpath'); e('tr.west.j', 'w5.arm.b1s', 3.0, 'towpath');
    e('w5.arm.b1n', 'w5.arm.b1c', 3.2, 'bridge_ramp'); e('w5.arm.b1c', 'w5.arm.b1s', 3.2, 'bridge_ramp');
    e('w5.arm.b1n', 'w5.j.ne', 3.0, 'towpath'); e('w5.arm.b1s', 'w5.j.se', 3.0, 'towpath');
    e('w5.j.sw', 'w5.end', 3.0, 'towpath');
    e('w5.leg.s', 'w5.b2.e', 3.0, 'towpath'); e('w5.b2.e', 'w5.j.se', 3.0, 'towpath');
    e('w5.j.ne', 'w5.b3.e', 3.0, 'towpath'); e('w5.b3.e', 'w5.leg.n', 3.0, 'towpath');
    e('w5.b2.e', 'w5.b2.c', 3.2, 'bridge_ramp'); e('w5.b2.c', 'w5.b2.w', 3.2, 'bridge_ramp');
    e('w5.b2.w', 'w5.j.sw', 3.0, 'towpath'); e('w5.j.sw', 'w5.j.nw', 3.0, 'towpath');
    e('w5.j.nw', 'w5.b3.w', 3.0, 'towpath'); e('w5.b3.w', 'w5.b3.c', 3.2, 'bridge_ramp'); e('w5.b3.c', 'w5.b3.e', 3.2, 'bridge_ramp');

    e('l2.bot.w', 'l2.top.w', 3.4, 'lock_ramp'); e('l2.bot.e', 'l2.top.e', 3.4, 'lock_ramp');
    e('l2.top.w', 'aq.s.w', 3.0, 'towpath'); e('l2.top.e', 'aq.s.e', 3.0, 'towpath');
    e('aq.s.w', 'aq.n.w', 2.4, 'aqueduct_walk'); e('aq.s.e', 'aq.n.e', 2.4, 'aqueduct_walk');
    e('aq.n.w', 'sb.sw', 3.0, 'towpath'); e('aq.n.e', 'sb.se', 3.0, 'towpath');
    e('sb.sw', 'sb.nw', 3.2, 'quay'); e('sb.se', 'sb.ne', 3.2, 'quay');
    e('sb.nw', 'sb.ne', 3.2, 'quay');
    e('sb.ne', 'hr.bend', 3.0, 'towpath');
    e('hr.bend', 'sluice.s', 3.0, 'towpath');
    e('sluice.s', 'sluice.n', 3.0, 'lock_ramp');
    e('sluice.n', 'weir.head', 3.4, 'quay');

    return { nodes: nodes, edges: edges, startNode: 'weir.head', endNode: 'harb.w' };
  }

  function make(opt) {
    opt = opt || {};
    var seed = opt.seed == null ? 451782 : opt.seed;
    var getDims = function (k, v) {
      var d = opt.dims ? opt.dims(k, v) : null;
      return d || DEFAULT_DIMS[k] || { w: 12, d: 12, h: 8 };
    };

    var space = KSPACE.create({ cell: 24 });
    var keepZones = [];

    function reserveUsRect(u0, u1, s0, s1, tag) {
      var cu = 0.5 * (u0 + u1), cs = 0.5 * (s0 + s1);
      var p = G.at(cu, cs);
      var ob = makeObb(p[0], p[1], G.YAW_S, Math.abs(u1 - u0), Math.abs(s1 - s0), 0);
      ob.tag = tag;
      keepZones.push(ob);
    }

    /* Reserve all wet canal ROWs + towpaths, lock flights, harbour basin, rivers, and bridge approaches */
    reserveUsRect(-215, 215, -660, -424, 'harbour_water');
    reserveUsRect(-165, -110, -460, -408, 'drydock_cut');
    reserveUsRect(-14.5, 14.5, -430, -310, 'l1_corridor');
    reserveUsRect(-12.5, 12.5, -310, 348, 'p1_trunk_row');
    reserveUsRect(-14.5, 14.5, 348, 468, 'l2_corridor');
    reserveUsRect(-34.0, 34.0, -30, 30, 'turning_basin_row');
    reserveUsRect(5.5, 352.0, 100.5, 119.5, 'east_arm_row');
    reserveUsRect(230.5, 249.5, -96.0, 256.0, 'east_leg_row');
    reserveUsRect(-352.0, -5.5, -119.5, -100.5, 'west_arm_row');
    reserveUsRect(-229.5, -210.5, -266.0, 46.0, 'west_leg_row');
    reserveUsRect(-11.5, 11.5, 468, 722, 'p2_feeder_row');
    reserveUsRect(-29.5, 36.0, 715, 816, 'settling_basin_row');
    reserveUsRect(-6.0, 84.0, 804, 888, 'p2_headrace_row');
    reserveUsRect(62.0, 195.0, 862, 945, 'p3_weir_row');
    reserveUsRect(-420, 420, 646, 715, 'lok_ma_ravine');
    /* Bridge ramp approaches kept clear of building footprints */
    for (var bri = 0; bri < BRIDGES.length; bri++) {
      var br = BRIDGES[bri];
      if (br.acrossAxis === 'u') {
        reserveUsRect(br.u - br.rampHalfLen - 2, br.u + br.rampHalfLen + 2, br.s - br.width * 0.6 - 2, br.s + br.width * 0.6 + 2, 'bridge_' + br.id);
      } else {
        reserveUsRect(br.u - br.width * 0.6 - 2, br.u + br.width * 0.6 + 2, br.s - br.rampHalfLen - 2, br.s + br.rampHalfLen + 2, 'bridge_' + br.id);
      }
    }

    function zoneFree(ob) {
      for (var i = 0; i < keepZones.length; i++) {
        if (obbOverlap(ob, keepZones[i])) return false;
      }
      var u = G.uOf(ob.x, ob.z), s = G.sOf(ob.x, ob.z);
      if (u + ob.r > 325 && s > 480) return false;
      if (u + ob.r > 405) return false;
      return true;
    }

    function spaceFree(ob) {
      return !space.some(ob.x, ob.z, ob.r, function (other) {
        return obbOverlap(ob, other.obb);
      });
    }

    var wardOfUs = function (u, s) {
      if (s < -382) return 'W1';
      if ((s >= -382 && s < -280 && Math.abs(u) < 110) || (s > 365 && s < 465 && Math.abs(u) < 90)) return 'W2';
      if (s >= 436) return 'W6';
      if (Math.abs(u) < 85 && Math.abs(s) < 235) return 'W3';
      return u >= 0 ? 'W4' : 'W5';
    };

    var lots = [];
    function tryAddLot(spec) {
      var sv = spec.v == null ? 0 : spec.v;
      var D = getDims(spec.key, sv);
      var p = spec.xz ? spec.xz : G.at(spec.u, spec.s);
      var x = p[0], z = p[1];
      var u = G.uOf(x, z), s = G.sOf(x, z);
      var wlev = G.poundWaterAt(x, z);
      var gy = G.h(x, z);
      var padY = Math.max(gy, wlev + 1.45);
      var ob = makeObb(x, z, spec.ry, D.w, D.d, 0.55);
      if (!spec.ignoreZone && !zoneFree(ob)) return null;
      if (!spaceFree(ob)) return null;
      var c1 = G.h(x + ob.ux * D.w * 0.45, z + ob.uz * D.w * 0.45);
      var c2 = G.h(x - ob.ux * D.w * 0.45, z - ob.uz * D.w * 0.45);
      var c3 = G.h(x + ob.vx * D.d * 0.45, z + ob.vz * D.d * 0.45);
      var c4 = G.h(x - ob.vx * D.d * 0.45, z - ob.vz * D.d * 0.45);
      var minCorner = Math.min(gy, c1, c2, c3, c4);
      if (minCorner < wlev + 1.15) return null;
      padY = Math.max(padY, minCorner, wlev + 1.42);

      var wf = null;
      if (Math.abs(u) > 11 && Math.abs(u) < 34 && s > -335 && s < 375) {
        wf = { canalId: 'cway.p1.trunk', pound: 'P1', wlev: 52.47, quayY: 53.95, side: u > 0 ? 'east' : 'west' };
      } else if (u > 12 && u < 342 && Math.abs(s - 110) < 28) {
        wf = { canalId: 'cway.p1.east.arm', pound: 'P1', wlev: 52.47, quayY: 53.95, side: s > 110 ? 'north' : 'south' };
      } else if (Math.abs(u - 240) < 28 && s > -88 && s < 248) {
        wf = { canalId: 'cway.p1.east.leg', pound: 'P1', wlev: 52.47, quayY: 53.95, side: u > 240 ? 'east' : 'west' };
      } else if (u < -12 && u > -342 && Math.abs(s + 110) < 28) {
        wf = { canalId: 'cway.p1.west.arm', pound: 'P1', wlev: 52.47, quayY: 53.95, side: s > -110 ? 'north' : 'south' };
      } else if (Math.abs(u + 220) < 28 && s > -258 && s < 38) {
        wf = { canalId: 'cway.p1.west.leg', pound: 'P1', wlev: 52.47, quayY: 53.95, side: u > -220 ? 'east' : 'west' };
      }

      var rec = {
        id: spec.id,
        ward: spec.ward || wardOfUs(u, s),
        key: spec.key,
        v: sv | 0,
        cls: spec.cls || 'building',
        civic: !!spec.civic,
        x: +x.toFixed(3),
        z: +z.toFixed(3),
        u: +u.toFixed(2),
        s: +s.toFixed(2),
        padY: +padY.toFixed(3),
        wlev: wlev,
        freeboard: +(padY - wlev).toFixed(3),
        ry: spec.ry,
        w: D.w, d: D.d, h: D.h,
        people: PEOPLE[spec.key] == null ? 0 : PEOPLE[spec.key],
        waterFront: wf,
        obb: makeObb(x, z, spec.ry, D.w, D.d, 0.32)
      };
      space.insert(rec, rec.x, rec.z, rec.obb.r);
      lots.push(rec);
      return rec;
    }

    /* ==== STEP 1: Place All 6 Wards' Civic, Guild & Hydraulic Landmarks ==== */
    var LANDMARKS = [
      { id: 'ec.lm.customs_harb', ward: 'W1', key: 'et_customs_house', v: 0, u: -48, s: -406, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.harb_wh1', ward: 'W1', key: 'et_warehouse', v: 0, u: -86, s: -405, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.harb_wh2', ward: 'W1', key: 'et_warehouse', v: 1, u: 56, s: -405, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.harb_inn', ward: 'W1', key: 'et_inn', v: 0, u: 96, s: -404, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.harb_tea', ward: 'W1', key: 'et_tea_house', v: 0, u: 26, s: -408, ry: G.YAW_NS, civic: true },

      { id: 'ec.lm.clock_tower', ward: 'W2', key: 'et_clock', v: 0, u: 32, s: -366, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.intendancy', ward: 'W2', key: 'et_ministry', v: 0, u: 44, s: -314, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.lock_registry', ward: 'W2', key: 'et_registry', v: 0, u: -38, s: -320, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.cordon_barracks', ward: 'W2', key: 'et_barracks', v: 0, u: 92, s: -316, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.pump_station', ward: 'W2', key: 'et_tube_station', v: 0, u: -30, s: -358, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.ancestors', ward: 'W2', key: 'et_ancestor_gallery', v: 0, u: -82, s: -318, ry: G.YAW_S, civic: true },

      { id: 'ec.lm.granary.0', ward: 'W3', key: 'et_granary', v: 0, u: -48, s: -16, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.granary.1', ward: 'W3', key: 'et_granary', v: 1, u: -48, s: 16, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.granary.2', ward: 'W3', key: 'et_granary', v: 0, u: -26, s: 52, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.granary.3', ward: 'W3', key: 'et_granary', v: 1, u: -26, s: -52, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.salvage_vault', ward: 'W3', key: 'et_relic_hall', v: 0, u: 52, s: 0, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.salvage_wh.0', ward: 'W3', key: 'et_warehouse', v: 0, u: 52, s: 32, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.salvage_wh.1', ward: 'W3', key: 'et_warehouse', v: 1, u: 52, s: -32, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.exam_hall', ward: 'W3', key: 'et_examination_hall', v: 0, u: 96, s: 0, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.caravan_inn', ward: 'W3', key: 'et_inn', v: 1, u: 44, s: 242, ry: G.YAW_NS, civic: true },

      { id: 'ec.lm.kiln.0', ward: 'W4', key: 'et_kiln', v: 0, u: 85, s: 138, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.kiln.1', ward: 'W4', key: 'et_tile_works', v: 0, u: 168, s: 140, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.kiln.2', ward: 'W4', key: 'et_kiln', v: 1, u: 274, s: 72, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.porcelain.0', ward: 'W4', key: 'et_porcelain', v: 0, u: 168, s: 84, ry: G.YAW_S, civic: true },
      { id: 'ec.lm.porcelain.1', ward: 'W4', key: 'et_porcelain', v: 1, u: 272, s: 145, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.paper_mill.0', ward: 'W4', key: 'et_paper_mill', v: 0, u: 78, s: 84, ry: G.YAW_S, civic: true },
      { id: 'ec.lm.paper_mill.1', ward: 'W4', key: 'et_paper_mill', v: 1, u: 212, s: 65, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.printer', ward: 'W4', key: 'et_printer', v: 0, u: 212, s: -20, ry: G.YAW_U, civic: true },

      { id: 'ec.lm.market_hall', ward: 'W5', key: 'et_market_hall', v: 0, u: -82, s: -78, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.tea_canal.0', ward: 'W5', key: 'et_tea_house', v: 0, u: -158, s: -86, ry: G.YAW_NS, civic: true },
      { id: 'ec.lm.tea_canal.1', ward: 'W5', key: 'et_tea_house', v: 1, u: -196, s: -148, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.silk_guild', ward: 'W5', key: 'et_official_villa', v: 0, u: -158, s: -144, ry: G.YAW_S, civic: true },
      { id: 'ec.lm.historians', ward: 'W5', key: 'et_historians_house', v: 0, u: -78, s: -144, ry: G.YAW_S, civic: true },
      { id: 'ec.lm.healer', ward: 'W5', key: 'et_healer', v: 0, u: -252, s: -78, ry: G.YAW_U, civic: true },

      { id: 'ec.lm.upper_customs', ward: 'W6', key: 'et_customs_house', v: 0, u: -32, s: 458, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.upper_tube', ward: 'W6', key: 'et_tube_station', v: 0, u: 28, s: 452, ry: G.YAW_NU, civic: true },
      { id: 'ec.lm.weir_warden', ward: 'W6', key: 'et_registry', v: 0, u: 38, s: 838, ry: G.YAW_U, civic: true },
      { id: 'ec.lm.mason_yard', ward: 'W6', key: 'et_quarry', v: 0, u: -58, s: 765, ry: G.YAW_U, civic: true }
    ];
    for (var li = 0; li < LANDMARKS.length; li++) tryAddLot(LANDMARKS[li]);

    /* ==== STEP 2: Place Complete Canal-Quay Frontage Rows BEFORE KCITY Runs ====
       Lines BOTH sides of the Grand Trunk Canal, East Kiln Arm + Spur + Leg, West Market Arm + Spur + Leg,
       Harbour Waterfront, and Upper Feeder Bench! */
    var QUAY_ROWS = [
      /* W1 Harbour Waterfront Rows */
      { ward: 'W1', u0: -182, u1: -108, step: 14.5, s: -402, ry: G.YAW_NS, keys: ['et_canal_row', 'et_canal_house', 'et_shophouse', 'et_bakehouse'] },
      { ward: 'W1', u0: 118, u1: 184, step: 14.5, s: -402, ry: G.YAW_NS, keys: ['et_canal_row', 'et_reed_house', 'et_canal_house', 'et_butcher'] },
      /* W3 Trunk Quay Frontage Houses facing the Grand Trunk Canal (u = -20.5 and u = +20.5) */
      { ward: 'W3', s0: -298, s1: -206, step: 14.5, u: -20.5, ry: G.YAW_U, keys: ['et_canal_house', 'et_merchant_house', 'et_shophouse', 'et_canal_row', 'et_corner_turret'] },
      { ward: 'W3', s0: -298, s1: -206, step: 14.5, u: 20.5, ry: G.YAW_NU, keys: ['et_canal_house', 'et_shophouse', 'et_merchant_house', 'et_canal_row', 'et_tea_house'] },
      { ward: 'W3', s0: -166, s1: -68, step: 15.0, u: -20.5, ry: G.YAW_U, keys: ['et_canal_house', 'et_shophouse', 'et_merchant_house', 'et_court_house'] },
      { ward: 'W3', s0: -166, s1: -68, step: 15.0, u: 20.5, ry: G.YAW_NU, keys: ['et_merchant_house', 'et_canal_house', 'et_shophouse', 'et_court_house'] },
      { ward: 'W3', s0: 74, s1: 194, step: 15.0, u: -20.5, ry: G.YAW_U, keys: ['et_canal_house', 'et_merchant_house', 'et_canal_row', 'et_weaver', 'et_shophouse'] },
      { ward: 'W3', s0: 74, s1: 194, step: 15.0, u: 20.5, ry: G.YAW_NU, keys: ['et_canal_house', 'et_shophouse', 'et_canal_row', 'et_tea_house'] },
      { ward: 'W3', s0: 238, s1: 342, step: 15.0, u: -20.5, ry: G.YAW_U, keys: ['et_canal_row', 'et_canal_house', 'et_shophouse', 'et_bakehouse', 'et_court_house'] },
      { ward: 'W3', s0: 262, s1: 342, step: 15.0, u: 20.5, ry: G.YAW_NU, keys: ['et_canal_row', 'et_canal_house', 'et_brewhouse', 'et_smithy'] },
      /* W4 East Kiln Arm, Spur & Leg Waterfronts */
      { ward: 'W4', u0: 28, u1: 328, step: 15.5, s: 127.0, ry: G.YAW_NS, keys: ['et_canal_row', 'et_block_hut', 'et_canal_house', 'et_smithy', 'et_shophouse'] },
      { ward: 'W4', u0: 28, u1: 328, step: 15.5, s: 93.0, ry: G.YAW_S, keys: ['et_canal_row', 'et_canal_house', 'et_tannery', 'et_reed_house', 'et_porcelain'] },
      { ward: 'W4', s0: -84, s1: 242, step: 15.5, u: 223.0, ry: G.YAW_U, keys: ['et_canal_house', 'et_canal_row', 'et_porcelain', 'et_shophouse', 'et_weaver'] },
      { ward: 'W4', s0: -84, s1: 242, step: 15.5, u: 257.0, ry: G.YAW_NU, keys: ['et_canal_row', 'et_reed_house', 'et_block_hut', 'et_smithy', 'et_bakehouse'] },
      /* W5 West Market Arm, Spur & Leg Waterfronts */
      { ward: 'W5', u0: -328, u1: -28, step: 15.5, s: -127.0, ry: G.YAW_S, keys: ['et_canal_house', 'et_court_house', 'et_merchant_house', 'et_weaver', 'et_shophouse'] },
      { ward: 'W5', u0: -328, u1: -28, step: 15.5, s: -93.0, ry: G.YAW_NS, keys: ['et_canal_house', 'et_shophouse', 'et_canal_row', 'et_bakehouse', 'et_mask_house'] },
      { ward: 'W5', s0: -252, s1: 32, step: 15.5, u: -203.0, ry: G.YAW_NU, keys: ['et_canal_house', 'et_court_house', 'et_shophouse', 'et_tea_house', 'et_weaver'] },
      { ward: 'W5', s0: -252, s1: 32, step: 15.5, u: -237.0, ry: G.YAW_U, keys: ['et_canal_row', 'et_canal_house', 'et_hex_house', 'et_butcher', 'et_reed_house'] },
      /* W6 Upper Feeder & Settling Basin Waterfronts (P2 = +58.87 m, padY >= +60.35 m) */
      { ward: 'W6', s0: 482, s1: 636, step: 18.0, u: -22.0, ry: G.YAW_U, keys: ['et_canal_house', 'et_reed_house', 'et_hex_house', 'et_tea_house', 'et_block_hut'] },
      { ward: 'W6', s0: 482, s1: 636, step: 18.0, u: 22.0, ry: G.YAW_NU, keys: ['et_canal_row', 'et_hex_hut', 'et_canal_house', 'et_mushroom_cellar', 'et_reed_house'] },
      { ward: 'W6', s0: 730, s1: 800, step: 18.0, u: -36.0, ry: G.YAW_U, keys: ['et_granary', 'et_canal_house', 'et_reed_house', 'et_shophouse'] }
    ];

    var qSeq = 0;
    for (var rIdx = 0; rIdx < QUAY_ROWS.length; rIdx++) {
      var qr = QUAY_ROWS[rIdx];
      if (qr.u0 != null) {
        for (var qu = qr.u0, qi = 0; qu <= qr.u1; qu += qr.step, qi++) {
          var h1 = KRAND.hash(seed, 0x4101, rIdx, qi);
          tryAddLot({
            id: 'ec.quayrow.' + (qSeq++),
            ward: qr.ward,
            key: qr.keys[h1 % qr.keys.length],
            v: (h1 >>> 4) & 1,
            u: qu, s: qr.s, ry: qr.ry
          });
        }
      } else {
        for (var qs2 = qr.s0, qj = 0; qs2 <= qr.s1; qs2 += qr.step, qj++) {
          var h2 = KRAND.hash(seed, 0x4102, rIdx, qj);
          tryAddLot({
            id: 'ec.quayrow.' + (qSeq++),
            ward: qr.ward,
            key: qr.keys[h2 % qr.keys.length],
            v: (h2 >>> 4) & 1,
            u: qr.u, s: qs2, ry: qr.ry
          });
        }
      }
    }

    /* ==== STEP 3: Run KCITY.create Across the Entire Middle Burgh (W2, W3, W4, W5) ====
       Note:
         1) kit.dims returns { key: k, v: v | 0, ... } so every KCITY lot gets its exact building key!
         2) Every initial street way is split bank-to-bank stopping cleanly behind canal curbs (zero canal crossings!).
         3) groundOk validates zoneFree + spaceFree + freeboard inside SL.tryLot so KCITY automatically falls back to
            smaller Eternian dwellings whenever a larger villa would touch a landmark or canal row! */
    var L = KCITY.lib || globalThis, SL = L.SL, OCC = L.OCC, Raster = L.Raster;
    var cityZone = [G.at(-332, -322), G.at(332, -322), G.at(332, 345), G.at(-332, 345)];
    var cityTune = {
      cell: 2.5, rasterHalf: 760, maxSlope: 0.22, exact: true,
      width: { avenue: 9.5, main: 7.0, side: 5.5, alley: 3.8, highway: 8.5, lane: 4.5 },
      lot: { side: 1.1, setback: 1.2, rear: 2.0, inset: 0.8, step: 3.0 },
      classes: {
        manor: [['et_official_villa', 0], ['et_hex_villa', 0]],
        rich: [['et_merchant_house', 0], ['et_court_house', 0], ['et_corner_turret', 0]],
        middle: [['et_canal_house', 0], ['et_canal_house', 1], ['et_court_house', 0], ['et_hex_house', 0], ['et_canal_row', 0]],
        poor: [['et_canal_row', 0], ['et_reed_house', 0], ['et_block_hut', 0], ['et_hex_hut', 0]],
        shop: [['et_shophouse', 0], ['et_shophouse', 1], ['et_bakehouse', 0], ['et_weaver', 0], ['et_tea_house', 0]],
        tavern: [['et_tea_house', 0], ['et_inn', 0], ['et_brewhouse', 0]],
        industrial: [['et_smithy', 0], ['et_porcelain', 0], ['et_paper_mill', 0], ['et_tannery', 0], ['et_butcher', 0]]
      },
      fallback: { manor: 'rich', rich: 'middle', middle: 'poor', shop: 'middle', tavern: 'shop', industrial: 'poor', poor: null },
      civic: [
        { key: 'et_warehouse', v: 0, near: 'basin' },
        { key: 'et_shophouse', v: 0, near: 'market' },
        { key: 'et_weaver', v: 1, near: 'market' },
        { key: 'et_bakehouse', v: 1, near: 'market' },
        { key: 'et_smithy', v: 1, near: 'kiln' },
        { key: 'et_brewhouse', v: 0, near: 'harbour' }
      ],
      civicSpacing: 32, civicJitter: 10,
      voidMax: 44, voidIters: 10, voidBatch: 8, sideSpacing: 44, sideMax: 165,
      alleyFrac: 0.14, blindMax: 68, interiorDepth: 11, interiorRounds: 2,
      avenueSnap: 36, ringGap: 8, verge: 5, mapHalf: 760,
      plazaArt: { rich: [], middle: [], poor: [], commerce: [] }
    };

    var citySteps = [
      {
        name: 'the site and canal reservations',
        run: function () {
          var R = SL.R = new Raster(L.tune().rasterHalf, L.tune().cell);
          R.occ.fill(OCC.OUT);
          var P = L.plan();
          P.site = [{ id: 0, name: 'Shuang-Zha Middle Burgh', role: 'zone', poly: cityZone }];
          P.zone = cityZone;
          KCITY.site.zoneRaster(R, cityZone, { dry: 1.0, maxSlope: 0.24, h: function (x, z) { return G.h(x, z) - G.poundWaterAt(x, z); } });
          SL.minSpacing = KCITY.site.minSpacing();
          /* Stamp every canal ROW + bridge approach HARD on KCITY raster so zero streets ever route across water! */
          for (var zIdx = 0; zIdx < keepZones.length; zIdx++) {
            var kz = keepZones[zIdx];
            var corners = K.obbCorners(K.makeObb(kz.x, kz.z, G.YAW_S, kz.hw * 2 + 3.0, kz.hd * 2 + 3.0, 0));
            R.stampPoly(corners, OCC.HARD, -1);
          }
          /* Stamp pre-placed Landmarks & Waterfront Quay Rows as LOT/HARD on KCITY raster */
          for (var lIdx = 0; lIdx < lots.length; lIdx++) {
            var lt = lots[lIdx], ob = lt.obb;
            var lc = K.obbCorners(K.makeObb(ob.x, ob.z, lt.ry, ob.hw * 2 + 1.6, ob.hd * 2 + 1.6, 0));
            R.stampPoly(lc, OCC.HARD, lIdx);
          }
        }
      },
      { name: 'landmarks', run: function () { SL.note(1, lots.length + ' landmarks & quay rows reserved'); } },
      { name: 'districts', run: function () { SL.note(2, '6 canal wards by u/s'); } },
      {
        name: 'avenues',
        run: function () {
          /* Every initial avenue/street stops cleanly at canal towpath/bridge ramp toes — NEVER crossing water! */
          var addUsWay = function (cls, ptsUs, tag) {
            SL.addWay(cls, ptsUs.map(function (q) { return G.at(q[0], q[1]); }), 3, { tag: tag });
          };
          /* Lower Bridge Avenue (s = -185: split cleanly around West Leg bridge u=-220 and Trunk South bridge u=0) */
          addUsWay('avenue', [[-322, -185], [-233, -185]], 'Lower Bridge Ave West');
          addUsWay('avenue', [[-207, -185], [-16, -185]], 'Lower Bridge Ave Mid-West');
          addUsWay('avenue', [[16, -185], [322, -185]], 'Lower Bridge Ave East');

          /* Veil Salvage Avenue (s = +215: split cleanly around Trunk North bridge u=0 and East Leg bridge u=240) */
          addUsWay('avenue', [[-322, 215], [-16, 215]], 'Veil Salvage Ave West');
          addUsWay('avenue', [[16, 215], [227, 215]], 'Veil Salvage Ave Mid-East');
          addUsWay('avenue', [[253, 215], [322, 215]], 'Veil Salvage Ave Outer-East');

          /* West Guild Street (u = -120: split cleanly at West Arm bridge s=-110) */
          addUsWay('main', [[-120, -310], [-120, -123]], 'West Guild St South');
          addUsWay('main', [[-120, -97], [-120, 332]], 'West Guild St North');

          /* East Kiln Street (u = +120: split cleanly at East Arm bridge s=+110) */
          addUsWay('main', [[120, -310], [120, 97]], 'East Kiln St South');
          addUsWay('main', [[120, 123], [120, 332]], 'East Kiln St North');

          /* Outer West Street (u = -285: terminates cleanly at West Spur towpath T-junctions!) */
          addUsWay('main', [[-285, -305], [-285, -124]], 'Outer West St South');
          addUsWay('main', [[-285, -96], [-285, 315]], 'Outer West St North');

          /* Outer East Street (u = +295: terminates cleanly at East Spur towpath T-junctions!) */
          addUsWay('main', [[295, -280], [295, 96]], 'Outer East St South');
          addUsWay('main', [[295, 124], [295, 315]], 'Outer East St North');

          /* West Basin Street (s = -25: split cleanly at West Leg bridge u=-220) */
          addUsWay('main', [[-318, -25], [-233, -25]], 'West Basin St Outer');
          addUsWay('main', [[-207, -25], [-42, -25]], 'West Basin St Inner');

          /* East Basin Street (s = +15: split cleanly at East Leg bridge u=240) */
          addUsWay('main', [[76, 15], [227, 15]], 'East Basin St Inner');
          addUsWay('main', [[253, 15], [322, 15]], 'East Basin St Outer');

          /* North-West & North-East Cross Streets so upper quadrants have crisp rectilinear block structure */
          addUsWay('main', [[-318, 110], [-36, 110]], 'North-West Cross St');
          addUsWay('main', [[36, -110], [222, -110]], 'South-East Cross St');
        }
      },
      { name: 'highways', run: function () { SL.note(4, 'Veil Cordon Highway leaves SE'); } },
      { name: 'walls', run: function () { SL.note(5, 'canals & polders frame the burgh'); } }
    ].concat(KCITY.defaultSteps().slice(6));

    var cityRules = {
      wealth: function (p) {
        var u = G.uOf(p[0], p[1]), s = G.sOf(p[0], p[1]);
        if (Math.abs(u) < 95 && Math.abs(s) < 160) return 0.78;
        if (u < -40 && s < 80) return 0.62;
        if (u > 140) return 0.34;
        return 0.50;
      },
      vacant: function () { return false; },
      groundOk: function (bo) {
        var x = bo.c[0], z = bo.c[1];
        var ry = Math.atan2(bo.v[0], bo.v[1]);
        var w = bo.hw * 2, d = bo.hd * 2;
        var testOb = makeObb(x, z, ry, w, d, 0.35);
        if (!zoneFree(testOb)) return false;
        if (!spaceFree(testOb)) return false;
        var wlev = G.poundWaterAt(x, z);
        if (G.h(x, z) < wlev + 1.18) return false;
        return true;
      },
      near: {
        basin: function (c) { return Math.hypot(G.uOf(c.p[0], c.p[1]), G.sOf(c.p[0], c.p[1])); },
        market: function (c) { return Math.hypot(G.uOf(c.p[0], c.p[1]) + 110, G.sOf(c.p[0], c.p[1]) + 110); },
        kiln: function (c) { return Math.hypot(G.uOf(c.p[0], c.p[1]) - 180, G.sOf(c.p[0], c.p[1]) - 110); },
        harbour: function (c) { return Math.hypot(G.uOf(c.p[0], c.p[1]), G.sOf(c.p[0], c.p[1]) + 320); }
      }
    };

    var cityInst = KCITY.create({
      name: 'eternian-canal',
      tune: cityTune,
      seed: seed,
      rand: 'krand',
      index: { order: 'insertion' },
      ground: { h: G.h },
      kit: {
        dims: function (k, v) {
          var d = getDims(k, v);
          return { key: k, v: v | 0, w: d.w + 1.0, d: d.d + 1.0, h: d.h, fw: d.w, fd: d.d };
        }
      },
      rules: cityRules,
      steps: citySteps
    });
    cityInst.run();

    var kLots = cityInst.plan.lots;
    for (var ki = 0; ki < kLots.length; ki++) {
      var kl = kLots[ki];
      if (kl.died != null || !kl.key) continue;
      var lu = G.uOf(kl.x, kl.z), ls = G.sOf(kl.x, kl.z);
      tryAddLot({
        id: 'ec.city.' + ki,
        ward: wardOfUs(lu, ls),
        key: kl.key,
        v: kl.v | 0,
        cls: 'building',
        civic: !!kl.civic,
        xz: [kl.x, kl.z],
        ry: kl.ry
      });
    }

    /* Collect KCITY ways + W1 Harbour Boulevard & W6 Upper Feeder Street, then clip strictly against H.NET! */
    var rawWays = cityInst.plan.ways.filter(function (w) { return w.died == null; }).map(function (w) {
      return { id: 'ec.way.' + w.id, cls: w.cls, w: w.w, tag: w.tag || null, pts: w.pts.map(function (p) { return [p[0], p[1]]; }) };
    });
    rawWays.push({ id: 'ec.way.w1.west', cls: 'main', w: 6.5, tag: 'Harbour West St', pts: [G.at(-188, -388), G.at(-22, -388)] });
    rawWays.push({ id: 'ec.way.w1.east', cls: 'main', w: 6.5, tag: 'Harbour East St', pts: [G.at(22, -388), G.at(188, -388)] });
    rawWays.push({ id: 'ec.way.w6.west', cls: 'side', w: 5.5, tag: 'Upper Feeder West Lane', pts: [G.at(-42, 470), G.at(-42, 635)] });
    rawWays.push({ id: 'ec.way.w6.east', cls: 'side', w: 5.5, tag: 'Upper Feeder East Lane', pts: [G.at(42, 470), G.at(42, 635)] });

    var ways = K.clipStreetWays(rawWays, H.NET, { curbMargin: 2.6, minLen: 8.0 });

    /* Reserve clipped street carriageways in a road-OBB list so our street-frontage completion pass never steps onto a street! */
    var roadSpace = KSPACE.create({ cell: 20 });
    for (var rwi = 0; rwi < ways.length; rwi++) {
      var rw = ways[rwi];
      var rhw = (rw.w == null ? 6.0 : rw.w) * 0.5 + 0.6;
      for (var rk = 0; rk + 1 < rw.pts.length; rk++) {
        var ra = rw.pts[rk], rb = rw.pts[rk + 1];
        var rmx = 0.5 * (ra[0] + rb[0]), rmz = 0.5 * (ra[1] + rb[1]);
        var rlen = Math.hypot(rb[0] - ra[0], rb[1] - ra[1]);
        if (rlen < 0.5) continue;
        var rry = K.vesselYaw(rb[0] - ra[0], rb[1] - ra[1]);
        var robb = makeObb(rmx, rmz, rry, rlen, rhw * 2, 0);
        roadSpace.insert(robb, rmx, rmz, robb.r);
      }
    }
    function clearOfStreets(ob) {
      return !roadSpace.some(ob.x, ob.z, ob.r, function (ro) { return obbOverlap(ob, ro); });
    }

    /* ==== STEP 4: Deterministic Street-Frontage Completion Pass Across ALL Clipped Ways ====
       Guarantees every street across W1, W2, W3, W4, W5, and W6 (including NW & NE blocks) has dense Eternian
       buildings lining both street sides with zero bare empty road grids! */
    var fillSeq = 0;
    for (var fwi = 0; fwi < ways.length; fwi++) {
      var fw = ways[fwi];
      var fwHalf = (fw.w == null ? 6.0 : fw.w) * 0.5;
      for (var fk = 0; fk + 1 < fw.pts.length; fk++) {
        var pA = fw.pts[fk], pB = fw.pts[fk + 1];
        var segDx = pB[0] - pA[0], segDz = pB[1] - pA[1];
        var segLen = Math.hypot(segDx, segDz);
        if (segLen < 11.0) continue;
        var tx = segDx / segLen, tz = segDz / segLen;
        /* Left/right outward normals */
        var sides = [-1, 1];
        for (var fsi = 0; fsi < 2; fsi++) {
          var sgn = sides[fsi];
          var nx = -tz * sgn, nz = tx * sgn;
          var faceRy = Math.atan2(-nx, -nz);
          for (var distS = 6.5, slotIdx = 0; distS <= segLen - 6.5; distS += 10.5, slotIdx++) {
            var sx = pA[0] + tx * distS, sz = pA[1] + tz * distS;
            var su = G.uOf(sx, sz), ss = G.sOf(sx, sz);
            var hPick = KRAND.hash(seed, 0x6711, fwi, fk * 64 + slotIdx * 2 + (sgn > 0 ? 1 : 0));
            var pool = ss < -380
              ? ['et_canal_house', 'et_shophouse', 'et_canal_row', 'et_reed_house']
              : (ss > 436
                ? ['et_canal_house', 'et_hex_house', 'et_reed_house', 'et_tea_house', 'et_block_hut']
                : (su > 130
                  ? ['et_canal_house', 'et_canal_row', 'et_shophouse', 'et_porcelain', 'et_reed_house', 'et_block_hut']
                  : (su < -130
                    ? ['et_court_house', 'et_canal_house', 'et_merchant_house', 'et_shophouse', 'et_hex_house']
                    : ['et_merchant_house', 'et_canal_house', 'et_shophouse', 'et_court_house', 'et_canal_row'])));
            /* Try primary choice, then compact fallback so narrow gaps still populate cleanly */
            var tryKeys = [pool[hPick % pool.length], 'et_shophouse', 'et_block_hut'];
            for (var tk = 0; tk < tryKeys.length; tk++) {
              var candKey = tryKeys[tk];
              var cd = getDims(candKey, 0);
              var setback = fwHalf + 1.35 + cd.d * 0.5;
              var bx = sx + nx * setback, bz = sz + nz * setback;
              var checkOb = makeObb(bx, bz, faceRy, cd.w, cd.d, 0.35);
              if (!clearOfStreets(checkOb)) continue;
              var placed = tryAddLot({
                id: 'ec.frontfill.' + (fillSeq++),
                ward: wardOfUs(G.uOf(bx, bz), G.sOf(bx, bz)),
                key: candKey,
                v: (hPick >>> 5) & 1,
                xz: [bx, bz],
                ry: faceRy
              });
              if (placed) break;
            }
          }
        }
      }
    }

    /* ==== STEP 5: Hydraulic & Harbour Infrastructure Records ==== */
    var infra = [];
    function putInfra(id, key, v, u, s, y, ry, extra) {
      var D = getDims(key, v);
      var p = G.at(u, s);
      var rec = Object.assign({
        id: 'ec.infra.' + id, key: key, v: v | 0,
        x: +p[0].toFixed(3), z: +p[1].toFixed(3), y: +y.toFixed(3),
        u: u, s: s, ry: ry, w: D.w, d: D.d, h: D.h
      }, extra || {});
      infra.push(rec);
      return rec;
    }

    /* Transit-kit hydraulic structures (drawn via KCANAL.draw in 90z-ec-world.js) */
    putInfra('intake_weir', 'tr_intake_weir', 0, 156.0, 906.0, 58.20, G.YAW_NS, { pound: 'P3', transitKind: 'weir' });
    putInfra('sluice_gate', 'tr_sluice_gate', 0, 72.5, 868.0, 58.87, G.YAW_NS, { pound: 'P3', transitKind: 'sluiceGate' });
    putInfra('lok_ma_aqueduct', 'tr_culvert_aqueduct', 0, 0.0, 680.0, 49.20, G.YAW_S, { pound: 'P2', transitKind: 'aqueduct', len: 48.0, arches: 3, waterW: 8.3 });
    putInfra('waste_spillway', 'et_spillway', 0, 32.0, 765.0, 40.35, G.YAW_U, { pound: 'P2' });

    putInfra('lock.L1.low', 'tr_miter_lock', 0, 0.0, -382.0, 45.87, G.YAW_S, { flight: 'L1', riser: 0, lift: 3.30, transitKind: 'lockRiser' });
    putInfra('lock.L1.high', 'tr_miter_lock', 1, 0.0, -354.0, 49.17, G.YAW_S, { flight: 'L1', riser: 1, lift: 3.30, transitKind: 'lockRiser' });
    putInfra('lock.L2.low', 'tr_miter_lock', 0, 0.0, 394.0, 52.47, G.YAW_S, { flight: 'L2', riser: 0, lift: 3.20, transitKind: 'lockRiser' });
    putInfra('lock.L2.high', 'tr_miter_lock', 1, 0.0, 422.0, 55.67, G.YAW_S, { flight: 'L2', riser: 1, lift: 3.20, transitKind: 'lockRiser' });

    for (var bIdx = 0; bIdx < BRIDGES.length; bIdx++) {
      var B = BRIDGES[bIdx];
      var bKey = B.key === 'et_cart_bridge' ? 'tr_cart_bridge' : 'et_bridge';
      putInfra(B.id, bKey, 0, B.u, B.s, B.baseY, B.yaw, { bridge: B, transitKind: B.key === 'et_cart_bridge' ? 'bridge' : null });
    }

    /* Dressed Ashlar Canal Quay Walls along P0 approach, P1 forebays + Trunk + Turning Basin + Laterals, and P2 */
    putInfra('quay.p0.e', 'tr_canal_quay', 0, 10.1, -413, 45.87, G.YAW_NU, { pound: 'P0', transitKind: 'quay', len: 32.0 });
    putInfra('quay.p0.w', 'tr_canal_quay', 0, -10.1, -413, 45.87, G.YAW_U, { pound: 'P0', transitKind: 'quay', len: 32.0 });
    putInfra('quay.f1.e', 'tr_canal_quay', 0, 10.0, -325, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay', len: 28.0 });
    putInfra('quay.f1.w', 'tr_canal_quay', 0, -10.0, -325, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay', len: 28.0 });
    putInfra('quay.f2.e', 'tr_canal_quay', 0, 10.0, 364, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay', len: 28.0 });
    putInfra('quay.f2.w', 'tr_canal_quay', 0, -10.0, 364, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay', len: 28.0 });

    for (var qs = -298; qs <= 338; qs += 24) {
      if (Math.abs(qs) < 32) continue;
      if (Math.abs(qs - 110) > 10) putInfra('quay.te.' + qs, 'tr_canal_quay', 0, 7.1, qs, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay' });
      if (Math.abs(qs + 110) > 10) putInfra('quay.tw.' + qs, 'tr_canal_quay', 0, -7.1, qs, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay' });
    }
    putInfra('quay.tb.w0', 'tr_canal_quay', 1, -29.6, -12, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay' });
    putInfra('quay.tb.w1', 'tr_canal_quay', 1, -29.6, 12, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay' });
    putInfra('quay.tb.e0', 'tr_canal_quay', 1, 29.6, -12, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay' });
    putInfra('quay.tb.e1', 'tr_canal_quay', 1, 29.6, 12, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay' });
    putInfra('crane.tb.w0', 'tr_cargo_crane', 0, -30.5, -11, 53.95, G.YAW_U, { pound: 'P1', transitKind: 'crane' });
    putInfra('crane.tb.w1', 'tr_cargo_crane', 0, -30.5, 12, 53.95, G.YAW_U, { pound: 'P1', transitKind: 'crane' });
    putInfra('crane.tb.e0', 'tr_cargo_crane', 0, 30.5, -11, 53.95, G.YAW_NU, { pound: 'P1', transitKind: 'crane' });
    putInfra('crane.tb.e1', 'tr_cargo_crane', 0, 30.5, 12, 53.95, G.YAW_NU, { pound: 'P1', transitKind: 'crane' });

    for (var eu = 22; eu <= 334; eu += 24) {
      if (Math.abs(eu - 240) < 12) continue;
      putInfra('quay.ea.n.' + eu, 'tr_canal_quay', 0, eu, 115.4, 52.47, G.YAW_NS, { pound: 'P1', transitKind: 'quay' });
      putInfra('quay.ea.s.' + eu, 'tr_canal_quay', 0, eu, 104.6, 52.47, G.YAW_S, { pound: 'P1', transitKind: 'quay' });
    }
    for (var es = -78; es <= 238; es += 24) {
      if (Math.abs(es - 110) < 12) continue;
      putInfra('quay.el.w.' + es, 'tr_canal_quay', 0, 234.6, es, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay' });
      putInfra('quay.el.e.' + es, 'tr_canal_quay', 0, 245.4, es, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay' });
    }
    for (var wu = -334; wu <= -22; wu += 24) {
      if (Math.abs(wu + 220) < 12) continue;
      putInfra('quay.wa.n.' + wu, 'tr_canal_quay', 0, wu, -104.6, 52.47, G.YAW_NS, { pound: 'P1', transitKind: 'quay' });
      putInfra('quay.wa.s.' + wu, 'tr_canal_quay', 0, wu, -115.4, 52.47, G.YAW_S, { pound: 'P1', transitKind: 'quay' });
    }
    for (var ws = -248; ws <= 28; ws += 24) {
      if (Math.abs(ws + 110) < 12) continue;
      putInfra('quay.wl.w.' + ws, 'tr_canal_quay', 0, -225.4, ws, 52.47, G.YAW_U, { pound: 'P1', transitKind: 'quay' });
      putInfra('quay.wl.e.' + ws, 'tr_canal_quay', 0, -214.6, ws, 52.47, G.YAW_NU, { pound: 'P1', transitKind: 'quay' });
    }
    putInfra('quay.p2f.e', 'tr_canal_quay', 0, 10.0, 452, 58.87, G.YAW_NU, { pound: 'P2', transitKind: 'quay', len: 30.0 });
    putInfra('quay.p2f.w', 'tr_canal_quay', 0, -10.0, 452, 58.87, G.YAW_U, { pound: 'P2', transitKind: 'quay', len: 30.0 });
    for (var ps = 480; ps <= 644; ps += 24) {
      putInfra('quay.p2.e.' + ps, 'tr_canal_quay', 0, 6.3, ps, 58.87, G.YAW_NU, { pound: 'P2', transitKind: 'quay' });
      putInfra('quay.p2.w.' + ps, 'tr_canal_quay', 0, -6.3, ps, 58.87, G.YAW_U, { pound: 'P2', transitKind: 'quay' });
    }

    var hu;
    for (hu = -176; hu <= -28; hu += 32) putInfra('harb.quay.w.' + hu, 'et_quay', 0, hu, -424, 46.25, G.YAW_NS, { pound: 'P0' });
    for (hu = 28; hu <= 176; hu += 32) putInfra('harb.quay.e.' + hu, 'et_quay', 0, hu, -424, 46.25, G.YAW_NS, { pound: 'P0' });
    putInfra('harb.drydock', 'et_dock', 0, -135, -432, 45.87, G.YAW_NS, { pound: 'P0' });
    putInfra('harb.ferry', 'et_ferry_landing', 0, 122, -432, 45.87, G.YAW_NS, { pound: 'P0' });
    putInfra('harb.fish', 'et_fish_landing', 0, 158, -432, 45.87, G.YAW_NS, { pound: 'P0' });
    for (var ms = -600; ms <= -450; ms += 30) {
      putInfra('mole.w.' + ms, 'et_reservoir_wall', 0, -196, ms, 45.40, G.YAW_U, { pound: 'P0' });
      putInfra('mole.e.' + ms, 'et_reservoir_wall', 0, 196, ms, 45.40, G.YAW_NU, { pound: 'P0' });
    }
    for (var mu = -180; mu <= -68; mu += 30) putInfra('mole.wn.' + mu, 'et_reservoir_wall', 0, mu, -617, 45.40, G.YAW_S, { pound: 'P0' });
    for (var meu = 68; meu <= 180; meu += 30) putInfra('mole.en.' + meu, 'et_reservoir_wall', 0, meu, -617, 45.40, G.YAW_S, { pound: 'P0' });
    putInfra('harb.beacon', 'et_lighthouse', 0, -56, -617, 46.15, G.YAW_NS, { pound: 'P0' });

    for (var pu = 40; pu <= 100; pu += 12) {
      putInfra('pipe.e.' + pu, 'et_tube_pipe', 0, pu, 99.0, 53.95, G.YAW_U, { pound: 'P1' });
    }

    /* ==== STEP 6: Satellite Hamlets & CROPS.at Plots ==== */
    var eRow = eternianHamletRow();
    var okGround = function (x, z) {
      var y = G.h(x, z), w = G.poundWaterAt(x, z);
      if (y < w + 1.50) return false;
      var gx = (G.h(x + 5, z) - G.h(x - 5, z)) / 10, gz = (G.h(x, z + 5) - G.h(x, z - 5)) / 10;
      return gx * gx + gz * gz < 0.22 * 0.22;
    };
    var HAMLET_SPECS = [
      { id: 'ec.hamlet.paddy_weir', name: 'Paddy-Weir', u: -540, s: -245, focus: 'farming', people: 380 },
      { id: 'ec.hamlet.kaolin_pit', name: 'Kaolin-Pit', u: 645, s: 720, focus: 'clay', people: 240 }
    ];
    var hamlets = [];
    for (var hi = 0; hi < HAMLET_SPECS.length; hi++) {
      var hs = HAMLET_SPECS[hi];
      var hp = G.at(hs.u, hs.s);
      var hv = KHAMLET.village({
        id: hs.id,
        world: seed + hi * 97,
        culture: eRow,
        focus: hs.focus,
        site: { x: hp[0], z: hp[1] },
        link: { x: 0, z: 0 },
        popMax: Math.min(hs.people, KHAMLET.POP_MAX),
        dims: getDims,
        ground: { ok: okGround }
      });
      var cleanRecs = [];
      var hRecs = hv.records || [];
      for (var rj = 0; rj < hRecs.length; rj++) {
        var hr = hRecs[rj];
        var hrv = hr.v == null ? 0 : hr.v;
        var hrRy = hr.ry == null ? 0 : hr.ry;
        var hd = getDims(hr.key, hrv);
        var hy = Math.max(G.h(hr.x, hr.z), G.poundWaterAt(hr.x, hr.z) + 1.45);
        var hob = makeObb(hr.x, hr.z, hrRy, hd.w, hd.d, 0.5);
        if (spaceFree(hob)) {
          var hItem = Object.assign({}, hr, { y: +hy.toFixed(3), w: hd.w, d: hd.d, h: hd.h, obb: hob });
          space.insert(hItem, hItem.x, hItem.z, hob.r);
          cleanRecs.push(hItem);
        }
      }
      hamlets.push({
        id: hs.id, name: hs.name, focus: hs.focus, people: hs.people,
        site: { x: hp[0], z: hp[1] }, records: cleanRecs, census: hv.census
      });
    }

    var cropPalette = typeof CROPS !== 'undefined' && CROPS && CROPS.at
      ? CROPS.at({ warmth: 3, atm: 1, arid: 3, wet: true }).map(function (c) { return c.id || c.key || c.name; })
      : ['rice', 'tea', 'mulberry', 'bamboo'];
    var cropPlots = [];
    var PADDY_GRID = [
      [-650, -340], [-616, -340], [-582, -340], [-650, -310], [-616, -310],
      [-450, -330], [-416, -330], [-450, -300], [-416, -300]
    ];
    for (var cpi = 0; cpi < PADDY_GRID.length; cpi++) {
      var pp = G.at(PADDY_GRID[cpi][0], PADDY_GRID[cpi][1]);
      var pd = getDims('et_paddy', 0);
      var pob = makeObb(pp[0], pp[1], G.YAW_S, pd.w, pd.d, 0.5);
      if (spaceFree(pob)) {
        var cRec = { id: 'ec.crop.paddy.' + cpi, key: 'et_paddy', crop: 'rice', x: +pp[0].toFixed(2), z: +pp[1].toFixed(2), y: +Math.max(G.h(pp[0], pp[1]), 47.40).toFixed(2), ry: G.YAW_S, obb: pob };
        space.insert(cRec, cRec.x, cRec.z, pob.r);
        cropPlots.push(cRec);
      }
    }
    var TEA_GRID = [[-95, 520], [-95, 554], [-95, 588], [95, 520], [95, 554]];
    for (var ti = 0; ti < TEA_GRID.length; ti++) {
      var tp = G.at(TEA_GRID[ti][0], TEA_GRID[ti][1]);
      var td = getDims('et_tea_garden', 0);
      var tob = makeObb(tp[0], tp[1], G.YAW_S, td.w, td.d, 0.5);
      if (spaceFree(tob)) {
        var tRec = { id: 'ec.crop.tea.' + ti, key: 'et_tea_garden', crop: 'tea', x: +tp[0].toFixed(2), z: +tp[1].toFixed(2), y: +G.h(tp[0], tp[1]).toFixed(2), ry: G.YAW_S, obb: tob };
        space.insert(tRec, tRec.x, tRec.z, tob.r);
        cropPlots.push(tRec);
      }
    }

    var towpathGraph = buildTowpathGraph();
    var roadMask = K.buildRoadMask(ways, towpathGraph, H.NET, { size: 768, halfExtent: 980 });

    /* Measure Street Frontage Coverage & Quadrant Balance */
    var frontageSamples = 0, frontagePopulated = 0, unpopulatedWays = 0;
    for (var swi = 0; swi < ways.length; swi++) {
      var sw = ways[swi];
      var wayHits = 0, wayTests = 0;
      for (var sk = 0; sk + 1 < sw.pts.length; sk++) {
        var q0 = sw.pts[sk], q1 = sw.pts[sk + 1];
        var ql = Math.hypot(q1[0] - q0[0], q1[1] - q0[1]);
        var nq = Math.max(1, Math.floor(ql / 12.0));
        for (var qi2 = 0; qi2 <= nq; qi2++) {
          var qf = qi2 / nq;
          var qx = K.lerp(q0[0], q1[0], qf), qz = K.lerp(q0[1], q1[1], qf);
          wayTests++;
          frontageSamples++;
          if (space.some(qx, qz, 26.0, function (lt) { return lt.cls === 'building'; })) {
            wayHits++;
            frontagePopulated++;
          }
        }
      }
      if (wayTests >= 3 && wayHits === 0) unpopulatedWays++;
    }
    var frontageFill = frontageSamples > 0 ? +(frontagePopulated / frontageSamples).toFixed(4) : 1.0;

    var wardPop = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0, W6: 0 };
    var wardLots = { W1: 0, W2: 0, W3: 0, W4: 0, W5: 0, W6: 0 };
    var quadrantLots = { SW: 0, SE: 0, NW: 0, NE: 0 };
    var totalPop = 0, waterFrontCount = 0;
    for (var wi = 0; wi < lots.length; wi++) {
      var ltItem = lots[wi];
      var wk = ltItem.ward;
      wardPop[wk] = (wardPop[wk] == null ? 0 : wardPop[wk]) + ltItem.people;
      wardLots[wk] = (wardLots[wk] == null ? 0 : wardLots[wk]) + 1;
      var qk = (ltItem.s >= 0 ? 'N' : 'S') + (ltItem.u >= 0 ? 'E' : 'W');
      quadrantLots[qk]++;
      totalPop += ltItem.people;
      if (ltItem.waterFront) waterFrontCount++;
    }

    return {
      lots: lots,
      ways: ways,
      rawWays: rawWays,
      roadMask: roadMask,
      canalWays: CANAL_SPECS,
      canalReaches: CANAL_WAYS,
      bridges: BRIDGES,
      infra: infra,
      hamlets: hamlets,
      cropPalette: cropPalette,
      cropPlots: cropPlots,
      towpath: towpathGraph,
      frontage: {
        samples: frontageSamples,
        populated: frontagePopulated,
        fillRatio: frontageFill,
        emptyWays: unpopulatedWays,
        quadrantLots: quadrantLots,
        wardLots: wardLots
      },
      census: { townPop: totalPop, hamletPop: 620, wardPop: wardPop, wardLots: wardLots, lots: lots.length, waterFrontLots: waterFrontCount },
      obbOverlap: obbOverlap
    };
  }

  return {
    DEFAULT_DIMS: DEFAULT_DIMS,
    PEOPLE: PEOPLE,
    CANAL_SPECS: CANAL_SPECS,
    CANAL_WAYS: CANAL_WAYS,
    BRIDGES: BRIDGES,
    eternianHamletRow: eternianHamletRow,
    buildTowpathGraph: buildTowpathGraph,
    obbOverlap: obbOverlap,
    make: make
  };
})();
