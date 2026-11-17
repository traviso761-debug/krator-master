// ================================================================= BLAKHED — the West Rift market town's economy and Great Caravan join (B5)
// [G data] settlements/blakhed/PLAN.md sections 0, 3.2a, 3.4-3.6 and 6 (step B5); core/region/WEST-RIFT-SCOPE.md sections 3-6
// (steps W1, W3, W4). Plain data and pure functions for core/region's valley host (core/region/50-region-valley.js, H.simValley):
//   WR_BLAKHED.px(px, py)     metres from px 1191,1569 (2 km a pixel): XAN_TUNE's frame, so join() shares one map
//   WR_BLAKHED.goods          every good of the rim's market and its roads
//   WR_BLAKHED.diet           a person's day by kind (fell, dalab, xanadu; PLAN.md 3.4: ~235 kg grain-eq a year)
//   WR_BLAKHED.calendar       the 3,653 m Dsb year on core/clock (year days): harvest, shielings, winter ice, thaw, fowling, salt, Fair
//   WR_BLAKHED.hamlets        the twelve Fellgang hamlets of PLAN.md 3.2a (same ids, places and foci as src/69bo-bk-ring.js)
//   WR_BLAKHED.valley(o)      Blakhed (town + four steadings, 4,850 at scale 50), the Stairhead (150), Dalab's toll post (25),
//                             the Golden Tears' mission (150), the twelve hamlets (~1,800), and the four partner stops on its
//                             roads: Nulab's basin (up the gorge stair, with Dalab's tenth cut in ice, eggs and rope at the
//                             toll post), the drovers (salt from the western fells' high basins, hides, wool, meat), the
//                             Ice-cutters (winter lake ice, shut in the thaw) and the Fowlers (cliff eggs, wall honey, herbs)
//   WR_BLAKHED.join(XV, o)    step W3: joins Blakhed's district into XAN_TUNE.valley (or EAST_RIFT.valley) without changing
//                             xan-tune.js, replacing `gate.dalab.blakhed` and `gate.dalab.nulab` on the Annual Great Caravan
//                             with `wr.blakhed` and `wr.nulab`; Dalab's factors move Xanadu's exports down the gorge stair
var WR_BLAKHED=(function(){'use strict';
const T={},D=1/365,D0=(x,d)=>x==null?d:x;
T.px=(px,py)=>({x:(px-1191)*2000,z:(py-1569)*2000});
T.yearDay0=259;

T.goods={
 grain:{unit:'kg',crops:['frostoat','redstem-buckwheat','helix-bean']},
 potato:{unit:'kg',crops:['snow-potato','frostroot']},
 dairy:{unit:'kg'},meat:{unit:'kg'},eggs:{unit:'kg'},honey:{unit:'kg'},salt:{unit:'kg'},
 ice:{unit:'kg'},rope:{unit:'kg'},wool:{unit:'kg'},hides:{unit:'kg'},felt:{unit:'kg'},herbs:{unit:'kg'},
 slate:{unit:'kg'},timber:{unit:'kg'},cloth:{unit:'kg'},iron:{unit:'kg'},tools:{unit:'kg'},tea:{unit:'kg'}};

/* PLAN.md 3.4: ~235 kg grain-equivalent a head a year on the fell; 7.5 kg of salt (WEST-RIFT-SCOPE 4.4) */
T.diet={
 fell:{grain:115*D,potato:45*D,dairy:40*D,meat:22*D,eggs:5*D,honey:1.5*D,salt:7.5*D,tools:.4*D},
 town:{grain:115*D,potato:45*D,dairy:40*D,meat:22*D,eggs:5*D,honey:1.5*D,salt:7.5*D,timber:8*D,cloth:1.2*D,tools:.4*D},
 stair:{grain:120*D,potato:45*D,dairy:35*D,meat:24*D,salt:7.5*D,rope:8*D,tools:.5*D},
 dalab:{grain:175*D,meat:20*D,salt:7.5*D,cloth:.6*D,tools:.4*D},
 nulab:{grain:175*D,meat:20*D,salt:7.5*D,cloth:.6*D,tools:.4*D,ice:85*D,rope:4.5*D,eggs:1.5*D,honey:.5*D,felt:.8*D},
 xanadu:{grain:165*D,dairy:20*D,meat:18*D,salt:6*D,tea:2*D,tools:.4*D}};

/* year days on core/clock (day 0 = year day 259, early autumn right after the fell harvest and shielings come down) */
T.calendar={windows:{
 'bk.harvest':[185,235],
 'bk.shielings':[120,235],
 'bk.winter':[315,75],
 'bk.thaw':[85,305],
 'bk.fowling':[90,220],
 'bk.salt':[110,240],
 'bk.fair':[255,265]}};

/* the twelve hamlets of PLAN.md 3.2a, matching src/69bo-bk-ring.js HAMLETS */
T.hamlets=[
 ['bk.h.highgarth','Highgarth',439,1392,'farming',150],
 ['bk.h.beckfoot','Beckfoot',443,1393,'farming',150],
 ['bk.h.pondhead','Pondhead',451,1397,'ice',150],
 ['bk.h.fallsfield','Fallsfield',450,1398,'farming',150],
 ['bk.h.cragfold','Cragfold',449,1404,'ranch',150],
 ['bk.h.hayfell','Hayfell',445,1411,'ranch',150],
 ['bk.h.slatebank','Slatebank',443,1409,'quarry',150],
 ['bk.h.highbyre','Highbyre',438,1406,'ranch',150],
 ['bk.h.peatmoss','Peatmoss',434,1403,'farming',150],
 ['bk.h.coldwater','Coldwater',430,1398,'ice',150],
 ['bk.h.drovers-rest','Drovers\' Rest',432,1392,'ranch',150],
 ['bk.h.tarnside','Tarnside',434,1391,'farming',150]];

T.toll={share:.1,goods:['ice','eggs','rope']};   /* PLAN.md 3.6: Dalab's tenth in kind of what goes down the stair */
T.tearsCut=.02;                                  /* the Golden Tears' western house at Blakhed on the Great Caravan's landing */

T.factions=[
 {id:'fellgang',name:'The Fellgangs of the Rift Rim (Blakhed\'s market peace, the hamlets, the drovers, Fowlers and Ice-cutters)'},
 {id:'dalab',name:'The Realm of Dalab (Nulab\'s basin and the Stairhead toll post)'},
 {id:'tears',name:'The Golden Tears (the Xanadu merchant house escorting the Annual Great Caravan)'},
 {id:'xanadu',name:'The Sultanate of Xanadu'}];

T.valley=function(o){o=o||{};
 const K=D0(o.townScale,50),Kv=D0(o.villageScale,10),yr=365,startDays=D0(o.startDays,355);
 const win=w=>{const W=T.calendar.windows[w];return(W[1]-W[0]+yr)%yr;};
 const rate=(kgYr,crew,sc,days)=>kgYr/(Math.max(1,Math.round(crew/sc))*sc*D0(days,yr)*12);
 const eats=k=>Object.assign({},T.diet[k]);
 const stockFor=(diet,n,days,extra)=>{const s={};for(const g in diet)s[g]=Math.ceil(n*diet[g]*days);return Object.assign(s,extra||{});};
 const S=[],R=[],at=(px,py)=>T.px(px,py);

 /* 1. BLAKHED (4,250 in town + 600 on the four steadings = 4,850, scale 50; the Stairhead's 150 makes 5,000) */
 {const p=at(441,1400),n=4850;
  S.push({id:'wr.blakhed',name:'Blakhed (the rim\'s market town at the Blak Riba head, with its four river steadings)',
   faction:'fellgang',people:n,x:p.x,z:p.z,scale:K,eats:eats('town'),keepDays:20,
   start:Object.assign(stockFor(T.diet.town,n,75),{grain:Math.ceil(n*T.diet.town.grain*165),potato:Math.ceil(n*T.diet.town.potato*startDays),
    dairy:Math.ceil(n*T.diet.town.dairy*120),meat:Math.ceil(n*T.diet.town.meat*120),ice:320000,rope:25000,wool:10000,iron:3000,tea:1200,felt:4000,tools:2500}),
   works:[
    {id:'bk.market',kind:'market',name:'the Market and the Icegarth\'s stores',crew:250,out:[],rate:0},
    {id:'bk.grain',kind:'fields',name:'the irrigated in-field (frostoat and buckwheat)',crew:700,out:['grain'],rate:rate(260000,700,K,win('bk.harvest')),season:'bk.harvest'},
    {id:'bk.potato',kind:'fields',name:'the snow-potato and frostroot garths',crew:350,out:['potato'],rate:rate(290000,350,K,win('bk.harvest')),season:'bk.harvest'},
    {id:'bk.herds',kind:'byre',name:'the town\'s herds and summer shielings',crew:400,
     herd:{out:['dairy'],rate:230000/(Math.max(1,Math.round(1500/K))*K*yr*24),animals:1500,seasonRate:{summer:1.25,winter:.75}},
     pasture:{id:'bk.shielings',window:'bk.shielings'}},
    {id:'bk.folds',kind:'folds',name:'the Folds (meat, wool and hides)',crew:200,out:['meat'],rate:rate(115000,200,K)},
    {id:'bk.fleece',kind:'shearing',name:'the shearing pens',crew:100,out:['wool'],rate:rate(18000,100,K)},
    {id:'bk.ponds',kind:'icecut',name:'the Icegarth\'s six winter ice ponds',crew:300,out:['ice'],rate:rate(1200000,300,K,win('bk.winter')),season:'bk.winter'},
    {id:'bk.ropewalk',kind:'ropewalk',name:'the 240 m rope walk (lobe-larch cord and Ancient cable)',crew:200,out:['rope'],rate:rate(90000,200,K)},
    {id:'bk.felters',kind:'felt-house',name:'the felters and tanners',crew:50,batch:{in:{wool:1.2},out:{felt:1},hours:18}},
    {id:'bk.smiths',kind:'salvage-smith',name:'the settled Traveller salvage-smiths',crew:50,batch:{in:{iron:1},out:{tools:1},hours:40}}]});}

 /* 2. THE STAIRHEAD (150 Stairmen at the falls' lip, part of the 5,000) and DALAB'S TOLL POST (25, faction dalab) */
 {const ps=at(449,1393),pt=at(449.2,1392.8);
  S.push({id:'wr.stairhead',name:'The Stairhead (the Stairmen\'s ward and gin-wheel hoists at the falls\' lip)',
   faction:'fellgang',parent:'wr.blakhed',people:150,x:ps.x,z:ps.z,scale:Kv,eats:eats('stair'),keepDays:25,
   start:stockFor(T.diet.stair,150,120),
   works:[{id:'sh.hoists',kind:'stair-hoist',name:'the gin wheels and rope stores',crew:80,out:[],rate:0}]});
  R.push({id:'wr.road.stairhead',from:'wr.blakhed',to:'wr.stairhead',minutes:Math.round(24/25*1440),cap:12000,carriers:2,stagger:720,want:35,
   goods:{'wr.blakhed':['grain','potato','dairy','meat','eggs','honey','salt','rope','tools'],'wr.stairhead':[]}});

  S.push({id:'dalab.blakhed',name:'Dalab\'s toll post at the Stairhead (a tenth of what goes down the stair)',
   faction:'dalab',parent:'wr.nulab',people:25,x:pt.x,z:pt.z,scale:Kv,eats:eats('dalab'),keepDays:30,
   start:stockFor(T.diet.dalab,25,140),
   works:[{id:'db.tollhouse',kind:'toll-house',name:'the toll store and genepriest\'s ice check',crew:20,out:[],rate:0}]});}

 /* 3. THE GOLDEN TEARS' MISSION (150, faction tears, walled compound 1 km SE of the Market) */
 {const p=at(441.56,1400.18);
  S.push({id:'tears.blakhed',name:'The Golden Tears\' mission at Blakhed (the Great Caravan escort\'s western compound)',
   faction:'tears',parent:'wr.blakhed',people:150,x:p.x,z:p.z,scale:Kv,eats:eats('xanadu'),keepDays:15,
   start:stockFor(T.diet.xanadu,150,140),
   works:[{id:'tb.compound',kind:'counting-house',name:'the factor\'s counting house and caravanserai',crew:40,out:[],rate:0}]});
  R.push({id:'tears.supply.blakhed',from:'wr.blakhed',to:'tears.blakhed',minutes:60,cap:10000,carriers:2,want:30,keep:10,
   goods:{'wr.blakhed':['grain','dairy','meat','salt','tea','tools'],'tears.blakhed':[]}});
  R.push({id:'tears.sell.blakhed',from:'tears.blakhed',to:'wr.blakhed',minutes:60,cap:20000,carriers:1,want:20,keep:10,
   goods:{'tears.blakhed':['cacao','cacaocake','saffron','opium','tea','brocade','silk','sulfur','wax','rarities','hearthseed'],'wr.blakhed':[]}});}

 /* 4. THE TWELVE FELLGANG HAMLETS (PLAN.md 3.2a: ~1,800 people round the bench) */
 T.hamlets.forEach(([id,name,px,py,focus,pop])=>{const p=at(px,py),bp=at(441,1400),km=Math.hypot(p.x-bp.x,p.z-bp.z)/1000*1.2,
   mins=Math.max(240,Math.round(km/25*1440)),works=[{id:id+'.store',kind:'store',name:'the hamlet\'s store',crew:10,out:[],rate:0}];
  let sh={},back=['salt','tools','rope'];
  if(focus==='farming'){
   const gYr=46000,pYr=22000,gOwn=pop*T.diet.fell.grain*yr,pOwn=pop*T.diet.fell.potato*yr;
   works.push({id:id+'.grain',kind:'farmstead',name:'the bench fields',crew:50,out:['grain'],rate:rate(gYr,50,Kv,win('bk.harvest')),season:'bk.harvest'},
    {id:id+'.potato',kind:'farmstead',name:'the potato garths',crew:20,out:['potato'],rate:rate(pYr,20,Kv,win('bk.harvest')),season:'bk.harvest'});
   sh={grain:Math.min(.62,(gYr-gOwn)*.9/gYr),potato:Math.min(.62,(pYr-pOwn)*.9/pYr)};
   back=['dairy','meat','eggs','honey','salt','tools','rope'];
  }else if(focus==='ranch'){
   works.push({id:id+'.byre',kind:'byre',name:'the herds and summer fell',crew:45,
     herd:{out:['dairy'],rate:26000/(Math.max(1,Math.round(180/Kv))*Kv*yr*24),animals:180,seasonRate:{summer:1.3,winter:.7}},
     pasture:{id:id+'.pasture',window:'bk.shielings'}},
    {id:id+'.meat',kind:'folds',name:'the folds',crew:20,out:['meat'],rate:rate(14000,20,Kv)},
    {id:id+'.wool',kind:'shearing',name:'the shearing',crew:10,out:['wool'],rate:rate(3500,10,Kv)});
   sh={dairy:.68,meat:.65,wool:.85};
   back=['grain','potato','eggs','honey','salt','tools','rope'];
  }else if(focus==='ice'){
   works.push({id:id+'.ponds',kind:'icecut',name:'the winter ice ponds',crew:65,out:['ice'],rate:rate(180000,65,Kv,win('bk.winter')),season:'bk.winter'});
   sh={ice:.92};
   back=['grain','potato','dairy','meat','eggs','honey','salt','tools','rope'];
  }else{
   works.push({id:id+'.quarry',kind:'quarry',name:'the roof-slate and drystone bank',crew:65,out:['slate'],rate:rate(120000,65,Kv)});
   sh={slate:.9};
   back=['grain','potato','dairy','meat','eggs','honey','salt','tools','rope'];
  }
  S.push({id,name:name+' (Fellgang '+focus+' hamlet)',faction:'fellgang',parent:'wr.blakhed',people:pop,x:p.x,z:p.z,scale:Kv,
   eats:eats('fell'),keepDays:20,start:stockFor(T.diet.fell,pop,focus==='farming'?startDays:120),works});
  R.push({id:'wr.hamlet.'+id.split('.').pop(),from:id,to:'wr.blakhed',minutes:mins,cap:16000,carriers:2,stagger:Math.round(mins/2),
   want:35,share:{[id]:sh},goods:{'wr.blakhed':back}});});

 /* 5. THE FOUR WEST RIFT PARTNER STOPS ON BLAKHED'S ROADS (PLAN.md sections 4 and 6) */
 /* 5a. NULAB & THE GREAT LAKE BASIN (98 km down the gorge stair: supplies ~350 t/yr of basin grain, timber, cloth, iron;
        buys ~850 t/yr of ice, rope, eggs, honey, felt; Dalab's tenth cut in kind at the Stairhead lands in dalab.blakhed) */
 {const p=at(443,1359),stairMin=Math.round(4.5*1440);
  S.push({id:'wr.nulab',name:'Nulab and the great lake basin (Dalab\'s breadbasket at the stair\'s foot)',
   faction:'dalab',people:10000,x:p.x,z:p.z,scale:50,eats:eats('nulab'),keepDays:20,
   start:Object.assign(stockFor(T.diet.nulab,10000,70),{grain:2600000,meat:250000,salt:90000,timber:250000,cloth:60000,iron:90000,tea:25000,tools:8000}),
   works:[
    {id:'nu.market',kind:'market',name:'Nulab\'s lake market and gene-store cellars',crew:300,out:[],rate:0},
    {id:'nu.basin',kind:'farmstead',name:'the basin\'s helix-bean and rice farms',crew:3200,out:['grain'],rate:rate(2600000,3200,50,win('bk.shielings')),season:'bk.shielings'},
    {id:'nu.herds',kind:'folds',name:'the shore stock and fisheries',crew:600,out:['meat'],rate:rate(240000,600,50)},
    {id:'nu.woods',kind:'lumber',name:'the lower slope\'s bell-fir timber',crew:300,out:['timber'],rate:rate(140000,300,50)},
    {id:'nu.looms',kind:'weaver',name:'lotus-silk and sea-linen looms',crew:250,out:['cloth'],rate:rate(25000,250,50)},
    {id:'nu.skarn',kind:'smelter',name:'bar and plate from the Nulab and skarn ores',crew:250,out:['iron'],rate:rate(45000,250,50)},
    {id:'nu.tea',kind:'tea-garden',name:'the shore\'s mist tea',crew:150,out:['tea'],rate:rate(12000,150,50)}]});
  R.push({id:'wr.road.stair',from:'wr.blakhed',to:'wr.nulab',minutes:stairMin,cap:55000,carriers:10,stagger:Math.round(stairMin/5),
   keep:15,want:50,
   goods:{'wr.blakhed':['ice','rope','eggs','honey','felt','salt'],'wr.nulab':['grain','timber','cloth','iron','tea']},
   expect:{'wr.nulab':{ice:2400,rope:130,eggs:42,honey:14,felt:22,salt:210},'wr.blakhed':{grain:1100,iron:20,timber:110,cloth:18,tea:8}},
   cut:[{at:'wr.nulab',to:'dalab.blakhed',share:T.toll.share,goods:T.toll.goods,why:'Dalab\'s tenth in kind at the Stairhead toll post'}]});
  R.push({id:'wr.road.toll-supply',from:'wr.nulab',to:'dalab.blakhed',minutes:stairMin,cap:6000,carriers:1,want:45,
   goods:{'wr.nulab':['grain','meat','salt','cloth','tools'],'dalab.blakhed':[]}});}

 /* 5b. THE DROVERS (165 km WNW: the owner, 2026-11-16, "We'll have the drovers be a major salt source", from the western fells'
        high salt basins; also meat, hides, wool and felt to Blakhed's market) */
 {const p=at(393,1338),mins=Math.round(7*1440);
  S.push({id:'wr.drovers',name:'The western Fellgang drovers and the high salt basins',
   faction:'fellgang',people:300,x:p.x,z:p.z,scale:Kv,eats:eats('fell'),keepDays:20,
   start:Object.assign(stockFor(T.diet.fell,300,160),{potato:Math.ceil(300*T.diet.fell.potato*startDays),salt:110000,meat:20000,wool:8000,hides:6000}),
   works:[
    {id:'dr.folds',kind:'market',name:'the drovers\' winter folds',crew:30,out:[],rate:0},
    {id:'dr.salt',kind:'salt-pans',name:'the high salt basins (327-355,1335-1359)',crew:110,out:['salt'],rate:rate(200000,110,Kv,win('bk.salt')),season:'bk.salt'},
    {id:'dr.herds',kind:'byre',name:'the western herds',crew:70,
     herd:{out:['dairy'],rate:18000/(Math.max(1,Math.round(220/Kv))*Kv*yr*24),animals:220},
     pasture:{id:'dr.shielings',window:'bk.shielings'}},
    {id:'dr.meat',kind:'folds',name:'drove stock',crew:40,out:['meat'],rate:rate(38000,40,Kv)},
    {id:'dr.hides',kind:'tannery',name:'hides and wool',crew:30,out:['hides','wool'],rate:rate(12000,30,Kv)},
    {id:'dr.potato',kind:'farmstead',name:'sheltered potato garths',crew:20,out:['potato'],rate:rate(16000,20,Kv,win('bk.harvest')),season:'bk.harvest'}]});
  R.push({id:'wr.road.drove',from:'wr.drovers',to:'wr.blakhed',minutes:mins,cap:32000,carriers:5,stagger:Math.round(mins/3),
   keep:15,want:55,
   goods:{'wr.drovers':['salt','meat','hides','wool'],'wr.blakhed':['grain','potato','eggs','honey','rope','tools']},
   expect:{'wr.blakhed':{salt:380,hides:20,wool:20}}});}

 /* 5c. THE ICE-CUTTERS (298 km S over the fells: clear lake ice sledged on snow in winter; closed during the thaw) */
 {const p=at(470,1521),mins=Math.round(12*1440);
  S.push({id:'wr.icecutters',name:'The Ice-cutters on the frozen south-rim lake',
   faction:'fellgang',people:150,x:p.x,z:p.z,scale:Kv,eats:eats('fell'),keepDays:25,
   start:stockFor(T.diet.fell,150,270,{ice:120000}),
   works:[
    {id:'ic.store',kind:'icehouse',name:'the lake-ice barrows',crew:20,out:[],rate:0},
    {id:'ic.cut',kind:'icecut',name:'the eight-week winter lake cut',crew:80,out:['ice'],rate:rate(280000,80,Kv,win('bk.winter')),season:'bk.winter'},
    {id:'ic.herds',kind:'byre',name:'the lake herds',crew:30,
     herd:{out:['dairy'],rate:9000/(Math.max(1,Math.round(90/Kv))*Kv*yr*24),animals:90}},
    {id:'ic.meat',kind:'folds',name:'winter meat',crew:20,out:['meat'],rate:rate(6000,20,Kv)}]});
  R.push({id:'wr.road.ice',from:'wr.icecutters',to:'wr.blakhed',minutes:mins,cap:36000,carriers:4,stagger:Math.round(mins/4),
   want:265,share:{'wr.icecutters':{ice:.85}},
   goods:{'wr.blakhed':['grain','potato','eggs','honey','salt','cloth','rope','tools']},
   closed:o.openIceRoad?undefined:[{legs:[0,1],window:'bk.thaw'}]});}

 /* 5d. THE FOWLERS (310 km across the Rift's head: cliff-flyer eggs in ash, wall honey and herbs for grain, salt and rope) */
 {const p=at(571,1397),mins=Math.round(14*1440);
  S.push({id:'wr.fowlers',name:'The Fowlers on the north rim\'s cliffs',
   faction:'fellgang',people:150,x:p.x,z:p.z,scale:Kv,eats:eats('fell'),keepDays:20,
   start:stockFor(T.diet.fell,150,220,{eggs:32000,honey:10000,herbs:2500}),
   works:[
    {id:'fw.eggstore',kind:'eggstore',name:'the cool round egg and honey store',crew:20,out:[],rate:0},
    {id:'fw.cliffs',kind:'fowling',name:'the cliff ropes (eggs in ash)',crew:70,out:['eggs'],rate:rate(65000,70,Kv,win('bk.fowling')),season:'bk.fowling'},
    {id:'fw.hives',kind:'fowling',name:'the wall-bee ledges (honey and herbs)',crew:35,out:['honey','herbs'],rate:rate(18000,35,Kv,win('bk.fowling')),season:'bk.fowling'},
    {id:'fw.herds',kind:'byre',name:'the cliff-top goats',crew:25,
     herd:{out:['dairy'],rate:8000/(Math.max(1,Math.round(80/Kv))*Kv*yr*24),animals:80}},
    {id:'fw.meat',kind:'folds',name:'fowler meat',crew:15,out:['meat'],rate:rate(5000,15,Kv)}]});
  R.push({id:'wr.road.north',from:'wr.fowlers',to:'wr.blakhed',minutes:mins,cap:24000,carriers:5,stagger:Math.round(mins/3),
   keep:15,want:80,
   goods:{'wr.fowlers':['eggs','honey','herbs'],'wr.blakhed':['grain','potato','salt','rope','tools']},
   expect:{'wr.blakhed':{eggs:135,honey:36,herbs:8}}});}

 const F=T.factions.map(f=>f.id);
 return{seed:441400,scale:Kv,start:0,calendar:T.calendar,goods:T.goods,factions:T.factions,
  relations:[].concat(...F.map(a=>F.filter(b=>b!==a).map(b=>({a,b,stance:'friendly'})))),
  settlements:S,roads:R,transfers:[]};};

/* ---- STEP W3: JOIN THE EAST RIFT. Replaces XAN_TUNE's off-map stand-ins `gate.dalab.blakhed` and `gate.dalab.nulab` on
   `caravan.great` with `wr.blakhed` and `wr.nulab`, leaving `gate.dalab.shelf` (Dalab's northern pool) and `xan-tune.js`
   unchanged. Blakhed is a transit market (PLAN.md question 9): Dalab's factors forward Xanadu's exports down the gorge stair
   to Nulab, and the Golden Tears' compound takes its factor cut where the caravan lands. */
T.join=function(XV,o){o=Object.assign({villageScale:25},o||{});
 const W=T.valley(o),V=Object.assign({},XV);
 const gone=['gate.dalab.blakhed','gate.dalab.nulab'];
 V.settlements=XV.settlements.filter(s=>gone.indexOf(s.id)<0).concat(W.settlements);
 V.goods=Object.assign({},W.goods,XV.goods);
 V.factions=XV.factions.concat(W.factions.filter(f=>!XV.factions.some(g=>g.id===f.id)));
 const rel=XV.relations.slice(),has=(a,b)=>rel.some(r=>r.a===a&&r.b===b);
 W.relations.forEach(r=>{if(!has(r.a,r.b))rel.push(r);});
 V.factions.forEach(f=>V.factions.forEach(g=>{if(f.id!==g.id&&!has(f.id,g.id))rel.push({a:f.id,b:g.id,stance:'friendly'});}));
 V.relations=rel;
 V.calendar=Object.assign({},XV.calendar,{windows:Object.assign({},(XV.calendar||{}).windows||{},W.calendar.windows)});
 const swap=id=>id==='gate.dalab.blakhed'?'wr.blakhed':id==='gate.dalab.nulab'?'wr.nulab':id;
 const wRoads=W.roads.map(r=>JSON.parse(JSON.stringify(r)));
 let xOut=[],xExp={};
 V.roads=XV.roads.map(r=>{
  if(r.id!=='caravan.great')return r;
  const c=JSON.parse(JSON.stringify(r));
  xExp=Object.assign({},(c.expect||{})['gate.dalab.blakhed']||{});
  xOut=Object.keys(xExp);
  c.stops=c.stops.map(swap);
  const g={},ex={};
  Object.keys(c.goods||{}).forEach(k=>{g[swap(k)]=c.goods[k];});
  Object.keys(c.expect||{}).forEach(k=>{ex[swap(k)]=c.expect[k];});
  c.goods=g;c.expect=ex;
  c.cut=(c.cut||[]).concat([{at:'wr.blakhed',to:'tears.blakhed',share:T.tearsCut,goods:xOut,why:'the Golden Tears\' western house at Blakhed'}]);
  return c;}).concat(wRoads);
 /* Dalab's factors at Blakhed buy the Great Caravan's goods and send them down the stair to Nulab */
 const st=V.roads.find(r=>r.id==='wr.road.stair');
 if(st&&xOut.length){
  xOut.forEach(g=>{if(st.goods['wr.blakhed'].indexOf(g)<0)st.goods['wr.blakhed'].push(g);});
  st.expect['wr.nulab']=Object.assign({},st.expect['wr.nulab']||{},xExp);}
 V.transfers=(XV.transfers||[]).concat(W.transfers||[]);
 return V;};

return T;})();
if(typeof module!=='undefined')module.exports=WR_BLAKHED;
