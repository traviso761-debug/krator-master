// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the sites' spec
// [G data] PLAN.md (the owner, 2026-11-11; core/simulation/PROPOSAL-LONGSONG-PINNACLE.md sections 2, 2a and 6). Four sites
// (openworld/SITES.json): Longsong, the History Monks' monastery in the Oidong Valley (its page is settlements/longsong),
// and the Order's three houses in the High Rift, which have no page: the Singing Gjar (the outpost), the Mirror Grange
// (the productive house) and the Caldron House (the strategic one). KSITES (core/world/48s-world-sites.js) plans it;
// core/world/bake_sites.py bakes it to plan/sites.json.
//   hamlets   {id, focus, near: [dx, dz] from the site | bearing (degrees from north, clockwise) and km, look (m, the
//             search round that spot), pop (the village's ceiling), name, culture (the row, when not the site's)}
//   links     the roads between the sites: [site a, site b, {hw, r, keep, via, stops}]
// Longsong's ring is 15 villages on core/hamlet's `xanadu` row (12 farming, 2 herding, 1 silk and paper; PLAN.md section 2):
// its first three stand where its page lays them (settlements/longsong/src/40h-ls-hamlets.js), the rest 3.5 to 12 km out,
// a day's walk. Each house of the Order is a village on core/hamlet's `order` row (its `monastery` focus), its work camps
// and lay villages on the `xanadu` row.
var ORDER_STOPS={every:25000,inn:'xa_rich_b',rest:'xa_teahouse',culture:'order',look:5000};
// the Sultanate's road (the Ancient network's Xanadu class, openworld/ANCIENT-NETWORK.md 8.14): a han every 25 km
var XANADU_STOPS={every:25000,inn:'xa_house_turk_a',rest:'xa_teahouse',culture:'xanadu',look:5000};
// bridges (core/world/42b-world-bridges.js, the owner 2026-11-11): every road and link this region lays is bridged where it
// crosses a named river, so the links are laid on the ground and the rivers run on under them
var SITE_SPEC={region:'oidong-highrift',world:1311634,bridges:{culture:'order'},
 sites:{
  /* Strongbow (an arcology of the Sultanate; no page, its countryside not planned yet): the far end of the Xanadu road */
  sfgtxw10kr:{culture:'xanadu'},
  sq80bzd7ep:{culture:'xanadu',road:{r:400,hw:2,join:true},hamlets:[
   {id:'east',name:'Shar, the east village',focus:'farming',near:[760,60],look:1200,pop:220},
   {id:'west',name:'Nub, the west village',focus:'farming',near:[-880,60],look:1200,pop:220},
   {id:'herders',name:"Dzo-ling, the herders' village",focus:'ranch',near:[480,650],look:1200,pop:145},
   {id:'lho',name:'Lho, the south village',focus:'farming',bearing:180,km:4,pop:240},
   {id:'jang',name:'Jang, the north village',focus:'farming',bearing:0,km:4.5,pop:240},
   {id:'dongkar',name:'Dongkar',focus:'farming',bearing:60,km:5,pop:240},
   {id:'serpo',name:'Serpo',focus:'farming',bearing:120,km:5.5,pop:240},
   {id:'tsomo',name:'Tsomo',focus:'farming',bearing:240,km:5,pop:240},
   {id:'chumig',name:'Chumig',focus:'farming',bearing:300,km:5.5,pop:240},
   {id:'ngonpo',name:'Ngonpo',focus:'farming',bearing:90,km:8,pop:240},
   {id:'ribo',name:'Ribo',focus:'farming',bearing:270,km:8,pop:240},
   {id:'shingkha',name:'Shingkha',focus:'farming',bearing:150,km:8.5,pop:240},
   {id:'nyima',name:'Nyima',focus:'farming',bearing:25,km:8,pop:240},
   {id:'drokri',name:'Drok-ri, the high pastures',focus:'ranch',bearing:330,km:12,pop:160},
   {id:'darling',name:'Dar-ling, the silk and paper village',focus:'silk',bearing:210,km:6,pop:160}]},
  ssinggjar01:{culture:'order',road:{r:150,hw:1.6,join:true},hamlets:[
   {id:'house',name:'The house at the Singing Gjar',focus:'monastery',near:[0,0],look:4000,pop:350,link:[-3000,0],road:false},
   {id:'beck-fields',name:'The Beck Fields',culture:'xanadu',focus:'farming',bearing:265,km:10,look:5000,pop:90},
   {id:'vein-camp',name:'The Vein Camp',culture:'xanadu',focus:'mine',bearing:40,km:5,look:4000,pop:50}]},
  smirrorgrange01:{culture:'order',road:{r:150,hw:1.6,join:true},hamlets:[
   {id:'house',name:'The Mirror Grange',focus:'monastery',near:[0,0],look:3000,pop:80,link:[-3000,0],road:false},
   {id:'growers',name:"The grange's growers",culture:'xanadu',focus:'farming',bearing:200,km:3,look:3000,pop:200},
   {id:'herders',name:"The graben's herders",culture:'xanadu',focus:'ranch',bearing:120,km:6,look:4000,pop:150}]},
  scaldronhouse01:{culture:'order',road:{r:150,hw:1.6,join:true},hamlets:[
   {id:'house',name:'The Caldron House',focus:'monastery',near:[0,0],look:3000,pop:60,link:[-3000,0],road:false},
   {id:'shelf',name:'The Caldron shelf village',culture:'xanadu',focus:'farming',bearing:120,km:2.5,look:3000,pop:150}]}},
 /* the Order's road up the Oidong Valley and the beck's staircase (`guide`, 5.1 px: the straight line crosses the range
    south of the valley, which took it over 6,000 m), past Oidong's lake on its north shore */
 links:[['sq80bzd7ep','scaldronhouse01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS,guide:[[1226,1626],[1240,1628],[1255,1632],[1265,1636],
   [1275,1640],[1282,1643],[1288,1645],[1294,1647],[1306,1651],[1312,1653],[1318,1657],[1325,1662],[1332,1666],[1340,1667],[1347,1665],[1360,1664],[1366,1668]]}],
  ['scaldronhouse01','smirrorgrange01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS}],
  ['smirrorgrange01','ssinggjar01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS}],
  /* the Xanadu road, Strongbow to Longsong, on the Ancient network's line (xanadu.3.5: 427 km on the map) */
  ['sfgtxw10kr','sq80bzd7ep',{hw:3,r:1500,keep:true,net:'xanadu.3.5',culture:'xanadu',stops:XANADU_STOPS}]]};
