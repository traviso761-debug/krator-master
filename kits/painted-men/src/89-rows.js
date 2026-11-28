// ================================================================= THE SHEET: rows by architectural family ([G data])
// Row names are preset view names: alphanumeric, spaces, parentheses and hyphens only — zero apostrophes, colons or slashes
// (tools/check_views.py, survey item 30). Places all 34 pm_* building defs, the Tiered Seep-Alcove Cliff Settlement showcase,
// and the world resource nodes from kits/resources.
const TITLE=KIT.title;
const FAMILIES=[
 {name:'Poor seep-alcove cell, talus boulder hut and hogback cured-bark shelter',keys:['pm_alcove_cell_poor','pm_talus_hut_poor','pm_bark_shelter_poor']},
 {name:'Middle two-storey seep-alcove house, hung moat-ledge dwelling and family maloca',keys:['pm_alcove_house_mid','pm_hung_ledge_mid','pm_house_maloca_mid','pm_terrace_duplex_mid']},
 {name:'Rich Mesa Verde seep-alcove clan compound, spring palace and Great Chief maloca',keys:['pm_alcove_compound_rich','pm_spring_palace_rich','pm_chief_maloca_rich']},
 {name:'Warrior sparring maloca, shamanic stone-circle kiva, songline gallery, ossuary and truce pavilion',keys:['pm_maloca_warrior_hall','pm_stone_circle_shrine','pm_songline_gallery','pm_lorrkon_ossuary','pm_truce_ring_pavilion']},
 {name:'Danxia scarp eyrie watchtower, retractable-ladder cleft gatehouse, parapet and wild-silk winch',keys:['pm_eyrie_watchtower','pm_ladder_gatehouse','pm_ledge_parapet','pm_silk_winch_post']},
 {name:'Pinyon-pitch tus basketry, ochre and orchil cake press, obsidian woomera shop, forge, bark dye and brew maloca',keys:['pm_pitch_basket_shed','pm_ochre_cake_press','pm_woomera_obsidian_shop','pm_salvage_scrap_forge','pm_bark_dye_court','pm_rattlepod_brew_hut']},
 {name:'Dogon talus and cliff-niche granaries, amaranth oven, smokehouse, healer, seep garden, corral and salvage tank',keys:['pm_talus_granary','pm_niche_granary_wall','pm_amaranth_roast_oven','pm_smokehouse_jerky','pm_paintbrush_healer','pm_ledge_seep_garden','pm_pronghorn_corral','pm_salvage_tank_round']},
 {name:'Tiered Seep-Alcove and Talus-Fan Cliff Settlement showcase',keys:['pm_cliff_village']},
 {name:'Danxia pigment quarry and Painted Highlands mineral resource nodes (kits-resources)',keys:['pm_pigment_quarry'].concat(Object.keys(RES_ORE.kinds).flatMap(k=>Object.keys(RES_ORE.grades).map(g=>resNodeKey(k,g))))}
];
