// ================================================================= ARCH MATERIAL BILLS & VOTH CENSUS TRADES ([G data])
// Pure engine-neutral data and validators (no three.js, no DOM):
//   SK_BILLS            structured per-part Arch material records & aggregated SIM/KCONS bills for every sk_* building
//   skCompileBill(raw)  compiles [{part, mat, qty}] against SK_ARCH_MATERIALS -> {materials, bill, byArchMat}
//   skValidateBill(k,r) verifies every part uses only SK_ARCH_MATERIALS and zero forbidden Crookshore materials
//   SK_TRADES           all 44 Voth census trades mapped onto Shore-kin defs (or na with Arch hinterland reason)

function skCompileBill(rawParts){
 const materials=[],bill={},byArchMat={};
 for(let i=0;i<rawParts.length;i++){
  const p=rawParts[i],spec=SK_ARCH_MATERIALS[p.mat];
  if(!spec)throw new Error('kits/shore-kin: unknown Arch material `'+p.mat+'` on part `'+p.part+'`');
  const qty=p.qty==null?1:p.qty;
  materials.push({
   part:p.part,
   mat:p.mat,
   cat:spec.cat,
   good:spec.good,
   bucket:spec.bucket,
   qty:qty
  });
  bill[spec.good]=+((bill[spec.good]==null?0:bill[spec.good])+qty).toFixed(2);
  byArchMat[p.mat]=+((byArchMat[p.mat]==null?0:byArchMat[p.mat])+qty).toFixed(2);
 }
 return {materials,bill,byArchMat};
}

function skValidateBill(key,rec){
 const errs=[];
 if(!rec||!Array.isArray(rec.materials)||rec.materials.length<4){
  errs.push(key+': needs >= 4 structured part material records');
  return {ok:false,errs};
 }
 if(!rec.bill||!Object.keys(rec.bill).length)errs.push(key+': empty aggregated bill');
 for(let i=0;i<rec.materials.length;i++){
  const m=rec.materials[i];
  const low=(String(m.mat)+'|'+String(m.part)+'|'+String(m.good)).toLowerCase();
  for(let f=0;f<SK_FORBIDDEN_MATERIALS.length;f++){
   if(low.indexOf(SK_FORBIDDEN_MATERIALS[f])>=0){
    errs.push(key+': forbidden Crookshore material `'+SK_FORBIDDEN_MATERIALS[f]+'` in '+m.part);
   }
  }
  if(!SK_ARCH_MATERIALS[m.mat])errs.push(key+': unapproved material `'+m.mat+'` in '+m.part);
  if(!(m.qty>0))errs.push(key+': non-positive qty on '+m.part);
 }
 return {ok:errs.length===0,errs};
}

const SK_RAW_BILLS={
 sk_stilt_cot:[
  {part:'flood_socle_piers',mat:'pillow_basalt',qty:5},
  {part:'arched_socle_cap',mat:'laterite',qty:4},
  {part:'drying_deck_and_posts',mat:'mangrove',qty:6},
  {part:'wall_panels',mat:'paperbark',qty:3},
  {part:'wall_lime_coat',mat:'shell_limewash',qty:2},
  {part:'tiered_roof_thatch',mat:'thatch_costularia',qty:6},
  {part:'gable_horn_finials',mat:'ohia',qty:2},
  {part:'door_ancestor_mask',mat:'laterite_terracotta',qty:1},
  {part:'net_floats_and_cordage',mat:'pumice',qty:2}
 ],
 sk_boardwalk_shack:[
  {part:'tarred_pile_crib',mat:'tarred_mangrove',qty:6},
  {part:'crib_caulking_pitch',mat:'bitumen_gum',qty:2},
  {part:'boardwalk_apron',mat:'mangrove',qty:4},
  {part:'hull_plank_walls',mat:'salvage_hull',qty:6},
  {part:'roof_and_wall_liner',mat:'paperbark',qty:4},
  {part:'gable_thatch',mat:'thatch_costularia',qty:4},
  {part:'rain_hood_awning',mat:'shark_ray_hide',qty:2},
  {part:'door_ancestor_mask',mat:'laterite_terracotta',qty:1}
 ],
 sk_crib_rowhouse:[
  {part:'shared_laterite_piers',mat:'laterite',qty:6},
  {part:'tarred_crib_frame',mat:'tarred_mangrove',qty:8},
  {part:'front_boardwalk',mat:'mangrove',qty:6},
  {part:'plank_and_bark_walls',mat:'salvage_hull',qty:8},
  {part:'pierced_vent_blocks',mat:'brucite_travertine',qty:3},
  {part:'tiered_uluhe_roof',mat:'thatch_costularia',qty:8},
  {part:'porch_awning',mat:'shark_ray_hide',qty:3},
  {part:'twin_door_masks',mat:'laterite_terracotta',qty:2}
 ],
 sk_hex_lime_house:[
  {part:'hexagonal_plinth',mat:'laterite',qty:6},
  {part:'terrazzo_floor',mat:'shell_terrazzo',qty:4},
  {part:'hex_masonry_walls',mat:'pumice',qty:7},
  {part:'exterior_limewash',mat:'shell_limewash',qty:5},
  {part:'pierced_window_screens',mat:'brucite_travertine',qty:4},
  {part:'shutters_and_trim',mat:'verdigris_ash',qty:2},
  {part:'hex_roof_frame',mat:'araucaria',qty:5},
  {part:'hex_thatch_cone',mat:'thatch_costularia',qty:7},
  {part:'finial_and_lintel',mat:'ohia',qty:2},
  {part:'door_ancestor_mask',mat:'laterite_terracotta',qty:1}
 ],
 sk_serpentine_lodge:[
  {part:'battered_ring_wall',mat:'serpentinite',qty:12},
  {part:'alternating_rind_courses',mat:'dunite',qty:7},
  {part:'steamed_vault_knees',mat:'mangrove',qty:6},
  {part:'drift_whale_rib_arches',mat:'whalebone_drift',qty:4},
  {part:'vault_inner_liner',mat:'paperbark',qty:5},
  {part:'coastal_turf_dome',mat:'turf_dome',qty:9},
  {part:'flame_rimmed_crown',mat:'laterite_terracotta',qty:2},
  {part:'porch_rayhide_awning',mat:'shark_ray_hide',qty:3}
 ],
 sk_compound_house:[
  {part:'arched_flood_socle',mat:'laterite',qty:10},
  {part:'socle_cutwaters',mat:'pillow_basalt',qty:6},
  {part:'ground_limewash_walls',mat:'shell_limewash',qty:7},
  {part:'brucite_arcades_and_screens',mat:'brucite_travertine',qty:6},
  {part:'upper_gallery_frame',mat:'araucaria',qty:9},
  {part:'veranda_decking',mat:'mangrove',qty:6},
  {part:'two_tier_thatch_roof',mat:'thatch_costularia',qty:10},
  {part:'upswept_ohia_horns',mat:'ohia',qty:3},
  {part:'catechu_awning_trim',mat:'catechu_stain',qty:3},
  {part:'house_head_paktong_fittings',mat:'paktong',qty:2}
 ],
 sk_byssus_court:[
  {part:'court_plinth_and_basin',mat:'brucite_travertine',qty:9},
  {part:'gate_hex_walls',mat:'shell_limewash',qty:8},
  {part:'serpentinite_socle',mat:'serpentinite',qty:6},
  {part:'gallery_timber_offcuts',mat:'araucaria',qty:8},
  {part:'tiered_thatch_roofs',mat:'thatch_costularia',qty:10},
  {part:'catechu_dye_vats_and_cloth',mat:'catechu_stain',qty:4},
  {part:'spun_byssus_skeins',mat:'byssus_cloth',qty:3},
  {part:'paktong_gate_mask',mat:'paktong',qty:2}
 ],
 sk_client_hall:[
  {part:'stepped_flood_socle',mat:'laterite',qty:14},
  {part:'basalt_foundation_piers',mat:'pillow_basalt',qty:8},
  {part:'arched_perimeter_colonnade',mat:'brucite_travertine',qty:12},
  {part:'hex_moot_pavilion_walls',mat:'shell_limewash',qty:10},
  {part:'shell_terrazzo_dais',mat:'shell_terrazzo',qty:7},
  {part:'roof_trusses',mat:'araucaria',qty:10},
  {part:'three_tier_rian_roof',mat:'thatch_costularia',qty:14},
  {part:'carved_ohia_gable_horns',mat:'ohia',qty:4},
  {part:'verdigris_ridge_collar',mat:'verdigris_ash',qty:3},
  {part:'paktong_ancestor_mask_and_scales',mat:'paktong',qty:4},
  {part:'fleetborn_catechu_and_byssus_banners',mat:'byssus_cloth',qty:3}
 ],
 sk_ash_kelp_kiln:[
  {part:'ash_clamp_ring',mat:'dunite',qty:5},
  {part:'clamp_turf_seal',mat:'turf_dome',qty:4},
  {part:'nickel_shrub_ash_yield',mat:'verdigris_ash',qty:4},
  {part:'kelp_trench_lining',mat:'pillow_basalt',qty:5},
  {part:'kelp_wrack_charge',mat:'kelp_wrack',qty:5},
  {part:'casuarina_clamp_fuel',mat:'casuarina_fuel',qty:5},
  {part:'drying_racks_and_shelter',mat:'mangrove',qty:4},
  {part:'shelter_thatch',mat:'thatch_costularia',qty:3}
 ],
 sk_spar_sawpit:[
  {part:'sawpit_masonry_lining',mat:'laterite',qty:6},
  {part:'heavy_saw_trestles',mat:'tarred_mangrove',qty:6},
  {part:'araucaria_spar_baulks',mat:'araucaria',qty:10},
  {part:'pit_saw_and_dogs',mat:'iron_fittings',qty:3},
  {part:'steaming_trough_curb',mat:'brucite_travertine',qty:4},
  {part:'steamed_mangrove_knees',mat:'mangrove',qty:5},
  {part:'kauri_gum_pitch_hearth',mat:'bitumen_gum',qty:3},
  {part:'fuel_billets',mat:'casuarina_fuel',qty:3},
  {part:'sawyer_shed_thatch',mat:'thatch_costularia',qty:5}
 ],
 sk_ropewalk_pitch:[
  {part:'ropewalk_posts_and_jacks',mat:'mangrove',qty:7},
  {part:'coir_and_hibiscus_cables',mat:'coir_hibiscus',qty:9},
  {part:'byssus_top_lines',mat:'byssus_cloth',qty:2},
  {part:'sharkskin_sun_canopy',mat:'shark_ray_hide',qty:4},
  {part:'pitch_boiler_masonry',mat:'laterite',qty:5},
  {part:'boiler_flame_crown',mat:'laterite_terracotta',qty:2},
  {part:'gjar_bitumen_and_gum',mat:'bitumen_gum',qty:5},
  {part:'boiler_fuel',mat:'casuarina_fuel',qty:4},
  {part:'cordage_loft_walls',mat:'salvage_hull',qty:5}
 ],
 sk_paktong_foundry:[
  {part:'furnace_plinth_and_breast',mat:'serpentinite',qty:10},
  {part:'reverberatory_vault',mat:'laterite',qty:8},
  {part:'tall_kaen_flame_crown',mat:'laterite_terracotta',qty:4},
  {part:'roast_heap_ore_charge',mat:'copper_zinc_ore',qty:8},
  {part:'nickel_ash_flux',mat:'verdigris_ash',qty:5},
  {part:'roast_and_smelt_fuel',mat:'casuarina_fuel',qty:7},
  {part:'ray_hide_twin_bellows',mat:'shark_ray_hide',qty:3},
  {part:'brucite_ingot_mould_bed',mat:'brucite_travertine',qty:4},
  {part:'white_paktong_ingots',mat:'paktong',qty:5},
  {part:'foundry_shed_roof',mat:'araucaria',qty:5}
 ],
 sk_fish_saltery:[
  {part:'intertidal_weir_arms',mat:'pillow_basalt',qty:7},
  {part:'wattled_weir_stakes',mat:'mangrove',qty:5},
  {part:'solar_salt_pan_curbs',mat:'brucite_travertine',qty:6},
  {part:'pan_lime_floor',mat:'shell_limewash',qty:4},
  {part:'crystallised_sea_salt',mat:'sea_salt',qty:5},
  {part:'smokehouse_walls',mat:'laterite',qty:5},
  {part:'smokehouse_paperbark_roof',mat:'paperbark',qty:4},
  {part:'twin_smoke_crowns',mat:'laterite_terracotta',qty:2},
  {part:'pumice_float_fish_racks',mat:'pumice',qty:3}
 ],
 sk_lime_kiln:[
  {part:'battered_kiln_drum',mat:'serpentinite',qty:8},
  {part:'draw_arch_voussoirs',mat:'laterite',qty:5},
  {part:'self_limewashed_coat',mat:'shell_limewash',qty:5},
  {part:'limeshelf_and_shell_charge',mat:'brucite_travertine',qty:6},
  {part:'oyster_shell_heaps',mat:'shell_chime',qty:4},
  {part:'kiln_fuelwood',mat:'casuarina_fuel',qty:6},
  {part:'charging_ramp_and_shed',mat:'mangrove',qty:4},
  {part:'slaking_shed_thatch',mat:'thatch_costularia',qty:3}
 ],
 sk_boat_grid_shed:[
  {part:'tarred_careening_crib',mat:'tarred_mangrove',qty:9},
  {part:'greased_launch_skids',mat:'mangrove',qty:6},
  {part:'shed_board_walls',mat:'salvage_hull',qty:7},
  {part:'hull_planking_offcuts',mat:'araucaria',qty:6},
  {part:'caulking_bitumen_gum',mat:'bitumen_gum',qty:3},
  {part:'catechu_patched_sails',mat:'catechu_stain',qty:3},
  {part:'thatch_and_paperbark_roof',mat:'thatch_costularia',qty:6},
  {part:'portal_clay_mask',mat:'laterite_terracotta',qty:1}
 ],
 sk_tide_shrine:[
  {part:'stepped_intertidal_terrace',mat:'serpentinite',qty:9},
  {part:'arched_brucite_baldachin',mat:'brucite_travertine',qty:8},
  {part:'tidal_mirror_basin',mat:'pillow_basalt',qty:4},
  {part:'carved_tide_gauge_post',mat:'ohia',qty:3},
  {part:'spring_neap_double_dark_inlays',mat:'paktong',qty:3},
  {part:'suspended_nacre_shell_chimes',mat:'shell_chime',qty:4},
  {part:'shrine_ancestor_mask',mat:'paktong',qty:1},
  {part:'sea_byssus_votive_ribbons',mat:'byssus_cloth',qty:2}
 ]
};

const SK_BILLS={};
for(const skKey in SK_RAW_BILLS){
 SK_BILLS[skKey]=skCompileBill(SK_RAW_BILLS[skKey]);
}

/* Full 44-row Voth census trade mapping for Shore-kin villages & harbour yards ([G data]) */
const SK_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',defs:['sk_serpentine_lodge','sk_fish_saltery']},
 {trade:'butchers',voth:'voth_bldg_butcher',defs:['sk_fish_saltery']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',defs:['sk_hex_lime_house','sk_byssus_court']},
 {trade:'brewers',voth:'voth_bldg_brewery',defs:['sk_serpentine_lodge','sk_client_hall']},
 {trade:'tanners',voth:'voth_bldg_tannery',defs:['sk_fish_saltery','sk_ropewalk_pitch']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',defs:['sk_boat_grid_shed','sk_spar_sawpit','sk_compound_house']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',defs:['sk_client_hall','sk_serpentine_lodge']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',defs:['sk_client_hall']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',defs:['sk_boat_grid_shed','sk_tide_shrine']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',defs:['sk_tide_shrine']},
 {trade:'shrine keepers',voth:'village shrine',defs:['sk_tide_shrine']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',defs:['sk_compound_house','sk_byssus_court','sk_client_hall']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',defs:['sk_paktong_foundry','sk_spar_sawpit','sk_ropewalk_pitch']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',defs:['sk_client_hall']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',defs:['sk_compound_house','sk_boat_grid_shed']},
 {trade:'industrial workers',voth:'industrial lot',defs:['sk_paktong_foundry','sk_ash_kelp_kiln','sk_lime_kiln','sk_ropewalk_pitch']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'Arcoforte tide rotors and impounding tide-mills power heavy spring campaigns; hinterland villages run wood/kelp kilns by hand'},
 {trade:'household service',voth:'rich house, manor, clan compound',defs:['sk_compound_house','sk_byssus_court','sk_client_hall']},
 {trade:'soldiers',voth:'voth_barracks',defs:['sk_client_hall']},
 {trade:'teachers and scholars',voth:'voth_school',defs:['sk_client_hall','sk_tide_shrine']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',defs:['sk_client_hall']},
 {trade:'customs officers and clerks',voth:'customs house',defs:['sk_client_hall']},
 {trade:'healers and nurses',voth:'house of healing',defs:['sk_hex_lime_house','sk_serpentine_lodge']},
 {trade:'priests and undertakers',voth:'funerary temple',defs:['sk_tide_shrine']},
 {trade:'lighthouse keepers',voth:'lighthouse',defs:['sk_tide_shrine']},
 {trade:'dockers and stevedores',voth:'harbour pier',defs:['sk_boat_grid_shed','sk_crib_rowhouse']},
 {trade:'river bargemen and quay hands',voth:'river quay',defs:['sk_boat_grid_shed','sk_boardwalk_shack']},
 {trade:'fishers',voth:'fishing dock',defs:['sk_stilt_cot','sk_fish_saltery','sk_crib_rowhouse']},
 {trade:'market traders',voth:'market stall',defs:['sk_client_hall','sk_byssus_court']},
 {trade:'farmhands and ploughmen',voth:'fields',defs:['sk_serpentine_lodge','sk_stilt_cot']},
 {trade:'chinampa growers',voth:'chinampa bed',defs:['sk_stilt_cot'],note:'taro and pandan swale beds mulched with wrack behind the mangrove belt'},
 {trade:'orchardmen',voth:'orchards',defs:['sk_spar_sawpit','sk_hex_lime_house'],note:'breadfruit, coconut and Agathis kauri-gum stands'},
 {trade:'miners',voth:'mine',defs:['sk_paktong_foundry','sk_ash_kelp_kiln'],note:'roasts copper/zinc ore and Pycnandra nickel-ash for the spring paktong campaign'},
 {trade:'quarrymen and masons',voth:'quarry',defs:['sk_lime_kiln']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',defs:['sk_compound_house','sk_serpentine_lodge']},
 {trade:'beetle herders',voth:'beetle ranch',na:'maritime volcanic archipelago; Shore-kin tend intertidal fish weirs, byssus beds and coastal goats rather than ash beetles'},
 {trade:'dairymen',voth:'dairy',defs:['sk_serpentine_lodge']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',defs:['sk_stilt_cot','sk_serpentine_lodge']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'humid tropic island slopes grow taro, breadfruit, coconut and pandan rather than subterranean dark-fungi'},
 {trade:'envoys and embassy staff',voth:'embassy',defs:['sk_client_hall']},
 {trade:'ferrymen',voth:'ferry, stop',defs:['sk_boat_grid_shed','sk_boardwalk_shack']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'shallops, skiffs and log chutes carry Shore-kin timber, ash and salt to Arcoforte'},
 {trade:'monks and lay brothers',voth:'monastery',defs:['sk_tide_shrine']},
 {trade:'palace and canton staffs',voth:'the cantons',defs:['sk_client_hall']}
];

function skTradeDefs(){
 const out={};
 for(let i=0;i<SK_TRADES.length;i++){
  const r=SK_TRADES[i];
  if(!r.na&&r.defs)out[r.trade]=r.defs.slice();
 }
 return out;
}

globalThis.SK_BILLS=SK_BILLS;
globalThis.skCompileBill=skCompileBill;
globalThis.skValidateBill=skValidateBill;
globalThis.SK_TRADES=SK_TRADES;
globalThis.skTradeDefs=skTradeDefs;
