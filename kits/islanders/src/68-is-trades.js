// prefix: is
// ================================================================= THE TRADES: every trade the Voth city carries, in both sets
// The owner (2026-10-14): both Islander sets carry every trade in the Voth city's census (settlements/voth/targets/voth-city,
// 15-vc-tune.js TUNE.census and 36-vc-census.js's labels). One row per census trade: the Voth building it works in, and the
// Islander defs that carry it in the West and in Kautoa. A trade that cannot exist on the isles says why (na) and has none.
// verify.py --assert 'voth-trades' checks that every other row names at least one def in each set, of that set's style.
// The catalog's job vocabulary (core/tags) is fixed, so a trade with no job there is carried by the def's role tag instead.
const IS_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',west:['iw-bakehouse'],east:['ie-bakehouse']},
 {trade:'butchers',voth:'voth_bldg_butcher',west:['iw-butcher'],east:['ie-butcher']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',west:['iw-weaver'],east:['ie-weaver']},
 {trade:'brewers',voth:'voth_bldg_brewery',west:['iw-kava'],east:['ie-kava-house']},
 {trade:'tanners',voth:'voth_bldg_tannery',west:['iw-tannery'],east:['ie-tannery']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',west:['iw-dockyard'],east:['ie-dockyard']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',west:['iw-guesthouse'],east:['ie-guesthouse']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',west:['iw-watchtower','iw-gate'],east:['ie-watchtower','ie-gate']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',west:['iw-canoeshed'],east:['ie-canoeshed']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',west:['iw-temple'],east:['ie-temple']},
 {trade:'shrine keepers',voth:'village shrine',west:['iw-temple','iw-square'],east:['ie-temple','ie-square','ip-shrine']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',west:['iw-shophouse','iw-chandler'],east:['ie-trader','ie-chandler']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',west:['iw-smithy','iw-potter'],east:['ie-smithy','ie-potter']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',west:['iw-kava'],east:['ie-kava-house']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',west:['iw-warehouse','iw-godown'],east:['ie-warehouse']},
 {trade:'industrial workers',voth:'industrial lot',west:['iw-warehouse','iw-saltworks'],east:['ie-warehouse','ie-saltworks']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'no electricity on the isles'},
 {trade:'household service',voth:'rich house, manor, clan compound',west:['iw-house-gadang','iw-house-chief'],east:['ie-house-noble','ie-house-chief','ip-residence']},
 {trade:'soldiers',voth:'voth_barracks',west:['iw-barracks'],east:['ie-barracks']},
 {trade:'teachers and scholars',voth:'voth_school',west:['iw-school'],east:['ie-school']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',west:['iw-hall'],east:['ie-hall']},
 {trade:'customs officers and clerks',voth:'customs house',west:['iw-harbourmaster'],east:['ie-harbourmaster']},
 {trade:'healers and nurses',voth:'house of healing',west:['iw-healer'],east:['ie-healer']},
 {trade:'priests and undertakers',voth:'funerary temple',west:['iw-temple'],east:['ie-temple']},
 {trade:'lighthouse keepers',voth:'lighthouse',west:['iw-beacon'],east:['ie-beacon']},
 {trade:'dockers and stevedores',voth:'harbour pier',west:['iw-quay'],east:['ie-quay']},
 {trade:'river bargemen and quay hands',voth:'river quay',west:['iw-quay'],east:['ie-quay']},
 {trade:'fishers',voth:'fishing dock',west:['iw-fishdock','iw-hut-fisher'],east:['ie-fishdock']},
 {trade:'market traders',voth:'market stall',west:['iw-market'],east:['ie-market']},
 {trade:'farmhands and ploughmen',voth:'fields',west:['iw-farm','iw-farm-poor'],east:['ie-farm','ie-farm-poor']},
 {trade:'chinampa growers',voth:'chinampa bed',west:['iw-farm'],east:['ie-farm'],note:'the rice paddies and taro beds'},
 {trade:'orchardmen',voth:'orchards',west:['iw-farm'],east:['ie-farm-poor'],note:'the groves of coconut, banana and breadfruit'},
 {trade:'miners',voth:'mine',west:['iw-mine','iw-sulphur'],east:['ie-mine','ie-sulphur'],note:'the mines work the nearest iron, copper or gold node (kits/resources); sulphur is dug at the vents'},
 {trade:'quarrymen and masons',voth:'quarry',west:['iw-quarry'],east:['ie-quarry']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',west:['iw-granary','iw-granary-row','iw-windmill'],east:['ie-granary','ie-granary-great','ie-windmill']},
 {trade:'beetle herders',voth:'beetle ranch',na:'no beetles kept on the isles: the buffalo byre and the pens carry the stock'},
 {trade:'dairymen',voth:'dairy',west:['iw-byre'],east:['ie-byre']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',west:['iw-pens'],east:['ie-pens']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'no fungus farms in the isles\' sun'},
 {trade:'envoys and embassy staff',voth:'embassy',west:['iw-guesthouse'],east:['ie-envoy'],note:'the West lodges envoys in its guest longhouse'},
 {trade:'ferrymen',voth:'ferry, stop',west:['iw-ferry'],east:['ie-ferry']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs on the isles'},
 {trade:'monks and lay brothers',voth:'monastery',west:['iw-temple'],east:['ie-temple']},
 {trade:'palace and canton staffs',voth:'the cantons',west:['iw-hall','iw-house-chief'],east:['ip-palace','ie-hall']}
];
globalThis.IS_TRADES=IS_TRADES;
/* the kit's footprints for a city layout (core/city's kit.dims; the isle demo's P6): every building def's declared box and tags,
   by key. A layout reads it as data; the bundle that draws the buildings in another page comes with the isle demo's city plan. */
function isDims(){const out={};for(const k in DEFS){const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
 out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,rock:d.tags.rock||null,level:d.tags.level||null,wealth:d.tags.wealth,types:d.tags.types,role:d.tags.role||null,job:d.tags.job||null,cut:!!d.cut,shore:FAMILIES.some(f=>f.shore&&f.keys.includes(k))};}
 return out;}
globalThis.isDims=isDims;
