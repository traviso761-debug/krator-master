/* ======================================================================
   Reed Lake: the census of the Voth city's trades (2026-10-19) [G data]. RL_TRADES says, for each of the 44 trades of
   tools/trades_census.json, which building of this kit carries it (keys), why it cannot exist here (na) or what building
   is missing (gap; keys and a gap together = partly carried). A table of what exists: it draws nothing and touches no
   browser. tools/check_trades.py reads it (verify.py asserts 'voth-trades'); KNOWN_ISSUES.md lists the gaps.
   ====================================================================== */
const RL_TRADES = [
 {trade:'bakers', keys:[], gap:'a bake hut: reed-flour flatbread ovens on an island'},
 {trade:'butchers', keys:[], gap:'a fish and fowl smoking and butchering shed'},
 {trade:'weavers and dyers', keys:['rl_weaver'], gap:'no dye works: the weaver\'s workshop only works reed', note:'the reed weaver\'s workshop'},
 {trade:'brewers', keys:[], gap:'a brewing hut (reed beer, chicha)'},
 {trade:'tanners', keys:[], gap:'a hide-working island away from the houses'},
 {trade:'shipwrights and boatbuilders', keys:[], gap:'a reed-boat builder\'s island (the boats exist as furniture: rl_boat_canoe, rl_boat_great, rl_boat_raft)'},
 {trade:'innkeepers and grooms', na:'no caravans: the lake is reached by boat and keeps no beasts of burden'},
 {trade:'town guard', keys:['rl_watchtower']},
 {trade:'coast guard', na:'a small lake: the watchtower and the warriors\' boats watch the water'},
 {trade:'temple priests and servants', keys:['rl_shaman','rl_spirit_circle'], note:'the shaman\'s house and the sacred circle'},
 {trade:'shrine keepers', keys:['rl_spirit_circle']},
 {trade:'shopkeepers and assistants', keys:[], gap:'a shop island or stall: the reed weaver\'s workshop and the warehouse are tagged market/shop but keep no counter'},
 {trade:'smiths and craftsmen', keys:['rl_smithy','rl_weaver'], note:'the scrap smithy; the weaver\'s workshop'},
 {trade:'innkeepers and servers', keys:['rl_tavern']},
 {trade:'porters and warehousemen', keys:['rl_warehouse']},
 {trade:'industrial workers', na:'a pre-industrial reed culture: no factories or industrial lots'},
 {trade:'power-house stokers and engineers', na:'no electric light or power (README): fire is reed and wood'},
 {trade:'household service', na:'no rich houses or manors: the dwellings are poor and middle (rl_small_*, rl_large_*)'},
 {trade:'soldiers', keys:['rl_warrior_hall']},
 {trade:'teachers and scholars', keys:[], gap:'a teaching hut (the lore keeper\'s school; the shaman\'s house keeps the sacred lore)'},
 {trade:'guild officers and clerks', na:'a village of kin: no guilds or clerks'},
 {trade:'customs officers and clerks', na:'a small lake village: no customs post'},
 {trade:'healers and nurses', keys:['rl_shaman'], note:'the shaman heals; no separate healing house', gap:'a house of healing'},
 {trade:'priests and undertakers', keys:['rl_shaman','rl_spirit_circle']},
 {trade:'lighthouse keepers', na:'a small lake: no lighthouse'},
 {trade:'dockers and stevedores', na:'a small lake: the fishing dock and the warehouse are worked by the fishers and porters'},
 {trade:'river bargemen and quay hands', na:'no river traffic: the lake villages are linked by reed boats'},
 {trade:'fishers', keys:['rl_dock','rl_fishfarm'], note:'the fishing dock; the fish weir'},
 {trade:'market traders', keys:[], gap:'a floating market raft where the villages trade'},
 {trade:'farmhands and ploughmen', keys:['rl_farmhouse','rl_farm'], note:'the farmhouse and the floating gardens'},
 {trade:'chinampa growers', keys:['rl_farm'], note:'the floating gardens'},
 {trade:'orchardmen', na:'no orchards: the lake grows reed, totora and garden rafts'},
 {trade:'miners', na:'no ore on a reed lake'},
 {trade:'quarrymen and masons', na:'no stone: everything is reed and eucalyptus pole'},
 {trade:'granary keepers and millers', keys:['rl_granary'], gap:'no mill'},
 {trade:'beetle herders', na:'no beetles kept on the lake'},
 {trade:'dairymen', keys:[], gap:'a dairy: the animal pen holds the stock but no milking shed'},
 {trade:'swineherds and duck keepers', keys:['rl_pen','rl_fishfarm'], note:'the animal pen; the duck run'},
 {trade:'mushroom growers', na:'no fungus farms under the lake sun'},
 {trade:'envoys and embassy staff', na:'tabled until embassies have an in-game purpose'},
 {trade:'ferrymen', keys:[], gap:'a ferry landing: reed boats exist as furniture (rl_boat_canoe, rl_boat_great) but no ferry station'},
 {trade:'elephant bug handlers and station hands', na:'no elephant bugs on the lake'},
 {trade:'monks and lay brothers', na:'no monastery: the shaman\'s house is the lake people\'s religion'},
 {trade:'palace and canton staffs', keys:['rl_longhouse'], note:'the great mudhif'}
];
globalThis.RL_TRADES=RL_TRADES;
