// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are view names: no apostrophe, no colon, no slash (tools/check_views.py).
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Villaggio poor whale-rib chise huts (HK3)',keys:['hk_house_poor_flenser','hk_house_poor_kelper','hk_house_poor_diver']},
 {name:'Villaggio middle craft chise and nuraghe lodges (HK1 and HK3)',keys:['hk_house_mid_carver','hk_house_mid_harpooneer','hk_house_mid_skipper']},
 {name:'Rich whale-lord nuraghe manors and clan clusters (HK1 and HK3)',keys:['hk_house_rich_steward','hk_house_rich_whalelord','hk_house_rich_clan']},
 {name:'Cliff-terrace hostel, jawbone tavern and Hayrant legation',keys:['hk_inn_terrace','hk_tavern_whale','hk_embassy_hayrant']},
 {name:'Nuraghe complesso, Santa Cristina step-well and Ukor halls (HK1 and HK2)',keys:['hk_nuraghe_complesso','hk_stepwell_sanctuary','hk_ukor_council','hk_ukor_matron_lodge','hk_jade_exchange','hk_lore_hall','hk_healer_lodge','hk_ossuary_barrow']},
 {name:'Nephrite pendulum sawmill, blubber try-works and sea-glass works (HK4)',keys:['hk_jade_sawmill','hk_blubber_tryworks','hk_baleen_loft','hk_kelp_glassworks','hk_market_terrace']},
 {name:'Harpoon smithy, kaen-doki kiln, smokehouse and town trades',keys:['hk_harpoon_smithy','hk_kaen_kiln','hk_smokehouse_saltery','hk_bakehouse','hk_sealhide_tailor','hk_brew_kelp']},
 {name:'Cypress log-flume yard, granary-nuraghe, vault and terrace croft',keys:['hk_cypress_flume_yard','hk_granary_nuraghe','hk_warehouse_vault','hk_terrace_croft']},
 {name:'Megatsunami wave-splitter, Prou-Torre, cliff hoist and harbour (HK4)',keys:['hk_wave_splitter','hk_prou_torre','hk_cliff_hoist','hk_baidarka_yard','hk_crater_quay','hk_ferry_causeway','hk_beacon_nuraghe','hk_cliff_gatehouse','hk_watch_barracks']},
 {name:'Nephrite quarry-mine and resource nodes (kits-resources)',keys:['hk_jade_quarry'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))}
];
