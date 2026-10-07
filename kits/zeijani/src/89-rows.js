// ================================================================= THE SHOWCASE: rows of the kit, by family (front +z toward the camera)
// A row entry is a def key, or {key, o} (place() options: a variant v). PLAN.md 6.5 orders the rows; P3 fills them.
const TITLE='Zeijani Kit';
const FAMILIES=[
 {name:'Dwellings: wooden',keys:['zj_hut_a','zj_hut_b','zj_hut_c','zj_house_wood']},
 {name:'Dwellings: constructed',keys:['zj_house_built_poor','zj_house_built_mid','zj_house_built_rich']},
 {name:'Galleries and estates',keys:['zj_gallery_a','zj_gallery_b','zj_estate_a','zj_estate_b']},
 {name:'Sacred and civic',keys:['zj_kiva','zj_shrine','zj_catacomb','zj_temple','zj_council','zj_cistern','zj_portal','zj_townhall','zj_caravanserai']},
 {name:'Shops: carved fronts',keys:ZS_ITEMS.filter(it=>/_carved$/.test(it.key)).map(it=>it.key)},
 {name:'Shops: constructed',keys:ZS_ITEMS.filter(it=>/_built$/.test(it.key)).map(it=>it.key)},
 {name:'Works and farms',keys:['zj_store_tunnel','zj_warehouse','zj_granary','zj_farm_yam','zj_farm_veg','zj_farm_alecap','zj_farmhouse_wood','zj_farmhouse_carved','zj_brewery','zj_lab','zj_smithy']},
 {name:'The guard and the outpost',keys:['zj_guardpost','zj_barracks_carved','zj_guard_hq','zj_barracks_outpost','zj_watchtower','zj_scout_hq','zj_muster','zj_palisade','zj_gate']},
 {name:'Trade and stalls',keys:['zj_tavern_carved','zj_tavern_built','zj_inn_carved','zj_inn_built','zj_stall_a','zj_stall_b',{key:'zj_stall_b',o:{v:1}}]},
 {name:'The additions',keys:['zj_vent','zj_stonedoor','zj_roost','zj_dovecote','zj_bath','zj_mirror','zj_niche','zj_signal']},
 {name:'The square',keys:['zj_park','zj_rowhouse',{key:'zj_rowhouse',o:{v:1}},{key:'zj_rowhouse',o:{v:2}},'zj_market_hall','zj_fountain']},
 {name:'The cavern test block',keys:['zj_testblock']}
];
