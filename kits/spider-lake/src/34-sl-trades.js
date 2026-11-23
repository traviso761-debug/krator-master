// ================================================================= TRADES & PURE SILK GEOMETRY MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   SL_TRADES     every trade in the Voth city census (44 rows), mapped to Spider Lake & Ham-Tsek building defs (or na with reason)
//   slSilkMath    pure catenary, hyperbolic-paraboloid ("Lotus-Saddle") and pin-weight functions shared by builders and tests
const SL_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',defs:['sl_bakery']},
 {trade:'butchers',voth:'voth_bldg_butcher',defs:['sl_butcher_smoke']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',defs:['sl_reeling_market','sl_dyehouse_canal','sl_weaver_hall']},
 {trade:'brewers',voth:'voth_bldg_brewery',defs:['sl_tavern_canal']},
 {trade:'tanners',voth:'voth_bldg_tannery',defs:['sl_tannery_resin']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',defs:['sl_dockyard']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',defs:['sl_caravanserai_silkhead','sl_inn_caravan']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',defs:['sl_mast_gatehouse','sl_watch_barracks']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',defs:['sl_weir_bastion']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',defs:['sl_hum_sanctuary']},
 {trade:'shrine keepers',voth:'village shrine',defs:['sl_hum_sanctuary','sl_funerary_shrine','sl_guild_square']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',defs:['sl_shophouse_lacquer','sl_market_stalls']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',defs:['sl_smithy_spindle','sl_potter_kiln','sl_carpenter_yard']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',defs:['sl_tavern_canal','sl_caravanserai_silkhead']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',defs:['sl_warehouse_silk','sl_caravanserai_silkhead']},
 {trade:'industrial workers',voth:'industrial lot',defs:['sl_reeling_market','sl_dyehouse_canal','sl_carpenter_yard']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'pre-electric lakeside principality; waterwheels and wind-scoops power the works'},
 {trade:'household service',voth:'rich house, manor, clan compound',defs:['sl_house_rich_villa','sl_house_rich_pavilion','sl_house_rich_clan']},
 {trade:'soldiers',voth:'voth_barracks',defs:['sl_watch_barracks','sl_weir_bastion']},
 {trade:'teachers and scholars',voth:'voth_school',defs:['sl_school_scriptorium']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',defs:['sl_silk_bourse','sl_treaty_hall','sl_caravanserai_silkhead']},
 {trade:'customs officers and clerks',voth:'customs house',defs:['sl_barge_quay','sl_caravanserai_silkhead']},
 {trade:'healers and nurses',voth:'house of healing',defs:['sl_healer_pavilion']},
 {trade:'priests and undertakers',voth:'funerary temple',defs:['sl_funerary_shrine']},
 {trade:'lighthouse keepers',voth:'lighthouse',defs:['sl_beacon_tower']},
 {trade:'dockers and stevedores',voth:'harbour pier',defs:['sl_barge_quay']},
 {trade:'river bargemen and quay hands',voth:'river quay',defs:['sl_barge_quay','sl_ferry_bridge']},
 {trade:'fishers',voth:'fishing dock',defs:['sl_weir_dock']},
 {trade:'market traders',voth:'market stall',defs:['sl_market_stalls','sl_reeling_market','sl_caravanserai_silkhead']},
 {trade:'farmhands and ploughmen',voth:'fields',defs:['sl_mulberry_farm']},
 {trade:'chinampa growers',voth:'chinampa bed',defs:['sl_mulberry_farm'],note:'irrigated lakeside mulberry, rice and taro beds'},
 {trade:'orchardmen',voth:'orchards',defs:['sl_mulberry_farm'],note:'lakeside mulberry and fruit arbours feeding silk and table'},
 {trade:'miners',voth:'mine',defs:['sl_mine_quarry'],note:'works the nearest mineral or metal node from kits/resources via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',defs:['sl_mine_quarry']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',defs:['sl_granary_mill']},
 {trade:'beetle herders',voth:'beetle ranch',na:'colonial orb-spiders spin in the Hum wind-scoop rafters; water-buffalo and ducks are kept in sl_dairy_pens'},
 {trade:'dairymen',voth:'dairy',defs:['sl_dairy_pens']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',defs:['sl_dairy_pens']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'sunlit lakeside climate; no subterranean dark-fungus works'},
 {trade:'envoys and embassy staff',voth:'embassy',defs:['sl_embassy_ria']},
 {trade:'ferrymen',voth:'ferry, stop',defs:['sl_ferry_bridge']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'lake barges and caravan mules carry trade; no elephant bugs'},
 {trade:'monks and lay brothers',voth:'monastery',defs:['sl_hum_sanctuary']},
 {trade:'palace and canton staffs',voth:'the cantons',defs:['sl_palace_pavilion','sl_treaty_hall']}
];
globalThis.SL_TRADES=SL_TRADES;

/* Pure geometry & rigging pin-weight math ([G data]): guarantees 0.0 displacement at every pinned corner, edge or crossbar. */
const slSilkMath={
 /* Pin weight for a 4-corner rigged velarium or hypar canopy over u,v in [0,1]: strictly 0 at all four corners (0,0),(1,0),(0,1),(1,1),
    smooth along guy-cables and maximum in the belly. */
 cornerPin(u,v){
  const du0=u,du1=1-u,dv0=v,dv1=1-v;
  const dMin=Math.min(Math.hypot(du0,dv0),Math.hypot(du1,dv0),Math.hypot(du0,dv1),Math.hypot(du1,dv1));
  if(dMin<1e-5)return 0;
  const belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  const edge=Math.sin(Math.PI*u)*0.32+Math.sin(Math.PI*v)*0.32;
  const ramp=Math.min(1,dMin/0.22);
  return ramp*ramp*(0.55*belly+0.45*Math.min(1,edge));
 },
 /* Pin weight for a span pinned along u=0 and u=1 crossbars (e.g. 20 m canal silk streamer or catenary bay): strictly 0 at u=0 and u=1. */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return s*Math.sqrt(s);
 },
 /* Pin weight for a hanging wind-veil or curtain pinned along its top rod v=0 and free down to v=1 (dipped hem). */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*Math.sqrt(c);
 },
 /* Anticlastic hyperbolic-paraboloid ("Lotus-Saddle") height over s,t in [-1,1]: peaks at (s=±1,t=0) or diagonals, valleys orthogonal. */
 hyparY(u,v,yLow,yHigh,sag){
  const s=2*u-1,t=2*v-1;
  /* Peaks at (-1,-1) and (+1,+1) at yHigh; valleys at (-1,+1) and (+1,-1) at yLow: z = mid + half*(s*t) - sag*(1-s^2)*(1-t^2) */
  const mid=0.5*(yHigh+yLow),half=0.5*(yHigh-yLow);
  const droops=(sag==null?0.12:sag)*(1-s*s)*(1-t*t);
  return mid+half*(s*t)-droops;
 }
};
globalThis.slSilkMath=slSilkMath;
