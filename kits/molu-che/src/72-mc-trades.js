// prefix: mc
// ================================================================= THE TRADES: Voth city census coverage in both Molu-Che styles ([G data])
// Engine-neutral data and pure functions (no THREE, no DOM):
//   MC_TRADES          all 44 Voth census trades mapped to Bench Clans (dikengyuan) and Bonded Vaults (bonduwe)
//   mcTradeDefs(style) returns {trade -> [defKeys...]} for 'dikengyuan' or 'bonduwe'
const MC_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',dikengyuan:['mc_loess_mill_pit','mc_pit_tavern_inn'],bonduwe:['mc_famine_grain_silo','mc_caravan_sled_mansio']},
 {trade:'butchers',voth:'voth_bldg_butcher',dikengyuan:['mc_talpathere_great_byre','mc_pit_tavern_inn'],bonduwe:['mc_salt_and_jerky_cellar','mc_covered_bazaar_trench']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',dikengyuan:['mc_mole_felt_fullery','mc_mid_artisan_pit'],bonduwe:['mc_covered_bazaar_trench','mc_assay_shophouse_pit']},
 {trade:'brewers',voth:'voth_bldg_brewery',dikengyuan:['mc_pit_tavern_inn','mc_tuber_seep_gallery'],bonduwe:['mc_caravan_sled_mansio','mc_famine_grain_silo']},
 {trade:'tanners',voth:'voth_bldg_tannery',dikengyuan:['mc_mole_felt_fullery','mc_talpathere_great_byre'],bonduwe:['mc_sled_wright_yard','mc_salt_and_jerky_cellar']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',dikengyuan:['mc_claw_shoe_smithy','mc_mid_artisan_pit'],bonduwe:['mc_sled_wright_yard','mc_caravan_sled_mansio'],note:'bronze-runner overland caravan sled-wrights on semi-arid Moleshelf'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',dikengyuan:['mc_pit_tavern_inn','mc_talpathere_great_byre'],bonduwe:['mc_caravan_sled_mansio','mc_trail_warden_dugout']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',dikengyuan:['mc_steppe_rim_watch','mc_clan_great_pit','mc_elder_council_pit'],bonduwe:['mc_gate_ramp_bastion','mc_sunken_sally_redoubt','mc_fortified_vault_keep']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',dikengyuan:['mc_steppe_rim_watch','mc_elder_council_pit'],bonduwe:['mc_seismic_watch_mound','mc_gate_ramp_bastion','mc_bypass_customs_gate'],note:'gorge-rim seismic sentries and Weeping Valley bypass escorts'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',dikengyuan:['mc_ancestor_echo_shrine','mc_clan_great_pit'],bonduwe:['mc_amber_seal_scriptorium','mc_grand_bullion_vault']},
 {trade:'shrine keepers',voth:'village shrine',dikengyuan:['mc_ancestor_echo_shrine','mc_elder_council_pit'],bonduwe:['mc_amber_seal_scriptorium','mc_treaty_envoy_court','mc_trail_warden_dugout']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',dikengyuan:['mc_mid_artisan_pit','mc_cucuteni_kiln_pit','mc_mole_felt_fullery'],bonduwe:['mc_covered_bazaar_trench','mc_assay_shophouse_pit','mc_salt_and_jerky_cellar']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',dikengyuan:['mc_claw_shoe_smithy','mc_cucuteni_kiln_pit','mc_mid_artisan_pit'],bonduwe:['mc_sled_wright_yard','mc_lime_and_ashlar_yard','mc_assay_shophouse_pit']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',dikengyuan:['mc_pit_tavern_inn','mc_deep_cistern_bath'],bonduwe:['mc_caravan_sled_mansio','mc_covered_bazaar_trench']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',dikengyuan:['mc_loess_mill_pit','mc_poor_diggers_pit','mc_talpathere_great_byre'],bonduwe:['mc_grand_bullion_vault','mc_famine_grain_silo','mc_caravan_crew_bunks','mc_salt_and_jerky_cellar']},
 {trade:'industrial workers',voth:'industrial lot',dikengyuan:['mc_claw_shoe_smithy','mc_cucuteni_kiln_pit','mc_mole_felt_fullery','mc_amber_grub_cellar'],bonduwe:['mc_lime_and_ashlar_yard','mc_sled_wright_yard','mc_salt_and_jerky_cellar']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'pre-electric Moleshelf loess bench; Talpathere capstans, gravity cisterns and charcoal bellows drive the works'},
 {trade:'household service',voth:'rich house, manor, clan compound',dikengyuan:['mc_rich_double_pit','mc_rich_kin_compound','mc_clan_great_pit'],bonduwe:['mc_vault_factor_manor','mc_treaty_envoy_court','mc_grand_bullion_vault']},
 {trade:'soldiers',voth:'voth_barracks',dikengyuan:['mc_steppe_rim_watch','mc_clan_great_pit','mc_elder_council_pit'],bonduwe:['mc_fortified_vault_keep','mc_sunken_sally_redoubt','mc_gate_ramp_bastion','mc_seismic_watch_mound']},
 {trade:'teachers and scholars',voth:'voth_school',dikengyuan:['mc_elder_council_pit','mc_ancestor_echo_shrine'],bonduwe:['mc_amber_seal_scriptorium','mc_vault_clerk_terraces']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',dikengyuan:['mc_elder_council_pit','mc_clan_great_pit'],bonduwe:['mc_grand_bullion_vault','mc_amber_seal_scriptorium','mc_vault_clerk_terraces']},
 {trade:'customs officers and clerks',voth:'customs house',dikengyuan:['mc_elder_council_pit','mc_steppe_rim_watch'],bonduwe:['mc_bypass_customs_gate','mc_grand_bullion_vault','mc_amber_seal_scriptorium']},
 {trade:'healers and nurses',voth:'house of healing',dikengyuan:['mc_deep_cistern_bath','mc_ancestor_echo_shrine'],bonduwe:['mc_treaty_envoy_court','mc_caravan_sled_mansio']},
 {trade:'priests and undertakers',voth:'funerary temple',dikengyuan:['mc_ancestor_echo_shrine','mc_clan_great_pit'],bonduwe:['mc_amber_seal_scriptorium','mc_fortified_vault_keep']},
 {trade:'lighthouse keepers',voth:'lighthouse',dikengyuan:['mc_steppe_rim_watch','mc_ancestor_echo_shrine'],bonduwe:['mc_seismic_watch_mound','mc_trail_warden_dugout'],note:'steppe dust-beacon and seismic way-stone wardens'},
 {trade:'dockers and stevedores',voth:'harbour pier',dikengyuan:['mc_talpathere_great_byre','mc_poor_diggers_pit'],bonduwe:['mc_caravan_sled_mansio','mc_bypass_customs_gate','mc_caravan_crew_bunks'],note:'caravan sled-ramp loaders and bullion packers'},
 {trade:'river bargemen and quay hands',voth:'river quay',dikengyuan:['mc_deep_cistern_bath','mc_mid_drover_pit'],bonduwe:['mc_caravan_sled_mansio','mc_caravan_crew_bunks'],note:'overland bypass sled-drovers and hydraulic cistern hands'},
 {trade:'fishers',voth:'fishing dock',dikengyuan:['mc_deep_cistern_bath','mc_amber_grub_cellar'],bonduwe:['mc_salt_and_jerky_cellar','mc_trail_warden_dugout'],note:'karst cistern keepers and cured-provision cellarmen'},
 {trade:'market traders',voth:'market stall',dikengyuan:['mc_mole_felt_fullery','mc_cucuteni_kiln_pit','mc_mid_artisan_pit'],bonduwe:['mc_covered_bazaar_trench','mc_assay_shophouse_pit','mc_bypass_customs_gate']},
 {trade:'farmhands and ploughmen',voth:'fields',dikengyuan:['mc_talpathere_great_byre','mc_tuber_seep_gallery','mc_poor_single_yaodong'],bonduwe:['mc_famine_grain_silo','mc_trail_warden_dugout']},
 {trade:'chinampa growers',voth:'chinampa bed',dikengyuan:['mc_tuber_seep_gallery','mc_deep_cistern_bath'],bonduwe:['mc_famine_grain_silo','mc_salt_and_jerky_cellar'],note:'irrigated luma-papa seep-wall gallery beds'},
 {trade:'orchardmen',voth:'orchards',dikengyuan:['mc_tuber_seep_gallery','mc_mid_drover_pit'],bonduwe:['mc_famine_grain_silo','mc_caravan_sled_mansio'],note:'wind-sheltered sunken pit jujube, apricot and saltbush plantings'},
 {trade:'miners',voth:'mine',dikengyuan:['mc_poor_diggers_pit','mc_claw_shoe_smithy','mc_cucuteni_kiln_pit'],bonduwe:['mc_lime_and_ashlar_yard','mc_salt_and_jerky_cellar'],note:'fossorial tunnel-delvers, halite drift miners and karst quarrymen'},
 {trade:'quarrymen and masons',voth:'quarry',dikengyuan:['mc_cucuteni_kiln_pit','mc_poor_diggers_pit'],bonduwe:['mc_lime_and_ashlar_yard','mc_gate_ramp_bastion']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',dikengyuan:['mc_loess_mill_pit','mc_tuber_seep_gallery'],bonduwe:['mc_famine_grain_silo','mc_grand_bullion_vault']},
 {trade:'beetle herders',voth:'beetle ranch',na:'Molu-che clans herd engineered ox-sized Talpathere plough-moles (ktrama-molu); no giant beetles'},
 {trade:'dairymen',voth:'dairy',dikengyuan:['mc_mole_felt_fullery','mc_talpathere_great_byre'],bonduwe:['mc_salt_and_jerky_cellar','mc_caravan_sled_mansio']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',dikengyuan:['mc_amber_grub_cellar','mc_talpathere_great_byre','mc_poor_single_yaodong'],bonduwe:['mc_caravan_sled_mansio','mc_trail_warden_dugout'],note:'Talpathere herds and composted blind amber-grub galleries'},
 {trade:'mushroom growers',voth:'mushroom farm',dikengyuan:['mc_tuber_seep_gallery','mc_amber_grub_cellar'],bonduwe:['mc_salt_and_jerky_cellar','mc_famine_grain_silo']},
 {trade:'envoys and embassy staff',voth:'embassy',dikengyuan:['mc_elder_council_pit','mc_clan_great_pit'],bonduwe:['mc_treaty_envoy_court','mc_amber_seal_scriptorium','mc_grand_bullion_vault']},
 {trade:'ferrymen',voth:'ferry, stop',dikengyuan:['mc_pit_tavern_inn','mc_talpathere_great_byre'],bonduwe:['mc_caravan_sled_mansio','mc_bypass_customs_gate','mc_trail_warden_dugout'],note:'Weeping Valley overland sled-relay station hands'},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'stamp-guided Talpathere teams and bronze-runner sleds haul Moleshelf freight; no elephant bugs'},
 {trade:'monks and lay brothers',voth:'monastery',dikengyuan:['mc_ancestor_echo_shrine','mc_deep_cistern_bath'],bonduwe:['mc_amber_seal_scriptorium','mc_treaty_envoy_court']},
 {trade:'palace and canton staffs',voth:'the cantons',dikengyuan:['mc_clan_great_pit','mc_elder_council_pit','mc_rich_double_pit'],bonduwe:['mc_grand_bullion_vault','mc_fortified_vault_keep','mc_vault_factor_manor']}
];
globalThis.MC_TRADES=MC_TRADES;

function mcTradeDefs(style){
 const col=style==='bonduwe'?'bonduwe':'dikengyuan';
 const out={};
 for(let i=0;i<MC_TRADES.length;i++){
  const row=MC_TRADES[i];
  if(row.na)continue;
  out[row.trade]=(row[col]||[]).slice();
 }
 return out;
}
globalThis.mcTradeDefs=mcTradeDefs;
