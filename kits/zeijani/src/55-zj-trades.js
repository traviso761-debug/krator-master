// prefix: zt
/* ======================================================================
   THE TRADES (2026-10-19): every trade in the Voth city's census (tools/trades_census.json) against the Zeijani defs.
   A row names the existing def keys that carry the trade, or says why the Zeijani have none (na: a hidden cave people, no
   sea, no electricity), or names what is missing (gap; keys and a gap together: partly carried). Dhelv builds from the kit,
   so this one table serves both. tools/check_trades.py reads it; verify.py asserts it ('voth-trades').
   ====================================================================== */
const ZT_TRADES=[
 {trade:'bakers',keys:['zj_shop_food_carved','zj_shop_food_built'],note:'the provisioner: shop front and kitchen back; no bakehouse or oven yard of its own',gap:'a bakehouse'},
 {trade:'butchers',keys:[],gap:'a butcher (the herders keep cattle; nothing slaughters or sells it)'},
 {trade:'weavers and dyers',keys:['zj_shop_dyer_carved','zj_shop_dyer_built'],note:'the dyer: loom and yarn rack in front, vats behind'},
 {trade:'brewers',keys:['zj_brewery'],note:'the alecap beer'},
 {trade:'tanners',keys:['zj_shop_leather_carved','zj_shop_leather_built'],gap:'a tannery (the leatherworker only works hides)'},
 {trade:'shipwrights and boatbuilders',na:'a hidden cave people: the Chichani took to the sea and left the island; the Zeijani have no boats'},
 {trade:'innkeepers and grooms',keys:['zj_inn_carved','zj_inn_built','zj_caravanserai'],note:'the caravanserai has the stable yard'},
 {trade:'town guard',keys:['zj_guardpost','zj_guard_hq','zj_watchtower','zj_gate']},
 {trade:'coast guard',na:'a hidden cave people with no shore settlement and no boats; their scouts watch the tubes (zj_scout_hq)'},
 {trade:'temple priests and servants',keys:['zj_temple','zj_kiva']},
 {trade:'shrine keepers',keys:['zj_shrine','zj_niche']},
 {trade:'shopkeepers and assistants',keys:['zj_shop_general_carved','zj_shop_general_built']},
 {trade:'smiths and craftsmen',keys:['zj_smithy','zj_shop_weapons_carved','zj_shop_weapons_built','zj_shop_armour_carved','zj_shop_armour_built','zj_shop_potter_carved','zj_shop_potter_built','zj_shop_lampwright_carved','zj_shop_lampwright_built','zj_shop_knapper_carved','zj_shop_knapper_built']},
 {trade:'innkeepers and servers',keys:['zj_tavern_carved','zj_tavern_built']},
 {trade:'porters and warehousemen',keys:['zj_warehouse','zj_store_tunnel']},
 {trade:'industrial workers',keys:['zj_warehouse','zj_smithy','zj_brewery','zj_lab'],note:'works, not factories'},
 {trade:'power-house stokers and engineers',na:'no electricity or engines: light is lamps and glow fungus, heat is fire'},
 {trade:'household service',keys:['zj_estate_a','zj_estate_b','zj_house_built_rich']},
 {trade:'soldiers',keys:['zj_barracks_carved','zj_barracks_outpost','zj_muster']},
 {trade:'teachers and scholars',keys:[],gap:'a school (no def teaches; the kiva and the temple are for rites)'},
 {trade:'guild officers and clerks',keys:['zj_townhall','zj_council'],note:'the town hall holds the records'},
 {trade:'customs officers and clerks',keys:[],gap:'a customs house (the portal and the gate are passages, not offices)'},
 {trade:'healers and nurses',keys:['zj_lab','zj_shop_alchemist_carved','zj_shop_alchemist_built'],note:'fungus medicine',gap:'a house of healing with beds'},
 {trade:'priests and undertakers',keys:['zj_catacomb'],note:'the funeral catacombs and the Keeper'},
 {trade:'lighthouse keepers',keys:['zj_signal'],note:'the signal station stands for a beacon'},
 {trade:'dockers and stevedores',na:'no sea or harbour: the Zeijani hid in the lava tubes'},
 {trade:'river bargemen and quay hands',na:'no river: the tubes are dry, water comes from wells and the cistern'},
 {trade:'fishers',na:'no sea, river or lake to fish'},
 {trade:'market traders',keys:['zj_market_hall','zj_stall_a','zj_stall_b']},
 {trade:'farmhands and ploughmen',keys:['zj_farm_yam','zj_farm_veg','zj_farmhouse_carved','zj_farmhouse_wood']},
 {trade:'chinampa growers',na:'no lake beds on a volcanic island; the yam and vegetable terraces carry the farming'},
 {trade:'orchardmen',keys:[],gap:'an orchard (the terraces grow yams and vegetables only)'},
 {trade:'miners',keys:[],gap:'a mine (the rope outfitter equips cavers; no def digs ore)'},
 {trade:'quarrymen and masons',keys:['zj_shop_stonecutter_carved','zj_shop_stonecutter_built'],gap:'a quarry (the tuff is carved in place)'},
 {trade:'granary keepers and millers',keys:['zj_granary'],gap:'a mill'},
 {trade:'beetle herders',keys:[],gap:'a beetle pen (PLAN.md gives the herders and scouts a rideable staghorn beetle; no def houses it)'},
 {trade:'dairymen',keys:[],gap:'a dairy (the herders keep cattle; nothing milks them)'},
 {trade:'swineherds and duck keepers',keys:['zj_dovecote','zj_roost'],note:'doves and bats, not swine or ducks',gap:'a pigsty or duck yard'},
 {trade:'mushroom growers',keys:['zj_farm_alecap','zj_lab'],note:'the alecap beds in the dark'},
 {trade:'envoys and embassy staff',na:'tabled until embassies have an in-game purpose'},
 {trade:'ferrymen',na:'no river or water crossing to ferry'},
 {trade:'elephant bug handlers and station hands',na:'the elephant bug is the Voth city\'s beast; the Zeijani ride the staghorn beetle'},
 {trade:'monks and lay brothers',na:'no monastic order: the kiva and the temple are served by the Zeijani priests'},
 {trade:'palace and canton staffs',keys:['zj_council','zj_townhall'],note:'a council and a town hall, not a palace'}
];
globalThis.ZT_TRADES=ZT_TRADES;
