// prefix: et
// ================================================================= THE TRADES: every trade the Voth city carries (the Islanders route)
// The owner (2026-10-20): the kit takes the Islanders route so it ensures a complete set of trade buildings. One row per
// trade of the Voth census (tools/trades_census.json, the yardstick every build's table is checked against), in the
// repo's shape (tools/check_trades.py): `keys` the defs that carry it, `gap` what is not built yet (here: the def that
// will carry it and its phase, PLAN.md sections 4 and 11), `na` why it cannot exist here. `voth` the Voth building it
// works in. verify.py --assert 'voth-trades' and tools/test_all.py run tools/check_trades.py on it; KNOWN_ISSUES.md
// lists the gaps until the phases fill them. [G data]: no three.js, no DOM.
const ET_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['et_bakehouse']},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['et_butcher']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['et_weaver'],note:'the circuit-maze brocade is woven here'},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['et_brewhouse']},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['et_tannery']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['et_dock'],note:"Farport's dockyard and the canal boatyards"},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['et_inn'],note:'the caravans over the Inner Wall end here'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['et_gate']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',keys:['et_quay'],note:"Farport's: the visitors are watched"},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['et_ancestor_gallery'],note:"the city's temple is the hall of heads"},
 {trade:'shrine keepers',voth:'village shrine',keys:['et_shrine_niche']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['et_shophouse']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['et_smithy']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['et_tea_house']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['et_warehouse']},
 {trade:'industrial workers',voth:'industrial lot',keys:['et_kiln','et_tile_works','et_porcelain','et_paper_mill'],note:'the kilns, the tile works, the paper mill, the porcelain works'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['et_tube_station'],note:'no generators: the engineers keep the revived Ancient pneumatic tubes'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['et_official_villa']},
 {trade:'soldiers',voth:'voth_barracks',keys:['et_barracks']},
 {trade:'teachers and scholars',voth:'voth_school',keys:['et_examination_hall']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['et_registry'],note:'the paper state: the registry and the ministries'},
 {trade:'customs officers and clerks',voth:'customs house',keys:['et_customs_house']},
 {trade:'healers and nurses',voth:'house of healing',keys:['et_healer']},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['et_mask_house'],note:"the mask makers and undertakers: every household's dead get a mask"},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['et_lighthouse'],note:"Farport's"},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['et_quay']},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['et_canal_landing'],note:'the canal town lives on its canals'},
 {trade:'fishers',voth:'fishing dock',keys:['et_fish_landing']},
 {trade:'market traders',voth:'market stall',keys:['et_market_hall']},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['et_farmstead']},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['et_paddy'],note:'the lowlands are wet: paddies and raised beds between the canals'},
 {trade:'orchardmen',voth:'orchards',keys:['et_tea_garden'],note:"the lowland infusion and lacquer trees (LORE 6.19's trade)"},
 {trade:'miners',voth:'mine',keys:['et_mine']},
 {trade:'quarrymen and masons',voth:'quarry',keys:['et_quarry']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['et_granary'],note:'and the watermills on the canals'},
 {trade:'beetle herders',voth:'beetle ranch',na:'no beetles in the north-west: the stock pens carry the stock'},
 {trade:'dairymen',voth:'dairy',keys:['et_stock_pens']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['et_stock_pens']},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['et_mushroom_cellar'],note:'a works, not a climate (kits/crops: the dark-grown crops)'},
 {trade:'envoys and embassy staff',voth:'embassy',na:"tabled: Farport's walled quarter for the visitors from over the sea comes with Farport's page (the second pass)"},
 {trade:'ferrymen',voth:'ferry, stop',keys:['et_ferry_landing']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the north-west'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['et_historians_house'],note:'the Order of Historians keeps a chapter house in the capital, for the archives'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:[],gap:"carried outside the kit by the Sanctum (kits/ancients/targets/sanctum: the True Heirs' household, palace/BLUEPRINT.md); the kit's own court defs come in P5"}];
/* every building's declared box and tags by key: a city layout's kit.dims (core/city), as the Islanders' isDims */
function etDims(DEFS,FAMILIES){const out={};for(const k in DEFS){const d=DEFS[k];if(d.cls!=='building')continue;
 out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,wealth:d.tags.wealth,types:d.tags.types,role:d.tags.role||null,
  job:d.tags.job||null,cut:!!d.cut,shore:(FAMILIES||[]).some(f=>f.shore&&f.keys.includes(k))};}
 return out;}
globalThis.ET_TRADES=ET_TRADES;globalThis.etDims=etDims;
