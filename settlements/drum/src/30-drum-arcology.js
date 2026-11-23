// ================================================================= DRUM — 30: Arcology 15-Level Layout ([G data])
// Pure data & geometry for the inhabited interior of the ruined Drum arcology (kits/ancients/src/8af-drum.js).
// Zero THREE, zero DOM. Exact shell constants: RW = 84 m core, RFOOT = 196 m buttress toes, RPOD = 214 m podium,
// YBASE = 66 m === 15 levels * 4.4 m, NF = 12 radial fins at F0 = 20 deg, ENE/ESE collapse scar at AF = 20 deg.
(function (root) {
  'use strict';

  var DRUM = root.DRUM || (root.DRUM = {});

  var DEG = Math.PI / 180;
  var RW = 84.0;
  var RFOOT = 196.0;
  var RPOD = 214.0;
  var YBASE = 66.0;
  var STOREY_H = 4.4;
  var LEVELS = 15;
  var NF = 12;
  var F0_DEG = 20.0;
  var AF_DEG = 20.0;

  function rfAt(y) {
    var u = y / YBASE;
    var a = Math.max(0.0, 1.0 - u / 0.68);
    var b = Math.max(0.0, (u - 0.62) / 0.38);
    return 104.0 + 92.0 * a * a + 50.0 * b * b;
  }

  // 12 radial structural fins: angle in world (x = east, z = south: theta = atan2(z, x) in degrees)
  var FINS = [];
  for (var fk = 0; fk < NF; fk++) {
    FINS.push({
      index: fk,
      deg: F0_DEG + 30.0 * fk,
      thick: 7.0,
      hasStair: fk === 2 || fk === 5 || fk === 8 || fk === 10,
      topScarred: fk === 0 || fk === 11
    });
  }

  // 12 inter-fin bays (mid-angles 35 + 30*k deg); Bays 0 (35 deg) and 11 (5 deg) straddle the AF=20 collapse scar
  var BAYS = [
    { bay: 0, deg: 35, ruined: true, portal: null, role: 'quarry_breach', name: 'Quarry Collapse Breach South-East' },
    { bay: 1, deg: 65, ruined: false, portal: 'portal_market_e', role: 'scrap_market', name: 'Great Scrap-Market Portal' },
    { bay: 2, deg: 95, ruined: false, portal: 'portal_south_se', role: 'caravan_kraal', name: 'South-East Kraal Portal' },
    { bay: 3, deg: 125, ruined: false, portal: 'portal_voth_road', role: 'arena_voth', name: 'Voth Road & Arena Portal' },
    { bay: 4, deg: 155, ruined: false, portal: 'portal_garrison', role: 'garrison', name: 'Garrison Processional Portal' },
    { bay: 5, deg: 185, ruined: false, portal: 'portal_ordinator', role: 'ordinator', name: 'Ordinator Watch Portal' },
    { bay: 6, deg: 215, ruined: false, portal: 'portal_steppe_sw', role: 'steppe_watch', name: 'Scyvoi Steppe Watch Portal' },
    { bay: 7, deg: 245, ruined: false, portal: 'portal_artisans_w', role: 'artisans', name: 'West Tank-Town Portal' },
    { bay: 8, deg: 275, ruined: false, portal: 'portal_nw', role: 'nw_quarters', name: 'North-West Silo Portal' },
    { bay: 9, deg: 305, ruined: false, portal: 'portal_river_w', role: 'river_sluice', name: 'River Sluice & Cistern Portal' },
    { bay: 10, deg: 335, ruined: false, portal: 'portal_river_wharf', role: 'river_wharf', name: 'Drum River Wharf Portal' },
    { bay: 11, deg: 5, ruined: true, portal: null, role: 'quarry_breach', name: 'Quarry Collapse Breach East' }
  ];

  var STAIRS = [
    { id: 'arc_stair_f2', fin: 2, deg: 80, r: 31, name: 'South-East Market Freight Lift & Stair' },
    { id: 'arc_stair_f5', fin: 5, deg: 170, r: 31, name: 'South-West Governor-Watch Stair' },
    { id: 'arc_stair_f8', fin: 8, deg: 260, r: 31, name: 'West Artisans Hoist & Stair' },
    { id: 'arc_stair_f10', fin: 10, deg: 320, r: 31, name: 'North River Cistern Stair' }
  ];

  // Exact population per level (Levels 1-15 sum to 5,400 === 2/5 of 13,500)
  var LEVEL_POP = [
    0,    /* L1: Ground Portals, Under-Drum Salvage Bourse, Weighbridge, Alloy Vaults */
    0,    /* L2: SIM Wholesale Trade Galleries & Bonded Warehouses */
    0,    /* L3: Guild Storage Vaults & Dark-Vault Mushroom Farms */
    0,    /* L4: Pressurized Header Cisterns & Heavy Fin Workshops */
    300,  /* L5: Machine/Boiler Workshops, Communal Mess & Artisan Bunks */
    300,  /* L6: Defaced Old-Legion Hall, Infirmary & Artisan Bunks */
    650,  /* L7: Lower Fin-Wedge Tenements I */
    650,  /* L8: Lower Fin-Wedge Tenements II */
    650,  /* L9: Lower Fin-Wedge Tenements III */
    650,  /* L10: Lower Fin-Wedge Tenements IV */
    500,  /* L11: Upper Fin-Wedge Tenements & Shanty Bays I */
    500,  /* L12: Upper Fin-Wedge Tenements & Shanty Bays II */
    500,  /* L13: Upper Fin-Wedge Tenements & Shanty Bays III */
    500,  /* L14: Upper Fin-Wedge Tenements & Shanty Bays IV */
    200   /* L15: Sky-Terrace (y=66m), Hoist Headhouse, Catch-Basins & High Watch */
  ];

  function polarAt(r, deg, y) {
    var a = deg * DEG;
    return [+(r * Math.cos(a)).toFixed(2), +(y == null ? 0 : y).toFixed(2), +(r * Math.sin(a)).toFixed(2)];
  }

  function buildArcology() {
    var levels = [];
    var simNodes = [];
    var links = [];
    var totalPop = 0;
    var totalUsableM2 = 0;

    for (var lv = 1; lv <= LEVELS; lv++) {
      var y0 = +((lv - 1) * STOREY_H).toFixed(2);
      var y1 = +(lv * STOREY_H).toFixed(2);
      var yMid = 0.5 * (y0 + y1);
      var rf = +rfAt(yMid).toFixed(2);
      var pop = LEVEL_POP[lv - 1];
      totalPop += pop;

      var band = lv === 1 ? 'bourse_portals'
        : (lv <= 3 ? 'trade_storage'
          : (lv <= 6 ? 'workshops_cisterns'
            : (lv <= 10 ? 'lower_dwellings'
              : (lv <= 14 ? 'upper_dwellings' : 'sky_terrace'))));

      var sectors = [];
      var ruinedBays = 0;
      for (var bi = 0; bi < BAYS.length; bi++) {
        var b = BAYS[bi];
        var partialUpperRuin = (lv >= 11 && (b.bay === 1 || b.bay === 10)) || (lv >= 7 && b.bay === 10 && lv >= 13);
        var state = b.ruined ? 'ruined' : (partialUpperRuin ? 'salvage' : 'reclaimed');
        if (b.ruined || partialUpperRuin) ruinedBays++;

        var sectorUse = 'dwelling-multi';
        var sectorJob = null;
        var simRole = null;
        if (b.ruined) {
          sectorUse = 'industry';
          sectorJob = 'quarrying';
          simRole = lv === 1 ? 'quarry_rubble_throat' : 'ruined_breach_ledge';
        } else if (lv === 1) {
          if (b.bay === 1 || b.bay === 2 || b.bay === 3) { sectorUse = 'market'; sectorJob = 'trading'; simRole = 'salvage_bourse'; }
          else if (b.bay === 4 || b.bay === 5) { sectorUse = 'civic'; sectorJob = 'customs'; simRole = 'tribute_assay'; }
          else { sectorUse = 'industry'; sectorJob = 'warehousing'; simRole = 'bonded_alloy_vault'; }
        } else if (lv <= 3) {
          if (b.bay === 8 || b.bay === 9) { sectorUse = 'farm'; sectorJob = 'fungiculture'; simRole = 'mushroom_vat_vault'; }
          else if (b.bay === 1 || b.bay === 2 || b.bay === 10) { sectorUse = 'shop'; sectorJob = 'trading'; simRole = 'ancient_parts_exchange'; }
          else { sectorUse = 'industry'; sectorJob = 'warehousing'; simRole = 'bonded_warehouse'; }
        } else if (lv <= 6) {
          if (b.bay === 9 || b.bay === 10) { sectorUse = 'infrastructure'; sectorJob = null; simRole = 'header_cistern'; }
          else if (b.bay === 4) { sectorUse = 'civic'; sectorJob = 'healing'; simRole = 'arcology_infirmary'; }
          else if (b.bay === 6) { sectorUse = 'tavern'; sectorJob = 'baking'; simRole = 'communal_mess_bakehouse'; }
          else if (lv >= 5 && (b.bay === 5 || b.bay === 7)) { sectorUse = 'dwelling-multi'; sectorJob = null; simRole = 'artisan_bunkhouse'; }
          else { sectorUse = 'industry'; sectorJob = 'smithing'; simRole = 'fin_workshop'; }
        } else if (lv === 15) {
          if (b.bay === 4 || b.bay === 5) { sectorUse = 'military'; sectorJob = null; simRole = 'high_watch_post'; }
          else if (b.bay === 9 || b.bay === 2) { sectorUse = 'infrastructure'; sectorJob = null; simRole = 'sky_catch_basin'; }
          else if (b.bay === 1) { sectorUse = 'industry'; sectorJob = 'ropemaking'; simRole = 'sky_terrace_crane'; }
          else { sectorUse = 'dwelling-multi'; sectorJob = null; simRole = 'rigger_quarters'; }
        }

        var secPop = 0;
        if (!b.ruined && pop > 0) {
          if (lv === 5 || lv === 6) secPop = (b.bay === 5 || b.bay === 7) ? 150 : 0;
          else if (lv >= 7 && lv <= 14) secPop = pop / 10;
          else if (lv === 15) secPop = (b.bay === 6 || b.bay === 8) ? 100 : 0;
        }

        var secId = 'arc_L' + (lv < 10 ? '0' + lv : lv) + '_B' + (b.bay < 10 ? '0' + b.bay : b.bay);
        var usableM2 = b.ruined ? 0 : Math.round((lv <= 3 ? 2680 : (lv <= 6 ? 1940 : (lv <= 10 ? 1810 : (lv <= 14 ? 1700 : 2240)))));
        totalUsableM2 += usableM2;

        var sec = {
          id: secId,
          level: lv,
          bay: b.bay,
          deg: b.deg,
          state: state,
          use: sectorUse,
          job: sectorJob,
          simRole: simRole,
          pop: secPop,
          usableM2: usableM2,
          at: polarAt(b.ruined ? 96 : 64, b.deg, y0)
        };
        sectors.push(sec);

        if (simRole && !b.ruined && (lv <= 6 || lv === 15)) {
          simNodes.push({
            id: secId,
            level: lv,
            role: simRole,
            use: sectorUse,
            job: sectorJob,
            areaM2: usableM2,
            at: sec.at
          });
        }
      }

      var ringId = 'arc_ring_L' + (lv < 10 ? '0' + lv : lv);
      levels.push({
        level: lv,
        id: ringId,
        band: band,
        y0: y0,
        y1: y1,
        rf: rf,
        pop: pop,
        ruinedBays: ruinedBays,
        intactBays: 12 - ruinedBays,
        sectors: sectors
      });

      // Connect ring gallery to every non-ruined bay and to all 4 stair/hoist cores on this level
      for (var si = 0; si < sectors.length; si++) {
        if (sectors[si].state !== 'ruined') {
          links.push([ringId, sectors[si].id, { kind: 'gallery_door', level: lv }]);
        }
      }
      for (var ci = 0; ci < STAIRS.length; ci++) {
        var stNode = STAIRS[ci].id + '_L' + (lv < 10 ? '0' + lv : lv);
        links.push([ringId, stNode, { kind: 'stair_landing', level: lv }]);
        if (lv > 1) {
          var prevNode = STAIRS[ci].id + '_L' + ((lv - 1) < 10 ? '0' + (lv - 1) : (lv - 1));
          links.push([prevNode, stNode, { kind: 'fin_stair', from: lv - 1, to: lv }]);
        }
      }
      var hoistNode = 'arc_central_hoist_L' + (lv < 10 ? '0' + lv : lv);
      links.push([ringId, hoistNode, { kind: 'hoist_deck', level: lv }]);
      if (lv > 1) {
        var prevHoist = 'arc_central_hoist_L' + ((lv - 1) < 10 ? '0' + (lv - 1) : (lv - 1));
        links.push([prevHoist, hoistNode, { kind: 'central_hoist', from: lv - 1, to: lv }]);
      }
    }

    var portals = [];
    for (var pk = 0; pk < BAYS.length; pk++) {
      if (BAYS[pk].portal) {
        var pId = BAYS[pk].portal;
        portals.push({
          id: pId,
          bay: BAYS[pk].bay,
          deg: BAYS[pk].deg,
          name: BAYS[pk].name,
          role: BAYS[pk].role,
          at: polarAt(196.0, BAYS[pk].deg, 0)
        });
        var l1Sec = 'arc_L01_B' + (BAYS[pk].bay < 10 ? '0' + BAYS[pk].bay : BAYS[pk].bay);
        links.push([pId, l1Sec, { kind: 'portal_arch', state: 'open' }]);
      }
    }

    return {
      RW: RW,
      RFOOT: RFOOT,
      RPOD: RPOD,
      YBASE: YBASE,
      storeyH: STOREY_H,
      levelCount: LEVELS,
      afDeg: AF_DEG,
      f0Deg: F0_DEG,
      rfAt: rfAt,
      fins: FINS,
      bays: BAYS,
      stairs: STAIRS,
      portals: portals,
      levels: levels,
      simNodes: simNodes,
      links: links,
      totalPop: totalPop,
      totalUsableM2: totalUsableM2,
      upperWatch: { id: 'arc_skygate1_watch', y: 198.0, note: 'Stripped Sky Gate 1 watch post & signal fire reached by Fin 5 hoist' }
    };
  }

  DRUM.ARC_SPEC = { RW: RW, RFOOT: RFOOT, RPOD: RPOD, YBASE: YBASE, STOREY_H: STOREY_H, LEVELS: LEVELS, NF: NF, F0_DEG: F0_DEG, AF_DEG: AF_DEG, rfAt: rfAt };
  DRUM.buildArcology = buildArcology;
})(typeof window !== 'undefined' ? window : globalThis);
