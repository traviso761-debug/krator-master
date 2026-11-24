// prefix: ra
// ================================================================= THE TRADES: Voth city census coverage in both Ria Dynastic Reaches ([G data])
// Engine-neutral data and pure functions (no THREE, no DOM):
//   RA_TRADES          all 44 Voth census trades mapped to Lower Ria (lowerRia: ra_west_*) and Upper Ria (upperRia: ra_east_*) defs
//   raTradeDefs(style) returns {trade -> [defKeys...]} for 'lower-ria' or 'upper-ria'
const RA_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',lowerRia:['ra_west_covered_bazaar','ra_west_ziggurat_granary'],upperRia:['ra_east_stoa_agora','ra_east_saffron_press']},
 {trade:'butchers',voth:'voth_bldg_butcher',lowerRia:['ra_west_covered_bazaar'],upperRia:['ra_east_stoa_agora']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',lowerRia:['ra_west_silk_dyeworks'],upperRia:['ra_east_stoa_agora','ra_east_saffron_press']},
 {trade:'brewers',voth:'voth_bldg_brewery',lowerRia:['ra_west_caravanserai_inn'],upperRia:['ra_east_pilgrim_serai']},
 {trade:'tanners',voth:'voth_bldg_tannery',lowerRia:['ra_west_silk_dyeworks'],upperRia:['ra_east_saffron_press']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',lowerRia:['ra_west_boom_arsenal','ra_west_water_gate'],upperRia:['ra_east_chain_drydock','ra_east_skiff_boathouse','ra_east_boatlift_hall']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',lowerRia:['ra_west_caravanserai_inn','ra_west_courier_mansio','ra_west_mule_castellum'],upperRia:['ra_east_pilgrim_serai','ra_east_pass_relay','ra_east_pack_castellum']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',lowerRia:['ra_west_curtain_bastion','ra_west_ishtar_barracks','ra_west_water_gate','ra_west_bussabok_gate'],upperRia:['ra_east_pylon_rampart','ra_east_cavetto_watchfort','ra_east_gopura_gate']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',lowerRia:['ra_west_boom_arsenal','ra_west_water_gate','ra_west_spiral_beacon'],upperRia:['ra_east_chain_drydock','ra_east_skiff_boathouse','ra_east_boatlift_hall']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',lowerRia:['ra_west_prang_cloister','ra_west_celadon_prang_terrace','ra_west_mondop_library','ra_west_pyatthat_hall'],upperRia:['ra_east_thepbidorn_pantheon','ra_east_mandala_cloister','ra_east_kinnara_dromos','ra_east_saffron_viharn']},
 {trade:'shrine keepers',voth:'village shrine',lowerRia:['ra_west_bussabok_gate','ra_west_celadon_prang_terrace','ra_west_prang_cloister','ra_west_lotus_pavilion'],upperRia:['ra_east_caryatid_reliquary','ra_east_kinnara_dromos','ra_east_mandala_cloister','ra_east_saffron_viharn']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',lowerRia:['ra_west_artisan_shophouse','ra_west_covered_bazaar','ra_west_arcade_villa'],upperRia:['ra_east_lapidary_shophouse','ra_east_stoa_agora','ra_east_terrace_house']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',lowerRia:['ra_west_bronze_smithy','ra_west_siege_armoury','ra_west_glaze_kiln'],upperRia:['ra_east_zinc_foundry','ra_east_bronze_arsenal','ra_east_stone_atelier']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',lowerRia:['ra_west_caravanserai_inn','ra_west_courier_mansio'],upperRia:['ra_east_pilgrim_serai','ra_east_pass_relay']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',lowerRia:['ra_west_barge_commissary','ra_west_crane_wharf','ra_west_ziggurat_granary','ra_west_water_gate'],upperRia:['ra_east_terrace_depot','ra_east_counterweight_wharf','ra_east_cliff_granary','ra_east_boatlift_hall']},
 {trade:'industrial workers',voth:'industrial lot',lowerRia:['ra_west_glaze_kiln','ra_west_silk_dyeworks','ra_west_bronze_smithy','ra_west_siege_armoury'],upperRia:['ra_east_zinc_foundry','ra_east_stone_atelier','ra_east_saffron_press','ra_east_bronze_arsenal']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'pre-electric river-and-karst dynasties; canal lock-chutes, counterweight lifts and draft beasts power the works'},
 {trade:'household service',voth:'rich house, manor, clan compound',lowerRia:['ra_west_clan_compound','ra_west_mandarin_court','ra_west_arcade_villa','ra_west_prasat_palace'],upperRia:['ra_east_patrician_manor','ra_east_archon_residences','ra_east_peristyle_villa','ra_east_swan_prasat']},
 {trade:'soldiers',voth:'voth_barracks',lowerRia:['ra_west_strategion_keep','ra_west_ishtar_barracks','ra_west_curtain_bastion','ra_west_mule_castellum'],upperRia:['ra_east_acropolis_keep','ra_east_cavetto_watchfort','ra_east_pylon_rampart','ra_east_pack_castellum']},
 {trade:'teachers and scholars',voth:'voth_school',lowerRia:['ra_west_mondop_library','ra_west_amber_scriptorium'],upperRia:['ra_east_caryatid_reliquary','ra_east_lotus_dome','ra_east_saffron_viharn']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',lowerRia:['ra_west_chakri_chancellery','ra_west_amber_scriptorium','ra_west_pyatthat_hall'],upperRia:['ra_east_archon_dicastery','ra_east_lotus_dome','ra_east_stoa_agora']},
 {trade:'customs officers and clerks',voth:'customs house',lowerRia:['ra_west_weigh_station','ra_west_chakri_chancellery','ra_west_courier_mansio','ra_west_water_gate'],upperRia:['ra_east_caravan_tollhouse','ra_east_archon_dicastery','ra_east_pass_relay','ra_east_boatlift_hall']},
 {trade:'healers and nurses',voth:'house of healing',lowerRia:['ra_west_lotus_thermae','ra_west_aqueduct_cistern'],upperRia:['ra_east_karst_thermae','ra_east_spring_castellum']},
 {trade:'priests and undertakers',voth:'funerary temple',lowerRia:['ra_west_celadon_prang_terrace','ra_west_prang_cloister'],upperRia:['ra_east_caryatid_reliquary','ra_east_thepbidorn_pantheon','ra_east_mandala_cloister']},
 {trade:'lighthouse keepers',voth:'lighthouse',lowerRia:['ra_west_spiral_beacon','ra_west_courier_mansio'],upperRia:['ra_east_pass_relay','ra_east_cavetto_watchfort']},
 {trade:'dockers and stevedores',voth:'harbour pier',lowerRia:['ra_west_crane_wharf','ra_west_barge_commissary','ra_west_water_gate'],upperRia:['ra_east_counterweight_wharf','ra_east_skiff_boathouse','ra_east_boatlift_hall']},
 {trade:'river bargemen and quay hands',voth:'river quay',lowerRia:['ra_west_crane_wharf','ra_west_water_gate','ra_west_lotus_pavilion'],upperRia:['ra_east_counterweight_wharf','ra_east_boatlift_hall','ra_east_skiff_boathouse']},
 {trade:'fishers',voth:'fishing dock',lowerRia:['ra_west_mudbrick_hut','ra_west_stilt_house','ra_west_canal_cottage'],upperRia:['ra_east_skiff_boathouse']},
 {trade:'market traders',voth:'market stall',lowerRia:['ra_west_covered_bazaar','ra_west_artisan_shophouse'],upperRia:['ra_east_stoa_agora','ra_east_lapidary_shophouse','ra_east_lotus_dome']},
 {trade:'farmhands and ploughmen',voth:'fields',lowerRia:['ra_west_ziggurat_granary','ra_west_canal_cottage'],upperRia:['ra_east_saffron_press','ra_east_karst_cottage']},
 {trade:'chinampa growers',voth:'chinampa bed',lowerRia:['ra_west_lotus_pavilion','ra_west_canal_cottage'],upperRia:['ra_east_saffron_press'],note:'canal lotus basins, rice bunds and terraced saffron beds'},
 {trade:'orchardmen',voth:'orchards',lowerRia:['ra_west_ziggurat_granary'],upperRia:['ra_east_saffron_press'],note:'river-levee fruit groves and karst terrace saffron-spice gardens'},
 {trade:'miners',voth:'mine',lowerRia:['ra_west_bronze_smithy'],upperRia:['ra_east_zinc_foundry'],note:'smelts copper-tin bronze in Lower Ria and Neo-Ozark zinc-brass & Compass-Hills lodestone in Upper Ria'},
 {trade:'quarrymen and masons',voth:'quarry',lowerRia:['ra_west_glaze_kiln'],upperRia:['ra_east_quarry_shack','ra_east_stone_atelier']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',lowerRia:['ra_west_ziggurat_granary','ra_west_barge_commissary'],upperRia:['ra_east_cliff_granary','ra_east_terrace_depot','ra_east_saffron_press']},
 {trade:'beetle herders',voth:'beetle ranch',na:'river water-buffalo, ducks and pack-mules serve the Two Reaches; no giant beetles'},
 {trade:'dairymen',voth:'dairy',lowerRia:['ra_west_ziggurat_granary'],upperRia:['ra_east_cliff_granary']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',lowerRia:['ra_west_mudbrick_hut','ra_west_canal_cottage'],upperRia:['ra_east_karst_cottage','ra_east_quarry_shack']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'sunlit subtropical river-plain and karst-terrace agriculture; no dark cavern fungus farms'},
 {trade:'envoys and embassy staff',voth:'embassy',lowerRia:['ra_west_mandarin_court','ra_west_chakri_chancellery','ra_west_pyatthat_hall','ra_west_prasat_palace'],upperRia:['ra_east_archon_residences','ra_east_archon_dicastery','ra_east_saffron_viharn','ra_east_swan_prasat']},
 {trade:'ferrymen',voth:'ferry, stop',lowerRia:['ra_west_crane_wharf','ra_west_water_gate'],upperRia:['ra_east_counterweight_wharf','ra_east_boatlift_hall','ra_east_skiff_boathouse']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'royal river-barges and mule caravans carry Riwa-Wata and Liwa-Wada trade; no elephant bugs'},
 {trade:'monks and lay brothers',voth:'monastery',lowerRia:['ra_west_mondop_library','ra_west_celadon_prang_terrace','ra_west_prang_cloister'],upperRia:['ra_east_kinnara_dromos','ra_east_thepbidorn_pantheon','ra_east_mandala_cloister','ra_east_saffron_viharn']},
 {trade:'palace and canton staffs',voth:'the cantons',lowerRia:['ra_west_strategion_keep','ra_west_chakri_chancellery','ra_west_prasat_palace','ra_west_pyatthat_hall'],upperRia:['ra_east_acropolis_keep','ra_east_archon_dicastery','ra_east_swan_prasat','ra_east_lotus_dome']}
];
globalThis.RA_TRADES=RA_TRADES;

function raTradeDefs(style){
 const col=style==='upper-ria'?'upperRia':'lowerRia';
 const out={};
 for(let i=0;i<RA_TRADES.length;i++){
  const row=RA_TRADES[i];
  if(row.na)continue;
  out[row.trade]=(row[col]||[]).slice();
 }
 return out;
}
globalThis.raTradeDefs=raTradeDefs;
