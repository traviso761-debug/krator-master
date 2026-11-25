// ================================================================= ARCODIGA — Three-Instance Dual-Polity KCITY Layout & KSPACE Audit [G data]
// Lays out Kōpa-Dīga / Dī-Gā Wài-Sī across three KCITY instances sharing KSPACE and KRATOR_KITS ('hueru-kuran' + 'eternian'):
//   1. 'hk_rim'        (Z5 Hueru-Kuran Caldera-Rim Town, +98..+205 m): Nuraghe Complesso, Santa Cristina drawdown step-well,
//                      water-powered nephrite wire-sawmills, benihi flume yards, 2 hoist heads, and whale-rib Chise terraces.
//   2. 'et_cantonment' (Z4 Dīga-Māketi Charter Plaza +176 m + Z6 Eternian Superintendency Fort +148..+188 m): hexagonal et_fort,
//                      et_ministry, bronze tsunami-tide et_clock, et_customs_house facing hk_ukor_council, and 2 KCONS sites.
//   3. 'cove_works'    (Z1 Lagoon Hoist-Foot Cove + NW Ocean Breach Splitters + SE Dam-Lee Farport Junk Quay, +5..+15 m):
//                      strictly non-residential harbour, breakwater, tryworks, boatyard, and coaling structures (0 dwellings < +65 m!).
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_CITY = (function(){
 const SEED = ADG_SITE.SEED;

 function makeTune(half, cell, stanceMode, maxDrop, defaultKit){
  const isEt = defaultKit === 'eternian';
  return {
   cell: cell,
   rasterHalf: half,
   maxSlope: 0.38,
   exact: true,
   width: { avenue: 11.0, main: 8.5, side: 6.0, alley: 3.8, highway: 12.0, lane: 4.5 },
   lot: { side: 1.6, setback: 1.5, rear: 2.8, inset: 0.9, step: 3.5 },
   classes: isEt ? {
    rich:   [['eternian:et_official_villa', 0], ['eternian:et_merchant_house', 0], ['eternian:et_hex_villa', 0]],
    middle: [['eternian:et_canal_house', 0], ['eternian:et_hex_house', 0], ['eternian:et_court_house', 0]],
    poor:   [['eternian:et_block_hut', 0], ['eternian:et_reed_house', 0], ['eternian:et_hex_hut', 0]]
   } : {
    rich:   [['hueru-kuran:hk_house_rich_whalelord', 0], ['hueru-kuran:hk_house_rich_clan', 0], ['hueru-kuran:hk_house_rich_steward', 0]],
    middle: [['hueru-kuran:hk_house_mid_carver', 0], ['hueru-kuran:hk_house_mid_harpooneer', 0], ['hueru-kuran:hk_house_mid_skipper', 0]],
    poor:   [['hueru-kuran:hk_house_poor_flenser', 0], ['hueru-kuran:hk_house_poor_kelper', 0], ['hueru-kuran:hk_house_poor_diver', 0]]
   },
   fallback: { rich: 'middle', middle: 'poor', poor: null },
   civic: [],
   civicSpacing: 95,
   voidMax: 36,
   voidIters: 0,
   voidBatch: 0,
   sideSpacing: 46,
   sideMax: 180,
   alleyFrac: 0.25,
   blindMax: 85,
   interiorDepth: 9,
   interiorRounds: 0,
   avenueSnap: 55,
   ringGap: 7,
   verge: 6,
   wall: {},
   plazaArt: {},
   mapHalf: half,
   stance: stanceMode,
   stanceOpt: { maxDrop: maxDrop, cut: 5.0 }
  };
 }

 /* 2D Separating-Axis OBB intersection test (shrink > 0 shrinks each box slightly to ignore shared kerb touch) */
 function obbOverlap(a, b, shrink){
  if (!a || !b) return false;
  const pad = shrink == null ? 0.05 : shrink;
  const ahw = Math.max(0.1, a.hw - pad), ahd = Math.max(0.1, a.hd - pad);
  const bhw = Math.max(0.1, b.hw - pad), bhd = Math.max(0.1, b.hd - pad);
  const dx = b.c[0] - a.c[0], dz = b.c[1] - a.c[1];
  if (Math.hypot(dx, dz) > Math.hypot(ahw, ahd) + Math.hypot(bhw, bhd)) return false;
  const av = a.v || [-a.u[1], a.u[0]];
  const bv = b.v || [-b.u[1], b.u[0]];
  const axes = [a.u, av, b.u, bv];
  for (let i = 0; i < 4; i++) {
   const ax = axes[i][0], az = axes[i][1];
   const projD = Math.abs(dx * ax + dz * az);
   const ra = ahw * Math.abs(a.u[0] * ax + a.u[1] * az) + ahd * Math.abs(av[0] * ax + av[1] * az);
   const rb = bhw * Math.abs(b.u[0] * ax + b.u[1] * az) + bhd * Math.abs(bv[0] * ax + bv[1] * az);
   if (projD >= ra + rb) return false;
  }
  return true;
 }

 /* ================================================================ 1. Landmark & Trade Host Anchors */
 const HK_RIM_LANDMARKS = [
  { key: 'hueru-kuran:hk_nuraghe_complesso',  x:  912, z: -555, ry:  0.12, zone: 'Z5', role: 'Kopa-Diga Trilobate Basalt Nuraghe Complesso' },
  { key: 'hueru-kuran:hk_stepwell_sanctuary', x: 1035, z: -395, ry:  0.00, zone: 'Z5', role: 'Santa Cristina 25-Min Ghost-Tsunami Chime-Well Sanctuary', interiorId: 'adg.vault.santa_cristina' },
  { key: 'hueru-kuran:hk_ukor_matron_lodge',  x:  965, z: -475, ry:  0.05, zone: 'Z5', role: 'Kuran-Ota Senior Whale-Clan Matron Lodge' },
  { key: 'hueru-kuran:hk_lore_hall',          x: 1015, z: -475, ry:  0.00, zone: 'Z5', role: 'Pelagic Swell-Stick & Tsunami Star-Lore Hall' },
  { key: 'hueru-kuran:hk_healer_lodge',       x: 1065, z: -475, ry: -0.05, zone: 'Z5', role: 'Deep-Water Decompression & Herbal Steam Lodge' },
  { key: 'hueru-kuran:hk_ossuary_barrow',     x: 1145, z: -775, ry:  0.22, zone: 'Z5', role: 'Whale-Jawbone Ancestor Ossuary Barrow' },
  { key: 'hueru-kuran:hk_beacon_nuraghe',     x:  855, z: -795, ry:  0.38, zone: 'Z5', role: 'North Caldera Whale-Oil Storm Beacon Nuraghe' },
  { key: 'hueru-kuran:hk_cliff_gatehouse',    x:  865, z: -432, ry:  1.57, zone: 'Z5', role: 'Hoist-Brow Basalt Cliff Gatehouse' },
  { key: 'hueru-kuran:hk_watch_barracks',     x:  915, z: -432, ry:  0.00, zone: 'Z5', role: 'Harpoon Cliff-Watch & Surge-Bell Barracks' },
  { key: 'hueru-kuran:hk_cliff_hoist',        x:  852, z: -625, ry: -1.57, zone: 'Z5', role: 'North 90s Water-Ballast Cliff-Hoist Headhouse' },
  { key: 'hueru-kuran:hk_cliff_hoist',        x:  852, z: -485, ry: -1.57, zone: 'Z5', role: 'South 90s Nephrite & Baidarka Cliff-Hoist Headhouse', v: 1 },
  { key: 'hueru-kuran:hk_jade_sawmill',       x: 1268, z: -425, ry: -0.10, zone: 'Z5', role: 'Upper Cascade Nephrite Pendulum Wire-Sawmill W' },
  { key: 'hueru-kuran:hk_jade_sawmill',       x: 1328, z: -435, ry: -0.10, zone: 'Z5', role: 'Upper Cascade Nephrite Pendulum Wire-Sawmill E', v: 1 },
  { key: 'hueru-kuran:hk_cypress_flume_yard', x: 1278, z: -115, ry: -0.08, zone: 'Z5', role: 'Benihi Red-Cypress 30 m Mast-Flume Yard W' },
  { key: 'hueru-kuran:hk_cypress_flume_yard', x: 1338, z: -125, ry: -0.08, zone: 'Z5', role: 'Benihi Red-Cypress Mast-Seasoning Shed E', v: 1 },
  { key: 'hueru-kuran:hk_jade_quarry',        x: 1478, z: -615, ry:  0.15, zone: 'Z5', role: 'Crookshore Emerald-Nephrite Boulder Quarry' },
  { key: 'hueru-kuran:hk_jade_quarry',        x: 1448, z: -335, ry: -0.12, zone: 'Z5', role: 'Quartz-Garnet Wire-Saw Abrasive Grit Quarry', v: 1 },
  { key: 'hueru-kuran:hk_kelp_glassworks',    x: 1185, z: -532, ry:  0.00, zone: 'Z5', role: 'Kelp-Soda Emerald Sea-Glass Pane Furnace' },
  { key: 'hueru-kuran:hk_kaen_kiln',          x: 1228, z: -532, ry:  0.00, zone: 'Z5', role: 'Flame-Rimmed Kaen-Doki Cord-Marked Pottery Kiln' },
  { key: 'hueru-kuran:hk_harpoon_smithy',     x: 1142, z: -532, ry:  0.00, zone: 'Z5', role: 'Salvaged-Alloy Harpoon & Saw-Wire Smithy' },
  { key: 'hueru-kuran:hk_baleen_loft',        x: 1098, z: -532, ry:  0.00, zone: 'Z5', role: 'Steamed Baleen-Spring & Sinew Cordage Loft' },
  { key: 'hueru-kuran:hk_smokehouse_saltery', x: 1105, z: -592, ry:  0.00, zone: 'Z5', role: 'Driftwood Whale-Meat & Salmon Smokehouse' },
  { key: 'hueru-kuran:hk_bakehouse',          x: 1058, z: -592, ry:  0.00, zone: 'Z5', role: 'Kelp-Meal & Barley Flatbread Bakehouse' },
  { key: 'hueru-kuran:hk_sealhide_tailor',    x: 1012, z: -592, ry:  0.00, zone: 'Z5', role: 'Oiled Sea-Mammal Gutskin & Elm-Bark Parka Tailor' },
  { key: 'hueru-kuran:hk_brew_kelp',          x:  968, z: -592, ry:  0.00, zone: 'Z5', role: 'Cloudberry & Roasted-Kelp Fermenting House' },
  { key: 'hueru-kuran:hk_granary_nuraghe',    x: 1165, z: -365, ry:  0.00, zone: 'Z5', role: 'Corbelled Basalt Tsunami-Reserve Granary Tower' },
  { key: 'hueru-kuran:hk_warehouse_vault',    x:  912, z: -625, ry:  0.00, zone: 'Z5', role: 'North Hoist-Head Sawn-Nephrite & Oil Vault' },
  { key: 'hueru-kuran:hk_inn_terrace',        x:  965, z: -285, ry:  0.00, zone: 'Z5', role: 'Caldera-Overlook Pack-Train & Whalers Terrace Inn' },
  { key: 'hueru-kuran:hk_market_terrace',     x: 1025, z: -285, ry:  0.00, zone: 'Z5', role: 'Santa Cristina Rim Provisioning Market Terrace' },
  { key: 'hueru-kuran:hk_house_rich_whalelord', x: 918, z: -345, ry: 0.08, zone: 'Z5', role: 'First Harpoon Whale-Lord Chise Compound' },
  { key: 'hueru-kuran:hk_terrace_croft',      x: 1385, z: -725, ry:  0.05, zone: 'Z5', role: 'Kelp-Mulched Sea-Kale & Tuber Wind-Wall Croft N' },
  { key: 'hueru-kuran:hk_terrace_croft',      x: 1435, z: -245, ry: -0.05, zone: 'Z5', role: 'Kelp-Mulched Sea-Kale & Duck Wind-Wall Croft S', v: 1 }
 ];

 const ET_CANTON_LANDMARKS = [
  /* Z4: Dīga-Māketi East Wing Highway Charter Plaza (+175..+184 m) */
  { key: 'eternian:et_customs_house',       x:  968, z: 248, ry:  3.1416, zone: 'Z4', role: 'Eternal State Charter Assay & Timber Tally House' },
  { key: 'hueru-kuran:hk_ukor_council',     x:  968, z: 168, ry:  0.0000, zone: 'Z4', role: 'Ukor Joint Chime-Court & Truce Arbitration Hall' },
  { key: 'hueru-kuran:hk_jade_exchange',    x: 1018, z: 168, ry:  0.0000, zone: 'Z4', role: 'Diga-Maketi Nephrite & Relic Assay Exchange' },
  { key: 'hueru-kuran:hk_embassy_hayrant',  x: 1068, z: 168, ry:  0.0000, zone: 'Z4', role: 'Hayrant Sister-Clan & Dzagh-Vardzi Truce Legation' },
  { key: 'hueru-kuran:hk_tavern_whale',     x: 1118, z: 168, ry:  0.0000, zone: 'Z4', role: 'Blubber-Lamp Mariners & Salvagers Charter Tavern' },
  { key: 'eternian:et_market_hall',         x: 1022, z: 252, ry:  3.1416, zone: 'Z4', role: 'Hexagonal Porcelain, Tea & Cassiterite Market Hall' },
  { key: 'eternian:et_tea_house',           x: 1072, z: 248, ry:  3.1416, zone: 'Z4', role: 'Painted Clerks & Factors Charter Tea Pavilion' },
  { key: 'eternian:et_inn',                 x: 1125, z: 252, ry:  3.1416, zone: 'Z4', role: 'East Portal Courier & Mule-Train Post-Inn' },
  { key: 'hueru-kuran:hk_warehouse_vault',  x: 1178, z: 168, ry:  0.0000, zone: 'Z4', role: 'Charter North Nephrite Transit Vault (Under Construction)', underConstruction: true, consProgress: 0.46 },
  { key: 'eternian:et_warehouse',           x: 1178, z: 252, ry:  3.1416, zone: 'Z4', role: 'Charter South Timber & Tin Bonded Store (Under Construction)', underConstruction: true, consProgress: 0.58 },

  /* Z6: Dī-Gā Wài-Sī Eternal State Superintendency Cantonment (+150..+186 m) */
  { key: 'eternian:et_fort',                x: 1115, z: 585, ry:  0.0000, zone: 'Z6', role: 'Di-Ga Wai-Si Hexagonal Outer Dam Superintendency Bastion' },
  { key: 'eternian:et_ministry',            x:  995, z: 525, ry: -1.5708, zone: 'Z6', role: 'Outer Dam Superintendency Censorate & Hydrography Ministry', interiorId: 'adg.hall.superintendency' },
  { key: 'eternian:et_clock',               x:  965, z: 435, ry:  0.0000, zone: 'Z6', role: 'Bronze Tsunami-Tide & Santa Cristina Sync Clock-Tower' },
  { key: 'eternian:et_tube_station',        x:  892, z: 415, ry:  1.5708, zone: 'Z6', role: 'East Buttress E2 Pneumatic Dispatch & Girder-Lift Station' },
  { key: 'eternian:et_gate',                x:  965, z: 362, ry:  0.0000, zone: 'Z6', role: 'Cantonment North Charter-Boundary Ceremonial Gate' },
  { key: 'eternian:et_barracks',            x:  935, z: 495, ry:  1.5708, zone: 'Z6', role: 'Painted Cantonment Halberdiers Cliff-Watch Barracks' },
  { key: 'eternian:et_wall_tower',          x:  892, z: 475, ry:  1.5708, zone: 'Z6', role: 'Gorge-Rim Semaphore & Lee-Wharf Watchtower' },
  { key: 'eternian:et_registry',            x:  995, z: 465, ry:  0.0000, zone: 'Z6', role: 'State Salvage Patent & Farport Shipping Registry' },
  { key: 'eternian:et_examination_hall',    x: 1048, z: 455, ry:  0.0000, zone: 'Z6', role: 'Hydrographic & Ancient-Script Examination Hall' },
  { key: 'eternian:et_relic_hall',          x: 1048, z: 395, ry:  0.0000, zone: 'Z6', role: 'Catalogued Arcodiga Machine-Relic Conservatory' },
  { key: 'eternian:et_ancestor_gallery',    x: 1105, z: 395, ry:  0.0000, zone: 'Z6', role: 'Closed-Eyed Ancestor Mask & Expedition Memorial Gallery' },
  { key: 'eternian:et_historians_house',    x: 1152, z: 395, ry:  0.0000, zone: 'Z6', role: 'Order of Historians Crookshore Chronicle House' },
  { key: 'eternian:et_healer',              x:  935, z: 555, ry:  1.5708, zone: 'Z6', role: 'Superintendency Apothecary & Miner Infirmary' },
  { key: 'eternian:et_mask_house',          x:  935, z: 595, ry:  1.5708, zone: 'Z6', role: 'Closed-Eyed Funerary Bronze & Stone Mask Workshop' },
  { key: 'eternian:et_talking_head',        x:  965, z: 402, ry:  0.0000, zone: 'Z6', role: 'Closed-Eyed Ancestor Oracle Plinth' },
  { key: 'eternian:et_shrine_niche',        x:  942, z: 435, ry:  1.5708, zone: 'Z6', role: 'Cantonment Tide-Watch Lantern Shrine Niche' },
  { key: 'eternian:et_official_villa',      x: 1225, z: 455, ry: -1.5708, zone: 'Z6', role: 'Superintendent-General Ranked Courtyard Villa' },
  { key: 'eternian:et_official_villa',      x: 1225, z: 515, ry: -1.5708, zone: 'Z6', role: 'Chief Hydrographer & Relic-Censor Villa', v: 1 },
  { key: 'eternian:et_warehouse',           x:  915, z: 382, ry:  0.0000, zone: 'Z6', role: 'Girder-Lift Upper Coal & Mast Staging Warehouse' },
  { key: 'eternian:et_bakehouse',           x:  935, z: 648, ry:  0.0000, zone: 'Z6', role: 'Garrison Steamed-Bun & Rice-Cake Bakehouse' },
  { key: 'eternian:et_butcher',             x:  972, z: 648, ry:  0.0000, zone: 'Z6', role: 'Cantonment Salted-Goat & Pork Provisioner' },
  { key: 'eternian:et_weaver',              x: 1010, z: 648, ry:  0.0000, zone: 'Z6', role: 'Dyed Rank-Sash & Junk Batten-Sail Weaver' },
  { key: 'eternian:et_brewhouse',           x: 1048, z: 648, ry:  0.0000, zone: 'Z6', role: 'Millet-Wine & Ginger-Cordial Brewhouse' },
  { key: 'eternian:et_smithy',              x: 1205, z: 668, ry:  0.0000, zone: 'Z6', role: 'Paktong & Bronze Bulkhead-Fitting Forge' },
  { key: 'eternian:et_tannery',             x: 1245, z: 668, ry:  0.0000, zone: 'Z6', role: 'Mule-Harness & Bellows Leather Tannery' },
  { key: 'eternian:et_kiln',                x: 1288, z: 668, ry:  0.0000, zone: 'Z6', role: 'Coal-Fired Coke & Glazed-Brick Assay Kiln' },
  { key: 'eternian:et_paper_mill',          x: 1205, z: 718, ry:  0.0000, zone: 'Z6', role: 'Bark-Fibre Telemetry Ledger & Chart Paper Mill' },
  { key: 'eternian:et_porcelain',           x: 1245, z: 718, ry:  0.0000, zone: 'Z6', role: 'State-Stamped Insulator & Celadon Kilnworks' },
  { key: 'eternian:et_tile_works',          x: 1295, z: 725, ry:  0.0000, zone: 'Z6', role: 'Eternian Swept-Eave Green Roof-Tile Works' },
  { key: 'eternian:et_granary',             x: 1155, z: 695, ry:  0.0000, zone: 'Z6', role: 'Cantonment Tribute-Rice & Barley Vaulted Granary' },
  { key: 'eternian:et_quarry',              x: 1335, z: 585, ry: -0.2500, zone: 'Z6', role: 'Dressed Columnar-Basalt Ashlar & Plinth Quarry' },
  { key: 'eternian:et_mine',                x: 1382, z: 525, ry: -0.2000, zone: 'Z6', role: 'Skarn Cassiterite-Tin & Magnetite Adit Headhouse' },
  { key: 'eternian:et_mine',                x: 1352, z: 695, ry: -0.3000, zone: 'Z6', role: 'Crookshore Collar Bituminous Steam-Coal Seam Mine', v: 1 },
  { key: 'eternian:et_terraces',            x: 1235, z: 795, ry:  0.0000, zone: 'Z6', role: 'Walled Cantonment Buckwheat & Cabbage Terraces' },
  { key: 'eternian:et_tea_garden',          x: 1175, z: 795, ry:  0.0000, zone: 'Z6', role: 'Cloud-Mist Superintendency Tea & Herb Garden' },
  { key: 'eternian:et_goat_fold',           x: 1115, z: 795, ry:  0.0000, zone: 'Z6', role: 'Cantonment Crag-Goat Dairy Fold' },
  { key: 'eternian:et_stock_pens',          x: 1055, z: 795, ry:  0.0000, zone: 'Z6', role: 'Dzagh-Vardzi Pack-Mule & Salt-Pork Corrals' }
 ];

 /* Strictly non-residential coastal works (< +65 m: 0 dwellings!) */
 const COVE_WORKS_LANDMARKS = [
  /* Z1: Sheltered East Lagoon Hoist-Foot & Baidarka Cove (+5..+14 m) */
  { key: 'hueru-kuran:hk_crater_quay',      x:  582, z: -625, ry: -1.5708, zone: 'Z1', role: 'North Lagoon Hoist-Foot Whaleboat & Nephrite Quay', y: 5.4 },
  { key: 'hueru-kuran:hk_crater_quay',      x:  582, z: -485, ry: -1.5708, zone: 'Z1', role: 'South Lagoon Salvage-Ark & Dive-Tender Quay', y: 5.5, v: 1 },
  { key: 'hueru-kuran:hk_ferry_causeway',   x:  578, z: -555, ry: -1.5708, zone: 'Z1', role: 'Caldera Lagoon Cross-Basin Ferry Causeway', y: 5.2 },
  { key: 'hueru-kuran:hk_baidarka_yard',    x:  628, z: -555, ry: -1.5708, zone: 'Z1', role: 'Oiled-Skin Baidarka & Outrigger Whaler Boatyard', y: 7.4 },
  { key: 'hueru-kuran:hk_blubber_tryworks', x:  672, z: -658, ry:  0.0000, zone: 'Z1', role: 'Downwind Lagoon Shore Whale-Blubber Tryworks', y: 9.2 },
  { key: 'hueru-kuran:hk_warehouse_vault',  x:  708, z: -625, ry: -1.5708, zone: 'Z1', role: 'North Hoist-Foot Rapid-Sling Oil & Baleen Shed', y: 10.6 },
  { key: 'hueru-kuran:hk_warehouse_vault',  x:  708, z: -485, ry: -1.5708, zone: 'Z1', role: 'South Hoist-Foot Ancient-Alloy Dive-Salvage Shed', y: 10.8, v: 1 },
  { key: 'hueru-kuran:hk_prou_torre',       x:  572, z: -688, ry: -1.2500, zone: 'Z1', role: 'Lagoon Surge-Gauge & Boom-Chain Prou Torre', y: 6.2 },

  /* NW Ocean Breach Whale-Jawbone Wave-Splitter Breakwaters (+6..+15 m) */
  { key: 'hueru-kuran:hk_wave_splitter',    x: -1065, z: -1215, ry: -0.78, zone: 'Z1', role: 'Outer NW Breach Whale-Jawbone Basalt Wave-Splitter W', y: 6.4 },
  { key: 'hueru-kuran:hk_wave_splitter',    x:  -985, z: -1145, ry: -0.78, zone: 'Z1', role: 'Mid NW Breach Whale-Jawbone Basalt Wave-Splitter M', y: 7.8, v: 1 },
  { key: 'hueru-kuran:hk_wave_splitter',    x:  -905, z: -1075, ry: -0.78, zone: 'Z1', role: 'Inner NW Breach Whale-Jawbone Basalt Wave-Splitter E', y: 9.2 },
  { key: 'hueru-kuran:hk_prou_torre',       x:  -842, z: -1022, ry: -0.78, zone: 'Z1', role: 'NW Breach Swell-Watch & Tsunami Horn Prou Torre', y: 11.4 },

  /* Z6 Sheltered SE Dam-Lee Farport Junk Coaling & Timber Quay (+5.5..+12 m) */
  { key: 'eternian:et_dock',                x:  415, z:  425, ry:  0.0000, zone: 'Z6_WHARF', role: 'Farport State Supply-Junk Drydock & Mast-Stepping Yard', y: 6.2 },
  { key: 'eternian:et_quay',                x:  478, z:  448, ry:  0.0000, zone: 'Z6_WHARF', role: 'West Dam-Lee Steam-Coal & Cassiterite Junk Quay', y: 6.0 },
  { key: 'eternian:et_quay',                x:  538, z:  448, ry:  0.0000, zone: 'Z6_WHARF', role: 'East Dam-Lee 30 m Benihi Mast-Loading Quay', y: 6.2, v: 1 },
  { key: 'eternian:et_canal_landing',       x:  372, z:  415, ry: -1.5708, zone: 'Z6_WHARF', role: 'Tailrace Lighter & Dive-Tender Basin Landing', y: 5.8 },
  { key: 'eternian:et_ferry_landing',       x:  372, z:  455, ry: -1.5708, zone: 'Z6_WHARF', role: 'Gorge-Mouth Sound Pilot & Shuttle Ferry Landing', y: 5.8 },
  { key: 'eternian:et_fish_landing',        x:  578, z:  455, ry:  0.0000, zone: 'Z6_WHARF', role: 'Tailrace Eddy Squid & Kelp-Provision Landing', y: 6.4 },
  { key: 'eternian:et_lighthouse',          x:  358, z:  484, ry:  0.3500, zone: 'Z6_WHARF', role: 'Dam-Lee Breakwater Bronze Storm-Lantern Tower', y: 6.6 },
  { key: 'eternian:et_warehouse',           x:  552, z:  395, ry:  0.0000, zone: 'Z6_WHARF', role: 'Girder-Lift Foot Steam-Coal Bunker', y: 9.8 },
  { key: 'eternian:et_warehouse',           x:  492, z:  392, ry:  0.0000, zone: 'Z6_WHARF', role: 'Dam-Lee Benihi Mast & Spar Transit Shed', y: 8.6, v: 1 }
 ];

 /* ================================================================ 2. Strategy Pools */
 const HK_RIM_POOLS = {
  nuraghe_core: [
   ['hueru-kuran:hk_house_rich_whalelord', 2], ['hueru-kuran:hk_house_rich_clan', 2], ['hueru-kuran:hk_house_rich_steward', 2],
   ['hueru-kuran:hk_house_mid_skipper', 3], ['hueru-kuran:hk_house_mid_harpooneer', 3], ['hueru-kuran:hk_market_terrace', 1]
  ],
  chise_mid: [
   ['hueru-kuran:hk_house_mid_carver', 4], ['hueru-kuran:hk_house_mid_harpooneer', 4], ['hueru-kuran:hk_house_mid_skipper', 3],
   ['hueru-kuran:hk_house_poor_diver', 3], ['hueru-kuran:hk_house_poor_kelper', 3], ['hueru-kuran:hk_house_poor_flenser', 2]
  ],
  saw_terrace: [
   ['hueru-kuran:hk_house_mid_carver', 4], ['hueru-kuran:hk_house_poor_flenser', 3], ['hueru-kuran:hk_house_poor_kelper', 3],
   ['hueru-kuran:hk_terrace_croft', 2], ['hueru-kuran:hk_baleen_loft', 1], ['hueru-kuran:hk_harpoon_smithy', 1]
  ]
 };

 const HK_RIM_SMALL = {
  nuraghe_core: [['hueru-kuran:hk_house_poor_diver', 1], ['hueru-kuran:hk_house_poor_kelper', 1]],
  chise_mid:    [['hueru-kuran:hk_house_poor_flenser', 2], ['hueru-kuran:hk_house_poor_kelper', 2]],
  saw_terrace:  [['hueru-kuran:hk_house_poor_flenser', 2], ['hueru-kuran:hk_house_poor_kelper', 1]]
 };

 const ET_CANTON_POOLS = {
  charter_plaza: [
   ['eternian:et_shophouse', 3], ['eternian:et_merchant_house', 2], ['eternian:et_tea_house', 1],
   ['hueru-kuran:hk_house_mid_carver', 2], ['hueru-kuran:hk_market_terrace', 1]
  ],
  canton_clerk: [
   ['eternian:et_court_house', 3], ['eternian:et_canal_house', 4], ['eternian:et_hex_house', 3],
   ['eternian:et_corner_turret', 2], ['eternian:et_merchant_house', 2], ['eternian:et_shophouse', 3]
  ],
  canton_garrison: [
   ['eternian:et_canal_row', 3], ['eternian:et_canal_house', 3], ['eternian:et_hex_house', 3],
   ['eternian:et_block_hut', 3], ['eternian:et_reed_house', 2], ['eternian:et_hex_hut', 3]
  ]
 };

 const ET_CANTON_SMALL = {
  charter_plaza:   [['eternian:et_shophouse', 2], ['eternian:et_shrine_niche', 1]],
  canton_clerk:    [['eternian:et_hex_hut', 2], ['eternian:et_shrine_niche', 1]],
  canton_garrison: [['eternian:et_block_hut', 2], ['eternian:et_reed_house', 2], ['eternian:et_hex_hut', 2]]
 };

 function stampStreamAndWellReserves(R, OCC){
  /* Keep Santa Cristina mirror-pool (1035, -365, r=14) and stream channels + millponds completely building-free */
  const sc = ADG_SITE.SANTA_CRISTINA;
  const wellPoly = [];
  for (let k = 0; k < 12; k++) {
   const a = (k / 12) * Math.PI * 2;
   wellPoly.push([sc.x + Math.cos(a) * 14.5, sc.z + Math.sin(a) * 14.5]);
  }
  R.stampPoly(wellPoly, OCC.GREEN, -2);

  for (let i = 0; i < ADG_SITE.STREAMS.length; i++) {
   const st = ADG_SITE.STREAMS[i];
   for (let j = 0; j < st.pts.length - 1; j++) {
    R.eachNearSeg(st.pts[j], st.pts[j + 1], 9.0, function(idx){ R.occ[idx] = OCC.GREEN; });
   }
   if (st.basin) {
    const bp = [];
    for (let k = 0; k < 12; k++) {
     const a = (k / 12) * Math.PI * 2;
     bp.push([st.basin.x + Math.cos(a) * (st.basin.r + 5.0), st.basin.z + Math.sin(a) * (st.basin.r + 5.0)]);
    }
    R.stampPoly(bp, OCC.GREEN, -3);
   }
  }
 }

 function placeLandmarks(spec, tier){
  const K = KCITY.lib, SLx = K.SL, P = K.plan(), out = [];
  for (let i = 0; i < spec.length; i++) {
   const S = spec[i];
   const D = ADG_TUNE.dimsOf(S.key, S.v == null ? 0 : S.v);
   if (!D) continue;
   const u = [Math.cos(S.ry), -Math.sin(S.ry)];
   const bo = K.obb([S.x, S.z], u, D.w * 0.5, D.d * 0.5);

   /* Guarantee zero landmark-landmark OBB overlap */
   let clash = false;
   for (let j = 0; j < P.lots.length; j++) {
    if (P.lots[j].died == null && obbOverlap(bo, P.lots[j].bo, 0.02)) {
     clash = true;
     break;
    }
   }
   if (clash) continue;

   let y = S.y;
   let drop = 0;
   if (y == null) {
    const st = KCITY.stance(bo, ADG_SITE.bareGround, { maxDrop: 9.0 });
    y = st ? st.y : ADG_SITE.bareGround(S.x, S.z);
    drop = st && st.drop != null ? st.drop : 0;
    if (tier === 'rim' && y < ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0) {
     y = ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0;
    }
   }

   const lot = {
    id: P.lots.length,
    cls: S.underConstruction ? 'work' : 'landmark',
    role: S.role,
    zone: S.zone,
    tier: tier,
    kit: D.kit,
    rawKey: D.rawKey,
    key: D.qkey,
    v: S.v == null ? 0 : (S.v | 0),
    interiorId: S.interiorId || null,
    underConstruction: !!S.underConstruction,
    consProgress: S.consProgress == null ? 1.0 : S.consProgress,
    slot: 0,
    wealth: D.wealth,
    x: S.x,
    z: S.z,
    y: y,
    ry: S.ry,
    w: D.w,
    d: D.d,
    h: D.h,
    drop: drop,
    lot: bo,
    bo: bo,
    way: -1,
    side: 0,
    s: 0,
    born: 1,
    died: null,
    civic: !S.underConstruction
   };
   P.lots.push(lot);
   P.landmarks.push(lot);
   SLx.hashLot(lot);
   SLx.register(lot);
   SLx.R.stampPoly(K.obbCorners(K.obb([S.x, S.z], u, D.w * 0.5 + 3.0, D.d * 0.5 + 3.0)), K.OCC.HARD, lot.id);
   out.push(lot);
  }
  return out;
 }

 /* ================================================================ 3. KCITY Step Pipelines */
 function hkRimSteps(){
  const K = function(){ return KCITY.lib; };
  return [
   {
    name: 'hk_rim_ground_and_zone',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = ADG_SITE.ZONES[4].poly;
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 75.0, h: ADG_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
     stampStreamAndWellReserves(R, k.OCC);
    }
   },
   {
    name: 'hk_rim_landmarks',
    run: function(){
     placeLandmarks(HK_RIM_LANDMARKS, 'rim');
    }
   },
   {
    name: 'hk_rim_streets',
    run: function(){
     const S = K().SL;
     S.addWay('avenue', [[880, -820], [885, -625], [885, -485], [895, -340], [925, -140], [950, 55]], 3, { tag: 'Kopa-Diga Caldera-Brow Promenade' });
     S.addWay('main',   [[1035, -810], [1035, -610], [1035, -445], [1065, -340], [1065, -140], [1065, 55]], 3, { tag: 'Santa Cristina Chime-Spine Way' });
     S.addWay('main',   [[1210, -780], [1210, -560], [1205, -380], [1215, -195], [1215, 45]], 3, { tag: 'Nephrite Sawyers & Flume Terrace Way' });
     S.addWay('side',   [[1365, -750], [1365, -510], [1365, -280], [1365, -40]], 3, { tag: 'Upper Benihi Cloudforest Track' });
     S.addWay('side',   [[885, -665], [1035, -665], [1210, -665], [1365, -665]], 3, { tag: 'North Ossuary Cross-Steps' });
     S.addWay('side',   [[885, -505], [1035, -505], [1210, -505], [1365, -505]], 3, { tag: 'Nuraghe & Wire-Saw Cross-Steps' });
     S.addWay('side',   [[895, -320], [1065, -320], [1210, -320], [1365, -320]], 3, { tag: 'Santa Cristina Well-Court Steps' });
     S.addWay('side',   [[925, -195], [1065, -195], [1215, -195], [1365, -195]], 3, { tag: 'Benihi Mast-Flume Cross-Lane' });
     S.addWay('side',   [[940, -55],  [1065, -55],  [1215, -55],  [1355, -55]],  3, { tag: 'South Rim Charter Approach' });
    }
   },
   {
    name: 'hk_rim_chise_courts',
    run: function(){
     const blocks = [
      { id: 'hk_n1', i: 0, j: 0, kind: 'chise_mid',    lanes: true, poly: [[900, -800], [1020, -800], [1020, -680], [900, -680]] },
      { id: 'hk_n2', i: 1, j: 0, kind: 'chise_mid',    lanes: true, poly: [[1050, -800], [1195, -800], [1195, -680], [1050, -680]] },
      { id: 'hk_n3', i: 2, j: 0, kind: 'saw_terrace',  lanes: true, poly: [[1225, -770], [1350, -770], [1350, -680], [1225, -680]] },
      { id: 'hk_m1', i: 0, j: 1, kind: 'nuraghe_core', lanes: true, poly: [[945, -650], [1020, -650], [1020, -608], [945, -608]] },
      { id: 'hk_m2', i: 2, j: 1, kind: 'saw_terrace',  lanes: true, poly: [[1225, -650], [1350, -650], [1350, -555], [1225, -555]] },
      { id: 'hk_c1', i: 1, j: 2, kind: 'nuraghe_core', lanes: true, poly: [[1080, -455], [1195, -455], [1195, -390], [1080, -390]] },
      { id: 'hk_s1', i: 0, j: 3, kind: 'nuraghe_core', lanes: true, poly: [[935, -260], [1050, -260], [1050, -208], [935, -208]] },
      { id: 'hk_s2', i: 1, j: 3, kind: 'chise_mid',    lanes: true, poly: [[1080, -305], [1198, -305], [1198, -208], [1080, -208]] },
      { id: 'hk_s3', i: 2, j: 3, kind: 'saw_terrace',  lanes: true, poly: [[1230, -305], [1350, -305], [1350, -208], [1230, -208]] },
      { id: 'hk_f1', i: 0, j: 4, kind: 'chise_mid',    lanes: true, poly: [[945, -180], [1050, -180], [1050, -70],  [945, -70]] },
      { id: 'hk_f2', i: 1, j: 4, kind: 'chise_mid',    lanes: true, poly: [[1080, -180], [1198, -180], [1198, -70],  [1080, -70]] },
      { id: 'hk_f3', i: 0, j: 5, kind: 'nuraghe_core', lanes: true, poly: [[958, -40],  [1198, -40],  [1198, 42],   [958, 42]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 6.5,
      seed: SEED + 17,
      focus: [1035, -380],
      pools: HK_RIM_POOLS,
      small: HK_RIM_SMALL,
      gaps: { nuraghe_core: [3.0, 6.0], chise_mid: [2.5, 5.5], saw_terrace: [3.5, 7.0] },
      garden: { nuraghe_core: 0.10, chise_mid: 0.08, saw_terrace: 0.16 },
      infill: { step: 10.0, yard: 0.35 }
     });
    }
   }
  ];
 }

 function etCantonSteps(){
  const K = function(){ return KCITY.lib; };
  return [
   {
    name: 'et_canton_ground_and_zone',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = [[855, 85], [1465, 85], [1465, 855], [855, 855]];
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 75.0, h: ADG_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
    }
   },
   {
    name: 'et_canton_landmarks',
    run: function(){
     placeLandmarks(ET_CANTON_LANDMARKS, 'rim');
    }
   },
   {
    name: 'et_canton_streets',
    run: function(){
     const S = K().SL;
     /* East Wing Highway Portal Avenue straight through Z4 Dīga-Māketi Charter Market */
     S.addWay('highway', [[900, 210], [1020, 210], [1160, 210], [1245, 210]], 3, { tag: 'Arcodiga East Portal Charter Highway' });
     S.addWay('avenue',  [[965, 95],  [965, 210],  [965, 362],  [965, 525], [965, 760]], 3, { tag: 'Superintendency North-South Axis' });
     S.addWay('main',    [[1035, 355], [1035, 515], [1035, 685], [1035, 775]], 3, { tag: 'Censorate & Academy Street' });
     S.addWay('main',    [[1190, 355], [1190, 520], [1190, 650], [1190, 775]], 3, { tag: 'East Bastion & Villa Street' });
     S.addWay('side',    [[905, 355],  [1035, 355], [1190, 355], [1310, 355]], 3, { tag: 'Cantonment North Wall Way' });
     S.addWay('side',    [[905, 685],  [1035, 685], [1190, 685], [1320, 685]], 3, { tag: 'South Garrison & Kiln Way' });
     S.addWay('side',    [[915, 760],  [1035, 760], [1190, 760], [1310, 760]], 3, { tag: 'Outer Tea-Garden Lane' });
    }
   },
   {
    name: 'et_canton_blocks',
    run: function(){
     const blocks = [
      { id: 'z4_n',  i: 0, j: 0, kind: 'charter_plaza',   lanes: false, poly: [[980, 102], [1215, 102], [1215, 145], [980, 145]] },
      { id: 'z4_s',  i: 0, j: 1, kind: 'charter_plaza',   lanes: false, poly: [[980, 276], [1215, 276], [1215, 316], [980, 316]] },
      { id: 'z6_w1', i: 1, j: 0, kind: 'canton_clerk',    lanes: true,  poly: [[975, 552], [1026, 552], [1026, 628], [975, 628]] },
      { id: 'z6_g1', i: 1, j: 1, kind: 'canton_garrison', lanes: true,  poly: [[912, 696], [1026, 696], [1026, 752], [912, 752]] },
      { id: 'z6_g2', i: 2, j: 1, kind: 'canton_garrison', lanes: true,  poly: [[1045, 712], [1180, 712], [1180, 754], [1045, 754]] },
      { id: 'z6_e1', i: 3, j: 0, kind: 'canton_clerk',    lanes: true,  poly: [[1252, 365], [1345, 365], [1345, 495], [1252, 495]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 5.5,
      seed: SEED + 43,
      focus: [995, 505],
      pools: ET_CANTON_POOLS,
      small: ET_CANTON_SMALL,
      gaps: { charter_plaza: [2.5, 5.0], canton_clerk: [3.0, 6.0], canton_garrison: [2.0, 4.5] },
      garden: { charter_plaza: 0.05, canton_clerk: 0.14, canton_garrison: 0.08 },
      infill: { step: 8.5, yard: 0.32 }
     });
    }
   }
  ];
 }

 function coveWorksSteps(){
  const K = function(){ return KCITY.lib; };
  return [
   {
    name: 'cove_works_ground',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = ADG_SITE.ZONES[0].poly;
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 2.0, h: ADG_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
    }
   },
   {
    name: 'cove_works_landmarks',
    run: function(){
     placeLandmarks(COVE_WORKS_LANDMARKS, 'cove');
    }
   },
   {
    name: 'cove_works_ways',
    run: function(){
     const S = K().SL;
     S.addWay('main', [[596, -685], [596, -555], [596, -445]], 3, { tag: 'Kopa-North Lagoon Quay Front' });
     S.addWay('side', [[596, -625], [735, -625]], 3, { tag: 'North Hoist-Foot Sling Way' });
     S.addWay('side', [[596, -485], [735, -485]], 3, { tag: 'South Hoist-Foot Salvage Way' });
     S.addWay('main', [[368, 435], [478, 435], [588, 435]], 3, { tag: 'Dam-Lee Coaling & Mast Quay Way' });
    }
   }
  ];
 }

 /* ================================================================ 4. Continuous Pedestrian & Hoist Walk Graph */
 function buildWalkGraph(){
  const h = ADG_SITE.bareGround;
  const nodes = [
   { id: 'z1_lagoon_quay',     zone: 'Z1', x:  596, y: 6.0,                z: -555 },
   { id: 'z1_hoist_n_foot',    zone: 'Z1', x:  742, y: 5.5,                z: -625 },
   { id: 'z1_hoist_s_foot',    zone: 'Z1', x:  742, y: 5.6,                z: -485 },
   { id: 'z3_bulkhead_seal',   zone: 'Z3', x:   42, y: 81.0,               z:  210 },
   { id: 'z3_wing_hub_east',   zone: 'Z3', x:   92, y: 81.0,               z:  210 },
   { id: 'z3_wing_learning',   zone: 'Z3', x:  260, y: 81.0,               z:  210 },
   { id: 'z3_wing_mid_deck',   zone: 'Z3', x:  580, y: 81.0,               z:  210 },
   { id: 'z3_wing_east_portal',zone: 'Z3', x:  895, y: 81.0,               z:  210 },
   { id: 'z4_charter_plaza',   zone: 'Z4', x:  965, y: h(965, 210) + 0.2,  z:  210 },
   { id: 'z4_east_gate',       zone: 'Z4', x: 1150, y: h(1150, 210) + 0.2, z:  210 },
   { id: 'z5_south_rim',       zone: 'Z5', x:  965, y: h(965, -55) + 0.2,  z:  -55 },
   { id: 'z5_santa_cristina',  zone: 'Z5', x: 1035, y: h(1035, -340) + 0.2,z: -340 },
   { id: 'z5_hoist_s_head',    zone: 'Z5', x:  828, y: 152.0,              z: -485 },
   { id: 'z5_nuraghe_brow',    zone: 'Z5', x:  912, y: h(912, -520) + 0.2, z: -520 },
   { id: 'z5_hoist_n_head',    zone: 'Z5', x:  828, y: 146.0,              z: -625 },
   { id: 'z5_sawmill_terrace', zone: 'Z5', x: 1225, y: h(1225, -430) + 0.2,z: -430 },
   { id: 'z5_flume_terrace',   zone: 'Z5', x: 1225, y: h(1225, -130) + 0.2,z: -130 },
   { id: 'z6_north_gate',      zone: 'Z6', x:  965, y: h(965, 355) + 0.2,  z:  355 },
   { id: 'z6_clock_plaza',     zone: 'Z6', x:  965, y: h(965, 435) + 0.2,  z:  435 },
   { id: 'z6_lift_head',       zone: 'Z6', x:  865, y: 158.0,              z:  415 },
   { id: 'z6_ministry_court',  zone: 'Z6', x:  995, y: h(995, 525) + 0.2,  z:  525 },
   { id: 'z6_fort_parade',     zone: 'Z6', x: 1055, y: h(1055, 585) + 0.2, z:  585 },
   { id: 'z6_garrison_south',  zone: 'Z6', x: 1035, y: h(1035, 710) + 0.2, z:  710 },
   { id: 'z6_lift_foot',       zone: 'Z6', x:  592, y: 6.5,                z:  415 },
   { id: 'z6_lee_wharf',       zone: 'Z6', x:  478, y: 6.4,                z:  435 }
  ];

  const byId = {};
  for (let i = 0; i < nodes.length; i++) byId[nodes[i].id] = nodes[i];

  const pairs = [
   ['z1_lagoon_quay', 'z1_hoist_n_foot', 'quay'],
   ['z1_lagoon_quay', 'z1_hoist_s_foot', 'quay'],
   ['z1_hoist_n_foot', 'z5_hoist_n_head', 'hoist'],
   ['z1_hoist_s_foot', 'z5_hoist_s_head', 'hoist'],
   ['z5_hoist_n_head', 'z5_nuraghe_brow', 'street'],
   ['z5_hoist_s_head', 'z5_nuraghe_brow', 'street'],
   ['z5_nuraghe_brow', 'z5_santa_cristina', 'street'],
   ['z5_santa_cristina', 'z5_sawmill_terrace', 'street'],
   ['z5_santa_cristina', 'z5_flume_terrace', 'street'],
   ['z5_flume_terrace', 'z5_south_rim', 'street'],
   ['z5_santa_cristina', 'z5_south_rim', 'street'],
   ['z5_south_rim', 'z4_charter_plaza', 'avenue'],
   ['z4_charter_plaza', 'z4_east_gate', 'highway'],
   ['z4_charter_plaza', 'z3_wing_east_portal', 'ramp'],
   ['z3_wing_east_portal', 'z3_wing_mid_deck', 'highway'],
   ['z3_wing_mid_deck', 'z3_wing_learning', 'highway'],
   ['z3_wing_learning', 'z3_wing_hub_east', 'highway'],
   ['z3_wing_hub_east', 'z3_bulkhead_seal', 'highway'],
   ['z4_charter_plaza', 'z6_north_gate', 'avenue'],
   ['z6_north_gate', 'z6_clock_plaza', 'avenue'],
   ['z6_clock_plaza', 'z6_lift_head', 'street'],
   ['z6_clock_plaza', 'z6_ministry_court', 'avenue'],
   ['z6_ministry_court', 'z6_fort_parade', 'street'],
   ['z6_ministry_court', 'z6_garrison_south', 'street'],
   ['z6_lift_head', 'z6_lift_foot', 'hoist'],
   ['z6_lift_foot', 'z6_lee_wharf', 'quay']
  ];

  const edges = [];
  for (let i = 0; i < pairs.length; i++) {
   const a = byId[pairs[i][0]], b = byId[pairs[i][1]];
   const len = +Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z).toFixed(1);
   edges.push({ id: 'adg_edge_' + i, a: a.id, b: b.id, kind: pairs[i][2], len: len });
  }
  return { nodes: nodes, edges: edges, byId: byId };
 }

 /* ================================================================ 5. Build & Cross-Audit All 3 KCITY Plans */
 let _cached = null;

 function buildPlans(opt){
  if (_cached && !(opt && opt.fresh)) return _cached;

  if (typeof KRATOR_KITS !== 'undefined') {
   ADG_TUNE.installManifest(KRATOR_KITS);
  }

  const tagsReg = (opt && opt.tags)
   ? opt.tags
   : (typeof KTAGS !== 'undefined' ? (KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'arcodiga' }))) : null);

  const hkCity = KCITY.create({
   name: 'hk_rim',
   seed: SEED + 11,
   rand: 'krand',
   index: { order: 'insertion' },
   kit: { dims: ADG_TUNE.dimsOf },
   ground: ADG_SITE.ground,
   tune: makeTune(1750, 3.5, 'door', 8.5, 'hueru-kuran'),
   steps: hkRimSteps(),
   rules: {
    groundOk: function(bo){
     return ADG_SITE.minCornerElev(bo) >= 75.0 && ADG_SITE.maxCornerRelief(bo) <= 9.5;
    }
   },
   tags: tagsReg
  });

  const etCity = KCITY.create({
   name: 'et_cantonment',
   seed: SEED + 37,
   rand: 'krand',
   index: { order: 'insertion' },
   kit: { dims: ADG_TUNE.dimsOf },
   ground: ADG_SITE.ground,
   tune: makeTune(1750, 3.5, 'door', 8.5, 'eternian'),
   steps: etCantonSteps(),
   rules: {
    groundOk: function(bo){
     return ADG_SITE.minCornerElev(bo) >= 75.0 && ADG_SITE.maxCornerRelief(bo) <= 9.5;
    }
   },
   tags: tagsReg
  });

  const coveCity = KCITY.create({
   name: 'cove_works',
   seed: SEED + 73,
   rand: 'krand',
   index: { order: 'insertion' },
   kit: { dims: ADG_TUNE.dimsOf },
   ground: ADG_SITE.ground,
   tune: makeTune(1750, 4.0, 'high', 10.5, 'hueru-kuran'),
   steps: coveWorksSteps(),
   rules: {
    groundOk: function(bo, lot){
     if (lot && ADG_TUNE.isDwellingKey(lot.key)) return false;
     const lo = ADG_SITE.minCornerElev(bo);
     return lo >= 2.0 && lo <= 42.0 && ADG_SITE.maxCornerRelief(bo) <= 11.0;
    }
   },
   tags: tagsReg
  });

  const hkPlan = hkCity.run();
  const etPlan = etCity.run();
  const covePlan = coveCity.run();

  if (typeof KSPACE !== 'undefined' && KSPACE.reset) {
   KSPACE.reset();
  }

  const allLots = [];
  function collect(plan, instId, defaultZone){
   for (let i = 0; i < plan.lots.length; i++) {
    const L = plan.lots[i];
    if (L.died != null || !L.bo) continue;
    const dm = ADG_TUNE.dimsOf(L.key, L.v);
    if (!dm) continue;

    /* Enforce cross-instance OBB non-overlap */
    let clash = false;
    for (let j = 0; j < allLots.length; j++) {
     if (obbOverlap(L.bo, allLots[j].bo, 0.05)) {
      clash = true;
      break;
     }
    }
    if (clash) continue;

    let y = L.y;
    let drop = L.drop == null ? 0 : L.drop;
    if (y == null) {
     const st = KCITY.stance(L.bo, ADG_SITE.bareGround, { maxDrop: 9.0 });
     y = st ? st.y : ADG_SITE.bareGround(L.x, L.z);
     drop = st && st.drop != null ? st.drop : 0;
     if (instId !== 'cove_works' && y < ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0) {
      y = ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0;
     }
    }

    /* Guarantee zero permanent dwellings below +65.0 m */
    if (y < ADG_SITE.TSUNAMI_TRIMLINE_M && ADG_TUNE.isDwellingKey(dm.qkey)) continue;

    const zObj = ADG_SITE.zoneAt(L.x, L.z);
    const zoneId = L.zone || (zObj ? zObj.id : defaultZone);
    const uid = allLots.length;
    const rec = {
     id: uid,
     tag: 'adg_lot_' + uid,
     inst: instId,
     zone: zoneId,
     tier: instId === 'cove_works' ? 'cove' : 'rim',
     kit: dm.kit,
     rawKey: dm.rawKey,
     key: dm.qkey,
     v: L.v | 0,
     cls: L.cls || 'middle',
     role: L.role || dm.rawKey,
     civic: !!L.civic,
     interiorId: L.interiorId || null,
     underConstruction: !!L.underConstruction,
     consProgress: L.consProgress == null ? 1.0 : +L.consProgress.toFixed(3),
     x: +L.x.toFixed(2),
     y: +y.toFixed(2),
     z: +L.z.toFixed(2),
     ry: +L.ry.toFixed(4),
     w: dm.w,
     d: dm.d,
     h: dm.h,
     drop: +drop.toFixed(2),
     bo: L.bo
    };
    allLots.push(rec);
    if (typeof KSPACE !== 'undefined' && KSPACE.claimBox) {
     KSPACE.claimBox(rec.x, rec.z, rec.w * 0.5 + 1.0, rec.d * 0.5 + 1.0, rec.ry, 'building', rec.tag);
    }
   }
  }

  collect(hkPlan, 'hk_rim', 'Z5');
  collect(etPlan, 'et_cantonment', 'Z6');
  collect(covePlan, 'cove_works', 'Z1');

  const ways = []
   .concat((hkPlan.ways || []).map(function(w){ return { inst: 'hk_rim', kind: w.kind, w: w.w, pts: w.pts }; }))
   .concat((etPlan.ways || []).map(function(w){ return { inst: 'et_cantonment', kind: w.kind, w: w.w, pts: w.pts }; }))
   .concat((covePlan.ways || []).map(function(w){ return { inst: 'cove_works', kind: w.kind, w: w.w, pts: w.pts }; }));

  const walkGraph = buildWalkGraph();

  _cached = {
   hkPlan: hkPlan,
   etPlan: etPlan,
   covePlan: covePlan,
   lots: allLots,
   ways: ways,
   walkGraph: walkGraph,
   hkLots: allLots.filter(function(l){ return l.kit === 'hueru-kuran'; }),
   etLots: allLots.filter(function(l){ return l.kit === 'eternian'; }),
   coveLots: allLots.filter(function(l){ return l.tier === 'cove'; }),
   constructionLots: allLots.filter(function(l){ return l.underConstruction; })
  };
  return _cached;
 }

 function auditLots(lotsArg){
  const lots = lotsArg || buildPlans().lots;
  let overlaps = 0;
  let lowDwellings = 0;
  let minDwellingY = Infinity;
  const kitsUsed = {};

  for (let i = 0; i < lots.length; i++) {
   const a = lots[i];
   kitsUsed[a.kit] = (kitsUsed[a.kit] || 0) + 1;
   if (ADG_TUNE.isDwellingKey(a.key)) {
    if (a.y < minDwellingY) minDwellingY = a.y;
    if (a.y < ADG_SITE.TSUNAMI_TRIMLINE_M) lowDwellings++;
   }
   for (let j = i + 1; j < lots.length; j++) {
    if (obbOverlap(a.bo, lots[j].bo, 0.05)) overlaps++;
   }
  }
  return {
   ok: overlaps === 0 && lowDwellings === 0 && lots.length >= 110,
   lots: lots.length,
   overlaps: overlaps,
   lowDwellings: lowDwellings,
   minDwellingY: minDwellingY < 1e8 ? +minDwellingY.toFixed(2) : null,
   kitsUsed: kitsUsed
  };
 }

 return {
  HK_RIM_LANDMARKS: HK_RIM_LANDMARKS,
  ET_CANTON_LANDMARKS: ET_CANTON_LANDMARKS,
  COVE_WORKS_LANDMARKS: COVE_WORKS_LANDMARKS,
  obbOverlap: obbOverlap,
  buildWalkGraph: buildWalkGraph,
  buildPlans: buildPlans,
  auditLots: auditLots
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ADG_CITY;
