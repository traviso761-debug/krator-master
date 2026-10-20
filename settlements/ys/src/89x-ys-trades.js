/* ======================================================================
   Ys: the census of the Voth city's trades (2026-10-19) [G data]. YS_TRADES says, for each of the 44 trades of
   tools/trades_census.json, which building of this build carries it (keys: the Hykkousoi registry keys of
   60-ys-registries.js and the foreign quarter's), why it cannot exist here (na) or what building is missing (gap; keys and
   a gap together = partly carried). A table of what exists: no drawing, no browser. tools/check_trades.py reads it
   (verify.py asserts 'voth-trades'); KNOWN_ISSUES.md lists the gaps. On the city page (dist/ys.html) only.
   ====================================================================== */
const YS_TRADES = [
 {trade:'bakers', keys:[], gap:'a bakehouse: hyk_shop_food sells food but bakes none (fire-cooked food is lore)'},
 {trade:'butchers', keys:[], gap:'a butcher\'s and slaughter shed (the fishmonger hyk_fishmonger is the sea\'s counterpart)'},
 {trade:'weavers and dyers', keys:['hyk_shop_cloth'], note:'cloth and dye, the murex purple'},
 {trade:'brewers', keys:[], gap:'a brewhouse or still'},
 {trade:'tanners', keys:[], gap:'a tannery (hides, and the sharkskin and ray-leather the sea gives)'},
 {trade:'shipwrights and boatbuilders', keys:['hyk_shipwright','hyk_boat_shed','hyk_ship_shed_military'], note:'the slipway and shed; the boat shed; the military ship shed'},
 {trade:'innkeepers and grooms', keys:['hyk_caravanserai'], note:'near the main market'},
 {trade:'town guard', keys:['hyk_wet_cells'], gap:'a watch house (the Ancient police station is a ruin host, not a Hykkousoi building)', note:'the Wet Cells, the prison'},
 {trade:'coast guard', keys:['hyk_hexareme_berth','hyk_ship_shed_military','hyk_boom_chain'], note:'the military harbour: hexareme berth, ship shed, boom chain'},
 {trade:'temple priests and servants', keys:['hyk_temple_tides','hyk_temple_winds']},
 {trade:'shrine keepers', keys:['hyk_shrine_tides','hyk_shrine_seagods'], note:'independent and grown-on (hyk_pod_shrine_*)'},
 {trade:'shopkeepers and assistants', keys:['hyk_shop_general','hyk_shop_chandler','hyk_shop_pearl','hyk_shop_salt','hyk_shop_armour','hyk_shop_weapon','hyk_shop_alchemy']},
 {trade:'smiths and craftsmen', keys:['hyk_smithy_large','hyk_smithy_small','hyk_shop_potter','hyk_shop_pearl'], note:'the scrap smithies, the potter and glassmaker, the pearl and shell-inlay workers'},
 {trade:'innkeepers and servers', keys:['hyk_tavern_1','hyk_inn'], note:'taverns independent and grown-on (hyk_pod_tavern_*)'},
 {trade:'porters and warehousemen', keys:['hyk_warehouse_large','hyk_warehouse_small','hyk_warehouse_round']},
 {trade:'industrial workers', keys:['hyk_smithy_large','hyk_shipwright'], note:'the large scrap smithy and the slipway yard; the Hykkousoi keep no factory'},
 {trade:'power-house stokers and engineers', keys:['hyk_generator']},
 {trade:'household service', keys:['hyk_house_rich_1','hyk_house_rich_2','hyk_house_rich_3','hyk_pod_rich_1','hyk_pod_rich_2'], note:'the rich houses, independent and grown-on'},
 {trade:'soldiers', keys:['hyk_barracks','hyk_ballista','hyk_muster']},
 {trade:'teachers and scholars', keys:['hyk_library'], note:'the Library of Ys; no school building'},
 {trade:'guild officers and clerks', keys:['hyk_navigators_guild','hyk_pearlmongers_guild','hyk_treasury']},
 {trade:'customs officers and clerks', keys:[], gap:'a customs house on the main quay (the Treasury, hyk_treasury, is the Archon\'s)'},
 {trade:'healers and nurses', keys:[], gap:'a Hykkousoi house of healing (the Ancient hospital is a ruin host, not a Hykkousoi building)'},
 {trade:'priests and undertakers', keys:['hyk_temple_tides','hyk_shrine_tides'], gap:'no burial ground or undertaker (the most sacred sites lie on the sea bottom)'},
 {trade:'lighthouse keepers', keys:['hyk_pharos_crown'], note:'the Pharos, its beacon lantern and turning beam'},
 {trade:'dockers and stevedores', keys:['hyk_quay','hyk_pier','hyk_wet_landing','hyk_market_main'], note:'the quay, the pier, the wet landing, the main market on the docks'},
 {trade:'river bargemen and quay hands', keys:[], gap:'a river quay and barge landing on the river that runs into the bay'},
 {trade:'fishers', keys:['hyk_aquaculture_pen','hyk_boat_shed','hyk_fishmonger'], note:'the aquaculture pens, the boat shed and the fishmonger at the fishing docks'},
 {trade:'market traders', keys:['hyk_market_main','hyk_market_plaza','hyk_market_nbhd_1','hyk_market_nbhd_2'], note:'the main market, the grown raised plaza and the neighbourhood markets'},
 {trade:'farmhands and ploughmen', keys:['hyk_farm_field','hyk_farmhouse_1','hyk_farmhouse_2']},
 {trade:'chinampa growers', na:'the Hykkousoi farm the sea (aquaculture pens) and the land behind the city; they float no garden rafts'},
 {trade:'orchardmen', keys:[], gap:'an orchard on the north-west bay\'s land (the biome kit biomes/nwbay has the trees)'},
 {trade:'miners', na:'the lore\'s scrap smithies work unrusted salvage and the hulk-breakers\' strand: Ys has no mines'},
 {trade:'quarrymen and masons', na:'the Hykkousoi buildings are grown, not quarried (DESIGN section 4)'},
 {trade:'granary keepers and millers', keys:['hyk_granary','hyk_windmill']},
 {trade:'beetle herders', na:'no beetle ranches: the Hykkousoi are a sea people'},
 {trade:'dairymen', keys:[], gap:'a dairy byre behind the farmhouses'},
 {trade:'swineherds and duck keepers', keys:[], gap:'a sty and duck coop beside the farmhouses'},
 {trade:'mushroom growers', na:'no fungus farms: a coastal people with sun on the land and shellfish in the sea'},
 {trade:'envoys and embassy staff', na:'tabled until embassies have an in-game purpose'},
 {trade:'ferrymen', keys:['hyk_wet_landing'], note:'water is a street: the wet landing is where the boats put in'},
 {trade:'elephant bug handlers and station hands', na:'no elephant bugs: the Hykkousoi keep no beasts of burden'},
 {trade:'monks and lay brothers', keys:['port_order_chapterhouse'], note:'the Historians\' chapterhouse, a foreign order\'s house in the foreign quarter'},
 {trade:'palace and canton staffs', keys:['hyk_citadel','hyk_amphitriton'], note:'the Archon\'s Citadel and the Amphitriton'}
];
globalThis.YS_TRADES=YS_TRADES;
