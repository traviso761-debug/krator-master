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
var SITE_SPEC={region:'xanadu-oidong-highrift',world:1191569,
 sites:{
  s57bkv9741:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:20,km:7,pop:300},{id:'farm-2',focus:'farming',bearing:95,km:8,pop:300},
   {id:'farm-3',focus:'farming',bearing:165,km:6.5,pop:300},{id:'farm-4',focus:'farming',bearing:240,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:310,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:200,km:12,pop:200}]},
  skm4jjo2vl:{culture:'xanadu',road:{r:1500,hw:3,join:true},hamlets:[
   {id:'farm-1',focus:'farming',bearing:0,km:7,pop:300},{id:'farm-2',focus:'farming',bearing:75,km:8,pop:300},
   {id:'farm-3',focus:'farming',bearing:145,km:6.5,pop:300},{id:'farm-4',focus:'farming',bearing:215,km:7.5,pop:300},
   {id:'farm-5',focus:'farming',bearing:290,km:8.5,pop:300},{id:'ranch-1',focus:'ranch',bearing:110,km:12,pop:200}]},
  sq80bzd7ep:{culture:'xanadu',road:{r:400,hw:2,join:true},hamlets:[
   {id:'east',name:'Shar, the east village',focus:'farming',near:[760,60],look:1200,pop:220},
   {id:'west',name:'Nub, the west village',focus:'farming',near:[-880,60],look:1200,pop:220},
   {id:'herders',name:"Dzo-ling, the herders' village",focus:'ranch',near:[480,650],look:1200,pop:160}]}},
 links:[['s57bkv9741','skm4jjo2vl',{hw:4,r:2000}],['skm4jjo2vl','sq80bzd7ep',{hw:4,r:1500}]]};
