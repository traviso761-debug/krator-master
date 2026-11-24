// ================================================================= EREWHON'S LAKE, THE LAKE SHORE — the sites' spec
// [G data] settlements/xanadu/BUILD-OUT.md (the owner, 2026-11-16: "One region per province. Can go ahead and cut
// region"). The sixth region: the Lake Shore province (p1, Lēk-Shor, seat Erehwon; core/region/data/xan-tune.js
// T.provinces, T.lake) on the south and west shore of Erewhon's caldera lake (openworld/SITES.json, xanadu-lake-shore).
// Seventeen sites: Erehwon (its city is settlements/xanadu's Erewhon page), the thirteen p1 shore towns from Ālph-Hēḍ
// round to Siṭāq (each a small square, joined in order by corridors along the shore), and the three small isles
// (Wesṭ-Āil, Lāiṭ-Hāus, Bē-Āil). The long isle (Grēṭ-Āil) is settlements/azure-dream's, not a site here. KSITES
// (core/world/48s-world-sites.js) plans it; core/world/bake_sites.py bakes it to plan/sites.json.
//   hamlets   {id, focus, near: [dx, dz] from the site | bearing (degrees from north, clockwise) and km, look (m, the
//             search round that spot), pop (the village's ceiling), name}
// Erehwon's ring is xanadu-oidong-highrift's (openworld/xanadu-oidong-highrift/src/48-world-site.js), copied, not moved,
// and planned with that region's world seed, so both regions lay the same villages; that region still lists Erehwon.
// The shore towns and the isles have no hamlets yet: their towns go on core/city later (CLAUDE.md), so nothing is drawn
// for them here but their markers and their squares of ground.
// bridges (core/world/42b-world-bridges.js): every road this region lays is bridged where it crosses a named river.
var SITE_SPEC={region:'xanadu-lake-shore',world:1191569,bridges:{culture:'xanadu'},
 sites:{
  s57bkv9741:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   /* the caldera lake is north of the town (edit 5.1-512): the farms along the south shore east and west and up the
      slopes toward the volcanoes, the ranch on the uplands between them */
   {id:'farm-1',focus:'farming',bearing:70,km:8,pop:300},{id:'farm-2',focus:'farming',bearing:110,km:9,pop:300},
   {id:'farm-3',focus:'farming',bearing:165,km:7,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:265,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:190,km:14,pop:200}]},
  /* the shore towns (T.lake, prov p1), Ālph-Hēḍ round to Siṭāq */
  sxanlkalph01:{culture:'xanadu'},sxanlkhotbath01:{culture:'xanadu'},sxanlktea01:{culture:'xanadu'},
  sxanlkpottery01:{culture:'xanadu'},sxanlksaffron01:{culture:'xanadu'},sxanlkweaver01:{culture:'xanadu'},
  sxanlkboatyard01:{culture:'xanadu'},sxanlkgarden01:{culture:'xanadu'},sxanlkquarry01:{culture:'xanadu'},
  sxanlkorchard01:{culture:'xanadu'},sxanlklotus01:{culture:'xanadu'},sxanlkfish01:{culture:'xanadu'},
  sxanlkstack01:{culture:'xanadu'},
  /* the small isles (T.islands; settlements/xanadu/HAMLETS-PLAN.md section 1, step H1, 2026-11-23): fishing villages on
     the fishers' row below, at the tune's people (KHAMLET's census at 240 a village; pop the ceiling). Wesṭ-Āil's 400 are two
     villages at its two ends; Bē-Āil's fishponds and Lāiṭ-Hāus's light and customs house are opt-in pieces the region's kit
     bundle lacks until the all-builds rebuild (kits/xanadu/extra/88g, src/87c's lighthouse is in it but no hamlet row lays
     it): the plan's owed, the villages stand meanwhile */
  sxanlkwestisle01:{culture:'xanadu',hamlets:[
   {id:'west-isle-n',name:'Wesṭ-Āil',culture:'xanadu-fishing',focus:'fishing',near:[0,-900],look:1500,pop:240},
   {id:'west-isle-s',name:'Wesṭ-Āil (south landing)',culture:'xanadu-fishing',focus:'fishing',near:[0,900],look:1500,pop:160}]},
  /* Lāiṭ-Hāus (200) and Bē-Āil (300) (2026-11-23, after their hold: one village at their people did not fit the isle at 1:1, the
     bake leaving 18 and 23 houses unplaced): each two villages at its two ends, as Wesṭ-Āil is, half its people each (PROPOSED) */
  sxanlkeastisle01:{culture:'xanadu',hamlets:[
   {id:'east-isle-n',name:'Lāiṭ-Hāus',culture:'xanadu-fishing',focus:'fishing',near:[0,-500],look:900,pop:100},
   {id:'east-isle-s',name:'Lāiṭ-Hāus (the light landing)',culture:'xanadu-fishing',focus:'fishing',near:[0,500],look:900,pop:100}]},
  sxanlkbayisle01:{culture:'xanadu',hamlets:[
   {id:'bay-isle-n',name:'Bē-Āil',culture:'xanadu-fishing',focus:'fishing',near:[0,-500],look:900,pop:160},
   {id:'bay-isle-s',name:'Bē-Āil (the ponds landing)',culture:'xanadu-fishing',focus:'fishing',near:[0,500],look:900,pop:140}]},
  /* west of Phīsh-Mārkiṭ (settlements/xanadu/HAMLETS-PLAN.md section 3d, step H6; the owner, 2026-11-23): the rim plain's farm
     village and the west road's hill village, each the heart of its site (near [0, 0]). The survey (2026-11-23) found the ground
     good over both squares (dry, slopes under 0.11 at the 90th centile); what refused the houses was the frame: a village at its
     site's own point has its link on its green, so its lanes had no direction. `link` points each main lane down the corridor
     road toward Phīsh-Mārkiṭ. Wesṭ-Rōḍ is laid as farming until the Xanadu row's orchard focus comes with the rebuild */
  sxanrimfarm01:{culture:'xanadu',hamlets:[
   {id:'rim-farm',name:'Rim-Phārm',focus:'farming',near:[0,0],link:[700,660],look:1500,pop:240}]},
  sxanwestroad01:{culture:'xanadu',hamlets:[
   {id:'west-road',name:'Wesṭ-Rōḍ',focus:'farming',near:[0,0],link:[985,174],look:1500,pop:400}]}}};
/* the lake's fishers' row, as openworld/xanadu-oidong-highrift/src/48-world-site.js defines it for Kirstabal's lake (K6), key for
   key: the Xanadu row with the dugouts' boat sheds and the fish racks with their smokehouse, the racks a pending box (xh_fish_racks)
   because kits/xanadu's xa_fish_racks is opt-in and not in XAK. Both copies fold into core/hamlet's Xanadu row at the all-builds
   rebuild (TODO.md, "core/hamlet's Xanadu row: its fishing works") */
if(typeof KHAMLET!=='undefined'&&KHAMLET.CULTURES&&KHAMLET.CULTURES.xanadu&&!KHAMLET.CULTURES['xanadu-fishing']){
 KHAMLET.CULTURES['xanadu-fishing']=Object.assign({},KHAMLET.CULTURES.xanadu,{
  works:Object.assign({},KHAMLET.CULTURES.xanadu.works,{fishing:[{key:'xa_boatshed',jobs:8,share:0.55},{key:'xh_fish_racks',jobs:4,share:0.45}]}),
  focusJobs:Object.assign({},KHAMLET.CULTURES.xanadu.focusJobs,{fishing:90}),reach:Object.assign({},KHAMLET.CULTURES.xanadu.reach,{fishing:260}),
  pending:Object.assign({},KHAMLET.CULTURES.xanadu.pending,{xh_fish_racks:{w:16,d:11,h:3.6,what:'fish racks and a smokehouse'}})});
 if(typeof KTAGS!=='undefined')KTAGS.VOCAB.cultureAlias['xanadu-fishing']={culture:'xanadu'};}
// THE PITCHED CAMPS (openworld/xanadu-oidong-highrift/src/48t and 88t, read in place: core/camp's halt; settlements/xanadu/WORKS-
// PLAN.md section 4, step W2): the Annual Great Caravan's halt at Erehwon (T.gateways gate.dalab, round, one carrier, 900 t: the
// owner, 2026-11-16, "spending the winter in Xanadu visiting Erewhon, Theodiga, and Qiblai"). PROPOSED, every number here: the
// laager (the wagons in a square round the caravan master's pavilion, the gate on the road), outside the land gate on the Vale
// road south of the town; 40 wagons (the rest of the 900 t on the Dalab's beasts); the Dalab's dress (the Tents kit has none
// yet: it falls back to the generic canvas, and the record says so); the Golden Tears' escort's ring beside it (XAN_TUNE
// T.tears.escort: their share of the caravan's goods; 24 of the house's men). Drawn in its windows of the round: from year day
// 311 (the winter's start) and from 107 (back in spring to load), fifteen days each; struck otherwise (nothing stays).
var WORLD_CAMPS={world:1191569,camps:[
 {id:'s57bkv9741/camp/great-caravan',kind:'halt',name:'The Annual Great Caravan\'s halt (Dalab)',site:'s57bkv9741',near:[0,2200],look:1500,way:[0,-1],
  culture:'dalab',wagons:40,formation:'laager',season:{days:[[311,325],[107,121]]},
  escort:{name:'The Golden Tears\' escort',culture:'xanadu',people:24,off:160,program:{sleeping:3,chief:true,supply:0,guard:2,mess:1,stable:1,latrine:1}}}]};
// THE COUNTRYSIDE SAMPLE (core/world 48v and 88r; settlements/xanadu/HAMLETS-PLAN.md section 3, BUILD-PLAN A9): the province's
// bulk villages (p1, Lēk-Shor: the farms and orchards on the rim plain and round the lake, the herders on the uplands) laid near nothing named, one at most to a 6 km cell, kept with the chance of its
// farmland; never counted by the sim. The foci are core/hamlet's Xanadu row's: orchard and silk villages are farming ones until
// the row's own foci come with the all-builds rebuild (TODO.md, "core/hamlet's Xanadu row passed by name folds into the row")
var WORLD_SAMPLE={prov:'p1',culture:'xanadu',cell:6000,foci:[['farming',3],['ranch',1]],pop:[120,300],minFarm:.3,keep:1.4,clear:{site:4000,village:2200,road:250}};
