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
/* the lake's fishers' row (settlements/kirstabal/PLAN.md K4 and K6; its page's KS_RING.fishingRow): the Xanadu row with the fishing
   works it lacks, the dugouts' boat sheds and the fish racks with their smokehouse: a pending box under a key no kit defines
   (xh_fish_racks), drawn as a stand-in. Not kits/xanadu 87k's xa_fish_racks: that piece is opt-in and not in XAK, while
   core/world/bake_sites.py reads every kits/xanadu/src file, so the bake gave it a size the page did not and the baked plan
   and the page's differed. Here, as Salphar's row is, so core/hamlet is not touched */
KHAMLET.CULTURES['xanadu-fishing']=Object.assign({},KHAMLET.CULTURES.xanadu,{
 works:Object.assign({},KHAMLET.CULTURES.xanadu.works,{fishing:[{key:'xa_boatshed',jobs:8,share:0.55},{key:'xh_fish_racks',jobs:4,share:0.45}]}),
 focusJobs:Object.assign({},KHAMLET.CULTURES.xanadu.focusJobs,{fishing:90}),reach:Object.assign({},KHAMLET.CULTURES.xanadu.reach,{fishing:260}),
 pending:Object.assign({},KHAMLET.CULTURES.xanadu.pending,{xh_fish_racks:{w:16,d:11,h:3.6,what:'fish racks and a smokehouse'}})});
if(typeof KTAGS!=='undefined')KTAGS.VOCAB.cultureAlias['xanadu-fishing']={culture:'xanadu'};
// bridges (core/world/42b-world-bridges.js; 2026-11-16, for Thalaba's Briḍj): every road and link this region lays is bridged
// where it crosses a named river, in the Xanadu kit's stone, so the roads are laid over the rivers and the rivers run on under them
/* the Qiblai temple estates' row (settlements/qiblai, Q7f): the Xanadu row with the Orders' foci. The estate's shrine is its
   temple, the Order's steward keeps the Farmers' Guild hall; the dairy keeps the water buffalo (pens and the dairy), the
   apiary rows of log and clay hives on stands (the kit has none: a pending box, drawn as a stand-in) */
KHAMLET.CULTURES['qiblai-estate']=Object.assign({},KHAMLET.CULTURES.xanadu,{workShare:0.55,
 services:{religious:1,civic:1,general:1,food:2,warehouse:2},
 works:Object.assign({},KHAMLET.CULTURES.xanadu.works,{
  dairy:[{key:'xa_farmhouse',jobs:8,share:0.35},{key:'xa_pens',jobs:3,share:0.25},{key:'xa_dairy',jobs:4,share:0.4}],
  apiary:[{key:'xa_farmhouse',jobs:8,share:0.35},{key:'xa_apiary',jobs:3,share:0.65}]}),
 focusJobs:Object.assign({},KHAMLET.CULTURES.xanadu.focusJobs,{farming:150,dairy:80,apiary:50}),   /* the estates' wet-rice and two crops a year: more hands than a valley village */
 reach:Object.assign({},KHAMLET.CULTURES.xanadu.reach,{dairy:480,apiary:520}),
 pending:Object.assign({},KHAMLET.CULTURES.xanadu.pending,{xa_apiary:{w:12,d:8,h:1.6,what:'an apiary: rows of log and clay hives on stands under a lean-to'}})});
if(typeof KTAGS!=='undefined')KTAGS.VOCAB.cultureAlias['qiblai-estate']={culture:'xanadu'};
var QIBLAI_ESTATES=(function(){
 /* the owner, 2026-11-16 ("Grow the estates"): the ring out to the site's 30 km, about 30,000 people, so the estates feed the
    city (kits/qiblai/PLAN.md section 8). Each Order holds the 45-degree sector round its spoke: seven rings of villages, one
    near the city to four at the edge, sixteen a sector, 128 in all; the rice farms inside, the buffalo dairies and the hives
    toward the forest's edge. farm-1 keeps the old first village's spot (north, 7 km), where the world's checks stand */
 const ORD=['the Flashing Eye','the History Monks','the Beacon','Viridian Thought','the Turquoise monastery','the Azure Dream','the Violet Storm','the White Lily'],
  COL=['Crimson','Saffron','Gold','Green','Turquoise','Blue','Violet','White'],
  RINGS=[[7,['farming']],[10.5,['farming']],[14,['farming','farming']],[17.5,['farming','farming']],[21,['farming','dairy','farming']],
   [24.5,['dairy','farming','apiary']],[27.5,['apiary','farming','apiary','dairy']]],
  /* a village moved off its ring where its road would not lie on the land (the highways check: white-farming-9's lane
     stood 0.8 m off the ground at 24.5 km, 2026-11-16) */
  NUDGE={'white-farming-9':{km:23.5}},
  POP={farming:300,dairy:240,apiary:180},WHAT={farming:'rice farm',dairy:'dairy',apiary:'hives'},out=[];
 for(let i=0;i<8;i++){const n={};RINGS.forEach((R,k)=>{const c=R[1].length;R[1].forEach((f,j)=>{n[f]=(n[f]||0)+1;
  const off=c===1?(k%2?10:0):((j+.5)/c-.5)*38,id=i===0&&k===0?'farm-1':COL[i].toLowerCase()+'-'+f+'-'+n[f];
  out.push(Object.assign({id,focus:f,bearing:i*45+off,km:R[0],look:k>=5?5000:3000,pop:POP[f],name:'the '+COL[i]+' estates, '+WHAT[f]+' '+n[f]+' ('+ORD[i]+')'},NUDGE[id]));});});}
 return out;})();
var SITE_SPEC={region:'xanadu-oidong-highrift',world:1191569,bridges:{culture:'xanadu'},
 sites:{
  s57bkv9741:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   /* the caldera lake is north of the town (edit 5.1-512): the farms along the south shore east and west and up the
      slopes toward the volcanoes, the ranch on the uplands between them */
   {id:'farm-1',focus:'farming',bearing:70,km:8,pop:300},{id:'farm-2',focus:'farming',bearing:110,km:9,pop:300},
   {id:'farm-3',focus:'farming',bearing:165,km:7,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:265,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:190,km:14,pop:200}]},
  /* Qiblai's temple estates (settlements/qiblai/PLAN.md Q7f, kits/qiblai/PLAN.md section 8; 2026-11-16): the ring re-planned as the
     great Orders' estates, three along each monastery's spoke (bearing i*45, the city's QSPOKE order: crimson, saffron,
     gold, green, turquoise, blue, violet, white): the rice and grain farms nearest, the buffalo dairies next, the apiaries
     farthest, at the forest's edge (the sacraments are milk and honey). Each owes its Order; farm-1 keeps its old spot
     (north, 7 km), where the world's checks stand */
  skm4jjo2vl:{culture:'qiblai-estate',road:{r:1500,hw:3,join:true},hamlets:QIBLAI_ESTATES},
  /* Lāiṭwāl, the Light Wall (settlements/lightwall/PLAN.md, step L5; its own page is the town, the wall and the bench): the
     north boundary fault's wall straight behind it, the great lake at its feet, so its villages stand east and west along
     the shore's bench terraces, the herders on the bench's western end */
  slaitwal0001:{culture:'xanadu',road:{r:900,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:85,km:6,look:2500,pop:260},{id:'farm-2',focus:'farming',bearing:275,km:6,look:2500,pop:260},
   {id:'farm-3',focus:'farming',bearing:110,km:11,look:2500,pop:220},{id:'ranch-1',focus:'ranch',bearing:255,km:12,look:3000,pop:180}]},
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
   {id:'bench-2',name:'the far Bēnch farms',focus:'farming',bearing:100,km:22,pop:220}]},
  /* Kirstabal (settlements/kirstabal/PLAN.md, step K6; the owner, 2026-11-16): the barge port at the head of the Lower Xanadu Lake
     is its own page's (a target on Xanadu's page). Its ring stands at the tune's places (core/region/data/xan-tune.js T.ksRing,
     offsets from the pin in metres): Mil, Kanāl and Grēnz, the farming villages on the apron south of the town, and Bāiyar, the
     ranch beyond them; the lake's eight (T.lowerLake): seven fishing villages round the shore on the fishers' row and the Landing at
     the portage, the barges' stop at the lake's west end. A lake village's spot is the model's lake cell nearest the tune's
     place (2 km cells: the tune's places stand 2 to 3 km back from the water), so the search finds the shore. Each lake
     village is laid at the row's own size (about 240: its census fills the focus's jobs), under its ceiling of 500
     (KHAMLET.POP_MAX); the tune keeps their whole numbers (Phisharī 1,400 ... the Landing 2,500). Ōpal-Māuṭh is now the town
     Gihon (settlements/gihon, G1 2026-11-22): its own page; its site, ring and the Landing's piers on this region wait for its step */
  sl758m2396:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'mil',name:'Mil (the mill)',focus:'farming',near:[-3000,3600],look:2000,pop:240},
   {id:'kanal',name:'Kanāl (the canal)',focus:'farming',near:[-5000,6000],look:2000,pop:240},
   {id:'grenz',name:'Grēnz (the grain)',focus:'farming',near:[-400,5200],look:2000,pop:240},
   {id:'baiyar',name:'Bāiyar (the byre)',focus:'ranch',near:[-7000,9000],look:2500,pop:145},
   {id:'sekrid',name:'Sekriḍ',culture:'xanadu-fishing',focus:'fishing',near:[-8000,-22000],look:4000,pop:500},
   {id:'phishari',name:'Phisharī',culture:'xanadu-fishing',focus:'fishing',near:[-30000,-24000],look:4000,pop:500},
   {id:'kako-bagh',name:'Kāko-Bāgh',culture:'xanadu-fishing',focus:'fishing',near:[-54000,-26000],look:4000,pop:500},
   {id:'rid',name:'Rīḍ',culture:'xanadu-fishing',focus:'fishing',near:[-80000,-20000],look:4000,pop:500},
   {id:'landing',name:'The Landing',focus:'farming',near:[-110000,0],look:4000,pop:500},
   {id:'timbar',name:'Ṭimbar',culture:'xanadu-fishing',focus:'fishing',near:[-100000,10000],look:4000,pop:500},
   {id:'rais-teras',name:'Rāis-Ṭeras',culture:'xanadu-fishing',focus:'fishing',near:[-44000,10000],look:4000,pop:500},
   {id:'kattal',name:'Kaṭal',culture:'xanadu-fishing',focus:'fishing',near:[-20000,8000],look:4000,pop:500}]},
  /* Strongbow's foot (PROPOSED by settlements/kirstabal K6, openworld/SITES.json sstrongbowft): the bottom of the lift on the Xanadu
     floor, where Kirstabal's page ends its Strongbow road. Strongbow's own session places its foot town; nothing is planned here
     but the road's end */
  sstrongbowft:{culture:'xanadu'}},
 /* the roads to a point (core/world 48s `ways`, 2026-11-16, the owner: "Grow the cut up the gorge"): Thalaba's expedition road
    goes on from Salphar up Godshearth's gorge, past the Spillway (the gorge's station 4, xanaduspill, px 845,1422), to the Rare
    Devisers' camp at the hot lake's outlet (px 839,1398: the owner, 2026-11-16, "Yes, the outlet"; settlements/devisers-camp);
    the guide keeps it in the gorge past the Spillway. It ends at the cut's edge until the region's recut takes the corridor */
 ways:[{id:'expedition',name:"the expedition road (to the Devisers' camp)",from:'shvo49k0y2',start:'salphar',to:{px:[839,1398]},guide:[[845,1422]],hw:2.5,via:4000}],
 /* the links: Erehwon-Qiblai, Qiblai-Longsong; Kirstabal to Strongbow's foot (over Keb Riwā's mouth, PLAN.md: 12-16 km), and
    Kirstabal along the lake to Qiblai (the owner, 2026-11-16: "road follows lake and gorge"; the barges carry the bulk) */
 links:[['s57bkv9741','skm4jjo2vl',{hw:4,r:2000}],['skm4jjo2vl','sq80bzd7ep',{hw:4,r:1500}],
  ['sl758m2396','sstrongbowft',{hw:3.5,r:1200}],['sl758m2396','skm4jjo2vl',{hw:3,r:1500}]]};
