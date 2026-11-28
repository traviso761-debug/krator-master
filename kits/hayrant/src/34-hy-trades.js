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
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['hy_pelt_tannery','hy_charcoal_tar_kiln'],note:'birch-tar retort distillers & larch-tannin yak/sheep hide curriers'},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['hy_larch_flume_yard','hy_trench_fishery'],note:'Sheritu peeled ship-timber log-flumes to Fulcrum & trench-lake larch skiffs'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['hy_caravanserai_inn'],note:'walled yak & mule pack-train court on the Mirabilis pass road'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['hy_pass_gate','hy_censorate_warden']},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'inland 3,100-5,500 m Western Outer Wall bench (Circuit E6); ocean coast-watch sits down on Farside (Farport) and Crookshore'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['hy_spring_stepwell','hy_ancestor_barrow','hy_head_totem_court','hy_grand_cyber_totem'],note:'loess-foot spring keyhole sanctuary, Sutar-Pira cyber-totem court & closed-eye ancestor exedra'},
 {trade:'shrine keepers',voth:'village shrine',keys:['hy_talking_head','hy_spring_stepwell','hy_head_totem_court','hy_grand_cyber_totem','hy_cyber_totem_obelisk'],note:'cyan-lit Ancient talking-head stele, Sutar-Pira cyber-totem pylons with insulator crossarms & seismic spring chimes'},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['hy_corner_turret_mid','hy_market_hall','hy_pu_chandlery']},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['hy_iron_smithy','hy_stoneware_kiln','hy_nephrite_lapidary','hy_rare_earth_smelter']},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['hy_hearth_tavern']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['hy_warehouse_vault']},
 {trade:'industrial workers',voth:'industrial lot',keys:['hy_saltpeter_works','hy_stoneware_kiln','hy_nephrite_lapidary','hy_larch_flume_yard','hy_rare_earth_smelter','hy_charcoal_tar_kiln'],note:'Mirabilis saltpeter leaching, rare-earth acid separation, charcoal/birch-tar retorts, porcelain insulators & nephrite wire-saws'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['hy_tube_relay','hy_grand_cyber_totem','hy_cyber_totem_obelisk'],note:'escarpment pneumatic-capsule, porcelain-insulator telegraph relay & central-square cyber-totem transformer pylons'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['hy_clan_lord_compound','hy_prefect_seat']},
 {trade:'soldiers',voth:'voth_barracks',keys:['hy_nuraghe_fort','hy_wall_segment','hy_veilpass_picket']},
 {trade:'teachers and scholars',voth:'voth_school',keys:['hy_examination_school','hy_clock_observatory'],note:'bilingual Eternian sign + Hayrant sound-mark school & Sutar-Tawar observatory'},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['hy_assay_registry','hy_censorate_warden']},
 {trade:'customs officers and clerks',voth:'customs house',keys:['hy_assay_registry','hy_pass_gate','hy_censorate_warden','hy_veilpass_picket']},
 {trade:'healers and nurses',voth:'house of healing',keys:['hy_healer_bath'],note:'spring-fed hot-stone soaking bath & goldroot apothecary'},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['hy_ancestor_barrow','hy_head_totem_court'],note:'Tomba dei Giganti basalt exedra, Sutar-Pira cyber-totem riggers & Eternian closed-eye mask vault'},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['hy_beacon_nuraghe'],note:'blind-base nuraghe pass-beacon & katabatic gale-bell watchtower'},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['hy_escarpment_hoist'],note:'water-ballast cliff hoist lifting lowland barge freight up the 2 km escarpment'},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['hy_larch_flume_yard'],note:'Sheritu hydraulic log-chute headworks feeding Līng-Mā / Fulcrum'},
 {trade:'fishers',voth:'fishing dock',keys:['hy_trench_fishery'],note:'sag-pond trench-lake (52-92 km2) basalt jetty & smoking rack'},
 {trade:'market traders',voth:'market stall',keys:['hy_market_hall']},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['hy_terrace_farmstead'],note:'contoured loess terraces of dustmillet, redstem buckwheat, lentil & wallhemp'},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['hy_terrace_farmstead'],note:'spring-line irrigated loess contour beds'},
 {trade:'orchardmen',voth:'orchards',keys:['hy_terrace_farmstead','hy_larch_flume_yard'],note:'walled frost-trap cave-date jujube & apricot terraces and managed larch stands'},
 {trade:'miners',voth:'mine',keys:['hy_ore_adit','hy_saltpeter_works','hy_rare_earth_smelter'],note:'works nearest iron, tin, gold, silver, rare-earth or saltpeter node via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['hy_nephrite_lapidary']},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['hy_granary_nuraghe','hy_pu_chandlery'],note:'frost-proof tholos basalt silo, stone-mushroom pu stilt caches & overshot mountain gristmill'},
 {trade:'beetle herders',voth:'beetle ranch',na:'no giant beetles in the cold north-western Outer Wall; Hayrant clans herd yaks, goats and sheep in hy_fell_fold'},
 {trade:'dairymen',voth:'dairy',keys:['hy_fell_fold','hy_pu_chandlery'],note:'dry-stone megabreccia yak/goat winter byre, tallow chandlery & turf-roofed cheese cellar'},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['hy_fell_fold']},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['hy_mushroom_drift'],note:'dark moist loess tunnel cultivating pale-fungi & moon-cap'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['hy_kuran_legation','hy_veilpass_picket'],note:'Hueru-Kuran Sister-Clan Legation over the 124,710 pass & Veilpass ransom parley post'},
 {trade:'ferrymen',voth:'ferry, stop',keys:['hy_escarpment_hoist','hy_trench_fishery']},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the north-west; yak/mule pack-trains, larch log-flumes and water-ballast escarpment hoists carry E6 freight'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['hy_withdrawn_sanctuary'],note:'Sheritu Siru-Hom cliff sanctuary of the Withdrawn True Heirs'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['hy_prefect_seat','hy_clock_observatory','hy_grand_cyber_totem','hy_cyber_totem_obelisk'],note:'Circuit E6 Pepar-Hom Prefectural Seat, Sutar-Tawar Observatory & central-square cyber-totems'}
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
 },
 /* Vertical tier base heights [y0, y1, ...] for nHeads stacked Eternian ancestor heads on a Sutar-Pira head-totem pole. */
 totemTierY(yBase,nHeads,tierH){
  const n=Math.max(1,nHeads|0),dh=tierH==null?1.18:tierH,out=[];
  for(let i=0;i<n;i++)out.push(+(yBase+i*dh).toFixed(4));
  return out;
 },
 /* Stone-mushroom nezumi-gaeshi marmot-baffle disc radius for tapered basalt post radius rPost (>= 2.35 * rPost). */
 puBaffleRadius(rPost){
  const r=rPost==null||rPost<=0?0.16:rPost;
  return +(Math.max(0.12,r)*2.45).toFixed(4);
 },
 /* Non-coplanar Kanopi/Hayrant formline relief z-step (>= 0.018 m per layer: 0.020 m step -> zero coplanar face overlap). */
 formlineLayerZ(zFace,layerIdx){
  const k=Math.max(1,layerIdx|0);
  return +(zFace+k*0.020).toFixed(4);
 },
 /* Alternating wide shed-skirt & recessed neck radii for Mirabilis high-voltage celadon/white porcelain pin-insulators. */
 insulatorShedRadii(rBase,nSheds){
  const r0=rBase==null||rBase<=0?0.075:rBase,n=Math.max(2,nSheds|0),out=[];
  for(let i=0;i<n;i++){
   const taper=1-0.08*i;
   out.push({shed:+(r0*taper).toFixed(4),neck:+(r0*taper*0.62).toFixed(4)});
  }
  return out;
 },
 /* Parabolic catenary jumper cable point from a=[x,y,z] to b=[x,y,z] at t in [0,1]: exact endpoints at t=0 and t=1. */
 catenarySagPt(a,b,sag,t){
  const u=t<=0?0:t>=1?1:t;
  const s=sag==null?0.24:sag;
  return [
   +(a[0]+(b[0]-a[0])*u).toFixed(4),
   +(a[1]+(b[1]-a[1])*u-4*s*u*(1-u)).toFixed(4),
   +(a[2]+(b[2]-a[2])*u).toFixed(4)
  ];
 }
};
globalThis.hyRigMath=hyRigMath;
