// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are view names: no apostrophe, no colon, no slash (tools/check_views.py).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Lakeside poor houses (SL3 wind-scoops and shamiyana)',keys:['sl_house_poor_reel','sl_house_poor_keeper','sl_house_poor_row']},
 {name:'Lakeside middle houses (SL3 spider-lofts and wind-veils)',keys:['sl_house_mid_weaver','sl_house_mid_factor','sl_house_mid_scholar']},
 {name:'Rich villas and saddle estates (SL1 velaria and SL2 saddles)',keys:['sl_house_rich_villa','sl_house_rich_pavilion','sl_house_rich_clan']},
 {name:'Hostel inn, canal teahouse and Ria legation',keys:['sl_inn_caravan','sl_tavern_canal','sl_embassy_ria']},
 {name:'Silkhead Great Central Caravanserai (SL1 to SL4)',keys:['sl_caravanserai_silkhead']},
 {name:'Palace, Great Hum Sanctuary and civic halls (SL1 and SL2)',keys:['sl_palace_pavilion','sl_hum_sanctuary','sl_silk_bourse','sl_treaty_hall','sl_guild_square','sl_school_scriptorium','sl_healer_pavilion','sl_funerary_shrine']},
 {name:'Silk-reeling market, canal dyehouse and weaver halls (SL4)',keys:['sl_reeling_market','sl_dyehouse_canal','sl_weaver_hall','sl_market_stalls','sl_shophouse_lacquer']},
 {name:'Town trades, kilns, smithy and workshops',keys:['sl_smithy_spindle','sl_potter_kiln','sl_bakery','sl_butcher_smoke','sl_tannery_resin','sl_carpenter_yard']},
 {name:'Warehouse, watermill, mulberry farm and stock',keys:['sl_warehouse_silk','sl_granary_mill','sl_mulberry_farm','sl_dairy_pens']},
 {name:'Weir-bridges, barge-quays and lakeside defence (SL4)',keys:['sl_weir_dock','sl_barge_quay','sl_dockyard','sl_ferry_bridge','sl_beacon_tower','sl_weir_bastion','sl_mast_gatehouse','sl_watch_barracks']},
 {name:'Quarry-mine and resource nodes (kits-resources)',keys:['sl_mine_quarry'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))}
];
