// ================================================================= TRADES & PURE HIGHLAND NURAGHE / CRUCK / WIND MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   HY_TRADES     all 44 Voth census trades (tools/check_trades.py shape), mapped to hy_* building keys (41 carried, 0 gaps, 3 na)
//   hyRigMath     pure concave nuraghe batter, snow-shedding larch cruck-rib arch, stepped Deco-Gothic pier ranks,
//                 Santa Cristina keyhole spring-well geometry, katabatic wind/chime pin-weights, and vassal cornice check
const HY_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['hy_millet_bakehouse'],note:'dustmillet, redstem buckwheat & cave-date loaves'},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['hy_smokehouse_butcher'],note:'larch-smoked mutton, yak & braided bench-garlic'},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['hy_plaid_weaver'],note:'cave-madder red, larch-bark & birch-tar Hayrant plaid (CROPS.canPlaid)'},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['hy_buckwheat_brewery'],note:'warm loess-cellar dustmillet mash & spiced highland tea'},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['hy_pelt_tannery'],note:'birch-tar & larch-tannin yak/sheep hide curriers'},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['hy_larch_flume_yard','hy_trench_fishery'],note:'Sheritu peeled ship-timber log-flumes to Fulcrum & trench-lake larch skiffs'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['hy_caravanserai_inn'],note:'walled yak & mule pack-train court on the Mirabilis pass road'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['hy_pass_gate']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'inland 3,100-5,500 m Western Outer Wall bench (Circuit E6); ocean coast-watch sits down on Farside (Farport) and Crookshore'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['hy_spring_stepwell','hy_ancestor_barrow'],note:'loess-foot spring keyhole sanctuary & closed-eye ancestor exedra'},
 {trade:'shrine keepers',voth:'village shrine',keys:['hy_talking_head','hy_spring_stepwell'],note:'cyan-lit Ancient talking-head stele with willow inau & seismic spring chimes'},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['hy_corner_turret_mid','hy_market_hall']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['hy_iron_smithy','hy_stoneware_kiln','hy_nephrite_lapidary']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['hy_hearth_tavern']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['hy_warehouse_vault']},
 {trade:'industrial workers',voth:'industrial lot',keys:['hy_saltpeter_works','hy_stoneware_kiln','hy_nephrite_lapidary','hy_larch_flume_yard'],note:'Mirabilis b=200 saltpeter leaching, high-voltage porcelain insulators & nephrite wire-saws'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['hy_tube_relay'],note:'escarpment pneumatic-capsule & porcelain-insulator electric telegraph relay'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['hy_clan_lord_compound','hy_prefect_seat']},
 {trade:'soldiers',voth:'voth_barracks',keys:['hy_nuraghe_fort','hy_wall_segment']},
 {trade:'teachers and scholars',voth:'voth_school',keys:['hy_examination_school','hy_clock_observatory'],note:'bilingual Eternian sign + Hayrant sound-mark school & Sutar-Tawar observatory'},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['hy_assay_registry']},
 {trade:'customs officers and clerks',voth:'customs house',keys:['hy_assay_registry','hy_pass_gate']},
 {trade:'healers and nurses',voth:'house of healing',keys:['hy_healer_bath'],note:'spring-fed hot-stone soaking bath & goldroot apothecary'},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['hy_ancestor_barrow'],note:'Tomba dei Giganti basalt exedra & Eternian closed-eye mask vault'},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['hy_beacon_nuraghe'],note:'blind-base nuraghe pass-beacon & katabatic gale-bell watchtower'},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['hy_escarpment_hoist'],note:'water-ballast cliff hoist lifting lowland barge freight up the 2 km escarpment'},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['hy_larch_flume_yard'],note:'Sheritu hydraulic log-chute headworks feeding Līng-Mā / Fulcrum'},
 {trade:'fishers',voth:'fishing dock',keys:['hy_trench_fishery'],note:'sag-pond trench-lake (52-92 km2) basalt jetty & smoking rack'},
 {trade:'market traders',voth:'market stall',keys:['hy_market_hall']},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['hy_terrace_farmstead'],note:'contoured loess terraces of dustmillet, redstem buckwheat, lentil & wallhemp'},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['hy_terrace_farmstead'],note:'spring-line irrigated loess contour beds'},
 {trade:'orchardmen',voth:'orchards',keys:['hy_terrace_farmstead','hy_larch_flume_yard'],note:'walled frost-trap cave-date jujube & apricot terraces and managed larch stands'},
 {trade:'miners',voth:'mine',keys:['hy_ore_adit','hy_saltpeter_works'],note:'works nearest iron, tin, gold, silver, rare-earth or saltpeter node via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['hy_nephrite_lapidary']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['hy_granary_nuraghe'],note:'frost-proof tholos basalt silo & overshot mountain gristmill'},
 {trade:'beetle herders',voth:'beetle ranch',na:'no giant beetles in the cold north-western Outer Wall; Hayrant clans herd yaks, goats and sheep in hy_fell_fold'},
 {trade:'dairymen',voth:'dairy',keys:['hy_fell_fold'],note:'dry-stone megabreccia yak/goat winter byre & turf-roofed cheese cellar'},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['hy_fell_fold']},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['hy_mushroom_drift'],note:'dark moist loess tunnel cultivating pale-fungi & moon-cap'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['hy_kuran_legation'],note:'Hueru-Kuran Sister-Clan Legation over the 124,710 pass (twin of hk_embassy_hayrant)'},
 {trade:'ferrymen',voth:'ferry, stop',keys:['hy_escarpment_hoist','hy_trench_fishery']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the north-west; yak/mule pack-trains, larch log-flumes and water-ballast escarpment hoists carry E6 freight'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['hy_withdrawn_sanctuary'],note:'Sheritu Siru-Hom cliff sanctuary of the Withdrawn True Heirs'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['hy_prefect_seat','hy_clock_observatory'],note:'Circuit E6 Pepar-Hom Prefectural Seat & Clock-Keepers observatory'}
];
globalThis.HY_TRADES=HY_TRADES;

/* Pure architectural & katabatic wind-rigging math ([G data]): deterministic, engine-neutral, unit-tested in test-hayrant.js */
const hyRigMath={
 /* Pin weight for a 4-corner plaid/hemp awning or hide wind-screen over u,v in [0,1]: exact 0 at all four corners. */
 cornerPin(u,v){
  const dMin=Math.min(Math.hypot(u,v),Math.hypot(1-u,v),Math.hypot(u,1-v),Math.hypot(1-u,1-v));
  if(dMin<1e-5)return 0;
  const belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  const edge=Math.sin(Math.PI*u)*0.3+Math.sin(Math.PI*v)*0.3;
  const ramp=Math.min(1,dMin/0.22);
  return ramp*ramp*(0.58*belly+0.42*Math.min(1,edge));
 },
 /* Pin weight for a span pinned at u=0 and u=1 (wallhemp rope lines, braided bench-garlic & cave-date eaves strings). */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return s*Math.sqrt(s);
 },
 /* Pin weight for a hanging Hayrant plaid banner or hide door-curtain pinned along v=0: exact 0 at crossbar v=0. */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*Math.sqrt(c);
 },
 /* Rigid-pendulum sway profile for a sawn emerald-nephrite or bronze seismic/katabatic chime slab hung at v=0. */
 chimePin(v){
  if(v<=1e-5)return 0;
  return v<0?0:v>1?1:v;
 },
 /* Sardinian nuraghe battered outer radius at normalized height t in [0,1]: concave-battered truncated cone from rBase to rTop. */
 nuragheRadius(rBase,rTop,t){
  const f=t<0?0:t>1?1:t;
  return rBase-(rBase-rTop)*(0.82*f+0.18*f*f);
 },
 /* Steamed fur-larch & century-puya parabolic snow-shedding cruck-rib arch [r, y] for s in [0,1] from stone ring-wall
    spring (rSpring, ySpring) to kaen-doki smoke-collar (rCrown, yCrown), steeper at the haunch to shed -14 C snow loads. */
 cruckArc(rSpring,ySpring,rCrown,yCrown,s){
  const u=s<0?0:s>1?1:s;
  const shoulder=0.09*(rSpring-rCrown)*Math.sin(Math.PI*u);
  const r=rSpring+(rCrown-rSpring)*Math.pow(u,1.08)+shoulder;
  const y=ySpring+(yCrown-ySpring)*Math.pow(Math.sin(0.5*Math.PI*u),0.88);
  return [r,y];
 },
 /* Organ-pipe stepped Deco-Gothic pier top heights for n piers (odd >= 3) rising from h0 by step toward the centre rank. */
 pierStepTops(n,h0,step){
  const cnt=Math.max(3,n|0),mid=(cnt-1)*0.5,out=[];
  for(let i=0;i<cnt;i++){
   const rank=mid-Math.abs(i-mid);
   out.push(+(h0+rank*step).toFixed(4));
  }
  return out;
 },
 /* Santa Cristina inverted-keyhole spring/seismic chime-well half-width at normalized descent f in [0,1]. */
 keyholeHalfWidth(wTop,wPool,f){
  const u=f<0?0:f>1?1:f;
  return 0.5*(wTop+(wPool-wTop)*u);
 },
 /* Vassal street cornice-line compatibility rule (VASSAL-KITS.md section 2): eaves/parapet delta <= 0.50 m. */
 corniceDeltaOk(hHayrant,hEternian){
  return Math.abs(hHayrant-hEternian)<=0.50+1e-6;
 }
};
globalThis.hyRigMath=hyRigMath;
