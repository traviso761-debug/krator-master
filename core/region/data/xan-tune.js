// ================================================================= CORE/REGION DATA — the Xanadu Sultanate's tune (X0)
// [G data] core/simulation/PROPOSAL-XANADU.md, step X0 (the owner, 2026-11-15 and 16: about 350,000 people, the lake on
// Lake Atitlán's pattern, eight provinces, Dalab a fourth gateway, the sky poppy the opium, Strongbow the Sultan's). The
// Sultanate as data for core/region's valley host (core/region/50-region-valley.js, H.simValley), as Longsong's table
// (settlements/longsong/src/15-ls-tune.js) is the Order's; both join one valley at X2. Read in place (never vendored) by
// the open-world regions, Longsong's page and the tests (core/region/tests/test-xan-economy.js).
//   XAN_TUNE.px(px, py)      the xanadu-oidong-highrift region's frame: metres from px 1191,1569 (2 km a pixel)
//   XAN_TUNE.goods           every good and its unit (kg unless named)
//   XAN_TUNE.diet            a person's day by the kind of settlement (city, town, lake, rural, court, dome, camp)
//   XAN_TUNE.calendar        the Vale's year: the rice and grain harvest, the tea flush, the poppy's lancing, cacao, silk, saffron
//   XAN_TUNE.provinces       the eight provinces (section 2): seat, rural people, yield, what the land makes besides grain
//   XAN_TUNE.lake            the 21 lake towns and 4 islands (section 2a): bearing, px, people, trade, hub
//   XAN_TUNE.gateways        the four gateways (Iziz, Yuni, the Dasri, Dalab: the owner's rule of 2026-11-12 and 16)
//   XAN_TUNE.dues            the provinces' fixed yearly dues to the Sultan's Treasury, Qiblai's grant of fealty and the
//                            Sultan's grants of esteem (section 5; Qiblai's bill is proposed: the owner has not set it)
//   XAN_TUNE.valley(P, o)    the valley spec; P the region's plan (openworld/xanadu-oidong-highrift/plan/sites.json: the
//                            rings of Erehwon and Qiblai), o {scale (people an actor stands for: 50), edit hooks}
// X0 takes the valley host as it is: two-stop roads, one scale, no depleting sites (X1 adds them). A province's countryside
// is one settlement (its bulk villages, never drawn) that eats its harvest and tithes a share to its seat; the drawn
// villages, the lake towns and the work camps are their own. Rates are set so a year makes what the arithmetic below says.
var XAN_TUNE=(function(){'use strict';
const T={},D=1/365;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
T.goods={grain:{unit:'kg',crops:['vale-rice','emmer','basin-amaranth']},fish:{unit:'kg'},fruit:{unit:'kg'},dairy:{unit:'kg'},honey:{unit:'kg'},
 salt:{unit:'kg'},tea:{unit:'kg'},cacao:{unit:'kg'},saffron:{unit:'kg'},opium:{unit:'kg',crop:'sky-poppy'},silk:{unit:'kg'},brocade:{unit:'kg'},
 timber:{unit:'kg'},charcoal:{unit:'kg'},copper:{unit:'kg'},goldore:{unit:'kg'},gold:{unit:'kg'},goldwork:{unit:'piece'},wheels:{unit:'wheel'},
 coin:{unit:'dinar'},opal:{unit:'kg'},scrap:{unit:'kg'},iron:{unit:'kg'},tools:{unit:'kg'},arms:{unit:'piece'},pearls:{unit:'kg'},wine:{unit:'kg'},oil:{unit:'kg'},
 sulfur:{unit:'kg'},pottery:{unit:'kg'},mats:{unit:'kg'}};
/* the lake's and the capital's households also buy the market's wares (X1: what the market boats carry between the towns): the pots of Pāṭari, the mats of Lōṭas, the honey of Hāibh */
T.diet={city:{grain:150*D,fish:15*D,fruit:12*D,salt:6*D,tea:1.5*D,cacao:.4*D,tools:.4*D,pottery:2*D,mats:1*D,honey:.3*D},
 town:{grain:160*D,fish:8*D,salt:6*D,tea:1*D,tools:.4*D},
 lake:{grain:125*D,fish:45*D,fruit:8*D,salt:6*D,tea:1*D,tools:.3*D,pottery:2*D,mats:1*D,honey:.3*D},
 rural:{grain:165*D,salt:5*D,tea:.3*D,tools:.3*D},
 court:{grain:140*D,fish:25*D,fruit:25*D,salt:7*D,tea:3*D,cacao:2*D,saffron:.05*D,silk:.4*D,tools:.3*D,arms:.002*D},
 dome:{grain:120*D,fish:30*D,fruit:40*D,salt:7*D,tea:4*D,cacao:6*D,saffron:.3*D,silk:3*D,pearls:.2*D,wine:8*D,oil:6*D,honey:4*D},
 camp:{grain:190*D,salt:7*D,tea:1*D,tools:1.2*D},
 fort:{grain:180*D,salt:7*D,tea:1*D,tools:.8*D,arms:.05*D}};
/* the year (core/clock's 365 days; windows [from, to] in year days, 77-sim-6-season.js). The Vale is Cfa at about +25 °C:
   one long grain and rice harvest, tea flushed through spring, the poppy lanced at the end of the dry season, cacao
   picked through the wet, silk's spring rearing, saffron's autumn bloom */
T.calendar={windows:{harvest:[150,200],'tea-flush':[40,130],lancing:[20,50],cacao:[150,250],silk:[60,120],saffron:[280,310],'summer-pasture':[120,240]}};
T.farm={inCropHa:1.5,seed:1/6,farmShare:.78,hh:5.5};   /* a household's land and seed; the share of the countryside's households that farm */
T.netKgHH=y=>T.farm.inCropHa*y*1000*(1-T.farm.seed);
/* THE PROVINCES (section 2). rural: the province's countryside people (the bulk district holds what the named places do
   not); y: grain t/ha; extra: what the land makes besides grain, kg a year, sent to the seat as a share */
T.provinces=[
 {id:'p1',name:'Lēk-Shor (the Lake Shore)',seat:'s57bkv9741',rural:70000,y:1.6,px:[806,1525],extra:{fruit:900000,silk:9000}},
 {id:'p2',name:'Bhēl (the Vale)',seat:'s4zvgepuru',rural:75000,y:2.2,px:[870,1530],extra:{cacao:180000,saffron:2200,tea:60000,opium:150000,silk:30000,fruit:600000}},
 {id:'p3',name:'Qāṭarāq (the Cataracts)',seat:'skm4jjo2vl',rural:80000,y:1.9,px:[930,1585],extra:{cacao:260000,timber:4000000,charcoal:600000,honey:30000,dairy:400000,fruit:800000}},
 {id:'p4',name:'Gōlḍ-Mārch (the Gold March)',seat:'sxan7r1sln',rural:10000,y:1.1,px:[912,1652],extra:{copper:240000}},
 {id:'p5',name:'Siqārp (the Scarp)',seat:'sl758m2396',rural:25000,y:1.3,px:[992,1606],extra:{tea:200000,cacao:90000,opium:120000,saffron:600}},
 {id:'p6',name:'Ōpal-Bhālī (Opal Valley)',seat:'sjuarjbku0',rural:4000,y:.9,px:[1036,1668],extra:{}},
 {id:'p7',name:'Nōrth-Shor (the North Shore)',seat:'xan.pher',rural:25000,y:1.5,px:[812,1478],extra:{silk:14000,cacao:60000,honey:12000,fruit:300000}},
 {id:'p8',name:'Mārchiz (the Marches)',seat:'s57bkv9741',rural:5000,y:1.2,px:[790,1540],extra:{}}];
/* THE LAKE (section 2a): bearing from the lake's centre (810,1499.5), the shore cell, people, trade (a work: kg a year),
   the province it belongs to and its hub (Erehwon in the south, Phēr in the north) */
T.lake=[
 ['alph-head','Ālph-Hēḍ',0,839,1499,4000,{grain:900000},'p1'],['hot-bath','Hoṭ-Bāṭh',15,838,1507,1800,{sulfur:40000},'p1'],
 ['tea-terraces','Ṭī-Ṭeras',30,834,1514,2000,{tea:45000},'p1'],['pottery','Pāṭari',45,827,1517,1500,{pottery:120000},'p1'],
 ['saffron','Saphran',60,820,1517,1800,{saffron:900},'p1'],['weaver','Wībhar',75,815,1517,2500,{brocade:0},'p1'],
 ['boatyard','Boṭ-Yārḍ',90,810,1517,2000,{},'p1'],['garden','Gārḍan',120,801,1514,1800,{fruit:300000},'p1'],
 ['quarry','Qorī',135,797,1513,1500,{},'p1'],['orchard','Ōrcharḍ',150,793,1510,1600,{fruit:420000},'p1'],
 ['lotus','Lōṭas',165,788,1505,1500,{mats:60000,fruit:120000},'p1'],['fish-market','Phish-Mārkiṭ',180,782,1499,4000,{},'p1'],
 ['stack','Siṭāq',195,780,1491,900,{},'p1'],['hive','Hāibh',210,785,1485,1200,{honey:24000},'p7'],
 ['mulberry','Malbari',225,793,1483,2200,{silk:16000},'p7'],['net','Nēṭ',240,800,1482,1400,{},'p7'],
 ['cocoa','Qōqō',255,805,1482,1800,{cacao:50000},'p7'],['pher','Phēr',270,810,1483,6000,{},'p7'],
 ['mouth','Māuṭh',300,818,1485,1500,{},'p7'],['thalaba','Thalaba',330,825,1488,3000,{sulfur:60000},'p7'],
 ['dyer','Ḍāiyar',345,834,1493,1400,{},'p7']]
 .map(([key,name,brg,px,py,people,make,prov])=>({key,name,brg,px,py,people,make,prov,hub:prov==='p7'?'xan.pher':'s57bkv9741'}));
T.islands=[['great-isle','Grēṭ-Āil (the monastery isle)',816.5,1501.5,600],['bay-isle','Bē-Āil (the Sultan\'s fishponds)',808.5,1509,300],
 ['west-isle','Wesṭ-Āil (the fishermen\'s isle)',797,1494,400],['east-isle','Lāiṭ-Hāus (the light and the customs)',828,1497,200]]
 .map(([key,name,px,py,people])=>({key,name,px,py,people}));
T.fishKgPerson=260;   /* a fishing town's catch a year, a head of its people: about a third of them fish (the dugouts) */
T.lakeTerraces=.6;    /* the share of a lake town's grain its own terraces grow */
/* X1: a town's fishing ground, a site: half a year's catch in the water, a day's catch back each night, so fishing at the
   town's rate holds it and a fleet twice the size empties it */
T.fishery=catchYr=>({kind:'fishery',amount:Math.round(catchYr/2),regen:Math.round(catchYr/365)});
/* X1: the lake's market boats: a round each from a hub along its shore, a call at every town (SIM.trade's round: at each
   town a boat buys what the next one wants), legs of about an hour and a half */
T.rounds=[['round.south-east','s57bkv9741',['boatyard','weaver','saffron','pottery','tea-terraces','hot-bath','alph-head']],
 ['round.west','s57bkv9741',['garden','quarry','orchard','lotus','fish-market','stack']],
 ['round.north-west','xan.pher',['cocoa','net','mulberry','hive']],
 ['round.north-east','xan.pher',['mouth','thalaba','dyer']]];
/* the first stores are last year's harvest: they last to the end of the first harvest the clock reaches and a month over.
   core/clock's day 0 is year day 259 (77-sim-6-season.js's year; the test checks it), so the harvest (year days 150-200)
   ends on clock day 306 */
T.yearDay0=259;
T.clockDay=yd=>(yd-T.yearDay0+365)%365;
T.startDays=T.clockDay(T.calendar.windows.harvest[1])+30;
/* THE GATEWAYS (the owner: the East Rift trades directly with Iziz, Yuni, the Dasri and Dalab only). Off the map, each a
   market with a pool; the road's days are its whole route to the capital's market (X1 makes Strongbow and Thalaba its
   stages). out: what Xanadu sends; in: what comes back */
/* X1: each gateway enters at its staging town: the Catch caravans (Iziz, the Dasri) at Strongbow's lift, Yuni's over the
   northern passes at Thalaba, Dalab's great caravan at the capital. The Catch's salt feeds the south (Qiblai's side), the
   north's comes by Thalaba and Dalab (`side`) */
T.gateways=[
 {id:'gate.iziz',name:'Iziz (by the Catch, the Twins and Strongbow)',entry:'sfgtxw10kr',side:'south',days:64,carriers:8,cap:40000,out:['goldwork','cacao','opium','tea','silk','wheels'],in:['salt','iron','arms','pearls','oil']},
 {id:'gate.dasri',name:'The Dasri (by the Catch oases and Stair)',entry:'sfgtxw10kr',side:'south',days:22,carriers:6,cap:30000,out:['cacao','tea','silk','opium'],in:['salt']},
 {id:'gate.yuni',name:'Yuni (by the northern passes from Thalaba)',entry:'lk.thalaba',side:'north',days:48,carriers:10,cap:20000,out:['goldwork','saffron','brocade','opal','silk'],in:['salt','iron','arms','wine','oil']},
 {id:'gate.dalab',name:'Dalab (the Annual Great Caravan, Nulab over the North Rift Bench)',entry:'s57bkv9741',side:'north',days:182,carriers:1,cap:420000,out:['cacao','saffron','opium','tea','brocade','silk'],in:['salt','iron','wine','pearls']}];
T.gatePool={salt:1e7,iron:1e6,arms:1e5,pearls:1e4,wine:1e6,oil:1e6};
T.gateWant={goldwork:2,cacao:1200,opium:650,saffron:8,tea:400,silk:80,brocade:40,opal:.4,wheels:3};   /* the gateways' take a day, all four together: what the country makes less its own use (Gemini's exports scaled to it) */
/* THE DUES: a fixed yearly bill each province's seat sends the Treasury after the harvest (the Chancellor's assessment,
   bound by tradition, never answering a bad year); Qiblai's grant of fealty and the Sultan's grants of esteem */
T.dues={day:T.clockDay(215),bills:{skm4jjo2vl:{grain:120000,cacao:4000,honey:800},s4zvgepuru:{grain:90000,saffron:60,tea:1500,silk:600},
 sl758m2396:{grain:15000,tea:2500,opium:2000},sxan7r1sln:{copper:6000},'xan.pher':{grain:30000,silk:300,honey:400}},
 fealty:{from:'skm4jjo2vl',goods:{wheels:40,goldwork:12,honey:600},day:T.clockDay(210)},esteem:{to:'skm4jjo2vl',goods:{grain:20000,silk:200,coin:500},day:T.clockDay(230)}};
/* THE CHAINS (section 4): batch recipes. hours are a crew's hours for one batch */
/* a crew's hours set its most a year (crew x 12 h x 365 / hours); the input binds below that: the gold (the goldsmiths,
   the mint, the wheels), the scrap (the smelter), the iron (the smiths). The weavers' hours bind them, so raw silk is left
   for the gateways */
T.chain={assay:{in:{goldore:30},out:{gold:1},hours:20},goldsmith:{in:{gold:.1},out:{goldwork:1},hours:600},mint:{in:{gold:1},out:{coin:250},hours:12},
 wheel:{in:{copper:4,gold:.02},out:{wheels:1},hours:580},weave:{in:{silk:1.2},out:{brocade:1},hours:110},
 smelt:{in:{scrap:1,charcoal:1},out:{iron:1},hours:2},smith:{in:{iron:1},out:{tools:1},hours:3}};
T.mine={goldore:6400,copper:0,scrap:120000,opal:180};   /* a year's make: the gold mines' ore (about 210 kg of gold), the salvagers' scrap, Opal Valley's opal */
T.fifth=.2;
T.lodeYears=40;    /* X1: a lode's ore in the ground, in years of its make (the gold field, the opal diggings, the March's copper band) */
T.scaleBulk=200;   /* X1: people an actor stands for in a province's countryside (the drawn places keep the valley's 50) */
T.valley=function(P,o){o=o||{};const K=o.scale==null?50:o.scale,yr=365,win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(kgYr,crew,days,k)=>{k=k==null?K:k;return kgYr/(Math.max(1,Math.round(crew/k))*k*(days==null?yr:days)*12);};
 const eats=k=>Object.assign({},T.diet[k]),at=(px,py)=>T.px(px,py),site=id=>P.sites.find(s=>s.id===id);
 const S=[],R=[],X=[],seats={},need={};   /* need: grain a seat must pass on to the places it feeds, kg a year */
 const add=(s)=>{S.push(s);return s;},eatYr=(k,n)=>n*T.diet[k].grain*yr;
 const crewOf=(n,cap)=>Math.min(cap,Math.round(n*.45));
 const bump=(seat,kg)=>{need[seat]=(need[seat]||0)+kg;};
 /* ---- THE TOWNS: their markets first (a road lands in a settlement's first work) */
 const town=(id,name,px,py,people,diet,works,o2)=>{const p=at(px,py);const s=add(Object.assign({id,name,faction:'xanadu',people,x:p.x,z:p.z,eats:eats(diet),keepDays:20,
  start:{grain:Math.round(eatYr(diet,people)*T.startDays/yr),salt:Math.round(people*6*.4),tea:people,tools:people*.3,fish:Math.round(people*(T.diet[diet].fish||0)*yr*.1)},
  works:[{id:id+'.market',kind:'market',name:'the market and its warehouses',crew:20,out:[],rate:0}].concat(works||[])},o2||{}));seats[id]=s;
  bump(o2&&o2.feeder||id,eatYr(diet,people));return s;};   /* a town fed by another (the court and the Dome by the capital, Strongbow by Kirstabal) counts on its feeder's grain */
 const E=town('s57bkv9741','Erehwon',806,1516,25000,'city',[
  {id:'er.goldsmiths',kind:'goldsmiths',name:'the Goldsmiths\' quarter',crew:300,batch:T.chain.goldsmith},
  {id:'er.weavers',kind:'weavers',name:'the weavers and dyers of the industry quarters',crew:200,batch:T.chain.weave},
  {id:'er.smithy',kind:'smithy',name:'the smiths (tools from the iron)',crew:120,batch:T.chain.smith},
  {id:'er.dockyard',kind:'dockyard',name:'the dockyard and the waterfront',crew:150,out:[],rate:0},
  {id:'er.caves',kind:'ice-caves',name:'the Caves of Ice',crew:20,out:[],rate:0}]);
 E.start.gold=40;E.start.iron=3000;
 town('xan.citadel','The Citadel (the Sultan\'s Treasury, the court and the gate company)',805,1517,1200,'court',[
  {id:'cit.mint',kind:'mint',name:'the Mint and assay (the Master of Mines and Mints)',crew:20,batch:T.chain.mint}],{parent:'s57bkv9741',feeder:'s57bkv9741'});
 town('xan.dome','The Pleasure Dome (the harem and the Dome of the Bay)',805,1515,260,'dome',[],{parent:'s57bkv9741',feeder:'s57bkv9741'});
 town('skm4jjo2vl','Qiblai',922,1595,15000,'city',[
  {id:'qb.wheels',kind:'wheel-works',name:'the kora\'s prayer-wheel works',crew:200,batch:T.chain.wheel},
  {id:'qb.goldsmiths',kind:'goldsmiths',name:'the Goldsmiths\' hall of Qiblai',crew:120,batch:T.chain.goldsmith},
  {id:'qb.smithy',kind:'smithy',name:'the smiths',crew:80,batch:T.chain.smith}]);
 town('s4zvgepuru','Theodiga',908,1535,6000,'town',[
  {id:'th.salvage',kind:'salvage-floor',name:'the Salvagers\' guild: the breakers\' floor (only what the Dome has let fall)',crew:400,out:['scrap'],rate:rate(T.mine.scrap,400),site:{kind:'dome-fall',amount:Math.round(T.mine.scrap/12),regen:Math.round(T.mine.scrap/365)}},   /* X1: only what the Dome lets fall: a month's fall on the floor at most, a day's more each night */
  {id:'th.smelter',kind:'smelter',name:'the Salvagers\' smelter (scrap and charcoal to iron)',crew:60,batch:T.chain.smelt}]);
 town('sfgtxw10kr','Strongbow (the Royal Opal Gate)',1001,1596,4000,'town',[
  {id:'sb.terraces',kind:'tea-terraces',name:'the lift town\'s tea and silk terraces',crew:300,out:['tea','silk'],rate:rate(30000,300)}],{parent:'sl758m2396',feeder:'sl758m2396'});
 town('sl758m2396','Kirstabal',989,1600,3000,'town');
 town('sxan7r1sln','Strongwall (the Master of Mines\' fort)',912,1640,250,'fort',[
  {id:'sw.assay',kind:'assay-house',name:'the assay house',crew:20,batch:T.chain.assay}]);
 town('xan.pher','Phēr (the north shore\'s fair)',810,1483,6000,'lake',[{id:'ph.fishing',kind:'fishing',name:'the dugouts',crew:600,out:['fish'],rate:rate(6000*T.fishKgPerson*.6,600),site:T.fishery(6000*T.fishKgPerson*.6)}]);
 /* the work camps on the March */
 const mine=(id,name,px,py,people,parent,out,kgYr)=>{const p=at(px,py);seats[id]=add({id,name,faction:'xanadu',parent,people,x:p.x,z:p.z,eats:eats('camp'),keepDays:10,
  start:{grain:Math.round(eatYr('camp',people)*T.startDays/yr),salt:people*2,tea:people*.3,tools:people*.4},works:[{id:id+'.works',kind:'adit',name,crew:Math.round(people*.8),out:[out],rate:rate(kgYr,Math.round(people*.8)),site:{kind:out==='goldore'?'lode':'opal-diggings',grade:'rich',amount:kgYr*T.lodeYears}}]});if(id!=='sjuarjbku0')bump(parent,eatYr('camp',people));};   /* Opal Valley is its province's seat: its own countryside feeds it */
 mine('smgxtultfq','The gold mines on the lode',911,1665,950,'sxan7r1sln','goldore',T.mine.goldore);
 mine('sjuarjbku0','Opal Valley Mines (the Sultan\'s factor)',1038,1662,850,'sxan7r1sln','opal',T.mine.opal);
 /* the forts of the Marches */
 [['march.w','The west watch fort',783,1530],['march.s','The south watch fort',812,1548],['march.e','The beacon fort over the Rift',846,1540]].forEach(([id,name,px,py])=>{const p=at(px,py);
  add({id,name,faction:'xanadu',parent:'s57bkv9741',people:150,x:p.x,z:p.z,eats:eats('fort'),keepDays:30,start:{grain:Math.round(eatYr('fort',150)*.4),salt:300,tea:60,tools:40,arms:20},
   works:[{id:id+'.store',kind:'fort',name:'the fort\'s store',crew:10,out:[],rate:0}]});bump('s57bkv9741',eatYr('fort',150));
  R.push({id:'road.'+id,from:'s57bkv9741',to:id,minutes:Math.round(Math.hypot(p.x-E.x,p.z-E.z)/1000/25*1440),cap:20000,want:40,goods:{s57bkv9741:['grain','salt','tea','tools','arms']}});});
 /* ---- THE LAKE TOWNS AND ISLANDS: fish and their trade to the hub by share; grain, salt and tools back by want */
 const lakeTown=(L)=>{const p=at(L.px,L.py),fishing=L.key!=='weaver'&&L.key!=='pottery'&&L.key!=='quarry'&&L.key!=='boatyard',works=[],sh={};
  const crew=crewOf(L.people,400);
  if(fishing)works.push({id:'lk.'+L.key+'.fishing',kind:'fishing',name:'the dugouts',crew:Math.round(crew*.5),out:['fish'],rate:rate(L.people*T.fishKgPerson*.6,Math.round(crew*.5)),site:T.fishery(L.people*T.fishKgPerson*.6)});
  else works.push({id:'lk.'+L.key+'.store',kind:'warehouse',name:'the landing',crew:10,out:[],rate:0});
  Object.keys(L.make).forEach(g=>{if(g==='brocade')return;const c=Math.round(crew*.5);works.push({id:'lk.'+L.key+'.'+g,kind:g+'-works',name:L.name+'\'s '+g,crew:c,out:[g],rate:rate(L.make[g],c,g==='tea'?win('tea-flush'):g==='saffron'?win('saffron'):g==='silk'?win('silk'):g==='cacao'?win('cacao'):null),
   season:g==='tea'?'tea-flush':g==='saffron'?'saffron':g==='silk'?'silk':g==='cacao'?'cacao':undefined});sh[g]=g==='grain'?.5:.85;});
  if(L.key==='weaver')works.unshift({id:'lk.weaver.looms',kind:'weavers',name:'Wībhar\'s looms',crew:300,batch:T.chain.weave});
  if(fishing)sh.fish=.55;
  if(L.key==='alph-head')sh.grain=.6;
  const id='lk.'+L.key;add({id,name:L.name,faction:'xanadu',parent:L.hub,people:L.people,x:p.x,z:p.z,eats:eats('lake'),keepDays:15,
   start:{grain:Math.round(eatYr('lake',L.people)*T.startDays/yr),salt:L.people*2.5,tea:L.people*.3,tools:L.people*.2,fish:L.people*5},works});
  /* the terraces above every lake town: about three fifths of its own grain (Atitlán's milpa on the slopes); the hub sends the rest */
  const terr=eatYr('lake',L.people)*T.lakeTerraces,tc=Math.round(crew*.4);
  works.push({id:'lk.'+L.key+'.terraces',kind:'terraces',name:'the terraces above the shore',crew:tc,out:['grain'],rate:rate(terr,tc,win('harvest')),season:'harvest'});
  const own=terr+(L.make.grain?L.make.grain*(1-.6):0);bump(L.hub,Math.max(0,eatYr('lake',L.people)-own));
  const km=Math.max(3,Math.hypot(p.x-seats[L.hub].x,p.z-seats[L.hub].z)/1000);
  R.push({id:'lake.'+L.key,from:id,to:L.hub,minutes:Math.round(km/12*60)+60,cap:8000,carriers:Math.max(1,Math.round(L.people/800)),share:{[id]:sh},want:10,
   goods:{[L.hub]:['grain','salt','tea','tools','fruit'].concat(L.key==='weaver'?['silk']:[])},expect:L.key==='weaver'?{[id]:{silk:6}}:undefined});
  X.push({id,hub:L.hub,km,fishing});};
 T.lake.filter(L=>L.key!=='pher').forEach(lakeTown);
 T.islands.forEach(I=>lakeTown({key:I.key,name:I.name,px:I.px,py:I.py,people:I.people,make:{},prov:'p1',hub:'s57bkv9741'}));
 /* the hubs: the cross-lake run, Erehwon to Phēr (34 km) */
 R.push({id:'lake.cross',from:'s57bkv9741',to:'xan.pher',minutes:Math.round(34/12*60)+60,cap:20000,carriers:6,want:12,goods:{s57bkv9741:['grain','salt','tea','tools','pottery','mats'],'xan.pher':['fish','silk','cacao','honey','sulfur','fruit']}});
 /* ---- THE RINGS (the open world's plan): Erehwon's and Qiblai's farming villages and ranches, a tithe road each */
 ['s57bkv9741','skm4jjo2vl'].forEach(sid=>{const St=site(sid);if(!St)return;St.hamlets.forEach(V=>{const id=V.id.replace(/\//g,'.'),y=sid==='s57bkv9741'?1.6:1.9;
  const hh=V.census.households,crew=Math.round(V.census.pop*.45);
  if(V.focus==='farming'){const made=hh*T.netKgHH(y),own=eatYr('rural',V.census.pop),share=Math.max(0,Math.min(.9,(made-own)*.8/made));
   add({id,name:V.name+' ('+seats[sid].name+'\'s ring)',faction:'xanadu',parent:sid,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('rural'),
    start:{grain:Math.round(own*T.startDays/yr),salt:200,tea:30,tools:30},works:[{id:id+'.fields',kind:'farmstead',name:'the fields',crew,out:['grain'],rate:rate(made,crew,win('harvest')),season:'harvest'}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:40000,share:{[id]:{grain:share}},goods:{[sid]:['salt','tea','tools']}});bump(sid,-(made-own)*.8);}
  else{add({id,name:V.name+' ('+seats[sid].name+'\'s ring)',faction:'xanadu',parent:sid,people:V.census.pop,x:V.site.x,z:V.site.z,eats:eats('rural'),
    start:{grain:Math.round(eatYr('rural',V.census.pop)*.5),dairy:500,salt:200,tea:30,tools:30},
    works:[{id:id+'.byre',kind:'byre',name:'the byres',crew,herd:{out:['dairy'],rate:.4/24,animals:300},pasture:{id:id+'.pasture',window:'summer-pasture'}}]});
   R.push({id:'tithe.'+id,from:id,to:sid,minutes:240,cap:20000,share:{[id]:{dairy:.6}},goods:{[sid]:['grain','salt','tea','tools']}});}});});
 /* ---- THE INTERNAL ROADS (net51's xanadu class and Gemini's barge links; minutes at 25 km a day by road, 60 by barge) */
 const road=(id,a,b,km,mode,goods,o3)=>R.push(Object.assign({id,from:a,to:b,minutes:Math.round(km/(mode==='barge'?60:25)*1440),cap:mode==='barge'?60000:30000,carriers:o3&&o3.carriers||3,stagger:Math.round(km/25*1440/3),want:o3&&o3.want||30,goods},o3&&o3.expect?{expect:o3.expect}:{}));
 road('road.er-qb','s57bkv9741','skm4jjo2vl',321,'road',{s57bkv9741:['salt','iron','tools','arms','wine','pearls','gold'],skm4jjo2vl:['grain','cacao','goldwork','wheels','honey','dairy','timber','charcoal','tea','opium','saffron','silk']},{carriers:6});
 road('road.er-th','s57bkv9741','s4zvgepuru',228,'barge',{s57bkv9741:['salt','tools','arms','charcoal'],s4zvgepuru:['grain','cacao','saffron','tea','opium','silk','iron','fruit']},{carriers:4,expect:{s4zvgepuru:{charcoal:330}}});
 road('road.qb-th','skm4jjo2vl','s4zvgepuru',155,'barge',{skm4jjo2vl:['charcoal','grain','salt'],s4zvgepuru:['iron','tools']},{carriers:3,expect:{s4zvgepuru:{charcoal:330},skm4jjo2vl:{iron:40}}});
 road('road.qb-sw','skm4jjo2vl','sxan7r1sln',83,'road',{skm4jjo2vl:['grain','salt','tea','tools','dairy'],sxan7r1sln:['gold','copper','opal']},{carriers:3,expect:{skm4jjo2vl:{gold:.12,copper:20}}});
 road('road.qb-ks','skm4jjo2vl','sl758m2396',108,'barge',{skm4jjo2vl:['grain','salt','tools'],sl758m2396:['tea','cacao','opium','saffron','silk']},{carriers:3});
 road('road.ks-sb','sl758m2396','sfgtxw10kr',25,'road',{sl758m2396:['grain','salt','tools'],sfgtxw10kr:['tea','silk']},{carriers:2});
 road('road.sw-gold','sxan7r1sln','smgxtultfq',50,'road',{sxan7r1sln:['grain','salt','tea','tools']},{carriers:2});
 road('road.sw-opal','sxan7r1sln','sjuarjbku0',260,'road',{sxan7r1sln:['grain','salt','tea','tools']},{carriers:2});
 R.push({id:'mine.gold',from:'smgxtultfq',to:'sxan7r1sln',minutes:Math.round(50/25*1440),cap:20000,carriers:2,share:{smgxtultfq:{goldore:1}},goods:{sxan7r1sln:['grain','salt','tea','tools']}});
 R.push({id:'mine.opal',from:'sjuarjbku0',to:'sxan7r1sln',minutes:Math.round(260/25*1440),cap:5000,carriers:2,share:{sjuarjbku0:{opal:1-T.fifth}},goods:{sxan7r1sln:['grain','salt','tea','tools']}});   /* the Fifth goes straight to the Treasury (below) */
 /* the Sultan's Fifth: a fifth of the gold the assay makes and of the opal, to the Treasury */
 R.push({id:'fifth',from:'sxan7r1sln',to:'xan.citadel',minutes:Math.round(404/25*1440),cap:5000,carriers:2,share:{sxan7r1sln:{gold:T.fifth}},goods:{'xan.citadel':[]}});
 R.push({id:'fifth.opal',from:'sjuarjbku0',to:'xan.citadel',minutes:Math.round(560/25*1440),cap:1000,carriers:1,share:{sjuarjbku0:{opal:T.fifth}},goods:{'xan.citadel':[]}});
 /* the rest of the gold and opal down to the capital's goldsmiths and market */
 road('road.sw-er','sxan7r1sln','s57bkv9741',404,'road',{sxan7r1sln:['gold','opal','copper'],s57bkv9741:['salt','tools','arms']},{carriers:3,expect:{s57bkv9741:{gold:.3,opal:.4,copper:10}}});
 /* the capital feeds its court and its Dome; the court sends the mint's coin back to the market */
 road('road.er-cit','s57bkv9741','xan.citadel',1,'road',{s57bkv9741:['grain','fish','fruit','salt','tea','cacao','saffron','silk','tools','arms','gold'],'xan.citadel':['coin']},{carriers:4,want:20,expect:{'xan.citadel':{gold:.1}}});
 road('road.er-dome','s57bkv9741','xan.dome',1,'road',{s57bkv9741:['grain','fish','fruit','salt','tea','cacao','saffron','silk','pearls','wine','oil','honey']},{carriers:2,want:20});
 /* ---- THE PROVINCES' COUNTRYSIDES: the bulk district of each, tithing grain and its land's goods to its seat */
 const named={};T.lake.forEach(L=>{named[L.prov]=(named[L.prov]||0)+L.people;});T.islands.forEach(I=>{named.p1=(named.p1||0)+I.people;});
 named.p1=(named.p1||0)+1345+150*3;named.p3=(named.p3||0)+1345;named.p4=(named.p4||0)+950;named.p6=(named.p6||0)+850;   /* Phēr is in P7's lake towns: its seat, counted once */
 T.provinces.forEach(Pv=>{const people=Math.max(1000,Pv.rural-(named[Pv.id]||0)),hh=people/T.farm.hh,made=hh*T.farm.farmShare*T.netKgHH(Pv.y),own=eatYr('rural',people);
  const id='prov.'+Pv.id,p=at(Pv.px[0],Pv.px[1]),crew=Math.min(2000,Math.round(people*.45));
  const works=[{id:id+'.fields',kind:'farmstead',name:'the province\'s fields (its villages, in bulk)',crew,out:['grain'],rate:rate(made,crew,win('harvest'),T.scaleBulk),season:'harvest'}],sh={};
  Object.keys(Pv.extra).forEach(g=>{const c=Math.min(600,Math.round(crew*.3)),w=g==='tea'?'tea-flush':g==='saffron'?'saffron':g==='silk'?'silk':g==='cacao'?'cacao':g==='opium'?'lancing':null;
   works.push(Object.assign({id:id+'.'+g,kind:g+'-works',name:'the province\'s '+g,crew:c,out:[g],rate:rate(Pv.extra[g],c,w?win(w):null,T.scaleBulk),season:w||undefined},g==='copper'?{site:{kind:'lode',grade:'rich',amount:Pv.extra[g]*T.lodeYears}}:{}));sh[g]=g==='timber'?.3:g==='dairy'?.5:.85;});
  add({id,name:Pv.name+': its countryside',faction:'xanadu',parent:Pv.seat,scale:T.scaleBulk,people,x:p.x,z:p.z,eats:eats('rural'),keepDays:30,start:{grain:Math.round(own*T.startDays/yr),salt:people*2,tea:people*.2,tools:people*.15},works});
  const surplus=made-own;Pv._made=made;Pv._own=own;Pv._people=people;Pv._id=id;Pv._sh=sh;Pv._surplus=surplus;});
 /* the grain tithe: each seat's need (its own table, the lake towns and camps it feeds, the dues it owes) covered with a
    margin, from its province's surplus, never more than four fifths of what the countryside made */
 const dueGrain=s=>((T.dues.bills[s]||{}).grain||0),cap={},bySeat={};
 T.provinces.forEach(Pv=>{(bySeat[Pv.seat]=bySeat[Pv.seat]||[]).push(Pv);cap[Pv.seat]=(cap[Pv.seat]||0)+Math.max(0,Pv._surplus)*.85;});
 /* a seat whose provinces cannot feed what it feeds passes the rest up its road (the March's camps to Qiblai, the capital's
    lake to the Vale and the Cataracts); the road between expects it, a floor on the hungry end's want */
 const NEED={};Object.keys(need).forEach(s=>{NEED[s]=need[s]*1.15+dueGrain(s);});
 const moved=[],passTo={sjuarjbku0:'sxan7r1sln',sxan7r1sln:'skm4jjo2vl',sl758m2396:'skm4jjo2vl','xan.pher':'s57bkv9741'};
 ['sjuarjbku0','sxan7r1sln','sl758m2396','xan.pher'].forEach(s=>{const d=(NEED[s]||0)-(cap[s]||0);if(d>0&&passTo[s]){NEED[passTo[s]]=(NEED[passTo[s]]||0)+d;NEED[s]-=d;moved.push([passTo[s],s,d]);}});
 {const d=(NEED[E.id]||0)-(cap[E.id]||0);if(d>0){const spare=s=>Math.max(0,(cap[s]||0)-(NEED[s]||0)),sv=['s4zvgepuru','skm4jjo2vl'],tot=sv.reduce((n,s)=>n+spare(s),0);
  sv.forEach(s=>{const k=tot>0?d*spare(s)/tot:d/2;NEED[s]=(NEED[s]||0)+k;moved.push([s,E.id,k]);});NEED[E.id]-=d;}}
 moved.forEach(([from,to,kg])=>{const Rd=R.find(r=>(r.from===from&&r.to===to)||(r.to===from&&r.from===to));if(!Rd)return;Rd.expect=Rd.expect||{};
  Rd.expect[to]=Object.assign({},Rd.expect[to]||{});Rd.expect[to].grain=(Rd.expect[to].grain||0)+kg/365;Rd._grainKg=(Rd._grainKg||0)+kg;
  if(Rd.goods&&Rd.goods[from]&&Rd.goods[from].indexOf('grain')<0)Rd.goods[from].push('grain');});
 T._moved=moved;
 T.provinces.forEach(Pv=>{const sum=bySeat[Pv.seat].reduce((n,q)=>n+Math.max(1,q._surplus),0),n=(NEED[Pv.seat]||0)*Math.max(1,Pv._surplus)/sum;
  const share=Math.max(.05,Math.min(.85,Math.min(Pv._surplus*.9,n)/Pv._made));
  Pv._sh.grain=share;Pv._share=share;
  const sp=seats[Pv.seat],km=Math.max(5,Math.hypot(sp.x-at(Pv.px[0],Pv.px[1]).x,sp.z-at(Pv.px[0],Pv.px[1]).z)/1000);
  R.push({id:'tithe.'+Pv._id,from:Pv._id,to:Pv.seat,minutes:Math.round(km/25*1440)+240,cap:200000,carriers:4,share:{[Pv._id]:Pv._sh},goods:{[Pv.seat]:['salt','tea','tools']}});});
 /* the seats send on what the capital's market exports and the court's dues need: Phēr's and Theodiga's goods come by the
    lake and the barge roads above; Kirstabal's by Qiblai */
 /* ---- THE GATEWAYS: off the map, a pool each, reached from its staging town (X1). The caravans start at the gateway, so
    the first salt lands within their first passage. Each exported good's take is split among the gateways that carry it */
 const carriedBy={};T.gateways.forEach(G=>G.out.forEach(g=>{carriedBy[g]=(carriedBy[g]||0)+1;}));
 T.gateways.forEach(G=>{add({id:G.id,name:G.name+' (off the map)',faction:'gate',people:0,x:E.x,z:E.z-1e6,eats:{},keepDays:0,start:Object.assign({},T.gatePool),
   works:[{id:G.id+'.market',kind:'bazaar',name:'the gateway\'s bazaar',crew:0,out:[],rate:0}]});
  const exp={};G.out.forEach(g=>{if(T.gateWant[g])exp[g]=T.gateWant[g]/carriedBy[g];});G._exp=exp;
  R.push({id:'trade.'+G.id,from:G.id,to:G.entry,minutes:G.days*1440,carriers:G.carriers,stagger:Math.round(G.days*1440/G.carriers),cap:G.cap,keep:20,want:Math.max(60,G.days*2),
   goods:{[G.entry]:G.out,[G.id]:G.in},expect:{[G.id]:exp,[G.entry]:{iron:30,arms:.5,pearls:.06,wine:3,oil:2}}});});
 /* the staging towns gather their gateways' goods from behind them: Strongbow from Kirstabal from Qiblai, Thalaba from Phēr
    from the capital (a road for goods beside Thalaba's tithe road, which carries nothing for want out of Thalaba) */
 const takeAt=entry=>{const e={};T.gateways.filter(G=>G.entry===entry).forEach(G=>{for(const g in G._exp)e[g]=(e[g]||0)+G._exp[g];});return e;};
 const sbTake=takeAt('sfgtxw10kr'),thTake=takeAt('lk.thalaba'),gList=o=>Object.keys(o);
 R.push({id:'road.pher-thalaba',from:'xan.pher',to:'lk.thalaba',minutes:Math.round(16/12*60)+60,cap:10000,carriers:3,want:20,
  goods:{'xan.pher':gList(thTake),'lk.thalaba':['salt','iron','arms','wine','oil']},expect:{'lk.thalaba':thTake}});
 const addGoods=(id,from,gs)=>{const Rd=R.find(r=>r.id===id);gs.forEach(g=>{if(Rd.goods[from].indexOf(g)<0)Rd.goods[from].push(g);});return Rd;};
 const addExpect=(Rd,at,o)=>{Rd.expect=Rd.expect||{};Rd.expect[at]=Object.assign({},Rd.expect[at]||{});for(const g in o)Rd.expect[at][g]=(Rd.expect[at][g]||0)+o[g];};
 addExpect(addGoods('road.ks-sb','sl758m2396',gList(sbTake)),'sfgtxw10kr',sbTake);
 addExpect(addGoods('road.qb-ks','skm4jjo2vl',gList(sbTake)),'sl758m2396',sbTake);
 addExpect(addGoods('lake.cross','s57bkv9741',gList(thTake)),'xan.pher',thTake);
 /* the salt comes in at the staging towns, so it goes inward: Strongbow to Kirstabal to Qiblai, Thalaba to Phēr to the
    capital; the capital and Qiblai no longer send it to each other */
 addGoods('road.ks-sb','sfgtxw10kr',['salt','iron','arms']);addGoods('road.qb-ks','sl758m2396',['salt','iron','arms']);
 addGoods('road.pher-thalaba','lk.thalaba',[]);addGoods('lake.cross','xan.pher',['salt','iron','arms','wine','oil']);
 ['road.ks-sb','road.qb-ks'].forEach(id=>{const Rd=R.find(r=>r.id===id),down=Rd.from;Rd.goods[down]=Rd.goods[down].filter(g=>g!=='salt');});
 {const Rd=R.find(r=>r.id==='road.er-qb');Rd.goods.s57bkv9741=Rd.goods.s57bkv9741.filter(g=>g!=='salt');}
 /* ---- THE LAKE'S MARKET BOATS (X1: multi-stop rounds) */
 T.rounds.forEach(([id,hub,keys])=>{const stops=[hub].concat(keys.map(k=>'lk.'+k)),pts=stops.map(s=>S.find(q=>q.id===s));
  let km=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];km+=Math.hypot(a.x-b.x,a.z-b.z)/1000;}
  /* SIM.trade's round lands a boat's whole load at the next stop, so the wares go round as a relay: every stop holds the
     round's use of the market's wares (half of it), not only its own, and keeps few days back (Atitlán's boats: the pots
     of one town in every town by the week's end) */
  const wares=['pottery','mats','honey','fruit','fish'],use={};wares.forEach(g=>{use[g]=pts.reduce((n,s)=>n+s.people*((s.eats||{})[g]||0),0);});
  const expect={};stops.forEach(s=>{expect[s]={};wares.forEach(g=>{if(use[g]>0)expect[s][g]=use[g]*.5;});});
  R.push({id,stops,minutes:Math.round(km/pts.length/12*60)+30,cap:6000,carriers:3,stagger:120,want:8,keep:3,goods:null,expect});});
 /* ---- THE CHAIN OF SUPPLY: who feeds whom (the capital the root). X0's roads are two-stop, and a town's want is its own
    use: a seat that passes salt, tea and tools on to its villages wants more than it eats, so the road into it expects
    its whole subtree's use a day (X1's multi-stop roads take this over) */
 const up={'xan.citadel':'s57bkv9741','xan.dome':'s57bkv9741','xan.pher':'s57bkv9741','s4zvgepuru':'s57bkv9741','skm4jjo2vl':'s57bkv9741',
  'sl758m2396':'skm4jjo2vl','sfgtxw10kr':'sl758m2396','sxan7r1sln':'skm4jjo2vl','smgxtultfq':'sxan7r1sln','sjuarjbku0':'sxan7r1sln'};
 S.forEach(s=>{if(up[s.id]||s.id==='s57bkv9741'||s.faction==='gate')return;up[s.id]=s.parent;});
 const day={};S.forEach(s=>{if(s.faction==='gate')return;const d={};['salt','tea','tools'].forEach(g=>{d[g]=s.people*((s.eats||{})[g]||0);});day[s.id]=d;});
 const sub={};const subOf=id=>{if(sub[id])return sub[id];const t=Object.assign({},day[id]);S.forEach(c=>{if(up[c.id]===id){const k=subOf(c.id);for(const g in k)t[g]=(t[g]||0)+k[g];}});return sub[id]=t;};
 S.forEach(c=>{const p=up[c.id];if(!p)return;if(!S.some(k=>up[k.id]===c.id))return;   /* only the seats that feed others */
  const Rd=R.find(r=>(r.from===p&&r.to===c.id)||(r.to===p&&r.from===c.id));if(!Rd)return;
  Rd.expect=Rd.expect||{};Rd.expect[c.id]=Object.assign({},Rd.expect[c.id]||{},subOf(c.id));});
 /* the capital's market gathers the country's exports: the roads into it expect the gateways' take (a floor; the seats keep
    their own days first) */
 ['road.er-qb','road.er-th','lake.cross'].forEach(id=>{const Rd=R.find(r=>r.id===id),from=Rd.from==='s57bkv9741'?Rd.to:Rd.from,list=Rd.goods[from]||[],e={};
  list.forEach(g=>{if(T.gateWant[g])e[g]=T.gateWant[g];});Rd.expect=Rd.expect||{};Rd.expect.s57bkv9741=Object.assign({},Rd.expect.s57bkv9741||{},e);});
 /* the salt (X1): the Catch's for the south (Qiblai's subtree), Thalaba's and Dalab's for the north (the rest). Each
    gateway expects its side's share at its staging town; each road inward expects what lies beyond it */
 const all=subOf('s57bkv9741').salt,south=subOf('skm4jjo2vl').salt,north=all-south,sb=subOf('sfgtxw10kr').salt,ks=subOf('sl758m2396').salt;
 const salters=side=>T.gateways.filter(G=>G.side===side&&G.in.indexOf('salt')>=0);
 salters('south').forEach(G=>{R.find(r=>r.id==='trade.'+G.id).expect[G.entry].salt=south/salters('south').length;});
 {const nth=salters('north'),w={'gate.yuni':.6,'gate.dalab':.4};nth.forEach(G=>{R.find(r=>r.id==='trade.'+G.id).expect[G.entry].salt=north*(w[G.id]||1/nth.length);});}
 addExpect(R.find(r=>r.id==='road.ks-sb'),'sl758m2396',{salt:south-sb});
 addExpect(R.find(r=>r.id==='road.qb-ks'),'skm4jjo2vl',{salt:south-ks});
 addExpect(R.find(r=>r.id==='road.pher-thalaba'),'xan.pher',{salt:north*.6-subOf('lk.thalaba').salt});
 addExpect(R.find(r=>r.id==='lake.cross'),'s57bkv9741',{salt:Math.max(0,north*.6-subOf('xan.pher').salt-subOf('lk.thalaba').salt)});
 {const Rd=R.find(r=>r.id==='lake.cross');Rd.goods.s57bkv9741=Rd.goods.s57bkv9741.filter(g=>g!=='salt');delete Rd.expect['xan.pher'].salt;}
 /* the iron and arms the gateways bring, inward to the smiths and the forts (a batch that waits on its input shows no want) */
 addExpect(R.find(r=>r.id==='road.ks-sb'),'sl758m2396',{iron:20,arms:.2});addExpect(R.find(r=>r.id==='road.qb-ks'),'skm4jjo2vl',{iron:20,arms:.2});
 addExpect(R.find(r=>r.id==='road.pher-thalaba'),'xan.pher',{iron:30,arms:.4});addExpect(R.find(r=>r.id==='lake.cross'),'s57bkv9741',{iron:30,arms:.4});
 /* the north shore's pots and mats come over from the south (Pāṭari, Lōṭas) by the capital: Phēr holds its towns' use */
 {const nPeople=S.filter(s=>s.parent==='xan.pher'&&/^lk\./.test(s.id)).reduce((n,s)=>n+s.people,0)+6000;
  addExpect(R.find(r=>r.id==='lake.cross'),'xan.pher',{pottery:nPeople*T.diet.lake.pottery,mats:nPeople*T.diet.lake.mats});}
 T._salt={all,south,north};
 /* ---- THE DUES AND THE GRANTS */
 const tr=[];Object.keys(T.dues.bills).forEach(s=>tr.push({id:'dues.'+s,from:s,to:'xan.citadel',goods:T.dues.bills[s],first:T.dues.day,every:365}));
 tr.push({id:'fealty.qiblai',from:T.dues.fealty.from,to:'xan.citadel',goods:T.dues.fealty.goods,first:T.dues.fealty.day,every:365});
 tr.push({id:'esteem.qiblai',from:'xan.citadel',to:T.dues.esteem.to,goods:T.dues.esteem.goods,first:T.dues.esteem.day,every:365});
 const V={seed:20261116,scale:K,start:0,calendar:T.calendar,goods:T.goods,
  factions:[{id:'xanadu',name:'The Sultanate of Xanadu'},{id:'gate',name:'The gateways (Iziz, Yuni, the Dasri, Dalab)'}],
  relations:[{a:'xanadu',b:'gate',stance:'friendly'},{a:'gate',b:'xanadu',stance:'friendly'}],
  settlements:S,roads:R,transfers:tr,_lake:X,_need:need};
 return V;};
return T;})();
if(typeof module!=='undefined')module.exports=XAN_TUNE;
