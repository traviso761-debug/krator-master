// ================================================================= BATTERED PORT — Dual KCITY instances (rim + cove) & KSPACE layout [G data]
// Lays out Bè-tõ-pò on two KCITY instances sharing KSPACE:
//   - Instance A ('battered_rim'): Upper Horseshoe Crater-Rim Town & Bare-Stone Head Citadel (D1..D5, +85..+138 m),
//     guarded by the hard tsunami-safety predicate rules.groundOk (100% of D1..D5 lots strictly >= +85.0 m).
//   - Instance B ('battered_cove'): Flooded Breached-Crater Kettle Quays (D6, +2..+32 m) & Subterranean Da-wò-hò Vault (D7).
// Pure [G data]: zero THREE, zero DOM, zero Math.random.
const BP_CITY = (function(){
 const SEED = BP_SITE.SEED;

 function makeTune(half, stanceMode, maxDrop){
  return {
   cell: 2.5,
   rasterHalf: half,
   maxSlope: 0.36,
   exact: true,
   width: { avenue: 11.0, main: 8.5, side: 6.0, alley: 3.8, highway: 10.0, lane: 4.5 },
   lot: { side: 1.5, setback: 1.4, rear: 2.8, inset: 0.9, step: 3.0 },
   classes: {
    rich: [['et_official_villa', 0], ['et_merchant_house', 0], ['et_court_house', 0]],
    middle: [['et_canal_house', 0], ['et_hex_house', 0], ['et_shophouse', 0]],
    poor: [['et_block_hut', 0], ['et_reed_house', 0], ['et_hex_hut', 0]]
   },
   fallback: { rich: 'middle', middle: 'poor', poor: null },
   civic: [],
   civicSpacing: 95,
   voidMax: 36,
   voidIters: 0,
   voidBatch: 0,
   sideSpacing: 44,
   sideMax: 180,
   alleyFrac: 0.28,
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
   stanceOpt: { maxDrop: maxDrop, cut: 4.5 }
  };
 }

 /* Pools for KCITY.strategies['frontage-courts'] across the upper crater-rim wards */
 const RIM_POOLS = {
  citadel: [
   ['et_court_house', 3], ['et_merchant_house', 2], ['et_shophouse', 2], ['et_tea_house', 2], ['et_hex_house', 2]
  ],
  factor: [
   ['et_official_villa', 2], ['et_merchant_house', 3], ['et_hex_villa', 2], ['et_court_house', 3],
   ['et_tea_house', 2], ['et_inn', 1], ['et_warehouse', 2], ['et_shophouse', 2]
  ],
  crucible: [
   ['et_smithy', 3], ['et_kiln', 2], ['et_tile_works', 2], ['et_porcelain', 1], ['et_paper_mill', 1],
   ['et_kelp_kiln', 2], ['et_lime_kiln', 2], ['et_tannery', 2], ['et_warehouse', 2], ['et_block_hut', 3], ['et_canal_house', 2]
  ],
  creole: [
   ['et_canal_house', 4], ['et_canal_row', 2], ['et_hex_house', 3], ['et_corner_turret', 2], ['et_shophouse', 4],
   ['et_bakehouse', 2], ['et_butcher', 2], ['et_weaver', 2], ['et_brewhouse', 2], ['et_tea_house', 2],
   ['et_reed_house', 3], ['et_block_hut', 3], ['et_hex_hut', 3]
  ],
  garden: [
   ['et_farmstead', 3], ['et_terraces', 3], ['et_paddy', 2], ['et_tea_garden', 2], ['et_granary', 2],
   ['et_goat_fold', 2], ['et_stock_pens', 2], ['et_mushroom_cellar', 2], ['et_wrack_heap', 2], ['et_reed_house', 2]
  ]
 };

 const RIM_SMALL = {
  citadel:  [['et_shrine_niche', 1], ['et_hex_hut', 1]],
  factor:   [['et_shophouse', 1], ['et_hex_house', 1]],
  crucible: [['et_kelp_kiln', 1], ['et_block_hut', 2]],
  creole:   [['et_reed_house', 2], ['et_block_hut', 2], ['et_hex_hut', 2], ['et_shrine_niche', 1]],
  garden:   [['et_wrack_heap', 2], ['et_reed_house', 2]]
 };

 const RIM_GAPS = {
  citadel: [3, 6],
  factor:  [4, 8],
  crucible:[3, 7],
  creole:  [1.8, 4.2],
  garden:  [5, 10]
 };

 /* Explicit Landmark & Trade Anchors ensuring 100% of BP_TRADES have active placed hosts */
 const RIM_LANDMARKS = [
  /* D1: Bare-Stone Head Volcanic-Plug Citadel (+126..+138 m) */
  { key: 'et_ministry',         x: -225, z: -445, ry: 0.12,  district: 'D1', role: 'Unmasked Counting-Court (Bè-dò Hò)', interiorId: 'counting_court' },
  { key: 'et_printer',          x: -268, z: -432, ry: 0.25,  district: 'D1', role: 'Exile Free Block-Press (sã-ma and Latin)', interiorId: 'free_press' },
  { key: 'et_historians_house', x: -182, z: -468, ry: -0.18, district: 'D1', role: 'Exiled Order of Historians Archive' },
  { key: 'et_lighthouse',       x: -298, z: -396, ry: 0.45,  district: 'D1', role: 'Seamount-Watch Beacon and Tsunami Gong-Tower' },
  { key: 'et_examination_hall', x: -215, z: -502, ry: 0.05,  district: 'D1', role: 'Multi-Tongue Hydrography and Cipher Academy' },
  { key: 'et_ancestor_gallery', x: -158, z: -418, ry: -0.22, district: 'D1', role: 'Hall of Lost Ships (Open-Eyed Figureheads)' },
  { key: 'et_barracks',         x: -315, z: -465, ry: 0.35,  district: 'D1', role: 'Syndicate Boarding-Marines Citadel Barracks' },
  { key: 'et_gate',             x: -135, z: -385, ry: -0.35, district: 'D1', role: 'Bare-Stone Head Citadel Gate' },
  { key: 'et_registry',         x: -252, z: -485, ry: 0.10,  district: 'D1', role: 'Nine-Hull Share and Lading Registry' },

  /* D2: Nine-Hull Factor Rim (+108..+124 m) */
  { key: 'et_official_villa',   x:  -48, z: -382, ry: 0.0,   district: 'D2', role: 'South-Run Factor House (Farport Night Line)' },
  { key: 'et_official_villa',   x:   32, z: -386, ry: 0.0,   district: 'D2', role: 'Mist-Run Factor House and Truce Envoy Guest-Court', v: 1 },
  { key: 'et_official_villa',   x:  116, z: -382, ry: 0.0,   district: 'D2', role: 'Whale-Run Factor House (Crookshore Nephrite)' },
  { key: 'et_official_villa',   x:  196, z: -376, ry: -0.08, district: 'D2', role: 'Reed-Run Factor House (Double Delta Silk Bypass)', v: 1 },
  { key: 'et_market_hall',      x:   72, z: -446, ry: 0.0,   district: 'D2', role: 'Hexagonal Prize-Bazaar and Bullion Court' },
  { key: 'et_customs_house',    x:  -12, z: -442, ry: 0.0,   district: 'D2', role: 'Syndicate Safe-Conduct and Prize-Court Assay' },
  { key: 'et_tube_station',     x:  -72, z: -352, ry: 0.0,   district: 'D2', role: 'Hoist-Head Sluice Winch and Pneumatic Court-Tube' },
  { key: 'et_inn',              x:  152, z: -448, ry: 0.0,   district: 'D2', role: 'Nine-Anchors Captains Hostel' },
  { key: 'et_warehouse',        x:  238, z: -432, ry: -0.15, district: 'D2', role: 'Upper Rim Contraband Silk Strongroom' },

  /* D3: Crucible & Coke Terrace (+96..+116 m, NE downwind) */
  { key: 'et_smithy',           x:  355, z: -345, ry: -0.42, district: 'D3', role: 'Nickel-Steel Hoist-Chain and Spear-Socket Forge' },
  { key: 'et_kiln',             x:  408, z: -322, ry: -0.42, district: 'D3', role: 'Coal-Fired Coke and Pozzolan Kiln' },
  { key: 'et_porcelain',        x:  452, z: -285, ry: -0.55, district: 'D3', role: 'Unsealed Olive-Celadon Kiln-Court' },
  { key: 'et_tile_works',       x:  488, z: -235, ry: -0.62, district: 'D3', role: 'Storm-Slate Roof Tile Works' },
  { key: 'et_paper_mill',       x:  382, z: -252, ry: -0.45, district: 'D3', role: 'Rag-Hemp Sea-Chart Paper Mill' },
  { key: 'et_tannery',          x:  515, z: -175, ry: -0.75, district: 'D3', role: 'Sound-Seal Oilskin Tannery' },
  { key: 'et_kelp_kiln',        x:  535, z: -125, ry: -0.80, district: 'D3', role: 'Kelp-Potash and Saltpeter Assay Trench' },
  { key: 'et_lime_kiln',        x:  465, z: -145, ry: -0.70, district: 'D3', role: 'Yellow Palagonite Hydraulic-Lime Kiln' },
  { key: 'et_mine',             x:  538, z: -325, ry: -0.50, district: 'D3', role: 'Garnierite Nickel-Serpentine & Collar Coal Adit' },
  { key: 'et_quarry',           x:  496, z: -368, ry: -0.45, district: 'D3', role: 'Oxidized Scoria Plinth and Basalt Lintel Quarry' },

  /* D4: Wash-Face & Creole Riggers' Steps (+88..+112 m, West Rim) */
  { key: 'et_healer',           x: -432, z: -265, ry: 0.52,  district: 'D4', role: 'Wash-Face Defector Sea-Surgeon Hospice' },
  { key: 'et_mask_house',       x: -468, z: -232, ry: 0.55,  district: 'D4', role: 'Wash-Face Identity Workshop (State-Brand Eraser)' },
  { key: 'et_weaver',           x: -418, z: -182, ry: 0.62,  district: 'D4', role: 'Black Tan-Bark Lugger Sail-Loft' },
  { key: 'et_bakehouse',        x: -485, z: -168, ry: 0.65,  district: 'D4', role: 'Coal-Oven Sea-Hardtack Bakehouse' },
  { key: 'et_butcher',          x: -512, z: -122, ry: 0.72,  district: 'D4', role: 'Salted Crag-Goat and Sound-Seal Provisioner' },
  { key: 'et_brewhouse',        x: -445, z: -112, ry: 0.68,  district: 'D4', role: 'Alecap Cave-Stout and Sea-Rum Brewhouse' },
  { key: 'et_tea_house',        x: -395, z: -138, ry: 0.58,  district: 'D4', role: 'Farport Click-Creole Pilots Infusion Parlour' },
  { key: 'et_gate',             x: -545, z:  -48, ry: 0.85,  district: 'D4', role: 'West Bolt-Hole Cliff-Stair Watchgate' },

  /* D5: Tuff-Spring & Wrack Terraces (+88..+105 m, Outer North Rim) */
  { key: 'et_granary',          x:  -65, z: -612, ry: 0.0,   district: 'D5', role: 'Tsunami-Proof +96 m Vaulted Basalt Granary W' },
  { key: 'et_granary',          x:   88, z: -608, ry: 0.0,   district: 'D5', role: 'Tsunami-Proof +96 m Vaulted Basalt Granary E' },
  { key: 'et_farmstead',        x: -195, z: -648, ry: 0.08,  district: 'D5', role: 'Wrack-Manured Sweet-Potato Terrace Farmstead' },
  { key: 'et_terraces',         x:  -12, z: -675, ry: 0.0,   district: 'D5', role: 'Walled Scoria Sweet-Potato and Yam Terraces' },
  { key: 'et_paddy',            x: -115, z: -582, ry: 0.0,   district: 'D5', role: 'Basal Palagonite Spring-Fed Taro Wet-Beds' },
  { key: 'et_tea_garden',       x:  195, z: -645, ry: -0.08, district: 'D5', role: 'Misty Rim Tea-Bush and Pandan Grove' },
  { key: 'et_goat_fold',        x:  268, z: -598, ry: -0.12, district: 'D5', role: 'Crag-Goat Dairy Fold' },
  { key: 'et_stock_pens',       x: -262, z: -612, ry: 0.12,  district: 'D5', role: 'Cove-Duck and Salt-Pork Pens' },
  { key: 'et_mushroom_cellar',  x:  142, z: -575, ry: 0.0,   district: 'D5', role: 'Palagonite Tuff Alecap and Pale-Fungi Cellar' },
  { key: 'et_wrack_heap',       x:   32, z: -585, ry: 0.0,   district: 'D5', role: 'Hoisted Soundkelp Fertilizer Heap' }
 ];

 const COVE_LANDMARKS = [
  /* D6: The Kettle Flooded-Crater Quays (+3..+18 m) */
  { key: 'et_quay',             x: -115, z: -116, ry: 0.0,   district: 'D6', role: 'West Kettle Lugger Quay', y: 3.4 },
  { key: 'et_quay',             x:    8, z: -118, ry: 0.0,   district: 'D6', role: 'Central Truce-Berth Quay (Yonni and Crook)', y: 3.4 },
  { key: 'et_quay',             x:  132, z: -114, ry: 0.0,   district: 'D6', role: 'East Kettle Coaster Quay', y: 3.4 },
  { key: 'et_dock',             x: -215, z: -128, ry: 0.18,  district: 'D6', role: 'Ironkneepodocarp Careening and Lugger Yard', y: 3.6 },
  { key: 'et_dock',             x:  222, z: -126, ry: -0.18, district: 'D6', role: 'Delta-Skiff Leeboard Boatyard', y: 3.6 },
  { key: 'et_canal_landing',    x:  -62, z: -132, ry: 0.0,   district: 'D6', role: 'Double Delta Leeboard Skiff Landing', y: 3.8 },
  { key: 'et_fish_landing',     x:   84, z: -130, ry: 0.0,   district: 'D6', role: 'Strait Squid and Soundkelp Landing', y: 3.8 },
  { key: 'et_ferry_landing',    x:  176, z: -122, ry: -0.10, district: 'D6', role: 'SE Collar Coal-Barge Shuttle Landing', y: 3.5 },
  { key: 'et_customs_house',    x:  -18, z: -158, ry: 0.0,   district: 'D6', role: 'Kettle Hoist-Tally and Prize Manifest Shed', y: 7.4 },
  { key: 'et_warehouse',        x: -145, z: -162, ry: 0.0,   district: 'D6', role: 'Hoist-Foot Rapid-Sling Cargo Transit Shed', y: 7.8 },
  { key: 'et_warehouse',        x:  112, z: -160, ry: 0.0,   district: 'D6', role: 'Coke-Coal and Whale-Oil Bunker', y: 7.6 },
  { key: 'et_shrine_niche',     x:   44, z: -152, ry: 0.0,   district: 'D6', role: 'Kettle Driftwood Storm-Lantern Niche', y: 6.8 },
  /* Twin Feeder-Dike Jaw Chain-Boom Winch Towers */
  { key: 'et_wall_tower',       x:  -62, z:  392, ry: 0.35,  district: 'D6', role: 'West Feeder-Dike Chain-Boom Winch-Tower', y: 18.5 },
  { key: 'et_wall_tower',       x:   62, z:  392, ry: -0.35, district: 'D6', role: 'East Feeder-Dike Chain-Boom Winch-Tower', y: 18.5 },

  /* D7: Subterranean Da-wò-hò Palagonite Sea-Cave Vault (+4.5..+12 m rock-cut galleries) */
  { key: 'et_warehouse',        x: -292, z:  -24, ry: 0.0,   district: 'D7', role: 'Da-wò-hò Contraband Spider-Silk Dry-Vault', y: 5.2, vault: true, interiorId: 'sea_cave_vault' },
  { key: 'et_warehouse',        x: -262, z:   22, ry: 3.14,  district: 'D7', role: 'Da-wò-hò Stolen Alabaster and Nephrite Vault', y: 5.2, vault: true },
  { key: 'et_canal_landing',    x: -242, z:   -5, ry: 1.57,  district: 'D7', role: 'Subterranean Blockade-Lugger Wet-Berth Wharf', y: 2.4, vault: true },
  { key: 'et_barracks',         x: -322, z:    2, ry: 1.57,  district: 'D7', role: 'Bolt-Hole Tunnel Guard & Drawdown Float-Well Post', y: 5.4, vault: true },
  { key: 'et_mushroom_cellar',  x: -328, z:  -28, ry: 0.0,   district: 'D7', role: 'Subterranean Palagonite Alecap Vault', y: 5.6, vault: true }
 ];

 function placeLandmarks(spec, tier){
  const K = KCITY.lib, SLx = K.SL, P = K.plan(), out = [];
  for (let i = 0; i < spec.length; i++) {
   const S = spec[i];
   const D = BP_TUNE.dimsOf(S.key, S.v == null ? 0 : S.v);
   if (!D) continue;
   const u = [Math.cos(S.ry), -Math.sin(S.ry)];
   const bo = K.obb([S.x, S.z], u, D.w * 0.5, D.d * 0.5);
   let y = S.y;
   let drop = 0;
   if (y == null) {
    const st = KCITY.stance(bo, BP_SITE.bareGround, { maxDrop: 6.5 });
    y = st ? st.y : BP_SITE.bareGround(S.x, S.z);
    drop = st && st.drop != null ? st.drop : 0;
    if (tier === 'rim' && y < BP_SITE.TSUNAMI_FLOOR_M) y = BP_SITE.TSUNAMI_FLOOR_M + 1.0;
   }
   const lot = {
    id: P.lots.length,
    cls: 'landmark',
    role: S.role,
    district: S.district,
    tier: tier,
    vault: !!S.vault,
    interiorId: S.interiorId || null,
    key: S.key,
    v: S.v == null ? 0 : (S.v | 0),
    slot: 0,
    wealth: S.district === 'D1' || S.district === 'D2' ? 0.92 : 0.65,
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
    civic: true
   };
   P.lots.push(lot);
   P.landmarks.push(lot);
   SLx.hashLot(lot);
   SLx.register(lot);
   SLx.R.stampPoly(K.obbCorners(K.obb([S.x, S.z], u, D.w * 0.5 + 2.5, D.d * 0.5 + 2.5)), K.OCC.HARD, lot.id);
   out.push(lot);
  }
  return out;
 }

 /* Clear spring rill corridors on the KCITY raster so no building steps across a WATER.flow channel */
 function stampSpringCorridors(R, OCC){
  for (let i = 0; i < BP_SITE.SPRINGS.length; i++) {
   const pts = BP_SITE.SPRINGS[i].pts;
   for (let j = 0; j < pts.length - 1; j++) {
    R.eachNearSeg(pts[j], pts[j + 1], 6.5, function(idx){ R.occ[idx] = OCC.GREEN; });
   }
  }
 }

 /* Instance A ('battered_rim') steps: D1..D5 horseshoe crater-rim bench (+85..+138 m) */
 function rimSteps(){
  const K = function(){ return KCITY.lib; };
  return [
   {
    name: 'rim_ground_and_zone',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = [
      [-680, -800], [420, -800], [620, -420], [620, -40],
      [350, -60], [310, -320], [-70, -325], [-340, -320],
      [-350, 55], [-590, 65], [-680, -190]
     ];
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 1, h: BP_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
     k.plan().districts = BP_SITE.DISTRICTS.slice(0, 5);
     stampSpringCorridors(R, k.OCC);
    }
   },
   {
    name: 'rim_landmarks_and_trades',
    run: function(){
     placeLandmarks(RIM_LANDMARKS, 'rim');
    }
   },
   {
    name: 'rim_crescent_streets',
    run: function(){
     const S = K().SL;
     /* Inner Rim Promenade overlooking the Kettle cliff-edge (D1 -> D2 -> D3) */
     S.addWay('avenue', [[-330, -385], [-210, -355], [-75, -355], [90, -355], [265, -345], [365, -305], [445, -185], [475, -85]], 3, { tag: 'Nine-Hull Rim Promenade' });
     /* Mid-Rim Crescent Street */
     S.addWay('main', [[-545, 10], [-495, -145], [-435, -295], [-335, -435], [-165, -455], [45, -455], [245, -440], [415, -355], [535, -195], [555, -80]], 3, { tag: 'Bare-Stone Mid-Rim Street' });
     /* Outer Garden & Citadel Ring Street */
     S.addWay('main', [[-595, -165], [-545, -345], [-345, -535], [-165, -565], [85, -560], [315, -535], [525, -375]], 3, { tag: 'Outer Tuff-Spring Ring' });
     /* North Terrace Lane (D5) */
     S.addWay('side', [[-310, -655], [-95, -660], [115, -660], [315, -645]], 3, { tag: 'Wrack-Terrace North Lane' });
     S.addWay('side', [[-295, -735], [295, -735]], 3, { tag: 'Upper Tea-Garden Track' });
     /* Radial Cross-Stepped Streets linking outer gardens to hoist heads */
     S.addWay('avenue', [[-225, -740], [-225, -555], [-225, -355]], 3, { tag: 'Citadel Spine Avenue' });
     S.addWay('side', [[-65, -740], [-65, -555], [-55, -345]], 3, { tag: 'Hoist 2 Radial Way' });
     S.addWay('side', [[85, -740], [85, -555], [75, -345]], 3, { tag: 'Hoist 3 Prize-Bazaar Way' });
     S.addWay('side', [[245, -730], [245, -535], [225, -345]], 3, { tag: 'Reed-Run East Radial' });
     /* D4 Creole Stepped Cross-Lanes */
     S.addWay('side', [[-615, -185], [-485, -175], [-365, -165]], 3, { tag: 'Wash-Face Steps North' });
     S.addWay('side', [[-585, -75], [-465, -70], [-355, -65]], 3, { tag: 'Riggers Steps South' });
     S.addWay('side', [[-565, -285], [-445, -275], [-365, -265]], 3, { tag: 'Sail-Loft Alley' });
     /* D3 Crucible Cross-Lanes */
     S.addWay('side', [[345, -295], [495, -275]], 3, { tag: 'Crucible Kiln Row' });
     S.addWay('side', [[375, -190], [545, -175]], 3, { tag: 'Nickel-Forge Row' });
    }
   },
   {
    name: 'rim_frontage_and_courts',
    run: function(){
     const blocks = [
      /* D1 Citadel court blocks */
      { id: 'd1_west', i: 0, j: 0, kind: 'citadel', lanes: true, poly: [[-345, -520], [-235, -535], [-235, -370], [-335, -395]] },
      { id: 'd1_east', i: 1, j: 0, kind: 'citadel', lanes: true, poly: [[-215, -545], [-95, -525], [-85, -365], [-215, -365]] },
      /* D2 Factor Rim blocks */
      { id: 'd2_w1',   i: 2, j: 0, kind: 'factor',  lanes: true, poly: [[-60, -450], [65, -450], [65, -362], [-60, -362]] },
      { id: 'd2_e1',   i: 3, j: 0, kind: 'factor',  lanes: true, poly: [[88, -448], [235, -438], [230, -354], [88, -360]] },
      { id: 'd2_w2',   i: 2, j: 1, kind: 'factor',  lanes: true, poly: [[-60, -548], [75, -548], [75, -464], [-60, -464]] },
      { id: 'd2_e2',   i: 3, j: 1, kind: 'factor',  lanes: true, poly: [[95, -546], [240, -528], [238, -452], [95, -462]] },
      /* D3 Crucible Terrace blocks */
      { id: 'd3_n',    i: 4, j: 0, kind: 'crucible', lanes: true, poly: [[275, -455], [495, -365], [485, -285], [335, -305]] },
      { id: 'd3_m',    i: 4, j: 1, kind: 'crucible', lanes: true, poly: [[350, -285], [525, -265], [538, -185], [372, -198]] },
      { id: 'd3_s',    i: 4, j: 2, kind: 'crucible', lanes: true, poly: [[380, -180], [548, -165], [568, -82], [392, -88]] },
      /* D4 Creole Steps dense blocks (packed closely to carry ~375 households) */
      { id: 'd4_n1',   i: 0, j: 1, kind: 'creole',  lanes: true, poly: [[-565, -355], [-375, -372], [-372, -275], [-555, -292]] },
      { id: 'd4_m1',   i: 0, j: 2, kind: 'creole',  lanes: true, poly: [[-595, -278], [-372, -258], [-368, -175], [-605, -192]] },
      { id: 'd4_m2',   i: 0, j: 3, kind: 'creole',  lanes: true, poly: [[-610, -175], [-366, -158], [-360, -75], [-585, -85]] },
      { id: 'd4_s1',   i: 0, j: 4, kind: 'creole',  lanes: true, poly: [[-578, -65], [-356, -58], [-352, 24], [-552, 32]] },
      /* D5 Spring Gardens & Wrack Terraces */
      { id: 'd5_w1',   i: 1, j: 2, kind: 'garden',  lanes: true, poly: [[-315, -648], [-80, -650], [-80, -572], [-320, -572]] },
      { id: 'd5_m1',   i: 2, j: 2, kind: 'garden',  lanes: true, poly: [[-52, -650], [72, -650], [72, -570], [-52, -570]] },
      { id: 'd5_e1',   i: 3, j: 2, kind: 'garden',  lanes: true, poly: [[96, -650], [312, -638], [318, -552], [96, -568]] },
      { id: 'd5_w2',   i: 1, j: 3, kind: 'garden',  lanes: true, poly: [[-300, -730], [-78, -730], [-78, -665], [-305, -662]] },
      { id: 'd5_e2',   i: 3, j: 3, kind: 'garden',  lanes: true, poly: [[-52, -730], [295, -726], [302, -656], [-52, -664]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 5.5,
      seed: SEED + 11,
      focus: [-180, -420],
      pools: RIM_POOLS,
      small: RIM_SMALL,
      gaps: RIM_GAPS,
      garden: { citadel: 0.12, factor: 0.18, crucible: 0.08, creole: 0.05, garden: 0.25 },
      infill: { step: 8.5, yard: 0.35 }
     });
    }
   }
  ];
 }

 /* Instance B ('battered_cove') steps: D6 Kettle Harbor Quays (+2..+32 m) & D7 Da-wò-hò Vault */
 function coveSteps(){
  const K = function(){ return KCITY.lib; };
  const COVE_POOLS = {
   harbor: [
    ['et_warehouse', 3], ['et_shophouse', 3], ['et_fish_landing', 2], ['et_canal_landing', 2],
    ['et_tea_house', 1], ['et_butcher', 1], ['et_shrine_niche', 1]
   ]
  };
  return [
   {
    name: 'cove_ground_and_zone',
    run: function(C){
     const k = K(), R = k.SL.R = new k.Raster(C.tune.rasterHalf, C.tune.cell);
     R.occ.fill(k.OCC.OUT);
     const Z = [[-360, -195], [305, -195], [320, -90], [-210, -90], [-210, 70], [-360, 70]];
     k.SL.R.land = KCITY.site.zoneRaster(R, Z, { dry: 0, h: BP_SITE.bareGround });
     k.SL.minSpacing = KCITY.site.minSpacing();
     k.plan().zone = Z;
     k.plan().districts = BP_SITE.DISTRICTS.slice(5);
    }
   },
   {
    name: 'cove_quays_and_vault_landmarks',
    run: function(){
     placeLandmarks(COVE_LANDMARKS, 'cove');
    }
   },
   {
    name: 'cove_quay_ways',
    run: function(){
     const S = K().SL;
     S.addWay('main', [[-265, -125], [-115, -125], [0, -125], [135, -125], [265, -125]], 3, { tag: 'Kettle Quay Front' });
     S.addWay('side', [[-255, -168], [0, -168], [255, -168]], 3, { tag: 'Hoist-Foot Service Way' });
     S.addWay('alley', [[-265, -125], [-215, -18], [-285, -5]], 3, { tag: 'Dark-Water Sea-Cave Towpath' });
    }
   },
   {
    name: 'cove_harbor_blocks',
    run: function(){
     const blocks = [
      { id: 'd6_west', i: 0, j: 0, kind: 'harbor', lanes: false, poly: [[-250, -164], [-72, -164], [-72, -132], [-250, -132]] },
      { id: 'd6_mid',  i: 1, j: 0, kind: 'harbor', lanes: false, poly: [[-42, -164], [58, -164], [58, -132], [-42, -132]] },
      { id: 'd6_east', i: 2, j: 0, kind: 'harbor', lanes: false, poly: [[86, -164], [248, -164], [248, -132], [86, -132]] }
     ];
     KCITY.strategies['frontage-courts'].run(blocks, {
      step: 6.5,
      seed: SEED + 29,
      focus: [0, -120],
      pools: COVE_POOLS,
      small: { harbor: [['et_shrine_niche', 1], ['et_wrack_heap', 1]] },
      gaps: { harbor: [2.5, 5.0] },
      garden: { harbor: 0.0 }
     });
    }
   }
  ];
 }

 let _cached = null;

 function buildPlans(opt){
  if (_cached && !(opt && opt.fresh)) return _cached;
  const tagsReg = (opt && opt.tags) ? opt.tags : (typeof KTAGS !== 'undefined' ? (KTAGS.page || (KTAGS.page = KTAGS.create({ build: 'battered-port' }))) : null);

  /* Instance A: Upper Crescentic Crater-Rim Town (D1..D5, strictly >= +85.0 m) */
  const rimCity = KCITY.create({
   name: 'battered_rim',
   seed: SEED,
   rand: 'krand',
   index: { order: 'insertion' },
   kit: { dims: BP_TUNE.dimsOf },
   ground: BP_SITE.ground,
   site: { districts: BP_SITE.DISTRICTS.slice(0, 5) },
   tune: makeTune(900, 'door', 6.5),
   steps: rimSteps(),
   rules: {
    groundOk: function(bo){
     return BP_SITE.minCornerElev(bo) >= BP_SITE.TSUNAMI_FLOOR_M && BP_SITE.maxCornerRelief(bo) <= 7.5;
    }
   },
   tags: tagsReg
  });

  /* Instance B: Flooded Breached-Crater Kettle Harbor & Subterranean Da-wò-hò Vault (D6..D7) */
  const coveCity = KCITY.create({
   name: 'battered_cove',
   seed: SEED + 101,
   rand: 'krand',
   index: { order: 'insertion' },
   kit: { dims: BP_TUNE.dimsOf },
   ground: BP_SITE.ground,
   site: { districts: BP_SITE.DISTRICTS.slice(5) },
   tune: makeTune(520, 'high', 8.5),
   steps: coveSteps(),
   rules: {
    groundOk: function(bo){
     const lo = BP_SITE.minCornerElev(bo);
     return lo >= 2.2 && lo <= 36.0 && BP_SITE.maxCornerRelief(bo) <= 9.0;
    }
   },
   tags: tagsReg
  });

  const rimPlan = rimCity.run();
  const covePlan = coveCity.run();

  /* Stamp all standing lots into KSPACE and tag district + rimFacing + construction sites */
  const allLots = [];
  if (typeof KSPACE !== 'undefined' && KSPACE.reset) {
   KSPACE.reset();
  }

  function collect(plan, tier){
   for (let i = 0; i < plan.lots.length; i++) {
    const L = plan.lots[i];
    if (L.died != null || !L.bo) continue;
    const distObj = L.district ? BP_SITE.DISTRICTS.find(function(d){ return d.id === L.district; }) : BP_SITE.districtAt(L.x, L.z);
    const dId = L.district || (distObj ? distObj.id : (tier === 'rim' ? 'D4' : 'D6'));
    let y = L.y;
    if (y == null) {
     const st = KCITY.stance(L.bo, BP_SITE.bareGround, { maxDrop: 6.5 });
     y = st ? st.y : BP_SITE.bareGround(L.x, L.z);
     if (tier === 'rim' && y < BP_SITE.TSUNAMI_FLOOR_M) y = BP_SITE.TSUNAMI_FLOOR_M + 0.5;
    }
    const rKettle = Math.hypot(L.x - BP_SITE.KETTLE.x, L.z - BP_SITE.KETTLE.z);
    const rimFacing = tier === 'rim' && rKettle < 495 && L.z > -465;
    /* Mark 6 outer terrace expansion lots as active KCONS / KCITY.constructMesh building sites */
    const ch = KRAND.hash(SEED ^ 0x517e, i, Math.round(L.x), Math.round(L.z));
    const underConstruction = (tier === 'rim' && !L.civic && (dId === 'D4' || dId === 'D5') && (ch % 47) === 0);
    const progress = underConstruction ? (0.28 + 0.54 * KRAND.unit(ch ^ 0x99)) : 1.0;

    const rec = {
     id: tier + ':' + L.id,
     lotNum: L.id,
     tier: tier,
     district: dId,
     vault: !!L.vault || dId === 'D7',
     interiorId: L.interiorId || null,
     key: L.key,
     v: L.v | 0,
     cls: L.cls || 'middle',
     role: L.role || L.key,
     civic: !!L.civic,
     x: +L.x.toFixed(2),
     y: +y.toFixed(2),
     z: +L.z.toFixed(2),
     ry: +L.ry.toFixed(4),
     w: L.w,
     d: L.d,
     h: L.h,
     drop: L.drop == null ? 0 : +L.drop.toFixed(2),
     bo: L.bo,
     rimFacing: rimFacing,
     underConstruction: underConstruction,
     buildProgress: +progress.toFixed(3)
    };
    allLots.push(rec);
    if (typeof KSPACE !== 'undefined' && KSPACE.claimBox) {
     KSPACE.claimBox(rec.x, rec.z, rec.w * 0.5 + 1.2, rec.d * 0.5 + 1.2, rec.ry, 'building', rec.id);
    }
   }
  }

  collect(rimPlan, 'rim');
  collect(covePlan, 'cove');

  _cached = {
   rimCity: rimCity,
   coveCity: coveCity,
   rimPlan: rimPlan,
   covePlan: covePlan,
   lots: allLots,
   rimLots: allLots.filter(function(l){ return l.tier === 'rim'; }),
   coveLots: allLots.filter(function(l){ return l.tier === 'cove'; }),
   constructionLots: allLots.filter(function(l){ return l.underConstruction; })
  };
  return _cached;
 }

 return {
  RIM_LANDMARKS: RIM_LANDMARKS,
  COVE_LANDMARKS: COVE_LANDMARKS,
  buildPlans: buildPlans
 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BP_CITY;
