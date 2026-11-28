// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are preset view names: alphanumeric, spaces, commas, parentheses and hyphens only — zero apostrophes, colons or slashes
// (tools/check_views.py, survey item 30). Places all 38 tk_* defs and the 60 world resource nodes from kits/resources.
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Jomon pit-lodges and stepped Ainu bark-and-reed cise huts',keys:['tk_jomon_pit_poor','tk_bark_cise_poor','tk_twin_pit_kin_poor']},
 {name:'Middle split-cypress Tlingit plank houses and valley-spur stilt lodges',keys:['tk_plank_cise_mid','tk_cedar_plank_mid','tk_spur_stilt_mid','tk_lineage_longhouse_mid']},
 {name:'Monumental Timpar-Cise clan great-halls with totem-mouth portals and daak tiers',keys:['tk_timpar_cise_rich','tk_chieftain_totem_hall','tk_twin_hearth_clan_rich']},
 {name:'Kanopi canopy-rib reliquary, iomante bear court and nusa mortuary totem row',keys:['tk_kanopi_shrine','tk_iomante_bear_court','tk_nusa_mortuary_row']},
 {name:'Potlatch feast-hall, shaman sweat-lodge and Utari-Kuran cousin truce-lodge',keys:['tk_potlatch_feast_hall','tk_shaman_sweat_lodge','tk_cousin_truce_lodge']},
 {name:'Chasi-noow log-crib ridge fort, Eternian trophy gate and rockfall trap-crib',keys:['tk_chasi_noow_fort','tk_trophy_stockade_gate','tk_rockfall_trap_crib']},
 {name:'Clan raid mustering ground, captive ransom stockade and mist-pass signal pyre',keys:['tk_raid_mustering_ground','tk_ransom_stockade','tk_signal_pyre_tower']},
 {name:'Salmon weir smokehouse, grease try-works, dugout canoe yard and totem carver',keys:['tk_salmon_weir_smokehouse','tk_grease_tryworks','tk_dugout_armour_yard','tk_totem_carving_shed','tk_kaen_firing_court','tk_attus_chilkat_loom']},
 {name:'Camas earth-oven, pu granary, pony-hound corral, goat byre and clan barter hall',keys:['tk_camas_earth_oven','tk_pu_clan_granary','tk_pony_hound_corral','tk_goat_pelt_byre','tk_berry_mead_tavern','tk_barter_crest_post','tk_spore_flash_apothecary','tk_kanopi_salvage_yard']},
 {name:'Native-copper cold-forge, jade adze-grinder and Veiled-Mountain resource nodes',keys:['tk_copper_cold_forge','tk_jade_adze_grinder'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))}
];
