// ================================================================= TRADES & PURE NURAGHE / WHALE-RIB / WIND GEOMETRY MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   HK_TRADES     every trade in the Voth city census (44 rows), mapped to Hueru-Kuran building defs (or na with reason)
//   hkRigMath     pure batter, whale-rib arch, Santa Cristina keyhole and wind pin-weight functions shared by builders & tests
const HK_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',defs:['hk_bakehouse']},
 {trade:'butchers',voth:'voth_bldg_butcher',defs:['hk_smokehouse_saltery','hk_baidarka_yard']},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',defs:['hk_sealhide_tailor','hk_baleen_loft']},
 {trade:'brewers',voth:'voth_bldg_brewery',defs:['hk_brew_kelp','hk_tavern_whale']},
 {trade:'tanners',voth:'voth_bldg_tannery',defs:['hk_sealhide_tailor','hk_blubber_tryworks']},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',defs:['hk_baidarka_yard']},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',defs:['hk_inn_terrace']},
 {trade:'town guard',voth:'voth_bldg_watchhouse',defs:['hk_cliff_gatehouse','hk_watch_barracks']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',defs:['hk_prou_torre','hk_wave_splitter']},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',defs:['hk_stepwell_sanctuary']},
 {trade:'shrine keepers',voth:'village shrine',defs:['hk_stepwell_sanctuary','hk_ossuary_barrow']},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',defs:['hk_market_terrace','hk_jade_exchange']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',defs:['hk_harpoon_smithy','hk_jade_sawmill','hk_kaen_kiln','hk_kelp_glassworks','hk_baleen_loft']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',defs:['hk_tavern_whale']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',defs:['hk_warehouse_vault','hk_cliff_hoist']},
 {trade:'industrial workers',voth:'industrial lot',defs:['hk_jade_sawmill','hk_blubber_tryworks','hk_kelp_glassworks','hk_cypress_flume_yard']},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'pre-electric maritime clans; gravity waterwheels, cypress log-flumes and water-ballast cliff hoists drive all heavy works'},
 {trade:'household service',voth:'rich house, manor, clan compound',defs:['hk_house_rich_steward','hk_house_rich_whalelord','hk_house_rich_clan','hk_ukor_matron_lodge']},
 {trade:'soldiers',voth:'voth_barracks',defs:['hk_nuraghe_complesso','hk_watch_barracks','hk_cliff_gatehouse']},
 {trade:'teachers and scholars',voth:'voth_school',defs:['hk_lore_hall']},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',defs:['hk_ukor_council','hk_jade_exchange']},
 {trade:'customs officers and clerks',voth:'customs house',defs:['hk_crater_quay']},
 {trade:'healers and nurses',voth:'house of healing',defs:['hk_healer_lodge']},
 {trade:'priests and undertakers',voth:'funerary temple',defs:['hk_ossuary_barrow']},
 {trade:'lighthouse keepers',voth:'lighthouse',defs:['hk_beacon_nuraghe']},
 {trade:'dockers and stevedores',voth:'harbour pier',defs:['hk_crater_quay','hk_cliff_hoist']},
 {trade:'river bargemen and quay hands',voth:'river quay',defs:['hk_crater_quay','hk_ferry_causeway']},
 {trade:'fishers',voth:'fishing dock',defs:['hk_baidarka_yard','hk_crater_quay']},
 {trade:'market traders',voth:'market stall',defs:['hk_market_terrace']},
 {trade:'farmhands and ploughmen',voth:'fields',defs:['hk_terrace_croft']},
 {trade:'chinampa growers',voth:'chinampa bed',defs:['hk_terrace_croft'],note:'kelp-mulched basalt wind-terrace beds on +65..+120 m marine benches'},
 {trade:'orchardmen',voth:'orchards',defs:['hk_terrace_croft','hk_cypress_flume_yard'],note:'wind-sheltered sea-berry benches and +690 m red-cypress timber stands'},
 {trade:'miners',voth:'mine',defs:['hk_jade_quarry'],note:'works the nearest nephrite, silica or metal node from kits/resources via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',defs:['hk_jade_quarry','hk_jade_sawmill']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',defs:['hk_granary_nuraghe','hk_jade_sawmill']},
 {trade:'beetle herders',voth:'beetle ranch',na:'maritime basalt terraces of Crookshore; clans hunt pelagic filter-whales and keep sea-ducks and seals in hk_terrace_croft'},
 {trade:'dairymen',voth:'dairy',defs:['hk_terrace_croft']},
 {trade:'swineherds and duck keepers',voth:'sty, coop',defs:['hk_terrace_croft']},
 {trade:'mushroom growers',voth:'mushroom farm',na:'salt-wind coastal terraces cultivate kelp wrack and sea-kale rather than subterranean dark-fungi'},
 {trade:'envoys and embassy staff',voth:'embassy',defs:['hk_embassy_hayrant']},
 {trade:'ferrymen',voth:'ferry, stop',defs:['hk_ferry_causeway','hk_cliff_hoist']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'sea-going baidarkas, whale-tenders and gravity cliff-hoists carry all Crookshore freight'},
 {trade:'monks and lay brothers',voth:'monastery',defs:['hk_stepwell_sanctuary']},
 {trade:'palace and canton staffs',voth:'the cantons',defs:['hk_nuraghe_complesso','hk_ukor_council','hk_ukor_matron_lodge']}
];
globalThis.HK_TRADES=HK_TRADES;

/* Pure architectural & wind-rigging math ([G data]): deterministic, engine-neutral, and unit-tested in test-hueru-kuran.js. */
const hkRigMath={
 /* Pin weight for a 4-corner gutskin awning or hide tarp over u,v in [0,1]: exact 0 at all four corners (0,0),(1,0),(0,1),(1,1). */
 cornerPin(u,v){
  const dMin=Math.min(Math.hypot(u,v),Math.hypot(1-u,v),Math.hypot(u,1-v),Math.hypot(1-u,1-v));
  if(dMin<1e-5)return 0;
  const belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  const edge=Math.sin(Math.PI*u)*0.3+Math.sin(Math.PI*v)*0.3;
  const ramp=Math.min(1,dMin/0.22);
  return ramp*ramp*(0.58*belly+0.42*Math.min(1,edge));
 },
 /* Pin weight for a span pinned at u=0 and u=1 (drying kelp lines, suspended harpoon/fish nets): exact 0 at u=0 and u=1. */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return s*Math.sqrt(s);
 },
 /* Pin weight for a hanging kelp curtain, clan banner, or suspended emerald-nephrite wind/tide chime slab pinned along v=0:
    exact 0 at top crossbar v=0, smooth pendulum/flutter release down to v=1. */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*Math.sqrt(c);
 },
 /* Rigid-pendulum sway profile for a sawn emerald-nephrite chime slab hung by baleen cord at v=0: exact 0 at v=0, linear pendulum
    displacement along slab length so stone slabs swing cleanly in ATMOS gusts without rubbery cloth bending. */
 chimePin(v){
  if(v<=1e-5)return 0;
  return v<0?0:v>1?1:v;
 },
 /* Sardinian nuraghe battered outer radius at normalized height t in [0,1]: concave-battered truncated cone from rBase to rTop. */
 nuragheRadius(rBase,rTop,t){
  const f=t<0?0:t>1?1:t;
  return rBase-(rBase-rTop)*(0.82*f+0.18*f*f);
 },
 /* Pelagic whale-rib arch point [r, y] for parameter s in [0,1] from basalt ring-wall head (rSpring, ySpring) to smoke-ring
    collar (rCrown, yCrown), with organic outward shoulder bow. */
 whaleRibArc(rSpring,ySpring,rCrown,yCrown,s){
  const u=s<0?0:s>1?1:s;
  const bow=0.14*(rSpring-rCrown)*Math.sin(Math.PI*u);
  const r=rSpring+(rCrown-rSpring)*Math.pow(u,1.15)+bow;
  const y=ySpring+(yCrown-ySpring)*Math.sin(0.5*Math.PI*u);
  return [r,y];
 },
 /* Santa Cristina inverted-keyhole half-width at normalized descent f in [0,1] from wide upper threshold to narrow mirror pool. */
 keyholeHalfWidth(wTop,wPool,f){
  const u=f<0?0:f>1?1:f;
  return 0.5*(wTop+(wPool-wTop)*u);
 }
};
globalThis.hkRigMath=hkRigMath;
