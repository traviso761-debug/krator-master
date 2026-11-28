// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are preset view names: alphanumeric, spaces, parentheses and hyphens only — zero apostrophes, colons or slashes
// (tools/check_views.py, survey item 30). Places all 54 hy_* buildings, the Mixed Vassal Street, Statuary Ranks,
// and the world resource nodes from kits/resources.
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Bench poor loess yaodongs and larch-rib chise huts',keys:['hy_loess_yaodong','hy_larch_chise_poor','hy_scarp_cellar_poor','hy_terrace_row_poor']},
 {name:'Hybrid middle stone-and-lime houses and nuraghe-chise compounds',keys:['hy_bench_house_mid','hy_nuraghe_chise_mid','hy_courtyard_loess_mid','hy_corner_turret_mid']},
 {name:'Rich Utari clan-lord compound and Mirabilis merchant tower',keys:['hy_clan_lord_compound','hy_merchant_tower_rich']},
 {name:'Pepar-Hom Prefectural Seat, Sutar-Tawar Clock Observatory and Hueru-Kuran Legation',keys:['hy_prefect_seat','hy_clock_observatory','hy_kuran_legation']},
 {name:'Assay registry, censorate warden, examination school, tube relay and talking-head stele',keys:['hy_assay_registry','hy_censorate_warden','hy_examination_school','hy_tube_relay','hy_talking_head']},
 {name:'Sutar-Pira head-totem court, spring chime-well, sanctuary and Veilpass defence',keys:['hy_head_totem_court','hy_spring_stepwell','hy_withdrawn_sanctuary','hy_ancestor_barrow','hy_nuraghe_fort','hy_pass_gate','hy_veilpass_picket','hy_wall_segment','hy_beacon_nuraghe']},
 {name:'Saltpeter works, rare-earth smelter, charcoal-tar kiln, insulator kiln and flume',keys:['hy_saltpeter_works','hy_rare_earth_smelter','hy_charcoal_tar_kiln','hy_stoneware_kiln','hy_nephrite_lapidary','hy_larch_flume_yard','hy_iron_smithy','hy_plaid_weaver']},
 {name:'Highland bakehouse, smokehouse, buckwheat brewery, granary-nuraghe and escarpment hoist',keys:['hy_millet_bakehouse','hy_smokehouse_butcher','hy_buckwheat_brewery','hy_pelt_tannery','hy_granary_nuraghe','hy_warehouse_vault','hy_escarpment_hoist']},
 {name:'Caravanserai, irori tavern, dust-market, hot-stone bath, pu chandlery and loess farms',keys:['hy_caravanserai_inn','hy_hearth_tavern','hy_market_hall','hy_healer_bath','hy_pu_chandlery','hy_terrace_farmstead','hy_fell_fold','hy_mushroom_drift','hy_trench_fishery']},
 {name:'Mixed Eternian-Hayrant vassal street, statuary ranks and central-square cyber-totems',keys:['hy_mixed_street','hy_statuary_ranks','hy_grand_cyber_totem','hy_cyber_totem_obelisk']},
 {name:'Outer Wall ore adit and resource nodes (kits-resources)',keys:['hy_ore_adit'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))}
];
