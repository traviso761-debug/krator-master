// ================================================================= XANADU, OIDONG AND THE HIGH RIFT — the sites' spec
// [G data] openworld/PLAN-SITES.md, the second region (the owner, 2026-11-10). Three sites of the scale model (openworld/
// SITES.json): Erehwon and Qiblai, the Sultanate's cities in the Vale of Xanadu, and Longsong, the History Monks'
// monastery in the Oidong Valley. Their towns stay their own pages' (settlements/xanadu's Erehwon, settlements/longsong;
// Qiblai has none yet); each site plans its countryside on the world's ground with core/hamlet's `xanadu` row (the Xanadu
// kit's buildings): farming villages ringed round the town, a ranching village farther out, a road from each village's
// lane end to its town, and roads between the towns. KSITES (core/world/48s-world-sites.js) plans it;
// core/world/bake_sites.py bakes it to plan/sites.json.
//   hamlets   {id, focus, near: [dx, dz] from the site | bearing (degrees from north, clockwise) and km, look (m, the
//             search round that spot), pop (the village's ceiling), name}
//   links     the roads between the towns: [site a, site b, {hw, r (where the town's own streets take over)}]
// Longsong's three villages stand where its page lays them (settlements/longsong/src/40h-ls-hamlets.js: east and west
// farmers and the herders, in its frame round the monastery).
/* Salphar's row (settlements/thalaba/PLAN.md section 4, the owner 2026-11-16: "its own small sulfur node", 30 t a year, a steady
   works): the diggers' hamlet on the town's deposit at the cataract's foot, the Xanadu row with a `sulfur` focus of its own:
   the adits into the beds, the calcaroni (sulfur kilns: the ore banked under earth and burnt so the sulfur melts out and runs
   to the foot) and the sorting shed. Its people are mostly the shift crews (the town's diggers), so 80 % at work. The kit has
   no calcarone (Thalaba's own pieces are in settlements/thalaba/src): a pending box here, drawn as a stand-in. The row lives
   here, as Oidong's vein camp's does, so core/hamlet (56 pages) is not touched */
KHAMLET.CULTURES['xanadu-sulfur']=Object.assign({},KHAMLET.CULTURES.xanadu,{workShare:0.8,household:4.5,
 services:{religious:0,civic:1,general:1,food:2,warehouse:1},
 houses:{poor:[['xa_poor_b',3,2],['xa_poor_a',2,2]],middling:[['xa_mid_c',4,1]],head:[['xa_rich_c',1,1]],middlingShare:0.15},
 works:Object.assign({},KHAMLET.CULTURES.xanadu.works,{sulfur:[{key:'xa_adit',jobs:8,share:0.45},{key:'tb_calcarone',jobs:6,share:0.4},{key:'xa_workshop',jobs:8,share:0.15}]}),
 focusJobs:Object.assign({},KHAMLET.CULTURES.xanadu.focusJobs,{sulfur:70}),reach:Object.assign({},KHAMLET.CULTURES.xanadu.reach,{sulfur:380}),
 pending:Object.assign({},KHAMLET.CULTURES.xanadu.pending,{tb_calcarone:{w:12,d:12,h:4,what:'a calcarone: a sulfur kiln, the ore banked under earth and burnt so the sulfur melts out to its foot'}})});
if(typeof KTAGS!=='undefined')KTAGS.VOCAB.cultureAlias['xanadu-sulfur']={culture:'xanadu'};
// bridges (core/world/42b-world-bridges.js; 2026-11-16, for Thalaba's Briḍj): every road and link this region lays is bridged
// where it crosses a named river, in the Xanadu kit's stone, so the roads are laid over the rivers and the rivers run on under them
var SITE_SPEC={region:'xanadu-oidong-highrift',world:1191569,bridges:{culture:'xanadu'},
 sites:{
  s57bkv9741:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   /* the caldera lake is north of the town (edit 5.1-512): the farms along the south shore east and west and up the
      slopes toward the volcanoes, the ranch on the uplands between them */
   {id:'farm-1',focus:'farming',bearing:70,km:8,pop:300},{id:'farm-2',focus:'farming',bearing:110,km:9,pop:300},
   {id:'farm-3',focus:'farming',bearing:165,km:7,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:265,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:190,km:14,pop:200}]},
  skm4jjo2vl:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:0,km:7,pop:300},{id:'farm-2',focus:'farming',bearing:75,km:8,pop:300},
   {id:'farm-3',focus:'farming',bearing:145,km:6.5,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:290,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:110,km:12,pop:200}]},
  sq80bzd7ep:{culture:'xanadu',road:{r:400,hw:2,join:true},hamlets:[
   {id:'east',name:'Shar, the east village',focus:'farming',near:[760,60],look:1200,pop:220},
   {id:'west',name:'Nub, the west village',focus:'farming',near:[-880,60],look:1200,pop:220},
   {id:'herders',name:"Dzo-ling, the herders' village",focus:'ranch',near:[480,650],look:1200,pop:160}]},
  /* Thalaba (the owner, 2026-11-16; settlements/thalaba/PLAN.md, the names agreed): the town on the spring line at the
     riser's foot is its own page's; its ring here is the plan's outworks. Briḍj, the bridge ward at the gorge's mouth
     (the road warden's watch, the expeditions' muster corrals: a ranch village), 10 km north where the expedition road
     crosses the Solṭ Siṭrīm; Salphar, the diggers' hamlet on the town's small sulfur deposit at the cataract's foot
     (Gāḍz-Phōl), 20 km north; two farm villages on the Bēnch east of the town */
  shvo49k0y2:{culture:'xanadu',road:{r:900,hw:2.5,join:true},hamlets:[
   {id:'bridj',name:'Briḍj, the bridge ward',focus:'ranch',bearing:0,km:10,look:2500,pop:120},
   {id:'salphar',name:'Salphar, the diggers\' hamlet',culture:'xanadu-sulfur',focus:'sulfur',bearing:4,km:20,look:2500,pop:160},
   {id:'bench-1',name:'the near Bēnch farms',focus:'farming',bearing:95,km:11,pop:220},
   {id:'bench-2',name:'the far Bēnch farms',focus:'farming',bearing:100,km:22,pop:220}]}},
 links:[['s57bkv9741','skm4jjo2vl',{hw:4,r:2000}],['skm4jjo2vl','sq80bzd7ep',{hw:4,r:1500}]]};
