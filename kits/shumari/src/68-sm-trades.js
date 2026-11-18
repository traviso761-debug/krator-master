/* prefix: sm */
// ================================================================= SHUMARI VOTH CENSUS TRADES COVERAGE (Phase SM4)
// Maps every row of tools/trades_census.json (44 trades) to its Shumari kit defBuilding keys or a documented inland/cultural na reason.
// Verified by tools/check_trades.py and kits/shumari/verify.py (zero gaps).

const SM_TRADES=[
 {trade:'bakers',defs:['sm_bakery'],note:'Domed basalt flatbread tannur ovens'},
 {trade:'butchers',defs:['sm_butcher'],note:'Cold-stone carcass hall and slatted crimson wind-drying basturma jerky loft'},
 {trade:'weavers and dyers',defs:['sm_weaver_dyer'],note:'Highland wool kilim looms and crimson cave-madder stone dye vats'},
 {trade:'brewers',defs:['sm_brewery_teahouse','sm_spirits_still'],note:'Millet-beer boza brewhouse, samovar teahouse, and twin copper-dome Sunu-sikaru aloe/apricot stills'},
 {trade:'tanners',defs:['sm_tannery'],note:'Canyon-side lime/tannin pits and crimson shagreen scabbard leather loft'},
 {trade:'shipwrights and boatbuilders',defs:['sm_lake_jetty'],note:'Tarred highland-pine skiff and ore-barge slipway on crater lake Siru-Yamu'},
 {trade:'innkeepers and grooms',defs:['sm_wikala_caravanserai','sm_outlander_lodging'],note:'Fortified customs wikala pack-court and two-storey -no caravanner row-lodging'},
 {trade:'town guard',defs:['sm_pishtaq_gate','sm_payaru_tower','sm_curtain_wall'],note:'Fortress gatehouse, polygonal Payaru beacon-minaret, and basalt curtain wall'},
 {trade:'coast guard',defs:[],na:'Landlocked 3300 m highland plateau; lake Siru-Yamu and gorge crossings are guarded by sm_gorge_bridge_tower and sm_lake_jetty'},
 {trade:'temple priests and servants',defs:['sm_hall_of_blades','sm_regiment_qubba'],note:'Keepers of the Twin-Domed Hall of Blades and regimental ancestor qubbas'},
 {trade:'shrine keepers',defs:['sm_sabil_shrine','sm_doriyan_stele','sm_wayside_cairn'],note:'Sabil snowmelt fountain keepers, Doriyan mirror-stele wardens, and wayside lamp cairns'},
 {trade:'shopkeepers and assistants',defs:['sm_shop_house','sm_bazaar_hall'],note:'Arched ablaq ground-floor shop-houses and vaulted qaysariyya bazaar stalls'},
 {trade:'smiths and craftsmen',defs:['sm_blade_smithy','sm_lacquer_inlay_shop'],note:'Double-forge watered-steel blade smithies and crimson-lacquer damascene hilters'},
 {trade:'innkeepers and servers',defs:['sm_brewery_teahouse','sm_outlander_lodging'],note:'Domed samovar teahouses and outlander lodging halls'},
 {trade:'porters and warehousemen',defs:['sm_wikala_caravanserai','sm_state_granary'],note:'Vaulted wikala ground store-bays and buttressed citadel state granaries'},
 {trade:'industrial workers',defs:['sm_saltpeter_works','sm_salt_evaporator','sm_charcoal_kiln','sm_spirits_still'],note:'Saltpeter leaching vats, brine pans, beehive charcoal clamps, and canyon stills'},
 {trade:'power-house stokers and engineers',defs:['sm_hammam','sm_charcoal_kiln','sm_watermill'],note:'Hypocaust furnace stokers, beehive charcoal burners, and snowmelt chute millwrights'},
 {trade:'household service',defs:['sm_sword_villa','sm_captain_bayt','sm_giant_sword_hall','sm_hearth_house','sm_courtyard_house'],note:'Hearth and Cadet retainers serving Sword-caste bayts, Giant halls, and artisan courts'},
 {trade:'soldiers',defs:['sm_regiment_barracks','sm_citadel_keep','sm_ordeal_yard','sm_armoury'],note:'Subaru-su Sword-caste regiments, Gedu-su Giant shock captains, and Urudiru drill yards'},
 {trade:'teachers and scholars',defs:['sm_sabil_shrine','sm_kattu_chancery'],note:'Upper crimson kuttab cadet recitation loggias and Sumaru-kattu tablet scriptoria'},
 {trade:'guild officers and clerks',defs:['sm_kattu_chancery','sm_bazaar_hall'],note:'Chancery registry scribes and qaysariyya market muhtasib inspectors'},
 {trade:'customs officers and clerks',defs:['sm_wikala_caravanserai','sm_gorge_bridge_tower'],note:'Outer -no ward wikala customs assessors and canyon bridgehead toll-masters'},
 {trade:'healers and nurses',defs:['sm_bimaristan'],note:'Four-iwan regimental bimaristan hospital and snowmelt apothecary'},
 {trade:'priests and undertakers',defs:['sm_regiment_qubba','sm_hall_of_blades','sm_doriyan_stele'],note:'Columbarium ash-urn custodians and ancestor-blade shrine wardens'},
 {trade:'lighthouse keepers',defs:[],na:'No sea coast; canyon rim fire-beacons are tended by military watchmen in sm_payaru_tower'},
 {trade:'dockers and stevedores',defs:[],na:'No ocean deep-water port; inland lake skiffs and gorge ferries are worked by river bargemen at sm_lake_jetty'},
 {trade:'river bargemen and quay hands',defs:['sm_lake_jetty','sm_gorge_bridge_tower'],note:'Siru-Yamu basalt ore-barge quay hands and Qappu-Narun gorge cable-ferry crews'},
 {trade:'fishers',defs:['sm_lake_jetty'],note:'Siru-Yamu crater-lake trout and char skiff fishers and smoked-fish racks'},
 {trade:'market traders',defs:['sm_bazaar_hall','sm_shop_house'],note:'Vaulted qaysariyya bazaar merchants and street-front traders'},
 {trade:'farmhands and ploughmen',defs:['sm_terrace_farm'],note:'Dry-stone basalt terrace farmers working dustmillet and frostoat'},
 {trade:'chinampa growers',defs:[],na:'Cold semi-arid 3300 m Dsb basalt plateau has no shallow tropical chinampa lagoons; irrigated bench plots use sm_terrace_farm'},
 {trade:'orchardmen',defs:['sm_apricot_orchard'],note:'Canyon-shelf twist-apricot orchardists, rooftop fruit dryers, and sweet-kernel pressers'},
 {trade:'miners',defs:['sm_mine_head','sm_placer_sluice'],note:'Timbered basalt iron/copper adits and riffled canyon placer-gold sluices'},
 {trade:'quarrymen and masons',defs:['sm_stonecutters_yard'],note:'Basalt, cream travertine, and crimson ironstone ablaq masons and dome-rib carvers'},
 {trade:'granary keepers and millers',defs:['sm_watermill','sm_state_granary','sm_cistern_hall'],note:'Overshot canyon-chute millers, citadel granary keepers, and snowmelt cistern masters'},
 {trade:'beetle herders',defs:[],na:'Shumari highlands raise wool sheep, goats, and pack-mules in sm_stock_fold and sm_herder_house rather than lowland chitin beetles'},
 {trade:'dairymen',defs:['sm_stock_fold','sm_herder_house'],note:'Upland sheep-and-goat cheese dairies and winter byres'},
 {trade:'swineherds and duck keepers',defs:[],na:'Dry rocky Dsb plateau husbandry centres on transhumant sheep and goats (sm_stock_fold, sm_herder_house) rather than marsh duck/swine pens'},
 {trade:'mushroom growers',defs:['sm_fungus_cellar'],note:'Half-buried barrel-vaulted basalt dark cellars growing alecap and pale fungi'},
 {trade:'envoys and embassy staff',defs:['sm_envoy_house'],note:'Guarded ablaq embassy residences in the outer -no treaty ward'},
 {trade:'ferrymen',defs:['sm_gorge_bridge_tower','sm_lake_jetty'],note:'Gorge windlass cable-ferry operators and Siru-Yamu lake boatmen'},
 {trade:'elephant bug handlers and station hands',defs:[],na:'Pack-mule and highland caravan beasts are quartered in sm_wikala_caravanserai and sm_stock_fold rather than tropical bug stations'},
 {trade:'monks and lay brothers',defs:['sm_ordeal_gate','sm_cadet_cell','sm_giant_cadet_cell'],note:'Austere Urudiru ordeal initiates and probationer cells under the Sword-caste rule'},
 {trade:'palace and canton staffs',defs:['sm_diwan_hall','sm_citadel_keep','sm_rim_pavilion'],note:'Grand Diwan council stewards, citadel keep wardens, and gorge-rim Sword pavilions'}
];
globalThis.SM_TRADES=SM_TRADES;

/* Footprint and metadata table for core/city, core/hamlet, and SMK.dims() (matches kits/islanders isDims contract) */
function smDims(){
 const out={};
 if(typeof DEFS==='undefined')return out;
 const fams=(typeof FAMILIES!=='undefined'&&Array.isArray(FAMILIES))?FAMILIES:[];
 for(const k in DEFS){
  const d=DEFS[k];
  if(!d||(d.cls!=='building'&&d.kind!=='res-node'))continue;
  const tags=d.tags||{};
  out[k]={
   cls:d.cls,
   kind:d.kind||null,
   name:d.name||k,
   w:d.w,
   d:d.d,
   h:d.h,
   fw:d.fw==null?+(d.w*.92).toFixed(2):d.fw,
   fd:d.fd==null?+(d.d*.92).toFixed(2):d.fd,
   giant:!!d.giant,
   caste:d.caste||null,
   vaultH:d.vaultH==null?0:d.vaultH,
   style:tags.style||null,
   wealth:tags.wealth||null,
   types:tags.types||[],
   role:tags.role||null,
   job:tags.job||null,
   cut:!!d.cut,
   variants:d.variants==null?1:d.variants,
   shore:k==='sm_lake_jetty'||fams.some(f=>f.shore&&f.keys.some(x=>(typeof x==='string'?x:x.key)===k))
  };
 }
 return out;
}
globalThis.smDims=smDims;

