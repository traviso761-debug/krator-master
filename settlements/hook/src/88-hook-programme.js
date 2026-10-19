/* ============================== HOOK: THE TOWN'S PROGRAMME ([G data]) ============================== */
/* What the lots of Hook are made of (PLAN.md section 3): each layer's culture draws its lots from its own kit, so a
   lot class is `culture:class` (hukoa:middle, iziz:shop...), its keys the kit's own (HOOK_DIMS, scraped from the kits'
   sources by build.py, holds every key's box). The lot filler draws a CULTURE per lot from the quarter's mix (the site
   file's `cultures`), then the class from the street and the wealth (core/city's own choosers), then the piece by
   size (SL.cands). Kits: isk kits/islanders (West: the Hukoa; East: the Kautoans), hyk settlements/ys (the Hykkousoi),
   izv the Iziz Vernacular, vcat the Voth building catalog, apoc kits/post-apoc (the salvage layer).
   The wealth rule is core/city's (falling from the Customs House) plus a quarter's bias: the Heights rich, the Stacks
   poor. The nautical salvage style (PLAN.md section 3) is a draw on poor and middle lots: a tag for the builders that
   can take it (the Islanders' scrap patching does today; the rest is KNOWN_ISSUES.md). No three.js, no DOM. */
const HOOK_PROG={
 centre:[-290,-135],reach:1400,
 cultures:{
  hukoa:{kit:'isk',classes:{
   poor:['iw-hut-scrap','iw-hut-fisher','iw-house-shared'],
   middle:['iw-house-rumah','iw-house-batak','iw-house-tongkonan','iw-house-peak'],
   rich:['iw-house-gadang','iw-house-chief','iw-house-tongkonan-great'],
   manor:['iw-house-gadang'],
   shop:['iw-shophouse','iw-weaver','iw-potter','iw-chandler','iw-bakehouse','iw-butcher'],
   tavern:['iw-kava','iw-guesthouse'],
   industrial:['iw-warehouse','iw-godown','iw-tannery','iw-smithy']}},
  kautoa:{kit:'isk',classes:{
   poor:['ie-hut-scrap','ie-hut-garden','ie-house-shared'],
   middle:['ie-house-uma','ie-house-long','ie-house-cross','ie-house-twin','ie-house-clan'],
   rich:['ie-house-wealthy','ie-house-great'],
   manor:['ie-house-noble','ie-house-chief'],
   shop:['ie-trader','ie-chandler','ie-potter','ie-weaver','ie-bakehouse','ie-butcher'],
   tavern:['ie-kava-house','ie-guesthouse'],
   industrial:['ie-warehouse','ie-smithy','ie-granary']}},
  tethys:{kit:'hyk',classes:{
   poor:['hyk_house_poor_1','hyk_house_poor_2','hyk_house_poor_3'],
   middle:['hyk_house_mid_1','hyk_house_mid_2','hyk_house_mid_3'],
   rich:['hyk_house_rich_1','hyk_house_rich_2','hyk_house_rich_3'],
   manor:['hyk_house_rich_3'],
   shop:['hyk_shop_general','hyk_shop_food','hyk_shop_chandler','hyk_shop_pearl','hyk_shop_salt','hyk_shop_cloth','hyk_shop_potter','hyk_fishmonger','hyk_shop_alchemy'],
   tavern:['hyk_tavern_1','hyk_inn'],
   industrial:['hyk_warehouse_small','hyk_warehouse_large','hyk_smithy_small','hyk_smithy_large']}},
  iziz:{kit:'izv',classes:{
   poor:['vern_house_poor_a','vern_house_poor_b','vern_house_poor_c'],
   middle:['vern_house_mid_a','vern_house_mid_b','vern_house_mid_c'],
   rich:['vern_house_rich_a','vern_house_rich_b'],
   manor:['vern_house_rich_a','vern_house_rich_b'],
   shop:['vern_shops','vern_workshop_a','vern_workshop_b','vern_smithy'],
   tavern:['vern_tavern'],
   industrial:['vern_warehouse','vern_silos','vern_workshop_a']}},
  voth:{kit:'vcat',classes:{
   poor:[['voth_house_poor',0],['voth_house_poor',1],['voth_house_poor',2],['voth_house_poor',3],['voth_house_poor',4]],
   middle:[['voth_house_middle',0],['voth_house_middle',1],['voth_house_middle',2],['voth_house_middle',3],['voth_house_middle',4],['voth_bldg_townhouse',1],['voth_bldg_townhouse',3]],
   rich:[['voth_house_rich',0],['voth_house_rich',1],['voth_house_rich',2],['voth_house_rich',3],['voth_house_rich',4],['voth_bldg_townhouse',0],['voth_bldg_townhouse',2]],
   manor:[['voth_manor',0],['voth_manor',1],['voth_manor',2]],
   shop:[['voth_shop_alchemist',0],['voth_shop_clothier',0],['voth_shop_trader',0],['voth_shop_scribe',0],['voth_shop_provisioner',0],['voth_shop_smithy',0],['voth_shop_potter',0]],
   tavern:[['voth_tavern_b',0],['voth_tavern_b',1],['voth_tavern_b',2],['voth_bldg_tavern',0]],
   industrial:[['voth_warehouse_b',0],['voth_warehouse_b',1],['voth_bldg_warehouse',0]]}},
  salvage:{kit:'apoc',classes:{
   poor:['dw-box','dw-silo','dw-tire','dw-bus','dw-tank','dw-bottle','dw-stilt'],
   middle:['lg-stack','lg-twinsilo','lg-bulkhead','lg-tanktower'],
   shop:['shop-food','shop-armor','shop-weapon','shop-tinker','shop-general'],
   tavern:['mess'],
   industrial:['smithy','warehouse','gen-wind']}}},
 /* a class falls back to the class below when no piece of it fits the frontage (core/city SL.cands) */
 fallback:{manor:'rich',rich:'middle',middle:'poor',shop:'poor',tavern:'shop',industrial:'poor',poor:null},
 /* the quarters' wealth bias on core/city's own rule (0..1) */
 wealthBias:{'q-heights':.3,'q-customs':.15,'q-arsenal':.05,'q-tethys':.05,'q-canton':.1,'q-ironcourt':0,'q-sun':-.05,'q-strand':-.15,'q-point':-.2,'q-stacks':-.45},
 /* the chance a poor or middle lot takes the nautical salvage dressing (a tag the builders read where they can) */
 salvage:{poor:.6,middle:.25},
 /* a lot is a host lot when its footprint stands within this of an Ancient host's pad */
 hostReach:6,
 /* P3: the layers' landmarks (PLAN.md section 4), each a civic piece of its layer's kit placed by core/city's step 6
    on an avenue where its `near` scorer wants it: the site's markers A to I (90a-hook-city.js rules.near). What the
    kits cannot give yet is in KNOWN_ISSUES.md ("The landmarks") */
 landmarks:[
  {key:'vern_governor_palace',near:'B',name:"the governor's palace",role:'palace'},
  {key:'vern_market',near:'A',name:'the Customs market',role:'market'},
  {key:'vern_watch_house',near:'A',name:"the harbour watch's house",role:'watch'},
  {key:'vern_barracks',near:'H',name:"the garrison's barracks (the Iron Court)",role:'garrison'},
  {key:'vern_guard_tower',near:'H',name:"the garrison's tower",role:'tower'},
  {key:'ip-hall',near:'G',name:"the Kautoan governor's house",role:'kautoa-house'},   /* the palace court itself (ip-palace, 102 x 122 m) fits no avenue lot: P3's own placement */
  {key:'hyk_shrine_seagods',near:'F',name:'the Hykkousoi sea temple',role:'sea-temple'},
  {key:'voth_bldg_temple',near:'C',name:'the Temple of the Sun (closed)',role:'temple'},
  {key:'voth_bldg_monastery_chapel',near:'D',name:"the necropolis's chapel",role:'necropolis'},
  {key:'cages',near:'E',name:"the slave market's cages (empty)",role:'slave-market'},
  {key:'watchtower',near:'E',name:"the Izani watch at the Stacks' edge",role:'watch'},
  {key:'iw-hall',near:'I',name:"the Hukoa elders' hall",role:'hall'},
  {key:'iw-temple',near:'I',name:'the moon shrine at the Point',role:'shrine'}],
 /* P3: pods grown on the Tethyan quarter's ruins (the host-lot rule for the Hykkousoi): on the host's face at a bearing
    and a floor height, by the kit's HYK.placeOn; a host's pods are drawn by KRAND from (HOOK_SEED, the host's id) */
 pods:{hosts:{'h-bell':{n:7,y:[7,20]},'h-stalks':{n:4,y:[9,24]}},
  keys:['hyk_pod_poor_1','hyk_pod_poor_2','hyk_pod_mid_1','hyk_pod_mid_2','hyk_pod_shop_armour','hyk_pod_shop_weapon']},
 /* the reconquest's damage field (PLAN.md section 6, question 5): a lot at 0.7 and above is a rubble lot, between 0.3
    and 0.7 it keeps its building with scorch and scaffold dressing (a tag for now) */
 damage:{rubble:.7,scorch:.3}};
/* the culture a kit key belongs to (a civic piece has no culture:class) */
HOOK_PROG.cultureOfKey=function(key){const D=typeof HOOK_DIMS!=='undefined'&&HOOK_DIMS[key],kit=D&&D.kit;
 if(kit==='isk')return /^(ie|ip)-/.test(key)?'kautoa':'hukoa';return {hyk:'tethys',izv:'iziz',vcat:'voth',apoc:'salvage'}[kit]||null;};
/* core/city's TUNE.classes: {culture:class: [[key, v], ...]} and TUNE.fallback over the same names */
HOOK_PROG.classes=function(){const out={};for(const c in this.cultures){const C=this.cultures[c].classes;
 for(const cls in C)out[c+':'+cls]=C[cls].map(k=>Array.isArray(k)?[k[0],k[1]]:[k,0]);}return out;};
HOOK_PROG.fallbackTable=function(){const out={};for(const c in this.cultures){const C=this.cultures[c].classes;
 for(const cls in C){let f=this.fallback[cls];while(f&&!C[f])f=this.fallback[f];out[c+':'+cls]=f?c+':'+f:null;}}return out;};
HOOK_PROG.kitOf=function(key){const D=typeof HOOK_DIMS!=='undefined'&&HOOK_DIMS[key];return D?D.kit:null;};
HOOK_PROG.cultureOf=function(cls){return String(cls).split(':')[0];};
HOOK_PROG.classOf=function(cls){return String(cls).split(':')[1]||cls;};
