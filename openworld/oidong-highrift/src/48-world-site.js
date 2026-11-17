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
// its first three stand where its page lays them (settlements/longsong/src/40h-ls-hamlets.js: page spots turned by the page's
// 28.6 degrees onto the compass, LS.dirToWorld), the rest 3.5 to 12 km out,
// a day's walk. Each house of the Order is a village on core/hamlet's `order` row (its `monastery` focus), its work camps
// and lay villages on the `xanadu` row.
var ORDER_STOPS={every:25000,inn:'xa_rich_b',rest:'xa_teahouse',culture:'order',look:5000};
// the Sultanate's road (the Ancient network's Xanadu class, openworld/ANCIENT-NETWORK.md 8.14): a han every 25 km
var XANADU_STOPS={every:25000,inn:'xa_house_turk_a',rest:'xa_teahouse',culture:'xanadu',look:5000};
/* a work camp (the Vein Camp; the owner 2026-11-11, "rebalance it so it is mostly miners"): its people are nearly all at
   work, men who sleep in bunkhouses and send their pay home, with no families, so the `xanadu` row's 45 % at work becomes
   90 %. A cookhouse, a store and the camp's tally house stand in for a village's temple, guild hall and bazaar (the
   miners keep their own shrine). The row lives here until core/hamlet takes a `camp` option (TODO.md, ride along with the
   next all-builds rebuild: core/hamlet reaches 56 pages) */
KHAMLET.CULTURES['xanadu-camp']=Object.assign({},KHAMLET.CULTURES.xanadu,{workShare:0.9,household:4,
 services:{religious:0,civic:1,general:1,food:2,warehouse:1},
 houses:{poor:[['xa_poor_b',3,2],['xa_mid_c',4,1]],middling:[['xa_mid_c',4,1]],head:[['xa_rich_a',1,1]],middlingShare:0}});
/* its buildings are the Sultanate's: the row's name tags as `xanadu` (core/tags' alias table, as 'yuni-order' is 'order') */
if(typeof KTAGS!=='undefined')KTAGS.VOCAB.cultureAlias['xanadu-camp']={culture:'xanadu'};
// bridges (core/world/42b-world-bridges.js, the owner 2026-11-11): every road and link this region lays is bridged where it
// crosses a named river, so the links are laid on the ground and the rivers run on under them
/* staffing (the owner, 2026-11-11: "make hamlets and monasteries be at least 70% fully staffed, increase pop if needed"):
   every village's and house's ceiling lets KHAMLET.census fill at least 70 % of the focus jobs its row wants (farming 90,
   monastery 260); the Beck Fields and the Caldron shelf village rose to 180 (66 of 90 field jobs), the Mirror Grange and the Caldron House to 260 (187 of 260) */
var SITE_SPEC={region:'oidong-highrift',world:1311634,bridges:{culture:'order'},
 sites:{
  /* Strongbow, the Ancients' cliff arcology hung in the scarp between the Oidong Valley and Xanadu, 3 km north of the
     cataract by which the valley's river leaves (moved 2026-11-11: "right on the xanadu-oidong border - the same cliff the
     cataract is on - so that it offers a real advantage to anyone using its elevator"). Its point is the top, on the lip at
     about 1,400 m; its foot is on the Xanadu floor about 3,100 m below. No page yet, its countryside not planned: the
     Sultanate's road down the valley ends at its top */
  sfgtxw10kr:{culture:'xanadu'},
  sq80bzd7ep:{culture:'xanadu',road:{r:400,hw:2,join:true},hamlets:[
   {id:'east',name:'Shar, the east village',focus:'farming',near:[638,417],look:1200,pop:220},
   {id:'west',name:'Nub, the west village',focus:'farming',near:[-801,-369],look:1200,pop:220},
   {id:'herders',name:"Dzo-ling, the herders' village",focus:'ranch',near:[110,801],look:1200,pop:145},
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
   {id:'beck-fields',name:'The Beck Fields',culture:'xanadu',focus:'farming',bearing:265,km:10,look:5000,pop:180},
   {id:'vein-camp',name:'The Vein Camp',culture:'xanadu-camp',focus:'mine',bearing:40,km:5,look:4000,pop:50}]},
  smirrorgrange01:{culture:'order',road:{r:150,hw:1.6,join:true},hamlets:[
   {id:'house',name:'The Mirror Grange',focus:'monastery',near:[0,0],look:3000,pop:260,link:[-3000,0],road:false},
   {id:'growers',name:"The grange's growers",culture:'xanadu',focus:'farming',bearing:200,km:3,look:3000,pop:200},
   {id:'herders',name:"The graben's herders",culture:'xanadu',focus:'ranch',bearing:120,km:6,look:4000,pop:150}]},
  scaldronhouse01:{culture:'order',road:{r:150,hw:1.6,join:true},hamlets:[
   {id:'house',name:'The Caldron House',focus:'monastery',near:[0,0],look:3000,pop:260,link:[-3000,0],road:false},
   {id:'shelf',name:'The Caldron shelf village',culture:'xanadu',focus:'farming',bearing:120,km:2.5,look:3000,pop:180}]}},
 /* the Order's road up the Oidong Valley and the beck's staircase (`guide`, 5.1 px: the straight line crosses the range
    south of the valley, which took it over 6,000 m), past Oidong's lake on its north shore */
 /* the Order's road up the Oidong Valley and the beck's staircase to the Caldron House (`guide`, 5.1 px: the straight line
    crosses the range south of the valley, which took it over 6,000 m), past Oidong's lake on its north shore */
 links:[['sq80bzd7ep','scaldronhouse01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS,guide:[[1228.88,1621.23],[1240,1628],[1255,1632],[1265,1636],
   [1275,1640],[1282,1642],[1288,1644],[1294,1647],[1306,1651],[1312,1653],[1318,1657],[1325,1662],[1332,1666],[1340,1667],[1347,1665],[1360,1664],[1366,1668]]}],
  /* the Sultanate's road down the valley from Longsong to Strongbow's top on the lip above Xanadu: the only way along the
     valley (the owner, 2026-11-11: "there is no rift line in oidong valley, just a road"), on the valley floor (`guide`:
     a least-climb line on the region's heights, under 2,700 m) */
  ['sq80bzd7ep','sfgtxw10kr',{hw:3,r:800,keep:true,stops:XANADU_STOPS,culture:'xanadu',guide:[[1228.88,1621.23],[1219,1626],[1213,1624],[1207,1623],
   [1201,1620],[1195,1618],[1189,1618],[1183,1615],[1177,1613],[1171,1613],[1165,1607],[1159,1605],[1153,1602],[1147,1603],[1135,1603],
   [1123,1603],[1111,1602],[1099,1602],[1093,1599],[1087,1598],[1081,1597],[1075,1595],[1063,1595],[1051,1595],[1045,1594],[1039,1592],
   [1033,1592],[1027,1590],[1021,1590],[1016,1593],[1010,1596],[1004,1596],[1001,1596]]}],
  ['scaldronhouse01','smirrorgrange01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS}],
  ['smirrorgrange01','ssinggjar01',{hw:2.5,r:800,keep:true,stops:ORDER_STOPS}]]};

/* ---------------------------------------------------------------- Strongbow's face, cut into the scarp
   The owner, 2026-11-16: "Yes, carve it", and "make sure this doesn't result in water flowing uphill". Strongbow's page
   (kits/ancients' strongbow-today, settlements/strongbow) has a 900 m face (STRONGBOW.DIM.LIP); here the scale model's
   2 km cells spread the scarp's 3,100 m over 19 km, so seated on its lip at the pin the page's foot, town and floor stood
   about 800 m inside the ground. The cut gives the page its face. It is a land hook (WORLD.landHook, chained after the
   coast), here in the sites' spec so the bake (core/world/bake_sites.py), the page and the Godot export read one ground.
   In the page's frame turned to the site (OHR_CUT.ry: the page's +z, its front, to the region's west), its lip 150 m in
   front of the pin (the pin stays on the plateau), u along the face and v ahead of it from the lip:
     behind the lip (1.6 km, Strongbow's top: the page  the pad at the lip's level at its back and sides, 0.5 m under it
     draws no plateau of its own there)                at the lip's middle: it drains over the edge, never back
     at the lip, 40 to 20 m behind the page's face    the step down, behind the page's own cliff
     ahead (the page's floor and town, 1.1 km)         1 m under the page's floor (the lip less 900 m), falling 0.4 % west,
                                                      and on as a gorge, narrowing to 450 m, whose bed falls the same until
                                                      the scarp's own slope reaches it (about 7 km out)
   It only lowers the ground (min with the land), its sides ease back over 300 to 600 m and its back over 1 km (about 2 %:
   the Sultanate's road comes onto the pad from the east within its 8 % grade), and it keeps off the rivers: its
   weight is 0 within 500 m of a channel and whole only past 900 m (WORLD.carveAt), so no river's bed or water moves.
   The flora keeps off the page's footprint (WORLD.clearHook). OHR_CUT.info() gives the lip's level, where the page's
   anchor stands (openworld/oidong-highrift/tools/godot_case.py). */
var OHR_CUT=(function(){'use strict';
const W=WORLD,C={site:'sfgtxw10kr',px:[1001,1596],ry:-Math.PI/2,ahead:150,lip:900,half:1150,sideB:600,gorgeHalf:450,gorgeB:300,town:1100,taper:2500,
 back:1596,backB:1000,pageHalf:1100,rec0:-40,rec1:-20,padDrop:.5,floorSlope:.004,maxV:14000,river:[500,900]};
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t;
let P=null,LIPH=null,busy=false;
/* the page's anchor (its lip at the bay's centre) stands C.ahead m in front of the pin, so the pin (the site's own point,
   where its road ends and its records stand) is on the plateau, back from the edge: the road router aims at the pin's
   200 m cell, which must not fall over the lip */
function frame(){if(P)return P;const p=W.fromPx(C.px[0],C.px[1]),c=Math.cos(C.ry),s=Math.sin(C.ry);
 P={x:p[0]+C.ahead*s,z:p[1]+C.ahead*c,pin:p,c,s};
 busy=true;try{LIPH=W.Hbare(P.x,P.z);}finally{busy=false;}return P;}
/* region (x, z) to the page's frame about the pin: u along the face, v ahead of the lip */
function local(x,z){const F=frame(),dx=x-F.x,dz=z-F.z;return [dx*F.c-dz*F.s,dx*F.s+dz*F.c];}
const floorAt=v=>LIPH-C.lip-1-C.floorSlope*(v-C.rec1);
/* the pad under the page's plateau: a shallow bowl, flush with the plateau (the lip's level) at its back and side edges, so
   a walker steps from the region's ground onto the page's plateau without a step, falling to padDrop under it at the
   lip's middle, so it drains forward over the edge (never back into the plateau) */
/* the page draws no plateau of its own behind the lip (its plateau is its far ground, which the export leaves out:
   godot/tests/export/oidong_walk_test.gd found the region's ground under every ray), so the region's ground is
   Strongbow's top: the pad stands at the lip's level, where the page's yard and post stand, falling padDrop to the lip
   to drain (0.5 m over 1.6 km) */
const padAt=(u,v)=>C.rec0-v>=C.back||Math.abs(u)>=C.pageHalf?LIPH:
 LIPH-C.padDrop*(1-(C.rec0-v)/C.back)*(1-smooth(C.pageHalf-300,C.pageHalf,Math.abs(u)));
function target(u,v){
 if(v<=C.rec0)return padAt(u,v);
 if(v<C.rec1)return lerp(padAt(u,C.rec0),floorAt(C.rec1),smooth(0,1,(v-C.rec0)/(C.rec1-C.rec0)));
 return floorAt(v);}
function weight(x,z){const L=local(x,z),u=Math.abs(L[0]),v=L[1];
 if(v<C.rec0-C.back-C.backB||v>C.maxV)return 0;
 const k=v<=C.town?0:Math.min(1,(v-C.town)/(C.taper-C.town)),hw=lerp(C.half,C.gorgeHalf,k),B=lerp(C.sideB,C.gorgeB,k);
 if(u>=hw+B)return 0;
 let w=(1-smooth(hw,hw+B,u))*(v<C.rec0?1-smooth(C.back,C.back+C.backB,C.rec0-v):1)*(1-smooth(C.maxV-1000,C.maxV,v));
 if(w<=0)return 0;
 const ch=W.carveAt(x,z);if(ch)w*=smooth(C.river[0],C.river[1],ch.d);
 return w;}
function cut(x,z,h){if(busy)return h;frame();const w=weight(x,z);if(w<=0)return h;const L=local(x,z),T=target(L[0],L[1]);return h>T?h-w*(h-T):h;}
const prevLand=W.landHook;
W.landHook=(x,z,h,mw)=>cut(x,z,prevLand?prevLand(x,z,h,mw):h);
const prevClear=W.clearHook;
W.clearHook=(x,z)=>{if(prevClear&&prevClear(x,z))return true;frame();const L=local(x,z);
 return Math.abs(L[0])<=C.half&&L[1]>=C.rec0-C.back&&L[1]<=C.town;};
return {spec:C,local,weight,target,
 /* f() on the land without the cut (the test's comparison: tests/test_cut.py) */
 uncut:f=>{frame();const was=busy;busy=true;try{return f();}finally{busy=was;}},
 info:()=>{const F=frame();return {site:C.site,at:[F.x,LIPH,F.z],pin:F.pin,ry:C.ry,lip:C.lip,floor:LIPH-C.lip};}};})();
