// prefix: yn
// ================================================================= VOTH-CENSUS TRADES & CORE/CITY FOOTPRINTS ([G data])
// Every trade in the Voth city census (settlements/voth/targets/voth-city/15-vc-tune.js): 40 of 44 carried by Yonni defs
// (4 non-applicable to pre-electrical wet coastal mountains, documented with `na`). Pure data, zero browser/THREE calls.
const YN_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',yonni:['yn-bakery']},
 {trade:'butchers',voth:'voth_bldg_butcher',yonni:['yn-butcher']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',yonni:['yn-weaver']},
 {trade:'brewers',voth:'voth_bldg_brewery',yonni:['yn-tavern']},
 {trade:'tanners',voth:'voth_bldg_tannery',yonni:['yn-tannery']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',yonni:['yn-dockyard']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',yonni:['yn-tavern']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',yonni:['yn-tower-formline','yn-gatehouse-portal','yn-watchtower','yn-gate-twindrum','yn-cliff-watch','yn-border-fort']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',yonni:['yn-canoeshed-guard','yn-border-fort']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',yonni:['yn-rotunda-seer','yn-cliff-rotunda','yn-court-rotunda']},
 {trade:'shrine keepers',voth:'village shrine',yonni:['yn-rotunda-seer','yn-cliff-rotunda']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',yonni:['yn-shophouse']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',yonni:['yn-smithy','yn-foundry-bronze','yn-potter','yn-carpenter','yn-cliff-smithy']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',yonni:['yn-tavern']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',yonni:['yn-warehouse']},
 {trade:'industrial workers',voth:'industrial lot',yonni:['yn-foundry-bronze','yn-carpenter','yn-warehouse']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'no electrical generators in Yonni'},
 {trade:'household service',voth:'rich house, manor, clan compound',yonni:['yn-palace-citadel','yn-manor-triad','yn-manor-cupola','yn-manor-envoy']},
 {trade:'soldiers',voth:'voth_barracks',yonni:['yn-border-fort','yn-barracks-lance','yn-citadel-twinkande','yn-tower-formline']},
 {trade:'teachers and scholars',voth:'voth_school',yonni:['yn-school-scriptorium']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',yonni:['yn-hall-sisterhood','yn-court-rotunda']},
 {trade:'customs officers and clerks',voth:'customs house',yonni:['yn-customs-quay']},
 {trade:'healers and nurses',voth:'house of healing',yonni:['yn-alchemist','yn-bath-cistern']},
 {trade:'priests and undertakers',voth:'funerary temple',yonni:['yn-rotunda-seer']},
 {trade:'lighthouse keepers',voth:'lighthouse',yonni:['yn-beacon']},
 {trade:'dockers and stevedores',voth:'harbour pier',yonni:['yn-customs-quay','yn-dockyard']},
 {trade:'river bargemen and quay hands',voth:'river quay',yonni:['yn-customs-quay','yn-fishquay']},
 {trade:'fishers',voth:'fishing dock',yonni:['yn-fishquay','yn-hut-fisher']},
 {trade:'market traders',voth:'market stall',yonni:['yn-market']},
 {trade:'farmhands and ploughmen',voth:'fields',yonni:['yn-farmstead']},
 {trade:'chinampa growers',voth:'chinampa bed',yonni:['yn-farmstead'],note:'irrigated wet-hill stone crop terraces'},
 {trade:'orchardmen',voth:'orchards',yonni:['yn-farmstead'],note:'terraced sea-kale, dyer-madder, and coastal groves'},
 {trade:'miners',voth:'mine',yonni:['yn-mine','yn-hut-miner'],note:'works nearest iron, tin, coal, or saltpeter node (kits/resources)'},
 {trade:'quarrymen and masons',voth:'quarry',yonni:['yn-quarry']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',yonni:['yn-granary','yn-watermill']},
 {trade:'beetle herders',voth:'beetle ranch',na:'no beetles kept in Yonni: coastal sheep, crag goats, and steppe horses form the herds'},
 {trade:'dairymen',voth:'dairy',yonni:['yn-byre-stock','yn-hut-shepherd']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',yonni:['yn-byre-stock']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'sunlit windward coastal terraces instead of dark cave-fungus works'},
 {trade:'envoys and embassy staff',voth:'embassy',yonni:['yn-manor-envoy']},
 {trade:'ferrymen',voth:'ferry, stop',yonni:['yn-customs-quay']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the Scoured Hills'},
 {trade:'monks and lay brothers',voth:'monastery',yonni:['yn-rotunda-seer']},
 {trade:'palace and canton staffs',voth:'the cantons',yonni:['yn-palace-citadel','yn-citadel-twinkande','yn-court-rotunda','yn-hall-sisterhood']}
];
globalThis.YN_TRADES=YN_TRADES;

function ynDims(){
 const out={};
 for(const k in DEFS){
  const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
  out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,rock:d.tags.rock||null,
   level:d.tags.level||null,wealth:d.tags.wealth||null,types:d.tags.types||null,role:d.tags.role||null,
   job:d.tags.job||null,cut:!!d.cut,shore:FAMILIES.some(f=>f.shore&&f.keys.includes(k)),cliff:d.tags.style==='cliff'};
 }
 return out;
}
globalThis.ynDims=ynDims;
