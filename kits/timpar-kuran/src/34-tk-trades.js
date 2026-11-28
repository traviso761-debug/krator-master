// ================================================================= TRADES & PURE FORMLINE / TOTEM / WIND MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   TK_TRADES     all 44 Voth census trades (tools/check_trades.py shape), mapped to tk_* building keys (41 carried, 0 gaps, 3 na)
//   tkRigMath     pure Tlingit plank-roof pitch, Jomon kaen-doki flame-collar profile, Ainu pu rat-baffle overhang,
//                 oval totem-mouth doorway curve, stepped daak platform tiers, war-visor vs loot-head eye rule, and wind pin-weights
const TK_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['tk_camas_earth_oven'],note:'steaming hot-cobble fern-starch, camas-bulb & acorn-meal earth-oven loaves'},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['tk_salmon_weir_smokehouse','tk_goat_pelt_byre'],note:'alder-smoked king salmon, mountain venison & goat quarters'},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['tk_attus_chilkat_loom'],note:'retted mountain-elm inner-bark attus & mountain-goat-wool Chilkat crest blankets'},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['tk_berry_mead_tavern'],note:'fermented cloudberry, salmonberry & birch-sap mash in cord-marked kaen-doki vats'},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['tk_goat_pelt_byre'],note:'brains-and-cypress-smoke bear, elk & mountain-goat hide curriers'},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',keys:['tk_dugout_armour_yard'],note:'steamed red-cypress U-valley river dugouts & carved paddles'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['tk_pony_hound_corral','tk_berry_mead_tavern','tk_cousin_truce_lodge'],note:'Veilpass pack-pony smuggling corral, guest-hearth & tether shelter'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['tk_trophy_stockade_gate'],note:'chasi-noow ridge-gate watch armed with hardwood slat-armour & war-clubs'},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'landlocked 2,100-2,750 m Veiled-Mountain rainforest U-valleys; ocean tsunami-watch sits west with Hueru-Kuran cousins on Crookshore'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['tk_kanopi_shrine','tk_iomante_bear_court'],note:'Kanopi arcology-rib reliquary elders & winter iomante bear-sending celebrants'},
 {trade:'shrine keepers',voth:'village shrine',keys:['tk_nusa_mortuary_row','tk_kanopi_shrine'],note:'keepers of shaved-willow inau wands & nusa bear/eagle skull-fences'},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['tk_barter_crest_post'],note:'clan barter hall trading pelts, smoked salmon, copper tinaa & lowland war-loot'},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['tk_copper_cold_forge','tk_totem_carving_shed','tk_dugout_armour_yard','tk_kaen_firing_court'],note:'cold-hammered native copper tinaa smiths, master totem/war-visor carvers, slat-armourers & kaen potters'},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['tk_berry_mead_tavern','tk_potlatch_feast_hall'],note:'berry-mash & salmon-grease potlatch feast servers'},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['tk_pu_clan_granary'],note:'tumpline porters & keepers of kerfed cedar crest-chests in stilt pu caches'},
 {trade:'industrial workers',voth:'industrial lot',keys:['tk_grease_tryworks','tk_kaen_firing_court','tk_kanopi_salvage_yard','tk_dugout_armour_yard'],note:'candlefish/salmon grease try-works, open-pit kaen-doki clamps, Kanopi alloy shearers & cedar splitters'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',keys:['tk_grease_tryworks','tk_kanopi_salvage_yard'],note:'renderers of candlefish lamp-grease & tenders of salvaged Kanopi alloy oil-lamps and beacons'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['tk_timpar_cise_rich','tk_chieftain_totem_hall','tk_twin_hearth_clan_rich'],note:'junior lineage retainers & ransom-captives serving on lower daak tiers'},
 {trade:'soldiers',voth:'voth_barracks',keys:['tk_chasi_noow_fort','tk_raid_mustering_ground','tk_rockfall_trap_crib','tk_ransom_stockade'],note:'open-eyed beast-visor clan raiders & chasi-noow log-crib ridge defenders'},
 {trade:'teachers and scholars',voth:'voth_school',keys:['tk_potlatch_feast_hall'],note:'non-literate oral yukar epic chanters, crest-genealogy speakers & apprentice carvers'},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['tk_barter_crest_post','tk_potlatch_feast_hall'],note:'clan house-speakers reckoning potlatch debts with notched cedar tally-sticks'},
 {trade:'customs officers and clerks',voth:'customs house',keys:['tk_trophy_stockade_gate','tk_ransom_stockade'],note:'mist-pass toll collectors & lowland captive ransom brokers'},
 {trade:'healers and nurses',voth:'house of healing',keys:['tk_shaman_sweat_lodge','tk_spore_flash_apothecary'],note:'hot-cobble steam sweat-lodge shamans & rainforest root/spore healers'},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['tk_nusa_mortuary_row','tk_totem_carving_shed'],note:'carvers of mortuary crest-poles & sky-box bone-chest attendants'},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['tk_signal_pyre_tower'],note:'spur-crest pitch-resin signal pyre & hollow-log war-drum watchtower'},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['tk_dugout_armour_yard'],note:'glacial-stream dugout landing & cedar raft boom handlers'},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['tk_dugout_armour_yard','tk_salmon_weir_smokehouse'],note:'braided valley-river dugout canoe polers'},
 {trade:'fishers',voth:'fishing dock',keys:['tk_salmon_weir_smokehouse'],note:'live-stream basket-trap salmon weir wardens, harpooners & smokehouse curers'},
 {trade:'market traders',voth:'market stall',keys:['tk_barter_crest_post'],note:'clan crest-post barterers'},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['tk_camas_earth_oven'],note:'digging-stick camas, mountain-taro & turnip beds edged with megabreccia cobbles'},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['tk_camas_earth_oven'],note:'wet rainforest spring-margin sedge, water-parsnip & taro root beds'},
 {trade:'orchardmen',voth:'orchards',keys:['tk_camas_earth_oven'],note:'culturally modified bark-stripped cloud-cedar groves, hazelnut coppices & salmonberry brakes'},
 {trade:'miners',voth:'mine',keys:['tk_copper_cold_forge','tk_jade_adze_grinder'],note:'works nearest native-copper, iron, gold or nephrite/emerald node via resSource'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['tk_jade_adze_grinder'],note:'megabreccia talus splitters & wet quartz-sand nephrite adze grinders'},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['tk_pu_clan_granary'],note:'elevated pu rat-baffled cache keepers & wooden-mortar acorn/root pounders'},
 {trade:'beetle herders',voth:'beetle ranch',na:'no giant beetles in the wet cold-temperate Veiled Mountains; clans keep mountain-goats, pack-ponies, bear-hounds and sacred iomante bear cubs'},
 {trade:'dairymen',voth:'dairy',keys:['tk_goat_pelt_byre'],note:'mountain-goat milkers & alder-smoked curd pressers'},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['tk_pony_hound_corral','tk_goat_pelt_byre'],note:'elevated slatted bear-hound kennels, forest boar-pens & decoy waterfowl'},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['tk_spore_flash_apothecary'],note:'inoculated red-cypress nurse-log edible & spore-flash fungus cultivators'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['tk_cousin_truce_lodge'],note:'Utari-Kuran truce-lodge where Hueru-Kuran & Hayrant cousins parley under inau wands'},
 {trade:'ferrymen',voth:'ferry, stop',keys:['tk_dugout_armour_yard','tk_pony_hound_corral'],note:'torrent-rope dugout river crossing & Veilpass pack-pony trail station'},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'no elephant bugs in the steep Veiled-Mountain gorges; loads move by human tumpline, pack-ponies and river dugouts'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['tk_shaman_sweat_lodge','tk_kanopi_shrine'],note:'forest kamuy ascetics & Kanopi canopy-rib relic-keepers'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['tk_chieftain_totem_hall','tk_potlatch_feast_hall'],note:'stateless clan-house chiefs, war-leaders & potlatch council hosts'}
];
globalThis.TK_TRADES=TK_TRADES;

/* Pure PNW/Tlingit + Jomon/Ainu architectural & valley-mist wind math ([G data]): deterministic, unit-tested in test-timpar-kuran.js */
const tkRigMath={
 /* Pin weight for a 4-corner hide/attus canopy over u,v in [0,1]: exact 0 at all four corners. */
 cornerPin(u,v){
  const dMin=Math.min(Math.hypot(u,v),Math.hypot(1-u,v),Math.hypot(u,1-v),Math.hypot(1-u,1-v));
  if(dMin<1e-5)return 0;
  const belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  const edge=Math.sin(Math.PI*u)*0.3+Math.sin(Math.PI*v)*0.3;
  const ramp=Math.min(1,dMin/0.22);
  return ramp*ramp*(0.58*belly+0.42*Math.min(1,edge));
 },
 /* Pin weight for a salmon-drying or inau-garland span pinned at u=0 and u=1: exact 0 at both ends. */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return s*Math.sqrt(s);
 },
 /* Pin weight for a Chilkat or attus crest blanket hung from a cedar crossbar at v=0: exact 0 at v=0. */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*Math.sqrt(c);
 },
 /* Shaved-willow inau curl sway profile from wand stem attachment s=0 to curl tip s=1. */
 inauPin(s){
  if(s<=1e-5)return 0;
  const c=s<0?0:s>1?1:s;
  return c*c*(0.7+0.3*c);
 },
 /* Low-pitched Tlingit split-cypress roof height at offset x from ridge over total width w (18-24 deg pitch). */
 plankSlopeY(w,yEaves,rise,x){
  const half=Math.max(0.5,w*0.5),ax=Math.min(half,Math.abs(x));
  return yEaves+rise*(1-ax/half);
 },
 /* Sculptural Jomon kaen-doki flame-rimmed smoke-pot radius at normalized height t in [0,1]: waisted neck flaring to cockscomb crown. */
 kaenCrownR(rBase,t){
  const u=t<0?0:t>1?1:t;
  const waist=1-0.18*Math.sin(Math.PI*Math.min(1,u*1.35));
  const flare=u>0.55?0.42*Math.pow((u-0.55)/0.45,1.35):0;
  return rBase*(waist+flare);
 },
 /* Ainu pu stilt granary rat-baffle (nezumi-gaeshi) disc radius for post radius rPost: >= 2.2x post radius so rodents cannot climb past. */
 ratGuardRadius(rPost){
  return +(Math.max(0.14,rPost)*2.45).toFixed(4);
 },
 /* Oval totem-mouth portal rim point [x, y] around centre (0, yMid) for angle a in [0, TAU]. */
 totemOvalPt(halfW,halfH,yMid,a){
  return [+(Math.cos(a)*halfW).toFixed(5),+(yMid+Math.sin(a)*halfH).toFixed(5)];
 },
 /* Interior Tlingit daak stepped clan platform floor heights [yFloor, yTier1, ...] descending from perimeter bench to central irori floor. */
 daakTierHeights(yCenter,tiers,stepH){
  const n=Math.max(1,tiers|0),dh=stepH==null?0.36:stepH,out=[+yCenter.toFixed(4)];
  for(let i=1;i<=n;i++)out.push(+(yCenter+i*dh).toFixed(4));
  return out;
 },
 /* Depth z-offset for Tlingit formline relief layer idx (1=primary black, 2=secondary red, 3=tertiary teal, 4=eye inlay):
    strictly >= 1.4 cm (0.014 m) per step so zero coplanar triangles ever overlap. */
 formlineLayerZ(zFace,layerIdx){
  const k=Math.max(1,layerIdx|0);
  return +(zFace+k*0.018).toFixed(4);
 },
 /* Cultural contrast rule: Timpar-Kuran war-visors are wide-eyed ('open'), captured Eternian war-loot heads are closed-eyed ('closed'). */
 trophyEyeRuleOk(tkVisorEyes,etLootEyes,etInvertedOrPainted){
  return tkVisorEyes==='open'&&etLootEyes==='closed'&&!!etInvertedOrPainted;
 }
};
globalThis.tkRigMath=tkRigMath;
