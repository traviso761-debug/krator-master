// prefix: tb
/* ================================================================= THE TRADES: Complete 44/44 Voth city census coverage ([G data])
   Engine-neutral data and pure functions (no THREE, no DOM):
   - TB_TRADES     all 44 Voth census trades carried by Urban Tabisti defs (0 gaps, 0 na)
   - tbTradeDefs() returns {trade -> [defKeys...]} */
const TB_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['tb_bakery_tannur','tb_servant_quarters']},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['tb_butcher_icehouse','tb_souq_arcade']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['tb_weaver_dyehouse','tb_shop_house']},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['tb_incense_distillery','tb_tea_tavern']},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['tb_tannery_airy','tb_buffalo_byre']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['tb_boatyard_urban','tb_lake_quay_customs']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['tb_caravanserai_urban','tb_tea_tavern']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['tb_wall_gate','tb_barracks_court','tb_wall_curtain','tb_wall_bastion','tb_wall_corner']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',keys:['tb_beacon_tower','tb_lake_quay_customs','tb_wall_bastion']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['tb_temple_altar_grand','tb_necropolis_qubba']},
 {trade:'shrine keepers',voth:'village shrine',keys:['tb_wayside_salt_shrine','tb_temple_altar_grand']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['tb_shop_house','tb_souq_arcade','tb_bakery_tannur']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['tb_bronze_foundry','tb_kashi_kiln','tb_ganch_mason_yard']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['tb_tea_tavern','tb_caravanserai_urban']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['tb_bonded_warehouse','tb_lake_quay_customs','tb_tenement_court']},
 {trade:'industrial workers',voth:'industrial lot',keys:['tb_lac_refinery','tb_kashi_kiln','tb_potash_evaporator','tb_bronze_foundry']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['tb_power_steamhouse'],note:'municipal naphtha pump-boilers feeding city shadirvan waterworks; houses remain non-electric'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['tb_servant_quarters','tb_lac_merchant_bayt','tb_secession_palazzo','tb_mirador_estate']},
 {trade:'soldiers',voth:'voth_barracks',keys:['tb_barracks_court','tb_wall_bastion','tb_wall_gate','tb_wall_curtain','tb_wall_corner']},
 {trade:'teachers and scholars',voth:'voth_school',keys:['tb_madrasa_library','tb_monk_chapterhouse']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['tb_syndic_guildhall','tb_oriel_townhouse','tb_lac_merchant_bayt']},
 {trade:'customs officers and clerks',voth:'customs house',keys:['tb_lake_quay_customs','tb_wall_gate','tb_syndic_guildhall']},
 {trade:'healers and nurses',voth:'house of healing',keys:['tb_bimaristan_clinic','tb_incense_distillery']},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['tb_necropolis_qubba','tb_temple_altar_grand']},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['tb_beacon_tower','tb_lake_quay_customs']},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['tb_lake_quay_customs','tb_bonded_warehouse','tb_fish_curing_pier']},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['tb_lake_quay_customs','tb_boatyard_urban','tb_fish_curing_pier']},
 {trade:'fishers',voth:'fishing dock',keys:['tb_fish_curing_pier','tb_lake_quay_customs']},
 {trade:'market traders',voth:'market stall',keys:['tb_souq_arcade','tb_shop_house','tb_butcher_icehouse']},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['tb_saltrice_manor','tb_orchard_estate','tb_breeze_cot']},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['tb_saltrice_manor'],note:'lakeside irrigated salt-rice and wet-bed terraces'},
 {trade:'orchardmen',voth:'orchards',keys:['tb_orchard_estate'],note:'date, fig and Liikofi abyss-lac resin-tree groves'},
 {trade:'miners',voth:'mine',keys:['tb_potash_evaporator','tb_ganch_mason_yard'],note:'salt-lake potash/halite brine pans, gypsum, alabaster and copper/turquoise extraction'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['tb_ganch_mason_yard','tb_kashi_kiln']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['tb_windmill_grist','tb_bonded_warehouse','tb_saltrice_manor']},
 {trade:'beetle herders',voth:'beetle ranch',keys:['tb_beetle_lizard_kraal'],note:'dense-air carapace-beetle and pack-lizard corrals'},
 {trade:'dairymen',voth:'dairy',keys:['tb_buffalo_byre']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['tb_buffalo_byre','tb_saltrice_manor']},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['tb_cellar_fungus'],note:'evaporative-cooled double-brick dark vaults for heat-tolerant abyssal fungi'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['tb_embassy_compound','tb_palace_ahedman']},
 {trade:'ferrymen',voth:'ferry, stop',keys:['tb_lake_quay_customs','tb_fish_curing_pier']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',keys:['tb_caravanserai_urban','tb_beetle_lizard_kraal'],note:'Longcrawler and heavy desert/abyssal caravan staging'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['tb_monk_chapterhouse','tb_madrasa_library']},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['tb_palace_ahedman','tb_syndic_guildhall','tb_servant_quarters']}
];
globalThis.TB_TRADES=TB_TRADES;

function tbTradeDefs(){
 const out={};
 for(let i=0;i<TB_TRADES.length;i++){
  const row=TB_TRADES[i];
  if(row.na)continue;
  out[row.trade]=(row.keys||[]).slice();
 }
 return out;
}
globalThis.tbTradeDefs=tbTradeDefs;
