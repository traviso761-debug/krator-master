// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are preset view names: alphanumeric, spaces, commas, parentheses and hyphens only — zero apostrophes, colons or slashes
// (tools/check_views.py, survey item 30). Places all 35 standalone hs_* buildings, hs_lakeside_sanctuary_row, and all 60 world
// resource nodes from kits/resources.
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Poor high-divide granite cots and ribbon-lake shore crofts',keys:['hs_slate_cot_poor','hs_lake_croft_poor','hs_terrace_pair_poor']},
 {name:'Middle Handspeak sign-loggia houses, white-quartz turrets and arcade rows',keys:['hs_sign_loggia_mid','hs_quartz_gabled_mid','hs_courtyard_sign_mid','hs_arcade_row_mid']},
 {name:'Rich white-quartz heliograph spire villas and bianzhong sanctuary manors',keys:['hs_spire_villa_rich','hs_lithophone_manor_rich','hs_gallery_house_rich']},
 {name:'Stepped Handspeak moot-amphitheatre, 21 m optical heliograph and bianzhong belfry',keys:['hs_handspeak_moot','hs_heliograph_beacon','hs_bianzhong_belfry']},
 {name:'Pre-Cataclysm Acoustic Hush-Pylon shrine, sign academy, infirmary and ossuary',keys:['hs_hush_pylon_shrine','hs_sign_academy','hs_quiet_infirmary','hs_quartz_ossuary']},
 {name:'Open-Palm Southern Hush border gate, mist-watch spire and sanctuary wall',keys:['hs_palm_gate','hs_mist_watch_spire','hs_sanctuary_wall']},
 {name:'Ribbon-lake underwater-cable silent ferry, skiff shed and lithophone lapidary',keys:['hs_silent_ferry','hs_reed_skiff_shed','hs_lithophone_lapidary','hs_felt_weaver']},
 {name:'Radiant slate bakehouse, herb smokehouse, birch brew cellar and bark tannery',keys:['hs_slate_bakehouse','hs_herb_smokehouse','hs_birch_brew_cellar','hs_bark_tannery']},
 {name:'White-quartz granary spire, prism warehouse, wayfarer hospice, tea pavilion and farm',keys:['hs_granary_spire','hs_prism_warehouse','hs_wayfarer_hospice','hs_tea_sign_pavilion','hs_ribbon_terrace_farm']},
 {name:'Milky-quartz quarry, bianzhong bell foundry and Silent-Vales resource nodes',keys:['hs_quartz_quarry','hs_bell_foundry'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))},
 {name:'Ribbon-lake Handspeak sightline promenade and heliograph quay diorama',keys:['hs_lakeside_sanctuary_row']}
];
