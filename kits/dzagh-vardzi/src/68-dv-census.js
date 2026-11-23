// prefix: dv
// ================================================================= VOTH-CENSUS TRADES & CORE/CITY + CORE/HAMLET FOOTPRINTS ([G data])
// Every trade in the Voth city census (settlements/voth/targets/voth-city/15-vc-tune.js): 40 of 44 carried by Dzagh-Vardzi defs
// (4 non-applicable to archaic mountain gorge-kingdoms, documented with `na`). Pure data, zero browser/THREE calls.
const DV_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',dzaghVardzi:['dv-bakery-tone']},
 {trade:'butchers',voth:'voth_bldg_butcher',dzaghVardzi:['dv-butcher-smokehouse']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',dzaghVardzi:['dv-weaver-kilim']},
 {trade:'brewers',voth:'voth_bldg_brewery',dzaghVardzi:['dv-winery-qvevri','dv-tavern-qvevri']},
 {trade:'tanners',voth:'voth_bldg_tannery',dzaghVardzi:['dv-tannery-fleece']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',dzaghVardzi:['dv-boatwright-raft']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',dzaghVardzi:['dv-tavern-qvevri']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',dzaghVardzi:['dv-tower-vovnashki','dv-gate-flume']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',dzaghVardzi:['dv-ferry-ropeway','dv-flume-keep']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',dzaghVardzi:['dv-sanctuary-gumbat']},
 {trade:'shrine keepers',voth:'village shrine',dzaghVardzi:['dv-shrine-cross','dv-sanctuary-gumbat']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',dzaghVardzi:['dv-shophouse-lapidary']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',dzaghVardzi:['dv-flume-forge','dv-smithy-armourer','dv-foundry-bronze','dv-sawmill-jade','dv-potter-qvevri','dv-joiner-cypress']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',dzaghVardzi:['dv-tavern-qvevri']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',dzaghVardzi:['dv-warehouse-flume','dv-flume-trestle']},
 {trade:'industrial workers',voth:'industrial lot',dzaghVardzi:['dv-flume-forge','dv-flume-keep','dv-foundry-bronze','dv-sawmill-jade']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'overshot cliffside waterwheels & gravity log-flumes power Vardzieti works; no electrical generators'},
 {trade:'household service',voth:'rich house, manor, clan compound',dzaghVardzi:['dv-manor-cousins','dv-manor-gumbat','dv-manor-envoy']},
 {trade:'soldiers',voth:'voth_barracks',dzaghVardzi:['dv-barracks-retinue','dv-citadel-mepe','dv-flume-keep']},
 {trade:'teachers and scholars',voth:'voth_school',dzaghVardzi:['dv-scriptorium-lore']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',dzaghVardzi:['dv-hall-weregild']},
 {trade:'customs officers and clerks',voth:'customs house',dzaghVardzi:['dv-customs-bridgehead','dv-hall-weregild']},
 {trade:'healers and nurses',voth:'house of healing',dzaghVardzi:['dv-healer-apricot','dv-bath-sulfur']},
 {trade:'priests and undertakers',voth:'funerary temple',dzaghVardzi:['dv-sanctuary-gumbat','dv-shrine-cross']},
 {trade:'lighthouse keepers',voth:'lighthouse',dzaghVardzi:['dv-beacon-gorge']},
 {trade:'dockers and stevedores',voth:'harbour pier',dzaghVardzi:['dv-ferry-ropeway','dv-flume-trestle']},
 {trade:'river bargemen and quay hands',voth:'river quay',dzaghVardzi:['dv-ferry-ropeway','dv-boatwright-raft']},
 {trade:'fishers',voth:'fishing dock',dzaghVardzi:['dv-fishweir-trout']},
 {trade:'market traders',voth:'market stall',dzaghVardzi:['dv-market-confluence']},
 {trade:'farmhands and ploughmen',voth:'fields',dzaghVardzi:['dv-orchard-terrace','dv-aul-cot-orchard']},
 {trade:'chinampa growers',voth:'chinampa bed',dzaghVardzi:['dv-orchard-terrace'],note:'snowmelt-irrigated drystone gorge crop terraces'},
 {trade:'orchardmen',voth:'orchards',dzaghVardzi:['dv-orchard-terrace','dv-aul-cot-orchard'],note:'sunny terraced apricot, walnut, and madder groves'},
 {trade:'miners',voth:'mine',dzaghVardzi:['dv-mine-gorge','dv-sluice-fleece'],note:'works nearest tin, iron, copper, or gold node (kits/resources) + Golden-Fleece placer sluices'},
 {trade:'quarrymen and masons',voth:'quarry',dzaghVardzi:['dv-quarry-tuff','dv-aul-cot-quarry','dv-sawmill-jade']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',dzaghVardzi:['dv-granary-stilted','dv-flume-forge','dv-sawmill-jade']},
 {trade:'beetle herders',voth:'beetle ranch',na:'no beetles kept in Vardzieti: Golden-Fleece mountain sheep, crag goats, and cousin war-mounts form the herds'},
 {trade:'dairymen',voth:'dairy',dzaghVardzi:['dv-byre-mountain','dv-aul-cot-shepherd']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',dzaghVardzi:['dv-byre-mountain']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'sunlit apricot & barley gorge terraces instead of subterranean fungus caverns'},
 {trade:'envoys and embassy staff',voth:'embassy',dzaghVardzi:['dv-manor-envoy']},
 {trade:'ferrymen',voth:'ferry, stop',dzaghVardzi:['dv-ferry-ropeway','dv-bridge-duel']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the Crookwash gorges; aerial ropeways and flumes carry freight'},
 {trade:'monks and lay brothers',voth:'monastery',dzaghVardzi:['dv-sanctuary-gumbat','dv-scriptorium-lore']},
 {trade:'palace and canton staffs',voth:'the cantons',dzaghVardzi:['dv-citadel-mepe','dv-hall-weregild']}
];
globalThis.DV_TRADES=DV_TRADES;

function dvDims(){
 const out={};
 for(const k in DEFS){
  const d=DEFS[k];if(d.cls!=='building'&&d.kind!=='res-node')continue;
  out[k]={cls:d.cls,kind:d.kind||null,w:d.w,d:d.d,h:d.h,style:d.tags.style||null,rock:d.tags.rock||null,
   level:d.tags.level||null,wealth:d.tags.wealth||null,types:d.tags.types||null,role:d.tags.role||null,
   job:d.tags.job||null,cut:!!d.cut,chasm:FAMILIES.some(f=>f.chasm&&f.keys.includes(k))};
 }
 return out;
}
globalThis.dvDims=dvDims;
