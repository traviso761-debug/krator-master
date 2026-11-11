// ================================================================= 74z. THE TRADES: every trade the Voth city carries, in the Iziz Vernacular
// The owner (2026-10-16): "give me an Iziz Vernacular version of every trades and industry-related building the Iziz
// Vernacular kit doesn't have yet". One row per trade of the Voth city's census (settlements/voth/targets/voth-city,
// 15-vc-tune.js TUNE.census and 36-vc-census.js's labels; the list kits/islanders/src/68-is-trades.js keeps), with the
// Voth building it works in and the Vernacular defs that carry it; and the Voth catalog's own shop trades (scribes,
// alchemists, enchanters, potters and glassblowers, clothiers: settlements/voth/catalog/registry/voth-shops.js). `civic` marks a trade whose building is civic (the
// trades round did not touch those: the owner, "skip civic buildings for now"); `na` says why a trade cannot exist here.
// _api.trades() checks every named key is defined (verify.py --assert, 'voth-trades'). [G data]
const VERN_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',iziz:['vern_bakery']},
 {trade:'butchers',voth:'voth_bldg_butcher',iziz:['vern_butcher']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',iziz:['vern_weaver']},
 {trade:'brewers',voth:'voth_bldg_brewery',iziz:['vern_brewery']},
 {trade:'tanners',voth:'voth_bldg_tannery',iziz:['vern_tannery']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',iziz:['vern_boatyard'],note:'river boats and moat lighters: Iziz proper is landlocked'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',iziz:['vern_caravanserai']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',iziz:['vern_watch_house','vern_guard_tower'],civic:true},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'landlocked: no coast to guard'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',na:'no Vernacular temple yet (the temple hill is the Ancients kit\'s)',civic:true},
 {trade:'shrine keepers',voth:'village shrine',na:'no Vernacular shrine yet',civic:true},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',iziz:['vern_shops','vern_provisioner','vern_tailor','vern_apothecary']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',iziz:['vern_smithy','vern_workshop_a','vern_workshop_b','vern_tinker','vern_glassworks']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',iziz:['vern_tavern']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',iziz:['vern_warehouse']},
 {trade:'industrial workers',voth:'industrial lot',iziz:['vern_salvage_yard','vern_glassworks'],note:'Iziz\'s heavy industry breaks Ancient metal'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',iziz:['vern_generator'],civic:true},
 {trade:'household service',voth:'rich house, manor, clan compound',iziz:['vern_house_rich_a','vern_house_rich_b']},
 {trade:'soldiers',voth:'voth_barracks',iziz:['vern_barracks','vern_guard_tower'],civic:true},
 {trade:'teachers and scholars',voth:'voth_school',iziz:['vern_school'],civic:true},
 {trade:'scribes and booksellers',voth:'voth_shop_scribe',iziz:['vern_scribe']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',iziz:['vern_farmers_guild','vern_beast_hunters_guild','vern_forgemasters_hall'],civic:true},
 {trade:'customs officers and clerks',voth:'customs house',iziz:['vern_toll_house'],civic:true},
 {trade:'healers and nurses',voth:'house of healing',iziz:['vern_hospital'],civic:true},
 {trade:'alchemists',voth:'voth_shop_alchemist',iziz:['vern_apothecary','vern_alchemist']},
 {trade:'enchanters',voth:'voth_shop_enchanter',iziz:['vern_tinker'],note:'Iziz\'s enchanter keeps salvaged Ancient electrics and shield cells alive'},
 {trade:'potters and glassblowers',voth:'voth_shop_potter',iziz:['vern_workshop_b','vern_glassworks']},
 {trade:'clothiers',voth:'voth_shop_clothier',iziz:['vern_tailor']},
 {trade:'priests and undertakers',voth:'funerary temple',na:'no Vernacular funerary building yet',civic:true},
 {trade:'lighthouse keepers',voth:'lighthouse',na:'landlocked'},
 {trade:'dockers and stevedores',voth:'harbour pier',iziz:['vern_fish_landing','vern_boatyard'],note:'river and moat landings only; the harbour trades are Port Tobin\'s'},
 {trade:'river bargemen and quay hands',voth:'river quay',iziz:['vern_fish_landing']},
 {trade:'fishers',voth:'fishing dock',iziz:['vern_fish_landing']},
 {trade:'market traders',voth:'market stall',iziz:['vern_market']},
 {trade:'farmhands and ploughmen',voth:'fields',iziz:['vern_farmhouse']},
 {trade:'chinampa growers',voth:'chinampa bed',na:'no lake beds: the farm belt\'s fields carry them (vern_farmhouse)'},
 {trade:'orchardmen',voth:'orchards',iziz:['vern_farmhouse'],note:'the orchards are plots, worked from the farmhouses'},
 {trade:'miners',voth:'mine',iziz:['vern_mine']},
 {trade:'quarrymen and masons',voth:'quarry',iziz:['vern_quarry']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',iziz:['vern_silos','vern_mill']},
 {trade:'beetle herders',voth:'beetle ranch',na:'no beetles are kept in Iziz: the byre and the pens carry the stock, the caravanserai the caravan beasts'},
 {trade:'dairymen',voth:'dairy',iziz:['vern_byre']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',iziz:['vern_pens']},
 {trade:'mushroom growers',voth:'mushroom farm',iziz:['vern_fungus_shed']},
 {trade:'envoys and embassy staff',voth:'embassy',iziz:['port_voth_embassy'],civic:true},
 {trade:'ferrymen',voth:'ferry, stop',na:'no ferries on the moat'},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in Iziz'},
 {trade:'monks and lay brothers',voth:'monastery',iziz:['port_order_chapterhouse'],civic:true},
 {trade:'palace and canton staffs',voth:'the cantons',na:'the palace is the Ancients-style citadel (settlements/iziz/palace: built with the rebuild)',civic:true}
];
// every row's keys defined (a def of this page), and each non-na row carried by one: the audit verify.py asserts
function vernTradesAudit(){const bad=[];let carried=0,na=0;
 for(const T of VERN_TRADES){if(T.na){na++;continue;}const miss=(T.iziz||[]).filter(k=>!VERN.defs[k]);
  if(!T.iziz||!T.iziz.length||miss.length)bad.push(T.trade+': '+(miss.length?'no def '+miss.join(', '):'no building'));else carried++;}
 return{trades:VERN_TRADES.length,carried,na,bad};}
