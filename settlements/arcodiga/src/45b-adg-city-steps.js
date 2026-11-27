// ================================================================= ARCODIGA — Dense Dual-Polity KCITY Layout & Arcology Clearance Audit [G data]
// Lays out Kōpa-Dīga / Dī-Gā Wài-Sī across three KCITY instances sharing KSPACE and KRATOR_KITS ('hueru-kuran' + 'eternian'):
//   1. 'hk_rim'        (Z5 Hueru-Kuran Caldera-Rim Town, +98..+205 m): densely clustered whale-rib Chise wards, Nuraghe Complesso,
//                      Santa Cristina drawdown step-well, water-powered nephrite wire-sawmills, benihi flume yards & 2 hoist heads.
//   2. 'et_cantonment' (Z4 Dīga-Māketi Charter Plaza east of x = 1032 + Z6 15-cell Eternian Hexagonal Honeycomb on ADG_HEX):
//                      zero streets or buildings inside ADG_SITE.inArcologyKeepout; hexagonal buildings aligned to 60-deg multiples.
//   3. 'cove_works'    (Z1 Lagoon Hoist-Foot Cove + NW Ocean Breach Splitters + SE Dam-Lee Farport Junk Quay, +5..+15 m):
//                      dense non-residential maritime & coaling works (strictly 0 dwellings < +65 m!).
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const ADG_CITY = (function(){
 const SEED = ADG_SITE.SEED;

 function makeTune(half, cell, stanceMode, maxDrop, defaultKit){
  const isEt = defaultKit === 'eternian';
  return {
   cell: cell,
   rasterHalf: half,
   maxSlope: 0.40,
   exact: true,
   width: { avenue: 9.5, main: 7.2, side: 5.4, alley: 3.6, highway: 11.5, lane: 3.8 },
   lot: { side: 0.8, setback: 0.9, rear: 1.6, inset: 0.6, step: 2.8 },
   classes: isEt ? {
    rich:   [['eternian:et_hex_villa', 0], ['eternian:et_merchant_house', 0], ['eternian:et_official_villa', 0]],
    middle: [['eternian:et_hex_house', 0], ['eternian:et_shophouse', 1], ['eternian:et_bakehouse', 1]],
    poor:   [['eternian:et_hex_hut', 0], ['eternian:et_block_hut', 0], ['eternian:et_reed_house', 0]]
   } : {
    rich:   [['hueru-kuran:hk_house_rich_whalelord', 0], ['hueru-kuran:hk_house_rich_clan', 0], ['hueru-kuran:hk_house_rich_steward', 0]],
    middle: [['hueru-kuran:hk_house_mid_carver', 0], ['hueru-kuran:hk_house_mid_harpooneer', 0], ['hueru-kuran:hk_house_mid_skipper', 0]],
    poor:   [['hueru-kuran:hk_house_poor_flenser', 0], ['hueru-kuran:hk_house_poor_kelper', 0], ['hueru-kuran:hk_house_poor_diver', 0]]
   },
   fallback: { rich: 'middle', middle: 'poor', poor: null },
   civic: [],
   civicSpacing: 80,
   voidMax: 28,
   voidIters: 0,
   voidBatch: 0,
   sideSpacing: 38,
   sideMax: 160,
   alleyFrac: 0.30,
   blindMax: 75,
   interiorDepth: 8,
   interiorRounds: 0,
   avenueSnap: 45,
   ringGap: 6,
   verge: 4,
   greens: ['garden'],
   wall: {},
   plazaArt: {},
   mapHalf: half,
   stance: stanceMode,
   stanceOpt: { maxDrop: maxDrop, cut: 5.5 }
  };
 }

 /* 2D Separating-Axis OBB intersection test */
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

 function obbTouchesArcology(bo, pad){
  const pts = ADG_SITE.obbCorners(bo);
  if (ADG_SITE.inArcologyKeepout(bo.c[0], bo.c[1], pad)) return true;
  for (let i = 0; i < pts.length; i++) {
   if (ADG_SITE.inArcologyKeepout(pts[i][0], pts[i][1], pad)) return true;
  }
  return false;
 }

 /* Stamp Arcodiga Dam & Stiffening Wing keepout into KCITY occupancy raster so no strategy or street enters it */
 function stampArcologyKeepout(R, OCC){
  const wingPoly = [[-1030, 138], [1030, 138], [1030, 306], [-1030, 306]];
  R.stampPoly(wingPoly, OCC.OUT, -9);
 }

 /* ================================================================ 1. Landmark & Trade Host Anchors */
 const HK_RIM_LANDMARKS = [
  { key: 'hueru-kuran:hk_nuraghe_complesso',   x:  912, z: -555, ry:  0.00, zone: 'Z5', role: 'Kopa-Diga Trilobate Basalt Nuraghe Complesso' },
  { key: 'hueru-kuran:hk_stepwell_sanctuary',  x: 1035, z: -395, ry:  0.00, zone: 'Z5', role: 'Santa Cristina 25-Min Ghost-Tsunami Chime-Well Sanctuary', interiorId: 'adg.vault.santa_cristina' },
  { key: 'hueru-kuran:hk_ukor_matron_lodge',   x:  992, z: -555, ry:  0.00, zone: 'Z5', role: 'Kuran-Ota Senior Whale-Clan Matron Lodge' },
  { key: 'hueru-kuran:hk_lore_hall',           x: 1022, z: -555, ry:  0.00, zone: 'Z5', role: 'Pelagic Swell-Stick & Tsunami Star-Lore Hall' },
  { key: 'hueru-kuran:hk_healer_lodge',        x: 1098, z: -555, ry:  0.00, zone: 'Z5', role: 'Deep-Water Decompression & Herbal Steam Lodge' },
  { key: 'hueru-kuran:hk_ossuary_barrow',      x: 1135, z: -792, ry:  0.18, zone: 'Z5', role: 'Whale-Jawbone Ancestor Ossuary Barrow' },
  { key: 'hueru-kuran:hk_beacon_nuraghe',      x:  852, z: -795, ry:  0.32, zone: 'Z5', role: 'North Caldera Whale-Oil Storm Beacon Nuraghe' },
  { key: 'hueru-kuran:hk_cliff_gatehouse',     x:  858, z: -435, ry:  1.57, zone: 'Z5', role: 'Hoist-Brow Basalt Cliff Gatehouse' },
  { key: 'hueru-kuran:hk_watch_barracks',      x:  908, z: -435, ry:  0.00, zone: 'Z5', role: 'Harpoon Cliff-Watch & Surge-Bell Barracks' },
  { key: 'hueru-kuran:hk_cliff_hoist',         x:  850, z: -625, ry: -1.57, zone: 'Z5', role: 'North 90s Water-Ballast Cliff-Hoist Headhouse' },
  { key: 'hueru-kuran:hk_cliff_hoist',         x:  850, z: -485, ry: -1.57, zone: 'Z5', role: 'South 90s Nephrite & Baidarka Cliff-Hoist Headhouse', v: 1 },
  { key: 'hueru-kuran:hk_jade_sawmill',        x: 1295, z: -428, ry: -0.08, zone: 'Z5', role: 'Upper Cascade Nephrite Pendulum Wire-Sawmill W' },
  { key: 'hueru-kuran:hk_jade_sawmill',        x: 1332, z: -434, ry: -0.08, zone: 'Z5', role: 'Upper Cascade Nephrite Pendulum Wire-Sawmill E', v: 1 },
  { key: 'hueru-kuran:hk_cypress_flume_yard',  x: 1298, z: -116, ry: -0.06, zone: 'Z5', role: 'Benihi Red-Cypress 30 m Mast-Flume Yard W' },
  { key: 'hueru-kuran:hk_cypress_flume_yard',  x: 1336, z: -122, ry: -0.06, zone: 'Z5', role: 'Benihi Red-Cypress Mast-Seasoning Shed E', v: 1 },
  { key: 'hueru-kuran:hk_jade_quarry',         x: 1478, z: -615, ry:  0.15, zone: 'Z5', role: 'Crookshore Emerald-Nephrite Boulder Quarry' },
  { key: 'hueru-kuran:hk_jade_quarry',         x: 1448, z: -335, ry: -0.12, zone: 'Z5', role: 'Quartz-Garnet Wire-Saw Abrasive Grit Quarry', v: 1 },
  { key: 'hueru-kuran:hk_kelp_glassworks',     x: 1192, z: -535, ry:  0.00, zone: 'Z5', role: 'Kelp-Soda Emerald Sea-Glass Pane Furnace' },
  { key: 'hueru-kuran:hk_kaen_kiln',           x: 1218, z: -535, ry:  0.00, zone: 'Z5', role: 'Flame-Rimmed Kaen-Doki Cord-Marked Pottery Kiln' },
  { key: 'hueru-kuran:hk_harpoon_smithy',      x: 1138, z: -535, ry:  0.00, zone: 'Z5', role: 'Salvaged-Alloy Harpoon & Saw-Wire Smithy' },
  { key: 'hueru-kuran:hk_baleen_loft',         x: 1112, z: -535, ry:  0.00, zone: 'Z5', role: 'Steamed Baleen-Spring & Sinew Cordage Loft' },
  { key: 'hueru-kuran:hk_smokehouse_saltery',  x: 1102, z: -612, ry:  0.00, zone: 'Z5', role: 'Driftwood Whale-Meat & Salmon Smokehouse' },
  { key: 'hueru-kuran:hk_bakehouse',           x: 1024, z: -612, ry:  0.00, zone: 'Z5', role: 'Kelp-Meal & Barley Flatbread Bakehouse' },
  { key: 'hueru-kuran:hk_sealhide_tailor',     x:  998, z: -612, ry:  0.00, zone: 'Z5', role: 'Oiled Sea-Mammal Gutskin & Elm-Bark Parka Tailor' },
  { key: 'hueru-kuran:hk_brew_kelp',           x:  932, z: -612, ry:  0.00, zone: 'Z5', role: 'Cloudberry & Roasted-Kelp Fermenting House' },
  { key: 'hueru-kuran:hk_granary_nuraghe',     x: 1098, z: -365, ry:  0.00, zone: 'Z5', role: 'Corbelled Basalt Tsunami-Reserve Granary Tower' },
  { key: 'hueru-kuran:hk_warehouse_vault',     x:  905, z: -625, ry:  0.00, zone: 'Z5', role: 'North Hoist-Head Sawn-Nephrite & Oil Vault' },
  { key: 'hueru-kuran:hk_inn_terrace',         x:  992, z: -305, ry:  0.00, zone: 'Z5', role: 'Caldera-Overlook Pack-Train & Whalers Terrace Inn' },
  { key: 'hueru-kuran:hk_market_terrace',      x: 1024, z: -305, ry:  0.00, zone: 'Z5', role: 'Santa Cristina Rim Provisioning Market Terrace' },
  { key: 'hueru-kuran:hk_house_rich_whalelord',x:  918, z: -348, ry:  0.04, zone: 'Z5', role: 'First Harpoon Whale-Lord Chise Compound' },
  { key: 'hueru-kuran:hk_terrace_croft',       x: 1405, z: -725, ry:  0.05, zone: 'Z5', role: 'Kelp-Mulched Sea-Kale & Tuber Wind-Wall Croft N' },
  { key: 'hueru-kuran:hk_terrace_croft',       x: 1435, z: -245, ry: -0.05, zone: 'Z5', role: 'Kelp-Mulched Sea-Kale & Duck Wind-Wall Croft S', v: 1 }
 ];

 /* Z4 Dīga-Māketi East Highway Charter Plaza — strictly east of x = 1042 m (zero overlap with x <= 1022 East Wing!) */
 const Z4_CHARTER_LANDMARKS = [
  { key: 'eternian:et_customs_house',      x: 1076, z: 236, ry: Math.PI, zone: 'Z4', role: 'Eternal State Charter Assay & Timber Tally House' },
  { key: 'hueru-kuran:hk_ukor_council',    x: 1076, z: 182, ry: 0.0000,  zone: 'Z4', role: 'Ukor Joint Chime-Court & Truce Arbitration Hall' },
  { key: 'hueru-kuran:hk_jade_exchange',   x: 1106, z: 182, ry: 0.0000,  zone: 'Z4', role: 'Diga-Maketi Nephrite & Relic Assay Exchange' },
  { key: 'hueru-kuran:hk_embassy_hayrant', x: 1134, z: 182, ry: 0.0000,  zone: 'Z4', role: 'Hayrant Sister-Clan & Dzagh-Vardzi Truce Legation' },
  { key: 'hueru-kuran:hk_tavern_whale',    x: 1162, z: 182, ry: 0.0000,  zone: 'Z4', role: 'Blubber-Lamp Mariners & Salvagers Charter Tavern' },
  { key: 'eternian:et_tea_house',          x: 1106, z: 236, ry: Math.PI, zone: 'Z4', role: 'Painted Clerks & Factors Charter Hex Tea Pavilion' },
  { key: 'eternian:et_inn',                x: 1138, z: 238, ry: Math.PI, zone: 'Z4', role: 'East Portal Courier & Mule-Train Post-Inn' },
  { key: 'eternian:et_market_hall',        x: 1242, z: 180, ry: 0.0000,  zone: 'Z4', role: 'Charter North Hexagonal Silk & Almanac Bourse' },
  { key: 'hueru-kuran:hk_warehouse_vault', x: 1282, z: 182, ry: 0.0000,  zone: 'Z4', role: 'Charter North Nephrite Transit Vault (Under Construction)', underConstruction: true, consProgress: 0.46 },
  { key: 'eternian:et_warehouse',          x: 1282, z: 238, ry: Math.PI, zone: 'Z4', role: 'Charter South Timber & Tin Bonded Store (Under Construction)', underConstruction: true, consProgress: 0.58 }
 ];

 /* Dense non-residential coastal works (< +65 m: strictly 0 permanent dwellings!) */
 const COVE_WORKS_LANDMARKS = [
  /* Z1: Sheltered East Lagoon Hoist-Foot & Baidarka Maritime Quarter (+5..+14 m) */
  { key: 'hueru-kuran:hk_crater_quay',       x:  582, z: -648, ry: -1.5708, zone: 'Z1', role: 'North Lagoon Whaleboat & Nephrite Quay', y: 5.3 },
  { key: 'hueru-kuran:hk_crater_quay',       x:  582, z: -598, ry: -1.5708, zone: 'Z1', role: 'Mid-North Lagoon Baidarka Slip Quay', y: 5.4, v: 1 },
  { key: 'hueru-kuran:hk_ferry_causeway',    x:  578, z: -555, ry: -1.5708, zone: 'Z1', role: 'Caldera Lagoon Cross-Basin Ferry Causeway', y: 5.2 },
  { key: 'hueru-kuran:hk_crater_quay',       x:  582, z: -512, ry: -1.5708, zone: 'Z1', role: 'Mid-South Lagoon Dive-Tender Quay', y: 5.4 },
  { key: 'hueru-kuran:hk_crater_quay',       x:  582, z: -468, ry: -1.5708, zone: 'Z1', role: 'South Lagoon Salvage-Ark Quay', y: 5.5, v: 1 },
  { key: 'hueru-kuran:hk_baidarka_yard',     x:  632, z: -582, ry: -1.5708, zone: 'Z1', role: 'Oiled-Skin Baidarka & Outrigger Boatyard N', y: 7.4 },
  { key: 'hueru-kuran:hk_baidarka_yard',     x:  632, z: -528, ry: -1.5708, zone: 'Z1', role: 'Salvage-Tender & Keel Framing Yard S', y: 7.5, v: 1 },
  { key: 'hueru-kuran:hk_blubber_tryworks',  x:  636, z: -662, ry:  0.0000, zone: 'Z1', role: 'Downwind Lagoon Shore Whale-Blubber Tryworks W', y: 7.8 },
  { key: 'hueru-kuran:hk_blubber_tryworks',  x:  676, z: -662, ry:  0.0000, zone: 'Z1', role: 'Downwind Lagoon Shore Whale-Blubber Tryworks E', y: 9.2, v: 1 },
  { key: 'hueru-kuran:hk_smokehouse_saltery',x:  636, z: -452, ry:  3.1416, zone: 'Z1', role: 'Lagoon Catch Saltery & Cask-Packing Shed', y: 7.6 },
  { key: 'hueru-kuran:hk_baleen_loft',       x:  676, z: -555, ry: -1.5708, zone: 'Z1', role: 'Hoist-Apron Baleen & Salvage-Cable Rigging Loft', y: 9.2 },
  { key: 'hueru-kuran:hk_harpoon_smithy',    x:  676, z: -512, ry: -1.5708, zone: 'Z1', role: 'Dive-Helmet & Grapnel Anchor Forge', y: 9.3 },
  { key: 'hueru-kuran:hk_warehouse_vault',   x:  714, z: -625, ry: -1.5708, zone: 'Z1', role: 'North Hoist-Foot Rapid-Sling Oil & Baleen Shed', y: 10.8 },
  { key: 'hueru-kuran:hk_warehouse_vault',   x:  714, z: -582, ry: -1.5708, zone: 'Z1', role: 'Mid Hoist-Foot Sawn-Nephrite Crate Vault', y: 10.8, v: 1 },
  { key: 'hueru-kuran:hk_warehouse_vault',   x:  714, z: -485, ry: -1.5708, zone: 'Z1', role: 'South Hoist-Foot Ancient-Alloy Dive-Salvage Shed', y: 10.9 },
  { key: 'hueru-kuran:hk_granary_nuraghe',   x:  714, z: -532, ry: -1.5708, zone: 'Z1', role: 'Watertight Basalt Tackle & Ballast Silo', y: 10.8 },
  { key: 'hueru-kuran:hk_prou_torre',        x:  572, z: -688, ry: -1.2500, zone: 'Z1', role: 'Lagoon Surge-Gauge & Boom-Chain Prou Torre N', y: 6.2 },
  { key: 'hueru-kuran:hk_prou_torre',        x:  572, z: -432, ry: -1.8500, zone: 'Z1', role: 'South Cove Signal & Capstan Prou Torre S', y: 6.3, v: 1 },

  /* NW Ocean Breach Whale-Jawbone Wave-Splitter Breakwaters (+6..+15 m) */
  { key: 'hueru-kuran:hk_wave_splitter',     x: -1065, z: -1215, ry: -0.78, zone: 'Z1', role: 'Outer NW Breach Whale-Jawbone Basalt Wave-Splitter W', y: 6.4 },
  { key: 'hueru-kuran:hk_wave_splitter',     x:  -985, z: -1145, ry: -0.78, zone: 'Z1', role: 'Mid NW Breach Whale-Jawbone Basalt Wave-Splitter M', y: 7.8, v: 1 },
  { key: 'hueru-kuran:hk_wave_splitter',     x:  -905, z: -1075, ry: -0.78, zone: 'Z1', role: 'Inner NW Breach Whale-Jawbone Basalt Wave-Splitter E', y: 9.2 },
  { key: 'hueru-kuran:hk_prou_torre',        x:  -842, z: -1022, ry: -0.78, zone: 'Z1', role: 'NW Breach Swell-Watch & Tsunami Horn Prou Torre', y: 11.4 }
  /* Z6_WHARF: the hexagonal harbour mole is planned by ADG_HEX.buildMoleNet (45a) */
 ];

 /* ================================================================ 2. Dense Strategy Pools */
 const HK_RIM_POOLS = {
  nuraghe_core: [
   ['hueru-kuran:hk_house_rich_whalelord', 2], ['hueru-kuran:hk_house_rich_clan', 3], ['hueru-kuran:hk_house_rich_steward', 3],
   ['hueru-kuran:hk_house_mid_skipper', 5], ['hueru-kuran:hk_house_mid_harpooneer', 5], ['hueru-kuran:hk_market_terrace', 2],
   ['hueru-kuran:hk_bakehouse', 1], ['hueru-kuran:hk_sealhide_tailor', 1], ['hueru-kuran:hk_brew_kelp', 1]
  ],
  chise_mid: [
   ['hueru-kuran:hk_house_mid_carver', 5], ['hueru-kuran:hk_house_mid_harpooneer', 5], ['hueru-kuran:hk_house_mid_skipper', 4],
   ['hueru-kuran:hk_house_poor_diver', 4], ['hueru-kuran:hk_house_poor_kelper', 4], ['hueru-kuran:hk_house_poor_flenser', 4],
   ['hueru-kuran:hk_smokehouse_saltery', 1], ['hueru-kuran:hk_bakehouse', 1]
  ],
  saw_terrace: [
   ['hueru-kuran:hk_house_mid_carver', 5], ['hueru-kuran:hk_house_poor_flenser', 4], ['hueru-kuran:hk_house_poor_kelper', 4],
   ['hueru-kuran:hk_terrace_croft', 2], ['hueru-kuran:hk_baleen_loft', 2], ['hueru-kuran:hk_harpoon_smithy', 2]
  ]
 };

 const HK_RIM_SMALL = {
  nuraghe_core: [['hueru-kuran:hk_house_poor_flenser', 3], ['hueru-kuran:hk_house_poor_kelper', 3]],
  chise_mid:    [['hueru-kuran:hk_house_poor_flenser', 4], ['hueru-kuran:hk_house_poor_kelper', 4]],
  saw_terrace:  [['hueru-kuran:hk_house_poor_flenser', 4], ['hueru-kuran:hk_house_poor_kelper', 3]]
 };

 const Z4_CHARTER_POOLS = {
  charter_plaza: [
   ['eternian:et_shophouse', 4], ['eternian:et_merchant_house', 3], ['eternian:et_hex_house', 3],
   ['hueru-kuran:hk_house_mid_carver', 2], ['hueru-kuran:hk_house_mid_skipper', 2], ['eternian:et_printer', 1]
  ]
 };

 const Z4_CHARTER_SMALL = {
  charter_plaza: [['eternian:et_hex_hut', 3], ['eternian:et_shophouse', 3]]
 };

 function stampStreamAndWellReserves(R, OCC){
  const sc = ADG_SITE.SANTA_CRISTINA;
  const wellPoly = [];
  for (let k = 0; k < 12; k++) {
   const a = (k / 12) * Math.PI * 2;
   wellPoly.push([sc.x + Math.cos(a) * 13.5, sc.z + Math.sin(a) * 13.5]);
  }
  R.stampPoly(wellPoly, OCC.GREEN, -2);

  for (let i = 0; i < ADG_SITE.STREAMS.length; i++) {
   const st = ADG_SITE.STREAMS[i];
   for (let j = 0; j < st.pts.length - 1; j++) {
    R.eachNearSeg(st.pts[j], st.pts[j + 1], 8.0, function(idx){ R.occ[idx] = OCC.GREEN; });
   }
   if (st.basin) {
    const bp = [];
    for (let k = 0; k < 12; k++) {
     const a = (k / 12) * Math.PI * 2;
     bp.push([st.basin.x + Math.cos(a) * (st.basin.r + 4.0), st.basin.z + Math.sin(a) * (st.basin.r + 4.0)]);
    }
    R.stampPoly(bp, OCC.GREEN, -3);
   }
  }
 }

 function placeLandmarks(spec, tier, stampPad){
  const K = KCITY.lib, SLx = K.SL, P = K.plan(), out = [];
  const padM = stampPad == null ? 1.2 : stampPad;
  for (let i = 0; i < spec.length; i++) {
   const S = spec[i];
   const D = ADG_TUNE.dimsOf(S.key, S.v == null ? 0 : S.v);
   if (!D) continue;
   const u = [Math.cos(S.ry), -Math.sin(S.ry)];
   const bo = K.obb([S.x, S.z], u, D.w * 0.5, D.d * 0.5);

   /* Guarantee zero arcology clipping & zero OBB overlap */
   if (obbTouchesArcology(bo, 3.0)) continue;
   let clash = false;
   for (let j = 0; j < P.lots.length; j++) {
    if (P.lots[j].died == null && obbOverlap(bo, P.lots[j].bo, 0.05)) {
     clash = true;
     break;
    }
   }
   if (clash) continue;

   let y = S.y;
   let drop = 0;
   if (y == null) {
    const st = KCITY.stance(bo, ADG_SITE.bareGround, { maxDrop: 9.5 });
    y = st ? st.y : ADG_SITE.bareGround(S.x, S.z);
    drop = st && st.drop != null ? st.drop : 0;
    if (tier === 'rim' && y < ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0) {
     y = ADG_SITE.TSUNAMI_TRIMLINE_M + 10.0;
    }
   }

   const lot = {
    id: P.lots.length,
    cls: S.underConstruction ? 'work' : (S.hexAligned ? 'middle' : 'landmark'),
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
    civic: !S.underConstruction && (D.family === 'civic' || D.family === 'sacred' || D.family === 'market')
   };
   P.lots.push(lot);
   P.landmarks.push(lot);
   SLx.hashLot(lot);
   SLx.register(lot);
   SLx.R.stampPoly(K.obbCorners(K.obb([S.x, S.z], u, D.w * 0.5 + padM, D.d * 0.5 + padM)), K.OCC.HARD, lot.id);
   out.push(lot);
  }
  return out;
 }

 /* Deterministic Chise Clan-Cluster Infill inside Z5 Hueru-Kuran Rim blocks so no wide gravel voids remain */
 function fillHkBlocksTight(blocks){
  const K = KCITY.lib, P = K.plan(), R = K.SL.R;
  const candKeys = [
   'hueru-kuran:hk_house_mid_carver',
   'hueru-kuran:hk_house_mid_harpooneer',
   'hueru-kuran:hk_house_poor_diver',
   'hueru-kuran:hk_house_poor_kelper',
   'hueru-kuran:hk_house_poor_flenser'
  ];
  const specs = [];
  for (let bi = 0; bi < blocks.length; bi++) {
   const B = blocks[bi];
   let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
   for (let k = 0; k < B.poly.length; k++) {
    x0 = Math.min(x0, B.poly[k][0]); x1 = Math.max(x1, B.poly[k][0]);
    z0 = Math.min(z0, B.poly[k][1]); z1 = Math.max(z1, B.poly[k][1]);
   }
   for (let gz = z0 + 9; gz <= z1 - 9; gz += 16.5) {
    for (let gx = x0 + 9; gx <= x1 - 9; gx += 18.0) {
     const h1 = KRAND.unit(KRAND.hash(SEED ^ 0x51a7, bi, gx | 0, gz | 0));
     const h2 = KRAND.unit(KRAND.hash(SEED ^ 0x51a8, bi, gz | 0, gx | 0));
     const x = gx + (h1 - 0.5) * 3.0;
     const z = gz + (h2 - 0.5) * 2.5;
     if (!ADG_SITE.inPoly(x, z, B.poly)) continue;
     if (ADG_SITE.inArcologyKeepout(x, z, 6.0)) continue;
     const idx = R.idx(x, z);
     if (idx >= 0 && R.occ[idx] !== 0) continue;
     const pick = candKeys[(bi + ((gx / 18) | 0) + ((gz / 16) | 0)) % candKeys.length];
     const ry = (h1 < 0.25 ? 0 : h1 < 0.5 ? Math.PI : h1 < 0.75 ? Math.PI * 0.5 : -Math.PI * 0.5);
     specs.push({ key: pick, x: x, z: z, ry: ry, zone: 'Z5', role: 'Kopa-Diga Chise Clan Dwelling' });
    }
   }
  }
  if (specs.length && P) placeLandmarks(specs, 'rim', 0.8);
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
     stampArcologyKeepout(R, k.OCC);
    }
   },
   {
    name: 'hk_rim_landmarks',
    run: function(){
     placeLandmarks(HK_RIM_LANDMARKS, 'rim', 1.2);
    }
   },
   {
    name: 'hk_rim_streets',
    run: function(){
     const S = K().SL;
     /* North-South Rim Terraces — west of x=1040 terminates cleanly at z=+112 (50 m north of East Wing!),
        while x=1058 & x=1205 avenues continue east of the x=1020 Wing bulkhead straight into Z4 Charter Plaza! */
     S.addWay('avenue', [[878, -825], [882, -640], [882, -485], [892, -335], [915, -155], [935, 112]], 3, { tag: 'Kopa-Diga Caldera-Brow Promenade' });
     S.addWay('main',   [[965, -815], [965, -640], [965, -495], [968, -335], [975, -155], [985, 112]], 3, { tag: 'Nuraghe & Clan-Matron Spine' });
     S.addWay('avenue', [[1058, -815], [1058, -640], [1058, -485], [1062, -335], [1058, -155], [1058, 95]], 3, { tag: 'Santa Cristina Chime-Way (East of Wing)' });
     S.addWay('main',   [[1165, -800], [1165, -640], [1165, -485], [1165, -335], [1165, -155], [1205, 95]], 3, { tag: 'Baleen & Glassmakers Terrace Way' });
     S.addWay('main',   [[1268, -785], [1268, -640], [1268, -485], [1268, -335], [1268, -155], [1268, 88]], 3, { tag: 'Nephrite Sawyers & Flume Way' });
     S.addWay('side',   [[1375, -760], [1375, -560], [1375, -335], [1375, -155], [1375, 75]], 3, { tag: 'Upper Benihi Cloudforest Track' });

     /* Dense East-West Cross-Steps every ~85-100 m */
     S.addWay('side', [[878, -810], [1058, -810], [1268, -810]], 3, { tag: 'North Beacon Cross-Steps' });
     S.addWay('side', [[882, -725], [1058, -725], [1268, -725], [1375, -725]], 3, { tag: 'Ossuary & Croft Steps' });
     S.addWay('main', [[882, -640], [1058, -640], [1268, -640], [1375, -640]], 3, { tag: 'North Hoist & Bakehouse Way' });
     S.addWay('side', [[882, -575], [1058, -575], [1268, -575], [1375, -575]], 3, { tag: 'Nuraghe Court Cross-Lane' });
     S.addWay('main', [[882, -502], [1058, -502], [1268, -502], [1375, -502]], 3, { tag: 'South Hoist & Wire-Saw Way' });
     S.addWay('side', [[888, -418], [1058, -418], [1205, -418]], 3, { tag: 'Cliff-Gate & Well North Steps' });
     S.addWay('main', [[892, -332], [1062, -332], [1268, -332], [1375, -332]], 3, { tag: 'Santa Cristina Well-Court Way' });
     S.addWay('side', [[905, -242], [1060, -242], [1268, -242], [1375, -242]], 3, { tag: 'Mid-Rim Carvers Cross-Lane' });
     S.addWay('main', [[915, -155], [1058, -155], [1215, -155]], 3, { tag: 'Benihi Mast-Flume Cross-Way' });
     S.addWay('side', [[925,  -62], [1058,  -62], [1268,  -62], [1375,  -62]], 3, { tag: 'South Rim Terrace Steps' });
     S.addWay('side', [[932,   28], [1058,   28], [1268,   28], [1375,   28]], 3, { tag: 'Charter North Collar Way' });
     S.addWay('side', [[935,  112], [1058,  112]], 3, { tag: 'North Wing-Clearance Promenade' });
    }
   },
   {
    name: 'hk_rim_chise_courts',
    run: function(){
     const blocks = [
      { id: 'hk_b01', i: 0, j: 0, kind: 'chise_mid',    lanes: true, poly: [[890, -802], [956, -802], [956, -733], [890, -733]] },
      { id: 'hk_b02', i: 1, j: 0, kind: 'chise_mid',    lanes: true, poly: [[974, -802], [1049, -802], [1049, -733], [974, -733]] },
      { id: 'hk_b03', i: 2, j: 0, kind: 'saw_terrace',  lanes: true, poly: [[1174, -792], [1259, -792], [1259, -733], [1174, -733]] },
      { id: 'hk_b04', i: 0, j: 1, kind: 'chise_mid',    lanes: true, poly: [[890, -717], [956, -717], [956, -648], [890, -648]] },
      { id: 'hk_b05', i: 1, j: 1, kind: 'nuraghe_core', lanes: true, poly: [[974, -717], [1049, -717], [1049, -648], [974, -648]] },
      { id: 'hk_b06', i: 2, j: 1, kind: 'chise_mid',    lanes: true, poly: [[1067, -717], [1156, -717], [1156, -648], [1067, -648]] },
      { id: 'hk_b07', i: 3, j: 1, kind: 'saw_terrace',  lanes: true, poly: [[1174, -717], [1259, -717], [1259, -648], [1174, -648]] },
      { id: 'hk_b08', i: 4, j: 1, kind: 'saw_terrace',  lanes: true, poly: [[1277, -717], [1366, -717], [1366, -648], [1277, -648]] },

      /* Central Nuraghe, Matron, Kiln & Santa Cristina Wards (previously empty!) */
      { id: 'hk_b09', i: 2, j: 2, kind: 'nuraghe_core', lanes: true, poly: [[1067, -632], [1156, -632], [1156, -582], [1067, -582]] },
      { id: 'hk_b10', i: 3, j: 2, kind: 'saw_terrace',  lanes: true, poly: [[1174, -632], [1259, -632], [1259, -582], [1174, -582]] },
      { id: 'hk_b11', i: 4, j: 2, kind: 'saw_terrace',  lanes: true, poly: [[1277, -632], [1366, -632], [1366, -510], [1277, -510]] },
      { id: 'hk_b12', i: 1, j: 3, kind: 'nuraghe_core', lanes: true, poly: [[974, -538], [1049, -538], [1049, -509], [974, -509]] },
      { id: 'hk_b13a',i: 0, j: 4, kind: 'nuraghe_core', lanes: true, poly: [[895, -494], [956, -494], [956, -452], [895, -452]] },
      { id: 'hk_b13', i: 1, j: 4, kind: 'nuraghe_core', lanes: true, poly: [[974, -494], [1049, -494], [1049, -426], [974, -426]] },
      { id: 'hk_b14', i: 2, j: 4, kind: 'nuraghe_core', lanes: true, poly: [[1067, -494], [1156, -494], [1156, -426], [1067, -426]] },
      { id: 'hk_b15', i: 0, j: 5, kind: 'nuraghe_core', lanes: true, poly: [[898, -410], [958, -410], [958, -340], [898, -340]] },
      { id: 'hk_b15b',i: 1, j: 5, kind: 'nuraghe_core', lanes: true, poly: [[974, -410], [1016, -410], [1016, -340], [974, -340]] },
      { id: 'hk_b16', i: 2, j: 5, kind: 'nuraghe_core', lanes: true, poly: [[1070, -410], [1156, -410], [1156, -340], [1070, -340]] },
      { id: 'hk_b17', i: 3, j: 5, kind: 'saw_terrace',  lanes: true, poly: [[1174, -410], [1259, -410], [1259, -340], [1174, -340]] },

      /* Southern Rim & Flume Wards */
      { id: 'hk_b18', i: 0, j: 6, kind: 'nuraghe_core', lanes: true, poly: [[902, -324], [960, -324], [960, -250], [902, -250]] },
      { id: 'hk_b19', i: 2, j: 6, kind: 'chise_mid',    lanes: true, poly: [[1070, -324], [1156, -324], [1156, -250], [1070, -250]] },
      { id: 'hk_b20', i: 3, j: 6, kind: 'saw_terrace',  lanes: true, poly: [[1174, -324], [1259, -324], [1259, -250], [1174, -250]] },
      { id: 'hk_b21', i: 4, j: 6, kind: 'saw_terrace',  lanes: true, poly: [[1277, -324], [1366, -324], [1366, -250], [1277, -250]] },
      { id: 'hk_b22', i: 0, j: 7, kind: 'chise_mid',    lanes: true, poly: [[912, -234], [966, -234], [966, -163], [912, -163]] },
      { id: 'hk_b23', i: 1, j: 7, kind: 'chise_mid',    lanes: true, poly: [[982, -234], [1050, -234], [1050, -163], [982, -163]] },
      { id: 'hk_b24', i: 2, j: 7, kind: 'chise_mid',    lanes: true, poly: [[1067, -234], [1156, -234], [1156, -163], [1067, -163]] },
      { id: 'hk_b25', i: 0, j: 8, kind: 'chise_mid',    lanes: true, poly: [[922, -147], [972, -147], [972, -70],  [922, -70]] },
      { id: 'hk_b26', i: 1, j: 8, kind: 'chise_mid',    lanes: true, poly: [[986, -147], [1050, -147], [1050, -70],  [986, -70]] },
      { id: 'hk_b27', i: 2, j: 8, kind: 'chise_mid',    lanes: true, poly: [[1067, -147], [1156, -147], [1156, -70],  [1067, -70]] },
      { id: 'hk_b28', i: 0, j: 9, kind: 'nuraghe_core', lanes: true, poly: [[930,  -54], [1050,  -54], [1050,  20],  [930,  20]] },
      { id: 'hk_b29', i: 2, j: 9, kind: 'chise_mid',    lanes: true, poly: [[1067,  -54], [1156,  -54], [1156,  20],  [1067,  20]] },
      { id: 'hk_b30', i: 3, j: 9, kind: 'saw_terrace',  lanes: true, poly: [[1174,  -54], [1259,  -54], [1259,  20],  [1174,  20]] },
      { id: 'hk_b31', i: 0, j: 10,kind: 'nuraghe_core', lanes: true, poly: [[936,   36], [1050,   36], [1050, 104],  [936, 104]] },
      { id: 'hk_b32', i: 2, j: 10,kind: 'nuraghe_core', lanes: true, poly: [[1067,   36], [1192,   36], [1192,  86],  [1067,  86]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 3.6,
      seed: SEED + 17,
      focus: [1035, -380],
      pools: HK_RIM_POOLS,
      small: HK_RIM_SMALL,
      gaps: { nuraghe_core: [1.0, 2.4], chise_mid: [0.9, 2.2], saw_terrace: [1.2, 2.8] },
      garden: { nuraghe_core: 0.03, chise_mid: 0.03, saw_terrace: 0.05 },
      infill: { step: 5.8, yard: 0.14 }
     });
     fillHkBlocksTight(blocks);
    }
   }
  ];
 }

 function etCantonSteps(){
  const K = function(){ return KCITY.lib; };
  const hexNet = ADG_HEX.buildHexWaysAndPlazas();
  return [
   {
    name: 'et_canton_ground_and_zone',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = [[865, 95], [1565, 95], [1565, 885], [1045, 885], [865, 560], [865, 314], [1032, 314], [1032, 95]];
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 75.0, h: ADG_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
     stampArcologyKeepout(R, k.OCC);
    }
   },
   {
    name: 'et_canton_charter_landmarks',
    run: function(){
     placeLandmarks(Z4_CHARTER_LANDMARKS, 'rim', 1.0);
    }
   },
   {
    name: 'et_canton_hex_and_charter_streets',
    run: function(){
     const S = K().SL;
     /* 1. Z4 Dīga-Māketi Charter Boulevard — begins at x = 1034 m right outside the x = 1020 East Wing Portal Gatehouse! */
     S.addWay('highway', [[1034, 210], [1120, 210], [1205, 210], [1315, 210], [1425, 210]], 3, { tag: 'Arcodiga East Portal Charter Highway' });
     S.addWay('main',    [[1058, 148], [1205, 148], [1365, 148]], 3, { tag: 'Charter North Assay Arcade' });
     S.addWay('main',    [[1058, 272], [1205, 272], [1365, 272]], 3, { tag: 'Charter South Bonded Arcade' });
     S.addWay('avenue',  [[1058,  95], [1058, 210], [1058, 322]], 3, { tag: 'Portal Forecourt Cross-Avenue (East of Wing)' });
     S.addWay('avenue',  [[1205,  95], [1205, 210], [1205, 312.5]], 3, { tag: 'Charter-to-Superintendency Spine Avenue' });
     S.addWay('side',    [[1315, 108], [1315, 210], [1315, 298]], 3, { tag: 'East Charter Mule-Train Way' });

     /* 2. Z6 Dī-Gā Wài-Sī True 6-Fold Hexagonal Honeycomb Street Network */
     for (let i = 0; i < hexNet.ways.length; i++) {
      const hw = hexNet.ways[i];
      S.addWay(hw.kind, hw.pts, 3, { tag: hw.tag });
     }

     /* 3. West Gorge-Brow Girder-Lift Viaduct Avenue, Cliff-Rim Boulevard to Harbour Switchback & East Skarn Mine Tracks */
     S.addWay('main', [[866, 415], [925, 415], [981, 458]], 3, { tag: 'Girder-Lift Headhouse & Tube-Station Avenue' });
     S.addWay('main', [[866, 415], [868, 472], [870, 525], [981, 555]], 3, { tag: 'Gorge-Rim Cliff Boulevard to Harbour Switchback' });
     S.addWay('side', [[1429, 458], [1472, 495]], 3, { tag: 'Cassiterite Adit Track' });
     S.addWay('side', [[1429, 555], [1458, 585], [1478, 645]], 3, { tag: 'Quarry & Steam-Coal Seam Track' });
    }
   },
   {
    name: 'et_charter_arcade_blocks',
    run: function(){
     const blocks = [
      { id: 'z4_nw', i: 0, j: 0, kind: 'charter_plaza', lanes: true, poly: [[1066, 102], [1196, 102], [1196, 140], [1066, 140]] },
      { id: 'z4_ne', i: 1, j: 0, kind: 'charter_plaza', lanes: true, poly: [[1214, 102], [1307, 102], [1307, 140], [1214, 140]] },
      { id: 'z4_mn', i: 0, j: 1, kind: 'charter_plaza', lanes: true, poly: [[1175, 155], [1196, 155], [1196, 201], [1175, 201]] },
      { id: 'z4_ms', i: 1, j: 1, kind: 'charter_plaza', lanes: true, poly: [[1156, 220], [1196, 220], [1196, 265], [1156, 265]] },
      { id: 'z4_me', i: 1, j: 3, kind: 'charter_plaza', lanes: true, poly: [[1214, 220], [1264, 220], [1264, 265], [1214, 265]] },
      { id: 'z4_fe', i: 2, j: 0, kind: 'charter_plaza', lanes: true, poly: [[1323, 108], [1418, 108], [1418, 200], [1323, 200]] },
      { id: 'z4_fs', i: 2, j: 1, kind: 'charter_plaza', lanes: true, poly: [[1323, 220], [1418, 220], [1418, 296], [1323, 296]] },
      { id: 'z4_sw', i: 0, j: 2, kind: 'charter_plaza', lanes: true, poly: [[1066, 280], [1196, 280], [1196, 305], [1066, 305]] },
      { id: 'z4_se', i: 1, j: 2, kind: 'charter_plaza', lanes: true, poly: [[1214, 280], [1307, 280], [1307, 305], [1214, 305]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 3.6,
      seed: SEED + 43,
      focus: [1135, 210],
      pools: Z4_CHARTER_POOLS,
      small: Z4_CHARTER_SMALL,
      gaps: { charter_plaza: [0.9, 2.0] },
      garden: { charter_plaza: 0.02 },
      infill: { step: 5.5, yard: 0.12 }
     });
    }
   },
   {
    name: 'et_canton_hex_honeycomb_lots',
    run: function(){
     placeLandmarks(ADG_HEX.buildHexSpecs(), 'rim', 0.6);
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
     placeLandmarks(COVE_WORKS_LANDMARKS, 'cove', 0.8);
     placeLandmarks(ADG_HEX.buildMoleNet().specs, 'cove', 0.6);
    }
   },
   {
    name: 'cove_works_ways',
    run: function(){
     const S = K().SL;
     /* Z1 Sheltered Lagoon Cove Ways */
     S.addWay('main', [[598, -685], [598, -555], [598, -435]], 3, { tag: 'Kopa-North Lagoon Quay Front' });
     S.addWay('side', [[654, -665], [654, -555], [654, -450]], 3, { tag: 'Lagoon Boatyard & Rigging Lane' });
     S.addWay('side', [[598, -625], [744, -625]], 3, { tag: 'North Hoist-Foot Sling Way' });
     S.addWay('side', [[598, -555], [738, -555]], 3, { tag: 'Mid Causeway & Silo Way' });
     S.addWay('side', [[598, -485], [744, -485]], 3, { tag: 'South Hoist-Foot Salvage Way' });

     /* Graded Cliff-Side Switchback Harbour Road (Z6 Cantonment +160.0 m -> Flush Mole +11.0 m) */
     const hrPts = [];
     for (let i = 0; i < ADG_SITE.HARBOUR_ROAD.length; i++) {
      hrPts.push([ADG_SITE.HARBOUR_ROAD[i][0], ADG_SITE.HARBOUR_ROAD[i][1]]);
     }
     S.addWay('avenue', hrPts, 3, { tag: 'Farport Mole Cliff-Switchback Harbour Road' });

     /* Hexagonal mole: quay ring avenue, honeycomb streets clipped to it, girder-lift foot spur */
     const mole = ADG_HEX.buildMoleNet();
     for (let i = 0; i < mole.ways.length; i++) {
      S.addWay(mole.ways[i].kind, mole.ways[i].pts, 3, { tag: mole.ways[i].tag });
     }
    }
   }
  ];
 }

 /* ================================================================ 4. Continuous Pedestrian & Hoist Walk Graph */
 function buildWalkGraph(){
  const h = ADG_SITE.bareGround;
  const nodes = [
   { id: 'z1_lagoon_quay',      zone: 'Z1', x:  598, y: 6.0,                 z: -555 },
   { id: 'z1_hoist_n_foot',     zone: 'Z1', x:  738, y: 11.4,                z: -625 },
   { id: 'z1_hoist_s_foot',     zone: 'Z1', x:  738, y: 11.4,                z: -485 },
   { id: 'z3_bulkhead_seal',    zone: 'Z3', x:   42, y: 81.0,                z:  210 },
   { id: 'z3_wing_hub_east',    zone: 'Z3', x:   92, y: 81.0,                z:  210 },
   { id: 'z3_wing_learning',    zone: 'Z3', x:  260, y: 81.0,                z:  210 },
   { id: 'z3_wing_mid_deck',    zone: 'Z3', x:  620, y: 81.0,                z:  210 },
   { id: 'z3_wing_east_portal', zone: 'Z3', x: 1018, y: 178.0,               z:  210 },
   { id: 'z4_portal_forecourt', zone: 'Z4', x: 1058, y: h(1058, 210) + 0.2,  z:  210 },
   { id: 'z4_charter_plaza',    zone: 'Z4', x: 1205, y: h(1205, 210) + 0.2,  z:  210 },
   { id: 'z4_east_gate',        zone: 'Z4', x: 1365, y: h(1365, 210) + 0.2,  z:  210 },
   { id: 'z5_south_rim',        zone: 'Z5', x: 1058, y: h(1058, -55) + 0.2,  z:  -55 },
   { id: 'z5_santa_cristina',   zone: 'Z5', x: 1058, y: h(1058, -332) + 0.2, z: -332 },
   { id: 'z5_hoist_s_head',     zone: 'Z5', x:  838, y: 152.0,               z: -485 },
   { id: 'z5_nuraghe_brow',     zone: 'Z5', x:  912, y: h(912, -520) + 0.2,  z: -520 },
   { id: 'z5_hoist_n_head',     zone: 'Z5', x:  838, y: 148.0,               z: -625 },
   { id: 'z5_sawmill_terrace',  zone: 'Z5', x: 1268, y: h(1268, -430) + 0.2, z: -430 },
   { id: 'z5_flume_terrace',    zone: 'Z5', x: 1268, y: h(1268, -130) + 0.2, z: -130 },
   { id: 'z6_north_gate',       zone: 'Z6', x: 1205, y: h(1205, 318) + 0.2,  z:  318 },
   { id: 'z6_ministry_court',   zone: 'Z6', x: 1205, y: h(1205, 458) + 0.2,  z:  458 },
   { id: 'z6_clock_plaza',      zone: 'Z6', x: 1121, y: h(1121, 506) + 0.2,  z:  506 },
   { id: 'z6_lift_head',        zone: 'Z6', x:  866, y: 158.0,               z:  415 },
   { id: 'z6_harbour_brow',     zone: 'Z6', x:  876, y: 160.5,               z:  535 },
   { id: 'z6_harbour_hairpin',  zone: 'Z6', x:  782, y:  80.0,               z:  326 },
   { id: 'z6_fort_parade',      zone: 'Z6', x: 1205, y: h(1205, 610) + 0.2,  z:  610 },
   { id: 'z6_villas_east',      zone: 'Z6', x: 1289, y: h(1289, 506) + 0.2,  z:  506 },
   { id: 'z6_kilns_south',      zone: 'Z6', x: 1289, y: h(1289, 604) + 0.2,  z:  604 },
   { id: 'z6_lift_foot',        zone: 'Z6', x:  676, y: 10.6,                z:  415 },
   { id: 'z6_lee_wharf',        zone: 'Z6', x:  508, y: h(508, 415) + 0.2,   z:  415 }
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
   ['z5_santa_cristina', 'z5_south_rim', 'avenue'],
   ['z5_south_rim', 'z4_portal_forecourt', 'avenue'],
   ['z4_portal_forecourt', 'z4_charter_plaza', 'highway'],
   ['z4_charter_plaza', 'z4_east_gate', 'highway'],
   ['z4_portal_forecourt', 'z3_wing_east_portal', 'ramp'],
   ['z3_wing_east_portal', 'z3_wing_mid_deck', 'highway'],
   ['z3_wing_mid_deck', 'z3_wing_learning', 'highway'],
   ['z3_wing_learning', 'z3_wing_hub_east', 'highway'],
   ['z3_wing_hub_east', 'z3_bulkhead_seal', 'highway'],
   ['z4_charter_plaza', 'z6_north_gate', 'avenue'],
   ['z6_north_gate', 'z6_ministry_court', 'avenue'],
   ['z6_ministry_court', 'z6_clock_plaza', 'street'],
   ['z6_clock_plaza', 'z6_lift_head', 'street'],
   ['z6_lift_head', 'z6_harbour_brow', 'street'],
   ['z6_harbour_brow', 'z6_harbour_hairpin', 'road'],
   ['z6_harbour_hairpin', 'z6_lift_foot', 'road'],
   ['z6_ministry_court', 'z6_villas_east', 'street'],
   ['z6_ministry_court', 'z6_fort_parade', 'avenue'],
   ['z6_fort_parade', 'z6_kilns_south', 'street'],
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
   tune: makeTune(1750, 3.5, 'door', 9.0, 'hueru-kuran'),
   steps: hkRimSteps(),
   rules: {
    groundOk: function(bo){
     if (obbTouchesArcology(bo, 3.0)) return false;
     return ADG_SITE.minCornerElev(bo) >= 75.0 && ADG_SITE.maxCornerRelief(bo) <= 10.5;
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
   tune: makeTune(1750, 3.5, 'door', 9.0, 'eternian'),
   steps: etCantonSteps(),
   rules: {
    groundOk: function(bo){
     if (obbTouchesArcology(bo, 3.0)) return false;
     return ADG_SITE.minCornerElev(bo) >= 75.0 && ADG_SITE.maxCornerRelief(bo) <= 10.5;
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
     if (obbTouchesArcology(bo, 3.0)) return false;
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
    if (obbTouchesArcology(L.bo, 2.5)) continue;

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
     const st = KCITY.stance(L.bo, ADG_SITE.bareGround, { maxDrop: 9.5 });
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
     variant: L.v | 0,
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
     KSPACE.claimBox(rec.x, rec.z, rec.w * 0.5 + 0.8, rec.d * 0.5 + 0.8, rec.ry, 'building', rec.tag);
    }
   }
  }

  collect(hkPlan, 'hk_rim', 'Z5');
  collect(etPlan, 'et_cantonment', 'Z6');
  collect(covePlan, 'cove_works', 'Z1');

  /* Filter any KCITY internal block-lane segment that might approach arcology keepout */
  function cleanWays(arr, instId){
   const out = [];
   for (let i = 0; i < (arr || []).length; i++) {
    const w = arr[i];
    if (!w.pts || w.pts.length < 2) continue;
    let hitsArc = false;
    for (let j = 0; j < w.pts.length; j++) {
     if (ADG_SITE.inArcologyKeepout(w.pts[j][0], w.pts[j][1], 3.0)) {
      hitsArc = true;
      break;
     }
    }
    if (!hitsArc) out.push({ inst: instId, kind: w.kind, w: w.w, pts: w.pts });
   }
   return out;
  }

  const ways = []
   .concat(cleanWays(hkPlan.ways, 'hk_rim'))
   .concat(cleanWays(etPlan.ways, 'et_cantonment'))
   .concat(cleanWays(covePlan.ways, 'cove_works'));

  const hexNet = ADG_HEX.buildHexWaysAndPlazas();
  const walkGraph = buildWalkGraph();

  _cached = {
   hkPlan: hkPlan,
   etPlan: etPlan,
   covePlan: covePlan,
   lots: allLots,
   ways: ways,
   hexPlazas: hexNet.plazas,
   walkGraph: walkGraph,
   hkLots: allLots.filter(function(l){ return l.kit === 'hueru-kuran'; }),
   etLots: allLots.filter(function(l){ return l.kit === 'eternian'; }),
   coveLots: allLots.filter(function(l){ return l.tier === 'cove'; }),
   constructionLots: allLots.filter(function(l){ return l.underConstruction; })
  };
  return _cached;
 }

 /* Audit proving zero street segments and zero building OBBs clip through Arcodiga's hull or Stiffening Wing */
 function auditArcologyClearance(lotsArg, waysArg){
  const P = (!lotsArg && !waysArg) ? buildPlans() : null;
  const lots = lotsArg || (P ? P.lots : []);
  const ways = waysArg || (P ? P.ways : []);
  let lotHits = 0;
  let wayHits = 0;

  for (let i = 0; i < lots.length; i++) {
   const L = lots[i];
   if (L.bo ? obbTouchesArcology(L.bo, 1.5) : ADG_SITE.inArcologyKeepout(L.x, L.z, 1.5)) {
    lotHits++;
   }
  }
  for (let i = 0; i < ways.length; i++) {
   const pts = ways[i].pts || [];
   for (let j = 0; j < pts.length - 1; j++) {
    const a = pts[j], b = pts[j + 1];
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(dist / 2.0));
    for (let s = 0; s <= steps; s++) {
     const t = s / steps;
     const sx = a[0] + (b[0] - a[0]) * t;
     const sz = a[1] + (b[1] - a[1]) * t;
     if (ADG_SITE.inArcologyKeepout(sx, sz, 1.5)) {
      wayHits++;
      break;
     }
    }
   }
  }
  return {
   ok: lotHits === 0 && wayHits === 0,
   lotHits: lotHits,
   wayHits: wayHits
  };
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
   ok: overlaps === 0 && lowDwellings === 0 && lots.length >= 600,
   lots: lots.length,
   overlaps: overlaps,
   lowDwellings: lowDwellings,
   minDwellingY: minDwellingY < 1e8 ? +minDwellingY.toFixed(2) : null,
   kitsUsed: kitsUsed
  };
 }

 return {
  HK_RIM_LANDMARKS: HK_RIM_LANDMARKS,
  Z4_CHARTER_LANDMARKS: Z4_CHARTER_LANDMARKS,
  COVE_WORKS_LANDMARKS: COVE_WORKS_LANDMARKS,
  obbOverlap: obbOverlap,
  buildWalkGraph: buildWalkGraph,
  buildPlans: buildPlans,
  auditArcologyClearance: auditArcologyClearance,
  auditLots: auditLots
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ADG_CITY;
