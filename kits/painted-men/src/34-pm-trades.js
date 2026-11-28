// ================================================================= TRADES & PURE PLATEAU STRUCTURAL / WIND MATH ([G data])
// Engine-neutral data and pure functions (no three.js, no DOM):
//   PM_TRADES     all 44 Voth census trades (tools/check_trades.py shape) + 5 explicit non-kiln / non-literate na craft rows
//                 (potters, glassmakers, shipwrights, bankers, scribes, printers explicitly na; 0 gaps)
//   pmRigMath     pure juniper viga span enforcement (<= 4.20 m), bent canyon-oak maloca cruck-rib arch, Dogon notched-trunk
//                 ladder step geometry, Mesa Verde keyhole doorway profile, and Korona feather / silk / hide wind pin weights
const PM_TRADES=[
 {trade:'bakers',voth:'voth_bldg_bakery',keys:['pm_amaranth_roast_oven'],note:'basin-amaranth seed cakes, pinyon meal & murnong roots baked on heated danxia slabs'},
 {trade:'butchers',voth:'voth_bldg_butcher',keys:['pm_smokehouse_jerky'],note:'juniper-smoked plateau pronghorn jerky, marrow pemmican & sinew racks'},
 {trade:'weavers and dyers',voth:'voth_bldg_weaver',keys:['pm_bark_dye_court','pm_ochre_cake_press','pm_pitch_basket_shed'],note:'beaten canyon-oak bark cloth, stamped 5-pigment & Korona orchil dye cakes, coiled willow basketry & dye vats'},
 {trade:'brewers',voth:'voth_bldg_brewery',keys:['pm_rattlepod_brew_hut'],note:'fermented amaranth-honey & roasted juniper-berry mash in pinyon-pitch-lined willow vats'},
 {trade:'tanners',voth:'voth_bldg_tannery',keys:['pm_bark_dye_court','pm_smokehouse_jerky'],note:'canyon-oak bark-tannin & brain-tanned pronghorn hides, shields & rawhide lashings'},
 {trade:'shipwrights and boatbuilders',voth:'voth_bldg_shipwright',na:'landlocked 3,000-4,000 m Painted Highlands danxia plateau and seasonal flash-flood washes; zero navigable rivers or lakes for boats'},
 {trade:'innkeepers and grooms',voth:'voth_bldg_caravanserai',keys:['pm_truce_ring_pavilion','pm_pronghorn_corral'],note:'superbloom playa truce-moot shelter & guest pronghorn corral'},
 {trade:'town guard',voth:'voth_bldg_watchhouse',keys:['pm_ladder_gatehouse','pm_eyrie_watchtower'],note:'retractable Dogon notched-ladder cleft bastion & scarp eyrie sentries'},
 {trade:'coast guard',voth:'voth_bldg_coastguard_berth',na:'landlocked 3,000-4,000 m northeast danxia plateau 580 m above Painted Canyon; cliff sentries watch from pm_eyrie_watchtower'},
 {trade:'temple priests and servants',voth:'voth_bldg_temple_ash',keys:['pm_stone_circle_shrine','pm_spring_palace_rich'],note:'shamanic danxia monolith circle, phsage smudge-kiva & Wandjina seep-spring keepers'},
 {trade:'shrine keepers',voth:'village shrine',keys:['pm_songline_gallery','pm_stone_circle_shrine','pm_lorrkon_ossuary'],note:'overhang Wandjina & Yanta-Rringka songline gallery, stencilled monoliths & Korona-feathered Pukamani poles'},
 {trade:'shopkeepers and assistants',voth:'voth_shop_trader',keys:['pm_ochre_cake_press','pm_truce_ring_pavilion','pm_woomera_obsidian_shop','pm_pitch_basket_shed'],note:'mineral paint-cake & Korona orchil barter shed, playa exchangers, obsidian knappers & pitch-basketry makers'},
 {trade:'smiths and craftsmen',voth:'voth_shop_smithy',keys:['pm_salvage_scrap_forge','pm_woomera_obsidian_shop','pm_pitch_basket_shed'],note:'reclaimed Ancient scrap-iron smiths, Korona obsidian-pancake knappers & burl coolamon carvers'},
 {trade:'innkeepers and servers',voth:'voth_tavern_b',keys:['pm_rattlepod_brew_hut','pm_truce_ring_pavilion']},
 {trade:'porters and warehousemen',voth:'voth_warehouse_b',keys:['pm_silk_winch_post','pm_salvage_tank_round','pm_niche_granary_wall'],note:'Korona wild-silk cliff hoist crews & shuttered cliff-niche storage lockers'},
 {trade:'industrial workers',voth:'industrial lot',keys:['pm_pigment_quarry','pm_ochre_cake_press','pm_salvage_scrap_forge','pm_bark_dye_court'],note:'mineral ochre/celadonite bench cutters, dye-cake slab pressers, pinyon-pitch boilers & Ancient scrap cold-forgers'},
 {trade:'power-house stokers and engineers',voth:'voth_generator',na:'non-industrial cliff-dwelling tribes with zero steam or electric grid; counterweight Korona wild-silk winches and gravity seep channels work cliff ledges'},
 {trade:'household service',voth:'rich house, manor, clan compound',keys:['pm_alcove_compound_rich','pm_spring_palace_rich','pm_chief_maloca_rich']},
 {trade:'soldiers',voth:'voth_barracks',keys:['pm_maloca_warrior_hall','pm_ladder_gatehouse','pm_ledge_parapet','pm_eyrie_watchtower'],note:'body-painted Payntja-Mana raider bands, woomera dart-throwers & cleft defenders'},
 {trade:'teachers and scholars',voth:'voth_school',keys:['pm_songline_gallery','pm_maloca_warrior_hall'],note:'overhang rock-art songline elders, hollow drone-pipe masters & concentric waterhole track-map keepers'},
 {trade:'guild officers and clerks',voth:'voth_bldg_guild_hall',keys:['pm_truce_ring_pavilion','pm_spring_palace_rich'],note:'inter-clan playa truce-moot tally-stick & ochre-mark arbiters'},
 {trade:'customs officers and clerks',voth:'customs house',keys:['pm_ladder_gatehouse','pm_silk_winch_post'],note:'Korona Silkhead Gorge moat-lip trade toll & retractable cliff-ladder wardens'},
 {trade:'healers and nurses',voth:'house of healing',keys:['pm_paintbrush_healer','pm_ochre_cake_press'],note:'paintbrush, phsage & juniper smudge lodge plus cured scarlet paintbrush medicine trade bundles'},
 {trade:'priests and undertakers',voth:'funerary temple',keys:['pm_lorrkon_ossuary','pm_stone_circle_shrine'],note:'hollow canyon-oak Lorrkon bone-coffin painters & cliff-ledge mortuary keepers'},
 {trade:'lighthouse keepers',voth:'lighthouse',keys:['pm_eyrie_watchtower'],note:'hogback scarp fire-and-smoke signal tower guiding war-bands across badland dust'},
 {trade:'dockers and stevedores',voth:'harbour pier',keys:['pm_silk_winch_post'],note:'braided Korona wild-silk cliff-lip winch crews hauling gorge trade loads'},
 {trade:'river bargemen and quay hands',voth:'river quay',keys:['pm_silk_winch_post'],note:'canyon-wall cargo hoist & seasonal wash flash-cistern hands'},
 {trade:'fishers',voth:'fishing dock',keys:['pm_ledge_seep_garden','pm_smokehouse_jerky'],note:'deep canyon-bottom pool & Korona moat-rim trap tenders'},
 {trade:'market traders',voth:'market stall',keys:['pm_truce_ring_pavilion','pm_ochre_cake_press'],note:'playa truce-market & dye-cake press bartering black/red/teal mineral paints, Korona orchil & paintbrush medicine'},
 {trade:'farmhands and ploughmen',voth:'fields',keys:['pm_ledge_seep_garden'],note:'digging-stick cultivators of basin amaranth, murnong tubers & paintbrush on seep-fed ledges'},
 {trade:'chinampa growers',voth:'chinampa bed',keys:['pm_ledge_seep_garden'],note:'sandstone-bentonite seep-contact sub-irrigated terrace beds'},
 {trade:'orchardmen',voth:'orchards',keys:['pm_ledge_seep_garden','pm_pitch_basket_shed'],note:'managed rim paintedpinyon nut & resin stands and canyon-oak mast groves'},
 {trade:'miners',voth:'mine',keys:['pm_pigment_quarry'],note:'bench-cutting iron red-ochre, celadonite-teal/copper & lignite-black seams via kits/resources resSource'},
 {trade:'quarrymen and masons',voth:'quarry',keys:['pm_pigment_quarry'],note:'splitting tabular danxia sandstone slabs & digging badland bentonite plaster clay'},
 {trade:'granary keepers and millers',voth:'granary, windmill, watermill',keys:['pm_talus_granary','pm_niche_granary_wall','pm_amaranth_roast_oven'],note:'bunchgrass-hatted Dogon talus silos, shuttered cliff-niche lockers & danxia metate troughs'},
 {trade:'beetle herders',voth:'beetle ranch',na:'cold-steppe 3,000-4,000 m Painted Highlands (winter -3 to -9 C) have zero giant beetles; clans pen plateau pronghorn in pm_pronghorn_corral'},
 {trade:'dairymen',voth:'dairy',keys:['pm_pronghorn_corral'],note:'tamed plateau pronghorn & cliff-goat pen and curing shed'},
 {trade:'swineherds and duck keepers',voth:'sty, coop',keys:['pm_pronghorn_corral'],note:'penned pronghorn fawns & canyon-brush game'},
 {trade:'mushroom growers',voth:'mushroom farm',keys:['pm_paintbrush_healer','pm_ledge_seep_garden'],note:'damp seep-alcove shelf-fungi & shaded overhang beds'},
 {trade:'envoys and embassy staff',voth:'embassy',keys:['pm_truce_ring_pavilion'],note:'neutral Yanta-Rringka stencilled playa truce-ring hosting Korona gorge traders & rival clan speakers'},
 {trade:'ferrymen',voth:'ferry, stop',keys:['pm_silk_winch_post'],note:'braided wild-silk canyon-cleft haulage & basket-hoist riggers'},
 {trade:'elephant bug handlers and station hands',voth:'bug station',na:'sheer danxia hogbacks and notched Dogon cliff ladders bar elephant-bug teams; freight moves by head-strap basket and wild-silk winch'},
 {trade:'monks and lay brothers',voth:'monastery',keys:['pm_songline_gallery','pm_lorrkon_ossuary'],note:'secluded rock-art songline & drone-pipe initiates and cliff ossuary painters'},
 {trade:'palace and canton staffs',voth:'the cantons',keys:['pm_spring_palace_rich','pm_alcove_compound_rich','pm_chief_maloca_rich'],note:'Paramount Paint-Chief seep-spring court & clan-council maloca retainers'},
 // Explicit plateau ecological & non-literate cultural exclusions (PLAN.md §0 & §3)
 {trade:'potters',voth:'pottery kiln',na:'zero kiln-firing clay in Painted Highlands (badland smectite/bentonite swells and shatters in a kiln); pinyon-pitch-sealed coiled willow tus jugs (pm_pitch_basket_shed), burl coolamons and raided iron pots replace all pottery'},
 {trade:'glassmakers',voth:'glassworks',na:'zero glass-blowing furnaces on the cold-steppe plateau; knapped Korona obsidian-pancake volcanic glass (pm_woomera_obsidian_shop) and natural selenite crystal smoke-slits serve instead'},
 {trade:'bankers',voth:'bank, mint',na:'non-monetized gift, raid-trophy and playa barter economy (ochre cakes, Korona wild-silk, obsidian cores and pronghorn pelts in pm_truce_ring_pavilion); zero coinage or banks'},
 {trade:'scribes',voth:'scriptorium',na:'strictly oral Payntja-Tuka songline and visual rock-art culture (Yanta-Rringka hand stencils, concentric waterhole track-maps and X-ray clan panels); zero written script'},
 {trade:'printers',voth:'printing house',na:'oral-tradition plateau clans with zero paper mills, movable type or printing presses; clan law and territory are painted onto danxia rock faces and cured bark screens'}
];
globalThis.PM_TRADES=PM_TRADES;

const PM_FORBIDDEN_MAT=/bamboo|brick|terracotta|ceramic|amphora|porcelain|\bceladon\b|kaen|tlingit|formline|totem|chilkat|pottery/i;

const pmRigMath={
 VIGA_MAX_SPAN:4.2,
 /* Plateau juniper/pinyon viga joists cannot span > 4.20 m clear room width (PLAN.md §0 & §2.1). */
 vigaSpanOk(spanM){
  return typeof spanM==='number'&&isFinite(spanM)&&spanM>0.4&&spanM<=4.2+1e-6;
 },
 clampVigaSpan(spanM){
  const s=spanM==null?3.4:+spanM;
  return s<1.2?1.2:s>4.2?4.2:s;
 },
 /* Material/key hygiene gate: rejects any bamboo, kiln-fired brick/pottery, or legacy Tlingit token. */
 isPlateauMaterialAllowed(name){
  return typeof name==='string'&&name.length>0&&!PM_FORBIDDEN_MAT.test(name);
 },
 /* Bent canyon-oak & juniper maloca cruck-rib profile [rx, rz, y] for normalized height s in [0,1] from
    danxia wind-wall spring (rx0, rz0, ySpring) to bunchgrass ridge-smoke crest (rxTop, rzTop, yApex). */
 malocaCruckArc(rx0,rz0,ySpring,rxTop,rzTop,yApex,s){
  const u=s<0?0:s>1?1:s;
  const bulge=0.08*Math.sin(Math.PI*u);
  const k=Math.pow(u,1.12);
  const rx=rx0+(rxTop-rx0)*k+rx0*bulge;
  const rz=rz0+(rzTop-rz0)*k+rz0*bulge;
  const y=ySpring+(yApex-ySpring)*Math.pow(Math.sin(0.5*Math.PI*u),0.86);
  return [rx,rz,y];
 },
 /* Single-trunk notched Dogon juniper ladder step count & pitch for vertical rise (metres). */
 dogonStepPitch(rise){
  const r=Math.max(0.4,rise==null?0.4:+rise);
  const steps=Math.max(2,Math.round(r/0.28));
  return {steps,pitch:+(r/steps).toFixed(4),leanRun:+(r*0.28).toFixed(4)};
 },
 /* Mesa Verde T-shaped / keyhole doorway half-width at normalized height f in [0,1]: narrow sill, wider shoulders above f >= 0.44. */
 keyholeHalfWidth(wSill,wShoulder,f){
  const u=f<0?0:f>1?1:f;
  return 0.5*(u<0.44?wSill:wShoulder);
 },
 /* Pin weight for Korona bird-feather crests on Pukamani poles: exact 0 at quill socket (v=0), lively plume sway to tip (v=1). */
 featherPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*Math.sqrt(c);
 },
 /* Pin weight for hanging pronghorn-hide door curtains, wild-silk banners & drying paintbrush herb bundles (v=0 crossbar). */
 hangPin(v){
  if(v<=1e-5)return 0;
  const c=v<0?0:v>1?1:v;
  return c*c*(1.4-0.4*c);
 },
 /* Pin weight for 4-corner wild-silk truce-ring canopies & hide sun-shades: exact 0 at all 4 corners. */
 cornerPin(u,v){
  const dMin=Math.min(Math.hypot(u,v),Math.hypot(1-u,v),Math.hypot(u,1-v),Math.hypot(1-u,1-v));
  if(dMin<1e-5)return 0;
  const belly=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  const edge=Math.sin(Math.PI*u)*0.28+Math.sin(Math.PI*v)*0.28;
  const ramp=Math.min(1,dMin/0.22);
  return ramp*ramp*(0.6*belly+0.4*Math.min(1,edge));
 },
 /* Pin weight for braided willow/wild-silk span lines pinned at u=0 and u=1. */
 spanPin(u){
  if(u<=1e-5||u>=1-1e-5)return 0;
  const s=Math.sin(Math.PI*u);
  return s*Math.sqrt(s);
 }
};
globalThis.pmRigMath=pmRigMath;
